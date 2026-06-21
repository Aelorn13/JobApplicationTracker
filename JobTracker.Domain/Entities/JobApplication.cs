using JobTracker.Domain.Enums;
namespace JobTracker.Domain.Entities;

public class JobApplication
{
    public int Id { get; set; }
    public required string CompanyName { get; set; }
    public required string Position { get; set; }
    public ApplicationStatus Status { get; set; }
    public DateTime AppliedDate { get; set; }
    public string UserId { get; set; } = string.Empty;

    public string? RawDescription { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? Location { get; set; }
    public DateTime? ExpirationDate { get; set; }

    public List<Tag> Tags { get; set; } = new();
}