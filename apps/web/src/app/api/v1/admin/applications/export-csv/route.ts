import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    include: {
      student: true,
      jobPost: { include: { company: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  const lines = [
    "Student_AIUB_ID,Student_Name,Student_Mobile,Company_Name,Position_Name,Joining_Option,Status,SubmittedAtUtc",
  ];

  for (const a of applications) {
    const aiubId = (a.student?.aiubId || "").replace(/"/g, '""');
    const name = (a.student?.fullName || "").replace(/"/g, '""');
    const mobile = (a.student?.mobile || "").replace(/"/g, '""');
    const company = (a.jobPost?.company?.name || "General CV Drop").replace(/"/g, '""');
    const position = (a.jobPost?.positionName || "General CV Drop").replace(/"/g, '""');
    lines.push(
      `"${aiubId}","${name}","${mobile}","${company}","${position}","${a.joiningOption}","${a.status}","${a.submittedAt.toISOString()}"`
    );
  }

  const csv = lines.join("\n");
  const headers = new Headers();
  headers.set("Content-Type", "text/csv; charset=utf-8");
  headers.set("Content-Disposition", `attachment; filename="aiub_applications_${new Date().toISOString().slice(0, 10)}.csv"`);

  return new NextResponse(csv, { status: 200, headers });
}
