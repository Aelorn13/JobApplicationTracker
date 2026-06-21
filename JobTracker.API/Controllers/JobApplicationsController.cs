using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobTracker.Domain.Entities;
using JobTracker.Application.Interfaces;
using JobTracker.Application.DTOs;
using JobTracker.Domain.Enums;
using System.Security.Claims;

namespace JobTracker.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class JobApplicationsController : ControllerBase
{
    private readonly IJobApplicationService _service;

    public JobApplicationsController(IJobApplicationService service)
    {
        _service = service;
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    }

    private JobApplicationResponseDto MapToDto(JobApplication app)
    {
        return new JobApplicationResponseDto
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
        };
    }

    [HttpGet]
    public IActionResult GetAll(
        [FromQuery] ApplicationStatus? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = _service.GetAll(GetUserId(), status, from, to, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var application = _service.GetById(id, GetUserId());
        if (application == null) return NotFound();
        return Ok(MapToDto(application));
    }

    [HttpPost]
    public IActionResult Add([FromBody] CreateJobApplicationDto dto)
    {
        var application = new JobApplication
        {
            CompanyName = dto.CompanyName,
            Position = dto.Position,
            Status = dto.Status,
            AppliedDate = dto.AppliedDate,
            UserId = GetUserId(),
            RawDescription = dto.RawDescription,
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            Location = dto.Location,
            ExpirationDate = dto.ExpirationDate
        };
        _service.Add(application, dto.Tags); 
        return CreatedAtAction(nameof(GetById), new { id = application.Id }, MapToDto(application));
    }

    [HttpPut("{id}")]
    public IActionResult Put(int id, [FromBody] UpdateJobApplicationDto updatedApplication)
    {
        var userId = GetUserId();
        var existingApplication = _service.GetById(id, userId);
        if (existingApplication == null) return NotFound();
        _service.Update(id, updatedApplication, userId);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var isDeleted = _service.Delete(id, GetUserId());
        if (!isDeleted) return NotFound();
        return NoContent();
    }
}