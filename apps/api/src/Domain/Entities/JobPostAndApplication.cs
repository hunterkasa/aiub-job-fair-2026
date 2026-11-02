using AIUB.JobFair.Domain.Common;
using AIUB.JobFair.Domain.Enums;

namespace AIUB.JobFair.Domain.Entities;

public class JobPost : BaseEntity
{
    public Guid CompanyId { get; set; }
    public Company? Company { get; set; }

    public PostType PostType { get; set; } = PostType.Opening;
    public required string PositionName { get; set; }
    public string Location { get; set; } = "Dhaka"; // 8 Divisions + Anywhere in Bangladesh
    public WorkplaceType Workplace { get; set; } = WorkplaceType.Office;
    public string? EducationRequirement { get; set; }
    public string? AdditionalRequirements { get; set; }
    public string? Responsibilities { get; set; }
    public string? SkillsAndExpertise { get; set; }
    public EmploymentStatus EmploymentStatus { get; set; } = EmploymentStatus.FullTime;
    public string SalaryMode { get; set; } = "Negotiable"; // Negotiable | Amount | Range
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? CompensationBenefits { get; set; } = "As per company policy";
    public string? Question1 { get; set; }
    public string? Question2 { get; set; }
    public DateTime? DeadlineUtc { get; set; }
    public JobPostStatus Status { get; set; } = JobPostStatus.Published;

    public ICollection<Application> Applications { get; set; } = new List<Application>();
}

public class Application : BaseEntity
{
    public Guid StudentId { get; set; }
    public StudentProfile? Student { get; set; }

    public Guid? JobPostId { get; set; }
    public JobPost? JobPost { get; set; }

    public Guid CvFileId { get; set; }
    public JoiningOption JoiningOption { get; set; } = JoiningOption.Immediately;
    public string? Answer1 { get; set; }
    public string? Answer2 { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;
}
