using AIUB.JobFair.Domain.Common;

namespace AIUB.JobFair.Domain.Entities;

public class EventSetting : BaseEntity
{
    public required string Key { get; set; }
    public required string Value { get; set; }
    public string? Description { get; set; }
}
