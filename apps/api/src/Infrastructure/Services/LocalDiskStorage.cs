using AIUB.JobFair.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace AIUB.JobFair.Infrastructure.Services;

public class LocalDiskStorage : IFileStorage
{
    private readonly string _storageRoot;
    private readonly string _baseUrl;

    public LocalDiskStorage(IConfiguration configuration, IHostEnvironment environment)
    {
        _storageRoot = configuration["Storage:LocalPath"] ?? Path.Combine(environment.ContentRootPath, "App_Data", "Uploads");
        _baseUrl = configuration["Storage:BaseUrl"] ?? "/api/v1/files";

        if (!Directory.Exists(_storageRoot))
        {
            Directory.CreateDirectory(_storageRoot);
        }
    }

    public async Task<string> UploadAsync(Stream content, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        var storageKey = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(_storageRoot, storageKey);

        using var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write, FileShare.None);
        await content.CopyToAsync(fileStream, cancellationToken);

        return storageKey;
    }

    public Task<Stream?> DownloadAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var safeKey = Path.GetFileName(storageKey);
        var fullPath = Path.Combine(_storageRoot, safeKey);

        if (!File.Exists(fullPath))
        {
            return Task.FromResult<Stream?>(null);
        }

        Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return Task.FromResult<Stream?>(stream);
    }

    public Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var safeKey = Path.GetFileName(storageKey);
        var fullPath = Path.Combine(_storageRoot, safeKey);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }

    public Task<string> GetDirectOrSignedUrlAsync(string storageKey, TimeSpan expiry, CancellationToken cancellationToken = default)
    {
        var url = $"{_baseUrl.TrimEnd('/')}/{storageKey}";
        return Task.FromResult(url);
    }
}
