using Microsoft.EntityFrameworkCore;
using JobTracker.Domain.Entities;

namespace JobTracker.Infrastructure.Data;

public class AppDbContext : DbContext
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<JobApplication>()
            .Property(e => e.Status)
            .HasConversion<string>();
    }
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<JobApplication> JobApplications { get; set; }
}