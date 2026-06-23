// Module M8 — Backups, Restore, Import & PDF Export (Upralli Seva)
// Teach the offline data-safety story for a coastal-Karnataka temple register:
// because bundled embedded-postgres ships no pg_dump, we back up with a full
// logical JSON snapshot taken through Prisma, restore it inside one transaction
// (delete child-first, re-insert parent-first, then re-sync the autoincrement
// sequences), run a one-time idempotent import of the old Flutter+Firestore
// register, and export a year's register to A4 PDF via Chromium's printToPDF on
// a hidden offscreen window so Kannada conjuncts render correctly with the
// bundled Noto Sans Kannada font embedded as a base64 data: URL.

export const m8 = {
  id: 'm8',
  title: 'Backups, Restore, Import & PDF Export',
  hours: 9,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Make the offline temple register safe and portable: back it up as a full logical JSON snapshot through Prisma (embedded-postgres ships no pg_dump), take a daily snapshot on startup, restore everything inside one transaction with the autoincrement sequences re-synced, run a one-time idempotent import of the old Flutter+Firestore data with Kannada preserved byte-for-byte, and export the year as an A4 PDF via Chromium printToPDF on a hidden offscreen window with the bundled Noto font embedded.',
  sections: [
    {
      id: 'm8-s1',
      title: 'Backups & restore (offline, no pg_dump!)',
      topics: [
        {
          id: 'm8-t1',
          title: 'Why there is no pg_dump',
          explain:
            'The app bundles **embedded-postgres**, which ships only the server binaries — there is no `pg_dump` or `pg_restore` on disk — so the usual "dump the database" backup is simply not available.',
          analogy:
            'It is like the temple committee owning the ledger and the lockable cupboard it lives in, but not the photocopier. The register is right there, fully readable, yet the one machine everyone reaches for to make a safe copy was never delivered with the cupboard. You cannot wait for a photocopier that is not coming — you copy the register out by hand instead.',
          theory:
            'On a server you reach for `pg_dump` without thinking: it walks the catalog and writes a portable dump. But **embedded-postgres** — the package that lets us run a private PostgreSQL inside the desktop app — bundles only the **server** executables needed to start the database. The client tools `pg_dump` and `pg_restore` are not part of that bundle, and we deliberately do not ship them.\n\nThat is the pivot of this whole module. Because we cannot dump, we must define our own backup format. Our data is tiny — a village temple register of maganes, years, pooja types and participations — so the simplest reliable format is a **logical JSON snapshot**: read every table through Prisma and write the rows to one `.json` file.\n\nJSON here is a feature, not a compromise. It is **human-readable** (you can open it and see Kannada names), **version-independent** (it does not care which Postgres minor version wrote it), and it survives a "keep my data" uninstall exactly like any other file under the data root. Trying to fake `pg_dump` with a separately downloaded binary would add a fragile moving part for no benefit at this scale.',
          whyItMatters:
            'If you assume `pg_dump` exists, your backup feature will fail silently on a user machine where the binary was never installed — the worst possible time to discover it. Accepting up front that the snapshot is logical JSON through Prisma gives you a backup that always works, reads cleanly, and outlives Postgres upgrades.',
          steps: [
            'Confirm embedded-postgres ships server binaries only — no `pg_dump`/`pg_restore`.',
            'Decide the backup format is a logical JSON snapshot, not a binary dump.',
            'Plan to read every table through **Prisma** in MAIN, never raw SQL clients.',
            'Pick the data root: `%LOCALAPPDATA%\\UpralliSeva` with a sibling `backups/` folder.',
            'Note JSON is human-readable, version-independent, and survives a keep-data uninstall.',
            'Reject the idea of bundling a separate `pg_dump` binary for a dataset this small.',
          ],
          code: `// embedded-postgres gives us a SERVER, not the client tools.\n` +
            `// So there is no pg_dump to call — we define our own backup format.\n` +
            `import { app } from 'electron';\n` +
            `import path from 'node:path';\n\n` +
            `// %LOCALAPPDATA%\\UpralliSeva on Windows.\n` +
            `export function dataRoot() {\n` +
            `  return path.join(app.getPath('appData'), 'UpralliSeva');\n` +
            `}\n\n` +
            `// A sibling folder, like the cupboard shelf where copies are kept.\n` +
            `export function backupsDir() {\n` +
            `  return path.join(dataRoot(), 'backups');\n` +
            `}`,
          pitfalls: [
            '**Assuming `pg_dump` is available.** embedded-postgres ships server binaries only; the call will fail on the user machine.',
            '**Shipping a separate `pg_dump` binary to fake it.** A fragile, platform-specific moving part for a dataset this tiny.',
            '**Backing up the raw Postgres data directory by copying files.** That is version-locked and breaks across upgrades; snapshot logically instead.',
            '**Writing the snapshot somewhere outside the data root.** Keep `backups/` beside the data so it survives a keep-data uninstall.',
            '**Reaching for a raw `pg` client to read rows.** Use Prisma in MAIN so the snapshot matches the schema the app actually uses.',
            '**Treating JSON as "not a real backup".** For a small register it is reliable, readable, and version-independent — exactly what you want.',
          ],
          tryIt:
            'Search your packaged app folder (and the embedded-postgres install) for `pg_dump`. Confirm it is absent, then write the two helper functions above and log `backupsDir()` to see where snapshots will live under `%LOCALAPPDATA%\\UpralliSeva`.',
          takeaway:
            'embedded-postgres has no `pg_dump`, so the backup is a logical JSON snapshot read through Prisma — human-readable, version-independent, and stored in a `backups/` folder beside the data root.',
        },
        {
          id: 'm8-t2',
          title: 'Building the JSON snapshot via Prisma',
          explain:
            'A snapshot is one object: `findMany` on every table — maganes, years, pooja types, person entries, participations — wrapped with a `version` and a `createdAt`, written as one pretty-printed JSON file.',
          analogy:
            'This is the committee photocopying the entire register for safekeeping: every page of every section copied in order, then stapled with a cover sheet that says which edition it is and the date it was copied. The cover sheet (the `version` and `createdAt`) is what lets a future reader trust and re-shelve the copy correctly.',
          theory:
            'The snapshot is deliberately boring: for each model we call **`prisma.<model>.findMany()`** and collect the rows. We run the five reads together with `Promise.all` because they are independent, then assemble a single object with a small envelope — a `version` number and a `createdAt` timestamp — around a `data` field holding all the rows.\n\nThe `version` matters more than it looks. It is a promise to your future self: "this is what shape the file is in." When the schema grows, a restore routine can read `version` and adapt, instead of guessing. The `createdAt` lets you name files and tell two backups apart.\n\nWriting it out is one `writeFileSync` of `JSON.stringify(snapshot, null, 2)` — pretty-printed so a human can open it and read the Kannada names directly. Because Prisma returns plain JS objects (dates as `Date`, decimals as configured), `JSON.stringify` serialises them cleanly. The whole thing lives in MAIN; the renderer never touches the database or the filesystem.',
          whyItMatters:
            'Reading every table with `findMany` guarantees the snapshot is complete — miss one table and a restore quietly loses data. The `version` envelope is the difference between a backup you can confidently restore years later and an undated blob nobody trusts.',
          steps: [
            'For each model call `prisma.<model>.findMany()`; run the five reads with `Promise.all`.',
            'Order matters for readability: maganes, years, poojaTypes, personEntries, participations.',
            'Wrap the rows in an envelope: `{ version, createdAt, data: { ... } }`.',
            'Set `version: 1` now so future restores can branch on the shape.',
            'Stringify with `JSON.stringify(snapshot, null, 2)` so it is human-readable.',
            'Write it from MAIN with `writeFileSync`; the renderer never sees the database.',
          ],
          code: `// src/main/db/backup.ts — a full logical snapshot through Prisma.\n` +
            `async function buildSnapshot(prisma) {\n` +
            `  const [maganes, years, poojaTypes, personEntries, participations] =\n` +
            `    await Promise.all([\n` +
            `      prisma.magane.findMany(),\n` +
            `      prisma.year.findMany(),\n` +
            `      prisma.poojaType.findMany(),\n` +
            `      prisma.personEntry.findMany(),\n` +
            `      prisma.participation.findMany(),\n` +
            `    ]);\n` +
            `  return {\n` +
            `    version: 1,\n` +
            `    createdAt: new Date().toISOString(),\n` +
            `    data: { maganes, years, poojaTypes, personEntries, participations },\n` +
            `  };\n` +
            `}`,
          pitfalls: [
            '**Forgetting a table.** Every model must be in the snapshot, or restore silently drops that data.',
            '**Omitting the `version` field.** Without it a future restore cannot tell what shape the file is in.',
            '**Stringifying without indentation.** Pretty-print so a human can open the file and read Kannada names.',
            '**Running the reads sequentially.** They are independent; `Promise.all` keeps the snapshot fast.',
            '**Building the snapshot in the renderer.** Prisma and `fs` live in MAIN; the UI only asks over IPC.',
            '**Assuming Prisma `Decimal`/`Date` serialise however you expect.** Verify the JSON shape once so restore reads it back correctly.',
          ],
          tryIt:
            'Write `buildSnapshot(prisma)` and dump its result to the console as pretty JSON. Confirm every model appears under `data`, that `version` and `createdAt` are present, and that a Kannada magane name is readable in the output.',
          takeaway:
            'A snapshot is `findMany` over every model wrapped in a `{ version, createdAt, data }` envelope and written as pretty JSON from MAIN — complete, dated, and human-readable.',
        },
        {
          id: 'm8-t3',
          title: 'A daily backup on startup',
          explain:
            'A desktop app is not always running, so instead of a fixed-time scheduler the app takes **one backup on startup if none exists for today** — and a failure is logged, never fatal.',
          analogy:
            'A village committee clerk does not photocopy the register at exactly 9:00 every morning — some days the office opens late, some days not at all. The sensible rule is: the first time anyone opens the office today, check whether today\'s copy was already made, and if not, make it. The temple still opens even if the photocopier jams; the copy is a precaution, not a gate.',
          theory:
            'On a server you would schedule a backup with cron at a fixed time. A **desktop app cannot rely on that** — it only runs when the user opens it, which might be twice today and not at all tomorrow. So the trigger is event-based: **on startup, if there is no backup for today, make one.**\n\n`hasBackupForToday()` checks the `backups/` folder for a file whose date stamp matches today. If one exists we skip; otherwise we call `createBackup(prisma)`, which builds the snapshot and writes it with a dated filename. This gives at most one automatic backup per day, no matter how often the app is opened.\n\nCrucially the whole thing is **non-fatal**. It runs inside a `try/catch` and, on failure, logs the error and moves on. A backup that fails must never block the user from opening their register — the app starting is more important than today\'s precautionary copy. Manual "Backup now" (next topic) is always available as a fallback.',
          whyItMatters:
            'A fixed-time scheduler silently never runs on a machine that is asleep at that hour, leaving the user with no backups exactly when they think they are protected. The "once per day on open" rule matches how desktop apps are actually used, and making it non-fatal means a backup bug can never lock someone out of their data.',
          steps: [
            'On app startup, call `backupOnStartupIfNeeded(prisma)` after the database is ready.',
            'Inside it, check `hasBackupForToday()` against the `backups/` folder.',
            'If a backup for today exists, do nothing; otherwise call `createBackup(prisma)`.',
            'Wrap the whole thing in `try/catch` so a failure is logged, not thrown.',
            'Stamp backup filenames with the date so "today" is easy to detect.',
            'Keep manual "Backup now" available so the user is never dependent on startup alone.',
          ],
          code: `// src/main/db/backup.ts — at most one automatic backup per day.\n` +
            `export async function backupOnStartupIfNeeded(prisma) {\n` +
            `  try {\n` +
            `    if (!hasBackupForToday()) await createBackup(prisma);\n` +
            `  } catch (err) {\n` +
            `    // Non-fatal: never block the register from opening.\n` +
            `    console.error('Daily backup failed:', err);\n` +
            `  }\n` +
            `}\n\n` +
            `function hasBackupForToday() {\n` +
            `  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD\n` +
            `  return fs.readdirSync(backupsDir())\n` +
            `    .some((name) => name.includes(today));\n` +
            `}`,
          pitfalls: [
            '**Using a fixed-time scheduler.** A desktop app may be closed at that hour and silently never back up.',
            '**Letting a backup failure throw on startup.** It must be caught and logged so the register still opens.',
            '**Backing up on every launch.** Check for today\'s file first so re-opening the app does not pile up duplicates.',
            '**Detecting "today" with file mtimes.** Stamp the date into the filename so the check is simple and reliable.',
            '**Running the backup before the database is ready.** Sequence it after Prisma/Postgres are up.',
            '**Removing manual "Backup now".** Startup backups can fail; the user needs a guaranteed manual path.',
          ],
          tryIt:
            'Wire `backupOnStartupIfNeeded(prisma)` into your app-ready handler. Launch the app twice in a row and confirm only one backup file appears for today; then delete it, relaunch, and confirm a fresh one is created.',
          takeaway:
            'Back up once per day on startup only if today\'s backup is missing, wrapped in `try/catch` so a failure is logged and never blocks the user from opening their register.',
        },
        {
          id: 'm8-t4',
          title: 'Restoring inside one transaction',
          explain:
            'Restore **replaces all data** inside a single Prisma `$transaction`: delete children before parents to respect foreign keys, then re-insert parents before children, **preserving the original ids**.',
          analogy:
            'Restoring is re-shelving a photocopied register over the live one in a single locked session: you do not tear out half the pages and leave for tea. You remove the dependent slips first (the participation chits that point at a household), then the households, then the years — and you put them back in the reverse order, keeping every original page number so the cross-references still line up. The cupboard is locked the whole time so nobody reads a half-restored register.',
          theory:
            'A restore is destructive: it throws away the current data and writes the snapshot in its place. Doing that half-way would corrupt the register, so it must be **atomic** — all of it or none of it. Prisma\'s **`$transaction`** gives us exactly that: everything inside either commits together or rolls back together.\n\nForeign keys force the **order**. A `Participation` points at a `PersonEntry` and a `PoojaType`, which point at a `Year` and a `Magane`. So we **delete child-first**: participations, then person entries, then pooja types, then years, then maganes. Re-inserting runs the other way — **parent-first** — so each child has its parent waiting.\n\nWe insert with the **original ids preserved**. The snapshot recorded `id` values, and the cross-references (foreign keys) only line up if we restore those same ids rather than letting Postgres assign new ones. `createMany` with the rows as-is keeps the ids intact. (Re-synchronising the autoincrement counters after this is the next topic.)',
          whyItMatters:
            'Without a transaction, a restore that fails halfway leaves the register in a broken in-between state with dangling references — far worse than not restoring at all. Getting delete/insert order and id preservation right is what makes the restored register identical to the snapshot, with every participation still pointing at the right household.',
          steps: [
            'Run the entire restore inside one `prisma.$transaction(async (tx) => { ... })`.',
            'Delete child-first: participations → personEntries → poojaTypes → years → maganes.',
            'Re-insert parent-first: maganes → years → poojaTypes → personEntries → participations.',
            'Use `createMany` with the snapshot rows as-is to preserve the original `id` values.',
            'Do not let Postgres assign new ids — foreign keys depend on the saved ones.',
            'Leave sequence re-sync to the next step; finish the data swap first.',
          ],
          code: `// src/main/db/backup.ts — atomic replace, FK-safe order, ids preserved.\n` +
            `export async function restore(prisma, snapshot) {\n` +
            `  const d = snapshot.data;\n` +
            `  await prisma.$transaction(async (tx) => {\n` +
            `    // Delete child-first so foreign keys never dangle.\n` +
            `    await tx.participation.deleteMany();\n` +
            `    await tx.personEntry.deleteMany();\n` +
            `    await tx.poojaType.deleteMany();\n` +
            `    await tx.year.deleteMany();\n` +
            `    await tx.magane.deleteMany();\n\n` +
            `    // Re-insert parent-first, keeping the original ids.\n` +
            `    await tx.magane.createMany({ data: d.maganes });\n` +
            `    await tx.year.createMany({ data: d.years });\n` +
            `    await tx.poojaType.createMany({ data: d.poojaTypes });\n` +
            `    await tx.personEntry.createMany({ data: d.personEntries });\n` +
            `    await tx.participation.createMany({ data: d.participations });\n` +
            `    // (re-sync sequences next — see the following topic)\n` +
            `  });\n` +
            `}`,
          pitfalls: [
            '**Restoring without a transaction.** A mid-restore failure leaves a corrupted, half-replaced register.',
            '**Deleting parents before children.** Foreign keys will reject it; delete child-first.',
            '**Re-inserting children before parents.** The parent row must exist first; insert parent-first.',
            '**Letting Postgres assign new ids on insert.** Foreign keys break; preserve the snapshot ids.',
            '**Mixing `tx` and `prisma` inside the block.** Use the transaction client `tx` for every statement so it is truly atomic.',
            '**Forgetting the sequence re-sync.** Ids are preserved but the counters are stale until you fix them (next topic).',
          ],
          tryIt:
            'Take a snapshot, add a few rows, then restore the snapshot and confirm the added rows are gone and every original id is back. Force an error mid-restore (e.g. malformed data) and confirm the whole thing rolls back, leaving the register unchanged.',
          takeaway:
            'Restore replaces all data in one `$transaction`: delete child-first, re-insert parent-first with `createMany`, and preserve the snapshot ids so foreign keys still line up.',
        },
        {
          id: 'm8-t5',
          title: 'Re-syncing the autoincrement sequences',
          explain:
            'After inserting rows with their old ids, Postgres\'s autoincrement counters are stale, so the next insert would collide — fix each with `setval(pg_get_serial_sequence(...), GREATEST(MAX(id), 1))`.',
          analogy:
            'You re-shelved the register keeping page numbers up to 2280, but the "next blank page" ticket dispenser still thinks the last page was number 1. The very next household added would be handed page "2" — a number already taken. Re-syncing winds the dispenser forward to "after the highest page in use" so the next ticket is genuinely fresh.',
          theory:
            'Postgres `serial`/`identity` ids come from a hidden **sequence** — a counter that hands out the next number. When you insert rows with explicit ids (as restore does), the counter is **not** advanced: it still points wherever it was, usually far below your restored ids. The next ordinary insert would then try an id that already exists and fail with a unique-violation.\n\nThe fix is to **`setval`** each table\'s sequence to its current maximum id. We find the sequence name without hard-coding it using **`pg_get_serial_sequence(\'"pooja_register"."maganes"\', \'id\')`** — passing the schema-qualified table and the column — and set it to **`GREATEST(MAX(id), 1)`**. The `GREATEST(..., 1)` guards the empty-table case where `MAX(id)` is `NULL`, keeping the sequence at a valid `1`.\n\nWe run one `setval` per table that has an autoincrement id, all inside the same restore transaction so the data and the counters are consistent together. After this, the very next insert gets a fresh, unused id — the register behaves exactly as if it had grown to this size naturally.',
          whyItMatters:
            'Skip this and the restore looks perfect until the first new entry, which crashes with a duplicate-key error that is baffling to debug. Re-syncing the sequences turns "restored but secretly broken" into "restored and fully usable", which is the whole point of a restore.',
          steps: [
            'Recognise that inserting explicit ids does not advance the underlying sequence.',
            'For each table with a serial id, find its sequence with `pg_get_serial_sequence`.',
            'Pass the schema-qualified table name, e.g. `\'"pooja_register"."maganes"\'`, and `\'id\'`.',
            'Call `setval(sequence, GREATEST(MAX(id), 1))` so the next id is past the highest used.',
            'Use `GREATEST(..., 1)` to handle an empty table where `MAX(id)` is `NULL`.',
            'Run every `setval` inside the same restore `$transaction` for consistency.',
          ],
          code: `// Re-sync each sequence so the next insert gets a fresh id.\n` +
            `// Run inside the same restore transaction, after createMany.\n` +
            `const tables = [\n` +
            `  'maganes', 'years', 'pooja_types', 'person_entries', 'participations',\n` +
            `];\n` +
            `for (const t of tables) {\n` +
            `  await tx.$executeRawUnsafe(\n` +
            `    'SELECT setval(' +\n` +
            `      "pg_get_serial_sequence('\\"pooja_register\\".\\"" + t + "\\"', 'id'), " +\n` +
            `      'GREATEST((SELECT MAX(id) FROM \\"pooja_register\\".\\"' + t + '\\"), 1)' +\n` +
            `    ')'\n` +
            `  );\n` +
            `}\n` +
            `// Now the ticket dispenser points past page 2280 — next id is genuinely new.`,
          pitfalls: [
            '**Skipping the re-sync entirely.** The restore works until the first new insert, which then collides on a duplicate id.',
            '**Hard-coding sequence names.** Use `pg_get_serial_sequence` so a renamed sequence does not silently break it.',
            '**Forgetting the empty-table case.** `MAX(id)` is `NULL`; wrap it in `GREATEST(..., 1)`.',
            '**Setting the sequence to `MAX(id) + 1` by hand.** `setval(seq, MAX(id))` already makes the next value `MAX(id)+1`; do not double-add.',
            '**Running `setval` outside the restore transaction.** Keep it inside so data and counters commit together.',
            '**Omitting the schema qualification.** Pass `"pooja_register"."maganes"`, not a bare table name, so the right sequence is found.',
          ],
          tryIt:
            'After a restore, run an `INSERT` of one new magane and confirm it gets an id higher than every restored id (e.g. 92 when the snapshot had 91). Then deliberately skip the `setval` step and watch the same insert fail with a unique-violation, to feel why the re-sync is required.',
          takeaway:
            'Restored ids leave the sequences stale, so re-sync each with `setval(pg_get_serial_sequence(...), GREATEST(MAX(id), 1))` inside the transaction — otherwise the next insert collides.',
        },
        {
          id: 'm8-t6',
          title: 'Listing, revealing & "Backup now"',
          explain:
            'The UI gives the committee control: a "Backup now" button, a list of existing backups, and a "reveal in folder" action via `shell.showItemInFolder` — with retention set to keep all.',
          analogy:
            'Beyond the daily automatic photocopy, the committee wants the cupboard itself: a button to make a copy this minute before a risky change, a visible list of every copy made so far, and a way to walk straight to the shelf and pick one up. And the recorded decision is to keep every copy — shelf space is cheap, and a lost donor record is not.',
          theory:
            'Automatic daily backups are the safety net; the controls in this topic are the **hands-on tools**. "**Backup now**" simply calls the same `createBackup(prisma)` on demand — useful right before a restore or a bulk import. It returns the new file path so the UI can confirm.\n\n**Listing** reads the `backups/` folder and returns each file with its date and size, sorted newest-first, so the user can see what is available to restore. **Revealing** uses Electron\'s **`shell.showItemInFolder(path)`** to open the OS file manager with the backups folder selected — letting the user copy a backup to a USB stick or email it, entirely outside the app.\n\nAll three are MAIN-process operations exposed over IPC; the renderer just asks. On **retention**, the recorded decision for this register is **keep all backups**: the dataset is small, the files are tiny, and an over-eager auto-delete that removed the one good backup would be a disaster. Pruning can be added later, but defaulting to "keep everything" is the safe choice now.',
          whyItMatters:
            'A backup the user cannot see, make on demand, or copy off the machine is only half a feature — the committee needs to physically get a copy onto another disk. Recording "keep all" as a deliberate decision prevents a future "tidy up old backups" change from silently deleting the only copy that mattered.',
          steps: [
            'Expose `backupNow()` over IPC that calls `createBackup(prisma)` and returns the new path.',
            'Expose `listBackups()` that reads `backups/` and returns name, date, and size, newest first.',
            'Expose `revealBackups()` using `shell.showItemInFolder(filePath)` to open the folder.',
            'Render a list in the UI with a "Restore" action per row and a "Backup now" button.',
            'Record the retention decision: keep all backups (no automatic pruning).',
            'Keep every operation in MAIN; the renderer only invokes over IPC.',
          ],
          code: `// src/main/db/backup.ts — list, reveal, and on-demand backup.\n` +
            `import { shell } from 'electron';\n\n` +
            `export function listBackups() {\n` +
            `  return fs.readdirSync(backupsDir())\n` +
            `    .filter((n) => n.endsWith('.json'))\n` +
            `    .map((name) => {\n` +
            `      const full = path.join(backupsDir(), name);\n` +
            `      const { size, mtime } = fs.statSync(full);\n` +
            `      return { name, path: full, size, createdAt: mtime.toISOString() };\n` +
            `    })\n` +
            `    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first\n` +
            `}\n\n` +
            `export function revealBackups() {\n` +
            `  const items = listBackups();\n` +
            `  shell.showItemInFolder(items[0] ? items[0].path : backupsDir());\n` +
            `}\n\n` +
            `// Retention decision (recorded): keep ALL backups — no auto-prune.`,
          pitfalls: [
            '**Auto-deleting old backups by default.** The recorded decision is keep-all; an over-eager prune could remove the only good copy.',
            '**Hiding backups inside the app with no reveal.** Users need `shell.showItemInFolder` to copy a backup to a USB stick.',
            '**Listing files unsorted.** Sort newest-first so the most recent backup is obvious.',
            '**Making "Backup now" a different code path.** Reuse `createBackup` so manual and automatic backups are identical.',
            '**Reading the folder from the renderer.** File listing belongs in MAIN; expose it over IPC.',
            '**Not returning the new file path from "Backup now".** The UI cannot confirm or reveal a backup it does not know the path of.',
          ],
          tryIt:
            'Add "Backup now", a backups list, and a "Reveal in folder" button. Click "Backup now" twice, confirm two files appear newest-first in the list, then reveal the folder and verify the OS file manager opens with a backup selected.',
          takeaway:
            'Give the committee a "Backup now" button, a newest-first list, and `shell.showItemInFolder` to reveal backups — with retention deliberately set to keep all.',
        },
      ],
    },
    {
      id: 'm8-s2',
      title: 'One-time import (migrating the old data)',
      topics: [
        {
          id: 'm8-t7',
          title: 'Reading the old Firestore export',
          explain:
            'The committee already runs a Flutter + Firestore app; a one-time script reads its exported JSON — keyed as `pooja/{year}` — and shapes it into the new Prisma models.',
          analogy:
            'The temple is moving from an old loose-leaf register kept in one cupboard to a new bound ledger. Before anything else you carry the old pages over to the desk and read them carefully — understanding how the old clerk arranged things (one drawer per year) — so you can copy each entry into the right section of the new book without losing a single household.',
          theory:
            'Migration starts with **reading the source faithfully**. The existing production app stores its data in Firestore under documents like **`pooja/{year}`** — one document per year, each holding that year\'s households and their pooja contributions. We export that to JSON and feed it to a one-time Node script that loads the file and walks the structure.\n\nThe shapes do not match the new schema, so the script **maps** old fields onto the new Prisma models: a year document becomes a `Year`; each household becomes a `PersonEntry` (with its Kannada `name` and `address`); the pooja contributions become `PoojaType` rows and `Participation` links. The script does the translation in memory, then writes through Prisma in the right parent-first order.\n\nKeep the import script **outside the app bundle**. It is a developer tool run once against a specific export, not a feature users invoke. It reads the old JSON, talks to the same local Prisma client the app uses, and exits. Treating it as a throwaway migration — not app code — keeps the app itself clean.',
          whyItMatters:
            'A migration that misreads the old structure silently drops households or mangles the year-to-household links, and you will not notice until a donor is missing from the register. Mapping the `pooja/{year}` shape onto the new models deliberately, in a separate script, is what makes the move trustworthy.',
          steps: [
            'Export the old Flutter + Firestore data to JSON, keyed as `pooja/{year}`.',
            'Write a standalone Node script (not part of the app bundle) to read that file.',
            'Walk each year document; map it to a `Year` row.',
            'Map each household to a `PersonEntry` with Kannada `name` and `address`.',
            'Map pooja contributions to `PoojaType` rows and `Participation` links.',
            'Write through the same local Prisma client, parent-first, then exit.',
          ],
          code: `// scripts/import-old.ts — a one-time migration, run by hand, not bundled.\n` +
            `import { readFileSync } from 'node:fs';\n` +
            `import { PrismaClient } from '@prisma/client';\n\n` +
            `const prisma = new PrismaClient();\n\n` +
            `async function main() {\n` +
            `  // Old app stored documents as pooja/{year}.\n` +
            `  const raw = JSON.parse(readFileSync('export/pooja.json', 'utf8'));\n` +
            `  for (const [year, doc] of Object.entries(raw.pooja)) {\n` +
            `    const y = await prisma.year.create({ data: { label: year } });\n` +
            `    for (const household of doc.households) {\n` +
            `      await prisma.personEntry.create({\n` +
            `        data: { yearId: y.id, name: household.name, address: household.address },\n` +
            `      });\n` +
            `    }\n` +
            `  }\n` +
            `}\n` +
            `main().finally(() => prisma.$disconnect());`,
          pitfalls: [
            '**Bundling the import script into the app.** It is a one-time developer tool, not a user feature.',
            '**Assuming the old shape matches the new schema.** Map `pooja/{year}` fields explicitly onto Prisma models.',
            '**Inserting children before their year exists.** Create the `Year` first, then its `PersonEntry` rows.',
            '**Reading the export with the wrong encoding.** Read as UTF-8 so Kannada survives (see the verification topic).',
            '**Losing the year-to-household link.** Carry the created `year.id` into each `PersonEntry`.',
            '**Running it against production data without a backup.** Snapshot first; an import is destructive if it doubles up.',
          ],
          tryIt:
            'Take a small slice of the old Firestore export (one year, a few households) and run the import script against an empty local database. Query the `Year` and `PersonEntry` tables and confirm the year and its households arrived with the correct links.',
          takeaway:
            'A standalone, one-time script reads the old `pooja/{year}` Firestore export and maps each year and household onto the new Prisma `Year`/`PersonEntry` models — kept out of the app bundle.',
        },
        {
          id: 'm8-t8',
          title: 'Deduping, rates & multi-phone',
          explain:
            'The old data is messy: maganes repeat by name, rupee rates live on each contribution, and phone fields hold several numbers — so the import dedupes maganes, lifts rates to the pooja type, and splits multi-phone fields.',
          analogy:
            'Copying the old register into the new ledger, the clerk notices the same hamlet ("Maganes") written out fresh on every page — they should be one heading, not fifty. The rate for a pooja was scribbled beside each household, but it is really one rate for the whole pooja that year. And one "phone" cell crams in three numbers separated by slashes. The clerk tidies all this as they copy, so the new ledger is clean where the old one was repetitive.',
          theory:
            'Real legacy data needs **cleaning during import**, not after. Three problems recur here.\n\nFirst, **maganes repeat by name**: the old data stored a magane name on every entry, so the same hamlet appears hundreds of times. We **dedupe**: keep an in-memory map from name to the created `Magane.id`, creating each magane once and reusing its id thereafter.\n\nSecond, **rates live on contributions**. In the old shape every household row carried the rupee rate for the pooja it joined. In the new model the rate belongs to the **`PoojaType`** for that year. So we lift the rate up: the first time we see a pooja in a year we create the `PoojaType` with that rate; later rows just link to it.\n\nThird, **phone fields hold several numbers** mashed together with separators like `/`, `,`, or `;`. We split on those separators, trim, and store the primary number (or all of them, depending on the new schema). Doing all three transforms inline keeps the new register clean from the first import rather than needing a second cleanup pass.',
          whyItMatters:
            'Importing the mess verbatim gives you fifty duplicate maganes, a rate repeated on every row that can drift, and unusable phone strings — recreating every problem the new app was meant to fix. Cleaning during import is the one chance to land on a tidy schema cheaply, before the data is in use.',
          steps: [
            'Keep an in-memory `Map<name, maganeId>`; create each magane once and reuse its id.',
            'When a magane name is new, `create` it; otherwise look up its existing id.',
            'Lift the per-row rupee rate up to the year\'s `PoojaType` rate.',
            'Create each `PoojaType` once per year; later rows link to it rather than re-setting the rate.',
            'Split multi-phone fields on `/`, `,`, or `;`, trim, and store the cleaned number(s).',
            'Apply all three transforms inline so the register lands clean on first import.',
          ],
          code: `// scripts/import-old.ts — dedupe maganes, lift rates, split phones.\n` +
            `const maganeIds = new Map(); // name -> id, created once\n\n` +
            `async function maganeId(name) {\n` +
            `  if (maganeIds.has(name)) return maganeIds.get(name);\n` +
            `  const m = await prisma.magane.create({ data: { name } });\n` +
            `  maganeIds.set(name, m.id);\n` +
            `  return m.id;\n` +
            `}\n\n` +
            `function splitPhones(raw) {\n` +
            `  return String(raw || '')\n` +
            `    .split(/[\\/,;]+/)        // "98861/99001" -> two numbers\n` +
            `    .map((p) => p.trim())\n` +
            `    .filter(Boolean);\n` +
            `}\n\n` +
            `// Rate lives on the PoojaType for the year, not on every household row.\n` +
            `const poojaType = await prisma.poojaType.upsert({\n` +
            `  where: { yearId_name: { yearId, name: poojaName } },\n` +
            `  update: {},\n` +
            `  create: { yearId, name: poojaName, rate: oldRow.rate },\n` +
            `});`,
          pitfalls: [
            '**Creating a magane per row.** Dedupe by name with a map so each hamlet exists once.',
            '**Leaving the rate on every contribution.** Lift it to the year\'s `PoojaType` so it is single-sourced.',
            '**Storing the multi-phone field verbatim.** Split on `/ , ;`, trim, and keep clean numbers.',
            '**Re-setting the `PoojaType` rate on later rows.** Create it once; subsequent rows only link.',
            '**Deduping case-sensitively when the data is inconsistent.** Normalise names before comparing if the source varies.',
            '**Deferring cleanup to "after import".** Inline cleaning is the cheap moment; a second pass over live data is not.',
          ],
          tryIt:
            'Import a year where the same magane name appears on twenty rows and one phone field reads "98861234/99007654". Confirm the database has exactly one magane row for that name and that the phone split into two clean numbers.',
          takeaway:
            'Clean during import: dedupe maganes by name via a map, lift each contribution\'s rupee rate up to the year\'s `PoojaType`, and split multi-phone fields into clean numbers.',
        },
        {
          id: 'm8-t9',
          title: 'Idempotent & run-once imports',
          explain:
            'An import script must be **idempotent** — safe to re-run without doubling the data — and is run **once**; the app\'s first-run seed can auto-import a bundled register if one is present.',
          analogy:
            'A careful clerk copying the old register checks "is this household already in the new ledger?" before writing it, so running the copy job twice does not enter every family twice. And a brand-new ledger can come pre-filled: the committee ships the new app already containing the clean 2025 register, so the very first time a fresh office opens the book, the year is already there.',
          theory:
            'Import scripts get **re-run** — you fix a mapping bug and run again, or someone double-clicks. If the script blindly `create`s, the second run **doubles** the data. So an import must be **idempotent**: re-running it leaves the database in the same state. The tools are `upsert` (create-or-update on a unique key) and "check before insert" guards keyed on something stable like a name or a natural id.\n\nSeparately, the app supports a **first-run seed**. The first time the app starts with an empty database, it can **auto-import a bundled register** if one ships with the app. The real Upralli Seva app bundles the **clean 2025 register — 91 maganes, 2280 households** — so a fresh install already has the current year ready, with no manual import step for the committee.\n\nThe seed reuses the same import logic but guarded by an "is the database empty?" check so it runs **once**, on first launch only. After that the committee\'s own edits are the source of truth and the bundled seed is never touched again.',
          whyItMatters:
            'A non-idempotent import that someone runs twice doubles every donor — a silent, expensive mess to untangle later. A bundled first-run seed means the committee opens a brand-new install to a complete, correct 2025 register instead of an empty book they must populate by hand.',
          steps: [
            'Make every insert idempotent with `upsert` or a check-before-insert on a stable key.',
            'Re-running the script must not create duplicates — verify by running it twice.',
            'Keep the one-time import script separate from the shipped app code.',
            'Add a first-run seed that checks whether the database is empty.',
            'If empty and a bundled register ships with the app, auto-import it once.',
            'After seeding, never re-import; the committee\'s edits become the source of truth.',
          ],
          code: `// src/main/db/seed.ts — first-run only, idempotent.\n` +
            `export async function seedIfEmpty(prisma) {\n` +
            `  const count = await prisma.magane.count();\n` +
            `  if (count > 0) return; // already has data — do nothing\n\n` +
            `  // The app bundles the clean 2025 register: 91 maganes, 2280 households.\n` +
            `  const bundled = path.join(process.resourcesPath, 'seed', 'register-2025.json');\n` +
            `  if (!fs.existsSync(bundled)) return; // nothing to seed\n\n` +
            `  const data = JSON.parse(fs.readFileSync(bundled, 'utf8'));\n` +
            `  await importRegister(prisma, data); // same idempotent import logic\n` +
            `}`,
          pitfalls: [
            '**Using plain `create` in an import.** Re-running doubles the data; use `upsert` or check-before-insert.',
            '**Seeding without an "is it empty?" guard.** The seed would overwrite or duplicate the committee\'s real data.',
            '**Re-importing the bundled register on every launch.** Seed once on first run only.',
            '**Shipping the throwaway migration script as app code.** Keep the one-time import separate from the bundled seed.',
            '**Choosing an unstable dedupe key.** Key idempotency on something stable (name/natural id), not a row order.',
            '**Forgetting the bundled file may be absent.** Check `fs.existsSync` before seeding so the app still starts.',
          ],
          tryIt:
            'Run your import script twice in a row against the same database and confirm the row counts are identical after both runs (idempotent). Then delete all data, restart the app, and confirm the bundled 2025 register seeds itself once.',
          takeaway:
            'Make imports idempotent (`upsert`/check-before-insert) so re-running is safe, and let a guarded first-run seed auto-import the bundled 2025 register exactly once into an empty database.',
        },
        {
          id: 'm8-t10',
          title: 'Verifying Kannada survived the import',
          explain:
            'Kannada must arrive **byte-perfect** — including the virama (U+0CCD) that forms conjuncts — and the counts must add up: spot-check 91 maganes, 2280 households, and the grand total.',
          analogy:
            'After copying the old register the careful clerk does two checks. First, the **spelling**: they look closely at the joined Kannada letters — the little hook that fuses two consonants — to be sure no name turned into garbled boxes. Second, the **arithmetic**: count the hamlets, count the households, total the contributions, and confirm the new ledger matches the old one to the last entry. A copy that looks right but miscounts is not a copy you can trust.',
          theory:
            'Kannada is a complex script and the easiest thing to break in a migration. Conjuncts are formed by the **virama, U+0CCD** — an invisible joiner between consonants. If the import re-encodes text wrongly, the virama is dropped or doubled and a name that should read as one fused cluster shows as separate letters or **mojibake** (boxes and question marks). So we verify Kannada is **byte-perfect**: read a known name out of the database and compare its exact code points, virama included, against the source.\n\nThe earlier import was deliberately **mojibake-tolerant** — it normalised text to UTF-8 and did not strip combining marks — but tolerance on input means nothing without **verification on output**. Reading the stored string back and checking U+0CCD is present where expected is the proof.\n\nSecond, verify the **counts**. The clean 2025 register is **91 maganes and 2280 households**, with a known **grand total** of contributions. After import, query those counts and the sum and compare. Matching counts plus byte-perfect Kannada together mean the migration is trustworthy; either one failing means stop and fix before going live.',
          whyItMatters:
            'A donor whose Kannada name became boxes is effectively lost from the register, and a count that is off by even one means a household silently vanished — both unacceptable for a record the committee relies on. Verifying code points and totals turns "the import seemed to work" into "the import is provably correct".',
          steps: [
            'Read a known Kannada name back from the database after import.',
            'Confirm the virama (U+0CCD) appears wherever a conjunct should form.',
            'Compare exact code points against the source — byte-perfect, no mojibake.',
            'Count maganes and confirm it equals 91 for the 2025 register.',
            'Count households (person entries) and confirm it equals 2280.',
            'Sum the contributions and compare the grand total against the old register.',
          ],
          code: `// scripts/verify-import.ts — code points and counts must match.\n` +
            `async function verify(prisma) {\n` +
            `  const maganes = await prisma.magane.count();\n` +
            `  const households = await prisma.personEntry.count();\n` +
            `  console.log('maganes', maganes, 'households', households);\n` +
            `  // Expected for the clean 2025 register:\n` +
            `  if (maganes !== 91 || households !== 2280) throw new Error('count mismatch');\n\n` +
            `  // Kannada byte-perfect: the virama U+0CCD must survive.\n` +
            `  const sample = await prisma.personEntry.findFirst({\n` +
            `    where: { name: { contains: '\\u0CCD' } },\n` +
            `  });\n` +
            `  const hasVirama = sample ? sample.name.includes('\\u0CCD') : false;\n` +
            `  console.log('virama present:', hasVirama, sample && sample.name);\n` +
            `  if (!hasVirama) throw new Error('Kannada conjunct lost in import');\n` +
            `}`,
          pitfalls: [
            '**Eyeballing Kannada in a font that hides the problem.** Compare actual code points; a rendering may mask a dropped virama.',
            '**Forgetting the virama (U+0CCD).** It forms conjuncts; if it is lost, names silently fracture.',
            '**Only checking counts, not text.** Right count, garbled names is still a failed import.',
            '**Only checking text, not counts.** Perfect Kannada with a missing household is still wrong.',
            '**Skipping the grand-total sum.** Counts can match while amounts are corrupted; total the contributions too.',
            '**Treating mismatches as warnings.** Throw and stop — do not let a broken import go live.',
          ],
          tryIt:
            'After importing the 2025 register, run a verification that asserts exactly 91 maganes and 2280 households and prints a sample Kannada name. Confirm the printed name contains U+0CCD where a conjunct appears, then total the contributions and match the known grand total.',
          takeaway:
            'Verify the import two ways: Kannada byte-perfect including the virama (U+0CCD), and counts that match — 91 maganes, 2280 households, and the grand total of contributions.',
        },
      ],
    },
    {
      id: 'm8-s3',
      title: 'PDF export (Kannada renders for free)',
      topics: [
        {
          id: 'm8-t11',
          title: 'Why printToPDF beats a PDF library',
          explain:
            'Most PDF libraries mangle Kannada conjuncts, but Chromium\'s `webContents.printToPDF` uses the same shaping engine as the browser — so the register\'s Kannada renders correctly for free.',
          analogy:
            'You could buy a cheap stamp set to print the register, but the stamps cannot join Kannada letters — the conjuncts come out broken. Instead you photocopy the page exactly as it looks on the well-rendered screen: whatever the screen shows beautifully, the copy shows identically. Chromium is that high-quality copier; the screen and the PDF use the very same printing press.',
          theory:
            'PDF generation is where Indic scripts usually break. Typical PDF libraries (the `pdfkit`/`jspdf` family) draw glyphs from a font table but do **not** run a full **text-shaping** engine, so Kannada **conjuncts** — consonant clusters joined by the virama — come out as separate or broken glyphs. Getting them right by hand is enormous work.\n\nChromium already solves this. The browser shapes complex scripts correctly to render web pages, and Electron exposes that exact pipeline through **`webContents.printToPDF`**. If you build your register as **HTML**, load it into a Chromium window, and call `printToPDF`, the Kannada shapes in the PDF exactly as it would on screen — conjuncts, viramas, and all — with **no extra work**.\n\nSo the strategy is: generate HTML for the year\'s register, render it in Chromium, and print that to PDF. The "for free" in the title is literal — by reusing the browser engine you already ship, correct Kannada in the PDF costs nothing beyond writing the HTML.',
          whyItMatters:
            'Choosing a PDF library for a Kannada register sets you up for days of fighting broken conjuncts and possibly never getting them right. `printToPDF` makes the hardest part — correct complex-script rendering — a non-issue, so you spend your effort on layout, not on glyph shaping.',
          steps: [
            'Recognise that typical PDF libraries do not shape Indic conjuncts correctly.',
            'Choose Chromium\'s `webContents.printToPDF`, which reuses the browser\'s shaping engine.',
            'Build the year\'s register as HTML rather than drawing glyphs by hand.',
            'Render that HTML in a Chromium window in MAIN.',
            'Call `printToPDF` so the PDF matches the on-screen rendering exactly.',
            'Spend your effort on layout and the embedded font, not on glyph shaping.',
          ],
          code: `// MAIN — Chromium does the hard part: shaping Kannada correctly.\n` +
            `import { BrowserWindow } from 'electron';\n\n` +
            `async function htmlToPdf(html) {\n` +
            `  const win = new BrowserWindow({\n` +
            `    show: false,\n` +
            `    webPreferences: { offscreen: true, sandbox: false },\n` +
            `  });\n` +
            `  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));\n` +
            `  const pdf = await win.webContents.printToPDF({\n` +
            `    pageSize: 'A4', printBackground: true,\n` +
            `    margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 },\n` +
            `  });\n` +
            `  win.destroy();\n` +
            `  return pdf; // a Buffer ready to write to disk\n` +
            `}`,
          pitfalls: [
            '**Reaching for a PDF library to render Kannada.** Most do not shape conjuncts; you will fight broken glyphs.',
            '**Drawing text glyph-by-glyph.** Let Chromium shape the script; build HTML instead.',
            '**Expecting `printToPDF` to work in the renderer.** It is a `webContents` (MAIN-side) API.',
            '**Forgetting `printBackground`.** Without it, background shading and table fills are dropped.',
            '**Leaving the window alive.** Destroy the offscreen window after printing to free memory.',
            '**Assuming default margins suit A4.** Set explicit margins so the register fits the page cleanly.',
          ],
          tryIt:
            'Render a tiny HTML page with one Kannada conjunct word to PDF via `printToPDF` and open the result. Confirm the conjunct is shaped correctly — then try the same word in a quick `pdfkit` test and watch it break, to feel the difference.',
          takeaway:
            'Build the register as HTML and print it with Chromium\'s `webContents.printToPDF`; the browser\'s shaping engine renders Kannada conjuncts correctly with no extra work.',
        },
        {
          id: 'm8-t12',
          title: 'The hidden offscreen window',
          explain:
            'The HTML is rendered in a **hidden, offscreen** `BrowserWindow` (`show: false`, `offscreen: true`) loaded via a `data:` URL — an invisible page that exists only to be printed.',
          analogy:
            'To photocopy a page you do not need to wave it in front of everyone — you lay it face-down on the copier glass, out of sight, press the button, and collect the copy. The offscreen window is that copier glass: the register page is laid on it invisibly, printed, and the original is taken away. The committee never sees a flashing window pop up.',
          theory:
            'We do not want a visible window flashing on screen every time someone exports a PDF. So we create the `BrowserWindow` with **`show: false`** and **`offscreen: true`** in `webPreferences`. Offscreen rendering means Chromium paints the page into a buffer without ever putting it on a real display — perfect for a window whose only job is to be printed.\n\nWe load the HTML directly, with **no file on disk**, using a **`data:` URL**: `win.loadURL(\'data:text/html;charset=utf-8,\' + encodeURIComponent(html))`. The `charset=utf-8` is essential so Kannada bytes are decoded correctly, and `encodeURIComponent` escapes the HTML so it is a valid URL. This avoids writing and cleaning up a temp HTML file.\n\nWe also set **`sandbox: false`** for this utility window so the print pipeline behaves predictably. Because it never shows, the user experience is just: click "Export PDF", get a save dialog, done — the rendering machinery stays completely invisible.',
          whyItMatters:
            'A visible window popping up and vanishing on every export looks broken and unprofessional. The offscreen `data:`-URL window keeps export silent and tidy — no flashing window, no temp file to write or leak — while still using the full Chromium renderer that gets Kannada right.',
          steps: [
            'Create a `BrowserWindow` with `show: false`.',
            'Set `webPreferences: { offscreen: true, sandbox: false }`.',
            'Load the HTML via a `data:text/html;charset=utf-8,` URL — no temp file.',
            'Wrap the HTML in `encodeURIComponent` so it is a valid URL.',
            'Keep `charset=utf-8` so Kannada bytes decode correctly.',
            'Destroy the window once the PDF buffer is returned.',
          ],
          code: `// MAIN — an invisible window that exists only to be printed.\n` +
            `const win = new BrowserWindow({\n` +
            `  show: false,                                  // never appears\n` +
            `  webPreferences: { offscreen: true, sandbox: false },\n` +
            `});\n\n` +
            `// Load HTML straight from memory — no temp file on disk.\n` +
            `await win.loadURL(\n` +
            `  'data:text/html;charset=utf-8,' + encodeURIComponent(html)\n` +
            `);\n` +
            `// ... printToPDF ... then:\n` +
            `win.destroy();`,
          pitfalls: [
            '**Forgetting `show: false`.** A window flashes on screen on every export.',
            '**Omitting `charset=utf-8` in the data URL.** Kannada bytes decode wrongly and names break.',
            '**Not `encodeURIComponent`-ing the HTML.** Special characters make an invalid URL and the load fails.',
            '**Writing a temp HTML file instead.** The `data:` URL avoids a file you would have to clean up.',
            '**Leaving the window undestroyed.** Each export leaks an offscreen window and its memory.',
            '**Leaving `sandbox: true` and hitting odd print behaviour.** Use `sandbox: false` for this utility window.',
          ],
          tryIt:
            'Create an offscreen `show: false` window, load a Kannada HTML string via a `data:` URL with and without `charset=utf-8`, and print each to PDF. Confirm the version without the charset shows broken text, proving why it matters.',
          takeaway:
            'Render export HTML in a hidden offscreen `BrowserWindow` loaded from a `charset=utf-8` `data:` URL — invisible to the user, no temp file, full Chromium rendering — then destroy it.',
        },
        {
          id: 'm8-t13',
          title: 'Embedding the Kannada font',
          explain:
            'For a self-contained PDF, the bundled **Noto Sans Kannada** is read as a base64 `data:` URL and embedded in an `@font-face`; then give the font a brief tick to apply before printing.',
          analogy:
            'You cannot assume the next computer that opens this PDF owns the right Kannada typeface — so you glue a copy of the font right into the document, the way a printer embeds the exact typeface into a brochure file so it looks identical anywhere. And after pasting the font in, you wait a beat for the press to actually load it before pulling the print, so the first copy is not printed in the wrong typeface.',
          theory:
            'A PDF that relies on a font being installed on the reader\'s machine is a gamble — most Windows machines do not ship a good Kannada font, and the temple\'s committee should not have to install one. So we **embed** the font we bundle with the app.\n\nWe read the bundled **Noto Sans Kannada** TTF from disk and base64-encode it into a **`data:font/ttf;base64,...`** URL, then drop that into an **`@font-face`** rule in the HTML\'s `<style>`. Now the font travels **inside** the document: the PDF is self-contained and renders identically on any machine, online or offline.\n\nOne timing subtlety: loading a `data:` URL font is asynchronous within the page. If you call `printToPDF` the instant the page loads, the font may not have **applied** yet and the first render falls back to a default. So we wait a short tick — about **250 ms** — after load, giving the embedded font time to apply, before printing. It is a small, pragmatic delay that reliably avoids a wrong-font PDF.',
          whyItMatters:
            'Without embedding, the PDF looks perfect on the developer machine that has Kannada fonts and broken on the committee\'s machine that does not — a classic "works on my computer" trap. Embedding plus the brief settle delay guarantees the register prints in correct Kannada everywhere, every time.',
          steps: [
            'Read the bundled Noto Sans Kannada TTF from disk in MAIN.',
            'Base64-encode it into a `data:font/ttf;base64,...` URL.',
            'Put it in an `@font-face` rule and apply that family to the register text.',
            'This makes the PDF self-contained — no installed font required.',
            'After `loadURL`, wait a short tick (~250 ms) so the font applies.',
            'Only then call `printToPDF`, so the first render uses the embedded font.',
          ],
          code: `// src/main/reports/pdf.ts — embed the font as a base64 data: URL.\n` +
            `import { readFileSync } from 'node:fs';\n\n` +
            `function fontDataUrl() {\n` +
            `  const b64 = readFileSync(fontPath()).toString('base64');\n` +
            `  return \`data:font/ttf;base64,\${b64}\`;\n` +
            `}\n\n` +
            `const style = \`<style>\n` +
            `  @font-face {\n` +
            `    font-family: 'NotoKannada';\n` +
            `    src: url(\${fontDataUrl()}) format('truetype');\n` +
            `  }\n` +
            `  body { font-family: 'NotoKannada', sans-serif; }\n` +
            `</style>\`;\n\n` +
            `await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));\n` +
            `await new Promise((r) => setTimeout(r, 250)); // let the embedded font apply\n` +
            `const pdf = await win.webContents.printToPDF({ pageSize: 'A4', printBackground: true });`,
          pitfalls: [
            '**Relying on an installed font.** Most reader machines lack a Kannada font; embed it so the PDF is self-contained.',
            '**Linking the font by file path.** A path is not portable; base64-embed it into the document.',
            '**Printing immediately after load.** The `data:` font has not applied; the first render falls back to a default.',
            '**Using the wrong `format()`.** A TTF needs `format(\'truetype\')`; a mismatch can stop it loading.',
            '**Embedding a font that lacks the glyphs.** Use Noto Sans Kannada, which covers the conjuncts.',
            '**Hard-coding a wrong MIME in the data URL.** Use `data:font/ttf;base64,` for a TTF.',
          ],
          tryIt:
            'Embed Noto Sans Kannada via `@font-face` and export a register page to PDF, first without the 250 ms wait and then with it. Compare the two: the no-wait version likely shows a fallback font on the first run, proving the settle delay is needed.',
          takeaway:
            'Embed the bundled Noto Sans Kannada as a base64 `data:` URL in an `@font-face` so the PDF is self-contained, and wait ~250 ms after load so the font applies before `printToPDF`.',
        },
        {
          id: 'm8-t14',
          title: 'A blank application form PDF',
          explain:
            'Besides the filled register, the app exports a **blank application form** — the same layout with empty rows — so committee members can collect entries by hand in the field.',
          analogy:
            'The committee does not only photocopy the filled register; they also print stacks of the **blank form** to carry into the hamlets, handing one to each household to write their details before the data ever reaches the computer. It is the same printed sheet, just with the rows left empty, ready for a pen.',
          theory:
            'Data collection in a coastal village is often **offline and on paper first**. So alongside the filled-register PDF, the app produces a **blank application form**: the identical header, columns, and styling, but with a fixed number of **empty rows** to fill by hand.\n\nThis reuses everything from the filled export — the same HTML skeleton, the same embedded Kannada font (the column headings are in Kannada), the same `printToPDF` pipeline. The only difference is the body: instead of mapping over the year\'s rows, we render N blank rows with enough height to write in.\n\nWe model this with a single **`blank` flag** on the export function. When `blank` is true the HTML builder emits empty rows; when false it emits the real data. One function, one template, two outputs — a filled register for the office and a blank form for the field. Keeping it one code path means the printed blank form always matches the register exactly, so a hand-filled sheet transcribes cleanly later.',
          whyItMatters:
            'Field collection needs paper forms, and a blank form that drifts from the real register layout makes transcription error-prone. Generating the blank form from the same template with a `blank` flag guarantees the field sheet and the office register are the same shape, so data entry from paper is straightforward.',
          steps: [
            'Add a `blank` boolean to the export so one function makes both PDFs.',
            'When `blank` is true, render N empty rows instead of the year\'s data.',
            'Reuse the same header, columns, and embedded Kannada font.',
            'Give blank rows enough height to write in by hand.',
            'Run it through the same offscreen `printToPDF` pipeline.',
            'Keep one template so the field form and the office register stay identical.',
          ],
          code: `// src/main/reports/pdf.ts — one builder, filled or blank.\n` +
            `function registerHtml(year, rows, blank) {\n` +
            `  const body = blank\n` +
            `    ? Array.from({ length: 25 })       // 25 empty rows to fill by hand\n` +
            `        .map(() => '<tr class="blank"><td></td><td></td><td></td></tr>')\n` +
            `        .join('')\n` +
            `    : rows\n` +
            `        .map((r) => '<tr><td>' + r.maganeName + '</td><td>' + r.name +\n` +
            `          '</td><td>' + r.address + '</td></tr>')\n` +
            `        .join('');\n` +
            `  return style + '<h2>' + year.label + '</h2><table>' + body + '</table>';\n` +
            `}`,
          pitfalls: [
            '**Building a separate template for the blank form.** Reuse the register template so the two never drift apart.',
            '**Making blank rows too short to write in.** Give them enough height for a pen.',
            '**Dropping the embedded font on the blank form.** The Kannada column headings still need it.',
            '**Hard-coding the wrong number of rows.** Pick a sensible page-filling count (e.g. 25).',
            '**Duplicating the print pipeline for the blank case.** Pass a `blank` flag through the same `printToPDF` path.',
            '**Forgetting the header on the blank form.** It needs the same title and columns as the register.',
          ],
          tryIt:
            'Add a `blank` flag to your register export and produce both a filled PDF and a blank one for the same year. Print the blank form and confirm it has the same Kannada headings and columns as the register, with empty rows tall enough to write in.',
          takeaway:
            'A `blank` flag on the export reuses the register template, font, and `printToPDF` pipeline to emit a blank application form with empty rows for hand collection in the field.',
        },
        {
          id: 'm8-t15',
          title: 'Saving the PDF with a dialog',
          explain:
            'The PDF buffer is saved where the user chooses: `dialog.showSaveDialog` asks for a path, then `writeFileSync(filePath, pdf)` writes the bytes — all in MAIN.',
          analogy:
            'Once the copy is made, the clerk asks "which drawer should this go in?" before filing it — they do not just dump it anywhere. The save dialog is that question; the user points at a folder and a filename, and only then is the PDF placed exactly where they want it, ready to email or print.',
          theory:
            'Producing the PDF buffer is only half the job — the user needs the **file** somewhere they can find it. We use Electron\'s **`dialog.showSaveDialog`** to ask for a path, defaulting a sensible filename like `register-2025.pdf` and filtering to `.pdf`. The dialog returns the chosen `filePath` (or a `canceled` flag if the user backs out).\n\nIf the user did not cancel, we write the buffer with **`writeFileSync(filePath, pdf)`** — the `printToPDF` result is a `Buffer`, so it goes straight to disk with no conversion. Both the dialog and the write happen in **MAIN**, where filesystem access lives; the renderer just calls `api.reports.exportYearPdf(...)` and shows a "Saved" or "Cancelled" result.\n\nThis closes the export loop: build HTML → render offscreen with the embedded font → `printToPDF` to a buffer → ask where to save → write the bytes. Optionally we can offer to **open** the saved file with `shell.openPath(filePath)` so the user sees their PDF immediately.',
          whyItMatters:
            'A PDF generated to a buffer the user can never locate is useless — they need it as a real file to email, print, or archive. The save dialog gives them control over where it lands, and doing both the dialog and the write in MAIN keeps the privileged filesystem work out of the renderer.',
          steps: [
            'Generate the PDF buffer via the offscreen `printToPDF` pipeline.',
            'Call `dialog.showSaveDialog` with a default filename and a `.pdf` filter.',
            'If the user cancels, return without writing anything.',
            'Otherwise write the buffer with `writeFileSync(filePath, pdf)`.',
            'Do both the dialog and the write in MAIN, behind an IPC method.',
            'Optionally `shell.openPath(filePath)` so the user sees the PDF at once.',
          ],
          code: `// src/main/reports/pdf.ts — ask where, then write the bytes.\n` +
            `import { dialog, shell } from 'electron';\n` +
            `import { writeFileSync } from 'node:fs';\n\n` +
            `export async function exportYearPdf(prisma, yearId, blank) {\n` +
            `  const pdf = await buildYearPdf(prisma, yearId, blank); // Buffer\n` +
            `  const { canceled, filePath } = await dialog.showSaveDialog({\n` +
            `    defaultPath: blank ? 'application-form.pdf' : 'register.pdf',\n` +
            `    filters: [{ name: 'PDF', extensions: ['pdf'] }],\n` +
            `  });\n` +
            `  if (canceled || !filePath) return { ok: false };\n` +
            `  writeFileSync(filePath, pdf);\n` +
            `  shell.openPath(filePath); // show it to the user\n` +
            `  return { ok: true, filePath };\n` +
            `}`,
          pitfalls: [
            '**Writing to a fixed path without asking.** Use `showSaveDialog` so the user controls where it lands.',
            '**Ignoring the `canceled` flag.** If the user backs out, do not write a file.',
            '**Converting the buffer before writing.** `printToPDF` returns a `Buffer`; `writeFileSync` takes it directly.',
            '**Running the dialog or write in the renderer.** Filesystem and dialogs belong in MAIN.',
            '**Omitting the `.pdf` filter and default name.** Give the user a sensible filename to start from.',
            '**Forgetting to surface the result.** Return `{ ok, filePath }` so the UI can confirm or report cancellation.',
          ],
          tryIt:
            'Wire `exportYearPdf(prisma, yearId, false)` to a button. Click it, choose a folder in the save dialog, and confirm a readable Kannada PDF lands there; then click Cancel in the dialog and confirm no file is written and the UI shows "Cancelled".',
          takeaway:
            'Save the `printToPDF` buffer where the user wants it: `dialog.showSaveDialog` for the path, then `writeFileSync(filePath, pdf)` — both in MAIN, optionally opening the file afterward.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm8-p1',
      type: 'guided-project',
      title: 'JSON snapshot backups + restore',
      domain: 'Offline temple register — Upralli Seva',
      duration: '4–5 hours',
      description:
        'Build a MAIN-process backup module that writes a daily JSON snapshot of the whole register through Prisma to the backups folder (skipping if today\'s already exists), lists and reveals backups, takes one on demand, and restores any snapshot inside a single transaction with the autoincrement sequences re-synced.',
      tools: ['Electron', 'TypeScript', 'Prisma', 'embedded-postgres', 'node:fs', 'preload contextBridge + IPC'],
      blueprint: {
        overview:
          'A `src/main/db/backup.ts` module that owns the offline data-safety story. Because embedded-postgres ships no `pg_dump`, backups are full logical JSON snapshots built with Prisma `findMany` over every model and stored in a `backups/` folder beside the data root. A daily backup runs on startup only if today\'s is missing, and is non-fatal on error. Restore replaces all data inside one `$transaction` — delete child-first, re-insert parent-first preserving ids — then re-syncs each sequence with `setval(pg_get_serial_sequence(...))`. The renderer reaches all of it over a narrow IPC surface.',
        functionalRequirements: [
          'Build a `{ version, createdAt, data }` snapshot via `findMany` over maganes, years, poojaTypes, personEntries, participations.',
          'On startup, take a backup only if none exists for today; log and continue on failure (never fatal).',
          'Provide "Backup now", a newest-first backups list, and reveal-in-folder via `shell.showItemInFolder`.',
          'Restore a chosen snapshot inside one `$transaction`, deleting child-first and re-inserting parent-first with original ids.',
          'After restore, re-sync every table\'s sequence with `setval(pg_get_serial_sequence(...), GREATEST(MAX(id), 1))`.',
        ],
        technicalImplementation: [
          'A `buildSnapshot(prisma)` running the five `findMany` reads with `Promise.all`, wrapped in a `version`/`createdAt` envelope.',
          'A `backupOnStartupIfNeeded(prisma)` that checks `hasBackupForToday()` and is wrapped in `try/catch`.',
          'A `restore(prisma, snapshot)` using `prisma.$transaction`, `deleteMany` child-first and `createMany` parent-first.',
          'A sequence re-sync loop running `setval(pg_get_serial_sequence(\'"pooja_register"."<table>"\', \'id\'), GREATEST(MAX(id), 1))` inside the transaction.',
          'A preload `contextBridge` exposing only `backup.now`, `backup.list`, `backup.reveal`, and `backup.restore`; no Prisma in the renderer.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Snapshot + daily startup backup',
            outcome: 'A snapshot builder and a non-fatal once-per-day startup backup written to the backups folder.',
            prompt:
              'In a TypeScript Electron MAIN module using Prisma over a bundled embedded-postgres (no pg_dump available), write (a) `buildSnapshot(prisma)` that runs `findMany` on `magane`, `year`, `poojaType`, `personEntry`, and `participation` with `Promise.all` and returns `{ version: 1, createdAt: new Date().toISOString(), data: { maganes, years, poojaTypes, personEntries, participations } }`; (b) `createBackup(prisma)` that writes that snapshot as pretty JSON to a `backups/` folder under `%LOCALAPPDATA%\\UpralliSeva` with a date-stamped filename; and (c) `backupOnStartupIfNeeded(prisma)` that, inside a try/catch, calls `createBackup` only if no file for today exists, logging and swallowing any error so startup never fails.',
          },
          {
            step: 2,
            label: 'Transactional restore + sequence re-sync',
            outcome: 'An atomic restore that swaps all data FK-safely and re-syncs the autoincrement sequences.',
            prompt:
              'Write a TypeScript `restore(prisma, snapshot)` for the same app that runs everything in `prisma.$transaction(async (tx) => { ... })`. First `deleteMany` child-first: participation, personEntry, poojaType, year, magane. Then `createMany` parent-first: magane, year, poojaType, personEntry, participation, using the snapshot rows as-is so original ids are preserved. Finally, for each table (`maganes`, `years`, `pooja_types`, `person_entries`, `participations`), run a raw `SELECT setval(pg_get_serial_sequence(\'"pooja_register"."<table>"\', \'id\'), GREATEST((SELECT MAX(id) FROM "pooja_register"."<table>"), 1))` so the next insert gets a fresh id. Explain why the order and the id preservation matter.',
          },
          {
            step: 3,
            label: 'List, reveal & IPC surface',
            outcome: 'A backups list, a reveal action, and a narrow preload API the renderer uses.',
            prompt:
              'Write (a) a TypeScript `listBackups()` that reads the `backups/` folder, returns each `.json` file as `{ name, path, size, createdAt }` sorted newest-first, and a `revealBackups()` using `shell.showItemInFolder`; and (b) a preload `contextBridge.exposeInMainWorld(\'api\', { backup: { now, list, reveal, restore } })` where each method is an `ipcRenderer.invoke` to a matching `ipcMain.handle`. Stress that Prisma and `fs` stay in MAIN and the renderer only invokes; note the recorded retention decision is to keep all backups.',
          },
        ],
      },
    },
    {
      id: 'm8-p2',
      type: 'guided-project',
      title: 'Year PDF export',
      domain: 'Offline temple register — Upralli Seva',
      duration: '4–5 hours',
      description:
        'Build `reports.exportYearPdf(yearId, blank)` that generates HTML for a year\'s register, renders it to A4 PDF on a hidden offscreen Chromium window with the bundled Noto Sans Kannada font embedded as base64, and saves it via a dialog — plus a blank-application-form variant from the same template.',
      tools: ['Electron', 'TypeScript', 'Prisma', 'webContents.printToPDF', 'BrowserWindow (offscreen)', 'node:fs', 'dialog'],
      blueprint: {
        overview:
          'A `src/main/reports/pdf.ts` module that exports a year\'s register as a self-contained A4 PDF. It builds HTML from the year\'s rows (or empty rows when `blank` is true), embeds the bundled Noto Sans Kannada as a base64 `@font-face` so Kannada conjuncts render correctly with no installed font, and renders it via `webContents.printToPDF` on a hidden offscreen `BrowserWindow` loaded from a `charset=utf-8` `data:` URL. A short settle delay lets the embedded font apply before printing, and `dialog.showSaveDialog` plus `writeFileSync` save the bytes where the user chooses.',
        functionalRequirements: [
          'Generate A4 PDF for a year\'s register via Chromium `printToPDF`, with Kannada conjuncts rendering correctly.',
          'Render on a hidden offscreen `BrowserWindow` (`show: false`, `offscreen: true`) loaded from a `charset=utf-8` `data:` URL.',
          'Embed the bundled Noto Sans Kannada as a base64 `data:font/ttf` `@font-face` so the PDF is self-contained.',
          'Wait a short tick (~250 ms) after load so the embedded font applies before printing.',
          'Support a `blank` variant that emits empty rows as a hand-fillable application form, then save via `dialog.showSaveDialog` + `writeFileSync`.',
        ],
        technicalImplementation: [
          'A `fontDataUrl()` reading the bundled TTF and returning `data:font/ttf;base64,${b64}`, used in an `@font-face` rule.',
          'A `registerHtml(year, rows, blank)` builder that emits the year\'s rows or N empty rows from one template.',
          'An offscreen `BrowserWindow` with `webPreferences: { offscreen: true, sandbox: false }`, loaded via `loadURL(\'data:text/html;charset=utf-8,\' + encodeURIComponent(html))`.',
          'A `printToPDF({ pageSize: \'A4\', printBackground: true, margins: {...} })` after `await new Promise(r => setTimeout(r, 250))`.',
          'A `dialog.showSaveDialog` + `writeFileSync(filePath, pdf)` save step in MAIN, exposed as `api.reports.exportYearPdf(yearId, blank)`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'HTML + embedded Kannada font',
            outcome: 'A register HTML builder with the bundled Noto font embedded as base64, plus a blank variant.',
            prompt:
              'Write TypeScript for an Electron MAIN reports module: (a) `fontDataUrl()` that reads a bundled Noto Sans Kannada TTF with `readFileSync` and returns a `data:font/ttf;base64,` URL with the base64 appended; (b) a `<style>` string with an `@font-face` using that data URL (family `NotoKannada`, `format(\'truetype\')`) applied to the body; and (c) `registerHtml(year, rows, blank)` that returns the style plus a table — mapping the year\'s rows to `<tr>`s when `blank` is false, or 25 empty `<tr class="blank">` rows when `blank` is true. Explain why embedding the font makes the PDF self-contained on machines with no Kannada font installed.',
          },
          {
            step: 2,
            label: 'Offscreen render to PDF',
            outcome: 'A hidden offscreen window that loads the HTML and prints A4 PDF with Kannada shaped correctly.',
            prompt:
              'Write a TypeScript `htmlToPdf(html)` for Electron MAIN that creates a `BrowserWindow` with `show: false` and `webPreferences: { offscreen: true, sandbox: false }`, loads the HTML via `loadURL(\'data:text/html;charset=utf-8,\' + encodeURIComponent(html))`, waits `await new Promise(r => setTimeout(r, 250))` so the embedded font applies, calls `webContents.printToPDF({ pageSize: \'A4\', printBackground: true, margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 } })`, destroys the window, and returns the `Buffer`. Explain why `printToPDF` renders Kannada conjuncts correctly where a typical PDF library does not, and why the settle delay is needed.',
          },
          {
            step: 3,
            label: 'exportYearPdf + save dialog',
            outcome: 'A full `exportYearPdf(yearId, blank)` that builds, renders, and saves the PDF via a dialog.',
            prompt:
              'Write a TypeScript `exportYearPdf(prisma, yearId, blank)` for Electron MAIN that loads the year and its rows via Prisma, builds HTML with `registerHtml`, renders it with `htmlToPdf` to a `Buffer`, then calls `dialog.showSaveDialog` with a default name (`register.pdf` or `application-form.pdf`) and a `.pdf` filter. If `canceled` or no `filePath`, return `{ ok: false }`; otherwise `writeFileSync(filePath, pdf)`, optionally `shell.openPath(filePath)`, and return `{ ok: true, filePath }`. Then expose it over preload as `api.reports.exportYearPdf(yearId, blank)`. Stress that Prisma, the dialog, and the write all live in MAIN.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm8-q1',
      q: 'Why does this app back up with a logical JSON snapshot taken through Prisma instead of using `pg_dump`?',
      options: [
        'JSON snapshots are faster than `pg_dump` on large databases',
        'embedded-postgres ships only server binaries, so `pg_dump`/`pg_restore` are not available — and JSON is human-readable and version-independent',
        '`pg_dump` cannot handle Kannada text',
        'Prisma forbids using `pg_dump` on its databases',
      ],
      answer: 1,
    },
    {
      id: 'm8-q2',
      q: 'How does the app schedule its automatic backup, given a desktop app is not always running?',
      options: [
        'A cron job fires at a fixed time every night',
        'It backs up on startup only if no backup exists for today, and a failure is logged rather than fatal',
        'It backs up after every single database write',
        'It never backs up automatically; only manual backups exist',
      ],
      answer: 1,
    },
    {
      id: 'm8-q3',
      q: 'During a restore inside one `$transaction`, what is the correct handling of order and ids?',
      options: [
        'Delete parent-first and re-insert child-first, letting Postgres assign new ids',
        'Delete child-first and re-insert parent-first, preserving the original ids so foreign keys still line up',
        'Delete and insert in any order since the transaction makes order irrelevant',
        'Truncate every table with new ids and rebuild the foreign keys afterward',
      ],
      answer: 1,
    },
    {
      id: 'm8-q4',
      q: 'After restoring rows with their original ids, why must each table\'s sequence be re-synced with `setval(pg_get_serial_sequence(...), GREATEST(MAX(id), 1))`?',
      options: [
        'To compress the database and reclaim disk space',
        'Because inserting explicit ids does not advance the sequence, so the next ordinary insert would collide on a duplicate id',
        'To convert the ids from integers to UUIDs',
        'Because Prisma requires it before every query',
      ],
      answer: 1,
    },
    {
      id: 'm8-q5',
      q: 'What two things confirm the one-time import of the old Firestore data was correct?',
      options: [
        'The file size matches and the import finished without a crash',
        'Kannada is byte-perfect (including the virama U+0CCD) and the counts match — 91 maganes, 2280 households, and the grand total',
        'The import ran in under one second and used a single transaction',
        'The maganes were stored as UUIDs and the phones were left unsplit',
      ],
      answer: 1,
    },
    {
      id: 'm8-q6',
      q: 'Why is the year register exported via Chromium\'s `webContents.printToPDF` on a hidden offscreen window rather than a PDF library?',
      options: [
        'A PDF library cannot save files to disk',
        'Chromium reuses the browser\'s text-shaping engine, so Kannada conjuncts render correctly; the offscreen window keeps it invisible while the embedded base64 Noto font makes the PDF self-contained',
        '`printToPDF` is the only way to set A4 page size',
        'The offscreen window is required to connect to Firestore',
      ],
      answer: 1,
    },
  ],
};
