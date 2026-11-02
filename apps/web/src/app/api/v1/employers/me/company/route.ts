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
    include: { industry: true },
  });

  if (!company) {
    return NextResponse.json({ message: "Company profile not found" }, { status: 404 });
  }

  return NextResponse.json(company);
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "EMPLOYER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, websiteUrl, industryId, shortIntro, about, hrName, hrEmail, hrMobile } = body;

    const company = await prisma.company.update({
      where: { ownerUserId: user.userId },
      data: {
        name: name || undefined,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : undefined,
        industryId: industryId || undefined,
        shortIntro: shortIntro || undefined,
        about: about !== undefined ? about : undefined,
        hrName: hrName || undefined,
        hrEmail: hrEmail || undefined,
        hrMobile: hrMobile || undefined,
      },
    });

    return NextResponse.json({ message: "Company profile updated successfully", company });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
