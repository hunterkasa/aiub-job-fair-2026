import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Supported MIME types and max sizes
export const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

// Magic byte validation for CV (PDF) and Images (JPG, PNG, WebP)
export function isValidPdf(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  // %PDF -> 0x25, 0x50, 0x44, 0x46
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  );
}

export function isValidImage(buffer: Buffer): boolean {
  if (buffer.length < 8) return false;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer.length >= 12
  ) {
    if (
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return true;
    }
  }

  return false;
}

export function validateMagicBytes(buffer: Buffer, expectedType: "pdf" | "image"): boolean {
  if (expectedType === "pdf") return isValidPdf(buffer);
  if (expectedType === "image") return isValidImage(buffer);
  return false;
}

export async function saveFileLocally(buffer: Buffer, originalName: string): Promise<string> {
  if (!fs.existsSync(/*turbopackIgnore: true*/ UPLOAD_DIR)) {
    fs.mkdirSync(/*turbopackIgnore: true*/ UPLOAD_DIR, { recursive: true });
  }

  const ext = path.extname(originalName).toLowerCase();
  const storageKey = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, storageKey);

  await fs.promises.writeFile(/*turbopackIgnore: true*/ filePath, buffer);
  return storageKey;
}

export async function getFileBuffer(storageKey: string): Promise<{ buffer: Buffer; fileName: string } | null> {
  const safeName = path.basename(storageKey);
  const filePath = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, safeName);

  if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
    return null;
  }

  const buffer = await fs.promises.readFile(/*turbopackIgnore: true*/ filePath);
  return { buffer, fileName: safeName };
}
