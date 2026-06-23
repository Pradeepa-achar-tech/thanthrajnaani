// Module 3 — Data Model & Schema for Temple Sevas
// Designs the PostgreSQL schema for Maranakatte Seva: sevas, devotees, receipts, receipt_items, bookings.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m3 = {
  id: 'm3',
  title: 'Data Model & Schema for Temple Sevas',
  hours: 8,
  color: 'from-cyan-500/20 to-cyan-700/10',
  accent: 'cyan',
  description:
    'Design the real database for Maranakatte Seva: model the temple entities (sevas, devotees, receipts, items, bookings), write CREATE TABLE statements with the right Postgres types, foreign keys and CHECK constraints, number tokens that reset each day, index for the Rangapooje rush, and seed the seva catalog idempotently.',
  sections: [
    {
      id: 'm3-s1',
      title: 'Modeling the temple domain',
      topics: [
        {
          id: 'm3-t1',
          title: 'Finding the entities: nouns of the counter',
          explain:
            'Before writing any table, list the real things the counter deals with every day. Each noun usually becomes a table.',
          analogy:
            'Stand behind the seva counter at Maranakatte for one evening and just listen. People ask for a **seva**, you write their **name and gotra**, you hand them a printed **receipt** with a **token number**, and that receipt has one or more **line items** on it. Some people **book** Yakshagana or Annadhana for a future date. Those bold words — seva, devotee, receipt, item, booking — are your tables. The data model is just the counter, written down.',
          theory:
            'Data modeling starts with **entities** — the important nouns in your problem. For Maranakatte Seva the entities are: **sevas** (the catalog of what can be offered), **devotees** (the people), **receipts** (one printed ticket / one transaction), **receipt_items** (each seva line on that ticket), and **bookings** (Yakshagana and Annadhana reserved for a date).\n\nEntities have **relationships**. A receipt **has many** receipt_items (one ticket, several sevas). Each receipt_item **belongs to one** seva from the catalog. This "one-to-many" shape is the backbone of almost every business app, and Postgres models it with a **foreign key** column on the "many" side pointing back to the "one".\n\nA good rule: a table should describe **one kind of thing**. Mixing the seva catalog (rarely changes) with the day-to-day receipts (changes 500+ times an evening) into one table would be a mess. Keep them separate and connect them with keys.',
          whyItMatters:
            'Every screen you build later — the billing counter, the daily report, the booking register — reads and writes these exact tables. If the entities are wrong here, you will fight the database for the rest of the course. Getting the nouns right now is the cheapest fix you will ever make.',
          steps: [
            'Watch (or imagine) one full evening at the seva counter and jot down every noun: seva, name, gotra, receipt, token, booking.',
            'Group the nouns: which are catalogs (sevas), which are people (devotees), which are transactions (receipts, items, bookings).',
            'For each group, decide the columns it needs — start with the obvious ones, refine later.',
            'Draw arrows for relationships: receipt -> many receipt_items; receipt_item -> one seva.',
            'Name tables in plural snake_case (`sevas`, `receipt_items`) to match Postgres convention.',
            'Confirm each table describes exactly one kind of thing before writing SQL.',
          ],
          code:
            '-- The five core entities, as a sketch (full SQL comes later):\n--\n--   sevas          the catalog: what can be offered, and its price\n--   devotees       people: name, gotra, nakshatra, phone\n--   receipts       one printed ticket / one transaction\n--   receipt_items  each seva line on a ticket (links receipt -> seva)\n--   bookings       Yakshagana / Annadhana reserved for a future date\n--\n-- Relationships:\n--   receipts 1 ---- many receipt_items\n--   receipt_items many ---- 1 sevas',
          pitfalls: [
            'Cramming everything into one giant table because it "feels simpler" — it makes every query painful later.',
            'Forgetting the receipt_items table and stuffing multiple sevas into one receipt row.',
            'Naming tables inconsistently (`Seva`, `receipts`, `Booking_Table`) — pick plural snake_case and stick to it.',
            'Modeling reports as tables — a daily report is a query over receipts, not a stored entity.',
            'Skipping relationships and planning to "join in code" — let the database hold the links.',
            'Adding speculative tables for features no one asked for; model what the counter actually does.',
          ],
          tryIt:
            'On paper, list every column you think a receipt needs. Then list a receipt_item. Notice that name/gotra could live on either — that trade-off is the next topic.',
          takeaway:
            'The nouns of the counter are your tables: sevas, devotees, receipts, receipt_items, bookings — connected by one-to-many relationships.',
        },
        {
          id: 'm3-t2',
          title: 'The sevas catalog table',
          explain:
            'The sevas table is the price list — a small, rarely-changing catalog every receipt line points to.',
          analogy:
            'Think of the laminated board hanging at the counter: Rangapooje, Mangalarathi, Hannikaayi, each with a price in rupees. The `sevas` table is that board turned into rows. Staff never type seva names by hand during the rush — they pick from this board, so the spelling and price are always right.',
          theory:
            'The catalog needs: an **`id`** (the primary key, `serial` or `bigserial` so Postgres auto-numbers it), a **`name`** in English, a **`kannada_name`** so the receipt can print in the local script, a **`category`** that is either `\'daily\'` (walk-up sevas like Rangapooje) or `\'booking\'` (Yakshagana, Annadhana), a **`price`** as `numeric`, and an **`active`** boolean so a discontinued seva is hidden without deleting its history.\n\n**Why `numeric` for money?** `float`/`real` store approximations — ₹50.10 might become 50.0999999. `numeric` (also called `decimal`) stores exact decimal values, so totals always add up to the paisa. Use `numeric(10,2)`: up to 10 digits, 2 after the point.\n\nThe **`active`** flag matters because you never hard-delete a seva that appears on old receipts. Old tickets must still resolve their seva name. Set `active = false` instead, and the counter UI simply stops showing it.',
          whyItMatters:
            'This one small table is the source of truth for prices. Because receipt_items reference a seva by id, a price change here is reflected everywhere new receipts are made, while old receipts keep the amount they were charged. The Kannada name lets the printed receipt honour the temple and town. The active flag prevents the classic "I deleted a seva and now old reports crash" disaster.',
          steps: [
            'Create the table with a `serial` primary key named `id`.',
            'Add `name text NOT NULL` and `kannada_name text` columns.',
            'Add `category text` constrained to `\'daily\'` or `\'booking\'` (CHECK constraint — covered in s3).',
            'Add `price numeric(10,2) NOT NULL` for exact rupee amounts.',
            'Add `active boolean NOT NULL DEFAULT true`.',
            'Decide that sevas are deactivated, never deleted, to protect receipt history.',
          ],
          code:
            "CREATE TABLE sevas (\n  id           serial PRIMARY KEY,\n  name         text NOT NULL,\n  kannada_name text,\n  category     text NOT NULL DEFAULT 'daily',\n  price        numeric(10,2) NOT NULL DEFAULT 0,\n  active       boolean NOT NULL DEFAULT true\n);\n\n-- Example rows the temple would have:\n--   ('Rangapooje',  'ರಂಗಪೂಜೆ',  'daily',   60.00, true)\n--   ('Mangalarathi','ಮಂಗಳಾರತಿ', 'daily',   25.00, true)\n--   ('Annadhana',   'ಅನ್ನದಾನ',  'booking', 5000.00, true)",
          pitfalls: [
            'Using `float`/`real` for price — money must be `numeric` so totals are exact.',
            'Hard-deleting a seva that old receipts reference, breaking historical reports.',
            'Forgetting `kannada_name`, so the printed receipt cannot show the local script.',
            'Leaving `category` free-form text, allowing typos like `\'Daily\'` vs `\'daily\'`.',
            'No default on `active`, so new rows arrive as NULL and silently vanish from the counter.',
            'Storing price as integer paise everywhere and forgetting to divide — `numeric(10,2)` is clearer.',
          ],
          tryIt:
            'Insert Rangapooje at ₹60 and run `SELECT name, price FROM sevas WHERE active = true;`. Then set it to ₹70 and confirm only the catalog changed, not any receipts.',
          takeaway:
            'sevas is a small, exact-money catalog with a Kannada name and an active flag — receipts point to it, so deactivate, never delete.',
        },
        {
          id: 'm3-t3',
          title: 'The devotees table: name, gotra, nakshatra, phone',
          explain:
            'Devotees are the people offering sevas. Capture name, gotra, nakshatra and phone — the details the priest needs.',
          analogy:
            'When a priest does a Rangapooje, he calls out your **name**, **gotra** and **nakshatra** so the offering is made in your name. The counter must capture exactly those words. The `devotees` table is the register where those details live.',
          theory:
            'A devotee record holds **`name`**, **`gotra`** (the lineage), **`nakshatra`** (birth star), and **`phone`**. Name is required; gotra, nakshatra and phone can be blank because not everyone offers them. All are plain `text` — phone stays `text`, never a number, because of leading zeros, `+91`, and spaces.\n\nThe interesting decision is **whether to store the devotee as a reusable record or per-receipt**. A reusable `devotees` table lets a regular family be looked up and reused, building history. But a temple counter during the Rangapooje rush serves hundreds of one-time walk-ups; forcing staff to search-or-create a devotee for every ticket would be far too slow.\n\nThis course uses a **pragmatic hybrid**: a `devotees` table exists for the few cases where a reusable record helps (e.g. a recurring sponsor), but the **devotee name/gotra/nakshatra are also copied directly onto each `receipt_item`**. That de-normalization is deliberate — the next section explains why a frozen copy on the ticket is the right call for a fast counter.',
          whyItMatters:
            'Get this wrong and either the priest lacks the gotra/nakshatra he needs, or the counter grinds to a halt forcing a lookup per devotee. The hybrid keeps the common case (walk-up Rangapooje) fast while still allowing a reusable record when it genuinely helps. Storing phone as text avoids the bug where `09886...` loses its leading zero.',
          steps: [
            'Create `devotees` with a `serial` primary key.',
            'Add `name text NOT NULL`, the one required field.',
            'Add `gotra text`, `nakshatra text`, `phone text` — all nullable.',
            'Keep phone as `text` to preserve `+91`, spaces and leading zeros.',
            'Decide the hybrid: reusable `devotees` row optional; name/gotra/nakshatra also copied onto receipt_items.',
            'Plan a phone index later only if devotee lookup becomes common.',
          ],
          code:
            'CREATE TABLE devotees (\n  id        serial PRIMARY KEY,\n  name      text NOT NULL,\n  gotra     text,\n  nakshatra text,\n  phone     text\n);\n\n-- Note: receipt_items will ALSO carry devotee_name, gotra, nakshatra\n-- as a frozen copy, so the counter rarely needs to touch this table\n-- during the Rangapooje rush. See section m3-s2.',
          pitfalls: [
            'Storing phone as an integer — leading zeros and `+91` are lost.',
            'Making gotra/nakshatra NOT NULL — many walk-up devotees do not give them.',
            'Forcing a devotee lookup-or-create on every single ticket, killing counter speed.',
            'Splitting name into first/last — Indian names do not fit that mold; keep one `name`.',
            'Assuming one phone equals one devotee — families share numbers.',
            'Over-normalizing gotra/nakshatra into lookup tables for a small offline app — not worth it.',
          ],
          tryIt:
            "Insert a devotee with phone '09886012345' and SELECT it back. Confirm the leading zero survived. Now imagine doing a lookup per ticket during 500 Rangapoojes — that is why the next section copies details onto the item.",
          takeaway:
            'devotees holds name (required), gotra, nakshatra and phone (all text); a reusable record is optional because the counter copies the details onto each receipt for speed.',
        },
      ],
    },
    {
      id: 'm3-s2',
      title: 'Tickets & receipts',
      topics: [
        {
          id: 'm3-t4',
          title: 'The receipts table: one ticket, one row',
          explain:
            'A receipt is one printed ticket — one transaction. It carries the token, date, total, payment mode and a timestamp.',
          analogy:
            'Every devotee leaves the counter with a small printed slip: a token number for the day, the total in rupees, and whether they paid cash or by UPI. The `receipts` table is the carbon-copy book of those slips — one row per slip handed out.',
          theory:
            'The **`receipts`** table holds: **`id`** (primary key), **`token_no`** (the per-day serial the devotee sees, resets each morning — covered in t6), **`receipt_date`** (a `date`, which day this belongs to), **`total`** (`numeric(10,2)`, the sum of its items), **`payment_mode`** (`\'cash\'` or `\'upi\'`), and **`created_at`** (`timestamptz`, the exact moment of sale).\n\nNote the difference between **`receipt_date date`** and **`created_at timestamptz`**. `receipt_date` is the *business day* — what the daily report groups by. `created_at` is the precise instant with time zone, useful for ordering within a day and auditing. Keeping both is cheap and saves grief; never try to derive the business day from a raw timestamp at report time when a coastal evening can spill past midnight.\n\n**`payment_mode`** is constrained to `\'cash\'` or `\'upi\'` (a CHECK constraint, shown in s3). The **`total`** is stored on the receipt even though it equals the sum of items — a denormalized convenience so the daily report does not re-sum thousands of items every time.',
          whyItMatters:
            'This is the heart of the app: 500+ Rangapooje receipts an evening all land here. `receipt_date` makes the daily collection report a one-line GROUP BY. `payment_mode` lets the temple reconcile cash drawer vs UPI. `created_at` as `timestamptz` keeps ordering correct. The stored `total` keeps reports fast even with tens of thousands of rows.',
          steps: [
            'Create `receipts` with a `serial` primary key `id`.',
            'Add `token_no integer NOT NULL` — the per-day number devotees see.',
            'Add `receipt_date date NOT NULL DEFAULT CURRENT_DATE` for the business day.',
            'Add `total numeric(10,2) NOT NULL DEFAULT 0`.',
            "Add `payment_mode text NOT NULL DEFAULT 'cash'` (CHECK constraint in s3).",
            'Add `created_at timestamptz NOT NULL DEFAULT now()` for the exact instant.',
          ],
          code:
            "CREATE TABLE receipts (\n  id           serial PRIMARY KEY,\n  token_no     integer NOT NULL,\n  receipt_date date NOT NULL DEFAULT CURRENT_DATE,\n  total        numeric(10,2) NOT NULL DEFAULT 0,\n  payment_mode text NOT NULL DEFAULT 'cash',\n  created_at   timestamptz NOT NULL DEFAULT now()\n);",
          pitfalls: [
            'Using `timestamp` (no zone) instead of `timestamptz` — ordering and DST get confusing.',
            'Storing only `created_at` and deriving the business day at report time — late-evening sales cross midnight.',
            'Forgetting the stored `total`, forcing every report to re-sum all items.',
            'Putting seva details on the receipt instead of in receipt_items — a ticket can have several sevas.',
            'Leaving `payment_mode` unconstrained, so `\'Cash\'`, `\'CASH\'` and `\'card\'` all sneak in.',
            'Letting `token_no` be globally unique forever instead of per-day (see t6).',
          ],
          tryIt:
            "Insert a receipt with total 60 and payment_mode 'upi', then SELECT receipt_date, created_at to see the date vs the full timestamp.",
          takeaway:
            'receipts is one row per ticket with a per-day token, a business `receipt_date`, an exact `created_at timestamptz`, a stored total, and cash/upi mode.',
        },
        {
          id: 'm3-t5',
          title: 'The receipt_items table & frozen devotee details',
          explain:
            'Each seva on a ticket is one receipt_item row. It links to the receipt and seva, and freezes the devotee details.',
          analogy:
            'A single slip might list two lines: "Rangapooje for Ramesh, Kashyapa gotra" and "Mangalarathi for the same family". Each printed line is one `receipt_items` row. The name and gotra are written onto the line and never change afterwards — like ink on the slip — even if the devotee record is later edited.',
          theory:
            'The **`receipt_items`** table holds: **`id`**, **`receipt_id`** (a foreign key to `receipts`), **`seva_id`** (a foreign key to `sevas`), the **frozen devotee copy** `devotee_name` / `gotra` / `nakshatra`, a **`qty`** (how many of this seva), and **`amount`** (`numeric`, what was actually charged for this line).\n\n**Why copy the devotee details here instead of only referencing the devotees table?** Two reasons. First, **speed**: the counter does not have to find-or-create a devotee row for every walk-up; it just types the name onto the item. Second, **history is frozen**: the receipt must forever show the name/gotra as printed. If you only referenced a devotees row and someone later edited it, old receipts would silently change. A printed receipt is a legal-ish record; its words must not move.\n\nSimilarly, **`amount`** is stored on the item rather than always read from `sevas.price`, because the seva price may change next month. The item must remember what was charged that evening. This deliberate **de-normalization** trades a little duplication for correctness and counter speed — exactly the right trade for this app.',
          whyItMatters:
            'This table is where the Rangapooje rush is recorded — potentially thousands of rows a day. Freezing the devotee details makes the counter fast (no lookup per ticket) and keeps printed receipts truthful forever. Storing `amount` per line protects against price changes rewriting history. The two foreign keys keep every item tied to a real receipt and a real seva.',
          steps: [
            'Create `receipt_items` with a `serial` primary key.',
            'Add `receipt_id integer NOT NULL REFERENCES receipts(id) ON DELETE CASCADE`.',
            'Add `seva_id integer NOT NULL REFERENCES sevas(id)`.',
            'Add frozen `devotee_name text NOT NULL`, `gotra text`, `nakshatra text`.',
            'Add `qty integer NOT NULL DEFAULT 1` and `amount numeric(10,2) NOT NULL`.',
            'Decide amount is the charged value, captured at sale time, not re-read from sevas later.',
          ],
          code:
            "CREATE TABLE receipt_items (\n  id           serial PRIMARY KEY,\n  receipt_id   integer NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,\n  seva_id      integer NOT NULL REFERENCES sevas(id),\n  devotee_name text NOT NULL,\n  gotra        text,\n  nakshatra    text,\n  qty          integer NOT NULL DEFAULT 1,\n  amount       numeric(10,2) NOT NULL\n);\n\n-- devotee_name/gotra/nakshatra are a FROZEN copy: the printed slip\n-- must never change, even if a devotees row is edited later.",
          pitfalls: [
            'Referencing only `devotees(id)` and skipping the frozen copy — editing a devotee rewrites old receipts.',
            'Re-reading `sevas.price` for old receipts instead of storing `amount` — a price change rewrites history.',
            "No `ON DELETE CASCADE` on receipt_id, so deleting a receipt leaves orphan items.",
            'Putting devotee details on the receipt instead of the item, when each line can be a different devotee.',
            'Forgetting `qty`, so two Mangalarathis need two rows for no reason.',
            'Using `float` for amount — line totals must be exact `numeric`.',
          ],
          tryIt:
            "Insert a receipt, then two receipt_items pointing to it. Run `SELECT sum(amount) FROM receipt_items WHERE receipt_id = 1;` and confirm it matches the receipt total.",
          takeaway:
            'receipt_items is one row per seva line, linked by FKs to receipt and seva, with a frozen devotee copy and a stored amount so printed receipts and prices never silently change.',
        },
        {
          id: 'm3-t6',
          title: 'Daily token numbering that resets each morning',
          explain:
            'Devotees see a token number that starts at 1 each day. Model it per-day and compute the next token for today.',
          analogy:
            'Every morning the counter starts a fresh token pad: token 1, 2, 3... By evening it might reach 600. Tomorrow it starts at 1 again. The database `id` keeps growing forever, but the **token** the devotee sees must reset with the sunrise.',
          theory:
            'There are two different numbers. The **`id`** is the permanent, ever-increasing primary key — never reused. The **`token_no`** is the human-friendly number that resets to 1 each `receipt_date`. Do not confuse them.\n\nTo get the next token for today, ask the database for the **highest token_no on today\'s date and add one**: `SELECT COALESCE(MAX(token_no), 0) + 1 FROM receipts WHERE receipt_date = CURRENT_DATE;`. `COALESCE(..., 0)` handles the first ticket of the morning, when there are no rows yet, returning 1.\n\nFor an offline single-counter app this MAX-plus-one is perfectly safe. To be extra robust you can wrap the read-and-insert in a transaction so two near-simultaneous saves cannot grab the same token. A **unique index on `(receipt_date, token_no)`** is the real guarantee: even if logic slips, the database refuses two receipts with the same token on the same day.',
          whyItMatters:
            'Token numbers are what devotees and staff actually call out — "token 214 ready". They must be clean, gap-free-ish, and restart daily so the pad feels like the old paper one. The `(receipt_date, token_no)` unique index turns a possible duplicate-token bug into a hard database error instead of two devotees holding "token 214".',
          steps: [
            'Keep `id` as the permanent key; treat `token_no` as a separate human number.',
            'Before inserting a receipt, query the next token for `CURRENT_DATE` with MAX + 1.',
            'Use `COALESCE(MAX(token_no), 0) + 1` so the first ticket of the day is 1.',
            'Do the read and the insert inside one transaction for safety.',
            'Add a unique index on `(receipt_date, token_no)` to forbid duplicates.',
            'Confirm tomorrow the query naturally returns 1 again, since it filters by date.',
          ],
          code:
            "-- Next token for today (1 if the pad is fresh):\nSELECT COALESCE(MAX(token_no), 0) + 1 AS next_token\nFROM   receipts\nWHERE  receipt_date = CURRENT_DATE;\n\n-- Hard guarantee: no two receipts share a token on the same day.\nCREATE UNIQUE INDEX ux_receipts_day_token\n  ON receipts (receipt_date, token_no);",
          pitfalls: [
            'Using the auto-increment `id` as the devotee-facing token — it never resets and looks huge.',
            'Computing the next token without filtering `receipt_date = CURRENT_DATE`, so it never restarts.',
            'Forgetting `COALESCE`, so the first ticket of the morning errors on NULL + 1.',
            'Skipping the unique index, allowing two receipts to share token 214 under a race.',
            'Reading the max token long before inserting, widening the race window.',
            'Resetting tokens by deleting yesterday rows — keep history; the date filter handles the reset.',
          ],
          tryIt:
            "On an empty table, run the next-token query (expect 1). Insert a receipt with token 1, run it again (expect 2). Change a row's receipt_date to yesterday and confirm today restarts.",
          takeaway:
            'Keep id permanent and token_no per-day; compute the next token with COALESCE(MAX(token_no),0)+1 for CURRENT_DATE, and enforce it with a unique index on (receipt_date, token_no).',
        },
        {
          id: 'm3-t7',
          title: 'Foreign keys, ON DELETE & indexes for the rush',
          explain:
            'Foreign keys keep the data honest; ON DELETE decides what happens to children; indexes keep lookups fast.',
          analogy:
            'A foreign key is the temple rule that every line on a slip must point to a real seva and a real slip — no floating, parentless lines. ON DELETE CASCADE says: tear up the slip and its lines go with it. An index is the tab-divider in the register so you find "today\'s receipts" instantly instead of flipping every page during the 7 PM Rangapooje crowd.',
          theory:
            'A **foreign key** column (`receipt_id REFERENCES receipts(id)`) tells Postgres the value must match a real row, or the insert is rejected. This is **referential integrity** — the database itself refuses orphan data.\n\n**`ON DELETE`** decides the fate of children when a parent is deleted. **`ON DELETE CASCADE`** (used for `receipt_items.receipt_id`) deletes the items when the receipt is deleted — exactly right, because an item cannot exist without its receipt. For `seva_id` we leave the default **`ON DELETE NO ACTION/RESTRICT`**, which blocks deleting a seva that receipts still use — another reason to deactivate, not delete, a seva.\n\n**Indexes** make reads fast. Postgres indexes primary keys automatically, but not foreign keys or the columns you filter by. The hot queries here filter by `receipt_date` (the daily report) and join on `receipt_id` and `seva_id`. Add indexes on those. An index is a sorted shortcut; during the Rangapooje rush, finding today\'s receipts becomes near-instant instead of a full-table scan.',
          whyItMatters:
            'Without foreign keys, a bug could insert a receipt_item pointing at a deleted receipt, and reports would crash or mislead. Without the right ON DELETE, you either orphan items or accidentally erase a seva\'s history. Without indexes, the daily report and the counter slow to a crawl as the table grows across festival season. These three together keep the app correct and fast.',
          steps: [
            'Declare `receipt_id` and `seva_id` as `REFERENCES` foreign keys.',
            'Use `ON DELETE CASCADE` for `receipt_id` so deleting a receipt removes its items.',
            'Leave seva_id at the default RESTRICT so a referenced seva cannot be deleted.',
            'Create an index on `receipts(receipt_date)` for the daily report.',
            'Create indexes on `receipt_items(receipt_id)` and `receipt_items(seva_id)` for joins.',
            'Re-run a daily report and notice the planner now uses the index, not a full scan.',
          ],
          code:
            "-- Foreign keys already declared on receipt_items (see t5).\n-- Now add the indexes the hot queries need:\n\nCREATE INDEX ix_receipts_date\n  ON receipts (receipt_date);\n\nCREATE INDEX ix_items_receipt\n  ON receipt_items (receipt_id);\n\nCREATE INDEX ix_items_seva\n  ON receipt_items (seva_id);\n\n-- Check the planner uses them:\n-- EXPLAIN SELECT * FROM receipts WHERE receipt_date = CURRENT_DATE;",
          pitfalls: [
            'Assuming foreign keys are indexed automatically — they are not; you must add the index.',
            'Putting CASCADE on seva_id, so deleting a seva wipes the receipt lines that used it.',
            'Indexing every column "just in case" — each index slows inserts during the rush.',
            'No index on receipt_date, so the daily report does a full-table scan as data grows.',
            'Forgetting that a stored procedure/app must still respect FKs — they are enforced at the DB.',
            'Adding FKs after millions of rows exist with bad data already present — add them early.',
          ],
          tryIt:
            'Try inserting a receipt_item with receipt_id = 99999 (no such receipt) and watch Postgres reject it. Then run EXPLAIN on the daily report before and after creating ix_receipts_date.',
          takeaway:
            'Foreign keys forbid orphans, ON DELETE CASCADE ties items to their receipt, RESTRICT protects referenced sevas, and targeted indexes on receipt_date and the FK columns keep the rush fast.',
        },
      ],
    },
    {
      id: 'm3-s3',
      title: 'Bookings & seed data',
      topics: [
        {
          id: 'm3-t8',
          title: 'The bookings table for Yakshagana & Annadhana',
          explain:
            'Bookings reserve Yakshagana or Annadhana for a future date, with a sponsor, an amount, an advance and a status.',
          analogy:
            'Some devotees sponsor the whole evening: a Yakshagana performance, or Annadhana to feed 200 people. They book it weeks ahead, pay an advance, and settle the rest later. The `bookings` table is the temple\'s diary of these future events — who, what, when, how much, and how many meals.',
          theory:
            'A **booking** is different from a walk-up receipt: it is for a **future `booking_date`** and tracked over time. The table holds **`id`**, **`type`** (`\'yakshagana\'` or `\'annadhana\'`), **`booking_date date`**, **`sponsor_name`**, **`gotra`**, **`nakshatra`**, **`amount`** (`numeric`, the full cost), **`advance_paid`** (`numeric`, paid so far), **`status`**, and **`count`** (the number of Annadhana meals; null/ignored for Yakshagana).\n\nThe **`amount`** and **`advance_paid`** are both `numeric(10,2)`; the balance is simply `amount - advance_paid`, computed in a query, not stored. **`booking_date`** is a `date` because a booking is for a whole day, not a precise instant.\n\nThe **`count`** column shows how one table can serve two types: Annadhana needs a meal count, Yakshagana does not. Rather than two tables, a nullable `count` keeps it simple for a small offline app — a pragmatic choice over rigid normalization.',
          whyItMatters:
            'Bookings are the temple\'s high-value, planned income — a single Annadhana can be ₹5000+. Tracking `advance_paid` vs `amount` tells staff exactly who still owes a balance. The `booking_date` powers an "upcoming events" view so the kitchen and Yakshagana troupe are prepared. The `count` lets the kitchen know how many to cook.',
          steps: [
            'Create `bookings` with a `serial` primary key.',
            "Add `type text NOT NULL` (CHECK to 'yakshagana' / 'annadhana', next topic).",
            'Add `booking_date date NOT NULL` for the reserved day.',
            'Add sponsor fields: `sponsor_name text NOT NULL`, `gotra text`, `nakshatra text`.',
            'Add `amount numeric(10,2) NOT NULL` and `advance_paid numeric(10,2) NOT NULL DEFAULT 0`.',
            "Add `status text` (CHECK in next topic) and `count integer` for Annadhana meals.",
          ],
          code:
            "CREATE TABLE bookings (\n  id           serial PRIMARY KEY,\n  type         text NOT NULL,\n  booking_date date NOT NULL,\n  sponsor_name text NOT NULL,\n  gotra        text,\n  nakshatra    text,\n  amount       numeric(10,2) NOT NULL,\n  advance_paid numeric(10,2) NOT NULL DEFAULT 0,\n  status       text NOT NULL DEFAULT 'booked',\n  count        integer\n);\n\n-- Balance due is computed, never stored:\n--   SELECT sponsor_name, amount - advance_paid AS balance FROM bookings;",
          pitfalls: [
            'Storing a computed balance column instead of computing `amount - advance_paid` at query time.',
            'Using `timestamptz` for booking_date — a booking is a whole day, use `date`.',
            'Making `count` NOT NULL, breaking Yakshagana bookings that have no meal count.',
            'Splitting into two tables for a tiny offline app when a nullable `count` suffices.',
            'Leaving `advance_paid` nullable, so balance math hits NULL — default it to 0.',
            'Letting `type` and `status` be free text without CHECK constraints (fixed next).',
          ],
          tryIt:
            "Insert an Annadhana booking for next Sunday: amount 5000, advance_paid 2000, count 200. Then SELECT amount - advance_paid AS balance and confirm it shows 3000.",
          takeaway:
            'bookings is the diary of future Yakshagana/Annadhana events with a sponsor, full amount, advance paid, status and a nullable meal count — balance is computed, not stored.',
        },
        {
          id: 'm3-t9',
          title: 'CHECK constraints: enum-like columns the safe way',
          explain:
            "A CHECK constraint forces a text column to hold only approved values, like a small built-in enum.",
          analogy:
            "Imagine the counter staff could write the payment mode any way they liked: 'cash', 'Cash', 'CASH', 'nagdu'. The daily report would never add up. A CHECK constraint is the temple rule pinned above the till: only these exact words are allowed, and the database itself rejects anything else.",
          theory:
            'Postgres does have real `ENUM` types, but for a small offline app a **`text` column with a `CHECK` constraint** is simpler and easier to migrate. You write `status text NOT NULL CHECK (status IN (\'booked\', \'confirmed\', \'cancelled\'))`. Any insert or update with a value outside that list is **rejected by the database**, not just by the app.\n\nApply the same pattern to other small, fixed sets: `payment_mode CHECK (payment_mode IN (\'cash\', \'upi\'))`, `category CHECK (category IN (\'daily\', \'booking\'))`, and booking `type CHECK (type IN (\'yakshagana\', \'annadhana\'))`.\n\nThe **win** is that integrity lives in the database, so even a stray script or a future you cannot insert `\'Cancelled\'` with a capital C. The **cost** is that adding a new allowed value later means a migration that drops and re-adds the constraint — acceptable, since these sets change rarely.',
          whyItMatters:
            'Reports and filters depend on these columns matching exactly. One `\'UPI\'` instead of `\'upi\'` and your cash-vs-UPI reconciliation is silently wrong. CHECK constraints make such bad data impossible at the source, which is far more reliable than trusting every code path to validate. It is the cheapest data-quality insurance you can buy.',
          steps: [
            'List each column with a small fixed set: payment_mode, category, status, type.',
            "Add `CHECK (col IN ('a','b',...))` with the exact lowercase values.",
            'Decide on one casing convention (lowercase) and use it everywhere.',
            'Combine with `NOT NULL` so the column is always one of the allowed values.',
            'Test by attempting an invalid insert and confirming the database rejects it.',
            'Remember: changing the allowed set later is a migration (drop + re-add the constraint).',
          ],
          code:
            "-- Enum-like columns via CHECK, applied across the schema:\nALTER TABLE receipts\n  ADD CONSTRAINT chk_payment_mode\n  CHECK (payment_mode IN ('cash', 'upi'));\n\nALTER TABLE sevas\n  ADD CONSTRAINT chk_category\n  CHECK (category IN ('daily', 'booking'));\n\nALTER TABLE bookings\n  ADD CONSTRAINT chk_booking_type\n  CHECK (type IN ('yakshagana', 'annadhana')),\n  ADD CONSTRAINT chk_booking_status\n  CHECK (status IN ('booked', 'confirmed', 'cancelled'));",
          pitfalls: [
            "Mixing casing in the allowed list and the app, e.g. 'Cash' here but 'cash' there.",
            'Forgetting NOT NULL, so NULL slips past the CHECK (NULL is allowed unless excluded).',
            'Using a real ENUM type then finding it painful to add a value later in a small app.',
            'Putting the validation only in React, so a stray SQL script inserts bad values.',
            'Naming constraints inconsistently, making later migrations hard to target.',
            "Allowing too many values 'just in case' — keep the set tight and meaningful.",
          ],
          tryIt:
            "Try `INSERT INTO receipts (token_no, payment_mode, total) VALUES (1, 'card', 60);` and watch the CHECK reject it. Then retry with 'upi' and confirm it succeeds.",
          takeaway:
            'A text column plus CHECK (col IN (...)) gives an enum-like, database-enforced set for payment_mode, category, status and type — bad values become impossible at the source.',
        },
        {
          id: 'm3-t10',
          title: 'Seeding the seva catalog with INSERT ... ON CONFLICT',
          explain:
            "Seed data fills the catalog with the temple's real sevas so the app opens ready, and ON CONFLICT keeps it idempotent.",
          analogy:
            "When you hang a fresh seva board at the counter, you write the same sevas every time: Rangapooje, Mangalarathi, Hannikaayi, Yakshagana, Annadhana. If you run the seed twice, you do not want two Rangapooje rows. `ON CONFLICT DO NOTHING` is the rule: if it is already on the board, leave it.",
          theory:
            'An empty database is useless to staff — they cannot bill a Rangapooje that is not in the catalog. **Seeding** inserts the known reference data so the app is usable on first launch.\n\nThe danger is running the seed more than once (every app start, or after a reinstall). To make it **idempotent** — safe to run repeatedly — use **`INSERT ... ON CONFLICT DO NOTHING`**. This needs a **unique key** to conflict on; add a unique constraint on `sevas(name)`, then a duplicate insert simply does nothing instead of erroring or duplicating.\n\nWrite the seed so each seva carries its real Kannada name, category and price. Because the catalog rarely changes, this seed can live in a versioned `.sql` file (next topic) and be applied on every startup safely.',
          whyItMatters:
            'A counter that opens to an empty seva list cannot take a single offering — the seed is what makes the app immediately useful at Maranakatte. Idempotency matters because the app may run its migrations and seed on every launch and after the KEEP-data reinstall path; without ON CONFLICT you would either crash on duplicates or pile up repeated Rangapooje rows.',
          steps: [
            'Add a unique constraint on `sevas(name)` so a seva name can conflict.',
            "Write `INSERT INTO sevas (name, kannada_name, category, price) VALUES ...`.",
            'List the real sevas: Rangapooje, Mangalarathi, Hannikaayi, Yakshagana, Annadhana.',
            'Append `ON CONFLICT (name) DO NOTHING` to make re-runs safe.',
            'Run the seed twice and confirm the row count does not grow the second time.',
            'Keep the seed in a versioned `.sql` file so every machine gets the same catalog.',
          ],
          code:
            "-- Need a unique key to conflict on:\nALTER TABLE sevas ADD CONSTRAINT ux_sevas_name UNIQUE (name);\n\n-- Idempotent seed of the temple's real sevas:\nINSERT INTO sevas (name, kannada_name, category, price) VALUES\n  ('Rangapooje',   'ರಂಗಪೂಜೆ',   'daily',    60.00),\n  ('Mangalarathi', 'ಮಂಗಳಾರತಿ',  'daily',    25.00),\n  ('Hannikaayi',   'ಹಣ್ಣಿಕಾಯಿ', 'daily',    30.00),\n  ('Yakshagana',   'ಯಕ್ಷಗಾನ',   'booking', 15000.00),\n  ('Annadhana',    'ಅನ್ನದಾನ',   'booking',  5000.00)\nON CONFLICT (name) DO NOTHING;",
          pitfalls: [
            'No unique constraint, so ON CONFLICT has nothing to conflict on and errors.',
            'Plain INSERT without ON CONFLICT, piling up duplicate sevas on every launch.',
            "Hardcoding seed rows in React instead of a .sql file, so machines drift apart.",
            'Using ON CONFLICT DO UPDATE when you meant DO NOTHING, overwriting edited prices.',
            'Forgetting the Kannada name in the seed, so the printed receipt is English-only.',
            'Seeding test/dummy sevas that staff then have to hunt down and deactivate.',
          ],
          tryIt:
            'Run the seed INSERT, note 5 rows. Run the exact same INSERT again and confirm it still shows 5 rows, not 10 — that is idempotency.',
          takeaway:
            'Seed the real sevas with INSERT ... ON CONFLICT (name) DO NOTHING so the app opens ready to bill and the seed is safe to run on every launch.',
        },
        {
          id: 'm3-t11',
          title: 'Versioned .sql migration files',
          explain:
            'Keep every schema and seed change in numbered .sql files so each machine reaches the same database state.',
          analogy:
            "Think of the temple's renovation logbook: each change to the building is written as a dated, numbered entry, in order. Anyone reading the log can rebuild the temple exactly. Migration files are that logbook for your database — `001_init.sql`, `002_seed.sql`, and so on.",
          theory:
            'This ties back to m2: schema changes should live in **versioned migration files**, not be typed by hand into each install. You keep an ordered set like **`001_init.sql`** (create all tables, FKs, CHECKs, indexes), **`002_seed.sql`** (idempotent seva seed), `003_...` (later changes). They run in filename order.\n\nThe app, on startup in the **main process**, applies any migrations the local database has not yet run, then opens. Because `001` creates tables with `IF NOT EXISTS` and `002` uses `ON CONFLICT DO NOTHING`, re-running is safe. This is exactly how every Maranakatte machine — and the KEEP-data reinstall path — arrives at an identical, correct schema.\n\nFor this offline app you can run the SQL files yourself with the `pg` client at startup; you do not need a heavy migration framework. The discipline that matters is: **one change = one new numbered file, never edit an old one** that has already run somewhere.',
          whyItMatters:
            'When the temple has the app on the counter machine and a backup laptop, migration files guarantee both have the same tables, constraints and seed. They make the schema reproducible, reviewable in git, and recoverable after a reinstall. Editing a database by hand instead leads to two machines that silently disagree — the worst kind of bug.',
          steps: [
            'Create a `migrations/` folder with numbered files: `001_init.sql`, `002_seed.sql`.',
            'Put all CREATE TABLE / index / CHECK statements in `001_init.sql` with IF NOT EXISTS.',
            'Put the idempotent seva seed in `002_seed.sql`.',
            'On app startup in the main process, run each `.sql` file in filename order via `pg`.',
            'Rely on IF NOT EXISTS and ON CONFLICT so re-running is harmless.',
            'Rule: for any change, add a new numbered file; never edit one that already ran.',
          ],
          code:
            "// main process: apply migrations in order at startup (Node + pg)\nconst fs = require('fs');\nconst path = require('path');\n\nasync function runMigrations(client, dir) {\n  const files = fs.readdirSync(dir)\n    .filter(function (f) { return f.endsWith('.sql'); })\n    .sort(); // 001_ before 002_\n  for (const file of files) {\n    const sql = fs.readFileSync(path.join(dir, file), 'utf8');\n    await client.query(sql); // 001_init is CREATE ... IF NOT EXISTS\n    console.log('applied migration: ' + file);\n  }\n}",
          pitfalls: [
            'Editing an already-applied migration instead of adding a new numbered one.',
            'Files that sort wrong (`1_init` vs `10_x`) — zero-pad to `001`, `010`.',
            'CREATE TABLE without IF NOT EXISTS, so re-running 001 crashes on the second start.',
            'Typing schema changes directly into one machine, so others drift out of sync.',
            'Running migrations from the renderer — DB access must stay in the main process.',
            'No ordering guarantee, applying 002_seed before 001_init creates missing-table errors.',
          ],
          tryIt:
            'Create `001_init.sql` and `002_seed.sql`, then run the runMigrations loop twice. Confirm the second run logs both files but changes nothing, thanks to IF NOT EXISTS and ON CONFLICT.',
          takeaway:
            'Versioned, numbered .sql files applied in order at startup give every machine an identical, reproducible schema; add a new file for each change and never edit one that already ran.',
        },
        {
          id: 'm3-t12',
          title: 'Sample devotees & opening with real data',
          explain:
            'Seed a few sample devotees too, so the app opens with believable data to test screens against.',
          analogy:
            'Before the counter opens, it helps to have a couple of practice slips already filled in — a sample Ramesh of Kashyapa gotra — so staff can see how a receipt looks. A handful of seed devotees do the same for your screens during development.',
          theory:
            'Beyond the seva catalog, seeding **a few sample devotees** lets you open the app and immediately see lists, lookups and receipts populated, instead of staring at empty tables while building UI. These rows live in the same `002_seed.sql` (or a separate `003_sample.sql`) and use the same **idempotent** pattern.\n\nBecause devotees do not have an obvious natural unique key (two people can share a name), you can make the sample seed idempotent by conflicting on a chosen key — e.g. a unique `(name, phone)` pair for the samples — or simply guard the insert with `WHERE NOT EXISTS`. For a handful of dev samples, `WHERE NOT EXISTS (SELECT 1 FROM devotees WHERE phone = \'...\')` is clear and safe.\n\nKeep sample data clearly fictional and few. In production you may skip the sample devotees entirely (only seed the catalog), or include them and let staff delete them — the choice is yours, but the technique is the same idempotent seeding you already know.',
          whyItMatters:
            'A populated app is far easier to build and demo than empty tables — you can see how a devotee list paginates, how a receipt prints a real name, how gotra appears. Making the sample seed idempotent means re-running migrations on every launch will not duplicate your test devotees, keeping development data clean.',
          steps: [
            'Decide where samples go: `002_seed.sql` or a separate `003_sample.sql`.',
            'Write a few clearly-fictional devotees with name, gotra, nakshatra, phone.',
            'Make the insert idempotent with `WHERE NOT EXISTS` on a chosen key like phone.',
            'Run the seed and confirm the sample devotees appear in the app.',
            'Re-run and confirm they are not duplicated.',
            'Decide whether production ships with samples or seeds the catalog only.',
          ],
          code:
            "-- Idempotent sample devotees (guarded by WHERE NOT EXISTS):\nINSERT INTO devotees (name, gotra, nakshatra, phone)\nSELECT 'Ramesh Bhat', 'Kashyapa', 'Rohini', '9886012345'\nWHERE NOT EXISTS (\n  SELECT 1 FROM devotees WHERE phone = '9886012345'\n);\n\nINSERT INTO devotees (name, gotra, nakshatra, phone)\nSELECT 'Lakshmi Hegde', 'Bharadwaja', 'Ashwini', '9740098765'\nWHERE NOT EXISTS (\n  SELECT 1 FROM devotees WHERE phone = '9740098765'\n);",
          pitfalls: [
            'Plain INSERT for samples, duplicating them on every app launch.',
            'Seeding dozens of fake devotees that clutter the real register later.',
            'Using a name as the conflict key — two real devotees can share a name.',
            'Shipping obviously-fake test data to production without a way to remove it.',
            'Forgetting these are dev aids, then building features that assume they always exist.',
            'Mixing sample inserts into 001_init so schema and data are tangled.',
          ],
          tryIt:
            'Add the two sample devotees, open the app and view the devotee list. Re-run the seed and confirm the count stays the same.',
          takeaway:
            'A few idempotent sample devotees make the app open with believable data for building and demoing screens, without duplicating on repeated seed runs.',
        },
        {
          id: 'm3-t13',
          title: 'Putting the schema together & a quick walkthrough',
          explain:
            'See all five tables as one connected schema and trace a single Rangapooje from catalog to receipt to report.',
          analogy:
            'Step back from the individual tables and look at the whole counter as one system: the seva board feeds the slip, the slip carries lines, the lines remember the devotee, and the day\'s slips add up to the evening collection. Every part you built now clicks into one picture.',
          theory:
            'The finished schema is five tables: **`sevas`** (catalog), **`devotees`** (optional reusable people), **`receipts`** (tickets, per-day token), **`receipt_items`** (lines, frozen devotee copy, FKs to receipt and seva), and **`bookings`** (future Yakshagana/Annadhana). CHECK constraints guard the enum-like columns; indexes speed the daily filter and the joins; `numeric` keeps money exact.\n\n**Trace one Rangapooje.** Staff pick "Rangapooje" from `sevas` (id 1, ₹60). The app gets today\'s next token via `COALESCE(MAX(token_no),0)+1`, inserts a **receipt** (token 215, total 60, mode \'upi\'), then a **receipt_item** (receipt_id 215\'s id, seva_id 1, devotee_name \'Ramesh\', gotra \'Kashyapa\', qty 1, amount 60). At day end, the report is `SELECT receipt_date, SUM(total) FROM receipts WHERE receipt_date = CURRENT_DATE GROUP BY receipt_date;` — fast because of the index.\n\nEverything ties together: catalog -> ticket -> line -> report, with integrity enforced by keys and constraints, and the whole schema reproducible from numbered `.sql` migrations.',
          whyItMatters:
            'Seeing the schema as one connected whole — not five isolated tables — is what lets you build the billing screen, the booking register and the daily report in the next modules with confidence. The walkthrough proves the design actually supports the temple\'s real flow end to end, which is the whole point of modeling before coding.',
          steps: [
            'Re-read the five tables and name each relationship out loud.',
            'Trace a Rangapooje: pick seva -> next token -> insert receipt -> insert item.',
            'Run the daily collection query and confirm it uses receipt_date.',
            'Trace a booking: insert an Annadhana with advance, query its balance.',
            'Confirm every enum-like column has a CHECK and every FK an index.',
            'Confirm the whole schema can be rebuilt from 001_init.sql + 002_seed.sql.',
          ],
          code:
            "-- End-to-end: one Rangapooje, then the daily report.\n-- 1) next token for today\nSELECT COALESCE(MAX(token_no), 0) + 1 AS next_token\nFROM receipts WHERE receipt_date = CURRENT_DATE;\n\n-- 2) the receipt (say next_token came back 215)\nINSERT INTO receipts (token_no, total, payment_mode)\nVALUES (215, 60.00, 'upi') RETURNING id;\n\n-- 3) the line (use the returned receipt id)\nINSERT INTO receipt_items\n  (receipt_id, seva_id, devotee_name, gotra, nakshatra, qty, amount)\nVALUES ($1, 1, 'Ramesh', 'Kashyapa', 'Rohini', 1, 60.00);\n\n-- 4) evening collection\nSELECT receipt_date, SUM(total) AS collection\nFROM receipts WHERE receipt_date = CURRENT_DATE\nGROUP BY receipt_date;",
          pitfalls: [
            'Treating the tables as unrelated and querying them without the joins.',
            'Forgetting RETURNING id and guessing the new receipt id for the item.',
            'Summing receipt_items for the daily report when the stored receipt.total is faster.',
            'Skipping the date filter and reporting all-time totals by accident.',
            'Building screens before confirming the schema supports the real flow end to end.',
            'Letting the schema drift from the migration files so a rebuild differs from production.',
          ],
          tryIt:
            'Run the four-step walkthrough on your seeded database: next token, insert receipt with RETURNING, insert the item, then the collection query. Confirm the collection reflects your new receipt.',
          takeaway:
            'The five tables form one connected schema — catalog to ticket to line to report — enforced by keys and CHECKs, fast through indexes, and fully rebuildable from numbered migrations.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm3-p1',
      type: 'Build',
      title: 'The full schema: 001_init.sql',
      domain: 'Temple seva counter database',
      duration: '3-4 hours',
      description:
        'Write a single 001_init.sql migration that creates the entire Maranakatte Seva database: sevas, devotees, receipts, receipt_items and bookings, with correct Postgres types, foreign keys, ON DELETE rules, CHECK constraints and the indexes the Rangapooje rush needs. The file must be re-runnable (IF NOT EXISTS) and applied by the main process at startup.',
      tools: ['PostgreSQL', 'node-postgres (pg)', 'Electron main process', 'SQL'],
      blueprint: {
        overview:
          'This is the foundation every later module builds on. You translate the domain model into a clean, correct schema in one ordered .sql file. Money is `numeric`, enum-like columns use CHECK, receipt_items cascade with their receipt while sevas are protected from deletion, tokens are guarded by a per-day unique index, and the hot query paths are indexed. The file is idempotent so it can run on every machine and every launch.',
        functionalRequirements: [
          'Creates all five tables: sevas, devotees, receipts, receipt_items, bookings.',
          'Uses numeric(10,2) for every money column and timestamptz for created_at.',
          'Declares foreign keys with ON DELETE CASCADE for receipt_items.receipt_id and RESTRICT for seva_id.',
          'Adds CHECK constraints for category, payment_mode, booking type and status.',
          'Creates indexes on receipts(receipt_date), receipt_items(receipt_id), receipt_items(seva_id) and a unique index on receipts(receipt_date, token_no).',
        ],
        technicalImplementation: [
          'Wrap each table in CREATE TABLE IF NOT EXISTS so re-running the migration is safe.',
          'Place CHECK constraints inline in the CREATE TABLE for new tables, with clear constraint names.',
          'Add a UNIQUE (name) constraint on sevas so the later seed can use ON CONFLICT.',
          'Apply the file from the Electron main process via pg, in filename order, before opening the window.',
          'Keep the file under version control as migrations/001_init.sql; never edit it once it has run somewhere.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Generate the core tables',
            outcome: 'CREATE TABLE statements for sevas, devotees, receipts and receipt_items with correct types and keys.',
            prompt:
              "Write PostgreSQL CREATE TABLE IF NOT EXISTS statements for an OFFLINE temple seva counter app. Tables: 'sevas' (id serial PK, name text not null, kannada_name text, category text default 'daily', price numeric(10,2) not null default 0, active boolean not null default true, UNIQUE(name)); 'devotees' (id serial PK, name text not null, gotra text, nakshatra text, phone text); 'receipts' (id serial PK, token_no integer not null, receipt_date date not null default CURRENT_DATE, total numeric(10,2) not null default 0, payment_mode text not null default 'cash', created_at timestamptz not null default now()); 'receipt_items' (id serial PK, receipt_id integer not null REFERENCES receipts(id) ON DELETE CASCADE, seva_id integer not null REFERENCES sevas(id), devotee_name text not null, gotra text, nakshatra text, qty integer not null default 1, amount numeric(10,2) not null). Use numeric for all money. Output plain SQL only.",
          },
          {
            step: 2,
            label: 'Add CHECK constraints and the bookings table',
            outcome: 'The bookings table plus enum-like CHECK constraints across the schema.',
            prompt:
              "Add a PostgreSQL 'bookings' table for a temple: id serial PK, type text not null, booking_date date not null, sponsor_name text not null, gotra text, nakshatra text, amount numeric(10,2) not null, advance_paid numeric(10,2) not null default 0, status text not null default 'booked', count integer. Then add CHECK constraints: sevas.category IN ('daily','booking'); receipts.payment_mode IN ('cash','upi'); bookings.type IN ('yakshagana','annadhana'); bookings.status IN ('booked','confirmed','cancelled'). Give each constraint a clear name. Output plain SQL only.",
          },
          {
            step: 3,
            label: 'Add the indexes for the rush',
            outcome: 'Indexes that make the daily report and joins fast, plus the per-day token guard.',
            prompt:
              "Write PostgreSQL CREATE INDEX statements for a temple seva app where 500+ receipts are created each evening. Add: an index on receipts(receipt_date) for the daily collection report; indexes on receipt_items(receipt_id) and receipt_items(seva_id) for joins; and a UNIQUE index on receipts(receipt_date, token_no) so no two receipts share a token on the same day. Explain in one sentence per index why it helps. Output the SQL followed by the short explanations.",
          },
        ],
      },
    },
    {
      id: 'm3-p2',
      type: 'Build',
      title: 'Seed the seva catalog: 002_seed.sql',
      domain: 'Temple seva counter database',
      duration: '2-3 hours',
      description:
        "Write an idempotent 002_seed.sql (or seed script) that inserts the temple's real sevas — Rangapooje, Mangalarathi, Hannikaayi, Yakshagana, Annadhana — with their Kannada names, categories and prices, plus a few sample devotees, so the app opens with real, usable data. Running it twice must not create duplicates.",
      tools: ['PostgreSQL', 'node-postgres (pg)', 'SQL', 'Electron main process'],
      blueprint: {
        overview:
          'A migrated-but-empty database cannot bill anything. This seed makes the app immediately usable at the Maranakatte counter by populating the seva catalog with the temple\'s real offerings and a handful of sample devotees. Idempotency is the headline: because the app runs migrations and seeds on every launch (and after the KEEP-data reinstall), the seed uses ON CONFLICT DO NOTHING for sevas and WHERE NOT EXISTS for sample devotees, so repeated runs change nothing.',
        functionalRequirements: [
          'Inserts the five real sevas with name, kannada_name, category and price.',
          'Uses ON CONFLICT (name) DO NOTHING so re-running never duplicates a seva.',
          'Inserts a few clearly-fictional sample devotees with gotra, nakshatra and phone.',
          'Guards sample devotees with WHERE NOT EXISTS so they are not duplicated.',
          'Leaves the app opening to a populated seva list and devotee register.',
        ],
        technicalImplementation: [
          'Rely on the UNIQUE(name) constraint from 001_init.sql for the sevas ON CONFLICT target.',
          'Set correct categories: daily for Rangapooje/Mangalarathi/Hannikaayi, booking for Yakshagana/Annadhana.',
          'Use numeric prices in rupees, e.g. Rangapooje 60.00, Annadhana 5000.00.',
          'Apply 002_seed.sql after 001_init.sql in filename order from the main process.',
          'Keep sample devotees few and obviously fictional, guarded by phone with WHERE NOT EXISTS.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Seed the seva catalog idempotently',
            outcome: 'An INSERT that adds the five real sevas and is safe to run repeatedly.',
            prompt:
              "Write a PostgreSQL INSERT that seeds a temple seva catalog table 'sevas' (columns: name, kannada_name, category, price). Insert these real sevas: Rangapooje (daily, 60.00), Mangalarathi (daily, 25.00), Hannikaayi (daily, 30.00), Yakshagana (booking, 15000.00), Annadhana (booking, 5000.00), each with its Kannada-script name. Make it idempotent with ON CONFLICT (name) DO NOTHING, assuming a UNIQUE constraint on sevas(name). Output plain SQL only.",
          },
          {
            step: 2,
            label: 'Seed sample devotees safely',
            outcome: 'A few idempotent sample devotee inserts guarded against duplicates.',
            prompt:
              "Write PostgreSQL inserts for 3 sample devotees into a 'devotees' table (columns: name, gotra, nakshatra, phone). Use realistic coastal Karnataka names, gotras and nakshatras, with phone numbers as text. Make each insert idempotent using INSERT ... SELECT ... WHERE NOT EXISTS, keyed on the phone column, so re-running the seed does not duplicate them. Output plain SQL only.",
          },
          {
            step: 3,
            label: 'Apply the seed from the main process',
            outcome: 'Node/pg code in the Electron main process that runs the seed after migrations, safely on every launch.',
            prompt:
              "Write a Node.js function for an Electron MAIN process that, using node-postgres (pg), reads and executes seed .sql files (like 002_seed.sql) from a migrations folder in filename order, after the schema migrations have run. It must be safe to run on every app launch because the SQL uses ON CONFLICT DO NOTHING and WHERE NOT EXISTS. Keep all database access in the main process (never the renderer). Use single quotes and concatenation. Output the function only.",
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm3-q1',
      q: 'Why should the price and amount columns use numeric instead of float?',
      options: [
        'numeric sorts faster than float',
        'float stores approximate values, so rupee totals could drift; numeric is exact to the paisa',
        'float is not supported in PostgreSQL',
        'numeric uses less disk space than float',
      ],
      answer: 1,
    },
    {
      id: 'm3-q2',
      q: 'Why are devotee_name, gotra and nakshatra copied (frozen) onto each receipt_items row instead of only referencing the devotees table?',
      options: [
        'Because PostgreSQL cannot join two tables',
        'To save disk space on the devotees table',
        'For counter speed (no lookup per ticket) and so a printed receipt never changes if a devotee record is later edited',
        'Because foreign keys are not allowed on text columns',
      ],
      answer: 2,
    },
    {
      id: 'm3-q3',
      q: 'How do you compute the next daily token for today so it resets each morning?',
      options: [
        'Use the auto-increment id of the receipts table',
        "SELECT COALESCE(MAX(token_no), 0) + 1 FROM receipts WHERE receipt_date = CURRENT_DATE",
        'Count all rows in receipts and add one',
        'Store a global counter and reset it manually each night',
      ],
      answer: 1,
    },
    {
      id: 'm3-q4',
      q: 'Which ON DELETE behaviour belongs on receipt_items.receipt_id, and why?',
      options: [
        'ON DELETE SET NULL, so items keep working without a receipt',
        'ON DELETE CASCADE, because a line item cannot exist without its receipt',
        'ON DELETE RESTRICT, so receipts can never be deleted',
        'No ON DELETE clause is needed for foreign keys',
      ],
      answer: 1,
    },
    {
      id: 'm3-q5',
      q: 'What is the simplest way to restrict booking status to booked, confirmed or cancelled in this offline app?',
      options: [
        'Validate it only in the React form',
        "A text column with CHECK (status IN ('booked','confirmed','cancelled'))",
        'Store status as an integer code 1, 2 or 3',
        'Create a separate statuses table and join every time',
      ],
      answer: 1,
    },
    {
      id: 'm3-q6',
      q: 'Why does the seva seed use INSERT ... ON CONFLICT (name) DO NOTHING?',
      options: [
        'To overwrite the price every time the app starts',
        'To make the seed idempotent so running it on every launch never creates duplicate sevas',
        'Because ON CONFLICT is required for all INSERT statements in PostgreSQL',
        'To delete sevas that already exist',
      ],
      answer: 1,
    },
  ],
};
