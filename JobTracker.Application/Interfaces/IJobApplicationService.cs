using JobTracker.Domain.Entities;
using JobTracker.Domain.Enums;
using JobTracker.Application.DTOs;
namespace JobTracker.Application.Interfaces;

public interface IJobApplicationService
{
    PaginatedResultDto<JobApplicationResponseDto> GetAll(
    string userId,
    ApplicationStatus? status = null,
    DateTime? from = null,
    DateTime? to = null,
    int page = 1,
    int pageSize = 10);
    JobApplication? GetById(int id, string userId);
    void Add(JobApplication application, List<string>? tagNames = null); 
    bool Delete(int id, string userId);
    void Update(int id, UpdateJobApplicationDto dto, string userId);
}