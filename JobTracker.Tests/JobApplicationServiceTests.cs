using Microsoft.EntityFrameworkCore;
using JobTracker.API.Data;
using JobTracker.API.Models;
using JobTracker.API.Services;

namespace JobTracker.Tests;

public class JobApplicationServiceTests
{
    private AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public void GetAll_WhenEmpty_ReturnsEmptyList()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetAll();

        // Assert
        Assert.Empty(result);
    }

    [Fact]
    public void Add_ValidApplication_SavesToDB()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = new JobApplicationService(context);
        var application = new JobApplication
        {
            CompanyName = "Google",
            Position = "Developer",
            Status = "Pending",
            AppliedDate = DateTime.Now
        };

        // Act
        service.Add(application);

        // Assert
        Assert.Equal(1, context.JobApplications.Count());
        Assert.Equal("Google", context.JobApplications.First().CompanyName);
    }
}