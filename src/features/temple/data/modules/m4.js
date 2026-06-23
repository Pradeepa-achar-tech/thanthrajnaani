// Module 4 — IPC & the Secure Data Layer (Repository Pattern) for "Maranakatte Seva".
// Offline desktop app: Electron + React + Vite + local PostgreSQL (pg). Teaches the
// bridge between the React UI and the local DB: Electron IPC fundamentals, a clean
// repository layer in the main process, transactions for receipts, and React hooks
// that call window.api. Consumed by the React course player (see components/TopicItem.jsx).

export const m4 = {
  id: 'm4',
  title: 'IPC & the Secure Data Layer (Repository Pattern)',
  hours: 9,
  color: 'from-orange-500/20 to-orange-700/10',
  accent: 'orange',
  description:
    'Build the bridge between the React counter UI and the local Postgres database at Shri Brahmalingeshwara Temple, Maranakatte. Learn Electron IPC (ipcMain.handle / ipcRenderer.invoke), expose a small safe window.api through the preload contextBridge, organise SQL into clean repository modules per entity, save a receipt and its items inside one transaction, and call it all from React with a hook that tracks loading, empty, and error states.',
  sections: [
    {
      id: 'm4-s1',
      title: 'IPC fundamentals',
      topics: [
        {
          id: 'm4-t1',
          title: 'Why the renderer cannot touch Postgres directly',
          explain:
            'The React window runs in a locked-down, browser-like sandbox with no Node and no database driver. It must ASK the main process to do data work.',
          analogy:
            'Picture the **Maranakatte counter**. The devotee stands at the window and asks for a Rangapooje receipt — but the devotee never walks into the back office to open the cash ledger themselves. They speak through the **grille** to the clerk; the clerk does the writing and hands back the receipt. The React renderer is the devotee at the grille; the Electron **main process** is the clerk with the keys to the Postgres ledger.',
          theory:
            "An Electron app runs as two kinds of process. The **main process** is full Node.js — it can open files, talk to the `pg` Pool, read `app.getPath('userData')`. The **renderer process** is essentially a Chromium browser tab that shows your React app. For safety we run the renderer with **`nodeIntegration: false`** and **`contextIsolation: true`**, so the page has no `require`, no `fs`, and no database driver at all.\n\nThat separation is deliberate. The renderer loads HTML, CSS, and (later) maybe content you do not fully control; giving a web page raw access to the local Postgres ledger would be like handing the temple cash box to anyone at the window. So the renderer cannot run a single line of SQL itself.\n\nThe only way across the wall is **IPC** — inter-process communication. The renderer sends a small, named message (\"please list today's sevas\"); the main process receives it, runs the SQL with `pg`, and sends back a plain serializable answer (an array of seva objects). Nothing but JSON-safe data crosses the boundary.",
          whyItMatters:
            'This split is the single most important security idea in the whole app. All of Module 4 — the preload, the repositories, the transactions — exists to make that grille between renderer and main both **safe** and **convenient**. Understand the why here and every later piece falls into place.',
          steps: [
            'Open `electron/main.js` and find your `new BrowserWindow(...)` call.',
            "Confirm `webPreferences` has `nodeIntegration: false` and `contextIsolation: true`.",
            "Confirm a `preload` script path is set — that is the only bridge the renderer gets.",
            'In the renderer, try `window.require` in DevTools and watch it be `undefined` — proof the sandbox holds.',
            "Write down the one rule: renderer ASKS, main DOES the database work.",
            'Sketch the round trip on paper: button click → invoke → handle → pg query → result back.',
          ],
          code: `// electron/main.js — a locked-down window. Renderer gets NO Node, NO pg.
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // the ONLY bridge
      nodeIntegration: false,   // renderer cannot require('pg')
      contextIsolation: true,   // page + preload kept in separate worlds
    },
  });
  win.loadURL('http://localhost:5173'); // Vite dev server
}

app.whenReady().then(createWindow);`,
          pitfalls: [
            "Turning on `nodeIntegration: true` to 'just make pg work in React' — that breaks the entire security model and is the classic Electron mistake.",
            'Setting `contextIsolation: false` to share variables — it lets page scripts reach into your preload world.',
            'Trying to `import pg` inside a React component — Vite may not even error until runtime, then it crashes because there is no Node.',
            'Forgetting the `preload` path, so `window.api` is `undefined` and every data call throws.',
            'Assuming the renderer can read `app.getPath` — only the main process knows the userData folder.',
            'Putting database credentials in renderer code where any page script could read them.',
          ],
          tryIt:
            'Open DevTools in the running app and type `typeof require` and `typeof window.api`. Note that `require` is undefined (good — the sandbox holds) and plan what `window.api` should expose.',
          takeaway:
            'The renderer is a sandboxed browser tab with no database access; it must ASK the main process over IPC, and main does all the real data work.',
        },
        {
          id: 'm4-t2',
          title: 'ipcMain.handle + ipcRenderer.invoke — the request/response workhorse',
          explain:
            'The main process registers a named handler; the renderer invokes that name and gets back a Promise with the result. This pair powers almost every data call.',
          analogy:
            'It is the **token system** at the counter. The devotee hands a slip with a request through the grille (`invoke`), the clerk has a labelled pigeonhole for each kind of request (`handle`), does the work, and slides the answer back. You wait for your answer like waiting for your token to be called — that waiting is the **Promise**.',
          theory:
            "**`ipcMain.handle(channel, listener)`** registers a handler in the main process for a named **channel** like `'sevas:list'`. The listener does the work — usually an `async` function that runs a `pg` query — and **returns** a value.\n\nIn the renderer (via preload, which we cover next), **`ipcRenderer.invoke(channel, ...args)`** sends a message on that channel and returns a **Promise** that resolves to whatever the handler returned. So a call looks like `const sevas = await ipcRenderer.invoke('sevas:list')`. Arguments you pass are sent along and given to the handler.\n\nThis is **request/response**: one message out, one answer back, modelled as `async`/`await`. If the handler throws, the Promise on the renderer side **rejects**, so you can wrap calls in `try/catch`. Whatever you return must be **serializable** — plain objects, arrays, strings, numbers — because it is cloned across the process boundary; you cannot return a live `pg` client or a function.",
          whyItMatters:
            'Listing sevas, creating a receipt, looking up a devotee — every one of these is a question that wants an answer. `handle`/`invoke` is the tool for all of them, and because it returns a Promise it drops straight into React hooks with loading and error states.',
          steps: [
            "In `main.js` (or an `ipc.js`), import `ipcMain` from electron.",
            "Register `ipcMain.handle('sevas:list', async () => { /* query */ return rows; })`.",
            'Make the handler `async` so you can `await` the `pg` query inside it.',
            'Return only serializable data — arrays of plain objects.',
            "From the renderer side call `await window.api.sevas.list()` (wired through preload).",
            'Wrap the call in `try/catch` so a rejected Promise becomes a friendly error.',
          ],
          code: `// electron/ipc.js — register a request/response channel in MAIN.
const { ipcMain } = require('electron');
const { sevaRepo } = require('./repos/sevaRepo');

function registerIpc() {
  // channel name 'sevas:list' — returns a Promise on the renderer side
  ipcMain.handle('sevas:list', async () => {
    const sevas = await sevaRepo.list(); // real pg query, returns plain objects
    return sevas;                        // must be serializable
  });
}

module.exports = { registerIpc };`,
          pitfalls: [
            "Forgetting to call your `registerIpc()` after `app.whenReady()` — the channel never exists and invoke hangs or errors with 'No handler registered'.",
            'Using `ipcMain.on` when you actually want a returned value — `on` cannot reply directly; use `handle`.',
            'Returning a live `pg` client, a Date inside a class, or a function — non-serializable values throw a clone error.',
            "Registering the same channel name twice — the second `handle` throws 'Attempted to register a second handler'.",
            'Forgetting `async`/`await` inside the handler, so you return a Promise object instead of the resolved rows.',
            'Swallowing handler errors silently, so the renderer Promise hangs forever with no feedback.',
          ],
          tryIt:
            "Register a throwaway `ipcMain.handle('ping', () => 'pong from main')` and call `await window.api.ping()` from a button. Seeing 'pong' proves the round trip works before you add any SQL.",
          takeaway:
            "`ipcMain.handle` + `ipcRenderer.invoke` is the request/response pair: name a channel, await a Promise, get serializable data back — the workhorse for every read and write.",
        },
        {
          id: 'm4-t3',
          title: 'ipcMain.on + ipcRenderer.send — fire-and-forget events',
          explain:
            'Sometimes the renderer wants to TELL main something and does not need an answer. `send`/`on` is a one-way message with no reply.',
          analogy:
            'It is dropping a note in the **suggestion box** by the counter, versus asking the clerk a question. You post the note and walk on — no waiting, no answer. Logging that the staff opened the receipts screen, or asking main to flash the cash drawer, fits the suggestion box.',
          theory:
            "**`ipcRenderer.send(channel, ...args)`** posts a message and **returns immediately** — there is no Promise, no reply. The main process listens with **`ipcMain.on(channel, (event, ...args) => { ... })`**. This is **fire-and-forget**: a one-directional event.\n\nUse it when there is genuinely nothing to wait for: a log line, a 'user switched tabs' analytics ping, a request to print or to write to a log file where the UI does not block on the result. If you find yourself wanting the result back, you wanted `handle`/`invoke` instead.\n\nMain can also push **the other way** — `event.sender.send('channel', data)` or `win.webContents.send('channel', data)` — to notify the renderer of something it did not ask for, like 'a backup finished'. The renderer listens with `ipcRenderer.on`. For the counter app, most data flows are request/response, so you will reach for `send`/`on` far less than `handle`/`invoke`.",
          whyItMatters:
            'Knowing the difference stops you from forcing a reply where none is needed, and from using fire-and-forget where you actually need the saved receipt token back. For the Maranakatte counter, almost everything is a question — but log events and drawer pulses are real uses of `send`.',
          steps: [
            "Decide: do you need an answer? If yes, use `handle`/`invoke`, not `send`.",
            "In main, listen with `ipcMain.on('log:event', (event, payload) => { ... })`.",
            'From the renderer, fire `window.api.log(payload)` which calls `ipcRenderer.send`.',
            'Note there is no `await` — the call returns at once.',
            'For main-to-renderer pushes, use `win.webContents.send(channel, data)`.',
            'In the renderer, subscribe with `ipcRenderer.on(channel, handler)` (wrapped in preload).',
          ],
          code: `// MAIN: a one-way listener for non-critical events.
const { ipcMain } = require('electron');

ipcMain.on('log:event', (event, payload) => {
  // fire-and-forget — no return value goes back to the renderer
  console.log('[counter]', payload.action, 'at', new Date().toISOString());
});

// Later, MAIN can push to the renderer when something finishes:
// win.webContents.send('backup:done', { file: 'seva-2026-06-23.dump' });`,
          pitfalls: [
            "Expecting a return value from `send` — there isn't one; the call resolves to `undefined`.",
            "Using `send` for a receipt save and then having no way to get the token number back — that needed `invoke`.",
            'Forgetting that `ipcMain.on` handlers receive `event` as the FIRST argument before your payload.',
            'Leaking `ipcRenderer.on` listeners in React without removing them on unmount, causing duplicate handlers.',
            'Pushing non-serializable data from main to renderer with `webContents.send`.',
            'Using fire-and-forget for anything where a silent failure (a lost log, a missed print) would confuse staff.',
          ],
          tryIt:
            "Wire a 'staff opened receipts screen' log event with `send`/`on` and watch it print in the main-process terminal — note you never `await` it.",
          takeaway:
            '`send`/`on` is one-way fire-and-forget with no reply; reach for it only when you truly do not need an answer — otherwise use `handle`/`invoke`.',
        },
        {
          id: 'm4-t4',
          title: 'The preload contextBridge — never expose ipcRenderer raw',
          explain:
            'The preload script runs in a privileged spot and uses contextBridge to hand the page a small, named API — not the raw IPC object.',
          analogy:
            'The preload is the **counter clerk who decides what the grille lets through**. You do not hand the devotee the whole back-office keyring (`ipcRenderer`); you cut a few specific labelled keys — "list sevas", "create receipt" — and pass only those. The grille (`contextBridge`) makes sure the page can use those keys but can never reach behind for the rest.',
          theory:
            "The **preload script** is special: it runs **before** your page scripts, in a context that can use Node-style `require('electron')`, yet it shares the same window as the page. With **`contextIsolation: true`**, the preload and the page live in separate JavaScript worlds, so a page script cannot simply read the preload's variables.\n\nTo deliberately cross that gap you use **`contextBridge.exposeInMainWorld(name, api)`**. It copies a **frozen, safe** object onto `window` in the page world. You expose a small **typed surface** — functions that internally call `ipcRenderer.invoke('channel', ...)` — and nothing else.\n\nThe golden rule: **never expose `ipcRenderer` itself**. If you wrote `exposeInMainWorld('ipc', ipcRenderer)`, any script on the page could invoke any channel, including ones you never meant to be public, or attach unlimited listeners. Instead expose `window.api.sevas.list()` — a tiny, allow-listed set of methods. The page can call exactly those and nothing more, which keeps the security boundary real even though the bridge is convenient.",
          whyItMatters:
            "This is where 'secure' and 'usable' meet. A well-designed preload gives React a clean `window.api` to call while still guaranteeing the page can never run arbitrary IPC. Get this wrong and you have either an unusable app or an insecure one.",
          steps: [
            "Create `electron/preload.js` and `require('electron')` for `contextBridge` and `ipcRenderer`.",
            "Build a plain object `api` whose methods call `ipcRenderer.invoke('channel', ...)`.",
            "Group methods by entity: `api.sevas.list()`, `api.receipts.create(data)`.",
            "Call `contextBridge.exposeInMainWorld('api', api)` once.",
            "Never put `ipcRenderer` directly on the bridge — only your wrapper functions.",
            'In `main.js` confirm `webPreferences.preload` points at this file.',
          ],
          code: `// electron/preload.js — expose a SMALL, named surface, not raw ipcRenderer.
const { contextBridge, ipcRenderer } = require('electron');

const api = {
  sevas: {
    list:   ()      => ipcRenderer.invoke('sevas:list'),
    create: (data)  => ipcRenderer.invoke('sevas:create', data),
  },
  receipts: {
    create: (data)  => ipcRenderer.invoke('receipts:create', data),
  },
};

// page can now call window.api.sevas.list() — and ONLY these methods
contextBridge.exposeInMainWorld('api', api);`,
          pitfalls: [
            "Exposing `ipcRenderer` directly (`exposeInMainWorld('ipc', ipcRenderer)`) — this defeats the entire sandbox.",
            'Trying to expose a function that returns a non-clonable value across the bridge.',
            "Forgetting that with `contextIsolation: true` the page CANNOT see preload variables unless bridged.",
            'Putting business logic or SQL in the preload — keep it a thin pass-through to channels.',
            "Mismatched channel strings between preload and `ipcMain.handle` — `'sevas:list'` vs `'seva:list'` fails silently.",
            'Editing preload but not restarting Electron, so the old bridge is still loaded.',
          ],
          tryIt:
            "Add a single method `api.ping = () => ipcRenderer.invoke('ping')` to the bridge, then confirm `window.api.ping` exists in DevTools but `window.ipcRenderer` does not.",
          takeaway:
            'The preload uses `contextBridge.exposeInMainWorld` to give the page a small typed `window.api`; never expose raw `ipcRenderer` — only allow-listed wrapper functions.',
        },
        {
          id: 'm4-t5',
          title: 'Designing the window.api surface',
          explain:
            'Treat window.api like a public menu: group methods by entity, name them by intent, and keep the list short and predictable.',
          analogy:
            'It is the **seva rate board** at the counter — a short, clear list of exactly what you can ask for: Mangalarathi, Hannikaayi, Rangapooje, an Annadhana booking. Staff read the board and know their options at a glance. A good `window.api` is that board: `api.sevas.list()`, `api.receipts.create(...)`, `api.bookings.create(...)` — short, grouped, obvious.',
          theory:
            "The shape of `window.api` is the contract your whole React app depends on, so design it on purpose. Group by **entity**: `api.sevas`, `api.receipts`, `api.devotees`, `api.bookings`. Inside each, use **verbs of intent**: `list`, `getById`, `create`, `update`. This mirrors the repositories you will build in the next section, so each `window.api` method maps to one `ipcMain.handle` channel which maps to one repository method.\n\nKeep arguments **simple and serializable** — pass a single plain object for creates (`api.receipts.create({ items, total, paymentMode })`) so adding a field later does not change the function signature. Keep returns plain too: arrays of devotee objects, a new receipt with its token number.\n\nName channels with a consistent scheme like `'<entity>:<action>'` (`'receipts:create'`). When `window.api`, the channels, and the repository methods all line up one-to-one, a new developer can trace any counter action from button to SQL by following one name.",
          whyItMatters:
            'Every React component reads or writes through this surface. A clean, entity-grouped API keeps the UI code readable, makes new features (a new seva type, a new report) a predictable copy-paste, and means the names you choose now become the vocabulary of the whole codebase.',
          steps: [
            'List the counter actions: list sevas, create receipt, search devotee, create booking.',
            'Group them by entity into `api.sevas`, `api.receipts`, `api.devotees`, `api.bookings`.',
            "Pick verbs: `list`, `getById`, `create`, `update`, `search`.",
            "Decide channel names: `'<entity>:<action>'`.",
            'Use a single object argument for creates so the signature is stable.',
            'Write the surface in preload first; implement channels and repos to match.',
          ],
          code: `// preload.js — a planned, entity-grouped surface mirroring the repos.
const api = {
  sevas: {
    list:   ()     => ipcRenderer.invoke('sevas:list'),
    create: (data) => ipcRenderer.invoke('sevas:create', data),
  },
  devotees: {
    search: (q)    => ipcRenderer.invoke('devotees:search', q),
    create: (data) => ipcRenderer.invoke('devotees:create', data),
  },
  receipts: {
    // one plain object arg keeps the signature stable as fields grow
    create: (data) => ipcRenderer.invoke('receipts:create', data),
  },
  bookings: {
    create: (data) => ipcRenderer.invoke('bookings:create', data),
  },
};`,
          pitfalls: [
            'A flat dumping ground (`api.listSevas`, `api.makeReceipt`, `api.findPerson`) with no grouping — it gets unreadable fast.',
            'Passing many positional arguments to `create` so every new field breaks the call sites.',
            'Inconsistent channel naming (`getSevas`, `seva-list`, `sevas:list`) that nobody can predict.',
            'Returning database rows with snake_case keys, leaking the schema shape into React.',
            "Adding methods to `window.api` that have no matching `ipcMain.handle` — they fail only at runtime.",
            'Designing the surface around how the UI looks today instead of around the entities, so it rots when the UI changes.',
          ],
          tryIt:
            'Write the full `window.api` object in preload as a plan — even with channels not yet implemented — and review it like a menu: is every counter action there, grouped, and clearly named?',
          takeaway:
            'Design `window.api` like a rate board: grouped by entity, named by intent, single object args, one-to-one with channels and repositories.',
        },
      ],
    },
    {
      id: 'm4-s2',
      title: 'The repository pattern in the main process',
      topics: [
        {
          id: 'm4-t6',
          title: 'One repository module per entity, wrapping the pg Pool',
          explain:
            'A repository is a small module that owns all SQL for one entity, exposing plain methods like list() and create() over the shared pg Pool.',
          analogy:
            'It is the **dedicated ledger book** for each kind of record at the temple office: one book for sevas, one for receipts, one for bookings. Only the seva ledger knows how seva rows are written and read. Nobody scatters seva SQL across the office — they go to the seva book. A `sevaRepo` module is that ledger book in code.',
          theory:
            "A **repository** is a module that gathers every SQL statement for one entity behind clean JavaScript methods. `sevaRepo` exposes `list()`, `getById(id)`, `create(data)`; `receiptRepo` exposes `create(data)`; `bookingRepo` exposes `create(data)`. The rest of the app never writes SQL inline — it calls these methods.\n\nAll repositories share **one `pg` Pool**. You create the Pool once (pointing at your local Postgres), and each repo `require`s it and runs `pool.query(text, params)`. The Pool manages connections for you, so you never open or close clients by hand for simple reads.\n\nThis keeps SQL in **exactly one place per entity**. If the `sevas` table gains a column, you change `sevaRepo` and nowhere else. It also gives the IPC layer something tidy to wrap: each `ipcMain.handle` channel is a one-line call into a repo method. Always use **parameterised queries** (`$1`, `$2`) — never string-concatenate user input — so devotee names with apostrophes like O'Brien and any malicious input are handled safely by `pg`.",
          whyItMatters:
            'The repository layer is what keeps the offline data code maintainable as the app grows from a few sevas to bookings, reports, and refunds. SQL lives in one predictable place per entity, parameterisation blocks injection, and the IPC handlers stay trivially thin.',
          steps: [
            "Create `electron/db.js` that builds and exports one shared `pg` Pool.",
            'Point the Pool at your local Postgres (host, port, database, user).',
            "Create `electron/repos/sevaRepo.js` that `require`s the Pool.",
            'Add `list()` running `SELECT ... FROM sevas ORDER BY name`.',
            'Add `create(data)` using parameterised `$1, $2` placeholders.',
            'Export the repo object; repeat the pattern for receipts and bookings.',
          ],
          code: `// electron/db.js — one shared Pool for the whole main process.
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'maranakatte',
  user: 'temple',
  password: 'localdevpassword', // local-only desktop DB
});
module.exports = { pool };

// electron/repos/sevaRepo.js — all seva SQL lives here.
const { pool } = require('../db');

const sevaRepo = {
  async list() {
    const { rows } = await pool.query(
      'SELECT id, name, amount, is_active FROM sevas ' +
      'WHERE is_active = true ORDER BY name'
    );
    return rows;
  },
  async create(data) {
    const { rows } = await pool.query(
      'INSERT INTO sevas (name, amount) VALUES ($1, $2) RETURNING id',
      [data.name, data.amount]   // parameterised — safe for any input
    );
    return rows[0].id;
  },
};

module.exports = { sevaRepo };`,
          pitfalls: [
            'Writing SQL directly inside `ipcMain.handle` blocks, scattering queries everywhere instead of in repos.',
            "String-concatenating values into SQL (`'... = ' + name`) — an injection hole and it breaks on apostrophes.",
            'Creating a new `Pool` in every repo instead of sharing one, exhausting connections.',
            'Forgetting `RETURNING id` when you need the new row id back.',
            'Leaving `is_active = false` rows in `list()` so retired sevas still show at the counter.',
            'Hard-coding amounts in JS instead of reading the rate from the `sevas` row.',
          ],
          tryIt:
            'Build `sevaRepo.list()` and call it from a temporary `ipcMain.handle` plus a button. Seeing real rows from your local Postgres confirms the Pool, the repo, and the channel all work together.',
          takeaway:
            'A repository owns all SQL for one entity over a single shared `pg` Pool; parameterise every query and keep IPC handlers as thin one-line calls into repos.',
        },
        {
          id: 'm4-t7',
          title: 'Mapping snake_case rows to camelCase objects',
          explain:
            'Postgres returns columns like is_active and created_at; the React side wants isActive and createdAt. The repo maps between the two.',
          analogy:
            'The temple ledger is written in the **office shorthand** — short column labels everyone in the back office knows. When you hand a record to the front desk, you rewrite it in **plain reading form** so the counter staff are not puzzled by shorthand. Mapping snake_case to camelCase is that rewrite at the office door.',
          theory:
            "By convention Postgres columns are **snake_case**: `is_active`, `created_at`, `payment_mode`. JavaScript and React code is conventionally **camelCase**: `isActive`, `createdAt`, `paymentMode`. If you pass raw rows straight to React, the UI gets stuck reading `seva.is_active`, mixing two naming worlds and leaking the database schema into your components.\n\nThe fix is a small **mapper** in the repository: a function that takes a DB row and returns a clean JS object. `mapSeva(row)` returns `{ id: row.id, name: row.name, amount: row.amount, isActive: row.is_active }`. The repo's `list()` runs `rows.map(mapSeva)` before returning.\n\nThis gives you **one translation point per entity**. React only ever sees camelCase, the database keeps its conventions, and if a column is renamed you fix the mapper alone. It is also where you can coerce types if needed — for example turning a numeric `amount` that `pg` may return as a string into a number, or formatting nothing at all and leaving currency as `numeric` strings to avoid float rounding on money.",
          whyItMatters:
            'Without mapping, your React components are tied to raw column names and the whole UI breaks if the schema shifts. A mapper per entity keeps a clean camelCase contract for the UI and a single place to handle type quirks like Postgres numeric coming back as a string.',
          steps: [
            "Write a `mapSeva(row)` helper returning a camelCase object.",
            'Map `is_active` to `isActive`, `created_at` to `createdAt`, etc.',
            "In `list()`, return `rows.map(mapSeva)`.",
            "In `getById()`, return `rows[0] ? mapSeva(rows[0]) : null`.",
            'Decide how to treat `numeric` money — keep as string to avoid float drift.',
            'Repeat a mapper per entity (receipts, bookings) so React only sees camelCase.',
          ],
          code: `// electron/repos/sevaRepo.js — map DB rows to clean JS objects.
function mapSeva(row) {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,          // numeric kept as string — no float rounding on money
    isActive: row.is_active,     // snake_case -> camelCase
    createdAt: row.created_at,
  };
}

const sevaRepo = {
  async list() {
    const { rows } = await pool.query(
      'SELECT id, name, amount, is_active, created_at FROM sevas ' +
      'WHERE is_active = true ORDER BY name'
    );
    return rows.map(mapSeva);    // React only ever sees camelCase
  },
  async getById(id) {
    const { rows } = await pool.query(
      'SELECT id, name, amount, is_active, created_at FROM sevas WHERE id = $1',
      [id]
    );
    return rows[0] ? mapSeva(rows[0]) : null;
  },
};`,
          pitfalls: [
            'Passing raw snake_case rows to React, forcing components to read `seva.is_active`.',
            'Mapping in some methods but not others, so the UI sees inconsistent shapes.',
            'Turning `numeric` money into a JS `number` and getting 0.1 + 0.2 rounding errors on totals.',
            'Forgetting the null case in `getById`, so the UI crashes on a missing id.',
            'Duplicating the mapping logic inline in every method instead of one `mapSeva` helper.',
            'Letting the mapper silently drop a column the UI later needs.',
          ],
          tryIt:
            'Add a `mapSeva` helper and confirm in DevTools that `window.api.sevas.list()` returns objects with `isActive` (not `is_active`). The clean shape is your UI contract.',
          takeaway:
            'A per-entity mapper translates snake_case DB rows into camelCase JS objects at one point, giving React a clean contract and a single place to handle type quirks.',
        },
        {
          id: 'm4-t8',
          title: 'Wrapping each repo method in an ipcMain.handle channel',
          explain:
            'Each repository method gets exactly one IPC channel; the handler is a thin line that calls the repo and returns its result.',
          analogy:
            'Each ledger method gets its own **labelled pigeonhole at the grille**. A slip dropped in the "list sevas" pigeonhole goes straight to the seva ledger and the answer comes back. The pigeonholes (channels) do no work themselves — they just route to the right ledger method.',
          theory:
            "Once the repositories exist, the IPC layer becomes almost mechanical: **one channel per repo method**. `ipcMain.handle('sevas:list', () => sevaRepo.list())` and `ipcMain.handle('sevas:create', (e, data) => sevaRepo.create(data))`. The handler should be **thin** — no SQL, no business rules of its own — just receive arguments, call the repo, and return the result.\n\nGather all registrations in one `registerIpc()` function and call it after `app.whenReady()`. Keeping them together gives you a single map of every channel the app exposes — handy for review and security: you can see at a glance exactly what the renderer is allowed to ask for.\n\nNote the handler signature: the first argument is the IPC **`event`**, then your payload. So `ipcMain.handle('sevas:create', (event, data) => sevaRepo.create(data))` — you usually ignore `event` for simple data calls. Because the repo methods are `async` and return Promises, `handle` forwards that Promise to the renderer's `invoke`, so `await window.api.sevas.create(data)` just works.",
          whyItMatters:
            "Thin handlers keep all the real logic in repositories where it is testable, and keep the IPC layer as a clean, auditable list of allowed channels. This one-to-one mapping — `window.api` method, channel, repo method — is what makes the whole data path easy to trace and reason about.",
          steps: [
            "Create `registerIpc()` in `electron/ipc.js`.",
            "Add `ipcMain.handle('sevas:list', () => sevaRepo.list())`.",
            "Add `ipcMain.handle('sevas:create', (e, data) => sevaRepo.create(data))`.",
            'Keep each handler a single line that delegates to the repo.',
            "Call `registerIpc()` after `app.whenReady()` in `main.js`.",
            'Verify each channel matches a preload method name exactly.',
          ],
          code: `// electron/ipc.js — one thin channel per repo method.
const { ipcMain } = require('electron');
const { sevaRepo } = require('./repos/sevaRepo');
const { receiptRepo } = require('./repos/receiptRepo');

function registerIpc() {
  ipcMain.handle('sevas:list',     ()          => sevaRepo.list());
  ipcMain.handle('sevas:create',   (e, data)   => sevaRepo.create(data));
  ipcMain.handle('receipts:create',(e, data)   => receiptRepo.create(data));
  // first arg is the IPC event; we ignore it for plain data calls
}

module.exports = { registerIpc };

// main.js
// app.whenReady().then(() => { registerIpc(); createWindow(); });`,
          pitfalls: [
            'Putting SQL or business logic in the handler instead of the repo, defeating the layering.',
            "Forgetting `event` is the first parameter and reading your payload from the wrong argument.",
            "Channel string typos that don't match preload — the call rejects with 'No handler registered'.",
            'Registering channels before `app.whenReady()` or forgetting to call `registerIpc()` at all.',
            'Spreading handlers across many files so there is no single list of exposed channels to audit.',
            "Returning the repo's Promise but forgetting the repo method was never `async`, so nothing resolves.",
          ],
          tryIt:
            'Wire all three channels in `registerIpc()`, then from React call each `window.api` method. Confirm every call maps cleanly: method to channel to repo.',
          takeaway:
            'Register one thin `ipcMain.handle` channel per repo method, gather them in `registerIpc()`, and keep handlers logic-free so the channel list stays a clean, auditable map.',
        },
        {
          id: 'm4-t9',
          title: 'Transactions for a receipt and its items',
          explain:
            'A receipt and its line items must save together or not at all. Wrap the inserts in BEGIN / COMMIT / ROLLBACK so a half-saved ticket never happens.',
          analogy:
            'At the **Rangapooje rush of 500+ a day**, a receipt is the header slip plus its list of sevas. You never want a slip printed with a token but no sevas, or sevas charged with no slip. The clerk writes the whole ticket in one stroke and only then tears it off. A transaction is that all-or-nothing stroke: either the full ticket exists or none of it does.',
          theory:
            "Saving a receipt touches **two tables**: one `receipts` row (token, total, payment mode) and several `receipt_items` rows (one per seva on the ticket). If the receipt row inserts but the app crashes before the items, you have a charged ticket with no sevas — a corrupt record at a busy counter.\n\nThe cure is a **transaction**. You take a single client from the Pool with `pool.connect()`, run `BEGIN`, do all the inserts on **that same client**, then `COMMIT`. If anything throws, you `ROLLBACK` so the database is left exactly as it was before. Crucially you must `release()` the client in a `finally` block so it returns to the Pool either way.\n\nThe shape is: `BEGIN` → insert receipt, get its new id and token via `RETURNING` → loop the items inserting each with that receipt id → `COMMIT`. Wrap it in `try/catch` where the catch does `ROLLBACK` and re-throws. Because it is all on one client inside one transaction, either the whole ticket lands or none of it does — no half-saved receipt is ever possible.",
          whyItMatters:
            'A receipt is money and a record the devotee walks away with. With Rangapooje alone running 500+ a day, a half-saved ticket would mean lost money or a confused devotee. Transactions are the only correct way to keep the header and its items consistent.',
          steps: [
            "Get a single client: `const client = await pool.connect()`.",
            "Run `await client.query('BEGIN')`.",
            'Insert the receipt row with `RETURNING id, token`.',
            'Loop the items, inserting each with the new receipt id on the SAME client.',
            "On success `await client.query('COMMIT')` and return the token.",
            "In `catch`, `await client.query('ROLLBACK')` and re-throw; always `client.release()` in `finally`.",
          ],
          code: `// electron/repos/receiptRepo.js — receipt + items in ONE transaction.
const { pool } = require('../db');

const receiptRepo = {
  async create({ items, total, paymentMode }) {
    const client = await pool.connect(); // one client for the whole transaction
    try {
      await client.query('BEGIN');

      const r = await client.query(
        'INSERT INTO receipts (total, payment_mode) VALUES ($1, $2) ' +
        'RETURNING id, token',
        [total, paymentMode]
      );
      const receiptId = r.rows[0].id;

      for (const it of items) {                 // same client, same transaction
        await client.query(
          'INSERT INTO receipt_items (receipt_id, seva_id, amount) ' +
          'VALUES ($1, $2, $3)',
          [receiptId, it.sevaId, it.amount]
        );
      }

      await client.query('COMMIT');
      return r.rows[0].token;                    // give the counter the token number
    } catch (err) {
      await client.query('ROLLBACK');            // undo the half-written ticket
      throw err;
    } finally {
      client.release();                          // always return the client to the Pool
    }
  },
};

module.exports = { receiptRepo };`,
          pitfalls: [
            'Running the inserts on `pool.query` instead of the single `client` — they escape the transaction.',
            'Forgetting `client.release()` in `finally`, leaking connections until the Pool is exhausted.',
            "Catching the error but not running `ROLLBACK`, leaving a half-written ticket.",
            'Swallowing the error after rollback instead of re-throwing, so the UI thinks the save succeeded.',
            "Computing the total in JS as a float and getting rounding drift — keep money as `numeric`.",
            'Generating the token outside the transaction so two concurrent saves could clash.',
          ],
          tryIt:
            'Force a failure by inserting a bad item mid-loop and confirm the receipt row does NOT appear afterwards — proof the ROLLBACK kept the ticket all-or-nothing.',
          takeaway:
            'Save a receipt and its items on one client inside BEGIN/COMMIT, ROLLBACK on any error, and always release() in finally — so a half-saved ticket can never exist.',
        },
        {
          id: 'm4-t10',
          title: 'Error handling across the IPC boundary',
          explain:
            'Errors must cross to the UI as clean, serializable messages — never raw stack traces or database internals.',
          analogy:
            'When something goes wrong in the back office, the clerk does not slide the devotee the whole tangled internal note about which ledger line jammed. They say plainly, "Sorry, that seva could not be saved — please try again." Across the IPC grille you do the same: a calm, readable message, not the office\'s private mess.',
          theory:
            "When a handler or repo throws, `ipcMain.handle` rejects the renderer's `invoke` Promise — good, you can `catch` it in React. But Electron serialises the error, and a raw `pg` error can carry **stack traces, SQL fragments, and internal details** you do not want surfacing in the UI.\n\nSo catch errors at the boundary and **re-shape them**. In the handler (or a wrapper around all handlers), catch the raw error, log the full detail to the **main-process** console or a log file, and throw a **clean Error** with a short, safe message like `'Could not save the receipt. Please try again.'`. The renderer then receives only that message.\n\nIt also helps to give errors a **code** the UI can branch on — for example a unique-violation on a duplicate seva name becomes `{ message: 'A seva with that name already exists.', code: 'DUPLICATE' }`. Keep the shape **serializable** (plain message and code), never an object with methods. This way the counter staff see helpful guidance, while the diagnostic detail stays safely in the main-process logs where a developer can read it.",
          whyItMatters:
            "Leaking stack traces or SQL into the UI is both confusing for counter staff and a security smell. Clean, coded errors give the React layer something it can show as a friendly toast and branch on, while real diagnostics stay where developers need them.",
          steps: [
            'Wrap repo/handler bodies in `try/catch` at the boundary.',
            'Log the full raw error to the main-process console or a log file.',
            "Throw a new `Error` with a short, safe message for the UI.",
            'Attach a `code` for cases the UI should branch on (e.g. DUPLICATE).',
            "Map known `pg` error codes (like `23505` unique violation) to friendly text.",
            'In React, catch the rejected Promise and show the message — never the stack.',
          ],
          code: `// A small wrapper so every handler returns clean, safe errors.
function safe(handler) {
  return async (event, ...args) => {
    try {
      return await handler(event, ...args);
    } catch (err) {
      console.error('[ipc error]', err); // full detail stays in MAIN logs
      if (err.code === '23505') {        // pg unique_violation
        const e = new Error('That record already exists.');
        e.code = 'DUPLICATE';
        throw e;                          // clean, serializable message to UI
      }
      throw new Error('Something went wrong. Please try again.');
    }
  };
}

// usage:
// ipcMain.handle('sevas:create', safe((e, data) => sevaRepo.create(data)));`,
          pitfalls: [
            'Letting raw `pg` errors with stack traces and SQL reach the renderer.',
            'Throwing a non-Error value (a string or object with methods) that does not serialise cleanly.',
            'Logging nothing in main, so when the UI shows a generic message you have no diagnostic trail.',
            "Showing the technical code (`23505`) to counter staff instead of friendly text.",
            'Catching the error in main but returning `undefined` so the UI thinks it succeeded.',
            'Forgetting that a rejected Promise in React must be caught, or it becomes an unhandled rejection.',
          ],
          tryIt:
            'Trigger a duplicate seva name and confirm the UI shows a friendly "already exists" message while the full pg error (code 23505) appears only in the main-process terminal.',
          takeaway:
            'Catch errors at the IPC boundary, log full detail in main, and throw clean serializable Errors with optional codes — the UI gets friendly messages, never raw stack traces.',
        },
      ],
    },
    {
      id: 'm4-s3',
      title: 'Calling the data layer from React',
      topics: [
        {
          id: 'm4-t11',
          title: 'A React hook that calls window.api',
          explain:
            'A custom hook wraps a window.api call and tracks data, loading, and error so components stay simple.',
          analogy:
            'The hook is the **runner** between the counter screen and the grille. The component says "I need today\'s sevas"; the runner goes to the grille, waits, and comes back — meanwhile holding up a "fetching" sign, and if the grille is jammed, a "sorry" sign. The component just reads the runner\'s three signs: loading, error, data.',
          theory:
            "React components should stay focused on rendering, so the asynchronous `window.api` call lives in a **custom hook**. A `useSevas()` hook keeps three pieces of state — `data`, `loading`, `error` — and on mount runs `window.api.sevas.list()` inside a `useEffect`.\n\nThe pattern: set `loading` true, `await` the call in a `try`, store the result in `data` on success, store the message in `error` on failure, and set `loading` false in a `finally`. The hook returns `{ data, loading, error }` (and often a `refetch` function). The component then just reads those.\n\nA more general `useApi(fn)` hook can take any `window.api` method so you reuse the same loading/error machinery for sevas, devotees, and bookings. Guard against setting state after unmount (an `ignore` flag in the effect) so a slow query resolving after the screen closed does not warn. This hook is the clean seam between your secure data layer and the UI: React never touches IPC directly, only this small, testable hook.",
          whyItMatters:
            'Centralising the call in a hook means every screen gets consistent loading and error handling for free, components stay readable, and there is one place to adjust how the UI talks to the data layer. It is the React-side mirror of the repository idea.',
          steps: [
            'Create `src/hooks/useSevas.js`.',
            "Hold `data`, `loading`, `error` with `useState`.",
            "In `useEffect`, set loading, then `await window.api.sevas.list()`.",
            'On success set `data`; in `catch` set `error.message`; in `finally` set loading false.',
            'Use an `ignore` flag so a late response after unmount is dropped.',
            'Return `{ data, loading, error, refetch }` for the component to read.',
          ],
          code: `// src/hooks/useSevas.js — wrap the window.api call with loading/error state.
import { useState, useEffect, useCallback } from 'react';

export function useSevas() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sevas = await window.api.sevas.list(); // crosses IPC to main + pg
      setData(sevas);
    } catch (err) {
      setError(err.message || 'Could not load sevas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    load().then(() => { if (ignore) return; });
    return () => { ignore = true; }; // drop a late response after unmount
  }, [load]);

  return { data, loading, error, refetch: load };
}`,
          pitfalls: [
            'Calling `window.api` directly inside JSX or an event handler with no loading/error tracking.',
            'Forgetting `error` and `loading`, so a failed query shows a blank or frozen screen.',
            'Not guarding against unmount, getting "set state on unmounted component" warnings.',
            "Putting `window.api.sevas.list()` straight in `useEffect` without `try/catch`.",
            'Omitting a `refetch`, so the list never updates after a create.',
            "Assuming `window.api` is always defined — in a stray browser tab without preload it is not.",
          ],
          tryIt:
            'Use `useSevas()` in a component and log `{ data, loading, error }` on each render — watch it go loading true → data filled, all from one tidy hook.',
          takeaway:
            'A custom hook wraps the `window.api` call and exposes data, loading, error, and refetch — the clean React-side seam to the secure data layer.',
        },
        {
          id: 'm4-t12',
          title: 'Loading, empty, and error states in the UI',
          explain:
            'Every data screen has three states beyond the happy path: still loading, loaded-but-empty, and failed. Render each one explicitly.',
          analogy:
            'A good counter notice board never goes blank. While the clerk fetches the register it says "one moment"; if there are no bookings today it says "no bookings yet"; if the office is shut it says "service unavailable". Your seva screen owes devotees and staff the same three honest notices instead of an empty stare.',
          theory:
            "A data-driven screen really has **four** states, not one. There is the **happy path** (data arrived, render the list), but also **loading** (the query is in flight), **empty** (the query succeeded but returned zero rows), and **error** (the query failed). Forgetting any of them produces a confusing UI — a blank panel that might be loading, broken, or genuinely empty, and the user cannot tell which.\n\nWith the `useSevas()` hook returning `{ data, loading, error }`, the component renders them in order. First `if (loading) return <Spinner/>`. Then `if (error) return <ErrorBox message={error} onRetry={refetch}/>`. Then `if (data.length === 0) return <EmptyState/>`. Only after those guards do you render the real list.\n\nThe **empty** state matters more than people expect: a fresh Maranakatte install has no receipts yet, so 'no receipts today' with a clear next action is the honest message, not a blank table. The **error** state should show the friendly message your IPC layer produced and offer a **Retry** that calls `refetch`. Handling all four states is what makes the counter app feel trustworthy under the daily rush.",
          whyItMatters:
            'Counter staff need to instantly tell "still loading" from "nothing here" from "something broke". Explicit states prevent panic during the Rangapooje rush, make errors recoverable with a retry, and stop a slow local query from looking like a crash.',
          steps: [
            'Read `{ data, loading, error, refetch }` from the hook.',
            'Render a spinner or skeleton while `loading` is true.',
            'Render an error box with the message and a Retry button when `error` is set.',
            'Render an empty state when `data.length === 0`.',
            'Only then render the actual list of sevas.',
            'Keep each branch a clear, separate return for readability.',
          ],
          code: `// src/components/SevaList.jsx — render all four states explicitly.
import { useSevas } from '../hooks/useSevas';

export function SevaList() {
  const { data, loading, error, refetch } = useSevas();

  if (loading) return <p className="muted">Loading sevas…</p>;
  if (error) {
    return (
      <div className="error-box">
        <p>{error}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }
  if (data.length === 0) return <p className="muted">No sevas configured yet.</p>;

  return (
    <ul>
      {data.map((s) => (
        <li key={s.id}>{s.name} — ₹{s.amount}</li>
      ))}
    </ul>
  );
}`,
          pitfalls: [
            'Rendering only the list, so loading and error both look like an empty screen.',
            'Treating an empty result as an error, scaring staff when there is simply nothing yet.',
            'Showing a raw error object instead of the friendly message from the IPC layer.',
            'No Retry action, forcing a full app restart to recover from a transient failure.',
            'Forgetting a stable `key` on list items, causing React render glitches.',
            "Flashing the empty state for a split second before data arrives because order of checks is wrong.",
          ],
          tryIt:
            'Temporarily make `sevas:list` throw and confirm the screen shows the error box with a working Retry; then return an empty array and confirm the empty state — not a blank panel.',
          takeaway:
            'Render loading, error, empty, and happy-path states explicitly so the counter UI is always honest about what is happening, with a retry to recover from failures.',
        },
        {
          id: 'm4-t13',
          title: 'Refetch after a write vs optimistic update',
          explain:
            'After a create, you can either re-run the list query (refetch) or update local state immediately (optimistic). For the counter, refetch is usually the safer fit.',
          analogy:
            'After the clerk adds a new seva to the ledger, you can either **re-read the whole board** to be certain it is there (refetch — slower but always true), or **chalk it onto the board yourself** instantly and trust the ledger agreed (optimistic — snappy but risky if the ledger refused). At a busy counter where correctness of money matters, re-reading the board wins.',
          theory:
            "When a write succeeds — a new seva created, a receipt saved — the on-screen list is now stale. Two strategies fix that.\n\n**Refetch** simply calls `refetch()` after the create resolves, re-running `window.api.sevas.list()` so the list reflects exactly what the database holds. It is one extra round trip but it is **always correct**: whatever the DB actually stored is what you show. For a local Postgres on the same machine, that round trip is milliseconds, so the cost is tiny.\n\n**Optimistic update** instead pushes the new item into local state immediately, before or without waiting for confirmation, for an instant-feeling UI. It is great for high-latency cloud apps, but it risks showing something the database did not actually accept, and you must write rollback logic if the write fails.\n\nFor the Maranakatte counter — offline, local DB, money on the line — **refetch is the sensible default**. The latency is negligible and you never show a receipt or seva the database did not truly store. Reserve optimistic updates for cases where the local round trip is genuinely felt and a wrong-then-corrected display is acceptable, which is rarely the case here.",
          whyItMatters:
            'Choosing refetch keeps the counter display honest about what the local database actually contains — vital when the records are money. It is also simpler: no rollback logic, no divergence between screen and DB. Knowing the trade-off lets you reach for optimistic updates only where they truly help.',
          steps: [
            "After `await window.api.sevas.create(data)` resolves, call `refetch()`.",
            'Show a brief success indication once the list refreshes.',
            'Prefer refetch for any screen showing money or official records.',
            'Consider optimistic only where the local round trip is genuinely felt.',
            'If you do go optimistic, write the rollback path for a failed write.',
            'Never leave the list stale after a successful create.',
          ],
          code: `// Create then refetch — always shows exactly what the DB holds.
import { useState } from 'react';
import { useSevas } from '../hooks/useSevas';

export function AddSeva() {
  const { refetch } = useSevas();
  const [saving, setSaving] = useState(false);

  async function onAdd(form) {
    setSaving(true);
    try {
      await window.api.sevas.create({ name: form.name, amount: form.amount });
      await refetch(); // re-read the board — local DB round trip is milliseconds
    } catch (err) {
      alert(err.message); // friendly message from the IPC layer
    } finally {
      setSaving(false);
    }
  }

  return <button disabled={saving} onClick={() => onAdd(/* ... */)}>Add seva</button>;
}`,
          pitfalls: [
            'Adding the item to local state optimistically, then never reconciling when the write fails.',
            'Forgetting to refetch, so the new seva or receipt never appears until a manual reload.',
            'Choosing optimistic updates for money records, risking a display the DB never stored.',
            'Refetching but not handling its own loading/error, so a failed refetch silently leaves stale data.',
            'Double-submitting because the button is not disabled while saving.',
            'Assuming the local round trip is slow and over-engineering optimism that is not needed.',
          ],
          tryIt:
            'Add a seva and confirm it appears via `refetch()` without reloading the app. Then disable the button while saving to prevent a double insert.',
          takeaway:
            'For an offline, money-handling counter, refetch after a write is the correct default — always accurate and simpler; use optimistic updates only where local latency is truly felt.',
        },
        {
          id: 'm4-t14',
          title: 'Validate in the renderer before crossing, re-validate in main',
          explain:
            'Check input in React for instant feedback, but never trust it — the main process must re-validate before touching the database.',
          analogy:
            'The clerk at the window does a **quick eyeball check** of your slip — is the name filled, is the amount sensible — so they can hand it back at once if not. But the **back-office ledger keeper checks again** before writing, because the front desk check can be skipped or fooled. Two checks: one for speed at the window, one for safety at the ledger.',
          theory:
            "Validation belongs in **two places** for two different reasons. In the **renderer**, you validate for **fast, friendly feedback**: a devotee name is required, gotra and nakshatra present, phone looks like ten digits, amount is a positive number. This catches mistakes before any IPC call and keeps the counter quick.\n\nBut renderer validation is **not trustworthy** — it is just JavaScript on a page, and in principle any code could call `window.api.sevas.create` with bad data, bypassing the form. So the **main process must re-validate** the same rules inside the repository or handler before running SQL. If the data is bad, throw a clean, coded error that crosses back as a friendly message.\n\nThe split is: renderer validation is for **user experience**, main validation is for **data integrity**. Never rely on the UI check alone to keep the database clean — for money (`numeric`) and required devotee fields especially, the main-side check is the real guard. Database **constraints** (NOT NULL, CHECK amount > 0, unique) are a third and final backstop, so even a bug in both layers cannot write a corrupt row.",
          whyItMatters:
            'A counter handling money and devotee records cannot let a blank name or a negative amount reach the ledger. Renderer checks keep staff fast; main re-validation and DB constraints keep the data correct no matter how the call arrived. Trusting the UI alone is a classic data-integrity hole.',
          steps: [
            'In the form, validate required fields and formats before calling `window.api`.',
            'Show inline messages so staff fix input without a round trip.',
            'In the repo/handler, re-check the same rules before any SQL.',
            "Throw a clean error like 'Amount must be greater than zero' on failure.",
            'Add DB constraints (NOT NULL, CHECK amount > 0) as the final backstop.',
            "Keep money as `numeric` and validate it as a positive number, not a float.",
          ],
          code: `// MAIN re-validates before writing — never trust the renderer alone.
const receiptRepo = {
  async create({ items, total, paymentMode }) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('A receipt needs at least one seva.');
    }
    if (!(Number(total) > 0)) {
      throw new Error('Total must be greater than zero.');
    }
    if (!['cash', 'upi'].includes(paymentMode)) {
      throw new Error('Unknown payment mode.');
    }
    // ...only now run the BEGIN/INSERT/COMMIT transaction...
  },
};`,
          pitfalls: [
            'Validating only in React and trusting it, leaving the database open to bad data from any caller.',
            'Validating only in main, so staff get round-trip errors for things the form could have caught instantly.',
            'Different rules in the two layers, so the form accepts what main rejects (or vice versa).',
            'Treating money as a float in validation and admitting 0.1-style rounding into totals.',
            'Skipping DB constraints, removing the final backstop against a corrupt row.',
            "Leaking the raw validation throw without a friendly message to the counter.",
          ],
          tryIt:
            'Bypass the form and call `window.api.receipts.create({ items: [], total: 0 })` from DevTools — confirm main rejects it with a clean message, proving the server-side check is the real guard.',
          takeaway:
            'Validate in the renderer for fast feedback but re-validate the same rules in main before any SQL, with DB constraints as the final backstop — never trust the UI alone for data integrity.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm4-p1',
      type: 'guided-build',
      title: 'The IPC bridge + seva repo',
      domain: 'Maranakatte Seva — offline temple counter (Electron + React + local Postgres)',
      duration: '3-4 hours',
      description:
        'Build the full data path for one entity end to end: a preload that exposes window.api.sevas.list/create, a sevaRepo in the main process that runs SQL over the pg Pool, ipcMain.handle channels wiring them, and a React button that lists the real sevas from the local database. This is the skeleton every other entity will copy.',
      tools: ['Electron', 'React', 'Vite', 'Node.js', 'pg (node-postgres)', 'PostgreSQL'],
      blueprint: {
        overview:
          'You will wire the renderer to the local Postgres through a secure bridge. The preload exposes a tiny window.api.sevas surface; main registers matching channels that call a sevaRepo; the repo owns all seva SQL over one shared Pool and maps rows to camelCase. A React component then lists sevas and adds a new one, proving the full round trip with real data — and establishing the pattern for receipts, devotees, and bookings.',
        functionalRequirements: [
          'window.api.sevas.list() returns all active sevas from the local Postgres as camelCase objects.',
          'window.api.sevas.create({ name, amount }) inserts a new seva and the list reflects it after refetch.',
          'The renderer has no Node and no pg access — all database work happens in the main process.',
          'A React screen shows loading, empty, and error states, then the list, with an Add Seva action.',
          'Channel names, window.api methods, and sevaRepo methods map one-to-one and are easy to trace.',
        ],
        technicalImplementation: [
          'electron/db.js builds one shared pg Pool pointing at the local Postgres database.',
          'electron/repos/sevaRepo.js exposes list() and create(data) with parameterised SQL and a mapSeva row mapper.',
          'electron/ipc.js registers ipcMain.handle for sevas:list and sevas:create as thin calls into sevaRepo, invoked after app.whenReady().',
          'electron/preload.js uses contextBridge.exposeInMainWorld to expose only api.sevas.list and api.sevas.create.',
          'src/hooks/useSevas.js wraps the calls with data/loading/error/refetch; src/components/SevaList.jsx renders all states.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Pool + sevaRepo',
            outcome: 'A shared pg Pool and a seva repository with mapped, parameterised queries.',
            prompt:
              "Create electron/db.js exporting one shared pg Pool for a local Postgres database 'maranakatte'. Then create electron/repos/sevaRepo.js that requires the Pool and exports an object with async list() (SELECT id, name, amount, is_active, created_at FROM sevas WHERE is_active = true ORDER BY name) and async create(data) (parameterised INSERT ... RETURNING id). Add a mapSeva(row) helper turning snake_case columns into camelCase (isActive, createdAt) and keeping amount as a string; have list() return rows.map(mapSeva). Use $1, $2 placeholders only — never string concatenation.",
          },
          {
            step: 2,
            label: 'Channels + preload bridge',
            outcome: 'IPC channels wired to the repo and a small safe window.api.sevas surface.',
            prompt:
              "Create electron/ipc.js exporting registerIpc() that registers ipcMain.handle('sevas:list', () => sevaRepo.list()) and ipcMain.handle('sevas:create', (e, data) => sevaRepo.create(data)) as thin one-line delegations. Call registerIpc() after app.whenReady() in main.js. Then write electron/preload.js using contextBridge.exposeInMainWorld('api', ...) to expose ONLY api.sevas.list (invoke 'sevas:list') and api.sevas.create (invoke 'sevas:create', data). Do not expose ipcRenderer raw. Confirm main.js BrowserWindow uses nodeIntegration:false, contextIsolation:true, and the preload path.",
          },
          {
            step: 3,
            label: 'React hook + list screen',
            outcome: 'A button-driven screen that lists real sevas and adds one, with all UI states.',
            prompt:
              "Create src/hooks/useSevas.js returning { data, loading, error, refetch } that calls window.api.sevas.list() inside useEffect with try/catch/finally and an unmount guard. Create src/components/SevaList.jsx that renders a loading message, an error box with a Retry calling refetch, an empty state when data.length === 0, then the list of sevas as 'name — ₹amount'. Add an Add Seva form that calls window.api.sevas.create({ name, amount }) and then refetch(), disabling the button while saving. Verify the new seva appears from the real local database without reloading the app.",
          },
        ],
        deliverable:
          'A working vertical slice: preload window.api.sevas, a sevaRepo over the pg Pool, matching ipcMain.handle channels, and a React screen that lists and adds sevas against the real local Postgres — the reusable template for every other entity.',
      },
    },
    {
      id: 'm4-p2',
      type: 'guided-build',
      title: 'Save a receipt transactionally',
      domain: 'Maranakatte Seva — offline temple counter (Electron + React + local Postgres)',
      duration: '3-4 hours',
      description:
        'Build api.receipts.create({ items, total, paymentMode }) that inserts a receipt header and all its line items inside a single Postgres transaction and returns the new token number. With Rangapooje alone running 500+ a day, a half-saved ticket is unacceptable, so BEGIN/COMMIT/ROLLBACK is the heart of this build.',
      tools: ['Electron', 'React', 'Node.js', 'pg (node-postgres)', 'PostgreSQL'],
      blueprint: {
        overview:
          'You will add a transactional write path. A receiptRepo.create takes one client from the Pool, runs BEGIN, inserts the receipt row (RETURNING id and token), inserts every item on the same client, then COMMITs — rolling back on any error and always releasing the client. Main re-validates the payload, reshapes errors cleanly, and the React counter cart calls window.api.receipts.create and shows the returned token.',
        functionalRequirements: [
          'api.receipts.create({ items, total, paymentMode }) saves the receipt and all items atomically and returns a token number.',
          'If any item insert fails, the whole receipt is rolled back — no header without items, no items without a header.',
          'Main re-validates the payload (at least one item, total > 0, known payment mode) before any SQL.',
          'Money is handled as Postgres numeric; totals are never computed as floats that can round.',
          'The React cart sends the items and total, then displays the new token to read out to the devotee.',
        ],
        technicalImplementation: [
          'receiptRepo.create acquires one client via pool.connect(), runs BEGIN, INSERT receipt RETURNING id, token, loops items inserting each on the same client, then COMMIT.',
          'A try/catch wraps the transaction: catch runs ROLLBACK and re-throws; a finally always calls client.release().',
          'ipcMain.handle for receipts:create wraps receiptRepo.create in a safe() helper that logs full errors in main and throws clean serializable messages.',
          'Server-side validation runs before BEGIN; DB constraints (NOT NULL, CHECK amount > 0) act as the final backstop.',
          'preload exposes api.receipts.create; a React cart hook calls it, handles loading/error, and shows the returned token.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Transactional receiptRepo.create',
            outcome: 'A receipt and its items saved atomically, returning the new token.',
            prompt:
              "Create electron/repos/receiptRepo.js exporting async create({ items, total, paymentMode }). Acquire one client with pool.connect(). In a try: run BEGIN; INSERT INTO receipts (total, payment_mode) VALUES ($1,$2) RETURNING id, token; capture receiptId; loop items inserting INSERT INTO receipt_items (receipt_id, seva_id, amount) VALUES ($1,$2,$3) on the SAME client; run COMMIT; return the token. In catch: run ROLLBACK and re-throw. In finally: client.release(). Use parameterised queries only and keep money as numeric.",
          },
          {
            step: 2,
            label: 'Validation + safe channel',
            outcome: 'A validated, error-clean ipcMain.handle channel for creating receipts.',
            prompt:
              "At the top of receiptRepo.create, before BEGIN, validate: items is a non-empty array, Number(total) > 0, and paymentMode is one of ['cash','upi'] — throwing clean Error messages otherwise. Then create a safe(handler) wrapper that try/catches, console.errors the full error in main, maps pg code '23505' to a friendly DUPLICATE error, and otherwise throws a generic 'Could not save the receipt. Please try again.' Register ipcMain.handle('receipts:create', safe((e, data) => receiptRepo.create(data))) and expose api.receipts.create in preload via invoke('receipts:create', data).",
          },
          {
            step: 3,
            label: 'React cart calls create and shows the token',
            outcome: 'The counter cart saves a receipt and displays the returned token number.',
            prompt:
              "Build a React cart that collects selected sevas as items [{ sevaId, amount }], computes the total from numeric amounts (no float rounding), and lets staff pick paymentMode. On Save, call const token = await window.api.receipts.create({ items, total, paymentMode }) inside try/catch/finally with a saving flag to prevent double submit; on success show 'Token #' + token prominently and clear the cart; on error show the friendly message. Confirm that forcing a failure mid-transaction leaves NO receipt row in the database, proving the rollback works.",
          },
        ],
        deliverable:
          'A transactional receipt save: api.receipts.create that writes a receipt and its items in one BEGIN/COMMIT (ROLLBACK on failure, always releasing the client), validated in main with clean errors, returning a token the React cart reads out to the devotee.',
      },
    },
  ],
  quiz: [
    {
      id: 'm4-q1',
      q: 'Why can the React renderer not query the local Postgres database directly?',
      options: [
        'Postgres does not work on the desktop.',
        'The renderer runs sandboxed with nodeIntegration off, so it has no Node and no pg driver; it must ASK the main process over IPC.',
        'React is too slow to run SQL.',
        'The Pool can only be created in the browser.',
      ],
      answer: 1,
    },
    {
      id: 'm4-q2',
      q: 'What is the right way to expose data calls to the page from the preload script?',
      options: [
        'Set nodeIntegration: true so the page can require pg.',
        'Call contextBridge.exposeInMainWorld with the raw ipcRenderer object.',
        'Expose a small, named window.api whose methods wrap specific ipcRenderer.invoke channels — never the raw ipcRenderer.',
        'Attach the pg Pool to window so React can query it.',
      ],
      answer: 2,
    },
    {
      id: 'm4-q3',
      q: 'Which IPC pair gives a request/response with a Promise result, suited to listing sevas or saving a receipt?',
      options: [
        'ipcRenderer.send + ipcMain.on',
        'ipcMain.handle + ipcRenderer.invoke',
        'webContents.send + ipcRenderer.on',
        'window.postMessage + addEventListener',
      ],
      answer: 1,
    },
    {
      id: 'm4-q4',
      q: 'Why must the receipt header and its items be saved inside one BEGIN/COMMIT transaction?',
      options: [
        'To make the insert faster.',
        'So the save is all-or-nothing — a crash mid-save can never leave a receipt with no items or items with no receipt.',
        'Because pg requires BEGIN before every query.',
        'To avoid using the Pool.',
      ],
      answer: 1,
    },
    {
      id: 'm4-q5',
      q: 'When a pg error occurs in a handler, what should cross the IPC boundary back to the renderer?',
      options: [
        'The full raw pg error with its stack trace and SQL.',
        'Nothing — silently return undefined.',
        'A clean, serializable Error with a short friendly message (and optional code), while the full detail is logged in the main process.',
        'The database password so the UI can retry the connection.',
      ],
      answer: 2,
    },
    {
      id: 'm4-q6',
      q: 'For the offline, money-handling Maranakatte counter, why is validating only in the React renderer not enough?',
      options: [
        'Renderer validation is always slower than main.',
        'React cannot read form values.',
        'Renderer validation is untrusted page code that can be bypassed, so main must re-validate before any SQL (with DB constraints as the final backstop).',
        'Validation must never run in the renderer at all.',
      ],
      answer: 2,
    },
  ],
};
