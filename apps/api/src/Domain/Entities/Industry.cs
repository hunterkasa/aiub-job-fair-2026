using AIUB.JobFair.Domain.Common;

namespace AIUB.JobFair.Domain.Entities;

public class Industry : BaseEntity
{
    public required string Name { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;
}
