import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const assessment = await prisma.assessmentSet.findFirst({
    where: { isActive: true },
    include: {
      questions: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          options: {
            orderBy: { value: "asc" },
          },
        },
      },
    },
  });

  if (!assessment) {
    return NextResponse.json({ message: "No active assessment found" }, { status: 404 });
  }

  // Check if student already completed this
  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.userId } });
  let alreadyCompleted = false;
  if (profile) {
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: {
        studentId: profile.id,
        setId: assessment.id,
        completedAt: { not: null },
      },
    });
    if (attempt) alreadyCompleted = true;
  }

  return NextResponse.json({
    id: assessment.id,
    title: "Self-Assessment (IPIP Big Five)",
    sourceNote: assessment.sourceNote,
    disclaimer:
      "This is a self-assessment inventory, not a test with pass or fail. Employers whose job posts you apply to will be able to see category summaries alongside your application.",
    alreadyCompleted,
    questions: assessment.questions.map((q) => ({
      id: q.id,
      text: q.text,
      category: q.category,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        value: o.value,
      })),
    })),
  });
}
