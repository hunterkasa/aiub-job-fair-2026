using System.Text;
using AIUB.JobFair.Application.Common.Interfaces;
using AIUB.JobFair.Domain.Enums;
using AIUB.JobFair.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AIUB.JobFair.Infrastructure.Services;

public class LookupService : ILookupService
{
    private readonly AppDbContext _dbContext;

    private static readonly List<string> BangladeshDivisions =
    [
        "Barishal",
        "Chattogram",
        "Dhaka",
        "Khulna",
        "Mymensingh",
        "Rajshahi",
        "Rangpur",
        "Sylhet",
        "Anywhere in Bangladesh"
    ];

    public LookupService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<LookupDto>> GetIndustriesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Industries
            .AsNoTracking()
            .Where(i => i.IsActive)
            .OrderBy(i => i.SortOrder)
            .ThenBy(i => i.Name)
            .Select(i => new LookupDto(i.Id, i.Name))
            .ToListAsync(cancellationToken);
    }

    public Task<List<string>> GetDivisionsAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(BangladeshDivisions);
    }

    public async Task<List<SeminarDto>> GetSeminarsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Seminars
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.StartsAtUtc)
            .Select(s => new SeminarDto(s.Id, s.Title, s.Description, s.StartsAtUtc, s.Venue, s.Capacity))
            .ToListAsync(cancellationToken);
    }

    public async Task<Dictionary<string, string>> GetEventSettingsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.EventSettings
            .AsNoTracking()
            .ToDictionaryAsync(s => s.Key, s => s.Value, cancellationToken);
    }
}

public class AdminService : IAdminService
{
    private readonly AppDbContext _dbContext;

    public AdminService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AdminStatsDto> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var totalStudents = await _dbContext.StudentProfiles.CountAsync(cancellationToken);
        var totalEmployers = await _dbContext.Companies.CountAsync(cancellationToken);
        var pendingApprovals = await _dbContext.Companies.CountAsync(c => c.ApprovalStatus == ApprovalStatus.Pending, cancellationToken);
        var totalJobPosts = await _dbContext.JobPosts.CountAsync(cancellationToken);
        var totalApplications = await _dbContext.Applications.CountAsync(cancellationToken);
        var totalSeminars = await _dbContext.Seminars.CountAsync(cancellationToken);

        return new AdminStatsDto(
            totalStudents,
            totalEmployers,
            pendingApprovals,
            totalJobPosts,
            totalApplications,
            totalSeminars
        );
    }

    public async Task<List<AdminEmployerDto>> GetEmployersAsync(ApprovalStatus? status, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Companies
            .AsNoTracking()
            .Include(c => c.Industry)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(c => c.ApprovalStatus == status.Value);
        }

        return await query
            .OrderByDescending(c => c.CreatedAtUtc)
            .Select(c => new AdminEmployerDto(
                c.Id,
                c.OwnerUserId,
                c.Name,
                c.WebsiteUrl,
                c.Industry != null ? c.Industry.Name : "General",
                c.ShortIntro,
                c.About,
                c.HrName,
                c.HrEmail,
                c.HrMobile,
                c.ApprovalStatus,
                c.RejectionReason,
                c.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ApproveEmployerAsync(Guid companyId, CancellationToken cancellationToken = default)
    {
        var company = await _dbContext.Companies.FirstOrDefaultAsync(c => c.Id == companyId, cancellationToken);
        if (company == null) return false;

        company.ApprovalStatus = ApprovalStatus.Approved;
        company.RejectionReason = null;
        company.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> RejectEmployerAsync(Guid companyId, string reason, CancellationToken cancellationToken = default)
    {
        var company = await _dbContext.Companies.FirstOrDefaultAsync(c => c.Id == companyId, cancellationToken);
        if (company == null) return false;

        company.ApprovalStatus = ApprovalStatus.Rejected;
        company.RejectionReason = reason;
        company.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<List<AdminStudentDto>> GetStudentsAsync(string? query, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var q = _dbContext.StudentProfiles.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var lowerQuery = query.Trim().ToLowerInvariant();
            q = q.Where(s => s.FullName.ToLower().Contains(lowerQuery) || s.AiubId.ToLower().Contains(lowerQuery));
        }

        return await q
            .OrderByDescending(s => s.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new AdminStudentDto(
                s.Id,
                s.UserId,
                s.FullName,
                s.AiubId,
                s.Mobile,
                s.Mobile,
                s.Gender,
                s.PreferredJobType.ToString(),
                s.StudyLevel.ToString(),
                s.AttendsSeminar,
                s.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<byte[]> ExportStudentsCsvAsync(CancellationToken cancellationToken = default)
    {
        var students = await _dbContext.StudentProfiles
            .AsNoTracking()
            .OrderBy(s => s.AiubId)
            .ToListAsync(cancellationToken);

        var csv = new StringBuilder();
        csv.AppendLine("AIUB_ID,FullName,Mobile,JobType,StudyLevel,AttendsSeminar,RegisteredAtUtc");

        foreach (var s in students)
        {
            csv.AppendLine($"\"{EscapeCsv(s.AiubId)}\",\"{EscapeCsv(s.FullName)}\",\"{EscapeCsv(s.Mobile)}\",\"{s.PreferredJobType}\",\"{s.StudyLevel}\",\"{s.AttendsSeminar}\",\"{s.CreatedAtUtc:yyyy-MM-dd HH:mm:ss}\"");
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public async Task<byte[]> ExportApplicationsCsvAsync(CancellationToken cancellationToken = default)
    {
        var applications = await _dbContext.Applications
            .AsNoTracking()
            .Include(a => a.Student)
            .Include(a => a.JobPost)
            .ThenInclude(j => j!.Company)
            .OrderByDescending(a => a.SubmittedAtUtc)
            .ToListAsync(cancellationToken);

        var csv = new StringBuilder();
        csv.AppendLine("Student_AIUB_ID,Student_Name,Company_Name,Position_Name,Joining_Option,Status,SubmittedAtUtc");

        foreach (var a in applications)
        {
            var studentId = a.Student?.AiubId ?? "";
            var studentName = a.Student?.FullName ?? "";
            var companyName = a.JobPost?.Company?.Name ?? "General CV Drop";
            var position = a.JobPost?.PositionName ?? "General CV Drop";

            csv.AppendLine($"\"{EscapeCsv(studentId)}\",\"{EscapeCsv(studentName)}\",\"{EscapeCsv(companyName)}\",\"{EscapeCsv(position)}\",\"{a.JoiningOption}\",\"{a.Status}\",\"{a.SubmittedAtUtc:yyyy-MM-dd HH:mm:ss}\"");
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    public async Task<bool> UpdateEventSettingAsync(string key, string value, CancellationToken cancellationToken = default)
    {
        var setting = await _dbContext.EventSettings.FirstOrDefaultAsync(s => s.Key == key, cancellationToken);
        if (setting == null)
        {
            _dbContext.EventSettings.Add(new Domain.Entities.EventSetting
            {
                Id = Guid.NewGuid(),
                Key = key,
                Value = value,
                UpdatedAtUtc = DateTime.UtcNow
            });
        }
        else
        {
            setting.Value = value;
            setting.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static string EscapeCsv(string value)
    {
        return value.Replace("\"", "\"\"");
    }
}
