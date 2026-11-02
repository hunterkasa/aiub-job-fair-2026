using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AIUB.JobFair.Application.Common.Interfaces;
using AIUB.JobFair.Application.Features.Auth.Dtos;
using AIUB.JobFair.Domain.Entities;
using AIUB.JobFair.Domain.Enums;
using AIUB.JobFair.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AIUB.JobFair.Api.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private SqliteConnection? _connection;

    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var dbContextDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (dbContextDescriptor != null)
            {
                services.Remove(dbContextDescriptor);
            }

            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlite(_connection);
            });

            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        _connection?.Dispose();
    }
}

public class AuthAndLookupIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AuthAndLookupIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetDivisions_ReturnsAllBangladeshDivisions()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/v1/lookups/divisions");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var divisions = await response.Content.ReadFromJsonAsync<List<string>>();
        Assert.NotNull(divisions);
        Assert.Contains("Dhaka", divisions);
        Assert.Contains("Chattogram", divisions);
        Assert.Contains("Sylhet", divisions);
        Assert.Contains("Barishal", divisions);
        Assert.Contains("Khulna", divisions);
        Assert.Contains("Rajshahi", divisions);
        Assert.Contains("Rangpur", divisions);
        Assert.Contains("Mymensingh", divisions);
        Assert.Contains("Anywhere in Bangladesh", divisions);
    }

    [Fact]
    public async Task RegisterStudent_WithNonAiubEmail_IsRejected()
    {
        var client = _factory.CreateClient();
        var request = new StudentRegisterRequest(
            FullName: "Test Student",
            AiubId: "22-12345-2",
            Email: "student@gmail.com",
            Mobile: "01712345678",
            Password: "Password123!",
            PreferredJobType: JobType.FullTime,
            StudyLevel: StudyLevel.Ongoing,
            PreferredIndustryIds: null,
            AttendsSeminar: false,
            SeminarIds: null,
            Gender: "Male",
            Address: "Kuril, Dhaka"
        );

        var response = await client.PostAsJsonAsync("/api/v1/auth/register/student", request);
        Assert.True(response.StatusCode == HttpStatusCode.BadRequest || response.StatusCode == HttpStatusCode.InternalServerError);
    }

    [Fact]
    public async Task RegisterStudent_WithValidAiubStudent_Succeeds()
    {
        var client = _factory.CreateClient();
        var request = new StudentRegisterRequest(
            FullName: "Rahim Chowdhury",
            AiubId: "21-44332-1",
            Email: "21-44332-1@student.aiub.edu",
            Mobile: "01812345678",
            Password: "Password123!",
            PreferredJobType: JobType.FullTime,
            StudyLevel: StudyLevel.Graduated,
            PreferredIndustryIds: null,
            AttendsSeminar: true,
            SeminarIds: null,
            Gender: "Male",
            Address: "Banani, Dhaka"
        );

        var response = await client.PostAsJsonAsync("/api/v1/auth/register/student", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(result);
        Assert.NotEmpty(result.AccessToken);
        Assert.Equal("Rahim Chowdhury", result.User.DisplayName);
        Assert.Equal("Student", result.User.Role);
    }

    [Fact]
    public async Task RegisterEmployer_CreatesPendingAccount()
    {
        var client = _factory.CreateClient();

        var industries = await client.GetFromJsonAsync<List<LookupDto>>("/api/v1/lookups/industries");
        var industryId = industries?.FirstOrDefault()?.Id ?? Guid.NewGuid();

        var request = new EmployerRegisterRequest(
            CompanyName: "Brain Station 23 Ltd.",
            WebsiteUrl: "https://brainstation-23.com",
            IndustryId: industryId,
            ShortIntro: "Leading software development and IT consulting firm.",
            About: "We build digital banking, enterprise, and cloud solutions.",
            HrName: "Ayesha Siddiqua",
            HrEmail: "hr@brainstation-23.com",
            HrMobile: "01912345678",
            Password: "CompanyPassword123!"
        );

        var response = await client.PostAsJsonAsync("/api/v1/auth/register/employer", request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        Assert.NotNull(result);
        Assert.Equal("Employer", result.User.Role);
        Assert.False(result.User.IsApproved);
    }

    [Fact]
    public async Task AdminEndpoint_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/v1/admin/stats");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
