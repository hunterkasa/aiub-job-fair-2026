import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobPostId } = await params;
  const user = await getCurrentUser();

  if (!user || user.role !== "EMPLOYER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { ownerUserId: user.userId },
  });

  if (!company) {
    return NextResponse.json({ message: "Company profile not found" }, { status: 404 });
  }

  // IDOR Verification: Ensure job post belongs to this company
  const job = await prisma.jobPost.findUnique({
    where: { id: jobPostId },
  });

  if (!job || job.companyId !== company.id) {
    return NextResponse.json({ message: "Forbidden: You do not own this job post." }, { status: 403 });
  }

  const applications = await prisma.application.findMany({
    where: { jobPostId: job.id },
    include: {
      student: {
        include: {
          educations: true,
          experiences: true,
          references: true,
          assessmentAttempts: {
            where: { completedAt: { not: null } },
            include: {
              results: true,
            },
            take: 1,
            orderBy: { completedAt: "desc" },
          },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  // Map response with psychometric summary
  const formatted = applications.map((app) => {
    const student = app.student;
    const latestAttempt = student?.assessmentAttempts[0];

    const assessmentSummary = latestAttempt
      ? {
          disclaimer: "Self-reported profile. Not a hiring decision tool.",
          completedAt: latestAttempt.completedAt,
          categories: latestAttempt.results.map((r) => ({
            category: r.category,
            band: r.band, // Low | Medium | High
          })),
        }
      : null;

    return {
      applicationId: app.id,
      joiningOption: app.joiningOption,
      answer1: app.answer1,
      answer2: app.answer2,
      status: app.status,
      submittedAt: app.submittedAt,
      cvDownloadUrl: `/api/v1/files/${app.cvFileId}`,
      student: student
        ? {
            id: student.id,
            fullName: student.fullName,
            aiubId: student.aiubId,
            mobile: student.mobile,
            gender: student.gender,
            address: student.address,
            preferredJobType: student.preferredJobType,
            studyLevel: student.studyLevel,
            linkedInUrl: student.linkedInUrl,
            gitHubUrl: student.gitHubUrl,
            educations: student.educations,
            experiences: student.experiences,
            references: student.references,
            assessmentSummary,
          }
        : null,
    };
  });

  return NextResponse.json(formatted);
}
