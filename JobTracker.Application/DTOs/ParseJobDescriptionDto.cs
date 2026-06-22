using System.ComponentModel.DataAnnotations;

namespace JobTracker.Application.DTOs;

public class ParseJobDescriptionDto
{
    [Required]
    [MinLength(20, ErrorMessage = "Job description seems too short to parse")]
    public required string JobText { get; set; }
}