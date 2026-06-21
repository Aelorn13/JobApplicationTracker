using Microsoft.EntityFrameworkCore;
using JobTracker.Infrastructure.Data;
using JobTracker.Application.Interfaces;
using JobTracker.Infrastructure.Services;
using JobTracker.Domain.Entities;
using JobTracker.Domain.Enums;

namespace JobTracker.Tests;

public class JobApplicationServiceTests : TestBase
{
    [Fact]
    public void GetAll_WhenEmpty_ReturnsEmptyList()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetAll("test-user-id");

        // Assert
        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalCount);
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
            Status = ApplicationStatus.Pending,
            AppliedDate = DateTime.Now,
            UserId = "test-user-id"
        };

        // Act
        service.Add(application, null);

        // Assert
        Assert.Equal(1, context.JobApplications.Count());
        Assert.Equal("Google", context.JobApplications.First().CompanyName);
    }

    [Fact]
    public void GetById_ExistingId_ReturnsApplication()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var application = new JobApplication { CompanyName = "Microsoft", Position = "QA", Status = ApplicationStatus.Pending, UserId = "test-user-id" };
        context.JobApplications.Add(application);
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetById(application.Id, "test-user-id");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Microsoft", result.CompanyName);
    }

    [Fact]
    public void GetById_NonExistingId_ReturnsNull()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetById(999, "test-user-id");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void GetAll_WithMultipleApplications_ReturnsAll()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.JobApplications.Add(new JobApplication { CompanyName = "Apple", Position = "Dev", Status = ApplicationStatus.Pending, AppliedDate = DateTime.Now, UserId = "test-user-id" });
        context.JobApplications.Add(new JobApplication { CompanyName = "Amazon", Position = "QA", Status = ApplicationStatus.Interview, AppliedDate = DateTime.Now, UserId = "test-user-id" });
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetAll("test-user-id");

        // Assert
        Assert.Equal(2, result.Items.Count);
        Assert.Equal(2, result.TotalCount);
    }

    [Fact]
    public void Delete_ExistingId_RemovesFromDB_AndReturnsTrue()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var application = new JobApplication { CompanyName = "Netflix", Position = "Data Scientist", Status = ApplicationStatus.Pending, AppliedDate = DateTime.Now, UserId = "test-user-id" };
        context.JobApplications.Add(application);
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.Delete(application.Id, "test-user-id");

        // Assert
        Assert.True(result);
        Assert.Equal(0, context.JobApplications.Count());
    }

    [Fact]
    public void Delete_NonExistingId_ReturnsFalse()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = new JobApplicationService(context);

        // Act
        var result = service.Delete(999, "test-user-id");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public void Update_ExistingApplication_ModifiesPropertiesInDB()
    {
        // Arrange 
        var context = CreateInMemoryContext();
        var originalApp = new JobApplication
        {
            CompanyName = "Old Company",
            Position = "Intern",
            Status = ApplicationStatus.Pending,
            AppliedDate = DateTime.Now.AddDays(-2),
            UserId = "test-user-id"
        };
        context.JobApplications.Add(originalApp);
        context.SaveChanges();
        context.ChangeTracker.Clear();

        var service = new JobApplicationService(context);
        var updatedDto = new UpdateJobApplicationDto
        {
            CompanyName = "New Company",
            Position = "Senior",
            Status = ApplicationStatus.Offer,
            AppliedDate = DateTime.Now
        };

        // Act 
        service.Update(originalApp.Id, updatedDto, "test-user-id");

        // Assert 
        var appInDb = context.JobApplications.Find(originalApp.Id);
        Assert.NotNull(appInDb);
        Assert.Equal("New Company", appInDb.CompanyName);
        Assert.Equal("Senior", appInDb.Position);
        Assert.Equal(ApplicationStatus.Offer, appInDb.Status);
    }

    [Fact]
    public void Update_NonExistingApplication_DoesNotThrowException()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = new JobApplicationService(context);
        var nonExistingDto = new UpdateJobApplicationDto
        {
            CompanyName = "Ghost Company",
            Position = "Ghost Hunter",
            Status = ApplicationStatus.Rejected,
            AppliedDate = DateTime.Now
        };

        // Act
        var exception = Record.Exception(() => service.Update(999, nonExistingDto, "test-user-id"));

        // Assert
        Assert.Null(exception);
        Assert.Empty(context.JobApplications);
    }

    [Fact]
    public void GetAll_FilterByStatus_ReturnsOnlyMatchingApplications()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.JobApplications.Add(new JobApplication { CompanyName = "Apple", Position = "Dev", Status = ApplicationStatus.Pending, AppliedDate = DateTime.Now, UserId = "test-user-id" });
        context.JobApplications.Add(new JobApplication { CompanyName = "Google", Position = "QA", Status = ApplicationStatus.Interview, AppliedDate = DateTime.Now, UserId = "test-user-id" });
        context.JobApplications.Add(new JobApplication { CompanyName = "Amazon", Position = "PM", Status = ApplicationStatus.Pending, AppliedDate = DateTime.Now, UserId = "test-user-id" });
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetAll("test-user-id", status: ApplicationStatus.Pending);

        // Assert
        Assert.Equal(2, result.Items.Count);
        Assert.All(result.Items, app => Assert.Equal(ApplicationStatus.Pending, app.Status));
    }

    [Fact]
    public void GetAll_FilterByDateRange_ReturnsOnlyMatchingApplications()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var targetDate = new DateTime(2024, 1, 15);
        context.JobApplications.Add(new JobApplication { CompanyName = "Apple", Position = "Dev", Status = ApplicationStatus.Pending, AppliedDate = targetDate.AddDays(-10), UserId = "test-user-id" });
        context.JobApplications.Add(new JobApplication { CompanyName = "Google", Position = "QA", Status = ApplicationStatus.Interview, AppliedDate = targetDate, UserId = "test-user-id" });
        context.JobApplications.Add(new JobApplication { CompanyName = "Amazon", Position = "PM", Status = ApplicationStatus.Pending, AppliedDate = targetDate.AddDays(10), UserId = "test-user-id" });
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetAll("test-user-id", from: targetDate.AddDays(-2), to: targetDate.AddDays(2));

        // Assert
        Assert.Single(result.Items);
        Assert.Equal("Google", result.Items.First().CompanyName);
    }
    [Fact]
    public void GetAll_WithPagination_ReturnsCorrectPage()
    {
        // Arrange
        var context = CreateInMemoryContext();
        for (int i = 1; i <= 15; i++)
        {
            context.JobApplications.Add(new JobApplication
            {
                CompanyName = $"Company {i}",
                Position = "Dev",
                Status = ApplicationStatus.Pending,
                AppliedDate = DateTime.Now,
                UserId = "test-user-id"
            });
        }
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetAll("test-user-id", page: 2, pageSize: 5);

        // Assert
        Assert.Equal(15, result.TotalCount);
        Assert.Equal(5, result.Items.Count);
        Assert.Equal("Company 6", result.Items.First().CompanyName);
    }
    [Fact]
    public void GetAll_ReturnsOnlyCurrentUserApplications()
    {
        var context = CreateInMemoryContext();
        context.JobApplications.Add(new JobApplication
        {
            CompanyName = "Google",
            Position = "Dev",
            Status = ApplicationStatus.Pending,
            AppliedDate = DateTime.Now,
            UserId = "user-1"
        });
        context.JobApplications.Add(new JobApplication
        {
            CompanyName = "Amazon",
            Position = "QA",
            Status = ApplicationStatus.Pending,
            AppliedDate = DateTime.Now,
            UserId = "user-2"
        });
        context.SaveChanges();

        var service = new JobApplicationService(context);
        var result = service.GetAll("user-1");

        Assert.Single(result.Items);
        Assert.Equal("Google", result.Items[0].CompanyName);
    }
    [Fact]
    public void Add_WithExistingTag_ReusesTagInsteadOfDuplicating()
    {
        var context = CreateInMemoryContext();
        var service = new JobApplicationService(context);

        var app1 = new JobApplication { CompanyName = "A", Position = "Dev", Status = ApplicationStatus.Pending, UserId = "u1" };
        service.Add(app1, new List<string> { "React", ".NET" });

        var app2 = new JobApplication { CompanyName = "B", Position = "Dev", Status = ApplicationStatus.Pending, UserId = "u1" };
        service.Add(app2, new List<string> { "React", "Azure" });

        Assert.Equal(3, context.Tags.Count()); 
    }
}