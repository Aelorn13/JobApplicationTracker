namespace JobTracker.Application.DTOs;

public class ParsedJobDataDto
{
    public string? CompanyName { get; set; }
    public string? Position { get; set; }
    public string? Location { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public List<string> Tags { get; set; } = new();
}