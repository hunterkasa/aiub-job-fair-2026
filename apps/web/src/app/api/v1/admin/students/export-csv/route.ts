import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.studentProfile.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { aiubId: "asc" },
  });

  const lines = [
    "AIUB_ID,FullName,Email,Mobile,PreferredJobType,StudyLevel,AttendsSeminar,RegisteredAtUtc",
  ];

  for (const s of students) {
    const aiubId = s.aiubId.replace(/"/g, '""');
    const name = s.fullName.replace(/"/g, '""');
    const email = (s.user?.email || "").replace(/"/g, '""');
    const mobile = s.mobile.replace(/"/g, '""');
    lines.push(
      `"${aiubId}","${name}","${email}","${mobile}","${s.preferredJobType}","${s.studyLevel}","${s.attendsSeminar}","${s.createdAt.toISOString()}"`
    );
  }

  const csv = lines.join("\n");
  const headers = new Headers();
  headers.set("Content-Type", "text/csv; charset=utf-8");
  headers.set("Content-Disposition", `attachment; filename="aiub_students_${new Date().toISOString().slice(0, 10)}.csv"`);

  return new NextResponse(csv, { status: 200, headers });
}
