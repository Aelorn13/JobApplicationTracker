# JobTracker

![CI](https://github.com/Aelorn13/JobApplicationTracker/actions/workflows/ci.yml/badge.svg)

A full-stack job application tracker built to practice real-world .NET development. 
Track applications, parse job postings with AI, and stay on top of your job search.

## Features

- **AI-powered parsing** — paste a job description, automatically extract company, role, salary and tech stack via Gemini API
- **Full CRUD** with filtering by status, date range, salary, and free-text search
- **Smart sorting** — active applications (Interview, Offer) surface to the top automatically
- **Duplicate detection** — warns when applying to the same company twice
- **JWT authentication** — each user sees only their own applications
- **Tags** — many-to-many relationship between applications and tech stack tags
- **Stale detection** — highlights applications with no response after 30 days
- **Pagination and sorting** — server-side, configurable per request

## Tech Stack

**Backend**
- ASP.NET Core 9 Web API
- Entity Framework Core 9 + SQL Server
- ASP.NET Core Identity + JWT Bearer authentication
- xUnit + EF Core InMemory provider for testing
- Gemini API (Google AI) for job description parsing

**Frontend**
- React 18 + Vite
- Custom hooks for state management (`useApplications`, `useDuplicateCheck`)
- Mobile-responsive layout with CSS custom properties

**Architecture**
- Clean Architecture — Domain / Application / Infrastructure / API
- Repository pattern via EF Core DbContext
- DTO layer separating API contracts from domain entities
- CI/CD via GitHub Actions (build + test on every push)

## Project Structure

```
JobTracker.Domain/         — Entities, Enums (no dependencies)
JobTracker.Application/    — Interfaces, DTOs
JobTracker.Infrastructure/ — EF Core, services, Identity, Gemini integration
JobTracker.API/            — Controllers, Program.cs
JobTracker.Tests/          — xUnit test suite
job-tracker-client/        — React frontend
```

## Getting Started

**Prerequisites:** .NET 9 SDK, SQL Server (LocalDB works), Node.js 18+

```bash
git clone https://github.com/Aelorn13/JobApplicationTracker.git
cd JobApplicationTracker
```

**Backend:**
```bash
# Set up Gemini API key (get one free at aistudio.google.com)
cd JobTracker.API
dotnet user-secrets set "GeminiSettings:ApiKey" "your-key-here"

# Run migrations and start
dotnet ef database update --project ../JobTracker.Infrastructure
dotnet run
```

API docs available at `http://localhost:5141/scalar/v1`

**Frontend:**
```bash
cd job-tracker-client
npm install
npm run dev
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/jobapplications | List applications |
| POST | /api/jobapplications | Create application |
| PUT | /api/jobapplications/{id} | Update application |
| DELETE | /api/jobapplications/{id} | Delete application |
| POST | /api/jobapplications/parse | Parse job description with AI |
| GET | /api/jobapplications/check-duplicate | Check for duplicate company |

**Query parameters for GET /api/jobapplications:**

| Parameter | Description | Default |
|-----------|-------------|---------|
| `status` | Filter by status (Pending, PhoneScreen, Interview, Offer, Rejected) | — |
| `sortBy` | Sort order (status, date_asc, date_desc, company, salary) | status |
| `page` | Page number | 1 |
| `pageSize` | Results per page | 10 |
| `from` / `to` | Date range filter | — |

## Running Tests

```bash
dotnet test
```

Test suite covers service layer logic with an in-memory database — CRUD operations, 
tag deduplication, user isolation, duplicate detection, and sort ordering.