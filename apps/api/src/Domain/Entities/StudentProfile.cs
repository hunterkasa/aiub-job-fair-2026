using AIUB.JobFair.Domain.Common;
using AIUB.JobFair.Domain.Enums;

namespace AIUB.JobFair.Domain.Entities;

public class StudentProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public required string FullName { get; set; }
    public required string AiubId { get; set; }
    public required string Mobile { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public Guid? ProfilePhotoFileId { get; set; }
    public JobType PreferredJobType { get; set; } = JobType.FullTime;
    public StudyLevel StudyLevel { get; set; } = StudyLevel.Ongoing;
    public string? LinkedInUrl { get; set; }
    public string? GitHubUrl { get; set; }
    public string? ExtracurricularText { get; set; }
    public Guid? DefaultCvFileId { get; set; }
    public bool AttendsSeminar { get; set; } = false;
    public DateTime? ConsentAcceptedAtUtc { get; set; }

    public ICollection<StudentPreferredIndustry> PreferredIndustries { get; set; } = new List<StudentPreferredIndustry>();
    public ICollection<EducationRecord> Educations { get; set; } = new List<EducationRecord>();
    public ICollection<ExperienceRecord> Experiences { get; set; } = new List<ExperienceRecord>();
    public ICollection<ReferenceRecord> References { get; set; } = new List<ReferenceRecord>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}

public class StudentPreferredIndustry
{
    public Guid StudentId { get; set; }
    public StudentProfile? Student { get; set; }

    public Guid IndustryId { get; set; }
    public Industry? Industry { get; set; }
}
