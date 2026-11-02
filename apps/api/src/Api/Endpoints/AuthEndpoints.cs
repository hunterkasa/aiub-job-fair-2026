using AIUB.JobFair.Application.Common.Interfaces;
using AIUB.JobFair.Application.Features.Auth.Dtos;
using AIUB.JobFair.Application.Features.Auth.Services;
using Microsoft.AspNetCore.Mvc;

namespace AIUB.JobFair.Api.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/register/student", async (
            [FromBody] StudentRegisterRequest request,
            IAuthService authService,
            HttpContext httpContext,
            CancellationToken ct) =>
        {
            var result = await authService.RegisterStudentAsync(request, ct);
            SetAuthCookies(httpContext, result.AccessToken);
            return Results.Ok(result);
        })
        .WithName("RegisterStudent")
        .WithSummary("Registers a new AIUB student");

        group.MapPost("/register/employer", async (
            [FromBody] EmployerRegisterRequest request,
            IAuthService authService,
            HttpContext httpContext,
            CancellationToken ct) =>
        {
            var result = await authService.RegisterEmployerAsync(request, ct);
            SetAuthCookies(httpContext, result.AccessToken);
            return Results.Ok(result);
        })
        .WithName("RegisterEmployer")
        .WithSummary("Registers a new employer awaiting admin approval");

        group.MapPost("/login", async (
            [FromBody] LoginRequest request,
            IAuthService authService,
            HttpContext httpContext,
            CancellationToken ct) =>
        {
            var result = await authService.LoginAsync(request, ct);
            SetAuthCookies(httpContext, result.AccessToken);
            return Results.Ok(result);
        })
        .WithName("Login")
        .WithSummary("Authenticates student, employer, or administrator");

        group.MapPost("/logout", (HttpContext httpContext) =>
        {
            httpContext.Response.Cookies.Delete("access_token");
            return Results.Ok(new { message = "Logged out successfully" });
        })
        .WithName("Logout");

        group.MapPost("/verify-email", async (
            [FromBody] VerifyEmailRequest request,
            IAuthService authService,
            CancellationToken ct) =>
        {
            var success = await authService.VerifyEmailAsync(request, ct);
            return success 
                ? Results.Ok(new { message = "Email verified successfully" }) 
                : Results.BadRequest(new { message = "Verification failed or token expired" });
        })
        .WithName("VerifyEmail");

        group.MapPost("/resend-verification", async (
            [FromBody] ResendVerificationRequest request,
            IAuthService authService,
            CancellationToken ct) =>
        {
            await authService.ResendVerificationEmailAsync(request, ct);
            return Results.Ok(new { message = "If the account exists, a verification link was sent." });
        })
        .WithName("ResendVerification");

        group.MapGet("/me", async (
            ICurrentUser currentUser,
            IAuthService authService,
            CancellationToken ct) =>
        {
            if (!currentUser.IsAuthenticated || !currentUser.UserId.HasValue)
            {
                return Results.Unauthorized();
            }

            var user = await authService.GetCurrentUserAsync(currentUser.UserId.Value, ct);
            return user != null ? Results.Ok(user) : Results.NotFound();
        })
        .RequireAuthorization()
        .WithName("GetCurrentUser");

        return group;
    }

    private static void SetAuthCookies(HttpContext httpContext, string accessToken)
    {
        httpContext.Response.Cookies.Append("access_token", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddMinutes(15)
        });
    }
}
