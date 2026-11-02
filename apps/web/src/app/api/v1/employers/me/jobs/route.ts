import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { jobPostSchema } from "@/lib/validations/authSchemas";

export async function GET() {
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

  const jobs = await prisma.jobPost.findMany({
    where: { companyId: company.id },
    include: {
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
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

  try {
    const body = await req.json();
    const parsed = jobPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const {
      positionName,
      postType,
      location,
      workplace,
      employmentStatus,
      educationRequirement,
      additionalRequirements,
      responsibilities,
      skillsAndExpertise,
      salaryMode,
      salaryMin,
      salaryMax,
      compensationBenefits,
      question1,
      question2,
      deadlineUtc,
    } = parsed.data;

    const job = await prisma.jobPost.create({
      data: {
        companyId: company.id,
        positionName,
        postType,
        location,
        workplace,
        employmentStatus,
        educationRequirement,
        additionalRequirements,
        responsibilities,
        skillsAndExpertise,
        salaryMode,
        salaryMin,
        salaryMax,
        compensationBenefits,
        question1,
        question2,
        deadlineUtc: deadlineUtc ? new Date(deadlineUtc) : null,
        status: "PUBLISHED",
      },
    });

    return NextResponse.json({ message: "Job post created successfully", job });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
