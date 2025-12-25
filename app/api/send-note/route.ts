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
    
    // 2. Send email via Resend
    const data = await resend.emails.send({
      from: "The Cypher Hub <onboarding@resend.dev>", // Or verified domain
      to: isTest ? recipients : ["delivered@resend.dev"], 
      bcc: isTest ? undefined : recipients,
      subject: isTest ? `[TEST] ${subject}` : subject,
      html: content, 
    });

    if (data.error) {
      return new NextResponse(JSON.stringify(data.error), { status: 500 });
    }

    // 3. Save note to database (only if not a test, or maybe save tests with status 'Test'?)
    // User probably wants to see history of broadcasts, tests might clutter but useful for debugging.
    // I will save with status field.
    
    await prisma.notes.create({
      data: {
        subject,
        content,
        status: isTest ? "Test" : "Sent",
        totalRecipients: recipients.length,
        sentCount: recipients.length, // Assuming Resend accepts all
        failedCount: 0,
        // Legacy field
        recipientsCount: recipients.length,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error sending note:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
