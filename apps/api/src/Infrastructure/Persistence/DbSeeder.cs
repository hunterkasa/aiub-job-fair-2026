using AIUB.JobFair.Domain.Entities;
using AIUB.JobFair.Domain.Enums;
using AIUB.JobFair.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AIUB.JobFair.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(
        AppDbContext context,
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IConfiguration configuration,
        ILogger logger)
    {
        // 1. Ensure Roles Exist
        var roles = new[] { UserRole.Admin.ToString(), UserRole.Employer.ToString(), UserRole.Student.ToString() };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
                logger.LogInformation("Seeded role: {Role}", role);
            }
        }

        // 2. Seed Initial Admin Account
        var adminEmail = configuration["ADMIN_INITIAL_EMAIL"] ?? "jobfair.admin@aiub.edu";
        var adminPassword = configuration["ADMIN_INITIAL_PASSWORD"] ?? "AiubAdmin2026!Secure";

        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new AppUser
            {
                Id = Guid.NewGuid(),
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
                IsActive = true
            };

            var result = await userManager.CreateAsync(adminUser, adminPassword);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(adminUser, UserRole.Admin.ToString());
                logger.LogInformation("Seeded initial admin user: {AdminEmail}", adminEmail);
            }
            else
            {
                logger.LogWarning("Failed to seed admin user: {Errors}", string.Join("; ", result.Errors.Select(e => e.Description)));
            }
        }

        // 3. Seed Industries
        if (!await context.Industries.AnyAsync())
        {
            var industryNames = new[]
            {
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
                "NGO, Development & Public Sector"
            };

            var order = 1;
            foreach (var name in industryNames)
            {
                context.Industries.Add(new Industry
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    IsActive = true,
                    SortOrder = order++
                });
            }
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded initial industries.");
        }

        // 4. Seed Event Settings (Asia/Dhaka = UTC+6)
        // 5 Dec 2026 23:59:59 Dhaka = 17:59:59 UTC
        // 12 Dec 2026 23:59:59 Dhaka = 17:59:59 UTC
        var defaultSettings = new Dictionary<string, string>
        {
            ["StudentRegistrationDeadlineUtc"] = "2026-12-05T17:59:59Z",
            ["EmployerRegistrationDeadlineUtc"] = "2026-12-12T17:59:59Z",
            ["RegistrationOpen"] = "true",
            ["AnnouncementBanner"] = "AIUB Job Fair 2026 registration is officially live. Let's Build Your Future Together!"
        };

        foreach (var (key, val) in defaultSettings)
        {
            if (!await context.EventSettings.AnyAsync(s => s.Key == key))
            {
                context.EventSettings.Add(new EventSetting
                {
                    Id = Guid.NewGuid(),
                    Key = key,
                    Value = val,
                    Description = $"Default event setting for {key}"
                });
            }
        }
        await context.SaveChangesAsync();

        // 5. Seed Initial Seminars
        if (!await context.Seminars.AnyAsync())
        {
            context.Seminars.AddRange(
                new Seminar
                {
                    Id = Guid.NewGuid(),
                    Title = "Navigating Modern Tech Careers: From University to Global Impact",
                    Description = "Keynote seminar featuring alumni industry leaders discussing software engineering, cloud architecture, and competitive placement.",
                    StartsAtUtc = new DateTime(2026, 12, 6, 4, 0, 0, DateTimeKind.Utc), // 10:00 AM Dhaka
                    Venue = "AIUB Auditorium",
                    Capacity = 300,
                    IsActive = true
                },
                new Seminar
                {
                    Id = Guid.NewGuid(),
                    Title = "Corporate Grooming & Acing High-Stake Technical Interviews",
                    Description = "Interactive workshop on professional CV tailoring, behavioral interview mastery, and technical screening assessment.",
                    StartsAtUtc = new DateTime(2026, 12, 6, 8, 0, 0, DateTimeKind.Utc), // 2:00 PM Dhaka
                    Venue = "AIUB Multipurpose Hall",
                    Capacity = 200,
                    IsActive = true
                }
            );
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded initial seminars.");
        }

        // 6. Seed Fallback Psychometric Assessment (Section 7A: IPIP Big Five 20-item Short Form)
        if (!await context.AssessmentSets.AnyAsync())
        {
            var assessmentSet = new AssessmentSet
            {
                Id = Guid.NewGuid(),
                Name = "IPIP Big-Five Personality Scale (Short Form 20-item)",
                Version = 1,
                SourceNote = "International Personality Item Pool (ipip.ori.org) public domain instrument. Verified stand-in fallback.",
                IsActive = true
            };
            context.AssessmentSets.Add(assessmentSet);

            var categories = new[] { "Extraversion", "Agreeableness", "Conscientiousness", "Emotional Stability", "Openness" };

            // Seed Scoring Bands for each category
            foreach (var cat in categories)
            {
                context.AssessmentBands.AddRange(
                    new AssessmentBand { Id = Guid.NewGuid(), SetId = assessmentSet.Id, Category = cat, MinScore = 4, MaxScore = 10, Label = "Low" },
                    new AssessmentBand { Id = Guid.NewGuid(), SetId = assessmentSet.Id, Category = cat, MinScore = 11, MaxScore = 15, Label = "Medium" },
                    new AssessmentBand { Id = Guid.NewGuid(), SetId = assessmentSet.Id, Category = cat, MinScore = 16, MaxScore = 20, Label = "High" }
                );
            }

            // 20 IPIP items: 4 per domain
            var items = new (string Text, string Category, bool IsReverse)[]
            {
                // Extraversion
                ("I am the life of the party.", "Extraversion", false),
                ("I don't talk a lot.", "Extraversion", true),
                ("I talk to a lot of different people at parties.", "Extraversion", false),
                ("I keep in the background.", "Extraversion", true),

                // Agreeableness
                ("I sympathize with others' feelings.", "Agreeableness", false),
                ("I am not interested in other people's problems.", "Agreeableness", true),
                ("I have a soft heart.", "Agreeableness", false),
                ("I feel little concern for others.", "Agreeableness", true),

                // Conscientiousness
                ("I am always prepared.", "Conscientiousness", false),
                ("I leave my belongings around.", "Conscientiousness", true),
                ("I pay attention to details.", "Conscientiousness", false),
                ("I make a mess of things.", "Conscientiousness", true),

                // Emotional Stability
                ("I am relaxed most of the time.", "Emotional Stability", false),
                ("I get stressed out easily.", "Emotional Stability", true),
                ("I seldom feel blue.", "Emotional Stability", false),
                ("I worry about things.", "Emotional Stability", true),

                // Openness
                ("I have a vivid imagination.", "Openness", false),
                ("I am not interested in abstract ideas.", "Openness", true),
                ("I have excellent ideas.", "Openness", false),
                ("I do not have a good imagination.", "Openness", true),
            };

            var sort = 1;
            foreach (var item in items)
            {
                var q = new AssessmentQuestion
                {
                    Id = Guid.NewGuid(),
                    SetId = assessmentSet.Id,
                    Text = item.Text,
                    Category = item.Category,
                    Type = "Likert",
                    IsReverseKeyed = item.IsReverse,
                    IsActive = true,
                    SortOrder = sort++
                };

                // Standard 5-point Likert options
                q.Options.Add(new AssessmentOption { Id = Guid.NewGuid(), QuestionId = q.Id, Text = "Very Inaccurate", Value = 1 });
                q.Options.Add(new AssessmentOption { Id = Guid.NewGuid(), QuestionId = q.Id, Text = "Moderately Inaccurate", Value = 2 });
                q.Options.Add(new AssessmentOption { Id = Guid.NewGuid(), QuestionId = q.Id, Text = "Neither Accurate Nor Inaccurate", Value = 3 });
                q.Options.Add(new AssessmentOption { Id = Guid.NewGuid(), QuestionId = q.Id, Text = "Moderately Accurate", Value = 4 });
                q.Options.Add(new AssessmentOption { Id = Guid.NewGuid(), QuestionId = q.Id, Text = "Very Accurate", Value = 5 });

                context.AssessmentQuestions.Add(q);
            }

            await context.SaveChangesAsync();
            logger.LogInformation("Seeded IPIP Big-Five 20-item fallback assessment instrument.");
        }
    }
}
