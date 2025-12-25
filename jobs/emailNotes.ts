import { client } from "@/trigger";
import { eventTrigger } from "@trigger.dev/sdk";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendEmailToSubscribers } from "@/lib/emails";

const BATCH_SIZE = 10;

export const emailNotesJob = client.defineJob({
  id: "email-notes",
  name: "Email Notes to Subscribers",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "send.email.notes",
    schema: z.object({
      noteId: z.string(),
      subject: z.string(),
      content: z.string(),
    }),
  }),
  run: async (payload, io, ctx) => {
    const { noteId, subject, content } = payload;

    // 1. Fetch all active subscribers
    const subscribers = await prisma.subscribers.findMany({
      where: { status: 1 },
      select: { email: true },
    });

    // Update note with total recipients
    await prisma.notes.update({
      where: { id: noteId },
      data: { 
        totalRecipients: subscribers.length,
        status: "processing"
      },
    });

    let sentCount = 0;
    let failedCount = 0;

    // 2. Process in batches
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (sub) => {
          try {
            await sendEmailToSubscribers(content, subject, sub.email);
            sentCount++;
          } catch (error) {
            failedCount++;
            await io.logger.error(`Failed to send to ${sub.email}`, { error });
          }
        })
      );

      // Update progress incrementally
      await prisma.notes.update({
        where: { id: noteId },
        data: { sentCount, failedCount },
      });
      
      // Optional: Add a small delay to respect rate limits if needed, 
      // primarily handled by io.wait if strictly required, but simple batching helps.
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 3. Final update
    await prisma.notes.update({
      where: { id: noteId },
      data: { 
        sentCount, 
        failedCount, 
        status: "completed" 
      },
    });

    return { sentCount, failedCount };
  },
});
