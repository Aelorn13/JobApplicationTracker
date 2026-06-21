namespace JobTracker.Domain.Entities;

public class Tag
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public List<JobApplication> JobApplications { get; set; } = new();
}