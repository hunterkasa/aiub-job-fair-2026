import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.userId },
    include: {
      preferredIndustries: {
        include: { industry: true },
      },
      educations: {
        orderBy: { passingYear: "desc" },
      },
      experiences: {
        orderBy: { startDate: "desc" },
      },
      references: true,
      seminarRegistrations: {
        include: { seminar: true },
      },
      assessmentAttempts: {
        where: { completedAt: { not: null } },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      fullName,
      mobile,
      gender,
      address,
      preferredJobType,
      studyLevel,
      linkedInUrl,
      gitHubUrl,
      extracurricularText,
      attendsSeminar,
      consentAccepted,
    } = body;

    const profile = await prisma.studentProfile.update({
      where: { userId: user.userId },
      data: {
        fullName: fullName || undefined,
        mobile: mobile || undefined,
        gender: gender || undefined,
        address: address || undefined,
        preferredJobType: preferredJobType || undefined,
        studyLevel: studyLevel || undefined,
        linkedInUrl: linkedInUrl || undefined,
        gitHubUrl: gitHubUrl || undefined,
        extracurricularText: extracurricularText || undefined,
        attendsSeminar: typeof attendsSeminar === "boolean" ? attendsSeminar : undefined,
        consentAcceptedAt: consentAccepted ? new Date() : undefined,
      },
    });

    return NextResponse.json({ message: "Profile updated successfully", profile });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
