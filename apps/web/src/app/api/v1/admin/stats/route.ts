import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [
    totalStudents,
    totalEmployers,
    pendingEmployers,
    totalJobPosts,
    totalApplications,
    totalSeminars,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.company.count(),
    prisma.company.count({ where: { approvalStatus: "PENDING" } }),
    prisma.jobPost.count(),
    prisma.application.count(),
    prisma.seminar.count(),
  ]);

  return NextResponse.json({
    totalStudents,
    totalEmployers,
    pendingEmployers,
    totalJobPosts,
    totalApplications,
    totalSeminars,
  });
}
