import { NextResponse } from "next/server";
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
      educations: true,
      assessmentAttempts: {
        where: { completedAt: { not: null } },
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ message: "Profile not found" }, { status: 404 });
  }

  const hasPersonal = Boolean(profile.fullName && profile.aiubId && profile.mobile && profile.address);
  const hasPhoto = Boolean(profile.profilePhotoFileId);
  const hasCv = Boolean(profile.defaultCvFileId);
  const hasConsent = Boolean(profile.consentAcceptedAt);
  const hasAssessment = profile.assessmentAttempts.length > 0;

  // Education: requires at least one degree record (SSC, HSC, or BSc)
  const hasEducation = profile.educations.length >= 1;

  const checks = [
    { key: "personal", label: "Personal Information (Name, ID, Mobile, Address)", completed: hasPersonal },
    { key: "photo", label: "Profile Photo Uploaded", completed: hasPhoto },
    { key: "education", label: "Educational Qualification Record", completed: hasEducation },
    { key: "cv", label: "CV Document Uploaded (PDF)", completed: hasCv },
    { key: "assessment", label: "Self-Assessment (IPIP Big Five) Completed", completed: hasAssessment },
    { key: "consent", label: "Data Consent Agreement Accepted", completed: hasConsent },
  ];

  const completedCount = checks.filter((c) => c.completed).length;
  const percentage = Math.round((completedCount / checks.length) * 100);
  const isComplete = completedCount === checks.length;
  const missing = checks.filter((c) => !c.completed).map((c) => c.label);

  return NextResponse.json({
    isComplete,
    percentage,
    checks,
    missing,
  });
}
