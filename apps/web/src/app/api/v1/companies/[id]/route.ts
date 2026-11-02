import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      industry: true,
      jobPosts: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!company || company.approvalStatus !== "APPROVED") {
    return NextResponse.json({ message: "Company not found or pending approval" }, { status: 404 });
  }

  const normalized = {
    ...company,
    jobPosts: (company.jobPosts || []).map((j) => ({
      ...j,
      title: j.positionName,
      division: j.location,
      jobType: j.employmentStatus,
      workPlace: j.workplace,
      shortDescription: j.responsibilities || j.skillsAndExpertise || "",
      applicationDeadline: j.deadlineUtc ? j.deadlineUtc.toISOString() : "2026-12-05",
    })),
  };

  return NextResponse.json(normalized);
}
