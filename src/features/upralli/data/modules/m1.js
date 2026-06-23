// Module 1 — Electron + React + TypeScript with electron-vite
// Builds the foundation of the offline "Upralli Seva" desktop app: the three-process
// architecture, the dev/build pipeline, React 18 in TS, and the Electron security model.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m1 = {
  id: 'm1',
  title: 'Electron + React + TypeScript with electron-vite',
  hours: 9,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Scaffold the offline Upralli Seva desktop app with electron-vite, React 18 and TypeScript. Learn the main / preload / renderer split, the two-tsconfig build pipeline, a Kannada-ready tabbed React shell, and Electron’s security model so the Upralli temple committee’s pooja register runs fast and safe with no cloud.',
  sections: [
    {
      id: 'm1-s1',
      title: 'Scaffolding with electron-vite',
      topics: [
        {
          id: 'm1-t1',
          title: 'What electron-vite gives you',
          explain:
            'electron-vite is the build tool that bundles all three parts of an Electron app — main, preload and renderer — with Vite, and gives the React screen hot reload while you work.',
          analogy:
            'Picture the Upralli committee deciding to replace the thick handwritten register book with a computer at the temple office. The book has three jobs rolled into one: a clerk who actually writes (that is the **main** process), a doorkeeper who checks who is allowed to write (the **preload** bridge), and the printed pages the visitors read (the **renderer**). electron-vite is the carpenter who builds all three desks in one workshop from one plan, and even lets you repaint the visitor pages live without rebuilding the whole office.',
          theory:
            'A plain Electron app is awkward to build because it has **three separate JavaScript worlds** that run in different environments: the Node-powered **main** process, the privileged **preload** script, and the browser-like **renderer**. Each needs its own bundling rules. Wiring up Vite three times by hand is tedious and error-prone.\n\n**electron-vite** solves this. One config (`electron.vite.config.ts`) describes all three; one `dev` command builds main + preload, launches Electron, and serves the renderer with **Hot Module Replacement (HMR)** so React edits appear instantly. One `build` command produces an optimised `out/` folder ready to be packaged into an installer.\n\nFor Upralli Seva this matters because the app is **fully offline** — there is no web server to deploy to. Everything ships as one Windows installer the committee runs once. electron-vite gives us a modern TypeScript + React developer experience while still producing that single self-contained desktop program.',
          whyItMatters:
            'The build tool shapes your whole workflow. electron-vite removes the three-bundler busywork so you spend your time on the register logic, not on plumbing, and HMR keeps the feedback loop fast.',
          steps: [
            'Confirm Node is installed: `node -v` (v20+ recommended) and `npm -v`.',
            'Scaffold with the official template: `npm create @quick-start/electron@latest`.',
            'Choose the React + TypeScript variant when prompted.',
            'Name the project upralli-seva and let it pick electron-vite.',
            'Run `npm install` to pull Electron, React, Vite and the typescript toolchain.',
            'Run `npm run dev` and confirm an Electron window opens with the starter page.',
          ],
          code: `// package.json (trimmed) — the scripts electron-vite wires up for you
{
  'name': 'upralli-seva',
  'version': '0.1.0',
  'main': './out/main/index.js',
  'scripts': {
    'dev': 'electron-vite dev',
    'build': 'electron-vite build',
    'typecheck': 'npm run typecheck:node && npm run typecheck:web',
    'package': 'electron-vite build && electron-builder'
  }
}

// electron.vite.config.ts — ONE config describes all three processes
import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: { build: { outDir: 'out/main' } },
  preload: { build: { outDir: 'out/preload' } },
  renderer: {
    plugins: [react()],
    resolve: { alias: { '@shared': resolve('src/shared') } }
  }
})`,
          pitfalls: [
            '**Treating it like a plain Vite web app.** electron-vite outputs three bundles, not one. Fix: remember `out/main`, `out/preload` and `out/renderer` each exist and the `main` field in package.json must point at `out/main/index.js`.',
            '**Running `vite dev` instead of `electron-vite dev`.** Plain vite serves only the renderer in a browser, with no Electron window. Fix: always use the `npm run dev` script the template provides.',
            '**Forgetting the React+TS variant.** The default scaffold may give you vanilla JS. Fix: pick the React + TypeScript option, or you will rewrite the renderer later.',
            '**Old Node version.** Electron needs a modern Node; an old one throws cryptic native-module errors. Fix: install Node 20 LTS or newer before scaffolding.',
            '**Editing files under `out/`.** Those are generated. Fix: only ever edit `src/`; `out/` is rebuilt on every `dev`/`build`.',
            '**Assuming HMR refreshes the main process.** HMR is renderer-only; main/preload changes need a restart. Fix: stop and rerun `dev` after editing main or preload.',
          ],
          tryIt:
            'Scaffold the project, run `npm run dev`, and edit the heading text in the renderer’s `App.tsx`. Watch it update in the open window without a manual reload — that is HMR. Then edit a `console.log` in `src/main/index.ts` and notice it does NOT hot-reload.',
          takeaway:
            'electron-vite bundles main + preload + renderer from one config and hot-reloads only the renderer — the modern foundation for a TypeScript Electron app.',
        },
        {
          id: 'm1-t2',
          title: 'Project layout: main, preload, renderer, shared',
          explain:
            'The src folder is split into four areas so each Electron world stays separate and a fourth folder holds the types both ends agree on.',
          analogy:
            'In the temple office the work is divided by who is allowed where. The clerk’s back room (**main**) holds the register and the cash box; only the clerk enters. The counter window (**preload**) is the narrow slot through which forms pass. The waiting hall (**renderer**) is where visitors fill forms and read notices. And the **shared** folder is the printed form template both the clerk and the visitor look at — so they never disagree on what fields a Magane entry has.',
          theory:
            'electron-vite’s convention puts each process in its own folder under `src/`:\n\n- **`src/main`** — the Node side. It creates windows, owns the database (later, Prisma + embedded Postgres), and handles IPC requests. Full OS access.\n- **`src/preload`** — the bridge. A tiny privileged script that exposes a safe, typed `window.api` to the renderer. No business logic.\n- **`src/renderer`** — the React app the user sees. Browser-like, no Node, no database.\n- **`src/shared`** — plain TypeScript types and constants with **no runtime dependencies**, imported by preload and renderer (and main) so the IPC surface is described once.\n\nWhy this boundary matters: it enforces the security model physically. The renderer literally cannot `import` Prisma because Prisma lives in `src/main`, and the only thing crossing into the renderer is whatever preload chooses to expose. For Upralli Seva, the household and pooja-rate types living in `src/shared` mean a typo in a field name is a compile error on both ends, not a silent runtime bug at the committee’s counter.',
          whyItMatters:
            'A clear folder boundary is your first line of defence. It keeps database code out of the UI, makes the typed IPC contract obvious, and lets new contributors instantly see which world a file belongs to.',
          steps: [
            'Create `src/main`, `src/preload`, `src/renderer`, `src/shared` if the template did not.',
            'Put `index.ts` in main and preload as their entry points.',
            'Keep React components and `App.tsx` under `src/renderer/src`.',
            'Add `src/shared/types.ts` for cross-process types only — no imports of electron or prisma.',
            'Add an alias (e.g. `@shared`) so all three can import shared types cleanly.',
            'Verify nothing in `src/renderer` imports from `src/main`.',
          ],
          code: `src/
├─ main/
│  └─ index.ts          // BrowserWindow, app lifecycle, IPC handlers (Node, owns DB)
├─ preload/
│  ├─ index.ts          // contextBridge.exposeInMainWorld('api', ...)
│  └─ index.d.ts        // declares window.api for the renderer's autocomplete
├─ renderer/
│  ├─ index.html
│  └─ src/
│     ├─ App.tsx        // React 18 root (no Node, no Prisma)
│     └─ main.tsx
└─ shared/
   └─ types.ts          // types shared by all three — zero runtime deps

// src/shared/types.ts — the single source of truth for the IPC surface
export interface Magane {
  id: string
  nameKn: string        // Kannada name, e.g. 'ಕುಂದಾಪುರ'
  coordinator: string
  mobiles: string[]
}`,
          pitfalls: [
            '**Importing main code into the renderer.** It compiles in dev sometimes but breaks the security model and the production build. Fix: cross the boundary only through `window.api`.',
            '**Putting electron or prisma imports in `src/shared`.** That drags Node into the renderer bundle. Fix: shared holds pure types/constants only.',
            '**Mixing renderer components into `src/main`.** They will never render and confuse the build. Fix: all TSX lives under `src/renderer`.',
            '**Duplicating the same interface in preload and renderer.** They drift apart over time. Fix: define it once in `src/shared` and import it both places.',
            '**No path alias for shared.** You end up with brittle `../../../shared` imports. Fix: add an alias like `@shared` in the vite config and tsconfig paths.',
            '**Forgetting `index.d.ts` in preload.** The renderer then has no types for `window.api`. Fix: keep the declaration file beside the preload script.',
          ],
          tryIt:
            'Add a `PoojaType` interface to `src/shared/types.ts` and import it in both `src/preload/index.ts` and a renderer component. Confirm both get autocomplete and that renaming a field breaks compilation in both places at once.',
          takeaway:
            'Four folders — main, preload, renderer, shared — give Electron a clean security boundary and a single typed home for the IPC contract.',
        },
        {
          id: 'm1-t3',
          title: 'The two tsconfigs: node vs web',
          explain:
            'Main and preload run in Node, the renderer runs in a browser, so they need two different TypeScript configs with different libs and module settings.',
          analogy:
            'The clerk in the back room and the visitor in the hall both read Kannada, but they live by different rule books. The clerk may open the cash box and the register (Node APIs); the visitor may only use what is on the counter (browser APIs). Two **tsconfig** files are those two rule books — each says what is allowed in that room — and a `typecheck` script reads both before you ship.',
          theory:
            'TypeScript needs to know which global APIs exist. The main and preload processes run in **Node**, so they get `tsconfig.node.json` with Node types and CommonJS/ESM module resolution. The renderer runs in **Chromium**, so it gets `tsconfig.web.json` with the DOM lib and React JSX settings. A root `tsconfig.json` simply references both.\n\nThis split prevents nonsense like calling `document.querySelector` in main (no DOM there) or importing `fs` in the renderer (no Node there) — the compiler rejects it because that API is not in that config’s `lib`/types.\n\nBecause electron-vite’s bundling does not itself fail on type errors, you add a dedicated **`typecheck`** script that runs both configs with `tsc --noEmit`. For Upralli Seva this is the safety net: before producing the committee’s installer you run `npm run typecheck` and the two rule books confirm every household type, every IPC call and every React prop lines up across both worlds.',
          whyItMatters:
            'Two configs keep each process honest about which APIs it really has, and a single typecheck script turns silent runtime crashes at the temple counter into loud compile-time errors on your machine.',
          steps: [
            'Keep `tsconfig.node.json` for `src/main` and `src/preload` with Node types.',
            'Keep `tsconfig.web.json` for `src/renderer` with the DOM lib and JSX react-jsx.',
            'Let the root `tsconfig.json` reference both via `references`.',
            'Add `typecheck:node` = `tsc --noEmit -p tsconfig.node.json`.',
            'Add `typecheck:web` = `tsc --noEmit -p tsconfig.web.json`.',
            'Combine them: `typecheck` runs both; run it before every build.',
          ],
          code: `// tsconfig.node.json — main + preload (Node world)
{
  'extends': '@electron-toolkit/tsconfig/tsconfig.node.json',
  'include': ['src/main/**/*', 'src/preload/**/*', 'src/shared/**/*'],
  'compilerOptions': { 'composite': true, 'types': ['node', 'electron-vite/node'] }
}

// tsconfig.web.json — renderer (browser world)
{
  'extends': '@electron-toolkit/tsconfig/tsconfig.web.json',
  'include': ['src/renderer/src/**/*', 'src/preload/index.d.ts', 'src/shared/**/*'],
  'compilerOptions': { 'composite': true, 'jsx': 'react-jsx', 'lib': ['DOM', 'ESNext'] }
}

// package.json scripts — one command checks both rule books
'scripts': {
  'typecheck:node': 'tsc --noEmit -p tsconfig.node.json --composite false',
  'typecheck:web': 'tsc --noEmit -p tsconfig.web.json --composite false',
  'typecheck': 'npm run typecheck:node && npm run typecheck:web'
}`,
          pitfalls: [
            '**One tsconfig for everything.** Then `document` appears valid in main and `fs` in the renderer — exactly the bugs the split prevents. Fix: keep node and web configs separate.',
            '**Renderer missing the DOM lib.** React code that uses `document` fails to type-check. Fix: include `DOM` in `lib` for `tsconfig.web.json`.',
            '**Forgetting shared in both include lists.** One side then cannot see the shared types. Fix: add `src/shared/**/*` to both configs.',
            '**Assuming the build catches type errors.** Vite/esbuild strips types without checking them. Fix: rely on the explicit `typecheck` script, not the build, for correctness.',
            '**Leaving `preload/index.d.ts` out of the web config.** The renderer loses `window.api` types. Fix: include it in `tsconfig.web.json`.',
            '**`composite` clashes with `--noEmit`.** tsc complains in some setups. Fix: pass `--composite false` in the typecheck scripts as shown.',
          ],
          tryIt:
            'In `src/main/index.ts` write `document.title = \'x\'` and run `npm run typecheck`. Watch typecheck:node reject it because the DOM lib is not in the node config. Delete the line and confirm it passes.',
          takeaway:
            'Two tsconfigs encode the Node-vs-browser divide, and one `typecheck` script validates both worlds before you build the installer.',
        },
        {
          id: 'm1-t4',
          title: 'The npm scripts and the main entry point',
          explain:
            'A handful of npm scripts drive the whole lifecycle — dev, build, typecheck, package — and package.json’s main field tells Electron where to start.',
          analogy:
            'Think of these scripts as the daily routine printed on the temple office wall. `dev` is open for practice with the doors propped (live reload). `build` is preparing the finished register. `typecheck` is the senior clerk proofreading. `package` is binding it all into a book the committee can keep. And the `main` field is the very first page that tells anyone opening the book where to begin.',
          theory:
            'Electron, when launched, reads the **`main`** field of `package.json` and runs that file as the main process. After an electron-vite build the compiled main lives at `out/main/index.js`, so `main` must point there — not at the TypeScript source. Getting this wrong means a packaged app that opens no window.\n\nThe scripts form a pipeline:\n\n- **`dev`** — `electron-vite dev`: builds main+preload, starts Electron, serves the renderer with HMR.\n- **`build`** — `electron-vite build`: emits the optimised `out/` folder.\n- **`typecheck`** — runs both tsconfigs with no emit (your correctness gate).\n- **`package`** — builds, then runs electron-builder to make the Windows installer (Module 9).\n\nFor Upralli Seva, the everyday loop is `npm run dev`. Before any release you run `npm run typecheck` then `npm run package`. Keeping these four scripts tidy means the committee’s installer is always reproducible from one command.',
          whyItMatters:
            'These scripts are the contract between you and the toolchain. A correct `main` entry and a clear script set mean the difference between an app that runs and a silent blank window after packaging.',
          steps: [
            'Set `main` to `./out/main/index.js` in package.json.',
            'Use `npm run dev` for everyday development with HMR.',
            'Use `npm run build` to produce the `out/` bundle.',
            'Run `npm run typecheck` before committing or releasing.',
            'Use `npm run package` to produce the installer (electron-builder, later module).',
            'Never point `main` at a `.ts` file or at `src/` — Electron runs compiled JS.',
          ],
          code: `// package.json — the four scripts plus the all-important entry point
{
  'name': 'upralli-seva',
  'main': './out/main/index.js',   // Electron starts HERE after build
  'scripts': {
    'dev': 'electron-vite dev',
    'build': 'electron-vite build',
    'typecheck:node': 'tsc --noEmit -p tsconfig.node.json --composite false',
    'typecheck:web': 'tsc --noEmit -p tsconfig.web.json --composite false',
    'typecheck': 'npm run typecheck:node && npm run typecheck:web',
    'package': 'npm run typecheck && electron-vite build && electron-builder'
  }
}

// A typical day on Upralli Seva:
//   npm run dev        -> code with hot reload
//   npm run typecheck  -> proofread types
//   npm run package    -> hand the committee an installer`,
          pitfalls: [
            '**`main` pointing at `src/main/index.ts`.** Electron cannot run TypeScript directly; the packaged app shows nothing. Fix: point at `out/main/index.js`.',
            '**Skipping typecheck before package.** You ship type bugs to the committee. Fix: chain typecheck into the package script.',
            '**Confusing `build` with `package`.** `build` makes `out/`; `package` makes the installer. Fix: know that packaging always runs build first.',
            '**Running `dev` for a release demo.** dev serves an unminified renderer from a dev server. Fix: test releases with a real `package` build.',
            '**Editing scripts inconsistently.** A renamed script breaks teammates’ muscle memory and CI. Fix: keep `dev`/`build`/`typecheck`/`package` stable.',
            '**Hardcoding a dev port everywhere.** electron-vite manages the renderer URL; do not assume a fixed port in main. Fix: read the env-provided dev URL (next section).',
          ],
          tryIt:
            'Open package.json, change `main` to `./src/main/index.ts`, run `npm run build` then try the packaged output — note it fails to start. Restore it to `./out/main/index.js`.',
          takeaway:
            'Four scripts (dev, build, typecheck, package) plus a `main` field pointing at `out/main/index.js` define the whole Upralli Seva lifecycle.',
        },
      ],
    },
    {
      id: 'm1-s2',
      title: 'The three processes',
      topics: [
        {
          id: 'm1-t5',
          title: 'The main process and BrowserWindow',
          explain:
            'The main process is the Node program that boots the app, creates the window, and controls the application’s lifecycle from launch to quit.',
          analogy:
            'The main process is the head clerk of the Upralli office. When the office opens (`app.whenReady`) the clerk unlocks the room and sets up the counter window for visitors (`BrowserWindow`). When the last visitor leaves (`window-all-closed`) the clerk considers closing up, and just before locking the door for the night (`will-quit`) the clerk carefully shuts the register and the cash box — for us, stops the embedded Postgres database so nothing is left half-written.',
          theory:
            'The **main process** runs in Node and is the only place with full OS power. Its `index.ts` typically does three things: wait for Electron to be ready, create one or more **`BrowserWindow`** instances (each is a Chromium window hosting the renderer), and register lifecycle handlers.\n\nKey lifecycle events:\n\n- **`app.whenReady()`** — Electron is initialised; create windows here.\n- **`window-all-closed`** — on Windows we quit the app (macOS often keeps running).\n- **`will-quit`** — the last chance to clean up. For Upralli Seva this is where we **stop the embedded Postgres server** so the database files close cleanly.\n\nThe `BrowserWindow` is configured with a `webPreferences` block that points at the **preload** script and enforces security (contextIsolation on, nodeIntegration off — covered in s4). For an offline committee app, doing the database shutdown in `will-quit` is what guarantees the register survives an abrupt close without corruption.',
          whyItMatters:
            'The main process owns the app’s life and death. Creating the window at the right moment and shutting Postgres down in `will-quit` is what keeps the offline register reliable across thousands of opens and closes.',
          steps: [
            'In `src/main/index.ts`, import `app` and `BrowserWindow` from electron.',
            'Create the window inside `app.whenReady().then(...)`.',
            'Point `webPreferences.preload` at the built preload script.',
            'Load the renderer (dev URL or built file — next topic).',
            'Handle `window-all-closed` to quit on Windows/Linux.',
            'Handle `will-quit` to stop embedded Postgres (wired fully in later modules).',
          ],
          code: `// src/main/index.ts
import { app, BrowserWindow } from 'electron'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    title: 'ಉಪ್ರಳ್ಳಿ ಸೇವೆ',  // Upralli Seva
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,   // security model — see s4
      nodeIntegration: false
    }
  })
  // loadURL / loadFile handled in the next topic
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', async () => {
  // Stop the embedded Postgres server so the register closes cleanly.
  // await stopDatabase()   // implemented in the database module
})`,
          pitfalls: [
            '**Creating the window before `whenReady`.** Electron is not initialised and the call fails. Fix: always create windows inside `app.whenReady()`.',
            '**Forgetting the preload path.** Then `window.api` is undefined in the renderer. Fix: set `webPreferences.preload` to the built preload file.',
            '**Skipping `will-quit` cleanup.** The embedded Postgres can be left running or mid-write. Fix: stop the DB in `will-quit` before the process exits.',
            '**Not keeping a reference to the window.** It may be garbage-collected and vanish. Fix: hold it in a module-level variable like `mainWindow`.',
            '**Quitting on macOS in `window-all-closed`.** Mac apps usually stay alive. Fix: guard with `process.platform !== \'darwin\'`.',
            '**Doing async cleanup without awaiting.** The process may exit before Postgres stops. Fix: make `will-quit` async and await the shutdown.',
          ],
          tryIt:
            'Add a `console.log(\'will-quit fired\')` inside the `will-quit` handler, run the app, close it, and confirm the log appears in the terminal — proving you have a clean shutdown hook for Postgres later.',
          takeaway:
            'The main process boots the app, creates the BrowserWindow on `whenReady`, and uses `will-quit` to stop embedded Postgres cleanly.',
        },
        {
          id: 'm1-t6',
          title: 'The renderer and loading it: dev vs production',
          explain:
            'The renderer is the React UI; the main process loads it from a live dev server while you work, and from a built HTML file once the app is packaged.',
          analogy:
            'The waiting hall notices can come from two places. During practice the office reads them straight off a live noticeboard that someone keeps updating in real time (the **dev server**). Once the office is finished and handed to the committee, the notices are the printed pages bound into the book (the **built file**). The head clerk must know which to read depending on whether the office is still being set up or already in service.',
          theory:
            'The **renderer** is your React 18 app under `src/renderer`. It is loaded into the BrowserWindow in one of two ways, and main must choose correctly:\n\n- **Development** — electron-vite runs a Vite dev server and exposes its URL in the environment variable `ELECTRON_RENDERER_URL`. Main calls `mainWindow.loadURL(...)` so you get HMR.\n- **Production** — there is no server; main calls `mainWindow.loadFile(...)` pointing at the built `out/renderer/index.html`.\n\nThe standard pattern is to check `process.env[\'ELECTRON_RENDERER_URL\']` (or `app.isPackaged`). For Upralli Seva, getting this branch right is essential: a packaged committee app has no internet and no dev server, so it MUST load the local file. Loading a URL in production would leave the temple office staring at a blank window.',
          whyItMatters:
            'Offline correctness depends on this branch. Dev wants the live URL for HMR; the shipped app must load the bundled local file because there is no server on the committee’s machine.',
          steps: [
            'After creating the window, decide dev vs production.',
            'In dev, read `process.env[\'ELECTRON_RENDERER_URL\']`.',
            'Call `mainWindow.loadURL(devUrl)` when that env var exists.',
            'Otherwise call `mainWindow.loadFile` on `out/renderer/index.html`.',
            'Open DevTools automatically only in development.',
            'Test both paths: `npm run dev`, then a packaged build.',
          ],
          code: `// src/main/index.ts (inside createWindow, after constructing mainWindow)
import { is } from '@electron-toolkit/utils'

if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
  // Development: load the live Vite dev server for HMR.
  mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  mainWindow.webContents.openDevTools()
} else {
  // Production / offline: load the bundled local HTML file. No server exists.
  mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
}

// Show the window only once content is ready, to avoid a white flash.
mainWindow.on('ready-to-show', () => mainWindow?.show())`,
          pitfalls: [
            '**Hardcoding `http://localhost:5173`.** The port can change and is absent in production. Fix: read `ELECTRON_RENDERER_URL` from the environment.',
            '**Calling `loadURL` in the packaged app.** No server means a blank window. Fix: branch on dev vs production and use `loadFile` in production.',
            '**Wrong path to `index.html`.** A typo gives a blank screen with no error. Fix: build once and confirm the real path under `out/renderer`.',
            '**Opening DevTools in production.** It ships debugging UI to the committee. Fix: only open DevTools when `is.dev`.',
            '**White flash on startup.** Showing the window before content loads looks broken. Fix: create with `show:false` and reveal on `ready-to-show`.',
            '**Assuming HMR updates main.** It only updates the renderer. Fix: restart `dev` after main/preload edits.',
          ],
          tryIt:
            'Run `npm run dev` and confirm DevTools opens and edits hot-reload. Then run a production `build` and `loadFile`, and confirm the same UI appears with no dev server running.',
          takeaway:
            'Main loads the renderer from the dev-server URL in development and from the bundled local HTML file in the offline production build.',
        },
        {
          id: 'm1-t7',
          title: 'The preload script — the limited bridge',
          explain:
            'The preload script runs in a special privileged context before the web page loads, and its only job is to hand the renderer a small, safe set of functions.',
          analogy:
            'The preload is the counter clerk who stands at the slot between the back room and the waiting hall. Visitors never walk into the back room; they only pass forms through the slot, and only the forms the clerk accepts. The clerk decides exactly which requests are allowed — “save this Magane,” “give me this year’s totals” — and nothing else leaks through.',
          theory:
            'The **preload** script is unique: it runs in the renderer’s window but *before* the page loads, with access to a limited set of Node/Electron APIs and to the `contextBridge`. It is the **only** sanctioned channel between the privileged main process and the untrusted renderer.\n\nIts job is deliberately tiny. It does not contain business logic or touch the database. Instead it uses `ipcRenderer.invoke(...)` to forward typed requests to main, and exposes the results through `contextBridge.exposeInMainWorld(\'api\', ...)` as a small object the renderer sees as `window.api`.\n\nFor Upralli Seva, the preload exposes functions like `listMaganes()`, `saveMagane(input)`, `getYearTotals(yearId)` — each a thin wrapper over an IPC channel. Because preload is the chokepoint, you can audit the entire attack surface of the app by reading one file. The renderer can never reach Prisma directly; it can only ask for exactly what preload offers.',
          whyItMatters:
            'The preload is the security chokepoint of the whole app. Keeping it small and explicit means the renderer can only ever do what you deliberately allow — no accidental database access from the UI.',
          steps: [
            'Create `src/preload/index.ts`.',
            'Import `contextBridge` and `ipcRenderer` from electron.',
            'Define each api method as a thin `ipcRenderer.invoke(channel, args)` call.',
            'Bundle them into one `api` object typed from `src/shared`.',
            'Expose it with `contextBridge.exposeInMainWorld(\'api\', api)`.',
            'Keep ALL business logic and DB access in main, never here.',
          ],
          code: `// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import type { Magane } from '@shared/types'

// A small, explicit, typed surface — the WHOLE attack surface in one file.
const api = {
  ping: (): Promise<string> => ipcRenderer.invoke('ping'),
  listMaganes: (): Promise<Magane[]> => ipcRenderer.invoke('maganes:list'),
  saveMagane: (input: Omit<Magane, 'id'>): Promise<Magane> =>
    ipcRenderer.invoke('maganes:save', input)
}

contextBridge.exposeInMainWorld('api', api)

// Note: no Prisma, no fs, no business logic here — only thin IPC wrappers.`,
          pitfalls: [
            '**Exposing raw `ipcRenderer`.** That lets the renderer call any channel — a security hole. Fix: expose named wrapper functions only.',
            '**Putting database/Prisma code in preload.** Preload should not own data logic. Fix: forward to main with `invoke` and keep Prisma in main.',
            '**Forgetting `contextBridge` and assigning to `window` directly.** With contextIsolation on, that silently fails. Fix: always use `exposeInMainWorld`.',
            '**Untyped api methods.** The renderer loses autocomplete and safety. Fix: type each method using shared interfaces.',
            '**Heavy logic in preload.** It makes the bridge hard to audit. Fix: keep each method a one-line `invoke`.',
            '**Wrong preload path in BrowserWindow.** Then `window.api` is undefined. Fix: ensure `webPreferences.preload` matches the built preload file.',
          ],
          tryIt:
            'Add a `version: () => ipcRenderer.invoke(\'app:version\')` method to the api object, expose it, and (after wiring a handler in main) log `await window.api.version()` from the renderer console.',
          takeaway:
            'The preload is a tiny, auditable bridge that exposes a few typed IPC wrappers as `window.api` — and nothing else crosses into the renderer.',
        },
        {
          id: 'm1-t8',
          title: 'src/shared/types.ts — the typed IPC surface',
          explain:
            'A single shared types file describes the data crossing IPC so both preload and renderer (and main) agree on every field at compile time.',
          analogy:
            'It is the official printed form the Upralli committee uses for every household entry. The clerk in the back room fills it, the visitor in the hall reads it, and because both hold the exact same printed template, nobody can argue about which boxes exist or what goes in them. Change the template once and both copies update together.',
          theory:
            'IPC sends plain data between processes; without shared types, each side guesses the shape and they drift. **`src/shared/types.ts`** fixes this by defining the interfaces once: `Magane`, `PersonEntry`, `PoojaType`, `YearTotals`, and the input/output types of each api method.\n\nBecause this file has **no runtime dependencies** (no electron, no prisma, no React), it can be safely imported by all three processes. Preload uses it to type the `api` object; the renderer uses it to type `window.api`; main uses it to type its IPC handlers. One change to a field name ripples into a compile error everywhere it is used.\n\nFor Upralli Seva this is the backbone of correctness. A household has a combined Kannada `nameAddressKn`, an optional `mobile`, and an `order` for drag-sorting; a `PoojaType` has a Kannada label and a `rate` in paise or rupees. Declaring these once means the money maths and the Kannada fields are described identically on every side of every IPC call.',
          whyItMatters:
            'Shared types turn the loosely-typed IPC boundary into a strongly-typed contract, so a renaming or a missing field is caught by the compiler instead of failing silently at the temple counter.',
          steps: [
            'Create `src/shared/types.ts` with zero runtime imports.',
            'Define domain interfaces: `Magane`, `PersonEntry`, `PoojaType`, `YearTotals`.',
            'Define api input/output types for each IPC method.',
            'Import these types in preload to type the `api` object.',
            'Import the same types in renderer components.',
            'Keep this file free of electron, prisma and React.',
          ],
          code: `// src/shared/types.ts — one template, used everywhere, no runtime deps.
export interface Magane {
  id: string
  nameKn: string
  coordinator: string
  mobiles: string[]
}

export interface PersonEntry {
  id: string
  nameAddressKn: string   // combined Kannada household name + address
  mobile?: string
  order: number           // for drag-to-reorder in the register
}

export interface PoojaType {
  id: string
  labelKn: string         // Kannada column header
  rate: number            // ₹ per tick for this year
}

export interface YearTotals {
  perMagane: Record<string, number>
  grandTotal: number      // ₹, Indian grouping applied in the UI
}

// The shape of the typed bridge the renderer will see.
export interface UpralliApi {
  ping(): Promise<string>
  listMaganes(): Promise<Magane[]>
  saveMagane(input: Omit<Magane, 'id'>): Promise<Magane>
}`,
          pitfalls: [
            '**Importing electron or prisma here.** It pulls Node into the renderer bundle. Fix: keep this file to pure types and constants.',
            '**Redefining the same interface in preload and renderer.** They drift apart. Fix: define once here and import everywhere.',
            '**Using `any` for IPC payloads.** You lose all safety. Fix: give every method precise input/output types.',
            '**Mixing Prisma model types in directly.** Prisma types belong in main; shared should not depend on them. Fix: declare plain interfaces here and map to Prisma in main.',
            '**Forgetting optional fields.** A household `mobile` is optional; marking it required breaks real data. Fix: model optionality with `?` accurately.',
            '**Numbers without a documented unit.** Is `rate` rupees or paise? Fix: comment the unit so money maths stays consistent.',
          ],
          tryIt:
            'Add a `clonedFrom?: string` field to a `Year` interface here, import it in both preload and renderer, then rename it and watch both sides fail to compile — proving the contract is shared.',
          takeaway:
            'One runtime-free `src/shared/types.ts` defines the IPC data shapes once, giving main, preload and renderer a single typed contract.',
        },
      ],
    },
    {
      id: 'm1-s3',
      title: 'React 18 in the renderer (TS)',
      topics: [
        {
          id: 'm1-t9',
          title: 'React function components and TSX with typed props',
          explain:
            'The UI is built from React function components written in TSX, where each component’s inputs are described by a typed props interface.',
          analogy:
            'Each component is like a reusable rubber stamp in the office. A “Magane card” stamp always prints the same layout; you only change the ink — the name, the coordinator, the mobiles. The **props interface** is the little label on the stamp saying exactly which details it expects, so nobody presses it with the wrong information.',
          theory:
            'A React **function component** is just a function that returns JSX (in TypeScript, **TSX**). Its inputs are **props**, and in TS you describe them with an interface. This gives autocomplete and rejects wrong or missing props at compile time.\n\nFor Upralli Seva the renderer will be a tree of such components: a `MaganeCard` showing a sub-region, a `RegisterTable` of households, a `RateRow` for a pooja type. Typing props means a `MaganeCard` that needs a `Magane` cannot be rendered with, say, a `PersonEntry` by mistake.\n\nComponents compose: small typed pieces combine into screens. Because the props types come from `src/shared`, the same `Magane` shape flows from the database (main) through IPC to the card on screen, fully typed end to end. This is the everyday building block of the whole UI.',
          whyItMatters:
            'Typed components are the unit of the entire UI. Describing props precisely catches a whole class of “wrong data in the wrong card” bugs before the committee ever sees the screen.',
          steps: [
            'Create a component file like `MaganeCard.tsx`.',
            'Define a `Props` interface for its inputs.',
            'Write a function component taking `props: Props`.',
            'Return TSX describing the markup.',
            'Import shared domain types for the props.',
            'Compose components together inside `App.tsx`.',
          ],
          code: `// src/renderer/src/components/MaganeCard.tsx
import type { Magane } from '@shared/types'

interface Props {
  magane: Magane
  onSelect: (id: string) => void
}

export function MaganeCard({ magane, onSelect }: Props): JSX.Element {
  return (
    <button className='magane-card' onClick={() => onSelect(magane.id)}>
      <span className='kn'>{magane.nameKn}</span>
      <small>ಸಂಯಜಕ: {magane.coordinator}</small>
      <small>{magane.mobiles.join(', ')}</small>
    </button>
  )
}`,
          pitfalls: [
            '**Typing props as `any` or omitting the interface.** You lose every safety guarantee. Fix: declare a `Props` interface for each component.',
            '**Returning multiple root nodes without a fragment.** TSX needs one root. Fix: wrap siblings in `<>...</>`.',
            '**Inlining domain shapes instead of importing shared types.** They drift from the real model. Fix: import `Magane`/`PersonEntry` from `@shared/types`.',
            '**Forgetting the `key` on lists.** React warns and re-renders inefficiently. Fix: give each mapped element a stable `key`.',
            '**Using lowercase component names.** React treats them as HTML tags. Fix: name components in PascalCase.',
            '**Passing event handlers with the wrong signature.** Fix: type callbacks like `onSelect: (id: string) => void` so callers match.',
          ],
          tryIt:
            'Render a `MaganeCard` with a hardcoded `Magane` object and an `onSelect` that logs the id. Then try passing a number for `coordinator` and watch TypeScript reject it.',
          takeaway:
            'Typed React function components in TSX are the UI’s building block — props interfaces keep the right data in the right card.',
        },
        {
          id: 'm1-t10',
          title: 'useState and useEffect with types',
          explain:
            'React hooks let a component remember values (`useState`) and run side effects like loading data (`useEffect`), and TypeScript types both for safety.',
          analogy:
            'A component’s **state** is the clerk’s scratch pad on the desk — the currently selected Magane, whether a popup is open. `useState` is that scratch pad. `useEffect` is the standing instruction “whenever this changes, go and do that” — like “whenever a new year is opened, fetch its pooja columns from the register.”',
          theory:
            '**`useState<T>(initial)`** stores a value that, when updated, re-renders the component. In TypeScript you often annotate the type, e.g. `useState<string | null>(null)` for a selected id, so the setter only accepts valid values.\n\n**`useEffect(fn, deps)`** runs a side effect after render, re-running when its dependency array changes. It is where you trigger asynchronous work like calling `window.api.listMaganes()`. Effects can return a cleanup function for teardown.\n\nFor Upralli Seva, a `Register` screen might hold `selectedYearId` in state and use an effect to load that year’s pooja types whenever the selection changes. Typing the state means `selectedYearId` is always `string | null`, never an accidental number, and the effect’s dependency on it is explicit. (In practice we will lean on TanStack Query for data, but understanding the raw hooks first is essential.)',
          whyItMatters:
            'State and effects are how a React UI stays in sync with reality. Typing them prevents subtle bugs where the wrong value type slips into the selected year or the load runs at the wrong time.',
          steps: [
            'Import `useState` and `useEffect` from react.',
            'Declare typed state, e.g. `useState<string | null>(null)`.',
            'Update it with the setter to trigger re-render.',
            'Use `useEffect` to run async loads.',
            'List dependencies so the effect re-runs correctly.',
            'Return a cleanup function from the effect when needed.',
          ],
          code: `// src/renderer/src/screens/RegisterScreen.tsx
import { useEffect, useState } from 'react'
import type { PoojaType } from '@shared/types'

export function RegisterScreen(): JSX.Element {
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null)
  const [columns, setColumns] = useState<PoojaType[]>([])

  useEffect(() => {
    if (!selectedYearId) return
    let active = true
    // window.api comes from preload; data layer detailed in later modules.
    window.api.getPoojaTypes(selectedYearId).then((rows) => {
      if (active) setColumns(rows)
    })
    return () => { active = false }   // avoid setting state after unmount
  }, [selectedYearId])

  return <div>{columns.length} pooja columns this year</div>
}`,
          pitfalls: [
            '**Empty dependency array when you depend on a value.** The effect uses a stale value forever. Fix: list every value the effect reads.',
            '**Setting state after unmount.** A late async resolve warns and leaks. Fix: guard with an `active` flag and clean up.',
            '**Mutating state directly.** `columns.push(x)` does not re-render. Fix: call the setter with a new array.',
            '**Wrong state type inference.** `useState(null)` infers `null` only. Fix: annotate, e.g. `useState<string | null>(null)`.',
            '**Async function passed straight to useEffect.** `useEffect(async () => ...)` is invalid. Fix: define an inner async function or use `.then`.',
            '**Forgetting the cleanup return.** Subscriptions or flags leak. Fix: return a cleanup function when the effect sets things up.',
          ],
          tryIt:
            'Add a second `useState<boolean>(false)` for a “loading” flag, set it true before the api call and false in `.then`, and render a “Loading…” message while it is true.',
          takeaway:
            'Typed `useState` and `useEffect` keep component memory and data-loading correct — the foundation under the later TanStack Query layer.',
        },
        {
          id: 'm1-t11',
          title: 'App shell with tab navigation',
          explain:
            'The whole app lives inside one shell with four tabs — Maganes, Register, Rates, Tools — switched by a piece of state.',
          analogy:
            'The Upralli office has one big desk with four labelled trays: the Magane list, the yearly register, the rate card, and the tools drawer. The staff slide one tray forward at a time. The active tab is simply which tray is currently on top of the desk.',
          theory:
            'A common pattern for a small desktop app is a single **shell** component holding the navigation and rendering the active screen. We store the current tab in typed state and switch on it.\n\nFor Upralli Seva the four tabs map directly to the domain:\n\n- **Maganes** — manage the global master list of sub-regions.\n- **ದಾಖಲೆ / Register** — the year’s household × pooja participation grid.\n- **Rates** — per-year pooja types and their ₹ rates.\n- **Tools** — clone year, lock year, export, settings.\n\nUsing a string-literal union type for the tab (`\'maganes\' | \'register\' | \'rates\' | \'tools\'`) means the compiler guarantees we only ever set a real tab, and a `switch` renders the matching screen. This shell is where the Kannada labels and the saffron theme first appear together.',
          whyItMatters:
            'The shell is the spine of the app. A typed tab union plus a single render switch keeps navigation simple and impossible to point at a non-existent screen.',
          steps: [
            'Define a `TabId` union type for the four tabs.',
            'Hold the active tab in `useState<TabId>(\'maganes\')`.',
            'Render a nav bar with a button per tab, in Kannada + English.',
            'Highlight the active tab via a class.',
            'Switch on the active tab to render the right screen.',
            'Keep each screen in its own component file.',
          ],
          code: `// src/renderer/src/App.tsx
import { useState } from 'react'

type TabId = 'maganes' | 'register' | 'rates' | 'tools'

const TABS: { id: TabId; label: string }[] = [
  { id: 'maganes',  label: 'ಮಗಣೆಗಳು · Maganes' },
  { id: 'register', label: 'ದಾಖಲೆ · Register' },
  { id: 'rates',    label: 'ದರಗಳು · Rates' },
  { id: 'tools',    label: 'ಉಪಕರಣ · Tools' }
]

export function App(): JSX.Element {
  const [tab, setTab] = useState<TabId>('maganes')
  return (
    <div className='shell'>
      <nav className='tabs'>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={t.id === tab ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </nav>
      <main className='screen'>
        {tab === 'maganes'  && <div>Maganes screen</div>}
        {tab === 'register' && <div>Register screen</div>}
        {tab === 'rates'    && <div>Rates screen</div>}
        {tab === 'tools'    && <div>Tools screen</div>}
      </main>
    </div>
  )
}`,
          pitfalls: [
            '**Typing the tab as plain `string`.** You can set a non-existent tab. Fix: use a string-literal union `TabId`.',
            '**No active-tab styling.** Users cannot tell where they are. Fix: toggle an `active` class on the current tab.',
            '**Cramming all screens into App.tsx.** It grows unmanageable. Fix: extract each screen into its own component.',
            '**Missing `key` on the mapped tab buttons.** React warns. Fix: use `t.id` as the key.',
            '**English-only labels.** The committee reads Kannada first. Fix: show Kannada plus English on each tab.',
            '**Routing library overkill.** A four-tab desktop app rarely needs a router. Fix: a typed tab state is enough here.',
          ],
          tryIt:
            'Add a small badge to the Register tab showing the number of households loaded, and confirm clicking each tab swaps the screen while keeping the badge in sync.',
          takeaway:
            'A single shell with a typed `TabId` union and a render switch gives Upralli Seva clean four-tab navigation in Kannada and English.',
        },
        {
          id: 'm1-t12',
          title: 'TanStack Query setup with QueryClientProvider',
          explain:
            'TanStack Query manages fetching, caching and refreshing of data; you set it up once by wrapping the app in a QueryClientProvider.',
          analogy:
            'TanStack Query is the office’s diligent runner. When a screen needs this year’s totals, it does not fetch them itself; it asks the runner. The runner keeps a memory of recent answers (cache), avoids fetching the same thing twice, and re-checks when something changes. The **QueryClientProvider** is hiring that runner once at the front desk so every screen can call on them.',
          theory:
            '**TanStack Query** (React Query) handles server/async state — here, data coming over IPC from the database. Instead of scattering `useEffect` + `useState` loaders everywhere, components use `useQuery` and `useMutation`, and the library handles caching, deduping, loading/error states and invalidation.\n\nSetup is one-time: create a `QueryClient` and wrap the app tree in `<QueryClientProvider client={...}>`. After that, any descendant can call `useQuery({ queryKey, queryFn })`.\n\nFor Upralli Seva the `queryFn` calls a `window.api` method — e.g. `window.api.listMaganes()` — and the query key (`[\'maganes\']`) lets us invalidate and refetch after a mutation like saving a Magane. We only wire the provider in this module; the actual queries and mutations arrive with the data layer in later modules. Establishing the provider now means every screen we build is ready to consume cached, typed data.',
          whyItMatters:
            'Setting up the provider now is the gateway to a clean data layer. It replaces ad-hoc loading code with cached, deduped, automatically-refreshing queries across the whole register.',
          steps: [
            'Install `@tanstack/react-query`.',
            'Create a single `QueryClient` instance.',
            'Wrap `<App />` in `<QueryClientProvider client={client}>`.',
            'Mount it at the React root in `main.tsx`.',
            'Optionally set default options (stale time, retries).',
            'Confirm a sample `useQuery` runs (full queries come later).',
          ],
          code: `// src/renderer/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import './styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 }   // offline: little benefit in many retries
  }
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)

// Later, a screen will do:
//   const { data } = useQuery({ queryKey: ['maganes'], queryFn: () => window.api.listMaganes() })`,
          pitfalls: [
            '**Creating the QueryClient inside a component.** It is recreated on every render, wiping the cache. Fix: create it once at module scope.',
            '**Forgetting the provider.** `useQuery` then throws “no QueryClient set”. Fix: wrap the app in `QueryClientProvider`.',
            '**High retry counts offline.** A local DB error retried many times just delays the error. Fix: keep `retry` low for an offline app.',
            '**Unstable query keys.** Inconsistent keys break caching and invalidation. Fix: use stable, descriptive keys like `[\'maganes\']`.',
            '**Mixing manual `useEffect` fetching with Query.** Two sources of truth fight. Fix: standardise on TanStack Query for async data.',
            '**Mutating cache data directly.** It corrupts the cache. Fix: update via `setQueryData`/`invalidateQueries`, not by mutating returned objects.',
          ],
          tryIt:
            'Add a throwaway `useQuery({ queryKey: [\'ping\'], queryFn: () => window.api.ping() })` in App and render its `data`, confirming the provider is wired and the query runs once.',
          takeaway:
            'Wrapping the app in a single `QueryClientProvider` now sets up the cached, typed data layer every later screen will use.',
        },
        {
          id: 'm1-t13',
          title: 'Styling, theme, and the Kannada font',
          explain:
            'The look comes from plain CSS plus a small theme object built around the saffron brand colour, with Noto Sans Kannada bundled so Kannada always renders.',
          analogy:
            'The Upralli office has a house style: the saffron of temple cloth on the headers, clean white forms, and a script everyone in Kundapura reads. We are not importing a fancy fashion line (no heavy UI framework); we are choosing our own cloth colour (#E9730C saffron) and making sure the right Kannada typeface is always in the cupboard so no entry ever shows as boxes.',
          theory:
            'For a focused offline app, plain **CSS** plus CSS variables is enough — no heavy component library. We define a small **theme**: the saffron brand `#E9730C`, neutral surfaces, and spacing. Exposing these as CSS variables (and optionally a TS `theme` object) keeps colours consistent across screens.\n\nThe critical detail is **Kannada typography**. We bundle **Noto Sans Kannada** as a local font file (the app is offline — no Google Fonts CDN) and declare it via `@font-face`, then set it as the UI font. This guarantees ಉಪ್ರಳ್ಳಿ, Magane names, and household addresses render crisply rather than as tofu boxes.\n\nFor Upralli Seva, Kannada is first-class, so the font is not optional decoration — it is correctness. Bundling it locally also means the committee’s machine never depends on the internet to display the register.',
          whyItMatters:
            'A bundled Kannada font and a single saffron theme make the app look like it belongs to the temple committee and guarantee Kannada renders offline — both are non-negotiable for this audience.',
          steps: [
            'Add the Noto Sans Kannada font file under the renderer assets.',
            'Declare it with `@font-face` in your CSS.',
            'Define CSS variables for the saffron brand and surfaces.',
            'Set the font as the default UI font family.',
            'Optionally mirror the theme in a TS `theme` object.',
            'Verify Kannada text renders, not boxes.',
          ],
          code: `/* src/renderer/src/styles.css */
@font-face {
  font-family: 'Noto Sans Kannada';
  src: url('./assets/NotoSansKannada.woff2') format('woff2');  /* bundled, offline */
  font-display: swap;
}

:root {
  --brand: #E9730C;          /* saffron */
  --brand-ink: #ffffff;
  --surface: #ffffff;
  --ink: #1f2430;
}

body {
  margin: 0;
  font-family: 'Noto Sans Kannada', system-ui, sans-serif;
  color: var(--ink);
  background: #f6f7f9;
}

.tabs .tab.active { background: var(--brand); color: var(--brand-ink); }
.magane-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; }

/* Optional TS mirror, src/renderer/src/theme.ts:
   export const theme = { brand: '#E9730C', ink: '#1f2430' } as const */`,
          pitfalls: [
            '**Linking Google Fonts via CDN.** The offline app then shows boxes with no internet. Fix: bundle the font file locally and reference it.',
            '**Forgetting `@font-face`.** Kannada falls back to a system font that may lack glyphs. Fix: declare and apply the Noto font.',
            '**Hardcoding the saffron hex everywhere.** Inconsistent shades creep in. Fix: use a CSS variable `--brand`.',
            '**Pulling in a huge UI framework.** It bloats the offline installer for little gain. Fix: plain CSS plus variables is enough here.',
            '**Not testing Kannada early.** Glyph problems surface late. Fix: render sample Kannada (ಉಪ್ರಳ್ಳಿ) on day one.',
            '**Using a wrong font format.** Some formats are large or unsupported. Fix: prefer `woff2` for size and support.',
          ],
          tryIt:
            'Render the word ಉಪ್ರಳ್ಳಿ in the header before and after adding the `@font-face`, and notice the difference in glyph quality, confirming the bundled font is active.',
          takeaway:
            'Plain CSS, a saffron theme variable, and a locally bundled Noto Sans Kannada font give Upralli Seva a committee-appropriate, offline-safe look.',
        },
      ],
    },
    {
      id: 'm1-s4',
      title: 'The Electron security model',
      topics: [
        {
          id: 'm1-t14',
          title: 'contextIsolation ON, nodeIntegration OFF',
          explain:
            'These two BrowserWindow settings keep the renderer in a sealed browser sandbox with no direct Node or database access — the core of Electron security.',
          analogy:
            'It is the rule that visitors in the waiting hall never get the keys to the back room. **nodeIntegration OFF** means the visitor’s desk has no key ring (no Node APIs). **contextIsolation ON** means even the clerk’s tools left on the counter are kept in a separate locked tray the visitor cannot rummage through. The visitor can only ring the bell (IPC) and ask for what is allowed.',
          theory:
            'Electron renderers are web pages, and web pages can run untrusted-feeling content. Two settings lock them down:\n\n- **`nodeIntegration: false`** — the renderer gets no Node APIs (`require`, `fs`, `process`). It cannot touch the file system or load Prisma.\n- **`contextIsolation: true`** — the preload script and the page run in separate JavaScript contexts, so the page cannot reach into preload’s variables; only what is deliberately exposed via `contextBridge` crosses over.\n\nTogether they mean the renderer is just a browser tab that can ask main for things but cannot do privileged work itself. For Upralli Seva this is essential: **Prisma and the database live only in main**, and the renderer physically cannot import them. If a rendered Kannada field somehow contained malicious markup, it still could not reach the committee’s data, because the renderer has no path to the file system or the DB.',
          whyItMatters:
            'These settings are the difference between a safe offline app and one where any UI bug could touch the committee’s database files. They enforce the renderer-never-touches-the-DB rule at the engine level.',
          steps: [
            'In the BrowserWindow `webPreferences`, set `nodeIntegration: false`.',
            'Set `contextIsolation: true`.',
            'Keep all Node/Prisma/DB code in `src/main`.',
            'Provide capabilities to the renderer only through preload.',
            'Never re-enable nodeIntegration to “make an import work”.',
            'Confirm `require` is undefined in the renderer console.',
          ],
          code: `// src/main/index.ts (webPreferences) — the secure defaults
new BrowserWindow({
  webPreferences: {
    preload: join(__dirname, '../preload/index.js'),
    contextIsolation: true,    // page and preload kept in separate contexts
    nodeIntegration: false,    // no Node APIs (require/fs/process) in the page
    sandbox: false             // preload still needs limited Node; see next topic
  }
})

// Proof in the renderer devtools console:
//   typeof require            -> 'undefined'   (no Node)
//   typeof window.api.ping    -> 'function'    (only what preload exposed)`,
          pitfalls: [
            '**Enabling nodeIntegration to fix an import.** It blows the whole security model open. Fix: route the need through preload + IPC instead.',
            '**Turning contextIsolation off.** The page could then tamper with preload internals. Fix: always keep it on.',
            '**Trying to import Prisma in the renderer.** It cannot and must not. Fix: keep Prisma in main and call it over IPC.',
            '**Assuming offline means safe.** Malicious markup in a name field is still a risk. Fix: keep isolation on regardless.',
            '**Putting secrets in the renderer bundle.** Anything there is readable. Fix: keep sensitive logic in main.',
            '**Forgetting these are per-window.** A second window needs the same settings. Fix: apply the secure `webPreferences` to every BrowserWindow.',
          ],
          tryIt:
            'Open the renderer DevTools console and type `require` — confirm it is `undefined`. Then type `window.api` and confirm only your exposed methods appear, proving the sandbox holds.',
          takeaway:
            'contextIsolation on and nodeIntegration off seal the renderer so it can only reach the committee’s data through the preload bridge.',
        },
        {
          id: 'm1-t15',
          title: 'contextBridge: a small typed surface, not raw ipcRenderer',
          explain:
            'You expose a few named, typed functions through contextBridge rather than handing the renderer the raw ipcRenderer object.',
          analogy:
            'Instead of giving the visitor a master intercom that can page any room in the building (raw `ipcRenderer`), the office installs a panel with four labelled buttons: “save Magane,” “list Maganes,” “year totals,” “ping.” The visitor can only press those. That labelled panel is `contextBridge.exposeInMainWorld(\'api\', ...)`.',
          theory:
            'It is tempting to expose `ipcRenderer` directly so the renderer can `invoke` any channel. That is a security and design mistake: it widens the surface to *every* channel and leaks an Electron primitive into the UI.\n\nThe correct pattern is to expose a **small, named, typed object**. Each method wraps exactly one IPC call with a precise signature drawn from `src/shared`. The renderer sees `window.api.saveMagane(input)` returning a typed `Promise<Magane>` — and literally nothing else.\n\nFor Upralli Seva this keeps the attack surface tiny and the contract explicit: a reviewer reads the preload and sees the complete list of things the UI can ask the backend to do. The main process, in turn, registers a matching `ipcMain.handle` per channel. The pairing of a typed bridge method and a handler is the entire, auditable boundary of the app.',
          whyItMatters:
            'A small typed bridge is both safer and clearer than raw ipcRenderer: it minimises what the renderer can trigger and makes the full backend surface readable in one file.',
          steps: [
            'Define each api method as a thin typed wrapper over one channel.',
            'Group them into a single `api` object.',
            'Type the object with a shared `UpralliApi` interface.',
            'Expose it via `contextBridge.exposeInMainWorld(\'api\', api)`.',
            'Never expose `ipcRenderer` itself.',
            'Add a matching `ipcMain.handle` in main per channel.',
          ],
          code: `// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import type { UpralliApi } from '@shared/types'

const api: UpralliApi = {
  ping: () => ipcRenderer.invoke('ping'),
  listMaganes: () => ipcRenderer.invoke('maganes:list'),
  saveMagane: (input) => ipcRenderer.invoke('maganes:save', input)
}

contextBridge.exposeInMainWorld('api', api)   // a labelled panel, not a master intercom

// src/main/index.ts — the matching handlers (Prisma calls fleshed out later)
import { ipcMain } from 'electron'
ipcMain.handle('ping', () => 'pong from main')
ipcMain.handle('maganes:list', async () => { /* return prisma.magane.findMany() */ return [] })
ipcMain.handle('maganes:save', async (_e, input) => { /* prisma.magane.create */ return { id: 'x', ...input } })`,
          pitfalls: [
            '**Exposing raw `ipcRenderer`.** The renderer can then call any channel, named or not. Fix: expose only wrapper functions.',
            '**Channel name typos between preload and main.** The call silently hangs. Fix: centralise channel names as shared constants.',
            '**Untyped wrappers.** The renderer loses safety and autocomplete. Fix: type the api with `UpralliApi`.',
            '**Returning non-cloneable objects over IPC.** Class instances/functions fail structured clone. Fix: return plain serialisable data.',
            '**Forgetting a matching `ipcMain.handle`.** `invoke` rejects with “no handler”. Fix: pair every bridge method with a handler.',
            '**Doing work in the bridge.** Logic belongs in main. Fix: keep preload methods one line each.',
          ],
          tryIt:
            'Add a `getYearTotals(yearId)` method to both the bridge and a stub `ipcMain.handle`, returning a fake `YearTotals`, and call it from the renderer to see the typed round trip end to end.',
          takeaway:
            'Expose a small typed `api` object via contextBridge, never raw ipcRenderer, and pair each method with one `ipcMain.handle`.',
        },
        {
          id: 'm1-t16',
          title: 'Declaring window.api types and loading only local content',
          explain:
            'A preload index.d.ts declares window.api so the renderer gets full autocomplete, and the app is configured to load only local offline content.',
          analogy:
            'Two finishing touches. First, the office pins up a clear sign listing exactly which counter services exist and what each returns, so visitors never guess (`index.d.ts` describing `window.api`). Second, the office only ever reads from its own bound register and never accepts notices slipped under the door from outside (no remote content) — fitting for a temple committee with no internet.',
          theory:
            'After `contextBridge` exposes `window.api` at runtime, TypeScript in the renderer still does not *know* its shape. You fix this with a declaration file, **`src/preload/index.d.ts`**, that augments the global `Window` interface with an `api: UpralliApi`. Now every renderer file gets autocomplete and type-checking on `window.api.*`.\n\nThe second concern is **what the window may load**. For a secure offline app you load only local content: the dev-server URL in development and the bundled `index.html` in production, never arbitrary remote URLs. You can also harden navigation (block `window.open`/external navigation) and rely on the sandbox so the renderer cannot reach the network or the disk.\n\nFor Upralli Seva, declaring `window.api` makes building screens pleasant and safe, while loading only local content matches the reality that the committee’s machine has no internet and the entire register is on-disk. Together they complete the security story started by contextIsolation and the typed bridge.',
          whyItMatters:
            'The declaration file turns the typed bridge into great editor support across the renderer, and loading only local content ensures the offline app never depends on or exposes itself to the network.',
          steps: [
            'Create `src/preload/index.d.ts`.',
            'Augment the global `Window` with `api: UpralliApi`.',
            'Include the d.ts in `tsconfig.web.json`.',
            'Confirm `window.api.` autocompletes in the renderer.',
            'Load only the dev URL or bundled file — never remote URLs.',
            'Block external navigation / new windows for safety.',
          ],
          code: `// src/preload/index.d.ts — gives the renderer types for window.api
import type { UpralliApi } from '@shared/types'

declare global {
  interface Window {
    api: UpralliApi
  }
}

export {}   // make this a module so 'declare global' is valid

// src/main/index.ts — load ONLY local content, block external navigation
import { shell } from 'electron'

mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  // Never open arbitrary windows; route real external links to the OS browser if ever needed.
  shell.openExternal(url)
  return { action: 'deny' }
})

// (Renderer is loaded via loadURL(devUrl) or loadFile(localIndexHtml) — no remote URLs.)`,
          pitfalls: [
            '**Skipping `export {}` in the d.ts.** `declare global` is then invalid. Fix: add an empty export to make it a module.',
            '**Not including the d.ts in the web tsconfig.** The renderer still lacks `window.api` types. Fix: add it to `tsconfig.web.json` include.',
            '**Typing `window.api` as `any`.** You lose all the safety you built. Fix: reference the shared `UpralliApi`.',
            '**Loading remote URLs.** It breaks offline guarantees and adds risk. Fix: load only the dev URL or the bundled file.',
            '**Allowing uncontrolled `window.open`.** New windows can load anything. Fix: deny via `setWindowOpenHandler`.',
            '**Forgetting to restart after editing the d.ts.** Editors may cache stale types. Fix: reload the TS server / restart dev.',
          ],
          tryIt:
            'After adding `index.d.ts`, type `window.api.` in a renderer component and confirm `ping`, `listMaganes`, `saveMagane` autocomplete with correct return types. Then attempt a remote `loadURL` and revert it, noting why local-only is safer.',
          takeaway:
            'A preload `index.d.ts` gives the renderer typed `window.api`, and loading only local content keeps the offline app safe and network-free.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm1-p1',
      type: 'Project',
      title: 'Upralli app shell',
      domain: 'Offline temple-committee desktop app (Upralli, Kundapura)',
      duration: '4-5 hours',
      description:
        'Scaffold an electron-vite + React 18 + TypeScript app that opens a window and renders a four-tab shell (Maganes / ದಾಖಲೆ Register / Rates / Tools) styled with the saffron theme and a bundled Noto Sans Kannada font, with TanStack Query’s QueryClientProvider wired at the root.',
      tools: ['electron-vite', 'React 18', 'TypeScript', '@tanstack/react-query', 'Noto Sans Kannada', 'plain CSS'],
      blueprint: {
        overview:
          'You will build the visible foundation of Upralli Seva: a real Electron window, a typed tabbed React shell, the saffron committee theme, and the Kannada font bundled offline. No database yet — this is the spine every later module hangs screens onto. The QueryClientProvider is mounted now so the data layer slots in cleanly later.',
        functionalRequirements: [
          'Launching the app opens a single 1280×820 window titled ಉಪ್ರಳ್ಳಿ ಸೇವೆ.',
          'The shell shows four tabs — Maganes, ದಾಖಲೆ/Register, Rates, Tools — each with Kannada and English labels.',
          'Clicking a tab swaps the visible screen and highlights the active tab in saffron.',
          'All Kannada text renders crisply using a locally bundled Noto Sans Kannada font (no internet).',
          'The whole app is wrapped in a QueryClientProvider ready for later data queries.',
        ],
        technicalImplementation: [
          'Scaffold with the React+TS electron-vite template; keep `src/main`, `src/preload`, `src/renderer`, `src/shared`.',
          'In main, create the BrowserWindow with secure webPreferences and load dev URL vs bundled file correctly.',
          'In the renderer, build `App.tsx` with a `TabId` union, typed `useState`, and a render switch over four screen components.',
          'Add `styles.css` with an `@font-face` for the bundled Noto Sans Kannada and CSS variables for the saffron `#E9730C` theme.',
          'In `main.tsx`, create one `QueryClient` and wrap `<App />` in `<QueryClientProvider>`; run `npm run typecheck` clean.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold and window',
            outcome: 'A runnable electron-vite React+TS app that opens the titled Upralli window.',
            prompt:
              'Scaffold an electron-vite project named upralli-seva with the React + TypeScript template. In src/main/index.ts create a 1280x820 BrowserWindow titled in Kannada (ಉಪ್ರಳ್ಳಿ ಸೇವೆ) with contextIsolation true and nodeIntegration false, loading the dev-server URL in development and the bundled index.html in production. Set package.json main to ./out/main/index.js. Show me the main index.ts and the package.json scripts.',
          },
          {
            step: 2,
            label: 'Tabbed shell and theme',
            outcome: 'A four-tab React shell with active-tab saffron styling and Kannada labels.',
            prompt:
              'In the renderer, write App.tsx with a TabId union type of \'maganes\' | \'register\' | \'rates\' | \'tools\', typed useState for the active tab, a nav bar of buttons showing Kannada and English labels, and a render switch rendering a placeholder screen per tab. Add styles.css with CSS variables for the saffron brand #E9730C and an active-tab style. Keep each placeholder screen in its own component file.',
          },
          {
            step: 3,
            label: 'Kannada font and Query provider',
            outcome: 'Crisp offline Kannada rendering and a QueryClientProvider at the root.',
            prompt:
              'Add a bundled Noto Sans Kannada woff2 under renderer assets and declare it with @font-face in styles.css, setting it as the default font. In main.tsx, create a single QueryClient with a low retry count and wrap <App /> in <QueryClientProvider>. Confirm Kannada text renders and the app type-checks with npm run typecheck.',
          },
        ],
      },
    },
    {
      id: 'm1-p2',
      type: 'Mini Project',
      title: 'Typed ping bridge',
      domain: 'Secure IPC round-trip for the Upralli desktop app',
      duration: '2-3 hours',
      description:
        'Prove the secure typed boundary end to end: a preload `contextBridge` exposing `window.api.ping()` typed via `src/shared/types.ts`, an `ipcMain.handle(\'ping\')` in main returning a reply, and a React button in the renderer that shows the response — demonstrating the renderer can talk to main only through the bridge.',
      tools: ['Electron contextBridge', 'ipcMain / ipcRenderer', 'TypeScript', 'src/shared/types.ts', 'React 18'],
      blueprint: {
        overview:
          'A tiny but complete vertical slice of the Upralli security model: renderer → preload bridge → IPC → main handler → back. It establishes the pattern every real feature (save Magane, get totals) will follow, and confirms contextIsolation/nodeIntegration are correctly configured because the renderer reaches main ONLY via window.api.',
        functionalRequirements: [
          'The renderer has a button labelled “Ping main”.',
          'Clicking it calls `window.api.ping()` and displays the returned string.',
          'The reply originates from an `ipcMain.handle(\'ping\')` in the main process.',
          'The renderer has no direct Node or ipcRenderer access — only `window.api`.',
          'The ping method is typed via a shared `UpralliApi` interface and shows autocomplete.',
        ],
        technicalImplementation: [
          'Define `UpralliApi` with `ping(): Promise<string>` in `src/shared/types.ts`.',
          'In `src/preload/index.ts`, expose `{ ping: () => ipcRenderer.invoke(\'ping\') }` via `contextBridge.exposeInMainWorld(\'api\', api)`.',
          'Add `src/preload/index.d.ts` augmenting `Window` with `api: UpralliApi`.',
          'In `src/main/index.ts`, register `ipcMain.handle(\'ping\', () => \'pong from main\')`.',
          'In a renderer component, wire a button to `await window.api.ping()` and render the reply; verify `require` is undefined in the console.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Shared type and bridge',
            outcome: 'A typed window.api.ping exposed through contextBridge.',
            prompt:
              'In src/shared/types.ts define an UpralliApi interface with ping(): Promise<string>. In src/preload/index.ts import it, build an api object { ping: () => ipcRenderer.invoke(\'ping\') } typed as UpralliApi, and expose it with contextBridge.exposeInMainWorld(\'api\', api). Add src/preload/index.d.ts augmenting the global Window with api: UpralliApi and an empty export. Show all three files.',
          },
          {
            step: 2,
            label: 'Main handler',
            outcome: 'An ipcMain handler that answers the ping channel.',
            prompt:
              'In src/main/index.ts register ipcMain.handle(\'ping\', () => \'pong from main\') after app.whenReady. Explain why this handler lives in main and not in preload, and why the return value must be plain serialisable data for IPC.',
          },
          {
            step: 3,
            label: 'Renderer button',
            outcome: 'A working button showing the round-trip reply, proving the sandbox.',
            prompt:
              'In a React renderer component, add a button “Ping main” that calls await window.api.ping(), stores the result in typed useState, and renders it. Then tell me how to verify in DevTools that require is undefined and window.api exposes only ping — confirming contextIsolation and nodeIntegration are set correctly.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm1-q1',
      q: 'What does electron-vite bundle and hot-reload in an Electron app?',
      options: [
        'Only the renderer, with no main or preload build',
        'Main, preload and renderer from one config, with HMR for the renderer',
        'The PostgreSQL database and the renderer together',
        'Just the production installer, never the dev server',
      ],
      answer: 1,
    },
    {
      id: 'm1-q2',
      q: 'Why are there two tsconfigs (tsconfig.node.json and tsconfig.web.json)?',
      options: [
        'To compile the app twice as fast on multi-core machines',
        'Because main/preload run in Node while the renderer runs in a browser, needing different libs',
        'One is for development and the other only for production',
        'TypeScript requires exactly two configs in every project',
      ],
      answer: 1,
    },
    {
      id: 'm1-q3',
      q: 'In production, how should the main process load the renderer?',
      options: [
        'With loadURL pointing at http://localhost:5173',
        'By fetching the page from the temple’s website',
        'With loadFile pointing at the bundled out/renderer/index.html',
        'It does not load anything; the renderer self-starts',
      ],
      answer: 2,
    },
    {
      id: 'm1-q4',
      q: 'Where must Prisma and database access live in the Upralli Seva app?',
      options: [
        'In the renderer, so React can query directly',
        'In the preload script alongside the bridge',
        'In src/shared so all processes import it',
        'Only in the main process; the renderer reaches it via window.api over IPC',
      ],
      answer: 3,
    },
    {
      id: 'm1-q5',
      q: 'What is the recommended way to expose functionality to the renderer?',
      options: [
        'Expose the raw ipcRenderer object so any channel can be called',
        'Expose a small, named, typed api object via contextBridge.exposeInMainWorld',
        'Enable nodeIntegration so the renderer can require electron',
        'Attach functions directly to window in the renderer',
      ],
      answer: 1,
    },
    {
      id: 'm1-q6',
      q: 'Why is the Noto Sans Kannada font bundled locally rather than loaded from a CDN?',
      options: [
        'CDNs are slower than local files in every case',
        'Because the app is fully offline, so a CDN font would fail and show boxes',
        'Google Fonts does not include Kannada',
        'Bundling makes the installer smaller',
      ],
      answer: 1,
    },
  ],
};
