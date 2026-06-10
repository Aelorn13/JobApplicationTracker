using Microsoft.EntityFrameworkCore;
using JobTracker.API.Data;
using JobTracker.API.Models;
using JobTracker.API.Services;

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
    [Fact]
    public void GetById_ExistingId_ReturnsApplication()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var application = new JobApplication { CompanyName = "Microsoft", Position = "QA", Status = "Pending" };
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
        context.JobApplications.Add(new JobApplication { CompanyName = "Apple", Position = "Dev", Status = "Pending", AppliedDate = DateTime.Now });
        context.JobApplications.Add(new JobApplication { CompanyName = "Amazon", Position = "QA", Status = "Interview", AppliedDate = DateTime.Now });
        context.SaveChanges();

        var service = new JobApplicationService(context);

        // Act
        var result = service.GetAll();

        // Assert
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public void Delete_ExistingId_RemovesFromDB_AndReturnsTrue()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var application = new JobApplication { CompanyName = "Netflix", Position = "Data Scientist", Status = "Pending", AppliedDate = DateTime.Now };
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
            Status = "Pending",
            AppliedDate = DateTime.Now.AddDays(-2)
        };

        context.JobApplications.Add(originalApp);
        context.SaveChanges();

        context.ChangeTracker.Clear();//clearing context

        var service = new JobApplicationService(context);

        var updatedApp = new JobApplication
        {
            Id = originalApp.Id,
            CompanyName = "New Company",
            Position = "Senior",
            Status = "Accepted",
            AppliedDate = DateTime.Now
        };

        //  Act 
        service.Update(updatedApp);

        //  Assert 
        var appInDb = context.JobApplications.Find(originalApp.Id);

        Assert.NotNull(appInDb);
        Assert.Equal("New Company", appInDb.CompanyName);
        Assert.Equal("Senior", appInDb.Position);
        Assert.Equal("Accepted", appInDb.Status);
    }

    [Fact]
    public void Update_NonExistingApplication_DoesNotThrowException()
    {
        // Arrange
        var context = CreateInMemoryContext();
        var service = new JobApplicationService(context);

        var nonExistingApp = new JobApplication
        {
            Id = 999,
            CompanyName = "Ghost Company",
            Position = "Ghost Hunter",
            Status = "Rejected",
            AppliedDate = DateTime.Now
        };

        // Act & Assert
        var exception = Record.Exception(() => service.Update(nonExistingApp));

        Assert.Null(exception);
        Assert.Empty(context.JobApplications); 
    }
}