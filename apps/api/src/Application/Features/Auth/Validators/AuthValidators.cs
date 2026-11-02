using System.Text.RegularExpressions;
using AIUB.JobFair.Application.Features.Auth.Dtos;
using FluentValidation;
using Microsoft.Extensions.Configuration;

namespace AIUB.JobFair.Application.Features.Auth.Validators;

public class StudentRegisterValidator : AbstractValidator<StudentRegisterRequest>
{
    public StudentRegisterValidator(IConfiguration configuration)
    {
        var allowedDomainsConfig = configuration["Student:AllowedEmailDomains"] ?? "student.aiub.edu";
        var allowedDomains = allowedDomainsConfig.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full Name is required")
            .MaximumLength(150).WithMessage("Full Name must not exceed 150 characters");

        RuleFor(x => x.AiubId)
            .NotEmpty().WithMessage("AIUB Student ID is required")
            .Matches(@"^\d{2}-\d{5}-[1-3]$").WithMessage("AIUB Student ID must follow format XX-XXXXX-X (e.g. 21-45678-1)");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("A valid email address is required")
            .Must(email =>
            {
                if (string.IsNullOrWhiteSpace(email)) return false;
                var domain = email.Split('@').LastOrDefault()?.ToLowerInvariant();
                return allowedDomains.Any(d => string.Equals(d, domain, StringComparison.OrdinalIgnoreCase));
            }).WithMessage($"Students must register using an official university email ending with ({string.Join(", ", allowedDomains)})");

        RuleFor(x => x.Mobile)
            .NotEmpty().WithMessage("Mobile number is required")
            .Matches(@"^(?:\+?8801|01)[3-9]\d{8}$").WithMessage("Enter a valid Bangladeshi mobile number (e.g. 017XXXXXXXX)");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long");
    }
}

public class EmployerRegisterValidator : AbstractValidator<EmployerRegisterRequest>
{
    public EmployerRegisterValidator()
    {
        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Company Name is required")
            .MaximumLength(150).WithMessage("Company Name must not exceed 150 characters");

        RuleFor(x => x.IndustryId)
            .NotEmpty().WithMessage("Please select an Industry Type");

        RuleFor(x => x.ShortIntro)
            .NotEmpty().WithMessage("A short introduction of the company is required")
            .MaximumLength(500).WithMessage("Short introduction must not exceed 500 characters");

        RuleFor(x => x.HrName)
            .NotEmpty().WithMessage("HR contact person name is required");

        RuleFor(x => x.HrEmail)
            .NotEmpty().WithMessage("HR email is required")
            .EmailAddress().WithMessage("Valid HR email is required");

        RuleFor(x => x.HrMobile)
            .NotEmpty().WithMessage("HR mobile number is required")
            .Matches(@"^(?:\+?8801|01)[3-9]\d{8}$").WithMessage("Enter a valid Bangladeshi mobile number");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long");
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}
