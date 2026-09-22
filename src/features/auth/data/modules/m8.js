// Module 8 — PDF, Email, Public Share Links & CRM
// Build a Resort Management System — TunMani Resort (ASP.NET Core MVC + Web API,
// C#, PostgreSQL via Dapper) course content for the React course player.

export const m8 = {
  id: 'm8',
  title: 'PDF, Email, Public Share Links & CRM',
  hours: 9,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Turn a booking into a real PDF confirmation and GST tax invoice with QuestPDF, email it with the PDF attached using MailKit, share it safely via opaque token links, and grow a CRM of guests and their special occasions.',
  sections: [
    {
      id: 'm8-s1',
      title: 'PDF with QuestPDF',
      topics: [
        {
          id: 'm8-t1',
          title: 'Installing QuestPDF & Setting the Community License',
          explain:
            'Add the QuestPDF package and set its Community license once at app startup so every PDF you generate is legal and license-free for a small business.',
          analogy:
            'Before the TunMani Resort front desk can print a single confirmation slip, the manager buys one stamp pad and ink for the whole season — set up once, used a thousand times. QuestPDF is that stamp pad: you declare the free Community licence one time when the app boots in Program.cs, and from then on every room confirmation and wedding-hall invoice prints without anyone asking for money or a key.',
          theory:
            '**QuestPDF** is a modern C# library that builds PDF documents with a fluent layout API — no HTML, no headless browser. It is **free under the Community licence** for companies with revenue under a threshold, which fits a coastal resort perfectly.\n\nThe licence must be acknowledged **exactly once, before any document is generated**, by setting `QuestPDF.Settings.License = LicenseType.Community;`. The natural place is **`Program.cs`** during startup. If you forget, QuestPDF throws an exception the first time you call `GeneratePdf()`.\n\nInstall it with the **dotnet CLI**: `dotnet add package QuestPDF`. You will build documents by implementing `IDocument` (or using the inline `Document.Create(...)` builder), describing **pages**, then calling `.GeneratePdf()` to get a `byte[]`.\n\nKeep all PDF code in a dedicated **`Services/PdfService.cs`** so controllers never touch QuestPDF directly — they just ask the service for bytes.',
          whyItMatters:
            'Setting the licence once at startup is the difference between PDFs that "just work" and a confusing runtime crash the first time a guest asks for an invoice. Centralising PDF logic in a service keeps your controllers thin and lets you restyle every document in one place.',
          steps: [
            'Run `dotnet add package QuestPDF` in the project folder.',
            'Open `Program.cs` and add `using QuestPDF.Infrastructure;` at the top.',
            'Before `builder.Build()` runs your app, set `QuestPDF.Settings.License = LicenseType.Community;`.',
            'Create `Services/PdfService.cs` and register it with `builder.Services.AddScoped<PdfService>();`.',
            'Add a tiny `GenerateHello()` method that returns a one-page `byte[]` to prove the setup.',
            'Inject `PdfService` into a controller and return `File(bytes, "application/pdf")` to view it.',
          ],
          code: `// Program.cs — set the licence ONCE, at startup.
using QuestPDF.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Acknowledge the free Community licence before any PDF is built.
QuestPDF.Settings.License = LicenseType.Community;

builder.Services.AddScoped<PdfService>();
// ... other services ...

var app = builder.Build();
// ... middleware ...
app.Run();

// Services/PdfService.cs — a smoke-test document.
using QuestPDF.Fluent;
using QuestPDF.Helpers;

public class PdfService
{
    public byte[] GenerateHello()
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.Content().Text("TunMani Resort — PDF works!");
            });
        }).GeneratePdf();
    }
}`,
          pitfalls: [
            '**Forgetting to set the licence.** The first `GeneratePdf()` call throws. Fix: set `LicenseType.Community` in `Program.cs` before building documents.',
            '**Setting the licence inside every request.** Wasteful and confusing. Fix: set it exactly once at startup.',
            '**Calling QuestPDF directly from controllers.** Spreads layout code everywhere. Fix: keep it inside `PdfService`.',
            '**Installing the wrong package name.** Use `QuestPDF`, not a fork. Fix: `dotnet add package QuestPDF`.',
            '**Assuming Community is free for any company.** It has a revenue limit. Fix: confirm your business is under the threshold.',
            '**Returning the Document instead of bytes.** Controllers need `byte[]`. Fix: end with `.GeneratePdf()`.',
          ],
          tryIt:
            'Install QuestPDF, set the Community licence in `Program.cs`, and add `GenerateHello()` to `PdfService`. Wire a controller action that returns `File(service.GenerateHello(), "application/pdf")`, run the app, and open the URL — you should see a one-line PDF in the browser. Comment out the licence line and confirm you get the expected exception.',
          takeaway:
            'Add QuestPDF, set the Community licence once at startup, and keep all PDF building inside a dedicated PdfService.',
        },
        {
          id: 'm8-t2',
          title: 'The Resort Header & Bill-To Block',
          explain:
            'Lay out the top of every document: the TunMani Resort name, address, phone, and GSTIN on the left, and the guest "Bill To" block — using QuestPDF Column and Row.',
          analogy:
            'Every TunMani Resort document — be it a one-night stay or a 300-guest wedding — opens with the same letterhead: the resort name in bold, the Byndoor beachfront address, the phone, and the GSTIN, exactly like the masthead on the manager\'s receipt book. Beside or below it sits a neat "Bill To" panel naming the guest. You build this header once and reuse it on every page.',
          theory:
            'QuestPDF lays out content with **containers** that you nest: `page.Header()`, `page.Content()`, `page.Footer()`. Inside any container you compose with **`.Column(col => ...)`** (stacks children vertically) and **`.Row(row => ...)`** (places children side by side). A `Row` child can be `row.RelativeItem()` (shares remaining space) or `row.ConstantItem(width)` (fixed width).\n\nFor the header, a common layout is a `Row` with two `RelativeItem` columns: the **left** holds the resort identity (`name` bold and large, then `address`, `phone`, `GSTIN`), the **right** holds the document title (e.g. "TAX INVOICE") and number, right-aligned.\n\nThe **Bill-To block** is its own `Column`: a small "Bill To" caption, then the guest name, phone, and (for invoices) their GSTIN if any. Style text with `.Text(t => t.Span("...").Bold().FontSize(16))` and align with `.AlignRight()`.\n\nDrive every value from data — a `ResortInfo` object for the masthead and the `Booking`/guest for the bill-to — so the same code prints correct details for any guest or any future change of phone or GSTIN.',
          whyItMatters:
            'The GSTIN and resort identity on a document are what make it a valid tax invoice a guest can submit for reimbursement. Building the header from data means one edit updates every future PDF — no code change, no redeploy.',
          steps: [
            'Add a `ResortInfo` record with `Name`, `Address`, `Phone`, `Gstin`.',
            'In `page.Header()`, create a `Row` with two `RelativeItem` columns.',
            'Left column: resort name (bold, ~18pt), then address, phone, and `GSTIN: ...`.',
            'Right column: the document title and number, using `.AlignRight()`.',
            'Below the header, add a `Column` for the Bill-To block: caption + guest name, phone, GSTIN.',
            'Read all values from `ResortInfo` and the `Booking`; never hard-code them.',
          ],
          code: `using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

void ComposeHeader(IContainer container, ResortInfo resort, string title, string docNo)
{
    container.Row(row =>
    {
        // Left: resort masthead.
        row.RelativeItem().Column(col =>
        {
            col.Item().Text(resort.Name).Bold().FontSize(18);
            col.Item().Text(resort.Address);
            col.Item().Text($"Ph: {resort.Phone}");
            col.Item().Text($"GSTIN: {resort.Gstin}");
        });

        // Right: document title + number.
        row.RelativeItem().Column(col =>
        {
            col.Item().AlignRight().Text(title).Bold().FontSize(16);
            col.Item().AlignRight().Text($"No: {docNo}");
        });
    });
}

void ComposeBillTo(IContainer container, string guestName, string guestPhone)
{
    container.Column(col =>
    {
        col.Item().Text("Bill To").SemiBold();
        col.Item().Text(guestName);
        col.Item().Text(guestPhone);
    });
}`,
          pitfalls: [
            '**Hard-coding the resort name and GSTIN.** A phone change needs a redeploy. Fix: read from a `ResortInfo` object.',
            '**Forgetting GSTIN on a tax invoice.** It is then not a valid tax document. Fix: always print it when present.',
            '**RelativeItem widths fighting.** Two relative items split evenly; mixing constant/relative changes that. Fix: choose deliberately.',
            '**No Bill-To block.** The invoice does not say who owes. Fix: print guest name and phone.',
            '**Text overflowing a column.** Long addresses clip. Fix: let QuestPDF wrap, or shorten the address.',
            '**Repeating the header code per document.** Drift creeps in. Fix: one shared `ComposeHeader` helper.',
          ],
          tryIt:
            'Add `ComposeHeader` and `ComposeBillTo` to `PdfService` and call them inside a test document with a real `ResortInfo` and a sample guest. Generate the PDF and confirm the resort name dominates the top-left, the GSTIN is visible, the title is right-aligned, and the Bill-To names the guest. Edit the resort phone in your data and reprint to prove it changed with no code edit.',
          takeaway:
            'Build a data-driven header (resort identity + GSTIN) and a Bill-To block once, then reuse them on every document.',
        },
        {
          id: 'm8-t3',
          title: 'Line Items & the GST Breakdown (CGST/SGST)',
          explain:
            'Lay out the charges table — description, nights/qty, rate, amount — then the GST breakdown split into CGST and SGST, and a bold grand total.',
          analogy:
            'This is the heart of the TunMani Resort bill: the same list the front desk reads back — "Sea-View Deluxe × 3 nights, breakfast for two, banquet hall hire" — each with its rate and amount, then the government\'s share split into CGST and SGST, and finally the big bold number the guest pays. Lining these columns up is like neatly arranging plates on a banquet table: everything in its place.',
          theory:
            'QuestPDF draws tables with **`.Table(table => ...)`**. You first declare columns with `table.ColumnsDefinition(c => { c.RelativeColumn(...); c.ConstantColumn(...); })`, then add a **header row** (`table.Header(...)`) and **cells** in order with `table.Cell()`. Use `.AlignRight()` on numeric cells so money lines up.\n\nFor **intra-state GST** (guest in Karnataka, resort in Karnataka), the tax splits in two halves: **CGST** and **SGST**, each half the GST rate (e.g. 12% GST = 6% CGST + 6% SGST). For inter-state you would use IGST, but the resort\'s common case is intra-state.\n\nAfter the items table, print a small **totals block** as label/value rows, right-aligned: `Sub Total`, `CGST @ 6%`, `SGST @ 6%`, then a divider and a **bold Grand Total**.\n\nDrive every figure from the **`Booking`/`Invoice`** model — `invoice.SubTotal`, `invoice.Cgst`, `invoice.Sgst`, `invoice.Total` — computed at billing time. The PDF should **never recompute** tax; it only displays the stored, authoritative numbers. Format money consistently, e.g. `amount.ToString("N2")` with a `₹` or `Rs.` prefix.',
          whyItMatters:
            'The charges table and grand total are what the guest scrutinises and what an auditor checks. A misaligned column or a total that does not match the lines destroys trust. Printing straight from the stored invoice guarantees the PDF agrees with what was saved.',
          steps: [
            'Define a `Table` with columns for description, qty, rate, and amount.',
            'Add a header row labelling each column.',
            'Loop over `invoice.Lines`, adding one `table.Cell()` per column, amounts `.AlignRight()`.',
            'Below the table, add a totals `Column`: `Sub Total`, `CGST`, `SGST` as label/value rows.',
            'Add a divider, then a bold `Grand Total` row.',
            'Read `SubTotal`, `Cgst`, `Sgst`, `Total` from the invoice; never recompute.',
          ],
          code: `static string Money(decimal v) => $"Rs.{v.ToString("N2")}";

void ComposeItems(IContainer container, Invoice invoice)
{
    container.Column(col =>
    {
        col.Item().Table(table =>
        {
            table.ColumnsDefinition(c =>
            {
                c.RelativeColumn(5); // Description
                c.RelativeColumn(1); // Qty
                c.RelativeColumn(2); // Rate
                c.RelativeColumn(2); // Amount
            });

            table.Header(h =>
            {
                h.Cell().Text("Description").Bold();
                h.Cell().AlignRight().Text("Qty").Bold();
                h.Cell().AlignRight().Text("Rate").Bold();
                h.Cell().AlignRight().Text("Amount").Bold();
            });

            foreach (var line in invoice.Lines)
            {
                table.Cell().Text(line.Description);
                table.Cell().AlignRight().Text(line.Qty.ToString());
                table.Cell().AlignRight().Text(Money(line.Rate));
                table.Cell().AlignRight().Text(Money(line.Qty * line.Rate));
            }
        });

        // Totals block, right-aligned.
        void Row(string label, string value, bool bold = false) =>
            col.Item().Row(r =>
            {
                var l = r.RelativeItem().AlignRight().Text(label);
                var v = r.ConstantItem(90).AlignRight().Text(value);
                if (bold) { l.Bold(); v.Bold(); }
            });

        Row("Sub Total", Money(invoice.SubTotal));
        Row("CGST", Money(invoice.Cgst));
        Row("SGST", Money(invoice.Sgst));
        Row("Grand Total", Money(invoice.Total), bold: true);
    });
}`,
          pitfalls: [
            '**Recomputing tax inside the PDF.** It can diverge from the saved invoice. Fix: read `Cgst`/`Sgst`/`Total` from the model.',
            '**Using a single GST line instead of CGST + SGST.** Wrong for intra-state invoices. Fix: split into two halves.',
            '**Numeric cells left-aligned.** Money columns look ragged. Fix: `.AlignRight()` on amounts.',
            '**Inconsistent decimals.** `4500` vs `4500.00` looks unprofessional. Fix: format with `"N2"`.',
            '**Grand Total not visually dominant.** Guests miss it. Fix: make it bold and slightly larger.',
            '**Table column widths not summing sensibly.** Columns clip. Fix: balance relative widths to the content.',
          ],
          tryIt:
            'Build `ComposeItems` and feed it a sample invoice with three lines including a long description (e.g. "Sea-View Deluxe — 3 nights"). Generate the PDF: each line should sit in clean columns, amounts right-aligned, CGST and SGST each half the GST, and the Grand Total bold. Confirm Sub Total + CGST + SGST equals the Grand Total.',
          takeaway:
            'Draw the charges with a QuestPDF table, split GST into CGST and SGST, and read every figure from the stored invoice.',
        },
        {
          id: 'm8-t4',
          title: 'PdfService: Booking Confirmation + Tax Invoice',
          explain:
            'Assemble the header, bill-to, items, and footer into two real documents — a room booking confirmation and a GST tax invoice — each returning byte[].',
          analogy:
            'A guest who reserves a Sea-View Deluxe for the Kundapura temple festival gets two different slips from the TunMani Resort desk: first a friendly "confirmed!" note with dates and a booking number, and later, on checkout, the formal tax invoice with GST. Same letterhead, same fonts, different purpose. Your `PdfService` builds both from the same building blocks.',
          theory:
            'A clean **`PdfService`** exposes purpose-named methods that each return a **`byte[]`**: `BookingConfirmation(Booking booking)` and `TaxInvoice(Invoice invoice)`. Internally both call the shared `ComposeHeader`, `ComposeBillTo`, and a footer, differing only in the title and the body.\n\nThe **confirmation** is reassuring and light: title "BOOKING CONFIRMATION", the booking number, room type, check-in/check-out dates, number of guests, and the advance paid / balance due. The **tax invoice** is formal: title "TAX INVOICE", the charges table, the CGST/SGST breakdown, and the grand total.\n\nEach method ends with `Document.Create(...).GeneratePdf()`, returning bytes the controller serves. Keep a private `ComposeFooter` that prints the resort\'s thank-you line, terms, and maybe "This is a computer-generated document."\n\nBecause both documents share helpers, restyling the masthead or footer updates **both at once** — the same consistency win you want across a resort\'s paperwork.',
          whyItMatters:
            'Two clearly different documents from one consistent service means staff never confuse a confirmation with an invoice, and a single styling change ripples everywhere. Returning `byte[]` keeps the service free of HTTP concerns so it is easy to test and reuse (print, email, share).',
          steps: [
            'Add `byte[] BookingConfirmation(Booking booking)` to `PdfService`.',
            'Inside it, build a document: header, bill-to, a confirmation body, footer.',
            'Add `byte[] TaxInvoice(Invoice invoice)` reusing header, bill-to, `ComposeItems`, footer.',
            'Write a private `ComposeFooter` for the thank-you and terms line.',
            'End each method with `Document.Create(...).GeneratePdf()`.',
            'Inject `ResortInfo` (from config) so the masthead is data-driven.',
          ],
          code: `using QuestPDF.Fluent;
using QuestPDF.Helpers;

public class PdfService
{
    private readonly ResortInfo _resort;
    public PdfService(ResortInfo resort) => _resort = resort;

    public byte[] BookingConfirmation(Booking b) =>
        Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.Header().Element(c =>
                    ComposeHeader(c, _resort, "BOOKING CONFIRMATION", b.BookingNo));
                page.Content().Column(col =>
                {
                    ComposeBillTo(col.Item(), b.GuestName, b.GuestPhone);
                    col.Item().PaddingTop(10).Text($"Room: {b.RoomType}");
                    col.Item().Text($"Check-in:  {b.CheckIn:dd MMM yyyy}");
                    col.Item().Text($"Check-out: {b.CheckOut:dd MMM yyyy}");
                    col.Item().Text($"Guests: {b.GuestCount}");
                    col.Item().Text($"Advance paid: {Money(b.AdvancePaid)}");
                    col.Item().Text($"Balance due:  {Money(b.BalanceDue)}");
                });
                page.Footer().Element(ComposeFooter);
            });
        }).GeneratePdf();

    public byte[] TaxInvoice(Invoice inv) =>
        Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.Header().Element(c =>
                    ComposeHeader(c, _resort, "TAX INVOICE", inv.InvoiceNo));
                page.Content().Column(col =>
                {
                    ComposeBillTo(col.Item(), inv.GuestName, inv.GuestPhone);
                    ComposeItems(col.Item().PaddingTop(10), inv);
                });
                page.Footer().Element(ComposeFooter);
            });
        }).GeneratePdf();

    private void ComposeFooter(IContainer c) =>
        c.AlignCenter().Text("Thank you for staying with TunMani Resort. "
            + "This is a computer-generated document.");
}`,
          pitfalls: [
            '**One document trying to be both confirmation and invoice.** Confuses guests. Fix: two purpose-named methods.',
            '**Duplicating header/footer code per method.** Causes drift. Fix: share `ComposeHeader`/`ComposeFooter`.',
            '**Returning IDocument instead of byte[].** Callers cannot serve it. Fix: end with `.GeneratePdf()`.',
            '**Putting HTTP/File() logic in the service.** Couples it to MVC. Fix: the service returns bytes; the controller serves them.',
            '**Formatting dates differently across docs.** Looks sloppy. Fix: one date format string.',
            '**No "computer-generated" note.** Looks unofficial. Fix: add it to the footer.',
          ],
          tryIt:
            'Implement `BookingConfirmation` and `TaxInvoice` in `PdfService`. Generate both for the same guest and save them to disk. The confirmation should show dates and balance; the invoice should show the GST table. Confirm both share the identical masthead and footer — change the footer text once and verify it updates in both.',
          takeaway:
            'Build the confirmation and the tax invoice as two byte[]-returning methods that share the same header and footer helpers.',
        },
        {
          id: 'm8-t5',
          title: 'Serving PDFs: Inline Preview vs Download & HallInvoicePdfService',
          explain:
            'Return PDF bytes from a controller with File(...), choosing inline browser preview or forced download, and add a HallInvoicePdfService for wedding-hall bills.',
          analogy:
            'When a guest at the TunMani Resort desk asks "show me the bill" you flip the screen around — that is the inline preview. When they say "give me a copy for my files" you hand them a printed sheet — that is the download. The same PDF, served two ways. And because a 300-guest wedding bill is its own beast (hall hire, decoration, catering per plate), it gets its own `HallInvoicePdfService`.',
          theory:
            'In an MVC/Web API controller, return a PDF with **`File(byte[] bytes, string contentType, string? fileDownloadName)`**. The content type for PDFs is **`"application/pdf"`**.\n\n- **Inline preview** (open in the browser tab): return `File(bytes, "application/pdf")` *without* a download name, and optionally set the `Content-Disposition` header to `inline`. The browser\'s built-in viewer shows it.\n- **Forced download** (save to disk): pass a `fileDownloadName`, e.g. `File(bytes, "application/pdf", "invoice-1042.pdf")`. ASP.NET sets `Content-Disposition: attachment` and the browser downloads it.\n\nThe **wedding hall** has its own billing shape — hall hire, per-plate catering, decoration, taxes — so a **`HallInvoicePdfService`** mirrors `PdfService` but composes hall-specific line items. It still reuses the shared header/footer helpers (move them to a small static `PdfLayout` helper class so both services share them).\n\nA `[HttpGet]` action typically loads the booking/invoice, calls the right service for bytes, and returns `File(...)`. Keep the choice of inline vs download in the controller, not the service.',
          whyItMatters:
            'Guests expect to glance at a bill in the browser but also to save a copy — getting both right with one `File(...)` call is a small touch that feels professional. A separate hall service keeps wedding billing clean without tangling it into room invoices.',
          steps: [
            'Add a `[HttpGet("invoice/{id:int}")]` action that loads the invoice.',
            'Call `_pdf.TaxInvoice(invoice)` to get `byte[]`.',
            'Return `File(bytes, "application/pdf")` for inline preview.',
            'Add a `?download=true` query (or a separate action) that passes a `fileDownloadName` for download.',
            'Create `Services/HallInvoicePdfService.cs` for wedding-hall bills.',
            'Move shared header/footer into a static `PdfLayout` helper used by both services.',
          ],
          code: `using Microsoft.AspNetCore.Mvc;

[Route("invoices")]
public class InvoiceController : Controller
{
    private readonly PdfService _pdf;
    private readonly IInvoiceRepository _repo;

    public InvoiceController(PdfService pdf, IInvoiceRepository repo)
    {
        _pdf = pdf;
        _repo = repo;
    }

    // GET /invoices/42            -> inline preview in the browser
    // GET /invoices/42?download=1 -> forced download
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, bool download = false)
    {
        var invoice = await _repo.GetAsync(id);
        if (invoice is null) return NotFound();

        var bytes = _pdf.TaxInvoice(invoice);

        return download
            ? File(bytes, "application/pdf", $"invoice-{invoice.InvoiceNo}.pdf")
            : File(bytes, "application/pdf"); // inline preview
    }
}

// Services/HallInvoicePdfService.cs — wedding-hall billing.
public class HallInvoicePdfService
{
    private readonly ResortInfo _resort;
    public HallInvoicePdfService(ResortInfo resort) => _resort = resort;

    public byte[] HallInvoice(HallBooking hall) =>
        Document.Create(doc => doc.Page(page =>
        {
            page.Margin(2, QuestPDF.Infrastructure.Unit.Centimetre);
            page.Header().Element(c =>
                PdfLayout.Header(c, _resort, "WEDDING HALL INVOICE", hall.InvoiceNo));
            page.Content().Element(c => PdfLayout.HallItems(c, hall));
            page.Footer().Element(PdfLayout.Footer);
        })).GeneratePdf();
}`,
          pitfalls: [
            '**Wrong content type.** `text/html` or `application/octet-stream` breaks preview. Fix: use `"application/pdf"`.',
            '**Always forcing download.** Guests cannot glance at the bill. Fix: omit the filename for inline preview.',
            '**Never offering download.** Guests cannot save a copy. Fix: pass a `fileDownloadName` when asked.',
            '**Reusing the room PdfService for hall bills.** Mixes two billing shapes. Fix: a dedicated `HallInvoicePdfService`.',
            '**Duplicating header/footer across services.** Drift. Fix: a shared static `PdfLayout`.',
            '**Not handling a missing invoice.** Throws on null. Fix: return `NotFound()`.',
          ],
          tryIt:
            'Wire the `InvoiceController.Get` action. Open `/invoices/42` in a browser — the PDF should preview inline. Add `?download=1` and confirm the browser downloads `invoice-<no>.pdf` instead. Then build `HallInvoicePdfService` for a sample wedding booking and serve it the same way, confirming it shares the resort masthead.',
          takeaway:
            'Serve PDFs with File(bytes, "application/pdf") — omit the filename for inline preview, pass one to force download — and give the wedding hall its own invoice service.',
        },
      ],
    },
    {
      id: 'm8-s2',
      title: 'Email with MailKit',
      topics: [
        {
          id: 'm8-t6',
          title: 'EmailSettings & Binding Secrets from Config',
          explain:
            'Define a strongly-typed EmailSettings options object (host, port, sender, app password) and bind it from configuration — keeping the real password out of source code.',
          analogy:
            'The TunMani Resort does not paint its bank PIN on the front gate. The Gmail app password that sends guest emails is the same kind of secret: it lives in a safe (user-secrets or environment variables), and the app reads it at startup. `EmailSettings` is the labelled envelope the app opens to find the host, port, sender name, and that secret — never typed into a file the whole team can see.',
          theory:
            'ASP.NET Core has the **Options pattern**: define a plain class (e.g. **`EmailSettings`**) with properties, then **bind** a configuration section to it. Properties: `Host` (smtp.gmail.com), `Port` (587), `SenderName` ("TunMani Resort"), `SenderEmail`, and `AppPassword`.\n\nIn `appsettings.json` you keep only the **non-secret** fields. The **app password** must NOT be committed — instead store it in **user-secrets** for development (`dotnet user-secrets set "Email:AppPassword" "xxxx xxxx xxxx xxxx"`) or **environment variables** in production. The configuration system merges all sources, so binding still finds it.\n\nBind in `Program.cs` with `builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));`. Then any service injects **`IOptions<EmailSettings>`** and reads `options.Value`.\n\nGmail requires an **app password** (a 16-character token generated under Google Account → Security → App passwords), not your normal login password, and only when 2-Step Verification is on.',
          whyItMatters:
            'Hard-coding an SMTP password is the classic way to leak credentials the moment the repo is shared or pushed to GitHub. The Options pattern plus user-secrets keeps the secret out of source while making config strongly-typed and testable.',
          steps: [
            'Create `Settings/EmailSettings.cs` with `Host`, `Port`, `SenderName`, `SenderEmail`, `AppPassword`.',
            'In `appsettings.json`, add an `"Email"` section with everything EXCEPT the password.',
            'Run `dotnet user-secrets init` then `dotnet user-secrets set "Email:AppPassword" "<app password>"`.',
            'In `Program.cs`, call `builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));`.',
            'Inject `IOptions<EmailSettings>` into the `EmailService` you build next.',
            'In production, set `Email__AppPassword` as an environment variable instead of user-secrets.',
          ],
          code: `// Settings/EmailSettings.cs
public class EmailSettings
{
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public string SenderName { get; set; } = "TunMani Resort";
    public string SenderEmail { get; set; } = "";
    public string AppPassword { get; set; } = ""; // never committed
}

// appsettings.json (NO password here)
// {
//   "Email": {
//     "Host": "smtp.gmail.com",
//     "Port": 587,
//     "SenderName": "TunMani Resort",
//     "SenderEmail": "bookings@tunmaniresort.com"
//   }
// }

// Keep the secret out of source:
//   dotnet user-secrets init
//   dotnet user-secrets set "Email:AppPassword" "abcd efgh ijkl mnop"

// Program.cs — bind the section to the options class.
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("Email"));`,
          pitfalls: [
            '**Committing the app password in appsettings.json.** It leaks on push. Fix: user-secrets or env vars.',
            '**Using your normal Gmail password.** SMTP rejects it. Fix: generate a Google app password (needs 2FA on).',
            '**Wrong section name in GetSection.** Binding silently yields blanks. Fix: match the JSON key exactly ("Email").',
            '**Reading config with magic strings everywhere.** Error-prone. Fix: bind once to `EmailSettings`.',
            '**Forgetting env-var key format.** It is `Email__AppPassword` (double underscore). Fix: use `__` for nesting.',
            '**Injecting IConfiguration instead of IOptions.** Loses typing. Fix: inject `IOptions<EmailSettings>`.',
          ],
          tryIt:
            'Create `EmailSettings`, add the non-secret `Email` section to `appsettings.json`, and set the app password via user-secrets. Bind it in `Program.cs`. Temporarily inject `IOptions<EmailSettings>` into a controller and log `options.Value.Host` and `SenderEmail` (never the password) to confirm binding works and the secret is loaded from outside source.',
          takeaway:
            'Model SMTP config as a bound EmailSettings options class, and keep the Gmail app password in user-secrets or environment variables, never in source.',
        },
        {
          id: 'm8-t7',
          title: 'EmailService: Sending Mail with MailKit SMTP',
          explain:
            'Build an EmailService that connects to Gmail SMTP with MailKit and sends a plain confirmation email asynchronously.',
          analogy:
            'MailKit is the TunMani Resort\'s reliable courier boy: you hand him a sealed envelope (the message), tell him the post office address (smtp.gmail.com:587), he shows his ID at the counter (the app password), drops the letter, and comes back. He does it without making the front desk wait — that is the async part — so the receptionist can keep checking in the next guest.',
          theory:
            '**MailKit** is the de-facto modern .NET email library (more capable and standards-correct than the legacy `SmtpClient`). Install it with `dotnet add package MailKit`.\n\nA message is a **`MimeMessage`**: set `From` (a `MailboxAddress` with the sender name and email), `To`, `Subject`, and a **`Body`** built via `BodyBuilder` (which lets you set `HtmlBody`/`TextBody` and add attachments).\n\nTo send, use MailKit\'s **`SmtpClient`** (`MailKit.Net.Smtp`, not the System.Net one). The sequence is: `await client.ConnectAsync(host, port, SecureSocketOptions.StartTls)`, then `await client.AuthenticateAsync(senderEmail, appPassword)`, then `await client.SendAsync(message)`, and finally `await client.DisconnectAsync(true)`. Gmail on **port 587** uses **STARTTLS**.\n\nWrap all of this in an injectable **`EmailService`** that reads `EmailSettings` from `IOptions`, exposes a clean `SendAsync(to, subject, body)`, and is fully **async** so it never blocks the request thread. Wrap the send in try/catch and log failures.',
          whyItMatters:
            'A reliable, async EmailService is what lets the front desk fire off a confirmation without freezing the UI, and a clean abstraction means you can later switch SMTP providers or add a queue without touching controllers. Using MailKit avoids the quirks and deprecation of the old SmtpClient.',
          steps: [
            'Run `dotnet add package MailKit`.',
            'Create `Services/EmailService.cs` injecting `IOptions<EmailSettings>` and `ILogger`.',
            'Build a `MimeMessage`: `From` from settings, `To`, `Subject`, and a `BodyBuilder` body.',
            'Connect with `ConnectAsync(host, port, SecureSocketOptions.StartTls)`.',
            'Authenticate with `SenderEmail` and `AppPassword`, then `SendAsync`.',
            '`DisconnectAsync(true)` in a `finally`, and try/catch around the whole send.',
            'Register `builder.Services.AddScoped<EmailService>();`.',
          ],
          code: `using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Options;

public class EmailService
{
    private readonly EmailSettings _cfg;
    private readonly ILogger<EmailService> _log;

    public EmailService(IOptions<EmailSettings> cfg, ILogger<EmailService> log)
    {
        _cfg = cfg.Value;
        _log = log;
    }

    public async Task SendAsync(string toEmail, string toName,
                                string subject, string htmlBody)
    {
        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress(_cfg.SenderName, _cfg.SenderEmail));
        msg.To.Add(new MailboxAddress(toName, toEmail));
        msg.Subject = subject;
        msg.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_cfg.Host, _cfg.Port,
                                      SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_cfg.SenderEmail, _cfg.AppPassword);
            await client.SendAsync(msg);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Failed to send email to {To}", toEmail);
            throw; // let the caller decide how to surface it
        }
        finally
        {
            if (client.IsConnected) await client.DisconnectAsync(true);
        }
    }
}`,
          pitfalls: [
            '**Using System.Net.Mail.SmtpClient.** Deprecated and quirky. Fix: use MailKit\'s `SmtpClient`.',
            '**Wrong SecureSocketOptions for port 587.** SSL-on-connect fails. Fix: use `StartTls` for 587.',
            '**Not disposing/disconnecting the client.** Leaks connections. Fix: `using` + `DisconnectAsync` in `finally`.',
            '**Blocking with .Result on async calls.** Deadlocks. Fix: `await` everything end-to-end.',
            '**Swallowing send errors silently.** Staff think mail went out. Fix: log and rethrow.',
            '**Authenticating with the normal password.** Gmail rejects it. Fix: the app password from settings.',
          ],
          tryIt:
            'Build `EmailService` and register it. From a temporary controller action, call `SendAsync` to your own email with a test subject and a one-line HTML body. Check your inbox — the From name should read "TunMani Resort". Then deliberately use a wrong port and confirm the error is logged and surfaced rather than silently swallowed.',
          takeaway:
            'Send mail with MailKit: build a MimeMessage, connect with STARTTLS on 587, authenticate with the app password, and keep it all async behind an EmailService.',
        },
        {
          id: 'm8-t8',
          title: 'Emailing the Confirmation / Invoice with the PDF Attached',
          explain:
            'Combine PdfService and EmailService: generate the booking PDF, attach it to a MimeMessage, and email it to the guest.',
          analogy:
            'The TunMani Resort desk does not just tell a guest "you are booked" over the phone — it slips the printed confirmation into an envelope and posts it. Attaching the QuestPDF bytes to the MailKit message is exactly that: the friendly email is the cover note, the PDF is the official slip tucked inside, and one tap sends both to the guest in Udupi.',
          theory:
            'You already have two pieces: `PdfService` returns **`byte[]`** and `EmailService` sends **`MimeMessage`s**. To attach a PDF, use **`BodyBuilder.Attachments.Add(fileName, bytes, contentType)`**, where `contentType` is `new ContentType("application", "pdf")`.\n\nAdd an overload like `SendWithPdfAsync(to, name, subject, htmlBody, pdfBytes, fileName)` to `EmailService` that builds the `BodyBuilder`, adds the attachment, then sends. Give the attachment a meaningful name such as `confirmation-{bookingNo}.pdf` so the guest\'s inbox shows a recognisable file.\n\nThe orchestration usually lives in a controller action or a small flow method: load the booking, `var pdf = _pdf.BookingConfirmation(booking);`, then `await _email.SendWithPdfAsync(...)`. Because sending is async and can fail, wrap it so a guest record is never lost just because email hiccuped — log the failure and let staff resend.\n\nFor reliability at scale you would push email to a background queue, but for a small resort a direct async send on the request is fine to start.',
          whyItMatters:
            'A confirmation email with the PDF attached is the single most guest-facing feature of the whole booking flow — it is what the guest screenshots and shows at the gate. Reusing the same PDF bytes for print, download, email, and share guarantees every copy is identical.',
          steps: [
            'Add `SendWithPdfAsync(...)` to `EmailService` taking `pdfBytes` and a `fileName`.',
            'Build a `BodyBuilder`, set `HtmlBody`, then `Attachments.Add(fileName, pdfBytes, new ContentType("application","pdf"))`.',
            'Reuse the same connect/authenticate/send/disconnect sequence.',
            'In the booking flow, generate `_pdf.BookingConfirmation(booking)`.',
            'Call `SendWithPdfAsync` with subject, a warm HTML body, the bytes, and `confirmation-<no>.pdf`.',
            'Wrap the send so a failure logs and offers a resend rather than losing the booking.',
          ],
          code: `using MimeKit;
using MailKit.Net.Smtp;
using MailKit.Security;

public partial class EmailService
{
    public async Task SendWithPdfAsync(string toEmail, string toName,
        string subject, string htmlBody, byte[] pdfBytes, string fileName)
    {
        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress(_cfg.SenderName, _cfg.SenderEmail));
        msg.To.Add(new MailboxAddress(toName, toEmail));
        msg.Subject = subject;

        var body = new BodyBuilder { HtmlBody = htmlBody };
        body.Attachments.Add(fileName, pdfBytes,
            new ContentType("application", "pdf"));
        msg.Body = body.ToMessageBody();

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_cfg.Host, _cfg.Port,
                                      SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_cfg.SenderEmail, _cfg.AppPassword);
            await client.SendAsync(msg);
        }
        finally
        {
            if (client.IsConnected) await client.DisconnectAsync(true);
        }
    }
}

// --- orchestration in the booking controller ---
// var pdf = _pdf.BookingConfirmation(booking);
// await _email.SendWithPdfAsync(
//     booking.GuestEmail, booking.GuestName,
//     $"Your TunMani Resort booking #{booking.BookingNo} is confirmed",
//     "<p>Dear guest, your stay is confirmed. Details attached.</p>",
//     pdf, $"confirmation-{booking.BookingNo}.pdf");`,
          pitfalls: [
            '**Wrong attachment content type.** The PDF opens as junk. Fix: `new ContentType("application", "pdf")`.',
            '**Generic attachment names like file.pdf.** Guests cannot tell bookings apart. Fix: include the booking number.',
            '**Regenerating a different PDF for email than for print.** They diverge. Fix: reuse the same `PdfService` bytes.',
            '**Losing the booking when email fails.** Bad UX. Fix: save first, then send; on failure log and allow resend.',
            '**Sending synchronously and freezing the UI.** Slow. Fix: `await` the async send.',
            '**No HTML body, only an attachment.** Looks like spam. Fix: a short, warm cover note.',
          ],
          tryIt:
            'Add `SendWithPdfAsync` and wire it into your booking flow. Create a test booking with your own email, generate the confirmation PDF, and send it. Open the email on your phone — the cover note should read warmly and the attached `confirmation-<no>.pdf` should match exactly what `/invoices` previews in the browser.',
          takeaway:
            'Generate the PDF bytes once and attach them to a MailKit message with the application/pdf content type to email a guest their confirmation or invoice.',
        },
      ],
    },
    {
      id: 'm8-s3',
      title: 'Public Share Links (token PDFs)',
      topics: [
        {
          id: 'm8-t9',
          title: 'The PublicToken: An Opaque, Unguessable Key',
          explain:
            'Add a random GUID PublicToken to bookings and invoices so they can be shared by a link that no one can guess or enumerate.',
          analogy:
            'Imagine TunMani Resort confirmations were numbered 1, 2, 3 on the public board — any passer-by could read out "show me number 47" and see a stranger\'s wedding bill. Instead each guest gets a long secret reference like a hotel-safe combination: a random GUID. You cannot guess your neighbour\'s combination by adding one to your own. That GUID is the `PublicToken`.',
          theory:
            'A sequential database **id** (1, 2, 3…) is **enumerable** — if `/p/booking/47` works, an attacker just tries 48, 49, 50 and scrapes everyone\'s data. The fix is to share by an **opaque, random token** instead of the id.\n\nA **`Guid`** (e.g. `f47ac10b-58cc-4372-a567-0e02b2c3d479`) generated with `Guid.NewGuid()` is 122 bits of randomness — effectively impossible to guess or enumerate. Add a column **`PublicToken uuid`** to the bookings and invoices tables, set it once at creation, and index it.\n\nThe public URL uses the token, never the id: `/p/booking/{token:guid}`. The lookup is "find the row WHERE PublicToken = @token" — if no row matches, return `NotFound()`. Because tokens are unguessable, simply knowing the link is the authorization (a "capability URL"), so these endpoints can be `[AllowAnonymous]`.\n\nGenerate the token server-side at insert time; never let the client choose it. If a link ever leaks, you can rotate (regenerate) the token to invalidate the old one.',
          whyItMatters:
            'Sharing by sequential id is one of the most common real-world data leaks (IDOR). An opaque GUID token lets a guest share their own confirmation freely while making it mathematically impossible to stumble onto someone else\'s — security with zero login friction.',
          steps: [
            'Add a `PublicToken uuid NOT NULL` column to the bookings and invoices tables.',
            'Generate it server-side with `Guid.NewGuid()` when the row is created.',
            'Add a unique index on `PublicToken` for fast lookups.',
            'Add a repository method `GetByTokenAsync(Guid token)` that filters on `PublicToken`.',
            'Design public routes around the token: `/p/booking/{token:guid}`.',
            'Return `NotFound()` when no row matches the token.',
          ],
          code: `-- PostgreSQL: add an opaque token column and index it.
ALTER TABLE bookings
    ADD COLUMN public_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX ix_bookings_public_token
    ON bookings (public_token);

ALTER TABLE invoices
    ADD COLUMN public_token uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX ix_invoices_public_token
    ON invoices (public_token);`,
          pitfalls: [
            '**Sharing by sequential id.** Attackers enumerate neighbours (IDOR). Fix: share by random token.',
            '**Letting the client choose the token.** Predictable values. Fix: generate `Guid.NewGuid()` server-side.',
            '**Storing the token without an index.** Lookups get slow. Fix: add a unique index on the token column.',
            '**Using a short random string.** Brute-forceable. Fix: a full 122-bit GUID.',
            '**No way to rotate a leaked token.** Old links live forever. Fix: allow regenerating the token.',
            '**Treating the token as a secret password in logs.** It can leak. Fix: avoid logging full share URLs.',
          ],
          tryIt:
            'Add the `public_token` column and index to your bookings table. Insert a booking and note its token. In psql, run a SELECT filtering on `public_token = the-token` and confirm exactly one row returns. Then try guessing a neighbouring token by changing a digit — it should match nothing, proving tokens are not enumerable.',
          takeaway:
            'Share by a random GUID PublicToken, not a sequential id, so links are unguessable, non-enumerable capability URLs.',
        },
        {
          id: 'm8-t10',
          title: 'PublicController: [AllowAnonymous] PDF Endpoints at /p',
          explain:
            'Build a PublicController mapped at /p with [AllowAnonymous] that serves booking, invoice, and hall PDFs by token so guests view them without logging in.',
          analogy:
            'The /p endpoints are the TunMani Resort\'s public notice board outside the gate: anyone holding the right secret reference slip can walk up and read their own confirmation, no need to enter the office or sign the visitor book. The board only shows what each slip\'s code unlocks — present a valid token, get your document; present nothing or a wrong one, get a polite "not found".',
          theory:
            'Create a **`PublicController`** with `[Route("p")]` and **`[AllowAnonymous]`** on the class, so its actions bypass authentication. Each action takes a **`Guid` token** as a route constraint (`{token:guid}` rejects non-GUID values automatically) and serves the matching PDF inline.\n\nRoutes to build:\n- `GET /p/booking/{token:guid}` — looks up the booking by token, generates the confirmation PDF, returns `File(bytes, "application/pdf")` (inline).\n- `GET /p/invoice/{token:guid}/{id:int}` — looks up by token, optionally scopes to a specific invoice id, serves the tax invoice.\n- `GET /p/hall/{token:guid}` — serves the wedding-hall invoice via `HallInvoicePdfService`.\n\nEach action: load by token, `if (null) return NotFound();`, generate bytes, return `File(...)`. Because the token is the capability, no other auth is needed — but keep these endpoints **read-only** (GET) and serving only PDFs, never JSON of raw fields, so a leaked link exposes nothing beyond the document itself.\n\nServe inline (no download filename) so the link opens straight in the phone browser when tapped from WhatsApp.',
          whyItMatters:
            'Guests share confirmations from their phone in a chat — forcing a login there would kill the experience. A read-only, token-scoped `/p` controller gives a one-tap view that is still safe because the token is unguessable.',
          steps: [
            'Create `Controllers/PublicController.cs` with `[Route("p")]` and `[AllowAnonymous]`.',
            'Add `GET booking/{token:guid}` that loads by token and serves the confirmation PDF.',
            'Add `GET invoice/{token:guid}/{id:int}` for the tax invoice.',
            'Add `GET hall/{token:guid}` using `HallInvoicePdfService`.',
            'Return `NotFound()` when the token matches no row.',
            'Serve inline (no filename) so taps open in the browser.',
          ],
          code: `using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[AllowAnonymous]
[Route("p")]
public class PublicController : Controller
{
    private readonly IBookingRepository _bookings;
    private readonly IInvoiceRepository _invoices;
    private readonly IHallRepository _halls;
    private readonly PdfService _pdf;
    private readonly HallInvoicePdfService _hallPdf;

    public PublicController(IBookingRepository bookings,
        IInvoiceRepository invoices, IHallRepository halls,
        PdfService pdf, HallInvoicePdfService hallPdf)
    {
        _bookings = bookings; _invoices = invoices; _halls = halls;
        _pdf = pdf; _hallPdf = hallPdf;
    }

    // GET /p/booking/{token}
    [HttpGet("booking/{token:guid}")]
    public async Task<IActionResult> Booking(Guid token)
    {
        var b = await _bookings.GetByTokenAsync(token);
        if (b is null) return NotFound();
        return File(_pdf.BookingConfirmation(b), "application/pdf");
    }

    // GET /p/invoice/{token}/{id}
    [HttpGet("invoice/{token:guid}/{id:int}")]
    public async Task<IActionResult> Invoice(Guid token, int id)
    {
        var inv = await _invoices.GetByTokenAsync(token, id);
        if (inv is null) return NotFound();
        return File(_pdf.TaxInvoice(inv), "application/pdf");
    }

    // GET /p/hall/{token}
    [HttpGet("hall/{token:guid}")]
    public async Task<IActionResult> Hall(Guid token)
    {
        var hall = await _halls.GetByTokenAsync(token);
        if (hall is null) return NotFound();
        return File(_hallPdf.HallInvoice(hall), "application/pdf");
    }
}`,
          pitfalls: [
            '**Forgetting [AllowAnonymous].** Guests hit a login wall. Fix: mark the controller anonymous.',
            '**Accepting the id instead of the token in the public route.** Enumerable leak. Fix: route on `{token:guid}`.',
            '**No `:guid` route constraint.** Junk values reach your code. Fix: constrain the route parameter.',
            '**Returning raw JSON of all fields.** Leaks more than the document. Fix: serve only the PDF.',
            '**Allowing POST/PUT on /p.** A leaked link could mutate data. Fix: GET, read-only.',
            '**Forcing a download filename.** Breaks one-tap preview. Fix: serve inline.',
          ],
          tryIt:
            'Build `PublicController` and open `/p/booking/<token>` in an incognito window (not logged in) — the confirmation PDF should display. Change one character of the token and confirm you get a 404, not someone else\'s booking. Then copy the working link into a WhatsApp message to yourself and tap it to verify it opens in the mobile browser.',
          takeaway:
            'A read-only [AllowAnonymous] /p controller serves PDFs by GUID token, letting guests view their documents with one tap and no login.',
        },
        {
          id: 'm8-t11',
          title: 'Sharing the Link via WhatsApp & Email',
          explain:
            'Build the full share URL from the token and hand it to the guest through a WhatsApp deep link or the confirmation email.',
          analogy:
            'Once the secret slip exists, the TunMani Resort desk just needs to pass it to the guest. A WhatsApp share link is like the receptionist saying "I have sent it to your number" — the guest taps once and the confirmation opens. The same link goes into the email footer as "View your booking online", so the guest can re-open it from anywhere, anytime.',
          theory:
            'The token lives in the database; the **share URL** is built from it: `https://tunmaniresort.com/p/booking/{token}`. Build it server-side using the request\'s scheme and host (or a configured base URL) so it works in dev and production.\n\nTo share to **WhatsApp**, use the official deep link **`https://wa.me/?text=<url-encoded message>`** (or `https://wa.me/<phone>?text=...` to target a specific number). The message text includes a friendly line plus the share URL. URL-encode the text with `Uri.EscapeDataString`.\n\nIn the **confirmation email**, add a "View your booking online" link pointing at the same `/p/...` URL, so even if the attachment is lost the guest can reopen the live document.\n\nKeep URL building in one helper so the base URL, scheme, and path are consistent everywhere. In production, prefer a configured `PublicBaseUrl` over `Request.Host` so links are stable behind a reverse proxy.',
          whyItMatters:
            'A booking is only useful to a guest if they can actually open it — a WhatsApp tap or an email link is how the document reaches the person at the gate. Centralising URL building avoids broken links when the app moves behind Nginx or changes domain.',
          steps: [
            'Add a `PublicBaseUrl` to config (e.g. `https://tunmaniresort.com`).',
            'Write a helper `BookingShareUrl(Guid token) => $"{baseUrl}/p/booking/{token}"`.',
            'Build a WhatsApp link: `https://wa.me/?text=` + `Uri.EscapeDataString(message + " " + url)`.',
            'Show a "Share on WhatsApp" button linking to that URL on the booking page.',
            'Add a "View your booking online" anchor to the confirmation email HTML.',
            'In production, use `PublicBaseUrl` instead of `Request.Host` for stable links.',
          ],
          code: `public class ShareLinkService
{
    private readonly string _baseUrl;
    public ShareLinkService(IConfiguration cfg) =>
        _baseUrl = cfg["PublicBaseUrl"] ?? "https://tunmaniresort.com";

    public string BookingUrl(Guid token) =>
        $"{_baseUrl}/p/booking/{token}";

    // A wa.me deep link that pre-fills a message + the share URL.
    public string WhatsAppShare(Guid token, string guestName)
    {
        var url = BookingUrl(token);
        var text = $"Namaskara {guestName}! Your TunMani Resort booking is "
                 + $"confirmed. View it here: {url}";
        return $"https://wa.me/?text={Uri.EscapeDataString(text)}";
    }
}

// --- in the confirmation email HTML body ---
// var url = _share.BookingUrl(booking.PublicToken);
// var html = $@"
//   <p>Dear {booking.GuestName}, your stay is confirmed.</p>
//   <p><a href=""{url}"">View your booking online</a></p>";`,
          pitfalls: [
            '**Hard-coding localhost in the URL.** Links break in production. Fix: use a configured `PublicBaseUrl`.',
            '**Not URL-encoding the WhatsApp text.** Spaces and symbols break the link. Fix: `Uri.EscapeDataString`.',
            '**Putting the raw id in the URL.** Defeats the opaque token. Fix: always use the token.',
            '**Building URLs in three different places.** They drift. Fix: one `ShareLinkService`.',
            '**Relying on Request.Host behind Nginx.** May yield the internal host. Fix: configured base URL or ForwardedHeaders.',
            '**Only attaching the PDF, no live link.** Lost attachment = stuck guest. Fix: include the /p link too.',
          ],
          tryIt:
            'Add `ShareLinkService` and a "Share on WhatsApp" button on the booking detail page. Click it on your phone — WhatsApp should open with a pre-filled message containing the `/p/booking/<token>` link. Send it to yourself and tap the link to confirm the PDF opens. Then verify the same link appears in the confirmation email body.',
          takeaway:
            'Build the share URL from the token via one helper and deliver it through a wa.me deep link and an email link so guests open their document anywhere.',
        },
      ],
    },
    {
      id: 'm8-s4',
      title: 'CRM & Occasions',
      topics: [
        {
          id: 'm8-t12',
          title: 'The CrmContact Model with Consent',
          explain:
            'Model a CRM contact — name, phone, relationship, email, and a marketing opt-in with its consent date — linked back to the booking and customer it came from.',
          analogy:
            'After a grand wedding at TunMani Resort, the manager keeps a little address book: the bride, the groom, the customer who paid, even a few guests who asked about future stays. But he only sends festival greetings to those who said "yes, do contact me" — and he writes the date they agreed beside their name. `CrmContact` is that respectful address book, opt-in and consent date included.',
          theory:
            'A **`CrmContact`** captures a person you may want to stay in touch with. Core fields: `Name`, `Phone`, `Email`, and a **`Relationship`** enum-like value (**bride / groom / customer / guest**) describing who they are to a booking.\n\nMarketing consent is explicit: an **`OptIn` (bool)** flag plus an **`OptInAt` (timestamp)** recording *when* they consented. Never message someone who has not opted in, and keep the date as proof of consent (good practice and increasingly a legal expectation).\n\nProvenance fields tie the contact to its origin: **`SourceBookingId`** (the booking that introduced them) and **`CustomerId`** (if they are a known paying customer). An **`IsActive` (bool)** lets you soft-deactivate a contact without deleting their history.\n\nStore it in a `crm_contacts` table. Because the same person can appear across multiple bookings, decide your identity rule (often phone number) so you update an existing contact rather than duplicating it.',
          whyItMatters:
            'A CRM that records consent and its date is the difference between thoughtful guest relations and spam that annoys people and risks legal trouble. Linking each contact to its source booking and customer turns one-off events into a relationship you can nurture over years.',
          steps: [
            'Create a `crm_contacts` table with name, phone, email, relationship, opt_in, opt_in_at, source_booking_id, customer_id, is_active.',
            'Make `relationship` a constrained text value (bride/groom/customer/guest).',
            'Default `opt_in` to false and leave `opt_in_at` null until they consent.',
            'Add a `CrmContact` C# class mirroring the columns.',
            'Choose phone as the identity key to avoid duplicate contacts.',
            'Index `phone` and `source_booking_id` for lookups.',
          ],
          code: `-- PostgreSQL: the CRM contact table.
CREATE TABLE crm_contacts (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name              text NOT NULL,
    phone             text NOT NULL,
    email             text,
    relationship      text NOT NULL
        CHECK (relationship IN ('bride','groom','customer','guest')),
    opt_in            boolean NOT NULL DEFAULT false,
    opt_in_at         timestamptz,           -- consent timestamp
    source_booking_id bigint REFERENCES hall_bookings(id),
    customer_id       bigint REFERENCES customers(id),
    is_active         boolean NOT NULL DEFAULT true,
    created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ix_crm_contacts_phone ON crm_contacts (phone);
CREATE INDEX ix_crm_contacts_source ON crm_contacts (source_booking_id);`,
          pitfalls: [
            '**Defaulting opt_in to true.** Existence is not consent. Fix: default false; capture consent separately.',
            '**No opt_in_at column.** You cannot prove when consent was given. Fix: store the consent timestamp.',
            '**Hard-deleting contacts.** Loses relationship history. Fix: use the `is_active` flag.',
            '**Duplicating people across bookings.** The same guest appears many times. Fix: pick an identity key (phone).',
            '**Unconstrained relationship values.** Typos like "bridegroom" slip in. Fix: a CHECK constraint.',
            '**Forgetting source_booking_id.** You lose where the contact came from. Fix: record provenance.',
          ],
          tryIt:
            'Create the `crm_contacts` table and write the matching `CrmContact` class. Insert one contact with `opt_in = false`, then update it to `opt_in = true` and set `opt_in_at = now()`. Confirm the consent date is stored. Try inserting a relationship of `\'witness\'` and verify the CHECK constraint rejects it.',
          takeaway:
            'Model a CRM contact with relationship, an explicit opt-in plus consent date, and links back to its source booking and customer.',
        },
        {
          id: 'm8-t13',
          title: 'Auto-Syncing Bride & Groom from a Hall Booking',
          explain:
            'When a wedding-hall booking is created, automatically create or update CRM contacts for the bride, groom, and paying customer.',
          analogy:
            'The moment a wedding is booked at TunMani Resort, the manager already knows three names worth remembering — the bride, the groom, and whoever signed the cheque. Rather than copy them into the address book by hand later (and forget half the time), the booking itself nudges them in. Your `CrmService` does this sync automatically the instant the hall booking is saved.',
          theory:
            'A **`HallBooking`** already carries the people involved — typically a bride name/phone, groom name/phone, and the booking customer. A **`CrmService.SyncFromHallBooking(hall)`** method runs right after a hall booking is saved and **upserts** a `CrmContact` for each.\n\n**Upsert** = insert if new, update if existing. Use the **phone number** as the identity key: if a contact with that phone exists, update its name/relationship/source; otherwise insert a new one. PostgreSQL\'s `INSERT ... ON CONFLICT (phone) DO UPDATE` (with a unique index on phone) does this in one statement.\n\nSet `Relationship` per person (`bride`, `groom`, `customer`), `SourceBookingId` to the hall booking id, and **leave `OptIn` false** — syncing a contact is *not* consent to market to them. Consent is captured separately (next topic).\n\nCall the sync from the hall-booking creation flow (service or controller), after the booking commits. Keep it idempotent so re-saving a booking does not create duplicates.',
          whyItMatters:
            'Manually copying guests into a CRM never happens consistently — the data rots. Auto-syncing at booking time means your guest list builds itself, accurately, while staff just do their normal job. Using phone-based upsert keeps it clean across repeat customers.',
          steps: [
            'Add a unique index on `crm_contacts(phone)` to support upsert.',
            'Write `CrmService.SyncFromHallBooking(HallBooking hall)`.',
            'Upsert a contact for the bride, the groom, and the customer.',
            'Set `relationship` and `source_booking_id`; keep `opt_in = false`.',
            'Use `INSERT ... ON CONFLICT (phone) DO UPDATE` via Dapper.',
            'Call the sync after the hall booking is committed; make it idempotent.',
          ],
          code: `using Dapper;
using Npgsql;

public class CrmService
{
    private readonly string _connStr;
    public CrmService(IConfiguration cfg) =>
        _connStr = cfg.GetConnectionString("Default")!;

    public async Task SyncFromHallBooking(HallBooking hall)
    {
        var people = new (string Name, string Phone, string Rel)[]
        {
            (hall.BrideName,    hall.BridePhone,    "bride"),
            (hall.GroomName,    hall.GroomPhone,    "groom"),
            (hall.CustomerName, hall.CustomerPhone, "customer"),
        };

        const string sql = @"
            INSERT INTO crm_contacts
                (name, phone, relationship, source_booking_id, opt_in)
            VALUES (@Name, @Phone, @Rel, @BookingId, false)
            ON CONFLICT (phone) DO UPDATE
                SET name = EXCLUDED.name,
                    relationship = EXCLUDED.relationship,
                    source_booking_id = EXCLUDED.source_booking_id;";

        await using var db = new NpgsqlConnection(_connStr);
        foreach (var p in people)
        {
            if (string.IsNullOrWhiteSpace(p.Phone)) continue; // skip blanks
            await db.ExecuteAsync(sql, new
            {
                p.Name, p.Phone, Rel = p.Rel, BookingId = hall.Id
            });
        }
    }
}

// --- call it after saving the hall booking ---
// await _hallRepo.SaveAsync(hall);
// await _crm.SyncFromHallBooking(hall);`,
          pitfalls: [
            '**Inserting without ON CONFLICT.** Repeat customers get duplicated. Fix: upsert on a unique phone index.',
            '**Setting opt_in = true during sync.** Treats existence as consent. Fix: keep it false; capture consent separately.',
            '**Syncing blank phones.** Creates junk rows. Fix: skip people with no phone.',
            '**Running the sync before the booking commits.** Orphan source ids. Fix: sync after commit.',
            '**Not idempotent.** Re-saving duplicates contacts. Fix: upsert keyed on phone.',
            '**Forgetting the unique index on phone.** ON CONFLICT errors. Fix: create it first.',
          ],
          tryIt:
            'Add the unique phone index and `SyncFromHallBooking`. Create a wedding-hall booking with a bride, groom, and customer, then call the sync and query `crm_contacts` — three rows with the right relationships and `opt_in = false`. Book the same customer for another event and confirm their contact is updated, not duplicated.',
          takeaway:
            'Auto-upsert bride, groom, and customer contacts from a hall booking by phone, with opt_in left false until consent is given.',
        },
        {
          id: 'm8-t14',
          title: 'Marketing Opt-In & Recording Consent',
          explain:
            'Let a contact opt in to marketing through CrmController, recording both the consent flag and the exact date and time it was given.',
          analogy:
            'Before the TunMani Resort sends a Deepavali greeting or a monsoon-offer message, it asks "may we keep in touch?" and notes the day the guest said yes — like a guest signing the visitor book of their own free will. Opt-in is that signature; `OptInAt` is the date beside it. No signature, no message.',
          theory:
            'Consent must be a **deliberate action**, not a default. A **`CrmController`** exposes an action like `POST /crm/{id}/optin` that sets **`OptIn = true`** and **`OptInAt = DateTime.UtcNow`** for that contact. A matching `optout` action sets `OptIn = false` (you may keep `OptInAt` for the record or clear it).\n\nStore the timestamp in **UTC** to avoid timezone confusion, and surface it in the UI as local time. The flag answers "may we message them?"; the date answers "since when, and can we prove it?".\n\nWhen you later send marketing (birthday wishes, offers), you **only** query contacts `WHERE opt_in = true AND is_active = true`. This single filter is your safeguard against accidentally messaging someone who never agreed.\n\nKeep the opt-in toggle simple in the CRM UI — a switch on the contact detail page that calls the controller — and always show the consent date so staff know it is on record.',
          whyItMatters:
            'Respecting consent is both ethical and increasingly required by law; a recorded opt-in date is your evidence. Filtering every campaign on `opt_in = true` means you can never accidentally spam a guest who simply stayed once and never agreed to messages.',
          steps: [
            'Add `POST /crm/{id}/optin` to `CrmController` calling `CrmService.SetOptIn(id, true)`.',
            'In the service, set `opt_in = true` and `opt_in_at = now()` (UTC).',
            'Add `POST /crm/{id}/optout` setting `opt_in = false`.',
            'Show an opt-in toggle and the consent date on the contact detail page.',
            'In any marketing query, filter `WHERE opt_in = true AND is_active = true`.',
            'Store and compare timestamps in UTC; display in local time.',
          ],
          code: `// CrmService — record consent with its timestamp.
public async Task SetOptIn(long contactId, bool optIn)
{
    const string sql = @"
        UPDATE crm_contacts
           SET opt_in = @OptIn,
               opt_in_at = CASE WHEN @OptIn THEN now() ELSE opt_in_at END
         WHERE id = @Id;";

    await using var db = new NpgsqlConnection(_connStr);
    await db.ExecuteAsync(sql, new { Id = contactId, OptIn = optIn });
}

// CrmController — the opt-in / opt-out endpoints.
[Route("crm")]
public class CrmController : Controller
{
    private readonly CrmService _crm;
    public CrmController(CrmService crm) => _crm = crm;

    [HttpPost("{id:long}/optin")]
    public async Task<IActionResult> OptIn(long id)
    {
        await _crm.SetOptIn(id, true);
        return RedirectToAction("Detail", new { id });
    }

    [HttpPost("{id:long}/optout")]
    public async Task<IActionResult> OptOut(long id)
    {
        await _crm.SetOptIn(id, false);
        return RedirectToAction("Detail", new { id });
    }
}

// Marketing audience query — the one safeguard that matters:
// SELECT * FROM crm_contacts WHERE opt_in = true AND is_active = true;`,
          pitfalls: [
            '**Defaulting opt_in to true.** That is not consent. Fix: default false; require an explicit action.',
            '**Not recording opt_in_at.** No proof of consent. Fix: stamp `now()` when they opt in.',
            '**Storing the date in local time.** Ambiguous across servers. Fix: store UTC, display local.',
            '**Marketing without the opt_in filter.** You spam non-consenters. Fix: always filter `opt_in = true`.',
            '**Hard-deleting on opt-out.** Loses history. Fix: flip the flag, keep the row.',
            '**No opt-out path.** Guests cannot leave. Fix: provide `optout`.',
          ],
          tryIt:
            'Add the opt-in and opt-out endpoints and a toggle on the contact page. Opt a contact in and confirm `opt_in_at` is set to the current UTC time. Run the marketing audience query and verify only opted-in, active contacts appear. Opt the contact out and confirm they drop from that query.',
          takeaway:
            'Record marketing consent as a deliberate opt-in with a UTC timestamp, and filter every campaign on opt_in = true AND is_active = true.',
        },
        {
          id: 'm8-t15',
          title: 'CrmOccasion: Tracking Birthdays & Anniversaries',
          explain:
            'Model special occasions for a contact — birthday, anniversary, or a custom date — including whether they recur yearly, so you can wish them on time.',
          analogy:
            'A thoughtful TunMani Resort host remembers that the bride\'s anniversary falls in the monsoon and a regular guest\'s birthday is in temple-festival season — and sends a warm wish each year. `CrmOccasion` is that memory: it stores the month and day (and optionally the year) of each special date, and a flag for "this comes around every year".',
          theory:
            'A **`CrmOccasion`** belongs to a `CrmContact` (`ContactId`) and records a meaningful date. Fields: a **`Type`** (**birthday / anniversary / custom**), the date parts **`EventMonth`**, **`EventDay`**, and an optional **`EventYear`** (you may know the day and month but not the birth year), an **`IsRecurring`** flag (true for birthdays/anniversaries that come every year), and a **`Label`** for custom occasions (e.g. "First stay anniversary").\n\nStoring **month and day separately** (rather than a single date) makes the "whose occasion is this month?" query trivial and year-independent — exactly what you need for recurring wishes. `EventYear` is optional and used only when the year matters or for calculating "turning N".\n\nStore occasions in a `crm_occasions` table with a foreign key to `crm_contacts`. A contact can have several occasions (a birthday and an anniversary), so it is a one-to-many relationship.\n\nThe `Type` should be constrained to the known values, and `Label` is most useful for the `custom` type where the meaning is not implied by the type.',
          whyItMatters:
            'Remembering a guest\'s anniversary and wishing them is the kind of small touch that turns a one-time wedding venue into the place a family returns to for every celebration. Storing month/day separately makes the upcoming-occasions query simple and reliable.',
          steps: [
            'Create a `crm_occasions` table referencing `crm_contacts(id)`.',
            'Add `type` constrained to birthday/anniversary/custom.',
            'Store `event_month`, `event_day`, and an optional `event_year`.',
            'Add `is_recurring` (true for yearly occasions) and a `label`.',
            'Model a one-to-many: a contact can have several occasions.',
            'Index `(event_month, event_day)` for upcoming-occasion lookups.',
          ],
          code: `-- PostgreSQL: occasions belong to a contact (one-to-many).
CREATE TABLE crm_occasions (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contact_id   bigint NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
    type         text NOT NULL
        CHECK (type IN ('birthday','anniversary','custom')),
    event_month  smallint NOT NULL CHECK (event_month BETWEEN 1 AND 12),
    event_day    smallint NOT NULL CHECK (event_day BETWEEN 1 AND 31),
    event_year   smallint,             -- optional; null when year unknown
    is_recurring boolean NOT NULL DEFAULT true,
    label        text,                 -- used for 'custom' occasions
    created_at   timestamptz NOT NULL DEFAULT now()
);

-- Fast "whose occasion is in this month/day?" lookups.
CREATE INDEX ix_crm_occasions_md
    ON crm_occasions (event_month, event_day);`,
          pitfalls: [
            '**Storing a single full date.** Year-bound dates break recurring matches. Fix: store month and day separately.',
            '**Making event_year required.** Many guests do not share a birth year. Fix: keep it nullable.',
            '**One occasion per contact only.** A guest has a birthday and an anniversary. Fix: one-to-many.',
            '**No recurring flag.** You cannot tell yearly from one-off. Fix: add `is_recurring`.',
            '**Unvalidated month/day.** A day of 45 sneaks in. Fix: CHECK constraints on the ranges.',
            '**No cascade on contact delete.** Orphan occasions linger. Fix: `ON DELETE CASCADE`.',
          ],
          tryIt:
            'Create the `crm_occasions` table. Add a birthday (recurring, no year) and an anniversary (with year) to one contact. Confirm a contact can hold both. Insert a `custom` occasion with a label like "First stay" and verify the type CHECK rejects an unknown type such as `\'festival\'`.',
          takeaway:
            'Model occasions as month/day (plus optional year) with a recurring flag, linked one-to-many to a contact, so yearly wishes are easy to query.',
        },
        {
          id: 'm8-t16',
          title: 'Upcoming-Occasion Wishes via WhatsApp / Email',
          explain:
            'Query the contacts whose birthday or anniversary falls in the next few days and send them a wish — only to opted-in, active contacts.',
          analogy:
            'Each morning the TunMani Resort host glances at the calendar: "Whose special day is coming up this week?" Then he sends a warm Kundapura-style greeting to those who welcomed contact. The upcoming-occasions query is that morning glance, and it only ever looks at the names who signed the visitor book — the opted-in contacts.',
          theory:
            'The core query finds occasions whose **month/day falls within the next N days**, joined to contacts who are **opted in and active**. Because you stored month and day separately, you can match a small window ignoring the year — handling the year-end wrap (December into January) with a small OR condition or by comparing day-of-year.\n\nThe flow: a method `UpcomingOccasions(int days)` returns the due contacts with their occasion type; for each you compose a message ("Happy Birthday, {name}! Warm wishes from TunMani Resort") and send via the **same `EmailService`** or a WhatsApp deep link / Business API.\n\nFilter on **`opt_in = true AND is_active = true`** in the query itself, so a non-consenting guest can never receive a wish even by mistake. This is the **notification idea**: a daily job (a hosted background service or a manual "Send today\'s wishes" admin button) runs the query and sends.\n\nKeep sending **idempotent per day** — track the last sent date or run once daily — so a guest is not wished five times if the job retries. Personalise the message by occasion type and, when `EventYear` is known, you can even say "turning N".',
          whyItMatters:
            'Automated, consent-respecting wishes are a high-warmth, low-effort way to keep guests feeling remembered — the emotional core of repeat business for a wedding venue. Filtering on opt-in in the query guarantees you never accidentally message someone who did not agree.',
          steps: [
            'Write `UpcomingOccasions(int days)` joining occasions to contacts.',
            'Match `event_month`/`event_day` to the next N days, handling the year wrap.',
            'Filter `opt_in = true AND is_active = true` in the SQL.',
            'For each result, compose a message by occasion type.',
            'Send via `EmailService` or a WhatsApp link / Business API.',
            'Run it as a daily job or an admin "Send today\'s wishes" button, idempotent per day.',
          ],
          code: `// Find opted-in contacts with an occasion in the next 'days' days.
public async Task<List<DueWish>> UpcomingOccasions(int days)
{
    // Compare day-of-year so December->January wraps correctly.
    const string sql = @"
        SELECT c.id, c.name, c.phone, c.email, o.type, o.label
        FROM crm_occasions o
        JOIN crm_contacts c ON c.id = o.contact_id
        WHERE c.opt_in = true
          AND c.is_active = true
          AND (
                make_date(EXTRACT(YEAR FROM now())::int, o.event_month, o.event_day)
                    BETWEEN current_date AND current_date + (@Days || ' days')::interval
             OR make_date(EXTRACT(YEAR FROM now())::int + 1, o.event_month, o.event_day)
                    BETWEEN current_date AND current_date + (@Days || ' days')::interval
              );";

    await using var db = new NpgsqlConnection(_connStr);
    return (await db.QueryAsync<DueWish>(sql, new { Days = days })).ToList();
}

// Compose + send a wish (reusing EmailService).
public async Task SendWishes(int days)
{
    foreach (var w in await UpcomingOccasions(days))
    {
        var greeting = w.Type switch
        {
            "birthday"    => $"Happy Birthday, {w.Name}!",
            "anniversary" => $"Happy Anniversary, {w.Name}!",
            _             => $"Warm wishes, {w.Name}!"
        };
        var body = $"<p>{greeting} With love from all of us at TunMani Resort.</p>";
        if (!string.IsNullOrWhiteSpace(w.Email))
            await _email.SendAsync(w.Email, w.Name, "A little note from TunMani Resort", body);
    }
}`,
          pitfalls: [
            '**Ignoring the year-end wrap.** Late-December occasions get missed. Fix: handle the wrap (day-of-year or an OR).',
            '**Forgetting the opt-in filter in the query.** You wish non-consenters. Fix: filter in SQL.',
            '**Sending multiple times per day.** Guests get spammed. Fix: idempotent daily run / track last-sent.',
            '**One generic message for all types.** Feels robotic. Fix: branch on occasion type.',
            '**Matching on full date including year.** Recurring occasions never fire. Fix: match month/day only.',
            '**No way to trigger manually.** Hard to test. Fix: an admin "Send today\'s wishes" button.',
          ],
          tryIt:
            'Implement `UpcomingOccasions(7)` and `SendWishes(7)`. Add an occasion dated to two days from now for an opted-in contact and one for a non-opted-in contact. Run the query — only the opted-in contact should appear. Trigger `SendWishes` and confirm just that one receives the greeting, then verify a non-recurring past date does not fire.',
          takeaway:
            'Match occasions by month/day in a small forward window, filter on opt-in, and send personalised wishes once per day via email or WhatsApp.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm8-p1',
      type: 'Project',
      title: 'GST Invoice PDF + Email-with-Attachment + Public Token Link',
      domain: 'Resort billing & guest communication',
      duration: '3 hours',
      description:
        'Build the full document pipeline for TunMani Resort: a QuestPDF tax invoice with a CGST/SGST breakdown, a MailKit email that sends it as an attachment, and an opaque token link that lets a guest view it without logging in.',
      tools: ['ASP.NET Core MVC', 'C#', 'QuestPDF', 'MailKit', 'PostgreSQL', 'Dapper'],
      blueprint: {
        overview:
          'You will produce one authoritative invoice PDF from QuestPDF and serve it three ways — inline preview, email attachment, and a public /p token link — reusing the same byte[] so every copy is identical.',
        functionalRequirements: [
          '**Tax invoice PDF.** Header with resort identity + GSTIN, a Bill-To block, a line-items table, CGST/SGST breakdown, and a bold grand total.',
          '**Inline & download.** An authenticated action serves the PDF inline and, with `?download=1`, as a file.',
          '**Email with attachment.** A MailKit email sends the same PDF to the guest with a warm HTML cover note.',
          '**Public token link.** A `/p/invoice/{token:guid}/{id:int}` endpoint serves the PDF anonymously.',
          '**Share helper.** Build the share URL and a wa.me WhatsApp link from the token.',
        ],
        technicalImplementation: [
          '**Program.cs.** Set `QuestPDF.Settings.License = LicenseType.Community;` and register `PdfService`, `EmailService`, `ShareLinkService`.',
          '**Services/PdfService.cs.** `TaxInvoice(Invoice)` returning byte[] via shared header/items/footer helpers.',
          '**Services/EmailService.cs.** `SendWithPdfAsync(...)` attaching bytes with `new ContentType("application","pdf")`.',
          '**Controllers/PublicController.cs.** `[AllowAnonymous]`, `/p/invoice/{token:guid}/{id:int}` serving the PDF inline.',
          '**Config.** EmailSettings bound from config with the Gmail app password in user-secrets; a `public_token uuid` column on invoices.',
        ],
        prompts: [
          {
            step: 1,
            label: 'QuestPDF tax invoice',
            outcome: 'A GST invoice PDF returning byte[].',
            prompt:
              'In an ASP.NET Core project, create Services/PdfService.cs using QuestPDF (Community license set in Program.cs). Add byte[] TaxInvoice(Invoice invoice) that builds an A4 document: a header with TunMani Resort name, address, phone and GSTIN plus a right-aligned "TAX INVOICE" title and number, a Bill-To block, a line-items table (description, qty, rate, amount), a totals block with Sub Total, CGST, SGST and a bold Grand Total read from the invoice, and a footer. End with .GeneratePdf().',
          },
          {
            step: 2,
            label: 'Serve inline vs download',
            outcome: 'View in browser or download the invoice.',
            prompt:
              'Add an InvoiceController with [HttpGet("invoices/{id:int}")] that loads the invoice via a Dapper repository, calls PdfService.TaxInvoice, and returns File(bytes, "application/pdf") inline by default, or File(bytes, "application/pdf", "invoice-<no>.pdf") when a download=true query is passed. Return NotFound() if the invoice is missing.',
          },
          {
            step: 3,
            label: 'Email the PDF',
            outcome: 'Guest receives the invoice as an attachment.',
            prompt:
              'Create EmailSettings (Host, Port, SenderName, SenderEmail, AppPassword) bound from config with the app password in user-secrets, and Services/EmailService.cs using MailKit. Add SendWithPdfAsync(toEmail, toName, subject, htmlBody, byte[] pdfBytes, fileName) that builds a MimeMessage, attaches the bytes as application/pdf via BodyBuilder, connects with StartTls on port 587, authenticates with the app password, and sends. Then show controller code that generates the invoice PDF and emails it to the guest.',
          },
          {
            step: 4,
            label: 'Public token link',
            outcome: 'Anonymous guest can view the invoice.',
            prompt:
              'Add a public_token uuid column (default gen_random_uuid, unique index) to the invoices table, a repository GetByTokenAsync(Guid token, int id), and a PublicController with [Route("p")] and [AllowAnonymous]. Add GET /p/invoice/{token:guid}/{id:int} that loads by token, returns NotFound if missing, and otherwise serves the tax invoice PDF inline with File(bytes, "application/pdf").',
          },
          {
            step: 5,
            label: 'WhatsApp share link',
            outcome: 'A one-tap link to the public invoice.',
            prompt:
              'Add a ShareLinkService that reads PublicBaseUrl from config and builds the invoice URL "{baseUrl}/p/invoice/{token}/{id}" and a wa.me WhatsApp deep link with a URL-encoded message containing that link. Show how to render a "Share on WhatsApp" button on the invoice detail page and how to include the same link in the confirmation email body.',
          },
        ],
      },
    },
    {
      id: 'm8-p2',
      type: 'Project',
      title: 'CRM Contacts + Occasions Synced from Hall Bookings',
      domain: 'Guest relationship management',
      duration: '3 hours',
      description:
        'Build the CRM: auto-create bride/groom/customer contacts from each wedding-hall booking, capture marketing consent with a date, track birthdays and anniversaries, and send opted-in guests timely wishes.',
      tools: ['ASP.NET Core MVC', 'C#', 'PostgreSQL', 'Dapper', 'MailKit'],
      blueprint: {
        overview:
          'You will turn one-time wedding bookings into a lasting, consent-respecting relationship: contacts sync themselves from hall bookings, occasions are tracked by month/day, and a daily job wishes opted-in guests.',
        functionalRequirements: [
          '**CrmContact.** Name, phone, relationship (bride/groom/customer/guest), email, opt-in with consent date, source booking, customer, active flag.',
          '**Auto-sync.** Creating a hall booking upserts bride, groom, and customer contacts by phone, opt_in left false.',
          '**Consent.** Opt-in / opt-out endpoints record opt_in and a UTC opt_in_at.',
          '**CrmOccasion.** Birthday / anniversary / custom occasions with month, day, optional year, recurring flag, and label.',
          '**Wishes.** An upcoming-occasions query and a send routine that messages only opted-in, active contacts.',
        ],
        technicalImplementation: [
          '**Schema.** crm_contacts (with CHECK on relationship, unique phone) and crm_occasions (FK to contacts, CHECK on type, index on month/day).',
          '**Services/CrmService.cs.** SyncFromHallBooking using INSERT ... ON CONFLICT (phone) DO UPDATE; SetOptIn stamping now(); UpcomingOccasions and SendWishes.',
          '**Controllers/CrmController.cs.** Contact list/detail, optin/optout actions, occasion add.',
          '**Integration.** Call SyncFromHallBooking after a hall booking commits.',
          '**Wishes job.** A daily hosted service or admin button that runs SendWishes, reusing EmailService.',
        ],
        prompts: [
          {
            step: 1,
            label: 'CRM schema',
            outcome: 'Contacts and occasions tables.',
            prompt:
              'Write PostgreSQL DDL for crm_contacts (id, name, phone, email, relationship with CHECK in bride/groom/customer/guest, opt_in bool default false, opt_in_at timestamptz, source_booking_id FK to hall_bookings, customer_id FK, is_active bool default true) with a unique index on phone, and crm_occasions (id, contact_id FK with ON DELETE CASCADE, type CHECK in birthday/anniversary/custom, event_month, event_day, event_year nullable, is_recurring bool, label) with an index on (event_month, event_day).',
          },
          {
            step: 2,
            label: 'Auto-sync from hall booking',
            outcome: 'Contacts build themselves.',
            prompt:
              'Create Services/CrmService.cs with SyncFromHallBooking(HallBooking hall) that upserts a CrmContact for the bride, groom, and customer using Dapper and INSERT INTO crm_contacts ... ON CONFLICT (phone) DO UPDATE, setting the right relationship and source_booking_id, skipping blank phones, and keeping opt_in false. Show where to call it after a hall booking is saved.',
          },
          {
            step: 3,
            label: 'Consent capture',
            outcome: 'Opt-in recorded with a date.',
            prompt:
              'Add SetOptIn(long contactId, bool optIn) to CrmService that updates opt_in and stamps opt_in_at = now() (UTC) when opting in, and a CrmController with POST /crm/{id}/optin and /crm/{id}/optout. Also show the marketing audience query that selects only opt_in = true AND is_active = true.',
          },
          {
            step: 4,
            label: 'Occasions',
            outcome: 'Track birthdays and anniversaries.',
            prompt:
              'Add a CrmOccasion model and CrmService methods to add an occasion (type, event_month, event_day, optional event_year, is_recurring, label) to a contact, plus a CrmController action and a simple form to record one from the contact detail page. Validate month 1-12 and day 1-31.',
          },
          {
            step: 5,
            label: 'Send wishes',
            outcome: 'Opted-in guests get timely greetings.',
            prompt:
              'Add UpcomingOccasions(int days) to CrmService that joins crm_occasions to crm_contacts, matches event_month/event_day to the next N days (handling the December-to-January wrap), and filters opt_in = true AND is_active = true. Add SendWishes(int days) that composes a message per occasion type and sends it via EmailService. Then show a hosted background service or an admin "Send today\'s wishes" button that runs it once daily, idempotently.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm8-q1',
      q: 'Where and how often must the QuestPDF Community licence be set?',
      options: [
        'Exactly once at startup in Program.cs, before any PDF is generated',
        'On every request, just before generating each PDF',
        'In appsettings.json as a connection string',
        'It does not need to be set at all',
      ],
      answer: 0,
    },
    {
      id: 'm8-q2',
      q: 'For an intra-state resort invoice, how is the GST shown on the PDF?',
      options: [
        'Split into CGST and SGST, each half the GST rate',
        'As a single IGST line at the full rate',
        'Hidden, since GST does not apply to resorts',
        'Added only to the room charge, not the total',
      ],
      answer: 0,
    },
    {
      id: 'm8-q3',
      q: 'How do you return a PDF for inline preview in the browser from an MVC controller?',
      options: [
        'File(bytes, "application/pdf") with no download filename',
        'File(bytes, "application/pdf", "invoice.pdf") with a filename',
        'Return the byte[] directly as a string',
        'Redirect to a static .pdf file on disk',
      ],
      answer: 0,
    },
    {
      id: 'm8-q4',
      q: 'When sending a Gmail email with MailKit on port 587, what should you use?',
      options: [
        'SecureSocketOptions.StartTls and a Google app password',
        'SSL-on-connect on port 587 with your normal login password',
        'No encryption and no authentication',
        'The legacy System.Net.Mail.SmtpClient with OAuth only',
      ],
      answer: 0,
    },
    {
      id: 'm8-q5',
      q: 'Why are the public /p PDF endpoints keyed on a random GUID PublicToken instead of the database id?',
      options: [
        'A random token is unguessable and non-enumerable, so links cannot be scraped',
        'GUIDs render faster in the browser than integers',
        'The database cannot index integer ids',
        'It lets guests edit each other\'s bookings safely',
      ],
      answer: 0,
    },
    {
      id: 'm8-q6',
      q: 'Before sending birthday or anniversary wishes, which contacts should the query include?',
      options: [
        'Only contacts where opt_in = true AND is_active = true',
        'Every contact ever synced from a booking',
        'All contacts, since wishes are not marketing',
        'Only contacts whose phone is blank',
      ],
      answer: 0,
    },
  ],
}
