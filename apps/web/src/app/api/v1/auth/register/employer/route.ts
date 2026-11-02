import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { employerRegisterSchema } from "@/lib/validations/authSchemas";
import { signAccessToken } from "@/lib/auth/jwt";
import { sendEmail } from "@/lib/services/emailService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = employerRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { title: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      companyName,
      websiteUrl,
      industryId,
      shortIntro,
      about,
      hrName,
      hrEmail,
      hrMobile,
      password,
    } = parsed.data;

    // Check Deadline
    const deadlineSetting = await prisma.eventSetting.findUnique({
      where: { key: "EmployerRegistrationDeadlineUtc" },
    });
    if (deadlineSetting && new Date() > new Date(deadlineSetting.value)) {
      return NextResponse.json(
        { title: "Registration Closed", message: "Employer registration deadline has passed." },
        { status: 400 }
      );
    }

    // Check unique Email
    const existingUser = await prisma.user.findUnique({
      where: { email: hrEmail.toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json(
        { title: "Duplicate Entry", message: `Email address '${hrEmail}' is already registered.` },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: hrEmail.toLowerCase(),
        passwordHash,
        role: "EMPLOYER",
        emailConfirmed: false,
        isActive: true,
        company: {
          create: {
            name: companyName,
            normalizedName: companyName.toLowerCase(),
            websiteUrl: websiteUrl || null,
            industryId,
            shortIntro,
            about: about || null,
            hrName,
            hrEmail: hrEmail.toLowerCase(),
            hrMobile,
            approvalStatus: "PENDING",
            registrationCompleted: true,
          },
        },
      },
      include: {
        company: true,
      },
    });

    // Send verification email
    const verificationToken = crypto.randomUUID();
    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    sendEmail({
      to: user.email,
      subject: "Verify your Employer Account — AIUB Job Fair 2026",
      html: `<h2>Welcome, ${companyName}!</h2><p>Please click below to verify your email. Note that an administrator will review your profile before your job posts become public:</p><p><a href="${req.nextUrl.origin}/verify-email?email=${encodeURIComponent(user.email)}&token=${verificationToken}">Verify Account</a></p>`,
    }).catch(console.error);

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: "EMPLOYER",
    });

    const response = NextResponse.json({
      message: "Employer registered successfully. Awaiting admin approval.",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: "EMPLOYER",
        displayName: companyName,
        emailConfirmed: false,
        isApproved: false,
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
    console.error("Employer registration error:", error);
    return NextResponse.json({ title: "Error", message: error.message }, { status: 500 });
  }
}
