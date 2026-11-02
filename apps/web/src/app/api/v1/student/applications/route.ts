import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.userId } });
  if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

  const applications = await prisma.application.findMany({
    where: { studentId: profile.id },
    include: {
      jobPost: {
        include: {
          company: {
            select: { id: true, name: true, logoFileId: true, websiteUrl: true },
          },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(applications);
}
