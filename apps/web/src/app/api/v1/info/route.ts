import { NextResponse } from "next/server";
import { ensureDatabaseSeeded } from "@/lib/services/seedService";

export async function GET() {
  try {
    // Attempt lazy seed on first request if needed
    ensureDatabaseSeeded().catch((err) => console.error("Auto-seed error:", err));
  } catch {}

  return NextResponse.json({
    eventTitle: "AIUB Job Fair 2026",
    tagline: "Let's Build Your Future Together",
    version: "2.0.0-nextjs",
    status: "Operational",
    serverTimeUtc: new Date().toISOString(),
  });
}
