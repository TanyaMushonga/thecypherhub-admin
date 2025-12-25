import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { client } from "@/trigger";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, content, isTest, testEmail } = body;

    if (!subject || !content) {
      return new NextResponse("Missing subject or content", { status: 400 });
    }

    let recipients: string[] = [];

    if (isTest) {
        if (!testEmail) {
            return new NextResponse("Test email required", { status: 400 });
        }
        recipients = [testEmail];
    } else {
        // 1. Fetch active subscribers
        const subscribers = await prisma.subscribers.findMany({
            where: { status: 1 },
        });

        if (subscribers.length === 0) {
            return new NextResponse("No active subscribers found", { status: 400 });
        }
        recipients = subscribers.map((sub) => sub.email);
    }
    
    // 2. Create Note in DB (Status: Draft/Processing)
    const note = await prisma.notes.create({
      data: {
        subject,
        content,
        // If it's a test, we might not want to save it as a 'sent' note or maybe separate status.
        // For now, let's treat it as a record.
        status: isTest ? "Test" : "Draft",
        totalRecipients: 0, // Job will calculate
      },
    });

    // 3. Trigger the email-notes job
    const event = await client.sendEvent({
      name: "send.email.notes",
      payload: {
        noteId: note.id,
        subject: isTest ? `[TEST] ${subject}` : subject,
        content,
        isTest: !!isTest,
        testEmail: testEmail
      },
    });

    // 4. Update status to processing now that job is queued
    await prisma.notes.update({
        where: { id: note.id },
        data: { status: "Processing" }
    });

    return NextResponse.json({ message: "Note processing started", eventId: event.id, noteId: note.id });
  } catch (error) {
    console.error("Error sending note:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
