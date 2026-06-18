using JobTracker.Domain.Enums;
namespace JobTracker.Domain.Entities;

public class JobApplication
{
    public int Id { get; set; }
    public required string CompanyName { get; set; }
    public required  string Position { get; set; }
    public ApplicationStatus Status  { get; set; }
    public DateTime AppliedDate { get; set; }
}