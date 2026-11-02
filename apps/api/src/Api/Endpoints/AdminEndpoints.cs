using AIUB.JobFair.Application.Common.Interfaces;
using AIUB.JobFair.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace AIUB.JobFair.Api.Endpoints;

public record RejectEmployerRequest(string Reason);
public record UpdateEventSettingRequest(string Key, string Value);

public static class AdminEndpoints
{
    public static RouteGroupBuilder MapAdminEndpoints(this RouteGroupBuilder group)
    {
        group.RequireAuthorization(policy => policy.RequireRole(UserRole.Admin.ToString()));

        group.MapGet("/stats", async (IAdminService adminService, CancellationToken ct) =>
        {
            var stats = await adminService.GetStatsAsync(ct);
            return Results.Ok(stats);
        })
        .WithName("GetAdminStats");

        group.MapGet("/employers", async (
            [FromQuery] ApprovalStatus? status,
            IAdminService adminService,
            CancellationToken ct) =>
        {
            var employers = await adminService.GetEmployersAsync(status, ct);
            return Results.Ok(employers);
        })
        .WithName("GetAdminEmployers");

        group.MapPost("/employers/{id:guid}/approve", async (
            Guid id,
            IAdminService adminService,
            CancellationToken ct) =>
        {
            var success = await adminService.ApproveEmployerAsync(id, ct);
            return success ? Results.Ok(new { message = "Employer approved successfully" }) : Results.NotFound();
        })
        .WithName("ApproveEmployer");

        group.MapPost("/employers/{id:guid}/reject", async (
            Guid id,
            [FromBody] RejectEmployerRequest request,
            IAdminService adminService,
            CancellationToken ct) =>
        {
            var success = await adminService.RejectEmployerAsync(id, request.Reason, ct);
            return success ? Results.Ok(new { message = "Employer rejected" }) : Results.NotFound();
        })
        .WithName("RejectEmployer");

        group.MapGet("/students", async (
            [FromQuery] string? q,
            [FromQuery] int? page,
            [FromQuery] int? pageSize,
            IAdminService adminService,
            CancellationToken ct) =>
        {
            var students = await adminService.GetStudentsAsync(q, page ?? 1, pageSize ?? 50, ct);
            return Results.Ok(students);
        })
        .WithName("GetAdminStudents");

        group.MapGet("/students/export-csv", async (IAdminService adminService, CancellationToken ct) =>
        {
            var csvBytes = await adminService.ExportStudentsCsvAsync(ct);
            return Results.File(csvBytes, "text/csv", $"aiub_students_{DateTime.UtcNow:yyyyMMdd_HHmm}.csv");
        })
        .WithName("ExportStudentsCsv");

        group.MapGet("/applications/export-csv", async (IAdminService adminService, CancellationToken ct) =>
        {
            var csvBytes = await adminService.ExportApplicationsCsvAsync(ct);
            return Results.File(csvBytes, "text/csv", $"aiub_applications_{DateTime.UtcNow:yyyyMMdd_HHmm}.csv");
        })
        .WithName("ExportApplicationsCsv");

        group.MapPut("/event-settings", async (
            [FromBody] UpdateEventSettingRequest request,
            IAdminService adminService,
            CancellationToken ct) =>
        {
            await adminService.UpdateEventSettingAsync(request.Key, request.Value, ct);
            return Results.Ok(new { message = "Event setting updated" });
        })
        .WithName("UpdateEventSetting");

        return group;
    }
}
