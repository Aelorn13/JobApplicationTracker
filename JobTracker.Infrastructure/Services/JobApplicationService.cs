using JobTracker.Domain.Entities;
using JobTracker.Infrastructure.Data;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Enums;
using JobTracker.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Services;

public class JobApplicationService : IJobApplicationService
{
    private readonly AppDbContext _context;
    public JobApplicationService(AppDbContext context)
    {
        _context = context;
    }
    private List<Tag> ResolveTags(List<string> tagNames)
    {
        var resolvedTags = new List<Tag>();

        foreach (var name in tagNames.Distinct())
        {
            var existingTag = _context.Tags
                .FirstOrDefault(t => t.Name.ToLower() == name.ToLower());

            resolvedTags.Add(existingTag ?? new Tag { Name = name });
        }

        return resolvedTags;
    }
    public PaginatedResultDto<JobApplicationResponseDto> GetAll(
    string userId,
    ApplicationStatus? status = null,
    DateTime? from = null,
    DateTime? to = null,
    int page = 1,
    int pageSize = 10)
    {
        var query = _context.JobApplications
            .Include(app => app.Tags)
            .Where(app => app.UserId == userId)
            .AsQueryable();

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
            .ToList();

        return new PaginatedResultDto<JobApplicationResponseDto>
        {
            Items = items.Select(app => new JobApplicationResponseDto
            {
                Id = app.Id,
                CompanyName = app.CompanyName,
                Position = app.Position,
                Status = app.Status,
                AppliedDate = app.AppliedDate,
                RawDescription = app.RawDescription,
                SalaryMin = app.SalaryMin,
                SalaryMax = app.SalaryMax,
                Location = app.Location,
                ExpirationDate = app.ExpirationDate,
                Tags = app.Tags.Select(t => t.Name).ToList()
            }).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public JobApplication? GetById(int id, string userId)
    {
        return _context.JobApplications
            .Include(app => app.Tags) // ← добавь
            .FirstOrDefault(app => app.Id == id && app.UserId == userId);
    }

    public void Add(JobApplication application, List<string>? tagNames = null)
    {
        if (tagNames != null && tagNames.Any())
        {
            application.Tags = ResolveTags(tagNames);
        }

        _context.JobApplications.Add(application);
        _context.SaveChanges();
    }
    public bool Delete(int id, string userId)
    {
        var app = _context.JobApplications
        .FirstOrDefault(a => a.Id == id && a.UserId == userId);
        if (app == null) return false;
        _context.JobApplications.Remove(app);
        _context.SaveChanges();
        return true;
    }
    public void Update(int id, UpdateJobApplicationDto dto, string userId)
    {
        var existingApp = _context.JobApplications
            .Include(a => a.Tags)
            .FirstOrDefault(a => a.Id == id && a.UserId == userId);

        if (existingApp != null)
        {
            existingApp.CompanyName = dto.CompanyName;
            existingApp.Position = dto.Position;
            existingApp.Status = dto.Status;
            existingApp.AppliedDate = dto.AppliedDate;

            existingApp.RawDescription = dto.RawDescription;
            existingApp.SalaryMin = dto.SalaryMin;
            existingApp.SalaryMax = dto.SalaryMax;
            existingApp.Location = dto.Location;
            existingApp.ExpirationDate = dto.ExpirationDate;

            existingApp.Tags.Clear();

            if (dto.Tags != null && dto.Tags.Any())
            {
                foreach (var tag in ResolveTags(dto.Tags))
                {
                    existingApp.Tags.Add(tag);
                }
            }

            _context.SaveChanges();
        }
    }
}