import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { client } from "@/trigger";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Even if user not found, we generally shouldn't reveal it for security, 
    // but for this internal admin app or specific UX request, we might return success anyway 
    // or error if strict. Let's return success to avoid enumeration, but log internally.
    if (!user) {
      // Fake success
      return NextResponse.json({ success: true });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Save token
    // Save or update token
    await prisma.verificationTokens.upsert({
      where: { email },
      update: {
        token,
        expiresAt,
      },
      create: {
        email,
        token,
        expiresAt,
      },
    });

    // Trigger email job
    await client.sendEvent({
      name: "send.forgot.password",
      payload: {
        email,
        token,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
