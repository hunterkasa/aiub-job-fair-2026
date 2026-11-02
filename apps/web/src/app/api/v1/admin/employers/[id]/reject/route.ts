import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const reason = body?.reason || "Did not meet requirements";

  const company = await prisma.company.update({
    where: { id },
    data: {
      approvalStatus: "REJECTED",
      rejectionReason: reason,
    },
  });

  return NextResponse.json({ message: "Employer rejected", company });
}
