import { NextResponse } from "next/server";
import { sendNoteBatch, sendArticleNotificationBatch } from "@/lib/emails";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipients, subject, content, noteId, type, article } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "Invalid recipients" }, { status: 400 });
    }

    if (type === "note") {
        if (!subject || !content) {
            return NextResponse.json({ error: "Missing subject or content" }, { status: 400 });
        }
        await sendNoteBatch(recipients, subject, content);
        
        // Only update stats if we have a valid noteId (i.e., not a test email)
        if (noteId && typeof noteId === 'string' && noteId.length > 0) {
            await prisma.notes.update({
                where: { id: noteId },
                data: {
                    status: "Sent",
                    totalRecipients: {
                        increment: recipients.length
                    }
                }
            });
        }
    } else if (type === "article") {
        if (!article || !article.title || !article.slug) {
             return NextResponse.json({ error: "Missing article details" }, { status: 400 });
        }
        await sendArticleNotificationBatch(recipients, article);
    } else {
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    return NextResponse.json({ message: "Batch sent successfully" });

  } catch (error: any) {
    console.error("Error sending batch:", error);
    return NextResponse.json({ error: "Failed to send batch", details: error.message }, { status: 500 });
  }
}
