using AIUB.JobFair.Application.Features.Auth.Dtos;
using AIUB.JobFair.Application.Features.Auth.Validators;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace AIUB.JobFair.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IValidator<StudentRegisterRequest>, StudentRegisterValidator>();
        services.AddScoped<IValidator<EmployerRegisterRequest>, EmployerRegisterValidator>();
        services.AddScoped<IValidator<LoginRequest>, LoginRequestValidator>();

        return services;
    }
}
