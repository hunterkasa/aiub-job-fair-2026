using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AIUB.JobFair.Api.Tests;

public class HealthEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public HealthEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task HealthLive_ReturnsOkWithLiveStatus()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/health/live");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(content);
        Assert.Equal("Live", jsonDoc.RootElement.GetProperty("status").GetString());
    }

    [Fact]
    public async Task SystemInfo_ReturnsOkWithExpectedEventTitle()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/v1/info");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        using var jsonDoc = JsonDocument.Parse(content);
        Assert.Equal("AIUB Job Fair 2026", jsonDoc.RootElement.GetProperty("eventTitle").GetString());
        Assert.Equal("Operational", jsonDoc.RootElement.GetProperty("status").GetString());
    }
}
