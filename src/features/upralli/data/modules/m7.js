// Module 7 — Rates, ₹ Collection Totals, Clone-Year & Lock-Year.
// Electron + React + TypeScript + Prisma over a bundled LOCAL PostgreSQL. OFFLINE
// desktop app for a coastal-Karnataka village temple committee — the year-wise
// pooja/donor register ("Upralli Seva"). This module makes MONEY a first-class
// citizen: a per-year Rates screen ("ಸೇವಾ ದರಗಳು") where each pooja type carries a ₹
// rate (Decimal in Prisma, number across IPC), the collection totals that fall out
// of it — poojaAmount per household, the per-Magane "ಒಟ್ಟು ಸಂಗ್ರಹ", and a year-wide
// grand total (real 2025 = ₹16,20,160) formatted with Indian digit grouping —
// and the year lifecycle: clone the previous year forward and lock a finalised year
// read-only. Consumed by the React course player (see components/TopicItem.jsx).

export const m7 = {
  id: 'm7',
  title: 'Rates, ₹ Collection Totals, Clone-Year & Lock-Year',
  hours: 8,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Turn the Upralli Seva register into a money-aware book. Build the per-year Rates screen ("ಸೇವಾ ದರಗಳು") where every pooja type carries a ₹ rate for THIS year — including rate-only poojas that never become grid columns — and save them as Decimal in Prisma, surfaced as plain numbers across IPC. Then compute the collection that falls out of those rates: poojaAmount per household (Σ of the ticked columns), the per-Magane "ಒಟ್ಟು ಸಂಗ್ರಹ", and a year-wide grand total shown in a top bar, all printed with the app\'s real Indian-grouped money() formatter (and the genuine double-comma bug it fixed). Finish with the year lifecycle: clone the previous year forward as a Prisma transaction (people + columns + rates copied, ticks reset) and lock a finalised year so the whole UI goes read-only — safe precisely because every year is its own snapshot.',
  sections: [
    {
      id: 'm7-s1',
      title: 'Per-year rates',
      topics: [
        {
          id: 'm7-t1',
          title: 'Why Rates Live Per-Year, Not Globally',
          explain:
            'Each Year owns its **own pooja columns and ₹ rates**, because a pooja that cost ₹500 in 2024 may cost ₹600 in 2025 — so the rate belongs to the Year, never to a single global pooja record.',
          analogy:
            'The committee does not keep one eternal price list pinned to the temple wall. Every year they print a fresh rate sheet — ರಂಗಪೂಜೆ ₹600, ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ ₹250 — and that sheet belongs to that year\'s book. Last year\'s sheet stays in last year\'s book, untouched. Per-year rates are the app keeping each year\'s rate sheet inside that year\'s ledger.',
          theory:
            'The domain is a chain: **Magane (global) → Year → PersonEntry → PoojaType → Participation**. The Maganes (wards) are the only thing shared across years; everything below the Year is **scoped to that Year**. PoojaTypes are created per-year, and crucially each PoojaType carries a `rate` for that year. So when 2025 raises ರಂಗಪೂಜೆ from ₹500 to ₹600, you are editing the 2025 PoojaType\'s rate — the 2024 PoojaType, with its ₹500, is a separate row in a separate year and stays exactly as it was.\n\nThis is a deliberate **snapshot** model. A Year is a self-contained photograph of that year\'s poojas, rates and households. The benefit is that historical totals never drift: if rates were global, raising a price would silently change every past year\'s grand total — a disaster for a financial record the committee reads aloud and reconciles against the temple\'s books. Per-year rates make each year\'s collection an immutable fact once recorded.\n\nIt also makes the two big operations of this module **safe**. Cloning a year (Section 3) copies the columns and rates forward into a new year so you start from last year\'s sheet but edit independently. Locking a year freezes one snapshot read-only without touching any other year. Both work cleanly only because there is no shared, mutable rate that a change in one year could ripple into another.',
          whyItMatters:
            'Money is core to this register — the real 2025 grand total is ₹16,20,160, a number the committee must be able to trust years later. If rates were global, editing this year\'s prices would rewrite history. Per-year rates are what make each year\'s collection a permanent, independent fact, and what make clone and lock safe.',
          steps: [
            'Model PoojaType as belonging to a Year (e.g. `yearId`), with a `rate Decimal` field.',
            'Create a fresh set of PoojaTypes (and rates) per Year, not one shared global list.',
            'Edit rates on the current year\'s PoojaTypes only — never a global record.',
            'Treat each Year as a snapshot: its rates are fixed history once recorded.',
            'Let clone copy a year\'s columns + rates forward into a new, independent year.',
            'Let lock freeze one year\'s snapshot without affecting any other year.',
          ],
          code: `// prisma/schema.prisma — rates belong to the Year, via its PoojaTypes.
model Year {
  id         String      @id @default(cuid())
  label      String      // e.g. '2025'
  isLocked   Boolean     @default(false)   // finalised → read-only (Section 3)
  poojaTypes PoojaType[]
}

model PoojaType {
  id           String  @id @default(cuid())
  year         Year    @relation(fields: [yearId], references: [id])
  yearId       String
  name         String                       // Kannada label, e.g. 'ರಂಗಪೂಜೆ'
  rate         Decimal @default(0)          // THIS year's ₹ rate
  showAsColumn Boolean @default(true)       // false = rate-only, no grid column
  position     Int     @default(0)
}
// Raising 2025's ರಂಗಪೂಜೆ to ₹600 edits the 2025 row; 2024's row keeps its ₹500.`,
          pitfalls: [
            'Modelling one global PoojaType with a single rate, so editing it rewrites every past year\'s total.',
            'Sharing rates across years and being surprised when a price change alters history.',
            'Forgetting the `rate` field entirely, leaving money as an afterthought instead of core data.',
            'Putting Year-scoped data above the Year (only Maganes are global here).',
            'Assuming clone can \'reference\' last year\'s rates instead of copying them into the new year.',
            'Treating a finalised year\'s rates as still editable, undermining the snapshot.',
          ],
          tryIt:
            'In a scratch schema, create two Years and give each its own ರಂಗಪೂಜೆ PoojaType — ₹500 in 2024, ₹600 in 2025. Change the 2025 rate and confirm the 2024 row is untouched. That independence is the whole point of per-year rates.',
          takeaway:
            'Rates live on per-year PoojaTypes (a `rate Decimal`), so each Year is an independent snapshot — editing this year\'s prices never rewrites a past year\'s total, and clone/lock stay safe.',
        },
        {
          id: 'm7-t2',
          title: 'The Rates Screen ("ಸೇವಾ ದರಗಳು")',
          explain:
            'Build the **Rates screen** where the committee edits each pooja type\'s ₹ rate for the current year — a simple list of rows, one per PoojaType, each with a Kannada label and an editable rate field.',
          analogy:
            'This screen is the committee sitting down before the season to fill in this year\'s rate sheet: ರಂಗಪೂಜೆ — ₹__, ಸತ್ಯನಾರಾಯಣ ಪೂಜೆ — ₹__, line by line. The Rates screen is that sheet on screen, where they type the year\'s price next to each pooja.',
          theory:
            'The Rates screen ("ಸೇವಾ ದರಗಳು" — service rates) lists every PoojaType of the **current year**, each as a row with its Kannada name and a controlled number input bound to its `rate`. Editing here is the single place the year\'s prices are set; the register grid and all totals downstream read those rates. Because rates are per-year, the screen is always working against the selected year\'s PoojaTypes.\n\nKeep the rows in **local state** while editing so typing is instant, and commit the whole set with one save (next topic) rather than firing a database write per keystroke. Each row carries the PoojaType\'s id so the save knows which rate maps to which pooja. A rate is a number in the UI even though it is a Decimal in the database — you bind the input to a plain number and only worry about the Decimal/number boundary at the IPC edge.\n\nThe screen also hosts two controls covered next: a **column toggle** ("ಕಾಲಂ") deciding whether a pooja appears as a grid column, and an **add control** for extra **rate-only** poojas that contribute money but are not columns. Like the rest of the app, the Rates screen must respect the **locked-year guard** — when the year is locked the inputs are read-only, because a finalised year\'s rates are history.',
          whyItMatters:
            'Every rupee the register totals comes from a number typed on this screen. A clear, per-year Rates screen is what lets the committee set this season\'s prices once, correctly, and trust that the grid and grand total reflect them — making it the source of truth for all the money in the book.',
          steps: [
            'Load the current year\'s PoojaTypes (id, Kannada name, rate, showAsColumn) into local state.',
            'Render one row per PoojaType: the Kannada label and a controlled number input for the rate.',
            'Bind each rate input to local state (`value`/`onChange`), updating immutably by id.',
            'Carry each row\'s PoojaType id so the save can map rate → pooja.',
            'Disable/read-only the inputs when the year is locked.',
            'Add the column toggle and rate-only add control (next topics) on this same screen.',
          ],
          code: `// src/renderer/screens/RatesScreen.tsx — edit this year's ₹ rates.
function RatesScreen({ poojas, yearLocked, onChange }: RatesProps) {
  return (
    <table className='rates'>
      <caption className='kn'>ಸೇವಾ ದರಗಳು</caption>
      <tbody>
        {poojas.map((p) => (
          <tr key={p.id}>
            <td className='kn'>{p.name}</td>
            <td>
              <input
                type='number'
                min={0}
                value={p.rate}                          // number in the UI
                disabled={yearLocked}                    // locked year = read-only
                onChange={(e) =>
                  onChange(p.id, { rate: Number(e.target.value) })  // immutable update by id
                }
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}`,
          pitfalls: [
            'Saving a rate to the database on every keystroke instead of editing local state then committing once.',
            'Losing the PoojaType id on each row, so the save cannot tell which rate belongs to which pooja.',
            'Binding the input to a Decimal object instead of a plain number, fighting the number input.',
            'Editing a global rate list instead of the selected year\'s PoojaTypes.',
            'Forgetting the locked-year guard, letting a finalised year\'s rates be changed.',
            'Mutating a row in place instead of returning a new array when a rate changes.',
          ],
          tryIt:
            'Open the Rates screen for the current year, change ರಂಗಪೂಜೆ to a new figure, and watch only that row update in local state (log it). Don\'t save yet — confirm the database is untouched until you commit, proving editing is local-first.',
          takeaway:
            'The Rates screen ("ಸೇವಾ ದರಗಳು") lists the current year\'s PoojaTypes as rows with controlled rate inputs in local state, keyed by id, read-only when the year is locked — the one place prices are set.',
        },
        {
          id: 'm7-t3',
          title: 'Rate-Only Poojas and the Column Toggle ("ಕಾಲಂ")',
          explain:
            'Use a **`showAsColumn` flag** so a pooja can contribute its ₹ rate to the totals without taking a grid column — toggled by the "ಕಾಲಂ" control — keeping the register grid readable while still counting every rupee.',
          analogy:
            'Some collections — a one-off ಧ್ವಜ contribution, say — apply to many households but do not deserve their own tick-box column cluttering the register. The committee still wants the money counted. The column toggle is the committee deciding which poojas get a printed column in the grid and which are just totted up on the side.',
          theory:
            'Each PoojaType has a boolean **`showAsColumn`**. When `true`, the pooja appears as a tick-box **column** in the register grid and households can be ticked for it. When `false`, it is a **rate-only** pooja: it still has a rate and can still contribute to a household\'s amount, but it does not clutter the grid with another column. The "ಕಾಲಂ" (column) toggle on the Rates screen flips this flag per pooja.\n\nThis matters because the grid can get wide fast — a dozen pooja columns is hard to read aloud. Rate-only poojas let the committee add charges that apply broadly without growing the grid. The grid rendering simply **filters** to PoojaTypes where `showAsColumn` is true; the Rates screen shows them all (so every rate is editable). The totals logic decides which rate-only poojas a household pays — often a fixed/common charge — separately from the ticked columns.\n\nThe **add control** for an extra rate-only pooja just creates a PoojaType with `showAsColumn: false` and a rate. It lands on the Rates screen like any other row but never becomes a column. Keep the two concerns clear: **what shows as a column** (grid readability) is independent of **what carries a rate** (money) — `showAsColumn` governs the first, `rate` the second.',
          whyItMatters:
            'A register that forces every charge into its own column becomes an unreadable spreadsheet; one that drops charges to keep tidy loses money. The `showAsColumn` flag lets the committee keep the grid clean AND count every rupee — exactly the balance a real rate sheet needs, where not every line item is a tick-box.',
          steps: [
            'Give PoojaType a `showAsColumn Boolean @default(true)` flag (already in the schema).',
            'On the Rates screen, show every PoojaType so all rates stay editable.',
            'Add a "ಕಾಲಂ" toggle per row that flips `showAsColumn`.',
            'In the register grid, render only PoojaTypes where `showAsColumn` is true.',
            'Add an \'add rate-only pooja\' control that creates a PoojaType with `showAsColumn: false`.',
            'Keep column visibility (`showAsColumn`) separate from money (`rate`) in your logic.',
          ],
          code: `// The grid shows only column poojas; the Rates screen shows them all.
const columnPoojas = poojas.filter((p) => p.showAsColumn);   // grid columns
const allPoojas = poojas;                                    // Rates screen rows

// The "ಕಾಲಂ" toggle flips showAsColumn for one pooja.
function ColumnToggle({ pooja, onChange }: ColumnToggleProps) {
  return (
    <label className='col-toggle'>
      <span className='kn'>ಕಾಲಂ</span>
      <input
        type='checkbox'
        checked={pooja.showAsColumn}
        onChange={(e) => onChange(pooja.id, { showAsColumn: e.target.checked })}
      />
    </label>
  );
}

// Add a rate-only pooja: it carries a rate but never becomes a grid column.
// poojaTypes.add(yearId, { name: 'ಧ್ವಜ', rate: 100, showAsColumn: false });`,
          pitfalls: [
            'Conflating \'has a rate\' with \'is a column\' — they are governed by different fields.',
            'Filtering the Rates screen by `showAsColumn` too, hiding rate-only poojas so their rate can\'t be edited.',
            'Forgetting to filter the GRID by `showAsColumn`, so rate-only poojas clutter it as columns.',
            'Adding an extra pooja as a column by default when it was meant to be rate-only.',
            'Dropping rate-only poojas from the totals, silently losing money.',
            'Letting the toggle write to the DB per click instead of into the editable rates set.',
          ],
          tryIt:
            'Add a rate-only pooja (ಧ್ವಜ, ₹100, showAsColumn false). Confirm it appears as an editable row on the Rates screen but does NOT add a column to the register grid. Then toggle "ಕಾಲಂ" on and watch the grid grow a column.',
          takeaway:
            'A `showAsColumn` flag (flipped by the "ಕಾಲಂ" toggle) separates grid columns from money: rate-only poojas (`showAsColumn:false`) carry a rate and count toward totals without cluttering the grid.',
        },
        {
          id: 'm7-t4',
          title: 'Saving Rates: Decimal in Prisma, number across IPC',
          explain:
            'Commit the edited rates with **`poojaTypes.save(yearId, items)`**, storing each rate as a Prisma **Decimal** in the main process while passing it as a plain **number** across the IPC boundary.',
          analogy:
            'The committee writes the final rate sheet into the ledger in proper bookkeeping figures (Decimal — exact, no rounding drift), but when they read a price out to each other across the room, they just say \'six hundred\' (a plain number). Decimal is how money is stored; number is how it travels and is shown.',
          theory:
            'Money must be stored as **Decimal**, not a floating-point number, because floats accumulate rounding error — and a donor register that is even a rupee off across thousands of households is wrong. Prisma\'s `Decimal` type (backed by Postgres `numeric`) keeps exact values. So in the **main process**, rates are Decimals: you read and write them precisely.\n\nBut **IPC cannot send a Prisma Decimal object** cleanly to the renderer — it serialises awkwardly, and the React side just wants a plain number to bind to a `<input type=\'number\'>` and to sum. So the pattern is: at the IPC edge, **map Decimal → number** when sending to the renderer (e.g. `rate.toNumber()`), and **number → Decimal** when receiving a save in main (e.g. `new Prisma.Decimal(item.rate)`). The renderer never sees a Decimal; main never trusts a float for storage.\n\nThe save itself is `poojaTypes.save(yearId, items)`: the renderer sends an array of `{ id, rate, showAsColumn }` (plain numbers), and the main process writes each back, converting to Decimal. Doing it as one call (ideally a small transaction) commits the whole rate sheet at once, matching the local-first editing of the Rates screen. The amounts these rates feed — household totals, per-Magane sums, the grand total — are also Decimals computed in main and mapped to numbers for display.',
          whyItMatters:
            'Exactness is non-negotiable for a temple\'s financial record. Storing rates as Decimal protects the ₹16,20,160 grand total from floating-point drift, while mapping to number across IPC keeps the React side simple. Getting this boundary right is what makes the money both correct and easy to display.',
          steps: [
            'Type the `rate` column as Prisma `Decimal` (Postgres `numeric`) for exact money.',
            'When sending rates to the renderer, map `Decimal → number` (e.g. `rate.toNumber()`).',
            'In the renderer, edit rates as plain numbers bound to the inputs.',
            'On save, send `{ id, rate, showAsColumn }[]` (plain numbers) via `poojaTypes.save`.',
            'In main, convert `number → Decimal` (`new Prisma.Decimal(rate)`) before writing.',
            'Commit the whole set together (a loop in a transaction) to match local-first editing.',
          ],
          code: `// main process — poojaTypes.save: numbers in over IPC, Decimal to the DB.
ipcMain.handle('poojaTypes:save', async (_e, yearId: string, items: RateItem[]) => {
  return prisma.\$transaction(
    items.map((it) =>
      prisma.poojaType.update({
        where: { id: it.id },
        data: {
          rate: new Prisma.Decimal(it.rate),     // number → Decimal for storage
          showAsColumn: it.showAsColumn,
        },
      }),
    ),
  );
});

// When LOADING for the renderer, map Decimal → number so React gets plain numbers:
// const dto = poojas.map((p) => ({ ...p, rate: p.rate.toNumber() }));`,
          pitfalls: [
            'Storing rates as a float column, accumulating rounding error across thousands of rows.',
            'Sending a Prisma Decimal object across IPC and getting a mangled value in the renderer.',
            'Forgetting `new Prisma.Decimal(...)` on save, writing an imprecise number.',
            'Binding a `<input type=\'number\'>` to a Decimal object instead of a plain number.',
            'Saving each rate in its own round-trip instead of committing the set in one transaction.',
            'Doing money arithmetic in JS floats in the renderer instead of computing exact totals in main.',
          ],
          tryIt:
            'Set a few rates, save via `poojaTypes.save`, then reload and confirm the exact values came back as numbers. Try a fractional rate (e.g. ₹250.50) and check it survives the Decimal↔number round-trip without drift.',
          takeaway:
            'Rates are Decimal in Prisma (exact money) but number across IPC: map Decimal→number when loading and number→Decimal in `poojaTypes.save`, committing the whole rate sheet in one transaction.',
        },
      ],
    },
    {
      id: 'm7-s2',
      title: 'Computing ₹ collection totals',
      topics: [
        {
          id: 'm7-t5',
          title: 'poojaAmount: Summing a Household\'s Ticked Columns',
          explain:
            'A household\'s **poojaAmount** is the sum of the rates of the columns it is **ticked** for: `poojaAmount(person) = Σ rate(col)` over each ticked Participation — the per-household figure everything else builds on.',
          analogy:
            'For one household, the committee runs a finger down the rate sheet, stopping at each pooja the family takes part in and adding its price: ರಂಗಪೂಜೆ ₹600 + ಸತ್ಯನಾರಾಯಣ ₹250 = ₹850. poojaAmount is that finger-down-the-list addition for a single household.',
          theory:
            'Participation is a **checkbox** per (household, PoojaType): ticked means the household pays for that pooja this year. So a household\'s amount is simply the sum of `rate` over the poojas it is ticked for. Formally, `poojaAmount(person) = Σ rate(col)` for each column where `participation(person, col)` is true. Rate-only poojas it pays are added the same way (sum their rate too).\n\nThe efficient way to compute this is with a **rate map**: build `{ poojaTypeId → rate }` once for the year, then for each household add up the rates of its ticked ids. That avoids re-looking-up a rate per tick. Because rates are exact, do this sum as a **Decimal in main** when you can, then map the household total to a number for display — keeping the arithmetic precise and the renderer simple.\n\nThis single function is the **atom** of all the money in the app. The per-Magane "ಒಟ್ಟು ಸಂಗ್ರಹ" is the sum of poojaAmount over that Magane\'s households; the grand total is the sum over all Maganes. Get poojaAmount right — only ticked columns, exact rates, rate-only included — and every total above it is correct by construction.',
          whyItMatters:
            'poojaAmount is the foundation of the entire collection figure. If it miscounts even one household\'s ticks or uses a stale rate, every per-Magane sum and the grand total inherit the error. Defining it cleanly — Σ of ticked rates — is what makes the whole money model trustworthy.',
          steps: [
            'Treat Participation as a boolean tick per (household, PoojaType).',
            'Build a rate map `{ poojaTypeId → rate }` once for the year.',
            'For each household, sum `rate` over the PoojaType ids it is ticked for.',
            'Include rate-only poojas the household pays, summed the same way.',
            'Compute as Decimal in main for exactness; map the total to a number for display.',
            'Reuse this one function for per-Magane and grand totals (next topic).',
          ],
          code: `// poojaAmount(person) = Σ rate(ticked column) — the atom of all totals.
function buildRateMap(poojas: { id: string; rate: number }[]) {
  const map = new Map<string, number>();
  for (const p of poojas) map.set(p.id, p.rate);   // { poojaTypeId → rate }
  return map;
}

function poojaAmount(
  person: { tickedPoojaIds: string[] },
  rates: Map<string, number>,
): number {
  let sum = 0;
  for (const id of person.tickedPoojaIds) {
    sum += rates.get(id) ?? 0;                      // add the rate of each ticked column
  }
  return sum;                                        // per-household ₹ total
}`,
          pitfalls: [
            'Summing every pooja\'s rate instead of only the ones the household is ticked for.',
            'Looking up each rate from the DB per tick instead of building one rate map.',
            'Forgetting rate-only poojas the household pays, undercounting the amount.',
            'Using a stale rate map after rates were edited, so totals lag the Rates screen.',
            'Doing the sum in floats when an exact Decimal sum was available in main.',
            'Counting a household against the wrong year\'s rates (mixing snapshots).',
          ],
          tryIt:
            'Pick one household, note the columns it is ticked for, and add their rates by hand. Then log `poojaAmount` for it and confirm the numbers match. Untick one pooja and watch the amount drop by exactly that rate.',
          takeaway:
            'poojaAmount(person) = Σ rate over the household\'s ticked columns (plus any rate-only poojas it pays), computed from a rate map — the per-household atom every higher total is built from.',
        },
        {
          id: 'm7-t6',
          title: 'Per-Magane "ಒಟ್ಟು ಸಂಗ್ರಹ" and the Year-Wide Grand Total',
          explain:
            'Sum poojaAmount over a Magane\'s households for its **"ಒಟ್ಟು ಸಂಗ್ರಹ"** (total collection), and over all Maganes for the **year-wide grand total** (`register:yearTotals`) shown in a top bar — the real 2025 figure being ₹16,20,160.',
          analogy:
            'After each ward\'s slips are added up — that ward\'s "ಒಟ್ಟು ಸಂಗ್ರಹ" — the committee carries every ward\'s subtotal to the front page and adds them into one grand figure for the year. The top bar is that front-page grand total the whole committee watches.',
          theory:
            'The totals form a simple hierarchy on top of poojaAmount. A Magane\'s **"ಒಟ್ಟು ಸಂಗ್ರಹ"** (total collection) is `Σ poojaAmount(person)` over the households in that Magane. The **grand total** is `Σ` of the Magane totals across the whole year — equivalently `Σ poojaAmount` over every household. You show the Magane total at the foot of each Magane\'s block and the grand total in a **top bar** so the committee always sees the running year figure.\n\nThe clean way to deliver this is a single main-process call, **`register:yearTotals`**, that takes a `yearId`, builds the rate map once, and returns `{ grandTotal, perMagane: { maganeId → total } }` — all computed as Decimal in main and mapped to numbers at the edge. The renderer then just renders those numbers; it does not re-derive the money, which keeps one source of truth for the arithmetic.\n\nThis is where the real ₹16,20,160 lives: it is the 2025 grand total, the sum of every household\'s ticked rates across every Magane. Because it is derived from per-year rates and per-year ticks, it is a fixed fact of that snapshot — and locking the year (Section 3) freezes it. Recompute totals whenever rates or ticks change so the top bar stays live, but compute them in one place so they can never disagree.',
          whyItMatters:
            'The grand total is the number the committee cares about most — the season\'s collection in one figure. Computing the per-Magane and grand totals in one place (`register:yearTotals`) and showing the grand total in a top bar gives the committee a single, trustworthy running figure (₹16,20,160 in 2025) instead of numbers that might disagree across screens.',
          steps: [
            'Build the year\'s rate map once in `register:yearTotals`.',
            'For each Magane, sum poojaAmount over its households → "ಒಟ್ಟು ಸಂಗ್ರಹ".',
            'Sum the Magane totals (or all households) → the year-wide grand total.',
            'Return `{ grandTotal, perMagane }` as numbers over IPC.',
            'Render each Magane total at its block foot and the grand total in a top bar.',
            'Recompute when rates or ticks change so the top bar stays live.',
          ],
          code: `// main — register:yearTotals: per-Magane "ಒಟ್ಟು ಸಂಗ್ರಹ" + grand total, once.
ipcMain.handle('register:yearTotals', async (_e, yearId: string) => {
  const poojas = await prisma.poojaType.findMany({ where: { yearId } });
  const rates = buildRateMap(poojas.map((p) => ({ id: p.id, rate: p.rate.toNumber() })));
  const people = await loadPeopleWithTicks(yearId);   // households + ticked pooja ids

  const perMagane: Record<string, number> = {};
  let grandTotal = 0;
  for (const person of people) {
    const amt = poojaAmount(person, rates);           // Σ ticked rates
    perMagane[person.maganeId] = (perMagane[person.maganeId] ?? 0) + amt;
    grandTotal += amt;
  }
  return { grandTotal, perMagane };                   // 2025 grandTotal === 1620160
});`,
          pitfalls: [
            'Summing per-Magane and grand totals separately in different screens, so they disagree.',
            'Recomputing totals in the renderer with floats instead of trusting the main-process figure.',
            'Forgetting to recompute after a rate or tick change, leaving a stale top bar.',
            'Mixing households from another year into a year\'s total (cross-snapshot leak).',
            'Counting a household in the wrong Magane bucket, skewing "ಒಟ್ಟು ಸಂಗ್ರಹ".',
            'Building the rate map per household instead of once per year call.',
          ],
          tryIt:
            'Call `register:yearTotals` for 2025 and confirm the grandTotal equals ₹16,20,160 and that the perMagane subtotals add up to it. Tick one more pooja for a household and confirm both its Magane total and the grand total rise by exactly that rate.',
          takeaway:
            'Per-Magane "ಒಟ್ಟು ಸಂಗ್ರಹ" = Σ poojaAmount over its households; the grand total = Σ over all Maganes — computed once in `register:yearTotals` and shown in a top bar (2025 = ₹16,20,160).',
        },
        {
          id: 'm7-t7',
          title: 'money(): Indian Digit Grouping and the Double-Comma Bug',
          explain:
            'Format every ₹ figure with the real **`money()`** helper, which groups digits the Indian way — last 3, then 2-2 (₹16,20,160) — and learn the genuine **double-comma bug** (`₹1,,080`) it had to fix in the leading 1-2 digit group.',
          analogy:
            'Indian rupee figures are read in lakhs and crores, not thousands: the committee says \'sixteen lakh twenty thousand one hundred sixty\', which is written ₹16,20,160 — commas after the last three digits, then every two. money() is the app writing every rupee figure the way the committee actually reads it aloud.',
          theory:
            'Western grouping is uniform 3-3-3 (1,620,160). **Indian grouping** is different: the **last three** digits, then groups of **two** moving left — so 1620160 becomes **16,20,160**. The `money()` helper implements exactly this. It rounds to a whole rupee, handles a negative sign, takes the last 3 digits, then peels two digits at a time off the rest, and finally prepends the **leading 1-2 digit group**.\n\nThat leading group is where a real bug lived. The naive approach joined all the 2-digit groups with commas and then stuck the last 3 on — but the leading group (the \'16\' in 16,20,160) had to be added without producing an empty element. An off-by-one in how the leading remainder was pushed produced a **double comma** like `₹1,,080` — the join created an empty group between the leading digit and the rest. The fix is to only `unshift` the leading remainder **if it is non-empty**, so the `join(\',\')` never sees a blank segment.\n\nBelow is the faithful implementation. Note the structure: `last3 = s.slice(-3)`, a `while (rest.length > 2)` loop that `unshift`s 2-digit groups, then the **guarded** `if (rest) parts.unshift(rest)` for the leading 1-2 digits — that guard is the fix. The result is `₹\${parts.join(\',\')},\${last3}`, with the sign handled up front. Use this one helper everywhere a rupee value is shown — household amounts, "ಒಟ್ಟು ಸಂಗ್ರಹ", the grand total — so grouping is consistent and the bug never returns.',
          whyItMatters:
            'A temple\'s collection shown as ₹1620160 or, worse, ₹1,,080 looks wrong to a committee that thinks in lakhs — it erodes trust in the figure. The real money() formats every rupee the Indian way and dodges the double-comma bug, so the grand total reads ₹16,20,160 exactly as the committee would write it.',
          steps: [
            'Round to a whole rupee and capture the sign before grouping.',
            'Take the last 3 digits as the rightmost group.',
            'Peel 2 digits at a time off the rest, `unshift`ing each group.',
            'Guard the leading remainder: only `unshift` it if non-empty (the bug fix).',
            'Join the leading groups with commas, then append `,` + the last 3.',
            'Use this one `money()` everywhere a ₹ value is displayed.',
          ],
          code: `// src/renderer/theme.ts — Indian-grouped ₹ formatter (the real money()).
export function money(n: number): string {
  const v = Math.round(n); const neg = v < 0; const s = Math.abs(v).toString(); const sign = neg ? '-' : ''
  if (s.length <= 3) return \`\${sign}₹\${s}\`
  const last3 = s.slice(-3); let rest = s.slice(0, -3); const parts: string[] = []
  while (rest.length > 2) { parts.unshift(rest.slice(-2)); rest = rest.slice(0, -2) }
  if (rest) parts.unshift(rest) // leading 1-2 digit group (the spot the double-comma bug lived)
  return \`\${sign}₹\${parts.join(',')},\${last3}\`
}
// money(1620160) === '₹16,20,160'   money(1080) === '₹1,080' (NOT '₹1,,080')`,
          pitfalls: [
            'Using `toLocaleString()` with a non-Indian locale, getting 3-3-3 grouping (1,620,160).',
            'Pushing the leading remainder unconditionally, re-introducing the `₹1,,080` double comma.',
            'Forgetting the `s.length <= 3` short-circuit, mis-grouping small amounts like ₹080.',
            'Not rounding first, so fractional rupees print noisy decimals in a whole-rupee book.',
            'Dropping the negative sign, so refunds/adjustments lose their minus.',
            'Re-implementing grouping inline in several places instead of reusing one `money()`.',
          ],
          tryIt:
            'Run `money(1620160)`, `money(1080)`, `money(999)` and `money(100000)` and confirm you get ₹16,20,160, ₹1,080, ₹999 and ₹1,00,000. Then temporarily remove the `if (rest)` guard and watch `money(1080)` regress to ₹1,,080 — the exact bug.',
          takeaway:
            'money() groups ₹ the Indian way (last 3, then 2-2) and guards the leading remainder with `if (rest)` so it never emits the `₹1,,080` double comma — use the one helper for every rupee figure.',
        },
        {
          id: 'm7-t8',
          title: 'Where to Compute the Sum: Main vs Renderer',
          explain:
            'Choose **where** the totals are summed: compute them in **main** with the rate map for one authoritative figure, or derive them in the **renderer** from already-loaded rows for instant feedback — and keep one source of truth.',
          analogy:
            'The committee can either have the treasurer add up the whole ledger once and announce the totals (main), or let each member tally the slips already in front of them as ticks change (renderer). Both are fine — what is fatal is two different totals being announced. Pick where the official sum is made.',
          theory:
            'There are two reasonable places to compute totals. **In main** (`register:yearTotals`): load rates and ticks, sum as Decimal, return numbers. This gives one authoritative figure, exact arithmetic, and a single place to fix bugs — ideal for the grand total shown in the top bar and for anything you must trust. The cost is a round-trip whenever you want a fresh number.\n\n**In the renderer**: if the grid already has the rates and each household\'s ticks loaded, you can derive poojaAmount and the subtotals client-side with the same rate map. This feels **instant** — tick a box and the row and Magane totals update with no IPC hop — which is great UX for live editing. The cost is that it is JS-number arithmetic and a second implementation of the sum, so it can drift from main if you are not careful.\n\nThe practical answer is a **hybrid with one source of truth for the logic**: share the `poojaAmount`/sum functions so main and renderer compute identically, let the renderer update optimistically for snappy feedback, and treat the main-process `register:yearTotals` as the authority you reconcile against (e.g. on load, or after a save). Whatever you choose, never let two independently-written sums coexist — extract the summing into one shared function so the renderer\'s live total and main\'s official total can never disagree.',
          whyItMatters:
            'Two subtly different total calculations are a classic source of \'the screen says one thing, the report says another\' bugs in a financial app. Deciding deliberately where the sum lives — and sharing one summing function — is what keeps the live UI snappy without ever letting it disagree with the authoritative figure.',
          steps: [
            'Decide the authority: `register:yearTotals` in main for the official figures.',
            'For live editing, derive poojaAmount/subtotals in the renderer from loaded rows.',
            'Share ONE `poojaAmount`/sum function so both sides compute identically.',
            'Update the renderer optimistically on tick for instant feedback.',
            'Reconcile against main\'s totals on load or after a save.',
            'Never maintain two independently-written summing implementations.',
          ],
          code: `// Share ONE sum so main and renderer can never disagree.
// shared/totals.ts (imported by both processes)
export function maganeTotal(people: Person[], rates: Map<string, number>): number {
  return people.reduce((sum, p) => sum + poojaAmount(p, rates), 0);
}

// Renderer: instant, optimistic — recompute from loaded rows on each tick.
const liveTotal = maganeTotal(maganePeople, rateMap);

// Main: authoritative — register:yearTotals uses the SAME maganeTotal,
// summed as Decimal, then mapped to numbers for the top bar.`,
          pitfalls: [
            'Writing the sum twice (once in main, once in the renderer) so the two slowly diverge.',
            'Computing the official total in floats in the renderer instead of Decimal in main.',
            'Doing an IPC round-trip on every keystroke just to refresh a subtotal, making editing laggy.',
            'Updating the renderer optimistically but never reconciling with the authoritative total.',
            'Using a stale rate map in the renderer after rates changed on the Rates screen.',
            'Letting the top bar and the per-Magane foot be computed by different code paths.',
          ],
          tryIt:
            'Tick a pooja and watch the renderer subtotal update instantly (no IPC). Then reload, fetch `register:yearTotals`, and confirm the authoritative grand total matches what the live UI showed — proof the shared sum keeps them in step.',
          takeaway:
            'Compute the official totals in main (`register:yearTotals`, Decimal) but derive live subtotals in the renderer for instant feedback — sharing ONE summing function so the two never disagree.',
        },
      ],
    },
    {
      id: 'm7-s3',
      title: 'Clone-year & lock-year',
      topics: [
        {
          id: 'm7-t9',
          title: 'Year Management: Create, Pick (Desc), and Delete',
          explain:
            'Manage years as the top-level switch: **create** a new year, **pick** the active year from a descending list (newest first), and **delete** a year only behind a confirm — the navigation that frames every other operation.',
          analogy:
            'The committee keeps a shelf of yearly ledgers. Picking a year is taking one book off the shelf; creating a year is adding a fresh book; deleting one is removing a book from the shelf (which they would only do very deliberately). The newest book sits at the front so it is the one you reach for first.',
          theory:
            'A **Year** is the top of the navigable hierarchy (only Maganes sit outside it as global). The year switcher lists years **descending by label** so the current/newest year is first — the one the committee works in most. Picking a year sets the active `yearId` that the Rates screen, the register grid and `register:yearTotals` all read from.\n\n**Creating** a year makes a new, empty (or about-to-be-cloned) Year. Often you create-then-clone (next topic) so the new year starts from last year\'s sheet; a bare create gives an empty year you fill from scratch. **Deleting** a year is destructive — it removes that year\'s PoojaTypes, households and ticks — so it must sit behind a **confirm** (the same named-confirm discipline as deleting a household in Module 6), ideally showing the year label so the user knows exactly which book they are removing.\n\nBecause years are independent snapshots, these operations are clean: deleting 2023 cannot affect 2024 or 2025, and creating 2026 touches nothing else. The active-year pick is just UI state pointing at one snapshot; everything downstream re-queries for that `yearId`. Keep delete guarded and, where it matters, prevent deleting a **locked** year (a finalised record should not be casually removed).',
          whyItMatters:
            'The year switch frames the entire app — every rate, household and total is read in the context of one selected year. A clear create/pick/delete flow (newest first, delete confirmed) lets the committee move between years\' ledgers confidently, and the snapshot model means these moves never corrupt a neighbouring year.',
          steps: [
            'List years descending by label so the newest is first in the picker.',
            'Picking a year sets the active `yearId` that all screens read from.',
            'Create a new Year (often followed by clone) via `years.create`.',
            'Delete a year only behind a confirm that shows the year label.',
            'Have delete remove that year\'s PoojaTypes/households/ticks (cascade), affecting no other year.',
            'Optionally block deleting a locked (finalised) year.',
          ],
          code: `// Year switcher: newest first; create and confirmed delete.
const sortedYears = [...years].sort((a, b) => b.label.localeCompare(a.label)); // desc

async function createYear(label: string) {
  const year = await window.api.years.create(label);   // new, independent snapshot
  setActiveYearId(year.id);
}

async function deleteYear(year: { id: string; label: string }) {
  const ok = await confirmDialog(\`Delete year \${year.label}? This removes its register.\`);
  if (!ok) return;
  await window.api.years.delete(year.id);              // cascades within this year only
}`,
          pitfalls: [
            'Listing years ascending so the committee has to scroll to reach the current year.',
            'Deleting a year on a single click with no confirm, wiping a whole register.',
            'A generic confirm that doesn\'t name the year, so the wrong book gets deleted.',
            'Forgetting to cascade-delete a year\'s PoojaTypes/households, leaving orphan rows.',
            'Letting a delete in one year somehow touch another (only possible if you broke the snapshot model).',
            'Allowing a locked, finalised year to be deleted as casually as a draft one.',
          ],
          tryIt:
            'Create a new year and confirm it appears at the TOP of the picker. Switch to it and back, watching the Rates screen and totals re-query per year. Try deleting a year and confirm the named confirm appears before anything is removed.',
          takeaway:
            'Years are the top-level switch: list them descending (newest first), pick one to set the active `yearId`, create new ones, and delete only behind a named confirm — safe because each year is an independent snapshot.',
        },
        {
          id: 'm7-t10',
          title: 'Clone Previous Year as a Prisma Transaction',
          explain:
            'Implement **`years.clone`** to copy a year forward — its Maganes\' households, its pooja **columns + rates**, all carried into a new year — while **resetting every tick to unchecked**, wrapped in a single **Prisma transaction**.',
          analogy:
            'At the start of a season the committee photocopies last year\'s book: the same households, the same rate sheet — but they rub out all the tick marks so this year\'s participation starts blank. Cloning is that photocopy-then-erase-the-ticks, done atomically so the new book is never left half-copied.',
          theory:
            'Most years look a lot like the previous one — the same households in the same Maganes, a similar set of poojas and rates. So **clone** is the friendly way to start a new year: copy the **PoojaTypes** (names, **rates**, `showAsColumn`) and the **PersonEntries** (households, name/address, mobile, Magane) from the source year into a freshly created target year, then **reset all Participation** so no household is ticked yet. The committee then just ticks this year\'s participation and tweaks any changed rates.\n\nThe critical property is **atomicity**: a clone must either fully happen or not at all — a half-cloned year (columns but no households, or households with no rate sheet) would be a broken snapshot. So you do the whole thing inside a **`prisma.$transaction`**: create the year, create the copied PoojaTypes (keeping an old-id → new-id map), create the copied households, and create no Participation rows so every tick starts unchecked. If any step fails, the transaction rolls back and no partial year is left behind.\n\nResetting ticks matters: you copy the **structure** (who is in the book, what the poojas and rates are) but **not** last year\'s participation, because participation is a fresh fact each year. The old-id → new-id map is the linchpin if you choose to pre-create unchecked Participation rows pointing at the new PoojaTypes. Because years are independent snapshots, the clone reads the source year read-only and writes an entirely separate target year — no cross-year ripple.',
          whyItMatters:
            'Re-entering hundreds of households and a full rate sheet every year would be punishing; clone turns a new year into a few minutes of ticking. Doing it as one transaction guarantees the new year is a complete, consistent snapshot — never a half-copied book — and resetting ticks keeps each year\'s participation an honest, fresh record.',
          steps: [
            'Create the target Year inside a `prisma.$transaction`.',
            'Copy the source year\'s PoojaTypes (name, rate, showAsColumn), keeping old→new id map.',
            'Copy the source year\'s households (name/address, mobile, Magane) into the new year.',
            'Reset participation: create no ticks (unchecked default) for the new year.',
            'Roll back the whole transaction if any step fails — no partial year.',
            'Read the source year read-only; write only the new, independent target year.',
          ],
          code: `// main — years.clone: copy people + columns + rates forward, reset ticks, atomically.
ipcMain.handle('years:clone', async (_e, sourceYearId: string, label: string) => {
  return prisma.\$transaction(async (tx) => {
    const target = await tx.year.create({ data: { label, isLocked: false } });

    const srcPoojas = await tx.poojaType.findMany({ where: { yearId: sourceYearId } });
    for (const p of srcPoojas) {
      await tx.poojaType.create({
        data: {
          yearId: target.id,
          name: p.name,
          rate: p.rate,                 // carry the rate forward (Decimal)
          showAsColumn: p.showAsColumn,
          position: p.position,
        },
      });
    }

    const srcPeople = await tx.personEntry.findMany({ where: { yearId: sourceYearId } });
    for (const person of srcPeople) {
      await tx.personEntry.create({
        data: {
          yearId: target.id,
          maganeId: person.maganeId,
          name: person.name,
          mobile: person.mobile,
          // NO participation copied → every tick starts unchecked
        },
      });
    }
    return target;                       // a complete, fresh snapshot
  });
});`,
          pitfalls: [
            'Cloning without a transaction, leaving a half-copied year if a step fails.',
            'Copying last year\'s ticks forward, so the new year starts pre-filled and wrong.',
            'Forgetting to carry rates forward, so the new year\'s rate sheet is blank.',
            'Losing the old→new PoojaType id map if you DO pre-create participation rows.',
            'Writing into the source year by mistake instead of only the new target year.',
            'Copying Maganes too — Maganes are global and shared, not per-year.',
          ],
          tryIt:
            'Clone 2025 into 2026 and confirm the households and rate sheet came across but every tick is unchecked. Then force an error mid-clone (e.g. a bad field) and confirm NO partial 2026 year is left — the transaction rolled back.',
          takeaway:
            '`years.clone` copies households and pooja columns + rates into a new year and resets all ticks, wrapped in a `prisma.$transaction` so the new year is always a complete, independent snapshot.',
        },
        {
          id: 'm7-t11',
          title: 'Lock-Year: Making a Finalised Year Read-Only',
          explain:
            'Call **`years.setLocked(id, true)`** to flip a year\'s `isLocked` flag, making its register read-only across the **whole UI** — grid, edit popup, and Rates screen — to protect finalised records; unlock to edit again.',
          analogy:
            'When the committee closes a season\'s accounts, they sign off the ledger and put it in the archive: no more ticks, no rate changes, no new households — it is the official record. Locking a year is that sign-off. Unlocking is taking the book back out of the archive to make a correction.',
          theory:
            'A Year has an **`isLocked`** boolean. Locking — `years.setLocked(id, true)` — marks a finalised year so its data cannot change. The lock must be honoured **everywhere**: the register grid disables ticking, the EditPersonDialog/edit popup goes read-only, add/delete/reorder are blocked, and the **Rates screen inputs** are disabled too (a finalised year\'s rates are history). This is the same locked-year guard introduced for data entry in Module 6, now extended to cover rates and totals as well.\n\nThe robust pattern is **defence in depth**: in the UI, disable the controls so the user cannot even start an edit on a locked year; and in the **main process**, reject writes for a locked year (check `isLocked` before any update) so a stale screen can never sneak a change through. The grand total of a locked year is therefore frozen — ₹16,20,160 for 2025 stays ₹16,20,160 no matter what.\n\n**Unlocking** (`setLocked(id, false)`) re-enables editing for deliberate corrections. Keep unlock itself behind a confirm or an admin gesture so finalised records are not casually reopened. Because each year is an independent snapshot, locking one year freezes exactly that year and nothing else — you can have 2023 and 2024 locked while 2025 is live, each frozen or editable on its own.',
          whyItMatters:
            'A finalised year is the temple\'s official financial record; allowing stray edits would undermine its integrity and could silently change a past grand total. The lock — enforced in both the UI and main — is what makes \'finalised\' actually mean read-only, protecting every past year\'s ₹ figure while leaving the current year fully editable.',
          steps: [
            'Add `isLocked Boolean @default(false)` to Year (already in the schema).',
            'Expose `years.setLocked(id, locked)` to flip the flag.',
            'In the UI, when locked: disable grid ticks, the edit popup, add/delete/reorder, AND the Rates inputs.',
            'In main, reject any write for a year whose `isLocked` is true (defence in depth).',
            'Provide an unlock path (`setLocked(id, false)`), ideally behind a confirm.',
            'Rely on the snapshot model so locking one year never affects another.',
          ],
          code: `// main — setLocked flips the flag; writes re-check it (defence in depth).
ipcMain.handle('years:setLocked', async (_e, id: string, locked: boolean) => {
  return prisma.year.update({ where: { id }, data: { isLocked: locked } });
});

async function assertEditable(yearId: string) {
  const year = await prisma.year.findUnique({ where: { id: yearId } });
  if (year?.isLocked) throw new Error('Year is locked (read-only)');   // reject the write
}
// Call assertEditable(yearId) at the start of updateEntry, reorder, poojaTypes.save, etc.

// Renderer: disable controls when locked.
// <input type='number' value={p.rate} disabled={yearLocked} ... />   // Rates screen
// <input type='checkbox' checked={ticked} disabled={yearLocked} ... /> // grid ticks`,
          pitfalls: [
            'Guarding the lock only in the UI, so a stale screen can still write to a locked year.',
            'Locking the grid but leaving the Rates screen editable, so a finalised year\'s rates can still change.',
            'Forgetting one edit path (reorder, or a rate save) and letting it slip past the lock.',
            'No visible disabled state, so the user tries to edit a locked year and is confused.',
            'Making unlock too casual, so finalised records are reopened by accident.',
            'Assuming locking one year affects others — it only freezes that year\'s snapshot.',
          ],
          tryIt:
            'Lock 2025 with `setLocked`, then try to change a rate, tick a pooja, and add a household — all controls should be disabled. Then attempt a write from a stale handler and confirm main rejects it with the \'Year is locked\' error. Unlock and confirm editing returns.',
          takeaway:
            '`years.setLocked(id, true)` flips `isLocked`, making the whole UI read-only for that year (grid, popup, Rates) and rejecting writes in main; unlock re-enables editing, with each year frozen independently.',
        },
        {
          id: 'm7-t12',
          title: 'Why the Snapshot Model Makes Clone and Lock Safe',
          explain:
            'Because every Year owns its **own** PoojaTypes, rates, households and ticks (a **snapshot**), clone and lock have **no cross-year ripple** — copying or freezing one year can never alter another.',
          analogy:
            'Each year being a separate physical ledger is what lets the committee photocopy one (clone) or seal one in the archive (lock) without disturbing the others. If all years shared one loose-leaf binder, pulling a page or copying one would risk the rest. Separate books make both operations obviously safe.',
          theory:
            'The whole module rests on one design choice: **year-scoped entries**. PoojaTypes (with their rates), PersonEntries and Participation all belong to a specific Year; only Maganes are global. This means a Year is a **self-contained snapshot** — a complete, independent record of that season.\n\nThat independence is exactly what makes the two headline operations safe. **Clone** reads the source year purely as a template and writes an entirely separate target year; nothing it does can touch the source or any other year, so there is no risk of a copy bleeding back into history. **Lock** sets a flag on one year and freezes only that year\'s data; because no other year shares its rates or ticks, freezing 2025 leaves 2024 and 2026 completely unaffected. The same property is why editing this year\'s rates (Section 1) never rewrites a past total, and why the grand total of a locked year stays fixed.\n\nThe contrast clarifies it: if rates or households were **shared/global**, cloning would have to reference shared data (so a later rate edit would retroactively change the cloned year), and locking could not really freeze a year (since a shared rate could still move underneath it). The snapshot model removes both hazards by construction. The cost — some duplicated data across years — is a deliberate, worthwhile trade for a financial record where each year must stand alone, immutable once finalised.',
          whyItMatters:
            'Clone and lock are only trustworthy because of the snapshot model. It is the architectural reason the committee can copy a year forward and finalise past years without fear of corrupting history — the deeper guarantee behind every concrete operation in this module, and why each year\'s ₹ total is a permanent fact.',
          steps: [
            'Scope PoojaTypes, rates, households and ticks to a specific Year (only Maganes are global).',
            'Treat each Year as a complete, independent snapshot of that season.',
            'Clone by reading the source read-only and writing a fully separate target year.',
            'Lock by flagging one year, freezing only its data with no shared state to leak.',
            'Accept duplicated data across years as the deliberate price of independence.',
            'Reason about any new operation by asking \'could this ripple into another year?\' — it should not.',
          ],
          code: `// Snapshot model: everything below Year is year-scoped, so no ripple.
// Year ──┬── PoojaType[]   (rates live here, per year)
//        ├── PersonEntry[] (households, per year)
//        └── Participation  (ticks, per year)
// Magane is GLOBAL (shared across years); everything else is a per-year snapshot.

// Clone reads source read-only, writes a separate target → cannot touch other years.
// Lock flips one year's isLocked → freezes only that snapshot.
// Editing 2025 rates can never change 2024's grand total: different rows, different year.`,
          pitfalls: [
            'Sharing rates or households globally, so a clone references mutable data that later shifts.',
            'Assuming lock can freeze a year while a shared rate still moves underneath it.',
            'Letting a clone write into the source year, breaking the read-only-template rule.',
            'Worrying about the duplicated data instead of valuing the independence it buys.',
            'Adding a new feature that quietly couples two years (e.g. a cross-year rate reference).',
            'Forgetting that Maganes are the one shared thing — over-duplicating them per year.',
          ],
          tryIt:
            'Lock 2024, then edit 2025\'s rates and re-run `register:yearTotals` for BOTH years. Confirm 2025\'s total changes while 2024\'s stays frozen. That isolation — one year moving, another fixed — is the snapshot model proving itself.',
          takeaway:
            'Year-scoped snapshots (only Maganes are global) give clone and lock their safety: copying or freezing one year cannot ripple into another, which is why each year\'s ₹ total is a permanent, independent fact.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm7-p1',
      type: 'Project',
      title: 'Rates Screen + Totals',
      domain: 'Village temple register / Electron + React + TypeScript + Prisma + local PostgreSQL',
      duration: '4 hours',
      description:
        'Build the money core of Upralli Seva: a per-year Rates screen ("ಸೇವಾ ದರಗಳು") to edit each pooja type\'s ₹ rate (with rate-only extras and the "ಕಾಲಂ" column toggle), saved as Decimal in Prisma and number across IPC via poojaTypes.save, plus a register that shows per-person poojaAmount, the per-Magane "ಒಟ್ಟು ಸಂಗ್ರಹ" and a year-wide grand total in a top bar — all printed with the real Indian-grouped money() formatter (2025 = ₹16,20,160).',
      tools: ['Electron', 'React 18', 'TypeScript', 'Prisma', 'PostgreSQL', 'Prisma.Decimal', 'TanStack Query', 'contextBridge / IPC'],
      blueprint: {
        overview:
          'Stand up the per-year rates and the collection totals that fall out of them: a Rates screen editing PoojaType rates (Decimal in Prisma, number over IPC) with rate-only poojas and the column toggle, and a register computing poojaAmount, per-Magane "ಒಟ್ಟು ಸಂಗ್ರಹ" and the grand total via register:yearTotals, displayed with the Indian-grouped money() formatter.',
        functionalRequirements: [
          '**Rates screen.** "ಸೇವಾ ದರಗಳು" lists the current year\'s PoojaTypes; each row edits a ₹ rate as a controlled number input, read-only when the year is locked.',
          '**Rate-only + column toggle.** A "ಕಾಲಂ" toggle flips `showAsColumn`; rate-only poojas (`showAsColumn:false`) carry a rate and count toward totals but never become grid columns.',
          '**Save rates.** `poojaTypes.save(yearId, items)` commits the set, converting number→Decimal in main; loading maps Decimal→number for the renderer.',
          '**Totals.** poojaAmount(person) = Σ ticked rates; per-Magane "ಒಟ್ಟು ಸಂಗ್ರಹ" = Σ over its households; grand total = Σ over all Maganes, via `register:yearTotals`.',
          '**Indian-grouped money.** Every ₹ figure is printed with the real money() (last 3, then 2-2), avoiding the double-comma bug, with the grand total in a top bar.',
        ],
        technicalImplementation: [
          '**Schema.** PoojaType with `rate Decimal`, `showAsColumn Boolean`, scoped to a Year; Year with `isLocked`.',
          '**Rates UI.** A RatesScreen of controlled number inputs in local state keyed by PoojaType id, a "ಕಾಲಂ" checkbox per row, and an add-rate-only control.',
          '**IPC money boundary.** `poojaTypes.save` wraps `new Prisma.Decimal(rate)` in a `$transaction`; loading maps `rate.toNumber()` so the renderer only sees numbers.',
          '**Totals call.** `register:yearTotals` builds the rate map once, sums poojaAmount per Magane and overall, returns `{ grandTotal, perMagane }` as numbers.',
          '**money() helper.** The real theme.ts formatter (last 3 then 2-2, guarded leading remainder) reused for per-person, per-Magane and grand-total display.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Rates screen with rate-only poojas + column toggle',
            outcome: 'A per-year Rates screen edits ₹ rates, supports rate-only poojas, and toggles columns.',
            prompt:
              'In an Electron + React 18 + TypeScript renderer with Prisma in main, build a RatesScreen ("ಸೇವಾ ದರಗಳು") that loads the current year\'s PoojaTypes (id, Kannada name, rate, showAsColumn) into local state and renders one row each: the Kannada label, a controlled number input bound to rate (immutable update by id), and a "ಕಾಲಂ" checkbox that flips showAsColumn. Add an \'add rate-only pooja\' control that creates a PoojaType with showAsColumn:false. The register grid should render only PoojaTypes where showAsColumn is true. Disable all rate inputs and toggles when the year is locked.',
          },
          {
            step: 2,
            label: 'Save rates: Decimal in Prisma, number across IPC',
            outcome: 'Rates persist exactly as Decimal while the renderer only handles plain numbers.',
            prompt:
              'Implement poojaTypes.save(yearId, items) where items is { id, rate, showAsColumn }[] with rate as a plain number. In main, run a prisma.$transaction that updates each PoojaType, converting rate via new Prisma.Decimal(it.rate) for exact storage. When loading PoojaTypes for the renderer, map each rate with rate.toNumber() so React only ever binds plain numbers to the number inputs. Expose poojaTypes.save and the loader via contextBridge so the renderer never imports Prisma. Verify a fractional rate like 250.50 round-trips without float drift.',
          },
          {
            step: 3,
            label: 'Totals + Indian-grouped money() display',
            outcome: 'Per-person, per-Magane and grand totals compute correctly and print Indian-grouped.',
            prompt:
              'Add register:yearTotals(yearId) in main: build a rate map once, compute poojaAmount(person) = Σ rate over each ticked PoojaType id, sum per Magane for "ಒಟ್ಟು ಸಂಗ್ರಹ" and overall for the grand total, returning { grandTotal, perMagane } as numbers. In the renderer, display each household\'s poojaAmount, each Magane\'s "ಒಟ್ಟು ಸಂಗ್ರಹ" at its block foot, and the grand total in a top bar — all via the real money() formatter (Indian grouping: last 3 then 2-2, guarded leading remainder so ₹1,080 never becomes ₹1,,080). Confirm the 2025 grand total prints as ₹16,20,160.',
          },
        ],
        deliverable:
          'A working money core: a per-year Rates screen with rate-only poojas and a column toggle, rates saved as Decimal (number across IPC) via poojaTypes.save, and a register showing per-person, per-Magane "ಒಟ್ಟು ಸಂಗ್ರಹ" and a grand total in a top bar via register:yearTotals — all formatted with the Indian-grouped money() (2025 = ₹16,20,160).',
      },
    },
    {
      id: 'm7-p2',
      type: 'Project',
      title: 'Clone & Lock a Year',
      domain: 'Village temple register / Electron + React + TypeScript + Prisma + local PostgreSQL',
      duration: '4 hours',
      description:
        'Implement the year lifecycle for Upralli Seva: years.clone copies a year\'s households and pooja columns + rates forward into a new year and resets every tick to unchecked, all in one Prisma transaction; and years.setLocked flips a year\'s isLocked flag so the whole UI — grid, edit popup and Rates screen — goes read-only, enforced in both the renderer and main, with each year frozen independently thanks to the snapshot model.',
      tools: ['Electron', 'React 18', 'TypeScript', 'Prisma', 'PostgreSQL', 'prisma.$transaction', 'contextBridge / IPC'],
      blueprint: {
        overview:
          'Wire the year lifecycle on top of the snapshot model: a year switcher (newest first, create, confirmed delete), an atomic years.clone that copies people + columns + rates forward and resets ticks, and years.setLocked that makes a finalised year read-only across the whole UI and rejects writes in main.',
        functionalRequirements: [
          '**Year switcher.** List years descending (newest first); picking one sets the active yearId; create a new year; delete only behind a named confirm.',
          '**Clone year.** `years.clone(sourceYearId, label)` copies households and pooja columns + rates into a new year and leaves every tick unchecked.',
          '**Atomic clone.** The whole clone runs in a `prisma.$transaction`, so a failure leaves no partial year.',
          '**Lock year.** `years.setLocked(id, true)` makes the grid, edit popup and Rates screen read-only; unlock re-enables editing.',
          '**Defence in depth.** The lock is enforced in the UI (disabled controls) AND in main (writes for a locked year are rejected); each year freezes independently.',
        ],
        technicalImplementation: [
          '**Year switcher.** Sort years by label desc; create/delete via window.api.years; a named confirm for delete.',
          '**Clone transaction.** Inside prisma.$transaction: create the target year, copy PoojaTypes (name, rate, showAsColumn), copy PersonEntries (name/address, mobile, Magane), create no Participation (ticks default unchecked).',
          '**setLocked.** A years.setLocked(id, locked) updating isLocked; the renderer reads yearLocked and disables controls.',
          '**Main-side guard.** An assertEditable(yearId) that throws if isLocked, called at the start of updateEntry, reorder, poojaTypes.save, addEntry and deleteEntry.',
          '**Snapshot isolation.** All copying reads the source read-only and writes a separate target year; locking one year touches no other.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Year switcher: pick (desc), create, confirmed delete',
            outcome: 'Years list newest-first; creating and deleting (confirmed) work cleanly.',
            prompt:
              'Build a year switcher that loads years and sorts them descending by label so the newest is first. Picking a year sets the active yearId that the Rates screen, register grid and register:yearTotals all read from. Add createYear(label) calling window.api.years.create, and deleteYear behind a confirm that shows the year label, calling window.api.years.delete (cascading that year\'s PoojaTypes/households/ticks). Optionally block deleting a locked year. Expose years.create/delete via contextBridge.',
          },
          {
            step: 2,
            label: 'years.clone as an atomic Prisma transaction',
            outcome: 'Cloning copies people + columns + rates forward and resets ticks, all-or-nothing.',
            prompt:
              'Implement years.clone(sourceYearId, label) in main inside a prisma.$transaction: create the target Year (isLocked false); copy every source PoojaType (name, rate as Decimal, showAsColumn, position) into the target; copy every source PersonEntry (name/address, mobile, maganeId) into the target; and create NO Participation rows so every tick starts unchecked. Keep an old→new PoojaType id map in case you pre-create unchecked participation. If any step throws, the transaction must roll back leaving no partial year. Do not copy Maganes (they are global). Verify the new year has the households and rate sheet but no ticks.',
          },
          {
            step: 3,
            label: 'years.setLocked + read-only everywhere',
            outcome: 'A locked year is read-only across the whole UI and rejected by main on writes.',
            prompt:
              'Implement years.setLocked(id, locked) updating the year\'s isLocked flag. In the renderer, read yearLocked and disable grid ticks, the EditPersonDialog/edit popup, add/delete/reorder controls, AND the Rates screen inputs and "ಕಾಲಂ" toggles. In main, add assertEditable(yearId) that loads the year and throws \'Year is locked\' if isLocked, and call it at the start of updateEntry, reorder, poojaTypes.save, addEntry and deleteEntry (defence in depth). Add an unlock path (setLocked id,false) behind a confirm. Verify locking 2025 freezes it while 2024/2026 stay editable.',
          },
        ],
        deliverable:
          'A complete year lifecycle: a newest-first year switcher with create and confirmed delete, an atomic years.clone that copies households and pooja columns + rates forward and resets ticks, and years.setLocked that makes a finalised year read-only across grid, popup and Rates — enforced in the UI and main, with each year frozen independently.',
      },
    },
  ],
  quiz: [
    {
      id: 'm7-q1',
      q: 'Why do the ₹ rates live on per-year PoojaTypes rather than on one global pooja record?',
      options: [
        'Because Prisma cannot store a shared rate',
        'So each Year is an independent snapshot — editing this year\'s prices never rewrites a past year\'s grand total, and clone/lock stay safe',
        'To make the database larger on purpose',
        'Because rates are not actually used in any total',
      ],
      answer: 1,
    },
    {
      id: 'm7-q2',
      q: 'A pooja has `showAsColumn: false`. What does that mean?',
      options: [
        'It is deleted and ignored entirely',
        'It still carries a rate and can count toward totals, but does not appear as a tick-box column in the register grid',
        'It is a column but has no rate',
        'It only shows on locked years',
      ],
      answer: 1,
    },
    {
      id: 'm7-q3',
      q: 'How is a rate stored and how does it cross the IPC boundary?',
      options: [
        'Stored as a JS float; sent as a string',
        'Stored as a Prisma Decimal (exact) in main, mapped to a plain number across IPC',
        'Stored as a number; sent as a Prisma Decimal object to the renderer',
        'Stored as text in both places',
      ],
      answer: 1,
    },
    {
      id: 'm7-q4',
      q: 'What does the real money() helper do, and what bug did its leading-remainder guard fix?',
      options: [
        'It groups digits 3-3-3 like Western numbers; it fixed a missing currency symbol',
        'It groups Indian-style (last 3, then 2-2, e.g. ₹16,20,160) and the `if (rest)` guard prevents a double comma like ₹1,,080',
        'It rounds to two decimals; it fixed a negative-sign bug',
        'It converts rupees to dollars; it fixed a locale crash',
      ],
      answer: 1,
    },
    {
      id: 'm7-q5',
      q: 'What does years.clone copy forward into the new year, and what does it do to participation?',
      options: [
        'It copies everything including last year\'s ticks unchanged',
        'It copies households and pooja columns + rates forward and resets all ticks to unchecked, in one Prisma transaction',
        'It copies only the Maganes and nothing else',
        'It copies the ticks but not the rates',
      ],
      answer: 1,
    },
    {
      id: 'm7-q6',
      q: 'What does years.setLocked(id, true) do, and why is the snapshot model what makes it safe?',
      options: [
        'It deletes the year; the snapshot model is irrelevant',
        'It makes that year read-only across the whole UI (grid, popup, Rates) and rejects writes in main — and because each year owns its own data, freezing one year never affects another',
        'It locks every year at once; years share one rate sheet',
        'It only hides the year from the picker without protecting its data',
      ],
      answer: 1,
    },
  ],
};
