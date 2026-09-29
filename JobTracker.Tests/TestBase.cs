using Microsoft.EntityFrameworkCore;
using JobTracker.Infrastructure.Data;
using Microsoft.Extensions.Logging.Abstractions;
using JobTracker.Infrastructure.Services;
namespace JobTracker.Tests;


public abstract class TestBase
{
    protected JobApplicationService CreateService(AppDbContext context)
    {
        return new JobApplicationService(context, NullLogger<JobApplicationService>.Instance);
    }
    protected AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }
}