using AIUB.JobFair.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AIUB.JobFair.Infrastructure.Migrations.SqlServer;

public class SqlServerDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlServer(
            "Server=localhost;Database=aiub_jobfair;User Id=sa;Password=YourStrong(!)Password;TrustServerCertificate=True",
            b => b.MigrationsAssembly(typeof(SqlServerDbContextFactory).Assembly.FullName));

        return new AppDbContext(optionsBuilder.Options);
    }
}
