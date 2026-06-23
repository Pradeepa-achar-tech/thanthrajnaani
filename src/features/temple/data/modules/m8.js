// Module M8 — Reports, Daily Closing & Local Backup (Maranakatte Seva)
// Teach the offline reporting and safety layer of the temple counter app:
// SQL aggregate reports (seva counts, collection by payment mode, date ranges),
// end-of-day cash reconciliation and day-closing, CSV export, and — since there
// is NO cloud — proper local backup/restore discipline with pg_dump/pg_restore.
// Stack ONLY: Electron + React + Vite + local PostgreSQL (pg). No C#/.NET/Dart.

export const m8 = {
  id: 'm8',
  title: 'Reports, Daily Closing & Local Backup',
  hours: 8,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Turn the day\'s seva receipts into real reports with SQL aggregates, reconcile and "close" the day so the books are final, export a day to CSV, and — because there is no cloud safety net — build proper offline backup and restore discipline with pg_dump and pg_restore so the temple\'s data is never lost.',
  sections: [
    {
      id: 'm8-s1',
      title: 'Reports with SQL aggregates',
      topics: [
        {
          id: 'm8-t1',
          title: 'Why aggregate reports (GROUP BY thinking)',
          explain:
            'A report does not list every receipt — it **summarises** them: how many of each seva, how much money total. That summarising is exactly what SQL `GROUP BY` with `COUNT` and `SUM` does.',
          analogy:
            'At the end of a busy evening the Maranakatte counter has a fat stack of 600 receipt carbons. The manager does not read each one aloud. He sorts them into piles by seva — a Rangapooje pile, a Mangalarathi pile, a Hannikaayi pile — and just counts each pile and adds up the cash in it. `GROUP BY` is making those piles in the database; `COUNT` is counting a pile; `SUM` is adding the money in it.',
          theory:
            'A **report** answers a question about *many rows at once* — "how many Rangapooje today?", "how much cash did we take?". Raw rows in the `receipts` table cannot answer that until you **aggregate** them.\n\nSQL aggregation has two halves. **`GROUP BY column`** makes one bucket per distinct value of that column (one bucket per seva name, one per payment mode). Then an **aggregate function** runs inside each bucket: **`COUNT(*)`** counts rows, **`SUM(amount)`** adds a numeric column, `AVG`, `MIN`, `MAX` and so on. Without `GROUP BY`, an aggregate collapses the whole table into a single number.\n\nIn this offline app the report runs in the **main process** (it owns the `pg` pool), the renderer asks for it over IPC, and React just paints the rows it gets back. The SQL does the heavy lifting — you never loop in JavaScript to count what the database can count for you in one query.',
          whyItMatters:
            'Letting Postgres aggregate is faster, simpler and less buggy than pulling 600 rows into the renderer and counting them in JavaScript. It is also the foundation every later report (totals, date ranges, daily closing) builds on, so getting the `GROUP BY` mental model right pays off across the whole module.',
          steps: [
            'Identify the **question**: counts per seva, or money per payment mode.',
            'Pick the **group column** (`seva_name`, or `payment_mode`).',
            'Choose the **aggregate**: `COUNT(*)` for tickets, `SUM(amount)` for money.',
            'Add a `WHERE` to limit rows first (e.g. only today\'s date).',
            'Write `GROUP BY <col>` and an `ORDER BY` so the report reads nicely.',
            'Run it from the main process and return the rows over IPC.',
          ],
          code: `-- One number for the whole table (no GROUP BY): total receipts today
SELECT COUNT(*) AS total_tickets,
       SUM(amount) AS total_collection
FROM receipts
WHERE receipt_date = CURRENT_DATE;

-- One row PER seva (GROUP BY makes the piles):
SELECT seva_name,
       COUNT(*)      AS ticket_count,
       SUM(amount)   AS amount_total   -- amount is numeric (rupees)
FROM receipts
WHERE receipt_date = CURRENT_DATE
GROUP BY seva_name
ORDER BY ticket_count DESC;            -- busiest seva first (Rangapooje!)`,
          pitfalls: [
            '**Selecting a column that is not grouped or aggregated.** Postgres errors: every selected column must be in `GROUP BY` or wrapped in an aggregate.',
            '**Counting in JavaScript.** Pulling all rows to the renderer to count them is slow and pointless — let `COUNT`/`SUM` do it.',
            '**Forgetting the `WHERE` date filter.** Without it you sum *all history*, not today; aggregate over the wrong rows and the report lies.',
            '**`SUM` on a column that can be NULL.** `SUM` skips NULLs, but a NULL amount usually means a data bug — make `amount` `NOT NULL`.',
            '**Using `COUNT(amount)` when you mean `COUNT(*)`.** `COUNT(col)` skips NULLs of that column; `COUNT(*)` counts every row in the bucket.',
            '**No `ORDER BY`.** Grouped rows come back in undefined order; sort them so the report is stable and readable.',
          ],
          tryIt:
            'In psql, run the per-seva query above against your receipts table. Confirm you get one row per seva with a count and a rupee total, and that Rangapooje has the biggest count.',
          takeaway:
            'A report summarises many rows: `GROUP BY` makes one bucket per value and `COUNT`/`SUM` reduce each bucket to a number — do it in SQL, not in JavaScript.',
        },
        {
          id: 'm8-t2',
          title: 'Daily seva count report',
          explain:
            'The first real report: for a chosen date, how many tickets of each seva were issued — Rangapooje, Mangalarathi, Hannikaayi and the rest — as one row per seva.',
          analogy:
            'It is the evening tally board outside the Maranakatte counter: "Today — Rangapooje 540, Mangalarathi 120, Hannikaayi 85." Each line is one `GROUP BY seva_name` bucket with its `COUNT`. The board tells the priest and the manager at a glance how heavy the day was.',
          theory:
            'The daily seva count is a `GROUP BY seva_name` over a single day. We parameterise the date so the same query serves *any* day — pass it as `$1` from `pg` rather than concatenating it into the SQL string.\n\nBecause `receipt_date` is a `date` (or you cast a timestamp with `::date`), `WHERE receipt_date = $1` selects exactly that day. Rangapooje alone is 500+ tickets a day at Maranakatte, so this report routinely has one dominant row — sorting by `ticket_count DESC` puts it on top.\n\nThe query lives in the **main process**, exposed as `api.reports.dailyCounts(date)`. The renderer never sees the database; it calls the preload-bridged function and renders the returned array. This keeps the Node/`pg` code in main and the renderer sandboxed, exactly as the security model demands.',
          whyItMatters:
            'The seva count is the temple\'s heartbeat — it tells staff how busy the day was, feeds the closing report, and is the simplest end-to-end example of "SQL aggregate in main, table in React". Nail it and every other report is a variation.',
          steps: [
            'Add `seva_name` and `receipt_date` columns to `receipts` (if not already there).',
            'Write the `GROUP BY seva_name` query with a `$1` date parameter.',
            'Expose `reports:daily-counts` over `ipcMain.handle` in main.',
            'Bridge it in preload as `api.reports.dailyCounts(date)`.',
            'Call it from React with a date picker defaulting to today.',
            'Render one table row per seva with its count.',
          ],
          code: `// main: parameterised daily seva-count query (in the main process)
ipcMain.handle('reports:daily-counts', async (_e, isoDate) => {
  const { rows } = await pool.query(
    \`SELECT seva_name, COUNT(*) AS ticket_count
       FROM receipts
      WHERE receipt_date = $1
      GROUP BY seva_name
      ORDER BY ticket_count DESC\`,
    [isoDate]                       // e.g. '2026-06-23' — never string-concat dates
  );
  return rows;                      // [{ seva_name: 'Rangapooje', ticket_count: '540' }, ...]
});

// preload: expose a safe, named function to the renderer
// contextBridge.exposeInMainWorld('api', {
//   reports: { dailyCounts: (date) => ipcRenderer.invoke('reports:daily-counts', date) }
// });`,
          pitfalls: [
            '**Concatenating the date into the SQL.** Use `$1`; string-building invites SQL injection and date-format bugs.',
            '**Comparing a `timestamp` to a `date`.** If `receipt_date` is a timestamp, filter with `receipt_date::date = $1` or a half-open range.',
            '**Assuming `COUNT` returns a JS number.** `pg` returns `bigint` counts as strings; parse with `Number(row.ticket_count)` before maths.',
            '**Running the query in the renderer.** The renderer has no DB access by design; the query must run in main and travel over IPC.',
            '**Timezone drift on "today".** `CURRENT_DATE` uses the server timezone; send an explicit ISO date from the renderer to avoid midnight surprises.',
            '**No empty-day handling.** A day with no receipts returns zero rows — show "No sevas recorded" rather than a blank table.',
          ],
          tryIt:
            'Wire `api.reports.dailyCounts(today)` end to end and log the result in the renderer. Issue a few test receipts for different sevas and confirm the counts match.',
          takeaway:
            'The daily seva-count report is a parameterised `GROUP BY seva_name` running in main and surfaced to React over IPC — Rangapooje on top.',
        },
        {
          id: 'm8-t3',
          title: 'Collection totals by payment mode',
          explain:
            'Money side of the report: total rupees collected today split into **Cash** and **UPI**, using `SUM(amount)` grouped by `payment_mode`.',
          analogy:
            'When the counter closes, the cash drawer and the UPI phone are tallied separately — notes counted by hand, UPI read off the payment app. `GROUP BY payment_mode` with `SUM(amount)` is the database doing that same split: one rupee total for the cash pile, one for the UPI pile.',
          theory:
            'Amounts are stored as Postgres **`numeric`** (never `float`) so rupees and paise are exact. `SUM(amount)` adds them precisely; a `numeric` sum stays `numeric`, so no rounding creeps in.\n\n`GROUP BY payment_mode` gives one row per mode — `cash`, `upi`. Add `COUNT(*)` alongside `SUM(amount)` and each row tells you both *how many* transactions and *how much money* per mode. A trailing `ROLLUP` or a separate grand-total query gives the day\'s overall figure.\n\nThe cash total is the number the **end-of-day reconciliation** (next section) checks against the physically counted cash, so this report is not just informational — it is the input to closing the day.',
          whyItMatters:
            'Splitting cash from UPI is essential for honest counter accounting: cash must match the drawer, UPI must match the payment app. Getting `numeric` SUMs exactly right means the books reconcile to the rupee, which is the whole point of a billing app.',
          steps: [
            'Ensure `amount` is `numeric` and `payment_mode` is a constrained text/enum.',
            'Write `SUM(amount)` and `COUNT(*)` grouped by `payment_mode` for the date.',
            'Add a grand-total row (separate query or `GROUP BY ROLLUP`).',
            'Return `{ byMode: [...], grandTotal }` from the main handler.',
            'Render rupee totals with `toLocaleString(\'en-IN\')` in React.',
            'Highlight the **cash** total — closing will reconcile against it.',
          ],
          code: `-- Collection split by payment mode for one day
SELECT payment_mode,
       COUNT(*)    AS txn_count,
       SUM(amount) AS amount_total      -- numeric: exact rupee total
FROM receipts
WHERE receipt_date = $1
GROUP BY payment_mode
ORDER BY payment_mode;                  -- -> cash, upi

-- Grand total for the day (all modes together)
SELECT SUM(amount) AS day_total
FROM receipts
WHERE receipt_date = $1;

-- Format in React, not SQL:
-- Number(row.amount_total).toLocaleString('en-IN',
--   { style: 'currency', currency: 'INR' })  ->  ₹2,45,300.00`,
          pitfalls: [
            '**Storing money as `float`/`double`.** Floating point loses paise; use `numeric` so SUMs are exact.',
            '**Free-text payment modes.** "Cash", "cash", "CASH" split into three buckets — constrain `payment_mode` to a known set.',
            '**Formatting currency in SQL.** Keep SUMs as raw `numeric` and format with `toLocaleString(\'en-IN\')` in the renderer.',
            '**Treating the `numeric` SUM as a JS number.** `pg` returns `numeric` as a string; parse with `Number()` only for display, keep strings for exactness if you do further maths.',
            '**Forgetting refunds/cancellations.** If receipts can be voided, exclude them (`WHERE status <> \'cancelled\'`) or the totals overstate collection.',
            '**Mismatched grand total.** Make sure the grand total equals the sum of the per-mode rows, or the report contradicts itself.',
          ],
          tryIt:
            'Run the by-mode query for today, then the grand-total query, and confirm the two cash+upi rows add up to the grand total to the exact rupee.',
          takeaway:
            'Collection totals are `SUM(amount)` grouped by `payment_mode` over `numeric` money, giving exact cash and UPI figures that feed daily reconciliation.',
        },
        {
          id: 'm8-t4',
          title: 'Date-range reports & per-seva revenue',
          explain:
            'Reports over a span of days using `WHERE receipt_date BETWEEN $1 AND $2`, including per-seva revenue so the temple sees which seva earns the most over a week or month.',
          analogy:
            'The Maranakatte trust meets monthly and asks: "How did the whole month go, and which seva brought in the most?" That is no longer one day\'s tally board but a ledger summed across the month — `BETWEEN` selects the month\'s rows, and `GROUP BY seva_name` with `SUM(amount)` ranks the earners.',
          theory:
            'A **date-range** report swaps the single-date filter for `receipt_date BETWEEN $1 AND $2` (inclusive on both ends). For ranges over a `date` column this is clean; over a `timestamp` prefer a **half-open** range `>= $1 AND < $2_plus_one_day` so the last day is fully included regardless of time of day.\n\n**Per-seva revenue** combines the range filter with `GROUP BY seva_name` and `SUM(amount)`, ordered by the total descending — the temple sees its top earners across the period. You can add `COUNT(*)` to show volume alongside value (Rangapooje is high volume; a one-off Yakshagana booking may be high value, low count).\n\nAll of this is still pure SQL in the main process. The renderer passes two ISO dates; main parameterises them and returns ranked rows. The same pattern extends to monthly summaries and trust reports without new machinery.',
          whyItMatters:
            'Trust committees and audits think in weeks and months, not single days. A date-range, per-seva revenue report turns the receipt table into the management view the temple actually needs for planning and transparency.',
          steps: [
            'Accept two ISO dates (from, to) from the renderer.',
            'Filter with `receipt_date BETWEEN $1 AND $2` (or half-open for timestamps).',
            'Group by `seva_name`, `SUM(amount)` as revenue, `COUNT(*)` as volume.',
            'Order by revenue `DESC` to rank top earners.',
            'Validate `from <= to` before running the query.',
            'Return ranked rows; render with a period header and grand total.',
          ],
          code: `-- Per-seva revenue across a date range (inclusive)
SELECT seva_name,
       COUNT(*)    AS ticket_count,
       SUM(amount) AS revenue
FROM receipts
WHERE receipt_date BETWEEN $1 AND $2     -- $1 = from, $2 = to (ISO 'YYYY-MM-DD')
GROUP BY seva_name
ORDER BY revenue DESC;                    -- top-earning seva first

-- Safer half-open form if receipt_date is a timestamp:
-- WHERE receipt_date >= $1
--   AND receipt_date <  ($2::date + INTERVAL '1 day')

// main: validate the range before querying
// if (new Date(from) > new Date(to)) throw new Error('From date is after To date');`,
          pitfalls: [
            '**Off-by-one on the end date.** With timestamps, `BETWEEN` can miss the last day\'s evening receipts — use a half-open `< to+1day` range.',
            '**Swapped from/to.** Validate `from <= to`; a reversed range returns nothing and looks like "no data".',
            '**Huge unbounded ranges.** Guard against accidental "all time" queries on a growing table; cap or warn on very wide ranges.',
            '**Mixing revenue and volume confusingly.** Show both `SUM` (money) and `COUNT` (tickets) so a high-value, low-count seva is not misread.',
            '**Locale date parsing.** Pass ISO `YYYY-MM-DD` strings, not locale-formatted dates, so the parameter is unambiguous.',
            '**Forgetting cancelled receipts.** Exclude voided rows from revenue or the range totals are inflated.',
          ],
          tryIt:
            'Run the per-seva revenue query for the last 7 days. Confirm the top row is the highest-earning seva and that the counts look sensible (Rangapooje should dominate volume).',
          takeaway:
            '`WHERE receipt_date BETWEEN $1 AND $2` with `GROUP BY seva_name` and `SUM(amount)` gives ranked per-seva revenue over any period — use a half-open range for timestamps.',
        },
        {
          id: 'm8-t5',
          title: 'Rendering a report table in React',
          explain:
            'Take the rows returned over IPC and render them as a clean React table with a date picker, per-row figures, and a footer **grand total**.',
          analogy:
            'The SQL did the counting in the back room; React is the neatly written tally board hung at the front of the Maranakatte counter — rows for each seva, rupee figures aligned, and a bold total line at the bottom that everyone reads first.',
          theory:
            'The report screen is an ordinary React component. On mount (and whenever the chosen date changes) it calls `api.reports.daily(date)` — a single main-process call that returns both the seva rows and the payment-mode totals. State holds `rows`, `loading`, and `error`.\n\nRender the rows with `.map`, each in a `<tr>` with a stable `key` (the seva name). Compute the **grand total** either from the returned grand-total field or by reducing the rows client-side, and show it in a `<tfoot>`. Money is formatted at the edge with `Number(x).toLocaleString(\'en-IN\', { style: \'currency\', currency: \'INR\' })` — formatting belongs in the view, not the database.\n\nHandle the three states every data screen needs: **loading** (spinner/placeholder), **error** (the IPC call failed), and **empty** (a valid day with no receipts). A date picker bound to state lets staff flip between days; changing it re-runs the query.',
          whyItMatters:
            'A report is only useful if staff can read it. Clean rendering with a date picker, Indian-format rupees, a visible grand total, and proper loading/empty/error states turns raw query rows into a tool the counter actually uses every evening.',
          steps: [
            'Create a `DailyReport` component with `date` state defaulting to today.',
            'In `useEffect`, call `api.reports.daily(date)` and store rows + totals.',
            'Handle loading, error, and empty (no receipts) states explicitly.',
            'Render rows with `.map` and a stable `key`.',
            'Format rupees with `toLocaleString(\'en-IN\')` in the cells.',
            'Show the grand total in a `<tfoot>` row.',
          ],
          code: `function DailyReport() {
  const [date, setDate] = React.useState(
    new Date().toISOString().slice(0, 10)   // 'YYYY-MM-DD'
  );
  const [data, setData] = React.useState({ rows: [], grandTotal: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    window.api.reports.daily(date)
      .then(setData)
      .finally(() => setLoading(false));
  }, [date]);

  const inr = (n) =>
    Number(n).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  if (loading) return <p>Loading report…</p>;
  if (data.rows.length === 0) return <p>No sevas recorded for {date}.</p>;

  return (
    <table>
      <thead><tr><th>Seva</th><th>Tickets</th><th>Collection</th></tr></thead>
      <tbody>
        {data.rows.map((r) => (
          <tr key={r.seva_name}>
            <td>{r.seva_name}</td>
            <td>{r.ticket_count}</td>
            <td>{inr(r.amount_total)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr><td>Grand Total</td><td></td><td>{inr(data.grandTotal)}</td></tr>
      </tfoot>
    </table>
  );
}`,
          pitfalls: [
            '**Using the array index as `key`.** Use the seva name; index keys break when rows reorder.',
            '**No loading/empty/error states.** A blank table during the IPC round-trip looks broken; render all three states.',
            '**Formatting money in SQL.** Keep raw `numeric` from the query and format with `toLocaleString` in the cell.',
            '**Re-fetching on every render.** Put the call in `useEffect` keyed on `date`, not in the render body.',
            '**Grand total drifting from the rows.** Derive it from the same data the rows use, or compute it once in main and trust that.',
            '**Forgetting `bigint` counts are strings.** Render them directly or `Number()` them; do not do maths on the string accidentally.',
          ],
          tryIt:
            'Build the `DailyReport` component and a date picker. Switch between two dates and confirm the table, totals, and empty-state message all update correctly.',
          takeaway:
            'Render report rows with `.map`, a stable key, Indian-rupee formatting, a `<tfoot>` grand total, and explicit loading/empty/error states — formatting lives in React, not SQL.',
        },
      ],
    },
    {
      id: 'm8-s2',
      title: 'Daily closing',
      topics: [
        {
          id: 'm8-t6',
          title: 'End-of-day cash reconciliation',
          explain:
            'At close, compare the **expected** cash (the SUM of today\'s cash receipts) against the **counted** cash physically in the drawer, and record the difference.',
          analogy:
            'Every evening the Maranakatte counter clerk empties the cash box and counts the notes by hand, then compares the heap to what the receipts say should be there. If the receipt total says ₹54,000 but the box holds ₹53,900, there is a ₹100 short to explain before the priest locks the cupboard. Reconciliation is that count-and-compare ritual, written into the app.',
          theory:
            '**Reconciliation** pairs two numbers: **expected cash** = `SUM(amount) WHERE payment_mode = \'cash\'` for the day (from the receipts), and **counted cash** = what the clerk physically counts. Their difference is the **variance**: positive means the drawer is over, negative means short.\n\nWe store a `daily_closing` row per date capturing `expected_cash`, `counted_cash`, `variance`, the UPI total (for completeness), who closed it and when, and an optional note explaining any variance. Computing the difference is trivial; the discipline is **recording** it so a short or excess is never silently swallowed.\n\nThe expected figure comes straight from the by-mode report of the previous topic, so reconciliation reuses work you already did. The clerk enters the counted amount in the UI; the app shows the variance live before the day is closed.',
          whyItMatters:
            'Cash handling is where small temples lose money and trust. A nightly reconciliation that surfaces even a ₹100 variance — and forces a note to explain it — builds accountability and catches mistakes (or theft) the same day, not months later in an audit.',
          steps: [
            'Compute expected cash = `SUM(amount)` where `payment_mode = \'cash\'` for the date.',
            'Let the clerk enter the counted cash from the drawer.',
            'Compute `variance = counted_cash - expected_cash`.',
            'Show the variance live with a clear over/short label.',
            'Require a note when the variance is non-zero.',
            'Save a `daily_closing` row with all figures, the user, and timestamp.',
          ],
          code: `-- Expected cash for the day (input to reconciliation)
SELECT COALESCE(SUM(amount), 0) AS expected_cash
FROM receipts
WHERE receipt_date = $1 AND payment_mode = 'cash';

CREATE TABLE daily_closing (
  closing_date   date PRIMARY KEY,          -- one closing per day
  expected_cash  numeric(12,2) NOT NULL,
  counted_cash   numeric(12,2) NOT NULL,
  variance       numeric(12,2) NOT NULL,    -- counted - expected
  upi_total      numeric(12,2) NOT NULL DEFAULT 0,
  note           text,                       -- required if variance <> 0
  closed_by      text NOT NULL,
  closed_at      timestamptz NOT NULL DEFAULT now()
);

// renderer: live variance as the clerk types the counted amount
// const variance = Number(countedCash) - Number(expectedCash);
// label = variance === 0 ? 'Balanced' : variance > 0 ? 'Excess' : 'Short';`,
          pitfalls: [
            '**Not recording the variance.** Always store it; a silently-fixed short defeats the purpose of reconciling.',
            '**Allowing a non-zero variance with no note.** Force an explanation so shorts/excesses are accountable.',
            '**Comparing UPI to drawer cash.** UPI is not in the drawer; reconcile cash against cash only.',
            '**Floating-point money.** Use `numeric` for expected, counted and variance so the difference is exact.',
            '**No `closed_by`.** Record who counted and closed; attribution is half the value of reconciliation.',
            '**Re-closing the same day.** A `date` primary key (or upsert) stops two conflicting closings for one day.',
          ],
          tryIt:
            'Compute expected cash for today, enter a counted amount ₹100 lower, and confirm the app shows a "Short ₹100" variance and demands a note before letting you save.',
          takeaway:
            'Reconciliation compares expected cash (`SUM` of cash receipts) to counted cash, records the variance with a mandatory note when non-zero, and stamps who closed the day.',
        },
        {
          id: 'm8-t7',
          title: 'Closing a day (locking further edits)',
          explain:
            'Once a day is reconciled and "closed", the app **locks** that date so no one can add, edit or delete receipts for it — the books for that day are final.',
          analogy:
            'When the priest locks the day\'s cash cupboard and signs the register, that day is sealed — you cannot quietly slip another receipt into yesterday\'s pile. "Closing a day" is turning that key in software: after it, the date is read-only.',
          theory:
            'Closing means a date moves from **open** (receipts can be written) to **closed** (read-only). The simplest mechanism: the existence of a `daily_closing` row *is* the lock. Before inserting, editing, or deleting any receipt, the main process checks "is this receipt\'s date closed?" and refuses if so.\n\nEnforce it where it cannot be bypassed — in the **main process** write paths, and ideally with a database guard too. A `BEFORE INSERT/UPDATE/DELETE` trigger that raises an exception when the row\'s `receipt_date` exists in `daily_closing` makes the lock airtight even against a stray query. Provide a deliberate, audited **re-open** path (manager only) for genuine corrections, rather than letting anyone edit a closed day freely.\n\nClosing should happen *after* reconciliation, so the figures are final before the lock. The UI greys out write actions for closed dates and shows a "Closed on <date> by <user>" banner.',
          whyItMatters:
            'Without a lock, yesterday\'s totals can change after they were reported to the trust, destroying trust in the numbers. A hard close makes each day\'s books immutable, which is exactly what honest accounting and any future audit require.',
          steps: [
            'Treat a `daily_closing` row for a date as that date being closed.',
            'In every receipt write path in main, reject writes to a closed date.',
            'Add a DB trigger that blocks insert/update/delete on closed dates.',
            'Grey out write actions in the UI for closed dates.',
            'Show a "Closed by / on" banner for closed days.',
            'Offer a manager-only, audited re-open for corrections.',
          ],
          code: `-- A trigger makes the lock airtight at the database level
CREATE OR REPLACE FUNCTION block_closed_day()
RETURNS trigger AS $$
DECLARE d date := COALESCE(NEW.receipt_date, OLD.receipt_date);
BEGIN
  IF EXISTS (SELECT 1 FROM daily_closing WHERE closing_date = d) THEN
    RAISE EXCEPTION 'Day % is closed; receipts cannot be changed', d;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_block_closed_day
BEFORE INSERT OR UPDATE OR DELETE ON receipts
FOR EACH ROW EXECUTE FUNCTION block_closed_day();

// main: cheap pre-check before attempting a write (friendlier error)
// const { rowCount } = await pool.query(
//   'SELECT 1 FROM daily_closing WHERE closing_date = $1', [date]);
// if (rowCount) throw new Error('That day is closed.');`,
          pitfalls: [
            '**Enforcing the lock only in the UI.** Greying out buttons is not security; enforce in main and the DB.',
            '**No re-open path.** Genuine corrections happen; provide an audited, manager-only re-open rather than no escape hatch.',
            '**Closing before reconciling.** Close *after* the cash count so the locked figures are the final ones.',
            '**Trigger that ignores DELETE.** Cover INSERT, UPDATE *and* DELETE, and use `OLD` for deletes.',
            '**Silent failures.** Surface the trigger\'s exception to the user as a clear "day is closed" message, not a raw error.',
            '**Closing future or empty days by accident.** Only allow closing a date that has actually been reconciled.',
          ],
          tryIt:
            'Close today, then try to insert a receipt dated today. Confirm the trigger raises "Day is closed" and the UI blocks the action with a friendly message.',
          takeaway:
            'Closing a day means a `daily_closing` row locks that date; enforce read-only with a main-process check and a DB trigger, and provide an audited manager-only re-open.',
        },
        {
          id: 'm8-t8',
          title: 'Exporting a day to CSV',
          explain:
            'Write a day\'s collection to a simple **CSV file** from the main process so it can be opened in Excel, emailed, or handed to the trust accountant.',
          analogy:
            'Sometimes the trust accountant wants the day\'s figures on a spreadsheet, not inside the app. Exporting to CSV is photocopying the day\'s register onto a sheet anyone can carry away and open in Excel — the app stays the source of truth, the CSV is a portable copy.',
          theory:
            'A **CSV** (comma-separated values) is just text: a header line, then one line per row, fields separated by commas. Because file writing is a Node capability, the CSV writer lives in the **main process** using `fs.writeFileSync` (or `fs.promises.writeFile`) — the sandboxed renderer cannot and should not touch the filesystem.\n\nThe one real subtlety is **escaping**: any field containing a comma, a double-quote, or a newline must be wrapped in double quotes, and internal quotes doubled (`"` → `""`). A devotee name or a note can easily contain a comma, so a tiny `escapeCsv` helper is essential — do not just `join(\',\')` raw values.\n\nThe flow: renderer asks `api.export.dailyCsv(date)`; main runs the report query, builds the CSV string, shows a save dialog (`dialog.showSaveDialog`) so the user picks where to save (including a USB drive), writes the file, and returns the path for a success message. Use a clear default name like `maranakatte-2026-06-23.csv`.',
          whyItMatters:
            'Temples often have to share figures with trustees, auditors, or a part-time accountant who lives in Excel. A correct CSV export — with proper escaping so a devotee\'s comma-containing name does not break the columns — makes the app a good citizen in that paper-and-spreadsheet world.',
          steps: [
            'Query the day\'s receipts (or the per-seva summary) in main.',
            'Write an `escapeCsv` helper that quotes fields with commas/quotes/newlines.',
            'Build a header line plus one escaped line per row.',
            'Show `dialog.showSaveDialog` with a sensible default filename.',
            'Write the file with `fs.promises.writeFile` (UTF-8, with BOM if Excel needs it).',
            'Return the saved path and show a success toast.',
          ],
          code: `const fs = require('fs/promises');
const { dialog } = require('electron');

function escapeCsv(value) {
  const s = String(value ?? '');
  // Quote if the field contains a comma, quote or newline; double internal quotes.
  return /[",\\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

ipcMain.handle('export:daily-csv', async (_e, isoDate) => {
  const { rows } = await pool.query(
    \`SELECT receipt_no, seva_name, devotee_name, payment_mode, amount
       FROM receipts WHERE receipt_date = $1 ORDER BY receipt_no\`,
    [isoDate]
  );

  const header = ['Receipt', 'Seva', 'Devotee', 'Mode', 'Amount'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([r.receipt_no, r.seva_name, r.devotee_name, r.payment_mode, r.amount]
      .map(escapeCsv).join(','));
  }
  const csv = '\\uFEFF' + lines.join('\\r\\n');   // BOM helps Excel read UTF-8

  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: \`maranakatte-\${isoDate}.csv\`
  });
  if (canceled) return null;
  await fs.writeFile(filePath, csv, 'utf8');
  return filePath;
});`,
          pitfalls: [
            '**Naive `join(\',\')` without escaping.** A devotee name with a comma shifts every column; always escape fields.',
            '**Writing files from the renderer.** The renderer is sandboxed; do file I/O in main and return the path.',
            '**Wrong line endings / no BOM.** Excel on Windows likes `\\r\\n` and a UTF-8 BOM for non-ASCII names (Kannada).',
            '**Hard-coding the save path.** Let the user choose via `showSaveDialog` so they can target a USB drive.',
            '**No header row.** Without column headers the CSV is unreadable; always write the header first.',
            '**Ignoring the cancel case.** If the user cancels the dialog, do not write a file or throw — return cleanly.',
          ],
          tryIt:
            'Export today to CSV and open it in Excel. Add a test receipt whose devotee name contains a comma and re-export — confirm the columns stay aligned thanks to escaping.',
          takeaway:
            'CSV export runs in main with `fs` and a save dialog; escape any field containing commas/quotes/newlines and add a UTF-8 BOM so Excel reads Kannada names correctly.',
        },
      ],
    },
    {
      id: 'm8-s3',
      title: 'Backup & restore (no cloud!)',
      topics: [
        {
          id: 'm8-t9',
          title: 'Why offline backup discipline matters',
          explain:
            'With no cloud, the temple\'s entire seva history lives on **one local disk**. If that disk dies and there is no backup, the data is gone forever — so disciplined local backups are not optional.',
          analogy:
            'A cloud app is like keeping the temple register in a safe-deposit vault at the bank — even if the temple floods, the bank\'s copy survives. This app keeps the register only in the temple office cupboard. That is private and works without internet, but if the cupboard burns, nothing remains unless someone has been photocopying the register and keeping copies elsewhere. Backups are those photocopies kept off-site.',
          theory:
            'This app deliberately runs **fully offline**: PostgreSQL and the data live on the counter PC under the OS. The trade-off is stark — there is **no automatic cloud copy**. A failed hard disk, ransomware, a clumsy `DROP`, or a stolen PC each means *total data loss* unless a backup exists elsewhere.\n\nGood discipline follows the classic **3-2-1** idea, scaled to a small temple: keep **multiple** copies, on **at least two** media (the PC plus a USB drive), with **one off-site** (a USB the priest takes home). Backups must be **regular** (ideally daily), **tested** (a backup you have never restored is just hope), and **timestamped** so you can roll back to a specific day.\n\nThe next topics turn this discipline into features: `pg_dump` to make a copy, a "Backup now" button that writes a timestamped dump to a chosen folder or USB, a tested restore with `pg_restore`/`psql`, and an automatic backup on app close. The headline you set in onboarding — that the **uninstaller asks KEEP-or-DELETE the data** — is the same concern: this data only exists where you put it.',
          whyItMatters:
            'For an offline app, backup *is* the disaster-recovery plan — there is no second line of defence. Instilling the discipline (regular, off-site, tested) is the difference between a one-hour recovery and losing years of the temple\'s records permanently.',
          steps: [
            'Accept that local-only means the team owns all recovery — there is no cloud.',
            'Adopt 3-2-1: multiple copies, two media (PC + USB), one off-site.',
            'Schedule backups regularly — daily for an active counter.',
            'Timestamp every backup so you can restore a specific day.',
            'Store at least one copy off the counter PC (USB taken home).',
            'Periodically **test** a restore — an untested backup is not a backup.',
          ],
          code: `// The data lives only here — under the OS userData folder:
//   app.getPath('userData')  e.g. C:\\Users\\<name>\\AppData\\Roaming\\MaranakatteSeva
//
// No cloud copy exists. Recovery options if the disk dies:
//   - a pg_dump file on a USB drive   -> RESTORE possible
//   - nothing                         -> DATA LOST FOREVER
//
// Discipline (3-2-1 for a small temple):
//   3 copies  : live DB + last night's USB dump + the priest's home USB
//   2 media   : counter PC disk + USB drive
//   1 off-site: a USB kept away from the temple
//
// Rule: a backup you have never restored is only a hope, not a backup.`,
          pitfalls: [
            '**Assuming "it is on the computer, so it is safe".** One disk is a single point of failure; one accident loses everything.',
            '**Keeping the only backup on the same PC.** A theft or fire takes the backup with the original — keep one off-site.',
            '**Never testing a restore.** Untested dumps can be corrupt or incomplete; you find out at the worst moment.',
            '**Irregular backups.** A monthly backup means up to a month of receipts lost; back up daily for an active counter.',
            '**No timestamps.** Overwriting one backup file gives you no history to roll back to a known-good day.',
            '**Forgetting the data is under `userData`.** If you do not know where the data lives, you cannot back it up or reason about the uninstaller.',
          ],
          tryIt:
            'Locate your app\'s data: log `app.getPath(\'userData\')`. Then write down a concrete 3-2-1 plan for the temple (where each of the three copies lives). Realise that without step 3, one disk failure ends the data.',
          takeaway:
            'Offline means no cloud safety net — backup IS the recovery plan; follow 3-2-1 (multiple copies, two media, one off-site), timestamped, regular, and tested.',
        },
        {
          id: 'm8-t10',
          title: 'pg_dump: backing up the local database',
          explain:
            '`pg_dump` is PostgreSQL\'s built-in tool that copies an entire database into a single file you can later restore — the core of every backup feature here.',
          analogy:
            '`pg_dump` is the office photocopier that copies the *whole* seva register — every page, in order — onto one neat bundle you can carry away. Restoring later is feeding that bundle back to rebuild an identical register.',
          theory:
            '**`pg_dump`** reads one database and writes its schema and data to an output file. Two formats matter here: **plain SQL** (`-Fp`, the default) produces a `.sql` text file of `CREATE`/`INSERT` statements you restore with `psql`; **custom** (`-Fc`) produces a compressed `.dump` you restore with `pg_restore`, which also lets you restore selectively and in parallel. For a small temple DB either is fine; plain `.sql` is the most human-readable and beginner-friendly.\n\nYou run it as a separate executable, so from Electron\'s main process spawn it with Node\'s `child_process`. Pass connection info via flags (`-h`, `-p`, `-U`, `-d`) and the password via the **`PGPASSWORD`** environment variable on the spawned process (never on the command line, where it would be visible). Direct the output to a file with `-f` or by redirecting stdout.\n\nBecause `pg_dump` ships with PostgreSQL, you must know its path — on a bundled offline app, ship or locate the Postgres `bin` folder so `pg_dump` is callable even on a PC where Postgres is not on the global PATH.',
          whyItMatters:
            '`pg_dump` is the single most important command for an offline app\'s survival. Understanding its formats and how to run it safely from Electron is what lets you build a reliable "Backup now" button and a restore path — the rest of this section is built on it.',
          steps: [
            'Confirm `pg_dump`\'s location (the PostgreSQL `bin` folder).',
            'Choose a format: plain `.sql` (`-Fp`) or custom `.dump` (`-Fc`).',
            'Build the connection flags (`-h -p -U -d`) for the local DB.',
            'Pass the password via `PGPASSWORD` in the spawned process\'s env.',
            'Spawn `pg_dump` from main with `child_process` and an output path.',
            'Check the exit code and the file exists before reporting success.',
          ],
          code: `// Run pg_dump from the Electron main process (plain SQL format)
const { spawn } = require('child_process');

function runPgDump(outFile) {
  return new Promise((resolve, reject) => {
    const args = [
      '-h', 'localhost', '-p', '5432',
      '-U', 'maranakatte',          // db user
      '-d', 'maranakatte_seva',     // db name
      '-Fp',                        // plain SQL (.sql); use -Fc for custom .dump
      '-f', outFile                 // write here
    ];
    const child = spawn(PG_DUMP_PATH, args, {
      env: { ...process.env, PGPASSWORD: dbPassword }  // never put pw on the CLI
    });
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (code) =>
      code === 0 ? resolve(outFile) : reject(new Error(stderr || 'pg_dump failed')));
  });
}

// Equivalent command line (what the spawn runs):
//   PGPASSWORD=*** pg_dump -h localhost -p 5432 -U maranakatte \\
//     -d maranakatte_seva -Fp -f backup.sql`,
          pitfalls: [
            '**`pg_dump` not on PATH.** On a bundled offline app, locate or ship the Postgres `bin` folder and use the full path.',
            '**Password on the command line.** Visible in process lists; pass it via `PGPASSWORD` in the spawned env instead.',
            '**Version mismatch.** A newer server may refuse an older `pg_dump`; match `pg_dump` to the server major version.',
            '**Ignoring the exit code.** A non-zero exit means a failed/partial dump — check it and read stderr before claiming success.',
            '**Dumping while the file path is wrong/unwritable.** Verify the target folder exists and is writable, or the dump silently fails.',
            '**Confusing the formats.** A `-Fc` custom dump must be restored with `pg_restore`, not `psql`; a plain `.sql` with `psql`.',
          ],
          tryIt:
            'From a terminal, run `pg_dump -U <user> -d maranakatte_seva -Fp -f test-backup.sql` (entering the password when prompted). Open the `.sql` file and see the `CREATE TABLE` / `INSERT` statements that are your backup.',
          takeaway:
            '`pg_dump` copies the whole database to a file (plain `.sql` or custom `.dump`); run it from main with `child_process`, pass the password via `PGPASSWORD`, and check the exit code.',
        },
        {
          id: 'm8-t11',
          title: 'A "Backup now" feature to a folder or USB',
          explain:
            'Wire `pg_dump` to a button: the user picks a folder (or USB drive), and the app writes a **timestamped** `.sql` dump there with success/error feedback.',
          analogy:
            'A single big "Backup now" button by the counter, like a fire-drill bell anyone can press: the priest plugs in a USB, clicks it, and a dated copy of the whole register lands on the drive — "maranakatte-2026-06-23-2105.sql". No commands, no fuss.',
          theory:
            'The feature ties together pieces you already have. The renderer\'s Settings screen calls `api.backup.now()`. Main shows `dialog.showOpenDialog({ properties: [\'openDirectory\'] })` so the user chooses a destination folder — which can be a **USB drive** path. Main builds a **timestamped filename** (e.g. `maranakatte-YYYY-MM-DD-HHmm.sql`) so backups never overwrite each other and you can see at a glance when each was taken.\n\nMain then runs `pg_dump` (previous topic) targeting `path.join(chosenDir, fileName)`, awaits the exit code, and returns either the saved path (success) or a clear error. The renderer shows a toast: "Backup saved to E:\\maranakatte-….sql" or "Backup failed: <reason>".\n\nGood touches: disable the button while a backup runs, verify the file exists and is non-empty afterwards, and remember the last chosen folder so the priest does not re-pick the USB each night. Because everything runs in main, the renderer stays sandboxed and never touches `fs` or `child_process` directly.',
          whyItMatters:
            'A backup that requires typing terminal commands will never be run by temple staff. A one-click "Backup now" to a USB, with a dated filename and plain feedback, is what actually gets backups taken every day — turning the discipline of topic 9 into a habit.',
          steps: [
            'Add a "Backup now" button on the Settings screen calling `api.backup.now()`.',
            'In main, show a directory picker (`showOpenDialog`, `openDirectory`).',
            'Build a timestamped filename `maranakatte-<date>-<time>.sql`.',
            'Run `pg_dump` to `path.join(dir, fileName)`.',
            'Verify the file exists and is non-empty after the dump.',
            'Return success (path) or error; show a toast in the renderer.',
          ],
          code: `const path = require('path');
const fs = require('fs/promises');
const { dialog } = require('electron');

ipcMain.handle('backup:now', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Choose a folder or USB drive for the backup',
    properties: ['openDirectory']
  });
  if (canceled) return { ok: false, reason: 'cancelled' };

  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace(/[:T]/g, '-'); // 2026-06-23-21-05
  const outFile = path.join(filePaths[0], \`maranakatte-\${stamp}.sql\`);

  try {
    await runPgDump(outFile);                 // from the previous topic
    const { size } = await fs.stat(outFile);  // sanity-check it is non-empty
    if (size === 0) throw new Error('Backup file is empty');
    return { ok: true, path: outFile, size };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
});

// renderer (Settings): const res = await window.api.backup.now();
//   res.ok ? toast('Backup saved to ' + res.path) : toast('Backup failed: ' + res.reason);`,
          pitfalls: [
            '**Overwriting one fixed filename.** Timestamp every dump so each night\'s backup is kept, not clobbered.',
            '**Not verifying the file.** Check it exists and `size > 0`; a "success" toast on an empty file is dangerous.',
            '**Blocking the UI.** `pg_dump` runs async in main; disable the button and show progress, do not freeze the renderer.',
            '**Assuming the USB is plugged in.** Handle a missing/removed drive (write error) with a clear message.',
            '**Doing file/dialog work in the renderer.** Keep `dialog`, `fs`, and `child_process` in main; renderer only calls `api.backup.now()`.',
            '**Forgetting the last folder.** Remember the chosen directory so daily backups are one click, not a re-navigation.',
          ],
          tryIt:
            'Build the "Backup now" button, plug in a USB drive, and click it. Confirm a timestamped `.sql` file appears on the drive and the success toast shows its path. Unplug the drive and click again to see the error path.',
          takeaway:
            'A one-click "Backup now" runs `pg_dump` to a user-chosen folder/USB with a timestamped filename, verifies the file, and reports success or a clear error — all from main.',
        },
        {
          id: 'm8-t12',
          title: 'Restoring from a backup (and testing it)',
          explain:
            'Restore rebuilds the database from a dump: `psql` for a plain `.sql` file, `pg_restore` for a custom `.dump`. And crucially — you must **test** the restore, not just assume it works.',
          analogy:
            'Taking photocopies of the register is only half the safety. The real test is whether you can rebuild the original register *from* the copies. Restoring is feeding the bundle back; testing the restore is doing that rebuild on a spare desk first, so you know the copies are actually readable before the day you truly need them.',
          theory:
            'How you restore depends on how you dumped. A **plain `.sql`** dump is replayed with **`psql -d <db> -f backup.sql`** — it runs the `CREATE`/`INSERT` statements. A **custom `.dump`** is restored with **`pg_restore -d <db> backup.dump`**, which can drop-and-recreate (`-c`), restore selected tables, or run in parallel (`-j`).\n\nRestoring usually targets a **fresh or emptied database** so old and new data do not collide; for a full recovery you create an empty `maranakatte_seva` and restore into it. Like `pg_dump`, you spawn `psql`/`pg_restore` from main with `child_process`, pass `PGPASSWORD` in the env, and check the exit code.\n\nThe non-negotiable part is **testing**: periodically restore last night\'s dump into a throwaway database (e.g. `maranakatte_test`) and confirm row counts match. A dump that has never been restored might be truncated, corrupt, or from the wrong day — and you do not want to discover that during a real disaster. Build a "Verify last backup" action that restores into a temp DB and reports the receipt count.',
          whyItMatters:
            'A backup is worthless if it cannot be restored, and untested backups fail far more often than people expect. Knowing the exact restore command for your dump format — and routinely testing it — is what makes the whole offline-safety story real rather than theoretical.',
          steps: [
            'Match the restore tool to the dump: `psql -f` for `.sql`, `pg_restore` for `.dump`.',
            'Create an empty target database for a full restore.',
            'Spawn the restore tool from main with `PGPASSWORD` in env.',
            'Check the exit code and surface any errors.',
            'To **test**: restore last night\'s dump into a throwaway DB.',
            'Compare row counts (e.g. receipts) to confirm the restore is complete.',
          ],
          code: `// Restore a plain .sql dump with psql (full recovery into a fresh DB)
//   createdb maranakatte_seva           # empty target
//   PGPASSWORD=*** psql -U maranakatte -d maranakatte_seva -f backup.sql

// Restore a custom .dump with pg_restore (clean + recreate objects)
//   PGPASSWORD=*** pg_restore -U maranakatte -d maranakatte_seva -c backup.dump

// Spawn from main, same pattern as pg_dump:
const { spawn } = require('child_process');
function restoreSql(dbName, sqlFile) {
  return new Promise((resolve, reject) => {
    const child = spawn(PSQL_PATH,
      ['-U', 'maranakatte', '-d', dbName, '-f', sqlFile],
      { env: { ...process.env, PGPASSWORD: dbPassword } });
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (code) =>
      code === 0 ? resolve(true) : reject(new Error(stderr)));
  });
}

// TEST the backup: restore into a throwaway DB and count rows.
//   await restoreSql('maranakatte_test', lastNightDump);
//   SELECT COUNT(*) FROM receipts;   -- should match production count`,
          pitfalls: [
            '**Using the wrong tool for the format.** `psql` cannot read a custom `.dump`; `pg_restore` cannot read plain `.sql`.',
            '**Restoring over a live DB.** Restore into a fresh/empty database (or use `-c`) so you do not collide with existing rows.',
            '**Never testing.** An untested dump may be corrupt or partial; restore-test it regularly into a throwaway DB.',
            '**Ignoring restore errors.** Watch the exit code and stderr; a half-restored DB is worse than an obvious failure.',
            '**Password on the command line.** Use `PGPASSWORD` in the spawned env for restore too.',
            '**Forgetting roles/ownership.** If the dump references a DB user that does not exist on the new machine, create it first or the restore errors.',
          ],
          tryIt:
            'Create a throwaway database `maranakatte_test`, restore your `pg_dump` `.sql` into it with `psql -f`, then run `SELECT COUNT(*) FROM receipts;` and confirm the count matches your live database.',
          takeaway:
            'Restore with `psql -f` for `.sql` or `pg_restore` for `.dump`, into a fresh database — and always test the restore into a throwaway DB so you know the backup truly works.',
        },
        {
          id: 'm8-t13',
          title: 'Scheduling an automatic daily backup',
          explain:
            'Make backups happen without anyone remembering: run a dump automatically, for example **on app close** or once a day, to a default backup folder.',
          analogy:
            'Relying on the priest to remember the backup every night is fragile — busy festival evenings, it gets forgotten. An automatic backup is the temple bell that rings itself: when the app shuts for the night, it quietly photocopies the register on its own, every time.',
          theory:
            'Manual backups depend on memory; automatic ones do not. Two practical triggers for an offline desktop app:\n\n**On app close** — hook Electron\'s `app.on(\'before-quit\', …)` (or the main window\'s `close`) to run `pg_dump` to a default backup folder before the process exits. This guarantees a fresh dump every day the app is used. Take care to let the async dump finish before the app actually quits (e.g. `event.preventDefault()`, await the dump, then `app.exit()`).\n\n**Time-based** — while the app is running, a `setInterval` or a check on launch ("has today\'s backup been taken?") can write a daily dump. For an offline app you avoid OS schedulers and keep it inside the app so it works wherever the app runs.\n\nEither way, keep a **rotation**: write timestamped files and prune old ones (e.g. keep the last 14 days) so the backup folder does not grow forever. Record the last successful backup time so the UI can warn "no backup in 3 days". Crucially, automatic backups **complement** the off-site USB habit — they protect against forgetting, but a copy on the same disk still needs to leave the building.',
          whyItMatters:
            'The most reliable backup is the one nobody has to remember. Automating a daily dump on close removes human forgetfulness — the single biggest cause of "we had no backup" — while rotation and a last-backup warning keep the safety net healthy over time.',
          steps: [
            'Pick a trigger: `before-quit` (on close) and/or a daily check on launch.',
            'On the trigger, run `pg_dump` to a default backup folder.',
            'For `before-quit`, await the dump before letting the app exit.',
            'Write timestamped files and rotate (keep last N days).',
            'Record the last successful backup time.',
            'Warn in the UI if no backup has succeeded recently; still prompt the off-site USB copy.',
          ],
          code: `const { app } = require('electron');
const path = require('path');

let backupDone = false;

app.on('before-quit', async (event) => {
  if (backupDone) return;                 // avoid looping on app.quit()
  event.preventDefault();                 // hold the quit until the dump finishes
  try {
    const dir = path.join(app.getPath('userData'), 'backups');
    const stamp = new Date().toISOString().slice(0, 10);      // daily file
    await runPgDump(path.join(dir, \`auto-\${stamp}.sql\`));
    await pruneOldBackups(dir, 14);       // keep the last 14 days
    setLastBackupTime(new Date());
  } catch (err) {
    console.error('Auto-backup failed:', err);  // do not block quit forever
  } finally {
    backupDone = true;
    app.quit();                           // now really exit
  }
});

// On launch you can also check: if no auto-<today>.sql exists, run one.
// And remember: an on-disk backup still needs an off-site USB copy.`,
          pitfalls: [
            '**Quitting before the async dump finishes.** Use `event.preventDefault()` and await, or the backup is cut off mid-write.',
            '**Infinite quit loop.** Guard with a flag (`backupDone`) so calling `app.quit()` after the dump does not re-trigger the handler.',
            '**No rotation.** Daily dumps without pruning fill the disk; keep the last N days and delete older ones.',
            '**Auto-backup to the same disk only.** It guards against forgetting, not against disk failure — still keep an off-site USB copy.',
            '**Silent auto-backup failures.** Record and surface failures; a warning "no backup in 3 days" must reach the user.',
            '**Blocking quit forever on error.** If the dump fails, log it and still let the app exit rather than trapping the user.',
          ],
          tryIt:
            'Hook `before-quit` to run a dump into `userData/backups`, then close the app. Reopen and confirm a fresh `auto-<today>.sql` exists. Force an error (bad path) and confirm the app still quits and logs the failure.',
          takeaway:
            'Automate a daily dump on app close (await it before quitting, guard against loops), rotate timestamped files, record the last backup, and still keep an off-site USB copy.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm8-p1',
      type: 'Project',
      title: 'Daily Report Screen',
      domain: 'Temple Seva Counter',
      duration: '3 hours',
      description:
        'Build a React report screen that calls api.reports.daily(date) and renders seva counts and rupee totals by payment mode — computed by SQL GROUP BY aggregates in the main process — as a table with a grand total.',
      tools: ['Electron', 'React', 'Vite', 'PostgreSQL (pg)', 'IPC + contextBridge'],
      blueprint: {
        overview:
          'Recreate Maranakatte\'s evening tally board in software. The main process owns the pg pool and runs aggregate queries (seva counts, collection by cash/UPI); the sandboxed renderer asks for a date over IPC and paints a clean table with a grand total. Pure offline, no cloud.',
        functionalRequirements: [
          '**Date picker** defaulting to today, re-running the report on change.',
          '**Seva counts** — one row per seva (Rangapooje, Mangalarathi, Hannikaayi…) with its ticket count.',
          '**Collection by mode** — exact `numeric` cash and UPI totals.',
          '**Grand total** — the day\'s total collection in a footer row.',
          '**States** — loading, empty (no receipts), and error handled explicitly.',
        ],
        technicalImplementation: [
          '**SQL aggregates.** `GROUP BY seva_name` with `COUNT(*)`, and `GROUP BY payment_mode` with `SUM(amount)`.',
          '**Main process.** `ipcMain.handle(\'reports:daily\', …)` running parameterised `$1` date queries on the pg pool.',
          '**Preload bridge.** `contextBridge` exposes `api.reports.daily(date)`; nodeIntegration off, contextIsolation on.',
          '**React render.** `.map` rows with stable keys, `toLocaleString(\'en-IN\')` rupee formatting, `<tfoot>` grand total.',
          '**Money.** Amounts as `numeric`; parse `pg` string results with `Number()` only for display.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Aggregate queries in main',
            outcome: 'A reports:daily IPC handler returning seva counts and mode totals.',
            prompt:
              'In an Electron main process using the pg Pool, write an ipcMain.handle(\'reports:daily\', (e, isoDate) => …) that runs two parameterised queries for a given date: one GROUP BY seva_name with COUNT(*) AS ticket_count and SUM(amount) AS amount_total, and one GROUP BY payment_mode with SUM(amount). Also compute a grand total. Return { rows, byMode, grandTotal }. Use $1 for the date, treat amount as numeric, and never string-concatenate the date.',
          },
          {
            step: 2,
            label: 'Preload bridge',
            outcome: 'A safe api.reports.daily exposed to the renderer.',
            prompt:
              'Write an Electron preload script that uses contextBridge.exposeInMainWorld(\'api\', …) to expose reports.daily(date) which calls ipcRenderer.invoke(\'reports:daily\', date). Assume nodeIntegration is off and contextIsolation is on. Explain why the renderer must never touch the pg pool directly and only talks to main through this bridge.',
          },
          {
            step: 3,
            label: 'React report table',
            outcome: 'A DailyReport component with date picker, table, and grand total.',
            prompt:
              'Build a React DailyReport component with a date input defaulting to today (YYYY-MM-DD). In a useEffect keyed on the date, call window.api.reports.daily(date) and store the result. Render a table of seva rows (name, ticket count, collection) with stable keys, format rupees with toLocaleString(\'en-IN\', { style: \'currency\', currency: \'INR\' }), show a <tfoot> grand total, and handle loading, empty (no receipts), and error states.',
          },
        ],
      },
    },
    {
      id: 'm8-p2',
      type: 'Project',
      title: 'Backup to Folder',
      domain: 'Temple Seva Counter',
      duration: '3 hours',
      description:
        'Build a main-process feature that runs pg_dump to write a timestamped .sql backup to a user-chosen folder (or USB drive), triggered from a Settings screen, with clear success/error feedback — the offline safety net for a no-cloud app.',
      tools: ['Electron', 'child_process', 'pg_dump', 'PostgreSQL', 'IPC + contextBridge'],
      blueprint: {
        overview:
          'Give Maranakatte a one-click backup. From a Settings screen the priest clicks "Backup now", picks a folder or USB drive, and the main process spawns pg_dump to write a timestamped .sql copy of the whole database there, returning success with the path or a clear error. Because there is no cloud, this is the temple\'s disaster-recovery plan.',
        functionalRequirements: [
          '**Backup now button** on a Settings screen calling api.backup.now().',
          '**Folder/USB picker** via a directory dialog so the user chooses the destination.',
          '**Timestamped filename** like maranakatte-2026-06-23-2105.sql so backups never overwrite.',
          '**Verification** — the file exists and is non-empty before reporting success.',
          '**Feedback** — a toast showing the saved path or the failure reason.',
        ],
        technicalImplementation: [
          '**Spawn pg_dump.** child_process.spawn from main with -h -p -U -d flags and -Fp -f outFile.',
          '**Secure password.** Pass PGPASSWORD in the spawned env, never on the command line.',
          '**Directory dialog.** dialog.showOpenDialog({ properties: [\'openDirectory\'] }) for the destination.',
          '**Exit-code handling.** Resolve on code 0, reject with stderr otherwise; stat the file for non-zero size.',
          '**IPC + preload.** ipcMain.handle(\'backup:now\') exposed as api.backup.now(); renderer stays sandboxed.',
        ],
        prompts: [
          {
            step: 1,
            label: 'pg_dump runner in main',
            outcome: 'A function that spawns pg_dump to a file and resolves on success.',
            prompt:
              'In an Electron main process, write a runPgDump(outFile) function using child_process.spawn that runs pg_dump with -h localhost -p 5432 -U <user> -d maranakatte_seva -Fp -f outFile, passing the DB password via PGPASSWORD in the spawned env (not on the command line). Collect stderr, resolve with outFile on exit code 0, and reject with the stderr message otherwise. Note how to use the full path to pg_dump when it is not on PATH.',
          },
          {
            step: 2,
            label: 'Backup-now IPC handler',
            outcome: 'A backup:now handler that picks a folder and writes a timestamped dump.',
            prompt:
              'Write ipcMain.handle(\'backup:now\', …) that shows dialog.showOpenDialog with properties [\'openDirectory\'] to choose a folder or USB drive, builds a timestamped filename like maranakatte-<YYYY-MM-DD-HHmm>.sql, calls runPgDump to that path, then uses fs.stat to confirm the file is non-empty. Return { ok: true, path, size } on success or { ok: false, reason } on cancel/error.',
          },
          {
            step: 3,
            label: 'Settings screen + feedback',
            outcome: 'A React Settings screen with a Backup now button and toasts.',
            prompt:
              'Build a React Settings component with a "Backup now" button that calls window.api.backup.now() (exposed via contextBridge). Disable the button while the backup runs, then show a success toast with the saved path or an error toast with the reason. Add a note reminding the user to keep one backup off-site on a USB drive, since the app is fully offline with no cloud copy.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm8-q1',
      q: 'Which SQL produces one row per seva with how many tickets each had today?',
      options: [
        'SELECT * FROM receipts WHERE receipt_date = CURRENT_DATE',
        'SELECT seva_name, COUNT(*) FROM receipts WHERE receipt_date = $1 GROUP BY seva_name',
        'SELECT SUM(amount) FROM receipts',
        'SELECT seva_name FROM receipts ORDER BY seva_name',
      ],
      answer: 1,
    },
    {
      id: 'm8-q2',
      q: 'Why are seva amounts stored as PostgreSQL numeric rather than float?',
      options: [
        'numeric sorts faster than float',
        'float cannot store values above 1000',
        'numeric stores rupees and paise exactly, so SUM totals do not drift',
        'pg cannot return float values to JavaScript',
      ],
      answer: 2,
    },
    {
      id: 'm8-q3',
      q: 'In end-of-day reconciliation, the cash variance is:',
      options: [
        'counted cash minus expected (SUM of cash receipts) cash',
        'the UPI total minus the cash total',
        'the number of receipts minus the number of sevas',
        'always zero by definition',
      ],
      answer: 0,
    },
    {
      id: 'm8-q4',
      q: 'What does "closing a day" do in this app?',
      options: [
        'Deletes that day\'s receipts to save space',
        'Uploads the day\'s data to the cloud',
        'Locks the date so receipts for it can no longer be added, edited, or deleted',
        'Exports the day automatically to a USB drive',
      ],
      answer: 2,
    },
    {
      id: 'm8-q5',
      q: 'Why is disciplined local backup critical for this app specifically?',
      options: [
        'Because PostgreSQL corrupts data every week',
        'Because there is no cloud copy — if the local disk fails with no backup, the data is lost forever',
        'Because Electron apps cannot save data at all',
        'Because the trust requires CSV files by law',
      ],
      answer: 1,
    },
    {
      id: 'm8-q6',
      q: 'You took a custom-format dump with pg_dump -Fc. Which tool restores it?',
      options: [
        'psql -f',
        'pg_restore',
        'cp / copy the file back',
        'npm run restore',
      ],
      answer: 1,
    },
  ],
};
