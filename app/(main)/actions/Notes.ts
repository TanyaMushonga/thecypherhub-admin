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
  subject: string
) => {
  try {
    const subscribers = await prisma.subscribers.findMany({
      where: { status: 1 },
      select: { email: true }, // Fetch only the necessary field
    });

    if (subscribers.length === 0) {
      return { error: "No active subscribers found" };
    }

    const batchSize = 2; // Resend allows 2 emails per second
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      await Promise.all(
        batch.map((subscriber) =>
          sendEmailToSubscribers(htmlContent, subject, subscriber.email)
            .then((emailSend) => {
              if (!emailSend) {
                console.error(`Failed to send email to ${subscriber.email}`);
              }
            })
            .catch((error) => {
              console.error(
                `Error sending email to ${subscriber.email}:`,
                error
              );
            })
        )
      );

      // Wait for 1 second before processing the next batch
      if (i + batchSize < subscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Store the email content in the database
    await prisma.notes.create({
      data: { content: htmlContent, subject },
    });

    return { success: "Emails sent successfully to all subscribers" };
  } catch (error) {
    console.error("Error sending emails to subscribers:", error);
    return { error: "Error sending emails to subscribers" };
  }
};

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
