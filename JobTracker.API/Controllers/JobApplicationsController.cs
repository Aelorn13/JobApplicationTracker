using Microsoft.AspNetCore.Mvc;
using JobTracker.Domain.Entities;
using JobTracker.Application.Interfaces;
using JobTracker.Application.DTOs;


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
    public ActionResult<IEnumerable<JobApplicationResponseDto>> GetAll()
    {
        var applications = _service.GetAll();

        var dtos = applications.Select(app => new JobApplicationResponseDto
        {
            Id = app.Id,
            CompanyName = app.CompanyName,
            Position = app.Position,
            Status = app.Status,
            AppliedDate = app.AppliedDate
        }).ToList();

        return Ok(dtos);
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
    public IActionResult Put(int id, [FromBody] JobApplication updatedApplication)
    {
        if (id != updatedApplication.Id)
        {
            return BadRequest("The ID in the route and the ID in the request body do not match.");
        }
        var existingApplication = _service.GetById(id);
        if (existingApplication == null)
        {
            return NotFound();
        }
        _service.Update(updatedApplication);
        return NoContent();
    }
}