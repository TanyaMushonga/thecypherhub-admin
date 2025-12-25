"use server";

import { sendEmailToSubscribers } from "@/lib/emails";
import prisma from "@/lib/prisma";

export const sendArticleGlimpseAction = async (
  articleTitle: string,
  articleSlug: string,
  articleDescription: string,
  options?: { batchSize?: number; maxRetries?: number }
) => {
  const BATCH_SIZE = options?.batchSize || 20;
  const MAX_RETRIES = options?.maxRetries || 3;

  try {
    const htmlContent = `
      <h1>${articleTitle}</h1>
      <p>${articleDescription}</p>
      <a href="https://www.thecypherhub.tech/blog/${articleSlug}">Read more...</a>
    `;
    const subject = `New Article: ${articleTitle}`;

    // Fetch all active subscribers
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

        // Rate limiting: 1 second pause between batches to respect email provider limits
        if (i + BATCH_SIZE < subscribers.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      skip += take;
    }

    return {
      success: failedEmails.length === 0,
      failedEmails,
    };
  } catch (error) {
    console.error("Error in sendArticleGlimpseAction:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
};

// Valid helper to retry async operations
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
