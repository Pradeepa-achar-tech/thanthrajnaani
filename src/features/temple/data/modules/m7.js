// Module M7 — Bookings: Yakshagana, Annadhana & Scheduled Sevas (Maranakatte Seva)
// Teach date-based bookings, which are unlike the instant counter sevas: a React
// date picker, storing a `date` in local PostgreSQL, preventing double-bookings,
// meal-sponsorship balance math, a bookings list with filters, and a
// booked -> confirmed -> cancelled status lifecycle updated over IPC.

export const m7 = {
  id: 'm7',
  title: 'Bookings: Yakshagana, Annadhana & Scheduled Sevas',
  hours: 8,
  color: 'from-yellow-500/20 to-yellow-700/10',
  accent: 'yellow',
  description:
    'Move beyond the instant counter sevas to date-based bookings: build a Yakshagana sponsorship form with a React date picker, store dates in local PostgreSQL, block double-booking the same evening, compute Annadhana meal balances with advances, and manage a bookings list whose status moves booked -> confirmed -> cancelled over IPC.',
  sections: [
    {
      id: 'm7-s1',
      title: 'Yakshagana booking',
      topics: [
        {
          id: 'm7-t1',
          title: 'Instant sevas vs date-based bookings',
          explain:
            'A counter seva like Mangalarathi happens **now**; a Yakshagana booking is for a **future date** a sponsor reserves in advance — so it needs a `date`, a sponsor, and a status.',
          analogy:
            'At the Maranakatte counter, a devotee paying for Hannikaayi is served on the spot, like buying a coconut at the Kundapura market and walking away with it. Booking a Yakshagana performance is more like reserving the community hall for a wedding: you pick an evening weeks ahead, pay an advance, and the temple writes your name against that date so nobody else takes it.',
          theory:
            'So far the app has handled **instant sevas** — the devotee pays, the seva is performed, the row records what already happened. A **booking** is different: it records something **scheduled for the future**, like a Yakshagana performance a family sponsors for next month.\n\nThat one difference — a **future date** — changes everything. A booking needs a `performance_date` column, a **status** (it has not happened yet, so "booked" is a state, not a fact), and rules the instant sevas never needed, like "only one Yakshagana per evening".\n\nIn this module every booking lives in a `bookings` table with a `booking_type` (`yakshagana` or `annadhana`), the usual devotee fields (`name`, `gotra`, `nakshatra`, `phone`), an `amount` and `advance_paid` in Postgres `numeric`, a `performance_date`, and a `status`. The same preload + IPC plumbing from earlier modules carries it, but the screens are forms and calendars instead of a fast counter.',
          whyItMatters:
            'Confusing an instant seva with a booking is the most common beginner mistake here, and it leads to a schema with no date and no status — which then cannot answer "what is scheduled this week?". Separating the two concepts cleanly from the start means the counter stays fast and the booking screens get the date, status, and validation they actually need.',
          steps: [
            'List how a booking differs from an instant seva: it has a future `date` and a `status`.',
            'Create a `bookings` table with `booking_type`, devotee fields, `amount`, `advance_paid`, `performance_date`, `status`.',
            'Reuse the same preload `contextBridge` API surface (e.g. `api.bookings.*`) as other features.',
            'Decide the allowed `booking_type` values: `yakshagana` and `annadhana`.',
            'Keep all `pg` calls in the MAIN process; the React form only talks over IPC.',
            'Plan the screens: a booking form, then a bookings list (built later in this module).',
          ],
          code: `-- One table for both kinds of date-based booking.\n` +
            `CREATE TABLE IF NOT EXISTS bookings (\n` +
            `  id               serial PRIMARY KEY,\n` +
            `  booking_type     text NOT NULL CHECK (booking_type IN ('yakshagana','annadhana')),\n` +
            `  devotee_name     text NOT NULL,\n` +
            `  gotra            text,\n` +
            `  nakshatra        text,\n` +
            `  phone            text,\n` +
            `  amount           numeric(10,2) NOT NULL DEFAULT 0,\n` +
            `  advance_paid     numeric(10,2) NOT NULL DEFAULT 0,\n` +
            `  performance_date date NOT NULL,\n` +
            `  status           text NOT NULL DEFAULT 'booked'\n` +
            `                     CHECK (status IN ('booked','confirmed','cancelled')),\n` +
            `  created_at       timestamptz NOT NULL DEFAULT now()\n` +
            `);`,
          pitfalls: [
            '**Reusing the instant-seva table for bookings.** It has no `performance_date` or `status`; bookings need their own table.',
            '**Storing the date as free text.** Use a real `date` column so range filters and uniqueness work.',
            '**Putting `pg` in the renderer.** Keep the database in MAIN; the form reaches it only through preload + IPC.',
            '**Leaving `booking_type` unconstrained.** A `CHECK` keeps the two kinds clean so the list can filter reliably.',
            '**Forgetting a default status.** New rows should start as `booked` automatically.',
            '**Using `float` for money.** Use `numeric` for `amount` and `advance_paid` so rupees stay exact.',
          ],
          tryIt:
            'Create the `bookings` table in your local PostgreSQL and insert one Yakshagana row by hand with `psql`, giving it a `performance_date` next week. Read it back and confirm `status` defaulted to `booked`.',
          takeaway:
            'A booking is an instant seva plus a future `performance_date` and a `status`; it gets its own `bookings` table reached through the same MAIN-process `pg` + IPC plumbing.',
        },
        {
          id: 'm7-t2',
          title: 'Capturing sponsor details',
          explain:
            'A Yakshagana booking is sponsored by a devotee, so the form collects the same `name`, `gotra`, `nakshatra`, `phone` as a seva, plus the `amount` and how much `advance` they paid today.',
          analogy:
            'When a Maranakatte family sponsors a Yakshagana for their daughter’s wedding, the counter clerk writes the same details on the booking slip as on any seva chit — the sponsor’s name, their gotra, the child’s nakshatra, a phone number — and then adds two money lines: the full sponsorship amount agreed, and the advance handed over now. The balance is settled on the performance day.',
          theory:
            'The **sponsor** of a Yakshagana is just a devotee, so we reuse the familiar fields: `name`, `gotra`, `nakshatra`, `phone`. This consistency matters — the same React input components and the same validation you wrote for sevas drop straight in.\n\nOn top of the devotee fields, a booking adds **money over time**: an `amount` (the full sponsorship agreed) and `advance_paid` (what the sponsor gives today). Unlike an instant seva where money is paid in full immediately, a booking is typically **part-paid** now and settled later, so both fields matter from the first save.\n\nWe model the form state as a single React object and send it to MAIN as one payload. Money values travel as strings or numbers in JS but land in Postgres `numeric` columns, so the database keeps them exact. Keeping the shape of this payload identical to the table columns makes the `INSERT` in MAIN a simple, boring mapping — which is exactly what you want for money.',
          whyItMatters:
            'Reusing the devotee fields keeps the codebase small and the staff experience consistent, so a clerk who can book a seva can book a Yakshagana with no new mental model. Capturing `amount` and `advance_paid` separately from day one is what later lets the app show a correct balance due instead of pretending every booking is paid in full.',
          steps: [
            'Reuse the devotee fields: `name`, `gotra`, `nakshatra`, `phone`.',
            'Add booking-money fields: `amount` (full) and `advancePaid` (today).',
            'Hold the whole form in one React state object that mirrors the columns.',
            'Validate that `name` and `amount` are present before allowing save.',
            'Send the form object to MAIN as a single IPC payload.',
            'Map the payload one-to-one onto the `bookings` columns in the `INSERT`.',
          ],
          code: `// A booking form’s React state mirrors the table columns.\n` +
            `import { useState } from 'react';\n\n` +
            `const empty = {\n` +
            `  bookingType: 'yakshagana',\n` +
            `  devoteeName: '',\n` +
            `  gotra: '',\n` +
            `  nakshatra: '',\n` +
            `  phone: '',\n` +
            `  amount: '',\n` +
            `  advancePaid: '',\n` +
            `  performanceDate: '',\n` +
            `};\n\n` +
            `function useBookingForm() {\n` +
            `  const [form, setForm] = useState(empty);\n` +
            `  const set = (key) => (e) =>\n` +
            `    setForm((f) => ({ ...f, [key]: e.target.value }));\n` +
            `  const reset = () => setForm(empty);\n` +
            `  return { form, set, reset };\n` +
            `}`,
          pitfalls: [
            '**Inventing new devotee field names.** Reuse `name`/`gotra`/`nakshatra`/`phone` so seva components and validation carry over.',
            '**Collapsing `amount` and `advancePaid` into one field.** You need both to compute a balance later.',
            '**Storing money in a separate shape from the columns.** Mirror the table so the `INSERT` stays a trivial mapping.',
            '**Trusting the renderer to do money math.** Capture raw values here; compute and validate in MAIN.',
            '**Forgetting to reset the form after save.** Clear it so the next sponsor starts clean.',
            '**Making nakshatra required.** Some sponsors will not know it; keep optional fields nullable.',
          ],
          tryIt:
            'Build the React form state above and wire four text inputs (name, gotra, nakshatra, phone) plus two number inputs (amount, advance). Type a sponsor’s details and `console.log(form)` to confirm the object shape matches your columns.',
          takeaway:
            'A Yakshagana sponsor is a devotee plus money-over-time: reuse `name`/`gotra`/`nakshatra`/`phone` and add `amount` and `advancePaid`, held in one React object that mirrors the table.',
        },
        {
          id: 'm7-t3',
          title: 'A date picker in React',
          explain:
            'The form needs the sponsor to pick a `performance_date`; a native `<input type="date">` gives a calendar with zero dependencies and a clean `YYYY-MM-DD` value.',
          analogy:
            'Choosing the evening for a Yakshagana is like pointing at a square on the temple’s wall calendar in Maranakatte: the clerk and the sponsor look at the month, find a free evening, and circle it. The `<input type="date">` is that wall calendar on screen — one tap opens the month, one tap circles the day.',
          theory:
            'You do not need a heavy calendar library for one date. The browser’s built-in **`<input type="date">`** renders a native date picker and, crucially, gives you the value as a clean **`YYYY-MM-DD`** string — exactly the format PostgreSQL’s `date` type accepts.\n\nWe bind it like any controlled input: `value={form.performanceDate}` and an `onChange` that stores `e.target.value`. Because the value is already `YYYY-MM-DD`, no parsing or timezone juggling is needed on the way to the database — you send the string straight through IPC.\n\nA subtlety worth handling early: a booking must be for **today or later**, never the past. The `min` attribute set to today’s date stops the picker from offering past days at all, which is far friendlier than rejecting it after the sponsor has already chosen.',
          whyItMatters:
            'Dates are where offline apps quietly break, usually through timezone conversions that shift a booking by a day. Using the native picker’s `YYYY-MM-DD` string end to end — picker, IPC, Postgres `date` — sidesteps timezones entirely, so the evening the sponsor circled is the evening stored.',
          steps: [
            'Add an `<input type="date">` bound to `form.performanceDate`.',
            'On change, store `e.target.value` (already `YYYY-MM-DD`).',
            'Set `min` to today’s date so past days cannot be picked.',
            'Send the `YYYY-MM-DD` string straight to MAIN over IPC — no Date parsing.',
            'Insert it into a Postgres `date` column as-is.',
            'Avoid `new Date(value)` round-trips that can shift the day by a timezone.',
          ],
          code: `// A controlled native date picker, today-or-later only.\n` +
            `function todayIso() {\n` +
            `  // Local date as YYYY-MM-DD, no timezone surprises.\n` +
            `  const d = new Date();\n` +
            `  const pad = (n) => String(n).padStart(2, '0');\n` +
            `  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());\n` +
            `}\n\n` +
            `function DateField({ value, onChange }) {\n` +
            `  return (\n` +
            `    <label>\n` +
            `      Performance date\n` +
            `      <input\n` +
            `        type="date"\n` +
            `        min={todayIso()}\n` +
            `        value={value}\n` +
            `        onChange={(e) => onChange(e.target.value)}\n` +
            `      />\n` +
            `    </label>\n` +
            `  );\n` +
            `}`,
          pitfalls: [
            '**Wrapping the value in `new Date()`.** That introduces timezone shifts; keep the raw `YYYY-MM-DD` string.',
            '**Forgetting `min`.** Without it the picker happily offers past evenings.',
            '**Storing the date as `timestamptz`.** A performance date has no time; use the `date` type.',
            '**Reaching for a date library for one field.** The native input is enough and adds no dependency.',
            '**Letting an empty value through.** Require `performanceDate` before enabling save.',
            '**Reformatting the string yourself.** It is already in the format Postgres wants.',
          ],
          tryIt:
            'Add the `DateField` to your form with `min` set to today. Try to pick yesterday (the picker should not allow it), pick a date next week, and confirm `form.performanceDate` is a `YYYY-MM-DD` string.',
          takeaway:
            'A native `<input type="date">` gives a calendar and a clean `YYYY-MM-DD` value; pass that string straight to a Postgres `date` column and never round-trip it through `new Date()`.',
        },
        {
          id: 'm7-t4',
          title: 'Saving a booking over IPC',
          explain:
            'The form calls `api.bookings.create(payload)`; MAIN handles the IPC, runs a parameterised `INSERT` with `pg`, and returns the new row to the renderer.',
          analogy:
            'The clerk fills the booking slip (the React form) and slides it through a window (preload + IPC) to the back office (MAIN), where the register keeper (Postgres via `pg`) writes it into the big ledger and slides back the stamped copy with its booking number. The clerk never walks into the back office — the window is the only way in.',
          theory:
            'Saving a booking is the same secure pattern used everywhere in this app. The renderer never touches `pg`. Instead the preload script exposes a tiny method — `api.bookings.create` — via `contextBridge`, which forwards the call over **IPC** to a handler in MAIN.\n\nIn MAIN, an `ipcMain.handle(\'bookings:create\', ...)` runs a **parameterised** `INSERT` using `pg`. Parameters (`$1, $2, ...`) are essential: they keep the SQL safe and let Postgres coerce the `YYYY-MM-DD` string and the money strings into `date` and `numeric` correctly. We add `RETURNING *` so the handler can hand the freshly inserted row — with its real `id`, `status`, and `created_at` — back to the form.\n\nThe renderer `await`s the returned row and uses it to show a confirmation. Because everything dangerous (the DB connection, the SQL) lives in MAIN, the renderer stays a pure UI that simply asks and displays.',
          whyItMatters:
            'This boundary is the whole security story of the app: with `nodeIntegration` off and `contextIsolation` on, a bug or bad input in the UI can never reach the filesystem or run arbitrary SQL. Returning the inserted row also keeps the UI honest — it shows what the database actually stored, not what the form hoped to store.',
          steps: [
            'In preload, expose `bookings.create` via `contextBridge` that calls `ipcRenderer.invoke`.',
            'In MAIN, add `ipcMain.handle(\'bookings:create\', ...)`.',
            'Run a parameterised `INSERT ... RETURNING *` with the `pg` pool.',
            'Pass the `YYYY-MM-DD` date and money values as parameters, not string-concatenated SQL.',
            'Return the inserted row to the renderer.',
            'In the form, `await api.bookings.create(payload)` and show the confirmation.',
          ],
          code: `// preload.js — the only bridge the renderer sees.\n` +
            `const { contextBridge, ipcRenderer } = require('electron');\n` +
            `contextBridge.exposeInMainWorld('api', {\n` +
            `  bookings: {\n` +
            `    create: (payload) => ipcRenderer.invoke('bookings:create', payload),\n` +
            `  },\n` +
            `});\n\n` +
            `// main.js — Node + pg live here, never in the renderer.\n` +
            `const { ipcMain } = require('electron');\n` +
            `ipcMain.handle('bookings:create', async (_e, b) => {\n` +
            `  const sql =\n` +
            `    'INSERT INTO bookings ' +\n` +
            `    '(booking_type, devotee_name, gotra, nakshatra, phone, amount, advance_paid, performance_date) ' +\n` +
            `    'VALUES (\$1,\$2,\$3,\$4,\$5,\$6,\$7,\$8) RETURNING *';\n` +
            `  const params = [\n` +
            `    b.bookingType, b.devoteeName, b.gotra, b.nakshatra,\n` +
            `    b.phone, b.amount, b.advancePaid, b.performanceDate,\n` +
            `  ];\n` +
            `  const { rows } = await pool.query(sql, params);\n` +
            `  return rows[0];\n` +
            `});`,
          pitfalls: [
            '**Building SQL with string concatenation of user input.** Use `$1, $2, ...` parameters to stay safe and let Postgres coerce types.',
            '**Exposing the whole `pg` pool through preload.** Expose only the narrow `bookings.create` method.',
            '**Forgetting `RETURNING *`.** Without it the UI cannot show the real `id` and `status`.',
            '**Turning on `nodeIntegration` to make `require` work in React.** Keep it off; go through preload + IPC.',
            '**Swallowing errors in the handler.** Let a failed insert reject so the form can show a message.',
            '**Sending a `Date` object over IPC.** Send the `YYYY-MM-DD` string; it serialises cleanly.',
          ],
          tryIt:
            'Wire `api.bookings.create` end to end: preload method, MAIN handler with a parameterised insert, and a form submit that awaits the result. Save one booking and confirm the returned row has a real `id` and `status: \'booked\'`.',
          takeaway:
            'Saving a booking flows renderer -> preload -> IPC -> MAIN -> parameterised `pg` insert -> `RETURNING *` -> back to the UI, keeping all database power in MAIN.',
        },
        {
          id: 'm7-t5',
          title: 'Preventing a double-booking',
          explain:
            'Only one Yakshagana can run per evening, so the app must reject a date that is already booked — enforced both by a Postgres `UNIQUE` constraint and a friendly check before insert.',
          analogy:
            'There is one open-air stage at Maranakatte and one evening slot. If a family already circled the 12th on the wall calendar for their Yakshagana, the clerk must not circle it again for someone else — the stage cannot host two troupes at once. The temple’s rule "one Yakshagana per evening" becomes a database rule "one row per date".',
          theory:
            'A double-booking is a real-world impossibility, so the database should make it impossible too. The strongest guard is a **partial `UNIQUE` index**: unique on `performance_date` but only for `booking_type = \'yakshagana\'` and non-cancelled rows. That way Postgres itself rejects a second active Yakshagana on the same date, no matter what the UI does.\n\nThe index is the **last line of defence**; it throws a low-level error. For a friendly experience we also **check before inserting**: the MAIN handler runs a quick `SELECT` for an existing active Yakshagana on that date and, if found, returns a clear `{ ok: false, reason: \'date-taken\' }` instead of letting the insert blow up.\n\nThis belt-and-braces approach — check first for a nice message, constraint underneath for absolute safety — is the right pattern for any "must be unique" rule. The check can race under concurrent inserts; the constraint cannot, so you keep both.',
          whyItMatters:
            'Relying on the UI alone to prevent duplicates fails the moment two clerks book at once or a bug skips the check, and a double-booked evening is an embarrassing, public mistake at the temple. The `UNIQUE` index guarantees correctness while the pre-check guarantees a clear message, so staff get both safety and a good experience.',
          steps: [
            'Add a partial `UNIQUE` index on `performance_date` where type is `yakshagana` and status is not `cancelled`.',
            'In the create handler, first `SELECT` for an active Yakshagana on that date.',
            'If one exists, return `{ ok: false, reason: \'date-taken\' }` (no insert).',
            'Otherwise insert and return `{ ok: true, booking }`.',
            'Catch the unique-violation error (`code 23505`) as a final safety net.',
            'In the form, show "This evening is already booked" when the date is taken.',
          ],
          code: `-- Constraint: one active Yakshagana per evening.\n` +
            `CREATE UNIQUE INDEX IF NOT EXISTS uq_yakshagana_per_date\n` +
            `  ON bookings (performance_date)\n` +
            `  WHERE booking_type = 'yakshagana' AND status <> 'cancelled';\n\n` +
            `// main.js — friendly check, then insert.\n` +
            `ipcMain.handle('bookings:create', async (_e, b) => {\n` +
            `  if (b.bookingType === 'yakshagana') {\n` +
            `    const clash = await pool.query(\n` +
            `      'SELECT 1 FROM bookings WHERE booking_type = $1 ' +\n` +
            `      'AND performance_date = $2 AND status <> $3 LIMIT 1',\n` +
            `      ['yakshagana', b.performanceDate, 'cancelled'],\n` +
            `    );\n` +
            `    if (clash.rowCount > 0) return { ok: false, reason: 'date-taken' };\n` +
            `  }\n` +
            `  try {\n` +
            `    const { rows } = await pool.query(/* parameterised INSERT ... RETURNING * */);\n` +
            `    return { ok: true, booking: rows[0] };\n` +
            `  } catch (err) {\n` +
            `    if (err.code === '23505') return { ok: false, reason: 'date-taken' };\n` +
            `    throw err;\n` +
            `  }\n` +
            `});`,
          pitfalls: [
            '**Relying on the UI check alone.** It races and can be bypassed; keep the `UNIQUE` index underneath.',
            '**Making the index unique across all statuses.** A cancelled booking should free the date, so exclude `cancelled`.',
            '**Letting the raw `23505` error reach the user.** Catch it and return a friendly `date-taken` reason.',
            '**Applying the rule to Annadhana too.** Several Annadhana sponsorships can share a date; scope the rule to `yakshagana`.',
            '**Checking and inserting in two far-apart steps without the constraint.** The constraint is what makes the gap safe.',
            '**Comparing dates as strings inconsistently.** Pass `YYYY-MM-DD` and let the `date` column compare them.',
          ],
          tryIt:
            'Create the partial unique index, then try to book two Yakshagana performances on the same date. Confirm the second is rejected with a `date-taken` reason, then cancel the first and confirm the date frees up.',
          takeaway:
            'Prevent double-booking with both a partial `UNIQUE` index (absolute safety) and a pre-insert `SELECT` (a friendly message), scoped to active Yakshagana rows only.',
        },
      ],
    },
    {
      id: 'm7-s2',
      title: 'Annadhana booking',
      topics: [
        {
          id: 'm7-t6',
          title: 'Annadhana: sponsoring meals for a date',
          explain:
            'Annadhana is a meal sponsorship for a chosen date; the booking captures an **expected meal count**, an `amount`, and an `advance_paid`, reusing the same devotee fields.',
          analogy:
            'When a Maranakatte family sponsors Annadhana on their parent’s memorial day, they tell the temple kitchen "we expect about 200 devotees that day" and pay toward the cost. The booking slip is much like the Yakshagana one — same name, gotra, nakshatra, phone — but instead of a stage it reserves the kitchen, and it carries a head-count so the cooks know how much rice to prepare.',
          theory:
            '**Annadhana** (free meal offering) is also a date-based booking, so it lives in the same `bookings` table with `booking_type = \'annadhana\'`. It reuses every devotee field, which is why one table and one form skeleton serve both kinds.\n\nWhat is special is the **expected meal count** — roughly how many people the sponsor is feeding. We store it (say `meal_count`) so the kitchen can plan and so the `amount` makes sense (a per-plate cost times count, or a flat donation). Unlike Yakshagana, **many Annadhana sponsorships can share one date** — several families may sponsor meals the same day — so the one-per-evening rule does **not** apply here.\n\nThe money shape is the same as any booking: a full `amount` agreed and an `advance_paid` today, with the balance settled later. Reusing the booking model means Annadhana inherits the date picker, the IPC save, and the status lifecycle for free — only the meal-count field and the relaxed date rule differ.',
          whyItMatters:
            'Treating Annadhana as "a booking with a head-count" rather than a whole new feature keeps the app small and consistent, so staff and code both reuse what they already know. Capturing the expected meal count is what turns a booking into something the kitchen can actually act on the day of the event.',
          steps: [
            'Reuse the `bookings` table with `booking_type = \'annadhana\'`.',
            'Add a `meal_count` column (integer) for the expected number of meals.',
            'Reuse the devotee fields and the `amount` / `advance_paid` money fields.',
            'Do **not** apply the one-per-date rule; allow many Annadhana on a date.',
            'Reuse the React date picker and the IPC `create` path.',
            'Show the meal count on the confirmation so the kitchen sees the plan.',
          ],
          code: `-- Annadhana reuses bookings; add an expected meal count.\n` +
            `ALTER TABLE bookings\n` +
            `  ADD COLUMN IF NOT EXISTS meal_count integer NOT NULL DEFAULT 0;\n\n` +
            `// The same create payload, with annadhana fields filled.\n` +
            `const payload = {\n` +
            `  bookingType: 'annadhana',\n` +
            `  devoteeName: form.devoteeName,\n` +
            `  gotra: form.gotra,\n` +
            `  nakshatra: form.nakshatra,\n` +
            `  phone: form.phone,\n` +
            `  mealCount: Number(form.mealCount),   // expected plates\n` +
            `  amount: form.amount,                 // full sponsorship\n` +
            `  advancePaid: form.advancePaid,       // paid today\n` +
            `  performanceDate: form.performanceDate,\n` +
            `};\n` +
            `const res = await api.bookings.create(payload);`,
          pitfalls: [
            '**Building a separate Annadhana table.** Reuse `bookings` with a different `booking_type`; only the meal count differs.',
            '**Applying the Yakshagana one-per-date rule.** Many families can sponsor meals on the same day; do not block it.',
            '**Storing `meal_count` as text.** Use an integer so totals and kitchen planning work.',
            '**Forgetting a default for `meal_count`.** Default it to 0 so existing rows stay valid.',
            '**Confusing meal count with amount.** Count is people; amount is rupees — keep them separate.',
            '**Requiring nakshatra.** Keep optional fields optional for Annadhana too.',
          ],
          tryIt:
            'Add the `meal_count` column and book an Annadhana for next week with an expected count of 200. Then book a second Annadhana on the **same** date and confirm both are accepted (no one-per-date rule).',
          takeaway:
            'Annadhana is a `bookings` row with `booking_type = \'annadhana\'` plus a `meal_count`; it reuses the devotee fields and money shape but allows many sponsorships per date.',
        },
        {
          id: 'm7-t7',
          title: 'Computing the balance due',
          explain:
            'A booking is part-paid, so the app must show **balance due = amount − advance_paid** — computed safely with `numeric` so rupees never drift.',
          analogy:
            'The Maranakatte clerk does the same sum a shopkeeper does: total bill minus the advance you handed over equals what you still owe on the day. For a ₹5,000 Annadhana with ₹2,000 advance, ₹3,000 is written in the "balance" line of the slip — and that figure must be exact to the rupee, never ₹2,999.9997.',
          theory:
            'Every booking carries two money figures, so a third — the **balance** — is implied: `balance = amount − advance_paid`. The question is *where* to compute it.\n\nThe safest place is the **database**, because Postgres `numeric` arithmetic is exact. We can expose the balance with a **generated column** (`amount - advance_paid`) so it is always correct and can never be set wrong, or compute it on the fly in a `SELECT`. Either way the math lives next to the data, in exact decimal, not in floating-point JavaScript.\n\nIn the renderer we only **display** the balance the database reports; we never recompute it with JS `Number` math, which can turn `5000 - 2000` of cents into a fractional mess if you are careless with floats. Showing the balance prominently on the booking and on the receipt is what lets staff collect the right amount on the performance day.',
          whyItMatters:
            'A wrong balance means collecting the wrong rupees at the temple — undercharging loses donation money, overcharging upsets a devotee. Computing it in `numeric` next to the data, and only displaying it in the UI, keeps every balance exact and consistent everywhere it appears.',
          steps: [
            'Decide the balance rule: `balance = amount − advance_paid`.',
            'Prefer a Postgres generated column so the balance is always derived and exact.',
            'Or compute it in the `SELECT` (`amount - advance_paid AS balance_due`).',
            'Return `balance_due` to the renderer alongside the booking.',
            'Display the balance; do **not** recompute it with JS float math.',
            'Show the balance on the booking screen and the receipt.',
          ],
          code: `-- Option A: a generated column — always exact, never set wrong.\n` +
            `ALTER TABLE bookings\n` +
            `  ADD COLUMN IF NOT EXISTS balance_due numeric(10,2)\n` +
            `  GENERATED ALWAYS AS (amount - advance_paid) STORED;\n\n` +
            `-- Option B: compute on read if you prefer not to alter the table.\n` +
            `SELECT id, devotee_name, amount, advance_paid,\n` +
            `       (amount - advance_paid) AS balance_due\n` +
            `FROM bookings\n` +
            `WHERE id = $1;\n\n` +
            `// Renderer: display only — never recompute with JS floats.\n` +
            `function BalanceLine({ booking }) {\n` +
            `  return <p>Balance due: ₹{booking.balance_due}</p>;\n` +
            `}`,
          pitfalls: [
            '**Computing the balance with JS `Number` math.** Floating-point drifts; let Postgres `numeric` do it.',
            '**Storing a hand-set `balance` column.** A generated column can never disagree with `amount - advance_paid`.',
            '**Allowing `advance_paid` to exceed `amount`.** Add a `CHECK (advance_paid <= amount)` or validate before insert.',
            '**Recomputing the balance in three different screens.** Compute once in SQL and display the same value everywhere.',
            '**Showing a negative balance as a charge.** Decide how to present overpayment (usually zero balance plus a note).',
            '**Forgetting to refresh the balance after a part-payment.** Re-read the row so the new balance shows.',
          ],
          tryIt:
            'Add the generated `balance_due` column, insert a ₹5,000 booking with a ₹2,000 advance, and `SELECT balance_due`. Confirm it reads exactly `3000.00` without you ever setting it.',
          takeaway:
            'Balance due is `amount − advance_paid`, computed in exact Postgres `numeric` (ideally a generated column) and only **displayed** in the renderer, never recomputed with JS floats.',
        },
        {
          id: 'm7-t8',
          title: 'Partial payments',
          explain:
            'A sponsor may pay the advance now and more later, so the app records each payment and reduces the balance — by raising `advance_paid` toward `amount`.',
          analogy:
            'A Maranakatte family booking a big Annadhana might pay ₹2,000 today, ₹1,500 next week, and the rest on the day. Each time, the clerk adds to the "paid so far" line of the slip and recalculates what is left — like topping up a hundi a little at a time until the full offering is complete.',
          theory:
            'Real sponsors rarely pay in one go. The simplest model that fits this offline counter app is a **running `advance_paid`**: each additional payment **increases** `advance_paid`, and the generated `balance_due` shrinks automatically. An "Add payment" action sends the extra amount to MAIN, which does `advance_paid = advance_paid + $extra` in a parameterised `UPDATE`.\n\nWe guard the update so `advance_paid` never overshoots `amount` (a `CHECK` constraint, or a clamp in the handler). When `advance_paid` reaches `amount`, the balance is zero and the booking is fully paid — a natural cue to mark it `confirmed` (status lifecycle, next section).\n\nIf the temple later needs a full payment history (who paid what, when), you would add a separate `booking_payments` table the way bigger systems do. For Maranakatte’s counter, the running total is usually enough and keeps the screen simple — but knowing the table option exists tells you where to grow.',
          whyItMatters:
            'Forcing full payment up front does not match how devotees actually sponsor, so the app must handle instalments or staff will fudge the numbers. A guarded running total keeps the balance correct after each payment and gives a clean signal for when a booking is fully settled.',
          steps: [
            'Add an "Add payment" action that sends the extra amount to MAIN.',
            'In MAIN, run `UPDATE bookings SET advance_paid = advance_paid + $1 WHERE id = $2`.',
            'Guard with `CHECK (advance_paid <= amount)` so it cannot overshoot.',
            'Re-read the row so the generated `balance_due` refreshes in the UI.',
            'When the balance hits zero, prompt to mark the booking `confirmed`.',
            'If a full ledger is needed later, add a `booking_payments` child table.',
          ],
          code: `// main.js — add a partial payment to the running total.\n` +
            `ipcMain.handle('bookings:addPayment', async (_e, { id, extra }) => {\n` +
            `  const { rows } = await pool.query(\n` +
            `    'UPDATE bookings ' +\n` +
            `    'SET advance_paid = advance_paid + $1 ' +\n` +
            `    'WHERE id = $2 AND advance_paid + $1 <= amount ' +\n` +
            `    'RETURNING *',\n` +
            `    [extra, id],\n` +
            `  );\n` +
            `  if (rows.length === 0) return { ok: false, reason: 'overpay' };\n` +
            `  return { ok: true, booking: rows[0] };  // balance_due already updated\n` +
            `});`,
          pitfalls: [
            '**Replacing `advance_paid` instead of adding to it.** Each payment should *increase* the running total.',
            '**Letting `advance_paid` exceed `amount`.** Guard in SQL and/or with a `CHECK` constraint.',
            '**Not re-reading the row after an update.** The generated `balance_due` only refreshes if you re-fetch.',
            '**Doing the addition in JS floats before sending.** Send the extra amount and let Postgres `numeric` add it.',
            '**Skipping a payment trail when one is needed.** For audit, add a `booking_payments` table instead of only a running total.',
            '**Forgetting to flip to `confirmed` on full payment.** A zero balance is the cue to advance the status.',
          ],
          tryIt:
            'Add an "Add payment" action and call it twice on a ₹5,000 booking (₹1,000 then ₹1,500). Confirm `advance_paid` becomes ₹3,500 and `balance_due` reads ₹1,500, then try to overpay and confirm it is rejected.',
          takeaway:
            'Partial payments raise a running `advance_paid` (guarded so it never exceeds `amount`); the generated `balance_due` shrinks automatically, and a zero balance signals a fully paid booking.',
        },
        {
          id: 'm7-t9',
          title: 'A booking confirmation receipt',
          explain:
            'After saving, the app shows a printable confirmation listing the sponsor, date, type, amount, advance, and balance — reusing the print pipeline from the printing module.',
          analogy:
            'Once the Maranakatte booking is written in the ledger, the clerk hands the family a stamped slip they can show on the performance day: "Yakshagana, 12th evening, sponsored by this family, ₹5,000, ₹2,000 paid, ₹3,000 balance." The receipt is their proof and the kitchen’s or stage manager’s reminder.',
          theory:
            'A booking is a promise, so the sponsor needs a **confirmation receipt** to hold. We reuse the same printing pipeline built earlier in the course (the printing module): a clean HTML receipt template rendered from the booking row, sent to the printer through the MAIN process.\n\nThe receipt shows what matters on the day: **type** (Yakshagana / Annadhana), **performance date**, **sponsor** (name, gotra, nakshatra), the **amount**, **advance paid**, and **balance due**, plus a booking number (the row `id`). For Annadhana it also shows the **expected meal count** so the kitchen can prepare.\n\nBecause printing already lives in MAIN, the booking screen just calls something like `api.print.booking(bookingId)`; MAIN loads the row, fills the template, and prints. Keeping the receipt as data-driven HTML means the same balance and details a clerk sees on screen are exactly what prints — no second source of truth.',
          whyItMatters:
            'Without a printed confirmation a sponsor has no proof of their booking and the temple no shared record for the day, which breeds disputes. Reusing the existing print pipeline means receipts are consistent with seva chits and the balance on paper always matches the balance in the database.',
          steps: [
            'Reuse the printing module’s pipeline (HTML template rendered in MAIN).',
            'Build a booking receipt template: type, date, sponsor, amount, advance, balance.',
            'Include the booking number (`id`) and, for Annadhana, the meal count.',
            'Expose `api.print.booking(id)` over preload + IPC.',
            'In MAIN, load the booking row and fill the template, then print.',
            'Offer "Print receipt" right after a successful save.',
          ],
          code: `// MAIN reuses the print pipeline; receipt is data-driven HTML.\n` +
            `function bookingReceiptHtml(b) {\n` +
            `  return (\n` +
            `    '<h2>Maranakatte Seva — Booking</h2>' +\n` +
            `    '<p>No: ' + b.id + ' &nbsp; Type: ' + b.booking_type + '</p>' +\n` +
            `    '<p>Date: ' + b.performance_date + '</p>' +\n` +
            `    '<p>Sponsor: ' + b.devotee_name +\n` +
            `      ' (gotra ' + (b.gotra || '-') + ', nakshatra ' + (b.nakshatra || '-') + ')</p>' +\n` +
            `    '<p>Amount: ₹' + b.amount + ' &nbsp; Advance: ₹' + b.advance_paid + '</p>' +\n` +
            `    '<p><strong>Balance due: ₹' + b.balance_due + '</strong></p>'\n` +
            `  );\n` +
            `}\n\n` +
            `// api.print.booking(id) — MAIN loads the row, fills this template, prints.`,
          pitfalls: [
            '**Re-deriving the balance in the receipt template.** Print the `balance_due` the database already computed.',
            '**Building a second print path just for bookings.** Reuse the printing module’s pipeline.',
            '**Printing from the renderer directly.** Printing belongs in MAIN like the rest of the privileged work.',
            '**Omitting the booking number.** The `id` is what the sponsor quotes on the performance day.',
            '**Forgetting the meal count on Annadhana receipts.** The kitchen needs it.',
            '**Hard-coding rupee formatting differently from seva chits.** Keep formatting consistent across receipts.',
          ],
          tryIt:
            'Render the `bookingReceiptHtml` for a saved booking and print (or print-to-PDF) it. Confirm the printed amount, advance, and balance exactly match what the booking screen shows.',
          takeaway:
            'A booking confirmation reuses the printing module’s MAIN-side pipeline to print a data-driven receipt — type, date, sponsor, amount, advance, and the database-computed balance.',
        },
      ],
    },
    {
      id: 'm7-s3',
      title: 'Managing bookings',
      topics: [
        {
          id: 'm7-t10',
          title: 'A bookings list with filters',
          explain:
            'Staff need to find bookings, so the app shows a list filterable by **date range** and **type**, fetched with a parameterised `SELECT` over IPC.',
          analogy:
            'The Maranakatte office keeps a register of all bookings, and the clerk often flips to "show me all Yakshagana between the 1st and the 15th" or "all Annadhana this month". The filtered list is that register with two tabs at the top — a from/to date and a type — narrowing hundreds of rows to the handful the clerk needs right now.',
          theory:
            'A flat dump of every booking is useless once there are hundreds. The list screen takes two filters: a **date range** (`from`/`to` on `performance_date`) and a **booking type** (`yakshagana`, `annadhana`, or all). These map directly onto a parameterised `WHERE` clause.\n\nThe React screen holds the filter values in state and calls `api.bookings.list(filters)`. MAIN builds the query, adding conditions only for filters that are set, and always **parameterises** the values. Results come back ordered by `performance_date` so upcoming events read top-to-bottom.\n\nWe keep the query simple and let Postgres do the work: indexing `performance_date` makes range filters fast even with years of bookings. The renderer just renders rows and re-fetches whenever a filter changes — the same ask-and-display loop used across the app.',
          whyItMatters:
            'Filtering by date and type is how staff actually use a bookings register day to day, so a fast, correct filter is the difference between a usable screen and an ignored one. Doing it with parameterised SQL keeps it safe and lets the database handle the heavy lifting even as bookings pile up over years offline.',
          steps: [
            'Hold `from`, `to`, and `type` filter values in React state.',
            'Call `api.bookings.list({ from, to, type })` when filters change.',
            'In MAIN, build a parameterised `WHERE` adding only the set filters.',
            'Order results by `performance_date` so upcoming events lead.',
            'Index `performance_date` so range filters stay fast.',
            'Render the rows and re-fetch whenever a filter changes.',
          ],
          code: `// main.js — filter by date range and type, safely.\n` +
            `ipcMain.handle('bookings:list', async (_e, f) => {\n` +
            `  const where = [];\n` +
            `  const params = [];\n` +
            `  if (f.from)  { params.push(f.from);  where.push('performance_date >= \$' + params.length); }\n` +
            `  if (f.to)    { params.push(f.to);    where.push('performance_date <= \$' + params.length); }\n` +
            `  if (f.type && f.type !== 'all') {\n` +
            `    params.push(f.type); where.push('booking_type = \$' + params.length);\n` +
            `  }\n` +
            `  const sql =\n` +
            `    'SELECT * FROM bookings' +\n` +
            `    (where.length ? ' WHERE ' + where.join(' AND ') : '') +\n` +
            `    ' ORDER BY performance_date';\n` +
            `  const { rows } = await pool.query(sql, params);\n` +
            `  return rows;\n` +
            `});`,
          pitfalls: [
            '**Interpolating filter values into the SQL string.** Push them as parameters and reference `$1, $2, ...`.',
            '**Building `WHERE` conditions for unset filters.** Add a condition only when its value is present.',
            '**Forgetting to order by date.** An unordered list buries the next event.',
            '**Skipping an index on `performance_date`.** Range filters slow down without it.',
            '**Re-fetching on every keystroke of a date.** Fetch when the date value actually changes.',
            '**Returning all columns when the list needs few.** Select what the row shows to keep payloads small.',
          ],
          tryIt:
            'Build the list handler and a screen with from/to date inputs and a type dropdown. Insert a mix of Yakshagana and Annadhana across several dates, then filter to "Yakshagana, this week" and confirm only matching rows appear, sorted by date.',
          takeaway:
            'The bookings list filters by date range and type via a parameterised `WHERE`, ordered by `performance_date`, with the renderer re-fetching whenever a filter changes.',
        },
        {
          id: 'm7-t11',
          title: 'The status lifecycle: booked → confirmed → cancelled',
          explain:
            'A booking moves through states — **booked** (tentative), **confirmed** (settled, going ahead), **cancelled** (called off) — enforced by the `CHECK`-constrained `status` column.',
          analogy:
            'A Maranakatte booking is like a wedding RSVP: first it is penciled in (booked), then confirmed once the advance is comfortable and the date is locked, and occasionally crossed out (cancelled) if the family calls it off. The clerk moves the slip between three trays — pending, confirmed, cancelled — and never invents a fourth.',
          theory:
            'The **`status`** column from the schema is a tiny state machine with three values, kept honest by a `CHECK (status IN (\'booked\',\'confirmed\',\'cancelled\'))`:\n\n- **`booked`** — the default; tentative, advance may be partial.\n- **`confirmed`** — going ahead; usually after the balance is comfortable.\n- **`cancelled`** — called off; the date is freed (recall the unique index ignores cancelled rows).\n\nMoving a booking forward is an `UPDATE bookings SET status = $1 WHERE id = $2` run in MAIN over IPC. The `CHECK` constraint guarantees no typo or bad value (`pending`, `done`) can ever land in the column — the database rejects it.\n\nWe keep transitions sensible: a `cancelled` booking should not jump back to `confirmed` without thought, so the handler can refuse illegal moves. But the core idea is simple — three named states, one constrained column, updated through the same secure IPC path as everything else.',
          whyItMatters:
            'Without a status, staff cannot tell a tentative pencil-in from a locked-in event, and cancelled bookings would still block their date. A small, constrained lifecycle makes each booking’s real state explicit and ties directly into the double-booking rule, which only ignores `cancelled` rows.',
          steps: [
            'Confirm the `status` column has `CHECK (status IN (\'booked\',\'confirmed\',\'cancelled\'))`.',
            'New bookings default to `booked`.',
            'Add `api.bookings.setStatus(id, status)` over preload + IPC.',
            'In MAIN, run a parameterised `UPDATE ... SET status = $1 WHERE id = $2 RETURNING *`.',
            'Optionally reject illegal transitions (e.g. cancelled → confirmed) in the handler.',
            'Remember cancelling frees the date because the unique index excludes `cancelled`.',
          ],
          code: `// main.js — advance a booking’s status, validated by the DB.\n` +
            `const ALLOWED = ['booked', 'confirmed', 'cancelled'];\n` +
            `ipcMain.handle('bookings:setStatus', async (_e, { id, status }) => {\n` +
            `  if (!ALLOWED.includes(status)) return { ok: false, reason: 'bad-status' };\n` +
            `  const { rows } = await pool.query(\n` +
            `    'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',\n` +
            `    [status, id],\n` +
            `  );\n` +
            `  // The CHECK constraint is the final guarantee no bad value lands.\n` +
            `  return { ok: true, booking: rows[0] };\n` +
            `});`,
          pitfalls: [
            '**Leaving `status` as free text.** The `CHECK` constraint is what keeps the three states clean.',
            '**Allowing any transition.** Guard against nonsense like cancelled → confirmed if the temple’s rules forbid it.',
            '**Updating status with a non-parameterised query.** Always pass `id` and `status` as parameters.',
            '**Forgetting `RETURNING *`.** The UI should refresh from the row the database actually stored.',
            '**Hard-coding the status list in two places.** Keep one source for the allowed values.',
            '**Not realising cancel frees the date.** The unique index ignores cancelled rows by design.',
          ],
          tryIt:
            'Add `setStatus` and move a booking booked → confirmed, then confirmed → cancelled. Confirm the `CHECK` constraint rejects an invalid value like `done`, and that cancelling a Yakshagana frees its date for re-booking.',
          takeaway:
            'Bookings follow a constrained booked → confirmed → cancelled lifecycle updated via a parameterised IPC `UPDATE`; the `CHECK` constraint guarantees only valid states, and cancelling frees the date.',
        },
        {
          id: 'm7-t12',
          title: 'An upcoming-bookings dashboard',
          explain:
            'Staff want to see what is scheduled soon, so a dashboard view lists **non-cancelled bookings in the next 7 days**, ordered by date — a quick "what is coming up" glance.',
          analogy:
            'Every morning the Maranakatte office glances at the week ahead pinned on the notice board: "Yakshagana on the 12th, two Annadhana on the 14th." The upcoming-bookings dashboard is that notice board on screen — it answers "what do we need to prepare this week?" without the clerk hunting through the full register.',
          theory:
            'The full filtered list answers "find me a booking"; the **dashboard** answers a different question — "what is happening soon?". It is a focused query: bookings whose `performance_date` is **between today and seven days out**, excluding `cancelled`, ordered by date.\n\nThis is just a special case of the list query with a fixed range and a status filter, so it reuses the same MAIN-side pattern. We compute "today" and "today + 7" and pass them as parameters, or use Postgres date math (`current_date`, `current_date + interval \'7 days\'`).\n\nOn the React side this is often the **home screen** of the bookings feature: a small card per upcoming event showing date, type, sponsor, and balance due, so staff see at a glance who is coming and what to collect. Because it is a read-only summary, it just fetches on mount and can refresh on a timer or when a booking changes.',
          whyItMatters:
            'A busy temple counter needs a forward view, not just a searchable archive — staff must prepare the stage, the kitchen, and the collections for the week ahead. A dedicated upcoming view turns the bookings data into a daily operational tool instead of a record people only consult after the fact.',
          steps: [
            'Write a query for `performance_date` between today and today + 7 days.',
            'Exclude `cancelled` bookings from the dashboard.',
            'Order by `performance_date` so the soonest events lead.',
            'Expose it as `api.bookings.upcoming()` over IPC.',
            'Render a card per event: date, type, sponsor, balance due.',
            'Fetch on mount and refresh when a booking changes or on a timer.',
          ],
          code: `// main.js — the next seven days, cancelled excluded.\n` +
            `ipcMain.handle('bookings:upcoming', async () => {\n` +
            `  const { rows } = await pool.query(\n` +
            `    'SELECT * FROM bookings ' +\n` +
            `    'WHERE status <> $1 ' +\n` +
            `    'AND performance_date BETWEEN current_date ' +\n` +
            `    'AND current_date + interval \\'7 days\\' ' +\n` +
            `    'ORDER BY performance_date',\n` +
            `    ['cancelled'],\n` +
            `  );\n` +
            `  return rows;\n` +
            `});`,
          pitfalls: [
            '**Including cancelled bookings.** The dashboard should show only what is actually happening.',
            '**Re-implementing the list logic from scratch.** It is the list query with a fixed range and status filter.',
            '**Computing "next 7 days" in JS with timezone bugs.** Prefer Postgres `current_date` math.',
            '**Forgetting to order by date.** The soonest event should be on top.',
            '**Never refreshing the dashboard.** Re-fetch when a booking changes so it stays current.',
            '**Showing too much per card.** Keep it to date, type, sponsor, and balance for a quick glance.',
          ],
          tryIt:
            'Add the `upcoming` handler and a dashboard that fetches on mount. Insert bookings spread across the next two weeks, then confirm only those within seven days (and not cancelled) appear, soonest first.',
          takeaway:
            'An upcoming-bookings dashboard reuses the list pattern with a fixed today-to-+7-days range, excludes cancelled rows, and gives staff a quick "what is scheduled this week" glance.',
        },
        {
          id: 'm7-t13',
          title: 'Editing and cancelling safely',
          explain:
            'Plans change, so the app allows editing a booking and cancelling it — carefully deciding what happens to the **advance** and confirming destructive actions.',
          analogy:
            'When a Maranakatte family postpones or cancels, the clerk does not just scratch out the slip — there is a conversation about the advance: is it refunded, held for a new date, or kept as a donation? The app must capture that decision, not silently delete the row and lose the money trail.',
          theory:
            'Two write operations remain: **edit** and **cancel**. Editing reuses the create form pre-filled with the booking, sending changes to an `UPDATE` handler. The tricky bit is **what may change**: details like phone are safe; changing a Yakshagana’s `performance_date` must re-run the **double-booking check** against the new date.\n\n**Cancelling** is the more sensitive action. We do **not** delete the row — we set `status = \'cancelled\'`, preserving the history and freeing the date (the unique index ignores cancelled rows). The open question is the **advance**: the app should record the decision (refunded, retained as donation, or carried to a new date) rather than leave the money state ambiguous. A simple `cancel_note` or a small refund field captures it.\n\nBoth actions are **destructive enough to confirm**: a clear "Are you sure?" before cancelling, and an explicit save before edits. As always the writes go through parameterised IPC handlers in MAIN, never raw from the renderer.',
          whyItMatters:
            'Silently deleting a cancelled booking destroys the record of money already taken, which is exactly what a temple’s accounts must never lose. Cancelling by status (not deletion), re-checking the date on edit, and confirming destructive actions keep both the schedule and the money trail trustworthy.',
          steps: [
            'Reuse the create form, pre-filled, for editing; send changes to an `UPDATE` handler.',
            'If the Yakshagana date changes, re-run the double-booking check on the new date.',
            'Cancel by setting `status = \'cancelled\'`, never by deleting the row.',
            'Record the advance decision (refunded / retained / carried) in a note or field.',
            'Confirm destructive actions with an "Are you sure?" prompt.',
            'Route both edit and cancel through parameterised MAIN handlers.',
          ],
          code: `// main.js — cancel by status, keep the row and the money trail.\n` +
            `ipcMain.handle('bookings:cancel', async (_e, { id, advanceHandling, note }) => {\n` +
            `  // advanceHandling: 'refunded' | 'retained' | 'carried'\n` +
            `  const { rows } = await pool.query(\n` +
            `    'UPDATE bookings ' +\n` +
            `    'SET status = $1, cancel_note = $2 ' +\n` +
            `    'WHERE id = $3 AND status <> $1 ' +\n` +
            `    'RETURNING *',\n` +
            `    ['cancelled', (advanceHandling + ': ' + (note || '')).trim(), id],\n` +
            `  );\n` +
            `  if (rows.length === 0) return { ok: false, reason: 'already-cancelled' };\n` +
            `  return { ok: true, booking: rows[0] };  // date is now free again\n` +
            `});`,
          pitfalls: [
            '**Deleting the row on cancel.** Set `status = \'cancelled\'` to keep the history and money trail.',
            '**Skipping the double-booking check when the date is edited.** A new date can clash; re-validate it.',
            '**Leaving the advance decision ambiguous.** Record refunded / retained / carried explicitly.',
            '**Cancelling without confirmation.** Prompt "Are you sure?" before a destructive action.',
            '**Editing an issued receipt silently.** If a receipt was printed, note the change rather than pretend it never happened.',
            '**Writing edits straight from the renderer.** Route through a parameterised MAIN handler.',
          ],
          tryIt:
            'Add edit and cancel handlers. Edit a Yakshagana to a date that is already taken and confirm the double-booking check blocks it. Then cancel a booking with `advanceHandling: \'retained\'` and confirm the row stays (status `cancelled`) and its date frees up.',
          takeaway:
            'Edit safely (re-checking the date on change) and cancel by setting `status = \'cancelled\'` — never deleting — while recording what happens to the advance and confirming destructive actions.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm7-p1',
      type: 'guided-project',
      title: 'Yakshagana booking form',
      domain: 'Temple seva counter — Maranakatte',
      duration: '3–4 hours',
      description:
        'Build a React form that captures a Yakshagana sponsor (name, gotra, nakshatra, phone), a performance date, the amount, and an advance, saves it via `api.bookings.create`, and rejects a date that is already booked — with the database double-booking guard underneath.',
      tools: ['Electron', 'React', 'Vite', 'PostgreSQL (local)', 'pg', 'preload contextBridge + IPC'],
      blueprint: {
        overview:
          'A single-screen booking form for the Maranakatte counter. The renderer collects sponsor and date details and calls a narrow `api.bookings.create` exposed through preload. MAIN runs a parameterised insert against local PostgreSQL, but first checks (and the schema enforces) that no active Yakshagana already holds that evening. A friendly "this evening is already booked" message appears when the date clashes.',
        functionalRequirements: [
          'Capture sponsor devotee fields (name required; gotra, nakshatra, phone optional) plus amount and advance paid.',
          'A native `<input type="date">` for the performance date, restricted to today or later.',
          'Save via `api.bookings.create`, returning the inserted row with its `id` and `status`.',
          'Reject a date already held by an active Yakshagana with a clear message (not a raw error).',
          'Clear the form and offer "Print receipt" after a successful save.',
        ],
        technicalImplementation: [
          'A partial `UNIQUE` index on `performance_date` for `booking_type = \'yakshagana\'` and `status <> \'cancelled\'`.',
          'A preload `contextBridge` exposing only `bookings.create`; no `pg` or Node in the renderer.',
          'An `ipcMain.handle(\'bookings:create\', ...)` that pre-checks the date, then runs a parameterised `INSERT ... RETURNING *`, catching `23505`.',
          'Date and money passed as parameters so Postgres coerces them into `date` and `numeric`.',
          'React form state mirroring the columns, with validation before the IPC call.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Schema + double-booking guard',
            outcome: 'A `bookings` table and a partial unique index that makes a second active Yakshagana on the same date impossible.',
            prompt:
              'Write PostgreSQL DDL for a `bookings` table for an offline Electron temple app: columns `id` serial PK, `booking_type` text with a CHECK in (\'yakshagana\',\'annadhana\'), `devotee_name` text not null, `gotra`, `nakshatra`, `phone` text, `amount` and `advance_paid` numeric(10,2) default 0, `performance_date` date not null, `status` text default \'booked\' with a CHECK in (\'booked\',\'confirmed\',\'cancelled\'), `created_at` timestamptz default now(). Then add a partial UNIQUE index on `performance_date` that applies only when `booking_type = \'yakshagana\'` and `status <> \'cancelled\'`. Explain in one sentence why the index is partial.',
          },
          {
            step: 2,
            label: 'Preload + MAIN create handler',
            outcome: 'A secure IPC path that pre-checks the date and inserts via parameterised pg, returning the new row or a `date-taken` reason.',
            prompt:
              'In an Electron app with `nodeIntegration` off and `contextIsolation` on, write (a) a preload snippet using `contextBridge` exposing `api.bookings.create(payload) -> ipcRenderer.invoke(\'bookings:create\', payload)`, and (b) a MAIN `ipcMain.handle(\'bookings:create\', ...)` using a `pg` pool that, for `bookingType === \'yakshagana\'`, first SELECTs for an active booking on that `performance_date` and returns `{ ok: false, reason: \'date-taken\' }` if found, otherwise runs a parameterised `INSERT ... RETURNING *` and returns `{ ok: true, booking }`, also catching error code `23505` as `date-taken`.',
          },
          {
            step: 3,
            label: 'React booking form',
            outcome: 'A controlled form that validates, calls the IPC create, and shows either a confirmation or a friendly date-taken message.',
            prompt:
              'Write a React component `YakshaganaBookingForm` with controlled inputs for devotee name (required), gotra, nakshatra, phone, amount, advance, and a native `<input type="date">` with `min` set to today. On submit, validate name and amount are present, build a payload mirroring the bookings columns with `bookingType: \'yakshagana\'`, call `await window.api.bookings.create(payload)`, and on `{ ok: false, reason: \'date-taken\' }` show "This evening is already booked"; on success show the booking number from the returned row, reset the form, and reveal a "Print receipt" button. No database or pg code in this component.',
          },
        ],
      },
    },
    {
      id: 'm7-p2',
      type: 'guided-project',
      title: 'Bookings list + status',
      domain: 'Temple seva counter — Maranakatte',
      duration: '3–4 hours',
      description:
        'Build a screen that lists bookings filtered by date range and type, with buttons to confirm or cancel each booking that update the `status` over IPC and refresh the list — so staff can manage the schedule day to day.',
      tools: ['Electron', 'React', 'Vite', 'PostgreSQL (local)', 'pg', 'preload contextBridge + IPC'],
      blueprint: {
        overview:
          'A management screen for the Maranakatte bookings register. Filters (from date, to date, type) drive a parameterised `SELECT` in MAIN; each row shows the sponsor, date, type, balance, and status with Confirm and Cancel actions. Status changes go through a parameterised `UPDATE` over IPC, guarded by the schema’s `CHECK` constraint, and the list re-fetches so the screen always reflects the database.',
        functionalRequirements: [
          'Filter bookings by a from/to performance-date range and by type (yakshagana, annadhana, or all).',
          'List matching rows ordered by `performance_date`, showing sponsor, date, type, balance, and status.',
          'A Confirm button moving a booking to `confirmed`; a Cancel button moving it to `cancelled`.',
          'Cancelling does not delete the row and frees the date for re-booking.',
          'Re-fetch the list after any filter change or status update so it stays current.',
        ],
        technicalImplementation: [
          'An `ipcMain.handle(\'bookings:list\', ...)` building a parameterised `WHERE` from only the set filters, ordered by date.',
          'An `ipcMain.handle(\'bookings:setStatus\', ...)` running `UPDATE ... SET status = $1 WHERE id = $2 RETURNING *`, validating against the allowed set.',
          'The schema `CHECK (status IN (\'booked\',\'confirmed\',\'cancelled\'))` as the final guarantee of valid states.',
          'Preload exposing `bookings.list` and `bookings.setStatus`; no pg in the renderer.',
          'React state holding filters and rows, re-fetching on filter change and after each status update.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Filtered list handler',
            outcome: 'A MAIN handler that returns bookings filtered by date range and type using safe, parameterised SQL.',
            prompt:
              'Write an Electron MAIN `ipcMain.handle(\'bookings:list\', ...)` for a `pg` pool that accepts `{ from, to, type }`. Build a parameterised query: add `performance_date >= $n` only if `from` is set, `performance_date <= $n` only if `to` is set, and `booking_type = $n` only if `type` is set and not \'all\'. Combine conditions with AND, order by `performance_date`, and return the rows. Show how the `params` array and `$n` placeholders stay in sync, and stress that no value is ever concatenated into the SQL string.',
          },
          {
            step: 2,
            label: 'Status update over IPC',
            outcome: 'A parameterised status handler that advances a booking and returns the updated row, refused for invalid values.',
            prompt:
              'Write a preload exposure `api.bookings.setStatus(id, status) -> ipcRenderer.invoke(\'bookings:setStatus\', { id, status })` and a MAIN `ipcMain.handle(\'bookings:setStatus\', ...)` that checks `status` is one of `booked`/`confirmed`/`cancelled` (returning `{ ok: false, reason: \'bad-status\' }` otherwise), then runs `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *` and returns `{ ok: true, booking }`. Note that the table’s `CHECK` constraint is the database-level final guard, and that setting `cancelled` frees a Yakshagana date because the unique index excludes cancelled rows.',
          },
          {
            step: 3,
            label: 'React list with Confirm/Cancel',
            outcome: 'A list screen with filters and per-row actions that update status and refresh from the database.',
            prompt:
              'Write a React `BookingsList` component with from/to date inputs and a type dropdown (all/yakshagana/annadhana) held in state. On mount and whenever a filter changes, call `await window.api.bookings.list({ from, to, type })` and render rows showing sponsor name, performance date, type, balance due, and a status badge. Give each non-cancelled row a Confirm button (calls `setStatus(id, \'confirmed\')`) and a Cancel button (confirms with the user, then calls `setStatus(id, \'cancelled\')`). After any status update, re-fetch the list so the screen reflects the database. Keep all data access behind `window.api`; no pg in the component.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm7-q1',
      q: 'What fundamentally distinguishes a booking (Yakshagana/Annadhana) from an instant counter seva like Mangalarathi?',
      options: [
        'A booking is cheaper than an instant seva',
        'A booking is for a future date and carries a status, while an instant seva records something already performed',
        'A booking does not need a devotee name',
        'An instant seva is stored in the cloud and a booking is stored locally',
      ],
      answer: 1,
    },
    {
      id: 'm7-q2',
      q: 'Why is a native `<input type="date">` a good fit for picking a performance date in this app?',
      options: [
        'It stores the date directly in PostgreSQL without IPC',
        'It returns a clean `YYYY-MM-DD` string that maps straight to a Postgres `date` column with no timezone juggling',
        'It automatically prevents double-bookings',
        'It requires a heavy third-party calendar library',
      ],
      answer: 1,
    },
    {
      id: 'm7-q3',
      q: 'What is the most reliable way to stop two Yakshagana performances being booked on the same evening?',
      options: [
        'Disable the save button in React after the first booking',
        'A partial `UNIQUE` index on `performance_date` (for active Yakshagana rows) plus a friendly pre-insert check',
        'Sort the bookings list by date',
        'Store the date as text and compare strings in JavaScript',
      ],
      answer: 1,
    },
    {
      id: 'm7-q4',
      q: 'How should the balance due on a part-paid booking be computed?',
      options: [
        'With JS `Number` math in the React renderer after fetching the row',
        'As `amount − advance_paid` in exact Postgres `numeric` (ideally a generated column), then only displayed in the UI',
        'By rounding the amount down to the nearest hundred rupees',
        'It cannot be computed until the booking is confirmed',
      ],
      answer: 1,
    },
    {
      id: 'm7-q5',
      q: 'Which sequence of states does the `CHECK`-constrained booking `status` column allow?',
      options: [
        'draft → issued → paid',
        'pending → done → archived',
        'booked → confirmed → cancelled',
        'new → active → closed',
      ],
      answer: 2,
    },
    {
      id: 'm7-q6',
      q: 'When a booking is cancelled, what should the app do?',
      options: [
        'Delete the row so the date is freed',
        'Set `status = \'cancelled\'` (keeping the row and money trail); the date frees because the unique index ignores cancelled rows',
        'Refund the advance automatically with no record',
        'Move the row to the cloud for backup',
      ],
      answer: 1,
    },
  ],
};
