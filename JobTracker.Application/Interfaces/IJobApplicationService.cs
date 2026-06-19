using JobTracker.Domain.Entities;
using JobTracker.Domain.Enums;
using JobTracker.Application.DTOs;
namespace JobTracker.Application.Interfaces;

public interface IJobApplicationService
{
    PaginatedResultDto<JobApplicationResponseDto> GetAll(
    ApplicationStatus? status = null,
    DateTime? from = null,
    DateTime? to = null,
    int page = 1,
    int pageSize = 10);
    JobApplication? GetById(int id);
    void Add(JobApplication application);
    bool Delete(int id);
    void Update(int id, UpdateJobApplicationDto dto);
}