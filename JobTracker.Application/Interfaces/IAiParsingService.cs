using JobTracker.Application.DTOs;

namespace JobTracker.Application.Interfaces;

public interface IAiParsingService
{
    Task<ParsedJobDataDto> ParseJobDescription(string jobText);
}