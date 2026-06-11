using JobTracker.Domain.Entities;

namespace JobTracker.Application.Interfaces;

public interface IJobApplicationService
{
    List<JobApplication> GetAll();
    JobApplication? GetById(int id);
    void Add(JobApplication application);
    bool Delete(int id); 
    void Update(JobApplication application);
}