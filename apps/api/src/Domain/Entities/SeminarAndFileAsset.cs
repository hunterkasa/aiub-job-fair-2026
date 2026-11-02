using AIUB.JobFair.Domain.Common;
using AIUB.JobFair.Domain.Enums;

namespace AIUB.JobFair.Domain.Entities;

public class Seminar : BaseEntity
{
    public required string Title { get; set; }
    public required string Description { get; set; }
    public DateTime StartsAtUtc { get; set; }
    public string Venue { get; set; } = "AIUB Campus";
    public int? Capacity { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<SeminarRegistration> Registrations { get; set; } = new List<SeminarRegistration>();
}

public class SeminarRegistration : BaseEntity
{
    public Guid SeminarId { get; set; }
    public Seminar? Seminar { get; set; }

    public Guid StudentId { get; set; }
    public StudentProfile? Student { get; set; }
}

public class FileAsset : BaseEntity
{
    public required string StorageKey { get; set; }
    public required string OriginalName { get; set; }
    public required string ContentType { get; set; }
    public long SizeBytes { get; set; }
    public FileKind Kind { get; set; }
    public Guid OwnerUserId { get; set; }
}
