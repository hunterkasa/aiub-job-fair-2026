using AIUB.JobFair.Application.Common.Interfaces;
using AIUB.JobFair.Domain.Common;
using AIUB.JobFair.Domain.Entities;
using AIUB.JobFair.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace AIUB.JobFair.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>, IUnitOfWork
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<StudentPreferredIndustry> StudentPreferredIndustries => Set<StudentPreferredIndustry>();
    public DbSet<Industry> Industries => Set<Industry>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<EducationRecord> EducationRecords => Set<EducationRecord>();
    public DbSet<ExperienceRecord> ExperienceRecords => Set<ExperienceRecord>();
    public DbSet<ReferenceRecord> ReferenceRecords => Set<ReferenceRecord>();
    public DbSet<JobPost> JobPosts => Set<JobPost>();
    public DbSet<Domain.Entities.Application> Applications => Set<Domain.Entities.Application>();
    public DbSet<Seminar> Seminars => Set<Seminar>();
    public DbSet<SeminarRegistration> SeminarRegistrations => Set<SeminarRegistration>();
    public DbSet<FileAsset> FileAssets => Set<FileAsset>();
    public DbSet<AssessmentSet> AssessmentSets => Set<AssessmentSet>();
    public DbSet<AssessmentQuestion> AssessmentQuestions => Set<AssessmentQuestion>();
    public DbSet<AssessmentOption> AssessmentOptions => Set<AssessmentOption>();
    public DbSet<AssessmentBand> AssessmentBands => Set<AssessmentBand>();
    public DbSet<AssessmentAttempt> AssessmentAttempts => Set<AssessmentAttempt>();
    public DbSet<AssessmentAnswer> AssessmentAnswers => Set<AssessmentAnswer>();
    public DbSet<AssessmentResult> AssessmentResults => Set<AssessmentResult>();
    public DbSet<EventSetting> EventSettings => Set<EventSetting>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Store all Enums as strings for cross-database portability
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType.IsEnum)
                {
                    var type = typeof(EnumToStringConverter<>).MakeGenericType(property.ClrType);
                    var converter = Activator.CreateInstance(type, new object?[] { null }) as ValueConverter;
                    property.SetValueConverter(converter);
                }
            }
        }

        // StudentProfile
        builder.Entity<StudentProfile>(b =>
        {
            b.HasKey(s => s.Id);
            b.HasIndex(s => s.AiubId).IsUnique();
            b.HasIndex(s => s.UserId).IsUnique();
            b.Property(s => s.FullName).IsRequired().HasMaxLength(200);
            b.Property(s => s.AiubId).IsRequired().HasMaxLength(50);
            b.Property(s => s.Mobile).IsRequired().HasMaxLength(30);
        });

        // StudentPreferredIndustry (Many-to-many)
        builder.Entity<StudentPreferredIndustry>(b =>
        {
            b.HasKey(spi => new { spi.StudentId, spi.IndustryId });
            b.HasOne(spi => spi.Student)
                .WithMany(s => s.PreferredIndustries)
                .HasForeignKey(spi => spi.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(spi => spi.Industry)
                .WithMany()
                .HasForeignKey(spi => spi.IndustryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Company
        builder.Entity<Company>(b =>
        {
            b.HasKey(c => c.Id);
            b.HasIndex(c => c.OwnerUserId).IsUnique();
            b.HasIndex(c => c.NormalizedName);
            b.Property(c => c.Name).IsRequired().HasMaxLength(200);
            b.Property(c => c.HrName).IsRequired().HasMaxLength(150);
            b.Property(c => c.HrEmail).IsRequired().HasMaxLength(150);
            b.Property(c => c.HrMobile).IsRequired().HasMaxLength(30);
            b.HasOne(c => c.Industry)
                .WithMany()
                .HasForeignKey(c => c.IndustryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // EducationRecord
        builder.Entity<EducationRecord>(b =>
        {
            b.HasKey(e => e.Id);
            b.HasOne(e => e.Student)
                .WithMany(s => s.Educations)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ExperienceRecord
        builder.Entity<ExperienceRecord>(b =>
        {
            b.HasKey(e => e.Id);
            b.HasOne(e => e.Student)
                .WithMany(s => s.Experiences)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ReferenceRecord
        builder.Entity<ReferenceRecord>(b =>
        {
            b.HasKey(r => r.Id);
            b.HasOne(r => r.Student)
                .WithMany(s => s.References)
                .HasForeignKey(r => r.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // JobPost
        builder.Entity<JobPost>(b =>
        {
            b.HasKey(j => j.Id);
            b.HasIndex(j => new { j.Status, j.DeadlineUtc, j.CompanyId });
            b.HasOne(j => j.Company)
                .WithMany(c => c.JobPosts)
                .HasForeignKey(j => j.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Application
        builder.Entity<Domain.Entities.Application>(b =>
        {
            b.HasKey(a => a.Id);
            b.HasIndex(a => new { a.StudentId, a.JobPostId });
            b.HasOne(a => a.Student)
                .WithMany(s => s.Applications)
                .HasForeignKey(a => a.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(a => a.JobPost)
                .WithMany(j => j.Applications)
                .HasForeignKey(a => a.JobPostId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // SeminarRegistration
        builder.Entity<SeminarRegistration>(b =>
        {
            b.HasKey(sr => new { sr.SeminarId, sr.StudentId });
            b.HasOne(sr => sr.Seminar)
                .WithMany(s => s.Registrations)
                .HasForeignKey(sr => sr.SeminarId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(sr => sr.Student)
                .WithMany()
                .HasForeignKey(sr => sr.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // EventSetting
        builder.Entity<EventSetting>(b =>
        {
            b.HasKey(e => e.Id);
            b.HasIndex(e => e.Key).IsUnique();
        });

        // Assessment entities
        builder.Entity<AssessmentAttempt>(b =>
        {
            b.HasKey(a => a.Id);
            b.HasIndex(a => new { a.StudentId, a.SetId });
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is BaseEntity && 
                        (e.State == EntityState.Added || e.State == EntityState.Modified));

        var now = DateTime.UtcNow;
        foreach (var entry in entries)
        {
            var entity = (BaseEntity)entry.Entity;
            entity.UpdatedAtUtc = now;
            if (entry.State == EntityState.Added)
            {
                entity.CreatedAtUtc = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
