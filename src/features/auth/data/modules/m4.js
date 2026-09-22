// Module 4 — Rooms & Room Bookings for the "TunMani Resort" management web app.
// ASP.NET Core MVC + Web API, C#, PostgreSQL via Dapper. Teaches the resort-stay
// booking feature end-to-end: room inventory CRUD, availability/date-overlap
// checks, the multi-room create-booking flow, and the check-in/checkout workflow.

export const m4 = {
  id: 'm4',
  title: 'Rooms & Room Bookings',
  hours: 9,
  color: 'from-orange-500/20 to-orange-700/10',
  accent: 'orange',
  description:
    'Build the resort-stay booking feature of TunMani Resort: a Room inventory CRUD, an availability check that finds rooms free for a date range, the multi-room create-booking flow with customer search, and the check-in/checkout workflow with a smart resume.',
  sections: [
    {
      id: 'm4-s1',
      title: 'Room Inventory',
      topics: [
        {
          id: 'm4-t1',
          title: 'The Room Entity and Its Repository Contract',
          explain:
            'Define the `Room` model (RoomNumber, RoomType, Capacity, BasePrice, GstRate 12%, IsActive) and an `IRoomRepository` interface that every higher layer talks to.',
          analogy:
            'Walk into the front office of **TunMani Resort in Byndoor**. On the wall hangs a **room board**: a labelled slot for every room — *Sea-View Deluxe 201, Garden Twin 105* — showing its type, how many guests it sleeps, the nightly rate, and a little flag for "out of service". The `Room` entity is one slot on that board. The `IRoomRepository` is the office rule that says *only the front desk touches the board* — nobody scribbles on it directly.',
          theory:
            "A **room** is the unit you rent by the night, so the `Room` class carries exactly the fields the front desk cares about: `Id`, `RoomNumber` (e.g. `\"201\"`), `RoomType` (Deluxe / Twin / Suite), `Capacity` (max guests), `BasePrice` (nightly rate before tax), `GstRate` (the GST percent — **12% for room stays** under Indian rules), and `IsActive` (a soft on/off flag).\n\nIn ASP.NET Core you separate **what** data operations exist from **how** they run against PostgreSQL. The **what** is an interface, `IRoomRepository`, listing methods like `GetAllAsync`, `GetByIdAsync`, `CreateAsync`, `UpdateAsync`, and `SetActiveAsync`. The **how** is a concrete `RoomRepository` that uses **Dapper** to run SQL. Controllers and services depend on the *interface*, never the concrete class.\n\nThis is **dependency inversion**: the booking logic asks an `IRoomRepository` for rooms and does not know or care that Dapper and Npgsql sit underneath. You register the binding once in `Program.cs` with `builder.Services.AddScoped<IRoomRepository, RoomRepository>();` and ASP.NET Core injects it wherever a constructor asks for `IRoomRepository`.\n\nKeeping `GstRate` **on the room** (not hard-coded) means a future tax change is one column update, and stores like halls (18%) can differ from rooms (12%) cleanly.",
          whyItMatters:
            'The whole booking feature reads and writes rooms through this one contract. Get the entity fields right now — especially keeping `GstRate` as data and `IsActive` as a soft flag — and pricing, availability, and reporting all line up later. Depending on the interface (not Dapper) keeps the booking service testable and lets you swap the data layer without touching business logic.',
          steps: [
            'Create `Models/Room.cs` with `Id`, `RoomNumber`, `RoomType`, `Capacity`, `BasePrice`, `GstRate`, `IsActive`.',
            'Default `GstRate` to `12m` for room stays in the create form.',
            'Create `Repositories/IRoomRepository.cs` listing `GetAllAsync`, `GetByIdAsync`, `CreateAsync`, `UpdateAsync`, `SetActiveAsync`.',
            'Create `Repositories/RoomRepository.cs` implementing the interface with Dapper (next topic fills the SQL).',
            'Register it in `Program.cs`: `builder.Services.AddScoped<IRoomRepository, RoomRepository>();`.',
            'Make the controller/service constructor take `IRoomRepository`, not `RoomRepository`.',
            'Confirm the app still builds with `dotnet build`.',
          ],
          code: `// Models/Room.cs — one room on the TunMani Resort board.
public class Room
{
    public int Id { get; set; }
    public string RoomNumber { get; set; } = "";   // e.g. "201"
    public string RoomType { get; set; } = "";      // Deluxe / Twin / Suite
    public int Capacity { get; set; }                // max guests
    public decimal BasePrice { get; set; }           // nightly rate, pre-tax
    public decimal GstRate { get; set; } = 12m;      // room stays = 12% GST
    public bool IsActive { get; set; } = true;       // soft on/off flag
}

// Repositories/IRoomRepository.cs — the contract everything depends on.
public interface IRoomRepository
{
    Task<IEnumerable<Room>> GetAllAsync();
    Task<Room?> GetByIdAsync(int id);
    Task<int> CreateAsync(Room room);
    Task UpdateAsync(Room room);
    Task SetActiveAsync(int id, bool isActive);
}

// Program.cs — bind the interface to the Dapper implementation once.
builder.Services.AddScoped<IRoomRepository, RoomRepository>();`,
          pitfalls: [
            '**Hard-coding the 12% GST in pricing code.** A tax change then means editing many files. Fix: store `GstRate` on the `Room` row.',
            '**Depending on `RoomRepository` directly in the controller.** You cannot fake the data layer in tests. Fix: depend on `IRoomRepository`.',
            "**Storing `BasePrice` as `double`.** Money rounds wrong. Fix: use `decimal` for all currency.",
            '**Forgetting to register the binding in `Program.cs`.** DI throws `Unable to resolve service`. Fix: add the `AddScoped` line.',
            '**Deleting rooms instead of deactivating.** Old bookings lose their room. Fix: an `IsActive` flag, never a hard delete.',
            '**Using `RoomNumber` as the primary key.** Renumbering breaks references. Fix: an auto `Id` plus a human-facing `RoomNumber`.',
          ],
          tryIt:
            'Sketch one example room as a row: `{ Id: 1, RoomNumber: "201", RoomType: "Sea-View Deluxe", Capacity: 3, BasePrice: 4500, GstRate: 12, IsActive: true }`. Add a `Suite` row with capacity 4 and a higher price. Confirm both fit the `Room` class with no extra fields.',
          takeaway:
            'A room is one entity with type, capacity, price, a 12% GstRate, and an IsActive flag — and every layer reaches it through the IRoomRepository contract, not Dapper directly.',
        },
        {
          id: 'm4-t2',
          title: 'Room CRUD with Dapper and PostgreSQL',
          explain:
            'Implement `RoomRepository` against PostgreSQL using Dapper — parameterised SQL for select, insert (returning the new id), and update.',
          analogy:
            'Dapper is the **fast clerk** at the TunMani Resort office: you hand him a slip of SQL with blanks (`@RoomNumber`, `@BasePrice`) and the values to fill in, and he runs to the PostgreSQL cabinet and brings back exactly the rows. He never lets a guest write raw text straight onto the SQL slip — the blanks are filled safely, so a cheeky room name can never become a database command.',
          theory:
            "**Dapper** is a thin layer over ADO.NET that maps SQL results to C# objects. You open an `NpgsqlConnection`, call `QueryAsync<Room>(sql)` or `ExecuteAsync(sql, params)`, and Dapper materialises rows into `Room` objects by matching column names to properties.\n\nEvery query uses **parameters** (`@RoomNumber`), never string concatenation. Parameters are the defence against **SQL injection** and also let PostgreSQL cache the query plan. You pass a plain object — `new { room.RoomNumber, room.BasePrice }` — and Dapper binds each property to the matching `@name`.\n\nFor **insert**, PostgreSQL's `RETURNING id` gives you the new primary key in the same round trip: `INSERT INTO rooms (...) VALUES (...) RETURNING id;` paired with `ExecuteScalarAsync<int>(...)`. This is the Postgres equivalent of SQL Server's `SCOPED_IDENTITY()` — you get the generated `Id` back immediately so the caller can redirect to the new room.\n\nFor **update**, an `UPDATE ... WHERE id = @Id` with `ExecuteAsync` returns the affected row count. The connection comes from a single connection-string source (injected `IConfiguration` or a small factory), so credentials live in `appsettings.json`, not in code.\n\nColumn names in Postgres are conventionally `snake_case` (`base_price`), while C# uses `PascalCase` (`BasePrice`). Alias them in SQL (`base_price AS BasePrice`) or enable Dapper's matching so the mapping is clean.",
          whyItMatters:
            'This repository is the only place SQL touches the rooms table, so every read and write in the feature is consistent, parameterised, and injection-safe. `RETURNING id` lets the create flow redirect to the freshly made room without a second query, and aliasing keeps Postgres snake_case columns mapping cleanly onto C# properties — small disciplines that prevent whole classes of bugs.',
          steps: [
            'Inject the connection string via `IConfiguration` and open an `NpgsqlConnection` per call.',
            'Implement `GetAllAsync` with `QueryAsync<Room>("SELECT ... FROM rooms ORDER BY room_number")`.',
            'Implement `GetByIdAsync` with `QuerySingleOrDefaultAsync<Room>(sql, new { Id = id })`.',
            'Implement `CreateAsync` with `INSERT ... RETURNING id` via `ExecuteScalarAsync<int>`.',
            'Implement `UpdateAsync` with `UPDATE rooms SET ... WHERE id = @Id` via `ExecuteAsync`.',
            'Alias snake_case columns to PascalCase (`base_price AS BasePrice`) so mapping is exact.',
            'Always pass values as parameters — never concatenate strings into SQL.',
          ],
          code: `// Repositories/RoomRepository.cs — Dapper against PostgreSQL.
using Dapper;
using Npgsql;

public class RoomRepository : IRoomRepository
{
    private readonly string _cs;
    public RoomRepository(IConfiguration cfg) =>
        _cs = cfg.GetConnectionString("Default")!;

    private NpgsqlConnection Conn() => new NpgsqlConnection(_cs);

    public async Task<IEnumerable<Room>> GetAllAsync()
    {
        const string sql = @"
            SELECT id, room_number AS RoomNumber, room_type AS RoomType,
                   capacity, base_price AS BasePrice, gst_rate AS GstRate,
                   is_active AS IsActive
            FROM rooms ORDER BY room_number;";
        using var c = Conn();
        return await c.QueryAsync<Room>(sql);
    }

    public async Task<int> CreateAsync(Room r)
    {
        const string sql = @"
            INSERT INTO rooms (room_number, room_type, capacity,
                               base_price, gst_rate, is_active)
            VALUES (@RoomNumber, @RoomType, @Capacity,
                    @BasePrice, @GstRate, @IsActive)
            RETURNING id;";                       // Postgres hands back the new id
        using var c = Conn();
        return await c.ExecuteScalarAsync<int>(sql, r);
    }

    public async Task SetActiveAsync(int id, bool isActive)
    {
        const string sql = "UPDATE rooms SET is_active = @isActive WHERE id = @id;";
        using var c = Conn();
        await c.ExecuteAsync(sql, new { id, isActive });
    }
}`,
          pitfalls: [
            '**Concatenating user input into SQL.** Opens SQL injection. Fix: always use `@parameters` and pass an object.',
            "**Forgetting `RETURNING id` on insert.** You then run a second query to find the new row. Fix: `INSERT ... RETURNING id` with `ExecuteScalarAsync<int>`.",
            '**Mismatched column vs property names.** `base_price` will not map to `BasePrice`. Fix: alias `base_price AS BasePrice`.',
            '**Not disposing the connection.** You leak connections under load. Fix: `using var c = Conn();`.',
            '**Using `QuerySingleAsync` when a row may be missing.** It throws. Fix: `QuerySingleOrDefaultAsync` for by-id reads.',
            '**Putting the connection string in code.** Hard to change per environment. Fix: read it from `appsettings.json` via `IConfiguration`.',
          ],
          tryIt:
            'Add `UpdateAsync(Room room)` that runs `UPDATE rooms SET room_type=@RoomType, capacity=@Capacity, base_price=@BasePrice, gst_rate=@GstRate WHERE id=@Id;`. Then in a scratch console, create a room, read it back by id, update its price, and read again — confirm only the price changed.',
          takeaway:
            'Dapper runs parameterised SQL that maps columns to Room properties; use RETURNING id on insert and always pass values as parameters, never concatenated strings.',
        },
        {
          id: 'm4-t3',
          title: 'The Room Service Layer',
          explain:
            'Add a `RoomService` between controller and repository to hold business rules — validation, default GST, and the active/inactive decision — so controllers stay thin.',
          analogy:
            'The TunMani Resort **front-desk manager** sits between the guest-facing clerk and the room board. The clerk takes requests; the manager checks the rules — "a room must sleep at least one guest", "rate cannot be negative", "new rooms default to 12% GST" — before anything reaches the board. `RoomService` is that manager: the controller (clerk) never enforces rules itself.',
          theory:
            "A **service** holds **business logic** that does not belong in the controller (HTTP concerns) or the repository (SQL concerns). `RoomService` depends on `IRoomRepository` and exposes methods the controller calls: `ListAsync`, `GetAsync`, `SaveAsync`, `ToggleActiveAsync`.\n\nThe service is where **defaults and rules** live. When creating a room it sets `GstRate = 12m` if unset, trims the `RoomNumber`, and rejects a `Capacity` below 1 or a negative `BasePrice`. `SaveAsync` decides **create vs update** by checking whether `Id == 0` (a fresh room) or `> 0` (an edit) and calls the right repository method.\n\nThis **thin-controller, fat-service** split keeps each layer focused: the controller maps HTTP to method calls and chooses a view; the service decides *what is allowed*; the repository decides *how to persist*. You register it like the repository: `builder.Services.AddScoped<RoomService>();` (or behind an `IRoomService` interface for testability).\n\nReturning a small **result type** — e.g. `(bool Ok, string? Error, int Id)` — from `SaveAsync` lets the controller show a validation message without throwing exceptions for ordinary user mistakes. Exceptions are for the unexpected; a too-low capacity is expected and handled as data.",
          whyItMatters:
            'Pushing rules into the service means the same validation runs whether a room is created from the web form, an API call, or a seed script — there is one place the rules live. Thin controllers are easy to read and test, and the create-vs-update decision in one method prevents the duplicate-row bug where an edit accidentally inserts a new room.',
          steps: [
            'Create `Services/RoomService.cs` taking `IRoomRepository` in its constructor.',
            'Add `ListAsync()` and `GetAsync(int id)` that pass through to the repository.',
            'In `SaveAsync(Room)`, trim `RoomNumber` and default `GstRate` to `12m` when zero.',
            'Validate: `Capacity >= 1`, `BasePrice >= 0`; return an error result if not.',
            'Branch on `Id == 0` to call `CreateAsync`, else `UpdateAsync`.',
            'Add `ToggleActiveAsync(int id, bool active)` calling `SetActiveAsync`.',
            'Register with `builder.Services.AddScoped<RoomService>();`.',
          ],
          code: `// Services/RoomService.cs — rules live here, not in the controller.
public class RoomService
{
    private readonly IRoomRepository _repo;
    public RoomService(IRoomRepository repo) => _repo = repo;

    public Task<IEnumerable<Room>> ListAsync() => _repo.GetAllAsync();
    public Task<Room?> GetAsync(int id) => _repo.GetByIdAsync(id);

    // Returns a small result so the controller can show validation messages.
    public async Task<(bool Ok, string? Error, int Id)> SaveAsync(Room room)
    {
        room.RoomNumber = (room.RoomNumber ?? "").Trim();
        if (room.GstRate <= 0) room.GstRate = 12m;       // default for stays
        if (string.IsNullOrEmpty(room.RoomNumber))
            return (false, "Room number is required.", 0);
        if (room.Capacity < 1)
            return (false, "Capacity must be at least 1.", 0);
        if (room.BasePrice < 0)
            return (false, "Price cannot be negative.", 0);

        if (room.Id == 0)
        {
            var id = await _repo.CreateAsync(room);       // new room
            return (true, null, id);
        }
        await _repo.UpdateAsync(room);                    // edit existing
        return (true, null, room.Id);
    }

    public Task ToggleActiveAsync(int id, bool active) =>
        _repo.SetActiveAsync(id, active);
}`,
          pitfalls: [
            '**Putting validation in the controller.** API callers then bypass it. Fix: validate in the service so every entry point is covered.',
            '**Throwing exceptions for ordinary validation failures.** They are slow and noisy. Fix: return a result tuple/object.',
            "**Deciding create-vs-update in two places.** They drift apart. Fix: one `SaveAsync` that branches on `Id == 0`.",
            '**Letting the service know about `HttpContext` or views.** It becomes untestable. Fix: keep HTTP concerns in the controller.',
            '**Not trimming `RoomNumber`.** `" 201"` and `"201"` look different. Fix: trim before saving.',
            '**Skipping the GST default.** A zero rate produces zero tax silently. Fix: default `GstRate` to 12 when unset.',
          ],
          tryIt:
            'Add a rule to `SaveAsync` rejecting a duplicate `RoomNumber` on create (look it up first via a new `GetByNumberAsync`). Then try saving two rooms both numbered "201" and confirm the second returns `(false, "Room number already exists.", 0)`.',
          takeaway:
            'The service holds room rules and the create-vs-update decision so controllers stay thin and the same validation runs for web, API, and seed paths.',
        },
        {
          id: 'm4-t4',
          title: 'The Rooms List and Create/Edit Razor Views',
          explain:
            'Build the `RoomController` actions and Razor views: a rooms list table, and a shared create/edit form with model validation.',
          analogy:
            'The TunMani Resort **room board on a screen**: one page lists every room with type, capacity, rate, and a status badge, plus an *Edit* link. Click *Add Room* and a small paper form slides out with labelled boxes; the office refuses to file it until every box is sensibly filled. That refusal — red text under an empty box — is model validation.',
          theory:
            "`RoomController` is an MVC controller with actions that return **views**. `Index()` calls `RoomService.ListAsync()` and passes the rooms to `Views/Room/Index.cshtml`, which renders a table. `Create()` (GET) returns an empty form; `Create(Room)` (POST) calls `SaveAsync`. `Edit(int id)` (GET) loads the room into the same form; `Edit(Room)` (POST) saves it.\n\nValidation comes from **DataAnnotations** on a view model or the entity: `[Required]`, `[Range(1, 20)]` on `Capacity`, `[Range(0, 100000)]` on `BasePrice`. The view uses tag helpers — `asp-for`, `asp-validation-for` — to bind inputs and show messages. On POST you check `if (!ModelState.IsValid) return View(model);` to redraw the form with errors instead of saving bad data.\n\nThe **same partial** (`_Form.cshtml`) serves both create and edit — the only difference is whether `Id` is zero. This avoids two near-identical forms drifting apart.\n\nAfter a successful save you **redirect** (`RedirectToAction(nameof(Index))`) rather than returning the view, following the **POST-Redirect-GET** pattern so a browser refresh does not resubmit the form. A `TempData[\"Msg\"]` flash message confirms the save on the list page.\n\nGuard POST actions with `[ValidateAntiForgeryToken]` and include `@Html.AntiForgeryToken()` (the tag helper adds it automatically) to block cross-site form posts.",
          whyItMatters:
            'This is the staff-facing surface of the whole room module. Server-side `ModelState` validation means a bad capacity or price never reaches the database even if a user disables JavaScript. The POST-Redirect-GET pattern stops accidental double-creates on refresh, and one shared form keeps create and edit identical so a field added once appears in both.',
          steps: [
            'Create `Controllers/RoomController.cs` taking `RoomService` via the constructor.',
            'Add `Index()` returning the rooms list; build `Views/Room/Index.cshtml` as a table.',
            'Annotate the model: `[Required]` on `RoomNumber`, `[Range(1,20)]` on `Capacity`.',
            'Add `Create()`/`Create(Room)` and `Edit(int id)`/`Edit(Room)` actions.',
            'Build `Views/Room/_Form.cshtml` with `asp-for`/`asp-validation-for` tag helpers.',
            'On POST, `if (!ModelState.IsValid) return View(model);` before saving.',
            'On success, `RedirectToAction(nameof(Index))` and flash via `TempData`.',
          ],
          code: `// Controllers/RoomController.cs
public class RoomController : Controller
{
    private readonly RoomService _svc;
    public RoomController(RoomService svc) => _svc = svc;

    public async Task<IActionResult> Index() => View(await _svc.ListAsync());

    [HttpGet]
    public IActionResult Create() => View("_Form", new Room());

    [HttpPost, ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Room room)
    {
        if (!ModelState.IsValid) return View("_Form", room);
        var (ok, error, _) = await _svc.SaveAsync(room);
        if (!ok) { ModelState.AddModelError("", error!); return View("_Form", room); }
        TempData["Msg"] = "Room saved.";
        return RedirectToAction(nameof(Index)); // POST-Redirect-GET
    }
}

/* Views/Room/_Form.cshtml */
@model Room
<form asp-action="@(Model.Id == 0 ? "Create" : "Edit")" method="post">
    <input type="hidden" asp-for="Id" />
    <label asp-for="RoomNumber"></label>
    <input asp-for="RoomNumber" class="form-control" />
    <span asp-validation-for="RoomNumber" class="text-danger"></span>

    <label asp-for="Capacity"></label>
    <input asp-for="Capacity" class="form-control" />
    <span asp-validation-for="Capacity" class="text-danger"></span>

    <label asp-for="BasePrice"></label>
    <input asp-for="BasePrice" class="form-control" />
    <button type="submit" class="btn btn-primary">Save</button>
</form>`,
          pitfalls: [
            '**Returning the view after a successful POST.** A refresh resubmits and double-creates. Fix: POST-Redirect-GET via `RedirectToAction`.',
            '**Skipping `ModelState.IsValid`.** Bad data reaches the database. Fix: check it and redraw the form with errors.',
            "**Two separate create and edit forms.** They drift apart. Fix: one shared `_Form.cshtml` keyed on `Id == 0`.",
            '**No anti-forgery token on POST.** The form is open to CSRF. Fix: `[ValidateAntiForgeryToken]` plus the tag helper token.',
            '**Showing only client-side validation.** It is bypassable. Fix: rely on server-side `ModelState` too.',
            '**Hard-coding the action name in the form.** Edit posts to Create. Fix: choose the action from `Model.Id`.',
          ],
          tryIt:
            'Add an `Edit(int id)` GET that loads a room with `_svc.GetAsync(id)` and returns `_Form`, and an `Edit(Room)` POST mirroring Create. Edit room "201" to a new price, refresh the list, and confirm the change shows and a refresh does not duplicate it.',
          takeaway:
            'RoomController returns Razor views with server-side ModelState validation, one shared create/edit form, and POST-Redirect-GET so refreshes never double-submit.',
        },
        {
          id: 'm4-t5',
          title: 'The Active/Inactive Toggle',
          explain:
            'Add a soft on/off switch so rooms under renovation disappear from booking without deleting history — a one-field update plus a status badge.',
          analogy:
            'When room 201 at TunMani Resort floods during the monsoon, the front desk does not **tear its slot off the board** — they flip a small **"out of service" tag** so no new guest is assigned there, while every past stay in that room still shows in the records. `IsActive = false` is that tag.',
          theory:
            "**Soft delete** means flipping `IsActive` instead of removing the row. A `RoomController.ToggleActive(int id, bool active)` POST calls `RoomService.ToggleActiveAsync`, which runs the one-field `SetActiveAsync` update. The room stays in the table, so every historical booking that references it still resolves to a real room.\n\nWhy never hard-delete? Bookings store a foreign key to `room_id`. Deleting a room would either violate that constraint or orphan past stays, breaking invoices and reports. A flag costs one boolean column and keeps history intact.\n\nThe **availability query** and the booking screens filter on `is_active = true`, so an inactive room simply stops being offered without any other code change. The admin rooms list still shows inactive rooms (with a grey *Inactive* badge and a *Reactivate* button) so staff can bring a room back after renovation.\n\nThe toggle is a **POST**, not a GET link, because it changes state — GET requests must be safe and idempotent, and a search-engine crawler must never be able to deactivate a room by following a link. The button posts a tiny form with the room `id` and the target `active` value, protected by an anti-forgery token.",
          whyItMatters:
            'Real resorts constantly take rooms in and out of service for maintenance, and a hard delete would corrupt the booking and invoice history that points at those rooms. A single `IsActive` flag, filtered in the availability query, hides a room from new bookings instantly while preserving every past stay — and using POST keeps the action safe from crawlers and CSRF.',
          steps: [
            'Add `ToggleActive(int id, bool active)` as a `[HttpPost]` action on `RoomController`.',
            'Have it call `_svc.ToggleActiveAsync(id, active)` then redirect to `Index`.',
            'In the rooms list, render a status badge from `IsActive` (Active / Inactive).',
            'Add a small POST form with the room `id` and target `active` for the toggle button.',
            'Ensure the availability query and booking screens filter `is_active = true`.',
            'Keep inactive rooms visible in the admin list with a *Reactivate* button.',
            'Protect the toggle form with `[ValidateAntiForgeryToken]`.',
          ],
          code: `// RoomController — soft on/off, not a delete.
[HttpPost, ValidateAntiForgeryToken]
public async Task<IActionResult> ToggleActive(int id, bool active)
{
    await _svc.ToggleActiveAsync(id, active);
    TempData["Msg"] = active ? "Room reactivated." : "Room marked out of service.";
    return RedirectToAction(nameof(Index));
}

/* Views/Room/Index.cshtml — badge + toggle button per row */
@foreach (var r in Model)
{
    <tr>
        <td>@r.RoomNumber</td>
        <td>@r.RoomType</td>
        <td>@r.BasePrice.ToString("C")</td>
        <td>
            @if (r.IsActive)
            { <span class="badge bg-success">Active</span> }
            else
            { <span class="badge bg-secondary">Inactive</span> }
        </td>
        <td>
            <form asp-action="ToggleActive" method="post" class="d-inline">
                <input type="hidden" name="id" value="@r.Id" />
                <input type="hidden" name="active" value="@(!r.IsActive)" />
                <button class="btn btn-sm btn-outline-secondary">
                    @(r.IsActive ? "Deactivate" : "Reactivate")
                </button>
            </form>
        </td>
    </tr>
}`,
          pitfalls: [
            '**Hard-deleting a room.** Foreign keys from bookings break or orphan history. Fix: flip `IsActive` instead.',
            '**Toggling via a GET link.** Crawlers and prefetch can deactivate rooms. Fix: make it a POST form.',
            "**Forgetting to filter `is_active` in availability.** Inactive rooms still get booked. Fix: add `AND is_active = true`.",
            '**Hiding inactive rooms from the admin list too.** Staff cannot reactivate them. Fix: show them with a badge and Reactivate button.',
            '**No anti-forgery token on the toggle.** It is open to CSRF. Fix: `[ValidateAntiForgeryToken]`.',
            '**Not flashing a confirmation.** Staff are unsure it worked. Fix: set `TempData["Msg"]`.',
          ],
          tryIt:
            'Deactivate room "201", then open the booking availability screen and confirm "201" no longer appears as bookable. Reactivate it and confirm it returns. Check that a past booking referencing "201" still shows the room throughout.',
          takeaway:
            'Toggle IsActive with a POST to take a room out of service; it vanishes from new bookings via the availability filter while all historical bookings stay intact.',
        },
      ],
    },
    {
      id: 'm4-s2',
      title: 'Availability',
      topics: [
        {
          id: 'm4-t6',
          title: 'The Date-Overlap Problem',
          explain:
            'Understand when two date ranges overlap — the single rule that decides whether a room is free — before writing any SQL.',
          analogy:
            'A guest at TunMani Resort wants room 201 from **12th to 15th June**. The front desk flips through the booking book: is there *any* existing stay in 201 that touches those nights? A stay that checks out on the 12th is fine (the guest leaves the morning the new one arrives), but a stay from the 13th to 16th collides. The clerk is checking **overlap**, and the rule is simpler than it looks.',
          theory:
            "Two date ranges **overlap** when one starts before the other ends and ends after the other starts. For an existing booking `[exFrom, exTo)` and a requested stay `[reqFrom, reqTo)`, they collide when:\n`exFrom < reqTo AND exTo > reqFrom`.\n\nThe **half-open** interval `[from, to)` is the key insight: a stay *occupies* the nights from `from` up to but **not including** `to`, because the guest checks out on the morning of `to`. So a booking that ends exactly when another begins (`exTo == reqFrom`) does **not** overlap — the room turns over that day. Using `<` and `>` (strict) rather than `<=`/`>=` encodes this turnover correctly.\n\nThink of it as the **negation of the non-overlap cases**: two ranges do *not* overlap only if one is entirely before the other (`exTo <= reqFrom`) or entirely after (`exFrom >= reqTo`). Everything else overlaps. The single condition `exFrom < reqTo AND exTo > reqFrom` is exactly the negation of those two.\n\nGet this wrong in either direction and you either **double-book** a room (too loose) or **reject a valid turnover-day booking** (too tight). The whole availability feature — and the safety of the booking system — rests on this one comparison.",
          whyItMatters:
            'Every availability check, every "is this room free?" question, and the safety net before confirming a booking all reduce to this one overlap rule. Encoding check-out day as a non-conflict (half-open intervals) lets a resort turn a room over same-day — a real and common case — while strict comparisons prevent the costly double-book. Misunderstanding it here cascades into bugs everywhere downstream.',
          steps: [
            'Model each stay as a half-open interval `[from, to)` — occupies `from` up to but not `to`.',
            'Write the overlap rule: `exFrom < reqTo AND exTo > reqFrom`.',
            'Confirm a stay ending on `reqFrom` (`exTo == reqFrom`) is treated as free (same-day turnover).',
            'Confirm a stay starting on `reqTo` (`exFrom == reqTo`) is also free.',
            'Test the four cases: before, after, partial overlap, fully contained.',
            'Use strict `<`/`>` not `<=`/`>=` so turnover days do not falsely conflict.',
            'Decide that `to` must always be strictly after `from` (at least one night).',
          ],
          code: `// The overlap rule, expressed once in C# for clarity.
// Two stays conflict when one starts before the other ends
// AND ends after the other starts — using half-open [from, to).
static bool Overlaps(DateOnly exFrom, DateOnly exTo,
                     DateOnly reqFrom, DateOnly reqTo)
    => exFrom < reqTo && exTo > reqFrom;

// Worked examples for room 201:
//   Existing 13–16, Requested 12–15 -> 13<15 && 16>12 -> TRUE  (conflict)
//   Existing 10–12, Requested 12–15 -> 10<15 && 12>12 -> FALSE (turnover, free)
//   Existing 15–18, Requested 12–15 -> 15<15 && 18>12 -> FALSE (turnover, free)
//   Existing 13–14, Requested 12–15 -> 13<15 && 14>12 -> TRUE  (contained, conflict)`,
          pitfalls: [
            '**Using `<=`/`>=` for the comparison.** A check-out day then blocks a same-day check-in. Fix: strict `<` and `>` with half-open intervals.',
            '**Treating intervals as closed `[from, to]`.** Turnover days falsely conflict. Fix: half-open `[from, to)`.',
            "**Only checking if the new start is inside an existing stay.** Misses ranges that fully contain or are contained. Fix: the two-sided rule `exFrom < reqTo AND exTo > reqFrom`.",
            '**Allowing `to <= from`.** A zero or negative-night stay sneaks through. Fix: require `to > from`.',
            '**Mixing date and datetime.** Times-of-day muddy the comparison. Fix: compare `DateOnly` (or normalised midnight).',
            '**Checking overlap in app code over all bookings.** Slow and racy. Fix: do it in one SQL `WHERE` (next topic).',
          ],
          tryIt:
            'On paper, take an existing booking for 201 from 13–16 June. Test requests 10–12 (free), 12–14 (conflict), 16–18 (free), and 12–17 (conflict) against the rule `exFrom < reqTo AND exTo > reqFrom`. Confirm each answer matches your intuition about the booking book.',
          takeaway:
            'Two stays overlap exactly when exFrom < reqTo AND exTo > reqFrom; half-open intervals and strict comparisons make check-out day a free turnover, not a conflict.',
        },
        {
          id: 'm4-t7',
          title: 'The Availability API and SQL',
          explain:
            'Build `GET /api/rooms/{id}/availability?from=&to=` and the SQL that finds rooms NOT already booked for the overlapping range.',
          analogy:
            'The TunMani Resort booking website asks the back office one question over and over: "Is room 201 free from the 12th to the 15th?" The office does not read out the whole booking book — it runs one quick check: *does any confirmed stay for 201 overlap those dates?* If none, the answer is "free". That single check is the availability SQL behind a Web API endpoint.',
          theory:
            "Availability is a **Web API** action returning JSON, not a Razor view, because the React/booking UI calls it via AJAX. The route is `GET /api/rooms/{id}/availability?from=2026-06-12&to=2026-06-15`. ASP.NET Core binds `id` from the route and `from`/`to` from the query string as `DateOnly`.\n\nThe SQL applies the overlap rule **inside the database**. To check **one room**, you ask whether any conflicting `booking_rooms` row exists:\n```\nSELECT NOT EXISTS (\n  SELECT 1 FROM booking_rooms br\n  JOIN bookings b ON b.id = br.booking_id\n  WHERE br.room_id = @id\n    AND b.status <> 'cancelled'\n    AND b.check_in  < @to       -- exFrom < reqTo\n    AND b.check_out > @from      -- exTo  > reqFrom\n) AS is_available;\n```\nTo list **all free rooms** for a range, flip it: select active rooms whose `id` is **not in** the set of rooms with a conflicting booking.\n\nTwo details make it correct: it ignores **cancelled** bookings (`status <> 'cancelled'`), so a cancelled stay frees the room, and it uses the **strict half-open** comparison from the previous topic. The endpoint returns `{ \"roomId\": 201, \"isAvailable\": true }` or the list of free rooms, and the booking UI greys out the dates that are taken.\n\nDoing the check in SQL — one indexed query — is both correct and fast; pulling all bookings into C# to compare would be slow and would race other bookings.",
          whyItMatters:
            'A single SQL endpoint answers the most-asked question in the whole system — "is this room free?" — correctly and in one round trip. Excluding cancelled bookings and using the strict overlap rule in the WHERE clause means the answer is always trustworthy, and keeping it in the database (not C# loops) makes it fast enough to call on every date change in the booking UI.',
          steps: [
            'Create an API controller `RoomsApiController` with route `[Route("api/rooms")]`.',
            'Add `GET {id}/availability` binding `id` from route and `from`/`to` as `DateOnly` query params.',
            'Write the `NOT EXISTS` SQL with the overlap rule and `status <> \'cancelled\'`.',
            "Use parameters `@id`, `@from`, `@to` — never string-build the dates.",
            'Return `Ok(new { roomId = id, isAvailable })` as JSON.',
            'Add an "all free rooms" query that excludes rooms with a conflicting booking and filters `is_active`.',
            'Add an index on `booking_rooms(room_id)` and `bookings(check_in, check_out)`.',
          ],
          code: `// Web API: GET /api/rooms/{id}/availability?from=&to=
[ApiController, Route("api/rooms")]
public class RoomsApiController : ControllerBase
{
    private readonly string _cs;
    public RoomsApiController(IConfiguration cfg) =>
        _cs = cfg.GetConnectionString("Default")!;

    [HttpGet("{id:int}/availability")]
    public async Task<IActionResult> Availability(int id, DateOnly from, DateOnly to)
    {
        if (to <= from) return BadRequest("'to' must be after 'from'.");

        const string sql = @"
            SELECT NOT EXISTS (
                SELECT 1
                FROM booking_rooms br
                JOIN bookings b ON b.id = br.booking_id
                WHERE br.room_id = @id
                  AND b.status <> 'cancelled'
                  AND b.check_in  < @to        -- exFrom < reqTo
                  AND b.check_out > @from       -- exTo  > reqFrom
            );";
        using var c = new NpgsqlConnection(_cs);
        var isAvailable = await c.ExecuteScalarAsync<bool>(
            sql, new { id, from, to });
        return Ok(new { roomId = id, isAvailable });
    }
}`,
          pitfalls: [
            "**Forgetting `status <> 'cancelled'`.** A cancelled stay wrongly blocks the room. Fix: exclude cancelled bookings.",
            '**Using `<=`/`>=` in the WHERE.** Same-day turnovers falsely conflict. Fix: strict `<` and `>`.',
            "**Returning the check as a Razor view.** The booking UI needs JSON. Fix: an `[ApiController]` returning `Ok(...)`.",
            '**Pulling all bookings into C# to compare.** Slow and racy. Fix: do the overlap test in SQL.',
            '**Not validating `to > from`.** A zero-night query gives odd results. Fix: `BadRequest` when `to <= from`.',
            '**No index on the booking dates.** The query scans the whole table. Fix: index `booking_rooms(room_id)` and `bookings(check_in, check_out)`.',
          ],
          tryIt:
            'Add a `GET /api/rooms/available?from=&to=` action returning all active rooms free for the range using `WHERE is_active AND id NOT IN (SELECT room_id FROM booking_rooms br JOIN bookings b ... overlap ...)`. Hit it for a busy weekend and confirm only genuinely free rooms come back.',
          takeaway:
            'A Web API endpoint runs one NOT EXISTS overlap query — excluding cancelled bookings, using strict comparisons — to answer "is this room free?" fast and correctly.',
        },
        {
          id: 'm4-t8',
          title: 'The Availability Calendar / List View',
          explain:
            'Show staff which rooms are free for a chosen date range — a date picker that calls the availability API and lists or grids the open rooms.',
          analogy:
            'Instead of the clerk flipping the booking book room by room, TunMani Resort puts up a **whiteboard grid**: rooms down the side, the next two weeks across the top, each cell green (free) or red (taken). Pick your dates and the free rooms light up. The availability list view is that whiteboard, drawn from the API.',
          theory:
            "The availability view is a **staff-facing screen** with a `from`/`to` date picker. On submit it calls the `GET /api/rooms/available?from=&to=` endpoint (or a server-side action using the same query) and renders the free rooms as a **list** or a small **calendar grid**.\n\nTwo implementation styles work. **Server-rendered**: a `RoomController.Availability(DateOnly from, DateOnly to)` action runs the free-rooms query and returns a Razor view listing the rooms with their rate and a *Book* button. **Client-rendered**: the page loads, and JavaScript calls the JSON API on date change, updating the grid without a full reload — better when staff scrub through many date ranges.\n\nFor a **calendar grid**, you fetch each room's bookings for the window and colour cells per night. This is heavier but visual; for a busy front desk the simple free-rooms-for-these-exact-dates **list** is usually enough and far cheaper to compute.\n\nThe view should surface the **nightly rate** and **capacity** alongside availability so staff can match a room to a guest's needs in one glance, and a *Book these dates* button should carry `from`/`to` straight into the create-booking flow so the dates are not re-typed.",
          whyItMatters:
            'Staff need to answer "what can I offer this guest for these nights?" in seconds, and a list or grid backed by the availability query does exactly that. Carrying the chosen dates into the booking flow removes re-typing and the errors it causes, and showing rate and capacity inline lets the clerk match room to guest without opening each room.',
          steps: [
            'Add a `RoomController.Availability(DateOnly? from, DateOnly? to)` GET action.',
            'Render a `from`/`to` date picker that defaults to today and tomorrow.',
            'On submit, run the free-rooms query (or call the JSON API) for the range.',
            'List each free room with type, capacity, nightly rate, and a *Book* button.',
            'Pass `from`/`to` into the *Book* link so the create flow pre-fills the dates.',
            'Optionally upgrade to a grid that colours each night free/taken.',
            'Show a friendly empty state when no rooms are free for the dates.',
          ],
          code: `// Controllers/RoomController.cs — server-rendered availability list.
[HttpGet]
public async Task<IActionResult> Availability(DateOnly? from, DateOnly? to)
{
    from ??= DateOnly.FromDateTime(DateTime.Today);
    to   ??= from.Value.AddDays(1);
    ViewBag.From = from; ViewBag.To = to;
    var rooms = await _svc.FreeRoomsAsync(from.Value, to.Value);
    return View(rooms);
}

/* Views/Room/Availability.cshtml */
@model IEnumerable<Room>
<form asp-action="Availability" method="get" class="row g-2 mb-3">
    <input type="date" name="from" value="@(((DateOnly)ViewBag.From))" />
    <input type="date" name="to"   value="@(((DateOnly)ViewBag.To))" />
    <button class="btn btn-primary">Check</button>
</form>

@if (!Model.Any())
{ <p class="text-muted">No rooms free for these dates.</p> }
else
{
    <table class="table">
      @foreach (var r in Model)
      {
        <tr>
          <td>@r.RoomNumber (@r.RoomType)</td>
          <td>Sleeps @r.Capacity</td>
          <td>@r.BasePrice.ToString("C")/night</td>
          <td>
            <a class="btn btn-sm btn-success"
               asp-controller="Booking" asp-action="Create"
               asp-route-roomId="@r.Id"
               asp-route-from="@ViewBag.From" asp-route-to="@ViewBag.To">Book</a>
          </td>
        </tr>
      }
    </table>
}`,
          pitfalls: [
            '**Re-typing dates between availability and booking.** Causes mismatched ranges. Fix: pass `from`/`to` through the Book link.',
            '**Building a heavy per-night grid when a list suffices.** Slow for a busy desk. Fix: start with a free-rooms list.',
            "**No empty state.** A blank table looks broken. Fix: show \"No rooms free for these dates.\"",
            '**Defaulting `to` equal to `from`.** A zero-night range returns nothing useful. Fix: default `to = from + 1 day`.',
            '**Calling the API on every keystroke.** Floods the server. Fix: query on submit or debounce date changes.',
            '**Showing inactive rooms.** They cannot be booked. Fix: the free-rooms query filters `is_active`.',
          ],
          tryIt:
            'Add `FreeRoomsAsync(from, to)` to `RoomService` calling the all-free-rooms SQL. Render the availability page, pick a busy weekend, and confirm the list matches what the API returns. Click *Book* and verify the create form opens with the dates already filled.',
          takeaway:
            'The availability view is a date picker plus a free-rooms list (or grid) drawn from the availability query, carrying the chosen dates straight into the booking flow.',
        },
        {
          id: 'm4-t9',
          title: 'Why the Overlap Check Must Run Before Confirming',
          explain:
            'Re-run the availability check at the moment of confirmation — inside the save transaction — because the room may have been booked since the user opened the form.',
          analogy:
            'Two front-desk clerks at TunMani Resort both see room 201 free for the wedding weekend and both start filling forms. If neither re-checks at the moment they hit *Confirm*, both book 201 and one family arrives to find their sea-view room already occupied. The fix is a rule: **re-check the booking book the instant before you write the booking**, not five minutes earlier when the form was opened.',
          theory:
            "Availability shown on screen is a **snapshot in time**. Between displaying free rooms and the user clicking *Confirm*, another booking can claim the same room — this is a **race condition** (a TOCTOU bug: time-of-check to time-of-use).\n\nThe fix is to **re-run the overlap check at confirm time, inside the same database transaction** that saves the booking. You `BEGIN`, run the `NOT EXISTS` overlap query for each requested room, and only `INSERT` the booking if all are still free; otherwise you `ROLLBACK` and tell the user the room was just taken.\n\nFor full safety under heavy concurrency, the check and insert must be **atomic**. Options in PostgreSQL: lock the conflicting rows with `SELECT ... FOR UPDATE`, raise the transaction isolation to `SERIALIZABLE`, or — best of all — add a **database constraint** (an exclusion constraint on a date range) so the database itself refuses an overlapping insert. Even with app-level checks, the constraint is the last line of defence.\n\nThe earlier on-screen availability is still useful: it stops most conflicts early and gives a good UX. But it is **advisory**. The authoritative check is the one inside the confirm transaction. Skipping it is the single most common way booking systems double-book on a busy day.",
          whyItMatters:
            'On a quiet day the on-screen check seems enough; on a busy wedding weekend — exactly when it matters — two clerks racing for the same room will double-book unless the overlap is re-checked inside the save transaction. Doing the check atomically with the insert (or backing it with a database exclusion constraint) is what makes the booking system actually safe, not just usually safe.',
          steps: [
            'Treat on-screen availability as advisory, not authoritative.',
            'In `BookingService.CreateAsync`, open a transaction with `BeginTransaction`.',
            'Inside it, re-run the overlap `NOT EXISTS` check for every requested room.',
            'If any room is now taken, `ROLLBACK` and return a "room just booked" error.',
            'If all free, `INSERT` the booking and `booking_rooms`, then `COMMIT`.',
            'For heavy load, add `SELECT ... FOR UPDATE` or a Postgres exclusion constraint.',
            'Surface a clear message so the user can pick another room.',
          ],
          code: `// BookingService — re-check overlap inside the save transaction.
public async Task<(bool Ok, string? Error)> ConfirmAsync(
    Booking booking, IEnumerable<int> roomIds, DateOnly from, DateOnly to)
{
    using var c = new NpgsqlConnection(_cs);
    await c.OpenAsync();
    using var tx = await c.BeginTransactionAsync();

    const string conflictSql = @"
        SELECT EXISTS (
            SELECT 1 FROM booking_rooms br
            JOIN bookings b ON b.id = br.booking_id
            WHERE br.room_id = @roomId
              AND b.status <> 'cancelled'
              AND b.check_in < @to AND b.check_out > @from);";

    foreach (var roomId in roomIds)
    {
        var taken = await c.ExecuteScalarAsync<bool>(
            conflictSql, new { roomId, from, to }, tx);
        if (taken)
        {
            await tx.RollbackAsync();
            return (false, $"Room {roomId} was just booked. Please pick another.");
        }
    }

    // ... INSERT booking + booking_rooms here, all on the same tx ...
    await tx.CommitAsync();
    return (true, null);
}`,
          pitfalls: [
            '**Trusting the availability shown when the form was opened.** It is stale. Fix: re-check at confirm time.',
            '**Checking and inserting in separate transactions.** The race window stays open. Fix: one transaction for check + insert.',
            "**No database-level guard.** A bug in app code can still double-book. Fix: add a Postgres exclusion constraint as a backstop.",
            '**Swallowing the conflict silently.** The user does not know to re-pick. Fix: return a clear "room just taken" message.',
            '**Locking the whole table.** Kills concurrency. Fix: lock only the conflicting rows (`FOR UPDATE`) or use a constraint.',
            '**Forgetting to pass `tx` to Dapper calls.** They run outside the transaction. Fix: pass the transaction to every command.',
          ],
          tryIt:
            'Open two browser tabs on the create-booking form, both selecting room 201 for the same nights. Confirm both. With the re-check in place, exactly one should succeed and the other should see "Room 201 was just booked." Remove the re-check and watch both succeed — the bug.',
          takeaway:
            'On-screen availability is advisory; the authoritative overlap check must run inside the confirm transaction (ideally backed by a database constraint) so two clerks never double-book the same room.',
        },
      ],
    },
    {
      id: 'm4-s3',
      title: 'Creating a Booking',
      topics: [
        {
          id: 'm4-t10',
          title: 'Customer Search and Quick-Add',
          explain:
            'Let staff find an existing customer by autocomplete via `/api/customers?q=`, or quick-add a brand-new customer inline without leaving the booking form.',
          analogy:
            'When a returning guest arrives at TunMani Resort, the clerk types the first few letters of their name and the **guest register** suggests matches — "Shenoy from Udupi, last stayed March". If they are new, the clerk jots their name and phone on a fresh register line right there at the desk, without walking to the back office. That is autocomplete search plus inline quick-add.',
          theory:
            "Most bookings attach to a **customer**, so step one of the create flow is picking one. Rather than a giant dropdown, you provide a **typeahead**: an input that calls `GET /api/customers?q=shen` and shows matching customers. The API runs a `WHERE name ILIKE @q OR phone LIKE @q` (Postgres `ILIKE` is case-insensitive) limited to, say, 10 rows, returning JSON `{ id, name, phone }`.\n\nThe front end debounces keystrokes (waits ~300 ms after typing stops) so it does not fire a request per letter, then renders the suggestions. Selecting one stores the `customerId` in a hidden field on the booking form.\n\nFor a **new** guest, a *Quick-add* button reveals a tiny inline form (name, phone) that POSTs to `/api/customers`, which inserts the customer and returns the new `id` — immediately selected for the booking. This avoids the friction of leaving the booking page to create a customer first.\n\nA booking should reference a customer by **id** (a foreign key), not by copying the name into the booking, so a corrected phone number updates everywhere. The CRM/customer detail grows in a later module; here you only need search and quick-add.",
          whyItMatters:
            'Front-desk speed depends on attaching the right guest in seconds — typeahead search plus inline quick-add removes the page-hopping that slows check-in. Referencing the customer by foreign-key id (not a copied name) keeps the guest record single-source-of-truth, so later contact or CRM updates flow through to every booking automatically.',
          steps: [
            'Add `GET /api/customers?q=` running `WHERE name ILIKE @q OR phone LIKE @q LIMIT 10`.',
            'Return JSON `{ id, name, phone }` for each match.',
            'On the booking form, add a typeahead input that debounces and calls the API.',
            'Store the chosen `customerId` in a hidden form field.',
            'Add `POST /api/customers` that inserts `{ name, phone }` and returns the new id.',
            'Wire a *Quick-add* button that posts the mini-form and selects the returned id.',
            'Reference the customer by id on the booking, never by copied name.',
          ],
          code: `// Web API: search + quick-add customers.
[ApiController, Route("api/customers")]
public class CustomersApiController : ControllerBase
{
    private readonly string _cs;
    public CustomersApiController(IConfiguration cfg) =>
        _cs = cfg.GetConnectionString("Default")!;

    // GET /api/customers?q=shen  -> typeahead matches
    [HttpGet]
    public async Task<IActionResult> Search(string q)
    {
        const string sql = @"
            SELECT id, name, phone FROM customers
            WHERE name ILIKE @term OR phone LIKE @term
            ORDER BY name LIMIT 10;";
        using var c = new NpgsqlConnection(_cs);
        var rows = await c.QueryAsync(sql, new { term = $"%{q}%" });
        return Ok(rows);
    }

    public record NewCustomer(string Name, string Phone);

    // POST /api/customers  -> quick-add, returns the new id
    [HttpPost]
    public async Task<IActionResult> QuickAdd([FromBody] NewCustomer dto)
    {
        const string sql = @"INSERT INTO customers (name, phone)
                             VALUES (@Name, @Phone) RETURNING id;";
        using var c = new NpgsqlConnection(_cs);
        var id = await c.ExecuteScalarAsync<int>(sql, dto);
        return Ok(new { id, dto.Name, dto.Phone });
    }
}`,
          pitfalls: [
            '**Firing a request on every keystroke.** Floods the server. Fix: debounce ~300 ms before calling.',
            '**Using `LIKE` for case-sensitive name search.** Misses "shenoy" vs "Shenoy". Fix: Postgres `ILIKE`.',
            "**Copying the customer name into the booking.** A corrected name no longer updates. Fix: store `customer_id` only.",
            '**No `LIMIT` on the search.** A common letter returns thousands. Fix: `LIMIT 10`.',
            '**Quick-add not returning the new id.** The form cannot select the customer. Fix: `RETURNING id` and send it back.',
            '**Building the `%q%` term in SQL.** Risks injection. Fix: pass `$"%{q}%"` as a parameter value.',
          ],
          tryIt:
            'Wire the typeahead to `/api/customers?q=` and confirm typing "she" suggests Shenoy. Then quick-add "Anita, 98xxxxxx", verify it appears selected on the form, and check the new row exists in the customers table with the returned id.',
          takeaway:
            'Pick a customer with a debounced ILIKE typeahead, or quick-add one inline that returns its new id — and always reference the customer by foreign-key id, not a copied name.',
        },
        {
          id: 'm4-t11',
          title: 'Multi-Room Bookings with BookingRoom Join Rows',
          explain:
            'Model a booking that holds one or more rooms via a `BookingRoom` join table, each row carrying its own guest name and RatePerNight.',
          analogy:
            'A family booking the wedding at TunMani Resort takes **three rooms**: the couple in the sea-view suite, parents in a deluxe, cousins in a twin — one booking, three rooms, each with a different guest and a different nightly rate. The `Booking` is the family\'s single reservation; each `BookingRoom` is one room within it, tagged with who sleeps there and what it costs per night.',
          theory:
            "A booking is **one-to-many** with rooms: one `Booking` holds many `BookingRoom` rows. This is a classic **join table** (also called a junction or line-item table). The `Booking` row carries shared facts — customer, check-in, check-out, status, reference — while each `BookingRoom` carries per-room facts: `RoomId`, `GuestName`, and `RatePerNight`.\n\nWhy store `RatePerNight` **on the join row** rather than reading the room's current `BasePrice`? Because the price agreed **at booking time** must be frozen — if the resort later raises the deluxe rate, this booking still honours the rate the guest was quoted. The join row is a **snapshot** of the deal for that room.\n\n`GuestName` per room lets the front desk know who occupies each room (useful for ID checks and key handover) even though one customer made the whole booking. A `Capacity` check can warn if assigned guests exceed a room's limit.\n\nThe schema: `bookings(id, customer_id, check_in, check_out, ...)` and `booking_rooms(id, booking_id, room_id, guest_name, rate_per_night)`. The `booking_id` foreign key ties each room line back to its parent booking. To load a booking you read the parent row and its child `booking_rooms` — two queries, or one with a `JOIN`.",
          whyItMatters:
            'Real resort bookings routinely span multiple rooms for one family or group, and a join table is the clean way to model that one-to-many shape. Freezing `RatePerNight` on each join row protects both guest and resort from later price changes, and a per-room `GuestName` keeps occupancy clear for ID checks and keys — details a single flat booking row could never hold.',
          steps: [
            'Create `bookings` (parent) and `booking_rooms` (child) tables with a `booking_id` FK.',
            'Put shared facts on `bookings`: customer, check-in/out, status, reference.',
            'Put per-room facts on `booking_rooms`: `room_id`, `guest_name`, `rate_per_night`.',
            'Snapshot the agreed `rate_per_night` at booking time — do not read live `base_price` later.',
            'Model it in C# as `Booking` with a `List<BookingRoom> Rooms`.',
            'Load a booking by reading the parent then its child rooms (or one JOIN).',
            'Optionally warn if a room\'s assigned guests exceed its `Capacity`.',
          ],
          code: `-- Schema: one booking, many rooms.
CREATE TABLE bookings (
    id          SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id),
    check_in    DATE NOT NULL,
    check_out   DATE NOT NULL,
    status      TEXT NOT NULL DEFAULT 'confirmed',
    booking_ref TEXT NOT NULL,
    public_token UUID NOT NULL,
    discount    NUMERIC(10,2) NOT NULL DEFAULT 0,
    CHECK (check_out > check_in)
);

CREATE TABLE booking_rooms (
    id             SERIAL PRIMARY KEY,
    booking_id     INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    room_id        INT NOT NULL REFERENCES rooms(id),
    guest_name     TEXT,
    rate_per_night NUMERIC(10,2) NOT NULL,   -- frozen at booking time
    checked_out_at TIMESTAMPTZ                -- null until this room checks out
);

-- C# models
public class Booking {
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DateOnly CheckIn { get; set; }
    public DateOnly CheckOut { get; set; }
    public string Status { get; set; } = "confirmed";
    public List<BookingRoom> Rooms { get; set; } = new();
}
public class BookingRoom {
    public int RoomId { get; set; }
    public string? GuestName { get; set; }
    public decimal RatePerNight { get; set; }   // snapshot
}`,
          pitfalls: [
            '**Cramming many rooms into one booking row.** You cannot vary guest or rate per room. Fix: a `booking_rooms` join table.',
            "**Reading the room's live `BasePrice` at invoice time.** A later price change rewrites history. Fix: snapshot `rate_per_night` on the join row.",
            '**No `ON DELETE CASCADE` (or guard) on `booking_id`.** Orphan room rows linger. Fix: cascade or block parent delete.',
            '**Storing the customer name on each room row.** Duplicated and drifts. Fix: customer is on the parent booking; rooms hold `guest_name`.',
            '**Forgetting a `CHECK (check_out > check_in)`.** Zero-night bookings slip in. Fix: add the constraint.',
            '**Loading rooms in N+1 queries.** Slow for big bookings. Fix: one JOIN or a single child query per booking.',
          ],
          tryIt:
            'Insert one booking with three `booking_rooms` rows at different `rate_per_night` values and guest names. Read the booking back joined to its rooms and confirm all three rates and names load. Raise a room\'s `base_price` and verify the booking still shows the frozen rate.',
          takeaway:
            'A multi-room booking is one parent Booking plus many BookingRoom join rows, each freezing its own guest name and RatePerNight so later price changes never rewrite a confirmed deal.',
        },
        {
          id: 'm4-t12',
          title: 'BookingRef, PublicToken and the Discount',
          explain:
            'Generate a human-friendly `BookingRef`, a random `PublicToken` (GUID) for shareable links, and apply a booking-level discount amount.',
          analogy:
            'Every TunMani Resort booking gets two tags. A short **counter receipt number** the guest reads out on the phone — "TMR-2026-0142" — and a **secret long code** printed as a QR on their confirmation so they can view it online without logging in. The receipt number is the `BookingRef`; the secret code is the `PublicToken`. The discount is the festival or repeat-guest concession knocked off the total.',
          theory:
            "Two identifiers serve two purposes. **`BookingRef`** is **human-facing**: short, readable, and spoken over the phone — e.g. `TMR-2026-0142` (prefix + year + sequence). It is *not* secret and not unguessable; it is for humans to quote.\n\n**`PublicToken`** is a **random GUID** (`Guid.NewGuid()`) used in shareable URLs like `/b/{token}` so a guest can view their booking **without logging in**. Because it is random and huge (122 bits), it is effectively unguessable — that unguessability *is* the security. Never use the sequential `BookingRef` or the row `Id` in a public link, or anyone could enumerate other guests' bookings.\n\nThe **discount** is a booking-level amount (a flat rupee figure, e.g. ₹500 off) stored on the `bookings` row. It is applied to the total **after** summing each room's `rate_per_night × nights` and **before** GST is computed on the net, or on the gross depending on your tax rule — keep the order explicit and consistent. Storing it as data lets the invoice show the concession transparently.\n\nGenerating `BookingRef` safely usually means a counter (like the bill-number pattern) or a transaction so two bookings never share a ref; the `PublicToken` needs no coordination because random GUIDs effectively never collide.",
          whyItMatters:
            'Splitting a human reference from a secret token is a security essential: a readable BookingRef for phone calls, and an unguessable GUID for public links so guests cannot enumerate each other\'s bookings. Storing the discount as an explicit amount keeps the invoice honest and auditable, and computing it in a fixed order relative to GST avoids the rounding disputes that erode guest trust.',
          steps: [
            'Generate `BookingRef` as `TMR-{year}-{sequence}` using a counter or transaction.',
            'Generate `PublicToken` with `Guid.NewGuid()` — random and unguessable.',
            'Use only `PublicToken` in public links (`/b/{token}`), never `Id` or `BookingRef`.',
            'Store `discount` as a flat amount on the `bookings` row.',
            'Sum each room: `rate_per_night × nights`, then subtract the discount.',
            'Apply GST per the agreed rule, consistently (on net or gross — pick one).',
            'Show `BookingRef` to staff/guest and the token only inside the share URL.',
          ],
          code: `// Generating identifiers and applying the discount.
public class BookingService
{
    // Human-facing ref: prefix + year + zero-padded sequence.
    public string MakeBookingRef(int sequence) =>
        $"TMR-{DateTime.Now.Year}-{sequence:D4}";   // e.g. TMR-2026-0142

    // Unguessable public token for shareable links.
    public Guid MakePublicToken() => Guid.NewGuid();

    // Compute the bill total with a booking-level discount.
    public decimal ComputeTotal(IEnumerable<BookingRoom> rooms,
                                int nights, decimal discount, decimal gstRate)
    {
        var net = rooms.Sum(r => r.RatePerNight * nights) - discount;
        if (net < 0) net = 0;                         // never go negative
        var gst = Math.Round(net * gstRate / 100m, 2); // 12% for rooms
        return net + gst;
    }
}

/* Public, login-free view by token only */
// GET /b/{token}  -> looks up by public_token, NOT by id or booking_ref`,
          pitfalls: [
            '**Using the row `Id` or `BookingRef` in a public URL.** Guests can enumerate others\' bookings. Fix: link only by random `PublicToken`.',
            '**Making `BookingRef` the security boundary.** It is guessable/sequential. Fix: keep it human-facing only; secure links use the GUID.',
            "**Letting the discount push the total negative.** Produces nonsense invoices. Fix: clamp `net` at zero.",
            '**Applying GST before the discount inconsistently.** Totals differ run to run. Fix: fix one order and apply it everywhere.',
            '**Generating `BookingRef` with a plain read+increment.** Two bookings can collide. Fix: a counter/transaction like bill numbers.',
            '**Storing the discount as a percentage in one place and amount in another.** Confusion. Fix: pick a flat amount on the booking row.',
          ],
          tryIt:
            'Create a booking and confirm it gets a `BookingRef` like `TMR-2026-0001` and a GUID `PublicToken`. Open `/b/{token}` and verify it shows the booking; then try `/b/{a-made-up-guid}` and confirm it 404s. Apply a ₹500 discount and check the total drops by exactly ₹500 before GST.',
          takeaway:
            'BookingRef is the readable phone-friendly tag; PublicToken is the unguessable GUID securing public links; the discount is a clamped, consistently-ordered amount on the booking.',
        },
        {
          id: 'm4-t13',
          title: 'Saving the Booking in One Transaction',
          explain:
            'Insert the parent `bookings` row and all child `booking_rooms` rows atomically — all succeed or all roll back — so a booking is never half-saved.',
          analogy:
            'When the TunMani Resort clerk confirms the three-room wedding booking, the family reservation and all three room lines must be filed **together**. If the power flickers after the reservation is filed but before the third room line, you would have a booking that claims two rooms when the family paid for three. A transaction is the rule "**file all four slips together, or none at all**".',
          theory:
            "Saving a multi-room booking writes to **two tables**: one `bookings` row and several `booking_rooms` rows. These writes must be **atomic** — a database **transaction** guarantees all-or-nothing. You `BeginTransaction`, insert the parent and capture its new `id` via `RETURNING id`, then insert each child row with that `booking_id`, and finally `Commit`. Any failure triggers `Rollback`, leaving no partial booking.\n\nThe full confirm flow combines what you have built: inside the same transaction you (1) **re-check overlap** for each room, (2) **insert the booking** with its `BookingRef`, `PublicToken`, and `discount`, (3) **insert each `booking_room`** with its frozen `RatePerNight` and `GuestName`. Passing the **transaction object** to every Dapper call is what binds them together — forget it on one insert and that row escapes the transaction.\n\nUsing Dapper, you `await connection.OpenAsync()`, `await connection.BeginTransactionAsync()`, run the inserts with `tx` passed in, then `await tx.CommitAsync()`. Wrap it in `try/catch` so any exception rolls back and surfaces a clean error.\n\nThis single-transaction save is the climax of the create flow: customer chosen, rooms assigned, dates and rates set, identifiers generated, overlap re-checked, and everything committed as one indivisible unit.",
          whyItMatters:
            'A half-saved booking — parent without all its rooms, or rooms without overlap re-checked — is a data-integrity disaster that surfaces as wrong invoices and double-bookings. Wrapping the parent insert, child inserts, and overlap re-check in one transaction guarantees the booking is either fully and safely saved or not saved at all, which is the only acceptable outcome for a reservation.',
          steps: [
            'Open the connection and `BeginTransactionAsync`.',
            'Re-check overlap for every requested room inside the transaction.',
            'Insert the `bookings` row with `RETURNING id` to get the new booking id.',
            'Loop the rooms, inserting each `booking_rooms` row with that `booking_id`.',
            'Pass the transaction (`tx`) to every Dapper command.',
            '`CommitAsync` on success; `RollbackAsync` in a `catch`.',
            'Return the new booking id (or its `BookingRef`) to redirect the user.',
          ],
          code: `// BookingService.CreateAsync — parent + children in one transaction.
public async Task<(bool Ok, string? Error, int BookingId)> CreateAsync(Booking b)
{
    using var c = new NpgsqlConnection(_cs);
    await c.OpenAsync();
    using var tx = await c.BeginTransactionAsync();
    try
    {
        // (1) re-check overlap for each room (see earlier topic) ...

        // (2) insert parent, get new id
        const string insBooking = @"
            INSERT INTO bookings (customer_id, check_in, check_out, status,
                                  booking_ref, public_token, discount)
            VALUES (@CustomerId, @CheckIn, @CheckOut, 'confirmed',
                    @BookingRef, @PublicToken, @Discount)
            RETURNING id;";
        var bookingId = await c.ExecuteScalarAsync<int>(insBooking, b, tx);

        // (3) insert each room line on the same transaction
        const string insRoom = @"
            INSERT INTO booking_rooms (booking_id, room_id, guest_name, rate_per_night)
            VALUES (@bookingId, @RoomId, @GuestName, @RatePerNight);";
        foreach (var r in b.Rooms)
            await c.ExecuteAsync(insRoom,
                new { bookingId, r.RoomId, r.GuestName, r.RatePerNight }, tx);

        await tx.CommitAsync();
        return (true, null, bookingId);
    }
    catch (Exception ex)
    {
        await tx.RollbackAsync();
        return (false, ex.Message, 0);
    }
}`,
          pitfalls: [
            '**Inserting the parent and children in separate transactions.** A crash leaves a half-booking. Fix: one transaction for all inserts.',
            "**Forgetting to pass `tx` to a child insert.** That row escapes the rollback. Fix: pass the transaction to every command.",
            '**Not capturing the new booking id.** You cannot link child rows. Fix: `RETURNING id` with `ExecuteScalarAsync<int>`.',
            '**No try/catch around the transaction.** An exception leaves it open. Fix: rollback in `catch`.',
            '**Re-checking overlap outside the transaction.** The race window reopens. Fix: re-check inside the same `tx`.',
            '**Committing before all rooms insert.** A failing room is lost silently. Fix: commit only after the loop completes.',
          ],
          tryIt:
            'Create a three-room booking, then deliberately make the third room insert fail (e.g. a bad `room_id`). Confirm the whole booking rolls back — no parent row and no room rows remain. Fix the id and confirm all four rows now commit together.',
          takeaway:
            'Save the parent booking and every booking_rooms line in one transaction with the overlap re-check inside it — pass tx to every command so the booking is all-or-nothing.',
        },
      ],
    },
    {
      id: 'm4-s4',
      title: 'Check-in & Checkout Workflow',
      topics: [
        {
          id: 'm4-t14',
          title: 'The Booking Status Lifecycle',
          explain:
            'Define the states a booking moves through — confirmed → checked-in → checked-out / cancelled — and enforce valid transitions.',
          analogy:
            'A TunMani Resort booking has a **life**: first it is *confirmed* (the family will arrive), then *checked-in* (they have their keys and are on-site), then *checked-out* (they have left and settled) — unless it is *cancelled* along the way. You cannot check out a family that never checked in, just as you cannot hand keys to a cancelled booking. The status field tracks where each booking sits in that life.',
          theory:
            "A booking's **status** is a small set of named states: `confirmed`, `checked-in`, `checked-out`, `cancelled`. This is a **state machine** — only certain transitions are legal. From `confirmed` you can go to `checked-in` or `cancelled`. From `checked-in` you can go to `checked-out` or `cancelled`. `checked-out` and `cancelled` are **terminal** — nothing follows them.\n\nStoring status as a `TEXT` column (or a Postgres `enum`) on the `bookings` row lets every screen filter and badge bookings by where they are. The **service enforces transitions**: `CheckInAsync` only works if the booking is `confirmed`; `CheckOutAsync` only if it is `checked-in`. Attempting an illegal jump returns an error rather than corrupting the record.\n\nWhy enforce it? Because the workflow downstream (payment, invoice) assumes a guest has actually stayed before checking out. Allowing arbitrary status changes would let staff issue an invoice for a no-show or check out a cancelled booking. The state machine is a guard rail.\n\nTimestamps accompany the transitions: `checked_in_at`, and per-room `checked_out_at` (a multi-room booking can have rooms check out at different times). The booking is fully `checked-out` only once all its rooms are.",
          whyItMatters:
            'A status field with enforced transitions is what keeps the workflow honest — you cannot invoice a no-show or check out a cancelled booking. Modelling it as a small state machine in the service centralises the rules, so every screen (list filters, action buttons, the resume flow) reads a single source of truth about where each booking stands.',
          steps: [
            'Add a `status` column to `bookings` defaulting to `confirmed`.',
            'Define the legal transitions: confirmed→checked-in, checked-in→checked-out, any→cancelled.',
            'In the service, guard each action: `CheckInAsync` requires `confirmed`.',
            'Return an error on an illegal transition instead of writing it.',
            'Record `checked_in_at` on check-in and `checked_out_at` per room on checkout.',
            'Mark the booking `checked-out` only when all its rooms are checked out.',
            'Badge bookings by status in the list view.',
          ],
          code: `// Enforce the booking state machine in the service.
public static class BookingStatus
{
    public const string Confirmed  = "confirmed";
    public const string CheckedIn  = "checked-in";
    public const string CheckedOut = "checked-out";
    public const string Cancelled  = "cancelled";
}

public async Task<(bool Ok, string? Error)> CheckInAsync(int bookingId)
{
    var b = await _repo.GetByIdAsync(bookingId);
    if (b is null) return (false, "Booking not found.");
    if (b.Status != BookingStatus.Confirmed)
        return (false, $"Cannot check in a '{b.Status}' booking.");

    await _repo.SetStatusAsync(bookingId, BookingStatus.CheckedIn,
                               checkedInAt: DateTime.UtcNow);
    return (true, null);
}
// CheckOutAsync similarly requires status == CheckedIn.
// CancelAsync allowed from Confirmed or CheckedIn, never from terminal states.`,
          pitfalls: [
            '**Allowing any status to change to any other.** You can invoice a no-show. Fix: enforce legal transitions in the service.',
            '**Checking out a booking that never checked in.** The workflow assumes a stay. Fix: require `checked-in` before checkout.',
            "**Storing status as a free-text field staff type.** Typos like 'checkedin' break filters. Fix: constants or a Postgres enum.",
            '**No `checked_in_at` timestamp.** You lose the audit of when. Fix: stamp the time on transition.',
            '**Marking the booking checked-out while rooms remain.** Inconsistent state. Fix: only when all rooms are out.',
            '**Letting a cancelled booking transition further.** Terminal states must be final. Fix: block transitions out of cancelled/checked-out.',
          ],
          tryIt:
            'Try to call `CheckOutAsync` on a freshly `confirmed` booking and confirm it returns "Cannot check out a \'confirmed\' booking." Then check in, then check out, and confirm each step records its timestamp and the status advances correctly.',
          takeaway:
            'A booking moves confirmed → checked-in → checked-out (or cancelled), enforced as a state machine in the service so illegal jumps are rejected and each transition is timestamped.',
        },
        {
          id: 'm4-t15',
          title: 'Check-in and Per-Room Checkout',
          explain:
            'Mark a booking checked-in, then check out each room individually (`CheckedOutAt`), since rooms in one booking can leave at different times.',
          analogy:
            'The wedding family checks **in** together — all keys handed over at once. But they leave in waves: the cousins\' twin room frees up on Sunday morning, the parents\' deluxe at noon, the couple\'s suite the next day. The front desk ticks **each room out as it empties**, recording the time. Per-room checkout is ticking off rooms one by one, not the whole booking at once.',
          theory:
            "**Check-in** is booking-level: when the guests arrive, `CheckInAsync` flips the booking to `checked-in` and stamps `checked_in_at`. From that moment the rooms are occupied.\n\n**Checkout is per-room** because rooms in a multi-room booking empty at different times. Each `booking_rooms` row has a nullable `checked_out_at`. `CheckOutRoomAsync(bookingRoomId)` stamps that one row's timestamp. The room becomes free for new bookings from its checkout date — important so the resort can re-let an early-vacated room same-day.\n\nThe **booking** transitions to `checked-out` only when **every** room has a `checked_out_at`. The service checks this after each per-room checkout: `if (allRoomsCheckedOut) SetStatus(checked-out)`. This is why the status and the per-room timestamps work together — the booking-level state is derived from the room-level facts.\n\nA per-room checkout may also trigger downstream steps (final charge for that room), but the key data move is stamping `checked_out_at`. Until a room is checked out, its `checked_out_at` stays `null`, which the availability query treats as still occupied for the booked range.",
          whyItMatters:
            'Guests in a group booking genuinely leave at different times, and per-room checkout lets the resort free and re-let each room the moment it empties rather than waiting for the whole party. Deriving the booking-level checked-out status from the per-room timestamps keeps the two consistent automatically, so no booking is marked complete while a room is still occupied.',
          steps: [
            'Add a nullable `checked_out_at` to `booking_rooms` (null = still occupied).',
            'Implement `CheckInAsync` to flip the booking to `checked-in` and stamp the time.',
            'Implement `CheckOutRoomAsync(bookingRoomId)` to stamp that room\'s `checked_out_at`.',
            'After each per-room checkout, check whether all rooms are now out.',
            'If all rooms are out, transition the booking to `checked-out`.',
            'Ensure the availability query treats a checked-out room as free from its checkout date.',
            'Show per-room checkout buttons on the booking detail screen.',
          ],
          code: `// Per-room checkout; booking flips when the last room leaves.
public async Task<(bool Ok, string? Error)> CheckOutRoomAsync(int bookingRoomId)
{
    const string stamp = @"
        UPDATE booking_rooms SET checked_out_at = now()
        WHERE id = @bookingRoomId AND checked_out_at IS NULL;";

    const string remaining = @"
        SELECT count(*) FROM booking_rooms
        WHERE booking_id = (SELECT booking_id FROM booking_rooms WHERE id = @bookingRoomId)
          AND checked_out_at IS NULL;";

    using var c = new NpgsqlConnection(_cs);
    await c.OpenAsync();
    using var tx = await c.BeginTransactionAsync();

    await c.ExecuteAsync(stamp, new { bookingRoomId }, tx);
    var stillIn = await c.ExecuteScalarAsync<int>(remaining, new { bookingRoomId }, tx);

    if (stillIn == 0)
    {
        await c.ExecuteAsync(
          @"UPDATE bookings SET status = 'checked-out'
            WHERE id = (SELECT booking_id FROM booking_rooms WHERE id = @bookingRoomId);",
          new { bookingRoomId }, tx);
    }
    await tx.CommitAsync();
    return (true, null);
}`,
          pitfalls: [
            '**Checking out the whole booking at once.** Rooms leave at different times. Fix: per-room `checked_out_at`.',
            "**Marking the booking checked-out before all rooms are out.** Misreports occupancy. Fix: count remaining rooms first.",
            '**Re-stamping an already checked-out room.** Overwrites the real time. Fix: `WHERE checked_out_at IS NULL` guard.',
            '**Not freeing the room after checkout.** It stays unbookable. Fix: availability treats a checked-out room as free from its date.',
            '**Doing the stamp and the booking flip in separate transactions.** Inconsistent if one fails. Fix: one transaction.',
            '**Forgetting `checked_in_at` on check-in.** No record of arrival time. Fix: stamp it.',
          ],
          tryIt:
            'Check a three-room booking in, then check out two of its rooms and confirm the booking is still `checked-in`. Check out the third and confirm the booking flips to `checked-out`. Verify each room shows its own `checked_out_at` time.',
          takeaway:
            'Check-in is booking-level; checkout is per-room via checked_out_at, and the booking only becomes checked-out once its last room has left.',
        },
        {
          id: 'm4-t16',
          title: 'Cancelling Rooms and Bookings',
          explain:
            'Allow cancelling one room out of a multi-room booking, or cancelling the whole booking, while keeping availability and totals correct.',
          analogy:
            'The wedding party shrinks: the cousins drop out, so their **one twin room is cancelled** but the rest of the booking stands. Or the whole wedding is called off and the **entire booking is cancelled**. Either way the resort must immediately mark the freed rooms bookable again and adjust what the family owes. Cancelling is releasing rooms cleanly without deleting the record.',
          theory:
            "Cancellation comes in **two grains**. **Cancel one room**: mark that `booking_rooms` row cancelled (a `cancelled` flag or status on the row) so it no longer counts toward the total and its room frees up — the rest of the booking continues. **Cancel the whole booking**: set the booking `status = 'cancelled'`, which the availability query already excludes (`status <> 'cancelled'`), so all its rooms become bookable again at once.\n\nNeither path **deletes** rows. A cancelled booking or room stays in the database as history — for reporting, disputes, and audit — it is simply excluded from availability and from the amount owed. This mirrors the soft-delete principle from the room toggle.\n\nThe **availability** consequence is the point: the moment a room or booking is cancelled, the overlap query must stop counting it. Because the query filters `status <> 'cancelled'` (and you would similarly skip cancelled `booking_rooms`), a cancelled room is instantly free for someone else.\n\nThe **total** must recompute: cancelling a room removes its `rate_per_night × nights` from the bill. If you have already taken payment, cancellation may trigger a refund flow (a later module), but the booking math here simply excludes cancelled lines.\n\nGuard the action: you typically cannot cancel a room that is already `checked-out`, and cancelling a booking should be blocked once it is fully settled.",
          whyItMatters:
            'Groups shrink and weddings get called off, so both room-level and booking-level cancellation are everyday needs. Doing them as a status change (not a delete) frees the rooms for re-letting instantly via the availability filter while preserving the record for audit and refunds — and recomputing the total from non-cancelled lines keeps the bill correct.',
          steps: [
            'Add a way to mark a single `booking_rooms` row cancelled (a status/flag).',
            'Add `CancelRoomAsync(bookingRoomId)` that sets it and guards against checked-out rooms.',
            'Add `CancelBookingAsync(bookingId)` that sets the booking `status = \'cancelled\'`.',
            'Ensure the availability query excludes cancelled bookings and cancelled rooms.',
            'Recompute the booking total from non-cancelled room lines.',
            'Never delete rows — keep cancelled records for audit and refunds.',
            'Block cancelling a fully settled or checked-out item.',
          ],
          code: `// Two grains of cancellation — both soft, both free the rooms.
public async Task CancelRoomAsync(int bookingRoomId)
{
    const string sql = @"
        UPDATE booking_rooms SET status = 'cancelled'
        WHERE id = @bookingRoomId
          AND checked_out_at IS NULL;";       // cannot cancel a stayed room
    using var c = new NpgsqlConnection(_cs);
    await c.ExecuteAsync(sql, new { bookingRoomId });
}

public async Task CancelBookingAsync(int bookingId)
{
    const string sql = @"
        UPDATE bookings SET status = 'cancelled'
        WHERE id = @bookingId
          AND status IN ('confirmed', 'checked-in');";  // not if checked-out
    using var c = new NpgsqlConnection(_cs);
    await c.ExecuteAsync(sql, new { bookingId });
}

// Availability already filters: b.status <> 'cancelled'
//   AND (for rooms) br.status IS DISTINCT FROM 'cancelled'
// so cancelled rooms/bookings are instantly free again.`,
          pitfalls: [
            '**Deleting the booking on cancel.** History and refund trail vanish. Fix: set `status = \'cancelled\'` (soft).',
            "**Cancelling a room but still counting it in availability.** Double-block. Fix: also skip cancelled `booking_rooms` in the overlap query.",
            '**Not recomputing the total after a room cancel.** The bill overcharges. Fix: sum only non-cancelled lines.',
            '**Allowing cancel of a checked-out room.** It already happened. Fix: guard `checked_out_at IS NULL`.',
            '**Cancelling a settled booking with no refund handling.** Money owed is lost. Fix: route to the refund flow (later module).',
            '**Forgetting to free the room immediately.** Lost re-let opportunity. Fix: availability excludes cancelled instantly.',
          ],
          tryIt:
            'Cancel one room of a three-room booking and confirm that room is immediately bookable by someone else while the other two stand and the total drops by one room. Then cancel the whole booking and confirm all rooms free up and the booking shows a `cancelled` badge but still exists.',
          takeaway:
            'Cancel a single room or a whole booking by setting status (never deleting); the availability filter frees the rooms instantly and the total recomputes from non-cancelled lines.',
        },
        {
          id: 'm4-t17',
          title: 'Smart Resume and the Bookings List',
          explain:
            'Build `/Booking/Resume/{id}` that jumps to the right next step, plus a paged, filtered bookings list for the front desk.',
          analogy:
            'A TunMani Resort clerk reopens a booking mid-process and the system **drops them exactly where the booking is** — if the guest has not arrived, it opens check-in; if they are staying, it opens checkout; if they have left, it opens payment; if paid, it shows the invoice. No hunting for the right button. And the **bookings register** is paged and filterable so the desk finds today\'s arrivals among thousands of records in a click.',
          theory:
            "**Smart resume** turns the booking\'s status into a redirect. `GET /Booking/Resume/{id}` reads the status and `RedirectToAction` to the appropriate step:\n- `confirmed` → the **check-in** screen\n- `checked-in` → the **checkout** screen\n- `checked-out` (unpaid) → the **payment** screen\n- paid → **issue/view invoice**\n\nThis means staff click one *Resume* button from the list and always land on the next meaningful action — the workflow guides them rather than making them remember where each booking stood. It is the booking equivalent of a wizard that remembers your place.\n\nThe **bookings list** must handle scale. A resort accumulates thousands of bookings, so the list is **paged** (LIMIT/OFFSET or keyset) and **filtered** by status, date range, and customer. The SQL takes `@status`, `@from`, `@to`, and a `@search`, plus `@limit`/`@offset`, and the view shows page controls. Filtering by `status = 'confirmed'` and today\'s `check_in` gives the front desk **today\'s arrivals**; `status = 'checked-in'` gives **in-house guests**.\n\nThe Resume link plus a good filtered list is what makes the front desk fast: find the booking, click Resume, do the next step — no scrolling, no guessing.",
          whyItMatters:
            'Front-desk work is interrupt-driven — staff reopen bookings constantly — and smart resume removes the mental load of knowing which screen comes next by deriving it from status. A paged, filtered list keeps the system usable as bookings grow into the thousands, turning "find today\'s arrivals" into one filter instead of endless scrolling.',
          steps: [
            'Add `GET /Booking/Resume/{id}` that reads the booking status.',
            'Redirect: confirmed→CheckIn, checked-in→Checkout, checked-out→Payment, paid→Invoice.',
            'Put a *Resume* button on each row of the bookings list.',
            'Write a paged, filtered list query taking `@status`, `@from`, `@to`, `@search`, `@limit`, `@offset`.',
            'Default the list to today\'s arrivals (`status=confirmed`, `check_in = today`).',
            'Add filter inputs and pager controls to the list view.',
            'Index the columns you filter on (`status`, `check_in`).',
          ],
          code: `// Smart resume: status decides the next screen.
[HttpGet("/Booking/Resume/{id:int}")]
public async Task<IActionResult> Resume(int id)
{
    var b = await _svc.GetAsync(id);
    if (b is null) return NotFound();

    return b.Status switch
    {
        BookingStatus.Confirmed  => RedirectToAction("CheckIn",  new { id }),
        BookingStatus.CheckedIn  => RedirectToAction("Checkout", new { id }),
        BookingStatus.CheckedOut when !b.IsPaid
                                 => RedirectToAction("Payment",  new { id }),
        BookingStatus.CheckedOut => RedirectToAction("Invoice",  new { id }),
        _                        => RedirectToAction("Details",  new { id }),
    };
}

-- Paged, filtered bookings list.
SELECT b.id, b.booking_ref, c.name AS CustomerName,
       b.check_in, b.check_out, b.status
FROM bookings b
JOIN customers c ON c.id = b.customer_id
WHERE (@status IS NULL OR b.status = @status)
  AND (@from   IS NULL OR b.check_in >= @from)
  AND (@to     IS NULL OR b.check_in <  @to)
  AND (@search IS NULL OR c.name ILIKE @search OR b.booking_ref ILIKE @search)
ORDER BY b.check_in DESC
LIMIT @limit OFFSET @offset;`,
          pitfalls: [
            '**Hard-coding which screen Resume opens.** It ignores where the booking actually is. Fix: switch on `status`.',
            "**Loading every booking into one page.** It crawls at scale. Fix: paginate with LIMIT/OFFSET (or keyset).",
            '**Filtering in C# after fetching all rows.** Wasteful. Fix: push filters into the SQL `WHERE`.',
            '**No index on `status`/`check_in`.** Filtered queries scan the whole table. Fix: add indexes.',
            '**OFFSET pagination on huge tables.** Deep pages get slow. Fix: keyset pagination for very large lists.',
            '**Resume on a missing booking throwing.** Ugly error. Fix: `NotFound()` when the booking is absent.',
          ],
          tryIt:
            'Implement `Resume` and click it on a `confirmed` booking (lands on check-in), a `checked-in` one (checkout), and a `checked-out` unpaid one (payment). Then filter the list to today\'s arrivals and page through, confirming the count and pager behave.',
          takeaway:
            'Resume reads booking status and redirects to the right next step, while a paged, filtered SQL list keeps the front desk fast as bookings grow into the thousands.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm4-p1',
      type: 'Project',
      title: 'Room Inventory CRUD + Availability Check',
      domain: 'Resort operations / ASP.NET Core MVC + Web API',
      duration: '3 hours',
      description:
        'Build the complete room inventory for TunMani Resort — Room entity, Dapper repository, service with validation, list and create/edit Razor views, an active/inactive toggle — and the availability feature: the date-overlap SQL and a GET /api/rooms/{id}/availability endpoint plus a free-rooms list view.',
      tools: ['ASP.NET Core 8 MVC', 'C#', 'PostgreSQL', 'Dapper', 'Npgsql'],
      blueprint: {
        overview:
          'Stand up the rooms table and a full CRUD path through controller → service → IRoomRepository (Dapper), then add the availability endpoint that finds rooms free for a date range using the half-open overlap rule, with a staff-facing availability list view.',
        functionalRequirements: [
          '**Room CRUD.** Create, list, edit rooms with RoomNumber, RoomType, Capacity, BasePrice, GstRate (default 12%), IsActive.',
          '**Validation.** Server-side ModelState rejects empty RoomNumber, Capacity < 1, negative price.',
          '**Active toggle.** A POST action soft-deactivates/reactivates a room; inactive rooms vanish from availability.',
          '**Availability API.** `GET /api/rooms/{id}/availability?from=&to=` returns JSON `{ roomId, isAvailable }`.',
          '**Free-rooms list.** A date picker lists all active rooms free for the chosen range with rate and capacity.',
          '**Overlap correctness.** Same-day turnover (check-out == check-in) is treated as free; cancelled bookings do not block.',
        ],
        technicalImplementation: [
          '**Repository.** Dapper with parameterised SQL; `INSERT ... RETURNING id`; snake_case columns aliased to PascalCase.',
          '**Service.** Validation, GST default, create-vs-update on `Id == 0`, returns a result tuple.',
          '**Views.** One shared `_Form.cshtml` for create/edit; POST-Redirect-GET; `[ValidateAntiForgeryToken]`.',
          '**Availability SQL.** `NOT EXISTS` overlap with `check_in < @to AND check_out > @from AND status <> \'cancelled\'`.',
          '**API controller.** `[ApiController]` returning `Ok(...)`; binds `DateOnly from`/`to` from query.',
          '**Indexes.** `booking_rooms(room_id)`, `bookings(check_in, check_out)`, `rooms(is_active)`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Room entity + repository',
            outcome: 'Room model and Dapper IRoomRepository compile and connect.',
            prompt:
              'Create a Room model (Id, RoomNumber, RoomType, Capacity, BasePrice decimal, GstRate decimal default 12, IsActive bool). Create IRoomRepository with GetAllAsync, GetByIdAsync, CreateAsync, UpdateAsync, SetActiveAsync, and a RoomRepository implementing it with Dapper against PostgreSQL: parameterised SQL, INSERT ... RETURNING id, snake_case columns aliased to PascalCase. Register it AddScoped in Program.cs.',
          },
          {
            step: 2,
            label: 'Room service',
            outcome: 'RoomService validates and decides create vs update.',
            prompt:
              'Add a RoomService taking IRoomRepository. Add ListAsync, GetAsync, and SaveAsync(Room) that trims RoomNumber, defaults GstRate to 12 when <= 0, rejects empty RoomNumber / Capacity < 1 / negative price (returning a (bool Ok, string? Error, int Id) tuple), and branches on Id == 0 for create vs update. Add ToggleActiveAsync.',
          },
          {
            step: 3,
            label: 'List + create/edit views',
            outcome: 'Rooms list and a working shared create/edit form.',
            prompt:
              'Add a RoomController (constructor takes RoomService). Build Index returning the rooms list as a table with a status badge. Add Create GET/POST and Edit GET/POST using one shared _Form.cshtml with asp-for / asp-validation-for tag helpers. On POST check ModelState.IsValid, call SaveAsync, and on success RedirectToAction(Index) with a TempData flash. Add DataAnnotations: [Required] RoomNumber, [Range(1,20)] Capacity.',
          },
          {
            step: 4,
            label: 'Active/inactive toggle',
            outcome: 'Rooms can be taken out of service via POST.',
            prompt:
              'Add a [HttpPost, ValidateAntiForgeryToken] ToggleActive(int id, bool active) action calling ToggleActiveAsync then redirecting to Index. In Index.cshtml render an Active/Inactive badge and a small POST form button per row that flips IsActive. Confirm inactive rooms are filtered out of availability.',
          },
          {
            step: 5,
            label: 'Availability API + SQL',
            outcome: 'GET /api/rooms/{id}/availability returns correct JSON.',
            prompt:
              "Add a RoomsApiController ([ApiController], route api/rooms). Add GET {id}/availability binding DateOnly from/to from the query, validating to > from, running a NOT EXISTS overlap query (check_in < @to AND check_out > @from AND status <> 'cancelled') with parameters, and returning Ok(new { roomId = id, isAvailable }). Add an index on booking_rooms(room_id) and bookings(check_in, check_out).",
          },
          {
            step: 6,
            label: 'Free-rooms list view',
            outcome: 'A date picker lists rooms free for a range.',
            prompt:
              'Add RoomService.FreeRoomsAsync(from, to) selecting active rooms whose id is NOT IN the set of rooms with a conflicting non-cancelled booking. Add a RoomController.Availability(DateOnly? from, DateOnly? to) GET action (default from=today, to=tomorrow) and an Availability.cshtml with a from/to date picker, an empty state, and a table of free rooms (type, capacity, rate, Book button that carries from/to into Booking/Create).',
          },
        ],
        deliverable:
          'A working room inventory (CRUD, validation, active toggle) plus an availability endpoint and free-rooms list that correctly apply the half-open overlap rule and exclude inactive rooms and cancelled bookings.',
      },
    },
    {
      id: 'm4-p2',
      type: 'Project',
      title: 'Multi-Room Booking Create + Check-in/Checkout Flow',
      domain: 'Resort operations / ASP.NET Core MVC + Web API',
      duration: '3 hours',
      description:
        'Build the booking feature: customer typeahead + quick-add, a multi-room create flow saving Booking + BookingRoom rows in one transaction (with overlap re-check, BookingRef, PublicToken, discount), and the check-in / per-room checkout / cancel workflow with smart resume and a paged, filtered bookings list.',
      tools: ['ASP.NET Core 8 MVC', 'C#', 'PostgreSQL', 'Dapper', 'Npgsql'],
      blueprint: {
        overview:
          'Implement the full create-booking flow — pick or quick-add a customer, assign multiple rooms with per-room guest and rate, generate identifiers, re-check overlap, and save everything atomically — then the check-in/checkout/cancel lifecycle with a status-driven Resume and a paged list.',
        functionalRequirements: [
          '**Customer step.** Debounced typeahead via /api/customers?q= plus inline quick-add returning the new id.',
          '**Multi-room.** One booking holds many BookingRoom rows, each with GuestName and frozen RatePerNight.',
          '**Identifiers.** Generate a readable BookingRef and a random GUID PublicToken; apply a discount amount.',
          '**Atomic save.** Booking + booking_rooms inserted in one transaction with an overlap re-check inside it.',
          '**Workflow.** Check-in (booking-level), per-room checkout (CheckedOutAt), cancel room, cancel booking — all status-guarded.',
          '**Resume + list.** /Booking/Resume/{id} jumps to the right step; a paged, filtered bookings list with today\'s-arrivals default.',
        ],
        technicalImplementation: [
          '**Search API.** `WHERE name ILIKE @term OR phone LIKE @term LIMIT 10`; quick-add `INSERT ... RETURNING id`.',
          '**Join table.** booking_rooms(booking_id FK ON DELETE CASCADE, room_id, guest_name, rate_per_night, checked_out_at).',
          '**Identifiers.** BookingRef = `TMR-{year}-{seq:D4}`; PublicToken = `Guid.NewGuid()`; public link by token only.',
          '**Transaction.** OpenAsync → BeginTransactionAsync → overlap re-check → insert parent (RETURNING id) → insert rooms (pass tx) → CommitAsync, RollbackAsync on catch.',
          '**State machine.** Status constants; CheckIn requires confirmed; per-room checkout flips booking when last room leaves.',
          '**List.** Parameterised filters (status/from/to/search) with LIMIT/OFFSET; indexes on status and check_in.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Customer search + quick-add',
            outcome: 'Typeahead finds customers and quick-add returns a new id.',
            prompt:
              'Add a CustomersApiController (route api/customers). GET ?q= runs WHERE name ILIKE @term OR phone LIKE @term ORDER BY name LIMIT 10 (term = %q%) returning { id, name, phone }. POST accepts { name, phone }, inserts with RETURNING id, and returns the new id. On the booking form add a debounced (~300ms) typeahead storing the chosen customerId in a hidden field, plus a Quick-add mini-form that posts and auto-selects the returned id.',
          },
          {
            step: 2,
            label: 'Booking + BookingRoom schema',
            outcome: 'Parent/child tables and C# models exist.',
            prompt:
              "Create bookings (id, customer_id FK, check_in, check_out, status default 'confirmed', booking_ref, public_token uuid, discount numeric, CHECK check_out > check_in) and booking_rooms (id, booking_id FK ON DELETE CASCADE, room_id FK, guest_name, rate_per_night numeric, checked_out_at timestamptz null, status default 'active'). Add C# Booking with List<BookingRoom> Rooms, and BookingRoom (RoomId, GuestName, RatePerNight).",
          },
          {
            step: 3,
            label: 'Identifiers + total',
            outcome: 'BookingRef, PublicToken, and discounted total compute correctly.',
            prompt:
              'In BookingService add MakeBookingRef(sequence) => "TMR-{year}-{seq:D4}", MakePublicToken() => Guid.NewGuid(), and ComputeTotal(rooms, nights, discount, gstRate) that sums rate_per_night*nights, subtracts the discount (clamped at 0), then adds GST at gstRate (12 for rooms). Add a public GET /b/{token} that looks the booking up by public_token only (never id or booking_ref) and 404s on an unknown token.',
          },
          {
            step: 4,
            label: 'Atomic create',
            outcome: 'A multi-room booking saves all-or-nothing.',
            prompt:
              'Add BookingService.CreateAsync(Booking) that opens a connection, BeginTransactionAsync, re-checks overlap for each requested room inside the transaction (rolling back with a clear message if any is now taken), inserts the bookings row (RETURNING id), loops inserting each booking_rooms row passing tx, then CommitAsync (RollbackAsync in catch). Return (Ok, Error, BookingId). Wire a Booking/Create POST that builds the Booking from the form and redirects to Resume on success.',
          },
          {
            step: 5,
            label: 'Check-in / checkout / cancel',
            outcome: 'The status lifecycle works with per-room checkout.',
            prompt:
              "Add BookingStatus constants and: CheckInAsync (requires confirmed, stamps checked_in_at), CheckOutRoomAsync(bookingRoomId) (stamps checked_out_at where null, then flips the booking to checked-out only when no rooms remain in), CancelRoomAsync (sets room status='cancelled' if not checked out), CancelBookingAsync (sets booking status='cancelled' if confirmed/checked-in). Add controller actions and per-room checkout/cancel buttons on the booking detail view.",
          },
          {
            step: 6,
            label: 'Smart resume + bookings list',
            outcome: 'Resume jumps to the right step; the list is paged and filtered.',
            prompt:
              "Add GET /Booking/Resume/{id} that switches on status: confirmed→CheckIn, checked-in→Checkout, checked-out & unpaid→Payment, checked-out & paid→Invoice, else Details (NotFound if missing). Add a paged, filtered bookings list query taking @status, @from, @to, @search, @limit, @offset (status/check_in filters, ILIKE search on customer name and booking_ref) defaulting to today's arrivals, with a Resume button per row and pager controls. Index status and check_in.",
          },
        ],
        deliverable:
          'A complete booking feature: customer search/quick-add, atomic multi-room create with overlap re-check and identifiers, the check-in/per-room-checkout/cancel lifecycle, and a status-driven Resume over a paged, filtered bookings list.',
      },
    },
  ],
  quiz: [
    {
      id: 'm4-q1',
      q: 'Two date ranges for the same room — existing [check_in, check_out) and requested [from, to) — overlap exactly when:',
      options: [
        'check_in <= to AND check_out >= from',
        'check_in < to AND check_out > from',
        'check_in = from AND check_out = to',
        'check_in > to OR check_out < from',
      ],
      answer: 1,
    },
    {
      id: 'm4-q2',
      q: 'Why is RatePerNight stored on each booking_rooms join row instead of read from the room\'s current BasePrice at invoice time?',
      options: [
        'To save a database column.',
        'So the rate agreed at booking time is frozen and a later price change cannot rewrite a confirmed booking.',
        'Because rooms have no price.',
        'To make the query faster.',
      ],
      answer: 1,
    },
    {
      id: 'm4-q3',
      q: 'Why must the room overlap check be re-run inside the booking-save transaction rather than only when the form was opened?',
      options: [
        'To make the save faster.',
        'Because another booking can claim the room between the on-screen check and confirm — a race condition (TOCTOU) that would double-book.',
        'Because Razor views cannot show availability.',
        'The first check is always wrong.',
      ],
      answer: 1,
    },
    {
      id: 'm4-q4',
      q: 'What is the correct use of the random PublicToken (GUID) versus the BookingRef?',
      options: [
        'BookingRef secures public links; PublicToken is read over the phone.',
        'Both are interchangeable in URLs.',
        'PublicToken secures unguessable public links (/b/{token}); BookingRef is the readable, phone-friendly reference.',
        'PublicToken is the primary key.',
      ],
      answer: 2,
    },
    {
      id: 'm4-q5',
      q: 'In a multi-room booking, when does the booking itself transition to checked-out?',
      options: [
        'As soon as the first room checks out.',
        'When the guest pays.',
        'Only once every booking_rooms row has a checked_out_at timestamp.',
        'Immediately on check-in.',
      ],
      answer: 2,
    },
    {
      id: 'm4-q6',
      q: 'What does GET /Booking/Resume/{id} do?',
      options: [
        'Deletes the booking.',
        'Reads the booking status and redirects to the right next step (check-in → checkout → payment → invoice).',
        'Always opens the check-in screen.',
        'Refunds the booking.',
      ],
      answer: 1,
    },
  ],
};
