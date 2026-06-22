// Module 1 — Clean Architecture, PostgreSQL & Dapper
// Sets up the real TunMani Resort app's layered architecture and Dapper data layer.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m1 = {
  id: 'm1',
  title: 'Clean Architecture, PostgreSQL & Dapper',
  hours: 8,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Lay out the TunMani Resort solution using Clean Architecture layers, connect to a real PostgreSQL database, and access data with Dapper — parameterised SQL, a shared DapperContext, snake_case mapping, a DateOnly handler, and idempotent migrations.',
  sections: [
    {
      id: 'm1-s1',
      title: 'Project Architecture',
      topics: [
        {
          id: 'm1-t1',
          title: 'Clean Architecture layers — the big picture',
          explain:
            'TunMani Resort splits code into layers — Domain, Application, Infrastructure, Services, and Web — each with one job, so the app stays maintainable as it grows.',
          analogy:
            'TunMani Resort is run by separate teams: the housekeeping team knows what a room *is*, the front desk decides booking *rules*, the records office talks to the strongroom (database), and the reception greets guests. Nobody does everyone else\'s job. **Clean Architecture** organises code the same way — each layer is a team with one clear responsibility, so changing the strongroom does not force you to retrain the front desk.',
          theory:
            '**Clean Architecture** separates an app into concentric layers so that **business rules do not depend on technical details**. The TunMani Resort layers:\n\n- **Domain** — the core **entities** (`Room`, `Booking`, `Guest`) and enums. Pure C#, no database or web references.\n- **Application** — **interfaces** (`IRoomRepository`) and **DTOs**. Defines *what* the app needs, not *how*.\n- **Infrastructure** — **Dapper repositories** and the `DapperContext` (the *how* of data access).\n- **Services** — **business logic** that orchestrates repositories (e.g. "is this room free for these dates?").\n- **Web** — **Controllers**, **Views**, and **wwwroot** (the delivery layer).\n\nThe goal is a clean **dependency direction**: outer layers depend on inner ones, never the reverse.',
          whyItMatters:
            'Clean Architecture is a senior-level expectation and a frequent system-design interview topic. Layering lets TunMani Resort swap Dapper for another data tool, or add a mobile API, without rewriting business rules — and it makes each part independently testable, which teams value highly.',
          steps: [
            'List the five layers: Domain, Application, Infrastructure, Services, Web.',
            'Assign each a one-line responsibility.',
            'Note Domain has no dependencies on the others.',
            'Note Infrastructure implements interfaces defined in Application.',
            'Note Web depends on Services and Application, not directly on Infrastructure internals.',
            'Sketch the folder/project layout on paper.',
          ],
          code: `# The TunMani Resort solution layout (folders or projects)
TunMani.sln
  TunMani.Domain/          # entities: Room, Booking, Guest; enums
  TunMani.Application/     # interfaces (IRoomRepository) + DTOs
  TunMani.Infrastructure/  # Dapper repositories + DapperContext + Data/migrations
  TunMani.Services/        # business logic orchestrating repositories
  TunMani.Web/             # Controllers, Views, wwwroot, Program.cs

# Dependency direction (who references whom):
#   Web        -> Services, Application, Domain
#   Services   -> Application, Domain
#   Infrastructure -> Application, Domain
#   Application -> Domain
#   Domain     -> (nothing)`,
          pitfalls: [
            '**Putting database code in the Domain layer.** Couples business rules to Dapper. Fix: keep Domain pure C# with no data references.',
            '**Controllers calling repositories directly.** Skips the Services layer. Fix: route business logic through Services.',
            "**Circular references between projects.** The solution will not build. Fix: keep dependencies pointing inward only.",
            '**One giant project with folders pretending to be layers.** Boundaries are not enforced. Fix: use separate `.csproj` projects so references are real.',
            '**DTOs leaking domain entities to the web.** Fix: map entities to DTOs in the Application layer.',
            '**Over-engineering a tiny app.** Layers add overhead. Fix: TunMani Resort is large enough to justify them; a one-page app may not be.',
          ],
          tryIt:
            'On paper, draw the five TunMani Resort layers as boxes and draw arrows showing who depends on whom. Confirm every arrow points inward toward Domain and that Domain has no outgoing arrows.',
          takeaway: 'Clean Architecture separates Domain, Application, Infrastructure, Services, and Web so dependencies always point inward.',
        },
        {
          id: 'm1-t2',
          title: 'Domain & Application layers',
          explain:
            'Domain holds the entities (Room, Booking, Guest). Application holds the interfaces and DTOs that describe what the app needs.',
          analogy:
            'The Domain layer is TunMani Resort\'s definition of *what things are*: a Room has a number and a tariff; a Booking has dates and a status. The Application layer is the *job description* pinned to the wall: "we need someone who can fetch a room by id and save a booking" — written as an interface, without saying whether that someone uses Dapper, a filing cabinet, or a spreadsheet.',
          theory:
            'The **Domain** layer contains **entities** — plain C# classes/records with properties and maybe simple behaviour, plus enums like `BookingStatus`. It has **zero** references to databases, ASP.NET, or NuGet data packages.\n\nThe **Application** layer defines **interfaces** (contracts) such as `IRoomRepository` and **DTOs** for moving data. It says *what* operations exist (`Task<Room?> GetByIdAsync(int id)`) but not *how* they work. The Infrastructure layer will provide the *how*.\n\nThis split is the heart of **dependency inversion**: high-level code depends on **abstractions** (the interface), and the low-level Dapper implementation depends on that same abstraction — not the other way round.',
          whyItMatters:
            'Defining interfaces in Application and implementing them in Infrastructure is the pattern interviewers mean by "dependency inversion". It lets TunMani Resort unit-test services with a fake `IRoomRepository`, and swap the real implementation freely — a hallmark of professional, testable code.',
          steps: [
            'In Domain, create `Room`, `Booking`, and `Guest` entities and the `BookingStatus` enum.',
            'In Application, create `IRoomRepository` with async methods like `GetByIdAsync` and `GetAllAsync`.',
            'In Application, create DTOs such as `RoomDto` and `CreateBookingDto`.',
            'Confirm Domain references nothing else.',
            'Confirm Application references only Domain.',
            'Leave the implementation of `IRoomRepository` for Infrastructure (next topic).',
          ],
          code: `// TunMani.Domain/Room.cs  — a pure entity, no data dependencies
public class Room
{
    public int Id { get; set; }
    public int RoomNumber { get; set; }
    public string RoomType { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
}

// TunMani.Application/Interfaces/IRoomRepository.cs  — a contract
public interface IRoomRepository
{
    Task<IEnumerable<Room>> GetAllAsync();
    Task<Room?> GetByIdAsync(int id);
    Task<int> AddAsync(Room room);
}

// TunMani.Application/Dtos/RoomDto.cs
public record RoomDto(int Id, int RoomNumber, string RoomType, decimal BasePrice);`,
          pitfalls: [
            '**Adding a Dapper or Npgsql using-directive in Domain.** Breaks purity. Fix: keep all data packages in Infrastructure.',
            '**Defining the repository interface in Infrastructure.** Inverts the dependency wrongly. Fix: interface in Application, implementation in Infrastructure.',
            "**Returning entities directly from controllers.** Leaks the domain. Fix: map to DTOs.",
            '**Putting business rules in entities that need the database.** Fix: keep DB-dependent logic in Services/Infrastructure.',
            '**Making interfaces synchronous.** DB access should be async. Fix: return `Task<T>` from repository methods.',
            '**Fat DTOs that mirror every column blindly.** Fix: shape DTOs to what each use case needs.',
          ],
          tryIt:
            'Create the `Room` entity in a Domain project and the `IRoomRepository` interface plus `RoomDto` record in an Application project. Confirm the Application project references Domain and nothing references a database package yet.',
          takeaway: 'Domain holds pure entities; Application holds interfaces and DTOs — the contracts that Infrastructure will implement.',
        },
        {
          id: 'm1-t3',
          title: 'Infrastructure, Services & Web layers',
          explain:
            'Infrastructure implements the data interfaces with Dapper; Services hold business logic; Web hosts controllers, views, and wwwroot.',
          analogy:
            'If Application is the job description, **Infrastructure** is the records clerk who actually opens the strongroom (PostgreSQL) and fetches the file using Dapper. **Services** is the front-desk manager who decides the rules ("a room can only be booked if it is free for those dates"). **Web** is the reception that greets guests and shows them pages. Each hands work to the next without doing its neighbour\'s job.',
          theory:
            'The **Infrastructure** layer implements the Application interfaces. A `RoomRepository : IRoomRepository` uses the `DapperContext` to run SQL and return entities. The `Data/` folder here also holds **migration SQL** and the migration runner.\n\nThe **Services** layer holds **business logic** — methods like `BookingService.CreateBookingAsync` that call one or more repositories, enforce rules, and return DTOs. Controllers stay thin and call services.\n\nThe **Web** layer (`TunMani.Web`) hosts **Controllers** (MVC + Web API), **Views** (Razor `.cshtml`), and **wwwroot** (CSS/JS/images), plus `Program.cs` which wires everything via DI.\n\nDependencies flow inward: Web → Services → Application → Domain, and Infrastructure → Application/Domain.',
          whyItMatters:
            'Knowing exactly which layer a piece of code belongs in is what keeps a growing codebase clean — and it is a constant judgement call interviewers probe ("where would you put X?"). For TunMani Resort, this discipline means new features slot into the right layer instead of piling into controllers.',
          steps: [
            'In Infrastructure, create `RoomRepository : IRoomRepository` that uses `DapperContext`.',
            'In Services, create `RoomService`/`BookingService` that call repositories and apply rules.',
            'In Web, keep controllers thin: inject a service, call it, return a view or JSON.',
            'Register repositories and services in `Program.cs` via DI.',
            'Confirm controllers never touch `DapperContext` directly.',
            'Trace one request: Controller → Service → Repository → DB and back.',
          ],
          code: `// TunMani.Infrastructure/Repositories/RoomRepository.cs
public class RoomRepository : IRoomRepository
{
    private readonly DapperContext _context;
    public RoomRepository(DapperContext context) => _context = context;

    public async Task<IEnumerable<Room>> GetAllAsync()
    {
        using var conn = _context.CreateConnection();
        return await conn.QueryAsync<Room>(
            "SELECT id, room_number AS RoomNumber, room_type AS RoomType, base_price AS BasePrice FROM rooms");
    }
    // GetByIdAsync, AddAsync ... (covered in the Dapper section)
}

// TunMani.Services/RoomService.cs — thin business logic
public class RoomService
{
    private readonly IRoomRepository _rooms;
    public RoomService(IRoomRepository rooms) => _rooms = rooms;
    public Task<IEnumerable<Room>> ListRoomsAsync() => _rooms.GetAllAsync();
}`,
          pitfalls: [
            '**Controllers using `DapperContext` directly.** Skips Services and Repositories. Fix: controllers call Services only.',
            '**Business rules buried in repositories.** Repos should just do data access. Fix: put rules in Services.',
            "**Services referencing concrete repositories instead of interfaces.** Hurts testability. Fix: depend on `IRoomRepository`.",
            '**Web project referencing Infrastructure internals.** Fix: reference via Application interfaces and register implementations in DI.',
            '**Fat controllers with lots of logic.** Fix: keep them thin; delegate to Services.',
            '**Forgetting to register the repository/service in `Program.cs`.** DI fails at runtime. Fix: add the registrations.',
          ],
          tryIt:
            'Implement `RoomRepository.GetAllAsync` using a `DapperContext` (you will build the context next) and a thin `RoomService` that calls it. Sketch the request path Controller → Service → Repository → PostgreSQL and confirm no layer skips another.',
          takeaway: 'Infrastructure does data access with Dapper, Services hold business logic, and Web hosts controllers/views — each calling only inward.',
        },
        {
          id: 'm1-t4',
          title: 'The .csproj & NuGet packages',
          explain:
            'A .csproj file defines a project and its NuGet packages. TunMani Resort uses Dapper, Npgsql, Google auth, QuestPDF, and MailKit.',
          analogy:
            'Every TunMani Resort department keeps a supplies list: the records office orders Dapper and Npgsql to reach the strongroom; reception orders the Google sign-in kit; the billing desk orders QuestPDF to print invoices; and the front office orders MailKit to send confirmation emails. A `.csproj` file is that supplies list written in code — it tells .NET exactly which external packages each project needs.',
          theory:
            'A `.csproj` is an XML file describing a project: its **target framework** (`net10.0`), references to other projects, and **NuGet package** dependencies via `<PackageReference>`.\n\nThe key packages for TunMani Resort:\n- **Dapper** — the micro-ORM for SQL data access.\n- **Npgsql** — the PostgreSQL ADO.NET driver (the actual connection). `Npgsql.EntityFrameworkCore.PostgreSQL` is its EF Core flavour; for pure Dapper you mainly need **Npgsql**.\n- **Microsoft.AspNetCore.Authentication.Google** — Google OAuth login.\n- **QuestPDF** — generate PDF invoices/receipts.\n- **MailKit** — send confirmation emails.\n\nYou add packages with `dotnet add package <Name>`; the CLI updates the `.csproj` and restores them.',
          whyItMatters:
            'Reading and editing `.csproj` files and managing NuGet packages is everyday .NET work, and "how do you add a dependency?" is a basic interview check. Each package maps to a real TunMani Resort feature — knowing why each is there shows you understand the whole app\'s capabilities.',
          steps: [
            'Open a project\'s `.csproj` and find `<TargetFramework>net10.0</TargetFramework>`.',
            'Add Dapper: `dotnet add package Dapper`.',
            'Add the PostgreSQL driver: `dotnet add package Npgsql`.',
            'Add Google auth (in the Web project): `dotnet add package Microsoft.AspNetCore.Authentication.Google`.',
            'Add `dotnet add package QuestPDF` and `dotnet add package MailKit`.',
            'Run `dotnet restore` and confirm the `<PackageReference>` lines appear.',
          ],
          code: `<!-- TunMani.Infrastructure/TunMani.Infrastructure.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Dapper" Version="2.1.35" />
    <PackageReference Include="Npgsql" Version="8.0.3" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\\TunMani.Application\\TunMani.Application.csproj" />
    <ProjectReference Include="..\\TunMani.Domain\\TunMani.Domain.csproj" />
  </ItemGroup>
</Project>

<!-- Web project also adds: -->
<!-- Microsoft.AspNetCore.Authentication.Google, QuestPDF, MailKit -->`,
          pitfalls: [
            '**Adding data packages to the Domain project.** Breaks layering. Fix: add Dapper/Npgsql to Infrastructure only.',
            '**Hand-editing the `.csproj` and mistyping a version.** Restore fails. Fix: prefer `dotnet add package`, which picks a valid version.',
            "**Forgetting `dotnet restore` after editing the file by hand.** Fix: run restore (or build) to pull packages.",
            '**Mixing `Npgsql.EntityFrameworkCore.PostgreSQL` when you only use Dapper.** Adds EF Core you do not need. Fix: for pure Dapper, reference plain **Npgsql**.',
            '**Wrong project reference paths.** The solution will not build. Fix: use correct relative `..\\` paths.',
            '**Missing the Google auth package in the Web project.** OAuth setup fails later. Fix: add it where `Program.cs` lives.',
          ],
          tryIt:
            'In your Infrastructure project run `dotnet add package Dapper` and `dotnet add package Npgsql`, then open the `.csproj` and confirm two `<PackageReference>` lines appeared. Run `dotnet build` to verify they restore cleanly.',
          takeaway: 'The `.csproj` lists each project\'s NuGet packages; add them with `dotnet add package` — Dapper + Npgsql for data, plus Google auth, QuestPDF, MailKit.',
        },
      ],
    },
    {
      id: 'm1-s2',
      title: 'PostgreSQL & Connection',
      topics: [
        {
          id: 'm1-t5',
          title: 'Create the tunmani_resort database',
          explain:
            'Create a dedicated PostgreSQL database named `tunmani_resort` to hold all the app\'s tables.',
          analogy:
            'Before TunMani Resort stores a single record, it needs its own labelled strongroom — not a shelf shared with the neighbouring Udupi hotel\'s files. Creating the `tunmani_resort` database is building that dedicated strongroom: one named space where all the resort\'s tables (rooms, bookings, guests) live together and nothing else interferes.',
          theory:
            'A single PostgreSQL **server** can host many **databases**; each is an isolated namespace of tables. You create one with the SQL `CREATE DATABASE tunmani_resort;`, run from `psql` or pgAdmin while connected to the server.\n\nNaming convention in Postgres is **lowercase snake_case** — `tunmani_resort`, not `TunManiResort` — because unquoted identifiers are folded to lowercase. Connecting to a specific database is done with `\\c tunmani_resort` in `psql`.\n\nFor local development the built-in **postgres** superuser is fine. In production you would create a dedicated, least-privilege app user that owns only this database.',
          whyItMatters:
            'Creating and connecting to databases is bedrock backend skill and a basic interview check. Giving TunMani Resort its own database keeps its data isolated, easy to back up, and easy to drop and recreate during development — a clean foundation for everything that follows.',
          steps: [
            'Connect to the server: `psql -U postgres`.',
            'Create the database: `CREATE DATABASE tunmani_resort;`.',
            'List databases with `\\l` and confirm it appears.',
            'Switch to it: `\\c tunmani_resort`.',
            'Run `SELECT current_database();` to confirm you are connected to it.',
            'Quit with `\\q`.',
          ],
          code: `-- In psql, connected as the postgres superuser
CREATE DATABASE tunmani_resort;

\\l                                  -- list databases; tunmani_resort should appear
\\c tunmani_resort                   -- connect to it
SELECT current_database();          -- -> tunmani_resort

-- (Optional, production) a dedicated app user:
-- CREATE USER tunmani_app WITH PASSWORD 'strong-password';
-- GRANT ALL PRIVILEGES ON DATABASE tunmani_resort TO tunmani_app;`,
          pitfalls: [
            '**Using PascalCase like `TunManiResort`.** Postgres folds unquoted names to lowercase, causing confusion. Fix: use lowercase snake_case.',
            '**Creating tables in the default `postgres` database by mistake.** Fix: `\\c tunmani_resort` before creating tables.',
            "**Forgetting the semicolon.** psql waits for more input. Fix: end every statement with `;`.",
            '**Database already exists error on re-run.** Fix: `DROP DATABASE IF EXISTS tunmani_resort;` first, or guard your scripts.',
            '**Connecting to the wrong server/port.** Fix: confirm host/port match your install (default 5432).',
            '**Doing everything as superuser in production.** Fix: create a least-privilege app user for live deployments.',
          ],
          tryIt:
            'In `psql`, run `CREATE DATABASE tunmani_resort;`, then `\\c tunmani_resort` and `SELECT current_database();` to confirm you are inside it. List all databases with `\\l` to see your new one alongside the defaults.',
          takeaway: 'Create a dedicated `tunmani_resort` database (lowercase snake_case) and connect to it before adding any tables.',
        },
        {
          id: 'm1-t6',
          title: 'Connection string & user secrets',
          explain:
            'A connection string tells the app how to reach PostgreSQL. Store it under `ConnectionStrings:DefaultConnection`, keeping real passwords in user secrets.',
          analogy:
            'The connection string is the strongroom\'s address and key written on one line: which building (host), which room (database), and the password to get in. You would not paint that key on the resort\'s front wall for everyone to photograph — so the real password goes in a private drawer (**user secrets**) on each developer\'s machine, not in the shared settings file that gets committed to GitHub.',
          theory:
            'A PostgreSQL **connection string** looks like `Host=localhost;Port=5432;Database=tunmani_resort;Username=postgres;Password=...`. ASP.NET Core reads it from configuration under `ConnectionStrings:DefaultConnection`, via `config.GetConnectionString("DefaultConnection")`.\n\nYou keep the **shape** in `appsettings.json` but the **real secret** out of source control. For local dev, .NET provides **user secrets** — a per-machine JSON store outside the repo, enabled with `dotnet user-secrets init` and set with `dotnet user-secrets set`. In production you use **environment variables** instead.\n\nConfiguration sources layer in order, so a user-secret or environment value **overrides** the placeholder in `appsettings.json` without changing the file.',
          whyItMatters:
            'Leaking a database password by committing it is a classic, resume-damaging security incident. Interviewers ask how you keep secrets out of source control. Using user secrets locally and environment variables in production is the professional answer — and exactly how TunMani Resort protects its `DefaultConnection`.',
          steps: [
            'Add a `ConnectionStrings:DefaultConnection` entry to `appsettings.json` with a placeholder password.',
            'In the Web project run `dotnet user-secrets init`.',
            'Set the real value: `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=tunmani_resort;Username=postgres;Password=REAL"`.',
            'Read it in code with `config.GetConnectionString("DefaultConnection")`.',
            'Confirm the secret value overrides the appsettings placeholder.',
            'Add `appsettings.*.json` secrets to `.gitignore` and never commit real passwords.',
          ],
          code: `// appsettings.json — shape only, no real password
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=tunmani_resort;Username=postgres;Password=__set_in_user_secrets__"
  }
}

# Terminal — store the real value outside the repo (run in TunMani.Web)
$ dotnet user-secrets init
$ dotnet user-secrets set "ConnectionStrings:DefaultConnection" \\
    "Host=localhost;Port=5432;Database=tunmani_resort;Username=postgres;Password=postgres"

// Reading it (this user-secret overrides appsettings.json):
// var cs = config.GetConnectionString("DefaultConnection");`,
          pitfalls: [
            '**Committing the real password in `appsettings.json`.** Leaks it forever in git history. Fix: use user secrets / env vars.',
            '**Running `user-secrets` in the wrong project.** It binds to the project with the UserSecretsId. Fix: run it inside the Web project.',
            "**Typos in the key name.** `GetConnectionString` returns null. Fix: the key must be exactly `DefaultConnection`.",
            '**Forgetting `dotnet user-secrets init` first.** Set fails. Fix: init before set.',
            '**Wrong host/port/credentials.** Connection refused at runtime. Fix: match your PostgreSQL install settings.',
            '**Assuming user secrets work in production.** They do not deploy. Fix: use environment variables on the server.',
          ],
          tryIt:
            'Add a `DefaultConnection` placeholder to `appsettings.json`, then run `dotnet user-secrets init` and `dotnet user-secrets set` to store the real connection string. In a quick test, print `config.GetConnectionString("DefaultConnection")` and confirm it shows the secret value, not the placeholder.',
          takeaway: 'Keep the connection string under `ConnectionStrings:DefaultConnection`; put real passwords in user secrets locally and env vars in production.',
        },
        {
          id: 'm1-t7',
          title: 'The DapperContext & IDbConnection',
          explain:
            'A single `DapperContext` class creates PostgreSQL connections on demand via `CreateConnection()` returning an `IDbConnection`.',
          analogy:
            'Rather than every TunMani Resort clerk keeping their own private key to the strongroom, the records office has one key-cutting machine: whenever a clerk needs access, it cuts a fresh key (a connection), the clerk uses it, then hands it back. The **DapperContext** is that key-cutting machine — `CreateConnection()` hands out a fresh `NpgsqlConnection` each time, used briefly and then disposed.',
          theory:
            'The **DapperContext** is a tiny class that centralises connection creation. It reads the connection string from `IConfiguration` once, and exposes a method:\n\n`public IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);`\n\nIt returns the **`IDbConnection`** abstraction (an interface), while the concrete object is an **`NpgsqlConnection`** (the PostgreSQL driver). Repositories call `using var conn = _context.CreateConnection();` so each connection is opened, used for one operation, and **disposed** promptly — connection pooling under the hood makes this cheap.\n\nYou register the context in DI, typically as a **singleton** (it is stateless — it just creates connections), and inject it into repositories.',
          whyItMatters:
            'Centralising connection creation avoids scattering connection strings and `new NpgsqlConnection` everywhere, and the `using` pattern prevents connection leaks — a real production bug. This `DapperContext` pattern is exactly how TunMani Resort gives every repository a clean, consistent way to reach the database.',
          steps: [
            'Create `DapperContext` in Infrastructure with a constructor taking `IConfiguration`.',
            'Read the connection string: `_connectionString = config.GetConnectionString("DefaultConnection")`.',
            'Add `public IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);`.',
            'Register it in `Program.cs`: `builder.Services.AddSingleton<DapperContext>();`.',
            'Inject `DapperContext` into a repository.',
            'Use `using var conn = _context.CreateConnection();` for each query.',
          ],
          code: `// TunMani.Infrastructure/Data/DapperContext.cs
using System.Data;
using Microsoft.Extensions.Configuration;
using Npgsql;

public class DapperContext
{
    private readonly string _connectionString;

    public DapperContext(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection is not configured.");
    }

    // Returns the IDbConnection abstraction; concrete type is NpgsqlConnection
    public IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);
}

// Program.cs — register once for the whole app
builder.Services.AddSingleton<DapperContext>();`,
          pitfalls: [
            '**Reusing one long-lived connection across requests.** Causes threading bugs. Fix: create a fresh connection per operation with `using`.',
            '**Not disposing the connection.** Leaks pool connections until the app stalls. Fix: always `using var conn = ...`.',
            "**Returning `NpgsqlConnection` instead of `IDbConnection`.** Couples repos to the driver. Fix: return the `IDbConnection` interface.",
            '**Registering DapperContext as Scoped/Transient unnecessarily.** It is stateless. Fix: Singleton is fine.',
            '**Null connection string slipping through.** Fix: throw a clear error if `GetConnectionString` returns null.',
            '**Opening the connection manually before Dapper.** Dapper opens/closes as needed. Fix: just pass the connection to Dapper methods.',
          ],
          tryIt:
            'Create the `DapperContext` class exactly as shown, register it as a singleton in `Program.cs`, and inject it into a repository. In the repository, write `using var conn = _context.CreateConnection();` and confirm the project builds.',
          takeaway: 'A single `DapperContext.CreateConnection()` returns a fresh `IDbConnection` (NpgsqlConnection) per operation; register it once in DI.',
        },
      ],
    },
    {
      id: 'm1-s3',
      title: 'Dapper & Migrations',
      topics: [
        {
          id: 'm1-t8',
          title: 'What Dapper is — micro-ORM vs EF Core',
          explain:
            'Dapper is a lightweight micro-ORM: you write raw SQL and it maps results to objects. TunMani Resort uses Dapper, not EF Core.',
          analogy:
            'Booking a TunMani Resort room the EF Core way is like using a full travel agent who handles every detail but adds their own process and markup. The Dapper way is calling the resort directly and stating exactly what you want — faster, fewer surprises, but you must know precisely what to ask for. Dapper gives you that direct line: you write the SQL yourself, and it just turns the rows into C# objects.',
          theory:
            '**Dapper** is a **micro-ORM**: a thin layer over ADO.NET that takes the **SQL you write**, runs it, and **maps the result rows to your C# objects**. It does not generate SQL, track changes, or manage migrations — you stay in full control of the queries.\n\n**EF Core** is a **full ORM**: it generates SQL from LINQ, tracks entity changes, and manages migrations — more convenient but heavier and sometimes opaque.\n\nDapper\'s trade-off: **maximum control and speed** in exchange for writing SQL by hand. TunMani Resort chooses Dapper because the team wants explicit, fast, predictable SQL for a booking system, and is comfortable writing it. **TunMani Resort uses Dapper, not EF Core, for all data access.**',
          whyItMatters:
            '"Dapper vs EF Core" is a common interview discussion that tests whether you understand the control-vs-convenience trade-off. Many high-performance .NET shops use Dapper. Knowing why TunMani Resort picked it — explicit SQL, speed, simplicity — lets you justify the architecture confidently.',
          steps: [
            'Understand Dapper maps SQL results to objects; you write the SQL.',
            'Understand EF Core generates SQL from LINQ and tracks changes.',
            'Note Dapper does not do migrations — you write SQL migration files yourself.',
            'Add Dapper with `dotnet add package Dapper` (already done in the architecture section).',
            'Recall a query uses `connection.QueryAsync<Room>("SELECT ...")`.',
            'Decide: TunMani Resort uses Dapper for all data access.',
          ],
          code: `// Dapper in one line — write SQL, get objects back
using Dapper;
using var conn = _context.CreateConnection();

IEnumerable<Room> rooms = await conn.QueryAsync<Room>(
    "SELECT id, room_number AS RoomNumber, room_type AS RoomType, base_price AS BasePrice FROM rooms");

// Compare: EF Core would generate SQL from LINQ like
//   var rooms = await _db.Rooms.ToListAsync();
// EF tracks changes & manages migrations; Dapper does neither — you control the SQL.`,
          pitfalls: [
            '**Expecting Dapper to generate SQL or migrations.** It does not. Fix: write SQL and migrations yourself.',
            '**Mixing EF Core change-tracking mental models into Dapper.** There is no tracking. Fix: re-query after writes if you need fresh data.',
            "**Choosing Dapper but disliking writing SQL.** Mismatch. Fix: if you prefer LINQ and migrations, that is EF Core's strength — but this app uses Dapper.",
            '**Forgetting `using Dapper;`.** The `QueryAsync` extension methods will not appear. Fix: add the using.',
            '**Assuming Dapper validates your SQL at compile time.** It does not. Fix: test queries against the real database.',
            '**Using Dapper without parameters for user input.** SQL-injection risk. Fix: always parameterise (next topic).',
          ],
          tryIt:
            'Write one sentence each summarising when you would pick Dapper and when EF Core. Then write a single `QueryAsync<Room>` call that selects all rooms, mapping snake_case columns to your PascalCase properties with `AS` aliases.',
          takeaway: 'Dapper is a fast micro-ORM where you write the SQL; TunMani Resort uses Dapper, not EF Core, for all data access.',
        },
        {
          id: 'm1-t9',
          title: 'Querying with Dapper & parameterised SQL',
          explain:
            'Use `QueryAsync<T>`, `QuerySingleOrDefaultAsync<T>`, and `ExecuteAsync`, always passing user input as parameters to prevent SQL injection.',
          analogy:
            'When a guest gives their name at the TunMani Resort desk, the clerk writes it neatly into a labelled box on the form — never lets the guest scribble directly into the resort\'s master ledger. **Parameterised queries** are that labelled box: the value goes into a safe `@id` slot, so even a guest "named" `; DROP TABLE bookings;--` is treated as harmless text, not as a command.',
          theory:
            'Dapper adds extension methods to `IDbConnection`:\n- **`QueryAsync<T>`** — returns many rows as `IEnumerable<T>`.\n- **`QuerySingleOrDefaultAsync<T>`** — returns one row or `null` (great for "get by id").\n- **`ExecuteAsync`** — runs INSERT/UPDATE/DELETE and returns rows affected; `ExecuteScalarAsync<T>` returns a single value like a new id.\n\n**Always parameterise** user input. You write a placeholder (`@RoomNumber`) in the SQL and pass an **anonymous object** `new { RoomNumber = 101 }`. Dapper sends the value separately from the SQL text, so it **cannot be interpreted as SQL** — this is the defence against **SQL injection**. Never build SQL by string concatenation with user input.',
          whyItMatters:
            'SQL injection is one of the most serious and most-tested security vulnerabilities. Demonstrating parameterised queries is table-stakes in any backend interview. Every TunMani Resort query that touches user input — searching bookings, fetching a guest — uses parameters, keeping the resort\'s data safe.',
          steps: [
            'Use `QueryAsync<Room>` for lists.',
            'Use `QuerySingleOrDefaultAsync<Room>` with a `@id` parameter for one room.',
            'Pass parameters as an anonymous object: `new { id }`.',
            'Use `ExecuteAsync` for INSERT/UPDATE/DELETE.',
            'Use `ExecuteScalarAsync<int>` with `RETURNING id` to get the new id.',
            'Never concatenate user input into the SQL string.',
          ],
          code: `using Dapper;

// One room by id — parameterised (@id is filled safely by Dapper)
public async Task<Room?> GetByIdAsync(int id)
{
    using var conn = _context.CreateConnection();
    const string sql = @"SELECT id, room_number AS RoomNumber,
                                room_type AS RoomType, base_price AS BasePrice
                         FROM rooms WHERE id = @id";
    return await conn.QuerySingleOrDefaultAsync<Room>(sql, new { id });
}

// Insert and return the new id
public async Task<int> AddAsync(Room room)
{
    using var conn = _context.CreateConnection();
    const string sql = @"INSERT INTO rooms (room_number, room_type, base_price)
                         VALUES (@RoomNumber, @RoomType, @BasePrice)
                         RETURNING id";
    return await conn.ExecuteScalarAsync<int>(sql, room);  // props map to @params
}

// NEVER do this — SQL injection risk:
// var sql = "SELECT * FROM rooms WHERE room_type = '" + userInput + "'";`,
          pitfalls: [
            '**Concatenating user input into SQL.** Opens SQL injection. Fix: always use `@param` placeholders and an object.',
            '**Using `QuerySingleAsync` when no row may exist.** It throws. Fix: use `QuerySingleOrDefaultAsync` for optional rows.',
            "**Forgetting `RETURNING id` on insert.** You cannot get the new id. Fix: add `RETURNING id` and use `ExecuteScalarAsync<int>`.",
            '**Parameter name mismatch.** `@id` vs property `Id` — Dapper matches by name, case-insensitively, but typos break it. Fix: match names.',
            '**Awaiting nothing / blocking with `.Result`.** Causes deadlocks. Fix: `await` the async Dapper methods.',
            '**Selecting `*` and relying on column order.** Fragile. Fix: list columns explicitly with `AS` aliases.',
          ],
          tryIt:
            'Implement `GetByIdAsync(int id)` with `QuerySingleOrDefaultAsync` and an `@id` parameter, and `AddAsync(Room room)` with `ExecuteScalarAsync<int>` and `RETURNING id`. Confirm that passing a malicious string as a room type is stored as plain text, not executed.',
          takeaway: 'Use `QueryAsync`/`QuerySingleOrDefaultAsync`/`ExecuteAsync` and always pass user input as parameters to stop SQL injection.',
        },
        {
          id: 'm1-t10',
          title: 'snake_case columns & the DateOnly handler',
          explain:
            'Map PostgreSQL snake_case columns to PascalCase C# properties with AS aliases, and register a type handler so DateOnly maps to the DB date type.',
          analogy:
            'The TunMani Resort strongroom labels its drawers in one style (`room_number`, snake_case) while the front-desk staff speak in another (`RoomNumber`, PascalCase). A translator at the counter converts between them so nobody is confused. The **AS aliases** and Dapper **type handlers** are that translator — bridging Postgres\'s naming and date types to C#\'s.',
          theory:
            'PostgreSQL convention is **snake_case** columns (`room_number`, `base_price`); C# convention is **PascalCase** properties (`RoomNumber`, `BasePrice`). Dapper matches names **case-insensitively but not across underscores**, so you bridge them either by **`AS` aliases** in SQL (`room_number AS RoomNumber`) or by enabling Dapper\'s `MatchNamesWithUnderscores` option globally.\n\n**`DateOnly`** (the check-in/check-out date type) is newer than some Dapper/Npgsql versions handle automatically. You register a small **`SqlMapper.TypeHandler<DateOnly>`** that converts between `DateOnly` and the database `date` type, then add it once at startup with `SqlMapper.AddTypeHandler(...)`. After that, `DateOnly` properties map cleanly to/from Postgres `date` columns.',
          whyItMatters:
            'Naming-convention mismatches and unsupported types cause silently null properties — a subtle, time-wasting bug. Knowing how to bridge snake_case and register a `DateOnly` handler shows real Dapper depth, and it is exactly what makes TunMani Resort\'s booking dates round-trip correctly.',
          steps: [
            'Decide on AS aliases (`room_number AS RoomNumber`) or the global underscore option.',
            'For the global approach: `Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;` at startup.',
            'Create a `DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>`.',
            'Implement `SetValue` (DateOnly → DateTime) and `Parse` (DB value → DateOnly).',
            'Register it once at startup: `SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());`.',
            'Query a table with a `date` column into a `DateOnly` property and confirm it maps.',
          ],
          code: `using System.Data;
using Dapper;

// Option A: enable underscore matching globally (run once at startup)
// DefaultTypeMap.MatchNamesWithUnderscores = true; // then no AS aliases needed

// Option B (used in examples): AS aliases in SQL
//   SELECT room_number AS RoomNumber FROM rooms

// DateOnly <-> Postgres 'date' type handler
public class DateOnlyTypeHandler : SqlMapper.TypeHandler<DateOnly>
{
    public override void SetValue(IDbDataParameter parameter, DateOnly value)
    {
        parameter.DbType = DbType.Date;
        parameter.Value = value.ToDateTime(TimeOnly.MinValue); // DateOnly -> DateTime
    }

    public override DateOnly Parse(object value)
        => DateOnly.FromDateTime((DateTime)value);             // DB value -> DateOnly
}

// Register once at app startup (Program.cs):
// SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());`,
          pitfalls: [
            '**snake_case column not mapping, property stays default.** Fix: add an `AS PascalCase` alias or enable `MatchNamesWithUnderscores`.',
            '**Registering the DateOnly handler multiple times.** Throws on duplicate. Fix: register once at startup.',
            "**Storing DateOnly in a `timestamp` column.** Wrong type. Fix: use a `date` column for pure dates.",
            '**Mixing AS aliases and the global underscore option inconsistently.** Confusing. Fix: pick one strategy and stick to it.',
            '**Casting the DB value to the wrong .NET type in Parse.** Throws. Fix: cast to `DateTime` then `DateOnly.FromDateTime`.',
            '**Forgetting to set `DbType.Date` in SetValue.** May send the wrong type. Fix: set it explicitly.',
          ],
          tryIt:
            'Add the `DateOnlyTypeHandler`, register it once at startup, and query a table with a `date` column (e.g. a booking check-in) into a `DateOnly` property. Confirm the date round-trips correctly instead of coming back as default.',
          takeaway: 'Bridge snake_case to PascalCase with AS aliases (or the underscore option), and register a `DateOnly` type handler for date columns.',
        },
        {
          id: 'm1-t11',
          title: 'Idempotent SQL migrations & a runner',
          explain:
            'Write idempotent migration SQL (IF NOT EXISTS, ON CONFLICT) and a simple runner that applies the files at startup.',
          analogy:
            'TunMani Resort\'s setup checklist is written so it can be run every morning without harm: "if the rooms table does not already exist, create it." Running the checklist twice changes nothing the second time. **Idempotent migrations** are exactly that safe-to-rerun checklist — `IF NOT EXISTS` and `ON CONFLICT DO NOTHING` mean applying them again never breaks an already-set-up database.',
          theory:
            'Because Dapper has no built-in migrations, TunMani Resort keeps plain **`.sql` migration files** (e.g. `001_create_rooms.sql`) in `Infrastructure/Data/Migrations`. Writing them **idempotently** means they can run repeatedly with no error:\n- **`CREATE TABLE IF NOT EXISTS`** for tables.\n- **`CREATE INDEX IF NOT EXISTS`** for indexes.\n- **`INSERT ... ON CONFLICT DO NOTHING`** for seed data.\n\nA small **migration runner** runs at app startup: it reads the `.sql` files in order and executes each with Dapper\'s `ExecuteAsync`. Because the SQL is idempotent, re-running the app simply re-applies harmlessly. (A more advanced runner records applied versions in a table, but `IF NOT EXISTS` keeps the simple version safe.)',
          whyItMatters:
            'Database migrations are a core production concern — interviewers ask how you evolve a schema safely. Idempotent SQL lets a new developer clone TunMani Resort, run the app, and get a ready database with zero manual setup, while never corrupting an existing one. That reliability is what professional teams expect.',
          steps: [
            'Create `Infrastructure/Data/Migrations/001_create_rooms.sql`.',
            'Write `CREATE TABLE IF NOT EXISTS rooms (...)` with snake_case columns.',
            'Seed sample rooms with `INSERT ... ON CONFLICT (room_number) DO NOTHING`.',
            'Add a unique constraint so the conflict target exists.',
            'Write a `MigrationRunner` that reads the `.sql` files in order and runs each with `ExecuteAsync`.',
            'Call the runner at startup and confirm re-running the app does not error.',
          ],
          code: `-- Infrastructure/Data/Migrations/001_create_rooms.sql  (idempotent)
CREATE TABLE IF NOT EXISTS rooms (
    id          SERIAL PRIMARY KEY,
    room_number INTEGER NOT NULL UNIQUE,
    room_type   TEXT    NOT NULL,
    base_price  NUMERIC(10,2) NOT NULL
);

-- Safe to re-run: seed rows are skipped if room_number already exists
INSERT INTO rooms (room_number, room_type, base_price) VALUES
    (101, 'Sea-View', 4500.00),
    (102, 'Deluxe',   3000.00),
    (103, 'Suite',    7000.00)
ON CONFLICT (room_number) DO NOTHING;`,
          pitfalls: [
            '**Plain `CREATE TABLE` without `IF NOT EXISTS`.** Fails on second run. Fix: add `IF NOT EXISTS`.',
            '**`INSERT` seed data without `ON CONFLICT`.** Duplicate-key error on re-run. Fix: add `ON CONFLICT (...) DO NOTHING`.',
            "**No unique constraint for the conflict target.** `ON CONFLICT (room_number)` needs the unique index. Fix: add `UNIQUE` on `room_number`.",
            '**Running migration files out of order.** Later files assume earlier tables. Fix: order by numeric prefix (`001_`, `002_`).',
            '**Using `decimal`-unfriendly column types for money.** Fix: use `NUMERIC(10,2)` for prices, not `float`.',
            '**Forgetting to call the runner at startup.** Tables never get created. Fix: invoke the runner in `Program.cs`.',
          ],
          tryIt:
            'Write `001_create_rooms.sql` with `CREATE TABLE IF NOT EXISTS` and an `ON CONFLICT DO NOTHING` seed, then build a small runner that executes it with `ExecuteAsync`. Run your app twice and confirm the second run produces no errors and no duplicate rows.',
          takeaway: 'Write idempotent migrations (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`) and a startup runner so the schema sets up safely and repeatably.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm1-p1',
      type: 'Mini Project',
      title: 'Scaffold the TunMani Resort Solution (Layered)',
      domain: 'ASP.NET Core / Clean Architecture',
      duration: '2 hours',
      description:
        'Create the multi-project TunMani Resort solution with Domain, Application, Infrastructure, Services, and Web layers, wire up project references in the correct dependency direction, and add the core NuGet packages.',
      tools: ['.NET 10 SDK', 'C#', 'ASP.NET Core MVC', 'Dapper', 'Npgsql'],
      blueprint: {
        overview:
          'Build the skeleton of the real app. Five class-library/web projects wired with references that only point inward (Web → Services → Application → Domain; Infrastructure → Application/Domain). This is the foundation every later module builds on.',
        functionalRequirements: [
          '**Five projects.** Domain, Application, Infrastructure, Services, Web — in one solution.',
          '**Correct references.** Dependencies point inward only; Domain references nothing.',
          '**Core entities.** A `Room` entity in Domain and `IRoomRepository` + `RoomDto` in Application.',
          '**Packages.** Dapper and Npgsql in Infrastructure; Google auth, QuestPDF, MailKit in Web.',
          '**Builds clean.** `dotnet build` succeeds with no circular references.',
        ],
        technicalImplementation: [
          '**Solution.** A `TunMani.sln` containing all five projects.',
          '**Class libraries.** Domain, Application, Infrastructure, Services as `classlib`; Web as `mvc`.',
          '**References.** Added with `dotnet add reference` following the inward-only rule.',
          '**Entities/interfaces.** `Room` in Domain, `IRoomRepository` and `RoomDto` in Application.',
          '**NuGet.** `dotnet add package` for Dapper, Npgsql, and the Web-only packages.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Create solution & projects',
            outcome: 'A solution with five correctly-referenced projects.',
            prompt:
              'Create a .NET 10 solution named TunMani with five projects: TunMani.Domain (classlib), TunMani.Application (classlib), TunMani.Infrastructure (classlib), TunMani.Services (classlib), and TunMani.Web (mvc). Add project references so dependencies point inward only: Application -> Domain; Infrastructure -> Application, Domain; Services -> Application, Domain; Web -> Services, Application, Domain. Use dotnet new sln, dotnet new classlib/mvc, dotnet sln add, and dotnet add reference. Run dotnet build to confirm there are no circular references.',
          },
          {
            step: 2,
            label: 'Core entities & contracts',
            outcome: 'A Room entity and the repository interface + DTO.',
            prompt:
              'In TunMani.Domain add a Room entity (Id int, RoomNumber int, RoomType string, BasePrice decimal). In TunMani.Application add an IRoomRepository interface with Task<IEnumerable<Room>> GetAllAsync(), Task<Room?> GetByIdAsync(int id), and Task<int> AddAsync(Room room); and a RoomDto record (Id, RoomNumber, RoomType, BasePrice). Keep Domain free of any database or ASP.NET references.',
          },
          {
            step: 3,
            label: 'Add NuGet packages',
            outcome: 'The required packages installed in the right projects.',
            prompt:
              'Add Dapper and Npgsql to TunMani.Infrastructure with dotnet add package. Add Microsoft.AspNetCore.Authentication.Google, QuestPDF, and MailKit to TunMani.Web. Then run dotnet build and show me the relevant PackageReference lines from each .csproj so I can confirm they were added to the correct projects.',
          },
        ],
      },
    },
    {
      id: 'm1-p2',
      type: 'Mini Project',
      title: 'Wire DapperContext & Run the First Migration',
      domain: 'Dapper / PostgreSQL',
      duration: '2 hours',
      description:
        'Connect the TunMani Resort app to PostgreSQL: build the DapperContext, register it in DI, run an idempotent migration that creates and seeds a rooms table, then query it with a Dapper repository.',
      tools: ['.NET 10 SDK', 'Dapper', 'Npgsql', 'PostgreSQL', 'C#'],
      blueprint: {
        overview:
          'Make the app actually talk to the database. A DapperContext supplies connections, an idempotent SQL migration creates a seeded rooms table, a migration runner applies it at startup, and a RoomRepository queries the data with parameterised Dapper calls.',
        functionalRequirements: [
          '**Connection.** The app reads `ConnectionStrings:DefaultConnection` (real value in user secrets).',
          '**DapperContext.** A singleton `DapperContext.CreateConnection()` returns an `IDbConnection`.',
          '**Migration.** An idempotent `001_create_rooms.sql` creates and seeds the rooms table.',
          '**Runner.** A startup runner applies the migration; re-running the app is safe.',
          '**Query.** A `RoomRepository` returns all rooms and a room by id with parameterised SQL.',
        ],
        technicalImplementation: [
          '**Config.** `DefaultConnection` in appsettings.json (placeholder) + user secrets (real).',
          '**DapperContext.** Reads the connection string from IConfiguration; returns NpgsqlConnection as IDbConnection.',
          '**Migration SQL.** `CREATE TABLE IF NOT EXISTS` + `ON CONFLICT DO NOTHING` seed rows.',
          '**Runner.** Reads `.sql` files in order and executes each with `ExecuteAsync`.',
          '**Repository.** `GetAllAsync` (QueryAsync) and `GetByIdAsync` (QuerySingleOrDefaultAsync with @id), snake_case mapped via AS aliases.',
        ],
        prompts: [
          {
            step: 1,
            label: 'DapperContext & DI',
            outcome: 'A registered DapperContext reading the connection string.',
            prompt:
              'In TunMani.Infrastructure/Data create a DapperContext class that takes IConfiguration, reads ConnectionStrings:DefaultConnection, and exposes IDbConnection CreateConnection() returning a new NpgsqlConnection. Throw a clear exception if the connection string is missing. Register it as a singleton in TunMani.Web/Program.cs. Add a DefaultConnection placeholder to appsettings.json and show me the dotnet user-secrets commands to store the real value for the tunmani_resort database.',
          },
          {
            step: 2,
            label: 'Migration & runner',
            outcome: 'An idempotent rooms migration applied at startup.',
            prompt:
              'Create TunMani.Infrastructure/Data/Migrations/001_create_rooms.sql that idempotently creates a rooms table (id SERIAL PRIMARY KEY, room_number INTEGER NOT NULL UNIQUE, room_type TEXT NOT NULL, base_price NUMERIC(10,2) NOT NULL) using CREATE TABLE IF NOT EXISTS, and seeds rooms 101 Sea-View 4500, 102 Deluxe 3000, 103 Suite 7000 using INSERT ... ON CONFLICT (room_number) DO NOTHING. Then write a MigrationRunner that reads the .sql files in Migrations in filename order and executes each with Dapper ExecuteAsync, and call it once at startup in Program.cs. Make sure running the app twice causes no errors.',
          },
          {
            step: 3,
            label: 'Dapper repository',
            outcome: 'A RoomRepository querying the seeded rooms.',
            prompt:
              'Implement RoomRepository : IRoomRepository in TunMani.Infrastructure using the DapperContext. GetAllAsync uses QueryAsync<Room> with snake_case columns aliased to PascalCase (room_number AS RoomNumber etc). GetByIdAsync uses QuerySingleOrDefaultAsync<Room> with a parameterised @id. AddAsync inserts with parameters and RETURNING id via ExecuteScalarAsync<int>. Register it for DI (AddScoped<IRoomRepository, RoomRepository>), then add a temporary endpoint or log that lists all rooms so I can confirm the data comes back from PostgreSQL.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm1-q1',
      q: 'In TunMani Resort\'s Clean Architecture, which layer must have no dependency on databases or ASP.NET?',
      options: ['Infrastructure', 'Web', 'Domain', 'Services'],
      answer: 2,
    },
    {
      id: 'm1-q2',
      q: 'Where should the IRoomRepository interface be defined, and where should its Dapper implementation live?',
      options: [
        'Interface in Infrastructure, implementation in Domain',
        'Interface in Application, implementation in Infrastructure',
        'Both in the Web layer',
        'Both in Domain',
      ],
      answer: 1,
    },
    {
      id: 'm1-q3',
      q: 'What does DapperContext.CreateConnection() return for the TunMani Resort app?',
      options: [
        'A DbContext',
        'A long-lived shared connection',
        'A fresh IDbConnection (NpgsqlConnection)',
        'A connection string',
      ],
      answer: 2,
    },
    {
      id: 'm1-q4',
      q: 'How do you safely pass a user-supplied room id into a Dapper query to prevent SQL injection?',
      options: [
        'Concatenate it into the SQL string',
        'Use a parameter like @id with an anonymous object new { id }',
        'Escape quotes manually',
        'Store it in a global variable',
      ],
      answer: 1,
    },
    {
      id: 'm1-q5',
      q: 'Which SQL makes a migration safe to run repeatedly (idempotent) when seeding rows?',
      options: [
        'INSERT without any guard',
        'CREATE TABLE only',
        'INSERT ... ON CONFLICT DO NOTHING',
        'DROP TABLE before every insert',
      ],
      answer: 2,
    },
    {
      id: 'm1-q6',
      q: 'Why does TunMani Resort use Dapper rather than EF Core?',
      options: [
        'Dapper auto-generates migrations',
        'Dapper gives explicit, fast, hand-written SQL with full control',
        'Dapper tracks entity changes automatically',
        'Dapper requires no database driver',
      ],
      answer: 1,
    },
  ],
};
