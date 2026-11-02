import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/authSchemas";
import { signAccessToken } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { title: "Invalid login credentials", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        studentProfile: true,
        company: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ title: "Unauthorized", message: "Invalid email or password." }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ title: "Unauthorized", message: "Invalid email or password." }, { status: 401 });
    }

    let displayName = user.email;
    let isApproved = true;

    if (user.role === "STUDENT" && user.studentProfile) {
      displayName = user.studentProfile.fullName;
    } else if (user.role === "EMPLOYER" && user.company) {
      displayName = user.company.name;
      isApproved = user.company.approvalStatus === "APPROVED";
    } else if (user.role === "ADMIN") {
      displayName = "Administrator";
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Logged in successfully",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName,
        emailConfirmed: user.emailConfirmed,
        isApproved,
      },
    });

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ title: "Error", message: error.message }, { status: 500 });
  }
}
