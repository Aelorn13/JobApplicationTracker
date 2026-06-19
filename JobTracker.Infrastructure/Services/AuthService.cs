using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JobTracker.Application.DTOs;
using JobTracker.Application.Interfaces;
using JobTracker.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using JobTracker.Infrastructure.Identity;

namespace JobTracker.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<AppUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    public async Task<string> Register(RegisterDto dto)
    {
        var user = new AppUser
        {
            Email = dto.Email,
            UserName = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        return GenerateToken(user);
    }

    public async Task<string> Login(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            throw new Exception("Invalid email or password");

        return GenerateToken(user);
    }

    private string GenerateToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["JwtSettings:ExpirationMinutes"]!)),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}