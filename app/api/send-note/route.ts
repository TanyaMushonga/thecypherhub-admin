import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, content, status, totalRecipients } = body;

    if (!subject || !content) {
      return NextResponse.json(
        { error: "Missing subject or content" },
        { status: 400 }
      );
    }

    // Create Note in DB (Status: Draft/Processing)
    console.log("Creating note in DB...");
    const note = await prisma.notes.create({
      data: {
        subject,
        content,
        status: status || "Draft",
        totalRecipients: totalRecipients || 0,
      },
    });
    console.log(`Note created with ID: ${note.id}`);

    return NextResponse.json({
      message: "Note created successfully",
      noteId: note.id,
    });
  } catch (error: unknown) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
