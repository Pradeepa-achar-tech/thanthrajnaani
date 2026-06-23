// Module 9 — Packaging, Installer & the Uninstall Data Prompt (Capstone)
// Course: building "Maranakatte Seva" — an OFFLINE desktop app
// (Electron + React + Vite + LOCAL PostgreSQL via `pg`) for counter staff at
// Shri Brahmalingeshwara Temple, Maranakatte. This module turns the app into a
// real installable Windows program and adds the headline feature: an uninstall
// prompt that asks the user to KEEP or DELETE the temple's seva data.

export const m9 = {
  id: 'm9',
  title: 'Packaging, Installer & the Uninstall Data Prompt',
  hours: 9,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'Take the finished Maranakatte Seva app and ship it as a real Windows program. Configure electron-builder, produce an NSIS `.exe` installer with the temple icon and name, handle first run and the local PostgreSQL dependency, and build the standout feature — an uninstall prompt that asks the operator to keep or delete the seva data. Finish with an end-to-end checklist and a handover guide for temple staff.',
  sections: [
    {
      id: 'm9-s1',
      title: 'Packaging with electron-builder',
      topics: [
        {
          id: 'm9-t1',
          title: 'What electron-builder Does',
          explain:
            'electron-builder takes your loose folder of code and turns it into one installable Windows program that staff can double-click to set up.',
          analogy:
            'Right now your app is like the temple kitchen mid-cook: pots of code, a bowl of `node_modules`, the React build cooling on the counter. **electron-builder** is the cook who plates everything onto one banana leaf — Electron runtime, your main process, the renderer build — wraps it, and hands the counter staff a single neat package they can carry home and serve.',
          theory:
            'Your project during development is many separate pieces: the **Electron runtime** (the Chromium + Node engine), your **main process** code, the **renderer** (the React app Vite builds into `dist/`), and a pile of `node_modules`. None of that is something a temple clerk can install.\n\n**electron-builder** is a tool that bundles all of those into a single distributable. For Windows it most commonly produces an **NSIS installer** — a `Setup.exe` the user double-clicks. It copies the right Electron binaries, your compiled code, and your packaged dependencies into one program, then wraps it with an installer that creates Start-menu shortcuts and an uninstall entry.\n\nYou configure it once (in `package.json` or a separate config file) and run it with a single command. It is the standard, batteries-included way to ship an Electron app, and crucially for us it supports **custom NSIS scripting** — which is exactly how we will later add the keep-or-delete-data prompt.',
          whyItMatters:
            'Temple staff are not developers. They cannot run `npm install` or `npm run dev`. A real installer is the difference between an app that lives only on your machine and one the counter can actually use every Rangapooje evening.',
          steps: [
            'Install it as a dev dependency: `npm install --save-dev electron-builder`.',
            'Make sure your renderer build exists — `npm run build` should produce a `dist/` from Vite.',
            'Add a `build` block (config) to `package.json` (covered in the next topic).',
            'Add a script like `"dist": "electron-builder"` to `package.json` scripts.',
            'Run `npm run dist` and watch it create a `release/` (or `dist_electron/`) folder with the `Setup.exe`.',
            'Double-click the produced installer on a test machine to confirm it installs and launches.',
          ],
          code:
            '// package.json (excerpt)\n' +
            '{\n' +
            '  \'name\': \'maranakatte-seva\',\n' +
            '  \'version\': \'1.0.0\',\n' +
            '  \'main\': \'main/index.js\',\n' +
            '  \'scripts\': {\n' +
            '    \'build\': \'vite build\',\n' +
            '    \'dist\': \'npm run build && electron-builder\'\n' +
            '  },\n' +
            '  \'devDependencies\': {\n' +
            '    \'electron\': \'^31.0.0\',\n' +
            '    \'electron-builder\': \'^24.13.3\',\n' +
            '    \'vite\': \'^5.0.0\'\n' +
            '  }\n' +
            '}',
          pitfalls: [
            'Running `electron-builder` without first running `vite build`, so the installer ships an empty or stale renderer.',
            'Forgetting to set `main` in `package.json` to your real main-process entry file — the app opens to a blank window.',
            'Confusing `electron-builder` with `electron-packager`; this course uses electron-builder for its NSIS scripting support.',
            'Expecting it to also bundle PostgreSQL — it does not; the local DB is a separate dependency (covered later).',
            'Installing electron-builder as a normal dependency instead of `devDependency`, bloating the shipped app.',
            'Building on a path with spaces or non-ASCII characters, which sometimes breaks the NSIS step on Windows.',
          ],
          tryIt:
            'Run `npm install --save-dev electron-builder`, add a `dist` script, and run it once. Even before you configure anything, note where it puts the output and open that folder.',
          takeaway:
            'electron-builder is the cook that plates your scattered code into one installable Windows program — and its NSIS support is what makes the later uninstall prompt possible.',
        },
        {
          id: 'm9-t2',
          title: 'App Identity: appId, productName, version, icons',
          explain:
            'Give your program a proper name, a unique id, a version number, and the temple icon so Windows treats it as a real, recognisable application.',
          analogy:
            'A seva receipt without the temple name, date, and a stamp is just a slip of paper. **App identity** is that letterhead and stamp for your program: the name Windows shows in the Start menu (`productName`), the unique seal that distinguishes it from every other app (`appId`), the edition number (`version`), and the deity image on the shortcut (`icon`).',
          theory:
            'In the `build` block you declare who your app is. **`appId`** is a globally unique identifier in reverse-domain form, e.g. `org.maranakatte.seva`. Windows uses it to group your app, its shortcuts, and its uninstall entry; two apps must never share an appId.\n\n**`productName`** is the friendly display name — "Maranakatte Seva" — shown on shortcuts, in the installer title, and in Add/Remove Programs. **`version`** comes from the top-level `version` in `package.json` (semantic versioning like `1.0.0`); bump it for every release so users and you can tell builds apart.\n\n**Icons** make it look real. On Windows you supply an **`.ico`** file (ideally multi-resolution: 16, 32, 48, 256 px). electron-builder reads `build/icon.ico` by default, or you point `nsis.installerIcon` / `win.icon` at your file. A clear temple icon turns a generic grey box into something staff recognise on the desktop.',
          whyItMatters:
            'A unique `appId` keeps installs and uninstalls clean (and is what our uninstall prompt hooks into). A real name and icon build trust — staff are far less wary double-clicking "Maranakatte Seva" with the temple emblem than "electron.exe".',
          steps: [
            'Set a unique `appId` like `org.maranakatte.seva` in the `build` block.',
            'Set `productName` to "Maranakatte Seva".',
            'Keep the top-level `version` in `package.json` accurate (start at `1.0.0`).',
            'Create a multi-resolution `build/icon.ico` (use an online PNG-to-ICO tool with a temple image).',
            'Point `win.icon` / `nsis.installerIcon` at the `.ico` if it is not in the default location.',
            'Rebuild and check the shortcut, installer title bar, and Add/Remove Programs entry all show the right name and icon.',
          ],
          code:
            '// package.json -> "build" block\n' +
            '\'build\': {\n' +
            '  \'appId\': \'org.maranakatte.seva\',\n' +
            '  \'productName\': \'Maranakatte Seva\',\n' +
            '  \'directories\': { \'output\': \'release\' },\n' +
            '  \'win\': {\n' +
            '    \'icon\': \'build/icon.ico\',\n' +
            '    \'target\': [\'nsis\']\n' +
            '  },\n' +
            '  \'nsis\': {\n' +
            '    \'installerIcon\': \'build/icon.ico\',\n' +
            '    \'uninstallerIcon\': \'build/icon.ico\'\n' +
            '  }\n' +
            '}',
          pitfalls: [
            'Reusing an `appId` copied from a tutorial — clashes confuse Windows install/uninstall tracking.',
            'Supplying a PNG where Windows needs an `.ico`; the icon silently falls back to the default Electron one.',
            'A single-size icon that looks fuzzy at large sizes; include multiple resolutions in the `.ico`.',
            'Forgetting to bump `version` between releases, so two different builds look identical to users.',
            'Spaces or odd characters in `productName` that you then forget to quote in NSIS scripts later.',
            'Changing `appId` after release — the new version installs alongside the old one instead of upgrading it.',
          ],
          tryIt:
            'Make a temple `build/icon.ico`, set `appId` and `productName`, rebuild, and find your app in Windows "Apps & features". Confirm the name and icon look right.',
          takeaway:
            'appId, productName, version, and an .ico are your program\'s letterhead — they make it unique, recognisable, and trustworthy, and the appId anchors the later uninstall logic.',
        },
        {
          id: 'm9-t3',
          title: 'Choosing Targets: NSIS, Portable, MSI',
          explain:
            'Decide what kind of installer to produce — for this app a Windows NSIS installer is the right default.',
          analogy:
            'You can hand a devotee their prasada in different ways: a proper packet they take home and unwrap (an **NSIS installer**), a single piece they eat on the spot with no wrapping (a **portable exe**), or the temple-managed bulk distribution for big events (an **MSI** for IT-managed deployment). For a single temple counter, the take-home packet — NSIS — fits best.',
          theory:
            'electron-builder supports several Windows **targets**. **NSIS** produces a classic `Setup.exe` installer: it copies files into Program Files (or per-user), creates shortcuts, registers an uninstaller, and — critically for us — lets you inject **custom uninstall scripting**. This is our main target.\n\n**Portable** produces a single `.exe` that runs without installing — handy for a quick demo on a borrowed machine, but it leaves no clean uninstall entry and no place to hook our keep-or-delete prompt. **MSI** is the Microsoft Installer format, useful when an IT department deploys software across many machines via group policy; it is heavier and overkill for one temple counter.\n\nYou choose with the `win.target` array. For Maranakatte Seva we ship **NSIS** because (a) staff get a normal install/uninstall experience, and (b) only NSIS gives us the custom uninstall page where the keep-or-delete-data question lives.',
          whyItMatters:
            'The whole headline feature of this module — the uninstall data prompt — depends on NSIS custom scripting. Picking the right target now is what makes that feature possible at all.',
          steps: [
            'Set `win.target` to `[\'nsis\']` for the main installer.',
            'Optionally add `\'portable\'` to the array if you want a no-install demo exe too.',
            'Leave MSI out unless a temple IT team explicitly needs managed deployment.',
            'In the `nsis` block decide `oneClick` (silent) vs an assisted installer with pages.',
            'Set `perMachine` thoughtfully: per-user installs avoid admin prompts; per-machine needs admin.',
            'Rebuild and confirm only the targets you want appear in the `release/` folder.',
          ],
          code:
            '\'win\': {\n' +
            '  \'icon\': \'build/icon.ico\',\n' +
            '  \'target\': [\n' +
            '    { \'target\': \'nsis\', \'arch\': [\'x64\'] }\n' +
            '  ]\n' +
            '},\n' +
            '\'nsis\': {\n' +
            '  \'oneClick\': false,\n' +
            '  \'perMachine\': false,\n' +
            '  \'allowToChangeInstallationDirectory\': true,\n' +
            '  \'createDesktopShortcut\': true,\n' +
            '  \'createStartMenuShortcut\': true\n' +
            '}',
          pitfalls: [
            'Choosing `portable` as the only target, then discovering you cannot add the uninstall prompt.',
            'Setting `oneClick: true` (silent install) when you actually want the user to see and choose options.',
            'Forcing `perMachine: true`, which triggers a UAC admin prompt the counter clerk may not be able to clear.',
            'Building only `ia32` (32-bit) on a modern 64-bit Windows, or vice versa; target `x64` for typical machines.',
            'Adding MSI "just in case", doubling build time and output size for no benefit.',
            'Forgetting that `allowToChangeInstallationDirectory` only works when `oneClick` is `false`.',
          ],
          tryIt:
            'Set the target to NSIS with `oneClick: false`, rebuild, and run the installer. Notice the welcome page and the option to choose an install folder — that page model is where our custom prompt will eventually live.',
          takeaway:
            'For a single temple counter, NSIS is the right target: a clean install/uninstall experience and — uniquely — the custom uninstall scripting our headline feature needs.',
        },
        {
          id: 'm9-t4',
          title: 'Building the Installer: npm run + electron-builder',
          explain:
            'Wire up the build commands so one `npm run dist` produces the finished installer end to end.',
          analogy:
            'On a festival day the kitchen runs a fixed sequence: wash rice, cook, then plate. **Your build pipeline** is that sequence written down once — `vite build` cooks the renderer, then `electron-builder` plates everything into the installer — so any volunteer (or future you) can run the whole thing with one command instead of remembering each step.',
          theory:
            'A reliable build is a **scripted pipeline**, not a set of steps you remember. The renderer must be built first: `vite build` compiles your React app into static files in `dist/`. Then `electron-builder` reads your `build` config, gathers the Electron runtime + main process + that `dist/`, and emits the installer.\n\nYou chain these in `package.json` scripts so the order is enforced. A single `npm run dist` does both. electron-builder also reads environment hints — on a CI machine you might set signing variables — but for a local offline app you usually just run it on your dev machine.\n\nThe output lands in your configured `directories.output` (we set `release/`). Inside you will find the `Setup.exe`, plus auxiliary files (a `latest.yml`, blockmaps) used for updates — which, for an offline app, you can ignore. The goal: one command, one trustworthy installer, every time.',
          whyItMatters:
            'A one-command build removes human error. When you ship version 1.1 next year, you will not have forgotten a step — and a repeatable build is the foundation for the testable uninstall paths later in this module.',
          steps: [
            'Add `"build": "vite build"` to `package.json` scripts.',
            'Add `"dist": "npm run build && electron-builder"` so building the renderer always precedes packaging.',
            'Run `npm run dist` from a clean terminal.',
            'Read the electron-builder log to confirm it picked up your icon, appId, and NSIS target.',
            'Open `release/` and locate the produced `Maranakatte Seva Setup 1.0.0.exe`.',
            'Copy that single `.exe` to a clean test machine and install it.',
          ],
          code:
            '// One command builds everything:\n' +
            '//   npm run dist\n' +
            '//\n' +
            '// package.json scripts\n' +
            '\'scripts\': {\n' +
            '  \'dev\': \'vite\',\n' +
            '  \'build\': \'vite build\',\n' +
            '  \'dist\': \'npm run build && electron-builder --win\'\n' +
            '}\n' +
            '\n' +
            '// Resulting output (release/):\n' +
            '//   Maranakatte Seva Setup 1.0.0.exe   <- give this to the temple\n' +
            '//   latest.yml, *.blockmap             <- update metadata (ignore for offline)',
          pitfalls: [
            'Forgetting the `&&` so `electron-builder` runs against a stale or missing `dist/`.',
            'Running the build with the app still open or a dev server running, locking files.',
            'Antivirus quarantining the freshly built `Setup.exe` — whitelist your output folder during testing.',
            'Shipping the whole `release/` folder when the temple only needs the single `Setup.exe`.',
            'Ignoring electron-builder warnings about missing icons or unset `appId`.',
            'Assuming a successful build means a working app — always install and launch on a clean machine.',
          ],
          tryIt:
            'Run `npm run dist`, then deliberately delete `dist/` and run only `electron-builder` to see it package an empty renderer. That broken result shows exactly why the chained command matters.',
          takeaway:
            'One scripted command — `npm run dist` — builds the renderer then packages the installer, giving you a repeatable, error-free way to produce the temple\'s `Setup.exe` every release.',
        },
        {
          id: 'm9-t5',
          title: 'Bundling the App: files & extraResources',
          explain:
            'Tell electron-builder exactly which files belong inside the installer so the app works but stays a sane size.',
          analogy:
            'When you pack for a pilgrimage you take the clothes you will wear, not the whole wardrobe. **`files`** is your packing list — the code the app actually runs — while everything else (dev tools, source maps, the giant `node_modules` you only needed to build) stays home. **`extraResources`** is the separate bag of items you need with you but not stitched into the app — like a seed SQL script or a printable template.',
          theory:
            'By default electron-builder is generous, and your installer can balloon. The **`files`** glob array controls what gets packed into the app bundle (an `app.asar` archive). You typically include your built `dist/`, your `main/` and `preload/` code, and `package.json`, while excluding source maps, tests, and dev-only folders.\n\nProduction dependencies in `node_modules` (like `pg`) are included automatically based on `package.json` `dependencies`; `devDependencies` are not. Keeping the dev/prod split correct is the single biggest lever on app size.\n\n**`extraResources`** copies files alongside the app — into the `resources/` folder next to the executable — without packing them into the asar. Use it for things the app reads at runtime as plain files: a `schema.sql` to initialise the DB, a receipt template, or seed data for the seva catalog. From the main process you reach them via `process.resourcesPath`.',
          whyItMatters:
            'A bloated installer is slow to copy onto a temple machine and wastes disk. More importantly, getting `files` and `extraResources` right is how your first-run DB initialisation (next section) actually finds its `schema.sql`.',
          steps: [
            'List only what the app runs in `files`: `dist/`, `main/`, `preload/`, `package.json`.',
            'Exclude heavy or dev-only paths with negative globs (e.g. `!**/*.map`).',
            'Keep `pg` in `dependencies` (not `devDependencies`) so it ships.',
            'Put runtime data files (`schema.sql`, seed catalog) under `extraResources`.',
            'In main-process code, build paths from `process.resourcesPath` for those extra files.',
            'Rebuild and check the installer size; open `resources/` to confirm extras landed there.',
          ],
          code:
            '\'build\': {\n' +
            '  \'files\': [\n' +
            '    \'dist/**/*\',\n' +
            '    \'main/**/*\',\n' +
            '    \'preload/**/*\',\n' +
            '    \'package.json\',\n' +
            '    \'!**/*.map\',\n' +
            '    \'!**/test/**\'\n' +
            '  ],\n' +
            '  \'extraResources\': [\n' +
            '    { \'from\': \'db/schema.sql\', \'to\': \'schema.sql\' },\n' +
            '    { \'from\': \'db/seed-catalog.sql\', \'to\': \'seed-catalog.sql\' }\n' +
            '  ]\n' +
            '}\n' +
            '\n' +
            '// In the main process, read an extra resource:\n' +
            'const path = require(\'path\');\n' +
            'const schemaPath = path.join(process.resourcesPath, \'schema.sql\');',
          pitfalls: [
            'Accidentally putting `pg` in `devDependencies`, so the installed app cannot talk to the DB.',
            'Trying to `require` an `extraResources` file by relative path — use `process.resourcesPath`.',
            'Including the whole project (`**/*`) in `files`, shipping tests, docs, and source maps.',
            'Forgetting `schema.sql` exists only as an extra resource, then hard-coding a dev path that breaks once installed.',
            'Packing huge assets into the asar instead of `extraResources`, making the bundle slow to load.',
            'Leaving secret or local config files in `files` and shipping them inside the installer.',
          ],
          tryIt:
            'Add a `db/schema.sql` and wire it as an `extraResources` entry. After installing, browse to the install folder\'s `resources/` and confirm `schema.sql` sits there ready for first-run setup.',
          takeaway:
            '`files` is your packing list and `extraResources` is your side bag — getting both right keeps the installer lean and makes runtime files like `schema.sql` reliably available.',
        },
        {
          id: 'm9-t6',
          title: 'The Local PostgreSQL Dependency',
          explain:
            'Because the database is a real local PostgreSQL server (not bundled), the app must detect it on first run or guide the user to install it.',
          analogy:
            'Your app is the priest who performs the seva; **PostgreSQL** is the well that supplies the water. You can carry the priest to any temple, but you cannot carry the well in your pocket. So on first arrival the app checks "is there a well here?" — and if not, it points the staff to where the well can be dug (the PostgreSQL installer).',
          theory:
            'Unlike a cloud app, Maranakatte Seva talks to a **local PostgreSQL server** running on the same Windows machine, reached over `localhost:5432` by the `pg` driver. electron-builder bundles your *code*, but **it does not bundle the PostgreSQL server** — that is a separate native program with its own installer and Windows service.\n\nYou have two realistic strategies. The simplest for a single temple machine: **document a one-time PostgreSQL install** as a prerequisite, and have your app **detect** it on first run by attempting a connection. If the connection fails, show a friendly screen explaining how to install PostgreSQL and create the database. Alternatively, you can ship a portable/embedded PostgreSQL alongside the app, but that adds significant size and complexity — out of scope for this course.\n\nThe key behaviour: never crash silently. On startup the main process tries to connect; on failure it surfaces a clear, non-technical message and a link to the prerequisite instructions, rather than a blank window.',
          whyItMatters:
            'If PostgreSQL is missing and the app just dies, a temple clerk has no idea why. Detect-and-guide turns a confusing crash into a clear, fixable message — essential for software running far from any developer.',
          steps: [
            'Document the one-time PostgreSQL install in your handover guide (download, install, set a password).',
            'On startup in the main process, attempt a `pg` connection to `localhost:5432`.',
            'Wrap the connection in try/catch; treat `ECONNREFUSED` as "PostgreSQL not running/installed".',
            'If it fails, send an IPC message to the renderer to show a setup-help screen instead of the app.',
            'If it succeeds but the database is missing, create it (ties into first-run setup).',
            'Test the guide screen by stopping the PostgreSQL service and launching the app.',
          ],
          code:
            '// main/db.js — detect the local PostgreSQL server on startup\n' +
            'const { Client } = require(\'pg\');\n' +
            '\n' +
            'async function checkPostgres() {\n' +
            '  const client = new Client({\n' +
            '    host: \'localhost\', port: 5432,\n' +
            '    user: \'postgres\', password: process.env.PGPASSWORD,\n' +
            '    database: \'postgres\'\n' +
            '  });\n' +
            '  try {\n' +
            '    await client.connect();\n' +
            '    await client.end();\n' +
            '    return { ok: true };\n' +
            '  } catch (err) {\n' +
            '    // ECONNREFUSED usually means PostgreSQL is not installed or not running\n' +
            '    return { ok: false, reason: err.code || String(err) };\n' +
            '  }\n' +
            '}\n' +
            'module.exports = { checkPostgres };',
          pitfalls: [
            'Assuming PostgreSQL is bundled — it is not; the installed app finds no DB and crashes.',
            'Letting a failed connection throw an unhandled error that shows the user a blank window.',
            'Hard-coding a database password in the app instead of setting it during first-run/handover.',
            'Not distinguishing "server missing" (`ECONNREFUSED`) from "wrong password" (`28P01`) in your help screen.',
            'Forgetting that a fresh PostgreSQL install has the server but not *your* database yet.',
            'Trying to auto-install PostgreSQL silently, which needs admin rights and often fails on locked-down machines.',
          ],
          tryIt:
            'Stop the PostgreSQL Windows service, then launch your app. Confirm it shows a helpful "PostgreSQL not found" screen rather than crashing. Restart the service and confirm it proceeds.',
          takeaway:
            'The local PostgreSQL server is the well your app draws from but cannot carry — detect it on first run and guide staff to install it, never crash silently when it is missing.',
        },
      ],
    },
    {
      id: 'm9-s2',
      title: 'Install & First Run',
      topics: [
        {
          id: 'm9-t7',
          title: 'First Run: userData, Schema, Seed',
          explain:
            'The very first time the app launches it sets up its home folder, creates the database tables, and seeds the seva catalog.',
          analogy:
            'When a new counter opens at the temple, someone arrives early to unlock the room, lay out the register, and write in the standard seva rates before the first devotee comes. **First run** is that opening ritual your app performs once — create its folder, draw up the register (tables), and pre-fill the rate card (catalog) — so it is ready before the first booking.',
          theory:
            'On first launch the app must be **self-initialising** — a temple clerk will not run setup scripts. The main process detects "have I run before?" (e.g. a marker file or an empty DB) and, if not, performs setup.\n\nThree steps. First, **create the userData folder** via `app.getPath(\'userData\')` — Electron guarantees a writable per-user location. Second, **initialise the schema**: connect with `pg`, create the database if needed, then run the `schema.sql` you shipped as an `extraResource` (this ties back to Module 2\'s schema). Third, **seed the catalog**: insert the standard sevas — Mangalarathi, Hannikaayi, Rangapooje — and booking types (Yakshagana, Annadhana) with their ₹ rates, so the counter has something to sell immediately.\n\nGuard it so it runs **once**. A simple approach: check whether the `sevas` table is empty, or whether a `first_run_done` flag exists, before seeding. Idempotent setup means relaunching never duplicates data.',
          whyItMatters:
            'Self-setup is what lets non-technical staff just install and start billing. Without it, the temple would need a developer on opening day — exactly what an offline, far-from-support app must avoid.',
          steps: [
            'On startup, get the per-user folder with `app.getPath(\'userData\')` and ensure it exists.',
            'Connect with `pg`; create the `maranakatte` database if it does not exist.',
            'Read the bundled `schema.sql` from `process.resourcesPath` and execute it to create tables.',
            'Check if the catalog is empty; if so, insert the standard sevas and booking types with ₹ rates.',
            'Write a `first_run_done` marker (a row or a file) so setup is skipped next time.',
            'Relaunch twice to confirm setup runs once and never duplicates the catalog.',
          ],
          code:
            '// main/firstRun.js\n' +
            'const { app } = require(\'electron\');\n' +
            'const fs = require(\'fs\');\n' +
            'const path = require(\'path\');\n' +
            'const { Pool } = require(\'pg\');\n' +
            '\n' +
            'async function firstRunSetup(pool) {\n' +
            '  const userDir = app.getPath(\'userData\');\n' +
            '  fs.mkdirSync(userDir, { recursive: true });\n' +
            '\n' +
            '  const schema = fs.readFileSync(\n' +
            '    path.join(process.resourcesPath, \'schema.sql\'), \'utf8\');\n' +
            '  await pool.query(schema); // create tables (idempotent SQL)\n' +
            '\n' +
            '  const { rows } = await pool.query(\'SELECT count(*) FROM sevas\');\n' +
            '  if (Number(rows[0].count) === 0) {\n' +
            '    await pool.query(\n' +
            '      \'INSERT INTO sevas(name, price) VALUES \' +\n' +
            '      \'(\\\'Mangalarathi\\\', 30), (\\\'Hannikaayi\\\', 50), (\\\'Rangapooje\\\', 100)\');\n' +
            '  }\n' +
            '}\n' +
            'module.exports = { firstRunSetup };',
          pitfalls: [
            'Seeding without an "is it empty?" check, so every launch duplicates the seva catalog.',
            'Writing setup files to the install folder (Program Files) which is read-only — always use `userData`.',
            'Assuming the database already exists; a fresh PostgreSQL install has no `maranakatte` DB yet.',
            'Non-idempotent `schema.sql` (plain `CREATE TABLE`) that errors on the second run; use `IF NOT EXISTS`.',
            'Forgetting to read `schema.sql` from `process.resourcesPath`, so it works in dev but not when installed.',
            'Blocking the UI for seconds during setup with no progress indication, looking like a freeze.',
          ],
          tryIt:
            'Delete your `userData` folder and the `maranakatte` database, then launch the app. Watch it recreate everything and seed the catalog. Launch again and confirm nothing duplicates.',
          takeaway:
            'First run is the app\'s opening ritual — make folder, build register, fill the rate card — run once and idempotently so staff can install and immediately start billing.',
        },
        {
          id: 'm9-t8',
          title: 'Where the App Lives vs Where Its Data Lives',
          explain:
            'The installed program and its seva data live in two different places on purpose — and knowing which is which is vital for the uninstall prompt.',
          analogy:
            'The temple building belongs to the trust and rarely changes; the **register of devotees** is a living record the priests write in daily and would never throw away just because the building got repainted. Your **program files** are the building; your **userData and database** are that register. Repaint (reinstall) the building all you like — the register must survive unless someone deliberately decides otherwise.',
          theory:
            'An installed Electron app has two distinct locations. The **program** is copied into a fixed place — typically `C:\\Program Files\\Maranakatte Seva\\` (per-machine) or under `%LOCALAPPDATA%\\Programs\\` (per-user). It is essentially read-only at runtime and is fully owned by the installer/uninstaller.\n\nThe **data** lives elsewhere: anything you write via `app.getPath(\'userData\')` goes under `%APPDATA%\\Maranakatte Seva\\`, and the PostgreSQL database lives in PostgreSQL\'s own data directory. These are *not* inside the program folder.\n\nThis separation is deliberate and important. Uninstalling or upgrading the program removes/replaces the program folder, but by default it **does not touch** `userData` or the database. That is exactly why the uninstall data prompt is a real choice: the data outlives the program unless you write code to remove it. Understanding this boundary is the conceptual key to the whole module.',
          whyItMatters:
            'If you do not know data lives outside the program folder, you might assume uninstalling wipes it (it does not) or accidentally delete the program thinking you cleared data. The keep-or-delete prompt only makes sense once this boundary is clear.',
          steps: [
            'Identify the program location from your `nsis.perMachine` setting (Program Files vs LocalAppData).',
            'Log `app.getPath(\'userData\')` at startup to see exactly where data is written.',
            'Note PostgreSQL\'s data directory (its own install location, separate from your app).',
            'Confirm that deleting the program folder leaves `userData` and the DB untouched.',
            'Document both paths in your handover guide for backups.',
            'Keep this boundary in mind when you write the uninstall script in the next section.',
          ],
          code:
            '// main/index.js — log where things live (run once to learn the paths)\n' +
            'const { app } = require(\'electron\');\n' +
            '\n' +
            'app.whenReady().then(() => {\n' +
            '  console.log(\'Program exe :\', app.getPath(\'exe\'));\n' +
            '  console.log(\'User data   :\', app.getPath(\'userData\'));\n' +
            '  // Program  -> C:\\\\Program Files\\\\Maranakatte Seva\\\\ (owned by installer)\n' +
            '  // userData -> C:\\\\Users\\\\<name>\\\\AppData\\\\Roaming\\\\Maranakatte Seva\\\\\n' +
            '  // Database -> PostgreSQL data dir (separate program entirely)\n' +
            '});',
          pitfalls: [
            'Believing an uninstall automatically deletes the seva data — by default it does not.',
            'Writing data into the program folder, which breaks on per-machine installs (read-only) and gets wiped on uninstall.',
            'Confusing `app.getPath(\'userData\')` with the install path when deciding what to delete.',
            'Forgetting the PostgreSQL database is a third location, separate from both program and userData.',
            'Assuming `%APPDATA%` is the same for every Windows user — it is per-user.',
            'Documenting only one path in the handover, leaving staff unable to back up the database.',
          ],
          tryIt:
            'Launch the app, copy the logged `userData` path, and open it in Explorer. Then open the install folder. Seeing them in two different places makes the uninstall choice concrete.',
          takeaway:
            'Program files and seva data live in separate places by design — the data outlives the program unless code deletes it, which is precisely what makes the uninstall keep-or-delete prompt meaningful.',
        },
        {
          id: 'm9-t9',
          title: 'Auto-Update for an Offline App',
          explain:
            'For an offline temple app you normally turn auto-update OFF and hand over updates as a new installer instead.',
          analogy:
            'A temple deep in the coastal hills does not get a courier every morning. You do not wait for parcels that never come — you update the almanac when the priest next visits the town and brings a fresh copy. **Manual updates** (a new installer carried in) suit an offline machine far better than auto-update waiting on internet that is not there.',
          theory:
            'electron-builder pairs with **electron-updater** for auto-updates, but that assumes a reliable internet connection and an update server (or GitHub releases). Maranakatte Seva is **offline by design** — the counter machine may have little or no internet — so auto-update is usually the wrong fit and is best **disabled**.\n\nThe practical model is **manual updates**: when you release a new version, you bump `version`, rebuild the installer, and deliver the new `Setup.exe` (USB stick, email, download in town). Running it over the existing install upgrades the program. Because data lives in `userData` and PostgreSQL (separate from the program), an in-place upgrade **keeps the seva records** — the same separation from the previous topic protects users across updates.\n\nIf you ever do want optional updates, you can host the installer somewhere and have the app simply *notify* the user that a newer version exists, leaving the actual install manual. But for most single-temple deployments, "no auto-update, deliver a new installer" is the correct, dependable choice.',
          whyItMatters:
            'Enabling auto-update on a machine with no internet just produces errors or silent failures. A clear manual-update plan keeps the app upgradeable without depending on connectivity the temple may not have.',
          steps: [
            'Do not add electron-updater / auto-update wiring for the default offline build.',
            'Treat each release as: bump `version`, `npm run dist`, deliver the new `Setup.exe`.',
            'Document the manual-update routine in the handover guide (run the new installer over the old).',
            'Confirm that an in-place upgrade preserves `userData` and the database.',
            'If you must show update info, only *notify* — never auto-download on an offline machine.',
            'Test an upgrade: install 1.0.0, add data, install 1.1.0 over it, verify data survives.',
          ],
          code:
            '// For the offline build, simply DO NOT initialise auto-update.\n' +
            '// (No require(\'electron-updater\'); no autoUpdater.checkForUpdates().)\n' +
            '\n' +
            '// Manual update routine, documented for staff:\n' +
            '//   1. Receive the new \'Maranakatte Seva Setup X.Y.Z.exe\'.\n' +
            '//   2. Double-click it; it upgrades the existing install.\n' +
            '//   3. Seva data in userData + PostgreSQL is preserved (separate location).\n' +
            '//\n' +
            '// Releasing a new version (developer side):\n' +
            '//   - bump "version" in package.json\n' +
            '//   - npm run dist\n' +
            '//   - deliver release/Maranakatte Seva Setup X.Y.Z.exe',
          pitfalls: [
            'Wiring electron-updater on an offline machine, producing connection errors at every launch.',
            'Forgetting to bump `version`, so the new installer looks identical and may not upgrade cleanly.',
            'Assuming an upgrade wipes data and scaring staff — in-place upgrades keep userData and the DB.',
            'Auto-downloading large updates over a metered or absent connection.',
            'Not testing the upgrade path, then discovering a schema migration was needed.',
            'Leaving stale `latest.yml` references that make the app look for an update server that does not exist.',
          ],
          tryIt:
            'Install version 1.0.0, create a few bookings, then build and install 1.1.0 over it. Confirm the bookings are still there — proof that manual upgrades preserve the temple\'s data.',
          takeaway:
            'Offline means manual: disable auto-update, deliver new installers by hand, and rely on the program/data separation so every upgrade keeps the temple\'s seva records intact.',
        },
        {
          id: 'm9-t10',
          title: 'Code Signing & Windows SmartScreen',
          explain:
            'An unsigned installer makes Windows warn the user; code signing is how you prove the app comes from a trusted source.',
          analogy:
            'A letter without the temple seal makes people pause — "is this really from the trust?" **Code signing** is that wax seal pressed onto your installer. With a recognised seal, Windows lets devotees in without a warning; without it, **SmartScreen** stops them at the gate asking "are you sure this stranger is safe?"',
          theory:
            'When a user runs an installer, Windows **SmartScreen** checks whether the file is **digitally signed** by a known publisher with established reputation. An **unsigned** installer triggers the blue "Windows protected your PC" warning; the user must click "More info → Run anyway" to proceed. It still works, but it looks scary and unprofessional.\n\n**Code signing** attaches a cryptographic signature, made with a **code-signing certificate** bought from a Certificate Authority, that proves who published the file and that it was not tampered with. electron-builder can sign automatically if you provide the certificate (via `win.certificateFile` + password, or environment variables). **EV (Extended Validation)** certificates earn SmartScreen reputation immediately; standard certificates build reputation over downloads/time.\n\nFor a single temple, a certificate may be more cost than it is worth — many ship **unsigned** and simply tell staff to click "Run anyway" once during the one-time install. That is an acceptable, honest choice as long as the handover guide explains the warning. If you do plan wider distribution, signing is the professional path.',
          whyItMatters:
            'Staff who see a stern Windows warning may abandon the install, fearing a virus. Either sign the installer or explicitly document the expected warning so the one-time setup is not derailed by understandable caution.',
          steps: [
            'Decide: sign (buy a certificate) or ship unsigned and document the warning.',
            'If signing, obtain a code-signing certificate (standard or EV) from a CA.',
            'Point electron-builder at it via `win.certificateFile` and a password (use env vars for the password).',
            'Rebuild; verify the `Setup.exe` properties show a valid digital signature.',
            'If unsigned, write clear handover steps: "click More info, then Run anyway — this is expected".',
            'Test the install experience on a fresh machine to see exactly what staff will see.',
          ],
          code:
            '// Signed build (if you have a certificate):\n' +
            '\'win\': {\n' +
            '  \'target\': [\'nsis\'],\n' +
            '  \'certificateFile\': \'build/codesign.pfx\',\n' +
            '  \'certificatePassword\': \'\${CSC_KEY_PASSWORD}\' // from env, never hard-coded\n' +
            '}\n' +
            '\n' +
            '// Unsigned build (acceptable for a single temple):\n' +
            '//   - no certificate fields\n' +
            '//   - handover note: "On first install Windows shows a blue warning.\n' +
            '//     Click \'More info\' then \'Run anyway\'. This is normal for an\n' +
            '//     in-house app and is not a virus."',
          pitfalls: [
            'Hard-coding the certificate password in `package.json` instead of using an environment variable.',
            'Expecting a brand-new standard certificate to clear SmartScreen instantly — reputation takes time.',
            'Shipping unsigned with no explanation, so cautious staff refuse to bypass the warning.',
            'Committing the `.pfx` certificate file into git.',
            'Confusing signing (proves publisher) with antivirus (scans for malware) — they are different.',
            'Buying a certificate for a one-machine temple deployment where documenting the warning would do.',
          ],
          tryIt:
            'Build an unsigned installer and run it on a clean Windows machine to see the exact SmartScreen warning. Write the precise click-through steps into your handover guide so staff are not alarmed.',
          takeaway:
            'Unsigned installers trigger a SmartScreen warning; either sign with a certificate to add the trusted seal, or ship unsigned and honestly document the one-time "Run anyway" step for staff.',
        },
      ],
    },
    {
      id: 'm9-s3',
      title: 'The Uninstall Data Prompt',
      topics: [
        {
          id: 'm9-t11',
          title: 'Custom Uninstall Scripting with NSIS',
          explain:
            'electron-builder lets you inject your own NSIS script into the uninstaller — this hook is where the keep-or-delete-data question will live.',
          analogy:
            'The standard uninstaller is a cleaner who sweeps out the room and leaves. **Custom NSIS scripting** lets you give that cleaner one extra instruction before they go: "before you lock up, ask whether to keep or burn the register." `installer.nsh` is the note you slip into the cleaner\'s hand.',
          theory:
            'NSIS (Nullsoft Scriptable Install System) is the engine electron-builder uses to build Windows installers. It is **scriptable** — you can add your own logic. electron-builder exposes this through the **`nsis.include`** option (point it at a custom `.nsh` file) or by placing a file named **`installer.nsh`** in the build resources directory, which electron-builder automatically includes.\n\nInside that file you define special **macros** that electron-builder calls at known moments. The important ones for us are around **uninstall**: `customUnInstall` (runs during uninstall) and the uninstaller\'s `un.onInit` (runs as the uninstaller starts). This is the hook where we will pop a message box and decide whether to delete data.\n\nNSIS script looks unusual — it is its own stack-based language with `MessageBox`, `RMDir`, `nsExec::Exec`, and `${...}` macro calls. You do not need to master it; you need a handful of lines in the right macro. The win is that electron-builder wires your snippet into the generated uninstaller automatically.',
          whyItMatters:
            'Without custom NSIS scripting there is no place to ask the keep-or-delete question — the headline feature of this whole module literally cannot exist. This hook is the foundation everything else in the section builds on.',
          steps: [
            'Create a `build/installer.nsh` file (electron-builder auto-includes it).',
            'Or point `nsis.include` at a custom `.nsh` path in your config.',
            'Define the `customUnInstall` macro as the place for uninstall-time logic.',
            'Add a tiny `MessageBox` first to confirm the hook fires during uninstall.',
            'Rebuild the installer so the script is compiled in.',
            'Install then uninstall, and confirm your message box appears — proving the hook works.',
          ],
          code:
            '; build/installer.nsh — auto-included by electron-builder\n' +
            '; This macro runs during uninstall. Start with a smoke-test box.\n' +
            '\n' +
            '!macro customUnInstall\n' +
            '  MessageBox MB_OK \'Custom uninstall hook is running for Maranakatte Seva.\'\n' +
            '!macroend\n' +
            '\n' +
            '; In package.json you can also be explicit:\n' +
            '; "nsis": { "include": "build/installer.nsh" }',
          pitfalls: [
            'Putting `installer.nsh` in the wrong folder so electron-builder never includes it.',
            'Expecting JavaScript syntax — NSIS is its own language with different rules.',
            'Editing the macro but not rebuilding, then testing an old uninstaller.',
            'Forgetting that `!macro customUnInstall` is the *uninstall* hook (not `customInstall`).',
            'Leaving a debug `MessageBox` in the shipped uninstaller.',
            'Assuming the hook runs on install too — `customUnInstall` only runs during uninstall.',
          ],
          tryIt:
            'Add the smoke-test `installer.nsh` above, rebuild, install, then uninstall from Apps & features. When the "hook is running" box pops up, you have the foundation for the real prompt.',
          takeaway:
            'electron-builder auto-includes a custom `installer.nsh`, and its `customUnInstall` macro is the exact hook where the keep-or-delete-data prompt will live — confirm it fires before building anything on top.',
        },
        {
          id: 'm9-t12',
          title: 'Showing the Keep-or-Delete Message Box',
          explain:
            'During uninstall, pop a Yes/No message box asking the operator whether to keep their seva data or delete everything.',
          analogy:
            'Before the cleaner locks the room, they hold up the register and ask the head priest: "Keep this, or shall I dispose of it?" That single, clear question — **MB_YESNO** — is the heart of our feature. The operator, not the software, decides the fate of the temple\'s records.',
          theory:
            'NSIS shows dialogs with the **`MessageBox`** instruction. The flag **`MB_YESNO`** gives two buttons; the chosen button lands in the special `$0`-style result you branch on with `IDYES` / `IDNO`. We phrase the question plainly: keeping data is the safe default, deleting is the deliberate exception.\n\nA good prompt is unambiguous: title and body name *Maranakatte Seva*, say exactly what "delete" means ("all seva records and the local database will be permanently removed"), and make the safe choice obvious. We branch: on **Yes (keep)** we do nothing destructive and let the normal uninstall finish; on **No / delete** we proceed to the deletion logic (next topic), ideally behind a second confirmation.\n\nBecause uninstall is an unusual, one-way moment, the wording matters as much as the code. The message box is short, but it is the operator\'s last chance to protect years of devotee records — so it must read clearly to a non-technical temple clerk in stressful "am I doing the right thing?" circumstances.',
          whyItMatters:
            'This is the literal headline feature. A clear, well-worded prompt puts the temple in control of its own data and prevents both accidental loss and unwanted leftover clutter.',
          steps: [
            'In `customUnInstall`, call `MessageBox MB_YESNO` with a plain-language question.',
            'Make the default/safe path "Keep" so an accidental Enter does not delete.',
            'Label clearly what deletion removes (records + local database), and that it is permanent.',
            'Branch with `IDYES`/`IDNO` (or jump labels) to keep vs delete code paths.',
            'On keep, simply skip the destructive block; on delete, jump to it.',
            'Rebuild and test that choosing Keep leaves data and choosing Delete reaches the delete code.',
          ],
          code:
            '!macro customUnInstall\n' +
            '  MessageBox MB_YESNO|MB_ICONQUESTION \\\n' +
            '    \'Keep your Maranakatte Seva data?$\\r$\\n$\\r$\\n\' \\\n' +
            '    \'Yes = keep all seva records and the local database.$\\r$\\n\' \\\n' +
            '    \'No  = permanently delete everything (cannot be undone).\' \\\n' +
            '    IDYES keepData IDNO deleteData\n' +
            '\n' +
            '  deleteData:\n' +
            '    ; (second confirmation + actual deletion go here — next topic)\n' +
            '    Goto doneUninstall\n' +
            '\n' +
            '  keepData:\n' +
            '    ; do nothing destructive; leave userData + database intact\n' +
            '\n' +
            '  doneUninstall:\n' +
            '!macroend',
          pitfalls: [
            'Wording the prompt so "Yes" deletes — make "Yes/Keep" the safe choice to match user instinct.',
            'A vague message ("Remove data?") that does not say records and database are lost forever.',
            'Forgetting the `IDYES`/`IDNO` jump labels, so both paths fall through to deletion.',
            'No icon or a misleading one; `MB_ICONQUESTION` signals a real choice.',
            'Technical jargon ("drop the schema") a temple clerk will not understand.',
            'Not handling the case where the user closes the box — default to keep, never delete.',
          ],
          tryIt:
            'Wire up the `MB_YESNO` box, rebuild, and uninstall. Click both Keep and Delete on separate test installs and confirm each reaches the intended branch (use a temporary `MessageBox` to mark which path ran).',
          takeaway:
            'A clear `MB_YESNO` prompt, with Keep as the safe default and a plain explanation of what Delete destroys, hands the temple control over its own records — this dialog is the heart of the module.',
        },
        {
          id: 'm9-t13',
          title: 'Acting on the Choice: Keep vs Delete',
          explain:
            'If the operator chose Keep, leave userData and the database alone; if Delete, remove the userData folder and drop the local database.',
          analogy:
            'Once the priest answers, the cleaner acts. "Keep" means the register stays exactly on its shelf, untouched. "Delete" means the register is taken out and the well\'s store is emptied — the **userData folder** swept away and the **PostgreSQL database** dropped. Two locations, because (from earlier) the data lives in two places.',
          theory:
            'Acting on **Keep** is the easy half: do nothing. Because data lives outside the program folder, simply finishing the normal uninstall leaves `userData` and the PostgreSQL database intact.\n\n**Delete** must clear *both* data locations. First the **userData folder** — in NSIS, `$APPDATA\\Maranakatte Seva` removed with `RMDir /r`. Second the **PostgreSQL database**, which NSIS cannot drop directly; you shell out to PostgreSQL\'s `dropdb` (or run a `DROP DATABASE` via `psql`) using `nsExec::Exec`. Both must be addressed, or "delete everything" leaves half the data behind.\n\nA subtle but important detail: the uninstaller runs as the program is being removed, so it cannot rely on your Node/Electron code — it uses NSIS instructions and external tools that exist on the machine (the PostgreSQL CLI installed as a prerequisite). Get the paths and the database name right, and "Delete" genuinely returns the machine to a clean state. Get them wrong, and you either miss data or, worse, touch the wrong folder — which is why the next topic is about doing this safely.',
          whyItMatters:
            'A "delete everything" that only removes the folder but leaves the database (or vice versa) is a broken promise. Handling both locations correctly is what makes the feature trustworthy.',
          steps: [
            'On Keep, ensure no destructive instructions run — let the uninstaller finish normally.',
            'On Delete, remove the userData folder with `RMDir /r "$APPDATA\\Maranakatte Seva"`.',
            'On Delete, drop the database via the PostgreSQL CLI using `nsExec::Exec`.',
            'Use the exact database name from your app (`maranakatte`) and correct PG path.',
            'Check the exit code of the drop command and warn if it failed.',
            'Test both paths and verify in Explorer + psql that the right things are gone or kept.',
          ],
          code:
            '  deleteData:\n' +
            '    ; 1) remove the userData folder (seva records, settings, backups)\n' +
            '    RMDir /r \'$APPDATA\\Maranakatte Seva\'\n' +
            '\n' +
            '    ; 2) drop the local PostgreSQL database via the PG CLI\n' +
            '    ;    (psql/dropdb installed with PostgreSQL prerequisite)\n' +
            '    nsExec::Exec \'\\"$PROGRAMFILES64\\PostgreSQL\\16\\bin\\dropdb.exe\\" \\\n' +
            '      -U postgres --if-exists maranakatte\'\n' +
            '    Pop $0  ; $0 = exit code; non-zero means the drop failed\n' +
            '    StrCmp $0 \'0\' dropOk dropFailed\n' +
            '    dropFailed:\n' +
            '      MessageBox MB_OK \'Could not remove the database automatically; \' \\\n' +
            '        \'please drop "maranakatte" manually.\'\n' +
            '    dropOk:\n' +
            '    Goto doneUninstall',
          pitfalls: [
            'Deleting the folder but forgetting to drop the database, leaving half the data behind.',
            'Hard-coding a PostgreSQL path/version (`PostgreSQL\\16\\bin`) that differs on the machine.',
            'Assuming `dropdb` needs no auth — it may prompt or fail without the right user/password setup.',
            'Using a wrong or guessed database name so the drop silently does nothing.',
            'Ignoring the `nsExec` exit code, so a failed drop looks successful.',
            'Removing `$INSTDIR` (the program) thinking it is the data — data is in `$APPDATA` and PostgreSQL.',
          ],
          tryIt:
            'On a test machine, run the uninstaller and choose Delete. Afterwards, open Explorer to confirm the `Maranakatte Seva` AppData folder is gone, and run `psql -l` to confirm the `maranakatte` database no longer exists.',
          takeaway:
            'Keep means do nothing; Delete must clear BOTH the userData folder and the PostgreSQL database — handle both locations or the "delete everything" promise is broken.',
        },
        {
          id: 'm9-t14',
          title: 'Deleting Safely: Confirm, Back Up, Ethics',
          explain:
            'Before any destructive delete, confirm a second time and back up first — and never silently erase a temple\'s records.',
          analogy:
            'No priest burns the old register on a single nod. They ask again — "you are truly sure?" — and they photograph it first, just in case. **Double confirmation and an automatic backup** are that caution. Years of devotee names, gotras, and donations deserve more than one careless click.',
          theory:
            'Destructive actions need **guard rails**. The first guard is a **second confirmation** after the keep/delete choice — a distinct "This will permanently delete ALL seva data. Are you absolutely sure?" box, so a single mis-click cannot wipe the temple\'s history. Default it to "No".\n\nThe second guard is a **safety backup**. Before deleting, dump the database (via `pg_dump`) and/or zip the userData folder to a location *outside* what you are about to remove — for example the user\'s Documents or Desktop. Even a "delete everything" then leaves one recoverable copy, turning a catastrophe into an inconvenience.\n\nThe third is **ethics**. This is a temple\'s record of devotion and donations; silently deleting it would be a serious breach of trust. The software must never decide on the user\'s behalf, must state plainly what is lost, and should err toward preservation. "Keep" is the default for a reason. Building software for a community means treating their data as something held in trust, not something to casually destroy.',
          whyItMatters:
            'A single wrong click should never be able to erase years of irreplaceable records. Confirmations, an automatic backup, and a preservation-first stance protect the temple from your code and from human error alike.',
          steps: [
            'After the keep/delete choice, add a second `MB_YESNO|MB_DEFBUTTON2` "are you absolutely sure?" box.',
            'Default the second box to No so Enter does not delete.',
            'Before deleting, run `pg_dump` to write a backup file outside the deletion target.',
            'Optionally zip the userData folder to Documents as a second safety copy.',
            'Only then perform the folder removal and database drop.',
            'Tell the user where the safety backup was saved, in plain language.',
          ],
          code:
            '  deleteData:\n' +
            '    MessageBox MB_YESNO|MB_ICONEXCLAMATION|MB_DEFBUTTON2 \\\n' +
            '      \'This will PERMANENTLY delete ALL Maranakatte Seva records \' \\\n' +
            '      \'and the database. Are you absolutely sure?\' \\\n' +
            '      IDNO keepData  ; default No -> fall back to keeping data\n' +
            '\n' +
            '    ; safety backup BEFORE destroying anything\n' +
            '    nsExec::Exec \'\\"$PROGRAMFILES64\\PostgreSQL\\16\\bin\\pg_dump.exe\\" \\\n' +
            '      -U postgres -f \\"$DOCUMENTS\\maranakatte-backup.sql\\" maranakatte\'\n' +
            '    Pop $0\n' +
            '\n' +
            '    RMDir /r \'$APPDATA\\Maranakatte Seva\'\n' +
            '    ; ...then drop the database (previous topic)\n' +
            '    MessageBox MB_OK \'A backup was saved to your Documents folder \' \\\n' +
            '      \'as maranakatte-backup.sql before deletion.\'',
          pitfalls: [
            'A single confirmation, letting one mis-click destroy everything.',
            'Defaulting the "are you sure?" box to Yes, defeating the guard.',
            'Backing up *into* the folder you are about to delete, so the backup dies with it.',
            'Silent deletion with no message — a breach of trust with the temple.',
            'Skipping the backup "to save time", removing the only recovery path.',
            'Not telling the user where the backup went, so they cannot find it later.',
          ],
          tryIt:
            'Add the second confirmation and a `pg_dump` backup to Documents. Run the delete path, click No on the second box once (confirm nothing is deleted), then run it again clicking Yes and verify the backup `.sql` exists before the data is gone.',
          takeaway:
            'Never destroy a temple\'s records on one click: confirm twice, back up first to a safe location, and keep preservation the default — the ethics matter as much as the code.',
        },
        {
          id: 'm9-t15',
          title: 'Testing the Installer & Both Uninstall Paths',
          explain:
            'Test the whole install/uninstall on a clean machine or VM, exercising both the keep and delete paths before handing it to the temple.',
          analogy:
            'You do not debut a new pooja procedure during the big festival — you rehearse it quietly first. A **clean VM** is that rehearsal hall: a fresh machine with nothing of yours on it, where you can install, fill in data, and try both uninstall answers without risking the real temple counter.',
          theory:
            'Your dev machine is a poor test bed — it already has PostgreSQL, your paths, your leftovers. Real users start from a **clean Windows machine**. The reliable way to test is a **virtual machine** (or a spare PC) with a fresh Windows install and no developer tooling, optionally with PostgreSQL installed as the documented prerequisite.\n\nThe test plan covers the **full lifecycle**: run the installer (watch the SmartScreen behaviour), complete first run (folder + schema + seed), use the app to create real seva records and bookings, then uninstall **twice** — once choosing **Keep** and once choosing **Delete** — verifying each outcome. Keep must leave the userData folder and `maranakatte` database intact; Delete must remove both and leave the safety backup.\n\nVM **snapshots** make this fast: snapshot the clean state, run a test, then revert to clean and run the next. This lets you exercise every branch repeatedly until the installer behaves perfectly — long before it ever reaches the temple counter where mistakes cost real records.',
          whyItMatters:
            'The uninstall delete path is irreversible in production. Rehearsing it on a disposable VM is the only safe way to be certain Keep keeps and Delete deletes correctly before real temple data is on the line.',
          steps: [
            'Set up a clean Windows VM (or spare PC) and snapshot the fresh state.',
            'Install PostgreSQL as the documented prerequisite, then snapshot again.',
            'Run your `Setup.exe`; note the SmartScreen warning and first-run setup.',
            'Use the app to create real sevas, bookings, and devotee records.',
            'Uninstall choosing Keep; verify userData + database survive. Revert snapshot.',
            'Uninstall choosing Delete; verify both are gone and the backup `.sql` exists.',
          ],
          code:
            '; Manual test checklist (run on a clean VM, snapshot between runs)\n' +
            '; [ ] Installer runs; SmartScreen handled as documented\n' +
            '; [ ] First run: userData created, schema applied, catalog seeded\n' +
            '; [ ] App works: counter -> receipt, a Yakshagana + Annadhana booking\n' +
            '; [ ] Uninstall -> KEEP  : $APPDATA folder + \'maranakatte\' DB still exist\n' +
            '; [ ] Reinstall finds the kept data intact\n' +
            '; [ ] Uninstall -> DELETE: folder gone, DB dropped, backup .sql in Documents\n' +
            '; [ ] Second "are you sure?" guard blocks an accidental delete',
          pitfalls: [
            'Testing only on your dev machine, where PostgreSQL and paths are already "right".',
            'Never testing the Delete path because it is destructive — exactly the path that most needs testing.',
            'Skipping snapshots, so each test pollutes the machine and results drift.',
            'Forgetting to test reinstall-after-keep, which is the real point of the Keep option.',
            'Not verifying the backup file actually exists after a Delete.',
            'Testing on a machine that has internet, hiding the offline PostgreSQL-detection behaviour.',
          ],
          tryIt:
            'Spin up a clean Windows VM, snapshot it, and run the full checklist above. Revert to the snapshot between the Keep and Delete uninstall tests so each starts from an identical, clean state.',
          takeaway:
            'Rehearse the entire install/uninstall lifecycle on a clean, snapshotted VM — exercising both Keep and Delete — so you are certain the irreversible delete path behaves correctly before any real temple data exists.',
        },
      ],
    },
    {
      id: 'm9-s4',
      title: 'Capstone — Ship Maranakatte Seva',
      topics: [
        {
          id: 'm9-t16',
          title: 'End-to-End Checklist & Staff Handover',
          explain:
            'Run a final top-to-bottom check of the whole app, then hand it over to temple staff with a short, plain operator guide and a backup routine.',
          analogy:
            'Before a temple opens for the day, someone walks the whole premises once — lamps lit, register ready, donation box in place — and then briefs the new attendant on how to run things. The **end-to-end checklist** is that final walk-through, and the **handover guide** is the briefing that lets staff run the counter without you standing beside them.',
          theory:
            'Shipping is more than a working build — it is making sure the **whole journey** works and that **non-developers can operate it**. The end-to-end checklist walks the real workflow: counter sale → receipt/print → a Yakshagana and an Annadhana booking → daily/Rangapooje reports → a backup → install and both uninstall paths. Each link must work on a clean machine, not just in dev.\n\nThe **handover guide** is short and human. It covers: how to start the app, the one-time PostgreSQL prerequisite and the expected SmartScreen warning, that there are no cloud logins (it is offline; credentials are minimal or none), the **daily backup routine** (where data lives and how to copy/`pg_dump` it), and what the uninstall keep/delete prompt means. Write it for a temple clerk, not an engineer.\n\nFinally, point to **where to go next** — multi-counter support, regional-language (Kannada) reports, networked backups — so the temple knows the app can grow. Done well, handover means the software keeps serving long after the course ends, which is the real measure of success.',
          whyItMatters:
            'An app that only you can run has not really shipped. A clear checklist proves it works end to end, and a plain handover guide is what lets a coastal temple actually use Maranakatte Seva every Rangapooje evening without a developer present.',
          steps: [
            'Walk the full workflow on a clean machine: counter → print → bookings → reports.',
            'Verify backup and restore, then the installer and both uninstall paths.',
            'Write a one-page operator guide: start app, PostgreSQL prerequisite, SmartScreen note.',
            'Document the daily backup routine and where data lives (userData + database).',
            'Explain the uninstall keep/delete prompt in plain words.',
            'List next steps (multi-counter, Kannada reports) so the temple can plan ahead.',
          ],
          code:
            '; FINAL SHIP CHECKLIST — Maranakatte Seva v1.0.0\n' +
            '; [ ] Counter sale -> receipt prints (Mangalarathi/Hannikaayi/Rangapooje)\n' +
            '; [ ] Bookings: Yakshagana + Annadhana saved with devotee details\n' +
            '; [ ] Devotee captured: name, gotra, nakshatra, phone; amounts in INR\n' +
            '; [ ] Reports: daily total + Rangapooje (500+/day) count correct\n' +
            '; [ ] Backup created and restore verified\n' +
            '; [ ] Installer builds; SmartScreen behaviour documented\n' +
            '; [ ] Uninstall KEEP and DELETE both tested on a clean VM\n' +
            ';\n' +
            '; HANDOVER GUIDE (one page for staff):\n' +
            ';  1. Install PostgreSQL once (see steps); set the postgres password.\n' +
            ';  2. Run Maranakatte Seva Setup; if Windows warns, More info -> Run anyway.\n' +
            ';  3. App is offline; no internet or login needed.\n' +
            ';  4. Daily backup: copy the data folder / run the Backup button each night.\n' +
            ';  5. To remove: uninstall and choose KEEP (safe) or DELETE (erases all).',
          pitfalls: [
            'Declaring "done" after a successful build without walking the real end-to-end workflow.',
            'A handover guide full of developer jargon a temple clerk cannot follow.',
            'Forgetting to document the daily backup routine — the one habit that saves the records.',
            'Not mentioning the expected SmartScreen warning, so staff fear the installer.',
            'Leaving the PostgreSQL prerequisite undocumented, so the app fails on a fresh machine.',
            'No "where to go next", leaving the temple unaware the app can grow with their needs.',
          ],
          tryIt:
            'Run the full ship checklist on a clean VM from install to both uninstall paths, then write the one-page handover guide and hand it (and the app) to someone non-technical to follow without your help.',
          takeaway:
            'Shipping means proving the whole journey works on a clean machine AND giving staff a plain operator guide with a backup routine — that handover is what lets Maranakatte Seva serve the temple long after the course ends.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm9-p1',
      type: 'Build',
      title: 'Build the Windows Installer',
      domain: 'Packaging & distribution',
      duration: '3-4 hours',
      description:
        'Configure electron-builder for Maranakatte Seva and produce a working NSIS `.exe` installer carrying the temple icon, the name "Maranakatte Seva", and a proper version. Install it on a clean machine and confirm the app launches and reaches first-run setup.',
      tools: ['Electron', 'electron-builder', 'NSIS', 'Vite', 'Node.js'],
      blueprint: {
        overview:
          'You will turn the finished app into a real installable program. The deliverable is a single `Setup.exe` that a temple clerk can double-click to install Maranakatte Seva, with the correct identity (appId, productName, version, icon) and a lean, correct file bundle including the `schema.sql` extra resource.',
        functionalRequirements: [
          'A `build` config sets a unique `appId`, `productName` "Maranakatte Seva", and reads the package version.',
          'The Windows target is NSIS, producing a `Setup.exe` in a `release/` output folder.',
          'A multi-resolution temple `.ico` appears on the shortcut, installer, and Apps & features entry.',
          'The `files` list ships only what the app runs; `pg` is a production dependency.',
          '`schema.sql` (and seed catalog) are bundled via `extraResources` and reachable at runtime.',
        ],
        technicalImplementation: [
          'Install electron-builder as a devDependency and add a `dist` script chaining `vite build` then `electron-builder`.',
          'Author the `build` block in `package.json` with `appId`, `productName`, `win.target: [nsis]`, and `directories.output`.',
          'Create `build/icon.ico` and reference it in `win.icon` / `nsis.installerIcon`.',
          'Configure `files` globs and `extraResources` for `schema.sql`; read it via `process.resourcesPath`.',
          'Build with `npm run dist`, then install and launch the `Setup.exe` on a clean machine.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold the build config',
            outcome: 'A package.json build block that produces a named, iconed NSIS installer.',
            prompt:
              'I have an Electron + React (Vite) + local PostgreSQL (`pg`) app called Maranakatte Seva. Write the `package.json` `build` block for electron-builder that sets appId `org.maranakatte.seva`, productName "Maranakatte Seva", a Windows NSIS target, output to `release/`, and uses `build/icon.ico`. Explain each field in beginner terms.',
          },
          {
            step: 2,
            label: 'Get the file bundle right',
            outcome: 'A lean files list plus extraResources that ship schema.sql correctly.',
            prompt:
              'Show me the `files` globs to include only `dist/`, `main/`, `preload/`, and `package.json` (excluding source maps and tests), and an `extraResources` entry that bundles `db/schema.sql`. Then show the main-process code to read it from `process.resourcesPath` so it works once installed.',
          },
          {
            step: 3,
            label: 'Build and verify',
            outcome: 'A working Setup.exe verified on a clean machine.',
            prompt:
              'Give me the exact npm scripts and command to build the installer, and a short checklist to verify on a clean Windows machine that the app installs, shows the temple icon and name, launches, and reaches first-run setup.',
          },
        ],
      },
    },
    {
      id: 'm9-p2',
      type: 'Feature',
      title: 'The Uninstall Keep/Delete Prompt',
      domain: 'Installer scripting & data safety',
      duration: '3-4 hours',
      description:
        'Add a custom NSIS `installer.nsh` that, during uninstall, asks the operator whether to keep or delete the seva data and local database — then acts on the choice safely, behind a second confirmation and an automatic backup.',
      tools: ['NSIS', 'electron-builder', 'PostgreSQL CLI (pg_dump/dropdb)', 'Windows VM'],
      blueprint: {
        overview:
          'This is the headline feature. You will inject a custom NSIS script into the uninstaller that pops a clear keep-or-delete message box. Keep leaves userData and the database intact; Delete (after a second confirmation and a `pg_dump` backup) removes the userData folder and drops the `maranakatte` database. You will test both paths on a clean VM.',
        functionalRequirements: [
          'A `customUnInstall` macro shows an `MB_YESNO` prompt with Keep as the safe default.',
          'Choosing Keep leaves `$APPDATA\\Maranakatte Seva` and the `maranakatte` database untouched.',
          'Choosing Delete is guarded by a second "are you absolutely sure?" box defaulting to No.',
          'Before deletion, a `pg_dump` backup is written to the user\'s Documents folder.',
          'Delete then removes the userData folder and drops the local PostgreSQL database, reporting failures.',
        ],
        technicalImplementation: [
          'Create `build/installer.nsh` so electron-builder auto-includes it; define `customUnInstall`.',
          'Use `MessageBox MB_YESNO` with `IDYES`/`IDNO` jump labels for keep vs delete branches.',
          'Add a second `MB_YESNO|MB_DEFBUTTON2` confirmation before any destructive action.',
          'Run `pg_dump` via `nsExec::Exec` to back up, then `RMDir /r` the userData folder and `dropdb` the database.',
          'Check `nsExec` exit codes and surface clear messages; test Keep and Delete on a snapshotted VM.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Wire the uninstall hook',
            outcome: 'A custom installer.nsh whose customUnInstall macro fires during uninstall.',
            prompt:
              'For an electron-builder NSIS installer, write a `build/installer.nsh` with a `customUnInstall` macro that first just shows a smoke-test MessageBox, and explain how electron-builder auto-includes this file and when the macro runs. I am new to NSIS.',
          },
          {
            step: 2,
            label: 'Add the keep/delete prompt',
            outcome: 'An MB_YESNO prompt branching to keep vs delete, Keep being safe.',
            prompt:
              'Extend the `customUnInstall` macro with an `MB_YESNO|MB_ICONQUESTION` box asking whether to keep or delete all Maranakatte Seva data, with clear wording for a non-technical temple clerk. Use `IDYES`/`IDNO` jump labels so Keep does nothing destructive and Delete jumps to a delete section. Keep must be the safe default.',
          },
          {
            step: 3,
            label: 'Delete safely with backup',
            outcome: 'A guarded delete that backs up, removes userData, and drops the database.',
            prompt:
              'Write the NSIS delete section: a second `MB_DEFBUTTON2` "are you absolutely sure?" confirmation, then a `pg_dump` backup to `$DOCUMENTS`, then `RMDir /r` of `$APPDATA\\Maranakatte Seva`, then `dropdb --if-exists maranakatte` via `nsExec::Exec`, checking exit codes and showing plain-language messages. Note any path/version assumptions I must adjust.',
          },
        ],
      },
    },
    {
      id: 'm9-p3',
      type: 'Capstone',
      title: 'Ship Maranakatte Seva',
      domain: 'Full app delivery & handover',
      duration: '5-6 hours',
      description:
        'Assemble the complete Maranakatte Seva app, run the full end-to-end checklist, build the (signed or honestly-unsigned) installer with the uninstall data prompt, test both uninstall paths on a clean VM, and write the temple-staff handover guide.',
      tools: ['Electron', 'React', 'Vite', 'local PostgreSQL (pg)', 'electron-builder', 'NSIS', 'Windows VM'],
      blueprint: {
        overview:
          'The capstone brings everything together into a deliverable a coastal temple can actually use. You will verify the whole workflow (counter → receipt/print → bookings → reports → backup), produce the installer with the keep/delete uninstall prompt, validate both uninstall outcomes on a clean machine, and hand it over with a plain one-page operator guide and a daily backup routine.',
        functionalRequirements: [
          'The full workflow works on a clean machine: counter sale, receipt/print, Yakshagana + Annadhana bookings, daily/Rangapooje reports.',
          'Devotee details (name, gotra, nakshatra, phone) and ₹ amounts are captured and reported correctly.',
          'The installer builds, handles first run (userData + schema + seed), and is signed or has the SmartScreen warning documented.',
          'Both uninstall paths behave: Keep preserves data and survives reinstall; Delete erases data after backup + double confirmation.',
          'A one-page handover guide covers start-up, the PostgreSQL prerequisite, the backup routine, and the uninstall choice.',
        ],
        technicalImplementation: [
          'Integrate all modules (counter, printing, bookings, reports, backup) and confirm first-run setup on a fresh machine.',
          'Build the installer (Project 1 config) with the uninstall prompt (Project 2 script) included.',
          'Decide signing vs unsigned; if unsigned, document the exact SmartScreen click-through.',
          'On a snapshotted clean VM, run the end-to-end checklist and both Keep and Delete uninstall paths.',
          'Write the one-page operator guide (start-up, prerequisite, daily backup, uninstall meaning) and a short "where next" list.',
        ],
        prompts: [
          {
            step: 1,
            label: 'End-to-end verification',
            outcome: 'A completed checklist proving the whole app works on a clean machine.',
            prompt:
              'Create a thorough end-to-end test checklist for Maranakatte Seva covering counter sale to receipt/print, a Yakshagana and an Annadhana booking with devotee details (name, gotra, nakshatra, phone) in INR, daily and Rangapooje (500+/day) reports, and backup/restore. It must be runnable by a non-developer on a clean Windows machine with PostgreSQL installed.',
          },
          {
            step: 2,
            label: 'Ship the installer',
            outcome: 'A final installer with the uninstall prompt, both paths VM-tested.',
            prompt:
              'Walk me through producing the final Maranakatte Seva installer that includes the keep/delete uninstall prompt, deciding between code signing and shipping unsigned (with documented SmartScreen steps), and a VM-based test plan that exercises both the Keep and Delete uninstall paths from a clean snapshot.',
          },
          {
            step: 3,
            label: 'Write the handover guide',
            outcome: 'A one-page, jargon-free operator guide for temple staff.',
            prompt:
              'Write a one-page handover guide for temple counter staff (non-technical) covering: the one-time PostgreSQL install, running the installer and the expected SmartScreen warning, that the app is offline with no login, a simple nightly backup routine and where the data lives, what the uninstall keep/delete prompt means, and a short "where to go next" (multi-counter, Kannada reports). Use plain, reassuring language.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm9-q1',
      q: 'Why does this course use electron-builder with an NSIS target rather than a portable exe for Maranakatte Seva?',
      options: [
        'NSIS produces a smaller file than any other format',
        'Only NSIS supports the custom uninstall scripting needed for the keep-or-delete-data prompt',
        'A portable exe cannot run an Electron app',
        'NSIS automatically bundles the PostgreSQL server',
      ],
      answer: 1,
    },
    {
      id: 'm9-q2',
      q: 'On a freshly installed machine, what must Maranakatte Seva do about its local PostgreSQL dependency?',
      options: [
        'Nothing — electron-builder bundles the PostgreSQL server inside the installer',
        'Connect to a cloud database instead',
        'Detect the local PostgreSQL on first run and guide the user to install it if missing, never crashing silently',
        'Refuse to start unless internet is available',
      ],
      answer: 2,
    },
    {
      id: 'm9-q3',
      q: 'Where does Maranakatte Seva\'s seva data live relative to the installed program, and why does it matter for uninstall?',
      options: [
        'Inside the program folder, so uninstalling always deletes it automatically',
        'In userData and the PostgreSQL database, separate from the program — so the data survives uninstall unless code deletes it',
        'In the Windows registry, which the uninstaller never touches',
        'In the cloud, so local uninstall is irrelevant',
      ],
      answer: 1,
    },
    {
      id: 'm9-q4',
      q: 'In the custom NSIS uninstall script, which macro is the correct hook for the keep-or-delete-data prompt?',
      options: [
        'customInstall, which runs during installation',
        'customUnInstall, which electron-builder runs during uninstall',
        'onGUIInit, which runs when the app window opens',
        'There is no hook; NSIS cannot be customised',
      ],
      answer: 1,
    },
    {
      id: 'm9-q5',
      q: 'When the operator chooses to DELETE everything during uninstall, what must the script remove to keep its promise?',
      options: [
        'Only the userData folder',
        'Only the PostgreSQL database',
        'Both the userData folder AND the local PostgreSQL database',
        'The program folder ($INSTDIR) only',
      ],
      answer: 2,
    },
    {
      id: 'm9-q6',
      q: 'What is the safest, most ethical way to handle the destructive Delete path for a temple\'s records?',
      options: [
        'Delete immediately on the first click to avoid confusing the user',
        'Confirm a second time (defaulting to No) and write an automatic backup before deleting, never erasing silently',
        'Delete the data but keep the program installed',
        'Skip confirmations because the user already chose Delete once',
      ],
      answer: 1,
    },
  ],
};
