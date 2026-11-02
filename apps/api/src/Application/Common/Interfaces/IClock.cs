namespace AIUB.JobFair.Application.Common.Interfaces;

public interface IClock
{
    DateTime UtcNow { get; }
}
