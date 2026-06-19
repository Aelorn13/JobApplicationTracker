using JobTracker.Application.DTOs;

namespace JobTracker.Application.Interfaces;

public interface IAuthService
{
    Task<string> Register(RegisterDto dto);
    Task<string> Login(LoginDto dto);
}