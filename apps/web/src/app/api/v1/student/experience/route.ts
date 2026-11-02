import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.userId } });
  if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

  const body = await req.json();
  const { companyName, industryId, jobType, designation, startDate, endDate, isContinuous, responsibilities } = body;

  if (!companyName || !designation || !startDate) {
    return NextResponse.json({ message: "Company, Designation, and Start Date are required" }, { status: 400 });
  }

  const record = await prisma.experienceRecord.create({
    data: {
      studentId: profile.id,
      companyName,
      industryId: industryId || null,
      jobType: jobType || "FULL_TIME",
      designation,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isContinuous: Boolean(isContinuous),
      responsibilities: responsibilities || null,
    },
  });

  return NextResponse.json(record);
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.userId } });
  if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "ID is required" }, { status: 400 });

  await prisma.experienceRecord.deleteMany({
    where: { id, studentId: profile.id },
  });

  return NextResponse.json({ message: "Experience record deleted" });
}
