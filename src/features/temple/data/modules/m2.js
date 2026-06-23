// Module 2 — Local PostgreSQL & the Embedded Database
// Builds the local data layer for the offline "Maranakatte Seva" desktop app.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m2 = {
  id: 'm2',
  title: 'Local PostgreSQL & the Embedded Database',
  hours: 9,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'Learn relational databases and SQL in temple terms, then wire a LOCAL PostgreSQL database into the Electron main process with node-postgres (`pg`) — parameterized queries, a reusable query module, first-run schema migrations, and the "no cloud, data on this machine" decision behind Maranakatte Seva.',
  sections: [
    {
      id: 'm2-s1',
      title: 'PostgreSQL fundamentals',
      topics: [
        {
          id: 'm2-t1',
          title: 'What a relational database is (in temple terms)',
          explain:
            'A relational database stores data in **tables** — grids of rows and columns. Every seva, every devotee, every booking becomes a row.',
          analogy:
            'Think of the temple office register for **Rangapooje**. The page has column headings across the top — *Date, Devotee, Gotra, Nakshatra, Amount* — and each devotee who books fills one line going down. A table is exactly that register: columns are the headings, rows are the lines.',
          theory:
            'A **relational database** is an organised collection of data kept in tables. A **table** holds one kind of thing — one table for `sevas`, one for `devotees`, one for `bookings`. Each table has **columns** (the fixed set of facts you record, like `name` or `amount`) and **rows** (one actual record, like "Mangalarathi booked by Suresha on 23 June").\n\nThe word *relational* means tables can **relate** to each other. A `bookings` row can point at a `devotees` row by storing that devotee\'s id, instead of copying the devotee\'s name and phone into every booking. This avoids repeating the same devotee\'s details on hundreds of Rangapooje lines.\n\nEvery row should be uniquely identifiable. We give each row a **primary key** — usually an auto-numbered `id` column. Just as the temple office might number each receipt 1, 2, 3, the database numbers each row so we can always find exactly one.',
          whyItMatters:
            'Maranakatte temple records **500+ Rangapooje entries a day**. A paper register or a spreadsheet cannot reliably search, total ₹ amounts, or prevent duplicates at that scale. A proper relational database gives you fast, correct answers — "how much Annadhana did we collect this week?" — in milliseconds.',
          steps: [
            'Picture the seva counter\'s daily register and list its column headings.',
            'Decide what ONE thing each table describes (sevas, devotees, bookings).',
            'Name the columns — the fixed facts you record for each row.',
            'Pick a primary key for each table (an auto-numbered `id`).',
            'Notice which tables relate (a booking refers to a devotee and a seva).',
            'Sketch this on paper before writing any SQL — design first, code second.',
          ],
          code:
            '-- A table is columns (headings) + rows (records)\n' +
            '-- sevas table: one row per kind of seva offered at the temple\n' +
            '--   id  | name         | price\n' +
            '--   ----+--------------+-------\n' +
            "--   1   | Mangalarathi |  20.00\n" +
            "--   2   | Hannikaayi   |  50.00\n" +
            "--   3   | Rangapooje   | 100.00\n" +
            '\n' +
            '-- devotees table: one row per devotee\n' +
            '--   id  | name     | gotra    | nakshatra | phone\n' +
            '--   ----+----------+----------+-----------+-----------\n' +
            "--   1   | Suresha  | Kashyapa | Ashwini   | 9876543210",
          pitfalls: [
            '**Putting everything in one giant table.** Devotees, sevas and bookings all in one sheet means a devotee\'s phone is copied onto every booking. Fix: one table per kind of thing, and relate them with ids.',
            '**No primary key.** Without a unique `id` you cannot tell two "Suresha" rows apart. Fix: give every table an auto-numbered `id` primary key.',
            '**Treating a database like a spreadsheet.** Spreadsheets let you type anything anywhere; a database enforces a fixed shape per column. Fix: design the columns and their types up front.',
            '**Storing computed totals as columns.** Saving a "week total" inside a row goes stale the moment a new booking arrives. Fix: compute totals with `SELECT sum(...)` when you need them.',
            '**Copying devotee details into bookings.** If a devotee changes phone, you would have to edit hundreds of rows. Fix: store the devotee once and reference by id.',
            '**Designing tables only in your head.** You will forget a column. Fix: sketch every table on paper or in a comment first.',
          ],
          tryIt:
            'On paper, draw three tables for the temple — `sevas`, `devotees`, `bookings` — with their column headings and one example row each. Mark each primary key.',
          takeaway:
            'A relational database is just well-organised office registers: tables of rows and columns, each row uniquely numbered, tables linked by ids instead of copied data.',
        },
        {
          id: 'm2-t2',
          title: 'CREATE TABLE — defining the shape of your data',
          explain:
            '`CREATE TABLE` tells PostgreSQL the name of a table and the columns it will hold, each with a **type** that fixes what kind of value it accepts.',
          analogy:
            'Before the temple prints a new receipt book, someone decides the layout: which boxes appear, how wide each is, whether a box takes letters or only numbers. `CREATE TABLE` is printing that layout once so every future receipt has the same boxes.',
          theory:
            'A table must exist before you can put data in it. `CREATE TABLE sevas (...)` lists each column as a *name* followed by a *type*. The type is a promise: a `numeric` column will refuse the word "free", a `text` column will refuse nothing.\n\nColumns can carry **constraints** — extra rules. `NOT NULL` means the value is required. `PRIMARY KEY` marks the unique id column. `DEFAULT` supplies a value when none is given. These rules are enforced by the database itself, so bad data is rejected even if a bug in your code tries to insert it.\n\nWe will use `CREATE TABLE IF NOT EXISTS` in this course so that running the same setup twice does no harm — important for a desktop app that initialises its database every time it starts.',
          whyItMatters:
            'The shape you define here is the foundation of the whole Maranakatte Seva app. Get the seva columns right — `name`, `price`, `created_at` — and every booking screen, every report and every receipt builds cleanly on top.',
          steps: [
            'Choose the table name (plural, lowercase: `sevas`).',
            'List each column with a clear name and a suitable type.',
            'Add a primary key column — `id integer GENERATED ALWAYS AS IDENTITY`.',
            'Mark required columns `NOT NULL` and give sensible `DEFAULT`s.',
            'Use `IF NOT EXISTS` so re-running the script is safe.',
            'Run it in `psql` and confirm with `\\d sevas`.',
          ],
          code:
            'CREATE TABLE IF NOT EXISTS sevas (\n' +
            '  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n' +
            '  name        text         NOT NULL,\n' +
            '  price       numeric(10,2) NOT NULL DEFAULT 0,\n' +
            '  is_active   boolean      NOT NULL DEFAULT true,\n' +
            '  created_at  timestamptz  NOT NULL DEFAULT now()\n' +
            ');',
          pitfalls: [
            '**Forgetting NOT NULL on required fields.** A seva with no `name` is useless. Fix: mark every must-have column `NOT NULL`.',
            '**Using money as the column name.** `money` is a special Postgres type with locale quirks — avoid it. Fix: use `numeric(10,2)` and name the column `price` or `amount`.',
            '**No primary key.** Without an identity column you cannot reliably update one row. Fix: add `id ... GENERATED ALWAYS AS IDENTITY PRIMARY KEY`.',
            '**Re-running CREATE TABLE and crashing.** Plain `CREATE TABLE` errors if the table already exists. Fix: write `CREATE TABLE IF NOT EXISTS`.',
            '**Storing dates as text.** `\'2026-06-23\'` as `text` cannot be sorted or filtered by range correctly. Fix: use `date` or `timestamptz`.',
            '**Vague column names.** `col1`, `data`, `value` mean nothing in six months. Fix: name columns after the fact they hold (`gotra`, `nakshatra`).',
          ],
          tryIt:
            'Write a `CREATE TABLE IF NOT EXISTS devotees (...)` with `id`, `name`, `gotra`, `nakshatra`, `phone`, and `created_at`. Run it in `psql` and inspect with `\\d devotees`.',
          takeaway:
            '`CREATE TABLE` fixes the columns and their types once; constraints like `NOT NULL` and `IF NOT EXISTS` make the table safe and self-defending.',
        },
        {
          id: 'm2-t3',
          title: 'INSERT — adding rows',
          explain:
            '`INSERT INTO ... VALUES (...)` writes a new row into a table — one new seva, one new devotee, one new booking.',
          analogy:
            'A devotee walks up to the counter and books Rangapooje. The clerk writes one fresh line in the register. `INSERT` is writing that line: you name the boxes you are filling and the values that go in them.',
          theory:
            'The form is `INSERT INTO table (col1, col2) VALUES (val1, val2)`. You list the columns you are supplying and then matching values in the same order. Columns you leave out fall back to their `DEFAULT` (so `created_at` fills itself with `now()` and `id` auto-numbers).\n\nText values go in **single quotes**: `\'Rangapooje\'`. Numbers and booleans do not. If a text value itself contains an apostrophe, you double it: `\'Devi\'\'s seva\'`.\n\nA very useful addition is `RETURNING` — `INSERT ... RETURNING id` hands you back the new row\'s generated id immediately, so you can use it (for example, to attach a booking to the devotee you just created) without a second query.',
          whyItMatters:
            'Every time counter staff records a seva or registers a new devotee, your app runs an `INSERT`. `RETURNING id` is what lets you create a devotee and their first booking in one smooth step at the busy Rangapooje counter.',
          steps: [
            'Name the table and the columns you will fill.',
            'Provide values in the same order, text in single quotes.',
            'Omit auto/default columns (`id`, `created_at`) — let them fill themselves.',
            'Add `RETURNING id` when you need the new row\'s id.',
            'Double any apostrophe inside a text value.',
            'Run it, then `SELECT` to confirm the row landed.',
          ],
          code:
            '-- insert one seva\n' +
            "INSERT INTO sevas (name, price)\n" +
            "VALUES ('Rangapooje', 100.00);\n" +
            '\n' +
            '-- insert a devotee and get the new id back\n' +
            "INSERT INTO devotees (name, gotra, nakshatra, phone)\n" +
            "VALUES ('Suresha', 'Kashyapa', 'Ashwini', '9876543210')\n" +
            'RETURNING id;',
          pitfalls: [
            '**Column/value count mismatch.** Listing 4 columns but giving 3 values errors out. Fix: keep the two lists the same length and order.',
            '**Forgetting quotes on text.** `VALUES (Rangapooje)` looks like a column name and fails. Fix: wrap text in single quotes.',
            '**Quoting numbers.** `VALUES (\'100.00\')` works by luck but is sloppy. Fix: leave numeric values unquoted.',
            '**Manually setting an identity id.** Supplying `id` yourself fights the `GENERATED ALWAYS AS IDENTITY` rule and errors. Fix: omit `id` and let Postgres assign it.',
            '**Unescaped apostrophe.** `\'Devi\'s\'` breaks the statement. Fix: double it — `\'Devi\'\'s\'` — or better, use parameters (next section).',
            '**Ignoring the returned id.** Running a second `SELECT max(id)` to find what you just inserted is racy. Fix: use `RETURNING id`.',
          ],
          tryIt:
            'Insert three sevas — Mangalarathi (20), Hannikaayi (50), Rangapooje (100) — then insert one devotee with `RETURNING id` and note the id printed.',
          takeaway:
            '`INSERT` adds rows; let defaults and identity fill what they can, quote text, and use `RETURNING id` to grab the new row\'s id in one shot.',
        },
        {
          id: 'm2-t4',
          title: 'SELECT and WHERE — reading rows back',
          explain:
            '`SELECT` reads data out of a table. `WHERE` filters it down to only the rows you want.',
          analogy:
            'A devotee asks "what did I book last evening?" The clerk flips the register and reads only the lines with that devotee\'s name and yesterday\'s date. `SELECT ... WHERE` is that flipping-and-reading: pick the columns, then keep only the matching lines.',
          theory:
            '`SELECT name, price FROM sevas` returns those two columns for every row. `SELECT *` returns all columns. Add `WHERE` to filter: `WHERE price > 50` keeps only the dearer sevas, `WHERE name = \'Rangapooje\'` keeps the exact match.\n\n`WHERE` conditions combine with `AND` and `OR`, and can use `=`, `<`, `>`, `<=`, `>=`, `<>` (not equal), `LIKE` for text patterns, and `IN (...)` for a list. `ORDER BY created_at DESC` sorts newest first; `LIMIT 10` returns only the first ten — handy for "latest bookings" screens.\n\nReading is the most common thing your app does — every report, list and lookup is a `SELECT`. It never changes data, so it is safe to experiment with.',
          whyItMatters:
            'The Rangapooje counter screen, the daily-collection report, the "find devotee by phone" lookup — every one is a `SELECT ... WHERE`. Filtering correctly is the difference between showing today\'s 500 bookings and accidentally showing the whole year.',
          steps: [
            'Choose the columns (`SELECT name, price`) or `*` for all.',
            'Name the table with `FROM sevas`.',
            'Filter with `WHERE` using `=`, `>`, `LIKE`, `IN`, joined by `AND`/`OR`.',
            'Sort with `ORDER BY ... DESC` for newest-first lists.',
            'Cap rows with `LIMIT` for "latest N" views.',
            'Run, read the result grid, refine the filter.',
          ],
          code:
            '-- all active sevas, dearest first\n' +
            'SELECT id, name, price\n' +
            'FROM sevas\n' +
            'WHERE is_active = true\n' +
            'ORDER BY price DESC;\n' +
            '\n' +
            '-- find a devotee by phone\n' +
            "SELECT id, name, gotra, nakshatra\n" +
            'FROM devotees\n' +
            "WHERE phone = '9876543210';",
          pitfalls: [
            '**Using = for text patterns.** `WHERE name = \'Ranga\'` will not match "Rangapooje". Fix: use `LIKE \'Ranga%\'` for prefix matches.',
            '**Forgetting WHERE on a big table.** A bare `SELECT *` on a year of bookings floods the screen. Fix: always filter or `LIMIT` during testing.',
            '**Confusing AND / OR precedence.** `WHERE a OR b AND c` may not mean what you expect. Fix: add parentheses — `WHERE (a OR b) AND c`.',
            '**Case sensitivity surprises.** `WHERE name = \'rangapooje\'` misses "Rangapooje". Fix: use `ILIKE` for case-insensitive matching.',
            '**Comparing to NULL with =.** `WHERE phone = NULL` never matches. Fix: use `WHERE phone IS NULL`.',
            '**No ORDER BY but expecting an order.** Without `ORDER BY`, row order is undefined. Fix: always sort when order matters.',
          ],
          tryIt:
            'Write a `SELECT` that returns the three sevas priced 50 or above, sorted cheapest first, then one that finds devotees whose name starts with "S" using `ILIKE`.',
          takeaway:
            '`SELECT` reads, `WHERE` filters, `ORDER BY`/`LIMIT` shape the result — together they power every list and report in the app, and they never change your data.',
        },
        {
          id: 'm2-t5',
          title: 'UPDATE and DELETE — changing and removing rows',
          explain:
            '`UPDATE` changes values in existing rows; `DELETE` removes rows. Both take a `WHERE` to choose which rows — and forgetting it hits ALL of them.',
          analogy:
            'A devotee\'s phone number changed: the clerk finds their line and overwrites just that box — that is `UPDATE`. A booking was entered by mistake and must be struck off the register — that is `DELETE`. The dangerous part is the same in both: be sure you are touching the right line, not the whole page.',
          theory:
            '`UPDATE sevas SET price = 120 WHERE id = 3` changes the price of exactly one seva. The `SET` clause lists the columns to change; the `WHERE` clause picks the rows. **Omit `WHERE` and every row is updated** — a one-line mistake that can rewrite your whole table.\n\n`DELETE FROM bookings WHERE id = 42` removes one booking. Again, no `WHERE` deletes everything. Because Maranakatte Seva is the temple\'s only record, a careless `DELETE` is unrecoverable without a backup.\n\nA safe habit: run the same `WHERE` as a `SELECT` first to see exactly which rows you are about to change, *then* swap `SELECT *` for `UPDATE ... SET` or `DELETE`. Inside the app we wrap risky changes in a transaction (covered in a later module) so they can be rolled back.',
          whyItMatters:
            'Editing a devotee\'s phone, marking a seva inactive instead of deleting it, cancelling a wrongly entered booking — these are everyday counter actions. A missing `WHERE` here could wipe the temple\'s entire seva list, so the discipline matters more than the syntax.',
          steps: [
            'Write the `WHERE` first and test it as a `SELECT`.',
            'Confirm it returns exactly the rows you mean to touch.',
            'For edits, write `UPDATE table SET col = val WHERE ...`.',
            'For removals, write `DELETE FROM table WHERE ...`.',
            'Prefer a soft delete (`SET is_active = false`) over a hard `DELETE` for sevas.',
            'Re-`SELECT` afterwards to confirm the change.',
          ],
          code:
            '-- change one devotee\'s phone\n' +
            "UPDATE devotees\n" +
            "SET phone = '9000011111'\n" +
            'WHERE id = 1;\n' +
            '\n' +
            '-- soft-delete a seva (preferred over removing it)\n' +
            'UPDATE sevas SET is_active = false WHERE id = 3;\n' +
            '\n' +
            '-- hard delete a mistaken booking\n' +
            'DELETE FROM bookings WHERE id = 42;',
          pitfalls: [
            '**Omitting WHERE.** `UPDATE sevas SET price = 0` zeroes every seva. Fix: always include a `WHERE`, and test it as a `SELECT` first.',
            '**Hard-deleting reference data.** Deleting a seva breaks past bookings that point to it. Fix: soft-delete with `is_active = false`.',
            '**No backup before a bulk change.** On a local-only app there is no undo. Fix: back up the data folder (Module covers this) before mass edits.',
            '**Updating by name instead of id.** `WHERE name = \'Suresha\'` may hit several devotees. Fix: target the unique `id`.',
            '**Forgetting DELETE cascades.** Removing a devotee with bookings can fail or orphan rows. Fix: decide on `ON DELETE` behaviour when designing keys.',
            '**Running UPDATE/DELETE in production by hand.** A typo in psql is permanent. Fix: do data changes through the app\'s reviewed code paths.',
          ],
          tryIt:
            'Raise Rangapooje\'s price to 120 with an `UPDATE ... WHERE id = ...`, verifying first with a matching `SELECT`. Then soft-delete one seva and confirm it no longer appears in your "active sevas" query.',
          takeaway:
            '`UPDATE` and `DELETE` change and remove rows; the `WHERE` clause is the safety catch — test it as a `SELECT` first, and prefer soft deletes for data other rows depend on.',
        },
        {
          id: 'm2-t6',
          title: 'Postgres data types — and why ₹ is never a float',
          explain:
            'Each column has a type. Choosing the right one — especially `numeric` for money — keeps the temple\'s rupees exact and its dates sortable.',
          analogy:
            'The temple uses different registers for different things: a cash register tallies rupees to the paisa, a calendar marks dates, an attendance sheet just ticks yes/no. Picking a column type is choosing the right register so the data behaves correctly.',
          theory:
            'The types you will use in Maranakatte Seva:\n\n- `text` — names, gotra, nakshatra, phone (store phone as text, never a number — leading zeros and length matter).\n- `integer` — whole-number counts and ids.\n- `numeric(10,2)` — **money in ₹**. This is exact decimal arithmetic: ₹100.50 stays ₹100.50.\n- `timestamptz` — a date *and* time with time zone, for `created_at`.\n- `date` — a calendar day with no time, for a booking\'s seva date.\n- `boolean` — true/false flags like `is_active`.\n- identity (`GENERATED ALWAYS AS IDENTITY`) — auto-numbered primary keys (the modern replacement for `serial`).\n\nThe single most important rule: **never use `float`/`real`/`double precision` for money.** Floating-point cannot represent 0.10 exactly, so totals drift by a paisa and reconciliations fail. `numeric` is decimal and exact — it is the only correct choice for ₹.',
          whyItMatters:
            'Rangapooje brings 500+ paid entries a day. If each were stored as a float, the daily-collection total could be off by rupees by month-end, and the temple\'s accounts would not tally. `numeric` guarantees the books balance to the paisa.',
          steps: [
            'For money columns, always pick `numeric(10,2)` — never float.',
            'Store phone numbers as `text`, not integer.',
            'Use `timestamptz` for "when recorded" and `date` for "seva day".',
            'Use `boolean` for yes/no flags.',
            'Use identity columns for auto-numbered primary keys.',
            'Match the React form input to the column type (a money field sends a string, parsed to numeric).',
          ],
          code:
            'CREATE TABLE IF NOT EXISTS bookings (\n' +
            '  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n' +
            '  devotee_id  integer      NOT NULL,\n' +
            '  seva_id     integer      NOT NULL,\n' +
            '  seva_date   date         NOT NULL,\n' +
            '  amount      numeric(10,2) NOT NULL,   -- exact rupees, never float\n' +
            '  paid        boolean      NOT NULL DEFAULT false,\n' +
            '  created_at  timestamptz  NOT NULL DEFAULT now()\n' +
            ');',
          pitfalls: [
            '**Using float for ₹.** `amount real` makes ₹0.10 inexact and totals drift. Fix: use `numeric(10,2)` for all money.',
            '**Phone as integer.** A number drops leading zeros and overflows. Fix: store phone as `text`.',
            '**`timestamp` without time zone.** Storing local time with no zone causes confusion across DST/machines. Fix: prefer `timestamptz`.',
            '**Using `date` when you need the time too.** A booking timestamp loses the moment it was taken. Fix: `timestamptz` for "created", `date` for "seva day".',
            '**`serial` everywhere.** `serial` is legacy and has ownership quirks. Fix: use `GENERATED ALWAYS AS IDENTITY`.',
            '**Over-wide numeric.** `numeric` with no precision allows silly values. Fix: bound it, e.g. `numeric(10,2)`.',
          ],
          tryIt:
            'Add a `numeric(10,2)` `amount` column to a test table, insert `100.10` three times, and `SELECT sum(amount)` — confirm it is exactly `300.30`, not `300.29999`.',
          takeaway:
            'Pick types deliberately: `text` for phone, `timestamptz`/`date` for time, `boolean` for flags, identity for keys — and `numeric` for every rupee, because money must never be a float.',
        },
        {
          id: 'm2-t7',
          title: 'Inspecting data with psql and a GUI (pgAdmin / DBeaver)',
          explain:
            'Two ways to look at and poke your local database: `psql` (a terminal tool) and a GUI like pgAdmin or DBeaver (point-and-click).',
          analogy:
            'psql is like talking to the temple accountant directly — fast, terse, you must know what to ask. A GUI is like the printed ledger spread open on a table — you can see all the pages and click around. Both read the same books.',
          theory:
            '`psql` is the official command-line client. You connect with `psql -U postgres -d maranakatte` and type SQL at the prompt. Its **backslash commands** are the fast way to look around: `\\l` lists databases, `\\c maranakatte` connects to one, `\\dt` lists tables, `\\d sevas` describes a table\'s columns, and `\\q` quits. It is always available and perfect for quick checks and running `.sql` files.\n\nA **GUI** — pgAdmin (Postgres\'s own) or DBeaver (works with many databases) — shows the same server in a tree: databases, schemas, tables. You can browse rows in a grid, edit visually, and run queries in a window. Beginners often find a GUI friendlier for *seeing* data, while psql is faster for repeatable commands.\n\nFor this course, use whichever you like to **verify** what your Electron app wrote. After the app inserts a Rangapooje booking, open the `bookings` table in DBeaver or run `SELECT * FROM bookings` in psql to confirm the row is really there on this machine.',
          whyItMatters:
            'When a screen in Maranakatte Seva shows the wrong total, you need to peek at the actual rows to find out whether the bug is in the SQL or the React. psql and a GUI are your debugging eyes into the local database.',
          steps: [
            'Install PostgreSQL (which includes `psql`) and optionally pgAdmin or DBeaver.',
            'Connect: `psql -U postgres -d maranakatte` (or set up a connection in the GUI).',
            'List tables with `\\dt`; describe one with `\\d sevas`.',
            'Run `SELECT * FROM sevas;` to view rows.',
            'In a GUI, open the table in the tree and browse the data grid.',
            'Use these tools to confirm what your app inserted while developing.',
          ],
          code:
            '# connect to the local database\n' +
            'psql -U postgres -d maranakatte\n' +
            '\n' +
            '-- inside psql:\n' +
            '\\dt              -- list tables\n' +
            '\\d sevas         -- describe the sevas table\n' +
            'SELECT * FROM sevas ORDER BY id;\n' +
            '\\q               -- quit',
          pitfalls: [
            '**Connecting to the wrong database.** Querying `postgres` instead of `maranakatte` shows no temple data. Fix: `\\c maranakatte` or pass `-d maranakatte`.',
            '**Forgetting the semicolon in psql.** SQL statements need a trailing `;` or psql waits. Fix: end statements with `;` (backslash commands do not need one).',
            '**Editing rows in a GUI while the app runs.** Hand-edits can clash with app logic. Fix: inspect freely, but make real changes through the app.',
            '**Assuming the GUI is live.** A stale grid shows old data. Fix: refresh the table after the app writes.',
            '**Wrong port or user.** Default port is 5432 and user often `postgres`. Fix: match the connection settings to your local install.',
            '**Treating production-style secrets casually.** Even locally, do not paste passwords into shared notes. Fix: use a local-only password and keep it out of the repo.',
          ],
          tryIt:
            'Connect with psql, run `\\dt` to list your tables, `\\d sevas` to see its columns, then `SELECT * FROM sevas;`. Open the same table in DBeaver or pgAdmin and confirm you see identical rows.',
          takeaway:
            'psql (terminal) and a GUI (pgAdmin/DBeaver) are two windows onto the same local database — use them to inspect and verify exactly what your app reads and writes.',
        },
      ],
    },
    {
      id: 'm2-s2',
      title: 'Connecting from Electron (the main process)',
      topics: [
        {
          id: 'm2-t8',
          title: 'node-postgres (pg): Pool vs Client',
          explain:
            'The `pg` package lets Node talk to PostgreSQL. It offers a single `Client` (one connection) and a `Pool` (a managed set of reused connections). For a desktop app, use a `Pool`.',
          analogy:
            'A `Client` is one temple clerk who must open the register, do one task, and close it each time. A `Pool` is a small team of clerks already standing ready: when a request comes, a free clerk handles it and then returns to the line. The team handles bursts — like 500 Rangapooje entries an evening — without the cost of hiring and dismissing a clerk every time.',
          theory:
            'Install with `npm install pg`. A `Client` represents a single connection: you `connect()`, run queries, and `end()`. That is fine for a one-off script, but opening and closing a connection for every query is slow and fragile.\n\nA `Pool` keeps several connections open and lends them out. You call `pool.query(...)` and the pool checks out a free connection, runs your query, and returns the connection to the pool automatically. It caps the number of simultaneous connections so you never overwhelm the local Postgres server.\n\nFor Maranakatte Seva — a single-user desktop app where bursts of bookings come in the evening — a `Pool` with a small `max` (say 5–10) is the right fit. You create **one** pool when the app starts and reuse it for the app\'s whole life; you do not create a pool per query.',
          whyItMatters:
            'The Rangapooje rush means many quick inserts and reads in a short window. A pool reuses warm connections so each booking saves instantly, and it prevents the app from accidentally opening hundreds of connections and stalling the local database.',
          steps: [
            'Run `npm install pg` in the project.',
            'Import `Pool` from `pg` in a **main-process** module.',
            'Create exactly one `Pool` at app startup with connection config.',
            'Use `pool.query(text, params)` everywhere instead of new Clients.',
            'Set a sensible `max` (5–10) for a single-user desktop app.',
            'Close the pool with `pool.end()` when the app quits.',
          ],
          code:
            "const { Pool } = require('pg');\n" +
            '\n' +
            '// one pool for the whole app lifetime\n' +
            'const pool = new Pool({\n' +
            "  host: 'localhost',\n" +
            '  port: 5432,\n' +
            "  database: 'maranakatte',\n" +
            "  user: 'postgres',\n" +
            "  password: 'local-dev-password',\n" +
            '  max: 8,\n' +
            '});\n' +
            '\n' +
            "// later, anywhere in main:\n" +
            "const result = await pool.query('SELECT * FROM sevas');\n" +
            'console.log(result.rows);',
          pitfalls: [
            '**Creating a new Pool per query.** That defeats pooling and leaks connections. Fix: create one pool at startup and reuse it.',
            '**Using a bare Client for the app.** Manual connect/end is error-prone under load. Fix: use a `Pool`.',
            '**Setting max too high.** Hundreds of connections crush local Postgres. Fix: a small `max` like 8 for one desktop user.',
            '**Never calling pool.end().** Connections linger when the app closes. Fix: `await pool.end()` on app quit.',
            '**Forgetting await.** `pool.query` is async; without `await` you get a Promise, not rows. Fix: `await` it (or `.then`).',
            '**Putting the pool in the renderer.** That exposes the DB to the UI bundle. Fix: pools live only in the main process (next topic).',
          ],
          tryIt:
            'Install `pg`, create a tiny main-process script that builds one `Pool`, runs `SELECT now()`, logs the result, and then calls `pool.end()`.',
          takeaway:
            'Use `pg`\'s `Pool`, not a lone `Client`: create one pool at startup, reuse it for every query, keep `max` small, and end it on quit — perfect for the evening Rangapooje burst.',
        },
        {
          id: 'm2-t9',
          title: 'Connect ONLY from the main process — never the renderer',
          explain:
            'In Electron the **main process** is trusted Node code; the **renderer** is the web page (React). The database connection lives in main only — the renderer never touches `pg`.',
          analogy:
            'The temple strong-room (where money and records are kept) is behind the office counter. Devotees stand at the front window; they never walk into the strong-room. The renderer is the front window, the main process is the strong-room. Requests pass through the counter — they do not hand the public a key.',
          theory:
            'Electron runs two kinds of process. The **main process** is full Node.js — it can open files, talk to PostgreSQL, use the OS. The **renderer process** runs your React UI like a web page in Chromium. For safety, modern Electron keeps the renderer sandboxed: `nodeIntegration` is OFF and `contextIsolation` is ON, so the UI cannot directly `require(\'pg\')` or read the filesystem.\n\nThis matters because the renderer loads what is effectively a web page. If you put database credentials or a live `Pool` there, they would sit in the front-end bundle, readable by anyone who opens dev tools. Worse, any malicious script in the UI could run arbitrary SQL.\n\nSo the rule is: **all `pg` code lives in the main process.** The renderer asks the main process to do database work by sending messages over IPC through a preload `contextBridge` (built in the next module). Main runs the query against the local Pool and sends back only the rows. The UI never sees the connection, only the results.',
          whyItMatters:
            'Maranakatte Seva holds the temple\'s money records. Keeping `pg` and the connection string strictly in the main process means the database password is never shipped inside the front-end, and the UI can only do the specific, reviewed operations main chooses to expose.',
          steps: [
            'Put every `pg` import and the `Pool` in main-process files only.',
            'In `BrowserWindow` webPreferences, set `nodeIntegration: false`, `contextIsolation: true`.',
            'Expose database operations to the UI via a preload `contextBridge`, not by importing `pg`.',
            'Handle each operation in main with `ipcMain.handle(...)`.',
            'Return only result rows to the renderer — never the Pool or credentials.',
            'Keep the connection string in main, never in renderer code.',
          ],
          code:
            "// main.js (main process) — pg lives here ONLY\n" +
            "const { app, BrowserWindow, ipcMain } = require('electron');\n" +
            "const path = require('path');\n" +
            "const { pool } = require('./db'); // our Pool wrapper\n" +
            '\n' +
            "ipcMain.handle('sevas:list', async () => {\n" +
            "  const { rows } = await pool.query('SELECT id, name, price FROM sevas ORDER BY id');\n" +
            '  return rows; // only data crosses to the renderer\n' +
            '});\n' +
            '\n' +
            'function createWindow() {\n' +
            '  new BrowserWindow({\n' +
            '    webPreferences: {\n' +
            "      preload: path.join(__dirname, 'preload.js'),\n" +
            '      nodeIntegration: false,    // renderer is NOT Node\n' +
            '      contextIsolation: true,    // renderer is sandboxed\n' +
            '    },\n' +
            '  });\n' +
            '}',
          pitfalls: [
            '**Importing `pg` in a React file.** With isolation on it fails; with it off it leaks the DB to the UI. Fix: keep `pg` in main only.',
            '**Turning nodeIntegration on for convenience.** That hands the web page full Node powers. Fix: leave it `false` and use IPC.',
            '**Shipping the connection string to the renderer.** It ends up in the front-end bundle. Fix: keep credentials in main.',
            '**Exposing a generic "run any SQL" IPC.** That lets the UI run arbitrary queries. Fix: expose specific, named operations only.',
            '**Returning the Pool or Client over IPC.** Only plain data can cross IPC. Fix: return `rows`, not connection objects.',
            '**contextIsolation off.** Disabling it removes the safety wall. Fix: keep `contextIsolation: true` and bridge via preload.',
          ],
          tryIt:
            'Add an `ipcMain.handle(\'sevas:list\', ...)` in main that returns rows from `SELECT * FROM sevas`. Confirm `pg` is imported nowhere under your React/renderer folder.',
          takeaway:
            'The database belongs to the trusted main process; the React renderer stays sandboxed and asks for data via IPC. `pg` and credentials never enter the front-end.',
        },
        {
          id: 'm2-t10',
          title: 'Connection config — where the local connection string lives',
          explain:
            'Your app needs host, port, database, user and password to connect. For a local desktop app this config lives in the main process, kept out of the renderer bundle and out of git.',
          analogy:
            'The temple keeps the strong-room combination written in the manager\'s private book, not on a notice board at the front window. The connection config is that private book — main-process code can read it; the public-facing UI never sees it.',
          theory:
            'A connection needs `host`, `port`, `database`, `user`, and `password` — or a single **connection string** like `postgres://postgres:pw@localhost:5432/maranakatte`. Because Maranakatte Seva is offline and single-user, the database is on `localhost`, so the "secret" is really just a local password — but you still keep it out of the front-end and out of version control.\n\nA simple, robust pattern: read config from environment variables in development (via a `.env` file that is git-ignored), and from a config file under the user\'s data folder in production. `pg` even reads standard `PG*` environment variables (`PGHOST`, `PGDATABASE`, etc.) automatically, so a minimal `new Pool()` can pick them up.\n\nThe key discipline is *location*: this config is constructed in main-process code only. The renderer never imports it, so the credentials are never bundled into the web page the user could open with dev tools.',
          whyItMatters:
            'Keeping the connection string in main (and out of git) means you never accidentally commit a password or ship it inside the UI bundle. For a temple app that may later be packaged and shared between counters, that hygiene prevents leaking the database access.',
          steps: [
            'Decide the config keys: host, port, database, user, password.',
            'In dev, put them in a git-ignored `.env` and load with `dotenv` in main.',
            'Add `.env` to `.gitignore` so it never reaches the repo.',
            'In production, store/read config from a file under `app.getPath(\'userData\')`.',
            'Build the `Pool` from this config in a main-process `db.js`.',
            'Confirm nothing under the renderer folder imports the config.',
          ],
          code:
            "// db-config.js (main process)\n" +
            "require('dotenv').config();\n" +
            '\n' +
            'const config = {\n' +
            "  host: process.env.PGHOST || 'localhost',\n" +
            '  port: Number(process.env.PGPORT) || 5432,\n' +
            "  database: process.env.PGDATABASE || 'maranakatte',\n" +
            "  user: process.env.PGUSER || 'postgres',\n" +
            "  password: process.env.PGPASSWORD || '',\n" +
            '};\n' +
            '\n' +
            'module.exports = { config };',
          pitfalls: [
            '**Hard-coding the password in source.** It then lands in git history forever. Fix: read from env/config and git-ignore the secret file.',
            '**Committing the `.env` file.** A leaked file leaks the password. Fix: add `.env` to `.gitignore` before the first commit.',
            '**Putting config in renderer code.** It bundles into the UI. Fix: build config only in main.',
            '**Wrong port type.** `process.env.PGPORT` is a string; `pg` wants a number. Fix: wrap with `Number(...)`.',
            '**No fallback defaults.** A missing env var crashes startup. Fix: provide sensible `|| \'localhost\'` defaults for local dev.',
            '**Assuming dev config works when packaged.** Env vars may be absent in a built app. Fix: read production config from the userData folder.',
          ],
          tryIt:
            'Create a git-ignored `.env` with `PGDATABASE=maranakatte`, load it with `dotenv` in a main-process module, build a `config` object, and log it (mask the password) to confirm it reads.',
          takeaway:
            'Connection config lives in the main process, sourced from a git-ignored `.env` in dev and a userData file in production — never hard-coded, never committed, never in the renderer.',
        },
        {
          id: 'm2-t11',
          title: 'Parameterized queries — stopping SQL injection',
          explain:
            'Never glue user input into SQL with string concatenation. Use `$1, $2` placeholders and pass values separately — `pg` sends them safely.',
          analogy:
            'Imagine the clerk reading aloud whatever a devotee writes on a slip and treating it as an instruction. A trickster writes "and also empty the cash box" — and the obedient clerk does it. Parameterized queries hand the slip\'s contents to the clerk as *data to file*, never as instructions to obey.',
          theory:
            '**SQL injection** happens when user-supplied text is concatenated into a query and the database interprets part of it as SQL. If a devotee\'s name were spliced in directly, a malicious value like `\'; DROP TABLE sevas; --` could destroy data.\n\nThe fix is **parameterized queries**. You write the SQL with numbered placeholders — `$1`, `$2` — and pass the actual values as a separate array. `pg` sends the query text and the values apart, so the database always treats the values as plain data, never as code. As a bonus, you no longer worry about escaping apostrophes (Devi\'s seva just works).\n\nIn `pg` the call is `pool.query(text, params)` where `text` contains `$1, $2, ...` and `params` is an array in the same order. This is the only way you should build queries with variable input in Maranakatte Seva — every devotee name, gotra, phone and amount goes through a placeholder.',
          whyItMatters:
            'Counter staff type devotee names and notes all day. Even though the app is offline, a stray apostrophe or a mistyped value could corrupt or break a query. Parameterized queries make every insert and lookup robust against odd input and impossible to inject.',
          steps: [
            'Write SQL with `$1, $2, ...` where values go.',
            'Collect the values in an array in the same order.',
            'Call `pool.query(text, valuesArray)`.',
            'Never use string concatenation or template literals to insert user data.',
            'Read results from `result.rows`.',
            'Apply this to every query that touches user input.',
          ],
          code:
            '// SAFE — parameterized\n' +
            "const text = 'INSERT INTO devotees (name, gotra, nakshatra, phone)\\n" +
            "             VALUES ($1, $2, $3, $4) RETURNING id';\n" +
            "const params = ['Suresha', 'Kashyapa', 'Ashwini', '9876543210'];\n" +
            'const { rows } = await pool.query(text, params);\n' +
            'console.log(rows[0].id);\n' +
            '\n' +
            "// DANGEROUS — never do this:\n" +
            "// pool.query('INSERT INTO devotees (name) VALUES (' + name + ')');",
          pitfalls: [
            '**Concatenating user input.** `\'... VALUES (\' + name + \')\'` is wide open to injection. Fix: use `$1` placeholders and a params array.',
            '**Using template literals for values.** `` `WHERE name = ${name}` `` is the same flaw. Fix: `WHERE name = $1` with params.',
            '**Wrong param order.** Mismatched `$1`/array order inserts the wrong values. Fix: keep placeholders and array in lock-step.',
            '**Trying to parameterize identifiers.** `$1` cannot stand in for a table or column name. Fix: validate identifiers against a whitelist, not parameters.',
            '**Manually escaping quotes instead.** Hand-escaping is fragile and easy to get wrong. Fix: let parameters handle it.',
            '**Off-by-one with $0.** Placeholders start at `$1`, not `$0`. Fix: number from one.',
          ],
          tryIt:
            'Rewrite an unsafe concatenated insert into a parameterized `pool.query(text, params)` call. Try inserting a devotee named `D\'Souza` and confirm it inserts cleanly with no escaping.',
          takeaway:
            'Always parameterize: `$1, $2` in the SQL, values in a separate array. It stops SQL injection, handles apostrophes for free, and is the only safe way to build queries with user input.',
        },
        {
          id: 'm2-t12',
          title: 'A small async query(text, params) wrapper',
          explain:
            'Wrap the pool in a tiny module that exposes one `query(text, params)` function, so the rest of the app calls one clean entry point instead of touching the pool directly.',
          analogy:
            'Rather than every clerk knowing how to operate the strong-room machinery, the temple has one trusted teller window: you hand a slip in, you get rows back. The wrapper is that single window — simple, consistent, and the only door to the data.',
          theory:
            'A wrapper module owns the single `Pool` and exports an `async query(text, params)` function that simply forwards to `pool.query`. Centralising this gives you one place to add logging, timing, or error handling later, and it keeps every caller short: `const { rows } = await db.query(sql, params)`.\n\nBecause the function is `async`, callers use `await` and wrap calls in `try/catch` to handle database errors gracefully (a failed insert should show the clerk a message, not crash the app). You can log slow queries here too — useful when the evening Rangapooje load grows.\n\nThis wrapper is the seed of the `db.js` you will build as a project. It lives in the main process, holds the pool, and offers `query()` (for simple statements) and, later, `getClient()` (for multi-step transactions). The whole app talks to PostgreSQL through this one module.',
          whyItMatters:
            'One query entry point means consistent error handling, easy logging, and a single file to change if the database setup evolves. For Maranakatte Seva it keeps the booking, devotee and report code clean and uniform, and makes the security boundary (main-only DB access) obvious.',
          steps: [
            'Create `db.js` in the main process holding the single `Pool`.',
            'Export `async function query(text, params)` that calls `pool.query`.',
            'Have callers use `const { rows } = await query(text, params)`.',
            'Add a `try/catch` (and optional timing log) inside or around the wrapper.',
            'Export the pool for `pool.end()` on app quit.',
            'Import this module wherever main needs the database.',
          ],
          code:
            "// db.js (main process)\n" +
            "const { Pool } = require('pg');\n" +
            "const { config } = require('./db-config');\n" +
            '\n' +
            'const pool = new Pool(config);\n' +
            '\n' +
            'async function query(text, params) {\n' +
            '  const start = Date.now();\n' +
            '  const result = await pool.query(text, params);\n' +
            "  console.log('query', { ms: Date.now() - start, rows: result.rowCount });\n" +
            '  return result;\n' +
            '}\n' +
            '\n' +
            'module.exports = { query, pool };',
          pitfalls: [
            '**Creating a pool inside the function.** A new pool per call leaks connections. Fix: build the pool once at module top, reuse it.',
            '**Swallowing errors silently.** A bare `catch {}` hides real failures. Fix: log or rethrow so the UI can show a message.',
            '**Returning rows directly always.** Some callers need `rowCount` or `command`. Fix: return the whole `result` and let callers pick `.rows`.',
            '**Forgetting await at call sites.** Without `await` you handle a Promise, not data. Fix: `await query(...)` everywhere.',
            '**No way to close the pool.** Export the pool so quit handlers can `pool.end()`. Fix: export both `query` and `pool`.',
            '**Logging full params in production.** That can leak devotee data to logs. Fix: log counts/timings, not raw values.',
          ],
          tryIt:
            'Write `db.js` exporting `query(text, params)` over one `Pool`. From a test script, call `await query(\'SELECT $1::text AS msg\', [\'namaskara\'])` and log `rows[0].msg`.',
          takeaway:
            'A small `query(text, params)` wrapper around one pool gives the whole app a single, consistent, main-process door to PostgreSQL — easy to log, easy to guard, easy to extend with `getClient()` later.',
        },
      ],
    },
    {
      id: 'm2-s3',
      title: 'Bundling the database with a desktop app',
      topics: [
        {
          id: 'm2-t13',
          title: 'The "no cloud" decision — data lives on this machine',
          explain:
            'Maranakatte Seva stores everything in a LOCAL PostgreSQL database on the temple\'s own computer. No server, no internet. That choice shapes backups, trust and responsibility.',
          analogy:
            'The temple keeps its registers in its own almirah, not in a bank vault in another city. Nobody else can see them, they work even when the phone lines are down — but the temple alone must guard them and keep copies. That is exactly what "no cloud" means for the data.',
          theory:
            'A **cloud** app keeps data on a remote server; an **offline/local** app keeps it on the user\'s own machine. Maranakatte Seva is deliberately offline: the database runs on the temple\'s computer, so it works without internet (coastal Karnataka power and network can be unreliable), needs no subscription, and keeps devotee details private to the temple.\n\nThe trade-off is **responsibility**. With no cloud, there is no automatic off-site backup. If the disk fails and there is no copy, the records are gone. So a local app must make **backups** easy and obvious — copying the data folder to a pen-drive, for instance — and the staff must actually do it.\n\nThis also affects **trust**: because data never leaves the building, devotees\' gotra, nakshatra and phone stay private by design. The app\'s job is to be a faithful, local keeper of records, and to make protecting them simple.',
          whyItMatters:
            'Choosing local-first is the headline decision of this whole app — it is why the temple can run sevas during a network outage and keep devotee data fully private. But it puts backups squarely on the temple, so the app must guide that, all the way down to what happens at uninstall (covered later).',
          steps: [
            'Accept that the database lives on the temple\'s machine, offline.',
            'Plan a simple backup: copy the data folder to external storage regularly.',
            'Keep devotee data private — it never leaves the building.',
            'Design the app to work fully with no internet.',
            'Make backup/restore a visible feature, not an afterthought.',
            'Document for staff where the data is and how to copy it.',
          ],
          code:
            '// Why local-first for Maranakatte Seva:\n' +
            '//  - works with no internet (network/power can be unreliable)\n' +
            '//  - no subscription cost\n' +
            '//  - devotee details stay private to the temple\n' +
            '//  TRADE-OFF: the temple must keep its own backups.\n' +
            '//\n' +
            '// Backup = copy the data folder to a pen-drive:\n' +
            "const { app } = require('electron');\n" +
            "const dataDir = app.getPath('userData'); // everything lives here\n" +
            'console.log("Back up this folder regularly:", dataDir);',
          pitfalls: [
            '**Assuming local means automatically safe.** Local data has no off-site copy. Fix: build and encourage regular backups.',
            '**No backup feature at all.** Staff will not run command-line tools. Fix: add a one-click "Backup to pen-drive" in the app.',
            '**Spreading data across many locations.** Hard to back up if files are scattered. Fix: keep everything under one userData folder.',
            '**Ignoring restore.** A backup you cannot restore is worthless. Fix: test restoring from a copy.',
            '**Treating offline as a limitation, not a feature.** It is a deliberate strength here. Fix: design for and lean into local-first.',
            '**Forgetting privacy obligations.** Devotee data is sensitive even locally. Fix: keep it on-machine and access-controlled.',
          ],
          tryIt:
            'Write down, in three bullet points, what the temple gains and what it must take responsibility for by choosing a local database over a cloud one. Then log `app.getPath(\'userData\')` to see where that data will live.',
          takeaway:
            'No cloud means the data is private, offline-capable, and free of subscriptions — but the temple owns the backups. The app must make protecting and copying the local data effortless.',
        },
        {
          id: 'm2-t14',
          title: 'Where app data belongs — app.getPath(\'userData\')',
          explain:
            'Electron gives every app a private, per-user folder via `app.getPath(\'userData\')`. That is where Maranakatte Seva keeps its config, local files and database-related data.',
          analogy:
            'Every shop in the temple street has its own lockable storeroom assigned by the municipality — a known address that belongs only to that shop. `userData` is your app\'s assigned storeroom: a proper place the OS sets aside for your app alone.',
          theory:
            '`app.getPath(\'userData\')` returns an OS-appropriate folder reserved for your app — on Windows under `AppData\\Roaming\\<AppName>`, on macOS under `Application Support`, on Linux under `.config`. Electron creates it for you, and it survives app restarts and updates. This is the correct home for anything your app needs to persist.\n\nDo **not** write data next to the app\'s executable or inside the install folder — that location may be read-only, gets wiped on reinstall, and is shared between users. `userData` is writable, per-user, and stable, which is exactly what a records app needs.\n\nFor Maranakatte Seva, this folder holds the local config (connection settings file), any migration files or logs, and is the single place to back up. The PostgreSQL data directory itself is managed by the Postgres install, but everything *your app* owns — config, logs, exports — lives under `userData`, giving you one folder to protect.',
          whyItMatters:
            'Putting all app-owned data in `userData` gives the temple exactly one folder to back up and one place to look when something goes wrong. It also means reinstalling or updating the app never accidentally erases the temple\'s records or settings.',
          steps: [
            'Call `app.getPath(\'userData\')` (only after the app is ready) to get the folder.',
            'Build subpaths with `path.join(userData, ...)` for config, logs, exports.',
            'Create subfolders with `fs.mkdirSync(..., { recursive: true })` if missing.',
            'Store the connection-config file and migration logs here.',
            'Make this folder the target of the backup feature.',
            'Never write app data into the install directory.',
          ],
          code:
            "const { app } = require('electron');\n" +
            "const path = require('path');\n" +
            "const fs = require('fs');\n" +
            '\n' +
            'function dataPaths() {\n' +
            "  const base = app.getPath('userData');\n" +
            "  const configFile = path.join(base, 'config.json');\n" +
            "  const migrationsLog = path.join(base, 'migrations.log');\n" +
            "  fs.mkdirSync(base, { recursive: true });\n" +
            '  return { base, configFile, migrationsLog };\n' +
            '}\n' +
            '\n' +
            "console.log('App data lives in:', dataPaths().base);",
          pitfalls: [
            '**Writing beside the .exe.** That folder may be read-only and is wiped on reinstall. Fix: use `userData`.',
            '**Calling getPath too early.** Some paths need the app `ready` event. Fix: call after `app.whenReady()`.',
            '**Hard-coding a Windows path.** Breaks on macOS/Linux and other user accounts. Fix: always use `app.getPath`.',
            '**Building paths with string `+`.** Slashes differ across OSes. Fix: use `path.join`.',
            '**Assuming subfolders exist.** Writing into a missing folder throws. Fix: `fs.mkdirSync(..., { recursive: true })`.',
            '**Scattering files outside userData.** Then backup misses them. Fix: keep all app-owned data under userData.',
          ],
          tryIt:
            'In the main process, after `app.whenReady()`, log `app.getPath(\'userData\')`, then create a `config.json` there with `fs.writeFileSync` and confirm the file appears in that folder.',
          takeaway:
            '`app.getPath(\'userData\')` is your app\'s official, writable, per-user home — keep all app-owned config, logs and exports there so there is one stable folder to back up and protect.',
        },
        {
          id: 'm2-t15',
          title: 'Initialising the schema on first run',
          explain:
            'When the app starts and the database has no tables yet, it must create them. This first-run initialisation builds the `sevas`, `devotees` and `bookings` tables automatically.',
          analogy:
            'When a new branch of the temple office opens, someone sets up the blank registers before any devotee arrives. First-run initialisation is the app quietly setting up those registers the very first time it is opened, so staff can start booking sevas immediately.',
          theory:
            'A fresh install has an empty database. Rather than asking staff to run SQL by hand, the app **initialises the schema on first run**: at startup it checks whether the expected tables exist and, if not, creates them. After that, every later start finds the tables already there and does nothing.\n\nThe simplest safe check is to run `CREATE TABLE IF NOT EXISTS` statements at startup — they create the tables the first time and harmlessly do nothing afterwards. You run these from the main process using your `query()` wrapper, before the UI starts asking for data.\n\nThis must be **idempotent** — running it any number of times leaves the database in the same correct state. We will build on this in the next topic with a proper migrations system, but even the basic `IF NOT EXISTS` startup step removes the manual setup burden and guarantees the app is ready to record sevas the moment it opens.',
          whyItMatters:
            'Temple counter staff are not database administrators. First-run initialisation means they install the app, open it, and immediately start booking Rangapooje — no SQL, no setup steps. It is the difference between a usable product and a developer toy.',
          steps: [
            'At startup (after the pool is ready), run the schema setup before showing data.',
            'Use `CREATE TABLE IF NOT EXISTS` for each table so it is safe to repeat.',
            'Run the statements through the main-process `query()` wrapper.',
            'Order tables so referenced ones (devotees, sevas) come before bookings.',
            'Log whether tables were created or already present.',
            'Only then open the main window / serve data to the UI.',
          ],
          code:
            "// init-schema.js (main process)\n" +
            "const { query } = require('./db');\n" +
            '\n' +
            'async function initSchema() {\n' +
            '  await query(`\n' +
            '    CREATE TABLE IF NOT EXISTS sevas (\n' +
            '      id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n' +
            '      name text NOT NULL,\n' +
            '      price numeric(10,2) NOT NULL DEFAULT 0,\n' +
            '      is_active boolean NOT NULL DEFAULT true,\n' +
            '      created_at timestamptz NOT NULL DEFAULT now()\n' +
            '    );\n' +
            '  `);\n' +
            "  console.log('schema ready');\n" +
            '}\n' +
            '\n' +
            'module.exports = { initSchema };',
          pitfalls: [
            '**Plain CREATE TABLE without IF NOT EXISTS.** It crashes on the second run. Fix: use `IF NOT EXISTS`.',
            '**Serving the UI before init finishes.** The first screen queries missing tables. Fix: `await initSchema()` before opening the window.',
            '**Wrong table order with foreign keys.** Creating `bookings` before `devotees` fails. Fix: create referenced tables first.',
            '**Asking users to run SQL.** Staff cannot do that. Fix: initialise automatically in code.',
            '**Mixing schema changes into business code.** Hard to track. Fix: keep init/migrations in their own module.',
            '**No logging.** You cannot tell if setup ran. Fix: log "created" vs "already present".',
          ],
          tryIt:
            'Write `initSchema()` that creates the `sevas` table with `IF NOT EXISTS`, call it at startup, run the app twice, and confirm the second run logs "schema ready" without error.',
          takeaway:
            'On first run the app creates its own tables with idempotent `CREATE TABLE IF NOT EXISTS`, run from main before the UI starts — so staff never touch SQL and the app is ready to book sevas immediately.',
        },
        {
          id: 'm2-t16',
          title: 'Idempotent migrations — schema_migrations and ordered .sql files',
          explain:
            'As the app evolves, the schema changes. **Migrations** are ordered `.sql` files applied once each; a `schema_migrations` table remembers which have run, so every machine ends up identical and re-running is safe.',
          analogy:
            'The temple keeps a logbook of building works: "1. dug well, 2. built shed, 3. added roof." Before starting any job the manager checks the logbook to avoid doing the same work twice. `schema_migrations` is that logbook for your database — it records each change so it is applied exactly once.',
          theory:
            '`CREATE TABLE IF NOT EXISTS` handles the first tables, but real apps need to *add a column*, *create a new table*, or *change a default* over time. Doing that reliably across installs needs **migrations**: numbered `.sql` files like `001_init.sql`, `002_add_bookings.sql`, applied in order.\n\nTo apply each migration exactly once, you keep a `schema_migrations` table listing the names of migrations already run. On startup the app: (1) ensures `schema_migrations` exists, (2) reads the list of `.sql` files in order, (3) skips any whose name is already recorded, (4) runs the rest and records each name. This is **idempotent** — running it again applies nothing new.\n\nWrap each migration in a transaction so a half-applied file rolls back cleanly. The result: a brand-new install and a year-old install both reach the same schema by replaying the same ordered files, and the app upgrades its own database with no manual steps.',
          whyItMatters:
            'Maranakatte Seva will grow — maybe a `donations` table, or a `nakshatra` column added later. Migrations let you ship an update that upgrades each temple\'s local database safely and automatically, with no risk of applying a change twice or leaving two machines out of sync.',
          steps: [
            'Create a `schema_migrations(name text primary key, run_at timestamptz default now())` table if missing.',
            'Keep migrations as ordered files: `001_init.sql`, `002_...sql` in a folder.',
            'On startup, read the filenames sorted ascending.',
            'For each file not already in `schema_migrations`, run it inside a transaction.',
            'Record the filename in `schema_migrations` after it succeeds.',
            'Log applied vs skipped; never edit a migration that has already run — add a new one.',
          ],
          code:
            "// migrate.js (main process)\n" +
            "const fs = require('fs');\n" +
            "const path = require('path');\n" +
            "const { pool } = require('./db');\n" +
            '\n' +
            'async function migrate(dir) {\n' +
            '  const client = await pool.connect();\n' +
            '  try {\n' +
            '    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (\n' +
            '      name text PRIMARY KEY, run_at timestamptz NOT NULL DEFAULT now())`);\n' +
            "    const done = (await client.query('SELECT name FROM schema_migrations')).rows.map(r => r.name);\n" +
            "    const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();\n" +
            '    for (const file of files) {\n' +
            '      if (done.includes(file)) continue;\n' +
            "      const sql = fs.readFileSync(path.join(dir, file), 'utf8');\n" +
            "      await client.query('BEGIN');\n" +
            '      await client.query(sql);\n' +
            "      await client.query('INSERT INTO schema_migrations(name) VALUES ($1)', [file]);\n" +
            "      await client.query('COMMIT');\n" +
            "      console.log('applied', file);\n" +
            '    }\n' +
            '  } finally {\n' +
            '    client.release();\n' +
            '  }\n' +
            '}\n' +
            'module.exports = { migrate };',
          pitfalls: [
            '**Editing an already-applied migration.** Other machines already ran the old version, so they diverge. Fix: never change a run migration — add a new file.',
            '**No transaction per migration.** A failure mid-file leaves a half-built schema. Fix: wrap each in BEGIN/COMMIT and ROLLBACK on error.',
            '**Unsorted file order.** Filesystem order is not guaranteed. Fix: `.sort()` the filenames and use zero-padded numbers (`001`).',
            '**Forgetting to record the name.** The migration re-runs forever. Fix: `INSERT` into `schema_migrations` after success.',
            '**Not releasing the client.** A leaked client starves the pool. Fix: `client.release()` in a `finally`.',
            '**Running migrations from the renderer.** Schema work is privileged. Fix: run migrations in the main process only.',
          ],
          tryIt:
            'Create `001_init.sql` (the `sevas` table) and `002_bookings.sql` (the `bookings` table). Run `migrate()`, confirm both are applied and logged, then run it again and confirm both are skipped.',
          takeaway:
            'Migrations are ordered `.sql` files tracked in a `schema_migrations` table and run once each inside transactions — giving every install the same schema, safe re-runs, and automatic, no-touch database upgrades.',
        },
        {
          id: 'm2-t17',
          title: 'Requiring local Postgres — and the alternatives (embedded PG, SQLite)',
          explain:
            'This app needs PostgreSQL running locally. You should detect whether it is available and fail clearly if not. There are alternatives — bundling an embedded Postgres or using SQLite — each with trade-offs.',
          analogy:
            'The temple kitchen needs a working gas connection before it can cook Annadhana. If the gas is off, you do not pretend to cook — you tell the cook clearly "no gas, fix it first." Detecting Postgres is checking the gas line before service: confirm it is there, or say plainly what is missing.',
          theory:
            'Maranakatte Seva connects to a local PostgreSQL server. On a fresh machine that server might not be installed or running, so on startup the app should **try a test connection** and, if it fails, show a clear message ("PostgreSQL not found — please install/start it") rather than a cryptic crash. A simple `SELECT 1` through the pool, wrapped in `try/catch`, is enough to detect this.\n\nThere are **alternatives** to "require a separate Postgres install":\n\n- **Bundle an embedded PostgreSQL** with the app, so users install nothing extra. This is convenient for staff but makes the installer larger and more complex to package per OS.\n- **Use SQLite** instead — a single-file database with no server at all, very easy to embed. But it lacks some of Postgres\'s power (concurrent writes, rich types, `numeric` semantics differ) that this temple app relies on.\n\nFor this course we deliberately use **local PostgreSQL**: it gives proper `numeric` money handling, robust concurrent access for the evening rush, and matches real-world server skills. We simply require it to be present and detect it gracefully.',
          whyItMatters:
            'If a counter machine lacks Postgres, the app should say so plainly so someone can fix it in minutes, not leave staff staring at a frozen screen during the Rangapooje rush. And understanding the alternatives lets you justify the local-Postgres choice — and know what you would change if requirements shifted.',
          steps: [
            'On startup, run a lightweight `SELECT 1` test query in a `try/catch`.',
            'On success, proceed to migrations and open the UI.',
            'On failure, show a clear dialog: Postgres missing or not started.',
            'Document the required Postgres version and how to install/start it.',
            'Know the alternatives: embedded Postgres (bigger installer) or SQLite (simpler, fewer features).',
            'Record the decision: this course requires local PostgreSQL on purpose.',
          ],
          code:
            "// detect-db.js (main process)\n" +
            "const { pool } = require('./db');\n" +
            '\n' +
            'async function isPostgresAvailable() {\n' +
            '  try {\n' +
            "    await pool.query('SELECT 1');\n" +
            '    return true;\n' +
            '  } catch (err) {\n' +
            "    console.error('PostgreSQL not reachable:', err.code || err.message);\n" +
            '    return false;\n' +
            '  }\n' +
            '}\n' +
            '\n' +
            '// at startup:\n' +
            '//   if (!(await isPostgresAvailable())) showDialog(\n' +
            "//     'PostgreSQL was not found. Please install and start it, then reopen.');",
          pitfalls: [
            '**Assuming Postgres is always running.** A fresh machine may not have it. Fix: detect with a test query and message clearly.',
            '**Cryptic crash on connection failure.** Staff cannot act on a stack trace. Fix: catch the error and show plain guidance.',
            '**Choosing SQLite without weighing money handling.** Its numeric/concurrency model differs. Fix: pick SQLite only if those trade-offs are acceptable — here they are not.',
            '**Bundling embedded Postgres blindly.** It bloats and complicates the installer per OS. Fix: weigh installer size vs convenience before committing.',
            '**No version pinning.** Different Postgres versions can behave differently. Fix: document and check the required major version.',
            '**Blocking the UI thread on detection.** A slow check freezes startup. Fix: keep the test query lightweight and async.',
          ],
          tryIt:
            'Write `isPostgresAvailable()` that runs `SELECT 1` in a try/catch and returns a boolean. Stop your local Postgres service and confirm it returns false with a clear logged reason; start it again and confirm true.',
          takeaway:
            'The app requires local PostgreSQL, detects it with a simple `SELECT 1`, and fails with a clear message if absent. Embedded Postgres and SQLite are alternatives with real trade-offs — but local Postgres is the deliberate choice for exact ₹ and the evening rush.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm2-p1',
      type: 'Mini Project',
      title: 'Schema bootstrap',
      domain: 'Temple seva records (Maranakatte Seva)',
      duration: '3-4 hours',
      description:
        'Build a main-process module that, on the app\'s first run, connects to the local PostgreSQL database, creates a `schema_migrations` tracking table, and applies an initial migration that creates the `sevas` table. It must be idempotent — running it again applies nothing and never errors.',
      tools: ['Electron (main process)', 'Node.js', 'node-postgres (pg)', 'PostgreSQL (local)', 'SQL'],
      blueprint: {
        overview:
          'You will create a tiny migration runner that turns a blank local database into a ready-to-use one with no manual SQL. It tracks applied migrations in a `schema_migrations` table and applies ordered `.sql` files exactly once, each inside a transaction, so the temple\'s app sets itself up safely the first time it opens and stays safe on every later start.',
        functionalRequirements: [
          'On startup, ensure a `schema_migrations(name, run_at)` table exists.',
          'Read ordered migration files (e.g. `001_init.sql` creating `sevas`) from a folder.',
          'Apply only files whose name is not already recorded, each in a transaction.',
          'Record each applied filename in `schema_migrations` after it succeeds.',
          'Re-running the whole process applies nothing new and produces no errors (idempotent).',
        ],
        technicalImplementation: [
          'Use the main-process `pool` from your `db.js`; obtain a client with `pool.connect()` for transactions.',
          'Create `schema_migrations` with `CREATE TABLE IF NOT EXISTS`.',
          'Read `.sql` filenames with `fs.readdirSync`, filter `.endsWith(\'.sql\')`, and `.sort()` for order.',
          'For each new file: `BEGIN`, run the file\'s SQL, `INSERT` the name, `COMMIT`; `ROLLBACK` and rethrow on error.',
          'Call the runner at startup (after `app.whenReady()` and before opening the window); `client.release()` in a `finally`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Tracking table + file discovery',
            outcome: 'A runner that ensures `schema_migrations` exists and lists pending migration files in order.',
            prompt:
              'In an Electron main-process module using node-postgres, write an async function `migrate(dir)` that: obtains a client from an existing `pool`; runs `CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, run_at timestamptz NOT NULL DEFAULT now())`; selects existing names into an array; reads `.sql` files from `dir` with `fs.readdirSync`, filters to those ending in `.sql`, sorts them ascending, and computes which are not yet applied. Use single-quoted strings and concatenation. Log the pending file list.',
          },
          {
            step: 2,
            label: 'Apply each migration in a transaction',
            outcome: 'Pending `.sql` files are applied exactly once, transactionally, and recorded.',
            prompt:
              'Extend `migrate(dir)`: for each pending file in order, read its SQL with `fs.readFileSync(path, \'utf8\')`, then run `BEGIN`, the file SQL, an INSERT of the filename into `schema_migrations` using a `$1` parameter, and `COMMIT`. On any error, `ROLLBACK` and rethrow so a half-applied file leaves no partial schema. Release the client in a `finally`. Provide an example `001_init.sql` that creates a `sevas` table (`id` identity primary key, `name text not null`, `price numeric(10,2) not null default 0`, `is_active boolean not null default true`, `created_at timestamptz not null default now()`).',
          },
          {
            step: 3,
            label: 'Wire into first-run startup and prove idempotency',
            outcome: 'The app runs migrations automatically at startup and is safe to start repeatedly.',
            prompt:
              'Show how to call `migrate(migrationsDir)` from the Electron main process after `app.whenReady()` and before creating the BrowserWindow, logging "applied" vs "already up to date". Then describe a test: run the app twice and confirm the second run applies nothing and the `sevas` and `schema_migrations` tables are intact. Note that `migrate` must run in the main process only, never the renderer.',
          },
        ],
      },
    },
    {
      id: 'm2-p2',
      type: 'Project',
      title: 'pg query module (db.js)',
      domain: 'Temple seva records (Maranakatte Seva)',
      duration: '4-5 hours',
      description:
        'Build a reusable `db.js` for the Electron main process that owns a single PostgreSQL `Pool` and exposes `query(text, params)` for simple statements and `getClient()` for multi-step work. Use it to insert and select sample sevas with fully parameterized queries.',
      tools: ['Electron (main process)', 'Node.js', 'node-postgres (pg)', 'PostgreSQL (local)', 'dotenv'],
      blueprint: {
        overview:
          'You will create the single, central door through which the whole app reaches PostgreSQL. `db.js` holds one `Pool`, exposes a clean `query(text, params)` and a `getClient()` for transactions, and lives only in the main process. You will then exercise it by inserting and listing sample sevas using parameterized queries — the foundation every later feature (bookings, devotees, reports) builds on.',
        functionalRequirements: [
          'Expose `query(text, params)` that runs a statement on the shared pool and returns the result.',
          'Expose `getClient()` for callers that need a dedicated connection (transactions).',
          'Insert sample sevas (Mangalarathi, Hannikaayi, Rangapooje) using `$1`/`$2` parameters.',
          'Select sevas back and return clean row objects (`id`, `name`, `price`).',
          'Keep all `pg` usage in the main process; read connection config from env, not hard-coded.',
        ],
        technicalImplementation: [
          'Create one `new Pool(config)` at module load, where `config` is built from `process.env.PG*` with local defaults.',
          'Export `async query(text, params)` forwarding to `pool.query`, with timing/rowCount logging (not raw params).',
          'Export `getClient()` returning `pool.connect()`, documenting that callers must `release()`.',
          'Write inserts/selects with `$1, $2` placeholders and a values array — never string concatenation.',
          'Export `pool` too, so a quit handler can call `pool.end()`; ensure nothing under the renderer imports this file.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Pool + query + getClient',
            outcome: 'A `db.js` exporting `query`, `getClient`, and `pool` over a single configured Pool.',
            prompt:
              'Write an Electron main-process `db.js` using node-postgres. Build a `config` object from `process.env.PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD` with local defaults (`localhost`, `5432`, `maranakatte`, `postgres`). Create one `new Pool(config)`. Export `async function query(text, params)` that calls `pool.query` and logs `{ ms, rows: result.rowCount }` (never the raw params). Export `async function getClient()` returning `pool.connect()`, with a comment that callers must call `client.release()`. Also export `pool`. Use single-quoted strings and concatenation.',
          },
          {
            step: 2,
            label: 'Parameterized inserts of sample sevas',
            outcome: 'Sample sevas are inserted safely with parameters and their new ids returned.',
            prompt:
              'Using the `query(text, params)` from `db.js`, write an async function `seedSevas()` that inserts three sevas — Mangalarathi (20.00), Hannikaayi (50.00), Rangapooje (100.00) — into the `sevas` table. Use an `INSERT INTO sevas (name, price) VALUES ($1, $2) RETURNING id` statement called once per seva with a values array, and collect the returned ids. Explain why `$1, $2` parameters are used instead of building the SQL string from the values (SQL injection and apostrophe safety).',
          },
          {
            step: 3,
            label: 'Parameterized selects + transaction with getClient',
            outcome: 'Sevas are listed via parameterized selects, and a multi-step write uses a transaction.',
            prompt:
              'Add to the module: (a) `listActiveSevas()` running `SELECT id, name, price FROM sevas WHERE is_active = $1 ORDER BY id` with params `[true]`, returning `rows`; and (b) `addSevaWithLog(name, price)` that uses `getClient()` to run a transaction — `BEGIN`, an `INSERT ... RETURNING id`, a second insert into an `audit_log` table, then `COMMIT` (with `ROLLBACK` on error and `release()` in `finally`). Show example calls and logged output, and note that this whole module must be imported only from main-process code.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm2-q1',
      q: 'Why must the rupee `amount` column in the bookings table be `numeric(10,2)` rather than a float type?',
      options: [
        'Floats are slower to insert than numeric in Postgres',
        'Floating-point cannot represent decimal money exactly, so ₹ totals drift; numeric is exact',
        'numeric uses less disk space than float',
        'Postgres forbids floats in tables that store currency',
      ],
      answer: 1,
    },
    {
      id: 'm2-q2',
      q: 'In a desktop app like Maranakatte Seva, why use a `Pool` from node-postgres instead of a single `Client`?',
      options: [
        'A Pool encrypts the connection while a Client does not',
        'A Client cannot run SELECT statements',
        'A Pool reuses a small set of connections for bursts (the evening Rangapooje rush) without reconnecting each time',
        'A Pool is required to connect to a local database',
      ],
      answer: 2,
    },
    {
      id: 'm2-q3',
      q: 'Where must all `pg` database code live in this Electron app, and why?',
      options: [
        'In the renderer, so React can query the database directly for speed',
        'In the preload script, because it has full Node access by default',
        'In the main process, so credentials never ship in the front-end and the sandboxed renderer talks to it via IPC',
        'In a separate cloud server, since Electron cannot run pg locally',
      ],
      answer: 2,
    },
    {
      id: 'm2-q4',
      q: 'Which query correctly inserts a devotee while protecting against SQL injection?',
      options: [
        "pool.query('INSERT INTO devotees (name) VALUES (' + name + ')')",
        'pool.query(`INSERT INTO devotees (name) VALUES (${name})`)',
        "pool.query('INSERT INTO devotees (name) VALUES ($1)', [name])",
        "pool.query('INSERT INTO devotees (name) VALUES (?)', name)",
      ],
      answer: 2,
    },
    {
      id: 'm2-q5',
      q: 'What is the purpose of the `schema_migrations` table in the migration runner?',
      options: [
        'It stores a backup copy of every other table',
        'It records which migration files have already been applied, so each runs exactly once and re-running is safe',
        'It holds the database connection string for the renderer',
        'It caches query results to make the app faster',
      ],
      answer: 1,
    },
    {
      id: 'm2-q6',
      q: 'Where should Maranakatte Seva store its app-owned config and files, and what does that enable?',
      options: [
        'Next to the app executable, so they are deleted on every update',
        'In the Postgres install directory, so Postgres backs them up',
        "Under `app.getPath('userData')`, giving one stable, per-user, writable folder to back up",
        'In a cloud bucket, since local folders are not writable',
      ],
      answer: 2,
    },
  ],
};
