import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ message: "Only registered students can drop CVs." }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.userId },
    include: { educations: true },
  });

  if (!profile || !profile.defaultCvFileId) {
    return NextResponse.json(
      { message: "You must complete your profile and upload your CV before dropping it into the candidate pool." },
      { status: 422 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const joiningOption = body?.joiningOption || "IMMEDIATELY";

  // Check if student already has an active general CV drop
  const existingDrop = await prisma.application.findFirst({
    where: {
      studentId: profile.id,
      jobPostId: null,
    },
  });

  if (existingDrop) {
    return NextResponse.json({ message: "Your CV is already deposited in the general candidate pool." });
  }

  const application = await prisma.application.create({
    data: {
      studentId: profile.id,
      jobPostId: null, // null represents general CV drop
      cvFileId: profile.defaultCvFileId,
      joiningOption,
      status: "SUBMITTED",
    },
  });

  return NextResponse.json({
    message: "Your CV has been successfully placed into the AIUB Job Fair 2026 general candidate pool!",
    applicationId: application.id,
  });
}
