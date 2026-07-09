// Module 13 — Performance
// KalaKaara (React + Supabase) course content for the React course player.
// Thesis: measure, then optimise. Every technique here is grounded in a number.

export const m13 = {
  id: 'm13',
  title: 'Performance',
  hours: 6,
  color: 'from-blue-500/20 to-blue-700/10',
  accent: 'blue',
  description:
    'KalaKaara already works — now make it fast, and prove it. This module refuses to optimise anything you have not first measured: you read query plans with explain analyze, index the browse query on evidence, kill the N+1 that fetches categories twenty-five times, split the dashboard out of the visitor bundle, lazy-load images with an eager LCP exception, and add a small TTL cache with stale-while-revalidate. The deliverable is never the code — it is the before/after measurement table.',
  sections: [
    {
      id: 'm13-s1',
      title: 'Database performance',
      topics: [
        {
          id: 'm13-t1',
          title: 'Measure first: reading explain (analyze, buffers)',
          explain:
            'Before you touch a single query, ask Postgres how it actually runs that query and how long each step really takes.',
          analogy:
            'A fisherman at Gangolli whose boat is coming in slow does not immediately buy a bigger engine. He checks the logbook: was it the tide, the overloaded net, or the engine? Spending on the engine when the net was the problem is money burned. explain analyze is your boat\'s logbook — it tells you which step of the query is the slow one, so you fix that step and not a guess.',
          theory:
            'Optimising a query you have not measured is superstition. The tool that ends the superstition is `explain`. Written as `explain (analyze, buffers) <your query>`, it asks Postgres to **actually execute** the query and report the plan it chose, the estimated versus real row counts, the time spent in each node, and how many disk/cache blocks (buffers) it touched. You run it right in the **Supabase SQL editor**, on your real data, against the real browse query — the one Module 9 built.\n\nRead a plan from the **inside out and bottom up**. The most indented nodes run first; their output feeds the nodes above them. Three node types appear constantly and you must recognise them on sight:\n\n**`Seq Scan`** — Postgres reads every row in the table and checks each one. For a 30-row `categories` table this is correct and fast; sequential reads are cheap. For a 50,000-row `artists` table filtered down to 24, it is a siren. It means no usable index existed for your `where`.\n\n**`Index Scan`** — Postgres walks an index to jump straight to the matching rows. This is usually what you want for a selective filter. A close cousin, **`Index Only Scan`**, never touches the table at all because every column it needs is in the index itself — the fastest read there is.\n\n**`Bitmap Heap Scan`** (usually paired with a `Bitmap Index Scan` beneath it) — Postgres builds a bitmap of matching row locations from an index, then reads the table in physical order. This is what the planner picks when a query matches *many* rows: too many for repeated index lookups to be worth it, too few to justify reading the whole table. Seeing it is normal, not a bug.\n\nThen read two numbers on every node. **`rows`** appears twice: the planner\'s **estimate** (`rows=...` in the first parenthesis) and the **actual** count (`actual ... rows=...`). A large gap between them — estimate says 5, actual is 8,000 — means the planner is working from **stale statistics** and is choosing bad plans as a result. The fix is one command: `analyze artists;` recomputes the statistics. (This is table maintenance `analyze`, a different thing from the `analyze` option of `explain`.) The second number is **`actual time=start..end`**, in milliseconds, per node. Multiply the end time by the loop count to find where the wall-clock time truly goes; the slowest node is your target, and nothing else is.\n\nDo this **once, on the real query, before changing anything.** The plan you capture now is your baseline. Every later section in this module is judged against it.',
          diagram: `graph TD
    Q[Run: explain analyze buffers on the browse query] --> N{Top node type?}
    N -- Seq Scan on artists --> S[No usable index for the WHERE<br/>candidate for an index]
    N -- Index Scan --> I[Index already used<br/>look higher up for the cost]
    N -- Bitmap Heap Scan --> B[Many rows matched<br/>usually fine, not a bug]
    S --> R{rows estimate vs actual}
    I --> R
    B --> R
    R -- close --> OK[Statistics are fresh]
    R -- far apart --> ST[Stale statistics<br/>run analyze table]
    OK --> T[Find the node with the largest actual time]
    ST --> T
    T --> FIX[Optimise THAT node only]`,
          flowExplain:
            'The whole method is the bottom of this chart: find the single node with the largest actual time, and spend your effort only there. A big estimate-vs-actual gap is a separate signal — it means run analyze before you trust any plan.',
          whyItMatters:
            'In interviews and in production, "the app feels slow" is not actionable; "the browse query does a Seq Scan on 50k rows taking 340 ms because there is no composite index" is. Engineers who reach for explain analyze first fix the real bottleneck once; engineers who guess add three indexes, two of which slow down writes and none of which was the problem.',
          steps: [
            'Open the Supabase dashboard, go to the SQL editor, and paste the real browse query with `explain (analyze, buffers)` in front of it.',
            'Read the plan bottom-up. Note the node type at the leaf: `Seq Scan`, `Index Scan`, or `Bitmap Heap Scan`.',
            'On each node, compare the planner\'s `rows=` estimate against `actual ... rows=`. If they differ by more than roughly 10x, run `analyze <table>;` and re-run the explain.',
            'Find the node with the largest `actual time`. Write down that number — it is your baseline for this module.',
            'Change nothing yet. Save the plan text into your project notes as "before".',
          ],
          code: `-- Run this in the Supabase SQL editor, on real data, before optimising anything.
-- The browse query from Module 9: published artists, newest first, one page.

explain (analyze, buffers)
select id, display_name, avatar_url, city_name, avg_rating, base_price
from artists
where is_published = true
order by created_at desc
limit 24;

-- A "before" plan on a cold, unindexed table might read like this:
--
--  Limit  (cost=1284.31..1284.37 rows=24 width=96)
--         (actual time=41.20..41.24 rows=24 loops=1)
--    ->  Sort  (cost=1284.31..1310.06 rows=10300 width=96)
--              (actual time=41.19..41.21 rows=24 loops=1)
--          Sort Key: created_at DESC
--          Sort Method: top-N heapsort  Memory: 32kB
--          ->  Seq Scan on artists                     <-- reads EVERY row
--                  (cost=0.00..980.00 rows=10300 width=96)
--                  (actual time=0.02..28.90 rows=9800 loops=1)
--                Filter: is_published
--                Rows Removed by Filter: 200
--          Buffers: shared hit=612
--  Planning Time: 0.31 ms
--  Execution Time: 41.55 ms
--
-- How to read it:
--   Seq Scan            -> no index served the WHERE. Scanned 9,800 rows to keep 24.
--   rows=10300 vs 9800  -> estimate close to actual: statistics are fresh. Good.
--   Sort ... top-N      -> the ORDER BY ran in memory over the whole filtered set.
--   Execution Time      -> 41.55 ms is the baseline. Beat this in t3, do not guess at it.

-- If estimate and actual had been far apart, the fix is one line:
analyze artists;   -- recomputes statistics so the planner stops choosing bad plans`,
          pitfalls: [
            '**Running plain `explain` and thinking you measured something.** Plain `explain` only shows the planner\'s guesses; it never runs the query, so there are no `actual time` numbers. Fix: always use `explain (analyze, buffers)` — the `analyze` option is what executes it and gives you real timings.',
            '**Optimising the node with the scariest name instead of the slowest time.** A `Seq Scan` on a 30-row lookup table costs nothing; an `Index Scan` feeding a huge `Sort` above it might be the real cost. Fix: rank nodes by `actual time`, not by how alarming the label looks.',
            '**Ignoring a huge gap between estimated and actual rows.** The planner chooses join strategies from those estimates; when they are stale it picks disastrously. Fix: run `analyze <table>;` after any big data load, then re-capture the plan.',
            '**Measuring against an empty dev table.** Ten seeded artists make every plan look instant, so you ship an unindexed query that dies at 50k rows in production. Fix: seed a realistic volume (thousands of rows) before you trust any timing.',
            '**Reading the plan top-down.** The top node is the last to finish; execution starts at the most-indented leaf. Fix: read inside-out, bottom-up, or you will blame the wrong step.',
          ],
          tryIt:
            'Run the explain above on your own artists table. Find the `Execution Time` line and write the number down. Then predict: if you added an index on `(is_published, created_at)`, would the `Seq Scan` become an `Index Scan` and the `Sort` disappear? (It should — and t3 is where you prove it.)',
          takeaway:
            'Never optimise a query you have not run through `explain (analyze, buffers)`. Find the single slowest node, check the rows estimate is not stale, and target that node alone.',
        },
        {
          id: 'm13-t2',
          title: 'Select only the columns you need',
          explain:
            'A list view that shows six fields should ask the database for six fields, not for every column including the long bio.',
          analogy:
            'When you send someone to the Kundapura santhe for tomatoes and onions, you do not tell them to bring back one of everything in the market and you will sort it out at home. You would pay for the auto to haul it, and throw most of it away. `select(\'*\')` for a card grid is exactly that auto-load of vegetables you did not order.',
          theory:
            'On the free Supabase tier, **bandwidth is metered: 5 GB per month.** Every byte the database sends travels over that meter and over the visitor\'s mobile data. The browse grid shows six fields per artist — name, avatar, city, rating, price, and a category chip. The `artists` row, however, also carries a 400-word `bio`, a `cover_url`, an `instagram_url`, a `website_url`, `updated_at`, internal flags, and more. `select(\'*\')` drags all of it across the wire, for all 24 cards, on a screen that renders none of it.\n\nThe fix is to name your columns. `select(\'id, display_name, avatar_url, city_name, avg_rating, base_price\')` sends exactly what the card renders. This is not a micro-optimisation; on a 24-card grid the payload can shrink by more than half, because the `bio` alone is often the largest field on the row. Smaller payloads mean less bandwidth burned, faster parsing in the browser, and — when combined with the right index — the possibility of an **Index Only Scan**, where Postgres answers the whole query from the index and never touches the table.\n\nThere is a discipline point hiding here that pays off later. The **service layer** (from m0) is where you name columns, because it is the single place that talks to Supabase. Define the projection once — a constant list of the fields a card needs — and every caller of `artistService.listArtists()` inherits the lean query. When a designer later adds a field to the card, you widen the projection in one file, not in fourteen call sites.\n\nMeasure the win the same way you measure everything else in this module: open the browser DevTools Network tab, filter to the PostgREST request, and read the **Size** column before and after. That number, not your intuition, is the evidence.',
          whyItMatters:
            'On a metered free tier, `select(\'*\')` across every list in the app is how you exhaust 5 GB of bandwidth in a week and get your project throttled. Naming columns is the cheapest performance win in the entire module — a few characters of typing for a payload that can more than halve.',
          steps: [
            'Open the browse page with DevTools Network open. Click the request to `/rest/v1/artists`, read the response Size, and write it down.',
            'In `artistService.js`, replace `.select(\'*\')` with an explicit list of only the columns the card component reads.',
            'Define that list once as a constant (for example `ARTIST_CARD_COLUMNS`) so every list query reuses it.',
            'Reload, read the new response Size, and record the before/after for a full 24-card grid.',
            'Keep `select(\'*\')` only for the artist **detail** page, where the bio and every URL are genuinely rendered.',
          ],
          code: `// services/artistService.js — name the columns the card actually renders.

// One source of truth for the projection. Widen it here, nowhere else.
const ARTIST_CARD_COLUMNS =
  'id, slug, display_name, avatar_url, city_name, avg_rating, base_price';

// BEFORE: drags bio (~400 words), cover_url, 3 social URLs, flags, timestamps...
export async function listArtistsFat() {
  const { data, error } = await supabase
    .from('artists')
    .select('*')                       // every column, for a card that shows six
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(24);
  if (error) throw new Error(error.message);
  return data;
}

// AFTER: sends exactly what the grid paints.
export async function listArtists() {
  const { data, error } = await supabase
    .from('artists')
    .select(ARTIST_CARD_COLUMNS)       // six fields, no bio, no URLs you do not show
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(24);
  if (error) throw new Error(error.message);
  return data;
}

/*
  Measured on a seeded table, 24-card grid, DevTools Network "Size" column:

    select('*')                        ~ 88 KB   (bio dominates every row)
    select(ARTIST_CARD_COLUMNS)        ~ 31 KB   (~65% smaller)

  Same rows, same order, same page. The difference is columns you never showed.
  The detail page still uses select('*') — there, the bio is the point.
*/`,
          pitfalls: [
            '**Leaving `select(\'*\')` on list endpoints "to keep it flexible".** Flexibility you do not use is bandwidth you do pay for, every request, forever. Fix: name columns on lists; reserve `*` for the one detail view that renders the whole row.',
            '**Naming columns in fourteen different call sites.** The next design tweak now means fourteen edits and one you will miss. Fix: define the projection as a single constant in the service and reuse it.',
            '**Forgetting that an embedded relation re-triggers the fat select.** `select(\'*, artworks(*)\')` pulls every column of every artwork too. Fix: name columns inside the embed as well: `artworks(id, image_url, title)`.',
            '**Assuming the win is theoretical.** Without the Network tab number, nobody believes it and nobody maintains it. Fix: record the before/after Size — it belongs in the mini-project table.',
            '**Selecting a column the card does not need "just in case it is cheap".** `bio` is not cheap; it is usually the biggest field on the row. Fix: if the component does not read it, do not fetch it.',
          ],
          tryIt:
            'Count the fields your `ArtistCard` actually renders, then open the network response for the browse grid and count the fields it received. If the second number is bigger, you have found free bandwidth. Trim the select and record the two Size numbers.',
          takeaway:
            'Ask for the columns you render and no more. On a metered free tier, naming columns is the cheapest, highest-leverage performance fix you will make.',
        },
        {
          id: 'm13-t3',
          title: 'Indexes that earn their keep',
          explain:
            'An index is a deal: faster reads in exchange for slower writes and more storage — so add one only when a query plan proves it pays.',
          analogy:
            'A temple seva office keeps a separate alphabetical register of devotees so the clerk can find "Shetty" without flipping every page. That register is an index: brilliant for lookups. But every new booking now has to be written into the main book AND the alphabetical register. Keep five such registers and every booking takes five times as long to record. You keep the registers people actually search by, and no others.',
          theory:
            'From t1 you know the browse query does a `Seq Scan` and a `Sort`. The query is: `where is_published = true order by created_at desc limit 24`. The index that serves it exactly is a **composite index** on `(is_published, created_at desc)`. Postgres can then walk it: jump to the `is_published = true` section, and because the second key is already sorted by `created_at desc`, read the first 24 entries and stop. The `Seq Scan` becomes an `Index Scan`, and the `Sort` node **disappears entirely** because the index delivers rows pre-sorted.\n\nBetter still is a **partial index**: `create index ... on artists (created_at desc) where is_published`. It indexes only the published rows. It is smaller (unpublished drafts are excluded), it stays hotter in cache, and it matches the query\'s constant filter precisely. For a table where most rows are published it is a modest win; for one with many drafts it is a large one.\n\nNow the trap beginners fall into: **an index on a low-cardinality boolean alone is almost useless.** `is_published` has two values. An index on `is_published` by itself points at roughly half the table — and reading half a table via an index is *slower* than just scanning it, so the planner ignores the index and scans anyway. The boolean earns its place only as the **leading column of a composite** or as the **predicate of a partial index**, where it combines with a selective sort or filter.\n\nAnd every index has a **write cost you must acknowledge**. Each `insert`, `update`, or `delete` on `artists` must also update every index on the table. Five indexes mean five extra B-tree maintenance operations per write, plus the storage they occupy. Indexes are not free speed; they are read speed borrowed against write speed. So the rule is: add an index, then **prove it with `explain analyze`** — capture the plan before and after, confirm the node type changed and the time dropped, and keep the index only if the evidence is there.',
          diagram: `graph TD
    Q[Query: where is_published order by created_at desc limit 24] --> A{What index?}
    A --> B[Index on is_published alone]
    A --> C[Composite: is_published, created_at desc]
    A --> D[Partial: created_at desc where is_published]
    B --> B1[Two values -> points at half the table<br/>planner ignores it, scans anyway. USELESS]
    C --> C1[Walk to published section,<br/>read 24 pre-sorted rows, stop.<br/>Seq Scan and Sort both gone]
    D --> D1[Same, but smaller and hotter:<br/>indexes only published rows]
    C1 --> P[Prove with explain analyze:<br/>node changed, time dropped]
    D1 --> P
    P --> W[Weigh the write cost:<br/>every insert/update maintains this index]`,
          flowExplain:
            'The left branch is the tempting mistake — indexing the boolean by itself does nothing. The two right branches both work; the partial index wins on size. Either way the last box is mandatory: prove it, then account for the write cost.',
          whyItMatters:
            '"Just add an index" is the most over-applied performance advice in the industry. The engineers who stand out know that a boolean-only index is dead weight, that the right index is composite or partial and matched to the exact `where`/`order by`, and that every index taxes every write — and they can show the plan that justifies each one.',
          steps: [
            'Re-capture the baseline plan from t1 so you have a "before".',
            'Create the composite index on `(is_published, created_at desc)` and re-run `explain analyze`. Confirm the `Seq Scan` became an `Index Scan` and the `Sort` node vanished.',
            'Replace it with the partial index `(created_at desc) where is_published` and compare size with `\\di+` or the `pg_indexes` view. Note it is smaller.',
            'For contrast, create an index on `is_published` alone, re-run the plan, and watch the planner refuse to use it. Then drop it.',
            'Record execution time before and after in your project notes, and write one line acknowledging the write cost of the index you kept.',
          ],
          code: `-- Prove every index with explain analyze. Never add one on faith.

-- 1) BASELINE (from t1): Seq Scan + Sort, ~41 ms. Keep this plan as "before".

-- 2) COMPOSITE index matching the WHERE + ORDER BY exactly.
create index idx_artists_published_created
  on artists (is_published, created_at desc);

explain (analyze, buffers)
select id, display_name from artists
where is_published = true order by created_at desc limit 24;
--  ->  Index Scan using idx_artists_published_created on artists
--        (actual time=0.03..0.09 rows=24 loops=1)
--  Execution Time: 0.14 ms     <-- Sort node GONE. ~41 ms -> ~0.14 ms.

-- 3) PARTIAL index: smaller, hotter, indexes only published rows.
drop index idx_artists_published_created;
create index idx_artists_published_partial
  on artists (created_at desc)
  where is_published;              -- the predicate replaces the leading boolean

-- Same query, same fast Index Scan, but the index is smaller on disk:
select indexrelname, pg_size_pretty(pg_relation_size(indexrelid)) as size
from pg_stat_user_indexes where relname = 'artists';

-- 4) THE USELESS ONE: boolean alone. Watch the planner refuse it.
create index idx_artists_ispublished on artists (is_published);
explain analyze
select * from artists where is_published = true order by created_at desc limit 24;
--  ->  Seq Scan on artists ...   <-- planner IGNORED the boolean index.
--      Half the table via an index is slower than scanning. Drop it.
drop index idx_artists_ispublished;

-- 5) THE WRITE COST you just accepted:
--    every INSERT/UPDATE/DELETE on artists now also maintains the kept index.
--    One well-chosen index is worth it. Five speculative ones tax every write.`,
          pitfalls: [
            '**Indexing a low-cardinality boolean on its own.** With two values it points at half the table and the planner will not use it. Fix: make the boolean the leading column of a composite, or the predicate of a partial index.',
            '**Getting the composite column order wrong.** An index on `(created_at, is_published)` cannot skip straight to published rows for this query. Fix: order columns to match the query — equality filter first, then the sort key.',
            '**Adding indexes without measuring.** You end up with six indexes, four unused, all taxing writes. Fix: capture the plan before and after each index; keep only the ones the plan proves.',
            '**Forgetting the `desc` on the sort key.** An ascending index still works but may force a backward scan or an extra step. Fix: match the index sort direction to the `order by`.',
            '**Treating indexes as free.** Every one slows inserts and updates and consumes storage on a 500 MB free tier. Fix: budget indexes like any resource — each must justify its write-cost with a proven read win.',
          ],
          tryIt:
            'Create the composite index, re-run the explain from t1, and confirm two things changed: the leaf node is now `Index Scan` and there is no `Sort` node. Then create the boolean-only index and confirm the planner ignores it. The difference between those two outcomes is the whole lesson.',
          takeaway:
            'The right index is composite or partial, matched to the exact `where` and `order by`, and proven with `explain analyze`. A boolean-only index is dead weight, and every index you keep taxes every write.',
        },
        {
          id: 'm13-t4',
          title: 'The N+1 query, the most common real-world performance bug',
          explain:
            'Rendering 24 cards and letting each card fetch its own categories is 1 query for the list plus 24 for the categories — 25 round trips where 1 would do.',
          analogy:
            'A tea seller at the Udupi bus stand takes one order for 24 teas. The N+1 way: he walks to the counter, brings back one tea, walks back, brings the second, twenty-four separate trips. The fix is obvious in real life — carry all 24 on one tray — yet in code the twenty-four trips hide inside a useEffect in a child component where nobody sees them until the network tab lights up.',
          theory:
            'The **N+1 query** is the performance bug you will meet most often in real applications, and it is nearly invisible in the source. It happens when you fetch a list of N items with one query, then fetch something related for each item with N more queries. Here: `listArtists()` returns 24 artists (**1** query), and then each `ArtistCard` runs a `useEffect` that fetches *that artist\'s* categories (**24** queries). Total: **25 round trips.** Each round trip to Supabase carries fixed overhead — a new HTTP request, TLS session reuse, PostgREST parsing, a planned query — so 25 small queries are far slower than one slightly larger query, even though each individual one looks instant in isolation.\n\nThe reason it hides is architectural: the loop is not written as a loop. You wrote one `useEffect` in one card component; React ran it 24 times because the card is rendered 24 times. The N is the length of the list, and it moves with your data — fine with 5 seeded artists in dev, brutal with 24 in production.\n\nThe fix is to let Postgres do the join and PostgREST embed the result in **one** response. supabase-js supports **embedded selects**: `select(\'*, artist_categories(categories(name))\')` tells PostgREST to follow the foreign keys and nest each artist\'s categories inside the artist object. One request returns the artists *and* their categories together. The card stops fetching entirely — it just reads `artist.categories`, which arrived with the list.\n\nMeasure it and the difference is stark: the round-trip count drops from 25 to 1, and the total time drops from "24 sequential requests, each with overhead" to "one request that is marginally larger". You detect an N+1 the same way every time: open the Network tab, and if you see the same endpoint fired once per row, you have found one.',
          diagram: `sequenceDiagram
    autonumber
    participant R as React (BrowsePage)
    participant PG as Supabase / Postgres

    Note over R,PG: N+1 — 25 round trips
    R->>PG: 1. select artists limit 24
    PG-->>R: 24 artist rows
    R->>PG: 2. card 1: select categories where artist_id = a1
    PG-->>R: categories for a1
    R->>PG: 3. card 2: select categories where artist_id = a2
    PG-->>R: categories for a2
    Note over R,PG: ...repeated 24 times, each with full request overhead...

    Note over R,PG: Embedded select — 1 round trip
    R->>PG: select *, artist_categories(categories(name)) limit 24
    PG-->>R: 24 artists WITH their categories nested`,
          flowExplain:
            'The top half fires one request per card because the fetch lives inside the card; the bottom half asks PostgREST to embed the categories, so all 24 artists and their categories arrive in a single response.',
          whyItMatters:
            'N+1 is the single most common performance bug in production systems, and spotting it is a standard interview probe. The tell is always the same — a network tab showing the same query repeated once per list item — and the fix is always the same shape: one query with a join or embed instead of a loop of small queries.',
          steps: [
            'Open the Network tab on the browse page and count requests to the categories endpoint. If it is one per card, you have an N+1.',
            'Remove the `useEffect` that fetches categories from inside `ArtistCard`.',
            'Widen the list query in the service to an embedded select: `*, artist_categories(categories(name))`.',
            'Map the nested shape at the service boundary so the card receives a simple `categories: [...]` array.',
            'Reload, re-count requests (it should be 1), and record the before/after request count and total time.',
          ],
          code: `// BEFORE — the N+1. One list query, then one query PER card.

// components/ArtistCard.jsx
function ArtistCard({ artist }) {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    // This runs once per card. 24 cards => 24 extra round trips.
    supabase
      .from('artist_categories')
      .select('categories(name)')
      .eq('artist_id', artist.id)
      .then(({ data }) => setCategories((data ?? []).map((r) => r.categories.name)));
  }, [artist.id]);
  return <Card title={artist.display_name} chips={categories} />;
}

// AFTER — one embedded select fetches artists AND their categories together.

// services/artistService.js
export async function listArtists() {
  const { data, error } = await supabase
    .from('artists')
    .select('id, slug, display_name, avatar_url, artist_categories(categories(name))')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(24);
  if (error) throw new Error(error.message);
  // Flatten the nested shape once, here, so the card stays dumb.
  return data.map((a) => ({
    ...a,
    categories: (a.artist_categories ?? []).map((ac) => ac.categories.name),
  }));
}

// components/ArtistCard.jsx — now fetches NOTHING. It just renders.
function ArtistCard({ artist }) {
  return <Card title={artist.display_name} chips={artist.categories} />;
}

/*
  Measured, 24-card grid, DevTools Network:

    BEFORE:  25 requests (1 list + 24 categories), ~520 ms wall clock
    AFTER:    1 request  (list with embedded categories), ~60 ms

  Same data on screen. The N moved from the network into a single join.
*/`,
          pitfalls: [
            '**Hiding the per-row fetch inside a child component.** It does not look like a loop, so it survives code review. Fix: treat any `useEffect` fetch inside a list-item component as a suspected N+1 until proven otherwise.',
            '**"Fixing" it by fetching all categories separately and matching in JS.** That is 2 queries instead of 25, better — but the embed does it in 1 and keeps the data shaped per artist. Fix: prefer the embedded select unless the related set is huge and shared.',
            '**Forgetting to map the nested PostgREST shape.** `artist_categories(categories(name))` returns an array of objects of objects; passing that raw to the card leaks the join structure into the UI. Fix: flatten it once at the service boundary.',
            '**Only testing with a handful of seeded rows.** With 3 artists an N+1 is 4 requests and feels fine; with 24 it is 25 and janks. Fix: seed a realistic list length before judging.',
            '**Embedding a relation you do not render.** The embed is cheap only if you use it; nesting every artwork and every review into the list re-inflates the payload. Fix: embed exactly the related fields the card shows.',
          ],
          tryIt:
            'Load the browse page and count the requests in the Network tab. Is it 1, or is it 1 + the number of cards? If the second, you have an N+1 — convert the list query to an embedded select and watch the count collapse to 1. Record both numbers.',
          takeaway:
            'An N+1 is one query for the list plus one per row, hidden inside a child component. Replace the per-row fetch with a single embedded select, and confirm the round-trip count drops to one.',
        },
        {
          id: 'm13-t5',
          title: 'Pagination cost: count, offset, and keyset',
          explain:
            'How you count rows and how you skip pages both have a hidden cost that grows with the table — and there is a fix you probably do not need yet.',
          analogy:
            'Counting exactly how many devotees came to the Kollur temple this year means recounting the entire register from page one. Estimating from the crowd and the parking is instant and close enough to print on a banner. And finding page 300 of the register by counting past the first 299 pages is slow precisely because you count past them — whereas a register tabbed by date lets you flip straight to the day you want.',
          theory:
            'Pagination has two costs that both scale with table size, and both have honest answers.\n\n**Cost one: counting.** To show "Page 3 of 47" you need a total row count. supabase-js offers three counting modes. `count: \'exact\'` makes Postgres **scan the whole table** to produce a precise number — accurate, and increasingly expensive as the table grows, because the count cannot be short-circuited. `count: \'planned\'` returns the planner\'s estimate from statistics — essentially free, and stale between `analyze` runs. `count: \'estimated\'` uses the exact count for small tables and the planned estimate for large ones. For a public browse grid, an exact count is usually a waste: nobody needs to know there are precisely 9,814 artists, and "9,800+" from an estimate reads fine. Reserve `exact` for places a precise number is genuinely required.\n\n**Cost two: skipping.** `.range(from, to)` is offset pagination: `offset 48 limit 24` for page 3. Postgres computes this by generating and **discarding** the first 48 rows before returning the next 24. At page 3 that is trivial. At page 300 it must generate and throw away 7,200 rows to hand you 24 — the deeper the page, the more wasted work. Offset pagination is fine near the front and quietly awful deep in the tail.\n\n**The fix is keyset pagination** (also called cursor pagination). Instead of "skip 7,200 rows", you say "give me the 24 rows *after* the last one I saw". Because the browse query is ordered by `created_at desc`, the cursor is the `created_at` (plus `id` as a tiebreaker) of the last card on the previous page. The next query is `where (created_at, id) < (:last_created_at, :last_id) order by created_at desc limit 24`. With the composite index from t3, this is an index range scan that jumps straight to the cursor — the same cost on page 300 as on page 3. The trade: you lose random access to "page 47" and get "next / previous" instead, which is exactly what infinite scroll and "load more" buttons want anyway.\n\nAnd now the honest part, which is the point of this whole module: **you do not need keyset yet.** KalaKaara paginates 24 published artists per page over a table that, for a coastal-Karnataka launch, holds hundreds not millions. Offset pagination with an estimated count is completely correct at this scale. Keyset is the fix you *recognise* now and *reach for* the day the plan shows deep-offset pain — not a day sooner.',
          whyItMatters:
            'Two of the most common scaling surprises are a browse page that slows down as the catalogue grows (deep offsets) and a count query that dominates every request (exact counts). Knowing that offset re-scans skipped rows and that keyset fixes it — while being honest that a small app does not need it yet — is exactly the judgment that separates cargo-culting from engineering.',
          steps: [
            'Check how your list query counts. If it passes `count: \'exact\'` for a public grid, switch it to `\'estimated\'` and confirm the page still shows a sensible "N+ artists".',
            'Add `.range(from, to)` offset pagination for the current page and measure page 3 versus a simulated deep page with `explain analyze`.',
            'Write the keyset version as a comment or a branch: `where (created_at, id) < (:cursor_created, :cursor_id)` with the composite index.',
            'Compare the plans: offset at a deep page shows rows generated-and-discarded; keyset shows a bounded index range scan.',
            'Decide honestly: keep offset for KalaKaara today, and note in your README the trigger that would make you switch.',
          ],
          code: `-- COUNTING: three modes, three costs.
--   exact     -> scans the whole table for a precise number (expensive, grows)
--   planned   -> planner estimate from statistics (near-free, slightly stale)
--   estimated -> exact for small tables, planned for large ones (good default)

-- supabase-js:
const { data, count } = await supabase
  .from('artists')
  .select('id, display_name', { count: 'estimated' })   // not 'exact' for a public grid
  .eq('is_published', true)
  .order('created_at', { ascending: false })
  .range(0, 23);                                         // page 1: rows 0..23

-- OFFSET pagination (.range) — fine near the front, wasteful deep in the tail:
--   page 3   -> offset 48   limit 24   (discards 48 rows)
--   page 300 -> offset 7176 limit 24   (GENERATES AND DISCARDS 7,176 rows)

explain analyze
select id, created_at from artists
where is_published = true
order by created_at desc
offset 7176 limit 24;
--  ->  ... rows discarded before the limit is reached. Cost climbs with the offset.

-- KEYSET pagination — the fix. "Rows AFTER the last one I saw."
-- Cursor = the (created_at, id) of the last card on the previous page.
-- With the composite index from t3, page 300 costs the same as page 3.

explain analyze
select id, created_at from artists
where is_published = true
  and (created_at, id) < ('2026-05-01 10:00:00+00', '9f3c...uuid')  -- the cursor
order by created_at desc
limit 24;
--  ->  Index Scan ... jumps straight to the cursor. Bounded, page-depth-independent.

-- HONEST NOTE: KalaKaara has hundreds of artists, not millions.
-- Offset + estimated count is correct here. Adopt keyset the day a plan
-- shows deep-offset pain, and not one day before.`,
          pitfalls: [
            '**Using `count: \'exact\'` on every public list.** It scans the whole table on every page load just to render "Page 3 of N". Fix: use `estimated` for browse grids; reserve `exact` for a place that truly needs a precise total.',
            '**Assuming `.range()` is cheap everywhere.** Deep offsets generate and discard everything before the window; the cost grows with page depth. Fix: know the ceiling, and switch to keyset when the tail gets long.',
            '**Keyset without a tiebreaker column.** Ordering by `created_at` alone breaks when two rows share a timestamp — you skip or repeat rows at the boundary. Fix: order and cursor by `(created_at, id)` so the key is unique.',
            '**Adopting keyset prematurely.** It costs you random page access and adds cursor-passing complexity for a table with hundreds of rows. Fix: measure first; keyset is a fix for a problem you can demonstrate, not a default.',
            '**Forgetting keyset needs the matching index.** Without the `(is_published, created_at desc)` index, the keyset comparison still scans. Fix: keyset and the composite index from t3 are a pair.',
          ],
          tryIt:
            'Run the offset query at `offset 24` and again at `offset 5000` with `explain analyze` on a seeded table. Watch the cost climb with the offset. Then run the keyset version and confirm it stays flat. Now decide, in writing, whether KalaKaara needs it today. (It does not — and knowing why is the answer.)',
          takeaway:
            '`count: \'exact\'` scans the whole table; use an estimate for public grids. Offset pagination re-scans skipped rows and degrades deep in the tail; keyset fixes it — but only adopt keyset when a plan proves you need it.',
        },
      ],
    },
    {
      id: 'm13-s2',
      title: 'Frontend performance',
      topics: [
        {
          id: 'm13-t6',
          title: 'Bundle size and route-level code splitting',
          explain:
            'A visitor who only browses should not download the artist dashboard\'s forms and upload libraries — split the bundle by route so they never arrive.',
          analogy:
            'When a bus leaves Kundapura for Mangaluru, it does not tow a second empty bus full of luggage that only three passengers will ever open. Yet a single JavaScript bundle does exactly that: it ships the dashboard\'s heavy upload and cropping code to every visitor, most of whom never sign in. Code splitting is uncoupling that trailer so it is fetched only by the passenger who needs it.',
          theory:
            'Start by measuring, not guessing. `npm run build` prints every output chunk and its size; a single large `index-*.js` is the smell. To see *what* is fat inside it, add **`rollup-plugin-visualizer`** to `vite.config.js`; it produces an interactive treemap of the bundle, and the big rectangles are your suspects — typically an image-cropping library, a rich form library, or a date library pulled in whole. You now know, from evidence, which code is expensive and where it is used.\n\nThe key insight: **the dashboard\'s heavy dependencies are only used behind a protected route.** A logged-out visitor browsing artists will never open `/dashboard`, yet in a naive build its code sits in the same bundle they download on first paint. The fix is **route-level code splitting** with `React.lazy`. Instead of importing a page statically, you import it lazily: `const DashboardPage = React.lazy(() => import(\'./pages/DashboardPage\'))`. Vite then emits `DashboardPage` as its **own chunk**, fetched only when the router first renders that route. The visitor\'s initial download shrinks to the code the first screen actually needs.\n\nBecause a lazily-imported component might still be downloading when React tries to render it, `React.lazy` must be wrapped in **`<Suspense>`** with a `fallback`. The fallback is what the user sees during that fetch — and it should be a **`<PageSkeleton />>`**, not a spinner, so the layout does not jump when the real page arrives. One `<Suspense>` around your routed outlet covers every lazy route.\n\nThe right unit to split on is the **route**, because routes are natural boundaries: a user is on exactly one at a time, and route transitions are moments where a brief load is already expected. Splitting finer (every component lazy) fragments the bundle into dozens of tiny requests and usually makes things slower. Splitting the dashboard, the artist detail page, and other rarely-first-loaded routes out of the initial bundle is the high-value cut. Then re-run `npm run build` and read the new chunk sizes — the initial chunk should be visibly smaller, and the dashboard should now be a separate file that most visitors never request.',
          diagram: `graph TD
    subgraph before[Before: one bundle for everyone]
      B[index.js<br/>Home + Browse + Detail + DASHBOARD<br/>+ upload lib + crop lib + form lib]
    end
    subgraph after[After: split by route]
      I[index.js<br/>Home + Browse + shell<br/>small, ships to everyone]
      D[DashboardPage.chunk.js<br/>form + upload + crop<br/>fetched only at /dashboard]
      AD[ArtistDetail.chunk.js<br/>fetched only when opened]
    end
    V[Visitor who only browses] --> before
    V -.downloads all of it.-> B
    V --> after
    V -.downloads.-> I
    V -. never fetches .-> D`,
          flowExplain:
            'The dotted lines are the point: in the "after" world the browsing visitor downloads only `index.js` and never fetches the dashboard chunk, because `React.lazy` made it a separate file that loads only when its route is visited.',
          whyItMatters:
            'Initial bundle size is the first thing a Lighthouse audit flags and a direct input to Time to Interactive on a mid-range phone. Being able to say "I ran build, used the visualizer to find the upload library was 40% of the bundle, and lazy-loaded it out of the visitor path" is a concrete, measured performance story — the kind interviews and code reviews respect.',
          steps: [
            'Run `npm run build` and read the printed chunk sizes. Note the largest chunk as your baseline.',
            'Add `rollup-plugin-visualizer` to `vite.config.js`, rebuild, and open the treemap to see which libraries dominate.',
            'Convert rarely-first-loaded routes — `/dashboard` especially — to `React.lazy(() => import(...))` in your router.',
            'Wrap the routed outlet in `<Suspense fallback={<PageSkeleton />}>` so lazy chunks load without a layout jump.',
            'Rebuild, confirm the dashboard is now a separate chunk, and record the before/after size of the initial bundle.',
          ],
          code: `// vite.config.js — measure what is fat, first.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ filename: 'dist/stats.html', open: true }), // treemap after build
  ],
});

// App.jsx — route-level code splitting with React.lazy + Suspense.
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import PageSkeleton from './components/PageSkeleton';

import HomePage from './pages/HomePage';       // eager: the first paint needs it
import BrowsePage from './pages/BrowsePage';   // eager: the main visitor path

// Lazy: their own chunks, fetched only when the route is first visited.
const ArtistDetailPage = lazy(() => import('./pages/ArtistDetailPage'));
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));   // heavy: forms + uploads
const FavouritesPage   = lazy(() => import('./pages/FavouritesPage'));

export default function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>   {/* one boundary covers every lazy route */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/artists" element={<BrowsePage />} />
        <Route path="/artists/:slug" element={<ArtistDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />   {/* separate chunk */}
        <Route path="/favourites" element={<FavouritesPage />} />
      </Routes>
    </Suspense>
  );
}

/*
  npm run build, before and after:

    BEFORE:  dist/index-4f1a.js   412 KB   (everything, dashboard included)
    AFTER:   dist/index-9c22.js   243 KB   (visitor path)
             dist/DashboardPage-7b0e.js  128 KB   (fetched only at /dashboard)

  The browsing visitor now downloads 243 KB, not 412 KB. The 128 KB of
  dashboard code loads only for the few who sign in to manage a profile.
*/`,
          pitfalls: [
            '**Lazy-loading the pages a visitor sees first.** Making `HomePage` lazy adds a network round trip before the first paint — slower, not faster. Fix: keep the initial route(s) eager; lazy-load the routes that are rarely the first one visited.',
            '**Forgetting the `<Suspense>` boundary.** A lazy component with no Suspense ancestor throws at render. Fix: wrap the routed outlet in one `<Suspense>` with a skeleton fallback.',
            '**Using a spinner as the fallback.** A centered spinner then a full page is a jarring layout jump and hurts perceived performance. Fix: render a `<PageSkeleton />>` shaped like the page that is coming.',
            '**Splitting every component.** Dozens of tiny lazy chunks mean dozens of requests and waterfalls; the overhead outweighs the saving. Fix: split at the route level, occasionally at a genuinely heavy widget, and stop there.',
            '**Never opening the visualizer.** You lazy-load a page that was 8 KB and leave the 120 KB library in the shared chunk. Fix: let the treemap tell you what is actually big before you decide what to split.',
          ],
          tryIt:
            'Run `npm run build` and note the size of the largest JS chunk. Convert `/dashboard` to `React.lazy`, rebuild, and confirm two things: a new `DashboardPage` chunk exists, and the main chunk shrank. Record both sizes — they are a row in the mini-project table.',
          takeaway:
            'Measure the bundle with `npm run build` and the visualizer, then use `React.lazy` + `<Suspense>` to keep the dashboard\'s heavy code out of the bundle a browsing visitor downloads.',
        },
        {
          id: 'm13-t7',
          title: 'Images: 90% of this app\'s bytes',
          explain:
            'Artwork images are the bulk of what KalaKaara ships, so lazy-load the ones off-screen, prevent layout shift, serve phone-sized files, and load the one hero image eagerly.',
          analogy:
            'A Yakshagana troupe does not unload every costume and prop from the lorry the moment they reach the venue — they carry in the first scene\'s costumes now and fetch the rest as each scene approaches. But the lead performer\'s entrance costume comes off the lorry first, immediately, because the show opens on it. Off-screen images are lazy; the hero image is that entrance costume — never made to wait.',
          theory:
            'For an image-heavy gallery, images are roughly **90% of the bytes** on the page. Four native HTML attributes, plus one deliberate exception, do most of the work — no library required.\n\n**`loading="lazy"`** defers loading an image until it is about to scroll into view. On a browse grid of 24 artworks, the visitor sees six; lazy loading means the other eighteen are not fetched until the user scrolls, saving bandwidth and speeding first paint. **`decoding="async"`** lets the browser decode the image off the main thread so it does not block rendering.\n\n**Explicit `width` and `height` (or a CSS `aspect-ratio`)** prevent **Cumulative Layout Shift (CLS)** — the janky reflow where text jumps down as an image loads above it and pushes it. If the browser knows the image\'s dimensions up front, it reserves the exact box before the pixels arrive, and nothing moves. CLS is a Core Web Vital that Lighthouse scores directly, so this is measurable, not cosmetic.\n\n**`srcset` and `sizes`** let the browser pick the right file for the device. Without them, a phone downloads the same 1600px image a desktop needs and then scales it down — paying for pixels it cannot show. With `srcset` listing 400/800/1600px variants and `sizes` describing the layout, a phone fetches the 400px file. This is the single biggest image saving on mobile.\n\nThe **exception** is the **LCP image** — the Largest Contentful Paint element, usually the hero or the first, biggest artwork. Lazy-loading your LCP image is a classic mistake: it *delays* the very element Lighthouse times, making your LCP score worse. The LCP image must **not** be lazy; instead give it **`fetchpriority="high"`** so the browser fetches it ahead of other resources. One image eager and prioritised; everything below the fold lazy.\n\nFinally, restate the hard constraint from Module 7: **Supabase image transformations are a paid Pro feature.** You cannot ask Supabase to hand you a 400px WebP on the free tier. So you do it yourself, and it is the better fix anyway: **before upload, resize and re-encode each image to WebP on the client** with a `<canvas>`, storing a couple of sized variants. This shrinks storage (500 MB free), bandwidth (5 GB free), and every future download — all at upload time, once, for free.',
          diagram: `graph TD
    P[Artist detail page loads] --> H[Hero / first big artwork = LCP element]
    P --> G[Grid of gallery thumbnails, mostly below the fold]
    H --> HE[NOT lazy + fetchpriority high<br/>browser fetches it FIRST]
    G --> GL[loading lazy + decoding async<br/>fetched as they scroll into view]
    HE --> CLS[width/height or aspect-ratio<br/>reserves the box -> no layout shift]
    GL --> CLS
    CLS --> SS[srcset + sizes<br/>phone gets 400px, desktop gets 1600px]
    SS --> WEBP[Uploaded as client-resized WebP<br/>Supabase transforms are paid -> we do it free]`,
          flowExplain:
            'Two paths split at the top: the LCP hero is eager and high-priority, everything else is lazy. Both paths then share the same CLS guard and responsive `srcset`, and all of it rests on images that were resized to WebP on the client because Supabase transforms cost money.',
          whyItMatters:
            'LCP and CLS are two of the three Core Web Vitals; images drive both. Lazy-loading the hero (worse LCP) and omitting dimensions (worse CLS) are the two most common image mistakes, and both show up in a Lighthouse report. Knowing that Supabase transforms are paid — so you resize on the client — is exactly the free-tier judgment this course is built on.',
          steps: [
            'Add `loading="lazy"` and `decoding="async"` to every gallery/grid image that is below the fold.',
            'Give every image explicit `width`/`height` or a CSS `aspect-ratio` so its box is reserved before it loads.',
            'Identify the LCP image (the hero or first large artwork). Ensure it is NOT lazy and add `fetchpriority="high"`.',
            'Generate 400/800/1600px WebP variants on the client at upload time and wire them into `srcset` with a `sizes` describing the layout.',
            'Run Lighthouse before and after; record the LCP and CLS numbers as evidence.',
          ],
          code: `// Client-side resize + WebP re-encode BEFORE upload.
// Supabase image transformations are a PAID Pro feature, so we do this ourselves.
async function toWebpVariant(file, maxWidth) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((res) => canvas.toBlob(res, 'image/webp', 0.82)); // free, smaller
}
// On upload: build 400 / 800 / 1600 variants, store all three in Storage.

// Gallery thumbnail (below the fold): lazy, async, dimensioned, responsive.
function GalleryImage({ art }) {
  return (
    <img
      src={art.url800}
      srcSet={\`\${art.url400} 400w, \${art.url800} 800w, \${art.url1600} 1600w\`}
      sizes="(max-width: 600px) 45vw, 300px"   // phone picks 400w, desktop ~300px slot
      width={300}
      height={300}                              // reserves the box -> no layout shift
      loading="lazy"                            // not fetched until it scrolls near
      decoding="async"
      alt={art.title}
    />
  );
}

// The LCP image (hero / first big artwork): the EXCEPTION.
function HeroImage({ art }) {
  return (
    <img
      src={art.url1600}
      srcSet={\`\${art.url800} 800w, \${art.url1600} 1600w\`}
      sizes="100vw"
      width={1200}
      height={675}                              // aspect-ratio reserved -> stable CLS
      fetchpriority="high"                      // fetch this one FIRST
      decoding="async"
      alt={art.title}
      /* NOTE: no loading="lazy" here. Lazy-loading the LCP image delays it
         and directly worsens your Largest Contentful Paint score. */
    />
  );
}`,
          pitfalls: [
            '**Lazy-loading the LCP image.** It defers the exact element Lighthouse times, making LCP worse — the opposite of the intent. Fix: the hero/first-large image is eager and `fetchpriority="high"`; only below-the-fold images are lazy.',
            '**Omitting width/height on images.** Text and cards jump as each image loads, spiking CLS. Fix: set explicit `width`/`height` or a CSS `aspect-ratio` so the box is reserved before the pixels arrive.',
            '**Serving one huge image to every device.** A phone downloads a 1600px file to display it at 400px, burning mobile data. Fix: provide `srcset` variants and a `sizes` hint so the browser picks the right one.',
            '**Assuming Supabase will resize for you.** Image transformations are a paid Pro feature; on the free tier the request just serves the original. Fix: resize and re-encode to WebP on the client at upload time.',
            '**Uploading the original camera JPEG untouched.** A 4 MB photo eats storage and every viewer\'s bandwidth forever. Fix: re-encode to WebP at a sane quality and store sized variants — do the work once, at upload.',
          ],
          tryIt:
            'Run Lighthouse on the artist detail page and note the LCP and CLS scores. Add `fetchpriority="high"` to the hero, `loading="lazy"` to the gallery, and `width`/`height` to all of them. Re-run Lighthouse. The LCP should drop and CLS should approach zero — record both.',
          takeaway:
            'Images are most of your bytes. Lazy-load below the fold, reserve dimensions to kill CLS, serve `srcset` variants, and load the one LCP image eagerly with `fetchpriority="high"` — on WebP files you resized on the client because Supabase transforms are paid.',
        },
        {
          id: 'm13-t8',
          title: 'React.memo, useMemo, useCallback — and when not to',
          explain:
            'Memoisation trades a little work now to skip work later, so it only pays off for a component that re-renders often with the same props and is genuinely expensive to render.',
          analogy:
            'Keeping a cooked pot of sambar ready saves you cooking it fresh each time a guest arrives — worth it if guests come every ten minutes. But if one guest comes a day, you have kept sambar warm for nothing, spending gas to save an effort you rarely needed. Memoisation is that warm pot: it has a running cost, and it only pays back when the thing it saves happens often.',
          theory:
            'React re-renders a component when its state or its parent changes. `React.memo`, `useMemo`, and `useCallback` all exist to *skip* re-computation — and all three have a **cost**: `React.memo` runs a props comparison on every render, `useMemo` and `useCallback` allocate and retain a cached value plus its dependency array. That cost is small, but it is not zero, and applied everywhere it can make an app slower and much harder to read. The correct order is always: **profile first with the React DevTools Profiler**, find the component that actually re-renders often and is actually expensive, and memoise *only* that one.\n\nHere is the case in KalaKaara that matters. The `BrowsePage` has a search box; its `filterText` lives in `useState` and changes on **every keystroke**. Each keystroke re-renders `BrowsePage`, which re-renders all 24 `ArtistCard`s — even though the artists did not change. Wrapping the card in `React.memo` tells React: "skip re-rendering this card if its props are unchanged." Now, on a keystroke, the 24 cards should be skipped.\n\nExcept there is a catch that trips up almost everyone: **`React.memo` does nothing unless the props are referentially stable.** `React.memo` compares props by identity (`Object.is`). If `BrowsePage` passes `artist={{ ...a }}` (a fresh object each render), or `onFavourite={() => fav(a.id)}` (a fresh function each render), the memo sees a *new* reference every time and re-renders anyway. The memo is working perfectly; you defeated it by handing it new references. The fix is to make the props stable: pass the same `artist` object (do not spread it into a new one on each render), and wrap callbacks in **`useCallback`** so the function identity survives across renders. Only then does the `React.memo` on `ArtistCard` actually skip the 24 re-renders per keystroke.\n\nSo the discipline is: do not sprinkle `useMemo`/`useCallback`/`React.memo` defensively. Profile, find the expensive frequent re-render, apply memo *and* stabilise the props it depends on, then re-profile to confirm the render count dropped. A memo with unstable props is worse than no memo — it costs the comparison and skips nothing.',
          whyItMatters:
            '"When would React.memo do nothing?" is a standard senior-React interview question, and the answer — "when the props are not referentially stable, because memo compares by identity" — reveals whether you understand React\'s render model or just cargo-cult the API. In real codebases, memo applied without stabilising props is extremely common and quietly useless.',
          steps: [
            'Open the React DevTools Profiler, record a session while typing in the search box, and see which components re-render on each keystroke.',
            'Confirm the 24 `ArtistCard`s re-render even though the artist data is unchanged — that is the frequent, wasteful render.',
            'Wrap `ArtistCard` in `React.memo`. Re-profile — if the cards still re-render, the props are unstable.',
            'Stabilise the props: stop spreading `artist` into a new object each render, and wrap any callback passed to the card in `useCallback`.',
            'Re-profile and confirm the cards are now skipped on keystrokes. Record the before/after render count for one keystroke.',
          ],
          code: `// The case that matters: filter state changes on every keystroke.

// BEFORE — memo present, but DEFEATED by unstable props.
function BrowsePage({ artists }) {
  const [filterText, setFilterText] = useState('');
  return (
    <>
      <input value={filterText} onChange={(e) => setFilterText(e.target.value)} />
      {artists.map((a) => (
        <ArtistCard
          key={a.id}
          artist={{ ...a }}                 // NEW object every render -> memo sees a change
          onFavourite={() => favourite(a.id)} // NEW function every render -> memo sees a change
        />
      ))}
    </>
  );
}
const ArtistCard = React.memo(function ArtistCard({ artist, onFavourite }) {
  // Genuinely a bit expensive: formats price, renders stars, computes chips.
  return <Card artist={artist} onFavourite={onFavourite} />;
});
// Result: typing re-renders all 24 cards anyway. The memo runs its comparison
// and skips nothing, because every prop is a fresh reference. Worse than no memo.

// AFTER — stabilise the props so React.memo can actually skip.
function BrowsePage({ artists }) {
  const [filterText, setFilterText] = useState('');
  const favourite = useCallback((id) => favouriteService.add(id), []); // stable identity
  return (
    <>
      <input value={filterText} onChange={(e) => setFilterText(e.target.value)} />
      {artists.map((a) => (
        <ArtistCard
          key={a.id}
          artist={a}          // SAME object reference across renders (no spread)
          onFavourite={favourite} // SAME function reference across renders
        />
      ))}
    </>
  );
}
// Now each keystroke re-renders BrowsePage but SKIPS all 24 cards.
// Profiler before: 24 card renders per keystroke. After: 0.`,
          pitfalls: [
            '**Wrapping a component in `React.memo` while passing it fresh objects/functions.** The identity check fails every render, so it re-renders anyway — and now also pays for the comparison. Fix: stabilise the props (no inline object spreads, `useCallback` for handlers) or the memo is pure overhead.',
            '**Memoising before profiling.** You spend effort on components that render once and ignore the one that renders per keystroke. Fix: let the DevTools Profiler point to the frequent, expensive render first.',
            '**`useMemo` on a trivial computation.** Caching `a + b` costs more (allocation, dependency check) than recomputing it. Fix: reserve `useMemo` for genuinely expensive calculations or for preserving a reference other memoised children depend on.',
            '**Sprinkling `useCallback` on every function.** Most callbacks are not passed to memoised children, so wrapping them just adds allocations. Fix: use `useCallback` only when the function identity actually matters to a memoised consumer or an effect dependency.',
            '**Believing memo skips because the code "looks memoised".** Only the Profiler tells you whether renders were actually skipped. Fix: re-profile after memoising and confirm the render count dropped — otherwise you changed nothing.',
          ],
          tryIt:
            'Profile the browse page while typing one word into the search box. Count how many `ArtistCard` renders each keystroke causes. Wrap the card in `React.memo`, then stabilise the `artist` and callback props. Re-profile. If the card render count did not drop to zero, your props are still unstable — find the fresh reference.',
          takeaway:
            'Profile first, then memoise the one component that re-renders often and is expensive. `React.memo` compares props by identity and does nothing unless those props are referentially stable — a memo with unstable props is worse than no memo.',
        },
        {
          id: 'm13-t9',
          title: 'When to virtualise a list — and why KalaKaara does not',
          explain:
            'List virtualisation renders only the rows on screen, which is powerful and unnecessary until you have hundreds of heavy rows at once.',
          analogy:
            'A cinema in Udupi does not build ten thousand seats for a film that sells two hundred tickets a show — it fills the hall it has and turns over the audience between shows. Virtualisation is building a small hall and recycling seats as people move. For a two-hundred-seat crowd, a normal hall is simpler and just as good; you only need the recycling trick when the crowd is genuinely enormous.',
          theory:
            'A **virtualised list** (via a library like `react-window` or `react-virtual`) renders only the handful of rows currently visible in the viewport and recycles their DOM nodes as you scroll, keeping the number of live DOM elements tiny no matter how long the list is. This is a real and important technique — for the right problem. The problem it solves is a **very long list of DOM-heavy rows rendered at once**: thousands of table rows, an infinite chat log, a giant transaction ledger. There, mounting every row creates tens of thousands of DOM nodes, the browser chokes, scrolling stutters, and memory balloons. Virtualisation fixes exactly that.\n\n**KalaKaara does not have that problem, and adding virtualisation would be a mistake.** The browse grid shows **24 paginated cards**. Twenty-four `ArtistCard`s is a trivial amount of DOM; the browser renders it without breaking a sweat, and pagination (t5) means you never mount hundreds at once — the next page replaces the current one. Introducing `react-window` here would add a dependency, complicate the layout (virtualised grids fight with responsive CSS and variable card heights), break in-page find (Ctrl-F cannot find un-rendered rows), and complicate accessibility — all to solve a problem you do not have. That is negative-value engineering: cost with no measured benefit.\n\nThe useful thing to carry away is the **threshold**, so you recognise the situation when you actually meet it. Reach for virtualisation when you are rendering roughly **hundreds of DOM-heavy rows simultaneously** and the Profiler or a janky scroll confirms the DOM count is the bottleneck. Signs: mount time climbing with list length, scroll frame drops, memory growing with rows on screen. Below that — a few dozen items, or any length that is paginated so only a page is mounted — plain rendering is correct. Virtualisation, like every technique in this module, is a fix you apply to a measured problem, not a badge you add for sophistication.',
          whyItMatters:
            'Junior engineers often reach for virtualisation to look thorough and end up with a brittle grid solving a non-problem. Knowing the threshold — hundreds of heavy rows mounted at once — and being able to say "we paginate 24, so we do not need it" demonstrates the judgment to *not* add complexity, which is as valuable as knowing how to add it.',
          steps: [
            'Count how many list items KalaKaara ever mounts at once. With 24-per-page pagination, the answer is 24.',
            'Recognise the virtualisation threshold: hundreds of DOM-heavy rows rendered simultaneously, confirmed by a janky scroll or a climbing DOM node count.',
            'Decide, on evidence, that KalaKaara is far below the threshold and does not need `react-window`.',
            'Note the sign you would watch for: if a future feature renders a long un-paginated list (say, a full activity log), re-measure then.',
            'Write the decision and its threshold into your notes so the next person does not add virtualisation reflexively.',
          ],
          code: `// KalaKaara's browse grid: 24 paginated cards. Plain map. No virtualisation.
function BrowseGrid({ artists }) {
  // 24 ArtistCards mounted at most. The DOM node count is trivial;
  // pagination (t5) guarantees the next page REPLACES this one.
  return (
    <div className="grid">
      {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
    </div>
  );
}

/*
  WHEN you WOULD virtualise (so you recognise it in the wild):

    Threshold: rendering ~hundreds of DOM-heavy rows AT ONCE, with a measured
    symptom -> mount time grows with list length, scroll drops frames,
    memory climbs with rows on screen.

  A virtualised version would look like this (react-window), and KalaKaara
  deliberately does NOT do this:

    import { FixedSizeList } from 'react-window';
    <FixedSizeList height={800} itemCount={5000} itemSize={120} width="100%">
      {({ index, style }) => <Row style={style} item={items[index]} />}
    </FixedSizeList>

  It renders only the visible ~7 rows and recycles them. Great for 5,000 rows.
  Pointless for 24 -- and it would fight responsive CSS, break Ctrl-F find,
  and complicate a11y. Adding it here is cost with no measured benefit.
*/`,
          pitfalls: [
            '**Adding `react-window` to a short, paginated list.** You take on a dependency and layout complexity to solve a problem you do not have. Fix: virtualise only when hundreds of heavy rows are mounted at once and the DOM count is a measured bottleneck.',
            '**Virtualising a responsive card grid.** Virtual lists assume fixed or measured row heights; responsive multi-column grids with variable card heights fight the abstraction. Fix: for grids of a few dozen items, render normally.',
            '**Forgetting virtualisation breaks in-page find and some a11y.** Un-rendered rows cannot be found with Ctrl-F or reached by a screen reader scanning the DOM. Fix: weigh those costs; they only pay off past the threshold.',
            '**Confusing pagination with virtualisation.** They solve the same pressure two ways; if you already paginate 24 per page, you rarely also need to virtualise. Fix: pick one strategy per list, matched to how many rows mount at once.',
            '**Treating virtualisation as a maturity signal.** Adding it "because real apps do" is complexity for its own sake. Fix: it is a fix for a measured DOM-count problem, nothing more.',
          ],
          tryIt:
            'Open DevTools Elements and count the DOM nodes your browse grid mounts. It is a couple of dozen cards. Now imagine a full unpaginated list of 5,000 — that is when the count explodes and virtualisation earns its place. State, in one sentence, the threshold at which you would switch. (Hundreds of DOM-heavy rows mounted simultaneously.)',
          takeaway:
            'Virtualisation renders only visible rows and is the right tool for hundreds of DOM-heavy rows mounted at once. KalaKaara paginates 24 cards, so it stays well below that threshold — know the threshold, and do not add the complexity until you cross it.',
        },
      ],
    },
    {
      id: 'm13-s3',
      title: 'Caching, and not fetching twice',
      topics: [
        {
          id: 'm13-t10',
          title: 'A small cache in the service layer, done honestly',
          explain:
            'A tiny Map with a TTL in the service layer can serve a repeated query instantly, refresh it in the background, and drop stale data on write — and then hand off to TanStack Query when you outgrow it.',
          analogy:
            'The tea stall at the Kundapura bus stand keeps a small flask of tea already made. When you ask, you get a cup from the flask instantly, and the boy quietly puts a fresh pot on to brew for the next person. If the price changes, he throws out the flask so nobody gets tea at yesterday\'s rate. Serve from the flask, refill in the background, discard when something changes — that is exactly stale-while-revalidate with invalidation on write.',
          theory:
            'A visitor who opens the browse page, taps into an artist, and hits back has just triggered the same browse query twice. Fetching it twice wastes a round trip and bandwidth for data that did not change in three seconds. A **small cache** fixes this, and — because of the dependency rule from m0 — it belongs in the **`services/` layer**. That is the payoff of "only `services/` imports Supabase": you add caching in **one folder** and every query in the app inherits it, with no component changed.\n\nThe simplest cache is a module-level **`Map` keyed by the serialised query**, each entry carrying a value and a timestamp, with a **TTL** (time to live). On a call, serialise the arguments into a key; if a fresh entry exists (within the TTL), return it; otherwise fetch, store, and return. That alone removes the duplicate fetch.\n\n**Stale-while-revalidate (SWR)** makes it feel instant *and* stay current. When a cached entry exists but is past its TTL, you **return the stale value immediately** so the UI paints now, **and kick off a background refetch** that updates the cache (and, via a subscription or state update, the UI) when it lands. The user sees data instantly and gets the fresh version a moment later — the best of both.\n\n**Cache invalidation on write** is the hard, essential half — "there are only two hard things in computer science, and one of them is cache invalidation." When the user favourites an artist, the cached **favourites list** is now wrong. If you do not invalidate it, the favourites page shows stale data until the TTL expires. So every write must **invalidate the cache entries it affects**: favouriting invalidates the favourites query; publishing a profile invalidates the browse list. You delete those keys so the next read refetches.\n\nAnd then the honest part. This hand-rolled cache is a teaching tool that captures the ideas — keyed cache, TTL, SWR, invalidation. **TanStack Query does all of this properly**: request deduplication, background refetching, cache invalidation by key, retries, devtools, and out-of-the-box SWR. The moment your caching needs grow past a couple of queries — the day you are writing your third bespoke invalidation and your second race-condition guard — **adopt TanStack Query** instead of extending the Map. Build the small one to understand what it does; reach for the library when the hand-rolled version stops being simpler than the real thing.',
          diagram: `stateDiagram-v2
    [*] --> Empty
    Empty --> Fetching: first call, no entry
    Fetching --> Fresh: response stored with timestamp
    Fresh --> Fresh: call within TTL -> return cached, no fetch
    Fresh --> Stale: TTL elapsed
    Stale --> ServingStale: call arrives
    ServingStale --> Revalidating: return stale NOW + refetch in background
    Revalidating --> Fresh: background response updates cache
    Fresh --> Empty: write invalidates this key
    Stale --> Empty: write invalidates this key`,
          flowExplain:
            'Follow the `Stale -> ServingStale -> Revalidating` path: that is stale-while-revalidate — the user gets the cached value instantly while a background fetch refreshes it. The `-> Empty` arrows are invalidation on write, which drops the key so the next read is fresh.',
          whyItMatters:
            'Caching and cache invalidation are perennial interview and design topics, and "return stale, revalidate in the background, invalidate on write" is the pattern every serious data layer implements. Equally important is knowing when to stop hand-rolling and adopt TanStack Query — recognising that boundary is senior judgment, not a failure.',
          steps: [
            'Create a `cache.js` in `services/` with a module-level `Map` keyed by a serialised query and a TTL.',
            'Wrap read functions so they check the cache, return a fresh hit, and otherwise fetch-store-return.',
            'Add stale-while-revalidate: when an entry is past TTL, return it immediately and refetch in the background to update the entry.',
            'On every write (favourite, publish, review), invalidate the affected cache keys so the next read refetches.',
            'Write the honest note in your README: this is TanStack Query in miniature; adopt the library when caching needs grow past a couple of queries.',
          ],
          code: `// services/cache.js — a small TTL cache with stale-while-revalidate.
const store = new Map();               // key -> { value, ts }
const TTL = 30_000;                    // 30s; tune per query

const keyOf = (name, args) => name + ':' + JSON.stringify(args);

export async function cached(name, args, fetcher) {
  const key = keyOf(name, args);
  const hit = store.get(key);
  const now = Date.now();

  if (hit && now - hit.ts < TTL) return hit.value;          // FRESH: no fetch

  if (hit) {
    // STALE-WHILE-REVALIDATE: return stale now, refresh in the background.
    fetcher().then((value) => store.set(key, { value, ts: Date.now() })).catch(() => {});
    return hit.value;
  }

  const value = await fetcher();                            // EMPTY: fetch and store
  store.set(key, { value, ts: now });
  return value;
}

// Invalidation on write: drop every key that starts with a prefix.
export function invalidate(prefix) {
  for (const key of store.keys()) if (key.startsWith(prefix)) store.delete(key);
}

// services/favoriteService.js — writes MUST invalidate what they change.
import { cached, invalidate } from './cache';

export function listFavourites(userId) {
  return cached('favourites', { userId }, async () => {
    const { data, error } = await supabase
      .from('favorites').select('artist_id, artists(*)').eq('user_id', userId);
    if (error) throw new Error(error.message);
    return data;
  });
}

export async function addFavourite(userId, artistId) {
  const { error } = await supabase.from('favorites').insert({ user_id: userId, artist_id: artistId });
  if (error) throw new Error(error.message);
  invalidate('favourites');   // the favourites list is now stale -> drop it
}

/*
  HONEST NOTE: this is TanStack Query in miniature. It does dedup + TTL + SWR +
  invalidation properly, with retries and devtools. Build this to understand the
  ideas; adopt @tanstack/react-query the day your caching grows past a query or two.
*/`,
          pitfalls: [
            '**Caching reads but forgetting to invalidate on write.** Favouriting an artist leaves the favourites page showing stale data until the TTL expires. Fix: every write invalidates the cache keys it affects — treat it as part of the write, not an afterthought.',
            '**Putting the cache in a hook or component.** Then each component has its own cache and nothing is shared. Fix: cache in the `services/` layer so one implementation serves every caller — the whole reason for the dependency rule.',
            '**A TTL that is too long for volatile data.** Cache a rating count for an hour and reviewers see stale numbers. Fix: match the TTL to how fast the data changes, and invalidate on the writes that change it.',
            '**Serialising the key inconsistently.** `{a:1,b:2}` and `{b:2,a:1}` stringify differently and cache as two entries. Fix: normalise the key (sort keys, or use a stable serialiser) so equivalent queries share a slot.',
            '**Hand-rolling forever.** By your third bespoke invalidation and second race guard, the Map is more complex than the library. Fix: adopt TanStack Query once needs outgrow a trivial cache — that is the intended off-ramp, not a defeat.',
          ],
          tryIt:
            'Open the browse page, click into an artist, then hit back, watching the Network tab. Without the cache you see the browse query fire twice; with the TTL cache the second load serves from memory. Then favourite an artist and confirm the favourites list refetches (because the write invalidated its key) rather than serving a stale cached copy.',
          takeaway:
            'A `Map` + TTL in `services/` removes duplicate fetches; stale-while-revalidate makes reads feel instant while staying current; and every write must invalidate the keys it changes. When needs grow past a query or two, adopt TanStack Query — it does all of this properly.',
        },
        {
          id: 'm13-t11',
          title: 'Request waterfalls, prefetch, and preconnect',
          explain:
            'When one request must finish before the next can start, you get a waterfall — collapse it with an embedded select or Promise.all, prefetch on intent, and preconnect to Supabase so the first query starts warm.',
          analogy:
            'Three clerks at the temple office each hand you a token you must carry to the next clerk before he will serve you — you shuffle across the room three times in sequence. If the three tasks did not actually depend on each other, they could serve you at three counters at once. A request waterfall is that needless single-file queue; Promise.all is opening all three counters together.',
          theory:
            'The artist detail page naively fetches in a **waterfall**: fetch the artist, then — *once it has the artist id* — fetch that artist\'s artworks, then fetch the reviews. Three round trips, strictly sequential, each waiting for the one before. The total latency is the **sum** of three requests plus three lots of network overhead, even though the artworks and reviews do not actually depend on each other. On a 4G connection in Kundapura, three sequential round trips is a visibly slow page.\n\nThere are two fixes, and which one applies depends on the dependency.\n\n**When the queries are genuinely independent, run them together.** Once you have the artist id, the artworks query and the reviews query do not need each other — so fire them with **`Promise.all`**. Both go out at once and you wait for the slower of the two, not the sum. The total drops from `artist + artworks + reviews` to `artist + max(artworks, reviews)`.\n\n**When they are actually related, embed.** Better still, PostgREST can fetch the artist *with* its artworks and reviews nested in **one** request: `select(\'*, artworks(*), reviews(*)\')`. That collapses three round trips into one — the same embedded-select move from t4, applied to the detail page. Prefer this when the relationships are foreign keys Postgres can follow.\n\nTwo more techniques attack the latency *before* the query even fires. **Prefetch on intent**: when a user hovers or focuses an `ArtistCard`, they are signalling they will probably click it — so start fetching that artist\'s detail data on `onMouseEnter`, and by the time they click, it is already cached (using the cache from t10). This spends a request that is *usually* wanted to hide latency the user would otherwise feel. And **`<link rel="preconnect">`** in `index.html`, pointing at your Supabase origin, tells the browser to do the DNS lookup and TLS handshake to Supabase **during initial page load**, before any query is made — so when the first `supabase.from(...)` fires, the connection is already open and the handshake cost is already paid. It is one line of HTML for a measurable head start on the very first request.',
          diagram: `sequenceDiagram
    autonumber
    participant R as React (ArtistDetail)
    participant PG as Supabase

    Note over R,PG: Waterfall — sequential, sum of three
    R->>PG: fetch artist by slug
    PG-->>R: artist (now we have the id)
    R->>PG: fetch artworks where artist_id = id
    PG-->>R: artworks
    R->>PG: fetch reviews where artist_id = id
    PG-->>R: reviews
    Note over R,PG: total = artist + artworks + reviews

    Note over R,PG: Promise.all — parallel once id is known
    R->>PG: fetch artist by slug
    PG-->>R: artist (id)
    par independent
      R->>PG: fetch artworks
    and
      R->>PG: fetch reviews
    end
    PG-->>R: artworks + reviews together
    Note over R,PG: total = artist + max(artworks, reviews)`,
          flowExplain:
            'The top half waits for each request before starting the next — total time is the sum. The bottom half fires the two independent queries in parallel with Promise.all, so total time is the artist fetch plus the slower of the two, not all three added up.',
          whyItMatters:
            'Request waterfalls are one of the most common causes of a slow-feeling page, and spotting a needless sequential chain — then fixing it with Promise.all or an embed — is a frequent interview and review scenario. Prefetch-on-hover and preconnect are the polish that separates a page that feels instant from one that merely is not slow.',
          steps: [
            'Open the Network tab on the artist detail page and look at the waterfall chart. If artworks and reviews start only after the previous finished, you have a needless waterfall.',
            'If the data is related, collapse it into one embedded select: `*, artworks(*), reviews(*)`.',
            'If you keep separate queries, run the independent ones with `Promise.all` so they overlap.',
            'Add prefetch: on `ArtistCard` `onMouseEnter`, warm the detail query into the t10 cache.',
            'Add `<link rel="preconnect" href="https://<project>.supabase.co">` to `index.html` and confirm the first query starts without a fresh handshake.',
          ],
          code: `// BEFORE — a three-step waterfall. Each await blocks the next.
async function loadArtistPageSlow(slug) {
  const artist = await artistService.getBySlug(slug);          // 1
  const artworks = await artworkService.listByArtist(artist.id); // 2 (waits for 1)
  const reviews = await reviewService.listByArtist(artist.id);   // 3 (waits for 2)
  return { artist, artworks, reviews };
  // total latency = t(artist) + t(artworks) + t(reviews)
}

// AFTER (option A) — one embedded select. Three round trips -> one.
async function loadArtistPageEmbedded(slug) {
  const { data, error } = await supabase
    .from('artists')
    .select('*, artworks(*), reviews(*)')     // PostgREST nests related rows
    .eq('slug', slug)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// AFTER (option B) — Promise.all for genuinely independent queries.
async function loadArtistPageParallel(slug) {
  const artist = await artistService.getBySlug(slug);         // must come first: we need the id
  const [artworks, reviews] = await Promise.all([             // independent -> in parallel
    artworkService.listByArtist(artist.id),
    reviewService.listByArtist(artist.id),
  ]);
  return { artist, artworks, reviews };
  // total latency = t(artist) + max(t(artworks), t(reviews))
}

// Prefetch on intent: warm the cache when the user hovers a card.
function ArtistCard({ artist }) {
  const prefetch = () => artistService.getBySlug(artist.slug); // cached by t10's cache
  return <Link to={\`/artists/\${artist.slug}\`} onMouseEnter={prefetch}>...</Link>;
}

/* index.html — open the TLS connection to Supabase during page load,
   so the FIRST query does not pay for DNS + handshake.

   <link rel="preconnect" href="https://YOUR-PROJECT.supabase.co" crossorigin />
*/`,
          pitfalls: [
            '**Awaiting independent queries in sequence.** `await artworks; await reviews;` makes the page wait for their sum when they could overlap. Fix: `Promise.all` for queries that do not depend on each other.',
            '**Using Promise.all on dependent queries.** You cannot fetch artworks in parallel with the artist when you need the artist\'s id first. Fix: await the dependency, then parallelise everything downstream of it — or embed.',
            '**Prefetching on render instead of intent.** Prefetching every card\'s detail on mount fires dozens of requests nobody asked for. Fix: prefetch on `onMouseEnter`/focus, when the user has signalled likely intent.',
            '**Skipping preconnect and paying the handshake on the first query.** The first `supabase.from(...)` then eats DNS + TLS setup before any data moves. Fix: one `<link rel="preconnect">` to the Supabase origin in `index.html`.',
            '**Embedding when the related sets are huge.** `artworks(*)` with hundreds of artworks re-inflates one response into a monster. Fix: embed only the fields and the volume the page renders, or paginate the embed.',
          ],
          tryIt:
            'Open the artist detail page with the Network tab in waterfall view. Do artworks and reviews start only after each prior request finished? Convert them to a single embedded select, reload, and confirm three requests became one. Then add the preconnect line and check whether the first request starts faster.',
          takeaway:
            'A waterfall is sequential requests that need not be. Collapse related fetches into one embedded select, run independent ones with `Promise.all`, prefetch on hover, and preconnect to Supabase so the first query starts with the handshake already done.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm13-p1',
      type: 'Mini Project',
      title: 'Measure, Then Optimise: a before/after performance report',
      domain: 'Performance Engineering',
      duration: '2 hours',
      description:
        'Take the KalaKaara browse and artist-detail pages as they stand, record hard baselines with Lighthouse and explain analyze, then apply this module\'s techniques one at a time — named columns, a composite/partial index, the N+1 fix, route-level React.lazy, image lazy-loading with srcset and an eager LCP image, a TTL cache with stale-while-revalidate, and preconnect — re-measuring after each. The deliverable is a table of deltas, not the code: every optimisation must be justified by a number that moved.',
      tools: ['React', 'Vite', 'Supabase', 'Lighthouse', 'Chrome DevTools', 'explain analyze'],
      blueprint: {
        overview:
          'A single markdown report, `docs/performance-report.md`, that opens with a baseline table (Lighthouse scores, key query plans and timings, bundle size, and browse-page request count) captured before any change, then documents each optimisation with its own before/after measurement, and closes with a summary delta table. The report is the product. Code changes exist only to move the numbers, and any change that does not move a number is reverted and noted as such — measuring is how you know an optimisation was real.',
        functionalRequirements: [
          '**Baseline capture.** Lighthouse run (Performance score, LCP, CLS, TBT) on `/artists` and `/artists/:slug`; `explain (analyze, buffers)` on the browse query; `npm run build` chunk sizes; and the browse-page request count from the Network tab — all recorded before touching anything.',
          '**Database deltas.** Named columns instead of `select(\'*\')` with before/after payload size; a composite or partial index with before/after query plan and execution time; the N+1 fix with before/after request count.',
          '**Frontend deltas.** Route-level `React.lazy` on the dashboard with before/after initial bundle size; image lazy-loading, `srcset`, dimensions, and an eager `fetchpriority="high"` LCP image with before/after LCP and CLS.',
          '**Caching deltas.** A TTL cache with stale-while-revalidate showing the duplicate browse fetch eliminated on back-navigation, plus a `<link rel="preconnect">` with a note on the first-request head start.',
          '**Honesty column.** For every technique, a one-line verdict: did the number move, by how much, and was it worth the complexity? At least one entry should honestly record a change that was not worth keeping (for example, virtualisation, or keyset pagination at this scale).',
          '**Summary delta table.** A final table with columns: metric, before, after, delta, technique — the artefact a reviewer reads in thirty seconds.',
          '**Reproducibility.** Every measurement lists exactly how it was taken (which page, which DevTools panel, seeded row count) so the numbers can be reproduced, not just believed.',
        ],
        technicalImplementation: [
          '**explain analyze in the Supabase SQL editor.** Capture the full plan text (node types, rows estimate vs actual, execution time) into the report as fenced code blocks — before and after each index.',
          '**Lighthouse in Chrome DevTools.** Run in an incognito window with a consistent throttling profile (mobile, 4G) so before and after are comparable; record Performance, LCP, CLS, TBT.',
          '**rollup-plugin-visualizer + npm run build.** Use the treemap to identify the fat dependency and the printed chunk sizes for the bundle deltas.',
          '**DevTools Network tab.** Read the Size column for payload deltas and count requests for the N+1 and waterfall deltas; use the waterfall view to show sequential-vs-parallel.',
          '**One change at a time.** Apply, re-measure, record, then move on — never batch optimisations, or you cannot attribute which number moved because of which change.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Baseline: capture the numbers before any change',
            outcome:
              'docs/performance-report.md with a baseline section: Lighthouse, query plan, bundle size, and request count, all pre-optimisation.',
            prompt:
              'Create `docs/performance-report.md`. Add a "Baseline" section and help me capture, for the KalaKaara browse (`/artists`) and artist-detail (`/artists/:slug`) pages: (a) a Lighthouse run in incognito with mobile + 4G throttling, recording Performance score, LCP, CLS, and TBT; (b) the output of `explain (analyze, buffers)` on the browse query `where is_published order by created_at desc limit 24`, pasted as a fenced code block, noting the node type, rows estimate vs actual, and execution time; (c) the chunk sizes printed by `npm run build`; (d) the number of network requests the browse page makes, from the DevTools Network tab. For each, record exactly how it was measured (page, panel, seeded row count) so it is reproducible. Change no application code in this step — only measure.',
          },
          {
            step: 2,
            label: 'Database: named columns, index, and the N+1 fix',
            outcome:
              'Three database optimisations, each with a before/after measurement in the report.',
            prompt:
              'Apply three database optimisations to KalaKaara, one at a time, recording before/after numbers in the report. (1) In `artistService.js`, replace `.select(\'*\')` on the browse list with an explicit column list defined once as a constant, and record the DevTools Network "Size" delta for the 24-card grid. (2) Add a composite index on `artists (is_published, created_at desc)` (then try the partial variant `(created_at desc) where is_published`), re-run `explain (analyze, buffers)`, and paste the before plan (Seq Scan + Sort) and after plan (Index Scan, no Sort) with both execution times. (3) Find the N+1 where each `ArtistCard` fetches its categories in a `useEffect`, replace it with an embedded select `*, artist_categories(categories(name))` mapped at the service boundary, and record the before/after request count from the Network tab. Do not batch these — measure after each.',
          },
          {
            step: 3,
            label: 'Frontend: code splitting and image optimisation',
            outcome:
              'Bundle-size and LCP/CLS deltas from lazy routes and image handling.',
            prompt:
              'Apply two frontend optimisations with before/after measurements. (1) Add `rollup-plugin-visualizer` to `vite.config.js`, run `npm run build`, and identify the fattest dependency; then convert `/dashboard` (and other rarely-first-loaded routes) to `React.lazy` wrapped in a `<Suspense fallback={<PageSkeleton/>}>`, rebuild, and record the initial-bundle size before and after plus the new dashboard chunk size. (2) On the artist-detail page, add `loading="lazy"` and `decoding="async"` to below-the-fold gallery images, give every image explicit `width`/`height`, add `srcset`/`sizes` variants, and make the hero/LCP image eager with `fetchpriority="high"` (NOT lazy); note that the WebP variants are produced by client-side resize because Supabase transformations are a paid feature. Run Lighthouse before and after and record the LCP and CLS deltas.',
          },
          {
            step: 4,
            label: 'Caching, preconnect, and collapsing the waterfall',
            outcome:
              'Cache and network-setup optimisations with their observed effects.',
            prompt:
              'Add the caching and network optimisations. (1) Create `services/cache.js` — a module-level `Map` keyed by the serialised query with a TTL and stale-while-revalidate — and wrap the browse and favourites reads with it; demonstrate in the report that navigating browse -> artist -> back no longer refetches the browse query, and that favouriting an artist invalidates and refetches the favourites list. (2) On the artist-detail page, collapse the artist -> artworks -> reviews waterfall into one embedded select (or `Promise.all` for the independent parts) and record the request-count and timing delta from the Network waterfall view. (3) Add `<link rel="preconnect" href="https://YOUR-PROJECT.supabase.co" crossorigin />` to `index.html` and note the first-request head start. Record each before/after in the report.',
          },
          {
            step: 5,
            label: 'Summary delta table and the honesty column',
            outcome:
              'A one-glance summary table plus honest verdicts, including at least one optimisation not worth keeping.',
            prompt:
              'Finish `docs/performance-report.md` with a summary delta table with columns: Metric, Before, After, Delta, Technique — covering payload size, query execution time, browse request count, initial bundle size, LCP, CLS, and duplicate-fetch elimination. Add an "Honesty" column or section giving a one-line verdict for each technique: did the number move, by how much, and was it worth the complexity? Include at least one entry that honestly records a change that was NOT worth it at KalaKaara\'s scale — for example, keyset pagination (offset is fine for hundreds of rows) or list virtualisation (24 paginated cards do not need it) — with the threshold at which it would become worth it. Close with a two-sentence conclusion restating the module thesis: every optimisation here was justified by a measurement, and the ones that moved no number were reverted.',
          },
        ],
        deliverable:
          'A single markdown report whose centrepiece is a before/after delta table: for each optimisation applied to KalaKaara, the exact metric that changed, by how much, how it was measured, and an honest verdict on whether it was worth it — including at least one technique deliberately not adopted. A reviewer should be able to read the summary table in under a minute and see that every change was grounded in a number, not a guess.',
      },
    },
  ],
  quiz: [
    {
      id: 'm13-q1',
      q: 'In an explain analyze plan for the browse query, you see a "Seq Scan on artists" reading 9,800 rows to return 24. What does that indicate?',
      options: [
        'The statistics are stale and you must run analyze',
        'The query is optimally planned and needs no change',
        'No usable index served the WHERE, so Postgres scanned every row — a candidate for a composite or partial index',
        'The table is corrupted and must be rebuilt',
      ],
      answer: 2,
    },
    {
      id: 'm13-q2',
      q: 'Why is passing count: \'exact\' on a public browse grid expensive?',
      options: [
        'It fetches every column of every row into the browser',
        'It makes Postgres scan the whole table to produce a precise total, a cost that grows with the table — an estimated count avoids this',
        'It disables all indexes on the table for the duration of the query',
        'It forces the query to run twice, once for data and once for the count',
      ],
      answer: 1,
    },
    {
      id: 'm13-q3',
      q: 'You open the Network tab on the browse page and see one request to list artists followed by 24 requests to a categories endpoint, one per card. What is this, and what is the fix?',
      options: [
        'It is an N+1 query; fix it with a single embedded select that nests each artist\'s categories in one response',
        'It is normal parallel prefetching; no fix is needed',
        'It is a cache miss; raise the TTL to eliminate the extra requests',
        'It is a waterfall; fix it by wrapping the fetches in Promise.all',
      ],
      answer: 0,
    },
    {
      id: 'm13-q4',
      q: 'You wrap ArtistCard in React.memo, but the Profiler shows all 24 cards still re-render on every keystroke in the search box. Why?',
      options: [
        'React.memo only works on class components, not function components',
        'The search input is inside the card, so it forces a re-render',
        'React.memo caches for a fixed time and the TTL has not elapsed',
        'The parent passes new object/function references (a spread artist or an inline callback) each render, so memo\'s identity comparison sees changed props and re-renders anyway',
      ],
      answer: 3,
    },
    {
      id: 'm13-q5',
      q: 'Why must the LCP (Largest Contentful Paint) hero image NOT use loading="lazy"?',
      options: [
        'Lazy-loading defers the very element Lighthouse times as the LCP, delaying it and worsening the LCP score; the hero should be eager with fetchpriority="high"',
        'loading="lazy" is invalid HTML on hero images and will be ignored',
        'Lazy images cannot use srcset, so the hero would download the wrong size',
        'The LCP image must be lazy; making it eager is the mistake',
      ],
      answer: 0,
    },
    {
      id: 'm13-q6',
      q: 'On the Supabase free tier, why does KalaKaara resize and re-encode images to WebP on the client before upload instead of requesting resized images from Supabase?',
      options: [
        'The browser cannot display images that Supabase has not transformed',
        'Client-side resizing is required by Postgres Row Level Security',
        'Supabase image transformations are a paid Pro feature, so client-side resize is the free — and better — fix that also shrinks storage and bandwidth',
        'WebP is the only format Supabase Storage accepts for upload',
      ],
      answer: 2,
    },
    {
      id: 'm13-q7',
      q: 'A user favourites an artist. Your service layer caches the favourites list with a TTL. What must happen so the favourites page does not show stale data?',
      options: [
        'Nothing — the TTL will eventually expire and refresh the list on its own',
        'The write must invalidate the cached favourites key so the next read refetches, rather than serving the now-stale cached copy',
        'The cache must be moved from the service layer into the component',
        'The favourites query must switch from an estimated count to an exact count',
      ],
      answer: 1,
    },
  ],
}
