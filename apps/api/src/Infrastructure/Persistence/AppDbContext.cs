using AIUB.JobFair.Application.Common.Interfaces;
using AIUB.JobFair.Domain.Entities;
using AIUB.JobFair.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AIUB.JobFair.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>, IUnitOfWork
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<EventSetting> EventSettings => Set<EventSetting>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure EventSetting
        builder.Entity<EventSetting>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.Key).IsRequired().HasMaxLength(128);
            b.Property(e => e.Value).IsRequired();
            b.HasIndex(e => e.Key).IsUnique();
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Domain.Common.BaseEntity && 
                        (e.State == EntityState.Added || e.State == EntityState.Modified));

        var now = DateTime.UtcNow;
        foreach (var entry in entries)
        {
            var entity = (Domain.Common.BaseEntity)entry.Entity;
            entity.UpdatedAtUtc = now;
            if (entry.State == EntityState.Added)
            {
                entity.CreatedAtUtc = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
