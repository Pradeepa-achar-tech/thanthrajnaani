// Module M6 — Invoicing, GST & Payments (TunMani Resort)
// Teach the money side of the app: the Invoice model, Indian GST math,
// the checkout-to-invoice lifecycle, and recording & reconciling payments.

export const m6 = {
  id: 'm6',
  title: 'Invoicing, GST & Payments',
  hours: 9,
  color: 'from-yellow-500/20 to-yellow-700/10',
  accent: 'yellow',
  description:
    'Turn a finished stay into money: build the Invoice and InvoiceItem model, compute Indian GST (CGST + SGST) safely with decimals, generate an invoice at checkout, and record and reconcile payments against it.',
  sections: [
    {
      id: 'm6-s1',
      title: 'The Invoice Model',
      topics: [
        {
          id: 'm6-t1',
          title: 'The Invoice entity',
          explain:
            'An `Invoice` is the official money document for a stay — it carries the bill-to details, the GST breakdown, and a running `Status` from draft to paid.',
          analogy:
            'When a family checks out of TunMani Resort in Byndoor after a wedding weekend, the front desk hands them one printed bill on resort letterhead — their name, the company if the booking was corporate, the room charges, the tax, and the grand total. The `Invoice` row in PostgreSQL is that printed bill captured as data, so the same numbers can be shown on screen, downloaded as a PDF, and counted in the day’s revenue.',
          theory:
            'An **`Invoice`** is the legal, numbered record of what a guest owes. It belongs to a **`BookingId`** and optionally a **`BookingRoomId`** (when you bill one room separately). It stores who it is **billed to** — `BilledToName`, `CompanyName`, `GstNumber` — and the full money breakdown: `Subtotal`, `DiscountAmount`, `TaxableAmount`, the GST rates and amounts (`CgstRate`, `SgstRate`, `CgstAmount`, `SgstAmount`), and the final `TotalAmount`.\n\nTwo fields drive its life: **`Status`** (`draft` → `issued` → `paid`) and **`IssuedAt`** (the timestamp it became official). A draft can still be edited; an issued invoice is frozen.\n\nWe model this as a plain C# class (a **POCO**) that Dapper maps to the `invoices` table. Money fields are **`decimal`**, never `double`, because money must be exact.',
          whyItMatters:
            'The invoice is the single source of truth for what a guest pays and what the resort earns, so its shape decides whether your accounting is trustworthy. Get the fields right once and every downstream feature — GST, payments, reports — has a solid base. Get it wrong and every rupee figure in the app is suspect.',
          steps: [
            'Create `Models/Invoice.cs` as a POCO with one property per column.',
            'Use `decimal` for every money field (`Subtotal`, `TotalAmount`, etc.).',
            'Add `BookingId` (required) and a nullable `BookingRoomId` for per-room invoices.',
            'Add the bill-to fields: `BilledToName`, `CompanyName`, `GstNumber`.',
            'Add `Status` (string: `draft`/`issued`/`paid`) and a nullable `IssuedAt`.',
            'Create the matching `invoices` table in PostgreSQL with a `numeric(12,2)` type for money.',
          ],
          code: `// Models/Invoice.cs
public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = "";   // e.g. TM/2026/0042
    public int BookingId { get; set; }
    public int? BookingRoomId { get; set; }           // null = whole-booking invoice

    // Bill-to details (printed on the invoice header)
    public string BilledToName { get; set; } = "";
    public string? CompanyName { get; set; }
    public string? GstNumber { get; set; }            // guest's GSTIN, if any

    // Money — always decimal, never double
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxableAmount { get; set; }        // Subtotal - DiscountAmount
    public decimal CgstRate { get; set; }             // e.g. 0.06 for 6%
    public decimal SgstRate { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal TotalAmount { get; set; }

    public string Status { get; set; } = "draft";     // draft | issued | paid
    public DateTime? IssuedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}`,
          pitfalls: [
            '**Using `double` for money.** Floating-point rounds unpredictably; always use `decimal` (and `numeric` in PostgreSQL) for currency.',
            '**Making `BookingRoomId` non-nullable.** A booking-level invoice has no single room, so it must be nullable.',
            '**Forgetting `IssuedAt`.** Without the issue timestamp you cannot prove when the invoice became official for tax records.',
            '**Storing the GST rate as 6 instead of 0.06.** Pick one convention (decimal fraction) and document it, or your tax math is off by 100×.',
          ],
          tryIt:
            'Write the `Invoice` POCO and a `CREATE TABLE invoices` statement using `numeric(12,2)` for the money columns. Insert one row by hand in psql and read it back with a quick Dapper query.',
          takeaway:
            'The `Invoice` entity captures the whole official bill — bill-to, GST breakdown, total, and a draft→issued→paid status — with `decimal` money.',
        },
        {
          id: 'm6-t2',
          title: 'InvoiceItem line items',
          explain:
            'An `InvoiceItem` is one printed line on the bill — a room night, a menu add-on, or a decoration — with a `Quantity`, `UnitPrice`, and computed `Amount`.',
          analogy:
            'Look at the TunMani Resort bill closely and you see it itemised the way a Kundapura grocery receipt is: "Deluxe Sea-View Room × 2 nights", "Lunch Thali × 40 plates", "Mandap Flower Decoration × 1". Each `InvoiceItem` is one of those lines, telling the guest exactly what they are paying for instead of one mysterious lump sum.',
          theory:
            'An invoice without lines is just a number nobody trusts. **`InvoiceItem`** breaks the bill into readable rows. Each carries a **`Description`**, an **`ItemType`** (`room`, `menu`, `decoration`, or `other`), a **`Quantity`**, a **`UnitPrice`**, and an **`Amount`** (= `Quantity × UnitPrice`).\n\nThe `ItemType` lets us group, colour, or filter lines — for example showing all `room` charges together. The `Amount` is the line total; we let PostgreSQL compute it with a **generated column** (next section) so it can never disagree with quantity × price.\n\nOne `Invoice` has **many** `InvoiceItem` rows (a one-to-many). When we sum every line’s `Amount` we get the invoice **`Subtotal`** — the pre-discount, pre-tax figure.',
          whyItMatters:
            'Guests dispute lump sums but accept itemised bills, so line items are what make an invoice defensible at the front desk. They also make the `Subtotal` auditable — you can always trace the total back to the individual room nights and add-ons that produced it.',
          steps: [
            'Create `Models/InvoiceItem.cs` with `InvoiceId`, `Description`, `ItemType`, `Quantity`, `UnitPrice`, `Amount`.',
            'Use a string `ItemType` constrained to `room`/`menu`/`decoration`/`other`.',
            'Make `Amount` a generated column so `Quantity × UnitPrice` is computed by the database.',
            'Add a foreign key from `invoice_items.invoice_id` to `invoices.id`.',
            'Write a Dapper query that loads an invoice and its items together.',
            'Sum the items’ `Amount` to derive the invoice `Subtotal`.',
          ],
          code: `// Models/InvoiceItem.cs
public class InvoiceItem
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public string Description { get; set; } = "";
    public string ItemType { get; set; } = "other"; // room | menu | decoration | other
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }              // = Quantity * UnitPrice (DB-generated)
}

/* PostgreSQL: Amount is a generated column so it can never drift.
CREATE TABLE invoice_items (
    id          serial PRIMARY KEY,
    invoice_id  int NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description text NOT NULL,
    item_type   text NOT NULL DEFAULT 'other',
    quantity    numeric(10,2) NOT NULL,
    unit_price  numeric(12,2) NOT NULL,
    amount      numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);
*/`,
          pitfalls: [
            '**Storing `Amount` as a plain column you set in C#.** Use a generated column so it always equals quantity × price and cannot be tampered with.',
            '**Letting `ItemType` be free text.** Constrain it to the four known values (a `CHECK` constraint or enum) so reports can group reliably.',
            '**Forgetting `ON DELETE CASCADE`.** Deleting a draft invoice should remove its items, not orphan them.',
            '**Summing items in three different places.** Compute `Subtotal` from items in one service method and reuse it everywhere.',
          ],
          tryIt:
            'Create the `invoice_items` table with the generated `amount` column. Insert two rooms and one menu line for an invoice, then run `SELECT sum(amount) FROM invoice_items WHERE invoice_id = 1` and confirm it matches the subtotal you expect.',
          takeaway:
            'Each `InvoiceItem` is one typed, itemised line (`Quantity × UnitPrice = Amount`); summing the lines gives the invoice subtotal.',
        },
        {
          id: 'm6-t3',
          title: 'Sequential invoice numbers',
          explain:
            'Every invoice needs a unique, gap-free, human-readable `InvoiceNumber` like `TM/2026/0042`, generated safely even when two checkouts happen at once.',
          analogy:
            'The TunMani Resort accounts office keeps one bound bill book — bill 41 is torn off, the next guest gets 42, then 43. Nobody is ever handed two bills with the same number, because there is only one book and one pen. In code that single book is a database **sequence**, and every checkout tears the next number from it.',
          theory:
            'Tax law expects invoice numbers to be **sequential and unique**. We must never compute the next number by counting rows (`COUNT(*) + 1`) — two simultaneous checkouts would both read the same count and produce duplicate numbers.\n\nInstead we use a **PostgreSQL sequence**, which hands out a fresh integer atomically with `nextval()`. We then format it into a readable string: a `TM/` prefix, the year, and a zero-padded counter — `TM/2026/0042`.\n\nWe wrap the `nextval()` call and the invoice insert in the **same database transaction** so a failed insert never wastes — or, worse, reuses — a number. This is the server-side cousin of the transactional counter you would build on any platform: one source of truth, atomic increments.',
          whyItMatters:
            'Duplicate or missing invoice numbers are an audit nightmare and can fail a GST inspection. A database sequence is the only safe way to hand out sequential numbers when several front-desk staff bill at the same moment, which is exactly what a busy resort does on a wedding weekend.',
          steps: [
            'Create a sequence: `CREATE SEQUENCE invoice_number_seq;`.',
            'In `InvoiceService`, call `SELECT nextval(\'invoice_number_seq\')` via Dapper.',
            'Format it as `TM/{year}/{number:D4}` (zero-padded to four digits).',
            'Do the `nextval` and the invoice `INSERT` inside one transaction.',
            'Add a `UNIQUE` constraint on `invoices.invoice_number` as a safety net.',
            'Never derive the number from `COUNT(*)` of existing invoices.',
          ],
          code: `// Services/InvoiceService.cs
public async Task<string> NextInvoiceNumberAsync(IDbConnection db, IDbTransaction tx)
{
    // Atomic: the sequence hands every caller a different number.
    long n = await db.ExecuteScalarAsync<long>(
        "SELECT nextval('invoice_number_seq')", transaction: tx);

    return $"TM/{DateTime.UtcNow:yyyy}/{n:D4}";   // e.g. TM/2026/0042
}

// Usage inside a checkout transaction:
using var tx = db.BeginTransaction();
var number = await NextInvoiceNumberAsync(db, tx);
await db.ExecuteAsync(
    @"INSERT INTO invoices (invoice_number, booking_id, status, created_at)
      VALUES (@number, @bookingId, 'draft', now())",
    new { number, bookingId }, tx);
tx.Commit();`,
          pitfalls: [
            '**Using `COUNT(*) + 1` for the next number.** It races under load and produces duplicates; always use a sequence.',
            '**Calling `nextval` outside the insert transaction.** Keep them together so a rolled-back insert does not silently consume a number you then reuse.',
            '**Forgetting the `UNIQUE` constraint.** It is your last line of defence against a duplicate slipping through.',
            '**Hard-coding the year.** Build the year into the format string at runtime so January rollover just works.',
          ],
          tryIt:
            'Create `invoice_number_seq`, then call `nextval` three times in psql and confirm you get 1, 2, 3. Write `NextInvoiceNumberAsync` and verify it returns `TM/2026/0001` on the first call.',
          takeaway:
            'A PostgreSQL sequence formatted as `TM/year/NNNN` gives every invoice a unique, sequential number, safe under concurrent checkouts.',
        },
        {
          id: 'm6-t4',
          title: 'Multiple invoices per booking',
          explain:
            'One booking can produce several invoices — typically one per room — so the model is a one-booking-to-many-invoices relationship, not one-to-one.',
          analogy:
            'A single group booking at TunMani Resort might be three families sharing a wedding block but each wanting their own bill for their own room. The front desk happily prints three separate invoices against one booking. The data must allow that: one `booking`, many `invoices`, each optionally tied to a `BookingRoomId`.',
          theory:
            'It is tempting to assume one booking equals one bill, but resorts bill flexibly. A corporate group may want **one consolidated invoice**; three families sharing a booking may each want a **per-room invoice**.\n\nWe support both by keeping the relationship **one booking → many invoices**. When `BookingRoomId` is **null**, the invoice covers the whole booking. When it is **set**, the invoice covers just that one room.\n\nHall (event) bookings follow a **parallel** structure: `HallBookingInvoice` and `HallBookingInvoiceItem` mirror the room versions, because a wedding hall has its own line items (hall rent, decoration, catering) and its own GST rate. Keeping the two families parallel — not forced into one table — keeps each clean while sharing the same mental model.',
          whyItMatters:
            'Real front-desk billing is messier than one-bill-per-stay, and a rigid one-to-one model forces staff into workarounds that corrupt your data. Modelling many invoices per booking from the start means split bills and consolidated bills are both first-class, not hacks.',
          steps: [
            'Keep `invoices.booking_id` as a many-side foreign key (no `UNIQUE` on it).',
            'Use a null `BookingRoomId` for a whole-booking invoice, a set value for per-room.',
            'Create parallel `hall_booking_invoices` and `hall_booking_invoice_items` tables.',
            'In `InvoiceService`, expose `GetInvoicesForBooking(bookingId)` returning a list.',
            'When billing per room, loop the booking’s rooms and create one invoice each.',
            'Decide consolidated-vs-split at checkout based on the guest’s request.',
          ],
          code: `// One booking can have many invoices.
public async Task<IReadOnlyList<Invoice>> GetInvoicesForBookingAsync(int bookingId)
{
    var sql = @"SELECT * FROM invoices
                WHERE booking_id = @bookingId
                ORDER BY created_at";
    return (await _db.QueryAsync<Invoice>(sql, new { bookingId })).ToList();
}

/* Hall bookings have a PARALLEL set of tables:
   - hall_booking_invoices      (mirrors invoices, GST rate 18%)
   - hall_booking_invoice_items (mirrors invoice_items)
   Keeping them separate lets rooms (12%) and halls (18%)
   each stay clean instead of cramming both into one table. */`,
          pitfalls: [
            '**Putting a `UNIQUE` constraint on `booking_id`.** That forces one invoice per booking and blocks split bills.',
            '**Cramming hall and room invoices into one table.** Their line types and GST rates differ; keep the parallel tables.',
            '**Assuming `BookingRoomId` is always set.** A consolidated invoice has it null; handle both cases when rendering.',
            '**Generating per-room invoices without asking.** Let the guest choose split vs consolidated at checkout, then create accordingly.',
          ],
          tryIt:
            'For one booking with two rooms, create two per-room invoices (each with its `BookingRoomId` set). Then write `GetInvoicesForBookingAsync` and confirm it returns both.',
          takeaway:
            'A booking maps to many invoices — whole-booking or per-room — and hall bookings get a parallel `HallBookingInvoice` family.',
        },
      ],
    },
    {
      id: 'm6-s2',
      title: 'GST Tax Math',
      topics: [
        {
          id: 'm6-t5',
          title: 'CGST + SGST: how Indian GST splits',
          explain:
            'Indian GST on a local resort bill splits into two equal halves — **CGST** (central) and **SGST** (state) — so 12% on rooms is 6% + 6%.',
          analogy:
            'Think of the tax on a TunMani Resort room as a coconut split cleanly in two: one half goes to Delhi (CGST), the other half stays in Karnataka (SGST). The guest pays the whole coconut — 12% — but on the bill you must show the two halves separately, exactly as the GST council requires for an intra-state sale.',
          theory:
            'For a sale **within Karnataka** (the resort and guest in the same state), GST is **CGST + SGST**, split equally. The total rate depends on the service:\n\n- **Rooms** — 12% total → **6% CGST + 6% SGST**\n- **Halls / event services** — 18% total → **9% CGST + 9% SGST**\n\nWe store the two **rates** (`CgstRate`, `SgstRate`) and the two **amounts** (`CgstAmount`, `SgstAmount`) separately on the invoice, because the printed bill and the GST return both demand the split shown explicitly.\n\n(If the guest were from another state you would charge **IGST** instead — a single combined rate. TunMani Resort’s guests are overwhelmingly local, so this course uses the CGST+SGST intra-state case.)',
          whyItMatters:
            'A GST invoice that shows only a single combined tax line is non-compliant and can be rejected during filing. Storing CGST and SGST separately from day one means your invoices are tax-office-ready and your monthly GST return is a simple sum of the right columns.',
          steps: [
            'Define rate constants: rooms `0.06 + 0.06`, halls `0.09 + 0.09`.',
            'Store `CgstRate` and `SgstRate` on each invoice (not just the total rate).',
            'Compute and store `CgstAmount` and `SgstAmount` as separate fields.',
            'Show both lines on the printed/preview invoice, not one merged tax line.',
            'Use the hall rates (9% + 9%) on `HallBookingInvoice`.',
            'Note IGST is the inter-state alternative, out of scope here.',
          ],
          code: `// Services/GstRates.cs
public static class GstRates
{
    // Rooms: 12% total = 6% + 6%
    public const decimal RoomCgst = 0.06m;
    public const decimal RoomSgst = 0.06m;

    // Halls / events: 18% total = 9% + 9%
    public const decimal HallCgst = 0.09m;
    public const decimal HallSgst = 0.09m;
}

// On the invoice we keep both halves explicit:
invoice.CgstRate = GstRates.RoomCgst;   // 0.06
invoice.SgstRate = GstRates.RoomSgst;   // 0.06
// (CgstAmount and SgstAmount are computed next topic)`,
          pitfalls: [
            '**Showing one merged 12% tax line.** GST law requires CGST and SGST shown separately on the invoice.',
            '**Using room rates for halls.** Halls are 18% (9%+9%), not 12%; pick the rate by service type.',
            '**Hard-coding 12% as a single number.** Store the two rates so the split is always available for the return.',
            '**Forgetting the inter-state case exists.** It is out of scope here, but never assume CGST+SGST applies to an out-of-state guest in production.',
          ],
          tryIt:
            'Create the `GstRates` constants and, on paper, write out the two tax lines for a ₹10,000 room subtotal (CGST 6% and SGST 6%). Confirm they sum to ₹1,200.',
          takeaway:
            'Intra-state GST splits equally into CGST + SGST — 12% on rooms, 18% on halls — and both halves are stored and shown separately.',
        },
        {
          id: 'm6-t6',
          title: 'The GST formula: discount before tax',
          explain:
            'The order is fixed: `TaxableAmount = Subtotal − DiscountAmount`, then tax is computed on the taxable amount, and `TotalAmount = TaxableAmount + CGST + SGST`.',
          analogy:
            'At the TunMani Resort desk the manager first knocks off the festive discount, *then* the government tax is calculated on the reduced price — you are not taxed on money you never paid. It is like bargaining for fish at the Kundapura market: the vendor lowers the price first, and only then is anything added on top. Discount before tax, always.',
          theory:
            'The sequence matters and is legally fixed:\n\n1. **`TaxableAmount = Subtotal − DiscountAmount`** — the discount is applied **before** tax, so the guest is not taxed on the discounted-away portion.\n2. **`CgstAmount = TaxableAmount × CgstRate`** and **`SgstAmount = TaxableAmount × SgstRate`**.\n3. **`TotalAmount = TaxableAmount + CgstAmount + SgstAmount`**.\n\nGetting the order wrong — taxing before discount — overcharges the guest and misstates the GST you owe.\n\nWe centralise this in a single `ComputeTotals` method so the same formula runs at checkout, on preview, and on save. One formula, one place, no drift.',
          whyItMatters:
            'The discount-before-tax rule is both a fairness and a compliance issue: tax computed on the full subtotal inflates the guest’s bill and the GST you remit. Encoding the exact sequence once means every invoice in the system is computed identically and correctly.',
          steps: [
            'Compute `Subtotal` as the sum of all `InvoiceItem.Amount`.',
            'Compute `TaxableAmount = Subtotal − DiscountAmount`.',
            'Compute `CgstAmount = TaxableAmount × CgstRate` and the SGST equivalent.',
            'Compute `TotalAmount = TaxableAmount + CgstAmount + SgstAmount`.',
            'Round each money result to 2 decimal places (next topic).',
            'Put it all in one `ComputeTotals(invoice)` method reused everywhere.',
          ],
          code: `// Services/InvoiceCalculator.cs
public static void ComputeTotals(Invoice inv)
{
    // 1. Discount is applied BEFORE tax.
    inv.TaxableAmount = inv.Subtotal - inv.DiscountAmount;

    // 2. Tax on the taxable (post-discount) amount.
    inv.CgstAmount = Math.Round(inv.TaxableAmount * inv.CgstRate, 2);
    inv.SgstAmount = Math.Round(inv.TaxableAmount * inv.SgstRate, 2);

    // 3. Grand total.
    inv.TotalAmount = inv.TaxableAmount + inv.CgstAmount + inv.SgstAmount;
}

// Example: Subtotal 10000, Discount 1000, room rates 6%+6%
//   TaxableAmount = 9000
//   CgstAmount    = 540, SgstAmount = 540
//   TotalAmount   = 10080`,
          pitfalls: [
            '**Taxing before applying the discount.** That overcharges the guest; the order is discount first, then tax.',
            '**Discounting the total instead of the subtotal.** Subtract the discount from the pre-tax subtotal, not the GST-inclusive total.',
            '**Duplicating the formula in the controller and the view.** Centralise in `ComputeTotals` so it cannot drift.',
            '**Forgetting to recompute after editing items.** Any change to lines or discount must re-run `ComputeTotals`.',
          ],
          tryIt:
            'Run `ComputeTotals` for a ₹10,000 subtotal with a ₹1,000 discount and room GST. Confirm `TaxableAmount` is ₹9,000 and `TotalAmount` is ₹10,080.',
          takeaway:
            'Discount comes before tax: taxable = subtotal − discount, tax = taxable × rate, total = taxable + CGST + SGST — all in one method.',
        },
        {
          id: 'm6-t7',
          title: 'Safe decimal math & rounding',
          explain:
            'Use C# `decimal` for every rupee and round each tax amount to 2 places with `Math.Round`, so totals are exact and never show ₹540.0000001.',
          analogy:
            'The TunMani Resort cashier counts money to the paisa, not in fuzzy fractions — ₹540.00, exactly. Using `double` for money is like measuring rice with a cupped hand instead of a scale: close, but it drifts. `decimal` is the scale; `Math.Round(..., 2)` is wiping the pan clean to two decimal places every time.',
          theory:
            '`double` and `float` are **binary** floating-point — they cannot represent 0.1 exactly, so sums of money slowly drift (you get 540.00000000001). For currency we always use **`decimal`**, which is base-10 and exact for the fractions money actually uses.\n\nEven with `decimal`, multiplication can produce more than two decimal places (`9000 × 0.06 = 540.00`, but `8333.33 × 0.06 = 499.9998`). So we **round each tax amount to 2 places** with `Math.Round(value, 2)` — and importantly we round the **amounts**, then add, rather than adding unrounded values and rounding once, so the printed lines always sum to the printed total.\n\nIn PostgreSQL the matching type is **`numeric(12,2)`**, which stores exactly two decimals. The C# `decimal` and SQL `numeric` pair maps cleanly through Dapper with no precision loss.',
          whyItMatters:
            'Off-by-a-paisa errors look small but make an invoice fail to balance — the lines do not add up to the total, and an auditor will notice. Using `decimal` end to end and rounding amounts consistently is what keeps every invoice internally consistent to the paisa.',
          steps: [
            'Use `decimal` (suffix literals with `m`, e.g. `0.06m`) for all money in C#.',
            'Use `numeric(12,2)` for money columns in PostgreSQL.',
            'Round each `CgstAmount`/`SgstAmount` with `Math.Round(value, 2)`.',
            'Add the rounded amounts to get the total, not the unrounded ones.',
            'Use `MidpointRounding.AwayFromZero` if your accounting requires it.',
            'Verify the line amounts sum exactly to `TotalAmount`.',
          ],
          code: `decimal taxable = 8333.33m;
decimal rate = 0.06m;

// Round the AMOUNT, then add — so printed lines sum to the printed total.
decimal cgst = Math.Round(taxable * rate, 2, MidpointRounding.AwayFromZero); // 500.00
decimal sgst = Math.Round(taxable * rate, 2, MidpointRounding.AwayFromZero); // 500.00
decimal total = taxable + cgst + sgst;                                       // 9333.33

// NEVER do this for money:
// double t = 8333.33 * 0.06;  // 499.99980000... drifts`,
          pitfalls: [
            '**Using `double`/`float` for money.** They drift; use `decimal` in C# and `numeric` in PostgreSQL.',
            '**Forgetting the `m` suffix.** `0.06` is a `double` literal; write `0.06m` to keep it `decimal`.',
            '**Rounding the total instead of the lines.** Round each amount, then sum, so the displayed lines reconcile to the displayed total.',
            '**Mismatched precision in the DB.** A `numeric(12,2)` column with code that rounds to 4 places will silently truncate on insert.',
          ],
          tryIt:
            'Compute 6% CGST on a ₹8,333.33 taxable amount with and without `Math.Round(.., 2)`. Note the unrounded `499.9998` versus the clean `500.00`, and confirm `decimal` (not `double`) is used throughout.',
          takeaway:
            'Money is `decimal` in C# and `numeric(12,2)` in PostgreSQL; round each tax amount to 2 places so lines always sum to the total.',
        },
        {
          id: 'm6-t8',
          title: 'Weighted-average GST across mixed rooms',
          explain:
            'When one booking mixes rooms taxed at different rates, compute a single **weighted-average** GST rate so one invoice can still show one CGST and one SGST line.',
          analogy:
            'Imagine a TunMani Resort booking where most rooms are standard 12% but a premium suite carries a different rate. Rather than print a confusing two-tax-table bill, the accounts office blends them by how much each room costs — like averaging the price of mixed fish in one basket by weight. The pricier-taxed room pulls the average toward its rate in proportion to its value.',
          theory:
            'Usually every room in a booking shares the same rate, and the math is simple. But if a booking contains rooms at **different GST rates**, a single invoice still needs **one** CGST line and **one** SGST line.\n\nThe fix is a **weighted average**, weighted by each room’s taxable amount:\n\n`effectiveRate = Σ(roomTaxable × roomRate) / Σ(roomTaxable)`\n\nA room contributing more rupees pulls the blended rate toward its own rate. We compute this for CGST and SGST, store the blended rates on the invoice, then apply the standard formula. The alternative — splitting into separate invoices per rate — is also valid and sometimes cleaner, but the weighted average lets you keep one consolidated invoice.',
          whyItMatters:
            'Mixed-rate bookings are rare but real, and a naive single-rate assumption silently miscalculates tax on them. Knowing the weighted-average technique means your consolidated invoices stay correct even in the awkward edge cases, and it teaches a money-math pattern that recurs throughout billing.',
          steps: [
            'Collect each room’s taxable amount and its CGST/SGST rate.',
            'Compute `Σ(taxable × rate)` and `Σ(taxable)` for CGST.',
            'Divide to get the weighted CGST rate; repeat for SGST.',
            'Store the blended rates on the consolidated invoice.',
            'Run `ComputeTotals` with the blended rates as usual.',
            'Alternatively, split into one invoice per rate if that is cleaner.',
          ],
          code: `// Services/InvoiceCalculator.cs
public static decimal WeightedRate(
    IEnumerable<(decimal taxable, decimal rate)> rooms)
{
    decimal weighted = 0m, totalBase = 0m;
    foreach (var (taxable, rate) in rooms)
    {
        weighted  += taxable * rate;   // each room votes by its rupees
        totalBase += taxable;
    }
    if (totalBase == 0m) return 0m;    // guard against divide-by-zero
    return Math.Round(weighted / totalBase, 4);  // keep rate precision
}

// Example: 9000 @ 6% and 3000 @ 9%
//   weighted  = 9000*0.06 + 3000*0.09 = 540 + 270 = 810
//   totalBase = 12000
//   effective = 810 / 12000 = 0.0675  (6.75%)`,
          pitfalls: [
            '**Averaging the rates ignoring amounts.** A plain (6% + 9%) / 2 is wrong; weight by each room’s taxable value.',
            '**Dividing by zero.** Guard against a zero total base before dividing.',
            '**Rounding the blended rate to 2 places.** Keep more precision (e.g. 4 places) on the rate, and round the final amounts.',
            '**Forgetting per-invoice splits are an option.** If the mix is large, separate invoices per rate may be clearer than blending.',
          ],
          tryIt:
            'Compute the weighted CGST rate for a booking of ₹9,000 taxable at 6% and ₹3,000 taxable at 9%. Confirm the blended rate is 6.75%.',
          takeaway:
            'Mixed-rate bookings use a value-weighted average rate so one consolidated invoice can still show a single CGST and SGST line.',
        },
        {
          id: 'm6-t9',
          title: 'PostgreSQL generated columns for totals',
          explain:
            'Let PostgreSQL compute `TaxableAmount` and line `Amount` as **generated columns** so they are always derived from their inputs and can never be set wrong.',
          analogy:
            'Instead of asking each clerk at TunMani Resort to do the subtraction by hand (and risk a slip), the bill book has a column that fills itself the moment you write the subtotal and discount. A **generated column** is that self-filling column: the database does the arithmetic, every time, with no chance of a typo.',
          theory:
            'A **generated column** is a column whose value PostgreSQL computes from other columns in the same row — you cannot write to it directly. `GENERATED ALWAYS AS (expression) STORED` persists the computed value.\n\nGreat fits here:\n\n- **`invoice_items.amount`** = `quantity * unit_price`\n- **`invoices.taxable_amount`** = `subtotal - discount_amount`\n\nBecause the database enforces the formula, a buggy C# call can never push an inconsistent `amount`. The tax **amounts** (`CgstAmount`, `SgstAmount`) are usually computed in C# because we want explicit rounding control, but the simpler derivations belong in the schema.\n\nWith Dapper you simply **omit** generated columns from your `INSERT` — PostgreSQL fills them — and read them back on `SELECT` like any other column.',
          whyItMatters:
            'Pushing arithmetic into the database means two independent code paths can never write disagreeing totals — the schema is the single enforcer. It is defence in depth: even a bug in your service layer cannot produce a line whose amount does not equal quantity × price.',
          steps: [
            'Add `amount numeric(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED` to `invoice_items`.',
            'Add `taxable_amount numeric(12,2) GENERATED ALWAYS AS (subtotal - discount_amount) STORED` to `invoices`.',
            'In Dapper `INSERT`s, do **not** include generated columns in the column list.',
            'Read generated columns back normally on `SELECT`.',
            'Keep tax-amount rounding in C# where you control `MidpointRounding`.',
            'Test by inserting and confirming the generated values match.',
          ],
          code: `-- invoices: taxable_amount fills itself.
CREATE TABLE invoices (
    id              serial PRIMARY KEY,
    invoice_number  text NOT NULL UNIQUE,
    booking_id      int  NOT NULL,
    subtotal        numeric(12,2) NOT NULL DEFAULT 0,
    discount_amount numeric(12,2) NOT NULL DEFAULT 0,
    taxable_amount  numeric(12,2)
        GENERATED ALWAYS AS (subtotal - discount_amount) STORED,
    cgst_amount     numeric(12,2) NOT NULL DEFAULT 0,  -- rounded in C#
    sgst_amount     numeric(12,2) NOT NULL DEFAULT 0,
    total_amount    numeric(12,2) NOT NULL DEFAULT 0,
    status          text NOT NULL DEFAULT 'draft',
    issued_at       timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- Dapper INSERT omits taxable_amount; PostgreSQL computes it.
-- INSERT INTO invoices (invoice_number, booking_id, subtotal, discount_amount)
-- VALUES (@number, @bookingId, @subtotal, @discount);`,
          pitfalls: [
            '**Trying to INSERT into a generated column.** PostgreSQL rejects it; omit it from the column list.',
            '**Using `VIRTUAL` expecting persistence.** Only `STORED` is supported for persisted generated columns in PostgreSQL.',
            '**Referencing another generated column in the expression.** A generated column can only reference plain columns in the same row.',
            '**Putting rounded tax amounts in a generated column.** Keep tax-amount rounding in C# for explicit `MidpointRounding` control.',
          ],
          tryIt:
            'Recreate the `invoices` table with the generated `taxable_amount`. Insert a row with subtotal 10000 and discount 1000, then `SELECT taxable_amount` and confirm it reads 9000 without you setting it.',
          takeaway:
            'Generated columns let PostgreSQL compute line `amount` and invoice `taxable_amount` automatically, so derived totals can never be set wrong.',
        },
      ],
    },
    {
      id: 'm6-s3',
      title: 'Invoice Lifecycle (Checkout)',
      topics: [
        {
          id: 'm6-t10',
          title: 'CheckoutController & CheckoutService',
          explain:
            'At checkout, `CheckoutController` takes the request and `CheckoutService` assembles an invoice from the booking, its rooms, and any add-ons.',
          analogy:
            'When the guests at TunMani Resort say "we are leaving," the front-desk clerk (`CheckoutController`) does not do the maths himself — he hands the booking file to the accountant (`CheckoutService`), who gathers the room nights, the catering, the decorations, totals it all, and produces the draft bill. The controller greets and routes; the service does the careful work.',
          theory:
            'We keep the **controller thin and the service fat**. `CheckoutController` exposes the endpoint (e.g. `POST /Checkout/{bookingId}`), validates the request, and calls `CheckoutService`. `CheckoutService` does the real work:\n\n1. Load the **booking**, its **booking_rooms**, and **add-ons** (menus, decorations).\n2. Build one `InvoiceItem` per charge (room nights, each add-on).\n3. Sum to `Subtotal`, apply any discount, set the GST rates by service type.\n4. Run `ComputeTotals`, assign a sequential `InvoiceNumber`.\n5. Insert the invoice and its items **inside one transaction**.\n\nThe service returns the new **draft** invoice. This separation keeps the checkout logic testable and reusable — the same `CheckoutService` can be called from a controller, a background job, or a test.',
          whyItMatters:
            'Checkout is where bookings turn into money, so it must be reliable and all-or-nothing. Putting the assembly in a transactional service means an invoice is either created completely — header and every line — or not at all, never half-written.',
          steps: [
            'Create `CheckoutController` with `POST /Checkout/{bookingId}`.',
            'Validate the booking exists and is not already invoiced (or allow split).',
            'In `CheckoutService.GenerateInvoiceAsync`, load booking + rooms + add-ons.',
            'Build `InvoiceItem`s for room nights and each add-on.',
            'Compute totals, assign the invoice number, set status `draft`.',
            'Insert invoice and items in one transaction and return the draft.',
          ],
          code: `// Controllers/CheckoutController.cs
[HttpPost("/Checkout/{bookingId:int}")]
public async Task<IActionResult> Checkout(int bookingId)
{
    var invoice = await _checkout.GenerateInvoiceAsync(bookingId);
    return RedirectToAction("Preview", "Invoice", new { id = invoice.Id });
}

// Services/CheckoutService.cs
public async Task<Invoice> GenerateInvoiceAsync(int bookingId)
{
    using var db = _factory.Create();
    using var tx = db.BeginTransaction();

    var booking = await LoadBookingAsync(db, tx, bookingId);
    var items   = await BuildLineItemsAsync(db, tx, booking); // rooms + add-ons

    var inv = new Invoice {
        BookingId = bookingId,
        BilledToName = booking.GuestName,
        Subtotal = items.Sum(i => i.Amount),
        DiscountAmount = booking.Discount,
        CgstRate = GstRates.RoomCgst, SgstRate = GstRates.RoomSgst,
        Status = "draft"
    };
    InvoiceCalculator.ComputeTotals(inv);
    inv.InvoiceNumber = await NextInvoiceNumberAsync(db, tx);

    await InsertInvoiceWithItemsAsync(db, tx, inv, items);
    tx.Commit();
    return inv;
}`,
          pitfalls: [
            '**Putting business logic in the controller.** Keep the controller thin; the assembly belongs in `CheckoutService`.',
            '**Inserting the invoice and items in separate transactions.** Wrap them together so you never get a header with no lines.',
            '**Forgetting add-ons.** Load menus and decorations too, not just room nights, or the bill is short.',
            '**Hard-coding room GST for a hall checkout.** Pick the rate by booking type (room vs hall).',
          ],
          tryIt:
            'Write `GenerateInvoiceAsync` for a booking with two room nights and one menu add-on. Run checkout and confirm a draft invoice appears with three line items and a correct total.',
          takeaway:
            'A thin `CheckoutController` calls a fat, transactional `CheckoutService` that assembles a complete draft invoice from booking, rooms, and add-ons.',
        },
        {
          id: 'm6-t11',
          title: 'The status workflow: draft → issued → paid',
          explain:
            'An invoice moves through three states — **draft** (editable), **issued** (frozen, official), **paid** (settled) — and `/Invoice/{id}/Issue` performs the draft→issued transition.',
          analogy:
            'A TunMani Resort bill starts as a pencil draft the clerk can still correct, becomes an ink-stamped official bill once issued to the guest, and finally gets a "PAID" stamp when the money lands. You never erase ink, and you never un-stamp "PAID" — each step is a one-way door.',
          theory:
            `The **\`Status\`** field encodes a small state machine:\n\n- **\`draft\`** — being assembled; items and discount can still change.\n- **\`issued\`** — frozen and official; \`IssuedAt\` is stamped; no more edits.\n- **\`paid\`** — fully settled by payments (set when payments cover the total).\n\nThe key transition is **draft → issued**, exposed as \`POST /Invoice/{id}/Issue\`. Issuing recomputes totals one last time, sets \`Status = 'issued'\` and \`IssuedAt = now()\`, and **locks** the invoice against further edits.\n\nWe enforce **valid transitions only**: you cannot edit an issued invoice, and you cannot mark an invoice paid before it is issued. Encoding the allowed moves in one place stops illegal jumps like draft → paid.`,
          whyItMatters:
            'Without a status workflow, staff could edit a bill the guest already received, or mark money received that was never collected. The draft→issued→paid machine makes the invoice’s lifecycle explicit and irreversible at the right points, which is what keeps your books honest.',
          steps: [
            'Add `POST /Invoice/{id}/Issue` to `InvoiceController`.',
            'In the service, allow Issue only when current status is `draft`.',
            'On issue: recompute totals, set status `issued`, stamp `IssuedAt = now()`.',
            'Reject edits to any invoice whose status is not `draft`.',
            'Set status `paid` from the payment flow when payments cover the total.',
            'Centralise the allowed transitions in one `CanTransition` check.',
          ],
          code: `// Services/InvoiceService.cs
public async Task IssueAsync(int invoiceId)
{
    var inv = await GetAsync(invoiceId);
    if (inv.Status != "draft")
        throw new InvalidOperationException("Only a draft invoice can be issued.");

    InvoiceCalculator.ComputeTotals(inv);   // final recompute
    await _db.ExecuteAsync(
        @"UPDATE invoices
          SET status = 'issued', issued_at = now(),
              total_amount = @TotalAmount
          WHERE id = @Id AND status = 'draft'",
        inv);
}

// Controllers/InvoiceController.cs
[HttpPost("/Invoice/{id:int}/Issue")]
public async Task<IActionResult> Issue(int id)
{
    await _invoices.IssueAsync(id);
    return RedirectToAction(nameof(Preview), new { id });
}`,
          pitfalls: [
            '**Allowing edits to an issued invoice.** Once issued it is official; corrections need a credit note or a new invoice, not an edit.',
            '**Skipping draft and jumping to paid.** Enforce the order; an invoice must be issued before it can be paid.',
            '**Not guarding the UPDATE with `status = \'draft\'`.** Add it to the `WHERE` so a concurrent issue cannot double-fire.',
            '**Forgetting to stamp `IssuedAt`.** The issue timestamp is required for tax records.',
          ],
          tryIt:
            'Create a draft invoice, call `/Invoice/{id}/Issue`, and confirm `status` becomes `issued` with `issued_at` set. Then try issuing it again and confirm it is rejected.',
          takeaway:
            'Invoices follow a one-way draft→issued→paid machine; `/Invoice/{id}/Issue` freezes the bill and stamps `IssuedAt`.',
        },
        {
          id: 'm6-t12',
          title: 'InvoiceController: preview, list & download',
          explain:
            '`InvoiceController` shows a single invoice (`Preview`), lists invoices for a booking (`List`), and serves a downloadable copy (`Download`).',
          analogy:
            'The TunMani Resort accounts desk can do three things with a bill: show it to the guest on screen, flip through the file of all bills for a booking, and print a copy to hand over. `InvoiceController` is that desk — `Preview` shows one, `List` flips the file, `Download` prints the copy.',
          theory:
            'The read side of invoicing lives in `InvoiceController`:\n\n- **`GET /Invoice/{id}/Preview`** — loads the invoice with its items and renders a Razor view (`Preview.cshtml`) showing the header, the itemised lines, the CGST/SGST split, and the total.\n- **`GET /Booking/{bookingId}/Invoices`** — lists every invoice for a booking with status badges.\n- **`GET /Invoice/{id}/Download`** — returns the invoice as a file (HTML or PDF) via a `FileResult`.\n\nThe **Razor view** is where the money math becomes a human document. We pass an `InvoiceViewModel` (invoice + items) to the view and let `.cshtml` format the rupees, render the two tax lines, and print the "record payment" button. Keeping the controller focused on loading-and-rendering keeps the maths in the service where it belongs.',
          whyItMatters:
            'The preview is what the guest actually sees and the download is what they keep, so these read views are the public face of all your billing logic. A clean, correct preview turns the invisible GST math into a document a guest and an auditor both trust.',
          steps: [
            'Add `GET /Invoice/{id}/Preview` loading invoice + items into a view model.',
            'Build `Preview.cshtml` showing header, lines, CGST/SGST, and total.',
            'Add `GET /Booking/{bookingId}/Invoices` listing invoices with status badges.',
            'Add `GET /Invoice/{id}/Download` returning a `FileResult`.',
            'Format rupees and dates in the Razor view, not the controller.',
            'Show the "record payment" button only on issued invoices.',
          ],
          code: `// Controllers/InvoiceController.cs
[HttpGet("/Invoice/{id:int}/Preview")]
public async Task<IActionResult> Preview(int id)
{
    var vm = await _invoices.GetViewModelAsync(id); // invoice + items
    if (vm is null) return NotFound();
    return View(vm);
}

[HttpGet("/Invoice/{id:int}/Download")]
public async Task<IActionResult> Download(int id)
{
    var bytes = await _invoices.RenderPdfAsync(id);
    return File(bytes, "application/pdf", $"invoice-{id}.pdf");
}`,
          pitfalls: [
            '**Computing totals in the Razor view.** The view formats; the service computes. Never re-derive money in `.cshtml`.',
            '**Returning a 200 for a missing invoice.** Guard with `NotFound()` when the id does not exist.',
            '**Showing "record payment" on a draft.** Only issued invoices can take payments; hide the button otherwise.',
            '**Streaming the file without a filename.** Pass a sensible download filename so guests get `invoice-42.pdf`, not `download`.',
          ],
          tryIt:
            'Build `Preview.cshtml` for one invoice showing the itemised lines and the CGST/SGST split. Open `/Invoice/1/Preview` and confirm the two tax lines sum to the total shown.',
          takeaway:
            '`InvoiceController` handles the read side — preview one, list per booking, download a copy — while the service keeps the money math.',
        },
        {
          id: 'm6-t13',
          title: 'The record-payment modal',
          explain:
            'On an issued invoice, a "Record Payment" modal lets staff enter an amount, mode, and reference, posting to the payment flow without leaving the preview.',
          analogy:
            'When a TunMani Resort guest pays at checkout, the clerk does not walk to another room — a small slip pops up right there on the bill: "How much? Cash or UPI? UTR number?" The record-payment modal is that pop-up slip, capturing the payment against the invoice the clerk is already looking at.',
          theory:
            'A **modal** keeps the clerk in context. On the issued-invoice preview we add a "Record Payment" button that opens a small Razor partial / Bootstrap modal containing a form: **amount**, **payment mode** (`cash`/`UPI`/`bank`), **reference number** (UTR for bank/UPI), and optional **notes**.\n\nSubmitting **POSTs** to the payment endpoint (`POST /Payment` — built in the next section), which records a `Payment` row linked to this invoice and re-checks whether the invoice is now fully paid. On success we redirect back to the preview, where the payment summary updates.\n\nThe modal is deliberately small — it captures exactly the `Payment` fields and nothing more. The heavy lifting (recording, reconciling, flipping status to `paid`) happens server-side in `PaymentService`.',
          whyItMatters:
            'Payment capture has to be fast and low-friction at a busy checkout, and a modal on the invoice keeps the clerk’s eyes on the bill they are settling. It also funnels every payment through one validated endpoint, so no payment is ever recorded without an amount, mode, and link to its invoice.',
          steps: [
            'Add a "Record Payment" button on the issued-invoice preview.',
            'Build a Razor partial modal with amount, mode, reference, and notes fields.',
            'Pre-fill the invoice id (and booking id) as hidden fields.',
            'POST the form to `/Payment` (built in the Payments section).',
            'On success, redirect back to `Preview` so the summary refreshes.',
            'Show the button only when `Status == "issued"` and a balance remains.',
          ],
          code: `@* Views/Invoice/_RecordPaymentModal.cshtml *@
<form asp-controller="Payment" asp-action="Record" method="post">
    <input type="hidden" name="InvoiceId" value="@Model.Id" />
    <input type="hidden" name="BookingId" value="@Model.BookingId" />

    <label>Amount</label>
    <input name="Amount" type="number" step="0.01" required />

    <label>Mode</label>
    <select name="PaymentMode">
        <option value="cash">Cash</option>
        <option value="UPI">UPI</option>
        <option value="bank">Bank</option>
    </select>

    <label>Reference (UTR)</label>
    <input name="ReferenceNumber" />

    <button type="submit">Record Payment</button>
</form>`,
          pitfalls: [
            '**Letting the modal compute or change totals.** It only captures a payment; the invoice total is fixed once issued.',
            '**Allowing payment on a draft.** Gate the button behind `Status == "issued"`.',
            '**Skipping the reference for UPI/bank.** Require a UTR for non-cash modes so payments can be reconciled.',
            '**Not refreshing after submit.** Redirect back to the preview so the updated summary and remaining balance show.',
          ],
          tryIt:
            'Add the record-payment modal to the invoice preview with amount, mode, and reference fields. Submit a cash payment and confirm it POSTs to `/Payment` and returns you to the refreshed preview.',
          takeaway:
            'A small "Record Payment" modal on the issued invoice captures amount, mode, and reference, then POSTs to the payment flow in one step.',
        },
      ],
    },
    {
      id: 'm6-s4',
      title: 'Payments & Reconciliation',
      topics: [
        {
          id: 'm6-t14',
          title: 'The Payment entity',
          explain:
            'A `Payment` records money received — `Amount`, `PaymentMode`, `ReferenceNumber` (UTR), `PaidAt` — linked to a `BookingId` and an optional `InvoiceId`.',
          analogy:
            'Every rupee that reaches the TunMani Resort till gets a receipt stub: how much, paid how (cash, UPI, bank), the UTR if it was a transfer, and when. The `Payment` row is that receipt stub stored in PostgreSQL — proof, on the record, that the money actually arrived.',
          theory:
            'A **`Payment`** is the record of money **received**, separate from the invoice that asks for it. It carries:\n\n- **`BookingId`** (always) and **`InvoiceId`** (optional — null for an advance taken before any invoice exists).\n- **`Amount`** (`decimal`).\n- **`PaymentMode`** — `cash`, `UPI`, or `bank`.\n- **`ReferenceNumber`** — the UTR / transaction id for non-cash modes.\n- **`PaidAt`** and optional **`Notes`**.\n\nKeeping payments in their own table (not as a field on the invoice) lets **many payments** settle **one invoice** (a part-payment then the balance), and lets an **advance** exist with no invoice yet. Hall bookings have a parallel **`HallBookingPayment`** with a **`PaymentType`** (`balance`/`extras`) to distinguish the main settlement from extra charges.',
          whyItMatters:
            'Money received and money owed are two different facts, and conflating them is how POS systems lose track of part-payments and advances. A dedicated `Payment` table makes every receipt an auditable record and supports the real-world flow of deposits, instalments, and final settlement.',
          steps: [
            'Create `Models/Payment.cs` with the fields above.',
            'Make `BookingId` required and `InvoiceId` nullable.',
            'Use `decimal` for `Amount` and a string `PaymentMode`.',
            'Store `ReferenceNumber` for UPI/bank; allow null for cash.',
            'Create the `payments` table with foreign keys to booking and invoice.',
            'Add a parallel `hall_booking_payments` table with a `PaymentType` column.',
          ],
          code: `// Models/Payment.cs
public class Payment
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public int? InvoiceId { get; set; }        // null = advance, no invoice yet
    public decimal Amount { get; set; }
    public string PaymentMode { get; set; } = "cash"; // cash | UPI | bank
    public string? ReferenceNumber { get; set; }      // UTR for non-cash
    public DateTime PaidAt { get; set; }
    public string? Notes { get; set; }
}

/* Hall bookings: parallel table with a payment type.
CREATE TABLE hall_booking_payments (
    id               serial PRIMARY KEY,
    hall_booking_id  int NOT NULL,
    invoice_id       int,
    amount           numeric(12,2) NOT NULL,
    payment_mode     text NOT NULL,
    payment_type     text NOT NULL,   -- 'balance' | 'extras'
    reference_number text,
    paid_at          timestamptz NOT NULL DEFAULT now()
);
*/`,
          pitfalls: [
            '**Storing the paid amount on the invoice instead of a payments table.** One invoice can have several payments; use a separate table.',
            '**Making `InvoiceId` non-nullable.** An advance is taken before any invoice exists, so it must be nullable.',
            '**Skipping the reference for transfers.** Always capture the UTR for UPI/bank so payments reconcile to bank statements.',
            '**Forgetting `PaidAt`.** The receipt time matters for daily collection reports.',
          ],
          tryIt:
            'Create the `payments` table and the `Payment` POCO. Insert one cash payment (no `InvoiceId`) as an advance and one UPI payment with a UTR linked to an invoice, then read both back.',
          takeaway:
            'A `Payment` records received money — amount, mode, UTR, time — tied to a booking and optionally an invoice, with advances allowed (null invoice).',
        },
        {
          id: 'm6-t15',
          title: 'PaymentController & PaymentService: recording a payment',
          explain:
            '`PaymentController` accepts the record-payment POST and `PaymentService` validates it, inserts the `Payment`, and re-checks whether the invoice is now fully paid.',
          analogy:
            'The clerk at TunMani Resort takes the cash and the accountant files the receipt — and then immediately checks the bill: "Is this fully paid now, or is there still a balance?" `PaymentController` takes the money in; `PaymentService` files it and updates whether the invoice can be stamped "PAID".',
          theory:
            'Recording a payment is more than an insert. `PaymentController` exposes `POST /Payment/Record`, binds the form to a `Payment`, and calls `PaymentService.RecordAsync`. The service:\n\n1. **Validates** — amount > 0, mode is known, UTR present for non-cash.\n2. **Inserts** the `Payment` row with `PaidAt = now()`.\n3. **Reconciles** — sums all payments for the invoice and, if they cover `TotalAmount`, flips the invoice `Status` to **`paid`**.\n\nSteps 2 and 3 run in **one transaction** so a payment and the resulting status change are atomic. The service returns the updated summary so the preview can show the new balance. The validation lives here, in the service, so every caller — modal, API, import — gets the same rules.',
          whyItMatters:
            'A payment that records but never updates the invoice status leaves a paid bill looking unpaid, and an unvalidated payment can record ₹0 or a transfer with no UTR. Doing record-and-reconcile in one transactional service keeps the invoice status and the payment ledger perfectly in step.',
          steps: [
            'Add `POST /Payment/Record` binding the form to a `Payment`.',
            'In `PaymentService.RecordAsync`, validate amount and mode/reference.',
            'Insert the `Payment` with `PaidAt = now()`.',
            'Sum payments for the invoice; if ≥ `TotalAmount`, set status `paid`.',
            'Run the insert and status update in one transaction.',
            'Return the refreshed summary and redirect back to the preview.',
          ],
          code: `// Services/PaymentService.cs
public async Task RecordAsync(Payment p)
{
    if (p.Amount <= 0m) throw new ArgumentException("Amount must be positive.");
    if (p.PaymentMode != "cash" && string.IsNullOrWhiteSpace(p.ReferenceNumber))
        throw new ArgumentException("UTR/reference required for non-cash payments.");

    using var db = _factory.Create();
    using var tx = db.BeginTransaction();

    await db.ExecuteAsync(
        @"INSERT INTO payments
            (booking_id, invoice_id, amount, payment_mode, reference_number, paid_at)
          VALUES (@BookingId, @InvoiceId, @Amount, @PaymentMode, @ReferenceNumber, now())",
        p, tx);

    if (p.InvoiceId is int invId)
    {
        var paid  = await db.ExecuteScalarAsync<decimal>(
            "SELECT coalesce(sum(amount),0) FROM payments WHERE invoice_id=@invId",
            new { invId }, tx);
        var total = await db.ExecuteScalarAsync<decimal>(
            "SELECT total_amount FROM invoices WHERE id=@invId", new { invId }, tx);
        if (paid >= total)
            await db.ExecuteAsync(
                "UPDATE invoices SET status='paid' WHERE id=@invId", new { invId }, tx);
    }
    tx.Commit();
}`,
          pitfalls: [
            '**Inserting the payment but not re-checking status.** Reconcile after every payment, or paid invoices stay marked unpaid.',
            '**Validating in the controller only.** Put the rules in the service so every caller is protected.',
            '**Two separate transactions for insert and status update.** Keep them atomic so they cannot disagree.',
            '**Allowing a negative or zero amount.** Reject `Amount <= 0` before inserting.',
          ],
          tryIt:
            'Record two part-payments against an issued invoice that together equal its total. Confirm the first leaves status `issued` and the second flips it to `paid`.',
          takeaway:
            '`PaymentService.RecordAsync` validates, inserts, and reconciles in one transaction, flipping the invoice to `paid` when payments cover the total.',
        },
        {
          id: 'm6-t16',
          title: 'Advance payments before an invoice',
          explain:
            'A guest can pay an advance/deposit when booking — before any invoice exists — so the `Payment` is recorded with a `BookingId` but a null `InvoiceId`.',
          analogy:
            'To hold the sea-view block at TunMani Resort for a December wedding, the family pays ₹20,000 months ahead — long before any bill is printed. That deposit is real money the resort must track, even though there is no invoice yet. We record it against the booking with no invoice attached, and credit it later when the final bill is made.',
          theory:
            'Resorts take **advances** (deposits) to confirm a booking. At that moment there is **no invoice** — the stay has not happened. So we record the `Payment` with the **`BookingId` set and `InvoiceId` null**.\n\nLater, at checkout, when the invoice is generated, the advance is **credited** toward it: the outstanding balance is `invoice.TotalAmount − (advances + invoice-linked payments)`. We do **not** retroactively rewrite the advance’s `InvoiceId` unless we deliberately allocate it; instead the booking-level summary nets all payments (linked or not) against the booking’s invoices.\n\nThis is exactly why `InvoiceId` is nullable. An advance is money received against a **booking**, and the invoice is just one later artifact of that booking.',
          whyItMatters:
            'Deposits are how resorts secure revenue, and losing track of an advance means double-charging a guest who already paid. Allowing invoice-less payments models the real cash flow — money in first, bill later — and keeps the booking’s true balance accurate at every stage.',
          steps: [
            'When taking a deposit, create a `Payment` with `InvoiceId = null`.',
            'Tag it in `Notes` (e.g. "Advance/deposit") for clarity.',
            'At checkout, compute the balance as invoice total minus all booking payments.',
            'Show advances in the booking-level payment summary.',
            'Optionally allocate an advance to a specific invoice if the guest asks.',
            'Never reject a payment just because no invoice exists yet.',
          ],
          code: `// Recording an advance at booking time (no invoice exists yet):
var advance = new Payment {
    BookingId = bookingId,
    InvoiceId = null,                 // advance — no invoice yet
    Amount = 20000m,
    PaymentMode = "UPI",
    ReferenceNumber = "UTR2026XYZ",
    Notes = "Advance/deposit to hold sea-view block"
};
await _payments.RecordAsync(advance);

// Later, the booking balance nets ALL payments against the invoice total:
// outstanding = invoice.TotalAmount
//             - SUM(payments.amount WHERE booking_id = booking AND
//                   (invoice_id = invoice.Id OR invoice_id IS NULL))`,
          pitfalls: [
            '**Forcing an invoice before accepting a deposit.** Advances happen first; `InvoiceId` must be allowed to be null.',
            '**Forgetting to credit the advance at checkout.** Net advances into the balance, or the guest pays twice.',
            '**Double-counting an allocated advance.** If you set an advance’s `InvoiceId`, do not also count it as an unlinked booking payment.',
            '**Losing the advance in reports.** Include null-invoice payments in the booking-level collection summary.',
          ],
          tryIt:
            'Record a ₹20,000 advance with `InvoiceId = null`. Later create a ₹30,000 invoice for the same booking and confirm the outstanding balance computes to ₹10,000.',
          takeaway:
            'Advances are payments with a null `InvoiceId`, recorded against the booking and credited toward the invoice total at checkout.',
        },
        {
          id: 'm6-t17',
          title: 'The payment summary: collected, pending, outstanding',
          explain:
            'A booking’s payment summary shows three numbers: **collected** (sum of payments), **billed** (sum of issued invoices), and **outstanding** (billed − collected).',
          analogy:
            'The TunMani Resort manager wants one glance to know where a booking stands: how much money has come in, how much has been billed, and how much is still owed. The payment summary is that one-glance board — green for fully collected, red for an outstanding balance still to chase.',
          theory:
            'For each booking we derive a small summary:\n\n- **Collected** = `SUM(payments.amount)` for the booking (including advances).\n- **Billed** = `SUM(total_amount)` of the booking’s **issued** invoices.\n- **Outstanding** = `Billed − Collected` (clamped at zero; a negative means an unallocated advance / credit).\n\nWe compute these in `PaymentService.GetSummaryAsync` with one or two aggregate queries, returning a small summary object the view renders. The summary drives UI state: an **outstanding > 0** shows a red "balance due" badge and keeps the "Record Payment" button visible; **outstanding ≤ 0** shows a green "settled" badge.\n\nBecause the numbers are **derived**, never stored, they cannot drift — every page load recomputes them from the payments and invoices tables.',
          whyItMatters:
            'Front-desk staff and managers make decisions — chase a balance, release a room, give a receipt — based on these three numbers, so they must always be live and correct. Deriving them from the source tables on every read guarantees the summary matches reality to the paisa.',
          steps: [
            'Write an aggregate query for `collected = SUM(payments.amount)` per booking.',
            'Write one for `billed = SUM(total_amount)` of issued invoices.',
            'Compute `outstanding = billed − collected`.',
            'Return a `PaymentSummary` DTO from `PaymentService.GetSummaryAsync`.',
            'Render the three numbers with a status badge in the view.',
            'Show "Record Payment" only while outstanding > 0.',
          ],
          code: `// Services/PaymentService.cs
public async Task<PaymentSummary> GetSummaryAsync(int bookingId)
{
    var collected = await _db.ExecuteScalarAsync<decimal>(
        "SELECT coalesce(sum(amount),0) FROM payments WHERE booking_id=@bookingId",
        new { bookingId });

    var billed = await _db.ExecuteScalarAsync<decimal>(
        @"SELECT coalesce(sum(total_amount),0) FROM invoices
          WHERE booking_id=@bookingId AND status IN ('issued','paid')",
        new { bookingId });

    return new PaymentSummary {
        Collected   = collected,
        Billed      = billed,
        Outstanding = Math.Max(0m, billed - collected)  // clamp at zero
    };
}

public record PaymentSummary {
    public decimal Collected { get; init; }
    public decimal Billed { get; init; }
    public decimal Outstanding { get; init; }
}`,
          pitfalls: [
            '**Storing the summary numbers.** Derive them on every read so they cannot go stale.',
            '**Counting draft invoices in "billed".** Only issued/paid invoices are real liabilities; exclude drafts.',
            '**Letting outstanding go negative silently.** Clamp at zero and surface the credit/advance separately.',
            '**Forgetting advances in "collected".** Include null-invoice payments so the booking balance is whole.',
          ],
          tryIt:
            'For a booking with a ₹30,000 issued invoice and ₹20,000 of payments, write `GetSummaryAsync` and confirm it returns collected ₹20,000, billed ₹30,000, outstanding ₹10,000.',
          takeaway:
            'The payment summary derives collected, billed, and outstanding from the payments and invoices tables, driving the balance-due badge.',
        },
        {
          id: 'm6-t18',
          title: 'Reconciling payments against invoices',
          explain:
            'Reconciliation matches recorded payments to the invoices they settle, confirming each invoice is fully covered before its status becomes `paid`.',
          analogy:
            'At month-end the TunMani Resort accountant lays the receipts beside the bills and ticks them off: this ₹15,000 UPI settles that wedding invoice, these two cash receipts cover that room bill. Reconciliation is that ticking-off — making sure every bill has matching money and flagging any that do not.',
          theory:
            '**Reconciliation** is matching the **money in** (payments) to the **money owed** (invoices). For each issued invoice we sum its linked payments and compare to its `TotalAmount`:\n\n- **paid in full** (`sum ≥ total`) → status `paid`.\n- **part-paid** (`0 < sum < total`) → still `issued`, balance shown.\n- **unpaid** (`sum = 0`) → `issued`, full balance due.\n\nUnlinked payments (advances) are netted at the **booking** level, then optionally **allocated** to specific invoices. The reconciliation routine — run on every payment and available as a report — is what keeps the `Status` column truthful and surfaces mismatches (e.g. an overpayment, or a payment recorded against the wrong booking).\n\nThe key technique is the **left-join aggregate**: invoices LEFT JOIN their payments, grouped, so even invoices with zero payments appear in the report.',
          whyItMatters:
            'Reconciliation is where billing meets accounting reality — it catches overpayments, misapplied receipts, and invoices wrongly marked paid. A system that reconciles automatically on each payment, and offers a report to spot-check, is one a resort owner can actually trust with their money.',
          steps: [
            'For each issued invoice, sum its linked payments.',
            'Compare the sum to `TotalAmount` to classify paid / part / unpaid.',
            'Flip to `paid` only when the sum covers the total.',
            'Net unlinked advances at the booking level.',
            'Build a reconciliation report with a LEFT JOIN so zero-payment invoices show.',
            'Flag overpayments and payments on the wrong booking for review.',
          ],
          code: `-- Reconciliation report: every invoice, with what has been paid.
SELECT i.id,
       i.invoice_number,
       i.total_amount,
       coalesce(sum(p.amount), 0)              AS paid,
       i.total_amount - coalesce(sum(p.amount),0) AS balance,
       CASE
         WHEN coalesce(sum(p.amount),0) >= i.total_amount THEN 'paid'
         WHEN coalesce(sum(p.amount),0) > 0               THEN 'part'
         ELSE 'unpaid'
       END                                     AS settlement
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id   -- LEFT JOIN keeps unpaid invoices
WHERE i.status IN ('issued','paid')
GROUP BY i.id
ORDER BY balance DESC;`,
          pitfalls: [
            '**Using an INNER JOIN.** It drops invoices with no payments; use LEFT JOIN so unpaid invoices still appear.',
            '**Marking paid on a partial match.** Only flip to `paid` when payments fully cover the total.',
            '**Ignoring overpayments.** A sum greater than the total is a flag to investigate, not silently swallow.',
            '**Double-allocating an advance.** Decide whether an advance is netted at booking level or allocated to one invoice — not both.',
          ],
          tryIt:
            'Run the reconciliation query against your data with one fully-paid, one part-paid, and one unpaid invoice. Confirm all three appear with the correct `settlement` label and balance.',
          takeaway:
            'Reconciliation LEFT-JOINs invoices to payments to classify each as paid/part/unpaid, flipping status to `paid` only on full coverage.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm6-p1',
      type: 'Project',
      title: 'Invoice + GST + Checkout-to-Invoice Flow',
      domain: 'Resort Management',
      duration: '3 hours',
      description:
        'Build the full invoice model, the CGST+SGST tax calculator with discount-before-tax, and a checkout flow that assembles a draft invoice from a booking, then issues it.',
      tools: ['ASP.NET Core MVC', 'C#', 'Dapper', 'PostgreSQL'],
      blueprint: {
        overview:
          'Recreate TunMani Resort’s billing core. A booking is turned into an itemised invoice with correct Indian GST, a sequential invoice number, and a draft→issued lifecycle — the foundation every payment and report builds on.',
        functionalRequirements: [
          '**Invoice + items.** Model `Invoice` and `InvoiceItem` with all money fields as `decimal`.',
          '**Sequential numbers.** Generate `TM/{year}/{NNNN}` from a PostgreSQL sequence.',
          '**GST math.** Compute CGST + SGST with discount applied before tax, rounded to 2 places.',
          '**Checkout.** Assemble a draft invoice from a booking’s rooms and add-ons in one transaction.',
          '**Issue.** A `/Invoice/{id}/Issue` endpoint freezes the draft and stamps `IssuedAt`.',
          '**Preview.** A Razor view showing itemised lines and the CGST/SGST split summing to the total.',
        ],
        technicalImplementation: [
          '**POCOs + schema.** `Invoice`/`InvoiceItem` mapped to `numeric(12,2)` columns; `amount` and `taxable_amount` as generated columns.',
          '**Calculator.** A `InvoiceCalculator.ComputeTotals` doing discount-then-tax with `Math.Round(.., 2)`.',
          '**Sequence.** `NextInvoiceNumberAsync` via `nextval` inside the checkout transaction.',
          '**Service.** A fat `CheckoutService.GenerateInvoiceAsync`; a thin `CheckoutController`.',
          '**Lifecycle.** `IssueAsync` enforcing draft→issued and an `InvoiceController` preview/list/download.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Invoice model & schema',
            outcome: 'Invoice and InvoiceItem POCOs with the matching PostgreSQL tables.',
            prompt:
              'In an ASP.NET Core MVC app using Dapper and PostgreSQL, create C# POCOs `Invoice` (InvoiceNumber, BookingId, nullable BookingRoomId, BilledToName, CompanyName, GstNumber, Subtotal, DiscountAmount, TaxableAmount, CgstRate, SgstRate, CgstAmount, SgstAmount, TotalAmount, Status, IssuedAt) and `InvoiceItem` (InvoiceId, Description, ItemType, Quantity, UnitPrice, Amount), all money as decimal. Write the `CREATE TABLE` statements with numeric(12,2) money columns, invoice_items.amount and invoices.taxable_amount as GENERATED ALWAYS AS ... STORED columns, and the foreign keys. Show full files.',
          },
          {
            step: 2,
            label: 'GST calculator & invoice number',
            outcome: 'A tested ComputeTotals and a sequence-based number generator.',
            prompt:
              'Write a static `InvoiceCalculator.ComputeTotals(Invoice inv)` that sets TaxableAmount = Subtotal − DiscountAmount, then CgstAmount and SgstAmount = Math.Round(TaxableAmount × rate, 2), then TotalAmount = TaxableAmount + CgstAmount + SgstAmount. Add a `GstRates` class (rooms 6%+6%, halls 9%+9%). Then write `NextInvoiceNumberAsync` that selects `nextval(\'invoice_number_seq\')` and formats `TM/{year}/{n:D4}`. Include a couple of example assertions.',
          },
          {
            step: 3,
            label: 'Checkout-to-invoice service',
            outcome: 'A transactional CheckoutService that builds a draft invoice.',
            prompt:
              'Write `CheckoutService.GenerateInvoiceAsync(int bookingId)` that, in one Dapper transaction, loads the booking + booking_rooms + add-ons, builds an InvoiceItem per room night and add-on, sets Subtotal/Discount/GST rates, calls ComputeTotals, assigns the next invoice number, inserts the invoice and items, and returns the draft Invoice. Then write a thin `CheckoutController` POST /Checkout/{bookingId} that calls it and redirects to the invoice preview.',
          },
          {
            step: 4,
            label: 'Issue & preview',
            outcome: 'Lifecycle transition plus a Razor preview of the invoice.',
            prompt:
              'Add `InvoiceService.IssueAsync(int id)` that allows issue only from draft, recomputes totals, sets status `issued` and issued_at = now(). Add `InvoiceController` endpoints: POST /Invoice/{id}/Issue, GET /Invoice/{id}/Preview, and GET /Booking/{bookingId}/Invoices. Build a `Preview.cshtml` Razor view showing bill-to details, itemised lines, separate CGST and SGST lines, and the total, with an Issue button when status is draft.',
          },
        ],
      },
    },
    {
      id: 'm6-p2',
      type: 'Project',
      title: 'Payment Recording + Outstanding-Balance Summary',
      domain: 'Resort Management',
      duration: '3 hours',
      description:
        'Build the payment side: a Payment entity, a transactional record-and-reconcile service supporting advances, a booking payment summary (collected / billed / outstanding), and a reconciliation report.',
      tools: ['ASP.NET Core MVC', 'C#', 'Dapper', 'PostgreSQL'],
      blueprint: {
        overview:
          'Complete TunMani Resort’s money loop. Staff record cash/UPI/bank payments (including advances before any invoice), the system reconciles them against invoices and flips status to paid, and a summary shows exactly what is collected and what is still owed.',
        functionalRequirements: [
          '**Payment entity.** `Payment` with BookingId, nullable InvoiceId, Amount, PaymentMode, ReferenceNumber, PaidAt, Notes.',
          '**Record + reconcile.** A transactional service that validates, inserts, and flips the invoice to paid when covered.',
          '**Advances.** Accept payments with a null InvoiceId before any invoice exists.',
          '**Summary.** Derive collected, billed, and outstanding for a booking.',
          '**Reconciliation.** A report matching each invoice to its payments (paid / part / unpaid).',
          '**UI.** A record-payment modal and an outstanding-balance badge on the booking.',
        ],
        technicalImplementation: [
          '**Schema.** `payments` table with FKs and a parallel `hall_booking_payments` with PaymentType.',
          '**Service.** `PaymentService.RecordAsync` validating amount/mode and reconciling in one transaction.',
          '**Summary.** `GetSummaryAsync` with aggregate queries, returning a `PaymentSummary` record.',
          '**Report.** A LEFT JOIN aggregate query classifying settlement per invoice.',
          '**Controller + view.** `PaymentController` POST /Payment/Record and a modal partial.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Payment model & schema',
            outcome: 'Payment POCO and payments table supporting advances.',
            prompt:
              'Create a C# `Payment` POCO (BookingId, nullable InvoiceId, decimal Amount, PaymentMode cash/UPI/bank, ReferenceNumber, PaidAt, Notes) and the PostgreSQL `payments` table with numeric(12,2) amount, foreign keys to bookings and invoices (invoice_id nullable for advances), plus a parallel `hall_booking_payments` table adding a payment_type column (balance/extras). Show full files.',
          },
          {
            step: 2,
            label: 'Record-and-reconcile service',
            outcome: 'A transactional RecordAsync that flips invoices to paid.',
            prompt:
              'Write `PaymentService.RecordAsync(Payment p)` that validates Amount > 0 and requires a ReferenceNumber for non-cash modes, then in one Dapper transaction inserts the payment with PaidAt = now(), sums all payments for the linked invoice, and if the sum covers the invoice total updates the invoice status to `paid`. Then add a thin `PaymentController` POST /Payment/Record binding the form and redirecting back to the invoice preview.',
          },
          {
            step: 3,
            label: 'Advances & payment summary',
            outcome: 'Invoice-less advances and a collected/billed/outstanding summary.',
            prompt:
              'Show how to record an advance as a Payment with InvoiceId = null against a booking. Then write `PaymentService.GetSummaryAsync(int bookingId)` returning a `PaymentSummary` record with Collected = sum of all booking payments, Billed = sum of issued/paid invoice totals, and Outstanding = max(0, Billed − Collected). Render the three numbers with a red/green status badge in a Razor view.',
          },
          {
            step: 4,
            label: 'Reconciliation report',
            outcome: 'A per-invoice settlement report.',
            prompt:
              'Write a PostgreSQL reconciliation query that LEFT JOINs invoices to payments, grouped per invoice, returning invoice_number, total_amount, paid (sum of payments), balance, and a settlement label of paid / part / unpaid via a CASE. Wrap it in a `PaymentService.GetReconciliationAsync` method returning a list of DTOs and surface it in a simple Razor report view, sorted by balance descending.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm6-q1',
      q: 'In the GST formula used on a TunMani Resort invoice, when is the discount applied?',
      options: [
        'After tax, on the GST-inclusive total',
        'Before tax: TaxableAmount = Subtotal − DiscountAmount, then tax is computed on the taxable amount',
        'Discounts are never allowed on a GST invoice',
        'Half before tax and half after tax',
      ],
      answer: 1,
    },
    {
      id: 'm6-q2',
      q: 'How is 12% GST on a resort room split on the invoice?',
      options: [
        'As a single 12% tax line',
        'As 12% CGST only',
        'As 6% CGST + 6% SGST shown separately',
        'As 9% CGST + 3% SGST',
      ],
      answer: 2,
    },
    {
      id: 'm6-q3',
      q: 'Why are money fields stored as C# decimal and PostgreSQL numeric(12,2) instead of double?',
      options: [
        'Because double is slower to compute',
        'Because decimal/numeric are exact for currency, while double drifts due to binary floating-point',
        'Because Dapper cannot map double',
        'Because PostgreSQL has no double type',
      ],
      answer: 1,
    },
    {
      id: 'm6-q4',
      q: 'How is a unique, sequential InvoiceNumber generated safely under concurrent checkouts?',
      options: [
        'By using COUNT(*) + 1 of existing invoices',
        'By using the current timestamp',
        'By calling nextval on a PostgreSQL sequence inside the insert transaction',
        'By asking the clerk to type the next number',
      ],
      answer: 2,
    },
    {
      id: 'm6-q5',
      q: 'How can a guest pay an advance before any invoice exists?',
      options: [
        'The system blocks all payments until an invoice is issued',
        'A Payment is recorded with the BookingId set and InvoiceId null',
        'The advance is stored as a discount on the future invoice',
        'An empty placeholder invoice is created first',
      ],
      answer: 1,
    },
    {
      id: 'm6-q6',
      q: 'On the booking payment summary, how is the outstanding balance derived?',
      options: [
        'It is a stored column updated by a trigger',
        'Billed (sum of issued invoice totals) − Collected (sum of payments), clamped at zero',
        'It is the largest single unpaid invoice',
        'Collected − Billed',
      ],
      answer: 1,
    },
  ],
};
