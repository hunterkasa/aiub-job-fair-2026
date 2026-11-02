import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    // Check DB readiness by performing a lightweight query
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "Healthy",
      checks: [{ name: "database", status: "Healthy" }],
      timestampUtc: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "Unhealthy",
        error: error?.message || "Database connection failed",
        timestampUtc: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
