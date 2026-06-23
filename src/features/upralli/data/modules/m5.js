// Module 5 — The Register Grid with TanStack Table & Query.
// Electron + React + TypeScript + Prisma over a bundled LOCAL PostgreSQL. OFFLINE
// desktop app for a coastal-Karnataka village temple committee — the year-wise
// pooja/donor register ("Upralli Seva"). This module builds the spreadsheet-like
// heart of the app: pick a Magane + Year, load the households with TanStack Query,
// render them as a TanStack Table with a checkbox column per pooja type, and let
// every tick auto-persist optimistically. Consumed by the React course player
// (see components/TopicItem.jsx).

export const m5 = {
  id: 'm5',
  title: 'The Register Grid with TanStack Table & Query',
  hours: 9,
  color: 'from-rose-500/20 to-rose-700/10',
  accent: 'rose',
  description:
    'Build the spreadsheet-like heart of Upralli Seva — the register grid. Pick a Magane and a Year, then load that page of the register with TanStack Query: every household becomes a row, every pooja type becomes a checkbox column, and a per-row rupee total adds up the ticked poojas. Render the grid with TanStack Table (createColumnHelper, useReactTable, flexRender), keep the Kannada name read-only (clicking it opens the edit modal from Module 6), and make every checkbox tick auto-persist with an optimistic useMutation that flips instantly and rolls back on error. Finish by honouring locked years — a finalised register renders fully read-only.',
  sections: [
    {
      id: 'm5-s1',
      title: 'Loading the register',
      topics: [
        {
          id: 'm5-t1',
          title: 'The Magane + Year That Drive the Grid',
          explain:
            'The whole register grid is decided by **two pickers** — which **Year** and which **Magane** — so before any rows load you must hold those two ids in state and default the Year to the most recent one.',
          analogy:
            'Think of the committee\'s register as a stack of yearly books, and each book divided into sections — one section per **Magane** (village ward). Nobody reads the whole stack at once: a member flips to **this year\'s book**, turns to the **Kundapura Magane** section, and reads just those households. Your two pickers are exactly that — pull one book off the shelf, open it to one section.',
          theory:
            'The register is far too big to show all at once — 2280 households across many Maganes and several years. So the grid is always a **slice**: one Year × one Magane. That means the screen needs two pieces of state, `yearId` and `maganeId`, and those two values are the **inputs to everything else** — the query key, the columns, the totals.\n\nThe **Year picker** lists years in descending order and defaults to the most recent one, because that is what the committee works in day to day. The **Magane picker** lists the global Maganes (built back in Module 4). When either changes you update state, and React re-renders; the data layer (next topic) notices the new ids and re-fetches. You are not fetching manually on click — you let the ids flow into a query and let TanStack Query do the work.\n\nKeep these pickers **controlled**: their `value` comes from state, their `onChange` writes state. Store ids (numbers or cuid strings), not display labels — the label is for humans, the id is what the database and the query key care about. A small but real detail: default `maganeId` to the first Magane (or remember the last one used) so the screen is never blank on open.',
          whyItMatters:
            'Every other thing in this module — the query, the columns, the checkboxes, the totals — keys off `yearId` and `maganeId`. Get these two pieces of state right and defaulted sensibly, and the rest of the grid has a stable foundation; get them wrong and you fetch the wrong slice or show an empty screen.',
          steps: [
            'Hold `yearId` and `maganeId` in component state (e.g. `useState`).',
            'Fetch the list of years (desc) and default `yearId` to the most recent.',
            'Fetch the global Maganes and default `maganeId` to the first (or last-used).',
            'Render two controlled `<select>` pickers whose `value` is the id and `onChange` updates state.',
            'Store ids, not labels — the label is shown, the id drives the query.',
            'Pass `yearId` + `maganeId` down to the grid so it knows which slice to load.',
          ],
          code: `// RegisterScreen.tsx — two pickers decide which slice of the register loads.
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export function RegisterScreen() {
  const years = useQuery({ queryKey: ['years'], queryFn: () => window.api.years.list() });
  const maganes = useQuery({ queryKey: ['maganes'], queryFn: () => window.api.maganes.list() });

  // Default to the most recent year and the first Magane.
  const [yearId, setYearId] = useState<string | null>(null);
  const [maganeId, setMaganeId] = useState<string | null>(null);

  const yearList = years.data ?? [];        // already sorted desc by the main process
  const maganeList = maganes.data ?? [];
  const activeYear = yearId ?? yearList[0]?.id ?? null;
  const activeMagane = maganeId ?? maganeList[0]?.id ?? null;

  return (
    <div className='register-screen'>
      <header className='register-pickers'>
        <select value={activeYear ?? ''} onChange={(e) => setYearId(e.target.value)}>
          {yearList.map((y) => <option key={y.id} value={y.id}>{y.label}</option>)}
        </select>
        <select value={activeMagane ?? ''} onChange={(e) => setMaganeId(e.target.value)}>
          {maganeList.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </header>
      {activeYear && activeMagane
        ? <RegisterGrid yearId={activeYear} maganeId={activeMagane} />
        : <p>Pick a year and a Magane to load the register.</p>}
    </div>
  );
}`,
          pitfalls: [
            'Storing the picker\'s display label instead of its id, so the query key and the database lookups break.',
            'Leaving the Year undefaulted, so the screen opens blank until the user picks — annoying for daily use.',
            'Sorting years ascending, so the oldest book shows first instead of the current one.',
            'Forgetting that changing either picker must change the query key (next topic) — otherwise the grid shows stale rows.',
            'Hard-coding a single Magane and never letting the user switch sections.',
            'Making the `<select>` uncontrolled (no `value`), so React and the displayed selection drift apart.',
          ],
          tryIt:
            'Add a third picker for a Magane you have not seeded yet and confirm the grid shows the empty state cleanly. Then switch the Year picker to last year and watch the rows change — proof the two ids really drive everything.',
          takeaway:
            'The register grid is always one Year × one Magane slice. Hold both ids in state, default the Year to the most recent and the Magane to the first, store ids (not labels), and feed both down to the grid.',
        },
        {
          id: 'm5-t2',
          title: 'Fetching the Slice With useQuery',
          explain:
            'Load the chosen slice with **`useQuery`** keyed by `[\'register\', yearId, maganeId]`, so changing either picker automatically re-fetches the right households without any manual wiring.',
          analogy:
            'Imagine asking the committee clerk, \'bring me this year\'s Kundapura section.\' You do not stand over them; you put in the request and they come back with exactly that section, and they remember it so the next time you ask for the same thing it\'s instant. TanStack Query is that clerk — you describe what you want with a **key**, and it fetches, caches and re-fetches for you.',
          theory:
            'TanStack Query turns \'I need this data\' into a small declaration: a **query key** (a serialisable array that uniquely names the data) and a **query function** (how to get it). Here the key is `[\'register\', yearId, maganeId]` and the function calls `window.api.register.listEntries(yearId, maganeId)` over IPC. Because the key includes both ids, the moment a picker changes, the key changes, and Query fetches the new slice — and caches the old one in case the user switches back.\n\nThe call returns far more than bare rows. For each household (`PersonEntry`) you need its **participations** (which poojas it has ticked this year) and, separately, the **pooja types** that exist for this year (the columns). A clean shape is one call that returns `{ entries, poojaTypes }`, where each entry carries a set/array of its ticked `poojaTypeId`s. That single payload has everything the table needs: the rows, the per-row ticks, and the column definitions.\n\nQuery hands you status flags you render directly: `isLoading` while the first fetch runs, `isError` with the thrown error, and `data` when it arrives. Because this is an **offline** app, the fetch is a local Prisma read over IPC — milliseconds, not a network round-trip — but the same flags keep your UI honest and let you show a skeleton, an error, or an empty state without scattering booleans through your component.',
          whyItMatters:
            'This one hook is the bridge between the pickers and the grid. Key it correctly and the entire screen reacts to the two pickers for free — no `useEffect` fetch dance, no stale rows, no manual cache. Shape the payload well and the table code in the next section stays tiny.',
          steps: [
            'Wrap the slice in `useQuery({ queryKey: [\'register\', yearId, maganeId], queryFn })`.',
            'Make the query function call `window.api.register.listEntries(yearId, maganeId)` over IPC.',
            'Return `{ entries, poojaTypes }` — rows with their ticked poojaTypeIds, plus the year\'s columns.',
            'Render `isLoading` (skeleton), `isError` (message), and the empty case from `data.entries.length === 0`.',
            'Read `data` only after the loading/error guards, so the table always gets real arrays.',
            'Let the query key changing (picker change) drive the re-fetch — never fetch by hand.',
          ],
          code: `// useRegister.ts — one query loads the rows + the pooja columns for a slice.
import { useQuery } from '@tanstack/react-query';

export interface RegisterEntry {
  id: string;
  serialNo: number;
  name: string;          // combined Kannada name/address (read-only in the grid)
  poojaTypeIds: string[]; // which poojas this household has ticked this year
}
export interface PoojaType { id: string; name: string; rate: number; }
export interface RegisterData { entries: RegisterEntry[]; poojaTypes: PoojaType[]; }

export function useRegister(yearId: string, maganeId: string) {
  return useQuery<RegisterData>({
    queryKey: ['register', yearId, maganeId],
    queryFn: () => window.api.register.listEntries(yearId, maganeId),
    // local Prisma read over IPC — fast, but keep it cached so switching back is instant
    staleTime: 60_000,
  });
}`,
          pitfalls: [
            'Leaving `yearId`/`maganeId` out of the query key, so switching pickers shows the previous slice\'s rows.',
            'Refetching with a `useEffect` + `setState` instead of `useQuery` — reinventing caching badly.',
            'Returning entries without their ticked poojaTypeIds, forcing a second round of lookups in the component.',
            'Reading `data.entries` before guarding `isLoading`, so the table renders `undefined` and crashes.',
            'Putting the pooja-type columns in a separate query that can arrive out of sync with the rows.',
            'Assuming the offline read can never fail — a corrupted DB or migration mismatch still throws; show `isError`.',
          ],
          tryIt:
            'Log `queryKey` changes and flip between two Maganes a few times, then switch back — notice the cached slice appears instantly before any refetch. Then throw inside the query function once and confirm `isError` renders your message instead of a blank grid.',
          takeaway:
            'One `useQuery` keyed by `[\'register\', yearId, maganeId]` returns `{ entries, poojaTypes }` for the slice. The key makes the pickers drive re-fetches automatically, and the status flags give you clean loading/error/empty states.',
        },
        {
          id: 'm5-t3',
          title: 'Shaping Entries, Participations & Columns Into Rows',
          explain:
            'Reshape the raw payload into **table-ready rows** — one object per household with its serial, Kannada name, and a quick way to ask \'is pooja X ticked?\' — plus the **column list** of this year\'s pooja types.',
          analogy:
            'The clerk hands you the section as loose notes: a list of households, a separate list of who paid for what, and the list of this year\'s poojas. Before you can fill the **grid in the register book**, you lay it out into neat rows and columns — name down the side, pooja names across the top, a tick where they meet. That lay-out step is exactly the data shaping you do here.',
          theory:
            'The data the database gives you is **normalised** — households in one place, participations in another, pooja types in a third — because that is how relational storage stays clean. But a table wants **denormalised rows**: each row should already know everything it needs to draw itself. So you do a small transform once, ideally `useMemo`-ised, turning `{ entries, poojaTypes }` into the exact shape the grid consumes.\n\nThe key trick is making the tick lookup **O(1)**. If each row stored its poojas as an array, then for every checkbox cell you would scan that array — fine for three poojas, wasteful at scale. Instead turn each entry\'s `poojaTypeIds` into a `Set`, so the cell just asks `row.ticked.has(poojaTypeId)`. The columns come straight from `poojaTypes` (already in the right order from the year), and you keep them in declaration order so the grid header reads left to right like the paper register.\n\nDo not over-shape. Resist computing the rupee total here and freezing it into the row — totals change as the user ticks, so they belong to a derived cell (covered in s2/s3), not the static row data. The row data is the **stable** part: id, serialNo, name, and the ticked Set. Sort the rows by `serialNo` so the grid matches the order the committee maintains by hand (and drag-reorders in Module 6).',
          whyItMatters:
            'Good shaping is what keeps the TanStack Table code in the next section short and fast. A `Set` per row makes 50 households × 8 poojas of checkbox checks instant, and sorting by serialNo means the on-screen grid matches the committee\'s paper order — so a member can cross-check row by row.',
          steps: [
            'Wrap the transform in `useMemo` keyed on `data` so it only recomputes when the slice changes.',
            'Map each entry to `{ id, serialNo, name, ticked: new Set(entry.poojaTypeIds) }`.',
            'Sort the rows ascending by `serialNo` to match the paper register order.',
            'Take the column list straight from `data.poojaTypes`, preserving its order.',
            'Keep volatile values (rupee total) OUT of the row — derive them per-cell later.',
            'Return `{ rows, poojaTypes }` ready to hand to `useReactTable`.',
          ],
          code: `// useRegisterRows.ts — denormalise the payload into stable, table-ready rows.
import { useMemo } from 'react';
import type { RegisterData, PoojaType } from './useRegister';

export interface Row {
  id: string;
  serialNo: number;
  name: string;            // Kannada — rendered read-only in the grid
  ticked: Set<string>;     // poojaTypeIds this household has ticked (O(1) lookup)
}

export function useRegisterRows(data: RegisterData | undefined) {
  return useMemo(() => {
    if (!data) return { rows: [] as Row[], poojaTypes: [] as PoojaType[] };
    const rows: Row[] = data.entries
      .map((e) => ({
        id: e.id,
        serialNo: e.serialNo,
        name: e.name,
        ticked: new Set(e.poojaTypeIds),
      }))
      .sort((a, b) => a.serialNo - b.serialNo); // match the paper register order
    return { rows, poojaTypes: data.poojaTypes };
  }, [data]);
}`,
          pitfalls: [
            'Storing ticks as an array and scanning it per cell — fine at 3 poojas, slow at hundreds of rows.',
            'Freezing the rupee total into the row, so it goes stale the instant a checkbox is ticked.',
            'Skipping `useMemo`, so the whole transform re-runs on every keystroke elsewhere on the screen.',
            'Forgetting to sort by serialNo, so the grid order drifts from the committee\'s paper book.',
            'Mutating `data` in place instead of mapping to new objects — surprises React\'s change detection.',
            'Re-deriving columns from the rows instead of from `poojaTypes`, dropping poojas no one has ticked yet.',
          ],
          tryIt:
            'Add a household with zero ticks and one with every pooja ticked, then log `rows` — confirm both have a `ticked` Set (one empty, one full) and that the column list still shows every pooja regardless of who ticked it.',
          takeaway:
            'Transform the normalised payload once (memoised) into stable rows with an O(1) `ticked` Set, sorted by serialNo, plus a column list taken straight from `poojaTypes`. Keep volatile totals out of the row.',
        },
        {
          id: 'm5-t4',
          title: 'Loading, Empty & Error States',
          explain:
            'Render three honest states from the query — a **skeleton** while loading, a friendly **\'no households yet\'** empty message, and a clear **error** panel — so the grid never shows a blank or broken screen.',
          analogy:
            'When a committee member opens a section of the register, one of three things is true: the clerk is still fetching it (wait a moment), the section exists but **no households are written in it yet** (a fresh Magane), or something went wrong (the book is missing). A good counter clerk tells you which — and so should your grid.',
          theory:
            'Every data screen has three failure-shaped states besides the happy path, and skipping any one of them produces a confusing UI. **Loading** is the first fetch: show a skeleton or spinner, not a blank. **Empty** is success with zero rows: a brand-new Magane that has no households yet — this is not an error, it is an invitation to add the first household (the add flow lands in Module 6), so the copy should be encouraging, not alarming. **Error** is a thrown query: a corrupted database, a failed migration, an IPC mishap — show what happened and offer a retry.\n\nThe order of your guards matters. Check `isLoading` first, then `isError`, then the empty case (`data.entries.length === 0`), and only then render the table. Crucially, do not confuse **empty** with **loading** — an empty array is valid data, not an absence of data. If you treat \'no rows\' as \'still loading\', a fresh Magane spins forever.\n\nBecause this is offline, loading is brief — but it is not zero, and the error case is real. A migration mismatch or a half-written database will throw, and the committee, with no IT support, needs a message they can act on (\'could not load the register — try reopening the app\') rather than a white screen. TanStack Query gives you `refetch` to wire a retry button, so the empty and error states can both be self-service.',
          whyItMatters:
            'This is an offline app used by non-technical committee members with no helpdesk. A blank screen on a fresh Magane, or a silent failure on a bad database, is a dead end for them. Honest loading/empty/error states turn confusing moments into clear, recoverable ones.',
          steps: [
            'Guard `isLoading` first and return a skeleton or spinner for the grid area.',
            'Guard `isError` next and show the error message with a `refetch` retry button.',
            'Treat `data.entries.length === 0` as a distinct, friendly empty state — not an error.',
            'Word the empty copy as an invitation (\'No households in this Magane yet\').',
            'Only after all three guards, render the TanStack Table with real arrays.',
            'Never conflate an empty array with loading — empty is valid, settled data.',
          ],
          code: `// RegisterGrid.tsx — three guards before the table ever renders.
import { useRegister } from './useRegister';
import { useRegisterRows } from './useRegisterRows';

export function RegisterGrid({ yearId, maganeId }: { yearId: string; maganeId: string }) {
  const query = useRegister(yearId, maganeId);
  const { rows, poojaTypes } = useRegisterRows(query.data);

  if (query.isLoading) return <GridSkeleton />;
  if (query.isError) {
    return (
      <div className='grid-error' role='alert'>
        <p>Could not load the register. Try reopening the app.</p>
        <button onClick={() => query.refetch()}>Retry</button>
      </div>
    );
  }
  if (rows.length === 0) {
    return <p className='grid-empty'>No households in this Magane yet. Add the first one to begin.</p>;
  }
  return <RegisterTable rows={rows} poojaTypes={poojaTypes} yearId={yearId} maganeId={maganeId} />;
}`,
          pitfalls: [
            'Treating an empty array as \'still loading\', so a fresh Magane spins forever.',
            'Showing the empty state as an error (\'something went wrong\'), scaring users on a brand-new section.',
            'Reading `query.data.entries` before the loading guard, crashing on the first render.',
            'A bare white screen on error, leaving a non-technical committee member with no next step.',
            'No retry path, so a transient IPC failure forces an app restart.',
            'Checking the empty case before `isError`, so a thrown query is misreported as \'no households\'.',
          ],
          tryIt:
            'Point the grid at a Magane with no households and confirm you get the friendly empty message, not a spinner. Then force the query to throw and confirm the error panel with a working Retry button appears.',
          takeaway:
            'Guard in order — loading, then error, then empty — and only then render the table. An empty array is settled data inviting a first household, not a loading state and not an error.',
        },
      ],
    },
    {
      id: 'm5-s2',
      title: 'Building the grid with TanStack Table',
      topics: [
        {
          id: 'm5-t5',
          title: 'Defining Columns With createColumnHelper',
          explain:
            'Declare the grid\'s columns with **`createColumnHelper`** — a serial-number column, a read-only Kannada name column, one checkbox column per pooja type, and a per-row ₹ total — so the table is described as data, not hand-written `<td>`s.',
          analogy:
            'Before the committee prints a blank register page, someone decides the **column headings**: Sl. No., Name & Address, then each pooja name across the top, then a Total column at the end. `createColumnHelper` is you writing that heading row once — the table fills in the body underneath.',
          theory:
            'TanStack Table is **headless**: it does not render anything, it computes the row/column model and hands you the pieces. You describe the shape with a **column definition** array, and the cleanest way is `createColumnHelper<Row>()`, which gives you typed `accessor` and `display` column builders. An **accessor column** pulls a value out of the row (serialNo, name); a **display column** renders something computed or interactive (a checkbox, a total) that is not a single field.\n\nFor this grid the fixed columns are **Sl. No.** (`accessor(\'serialNo\')`) and **Name & Address** (`accessor(\'name\')`, rendered read-only). Then you build the pooja columns **dynamically** by mapping over `poojaTypes` — each becomes a `display` column whose `id` is the pooja id, whose header is the Kannada pooja name, and whose cell renders a checkbox reflecting `row.ticked.has(poojaId)`. Finally a **₹ total** display column sums the rates of the ticked poojas for that row.\n\nBuild these column defs inside a `useMemo` keyed on `poojaTypes` (and any callbacks the cells need), because the columns change when you switch to a year with different poojas. Stable column definitions matter: if you rebuild them on every render with new function identities, the table re-computes more than it needs to. Define the columns as data, memoise them, and the table stays fast and declarative.',
          whyItMatters:
            'The pooja columns are different every year — Module 4 lets each year define its own pooja types and rates. Building columns dynamically from `poojaTypes` means the same grid component handles a year with 4 poojas and a year with 9, with no code change. That is the payoff of headless, data-described columns.',
          steps: [
            'Create a helper: `const ch = createColumnHelper<Row>()`.',
            'Add `ch.accessor(\'serialNo\', …)` and `ch.accessor(\'name\', …)` (name rendered read-only).',
            'Map over `poojaTypes` to build one `ch.display` checkbox column per pooja, id = pooja id.',
            'Put the Kannada pooja name in each column\'s `header`.',
            'Add a final `ch.display` ₹ total column that sums ticked rates for the row.',
            'Wrap the whole array in `useMemo` keyed on `poojaTypes` (+ cell callbacks).',
          ],
          code: `// columns.tsx — describe the grid as data; pooja columns are built per year.
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { Row } from './useRegisterRows';
import type { PoojaType } from './useRegister';

const ch = createColumnHelper<Row>();

export function useColumns(poojaTypes: PoojaType[], onToggle: (rowId: string, poojaId: string, next: boolean) => void) {
  return useMemo(() => [
    ch.accessor('serialNo', { header: 'Sl. No.', cell: (c) => c.getValue() }),
    ch.accessor('name', {
      header: 'Name & Address',
      cell: (c) => <span className='kn read-only'>{c.getValue()}</span>, // read-only in the grid
    }),
    ...poojaTypes.map((p) =>
      ch.display({
        id: p.id,
        header: () => <span className='kn'>{p.name}</span>,
        cell: (c) => (
          <input
            type='checkbox'
            checked={c.row.original.ticked.has(p.id)}
            onChange={(e) => onToggle(c.row.original.id, p.id, e.target.checked)}
          />
        ),
      }),
    ),
    ch.display({
      id: 'total',
      header: '₹ Total',
      cell: (c) => formatINR(sumTicked(c.row.original, poojaTypes)),
    }),
  ], [poojaTypes, onToggle]);
}`,
          pitfalls: [
            'Hand-writing fixed `<td>` cells, so a year with different poojas needs a code change.',
            'Giving every dynamic pooja column the same `id`, so the table cannot tell columns apart.',
            'Rebuilding the column array on every render without `useMemo`, causing needless re-computation.',
            'Using an `accessor` column for the checkbox (it needs a `display` column — there is no single field to read).',
            'Forgetting the Kannada `kn` class on the pooja headers, so the names render in the wrong font.',
            'Closing over a stale `onToggle`, so checkbox clicks call an outdated handler — keep it in the memo deps.',
          ],
          tryIt:
            'Switch the Year picker to a year that defined a different set of poojas and watch the checkbox columns change with no code edit. Then add a brand-new pooja type to the year and confirm a new column appears.',
          takeaway:
            'Describe columns as data with `createColumnHelper`: fixed accessor columns for serial and name, dynamic display columns mapped from `poojaTypes` for the checkboxes, and a display ₹ total — all memoised so the grid adapts to each year\'s poojas for free.',
        },
        {
          id: 'm5-t6',
          title: 'Rendering Header & Body With flexRender',
          explain:
            'Feed the rows and columns to **`useReactTable`** with **`getCoreRowModel`**, then render the header groups and body rows with **`flexRender`** — the headless engine computes the model, your JSX draws the `<table>`.',
          analogy:
            'TanStack Table is like a clerk who works out exactly which households and which pooja columns belong on this page and in what order — but hands you a **blank printed grid** to fill. `flexRender` is the pen: it places each header and each cell where the clerk said it goes, including the **Kannada pooja names** across the top.',
          theory:
            'You wire the engine with `useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })`. That returns a `table` object — a headless API. It does not produce any DOM; instead it exposes `table.getHeaderGroups()` and `table.getRowModel().rows`, and you walk those to build your own `<table>`. This separation is the whole point of \'headless\': the library owns the logic, you own the markup and styling.\n\n`flexRender` is the glue. A column\'s `header` or `cell` can be a string, a function, or a React component; `flexRender(def, context)` renders whichever it is with the right context. So your header loop is `headerGroup.headers.map((h) => flexRender(h.column.columnDef.header, h.getContext()))`, and your body loop is `row.getVisibleCells().map((cell) => flexRender(cell.column.columnDef.cell, cell.getContext()))`. The same one function renders the plain \'Sl. No.\' string, the Kannada pooja-name component, the checkbox cell and the ₹ total cell.\n\nBecause the pooja headers are **Kannada**, the header row is where the bundled Noto font (Module 6) earns its keep — set the `kn` class in the column header so ಮಂಗಳಾರತಿ renders crisply. And because each row is interactive, give the `<tr>` a **stable key** from `row.id` (the entry id), never the array index — covered next, but the rendering loop is where you wire it.',
          whyItMatters:
            'Headless rendering is what lets this grid look like the committee\'s register book — your own table markup, your own styling, Kannada headers in the right font — while TanStack Table handles the column model. `flexRender` means one rendering path covers strings, components and interactive cells alike.',
          steps: [
            'Call `useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel(), getRowId })`.',
            'Render `<thead>` by mapping `table.getHeaderGroups()` then each group\'s `headers`.',
            'Use `flexRender(header.column.columnDef.header, header.getContext())` for each header cell.',
            'Render `<tbody>` by mapping `table.getRowModel().rows`.',
            'For each row map `row.getVisibleCells()` and `flexRender` the `cell` def.',
            'Set the Kannada `kn` class on pooja headers so the bundled font applies.',
          ],
          code: `// RegisterTable.tsx — headless engine computes the model; flexRender draws it.
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useColumns } from './columns';

export function RegisterTable({ rows, poojaTypes, onToggle }: TableProps) {
  const columns = useColumns(poojaTypes, onToggle);
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id, // stable id from the PersonEntry, not the array index
  });

  return (
    <table className='register-grid'>
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}`,
          pitfalls: [
            'Rendering `columnDef.header` directly instead of through `flexRender`, so component/function headers break.',
            'Forgetting `getCoreRowModel: getCoreRowModel()`, so `getRowModel().rows` comes back empty.',
            'Keying `<tr>` by array index, so optimistic toggles and reorders mis-associate rows.',
            'Expecting the table to render DOM itself — it is headless; you must write the `<table>` markup.',
            'Skipping `getRowId`, so TanStack invents ids that do not match your entry ids.',
            'Leaving the Kannada class off pooja headers, so they render in a fallback font without conjuncts.',
          ],
          tryIt:
            'Render the table, then add `console.log(table.getRowModel().rows.length)` and confirm it matches your household count. Temporarily replace a pooja header with a function returning JSX and confirm `flexRender` still draws it.',
          takeaway:
            '`useReactTable` + `getCoreRowModel` compute the headless model; you draw the `<table>` yourself, using `flexRender` for every header and cell so strings, Kannada components and interactive checkboxes all render through one path.',
        },
        {
          id: 'm5-t7',
          title: 'Stable Row Ids & the Read-Only Name Rule',
          explain:
            'Give every row a **stable id** from the entry id via `getRowId`, and render the **Kannada name/address cell read-only** — in this grid only checkboxes toggle inline; clicking the name opens the edit modal (Module 6).',
          analogy:
            'In the paper register, each household keeps its **line** even as you tick poojas next to it — you do not rewrite the name every time. And you never scribble corrections to the name in the cramped grid cell; you take the book to a desk and write neatly. Our grid mirrors both: the row id stays put, and editing the name happens in a calm popup, not in the tiny cell.',
          theory:
            'A **stable row id** is the backbone of an interactive grid. By default TanStack Table keys rows by their array index, which is fine for a static read-only table but dangerous here: when you tick a checkbox and optimistically update, or when households reorder, index-based keys make React re-associate the wrong row\'s state with the wrong DOM. Passing `getRowId: (row) => row.id` ties each row to its **PersonEntry id**, so a row\'s identity survives ticks, sorts and reorders.\n\nThe second rule is a deliberate UX boundary: **the name/address cell is read-only in the grid**. The whole app forbids inline `contentEditable` for text (it fights the Kannada IME and is easy to corrupt), so the grid shows the Kannada name as plain, non-editable text — and a click on it opens the **EditPersonDialog** modal built in Module 6. The only thing you may edit *inline* in the grid is a **checkbox**, because a checkbox is a single safe boolean with no IME involved.\n\nThis split keeps responsibilities clean. The grid is for **fast ticking** across many households; the modal is for **careful text entry** of one household. Wiring it is simple: the name cell renders a read-only span (or a button styled as text) whose click calls an `onEditPerson(rowId)` handler that the parent uses to open the modal. The checkbox cell, by contrast, handles its `onChange` right there in the grid.',
          whyItMatters:
            'Stable ids prevent the classic optimistic-update bug where ticking one household visually flips another. And the read-only name rule is the app\'s core UX contract — it protects Kannada text from inline-edit corruption while keeping the grid fast for the one thing it is built for: ticking poojas across hundreds of households.',
          steps: [
            'Pass `getRowId: (row) => row.id` to `useReactTable` so identity = entry id.',
            'Render the name cell as a read-only span/button with the `kn` Kannada class.',
            'On name click, call `onEditPerson(row.id)` to open the Module 6 edit modal — do not edit inline.',
            'Never put `contentEditable` on the name cell.',
            'Keep the checkbox cell interactive — it is the only inline edit allowed in the grid.',
            'Key `<tr>` by `row.id` in the render loop, matching `getRowId`.',
          ],
          code: `// columns name cell — read-only Kannada text that opens the edit modal on click.
ch.accessor('name', {
  header: 'Name & Address',
  cell: (c) => (
    <button
      type='button'
      className='kn name-cell'  // styled to look like plain text, NOT contentEditable
      onClick={() => onEditPerson(c.row.original.id)} // opens EditPersonDialog (Module 6)
    >
      {c.getValue()}
    </button>
  ),
});

// ...and the table keeps row identity tied to the entry id:
const table = useReactTable({
  data: rows,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getRowId: (row) => row.id, // stable across ticks, sorts and reorders
});`,
          pitfalls: [
            'Letting `getRowId` default to the array index, so optimistic ticks flip the wrong row after a sort.',
            'Making the name cell `contentEditable` — it corrupts Kannada and bypasses the modal rule.',
            'Editing the name inline \'just for a quick fix\', breaking the app\'s one-edit-path contract.',
            'Forgetting the `kn` class on the name cell, so Kannada renders in a fallback font.',
            'Wiring the name-click to nothing, so users cannot reach the edit modal from the grid.',
            'Allowing inline edits to fields other than checkboxes — only the boolean tick is safe inline.',
          ],
          tryIt:
            'Click a household\'s Kannada name and confirm it opens the edit modal rather than turning the cell into a text box. Then tick a checkbox, sort the rows, and confirm the tick stays on the same household — proof your `getRowId` is stable.',
          takeaway:
            'Tie row identity to the entry id with `getRowId`, and keep the name/address cell read-only — clicking it opens the Module 6 modal. Only checkboxes are editable inline; text is never edited in the grid.',
        },
        {
          id: 'm5-t8',
          title: 'Performance at Hundreds (and Thousands) of Rows',
          explain:
            'A Magane can hold dozens of households and the register totals **2280**, so keep the grid fast with stable ids, memoised columns, light cells, and **virtualization** once a slice approaches thousands of rows.',
          analogy:
            'Flipping through a thin section of the register is effortless; flipping a 2000-page book one page at a time is not. Virtualization is like only ever holding open the **few pages you can actually see** — the rest of the book exists but you are not turning every page at once.',
          theory:
            'Most of the time a single Magane slice is a few dozen to a few hundred households — well within what the browser can render directly, and TanStack Table\'s core model handles that comfortably. The performance wins at this size come from the basics: a **stable `getRowId`** so React reuses DOM, **memoised columns** so the model is not rebuilt each render, and **light cell components** (a plain checkbox, a cheap total) so each cell is fast to draw. Avoid heavy per-cell work — no expensive formatting in a tight loop, no new objects created per render that defeat memoisation.\n\nThe trouble starts when a slice gets very large — if someone loads a Magane with a thousand households, or you ever build an \'all Maganes\' view approaching the full **2280**. Rendering thousands of `<tr>`s creates thousands of DOM nodes and the browser bogs down on scroll. The answer is **virtualization**: render only the rows currently in the viewport (plus a small overscan), and as the user scrolls, recycle rows in and out. `@tanstack/react-virtual` pairs naturally with TanStack Table — you measure the row height, ask the virtualizer which rows are visible, and render just those, spacing them with padding so the scrollbar still reflects the full count.\n\nThe judgement call is **when** to reach for it. Virtualization adds complexity (measuring, absolute positioning, sticky headers get trickier), so do not pay that cost for 80 rows. The rule of thumb: render normally for typical Magane slices, and introduce the virtualizer only for the rare large slice. Measure first — if scroll is smooth, you do not need it yet.',
          whyItMatters:
            'This register is 2280 households and growing; a committee on a modest village PC will feel a sluggish grid immediately. Knowing which optimisations are free (stable ids, memoised columns) versus which to defer (virtualization until thousands of rows) keeps the app fast without over-engineering the common case.',
          steps: [
            'Keep `getRowId` stable and columns memoised — the free, always-on wins.',
            'Keep cell components light: a plain checkbox, a cheap formatted total, no heavy work per cell.',
            'Measure a real large slice before optimising — confirm scroll is actually slow.',
            'For thousands of rows, add `@tanstack/react-virtual` to render only visible rows + overscan.',
            'Give rows a measured height and pad the scroll container so the scrollbar reflects the full count.',
            'Do NOT virtualize small slices — the added complexity is not worth it under a few hundred rows.',
          ],
          code: `// Virtualize only when a slice is large. Most Magane slices skip this entirely.
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualBody({ table, parentRef }: { table: Table<Row>; parentRef: RefObject<HTMLDivElement> }) {
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,   // measured row height in px
    overscan: 8,              // render a few extra above/below the viewport
  });
  return (
    <tbody style={{ height: \${virtualizer.getTotalSize()}px, position: 'relative' }}>
      {virtualizer.getVirtualItems().map((vi) => {
        const row = rows[vi.index];
        return (
          <tr key={row.id} style={{ position: 'absolute', transform: \translateY(\${vi.start}px) }}>
            {/* ...flexRender the visible cells... */}
          </tr>
        );
      })}
    </tbody>
  );
}`,
          pitfalls: [
            'Reaching for virtualization at 80 rows — paying real complexity for no measurable gain.',
            'Heavy per-cell work (expensive INR formatting recomputed needlessly) that drags even a small grid.',
            'Rebuilding columns or row data every render, defeating memoisation and DOM reuse.',
            'Wrong `estimateSize` for the virtualizer, so the scrollbar and row positions drift.',
            'Forgetting that an \'all Maganes\' view could hit ~2280 rows and skipping virtualization there.',
            'Index-based row keys under virtualization, which recycle DOM and scramble interactive state.',
          ],
          tryIt:
            'Seed a Magane with ~1500 dummy households and scroll the non-virtualized grid — note the jank. Then wrap the body in `useVirtualizer` and scroll again; confirm only a handful of `<tr>`s exist in the DOM at any moment.',
          takeaway:
            'For typical Magane slices, stable ids + memoised columns + light cells are enough. Reserve virtualization (`@tanstack/react-virtual`) for the rare slice approaching thousands of rows toward the full 2280 — and measure before adding it.',
        },
      ],
    },
    {
      id: 'm5-s3',
      title: 'Inline checkboxes that auto-persist',
      topics: [
        {
          id: 'm5-t9',
          title: 'Toggling a Checkbox Calls setParticipation',
          explain:
            'When a checkbox flips, call **`window.api.register.setParticipation(entryId, poojaTypeId, checked)`** — a single IPC write that ticks or un-ticks that one household\'s participation in that one pooja, with no Save button.',
          analogy:
            'It is exactly like the committee member putting a tick (or scratching one out) in the box where a household\'s row meets a pooja column. One mark, one box. You do not re-write the whole page to record a single tick — you just mark that cell.',
          theory:
            'Participation is the join between a household and a pooja **for a given year** — a `Participation` row, or the absence of one. Toggling a checkbox should write exactly that one fact. So the checkbox\'s `onChange` calls `window.api.register.setParticipation(entryId, poojaTypeId, checked)`, a typed IPC method exposed via `contextBridge` whose **main process** handler uses Prisma to either create or delete the participation row (an \'upsert/delete\' on the composite key). The renderer never touches Prisma directly — it speaks `window.api`.\n\nThere is **no Save button**. In a fast-ticking workflow, asking the user to remember to save is a recipe for lost data; instead each tick persists immediately. Because the write is a tiny local database operation over IPC, it completes in milliseconds — but it is still asynchronous, which is exactly why the next topics add an **optimistic update** so the checkbox flips instantly rather than waiting for the round-trip.\n\nKeep the call **idempotent and explicit**: pass the desired final state (`checked: true/false`), not a \'toggle\' instruction, so a double event or a retry cannot leave the box in the wrong state. The handler then makes the database match that boolean — create the row if `true` and missing, delete it if `false` and present. This explicit-state design is what makes the optimistic version safe to roll back.',
          whyItMatters:
            'This single IPC call is the unit of work for the entire grid — the committee ticks thousands of these boxes across a year. Making each tick a tiny, explicit, save-less write is what lets a member rattle through 50 households without ever stopping to save, and what the optimistic layer builds on.',
          steps: [
            'In the checkbox cell\'s `onChange`, read `e.target.checked` as the desired final state.',
            'Call `window.api.register.setParticipation(entryId, poojaTypeId, checked)`.',
            'Expose `setParticipation` via `contextBridge`; the main process runs Prisma.',
            'Make the handler create the Participation row when `true`, delete it when `false`.',
            'Pass the explicit boolean, not a \'toggle\' — idempotent against double events/retries.',
            'Ship no Save button — each tick persists on its own.',
          ],
          code: `// preload.ts — typed bridge; renderer never imports Prisma.
contextBridge.exposeInMainWorld('api', {
  register: {
    setParticipation: (entryId: string, poojaTypeId: string, checked: boolean) =>
      ipcRenderer.invoke('register:setParticipation', { entryId, poojaTypeId, checked }),
  },
});

// main process handler — make the DB match the explicit boolean (idempotent).
ipcMain.handle('register:setParticipation', async (_e, { entryId, poojaTypeId, checked }) => {
  if (checked) {
    await prisma.participation.upsert({
      where: { entryId_poojaTypeId: { entryId, poojaTypeId } },
      create: { entryId, poojaTypeId },
      update: {}, // already exists — nothing to change
    });
  } else {
    await prisma.participation.deleteMany({ where: { entryId, poojaTypeId } });
  }
  return { ok: true };
});`,
          pitfalls: [
            'Sending a \'toggle\' instruction instead of the explicit final boolean, so a duplicate event un-does the tick.',
            'Calling Prisma from the renderer instead of going through `window.api` — breaks the process boundary.',
            'Adding a Save button to a fast-ticking grid, guaranteeing someone forgets and loses ticks.',
            'Using `create` (not upsert) on `true`, which throws if the participation already exists.',
            'Forgetting the composite unique key on `(entryId, poojaTypeId)`, allowing duplicate participations.',
            'Treating the millisecond IPC write as instant in the UI — it is async; do not block the checkbox on it.',
          ],
          tryIt:
            'Tick a box, fully close and reopen the app, and confirm the tick is still there — proof it persisted with no Save button. Then tick and immediately un-tick fast and confirm the final database state matches the last click.',
          takeaway:
            'Each checkbox toggle is one explicit IPC write — `setParticipation(entryId, poojaTypeId, checked)` — that makes the database match the desired boolean. No Save button, idempotent against retries, and the foundation the optimistic update sits on.',
        },
        {
          id: 'm5-t10',
          title: 'Optimistic Updates With useMutation',
          explain:
            'Wrap the tick in a TanStack **`useMutation`** with an optimistic update — flip the checkbox in the cache **instantly**, then let the IPC write confirm in the background and **roll back** if it fails.',
          analogy:
            'When the committee member ticks a box, the tick appears under their pen at once — they do not wait for the ink to dry before moving to the next household. Optimistic updates give the UI that pen-on-paper immediacy: the box flips now, and the actual save catches up a beat later.',
          theory:
            'Even a millisecond IPC round-trip, multiplied across a rush of ticking, would make the grid feel laggy if every checkbox waited for confirmation. The fix is **optimistic updates**: in `useMutation`\'s `onMutate`, you immediately patch the cached register data so the checkbox shows the new state, and you do it *before* the write returns. The user sees an instant flip; the real persistence happens behind it.\n\nThe shape is standard TanStack Query. `onMutate` first **cancels** any in-flight refetch for the `[\'register\', yearId, maganeId]` key (so a stale fetch cannot clobber your optimistic change), **snapshots** the current cached data, then writes the optimistic version with `queryClient.setQueryData` — adding or removing the `poojaTypeId` from that row\'s `ticked` Set. It returns the snapshot as context. If the mutation **errors**, `onError` restores the snapshot — the box flips back and the user sees it never really saved. `onSettled` invalidates the key so the cache re-syncs with the database either way.\n\nThe critical detail is updating the **right row immutably**. Because you keyed rows by entry id, you can find that row in the cached `entries` and produce a new `ticked` Set (never mutate the old one), so React and Query both see a change. Done right, ticking 50 households feels instant, a rare failure quietly reverts the one box that did not save, and the cache always ends up matching the database.',
          whyItMatters:
            'Optimistic updates are the difference between a grid that feels like paper and one that feels like a slow web form. They let a committee member tick household after household with zero perceived latency, while the rollback guarantees that a failed write never silently leaves a phantom tick on screen.',
          steps: [
            'Create a `useMutation` whose `mutationFn` calls `window.api.register.setParticipation(...)`.',
            'In `onMutate`, `cancelQueries` for `[\'register\', yearId, maganeId]` to stop a clobbering refetch.',
            'Snapshot current data with `getQueryData`, then optimistically patch it with `setQueryData`.',
            'Update the target row immutably — build a NEW `ticked` Set adding/removing the poojaTypeId.',
            'In `onError`, restore the snapshot from context so the box flips back.',
            'In `onSettled`, `invalidateQueries` so the cache re-syncs with the database.',
          ],
          code: `// useToggleParticipation.ts — flip instantly, roll back on failure.
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useToggleParticipation(yearId: string, maganeId: string) {
  const qc = useQueryClient();
  const key = ['register', yearId, maganeId];

  return useMutation({
    mutationFn: (v: { entryId: string; poojaTypeId: string; checked: boolean }) =>
      window.api.register.setParticipation(v.entryId, v.poojaTypeId, v.checked),

    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<RegisterData>(key);
      qc.setQueryData<RegisterData>(key, (old) => old && {
        ...old,
        entries: old.entries.map((e) => {
          if (e.id !== v.entryId) return e;
          const ids = new Set(e.poojaTypeIds);     // new Set — never mutate the old one
          v.checked ? ids.add(v.poojaTypeId) : ids.delete(v.poojaTypeId);
          return { ...e, poojaTypeIds: [...ids] };
        }),
      });
      return { prev };
    },
    onError: (_err, _v, ctx) => { if (ctx?.prev) qc.setQueryData(key, ctx.prev); }, // roll back
    onSettled: () => qc.invalidateQueries({ queryKey: key }),                       // re-sync
  });
}`,
          pitfalls: [
            'Skipping `cancelQueries`, so an in-flight refetch lands after your optimistic patch and overwrites it.',
            'Mutating the existing `ticked` Set or entries array, so React/Query miss the change and the box does not flip.',
            'Not returning the snapshot from `onMutate`, leaving `onError` nothing to roll back to.',
            'Forgetting `onSettled` invalidation, so a transient divergence between cache and DB lingers.',
            'Matching the wrong row because the key is the array index, not the entry id — flips a neighbour\'s box.',
            'Swallowing the error silently with no rollback, leaving a phantom tick the committee will trust.',
          ],
          tryIt:
            'Tick a box and confirm it flips before any await resolves. Then make `setParticipation` throw once, tick again, and watch the box flip on and then snap back — that is the rollback. Reopen the app to confirm the rolled-back tick never saved.',
          takeaway:
            'A `useMutation` with `onMutate` (cancel, snapshot, optimistic `setQueryData`), `onError` (restore the snapshot), and `onSettled` (invalidate) makes every tick feel instant while guaranteeing a failed write never leaves a phantom tick.',
        },
        {
          id: 'm5-t11',
          title: 'Locked Years Render the Grid Read-Only',
          explain:
            'When the selected year\'s **`isLocked`** is true, render the whole grid **read-only** — checkboxes disabled, no toggles fire — so a finalised register cannot be changed by accident.',
          analogy:
            'Once the committee closes and signs off a year\'s register, the book goes into the cupboard — you can read it, cross-check it, even photocopy it, but you do not pencil in new ticks. A locked year is that signed-off book: visible, but not editable.',
          theory:
            'Each Year carries an `isLocked` flag (added in Module 4) that the committee sets when a year is finalised. The grid must **respect** it: a locked slice is for viewing and reporting, not editing. The simplest, safest implementation makes lockedness flow through the UI — pass `isLocked` (or a derived `readOnly`) into the table, and every checkbox renders with `disabled={isLocked}` so it cannot be clicked at all.\n\nDisabling the input is the visible half; the **guard in the handler** is the safety half. Even if a stray event or a programmatic call slips through, the toggle handler should early-return when the year is locked: `if (isLocked) return;` before calling the mutation. Belt and braces — the disabled attribute stops the click, and the guard stops everything else. The grid stays fully rendered (rows, columns, totals all visible), only the interactivity is removed.\n\nIt helps to make the locked state **obvious**, not just inert. A small \'Locked\' badge near the year picker, slightly muted checkboxes, perhaps a tooltip explaining why ticking is disabled — so a member is not left wondering why the boxes will not respond. The totals still compute and display (people often open a locked year precisely to read its totals), but nothing about the year\'s participation can change. This is data integrity: a finalised register is a record, and records should not drift.',
          whyItMatters:
            'A temple\'s finalised year register is an official financial record — accidental ticks after sign-off would corrupt it and could cause real disputes over who paid for what. Honouring `isLocked` end to end (disabled inputs plus a handler guard) is what makes the committee trust the app with their closed books.',
          steps: [
            'Read the selected year\'s `isLocked` and pass it (or `readOnly`) into the table.',
            'Render each checkbox with `disabled={isLocked}` so it cannot be clicked.',
            'Guard the toggle handler: `if (isLocked) return;` before calling the mutation.',
            'Keep rows, columns and ₹ totals fully visible — only interactivity is removed.',
            'Show a clear \'Locked\' badge / muted styling so users understand why ticking is off.',
            'Confirm a locked slice still opens for reading and reporting.',
          ],
          code: `// The checkbox cell respects the locked year — disabled input AND a handler guard.
function ToggleCell({ row, poojaId, isLocked, onToggle }: ToggleCellProps) {
  return (
    <input
      type='checkbox'
      checked={row.ticked.has(poojaId)}
      disabled={isLocked}                       // visible half: cannot be clicked
      onChange={(e) => {
        if (isLocked) return;                   // safety half: ignore stray events
        onToggle(row.id, poojaId, e.target.checked);
      }}
    />
  );
}

// Near the year picker, make the state obvious:
{year.isLocked && <span className='badge locked'>Locked — read only</span>}`,
          pitfalls: [
            'Disabling the checkbox visually but leaving the handler ungarded, so a programmatic event still writes.',
            'Hiding the whole grid when locked — users open locked years precisely to read totals.',
            'No visible \'Locked\' cue, leaving members confused about why boxes will not tick.',
            'Checking `isLocked` only in the renderer and not in the main process — defence in depth matters for records.',
            'Letting the ₹ totals stop computing when locked, breaking the reporting use-case.',
            'Re-enabling toggles after a refetch because the `isLocked` flag was dropped from the cached year.',
          ],
          tryIt:
            'Lock the current year (set `isLocked`) and confirm every checkbox is disabled and unclickable, while the rows and ₹ totals still display. Try calling the toggle handler directly and confirm the guard blocks the write.',
          takeaway:
            'A locked year renders the grid read-only end to end: `disabled` checkboxes plus an `if (isLocked) return;` handler guard, with rows and totals still visible. A finalised register is a record — it stays readable but unchangeable.',
        },
        {
          id: 'm5-t12',
          title: 'A "Saved" Indicator & Debounced Writes',
          explain:
            'Give the committee a quiet **\'saved\' indicator** so they trust the save-less grid, and **debounce** rapid toggles on the same cell so a flurry of clicks collapses into one settled write.',
          analogy:
            'A good clerk does not announce every single tick — but if you ask, they can show you the page is **fully recorded**. And if you keep flicking your pen on the same box, they wait for you to settle before writing the final state into the book, rather than scribbling and erasing over and over.',
          theory:
            'Because there is no Save button, users need **reassurance** that their ticks are stored. A subtle indicator — a brief \'Saved\' flash near the grid, or a per-row tick mark that settles after the write confirms — closes that trust gap. Drive it off the mutation lifecycle: show \'Saving…\' while `isPending`, \'Saved\' on success, and an error state on failure. It should be calm and peripheral, not a modal — the committee is ticking fast and does not want interruptions.\n\n**Debouncing** addresses a different problem: a user who double-clicks or rapidly flips the same checkbox would otherwise fire several `setParticipation` writes in a row, each racing the others. Debouncing the write **per cell** means you wait a short, settle-time window (say 250–400ms) after the last toggle on that cell, then send a single write with the final state. The optimistic UI still flips instantly on every click — debouncing only collapses the **persistence**, not the visual feedback. So the user sees immediate response and the database sees one clean write.\n\nThe two features work together. Optimistic updates make the screen instant; the saved indicator confirms persistence; debouncing keeps a jittery user from generating a storm of half-cancelling writes. Combined with the explicit-boolean `setParticipation` from earlier, the worst case of someone hammering a checkbox resolves to exactly one write carrying the correct final state — and the per-row and per-Magane ₹ totals recompute as ticks settle, so the money always reflects what is actually saved.',
          whyItMatters:
            'A save-less grid only works if users believe it. A quiet \'saved\' indicator earns that belief, while per-cell debouncing protects the database from a flurry of racing writes when someone double-clicks — together they make fast ticking both reassuring and robust. And recomputed totals keep the rupee figures honest as ticks change.',
          steps: [
            'Drive a peripheral indicator off the mutation: \'Saving…\' on `isPending`, \'Saved\' on success, error on failure.',
            'Keep it calm and non-blocking — a small badge or row tick, never a modal.',
            'Debounce the persistence per cell: wait ~250–400ms after the last toggle, then write the final state.',
            'Keep the optimistic flip instant — debounce only the IPC write, not the visual change.',
            'Send one write with the settled boolean, collapsing a flurry of clicks into a single persist.',
            'Recompute per-row and per-Magane ₹ totals from the (optimistic) ticked state as it changes.',
          ],
          code: `// Per-cell debounce: instant optimistic flip, one settled write after the clicks stop.
function useDebouncedToggle(toggle: ReturnType<typeof useToggleParticipation>) {
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  return (entryId: string, poojaTypeId: string, checked: boolean) => {
    const key = \${entryId}:\${poojaTypeId};
    // optimistic UI flips immediately inside the mutation's onMutate;
    // here we only debounce the actual persist call:
    clearTimeout(timers.current.get(key));
    timers.current.set(key, setTimeout(() => {
      toggle.mutate({ entryId, poojaTypeId, checked }); // final state after clicks settle
      timers.current.delete(key);
    }, 300));
  };
}

// Peripheral indicator, driven by the mutation status:
{toggle.isPending ? <span className='save-state'>Saving…</span>
 : toggle.isError ? <span className='save-state err'>Not saved</span>
 : <span className='save-state ok'>Saved</span>}`,
          pitfalls: [
            'Debouncing the optimistic flip too, so the checkbox feels laggy — debounce only the write.',
            'A loud, blocking \'Saved!\' modal that interrupts a fast-ticking workflow.',
            'No saved indicator at all, leaving users unsure whether their save-less ticks stuck.',
            'Debouncing globally instead of per cell, so a tick on one box cancels a pending write on another.',
            'Never flushing pending debounced writes on screen exit, so the last tick is lost on navigation.',
            'Recomputing totals from the (possibly rolled-back) stale cache instead of the current optimistic state.',
          ],
          tryIt:
            'Rapidly click the same checkbox ten times and watch the network/IPC log — confirm only one settled write fires after you stop. Then navigate away mid-debounce and confirm you flush the pending write so nothing is lost.',
          takeaway:
            'Pair the optimistic grid with a calm \'saved\' indicator (driven by mutation status) and per-cell debounced writes so a flurry of clicks collapses into one settled persist — while the optimistic flip stays instant and the ₹ totals track the live ticked state.',
        },
        {
          id: 'm5-t13',
          title: 'Recomputing ₹ Totals As Ticks Change',
          explain:
            'Compute the per-row and per-Magane **rupee totals** by summing the rates of the **ticked** poojas, derived from the live (optimistic) state and formatted with **Indian digit grouping**.',
          analogy:
            'At the bottom of each register page the clerk tallies what every household owes and what the whole **Magane section** comes to. Every time a tick changes, that tally changes. Our totals are that running sum — recomputed the instant a box flips, written in the familiar **₹1,23,456** style.',
          theory:
            'A household\'s total is simply **Σ rate** over the poojas it has ticked: for each ticked `poojaTypeId`, look up that pooja\'s `rate` for the year and add it. Because the ticked state lives in the row\'s `ticked` Set (kept current by the optimistic mutation), this is a derived value — never stored on the row — so it is always correct the moment a checkbox flips. The per-Magane total is the same idea one level up: sum every row\'s total across the slice.\n\nDerive these with `useMemo` so they recompute only when the relevant data changes, not on every render. The per-row total memoises on that row\'s `ticked` Set and the year\'s rates; the per-Magane total memoises on the whole rows array. Keep the computation pure and cheap — it runs across hundreds of households, so it must be a tight sum, not anything heavy per cell.\n\nFormatting matters because the audience is Indian: money should use **Indian digit grouping** (lakhs/crores: 1,23,456 not 123,456) and a ₹ symbol. The reliable way is `Intl.NumberFormat(\'en-IN\', { style: \'currency\', currency: \'INR\', maximumFractionDigits: 0 })`, which handles the grouping for you. Because the totals derive from the optimistic state, a tick instantly nudges both the row total and the Magane total — so a member ticking poojas watches the money add up live, which is exactly the feedback the committee wants while working through a section.',
          whyItMatters:
            'The whole point of the register is the money — who owes what and what the Magane collects. Totals that derive from live ticked state and recompute instantly mean the committee sees the rupee figures change as they work, and Indian grouping makes those figures read naturally to everyone using the app.',
          steps: [
            'For a row, sum `rate` over the poojas in its `ticked` Set — derive, never store.',
            'For the Magane, sum every row\'s total across the slice.',
            'Memoise the per-row total on `ticked` + rates, and the Magane total on the rows array.',
            'Pull rates from the year\'s `poojaTypes` (the rate is per-year, set in Module 4).',
            'Format with `Intl.NumberFormat(\'en-IN\', { style: \'currency\', currency: \'INR\' })`.',
            'Let the totals track the optimistic state so they update the instant a box flips.',
          ],
          code: `// totals.ts — derive rupee totals from the live ticked state; format Indian-style.
import type { Row } from './useRegisterRows';
import type { PoojaType } from './useRegister';

export function rowTotal(row: Row, poojaTypes: PoojaType[]): number {
  return poojaTypes.reduce((sum, p) => (row.ticked.has(p.id) ? sum + p.rate : sum), 0);
}

export function maganeTotal(rows: Row[], poojaTypes: PoojaType[]): number {
  return rows.reduce((sum, r) => sum + rowTotal(r, poojaTypes), 0);
}

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});
export const formatINR = (n: number) => inr.format(n); // e.g. ₹1,23,456 (lakh grouping)`,
          pitfalls: [
            'Freezing the total onto the row, so it goes stale the instant a checkbox is ticked.',
            'Using Western grouping (123,456) instead of Indian lakh grouping (1,23,456) — looks wrong to users.',
            'Summing from the database instead of the live optimistic state, so the total lags the tick.',
            'Looking up rates from the wrong year, since rates are per-year (Module 4) — mixing years inflates totals.',
            'Recomputing the Magane total on every render with no memoisation, dragging a large grid.',
            'Floating-point drift if rates were stored as floats — keep rupee rates as integers (paise/whole rupees).',
          ],
          tryIt:
            'Tick a few poojas on one household and watch its ₹ cell and the Magane total both jump immediately. Then switch to a year with different rates and confirm the same ticks produce different totals — proof the rate is per-year.',
          takeaway:
            'Derive rupee totals — never store them — by summing ticked poojas\' per-year rates, memoised and read from the live optimistic state, and format with `Intl.NumberFormat(\'en-IN\', …)` so the money updates instantly and reads in familiar Indian grouping.',
        },
        {
          id: 'm5-t14',
          title: 'Putting the Grid Together End to End',
          explain:
            'Assemble the full screen — pickers → `useQuery` → shaped rows → TanStack Table → optimistic checkbox mutation → live totals → locked-year guard — into one coherent **RegisterScreen** the committee actually uses.',
          analogy:
            'You have made the board of poojas, the rows of households, the ticking pen, the running tally and the lock on a closed book. Now you bind them into a single working register page — the one a committee member opens, picks their section, and works down ticking poojas while the totals climb.',
          theory:
            'The pieces from this module compose into one flow. The **RegisterScreen** owns the two pickers and the selected year\'s `isLocked` flag. It renders **RegisterGrid**, which runs `useRegister(yearId, maganeId)` for the slice, handles loading/empty/error, and shapes the payload into rows. The rows and the year\'s `poojaTypes` feed **RegisterTable**, which builds columns with `createColumnHelper`, renders header and body with `flexRender`, and keeps row identity via `getRowId`.\n\nThe interactive spine is the **checkbox cell**: it reads `ticked.has(poojaId)`, respects `isLocked` (disabled + guard), and on change calls the **optimistic `useToggleParticipation` mutation** — flipping the cache instantly, persisting via `setParticipation` over IPC, rolling back on error, and re-syncing on settle. Around it sit the **debounced writes**, the **saved indicator**, and the **derived ₹ totals** that track the optimistic state.\n\nThe boundaries stay clean throughout. The renderer never imports Prisma — it only ever calls `window.api`. Text is never edited inline; the name cell is read-only and opens the Module 6 modal. Locked years are read-only end to end. Get this composition right and you have the app\'s defining screen: a fast, paper-like register where picking a Magane and year shows the households, ticking a pooja persists instantly and safely, totals climb live, and a finalised year is safely frozen. The remaining modules build reporting, printing and backup on top of exactly this grid.',
          whyItMatters:
            'This is the screen the committee lives in — every other module exists to feed or extend it. Seeing how the pickers, query, table, optimistic mutation, totals and lock compose into one coherent component is what turns a pile of hooks into the working register the temple actually relies on.',
          steps: [
            'RegisterScreen holds `yearId`, `maganeId` and the year\'s `isLocked`, and renders the pickers.',
            'RegisterGrid runs `useRegister`, handles loading/empty/error, and shapes rows.',
            'RegisterTable builds columns, renders with `flexRender`, and sets `getRowId`.',
            'The checkbox cell wires the optimistic `useToggleParticipation` mutation and respects `isLocked`.',
            'Layer in debounced writes, the saved indicator, and live ₹ totals from the optimistic state.',
            'Keep boundaries: only `window.api` (no Prisma in the renderer), and the name cell read-only.',
          ],
          code: `// RegisterScreen.tsx — the whole grid composed end to end.
export function RegisterScreen() {
  const { years, maganes } = usePickers();
  const [yearId, setYearId] = useState(years[0]?.id);
  const [maganeId, setMaganeId] = useState(maganes[0]?.id);
  const year = years.find((y) => y.id === yearId);

  return (
    <div className='register-screen'>
      <Pickers years={years} maganes={maganes}
               yearId={yearId} maganeId={maganeId}
               onYear={setYearId} onMagane={setMaganeId}
               locked={year?.isLocked} />
      {yearId && maganeId && (
        <RegisterGrid
          yearId={yearId}
          maganeId={maganeId}
          isLocked={!!year?.isLocked}   // disables every toggle + guards the handler
        />
      )}
    </div>
  );
}
// RegisterGrid -> useRegister -> useRegisterRows -> RegisterTable
//   -> checkbox cell -> useToggleParticipation (optimistic) -> setParticipation (IPC)
//   -> derived ₹ totals (Intl en-IN), debounced writes, saved indicator.`,
          pitfalls: [
            'Letting Prisma leak into the renderer instead of routing every write through `window.api`.',
            'Forgetting to thread `isLocked` all the way to the checkbox, so a finalised year stays editable.',
            'Dropping the read-only name rule under deadline, reopening the Kannada inline-edit corruption risk.',
            'Composing the totals from stored row values instead of the live optimistic state, so money lags ticks.',
            'Mixing the two pickers\' state up, so the query loads the wrong year-and-Magane slice.',
            'Skipping the loading/empty/error guards in the assembled screen, crashing on the first render.',
          ],
          tryIt:
            'Open the finished RegisterScreen, pick a Magane and the current year, tick several poojas across households, and watch the totals climb instantly. Then lock the year and confirm the whole grid goes read-only while the totals still display.',
          takeaway:
            'The register screen composes pickers → `useQuery` → shaped rows → TanStack Table → optimistic checkbox mutation → live ₹ totals → locked-year guard, with clean boundaries (only `window.api`, read-only name). This is the app\'s defining screen everything else builds on.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm5-p1',
      type: 'Project',
      title: 'Register Grid',
      domain: 'Village temple register / Electron + React + TypeScript + Prisma + local PostgreSQL',
      duration: '4.5 hours',
      description:
        'Build the Upralli Seva register grid: a RegisterScreen that picks a Magane and a Year, loads that slice of households with TanStack Query, and renders a TanStack Table with a serial-number column, a read-only Kannada name/address column, one checkbox column per pooja type, and a per-row ₹ total in Indian grouping — with clean loading, empty and error states.',
      tools: ['Electron', 'React 18', 'TypeScript', 'TanStack Query', 'TanStack Table', 'Prisma', 'PostgreSQL', 'contextBridge / IPC'],
      blueprint: {
        overview:
          'Stand up the read path of the register grid: two pickers drive a useQuery keyed by year + Magane, the payload is shaped into stable rows with an O(1) ticked Set, and a headless TanStack Table renders fixed columns plus dynamic Kannada pooja columns and a per-row ₹ total — all behind honest loading/empty/error states, with the name cell read-only.',
        functionalRequirements: [
          '**Two pickers.** A Year select (desc, defaulting to the most recent) and a Magane select that together decide which slice of the register loads.',
          '**Query the slice.** `useQuery([\'register\', yearId, maganeId], …)` calling `window.api.register.listEntries`, returning `{ entries, poojaTypes }`.',
          '**Headless table.** A TanStack Table with serial-no, read-only Kannada name/address, one checkbox column per pooja type, and a per-row ₹ total.',
          '**Indian-grouped totals.** Per-row ₹ totals sum the ticked poojas\' per-year rates, formatted with `Intl.NumberFormat(\'en-IN\', …)`.',
          '**Honest states.** Distinct loading, empty (\'no households yet\') and error renders, with the name cell read-only (click opens the Module 6 modal).',
        ],
        technicalImplementation: [
          '**Pickers.** Controlled `<select>`s storing `yearId`/`maganeId` ids, defaulting the year to the most recent and the Magane to the first.',
          '**Query + shaping.** A `useRegister` hook keyed by year + Magane, and a memoised `useRegisterRows` turning entries into `{ id, serialNo, name, ticked:Set }` sorted by serialNo.',
          '**Columns.** `createColumnHelper<Row>()` with accessor columns for serial/name and `poojaTypes.map` building dynamic display checkbox columns plus a ₹ total display column.',
          '**Render.** `useReactTable` + `getCoreRowModel` + `getRowId`, drawing `<thead>`/`<tbody>` with `flexRender`, Kannada `kn` class on pooja headers and the name cell.',
          '**States.** Guard `isLoading`, then `isError` (with retry), then `entries.length === 0` before rendering the table.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Pickers + TanStack Query slice',
            outcome: 'Two pickers load the right year-and-Magane slice of households into the cache.',
            prompt:
              'In an Electron + React 18 + TypeScript renderer using TanStack Query, build a RegisterScreen with two controlled <select> pickers: a Year select listing years descending and defaulting to the most recent, and a Magane select defaulting to the first Magane, both storing ids (not labels) in state. Add a useRegister(yearId, maganeId) hook that calls useQuery with queryKey [\'register\', yearId, maganeId] and queryFn () => window.api.register.listEntries(yearId, maganeId), returning { entries, poojaTypes } where each entry carries its ticked poojaTypeIds. Render distinct isLoading, isError (with a refetch retry button), and empty (\'No households in this Magane yet\') states before anything else. The renderer must only ever call window.api — never import Prisma.',
          },
          {
            step: 2,
            label: 'Shape rows + build TanStack Table columns',
            outcome: 'The payload becomes stable rows and a headless table with dynamic pooja columns.',
            prompt:
              'Add a memoised useRegisterRows(data) that turns each entry into { id, serialNo, name, ticked: new Set(poojaTypeIds) } sorted ascending by serialNo, and returns { rows, poojaTypes }. Then build columns with createColumnHelper<Row>(): an accessor column for serialNo (\'Sl. No.\'), an accessor column for name (\'Name & Address\') rendered read-only in a span with className \'kn\', poojaTypes.map producing one display checkbox column per pooja (id = pooja id, header = the Kannada pooja name in a \'kn\' span, cell = a checkbox reflecting row.ticked.has(pooja.id)), and a final display \'₹ Total\' column. Memoise the columns on poojaTypes.',
          },
          {
            step: 3,
            label: 'Render with flexRender + Indian-grouped ₹ totals',
            outcome: 'A working register grid with Kannada headers, read-only names and live rupee totals.',
            prompt:
              'Render the grid with useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel(), getRowId: (r) => r.id }). Draw <thead> from table.getHeaderGroups() and <tbody> from table.getRowModel().rows, using flexRender for every header and cell and keying <tr> by row.id. Implement the ₹ total: a rowTotal(row, poojaTypes) that sums p.rate for each ticked pooja, formatted by Intl.NumberFormat(\'en-IN\', { style: \'currency\', currency: \'INR\', maximumFractionDigits: 0 }) so it reads like ₹1,23,456. Make the name cell read-only (a button styled as text whose click calls onEditPerson(row.id)) — never contentEditable. Confirm switching the Year picker to a year with different poojas changes the checkbox columns with no code edit.',
          },
        ],
        deliverable:
          'A working register grid: a RegisterScreen whose two pickers drive a TanStack Query slice, shaped into stable rows and rendered as a TanStack Table with a serial column, a read-only Kannada name column, dynamic pooja checkbox columns and a per-row ₹ total in Indian grouping — behind clean loading, empty and error states.',
      },
    },
    {
      id: 'm5-p2',
      type: 'Project',
      title: 'Optimistic Ticking',
      domain: 'Village temple register / Electron + React + TypeScript + Prisma + local PostgreSQL',
      duration: '4.5 hours',
      description:
        'Make the register grid tick instantly: wire each checkbox column to window.api.register.setParticipation through an optimistic useMutation that flips the cache immediately and rolls back on failure, add a calm saved indicator and per-cell debounced writes, recompute per-row and per-Magane ₹ totals from the live state, and disable every toggle when the selected year isLocked.',
      tools: ['Electron', 'React 18', 'TypeScript', 'TanStack Query', 'TanStack Table', 'Prisma', 'PostgreSQL', 'contextBridge / IPC'],
      blueprint: {
        overview:
          'Make the grid write instantly and safely: an optimistic useMutation flips the ticked Set in the cache before setParticipation persists over IPC and rolls back on error, per-cell debouncing collapses click flurries into one settled write, a peripheral saved indicator reflects mutation status, ₹ totals track the optimistic state, and a locked year disables every toggle end to end.',
        functionalRequirements: [
          '**Toggle persists.** Each checkbox change calls `window.api.register.setParticipation(entryId, poojaTypeId, checked)` with the explicit final boolean — no Save button.',
          '**Optimistic update.** A `useMutation` flips the cached `ticked` state instantly in `onMutate` and restores a snapshot in `onError`.',
          '**Debounce + saved indicator.** Per-cell debounced writes (~300ms) collapse rapid clicks into one persist, with a calm \'Saving…/Saved\' indicator.',
          '**Live ₹ totals.** Per-row and per-Magane rupee totals recompute from the optimistic ticked state, formatted with Indian grouping.',
          '**Locked-year guard.** When the year `isLocked`, every checkbox is `disabled` and the toggle handler early-returns, while rows and totals stay visible.',
        ],
        technicalImplementation: [
          '**Mutation.** `useToggleParticipation(yearId, maganeId)` with `onMutate` (cancelQueries, snapshot, optimistic setQueryData on a new ticked Set), `onError` (restore), `onSettled` (invalidate).',
          '**IPC write.** `setParticipation` exposed via contextBridge; the main handler upserts the Participation row on true and deletes it on false (idempotent on the composite key).',
          '**Debounce.** A per-cell `Map` of timers keyed by `entryId:poojaTypeId`, flushing one `mutate` with the final state ~300ms after the last toggle.',
          '**Totals.** A memoised `rowTotal`/`maganeTotal` summing ticked per-year rates, formatted via `Intl.NumberFormat(\'en-IN\', …)`.',
          '**Lock.** Thread `isLocked` into the checkbox cell for `disabled` plus an `if (isLocked) return;` guard in the handler.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Optimistic toggle mutation + IPC write',
            outcome: 'Checkboxes flip instantly and persist, rolling back cleanly on failure.',
            prompt:
              'Expose window.api.register.setParticipation(entryId, poojaTypeId, checked) via contextBridge, with a main-process handler that upserts a Participation row when checked is true and deleteMany when false (idempotent on the composite (entryId, poojaTypeId) key) using Prisma. Then build a useToggleParticipation(yearId, maganeId) hook returning a TanStack useMutation whose mutationFn calls setParticipation. In onMutate: await cancelQueries for [\'register\', yearId, maganeId], snapshot the cached RegisterData with getQueryData, and optimistically setQueryData by mapping to the target entry and building a NEW Set from poojaTypeIds (add or delete poojaTypeId) — never mutate the old Set; return { prev }. In onError restore ctx.prev; in onSettled invalidateQueries. Wire each checkbox cell\'s onChange to call mutate with e.target.checked.',
          },
          {
            step: 2,
            label: 'Debounced writes + saved indicator + live totals',
            outcome: 'Rapid clicks collapse into one write, users see \'Saved\', and totals track ticks.',
            prompt:
              'Add per-cell debouncing: a useRef Map of timers keyed by \`\${entryId}:\${poojaTypeId}\`; on toggle, clear any existing timer and set a ~300ms timeout that calls toggle.mutate({ entryId, poojaTypeId, checked }) with the final state, so a flurry of clicks on one box collapses into a single persist while the optimistic flip stays instant. Add a calm, non-blocking saved indicator driven by mutation status: \'Saving…\' when isPending, \'Saved\' on success, \'Not saved\' on error. Recompute per-row and per-Magane ₹ totals from the live optimistic ticked state with a memoised rowTotal/maganeTotal summing each ticked pooja\'s per-year rate, formatted by Intl.NumberFormat(\'en-IN\', { style: \'currency\', currency: \'INR\', maximumFractionDigits: 0 }). Flush any pending debounced write on screen exit.',
          },
          {
            step: 3,
            label: 'Locked-year read-only guard',
            outcome: 'A finalised year renders fully read-only while still showing rows and totals.',
            prompt:
              'Thread the selected year\'s isLocked flag into the checkbox cell. Render each checkbox with disabled={isLocked} so it cannot be clicked, and guard the toggle handler with an early if (isLocked) return; before mutating — belt and braces so even a stray or programmatic event cannot write to a locked year. Keep all rows, columns and ₹ totals fully visible and computing (people open locked years to read totals), and show a clear \'Locked — read only\' badge near the year picker. Verify that locking the current year disables every checkbox while the totals still display, and that calling the toggle handler directly does nothing.',
          },
        ],
        deliverable:
          'A fully interactive register grid: every checkbox ticks instantly via an optimistic useMutation that persists with setParticipation and rolls back on error, with per-cell debounced writes, a calm saved indicator, live Indian-grouped ₹ totals, and a locked-year guard that disables all toggles while keeping the grid readable.',
      },
    },
  ],
  quiz: [
    {
      id: 'm5-q1',
      q: 'Why does the register grid\'s `useQuery` key include both `yearId` and `maganeId` (`[\'register\', yearId, maganeId]`)?',
      options: [
        'To make the query run only once and never refetch',
        'So changing either picker changes the key and TanStack Query automatically refetches the right slice (and caches the old one)',
        'Because TanStack Query requires exactly three elements in every key',
        'To store the household names directly in the cache key',
      ],
      answer: 1,
    },
    {
      id: 'm5-q2',
      q: 'In the grid, which cell is editable inline and which must open a modal instead?',
      options: [
        'The Kannada name is edited inline; the checkboxes open a modal',
        'Both the name and the checkboxes are edited inline with contentEditable',
        'Only the checkboxes toggle inline; the Kannada name/address cell is read-only and clicking it opens the edit modal',
        'Everything opens a modal — nothing is editable inline',
      ],
      answer: 2,
    },
    {
      id: 'm5-q3',
      q: 'Why are the pooja checkbox columns built by mapping over `poojaTypes` with `createColumnHelper` rather than hand-written?',
      options: [
        'Because TanStack Table forbids accessor columns',
        'So each year — which can define its own pooja types and rates — gets the right checkbox columns with no code change',
        'To make the grid render without any column definitions',
        'Because Kannada headers cannot be written by hand',
      ],
      answer: 1,
    },
    {
      id: 'm5-q4',
      q: 'In the optimistic toggle `useMutation`, what is the purpose of `onMutate` cancelling queries and snapshotting the data?',
      options: [
        'To delete the cached data so a fresh fetch always runs',
        'To stop an in-flight refetch from clobbering the optimistic change and to keep a snapshot to roll back to on error',
        'To disable TanStack Query\'s caching entirely',
        'To send the write twice for redundancy',
      ],
      answer: 1,
    },
    {
      id: 'm5-q5',
      q: 'When the selected year\'s `isLocked` is true, how should the grid behave?',
      options: [
        'Hide the entire grid so nothing can be read',
        'Render rows and ₹ totals normally but disable every checkbox AND guard the toggle handler so no participation can change',
        'Allow ticking but skip saving to the database',
        'Delete the year\'s participations to finalise it',
      ],
      answer: 1,
    },
    {
      id: 'm5-q6',
      q: 'How should the per-row ₹ total be produced so it stays correct as ticks change, and formatted for this audience?',
      options: [
        'Store the total on the row at load time and format with Western grouping (123,456)',
        'Derive it by summing the ticked poojas\' per-year rates from the live optimistic state, formatted with `Intl.NumberFormat(\'en-IN\', …)` for Indian grouping (1,23,456)',
        'Compute it only when the app closes, using a plain number with no currency symbol',
        'Read a precomputed total from the database on every keystroke',
      ],
      answer: 1,
    },
  ],
};
