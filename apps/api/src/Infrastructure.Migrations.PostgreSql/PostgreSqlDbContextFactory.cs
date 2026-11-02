using AIUB.JobFair.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AIUB.JobFair.Infrastructure.Migrations.PostgreSql;

public class PostgreSqlDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(
            "Host=localhost;Database=aiub_jobfair;Username=postgres;Password=postgres",
            b => b.MigrationsAssembly(typeof(PostgreSqlDbContextFactory).Assembly.FullName));

        return new AppDbContext(optionsBuilder.Options);
    }
}
