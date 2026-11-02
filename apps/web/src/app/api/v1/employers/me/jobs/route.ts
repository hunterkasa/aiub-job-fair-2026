import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

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

  const rawJobs = await prisma.jobPost.findMany({
    where: { companyId: company.id },
    include: {
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const jobs = rawJobs.map((j) => ({
    ...j,
    title: j.positionName,
    division: j.location,
    jobType: j.employmentStatus,
    workPlace: j.workplace,
    shortDescription: j.responsibilities || j.skillsAndExpertise || "",
    requirements: j.skillsAndExpertise || "",
    applicationDeadline: j.deadlineUtc ? j.deadlineUtc.toISOString() : "2026-12-05",
  }));

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

    const positionName = (body.positionName || body.title || "").trim();
    if (!positionName) {
      return NextResponse.json({ message: "Job title / position name is required" }, { status: 400 });
    }

    const location = body.location || body.division || "Dhaka";
    let workplace = (body.workplace || body.workPlace || "OFFICE").toUpperCase();
    if (workplace === "ON_SITE") workplace = "OFFICE";
    if (!["OFFICE", "REMOTE", "ONLINE"].includes(workplace)) workplace = "OFFICE";

    let employmentStatus = (body.employmentStatus || body.jobType || "FULL_TIME").toUpperCase();
    if (!["FULL_TIME", "PART_TIME", "CONTRACTUAL", "INTERNSHIP"].includes(employmentStatus)) {
      employmentStatus = "FULL_TIME";
    }

    const responsibilities = body.responsibilities || body.shortDescription || "";
    const skillsAndExpertise = body.skillsAndExpertise || body.requirements || "";
    const deadlineVal = body.deadlineUtc || body.applicationDeadline;

    const job = await prisma.jobPost.create({
      data: {
        companyId: company.id,
        positionName,
        postType: "OPENING",
        location,
        workplace: workplace as any,
        employmentStatus: employmentStatus as any,
        responsibilities,
        skillsAndExpertise,
        salaryMode: body.salaryMode || "Negotiable",
        question1: body.question1 || null,
        question2: body.question2 || null,
        deadlineUtc: deadlineVal ? new Date(deadlineVal) : new Date("2026-12-05T17:59:59Z"),
        status: "PUBLISHED",
      },
    });

    return NextResponse.json({ message: "Job post published successfully", job }, { status: 201 });
  } catch (error: any) {
    console.error("Job creation error:", error);
    return NextResponse.json({ message: error.message || "Failed to create job post" }, { status: 500 });
  }
}
