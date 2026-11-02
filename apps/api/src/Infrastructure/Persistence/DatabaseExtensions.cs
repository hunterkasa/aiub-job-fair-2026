using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AIUB.JobFair.Infrastructure.Persistence;

public static class DatabaseExtensions
{
    public static IServiceCollection AddConfiguredDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var provider = configuration["Database:Provider"] ?? "PostgreSql";
        var connectionString = configuration.GetConnectionString("Default");

        services.AddDbContext<AppDbContext>(options =>
        {
            if (string.Equals(provider, "SqlServer", StringComparison.OrdinalIgnoreCase))
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly("Infrastructure.Migrations.SqlServer");
                });
            }
            else
            {
                // Default to PostgreSQL
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsAssembly("Infrastructure.Migrations.PostgreSql");
                });
            }
        });

        services.AddScoped<Application.Common.Interfaces.IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());

        return services;
    }
}
