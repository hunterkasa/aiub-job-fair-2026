import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { studentRegisterSchema } from "@/lib/validations/authSchemas";
import { signAccessToken } from "@/lib/auth/jwt";
import { sendEmail } from "@/lib/services/emailService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = studentRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { title: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      fullName,
      aiubId,
      email,
      mobile,
      password,
      preferredJobType,
      studyLevel,
      preferredIndustryIds,
      attendsSeminar,
      seminarIds,
      gender,
      address,
    } = parsed.data;

    // Check Deadline
    const deadlineSetting = await prisma.eventSetting.findUnique({
      where: { key: "StudentRegistrationDeadlineUtc" },
    });
    if (deadlineSetting && new Date() > new Date(deadlineSetting.value)) {
      return NextResponse.json(
        { title: "Registration Closed", message: "Student registration deadline has passed." },
        { status: 400 }
      );
    }

    // Check unique AIUB Student ID
    const existingStudentId = await prisma.studentProfile.findUnique({
      where: { aiubId },
    });
    if (existingStudentId) {
      return NextResponse.json(
        { title: "Duplicate Entry", message: `AIUB Student ID '${aiubId}' is already registered.` },
        { status: 409 }
      );
    }

    // Check unique Email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json(
        { title: "Duplicate Entry", message: `Email address '${email}' is already registered.` },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create User and StudentProfile
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: "STUDENT",
        emailConfirmed: false,
        isActive: true,
        studentProfile: {
          create: {
            fullName,
            aiubId,
            mobile,
            gender,
            address,
            preferredJobType,
            studyLevel,
            attendsSeminar,
            preferredIndustries:
              preferredIndustryIds && preferredIndustryIds.length > 0
                ? {
                    create: preferredIndustryIds.map((indId) => ({
                      industry: { connect: { id: indId } },
                    })),
                  }
                : undefined,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    // Attach seminar registrations if applicable
    if (attendsSeminar && seminarIds && seminarIds.length > 0 && user.studentProfile) {
      await prisma.seminarRegistration.createMany({
        data: seminarIds.map((semId) => ({
          seminarId: semId,
          studentId: user.studentProfile!.id,
        })),
        skipDuplicates: true,
      });
    }

    // Send verification email
    const verificationToken = crypto.randomUUID();
    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    sendEmail({
      to: user.email,
      subject: "Verify your AIUB Job Fair 2026 Student Account",
      html: `<h2>Welcome, ${fullName}!</h2><p>Please click below to verify your student email address:</p><p><a href="${req.nextUrl.origin}/verify-email?email=${encodeURIComponent(user.email)}&token=${verificationToken}">Verify Email Address</a></p>`,
    }).catch(console.error);

    // Sign Access Token
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: "STUDENT",
    });

    const response = NextResponse.json({
      message: "Student registered successfully",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: "STUDENT",
        displayName: fullName,
        emailConfirmed: false,
      },
    });

    // Set httpOnly cookie
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 mins
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Student registration error:", error);
    return NextResponse.json({ title: "Error", message: error.message }, { status: 500 });
  }
}
