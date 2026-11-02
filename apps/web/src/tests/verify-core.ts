import { isValidPdf, isValidImage, MAX_PDF_SIZE_BYTES } from "../lib/services/storageService";
import { signAccessToken, verifyToken } from "../lib/auth/jwt";
import { studentRegisterSchema, employerRegisterSchema } from "../lib/validations/authSchemas";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

async function runTests() {
  console.log("=== Running AIUB Job Fair 2026 Core Logic Verification ===");

  // 1. File Upload Magic Byte Tests
  const validPdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]);
  const fakePdfBuffer = Buffer.from("NOT_A_REAL_PDF_JUST_TEXT");
  assert(isValidPdf(validPdfBuffer), "isValidPdf correctly identifies %PDF magic bytes");
  assert(!isValidPdf(fakePdfBuffer), "isValidPdf rejects text files spoofed as PDF");

  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  const fakePngBuffer = Buffer.from([0x00, 0x00, 0x00, 0x00]);
  assert(isValidImage(validPngBuffer), "isValidImage correctly identifies PNG magic bytes");
  assert(!isValidImage(fakePngBuffer), "isValidImage rejects non-image bytes");

  // 2. JWT Sign & Verify Tests
  const testPayload = {
    userId: "test-user-123",
    email: "20-12345-1@student.aiub.edu",
    role: "STUDENT" as const,
  };
  const token = signAccessToken(testPayload);
  assert(typeof token === "string" && token.length > 20, "signAccessToken generates valid JWT string");

  const verified = verifyToken(token);
  assert(verified !== null, "verifyToken decodes valid JWT");
  assert(verified?.userId === "test-user-123", "verifyToken preserves userId claim");
  assert(verified?.role === "STUDENT", "verifyToken preserves role claim");

  const invalidTokenResult = verifyToken("invalid.tampered.token");
  assert(invalidTokenResult === null, "verifyToken rejects invalid/tampered token");

  // 3. AIUB Student Email Zod Schema Validation
  const validStudent = {
    fullName: "Tahmid Hasan",
    aiubId: "20-43210-1",
    email: "20-43210-1@student.aiub.edu",
    password: "Password123!",
    mobile: "01712345678",
  };
  const validStudentResult = studentRegisterSchema.safeParse(validStudent);
  assert(validStudentResult.success, "studentRegisterSchema accepts valid @student.aiub.edu email and 20-43210-1 ID");

  const invalidEmailStudent = {
    fullName: "External Person",
    aiubId: "20-11111-1",
    email: "attacker@gmail.com",
    password: "Password123!",
    mobile: "01712345678",
  };
  const invalidEmailResult = studentRegisterSchema.safeParse(invalidEmailStudent);
  assert(!invalidEmailResult.success, "studentRegisterSchema strictly rejects non-student email (e.g. gmail.com)");

  const invalidIdStudent = {
    fullName: "Invalid ID",
    aiubId: "999-NOT-VALID",
    email: "99-99999-1@student.aiub.edu",
    password: "Password123!",
    mobile: "01712345678",
  };
  const invalidIdResult = studentRegisterSchema.safeParse(invalidIdStudent);
  assert(!invalidIdResult.success, "studentRegisterSchema strictly validates AIUB ID pattern (XX-XXXXX-X)");

  // 4. Employer Registration Zod Schema Validation
  const validEmployer = {
    companyName: "Brain Station 23",
    industryId: "c87e2b14-8f20-4a81-9988-abcdef123456",
    hrName: "Sarah Khan",
    hrEmail: "hr@brainstation-23.com",
    hrMobile: "01700000000",
    password: "CompanyPassword123!",
    shortIntro: "Leading software development and cloud solutions provider in Bangladesh.",
    websiteUrl: "https://brainstation-23.com",
  };
  const employerResult = employerRegisterSchema.safeParse(validEmployer);
  assert(employerResult.success, "employerRegisterSchema accepts valid employer payload");

  // 5. Psychometric Domain Scoring & Band Calculation Logic
  // Big Five domains: Extraversion, Agreeableness, Conscientiousness, Emotional Stability, Openness
  const calculateBand = (rawScore: number, minScore: number, maxScore: number): string => {
    const range = maxScore - minScore;
    const third = range / 3;
    if (rawScore < minScore + third) return "Low";
    if (rawScore < minScore + 2 * third) return "Moderate";
    return "High";
  };

  assert(calculateBand(5, 4, 20) === "Low", "Band calculation classifies lower score into Low");
  assert(calculateBand(12, 4, 20) === "Moderate", "Band calculation classifies middle score into Moderate");
  assert(calculateBand(19, 4, 20) === "High", "Band calculation classifies upper score into High");

  console.log("=== All Core Logic Assertions Passed Cleanly! ===");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
