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
      return NextResponse.json({ error: "Missing subject or content" }, { status: 400 });
    }

    let recipients: string[] = [];

    if (isTest) {
        if (!testEmail) {
            return NextResponse.json({ error: "Test email required" }, { status: 400 });
        }
        recipients = [testEmail];
    } else {
        // 1. Fetch active subscribers
        console.log("Fetching subscribers...");
        const subscribers = await prisma.subscribers.findMany({
            where: { status: 1 },
        });

        if (subscribers.length === 0) {
            return NextResponse.json({ error: "No active subscribers found" }, { status: 400 });
        }
        recipients = subscribers.map((sub) => sub.email);
        console.log(`Found ${recipients.length} subscribers.`);
    }
    
    // 2. Create Note in DB (Status: Draft/Processing)
    console.log("Creating note in DB...");
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
    console.log(`Note created with ID: ${note.id}`);

    // 3. Trigger the email-notes job
    console.log("Triggering email-notes job...");
    try {
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
        console.log(`Event triggered with ID: ${event.id}`);

        // 4. Update status to processing now that job is queued
        await prisma.notes.update({
            where: { id: note.id },
            data: { status: "Processing" }
        });

        return NextResponse.json({ message: "Note processing started", eventId: event.id, noteId: note.id });
    } catch (triggerError: any) {
        console.error("Failed to trigger event:", triggerError);
        // Attempt to mark note as failed
        await prisma.notes.update({
            where: { id: note.id },
            data: { status: "Failed" }
        });
        return NextResponse.json({ error: "Failed to trigger background job", details: triggerError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error sending note:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
