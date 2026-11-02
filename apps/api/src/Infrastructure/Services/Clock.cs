using AIUB.JobFair.Application.Common.Interfaces;

namespace AIUB.JobFair.Infrastructure.Services;

public class Clock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
}
