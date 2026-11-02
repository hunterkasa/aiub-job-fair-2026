import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const industryId = searchParams.get("industryId");

    const where: any = {
      approvalStatus: "APPROVED",
    };

    if (q) {
      where.name = { contains: q, mode: "insensitive" };
    }

    if (industryId && industryId !== "All") {
      where.industryId = industryId;
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        industry: true,
        _count: {
          select: {
            jobPosts: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(companies);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
