using AIUB.JobFair.Api.Middleware;
using AIUB.JobFair.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure 12-factor Serilog logging to console
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// Add services
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Database configuration (PostgreSql by default, switchable to SqlServer)
builder.Services.AddConfiguredDatabase(builder.Configuration);

// Health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database", tags: ["ready"]);

// CORS configuration for local development and preview deployments
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        if (builder.Environment.IsDevelopment() || allowedOrigins.Length == 0)
        {
            policy.SetIsOriginAllowed(_ => true)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                  .SetIsOriginAllowedToAllowWildcardSubdomains()
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Global Exception Handling & Logging
app.UseExceptionHandler();
app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("DefaultCorsPolicy");

// Health Check Endpoints (Section 5.6)
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false, // Liveness check just confirms the process is alive
    ResponseWriter = async (context, _) =>
    {
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { status = "Live", timestampUtc = DateTime.UtcNow });
    }
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var isReady = report.Status == HealthStatus.Healthy;
        context.Response.StatusCode = isReady ? StatusCodes.Status200OK : StatusCodes.Status503ServiceUnavailable;
        await context.Response.WriteAsJsonAsync(new
        {
            status = report.Status.ToString(),
            duration = report.TotalDuration.TotalMilliseconds,
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                duration = e.Value.Duration.TotalMilliseconds
            }),
            timestampUtc = DateTime.UtcNow
        });
    }
});

// System Info Endpoint
app.MapGet("/api/v1/info", () => Results.Ok(new
{
    eventTitle = "AIUB Job Fair 2026",
    tagline = "Let's Build Your Future Together",
    version = "1.0.0-phase0",
    status = "Operational",
    serverTimeUtc = DateTime.UtcNow,
    documentation = "/openapi/v1.json"
}))
.WithName("GetSystemInfo")
.WithTags("System");

app.Run();

// Required for WebApplicationFactory in tests
public partial class Program { }
