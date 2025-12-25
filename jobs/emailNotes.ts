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
    // 2. Process in batches with rate limiting
    // Resend Free Tier: ~2 requests/sec. Paid: Higher.
    // We'll be conservative: batch size 5, 2 second delay between batches.
    const SAFE_BATCH_SIZE = 5; 
    
    for (let i = 0; i < subscribers.length; i += SAFE_BATCH_SIZE) {
      const batch = subscribers.slice(i, i + SAFE_BATCH_SIZE);

      await Promise.all(
        batch.map(async (sub) => {
          try {
            await sendEmailToSubscribers(content, subject, sub.email);
            sentCount++;
          } catch (error: any) {
            // Check for rate limit error specifically if possible
            if (error?.statusCode === 429) {
                await io.logger.warn(`Rate limit hit for ${sub.email}. Pausing...`);
                // In a robust system, we might retry THIS single item. 
                // For now, allow it to fail or just log it.
            }
            failedCount++;
            await io.logger.error(`Failed to send to ${sub.email}`, { error });
          }
        })
      );

      // Update progress
      await prisma.notes.update({
        where: { id: noteId },
        data: { sentCount, failedCount },
      });
      
      // Delay to respect rate limits. 
      // Using io.wait is safer for long running jobs in Trigger.dev than setTimeout
      if (i + SAFE_BATCH_SIZE < subscribers.length) {
          await io.wait(`rate-limit-delay-${i}`, 2); // 2 seconds delay
      }
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
