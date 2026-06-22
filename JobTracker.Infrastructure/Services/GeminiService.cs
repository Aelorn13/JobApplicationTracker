using System.Text;
using System.Text.Json;
using JobTracker.Application.DTOs;
using JobTracker.Application.Interfaces;
using JobTracker.Infrastructure.Services.Gemini;
using Microsoft.Extensions.Configuration;
using System.Text.Json.Serialization;

namespace JobTracker.Infrastructure.Services;

public class GeminiService : IAiParsingService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        NumberHandling = JsonNumberHandling.AllowReadingFromString 
    };

    public GeminiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["GeminiSettings:ApiKey"]
            ?? throw new InvalidOperationException("Gemini API key is not configured");
    }

    public async Task<ParsedJobDataDto> ParseJobDescription(string jobText)
    {
        var prompt = BuildPrompt(jobText);

        var requestBody = new GeminiRequest
        {
            Contents = new List<GeminiContent>
            {
                new() { Parts = new List<GeminiPart> { new() { Text = prompt } } }
            }
        };

        var json = JsonSerializer.Serialize(requestBody, JsonOptions);

        var request = new HttpRequestMessage(HttpMethod.Post, "models/gemini-2.5-flash:generateContent")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.Add("x-goog-api-key", _apiKey);

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gemini API error: {response.StatusCode} - {errorBody}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseJson, JsonOptions);

        var rawText = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

        if (string.IsNullOrWhiteSpace(rawText))
            throw new Exception("Gemini returned an empty response");

        var parsed = JsonSerializer.Deserialize<ParsedJobDataDto>(rawText, JsonOptions);

        if (parsed != null)
        {
            parsed.Tags ??= new(); // защита от null если AI не нашёл тегов
        }

        return parsed ?? new ParsedJobDataDto();
    }

    private static string BuildPrompt(string jobText)
    {
        return $$"""
        You are extracting structured data from a UK job posting.
        Return ONLY valid JSON, no markdown formatting, no extra text, matching exactly this shape:

        {
          "companyName": string or null,
          "position": string or null,
          "location": string or null,
          "salaryMin": number or null,
          "salaryMax": number or null,
          "tags": array of up to 10 strings (key technologies and skills mentioned)
        }

        Rules:
        - If a salary range like "£75,000 - £95,000" is given, return plain numbers without currency symbols or commas.
        - If salary is not mentioned, set salaryMin and salaryMax to null.
        - Tags should be specific technologies, frameworks, or tools (e.g. ".NET", "Azure", "EF Core"), not generic words.

        Job posting text:
        {{jobText}}
        """;
    }
}