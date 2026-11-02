using AIUB.JobFair.Domain.Enums;

namespace AIUB.JobFair.Application.Features.Auth.Dtos;

public record StudentRegisterRequest(
    string FullName,
    string AiubId,
    string Email,
    string Mobile,
    string Password,
    JobType PreferredJobType,
    StudyLevel StudyLevel,
    List<Guid>? PreferredIndustryIds,
    bool AttendsSeminar,
    List<Guid>? SeminarIds,
    string? Gender,
    string? Address
);

public record EmployerRegisterRequest(
    string CompanyName,
    string WebsiteUrl,
    Guid IndustryId,
    string ShortIntro,
    string? About,
    string HrName,
    string HrEmail,
    string HrMobile,
    string Password
);

public record LoginRequest(
    string Email,
    string Password
);

public record VerifyEmailRequest(
    string Email,
    string Token
);

public record ResendVerificationRequest(
    string Email
);

public record AuthUserDto(
    Guid Id,
    string Email,
    string Role,
    string DisplayName,
    bool EmailConfirmed,
    bool IsApproved
);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    AuthUserDto User
);
