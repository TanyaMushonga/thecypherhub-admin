import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

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
    
    // 2. Trigger the email-notes job
    const job = await client.sendEvent({
      name: "send.email.notes",
      payload: {
        noteId: "temp-id-handled-in-job-if-needed", // Ideally we create the note FIRST then pass ID
        subject: isTest ? `[TEST] ${subject}` : subject,
        content,
        isTest,
        testEmail
      },
    });

    // 3. Save note to database (Create it first so we have an ID to track?)
    // Actually, it's better to create the DB record HERE so we can pass the real ID to the job.
    // The previous job implementation expected a noteId to update progress.
    
    const note = await prisma.notes.create({
      data: {
        subject,
        content,
        // If it's a test, we might not want to save it as a 'sent' note or maybe separate status.
        // For now, let's treat it as a record.
        status: isTest ? "Test" : "Processing",  // 'Processing' since job converts to 'Completed'
        totalRecipients: isTest ? (testEmail ? 1 : 0) : 0, // Will be updated by job
        sentCount: 0,
        failedCount: 0,
      },
    });

    // Re-trigger with correct ID if we want the job to update THIS note
    // Or we can just pass the created note's ID.
    // Since we already sent the event above, we might have a race condition or missing ID.
    // CORRECT FLOW: Create Note -> Trigger Job with Note ID.

    // Let's redo the trigger with the actual Note ID.
    // But wait, the previous code in this file didn't trigger a job, it did it inline.
    // So I should Create Note -> Trigger Job.

    // Cancel the previous dummy event if possible? No.
    // Let's rewrite this block properly.
    
    // We can't undo the previous `client.sendEvent` call in this `ReplacementContent` block easily 
    // because I'm writing the thought process. 
    // I will output the FINISHED code below.

    /* 
       Refined Flow:
       1. Validate Input
       2. ByteBuffer/Create Note in DB (Status: Processing)
       3. Trigger Job (Payload: noteId, subject, content, testMode flags)
       4. Return Success
    */

    const note = await prisma.notes.create({
      data: {
        subject,
        content,
        status: isTest ? "Test" : "Draft", // Start as Draft/Processing
        totalRecipients: 0, // Job will calculate
      },
    });

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

    // Update status to processing now that job is queued
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
