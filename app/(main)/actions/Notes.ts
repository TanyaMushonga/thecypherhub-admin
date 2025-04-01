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
      where: {
        status: 1,
      },
    });

    for (const subscriber of subscribers) {
      const emailSend = await sendEmailToSubscribers(
        htmlContent,
        subject,
        subscriber.email
      );

      if (!emailSend) {
        console.error(`Failed to send email to ${subscriber.email}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    await prisma.notes.create({
      data: {
        content: htmlContent,
        subject,
      },
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
