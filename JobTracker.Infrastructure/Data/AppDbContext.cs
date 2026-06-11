using Microsoft.EntityFrameworkCore;
using JobTracker.Domain.Entities;

namespace JobTracker.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<JobApplication> JobApplications { get; set; }
}