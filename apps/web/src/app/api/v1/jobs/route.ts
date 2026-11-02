import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const companyId = searchParams.get("companyId");
    const location = searchParams.get("location");
    const employmentStatus = searchParams.get("employmentStatus");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = 20;

    const where: any = {
      status: "PUBLISHED",
      company: {
        approvalStatus: "APPROVED", // Only approved companies
      },
    };

    if (q) {
      where.OR = [
        { positionName: { contains: q, mode: "insensitive" } },
        { skillsAndExpertise: { contains: q, mode: "insensitive" } },
        { company: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (location && location !== "All") {
      where.location = location;
    }

    if (employmentStatus && employmentStatus !== "All") {
      where.employmentStatus = employmentStatus as any;
    }

    const [total, jobs] = await Promise.all([
      prisma.jobPost.count({ where }),
      prisma.jobPost.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true, logoFileId: true, websiteUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
