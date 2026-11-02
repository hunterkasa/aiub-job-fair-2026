import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const seminars = await prisma.seminar.findMany({
      where: { isActive: true },
      orderBy: { startsAtUtc: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        startsAtUtc: true,
        venue: true,
        capacity: true,
      },
    });
    return NextResponse.json(seminars);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
