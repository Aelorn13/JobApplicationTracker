using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using JobTracker.Application.Interfaces;
namespace JobTracker.Infrastructure.Services;

public class JobApplicationService : IJobApplicationService
{
    private readonly AppDbContext _context;
    public JobApplicationService(AppDbContext context)
    {
        _context = context;
    }

    public List<JobApplication> GetAll()
    {
        return _context.JobApplications.ToList();
    }

    public JobApplication? GetById(int id)
    {
        return _context.JobApplications.Find(id);
    }

    public void Add(JobApplication application)
    {
        _context.JobApplications.Add(application);
        _context.SaveChanges();
    }
    public bool Delete(int id)
    {
        var appToDelete = _context.JobApplications.Find(id);
        if (appToDelete == null)
            return false;
        _context.JobApplications.Remove(appToDelete);
        _context.SaveChanges();
        return true;
    }
    public void Update(JobApplication application)
    {
        var existingApp = _context.JobApplications.Find(application.Id);
        if (existingApp != null)
        {
            existingApp.CompanyName = application.CompanyName;
            existingApp.Position = application.Position;
            existingApp.Status = application.Status;
            existingApp.AppliedDate = application.AppliedDate;

            _context.SaveChanges();
        }
        
    }
}