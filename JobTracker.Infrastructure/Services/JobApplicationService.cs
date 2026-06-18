using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Enums;
using JobTracker.Application.DTOs;

namespace JobTracker.Infrastructure.Services;

public class JobApplicationService : IJobApplicationService
{
    private readonly AppDbContext _context;
    public JobApplicationService(AppDbContext context)
    {
        _context = context;
    }

    public PaginatedResultDto<JobApplicationResponseDto> GetAll(
        ApplicationStatus? status = null,
        DateTime? from = null,
        DateTime? to = null,
        int page = 1,
        int pageSize = 10)
    {
        var query = _context.JobApplications.AsQueryable();

        if (status.HasValue)
            query = query.Where(app => app.Status == status.Value);

        if (from.HasValue)
            query = query.Where(app => app.AppliedDate >= from.Value);

        if (to.HasValue)
            query = query.Where(app => app.AppliedDate <= to.Value);

        var totalCount = query.Count();

        var items = query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(app => new JobApplicationResponseDto
            {
                Id = app.Id,
                CompanyName = app.CompanyName,
                Position = app.Position,
                Status = app.Status,
                AppliedDate = app.AppliedDate
            })
            .ToList();

        return new PaginatedResultDto<JobApplicationResponseDto>
        {
            TotalCount = totalCount,
            Items = items
        };
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
    public void Update(int id, UpdateJobApplicationDto dto)
    {
        var existingApp = _context.JobApplications.Find(id);
        if (existingApp != null)
        {
            existingApp.CompanyName = dto.CompanyName;
            existingApp.Position = dto.Position;
            existingApp.Status = dto.Status;
            existingApp.AppliedDate = dto.AppliedDate;

            _context.SaveChanges();
        }

    }
}