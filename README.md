# Job Application Tracker API

REST API for tracking job applications built with ASP.NET Core 9, 
Entity Framework Core, and SQL Server.

## Tech Stack
- ASP.NET Core 9 Web API
- Entity Framework Core 9 + SQL Server
- Clean Architecture (Domain, Application, Infrastructure, API)
- xUnit + InMemory database for testing

## Architecture
JobTracker.Domain        — Entities, Enums (no dependencies)
JobTracker.Application   — Interfaces, DTOs, business rules
JobTracker.Infrastructure— EF Core, repositories
JobTracker.API           — Controllers, configuration
JobTracker.Tests         — xUnit tests

## Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/jobapplications | Get all (with filtering + pagination) |
| GET    | /api/jobapplications/{id} | Get by ID |
| POST   | /api/jobapplications | Create new |
| PUT    | /api/jobapplications/{id} | Update |
| DELETE | /api/jobapplications/{id} | Delete |

### Query Parameters
- `status` — filter by status (Pending, PhoneScreen, Interview, Offer, Rejected)
- `from` / `to` — filter by date range
- `page` / `pageSize` — pagination (default: page=1, pageSize=10)

## Getting Started
\```bash
git clone ...
cd JobTracker.API
dotnet ef database update --project ../JobTracker.Infrastructure
dotnet run
\```

API documentation available at: `http://localhost:5141/scalar/v1`

## Running Tests
\```bash
dotnet test
\```