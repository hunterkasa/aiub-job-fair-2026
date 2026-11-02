import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const job = await prisma.jobPost.findUnique({
    where: { id },
    include: {
      company: {
        include: { industry: true },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ message: "Job post not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
