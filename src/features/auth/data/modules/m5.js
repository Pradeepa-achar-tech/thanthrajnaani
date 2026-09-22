// Module 5 — Halls & Event Bookings (Weddings & Functions) for "TunMani Resort".
// ASP.NET Core MVC + Web API, C#, PostgreSQL via Dapper. Teaches the event/
// wedding-hall booking feature: halls + packages CRUD, the multi-step hall-booking
// wizard (couple details, hall + package + AC, rooms required, advance), and the
// event workflow with a change-log audit trail and CRM contact sync.

export const m5 = {
  id: 'm5',
  title: 'Halls & Event Bookings (Weddings & Functions)',
  hours: 9,
  color: 'from-rose-500/20 to-rose-700/10',
  accent: 'rose',
  description:
    'Build the event-hall side of TunMani Resort: Hall and HallPackage CRUD plus ResortPackage bundles, the multi-step hall-booking wizard with couple details, AC, rooms-required and advance payment, and the event workflow with an audited change log and CRM contact sync.',
  sections: [
    {
      id: 'm5-s1',
      title: 'Halls & Packages',
      topics: [
        {
          id: 'm5-t1',
          title: 'The Hall Entity and Service',
          explain:
            'Define the `Hall` entity (HallName, Capacity, GstRate 18%, Description, IsActive) and a `HallService` with CRUD, mirroring the room pattern but with the higher event-GST rate.',
          analogy:
            'Beside the rooms, TunMani Resort in Kundapura has its grand **event halls**: the *Sagar Banquet* that seats 500 for a wedding, the smaller *Tulu Hall* for an engagement. Each hall is one entry in the venue catalogue — its name, how many guests it holds, a description for the brochure, and a flag for when it is under repair. A hall is like a room, but it is rented for a **function**, and functions carry **18% GST**, not the room\'s 12%.',
          theory:
            "A **hall** is the venue you rent for an event, so the `Hall` entity carries: `Id`, `HallName` (e.g. `\"Sagar Banquet\"`), `Capacity` (max guests), `GstRate` (**18% for event/banquet services** vs 12% for room stays), `Description` (brochure text), and `IsActive` (the soft on/off flag).\n\nThe structure deliberately **mirrors the `Room`** pattern from Module 4: an `IHallRepository` (Dapper, parameterised SQL, `RETURNING id`), a `HallService` holding rules and the create-vs-update decision, and a `HallController` with list and create/edit Razor views. Reusing the shape means the team already knows how to read and extend it.\n\nThe one important difference is the **GST rate**. Indian GST treats banquet-hall hire and event services at **18%**, while room accommodation is **12%**. Storing `GstRate = 18m` on the hall row keeps tax correct per service type and lets a future rate change be one column update. A booking that combines rooms (12%) and a hall (18%) therefore taxes each component at its own rate.\n\nLike rooms, halls are **soft-deleted** via `IsActive`, never hard-deleted, because past event bookings reference them.",
          whyItMatters:
            'The hall is the anchor of every event booking, and getting its fields right — especially the 18% GST that distinguishes event services from room stays — keeps invoices legally correct. Mirroring the proven room CRUD pattern means less new code and fewer bugs, while the IsActive flag protects the history of past weddings and functions held in each hall.',
          steps: [
            'Create `Models/Hall.cs` with `Id`, `HallName`, `Capacity`, `GstRate`, `Description`, `IsActive`.',
            'Default `GstRate` to `18m` for event/banquet services.',
            'Create `IHallRepository` (GetAll, GetById, Create, Update, SetActive) and a Dapper `HallRepository`.',
            'Create `HallService` with `ListAsync`, `GetAsync`, `SaveAsync`, `ToggleActiveAsync`.',
            'In `SaveAsync`, default `GstRate` to 18 when zero and validate name/capacity.',
            'Add a `HallController` with Index, Create/Edit views (reuse the room form pattern).',
            'Register both with `AddScoped` in `Program.cs`.',
          ],
          code: `// Models/Hall.cs — one event hall in the TunMani Resort catalogue.
public class Hall
{
    public int Id { get; set; }
    public string HallName { get; set; } = "";   // e.g. "Sagar Banquet"
    public int Capacity { get; set; }              // max guests
    public decimal GstRate { get; set; } = 18m;    // events = 18% GST
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public interface IHallRepository
{
    Task<IEnumerable<Hall>> GetAllAsync();
    Task<Hall?> GetByIdAsync(int id);
    Task<int> CreateAsync(Hall hall);
    Task UpdateAsync(Hall hall);
    Task SetActiveAsync(int id, bool isActive);
}

// Services/HallService.cs — rules + create/update, like RoomService.
public class HallService
{
    private readonly IHallRepository _repo;
    public HallService(IHallRepository repo) => _repo = repo;

    public async Task<(bool Ok, string? Error, int Id)> SaveAsync(Hall h)
    {
        h.HallName = (h.HallName ?? "").Trim();
        if (h.GstRate <= 0) h.GstRate = 18m;          // events default 18%
        if (string.IsNullOrEmpty(h.HallName))
            return (false, "Hall name is required.", 0);
        if (h.Capacity < 1)
            return (false, "Capacity must be at least 1.", 0);

        if (h.Id == 0) return (true, null, await _repo.CreateAsync(h));
        await _repo.UpdateAsync(h);
        return (true, null, h.Id);
    }
}`,
          pitfalls: [
            '**Reusing the room 12% GST for halls.** Event invoices then under-charge tax. Fix: default the hall `GstRate` to 18%.',
            "**Hard-coding the GST rate in pricing code.** A rate change means many edits. Fix: store `GstRate` on the hall row.",
            '**Hard-deleting a hall with past events.** History and invoices break. Fix: soft-delete via `IsActive`.',
            '**Skipping the create-vs-update branch.** Edits insert duplicates. Fix: branch on `Id == 0` in `SaveAsync`.',
            '**Not trimming `HallName`.** Duplicates differ by whitespace. Fix: trim before saving.',
            '**Depending on the concrete repository in the controller.** Untestable. Fix: depend on `IHallRepository`.',
          ],
          tryIt:
            'Create two halls: "Sagar Banquet" (capacity 500) and "Tulu Hall" (capacity 150), both at 18% GST. Edit the description of one and confirm only it changed. Deactivate "Tulu Hall" and confirm it is hidden from the booking wizard but still listed in admin.',
          takeaway:
            'A Hall mirrors the Room pattern (entity, repository, service, views) but carries 18% event GST and soft-deletes via IsActive to protect past event records.',
        },
        {
          id: 'm5-t2',
          title: 'HallPackage Budget Tiers',
          explain:
            'Add per-hall budget tiers (Standard / Premium / Deluxe) as `HallPackage` rows with Name, Price, SortOrder and IsActive, managed via `/Hall/{id}/AddPackage`.',
          analogy:
            'When a family books the Sagar Banquet for a wedding, TunMani Resort offers **three menus on a card**: *Standard* (simple veg spread), *Premium* (with sweets and live counters), *Deluxe* (full feast with seafood). Each tier has its own price and a fixed order on the card. The `HallPackage` rows are those menu tiers — they belong to one hall, and the family picks exactly one for their function.',
          theory:
            "A **hall package** is a priced tier offered for a hall. The `HallPackage` entity carries `Id`, `HallId` (which hall it belongs to), `Name` (Standard / Premium / Deluxe), `Price`, `SortOrder` (display order on the card), and `IsActive`. One hall has **many** packages — another one-to-many relationship, like a booking and its rooms.\n\n`SortOrder` controls the **display sequence** so Standard always shows before Premium before Deluxe, regardless of insertion order or id. You `ORDER BY sort_order` when listing a hall's packages. This lets staff reorder tiers without renumbering ids.\n\nPackages are added through a hall-scoped route: `GET/POST /Hall/{id}/AddPackage`. The `{id}` is the hall id, captured from the route, so the new package is automatically tied to that hall. This **nested route** keeps the package always associated with its parent hall — there is no way to create an orphan package.\n\nLike halls, packages are **soft-deactivated** with `IsActive` rather than deleted, because past bookings may reference a tier that has since been retired. The booking wizard lists only active packages for the chosen hall, ordered by `SortOrder`, and the customer selects one — its `Price` then feeds the event total.",
          whyItMatters:
            'Real wedding venues sell by budget tier, and modelling each tier as a HallPackage row lets staff manage prices per hall without code changes. SortOrder gives a stable, staff-controllable presentation, the nested AddPackage route guarantees every package belongs to a hall, and soft-deletion keeps retired tiers resolvable for the bookings that chose them.',
          steps: [
            'Create `Models/HallPackage.cs` with `Id`, `HallId`, `Name`, `Price`, `SortOrder`, `IsActive`.',
            'Add a `hall_packages` table with a `hall_id` FK to `halls`.',
            'Add `GET /Hall/{id}/AddPackage` returning a small form scoped to that hall.',
            'Add `POST /Hall/{id}/AddPackage` inserting the package with `hall_id = id`.',
            'List a hall\'s packages with `ORDER BY sort_order` (active only for booking).',
            'Soft-deactivate retired tiers via `IsActive` rather than deleting.',
            'Show the hall\'s packages on the hall detail page with their prices.',
          ],
          code: `// Models/HallPackage.cs — a priced tier belonging to one hall.
public class HallPackage
{
    public int Id { get; set; }
    public int HallId { get; set; }              // parent hall
    public string Name { get; set; } = "";       // Standard / Premium / Deluxe
    public decimal Price { get; set; }
    public int SortOrder { get; set; }           // display order on the card
    public bool IsActive { get; set; } = true;
}

-- hall_packages table
CREATE TABLE hall_packages (
    id         SERIAL PRIMARY KEY,
    hall_id    INT NOT NULL REFERENCES halls(id),
    name       TEXT NOT NULL,
    price      NUMERIC(10,2) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE
);

// Hall-scoped route — the {id} ties the package to its hall.
[HttpPost("/Hall/{id:int}/AddPackage")]
[ValidateAntiForgeryToken]
public async Task<IActionResult> AddPackage(int id, HallPackage pkg)
{
    pkg.HallId = id;                              // bind to the parent hall
    if (!ModelState.IsValid) return View(pkg);
    await _hallSvc.AddPackageAsync(pkg);
    return RedirectToAction("Details", new { id });
}`,
          pitfalls: [
            '**Letting a package exist without a hall.** Orphan tiers confuse the wizard. Fix: the nested `/Hall/{id}/AddPackage` route sets `HallId` from the route.',
            "**Relying on id order for display.** Reordering tiers becomes impossible. Fix: an explicit `SortOrder`.",
            '**Hard-deleting a retired tier referenced by old bookings.** History breaks. Fix: soft-deactivate via `IsActive`.',
            '**Forgetting to filter active packages in the wizard.** Retired tiers get offered. Fix: `WHERE is_active` when listing for booking.',
            '**Not ordering by `sort_order`.** Tiers appear in random order. Fix: `ORDER BY sort_order`.',
            '**Storing the price as `double`.** Currency rounds wrong. Fix: `NUMERIC`/`decimal`.',
          ],
          tryIt:
            'Add three packages to Sagar Banquet — Standard 800, Premium 1200, Deluxe 1800 per plate — with SortOrder 1/2/3. List them and confirm they appear in that order. Deactivate Premium and confirm the wizard offers only Standard and Deluxe while the hall admin still shows all three.',
          takeaway:
            'HallPackage rows are per-hall budget tiers ordered by SortOrder, created through the nested /Hall/{id}/AddPackage route and soft-deactivated so old bookings still resolve their tier.',
        },
        {
          id: 'm5-t3',
          title: 'ResortPackage Bundles (Room + Hall Combos)',
          explain:
            'Model `ResortPackage` bundles that combine rooms and a hall — Name, Duration, Rate, KeyInclusions, MaxRooms — as ready-made wedding offers.',
          analogy:
            'For a full wedding, TunMani Resort sells a **complete package deal**: "Two-Day Beach Wedding — the Sagar Banquet for the function, up to 20 rooms for the guests, decoration and breakfast included, all for one bundled rate." Instead of pricing the hall and each room separately, the family buys one named bundle. The `ResortPackage` is that all-in-one offer printed in the brochure.',
          theory:
            "A **resort package** is a **bundled offer** combining a hall and a block of rooms at a single rate — the wedding-planner's ready-made deal. The `ResortPackage` entity carries `Id`, `Name` (e.g. `\"Two-Day Beach Wedding\"`), `Duration` (e.g. `\"2 days / 1 night\"`), `Rate` (the bundled price), `KeyInclusions` (what's included — decoration, breakfast, mandap), and `MaxRooms` (the room cap included in the bundle).\n\nWhere a `HallPackage` is a **food/service tier for one hall**, a `ResortPackage` is a **cross-cutting bundle** spanning a hall plus rooms. It is a marketing-and-pricing convenience: the customer picks one bundle, and the booking is pre-populated with the hall and a room allowance rather than configured piece by piece.\n\n`KeyInclusions` is descriptive text (or a simple list) shown to the customer — it does not drive logic, it sets expectations. `MaxRooms` does drive logic: it caps how many rooms the bundle covers, so the wizard can warn if the family wants more rooms than the bundle includes (extra rooms billed separately).\n\nResort packages are **optional** in the booking flow: a family can either pick a bundle (fast path) or build a custom event (hall + tier + rooms chosen individually). The bundle simply seeds sensible defaults. Like the others, it has an active flag so seasonal offers can be retired without deletion.",
          whyItMatters:
            'Wedding customers prefer buying a named, all-inclusive package over assembling a hall, a tier, and rooms separately, and ResortPackage captures exactly that. MaxRooms turns the bundle into a real constraint the wizard can enforce, KeyInclusions sets clear expectations, and offering bundles as an optional fast path speeds up the most common high-value bookings without removing custom flexibility.',
          steps: [
            'Create `Models/ResortPackage.cs` with `Id`, `Name`, `Duration`, `Rate`, `KeyInclusions`, `MaxRooms`, `IsActive`.',
            'Add a `resort_packages` table; `KeyInclusions` as text, `MaxRooms` as int.',
            'Add CRUD so staff can author seasonal bundles.',
            'In the booking wizard, offer bundles as an optional fast path.',
            'When a bundle is chosen, pre-fill the hall and a room allowance up to `MaxRooms`.',
            'Warn if the family requests more rooms than `MaxRooms` (extra billed separately).',
            'Retire seasonal bundles via `IsActive`, never delete.',
          ],
          code: `// Models/ResortPackage.cs — an all-in-one room + hall bundle.
public class ResortPackage
{
    public int Id { get; set; }
    public string Name { get; set; } = "";        // "Two-Day Beach Wedding"
    public string Duration { get; set; } = "";    // "2 days / 1 night"
    public decimal Rate { get; set; }             // bundled price
    public string? KeyInclusions { get; set; }    // "Decoration, breakfast, mandap"
    public int MaxRooms { get; set; }             // room cap in the bundle
    public bool IsActive { get; set; } = true;
}

-- resort_packages table
CREATE TABLE resort_packages (
    id             SERIAL PRIMARY KEY,
    name           TEXT NOT NULL,
    duration       TEXT NOT NULL,
    rate           NUMERIC(10,2) NOT NULL,
    key_inclusions TEXT,
    max_rooms      INT NOT NULL DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE
);

// In the wizard: a chosen bundle seeds defaults and caps rooms.
if (selectedBundle is not null && requestedRooms > selectedBundle.MaxRooms)
    warning = $"This bundle includes up to {selectedBundle.MaxRooms} rooms; " +
              $"extra rooms are billed separately.";`,
          pitfalls: [
            '**Confusing a ResortPackage with a HallPackage.** One bundles rooms+hall; the other is a food tier for one hall. Fix: keep them as separate entities.',
            "**Treating `KeyInclusions` as logic.** It is descriptive only. Fix: drive caps from `MaxRooms`, not the text.",
            '**Ignoring `MaxRooms` when assigning rooms.** The bundle silently over-delivers. Fix: warn/bill extra rooms beyond the cap.',
            '**Making bundles mandatory.** Custom events become impossible. Fix: bundles are an optional fast path.',
            '**Deleting a seasonal bundle.** Old bookings lose their offer. Fix: soft-deactivate via `IsActive`.',
            '**Storing `Rate` as a percentage.** It is a flat bundled price. Fix: a `NUMERIC` amount.',
          ],
          tryIt:
            'Create a "Two-Day Beach Wedding" bundle: duration "2 days / 1 night", rate 250000, inclusions "Hall, decoration, breakfast, mandap", MaxRooms 20. In the wizard pick it and request 25 rooms; confirm the warning about 5 extra rooms appears and the hall is pre-selected.',
          takeaway:
            'A ResortPackage is an optional all-in-one room+hall bundle whose MaxRooms caps the included rooms and whose KeyInclusions sets expectations — distinct from a hall\'s food-tier HallPackage.',
        },
        {
          id: 'm5-t4',
          title: 'Listing Halls, Packages and Bundles Together',
          explain:
            'Build the hall detail view that shows a hall with its packages, plus a catalogue page listing halls and resort-package bundles for staff and the booking wizard.',
          analogy:
            'TunMani Resort\'s **events brochure** opens to a page per hall — the Sagar Banquet with its three menu tiers and prices listed underneath — and a final spread showing the headline **wedding bundles**. Staff flip to the right page to advise a family. This screen is that brochure rendered from the database: hall, its tiers, and the bundles, all in one place.',
          theory:
            "The **hall detail view** (`/Hall/Details/{id}`) loads one hall and its **active packages ordered by `SortOrder`**. This is a **parent-with-children read**: one hall row plus its many `hall_packages` rows. You can do it as two queries (hall, then its packages) or one `JOIN`; for a single hall, two simple queries are clear and fast.\n\nThe view shows the hall's name, capacity, GST, and a table of its package tiers with prices, plus an *Add Package* button leading to `/Hall/{id}/AddPackage`. This is where staff manage a hall's offering.\n\nThe **catalogue page** (`/Hall/Index` or an `Events` landing) lists all active **halls** and all active **resort-package bundles** so staff and the wizard have one place to start a booking. Halls show capacity and starting price; bundles show duration, rate, and inclusions.\n\nA key UI rule: the **booking wizard** consumes the *active* subset (active halls, active packages, active bundles), while the **admin catalogue** shows everything including inactive items with a badge, so staff can manage retired offers. Same data, two filters.\n\nLoading the hall with its packages in a tidy view model — `HallDetailVm { Hall, Packages }` — keeps the Razor view simple and avoids ad-hoc queries scattered in the markup.",
          whyItMatters:
            'Staff advising a family need the hall, its tiers, and the bundles in one glance, and a clean parent-with-children view delivers that. Separating the active subset (for the wizard) from the full list (for admin) means customers never see retired offers while staff retain full control — and a view model keeps the data loading out of the Razor markup, which keeps the page maintainable.',
          steps: [
            'Add `GET /Hall/Details/{id}` loading the hall and its active packages ordered by `SortOrder`.',
            'Build a `HallDetailVm { Hall, List<HallPackage> Packages }` view model.',
            'Render the hall facts plus a packages table with prices and an *Add Package* button.',
            'Add a catalogue page listing active halls and active resort bundles.',
            'In admin, show inactive halls/packages/bundles with an Inactive badge.',
            'In the wizard, consume only the active subset.',
            'Show each hall\'s starting price (its cheapest active package).',
          ],
          code: `// View model + detail action: a hall with its package tiers.
public class HallDetailVm
{
    public Hall Hall { get; set; } = default!;
    public List<HallPackage> Packages { get; set; } = new();
}

[HttpGet("/Hall/Details/{id:int}")]
public async Task<IActionResult> Details(int id)
{
    var hall = await _hallSvc.GetAsync(id);
    if (hall is null) return NotFound();
    var packages = await _hallSvc.ActivePackagesAsync(id);  // ORDER BY sort_order
    return View(new HallDetailVm { Hall = hall, Packages = packages });
}

/* Views/Hall/Details.cshtml */
@model HallDetailVm
<h2>@Model.Hall.HallName <small>(seats @Model.Hall.Capacity)</small></h2>
<p>GST @Model.Hall.GstRate%</p>
<table class="table">
  @foreach (var p in Model.Packages)
  {
    <tr><td>@p.Name</td><td>@p.Price.ToString("C")/plate</td></tr>
  }
</table>
<a class="btn btn-primary" asp-action="AddPackage"
   asp-route-id="@Model.Hall.Id">Add Package</a>`,
          pitfalls: [
            '**Running queries inside the Razor view.** Mixes data access with markup. Fix: load into a view model in the action.',
            "**Showing inactive packages in the wizard.** Customers pick retired tiers. Fix: the wizard uses the active subset only.",
            '**Not ordering packages by `sort_order`.** Tiers appear randomly. Fix: `ORDER BY sort_order`.',
            '**Hiding inactive items from admin too.** Staff cannot reactivate them. Fix: admin shows all with a badge.',
            '**N+1 queries listing many halls with their packages.** Slow. Fix: one JOIN or batch the package read.',
            '**404 not handled on a missing hall.** Ugly error. Fix: `NotFound()` when the hall is absent.',
          ],
          tryIt:
            'Build the hall detail page for Sagar Banquet showing its three tiers in SortOrder, then a catalogue listing both halls and the wedding bundle. Confirm the wizard view shows only active items while the admin catalogue shows a deactivated tier with a badge.',
          takeaway:
            'The hall detail view loads a hall with its sorted active packages via a view model, and the catalogue lists halls and bundles — active subset for the wizard, everything for admin.',
        },
      ],
    },
    {
      id: 'm5-s2',
      title: 'Creating a Hall Booking',
      topics: [
        {
          id: 'm5-t5',
          title: 'The HallBooking Entity',
          explain:
            'Model the rich `HallBooking` entity — couple and event details, hall/package, AC, rooms-required, pricing, advance payment, status and workflow stage.',
          analogy:
            'A wedding booking at TunMani Resort fills a **thick reservation form**: the couple\'s names and the contact person, the event type and date, which hall and food tier, whether AC is needed, how many guest rooms, the price and the advance paid, and a stamp for where the booking stands. The `HallBooking` entity is that whole form captured as one record — far richer than a simple room booking because a wedding has far more moving parts.',
          theory:
            "A `HallBooking` is a **wide entity** because weddings carry many details. Group the fields by purpose:\n\n**Identity & customer:** `Id`, `BookingRef`, `CustomerId`, `PublicToken` (GUID for the login-free share link, exactly like the room booking).\n\n**Event:** `HallId`, `HallPackageId`, `EventDate`, `EventEndDate`, `EventType` (wedding / engagement / reception / birthday / other), `EventName`, `SlotType` (morning / evening / full-day), `TimeFrom`, `TimeTo`, `ExpectedGuests`.\n\n**People:** `BrideName`, `GroomName` (for weddings), and a generic `EventPersonName` / `EventPersonDob` / `EventPersonPhone` for non-wedding functions (a birthday's celebrant, say).\n\n**Add-ons:** `AcRequired` + `AcCharge`, `RoomsRequired` + `NumberOfRooms`.\n\n**Money:** `HallPrice`, `GstRate` (18%), `DiscountAmount`, `AdvanceAmount` + `AdvancePaymentMode` + `AdvanceReference`.\n\n**Status:** `Status` (the lifecycle) and `WorkflowStage` (where the multi-step process sits).\n\nThe entity references the hall and package by **id** (foreign keys), and the actual hall list and room list go in **join tables** (`hall_booking_halls`, `hall_booking_rooms`) covered next — a booking can, in principle, span more than one hall or include several rooms. The wide single row holds the headline facts; the joins hold the multi-valued ones. Keeping money fields as `decimal`/`NUMERIC` and the rate on the booking keeps the invoice exact.",
          whyItMatters:
            'A wedding is a complex transaction, and a well-grouped HallBooking entity captures every detail staff must record without losing track of any. Keeping bride/groom and a generic event-person side by side supports both weddings and other functions in one model, while foreign keys to hall/package plus join tables keep the multi-valued parts clean — and decimal money fields keep the high-value event invoice exact.',
          steps: [
            'Create `Models/HallBooking.cs` grouping identity, event, people, add-ons, money, and status fields.',
            'Reference the hall and package by id (`HallId`, `HallPackageId`).',
            'Include both wedding fields (`BrideName`, `GroomName`) and generic event-person fields.',
            'Add add-on fields: `AcRequired` + `AcCharge`, `RoomsRequired` + `NumberOfRooms`.',
            'Add money fields as `decimal`: `HallPrice`, `GstRate`, `DiscountAmount`, `AdvanceAmount`.',
            'Add `Status` and `WorkflowStage` for the lifecycle and the wizard position.',
            'Plan join tables `hall_booking_halls` and `hall_booking_rooms` for multi-valued parts.',
          ],
          code: `// Models/HallBooking.cs — the wide event-booking record.
public class HallBooking
{
    // identity & customer
    public int Id { get; set; }
    public string BookingRef { get; set; } = "";
    public int CustomerId { get; set; }
    public Guid PublicToken { get; set; }

    // event
    public int HallId { get; set; }
    public int? HallPackageId { get; set; }
    public DateOnly EventDate { get; set; }
    public DateOnly? EventEndDate { get; set; }
    public string EventType { get; set; } = "wedding"; // engagement/reception/...
    public string? EventName { get; set; }
    public string? SlotType { get; set; }              // morning/evening/full-day
    public TimeOnly? TimeFrom { get; set; }
    public TimeOnly? TimeTo { get; set; }
    public int ExpectedGuests { get; set; }

    // people
    public string? BrideName { get; set; }
    public string? GroomName { get; set; }
    public string? EventPersonName { get; set; }
    public DateOnly? EventPersonDob { get; set; }
    public string? EventPersonPhone { get; set; }

    // add-ons
    public bool AcRequired { get; set; }
    public decimal AcCharge { get; set; }
    public bool RoomsRequired { get; set; }
    public int NumberOfRooms { get; set; }

    // money
    public decimal HallPrice { get; set; }
    public decimal GstRate { get; set; } = 18m;
    public decimal DiscountAmount { get; set; }
    public decimal AdvanceAmount { get; set; }
    public string? AdvancePaymentMode { get; set; }    // cash/upi/card
    public string? AdvanceReference { get; set; }

    // status
    public string Status { get; set; } = "confirmed";
    public string WorkflowStage { get; set; } = "couple-details";
}`,
          pitfalls: [
            '**Cramming hall and room lists into the single row.** They are multi-valued. Fix: use `hall_booking_halls` / `hall_booking_rooms` join tables.',
            "**Only modelling bride/groom and not generic events.** Birthdays/other functions break. Fix: add generic event-person fields.",
            '**Storing money as `double`.** High-value invoices round wrong. Fix: `decimal`/`NUMERIC`.',
            '**Copying the hall name/price into the booking instead of the id.** Drifts on edits. Fix: reference by `HallId`, snapshot price separately if needed.',
            '**Reusing the room 12% GST.** Event GST is 18%. Fix: default `GstRate` to 18.',
            '**No `PublicToken`.** Couples cannot view their booking without login. Fix: a random GUID like the room booking.',
          ],
          tryIt:
            'Map a real wedding onto the entity: bride/groom names, EventType "wedding", a hall + Premium package, AcRequired true with a charge, 15 rooms, a discount and an advance via UPI with a reference. Confirm every detail has a home field and nothing needs an extra column.',
          takeaway:
            'HallBooking is a wide entity grouping event, people (wedding and generic), add-ons, money (18% GST), and status — with multi-valued halls/rooms pushed to join tables.',
        },
        {
          id: 'm5-t6',
          title: 'Join Tables: hall_booking_halls and hall_booking_rooms',
          explain:
            'Model the multi-valued parts of an event booking — the hall(s) and the guest rooms — as join tables linked to the parent `hall_booking`.',
          analogy:
            'A big TunMani Resort wedding sometimes spills across **two halls** — the Sagar Banquet for dinner and the Tulu Hall for the mandap — and books a **block of guest rooms** for the family. The reservation form lists these on separate attached sheets. `hall_booking_halls` and `hall_booking_rooms` are those attached sheets: child rows tied to the one parent booking.',
          theory:
            "Two parts of an event booking are **multi-valued**, so they live in **join tables**, just like `booking_rooms` did for room bookings.\n\n**`hall_booking_halls`** links a booking to the hall(s) it uses. Most weddings use one hall, but a large function can span several, so a join table keeps the door open without restructuring later. Each row: `id`, `hall_booking_id` (FK), `hall_id` (FK), and optionally the per-hall slot or price snapshot.\n\n**`hall_booking_rooms`** links the booking to the **guest rooms** reserved for the family — the same idea as room bookings, reused here. Each row: `id`, `hall_booking_id` (FK), `room_id` (FK), `guest_name`, `rate_per_night`. When `RoomsRequired` is true, the wizard creates these rows; the overlap check from Module 4 still applies so a room is not double-booked across an event and a stay.\n\nThe parent `hall_booking` row holds the headline facts; the join tables hold the lists. Both FKs use `ON DELETE CASCADE` (or a guard) so children do not orphan. Loading a booking reads the parent plus both child sets — three reads, or joins.\n\nThis design means the **same room availability logic** governs both room bookings and event-room blocks: a room reserved for a wedding is unavailable to walk-in stays for those nights, because both feed the same overlap query if you union the two room-booking sources.",
          whyItMatters:
            'Big functions genuinely use multiple halls and blocks of rooms, and join tables model that cleanly while keeping the parent row simple. Reusing the room-booking shape for event rooms means the Module 4 overlap check protects against double-booking a room across a stay and an event, which is essential when the same rooms serve both walk-in guests and wedding parties.',
          steps: [
            'Create `hall_booking_halls (id, hall_booking_id FK, hall_id FK)` with cascade.',
            'Create `hall_booking_rooms (id, hall_booking_id FK, room_id FK, guest_name, rate_per_night)`.',
            'When `RoomsRequired` is true, insert `hall_booking_rooms` rows in the wizard.',
            'Run the Module 4 overlap check so event rooms are not double-booked.',
            'Use `ON DELETE CASCADE` (or a guard) so children never orphan.',
            'Load a booking as parent + hall(s) + room(s).',
            'Union event-room reservations into the availability query so stays and events share rooms safely.',
          ],
          code: `-- Join tables for the multi-valued parts of an event booking.
CREATE TABLE hall_booking_halls (
    id              SERIAL PRIMARY KEY,
    hall_booking_id INT NOT NULL REFERENCES hall_bookings(id) ON DELETE CASCADE,
    hall_id         INT NOT NULL REFERENCES halls(id)
);

CREATE TABLE hall_booking_rooms (
    id              SERIAL PRIMARY KEY,
    hall_booking_id INT NOT NULL REFERENCES hall_bookings(id) ON DELETE CASCADE,
    room_id         INT NOT NULL REFERENCES rooms(id),
    guest_name      TEXT,
    rate_per_night  NUMERIC(10,2) NOT NULL
);

-- Availability must consider BOTH room bookings AND event room blocks:
-- a room is taken if it overlaps in booking_rooms OR hall_booking_rooms.
SELECT NOT EXISTS (
  SELECT 1 FROM hall_booking_rooms hbr
  JOIN hall_bookings hb ON hb.id = hbr.hall_booking_id
  WHERE hbr.room_id = @id
    AND hb.status <> 'cancelled'
    AND hb.event_date < @to AND COALESCE(hb.event_end_date, hb.event_date) >= @from
);`,
          pitfalls: [
            '**Hard-coding a single hall on the booking row.** Multi-hall functions cannot be modelled. Fix: a `hall_booking_halls` join table.',
            "**Ignoring event-room blocks in availability.** A room booked for a wedding looks free to walk-ins. Fix: union `hall_booking_rooms` into the overlap check.",
            '**No cascade on the FKs.** Deleting a booking orphans children. Fix: `ON DELETE CASCADE` or a guard.',
            '**Re-implementing room overlap differently for events.** Two code paths drift. Fix: reuse the Module 4 overlap rule.',
            '**Storing the hall list as a comma string.** Unqueryable. Fix: a join table with real FKs.',
            '**Forgetting `rate_per_night` snapshot on event rooms.** Later price change rewrites history. Fix: snapshot it like room bookings.',
          ],
          tryIt:
            'Create an event booking that uses two halls and reserves five rooms via the join tables. Then try to make a walk-in room booking that overlaps one of those five rooms\' dates and confirm the unified availability query reports it as taken.',
          takeaway:
            'hall_booking_halls and hall_booking_rooms model the multi-valued halls and guest rooms of an event, reusing the Module 4 overlap logic so event-room blocks and stays never double-book.',
        },
        {
          id: 'm5-t7',
          title: 'The Multi-Step Booking Wizard',
          explain:
            'Build the hall-booking wizard — couple details, then hall + package + AC, then rooms required, then advance payment — carrying state across steps.',
          analogy:
            'Booking a TunMani Resort wedding is not one giant form shoved at the family — the planner walks them through it **room by room**: first the couple\'s and contact details, then choosing the hall, food tier and whether AC is needed, then how many guest rooms, and finally the advance to lock the date. Each step is a page; the planner carries the half-filled form along. That is the multi-step wizard.',
          theory:
            "A wedding booking has too many fields for one screen, so it is a **wizard**: a sequence of focused steps, each a page that validates its own slice before moving on.\n\nThe steps map to `WorkflowStage`: **(1) couple-details** (bride/groom or event person, event type, date, guests), **(2) hall-package-ac** (pick hall, pick package tier, AC yes/no), **(3) rooms-required** (rooms yes/no, how many, which), **(4) advance-payment** (amount, mode, reference) — then save.\n\n**Carrying state** across steps has two common patterns. **Save-as-you-go:** create the `HallBooking` row at step 1 (status draft, `WorkflowStage = couple-details`) and `UPDATE` it after each step, advancing `WorkflowStage`. This persists progress so a half-finished booking survives a closed browser — and pairs with the smart-resume idea from Module 4. **Session-held:** keep a draft in TempData/session and insert once at the end; simpler but loses progress on disconnect.\n\nSave-as-you-go is the right choice here because weddings are high-value and staff get interrupted — the partially entered booking must not be lost. Each step's POST validates only its fields (`ModelState`), updates the row, advances `WorkflowStage`, and redirects to the next step (POST-Redirect-GET).\n\nThe wizard ends by computing the total (hall price + AC + rooms − discount + 18% GST) and recording the advance, leaving the booking `confirmed` and ready for the event workflow.",
          whyItMatters:
            'A single mega-form for a wedding overwhelms staff and loses data on a misclick, while a step wizard keeps each screen focused and validatable. Saving as you go and advancing WorkflowStage means an interrupted booking resumes exactly where it left off (the Module 4 resume pattern), which matters because high-value event bookings are entered amid constant front-desk interruptions.',
          steps: [
            'Map the four steps to `WorkflowStage`: couple-details, hall-package-ac, rooms-required, advance-payment.',
            'At step 1, insert a draft `HallBooking` row and set `WorkflowStage = \'couple-details\'`.',
            'Each step\'s POST validates only its fields with `ModelState`.',
            'On valid, `UPDATE` the row, advance `WorkflowStage`, and redirect to the next step.',
            'Persist progress (save-as-you-go) so a closed browser does not lose the booking.',
            'At the final step compute the total and record the advance.',
            'Provide a Resume entry that jumps to the current `WorkflowStage`.',
          ],
          code: `// Wizard step 2: choose hall + package + AC, then advance the stage.
[HttpPost]
public async Task<IActionResult> HallPackageAc(int id, HallStepVm vm)
{
    if (!ModelState.IsValid) return View(vm);

    await _svc.UpdateStepAsync(id, b =>
    {
        b.HallId        = vm.HallId;
        b.HallPackageId = vm.HallPackageId;
        b.AcRequired    = vm.AcRequired;
        b.AcCharge      = vm.AcRequired ? vm.AcCharge : 0m;
        b.WorkflowStage = "rooms-required";   // advance to next step
    });
    return RedirectToAction(nameof(RoomsRequired), new { id }); // POST-Redirect-GET
}

// Resume jumps to whichever step the booking sits at.
[HttpGet("/HallBooking/Resume/{id:int}")]
public async Task<IActionResult> Resume(int id)
{
    var b = await _svc.GetAsync(id);
    if (b is null) return NotFound();
    return b.WorkflowStage switch
    {
        "couple-details"  => RedirectToAction(nameof(CoupleDetails), new { id }),
        "hall-package-ac" => RedirectToAction(nameof(HallPackageAc), new { id }),
        "rooms-required"  => RedirectToAction(nameof(RoomsRequired), new { id }),
        "advance-payment" => RedirectToAction(nameof(AdvancePayment), new { id }),
        _                 => RedirectToAction(nameof(Summary), new { id }),
    };
}`,
          pitfalls: [
            '**One giant form for the whole wedding.** Overwhelming and error-prone. Fix: a focused step wizard.',
            "**Holding the whole draft only in session.** A disconnect loses everything. Fix: save-as-you-go to the row.",
            '**Validating all fields on every step.** Step 1 rejects empty step-4 fields. Fix: validate only the current step\'s slice.',
            '**Returning the view after a step POST.** Refresh resubmits. Fix: POST-Redirect-GET to the next step.',
            '**Not advancing `WorkflowStage`.** Resume cannot find the place. Fix: update the stage on each step.',
            '**Computing GST at the room 12%.** Event totals undercharge. Fix: 18% on the event components.',
          ],
          tryIt:
            'Build the four wizard steps, then start a booking, fill steps 1–2, and close the browser. Reopen via /HallBooking/Resume/{id} and confirm it lands on step 3 (rooms-required) with steps 1–2 preserved. Finish and confirm the total uses 18% GST.',
          takeaway:
            'The hall-booking wizard is a four-step, save-as-you-go flow that advances WorkflowStage each step so progress survives interruptions and Resume jumps back to the right page.',
        },
        {
          id: 'm5-t8',
          title: 'Pricing, Advance Payment and Identifiers',
          explain:
            'Compute the event total (hall + AC + rooms − discount + 18% GST), record the advance payment with mode and reference, and generate BookingRef and PublicToken.',
          analogy:
            'To lock the wedding date, the TunMani Resort family pays an **advance** — say ₹50,000 by UPI — and the planner notes the **mode and the UPI reference** on the form, hands them a **receipt number** to quote later, and a **QR link** to view the booking online. The rest is due before the event. The total is hall hire plus AC plus rooms, less any discount, plus 18% GST.',
          theory:
            "The **event total** sums the components in a fixed order: `hallPrice + acCharge + roomsCharge − discountAmount`, clamped at zero, then **18% GST** on the net. The `roomsCharge` is the sum of the event-room `rate_per_night × nights` from `hall_booking_rooms`. Keeping the order explicit (sum, then discount, then GST) makes the invoice reproducible and disputes resolvable.\n\nThe **advance payment** locks the date. You record `AdvanceAmount`, `AdvancePaymentMode` (cash / UPI / card), and `AdvanceReference` (the UPI txn id or card slip number). The **balance due** is `total − advance`, shown on the booking and collected at or before the event. Recording the mode and reference is essential for reconciliation — matching the advance against the bank/UPI statement.\n\n**Identifiers** reuse the Module 4 pattern exactly: `BookingRef` is the human-facing reference (`TMR-EVT-2026-0042` — note an event prefix to distinguish from room bookings), and `PublicToken` is a random `Guid.NewGuid()` powering the login-free `/e/{token}` link a couple can share with relatives. Never expose the row id or the sequential ref in the public link — the GUID's unguessability is the security.\n\nThe advance step writes these money and identifier fields and flips the booking to `confirmed`, ready for the event workflow (check-in on the event day, finalise after).",
          whyItMatters:
            'A wedding total spans several components and an 18% GST, so a fixed, explicit calculation order keeps high-value invoices exact and disputes resolvable. Recording the advance with its mode and reference makes bank/UPI reconciliation possible, and reusing the BookingRef/PublicToken split gives couples a safe shareable link without exposing other bookings to enumeration.',
          steps: [
            'Compute `net = hallPrice + acCharge + roomsCharge − discountAmount`, clamped at zero.',
            'Add 18% GST on the net to get the total.',
            'Compute `balanceDue = total − advanceAmount`.',
            'Record `AdvanceAmount`, `AdvancePaymentMode`, and `AdvanceReference`.',
            'Generate `BookingRef` as `TMR-EVT-{year}-{seq:D4}` via a counter/transaction.',
            'Generate `PublicToken` with `Guid.NewGuid()`; link publicly by token only.',
            'On completing the advance step, set status `confirmed`.',
          ],
          code: `// Event total + advance + identifiers.
public decimal ComputeEventTotal(HallBooking b, decimal roomsCharge)
{
    var net = b.HallPrice + b.AcCharge + roomsCharge - b.DiscountAmount;
    if (net < 0) net = 0;
    var gst = Math.Round(net * b.GstRate / 100m, 2);   // 18% for events
    return net + gst;
}

public decimal BalanceDue(HallBooking b, decimal total) =>
    total - b.AdvanceAmount;

public string MakeEventRef(int seq) =>
    $"TMR-EVT-{DateTime.Now.Year}-{seq:D4}";            // e.g. TMR-EVT-2026-0042

public Guid MakePublicToken() => Guid.NewGuid();

/* Advance step records mode + reference, then confirms the booking. */
// b.AdvanceAmount = vm.Amount;
// b.AdvancePaymentMode = vm.Mode;        // cash / upi / card
// b.AdvanceReference = vm.Reference;     // UPI txn id / card slip
// b.Status = "confirmed";
// Public link: GET /e/{public_token}  -- never /e/{id}`,
          pitfalls: [
            '**Applying GST before the discount inconsistently.** Totals vary run to run. Fix: fix one order — sum, discount, then GST.',
            "**Not recording the advance mode/reference.** Reconciliation is impossible. Fix: store mode and reference.",
            '**Using the row id in the public event link.** Enables enumeration. Fix: link by random `PublicToken` only.',
            '**Letting the net go negative on a big discount.** Nonsense invoice. Fix: clamp at zero.',
            '**Charging 12% GST on the event.** Under-taxes the function. Fix: 18% on event components.',
            '**Generating `BookingRef` with a plain read+increment.** Refs can collide. Fix: a counter/transaction.',
          ],
          tryIt:
            'Price a wedding: hall ₹150000, AC ₹20000, 10 rooms × ₹4000, discount ₹15000, then 18% GST. Record a ₹50000 UPI advance with a reference. Confirm the total and the balance due are correct and the booking gets a TMR-EVT ref and a GUID token; open /e/{token} to view it.',
          takeaway:
            'The event total is hall + AC + rooms − discount + 18% GST, the advance is recorded with mode and reference for reconciliation, and BookingRef/PublicToken reuse the Module 4 identifier split.',
        },
      ],
    },
    {
      id: 'm5-s3',
      title: 'Event Workflow, Audit & CRM sync',
      topics: [
        {
          id: 'm5-t9',
          title: 'Event Workflow Stages',
          explain:
            'Define the event lifecycle — confirmed → checked-in → finalised — with `CheckedInAt` and `FinalisedAt` timestamps and the actions that move it.',
          analogy:
            'A TunMani Resort wedding has its own three beats: the booking is **confirmed** (date locked, advance paid), then on the big day the event is **checked-in** (the function is happening, guests arriving), and afterwards it is **finalised** (event done, accounts settled, hall released). The planner stamps the clock at each beat. Unlike a room stay you cannot finalise an event that never happened.',
          theory:
            "The event lifecycle is a **state machine** with three meaningful states: `confirmed`, `checked-in`, `finalised` (plus `cancelled`). It parallels the room-booking lifecycle but uses event-appropriate names.\n\n- **confirmed:** the booking is locked with an advance; the date is held.\n- **checked-in:** the event day has arrived and the function is underway; `[id]/CheckIn` flips the status and stamps **`CheckedInAt`**.\n- **finalised:** the event is over, the balance settled, and the booking closed for normal editing; `[id]/Finalize` flips the status and stamps **`FinalisedAt`**.\n\nThe two **timestamps** are the audit of *when* each transition happened — useful for reporting (how many events this season) and for the change-log rule in the next topic. The transitions are **guarded** in the service: you can only check in a `confirmed` booking on or near its event date, and only finalise a `checked-in` one.\n\n`[id]/CheckIn` and `[id]/Finalize` are **POST actions** (they change state) on the hall-booking controller, each guarded by `[ValidateAntiForgeryToken]`. After finalise, ordinary edits are locked — any later change must go through the **audited change-log** path (next topic), because a finalised event is effectively a closed financial record.\n\nThis lifecycle gives the event its own clear progression and the timestamps needed to know — and later to audit — exactly when each stage occurred.",
          whyItMatters:
            'Events need their own lifecycle with day-of check-in and post-event finalisation, distinct from room stays, and enforcing the transitions stops nonsensical states like finalising an event that never checked in. The CheckedInAt/FinalisedAt timestamps drive reporting and, crucially, mark the point after which edits must be audited — turning a finalised event into a properly closed financial record.',
          steps: [
            'Define event states: `confirmed`, `checked-in`, `finalised`, `cancelled`.',
            'Add `[id]/CheckIn` POST that requires `confirmed` and stamps `CheckedInAt`.',
            'Add `[id]/Finalize` POST that requires `checked-in` and stamps `FinalisedAt`.',
            'Guard each transition in the service; reject illegal jumps.',
            'Protect both actions with `[ValidateAntiForgeryToken]`.',
            'Lock ordinary edits after finalise; route later changes through the change log.',
            'Badge bookings by stage and show the timestamps on the detail view.',
          ],
          code: `// Event workflow transitions with timestamps.
public static class EventStatus
{
    public const string Confirmed = "confirmed";
    public const string CheckedIn = "checked-in";
    public const string Finalised = "finalised";
    public const string Cancelled = "cancelled";
}

[HttpPost("/HallBooking/{id:int}/CheckIn")]
[ValidateAntiForgeryToken]
public async Task<IActionResult> CheckIn(int id)
{
    var b = await _svc.GetAsync(id);
    if (b is null) return NotFound();
    if (b.Status != EventStatus.Confirmed)
        return BadRequest($"Cannot check in a '{b.Status}' event.");
    await _svc.SetStageAsync(id, EventStatus.CheckedIn, checkedInAt: DateTime.UtcNow);
    return RedirectToAction("Details", new { id });
}

[HttpPost("/HallBooking/{id:int}/Finalize")]
[ValidateAntiForgeryToken]
public async Task<IActionResult> Finalize(int id)
{
    var b = await _svc.GetAsync(id);
    if (b is null) return NotFound();
    if (b.Status != EventStatus.CheckedIn)
        return BadRequest($"Cannot finalise a '{b.Status}' event.");
    await _svc.SetStageAsync(id, EventStatus.Finalised, finalisedAt: DateTime.UtcNow);
    return RedirectToAction("Details", new { id });
}`,
          pitfalls: [
            '**Finalising an event that never checked in.** The function may not have happened. Fix: require `checked-in` before finalise.',
            "**Allowing free edits after finalise.** A closed record gets silently changed. Fix: lock edits; route changes through the change log.",
            '**CheckIn/Finalize as GET links.** Crawlers can change state. Fix: POST actions with anti-forgery.',
            '**No `CheckedInAt`/`FinalisedAt` timestamps.** No audit of when. Fix: stamp each transition.',
            '**Reusing the exact room status names.** Confuses events with stays. Fix: event-appropriate names (`finalised`).',
            '**Letting a cancelled event transition further.** Terminal states are final. Fix: block transitions out of cancelled/finalised.',
          ],
          tryIt:
            'Try to finalise a freshly `confirmed` event and confirm it is rejected. Then check it in (stamping CheckedInAt), finalise it (stamping FinalisedAt), and confirm the detail view shows both timestamps and that the normal edit form is now locked.',
          takeaway:
            'Events progress confirmed → checked-in → finalised via guarded POST actions that stamp CheckedInAt and FinalisedAt, and finalising closes the booking to ordinary edits.',
        },
        {
          id: 'm5-t10',
          title: 'The HallBookingChangeLog Audit Trail',
          explain:
            'Record every post-finalise edit as a `HallBookingChangeLog` row (FieldName, OldValue, NewValue, ChangedBy, Reason, ChangedAt) so changes to a closed booking are traceable.',
          analogy:
            'Once a TunMani Resort wedding is finalised, its file is effectively **closed and signed**. If the manager later must change something — a corrected guest count, a fee adjustment — they cannot quietly erase the old figure; they must **pencil the change in the margin with their initials, the date, and the reason**. The `HallBookingChangeLog` is that margin: every post-finalise edit leaves a permanent, attributed note.',
          theory:
            "After an event is **finalised**, its booking is a closed financial record. Edits should be rare, deliberate, and **audited**. The `HallBookingChangeLog` table records each change as an immutable row: `Id`, `HallBookingId` (which booking), `FieldName` (what changed), `OldValue`, `NewValue`, `ChangedBy` (which staff user), `Reason` (why), and `ChangedAt` (when).\n\nThe flow: a guarded **edit-finalised** action takes the field, the new value, and a mandatory reason. Inside a transaction it (1) reads the current value, (2) writes the change-log row with old → new, and (3) applies the new value to the booking. Doing both in one transaction guarantees the log and the change never disagree.\n\nThis is an **append-only audit log**: rows are inserted, never updated or deleted. A booking accumulates a history you can replay — guest count changed from 300 to 350 by Anita on 12 June because the family added relatives. The `Reason` being **mandatory** is what makes the trail meaningful; a change with no reason is just as opaque as a silent edit.\n\n`ChangedBy` comes from the authenticated user (the Google-OAuth identity), tying each change to a real person — important for accountability on financial records. The booking detail view renders the change log as a timeline so anyone reviewing the booking sees its full amendment history.\n\nOrdinary (pre-finalise) edits during the wizard do **not** need logging; the audit trail is specifically for changes after the record is closed.",
          whyItMatters:
            'A finalised event is a financial record, and tax, disputes, and accountability demand that any later change be traceable to a person, a reason, and a time. An append-only change log with mandatory reasons turns silent edits into an auditable history, and writing the log and the change in one transaction guarantees they can never disagree — the difference between a trustworthy system and a fudgeable one.',
          steps: [
            'Create `hall_booking_change_log (id, hall_booking_id, field_name, old_value, new_value, changed_by, reason, changed_at)`.',
            'Add a guarded edit-finalised action taking field, new value, and a mandatory reason.',
            'In a transaction, read the old value, insert the log row, then apply the new value.',
            'Set `ChangedBy` from the authenticated (Google OAuth) user.',
            'Reject the edit if `Reason` is empty.',
            'Treat the log as append-only — never update or delete its rows.',
            'Render the change log as a timeline on the booking detail view.',
          ],
          code: `-- Append-only audit log for post-finalise edits.
CREATE TABLE hall_booking_change_log (
    id              SERIAL PRIMARY KEY,
    hall_booking_id INT NOT NULL REFERENCES hall_bookings(id),
    field_name      TEXT NOT NULL,
    old_value       TEXT,
    new_value       TEXT,
    changed_by      TEXT NOT NULL,   -- authenticated user (OAuth email)
    reason          TEXT NOT NULL,   -- mandatory: why the change
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

// Edit a finalised booking — log + apply atomically.
public async Task<(bool Ok, string? Error)> EditFinalisedAsync(
    int bookingId, string field, string newValue, string reason, string changedBy)
{
    if (string.IsNullOrWhiteSpace(reason))
        return (false, "A reason is required to edit a finalised booking.");

    using var c = new NpgsqlConnection(_cs);
    await c.OpenAsync();
    using var tx = await c.BeginTransactionAsync();

    var oldValue = await c.ExecuteScalarAsync<string?>(
        $"SELECT {SafeColumn(field)}::text FROM hall_bookings WHERE id=@bookingId",
        new { bookingId }, tx);

    await c.ExecuteAsync(@"
        INSERT INTO hall_booking_change_log
            (hall_booking_id, field_name, old_value, new_value, changed_by, reason)
        VALUES (@bookingId, @field, @oldValue, @newValue, @changedBy, @reason);",
        new { bookingId, field, oldValue, newValue, changedBy, reason }, tx);

    await c.ExecuteAsync(
        $"UPDATE hall_bookings SET {SafeColumn(field)} = @newValue WHERE id=@bookingId",
        new { newValue, bookingId }, tx);

    await tx.CommitAsync();
    return (true, null);
}`,
          pitfalls: [
            '**Allowing post-finalise edits with no log.** The financial record is silently altered. Fix: every such edit writes a change-log row.',
            "**Making `Reason` optional.** The trail becomes meaningless. Fix: reject empty reasons.",
            '**Updating or deleting log rows.** It is supposed to be immutable. Fix: append-only — insert only.',
            '**Logging and applying in separate transactions.** They can disagree. Fix: one transaction for both.',
            '**Interpolating `field` straight into SQL for the column name.** Injection risk. Fix: whitelist column names (`SafeColumn`).',
            '**Recording `ChangedBy` as "admin".** No real accountability. Fix: use the authenticated OAuth identity.',
          ],
          tryIt:
            'Finalise an event, then edit its expected guest count from 300 to 350 with reason "family added relatives". Confirm a change-log row records old 300, new 350, your user, the reason, and a timestamp, and that the booking now reads 350 — both written in one transaction.',
          takeaway:
            'Post-finalise edits go through an append-only HallBookingChangeLog (field, old, new, by, reason, when), written with the change in one transaction so a closed booking\'s history is always traceable.',
        },
        {
          id: 'm5-t11',
          title: 'Saving Bride/Groom Contacts to the CRM',
          explain:
            'On confirming an event, save the couple\'s WhatsApp contacts to the CRM via `SaveCoupleContacts` so the resort can follow up — the CRM detail comes in Module 8.',
          analogy:
            'Every wedding TunMani Resort hosts is a chance to win the **next** wedding — the cousins, the friends who attended. So the planner quietly **adds the bride\'s and groom\'s WhatsApp numbers to the resort\'s little black book of contacts** when the booking is confirmed. Later the marketing team wishes them an anniversary or offers a reunion package. `SaveCoupleContacts` drops those numbers into that book.',
          theory:
            "An event booking is also a **CRM opportunity**: the bride and groom (and the contact person) are high-value future leads. When a booking is confirmed, `SaveCoupleContacts` writes their names and **WhatsApp numbers** into the CRM contacts store so the resort can follow up — anniversary wishes, referral offers, reunion packages.\n\nThe method is a thin **sync**: it takes the booking's `BrideName`/`GroomName` (or `EventPersonName`) and their phone numbers and **upserts** them into the contacts table — insert if new, update if the number already exists — tagged with the source booking. Using an **upsert** (Postgres `INSERT ... ON CONFLICT ... DO UPDATE`) avoids duplicate contacts when the same family books again.\n\nThis topic deliberately keeps the CRM **shallow** — just the save hook — because the **full CRM (segments, campaigns, opt-out, message templates) is built in Module 8**. Here you only ensure the contact is captured at the moment of an event so no lead is lost; the richer CRM machinery consumes these contacts later.\n\nA practical note: storing a WhatsApp number means storing it in a **normalised, dialable form** (with country code) so later messaging just works, and respecting consent — you capture the contact but actual messaging/opt-out is governed by the CRM module. Call `SaveCoupleContacts` from the booking-confirm path (or the finalise step) so every event reliably feeds the CRM.",
          whyItMatters:
            'Weddings are the resort\'s best source of future weddings, and capturing the couple\'s WhatsApp contacts at confirmation ensures no high-value lead slips away. An upsert keeps the contact list clean across repeat bookings, and tagging the source booking lets the Module 8 CRM segment and follow up intelligently — all from a small hook wired into the confirm flow now.',
          steps: [
            'Add a `contacts` (CRM) table or reuse the customer store with a contacts view.',
            'Implement `SaveCoupleContacts(booking)` taking bride/groom names and WhatsApp numbers.',
            'Normalise numbers to a dialable form (with country code) before saving.',
            'Upsert with `INSERT ... ON CONFLICT (phone) DO UPDATE` to avoid duplicates.',
            'Tag each contact with the source booking (`source_booking_id`).',
            'Call `SaveCoupleContacts` from the confirm (or finalise) path so every event feeds the CRM.',
            'Leave segments, campaigns, and opt-out to Module 8 — capture only here.',
          ],
          code: `// SaveCoupleContacts — capture the couple as CRM leads (full CRM in M8).
public async Task SaveCoupleContactsAsync(HallBooking b)
{
    var contacts = new[]
    {
        new { Name = b.BrideName, Phone = Normalize(b.EventPersonPhone) },
        new { Name = b.GroomName, Phone = Normalize(b.EventPersonPhone) },
    }.Where(c => !string.IsNullOrWhiteSpace(c.Name)
              && !string.IsNullOrWhiteSpace(c.Phone));

    const string upsert = @"
        INSERT INTO crm_contacts (name, whatsapp, source_booking_id)
        VALUES (@Name, @Phone, @BookingId)
        ON CONFLICT (whatsapp)
        DO UPDATE SET name = EXCLUDED.name,
                      source_booking_id = EXCLUDED.source_booking_id;";

    using var c = new NpgsqlConnection(_cs);
    foreach (var ct in contacts)
        await c.ExecuteAsync(upsert,
            new { ct.Name, ct.Phone, BookingId = b.Id });
}

// Normalise to a dialable WhatsApp number (e.g. +91...). Full CRM is Module 8.
private static string Normalize(string? phone) =>
    "+91" + new string((phone ?? "").Where(char.IsDigit).ToArray()).TrimStart('0');`,
          pitfalls: [
            '**Inserting contacts without an upsert.** Repeat families create duplicates. Fix: `ON CONFLICT ... DO UPDATE`.',
            "**Storing raw, un-normalised numbers.** Later messaging fails. Fix: normalise with country code.",
            '**Building the whole CRM here.** Scope creep; M8 owns it. Fix: capture only the contact now.',
            '**Not tagging the source booking.** You lose lead provenance. Fix: store `source_booking_id`.',
            '**Saving contacts before confirm.** Half-finished bookings pollute the CRM. Fix: call on confirm/finalise.',
            '**Ignoring consent entirely.** Messaging needs opt-in. Fix: capture now; opt-out/consent handled in M8.',
          ],
          tryIt:
            'Confirm a wedding and call SaveCoupleContacts; confirm the bride and groom appear in crm_contacts with normalised WhatsApp numbers tagged to the booking. Book the same family for another event and confirm the contact is updated, not duplicated.',
          takeaway:
            'SaveCoupleContacts upserts the couple\'s normalised WhatsApp contacts into the CRM at confirm time — capturing the lead now, with the full CRM machinery deferred to Module 8.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm5-p1',
      type: 'Project',
      title: 'Hall + Packages CRUD',
      domain: 'Event venues / ASP.NET Core MVC',
      duration: '3 hours',
      description:
        'Build the venue catalogue for TunMani Resort: Hall CRUD (18% GST, IsActive), per-hall HallPackage budget tiers via /Hall/{id}/AddPackage with SortOrder, ResortPackage bundles, and a hall detail view plus catalogue that show active items to the wizard and everything to admin.',
      tools: ['ASP.NET Core 8 MVC', 'C#', 'PostgreSQL', 'Dapper', 'Npgsql'],
      blueprint: {
        overview:
          'Reuse the room CRUD pattern for halls (with 18% GST), add per-hall package tiers through a nested route, model resort-package bundles, and present a hall-detail view and catalogue split into an active subset (wizard) and a full list (admin).',
        functionalRequirements: [
          '**Hall CRUD.** Create/list/edit halls with HallName, Capacity, GstRate (default 18%), Description, IsActive.',
          '**Hall packages.** Per-hall Standard/Premium/Deluxe tiers (Name, Price, SortOrder, IsActive) via /Hall/{id}/AddPackage.',
          '**Resort bundles.** ResortPackage (Name, Duration, Rate, KeyInclusions, MaxRooms, IsActive) CRUD.',
          '**Hall detail.** Shows a hall with its active packages ordered by SortOrder and an Add Package button.',
          '**Catalogue.** Lists active halls and bundles for the wizard; admin shows inactive items with a badge.',
          '**Soft delete.** Halls, packages, and bundles deactivate via IsActive; nothing is hard-deleted.',
        ],
        technicalImplementation: [
          '**Entities.** Hall (GstRate 18), HallPackage (HallId FK, SortOrder), ResortPackage (MaxRooms).',
          '**Nested route.** `/Hall/{id}/AddPackage` binds HallId from the route so packages cannot orphan.',
          '**Ordering.** `ORDER BY sort_order` when listing a hall\'s packages.',
          '**View model.** `HallDetailVm { Hall, List<HallPackage> Packages }` loaded in the action, not the view.',
          '**Active filter.** Wizard queries `WHERE is_active`; admin lists all with a badge.',
          '**Dapper.** Parameterised SQL, INSERT ... RETURNING id, decimal money columns.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Hall entity + service',
            outcome: 'Hall CRUD works with 18% GST default.',
            prompt:
              'Create a Hall model (Id, HallName, Capacity, GstRate decimal default 18, Description, IsActive). Add IHallRepository + a Dapper HallRepository (GetAll, GetById, Create RETURNING id, Update, SetActive) and a HallService with ListAsync/GetAsync/SaveAsync (default GstRate 18 when <=0, validate name and capacity, branch on Id==0) and ToggleActiveAsync. Register both AddScoped.',
          },
          {
            step: 2,
            label: 'Hall controller + views',
            outcome: 'List and create/edit halls in the UI.',
            prompt:
              'Add a HallController (takes HallService). Build Index (halls table with status badge), Create GET/POST and Edit GET/POST using a shared _Form.cshtml with tag helpers, ModelState validation, POST-Redirect-GET, and a TempData flash. Add a [HttpPost] ToggleActive(id, active) with anti-forgery.',
          },
          {
            step: 3,
            label: 'HallPackage tiers',
            outcome: 'Per-hall packages added via the nested route.',
            prompt:
              'Create a HallPackage model (Id, HallId, Name, Price decimal, SortOrder, IsActive) and a hall_packages table (hall_id FK). Add GET/POST /Hall/{id}/AddPackage that sets HallId from the route, validates, inserts, and redirects to the hall detail. Add HallService.ActivePackagesAsync(hallId) ordered by sort_order and an AddPackageAsync.',
          },
          {
            step: 4,
            label: 'ResortPackage bundles',
            outcome: 'Room+hall bundles can be authored.',
            prompt:
              'Create a ResortPackage model (Id, Name, Duration, Rate decimal, KeyInclusions, MaxRooms, IsActive) and a resort_packages table. Add CRUD (controller + views + Dapper repository) so staff can author seasonal bundles, soft-deactivated via IsActive.',
          },
          {
            step: 5,
            label: 'Hall detail view',
            outcome: 'A hall shows with its sorted tiers.',
            prompt:
              'Add GET /Hall/Details/{id} loading a HallDetailVm { Hall, Packages } (packages = ActivePackagesAsync, ordered by sort_order). Build Details.cshtml showing the hall facts, GST, a table of package tiers with prices, and an Add Package button. Return NotFound() if the hall is missing.',
          },
          {
            step: 6,
            label: 'Catalogue (active vs admin)',
            outcome: 'Wizard sees active items; admin sees all.',
            prompt:
              'Add a catalogue page listing active halls and active resort bundles for the booking wizard, and an admin catalogue listing everything (including inactive) with an Inactive badge and reactivate buttons. Show each hall\'s starting price (its cheapest active package).',
          },
        ],
        deliverable:
          'A complete venue catalogue: Hall CRUD at 18% GST, per-hall package tiers via the nested AddPackage route, resort-package bundles, and a hall-detail plus catalogue that correctly split the active subset (wizard) from the full admin list.',
      },
    },
    {
      id: 'm5-p2',
      type: 'Project',
      title: 'Hall-Booking Wizard with Audit Change-Log',
      domain: 'Event venues / ASP.NET Core MVC + Web API',
      duration: '3 hours',
      description:
        'Build the multi-step hall-booking wizard (couple details, hall + package + AC, rooms-required, advance payment) saving a HallBooking with join tables, the confirmed → checked-in → finalised workflow with timestamps, the HallBookingChangeLog audit for post-finalise edits, and the SaveCoupleContacts CRM hook.',
      tools: ['ASP.NET Core 8 MVC', 'C#', 'PostgreSQL', 'Dapper', 'Npgsql'],
      blueprint: {
        overview:
          'Implement the save-as-you-go wedding wizard over a wide HallBooking entity with hall/room join tables, compute the 18% event total and advance, drive the event workflow with CheckIn/Finalize timestamps, audit post-finalise edits in an append-only change log, and capture couple contacts for the CRM.',
        functionalRequirements: [
          '**Wizard.** Four steps (couple-details, hall-package-ac, rooms-required, advance-payment) advancing WorkflowStage.',
          '**Entity + joins.** Wide HallBooking plus hall_booking_halls and hall_booking_rooms.',
          '**Pricing.** Total = hall + AC + rooms − discount + 18% GST; advance with mode + reference; balance due.',
          '**Identifiers.** BookingRef (TMR-EVT-...) and a GUID PublicToken; public view by token only.',
          '**Workflow.** confirmed → checked-in → finalised via guarded POST actions stamping CheckedInAt/FinalisedAt.',
          '**Audit + CRM.** Post-finalise edits write HallBookingChangeLog (field/old/new/by/reason/when); SaveCoupleContacts upserts CRM leads.',
        ],
        technicalImplementation: [
          '**Save-as-you-go.** Insert a draft at step 1, UPDATE + advance WorkflowStage each step, Resume jumps to the stage.',
          '**Join tables.** hall_booking_rooms reuses the Module 4 overlap rule so event rooms do not double-book.',
          '**Money.** decimal/NUMERIC throughout; clamp net at zero; 18% GST.',
          '**Workflow.** State-machine guards; [ValidateAntiForgeryToken] on CheckIn/Finalize; lock edits after finalise.',
          '**Change log.** Append-only table; log + apply in one transaction; mandatory reason; ChangedBy from OAuth user; whitelist column names.',
          '**CRM hook.** SaveCoupleContacts upserts (ON CONFLICT) normalised WhatsApp numbers tagged with source_booking_id.',
        ],
        prompts: [
          {
            step: 1,
            label: 'HallBooking entity + joins',
            outcome: 'The wide entity and join tables exist.',
            prompt:
              "Create a HallBooking model grouping identity (Id, BookingRef, CustomerId, PublicToken), event (HallId, HallPackageId, EventDate, EventEndDate, EventType, EventName, SlotType, TimeFrom, TimeTo, ExpectedGuests), people (BrideName, GroomName, EventPersonName/Dob/Phone), add-ons (AcRequired, AcCharge, RoomsRequired, NumberOfRooms), money (HallPrice, GstRate 18, DiscountAmount, AdvanceAmount, AdvancePaymentMode, AdvanceReference) and status (Status, WorkflowStage). Create hall_bookings, hall_booking_halls and hall_booking_rooms tables with cascading FKs.",
          },
          {
            step: 2,
            label: 'Wizard steps 1–2',
            outcome: 'Couple details and hall/package/AC save and advance.',
            prompt:
              'Build the wizard: step 1 (couple-details) inserts a draft HallBooking (WorkflowStage="couple-details"); step 2 (hall-package-ac) updates HallId/HallPackageId/AcRequired/AcCharge. Each POST validates only its slice with ModelState, UPDATEs the row, advances WorkflowStage, and POST-Redirect-GETs to the next step.',
          },
          {
            step: 3,
            label: 'Wizard steps 3–4 + pricing',
            outcome: 'Rooms and advance complete the booking.',
            prompt:
              'Add step 3 (rooms-required: RoomsRequired, NumberOfRooms, and create hall_booking_rooms rows with the Module 4 overlap check) and step 4 (advance-payment: AdvanceAmount, AdvancePaymentMode, AdvanceReference). Compute total = hallPrice + acCharge + roomsCharge − discount (clamped) + 18% GST, and balance due. Generate BookingRef "TMR-EVT-{year}-{seq:D4}" and a GUID PublicToken; set status confirmed.',
          },
          {
            step: 4,
            label: 'Resume + public view',
            outcome: 'Interrupted bookings resume; couples view by token.',
            prompt:
              'Add GET /HallBooking/Resume/{id} switching on WorkflowStage to the right step. Add a public GET /e/{token} that looks the booking up by public_token only (NotFound on unknown), showing the event summary without login. Confirm closing the browser mid-wizard and reopening Resume lands on the correct step with prior steps preserved.',
          },
          {
            step: 5,
            label: 'Workflow + audit log',
            outcome: 'CheckIn/Finalize work and post-finalise edits are audited.',
            prompt:
              "Add EventStatus constants and [HttpPost] /HallBooking/{id}/CheckIn (requires confirmed, stamps CheckedInAt) and /Finalize (requires checked-in, stamps FinalisedAt), both with anti-forgery; lock ordinary edits after finalise. Create hall_booking_change_log (hall_booking_id, field_name, old_value, new_value, changed_by, reason, changed_at) and an EditFinalisedAsync that, in one transaction, reads the old value, inserts a log row, and applies the new value — rejecting empty reasons, whitelisting column names, and setting changed_by from the authenticated user.",
          },
          {
            step: 6,
            label: 'CRM couple-contacts hook',
            outcome: 'Confirming an event captures the couple as CRM leads.',
            prompt:
              'Add SaveCoupleContactsAsync(HallBooking) that normalises the bride/groom WhatsApp numbers (country code) and upserts them into crm_contacts with ON CONFLICT (whatsapp) DO UPDATE, tagging source_booking_id. Call it from the confirm/finalise path. Note that full CRM (segments, campaigns, opt-out) is built in Module 8; here only capture the contact. Confirm a repeat family updates rather than duplicates the contact.',
          },
        ],
        deliverable:
          'A complete event-booking feature: the save-as-you-go wizard over a HallBooking with hall/room join tables, 18% pricing and advance, the confirmed→checked-in→finalised workflow with timestamps, an append-only change-log audit for post-finalise edits, and a CRM couple-contacts hook.',
      },
    },
  ],
  quiz: [
    {
      id: 'm5-q1',
      q: 'What GST rate applies to event/banquet-hall services, distinguishing them from room stays?',
      options: [
        '12%, the same as rooms',
        '18%, while room stays are 12%',
        '5% for all hospitality',
        '0%, events are exempt',
      ],
      answer: 1,
    },
    {
      id: 'm5-q2',
      q: 'What is the difference between a HallPackage and a ResortPackage?',
      options: [
        'They are identical.',
        'A HallPackage is a food/service budget tier for one hall; a ResortPackage is an all-in-one bundle combining a hall and a block of rooms.',
        'A HallPackage bundles rooms; a ResortPackage is a single hall.',
        'A ResortPackage is cheaper by definition.',
      ],
      answer: 1,
    },
    {
      id: 'm5-q3',
      q: 'Why does the hall-booking wizard save progress to the row after each step (save-as-you-go) and advance WorkflowStage?',
      options: [
        'To use more database storage.',
        'So an interrupted booking is not lost and Resume can jump back to the exact step the staff member left off at.',
        'Because sessions are not allowed.',
        'To skip validation.',
      ],
      answer: 1,
    },
    {
      id: 'm5-q4',
      q: 'In the event workflow, what is the correct order and what do the actions stamp?',
      options: [
        'finalised → checked-in → confirmed; no timestamps.',
        'confirmed → checked-in → finalised; CheckIn stamps CheckedInAt and Finalize stamps FinalisedAt.',
        'confirmed → finalised directly, skipping check-in.',
        'There is no defined order.',
      ],
      answer: 1,
    },
    {
      id: 'm5-q5',
      q: 'Why is the HallBookingChangeLog written in the same transaction as the edit it records?',
      options: [
        'To make the edit slower.',
        'So the audit log and the actual change can never disagree — both commit together or neither does.',
        'Because logs must be deleted afterward.',
        'It is not; they are written separately.',
      ],
      answer: 1,
    },
    {
      id: 'm5-q6',
      q: 'What does SaveCoupleContacts do, and where is the full CRM built?',
      options: [
        'It sends marketing messages immediately; the CRM is in this module.',
        'It upserts the couple\'s normalised WhatsApp contacts into the CRM as leads at confirm time, with the full CRM (segments, campaigns, opt-out) built in Module 8.',
        'It deletes the customer record after the event.',
        'It charges the advance payment.',
      ],
      answer: 1,
    },
  ],
};
