namespace JobTracker.Application.DTOs;

public class JobApplicationResponseDto
{
    public int Id { get; set; }
    public string CompanyName { get; set; }
    public string Position { get; set; }
    public string Status { get; set; }
    public DateTime AppliedDate { get; set; }
}