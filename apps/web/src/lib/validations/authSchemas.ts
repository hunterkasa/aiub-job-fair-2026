import { z } from "zod";

export const studentRegisterSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters").max(150),
  aiubId: z
    .string()
    .regex(/^\d{2}-\d{5}-[1-3]$/, "AIUB ID must match standard format XX-XXXXX-X (e.g. 21-45678-1)"),
  email: z
    .string()
    .email("Enter a valid email address")
    .refine((val) => val.toLowerCase().endsWith("@student.aiub.edu"), {
      message: "Students must register with an official @student.aiub.edu email",
    }),
  mobile: z
    .string()
    .regex(/^(?:\+?8801|01)[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number (e.g. 017XXXXXXXX)"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  preferredJobType: z.enum(["FULL_TIME", "INTERNSHIP"]).default("FULL_TIME"),
  studyLevel: z.enum(["ONGOING", "GRADUATED"]).default("ONGOING"),
  preferredIndustryIds: z.array(z.string()).optional(),
  attendsSeminar: z.boolean().default(false),
  seminarIds: z.array(z.string()).optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
});

export const employerRegisterSchema = z.object({
  companyName: z.string().min(2, "Company Name is required").max(150),
  websiteUrl: z.string().url("Enter a valid website URL").optional().or(z.literal("")),
  industryId: z.string().min(1, "Please select an industry type"),
  shortIntro: z.string().min(10, "Provide a short intro of at least 10 characters").max(500),
  about: z.string().optional(),
  hrName: z.string().min(2, "HR Contact Name is required"),
  hrEmail: z.string().email("Enter a valid HR email address"),
  hrMobile: z.string().regex(/^(?:\+?8801|01)[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

export const jobPostSchema = z.object({
  positionName: z.string().min(2, "Position Name is required"),
  postType: z.enum(["OPENING", "CANDIDATE_CRITERIA"]).default("OPENING"),
  location: z.string().default("Dhaka"),
  workplace: z.enum(["OFFICE", "REMOTE", "ONLINE"]).default("OFFICE"),
  employmentStatus: z.enum(["FULL_TIME", "PART_TIME", "CONTRACTUAL", "INTERNSHIP"]).default("FULL_TIME"),
  educationRequirement: z.string().optional(),
  additionalRequirements: z.string().optional(),
  responsibilities: z.string().optional(),
  skillsAndExpertise: z.string().optional(),
  salaryMode: z.string().default("Negotiable"),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  compensationBenefits: z.string().default("As per company policy"),
  question1: z.string().optional(),
  question2: z.string().optional(),
  deadlineUtc: z.string().optional(), // ISO date
});

export const applyJobSchema = z.object({
  jobPostId: z.string().optional(), // null for CV drop
  cvFileId: z.string().min(1, "CV is required"),
  joiningOption: z.enum(["IMMEDIATELY", "WITHIN_1_WEEK", "WITHIN_15_DAYS", "WITHIN_1_MONTH"]),
  answer1: z.string().optional(),
  answer2: z.string().optional(),
});
