using Microsoft.AspNetCore.Mvc;
using JobTracker.API.Models;
using JobTracker.API.Services;

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
    public IEnumerable<JobApplication> GetAll()
    {
        return _service.GetAll();
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var application = _service.GetById(id);
        if (application == null)
            return NotFound();
        return Ok(application);
    }

    [HttpPost]
    public IActionResult Add([FromBody] JobApplication application)
    {
        _service.Add(application);
        return CreatedAtAction(nameof(GetById), new { id = application.Id }, application);
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