using AIUB.JobFair.Domain.Common;
using AIUB.JobFair.Domain.Enums;

namespace AIUB.JobFair.Domain.Entities;

public class EducationRecord : BaseEntity
{
    public Guid StudentId { get; set; }
    public StudentProfile? Student { get; set; }
    public EducationLevel Level { get; set; }
    public required string InstitutionName { get; set; }
    public decimal? Cgpa { get; set; }
    public string? Subject { get; set; }
    public int? PassingYear { get; set; }
    public string? Notes { get; set; }
}

public class ExperienceRecord : BaseEntity
{
    public Guid StudentId { get; set; }
    public StudentProfile? Student { get; set; }
    public required string CompanyName { get; set; }
    public Guid? IndustryId { get; set; }
    public Industry? Industry { get; set; }
    public EmploymentStatus JobType { get; set; }
    public required string Designation { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsContinuous { get; set; } = false;
    public string? Responsibilities { get; set; }
}

public class ReferenceRecord : BaseEntity
{
    public Guid StudentId { get; set; }
    public StudentProfile? Student { get; set; }
    public required string Name { get; set; }
    public required string Designation { get; set; }
    public required string Organization { get; set; }
    public required string Email { get; set; }
    public required string Mobile { get; set; }
    public ReferenceRelation Relation { get; set; } = ReferenceRelation.Professional;
}
