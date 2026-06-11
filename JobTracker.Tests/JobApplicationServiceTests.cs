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
        var result = service.GetAll();

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
            AppliedDate = DateTime.Now
        };

        // Act
        service.Add(application);

        // Assert
        Assert.Equal(1, context.JobApplications.Count());
        Assert.Equal("Google", context.JobApplications.First().CompanyName);
    }

    [Fact]
    public void GetById_ExistingId_ReturnsApplication()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var application = new JobApplication { CompanyName = "Microsoft", Position = "QA", Status = ApplicationStatus.Pending };
        context.JobApplications.Add(application);
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetById(application.Id);

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
        var result = service.GetById(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void GetAll_WithMultipleApplications_ReturnsAll()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.JobApplications.Add(new JobApplication { CompanyName = "Apple", Position = "Dev", Status = ApplicationStatus.Pending, AppliedDate = DateTime.Now });
        context.JobApplications.Add(new JobApplication { CompanyName = "Amazon", Position = "QA", Status = ApplicationStatus.Interview, AppliedDate = DateTime.Now });
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetAll();

        // Assert
        Assert.Equal(2, result.Items.Count);
        Assert.Equal(2, result.TotalCount);
    }

    [Fact]
    public void Delete_ExistingId_RemovesFromDB_AndReturnsTrue()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var application = new JobApplication { CompanyName = "Netflix", Position = "Data Scientist", Status = ApplicationStatus.Pending, AppliedDate = DateTime.Now };
        context.JobApplications.Add(application);
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.Delete(application.Id);

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
        var result = service.Delete(999);

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
            AppliedDate = DateTime.Now.AddDays(-2)
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
        service.Update(originalApp.Id, updatedDto);

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
        var exception = Record.Exception(() => service.Update(999, nonExistingDto));

        // Assert
        Assert.Null(exception);
        Assert.Empty(context.JobApplications);
    }

    [Fact]
    public void GetAll_FilterByStatus_ReturnsOnlyMatchingApplications()
    {
        // Arrange
        var context = CreateInMemoryContext();
        context.JobApplications.Add(new JobApplication { CompanyName = "Apple", Position = "Dev", Status = ApplicationStatus.Pending, AppliedDate = DateTime.Now });
        context.JobApplications.Add(new JobApplication { CompanyName = "Google", Position = "QA", Status = ApplicationStatus.Interview, AppliedDate = DateTime.Now });
        context.JobApplications.Add(new JobApplication { CompanyName = "Amazon", Position = "PM", Status = ApplicationStatus.Pending, AppliedDate = DateTime.Now });
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetAll(status: ApplicationStatus.Pending);

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
        context.JobApplications.Add(new JobApplication { CompanyName = "Apple", Position = "Dev", Status = ApplicationStatus.Pending, AppliedDate = targetDate.AddDays(-10) });
        context.JobApplications.Add(new JobApplication { CompanyName = "Google", Position = "QA", Status = ApplicationStatus.Interview, AppliedDate = targetDate });
        context.JobApplications.Add(new JobApplication { CompanyName = "Amazon", Position = "PM", Status = ApplicationStatus.Pending, AppliedDate = targetDate.AddDays(10) });
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetAll(from: targetDate.AddDays(-2), to: targetDate.AddDays(2));

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
                AppliedDate = DateTime.Now
            });
        }
        context.SaveChanges();
        var service = new JobApplicationService(context);

        // Act
        var result = service.GetAll(page: 2, pageSize: 5);

        // Assert
        Assert.Equal(15, result.TotalCount);
        Assert.Equal(5, result.Items.Count);
        Assert.Equal("Company 6", result.Items.First().CompanyName);
    }
}