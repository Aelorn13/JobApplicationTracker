using System.ComponentModel.DataAnnotations;
using JobTracker.Domain.Enums;
public class CreateJobApplicationDto
{
    [Required(ErrorMessage = "Company name is required")]
    [MaxLength(100, ErrorMessage = "Company name cannot exceed 100 characters")]
    public required string CompanyName { get; set; }

    [Required(ErrorMessage = "Position is required")]
    [MaxLength(100)]
    public required string Position { get; set; }

    [Required]
    public ApplicationStatus Status  { get; set; }

    public DateTime AppliedDate { get; set; } = DateTime.Now;
}