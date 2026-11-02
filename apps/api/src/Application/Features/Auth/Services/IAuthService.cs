using AIUB.JobFair.Application.Features.Auth.Dtos;

namespace AIUB.JobFair.Application.Features.Auth.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterStudentAsync(StudentRegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RegisterEmployerAsync(EmployerRegisterRequest request, CancellationToken cancellationToken = default);
    Task<bool> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default);
    Task<bool> ResendVerificationEmailAsync(ResendVerificationRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthUserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
