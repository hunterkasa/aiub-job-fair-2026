import { cookies, headers } from "next/headers";
import { verifyToken, TokenPayload } from "./jwt";
import prisma from "../db/prisma";

export async function getCurrentUser(): Promise<(TokenPayload & { displayName: string; isApproved?: boolean }) | null> {
  let token: string | undefined;

  // 1. Check Cookie
  const cookieStore = await cookies();
  token = cookieStore.get("access_token")?.value;

  // 2. Check Authorization Header if cookie not found
  if (!token) {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Verify user is active in DB
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      studentProfile: true,
      company: true,
    },
  });

  if (!user || !user.isActive) return null;

  let displayName = user.email;
  let isApproved = true;

  if (user.role === "STUDENT" && user.studentProfile) {
    displayName = user.studentProfile.fullName;
  } else if (user.role === "EMPLOYER" && user.company) {
    displayName = user.company.name;
    isApproved = user.company.approvalStatus === "APPROVED";
  } else if (user.role === "ADMIN") {
    displayName = "Administrator";
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    displayName,
    isApproved,
  };
}
