using AIUB.JobFair.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AIUB.JobFair.Application.Tests;

public class DatabaseSwitchTests
{
    [Fact]
    public void AddConfiguredDatabase_WithPostgreSqlConfig_RegistersNpgsqlProvider()
    {
        // Arrange
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:Provider"] = "PostgreSql",
                ["ConnectionStrings:Default"] = "Host=localhost;Database=testdb;Username=test;Password=test"
            })
            .Build();

        var services = new ServiceCollection();

        // Act
        services.AddConfiguredDatabase(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Assert
        Assert.NotNull(dbContext);
        Assert.Equal("Npgsql.EntityFrameworkCore.PostgreSQL", dbContext.Database.ProviderName);
    }

    [Fact]
    public void AddConfiguredDatabase_WithSqlServerConfig_RegistersSqlServerProvider()
    {
        // Arrange
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:Provider"] = "SqlServer",
                ["ConnectionStrings:Default"] = "Server=localhost;Database=testdb;User Id=sa;Password=test;TrustServerCertificate=True"
            })
            .Build();

        var services = new ServiceCollection();

        // Act
        services.AddConfiguredDatabase(configuration);
        var serviceProvider = services.BuildServiceProvider();
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Assert
        Assert.NotNull(dbContext);
        Assert.Equal("Microsoft.EntityFrameworkCore.SqlServer", dbContext.Database.ProviderName);
    }
}
