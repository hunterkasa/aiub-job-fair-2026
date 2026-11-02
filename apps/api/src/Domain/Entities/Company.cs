using AIUB.JobFair.Domain.Common;
using AIUB.JobFair.Domain.Enums;

namespace AIUB.JobFair.Domain.Entities;

public class Company : BaseEntity
{
    public Guid OwnerUserId { get; set; }
    public required string Name { get; set; }
    public string? NormalizedName { get; set; }
    public string? WebsiteUrl { get; set; }
    public Guid IndustryId { get; set; }
    public Industry? Industry { get; set; }
    public Guid? LogoFileId { get; set; }
    public required string ShortIntro { get; set; }
    public string? About { get; set; }
    public required string HrName { get; set; }
    public required string HrEmail { get; set; }
    public required string HrMobile { get; set; }
    public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;
    public string? RejectionReason { get; set; }
    public bool RegistrationCompleted { get; set; } = false;

    public ICollection<JobPost> JobPosts { get; set; } = new List<JobPost>();
}
