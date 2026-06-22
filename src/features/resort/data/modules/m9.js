// Module 9 — Razor UI, Reports, Admin & Deployment (Capstone)
// Build a Resort Management System — TunMani Resort (ASP.NET Core MVC + Web API,
// C#, PostgreSQL via Dapper) course content for the React course player.

export const m9 = {
  id: 'm9',
  title: 'Razor UI, Reports, Admin & Deployment',
  hours: 10,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'Build the front end with Razor views and Bootstrap, add a role-based dashboard and exportable reports, wire admin user management with an auditor role and staff leave, then ship the whole TunMani Resort app behind Nginx on PostgreSQL.',
  sections: [
    {
      id: 'm9-s1',
      title: 'Razor Views & Frontend',
      topics: [
        {
          id: 'm9-t1',
          title: 'The _Layout Master Page & Partial Views',
          explain:
            'Build the shared _Layout.cshtml shell plus _Sidebar and _Header partials so every page wears the same frame and you write each part once.',
          analogy:
            'Every room at TunMani Resort shares the same building: the same roof, the same reception, the same corridor — only the room inside changes. `_Layout.cshtml` is that building; each page is just the furniture of one room rendered in the middle. The reception desk (`_Header`) and the corridor signboard (`_Sidebar`) are fittings you install once and reuse on every floor.',
          theory:
            'In Razor, **`_Layout.cshtml`** is the master template. It holds the `<html>`, `<head>`, the CSS/JS includes, and a call to **`@RenderBody()`** where each page\'s content drops in. Pages declare their layout via `@{ Layout = "_Layout"; }` (often set globally in `_ViewStart.cshtml`).\n\n**Partial views** are reusable fragments — files like `_Header.cshtml` and `_Sidebar.cshtml`. You render them with the **`<partial name="_Sidebar" />`** tag helper (or `@await Html.PartialAsync("_Sidebar")`). They keep the layout tidy and let you change the nav in one place.\n\nThe layout also defines named **sections** with `@RenderSection("Scripts", required: false)`, so a page can inject its own scripts without bloating every page.\n\nFile convention: shared views live in **`Views/Shared/`**. Underscored names (`_Layout`, `_Sidebar`) signal "partial / not a standalone page". This structure is the skeleton the whole TunMani Resort UI hangs on.',
          whyItMatters:
            'A single master layout means the brand header, nav, and footer stay consistent across dozens of pages and change in one edit. Partials stop you from copy-pasting the sidebar into every view — the root cause of UIs that slowly drift out of sync.',
          steps: [
            'Create `Views/Shared/_Layout.cshtml` with `<head>`, a body shell, and `@RenderBody()`.',
            'Add `@RenderSection("Scripts", required: false)` before `</body>`.',
            'Create `Views/Shared/_Header.cshtml` and `_Sidebar.cshtml` partials.',
            'Render them in the layout with `<partial name="_Header" />` and `<partial name="_Sidebar" />`.',
            'Set `Layout = "_Layout";` in `Views/_ViewStart.cshtml` so all pages use it.',
            'In a page, push scripts via `@section Scripts { ... }`.',
          ],
          code: `@* Views/Shared/_Layout.cshtml *@
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>@ViewData["Title"] - TunMani Resort</title>
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="~/css/site.css" />
</head>
<body>
    <partial name="_Header" />
    <div class="d-flex">
        <partial name="_Sidebar" />
        <main class="flex-grow-1 p-3">
            @RenderBody()
        </main>
    </div>
    <script src="~/lib/jquery/dist/jquery.min.js"></script>
    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>

@* Views/_ViewStart.cshtml *@
@{ Layout = "_Layout"; }`,
          pitfalls: [
            '**Forgetting @RenderBody().** Pages render blank. Fix: include it once in the layout.',
            '**Copy-pasting the sidebar into each view.** Drifts over time. Fix: a `_Sidebar` partial.',
            '**Hard-coding the title per page.** Inconsistent tabs. Fix: `@ViewData["Title"]` in the layout.',
            '**Putting page scripts in the layout.** Loads on every page. Fix: `@RenderSection("Scripts")`.',
            '**Standalone-naming a partial.** Confuses intent. Fix: prefix partials with an underscore.',
            '**Not setting Layout in _ViewStart.** Every page must set it manually. Fix: set it once globally.',
          ],
          tryIt:
            'Create `_Layout`, `_Header`, and `_Sidebar`, and set the layout in `_ViewStart`. Render two different pages and confirm both show the same header and sidebar with only the body changing. Add a `@section Scripts` to one page and verify its script loads only on that page, not the other.',
          takeaway:
            'A single _Layout with _Header/_Sidebar partials and a Scripts section gives every page one consistent frame edited in one place.',
        },
        {
          id: 'm9-t2',
          title: 'Razor Syntax: @model, @foreach & Tag Helpers',
          explain:
            'Render real data into HTML with a strongly-typed @model, loop with @foreach, and build forms and links with tag helpers instead of raw HTML.',
          analogy:
            'A Razor view is like the TunMani Resort steward reading the day\'s booking register aloud: `@model` is the register he is holding, `@foreach` is him going line by line, and tag helpers are the printed forms he fills in — neat boxes that already know which booking they belong to, instead of him scribbling raw HTML by hand.',
          theory:
            'A view becomes **strongly typed** with **`@model BookingListVm`** at the top. Then `@Model` gives you that object with full IntelliSense, e.g. `@Model.Total`.\n\n**`@foreach`** loops over collections: `@foreach (var b in Model.Bookings) { <tr>...<td>@b.GuestName</td>... </tr> }`. Inline expressions use `@expression`; code blocks use `@{ ... }`.\n\n**Tag helpers** are server-aware HTML attributes that generate correct markup:\n- `asp-for="GuestName"` binds an input to a model property (and emits validation attributes).\n- `asp-controller`/`asp-action`/`asp-route-id` build URLs from your routes, so links never break when routes change.\n- `asp-validation-for` shows the field\'s validation message.\n\nEnable them once in **`_ViewImports.cshtml`** with `@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers`. Tag helpers keep views readable and safe — they HTML-encode by default, guarding against XSS.\n\nKeep view models (`*Vm`) purpose-built for the page rather than passing entities straight through, so the view shows exactly what it needs.',
          whyItMatters:
            'Strongly-typed models catch field typos at compile time, and tag helpers build URLs and forms from your routes so links survive refactors. Together they make views that are both safe (auto-encoded) and maintainable.',
          steps: [
            'Add `@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers` to `Views/_ViewImports.cshtml`.',
            'Top a view with `@model BookingListVm`.',
            'Loop bookings with `@foreach (var b in Model.Bookings)`.',
            'Output values with `@b.GuestName`, `@b.CheckIn.ToString("dd MMM")`.',
            'Build a link with `<a asp-action="Detail" asp-route-id="@b.Id">View</a>`.',
            'Build a form input with `<input asp-for="GuestName" class="form-control" />`.',
          ],
          code: `@* Views/Bookings/Index.cshtml *@
@model BookingListVm
@{ ViewData["Title"] = "Bookings"; }

<h1>Bookings (@Model.Total)</h1>

<table class="table">
    <thead>
        <tr><th>Guest</th><th>Check-in</th><th>Room</th><th></th></tr>
    </thead>
    <tbody>
        @foreach (var b in Model.Bookings)
        {
            <tr>
                <td>@b.GuestName</td>
                <td>@b.CheckIn.ToString("dd MMM yyyy")</td>
                <td>@b.RoomType</td>
                <td>
                    <a asp-controller="Bookings" asp-action="Detail"
                       asp-route-id="@b.Id" class="btn btn-sm btn-outline-primary">
                        View
                    </a>
                </td>
            </tr>
        }
    </tbody>
</table>`,
          pitfalls: [
            '**Untyped views with ViewBag.** No IntelliSense, runtime errors. Fix: `@model` a view model.',
            '**Hand-writing URLs.** They break when routes change. Fix: `asp-action`/`asp-route-*` tag helpers.',
            '**Using Html.Raw on user input.** XSS risk. Fix: let Razor auto-encode; avoid Raw.',
            '**Passing entities straight to views.** Leaks fields, over-fetches. Fix: purpose-built `*Vm` models.',
            '**Forgetting _ViewImports tag helper line.** Tag helpers render as plain text. Fix: add `@addTagHelper`.',
            '**Heavy logic in the view.** Hard to test. Fix: compute in the controller/service, display in the view.',
          ],
          tryIt:
            'Create a strongly-typed `Index.cshtml` for bookings with `@model`, a `@foreach` table, and a tag-helper "View" link per row. Run it and confirm the rows render and the View link navigates correctly. Change the Detail route and verify the link still works because the tag helper rebuilt the URL.',
          takeaway:
            'Use @model for type safety, @foreach to render collections, and tag helpers for forms and route-aware links.',
        },
        {
          id: 'm9-t3',
          title: 'Bootstrap 5 & the TunMani Brand Colours',
          explain:
            'Style the UI with Bootstrap 5 components and a small custom stylesheet that applies the resort brand colours, #003555 and #006496.',
          analogy:
            'Bootstrap is the ready-made furniture catalogue — cards, tables, buttons, the grid — that lets TunMani Resort furnish every page quickly without carpentering each piece. The brand colours #003555 (deep sea-blue) and #006496 (lagoon blue) are the resort\'s own paint: a thin coat of custom CSS over the standard furniture so the whole place feels like TunMani and not a generic template.',
          theory:
            '**Bootstrap 5** gives you a responsive **grid** (`.container`, `.row`, `.col`), and components like `.card`, `.table`, `.btn`, `.navbar`, `.badge`, and `.modal`. You include its CSS/JS in the layout (no jQuery dependency for Bootstrap 5 itself, though you may still use jQuery for your own scripts).\n\nTo brand it, add a small **`site.css`** that overrides colours with **CSS variables** and targeted rules. Define the palette once: `--brand-dark: #003555;` and `--brand: #006496;`. Apply them to the navbar, primary buttons, and headings. Overriding `--bs-primary` is also possible, but a couple of focused rules are simpler and clearer.\n\nUse Bootstrap **utility classes** (`p-3`, `mb-2`, `text-white`, `d-flex`) for spacing and layout so you write almost no custom CSS. Reserve custom CSS for brand colour and a few resort-specific tweaks.\n\nKeep `site.css` loaded **after** Bootstrap in the layout so your overrides win the cascade.',
          whyItMatters:
            'Bootstrap gets a clean, responsive UI built in days, not weeks, while a thin brand layer makes it unmistakably TunMani Resort. Defining colours as variables means a rebrand is a two-line change, not a hunt across hundreds of files.',
          steps: [
            'Include Bootstrap 5 CSS/JS in `_Layout.cshtml` (CDN or `wwwroot/lib`).',
            'Create `wwwroot/css/site.css` and load it after Bootstrap.',
            'Define `--brand-dark: #003555;` and `--brand: #006496;` in `:root`.',
            'Apply the brand colour to the navbar and primary buttons.',
            'Use Bootstrap utility classes for spacing and layout in views.',
            'Build a card-based dashboard tile and a `.table` to verify the look.',
          ],
          code: `/* wwwroot/css/site.css — loaded AFTER bootstrap so overrides win. */
:root {
    --brand-dark: #003555; /* deep sea-blue */
    --brand:      #006496; /* lagoon blue   */
}

.navbar-brandbar {
    background-color: var(--brand-dark);
}

.btn-brand {
    background-color: var(--brand);
    border-color: var(--brand);
    color: #fff;
}
.btn-brand:hover { background-color: var(--brand-dark); color: #fff; }

h1, h2 { color: var(--brand-dark); }

/* In a view, mix Bootstrap utilities with the brand: */
@* <div class="card shadow-sm p-3 mb-3">
     <h2 class="h5">Today's Check-ins</h2>
     <p class="display-6">12</p>
     <a class="btn btn-brand" asp-action="Index">View all</a>
   </div> *@`,
          pitfalls: [
            '**Loading site.css before Bootstrap.** Your overrides lose the cascade. Fix: load it after.',
            '**Hard-coding hex colours everywhere.** A rebrand becomes a nightmare. Fix: CSS variables.',
            '**Writing custom CSS for spacing.** Reinvents Bootstrap. Fix: use utility classes (`p-3`, `mb-2`).',
            '**Ignoring the responsive grid.** The UI breaks on phones. Fix: use `.row`/`.col` and test narrow.',
            '**Mismatching Bootstrap JS version with CSS.** Components misbehave. Fix: same version for both.',
            '**Over-customising and fighting Bootstrap.** Brittle CSS. Fix: lean on components, brand lightly.',
          ],
          tryIt:
            'Add `site.css` with the brand variables and a `.btn-brand` class, loaded after Bootstrap. Build a dashboard with three Bootstrap cards and a branded button. Resize the window to a phone width and confirm the cards stack responsively. Change `--brand` to a different blue and watch the buttons and headings update everywhere.',
          takeaway:
            'Build the UI with Bootstrap 5 components and utilities, then brand it lightly with #003555/#006496 via CSS variables loaded after Bootstrap.',
        },
        {
          id: 'm9-t4',
          title: 'Flatpickr Date Pickers with Check-in < Check-out',
          explain:
            'Add jQuery and Flatpickr date pickers to booking forms and validate that check-in is strictly before check-out, both client and server side.',
          analogy:
            'You cannot check into a TunMani Resort room before you have left it — a stay that ends before it begins makes no sense. Flatpickr is the friendly desk calendar the guest taps to pick arrival and departure, and the rule "check-in before check-out" is the receptionist gently refusing an impossible booking before it ever reaches the register.',
          theory:
            '**Flatpickr** is a lightweight JS date-picker. Include its CSS/JS, then initialise inputs: `flatpickr("#checkIn", { dateFormat: "Y-m-d" })`. You typically run this from a small script in `@section Scripts`, using **jQuery** to wire events.\n\nThe key business rule: **check-in must be strictly before check-out**. Enforce it in two places:\n- **Client side** with Flatpickr: when check-in changes, set the check-out picker\'s `minDate` to the day after check-in (`onChange`), so an invalid range cannot even be picked.\n- **Server side** in the model: a validation attribute or an `IValidatableObject` check that rejects `CheckOut <= CheckIn`, because client validation can be bypassed.\n\nNever trust the client alone — client validation is for UX, server validation is for correctness. The server is the final gatekeeper before the booking hits PostgreSQL.\n\nThis is **progressive enhancement**: the form works as plain date inputs even if JS fails, and Flatpickr layers a nicer experience on top.',
          whyItMatters:
            'Impossible date ranges are a top source of garbage bookings and downstream billing errors. Catching them with a delightful picker and a server guard protects both the guest experience and your data integrity.',
          steps: [
            'Include Flatpickr CSS/JS and ensure jQuery is loaded in the layout.',
            'In `@section Scripts`, initialise `flatpickr` on the check-in and check-out inputs.',
            'On check-in change, set the check-out picker\'s `minDate` to check-in + 1 day.',
            'Add server-side validation: reject `CheckOut <= CheckIn`.',
            'Show the validation message with `asp-validation-for`.',
            'Test with JS disabled to confirm the server still rejects bad ranges.',
          ],
          code: `@* In the booking form view *@
<input asp-for="CheckIn" id="checkIn" class="form-control" />
<input asp-for="CheckOut" id="checkOut" class="form-control" />
<span asp-validation-for="CheckOut" class="text-danger"></span>

@section Scripts {
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script>
  const out = flatpickr("#checkOut", { dateFormat: "Y-m-d" });
  flatpickr("#checkIn", {
    dateFormat: "Y-m-d",
    onChange: function (dates) {
      // Check-out must be at least the day after check-in.
      const next = new Date(dates[0]);
      next.setDate(next.getDate() + 1);
      out.set("minDate", next);
    }
  });
</script>
}

// Server-side guard (the real gatekeeper):
public class BookingVm : IValidatableObject
{
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext ctx)
    {
        if (CheckOut <= CheckIn)
            yield return new ValidationResult(
                "Check-out must be after check-in.",
                new[] { nameof(CheckOut) });
    }
}`,
          pitfalls: [
            '**Validating only on the client.** Users bypass JS. Fix: always validate on the server too.',
            '**Allowing check-out equal to check-in.** A zero-night stay. Fix: require strictly greater.',
            '**Mismatched date formats client vs server.** Parsing fails. Fix: a consistent format (`Y-m-d`).',
            '**Not setting minDate dynamically.** Users pick impossible ranges. Fix: update on check-in change.',
            '**Flatpickr loaded before jQuery it depends on.** Script errors. Fix: order includes correctly.',
            '**No visible validation message.** Users do not know why it failed. Fix: `asp-validation-for`.',
          ],
          tryIt:
            'Wire Flatpickr on a booking form and the dynamic `minDate` rule, plus the `IValidatableObject` server check. Pick a check-out before check-in in the UI — the picker should not allow it. Then disable JavaScript, submit a bad range directly, and confirm the server rejects it with the validation message.',
          takeaway:
            'Enhance date fields with Flatpickr and a dynamic minDate, but always enforce check-in < check-out on the server as the real gatekeeper.',
        },
        {
          id: 'm9-t5',
          title: 'Progressive Enhancement: Fetch, Autocomplete & Modals',
          explain:
            'Layer JavaScript on top of working pages: fetch JSON from your API for guest autocomplete and a Record-Payment modal, without breaking the no-JS baseline.',
          analogy:
            'The TunMani Resort register works fine with pen and paper — that is the baseline page. But a quick clerk speeds things up: as you type a guest name he already pulls the matching card (autocomplete), and he records a payment on a little slip without leaving the counter (a modal). Those conveniences sit on top of the working register; if the clerk is off, the register still works.',
          theory:
            '**Progressive enhancement** means the page works with plain HTML/forms first, and JavaScript adds speed and polish on top. You already built Web API endpoints (Module on APIs) returning **JSON** — now the Razor pages consume them with the browser **`fetch`** API.\n\n**Autocomplete:** as the user types a guest name, debounce keystrokes, `fetch("/api/guests/search?q=" + term)`, and render the JSON results into a dropdown. Selecting one fills the hidden guest id.\n\n**Modals:** Bootstrap\'s `.modal` shows a "Record Payment" form without a page reload. On submit, `fetch("/api/payments", { method: "POST", body: JSON.stringify(...) })`, then update the page (e.g. refresh the balance) from the JSON response. Send the **anti-forgery token** with POSTs.\n\nKeep these scripts small and in `@section Scripts`. Crucially, the underlying full-page form (e.g. a payments page) should still work if JS is disabled — the modal is an enhancement, not the only path. This keeps the app robust and accessible.',
          whyItMatters:
            'Autocomplete and modals make the front desk fast during a busy festival check-in, while the no-JS baseline keeps the app usable on weak connections or old browsers. Reusing your JSON API for the UI means one source of truth for data.',
          steps: [
            'Expose JSON endpoints, e.g. `GET /api/guests/search?q=` and `POST /api/payments`.',
            'Add a debounced keyup handler that `fetch`es guest matches and renders a dropdown.',
            'On selection, set a hidden guest-id input.',
            'Build a Bootstrap "Record Payment" modal with a form.',
            'On modal submit, `fetch` POST the payment with the anti-forgery token and update the balance.',
            'Ensure a full-page fallback works with JS disabled.',
          ],
          code: `<!-- Guest autocomplete input -->
<input id="guestSearch" class="form-control" placeholder="Search guest..." />
<input type="hidden" id="guestId" name="GuestId" />
<ul id="guestResults" class="list-group"></ul>

@section Scripts {
<script>
let timer;
document.getElementById('guestSearch').addEventListener('input', function (e) {
  clearTimeout(timer);
  const q = e.target.value;
  timer = setTimeout(async () => {
    const res = await fetch('/api/guests/search?q=' + encodeURIComponent(q));
    const guests = await res.json();
    const ul = document.getElementById('guestResults');
    ul.innerHTML = guests.map(g =>
      \`<li class="list-group-item" data-id="\${g.id}">\${g.name} - \${g.phone}</li>\`
    ).join('');
  }, 250); // debounce
});

// Pick a result -> fill the hidden id.
document.getElementById('guestResults').addEventListener('click', e => {
  if (e.target.dataset.id) {
    document.getElementById('guestId').value = e.target.dataset.id;
    document.getElementById('guestSearch').value = e.target.textContent;
    document.getElementById('guestResults').innerHTML = '';
  }
});

// Record Payment modal submit.
async function recordPayment(bookingId, amount, token) {
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'RequestVerificationToken': token },
    body: JSON.stringify({ bookingId, amount })
  });
  const data = await res.json();
  document.getElementById('balance').textContent = data.newBalance;
}
</script>
}`,
          pitfalls: [
            '**No debounce on autocomplete.** A request per keystroke hammers the server. Fix: debounce ~250ms.',
            '**Building the UI as JS-only.** Breaks without JS. Fix: keep a working full-page fallback.',
            '**Skipping the anti-forgery token on POST.** Requests rejected or insecure. Fix: send the token.',
            '**Not encoding the query.** Breaks on special characters. Fix: `encodeURIComponent`.',
            '**Injecting API JSON as raw HTML unescaped.** XSS risk. Fix: build text safely / escape.',
            '**Ignoring fetch errors.** Silent failures. Fix: check `res.ok` and show a message.',
          ],
          tryIt:
            'Add guest autocomplete backed by your `/api/guests/search` endpoint and a Record-Payment modal that POSTs to `/api/payments` and updates the displayed balance. Type a partial name and confirm matches appear after a brief pause. Submit a payment via the modal and watch the balance update without a reload. Then disable JS and confirm the full-page payment form still works.',
          takeaway:
            'Enhance working pages with fetch-driven autocomplete and modals, send the anti-forgery token, and always keep a no-JS fallback.',
        },
      ],
    },
    {
      id: 'm9-s2',
      title: 'Dashboard & Reports',
      topics: [
        {
          id: 'm9-t6',
          title: 'The Role-Based Dashboard with DashboardService',
          explain:
            'Build a HomeController dashboard that shows summary stats, upcoming events, pending payments, and this-week check-ins, tailored to the user\'s role.',
          analogy:
            'When the TunMani Resort manager walks in each morning, he wants one board that tells him everything: how many rooms are full, which weddings are coming, who still owes money, and who arrives this week. But the front-desk clerk and the manager should not see the same board — the clerk sees check-ins, the manager sees revenue. The dashboard is that morning board, and it shows each person what their role needs.',
          theory:
            'A **`DashboardService`** gathers the day\'s key numbers with focused Dapper queries: occupancy/summary stats, **upcoming events** (weddings in the next days), **pending payments** (bookings with a balance due), and **this-week check-ins**. Each is a small method returning a view-model slice.\n\nThe **`HomeController`** Index action builds a `DashboardVm` from the service and renders it. The page is **role-based**: read the current user\'s role (from claims, `User.IsInRole("Manager")`) and show or hide cards accordingly — e.g. revenue tiles for managers, check-in lists for staff.\n\nThe heavy numbers can also be exposed as JSON via **`/api/dashboard/*`** endpoints so the page can refresh tiles with `fetch` without a full reload (progressive enhancement from the last section). The controller renders the first paint server-side; JS keeps it live.\n\nKeep queries efficient — aggregate in SQL (`COUNT`, `SUM`, `GROUP BY`) rather than pulling rows into C# and counting. The dashboard runs on every login, so it must be fast.',
          whyItMatters:
            'A good dashboard is the app\'s front door — it is what staff see first and judge the whole system by. Role tailoring keeps it relevant (and prevents staff seeing revenue they should not), and SQL-side aggregation keeps it instant even as data grows.',
          steps: [
            'Create `Services/DashboardService.cs` with methods for stats, upcoming events, pending payments, week check-ins.',
            'Aggregate in SQL with `COUNT`/`SUM`/`GROUP BY`, not in C#.',
            'Build a `DashboardVm` and populate it in `HomeController.Index`.',
            'Read the user role and show/hide cards with `User.IsInRole(...)`.',
            'Expose `/api/dashboard/summary` etc. as JSON for live tiles.',
            'Render the first view server-side; refresh tiles with `fetch`.',
          ],
          code: `public class DashboardService
{
    private readonly string _conn;
    public DashboardService(IConfiguration cfg) =>
        _conn = cfg.GetConnectionString("Default")!;

    public async Task<DashboardVm> BuildAsync()
    {
        await using var db = new NpgsqlConnection(_conn);

        var stats = await db.QuerySingleAsync<SummaryVm>(@"
            SELECT
              (SELECT COUNT(*) FROM bookings WHERE status = 'active') AS active_bookings,
              (SELECT COALESCE(SUM(balance_due),0) FROM invoices)     AS total_due,
              (SELECT COUNT(*) FROM rooms WHERE is_occupied)          AS rooms_occupied;");

        var checkIns = await db.QueryAsync<CheckInVm>(@"
            SELECT guest_name, room_type, check_in
            FROM bookings
            WHERE check_in BETWEEN current_date AND current_date + INTERVAL '7 days'
            ORDER BY check_in;");

        var pending = await db.QueryAsync<PendingVm>(@"
            SELECT guest_name, balance_due
            FROM invoices WHERE balance_due > 0
            ORDER BY balance_due DESC LIMIT 10;");

        return new DashboardVm
        {
            Summary = stats,
            WeekCheckIns = checkIns.ToList(),
            PendingPayments = pending.ToList()
        };
    }
}

// HomeController — role-aware render.
public async Task<IActionResult> Index()
{
    var vm = await _dashboard.BuildAsync();
    vm.ShowRevenue = User.IsInRole("Manager") || User.IsInRole("Admin");
    return View(vm);
}`,
          pitfalls: [
            '**Pulling all rows and counting in C#.** Slow as data grows. Fix: aggregate in SQL.',
            '**Showing revenue to every role.** Leaks sensitive figures. Fix: gate tiles by role.',
            '**One giant query for everything.** Hard to maintain. Fix: small focused methods.',
            '**Recomputing the dashboard on every fetch tile and full load.** Wasteful. Fix: cache briefly if needed.',
            '**N+1 queries per card.** Many round-trips. Fix: batch or use combined queries.',
            '**No empty states.** A blank dashboard looks broken. Fix: friendly "nothing today" messages.',
          ],
          tryIt:
            'Build `DashboardService.BuildAsync` with the three queries and a role-aware `HomeController.Index`. Log in as a manager and confirm revenue tiles appear; log in as staff and confirm they are hidden but check-ins still show. Add a booking checking in tomorrow and verify it appears in the week check-ins list.',
          takeaway:
            'Build the dashboard from a DashboardService that aggregates in SQL, render it role-aware in HomeController, and expose JSON for live tiles.',
        },
        {
          id: 'm9-t7',
          title: 'ReportService: Occupancy & Revenue Reports',
          explain:
            'Build a ReportController and ReportService that produce an occupancy report and a revenue report filtered by a date range.',
          analogy:
            'At month-end the TunMani Resort owner asks two questions: "How full were we?" and "How much did we make?" The occupancy report answers the first — rooms booked versus available across the chosen dates. The revenue report answers the second — money taken in that window. The `ReportService` is the accountant who pulls the ledgers for whatever dates the owner names.',
          theory:
            'A **`ReportService`** turns date-range parameters into aggregated result sets with Dapper. Two core reports:\n- **Occupancy:** for a date range, how many room-nights were sold versus available, often as an occupancy percentage per day or per room type. Driven by booking dates intersecting the range.\n- **Revenue:** total invoiced/collected within the range, optionally grouped by day, room type, or weddings vs rooms, using `SUM(...) GROUP BY`.\n\nThe **`ReportController`** takes `from` and `to` query parameters (defaulting to, say, this month), validates `from <= to`, calls the service, and renders a view (a table plus maybe a chart). Always **parameterise** the dates in SQL — never string-concatenate, to avoid SQL injection.\n\nUse PostgreSQL date functions for grouping: `date_trunc(\'day\', created_at)`, `generate_series` to fill empty days so a quiet day shows as zero rather than vanishing.\n\nReturn purpose-built report view models so the same data can feed both an HTML table and an export (next topic).',
          whyItMatters:
            'Occupancy and revenue are the two numbers that decide pricing, staffing, and whether the resort is healthy. Reliable, date-filtered reports turn raw bookings into the decisions an owner actually makes each month.',
          steps: [
            'Create `Services/ReportService.cs` with `OccupancyAsync(from, to)` and `RevenueAsync(from, to)`.',
            'Aggregate with `SUM`/`COUNT`/`GROUP BY date_trunc(\'day\', ...)`.',
            'Parameterise `from`/`to`; never concatenate dates into SQL.',
            'Build `ReportController` actions reading `from`/`to` query params.',
            'Validate `from <= to`; default to the current month.',
            'Render a table view bound to a report view model.',
          ],
          code: `public class ReportService
{
    private readonly string _conn;
    public ReportService(IConfiguration cfg) =>
        _conn = cfg.GetConnectionString("Default")!;

    // Revenue per day within the range; quiet days show as 0.
    public async Task<List<RevenueRow>> RevenueAsync(DateTime from, DateTime to)
    {
        const string sql = @"
            SELECT d::date AS day,
                   COALESCE(SUM(i.total), 0) AS revenue
            FROM generate_series(@From, @To, INTERVAL '1 day') AS d
            LEFT JOIN invoices i
                   ON date_trunc('day', i.created_at) = d
            GROUP BY d
            ORDER BY d;";

        await using var db = new NpgsqlConnection(_conn);
        return (await db.QueryAsync<RevenueRow>(sql, new { From = from, To = to })).ToList();
    }
}

// ReportController — validated date-range action.
[Route("reports")]
public class ReportController : Controller
{
    private readonly ReportService _reports;
    public ReportController(ReportService reports) => _reports = reports;

    [HttpGet("revenue")]
    public async Task<IActionResult> Revenue(DateTime? from, DateTime? to)
    {
        var start = from ?? new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        var end   = to   ?? DateTime.Today;
        if (end < start) (start, end) = (end, start); // swap if reversed
        var rows = await _reports.RevenueAsync(start, end);
        return View(new RevenueReportVm { From = start, To = end, Rows = rows });
    }
}`,
          pitfalls: [
            '**Concatenating dates into SQL.** Injection risk and parse errors. Fix: parameterise.',
            '**Quiet days disappearing from the report.** Gaps confuse owners. Fix: `generate_series` to fill zeros.',
            '**No validation of from/to.** Reversed ranges return nothing. Fix: swap or reject.',
            '**Counting in C# after fetching rows.** Slow. Fix: aggregate in SQL.',
            '**Mixing collected vs invoiced revenue silently.** Misleading totals. Fix: be explicit about which.',
            '**Timezone drift in date_trunc.** Days bleed into each other. Fix: be consistent about UTC/local.',
          ],
          tryIt:
            'Build `RevenueAsync` and the `ReportController.Revenue` action. Open `/reports/revenue?from=2026-06-01&to=2026-06-30` and confirm one row per day, with quiet days showing 0. Reverse the dates in the URL and verify the controller swaps them instead of returning empty. Cross-check a day\'s total against the invoices for that day.',
          takeaway:
            'A ReportService aggregates occupancy and revenue over a parameterised date range, with generate_series filling empty days, rendered by a validated ReportController.',
        },
        {
          id: 'm9-t8',
          title: 'Event Schedule, Pending Payments & CSV/PDF Export',
          explain:
            'Add the event-schedule and pending-payments reports, then let users export any report as CSV (for Excel) or PDF (via QuestPDF).',
          analogy:
            'The TunMani Resort owner does not just want to read the reports on screen — he wants to email the wedding schedule to the caterer and hand the pending-payments list to the accountant. CSV is the spreadsheet copy the accountant loves; PDF is the printed sheet for the file. Export is the photocopier at the end of every report.',
          theory:
            'Two more reports round out the set:\n- **Event schedule:** upcoming weddings/events in a range, with hall, date, guest count, and contact — what the operations team plans around.\n- **Pending payments:** bookings/invoices with `balance_due > 0`, sorted by amount or due date — the collection list.\n\n**CSV export** is the simplest: build a string with a header row and comma-separated values (quote fields containing commas), then return `File(bytes, "text/csv", "report.csv")` to trigger a download. Excel opens it directly.\n\n**PDF export** reuses **QuestPDF** from Module 8: a `ReportPdfService` lays out the report as a titled table and returns `byte[]`, served as `File(bytes, "application/pdf", "report.pdf")`.\n\nWire an export by adding a `?format=csv|pdf` query (or separate buttons) to each report action: the action fetches the same data, then branches to render HTML, build CSV, or build a PDF. Reusing one query for all three keeps the on-screen and exported numbers identical.',
          whyItMatters:
            'Reports that cannot leave the screen are half-useful — real businesses live in spreadsheets and emailed PDFs. One data query feeding HTML, CSV, and PDF guarantees the export always matches what the owner saw, with no reconciliation surprises.',
          steps: [
            'Add `EventScheduleAsync(from, to)` and `PendingPaymentsAsync()` to `ReportService`.',
            'Add a CSV helper that builds a header row plus quoted data rows.',
            'Return CSV as `File(bytes, "text/csv", "report.csv")`.',
            'Add a `ReportPdfService` using QuestPDF to render a report table to `byte[]`.',
            'Add a `?format=csv|pdf` branch to report actions reusing the same query.',
            'Add Export CSV / Export PDF buttons to each report view.',
          ],
          code: `// Simple, correct CSV builder (quotes fields containing commas/quotes).
public static byte[] ToCsv<T>(IEnumerable<T> rows, string[] headers,
                              Func<T, string[]> cells)
{
    var sb = new StringBuilder();
    sb.AppendLine(string.Join(",", headers.Select(Escape)));
    foreach (var r in rows)
        sb.AppendLine(string.Join(",", cells(r).Select(Escape)));
    return Encoding.UTF8.GetBytes(sb.ToString());

    static string Escape(string v) =>
        v.Contains(',') || v.Contains('"') || v.Contains('\\n')
            ? "\\"" + v.Replace("\\"", "\\"\\"") + "\\""
            : v;
}

// Report action with export branching.
[HttpGet("pending")]
public async Task<IActionResult> Pending(string? format)
{
    var rows = await _reports.PendingPaymentsAsync();

    if (format == "csv")
    {
        var bytes = ToCsv(rows,
            new[] { "Guest", "Phone", "Balance" },
            r => new[] { r.GuestName, r.Phone, r.BalanceDue.ToString("N2") });
        return File(bytes, "text/csv", "pending-payments.csv");
    }
    if (format == "pdf")
        return File(_reportPdf.PendingPayments(rows),
                    "application/pdf", "pending-payments.pdf");

    return View(rows); // default: HTML
}`,
          pitfalls: [
            '**Not escaping commas/quotes in CSV.** Columns shift in Excel. Fix: quote and double inner quotes.',
            '**Different queries for screen and export.** Numbers disagree. Fix: one query, three renderers.',
            '**Wrong content type for CSV.** Browser shows text instead of downloading. Fix: `text/csv` + filename.',
            '**Building PDF reports from scratch each time.** Duplication. Fix: a reusable `ReportPdfService`.',
            '**Huge exports loaded fully in memory.** Can OOM. Fix: stream or cap very large reports.',
            '**No BOM for Excel Unicode.** Names with accents garble. Fix: UTF-8 (optionally with BOM).',
          ],
          tryIt:
            'Add the pending-payments report with CSV and PDF export. View it as HTML, then add `?format=csv` and open the file in Excel — columns should align even for a guest whose name contains a comma. Add `?format=pdf` and confirm the PDF table matches the HTML rows exactly.',
          takeaway:
            'Feed event-schedule and pending-payments reports from one query into HTML, CSV (text/csv), and QuestPDF exports so every copy agrees.',
        },
      ],
    },
    {
      id: 'm9-s3',
      title: 'Admin, Audit & HR',
      topics: [
        {
          id: 'm9-t9',
          title: 'Admin User Management & Roles',
          explain:
            'Build admin-only screens to add users, assign a role (admin/manager/staff/auditor), and deactivate accounts.',
          analogy:
            'The TunMani Resort owner decides who holds which keys: the manager gets the office key, the front-desk clerk gets the reception key, the night auditor gets a key that only opens the records room to look, not to change. Admin user management is that key cabinet — only the owner (admin) can issue, change, or revoke keys.',
          theory:
            'User management is **admin-only**: protect the controller with `[Authorize(Roles = "Admin")]`. The screens let an admin **add a user** (email + initial role), **assign/change a role**, and **deactivate** (rather than delete) an account.\n\nThe four roles shape what each person can do:\n- **admin** — full control, including user management.\n- **manager** — operations, revenue, reports.\n- **staff** — day-to-day bookings, check-ins, payments.\n- **auditor** — read-only access to records and logs (next topic).\n\nRoles live as claims on the user; you assign them and enforce with `[Authorize(Roles = "...")]` on controllers/actions and `User.IsInRole(...)` in views. **Deactivation** sets an `IsActive` flag and blocks login, preserving the user\'s history and audit trail (never hard-delete a user who created records).\n\nKeep at least one admin always active — guard against an admin locking everyone out by deactivating the last admin.',
          whyItMatters:
            'Proper role management is the backbone of a multi-staff system: it ensures the night clerk cannot change revenue figures and the auditor cannot edit anything. Deactivating rather than deleting keeps every past action traceable to a real account.',
          steps: [
            'Protect `AdminUsersController` with `[Authorize(Roles = "Admin")]`.',
            'Add an "Add user" form (email + role) that creates the account.',
            'Add a "Change role" action assigning admin/manager/staff/auditor.',
            'Add a "Deactivate" action that flips `IsActive = false` and blocks login.',
            'Enforce roles elsewhere with `[Authorize(Roles = ...)]` and `User.IsInRole`.',
            'Block deactivating the last active admin.',
          ],
          code: `using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize(Roles = "Admin")]
[Route("admin/users")]
public class AdminUsersController : Controller
{
    private readonly IUserService _users;
    public AdminUsersController(IUserService users) => _users = users;

    [HttpPost("create")]
    public async Task<IActionResult> Create(string email, string role)
    {
        var allowed = new[] { "admin", "manager", "staff", "auditor" };
        if (!allowed.Contains(role)) return BadRequest("Unknown role.");
        await _users.CreateAsync(email, role);
        return RedirectToAction("Index");
    }

    [HttpPost("{id:long}/role")]
    public async Task<IActionResult> SetRole(long id, string role)
    {
        await _users.SetRoleAsync(id, role);
        return RedirectToAction("Index");
    }

    [HttpPost("{id:long}/deactivate")]
    public async Task<IActionResult> Deactivate(long id)
    {
        // Never deactivate the last active admin.
        if (await _users.IsLastActiveAdmin(id))
            return BadRequest("Cannot deactivate the last admin.");
        await _users.DeactivateAsync(id);
        return RedirectToAction("Index");
    }
}`,
          pitfalls: [
            '**No [Authorize(Roles="Admin")] on the controller.** Anyone manages users. Fix: lock it to admins.',
            '**Hard-deleting users.** Breaks audit links to their records. Fix: deactivate with a flag.',
            '**Accepting arbitrary role strings.** Typos create dead roles. Fix: validate against the allowed set.',
            '**Deactivating the last admin.** Locks everyone out. Fix: guard against it.',
            '**Checking roles only in the UI.** Bypassable. Fix: enforce on controllers/actions too.',
            '**Letting deactivated users still log in.** Defeats the purpose. Fix: block login on `IsActive = false`.',
          ],
          tryIt:
            'Build `AdminUsersController` with create, set-role, and deactivate, locked to admins. As an admin, create a staff user and confirm they cannot reach `/admin/users`. Change their role to manager and verify they gain report access. Try to deactivate the only admin and confirm it is blocked.',
          takeaway:
            'Admin-only user management assigns admin/manager/staff/auditor roles and deactivates (never deletes) accounts, always keeping one admin.',
        },
        {
          id: 'm9-t10',
          title: 'The Read-Only Auditor Role & Change Log',
          explain:
            'Give the auditor a read-only role and an AuditorController that views the HallBookingChangeLog without any ability to edit.',
          analogy:
            'The night auditor at TunMani Resort walks through with a torch and a register, checking that every entry matches — but he carries no pen to change anything. The auditor role is exactly that: full visibility into who changed which wedding booking and when, through the change log, but every edit button is gone. Watch everything, touch nothing.',
          theory:
            'The **auditor** role is **read-only by design**. Its controller, `AuditorController`, is marked `[Authorize(Roles = "Auditor,Admin")]` and exposes only **GET** actions — no create/update/delete anywhere. The UI for auditors hides action buttons (`@if (!User.IsInRole("Auditor")) { ...edit... }`).\n\nIts main view is the **`HallBookingChangeLog`** — a table that records every change to a hall booking: what changed (old value → new value), who changed it, and when. You built such change logging earlier; the auditor simply reads it.\n\nThe change log itself is **append-only**: rows are inserted on every booking edit and never updated or deleted, so the trail cannot be tampered with. The auditor can filter by booking, by user, or by date range to investigate.\n\nThis separation — a role that can see all but change nothing — is what makes the system trustworthy for compliance and dispute resolution. The auditor can answer "who reduced this wedding\'s bill and when?" without being able to alter the answer.',
          whyItMatters:
            'A read-only auditor role plus an append-only change log is how you prove what happened to a booking — essential for resolving guest disputes and internal accountability. It enforces "trust but verify" at the role level, not just by policy.',
          steps: [
            'Create `AuditorController` with `[Authorize(Roles = "Auditor,Admin")]` and only GET actions.',
            'Add an action to list the `HallBookingChangeLog` with filters (booking, user, date).',
            'Ensure the change log is append-only (insert on edit; never update/delete).',
            'In views, hide all edit/delete buttons from the auditor role.',
            'Show old value → new value, the user, and the timestamp per row.',
            'Confirm no POST/PUT/DELETE route is reachable by an auditor.',
          ],
          code: `using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize(Roles = "Auditor,Admin")]   // read-only audience
[Route("audit")]
public class AuditorController : Controller
{
    private readonly IAuditRepository _audit;
    public AuditorController(IAuditRepository audit) => _audit = audit;

    // GET only — no create/update/delete actions exist here.
    [HttpGet("changes")]
    public async Task<IActionResult> Changes(long? bookingId,
                                             DateTime? from, DateTime? to)
    {
        var rows = await _audit.GetHallChangeLogAsync(bookingId, from, to);
        return View(rows);
    }
}

@* Views/Auditor/Changes.cshtml — hide actions from auditors *@
@model List<HallBookingChange>
<table class="table">
  <thead><tr><th>When</th><th>By</th><th>Field</th><th>Old</th><th>New</th></tr></thead>
  <tbody>
  @foreach (var c in Model)
  {
    <tr>
      <td>@c.ChangedAt.ToString("dd MMM yyyy HH:mm")</td>
      <td>@c.ChangedBy</td>
      <td>@c.Field</td>
      <td>@c.OldValue</td>
      <td>@c.NewValue</td>
    </tr>
  }
  </tbody>
</table>`,
          pitfalls: [
            '**Adding any write action to AuditorController.** Breaks read-only. Fix: GET actions only.',
            '**Showing edit buttons to auditors.** Tempting and confusing. Fix: hide them by role in views.',
            '**Updating or deleting change-log rows.** Destroys the trail. Fix: append-only inserts.',
            '**Not recording who/when.** The log cannot answer questions. Fix: store user and timestamp.',
            '**Relying on hidden buttons for security.** URLs can be typed. Fix: enforce roles on the server.',
            '**No filters on the log.** Unusable at scale. Fix: filter by booking/user/date.',
          ],
          tryIt:
            'Build `AuditorController.Changes` and the read-only view. Log in as an auditor, edit a hall booking as a manager in another session, then refresh the change log — the edit should appear with old → new, user, and time. Confirm the auditor sees no edit buttons and that typing a POST URL is rejected by the role check.',
          takeaway:
            'The auditor role is GET-only, backed by an append-only change log, so it can see every booking change but alter nothing.',
        },
        {
          id: 'm9-t11',
          title: 'StaffLeave: Request & Approval Workflow',
          explain:
            'Model staff leave requests (full/half day, dates, status) and a LeaveController workflow where staff request and managers approve or reject.',
          analogy:
            'When a TunMani Resort waiter wants the day of his sister\'s wedding off, he writes a chit and drops it in the manager\'s tray; the manager later marks it approved or rejected and signs it. `StaffLeave` is that chit — leave type, dates, and a status that travels from "pending" to "approved" or "rejected", with the reviewer\'s name on it.',
          theory:
            'A **`StaffLeave`** record captures a request: a **`LeaveType`** (**full_day / half_day**), a **`StartDate`** and **`EndDate`**, a **`Status`** (**pending / approved / rejected**), and a **`ReviewerName`** filled when a manager decides. It belongs to the staff member who requested it.\n\nThe **workflow** has two roles:\n- **Staff** create a request via `LeaveController` — it starts as `pending`. Staff can see and cancel their own pending requests.\n- **Managers/Admins** see pending requests and `approve` or `reject` them, which sets the status and records `ReviewerName` and the review time.\n\nProtect actions by role: requesting is open to staff, but `[Authorize(Roles = "Manager,Admin")]` guards the approve/reject actions. Validate that `EndDate >= StartDate` and that a half-day request is a single day.\n\nStore leaves in a `staff_leaves` table with a status CHECK constraint. The list views differ by role: staff see their own; managers see the team\'s pending queue. This is a small but real HR feature that keeps scheduling honest.',
          whyItMatters:
            'A simple, role-gated leave workflow replaces paper chits and WhatsApp messages with an auditable record of who is off when. It prevents the double-booked-staff chaos that hits hardest during peak wedding season.',
          steps: [
            'Create a `staff_leaves` table: staff_id, leave_type, start_date, end_date, status (CHECK), reviewer_name, reviewed_at.',
            'Add a `LeaveController` `Request` action (staff) that inserts a `pending` leave.',
            'Validate `end_date >= start_date` and half-day = single day.',
            'Add `Approve`/`Reject` actions guarded by `[Authorize(Roles = "Manager,Admin")]`.',
            'On approve/reject, set status, `reviewer_name`, and `reviewed_at`.',
            'Show staff their own requests and managers the pending queue.',
          ],
          code: `-- staff_leaves table
CREATE TABLE staff_leaves (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    staff_id      bigint NOT NULL REFERENCES users(id),
    leave_type    text NOT NULL CHECK (leave_type IN ('full_day','half_day')),
    start_date    date NOT NULL,
    end_date      date NOT NULL,
    status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
    reviewer_name text,
    reviewed_at   timestamptz,
    CHECK (end_date >= start_date)
);

// LeaveController — request (staff) + review (manager).
[Authorize]
[Route("leave")]
public class LeaveController : Controller
{
    private readonly ILeaveService _leave;
    public LeaveController(ILeaveService leave) => _leave = leave;

    [HttpPost("request")]
    public async Task<IActionResult> Request(StaffLeaveVm vm)
    {
        if (vm.EndDate < vm.StartDate)
            ModelState.AddModelError("", "End date cannot be before start date.");
        if (!ModelState.IsValid) return View(vm);
        await _leave.RequestAsync(User.GetUserId(), vm); // status = pending
        return RedirectToAction("Mine");
    }

    [Authorize(Roles = "Manager,Admin")]
    [HttpPost("{id:long}/decide")]
    public async Task<IActionResult> Decide(long id, bool approve)
    {
        await _leave.DecideAsync(id, approve, User.Identity!.Name!);
        return RedirectToAction("Pending");
    }
}`,
          pitfalls: [
            '**Letting staff approve their own leave.** No oversight. Fix: gate approve/reject to Manager/Admin.',
            '**No status constraint.** Free-text statuses drift. Fix: a CHECK on the allowed values.',
            '**Allowing end before start.** Nonsensical ranges. Fix: validate and a DB CHECK.',
            '**Not recording the reviewer.** Cannot trace decisions. Fix: store `reviewer_name` and `reviewed_at`.',
            '**Showing everyone all requests.** Privacy and clutter. Fix: staff see their own, managers the queue.',
            '**Editing an approved leave silently.** Confuses scheduling. Fix: lock decided requests or log changes.',
          ],
          tryIt:
            'Create the `staff_leaves` table and `LeaveController`. As staff, request a half-day leave and confirm it lands as `pending` and that an end-before-start range is rejected. As a manager, approve it and verify the status flips to `approved` with your name as reviewer. Confirm staff cannot reach the approve action.',
          takeaway:
            'Model leave as type/dates/status with a reviewer, let staff request and managers approve or reject through role-gated LeaveController actions.',
        },
      ],
    },
    {
      id: 'm9-s4',
      title: 'Deployment & Go-Live',
      topics: [
        {
          id: 'm9-t12',
          title: 'Config, Secrets & Data Protection Keys',
          explain:
            'Separate appsettings from environment config, keep secrets in user-secrets/env vars, and persist Data Protection keys so auth cookies survive restarts.',
          analogy:
            'When TunMani Resort moves from a practice kitchen to the real seaside premises, the recipes (`appsettings.json`) stay the same but the supplier phone numbers and safe combinations change — those live on a private note at the new place, not painted on the wall. And the master key that unlocks every guest\'s locker must be the same key after a power cut, or every guest is locked out. Persisting Data Protection keys is keeping that master key safe across restarts.',
          theory:
            'ASP.NET Core layers configuration: **`appsettings.json`** (shared defaults), **`appsettings.{Environment}.json`** (per-environment, e.g. Production), and finally **environment variables / user-secrets** which override the rest. The environment is set by `ASPNETCORE_ENVIRONMENT`.\n\n**Secrets** (DB password, Gmail app password, OAuth client secret) belong in **user-secrets** (dev) or **environment variables** (production), never in committed JSON. Nested keys use double underscores in env vars: `ConnectionStrings__Default`.\n\n**Data Protection** is the system that encrypts auth cookies and antiforgery tokens. By default its keys are kept in memory or a per-machine location and **regenerate on restart** — which **logs everyone out** and can break tokens. Fix by **persisting keys** to a stable location: `builder.Services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo("/var/keys/tunmani"));` (or to a database / blob). With a shared, persisted key ring, cookies survive restarts and work across multiple instances.\n\nOn Linux you also want the key directory to survive deploys and be backed up, since losing it invalidates all existing cookies.',
          whyItMatters:
            'Without persisted Data Protection keys, every deploy or restart silently logs out every staff member — a baffling production bug. Clean config layering with secrets outside source is what lets the same build run safely in dev and production.',
          steps: [
            'Keep shared defaults in `appsettings.json`; environment overrides in `appsettings.Production.json`.',
            'Set `ASPNETCORE_ENVIRONMENT=Production` on the server.',
            'Put secrets in env vars (`ConnectionStrings__Default`, `Email__AppPassword`) — not in JSON.',
            'Add `AddDataProtection().PersistKeysToFileSystem(...)` pointing at a stable directory.',
            'Ensure that directory survives deploys and is backed up.',
            'Verify staff stay logged in across an app restart.',
          ],
          code: `// Program.cs — persist Data Protection keys so cookies survive restarts.
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo("/var/keys/tunmani"))
    .SetApplicationName("TunManiResort"); // same name across instances

// Connection string comes from env in production:
//   export ConnectionStrings__Default="Host=...;Database=tunmani;Username=...;Password=..."
var conn = builder.Configuration.GetConnectionString("Default");

# On the server (systemd unit or shell), set environment:
#   ASPNETCORE_ENVIRONMENT=Production
#   ConnectionStrings__Default=Host=localhost;Database=tunmani;Username=app;Password=...
#   Email__AppPassword=abcd efgh ijkl mnop`,
          pitfalls: [
            '**Not persisting Data Protection keys.** Every restart logs everyone out. Fix: persist to a stable path.',
            '**Committing secrets in appsettings.json.** Leaks on push. Fix: env vars / user-secrets.',
            '**Key directory wiped on deploy.** Cookies invalidate. Fix: a path outside the deploy folder, backed up.',
            '**Different SetApplicationName per instance.** Keys do not match across nodes. Fix: a shared app name.',
            '**Wrong env-var nesting syntax.** Config not read. Fix: `Section__Key` double underscore.',
            '**Forgetting to set ASPNETCORE_ENVIRONMENT.** Wrong settings file loads. Fix: set it explicitly.',
          ],
          tryIt:
            'Add `AddDataProtection().PersistKeysToFileSystem(...)` to a stable directory and move your connection string and app password to environment variables. Log in, restart the app, and confirm you are still logged in (without persistence you would be kicked out). Verify the secrets are read from env vars, not from any committed file.',
          takeaway:
            'Layer config with secrets in env vars and persist Data Protection keys to a stable, backed-up path so auth cookies survive restarts and scale-out.',
        },
        {
          id: 'm9-t13',
          title: 'Publishing & Running Behind Nginx',
          explain:
            'Build a release with dotnet publish and run the app behind Nginx as a reverse proxy with forwarded headers, HTTPS/HSTS, and a Linux service.',
          analogy:
            'TunMani Resort does not let guests wander into the kitchen — the reception (Nginx) greets everyone at the front, handles the heat and crowds (HTTPS, traffic), and quietly passes orders to the kitchen (Kestrel/your app) running safely in the back. `dotnet publish` is packing the kitchen equipment into one crate ready to install at the seaside premises.',
          theory:
            'Ship a **Release** build with **`dotnet publish -c Release -o /var/www/tunmani`**. This produces a self-contained set of DLLs plus `wwwroot` you run with `dotnet TunMani.dll` (Kestrel listens on a local port, e.g. 5000).\n\n**Kestrel should not face the internet directly** in this setup; put **Nginx** in front as a **reverse proxy**. Nginx terminates **HTTPS** (with a Let\'s Encrypt certificate), serves on 80/443, and forwards to `http://localhost:5000`. It must pass `X-Forwarded-For`/`X-Forwarded-Proto` so the app knows the real client and scheme.\n\nIn the app, enable **`ForwardedHeaders`** middleware (`app.UseForwardedHeaders(...)`) early in the pipeline so `Request.Scheme` is `https` behind the proxy — otherwise redirects and the OAuth callback break. Enable **HTTPS redirection and HSTS** for production.\n\nRun the app as a **systemd service** so it starts on boot and restarts on crash. (Alternatively, package it as a **Docker** container; either way Nginx fronts it.)',
          whyItMatters:
            'Nginx + forwarded headers is the standard, robust way to run ASP.NET Core on Linux — it gives you free HTTPS, restart-on-crash, and correct client info. Getting ForwardedHeaders right is what makes HTTPS redirects and Google OAuth work in production.',
          steps: [
            'Run `dotnet publish -c Release -o /var/www/tunmani`.',
            'Add `ForwardedHeaders` middleware early in `Program.cs` and enable HTTPS redirection + HSTS.',
            'Configure Nginx as a reverse proxy to `http://localhost:5000` with forwarded headers.',
            'Obtain an HTTPS certificate (e.g. Let\'s Encrypt / certbot) for the domain.',
            'Create a systemd service to run `dotnet TunMani.dll` on boot and restart on failure.',
            'Test the public HTTPS URL end to end.',
          ],
          code: `# Build a release.
dotnet publish -c Release -o /var/www/tunmani

# /etc/nginx/sites-available/tunmani  (reverse proxy)
server {
    listen 80;
    server_name tunmaniresort.com;
    location / {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

# /etc/systemd/system/tunmani.service
# [Unit]
# Description=TunMani Resort
# [Service]
# WorkingDirectory=/var/www/tunmani
# ExecStart=/usr/bin/dotnet /var/www/tunmani/TunMani.dll
# Restart=always
# Environment=ASPNETCORE_ENVIRONMENT=Production
# Environment=ASPNETCORE_URLS=http://localhost:5000
# [Install]
# WantedBy=multi-user.target

// Program.cs — trust the proxy headers (place EARLY).
using Microsoft.AspNetCore.HttpOverrides;
app.UseForwardedHeaders(new ForwardedHeadersOptions {
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});
if (!app.Environment.IsDevelopment()) { app.UseHsts(); }
app.UseHttpsRedirection();`,
          pitfalls: [
            '**Exposing Kestrel directly to the internet.** No TLS hardening. Fix: front it with Nginx.',
            '**Forgetting ForwardedHeaders.** App thinks it is on HTTP; redirects/OAuth break. Fix: enable it early.',
            '**UseForwardedHeaders placed after redirects.** Too late to help. Fix: put it near the top of the pipeline.',
            '**No restart-on-crash.** A crash takes the resort offline. Fix: `Restart=always` in systemd.',
            '**Publishing Debug build.** Slow, leaks detail. Fix: `-c Release`.',
            '**Self-signed/no certificate.** Browser warnings. Fix: a real cert (Let\'s Encrypt).',
          ],
          tryIt:
            'Publish a Release build, run it on port 5000, and put Nginx in front proxying to it with the forwarded headers. Enable `UseForwardedHeaders` early in `Program.cs`. Visit the site over HTTPS and confirm `Request.Scheme` is `https` (e.g. links and the OAuth redirect use https). Kill the app process and confirm systemd restarts it.',
          takeaway:
            'Publish in Release, run behind Nginx as a reverse proxy with ForwardedHeaders and HTTPS/HSTS, and keep it alive with a systemd service.',
        },
        {
          id: 'm9-t14',
          title: 'PostgreSQL Backups & PWA Offline Polish',
          explain:
            'Set up regular PostgreSQL backups with pg_dump, and add a PWA manifest plus a service worker so the app installs and survives flaky connections.',
          analogy:
            'The TunMani Resort keeps a photocopy of every register page in a fireproof box — if the office floods in the monsoon, the records survive. `pg_dump` backups are that fireproof box for your data. And because the seaside Wi-Fi drops sometimes, the app is wrapped as a phone-installable PWA so the front desk keeps working through a brief outage.',
          theory:
            '**Backups** are non-negotiable. **`pg_dump`** writes a consistent snapshot of the database to a file: `pg_dump -Fc tunmani > tunmani-2026-06-22.dump`. Automate it with a **cron job** (daily), keep several days of history, and **store copies off the server** (another disk or cloud). Periodically **test a restore** (`pg_restore`) — an untested backup is just hope.\n\nA **PWA** makes the web app installable and resilient. Two pieces:\n- A **`manifest.json`** (name, icons, `start_url`, `display: standalone`, theme colour) lets users "Add to Home Screen" so it opens like a native app.\n- A **service worker** (`sw.js`) registered from the page caches the shell (HTML/CSS/JS) so the app loads even on a poor connection, and can queue or gracefully handle requests when offline.\n\nKeep the service worker conservative for a data-heavy app: cache the **static shell** and assets, but be careful caching live data (you do not want to show a stale booking). A "cache the shell, network for data" strategy is a safe default.',
          whyItMatters:
            'A single corrupted disk without backups can erase years of bookings — pg_dump plus an off-site copy is the difference between a hiccup and a catastrophe. The PWA layer keeps the front desk usable on the patchy connectivity common at a coastal resort.',
          steps: [
            'Run `pg_dump -Fc tunmani > backup.dump` and confirm it produces a file.',
            'Schedule a daily backup via cron, keeping several days of history.',
            'Copy backups off the server (cloud or another machine).',
            'Periodically test `pg_restore` into a scratch database.',
            'Add `wwwroot/manifest.json` and link it in the layout `<head>`.',
            'Register a service worker (`sw.js`) that caches the static shell.',
          ],
          code: `# Daily PostgreSQL backup (cron: 0 2 * * *)
#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%F)
pg_dump -Fc tunmani > "/var/backups/tunmani-$STAMP.dump"
# keep 14 days, copy off-server
find /var/backups -name 'tunmani-*.dump' -mtime +14 -delete
rclone copy "/var/backups/tunmani-$STAMP.dump" remote:tunmani-backups
# restore test (into a scratch DB): pg_restore -d tunmani_test backup.dump

// wwwroot/manifest.json
// {
//   "name": "TunMani Resort", "short_name": "TunMani",
//   "start_url": "/", "display": "standalone",
//   "theme_color": "#003555", "background_color": "#ffffff",
//   "icons": [{ "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" }]
// }

// wwwroot/sw.js — cache the static shell, network for data.
const SHELL = 'tunmani-shell-v1';
self.addEventListener('install', e => e.waitUntil(
  caches.open(SHELL).then(c => c.addAll(['/', '/css/site.css', '/js/app.js']))
));
self.addEventListener('fetch', e => {
  // Network-first for API data; cache-first for the shell.
  if (e.request.url.includes('/api/')) return; // let live data go to network
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});`,
          pitfalls: [
            '**No backups at all.** One disk failure erases everything. Fix: automated daily `pg_dump`.',
            '**Backups only on the same server.** A server loss loses them too. Fix: copy off-site.',
            '**Never testing a restore.** Backups may be unusable. Fix: periodic `pg_restore` tests.',
            '**Caching live booking data in the service worker.** Stale, wrong data shown. Fix: network-first for `/api/`.',
            '**No manifest icons.** Install prompt fails. Fix: provide required icon sizes.',
            '**Service worker caching forever.** Stale assets after deploy. Fix: version the cache name and clean old ones.',
          ],
          tryIt:
            'Write and schedule the `pg_dump` backup script, then prove it by restoring into a scratch database. Add `manifest.json` and a minimal `sw.js`, register the service worker, and confirm the browser offers "Install app". Go offline and reload — the shell should still load while API data clearly fails or shows a friendly message rather than stale records.',
          takeaway:
            'Automate off-site pg_dump backups with tested restores, and add a manifest plus a shell-caching service worker so the app installs and survives flaky connections.',
        },
        {
          id: 'm9-t15',
          title: 'The Go-Live Checklist',
          explain:
            'Walk the final pre-launch checklist: branding, Google OAuth production redirect URI, secrets, and the database connection — the things that break on day one if missed.',
          analogy:
            'The evening before TunMani Resort opens for its first wedding, the manager walks every room with a list: signboard says "TunMani" not "Test Hall", the front gate buzzer works (OAuth), the safe is locked (secrets), the water and power are connected (database). The go-live checklist is that final walk — small items, but any one missed ruins opening day.',
          theory:
            'Going live is mostly **checklist discipline**, not new code. The items that most commonly break a launch:\n- **Branding.** Replace any placeholder name/logo with **TunMani Resort**; set the production domain, email sender, and PWA name/theme colour.\n- **Google OAuth production redirect URI.** Add the **production** callback (e.g. `https://tunmaniresort.com/signin-google`) to the Google Cloud console\'s authorised redirect URIs, and use the **production** client id/secret. A dev-only redirect is the classic "login works locally, fails in prod" bug.\n- **Secrets.** Confirm DB password, Gmail app password, and OAuth secret are set as **environment variables** on the server, not in committed files. Rotate any secret that ever touched source control.\n- **Database connection.** Point the production connection string at the real PostgreSQL, run migrations/DDL, and confirm the app user has the right privileges. Verify backups (previous topic) are running.\n\nAlso verify: HTTPS works, Data Protection keys persist, ForwardedHeaders is on, the systemd service restarts, and an admin account exists. Do a **smoke test** of the critical paths — login, create a booking, generate an invoice PDF, send a confirmation email, open a public link — before announcing.',
          whyItMatters:
            'Almost every painful launch-day incident is a missed checklist item — a forgotten OAuth redirect, a secret left in source, a connection string pointing at the dev DB. A disciplined checklist turns go-live from a gamble into a routine.',
          steps: [
            'Replace all placeholder branding with TunMani Resort (name, logo, email sender, PWA).',
            'Add the production redirect URI and prod client id/secret to Google OAuth.',
            'Set DB password, app password, and OAuth secret as server environment variables.',
            'Point the connection string at production PostgreSQL; run DDL/migrations; check privileges.',
            'Confirm HTTPS, persisted keys, ForwardedHeaders, systemd restart, and backups.',
            'Smoke-test login, booking, invoice PDF, confirmation email, and a public link.',
          ],
          code: `# --- TunMani Resort go-live checklist ---

# 1. Branding
#   [ ] App name "TunMani Resort" everywhere (titles, emails, manifest)
#   [ ] Production domain + email sender configured

# 2. Google OAuth (production)
#   [ ] Authorised redirect URI added in Google Cloud console:
#         https://tunmaniresort.com/signin-google
#   [ ] Production Client Id / Client Secret in env vars (not appsettings)
export Authentication__Google__ClientId="...apps.googleusercontent.com"
export Authentication__Google__ClientSecret="..."

# 3. Secrets as environment variables (never in source)
export ConnectionStrings__Default="Host=localhost;Database=tunmani;Username=app;Password=..."
export Email__AppPassword="abcd efgh ijkl mnop"

# 4. Database
#   [ ] Connection string -> production PostgreSQL
#   [ ] DDL/migrations applied; app user has correct privileges
#   [ ] Daily pg_dump backups running and a restore tested

# 5. Infra sanity
#   [ ] HTTPS + HSTS working; ForwardedHeaders enabled
#   [ ] Data Protection keys persisted; systemd Restart=always
#   [ ] One admin account exists

# 6. Smoke test the critical paths
#   [ ] Login via Google  [ ] Create a booking  [ ] Invoice PDF
#   [ ] Confirmation email sends  [ ] Public /p link opens`,
          pitfalls: [
            '**Forgetting the production OAuth redirect URI.** Login fails in prod. Fix: add the prod callback in Google console.',
            '**Leaving placeholder branding.** Looks unfinished/untrustworthy. Fix: replace with TunMani Resort.',
            '**Secrets still in appsettings.** Leaked and wrong. Fix: env vars; rotate exposed ones.',
            '**Connection string pointing at the dev DB.** Wrong/empty data. Fix: production string + run DDL.',
            '**No smoke test before announcing.** Day-one surprises. Fix: walk every critical path first.',
            '**No admin account in prod.** Nobody can manage users. Fix: seed one admin.',
          ],
          tryIt:
            'Run the checklist against a staging deploy of TunMani Resort. Add the production redirect URI to Google OAuth and confirm Google login works on the live domain. Verify every secret is read from an environment variable. Finally, perform the smoke test end to end — login, booking, invoice PDF, email, public link — and only then call it live.',
          takeaway:
            'Go-live is a disciplined checklist: branding, the production OAuth redirect, secrets in env vars, the right DB connection, and a full smoke test before launch.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm9-p1',
      type: 'Project',
      title: 'Role-Based Dashboard + Reports with CSV/PDF Export',
      domain: 'Resort analytics & reporting',
      duration: '3 hours',
      description:
        'Build the TunMani Resort dashboard and report suite: a role-aware home dashboard, occupancy/revenue/event/pending reports filtered by date range, and CSV plus QuestPDF export for each.',
      tools: ['ASP.NET Core MVC', 'C#', 'PostgreSQL', 'Dapper', 'QuestPDF', 'Bootstrap 5'],
      blueprint: {
        overview:
          'You will turn raw bookings and invoices into the numbers an owner runs the resort on — a role-tailored dashboard plus four date-filtered reports, each exportable to CSV and PDF from one shared query.',
        functionalRequirements: [
          '**Dashboard.** Summary stats, this-week check-ins, and pending payments, with revenue tiles only for managers/admins.',
          '**Occupancy & revenue reports.** Date-range filtered, aggregated in SQL, with empty days filled.',
          '**Event schedule & pending payments.** Operational and collection reports.',
          '**Export.** Every report exportable as CSV (text/csv) and PDF (QuestPDF).',
          '**Role gating.** Reports and revenue gated by `[Authorize(Roles = ...)]` and `User.IsInRole`.',
        ],
        technicalImplementation: [
          '**Services/DashboardService.cs.** SQL-aggregated stats, check-ins, pending payments into a DashboardVm.',
          '**Services/ReportService.cs.** OccupancyAsync/RevenueAsync/EventScheduleAsync/PendingPaymentsAsync with parameterised dates and generate_series.',
          '**Services/ReportPdfService.cs.** QuestPDF tables reused for all report exports.',
          '**Controllers.** HomeController (dashboard) and ReportController (reports + ?format=csv|pdf branch).',
          '**Views.** Bootstrap cards and tables branded with #003555/#006496, with Export buttons.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Dashboard service',
            outcome: 'A role-aware home dashboard.',
            prompt:
              'Create Services/DashboardService.cs with BuildAsync() that uses Dapper to SQL-aggregate active bookings, total balance due, rooms occupied, this-week check-ins, and top pending payments into a DashboardVm. Then write HomeController.Index that builds it and sets ShowRevenue = User.IsInRole("Manager") || User.IsInRole("Admin"), and a Bootstrap card view that hides revenue tiles when ShowRevenue is false.',
          },
          {
            step: 2,
            label: 'Occupancy & revenue reports',
            outcome: 'Date-filtered aggregated reports.',
            prompt:
              'Create Services/ReportService.cs with OccupancyAsync(from,to) and RevenueAsync(from,to) using parameterised dates and generate_series to fill empty days with zero. Add a ReportController with /reports/revenue and /reports/occupancy actions that read from/to query params, default to the current month, swap reversed ranges, and render a Bootstrap table.',
          },
          {
            step: 3,
            label: 'Event schedule & pending payments',
            outcome: 'Operational reports.',
            prompt:
              'Add EventScheduleAsync(from,to) (upcoming weddings with hall, date, guest count, contact) and PendingPaymentsAsync() (invoices with balance_due > 0, ordered by amount) to ReportService, plus ReportController actions and Bootstrap table views for each.',
          },
          {
            step: 4,
            label: 'CSV export',
            outcome: 'Download any report for Excel.',
            prompt:
              'Add a generic ToCsv helper that builds a header row and quoted data rows (escaping commas and quotes) and returns UTF-8 bytes. Add a ?format=csv branch to each report action that reuses the same query and returns File(bytes, "text/csv", "<report>.csv"). Add Export CSV buttons to the report views.',
          },
          {
            step: 5,
            label: 'PDF export',
            outcome: 'Printable report PDFs.',
            prompt:
              'Create Services/ReportPdfService.cs using QuestPDF (Community license) that renders any report as a titled table to byte[]. Add a ?format=pdf branch to each report action returning File(bytes, "application/pdf", "<report>.pdf"), reusing the same query as the HTML and CSV so all three agree. Add Export PDF buttons to the views.',
          },
        ],
      },
    },
    {
      id: 'm9-p2',
      type: 'Capstone',
      title: 'Ship TunMani Resort: Full App Wired & Deployed Behind Nginx',
      domain: 'End-to-end resort management system',
      duration: '5 hours',
      description:
        'The capstone: assemble every module into the complete TunMani Resort app — auth, rooms, hall bookings, payments, PDFs, email, public links, CRM, dashboard, reports, admin, and HR — then deploy it on a Linux server behind Nginx with PostgreSQL, HTTPS, backups, and the full go-live checklist.',
      tools: ['ASP.NET Core MVC + Web API', 'C#', 'PostgreSQL', 'Dapper', 'QuestPDF', 'MailKit', 'Google OAuth', 'Nginx', 'systemd'],
      blueprint: {
        overview:
          'You will wire the whole TunMani Resort system together — every feature from the course working as one app — and ship it to production behind Nginx on PostgreSQL with HTTPS, persisted keys, automated backups, and a verified go-live checklist.',
        functionalRequirements: [
          '**Full feature set.** Google-OAuth login with roles, room and wedding-hall bookings, payments, QuestPDF invoices, MailKit email, public token links, CRM with occasions, dashboard, reports, admin/auditor, and staff leave — all reachable and consistent.',
          '**Role-correct access.** admin/manager/staff/auditor each see only what they should; auditor is read-only.',
          '**Production deployment.** Release build behind Nginx with ForwardedHeaders, HTTPS/HSTS, and a systemd service.',
          '**Data safety.** PostgreSQL with persisted Data Protection keys and automated, tested pg_dump backups.',
          '**Go-live verified.** Branding, production OAuth redirect, env-var secrets, prod DB connection, and an end-to-end smoke test all pass.',
        ],
        technicalImplementation: [
          '**Integration.** All services (Pdf, Email, Share, Crm, Dashboard, Report, Report PDF) registered in Program.cs; ForwardedHeaders + HTTPS + Data Protection configured.',
          '**PostgreSQL.** All DDL applied to the production database; app user privileged correctly; daily off-site pg_dump backups with a tested restore.',
          '**Nginx + systemd.** Reverse proxy to Kestrel on localhost:5000 with forwarded headers and a Let\'s Encrypt certificate; a Restart=always systemd unit.',
          '**Secrets & config.** Connection string, Gmail app password, and Google OAuth client id/secret in environment variables; ASPNETCORE_ENVIRONMENT=Production.',
          '**PWA & branding.** manifest.json + service worker; all branding set to TunMani Resort with the #003555/#006496 palette.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Wire the app together',
            outcome: 'One coherent, fully-registered app.',
            prompt:
              'Review a TunMani Resort ASP.NET Core MVC + Web API solution and produce a Program.cs that registers every service (PdfService, HallInvoicePdfService, EmailService, ShareLinkService, CrmService, DashboardService, ReportService, ReportPdfService), sets the QuestPDF Community license, configures Google OAuth with role-based authorization, persists Data Protection keys, and adds ForwardedHeaders, HTTPS redirection, and HSTS. Verify navigation links exist for bookings, hall, payments, invoices, CRM, dashboard, reports, admin, audit, and leave.',
          },
          {
            step: 2,
            label: 'Production database',
            outcome: 'A ready, backed-up PostgreSQL.',
            prompt:
              'Produce a single ordered SQL script that creates every TunMani Resort table (users, rooms, bookings, hall_bookings, invoices with public_token, payments, crm_contacts, crm_occasions, staff_leaves, hall_booking_change_log) with constraints and indexes, plus a least-privilege app DB user. Then write a daily pg_dump backup script that copies off-server, prunes old dumps, and includes a documented pg_restore test.',
          },
          {
            step: 3,
            label: 'Nginx + systemd deploy',
            outcome: 'The app live behind a reverse proxy.',
            prompt:
              'Provide the deployment steps: dotnet publish -c Release -o /var/www/tunmani, an Nginx server block reverse-proxying to http://localhost:5000 with Host and X-Forwarded-For/Proto headers, a Let\'s Encrypt certificate via certbot, and a systemd unit (Restart=always, ASPNETCORE_ENVIRONMENT=Production, ASPNETCORE_URLS=http://localhost:5000). Confirm UseForwardedHeaders is placed early in the pipeline.',
          },
          {
            step: 4,
            label: 'Secrets & PWA',
            outcome: 'Secure config and an installable app.',
            prompt:
              'List the environment variables to set on the server (ConnectionStrings__Default, Email__AppPassword, Authentication__Google__ClientId/ClientSecret) and confirm none are in committed files. Then add wwwroot/manifest.json (name "TunMani Resort", theme #003555, standalone, icons) and a conservative service worker that caches the static shell but uses the network for /api/ data, registered from the layout.',
          },
          {
            step: 5,
            label: 'Go-live checklist & smoke test',
            outcome: 'A verified, launched resort system.',
            prompt:
              'Produce a final go-live checklist for TunMani Resort covering branding, the production Google OAuth redirect URI (https://tunmaniresort.com/signin-google) with prod client id/secret, secrets as env vars, the production DB connection with DDL applied, HTTPS/HSTS, persisted Data Protection keys, ForwardedHeaders, systemd restart, a seeded admin, and running backups. End with an end-to-end smoke test script: Google login, create a room booking, create a hall booking (which syncs CRM contacts), record a payment, generate and email an invoice PDF, open a public /p link, and view the dashboard and a report as each role.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm9-q1',
      q: 'What is the role of _Layout.cshtml and partial views like _Sidebar?',
      options: [
        'A shared master shell with reusable fragments, so each part is written once',
        'A way to store database connection strings',
        'C# classes that run business logic',
        'Files that must be duplicated into every view',
      ],
      answer: 0,
    },
    {
      id: 'm9-q2',
      q: 'When enforcing check-in before check-out, where must the rule live?',
      options: [
        'Both client-side (Flatpickr) for UX and server-side as the real gatekeeper',
        'Only in Flatpickr on the client',
        'Only in the database, never in code',
        'Nowhere — ASP.NET handles it automatically',
      ],
      answer: 0,
    },
    {
      id: 'm9-q3',
      q: 'How should the dashboard and reports compute their numbers efficiently?',
      options: [
        'Aggregate in SQL with COUNT/SUM/GROUP BY rather than counting rows in C#',
        'Load every row into C# and loop to count',
        'Recompute from scratch on every keystroke',
        'Hard-code the totals in the view',
      ],
      answer: 0,
    },
    {
      id: 'm9-q4',
      q: 'What defines the auditor role in the TunMani Resort system?',
      options: [
        'Read-only access (GET actions only) to records and an append-only change log',
        'Full edit rights over all bookings',
        'The ability to add and delete users',
        'Permission to approve staff leave',
      ],
      answer: 0,
    },
    {
      id: 'm9-q5',
      q: 'Why must Data Protection keys be persisted to a stable location in production?',
      options: [
        'So auth cookies survive app restarts instead of logging everyone out',
        'To make PDFs generate faster',
        'Because PostgreSQL requires it for backups',
        'It is only needed in development',
      ],
      answer: 0,
    },
    {
      id: 'm9-q6',
      q: 'When running ASP.NET Core behind Nginx, what makes HTTPS redirects and OAuth work correctly?',
      options: [
        'Enabling ForwardedHeaders middleware early so the app sees the real scheme (https)',
        'Exposing Kestrel directly to the internet on port 443',
        'Disabling HTTPS redirection entirely',
        'Running a Debug build in production',
      ],
      answer: 0,
    },
  ],
}
