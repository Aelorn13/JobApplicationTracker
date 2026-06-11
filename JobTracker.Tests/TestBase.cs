using Microsoft.EntityFrameworkCore;
using JobTracker.Infrastructure.Data;

namespace JobTracker.Tests;


public abstract class TestBase 
{
    protected AppDbContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }
}