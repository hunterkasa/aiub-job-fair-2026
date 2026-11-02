import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { saveFileLocally, validateMagicBytes } from "@/lib/services/storageService";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kind = (formData.get("kind") as string)?.toUpperCase(); // CV, PHOTO, LOGO

    if (!file || !kind) {
      return NextResponse.json({ message: "File and kind (CV, PHOTO, LOGO) are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (kind === "CV") {
      // Limit 5 MB
      if (buffer.length > 5 * 1024 * 1024) {
        return NextResponse.json({ message: "CV file size must not exceed 5 MB." }, { status: 400 });
      }
      if (!validateMagicBytes(buffer, "pdf")) {
        return NextResponse.json({ message: "Invalid file type. CV must be a valid PDF document." }, { status: 400 });
      }
    } else if (kind === "PHOTO" || kind === "LOGO") {
      // Limit 2 MB
      if (buffer.length > 2 * 1024 * 1024) {
        return NextResponse.json({ message: "Image file size must not exceed 2 MB." }, { status: 400 });
      }
      if (!validateMagicBytes(buffer, "image")) {
        return NextResponse.json({ message: "Invalid file type. Image must be JPG, PNG, or WEBP." }, { status: 400 });
      }
    } else {
      return NextResponse.json({ message: "Invalid file kind." }, { status: 400 });
    }

    const storageKey = await saveFileLocally(buffer, file.name);

    const asset = await prisma.fileAsset.create({
      data: {
        storageKey,
        originalName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: BigInt(buffer.length),
        kind: kind as any,
        ownerUserId: user.userId,
        fileData: buffer,
      },
    });

    // If student CV or photo, attach to student profile
    if (user.role === "STUDENT") {
      if (kind === "CV") {
        await prisma.studentProfile.updateMany({
          where: { userId: user.userId },
          data: { defaultCvFileId: asset.id },
        });
      } else if (kind === "PHOTO") {
        await prisma.studentProfile.updateMany({
          where: { userId: user.userId },
          data: { profilePhotoFileId: asset.id },
        });
      }
    } else if (user.role === "EMPLOYER" && kind === "LOGO") {
      await prisma.company.updateMany({
        where: { ownerUserId: user.userId },
        data: { logoFileId: asset.id },
      });
    }

    return NextResponse.json({
      id: asset.id,
      storageKey: asset.storageKey,
      originalName: asset.originalName,
      sizeBytes: Number(asset.sizeBytes),
      kind: asset.kind,
      url: `/api/v1/files/${asset.id}`,
    });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
