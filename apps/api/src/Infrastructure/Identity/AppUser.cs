using Microsoft.AspNetCore.Identity;

namespace AIUB.JobFair.Infrastructure.Identity;

public class AppUser : IdentityUser<Guid>
{
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
