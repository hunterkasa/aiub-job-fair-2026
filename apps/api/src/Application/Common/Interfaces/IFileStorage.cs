namespace AIUB.JobFair.Application.Common.Interfaces;

public interface IFileStorage
{
    Task<string> UploadAsync(Stream content, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<Stream?> DownloadAsync(string storageKey, CancellationToken cancellationToken = default);
    Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default);
    Task<string> GetDirectOrSignedUrlAsync(string storageKey, TimeSpan expiry, CancellationToken cancellationToken = default);
}
