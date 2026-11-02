import bcrypt from "bcryptjs";
import prisma from "../db/prisma";

export async function ensureDatabaseSeeded(): Promise<void> {
  // 1. Seed Admin User
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || "jobfair.admin@aiub.edu";
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "AiubAdmin2026!Secure";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail.toLowerCase() },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: "ADMIN",
        emailConfirmed: true,
        isActive: true,
      },
    });
    console.log(`[Seed] Created admin account: ${adminEmail}`);
  }

  // 2. Seed Industries
  const industryCount = await prisma.industry.count();
  if (industryCount === 0) {
    const industries = [
      "IT, Software & Telecommunications",
      "Banking, Finance & Fintech",
      "Manufacturing & Heavy Engineering",
      "Pharmaceuticals & Healthcare",
      "FMCG, Retail & E-Commerce",
      "Education, Research & EdTech",
      "Construction, Architecture & Real Estate",
      "Logistics, Supply Chain & Aviation",
      "Media, Advertising & Creative Design",
      "Power, Energy & Renewable Resources",
      "NGO, Development & Public Sector",
    ];

    for (let i = 0; i < industries.length; i++) {
      await prisma.industry.create({
        data: {
          name: industries[i],
          sortOrder: i + 1,
          isActive: true,
        },
      });
    }
    console.log("[Seed] Seeded 11 industries.");
  }

  // 3. Seed Event Settings (Dhaka is UTC+6; Dec 5 23:59:59 Dhaka = Dec 5 17:59:59 UTC)
  const defaultSettings: Record<string, string> = {
    StudentRegistrationDeadlineUtc: "2026-12-05T17:59:59Z",
    EmployerRegistrationDeadlineUtc: "2026-12-12T17:59:59Z",
    RegistrationOpen: "true",
    AnnouncementBanner: "AIUB Job Fair 2026 registration is officially live. Let's Build Your Future Together!",
    RequireJobPostApproval: "false",
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    const exists = await prisma.eventSetting.findUnique({ where: { key } });
    if (!exists) {
      await prisma.eventSetting.create({
        data: {
          key,
          value,
          description: `Event setting for ${key}`,
        },
      });
    }
  }

  // 4. Seed Seminars
  const seminarCount = await prisma.seminar.count();
  if (seminarCount === 0) {
    await prisma.seminar.createMany({
      data: [
        {
          title: "Navigating Modern Tech Careers: From University to Global Impact",
          description: "Keynote seminar featuring alumni industry leaders discussing software engineering, cloud architecture, and competitive placement.",
          startsAtUtc: new Date("2026-12-06T04:00:00Z"), // 10:00 AM Dhaka
          venue: "AIUB Auditorium",
          capacity: 300,
          isActive: true,
        },
        {
          title: "Corporate Grooming & Acing High-Stake Technical Interviews",
          description: "Interactive workshop on professional CV tailoring, behavioral interview mastery, and technical screening assessment.",
          startsAtUtc: new Date("2026-12-06T08:00:00Z"), // 2:00 PM Dhaka
          venue: "AIUB Multipurpose Hall",
          capacity: 200,
          isActive: true,
        },
      ],
    });
    console.log("[Seed] Seeded 2 seminars.");
  }

  // 5. Seed Fallback Psychometric Assessment (Section 7A: IPIP Big Five 20 items)
  const assessmentCount = await prisma.assessmentSet.count();
  if (assessmentCount === 0) {
    const assessmentSet = await prisma.assessmentSet.create({
      data: {
        name: "IPIP Big-Five Personality Scale (Short Form 20-item)",
        version: 1,
        sourceNote: "International Personality Item Pool (ipip.ori.org) public domain instrument. Verified stand-in fallback.",
        isActive: true,
      },
    });

    const categories = ["Extraversion", "Agreeableness", "Conscientiousness", "Emotional Stability", "Openness"];

    for (const cat of categories) {
      await prisma.assessmentBand.createMany({
        data: [
          { setId: assessmentSet.id, category: cat, minScore: 4, maxScore: 10, label: "Low" },
          { setId: assessmentSet.id, category: cat, minScore: 11, maxScore: 15, label: "Medium" },
          { setId: assessmentSet.id, category: cat, minScore: 16, maxScore: 20, label: "High" },
        ],
      });
    }

    const items = [
      { text: "I am the life of the party.", category: "Extraversion", isReverseKeyed: false },
      { text: "I don't talk a lot.", category: "Extraversion", isReverseKeyed: true },
      { text: "I talk to a lot of different people at parties.", category: "Extraversion", isReverseKeyed: false },
      { text: "I keep in the background.", category: "Extraversion", isReverseKeyed: true },

      { text: "I sympathize with others' feelings.", category: "Agreeableness", isReverseKeyed: false },
      { text: "I am not interested in other people's problems.", category: "Agreeableness", isReverseKeyed: true },
      { text: "I have a soft heart.", category: "Agreeableness", isReverseKeyed: false },
      { text: "I feel little concern for others.", category: "Agreeableness", isReverseKeyed: true },

      { text: "I am always prepared.", category: "Conscientiousness", isReverseKeyed: false },
      { text: "I leave my belongings around.", category: "Conscientiousness", isReverseKeyed: true },
      { text: "I pay attention to details.", category: "Conscientiousness", isReverseKeyed: false },
      { text: "I make a mess of things.", category: "Conscientiousness", isReverseKeyed: true },

      { text: "I am relaxed most of the time.", category: "Emotional Stability", isReverseKeyed: false },
      { text: "I get stressed out easily.", category: "Emotional Stability", isReverseKeyed: true },
      { text: "I seldom feel blue.", category: "Emotional Stability", isReverseKeyed: false },
      { text: "I worry about things.", category: "Emotional Stability", isReverseKeyed: true },

      { text: "I have a vivid imagination.", category: "Openness", isReverseKeyed: false },
      { text: "I am not interested in abstract ideas.", category: "Openness", isReverseKeyed: true },
      { text: "I have excellent ideas.", category: "Openness", isReverseKeyed: false },
      { text: "I do not have a good imagination.", category: "Openness", isReverseKeyed: true },
    ];

    for (let i = 0; i < items.length; i++) {
      const q = await prisma.assessmentQuestion.create({
        data: {
          setId: assessmentSet.id,
          text: items[i].text,
          category: items[i].category,
          isReverseKeyed: items[i].isReverseKeyed,
          type: "Likert",
          sortOrder: i + 1,
          isActive: true,
        },
      });

      await prisma.assessmentOption.createMany({
        data: [
          { questionId: q.id, text: "Very Inaccurate", value: 1 },
          { questionId: q.id, text: "Moderately Inaccurate", value: 2 },
          { questionId: q.id, text: "Neither Accurate Nor Inaccurate", value: 3 },
          { questionId: q.id, text: "Moderately Accurate", value: 4 },
          { questionId: q.id, text: "Very Accurate", value: 5 },
        ],
      });
    }

    console.log("[Seed] Seeded IPIP Big-Five 20-item assessment instrument.");
  }
}
