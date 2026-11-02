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
  const { setId, answers, consent } = body as {
    setId: string;
    answers: Record<string, number>; // questionId -> value (1 to 5)
    consent: boolean;
  };

  if (!consent) {
    return NextResponse.json({ message: "You must accept the self-assessment consent agreement." }, { status: 400 });
  }

  const assessment = await prisma.assessmentSet.findUnique({
    where: { id: setId },
    include: {
      questions: true,
      bands: true,
    },
  });

  if (!assessment) {
    return NextResponse.json({ message: "Assessment not found" }, { status: 404 });
  }

  // Calculate scores per category
  const categoryScores: Record<string, number> = {};
  const answerEntries: { questionId: string; value: number }[] = [];

  for (const q of assessment.questions) {
    const rawVal = answers[q.id];
    if (typeof rawVal !== "number") {
      return NextResponse.json({ message: `Missing answer for question: "${q.text}"` }, { status: 400 });
    }

    // In a 1-5 scale, reverse scoring is: 6 - rawVal
    const scoreVal = q.isReverseKeyed ? 6 - rawVal : rawVal;
    categoryScores[q.category] = (categoryScores[q.category] || 0) + scoreVal;
    answerEntries.push({ questionId: q.id, value: rawVal });
  }

  // Create attempt and results
  const attempt = await prisma.assessmentAttempt.create({
    data: {
      studentId: profile.id,
      setId: assessment.id,
      completedAt: new Date(),
      consentAt: new Date(),
      answers: {
        create: answerEntries.map((a) => ({
          questionId: a.questionId,
          value: a.value,
        })),
      },
    },
  });

  // Calculate and store results per band
  for (const [category, score] of Object.entries(categoryScores)) {
    const matchingBand = assessment.bands.find(
      (b) => b.category === category && score >= b.minScore && score <= b.maxScore
    );
    const bandLabel = matchingBand ? matchingBand.label : "Medium";

    await prisma.assessmentResult.create({
      data: {
        attemptId: attempt.id,
        category,
        score,
        band: bandLabel,
      },
    });
  }

  // Response strictly without scores as requested in Spec Section 3 (Q2)
  return NextResponse.json({
    message: "Thank you! Your self-assessment has been successfully submitted.",
    completed: true,
  });
}
