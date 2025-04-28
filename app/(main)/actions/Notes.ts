"use server";

import { sendEmailToMyself, sendEmailToSubscribers } from "@/lib/emails";
import prisma from "@/lib/prisma";

export const sendEmailToMyselfAction = async (
  htmlContent: string,
  subject: string
) => {
  const emailSend = await sendEmailToMyself(htmlContent, subject);

  if (emailSend) {
    return { success: "Email sent successfully" };
  } else {
    return { error: "Error sending email" };
  }
};

export const sendEmailToSubscribersAction = async (
  htmlContent: string,
  subject: string,
  options?: { batchSize?: number; maxRetries?: number }
) => {
  const BATCH_SIZE = options?.batchSize || 2; // Configurable
  const MAX_RETRIES = options?.maxRetries || 3;

  try {
    // Validate inputs
    if (!htmlContent || !subject) {
      throw new Error("htmlContent and subject are required");
    }

    // Fetch subscribers in pages to avoid memory issues
    let skip = 0;
    const take = 1000;
    const failedEmails: string[] = [];

    while (true) {
      const subscribers = await prisma.subscribers.findMany({
        where: { status: 1 },
        select: { email: true },
        skip,
        take,
      });

      if (subscribers.length === 0) break;

      // Process in batches
      for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const batch = subscribers.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map((subscriber) =>
            retry(
              () =>
                sendEmailToSubscribers(htmlContent, subject, subscriber.email),
              MAX_RETRIES
            ).catch(() => failedEmails.push(subscriber.email))
          )
        );

        // Rate limiting
        if (i + BATCH_SIZE < subscribers.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      skip += take;
    }

    // Log the email campaign
    await prisma.notes.create({ data: { content: htmlContent, subject } });

    return {
      success: failedEmails.length === 0,
      failedEmails, // Report failures
    };
  } catch (error) {
    console.error("Error in sendEmailToSubscribersAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
};

// Helper: Retry with exponential backoff
async function retry<T>(fn: () => Promise<T>, maxRetries: number): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
      attempt++;
    }
  }
  throw new Error("Max retries exceeded");
}

export const fetchAllNotes = async () => {
  try {
    const notes = await prisma.notes.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return notes;
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
};
