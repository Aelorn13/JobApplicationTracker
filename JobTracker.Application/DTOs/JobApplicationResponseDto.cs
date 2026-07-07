using JobTracker.Domain.Enums;

namespace JobTracker.Application.DTOs;

public class JobApplicationResponseDto
{
    public int Id { get; set; }
    public required string CompanyName { get; set; }
    public required string Position { get; set; }
    public ApplicationStatus Status { get; set; }
    public DateTime AppliedDate { get; set; }
    public string? RawDescription { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? Location { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? Notes { get; set; }
}