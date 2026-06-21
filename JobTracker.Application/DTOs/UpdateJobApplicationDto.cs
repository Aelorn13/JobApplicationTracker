using System.ComponentModel.DataAnnotations;
using JobTracker.Domain.Enums;

public class UpdateJobApplicationDto
{
    [Required]
    [MaxLength(100)]
    public required string CompanyName { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Position { get; set; }

    [Required]
    public ApplicationStatus Status { get; set; }

    public DateTime AppliedDate { get; set; }

    public string? RawDescription { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? Location { get; set; }
    public DateTime? ExpirationDate { get; set; }
}