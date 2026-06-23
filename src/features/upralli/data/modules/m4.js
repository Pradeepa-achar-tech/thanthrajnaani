// Module 4 — Typed IPC & the Prisma Data Layer for "Upralli Seva".
// OFFLINE desktop app: Electron + React + TypeScript (electron-vite) + Prisma over a
// bundled local PostgreSQL (embedded-postgres). Teaches the fully-typed bridge between
// the React UI and Prisma: why the renderer must ASK main, a UpralliApi contract defined
// once in shared types and exposed via contextBridge, IPC handler modules in main that
// call Prisma, the Decimal->number DTO-mapping rule, and calling it all from React with
// TanStack Query. Consumed by the React course player (see components/TopicItem.jsx).

export const m4 = {
  id: 'm4',
  title: 'Typed IPC & the Prisma Data Layer',
  hours: 9,
  color: 'from-orange-500/20 to-orange-700/10',
  accent: 'orange',
  description:
    'Build the fully-typed bridge between the React UI and Prisma for the Upralli Seva temple register. The renderer can never import Prisma, so it ASKS the main process through Electron IPC: define the UpralliApi contract once in src/shared/types.ts, implement it in preload, expose it safely via contextBridge.exposeInMainWorld(\'api\', api), and back it with handler modules in main that call Prisma. Learn the one rule that bites every Electron+Prisma app — Decimal is not cleanly IPC-serializable, so map every row to a plain DTO (Decimal->number) before returning — then consume it all from React with TanStack Query: useQuery for reads, useMutation plus invalidateQueries for writes, and an optimistic checkbox toggle for a snappy participation grid.',
  sections: [
    {
      id: 'm4-s1',
      title: 'Typed IPC fundamentals',
      topics: [
        {
          id: 'm4-t1',
          title: 'Why the renderer cannot import Prisma — it must ASK main',
          explain:
            'The React renderer runs in a locked-down browser context with no Node, no filesystem and no database. To touch Prisma it must send a message to the main process and wait for the answer.',
          analogy:
            'Picture the temple committee office. The register cupboard — the Prisma client, the embedded Postgres — lives in the back room (the **main process**), which has the keys to the building. The volunteer at the front desk (the **renderer**, your React UI) is not allowed into the back room. To look up a Magane or add a household, the volunteer fills a slip and slides it through a hatch; the back room reads the register and slides the answer back. That hatch is **IPC**. The volunteer never holds the cupboard keys, which is exactly the point.',
          theory:
            'An Electron app runs two kinds of process. The **main process** is full Node: it can open files, run native modules, and hold the Prisma client connected to the bundled Postgres under `%LOCALAPPDATA%\\UpralliSeva`. The **renderer process** is a Chromium page running your React app, and for security it runs with `nodeIntegration: OFF` and `contextIsolation: ON` — no `require`, no `fs`, no direct DB.\n\nPrisma is a Node library. It uses a native query engine and Node APIs that simply do not exist in the browser sandbox, so `import { PrismaClient }` in a `.tsx` file would fail to bundle and, even if it did, would be a gaping security hole. The renderer therefore must **ask** main to do the database work on its behalf.\n\nThe asking happens over **Inter-Process Communication (IPC)**. The renderer calls `ipcRenderer.invoke(\'channel\', ...args)`, which returns a Promise; the main process answers with `ipcMain.handle(\'channel\', handler)`. It is a request/response round-trip over a named channel — like the hatch slip. Everything in this module builds on that one idea: the renderer never does data work itself; it sends a typed request to main and awaits a serializable reply.',
          whyItMatters:
            'This split is the backbone of the whole app. Get it wrong — try to reach Prisma from React — and nothing bundles or, worse, you ship an insecure app. Internalising "renderer asks, main answers" now means every screen you build later (Maganes, Years, the participation grid, backups) follows the same safe, predictable shape instead of leaking database concerns into the UI.',
          steps: [
            'Recognise the two processes: main (full Node + Prisma) and renderer (Chromium + React, sandboxed).',
            'Confirm the renderer has nodeIntegration OFF and contextIsolation ON — no Node, no Prisma.',
            'Keep the single PrismaClient instance only in main, connected to the embedded Postgres.',
            'Model every data need as a request from renderer to main over a named IPC channel.',
            'Use ipcRenderer.invoke in the renderer and ipcMain.handle in main for a Promise round-trip.',
            'Always return plain, serializable data from main — never the live Prisma client or models.',
          ],
          code:
            '// MAIN ONLY — Prisma lives here, never in a .tsx file\nimport { PrismaClient } from \'@prisma/client\'\n\nlet prisma: PrismaClient | null = null\nexport function db(): PrismaClient {\n  if (!prisma) prisma = new PrismaClient()\n  return prisma\n}\n\n// RENDERER (React) — this would BREAK the bundle and security model:\n//   import { PrismaClient } from \'@prisma/client\'  // ✗ no Node in the sandbox\n// Instead the renderer only ever does:\n//   const maganes = await window.api.maganes.list()  // ✓ asks main over IPC',
          pitfalls: [
            'Importing PrismaClient (or anything from @prisma/client) inside a renderer/.tsx file — it cannot bundle and is unsafe.',
            'Turning on nodeIntegration to "make it work" — that defeats the security model entirely.',
            'Creating multiple PrismaClient instances; keep a single lazy one in main behind a db() accessor.',
            'Trying to share a Prisma model instance across IPC — only plain serializable data crosses the hatch.',
            'Putting any filesystem or DB path logic in the renderer; %LOCALAPPDATA%\\UpralliSeva is a main concern.',
            'Forgetting invoke returns a Promise, so calling it without await leaves you holding a pending Promise.',
          ],
          tryIt:
            'In a fresh .tsx component, type `import { PrismaClient } from \'@prisma/client\'` and start the dev build. Watch it fail. Delete it and call `await window.api.maganes.list()` instead — feel the difference between doing the work and asking for it.',
          takeaway:
            'Prisma and the database live only in main; the sandboxed renderer can never import them, so every data need becomes an IPC request that main answers with plain data.',
        },
        {
          id: 'm4-t2',
          title: 'ipcMain.handle and ipcRenderer.invoke: the Promise round-trip',
          explain:
            'invoke/handle is a request/response pair over a named channel: the renderer invokes and awaits, main handles and returns, and the return value travels back as the resolved Promise.',
          analogy:
            'It is exactly the slip through the office hatch. The volunteer writes "list all Maganes" on a slip and pushes it through (`invoke(\'maganes:list\')`). The clerk in the back room has a standing rule for that slip — "when a maganes:list slip arrives, open the register and copy out the rows" (`handle(\'maganes:list\', ...)`). The clerk writes the answer on the slip and pushes it back; the volunteer, who has been waiting at the hatch, reads it. One slip out, one slip back — a clean round-trip.',
          theory:
            'IPC in Electron has two styles. The old `send`/`on` pair is fire-and-forget and one-directional. The modern pair, **`ipcRenderer.invoke`** and **`ipcMain.handle`**, is request/response: invoke returns a **Promise** that resolves with whatever the handler returns (or rejects if it throws). This maps perfectly onto database calls, which are themselves async.\n\nOn the main side you register a handler: `ipcMain.handle(\'maganes:list\', async () => { ... return rows })`. The handler can be async and can return a value or a Promise; Electron serializes that value (using the structured clone algorithm) and ships it back. On the renderer side you call `await ipcRenderer.invoke(\'maganes:list\')` and get the rows.\n\nArguments flow the same way: `ipcRenderer.invoke(\'maganes:create\', input)` arrives in main as `handle(\'maganes:create\', (event, input) => ...)` — note the first parameter is always the IPC `event`, then your arguments. Whatever crosses must be **serializable**: plain objects, arrays, strings, numbers, booleans. This is the seam where Prisma\'s `Decimal` will bite us (s2), because a Decimal is a class instance, not a plain value.',
          whyItMatters:
            'Every single feature in Upralli Seva — listing Maganes, cloning a year, toggling a participation checkbox — is one of these round-trips. Understanding that invoke returns a Promise that resolves with the handler\'s return value (and rejects on a thrown error) is what lets you wire reads into useQuery and writes into useMutation cleanly in s3, and lets you reason about errors and loading states correctly.',
          steps: [
            'Pick a clear channel name for the operation, e.g. \'maganes:list\' or \'register:addEntry\'.',
            'In main, register ipcMain.handle(channel, async (event, ...args) => { ... }).',
            'Remember the handler\'s first parameter is the IPC event; your real arguments follow.',
            'Return a plain serializable value (or Promise of one) from the handler.',
            'In the renderer, call await ipcRenderer.invoke(channel, ...args) to get that value.',
            'Let a thrown error in the handler reject the renderer\'s Promise, so the UI can catch it.',
          ],
          code:
            '// MAIN — register a handler (async is fine; the return value is shipped back)\nimport { ipcMain } from \'electron\'\nimport { db } from \'../db\'\n\nipcMain.handle(\'maganes:list\', async () => {\n  const rows = await db().magane.findMany({ orderBy: { sortOrder: \'asc\' } })\n  return rows.map(toMagane) // plain DTOs only (see s2)\n})\n\nipcMain.handle(\'maganes:create\', async (_event, input: { name: string; sortOrder: number }) => {\n  const created = await db().magane.create({ data: input })\n  return toMagane(created)\n})\n\n// RENDERER — invoke returns a Promise that resolves with the handler result\nconst maganes = await ipcRenderer.invoke(\'maganes:list\')\nconst created = await ipcRenderer.invoke(\'maganes:create\', { name: \'Kodi\', sortOrder: 3 })',
          pitfalls: [
            'Forgetting the handler\'s first argument is the IPC event, so your input lands one slot to the right.',
            'Using ipcRenderer.send/ipcMain.on for queries — that is fire-and-forget with no return value.',
            'Returning a non-serializable value (a Prisma model with Decimal/Date quirks) and getting clone errors.',
            'Registering two handlers for the same channel — Electron throws "second handler" at startup.',
            'Calling invoke before the handler is registered in main (wire handlers after app.whenReady, see s2).',
            'Swallowing handler errors silently instead of letting them reject so the renderer can react.',
          ],
          tryIt:
            'Register a tiny handle(\'ping\', () => \'pong from main\') and call await window.api... — or directly await ipcRenderer.invoke(\'ping\') in a quick test — and log the result. Then make the handler throw and observe the renderer Promise reject.',
          takeaway:
            'ipcRenderer.invoke and ipcMain.handle form a Promise-based request/response over a named channel: the handler\'s return value resolves the renderer\'s Promise, and only serializable data may cross.',
        },
        {
          id: 'm4-t3',
          title: 'Defining the API contract ONCE in src/shared/types.ts',
          explain:
            'Instead of scattering raw channel strings everywhere, describe the whole surface as one TypeScript interface, UpralliApi, that both main and renderer agree on.',
          analogy:
            'Think of UpralliApi as the official list of slips the office accepts, printed once and pinned in both the front desk and the back room. The volunteer knows exactly which slips exist and what each needs; the clerk knows exactly which slips to expect and what to return. One shared list, no guessing, no mismatched slips.',
          theory:
            'Raw IPC is stringly-typed: `invoke(\'register:setParticipation\', entryId, poojaTypeId, checked)` has no compiler help — misspell the channel or swap an argument and you only find out at runtime. The fix is to define the entire API as a **single TypeScript interface** in a file both processes import, `src/shared/types.ts`.\n\nThe `UpralliApi` interface groups operations by entity and gives each a real method signature with typed inputs and a typed `Promise` return. The DTO types it references (`MaganeDTO`, `YearDTO`, `PoojaTypeDTO`, `RegisterEntryDTO`) live in the same shared file, so both ends speak the same shapes. Money fields in those DTOs are plain `number` (or `number | null`) — never Prisma `Decimal` — which is the whole reason DTOs exist (s2).\n\nBecause `src/shared` is imported by main, preload, and renderer alike, this one interface becomes the contract. The preload implements it; main\'s handlers fulfil it; the renderer consumes it with full autocomplete and red squiggles when something does not match. Define it once, and TypeScript keeps all three ends honest.',
          whyItMatters:
            'A typed contract turns whole classes of bugs into compile errors: a renamed channel, a missing argument, a Decimal accidentally left in a return type. It also makes the codebase navigable — open types.ts and you see every capability the UI has. As the app grows to dozens of operations, this single source of truth is what keeps main and renderer from silently drifting apart.',
          steps: [
            'Create src/shared/types.ts, imported by main, preload and renderer.',
            'Declare DTO types for each entity (MaganeDTO, YearDTO, PoojaTypeDTO, RegisterEntryDTO) with money as number.',
            'Declare the UpralliApi interface, grouping methods by entity (maganes, years, register, ...).',
            'Give each method a precise signature: typed inputs and a typed Promise return.',
            'Keep all input shapes (CreateMaganeInput, AddEntryInput) here too so both ends share them.',
            'Import UpralliApi in preload (to implement) and in the renderer (to consume) so types line up.',
          ],
          code:
            '// src/shared/types.ts — the single source of truth for the whole IPC surface\nexport interface MaganeDTO { id: number; name: string; sortOrder: number }\nexport interface YearDTO { id: number; label: string; locked: boolean }\nexport interface PoojaTypeDTO {\n  id: number; yearId: number; name: string\n  sortOrder: number; showAsColumn: boolean; rate: number | null\n}\nexport interface RegisterEntryDTO {\n  id: number; yearId: number; maganeId: number\n  personName: string; address: string; sortOrder: number\n  participations: { poojaTypeId: number; checked: boolean }[]\n  total: number // already-summed rupees, a plain number\n}\n\nexport interface CreateMaganeInput { name: string; sortOrder: number }\n\nexport interface UpralliApi {\n  maganes: {\n    list(): Promise<MaganeDTO[]>\n    create(input: CreateMaganeInput): Promise<MaganeDTO>\n    update(id: number, input: CreateMaganeInput): Promise<MaganeDTO>\n    remove(id: number): Promise<void>\n  }\n  years: {\n    list(): Promise<YearDTO[]>\n    clone(srcId: number, newLabel: string): Promise<YearDTO>\n    setLocked(id: number, locked: boolean): Promise<YearDTO>\n  }\n  register: {\n    listEntries(yearId: number, maganeId: number): Promise<RegisterEntryDTO[]>\n    setParticipation(entryId: number, poojaTypeId: number, checked: boolean): Promise<void>\n  }\n}',
          pitfalls: [
            'Sprinkling raw channel strings through the codebase so a typo only shows up at runtime.',
            'Putting Prisma Decimal in a DTO type — keep money as number | null so the renderer stays Prisma-free.',
            'Defining the interface only in renderer types, so main has no compiler check that it fulfils it.',
            'Letting input shapes diverge between preload and main; declare them once in shared and import both ends.',
            'Importing anything Node-only into src/shared (it is imported by the renderer too) — keep it pure types.',
            'Forgetting to mark methods that return nothing as Promise<void> so callers do not await a value.',
          ],
          tryIt:
            'Add a new method `count(): Promise<number>` to UpralliApi but do not implement it in preload. Watch TypeScript flag the preload object as not matching the interface — that red squiggle is the contract doing its job.',
          takeaway:
            'Describe the whole IPC surface once as the UpralliApi interface (with DTOs whose money is plain number) in src/shared/types.ts, and both main and renderer stay type-checked against the same contract.',
        },
        {
          id: 'm4-t4',
          title: 'Implementing the contract in preload (the typed window.api)',
          explain:
            'Preload builds a single api object typed as UpralliApi, where each method is just a thin ipcRenderer.invoke call on the matching channel.',
          analogy:
            'Preload is the front-desk clerk who actually fills out and pushes the slips for the volunteer. The volunteer just says "list the Maganes"; the clerk knows that means writing a `maganes:list` slip and pushing it through the hatch. Every method on `api` is one such well-rehearsed slip-pushing motion — nothing more.',
          theory:
            'The **preload script** runs in a special context that has limited Node access (it can use `ipcRenderer`) but shares the renderer\'s page. Its job here is to build an object that **implements `UpralliApi`** by mapping each method to an `ipcRenderer.invoke` on the right channel.\n\nBy annotating the object `const api: UpralliApi = { ... }`, TypeScript checks that every method exists with the correct signature. Each implementation is intentionally trivial — `list: () => ipcRenderer.invoke(\'maganes:list\')` — passing arguments straight through. The shape mirrors the entity grouping of the interface: `maganes`, `years`, `register`, each an object of methods.\n\nKeeping these wrappers thin matters: preload does **no business logic**, no validation beyond what types give, and certainly no Prisma. It is purely the typed plumbing that turns a method call into a channel message. The actual work happens in main\'s handlers; preload is the translator between "method on window.api" and "named IPC channel".',
          whyItMatters:
            'This thin, typed layer is what gives the renderer a clean object to call instead of memorising channel strings. Because it is annotated `: UpralliApi`, the compiler guarantees the renderer\'s autocomplete matches what main actually handles. Keeping it logic-free means there is exactly one place — main — where behaviour lives, so there is no risk of validation drifting between preload and main.',
          steps: [
            'Create src/preload/index.ts and import the UpralliApi type from src/shared/types.',
            'Build const api: UpralliApi = { ... } so the compiler enforces the contract.',
            'Group methods by entity, mirroring the interface (maganes, years, register).',
            'Make each method a one-line ipcRenderer.invoke(channel, ...args) pass-through.',
            'Keep preload free of business logic, validation and Prisma — it is pure plumbing.',
            'Match every channel string here exactly to the channel main registers in ipcMain.handle.',
          ],
          code:
            '// src/preload/index.ts — implement UpralliApi as thin invoke wrappers\nimport { ipcRenderer } from \'electron\'\nimport type { UpralliApi } from \'../shared/types\'\n\nconst api: UpralliApi = {\n  maganes: {\n    list: () => ipcRenderer.invoke(\'maganes:list\'),\n    create: (input) => ipcRenderer.invoke(\'maganes:create\', input),\n    update: (id, input) => ipcRenderer.invoke(\'maganes:update\', id, input),\n    remove: (id) => ipcRenderer.invoke(\'maganes:remove\', id),\n  },\n  years: {\n    list: () => ipcRenderer.invoke(\'years:list\'),\n    clone: (srcId, newLabel) => ipcRenderer.invoke(\'years:clone\', srcId, newLabel),\n    setLocked: (id, locked) => ipcRenderer.invoke(\'years:setLocked\', id, locked),\n  },\n  register: {\n    listEntries: (yearId, maganeId) => ipcRenderer.invoke(\'register:listEntries\', yearId, maganeId),\n    setParticipation: (entryId, poojaTypeId, checked) =>\n      ipcRenderer.invoke(\'register:setParticipation\', entryId, poojaTypeId, checked),\n  },\n}',
          pitfalls: [
            'Skipping the `: UpralliApi` annotation, so a wrong signature or missing method goes unnoticed.',
            'Putting validation or business logic in preload — it belongs in main where Prisma runs.',
            'Mismatching a channel string between preload and main, so the call silently has no handler.',
            'Importing Prisma or Node-heavy modules into preload; it only needs ipcRenderer and shared types.',
            'Forgetting to forward an argument (e.g. dropping `checked`), so main receives undefined.',
            'Building several little api objects instead of one cohesive object that implements the interface.',
          ],
          tryIt:
            'Temporarily change one wrapper to drop an argument, e.g. `setParticipation: (entryId, poojaTypeId) => ipcRenderer.invoke(...)`. TypeScript should complain that the implementation no longer matches UpralliApi — restore it and watch the error clear.',
          takeaway:
            'Preload implements UpralliApi as a single typed object of thin ipcRenderer.invoke wrappers — no logic, just the typed plumbing that turns method calls into channel messages.',
        },
        {
          id: 'm4-t5',
          title: 'Exposing it via contextBridge — never raw ipcRenderer',
          explain:
            'contextBridge.exposeInMainWorld(\'api\', api) safely injects the typed object into the renderer as window.api, without ever handing the renderer raw ipcRenderer.',
          analogy:
            'The hatch has a small, fixed letterbox. The clerk can only pass through the exact, pre-approved slips on the official list — never the whole keyring or the back-room phone. `contextBridge` is that letterbox: it lets you hand the renderer precisely the `api` object and nothing else. Handing over raw `ipcRenderer` would be like giving the volunteer the back-room phone to dial any extension they like — far too much power.',
          theory:
            'With `contextIsolation: ON`, the preload and the page run in **separate JavaScript worlds**, so you cannot just assign `window.api = api` and expect the page to see it safely. The supported, secure way is **`contextBridge.exposeInMainWorld(\'api\', api)`**, which copies a frozen, sanitised bridge of `api` into the page\'s `window` as `window.api`.\n\nCrucially, you expose only your **narrow** `api` — never `ipcRenderer` itself. If you exposed raw `ipcRenderer`, any script (or injected code) in the renderer could `invoke` any channel with any payload, defeating the whole sandbox. By exposing only the methods on `api`, the renderer can do exactly the operations you defined and nothing more.\n\nTo make the renderer\'s TypeScript aware of `window.api`, you **declare the global** in a `.d.ts` (or in shared types): `declare global { interface Window { api: UpralliApi } }`. Now React code gets full autocomplete on `window.api.maganes.list()` and type errors if it misuses a method, even though at runtime it is a contextBridge proxy.',
          whyItMatters:
            'This is the security keystone of the app. Exposing only the typed api keeps the attack surface to the operations you intend, while still giving the UI a clean, autocompleted entry point. Declaring window.api globally means the renderer enjoys the same type safety as if it imported a normal module — without ever importing Prisma or ipcRenderer. It is how you get both safety and developer comfort at once.',
          steps: [
            'Ensure the BrowserWindow uses contextIsolation: true and nodeIntegration: false.',
            'At the end of preload, call contextBridge.exposeInMainWorld(\'api\', api).',
            'Expose ONLY the narrow api object — never raw ipcRenderer or Node modules.',
            'Add a declaration: declare global { interface Window { api: UpralliApi } }.',
            'In the renderer, call window.api.maganes.list() and enjoy full autocomplete.',
            'Verify a random script cannot reach arbitrary channels — only api methods exist on window.',
          ],
          code:
            '// src/preload/index.ts (continued) — expose ONLY the typed api\nimport { contextBridge } from \'electron\'\n// ... api defined as in t4 ...\ncontextBridge.exposeInMainWorld(\'api\', api)\n\n// src/renderer/window.d.ts — teach TS about window.api\nimport type { UpralliApi } from \'../shared/types\'\ndeclare global {\n  interface Window {\n    api: UpralliApi\n  }\n}\nexport {}\n\n// Now in any .tsx file the renderer has full types + autocomplete:\nconst years = await window.api.years.list() // YearDTO[]',
          pitfalls: [
            'Exposing raw ipcRenderer (or its whole surface) — that lets the renderer call any channel, a serious hole.',
            'Trying window.api = api directly with contextIsolation on — the page world will not see it.',
            'Forgetting the declare global block, so window.api is typed as any and you lose all safety.',
            'Turning contextIsolation off to "simplify" — it removes the very boundary contextBridge protects.',
            'Exposing functions that close over Node objects in a way that leaks capabilities into the page.',
            'Naming the global something the app already uses, colliding with another window property.',
          ],
          tryIt:
            'After exposing api, open the renderer devtools and type `window.api` then `window.ipcRenderer`. Confirm api exists and ipcRenderer is undefined — the renderer has exactly the surface you granted, no more.',
          takeaway:
            'contextBridge.exposeInMainWorld(\'api\', api) safely injects only your typed api as window.api under contextIsolation; declare it on Window for full renderer types, and never expose raw ipcRenderer.',
        },
        {
          id: 'm4-t6',
          title: 'Channel naming conventions',
          explain:
            'Name channels entity:action — maganes:list, register:listEntries, register:setParticipation — so the surface stays organised and collision-free as it grows.',
          analogy:
            'It is the filing system for the office hatch. Every slip is labelled by department and task: "maganes / list", "register / set participation". Anyone can glance at a slip and know which back-room desk handles it and what it asks. Without that convention the hatch fills with ambiguous slips like "getData" and "update2", and chaos follows.',
          theory:
            'As the API grows past a handful of operations, **consistent channel names** prevent collisions and confusion. The convention used throughout Upralli Seva is **`entity:action`**, lowercase, with the entity first: `maganes:list`, `maganes:create`, `years:clone`, `years:setLocked`, `register:listEntries`, `register:setParticipation`, `poojaTypes:list`, `backups:create`, `reports:yearSummary`.\n\nThis mirrors the grouping in `UpralliApi` exactly — the `maganes` group of methods maps to `maganes:*` channels — so there is a clean one-to-one trace from a renderer call (`window.api.register.setParticipation`) through preload (`invoke(\'register:setParticipation\', ...)`) to the main handler (`ipcMain.handle(\'register:setParticipation\', ...)`). Reading any one tells you the other two.\n\nKeep action verbs predictable: `list`, `create`, `update`, `remove`, plus domain-specific ones like `clone`, `setLocked`, `setParticipation`, `reorder`, `yearTotals`. A small, consistent vocabulary makes the whole surface learnable. Because Electron throws if you register the same channel twice, a disciplined naming scheme also naturally avoids accidental duplicate handlers.',
          whyItMatters:
            'A few months in, Upralli Seva will have dozens of channels across six handler modules. Without a convention you get duplicate or vague channel names, the "second handler for X" startup crash, and slow debugging. With entity:action, you can predict a channel from a feature, grep for all of an entity\'s operations at once, and keep preload, main and the interface trivially in sync.',
          steps: [
            'Adopt the entity:action pattern, lowercase, entity first (maganes:list).',
            'Mirror the UpralliApi entity groups exactly so each group maps to one channel prefix.',
            'Use a small, consistent verb set: list, create, update, remove, plus domain verbs.',
            'Keep the same channel string identical in preload invoke and main handle.',
            'Group handler files by entity (maganes.ipc.ts) so each owns its channel prefix.',
            'Rely on Electron\'s duplicate-handler error as a guardrail against accidental clashes.',
          ],
          code:
            '// The channel vocabulary, grouped by entity (matches UpralliApi + handler files):\n//\n//   maganes:list        maganes:create     maganes:update     maganes:remove\n//   years:list          years:create       years:clone        years:setLocked\n//   poojaTypes:list      poojaTypes:create  poojaTypes:reorder\n//   register:yearTotals  register:listEntries\n//   register:addEntry    register:updateEntry  register:removeEntry\n//   register:reorder     register:setParticipation\n//   backups:create       backups:restore\n//   reports:yearSummary\n//\n// Trace one operation cleanly:\n//   window.api.register.setParticipation(...)            // renderer\n//   ipcRenderer.invoke(\'register:setParticipation\', ...)  // preload\n//   ipcMain.handle(\'register:setParticipation\', ...)      // main',
          pitfalls: [
            'Vague names like \'getData\' or \'update2\' that hide which entity and action they mean.',
            'Inconsistent casing or order (\'List:Maganes\' vs \'maganes:list\') that breaks the mental model.',
            'Reusing a channel name for two different operations, triggering Electron\'s second-handler error.',
            'Letting channel names drift from the UpralliApi grouping so the one-to-one trace is lost.',
            'Inventing a new verb per feature (fetch, get, retrieve, load) instead of a small shared vocabulary.',
            'Scattering an entity\'s channels across many files instead of one handler module per entity.',
          ],
          tryIt:
            'Grep your codebase for \'maganes:\' and confirm you find exactly the preload wrappers and the main handlers, nothing stray. Then try registering register:listEntries twice and watch Electron refuse to start.',
          takeaway:
            'Name channels entity:action to mirror UpralliApi, keep a small verb vocabulary, and one handler module per entity — giving a clean, collision-free trace from window.api through preload to main.',
        },
      ],
    },
    {
      id: 'm4-s2',
      title: 'The data layer in main (Prisma)',
      topics: [
        {
          id: 'm4-t7',
          title: 'IPC handler modules that call Prisma',
          explain:
            'Organise main\'s handlers into one module per entity — maganes, years, poojaTypes, register, backups, reports — each registering its channels and calling Prisma.',
          analogy:
            'The back room is not one overwhelmed clerk; it is several specialist desks. One desk handles all Magane slips, another all Year slips, another the register. Each desk knows its own corner of the register cupboard. Splitting main\'s handlers into modules per entity is setting up those specialist desks so no single file becomes an unreadable pile of slips.',
          theory:
            'Putting every `ipcMain.handle` in one giant file becomes unmanageable fast. Instead, create one **handler module per entity**: `maganes.ipc.ts`, `years.ipc.ts`, `poojaTypes.ipc.ts`, `pooja-register.ipc.ts`, `backups.ipc.ts`, `reports.ipc.ts`. Each exports a `register...Handlers(db)` function that registers that entity\'s channels and calls Prisma through the passed-in `db()` accessor.\n\nEach handler is the same shape: receive arguments, call the relevant Prisma method (`db().magane.findMany`, `db().magane.create`), and **map the result to a plain DTO** before returning (the Decimal rule, t8). Reads use `findMany`/`findUnique`; writes use `create`/`update`/`delete`; multi-row operations use `db().$transaction` (t10).\n\nThis modular layout mirrors the `UpralliApi` grouping and the `entity:action` channel convention, so the whole stack lines up: a `maganes` group in the interface, a `maganes.ipc.ts` module in main, `maganes:*` channels between them. Each module owns its DTO mapping functions (`toMagane`, `toYear`, `toPoojaType`), keeping the serialization rules close to the queries that need them.',
          whyItMatters:
            'A clean per-entity layout is what keeps main maintainable as features pile up. When the participation grid misbehaves, you open pooja-register.ipc.ts and everything about that feature — channels, queries, DTO mapping, transactions — is in one place. It also makes wiring (t11) tidy: app startup just calls each module\'s register function once.',
          steps: [
            'Create one .ipc.ts module per entity under src/main/ipc.',
            'Export a register...Handlers(db) function from each that registers its channels.',
            'Inside, call ipcMain.handle for each entity:action this module owns.',
            'Call Prisma via the passed db() accessor — findMany/create/update/delete/$transaction.',
            'Map every returned row to a plain DTO with a local to...() function (see t8).',
            'Keep the module\'s DTO mappers and queries together so serialization stays local.',
          ],
          code:
            '// src/main/ipc/maganes.ipc.ts\nimport { ipcMain } from \'electron\'\nimport type { PrismaClient } from \'@prisma/client\'\nimport type { MaganeDTO, CreateMaganeInput } from \'../../shared/types\'\n\nfunction toMagane(m: { id: number; name: string; sortOrder: number }): MaganeDTO {\n  return { id: m.id, name: m.name, sortOrder: m.sortOrder }\n}\n\nexport function registerMaganeHandlers(db: () => PrismaClient): void {\n  ipcMain.handle(\'maganes:list\', async () =>\n    (await db().magane.findMany({ orderBy: { sortOrder: \'asc\' } })).map(toMagane),\n  )\n  ipcMain.handle(\'maganes:create\', async (_e, input: CreateMaganeInput) =>\n    toMagane(await db().magane.create({ data: input })),\n  )\n  ipcMain.handle(\'maganes:update\', async (_e, id: number, input: CreateMaganeInput) =>\n    toMagane(await db().magane.update({ where: { id }, data: input })),\n  )\n  ipcMain.handle(\'maganes:remove\', async (_e, id: number) => {\n    await db().magane.delete({ where: { id } })\n  })\n}',
          pitfalls: [
            'Dumping all handlers into one main/index.ts that grows into thousands of unreadable lines.',
            'Hard-coding a global Prisma import in each module instead of receiving the db() accessor.',
            'Returning the raw Prisma row instead of mapping to a DTO (Decimal will bite — see t8).',
            'Mixing entities in one module so channels and DTOs for unrelated features tangle together.',
            'Forgetting to actually call the register...Handlers function at startup, so channels go missing.',
            'Letting two modules register overlapping channels, causing the second-handler crash.',
          ],
          tryIt:
            'Create maganes.ipc.ts with the four handlers above and a years.ipc.ts with its own. Notice how each file reads like a small, self-contained desk — you can understand one entity without scrolling past the others.',
          takeaway:
            'Split main\'s data layer into one register...Handlers(db) module per entity; each registers its entity:action channels, calls Prisma via db(), and maps rows to DTOs locally.',
        },
        {
          id: 'm4-t8',
          title: 'THE Decimal to number rule: map rows to plain DTOs',
          explain:
            'Prisma returns money as a Decimal object, which does not survive IPC cleanly, so every handler must convert Decimal to number (and null stays null) before returning.',
          analogy:
            'A Prisma `Decimal` is like a special calculator the back room uses internally — it gives exact answers but you cannot post the calculator itself through the hatch. Before sending a number out, the clerk reads the figure off the calculator and writes a plain digit on the slip. `dec(v)` is that "read it off and write a plain number" step. Forget it, and the slip arrives blank or garbled.',
          theory:
            'In the Prisma schema, money fields (a pooja\'s `rate`, an entry\'s computed `total`) are typed `Decimal` so rupee maths is exact — no floating-point drift. But a `Prisma.Decimal` is a **class instance**, not a primitive. When Electron tries to clone it across IPC it does not serialize to a clean number; you get an empty object, a string, or a clone error depending on the path. The renderer cannot rely on it.\n\nThe rule is absolute: **never return a row containing a Decimal across IPC.** Instead, map each row to a plain DTO and convert money with a tiny helper: `function dec(v: Prisma.Decimal | null): number | null { return v == null ? null : Number(v) }`. `null` stays `null`; a real Decimal becomes a plain JavaScript `number` via `Number(v)`. Now the DTO is fully serializable.\n\nEach entity gets a mapping function that applies `dec` to its money fields: `toPoojaType(p)` maps `rate` through `dec`, `toRegisterEntry(e)` maps the summed `total`. These functions are the single chokepoint where Decimal becomes number, so the renderer (and the `UpralliApi` DTOs) only ever see plain numbers — exactly matching the `number | null` types declared in s1.',
          whyItMatters:
            'This is the single most common bug in an Electron+Prisma money app. Skip the mapping and the participation grid shows blank or "[object Object]" totals, or the whole call rejects with a clone error — and it is maddening to debug because the Prisma query is correct. Centralising Decimal->number in tiny to...() functions makes the leak impossible and keeps the renderer truly Prisma-free.',
          steps: [
            'Type money fields as Decimal in the Prisma schema for exact rupee maths.',
            'Write a helper: dec(v) returns null if v is null, else Number(v).',
            'For each entity, write a to...() mapper that runs every money field through dec.',
            'In every handler, return mapper(row) (or rows.map(mapper)) — never the raw Prisma row.',
            'Confirm the DTO types in shared/types declare money as number | null, not Decimal.',
            'Spot-check in the renderer that totals are real numbers you can add, not objects.',
          ],
          code:
            '// src/main/ipc/pooja-register.ipc.ts — the Decimal->number chokepoint\nimport { Prisma } from \'@prisma/client\'\nimport type { PoojaTypeDTO } from \'../../shared/types\'\n\n// null stays null; a Decimal becomes a plain number\nfunction dec(v: Prisma.Decimal | null): number | null {\n  return v == null ? null : Number(v)\n}\n\nfunction toPoojaType(p: {\n  id: number; yearId: number; name: string\n  sortOrder: number; showAsColumn: boolean; rate: Prisma.Decimal | null\n}): PoojaTypeDTO {\n  return {\n    id: p.id,\n    yearId: p.yearId,\n    name: p.name,\n    sortOrder: p.sortOrder,\n    showAsColumn: p.showAsColumn,\n    rate: dec(p.rate), // ← the rule: never let a Decimal cross IPC\n  }\n}',
          pitfalls: [
            'Returning the raw Prisma row, so a Decimal rate/total arrives as {} or "[object Object]" in the UI.',
            'Using +v or parseFloat without a null guard, turning a null rate into NaN.',
            'Mapping Decimal to number in the renderer instead of main — the bad value has already crossed by then.',
            'Typing the DTO field as Decimal, which would force the renderer to import Prisma types.',
            'Forgetting one money field in a mapper, so most totals work but one column is mysteriously broken.',
            'Using JavaScript floats for the rupee maths itself; keep Decimal in main, convert only at the IPC edge.',
          ],
          tryIt:
            'Return a pooja row WITHOUT the toPoojaType mapping and log rate in the renderer — see the broken value. Then add dec/toPoojaType and confirm rate is now a clean number you can total.',
          takeaway:
            'Prisma Decimal is not IPC-serializable, so every handler maps rows to plain DTOs with dec(v)=v==null?null:Number(v); the renderer only ever sees money as a plain number.',
        },
        {
          id: 'm4-t9',
          title: 'Returning only serializable plain objects across IPC',
          explain:
            'Beyond Decimal, anything that crosses the hatch must be a plain serializable value — plain objects, arrays, primitives — so prefer ISO strings for dates and never ship Prisma instances.',
          analogy:
            'The hatch letterbox only accepts flat paper: words, numbers, simple lists. You cannot post a live person, a ringing phone, or a calculator through it. A Prisma model instance with its methods, a Decimal, even a Date with timezone quirks are "not flat paper." Flatten everything to plain notes — strings, numbers, simple objects — before it goes through.',
          theory:
            'Electron IPC serializes values with the **structured clone algorithm**. It handles plain objects, arrays, strings, numbers, booleans, `null`, and a few built-ins — but **not** class instances with behaviour, functions, or anything carrying a prototype it does not recognise. A Prisma model row is, in practice, a plain object for its data fields, but its `Decimal` fields are class instances (t8), and you should treat the whole thing as "do not return directly."\n\n**Dates** are a softer case: structured clone can carry a `Date`, so it often "works," but it is cleaner and more predictable to convert dates to **ISO strings** (`d.toISOString()`) in the DTO. That sidesteps timezone surprises, keeps the DTO trivially JSON-friendly (handy for backups and logs), and makes the contract explicit — the renderer gets a `string` it can parse, not a `Date` that may or may not survive every path.\n\nThe discipline, then, is: build each DTO from primitives and plain nested objects/arrays only. Numbers for money (via `dec`), strings for dates, booleans for flags, plain arrays for collections (like an entry\'s `participations`). If a value is anything richer, flatten it in the mapper. The renderer then receives a clean, predictable shape every time.',
          whyItMatters:
            'Treating the IPC boundary as "plain data only" eliminates a whole category of intermittent, hard-to-reproduce bugs where a value works in one code path and breaks in another. ISO-string dates make backups, exports and the participation grid behave consistently, and keep the renderer free of any Prisma or Node date quirks. It is the same Prisma-free renderer goal as the Decimal rule, applied to every field.',
          steps: [
            'Treat the IPC boundary as: plain objects, arrays and primitives only.',
            'Never return a Prisma model instance directly — always build a DTO from its fields.',
            'Convert money with dec (Decimal->number) as in t8.',
            'Convert dates to ISO strings in the mapper (d.toISOString()) for predictability.',
            'Represent collections as plain arrays of plain objects (e.g. participations[]).',
            'Keep booleans and strings as-is; flatten anything richer before returning.',
          ],
          code:
            '// A fully-serializable Year DTO mapper: dates -> ISO strings, no Prisma instance leaks\nimport type { YearDTO } from \'../../shared/types\'\n\nfunction toYear(y: {\n  id: number; label: string; locked: boolean; createdAt: Date\n}): YearDTO & { createdAt: string } {\n  return {\n    id: y.id,\n    label: y.label,\n    locked: y.locked,\n    createdAt: y.createdAt.toISOString(), // ISO string, not a raw Date\n  }\n}\n\n// register:listEntries returns plain nested data only:\n//   { id, personName, address, total: 250, participations: [ { poojaTypeId: 7, checked: true } ] }\n// every field a primitive, array, or plain object — clone-safe across IPC',
          pitfalls: [
            'Returning the raw Prisma object and assuming "it is just data" — its Decimal fields are class instances.',
            'Shipping a Date and relying on it surviving every IPC path; prefer an ISO string for predictability.',
            'Including functions or getters on a DTO — structured clone cannot carry them and the call rejects.',
            'Nesting a Prisma relation result without mapping it, so a nested Decimal/Date sneaks across.',
            'Parsing ISO strings back into Dates in main; do date formatting in the renderer from the string.',
            'Returning Maps or Sets across IPC where a plain object or array is expected by the contract.',
          ],
          tryIt:
            'Return a Year with createdAt as a raw Date, then as toISOString(). Compare what the renderer receives in each case and pick the one you can predictably format.',
          takeaway:
            'Only plain serializable values cross IPC: build DTOs from primitives, plain objects and arrays, convert money with dec and dates to ISO strings, and never return a Prisma instance.',
        },
        {
          id: 'm4-t10',
          title: 'Validating inputs and transactions for multi-row ops',
          explain:
            'Validate arguments in main before touching Prisma, and wrap multi-row operations like clone-year or reorder in db().$transaction so they are all-or-nothing.',
          analogy:
            'The clerk does not blindly act on a slip — they first check it makes sense (a year label is not blank, the source year exists). And when a job means many register entries at once — cloning a whole year, or renumbering a Magane\'s households — they do it as a single bookkeeping pass: either every line is rewritten or none is. You never want half a cloned year sitting in the cupboard.',
          theory:
            'The renderer is typed, but types are not runtime validation — a `clone` could still arrive with an empty `newLabel` or a non-existent `srcId`. Main is the **trust boundary**: validate inputs here (non-empty strings, positive ids, existence checks) and throw a clear `Error` if something is wrong. That thrown error rejects the renderer\'s Promise (t12 covers surfacing it).\n\nMany operations touch **multiple rows** and must be atomic. Cloning a year copies its pooja types and (optionally) its entries; a `reorder` rewrites `sortOrder` on many rows. If such an operation half-completes, the register is corrupt. Prisma\'s **`db().$transaction`** runs a set of operations as one unit: either all commit or all roll back. Use the **interactive** form `db().$transaction(async (tx) => { ... use tx ... })` when later steps depend on earlier results (e.g. you need the new year\'s id before copying its pooja types).\n\nInside the transaction, use the `tx` client (not `db()`) for every query so they share the transaction. A clone-year handler, for instance: validate `newLabel` and that `srcId` exists, then in one `$transaction` create the new Year, copy each PoojaType to it, and copy entries with reset participations — all or nothing.',
          whyItMatters:
            'Validation in main protects the database from bad input no matter what the UI does, and gives the user a clear message instead of a cryptic Prisma error. Transactions protect data integrity: a half-cloned year or a partially-reordered list would silently corrupt the committee\'s register. Together they make destructive, multi-row operations safe to offer in the UI.',
          steps: [
            'Validate every input in the handler before calling Prisma; throw a clear Error on bad data.',
            'Check referenced rows exist (e.g. srcId year) so you fail early with a friendly message.',
            'Identify multi-row operations: clone-year, reorder, anything writing several rows.',
            'Wrap them in db().$transaction so they are atomic — all commit or all roll back.',
            'Use the interactive form async (tx) => when later steps need earlier results (new id).',
            'Always query with tx inside the callback so every step joins the same transaction.',
          ],
          code:
            '// src/main/ipc/years.ipc.ts — validate, then clone a year atomically\nimport { ipcMain } from \'electron\'\nimport type { PrismaClient } from \'@prisma/client\'\nimport { toYear } from \'./mappers\'\n\nexport function registerYearHandlers(db: () => PrismaClient): void {\n  ipcMain.handle(\'years:clone\', async (_e, srcId: number, newLabel: string) => {\n    // 1) validate in main — the trust boundary\n    if (!newLabel || !newLabel.trim()) throw new Error(\'Year label cannot be empty.\')\n    const src = await db().year.findUnique({ where: { id: srcId } })\n    if (!src) throw new Error(\'Source year not found.\')\n\n    // 2) all-or-nothing multi-row clone\n    const year = await db().$transaction(async (tx) => {\n      const created = await tx.year.create({ data: { label: newLabel.trim(), locked: false } })\n      const poojas = await tx.poojaType.findMany({ where: { yearId: srcId } })\n      for (const p of poojas) {\n        await tx.poojaType.create({\n          data: { yearId: created.id, name: p.name, rate: p.rate, sortOrder: p.sortOrder, showAsColumn: p.showAsColumn },\n        })\n      }\n      return created\n    })\n    return toYear(year)\n  })\n}',
          pitfalls: [
            'Trusting renderer types as validation — runtime values still need checking in main.',
            'Doing a multi-row clone/reorder with separate awaits and no transaction, risking a half-done state.',
            'Using db() instead of tx inside the $transaction callback, so those queries escape the transaction.',
            'Throwing vague errors (or none), leaving the user with a cryptic Prisma stack instead of a message.',
            'Forgetting existence checks, so a clone of a deleted srcId fails deep inside the transaction.',
            'Putting heavy non-DB work inside the transaction, holding it open longer than needed.',
          ],
          tryIt:
            'Call years:clone with an empty label and confirm it throws before any write. Then clone a real year and verify the new year has all the source\'s pooja types — and that forcing an error mid-clone leaves nothing partially created.',
          takeaway:
            'Main is the trust boundary: validate inputs and throw clear errors, and wrap multi-row operations like clone-year and reorder in db().$transaction (using tx) so they are atomic.',
        },
        {
          id: 'm4-t11',
          title: 'Wiring handlers after app.whenReady and passing in db()',
          explain:
            'Register all handler modules once, after app.whenReady() and after the embedded Postgres is up, passing each module the db() accessor.',
          analogy:
            'Before the office opens to the public, the manager makes sure the back room is unlocked and the register cupboard is accessible, then assigns each specialist desk its slips. Only after every desk is staffed does the front hatch open. Wiring handlers after the app and database are ready is opening the office in the right order.',
          theory:
            'Handlers must be registered, and the database must be reachable, **before** the renderer can call anything. The correct sequence in `src/main/index.ts` is: `await app.whenReady()`, ensure the **embedded Postgres** is started and Prisma is connected (so `db()` returns a working client), **then** register every handler module, and finally create the BrowserWindow that loads the renderer.\n\nEach handler module exposes a `register...Handlers(db)` function (t7). Wiring is just calling each once and passing the **`db()` accessor** — the function that returns the singleton PrismaClient. Passing the accessor rather than a live client means each module always gets the current, connected instance, and there is exactly one Prisma client for the whole app.\n\nOrder matters: register handlers before the window exists, so by the time React mounts and fires its first `useQuery`, every channel already has a handler. Doing it the other way risks an early `invoke` hitting a channel with no handler. Because each module registers distinct `entity:action` channels (t6), calling them all once produces no duplicates.',
          whyItMatters:
            'This wiring is the assembly point where s1\'s contract and s2\'s data layer come together and actually run. Get the order wrong — window before handlers, or before Postgres is up — and the app greets the user with failed first requests. Getting it right means the very first screen loads its data cleanly, and there is a single, obvious place to see everything the app can do.',
          steps: [
            'In src/main/index.ts, await app.whenReady() first.',
            'Start the embedded Postgres and connect Prisma so db() returns a working client.',
            'Call each register...Handlers(db) once, passing the db() accessor.',
            'Only after handlers are registered, create the BrowserWindow that loads the renderer.',
            'Confirm the renderer\'s first useQuery hits an already-registered channel.',
            'Keep this wiring in one place so the full set of capabilities is visible at a glance.',
          ],
          code:
            '// src/main/index.ts — open the office in the right order\nimport { app, BrowserWindow } from \'electron\'\nimport { startEmbeddedPostgres } from \'./db/embedded\'\nimport { db } from \'./db\'\nimport { registerMaganeHandlers } from \'./ipc/maganes.ipc\'\nimport { registerYearHandlers } from \'./ipc/years.ipc\'\nimport { registerRegisterHandlers } from \'./ipc/pooja-register.ipc\'\n\nasync function bootstrap(): Promise<void> {\n  await app.whenReady()\n  await startEmbeddedPostgres() // %LOCALAPPDATA%\\UpralliSeva, then migrate/connect Prisma\n\n  // register every entity\'s handlers BEFORE the window loads the renderer\n  registerMaganeHandlers(db)\n  registerYearHandlers(db)\n  registerRegisterHandlers(db)\n\n  const win = new BrowserWindow({\n    webPreferences: { contextIsolation: true, nodeIntegration: false, preload: PRELOAD_PATH },\n  })\n  await win.loadURL(RENDERER_URL)\n}\n\nbootstrap()',
          pitfalls: [
            'Creating the BrowserWindow before registering handlers, so the first invoke finds no handler.',
            'Registering handlers before the embedded Postgres is up, so db() is not yet connected.',
            'Calling a register...Handlers function twice, triggering the second-handler crash.',
            'Passing a live PrismaClient instead of the db() accessor, risking a stale or premature client.',
            'Skipping await on app.whenReady(), wiring Electron APIs before the app is ready.',
            'Spreading wiring across many files so no single place lists all the app\'s capabilities.',
          ],
          tryIt:
            'Move the BrowserWindow creation ABOVE the register...Handlers calls and load a screen that fetches Maganes. Watch the first request fail with no handler, then restore the order and see it succeed.',
          takeaway:
            'After app.whenReady() and once embedded Postgres is connected, register every entity\'s handlers (passing the db() accessor) before creating the window — so the renderer\'s first request always finds its channel.',
        },
      ],
    },
    {
      id: 'm4-s3',
      title: 'Calling the API from React with TanStack Query',
      topics: [
        {
          id: 'm4-t12',
          title: 'A renderer api.ts and error handling that surfaces a friendly message',
          explain:
            'Give the renderer a tiny api.ts that just re-exports window.api, and let handler errors thrown in main reject the Promise so the UI can show a friendly message.',
          analogy:
            'The volunteer should not keep reaching into the hatch directly all day; it helps to have one labelled tray on the desk — "use this for all register requests." A thin `api.ts` is that tray: a single, tidy place the React code imports. And when the back room sends back "Year label cannot be empty," the volunteer shows that exact note to the visitor rather than a scary internal error.',
          theory:
            'In the renderer, create a small **`src/renderer/api.ts`** that simply exposes `window.api` (optionally with a guard for tests). Components and hooks import from this module rather than touching `window` directly, so there is one seam to mock in tests and one import to update if the surface changes. It does no logic — it is the renderer-side counterpart to preload\'s thin wrappers.\n\n**Error handling** flows naturally from invoke/handle. When a main handler throws (e.g. the validation in t10), Electron rejects the renderer\'s `invoke` Promise. With TanStack Query (t13), that rejection lands in the query/mutation\'s `error` state. The message you throw in main — `new Error(\'Year label cannot be empty.\')` — becomes `error.message` in the renderer, so throwing **friendly, user-facing messages in main** pays off directly in the UI.\n\nThe pattern is: main validates and throws clear messages; the renderer\'s `api.ts` passes calls straight through; TanStack Query captures rejections; and components render `error.message`. The renderer stays blissfully unaware of Prisma, channels, or IPC mechanics — it just calls `api.years.clone(...)` and handles success or a readable error.',
          whyItMatters:
            'A single api.ts keeps the renderer decoupled and testable — you mock one module, not the global window. Surfacing the main-thrown message means users see "Year label cannot be empty" instead of a Prisma stack trace, which is the difference between a usable app and a frustrating one. This wiring is what makes the loading/empty/error states in t14 trivial to implement.',
          steps: [
            'Create src/renderer/api.ts that exports window.api (with a small guard if helpful).',
            'Have all components and hooks import api from this module, never touch window directly.',
            'In main handlers, throw new Error with a clear, user-facing message on bad input.',
            'Rely on Electron to reject the renderer Promise when a handler throws.',
            'Let TanStack Query capture that rejection into its error state (t13).',
            'Render error.message in the UI so the user sees the friendly text from main.',
          ],
          code:
            '// src/renderer/api.ts — one tidy seam over window.api\nimport type { UpralliApi } from \'../shared/types\'\n\nexport const api: UpralliApi = window.api\n\n// Anywhere in the renderer:\nimport { api } from \'./api\'\n\ntry {\n  const year = await api.years.clone(srcId, \'\')   // empty label\n} catch (err) {\n  // main threw: new Error(\'Year label cannot be empty.\')\n  // err.message is exactly that friendly text — show it to the user\n  console.log((err as Error).message) // "Year label cannot be empty."\n}',
          pitfalls: [
            'Calling window.api directly all over the renderer, making the surface hard to mock or swap.',
            'Throwing raw Prisma errors in main, so the user sees a cryptic stack instead of a clear message.',
            'Swallowing errors in api.ts (try/catch that hides them), so TanStack Query never sees the rejection.',
            'Putting business logic in api.ts; keep it a thin pass-through like preload.',
            'Assuming a rejected invoke crashes the app — it just rejects the Promise for the caller to handle.',
            'Building user-facing message text in the renderer when main already knows the precise reason.',
          ],
          tryIt:
            'Call api.years.clone(1, \'\') in a component and log the caught error.message. Confirm it reads exactly the message you threw in the main handler — your UI text comes for free from the data layer.',
          takeaway:
            'A thin renderer api.ts over window.api gives one mockable seam; errors thrown in main reject the invoke Promise, so the friendly message you throw becomes the error text the UI shows.',
        },
        {
          id: 'm4-t13',
          title: 'useQuery for reads, useMutation + invalidateQueries for writes',
          explain:
            'Wrap reads in useQuery keyed by their inputs, wrap writes in useMutation, and call queryClient.invalidateQueries after a write so the affected reads refetch.',
          analogy:
            'TanStack Query is the volunteer\'s smart notepad. When they ask "list the Maganes," it writes the answer down under a labelled tab (the query key) and reuses it instead of asking again. When they add a household (a mutation), the notepad knows that the "households for this year and Magane" tab is now stale, crosses it out, and re-asks the hatch automatically. You never manually re-fetch — invalidation does it.',
          theory:
            '**TanStack Query** manages server-state in the renderer: caching, deduping, loading/error tracking, and refetching. A read becomes a **`useQuery`** with a **query key** (an array uniquely identifying the data) and a **query function** that calls `api`: `useQuery({ queryKey: [\'maganes\'], queryFn: () => api.maganes.list() })`. Keyed reads with arguments include those arguments in the key: `[\'register\', yearId, maganeId]` for `listEntries(yearId, maganeId)`.\n\nA write becomes a **`useMutation`** whose `mutationFn` calls the corresponding `api` write. On success you tell the cache which reads are now stale via **`queryClient.invalidateQueries`**, and TanStack Query refetches them. Add a person? Invalidate `[\'register\', yearId, maganeId]` so the grid reloads with the new household. This keeps the UI consistent without manual refetch plumbing.\n\nThe whole renderer therefore stays **DB-agnostic**: queries and mutations only ever call `api` (which calls `window.api`, which invokes IPC, which runs Prisma in main). React never knows a database exists — it knows `useQuery`, `useMutation`, query keys, and `api`. That is the clean separation s1 promised, realised in the UI layer.',
          whyItMatters:
            'useQuery/useMutation give you caching, dedup, and loading/error states for free, so screens are fast and consistent without hand-rolled state. invalidateQueries is the one-line way to keep the UI truthful after a write — add or edit a household and the list updates itself. And because everything routes through api, the renderer never couples to Prisma, fulfilling the architecture\'s core promise.',
          steps: [
            'Wrap each read in useQuery with a query key array and a queryFn that calls api.',
            'Include arguments in the key for parameterised reads, e.g. [\'register\', yearId, maganeId].',
            'Wrap each write in useMutation whose mutationFn calls the matching api write.',
            'In the mutation\'s onSuccess, call queryClient.invalidateQueries for the affected keys.',
            'Let TanStack Query refetch the invalidated reads automatically — no manual refetch.',
            'Keep queryFn/mutationFn pointed only at api, so the renderer stays DB-agnostic.',
          ],
          code:
            '// src/renderer/hooks/useRegister.ts\nimport { useQuery, useMutation, useQueryClient } from \'@tanstack/react-query\'\nimport { api } from \'../api\'\nimport type { CreateMaganeInput } from \'../../shared/types\'\n\n// READ: list households for a given year + magane\nexport function useEntries(yearId: number, maganeId: number) {\n  return useQuery({\n    queryKey: [\'register\', yearId, maganeId],\n    queryFn: () => api.register.listEntries(yearId, maganeId),\n  })\n}\n\n// WRITE: add a Magane, then refetch the maganes list\nexport function useCreateMagane() {\n  const qc = useQueryClient()\n  return useMutation({\n    mutationFn: (input: CreateMaganeInput) => api.maganes.create(input),\n    onSuccess: () => {\n      qc.invalidateQueries({ queryKey: [\'maganes\'] }) // refetch the list\n    },\n  })\n}',
          pitfalls: [
            'Omitting arguments from the query key, so two different (year, magane) views share one cache entry.',
            'Forgetting invalidateQueries after a mutation, so the list shows stale data until a manual reload.',
            'Invalidating the wrong key, so the visible screen never refetches after a write.',
            'Calling api outside useQuery/useMutation and re-implementing caching/loading by hand.',
            'Letting queryFn import Prisma types or reach past api, coupling the renderer to the DB.',
            'Using one mutation to write but never reflecting the change, leaving the UI and DB out of sync.',
          ],
          tryIt:
            'Build useEntries and useCreateMagane, add a Magane through the mutation, and watch the maganes list refresh on its own thanks to invalidateQueries — no manual refetch call anywhere.',
          takeaway:
            'Reads are useQuery keyed by their inputs; writes are useMutation that invalidateQueries on success so reads refetch — and because both only call api, the renderer stays fully DB-agnostic.',
        },
        {
          id: 'm4-t14',
          title: 'Loading, empty and error states for a trustworthy UI',
          explain:
            'Every screen handles three states from useQuery — isLoading, an empty result, and isError — so the user always knows what is happening.',
          analogy:
            'A good front desk never leaves a visitor staring at a blank counter. While checking the register it says "one moment"; if there are no households yet for this Magane, it says "none recorded — add the first"; if the back room reports a problem, it shows the exact note rather than freezing. Those three responses are loading, empty, and error.',
          theory:
            'A `useQuery` exposes everything a screen needs to be honest: **`isLoading`** (or `isPending`) while the first fetch runs, **`isError`** with an `error` object if it failed, and `data` when it succeeds. A robust component branches on all three before rendering the happy path.\n\nThe **empty** state is distinct from loading: the fetch succeeded but returned an empty array — no households yet for this year and Magane. Showing a clear "none yet, add the first" message (rather than a blank grid or a stuck spinner) tells the user the screen works and what to do next. The **error** state renders `error.message`, which — thanks to t12 — is the friendly text thrown in main.\n\nSo the standard shape is: if `isLoading`, show a spinner/skeleton; if `isError`, show `error.message` (and maybe a retry); if `data` is empty, show an empty-state prompt; otherwise render the data. This handful of branches, applied to every screen, is what makes the offline app feel solid even though every read is an async IPC round-trip to Prisma.',
          whyItMatters:
            'Unhandled async states are how apps feel broken: infinite spinners, blank screens, silent failures. Handling loading, empty and error explicitly means the committee always sees a sensible state — and the error path reuses the friendly messages from main, so failures are informative, not alarming. It is a small, repeatable pattern that dramatically raises the perceived quality of the app.',
          steps: [
            'Destructure data, isLoading (or isPending), isError and error from useQuery.',
            'If isLoading, render a spinner or skeleton so the screen is never blank.',
            'If isError, render error.message (and optionally a retry button).',
            'If data is an empty array, render a clear empty-state prompt to add the first item.',
            'Otherwise render the data (the participation grid, the list).',
            'Reuse this branching pattern consistently across every data screen.',
          ],
          code:
            '// src/renderer/screens/RegisterGrid.tsx\nimport { useEntries } from \'../hooks/useRegister\'\n\nexport function RegisterGrid({ yearId, maganeId }: { yearId: number; maganeId: number }) {\n  const { data, isLoading, isError, error } = useEntries(yearId, maganeId)\n\n  if (isLoading) return <p>Loading register…</p>\n  if (isError) return <p className="error">{(error as Error).message}</p>\n  if (!data || data.length === 0)\n    return <p>No households recorded for this Magane yet. Add the first one.</p>\n\n  return (\n    <table>\n      <tbody>\n        {data.map((e) => (\n          <tr key={e.id}>\n            <td>{e.personName}</td>\n            <td>₹{e.total.toLocaleString(\'en-IN\')}</td>\n          </tr>\n        ))}\n      </tbody>\n    </table>\n  )\n}',
          pitfalls: [
            'Rendering data before checking isLoading, so you read undefined on first render and crash.',
            'Treating an empty array as an error or as still-loading, leaving the user confused.',
            'Showing a raw error object instead of error.message, so the friendly text is lost.',
            'Forgetting an empty state, so a new Magane shows a blank grid with no guidance.',
            'A spinner with no timeout or retry on error, leaving the user stuck if a call fails.',
            'Duplicating ad-hoc state handling per screen instead of a consistent loading/empty/error pattern.',
          ],
          tryIt:
            'Render RegisterGrid for a brand-new Magane (empty), then while the DB query runs (loading), then force the handler to throw (error). Confirm each state shows its own clear message.',
          takeaway:
            'Branch every screen on isLoading, isError (showing error.message) and an empty result before the happy path, so the async IPC-to-Prisma reads always present a clear, trustworthy state.',
        },
        {
          id: 'm4-t15',
          title: 'Optimistic updates for the snappy checkbox toggle',
          explain:
            'For the participation checkbox, update the cache immediately, fire the mutation, and roll back on error — so ticking feels instant even though it is an IPC round-trip.',
          analogy:
            'When the volunteer ticks "Rangapuje" against a household, they mark the paper box at once and recompute the row total in front of the visitor, then file the slip through the hatch. They do not freeze the pen waiting for the back room to confirm. If the back room rejects it, they erase the tick. That confident-then-correct behaviour is an optimistic update.',
          theory:
            'A participation grid can have hundreds of checkboxes; waiting for each IPC round-trip before the box visibly toggles would feel laggy. **Optimistic updates** fix this: in `useMutation`, the `onMutate` callback updates the TanStack Query cache **immediately** to the expected new state, so the UI reflects the tick before main answers.\n\nThe pattern has three parts. **`onMutate`**: cancel in-flight refetches for the key, snapshot the current cache (so you can undo), and write the optimistic value (toggle that one `participation.checked` and adjust the row `total`). **`onError`**: restore the snapshot — the tick rolls back if main rejected (e.g. the year is locked). **`onSettled`**: invalidate the key so the cache reconciles with the true server state once the dust settles.\n\nFor `register.setParticipation(entryId, poojaTypeId, checked)`, the optimistic write flips that entry\'s matching participation and recomputes its `total` from the ticked rates. Because money already arrives as a plain `number` (the Decimal rule), recomputing the total in the renderer is straightforward arithmetic. The result is a grid that responds instantly yet stays correct, gracefully undoing any rejected change.',
          whyItMatters:
            'The participation grid is the heart of daily use; if every tick stutters, data entry is painful. Optimistic updates make it feel native and immediate while keeping correctness — rejected writes (a locked year, a vanished row) cleanly roll back, and onSettled reconciles with the source of truth. It showcases how TanStack Query plus a clean IPC layer deliver both speed and integrity.',
          steps: [
            'Use useMutation for setParticipation with onMutate, onError and onSettled.',
            'In onMutate, call queryClient.cancelQueries for the grid\'s key to avoid races.',
            'Snapshot the current cached entries with getQueryData so you can roll back.',
            'Write the optimistic value: toggle the matching participation.checked and recompute total.',
            'In onError, restore the snapshot via setQueryData so a rejected tick reverts.',
            'In onSettled, invalidateQueries the key to reconcile with the true server state.',
          ],
          code:
            '// src/renderer/hooks/useToggleParticipation.ts\nimport { useMutation, useQueryClient } from \'@tanstack/react-query\'\nimport { api } from \'../api\'\nimport type { RegisterEntryDTO } from \'../../shared/types\'\n\nexport function useToggleParticipation(yearId: number, maganeId: number) {\n  const qc = useQueryClient()\n  const key = [\'register\', yearId, maganeId]\n  return useMutation({\n    mutationFn: (v: { entryId: number; poojaTypeId: number; checked: boolean }) =>\n      api.register.setParticipation(v.entryId, v.poojaTypeId, v.checked),\n    onMutate: async (v) => {\n      await qc.cancelQueries({ queryKey: key })\n      const prev = qc.getQueryData<RegisterEntryDTO[]>(key)\n      qc.setQueryData<RegisterEntryDTO[]>(key, (old) =>\n        (old ?? []).map((e) =>\n          e.id !== v.entryId\n            ? e\n            : {\n                ...e,\n                participations: e.participations.map((p) =>\n                  p.poojaTypeId === v.poojaTypeId ? { ...p, checked: v.checked } : p,\n                ),\n              },\n        ),\n      )\n      return { prev } // context for rollback\n    },\n    onError: (_err, _v, ctx) => {\n      if (ctx?.prev) qc.setQueryData(key, ctx.prev) // roll back the tick\n    },\n    onSettled: () => {\n      qc.invalidateQueries({ queryKey: key }) // reconcile with main\n    },\n  })\n}',
          pitfalls: [
            'Skipping cancelQueries in onMutate, so an in-flight refetch overwrites your optimistic value.',
            'Not snapshotting prev, leaving no way to roll back a rejected tick.',
            'Forgetting onError rollback, so a failed write (locked year) leaves a wrong tick on screen.',
            'Omitting onSettled invalidation, so the cache slowly drifts from the true server state.',
            'Recomputing the row total from Decimal objects; rely on the plain numbers the DTO already provides.',
            'Applying optimistic updates everywhere indiscriminately — reserve them for snappy, high-frequency toggles.',
          ],
          tryIt:
            'Tick a checkbox and watch it flip instantly. Then make setParticipation throw in main (simulate a locked year) and confirm the tick rolls back, then reconciles on the next refetch.',
          takeaway:
            'Optimistic updates (onMutate writes the cache, onError rolls back, onSettled reconciles) make the participation checkbox feel instant while staying correct, even though each toggle is an IPC round-trip to Prisma.',
        },
        {
          id: 'm4-t16',
          title: 'Keeping the renderer DB-agnostic — it only knows window.api',
          explain:
            'Step back and confirm the whole renderer never imports Prisma or sees the database — it only ever knows api, query keys, and DTOs.',
          analogy:
            'At the end of the day, the front desk has never once entered the back room. The volunteer knows the slips they can push and the answers they get back — nothing about which cupboard, which register, which lock. That ignorance is a feature: you could swap the entire back room and the front desk would not change. The renderer is that front desk.',
          theory:
            'This topic ties the module together. Trace any feature and the layers are clean: a **renderer** screen calls a hook → the hook calls **`api`** (`src/renderer/api.ts`) → which is `window.api`, exposed by **preload** via contextBridge → whose methods `ipcRenderer.invoke` named channels → handled in **main** by an entity module → which calls **Prisma** → and maps rows to **plain DTOs** before returning. The renderer touches only the first three of those and never imports `@prisma/client`.\n\nEverything the renderer knows is: the `UpralliApi` type and DTO shapes (from `src/shared`, pure types), the `api` object, TanStack Query primitives, and query keys. Money is always a plain `number`; dates are ISO strings; there is no `Decimal`, no SQL, no connection, no `%LOCALAPPDATA%` path in sight. The database is entirely a main-process concern.\n\nThe payoff is real **separation of concerns**: you could change Prisma options, swap the embedded Postgres for another store, or restructure queries, and as long as the `UpralliApi` contract and DTOs hold, **no renderer code changes**. Conversely, you can build and test UI against a mocked `api` with no database at all. That clean seam — the typed `window.api` — is the architecture this whole module set out to build.',
          whyItMatters:
            'A DB-agnostic renderer is what makes the app maintainable and testable long-term. UI work never risks the database; data-layer work never risks the UI; and tests mock one tidy module. It also keeps the security model intact — no Prisma or Node ever leaks into the sandboxed page. This is not abstract tidiness; it is the property that lets two people work on UI and data in parallel without stepping on each other.',
          steps: [
            'Trace one feature end to end and name each layer: screen, hook, api, preload, channel, main, Prisma, DTO.',
            'Confirm no renderer file imports @prisma/client or any Node/db module.',
            'Confirm the renderer only imports pure types from src/shared and the api object.',
            'Verify money is always number and dates are ISO strings in the renderer.',
            'Prove testability by mocking api and rendering a screen with no database running.',
            'Note that changing the data layer needs no renderer change as long as the contract holds.',
          ],
          code:
            '// The full stack for one tick, top to bottom — renderer sees only the top three:\n//\n//   RegisterGrid.tsx        useToggleParticipation()         (renderer screen + hook)\n//        │ calls\n//   api.register.setParticipation(entryId, poojaTypeId, checked)   (src/renderer/api.ts)\n//        │ is window.api, exposed by\n//   contextBridge.exposeInMainWorld(\'api\', api)                    (preload)\n//        │ invokes\n//   ipcRenderer.invoke(\'register:setParticipation\', ...)          (preload → channel)\n//        │ handled by\n//   ipcMain.handle(\'register:setParticipation\', ...)              (main, validates)\n//        │ calls\n//   db().participation.upsert({ ... })  →  toRegisterEntry(row)   (Prisma + DTO map)\n//\n// Renderer imports: { UpralliApi, RegisterEntryDTO } from shared (types only) + api. No Prisma. Ever.',
          pitfalls: [
            'Letting a single import of @prisma/client sneak into a renderer file "just for a type."',
            'Reading the database path or connection in the renderer instead of treating it as a main concern.',
            'Handling Decimal or SQL in the UI, re-coupling the renderer to the data layer.',
            'Bypassing api to call window.api or ipcRenderer ad hoc, eroding the single seam.',
            'Changing DTO shapes without updating the shared contract, so the layers silently disagree.',
            'Testing UI against a real database instead of a mocked api, making tests slow and brittle.',
          ],
          tryIt:
            'Grep the entire renderer for "@prisma/client" — you should find nothing. Then write a quick test that mocks api.register.listEntries and renders RegisterGrid with no Postgres running at all.',
          takeaway:
            'The renderer only ever knows the typed window.api, query keys and plain DTOs — never Prisma or the database — so the data layer can change freely behind a stable contract and the UI stays testable in isolation.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm4-p1',
      type: 'Build',
      title: 'Maganes CRUD over typed IPC',
      domain: 'Temple register data layer + UI',
      duration: '4-5 hours',
      description:
        'Build the full Maganes feature end to end across all three layers: define the maganes group in the UpralliApi contract (shared types), implement the matching ipcMain.handle handlers in main that call Prisma with DTO mapping, expose the typed api via contextBridge, and build a React Maganes screen using useQuery to list and useMutation (with invalidateQueries) to create, edit and remove — proving the whole typed round-trip works for one entity.',
      tools: ['Electron', 'TypeScript', 'Prisma 5', 'embedded-postgres', 'TanStack Query', 'React'],
      blueprint: {
        overview:
          'Maganes are the global, year-independent groupings every household belongs to, so they are the perfect first vertical slice. You will exercise every layer this module teaches: a typed contract in src/shared/types.ts, preload wrappers, a maganes.ipc.ts handler module with toMagane DTO mapping, wiring after app.whenReady, and a React screen driven by TanStack Query. By the end you have a working, end-to-end CRUD feature with full type safety from window.api down to Prisma — and no Prisma anywhere in the renderer.',
        functionalRequirements: [
          'Lists all Maganes ordered by sortOrder, showing a loading state, an empty state and an error state.',
          'Creates a new Magane (name + sortOrder) and the list refreshes automatically via invalidateQueries.',
          'Edits an existing Magane\'s name/sortOrder and reflects the change without a manual reload.',
          'Removes a Magane and updates the list, surfacing a friendly error if it cannot be deleted.',
          'Validates input in main (non-empty name) and shows the thrown message in the UI on failure.',
        ],
        technicalImplementation: [
          'Define MaganeDTO, CreateMaganeInput and the maganes group of UpralliApi in src/shared/types.ts.',
          'Implement the maganes wrappers in preload and expose api via contextBridge.exposeInMainWorld.',
          'Write maganes.ipc.ts with toMagane mapping and handlers for list/create/update/remove, registered with db().',
          'Wire registerMaganeHandlers(db) after app.whenReady and before the window loads.',
          'Build React hooks (useMaganes, useCreateMagane, ...) on TanStack Query, invalidating [\'maganes\'] after writes.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Define the maganes contract and preload wrappers',
            outcome: 'A typed maganes API surface both processes agree on, plus thin preload invoke wrappers.',
            prompt:
              "I'm building an OFFLINE Electron + React + TypeScript app (electron-vite) with Prisma over a bundled local PostgreSQL. In src/shared/types.ts, write a MaganeDTO interface (id: number, name: string, sortOrder: number), a CreateMaganeInput interface (name: string, sortOrder: number), and a UpralliApi interface whose `maganes` group has list(): Promise<MaganeDTO[]>, create(input): Promise<MaganeDTO>, update(id: number, input): Promise<MaganeDTO>, remove(id: number): Promise<void>. Then write src/preload/index.ts that builds `const api: UpralliApi = {...}` implementing maganes as thin ipcRenderer.invoke wrappers on channels maganes:list / maganes:create / maganes:update / maganes:remove, and exposes it with contextBridge.exposeInMainWorld('api', api). Use single quotes. Output TypeScript only.",
          },
          {
            step: 2,
            label: 'Implement the main handlers with Prisma + DTO mapping',
            outcome: 'A maganes.ipc.ts module that calls Prisma and returns plain MaganeDTOs.',
            prompt:
              "For the same Electron + Prisma 5 app, write src/main/ipc/maganes.ipc.ts. Export registerMaganeHandlers(db: () => PrismaClient). Inside, define a toMagane(m) mapper returning a plain MaganeDTO, then register ipcMain.handle for 'maganes:list' (findMany ordered by sortOrder asc, mapped to DTOs), 'maganes:create' (create from CreateMaganeInput, validate name is non-empty and throw new Error('Magane name cannot be empty.') otherwise), 'maganes:update' (update by id), and 'maganes:remove' (delete by id, returns void). Always map rows to plain DTOs before returning — never return raw Prisma rows. Use single quotes. Output TypeScript only.",
          },
          {
            step: 3,
            label: 'Build the React Maganes screen with TanStack Query',
            outcome: 'Hooks and a screen that list/create/edit/remove Maganes with loading, empty and error states.',
            prompt:
              "For the renderer of the same app, write a src/renderer/api.ts that exports `window.api` typed as UpralliApi, then hooks using @tanstack/react-query: useMaganes() wrapping api.maganes.list() with queryKey ['maganes']; useCreateMagane(), useUpdateMagane(), useRemoveMagane() as useMutation calling the matching api methods and invalidating ['maganes'] onSuccess. Then write a MaganesScreen.tsx that renders a loading state, an error state showing error.message, an empty state, and otherwise the list with create/edit/remove controls wired to the mutations. The renderer must NOT import @prisma/client — only types from src/shared and the api object. Use single quotes. Output TypeScript/TSX only.",
          },
        ],
      },
    },
    {
      id: 'm4-p2',
      type: 'Build',
      title: 'Decimal-safe register read',
      domain: 'Temple register data layer + UI',
      duration: '3-4 hours',
      description:
        'Build a register:listEntries handler that returns each household with its participations and money totals mapped to plain DTOs (Decimal->number), and a typed renderer hook that consumes it — then prove no Prisma Decimal ever leaks across IPC by asserting the renderer receives plain numbers it can add. This is the canonical demonstration of the module\'s most important rule.',
      tools: ['Electron', 'TypeScript', 'Prisma 5', 'embedded-postgres', 'TanStack Query', 'React'],
      blueprint: {
        overview:
          'The participation grid reads, per Magane and year, every household plus which poojas they have ticked and the resulting rupee total. Because pooja rates and totals are Prisma Decimal, this is exactly where the Decimal->number rule must be applied. You will write a register:listEntries handler that loads entries with their participations, computes each total by summing the ticked rates, and maps everything to a RegisterEntryDTO whose money is a plain number, then consume it with a typed hook and confirm — with a small assertion — that no Decimal survives the crossing.',
        functionalRequirements: [
          'register:listEntries(yearId, maganeId) returns RegisterEntryDTO[] with personName, address, participations and a numeric total.',
          'Each money value (pooja rate used in the sum, and the entry total) is mapped Decimal->number before returning.',
          'The total equals the sum of the rates of the ticked poojas for that household, computed in main.',
          'participations is a plain array of { poojaTypeId, checked } objects (no Prisma relation instances).',
          'A renderer hook consumes the handler and the UI proves total is a real number (e.g. total + 0 works, toLocaleString formats it).',
        ],
        technicalImplementation: [
          'Define RegisterEntryDTO in src/shared/types.ts with total: number and participations: { poojaTypeId: number; checked: boolean }[].',
          'Write a dec(v) helper (null stays null, else Number(v)) and use it for every money field in the mapper.',
          'In register:listEntries, load entries with participations and the year\'s pooja rates, then sum ticked rates per entry.',
          'Map each entry to a RegisterEntryDTO via toRegisterEntry, never returning raw Prisma rows.',
          'Consume it with a useQuery hook keyed [\'register\', yearId, maganeId] and assert/format total as a plain number in the UI.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Define the RegisterEntryDTO and the dec helper',
            outcome: 'A serializable DTO whose money is number, plus the Decimal->number helper.',
            prompt:
              "For an OFFLINE Electron + Prisma 5 app, in src/shared/types.ts add a RegisterEntryDTO interface: id: number, yearId: number, maganeId: number, personName: string, address: string, sortOrder: number, participations: { poojaTypeId: number; checked: boolean }[], total: number. Then, in a main-process file, write a helper `function dec(v: Prisma.Decimal | null): number | null { return v == null ? null : Number(v) }` and explain in a comment why a Prisma Decimal must not cross Electron IPC and why we map it to a plain number here. Use single quotes. Output TypeScript only.",
          },
          {
            step: 2,
            label: 'Implement the Decimal-safe register:listEntries handler',
            outcome: 'A handler that loads entries + participations + rates, sums ticked rates, and returns plain DTOs.',
            prompt:
              "Write src/main/ipc/pooja-register.ipc.ts for the same Electron + Prisma app. Export registerRegisterHandlers(db: () => PrismaClient). Register ipcMain.handle('register:listEntries', async (_e, yearId: number, maganeId: number) => {...}). Inside: load the year's poojaTypes (with their Decimal rate) and the personEntries for that year+maganeId including their participations; for each entry, build participations as { poojaTypeId, checked } and compute total by summing the rates of the ticked poojas; then map each entry to a RegisterEntryDTO using a toRegisterEntry mapper that converts every Decimal to a plain number via dec(). Never return raw Prisma rows or Decimals. Use single quotes. Output TypeScript only.",
          },
          {
            step: 3,
            label: 'Consume it and prove no Decimal leaks',
            outcome: 'A typed renderer hook plus a UI/assertion showing total is a plain, addable number.',
            prompt:
              "For the renderer of the same app, write a useEntries(yearId, maganeId) hook using @tanstack/react-query and api.register.listEntries, keyed ['register', yearId, maganeId]. Then write a small RegisterGrid.tsx that renders loading/empty/error states and, for each entry, shows personName and the total formatted with total.toLocaleString('en-IN') prefixed with ₹. Add a tiny dev assertion (e.g. console.assert(typeof data[0].total === 'number')) proving the total arrived as a plain number, not a Prisma Decimal object. The renderer must NOT import @prisma/client. Use single quotes. Output TypeScript/TSX only.",
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm4-q1',
      q: 'Why can the React renderer not import the Prisma client directly?',
      options: [
        'Prisma is too slow to run in a browser tab',
        'The renderer runs sandboxed (nodeIntegration off, contextIsolation on) with no Node, so it must ASK the main process over IPC',
        'Prisma only works with cloud databases, not local ones',
        'TypeScript forbids importing Prisma into .tsx files',
      ],
      answer: 1,
    },
    {
      id: 'm4-q2',
      q: 'What is the relationship between ipcRenderer.invoke and ipcMain.handle?',
      options: [
        'They are unrelated; invoke writes to disk and handle reads from it',
        'invoke is fire-and-forget; handle polls for messages',
        'invoke sends a request on a channel and returns a Promise that resolves with whatever the matching handle handler returns',
        'handle runs in the renderer and invoke runs in main',
      ],
      answer: 2,
    },
    {
      id: 'm4-q3',
      q: 'Why must a Prisma Decimal money value be mapped to a plain number before returning it across IPC?',
      options: [
        'Decimal is a class instance that does not serialize cleanly over IPC, so the renderer would receive a broken value',
        'number is more precise than Decimal for rupee maths',
        'Prisma cannot store Decimal values at all',
        'Electron requires all numbers to be strings',
      ],
      answer: 0,
    },
    {
      id: 'm4-q4',
      q: 'How is the typed API safely made available to the renderer as window.api?',
      options: [
        'By assigning window.api = ipcRenderer in preload',
        'By turning nodeIntegration on so the renderer can require Prisma',
        'By calling contextBridge.exposeInMainWorld(\'api\', api) with only the narrow typed api, never raw ipcRenderer',
        'By importing the api object directly in each .tsx file',
      ],
      answer: 2,
    },
    {
      id: 'm4-q5',
      q: 'After a useMutation successfully adds a person, how does the list refresh without a manual refetch?',
      options: [
        'TanStack Query automatically refetches every query on the page',
        'You call queryClient.invalidateQueries for the affected query key in onSuccess, so that read refetches',
        'You reload the whole window after every write',
        'Prisma pushes a change event to the renderer',
      ],
      answer: 1,
    },
    {
      id: 'm4-q6',
      q: 'In the optimistic participation-checkbox toggle, what does the onError callback do?',
      options: [
        'It retries the mutation up to three times automatically',
        'It restores the snapshot taken in onMutate, rolling back the optimistic tick if main rejected the write',
        'It clears the entire query cache',
        'It re-runs onMutate with the same arguments',
      ],
      answer: 1,
    },
  ],
};
