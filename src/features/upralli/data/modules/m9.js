// Module 9 — Packaging the Bundled-DB Installer & the Uninstall Data Prompt (Capstone)
// Course: building "Upralli Seva" (ಉಪ್ರಳ್ಳಿ ಸೇವೆ) — an OFFLINE desktop app
// (Electron + React + TypeScript via electron-vite + Prisma over a LOCAL PostgreSQL
// BUNDLED in the installer via embedded-postgres) for a coastal-Karnataka village
// temple committee's year-wise pooja/donor register. This capstone turns the app
// into a real Windows installer that ships Postgres + the Prisma engine inside it,
// and adds the headline feature: an NSIS uninstaller that asks the committee to
// KEEP or DELETE their years of records — defaulting, safely, to keep.

export const m9 = {
  id: 'm9',
  title: 'Packaging the Bundled-DB Installer & Uninstall Prompt',
  hours: 10,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'Take the finished Upralli Seva app and ship it as one Windows installer that bundles PostgreSQL and the Prisma engine inside it — no separate database to install. Survive the real Prisma-packaging traps (pruning, the `.prisma` dotfolder, asar), wire first-run boot that RESUMES a kept database, place data safely under %LOCALAPPDATA%\\UpralliSeva, and build the standout feature: a bilingual Kannada+English NSIS uninstall prompt that asks the committee to keep or delete everything. Finish by shipping the whole app and writing the committee handover guide.',
  sections: [
    {
      id: 'm9-s1',
      title: 'Packaging with electron-builder (the hard parts)',
      topics: [
        {
          id: 'm9-t1',
          title: 'electron-builder.yml: the App\'s Identity',
          explain:
            'A single YAML file tells electron-builder who your app is and how to wrap it into a Windows installer the committee can double-click.',
          analogy:
            'Before the temple sends out an invitation it decides the letterhead: the name at the top, the seal, the festival edition number. **electron-builder.yml** is that letterhead for your program — `productName` is the name on the shortcut, `appId` is the unique seal Windows uses to track install and uninstall, and `artifactName` is how the finished invitation file is named.',
          theory:
            'electron-builder reads a config — we keep it in a separate **`electron-builder.yml`** rather than cramming it into `package.json`, because this app\'s config grows long. At the top you declare identity. **`appId`** is a globally unique reverse-domain id, `com.upralliseva.desktop`; Windows groups the install, shortcuts, and uninstall entry under it, so two apps must never share one. **`productName`**, "Upralli Seva", is the friendly name shown on shortcuts, in the installer title, and in Apps & features.\n\nFor Windows you set a **`win`** block with a `target` array. We target **`nsis`** — a classic `Setup.exe` — because, uniquely, it lets us script the uninstall prompt later. **`artifactName`** controls the output filename; we use `\${productName}-Setup-\${version}.\${ext}` so each build is named like `Upralli Seva-Setup-1.0.0.exe`.\n\nThis YAML is the spine of the whole module. Every hard lesson that follows — asar, the afterPack hook, extraResources, the NSIS include — is one more key added to this same file. Get the identity right first, then layer the bundling tricks on top.',
          whyItMatters:
            'A unique `appId` keeps install and uninstall clean and is what the uninstall prompt later hooks into. A real name and icon mean a village committee member double-clicks "Upralli Seva" with confidence, not a grey `electron.exe` they are afraid of.',
          steps: [
            'Create `electron-builder.yml` at the project root.',
            'Set `appId: com.upralliseva.desktop` and `productName: Upralli Seva`.',
            'Add a `win` block with `target: [nsis]`.',
            'Set `artifactName: \${productName}-Setup-\${version}.\${ext}`.',
            'Add a `"dist": "electron-vite build && electron-builder"` script in `package.json`.',
            'Run the dist script once and find the named `Setup.exe` in the output folder.',
          ],
          code:
            '# electron-builder.yml (identity + Windows target)\n' +
            'appId: com.upralliseva.desktop\n' +
            'productName: Upralli Seva\n' +
            'directories:\n' +
            '  output: release\n' +
            'win:\n' +
            '  icon: build/icon.ico\n' +
            '  target: [nsis]\n' +
            '  artifactName: \${productName}-Setup-\${version}.\${ext}\n' +
            '# version is read from package.json; bump it for every release.',
          pitfalls: [
            'Reusing an `appId` copied from a tutorial — clashes confuse Windows install/uninstall tracking.',
            'Leaving config split awkwardly between `package.json` and the YAML; pick the YAML and keep it there.',
            'Forgetting the `win.target` array, so electron-builder guesses a target you did not want.',
            'A `productName` with characters you then forget to quote in the later NSIS script.',
            'Not bumping `version` between releases, so two different builds look identical to the committee.',
            'Changing `appId` after release, so the new version installs alongside the old instead of upgrading it.',
          ],
          tryIt:
            'Write a minimal `electron-builder.yml` with just `appId`, `productName`, and the `win` block, run your dist script, and confirm the output file is named `Upralli Seva-Setup-1.0.0.exe`.',
          takeaway:
            '`electron-builder.yml` is your program\'s letterhead and the spine of this whole module — set `appId`, `productName`, and the NSIS target first, then layer every bundling trick on top of it.',
        },
        {
          id: 'm9-t2',
          title: 'The Prisma Packaging Saga: Pruning',
          explain:
            'electron-builder prunes node_modules down to your declared dependencies — and that quietly breaks Prisma unless you understand what gets thrown away.',
          analogy:
            'Before a long journey the committee trims the luggage to a strict list and leaves everything not written down behind. **Pruning** is that trim: electron-builder packs only the packages listed in `dependencies`. The trouble is that some things Prisma needs are not on the list — like a tool you assumed someone would just bring — so they get left on the platform.',
          theory:
            'To keep installers small, electron-builder **prunes** `node_modules` down to exactly the packages declared in `dependencies` (and their transitive deps). `devDependencies` are dropped entirely. Normally this is great — but Prisma has two needs that pruning fights.\n\nFirst, the **`prisma` CLI**. You install it as a devDependency by habit, because it generates the client at build time. But this app runs `prisma migrate deploy` at **runtime**, on the user\'s machine, on first boot — so the CLI must survive pruning. The fix is blunt and correct: **move `prisma` into `dependencies`**, not devDependencies, so it ships.\n\nSecond, and nastier: Prisma\'s generated client lives in **`node_modules/.prisma`** — a *dotfolder* that is not itself a declared package. Pruning has no `dependencies` entry pointing at `.prisma`, so it gets dropped, and at runtime Prisma cannot find its generated `default` client or query engine. You cannot fix this with `files` globs, because globs select from what survives pruning — they cannot rescue something pruning already deleted. The real fix is the afterPack hook two topics from now.',
          whyItMatters:
            'These two pruning traps are the single most common reason a "working in dev" Electron+Prisma app crashes the instant it is installed. Knowing pruning is the cause turns a baffling "Cannot find module .prisma/client" into a one-line dependency move plus a copy hook.',
          steps: [
            'Move `prisma` from `devDependencies` to `dependencies` in `package.json`.',
            'Keep `@prisma/client` in `dependencies` (it always belonged there).',
            'Understand that `node_modules/.prisma` is generated, not a declared package.',
            'Accept that `files` globs cannot rescue `.prisma` — pruning runs first.',
            'Note this for the afterPack hook that re-copies `.prisma` after pruning.',
            'Run `prisma generate` in your build before packaging so `.prisma` exists to copy.',
          ],
          code:
            '// package.json — the dependency split that survives pruning\n' +
            '{\n' +
            '  \'dependencies\': {\n' +
            '    \'@prisma/client\': \'^5.18.0\',\n' +
            '    \'prisma\': \'^5.18.0\',          // moved here: CLI needed at RUNTIME\n' +
            '    \'embedded-postgres\': \'^17.0.0\'\n' +
            '  },\n' +
            '  \'scripts\': {\n' +
            '    \'postinstall\': \'prisma generate\',\n' +
            '    \'dist\': \'electron-vite build && prisma generate && electron-builder\'\n' +
            '  }\n' +
            '}\n' +
            '// NOTE: node_modules/.prisma is a generated dotfolder, NOT a dep.\n' +
            '// Pruning drops it; a files glob cannot bring it back (see afterPack).',
          pitfalls: [
            'Leaving `prisma` in `devDependencies`, so `migrate deploy` fails at runtime with "prisma: not found".',
            'Believing a `files: [\'**/node_modules/.prisma/**\']` glob will save it — pruning already removed it.',
            'Forgetting to run `prisma generate` before packaging, so there is no `.prisma` to copy.',
            'Confusing `@prisma/client` (the runtime library) with `prisma` (the CLI) — you need both shipped.',
            'Assuming dev success predicts packaged success; pruning only happens in the packaged build.',
            'Pinning mismatched versions of `prisma` and `@prisma/client`, which Prisma refuses at runtime.',
          ],
          tryIt:
            'Build the installer with `prisma` still in devDependencies, install it, and read the crash: a missing-module error pointing at `.prisma`. That failure is the whole lesson — then move `prisma` to dependencies and continue.',
          takeaway:
            'Pruning keeps only declared deps, so move `prisma` into `dependencies` for the runtime CLI, and remember the generated `node_modules/.prisma` dotfolder is dropped and cannot be rescued by a glob — only by the afterPack hook.',
        },
        {
          id: 'm9-t3',
          title: 'Why asar: false for This App',
          explain:
            'asar packs your app into one virtual archive — but Prisma\'s engines and embedded-postgres\'s binaries resolve painfully through it, so we turn asar off.',
          analogy:
            'asar is like sealing all the temple\'s supplies into one shrink-wrapped block: tidy, but now you cannot just reach in and grab the oil lamp when you need it. **Native binaries** — Prisma\'s query engine, the Postgres server executables — are tools that must be *run* directly from disk. Through the shrink-wrap they jam. So for this app we skip the wrap and leave the supplies on open shelves.',
          theory:
            'By default electron-builder packs your app code into an **`app.asar`** — a single virtual filesystem that Electron reads transparently. For pure JavaScript this is fine and even faster. The problem is **native binaries** and tools that expect real file paths.\n\nPrisma\'s generated client at `.prisma/client/default` plus its **native query engine** (a `.dll`/`.node` binary) and **embedded-postgres\'s server binaries** (`postgres.exe`, `initdb.exe`, …) are all programs that must be executed from a real location on disk. Asar gives them a *virtual* path inside the archive, and spawning a process from a virtual path either fails outright or forces fragile "unpack to temp" workarounds. People burn days fighting `asarUnpack` globs trying to coax these binaries out.\n\nThe pragmatic, well-trodden fix for a bundled-DB Prisma app is **`asar: false`**. Your app ships as ordinary files and folders in `resources/app/`, every binary sits at a real path Prisma and embedded-postgres can spawn, and the painful virtual-FS resolution simply disappears. The cost is a slightly larger, less tidy install folder — a price worth paying for an app whose entire job depends on launching a database engine.',
          whyItMatters:
            'Fighting asar over native binaries is the second great time-sink (after pruning) for this stack. Choosing `asar: false` up front sidesteps a whole class of "works in dev, spawn fails when installed" bugs that are miserable to debug.',
          steps: [
            'Add `asar: false` to `electron-builder.yml`.',
            'Accept that `resources/app/` will now hold ordinary unpacked files.',
            'Confirm Prisma\'s `.prisma/client/default` resolves to a real path at runtime.',
            'Confirm embedded-postgres can spawn `postgres.exe` from its real binary folder.',
            'Skip the `asarUnpack` rabbit hole entirely — there is no asar to unpack.',
            'Rebuild and verify the app launches its bundled database after install.',
          ],
          code:
            '# electron-builder.yml — turn the archive OFF for this app\n' +
            'appId: com.upralliseva.desktop\n' +
            'productName: Upralli Seva\n' +
            'asar: false        # Prisma engine + embedded-postgres binaries need real paths\n' +
            'win:\n' +
            '  target: [nsis]\n' +
            '\n' +
            '# With asar:false, the app lives as plain files under:\n' +
            '#   <install>\\resources\\app\\  (main, renderer, node_modules, .prisma)\n' +
            '# every native binary sits at a real, spawnable path.',
          pitfalls: [
            'Leaving asar on, then hitting "ENOENT" / spawn failures when Prisma or Postgres binaries run.',
            'Trying to fix it with endless `asarUnpack` globs instead of just disabling asar.',
            'Assuming `asar: false` hurts performance meaningfully — for this app the binary-spawn correctness wins.',
            'Forgetting that with asar off, your source is readable in the install folder (fine for an in-house temple app).',
            'Mixing `asar: false` with `asarUnpack` entries that now do nothing but confuse readers.',
            'Expecting `asar: false` alone to fix `.prisma` — it does not; you still need the afterPack copy.',
          ],
          tryIt:
            'Build once with the default `asar: true` and watch the bundled-Postgres start fail or behave erratically; then set `asar: false`, rebuild, and watch the database start cleanly. The contrast makes the choice obvious.',
          takeaway:
            'Prisma\'s engine and embedded-postgres\'s binaries must spawn from real paths, which asar\'s virtual filesystem fights — so `asar: false` is the pragmatic, time-saving choice for this bundled-DB app.',
        },
        {
          id: 'm9-t4',
          title: 'The afterPack Hook: Rescuing .prisma',
          explain:
            'Because pruning drops the generated `.prisma` dotfolder, a small afterPack script copies it back into the packaged app after electron-builder finishes.',
          analogy:
            'The luggage was trimmed to the list (pruning) and the essential tool got left behind. **afterPack** is the helper who runs out to the platform just before the train leaves and places that tool back into the carriage. It runs *after* packing, when the app folder exists but the train has not yet departed — the perfect moment to slip `.prisma` back in.',
          theory:
            'electron-builder fires an **`afterPack`** hook once it has assembled the app folder but before zipping it into the installer. You point it at a small script — we use a `.cjs` file so it loads as CommonJS regardless of your project\'s module type — and electron-builder calls it with a `context` object that includes **`appOutDir`**, the path to the packed app.\n\nOur script does one job: copy your project\'s generated **`node_modules/.prisma`** into the packed app at **`resources/app/node_modules/.prisma`**. Because pruning deleted it during packing, this restores it at the last moment, at a real path (thanks to `asar: false`) where Prisma can find its `client/default` and native engine at runtime.\n\nThe script is plain Node fs work — recursively copy a directory. Keep it defensive: confirm the source `.prisma` exists (you ran `prisma generate` first), build the destination from `context.appOutDir`, and copy. This tiny hook, paired with moving `prisma` to dependencies and `asar: false`, is the complete cure for the Prisma packaging saga.',
          whyItMatters:
            'This is the missing piece that makes a bundled-Prisma installer actually work. Without it, every install ships an app that cannot find its own database client; with it, the generated engine rides along to every committee\'s PC.',
          steps: [
            'Create `scripts/after-pack.cjs`.',
            'Reference it in YAML: `afterPack: scripts/after-pack.cjs`.',
            'In the script, read `context.appOutDir` for the packed app path.',
            'Build source `node_modules/.prisma` and dest `resources/app/node_modules/.prisma`.',
            'Copy recursively with `fs.cpSync(src, dest, { recursive: true })`.',
            'Rebuild, then browse the install folder to confirm `.prisma` is present.',
          ],
          code:
            '// scripts/after-pack.cjs — copy generated .prisma back after pruning\n' +
            'const fs = require(\'fs\');\n' +
            'const path = require(\'path\');\n' +
            '\n' +
            'exports.default = async function afterPack(context) {\n' +
            '  const src = path.join(__dirname, \'..\', \'node_modules\', \'.prisma\');\n' +
            '  const dest = path.join(\n' +
            '    context.appOutDir, \'resources\', \'app\', \'node_modules\', \'.prisma\');\n' +
            '\n' +
            '  if (!fs.existsSync(src)) {\n' +
            '    throw new Error(\'.prisma missing — run \\\'prisma generate\\\' first\');\n' +
            '  }\n' +
            '  fs.mkdirSync(path.dirname(dest), { recursive: true });\n' +
            '  fs.cpSync(src, dest, { recursive: true });\n' +
            '  console.log(\'[after-pack] copied .prisma ->\', dest);\n' +
            '};',
          pitfalls: [
            'Naming the hook `.js` in an ESM project, so it fails to load — use `.cjs`.',
            'Hard-coding the dest path instead of building it from `context.appOutDir`.',
            'Running the hook before `prisma generate`, so the source `.prisma` does not exist.',
            'Copying to `resources/app.asar/...` paths that do not exist (you set `asar: false`, so it is `resources/app/`).',
            'Forgetting `{ recursive: true }`, so only the top folder copies and the engine is missing.',
            'Swallowing errors silently, so a failed copy ships a broken installer that only crashes on the user\'s PC.',
          ],
          tryIt:
            'Add the afterPack script, rebuild, and open `<install>\\resources\\app\\node_modules\\.prisma`. Seeing `client\\default` and the engine binary sitting there is proof the rescue worked.',
          takeaway:
            'The `afterPack` hook copies the pruned-away `.prisma` back into `resources/app/node_modules/.prisma` at a real path — the final, essential cure that lets a bundled-Prisma installer find its client and engine at runtime.',
        },
        {
          id: 'm9-t5',
          title: 'extraResources: Schema, Migrations & the Noto Font',
          explain:
            'Files the app reads at runtime as plain files — the Prisma schema and migrations, plus the Kannada Noto font — ride alongside the app via extraResources.',
          analogy:
            'Some things you do not stitch into your robe but carry in a side bag you can open on the road: the rate-card template, the festival calendar. **extraResources** is that side bag — the Prisma migrations the app replays on first boot, and the Kannada font that renders ಉಪ್ರಳ್ಳಿ correctly — placed where the app can reach them as ordinary files.',
          theory:
            '**`extraResources`** copies files into the **`resources/`** folder next to the executable, as plain files the app reads at runtime — not packed into the app bundle. For Upralli Seva three things belong here.\n\nThe **Prisma schema and migrations**: the app runs `prisma migrate deploy` on first boot to build the database, and `deploy` needs the `schema.prisma` and the `migrations/` SQL folder available on disk. We copy them with a `filter` so only `schema.prisma` and `migrations/**/*` ride along, not stray dev files. The app resolves them under `process.resourcesPath` (covered in section 2).\n\nThe **Noto Kannada font**: a village machine may not have a font that renders the Kannada script of the temple name and seva labels. Bundling `NotoSansKannada` and loading it from `resources/fonts` guarantees ಉಪ್ರಳ್ಳಿ ಸೇವೆ displays correctly everywhere. Each entry is a `from`/`to` pair, and the schema/migrations entry adds a `filter` array to keep it tidy.',
          whyItMatters:
            'If migrations are not on disk, first-run `migrate deploy` has nothing to apply and the committee\'s database is never created. If the Kannada font is missing, the temple\'s own name renders as tofu boxes — both are unacceptable for this app.',
          steps: [
            'Add an `extraResources` list to `electron-builder.yml`.',
            'Copy `resources/fonts` to `fonts` for the bundled Noto Kannada font.',
            'Copy the `prisma` folder to `prisma`, filtered to `schema.prisma` and `migrations/**/*`.',
            'In the app, resolve these under `process.resourcesPath` when packaged.',
            'Load the font in the renderer via a `@font-face` pointing at the bundled file.',
            'Rebuild and confirm `resources/prisma/migrations` and `resources/fonts` exist.',
          ],
          code:
            '# electron-builder.yml — runtime files in the side bag\n' +
            'asar: false\n' +
            'afterPack: scripts/after-pack.cjs\n' +
            'extraResources:\n' +
            '  - { from: resources/fonts, to: fonts }\n' +
            '  - from: prisma\n' +
            '    to: prisma\n' +
            '    filter: [schema.prisma, migrations/**/*]\n' +
            '\n' +
            '# At runtime the app finds them at:\n' +
            '#   process.resourcesPath + \'\\prisma\\schema.prisma\'\n' +
            '#   process.resourcesPath + \'\\fonts\\NotoSansKannada-Regular.ttf\'',
          pitfalls: [
            'Forgetting to copy `migrations/**/*`, so `migrate deploy` has nothing to apply and the DB is empty.',
            'Reading the schema by a relative dev path instead of `process.resourcesPath` once installed.',
            'Omitting the `filter`, so stray files from the `prisma` folder bloat the installer.',
            'Not bundling the Kannada font, so ಉಪ್ರಳ್ಳಿ ಸೇವೆ renders as empty boxes on a bare machine.',
            'Pointing `@font-face` at a dev path that does not exist in the packaged app.',
            'Assuming `extraResources` files get pruned like node_modules — they do not, but they also are not in the app bundle.',
          ],
          tryIt:
            'Add the font and prisma `extraResources` entries, rebuild, and browse `<install>\\resources\\`. Confirm `fonts\\NotoSansKannada-Regular.ttf` and `prisma\\migrations\\` are present and ready for first-run boot.',
          takeaway:
            '`extraResources` carries the Prisma schema/migrations and the Noto Kannada font as plain files under `resources/` — the migrations feed first-run `migrate deploy`, and the font guarantees the temple\'s name always renders.',
        },
        {
          id: 'm9-t6',
          title: 'Bundling embedded-postgres & Final Size',
          explain:
            'embedded-postgres ships a full PostgreSQL server as binaries inside your app, so the installer carries the database itself — landing around 131-137 MB.',
          analogy:
            'Most apps tell you to "go dig your own well" (install PostgreSQL separately). Upralli Seva instead carries a **complete well kit** in its luggage — the Postgres server binaries — so when it arrives at a village machine with nothing on it, it can raise water immediately. That kit is heavy, and it is exactly why the finished installer weighs what it does.',
          theory:
            'The defining choice of this course is that the database is **bundled, not a prerequisite**. The **`embedded-postgres`** package ships the actual PostgreSQL server executables (`postgres`, `initdb`, `pg_ctl`, …) for the platform, and at runtime your main process initialises a data directory and starts a local cluster on a loopback port — no system install, no Windows service, nothing for the committee to set up.\n\nFor packaging this means the Postgres binaries must survive into the installer. Because they live inside `node_modules/embedded-postgres` and that *is* a declared dependency, pruning keeps them; and because **`asar: false`** leaves them as real files, they can be spawned. (Some setups also list them under `asarUnpack`, but with asar off that is moot.) The result is that everything needed to run a database rides inside one `.exe`.\n\nThat completeness has a weight: a typical Upralli Seva installer lands around **131-137 MB**, dominated by the Postgres binaries plus the Prisma query engine and the Electron runtime. This is normal and acceptable for an offline app whose whole value is "install once, runs a real database with zero external dependencies".',
          whyItMatters:
            'Bundling the database is what makes this app truly offline and committee-friendly — no IT person needed to install Postgres. Knowing the ~131-137 MB size is expected stops you from chasing a "bloat bug" that is actually the feature working as designed.',
          steps: [
            'Keep `embedded-postgres` in `dependencies` so pruning preserves its binaries.',
            'Rely on `asar: false` so the Postgres executables sit at spawnable real paths.',
            'In the main process, point embedded-postgres at the data dir under %LOCALAPPDATA% (section 2).',
            'Build the installer and note the final size (~131-137 MB is expected).',
            'Verify on a clean machine that the app starts its own Postgres with nothing pre-installed.',
            'Document the size in your release notes so the committee knows what to expect on a USB copy.',
          ],
          code:
            '// main/db/postgres.ts — start the BUNDLED Postgres (no system install)\n' +
            'import EmbeddedPostgres from \'embedded-postgres\';\n' +
            '\n' +
            'export async function startBundledPg(dataDir: string, port: number) {\n' +
            '  const pg = new EmbeddedPostgres({\n' +
            '    databaseDir: dataDir,   // under %LOCALAPPDATA%\\UpralliSeva\\pgdata\n' +
            '    user: \'upralli\', password: \'upralli\',\n' +
            '    port, persistent: true   // keep the cluster between runs\n' +
            '  });\n' +
            '  // initialise once, then start; binaries ship inside the installer\n' +
            '  await pg.initialise();\n' +
            '  await pg.start();\n' +
            '  return pg; // ~131-137 MB installer once everything is bundled\n' +
            '}',
          pitfalls: [
            'Moving `embedded-postgres` to devDependencies, so pruning strips the Postgres binaries from the install.',
            'Leaving asar on, so the spawned `postgres.exe` cannot run from a virtual path.',
            'Treating the ~131-137 MB size as a defect and stripping files the database needs.',
            'Pointing the data dir inside the install folder instead of %LOCALAPPDATA% (breaks per-machine + uninstall).',
            'Calling `initialise()` every launch instead of only when the cluster does not yet exist (see resume logic).',
            'Forgetting that bundled Postgres still needs a free loopback port — handle a busy port gracefully.',
          ],
          tryIt:
            'Build the full installer and check its size — expect roughly 131-137 MB. Then install it on a machine with no PostgreSQL at all and confirm the app raises its own database from the bundled binaries.',
          takeaway:
            'embedded-postgres bundles a real PostgreSQL server inside your installer so the app is truly offline and zero-setup — the resulting ~131-137 MB is the weight of carrying the whole well kit, and that is the feature working.',
        },
      ],
    },
    {
      id: 'm9-s2',
      title: 'First Run, Resume & Data Location',
      topics: [
        {
          id: 'm9-t7',
          title: 'First-Run Boot: Init or Resume',
          explain:
            'On launch the main process starts the bundled cluster — initialising a fresh one or RESUMING an existing one — then deploys migrations and opens the window.',
          analogy:
            'When the committee opens the temple office each morning, someone checks: is this the very first day (set up the room, rule the register) or a normal day (the register is already here, just unlock and continue)? **First-run boot** is that check. The `PG_VERSION` file in the data folder is the sign on the door saying "a register already exists here — resume, do not start over".',
          theory:
            'The boot sequence runs once per launch in the main process, before the window opens. Step one: locate the data directory and decide **init vs resume**. embedded-postgres has already initialised a cluster if a **`PG_VERSION`** marker file exists in the pgdata folder; if it does, you **resume** by just starting the existing cluster, and if it does not, you **initialise** a fresh one. This single check is what lets a reinstall pick up exactly where the committee left off.\n\nStep two: with the cluster up, run **`prisma migrate deploy`** against it. `deploy` applies any pending migrations idempotently — on a fresh cluster it builds every table, on a resumed one it applies only what is new, and on an up-to-date one it does nothing. This is why migrations must be in `extraResources`.\n\nStep three: if the database is empty (no years, no Maganes), seed or import the starting data — otherwise leave the committee\'s records untouched. Only after all that do you create the BrowserWindow. Booting in this order means the renderer never opens against a half-built or absent database.',
          whyItMatters:
            'This sequence is what makes the app self-installing AND resumable: a village committee just launches it, and whether it is day one or year five, the right thing happens — fresh setup or seamless continuation — with no developer present.',
          steps: [
            'Resolve the pgdata path under %LOCALAPPDATA%\\UpralliSeva.',
            'Check for the `PG_VERSION` marker to decide initialise vs resume.',
            'Start (or init then start) the bundled cluster on a loopback port.',
            'Run `prisma migrate deploy` using the bundled schema/migrations.',
            'If the database is empty, seed/import; otherwise leave records alone.',
            'Only after a healthy DB, create and show the main window.',
          ],
          code:
            '// main/boot.ts — init-or-resume, then migrate, then open\n' +
            'import fs from \'fs\';\n' +
            'import path from \'path\';\n' +
            '\n' +
            'export async function boot(dataDir: string, pg: EmbeddedPostgres) {\n' +
            '  const marker = path.join(dataDir, \'PG_VERSION\');\n' +
            '  if (!fs.existsSync(marker)) {\n' +
            '    await pg.initialise();   // first ever run: make a fresh cluster\n' +
            '  }\n' +
            '  await pg.start();          // RESUME: PG_VERSION present -> just start\n' +
            '\n' +
            '  await runPrismaCli([\'migrate\', \'deploy\']);  // idempotent\n' +
            '  if (await isEmpty()) await seedOrImport();\n' +
            '  createWindow();\n' +
            '}',
          pitfalls: [
            'Calling `initialise()` unconditionally, wiping or erroring on an existing committee database.',
            'Opening the window before migrations finish, so the UI queries tables that do not exist yet.',
            'Seeding without an "is it empty?" check, duplicating Maganes and seva rows every launch.',
            'Forgetting that `migrate deploy` needs the migrations from `extraResources` on disk.',
            'Not awaiting `pg.start()`, racing the migration step against a cluster that is not up yet.',
            'Treating a resume as fresh because you looked in the wrong (install-folder) data path.',
          ],
          tryIt:
            'Launch once to create the database and add a Magane. Quit, relaunch, and confirm boot RESUMES — the Magane is still there, no re-seed, no fresh cluster. Then delete pgdata and relaunch to watch a clean initialise.',
          takeaway:
            'Boot checks `PG_VERSION` to initialise or RESUME the bundled cluster, deploys migrations idempotently, seeds only when empty, then opens the window — the sequence that makes the app both self-installing and seamlessly resumable.',
        },
        {
          id: 'm9-t8',
          title: 'Data Lives in %LOCALAPPDATA%\\UpralliSeva',
          explain:
            'The pgdata and backups live under %LOCALAPPDATA%\\UpralliSeva, deliberately OUTSIDE the install folder, so a normal uninstall never touches the committee\'s records.',
          analogy:
            'The temple building belongs to the trust and may be repainted or rebuilt; the **register of devotees** is kept in a separate strongroom that nobody disturbs when the building is worked on. Your **install folder** is the building; **%LOCALAPPDATA%\\UpralliSeva** is the strongroom. Repaint the building (reinstall) all you like — the register survives unless someone deliberately opens the strongroom and clears it.',
          theory:
            'Where the data lives is a design decision with consequences for the whole module. We put both the Postgres **pgdata** directory and the **backups** folder under **`%LOCALAPPDATA%\\UpralliSeva`** — a per-user, writable location that is **outside the install directory** (Program Files or `%LOCALAPPDATA%\\Programs`).\n\nThis separation buys two things. First, **safety on uninstall**: NSIS removes the install folder, and because the data is not in it, a normal uninstall leaves every year of records intact by default. That is precisely what makes the keep-or-delete prompt a real, meaningful choice rather than a foregone conclusion. Second, **per-machine correctness**: writing into Program Files would fail on a locked-down machine, so a writable per-user data root is the right home.\n\nWe also drop a small **`config.json`** in that root pointing at the active data directory and port. The app reads it on boot to find its database, and it gives a single, documented place the committee can look when backing up or moving to a new PC. Data location is not an afterthought here — it is the hinge the uninstall feature swings on.',
          whyItMatters:
            'Because the data is outside the install folder, an ordinary uninstall cannot accidentally destroy years of pooja and donor records — and a kept uninstall plus reinstall resumes perfectly. The whole headline feature depends on this placement.',
          steps: [
            'Resolve the data root from %LOCALAPPDATA% (e.g. `path.join(process.env.LOCALAPPDATA, \'UpralliSeva\')`).',
            'Create `%LOCALAPPDATA%\\UpralliSeva\\pgdata` and `\\backups` if missing.',
            'Write a `config.json` there pointing at the active data dir and port.',
            'Point embedded-postgres `databaseDir` at the pgdata path.',
            'Confirm the install folder contains no database files at all.',
            'Document this root in the handover guide as the one place to back up.',
          ],
          code:
            '// main/paths.ts — data OUTSIDE the install dir, in %LOCALAPPDATA%\n' +
            'import path from \'path\';\n' +
            'import fs from \'fs\';\n' +
            '\n' +
            'const ROOT = path.join(process.env.LOCALAPPDATA, \'UpralliSeva\');\n' +
            'export const PGDATA  = path.join(ROOT, \'pgdata\');\n' +
            'export const BACKUPS = path.join(ROOT, \'backups\');\n' +
            'export const CONFIG  = path.join(ROOT, \'config.json\');\n' +
            '\n' +
            'export function ensureDataDirs() {\n' +
            '  fs.mkdirSync(PGDATA, { recursive: true });\n' +
            '  fs.mkdirSync(BACKUPS, { recursive: true });\n' +
            '  if (!fs.existsSync(CONFIG))\n' +
            '    fs.writeFileSync(CONFIG, JSON.stringify({ dataDir: PGDATA, port: 54329 }));\n' +
            '}',
          pitfalls: [
            'Putting pgdata inside the install folder, so a normal uninstall silently destroys the committee\'s records.',
            'Writing data to Program Files, which is read-only on per-machine installs.',
            'Hard-coding a single user\'s path instead of resolving %LOCALAPPDATA% at runtime.',
            'Forgetting the `backups` folder, so there is nowhere clean to drop a backup dump.',
            'Not writing `config.json`, leaving the app unable to find a relocated data dir.',
            'Documenting the wrong location in handover, so the committee backs up an empty folder.',
          ],
          tryIt:
            'Run the app, then open `%LOCALAPPDATA%\\UpralliSeva` in Explorer and find `pgdata`, `backups`, and `config.json`. Then open the install folder and confirm it holds no database — the separation is now concrete.',
          takeaway:
            'pgdata and backups live under %LOCALAPPDATA%\\UpralliSeva, outside the install folder, so a normal uninstall never touches them and a reinstall resumes — this placement is the hinge the entire uninstall feature swings on.',
        },
        {
          id: 'm9-t9',
          title: 'Path Resolution: Dev vs Packaged',
          explain:
            'Resolving the schema, migrations, and binaries differs between development and a packaged install — `app.isPackaged` and `process.resourcesPath` keep both working.',
          analogy:
            'A priest who serves at both the town temple and the village temple must know which building they are standing in before they reach for anything — the lamp is on a different shelf in each. **app.isPackaged** is that "which building am I in?" check, and once you know, you reach to the right shelf: the dev project folder or the installed `resources/` directory.',
          theory:
            'Code that finds files must behave differently in two worlds. In **development**, your schema and migrations sit in the project\'s `prisma/` folder and `node_modules` is right there. In a **packaged** install, the schema/migrations were copied via `extraResources` into **`process.resourcesPath`**, and the app code lives under `resources/app/` (because `asar: false`).\n\nThe switch is **`app.isPackaged`**. When false, build paths relative to `app.getAppPath()` / your project root; when true, build them from `process.resourcesPath`. Wrap this in one helper so every consumer — Prisma CLI invocation, font loading, schema reads — asks the same function rather than scattering `if (app.isPackaged)` everywhere.\n\nThere is one more subtlety the previous code hints at: running the **Prisma CLI** in a packaged app. There is no `node` on a user\'s machine, so you launch the CLI through Electron itself — `process.execPath` with the environment variable **`ELECTRON_RUN_AS_NODE=1`**, which makes Electron behave as a plain Node runtime to execute the bundled `prisma` CLI script. Getting path resolution right is what makes "works in dev" finally also mean "works installed".',
          whyItMatters:
            'Almost every "works in dev, broken when installed" bug in this stack is a path that assumed the dev layout. A single isPackaged-aware resolver eliminates that entire category and is the difference between a demo and a shippable app.',
          steps: [
            'Write one `resourcePath()` helper that branches on `app.isPackaged`.',
            'In packaged mode, base paths on `process.resourcesPath`.',
            'In dev mode, base paths on `app.getAppPath()` / project root.',
            'Resolve the Prisma CLI script path under the (unpacked) node_modules.',
            'Run the CLI via `process.execPath` with `ELECTRON_RUN_AS_NODE=1`.',
            'Log the resolved paths once at boot to verify both modes.',
          ],
          code:
            '// main/resolve.ts — one helper for both worlds\n' +
            'import { app } from \'electron\';\n' +
            'import path from \'path\';\n' +
            'import { spawnSync } from \'child_process\';\n' +
            '\n' +
            'export const schemaPath = () => app.isPackaged\n' +
            '  ? path.join(process.resourcesPath, \'prisma\', \'schema.prisma\')\n' +
            '  : path.join(app.getAppPath(), \'prisma\', \'schema.prisma\');\n' +
            '\n' +
            'export function runPrismaCli(args) {\n' +
            '  const cli = path.join(app.getAppPath(), \'node_modules\', \'prisma\',\n' +
            '    \'build\', \'index.js\');\n' +
            '  return spawnSync(process.execPath, [cli, ...args, \'--schema\', schemaPath()],\n' +
            '    { env: { ...process.env, ELECTRON_RUN_AS_NODE: \'1\' } });\n' +
            '}',
          pitfalls: [
            'Using a dev-relative path for the schema, so `migrate deploy` cannot find it once installed.',
            'Assuming `node` exists on the user\'s machine instead of running via `process.execPath`.',
            'Forgetting `ELECTRON_RUN_AS_NODE=1`, so Electron tries to open a window instead of running the CLI.',
            'Scattering `if (app.isPackaged)` everywhere instead of centralising in one resolver.',
            'Pointing at `resources/app.asar/...` paths that do not exist because you set `asar: false`.',
            'Not logging resolved paths, making install-only path bugs slow to diagnose.',
          ],
          tryIt:
            'Add the resolver, log `schemaPath()` at boot, and compare the output running `electron-vite dev` versus the installed app. Seeing the path switch from the project folder to `resources\\prisma` confirms both worlds work.',
          takeaway:
            'Branch on `app.isPackaged` to resolve schema, migrations, and binaries from `process.resourcesPath` when packaged, and run the Prisma CLI via `process.execPath` + `ELECTRON_RUN_AS_NODE=1` — one resolver kills the whole "works in dev only" bug class.',
        },
        {
          id: 'm9-t10',
          title: 'Code Signing, SmartScreen & Boot Logging',
          explain:
            'An unsigned installer makes Windows SmartScreen warn the committee; signing fixes it, and boot logging to %TEMP% lets you support a machine you cannot see.',
          analogy:
            'A letter without the temple seal makes people hesitate at the gate. **Code signing** is that wax seal on your installer; without it, **SmartScreen** stops the committee with a stern blue warning. And because the village machine is far from you, **boot logging** is the diary the app keeps of its own morning routine — so when something goes wrong, the committee can read you the diary over the phone.',
          theory:
            'When the committee runs `Setup.exe`, Windows **SmartScreen** checks whether it is **digitally signed** by a publisher with reputation. **Unsigned**, it shows the blue "Windows protected your PC" screen; the user must click "More info → Run anyway". It still installs, but it looks alarming. **Code signing** attaches a cryptographic signature from a code-signing certificate, proving who published the file and that it was not tampered with; electron-builder signs automatically when you supply the certificate. **EV** certificates earn SmartScreen trust immediately, standard ones build reputation over time. For a single committee you may ship unsigned and document the one-time warning — an honest choice if the handover explains it.\n\nThe second half is **support from afar**. This app runs on a village PC you will never sit at, so it must keep a **boot log**. Write each boot step — data dir resolved, cluster init/resume, migrate deploy result, window opened, and any error with its stack — to a file in **`%TEMP%`** (e.g. `%TEMP%\\upralli-boot.log`). When the committee reports "it will not open", they can find that file and read it to you, turning a blind debugging session into a guided one.',
          whyItMatters:
            'A scary SmartScreen warning can make a cautious committee abandon the install; either sign or document it. And a boot log is often the only window you have into a failure on a machine you cannot reach — without it, remote support is guesswork.',
          steps: [
            'Decide: buy a code-signing certificate or ship unsigned with a documented warning.',
            'If signing, set `win.certificateFile` and pass the password via an environment variable.',
            'If unsigned, write the exact "More info → Run anyway" steps into the handover.',
            'Add a boot logger that appends each step to `%TEMP%\\upralli-boot.log`.',
            'Log errors with stack traces, and the resolved data/schema paths.',
            'Tell the committee where the log lives so they can read it during a support call.',
          ],
          code:
            '// main/log.ts — boot diary to %TEMP% for remote support\n' +
            'import fs from \'fs\';\n' +
            'import path from \'path\';\n' +
            'import os from \'os\';\n' +
            '\n' +
            'const LOG = path.join(os.tmpdir(), \'upralli-boot.log\');\n' +
            'export function boot(step) {\n' +
            '  fs.appendFileSync(LOG, new Date().toISOString() + \'  \' + step + \'\\n\');\n' +
            '}\n' +
            '// usage: boot(\'data dir: \' + PGDATA); boot(\'cluster RESUMED\');\n' +
            '//        boot(\'migrate deploy ok\'); boot(\'window opened\');\n' +
            '\n' +
            '// electron-builder.yml (signed build, password from env):\n' +
            '// win: { certificateFile: build/codesign.pfx,\n' +
            '//        certificatePassword: \${CSC_KEY_PASSWORD} }',
          pitfalls: [
            'Hard-coding the certificate password in the YAML instead of an environment variable.',
            'Committing the `.pfx` certificate into git.',
            'Expecting a brand-new standard certificate to clear SmartScreen instantly — reputation takes time.',
            'Shipping unsigned with no explanation, so a cautious committee refuses the "Run anyway" step.',
            'Logging to the install folder (read-only) instead of `%TEMP%`, so the log silently fails.',
            'Logging secrets (passwords, full connection strings) into a file the committee will share.',
          ],
          tryIt:
            'Build unsigned and run it on a clean machine to see the exact SmartScreen wording; write the click-through into your handover. Then trigger a boot failure (rename pgdata mid-run) and read `%TEMP%\\upralli-boot.log` to confirm the diary captured it.',
          takeaway:
            'Unsigned installers trigger a SmartScreen warning you must either sign away or honestly document, and a boot log in %TEMP% is your only eyes on a village machine — both turn a far-off install from fragile into supportable.',
        },
      ],
    },
    {
      id: 'm9-s3',
      title: 'The Uninstall Keep/Delete-Data Prompt',
      topics: [
        {
          id: 'm9-t11',
          title: 'Custom NSIS Uninstall via installer.nsh',
          explain:
            'electron-builder lets you inject your own NSIS script into the uninstaller through `nsis.include`, and the `customUnInstall` macro is where the keep/delete question lives.',
          analogy:
            'The standard uninstaller is a cleaner who sweeps the room and leaves. **A custom NSIS script** is one extra instruction slipped into the cleaner\'s hand: "before you lock up, ask whether to keep or clear the strongroom." `build/installer.nsh` is that note, and `customUnInstall` is the moment the cleaner reads it.',
          theory:
            'NSIS is the engine electron-builder uses to build Windows installers, and it is **scriptable**. electron-builder exposes this through **`nsis.include`** — point it at a `.nsh` file (we use `build/installer.nsh`) and your script is compiled into the generated installer and uninstaller.\n\nInside that file you define special **macros** that electron-builder calls at known moments. The one we need is **`customUnInstall`**, which runs during uninstall. This is the exact hook where we will pop the keep-or-delete message box and, on delete, remove the data folder.\n\nNSIS looks unfamiliar — it is its own stack-based language with `MessageBox`, `RMDir`, and label-based jumps, and line continuations use a trailing backslash. You do not need to master it; you need a handful of lines in the right macro. We also set **`deleteAppDataOnUninstall: false`** in the `nsis` block so electron-builder never auto-wipes data behind our backs — our macro is the *only* thing allowed to decide the data\'s fate. Confirm the hook fires with a smoke-test box before building the real prompt on top.',
          whyItMatters:
            'Without this hook there is nowhere to ask the keep-or-delete question — the headline feature of the whole module cannot exist. And `deleteAppDataOnUninstall: false` guarantees the default uninstall is non-destructive, which the ethics of the feature demand.',
          steps: [
            'Create `build/installer.nsh`.',
            'In `electron-builder.yml`, set `nsis.include: build/installer.nsh`.',
            'Set `nsis.deleteAppDataOnUninstall: false` so nothing auto-deletes data.',
            'Define the `customUnInstall` macro as the uninstall-time hook.',
            'Add a temporary `MessageBox MB_OK` smoke test inside it.',
            'Rebuild, install, then uninstall and confirm the box appears.',
          ],
          code:
            '# electron-builder.yml — wire the custom NSIS script\n' +
            'nsis:\n' +
            '  oneClick: false\n' +
            '  perMachine: false\n' +
            '  allowToChangeInstallationDirectory: true\n' +
            '  include: build/installer.nsh\n' +
            '  deleteAppDataOnUninstall: false   # our macro alone decides data\'s fate\n' +
            '\n' +
            '; build/installer.nsh — smoke test the uninstall hook first\n' +
            '!macro customUnInstall\n' +
            '  MessageBox MB_OK \'Upralli Seva uninstall hook is running.\'\n' +
            '!macroend',
          pitfalls: [
            'Putting `installer.nsh` somewhere `nsis.include` does not point, so it is never compiled in.',
            'Leaving `deleteAppDataOnUninstall` at its default, letting electron-builder wipe data behind your macro.',
            'Expecting JavaScript syntax — NSIS is its own language with backslash line-continuations.',
            'Editing the macro but not rebuilding, then testing a stale uninstaller.',
            'Using `customInstall` (install hook) when you meant `customUnInstall` (uninstall hook).',
            'Shipping the debug `MessageBox MB_OK` in the real uninstaller.',
          ],
          tryIt:
            'Wire `installer.nsh` with the smoke-test box, set `deleteAppDataOnUninstall: false`, rebuild, install, then uninstall from Apps & features. When the box appears, you have the foundation for the real prompt.',
          takeaway:
            'electron-builder compiles `build/installer.nsh` via `nsis.include`, and its `customUnInstall` macro is the exact hook for the keep/delete prompt — pair it with `deleteAppDataOnUninstall: false` so only your code ever touches the committee\'s data.',
        },
        {
          id: 'm9-t12',
          title: 'The Bilingual Keep/Delete MessageBox',
          explain:
            'During uninstall, a Kannada+English Yes/No box asks the committee whether to keep their data or delete everything, defaulting safely to keep.',
          analogy:
            'Before the cleaner clears the strongroom, they hold up the register and ask the committee head in their own language: "ಇದನ್ನು ಇರಿಸಿಕೊಳ್ಳಬೇಕೆ? Keep this?" Asking in **both Kannada and English** means whoever is at the machine — an elder who reads only Kannada, or a younger volunteer — understands the question. And the safe answer is the default, so a nervous Enter keeps the records.',
          theory:
            'NSIS shows dialogs with **`MessageBox`**. The flag **`MB_YESNO|MB_ICONQUESTION`** gives two buttons and a question icon. Crucially, this app serves a Kannada-speaking coastal-Karnataka committee, so the prompt is **bilingual**: the Kannada question first, then the English, then a plain legend of what Yes and No mean. NSIS strings embed newlines as `$\\n`, so we stack the lines for readability.\n\nThe safest design choice is the **default**. We pass **`/SD IDYES`** so that in silent mode, or if the user just presses Enter, the answer is **Yes = keep**. We then branch with the label form: `IDYES keep_data` jumps to the keep label (do nothing destructive); falling through to the next line means the user chose No, and we run the deletion. Making "keep" both the default *and* the do-nothing path means every accidental or hurried interaction preserves the data.\n\nThe wording matters as much as the code: name the data plainly ("database + backups"), label the buttons in both scripts ("ಇರಿಸಿಕೊಳ್ಳಿ / Keep", "ಎಲ್ಲವನ್ನೂ ಅಳಿಸಿ / Delete everything"), and make destruction the deliberate exception, never the easy slip.',
          whyItMatters:
            'This dialog is the literal headline feature. A clear bilingual prompt with keep as the default puts a village committee in control of its own years of records, in a language they read, and prevents both accidental loss and unwanted leftover data.',
          steps: [
            'In `customUnInstall`, call `MessageBox MB_YESNO|MB_ICONQUESTION`.',
            'Write the question in Kannada first, then English, using `$\\n` line breaks.',
            'Add a plain legend: [Yes = ಇರಿಸಿಕೊಳ್ಳಿ / Keep] [No = ಅಳಿಸಿ / Delete everything].',
            'Pass `/SD IDYES` so silent/default answer is keep.',
            'Branch `IDYES keep_data`; fall-through (No) runs the delete.',
            'Rebuild and test that Enter and Yes both keep, while No reaches the delete path.',
          ],
          code:
            '; build/installer.nsh — bilingual keep/delete prompt\n' +
            '!macro customUnInstall\n' +
            '  MessageBox MB_YESNO|MB_ICONQUESTION \\\n' +
            '    "ನಿಮ್ಮ ದತ್ತಾಂಶವನ್ನು (database + backups) ಇರಿಸಿಕೊಳ್ಳಬೇಕೆ?$\\n$\\nKeep your data (database + backups)?$\\n$\\n[Yes = ಇರಿಸಿಕೊಳ್ಳಿ / Keep]    [No = ಎಲ್ಲವನ್ನೂ ಅಳಿಸಿ / Delete everything]" \\\n' +
            '    /SD IDYES IDYES keep_data\n' +
            '    ; --- falling through here means the user chose No = delete ---\n' +
            '    RMDir /r "$LOCALAPPDATA\\UpralliSeva"\n' +
            '  keep_data:\n' +
            '    ; Yes / default / silent -> do nothing, records survive\n' +
            '!macroend',
          pitfalls: [
            'Wording it so Yes deletes — keep "Yes = Keep" to match instinct and the `/SD IDYES` default.',
            'English-only text an elder committee member cannot read; lead with Kannada.',
            'Omitting `/SD IDYES`, so a silent uninstall has no safe default and may fall through to delete.',
            'Forgetting the `IDYES keep_data` jump, so the keep choice still runs the delete line.',
            'Using `\\n` (JS) instead of NSIS\'s `$\\n` for line breaks, producing one mashed line.',
            'No icon; `MB_ICONQUESTION` signals this is a real choice the committee should read carefully.',
          ],
          tryIt:
            'Build the bilingual box, uninstall, and try three answers across separate test installs: press Enter (keeps), click Keep (keeps), click Delete (removes %LOCALAPPDATA%\\UpralliSeva). Confirm only the explicit Delete destroys anything.',
          takeaway:
            'A bilingual `MB_YESNO|MB_ICONQUESTION` with `/SD IDYES` and `IDYES keep_data` asks the committee in Kannada and English, defaults to keep, and makes deletion the deliberate exception — this dialog is the heart of the module.',
        },
        {
          id: 'm9-t13',
          title: 'Why Data-Outside Makes Delete Clean',
          explain:
            'Because the data sits in %LOCALAPPDATA%\\UpralliSeva and never in the install folder, "keep" needs zero work and "delete" is one precise `RMDir`.',
          analogy:
            'Because the register was always kept in a separate strongroom, the cleaner clearing the office never has to pick through it. "Keep" means simply walking past the strongroom. "Delete" means one deliberate trip to that one room. The **separation of building and strongroom** is what makes both answers clean and unambiguous.',
          theory:
            'Section 2\'s placement decision pays off here. Because pgdata and backups live under **`$LOCALAPPDATA\\UpralliSeva`**, completely outside the install directory, the two uninstall paths become trivially clean.\n\n**Keep** requires *nothing*. The standard uninstaller removes the install folder, and since no data is in it, the committee\'s records simply remain. There is no folder to spare, no database service to leave running — the bundled Postgres only ever ran as a child process of the app, so once the app is gone its data just sits quietly in the strongroom.\n\n**Delete** is a single, well-targeted instruction: **`RMDir /r "$LOCALAPPDATA\\UpralliSeva"`** removes pgdata, backups, and `config.json` in one sweep. There is no separate database to drop, no service to stop, no second location to chase — because the bundled cluster wrote everything into that one folder. Contrast this with a system-installed Postgres, where "delete everything" would mean shelling out to `dropdb`, matching versions, and handling auth. Bundling the DB and placing its data in one external folder collapses the whole delete operation to one line. The design choice and the feature are two sides of the same coin.',
          whyItMatters:
            'A "delete everything" that misses a location is a broken promise; one that touches the wrong folder is a disaster. Keeping all data in one external folder makes delete both complete and safe in a single line — and makes keep genuinely free.',
          steps: [
            'Confirm pgdata, backups, and config.json all live under `$LOCALAPPDATA\\UpralliSeva`.',
            'Confirm no database files were ever written into the install folder.',
            'For keep: let the standard uninstaller finish; do nothing to the data folder.',
            'For delete: run exactly `RMDir /r "$LOCALAPPDATA\\UpralliSeva"`.',
            'Verify no leftover Postgres service exists (there is none — it was a child process).',
            'Test both: keep leaves the folder, delete removes it entirely.',
          ],
          code:
            '; The whole delete is ONE line because all data is in one external folder.\n' +
            '; (No dropdb, no service stop — bundled Postgres wrote only here.)\n' +
            '\n' +
            '  ; user chose No / delete:\n' +
            '  RMDir /r "$LOCALAPPDATA\\UpralliSeva"   ; pgdata + backups + config.json\n' +
            '\n' +
            '  keep_data:\n' +
            '  ; user chose Yes / default:\n' +
            '  ; nothing to do — install folder is removed by the standard uninstaller,\n' +
            '  ; and the strongroom ($LOCALAPPDATA\\UpralliSeva) is untouched.',
          pitfalls: [
            'Having ever written data into the install folder, so "keep" still loses something on uninstall.',
            'Splitting data across two folders, so one `RMDir` leaves half behind on delete.',
            'Assuming a Postgres Windows service must be stopped — there is none; it was a child process.',
            'Mistyping the folder so `RMDir` targets the wrong path (always quote and use `$LOCALAPPDATA`).',
            'Trying to `dropdb` as if Postgres were system-installed — unnecessary and error-prone here.',
            'Forgetting `/r`, so `RMDir` fails on the non-empty data folder.',
          ],
          tryIt:
            'After a delete-path uninstall, open Explorer to confirm `%LOCALAPPDATA%\\UpralliSeva` is gone entirely, and check Services to confirm no Postgres service lingers. The single-folder design means nothing is left behind.',
          takeaway:
            'Keeping all data in one external folder makes keep cost nothing and delete a single precise `RMDir /r "$LOCALAPPDATA\\UpralliSeva"` — bundling the DB collapses what would be a multi-step teardown into one safe line.',
        },
        {
          id: 'm9-t14',
          title: 'Resume After a Kept Uninstall',
          explain:
            'Because a kept uninstall leaves the data and first-run boot RESUMES, uninstalling and later reinstalling picks up exactly where the committee left off.',
          analogy:
            'A priest transferred away and later brought back finds the strongroom register exactly as it was and simply continues the next entry. **Keep + resume** is that continuity: the uninstall left the strongroom alone, and reinstalling reopens it and carries on — no re-setup, no lost years.',
          theory:
            'This topic ties section 2\'s resume logic to section 3\'s keep choice, because together they enable a genuinely lossless reinstall. When the committee uninstalls and chooses **keep**, `%LOCALAPPDATA%\\UpralliSeva` — pgdata, backups, config.json — survives untouched.\n\nLater, when they reinstall (a new version, a repaired machine, a fresh copy of the same installer), first-run boot does its **init-or-resume** check. It finds the **`PG_VERSION`** marker still present in the kept pgdata, so it **resumes** the existing cluster instead of initialising a fresh one. `migrate deploy` then applies only migrations newer than what the kept database already has — so a reinstall of a *newer* version even upgrades the schema in place — and seeding is skipped because the database is not empty. The window opens onto the committee\'s full history.\n\nThis is why the two features were designed as a pair. "Keep" without resume would leave orphaned data the new install ignores; resume without "keep" would have nothing to resume. Together they mean a kept uninstall is not goodbye — it is a pause, and reinstalling is simply pressing play.',
          whyItMatters:
            'A committee should never fear that uninstalling for a reinstall or an upgrade loses their records. Keep + resume guarantees continuity, making upgrades and machine moves safe and turning "uninstall" from a scary word into a routine one.',
          steps: [
            'Uninstall choosing keep; confirm `%LOCALAPPDATA%\\UpralliSeva` and `PG_VERSION` remain.',
            'Reinstall the same or a newer installer.',
            'On boot, confirm the resume branch runs (PG_VERSION present).',
            'Confirm `migrate deploy` applies only newer migrations, if any.',
            'Confirm seeding is skipped because the database is not empty.',
            'Verify the committee\'s prior years and Maganes are all present.',
          ],
          code:
            '// boot resume path — the kept data makes this seamless after reinstall\n' +
            'const marker = path.join(PGDATA, \'PG_VERSION\');\n' +
            'if (fs.existsSync(marker)) {\n' +
            '  boot(\'kept data found -> RESUME existing cluster\');\n' +
            '  await pg.start();                 // no initialise: years survive\n' +
            '  await runPrismaCli([\'migrate\', \'deploy\']); // only NEW migrations apply\n' +
            '  // isEmpty() is false -> no re-seed; committee history intact\n' +
            '} else {\n' +
            '  boot(\'no data -> fresh initialise\');\n' +
            '  await pg.initialise(); await pg.start();\n' +
            '}',
          pitfalls: [
            'Initialising unconditionally on reinstall, destroying the kept database you promised to keep.',
            'Re-seeding because you forgot the "is it empty?" guard, duplicating Maganes after reinstall.',
            'A reinstall pointing at a different data path, so it cannot find the kept pgdata.',
            'Shipping a migration that is not backward-safe, so resuming an older DB on a newer app breaks.',
            'Assuming keep + reinstall needs manual restore — resume is automatic when PG_VERSION is present.',
            'Letting `deleteAppDataOnUninstall` default to true, so "keep" never actually kept anything.',
          ],
          tryIt:
            'Install, add a year and a Magane, uninstall choosing Keep, then reinstall. Confirm the year and Magane are still there with no setup wizard — the kept data resumed automatically.',
          takeaway:
            'Keep + resume are a designed pair: a kept uninstall leaves `PG_VERSION` and the data intact, so reinstalling resumes the cluster and applies only new migrations — uninstall becomes a pause, and reinstall just presses play.',
        },
        {
          id: 'm9-t15',
          title: 'Ethics: Default to Keep, Make Delete Explicit',
          explain:
            'A committee\'s years of pooja and donor records must never be silently erased — the software defaults to keep and makes deletion a deliberate, informed act.',
          analogy:
            'No one burns a temple\'s register on a single careless nod. The committee asks again, names exactly what would be lost, and only then — fully aware — decides. **Defaulting to keep and making delete explicit** is that caution written into software: the records of a community\'s devotion are held in trust, not casually discarded.',
          theory:
            'The keep/delete prompt is as much an **ethics** decision as a technical one. This database holds a coastal-Karnataka village committee\'s **years of pooja entries and donor records** — household names, pooja participation, ₹ contributions, the institutional memory of a temple. Software has no right to destroy that on the user\'s behalf or by accident.\n\nThree principles encode the ethic. First, **default to keep**: `/SD IDYES`, `deleteAppDataOnUninstall: false`, and a keep-as-do-nothing path mean every default, silent, or hurried interaction preserves the data. Second, **make delete explicit and informed**: the prompt states plainly, in Kannada and English, that "database + backups" will be removed and labels the destructive button clearly — the committee must consciously choose "ಎಲ್ಲವನ್ನೂ ಅಳಿಸಿ / Delete everything". Third, **prefer preservation under uncertainty**: if anything is ambiguous (closed dialog, silent mode), keep.\n\nThis is what it means to build software *for a community*. The committee, not the developer and not a stray click, decides the fate of its own history — and the safe choice is always the one that requires no decision at all.',
          whyItMatters:
            'Silently deleting a committee\'s records would be a serious breach of trust and could erase irreplaceable history. Defaulting to keep and demanding a deliberate, bilingual confirmation to delete protects the temple from both human error and the software itself.',
          steps: [
            'Make keep the default everywhere: `/SD IDYES` and `deleteAppDataOnUninstall: false`.',
            'Make the keep path do nothing destructive at all.',
            'State plainly, in both languages, what delete removes (database + backups).',
            'Label the destructive button unambiguously ("Delete everything").',
            'On any ambiguity (closed box, silent run), fall back to keep.',
            'Document in the handover that uninstalling keeps data unless Delete is chosen.',
          ],
          code:
            '; The ethic, encoded: keep is the default AND the do-nothing path.\n' +
            '!macro customUnInstall\n' +
            '  MessageBox MB_YESNO|MB_ICONQUESTION \\\n' +
            '    "... ಇರಿಸಿಕೊಳ್ಳಬೇಕೆ? / Keep your data (database + backups)? ..." \\\n' +
            '    /SD IDYES IDYES keep_data        ; default / silent -> KEEP\n' +
            '    RMDir /r "$LOCALAPPDATA\\UpralliSeva" ; only an explicit No reaches here\n' +
            '  keep_data:\n' +
            '!macroend\n' +
            '; deleteAppDataOnUninstall: false ensures nothing else deletes data.',
          pitfalls: [
            'Defaulting to delete, so a hurried or silent uninstall erases years of records.',
            'Vague wording ("Remove data?") that hides that donor history is permanently lost.',
            'Deleting on a closed/cancelled dialog instead of treating ambiguity as keep.',
            'Hiding the destructive choice behind unclear or untranslated button labels.',
            'Letting `deleteAppDataOnUninstall: true` quietly override your careful prompt.',
            'Treating the committee\'s data as disposable test data rather than records held in trust.',
          ],
          tryIt:
            'Review your uninstall flow against one question: can the data be lost without someone deliberately, knowingly clicking Delete? If any path — silent, default, closed box — can destroy it, fix that path to keep. The answer must be no.',
          takeaway:
            'A community\'s records are held in trust: default to keep at every level, make deletion a deliberate, bilingual, informed act, and prefer preservation under any uncertainty — the ethics matter as much as the code.',
        },
      ],
    },
    {
      id: 'm9-s4',
      title: 'Capstone — Ship Upralli Seva',
      topics: [
        {
          id: 'm9-t16',
          title: 'End-to-End Checklist & Committee Handover',
          explain:
            'Run the whole app through one checklist from boot to uninstall, then write the committee a plain handover: where data lives, how to back up to USB, and how to restore on a new PC.',
          analogy:
            'Before the big festival, the head priest walks the entire procession route once — every station, every ritual, in order — so nothing surprises them on the day. The **end-to-end checklist** is that final walk-through of Upralli Seva, and the **handover guide** is the written order of service left behind so the committee can run everything without you.',
          theory:
            'Shipping means proving the **whole journey** works, then handing it over. The end-to-end checklist exercises every feature the course built, in order: **boot/resume** the bundled cluster; create and manage **Maganes** (the village wards); enter records in the **register grid** with the **Kannada popup**; set **rates** and see **₹ totals**; **clone a year** forward and **lock** a closed year; run **backups** and **restore**; export a **PDF**; build the **installer**; and finally **uninstall** through both the keep and delete paths. Walking this once on a clean machine is the difference between "the demo worked" and "the app ships".\n\nThe **handover** is equally important and aimed at non-developers. It states three things plainly: **where the data lives** (`%LOCALAPPDATA%\\UpralliSeva`, with pgdata and backups), **how to back up to a USB** (use the app\'s backup, then copy the backup file to the stick — or copy the whole folder while the app is closed), and **how to restore on a new PC** (install the app, then place the backup so first-run resume/import picks it up). Written in the committee\'s terms, this guide is what lets a temple far from any developer keep its records safe for years.\n\nFinally, point to **where next**: macOS/Linux targets if other machines appear, and the reserved **`billing`** module (invoices and receipts) the architecture already leaves room for — so the committee knows the app can grow with them.',
          whyItMatters:
            'A feature that works in isolation but breaks in the full flow is not shipped. And an app handed over without a plain guide will be abandoned the first time something goes wrong. The checklist proves it works; the handover keeps it working.',
          steps: [
            'Walk the full checklist on a clean machine: boot/resume → Maganes → register grid + Kannada popup.',
            'Continue: rates + ₹ totals → clone/lock year → backups/restore → PDF.',
            'Finish: build installer → install → uninstall keep, then uninstall delete.',
            'Write where data lives: `%LOCALAPPDATA%\\UpralliSeva` (pgdata + backups).',
            'Write USB backup steps: run the in-app backup, then copy the file to the stick.',
            'Write restore-on-new-PC steps and note where-next (macOS/Linux, the reserved billing module).',
          ],
          code:
            '; Upralli Seva — ship checklist (run on a clean machine, top to bottom)\n' +
            '; [ ] Boot: bundled Postgres starts; first run initialises, relaunch RESUMES\n' +
            '; [ ] Maganes: add / edit / list village wards\n' +
            '; [ ] Register grid + Kannada popup: enter a donor row in Kannada\n' +
            '; [ ] Rates + INR totals: set seva rates, totals compute correctly\n' +
            '; [ ] Year: clone last year forward; lock a closed year\n' +
            '; [ ] Backup / restore: write a backup, restore it cleanly\n' +
            '; [ ] PDF: export a year\'s register\n' +
            '; [ ] Installer: npm run dist -> ~131-137 MB Setup.exe\n' +
            '; [ ] Uninstall KEEP: data in %LOCALAPPDATA%\\UpralliSeva survives + resumes\n' +
            '; [ ] Uninstall DELETE: bilingual prompt -> RMDir /r removes everything\n' +
            ';\n' +
            '; Handover (committee):\n' +
            ';   Data  -> %LOCALAPPDATA%\\UpralliSeva  (pgdata + backups)\n' +
            ';   USB   -> in-app Backup, then copy the backup file to the USB stick\n' +
            ';   NewPC -> install app, place backup, first run resumes/imports it\n' +
            ';   Next  -> macOS/Linux targets; the reserved billing module',
          pitfalls: [
            'Testing features individually but never the full top-to-bottom flow on a clean machine.',
            'Skipping the uninstall paths in the checklist — the riskiest, least-tested part.',
            'A handover written in developer jargon a committee member cannot follow.',
            'Documenting only the data path but not the actual USB backup and restore steps.',
            'Copying the pgdata folder while the app (and its Postgres) is still running, risking corruption.',
            'Never testing restore on a genuinely fresh PC, so the recovery path is unproven.',
          ],
          tryIt:
            'On a clean VM, run the entire checklist start to finish without skipping a line, then hand your written guide to someone non-technical and watch them back up to a USB using only your words. Fix anything they stumble on.',
          takeaway:
            'Shipping is proving the whole journey — boot/resume through both uninstall paths — and leaving a plain-language handover covering data location, USB backup, and restore on a new PC, so the committee can run Upralli Seva for years without you.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm9-p1',
      type: 'Build',
      title: 'Package the Bundled-DB Installer',
      domain: 'Electron packaging / Prisma + embedded-postgres',
      duration: '5-7 hours',
      description:
        'Configure electron-builder to wrap Upralli Seva into a single Windows installer that bundles both PostgreSQL (via embedded-postgres) and the Prisma engine. Survive the real packaging traps — pruning, the `.prisma` dotfolder, asar — and produce a working `.exe` that installs and runs its own database on a clean machine.',
      tools: ['electron-vite', 'electron-builder (NSIS)', 'Prisma 5', 'embedded-postgres', 'Node fs (afterPack)'],
      blueprint: {
        overview:
          'You have a working dev app; now make it shippable. The goal is one named `Setup.exe` that, on a machine with no PostgreSQL installed, raises its own bundled database and opens the register. Getting there means winning the Prisma packaging saga and the asar fight, then adding an afterPack hook and extraResources.',
        functionalRequirements: [
          'A complete `electron-builder.yml` with appId, productName, NSIS target, and the named artifact.',
          'Prisma packaged correctly: `prisma`, `@prisma/client`, and `embedded-postgres` in `dependencies`.',
          '`asar: false` plus an `afterPack` hook copying `node_modules/.prisma` into `resources/app/node_modules/.prisma`.',
          '`extraResources` carrying the Prisma `schema.prisma` + `migrations/**/*` and the Noto Kannada font.',
          'A built `Setup.exe` (~131-137 MB) that installs and starts its bundled Postgres on a clean machine.',
        ],
        technicalImplementation: [
          'Write `electron-builder.yml` with identity, `win.target: [nsis]`, `asar: false`, and `afterPack: scripts/after-pack.cjs`.',
          'Move `prisma` to `dependencies`; add a `dist` script running `electron-vite build && prisma generate && electron-builder`.',
          'Implement `scripts/after-pack.cjs` to `fs.cpSync` the generated `.prisma` into `context.appOutDir/resources/app/node_modules/.prisma`.',
          'Add `extraResources` entries for `resources/fonts -> fonts` and the filtered `prisma -> prisma` copy.',
          'Build, then install on a clean VM and confirm the bundled cluster starts with no system Postgres present.',
        ],
        prompts: [
          {
            step: 1,
            label: 'electron-builder.yml + dependency split',
            outcome: 'A valid config and a package.json whose deps survive pruning.',
            prompt:
              'Write a complete electron-builder.yml for an Electron + electron-vite + TypeScript app named "Upralli Seva" (appId com.upralliseva.desktop) targeting Windows NSIS with artifactName "${productName}-Setup-${version}.${ext}", asar:false, and afterPack scripts/after-pack.cjs. Then show the package.json dependencies/scripts changes needed so Prisma and embedded-postgres survive electron-builder pruning: move `prisma` to dependencies, keep @prisma/client and embedded-postgres there, and add a dist script. Explain each choice in one line.',
          },
          {
            step: 2,
            label: 'afterPack hook to rescue .prisma',
            outcome: 'A .cjs hook that copies the generated client into the packed app.',
            prompt:
              'Write scripts/after-pack.cjs (CommonJS) exporting a default async afterPack(context) that copies node_modules/.prisma from the project root into context.appOutDir/resources/app/node_modules/.prisma using fs.cpSync recursive, throwing a clear error if the source .prisma is missing so the build fails loudly rather than shipping a broken app. Explain why this hook is necessary given that electron-builder pruning drops the .prisma dotfolder and a files glob cannot rescue it.',
          },
          {
            step: 3,
            label: 'extraResources + clean-machine verify',
            outcome: 'Schema, migrations, and font bundled; install verified.',
            prompt:
              'Add extraResources to my electron-builder.yml that (a) copies resources/fonts to fonts and (b) copies the prisma folder to prisma filtered to schema.prisma and migrations/**/*. Then give me a step-by-step plan to verify on a clean Windows VM (no PostgreSQL installed) that the built ~131-137 MB Setup.exe installs and starts its bundled embedded-postgres cluster, including which folders under resources/ to inspect to confirm .prisma, prisma/migrations, and fonts all landed.',
          },
        ],
      },
    },
    {
      id: 'm9-p2',
      type: 'Build',
      title: 'Keep/Delete-Data Uninstall Hook',
      domain: 'NSIS custom uninstall / data safety',
      duration: '3-5 hours',
      description:
        'Add a `build/installer.nsh` with a bilingual Kannada+English `customUnInstall` MessageBox that defaults to keep and deletes `%LOCALAPPDATA%\\UpralliSeva` only when the committee explicitly chooses No. Then verify that a kept uninstall plus reinstall resumes the database exactly where it left off.',
      tools: ['electron-builder NSIS', 'installer.nsh (NSIS script)', 'embedded-postgres (PG_VERSION resume)', 'Windows VM + snapshots'],
      blueprint: {
        overview:
          'This is the headline feature. You will wire a custom NSIS uninstall hook through electron-builder, write a clear bilingual keep-or-delete prompt with keep as the safe default, and prove the keep + resume pairing works: uninstall keeping data, reinstall, and watch the committee\'s records come straight back.',
        functionalRequirements: [
          '`nsis.include: build/installer.nsh` and `deleteAppDataOnUninstall: false` in electron-builder.yml.',
          'A `customUnInstall` macro with a bilingual MB_YESNO|MB_ICONQUESTION prompt.',
          '`/SD IDYES` default and `IDYES keep_data` so keep is the default and do-nothing path.',
          'On No, exactly `RMDir /r "$LOCALAPPDATA\\UpralliSeva"` removing pgdata + backups + config.json.',
          'Verified keep + resume: a kept uninstall then reinstall resumes via the PG_VERSION marker.',
        ],
        technicalImplementation: [
          'Set the nsis block (oneClick:false, perMachine:false, include, deleteAppDataOnUninstall:false).',
          'Author build/installer.nsh with the bilingual MessageBox using $\\n line breaks and the keep_data label.',
          'Ensure first-run boot checks PG_VERSION to resume rather than re-initialise kept data.',
          'On a VM, snapshot clean, install, add data, uninstall keeping, reinstall, and confirm resume.',
          'On a fresh snapshot, uninstall choosing delete and confirm %LOCALAPPDATA%\\UpralliSeva is gone.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Bilingual installer.nsh',
            outcome: 'A customUnInstall macro asking keep/delete in Kannada + English.',
            prompt:
              'Write build/installer.nsh defining a customUnInstall macro that shows a MessageBox MB_YESNO|MB_ICONQUESTION asking in Kannada first then English whether to keep the user\'s data (database + backups), with a legend [Yes = Keep] [No = Delete everything] in both scripts, using $\\n for line breaks. Pass /SD IDYES and IDYES keep_data so the default and silent answer is keep; on the fall-through (No) run RMDir /r "$LOCALAPPDATA\\UpralliSeva". Add the keep_data: label. Explain why keep must be both the default and the do-nothing path.',
          },
          {
            step: 2,
            label: 'Wire it + non-destructive default',
            outcome: 'electron-builder.yml nsis block that only this macro can delete data.',
            prompt:
              'Show the nsis block for electron-builder.yml that wires my build/installer.nsh via include, with oneClick:false, perMachine:false, allowToChangeInstallationDirectory:true, and deleteAppDataOnUninstall:false. Explain how deleteAppDataOnUninstall:false plus data living outside the install dir (in %LOCALAPPDATA%\\UpralliSeva) guarantees a normal uninstall is non-destructive, so my macro is the only thing that can ever remove the committee\'s data.',
          },
          {
            step: 3,
            label: 'Verify keep + resume',
            outcome: 'A test plan proving a kept uninstall resumes after reinstall.',
            prompt:
              'Give me a Windows-VM test plan (with snapshots) to verify the keep/resume pairing for Upralli Seva: install, add a year and a Magane, uninstall choosing Keep, confirm %LOCALAPPDATA%\\UpralliSeva and its PG_VERSION marker survive, then reinstall and confirm first-run boot RESUMES the cluster (no re-initialise, no re-seed) and the year and Magane are still present. Also include the separate delete-path check confirming RMDir removes everything. Tell me exactly what to inspect at each step.',
          },
        ],
      },
    },
    {
      id: 'm9-p3',
      type: 'Capstone',
      title: 'Ship Upralli Seva',
      domain: 'End-to-end offline desktop app delivery',
      duration: '8-10 hours',
      description:
        'Assemble the complete Upralli Seva app, run the full end-to-end checklist from boot/resume through both uninstall paths, build the final installer, and write the committee handover guide covering data location, USB backup, and restore on a new PC.',
      tools: ['electron-vite', 'React + TypeScript', 'Prisma 5 + embedded-postgres', 'electron-builder NSIS', 'Windows VM'],
      blueprint: {
        overview:
          'The capstone brings every module together into a shippable product. You will verify the whole journey on a clean machine, produce the final ~131-137 MB installer with the bundled DB and the keep/delete uninstall prompt, and hand the committee a plain-language guide so a temple far from any developer can run and protect its register for years.',
        functionalRequirements: [
          'The full feature flow works end to end: boot/resume → Maganes → register grid + Kannada popup → rates + ₹ totals → clone/lock year → backups/restore → PDF.',
          'A final installer that bundles Postgres + Prisma engine and includes the bilingual uninstall prompt.',
          'Both uninstall paths verified: keep (data + resume survive) and delete (everything removed).',
          'A committee handover guide stating where data lives, how to back up to USB, and how to restore on a new PC.',
          'A clean-machine run proving install, use, upgrade, and uninstall all behave correctly.',
        ],
        technicalImplementation: [
          'Integrate all modules and run the top-to-bottom checklist on a clean VM, fixing any full-flow gaps.',
          'Build the final installer (electron-vite build + prisma generate + electron-builder) and confirm size and naming.',
          'Exercise keep and delete uninstall paths from snapshots, verifying resume after a kept uninstall.',
          'Write the handover guide in committee-friendly language with the data path, USB backup, and restore steps.',
          'Do a final dry-run: hand the guide to a non-technical tester and have them back up and restore unaided.',
        ],
        prompts: [
          {
            step: 1,
            label: 'End-to-end checklist run',
            outcome: 'A verified top-to-bottom pass of every feature on a clean machine.',
            prompt:
              'Produce a precise end-to-end test checklist for shipping Upralli Seva on a clean Windows VM, covering in order: bundled-Postgres boot and RESUME, Maganes CRUD, the register grid with the Kannada entry popup, seva rates with INR totals, clone-year-forward and lock-year, backup and restore, PDF export, building the installer, and both uninstall paths (keep then delete). For each line give the exact action and the exact expected result so a non-developer could run it.',
          },
          {
            step: 2,
            label: 'Final installer build',
            outcome: 'The shippable ~131-137 MB Setup.exe with bundled DB and uninstall prompt.',
            prompt:
              'Walk me through building the final Upralli Seva installer: the exact dist command (electron-vite build + prisma generate + electron-builder), what to confirm in the electron-builder output (asar:false, afterPack ran, extraResources copied, NSIS include compiled), the expected artifact name and ~131-137 MB size, and a final smoke test on a clean machine confirming the bundled database starts and the bilingual uninstall prompt appears. List the common failure signatures and their fixes.',
          },
          {
            step: 3,
            label: 'Committee handover guide',
            outcome: 'A plain-language guide for data, USB backup, and new-PC restore.',
            prompt:
              'Write a committee handover guide for Upralli Seva in simple, non-technical language (committee/temple framing). Cover: where the data lives (%LOCALAPPDATA%\\UpralliSeva, pgdata + backups) and that uninstalling keeps it unless they choose Delete; how to back up to a USB stick (use the in-app backup, then copy the backup file to the stick); how to restore on a new PC (install the app, place the backup, let first-run resume/import); and a short where-next note (macOS/Linux targets, the reserved billing module). Keep each procedure to numbered steps a village committee member can follow without a developer.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm9-q1',
      q: 'Why must `prisma` (the CLI) be moved into `dependencies` rather than left in `devDependencies` for this app?',
      options: [
        'electron-builder pruning drops devDependencies, but the app runs `prisma migrate deploy` at runtime on the user\'s machine, so the CLI must ship',
        'Prisma refuses to generate a client unless it is a production dependency',
        'devDependencies are slower to load at runtime',
        'It makes the installer smaller',
      ],
      answer: 0,
    },
    {
      id: 'm9-q2',
      q: 'Why is `asar: false` used for Upralli Seva?',
      options: [
        'asar is deprecated in recent electron-builder versions',
        'Prisma\'s native query engine and embedded-postgres\'s server binaries must spawn from real disk paths, which asar\'s virtual filesystem fights',
        'asar would make the installer larger',
        'React cannot be served from inside an asar archive',
      ],
      answer: 1,
    },
    {
      id: 'm9-q3',
      q: 'What is the specific job of the `afterPack` hook (scripts/after-pack.cjs) in this build?',
      options: [
        'It signs the installer with a code-signing certificate',
        'It starts the bundled Postgres cluster to test it',
        'It copies the pruned-away `node_modules/.prisma` into `resources/app/node_modules/.prisma`',
        'It compiles the NSIS uninstall script',
      ],
      answer: 2,
    },
    {
      id: 'm9-q4',
      q: 'Why do pgdata and backups live under %LOCALAPPDATA%\\UpralliSeva, outside the install folder?',
      options: [
        'Because Program Files loads faster from that location',
        'Because Prisma requires its database in LOCALAPPDATA',
        'Because embedded-postgres cannot write anywhere else on Windows',
        'So a normal uninstall never touches the data, making the keep/delete prompt a real choice and enabling resume after a kept uninstall',
      ],
      answer: 3,
    },
    {
      id: 'm9-q5',
      q: 'In the bilingual uninstall MessageBox, what does `/SD IDYES` combined with `IDYES keep_data` ensure?',
      options: [
        'That a silent or default (Enter) answer keeps the data, making preservation the safe default',
        'That the data is always deleted automatically',
        'That the prompt is shown only in silent installs',
        'That the uninstaller requires administrator rights',
      ],
      answer: 0,
    },
    {
      id: 'm9-q6',
      q: 'After a kept uninstall, why does reinstalling pick up exactly where the committee left off?',
      options: [
        'electron-builder stores a copy of the database inside the installer',
        'The kept pgdata still contains the PG_VERSION marker, so first-run boot RESUMES the cluster and migrate deploy applies only new migrations',
        'Windows automatically restores deleted application data',
        'The app re-seeds the same data from the bundled migrations every time',
      ],
      answer: 1,
    },
  ],
};
