import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { verifyEmailSchema } from "@/lib/validations/authSchemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const { email, token } = parsed.data;

    const record = await prisma.verificationToken.findFirst({
      where: {
        email: email.toLowerCase(),
        token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return NextResponse.json({ message: "Invalid or expired verification token." }, { status: 400 });
    }

    // Mark user email as confirmed
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailConfirmed: true },
    });

    // Delete token
    await prisma.verificationToken.delete({ where: { id: record.id } });

    return NextResponse.json({ message: "Email confirmed successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
