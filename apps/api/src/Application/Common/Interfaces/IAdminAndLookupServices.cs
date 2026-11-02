using AIUB.JobFair.Domain.Entities;
using AIUB.JobFair.Domain.Enums;

namespace AIUB.JobFair.Application.Common.Interfaces;

public record LookupDto(Guid Id, string Name);
public record SeminarDto(Guid Id, string Title, string Description, DateTime StartsAtUtc, string Venue, int? Capacity);
public record AdminStatsDto(
    int TotalStudents,
    int TotalEmployers,
    int PendingEmployerApprovals,
    int TotalJobPosts,
    int TotalApplications,
    int TotalSeminars
);

public record AdminEmployerDto(
    Guid Id,
    Guid OwnerUserId,
    string Name,
    string? WebsiteUrl,
    string IndustryName,
    string ShortIntro,
    string? About,
    string HrName,
    string HrEmail,
    string HrMobile,
    ApprovalStatus ApprovalStatus,
    string? RejectionReason,
    DateTime CreatedAtUtc
);

public record AdminStudentDto(
    Guid Id,
    Guid UserId,
    string FullName,
    string AiubId,
    string Email,
    string Mobile,
    string? Gender,
    string PreferredJobType,
    string StudyLevel,
    bool AttendsSeminar,
    DateTime CreatedAtUtc
);

public interface ILookupService
{
    Task<List<LookupDto>> GetIndustriesAsync(CancellationToken cancellationToken = default);
    Task<List<string>> GetDivisionsAsync(CancellationToken cancellationToken = default);
    Task<List<SeminarDto>> GetSeminarsAsync(CancellationToken cancellationToken = default);
    Task<Dictionary<string, string>> GetEventSettingsAsync(CancellationToken cancellationToken = default);
}

public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync(CancellationToken cancellationToken = default);
    Task<List<AdminEmployerDto>> GetEmployersAsync(ApprovalStatus? status, CancellationToken cancellationToken = default);
    Task<bool> ApproveEmployerAsync(Guid companyId, CancellationToken cancellationToken = default);
    Task<bool> RejectEmployerAsync(Guid companyId, string reason, CancellationToken cancellationToken = default);
    Task<List<AdminStudentDto>> GetStudentsAsync(string? query, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<byte[]> ExportStudentsCsvAsync(CancellationToken cancellationToken = default);
    Task<byte[]> ExportApplicationsCsvAsync(CancellationToken cancellationToken = default);
    Task<bool> UpdateEventSettingAsync(string key, string value, CancellationToken cancellationToken = default);
}
