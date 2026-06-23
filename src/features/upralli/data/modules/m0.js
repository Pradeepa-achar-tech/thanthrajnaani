// Module 0 — TypeScript, Node & Desktop App Foundations
// Gets an intermediate learner ready to build the offline "Upralli Seva" (ಉಪ್ರಳ್ಳಿ ಸೇವೆ) desktop app:
// Electron + React + TypeScript (electron-vite), Prisma ORM over a LOCAL PostgreSQL bundled via embedded-postgres.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m0 = {
  id: 'm0',
  title: 'TypeScript, Node & Desktop App Foundations',
  hours: 8,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Get ready to build the offline **Upralli Seva** register — a year-wise pooja/donor participation book for a village temple committee in coastal Karnataka (Kundapura region). Install the tooling (Node 20 LTS, VS Code, a learning Postgres), learn just-enough **TypeScript** (types, interfaces, unions, generics, strict null checks, `tsconfig`), and build the right mental model for an **offline Electron desktop app** — main vs renderer, Prisma, embedded-postgres, electron-builder. Everything you need before writing the real app.',
  sections: [
    {
      id: 'm0-s1',
      title: 'Setup & Tooling',
      topics: [
        {
          id: 'm0-t1',
          title: 'Install Node.js 20 LTS & npm; verify node -v / npm -v',
          explain:
            'Install the Node.js 20 LTS runtime (npm ships with it), then confirm both work by running `node -v` and `npm -v` in a fresh terminal.',
          analogy:
            'Picture the **Magane coordinator** opening the yearly register book before the pooja season. Before a single household is ticked off, the desk needs a working pen, a lamp, and the rate card laid out. **Node.js** is that whole working desk for a JavaScript/TypeScript developer — it lets your code run on the committee secretary\'s computer, outside any browser. Running `node -v` is like checking the lamp glows before the first name goes in.',
          theory:
            'A browser can run JavaScript, but you cannot build a desktop app inside a browser tab. **Node.js** is a program that runs JavaScript (and, after compiling, your TypeScript) directly on your computer — outside any browser. It is what lets the app open files, run Prisma against a database, and behave like a real installed program.\n\nWhen you install Node you also get **npm** (Node Package Manager) for free. `npm` downloads and manages the reusable libraries (**packages**) your app depends on — `electron`, `prisma`, `embedded-postgres`, `typescript`, and so on.\n\nAlways install the **LTS** (Long Term Support) line — version 20 is the stable, well-tested choice this course targets, not the experimental "Current" line. After installing, open a *brand-new* terminal so the PATH change is picked up, then verify:\n- `node -v` prints the Node version (e.g. `v20.11.0`)\n- `npm -v` prints the npm version (e.g. `10.2.4`)\n\nIf either says "not recognised", the install did not register on your PATH — reinstall and reopen the terminal.',
          whyItMatters:
            'Every JavaScript/TypeScript interview assumes you can build and run something on your own machine right now. Getting `node -v` and `npm -v` green on day one removes the classic "works on my machine" excuse. For **Upralli Seva**, Node is the engine that will compile the TypeScript, run Prisma migrations, and bundle the desktop app — nothing else works until this is in place.',
          steps: [
            'Go to `https://nodejs.org` and download the **20 LTS** installer for your operating system.',
            'Run the installer and accept the defaults (keep the "Add to PATH" option checked).',
            'Close every open terminal window so the new PATH takes effect.',
            'Open a fresh terminal and run `node -v` — confirm it prints `v20.x`.',
            'Run `npm -v` — confirm it also prints a version number.',
            'Run `node -e "console.log(\'Upralli register ready\')"` to prove Node can execute code.',
          ],
          code: `# In a fresh terminal, check both tools are installed:
node -v
# -> v20.11.0
npm -v
# -> 10.2.4

# Run a one-line program with Node:
node -e "console.log('Upralli Seva register ready')"
# -> Upralli Seva register ready`,
          pitfalls: [
            '**Installing from a random blog link.** You can get an outdated or tampered build. Fix: only download from the official `https://nodejs.org`.',
            '**Picking the "Current" version instead of 20 LTS.** Current has newer, less-stable features that break tutorials and some native deps. Fix: choose the 20 LTS download.',
            '**Checking the version in the same terminal you had open during install.** The old terminal does not know the new PATH. Fix: open a brand-new terminal first.',
            '**Assuming npm needs a separate install.** It does not — npm ships inside Node. Fix: install Node only; npm comes with it.',
            '**Having two Node versions fighting on the PATH.** `node -v` shows an unexpected number. Fix: uninstall old copies, or use a version manager like `nvm` / `fnm`.',
            '**Using a very old Node (16/18) for this course.** `embedded-postgres` and the electron tooling expect Node 20. Fix: confirm `node -v` shows `v20.x`.',
          ],
          tryIt:
            'Create a file `hello.ts` containing `console.log(\'Hari Om from the Upralli committee\')`, then run it later with `npx tsx hello.ts` (you will install `tsx` soon) and confirm the message prints.',
          takeaway:
            'Node.js runs JavaScript/compiled TypeScript on your computer and ships with npm — verify both with `node -v` and `npm -v` before doing anything else.',
        },
        {
          id: 'm0-t2',
          title: 'Install VS Code + ESLint, Prettier & Prisma extensions',
          explain:
            'Install Visual Studio Code, then add the ESLint, Prettier, and Prisma extensions to catch mistakes, auto-format, and get syntax help for the Prisma schema.',
          analogy:
            'A good editor is like a well-organised committee desk: the register, the pen, the rate card, and a sharp-eyed helper who quietly says "you wrote the rate as ₹40 but this column is ₹25" before the entry is inked. **VS Code** is the desk; **ESLint** is the helper catching errors; **Prettier** keeps every line neatly aligned; and the **Prisma** extension reads the schema so it highlights your `model Magane { ... }` correctly.',
          theory:
            'You *can* write code in Notepad, but a real editor makes you far faster and far less error-prone. **VS Code** is free, lightweight, and the standard editor for TypeScript work. It gives you colour-coded code, autocomplete driven by the TypeScript types, and an integrated terminal.\n\nThree extensions matter early:\n- **ESLint** underlines real problems as you type — an unused variable, a missing `await`, a misspelled name. Your safety net.\n- **Prettier** auto-formats your code (spacing, quotes, line breaks) on save, so the whole codebase looks consistent.\n- **Prisma** (by Prisma) gives syntax highlighting, autocomplete, and formatting for the `schema.prisma` file you will write later — without it, the schema is just plain grey text.\n\nInstall from the **Extensions** panel (`Ctrl+Shift+X`): search the name, click **Install**. To run Prettier on save, open Settings (`Ctrl+,`), search "format on save", and tick it. Because TypeScript ships its own language server, VS Code will also surface type errors inline as red squiggles — your first line of defence.',
          whyItMatters:
            'Interviewers notice clean, consistently formatted, type-checked code — it signals professionalism. ESLint and TypeScript catch dozens of bugs before you ever run **Upralli Seva**, and the Prisma extension makes editing the temple register schema (Maganes, Years, PoojaTypes) far less error-prone.',
          steps: [
            'Download VS Code from `https://code.visualstudio.com` and install it.',
            'Open the **Extensions** panel (`Ctrl+Shift+X`).',
            'Install **ESLint** (by Microsoft).',
            'Install **Prettier - Code formatter** (by `esbenp`).',
            'Install **Prisma** (by Prisma) for `.prisma` schema support.',
            'In Settings (`Ctrl+,`), search "format on save" and enable it; open a `.ts` file and confirm formatting works.',
          ],
          code: `// .vscode/settings.json — shared editor settings so the whole team works alike
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}`,
          pitfalls: [
            '**Installing the wrong Prettier.** There are copycats. Fix: install "Prettier - Code formatter" by `esbenp`.',
            '**Forgetting to enable format-on-save.** Prettier sits idle. Fix: tick "Format On Save" in Settings.',
            '**Two formatters fighting over `.prisma`.** The schema reformats oddly. Fix: set the Prisma extension as the formatter for `[prisma]` only.',
            '**Ignoring the red TypeScript squiggles.** They are real type errors that would crash at runtime. Fix: hover and read the message before running.',
            '**Editing files outside VS Code and expecting formatting.** Prettier only runs in the editor on save. Fix: keep edits in VS Code (or add a pre-commit hook later).',
            '**Loading heavy unrelated extensions early.** Startup lags and the TS server slows. Fix: install only ESLint, Prettier, and Prisma to start.',
          ],
          tryIt:
            'Write a small TypeScript function with deliberately ugly spacing and an unused variable, then save. Confirm Prettier reformats it and ESLint underlines the unused variable.',
          takeaway:
            'VS Code with ESLint, Prettier, and the Prisma extension is the standard, productive setup for a TypeScript + Prisma + Electron project.',
        },
        {
          id: 'm0-t3',
          title: 'Install PostgreSQL locally to learn SQL (the app bundles its own later)',
          explain:
            'Install PostgreSQL on your machine and connect with `psql` to learn SQL now — note that the shipped app will instead BUNDLE its own portable Postgres via `embedded-postgres`.',
          analogy:
            'A local Postgres you install now is a **practice register book** — the same kind of ledger the committee keeps, where you can scribble, list pages, and learn how rows and columns behave. The real **Upralli Seva** app will not ask the committee secretary to install a database at all; it carries its *own* register inside the installer (via `embedded-postgres`). But you, the builder, learn fastest by opening a real ledger by hand first.',
          theory:
            '**PostgreSQL** ("Postgres") is a powerful, free, open-source **relational database**. It stores data in tables of rows and columns and keeps it safe on disk. Installing one locally lets you learn SQL hands-on: `CREATE TABLE`, `INSERT`, `SELECT`, joins, and the `numeric` type for money.\n\nWhen you install Postgres you get a background **server** and **`psql`**, a terminal client. During install you set a password for the default `postgres` superuser — write it down. A few `psql` commands to know:\n- `\\l` — list databases\n- `\\c dbname` — connect to a database\n- `\\dt` — list tables\n- `\\q` — quit\n\n**Important distinction for this course:** the *real* Upralli Seva app does **not** rely on a Postgres you install. It bundles a small portable Postgres inside the installer using the **`embedded-postgres`** package, and stores its data under `%LOCALAPPDATA%\\\\UpralliSeva`. So the committee installs *one* program and gets a database for free, fully offline. The Postgres you install today is purely a learning sandbox so SQL is not a mystery when Prisma generates it for you.',
          whyItMatters:
            'Almost every backend interview involves SQL and a relational database, and Postgres is the most-loved choice in industry surveys. For **Upralli Seva**, understanding plain SQL makes Prisma far less magical — you will read the queries Prisma runs and reason about per-Magane and grand-total `numeric` money sums with confidence.',
          steps: [
            'Download PostgreSQL from `https://www.postgresql.org/download` and install it.',
            'During install, set and **record** a password for the `postgres` superuser.',
            'Open a fresh terminal and run `psql -U postgres` (enter the password).',
            'Create a learning database: `CREATE DATABASE upralli_learn;`',
            'Connect with `\\c upralli_learn`, create a tiny `pooja_type` table, and `SELECT` from it.',
            'Remember: this is for learning SQL only — the app will bundle its own Postgres later.',
          ],
          code: `-- Connect as the postgres superuser:
psql -U postgres

-- Inside psql, create a learning database:
CREATE DATABASE upralli_learn;

-- Switch into it:
\\c upralli_learn

-- A taste of SQL: a pooja-type column with a rate.
-- Money uses numeric (exact), never float:
CREATE TABLE pooja_type (
  id    serial PRIMARY KEY,
  name  text NOT NULL,          -- Kannada UTF-8, e.g. 'ಹೂವಿನ ಪೂಜೆ'
  rate  numeric(10,2) NOT NULL  -- ₹ rate
);

INSERT INTO pooja_type (name, rate) VALUES ('ಹೂವಿನ ಪೂಜೆ', 100.00);
INSERT INTO pooja_type (name, rate) VALUES ('ನವರಾತ್ರಿ ಪೂಜೆ', 250.00);
SELECT * FROM pooja_type;`,
          pitfalls: [
            '**Forgetting the `postgres` password set during install.** You cannot connect. Fix: record it safely; resetting it is painful.',
            '**Using `money` or `float` for rupees.** Both cause rounding errors. Fix: use `numeric(10,2)` for ₹ amounts (Prisma maps this to `Decimal`).',
            '**Thinking the app needs this installed Postgres.** It does not — it bundles its own. Fix: treat this purely as an SQL learning sandbox.',
            '**The Postgres service not running.** `psql` says connection refused. Fix: start the PostgreSQL service (usually auto-start).',
            '**Leaving off the semicolon in psql.** Your SQL never executes; psql waits. Fix: end statements with `;`.',
            '**Confusing a *server*, a *database*, and a *table*.** One server holds many databases; each holds many tables. Fix: keep the hierarchy clear.',
          ],
          tryIt:
            'Create the `upralli_learn` database, add the `pooja_type` table above with two Kannada pooja names and rates, then `SELECT name, rate FROM pooja_type;` and confirm the Kannada text round-trips correctly.',
          takeaway:
            'Install a local Postgres to *learn* SQL now; the shipped Upralli Seva app bundles its own Postgres via `embedded-postgres`, so users never install a database.',
        },
        {
          id: 'm0-t4',
          title: 'package.json: dependencies vs devDependencies and the real npm scripts',
          explain:
            'Every Node project has a `package.json` recording its name, packages, and named `npm` scripts; learn the dependency split and the dev/build/typecheck/package scripts the real app uses.',
          analogy:
            'Think of `package.json` as the committee\'s standing-orders sheet pinned at the register desk. It lists every supply the register needs and the standard procedures staff follow. `dependencies` are the supplies the running app needs every day (Prisma, the bundled Postgres); `devDependencies` are the back-office tools (electron-vite, TypeScript, electron-builder) the donor never sees but the builder uses to assemble and ship the book.',
          theory:
            'A **`package.json`** is the heart of any Node project. Create it with `npm init -y`. It records the project name, version, and which packages it needs.\n\nTwo kinds of dependency:\n- **`dependencies`** — packages the app needs to *run*. For Upralli Seva: `@prisma/client` (the generated query client) and `embedded-postgres` (the bundled DB) belong here.\n- **`devDependencies`** — packages needed only while *developing or building*, never shipped raw to the user. Examples: `electron`, `electron-vite`, `electron-builder`, `typescript`, `prisma` (the CLI), `tsx`, `eslint`, `prettier`. Install with `npm install --save-dev <pkg>`.\n\n**npm scripts** live under `"scripts"` — named shortcuts for long commands. The real app uses, roughly:\n- `"dev": "electron-vite dev"` — run the app in development with hot reload\n- `"build": "electron-vite build"` — compile main, preload, and renderer\n- `"typecheck": "tsc --noEmit -p tsconfig.node.json && tsc --noEmit -p tsconfig.web.json"` — type-check both halves without emitting files\n- `"package": "npm run build && electron-builder"` — produce the NSIS installer\n\nRunning `npm install` reads `package.json`, downloads packages into `node_modules`, and records exact versions in `package-lock.json`.',
          whyItMatters:
            'Interviewers expect you to read a `package.json` at a glance and know the dependency split. For **Upralli Seva** it keeps the shipped installer lean (build-only tools are excluded from the runtime), and `npm run dev` becomes the single command any teammate uses to start the app — while `npm run typecheck` guards both the Node and web TypeScript projects.',
          steps: [
            'In an empty folder, run `npm init -y` to create `package.json`.',
            'Install a runtime dependency: `npm install @prisma/client` (lands under `dependencies`).',
            'Install dev tools: `npm install --save-dev typescript tsx electron electron-vite electron-builder prisma`.',
            'Open `package.json` and read the two dependency blocks.',
            'Add the `dev`, `build`, `typecheck`, and `package` scripts shown below.',
            'Run `npm run` with no script name to list every script npm now knows.',
          ],
          code: `{
  "name": "upralli-seva",
  "version": "0.1.0",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "typecheck": "tsc --noEmit -p tsconfig.node.json && tsc --noEmit -p tsconfig.web.json",
    "package": "npm run build && electron-builder"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "embedded-postgres": "^17.0.0"
  },
  "devDependencies": {
    "electron": "^29.0.0",
    "electron-vite": "^2.0.0",
    "electron-builder": "^24.0.0",
    "prisma": "^5.0.0",
    "typescript": "^5.4.0",
    "tsx": "^4.0.0"
  }
}`,
          pitfalls: [
            '**Putting `electron` or `electron-builder` in `dependencies`.** They bloat or break the shipped app. Fix: use `--save-dev` for all build tooling.',
            '**Putting `@prisma/client` in devDependencies.** The running app needs it. Fix: the *client* is a runtime `dependency`; the `prisma` *CLI* is dev.',
            '**Committing `node_modules/`.** It is huge and rebuildable. Fix: add `node_modules/` to `.gitignore`.',
            '**Deleting `package-lock.json`.** You lose reproducible installs. Fix: keep and commit it.',
            '**Running a script with `npm scriptname` instead of `npm run scriptname`.** Only `start`/`test` skip `run`. Fix: use `npm run dev`.',
            '**Forgetting `npm install` after cloning.** No packages, nothing runs. Fix: run `npm install` first.',
          ],
          tryIt:
            'Create a folder, run `npm init -y`, add the four scripts above, install `typescript` and `tsx` as devDependencies, and run `npm run` (with no script) to list every script npm now knows about.',
          takeaway:
            '`package.json` declares the project: `dependencies` (Prisma client, embedded-postgres) run-time, `devDependencies` (electron-vite, electron-builder, tsc) build-time, plus the dev/build/typecheck/package scripts.',
        },
      ],
    },
    {
      id: 'm0-s2',
      title: 'Just-enough TypeScript',
      topics: [
        {
          id: 'm0-t5',
          title: 'Why TypeScript for a desktop app',
          explain:
            'TypeScript adds static types on top of JavaScript so shape mismatches across IPC and the database are caught while you type, not after the committee hits a bug.',
          analogy:
            'In the committee, the register has fixed columns — a household has a Kannada name, an optional mobile, an order number. If a clerk tries to write a phone number in the "pooja rate" column, a careful supervisor stops them. **TypeScript** is that supervisor for your code: it knows a `PersonEntry` has a `name: string` and `mobile: string | null`, and it refuses code that puts the wrong shape in the wrong place — before the app ever runs.',
          theory:
            '**TypeScript** is JavaScript plus a **type system**. You write the same code, but you also describe the *shape* of your data (`string`, `number`, an interface like `Magane`). A compiler (`tsc`) checks those shapes and reports mismatches, then strips the types away to produce plain JavaScript that Node and the browser run.\n\nIn a desktop app the payoff is large because data crosses boundaries:\n- The **renderer** (React) calls `window.api.listMaganes()`, which travels over **IPC** to the **main** process and back. If both sides agree on a shared type, a typo or a missing field is caught at compile time, not as a blank screen at the committee desk.\n- **Prisma** generates types from your schema, so a `PersonEntry` row is fully typed — autocomplete shows `name`, `mobile`, `order`, and the compiler flags `entry.naam` as a typo.\n\nTypeScript does not run in the browser or Node directly; it is *compiled* (or stripped by tools like `tsx`/electron-vite) into JavaScript first. The cost is a little ceremony; the benefit is whole classes of runtime bugs becoming red squiggles you fix in seconds.',
          whyItMatters:
            'TypeScript is now the default for serious front-end and Node work, and "why TypeScript?" is a standard interview question. For **Upralli Seva**, types are the glue that keeps the renderer, the IPC bridge, and Prisma agreeing on what a Magane, a PoojaType, or a Participation looks like — preventing silent shape bugs in money totals the committee actually relies on.',
          steps: [
            'Note that TypeScript = JavaScript + static types, compiled to JS.',
            'Identify the boundaries that benefit: renderer ↔ IPC ↔ main, and Prisma rows.',
            'See how a shared type catches a missing/renamed field at compile time.',
            'Recognise that the browser/Node never run `.ts` directly — it is compiled first.',
            'Run `npx tsc --noEmit` to type-check without producing output files.',
            'Accept the small ceremony for the large safety payoff.',
          ],
          code: `// A shared type used by BOTH the renderer and the main process.
// If either side drifts, tsc flags it before runtime.
export interface PersonEntry {
  id: number;
  name: string;        // combined Kannada name + address, e.g. 'ರಮೇಶ ಭಟ್, ಉಪ್ರಳ್ಳಿ'
  mobile: string | null;
  order: number;       // drag-orderable position in the register
}

// The renderer expects this exact shape back over IPC:
declare global {
  interface Window {
    api: {
      listEntries(maganeId: number): Promise<PersonEntry[]>;
    };
  }
}

// Misuse is caught at COMPILE time, not at the committee desk:
async function show(maganeId: number) {
  const entries = await window.api.listEntries(maganeId);
  console.log(entries[0].name);   // OK
  // console.log(entries[0].naam); // tsc error: Property 'naam' does not exist
}`,
          pitfalls: [
            '**Expecting `.ts` to run directly in Node.** It must be compiled or run via `tsx`/electron-vite. Fix: use the project scripts, not `node file.ts`.',
            '**Sprinkling `any` to silence errors.** It throws away the safety you are paying for. Fix: model the real shape with an interface.',
            '**Letting the renderer and main define the IPC shape separately.** They drift apart. Fix: share one exported type.',
            '**Believing types exist at runtime.** They are erased after compilation. Fix: validate untrusted input at runtime too if needed.',
            '**Skipping `npm run typecheck`.** Errors hide until they crash. Fix: run typecheck in CI and before packaging.',
            '**Treating TypeScript as a different language.** It is JS plus types. Fix: write normal JS, then add the types.',
          ],
          tryIt:
            'Write a `Magane` interface with `id: number`, `name: string` (Kannada), `coordinator: string`, and `mobiles: string[]`. Create one object that matches it and one that misspells a field, and watch `tsc --noEmit` flag the second.',
          takeaway:
            'TypeScript catches shape bugs across IPC and Prisma at compile time — its safety is exactly what a multi-process, database-backed desktop app needs.',
        },
        {
          id: 'm0-t6',
          title: 'Basic types & inference; the Decimal-vs-number money trap',
          explain:
            'Learn the primitive types (string, number, boolean, arrays) and TypeScript inference — and meet early the issue that money should be Prisma `Decimal`, not a JavaScript `number`.',
          analogy:
            'When the coordinator reads the rate card, a name is a name and a count is a count — you would never write a household\'s Kannada name where the pooja *rate* goes. The primitive types are those obvious column kinds. And just as you would never tear a ₹250 rate into "2.5 hundreds plus rounding", you must not trust a floating-point `number` to add up rupee rates exactly — that is the `Decimal` story we flag now and pay off later.',
          theory:
            'TypeScript\'s primitive types are the everyday ones:\n- **`string`** — text, `\'ಹೂವಿನ ಪೂಜೆ\'`\n- **`number`** — `100`, `2.5` (one numeric type, floating-point under the hood)\n- **`boolean`** — `true` / `false`\n- **arrays** — `string[]` or `Array<string>` for a list of the same type\n\n**Inference** means you often do not write the type: `const rate = 100;` infers `number`; `const names = [\'a\', \'b\'];` infers `string[]`. Annotate explicitly at boundaries (function parameters, exported shapes) where clarity matters; let inference handle obvious locals.\n\n**The money trap (foreshadowed):** JavaScript `number` is floating-point, so `0.1 + 0.2` is `0.30000000000000004`. For temple-register rupees — rates summed across ticked pooja columns, per-Magane and grand totals — that drift is unacceptable. Postgres stores these as `numeric`, and **Prisma surfaces them as `Decimal`** (from `@prisma/client`/decimal.js), an exact type. So in the real app, a `rate` is a `Prisma.Decimal`, not a `number`; you do exact `.plus()` arithmetic and only convert to a display string at the end. For now, just know: *money is `Decimal`, not `number`*. We cover the full pattern when we wire Prisma.',
          whyItMatters:
            '"Why is 0.1 + 0.2 not 0.3?" is a classic interview question, and choosing the right money type is a senior instinct. For **Upralli Seva**, a one-paisa drift multiplied across every household and pooja column in a Magane becomes a real total the committee disputes — so flagging `Decimal` now prevents a painful rewrite later.',
          steps: [
            'Declare a `string`, a `number`, and a `boolean` and let inference type them.',
            'Declare a `string[]` of pooja names and a `number[]` of rates.',
            'Type `console.log(0.1 + 0.2)` and observe the floating-point surprise.',
            'Annotate a function parameter explicitly: `function rate(name: string): number`.',
            'Note the rule: money will be Prisma `Decimal`, not `number`.',
            'Resist storing a rupee rate as a `number` field you do arithmetic on.',
          ],
          code: `// Inference: no annotations needed for obvious locals
const poojaName = 'ನವರಾತ್ರಿ ಪೂಜೆ'; // inferred: string
const ticked = true;                // inferred: boolean
const poojaNames = ['ಹೂವಿನ ಪೂಜೆ', 'ಕಾರ್ತಿಕ ಪೂಜೆ']; // inferred: string[]

// The float trap — never use plain number for money:
console.log(0.1 + 0.2); // 0.30000000000000004

// Annotate at boundaries for clarity:
function describe(name: string, mobileCount: number): string {
  return \`\${name} has \${mobileCount} mobile(s)\`;
}

// FORESHADOW: in the real app a pooja rate is a Prisma Decimal, not a number.
// import { Prisma } from '@prisma/client';
// const rate: Prisma.Decimal = new Prisma.Decimal('250.00'); // exact, no float drift`,
          pitfalls: [
            '**Adding rupee rates as plain `number`s.** Float drift gives a total that is off by a paisa. Fix: use Prisma `Decimal` for money (covered later).',
            '**Over-annotating obvious locals.** `const n: number = 5` is noise. Fix: let inference handle simple locals; annotate boundaries.',
            '**Using `==` to compare values.** `\'40\' == 40` is `true`, hiding bugs. Fix: use `===` (and let types prevent the mismatch).',
            '**Calling `.toFixed()` then doing more maths on the result.** It returns a `string`. Fix: format only at the very end, for display.',
            '**Assuming `number` is an integer type.** It is floating-point. Fix: for exact money use `Decimal`; for counts a `number` is fine.',
            '**Typing an array as `any[]`.** You lose element checking. Fix: use `string[]`, `number[]`, or a specific interface array.',
          ],
          tryIt:
            'Declare a `number[]` of three pooja rates and reduce it to a sum with `number` for now; then write a one-line comment explaining why the *real* app would use `Prisma.Decimal` instead.',
          takeaway:
            'Use the primitive types with inference, annotate at boundaries — and remember money is Prisma `Decimal`, never a floating-point `number`.',
        },
        {
          id: 'm0-t7',
          title: 'Interfaces & type aliases: model a Magane and a PersonEntry',
          explain:
            'Use `interface` (or a `type` alias) to describe the exact shape of a domain object — here a Magane sub-region and a PersonEntry household.',
          analogy:
            'An **interface** is the printed column-header row at the top of the register page: it declares that every Magane page must have a Kannada name, a coordinator, and a list of mobiles — no more, no less. Once the header is fixed, every page below it must conform, and anyone reading the book knows exactly what to expect on each line.',
          theory:
            'An **interface** describes the shape of an object — which fields it has and their types:\n```\ninterface Magane {\n  id: number;\n  name: string;        // Kannada\n  coordinator: string;\n  mobiles: string[];\n}\n```\nAny object you label as a `Magane` must have those fields with those types. A **type alias** does almost the same with `type Magane = { ... }`; the practical guidance: use `interface` for object shapes you might extend, and `type` for unions, primitives, or composed shapes (you will meet unions next topic).\n\nInterfaces compose: one can reference another. A `PersonEntry` household belongs to a Magane, and you model that with a foreign-key field:\n```\ninterface PersonEntry {\n  id: number;\n  maganeId: number;\n  name: string;        // combined Kannada name + address\n  mobile: string | null;\n  order: number;\n}\n```\nThese are exactly the shapes Prisma will later generate for you from the schema — writing them by hand now builds the mental model. Interfaces are **erased at compile time**: they cost nothing at runtime; they exist only to guide you and the compiler.',
          whyItMatters:
            'Modelling domain objects with interfaces is the daily work of a TypeScript developer, and interviewers ask you to "type this object". For **Upralli Seva**, the `Magane`, `Year`, `PoojaType`, `PersonEntry`, and `Participation` interfaces are the shared vocabulary the renderer, IPC, and Prisma all speak — get them right and the whole app lines up.',
          steps: [
            'Write a `Magane` interface with `id`, `name` (Kannada), `coordinator`, `mobiles: string[]`.',
            'Write a `PersonEntry` interface that references its Magane via `maganeId`.',
            'Create objects that satisfy each interface.',
            'Try omitting a required field and read the compiler error.',
            'Mark the optional `mobile` as `string | null` (a genuine empty case).',
            'Note these shapes mirror what Prisma will generate later.',
          ],
          code: `// One sub-region of the region:
interface Magane {
  id: number;
  name: string;          // Kannada, e.g. 'ಉಪ್ರಳ್ಳಿ ಮಗಣೆ'
  coordinator: string;   // Kannada coordinator name
  mobiles: string[];     // coordinator's contact numbers
}

// One household entry in the register, belonging to a Magane:
interface PersonEntry {
  id: number;
  maganeId: number;      // links back to its Magane
  name: string;          // combined Kannada name + address
  mobile: string | null; // optional contact (null when unknown)
  order: number;         // drag-orderable position
}

const magane: Magane = {
  id: 1,
  name: 'ಉಪ್ರಳ್ಳಿ ಮಗಣೆ',
  coordinator: 'ರಮೇಶ ಭಟ್',
  mobiles: ['9844000000'],
};

const entry: PersonEntry = {
  id: 10, maganeId: 1, name: 'ಸುರೇಶ ಶೆಟ್ಟಿ, ಬೈಂದೂರು', mobile: null, order: 1,
};`,
          pitfalls: [
            '**Forgetting a required field.** The object literal errors. Fix: add the field, or mark it optional with `?` if it truly is.',
            '**Using `any` instead of an interface.** You lose all checking. Fix: declare the real shape once and reuse it.',
            '**Confusing `interface` and a runtime class.** Interfaces vanish at compile time and have no methods/`new`. Fix: use them for shape only.',
            '**Duplicating the same shape in many files.** They drift. Fix: define it once and `export`/`import` it.',
            '**Modelling a link as a nested object when you only have an id.** Fix: store `maganeId: number` for the foreign key, mirror Prisma later.',
            '**Marking everything optional "to be safe".** That hides missing-data bugs. Fix: only `?`/`| null` the fields that are genuinely optional, like `mobile`.',
          ],
          tryIt:
            'Add a `Year` interface with `id: number`, `label: string` (e.g. \'2025-26\'), and `locked: boolean`, then create a locked year object that satisfies it.',
          takeaway:
            'Interfaces (and `type` aliases) describe object shapes; model `Magane` and `PersonEntry` with them to build the shared vocabulary the whole app uses.',
        },
        {
          id: 'm0-t8',
          title: 'Union types, enums-as-unions, and null vs undefined',
          explain:
            'A union type allows one of several types/values; a string-literal union is the lightweight "enum"; and strict null checks force you to handle `null`/`undefined` deliberately.',
          analogy:
            'Some register columns accept only a fixed set of marks — a pooja column is either ticked or not; a year is either *open* or *locked*. A **union type** is that closed list of allowed marks. And the empty "mobile" cell is a real state, not an oversight: a household may have *no* mobile on file. Strict null checks make the code admit "this cell can be empty" out loud, so you never assume a number is there when it is not.',
          theory:
            'A **union type** says a value is *one of* several types or literals, written with `|`:\n```\ntype YearStatus = \'open\' | \'locked\';\nlet status: YearStatus = \'open\'; // \'draft\' would be a compile error\n```\nThis **string-literal union** is the idiomatic lightweight "enum" in TypeScript — clearer than a numeric `enum` for most cases, and it survives as plain strings at runtime.\n\nUnions also combine with `null`:\n```\nmobile: string | null; // either a number string, or explicitly null\n```\n**`null` vs `undefined`:** `null` means "intentionally empty" (we know there is no mobile); `undefined` means "no value provided / not set". With **strict null checks** on (`"strict": true` in `tsconfig`), TypeScript will *not* let you call `.length` on a `string | null` until you narrow it:\n```\nif (entry.mobile !== null) {\n  console.log(entry.mobile.length); // safe inside the guard\n}\n```\nThis "narrowing" is the everyday way you prove to the compiler a value is present before you use it — and it eliminates the most common runtime crash, "cannot read property of null".',
          whyItMatters:
            'Strict null handling is a top interview and code-review topic, and string-literal unions are how modern TypeScript models fixed choices. For **Upralli Seva**, a `Year` is `\'open\' | \'locked\'`, a household `mobile` is `string | null`, and a participation tick is a `boolean` — getting these unions and null guards right is what stops the register screen from crashing on a household with no phone number.',
          steps: [
            'Define a string-literal union `type YearStatus = \'open\' | \'locked\'`.',
            'Assign a valid value and try an invalid one to see the error.',
            'Type a field as `string | null` and try to use it without a guard.',
            'Add an `if (x !== null)` guard and use the value safely inside it.',
            'Contrast `null` (intentionally empty) with `undefined` (not set).',
            'Confirm `"strict": true` is on so these checks are enforced.',
          ],
          code: `// String-literal union = lightweight enum (clear, runtime-friendly)
type YearStatus = 'open' | 'locked';

interface Year {
  id: number;
  label: string;        // '2025-26'
  status: YearStatus;   // only 'open' or 'locked' allowed
}

const y: Year = { id: 1, label: '2025-26', status: 'open' };
// const bad: Year = { id: 2, label: 'x', status: 'draft' }; // error: not in union

// null means "intentionally no mobile on file":
function callLabel(mobile: string | null): string {
  if (mobile === null) {
    return 'no mobile';          // narrowed: handle the empty case
  }
  return 'call ' + mobile.length + ' digits'; // safe: mobile is string here
}

console.log(callLabel(null));         // 'no mobile'
console.log(callLabel('9844000000')); // 'call 10 digits'`,
          pitfalls: [
            '**Using a value not in the union.** `status = \'draft\'` errors. Fix: stick to the declared literals, or widen the union deliberately.',
            '**Calling methods on a `string | null` without narrowing.** "Object is possibly null". Fix: guard with `if (x !== null)` first.',
            '**Mixing `null` and `undefined` carelessly.** They mean different things. Fix: pick one convention (`null` for "explicitly empty") and stay consistent.',
            '**Turning `strict` off to silence null errors.** You lose the protection app-wide. Fix: keep `strict: true` and handle the cases.',
            '**Reaching for numeric `enum` out of habit.** It adds runtime weight and footguns. Fix: prefer string-literal unions.',
            '**Using `==` null checks loosely.** `x == null` matches both null and undefined — sometimes intended, sometimes not. Fix: be explicit with `=== null`.',
          ],
          tryIt:
            'Write a `type PoojaTick = boolean` participation and a function `summary(mobile: string | null, status: YearStatus)` that returns a sentence, handling the null mobile and switching on the two statuses.',
          takeaway:
            'Union types model fixed choices (`\'open\' | \'locked\'`), `null` marks intentionally-empty cells, and strict null checks force you to narrow before using a possibly-empty value.',
        },
        {
          id: 'm0-t9',
          title: 'Generics at a beginner level: Promise<T> and Array<T>',
          explain:
            'A generic is a type with a "fill-in-the-blank" parameter — `Array<T>` is an array *of T*, `Promise<T>` is a future value *of T* — enough to read Prisma and React types.',
          analogy:
            'Think of a labelled storage box at the committee office: the *box* design is always the same, but you stamp it with what it holds — "box of **PersonEntry** pages" or "box of **Magane** sheets". The generic `Array<T>` is the box; the `T` you stamp on it (`Array<PersonEntry>`) says what is inside. You reuse one box design for every kind of content.',
          theory:
            'A **generic** is a type that takes another type as a parameter, written in angle brackets. You have already used them:\n- **`Array<T>`** — a list of `T`. `Array<string>` is the same as `string[]`; `Array<PersonEntry>` is a list of household entries.\n- **`Promise<T>`** — a value of type `T` that arrives later. `Promise<Magane[]>` is "a list of Maganes, eventually".\n\nGenerics let one definition work for many types without losing safety. When you write a function that returns a Promise of entries, you type it `Promise<PersonEntry[]>`, and TypeScript knows that after `await`, you hold a `PersonEntry[]` — autocomplete and checking flow through.\n\nYou mostly *read* generics rather than author them at this level, because the tools you use are generic:\n- **Prisma**: `prisma.personEntry.findMany()` returns `Promise<PersonEntry[]>` automatically.\n- **React**: `useState<string>(\'\')` ties the state to a type; `useQuery<Magane[]>(...)` (TanStack Query) types the fetched data.\n\nKnowing that `<T>` means "fill in the type here" is enough to read every Prisma, React, and TanStack signature you will meet in this app.',
          whyItMatters:
            'Generics appear in nearly every modern TypeScript signature, and "what is `Promise<T>`?" is a common interview probe. For **Upralli Seva**, every Prisma call returns a `Promise<Something[]>` and every React hook is generic — reading these correctly is the difference between fighting the types and flowing with them.',
          steps: [
            'Recognise `Array<T>` and `string[]` as two spellings of the same thing.',
            'Type a list of entries as `PersonEntry[]` (i.e. `Array<PersonEntry>`).',
            'Type an async function\'s return as `Promise<PersonEntry[]>`.',
            '`await` it and confirm the result is a `PersonEntry[]` (autocomplete works).',
            'Read a Prisma-style signature returning `Promise<Magane[]>`.',
            'Note React/TanStack hooks take a `<T>` you usually let infer.',
          ],
          code: `interface PersonEntry { id: number; name: string; order: number; }

// Array<T>: a list of a specific type
const entries: Array<PersonEntry> = [
  { id: 1, name: 'ಸುರೇಶ ಶೆಟ್ಟಿ', order: 1 },
];
const sameThing: PersonEntry[] = entries; // identical type

// Promise<T>: a future value of a specific type
async function listEntries(maganeId: number): Promise<PersonEntry[]> {
  // (later, this body becomes: return prisma.personEntry.findMany({ where: { maganeId } }))
  return entries;
}

async function main() {
  const result = await listEntries(1); // result is PersonEntry[]
  console.log(result[0].name);         // autocomplete + checking flow through
}`,
          pitfalls: [
            '**Writing `Promise` without its `<T>`.** You lose the resolved type. Fix: always parameterise, e.g. `Promise<Magane[]>`.',
            '**Confusing `Array<T>` with `Array(T)`.** Angle brackets are types, parentheses are a constructor call. Fix: use `<>` for the type.',
            '**Forgetting that `await` unwraps the `T` from `Promise<T>`.** You then treat a value as a promise. Fix: `await` first, then use the value.',
            '**Annotating `any` where a generic would carry the type.** Fix: pass the real type so checking survives, e.g. `useState<string>`.',
            '**Trying to author complex generics too early.** Reading them is enough now. Fix: lean on Prisma/React inference; learn authoring later.',
            '**Assuming `T[]` and `Array<T>` differ.** They are identical. Fix: use whichever reads better; be consistent.',
          ],
          tryIt:
            'Type a function `firstName(entries: PersonEntry[]): string | undefined` that returns the `name` of the first entry (or `undefined` if empty), then call it and handle the possibly-undefined result.',
          takeaway:
            'A generic `<T>` is a fill-in-the-blank type; `Array<T>` lists T and `Promise<T>` resolves to T — enough to read every Prisma and React signature in the app.',
        },
        {
          id: 'm0-t10',
          title: 'tsconfig basics & tsc --noEmit typecheck (node + web configs)',
          explain:
            'A `tsconfig.json` configures the TypeScript compiler; `tsc --noEmit` type-checks without producing output, and the real app keeps separate node and web configs.',
          analogy:
            'The committee runs two desks with slightly different rules: the back-office desk (the main process, talking to the database) and the public counter desk (the renderer the donor sees). Each desk follows its own standing-orders sheet. The two **tsconfig** files are those two rule sheets — one for the Node side, one for the web/React side — so each half is checked against the right environment.',
          theory:
            'A **`tsconfig.json`** tells `tsc` how to compile: which files to include, which language features to target, and how strict to be. The key options:\n- **`"strict": true`** — turns on all the safety checks (including the strict null checks from the union topic). Always on.\n- **`"target"` / `"module"`** — which JS version and module system to emit.\n- **`"noEmit": true`** — check types but do *not* write `.js` files (because electron-vite/tsx handle the actual building).\n\n**`tsc --noEmit`** is therefore your pure *type-check*: it reports every type error and produces nothing. That is exactly what the `npm run typecheck` script runs.\n\nWhy **two** configs? An Electron app has two different runtimes:\n- **`tsconfig.node.json`** — for the **main** and **preload** code (Node environment, has Node globals, talks to Prisma).\n- **`tsconfig.web.json`** — for the **renderer** (browser/DOM environment, ESM, React/JSX, no Node globals).\nThey often share a base `tsconfig.json` via `"extends"`, then each sets its own `lib`, `module`, and included folders. Checking both is why the real `typecheck` script runs `tsc --noEmit` twice, once per config.',
          whyItMatters:
            'Reading and tweaking a `tsconfig` is everyday TypeScript work, and "what does `strict` do?" comes up in interviews. For **Upralli Seva**, the split node/web configs are what let the compiler correctly check that the renderer never assumes Node globals and the main process never assumes the DOM — catching boundary mistakes before they ship.',
          steps: [
            'Create a base `tsconfig.json` with `"strict": true` and `"noEmit": true`.',
            'Create `tsconfig.node.json` that `extends` the base for main/preload.',
            'Create `tsconfig.web.json` that `extends` the base for the renderer (DOM + JSX).',
            'Run `npx tsc --noEmit -p tsconfig.node.json` to check the Node side.',
            'Run `npx tsc --noEmit -p tsconfig.web.json` to check the web side.',
            'Wire both into the `typecheck` npm script with `&&`.',
          ],
          code: `// tsconfig.json (shared base)
{
  "compilerOptions": {
    "strict": true,        // all safety checks, incl. strict null
    "noEmit": true,        // type-check only; vite/tsx build the JS
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler"
  }
}

// tsconfig.node.json — the main + preload (Node) side
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "module": "ESNext", "lib": ["ES2022"] },
  "include": ["src/main/**/*.ts", "src/preload/**/*.ts"]
}

// tsconfig.web.json — the renderer (browser/React) side
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "lib": ["ES2022", "DOM"], "jsx": "react-jsx" },
  "include": ["src/renderer/**/*.ts", "src/renderer/**/*.tsx"]
}

// Then: tsc --noEmit -p tsconfig.node.json && tsc --noEmit -p tsconfig.web.json`,
          pitfalls: [
            '**Leaving `strict` off.** Null and `any` bugs slip through. Fix: keep `"strict": true` everywhere.',
            '**One config for both halves.** The renderer wrongly gets Node globals (or vice versa). Fix: split into node and web configs.',
            '**Forgetting `noEmit` and letting `tsc` write stray `.js`.** They clutter and confuse the build. Fix: set `"noEmit": true`; let vite/tsx build.',
            '**Not pointing `tsc` at a config with `-p`.** It picks the wrong files. Fix: pass `-p tsconfig.node.json` / `-p tsconfig.web.json`.',
            '**Including the wrong folders.** Files go unchecked or are double-checked. Fix: scope `include` to the right `src/` subfolders.',
            '**Skipping the renderer typecheck because "it compiles in vite".** Vite may strip types without checking them. Fix: run `tsc --noEmit` for real type safety.',
          ],
          tryIt:
            'Create a base `tsconfig.json` plus `tsconfig.node.json` and `tsconfig.web.json` that extend it, add a deliberate type error in a renderer file, and confirm `tsc --noEmit -p tsconfig.web.json` reports it.',
          takeaway:
            '`tsconfig.json` configures the compiler with `strict` on; `tsc --noEmit` is a pure type-check; the app keeps separate node and web configs so each runtime is checked correctly.',
        },
      ],
    },
    {
      id: 'm0-s3',
      title: 'Why a Desktop App',
      topics: [
        {
          id: 'm0-t11',
          title: 'Web app vs offline desktop app — why the committee needs offline + local data',
          explain:
            'A web app runs in a browser and needs a server (usually online); an offline desktop app installs and runs fully on the local machine, which is what a village committee with patchy internet needs.',
          analogy:
            'A web app is like updating the temple register through a clerk in a distant town over the phone — fine until the monsoon cuts the line to Kundapura, and then no household can be ticked off. An **offline desktop app** is the bound register physically on the committee table: it keeps working through every power flicker and dead signal, because everything it needs is right there.',
          theory:
            'A **web app** lives on a server and you reach it through a browser. It is easy to update centrally, but it usually depends on a working internet connection and a hosted backend. If the connection drops, the app often stops working, and the data lives on someone else\'s server.\n\nAn **offline desktop app** installs on the computer and runs locally. Its code, its window, and — crucially for us — its **database** all live on that one machine. No internet required.\n\nFor a village temple committee in coastal Karnataka, connectivity is patchy, especially in the monsoon, and the committee wants its donor and participation records to stay *theirs*. So **Upralli Seva** is built **offline-first**: a desktop app whose **local PostgreSQL** lives under `%LOCALAPPDATA%\\\\UpralliSeva`, bundled inside the installer. Benefits:\n- Works with zero internet.\n- Fast — no network round-trip to tick a household or sum a Magane.\n- Privacy — donor names, mobiles, and contributions never leave the committee\'s computer.\nThe trade-off is that backups and updates are the committee\'s responsibility, which the app handles thoughtfully (export, and a keep-or-delete-data uninstaller later in the course).',
          whyItMatters:
            'Choosing the right architecture for real constraints is a senior instinct interviewers probe ("why not just a website?"). For **Upralli Seva**, "offline-first desktop with local data" is the entire justification: a website would be useless the moment the signal drops while the coordinator is updating the year\'s register.',
          steps: [
            'List the committee\'s constraints: patchy internet, data privacy, speed.',
            'Ask: would a browser-only web app keep working with no internet? (No.)',
            'Conclude that a locally installed desktop app fits.',
            'Note the database must also be local (bundled) for true offline use.',
            'Identify the trade-off: backups/updates become local responsibilities.',
            'Decide the stack: Electron desktop + bundled local PostgreSQL via embedded-postgres.',
          ],
          code: `// A thought-experiment, not running code:
// Web app flow (needs internet for every action):
//   Browser  ->  (internet)  ->  Server  ->  Cloud DB
//   If the signal drops at the temple, the whole chain breaks.

// Upralli Seva flow (fully local, offline-first):
//   Electron window  ->  Node main process (Prisma)  ->  bundled local PostgreSQL
//   Data lives under %LOCALAPPDATA%\\UpralliSeva — no internet required.

const needsInternetToTickHousehold = false; // by design
console.log(needsInternetToTickHousehold);   // false`,
          pitfalls: [
            '**Assuming everywhere has reliable internet.** Rural/coastal committees often do not. Fix: design offline-first.',
            '**Putting donor data in the cloud "for convenience".** It raises privacy and dependency concerns. Fix: keep data local under %LOCALAPPDATA%.',
            '**Forgetting a local app still needs backups.** Local-only means *the committee* owns backup. Fix: plan an export/backup feature.',
            '**Believing desktop apps cannot be modern.** Electron uses React — same web skills. Fix: you get web UI *and* offline.',
            '**Overlooking update distribution.** No server means you ship installers. Fix: plan electron-builder NSIS installers (later).',
            '**Confusing "desktop" with "no database".** Desktop apps still need real storage. Fix: bundle a local Postgres.',
          ],
          tryIt:
            'Write a short note listing three reasons the Upralli Seva committee must work offline, and one trade-off the committee accepts by keeping all data local.',
          takeaway:
            'An offline desktop app with a bundled local database keeps a patchy-internet village committee working — that offline-first, data-stays-local need is why this is not a website.',
        },
        {
          id: 'm0-t12',
          title: 'What is Electron — main vs renderer at a glance',
          explain:
            'Electron builds cross-platform desktop apps from web tech by pairing a Chromium window (renderer) with a Node.js backend (main); the main process has system/database access, the renderer draws the UI.',
          analogy:
            'Electron is the committee office and its public counter under one roof. The **main process** is the back office where the master register and the cash box live — only it can open the database and the printer. The **renderer** is the counter window the coordinator interacts with — friendly and visible, but it cannot reach into the back office directly; it passes requests through. One building, two rooms, clear rules.',
          theory:
            '**Electron** is a framework for building desktop apps with web technologies. The same HTML, CSS, and React you would use for a website become a real installable Windows/Mac/Linux app. VS Code, Slack, and WhatsApp Desktop are Electron apps.\n\nElectron bundles two halves:\n- **Main process** — exactly one, plain **Node.js**. It creates windows, controls the app lifecycle, and has full system access: the file system, the bundled **PostgreSQL** (via Prisma), the printer. All your Prisma queries live here.\n- **Renderer process** — one per window, a **Chromium** page running your **React** UI. It draws the year selector, the Magane list, the pooja-column grid, the ₹ totals. For security it runs *without* direct Node or database access.\n\nThe two talk through **IPC** (Inter-Process Communication): the renderer asks ("list this Magane\'s entries"), the main process does the privileged Prisma work and sends the result back. You will wire this safely with a **preload** script and `contextBridge` exposing a typed `window.api` (a later module). The mental model to lock in now: **UI in the renderer, all data and system work in the main process — the window never touches the database directly.**',
          whyItMatters:
            'The main/renderer split — and *why* it exists for security — is the single most important Electron interview topic. For **Upralli Seva** it is structural: keeping all Prisma and file access in main, with the renderer only sending typed requests, is what keeps donor data safe and the app maintainable.',
          steps: [
            'Note the two halves: Chromium renderer (UI) and Node main (system/DB).',
            'List familiar Electron apps (VS Code, Slack) to make it concrete.',
            'Understand a plain web page cannot reach the disk or DB, but main can.',
            'Map it to Upralli Seva: React draws screens, Prisma in main reaches Postgres.',
            'Recognise the two communicate via IPC, wired through a preload bridge.',
            'Lock in the rule: UI in renderer, data/system work in main.',
          ],
          code: `// MAIN process (Node) — has Prisma/DB access. src/main/index.ts (conceptual)
import { app, BrowserWindow, ipcMain } from 'electron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function createWindow() {
  const win = new BrowserWindow({ width: 1100, height: 750 });
  win.loadFile('renderer/index.html'); // Chromium renders the React UI
}

// The renderer asks; main does the privileged Prisma work:
ipcMain.handle('entries:list', async (_e, maganeId: number) => {
  return prisma.personEntry.findMany({ where: { maganeId }, orderBy: { order: 'asc' } });
});

app.whenReady().then(createWindow);

// RENDERER (React) — NO direct DB. It only asks via the typed bridge:
// const entries = await window.api.listEntries(maganeId); // wired by preload, later`,
          pitfalls: [
            '**Doing database work in the renderer.** Insecure and usually impossible under proper settings. Fix: keep Prisma in main.',
            '**Thinking there can be many main processes.** There is exactly one. Fix: one main, many renderers.',
            '**Calling Node/Prisma APIs directly from React.** With secure settings they are not exposed. Fix: go through IPC.',
            '**Blocking the main process with heavy synchronous work.** Every window freezes. Fix: keep main-process work async.',
            '**Forgetting renderers are sandboxed browser pages.** They cannot open files. Fix: request such work from main via IPC.',
            '**Mixing UI logic into main.** It muddies the design. Fix: UI in renderer, data/system in main.',
          ],
          tryIt:
            'In two sentences, explain to a temple trustee why the same kind of screen they see on a website can also save data and print the year\'s register locally — naming the main process and the renderer.',
          takeaway:
            'Electron fuses a Chromium renderer (UI) with a Node main process (system + Prisma); keep UI in the renderer and all data work in main, bridged by IPC.',
        },
        {
          id: 'm0-t13',
          title: 'The toolchain map: electron-vite, Prisma, embedded-postgres, electron-builder',
          explain:
            'Four tools do four jobs: electron-vite builds and runs the app, Prisma is the ORM/migrations, embedded-postgres bundles the database, and electron-builder makes the installer.',
          analogy:
            'Setting up the committee\'s register involves four helpers: one who prints and binds the book quickly each day (**electron-vite**), one who knows the exact column layout and how to add a new page-type safely (**Prisma**), one who tucks a ready-made blank ledger right inside the welcome kit so the committee needs nothing else (**embedded-postgres**), and one who wraps the whole kit into a single box the committee can install (**electron-builder**).',
          theory:
            'Four tools form the spine of **Upralli Seva**; knowing what each *does* keeps later modules from feeling like magic:\n\n- **electron-vite** — the build tool and dev server. `electron-vite dev` runs the app with hot reload; `electron-vite build` compiles the three parts (main, preload, renderer) from TypeScript into the JavaScript Electron actually runs. It replaces a pile of hand-rolled config.\n\n- **Prisma** — the **ORM** (Object-Relational Mapper) and migration tool. You describe your tables in a `schema.prisma` (models `Magane`, `Year`, `PoojaType`, `PersonEntry`, `Participation`), run `prisma migrate` to create/evolve the database, and call a fully-typed `prisma.personEntry.findMany()` instead of writing raw SQL. It generates the TypeScript types for free.\n\n- **embedded-postgres** — bundles a small, portable PostgreSQL *inside the app*. At first launch the main process starts this private Postgres against a data folder under `%LOCALAPPDATA%\\\\UpralliSeva`, so the committee installs one program and gets a real database — no separate Postgres install, fully offline.\n\n- **electron-builder** — packages everything into a distributable **NSIS** installer for Windows (the `.exe` the committee double-clicks), including the bundled Postgres and the app code. It needs `asar: false` so the native Postgres binaries stay usable.\n\nTogether: electron-vite *builds*, Prisma *talks to* the database, embedded-postgres *is* the bundled database, electron-builder *ships* it all.',
          whyItMatters:
            'Being able to name each tool\'s responsibility is exactly the "explain your stack" question interviewers ask, and it is the map you will navigate for the rest of the course. For **Upralli Seva**, this division of labour is what makes a single double-click installer carry a full offline database — the project\'s headline feature.',
          steps: [
            'Match each tool to its one job (build / ORM / bundled DB / installer).',
            'Note electron-vite produces main, preload, and renderer bundles.',
            'Note Prisma owns the schema, migrations, and typed queries.',
            'Note embedded-postgres provides the database inside the installer.',
            'Note electron-builder produces the NSIS installer with `asar: false`.',
            'Sketch the flow: dev with electron-vite → migrate with Prisma → package with electron-builder.',
          ],
          code: `// How the four tools show up across the project (conceptual overview):

// 1) electron-vite — package.json scripts build & run the app
//    "dev": "electron-vite dev",  "build": "electron-vite build"

// 2) Prisma — schema.prisma defines the tables (ORM + migrations)
//    model Magane { id Int @id @default(autoincrement()) name String /* ... */ }

// 3) embedded-postgres — main process starts a bundled Postgres at first launch
import EmbeddedPostgres from 'embedded-postgres';
// const pg = new EmbeddedPostgres({ databaseDir: appDataDir, port: 5433 });
// await pg.initialise(); await pg.start();   // a private, offline Postgres

// 4) electron-builder — electron-builder.yml ships the NSIS installer
//    nsis: { oneClick: false }
//    asar: false   // keep native Postgres binaries usable`,
          pitfalls: [
            '**Confusing Prisma (ORM) with the database itself.** Prisma *talks to* Postgres; it is not Postgres. Fix: Prisma = client/migrations, embedded-postgres = the DB.',
            '**Thinking electron-vite ships the app.** It only builds/runs in dev. Fix: electron-builder makes the installer.',
            '**Leaving `asar: true` (the default) with a bundled Postgres.** Native binaries inside an asar archive fail to execute. Fix: set `asar: false`.',
            '**Assuming embedded-postgres needs a system Postgres.** It bundles its own portable binaries. Fix: nothing to pre-install on the user\'s machine.',
            '**Expecting Prisma to run in the renderer.** It is a Node library — main only. Fix: keep all Prisma in the main process.',
            '**Mixing up build-time and run-time tools.** electron-vite/builder are dev; Prisma client + embedded-postgres run in the shipped app. Fix: split them in package.json.',
          ],
          tryIt:
            'In one line each, write what electron-vite, Prisma, embedded-postgres, and electron-builder do for Upralli Seva — then say which two run inside the shipped app and which two are build-time only.',
          takeaway:
            'electron-vite builds, Prisma is the typed ORM/migrations, embedded-postgres is the bundled offline database, and electron-builder ships the NSIS installer (with `asar: false`).',
        },
        {
          id: 'm0-t14',
          title: 'The Upralli domain tour: Maganes, Years, Entries, PoojaTypes, Participation, totals',
          explain:
            'Walk the whole data model end to end — how Maganes, Years, PersonEntries, PoojaTypes, and Participation fit together, and where the ₹ money totals come from.',
          analogy:
            'Picture the committee\'s yearly register book. The region is divided into **Maganes** (sub-region pages), each with a coordinator. Each **Year** is a fresh edition of the book with its own pooja columns and rates, and once the season closes the edition is **locked**. Every line is a **household** (PersonEntry). The columns across the top are the **PoojaTypes** with their rates. A tick where a household meets a column is a **Participation**. Adding the rates of a household\'s ticked columns gives their contribution; summing households gives the Magane total and the grand total at the foot of the book.',
          theory:
            'The Upralli Seva domain has five core entities, and money flows out of them:\n\n- **Magane** — a sub-region (global master): Kannada name, coordinator, mobile list. The same Maganes are reused across years.\n- **Year** — owns its own pooja-type columns and ₹ rates, and can be **locked** to freeze a finished season. "Clone year" copies people forward into a new year with all ticks reset, so the committee does not re-type households.\n- **PersonEntry** — one household: a single combined Kannada name/address, an optional mobile, and a **drag-orderable** position. Each belongs to a Magane (within a year\'s register).\n- **PoojaType** — a per-year column (ಹೂವಿನ ಪೂಜೆ, ವಿಶ್ವಕರ್ಮ ಪೂಜೆ, ನವರಾತ್ರಿ ಪೂಜೆ, ಕಾರ್ತಿಕ ಪೂಜೆ…), each with a ₹ **rate**. Columns differ year to year.\n- **Participation** — a person × pooja checkbox: did this household take part in this pooja?\n\n**Where money comes from:** a household\'s `poojaAmount` is the **sum of the rates of the columns they ticked** (Σ rate over ticked Participations). Sum every household in a Magane → the **per-Magane total**; sum all Maganes → the **grand total**. All ₹ values are formatted with **Indian grouping** (e.g. ₹1,00,000). Because rates are exact `Decimal`, these sums are exact — no float drift. This single tour is the map for every screen and query you will build.',
          whyItMatters:
            'Understanding the domain before coding is what separates a maintainable app from a tangle, and interviewers love "walk me through your data model". For **Upralli Seva**, this Magane → Year → Entry → PoojaType → Participation → totals chain is *the* product — every later feature (clone year, lock, drag-order, totals) is a variation on this tour.',
          steps: [
            'Name the five entities: Magane, Year, PersonEntry, PoojaType, Participation.',
            'Note Maganes are a global master reused across years.',
            'Note each Year owns its pooja columns + rates and can be locked.',
            'Note PersonEntry = one household, combined Kannada name, optional mobile, orderable.',
            'Note PoojaType = a per-year ₹-rated column; Participation = a person×pooja tick.',
            'Trace money: poojaAmount = Σ rate(ticked); sum to per-Magane and grand totals.',
          ],
          code: `// The domain as TypeScript shapes (Prisma will generate equivalents later):
interface Magane     { id: number; name: string; coordinator: string; mobiles: string[]; }
interface Year       { id: number; label: string; locked: boolean; }
interface PoojaType  { id: number; yearId: number; name: string; rate: number; } // rate -> Decimal later
interface PersonEntry { id: number; maganeId: number; yearId: number; name: string; mobile: string | null; order: number; }
interface Participation { entryId: number; poojaTypeId: number; ticked: boolean; }

// Money: a household's amount = sum of rates of the columns it ticked.
function poojaAmount(
  entryId: number,
  participations: Participation[],
  poojas: PoojaType[],
): number {
  return participations
    .filter((p) => p.entryId === entryId && p.ticked)
    .reduce((sum, p) => {
      const col = poojas.find((pt) => pt.id === p.poojaTypeId);
      return sum + (col ? col.rate : 0);
    }, 0);
}
// Sum households -> per-Magane total; sum Maganes -> grand total (Indian-grouped ₹).`,
          pitfalls: [
            '**Treating Maganes as per-year.** They are a reused global master. Fix: model Magane once; link entries to it per year.',
            '**Forgetting PoojaTypes are per-year.** Columns and rates change yearly. Fix: scope PoojaType to a `yearId`.',
            '**Editing a locked year\'s data.** A locked season must be frozen. Fix: block writes when `year.locked` is true.',
            '**Splitting a household name and address into separate fields.** The spec uses one combined Kannada field. Fix: keep `name` as the single combined string.',
            '**Computing totals with float `number` rates.** Drift corrupts the grand total. Fix: rates are `Decimal`; sum exactly (covered with Prisma).',
            '**Ignoring drag-order.** Households have a meaningful `order`. Fix: store and sort by `order`, and update it on reorder.',
          ],
          tryIt:
            'On paper, draw one Magane with two households and three pooja columns (rates ₹100/₹250/₹150). Tick a few cells, then compute each household\'s amount, the Magane total, and write the grand total with Indian grouping.',
          takeaway:
            'Maganes (global) hold households per Year; each Year owns ₹-rated PoojaType columns; a Participation tick drives poojaAmount = Σ ticked rates, summed to per-Magane and grand totals.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm0-p1',
      type: 'Mini Project',
      title: 'Model the register in TypeScript',
      domain: 'Temple committee register — Upralli Seva domain modelling',
      duration: '2-3 hours',
      description:
        'Write a single TypeScript module that defines the core domain as interfaces — `Magane`, `Year`, `PoojaType`, `PersonEntry`, `Participation` — plus a `poojaAmount(entry, participations, poojas)` function that sums the rates of a household\'s ticked columns. Compile it clean with `tsc --noEmit` to prove the shapes line up before any database or Electron code exists.',
      tools: ['TypeScript 5', 'Node.js 20 LTS', 'VS Code', 'tsc --noEmit'],
      blueprint: {
        overview:
          'This is the type-only skeleton of the whole app. By modelling the five entities and the money function in pure TypeScript first, you lock in the shared vocabulary that the renderer, IPC, and Prisma will all reuse — and you catch shape mistakes with the compiler, not at the committee desk. No runtime, no DB: just types and one pure function, checked with `tsc --noEmit`.',
        functionalRequirements: [
          'Define `Magane` (id, Kannada name, coordinator, mobiles[]), `Year` (id, label, locked), and `PoojaType` (id, yearId, Kannada name, rate).',
          'Define `PersonEntry` (id, maganeId, yearId, combined Kannada name, mobile: string | null, order) and `Participation` (entryId, poojaTypeId, ticked).',
          'Implement `poojaAmount(entryId, participations, poojas): number` returning the sum of rates of the household\'s ticked pooja columns.',
          'Add a `maganeTotal(entryIds, participations, poojas)` that sums `poojaAmount` across a Magane\'s households.',
          'Compile the whole module with `tsc --noEmit` under `strict: true` and fix every reported type error so it passes clean.',
        ],
        technicalImplementation: [
          'Create `src/domain/register.ts` and `export` every interface so other modules can import them.',
          'Use `string | null` for the optional `mobile` and a `boolean` for `locked` (a fixed two-state choice).',
          'Keep `poojaAmount` pure: no I/O, just `filter` ticked participations and `reduce` their column rates.',
          'Add a `tsconfig.json` with `"strict": true` and `"noEmit": true`, then run `npx tsc --noEmit` and read each error message.',
          'Add a tiny sample object per interface plus a `// @ts-expect-error` line proving a wrong shape is rejected.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold the interfaces',
            outcome: 'A `register.ts` exporting all five domain interfaces with correct Kannada-friendly string fields and a null-able mobile.',
            prompt:
              'In TypeScript with `strict: true`, write and `export` five interfaces for a temple committee register: `Magane` (id: number, name: string [Kannada], coordinator: string, mobiles: string[]), `Year` (id: number, label: string, locked: boolean), `PoojaType` (id: number, yearId: number, name: string [Kannada], rate: number), `PersonEntry` (id: number, maganeId: number, yearId: number, name: string [combined Kannada name+address], mobile: string | null, order: number), and `Participation` (entryId: number, poojaTypeId: number, ticked: boolean). Add one sample object literal per interface and explain why `mobile` is `string | null` rather than optional.',
          },
          {
            step: 2,
            label: 'Implement poojaAmount',
            outcome: 'A pure, fully-typed `poojaAmount` that sums the rates of a household\'s ticked columns.',
            prompt:
              'Write a pure TypeScript function `poojaAmount(entryId: number, participations: Participation[], poojas: PoojaType[]): number` that filters the participations to those for this entry where `ticked` is true, looks up each one\'s `PoojaType` by id, and reduces their `rate`s to a total. Handle a missing pooja type safely (treat as 0). Keep it side-effect free and explain why purity makes it easy to test.',
          },
          {
            step: 3,
            label: 'Typecheck clean and prove rejection',
            outcome: 'A module that passes `tsc --noEmit` and a `@ts-expect-error` line proving a wrong shape is caught.',
            prompt:
              'Give me a minimal `tsconfig.json` with `"strict": true` and `"noEmit": true` for this domain module, the exact `npx tsc --noEmit` command to run, and one `// @ts-expect-error` example where I assign an object missing the `coordinator` field to a `Magane` — so the compiler confirms the bad shape is rejected. Explain what `--noEmit` means and why I run it before writing any database code.',
          },
        ],
      },
    },
    {
      id: 'm0-p2',
      type: 'Project',
      title: 'Register CLI tally (Node + TS via tsx)',
      domain: 'Temple committee register — command-line ₹ tally',
      duration: '3-4 hours',
      description:
        'Build a small Node + TypeScript script, run with `tsx`, that holds a sample Magane with a few Kannada households and per-pooja rates, computes each household\'s contribution and the Magane total, and prints them to the terminal with proper **Indian-grouped ₹** formatting (₹1,00,000 style). It reuses the interfaces and `poojaAmount` from the mini project, proving the model works on real-looking data before any Electron or database code.',
      tools: ['TypeScript 5', 'Node.js 20 LTS', 'tsx', 'Intl.NumberFormat (en-IN)'],
      blueprint: {
        overview:
          'A throwaway CLI is the fastest way to prove the domain model produces correct money. You hardcode one Magane, its households, the year\'s pooja columns with rates, and a set of ticks; then you run the same `poojaAmount` logic the real app will use and print a tidy per-household and total tally. Running it via `tsx` lets you execute TypeScript directly without a separate build step, so the feedback loop is instant.',
        functionalRequirements: [
          'Define a sample `Magane`, a `Year`, three or four `PoojaType` columns with ₹ rates, and four Kannada `PersonEntry` households in code.',
          'Define a set of `Participation` ticks linking households to the pooja columns they took part in.',
          'For each household, compute and print its name and `poojaAmount` in Indian-grouped ₹ (e.g. ₹1,500 / ₹1,00,000).',
          'Print the per-Magane total at the foot of the list, also Indian-grouped.',
          'Run the whole thing with `npx tsx tally.ts` and confirm the Kannada names and ₹ totals print correctly in the terminal.',
        ],
        technicalImplementation: [
          'Reuse the exported interfaces and `poojaAmount` from the mini project (import them, do not redefine).',
          'Format rupees with `new Intl.NumberFormat(\'en-IN\', { style: \'currency\', currency: \'INR\', maximumFractionDigits: 0 })`.',
          'Iterate households with a `for...of` loop, calling `poojaAmount` per household and accumulating the Magane total.',
          'Use `tsx` (a devDependency) so the `.ts` file runs directly: `npx tsx tally.ts` — no manual compile step.',
          'Ensure the terminal/file is UTF-8 so the Kannada PoojaType and household names render correctly.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Seed sample data',
            outcome: 'A `tally.ts` with one Magane, a year of pooja columns with rates, four Kannada households, and their participation ticks.',
            prompt:
              'In a TypeScript file `tally.ts`, import my domain interfaces and seed realistic sample data for a coastal-Karnataka temple committee: one `Magane` (Kannada name + coordinator), four `PersonEntry` households with combined Kannada names/addresses, four `PoojaType` columns (ಹೂವಿನ ಪೂಜೆ ₹100, ವಿಶ್ವಕರ್ಮ ಪೂಜೆ ₹150, ನವರಾತ್ರಿ ಪೂಜೆ ₹250, ಕಾರ್ತಿಕ ಪೂಜೆ ₹200), and a believable set of `Participation` ticks. Keep all amounts as exact numbers for now and note where a real app would use Decimal.',
          },
          {
            step: 2,
            label: 'Compute and Indian-group the totals',
            outcome: 'Per-household amounts and a Magane total, each formatted with Indian digit grouping.',
            prompt:
              'Using my `poojaAmount` function, write the logic in `tally.ts` to compute each household\'s contribution and the running Magane total. Format every rupee value using `Intl.NumberFormat(\'en-IN\', { style: \'currency\', currency: \'INR\', maximumFractionDigits: 0 })` so it shows Indian grouping like ₹1,00,000. Show me the exact formatter setup and a sample of the expected output lines.',
          },
          {
            step: 3,
            label: 'Run with tsx and verify Kannada output',
            outcome: 'A working `npx tsx tally.ts` run that prints Kannada names and correct Indian-grouped ₹ totals.',
            prompt:
              'Show me how to add `tsx` as a devDependency and run `npx tsx tally.ts` so the TypeScript executes directly without a build step. Then give me a checklist to verify the output is correct: every household line shows a Kannada name and a ₹ amount, the Magane total equals the sum of the households, and the Kannada PoojaType names render properly (UTF-8). Explain why `tsx` is convenient for this kind of quick domain test.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm0-q1',
      q: 'Why does the shipped Upralli Seva app use `embedded-postgres` instead of asking the committee to install PostgreSQL?',
      options: [
        'Because embedded-postgres is faster than a normal PostgreSQL server',
        'So the installer bundles a portable, offline database and the committee installs only one program — no separate DB setup',
        'Because Prisma cannot connect to a normally installed PostgreSQL',
        'Because the cloud database needs a fallback when offline',
      ],
      answer: 1,
    },
    {
      id: 'm0-q2',
      q: 'In TypeScript, what does `tsc --noEmit` do?',
      options: [
        'Compiles the code and emits JavaScript files',
        'Runs the program directly like Node would',
        'Type-checks the code and reports errors without writing any output files',
        'Removes all type annotations from the source files',
      ],
      answer: 2,
    },
    {
      id: 'm0-q3',
      q: 'A household entry\'s `mobile` field is typed `string | null`. With strict null checks on, what must you do before calling `mobile.length`?',
      options: [
        'Nothing — TypeScript trusts the value is present',
        'Cast it to `any` to silence the compiler',
        'Narrow it first, e.g. with `if (mobile !== null) { ... }`, then use it inside the guard',
        'Change the type to `number` so it has a length',
      ],
      answer: 2,
    },
    {
      id: 'm0-q4',
      q: 'In Electron, which process holds all the Prisma/database access in the Upralli Seva app?',
      options: [
        'The renderer process, because that is where the React UI lives',
        'The main process — the renderer only sends typed requests over IPC',
        'Both processes share direct database access equally',
        'A separate cloud process reached over the internet',
      ],
      answer: 1,
    },
    {
      id: 'm0-q5',
      q: 'Why are pooja rates and ₹ totals modelled as Prisma `Decimal` rather than a JavaScript `number`?',
      options: [
        'Because `Decimal` is faster to add than `number`',
        'Because JavaScript `number` is floating-point and drifts (0.1 + 0.2 ≠ 0.3), so money totals would be inexact',
        'Because Prisma cannot store plain numbers',
        'Because Kannada text requires a Decimal type',
      ],
      answer: 1,
    },
    {
      id: 'm0-q6',
      q: 'In the Upralli domain, how is a single household\'s `poojaAmount` calculated?',
      options: [
        'The number of pooja columns in the year, regardless of ticks',
        'The sum of the rates of the pooja columns that household has ticked (its Participations)',
        'The grand total divided by the number of Maganes',
        'A fixed yearly fee set on the Magane',
      ],
      answer: 1,
    },
  ],
};
