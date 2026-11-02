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
  const { name, designation, organization, email, mobile, relation } = body;

  if (!name || !designation || !organization || !email || !mobile) {
    return NextResponse.json({ message: "All reference fields are required" }, { status: 400 });
  }

  const record = await prisma.referenceRecord.create({
    data: {
      studentId: profile.id,
      name,
      designation,
      organization,
      email,
      mobile,
      relation: relation || "PROFESSIONAL",
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

  await prisma.referenceRecord.deleteMany({
    where: { id, studentId: profile.id },
  });

  return NextResponse.json({ message: "Reference deleted" });
}
