using System.Net;
using System.Net.Mail;
using AIUB.JobFair.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AIUB.JobFair.Infrastructure.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IConfiguration configuration, ILogger<SmtpEmailSender> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string bodyHtml, CancellationToken cancellationToken = default)
    {
        var host = _configuration["Email:SmtpHost"];
        var portStr = _configuration["Email:SmtpPort"];
        var user = _configuration["Email:SmtpUsername"];
        var pass = _configuration["Email:SmtpPassword"];
        var senderEmail = _configuration["Email:SenderEmail"] ?? "no-reply@aiub.edu";
        var senderName = _configuration["Email:SenderName"] ?? "AIUB Job Fair 2026";
        var enableSsl = bool.TryParse(_configuration["Email:EnableSsl"], out var ssl) && ssl;

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(pass))
        {
            _logger.LogWarning("SMTP is not configured in environment. Simulation email to {ToEmail}: Subject: {Subject}\nBody:\n{Body}", 
                toEmail, subject, bodyHtml);
            return;
        }

        var port = int.TryParse(portStr, out var p) ? p : 587;

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(user, pass),
            EnableSsl = enableSsl
        };

        using var message = new MailMessage
        {
            From = new MailAddress(senderEmail, senderName),
            Subject = subject,
            Body = bodyHtml,
            IsBodyHtml = true
        };

        message.To.Add(toEmail);

        try
        {
            await client.SendMailAsync(message, cancellationToken);
            _logger.LogInformation("Email sent successfully to {ToEmail} with subject '{Subject}'", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail}: {Message}", toEmail, ex.Message);
            throw;
        }
    }
}
