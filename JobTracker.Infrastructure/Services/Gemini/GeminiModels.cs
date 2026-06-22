namespace JobTracker.Infrastructure.Services.Gemini;

public class GeminiRequest
{
    public List<GeminiContent> Contents { get; set; } = new();
    public GeminiGenerationConfig GenerationConfig { get; set; } = new();
}

public class GeminiContent
{
    public List<GeminiPart> Parts { get; set; } = new();
}

public class GeminiPart
{
    public string Text { get; set; } = string.Empty;
}

public class GeminiGenerationConfig
{
    public string ResponseMimeType { get; set; } = "application/json";
}

public class GeminiResponse
{
    public List<GeminiCandidate>? Candidates { get; set; }
}

public class GeminiCandidate
{
    public GeminiContent? Content { get; set; }
}