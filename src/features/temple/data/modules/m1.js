// Module 1 — Electron + React + Vite: Project & Architecture
// Sets up the offline "Maranakatte Seva" desktop app: Electron processes, React renderer, and the security bridge.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m1 = {
  id: 'm1',
  title: 'Electron + React + Vite: Project & Architecture',
  hours: 9,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Scaffold the offline Maranakatte Seva desktop app with Electron, React and Vite. Understand the main / preload / renderer split, run with hot reload, build a React counter UI, and lock the app down with Electron’s security model so the temple counter stays fast and safe.',
  sections: [
    {
      id: 'm1-s1',
      title: 'Scaffolding the app',
      topics: [
        {
          id: 'm1-t1',
          title: 'What Electron is, and why for the temple counter',
          explain:
            'Electron lets you build a real desktop app for the temple counter using web technology (HTML, CSS, JavaScript and React) instead of a separate desktop language.',
          analogy:
            'Think of the Maranakatte temple counter computer. The staff there have no internet to rely on during the evening Rangapooje rush — the app must live entirely on that machine. **Electron** is like fitting a self-contained billing kiosk: it wraps a web page (your React screen) inside its own window and gives it the power to read files and a local database on that very computer. The devotee sees a normal desktop window; underneath, it is web code running offline.',
          theory:
            '**Electron** packages a **Chromium** browser engine plus a **Node.js** runtime into one desktop application. That means two superpowers in one program:\n\n- **Chromium** renders your screens — the same HTML/CSS/React you would use on the web.\n- **Node.js** gives you access to the operating system: the file system, and (later) a local PostgreSQL database via the `pg` package.\n\nThe Maranakatte Seva app is **fully offline**. There is no cloud server; every devotee record (name, gotra, nakshatra, phone) and every ticket lives on the counter machine. Electron is ideal here because it can show a polished React counter screen *and* talk to a local database on the same computer, with no browser security wall stopping it.\n\nThe trade-off: an Electron app ships a whole browser, so it is larger than a tiny native app. For a temple counter that issues 500+ Rangapooje tickets an evening, the convenience of React plus local Node access is well worth it.',
          whyItMatters:
            'Choosing the right foundation decides everything that follows. Electron is the standard way to turn web skills into an installable, offline desktop app — exactly what a temple counter with no reliable internet needs.',
          steps: [
            'Understand Electron = Chromium (UI) + Node.js (OS/database access) in one app.',
            'Note the app must run fully offline on the counter machine.',
            'Note React renders the screens; Node reaches the local database later.',
            'Accept the trade-off: a larger download in exchange for web tooling + local power.',
            'Confirm Node.js (which includes npm) is installed: `node -v` and `npm -v`.',
            'Decide the app name: Maranakatte Seva.',
          ],
          code: `// Confirm your toolchain before scaffolding anything.
// Run these in a terminal (Command Prompt / PowerShell / Terminal):

// node -v    -> should print something like v20.x or v22.x
// npm -v     -> should print an npm version

// Electron itself is just an npm package you will add to a project:
//   npm install --save-dev electron

// Mental model of one Electron app:
//   [ Electron app ]
//      |-- Chromium  -> shows your React screens (the window)
//      '-- Node.js   -> reads files + local PostgreSQL (offline)`,
          pitfalls: [
            '**Thinking Electron needs the internet.** It does not. Fix: build everything to run offline; never assume a network call will succeed at the counter.',
            '**Confusing Electron with a website.** A website cannot open a local database; Electron can. Fix: remember Node.js access is the whole reason to use Electron here.',
            '**Not having Node.js installed.** `npm` commands fail. Fix: install Node.js (it bundles npm) before scaffolding.',
            '**Expecting a tiny app size.** Electron ships a browser, so the app is tens of MB. Fix: accept this; it is normal for desktop Electron apps.',
            '**Mixing up Chromium and Node responsibilities.** UI code runs in Chromium; database code runs in Node. Fix: keep them in their correct processes (covered soon).',
            '**Assuming you must learn a new desktop language.** Fix: Electron uses the same JavaScript/React you already use — no C# or Java needed.',
          ],
          tryIt:
            'Open a terminal and run `node -v` and `npm -v`. Confirm both print versions. If not, install Node.js from nodejs.org first — you cannot scaffold an Electron app without it.',
          takeaway: 'Electron = Chromium (UI) + Node.js (local power) in one offline desktop app — perfect for a no-internet temple counter built with React.',
        },
        {
          id: 'm1-t2',
          title: 'Scaffolding with electron-vite',
          explain:
            'Use the `electron-vite` scaffolder to generate a ready-made Electron + React + Vite project with the correct folder structure.',
          analogy:
            'Setting up the Maranakatte Seva project by hand is like building the temple counter desk, wiring, and drawers from raw timber yourself. **electron-vite** is the carpenter who hands you the desk pre-built: the drawers (main, preload, renderer) already labelled and fitted, so you can start serving devotees instead of sawing wood.',
          theory:
            '**Vite** is a fast modern build tool for web apps — it gives near-instant hot reload during development. **electron-vite** is a wrapper that wires Vite together with Electron, so all three parts of an Electron app (main, preload, renderer) are built correctly.\n\nYou scaffold a new project with a single command:\n\n`npm create @quick-start/electron@latest`\n\nIt asks for a project name (use `maranakatte-seva`), a framework (choose **React**), and whether to add TypeScript (you can choose JavaScript to keep things simple). It then generates a folder with `package.json`, the Vite config, and three source folders ready to run.\n\nThe key idea: you do **not** assemble Electron + React + Vite by hand. The scaffolder produces a working app in seconds, and you customise it for the temple counter from there.',
          whyItMatters:
            'Scaffolding correctly the first time saves hours of fragile manual configuration. electron-vite gives the Maranakatte Seva app a proven structure with hot reload from day one, so you spend time on seva features, not build plumbing.',
          steps: [
            'Open a terminal in the folder where the project should live.',
            'Run `npm create @quick-start/electron@latest`.',
            'Enter the project name `maranakatte-seva`.',
            'Choose the **React** framework, and JavaScript (not TypeScript) to start.',
            'Run `cd maranakatte-seva` then `npm install`.',
            'Run `npm run dev` and confirm a window opens.',
          ],
          code: `# Scaffold the offline temple-counter app
$ npm create @quick-start/electron@latest

# Answer the prompts:
#   Project name: ........ maranakatte-seva
#   Select a framework: .. React
#   Add TypeScript? ...... No   (JavaScript keeps it simple to start)

# Then install dependencies and run it:
$ cd maranakatte-seva
$ npm install
$ npm run dev

# A desktop window should open showing the starter React screen.
# You now have a working Electron + React + Vite app to customise.`,
          pitfalls: [
            '**Running the scaffolder inside an existing project folder.** It nests projects confusingly. Fix: run it in an empty parent folder.',
            '**Forgetting `npm install` after scaffolding.** `npm run dev` fails with missing modules. Fix: always install dependencies first.',
            '**Choosing a framework other than React.** You will not match this course. Fix: pick React at the prompt.',
            '**Picking TypeScript before you are comfortable.** Adds friction early. Fix: start with JavaScript; you can add TypeScript later.',
            '**Spaces or capitals in the project name.** Causes path issues on some systems. Fix: use lowercase with hyphens, e.g. `maranakatte-seva`.',
            '**Assuming the starter screen is your final UI.** It is just a demo. Fix: you will replace it with the counter screens in later sections.',
          ],
          tryIt:
            'Scaffold a new project with `npm create @quick-start/electron@latest`, name it `maranakatte-seva`, choose React, then `npm install` and `npm run dev`. Confirm a desktop window opens with the starter React page.',
          takeaway: 'Scaffold the app with electron-vite (React, JavaScript) to get a correct main/preload/renderer structure and hot reload in one command.',
        },
        {
          id: 'm1-t3',
          title: 'The folder structure: main / preload / renderer',
          explain:
            'An Electron + Vite project has three source areas — main, preload, and renderer — each with a distinct job and a different runtime.',
          analogy:
            'Picture the temple counter as three roles. The **main** process is the head clerk in the back office who holds the keys to the records room (files and the database). The **renderer** is the friendly desk where the devotee actually stands and sees the seva list. The **preload** is the trusted runner who carries slips between the desk and the back office — the only one allowed through the connecting door. Three roles, one smooth counter.',
          theory:
            'An electron-vite project keeps three source folders, usually under `src/`:\n\n- **`main/`** — the **main process**. Pure Node.js. It creates windows, and (later) opens the local PostgreSQL database. This is the only place with full OS power.\n- **`renderer/`** — the **renderer process**. Your **React app** — the screens the temple staff see and click. It runs inside Chromium with **no** direct Node/database access.\n- **`preload/`** — the **preload script**. A tiny, trusted bridge that runs before the renderer and safely exposes a limited `window.api` to React.\n\nThis split exists for **security and structure**: untrusted UI code (renderer) is kept away from powerful Node code (main), and they communicate only through the narrow preload bridge.\n\nThe config files — `electron.vite.config.js` and `package.json` — tell Vite how to build each of the three parts. You will rarely edit the structure; you mostly add files inside these folders.',
          whyItMatters:
            'Knowing which folder a piece of code belongs in is the foundation of a clean, secure Electron app. Database code in `main/`, UI in `renderer/`, and the bridge in `preload/` — get this right and the whole Maranakatte Seva app stays organised and safe.',
          steps: [
            'Open the scaffolded project and find `src/main`, `src/preload`, `src/renderer`.',
            'Note `main/` is Node.js — it will hold window creation and DB code.',
            'Note `renderer/` is your React app — the screens staff use.',
            'Note `preload/` is the bridge — the only link between the two.',
            'Open `electron.vite.config.js` and see the three build targets.',
            'Decide: database code goes in `main/`, never in `renderer/`.',
          ],
          code: `maranakatte-seva/
  package.json              # main entry + scripts (next topic)
  electron.vite.config.js   # tells Vite how to build all 3 parts
  src/
    main/
      index.js              # MAIN process: creates BrowserWindow, DB later
    preload/
      index.js              # PRELOAD: safe bridge -> window.api
    renderer/
      index.html
      src/
        App.jsx             # RENDERER: your React counter screens
        main.jsx            # React entry that mounts <App/>

// Rule of thumb:
//   files in main/     -> can touch files + local PostgreSQL (Node power)
//   files in renderer/ -> React UI only, NO direct DB access
//   files in preload/  -> the narrow, trusted bridge between them`,
          pitfalls: [
            '**Putting database (`pg`) code in `renderer/`.** It breaks security and often will not even work. Fix: all DB code lives in `main/`.',
            '**Importing Node modules like `fs` directly in React.** The renderer has no Node access. Fix: do it in `main/` and expose results via preload.',
            '**Editing the wrong `index.js`.** There are several. Fix: check the folder — `main/`, `preload/`, or `renderer/`.',
            '**Deleting the preload folder to simplify.** You lose the only safe bridge. Fix: keep preload; it is essential for security.',
            '**Confusing `renderer/index.html` with the app root.** React mounts into it. Fix: leave the HTML simple; build screens in `App.jsx`.',
            '**Assuming all three folders share one runtime.** They do not. Fix: remember main = Node, renderer = Chromium, preload = bridge.',
          ],
          tryIt:
            'Open your scaffolded project and locate `src/main/index.js`, `src/preload/index.js`, and `src/renderer/src/App.jsx`. Write one sentence next to each describing its job for the temple counter.',
          takeaway: 'Three folders, three jobs: `main/` (Node + DB power), `renderer/` (React UI), `preload/` (the safe bridge between them).',
        },
        {
          id: 'm1-t4',
          title: 'package.json: main entry & scripts',
          explain:
            'The `package.json` file names the app, points Electron at the main entry, and defines the dev, build, and start scripts you run.',
          analogy:
            'The `package.json` is the temple counter’s duty roster pinned by the door: it states the counter’s name (Maranakatte Seva), who opens up first thing in the morning (the **main** entry Electron launches), and the list of standard tasks the staff can call out — “start the day” (`dev`), “prepare for the festival” (`build`). Run a task by its name and everyone knows what happens.',
          theory:
            'Every Node/Electron project has a **`package.json`** describing it. The fields that matter for Electron:\n\n- **`name`** and **`version`** — the app’s identity (e.g. `maranakatte-seva`).\n- **`main`** — the file Electron runs **first** when the app launches. In an electron-vite project this points at the built main-process file (e.g. `./out/main/index.js`). This is the entry point of the whole app.\n- **`scripts`** — named commands you run with `npm run <name>`:\n  - `dev` — start the app in development with hot reload.\n  - `build` — produce the production bundles.\n  - `start` (or `preview`) — run the built app.\n\nYou run a script with `npm run dev`, `npm run build`, and so on. The `dependencies` and `devDependencies` lists record every package (like `electron`, `react`, and later `pg`) the app uses, so `npm install` can restore them on another machine.',
          whyItMatters:
            'The `package.json` is the control panel of the project. Knowing the `main` entry and the scripts is how you run, build, and ship the Maranakatte Seva app — and how a new staff machine reinstalls everything with one `npm install`.',
          steps: [
            'Open `package.json` and read the `name` and `version`.',
            'Find the `main` field and note it points at the built main-process file.',
            'Read the `scripts` block: `dev`, `build`, and `start`/`preview`.',
            'Run `npm run dev` to start in development.',
            'Look at `dependencies` (e.g. `react`) vs `devDependencies` (e.g. `electron`, `vite`).',
            'Remember `npm install` restores everything listed here on a new machine.',
          ],
          code: `// package.json (trimmed) for the Maranakatte Seva app
{
  "name": "maranakatte-seva",
  "version": "1.0.0",
  "main": "./out/main/index.js",   // <- Electron runs THIS first
  "scripts": {
    "dev": "electron-vite dev",       // hot-reload development
    "build": "electron-vite build",   // produce production bundles
    "start": "electron-vite preview"  // run the built app
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "electron": "^31.0.0",
    "electron-vite": "^2.0.0",
    "vite": "^5.0.0"
  }
}

// You run scripts by name:
//   npm run dev      npm run build      npm start`,
          pitfalls: [
            '**A wrong or missing `main` field.** Electron cannot find the entry and the app will not start. Fix: ensure `main` points at the built main file.',
            '**Pointing `main` at a source file instead of the built one.** electron-vite builds to `out/`. Fix: point at the built path (e.g. `./out/main/index.js`).',
            '**Running a script that does not exist.** `npm run xyz` errors. Fix: check the exact names in the `scripts` block.',
            '**Putting `electron` in `dependencies` instead of `devDependencies`.** Bloats the runtime. Fix: keep build tools in `devDependencies`.',
            '**Hand-editing versions and breaking installs.** Fix: prefer `npm install <pkg>` which writes valid versions.',
            '**Committing `node_modules`.** Huge and unnecessary. Fix: gitignore it; `npm install` rebuilds it from `package.json`.',
          ],
          tryIt:
            'Open your project’s `package.json`. Find the `main` field and the `scripts` block, then run `npm run dev` from the same folder. Confirm the script name you typed matches one listed under `scripts`.',
          takeaway: 'The `package.json` names the app, points Electron at the `main` entry, and defines the `dev`/`build`/`start` scripts you run with `npm run`.',
        },
        {
          id: 'm1-t5',
          title: 'Running in dev: hot reload & process restarts',
          explain:
            'Running `npm run dev` starts the app with hot reload — editing the React UI updates instantly, while editing the main process restarts the app.',
          analogy:
            'During a quiet afternoon at the counter, repainting the sign on the desk (the **renderer**, your React screen) can happen while devotees keep being served — the change just appears. But moving the back-office safe (the **main** process) means briefly shutting the counter and reopening it. Hot reload treats UI tweaks like repainting the sign, and main-process changes like rearranging the back office.',
          theory:
            'When you run **`npm run dev`**, electron-vite does two things at once: it serves the React app from a fast **dev server**, and it launches Electron pointing at that server.\n\nThe two processes reload differently:\n- **Renderer (React UI)** — supports **Hot Module Replacement (HMR)**. Save a `.jsx` file and the change appears in the window almost instantly, often **without losing the screen’s state**. This is perfect for tweaking the seva grid layout.\n- **Main process** — cannot hot-swap; it runs the window and OS code. When you edit a file in `main/`, electron-vite **restarts the whole Electron app** to apply it.\n\nSo your workflow is fast: most counter-UI work (the React screens) updates live, and only the occasional main-process change (window settings, database wiring later) triggers a full restart. You watch the terminal for messages and the window for the result.',
          whyItMatters:
            'A tight edit-and-see loop is what makes building the counter UI pleasant and quick. Knowing why a UI change is instant but a main-process change restarts the app saves confusion and keeps you productive while shaping the Maranakatte Seva screens.',
          steps: [
            'Run `npm run dev` to start the dev server and open the window.',
            'Edit some text in `renderer/src/App.jsx` and save.',
            'Watch the window update almost instantly (hot reload).',
            'Now edit `main/index.js` (e.g. change the window title) and save.',
            'Watch the whole app restart to apply the main-process change.',
            'Keep the terminal visible to read reload/restart messages.',
          ],
          code: `// 1) Start development (run once):
//    npm run dev

// 2) Renderer change = instant hot reload.
//    Edit src/renderer/src/App.jsx:
function App() {
  return <h1>Maranakatte Seva — Counter</h1>; // change text, save, see it instantly
}

// 3) Main-process change = full app restart.
//    Edit src/main/index.js, e.g. the window title:
const win = new BrowserWindow({
  width: 1100,
  height: 720,
  title: 'Maranakatte Seva' // save this -> Electron restarts the app
});

// Watch the terminal: HMR for the renderer, a restart line for the main process.`,
          pitfalls: [
            '**Expecting a main-process edit to hot reload.** It cannot; it restarts. Fix: accept the brief restart for `main/` changes.',
            '**Editing built files in `out/` instead of `src/`.** Your changes get overwritten on rebuild. Fix: always edit files under `src/`.',
            '**Not watching the terminal.** You miss error messages when a reload fails. Fix: keep the terminal beside the window.',
            '**Thinking a blank window means a crash.** Often it is a React error shown in DevTools. Fix: open DevTools (Ctrl+Shift+I) to read it.',
            '**Running `npm run build` when you meant `dev`.** No live reload. Fix: use `dev` for development, `build` only to ship.',
            '**Leaving two `npm run dev` instances running.** They fight over the port. Fix: stop one (Ctrl+C) before starting another.',
          ],
          tryIt:
            'With `npm run dev` running, change the heading text in `App.jsx` and watch it update without a restart. Then change the window `title` in `main/index.js` and watch the whole app restart. Note the difference in the terminal.',
          takeaway: 'In `npm run dev`, renderer (React) edits hot-reload instantly while main-process edits restart the whole app — a fast loop for building the counter UI.',
        },
        {
          id: 'm1-t6',
          title: 'The build output: renderer & main bundles',
          explain:
            'Running `npm run build` compiles the project into separate output bundles — one for the main process and one for the renderer — ready to package as a desktop app.',
          analogy:
            'Building the app is like preparing the temple counter for a big festival day: everything that was loose and editable during practice gets packed into neat, sealed boxes — one box for the back office (main bundle), one for the desk display (renderer bundle). On festival day you just open the boxes and start; nothing needs assembling at the counter.',
          theory:
            'During development, your code is served live and editable. To **ship** the app, you run **`npm run build`**, which uses Vite to **bundle and optimise** the source into a production `out/` (or `dist/`) folder.\n\nThe build produces **separate outputs** because the three parts run in different runtimes:\n- the **main bundle** (e.g. `out/main/index.js`) — the Node code that creates windows and reaches the database;\n- the **preload bundle** (e.g. `out/preload/index.js`) — the compiled bridge;\n- the **renderer bundle** (e.g. `out/renderer/`) — the React app compiled into static HTML/JS/CSS.\n\nIn the built app, the renderer is loaded from a local **`index.html` via the `file://` protocol** (not a dev server), because the finished Maranakatte Seva app must run **offline** on the counter machine. A later step (with a packager like `electron-builder`) wraps these bundles into an installable `.exe`/`.app`, but the build step itself just produces the optimised bundles.',
          whyItMatters:
            'The built bundles are what actually run on the temple counter machine — offline, fast, and self-contained. Understanding that main, preload, and renderer build separately explains why each lives in its own folder and how the finished app loads its UI from a local file.',
          steps: [
            'Run `npm run build`.',
            'Open the `out/` (or `dist/`) folder it creates.',
            'Find the main bundle (e.g. `out/main/index.js`).',
            'Find the renderer bundle (e.g. `out/renderer/index.html` + assets).',
            'Note the renderer is loaded via `file://` in production, not a dev server.',
            'Run `npm start` (preview) to launch the built app.',
          ],
          code: `# Build the production bundles
$ npm run build

# Typical output structure:
out/
  main/
    index.js        # compiled MAIN process (Node, DB access)
  preload/
    index.js        # compiled PRELOAD bridge
  renderer/
    index.html      # the React app, loaded via file:// (offline)
    assets/         # bundled JS + CSS

# Preview the built app (loads renderer from file://, no dev server):
$ npm start

// Later, a packager like electron-builder turns out/ into an
// installable .exe / .app for the temple counter machine.`,
          pitfalls: [
            '**Editing files inside `out/`.** They are regenerated on every build. Fix: edit `src/` and rebuild.',
            '**Expecting the dev server in the built app.** Production loads `file://`. Fix: ensure the main process loads `index.html` by file in production (next section).',
            '**Forgetting to rebuild after changes.** The old bundle ships. Fix: run `npm run build` again before packaging.',
            '**Confusing build with packaging.** Build makes bundles; packaging makes an installer. Fix: use `electron-builder` separately to create the `.exe`.',
            '**Committing the `out/` folder.** It is generated. Fix: gitignore it; rebuild from source.',
            '**Assuming relative paths work the same in `file://`.** They can differ. Fix: rely on electron-vite’s config to wire paths correctly.',
          ],
          tryIt:
            'Run `npm run build`, then open the `out/` folder. Find the separate `main`, `preload`, and `renderer` outputs. Run `npm start` and confirm the built app opens without a dev server running.',
          takeaway: '`npm run build` produces separate main, preload, and renderer bundles; the finished app loads its React UI from a local `file://` page so it runs fully offline.',
        },
      ],
    },
    {
      id: 'm1-s2',
      title: 'The Electron processes',
      topics: [
        {
          id: 'm1-t7',
          title: 'The main process & creating a BrowserWindow',
          explain:
            'The main process is the app’s entry point; it creates a `BrowserWindow` — the actual desktop window that displays your React UI.',
          analogy:
            'The **main process** is the head clerk who arrives first and unlocks the temple counter. The very first thing they do is set up the service desk itself — its size, its title board reading “Maranakatte Seva”, and where the devotee-facing screen will sit. A **`BrowserWindow`** is that desk: a physical window on the counter machine into which your React screens are loaded.',
          theory:
            'The **main process** runs in Node.js and is the **first code Electron executes** (the file named by `main` in `package.json`). Its core job is to create application windows.\n\nA **`BrowserWindow`** is an Electron object representing a single OS window. You import it from `electron`, wait until the app is ready, then construct one with options like `width`, `height`, `title`, and crucially **`webPreferences`** — which sets the **preload script** and the security flags (`contextIsolation`, `nodeIntegration`).\n\nAfter creating the window you tell it what to display with `win.loadURL(...)` (a dev-server URL during development) or `win.loadFile(...)` (the built `index.html` in production). The window then renders your React app — the counter, bookings, and reports screens.\n\nThe main process can create **several** windows, but the Maranakatte Seva counter app uses one main window. It also keeps a reference to that window and handles the app lifecycle (covered next).',
          whyItMatters:
            'Every Electron app begins by creating a window in the main process. Getting the `BrowserWindow` options right — especially the secure `webPreferences` — is what gives the temple counter a correctly sized, safe window into which the React UI loads.',
          steps: [
            'In `main/index.js`, import `app` and `BrowserWindow` from `electron`.',
            'Wait for `app.whenReady()` before creating any window.',
            'Create a `BrowserWindow` with `width`, `height`, and a `title`.',
            'Set `webPreferences.preload` to the preload script path.',
            'Keep `contextIsolation: true` and `nodeIntegration: false`.',
            'Load the UI with `loadURL` (dev) or `loadFile` (production).',
          ],
          code: `// src/main/index.js — create the counter window
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    title: 'Maranakatte Seva',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,   // keep the renderer sandboxed
      nodeIntegration: false    // renderer gets NO direct Node access
    }
  });

  // Dev vs production loading covered in a later topic:
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);          // dev server
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html')); // built file
  }
}

app.whenReady().then(createWindow);`,
          pitfalls: [
            '**Creating a window before `app.whenReady()`.** It fails. Fix: always create windows inside `app.whenReady().then(...)`.',
            '**Setting `nodeIntegration: true` for convenience.** A serious security hole. Fix: keep it `false` and use the preload bridge.',
            '**Forgetting the `preload` path.** The renderer gets no `window.api`. Fix: set `webPreferences.preload` to the correct file.',
            '**Wrong preload path.** Silent failure of the bridge. Fix: build it with `path.join(__dirname, ...)` so it resolves in dev and production.',
            '**Not keeping a reference to the window.** It may be garbage-collected. Fix: store it (e.g. in a variable) if you need it later.',
            '**Hardcoding a dev URL in production.** The built app shows a blank page. Fix: branch between `loadURL` (dev) and `loadFile` (prod).',
          ],
          tryIt:
            'In `main/index.js`, create a `BrowserWindow` sized 1100x720 with the title “Maranakatte Seva”, a preload path, `contextIsolation: true`, and `nodeIntegration: false`. Run `npm run dev` and confirm the window opens at that size.',
          takeaway: 'The main process waits for `app.whenReady()`, then creates a `BrowserWindow` with secure `webPreferences` and loads your React UI into it.',
        },
        {
          id: 'm1-t8',
          title: 'The renderer process: your React app',
          explain:
            'The renderer process is the Chromium window that runs your React app — the screens temple staff see and interact with.',
          analogy:
            'The **renderer** is the devotee-facing service desk where the staff member taps “Mangalarathi” or “Hannikaayi” and prints a ticket. It is bright, interactive, and friendly — but it deliberately has **no key** to the back-office records room. To fetch or save anything from the database, the desk must hand a slip through the trusted runner (preload). It shows and collects; it never reaches into Node directly.',
          theory:
            'The **renderer process** is a Chromium window running standard web technology — in our case a **React app**. Each `BrowserWindow` you create has its own renderer.\n\nWhat the renderer does:\n- renders the **React component tree** (counter screen, bookings, reports);\n- handles **user interaction** — clicks, form input for devotee name/gotra/nakshatra/phone;\n- holds **UI state** (which screen is open, what is typed in a form).\n\nWhat the renderer **cannot** do (by design): it has **no direct access to Node.js**, the file system, or the local PostgreSQL database. With `contextIsolation: true` and `nodeIntegration: false`, the renderer is sandboxed like a normal web page. This is intentional: UI code is the part most exposed to bugs and untrusted content, so it is kept powerless.\n\nWhen the React UI needs data — say, the list of today’s sevas — it calls a function on **`window.api`** that the preload script exposed. That call is forwarded to the main process, which does the real database work and sends results back.',
          whyItMatters:
            'The renderer is where the entire counter experience lives — fast, clear screens for staff issuing 500+ Rangapooje tickets an evening. Understanding that it has no direct database power explains why every data operation goes through the preload bridge to the main process.',
          steps: [
            'Open `renderer/src/App.jsx` — this is your React app root.',
            'Note it is plain React: components, JSX, state.',
            'Recognise it cannot import `pg` or `fs` directly.',
            'For any data, plan to call `window.api.something()` (exposed by preload).',
            'Keep all UI state (open screen, form fields) here in React.',
            'Run `npm run dev` and edit a component to see it live.',
          ],
          code: `// src/renderer/src/App.jsx — the renderer is just a React app
import { useState } from 'react';

export default function App() {
  const [screen, setScreen] = useState('counter');

  return (
    <div className="counter-app">
      <h1>Maranakatte Seva</h1>
      <p>Current screen: {screen}</p>
      <button onClick={() => setScreen('bookings')}>Go to Bookings</button>
    </div>
  );
}

// NOTE: this code CANNOT do the following — no direct Node/DB access:
//   const { Client } = require('pg');   // <- would fail / is forbidden here
// Instead it will call window.api.* (exposed by preload) for data.`,
          pitfalls: [
            '**Trying to `require(\'pg\')` or `require(\'fs\')` in React.** The renderer has no Node access. Fix: do it in `main/` and expose via preload.',
            '**Expecting `window.api` to exist without a preload.** It will be undefined. Fix: define and expose it in the preload script.',
            '**Putting business/database logic in components.** Couples UI to data internals. Fix: keep components for display; route data through `window.api`.',
            '**Assuming the renderer can read local files freely.** It cannot. Fix: ask the main process to read them.',
            '**Blocking the UI thread with heavy work.** The counter feels slow. Fix: keep heavy work in the main process.',
            '**Forgetting React state resets on reload of the main process.** A full restart clears it. Fix: persist real data in the database, not just in state.',
          ],
          tryIt:
            'Open `App.jsx` and add a `useState` for the current screen plus a button that changes it. Confirm it works in the window. Then try adding `const x = require(\'fs\');` and observe that the renderer cannot use Node directly.',
          takeaway: 'The renderer is a sandboxed Chromium window running your React UI; it holds screens and state but reaches data only through `window.api`, never Node directly.',
        },
        {
          id: 'm1-t9',
          title: 'Loading the renderer: dev URL vs file://',
          explain:
            'In development the main process loads the renderer from a dev-server URL; in the built app it loads the React UI from a local `index.html` via `file://`.',
          analogy:
            'During practice runs, the counter’s display screen is fed live from a projector in the next room (the **dev server**) so you can keep changing the slides. On the actual festival day, that live feed is gone — the screen plays from a sealed pen-drive plugged into the counter machine itself (the **`file://`** page). Same screen, two sources: a live feed while building, a local file once shipped.',
          theory:
            'The renderer’s content has to come from somewhere, and that source differs between dev and production:\n\n- **Development** — electron-vite runs a Vite **dev server** and sets an environment variable (e.g. `ELECTRON_RENDERER_URL`) holding its URL. The main process calls `win.loadURL(thatUrl)`, so the window shows the live, hot-reloading React app.\n- **Production** — there is **no server**; the React app was compiled to a static `index.html`. The main process calls `win.loadFile(\'.../renderer/index.html\')`, loading it through the **`file://`** protocol directly from disk.\n\nYou choose between them with a simple check in the main process — typically “if the dev URL env var exists, `loadURL`; otherwise `loadFile`.” This single branch is what lets the Maranakatte Seva app hot-reload while you build it yet run **completely offline** from local files once installed on the counter machine.',
          whyItMatters:
            'Getting this branch right is the difference between a built app that shows your UI and one that shows a blank screen. Because the temple counter has no internet, the production path must load from `file://` — this topic is exactly how the offline app finds its screens.',
          steps: [
            'In `main/index.js`, check for the dev-server env var (e.g. `ELECTRON_RENDERER_URL`).',
            'If present, call `win.loadURL(devUrl)` for hot-reload development.',
            'If absent, call `win.loadFile(.../renderer/index.html)` for the built app.',
            'Build the path with `path.join(__dirname, ...)` so it resolves correctly.',
            'Run `npm run dev` and confirm the live URL loads.',
            'Run `npm run build` then `npm start` and confirm the file:// page loads offline.',
          ],
          code: `// src/main/index.js — choose the renderer source
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({ width: 1100, height: 720 });

  const devUrl = process.env['ELECTRON_RENDERER_URL'];
  if (devUrl) {
    win.loadURL(devUrl);                                  // DEV: live dev server
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html')); // PROD: file://
  }
}

app.whenReady().then(createWindow);

// Dev  -> http://localhost:5173 (hot reload)
// Prod -> file:///.../out/renderer/index.html (offline, from disk)`,
          pitfalls: [
            '**Always using `loadURL` with a hardcoded localhost.** The built app shows nothing offline. Fix: branch to `loadFile` in production.',
            '**Always using `loadFile` in dev.** You lose hot reload. Fix: use `loadURL(devUrl)` when the dev env var is set.',
            '**Wrong relative path to `index.html`.** Blank window in production. Fix: build it with `path.join(__dirname, ...)`.',
            '**Forgetting the renderer builds to `out/renderer`.** Pointing at `src` fails in production. Fix: point at the built location.',
            '**Assuming `file://` allows network/CDN assets.** It should not for an offline app. Fix: bundle all assets locally (no CDNs).',
            '**Hardcoding the dev port.** It may change. Fix: read it from the env var electron-vite provides.',
          ],
          tryIt:
            'In `main/index.js`, write the if/else that uses `loadURL` when the dev URL env var exists and `loadFile` otherwise. Test both: `npm run dev` (URL) and `npm run build` + `npm start` (file://). Confirm the UI shows in both.',
          takeaway: 'Branch in the main process: `loadURL(devUrl)` for hot-reload development, `loadFile(index.html)` for the offline `file://` build.',
        },
        {
          id: 'm1-t10',
          title: 'App lifecycle events: ready, window-all-closed, activate',
          explain:
            'Electron fires lifecycle events — `ready`, `window-all-closed`, and `activate` — that you handle so the app opens, closes, and reopens correctly on each OS.',
          analogy:
            'The temple counter has a daily rhythm. **`ready`** is the moment the head clerk has unlocked everything and can open the service desk. **`window-all-closed`** is when the last desk is shut for the day — on most machines that means closing the whole counter. **`activate`** (a Mac habit) is a devotee tapping the closed shutter expecting it to roll back up, so you reopen a desk. Handling these keeps the counter behaving the way staff expect on their machine.',
          theory:
            'The Electron **`app`** object emits lifecycle events you listen to:\n\n- **`ready`** (via `app.whenReady()`) — fired once Electron has fully started. **Create your `BrowserWindow` here**, never before.\n- **`window-all-closed`** — fired when every window is closed. The conventional rule: on **Windows/Linux**, quit the app with `app.quit()`; on **macOS** (`process.platform === \'darwin\'`), apps usually stay running in the dock, so you do **not** quit.\n- **`activate`** — a macOS event fired when the app icon is clicked and no windows are open; you recreate a window if `BrowserWindow.getAllWindows()` is empty.\n\nThe temple counter machines are typically **Windows**, so the practical behaviour is: open one window on `ready`, and quit on `window-all-closed`. Including the macOS branches is still good practice so the same code behaves correctly if a developer runs it on a Mac.',
          whyItMatters:
            'These events control whether the app opens at all, and whether closing the window quits or lingers. Handling them correctly means the Maranakatte Seva counter starts cleanly and shuts down the way Windows staff expect — no orphaned process holding the database open.',
          steps: [
            'Create the window inside `app.whenReady().then(...)`.',
            'Listen for `window-all-closed`.',
            'In it, call `app.quit()` unless `process.platform === \'darwin\'`.',
            'Listen for `activate` (macOS) and recreate a window if none are open.',
            'Test closing the window on Windows: the app should quit.',
            'Keep the macOS branches for cross-platform correctness.',
          ],
          code: `// src/main/index.js — lifecycle handling
const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({ width: 1100, height: 720, title: 'Maranakatte Seva' });
  // ...load URL or file (see previous topic)...
  return win;
}

// 1) Create the window only when Electron is ready
app.whenReady().then(() => {
  createWindow();

  // 3) macOS: reopen a window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 2) When all windows close: quit on Windows/Linux, stay on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});`,
          pitfalls: [
            '**Creating the window before `ready`.** It throws. Fix: only create inside `app.whenReady()`.',
            '**Quitting on macOS in `window-all-closed`.** Breaks Mac convention. Fix: skip quit when `process.platform === \'darwin\'`.',
            '**Never quitting on Windows.** A hidden process keeps running. Fix: call `app.quit()` on Windows/Linux when all windows close.',
            '**Forgetting the `activate` handler.** On Mac the app cannot reopen a window. Fix: recreate one if none are open.',
            '**Assuming one platform only.** Code that ignores the platform misbehaves elsewhere. Fix: branch on `process.platform`.',
            '**Leaving the database connection open after quit.** Locks data. Fix: close DB resources during shutdown (covered in later modules).',
          ],
          tryIt:
            'Add `window-all-closed` and `activate` handlers to `main/index.js` with the platform branches shown. On Windows, close the window and confirm the app process actually exits (no lingering Electron process in Task Manager).',
          takeaway: 'Create windows on `ready`; on `window-all-closed` quit on Windows/Linux but stay on macOS; recreate a window on `activate` for Mac.',
        },
        {
          id: 'm1-t11',
          title: 'Single-instance lock',
          explain:
            'A single-instance lock ensures only one copy of the app runs at a time, so two windows never fight over the same local database.',
          analogy:
            'Imagine two clerks each opening their own copy of the Maranakatte Seva app on the same counter machine and both writing to the records room at once — tickets clash, totals corrupt. The **single-instance lock** is the rule that only one head clerk holds the records-room key at a time. If someone tries to open a second copy, the system simply brings the first window to the front instead.',
          theory:
            'By default, double-clicking the app twice can launch **two separate processes**. For an offline app with one local PostgreSQL database, that is dangerous: two instances could write to the same data and conflict.\n\nElectron provides **`app.requestSingleInstanceLock()`**. The **first** instance gets the lock (returns `true`). Any **second** instance gets `false` — and should immediately **`app.quit()`** so it never opens a window.\n\nThe first instance also listens for the **`second-instance`** event. When a user tries to launch another copy, this event fires in the *original* process, giving you a chance to **focus the existing window** (restore it if minimised and bring it to front) — so the user still gets the app they wanted, just the one already running.\n\nFor the temple counter, this guarantees exactly **one** app owns the database, preventing the kind of double-write corruption that would be disastrous during the busy Rangapooje ticketing rush.',
          whyItMatters:
            'A second copy of the app writing to the same local database can corrupt the day’s seva records. The single-instance lock is the simple, essential safeguard that keeps the Maranakatte Seva counter to exactly one running app — no clashing writes, no confusion.',
          steps: [
            'Call `app.requestSingleInstanceLock()` early in the main process.',
            'If it returns `false`, call `app.quit()` and stop.',
            'If `true`, continue to create the window on `ready`.',
            'Listen for the `second-instance` event in the first instance.',
            'In that handler, restore and focus the existing window.',
            'Test by launching the built app twice — only one window should appear.',
          ],
          code: `// src/main/index.js — enforce a single running instance
const { app, BrowserWindow } = require('electron');

let mainWindow = null;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();                 // a copy is already running -> this one exits
} else {
  // Someone tried to open a 2nd copy: focus the existing window instead
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    mainWindow = new BrowserWindow({ width: 1100, height: 720, title: 'Maranakatte Seva' });
    // ...load the renderer...
  });
}`,
          pitfalls: [
            '**Skipping the lock entirely.** Two instances can corrupt the local database. Fix: always request the lock for a single-DB app.',
            '**Not quitting the second instance.** It opens a rival window. Fix: `app.quit()` immediately when the lock is not granted.',
            '**Requesting the lock after creating the window.** The race is already lost. Fix: request it before window creation.',
            '**Forgetting to focus the existing window on `second-instance`.** The user thinks nothing happened. Fix: restore and `focus()` it.',
            '**Not keeping a reference to `mainWindow`.** You cannot focus it later. Fix: store it in a variable accessible to the handler.',
            '**Assuming dev mode behaves like production here.** Hot reload differs. Fix: test single-instance behaviour on the built/packaged app.',
          ],
          tryIt:
            'Add `requestSingleInstanceLock()` and a `second-instance` handler to your main process. Build the app, then try to launch it twice. Confirm the second launch does not open a new window but instead focuses the first.',
          takeaway: 'Use `requestSingleInstanceLock()` (quit if not granted) and a `second-instance` handler to focus the existing window — one app, one database, no clashes.',
        },
      ],
    },
    {
      id: 'm1-s3',
      title: 'React in the renderer',
      topics: [
        {
          id: 'm1-t12',
          title: 'React components & JSX recap',
          explain:
            'React builds the UI from components — reusable functions that return JSX, an HTML-like syntax describing what to show on screen.',
          analogy:
            'A **React component** is like a reusable temple ticket stamp. Carve the “seva tile” stamp once — a box showing a seva name and price — and you can press it out for Mangalarathi, Hannikaayi, and Rangapooje alike, each with different details. **JSX** is the shape engraved on the stamp: it looks like HTML but lives inside JavaScript, so you can slot in the right name and ₹ amount each time.',
          theory:
            'A **component** is a JavaScript function whose name starts with a capital letter and which returns **JSX** — markup that looks like HTML but is really JavaScript. React calls these functions and renders their output to the screen.\n\nKey JSX rules:\n- You **embed values** with curly braces: `{seva.name}`, `{price}`.\n- Attributes use camelCase: `className` (not `class`), `onClick` (not `onclick`).\n- A component must return **one root element** (wrap siblings in a `<div>` or a `<>...</>` fragment).\n- You pass data into a component with **props** — arguments like `<SevaTile name="Mangalarathi" price={20} />`.\n\nComposing small components — a `SevaTile`, a `Sidebar`, a `CounterScreen` — into larger ones is how the whole Maranakatte Seva UI is built. Each component is independent and reusable, which keeps the counter screens tidy as features grow.',
          whyItMatters:
            'Components and JSX are the building blocks of every screen the temple staff will use. Writing small, reusable components keeps the counter, bookings, and reports UIs clean and consistent — the foundation everything else in the renderer stands on.',
          steps: [
            'Write a function component whose name starts with a capital letter.',
            'Return JSX with one root element.',
            'Embed values using `{...}` and use `className`/`onClick`.',
            'Accept data via `props` (e.g. `{ name, price }`).',
            'Compose smaller components into larger screens.',
            'Render a list of seva tiles to see reuse in action.',
          ],
          code: `// A reusable component: one seva tile (props in, JSX out)
function SevaTile({ name, price }) {
  return (
    <div className="seva-tile">
      <span className="seva-name">{name}</span>
      <span className="seva-price">₹{price}</span>
    </div>
  );
}

// Compose tiles into a small screen
export default function CounterScreen() {
  return (
    <div className="counter">
      <h2>Counter Sevas</h2>
      <SevaTile name="Mangalarathi" price={20} />
      <SevaTile name="Hannikaayi" price={30} />
    </div>
  );
}`,
          pitfalls: [
            '**Lowercase component names.** React treats `<sevaTile/>` as an HTML tag. Fix: capitalise component names (`SevaTile`).',
            '**Using `class` instead of `className`.** JSX ignores `class`. Fix: use `className`.',
            '**Returning multiple root elements.** JSX requires one root. Fix: wrap them in a `<div>` or `<>...</>` fragment.',
            '**Forgetting curly braces for values.** `{price}` shows the value; `price` shows the literal word. Fix: wrap dynamic values in `{}`.',
            '**Mutating props inside a component.** Props are read-only. Fix: treat them as inputs; use state for changes.',
            '**Writing logic-heavy components.** They get unreadable. Fix: split into smaller components.',
          ],
          tryIt:
            'Create a `SevaTile` component that takes `name` and `price` props and renders them, then use it twice inside a `CounterScreen` for Mangalarathi (₹20) and Hannikaayi (₹30). Confirm both tiles appear.',
          takeaway: 'React UIs are built from capitalised function components returning JSX; pass data via props and compose small components into full counter screens.',
        },
        {
          id: 'm1-t13',
          title: 'State with useState & rendering the seva grid',
          explain:
            'The `useState` hook gives a component memory; combined with `.map()`, it lets you render a live grid of sevas that updates as data changes.',
          analogy:
            'A staff member at the counter keeps a small notepad: which seva is selected, how many tickets so far. **`useState`** is that notepad — React remembers a value between clicks. The **seva grid** is the printed menu board: you take the list of sevas and stamp out one tile each (`.map()`), so adding a seva to the list instantly adds a tile to the board.',
          theory:
            '**`useState`** is a React **hook** that adds memory to a function component. You call it with an initial value and get back a pair: the current value and a setter.\n\n`const [selected, setSelected] = useState(null);`\n\nCalling the setter (`setSelected(seva)`) tells React the value changed, and React **re-renders** the component with the new value. Never assign to the variable directly — always use the setter.\n\nTo render the **seva grid**, you hold the list in state or props and use **`.map()`** to turn each seva into a `SevaTile`. Each mapped element needs a stable **`key`** prop (a unique id) so React can track items efficiently:\n\n`sevas.map(s => <SevaTile key={s.id} name={s.name} price={s.price} />)`\n\nThis pattern — state plus `.map()` — is exactly how the counter shows a fast, clickable grid of sevas (Mangalarathi, Hannikaayi, Rangapooje) that staff tap during the evening rush.',
          whyItMatters:
            'The seva grid is the heart of the counter screen — staff tap it hundreds of times an evening. `useState` plus `.map()` is what makes that grid live and responsive, redrawing instantly when a seva is selected or the list changes.',
          steps: [
            'Import `useState` from React.',
            'Hold the selected seva in state: `const [selected, setSelected] = useState(null)`.',
            'Keep the seva list in state or props.',
            'Render it with `.map()`, giving each tile a unique `key`.',
            'On click, call the setter (e.g. `setSelected(s)`).',
            'Show the selected seva to confirm state updates re-render the UI.',
          ],
          code: `import { useState } from 'react';

const SEVAS = [
  { id: 1, name: 'Mangalarathi', price: 20 },
  { id: 2, name: 'Hannikaayi',  price: 30 },
  { id: 3, name: 'Rangapooje',  price: 50 }
];

export default function CounterScreen() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="counter">
      <h2>Select a Seva</h2>
      <div className="seva-grid">
        {SEVAS.map(function (s) {
          return (
            <button key={s.id} className="seva-tile" onClick={() => setSelected(s)}>
              {s.name} — ₹{s.price}
            </button>
          );
        })}
      </div>
      {selected && <p>Selected: {selected.name} (₹{selected.price})</p>}
    </div>
  );
}`,
          pitfalls: [
            '**Mutating state directly** (e.g. `selected = s`). React will not re-render. Fix: always call the setter `setSelected(s)`.',
            '**Missing the `key` prop in `.map()`.** React warns and updates inefficiently. Fix: give each item a stable unique `key`.',
            '**Using the array index as `key` for changing lists.** Causes glitches. Fix: use a real unique id.',
            '**Calling `useState` inside a loop or condition.** Breaks the rules of hooks. Fix: call hooks at the top level of the component.',
            '**Storing derived data in state.** It goes stale. Fix: compute it during render from existing state.',
            '**Forgetting state resets on a main-process restart.** Fix: persist real data in the database, not just `useState`.',
          ],
          tryIt:
            'Render the `SEVAS` array as a grid of buttons with `.map()` and a `key`. Add `useState` to track the selected seva and show its name below the grid. Click different tiles and confirm the selection updates.',
          takeaway: 'Use `useState` for component memory and `.map()` with a unique `key` to render a live, clickable seva grid that re-renders on every change.',
        },
        {
          id: 'm1-t14',
          title: 'Side effects with useEffect',
          explain:
            'The `useEffect` hook runs code in response to a component appearing or its data changing — ideal for loading data when a screen opens.',
          analogy:
            'When a staff member opens the Bookings screen, they expect today’s Yakshagana and Annadhana bookings to already be on the desk — not to have to ask for them. **`useEffect`** is the assistant who, the moment the Bookings desk opens, quietly fetches the day’s register and lays it out. It runs *after* the screen appears, so the screen shows instantly and the data fills in.',
          theory:
            '**`useEffect`** lets a component run **side effects** — work outside rendering, like fetching data. You give it a function and a **dependency array**:\n\n`useEffect(() => { /* run effect */ }, [deps]);`\n\n- An **empty array `[]`** means “run once, when the component first mounts” — perfect for loading a screen’s initial data.\n- Listing **dependencies** (`[date]`) means “run again whenever `date` changes” — e.g. reload bookings for a newly picked date.\n\nInside the effect, you call your data source. In this app, that means calling **`window.api`** (the preload bridge) to ask the main process for data, then storing the result with a `useState` setter so the UI shows it. Because the call is asynchronous, you typically define an `async` function inside the effect and call it.\n\nThis is the standard pattern for the Maranakatte Seva screens: open the Bookings screen → `useEffect` fires → fetch today’s bookings → set state → grid fills in.',
          whyItMatters:
            'Screens that auto-load their data feel instant and professional. `useEffect` is how the Bookings and Reports screens fetch today’s data the moment they open — without it, staff would see empty screens until they manually triggered a load.',
          steps: [
            'Import `useEffect` and `useState` from React.',
            'Add state to hold the loaded data (e.g. `bookings`).',
            'Call `useEffect(() => {...}, [])` to load once on mount.',
            'Inside, define an `async` function that calls `window.api`.',
            'Store the result with the state setter.',
            'Add a dependency (e.g. `[date]`) to reload when it changes.',
          ],
          code: `import { useState, useEffect } from 'react';

export default function BookingsScreen({ date }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      // window.api is exposed by the preload bridge (covered next section)
      const rows = await window.api.getBookings(date);
      if (active) {
        setBookings(rows);
        setLoading(false);
      }
    }
    load();
    return () => { active = false; }; // cleanup if the screen closes early
  }, [date]); // re-run whenever the chosen date changes

  if (loading) return <p>Loading bookings…</p>;
  return (
    <ul>
      {bookings.map(b => <li key={b.id}>{b.devotee} — {b.seva}</li>)}
    </ul>
  );
}`,
          pitfalls: [
            '**Omitting the dependency array.** The effect runs on every render — an infinite fetch loop. Fix: pass `[]` or the right dependencies.',
            '**Making the effect callback itself `async`.** `useEffect` must not return a promise. Fix: define an inner `async` function and call it.',
            '**Setting state after the screen closed.** Causes warnings. Fix: use an `active` flag and clean up in the returned function.',
            '**Forgetting dependencies that the effect uses.** Stale data. Fix: list every value the effect reads (e.g. `date`).',
            '**Doing heavy work directly in render.** Blocks the UI. Fix: move it into `useEffect`.',
            '**Assuming `window.api` exists in tests/web.** It is Electron-only. Fix: guard or mock it outside Electron.',
          ],
          tryIt:
            'Add a `useEffect` to a Bookings screen that, on mount, calls a stub `window.api.getBookings(date)` and stores the result in state. Show a “Loading…” message until the data arrives, then render the list.',
          takeaway: 'Use `useEffect` with the right dependency array to load a screen’s data on open (and reload when inputs change), then store it with `useState`.',
        },
        {
          id: 'm1-t15',
          title: 'Screen navigation: Counter / Bookings / Reports',
          explain:
            'Switch between the Counter, Bookings, and Reports screens using simple view state, or React Router for a more structured approach.',
          analogy:
            'The Maranakatte Seva app has a few service desks: the **Counter** for instant sevas, **Bookings** for dated Yakshagana and Annadhana, and **Reports** for the day’s totals. Navigation is the signboard that decides which desk is currently facing the staff. The simplest signboard is a single sticky note saying which desk is open (**view state**); a fancier one is a proper directory with addresses (**React Router**).',
          theory:
            'Most desktop apps show **one screen at a time** and let the user switch. Two common approaches:\n\n- **Simple view state** — hold the current screen name in `useState` (`const [view, setView] = useState(\'counter\')`) and render the matching component with a conditional. The sidebar buttons just call `setView(...)`. This is perfect for a small, fixed set of screens like ours.\n- **React Router** — a library that maps **URL-like paths** to components (`/counter`, `/bookings`, `/reports`). It scales better when you have many screens, nested views, or want back/forward behaviour. In Electron you use the **hash/memory** style of routing because there is no web server.\n\nFor the Maranakatte Seva app with three main screens, **view state is enough** and keeps things simple. You render a fixed **Sidebar** with buttons, and a content area that shows Counter, Bookings, or Reports based on the current `view`. You can graduate to React Router later if the screen count grows.',
          whyItMatters:
            'Staff need to move instantly between issuing a Mangalarathi ticket, checking a Yakshagana booking, and viewing the day’s total. Clean navigation makes the app feel like one coherent counter rather than disconnected pages — and view state keeps that simple for three screens.',
          steps: [
            'Add `const [view, setView] = useState(\'counter\')`.',
            'Build a Sidebar with buttons for Counter, Bookings, Reports.',
            'Each button calls `setView(\'counter\'|\'bookings\'|\'reports\')`.',
            'Render the matching screen with a conditional or switch.',
            'Highlight the active button using the current `view`.',
            'Consider React Router only if the screen count grows large.',
          ],
          code: `import { useState } from 'react';
import CounterScreen from './CounterScreen';
import BookingsScreen from './BookingsScreen';
import ReportsScreen from './ReportsScreen';

export default function App() {
  const [view, setView] = useState('counter');

  return (
    <div className="app-shell">
      <nav className="sidebar">
        <button onClick={() => setView('counter')}  className={view === 'counter'  ? 'active' : ''}>Counter</button>
        <button onClick={() => setView('bookings')} className={view === 'bookings' ? 'active' : ''}>Bookings</button>
        <button onClick={() => setView('reports')}  className={view === 'reports'  ? 'active' : ''}>Reports</button>
      </nav>
      <main className="content">
        {view === 'counter'  && <CounterScreen />}
        {view === 'bookings' && <BookingsScreen />}
        {view === 'reports'  && <ReportsScreen />}
      </main>
    </div>
  );
}`,
          pitfalls: [
            '**Reaching for React Router for three screens.** Over-engineering. Fix: use simple view state; add Router only when needed.',
            '**Using BrowserRouter in Electron.** It relies on a web server / clean URLs. Fix: use hash or memory routing if you do adopt Router.',
            '**Forgetting to highlight the active screen.** Staff lose their place. Fix: set an `active` class from the current `view`.',
            '**Unmounting screens that hold unsaved input.** Data is lost on switch. Fix: lift important state up or persist it.',
            '**Deeply nested conditionals for many screens.** Hard to read. Fix: map a view name to a component, or switch to Router.',
            '**Storing the active view in a global instead of state.** Hard to track. Fix: keep `view` in component state.',
          ],
          tryIt:
            'Build an `App` with a sidebar of three buttons (Counter, Bookings, Reports) and a `view` state that conditionally renders each screen. Confirm clicking a button switches the content and highlights the active button.',
          takeaway: 'For three screens, hold the current view in `useState` and render the matching component; reserve React Router (hash/memory style) for larger apps.',
        },
        {
          id: 'm1-t16',
          title: 'Styling the counter UI with Tailwind',
          explain:
            'Add Tailwind CSS (or plain CSS) to style the renderer, giving the counter a clean, fast, readable layout using utility classes.',
          analogy:
            'Styling is dressing the counter for devotees: clear, calm, and quick to read under the evening rush. **Tailwind** is like a tray of ready-made labels and spacers — “big text here”, “padding there”, “highlight the selected tile” — that you stick straight onto each element. No hunting through a separate style ledger; the look is written right beside the element.',
          theory:
            '**Tailwind CSS** is a utility-first styling approach: instead of writing custom CSS classes, you apply small **utility classes** directly in JSX — `className="p-4 text-lg font-semibold rounded"`. Each class does one thing (padding, text size, weight, rounded corners), and you compose them.\n\nIn an electron-vite React project you add Tailwind as a dev dependency, generate its config, and include its directives in your main CSS file (imported by the renderer). After that, utility classes work anywhere in the renderer.\n\nWhy Tailwind suits a counter UI:\n- **Speed** — you style the seva grid quickly without switching files.\n- **Consistency** — a fixed scale of sizes/spacings keeps screens uniform.\n- **Readable density** — large tap targets and clear text help during the 500+ ticket Rangapooje rush.\n\nPlain **CSS** or CSS modules are perfectly fine alternatives if you prefer; the key point is to set styling up early so the Counter, Bookings, and Reports screens look clean and are easy to use.',
          whyItMatters:
            'A counter used hundreds of times an evening must be legible and quick — big tap targets, clear prices, obvious selected states. Setting up Tailwind (or CSS) early lets you shape that fast, consistent UI without fighting styling later.',
          steps: [
            'Add Tailwind: `npm install -D tailwindcss postcss autoprefixer`.',
            'Generate config: `npx tailwindcss init -p`.',
            'Set the `content` paths to your renderer files in `tailwind.config.js`.',
            'Add the `@tailwind base; @tailwind components; @tailwind utilities;` directives to your main CSS.',
            'Import that CSS in the renderer entry (`main.jsx`).',
            'Apply utility classes to the seva grid and confirm the styles appear.',
          ],
          code: `/* src/renderer/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;`
            + "\n\n"
            + `// tailwind.config.js — point Tailwind at the renderer files
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: []
};`
            + "\n\n"
            + `// Using utility classes on a seva tile (renderer JSX)
function SevaTile({ name, price, active }) {
  return (
    <button
      className={
        'p-4 m-1 rounded-lg text-lg font-semibold border ' +
        (active ? 'bg-sky-600 text-white' : 'bg-white text-slate-800')
      }
    >
      {name} — ₹{price}
    </button>
  );
}`,
          pitfalls: [
            '**Forgetting to import the CSS in the renderer entry.** No styles apply. Fix: `import \'./index.css\'` in `main.jsx`.',
            '**Wrong `content` paths in the config.** Classes get purged and vanish in build. Fix: include all renderer `.jsx` paths.',
            '**Loading Tailwind from a CDN.** Breaks the offline rule and may fail. Fix: install it locally as a dev dependency.',
            '**Mixing `class` and `className`.** JSX needs `className`. Fix: always use `className`.',
            '**Tiny tap targets for a touch/quick-use counter.** Slows staff. Fix: use generous padding and text size.',
            '**Inline styles everywhere instead of utilities.** Inconsistent UI. Fix: prefer Tailwind utilities or shared classes.',
          ],
          tryIt:
            'Install Tailwind, add the directives to your renderer CSS, import it, and apply utility classes to a `SevaTile` so the selected tile turns sky-blue. Run `npm run dev` and confirm the styling shows.',
          takeaway: 'Set up Tailwind (or CSS) in the renderer early and use utility classes for a clean, legible, fast counter UI with clear selected states.',
        },
      ],
    },
    {
      id: 'm1-s4',
      title: 'The Electron security model',
      topics: [
        {
          id: 'm1-t17',
          title: 'contextIsolation ON, nodeIntegration OFF',
          explain:
            'Keeping `contextIsolation` on and `nodeIntegration` off sandboxes the renderer so untrusted UI code can never directly touch Node.js or the local database.',
          analogy:
            'The records room at Maranakatte holds every devotee’s details and the day’s takings. You would never hand the front-desk screen a master key to that room — a single mischievous slip could empty it. **`contextIsolation` on** and **`nodeIntegration` off** keep that key out of the devotee-facing screen entirely. The desk can *ask* the head clerk for what it needs, but it can never walk into the records room itself.',
          theory:
            'Two `webPreferences` flags define the renderer’s power:\n\n- **`nodeIntegration: false`** — the renderer **cannot** use Node APIs (`require`, `fs`, `pg`). Without this, any script in the page could read files or the database.\n- **`contextIsolation: true`** — the renderer’s JavaScript world is **separated** from the preload’s, so the page cannot reach into or tamper with privileged objects. The only things it sees are what the preload **deliberately** exposes.\n\nWhy this matters so much: a renderer can end up running **untrusted content** — a malformed value, an injected script, a compromised dependency. If that code had Node access, it could read or delete the temple’s entire local database. By keeping the renderer powerless and routing every privileged action through the narrow preload bridge, you contain the damage.\n\nThese settings are the **modern Electron security default**, and the Maranakatte Seva app must keep them: `nodeIntegration: false`, `contextIsolation: true`, always.',
          whyItMatters:
            'These two flags are the single most important security decision in an Electron app. They ensure a bug or injected script in the UI cannot reach the temple’s local database — protecting every devotee record and the day’s seva takings.',
          steps: [
            'In the `BrowserWindow` `webPreferences`, set `nodeIntegration: false`.',
            'Set `contextIsolation: true`.',
            'Provide a `preload` script path for the safe bridge.',
            'Confirm the renderer cannot `require(\'pg\')` or `require(\'fs\')`.',
            'Route all privileged work through `window.api` (preload) instead.',
            'Never enable `nodeIntegration` for convenience.',
          ],
          code: `// src/main/index.js — the secure defaults for the counter window
const win = new BrowserWindow({
  width: 1100,
  height: 720,
  webPreferences: {
    preload: path.join(__dirname, '../preload/index.js'),
    nodeIntegration: false,   // renderer has NO Node/DB access
    contextIsolation: true    // renderer JS is isolated from privileged code
  }
});

// Consequence in the renderer (App.jsx):
//   require('pg')   -> NOT available (good!)
//   window.api.*    -> the ONLY way to reach privileged main-process work`,
          pitfalls: [
            '**Setting `nodeIntegration: true` to “make things work”.** Opens the whole machine to UI bugs. Fix: keep it `false` and use preload.',
            '**Disabling `contextIsolation`.** The page can tamper with privileged objects. Fix: keep it `true`.',
            '**Exposing raw Node objects through the bridge.** Defeats isolation. Fix: expose only small, specific functions.',
            '**Loading remote/untrusted content into the renderer.** Dangerous with any Node access. Fix: load only local content (offline app).',
            '**Assuming the defaults are unsafe to change later.** They are the safe baseline. Fix: leave them on for the life of the app.',
            '**Putting database code in the renderer despite the flags.** It simply will not work. Fix: all DB code lives in main.',
          ],
          tryIt:
            'Confirm your `BrowserWindow` uses `nodeIntegration: false` and `contextIsolation: true`. In the renderer, try `require(\'fs\')` and observe it is unavailable. Note that the only path to privileged work is `window.api`.',
          takeaway: 'Always keep `nodeIntegration: false` and `contextIsolation: true` — the renderer stays sandboxed and reaches privileged work only through the preload bridge.',
        },
        {
          id: 'm1-t18',
          title: 'The preload script & contextBridge',
          explain:
            'The preload script uses `contextBridge.exposeInMainWorld` to safely hand the renderer a small, controlled `window.api` — the only door between UI and main process.',
          analogy:
            'The **preload** is the trusted runner who stands at the connecting door between the devotee desk and the records room. The runner offers the desk a short, fixed menu of requests — “I can fetch today’s bookings”, “I can save this ticket” — and nothing more. **`contextBridge`** is the rule that the runner may only pass these specific slips, never hand over the records-room key itself.',
          theory:
            'The **preload script** runs in a special context that has access to a limited bridge API **before** the renderer’s React code loads. Its job is to expose a **safe, minimal surface** to the renderer.\n\nYou use **`contextBridge.exposeInMainWorld(\'api\', {...})`** to attach an object to the renderer’s `window` as `window.api`. You expose **functions**, not raw Node objects. Each function typically calls **`ipcRenderer.invoke(\'channel\', args)`**, which sends a message to the main process and awaits a reply.\n\nThe main process listens with **`ipcMain.handle(\'channel\', handler)`**, does the privileged work (read the database, save a ticket), and returns a result. So the data flow is:\n\n`React -> window.api.getBookings() -> ipcRenderer.invoke -> ipcMain.handle -> DB -> back`\n\nBecause you only expose specific functions, the renderer can do **exactly** what you allow and nothing more. This is how the Maranakatte Seva app keeps the UI powerless yet fully functional — every privileged action is a named, controlled call through `window.api`.',
          whyItMatters:
            'The preload bridge is what makes a locked-down renderer still useful. It is the controlled door through which every seva ticket and booking flows safely to the database — powerful enough to run the counter, narrow enough to stay secure.',
          steps: [
            'In `preload/index.js`, import `contextBridge` and `ipcRenderer`.',
            'Build an `api` object of small functions (e.g. `ping`, `getBookings`).',
            'Each function calls `ipcRenderer.invoke(\'channel\', ...args)`.',
            'Expose it: `contextBridge.exposeInMainWorld(\'api\', api)`.',
            'In `main/index.js`, handle each channel with `ipcMain.handle`.',
            'In React, call `await window.api.getBookings(date)`.',
          ],
          code: `// src/preload/index.js — the safe bridge
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Each exposed function is a narrow, named door:
  ping: () => ipcRenderer.invoke('app:ping'),
  getBookings: (date) => ipcRenderer.invoke('bookings:list', date)
});

// src/main/index.js — handle the channels (privileged side)
const { ipcMain } = require('electron');

ipcMain.handle('app:ping', () => 'pong from main');
ipcMain.handle('bookings:list', async (event, date) => {
  // (later) query local PostgreSQL here and return rows
  return [{ id: 1, devotee: 'Suresha', seva: 'Annadhana', date }];
});

// In React (renderer):
//   const reply = await window.api.ping();           // -> 'pong from main'
//   const rows  = await window.api.getBookings(date);`,
          pitfalls: [
            '**Exposing `ipcRenderer` or Node objects directly.** Hands the renderer too much power. Fix: expose only specific functions.',
            '**Forgetting to set the `preload` path in `webPreferences`.** `window.api` is undefined. Fix: wire the preload path in the main process.',
            '**Channel-name typos between preload and main.** The call hangs or errors. Fix: keep channel strings identical (e.g. `bookings:list`).',
            '**Using `ipcRenderer.send` when you expect a reply.** No return value. Fix: use `invoke`/`handle` for request-response.',
            '**Doing database work in the preload.** It blurs the boundary. Fix: keep DB logic in main; preload only forwards calls.',
            '**Exposing an overly broad API (e.g. “run any SQL”).** Defeats the safety. Fix: expose specific, intent-named functions.',
          ],
          tryIt:
            'In the preload, expose `window.api.ping()` that calls `ipcRenderer.invoke(\'app:ping\')`, and handle `app:ping` in the main process to return ‘pong’. From React, call `await window.api.ping()` and log the reply.',
          takeaway: 'Use `contextBridge.exposeInMainWorld` to give the renderer a small `window.api` of named functions that `invoke` IPC channels handled in the main process — the one safe door.',
        },
        {
          id: 'm1-t19',
          title: 'Content-Security-Policy & loading only local content',
          explain:
            'A Content-Security-Policy and a strict no-remote-content rule ensure the offline app only ever loads its own local files — no external scripts, no surprises.',
          analogy:
            'The Maranakatte counter only trusts slips written on its own letterhead. A **Content-Security-Policy** is the standing order at the door: “accept scripts and styles from *this app only*; reject anything arriving from outside.” Since the temple has no internet anyway, this rule simply formalises what should already be true — everything the app uses lives on the counter machine.',
          theory:
            'A **Content-Security-Policy (CSP)** is a set of rules, declared in a `<meta>` tag (or response header), that tells the renderer **what sources it may load** — scripts, styles, images, connections. A strict CSP **blocks remote and inline code**, which shrinks the attack surface dramatically.\n\nFor an **offline** app the rule is simple: load **only local content**. That means:\n- a CSP like `default-src \'self\'` so the page only loads from its own bundle;\n- **no CDN links** for React, Tailwind, fonts, or icons — everything is bundled locally;\n- **no remote URLs** loaded into the `BrowserWindow` (only `file://` in production).\n\nThis pairs with the earlier flags: with `nodeIntegration` off, `contextIsolation` on, a narrow preload bridge, **and** a strict CSP loading only local files, the renderer has almost no way to run hostile code. For the Maranakatte Seva app — which never needs the internet — enforcing “local only” is both a security win and a guarantee that the counter works during a power-cut-prone, no-internet evening.',
          whyItMatters:
            'Loading only local content removes a whole class of attacks and guarantees the app keeps working with no internet — essential for a temple counter that may have none. A strict CSP is the final lock that completes Electron’s security model for this offline app.',
          steps: [
            'Add a strict CSP `<meta>` tag to `renderer/index.html` (e.g. `default-src \'self\'`).',
            'Remove any CDN `<script>`/`<link>` tags; bundle libraries locally instead.',
            'Ensure the production window loads via `file://`, never a remote URL.',
            'Avoid inline scripts that a strict CSP would block.',
            'Keep fonts/icons/images as local bundled assets.',
            'Verify in DevTools that no external requests are made.',
          ],
          code: `<!-- src/renderer/index.html — strict, offline-friendly CSP -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
/>

<!-- Everything is local: no CDN links like the following are allowed -->
<!-- <script src="https://cdn.example.com/react.js"></script>  BLOCKED -->

// Main process keeps content local in production:
//   win.loadFile(path.join(__dirname, '../renderer/index.html')); // file:// only
// Never: win.loadURL('https://some-remote-site');  // not for an offline app`,
          pitfalls: [
            '**Loading React/Tailwind from a CDN.** Breaks offline use and weakens CSP. Fix: install and bundle them locally.',
            '**Omitting the CSP entirely.** Larger attack surface. Fix: add at least `default-src \'self\'`.',
            '**Using inline `<script>` with a strict CSP.** It gets blocked. Fix: move logic into bundled files.',
            '**Loading a remote URL into the window.** Defeats the offline/security model. Fix: load only `file://` content in production.',
            '**Allowing `unsafe-eval` carelessly.** Re-opens injection risks. Fix: avoid it; keep the policy tight.',
            '**Forgetting images/fonts are remote.** They fail offline. Fix: bundle all assets locally.',
          ],
          tryIt:
            'Add a `default-src \'self\'` CSP meta tag to `renderer/index.html`, then ensure no CDN links remain (bundle any libraries locally). Open DevTools → Network and confirm the app makes no external requests.',
          takeaway: 'Enforce a strict CSP (`default-src \'self\'`) and load only local `file://` content — the final lock that keeps the offline counter app secure and internet-free.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm1-p1',
      type: 'Mini Project',
      title: 'Hello Maranakatte Window',
      domain: 'Electron + React + Vite',
      duration: '2 hours',
      description:
        'Scaffold an Electron + React + Vite app that opens a desktop BrowserWindow rendering a React welcome screen with the temple name, wired with the dev script and the secure window defaults.',
      tools: ['Node.js', 'electron-vite', 'Electron', 'React', 'Vite'],
      blueprint: {
        overview:
          'Get a real, running offline desktop app on screen. You scaffold the project, create the main window with secure defaults, load the React renderer, and show a welcome screen reading “Maranakatte Seva” — the foundation every later module builds on.',
        functionalRequirements: [
          '**Window opens.** Running `npm run dev` opens a desktop window.',
          '**Welcome screen.** The React renderer shows “Shri Brahmalingeshwara Temple — Maranakatte Seva”.',
          '**Secure defaults.** The window uses `nodeIntegration: false` and `contextIsolation: true`.',
          '**Correct loading.** The window loads the dev-server URL in dev and `index.html` (file://) in the build.',
          '**Hot reload works.** Editing the welcome text updates the window live.',
        ],
        technicalImplementation: [
          '**Scaffold.** `npm create @quick-start/electron@latest` → React, JavaScript, name `maranakatte-seva`.',
          '**Main process.** `main/index.js` creates a `BrowserWindow` (1100x720) with a preload path and secure flags.',
          '**Loading branch.** `loadURL(ELECTRON_RENDERER_URL)` in dev, else `loadFile(renderer/index.html)`.',
          '**Renderer.** `App.jsx` renders the temple welcome heading.',
          '**Run.** `npm run dev` for hot-reload development; `npm run build` + `npm start` to verify the offline build.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold the app',
            outcome: 'A running Electron + React + Vite starter.',
            prompt:
              'Help me scaffold an Electron + React + Vite desktop app named maranakatte-seva using "npm create @quick-start/electron@latest". Choose the React framework and JavaScript (not TypeScript). Then show me the exact commands to install dependencies and run it with hot reload (npm install, npm run dev), and explain what the src/main, src/preload, and src/renderer folders are for.',
          },
          {
            step: 2,
            label: 'Secure main window',
            outcome: 'A BrowserWindow with secure defaults.',
            prompt:
              'In src/main/index.js, create the main BrowserWindow for the Maranakatte Seva app: 1100x720, title "Maranakatte Seva", webPreferences with a preload path, nodeIntegration false, and contextIsolation true. Create the window only after app.whenReady(). Load the renderer from process.env.ELECTRON_RENDERER_URL when it exists (dev), otherwise loadFile the built renderer/index.html (production). Add window-all-closed handling that quits on Windows/Linux but not macOS.',
          },
          {
            step: 3,
            label: 'Welcome screen',
            outcome: 'A React welcome screen with the temple name.',
            prompt:
              'In src/renderer/src/App.jsx, build a simple welcome screen that shows "Shri Brahmalingeshwara Temple" as a heading and "Maranakatte Seva — Counter" as a subheading, plus a short respectful welcome line. Keep it pure React (no Node or database access). Then confirm that running npm run dev shows it in the window and that editing the heading text hot-reloads instantly.',
          },
        ],
      },
    },
    {
      id: 'm1-p2',
      type: 'Project',
      title: 'Two-Screen Shell with a Secure Bridge',
      domain: 'Electron + React + IPC',
      duration: '2 hours',
      description:
        'Build a React shell inside Electron with a sidebar that switches between a Counter screen and a Bookings screen (no data yet), plus a secure preload that exposes a stub `window.api.ping()` wired to the main process via IPC.',
      tools: ['Electron', 'React', 'contextBridge', 'IPC', 'Vite'],
      blueprint: {
        overview:
          'Turn the single welcome window into a real app shell. A sidebar navigates between Counter and Bookings using view state, and a secure preload bridge exposes `window.api.ping()` that round-trips to the main process — proving the IPC pipeline works before any database arrives.',
        functionalRequirements: [
          '**Sidebar navigation.** Buttons switch between a Counter screen and a Bookings screen.',
          '**View state.** The active screen is tracked in React state and the active button is highlighted.',
          '**Secure preload.** A preload exposes a minimal `window.api` with a `ping()` function.',
          '**IPC round-trip.** `window.api.ping()` invokes an `app:ping` channel handled in main and returns a reply.',
          '**Secure flags kept.** `nodeIntegration: false`, `contextIsolation: true` throughout.',
        ],
        technicalImplementation: [
          '**App shell.** `App.jsx` holds `view` state and renders a Sidebar plus the matching screen.',
          '**Screens.** `CounterScreen` and `BookingsScreen` are placeholder components (no data yet).',
          '**Preload.** `preload/index.js` uses `contextBridge.exposeInMainWorld(\'api\', { ping })` where `ping` calls `ipcRenderer.invoke(\'app:ping\')`.',
          '**Main handler.** `ipcMain.handle(\'app:ping\', () => \'pong from main\')`.',
          '**Verify.** A button or `useEffect` calls `window.api.ping()` and displays the reply to confirm the bridge.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Sidebar shell',
            outcome: 'A two-screen shell with working navigation.',
            prompt:
              'In the maranakatte-seva renderer, build an App shell with a left sidebar containing two buttons: Counter and Bookings. Track the active screen with useState (default "counter") and conditionally render a CounterScreen or BookingsScreen placeholder component (just headings for now, no data). Highlight the active button with an "active" class based on the current view. Keep everything pure React in the renderer.',
          },
          {
            step: 2,
            label: 'Secure preload bridge',
            outcome: 'A window.api.ping exposed safely.',
            prompt:
              'In src/preload/index.js, use contextBridge.exposeInMainWorld to expose a minimal window.api object with a single function ping() that calls ipcRenderer.invoke("app:ping"). Make sure the main BrowserWindow sets the preload path and keeps nodeIntegration false and contextIsolation true. Do not expose ipcRenderer or any Node objects directly — only the ping function.',
          },
          {
            step: 3,
            label: 'IPC round-trip',
            outcome: 'A confirmed ping/pong across processes.',
            prompt:
              'In src/main/index.js, add ipcMain.handle("app:ping", () => "pong from main"). Then in the renderer, add a small "Test bridge" button (or a useEffect) that calls await window.api.ping() and shows the reply on screen. Confirm clicking it displays "pong from main", proving the renderer -> preload -> IPC -> main round-trip works before any database is added.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm1-q1',
      q: 'In the Maranakatte Seva app, which Electron process is allowed to access Node.js and the local PostgreSQL database?',
      options: ['The renderer process', 'The main process', 'The preload script', 'Any process'],
      answer: 1,
    },
    {
      id: 'm1-q2',
      q: 'When you run `npm run dev`, what happens differently when you edit the React UI versus the main process?',
      options: [
        'Both fully restart the app',
        'The renderer hot-reloads instantly; the main process triggers a full restart',
        'Neither updates until you rebuild',
        'The main process hot-reloads; the renderer restarts',
      ],
      answer: 1,
    },
    {
      id: 'm1-q3',
      q: 'How should the main process load the renderer in the built, offline app?',
      options: [
        'loadURL to a remote https site',
        'loadURL to localhost:5173',
        'loadFile the built renderer/index.html via file://',
        'It loads automatically with no code',
      ],
      answer: 2,
    },
    {
      id: 'm1-q4',
      q: 'Why does the app use `requestSingleInstanceLock()`?',
      options: [
        'To make the window load faster',
        'So two copies never run and fight over the same local database',
        'To enable hot reload',
        'To bundle the renderer',
      ],
      answer: 1,
    },
    {
      id: 'm1-q5',
      q: 'What is the correct, secure way for the React renderer to reach privileged work in the main process?',
      options: [
        'Call require("pg") directly in a component',
        'Enable nodeIntegration and query the database in React',
        'Call a function on window.api exposed by the preload via contextBridge',
        'Load a remote API over the internet',
      ],
      answer: 2,
    },
    {
      id: 'm1-q6',
      q: 'Which webPreferences settings are the secure defaults the Maranakatte Seva app must keep?',
      options: [
        'nodeIntegration: true, contextIsolation: false',
        'nodeIntegration: false, contextIsolation: true',
        'Both set to true',
        'Both set to false',
      ],
      answer: 1,
    },
  ],
};
