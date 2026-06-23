// Module 0 — JavaScript, Node & Desktop App Foundations
// Gets a complete beginner ready to build the offline "Maranakatte Seva" desktop app
// (Electron + React + Vite + local PostgreSQL via `pg`).
// Consumed by the React course player (see components/TopicItem.jsx).

export const m0 = {
  id: 'm0',
  title: 'JavaScript, Node & Desktop App Foundations',
  hours: 8,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Install the tools (Node.js, npm, VS Code, PostgreSQL, Git), learn just-enough JavaScript (variables, money-safe numbers, objects, arrays, functions, map/filter/reduce, promises, modules), and understand why an offline Electron desktop app — with a main process and a renderer process — is the right shape for the Maranakatte Seva counter. Everything you need before building the real app.',
  sections: [
    {
      id: 'm0-s1',
      title: 'Setup & Tooling',
      topics: [
        {
          id: 'm0-t1',
          title: 'Install Node.js & npm; verify with node -v / npm -v',
          explain:
            'Install the Node.js runtime (npm comes bundled), then confirm both work by running `node -v` and `npm -v` in a fresh terminal.',
          analogy:
            'Think of the seva counter at Shri Brahmalingeshwara Temple, Maranakatte, before the day starts. Before a single Mangalarathi ticket is printed, the counter needs power, a working printer, and the cash drawer ready. **Node.js** is that whole utility connection for a JavaScript developer — it lets your code run outside the browser, on the staff member\'s computer. Running `node -v` is like flipping the main switch and seeing the light come on before the first devotee arrives.',
          theory:
            'A web browser can run JavaScript, but you cannot build a desktop app inside a browser tab. **Node.js** is a program that runs JavaScript directly on your computer — outside any browser. It is what lets your code open files, talk to a database, and behave like a real installed application.\n\nWhen you install Node, you also get **npm** (Node Package Manager) for free. `npm` downloads and manages the reusable code libraries (called **packages**) that your app depends on — for example the `pg` package that talks to PostgreSQL, or `electron` itself.\n\nAlways install the **LTS** (Long Term Support) version — it is the stable, well-tested line, not the experimental one. After installing, open a *brand-new* terminal so the PATH change is picked up, then verify:\n- `node -v` prints the Node version (e.g. `v20.11.0`)\n- `npm -v` prints the npm version (e.g. `10.2.4`)\n\nIf either command says "not recognised", the install did not register on your PATH — reinstall and reopen the terminal.',
          whyItMatters:
            'Every JavaScript or Node interview assumes you can build and run something on your own machine right now. Getting `node -v` and `npm -v` green on day one removes the classic "works on my machine" excuse. For the Maranakatte Seva app, Node is the engine that will run the database code and bundle the desktop app — nothing else works until this is in place.',
          steps: [
            'Go to `https://nodejs.org` and download the **LTS** installer for your operating system.',
            'Run the installer and accept the defaults (keep the "Add to PATH" option checked).',
            'Close every open terminal window so the new PATH takes effect.',
            'Open a fresh terminal and run `node -v` — confirm it prints a version like `v20.x`.',
            'Run `npm -v` — confirm it also prints a version number.',
            'Run `node -e "console.log(\'Maranakatte ready\')"` to prove Node can execute code.',
          ],
          code:
            '# In a fresh terminal, check both tools are installed:\n' +
            'node -v\n' +
            '# -> v20.11.0\n' +
            'npm -v\n' +
            '# -> 10.2.4\n\n' +
            '# Run a one-line JavaScript program with Node:\n' +
            'node -e "console.log(\'Counter open at Maranakatte\')"\n' +
            '# -> Counter open at Maranakatte',
          pitfalls: [
            "**Installing from a random blog link.** You can get an outdated or tampered build. Fix: only download from the official `https://nodejs.org`.",
            '**Picking the "Current" version instead of LTS.** Current has newer, less-stable features that break tutorials. Fix: choose the LTS download.',
            '**Checking the version in the same terminal you had open during install.** The old terminal does not know about the new PATH. Fix: open a brand-new terminal first.',
            '**Assuming npm needs a separate install.** It does not — npm ships inside Node. Fix: install Node only; npm comes with it.',
            "**Having two Node versions fighting on the PATH.** `node -v` shows an unexpected number. Fix: uninstall old copies, or use a version manager like `nvm`.",
            '**Running Node commands without a terminal open in the right folder later.** Commands target the current folder. Fix: always note which folder your terminal is in.',
          ],
          tryIt:
            'Create a file `hello.js` containing `console.log(\'Hari Om from the Maranakatte counter\')`, then run it with `node hello.js` and confirm the message prints.',
          takeaway:
            'Node.js runs JavaScript on your computer and ships with npm — verify both with `node -v` and `npm -v` before doing anything else.',
        },
        {
          id: 'm0-t2',
          title: 'Install VS Code + ESLint & Prettier extensions',
          explain:
            'Install Visual Studio Code as your code editor, then add the ESLint and Prettier extensions to catch mistakes and auto-format your code.',
          analogy:
            'A good editor is like a well-organised seva counter desk: the receipt pad, the pen, the rate card, and a colleague who quietly points out "you wrote ₹50 but the rate is ₹40" before the ticket is handed over. **VS Code** is the desk; **ESLint** is the colleague catching errors; **Prettier** is the helper who keeps every ticket neatly aligned so the next person can read it.',
          theory:
            'You *can* write code in Notepad, but a real editor makes you far faster and far less error-prone. **VS Code** (Visual Studio Code) is free, lightweight, and the most common editor for JavaScript work. It gives you colour-coded code, autocomplete, and an integrated terminal so you never leave the window.\n\nTwo extensions matter most early:\n- **ESLint** reads your code as you type and underlines real problems — an unused variable, a misspelled function name, a missing `await`. It is your safety net.\n- **Prettier** automatically formats your code (spacing, quotes, line breaks) every time you save, so the whole codebase looks consistent and you never argue about style.\n\nInstall extensions from the **Extensions** panel (the square icon in the left sidebar, or `Ctrl+Shift+X`). Search the name, click **Install**. To make Prettier run on save, open Settings (`Ctrl+,`), search "format on save", and tick it.',
          whyItMatters:
            'Interviewers notice clean, consistently formatted code — it signals professionalism. ESLint will catch dozens of small bugs before you ever run the Maranakatte Seva app, and on a busy Rangapooje evening you do not want a typo in the ticket-printing code that only surfaces in front of a queue of devotees.',
          steps: [
            'Download VS Code from `https://code.visualstudio.com` and install it.',
            'Open VS Code and click the **Extensions** icon in the left sidebar (or press `Ctrl+Shift+X`).',
            'Search for **ESLint** (by Microsoft) and click **Install**.',
            'Search for **Prettier - Code formatter** and click **Install**.',
            'Open Settings with `Ctrl+,`, search "format on save", and enable it.',
            'Open a `.js` file, add messy spacing, save, and watch Prettier tidy it.',
          ],
          code:
            '// .vscode/settings.json — project settings so the whole team formats the same way\n' +
            '{\n' +
            '  "editor.formatOnSave": true,\n' +
            '  "editor.defaultFormatter": "esbenp.prettier-vscode",\n' +
            '  "eslint.validate": ["javascript", "javascriptreact"]\n' +
            '}',
          pitfalls: [
            '**Installing the wrong Prettier.** There are copycats. Fix: install "Prettier - Code formatter" by `esbenp`.',
            '**Forgetting to enable format-on-save.** Prettier sits idle and nothing formats. Fix: tick "Format On Save" in Settings.',
            '**Two formatters fighting.** Code reformats oddly. Fix: set Prettier as the single default formatter.',
            "**Ignoring the squiggly ESLint underlines.** They are warning you of real bugs. Fix: hover the underline and read the message.",
            "**Editing files outside VS Code and expecting formatting.** Prettier only runs in the editor on save. Fix: keep your edits in VS Code.",
            '**Heavy unrelated extensions slowing the editor.** Startup lags. Fix: only install what you need early — ESLint and Prettier.',
          ],
          tryIt:
            'Write a function with deliberately ugly spacing and an unused variable, then save. Confirm Prettier reformats it and ESLint underlines the unused variable.',
          takeaway:
            'VS Code with ESLint (catches bugs) and Prettier (formats on save) is the standard, productive setup for JavaScript work.',
        },
        {
          id: 'm0-t3',
          title: 'package.json: dependencies vs devDependencies and npm scripts',
          explain:
            'Every Node project has a `package.json` file that records its name, its package dependencies, and named `npm` scripts you can run.',
          analogy:
            'Think of `package.json` as the temple\'s seva register at the counter. It lists every seva the temple offers, who supplies what, and the standard procedures the staff follow. `dependencies` are the supplies the app needs every single day to serve devotees; `devDependencies` are the tools only the staff use behind the counter (like the label printer setup) that the devotee never sees.',
          theory:
            'A **`package.json`** is the heart of any Node project. You create it with `npm init -y` (the `-y` accepts all defaults). It records the project name, version, and — crucially — which packages it needs.\n\nThere are two kinds of dependency:\n- **`dependencies`** are packages the app needs to *run* in production. For the Maranakatte Seva app, `pg` (the PostgreSQL client) and `react` belong here. Install them with `npm install pg`.\n- **`devDependencies`** are packages needed only while *developing or building* — they are not shipped to the user. Examples: `electron`, `vite`, `eslint`, `prettier`. Install them with `npm install --save-dev vite`.\n\n**npm scripts** live under the `"scripts"` key. They are named shortcuts for terminal commands. Instead of typing a long Electron+Vite command, you define `"dev": "electron-vite dev"` and just run `npm run dev`. The special script `start` can be run as `npm start` (no `run`).\n\nWhen you run `npm install`, npm reads `package.json`, downloads every listed package into a `node_modules` folder, and records exact versions in `package-lock.json`.',
          whyItMatters:
            'Interviewers expect you to know the difference between `dependencies` and `devDependencies` and to read a `package.json` at a glance. For the Maranakatte Seva app, getting this right keeps the shipped desktop app small (it does not bundle build-only tools) and makes `npm run dev` the single command any staff member or teammate uses to start the app.',
          steps: [
            'In an empty folder, run `npm init -y` to create a `package.json`.',
            'Install a runtime dependency: `npm install pg` (note it lands under `dependencies`).',
            'Install a dev tool: `npm install --save-dev eslint` (it lands under `devDependencies`).',
            'Open `package.json` and read the two dependency blocks.',
            'Add a script `"dev": "node index.js"` under `"scripts"`.',
            'Run `npm run dev` and confirm it executes `index.js`.',
          ],
          code:
            '{\n' +
            '  "name": "maranakatte-seva",\n' +
            '  "version": "0.1.0",\n' +
            '  "scripts": {\n' +
            '    "dev": "electron-vite dev",\n' +
            '    "build": "electron-vite build",\n' +
            '    "lint": "eslint ."\n' +
            '  },\n' +
            '  "dependencies": {\n' +
            '    "pg": "^8.11.0",\n' +
            '    "react": "^18.2.0"\n' +
            '  },\n' +
            '  "devDependencies": {\n' +
            '    "electron": "^29.0.0",\n' +
            '    "vite": "^5.0.0",\n' +
            '    "eslint": "^8.56.0"\n' +
            '  }\n' +
            '}',
          pitfalls: [
            '**Putting build tools in `dependencies`.** They bloat the shipped app. Fix: use `--save-dev` for things like `vite` and `electron`.',
            "**Committing the `node_modules` folder to Git.** It is huge and rebuildable. Fix: add `node_modules/` to `.gitignore`.",
            '**Deleting `package-lock.json`.** You lose reproducible installs. Fix: keep and commit it.',
            "**Hand-editing version numbers wrongly.** Typos break installs. Fix: change deps with `npm install pkg` / `npm uninstall pkg`.",
            "**Running a script with `npm scriptname` instead of `npm run scriptname`.** Only `start`/`test` skip `run`. Fix: use `npm run dev`.",
            '**Forgetting `npm install` after cloning a project.** No packages, nothing runs. Fix: run `npm install` first.',
          ],
          tryIt:
            'Create a new folder, run `npm init -y`, add a script `"greet": "node -e \\"console.log(\'Seva counter ready\')\\""`, and run it with `npm run greet`.',
          takeaway:
            '`package.json` declares your project: `dependencies` (run-time), `devDependencies` (build-time), and `npm` scripts as named command shortcuts.',
        },
        {
          id: 'm0-t4',
          title: 'Install PostgreSQL locally and connect with psql',
          explain:
            'Install the PostgreSQL database on your own machine and connect to it from the terminal using the `psql` command-line tool.',
          analogy:
            'PostgreSQL is the temple\'s master seva ledger — the big bound register where every ticket, every devotee\'s name and gotra, and every booking is recorded permanently. Because the Maranakatte Seva app is **offline**, this ledger lives entirely on the counter computer, not in some far-away cloud. `psql` is like the senior clerk who can open that ledger directly and read or write any page by hand.',
          theory:
            '**PostgreSQL** (often "Postgres") is a powerful, free, open-source **relational database**. It stores your data in tables with rows and columns, and it keeps that data safe on disk even when the app is closed. For the Maranakatte Seva app it will hold the sevas, the devotee records, and the daily tickets — all **locally** on the temple\'s computer.\n\nWhen you install Postgres you get a background **server** that manages the data, and **`psql`**, a terminal client for talking to it directly with SQL. During install you set a password for the default `postgres` superuser — write it down; you will need it.\n\nTo connect, you run `psql` with a connection string or flags. A few commands to know inside `psql`:\n- `\\l` — list all databases\n- `\\c dbname` — connect to a database\n- `\\dt` — list tables in the current database\n- `\\q` — quit\n\nLater the app will not use `psql` directly; the Node `pg` package will connect for you. But `psql` is invaluable for setting things up and peeking at your data while you build.',
          whyItMatters:
            'Almost every backend interview involves SQL and a relational database, and Postgres is the most-loved choice in industry surveys. For the Maranakatte Seva app, a local Postgres is the entire point — it is what makes the app work with no internet at a temple counter near Byndoor where connectivity is patchy.',
          steps: [
            'Download PostgreSQL from `https://www.postgresql.org/download` for your OS and install it.',
            'During install, set and **record** a password for the `postgres` superuser.',
            'Open a fresh terminal and run `psql -U postgres` (enter the password when prompted).',
            'Inside psql, run `\\l` to list databases.',
            'Create a database: `CREATE DATABASE maranakatte;`',
            'Connect to it with `\\c maranakatte`, then exit with `\\q`.',
          ],
          code:
            '-- Connect as the postgres superuser:\n' +
            'psql -U postgres\n\n' +
            '-- Inside psql, create the app database:\n' +
            'CREATE DATABASE maranakatte;\n\n' +
            '-- Switch into it:\n' +
            '\\c maranakatte\n\n' +
            '-- A tiny taste of SQL: a table for sevas (money uses numeric, not float):\n' +
            'CREATE TABLE seva (\n' +
            '  id    serial PRIMARY KEY,\n' +
            "  name  text NOT NULL,\n" +
            '  price numeric(10,2) NOT NULL\n' +
            ');\n\n' +
            "INSERT INTO seva (name, price) VALUES ('Mangalarathi', 40.00);\n" +
            'SELECT * FROM seva;',
          pitfalls: [
            "**Forgetting the `postgres` password you set during install.** You cannot connect. Fix: record it safely; you can reset it but it is painful.",
            "**Using `money` or `float` for rupees.** Both cause rounding errors. Fix: use `numeric(10,2)` for ₹ amounts.",
            "**The Postgres service not running.** `psql` says connection refused. Fix: start the PostgreSQL service (it is usually set to auto-start).",
            '**Forgetting `-U postgres`.** psql tries your OS username, which may not exist as a DB role. Fix: pass `-U postgres`.',
            "**Leaving off the semicolon in psql.** Your SQL never executes; psql waits. Fix: end statements with `;`.",
            "**Confusing a *server*, a *database*, and a *table*.** One server holds many databases; each holds many tables. Fix: keep the hierarchy clear.",
          ],
          tryIt:
            'Create the `maranakatte` database, add the `seva` table above, insert Mangalarathi (₹40) and Hannikaayi (₹25), then `SELECT * FROM seva;` to see both rows.',
          takeaway:
            'PostgreSQL is a local relational database; `psql` is the terminal client you use to create databases and peek at data while building.',
        },
        {
          id: 'm0-t5',
          title: 'Install Git & make your first commit',
          explain:
            'Install Git and learn the basic save-your-work cycle: `git init`, `git add`, `git commit` — a time machine for your code.',
          analogy:
            'Git is like the temple\'s daily logbook where, at the end of each seva session, the clerk writes a dated summary: "Evening Rangapooje — 540 tickets issued." Every commit is one such permanent dated entry. If a mistake creeps into tomorrow\'s code, you can always flip back to an earlier good page exactly as it was.',
          theory:
            '**Git** is a **version control** system — it records snapshots of your project over time so you can review history, undo mistakes, and collaborate. A snapshot is called a **commit**, and each commit has a message describing what changed.\n\nThe basic cycle is three commands:\n- `git init` — start tracking the current folder (run once per project).\n- `git add .` — stage your changes (mark what should go into the next commit).\n- `git commit -m "message"` — record a permanent snapshot with a description.\n\nYou also need a **`.gitignore`** file listing things Git should ignore — most importantly `node_modules/` (huge and rebuildable) and any file with secrets. Run `git status` any time to see what has changed, and `git log` to see your history of commits.\n\nThe first time you commit on a machine, Git asks you to set your name and email so commits are attributed to you.',
          whyItMatters:
            'Version control is non-negotiable in any real job — interviewers expect you to know `add`/`commit`/`status` cold. For the Maranakatte Seva app, Git lets you experiment with the ticket-printing code on the Rangapooje rush feature, and roll back instantly if you break something, without ever losing a working version.',
          steps: [
            'Install Git from `https://git-scm.com/downloads` for your OS.',
            'Set your identity: `git config --global user.name "Your Name"` and `git config --global user.email "you@example.com"`.',
            'In your project folder run `git init`.',
            'Create a `.gitignore` containing `node_modules/`.',
            'Stage everything with `git add .`.',
            'Commit with `git commit -m "Initial commit: Maranakatte Seva project"` and verify with `git log`.',
          ],
          code:
            '# One-time identity setup (do this once per machine):\n' +
            'git config --global user.name "Counter Staff"\n' +
            'git config --global user.email "staff@maranakatte.example"\n\n' +
            '# Inside the project folder, start tracking and make the first commit:\n' +
            'git init\n' +
            'echo "node_modules/" > .gitignore\n' +
            'git add .\n' +
            'git commit -m "Initial commit: Maranakatte Seva project"\n\n' +
            '# See what changed and the history:\n' +
            'git status\n' +
            'git log --oneline',
          pitfalls: [
            "**Committing `node_modules/`.** Thousands of files bloat the repo. Fix: add `node_modules/` to `.gitignore` *before* the first `git add`.",
            "**Committing secrets** (DB passwords, keys). They live forever in history. Fix: keep them in ignored env files.",
            '**Empty or vague commit messages.** History becomes useless. Fix: write a short, specific message in the present tense.',
            "**Forgetting `git add` before `git commit`.** Nothing is staged, so nothing is recorded. Fix: `git add .` first, or use `git commit -a`.",
            "**Running git commands outside the project folder.** Git complains there is no repo. Fix: `cd` into the folder that has the `.git`.",
            '**Skipping the identity setup.** The first commit fails or is mis-attributed. Fix: set `user.name` and `user.email` once.',
          ],
          tryIt:
            'Initialise a Git repo in a fresh folder, add a `.gitignore` with `node_modules/`, make your first commit, then edit a file and make a second commit. Run `git log --oneline` and confirm you see two entries.',
          takeaway:
            'Git snapshots your code with `init` / `add` / `commit`; always ignore `node_modules/` and write clear commit messages.',
        },
      ],
    },
    {
      id: 'm0-s2',
      title: 'JavaScript Essentials',
      topics: [
        {
          id: 'm0-t6',
          title: 'Variables & types; handling ₹ money safely',
          explain:
            'Use `const` and `let` to name values, know the basic types (number, string, boolean, Date), and store rupee amounts as whole paise to avoid float rounding bugs.',
          analogy:
            'A variable is a labelled receipt slot at the counter. `const` is a slot whose label you glue down — the seva\'s fixed rate, say ₹40, never changes. `let` is a slip you can rewrite — the running cart total grows as the devotee adds more sevas. And just as you would never tear a ₹40 note into "0.4 of a note plus 0.40", you should never trust the computer to add 0.1 + 0.2 in rupees and get a clean answer.',
          theory:
            'JavaScript values have **types**. The ones you meet first:\n- **number** — `40`, `3.5` (JavaScript has only one number type for both)\n- **string** — text in quotes, `\'Mangalarathi\'`\n- **boolean** — `true` / `false`\n- **Date** — a point in time, `new Date()`\n\nYou name values with **`const`** (cannot be reassigned) or **`let`** (can be reassigned). Prefer `const` by default and reach for `let` only when the value genuinely changes. Avoid the old `var`.\n\nThe sharp edge is **money**. JavaScript numbers are floating-point, so `0.1 + 0.2` is `0.30000000000000004`, not `0.3`. For rupees this causes wrong totals. The safe pattern is to store money as an **integer number of paise** (₹40.00 = `4000` paise), do all arithmetic in whole paise, and only divide by 100 when displaying. Postgres will later store the same money in a `numeric` column, which is exact — but inside JavaScript, integer paise keeps you safe.',
          whyItMatters:
            'Money bugs are the fastest way to lose trust, and "why is 0.1 + 0.2 not 0.3?" is a classic interview question. For the Maranakatte Seva app, a one-paisa rounding error multiplied across 500+ Rangapooje tickets a day becomes a real cash-drawer mismatch — so getting money types right from day one matters.',
          steps: [
            'Declare a fixed rate with `const sevaPrice = 40;`.',
            'Declare a changeable total with `let total = 0;`.',
            'Type `console.log(0.1 + 0.2)` and observe the floating-point surprise.',
            'Store the rate in paise: `const sevaPaise = 4000;` (₹40.00).',
            'Add two amounts in paise, then format for display by dividing by 100.',
            'Wrap the formatting in a helper `rupees(paise)` that returns a `₹` string.',
          ],
          code:
            "const sevaName = 'Mangalarathi';   // string\n" +
            'const sevaPaise = 4000;            // number: ₹40.00 stored as 4000 paise\n' +
            'let cartTotalPaise = 0;            // let, because it changes\n\n' +
            '// The float trap:\n' +
            'console.log(0.1 + 0.2);            // 0.30000000000000004  (do NOT use floats for money)\n\n' +
            '// Safe: add whole paise\n' +
            'cartTotalPaise = cartTotalPaise + sevaPaise + 2500; // + Hannikaayi ₹25.00\n\n' +
            '// Format only when displaying:\n' +
            'function rupees(paise) {\n' +
            "  return '\\u20b9' + (paise / 100).toFixed(2);\n" +
            '}\n' +
            'console.log(rupees(cartTotalPaise)); // ₹65.00',
          pitfalls: [
            '**Adding rupee amounts as decimals.** Float drift gives ₹64.99 instead of ₹65.00. Fix: do arithmetic in whole paise.',
            "**Using `var`.** Its odd scoping causes subtle bugs. Fix: use `const` by default, `let` when needed.",
            "**Reassigning a `const`.** Throws `TypeError`. Fix: use `let` for values that change.",
            '**Comparing strings and numbers loosely with `==`.** `\'40\' == 40` is `true`, which hides bugs. Fix: use `===`.',
            '**Calling `.toFixed()` and then doing more maths on the result.** It returns a string. Fix: format only at the very end, for display.',
            "**Storing money as a JS number in the database column too.** Fix: use Postgres `numeric` for the stored value; integer paise is just for in-app maths.",
          ],
          tryIt:
            'Write a `rupees(paise)` helper and use it to print the total of Mangalarathi (₹40) + Hannikaayi (₹25) + a Rangapooje ticket (₹30), all stored and added in paise.',
          takeaway:
            'Use `const`/`let` (never `var`), and store money as whole paise to dodge floating-point rounding errors.',
        },
        {
          id: 'm0-t7',
          title: 'Objects & arrays: model a seva and a list of sevas',
          explain:
            'An object groups related fields (a single seva) under named keys; an array holds an ordered list of values (all the sevas).',
          analogy:
            'An **object** is one printed seva ticket: it has a name, a price, and a category all together on one slip. An **array** is the spike on the counter where the day\'s tickets are stacked in order. You reach for one ticket by its position on the spike, or you read a field off a single ticket by its label.',
          theory:
            'An **object** stores data as **key: value** pairs inside curly braces. It is perfect for modelling one real-world thing — here, one seva:\n```\nconst seva = { name: \'Rangapooje\', pricePaise: 3000, daily: true };\n```\nYou read a field with dot notation (`seva.name`) or brackets (`seva[\'name\']`), and you can add or change fields the same way.\n\nAn **array** is an ordered list inside square brackets. It is perfect for "many of the same thing" — here, all the sevas:\n```\nconst sevas = [seva1, seva2, seva3];\n```\nYou reach an item by its **index**, starting at 0: `sevas[0]` is the first. `sevas.length` tells you how many there are. You add to the end with `sevas.push(newSeva)`.\n\nCombine them: an **array of objects** is the single most common shape in JavaScript apps — and exactly how the Maranakatte Seva app will hold its catalogue of sevas in memory and how the database will hand back rows of tickets.',
          whyItMatters:
            'Reading and shaping an array of objects is the bread and butter of front-end and back-end work, and interviewers test it constantly. The Maranakatte Seva app passes arrays of seva objects between the database, the main process, and the React screen — so this shape is everywhere in the real code.',
          steps: [
            'Create a single seva object with `name`, `pricePaise`, and `daily` keys.',
            'Read one field with dot notation, e.g. `seva.name`.',
            'Add a new field, e.g. `seva.gstFree = true`.',
            'Create an array `sevas` holding three seva objects.',
            'Access the first with `sevas[0]` and count them with `sevas.length`.',
            'Append a new seva with `sevas.push({ ... })`.',
          ],
          code:
            '// One seva = one object\n' +
            "const rangapooje = { name: 'Rangapooje', pricePaise: 3000, daily: true };\n" +
            'console.log(rangapooje.name);     // Rangapooje\n' +
            'console.log(rangapooje.pricePaise); // 3000\n\n' +
            '// Many sevas = an array of objects\n' +
            'const sevas = [\n' +
            "  { name: 'Mangalarathi', pricePaise: 4000, daily: true },\n" +
            "  { name: 'Hannikaayi',   pricePaise: 2500, daily: true },\n" +
            '  rangapooje,\n' +
            '];\n\n' +
            'console.log(sevas.length);  // 3\n' +
            'console.log(sevas[0].name); // Mangalarathi\n\n' +
            "sevas.push({ name: 'Annadhana', pricePaise: 50000, daily: false });\n" +
            'console.log(sevas.length);  // 4',
          pitfalls: [
            '**Counting array indexes from 1.** They start at 0, so `sevas[1]` is the *second* item. Fix: remember 0-based indexing.',
            '**Reading a missing key.** `seva.prce` (typo) is `undefined`, not an error. Fix: check spelling; ESLint helps.',
            "**Using `=` to copy an object/array.** You copy the *reference*, so changes leak between both. Fix: copy with `{ ...seva }` or `[ ...sevas ]`.",
            "**Confusing objects `{}` and arrays `[]`.** Objects use named keys; arrays use number positions. Fix: pick by whether order/position matters.",
            "**Pushing onto the wrong variable.** `push` mutates in place. Fix: be sure you are pushing onto the array you mean.",
            "**Going past the end.** `sevas[99]` is `undefined`. Fix: stay within `0` to `length - 1`.",
          ],
          tryIt:
            'Model the daily sevas (Mangalarathi ₹40, Hannikaayi ₹25, Rangapooje ₹30) as an array of objects with `pricePaise`, then print the name and price of the second one.',
          takeaway:
            'Objects group named fields (one seva); arrays list ordered items (many sevas); an array of objects is the workhorse shape.',
        },
        {
          id: 'm0-t8',
          title: 'Functions, arrow functions, and callbacks',
          explain:
            'A function is a named, reusable block of logic; arrow functions are a shorter syntax; a callback is a function you hand to another function to run later.',
          analogy:
            'A function is a standard counter procedure — "issue a Mangalarathi ticket" — that any staff member can perform on demand by name. An **arrow function** is the same procedure written on a small sticky note for quick jobs. A **callback** is like telling a colleague, "when the next devotee reaches the front, do *this*" — you hand over the procedure to be run at the right moment, not now.',
          theory:
            'A **function** packages logic so you can reuse it. The classic form:\n```\nfunction ticketTotal(qty, pricePaise) {\n  return qty * pricePaise;\n}\n```\nYou *call* it with `ticketTotal(3, 4000)`. It takes **parameters** (`qty`, `pricePaise`) and `return`s a value.\n\n**Arrow functions** are a shorter syntax, common in modern code:\n```\nconst ticketTotal = (qty, pricePaise) => qty * pricePaise;\n```\nWith a single expression you can drop the braces and the word `return`. Arrows are especially handy as small throwaway functions.\n\nA **callback** is simply a function passed *as an argument* to another function, to be called later. Array methods like `map` and `filter` take callbacks; so do timers and database calls. For example `setTimeout(() => console.log(\'Rangapooje starting\'), 1000)` hands an arrow function to `setTimeout` to run after one second. Understanding "a function is a value you can pass around" unlocks most of JavaScript.',
          whyItMatters:
            'Callbacks and arrow functions are everywhere in JavaScript and React, and interviewers love asking you to write or trace them. In the Maranakatte Seva app, every button click handler, every array transformation, and every database query result is handled by a function you pass in — so this is foundational.',
          steps: [
            'Write a classic `function ticketTotal(qty, pricePaise)` that returns the product.',
            'Rewrite it as an arrow function assigned to a `const`.',
            'Call both and confirm they give the same result.',
            'Write a function `forEachSeva(sevas, action)` that calls `action` on each seva.',
            'Pass an arrow function as the `action` callback to print each name.',
            'Use `setTimeout(() => ..., 1000)` to see a callback run later.',
          ],
          code:
            '// Classic function\n' +
            'function ticketTotal(qty, pricePaise) {\n' +
            '  return qty * pricePaise;\n' +
            '}\n\n' +
            '// Same thing as an arrow function\n' +
            'const ticketTotalArrow = (qty, pricePaise) => qty * pricePaise;\n\n' +
            'console.log(ticketTotal(3, 4000));      // 12000 (3 x ₹40)\n' +
            'console.log(ticketTotalArrow(3, 4000)); // 12000\n\n' +
            '// A callback: forEachSeva runs the action you give it\n' +
            'function forEachSeva(sevas, action) {\n' +
            '  for (const seva of sevas) {\n' +
            '    action(seva);\n' +
            '  }\n' +
            '}\n' +
            "const sevas = [{ name: 'Mangalarathi' }, { name: 'Hannikaayi' }];\n" +
            'forEachSeva(sevas, (s) => console.log(s.name)); // Mangalarathi, Hannikaayi',
          pitfalls: [
            '**Forgetting to `return`.** The function gives back `undefined`. Fix: return the value (arrows with braces need an explicit `return`).',
            '**Calling instead of passing a callback.** `action(seva)` runs it now; `action` passes it. Fix: pass the function name without parentheses.',
            '**Mismatched parameter order.** Swapping `qty` and `pricePaise` gives wrong totals. Fix: keep the argument order consistent.',
            '**Expecting `this` to behave like classic functions inside arrows.** Arrows capture the outer `this`. Fix: know the difference; for callbacks, arrows are usually what you want.',
            '**Deeply nesting callbacks ("callback hell").** Code becomes unreadable. Fix: prefer promises/async-await for sequencing (next topics).',
            '**Naming a function and a variable the same.** They clash. Fix: use distinct, descriptive names.',
          ],
          tryIt:
            'Write an arrow function `discounted(pricePaise, pct)` that returns the price after a percentage discount, then use it inside a callback to print discounted prices for the daily sevas.',
          takeaway:
            'Functions package reusable logic; arrow functions are shorter syntax; callbacks are functions passed to run later.',
        },
        {
          id: 'm0-t9',
          title: 'Array methods: map, filter, reduce over sevas',
          explain:
            '`map` transforms every item, `filter` keeps only the items you want, and `reduce` boils a list down to a single value like a total.',
          analogy:
            'Picture the day\'s stack of seva tickets on the counter spike. **`map`** is re-stamping every ticket with a new label (add a formatted price). **`filter`** is pulling out only the evening Rangapooje tickets and setting the rest aside. **`reduce`** is the clerk running down the whole stack with a calculator to announce one grand total for the cash drawer.',
          theory:
            'These three array methods replace most hand-written loops and read far more clearly. Each takes a **callback**.\n\n**`map(fn)`** returns a *new* array of the same length, with each item transformed:\n```\nconst names = sevas.map((s) => s.name);\n```\n\n**`filter(fn)`** returns a *new*, usually shorter array containing only items for which the callback returns `true`:\n```\nconst dailySevas = sevas.filter((s) => s.daily);\n```\n\n**`reduce(fn, start)`** collapses the array into a single value. The callback receives an **accumulator** (the running result) and the current item:\n```\nconst totalPaise = sevas.reduce((sum, s) => sum + s.pricePaise, 0);\n```\nThe `0` is the starting accumulator. All three are **non-mutating** — they leave the original array untouched and hand you a new result, which keeps your data predictable.',
          whyItMatters:
            'map/filter/reduce are the most-asked JavaScript topic in interviews, full stop. In the Maranakatte Seva app you will `filter` the daily counter sevas from the date-based bookings, `map` a list of database rows into display rows, and `reduce` a cart of sevas into the rupee total the staff member collects — so you will use all three constantly.',
          steps: [
            'Build an array of seva objects with `name`, `pricePaise`, and `daily`.',
            'Use `map` to produce an array of just the names.',
            'Use `filter` to keep only `daily` sevas.',
            'Use `reduce` to total `pricePaise` across the array.',
            'Chain them: filter daily sevas, then reduce their total.',
            'Confirm the original array is unchanged after all three.',
          ],
          code:
            'const sevas = [\n' +
            "  { name: 'Mangalarathi', pricePaise: 4000, daily: true },\n" +
            "  { name: 'Hannikaayi',   pricePaise: 2500, daily: true },\n" +
            "  { name: 'Yakshagana',   pricePaise: 200000, daily: false },\n" +
            "  { name: 'Annadhana',    pricePaise: 500000, daily: false },\n" +
            '];\n\n' +
            '// map: transform -> array of names\n' +
            'const names = sevas.map((s) => s.name);\n' +
            "console.log(names); // ['Mangalarathi','Hannikaayi','Yakshagana','Annadhana']\n\n" +
            '// filter: narrow -> only daily counter sevas\n' +
            'const daily = sevas.filter((s) => s.daily);\n' +
            'console.log(daily.length); // 2\n\n' +
            '// reduce: total all prices into one number (in paise)\n' +
            'const totalPaise = sevas.reduce((sum, s) => sum + s.pricePaise, 0);\n' +
            'console.log(totalPaise); // 706500\n\n' +
            '// chain: total of the daily sevas only\n' +
            'const dailyTotal = sevas\n' +
            '  .filter((s) => s.daily)\n' +
            '  .reduce((sum, s) => sum + s.pricePaise, 0);\n' +
            'console.log(dailyTotal); // 6500',
          pitfalls: [
            '**Forgetting `map` returns a new array.** Mutating items inside it surprises you. Fix: use the returned array; keep callbacks pure.',
            '**Leaving out the `0` start value in `reduce`.** The first item becomes the accumulator and the maths goes wrong. Fix: always pass an initial value.',
            "**Using `filter` when you mean `find`.** `filter` returns an array; `find` returns one matching item. Fix: use `find` for a single result.",
            "**Forgetting to `return` inside a braced callback.** `map`/`filter` then yield `undefined`/drop everything. Fix: return a value.",
            '**Expecting these methods to change the original array.** They do not. Fix: assign the result to a variable.',
            "**Reducing money as floats.** Rounding errors creep in. Fix: keep amounts in integer paise while reducing.",
          ],
          tryIt:
            'From the seva array, use `filter` to get only date-based bookings (`daily === false`), then `reduce` to print their combined price in rupees using your `rupees(paise)` helper.',
          takeaway:
            '`map` transforms, `filter` narrows, `reduce` totals — all non-mutating, all driven by a callback.',
        },
        {
          id: 'm0-t10',
          title: 'Promises & async/await (why database calls must wait)',
          explain:
            'A Promise represents a result that arrives later; `async`/`await` lets you write that waiting code as if it were ordinary top-to-bottom steps.',
          analogy:
            'When a devotee orders an Annadhana booking, the clerk does not freeze the entire counter while the kitchen confirms the date — they take a token and keep serving the queue, and the answer comes back shortly. A **Promise** is that token: a stand-in for an answer that is "not ready yet". `await` is the clerk pausing *just that one order* until the token is honoured, while the rest of the counter keeps moving.',
          theory:
            'Some operations take time: reading a database, a file, or the network. JavaScript does not sit idle waiting — it uses **Promises**. A Promise is an object that will eventually **resolve** with a value or **reject** with an error. Talking to PostgreSQL via `pg` returns a Promise, because the answer is not instant.\n\nThe modern way to use Promises is **`async`/`await`**:\n- Mark a function `async`.\n- Inside it, put `await` before a Promise to pause until it resolves, then continue with the value.\n```\nasync function loadSevas(db) {\n  const result = await db.query(\'SELECT * FROM seva\');\n  return result.rows;\n}\n```\nThis reads top-to-bottom like normal code, but it does not block the rest of the app. Wrap awaits in **`try`/`catch`** to handle errors (a failed query). Remember: `await` only works *inside* an `async` function, and calling an async function gives you a Promise you must `await` (or `.then()`) in turn.',
          whyItMatters:
            'Async/await is essential and heavily interviewed — "what is a Promise?" and "why async?" come up constantly. Every database call in the Maranakatte Seva app (issuing a ticket, looking up a devotee\'s gotra, listing today\'s Rangapooje tickets) is asynchronous, so without `async`/`await` the app would either freeze the counter UI or get the order of operations wrong.',
          steps: [
            'Write an `async` function and put `await` before a Promise inside it.',
            'Simulate a slow database call with a Promise that resolves after a delay.',
            'Use `await` to get its value and log it.',
            'Wrap the `await` in `try`/`catch` to handle a possible error.',
            'Call the async function and handle its returned Promise with `.then()` or another `await`.',
            'Observe that code *after* the async call still runs without waiting.',
          ],
          code:
            '// Simulate a slow DB lookup that resolves after 500ms\n' +
            'function fetchSevasFromDb() {\n' +
            '  return new Promise((resolve) => {\n' +
            '    setTimeout(() => {\n' +
            "      resolve([{ name: 'Mangalarathi' }, { name: 'Rangapooje' }]);\n" +
            '    }, 500);\n' +
            '  });\n' +
            '}\n\n' +
            'async function loadSevas() {\n' +
            '  try {\n' +
            '    const sevas = await fetchSevasFromDb(); // pause here until ready\n' +
            "    console.log('Loaded', sevas.length, 'sevas');\n" +
            '    return sevas;\n' +
            '  } catch (err) {\n' +
            "    console.error('Could not load sevas:', err);\n" +
            '  }\n' +
            '}\n\n' +
            'loadSevas(); // returns a Promise; the counter keeps responding meanwhile',
          pitfalls: [
            "**Using `await` outside an `async` function.** Syntax error. Fix: mark the enclosing function `async`.",
            '**Forgetting to `await` a Promise.** You log the Promise object, not the data. Fix: `await` it (or use `.then`).',
            '**No `try`/`catch` around awaits.** A failed query crashes silently. Fix: wrap awaits and handle errors.',
            '**Calling an async function and ignoring its returned Promise.** You lose the result/errors. Fix: `await` it or chain `.then().catch()`.',
            '**`await` inside a plain loop running serially when parallel is fine.** It is slow. Fix: use `Promise.all` for independent calls.',
            '**Thinking `async` makes code run in a background thread.** It does not — it just manages waiting. Fix: understand it is cooperative, not multi-threaded.',
          ],
          tryIt:
            'Write an async `getTotal()` that awaits a faked Promise returning seva prices in paise, then reduces them to a total and logs the rupee amount. Add a `try`/`catch`.',
          takeaway:
            'Promises stand in for later results; `async`/`await` lets you write asynchronous database code in clear, sequential style.',
        },
        {
          id: 'm0-t11',
          title: 'ES modules (import/export) vs CommonJS (require)',
          explain:
            'Both are ways to split code across files and share it; ES modules use `import`/`export`, CommonJS uses `require`/`module.exports` — and Electron uses both.',
          analogy:
            'Imagine the temple keeps separate registers — one for the seva rate card, one for devotee records, one for daily tickets — instead of one impossibly thick book. Each register `export`s the pages others may read, and a clerk `import`s exactly the register they need. Modules are those separate registers; without them, the Maranakatte Seva app would be one unmanageable file.',
          theory:
            'A **module** is just a file that shares some of its code with other files. JavaScript has two module systems you will meet:\n\n**ES Modules (ESM)** — the modern standard, used in your React/Vite code:\n```\n// seva.js\nexport const sevas = [/* ... */];\nexport function total(list) { /* ... */ }\n\n// app.js\nimport { sevas, total } from \'./seva.js\';\n```\nYou can also `export default` one main thing per file.\n\n**CommonJS (CJS)** — the original Node system:\n```\n// seva.js\nconst sevas = [/* ... */];\nmodule.exports = { sevas };\n\n// app.js\nconst { sevas } = require(\'./seva.js\');\n```\n\nWhy care? **Electron straddles both.** The **main process** code has traditionally used CommonJS (`require(\'electron\')`), while your **renderer** (React) code written with Vite uses ES modules. You will read and write both styles in this one app, so recognise them on sight. A `package.json` `"type": "module"` flips the default to ESM for `.js` files; `.cjs` and `.mjs` extensions force one style explicitly.',
          whyItMatters:
            'Mixing up `import` and `require` is a top source of beginner errors and a frequent interview discussion. In the Maranakatte Seva app you will write CommonJS-style main-process code that loads `electron` and `pg`, and ESM-style React components — knowing which is which prevents a whole class of "module not found" failures.',
          steps: [
            'Create `seva.js` and `export` an array and a function from it (ESM).',
            'Create `app.js` and `import` them, then use them.',
            'Run it with Node (set `"type": "module"` or use a `.mjs` file).',
            'Now rewrite `seva.js` using `module.exports` (CommonJS).',
            'Load it from `app.js` with `require` and run with plain Node.',
            'Note which style Electron main vs renderer expects.',
          ],
          code:
            '// ----- ES Modules (renderer / React / Vite) -----\n' +
            '// seva.js\n' +
            "export const sevas = [{ name: 'Mangalarathi', pricePaise: 4000 }];\n" +
            'export function totalPaise(list) {\n' +
            '  return list.reduce((sum, s) => sum + s.pricePaise, 0);\n' +
            '}\n\n' +
            '// app.js\n' +
            "import { sevas, totalPaise } from './seva.js';\n" +
            'console.log(totalPaise(sevas)); // 4000\n\n' +
            '// ----- CommonJS (Electron main process) -----\n' +
            '// db.cjs\n' +
            "const { Client } = require('pg');\n" +
            'function makeClient() {\n' +
            "  return new Client({ database: 'maranakatte' });\n" +
            '}\n' +
            'module.exports = { makeClient };',
          pitfalls: [
            "**Mixing `import` and `require` in the same file.** It errors. Fix: pick one style per file.",
            '**Using `import` in a plain `.js` Node file without `"type": "module"`.** "Cannot use import statement". Fix: set the type or use `.mjs`.',
            "**Forgetting the `./` and file extension in ESM imports.** Resolution fails. Fix: write `import x from './seva.js'`.",
            "**Confusing default and named exports.** `import { x }` vs `import x`. Fix: match the export style exactly.",
            '**Assuming Electron main can use `import` freely.** Traditionally it is CommonJS. Fix: use `require` in main (or configure ESM deliberately).',
            "**Circular imports between two modules.** You get `undefined` exports. Fix: restructure so modules do not import each other in a loop.",
          ],
          tryIt:
            'Make a `catalog.js` ES module that exports a `sevas` array and a `findByName(name)` function, then import both into an `app.js` and look up "Rangapooje".',
          takeaway:
            'ES modules (`import`/`export`) are the modern standard for your React code; CommonJS (`require`) is traditional in Electron\'s main process — you will use both.',
        },
      ],
    },
    {
      id: 'm0-s3',
      title: 'Why a Desktop App',
      topics: [
        {
          id: 'm0-t12',
          title: 'Web app vs desktop app — why offline matters at the counter',
          explain:
            'A web app runs in a browser and needs a server (usually online); a desktop app is installed and runs fully on the local machine, which is exactly what an offline temple counter needs.',
          analogy:
            'A web app is like ordering prasada through a delivery service — convenient, but if the road to Maranakatte is cut off by monsoon rain, nothing arrives. A desktop app is the temple\'s own kitchen on-site: it keeps serving every devotee regardless of what is happening on the highway or the internet line.',
          theory:
            'A **web app** lives on a server and you reach it through a browser. It is easy to update centrally, but it usually depends on a working internet connection and a hosted backend. If the connection drops, the app often stops working.\n\nA **desktop app** is installed on the computer and runs locally. Its code, its window, and — in our case — its **database** all live on that one machine. It does not need the internet to function.\n\nFor the Maranakatte Seva counter near Byndoor, connectivity is patchy, especially in the monsoon. The counter cannot pause issuing Mangalarathi or Rangapooje tickets because a tower is down. So the app is built **offline-first**: a desktop app with a **local PostgreSQL** database under the user\'s machine. Benefits:\n- Works with zero internet.\n- Fast — no network round-trips for every ticket.\n- Data privacy — devotee names, gotras and phone numbers never leave the temple computer.\nThe trade-off is that updates and backups are the temple\'s responsibility, which the app will handle thoughtfully (including the keep-or-delete-data uninstaller).',
          whyItMatters:
            'Choosing the right app architecture for the constraints is a senior-level instinct interviewers probe ("why not just a website?"). For Maranakatte Seva, "offline-first desktop" is the whole justification for the project: a website would be useless the moment the connection drops mid-Rangapooje rush.',
          steps: [
            'List the constraints of the temple counter (patchy internet, privacy, speed).',
            'Contrast: would a browser-only web app keep working with no internet? (No.)',
            'Conclude that a locally installed desktop app fits.',
            'Note that the database must also be local for true offline use.',
            'Identify the trade-off: backups/updates become a local responsibility.',
            'Decide the stack: Electron desktop app + local PostgreSQL.',
          ],
          code:
            '// A thought-experiment, not running code:\n' +
            '// Web app flow (needs internet for every action):\n' +
            "//   Browser  ->  (internet)  ->  Server  ->  Cloud DB\n" +
            '//   If the internet is down at Maranakatte, the whole chain breaks.\n\n' +
            '// Desktop app flow (fully local):\n' +
            "//   Electron window  ->  Node main process  ->  local PostgreSQL\n" +
            '//   No internet required; everything is on the counter computer.\n\n' +
            "const needsInternetToIssueTicket = false; // by design\n" +
            'console.log(needsInternetToIssueTicket); // false',
          pitfalls: [
            "**Assuming everywhere has reliable internet.** Rural/coastal counters often do not. Fix: design offline-first.",
            '**Putting devotee data in the cloud "for convenience".** It raises privacy and dependency concerns. Fix: keep data local.',
            '**Forgetting that a local app still needs backups.** Local-only means *you* own backup. Fix: plan a backup/export feature.',
            "**Believing desktop apps cannot be modern.** Electron uses the same web tech (React). Fix: you get web UI skills *and* offline.",
            '**Overlooking update distribution.** No server means you must ship updates. Fix: plan installers (electron-builder, later).',
            "**Confusing 'desktop' with 'no database'.** Desktop apps still need real storage. Fix: ship a local DB (PostgreSQL).",
          ],
          tryIt:
            'Write a short note listing three reasons the Maranakatte Seva counter must work offline, and one trade-off the temple accepts by going local.',
          takeaway:
            'A local desktop app with a local database keeps the temple counter working through patchy internet — that offline-first need is why we are not building a website.',
        },
        {
          id: 'm0-t13',
          title: 'What is Electron (Chromium + Node in one app)',
          explain:
            'Electron lets you build a cross-platform desktop app using web technologies (HTML, CSS, JavaScript/React) by combining a Chromium browser window with a Node.js backend in one package.',
          analogy:
            'Electron is like giving the temple\'s familiar notice-board (a web page everyone can read) its own private power supply and storeroom so it works as a standalone installed application — no browser, no internet needed. You design the screen with the same web skills, but it ships as a real program on the counter computer.',
          theory:
            '**Electron** is a framework for building desktop apps with web technologies. The same HTML, CSS, and JavaScript (and React) you would use for a website become a real installable Windows/Mac/Linux app. Apps like VS Code, Slack, and WhatsApp Desktop are built with Electron.\n\nUnder the hood Electron bundles two big pieces:\n- **Chromium** — the rendering engine behind Chrome — which draws your user interface in a window.\n- **Node.js** — which gives that app full access to the operating system: files, the database, printing, and so on.\n\nThis pairing is the magic: a normal web page in a browser *cannot* touch your hard disk or open a PostgreSQL connection, but an Electron app *can*, because Node is right there alongside it. For the Maranakatte Seva app, that means we build the ticket screens with React (web skills) while Node quietly talks to the local PostgreSQL database — all inside one installed program that needs no internet.',
          whyItMatters:
            'Electron is a widely used, very employable skill, and interviewers will ask "how does Electron differ from a website?" The Maranakatte Seva app exists *because* Electron lets a web-style UI reach local resources (the database, the printer) — the exact combination an offline temple counter requires.',
          steps: [
            'Note the two halves Electron bundles: Chromium (UI) and Node (system access).',
            'List familiar apps built with Electron (VS Code, Slack).',
            'Understand a plain web page cannot reach the disk or DB, but Electron can.',
            'Map this to the app: React draws screens, Node reaches PostgreSQL.',
            'Install Electron as a devDependency: `npm install --save-dev electron`.',
            'Recognise that the app ships as one installable program.',
          ],
          code:
            '// A minimal Electron main file (CommonJS), conceptually:\n' +
            "const { app, BrowserWindow } = require('electron');\n\n" +
            'function createWindow() {\n' +
            '  const win = new BrowserWindow({ width: 1000, height: 700 });\n' +
            "  win.loadFile('index.html'); // Chromium renders this UI\n" +
            '}\n\n' +
            "app.whenReady().then(createWindow);\n\n" +
            '// Because Node runs alongside, this same app can later require(\'pg\')\n' +
            '// and open the LOCAL PostgreSQL database — something a browser tab cannot do.',
          pitfalls: [
            "**Thinking Electron is just a website wrapper.** It is web UI *plus* full Node power. Fix: remember the Node half is the point.",
            '**Putting database code directly in the UI window.** It is insecure (covered next topics). Fix: keep Node/DB in the main process.',
            "**Worrying Electron apps are tiny.** They bundle Chromium, so installers are larger. Fix: accept the size for the offline benefits.",
            '**Expecting browser-only APIs to be enough.** You need Node APIs for files/DB. Fix: use the main process for system work.',
            "**Installing electron as a normal dependency.** It is build-time. Fix: `npm install --save-dev electron`.",
            "**Assuming one window means one process.** Electron has main *and* renderer processes. Fix: learn the split (next topic).",
          ],
          tryIt:
            'In your own words, write two sentences explaining to a temple trustee why Electron lets the same kind of screen they see on a website also print tickets and save data locally.',
          takeaway:
            'Electron fuses a Chromium UI with Node.js system access in one installable app, so web-style screens can reach the local database and printer.',
        },
        {
          id: 'm0-t14',
          title: 'Main process vs renderer process',
          explain:
            'Every Electron app has a single privileged main process (Node, runs the app and the database) and one or more renderer processes (the Chromium windows that show your UI).',
          analogy:
            'Think of the temple office and the counter window. The **main process** is the back office where the master ledgers and the safe live — only trusted staff go in, and it can do anything: open the seva register, write to the database, talk to the printer. The **renderer process** is the public counter window where the devotee interacts — friendly and visible, but it cannot reach into the safe directly; it must pass a request through to the office.',
          theory:
            'Electron splits an app into two kinds of process:\n\n**Main process** — there is exactly one. It is plain **Node.js**, started from your main file. It creates windows, controls the app lifecycle, and has full system access: the file system, the **local PostgreSQL** database, the printer. Your `pg` queries live here.\n\n**Renderer process** — one per window. It is a **Chromium** page running your React UI. It draws the seva buttons, the cart, the ticket preview. For security it runs *without* direct Node or database access.\n\nThe two halves talk through **IPC** (Inter-Process Communication): the renderer sends a message ("issue a Rangapooje ticket"), the main process does the privileged work (write to the DB, print), and sends back the result. You will wire this safely with a **preload** script and `contextBridge` (covered next). The key mental model: **UI in the renderer, all data and system work in the main process** — never let the window touch the database directly.',
          whyItMatters:
            'The main/renderer split — and *why* it exists for security — is the single most important Electron interview topic. For the Maranakatte Seva app it is structural: keeping all `pg` and file access in the main process, with the renderer only sending requests, is what keeps devotee data safe and the app maintainable.',
          steps: [
            'Identify the single main process as plain Node with full access.',
            'Identify renderer processes as Chromium windows showing React.',
            'Note the renderer has no direct DB/file access by design.',
            'Understand they communicate through IPC messages.',
            'Place responsibilities: `pg` queries in main, UI in renderer.',
            'Preview that a preload + contextBridge will safely connect them.',
          ],
          code:
            '// MAIN process (Node) — has DB access. main.cjs\n' +
            "const { app, BrowserWindow, ipcMain } = require('electron');\n" +
            "const { Client } = require('pg');\n\n" +
            "ipcMain.handle('sevas:list', async () => {\n" +
            "  const db = new Client({ database: 'maranakatte' });\n" +
            '  await db.connect();\n' +
            "  const result = await db.query('SELECT name, price FROM seva');\n" +
            '  await db.end();\n' +
            '  return result.rows; // sent back to the renderer\n' +
            '});\n\n' +
            '// RENDERER (React) — NO direct DB. It only asks the main process:\n' +
            '// const sevas = await window.api.listSevas();  (wired via preload, next module)\n' +
            '// UI lives here; data work lives in main.',
          pitfalls: [
            '**Doing database work in the renderer.** It is a security hole and often impossible. Fix: keep `pg` in the main process.',
            "**Thinking there can be many main processes.** There is exactly one. Fix: one main, many renderers.",
            "**Calling Node APIs directly from React.** With proper security they are not exposed. Fix: go through IPC.",
            '**Blocking the main process with heavy synchronous work.** Every window freezes. Fix: keep main-process work async.',
            "**Forgetting renderers are sandboxed browser pages.** They cannot open files. Fix: request such work from main via IPC.",
            "**Mixing UI logic into the main process.** It muddies the design. Fix: UI in renderer, data/system in main.",
          ],
          tryIt:
            'Sketch (in words or a diagram) the path of "issue a Rangapooje ticket": which process the click happens in, how it reaches the database, and how the printed result comes back.',
          takeaway:
            'One main process (Node) owns data and system access; renderer processes (Chromium) show the UI — they talk only through IPC.',
        },
        {
          id: 'm0-t15',
          title: 'The npm tooling for desktop: electron, vite, electron-builder',
          explain:
            'A quick map of the three build tools you will use: `electron` runs the desktop app, `electron-vite`/`vite` bundles and hot-reloads your React code during development, and `electron-builder` packages the finished app into an installer.',
          analogy:
            'Building the Maranakatte Seva app is like preparing for a festival. **Vite** is the fast prep kitchen where you cook and taste changes instantly during development. **Electron** is the actual serving hall where the app runs as a desktop window. **electron-builder** is the packing crew who box everything into a tidy installer the temple can carry to the counter computer and set up.',
          theory:
            'Three tools, three jobs:\n\n- **`electron`** — the runtime that actually launches your app as a desktop window. You install it as a devDependency and run it (usually via a script) to see the app.\n- **`vite`** (often through **`electron-vite`**) — a lightning-fast **bundler** and dev server for your renderer code. It compiles your React/JSX, and during development it gives **hot reload**: change a seva button, see it update instantly without a full restart. `electron-vite` is a thin layer that wires Vite up for both the main and renderer parts of an Electron app.\n- **`electron-builder`** — the **packager**. When the app is ready, it produces a real installer (`.exe` on Windows, `.dmg` on Mac) that bundles Chromium, your code, and everything else into one file you can hand to the temple.\n\nThese are all **devDependencies** — they build and run the app but are not part of what the user installs as data. You will typically have `npm run dev` (vite + electron for development) and `npm run build` (electron-builder for a distributable installer).',
          whyItMatters:
            'Knowing the build pipeline — dev server vs runtime vs packager — is exactly the kind of practical tooling question interviewers ask about real projects. For the Maranakatte Seva app, this map tells you which command to run while coding (`dev`, with hot reload) versus when shipping the finished installer (`build`) to the temple counter.',
          steps: [
            'Install the dev tools: `npm install --save-dev electron vite electron-vite electron-builder`.',
            'Map each tool to its job: vite = dev/bundle, electron = run, electron-builder = package.',
            'Add a `"dev"` script that starts electron-vite in dev mode.',
            'Add a `"build"` script that runs electron-builder.',
            'Run `npm run dev` and edit a file to see hot reload.',
            'Understand `npm run build` produces an installer to hand to the temple.',
          ],
          code:
            '// package.json (scripts section) — the desktop build pipeline\n' +
            '{\n' +
            '  "scripts": {\n' +
            '    "dev": "electron-vite dev",      // fast dev server + hot reload\n' +
            '    "build": "electron-vite build",  // compile renderer + main\n' +
            '    "dist": "electron-builder"        // package into an installer (.exe / .dmg)\n' +
            '  },\n' +
            '  "devDependencies": {\n' +
            '    "electron": "^29.0.0",\n' +
            '    "vite": "^5.0.0",\n' +
            '    "electron-vite": "^2.0.0",\n' +
            '    "electron-builder": "^24.0.0"\n' +
            '  }\n' +
            '}',
          pitfalls: [
            "**Confusing the dev server with the packaged app.** `npm run dev` is not what you ship. Fix: ship the electron-builder output.",
            '**Installing these as normal dependencies.** They are build-time only. Fix: use `--save-dev`.',
            "**Expecting hot reload in the packaged app.** That is a dev-only feature. Fix: rebuild to see changes in the installer.",
            "**Skipping electron-vite and wiring Vite by hand.** It is fiddly for Electron. Fix: let electron-vite configure both halves.",
            '**Running electron-builder before the app is built.** You package stale or missing code. Fix: build first, then package.',
            "**Forgetting the installer bundles Chromium.** Output is sizeable. Fix: expect a large installer; it is normal.",
          ],
          tryIt:
            'Write down, for each tool (electron, vite/electron-vite, electron-builder), one sentence on when during the project you reach for it.',
          takeaway:
            'vite/electron-vite builds and hot-reloads during development, electron runs the app, and electron-builder packages it into an installer to ship.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm0-p1',
      type: 'Mini Project',
      title: 'Seva Price Calculator (Node CLI)',
      domain: 'Temple seva counter — billing basics',
      duration: '2 hours',
      description:
        'A small Node.js command-line script that holds a cart of sevas with rupee amounts, totals them safely in paise, applies an optional quantity, and prints a clean receipt-like summary to the terminal — the seed of the app\'s ticket total.',
      tools: ['Node.js', 'JavaScript', 'npm', 'VS Code'],
      blueprint: {
        overview:
          'You will build a single Node script, `calculator.js`, that represents a devotee\'s cart of sevas as an array of objects, computes the total using integer-paise arithmetic (no floats), and prints a receipt with each line item and a grand total in ₹. It cements variables, objects, arrays, functions, and money-safe maths from this module.',
        functionalRequirements: [
          '**Cart model.** Represent the cart as an array of seva objects, each with `name`, `pricePaise`, and `qty`.',
          '**Line totals.** For each seva, compute `pricePaise * qty` and show it as a rupee amount.',
          '**Grand total.** Sum all line totals into one grand total using `reduce`, kept in paise.',
          '**Receipt output.** Print a neat receipt: temple name header, one line per seva, and the grand total in ₹ with two decimals.',
          '**Money safety.** All arithmetic happens in whole paise; convert to rupees only for display.',
        ],
        technicalImplementation: [
          '**Single file.** Put everything in `calculator.js`, run it with `node calculator.js`.',
          '**Data.** A `const cart = [ { name, pricePaise, qty }, ... ]` array of objects.',
          '**Helpers.** A `rupees(paise)` function returning a `₹` string via `(paise/100).toFixed(2)`, and a `lineTotal(seva)` function.',
          '**Total.** Use `cart.reduce((sum, s) => sum + lineTotal(s), 0)` for the grand total in paise.',
          '**Output.** Use `console.log` with template strings to print the receipt lines and total.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold the cart and money helper',
            outcome: 'A `calculator.js` with a sample cart array and a working `rupees(paise)` formatter.',
            prompt:
              'Create a Node.js file calculator.js for a temple seva counter. Define a const cart array of seva objects, each with name (string), pricePaise (integer paise), and qty (integer) — include Mangalarathi (4000), Hannikaayi (2500), and a Rangapooje ticket (3000). Add a function rupees(paise) that returns a string like "₹65.00" using (paise/100).toFixed(2). Log the formatted price of the first cart item. Explain why we store money as integer paise instead of decimals.',
          },
          {
            step: 2,
            label: 'Compute line totals and the grand total',
            outcome: 'Functions that compute each line total and a reduce-based grand total in paise.',
            prompt:
              'In calculator.js, add a function lineTotal(seva) that returns seva.pricePaise * seva.qty. Then compute the grand total across the whole cart using cart.reduce, keeping everything in paise. Log the grand total via the rupees() helper. Keep all arithmetic in integer paise and only format at display time.',
          },
          {
            step: 3,
            label: 'Print a receipt-style summary',
            outcome: 'A formatted terminal receipt with a header, line items, and a grand total in ₹.',
            prompt:
              'In calculator.js, print a receipt to the terminal: a header line "Shri Brahmalingeshwara Temple, Maranakatte", then one line per seva showing name, qty, and its line total formatted with rupees(), then a separator and a "Grand Total" line. Use console.log with padded/aligned columns so it reads like a real seva counter receipt.',
          },
        ],
      },
    },
    {
      id: 'm0-p2',
      type: 'Mini Project',
      title: 'Seva Catalog Module (JS)',
      domain: 'Temple seva catalogue — reusable data module',
      duration: '2 hours',
      description:
        'A reusable JavaScript module that holds the temple\'s sevas as an array of objects and exposes clean helper functions — filter daily vs date-based sevas, find a seva by name, and total a selection — using map/filter/reduce and ES module exports.',
      tools: ['Node.js', 'JavaScript', 'ES Modules', 'VS Code'],
      blueprint: {
        overview:
          'You will build `catalog.js`, an ES module that owns the seva catalogue and exposes helper functions, plus an `app.js` that imports and uses them. It practises array-of-objects modelling, map/filter/reduce, and `import`/`export` — the exact shape the real app will reuse for its seva list.',
        functionalRequirements: [
          '**Catalogue data.** Hold an array of seva objects, each with `name`, `pricePaise`, `daily` (boolean), and `category`.',
          '**Filter helpers.** Export `dailySevas()` and `bookingSevas()` that filter daily counter sevas vs date-based bookings.',
          '**Find helper.** Export `findByName(name)` that returns the matching seva or `undefined`.',
          '**Total helper.** Export `totalPaise(list)` that reduces a list of sevas to a total in paise.',
          '**Consumer.** An `app.js` that imports the module and prints the daily sevas and their combined total in ₹.',
        ],
        technicalImplementation: [
          '**ES modules.** Use `export`/`import`; run with `"type": "module"` in package.json or `.mjs` files.',
          '**Data.** A module-level `const sevas = [ ... ]` array of objects, not exported directly.',
          '**Filtering.** `dailySevas` uses `sevas.filter((s) => s.daily)`; `bookingSevas` filters the opposite.',
          '**Finding.** `findByName` uses `sevas.find((s) => s.name === name)`.',
          '**Totals.** `totalPaise(list)` uses `list.reduce((sum, s) => sum + s.pricePaise, 0)`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Build the catalogue and filter helpers',
            outcome: 'A `catalog.js` ES module with the seva array and exported `dailySevas`/`bookingSevas`.',
            prompt:
              'Create an ES module catalog.js for a temple. Define a non-exported const sevas array of objects with name, pricePaise (integer), daily (boolean), and category. Include daily sevas (Mangalarathi 4000, Hannikaayi 2500, Rangapooje 3000) and date-based bookings (Yakshagana 200000, Annadhana 500000). Export two functions: dailySevas() returning sevas.filter(s => s.daily) and bookingSevas() returning the date-based ones. Use export, not module.exports.',
          },
          {
            step: 2,
            label: 'Add find and total helpers',
            outcome: 'Exported `findByName(name)` and `totalPaise(list)` functions using find and reduce.',
            prompt:
              'In catalog.js, add and export findByName(name) that returns sevas.find(s => s.name === name) or undefined, and totalPaise(list) that returns list.reduce((sum, s) => sum + s.pricePaise, 0). Keep amounts in integer paise. Add brief comments explaining each helper.',
          },
          {
            step: 3,
            label: 'Consume the module from app.js',
            outcome: 'An `app.js` that imports the helpers and prints daily sevas and their total in ₹.',
            prompt:
              'Create app.js that imports dailySevas, findByName, and totalPaise from ./catalog.js. Print the names of all daily sevas, look up "Rangapooje" and print its price, and print the combined total of the daily sevas formatted as a ₹ string with two decimals (paise/100). Show how to run it with Node using "type": "module" in package.json.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm0-q1',
      q: 'Why does the Maranakatte Seva app store rupee amounts as integer paise rather than decimal numbers?',
      options: [
        'Because JavaScript floating-point maths can produce rounding errors like 0.1 + 0.2 = 0.30000000000000004',
        'Because integers run faster than decimals on every computer',
        'Because PostgreSQL cannot store decimal numbers at all',
        'Because rupees do not have paise',
      ],
      answer: 0,
    },
    {
      id: 'm0-q2',
      q: 'In an Electron app, which process has direct access to the local PostgreSQL database and the file system?',
      options: [
        'The renderer process (the Chromium window)',
        'The main process (plain Node.js)',
        'Both processes equally by default',
        'Neither — only the cloud server does',
      ],
      answer: 1,
    },
    {
      id: 'm0-q3',
      q: 'You want to total the prices of a list of seva objects into a single number. Which array method fits best?',
      options: ['map', 'filter', 'reduce', 'push'],
      answer: 2,
    },
    {
      id: 'm0-q4',
      q: 'Which package.json section should `electron`, `vite`, and `electron-builder` go in?',
      options: [
        'dependencies, because the app needs them to run',
        'devDependencies, because they are only used to build and run the app during development',
        'scripts, because they are commands',
        'They should not be in package.json at all',
      ],
      answer: 1,
    },
    {
      id: 'm0-q5',
      q: 'Why is the Maranakatte Seva counter built as an offline desktop app instead of a website?',
      options: [
        'Because websites cannot display Kannada text',
        'Because the temple counter has patchy internet and must keep issuing tickets without a connection',
        'Because desktop apps are always cheaper to host',
        'Because PostgreSQL only works inside desktop apps',
      ],
      answer: 1,
    },
    {
      id: 'm0-q6',
      q: 'What does the `await` keyword do inside an `async` function when calling the database?',
      options: [
        'It runs the query on a separate CPU thread in the background',
        'It pauses that function until the Promise resolves, then continues with the result, without freezing the whole app',
        'It converts the Promise into a website request',
        'It makes the database call run synchronously and blocks every other app on the computer',
      ],
      answer: 1,
    },
  ],
};
