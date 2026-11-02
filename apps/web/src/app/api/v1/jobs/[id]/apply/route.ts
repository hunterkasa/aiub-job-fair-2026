import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { applyJobSchema } from "@/lib/validations/authSchemas";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobPostId } = await params;
  const user = await getCurrentUser();

  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ message: "Only registered students can apply for jobs." }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.userId },
    include: {
      educations: true,
      assessmentAttempts: {
        where: { completedAt: { not: null } },
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ message: "Student profile not found." }, { status: 404 });
  }

  // Completeness verification (Section 3 Q7)
  const missingItems: string[] = [];
  if (!profile.fullName || !profile.aiubId || !profile.mobile || !profile.address) {
    missingItems.push("Personal details (Name, ID, Mobile, Address)");
  }
  if (!profile.profilePhotoFileId) {
    missingItems.push("Profile Photo");
  }
  if (profile.educations.length === 0) {
    missingItems.push("Educational Qualification");
  }
  if (!profile.defaultCvFileId) {
    missingItems.push("Uploaded CV (PDF)");
  }
  if (!profile.consentAcceptedAt) {
    missingItems.push("Consent Agreement Acceptance");
  }

  if (missingItems.length > 0) {
    return NextResponse.json(
      {
        title: "Profile Incomplete",
        message: "You must complete your profile and upload a CV before applying.",
        missing: missingItems,
      },
      { status: 422 }
    );
  }

  // Check Job post exists and is active
  const job = await prisma.jobPost.findUnique({
    where: { id: jobPostId },
    include: { company: true },
  });

  if (!job || job.status !== "PUBLISHED" || job.company.approvalStatus !== "APPROVED") {
    return NextResponse.json({ message: "This job post is no longer available." }, { status: 400 });
  }

  // Check duplicate application
  const existingApp = await prisma.application.findFirst({
    where: {
      studentId: profile.id,
      jobPostId: job.id,
    },
  });

  if (existingApp) {
    return NextResponse.json(
      { message: "You have already submitted an application for this position." },
      { status: 409 }
    );
  }

  const body = await req.json();
  const parsed = applyJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { joiningOption, answer1, answer2 } = parsed.data;

  const application = await prisma.application.create({
    data: {
      studentId: profile.id,
      jobPostId: job.id,
      cvFileId: profile.defaultCvFileId!,
      joiningOption,
      answer1: answer1 || null,
      answer2: answer2 || null,
      status: "SUBMITTED",
    },
  });

  return NextResponse.json({
    message: "Application submitted successfully!",
    applicationId: application.id,
  });
}
