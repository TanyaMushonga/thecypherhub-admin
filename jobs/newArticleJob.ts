import { client } from "@/trigger";
import { eventTrigger } from "@trigger.dev/sdk";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendEmailToSubscribers } from "@/lib/emails";

const SAFE_BATCH_SIZE = 5;

export const newArticleJob = client.defineJob({
  id: "notify-new-article",
  name: "Notify Subscribers about New Article",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "notify.new.article",
    schema: z.object({
      title: z.string(),
      content: z.string(),
      slug: z.string(),
      description: z.string().optional(),
    }),
  }),
  run: async (payload, io, ctx) => {
    const { title, content, slug, description } = payload;

    // 1. Prepare Content
    // Trim to 1/3 (approx) or first few paragraphs? User asked for 1/3.
    const trimLength = Math.floor(content.length / 3);
    const truncatedContent = content.substring(0, trimLength) + "...";
    
    // Create HTML with button
    // Ensure styles call out to the user to continue reading
    const emailHtml = `
      <div>
        <h2>New Article: ${title}</h2>
        <p>${description || ""}</p>
        <hr />
        <div>${truncatedContent}</div>
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://thecypherhub.tech/blog/${slug}" 
             style="background-color: #2b2d6e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Continue Reading
          </a>
        </div>
      </div>
    `;

    // 2. Fetch Active Subscribers
    const subscribers = await prisma.subscribers.findMany({
      where: { status: 1 },
      select: { email: true },
    });

    let sentCount = 0;
    let failedCount = 0;

    // 3. Send in batches
    for (let i = 0; i < subscribers.length; i += SAFE_BATCH_SIZE) {
      const batch = subscribers.slice(i, i + SAFE_BATCH_SIZE);

      await Promise.all(
        batch.map(async (sub) => {
          try {
            await sendEmailToSubscribers(emailHtml, `New Article: ${title}`, sub.email);
            sentCount++;
          } catch (error: any) {
            if (error?.statusCode === 429) {
                await io.logger.warn(`Rate limit hit for ${sub.email}.`);
            }
            failedCount++;
            await io.logger.error(`Failed to send to ${sub.email}`, { error });
          }
        })
      );

      if (i + SAFE_BATCH_SIZE < subscribers.length) {
          await io.wait(`rate-limit-delay-${i}`, 2);
      }
    }

    // Optional: Log completion or create a Note record for this notification specifically?
    // User didn't ask to create a Note record for articles, but it might be nice.
    // Logic: Just finish.
    
    await io.logger.info(`Article notification completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    return { sentCount, failedCount };
  },
});
