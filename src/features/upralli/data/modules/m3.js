// Module 3 — The Pooja Register Data Model in Prisma
// Designs the real year-scoped schema for the offline "Upralli Seva" temple desktop app.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m3 = {
  id: 'm3',
  title: 'The Pooja Register Data Model in Prisma',
  hours: 8,
  color: 'from-cyan-500/20 to-cyan-700/10',
  accent: 'cyan',
  description:
    'Design the real Upralli Seva schema with Prisma: a GLOBAL Magane master, a year-scoped snapshot of pooja columns, household person-entries and per-person participation. Learn the five models, the relations and integrity rules, why money is `Decimal` (never float), and how `@@schema("pooja_register")` + multiSchema, migrations and seeding bring a blank local PostgreSQL to life.',
  sections: [
    {
      id: 'm3-s1',
      title: 'Modeling the committee domain',
      topics: [
        {
          id: 'm3-t1',
          title: 'The entities and how they relate',
          explain:
            'Before any `.prisma` code, name the things the committee tracks — **Magane**, **Year**, **PoojaType**, **PersonEntry**, **Participation** — and decide which lives forever and which belongs to a single year.',
          analogy:
            'Picture the committee almirah. There is **one permanent ward list** for the whole village — the maganes — pinned to the wall and rarely changed. Then for *each festival year* a fresh register book is opened: it has its own column headings (the poojas), its own household lines, and its own ticks. The ward list is global; the register book is per-year.',
          theory:
            'Upralli Seva records a coastal-Karnataka village temple\'s yearly pooja-and-donor register. Five entities carry the whole domain. A **Magane** is a ward or hamlet of the village — there are ~91 of them and they barely change, so they are a **global master**. A **Year** is one festival cycle (e.g. 2025) with its own title and lock flag. A **PoojaType** is one pooja offered *in that year* (some shown as a grid column, some rate-only extras). A **PersonEntry** is one household line in a year\'s register, belonging to a magane. A **Participation** is a single checkbox — did this household take this pooja — joining one PersonEntry to one PoojaType.\n\nIn words, the relationship diagram is: **Magane** (global) has many **PersonEntry**. **Year** has many **PoojaType** and many **PersonEntry**. **PersonEntry** belongs to one Year and one Magane, and has many **Participation**. **PoojaType** belongs to one Year and has many **Participation**. **Participation** sits in the middle, pointing at exactly one PersonEntry and one PoojaType — the classic many-to-many "join row" between households and poojas, but scoped inside one year.\n\nThe crucial design choice is the boundary line: Magane crosses *all* years, while Year, PoojaType, PersonEntry and Participation are **year-scoped**. That single decision — what is shared vs what is copied per year — shapes every model, every relation, and the entire "snapshot" behaviour we explore next.',
          whyItMatters:
            'Real 2025 data is **91 maganes and 2280 households**. Getting these five entities and their boundaries right means the grid, the ₹ totals, the year lock and next year\'s clone all build cleanly on top. Get the boundary wrong — say, making poojas global — and locking 2024 would silently change 2025.',
          steps: [
            'List the five entities: Magane, Year, PoojaType, PersonEntry, Participation.',
            'Decide what each describes — one ward, one festival year, one pooja, one household, one tick.',
            'Mark which is GLOBAL (Magane) and which is year-scoped (the rest).',
            'Draw the arrows: Year has poojaTypes and entries; PersonEntry has participations.',
            'Spot the many-to-many (households x poojas) resolved by Participation.',
            'Sketch it on paper before writing a single line of `.prisma`.',
          ],
          code:
            '// Relationship map (in words) — Upralli Seva\n' +
            '//\n' +
            '//   Magane (GLOBAL master, ~91 wards)\n' +
            '//      |\n' +
            '//      | 1..many\n' +
            '//      v\n' +
            '//   PersonEntry  >----- belongs to -----<  Year (per festival year)\n' +
            '//      |                                      |\n' +
            '//      | 1..many                              | 1..many\n' +
            '//      v                                      v\n' +
            '//   Participation  >----- joins -----<  PoojaType (per year, rated)\n' +
            '//\n' +
            '// GLOBAL: Magane          (crosses every year)\n' +
            '// YEAR-SCOPED: Year, PoojaType, PersonEntry, Participation',
          pitfalls: [
            '**Making PoojaType global.** If poojas were shared, editing 2025\'s rate would rewrite 2024 history. Fix: scope PoojaType to a Year.',
            '**Making Magane year-scoped.** Copying the 91 wards into every year duplicates a stable master. Fix: keep Magane global, reference it by id.',
            '**Storing the participation as a column per pooja.** A wide table with one column per pooja cannot grow per year. Fix: a Participation row per (household, pooja).',
            '**Forgetting the join row.** Households-to-poojas is many-to-many; you cannot model it with a single foreign key. Fix: an explicit Participation entity.',
            '**Mixing a household and its magane into one row of text.** You lose the ability to list a ward fast. Fix: PersonEntry references Magane by id.',
            '**Designing only in your head.** Five related entities are easy to get subtly wrong. Fix: draw the arrows on paper first.',
          ],
          tryIt:
            'On paper, draw the five Upralli Seva entities with arrows. Circle the one global entity. For each year-scoped entity, write why it must NOT be shared across years.',
          takeaway:
            'Five entities carry the domain: a global Magane master plus a year-scoped Year, PoojaType, PersonEntry and Participation. The global-vs-year-scoped boundary is the most important decision in the whole schema.',
        },
        {
          id: 'm3-t2',
          title: 'Why maganes are global but participation is year-scoped',
          explain:
            'Maganes are written once and reused everywhere; everything else is **snapshotted per year** so that locking an old year can never ripple into a new one.',
          analogy:
            'The village ward list is like the permanent voter roll — one copy, referenced by every year\'s register. But each year the committee opens a **brand-new register book** and *copies forward* last year\'s households and poojas as a starting point. Once a year\'s book is signed and shelved (locked), nobody can change it — and because the new book is a separate copy, this year\'s edits never reach back into the shelved one.',
          theory:
            'A **snapshot model** means each Year owns its own independent copy of the per-year data: its PoojaTypes (with that year\'s rates), its PersonEntries (that year\'s households), and their Participations. Nothing per-year is shared between years. The only thing shared is the Magane master, because a ward is the same ward regardless of festival year.\n\nWhy go to this trouble? **History must stay frozen.** The committee locks a year once its accounts are finalised. If 2025 and 2024 shared the same pooja rows, raising a rate for 2025 would silently rewrite the locked 2024 totals — the books would no longer reconcile. By snapshotting, 2024\'s numbers are permanently its own. This is the same reason an accountant photocopies last year\'s ledger rather than writing over it.\n\nThe practical workflow is **cloning a year**: to start 2026, you copy 2025\'s PoojaTypes and PersonEntries forward into new rows with a new `yearId`, then the committee edits the copies. Magane references are reused as-is (same global ids). Participations may be cloned blank or carried over. Because the clone produces fresh rows, locked 2025 history is untouched no matter what 2026 does.',
          whyItMatters:
            'Temple committees answer to the public; a locked year\'s ₹ totals must never move. The snapshot design is what guarantees that — and it is why "start next year" is a safe copy operation, not a risky shared edit. With 2280 households, an accidental ripple across years would be impossible to untangle by hand.',
          steps: [
            'Treat Magane as a stable master shared by all years — never copied.',
            'Treat Year, PoojaType, PersonEntry, Participation as a per-year snapshot.',
            'When opening a new year, CLONE last year\'s poojaTypes and entries into new rows.',
            'Point cloned entries at the SAME magane ids (reuse the global master).',
            'Lock a finished year so its snapshot becomes read-only.',
            'Verify edits in the new year leave the locked year\'s rows unchanged.',
          ],
          code:
            '// SNAPSHOT vs SHARED\n' +
            '//\n' +
            '// Magane (global, shared):\n' +
            "//   { id: 7, name: 'ಕೆಳಗಿನ ಮಗ್ಗೆ' }   <- referenced by 2024 AND 2025\n" +
            '//\n' +
            '// Year-scoped (snapshotted, copied forward on clone):\n' +
            '//   2024: PoojaType { id: 41, yearId: 1, name: ..., rate: 100 }\n' +
            '//   2025: PoojaType { id: 88, yearId: 2, name: ..., rate: 120 }  <- NEW row\n' +
            '//\n' +
            '// Raising the 2025 rate touches row 88 only.\n' +
            '// Locked 2024 (row 41) is a separate snapshot — it cannot ripple.',
          pitfalls: [
            '**Sharing pooja rows across years to "save space".** Saves a few rows, breaks locked history. Fix: snapshot per year; storage is cheap, integrity is not.',
            '**Cloning maganes too.** Copying the 91 wards per year duplicates a stable master and scatters its identity. Fix: reference the same global Magane ids.',
            '**Editing a locked year\'s rows.** Defeats the whole point of locking. Fix: enforce `isLocked` checks before any write to that year.',
            '**Forgetting to carry rates forward on clone.** Next year starts with blank rates and staff retype 91 wards of data. Fix: copy rates as the starting point.',
            '**Mutating last year to start this year.** Reusing the same rows for the new year erases history. Fix: INSERT new rows with the new `yearId`.',
            '**Assuming a household id is the same across years.** A PersonEntry is per-year; only Magane ids are stable. Fix: never join households across years by id.',
          ],
          tryIt:
            'Describe, in three bullets, exactly what gets copied and what gets reused when the committee opens year 2026 from 2025. State which entity is the only one NOT copied, and why locked 2025 totals stay frozen.',
          takeaway:
            'Maganes are a shared global master; everything per-year is an independent snapshot copied forward on clone. That separation is what keeps locked years frozen and makes "start next year" a safe operation.',
        },
        {
          id: 'm3-t3',
          title: 'From entities to Prisma models — ids, @map and @@schema',
          explain:
            'Prisma turns each entity into a `model`. Conventions: an autoincrement `id`, `@map`/`@@map` to snake_case table and column names, and `@@schema("pooja_register")` to keep the temple tables in their own namespace.',
          analogy:
            'A `model` block is the committee\'s printed register layout: it names the book (`@@map("maganes")`), names each box (`@map`), numbers every line automatically (`@id @default(autoincrement())`), and files the whole book in the right cupboard drawer (`@@schema("pooja_register")`).',
          theory:
            'Prisma is a **schema-first ORM**: you describe your data once in `schema.prisma`, and Prisma generates both the SQL migrations and a fully typed TypeScript client. A `model` maps to a database table. Each model needs a primary key — here `id Int @id @default(autoincrement())`, the Postgres identity column that auto-numbers rows.\n\nPrisma\'s default is to name tables and columns exactly like your models and fields (PascalCase). That is ugly in raw SQL, so we map them: `@@map("maganes")` renames the table to snake_case, and `@map("coordinator_name")` renames a column. Your TypeScript stays clean (`magane.coordinatorName`) while the database stays conventional (`coordinator_name`).\n\nBecause this app uses Postgres **schemas** (namespaces inside one database), every model carries `@@schema("pooja_register")`, and the datasource declares `schemas = ["pooja_register"]` with the generator\'s `previewFeatures = ["multiSchema"]`. This keeps all temple tables grouped under one schema rather than the default `public`, which makes backups, permissions and future growth tidy.',
          whyItMatters:
            'These conventions are applied to all five models, so getting them right once means the whole Upralli Seva schema reads cleanly in both TypeScript and SQL. The `pooja_register` schema namespace is also what later migrations and SQL inspection will show, so understanding it now avoids confusion.',
          steps: [
            'Write a `model` block per entity (Magane, Year, PoojaType, PersonEntry, Participation).',
            'Give each an `id Int @id @default(autoincrement())` primary key.',
            'Add `@@map("snake_case_plural")` for the table name.',
            'Use `@map("snake_case")` on any field whose column should differ.',
            'Add `@@schema("pooja_register")` to every model.',
            'Declare `schemas = ["pooja_register"]` in the datasource and `previewFeatures = ["multiSchema"]` in the generator.',
          ],
          code:
            '// prisma/schema.prisma (top of file)\n' +
            'generator client {\n' +
            '  provider        = "prisma-client-js"\n' +
            '  previewFeatures = ["multiSchema"]\n' +
            '}\n' +
            '\n' +
            'datasource db {\n' +
            '  provider = "postgresql"\n' +
            '  url      = env("DATABASE_URL")\n' +
            '  schemas  = ["pooja_register"]\n' +
            '}\n' +
            '\n' +
            'model Magane {\n' +
            '  id   Int    @id @default(autoincrement())\n' +
            '  name String\n' +
            '  // ...more fields in the next section\n' +
            '  @@map("maganes")\n' +
            '  @@schema("pooja_register")\n' +
            '}',
          pitfalls: [
            '**Omitting `@@schema` on one model.** With multiSchema on, every model must declare its schema or Prisma errors. Fix: add `@@schema("pooja_register")` to all five.',
            '**Forgetting `previewFeatures = ["multiSchema"]`.** Postgres schemas are a preview feature; without it the `schemas` array is ignored. Fix: enable it in the generator.',
            '**Letting Prisma name tables PascalCase.** `"Magane"` and `"PersonEntry"` are awkward in SQL. Fix: `@@map` to snake_case plural.',
            '**Using `String @id` for keys.** Text keys are slower and error-prone here. Fix: `Int @id @default(autoincrement())`.',
            '**Mismatching `@map` names.** A typo in `@map` silently creates the wrong column. Fix: keep column names consistent and review the migration SQL.',
            '**Forgetting `DATABASE_URL` points at the local DB.** The url must reach the bundled embedded Postgres. Fix: set `DATABASE_URL` for the local DB before migrating.',
          ],
          tryIt:
            'Write the datasource + generator block enabling multiSchema and the `pooja_register` schema, then stub a `Year` model with an `id`, `@@map("years")` and `@@schema("pooja_register")`. Run `npx prisma format` and confirm it parses.',
          takeaway:
            'Each entity becomes a Prisma `model` with an autoincrement `id`, `@map`/`@@map` to snake_case, and `@@schema("pooja_register")` under multiSchema — clean TypeScript names over conventional SQL tables.',
        },
      ],
    },
    {
      id: 'm3-s2',
      title: 'The models in detail',
      topics: [
        {
          id: 'm3-t4',
          title: 'Magane — the global ward master with an array column',
          explain:
            'The `Magane` model holds one ward: a `sortOrder`, a Kannada `name`, an optional `coordinatorName`, a real array column `mobileNumbers String[]`, and `notes`.',
          analogy:
            'The Magane row is one line on the permanent village ward list: its position in the list (`sortOrder`), its Kannada name, who coordinates it, the phone numbers of that ward\'s contacts (often more than one — hence an array), and any remarks.',
          theory:
            'Magane is the one **global** model — no `yearId`. It carries `sortOrder Int @default(0)` so the committee can arrange wards in their customary order rather than by id. The `name` is Kannada text stored as UTF-8 (Postgres `text` handles Kannada natively). `coordinatorName String?` is optional — the `?` makes it nullable.\n\nThe interesting field is `mobileNumbers String[]` — a genuine **Postgres array column**. A ward often has several contact numbers, and rather than a separate table or a comma-joined string, Prisma maps `String[]` to Postgres\'s native `text[]`. You read and write it as a plain TypeScript array (`[\'9876543210\', \'9000011111\']`), and Postgres stores it as one array value.\n\nMagane also carries audit timestamps: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`, which Prisma fills automatically on insert and update. Finally, the back-relation `entries PersonEntry[]` lets you navigate from a ward to all its household entries across years — Prisma resolves which year via the PersonEntry\'s own `yearId`.',
          whyItMatters:
            'With 91 wards referenced by 2280 households, Magane is the backbone master. Storing multiple mobiles as a real array (not a fragile comma string) means the app can display and dial each contact cleanly, and `sortOrder` keeps the register in the committee\'s familiar arrangement.',
          steps: [
            'Give Magane an `id` and a `sortOrder Int @default(0)`.',
            'Add the Kannada `name String` (required) and `coordinatorName String?` (optional).',
            'Model multiple contacts with `mobileNumbers String[]` — a real array column.',
            'Add `notes String?` for free remarks.',
            'Add `createdAt`/`updatedAt` audit timestamps.',
            'Declare the back-relation `entries PersonEntry[]` plus `@@map`/`@@schema`.',
          ],
          code:
            'model Magane {\n' +
            '  id              Int      @id @default(autoincrement())\n' +
            '  sortOrder       Int      @default(0)\n' +
            '  name            String\n' +
            '  coordinatorName String?\n' +
            '  mobileNumbers   String[]\n' +
            '  notes           String?\n' +
            '  createdAt       DateTime @default(now())\n' +
            '  updatedAt       DateTime @updatedAt\n' +
            '  entries         PersonEntry[]\n' +
            '\n' +
            '  @@map("maganes")\n' +
            '  @@schema("pooja_register")\n' +
            '}',
          pitfalls: [
            '**Storing mobiles as one comma-joined string.** Splitting and validating it is fragile. Fix: use a real `String[]` array column.',
            '**Making `name` nullable.** A ward with no name is meaningless. Fix: keep `name String` required; only truly optional fields get `?`.',
            '**Adding a `yearId` to Magane.** That would wrongly scope the global master to a year. Fix: Magane has no year relation.',
            '**Forgetting `@updatedAt`.** Without it the timestamp never refreshes. Fix: `updatedAt DateTime @updatedAt`.',
            '**Storing phone numbers as `Int[]`.** Leading zeros and length are lost. Fix: `String[]`.',
            '**Ordering wards by `id`.** Insertion id is not the committee\'s order. Fix: sort by `sortOrder`.',
          ],
          tryIt:
            'Write the full `Magane` model. Then describe how you would insert a ward with two mobile numbers using `prisma.magane.create({ data: { name: ..., mobileNumbers: [\'...\', \'...\'] } })`.',
          takeaway:
            'Magane is the global ward master: ordered by `sortOrder`, named in Kannada, with a real `String[]` array for multiple mobiles and audit timestamps — and crucially no `yearId`.',
        },
        {
          id: 'm3-t5',
          title: 'Year — the lockable festival cycle',
          explain:
            'The `Year` model is one festival cycle: a unique integer `yearLabel`, an optional long Kannada `title`, and an `isLocked` flag that freezes its history.',
          analogy:
            'Year is the cover of one register book: the year printed on the spine (`yearLabel`, unique — no two 2025 books), a descriptive title in Kannada, and a seal stamp (`isLocked`) that, once applied, means "finalised — do not write in this book again".',
          theory:
            'A `Year` groups everything for one festival cycle. `yearLabel Int @unique` is the human year (2024, 2025); the `@unique` constraint guarantees the committee cannot accidentally create two registers for the same year. `title String?` holds a longer Kannada description (the festival\'s formal name), optional because the label alone is often enough.\n\n`isLocked Boolean @default(false)` is the history lock. New years start unlocked and editable; once the committee finalises the accounts they set it true, and the app refuses further edits to that year\'s poojas, entries and participations. This flag — combined with the snapshot model from Section 1 — is what keeps finished years frozen.\n\nYear owns two back-relations: `poojaTypes PoojaType[]` (that year\'s pooja columns) and `entries PersonEntry[]` (that year\'s households). Both child models carry the `yearId` foreign key and a relation back to Year, which we wire up next. Note Year does *not* relate to Magane — households connect the two.',
          whyItMatters:
            'The whole "snapshot per year" architecture hangs off this small model. `yearLabel @unique` prevents duplicate-year mistakes, and `isLocked` is the single switch that protects the committee\'s finalised ₹ totals from any later edit.',
          steps: [
            'Add `yearLabel Int @unique` for the human year, enforcing one register per year.',
            'Add an optional `title String?` for the longer Kannada festival name.',
            'Add `isLocked Boolean @default(false)` for the history lock.',
            'Declare back-relations `poojaTypes PoojaType[]` and `entries PersonEntry[]`.',
            'Map with `@@map("years")` and `@@schema("pooja_register")`.',
            'Decide where in app code the `isLocked` check guards writes.',
          ],
          code:
            'model Year {\n' +
            '  id         Int     @id @default(autoincrement())\n' +
            '  yearLabel  Int     @unique\n' +
            '  title      String?\n' +
            '  isLocked   Boolean @default(false)\n' +
            '  poojaTypes PoojaType[]\n' +
            '  entries    PersonEntry[]\n' +
            '\n' +
            '  @@map("years")\n' +
            '  @@schema("pooja_register")\n' +
            '}',
          pitfalls: [
            '**No `@unique` on `yearLabel`.** Two 2025 registers split the data silently. Fix: `yearLabel Int @unique`.',
            '**Storing the year as text.** `"2025"` cannot be range-filtered or ordered numerically. Fix: `Int`.',
            '**Defaulting `isLocked` to true.** New years would start frozen. Fix: `@default(false)`.',
            '**Relating Year directly to Magane.** Wards reach a year only through households. Fix: no Year-Magane relation; PersonEntry bridges them.',
            '**Trusting the UI alone to honour the lock.** A direct query could still edit a locked year. Fix: enforce `isLocked` in the main-process write path.',
            '**Putting per-year rates on Year.** Rates belong to PoojaType, not the year cover. Fix: keep Year lean; poojas carry rates.',
          ],
          tryIt:
            'Write the `Year` model, then sketch (in a comment) the guard clause your IPC handler would run before any write: load the year, and if `year.isLocked` throw "ವರ್ಷ ಲಾಕ್ ಆಗಿದೆ" (year is locked).',
          takeaway:
            'Year is the lockable festival cycle: a unique integer label prevents duplicates, an optional Kannada title describes it, and `isLocked` is the single flag that freezes a finished year\'s snapshot.',
        },
        {
          id: 'm3-t6',
          title: 'PoojaType — per-year pooja columns with Decimal rates',
          explain:
            'A `PoojaType` is one pooja in a given year: its `yearId` relation, Kannada `name`, `sortOrder`, a `showAsColumn` flag (grid column vs rate-only extra), and a `rate Decimal? @db.Decimal(12,2)`.',
          analogy:
            'PoojaType is one column heading in that year\'s register book — ಹೂವಿನ ಪೂಜೆ, ಮಂಗಳಾರತಿ, and so on. Some headings are full grid columns the committee ticks per household; others are rate-only extras tallied separately. Each heading has its place in the row (`sortOrder`) and its price (`rate`).',
          theory:
            'Each PoojaType belongs to exactly one year via `yearId Int` plus `year Year @relation(fields: [yearId], references: [id], onDelete: Cascade)`. The `onDelete: Cascade` means deleting a year removes its pooja columns — appropriate, since a year\'s poojas have no meaning without the year. The Kannada `name` is the heading text, and `sortOrder Int @default(0)` fixes the column order in the grid.\n\n`showAsColumn Boolean @default(true)` distinguishes the two kinds of pooja. A column pooja appears as a tickable column in the household grid (each household checks it or not). A rate-only "extra" (`showAsColumn = false`) is not a grid column — it is an additional charge tallied separately — so it has a rate but no per-household checkbox column. This single flag lets one model serve both.\n\nMoney is `rate Decimal? @db.Decimal(12,2)` — **never a float**. `@db.Decimal(12,2)` maps to Postgres `numeric(12,2)`, exact decimal arithmetic so ₹120.00 stays ₹120.00 and Σ totals reconcile to the paisa. It is nullable because some poojas may not have a fixed rate. A `@@unique([yearId, name])` constraint stops two poojas with the same name in one year, and `participations Participation[]` is the back-relation to the per-household ticks.',
          whyItMatters:
            'PoojaType is where the year\'s columns and their ₹ rates live, and where the money total Σ rate(ticked) begins. Using `Decimal` (not float) guarantees the committee\'s collection totals are exact, and `showAsColumn` cleanly separates grid poojas from rate-only extras without a second table.',
          steps: [
            'Add `yearId Int` and the `year` relation with `onDelete: Cascade`.',
            'Add the Kannada `name String` and `sortOrder Int @default(0)`.',
            'Add `showAsColumn Boolean @default(true)` to split grid columns from rate-only extras.',
            'Add `rate Decimal? @db.Decimal(12,2)` — exact money, never float.',
            'Enforce `@@unique([yearId, name])` so a name is unique within a year.',
            'Declare `participations Participation[]` plus `@@map`/`@@schema`.',
          ],
          code:
            'model PoojaType {\n' +
            '  id            Int      @id @default(autoincrement())\n' +
            '  yearId        Int\n' +
            '  year          Year     @relation(fields: [yearId], references: [id], onDelete: Cascade)\n' +
            '  name          String\n' +
            '  sortOrder     Int      @default(0)\n' +
            '  showAsColumn  Boolean  @default(true)\n' +
            '  rate          Decimal? @db.Decimal(12, 2)\n' +
            '  participations Participation[]\n' +
            '\n' +
            '  @@unique([yearId, name])\n' +
            '  @@map("pooja_types")\n' +
            '  @@schema("pooja_register")\n' +
            '}',
          pitfalls: [
            '**Using `Float` for `rate`.** Floats cannot hold ₹0.10 exactly; totals drift. Fix: `Decimal @db.Decimal(12,2)`.',
            '**Forgetting `@db.Decimal(12,2)`.** Bare `Decimal` may default to an unbounded numeric. Fix: pin precision and scale.',
            '**Omitting `@@unique([yearId, name])`.** Duplicate pooja names in one year confuse the grid and totals. Fix: add the composite unique.',
            '**A global `name` unique instead of per-year.** That would block reusing the same pooja name next year. Fix: scope the unique to `[yearId, name]`.',
            '**Treating rate-only extras as columns.** They flood the grid with empty checkboxes. Fix: `showAsColumn = false` keeps them out of the grid.',
            '**No `onDelete` on the year relation.** Orphaned pooja rows linger if a year is removed. Fix: `onDelete: Cascade`.',
          ],
          tryIt:
            'Write the `PoojaType` model, then list (in a comment) three default poojas for 2025 with Kannada names and rates — e.g. ಹೂವಿನ ಪೂಜೆ at ₹120 as a column, and one rate-only extra with `showAsColumn = false`.',
          takeaway:
            'PoojaType is the per-year pooja column: scoped to a year (cascade-deleted with it), ordered, uniquely named within the year, split into grid vs rate-only by `showAsColumn`, and priced with exact `Decimal` money.',
        },
        {
          id: 'm3-t7',
          title: 'PersonEntry — the household line in a year',
          explain:
            'A `PersonEntry` is one household line in a year\'s register: relations to its `yearId` and `maganeId`, a `serialNo`, a combined Kannada `name`, an optional `mobile`, an optional `kaalukanike` amount, and an index for fast listing.',
          analogy:
            'PersonEntry is one row in the register book under a ward\'s section: its line number (`serialNo`), the household\'s combined Kannada name-and-address, an optional contact mobile, and the kaalukanike (foot-offering) amount. It sits at the crossing of one year and one ward.',
          theory:
            'PersonEntry bridges the global master and the year. It carries two foreign keys: `yearId` with `year Year @relation(... onDelete: Cascade)` and `maganeId` with `magane Magane @relation(fields: [maganeId], references: [id])`. The year relation cascades (delete a year, delete its households); the Magane relation does **not** cascade — wards are a stable master and must not vanish when a household is touched.\n\nThe data fields reflect the real register. `serialNo Int @default(0)` is the household\'s position within its ward for the year. `name String` is a **combined Kannada name/address** — the committee writes the household name and address together as one field, matching the paper register. `mobile String?` is an optional single contact (distinct from the ward\'s `mobileNumbers` array). `kaalukanike Decimal? @db.Decimal(12,2)` is an optional offering amount — again exact `Decimal` money, never float. `notes String?` holds remarks.\n\nThe key performance feature is `@@index([yearId, maganeId])`. The register\'s most common query is "show ward W\'s households for year Y" — exactly this two-column lookup. The composite index makes listing a Magane within a Year fast even across 2280 households. The back-relation `participations Participation[]` reaches that household\'s per-pooja ticks.',
          whyItMatters:
            'PersonEntry is the busiest table — 2280 rows per year. The `@@index([yearId, maganeId])` directly serves the app\'s core screen (a ward\'s households in a year), and the non-cascading Magane relation protects the global ward master from accidental deletion when households change.',
          steps: [
            'Add `yearId` + `year` relation with `onDelete: Cascade`.',
            'Add `maganeId` + `magane` relation WITHOUT cascade (protect the master).',
            'Add `serialNo Int @default(0)` for the line order within the ward.',
            'Add the combined Kannada `name String` and optional `mobile String?`.',
            'Add `kaalukanike Decimal? @db.Decimal(12,2)` for the offering amount.',
            'Add `@@index([yearId, maganeId])` and declare `participations Participation[]`.',
          ],
          code:
            'model PersonEntry {\n' +
            '  id            Int      @id @default(autoincrement())\n' +
            '  yearId        Int\n' +
            '  year          Year     @relation(fields: [yearId], references: [id], onDelete: Cascade)\n' +
            '  maganeId      Int\n' +
            '  magane        Magane   @relation(fields: [maganeId], references: [id])\n' +
            '  serialNo      Int      @default(0)\n' +
            '  name          String\n' +
            '  mobile        String?\n' +
            '  kaalukanike   Decimal? @db.Decimal(12, 2)\n' +
            '  notes         String?\n' +
            '  participations Participation[]\n' +
            '\n' +
            '  @@index([yearId, maganeId])\n' +
            '  @@map("person_entries")\n' +
            '  @@schema("pooja_register")\n' +
            '}',
          pitfalls: [
            '**Cascading the Magane relation.** Then editing/deleting flows could wipe a ward. Fix: leave the magane relation WITHOUT `onDelete: Cascade`.',
            '**Splitting name and address into two columns.** The paper register combines them; splitting fights the source. Fix: one combined `name` field.',
            '**Using `Float` for `kaalukanike`.** Offering totals would drift. Fix: `Decimal @db.Decimal(12,2)`.',
            '**No index on [yearId, maganeId].** Listing a ward scans 2280 rows. Fix: `@@index([yearId, maganeId])`.',
            '**Reusing the ward\'s array `mobileNumbers` for the household.** A household\'s single contact is its own field. Fix: `mobile String?` on PersonEntry.',
            '**Sorting households by `id`.** Insertion order is not register order. Fix: order by `serialNo`.',
          ],
          tryIt:
            'Write the `PersonEntry` model, then write (in a comment) the Prisma query to list one ward\'s households for 2025 ordered by serial: `prisma.personEntry.findMany({ where: { yearId, maganeId }, orderBy: { serialNo: \'asc\' } })`.',
          takeaway:
            'PersonEntry is the household line: bridging a year (cascading) and a ward (non-cascading master), ordered by `serialNo`, holding a combined Kannada name and exact `Decimal` kaalukanike, and indexed on `[yearId, maganeId]` for fast ward listing.',
        },
        {
          id: 'm3-t8',
          title: 'Participation — the per-household pooja checkbox',
          explain:
            'A `Participation` is one checkbox: it joins a `personEntryId` to a `poojaTypeId` with a `checked Boolean`, both relations cascading, and a unique pair so a household ticks each pooja at most once.',
          analogy:
            'Participation is a single tick in the register grid — the cell where one household\'s row crosses one pooja\'s column. The `checked` value is whether that cell is ticked. The unique pair guarantees there is only ever one cell per (household, pooja) crossing.',
          theory:
            'Participation resolves the many-to-many between households and poojas into one row per intersection. It carries `personEntryId` with `personEntry PersonEntry @relation(... onDelete: Cascade)` and `poojaTypeId` with `poojaType PoojaType @relation(... onDelete: Cascade)`. The single payload is `checked Boolean @default(false)` — ticked or not.\n\nIt **cascades from both parents**. Deleting a household removes its ticks; deleting a pooja column removes that column\'s ticks. This is safe because a Participation has no meaning without both its household and its pooja — it is pure join data, not a record anyone references. (Contrast PersonEntry, which references the Magane master *without* cascade, because the master outlives any one household.)\n\nThe `@@unique([personEntryId, poojaTypeId])` constraint is essential: it guarantees one checkbox per (household, pooja) pair, so the grid never shows two conflicting ticks for the same cell. This also enables a clean **upsert**: when a clerk toggles a cell, the app upserts on that unique pair — insert a new tick or update the existing one — rather than risking duplicates.',
          whyItMatters:
            'Participation is the heart of the money calculation: the ₹ total is Σ rate over every PoojaType where `checked` is true for a household. The unique-pair constraint keeps that sum correct (no double-counting), and dual cascade keeps the grid tidy when years are cloned or poojas removed.',
          steps: [
            'Add `personEntryId` + relation with `onDelete: Cascade`.',
            'Add `poojaTypeId` + relation with `onDelete: Cascade`.',
            'Add `checked Boolean @default(false)` as the tick value.',
            'Enforce `@@unique([personEntryId, poojaTypeId])` — one cell per crossing.',
            'Use that unique pair as the target of an upsert when toggling a cell.',
            'Map with `@@map("participations")` and `@@schema("pooja_register")`.',
          ],
          code:
            'model Participation {\n' +
            '  id            Int         @id @default(autoincrement())\n' +
            '  personEntryId Int\n' +
            '  personEntry   PersonEntry @relation(fields: [personEntryId], references: [id], onDelete: Cascade)\n' +
            '  poojaTypeId   Int\n' +
            '  poojaType     PoojaType   @relation(fields: [poojaTypeId], references: [id], onDelete: Cascade)\n' +
            '  checked       Boolean     @default(false)\n' +
            '\n' +
            '  @@unique([personEntryId, poojaTypeId])\n' +
            '  @@map("participations")\n' +
            '  @@schema("pooja_register")\n' +
            '}',
          pitfalls: [
            '**No `@@unique([personEntryId, poojaTypeId])`.** Duplicate ticks double-count a pooja in the ₹ total. Fix: add the composite unique.',
            '**Cascading from only one parent.** Removing a pooja column then orphans its ticks. Fix: `onDelete: Cascade` on BOTH relations.',
            '**Storing the rate on Participation.** The rate belongs to PoojaType; copying it here goes stale. Fix: join to PoojaType for the rate at total time.',
            '**Inserting a new row on every toggle.** Without upsert you accumulate duplicates. Fix: upsert on the unique pair.',
            '**Making `checked` nullable.** A three-state checkbox confuses the grid. Fix: `Boolean @default(false)`.',
            '**Treating Participation like a referenced record.** Nothing points at it, so cascade is safe. Fix: let it cascade freely from both parents.',
          ],
          tryIt:
            'Write the `Participation` model, then sketch (in a comment) the toggle upsert: `prisma.participation.upsert({ where: { personEntryId_poojaTypeId: { personEntryId, poojaTypeId } }, create: { ..., checked: true }, update: { checked } })`.',
          takeaway:
            'Participation is the grid checkbox: a join row of `(personEntryId, poojaTypeId, checked)` that cascades from both parents and is unique per pair — the foundation of the Σ rate(ticked) money total.',
        },
      ],
    },
    {
      id: 'm3-s3',
      title: 'Migrations, relations & integrity',
      topics: [
        {
          id: 'm3-t9',
          title: 'The first migration — generating and reading the SQL',
          explain:
            '`prisma migrate dev` turns your `schema.prisma` into a real, versioned SQL migration that creates the `pooja_register` schema and all five tables in the local Postgres.',
          analogy:
            'A migration is the dated, signed minute-book entry that records exactly what changed in the committee\'s records structure. `migrate dev` writes that entry (a `.sql` file), applies it, and stamps it — so the database\'s history is auditable, not a mystery.',
          theory:
            'Once `schema.prisma` describes the five models, `npx prisma migrate dev --name init` does three things: it generates a timestamped folder under `prisma/migrations/` containing a `migration.sql`, applies that SQL to your `DATABASE_URL` database, and regenerates the typed Prisma Client. The SQL is plain Postgres DDL you can — and should — read.\n\nBecause of multiSchema, the generated SQL begins with `CREATE SCHEMA IF NOT EXISTS "pooja_register";` and every `CREATE TABLE` is qualified, e.g. `CREATE TABLE "pooja_register"."maganes" (...)`. You will see the identity columns, the `text[]` for `mobileNumbers`, the `numeric(12,2)` for `rate` and `kaalukanike`, and the foreign-key and unique-constraint statements at the end. Reading this confirms Prisma produced what you intended.\n\nFor the offline Upralli Seva app the `DATABASE_URL` points at the **bundled embedded Postgres** under `%LOCALAPPDATA%\\UpralliSeva`. In development you run `migrate dev` against that local instance; in a shipped build the app applies the already-committed migrations on first run with `prisma migrate deploy`. Either way, the migration files are the source of truth for the schema\'s history.',
          whyItMatters:
            'Migrations make the schema reproducible and auditable: any committee machine reaches the exact same `pooja_register` structure by replaying the same files. Reading the generated SQL is also the surest way to catch a wrong type (a float that should be numeric) before data is entered.',
          steps: [
            'Set `DATABASE_URL` to the local embedded Postgres instance.',
            'Run `npx prisma migrate dev --name init`.',
            'Open `prisma/migrations/<timestamp>_init/migration.sql` and read it.',
            'Confirm `CREATE SCHEMA "pooja_register"` and schema-qualified tables.',
            'Check `text[]`, `numeric(12,2)`, FKs and unique constraints are present.',
            'Commit the migration folder so every machine replays identical SQL.',
          ],
          code:
            '# generate + apply the first migration against local Postgres\n' +
            'npx prisma migrate dev --name init\n' +
            '\n' +
            '-- excerpt of the generated migration.sql:\n' +
            'CREATE SCHEMA IF NOT EXISTS "pooja_register";\n' +
            '\n' +
            'CREATE TABLE "pooja_register"."maganes" (\n' +
            '    "id"             SERIAL NOT NULL,\n' +
            '    "sortOrder"      INTEGER NOT NULL DEFAULT 0,\n' +
            '    "name"           TEXT NOT NULL,\n' +
            '    "mobileNumbers"  TEXT[],\n' +
            '    CONSTRAINT "maganes_pkey" PRIMARY KEY ("id")\n' +
            ');',
          pitfalls: [
            '**Editing the database by hand instead of via migrations.** The migration history then lies. Fix: change `schema.prisma` and run `migrate dev`.',
            '**Not reading the generated SQL.** A wrong type slips through silently. Fix: open `migration.sql` and verify numeric/text[]/FKs.',
            '**Forgetting multiSchema before the first migrate.** The SQL lands in `public`, not `pooja_register`. Fix: enable multiSchema and set `@@schema` first.',
            '**Running `migrate dev` in production.** It can prompt and reset. Fix: ship migrations and run `migrate deploy` on first run.',
            '**Not committing the migrations folder.** Other machines diverge. Fix: commit `prisma/migrations`.',
            '**Wrong `DATABASE_URL`.** Migrating the wrong database. Fix: point it at the local embedded Postgres path.',
          ],
          tryIt:
            'Run `npx prisma migrate dev --name init` against a local Postgres, then open the generated `migration.sql`. Find the `CREATE SCHEMA` line and the `numeric(12,2)` columns, and confirm the five tables are all schema-qualified.',
          takeaway:
            '`prisma migrate dev` generates versioned SQL that creates the `pooja_register` schema and five tables; reading that SQL confirms your types and relations, and the committed files make the schema reproducible everywhere.',
        },
        {
          id: 'm3-t10',
          title: 'Foreign keys: cascade vs restrict, and why each was chosen',
          explain:
            'Each relation declares what happens when a parent is deleted. Participation cascades from both parents; PersonEntry cascades from Year but references Magane WITHOUT cascade.',
          analogy:
            'Cascade is "when this register book is shredded, shred its loose ticket slips too". Restrict (no cascade) is "you may not shred the master ward list just because one household line was touched". The committee shreds what is meaningless alone, and protects the masters everyone depends on.',
          theory:
            '`onDelete` controls the referential action. **Cascade** deletes the children when the parent goes. **No cascade** (Prisma\'s default for a required relation is restrictive) blocks the parent delete while children exist, protecting the parent. Choosing per relation is a deliberate integrity decision.\n\nIn Upralli Seva: Participation cascades from **both** PersonEntry and PoojaType, because a tick is pure join data — meaningless without either parent, and nothing references it. So removing a household or a pooja column cleanly sweeps away its ticks. PoojaType and PersonEntry both cascade from **Year**, because a year\'s poojas and households have no life outside that year; deleting a year (rare, but possible before lock) should remove its whole snapshot.\n\nBut PersonEntry references **Magane without cascade**. Magane is the global master shared across years; a household must not be able to delete a ward, and removing a household must never touch the ward. Keeping that relation non-cascading means the 91-ward master is protected — you cannot accidentally orphan or delete it through household operations. This asymmetry (cascade down the year-scoped tree, restrict toward the global master) is the integrity backbone of the whole schema.',
          whyItMatters:
            'These choices decide what survives a delete. Cascade keeps the year-scoped snapshot self-cleaning, while the non-cascading Magane relation guards the master 91 wards 2280 households depend on. Get one wrong and you either orphan ticks or risk wiping the ward list.',
          steps: [
            'For Participation, set `onDelete: Cascade` on BOTH parent relations.',
            'For PoojaType and PersonEntry, cascade from `Year` (snapshot belongs to the year).',
            'For PersonEntry to Magane, leave the relation WITHOUT `onDelete: Cascade`.',
            'Understand the default for a required relation is restrictive (parent delete blocked).',
            'Verify in the generated SQL: `ON DELETE CASCADE` vs `ON DELETE RESTRICT`.',
            'Decide deletes flow DOWN the year tree, never UP toward the global master.',
          ],
          code:
            '// Cascade DOWN the year-scoped tree:\n' +
            'year      Year   @relation(fields: [yearId], references: [id], onDelete: Cascade)\n' +
            '\n' +
            '// Cascade from BOTH parents on the join row:\n' +
            'personEntry PersonEntry @relation(fields: [personEntryId], references: [id], onDelete: Cascade)\n' +
            'poojaType   PoojaType   @relation(fields: [poojaTypeId],   references: [id], onDelete: Cascade)\n' +
            '\n' +
            '// RESTRICT toward the global master (no cascade):\n' +
            'magane    Magane @relation(fields: [maganeId], references: [id])\n' +
            '// deleting a household never deletes its ward; a ward in use cannot be removed',
          pitfalls: [
            '**Cascading PersonEntry -> Magane.** A household delete could wipe a ward. Fix: leave that relation non-cascading.',
            '**Not cascading Participation from PoojaType.** Removing a pooja column orphans its ticks. Fix: cascade from both parents.',
            '**Cascading from Magane down to households "for symmetry".** Deleting a ward would erase years of household data. Fix: protect the master; do not cascade from it.',
            '**Relying on app code to clean up children.** Easy to forget a table. Fix: let the database cascade where it is safe.',
            '**Ignoring the generated `ON DELETE` clause.** You assume a behaviour you did not get. Fix: read the FK lines in `migration.sql`.',
            '**Allowing a year delete while locked.** Cascade would erase finalised history. Fix: block deleting a locked year in app code.',
          ],
          tryIt:
            'In the generated `migration.sql`, find the foreign-key for `person_entries.maganeId` and for `participations.personEntryId`. Confirm one is `ON DELETE RESTRICT`/`NO ACTION` and the other is `ON DELETE CASCADE`, and explain why each fits.',
          takeaway:
            'Deletes cascade DOWN the year-scoped tree (Year -> poojas/entries -> participations) but are RESTRICTED toward the global Magane master — so snapshots self-clean while the shared ward list stays protected.',
        },
        {
          id: 'm3-t11',
          title: 'Unique constraints & indexes for the register\'s access patterns',
          explain:
            'The schema\'s uniques and indexes are chosen for how the register is actually read and written: one pooja name per year, one tick per cell, and fast listing of a ward within a year.',
          analogy:
            'A unique constraint is the committee rule "no two columns may share a heading in one book, and no cell may be ticked twice". An index is the tab-divider that lets the clerk flip straight to a ward\'s section instead of leafing through 2280 lines.',
          theory:
            'Constraints encode the committee\'s rules at the database level. `@@unique([yearId, name])` on PoojaType stops duplicate pooja headings within a year (while still allowing the same name next year). `@@unique([personEntryId, poojaTypeId])` on Participation guarantees exactly one checkbox per (household, pooja) cell — the rule that keeps the ₹ total honest. `yearLabel @unique` on Year stops two registers for the same year. Uniques are enforced by Postgres, so even a buggy insert cannot violate them.\n\nIndexes serve the read patterns. The register\'s signature query is "list ward W\'s households for year Y, in serial order", so `@@index([yearId, maganeId])` on PersonEntry makes that lookup fast across 2280 rows. Unique constraints double as indexes too, so the Participation upsert (lookup by the unique pair) is already fast.\n\nThe guiding principle: index what you filter and join on, constrain what must stay unique. You add the composite `[yearId, maganeId]` index because the app filters on exactly those two columns together; you would not index columns you never query by, since every index costs a little on each write. For Upralli Seva the read-heavy ward listing clearly earns its index.',
          whyItMatters:
            'With 2280 households per year, the difference between a scan and an indexed lookup is a snappy ward screen versus a sluggish one. And the unique constraints are the safety net that makes the money total correct by construction — no duplicate poojas, no double-ticked cells.',
          steps: [
            'Enforce one pooja name per year with `@@unique([yearId, name])`.',
            'Enforce one tick per cell with `@@unique([personEntryId, poojaTypeId])`.',
            'Enforce one register per year with `yearLabel @unique`.',
            'Speed the core ward listing with `@@index([yearId, maganeId])`.',
            'Rely on unique constraints doubling as indexes for upsert lookups.',
            'Index only the columns you actually filter/join on — avoid needless indexes.',
          ],
          code:
            '// uniques = committee rules, enforced by Postgres\n' +
            'model Year {\n' +
            '  yearLabel Int @unique            // one register per year\n' +
            '}\n' +
            'model PoojaType {\n' +
            '  @@unique([yearId, name])         // no duplicate pooja headings in a year\n' +
            '}\n' +
            'model Participation {\n' +
            '  @@unique([personEntryId, poojaTypeId])  // one checkbox per cell\n' +
            '}\n' +
            '// index = fast access for the signature query\n' +
            'model PersonEntry {\n' +
            '  @@index([yearId, maganeId])      // list a ward within a year quickly\n' +
            '}',
          pitfalls: [
            '**Indexing every column "just in case".** Each index slows writes and bloats the DB. Fix: index only filtered/joined columns.',
            '**A single-column unique where a composite is needed.** `name @unique` blocks reusing a pooja name next year. Fix: `@@unique([yearId, name])`.',
            '**No unique on the Participation pair.** Double ticks corrupt the ₹ total. Fix: `@@unique([personEntryId, poojaTypeId])`.',
            '**Indexing `[maganeId, yearId]` in the wrong order.** Order matters; lead with the column you always filter by. Fix: match the query — `[yearId, maganeId]`.',
            '**Assuming a unique is also a filter index when it is not.** Verify the composite covers your query. Fix: add an explicit `@@index` if the access pattern differs.',
            '**Relying on app checks instead of DB uniques.** A race can still insert a duplicate. Fix: enforce uniqueness in the schema.',
          ],
          tryIt:
            'List the three unique constraints and the one composite index in the schema, and for each write the exact committee rule or query it serves. Then name one column you deliberately did NOT index, and why.',
          takeaway:
            'Constrain what must stay unique (one register per year, one pooja name per year, one tick per cell) and index what you filter on (a ward within a year) — these choices make the register both correct and fast at 2280 households.',
        },
        {
          id: 'm3-t12',
          title: 'Decimal vs Float for ₹ — and the IPC boundary',
          explain:
            'Money is `Decimal @db.Decimal(12,2)`, never float. But Prisma surfaces `Decimal` as a special object in TypeScript, which must be converted to a plain `number` before crossing the IPC boundary to the renderer.',
          analogy:
            'The accountant tallies in exact rupees and paisa (Decimal). But the notice board at the front window can only show plain numbers. So the office converts the exact figure to a clean printed number *as it hands it over the counter* — that handover is the IPC boundary.',
          theory:
            'The rupee rule is absolute: `rate` and `kaalukanike` are `Decimal @db.Decimal(12,2)` (Postgres `numeric(12,2)`), exact decimal arithmetic so Σ rate(ticked) totals reconcile to the paisa. `Float` cannot represent 0.10 exactly and totals would drift — never use it for money.\n\nThe wrinkle is how `Decimal` appears in TypeScript. Prisma returns money fields as `Prisma.Decimal` objects (backed by decimal.js), not JS numbers — precisely so arithmetic stays exact in the main process. You can sum them safely with `Decimal` methods. But these objects do **not** survive Electron\'s IPC serialisation cleanly: structured-clone turns them into something the renderer cannot use as a number.\n\nSo the rule at the boundary is: do exact `Decimal` math in **main**, then map each money value to a plain `number` (e.g. `rate.toNumber()`) in the typed object you return over `window.api`. The renderer receives plain numbers it formats with Indian grouping (₹1,20,000). Keep the precise `Decimal` for any calculation that must be exact, and convert only at the very edge — the IPC handover — so you never do money arithmetic in floating-point.',
          whyItMatters:
            'This is where exact money meets a UI that speaks plain numbers. Doing the Σ in `Decimal` in main keeps the committee\'s totals exact; converting at the IPC edge gives the React grid clean numbers to format — without ever letting a float touch a rupee mid-calculation.',
          steps: [
            'Declare every money field `Decimal? @db.Decimal(12,2)` — never `Float`.',
            'Do the Σ rate(ticked) total in the MAIN process using `Decimal` math.',
            'Just before returning over IPC, call `.toNumber()` on each money value.',
            'Type the IPC payload so money fields are `number`, not `Decimal`.',
            'Format with Indian grouping in the renderer (₹1,20,000).',
            'Never perform money arithmetic in the renderer or in floating-point.',
          ],
          code:
            '// MAIN process: exact Decimal math, then convert at the boundary\n' +
            "import { Prisma } from '@prisma/client';\n" +
            '\n' +
            'function householdTotal(\n' +
            '  rows: { checked: boolean; poojaType: { rate: Prisma.Decimal | null } }[],\n' +
            '): number {\n' +
            '  const sum = rows.reduce((acc, p) => {\n' +
            '    if (p.checked && p.poojaType.rate) return acc.plus(p.poojaType.rate);\n' +
            '    return acc;\n' +
            '  }, new Prisma.Decimal(0));\n' +
            '  return sum.toNumber(); // plain number crosses IPC to the renderer\n' +
            '}',
          pitfalls: [
            '**Using `Float` for money.** ₹0.10 is inexact; totals drift. Fix: `Decimal @db.Decimal(12,2)`.',
            '**Returning a raw `Decimal` over IPC.** It does not serialise to a usable number. Fix: `.toNumber()` at the boundary.',
            '**Summing money with `+` on Decimal objects.** That coerces to string/NaN. Fix: use `.plus()` / `Decimal` math.',
            '**Converting to number too early, then summing.** You reintroduce float drift. Fix: keep `Decimal` until after the Σ.',
            '**Formatting with default grouping.** `1,200,00` looks wrong for ₹. Fix: use Indian grouping (`1,20,000`).',
            '**Doing the total in the renderer.** Pushes money math into the UI. Fix: compute in main, send the final number.',
          ],
          tryIt:
            'Write a main-process function that sums ticked poojas\' rates with `Prisma.Decimal`, returns `.toNumber()`, and (in a comment) shows formatting 120000 as ₹1,20,000 with `Intl.NumberFormat(\'en-IN\')`.',
          takeaway:
            'Keep money exact with `Decimal @db.Decimal(12,2)` and do the Σ in `Decimal` in main, then map to a plain `number` right at the IPC boundary so the renderer formats clean Indian-grouped rupees — a float never touches the calculation.',
        },
        {
          id: 'm3-t13',
          title: 'Seeding a first year and carrying columns forward on clone',
          explain:
            'A seed script populates an empty database with a first Year and its default poojas; the same copy-forward logic powers cloning a year, carrying the per-year pooja columns into the next year.',
          analogy:
            'Seeding is opening the very first register book and printing its standard column headings before anyone arrives. Cloning is opening next year\'s book by copying this year\'s headings and households forward — the committee then edits the copies, leaving the old book untouched.',
          theory:
            'A fresh install has tables but no data. A **seed script** (run with `prisma db seed`) inserts the starting rows: one `Year` (2025), its default `PoojaType`s (ಹೂವಿನ ಪೂಜೆ etc., with rates and `showAsColumn`), and optionally a sample Magane and a couple of households. Prisma\'s nested `create` lets you build a year with its poojas in one call, and `createMany` is handy for bulk default poojas.\n\nThe same shape drives **cloning a year**. To start 2026 you read 2025\'s PoojaTypes and PersonEntries, then insert new rows with `yearId` set to the new year — copying names, `sortOrder`, `showAsColumn` and `rate` forward as the starting point. Magane ids are reused unchanged (the global master). Participations are typically created blank for the new year (every checkbox starts unticked) or carried over per the committee\'s preference. Because clone produces fresh rows, the locked previous year is never touched.\n\nThe practical guard: seeding should be **idempotent or guarded** — only seed when the year does not already exist (`yearLabel` is unique), so re-running does not duplicate the 2025 register. The seed proves the relations work end to end: a year with poojas, households in a ward, and ticks that sum to a ₹ total.',
          whyItMatters:
            'Committee staff are not DBAs; the app must arrive usable. Seeding gives a ready first year with sensible default poojas, and the carry-forward clone means starting 2026 does not mean retyping 91 wards of poojas — it copies them, which is exactly the snapshot model paying off.',
          steps: [
            'Write `prisma/seed.ts` and wire it in `package.json` under `prisma.seed`.',
            'Guard on `yearLabel` so seeding an existing year is a no-op.',
            'Create Year 2025 with nested default PoojaTypes (Kannada names + rates + `showAsColumn`).',
            'Add a sample Magane and a couple of Kannada households (PersonEntry).',
            'Create a few Participations and verify the ₹ total sums correctly.',
            'Reuse the copy-forward logic to clone a year into the next `yearId`.',
          ],
          code:
            '// prisma/seed.ts (runs in main/Node, never the renderer)\n' +
            "import { PrismaClient } from '@prisma/client';\n" +
            'const prisma = new PrismaClient();\n' +
            '\n' +
            'async function main() {\n' +
            '  const exists = await prisma.year.findUnique({ where: { yearLabel: 2025 } });\n' +
            '  if (exists) return; // idempotent: do not re-seed\n' +
            '\n' +
            '  await prisma.year.create({\n' +
            '    data: {\n' +
            '      yearLabel: 2025,\n' +
            "      title: '2025 ವಾರ್ಷಿಕ ಸೇವೆ',\n" +
            '      poojaTypes: {\n' +
            '        create: [\n' +
            "          { name: 'ಹೂವಿನ ಪೂಜೆ',   sortOrder: 1, rate: 120.0 },\n" +
            "          { name: 'ಮಂಗಳಾರತಿ',    sortOrder: 2, rate: 50.0 },\n" +
            "          { name: 'ವಿಶೇಷ ಕಾಣಿಕೆ', sortOrder: 3, showAsColumn: false, rate: 0.0 },\n" +
            '        ],\n' +
            '      },\n' +
            '    },\n' +
            '  });\n' +
            '}\n' +
            'main().finally(() => prisma.$disconnect());',
          pitfalls: [
            '**Non-idempotent seeding.** Re-running duplicates the 2025 register. Fix: guard on the unique `yearLabel`.',
            '**Seeding poojas globally instead of under a year.** Breaks the snapshot model. Fix: nest poojas under the Year `create`.',
            '**Cloning by mutating last year\'s rows.** Erases history. Fix: INSERT new rows with the new `yearId`.',
            '**Copying Magane rows on clone.** Duplicates the global master. Fix: reuse the same Magane ids.',
            '**Running the seed from the renderer.** Prisma must stay in main/Node. Fix: run via `prisma db seed` / main only.',
            '**Forgetting to carry rates/showAsColumn forward.** Next year starts blank and staff retype everything. Fix: copy those fields in the clone.',
          ],
          tryIt:
            'Write a guarded `seed.ts` that creates Year 2025 with three default poojas (one rate-only), one Magane, and two Kannada households. Then describe (in a comment) the `cloneYear(fromLabel, toLabel)` function that copies poojaTypes forward into a new `yearId`.',
          takeaway:
            'Seeding fills an empty DB with a first year and default poojas (guarded by the unique `yearLabel`); the same copy-forward logic clones a year, carrying pooja columns into the next year while reusing the global Magane master and leaving locked history untouched.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm3-p1',
      type: 'Project',
      title: 'Author the schema',
      domain: 'Temple pooja register (Upralli Seva)',
      duration: '4-5 hours',
      description:
        'Write the complete `schema.prisma` for Upralli Seva — all five models (Magane, Year, PoojaType, PersonEntry, Participation), the `pooja_register` schema under multiSchema, every relation with the correct `onDelete`, the unique constraints and the `[yearId, maganeId]` index, and `Decimal(12,2)` money. Run `prisma migrate dev` and inspect the generated SQL.',
      tools: ['Prisma 5', 'PostgreSQL (local embedded)', 'TypeScript', 'Prisma CLI', 'Electron (main process)'],
      blueprint: {
        overview:
          'You will produce the real, complete Prisma schema that the rest of Upralli Seva builds on. It declares the datasource and generator with multiSchema and the `pooja_register` schema, models all five entities with their fields and Kannada-friendly text, wires the relations with deliberate cascade/restrict choices, adds the unique constraints and the ward-listing index, and uses exact `Decimal(12,2)` for every rupee. You then generate the first migration and read its SQL to confirm the schema is exactly what you designed.',
        functionalRequirements: [
          'Declare a `postgresql` datasource with `schemas = ["pooja_register"]` and a generator with `previewFeatures = ["multiSchema"]`.',
          'Define all five models with `@@map` snake_case tables, `@@schema("pooja_register")`, and autoincrement ids.',
          'Wire relations with the correct `onDelete`: cascade down the year tree and from both Participation parents; restrict PersonEntry -> Magane.',
          'Add `yearLabel @unique`, `@@unique([yearId, name])`, `@@unique([personEntryId, poojaTypeId])` and `@@index([yearId, maganeId])`.',
          'Use `Decimal? @db.Decimal(12,2)` for `rate` and `kaalukanike`, and `String[]` for `mobileNumbers`.',
        ],
        technicalImplementation: [
          'Set `DATABASE_URL` to the local embedded Postgres instance under `%LOCALAPPDATA%\\UpralliSeva` before migrating.',
          'Write `prisma/schema.prisma` faithfully reproducing the five models and their attributes.',
          'Run `npx prisma format` to validate, then `npx prisma migrate dev --name init` to generate and apply.',
          'Open the generated `migration.sql` and verify `CREATE SCHEMA`, `numeric(12,2)`, `text[]`, FKs and `ON DELETE` clauses.',
          'Commit the `prisma/migrations` folder so every committee machine replays identical SQL.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Datasource, generator and the global Magane + Year',
            outcome: 'A valid schema head with multiSchema and the global Magane master plus the lockable Year.',
            prompt:
              'Write the top of a Prisma 5 `schema.prisma` for an offline Electron + Postgres app: a `prisma-client-js` generator with `previewFeatures = ["multiSchema"]`, and a `postgresql` datasource using `env("DATABASE_URL")` with `schemas = ["pooja_register"]`. Then write a `Magane` model (global, no yearId) with `id Int @id @default(autoincrement())`, `sortOrder Int @default(0)`, Kannada `name String`, `coordinatorName String?`, `mobileNumbers String[]`, `notes String?`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, a back-relation `entries PersonEntry[]`, plus `@@map("maganes")` and `@@schema("pooja_register")`. Write a `Year` model with `yearLabel Int @unique`, `title String?`, `isLocked Boolean @default(false)`, back-relations `poojaTypes PoojaType[]` and `entries PersonEntry[]`, and the same `@@map`/`@@schema`. Explain why Magane is global but Year scopes everything else.',
          },
          {
            step: 2,
            label: 'PoojaType, PersonEntry and Participation with relations',
            outcome: 'The three year-scoped models with deliberate cascade/restrict choices, uniques and the index.',
            prompt:
              'Continue the schema with three models, all `@@schema("pooja_register")`. `PoojaType`: `id`, `yearId Int`, `year Year @relation(fields:[yearId], references:[id], onDelete: Cascade)`, Kannada `name String`, `sortOrder Int @default(0)`, `showAsColumn Boolean @default(true)`, `rate Decimal? @db.Decimal(12,2)`, back-relation `participations Participation[]`, `@@unique([yearId, name])`, `@@map("pooja_types")`. `PersonEntry`: `id`, `yearId Int` + `year` relation `onDelete: Cascade`, `maganeId Int` + `magane Magane @relation(fields:[maganeId], references:[id])` WITHOUT cascade, `serialNo Int @default(0)`, combined Kannada `name String`, `mobile String?`, `kaalukanike Decimal? @db.Decimal(12,2)`, `notes String?`, `participations Participation[]`, `@@index([yearId, maganeId])`, `@@map("person_entries")`. `Participation`: `id`, `personEntryId Int` + relation `onDelete: Cascade`, `poojaTypeId Int` + relation `onDelete: Cascade`, `checked Boolean @default(false)`, `@@unique([personEntryId, poojaTypeId])`, `@@map("participations")`. For each relation, add a one-line comment on why it cascades or restricts.',
          },
          {
            step: 3,
            label: 'Migrate and read the generated SQL',
            outcome: 'The first migration is generated and applied, and its SQL is verified against the design.',
            prompt:
              'Show the commands to validate and apply this schema against a local Postgres: `npx prisma format`, then `npx prisma migrate dev --name init`. Then walk through the generated `prisma/migrations/<timestamp>_init/migration.sql`: point out the `CREATE SCHEMA IF NOT EXISTS "pooja_register"`, the schema-qualified `CREATE TABLE` statements, the `numeric(12,2)` money columns, the `text[]` for `mobileNumbers`, the `@@unique` constraints, the `@@index`, and the foreign-key `ON DELETE CASCADE` vs `ON DELETE RESTRICT`/`NO ACTION` lines. Confirm the PersonEntry -> Magane FK is the restricted one. Note these commands must run from Node/main tooling, never the renderer.',
          },
        ],
      },
    },
    {
      id: 'm3-p2',
      type: 'Project',
      title: 'Seed a year',
      domain: 'Temple pooja register (Upralli Seva)',
      duration: '4-5 hours',
      description:
        'Write a guarded `seed.ts` that brings an empty database to life: Year 2025 with its default pooja types (ಹೂವಿನ ಪೂಜೆ etc., with rates and a rate-only extra), one sample Magane, a couple of Kannada households, and their participations — then compute a household ₹ total to prove every relation works end to end.',
      tools: ['Prisma 5', 'PostgreSQL (local embedded)', 'TypeScript', 'Prisma Client', 'Node.js (main process)'],
      blueprint: {
        overview:
          'You will write the seed that makes a fresh Upralli Seva install usable: a first Year with sensible default poojas, a ward, sample households, and ticks. The seed is idempotent (guarded on the unique `yearLabel`), uses nested `create` to build a year with its poojas in one call, and finishes by summing one household\'s ticked rates with `Decimal` to prove the snapshot relations and money math are correct. You will also sketch the copy-forward clone that reuses this exact shape to open next year.',
        functionalRequirements: [
          'Create Year 2025 with a Kannada `title` and default PoojaTypes (with Kannada names, rates, and one `showAsColumn: false` extra).',
          'Create one sample Magane and at least two Kannada households (PersonEntry) under year 2025.',
          'Create Participations ticking some poojas for those households.',
          'Guard the seed on `yearLabel` so re-running it is a safe no-op (idempotent).',
          'Compute and log one household\'s ₹ total as Σ rate over ticked poojas, using `Decimal`.',
        ],
        technicalImplementation: [
          'Use `PrismaClient` in `prisma/seed.ts`, wired via `package.json` `prisma.seed` and run with `prisma db seed` (Node/main only).',
          'Check `prisma.year.findUnique({ where: { yearLabel: 2025 } })` and return early if it exists.',
          'Build the year with nested `poojaTypes.create`, then create Magane and PersonEntries referencing `yearId`/`maganeId`.',
          'Create Participations and read them back with the related `poojaType.rate` to sum the total.',
          'Sum with `Prisma.Decimal` and `.toNumber()` at the end; format with `Intl.NumberFormat(\'en-IN\')`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Idempotent Year 2025 with default poojas',
            outcome: 'A guarded seed that creates Year 2025 and its default pooja columns once.',
            prompt:
              'Write `prisma/seed.ts` using `PrismaClient`. First check `prisma.year.findUnique({ where: { yearLabel: 2025 } })` and `return` early if it exists, so the seed is idempotent. Otherwise create Year 2025 with `title: \'2025 ವಾರ್ಷಿಕ ಸೇವೆ\'` and nested `poojaTypes.create` for: ಹೂವಿನ ಪೂಜೆ (sortOrder 1, rate 120.00), ಮಂಗಳಾರತಿ (sortOrder 2, rate 50.00), and a rate-only extra ವಿಶೇಷ ಕಾಣಿಕೆ (sortOrder 3, `showAsColumn: false`, rate 0.00). Use UTF-8 Kannada strings directly. Explain why the year and its poojas are created together and why the guard matters.',
          },
          {
            step: 2,
            label: 'Sample Magane, households and participations',
            outcome: 'A ward with Kannada households whose ticks reference real pooja rows.',
            prompt:
              'Extend the seed: create one `Magane` (Kannada `name`, `sortOrder: 1`, `mobileNumbers: [\'9876543210\']`). Fetch the created year\'s PoojaTypes. Create two `PersonEntry` rows for year 2025 in that magane (combined Kannada name/address, `serialNo` 1 and 2, optional `mobile`, a `kaalukanike` of 100.00 on one). For each household, create `Participation` rows on the unique pair (`personEntryId`, `poojaTypeId`) with `checked` true for ಹೂವಿನ ಪೂಜೆ and false for ಮಂಗಳಾರತಿ, proving the join works. Use the `@@unique` pair so the rows are well-formed.',
          },
          {
            step: 3,
            label: 'Prove the relations: compute a household ₹ total',
            outcome: 'A logged Σ rate(ticked) total in exact Decimal, formatted in Indian grouping.',
            prompt:
              'Finish the seed by loading one household with `prisma.personEntry.findUnique({ where: { id }, include: { participations: { include: { poojaType: true } } } })`. Compute its total as `Σ poojaType.rate` over participations where `checked` is true, using `Prisma.Decimal` (`new Prisma.Decimal(0)` then `.plus(rate)`), and log `total.toNumber()` formatted with `new Intl.NumberFormat(\'en-IN\')` (e.g. ₹1,20,000). Then describe, in a comment, a `cloneYear(2025, 2026)` function that copies the 2025 PoojaTypes and PersonEntries into new rows with the 2026 `yearId`, reusing the same Magane ids and leaving locked 2025 untouched. Note the whole script runs in Node/main, never the renderer.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm3-q1',
      q: 'Why is Magane a GLOBAL master while PoojaType, PersonEntry and Participation are year-scoped?',
      options: [
        'Maganes are larger records so they are stored separately for performance',
        'Wards barely change and are shared across years, while per-year data is snapshotted so locking an old year never ripples into a new one',
        'Prisma forbids relations between global and year-scoped models',
        'It lets the renderer query maganes without IPC',
      ],
      answer: 1,
    },
    {
      id: 'm3-q2',
      q: 'Which `onDelete` choice is correct for the PersonEntry -> Magane relation, and why?',
      options: [
        'Cascade, so deleting a ward removes all its households automatically',
        'Cascade, so deleting a household removes the ward',
        'No cascade (restrict), so the global ward master is protected and a household delete never touches the ward',
        'SetNull, so households keep working after the ward is deleted',
      ],
      answer: 2,
    },
    {
      id: 'm3-q3',
      q: 'Why must `rate` and `kaalukanike` be `Decimal @db.Decimal(12,2)` rather than `Float`?',
      options: [
        'Decimal columns are smaller on disk than Float',
        'Prisma cannot map Float to Postgres',
        'Floating-point cannot represent decimal money exactly, so ₹ totals drift; Decimal is exact and reconciles to the paisa',
        'Float is not allowed inside a multiSchema database',
      ],
      answer: 2,
    },
    {
      id: 'm3-q4',
      q: 'What does the `@@unique([personEntryId, poojaTypeId])` constraint on Participation guarantee?',
      options: [
        'That each household belongs to exactly one pooja',
        'That a household ticks each pooja at most once — one checkbox per cell — keeping the ₹ total free of double-counting',
        'That pooja names are unique within a year',
        'That the participations table is indexed by year',
      ],
      answer: 1,
    },
    {
      id: 'm3-q5',
      q: 'Why is `@@index([yearId, maganeId])` placed on PersonEntry?',
      options: [
        'To enforce that a household appears once per ward',
        'To make the register\'s signature query — listing one ward\'s households for a given year — fast across 2280 rows',
        'It is required by the multiSchema preview feature',
        'To cascade deletes from Year to Magane',
      ],
      answer: 1,
    },
    {
      id: 'm3-q6',
      q: 'When a Prisma `Decimal` money value is sent from the main process to the React renderer over IPC, what must happen?',
      options: [
        'Nothing — Decimal serialises to a usable number automatically',
        'The renderer must import Prisma to read the Decimal',
        'Convert it to a plain `number` (e.g. `.toNumber()`) at the IPC boundary after doing exact Decimal math in main',
        'Round it to an integer because IPC cannot send decimals',
      ],
      answer: 2,
    },
  ],
};
