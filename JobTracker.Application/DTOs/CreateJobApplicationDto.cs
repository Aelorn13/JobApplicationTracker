using System.ComponentModel.DataAnnotations;
using JobTracker.Domain.Enums;
public class CreateJobApplicationDto
{
    [Required]
    [MaxLength(100)]
    public required string CompanyName { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Position { get; set; }

    [Required]
    public ApplicationStatus Status { get; set; }

    public DateTime AppliedDate { get; set; } = DateTime.Now;

    public string? RawDescription { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? Location { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public List<string>? Tags { get; set; }
}