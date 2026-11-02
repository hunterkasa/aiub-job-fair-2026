using AIUB.JobFair.Application.Common.Interfaces;
using AIUB.JobFair.Application.Features.Auth.Dtos;
using AIUB.JobFair.Application.Features.Auth.Services;
using AIUB.JobFair.Domain.Entities;
using AIUB.JobFair.Domain.Enums;
using AIUB.JobFair.Infrastructure.Identity;
using AIUB.JobFair.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AIUB.JobFair.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly AppDbContext _dbContext;
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly IEmailSender _emailSender;
    private readonly IValidator<StudentRegisterRequest> _studentValidator;
    private readonly IValidator<EmployerRegisterRequest> _employerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        AppDbContext dbContext,
        IJwtTokenGenerator jwtGenerator,
        IEmailSender emailSender,
        IValidator<StudentRegisterRequest> studentValidator,
        IValidator<EmployerRegisterRequest> employerValidator,
        IValidator<LoginRequest> loginValidator,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _dbContext = dbContext;
        _jwtGenerator = jwtGenerator;
        _emailSender = emailSender;
        _studentValidator = studentValidator;
        _employerValidator = employerValidator;
        _loginValidator = loginValidator;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterStudentAsync(StudentRegisterRequest request, CancellationToken cancellationToken = default)
    {
        await _studentValidator.ValidateAndThrowAsync(request, cancellationToken);

        // Check registration deadline
        await CheckDeadlineAsync("StudentRegistrationDeadlineUtc", "Student registration has closed.", cancellationToken);

        // Check unique AIUB Student ID
        var existingStudent = await _dbContext.StudentProfiles
            .AnyAsync(s => s.AiubId == request.AiubId.Trim(), cancellationToken);
        if (existingStudent)
        {
            throw new InvalidOperationException($"An account with AIUB Student ID '{request.AiubId}' already exists.");
        }

        // Check existing user email
        var existingUser = await _userManager.FindByEmailAsync(request.Email.Trim().ToLowerInvariant());
        if (existingUser != null)
        {
            throw new InvalidOperationException($"An account with email '{request.Email}' already exists.");
        }

        // Ensure Student role exists
        if (!await _roleManager.RoleExistsAsync(UserRole.Student.ToString()))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(UserRole.Student.ToString()));
        }

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Email.Trim().ToLowerInvariant(),
            Email = request.Email.Trim().ToLowerInvariant(),
            EmailConfirmed = false,
            IsActive = true
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create user account: {errors}");
        }

        await _userManager.AddToRoleAsync(user, UserRole.Student.ToString());

        var studentProfile = new StudentProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            FullName = request.FullName.Trim(),
            AiubId = request.AiubId.Trim(),
            Mobile = request.Mobile.Trim(),
            Gender = request.Gender,
            Address = request.Address,
            PreferredJobType = request.PreferredJobType,
            StudyLevel = request.StudyLevel,
            AttendsSeminar = request.AttendsSeminar
        };

        if (request.PreferredIndustryIds != null && request.PreferredIndustryIds.Count > 0)
        {
            foreach (var indId in request.PreferredIndustryIds.Distinct())
            {
                studentProfile.PreferredIndustries.Add(new StudentPreferredIndustry
                {
                    StudentId = studentProfile.Id,
                    IndustryId = indId
                });
            }
        }

        if (request.AttendsSeminar && request.SeminarIds != null)
        {
            foreach (var semId in request.SeminarIds.Distinct())
            {
                _dbContext.SeminarRegistrations.Add(new SeminarRegistration
                {
                    Id = Guid.NewGuid(),
                    SeminarId = semId,
                    StudentId = studentProfile.Id
                });
            }
        }

        _dbContext.StudentProfiles.Add(studentProfile);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Generate email verification token & send email
        var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var verificationUrl = $"/verify-email?email={Uri.EscapeDataString(user.Email)}&token={Uri.EscapeDataString(emailToken)}";
        await _emailSender.SendEmailAsync(
            user.Email,
            "Verify your AIUB Job Fair 2026 Student Account",
            $"<h2>Welcome to AIUB Job Fair 2026, {studentProfile.FullName}!</h2><p>Please click the link below or enter your verification token to activate your account:</p><p><a href='{verificationUrl}'>Verify Account</a></p><p>Token: <code>{emailToken}</code></p>",
            cancellationToken);

        var token = _jwtGenerator.GenerateAccessToken(user.Id, user.Email, UserRole.Student.ToString());
        var refreshToken = _jwtGenerator.GenerateRefreshToken();

        return new AuthResponseDto(
            token,
            refreshToken,
            new AuthUserDto(user.Id, user.Email, UserRole.Student.ToString(), studentProfile.FullName, false, true)
        );
    }

    public async Task<AuthResponseDto> RegisterEmployerAsync(EmployerRegisterRequest request, CancellationToken cancellationToken = default)
    {
        await _employerValidator.ValidateAndThrowAsync(request, cancellationToken);

        // Check registration deadline
        await CheckDeadlineAsync("EmployerRegistrationDeadlineUtc", "Employer registration has closed.", cancellationToken);

        var existingUser = await _userManager.FindByEmailAsync(request.HrEmail.Trim().ToLowerInvariant());
        if (existingUser != null)
        {
            throw new InvalidOperationException($"An account with email '{request.HrEmail}' already exists.");
        }

        // Ensure Employer role exists
        if (!await _roleManager.RoleExistsAsync(UserRole.Employer.ToString()))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>(UserRole.Employer.ToString()));
        }

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            UserName = request.HrEmail.Trim().ToLowerInvariant(),
            Email = request.HrEmail.Trim().ToLowerInvariant(),
            EmailConfirmed = false,
            IsActive = true
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join("; ", createResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create employer account: {errors}");
        }

        await _userManager.AddToRoleAsync(user, UserRole.Employer.ToString());

        var company = new Company
        {
            Id = Guid.NewGuid(),
            OwnerUserId = user.Id,
            Name = request.CompanyName.Trim(),
            NormalizedName = request.CompanyName.Trim().ToLowerInvariant(),
            WebsiteUrl = request.WebsiteUrl,
            IndustryId = request.IndustryId,
            ShortIntro = request.ShortIntro.Trim(),
            About = request.About,
            HrName = request.HrName.Trim(),
            HrEmail = request.HrEmail.Trim().ToLowerInvariant(),
            HrMobile = request.HrMobile.Trim(),
            ApprovalStatus = ApprovalStatus.Pending,
            RegistrationCompleted = true
        };

        _dbContext.Companies.Add(company);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Generate email verification token & send email
        var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var verificationUrl = $"/verify-email?email={Uri.EscapeDataString(user.Email)}&token={Uri.EscapeDataString(emailToken)}";
        await _emailSender.SendEmailAsync(
            user.Email,
            "Verify your Employer Account — AIUB Job Fair 2026",
            $"<h2>Welcome {company.Name}!</h2><p>Please verify your email address below. Note that an administrator will also review your company profile before your job posts become publicly visible.</p><p><a href='{verificationUrl}'>Verify Account</a></p><p>Token: <code>{emailToken}</code></p>",
            cancellationToken);

        var token = _jwtGenerator.GenerateAccessToken(user.Id, user.Email, UserRole.Employer.ToString());
        var refreshToken = _jwtGenerator.GenerateRefreshToken();

        return new AuthResponseDto(
            token,
            refreshToken,
            new AuthUserDto(user.Id, user.Email, UserRole.Employer.ToString(), company.Name, false, false)
        );
    }

    public async Task<bool> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email.Trim().ToLowerInvariant());
        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        var result = await _userManager.ConfirmEmailAsync(user, request.Token);
        return result.Succeeded;
    }

    public async Task<bool> ResendVerificationEmailAsync(ResendVerificationRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email.Trim().ToLowerInvariant());
        if (user == null || user.EmailConfirmed)
        {
            return true; // Avoid leaking email presence
        }

        var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var verificationUrl = $"/verify-email?email={Uri.EscapeDataString(user.Email!)}&token={Uri.EscapeDataString(emailToken)}";
        await _emailSender.SendEmailAsync(
            user.Email!,
            "Verify your Account — AIUB Job Fair 2026",
            $"<p>Click below to verify your email address:</p><p><a href='{verificationUrl}'>Verify Account</a></p>",
            cancellationToken);

        return true;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        await _loginValidator.ValidateAndThrowAsync(request, cancellationToken);

        var user = await _userManager.FindByEmailAsync(request.Email.Trim().ToLowerInvariant());
        if (user == null || !user.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? UserRole.Student.ToString();

        string displayName = user.Email!;
        bool isApproved = true;

        if (role == UserRole.Student.ToString())
        {
            var student = await _dbContext.StudentProfiles.FirstOrDefaultAsync(s => s.UserId == user.Id, cancellationToken);
            if (student != null) displayName = student.FullName;
        }
        else if (role == UserRole.Employer.ToString())
        {
            var company = await _dbContext.Companies.FirstOrDefaultAsync(c => c.OwnerUserId == user.Id, cancellationToken);
            if (company != null)
            {
                displayName = company.Name;
                isApproved = company.ApprovalStatus == ApprovalStatus.Approved;
            }
        }
        else if (role == UserRole.Admin.ToString())
        {
            displayName = "Administrator";
        }

        var token = _jwtGenerator.GenerateAccessToken(user.Id, user.Email!, role);
        var refreshToken = _jwtGenerator.GenerateRefreshToken();

        return new AuthResponseDto(
            token,
            refreshToken,
            new AuthUserDto(user.Id, user.Email!, role, displayName, user.EmailConfirmed, isApproved)
        );
    }

    public async Task<AuthUserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || !user.IsActive) return null;

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? UserRole.Student.ToString();

        string displayName = user.Email!;
        bool isApproved = true;

        if (role == UserRole.Student.ToString())
        {
            var student = await _dbContext.StudentProfiles.FirstOrDefaultAsync(s => s.UserId == user.Id, cancellationToken);
            if (student != null) displayName = student.FullName;
        }
        else if (role == UserRole.Employer.ToString())
        {
            var company = await _dbContext.Companies.FirstOrDefaultAsync(c => c.OwnerUserId == user.Id, cancellationToken);
            if (company != null)
            {
                displayName = company.Name;
                isApproved = company.ApprovalStatus == ApprovalStatus.Approved;
            }
        }
        else if (role == UserRole.Admin.ToString())
        {
            displayName = "Administrator";
        }

        return new AuthUserDto(user.Id, user.Email!, role, displayName, user.EmailConfirmed, isApproved);
    }

    private async Task CheckDeadlineAsync(string deadlineKey, string closedMessage, CancellationToken cancellationToken)
    {
        var setting = await _dbContext.EventSettings.FirstOrDefaultAsync(s => s.Key == deadlineKey, cancellationToken);
        if (setting != null && DateTime.TryParse(setting.Value, out var deadlineUtc))
        {
            if (DateTime.UtcNow > deadlineUtc)
            {
                throw new InvalidOperationException(closedMessage);
            }
        }
    }
}
