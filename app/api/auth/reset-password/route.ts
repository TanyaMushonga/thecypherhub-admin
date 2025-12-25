import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "@node-rs/argon2";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // specific to verificationTokens
    // we need to find token
    const verificationToken = await prisma.verificationTokens.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // Handle optional expiry
    const hasExpired = verificationToken.expiresAt && new Date() > verificationToken.expiresAt;
    
    if (hasExpired) {
        // cleanup
        await prisma.verificationTokens.delete({ where: { token } });
        return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    const { email } = verificationToken;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash password using Argon2
    const hashedPassword = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    await prisma.user.update({
      where: { email },
      data: { hashedPassword },
    });

    // delete token
    await prisma.verificationTokens.delete({
      where: { token },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
