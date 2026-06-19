using JobTracker.Application.DTOs;
using JobTracker.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var token = await _authService.Register(dto);
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var token = await _authService.Login(dto);
            return Ok(new { token });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}