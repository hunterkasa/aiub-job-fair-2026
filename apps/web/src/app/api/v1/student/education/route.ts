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
  const { level, institutionName, cgpa, subject, passingYear, notes } = body;

  if (!level || !institutionName) {
    return NextResponse.json({ message: "Level and Institution Name are required" }, { status: 400 });
  }

  const record = await prisma.educationRecord.create({
    data: {
      studentId: profile.id,
      level,
      institutionName,
      cgpa: cgpa ? parseFloat(cgpa) : null,
      subject: subject || null,
      passingYear: passingYear ? parseInt(passingYear, 10) : null,
      notes: notes || null,
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

  await prisma.educationRecord.deleteMany({
    where: { id, studentId: profile.id },
  });

  return NextResponse.json({ message: "Education record deleted" });
}
