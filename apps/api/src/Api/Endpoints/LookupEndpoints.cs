using AIUB.JobFair.Application.Common.Interfaces;

namespace AIUB.JobFair.Api.Endpoints;

public static class LookupEndpoints
{
    public static RouteGroupBuilder MapLookupEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/industries", async (ILookupService lookupService, CancellationToken ct) =>
        {
            var industries = await lookupService.GetIndustriesAsync(ct);
            return Results.Ok(industries);
        })
        .WithName("GetIndustries");

        group.MapGet("/divisions", async (ILookupService lookupService, CancellationToken ct) =>
        {
            var divisions = await lookupService.GetDivisionsAsync(ct);
            return Results.Ok(divisions);
        })
        .WithName("GetDivisions");

        group.MapGet("/seminars", async (ILookupService lookupService, CancellationToken ct) =>
        {
            var seminars = await lookupService.GetSeminarsAsync(ct);
            return Results.Ok(seminars);
        })
        .WithName("GetSeminars");

        group.MapGet("/event-settings", async (ILookupService lookupService, CancellationToken ct) =>
        {
            var settings = await lookupService.GetEventSettingsAsync(ct);
            return Results.Ok(settings);
        })
        .WithName("GetEventSettings");

        return group;
    }
}
