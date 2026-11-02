import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getFileBuffer } from "@/lib/services/storageService";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const asset = await prisma.fileAsset.findUnique({
    where: { id },
  });

  if (!asset) {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }

  // Authorization check for CV documents:
  if (asset.kind === "CV") {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let hasAccess = false;
    // 1. Owner access
    if (asset.ownerUserId === user.userId) {
      hasAccess = true;
    }
    // 2. Admin access
    else if (user.role === "ADMIN") {
      hasAccess = true;
    }
    // 3. Employer access: only if student applied to employer's job
    else if (user.role === "EMPLOYER") {
      const company = await prisma.company.findUnique({
        where: { ownerUserId: user.userId },
      });
      if (company) {
        const student = await prisma.studentProfile.findFirst({
          where: { userId: asset.ownerUserId },
        });
        if (student) {
          const application = await prisma.application.findFirst({
            where: {
              studentId: student.id,
              jobPost: { companyId: company.id },
            },
          });
          if (application) {
            hasAccess = true;
          }
        }
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ message: "Forbidden: You do not have permission to view this CV." }, { status: 403 });
    }
  }

  let fileBuffer: Buffer | null = null;
  const fileData = await getFileBuffer(asset.storageKey);

  if (fileData?.buffer) {
    fileBuffer = fileData.buffer;
  } else if (asset.fileData) {
    fileBuffer = Buffer.from(asset.fileData);
  }

  if (!fileBuffer) {
    return NextResponse.json({ message: "File binary data missing from storage" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", asset.contentType);
  headers.set("Content-Disposition", `inline; filename="${asset.originalName}"`);

  return new NextResponse(fileBuffer as any, {
    status: 200,
    headers,
  });
}
