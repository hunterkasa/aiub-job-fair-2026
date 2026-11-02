import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.userId,
      userId: user.userId,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      isApproved: user.isApproved,
    },
    ...user,
  });
}
