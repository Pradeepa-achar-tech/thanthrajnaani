// Module 2 — Prisma + a Bundled Local PostgreSQL (embedded-postgres)
// The signature module of "Upralli Seva": how the offline desktop app ships its
// own portable Postgres and uses Prisma against it. Consumed by the React course
// player (see components/TopicItem.jsx).

export const m2 = {
  id: 'm2',
  title: 'Prisma + a Bundled Local PostgreSQL (embedded-postgres)',
  hours: 10,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'The signature module of Upralli Seva. Learn Prisma (schema → typed client + migrations), then ship a portable PostgreSQL **inside the installer** with `embedded-postgres` — a loopback cluster under %LOCALAPPDATA%\\UpralliSeva that survives uninstall, gets its `--encoding=UTF8` so Kannada never corrupts, and is migrated at runtime by the bundled Prisma CLI. By the end you can boot the whole offline data layer for the Upralli temple committee from a cold first run.',
  sections: [
    {
      id: 'm2-s1',
      title: 'Prisma fundamentals',
      topics: [
        {
          id: 'm2-t1',
          title: 'What Prisma is (schema → typed client + migrations)',
          explain:
            'Prisma is an **ORM**: you describe your tables once in `schema.prisma`, and Prisma generates a fully typed client to query them plus SQL migrations to build them.',
          analogy:
            'Think of the Upralli committee writing down ONE master register layout — what columns a household line has, what a pooja-type line has. From that single sheet, Prisma prints two things for you: a typed pen that only lets you write valid entries (the client), and a set of build instructions a mason follows to construct the actual register cabinet (the migrations).',
          theory:
            'An **ORM** (Object-Relational Mapper) lets you work with database rows as ordinary objects in your language instead of stitching SQL strings by hand. Prisma is a modern TypeScript-first ORM with three parts: the **schema** (`schema.prisma`), the **migration engine** (turns schema changes into SQL files), and the generated **client** (`@prisma/client`).\n\nThe flow is: you edit the schema, run `prisma migrate dev` to author a migration, and Prisma regenerates the client. Now `db.personEntry.findMany()` is a real typed method — autocompletion knows every column, and the TypeScript compiler rejects a typo like `db.personEntry.fimdMany()` before the app even runs.\n\nFor Upralli Seva this matters because the domain has tight relationships — Maganes → Years → PersonEntry → PoojaTypes → Participation — and money columns that must never lose precision. Prisma models those relations explicitly and gives money a `Decimal` type, so a typed query like "all participations for year 2025" comes back shaped correctly with no hand-written JOIN.',
          whyItMatters:
            'This whole app is **TypeScript end to end**. A hand-written SQL layer would push string typos and column drift to runtime, where a committee volunteer hits them. Prisma moves those errors to compile time and keeps the schema and the code in lockstep — the safest base for an offline register that nobody can hotfix in the field.',
          steps: [
            'Install the two pieces: `prisma` as a dev dependency (the CLI) and `@prisma/client` as a runtime dependency.',
            'Run `npx prisma init` to scaffold a `prisma/` folder with a starter `schema.prisma`.',
            'Open `schema.prisma` and read its three blocks: `datasource`, `generator`, and (later) your `model`s.',
            'Understand the loop: edit schema → `prisma migrate dev` → client regenerates automatically.',
            'Import `PrismaClient` from `@prisma/client` in the MAIN process only and call typed methods.',
            'Treat the generated client as read-only output — never edit files under `node_modules/.prisma`.',
          ],
          code: `// package.json (devDependencies vs dependencies)
{
  'devDependencies': { 'prisma': '^5.18.0' },
  'dependencies': { '@prisma/client': '^5.18.0' }
}

// scaffold + the everyday loop
//   npx prisma init                     -> creates prisma/schema.prisma
//   npx prisma migrate dev --name init  -> author migration + regenerate client
//   npx prisma generate                 -> regenerate client only

// using the generated typed client (MAIN process)
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const households = await db.personEntry.findMany() // fully typed rows`,
          pitfalls: [
            'Confusing the two packages: `prisma` (CLI, dev-only) is NOT the same as `@prisma/client` (runtime). Ship the client, not the CLI logic.',
            'Forgetting that the client is **generated** — after editing the schema you must run migrate or generate, or your types are stale.',
            'Editing generated files under `node_modules/.prisma` by hand; they are overwritten on every generate.',
            'Importing `PrismaClient` in the renderer — it will not work and leaks DB access to the UI; keep it in MAIN.',
            'Assuming Prisma talks to any DB automatically — it needs a `DATABASE_URL` pointing at a running Postgres.',
            'Treating migrations as optional — without them the schema exists only on paper and no tables are created.',
          ],
          tryIt:
            'Run `npx prisma init` in a scratch folder, open the generated `schema.prisma`, and identify which block names the database and which block names the client generator.',
          takeaway:
            'Prisma = one schema file that generates a typed client AND the migrations to build the tables. Edit schema → migrate → the client follows.',
        },
        {
          id: 'm2-t2',
          title: 'The datasource and generator blocks',
          explain:
            'Every `schema.prisma` opens with two configuration blocks: `datasource` (which database, and where) and `generator` (which client to emit).',
          analogy:
            'The `datasource` is the committee deciding WHICH cabinet the register lives in and the key to open it; the `generator` is deciding WHICH kind of typed pen to manufacture for the volunteers. Both are settings, not data — they sit at the top of the master sheet.',
          theory:
            'The `datasource db` block declares the database provider (`postgresql`) and a `url`. We never hard-code the URL; we read it from the `DATABASE_URL` environment variable via `env("DATABASE_URL")`, because the real connection string is computed at runtime from the bundled cluster\'s port and credentials.\n\nThe `generator client` block tells Prisma to emit the JavaScript/TypeScript client (`provider = "prisma-client-js"`). This is what produces `@prisma/client` so your code can call `db.personEntry.findMany()`.\n\nKeeping the URL in `env()` is what lets the SAME schema work in development (pointing at a `.devdata` cluster) and in the packaged app (pointing at the per-user `%LOCALAPPDATA%` cluster) without any edit. The schema describes shape; the environment supplies location.',
          whyItMatters:
            'In Upralli Seva the database URL is **not known until the app starts** — the embedded cluster picks credentials and a fixed port at runtime. `env("DATABASE_URL")` is the seam that lets one schema serve dev, packaged, and migration-time contexts.',
          steps: [
            'Add a `datasource db` block with `provider = "postgresql"`.',
            'Set `url = env("DATABASE_URL")` so the connection string comes from the environment.',
            'Add a `generator client` block with `provider = "prisma-client-js"`.',
            'Never commit a real URL into the schema — only the `env()` reference.',
            'In dev, supply `DATABASE_URL` via a `.env` file or the process environment before running the CLI.',
          ],
          code: `// prisma/schema.prisma
datasource db {
  provider = 'postgresql'
  url      = env('DATABASE_URL')
}

generator client {
  provider = 'prisma-client-js'
}

// .env (dev only) — packaged app computes this at runtime instead
// DATABASE_URL='postgresql://postgres:upralli_local@localhost:54329/upralli'`,
          pitfalls: [
            'Hard-coding a `url` string instead of `env("DATABASE_URL")` — then dev and packaged builds fight over one value.',
            'Forgetting the `.env` file in dev, so the CLI errors with "Environment variable not found: DATABASE_URL".',
            'Using a different provider name than `postgresql` — `postgres` is not a valid Prisma provider.',
            'Committing a `.env` with real credentials to git; keep it gitignored.',
            'Assuming `env()` reads at generate time — it is resolved when a command actually connects.',
            'Omitting the generator block entirely, leaving you with migrations but no client to query with.',
          ],
          tryIt:
            'Write a minimal two-block schema (datasource + generator) and run `npx prisma validate` to confirm it parses.',
          takeaway:
            '`datasource` = which DB + `env("DATABASE_URL")` for the location; `generator` = emit the JS client. The URL stays in the environment, never the schema.',
        },
        {
          id: 'm2-t3',
          title: 'multiSchema + the pooja_register namespace',
          explain:
            'PostgreSQL groups tables into **schemas** (namespaces). We turn on Prisma\'s `multiSchema` preview and put every table in a `pooja_register` schema, reserving room for a future `billing` schema.',
          analogy:
            'One Postgres database is the temple office building; a Postgres schema is a labelled cupboard inside it. We put all pooja-register cupboards under the `pooja_register` label now, and leave an empty `billing` shelf reserved for the day the committee adds a billing module.',
          theory:
            'A PostgreSQL **schema** is a namespace inside a single database — a logical folder for tables. By default everything lands in `public`. Prisma can place models into named schemas, but this requires enabling the `multiSchema` **preview feature** in the generator and listing the schemas in the datasource.\n\nWe declare `schemas = ["pooja_register"]` in the datasource and add `@@schema("pooja_register")` to each model. This keeps the pooja-register domain cleanly grouped and reserves the `public` (and a future `billing`) namespace for other concerns, so the database stays organised as the app grows.\n\nBecause this is a **preview feature**, you opt in explicitly with `previewFeatures = ["multiSchema"]` in the generator block. Prisma then knows to qualify table names with their schema in the generated SQL.',
          whyItMatters:
            'The committee has signalled a future **billing** module. Namespacing the pooja-register tables now means that when billing arrives, its tables drop into their own `billing` schema with zero collisions and no renaming of the existing register — a cheap decision today that prevents a painful migration later.',
          steps: [
            'Add `previewFeatures = ["multiSchema"]` to the `generator client` block.',
            'Add `schemas = ["pooja_register"]` to the `datasource db` block.',
            'Tag each model with `@@schema("pooja_register")`.',
            'Plan (but do not yet create) a `billing` schema for the reserved future module.',
            'Run a migration so Postgres actually creates the `pooja_register` schema namespace.',
          ],
          code: `// prisma/schema.prisma
datasource db {
  provider = 'postgresql'
  url      = env('DATABASE_URL')
  schemas  = ['pooja_register'] // reserve 'billing' here later
}

generator client {
  provider        = 'prisma-client-js'
  previewFeatures = ['multiSchema']
}

model PersonEntry {
  id   Int    @id @default(autoincrement())
  name String
  @@schema('pooja_register')
}`,
          pitfalls: [
            'Listing a schema in `schemas` but forgetting `@@schema(...)` on a model — Prisma errors that the model has no schema.',
            'Forgetting `previewFeatures = ["multiSchema"]`, so the `schemas` key is rejected as unknown.',
            'Spelling the schema name differently in the datasource vs the `@@schema` attribute.',
            'Expecting the schema to exist before a migration runs — the migration is what creates it.',
            'Adding the `billing` schema prematurely with no tables, leaving an empty namespace and confusing migrations.',
            'Assuming multiSchema is stable — it is a preview feature and must be opted into explicitly.',
          ],
          tryIt:
            'Enable `multiSchema`, declare `pooja_register`, tag one model with `@@schema`, and run `npx prisma validate`.',
          takeaway:
            'Postgres schemas = cupboards inside one DB. `multiSchema` preview + `schemas` + `@@schema(...)` groups all pooja-register tables under `pooja_register` and reserves room for `billing`.',
        },
        {
          id: 'm2-t4',
          title: 'Modelling the domain: Maganes, Years, PersonEntry, PoojaTypes',
          explain:
            'The Upralli domain is a chain: a global **Maganes** master, then **Years** (each with its own pooja columns and rates), then **PersonEntry** households, then **PoojaTypes** per year.',
          analogy:
            'Maganes is the permanent list of village lineage-groups — written once, used every year. Each Year is a fresh register volume: it carries its own pooja columns and rates because the committee re-decides rates annually. Households (PersonEntry) and the year\'s PoojaTypes are lines inside that volume.',
          theory:
            'In Prisma a **model** maps to a table. Relations are expressed with relation fields plus a foreign-key scalar. **Maganes** is a global master (no year), referenced everywhere. A **Year** owns its **PoojaTypes** and its **PersonEntry** rows, because rates and the pooja list are decided per year and a year can be **locked** once finalised.\n\nThe `Year` model carries a `locked` boolean. When a year is locked, the app refuses edits to its pooja types, rates, and participation — the committee\'s way of freezing a finalised register. The relation fields (`poojaTypes PoojaType[]`, `persons PersonEntry[]`) let Prisma fetch a whole year\'s data in one typed query.\n\nEach `PoojaType` belongs to one `Year` and has a `rate` stored as `Decimal` (money — covered next). Each `PersonEntry` is a household with a Kannada `name` and `address`, also tied to a year. This shape is what every later feature — totals, participation grids, locking — builds upon.',
          whyItMatters:
            'Getting these relations right once means the rest of Upralli Seva is mostly typed queries. Because rates live **per year**, last year\'s ₹ totals stay correct forever even after the committee raises this year\'s rates — the year boundary is the unit of historical truth.',
          steps: [
            'Create a `Magane` model as a global master (id + Kannada name, no year link).',
            'Create a `Year` model with a unique `year` Int and a `locked` Boolean default false.',
            'Give `Year` relation fields to its `PoojaType[]` and `PersonEntry[]`.',
            'Create `PoojaType` with a `rate Decimal` and a `yearId` foreign key.',
            'Create `PersonEntry` with Kannada `name`/`address` and a `yearId` foreign key.',
            'Tag every model with `@@schema("pooja_register")`.',
          ],
          code: `// prisma/schema.prisma (excerpt)
model Year {
  id         Int           @id @default(autoincrement())
  year       Int           @unique
  locked     Boolean       @default(false)
  poojaTypes PoojaType[]
  persons    PersonEntry[]
  @@schema('pooja_register')
}

model PoojaType {
  id     Int     @id @default(autoincrement())
  name   String  // Kannada pooja name
  rate   Decimal @db.Decimal(10, 2)
  yearId Int
  year   Year    @relation(fields: [yearId], references: [id])
  @@schema('pooja_register')
}`,
          pitfalls: [
            'Putting pooja rates on a global table instead of per-year — then changing a rate silently rewrites history.',
            'Forgetting the `@unique` on `Year.year`, allowing two "2025" rows.',
            'Omitting the scalar FK (`yearId`) and only writing the relation field — Prisma needs both.',
            'Using `Float` for `rate` instead of `Decimal` (covered next), which corrupts ₹ totals.',
            'Linking PersonEntry to Magane but forgetting the Year link, losing the per-year boundary.',
            'Skipping the `locked` flag, leaving no way to freeze a finalised year.',
          ],
          tryIt:
            'Sketch the four models with their relation fields and FKs, then run `npx prisma validate` until it passes.',
          takeaway:
            'Maganes is global; Year owns its PoojaTypes and PersonEntry and can be locked. Per-year ownership is what keeps each year\'s rates and totals historically correct.',
        },
        {
          id: 'm2-t5',
          title: 'Decimal for money — never Float',
          explain:
            'Pooja rates and ₹ totals must use Prisma\'s `Decimal` type, mapped to a Postgres `numeric`. Floating-point numbers silently lose precision on money.',
          analogy:
            'The committee treasurer counts rupees in exact paise, not "roughly". A `Float` is like a treasurer who rounds every entry a little — by year-end the donation box total is off by rupees nobody can explain. `Decimal` is the treasurer who balances to the paise.',
          theory:
            'Binary floating-point (`Float`/`Double`) cannot represent many decimal fractions exactly — `0.1 + 0.2` is famously not `0.3`. For money this is unacceptable. Prisma offers a `Decimal` type backed by PostgreSQL `numeric`, which stores exact decimal values.\n\nYou declare it as `rate Decimal @db.Decimal(10, 2)` — up to 10 total digits, 2 after the point. In TypeScript, Prisma returns these as `Prisma.Decimal` objects (from `decimal.js`), not plain numbers, so arithmetic stays exact. You add with `.plus()` and compare with `.equals()` rather than `+` and `===`.\n\nThe app\'s core money rule — Σ rate(ticked) → ₹ total with Indian grouping — runs over these Decimals, then formats only at the very end for display. Compute in Decimal, format to a string last.',
          whyItMatters:
            'A temple register that cannot total donations exactly is worthless to the committee. `Decimal` guarantees that summing 500 ticked poojas gives the same ₹ figure every time, matching the physical cash box to the paise.',
          steps: [
            'Declare every money column as `Decimal @db.Decimal(10, 2)` in the schema.',
            'Import `Prisma` from `@prisma/client` to access `Prisma.Decimal`.',
            'Build totals with Decimal arithmetic (`.plus()`), not native `+`.',
            'Keep values as Decimal through all computation; format to a string only for display.',
            'Apply Indian digit grouping (e.g. `Intl.NumberFormat("en-IN")`) at the display edge only.',
          ],
          code: `import { Prisma } from '@prisma/client'

// sum rates of the ticked poojas — exact, no float drift
function total(rates: Prisma.Decimal[]): Prisma.Decimal {
  return rates.reduce((sum, r) => sum.plus(r), new Prisma.Decimal(0))
}

// format ONLY at the display edge (Indian grouping)
function formatInr(amount: Prisma.Decimal): string {
  return '\\u20B9' + new Intl.NumberFormat('en-IN').format(amount.toNumber())
}
// total([new Prisma.Decimal('250.00'), new Prisma.Decimal('1000.50')]) -> 1250.50`,
          pitfalls: [
            'Using `Float`/`Double` for rates — `0.1 + 0.2` style drift accumulates over hundreds of rows.',
            'Calling `.toNumber()` early and doing math in JS floats, throwing away the exact value.',
            'Comparing Decimals with `===` instead of `.equals()`.',
            'Forgetting the precision/scale `@db.Decimal(10, 2)`, leaving an unbounded numeric.',
            'Formatting with grouping mid-calculation and then trying to parse it back.',
            'Sending raw `Prisma.Decimal` objects over IPC without serialising to a string first.',
          ],
          tryIt:
            'Sum three sample rates with `Prisma.Decimal.plus()` and confirm the result is exact, then format it with `en-IN` grouping.',
          takeaway:
            'Money = `Decimal @db.Decimal(10,2)` and `Prisma.Decimal` arithmetic. Compute exact, format with Indian grouping only at the display edge.',
        },
        {
          id: 'm2-t6',
          title: 'migrate dev vs migrate deploy vs generate',
          explain:
            'Three Prisma commands do different jobs: `migrate dev` authors migrations (development), `migrate deploy` applies existing migrations (runtime), and `generate` rebuilds the client.',
          analogy:
            'On the committee\'s drawing board, `migrate dev` is the architect drafting and stamping a new cabinet blueprint. `migrate deploy` is the on-site mason building exactly the stamped blueprints, asking no questions. `generate` is re-printing the typed pen so it matches the latest blueprint.',
          theory:
            '`prisma migrate dev` is a **developer** command: it diffs your schema against the database, generates a new SQL migration file under `prisma/migrations/`, applies it, and regenerates the client. It may prompt and may reset the dev database. You run it on your machine while designing.\n\n`prisma migrate deploy` is the **production/runtime** command: it applies any pending, already-authored migrations in order and never generates new ones or prompts. This is exactly what Upralli Seva runs on each app launch against the user\'s bundled cluster, so a returning user\'s database catches up to the app\'s schema safely.\n\n`prisma generate` only rebuilds the client from the current schema — no database contact. It runs automatically inside `migrate dev`, but you call it standalone (e.g. in a build step) to ensure the packaged app ships a client matching its migrations.',
          whyItMatters:
            'Confusing these breaks the offline app: running `migrate dev` at runtime could prompt or reset a committee\'s real data. The app MUST use `migrate deploy` — apply, never author — so a volunteer\'s years of pooja entries are only ever extended, never wiped.',
          steps: [
            'During design, run `prisma migrate dev --name <change>` to author and apply a migration.',
            'Commit the generated folder under `prisma/migrations/` to version control.',
            'In the packaged app at startup, run `prisma migrate deploy` to apply pending migrations.',
            'Run `prisma generate` in the build to ship a client matching those migrations.',
            'Never run `migrate dev` against a real user\'s database — it can prompt or reset.',
          ],
          code: `// DEVELOPMENT (your machine): author + apply + regenerate
//   npx prisma migrate dev --name add_pooja_types

// BUILD: ensure the shipped client matches the migrations
//   npx prisma generate

// RUNTIME (packaged app, every launch): apply pending only, no prompts
//   prisma migrate deploy --schema <bundled schema path>

// migrations live here and are committed:
//   prisma/migrations/20260623_add_pooja_types/migration.sql`,
          pitfalls: [
            'Running `migrate dev` in production — it can prompt or reset and destroy real data.',
            'Forgetting to commit the `prisma/migrations/` folder, so `deploy` has nothing to apply.',
            'Editing an already-applied migration file instead of authoring a new one.',
            'Assuming `migrate deploy` regenerates the client — it does not; run `generate` separately.',
            'Shipping a client that is out of sync with the bundled migrations because `generate` was skipped in the build.',
            'Expecting `migrate deploy` to create the database — it migrates an existing connection, it does not create the DB.',
          ],
          tryIt:
            'Author a migration with `migrate dev --name init`, inspect the generated `migration.sql`, then simulate runtime by running `migrate deploy` on a fresh database.',
          takeaway:
            '`migrate dev` authors (dev), `migrate deploy` applies (runtime), `generate` rebuilds the client. Upralli Seva ships authored migrations and applies them with `deploy` only.',
        },
        {
          id: 'm2-t7',
          title: 'Typed queries: findMany, create, $transaction',
          explain:
            'The generated client gives typed methods — `findMany`, `create`, `update`, and `$transaction` to group writes atomically — all checked by TypeScript.',
          analogy:
            'The typed client is the committee\'s strict register clerk: `create` writes one new line, `findMany` reads back the matching lines, and `$transaction` is "make ALL these entries together or none" — like recording a household AND its participations in one stroke so the register never shows a half-entered family.',
          theory:
            'Each model exposes a typed delegate: `db.personEntry.findMany({ where, include, orderBy })`, `db.personEntry.create({ data })`, `db.poojaType.update(...)`. The argument shapes come from your schema, so the compiler catches a bad column name or wrong type immediately. `include` pulls related rows (e.g. a year with its pooja types) in one query.\n\n`$transaction` runs several writes atomically: either all succeed or all roll back. Upralli Seva uses it when creating a new year — inserting the Year plus its default PoojaTypes plus seeding participations must not partially apply. Pass an array of operations, or a callback for interactive transactions.\n\nBecause Kannada text is just UTF-8 strings, a `create` with a Kannada `name` and a later `findMany` round-trip the exact characters — provided the cluster was initialised UTF-8 (the gotcha in s2). The types and the encoding together make Kannada a first-class, safe value.',
          whyItMatters:
            'Atomicity protects the register\'s integrity: when a volunteer adds a year, `$transaction` guarantees the year never exists without its pooja types. Typed `findMany`/`create` mean a column rename is a compile error, not a silent data bug discovered months later by the committee.',
          steps: [
            'Use `db.<model>.findMany({ where, include, orderBy })` for typed reads.',
            'Use `db.<model>.create({ data })` for a single typed insert.',
            'Wrap multi-step writes in `db.$transaction([...])` so they apply all-or-nothing.',
            'Use `include` to fetch related rows (year + its pooja types) in one call.',
            'Round-trip Kannada by creating a row with a Kannada string and reading it back.',
          ],
          code: `// typed read with a relation pulled in
const year = await db.year.findFirst({
  where: { year: 2025 },
  include: { poojaTypes: true, persons: true },
})

// atomic create: a year AND its default pooja types together
await db.$transaction([
  db.year.create({ data: { year: 2026 } }),
  db.poojaType.create({
    data: { name: '\\u0CB0\\u0C82\\u0C97\\u0CAA\\u0CC2\\u0C9C\\u0CC6', rate: '250.00', yearId: 1 },
  }),
])`,
          pitfalls: [
            'Doing related writes as separate awaits instead of `$transaction`, risking a half-written year.',
            'Forgetting `include`, then firing N+1 queries to fetch each year\'s pooja types.',
            'Passing a JS number for a `Decimal` field — pass a string like `"250.00"`.',
            'Ignoring the typed `where` shape and querying a non-existent column (caught at compile time if you let it).',
            'Assuming Kannada round-trips even on a non-UTF8 cluster — encoding must be correct first (s2).',
            'Returning raw `Decimal`/`Date` objects across IPC without serialising them.',
          ],
          tryIt:
            'Write a `$transaction` that creates a Year and one PoojaType with a Kannada name, then `findFirst` with `include` to read both back.',
          takeaway:
            'Typed `findMany`/`create` catch column mistakes at compile time; `$transaction` makes multi-row writes all-or-nothing — the backbone of safe year creation.',
        },
      ],
    },
    {
      id: 'm2-s2',
      title: 'Bundling PostgreSQL with embedded-postgres',
      topics: [
        {
          id: 'm2-t8',
          title: 'The decision: bundle Postgres vs require an install',
          explain:
            'We ship a portable PostgreSQL **inside the installer** rather than asking the committee to install Postgres themselves. The app "just works" on a fresh PC.',
          analogy:
            'You can hand the committee a sealed cabinet that already contains the register and the lock (bundled), or hand them a flat-pack and a manual that says "first go buy and assemble a cabinet" (system install). For a non-technical temple committee in Kundapura, the sealed cabinet is the only realistic choice.',
          theory:
            'Two options exist for an offline Postgres app. **Require a system install**: the user installs PostgreSQL, sets a password, opens a port, and the app connects. This is lighter to ship but pushes setup onto the user. **Bundle a portable cluster**: the installer carries a Postgres binary, and the app spins up its own private cluster on launch.\n\nFor Upralli Seva the user is a temple committee volunteer, not an IT admin. A multi-step database install is a non-starter — any failure means an unusable app and a support call nobody can answer in the field. So we **bundle**, using the `embedded-postgres` package, which downloads/carries a portable Postgres and exposes `initialise`/`start`/`stop` lifecycle methods.\n\nBundling has costs — a larger installer and responsibility for the cluster lifecycle — but it delivers the one thing that matters here: double-click the installer, launch, and the register works, with zero database knowledge required.',
          whyItMatters:
            'The whole product promise is "a non-technical committee runs it offline forever". A required system install would break that promise on the first machine where the volunteer cannot complete it. Bundling is what makes Upralli Seva genuinely "just works".',
          steps: [
            'Add `embedded-postgres` as a dependency.',
            'Decide on fixed local credentials and a high, unlikely-to-clash port (54329).',
            'Plan the lifecycle: initialise on first run, start on app ready, stop on quit.',
            'Accept the larger installer as the price of zero-setup for the committee.',
            'Keep the cluster loopback-only — never expose it to the network.',
          ],
          code: `// the bundled-cluster constants (one place)
export const PG_PORT = 54329          // high port, unlikely to clash
export const PG_USER = 'postgres'
export const PG_PASSWORD = 'upralli_local' // local-only, loopback cluster
export const DB_NAME = 'upralli'

// build the connection string from these
export function databaseUrl(): string {
  return \`postgresql://\${PG_USER}:\${PG_PASSWORD}@localhost:\${PG_PORT}/\${DB_NAME}\`
}`,
          pitfalls: [
            'Requiring a system Postgres install and assuming a committee volunteer can complete it.',
            'Picking a common port (5432) that clashes with an existing Postgres on the machine.',
            'Treating the bundled password as a secret — it is loopback-only and local; do not over-engineer it.',
            'Forgetting the larger installer size and not warning testers about download time.',
            'Binding the cluster to all interfaces instead of loopback, exposing it on the network.',
            'Skipping a single source of truth for the constants, so the URL and the cluster disagree.',
          ],
          tryIt:
            'List the trade-offs of bundle vs system-install in two columns for this exact user (a temple committee volunteer) and confirm why bundling wins.',
          takeaway:
            'Bundle a portable Postgres with `embedded-postgres` so a non-technical committee gets a zero-setup, offline-forever register. Larger installer, but it "just works".',
        },
        {
          id: 'm2-t9',
          title: 'Configuring the embedded-postgres cluster',
          explain:
            'We construct an `EmbeddedPostgres` with a per-user `databaseDir`, fixed local credentials, the high port, and `persistent: true` so data survives restarts.',
          analogy:
            'This is the committee specifying the new cabinet: where it stands (`databaseDir`), its lock (user/password), its slot number in the office (`port`), and a rule that it is never thrown away between days (`persistent`). One clear spec, built once.',
          theory:
            'The `EmbeddedPostgres` constructor takes a config object. `databaseDir` is the on-disk cluster location — we point it at the per-user `pgdata/` folder (covered in s3) so each Windows user gets their own register. `user`, `password`, and `port` set the loopback credentials and slot.\n\n`persistent: true` is critical: it tells embedded-postgres NOT to delete the data directory when the process exits. Without it, the cluster would be ephemeral and the committee\'s entries would vanish on close. This single flag is the difference between a scratch DB and a durable register.\n\nThe constructor only describes the cluster; nothing runs yet. Initialisation, start, database creation, and stop are separate lifecycle calls — kept distinct so the app can decide, at boot, whether it is creating a brand-new cluster or resuming an existing one.',
          whyItMatters:
            'A wrong `databaseDir` (inside the install folder) would wipe data on every app update; `persistent: false` would wipe it on every close. These two settings are exactly what make the register durable across both restarts and reinstalls.',
          steps: [
            'Import the constructor via dynamic `import` (next topic explains why).',
            'Pass `databaseDir` pointing at the per-user `pgdata/` folder.',
            'Pass `user`, `password`, and `port` from the shared constants.',
            'Set `persistent: true` so data is never auto-deleted.',
            'Add `initdbFlags` for UTF-8 (the Kannada gotcha, next-but-one).',
            'Hold the instance in a module-level variable for later `start`/`stop`.',
          ],
          code: `import { getAppPaths } from '../paths'

const paths = getAppPaths()
const { default: EmbeddedPostgresCtor } = await import('embedded-postgres')

const pg = new EmbeddedPostgresCtor({
  databaseDir: paths.pgData,   // per-user pgdata/, survives restarts & uninstall
  user: PG_USER,
  password: PG_PASSWORD,
  port: PG_PORT,
  persistent: true,            // do NOT delete the data dir on exit
  initdbFlags: ['--encoding=UTF8', '--locale=C'], // Kannada-safe (see next)
})`,
          pitfalls: [
            'Pointing `databaseDir` inside the install folder, so an app update or uninstall destroys the data.',
            'Leaving `persistent` at its default (false), wiping the cluster every time the app closes.',
            'Reusing the same `databaseDir` across two running app instances, corrupting the cluster.',
            'Hard-coding an absolute path instead of the computed per-user path.',
            'Forgetting `initdbFlags`, which causes the Kannada corruption covered next.',
            'Creating the instance but never holding a reference, so you cannot `stop()` it cleanly.',
          ],
          tryIt:
            'Construct an `EmbeddedPostgres` with `persistent: true` and a temp `databaseDir`, then log the config to confirm the port and flags.',
          takeaway:
            'Configure the cluster once: per-user `databaseDir`, loopback creds, high port, `persistent: true`, and UTF-8 `initdbFlags`. The constructor describes; lifecycle calls run.',
        },
        {
          id: 'm2-t10',
          title: 'The Kannada gotcha: --encoding=UTF8 in initdbFlags',
          explain:
            'On Windows, `initdb` defaults to the WIN1252 encoding, which corrupts Kannada text. We force `initdbFlags: ["--encoding=UTF8","--locale=C"]` so the cluster stores UTF-8.',
          analogy:
            'It is like buying a register printed only with the English alphabet and then trying to write Kannada in it — the letters smear into nonsense. `--encoding=UTF8` is insisting on a register whose paper accepts the full Kannada script before a single name is written.',
          theory:
            'A PostgreSQL cluster\'s encoding is fixed at **initialisation time** by `initdb`, and it cannot be changed afterward without re-initialising. On Windows, `initdb` picks the system locale\'s encoding by default — typically WIN1252 — which cannot represent Kannada code points. Any Kannada name written into such a cluster is mangled or rejected.\n\nThe fix is to pass `--encoding=UTF8` (and `--locale=C` for deterministic, locale-independent collation) through `initdbFlags`. UTF-8 represents the entire Unicode range, so Kannada (ಉಪ್ರಳ್ಳಿ), Latin, and digits all coexist. `--locale=C` avoids dragging in a platform locale that could surprise sorting or fail on minimal systems.\n\nBecause encoding is set once at init and is permanent, this flag MUST be present on the very first run. If a cluster was already initialised wrong, the only cure is to dump the data, re-init with UTF-8, and reload — which is why getting it right the first time is non-negotiable for a Kannada-first app.',
          whyItMatters:
            'Upralli Seva is **Kannada first-class**. Household names and addresses are written in Kannada. Without `--encoding=UTF8` the very first real entry corrupts, and because encoding is permanent, the committee would have to start over. This one flag protects the entire dataset.',
          steps: [
            'Add `initdbFlags: ["--encoding=UTF8", "--locale=C"]` to the constructor config.',
            'Ensure these flags are present BEFORE the first `initialise()` call.',
            'Verify after init by writing and reading back a Kannada string.',
            'Treat a wrongly-initialised cluster as needing a full dump/re-init/reload.',
            'Keep the flags in the same shared config so they are never accidentally dropped.',
          ],
          code: `const pg = new EmbeddedPostgresCtor({
  databaseDir: paths.pgData,
  user: PG_USER,
  password: PG_PASSWORD,
  port: PG_PORT,
  persistent: true,
  // WITHOUT this, Windows initdb defaults to WIN1252 and Kannada corrupts:
  initdbFlags: ['--encoding=UTF8', '--locale=C'],
})
// after start(): SHOW server_encoding; -> must report 'UTF8'`,
          pitfalls: [
            'Omitting `--encoding=UTF8` on Windows, silently getting a WIN1252 cluster.',
            'Adding the flag AFTER the cluster was already initialised — it has no effect; encoding is permanent.',
            'Assuming the database default is UTF-8 everywhere; on Windows it is not.',
            'Dropping `--locale=C` and inheriting a platform locale that breaks sorting or init on minimal PCs.',
            'Testing only with Latin names, so the corruption never shows until a Kannada entry is added in the field.',
            'Trying to "fix" encoding with an `ALTER` later — it requires a full re-init and reload.',
          ],
          tryIt:
            'Initialise one cluster WITH the UTF-8 flag and (in a throwaway dir) one WITHOUT, write "ಉಪ್ರಳ್ಳಿ" to each, and compare what reads back.',
          takeaway:
            'Encoding is fixed at init and permanent. `initdbFlags: ["--encoding=UTF8","--locale=C"]` on the first run is what keeps every Kannada name intact forever.',
        },
        {
          id: 'm2-t11',
          title: 'The ESM gotcha: dynamic import in a CJS main',
          explain:
            '`embedded-postgres` is ESM-only, but the bundled Electron main is CommonJS. A static `import`/`require` fails, so we load it with a dynamic `await import(...)`.',
          analogy:
            'The committee\'s old filing system reads one kind of binder (CJS), but the new portable-cabinet supplier only ships a different binder format (ESM). The dynamic import is the adapter you reach for at the exact moment you need the cabinet — not a permanent rebuild of the whole filing system.',
          theory:
            'JavaScript has two module systems: **CommonJS** (`require`, the format electron-vite emits for the bundled main) and **ESM** (`import`, the modern standard). A package that is "ESM-only" cannot be `require()`d from CJS, and a top-level `import` would force the whole file to ESM, which the bundled main is not.\n\nThe escape hatch is the **dynamic import expression**: `await import("embedded-postgres")`. This works from CommonJS, returns a Promise of the module namespace, and lets you pull the default export: `const { default: EmbeddedPostgresCtor } = await import("embedded-postgres")`. It is the standard interop pattern for using an ESM-only dependency from a CJS context.\n\nBecause it is awaited inside an async function (your `startDatabase`), it fits naturally into the boot sequence. You pay a one-time async resolution at startup, and the rest of your CJS main is untouched — no risky migration of the whole project to ESM just to satisfy one dependency.',
          whyItMatters:
            'Without this pattern the app crashes at launch with an `ERR_REQUIRE_ESM` error the moment it tries to start the database — meaning the committee never even sees the register. The dynamic import is the small, surgical fix that keeps the whole bundled-Postgres approach viable.',
          steps: [
            'Confirm the bundled main is CJS (electron-vite default) and `embedded-postgres` is ESM-only.',
            'Do NOT add a top-level `import EmbeddedPostgres from "embedded-postgres"`.',
            'Inside your async `startDatabase`, write `const { default: EmbeddedPostgresCtor } = await import("embedded-postgres")`.',
            'Use `EmbeddedPostgresCtor` as the constructor as normal.',
            'Keep the dynamic import close to where the cluster is created.',
          ],
          code: `// src/main/db/postgres-lifecycle.ts (CJS bundle)
export async function startDatabase(): Promise<DbHandle> {
  // embedded-postgres is ESM-only -> dynamic import works from CJS main
  const { default: EmbeddedPostgresCtor } = await import('embedded-postgres')
  const pg = new EmbeddedPostgresCtor({ /* ...config... */ })
  // ... initialise / start ...
}
// A top-level: import EmbeddedPostgres from 'embedded-postgres'
//   would throw ERR_REQUIRE_ESM in the CJS main bundle.`,
          pitfalls: [
            'Using a static top-level `import`/`require`, crashing with `ERR_REQUIRE_ESM` at startup.',
            'Forgetting to destructure `.default` from the dynamic import namespace.',
            'Calling `await import` outside an async function.',
            'Converting the entire main to ESM just for this one package, breaking other CJS assumptions.',
            'Letting the bundler "helpfully" rewrite the dynamic import into a require; verify the output.',
            'Resolving the import on every call instead of once during boot (minor, but wasteful).',
          ],
          tryIt:
            'In a small CJS script, try a top-level `require("embedded-postgres")` (observe it fail), then load it with `await import(...)` inside an async function (observe it work).',
          takeaway:
            'ESM-only dependency + CJS main = load it with `const { default } = await import("embedded-postgres")`. A surgical interop, not a whole-project ESM migration.',
        },
        {
          id: 'm2-t12',
          title: 'The cluster lifecycle: initialise, start, createDatabase, stop',
          explain:
            'The cluster has four lifecycle calls: `initialise()` (first run only), `start()` on app ready, `createDatabase()` (idempotent), and `stop()` on quit.',
          analogy:
            'Building and opening the cabinet: `initialise` is constructing it the very first time, `start` is unlocking it each morning, `createDatabase` is making sure the "upralli" drawer exists (harmless if it already does), and `stop` is locking up at night so nothing is left dangling.',
          theory:
            '`initialise()` runs `initdb` to create a brand-new cluster on disk — it is needed only the **first** time, when no cluster exists yet. On later runs you skip it and resume the existing data (detected via the `resumed`/`PG_VERSION` check in s3). `start()` boots the Postgres server process; you call it on every launch once Electron is ready.\n\n`createDatabase(DB_NAME)` makes the `upralli` database inside the cluster. It must be **idempotent** — on the second run the database already exists, so we wrap it in a try/catch that swallows only the "already exists" error and rethrows anything else. This lets the same boot code run on first launch and every launch after.\n\n`stop()` shuts the server down cleanly, and we wire it to Electron\'s `will-quit` so the cluster is never left running after the window closes. Together these four calls — guarded by the first-run/resume logic — form a lifecycle that is safe to run unconditionally at every startup.',
          whyItMatters:
            'A clean lifecycle is what makes the offline app reliable: `start`/`stop` bound to app events means no orphaned Postgres processes, and the idempotent `createDatabase` means the same code path works on day one and day one-thousand without special-casing.',
          steps: [
            'On first run (no existing cluster), call `await pg.initialise()`.',
            'On every run, call `await pg.start()` once the app is ready.',
            'Call `await pg.createDatabase(DB_NAME)` inside a try/catch that ignores "already exists".',
            'Bind `await stopDatabase()` to Electron\'s `will-quit` event.',
            'Hold the `pg` instance at module scope so `stop` can reach it.',
            'Return a handle (with `databaseUrl` and `resumed`) for the boot sequence to use.',
          ],
          code: `let pg: any = null

export async function startDatabase(): Promise<DbHandle> {
  const resumed = isInitialised(paths.pgData)
  const { default: EmbeddedPostgresCtor } = await import('embedded-postgres')
  pg = new EmbeddedPostgresCtor({ /* config with UTF-8 flags */ })

  if (!resumed) await pg.initialise()       // first run only
  await pg.start()                          // every run
  try { await pg.createDatabase(DB_NAME) }  // idempotent
  catch (err) { if (!/already exists/i.test(String(err))) throw err }

  return { databaseUrl: databaseUrl(), resumed }
}

export async function stopDatabase(): Promise<void> {
  if (pg) { await pg.stop(); pg = null }
}`,
          pitfalls: [
            'Calling `initialise()` on every run, which re-inits and wipes existing data.',
            'Letting `createDatabase` throw on the second run because the "already exists" error is not swallowed.',
            'Swallowing ALL errors from `createDatabase` instead of only "already exists", hiding real failures.',
            'Forgetting to bind `stop()` to `will-quit`, leaving an orphaned Postgres process after close.',
            'Calling `start()` before Electron is ready, racing the app lifecycle.',
            'Not nulling the `pg` reference after stop, so a later call acts on a dead handle.',
          ],
          tryIt:
            'Write the four-call sequence with the idempotent `createDatabase` try/catch, run it twice against the same dir, and confirm the second run resumes without error.',
          takeaway:
            'Lifecycle = initialise (first run) → start (every run) → createDatabase (idempotent) → stop (on `will-quit`). The guards make it safe to run unconditionally.',
        },
      ],
    },
    {
      id: 'm2-s3',
      title: 'Where the data lives (offline, survives uninstall)',
      topics: [
        {
          id: 'm2-t13',
          title: 'A stable per-user data root in %LOCALAPPDATA%',
          explain:
            'The cluster, backups, and config live under `%LOCALAPPDATA%\\UpralliSeva` — OUTSIDE the install directory — so data survives app updates and uninstalls.',
          analogy:
            'You never store the temple\'s register inside the scaffolding of the building under renovation — when the scaffolding (the app install) is torn down, you would lose the register. You keep it in a permanent strongroom (`%LOCALAPPDATA%`) that stays put no matter what happens to the building.',
          theory:
            'On Windows, `%LOCALAPPDATA%` is the per-user folder for application data that should persist independently of the program files. Upralli Seva uses `%LOCALAPPDATA%\\UpralliSeva` as its **data root**, containing `pgdata/` (the cluster), `backups/`, and `config.json`. This directory is untouched by the NSIS uninstaller\'s default file removal, so the committee\'s register survives a reinstall.\n\nThe `dataRoot()` function resolves this carefully: in a packaged app it prefers `process.env.LOCALAPPDATA` on Windows (falling back to Electron\'s `appData`), and in development it honours a `UPRALLI_DEV_DATA` override so dev data lands in a project-local `.devdata` folder instead of polluting the real per-user location.\n\n`getAppPaths()` then derives every sub-path (`pgData`, `backups`, `configFile`) from that single root. One function owns the layout, so there is exactly one answer to "where does the data live", in dev and in production alike.',
          whyItMatters:
            'If the cluster lived in the install folder, every app update or uninstall would erase years of pooja entries. Anchoring it in `%LOCALAPPDATA%\\UpralliSeva` is precisely what lets a committee uninstall, reinstall, or update the app and find their full register intact.',
          steps: [
            'Define a single `APP_DIR_NAME = "UpralliSeva"`.',
            'Write `dataRoot()` preferring `LOCALAPPDATA` on Windows, falling back to `appData`.',
            'Honour a `UPRALLI_DEV_DATA` override in development for a `.devdata` folder.',
            'Derive `pgData`, `backups`, and `configFile` from the root in `getAppPaths()`.',
            'Use these paths everywhere — never hard-code a directory elsewhere.',
          ],
          code: `// src/main/paths.ts
const APP_DIR_NAME = 'UpralliSeva'

function dataRoot(): string {
  if (!app.isPackaged && process.env.UPRALLI_DEV_DATA)
    return resolve(process.env.UPRALLI_DEV_DATA)      // dev: project .devdata
  const local = process.platform === 'win32' && process.env.LOCALAPPDATA
    ? process.env.LOCALAPPDATA
    : app.getPath('appData')
  return join(local, APP_DIR_NAME)                    // %LOCALAPPDATA%\\UpralliSeva
}

export function getAppPaths(): AppPaths {
  const root = dataRoot()
  return { root, pgData: join(root, 'pgdata'), backups: join(root, 'backups'), configFile: join(root, 'config.json') }
}`,
          pitfalls: [
            'Storing data in the install directory, so updates/uninstalls wipe it.',
            'Using `app.getPath("userData")` blindly when a stable named folder under LOCALAPPDATA is wanted.',
            'Forgetting the dev override, so development scribbles into the real per-user data.',
            'Hard-coding sub-paths elsewhere instead of deriving them from `getAppPaths()`.',
            'Not creating the directories before use (cluster start needs `root`/`backups` to exist).',
            'Assuming `LOCALAPPDATA` is always set; keep the `appData` fallback for safety.',
          ],
          tryIt:
            'Call `getAppPaths()` in dev with and without `UPRALLI_DEV_DATA` set, and confirm the root flips between `.devdata` and `%LOCALAPPDATA%\\UpralliSeva`.',
          takeaway:
            'One `dataRoot()` puts `pgdata/`, `backups/`, and `config.json` under `%LOCALAPPDATA%\\UpralliSeva` — outside the install — so the register survives every update and uninstall.',
        },
        {
          id: 'm2-t14',
          title: 'The resumed flag: detect an existing cluster',
          explain:
            'Before initialising, we check for a `PG_VERSION` marker in `pgdata/`. If it exists, the cluster is already there — we **resume** it instead of re-initialising.',
          analogy:
            'Before building a new cabinet, the committee checks whether one is already standing in the strongroom. The `PG_VERSION` file is the cabinet\'s nameplate: if it is there, you just unlock and use the existing cabinet rather than tearing it down and building afresh (which would lose everything inside).',
          theory:
            'Every initialised PostgreSQL data directory contains a `PG_VERSION` file at its root — a reliable marker that `initdb` has already run. Our `isInitialised(pgData)` simply checks `existsSync(join(pgData, "PG_VERSION"))`.\n\nAt boot we compute `const resumed = isInitialised(paths.pgData)` BEFORE doing anything. If `resumed` is true, we skip `initialise()` (which would destroy the existing cluster) and go straight to `start()`. If false, this is a genuine first run, so we create the directory and initialise.\n\nThis flag also drives the **first-run vs resume** logging and seeding decisions downstream. A "kept data" reinstall — where the user reinstalled the app but left `%LOCALAPPDATA%\\UpralliSeva` intact — is detected as `resumed: true`, so the app picks up exactly where it left off, with all years and entries present.',
          whyItMatters:
            'This single boolean is the safety latch that prevents catastrophic data loss: it guarantees `initialise()` only ever runs when there is truly no cluster, so a reinstall or relaunch can never wipe the committee\'s existing register by re-initialising over it.',
          steps: [
            'Implement `isInitialised(pgData)` as an `existsSync` check for `PG_VERSION`.',
            'Compute `const resumed = isInitialised(paths.pgData)` at the very start of boot.',
            'Skip `initialise()` when `resumed` is true; run it (after ensuring the dir) when false.',
            'Pass `resumed` out in the boot handle for logging and seeding decisions.',
            'Log "initialised new cluster" vs "resumed existing cluster" using the flag.',
          ],
          code: `function isInitialised(pgData: string): boolean {
  return existsSync(join(pgData, 'PG_VERSION')) // marker left by initdb
}

export async function startDatabase(): Promise<DbHandle> {
  const paths = getAppPaths()
  ensureDir(paths.root); ensureDir(paths.backups)
  const resumed = isInitialised(paths.pgData)   // detect BEFORE touching the dir
  pg = new EmbeddedPostgresCtor({ /* ... */ })
  if (!resumed) { ensureDir(paths.pgData); await pg.initialise() }
  await pg.start()
  return { databaseUrl: databaseUrl(), resumed }
}`,
          pitfalls: [
            'Checking `resumed` AFTER creating the data dir, so the marker is misread.',
            'Re-initialising when `PG_VERSION` exists, destroying the user\'s register.',
            'Using folder existence instead of the `PG_VERSION` file — an empty dir is not an initialised cluster.',
            'Ignoring the flag downstream, so the app re-seeds default data over an existing year.',
            'Assuming a fresh OS user shares another user\'s cluster — each per-user root is independent.',
            'Not surfacing init-vs-resume in logs, making field diagnosis harder.',
          ],
          tryIt:
            'Run the boot once (init), then again (resume) against the same dir, and confirm `resumed` flips from false to true and `initialise()` is skipped the second time.',
          takeaway:
            'The `PG_VERSION` marker = "a cluster already exists here". Compute `resumed` first and only `initialise()` when false — the latch that makes reinstalls safe.',
        },
        {
          id: 'm2-t15',
          title: 'Running Prisma migrations at runtime under Electron',
          explain:
            'At runtime we have no system Node. We run the bundled Prisma CLI by spawning `process.execPath` with `ELECTRON_RUN_AS_NODE=1` and `migrate deploy --schema ...`.',
          analogy:
            'The committee\'s laptop has no separate "Node toolkit" installed. But Electron itself is secretly a Node engine in disguise. Flipping `ELECTRON_RUN_AS_NODE=1` is telling Electron "for this one task, act as a plain Node engine" — so it can run the mason\'s build instructions (the migrations) using the tools already inside the app.',
          theory:
            'A packaged Electron app cannot assume the user has Node installed, yet the Prisma CLI is a Node program. The trick: Electron\'s own binary (`process.execPath`) can run as Node if you set the environment variable `ELECTRON_RUN_AS_NODE=1`. We spawn it with `execFile`, passing the path to the bundled Prisma CLI script and the arguments `migrate deploy --schema <bundled schema path>`.\n\nWe also inject `DATABASE_URL` (the computed connection string for the just-started cluster) into the child\'s environment, so `migrate deploy` connects to the right database. `windowsHide: true` keeps a console window from flashing on screen.\n\nThis applies the authored migrations (never authors new ones) to bring the user\'s database up to the app\'s schema. It runs after `start()` and before the PrismaClient is used, so the schema is guaranteed current before any query executes.',
          whyItMatters:
            'This is how the offline app self-migrates with zero dependencies: no system Node, no manual SQL, no internet. A user who installs an update simply launches the app, and the bundled CLI quietly brings their existing register schema forward — invisible, automatic, and safe.',
          steps: [
            'Build the child env: `{ ...process.env, DATABASE_URL, ELECTRON_RUN_AS_NODE: "1" }`.',
            'Resolve `prismaCliPath()` and `schemaPath()` to the bundled files.',
            'Spawn `process.execPath` with `["migrate","deploy","--schema", schemaPath()]`.',
            'Pass `windowsHide: true` to avoid a flashing console window.',
            'Run this AFTER `start()` and BEFORE creating the PrismaClient.',
            'Surface non-zero exit codes as boot failures with the captured output.',
          ],
          code: `// src/main/db/prisma.ts
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
const execFileAsync = promisify(execFile)

export async function runMigrations(databaseUrl: string): Promise<void> {
  const env = { ...process.env, DATABASE_URL: databaseUrl, ELECTRON_RUN_AS_NODE: '1' }
  // Electron's own binary acts as Node -> runs the bundled Prisma CLI, no system Node
  await execFileAsync(
    process.execPath,
    [prismaCliPath(), 'migrate', 'deploy', '--schema', schemaPath()],
    { env, windowsHide: true },
  )
}`,
          pitfalls: [
            'Forgetting `ELECTRON_RUN_AS_NODE=1`, so `process.execPath` launches the GUI app instead of running the CLI.',
            'Not injecting `DATABASE_URL`, so `migrate deploy` cannot find the cluster.',
            'Using `migrate dev` at runtime, which can prompt or reset the user\'s data.',
            'Pointing `--schema` at a dev path that does not exist in the packaged app.',
            'Omitting `windowsHide: true`, flashing a console window at the user.',
            'Ignoring the child\'s exit code/stderr, so a failed migration passes silently.',
          ],
          tryIt:
            'Spawn `process.execPath` with `ELECTRON_RUN_AS_NODE=1` to run `node --version` (via the CLI path), confirming Electron runs as Node, then point it at `prisma migrate deploy`.',
          takeaway:
            'No system Node needed: `process.execPath` + `ELECTRON_RUN_AS_NODE=1` runs the bundled Prisma CLI to `migrate deploy` against the live cluster — silent, offline self-migration.',
        },
        {
          id: 'm2-t16',
          title: 'Creating the PrismaClient and disconnect/reconnect for restore',
          explain:
            'After migrations, we build a `PrismaClient` from the computed `databaseUrl`. For a backup restore, we `$disconnect()` before swapping data and reconnect after.',
          analogy:
            'The PrismaClient is the clerk holding an open key to the cabinet. To swap the entire register (restore a backup), the clerk must first set the key down (`$disconnect`) so no one is mid-write, the cabinet contents get replaced, and then the clerk picks the key back up to resume work.',
          theory:
            'We create the client with an explicit datasource URL rather than relying on `env`, because the URL is only known at runtime: `new PrismaClient({ datasources: { db: { url: connectionUrl } } })`. A lazy singleton (`db()`) ensures one shared client across the main process.\n\nFor a **restore**, you cannot replace the database files while a client holds open connections. So the flow is: `await db().$disconnect()`, perform the restore (e.g. drop/recreate from a backup), then create a fresh client (or reconnect) so subsequent queries hit the restored data. Holding a connection open during a file-level swap risks corruption or locked-file errors.\n\nThis explicit lifecycle — construct from a computed URL, disconnect around destructive operations — keeps the single offline cluster consistent even through backup and restore, which is essential for a committee that relies on `backups/` to recover from mistakes.',
          whyItMatters:
            'Restores are the committee\'s safety net. Doing them without `$disconnect`/reconnect risks a half-connected client corrupting the swap. The explicit dance guarantees a restored register is clean and immediately queryable.',
          steps: [
            'Build the client with `datasources: { db: { url: connectionUrl } }`.',
            'Expose a lazy singleton `db()` so the whole main shares one client.',
            'Before a restore, call `await db().$disconnect()`.',
            'Perform the restore (replace data from a backup).',
            'Recreate/reconnect the client so later queries see the restored data.',
            'Call `$disconnect()` as part of clean shutdown alongside `stopDatabase()`.',
          ],
          code: `let prisma: PrismaClient | null = null
let connectionUrl: string | null = null

export function setConnectionUrl(url: string) { connectionUrl = url }

export function db(): PrismaClient {
  if (!prisma) prisma = new PrismaClient({ datasources: { db: { url: connectionUrl! } } })
  return prisma
}

export async function restoreFrom(backup: string): Promise<void> {
  await db().$disconnect()      // release the cabinet key
  prisma = null
  await applyBackup(backup)     // swap the register contents
  db()                          // reconnect: fresh client on restored data
}`,
          pitfalls: [
            'Relying on `env("DATABASE_URL")` for the client when the URL is only known at runtime.',
            'Creating a new PrismaClient per query instead of a shared singleton, exhausting connections.',
            'Restoring without `$disconnect()`, hitting locked-file or corruption errors.',
            'Forgetting to recreate the client after restore, so queries hit a stale connection.',
            'Not disconnecting on shutdown, leaving the cluster busy when `stop()` runs.',
            'Sharing one client across processes — keep PrismaClient in MAIN only.',
          ],
          tryIt:
            'Build a `db()` singleton from a computed URL, run a query, then simulate a restore: `$disconnect()`, null the client, and `db()` again — confirm queries resume.',
          takeaway:
            'Construct PrismaClient from the runtime `databaseUrl` as a lazy singleton; for restore, `$disconnect()` → swap → reconnect so the restored register is clean and queryable.',
        },
        {
          id: 'm2-t17',
          title: 'First-run flow end to end: boot, migrate, seed',
          explain:
            'The full cold-start sequence: start the cluster → run migrations → if the database is empty, seed the first year and default pooja types.',
          analogy:
            'Opening a brand-new temple office on day one: unlock and power up the cabinet (start), have the mason build the drawers per blueprint (migrate), and then write the opening lines — the first year\'s page and its standard pooja columns — so the committee can begin recording immediately.',
          theory:
            'The boot orchestrator ties every prior topic together. It calls `startDatabase()` (which initialises or resumes and starts the cluster), then `runMigrations(databaseUrl)` to bring the schema current, then constructs the PrismaClient. Finally it checks whether any `Year` exists; if none, it **seeds** a first year plus the committee\'s default `PoojaType` rows (with Kannada names and rates).\n\nSeeding is guarded by an emptiness check so it runs **only on a true first run** — a `resumed` cluster with existing years is left untouched. This uses the `resumed` flag and/or a `db.year.count()` of zero to decide. The seed itself uses a `$transaction` so the year and its pooja types appear together or not at all.\n\nThe orchestrator logs whether it initialised a new cluster or resumed an existing one, giving field-level visibility. When it returns, the renderer can immediately query a fully migrated, populated register through `window.api` — the offline app is "open for business".',
          whyItMatters:
            'This sequence is the difference between a freshly installed app showing an empty, confusing screen and one that opens to a ready first-year register with the committee\'s standard poojas already listed. It is the user\'s entire first impression — and it must be correct on machine number one.',
          steps: [
            'Call `startDatabase()` and capture `{ databaseUrl, resumed }`.',
            'Call `runMigrations(databaseUrl)` to apply pending migrations.',
            'Set the connection URL and create the PrismaClient.',
            'Check `await db().year.count()`; if zero, seed in a `$transaction`.',
            'Seed the first `Year` plus default `PoojaType` rows with Kannada names and rates.',
            'Log "initialised" vs "resumed", and bind `stopDatabase()` to `will-quit`.',
          ],
          code: `// src/main/boot.ts
export async function boot(): Promise<void> {
  const { databaseUrl, resumed } = await startDatabase()  // init or resume + start
  await runMigrations(databaseUrl)                        // apply migrations
  setConnectionUrl(databaseUrl)

  if ((await db().year.count()) === 0) {                  // true first run only
    const thisYear = new Date().getFullYear()
    await db().$transaction([
      db().year.create({ data: { year: thisYear } }),
      db().poojaType.create({ data: { name: '\\u0CB0\\u0C82\\u0C97\\u0CAA\\u0CC2\\u0C9C\\u0CC6', rate: '250.00', yearId: 1 } }),
    ])
  }
  console.log(resumed ? 'resumed existing cluster' : 'initialised new cluster')
}`,
          pitfalls: [
            'Seeding without an emptiness check, so a `resumed` cluster gets duplicate default rows.',
            'Running migrations before `start()`, so there is no live cluster to migrate.',
            'Creating the PrismaClient before migrations finish, querying a non-existent schema.',
            'Seeding outside a `$transaction`, leaving a year with no pooja types if a step fails.',
            'Hard-coding `yearId: 1` without confirming the created year\'s id in a real seed.',
            'Not logging init-vs-resume, losing the one breadcrumb that explains field behaviour.',
          ],
          tryIt:
            'Run `boot()` against a clean dir (expect init + migrate + seed), then run it again (expect resume, migrate no-op, and NO re-seed because a year exists).',
          takeaway:
            'First-run flow = start → migrate → seed-if-empty, all guarded by the emptiness/resume check. It opens the app to a ready first-year register on a brand-new machine.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm2-p1',
      type: 'guided',
      title: 'Bundle Postgres + first-run boot',
      domain: 'Upralli Seva — offline temple register (Electron main process)',
      duration: '4-5 hours',
      description:
        'Build the main-process `startDatabase()` that bundles a portable PostgreSQL with `embedded-postgres`, points it at the per-user `pgdata/` with UTF-8 init flags, detects an existing cluster via the `resumed` check, and wire an end-to-end boot that starts the cluster, runs `migrate deploy`, and logs init-vs-resume.',
      tools: ['Electron + electron-vite', 'TypeScript', 'embedded-postgres', 'Prisma CLI', 'Node child_process'],
      blueprint: {
        overview:
          'You are assembling the heart of Upralli Seva\'s offline data layer. The goal is a single `startDatabase()` and a `boot()` orchestrator in the Electron MAIN process that make a fresh PC "just work": a bundled Postgres cluster comes up under `%LOCALAPPDATA%\\UpralliSeva\\pgdata`, initialised UTF-8 so Kannada is safe, resumed (never re-initialised) on later launches, migrated with the bundled Prisma CLI, and clearly logging whether it created a new cluster or resumed an existing one.',
        functionalRequirements: [
          'On first run, initialise a new portable Postgres cluster in the per-user `pgdata/`; on later runs, resume it without re-initialising.',
          'Initialise with `--encoding=UTF8` and `--locale=C` so Kannada household names never corrupt.',
          'Start the cluster on app ready, create the `upralli` database idempotently, and stop it on `will-quit`.',
          'Run `prisma migrate deploy` at runtime via `process.execPath` + `ELECTRON_RUN_AS_NODE=1`, with no system Node required.',
          'Log "initialised new cluster" vs "resumed existing cluster" using the `resumed` flag.',
        ],
        technicalImplementation: [
          'Implement `paths.ts` with `dataRoot()` (prefers `LOCALAPPDATA`, honours `UPRALLI_DEV_DATA`) and `getAppPaths()` deriving `pgData`/`backups`/`configFile`.',
          'In `postgres-lifecycle.ts`, define the constants and `databaseUrl()`, `isInitialised()` (PG_VERSION check), and `startDatabase()` loading `embedded-postgres` via dynamic `import`.',
          'Guard `initialise()` behind `!resumed`, always `start()`, and wrap `createDatabase(DB_NAME)` in a try/catch that ignores "already exists".',
          'In `prisma.ts`, implement `runMigrations(url)` spawning the bundled Prisma CLI with the injected `DATABASE_URL` and `windowsHide: true`.',
          'Write `boot()` to call `startDatabase()` → `runMigrations()` → log resume status, and bind `stopDatabase()` to Electron `will-quit`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Per-user paths + cluster config',
            outcome:
              'A `paths.ts` resolving the data root under `%LOCALAPPDATA%\\UpralliSeva` (with a dev override), and the shared cluster constants + `databaseUrl()`.',
            prompt:
              'In a TypeScript Electron MAIN module, write `paths.ts` exporting `getAppPaths()` built on a `dataRoot()` that returns `resolve(process.env.UPRALLI_DEV_DATA)` when not packaged and the var is set, otherwise `join(LOCALAPPDATA or app.getPath("appData"), "UpralliSeva")`; derive `root`, `pgData`, `backups`, `configFile`. Then in `postgres-lifecycle.ts` export `PG_PORT=54329`, `PG_USER`, `PG_PASSWORD`, `DB_NAME="upralli"`, and `databaseUrl()` building `postgresql://user:pass@localhost:54329/upralli`. Explain why the data root must sit outside the install directory.',
          },
          {
            step: 2,
            label: 'startDatabase() with resume + UTF-8',
            outcome:
              'A `startDatabase()` that detects an existing cluster, initialises (UTF-8) only when needed, starts it, and creates the database idempotently.',
            prompt:
              'Write `startDatabase(): Promise<DbHandle>` for a CJS Electron main. Compute `resumed = existsSync(join(pgData,"PG_VERSION"))` BEFORE touching the dir. Load the ESM-only package via `const { default: EmbeddedPostgresCtor } = await import("embedded-postgres")`. Construct it with the per-user `databaseDir`, the constants, `persistent: true`, and `initdbFlags: ["--encoding=UTF8","--locale=C"]`. If `!resumed`, ensure the dir and `await pg.initialise()`. Always `await pg.start()`, then `await pg.createDatabase(DB_NAME)` inside a try/catch that rethrows unless the error matches /already exists/i. Return `{ databaseUrl: databaseUrl(), resumed }`. Explain each gotcha (ESM import, UTF-8, resume).',
          },
          {
            step: 3,
            label: 'Runtime migrate + boot orchestrator',
            outcome:
              'A `runMigrations()` that runs the bundled Prisma CLI under Electron-as-Node, and a `boot()` that starts, migrates, and logs init-vs-resume.',
            prompt:
              'Write `runMigrations(databaseUrl: string)` that `execFile`s `process.execPath` with `[prismaCliPath(), "migrate", "deploy", "--schema", schemaPath()]`, env `{ ...process.env, DATABASE_URL: databaseUrl, ELECTRON_RUN_AS_NODE: "1" }`, and `windowsHide: true`; explain why `ELECTRON_RUN_AS_NODE` is required and why we use `migrate deploy` not `dev`. Then write `boot()` that awaits `startDatabase()`, calls `runMigrations(databaseUrl)`, logs `resumed ? "resumed existing cluster" : "initialised new cluster"`, and binds `stopDatabase()` to Electron\'s `will-quit`. Surface a non-zero migration exit as a boot failure.',
          },
        ],
      },
    },
    {
      id: 'm2-p2',
      type: 'guided',
      title: 'Prisma schema + migrate',
      domain: 'Upralli Seva — pooja register data model',
      duration: '4-5 hours',
      description:
        'Set up `schema.prisma` for PostgreSQL with `multiSchema` and a `pooja_register` namespace, define the first models, run `prisma migrate dev` to author the migration, generate the client, and prove a typed `findMany`/`create` round-trips Kannada text against the bundled cluster.',
      tools: ['Prisma 5', 'PostgreSQL (embedded-postgres)', 'TypeScript', '@prisma/client', 'Prisma CLI'],
      blueprint: {
        overview:
          'You will author the data model that every later Upralli Seva feature depends on. Configure Prisma for the bundled Postgres, enable the `multiSchema` preview to namespace the pooja register under `pooja_register`, model Year/PoojaType/PersonEntry with `Decimal` money, author and apply the first migration, and write a small typed script that creates and reads back a household with a Kannada name to prove the UTF-8 cluster round-trips correctly.',
        functionalRequirements: [
          'A `schema.prisma` with a `postgresql` datasource using `env("DATABASE_URL")`, `multiSchema`, and a `pooja_register` schema.',
          'Models for `Year` (unique year + `locked`), `PoojaType` (Decimal `rate`), and `PersonEntry` (Kannada name/address), all `@@schema("pooja_register")`.',
          'An authored migration created with `prisma migrate dev` and a generated `@prisma/client`.',
          'A typed `create` then `findMany`/`findFirst` round-trip that proves Kannada text is stored and read back intact.',
          'Money handled as `Decimal`, with totals computed exactly and formatted with Indian grouping only at the edge.',
        ],
        technicalImplementation: [
          'Write the `datasource`/`generator` blocks with `previewFeatures = ["multiSchema"]` and `schemas = ["pooja_register"]`.',
          'Define the three models with relations (`Year` owns `PoojaType[]` and `PersonEntry[]`) and `@db.Decimal(10,2)` for `rate`.',
          'Point `DATABASE_URL` at the bundled cluster, run `npx prisma migrate dev --name init`, and inspect the generated `migration.sql`.',
          'Run `npx prisma generate` and import `PrismaClient` in a MAIN-side script.',
          'Write a `$transaction` that creates a `Year` + `PersonEntry` with a Kannada name, then read it back and assert the characters match.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Schema with multiSchema + models',
            outcome:
              'A valid `schema.prisma` with the `pooja_register` namespace and the three core models using Decimal money.',
            prompt:
              'Write a `schema.prisma` for PostgreSQL: a `datasource db` with `provider="postgresql"`, `url=env("DATABASE_URL")`, `schemas=["pooja_register"]`; a `generator client` with `provider="prisma-client-js"` and `previewFeatures=["multiSchema"]`. Add models `Year` (`id` autoincrement, `year Int @unique`, `locked Boolean @default(false)`, relations to `PoojaType[]` and `PersonEntry[]`), `PoojaType` (`name String`, `rate Decimal @db.Decimal(10,2)`, `yearId` + relation), and `PersonEntry` (Kannada `name`/`address String`, `yearId` + relation). Tag every model `@@schema("pooja_register")`. Explain why money is `Decimal` and why per-year ownership matters.',
          },
          {
            step: 2,
            label: 'Author migration + generate client',
            outcome:
              'An applied first migration under `prisma/migrations/` and a generated typed client.',
            prompt:
              'Given the schema and a `DATABASE_URL` pointing at the bundled `upralli` cluster (`postgresql://postgres:upralli_local@localhost:54329/upralli`), walk through running `npx prisma migrate dev --name init`: what files it creates under `prisma/migrations/`, how it applies them, and how it regenerates `@prisma/client`. Show the rough shape of the generated `migration.sql` (creating the `pooja_register` schema and the three tables). Then explain when to run `npx prisma generate` standalone and why the packaged app uses `migrate deploy` at runtime instead of `migrate dev`.',
          },
          {
            step: 3,
            label: 'Prove a Kannada round-trip',
            outcome:
              'A typed script that creates a year + household with a Kannada name and reads it back unchanged, proving UTF-8.',
            prompt:
              'Write a TypeScript script using `PrismaClient` (constructed with `datasources.db.url` from the runtime URL) that, in a `$transaction`, creates a `Year` for the current year and a `PersonEntry` whose `name` is a Kannada string (e.g. "ಉಪ್ರಳ್ಳಿ ಮನೆ"). Then `findFirst` the year with `include: { persons: true }`, assert the returned `name` exactly equals the input, and log success. Explain how this proves the cluster was initialised UTF-8, why `Decimal` rates must be passed as strings, and why this client/query code lives in the MAIN process, not the renderer.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm2-q1',
      q: 'Why does Upralli Seva pass `initdbFlags: ["--encoding=UTF8","--locale=C"]` when creating the embedded Postgres cluster?',
      options: [
        'It makes the database start faster on Windows',
        'Without it, Windows initdb defaults to WIN1252 and Kannada text corrupts; encoding is fixed permanently at init',
        'It enables the multiSchema preview feature',
        'It is required for the Prisma client to generate',
      ],
      answer: 1,
    },
    {
      id: 'm2-q2',
      q: 'Why is `embedded-postgres` loaded with `const { default } = await import("embedded-postgres")` instead of a top-level import?',
      options: [
        'Dynamic import is faster at startup',
        'It avoids bundling the package into the renderer',
        'The package is ESM-only but the bundled Electron main is CommonJS, so a static import/require throws ERR_REQUIRE_ESM',
        'It is the only way to pass the UTF-8 flags',
      ],
      answer: 2,
    },
    {
      id: 'm2-q3',
      q: 'At runtime in the packaged app, how does Upralli Seva run `prisma migrate deploy` without a system Node install?',
      options: [
        'It bundles a separate Node.js binary in the installer',
        'It runs migrations through the renderer process',
        'It spawns `process.execPath` (the Electron binary) with `ELECTRON_RUN_AS_NODE=1` so Electron acts as Node',
        'It connects to a cloud Prisma service to migrate remotely',
      ],
      answer: 2,
    },
    {
      id: 'm2-q4',
      q: 'What does the `resumed` flag (from the `PG_VERSION` check) protect against?',
      options: [
        'It prevents the renderer from accessing the database directly',
        'It detects an existing cluster so `initialise()` is skipped, preventing re-initialisation from wiping the committee\'s data',
        'It chooses between dev and packaged database URLs',
        'It enables transactions in PrismaClient',
      ],
      answer: 1,
    },
    {
      id: 'm2-q5',
      q: 'Why are pooja rates and ₹ totals stored as Prisma `Decimal` (`@db.Decimal(10,2)`) rather than `Float`?',
      options: [
        'Decimal columns sort faster in PostgreSQL',
        'Float is not supported by the multiSchema preview',
        'Floating-point cannot represent decimal money exactly, so totals drift; Decimal/numeric stores exact values',
        'Decimal automatically applies Indian digit grouping',
      ],
      answer: 2,
    },
    {
      id: 'm2-q6',
      q: 'Why must Upralli Seva use `prisma migrate deploy` (not `migrate dev`) at runtime against a user\'s database?',
      options: [
        '`migrate deploy` generates the client while `migrate dev` does not',
        '`migrate dev` only works on macOS',
        '`migrate deploy` applies already-authored migrations without prompting or resetting, while `migrate dev` can author/reset and destroy real data',
        '`migrate deploy` is required to enable the pooja_register schema',
      ],
      answer: 2,
    },
  ],
};
