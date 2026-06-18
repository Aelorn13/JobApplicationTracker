using Microsoft.AspNetCore.Mvc;
using JobTracker.Domain.Entities;
using JobTracker.Application.Interfaces;
using JobTracker.Application.DTOs;
using JobTracker.Domain.Enums;

namespace JobTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobApplicationsController : ControllerBase
{
    private readonly IJobApplicationService _service;

    public JobApplicationsController(IJobApplicationService service)
    {
        _service = service;
    }

    [HttpGet]
    public ActionResult<PaginatedResultDto<JobApplicationResponseDto>> GetAll(
        [FromQuery] ApplicationStatus? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = _service.GetAll(status, from, to, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public ActionResult<JobApplicationResponseDto> GetById(int id)
    {
        var application = _service.GetById(id);
        if (application == null)
            return NotFound();

        var dto = new JobApplicationResponseDto
        {
            Id = application.Id,
            CompanyName = application.CompanyName,
            Position = application.Position,
            Status = application.Status,
            AppliedDate = application.AppliedDate
        };

        return Ok(dto);
    }

    [HttpPost]
    public IActionResult Add([FromBody] CreateJobApplicationDto dto)
    {
        var application = new JobApplication
        {
            CompanyName = dto.CompanyName,
            Position = dto.Position,
            Status = dto.Status,
            AppliedDate = dto.AppliedDate
        };
        _service.Add(application);

        var responseDto = new JobApplicationResponseDto
        {
            Id = application.Id,
            CompanyName = application.CompanyName,
            Position = application.Position,
            Status = application.Status,
            AppliedDate = application.AppliedDate
        };

        return CreatedAtAction(nameof(GetById), new { id = application.Id }, responseDto);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        bool isDeleted = _service.Delete(id);
        if (!isDeleted)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpPut("{id}")]
    public IActionResult Put(int id, [FromBody] UpdateJobApplicationDto updatedApplication)
    {
        var existingApplication = _service.GetById(id);
        if (existingApplication == null)
        {
            return NotFound();
        }
        _service.Update(id, updatedApplication);
        return NoContent();
    }
}