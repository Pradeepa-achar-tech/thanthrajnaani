// Module 9 — Public Pages: Browse, Search, Filter, Discover
// KalaKaara (React + Supabase) course content for the React course player.

export const m9 = {
  id: 'm9',
  title: 'Public Pages — Browse, Search, Filter, Discover',
  hours: 8,
  color: 'from-indigo-500/20 to-indigo-700/10',
  accent: 'indigo',
  description:
    'The public face of KalaKaara: a browse page with nine filters, debounced full-text search, seven sort options, and pagination — every bit of it driven by the URL so a filtered search is shareable and works for a logged-out stranger. Then the artist detail page with an accessible portfolio lightbox, the artwork detail page with related items, and the four render states every list must ship. Everything in this module works with no login, anywhere.',
  sections: [
    {
      id: 'm9-s1',
      title: 'The browse page and its filters',
      topics: [
        {
          id: 'm9-t1',
          title: 'The query builder in the service layer',
          explain:
            'A browse query is not one fixed statement — it is a Supabase query object you build up clause by clause, adding a filter only when the visitor actually set it.',
          analogy:
            'Watch a fish seller at the Kundapura harbour weigh out an order. She does not start with a fixed bill. She puts the empty pan on the scale, then adds mackerel only if you asked for mackerel, adds prawns only if you asked for prawns, and reads the total at the end. The query builder works the same way: start with an empty pan (published artists), add a clause per filter the visitor set, then read the result.',
          theory:
            'In `supabase-js` v2, `supabase.from(\'artists\').select(...)` returns a **builder object**, and every method — `.eq()`, `.in()`, `.gte()`, `.order()`, `.range()` — returns that same builder so you can keep chaining. Crucially, the request is not sent until you `await` it. That means you can hold the builder in a variable, conditionally attach clauses, and only then await. This is the single most important pattern in the whole module.\n\nStart every browse query with the two clauses that are **always** true: the columns you want, and the visibility rule.\n\n`supabase.from(\'artists\').select(\'id, slug, display_name, ...\', { count: \'exact\' }).eq(\'is_published\', true)`\n\nThe `{ count: \'exact\' }` option asks PostgREST to also return the total number of matching rows in a `Content-Range` header — you need that for the pager (topic 7). The `.eq(\'is_published\', true)` is not really security (RLS already hides unpublished rows from anonymous callers — topic 12), it is a clarity clause that makes the intent obvious and keeps the query honest even for a signed-in artist who can see their own draft.\n\nThen you attach the optional clauses. Only if a category was chosen do you add `.in(...)`; only if a minimum rating was set do you add `.gte(\'rating_avg\', min)`; only if a sort was chosen do you add `.order(...)`. A missing filter contributes **no clause at all** — not a clause that matches everything. This matters: `.eq(\'district_id\', null)` is a real filter that matches only rows whose district is NULL, which is never what "the visitor did not pick a district" means.\n\nOne rule runs through all of it: **never `select(\'*\')`.** Name your columns. On a free-tier project your ceiling is not CPU, it is the 5 GB/month bandwidth cap, and `select(\'*\')` drags every column — long bios, timestamps you never render, internal flags — across the wire on every card in every list. Name the eight or nine columns a card actually needs and you cut the payload by more than half.',
          diagram: `graph LR
    F[Visitor sets filters<br/>in the UI] --> URL[URL search params]
    URL --> QB[Service: build query]
    QB --> B0[from artists<br/>select named cols count exact]
    B0 --> B1[eq is_published true]
    B1 --> C1{category set?}
    C1 -- yes --> IN[.in slug ...]
    C1 -- no --> SKIP1[add nothing]
    IN --> C2{min rating set?}
    SKIP1 --> C2
    C2 -- yes --> GTE[.gte rating_avg min]
    C2 -- no --> SKIP2[add nothing]
    GTE --> AW[await -> PostgREST]
    SKIP2 --> AW
    AW --> RLS[(Postgres + RLS)]
    RLS --> R[rows + total count]`,
          flowExplain:
            'Each diamond is a filter that either attaches one clause or attaches nothing — a missing filter is silence, never a match-everything clause. Everything funnels into a single await that hits PostgREST, then RLS decides the rows.',
          whyItMatters:
            'Conditional query building is the difference between one clean 40-line service function and a combinatorial mess of hand-written query strings for every filter combination. Interviewers probing Supabase or PostgREST will ask how you handle optional filters; "I hold the builder and conditionally chain, then await once" is the answer that shows you understand the client.',
          steps: [
            'Start the builder with the always-true clauses: named columns, `{ count: \'exact\' }`, and `.eq(\'is_published\', true)`.',
            'Assign the builder to a `let query` variable — do not await yet.',
            'For each filter, write `if (filter is present) query = query.someMethod(...)`. Reassign, since the methods return a new builder reference.',
            'Attach sort and pagination last, after all filters.',
            'Await exactly once at the end, destructure `{ data, error, count }`, throw on `error`, and map snake_case columns to camelCase before returning.',
          ],
          code: `// src/services/artistService.js  (services/ is the ONLY layer that imports supabase)
import { supabase } from '../supabase/client';

const CARD_COLUMNS =
  'id, slug, display_name, avatar_url, cover_url, tagline, ' +
  'rating_avg, rating_count, years_experience, base_price, city_name';

export async function searchArtists(filters, { from, to, sort }) {
  // 1. Always-true clauses. count:'exact' gives us the total for the pager.
  let query = supabase
    .from('artists')
    .select(CARD_COLUMNS, { count: 'exact' })
    .eq('is_published', true);

  // 2. Optional clauses — attach ONLY when the visitor set the filter.
  if (filters.categories?.length) {
    // filter on an embedded resource needs !inner — see topic 2
    query = query
      .select(CARD_COLUMNS + ', artist_categories!inner(categories!inner(slug))', {
        count: 'exact',
      })
      .in('artist_categories.categories.slug', filters.categories);
  }
  if (filters.minRating) query = query.gte('rating_avg', filters.minRating);
  if (filters.minExperience) query = query.gte('years_experience', filters.minExperience);
  if (filters.budgetMin != null) query = query.gte('base_price', filters.budgetMin);
  if (filters.budgetMax != null) query = query.lte('base_price', filters.budgetMax);

  // 3. Sort + page window, attached last.
  query = query.order(sort.column, { ascending: sort.ascending, nullsFirst: false });
  query = query.range(from, to); // inclusive both ends

  // 4. Await exactly once.
  const { data, error, count } = await query;
  if (error) throw error; // services throw; they never return { data, error }
  return { rows: data.map(mapArtistRow), total: count ?? 0 };
}`,
          pitfalls: [
            '**Using `select(\'*\')` "to be safe".** Bandwidth, not storage, is the free-tier wall you hit first, and `*` drags every column across the wire for every card. Fix: name the columns a card renders — eight or nine — and nothing else.',
            '**Building a fixed query string per filter combination.** Two categories times three rating levels times two sorts is a dozen near-identical queries to maintain. Fix: hold one builder and conditionally chain; there is exactly one query in the codebase.',
            '**Attaching an empty filter as a match-everything clause.** `.eq(\'district_id\', filters.district)` when `district` is undefined sends `district_id=eq.undefined` and matches nothing. Fix: guard every optional clause with an `if` — a missing filter adds no clause at all.',
            '**Forgetting to reassign the builder.** Writing `query.eq(...)` without `query = query.eq(...)` silently discards the clause on some builder versions. Fix: always reassign; treat the builder as immutable.',
            '**Awaiting in the middle to "check the count", then awaiting again.** That fires two round trips and the second one is the real one. Fix: build fully, await once.',
          ],
          tryIt:
            'Write `searchArtists` so that passing an empty `filters` object returns the first page of all published artists, newest first. Confirm in the network tab that the request URL contains `is_published=eq.true` and your named column list, and does NOT contain `select=*`. Then add one filter and watch exactly one clause appear in the URL.',
          takeaway:
            'Hold the builder, attach a clause only when the filter is present, name your columns, and await once. A missing filter is silence, not a wildcard.',
        },
        {
          id: 'm9-t2',
          title: 'Joins in PostgREST: embedding, !inner, and disambiguating FKs',
          explain:
            'PostgREST lets you pull an artist and their related categories, availability, and languages in one request by nesting them inside the `select` string — and the `!inner` modifier is what turns a nested read into a real filterable join.',
          analogy:
            'A temple seva receipt does not just print your name — it prints your name with the seva you booked, the archaka assigned, and the date, all on one slip. You do not collect four separate slips from four counters. PostgREST embedding is that single receipt: one request, the artist plus everything hanging off them, assembled by the database before it reaches you.',
          theory:
            'PostgREST reads your foreign keys and lets you **embed** related tables directly inside `select`. `select(\'*, availability(label)\')` returns each artist with a nested `availability` object, because `artists.availability_id` points at `availability`. You can nest arbitrarily deep: `artist_categories(categories(name, slug))` walks the join table `artist_categories` out to `categories`, giving you an array of category objects per artist.\n\nBy default an embed is a **left join**: an artist with no categories still comes back, with an empty `artist_categories` array. That is what you want for *display* — you want to show the artist even if a related row is missing.\n\nBut a left join cannot **filter**. If you want only artists who work in "portrait-painting", a left join still returns everyone; the non-matching ones just have an empty array. To filter by an embedded resource you must make the embed an **inner join**, which drops artists with no matching related row. The syntax is the `!inner` modifier: `artist_categories!inner(categories!inner(...))`. Now `.eq(\'artist_categories.categories.slug\', \'portrait-painting\')` actually removes artists who lack that category. This is the single most-missed detail in PostgREST filtering, and it is quiz-worthy: **`!inner` is required to filter by an embedded category.**\n\nWhen two foreign keys point at the same table, PostgREST cannot guess which one you mean, and you must disambiguate by **naming the constraint or the column** in the embed: `origin:cities!artists_origin_city_id_fkey(name)` versus `studio:cities!artists_studio_city_id_fkey(name)`. The `alias:` prefix also renames the nested object so both can coexist in one response. You will hit this the moment an artist has both a home city and a studio city pointing at the same `cities` table.\n\nOne caution about inner joins and pagination: an `!inner` embed changes the row count, and combined with a many-to-many join table it can multiply rows. PostgREST deduplicates the top-level `artists` rows for you, but the `count: \'exact\'` can still surprise you when a filter spans a to-many relationship. Topic 7 returns to counting; for now, reach for `!inner` only when you are filtering, and keep plain embeds for display.',
          diagram: `graph TD
    A[artists] -->|left embed| AC["artist_categories( )"]
    AC -->|left embed| CAT["categories(name, slug)"]
    A -->|left embed| AV["availability(label)"]
    A -->|left embed| AL["artist_languages(languages(name))"]
    subgraph filter[To FILTER by category]
      A2[artists] -->|"!inner"| AC2["artist_categories!inner"]
      AC2 -->|"!inner"| CAT2["categories!inner"]
      CAT2 --> EQ[".eq('artist_categories.categories.slug','portrait-painting')"]
    end
    note[Left join = show all, empty array if none<br/>Inner join = drop rows with no match] -.-> filter`,
          flowExplain:
            'The top half is a display read — left joins, everyone comes back. The boxed half is a filtered read — the same embed with `!inner` at each level, so artists lacking the category are dropped, not returned with an empty array.',
          whyItMatters:
            'Embedding is what lets KalaKaara render a rich artist card — name, categories, availability, languages — from one request instead of five, which matters directly against the 5 GB bandwidth cap and against latency on 4G. Knowing when a left join silently fails to filter is exactly the kind of PostgREST subtlety that separates someone who copied a tutorial from someone who understands the API.',
          steps: [
            'Write a plain embed first: `select(\'*, artist_categories(categories(name, slug)), availability(label))\')` and confirm every artist returns, some with empty category arrays.',
            'Now try to filter by category with the plain embed and watch it return everyone — the left join does not filter.',
            'Add `!inner` at both embed levels and re-run; artists without the category now disappear.',
            'Apply the filter with the dotted path: `.eq(\'artist_categories.categories.slug\', slug)`.',
            'Where two FKs hit the same table, add `alias:table!constraint_name(...)` for each so both nested objects appear with distinct names.',
          ],
          code: `// DISPLAY read — left joins, show every artist even with missing relations.
const DETAIL_SELECT = \`
  *,
  artist_categories ( categories ( name, slug ) ),
  availability ( label ),
  artist_languages ( languages ( name, code ) ),
  origin:cities!artists_origin_city_id_fkey ( name ),
  studio:cities!artists_studio_city_id_fkey ( name )
\`;

export async function getArtistBySlug(slug) {
  const { data, error } = await supabase
    .from('artists')
    .select(DETAIL_SELECT)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();          // topic 9: maybeSingle, not single
  if (error) throw error;
  return data ? mapArtistDetail(data) : null;
}

// FILTER read — the SAME embed but with !inner so it actually filters.
export async function artistsInCategory(categorySlug, { from, to }) {
  const { data, error, count } = await supabase
    .from('artists')
    .select(
      'id, slug, display_name, avatar_url, rating_avg, ' +
        'artist_categories!inner ( categories!inner ( slug ) )',
      { count: 'exact' }
    )
    .eq('is_published', true)
    .eq('artist_categories.categories.slug', categorySlug) // drops non-matches
    .range(from, to);
  if (error) throw error;
  return { rows: data.map(mapArtistRow), total: count ?? 0 };
}`,
          pitfalls: [
            '**Filtering on a left-joined embed and wondering why every artist still shows.** A left join returns non-matching parents with an empty child array; the filter does nothing. Fix: add `!inner` at each embed level you filter through.',
            '**Two FKs to the same table returning a PostgREST error about ambiguity.** It cannot pick the relationship for you. Fix: disambiguate with `alias:table!constraint_name(...)` for each FK.',
            '**Nesting five levels deep because you can.** Every level is a join the database must plan, and deep embeds get slow and hard to index. Fix: embed what a screen renders; fetch the rest lazily or on the detail page.',
            '**Assuming an `!inner` many-to-many embed keeps your row count clean.** A join fan-out can inflate `count: \'exact\'`. Fix: verify the total against a `head: true` count query when a to-many filter is active, or filter via a subquery/RPC.',
            '**Selecting whole nested tables (`categories(*)`) inside a list.** You only need `slug` and `name` for a chip. Fix: name the nested columns too — the bandwidth rule applies inside embeds.',
          ],
          tryIt:
            'Give one seed artist a home city and a studio city that are both rows in `cities`. Write a select that returns both as `origin` and `studio`. If PostgREST complains about an ambiguous relationship, you forgot the `!constraint_name` — add it and confirm both nested names appear in the JSON.',
          takeaway:
            'Embed with parentheses for one-request reads; a plain embed is a left join that shows everyone; add `!inner` to actually filter by a related row; disambiguate same-table FKs with `alias:table!constraint`.',
        },
        {
          id: 'm9-t3',
          title: 'The nine filters and their SQL shapes',
          explain:
            'KalaKaara ships nine filters — category, location, budget, rating, experience, languages, availability, near-me radius, and free text — and each one has a distinct query shape.',
          analogy:
            'A santhe vegetable buyer narrows down out loud: "beans, under thirty rupees a kilo, from the Byndoor side, only the fresh baskets." Each phrase cuts the pile differently — one names a type, one sets a ceiling, one names a place, one asserts a quality. The nine filters are those phrases turned into SQL, and they stack the same way: every phrase makes the pile smaller.',
          theory:
            'Nine filters, and the important structural fact is how they combine. **Across filters the rule is AND** — narrowing category and budget and rating all at once means an artist must satisfy all three. **Within a multi-select filter the rule is OR** — picking three categories means "portrait OR mural OR calligraphy", expressed as a single `.in(...)`. Get this backwards and a two-category search returns nobody, because no artist is filed under both at once in the way an AND would demand.\n\nHere is each filter and its shape:\n\n**1. Category (multi-select, OR).** `.in(\'artist_categories.categories.slug\', [...])` through an `!inner` embed (topic 2). Multiple categories are one `.in()`, not several `.eq()`.\n\n**2. Location.** This is not a plain column match — it is the service-area problem from Module 8. You call the RPC built there, `match_artists_by_location(:city_id)`, which walks up the administrative hierarchy and returns the matching artist ids; you then constrain the browse query with `.in(\'id\', matchedIds)`. Location is the one filter that goes through an RPC, not a column.\n\n**3. Budget range.** Two clauses, `.gte(\'base_price\', min)` and `.lte(\'base_price\', max)`, attached independently so a one-sided range (only a max) still works.\n\n**4. Minimum rating.** `.gte(\'rating_avg\', min)`. Watch the NULL trap (topic 6): unrated artists have `rating_avg = null`, and `null >= 4` is not true, so they are correctly excluded from "4 stars and up".\n\n**5. Years of experience.** `.gte(\'years_experience\', min)`.\n\n**6. Languages (multi-select, OR).** `.in(\'artist_languages.languages.code\', [...])` through an `!inner` embed, same shape as category.\n\n**7. Availability.** `.eq(\'availability.label\', value)` or, if availability is a simple enum column, `.eq(\'availability_status\', value)`.\n\n**8. Near me (radius).** `navigator.geolocation` gives a lat/lng; you pass them to the Module 8 Haversine RPC `artists_within_km(:lat, :lng, :radius)`, and again constrain with `.in(\'id\', ...)`.\n\n**9. Free-text `q`.** Full-text search over name, tagline, and bio — topic 5 covers the mechanism. It is AND-combined with everything else.\n\nTwo of the nine (location, near-me) resolve through RPCs and come back as id lists; the rest are direct column or embedded-column clauses. Every one is AND-combined with the others.',
          diagram: `graph TD
    subgraph direct[Direct column / embedded-column clauses - AND-combined]
      C1[category .in via !inner - OR inside]
      C2[budget .gte + .lte]
      C3[rating .gte]
      C4[experience .gte]
      C5[languages .in via !inner - OR inside]
      C6[availability .eq]
      C7[q full-text search]
    end
    subgraph rpc[RPC filters - return id lists]
      L[location -> match_artists_by_location city_id]
      N[near me -> artists_within_km lat lng radius]
    end
    L --> IDS[matched ids]
    N --> IDS
    IDS --> INID[.in id matchedIds]
    direct --> Q[final browse query]
    INID --> Q
    Q --> RES[artists AND-satisfying every active filter]`,
          flowExplain:
            'Seven filters are direct clauses; two (location, near-me) run through Module 8 RPCs and fold back in as `.in(\'id\', ...)`. Everything AND-combines into one query — multi-select category and languages are the only places OR lives, inside their `.in()`.',
          whyItMatters:
            'This topic is where the AND/OR distinction becomes concrete, and getting it wrong is the classic "my search returns nothing" bug. It also shows the clean seam between column filters and RPC filters — the location work from Module 8 plugs into browse as just another `.in(\'id\', ...)`, which is exactly the kind of composition a reviewer looks for.',
          steps: [
            'List the nine filters and label each AND-across or OR-within. Only category and languages are OR-within.',
            'For each filter, write the exact Supabase method: `.in`, `.gte`, `.lte`, `.eq`, or an RPC + `.in(\'id\', ...)`.',
            'Wire the two location filters to their Module 8 RPCs; take the returned ids and pass them as a single `.in(\'id\', ids)`.',
            'Handle the empty-RPC case: if location matched zero artists, short-circuit to an empty result rather than sending `.in(\'id\', [])`.',
            'Confirm budget is two independent clauses so a max-only or min-only range still filters correctly.',
          ],
          code: `// Composing the nine filters. Location + near-me resolve to id lists first.
export async function browse(filters, page) {
  // Resolve RPC-based filters up front.
  let restrictIds = null; // null = no id restriction
  if (filters.cityId) {
    const { data, error } = await supabase.rpc('match_artists_by_location', {
      p_city_id: filters.cityId,
    });
    if (error) throw error;
    restrictIds = data.map((r) => r.artist_id);
  }
  if (filters.near) {
    const { data, error } = await supabase.rpc('artists_within_km', {
      p_lat: filters.near.lat, p_lng: filters.near.lng, p_km: filters.near.radiusKm,
    });
    if (error) throw error;
    const near = data.map((r) => r.artist_id);
    restrictIds = restrictIds ? restrictIds.filter((id) => near.includes(id)) : near;
  }
  // An RPC that matched nobody means an empty page — do not send .in('id', []).
  if (restrictIds && restrictIds.length === 0) return { rows: [], total: 0 };

  let q = supabase.from('artists')
    .select(CARD_COLUMNS + categoryEmbed(filters), { count: 'exact' })
    .eq('is_published', true);

  if (restrictIds) q = q.in('id', restrictIds);
  if (filters.categories?.length)
    q = q.in('artist_categories.categories.slug', filters.categories);   // OR inside
  if (filters.languages?.length)
    q = q.in('artist_languages.languages.code', filters.languages);      // OR inside
  if (filters.budgetMin != null) q = q.gte('base_price', filters.budgetMin);
  if (filters.budgetMax != null) q = q.lte('base_price', filters.budgetMax);
  if (filters.minRating)     q = q.gte('rating_avg', filters.minRating);
  if (filters.minExperience) q = q.gte('years_experience', filters.minExperience);
  if (filters.availability)  q = q.eq('availability_status', filters.availability);
  if (filters.q)             q = q.textSearch('search_vector', filters.q, {
    type: 'websearch', config: 'english',
  });

  q = applySort(q, page.sort).range(page.from, page.to);
  const { data, error, count } = await q;
  if (error) throw error;
  return { rows: data.map(mapArtistRow), total: count ?? 0 };
}`,
          pitfalls: [
            '**Multi-select category as several `.eq()` calls.** Chained `.eq()` AND together, so "portrait AND mural" matches nobody. Fix: one `.in(\'...slug\', [array])` — that is the OR.',
            '**Sending `.in(\'id\', [])` when an RPC matched nobody.** Depending on version this can error or match everything. Fix: detect the empty match and return an empty page directly.',
            '**Treating budget as a single equality.** Visitors give a range, and often only one end. Fix: two independent `.gte`/`.lte` clauses, each guarded, so a one-sided range works.',
            '**Doing location matching in JavaScript by fetching all artists first.** That defeats the whole server-side-filter NFR and blows the bandwidth cap. Fix: the Module 8 RPC returns ids; restrict with `.in(\'id\', ...)`.',
            '**Forgetting near-me needs the browser geolocation permission and can be denied.** Then `filters.near` is undefined and the filter must simply not apply. Fix: guard it; never block the whole page on a geolocation prompt.',
          ],
          tryIt:
            'Pick two categories and a minimum rating of 4. Predict the result set in words ("artists in portrait OR mural, AND rated 4+"), then run it. Now switch the two categories to two `.eq()` calls and watch the results collapse to zero — that is the AND/OR bug made visible.',
          takeaway:
            'Nine filters: seven are direct clauses, two resolve through Module 8 RPCs to id lists. All AND-combine; only multi-select category and languages are OR, expressed as `.in()`.',
        },
        {
          id: 'm9-t4',
          title: 'The URL is the state',
          explain:
            'Every filter, the sort, the search text, and the page number live in the URL query string — not in React state — so a filtered search is shareable, bookmarkable, refresh-proof, and the browser back button just works.',
          analogy:
            'A bus ticket from Kundapura prints the whole journey on it: route, stage, seat, date. Anyone holding that ticket can reconstruct exactly where you are going without asking you. A KalaKaara URL is that ticket — `?category=portrait,mural&rating=4&sort=rating&page=2` carries the entire search on its face, so whoever you send it to lands on the identical result set.',
          theory:
            'The tempting design is to keep filters in `useState`. It works until the moment someone refreshes, shares the link, or hits back — and then the state is gone and they are staring at an unfiltered page. The fix is to treat the **URL query string as the single source of truth** for browse state, using react-router v6 `useSearchParams()`.\n\n`useSearchParams()` returns `[searchParams, setSearchParams]`, deliberately shaped like `useState`. Reading is `searchParams.get(\'sort\')`; writing is `setSearchParams(next)`, which pushes a new history entry so back and forward work naturally. Your components never hold filter state; they read it from `searchParams` and write it back. The URL *is* the state.\n\nThis buys you five things for free: the search is **shareable** (paste the link, get the same results), **bookmarkable**, **survives refresh**, respects the **back button** (each filter change is a history entry), and is **testable** (drive the page by URL, assert on results). The acceptance test for this whole module is exactly this property: copy the filtered URL into a fresh incognito window, logged out, and get the identical result set.\n\nArrays need a serialisation convention. A multi-select category becomes a comma-joined value: `?category=portrait,mural`. Serialising is `array.join(\',\')`; parsing is `value.split(\',\').filter(Boolean)`. Pick comma over repeated keys (`?category=portrait&category=mural`) for readability, and be consistent.\n\nThe non-negotiable rule is **parse defensively**. A URL is untrusted input — a human edits it, a crawler mangles it, an old bookmark carries a filter you renamed. `?page=abc`, `?rating=999`, `?sort=drop_table` must never crash the page or reach the database as-is. Parse every param through a function that coerces, clamps, and falls back to a safe default. `parseInt(\'abc\')` is `NaN`; guard it. A rating of `999` clamps to the 0–5 range. An unknown sort key falls back to `newest`. A malformed URL should degrade to a sensible default view, never a white screen.',
          diagram: `graph TD
    U["URL ?category=portrait,mural&rating=4&sort=rating&page=2"] --> SP[useSearchParams]
    SP --> P[parseFilters - defensive]
    P --> V1{page a number?}
    V1 -- no --> D1[default 1]
    V1 -- yes --> C1[clamp >= 1]
    P --> V2{rating 0..5?}
    V2 -- no --> D2[drop the filter]
    V2 -- yes --> K2[keep]
    P --> V3{sort in allow-list?}
    V3 -- no --> D3[default newest]
    V3 -- yes --> K3[keep]
    D1 --> FIL[clean filter object]
    C1 --> FIL
    D2 --> FIL
    K2 --> FIL
    D3 --> FIL
    K3 --> FIL
    FIL --> Q[query builder - topic 1]
    UI[Change a filter] --> SET[setSearchParams] --> U`,
          flowExplain:
            'The URL flows in through `useSearchParams`, gets scrubbed by a defensive parser (bad page → 1, out-of-range rating → dropped, unknown sort → newest), and only a clean object reaches the query builder. Changing a filter writes back to the URL, closing the loop.',
          whyItMatters:
            'URL-as-state is what makes the acceptance test — identical results in a fresh incognito window — pass, and it is what makes the whole browse experience feel like a real product rather than a toy. In interviews, "why put filters in the URL?" has a crisp answer: shareable, bookmarkable, refresh-proof, back-button-correct, and server-testable. The defensive-parsing half is where robustness lives.',
          steps: [
            'Replace every `useState` that held a filter with a read from `useSearchParams()`.',
            'Write `parseFilters(searchParams)` that coerces and clamps every param and returns a clean object, never throwing.',
            'Write `serializeFilters(filters)` that joins arrays with commas and omits empty values so the URL stays clean.',
            'On any filter change, call `setSearchParams(serializeFilters(next))` — and reset `page` to 1, since a new filter invalidates the old page number.',
            'Test the defensive path: hand-edit the URL to `?page=abc&rating=999&sort=nonsense` and confirm the page renders a sane default view instead of crashing.',
          ],
          code: `// src/pages/BrowsePage.jsx  (or a small hook, useFiltersFromUrl)
import { useSearchParams } from 'react-router-dom';

const SORTS = ['newest', 'rating', 'experience', 'price_low', 'price_high', 'name', 'nearest'];

export function parseFilters(sp) {
  const num = (v, fallback) => {
    const n = Number.parseInt(v ?? '', 10);
    return Number.isFinite(n) ? n : fallback;
  };
  const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);
  const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);

  const ratingRaw = num(sp.get('rating'), 0);
  return {
    categories: list(sp.get('category')),
    languages: list(sp.get('lang')),
    minRating: ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : undefined, // 999 -> dropped
    minExperience: Math.max(num(sp.get('exp'), 0), 0) || undefined,
    budgetMin: sp.get('bmin') ? Math.max(num(sp.get('bmin'), 0), 0) : undefined,
    budgetMax: sp.get('bmax') ? Math.max(num(sp.get('bmax'), 0), 0) : undefined,
    availability: sp.get('avail') || undefined,
    q: (sp.get('q') || '').slice(0, 100), // cap length; never trust the URL
    sort: SORTS.includes(sp.get('sort')) ? sp.get('sort') : 'newest', // unknown -> newest
    page: clamp(num(sp.get('page'), 1), 1, 10000),                     // 'abc' -> 1
  };
}

export function serializeFilters(f) {
  const sp = new URLSearchParams();
  if (f.categories?.length) sp.set('category', f.categories.join(','));
  if (f.languages?.length) sp.set('lang', f.languages.join(','));
  if (f.minRating) sp.set('rating', String(f.minRating));
  if (f.q) sp.set('q', f.q);
  if (f.sort && f.sort !== 'newest') sp.set('sort', f.sort);
  if (f.page && f.page > 1) sp.set('page', String(f.page));  // page 1 is the clean default
  return sp;
}`,
          pitfalls: [
            '**Keeping filters in `useState`.** Refresh, share, or back button and the state evaporates. Fix: `useSearchParams()` is the store; components read and write the URL.',
            '**Trusting URL values.** `parseInt(\'abc\')` is `NaN`, `?rating=999` sails past a naive check, a renamed sort key reaches the DB. Fix: coerce, clamp to a range, and validate against an allow-list, always with a fallback.',
            '**Not resetting `page` when a filter changes.** The visitor is on page 5 of "portrait", switches to "mural", and lands on a page 5 that may not exist. Fix: any filter change sets `page` back to 1.',
            '**Serialising empty values into the URL.** `?category=&rating=&sort=newest` is ugly and breaks the "identical URL = identical results" test. Fix: omit defaults and empty arrays when serialising.',
            '**Using `push` for every keystroke of the search box.** That floods the history stack; one back press should undo a search, not thirty. Fix: debounce the text (topic 5) and consider `replace: true` for typing so history stays clean.',
          ],
          tryIt:
            'Filter to two categories, rating 4, sort by rating, page 2. Copy the URL, open a private window, paste it, and confirm you land on the identical results while logged out. Then break the URL by hand (`?page=abc&sort=xyz`) and confirm the page still renders a sensible default instead of a blank screen.',
          takeaway:
            'The URL query string is the source of truth for browse state — shareable, bookmarkable, refresh-proof, back-button-correct — and you parse it defensively so a mangled URL degrades to a default view, never a crash.',
        },
      ],
    },
    {
      id: 'm9-s2',
      title: 'Search, sort, and pagination',
      topics: [
        {
          id: 'm9-t5',
          title: 'Free-text search: ilike, trigram, and full-text',
          explain:
            'Searching artist names and bios for a word has three levels — `ilike`, trigram, and Postgres full-text search — and KalaKaara uses full-text, debounced at 300ms so it does not fire a query per keystroke.',
          analogy:
            'Finding a name in a printed voter roll three ways. `ilike` is scanning every line with your finger — fine for one page, unusable for the whole taluk. A trigram index is like tabs that group similar-looking names so misspellings still land nearby. Full-text search is the roll re-typed into a proper index of words, where "Rukmini" jumps to the right entries instantly and "paint" also finds "painting". KalaKaara uses the third.',
          theory:
            '**Level 1: `ilike`.** `.ilike(\'display_name\', \'%rukmini%\')` is case-insensitive substring match. It is trivial and correct, and it does not scale: a leading-`%` pattern **cannot use a normal btree index**, so Postgres scans every row. On a handful of artists it is fine; as a search primitive for the whole table it is a sequential scan on every keystroke.\n\n**Level 2: trigram (`pg_trgm` + GIN).** Enable the `pg_trgm` extension and build a GIN index on the column; now `ilike \'%rukmini%\'` and fuzzy similarity (`%` operator, `similarity()`) can use that index. This is the right tool for typo-tolerant matching on short fields like names — "rukmni" still finds "Rukmini". Its weakness is that it matches character sequences, not words or meaning.\n\n**Level 3: Postgres full-text search.** This is what KalaKaara uses. You convert text to a `tsvector` of normalised **lexemes** (so "painting", "paints", "painted" all reduce to "paint"), and queries to a `tsquery`. The professional pattern is a **generated `search_vector` column** that concatenates name, tagline, and bio with weights, plus a **GIN index** on it:\n\n`search_vector tsvector generated always as (setweight(to_tsvector(\'english\', coalesce(display_name,\'\')), \'A\') || setweight(to_tsvector(\'english\', coalesce(bio,\'\')), \'B\')) stored`\n\nFor the query side, use **`websearch_to_tsquery`**, not `plainto_tsquery` or raw `to_tsquery`. `websearch_to_tsquery` accepts human input the way a search box gets it — quoted phrases, `or`, leading `-` to exclude — and never throws on weird punctuation, which raw `to_tsquery` will. In `supabase-js` this is `.textSearch(\'search_vector\', input, { type: \'websearch\', config: \'english\' })`.\n\nWhy full-text over trigram as the primary? Because search here is word-oriented and multi-field — "wedding portrait mangaluru" should match on lexemes across name, tagline, and bio, with stemming and stop-word removal, ranked by relevance. Trigram is a great *secondary* for fuzzy name matching, and a real product often uses both; but the main box is full-text.\n\n**Debounce at 300ms.** Firing a query on every keystroke sends "r", "ru", "ruk", "rukm"... — five requests to render one search. A `useDebounce` hook holds the latest value and only lets it through after 300ms of quiet, so one deliberate search is one query. 300ms is the sweet spot: short enough to feel instant, long enough to skip the intermediate letters.',
          diagram: `graph LR
    K1["r  (t=0ms)"] --> T[useDebounce 300ms timer]
    K2["ru (t=90ms)"] --> T
    K3["ruk (t=180ms)"] --> T
    K4["rukm (t=260ms)"] --> T
    K5["rukmini (t=400ms)"] --> T
    T -->|"quiet for 300ms after last keystroke"| FIRE["ONE query at t=700ms<br/>textSearch websearch 'rukmini'"]
    FIRE --> DB[(GIN index on search_vector)]
    DB --> R[ranked results]
    note["Without debounce: 7 queries, 6 wasted"] -.-> T`,
          flowExplain:
            'Seven keystrokes reset the same 300ms timer; only the pause after the last one fires a single query against the GIN-indexed `search_vector`. Without the debounce every letter is its own request, six of them wasted.',
          whyItMatters:
            'Search is where a marketplace lives or dies, and where beginners quietly ship a full-table scan on every keystroke. Being able to say "ilike cannot use a btree index with a leading wildcard, so we use a generated tsvector column with a GIN index and websearch_to_tsquery, debounced at 300ms" is a complete, senior-sounding answer that covers indexing, input safety, and network hygiene in one breath.',
          steps: [
            'Enable `pg_trgm` if you want fuzzy name matching, then add a generated `search_vector tsvector` column concatenating name (weight A), tagline (B), and bio (B).',
            'Create a GIN index on `search_vector` — without it, full-text search also scans every row.',
            'On the client, call `.textSearch(\'search_vector\', input, { type: \'websearch\', config: \'english\' })` so user punctuation never throws.',
            'Write a `useDebounce(value, 300)` hook: a `useEffect` that sets a `setTimeout` and clears it on change, returning the settled value.',
            'Feed the debounced value into the URL and the query, so typing does not spam either history or the database.',
          ],
          code: `// src/hooks/useDebounce.js — settle a fast-changing value.
import { useEffect, useState } from 'react';
export function useDebounce(value, delay = 300) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(id); // each keystroke cancels the previous timer
  }, [value, delay]);
  return settled;
}

/* --- SQL: the generated column + GIN index (Module 3/9 migration) ---
alter table artists add column search_vector tsvector
  generated always as (
      setweight(to_tsvector('english', coalesce(display_name, '')), 'A')
   || setweight(to_tsvector('english', coalesce(tagline, '')),      'B')
   || setweight(to_tsvector('english', coalesce(bio, '')),          'C')
  ) stored;
create index artists_search_idx on artists using gin (search_vector);
---------------------------------------------------------------------- */

// In the browse hook: q is already debounced before it reaches here.
function applyTextSearch(query, q) {
  if (!q) return query;
  return query.textSearch('search_vector', q, { type: 'websearch', config: 'english' });
  // websearch_to_tsquery handles "quoted phrases", or, and -exclude, and never
  // throws on stray punctuation the way to_tsquery('rukmini & ') would.
}`,
          pitfalls: [
            '**Shipping `ilike \'%term%\'` as the search primitive.** A leading wildcard cannot use a btree index, so every search is a full-table scan. Fix: full-text search on a GIN-indexed `tsvector`, with trigram as an optional fuzzy secondary.',
            '**Using `to_tsquery` on raw user input.** It throws on unbalanced quotes or stray `&`, so a search box that includes punctuation crashes. Fix: `websearch_to_tsquery` (`type: \'websearch\'`) is built for user input and never throws.',
            '**Forgetting the GIN index.** Full-text search without the index still scans every row — you added complexity for no speed. Fix: `create index ... using gin(search_vector)` and verify with `explain`.',
            '**No debounce.** Every keystroke is a request; a fast typist fires ten queries to run one search. Fix: `useDebounce(value, 300)` so one deliberate search is one query.',
            '**Debouncing but keying the effect off the raw value.** Then the effect still re-runs per keystroke and only the *query* is delayed. Fix: feed the *debounced* value into the effect dependency and the URL.',
          ],
          tryIt:
            'Search "portrait" and confirm it also surfaces artists whose bio says "portraits" and "portraiture" — that is stemming. Then run `explain analyze` on the underlying query with and without the GIN index and note the plan flip from a sequential scan to a bitmap index scan.',
          takeaway:
            'ilike scans, trigram fuzzily matches characters, full-text matches stemmed words — KalaKaara uses a generated tsvector column with a GIN index and websearch_to_tsquery, debounced at 300ms so one search is one query.',
        },
        {
          id: 'm9-t6',
          title: 'Sorting, and the highest-rated NULL trap',
          explain:
            'Seven sort options — newest, highest rated, most experienced, lowest price, highest price, alphabetical, and nearest — each become an `.order()`, and one of them hides a NULL bug that puts unrated artists at the top.',
          analogy:
            'Ranking Yakshagana troupes by audience rating. The troupes that have never performed have no rating at all — an empty column, not a zero. If you sort "best first" and treat empty as the top, the newest troupe nobody has seen leads the list ahead of the seasoned favourites. That is exactly the NULLs-first trap, and the fix is to tell the sort to send the empty ratings to the bottom.',
          theory:
            'Each sort is one `.order(column, options)` call, and PostgREST maps it straight to SQL `ORDER BY`. The seven:\n\n- **newest** — `.order(\'created_at\', { ascending: false })`\n- **highest rated** — `.order(\'rating_avg\', { ascending: false, nullsFirst: false })`\n- **most experienced** — `.order(\'years_experience\', { ascending: false })`\n- **lowest price** — `.order(\'base_price\', { ascending: true })`\n- **highest price** — `.order(\'base_price\', { ascending: false })`\n- **alphabetical** — `.order(\'display_name\', { ascending: true })`\n- **nearest** — only available when a location is set; it orders by the distance the Module 8 RPC returns, so the RPC must return a `distance_km` column you can order on.\n\n**Nearest is conditional.** With no location there is no distance to sort by, so the option is disabled in the UI and rejected in the parser. Do not offer a sort you cannot compute.\n\nNow the trap. In SQL, `NULL` is not a value — it is the absence of one — and by default Postgres sorts NULLs **last** in ascending order and **first** in descending order. "Highest rated" is descending, so an artist with `rating_avg = null` (nobody has reviewed them yet) sorts to the **top**, ahead of your genuinely five-star artists. That is precisely backwards: the least-proven artists lead the "best" list.\n\nThe fix is `nullsFirst: false`, which forces NULLs to the bottom regardless of direction. In `supabase-js`: `.order(\'rating_avg\', { ascending: false, nullsFirst: false })`. This is a favourite interview and quiz question because it exposes whether you understand that NULL has ordering semantics of its own. A subtler alternative is to store `rating_avg` as `0` with a `default 0` for unrated artists, but that lies — it makes an unrated artist look like a bottom-rated one and pollutes a "4 stars and up" filter. Keeping the NULL honest and handling it at sort time with `nullsFirst: false` is the correct design.\n\nOne more detail: always add a stable tiebreaker. Sorting by `rating_avg` alone leaves rows with equal ratings in an undefined order that can shuffle between requests — which breaks pagination (topic 7). Add a secondary `.order(\'id\')` so the order is deterministic.',
          diagram: `graph TD
    S{Sort chosen} --> N[newest: created_at desc]
    S --> HR[highest rated: rating_avg desc]
    S --> XP[experience: years_experience desc]
    S --> PL[price low: base_price asc]
    S --> PH[price high: base_price desc]
    S --> AZ[alphabetical: display_name asc]
    S --> NR{location set?}
    NR -- no --> DIS[nearest DISABLED]
    NR -- yes --> DK[distance_km asc from RPC]
    HR --> TRAP{rating_avg NULL?}
    TRAP -- "default nullsFirst in desc" --> BAD[unrated float to TOP - wrong]
    TRAP -- "nullsFirst:false" --> GOOD[unrated sink to BOTTOM - right]
    HR --> TIE[+ .order id for a stable tiebreak]`,
          flowExplain:
            'Six sorts are unconditional; nearest is offered only when a location exists. The highest-rated branch is the dangerous one — in descending order NULL ratings default to the top, so `nullsFirst:false` is what pushes unrated artists to the bottom where they belong.',
          whyItMatters:
            'The NULLs trap is a real, shippable bug that makes your flagship "best artists" list rank the unproven above the proven, and it is a classic interview probe on SQL ordering semantics. The stable-tiebreaker point is the bridge to correct pagination — without it, page boundaries wobble.',
          steps: [
            'Map each of the seven sorts to an `.order(column, { ascending })` pair in a small `applySort` function keyed by the sort name.',
            'For every descending sort over a nullable column, add `nullsFirst: false`.',
            'Disable "nearest" in the UI and reject it in the parser unless a location is present.',
            'Add a secondary `.order(\'id\')` to every sort so equal-key rows have a deterministic order.',
            'Test highest-rated with a mix of rated and unrated seed artists and confirm the unrated ones land at the bottom.',
          ],
          code: `// src/services/artistSort.js
const SORTS = {
  newest:     (q) => q.order('created_at', { ascending: false }),
  rating:     (q) => q.order('rating_avg', { ascending: false, nullsFirst: false }),
  experience: (q) => q.order('years_experience', { ascending: false, nullsFirst: false }),
  price_low:  (q) => q.order('base_price', { ascending: true,  nullsFirst: false }),
  price_high: (q) => q.order('base_price', { ascending: false, nullsFirst: false }),
  name:       (q) => q.order('display_name', { ascending: true }),
  // 'nearest' is handled specially: it orders by distance_km from the RPC result
  // and is only reachable when a location filter is active.
};

export function applySort(query, sortKey, hasLocation) {
  if (sortKey === 'nearest' && hasLocation) {
    return query.order('distance_km', { ascending: true }).order('id');
  }
  const apply = SORTS[sortKey] ?? SORTS.newest; // unknown sort -> newest
  // Always add a stable tiebreaker so equal-key rows never reshuffle
  // between pages — pagination in topic 7 depends on it.
  return apply(query).order('id', { ascending: true });
}`,
          pitfalls: [
            '**Highest-rated putting unrated artists first.** Descending order sends NULLs to the top by default, so the least-proven artists lead your "best" list. Fix: `nullsFirst: false` on every descending sort over a nullable column.',
            '**Defaulting `rating_avg` to 0 to dodge NULLs.** Now an unrated artist looks bottom-rated and pollutes a "4+" filter. Fix: keep NULL honest and handle it at sort time.',
            '**Offering "nearest" with no location set.** There is nothing to sort by, so the query errors or silently ignores it. Fix: gate the option on a present location, in both UI and parser.',
            '**No secondary sort key.** Rows with equal ratings come back in an undefined, shifting order, which makes page 2 drop or repeat rows. Fix: always append `.order(\'id\')`.',
            '**Sorting in JavaScript after fetching a page.** You can only reorder the rows you already fetched, so "highest rated" only sorts the current page. Fix: sort in the database with `.order()`, before pagination.',
          ],
          tryIt:
            'Seed three artists with ratings 4.8, 4.2, and NULL. Sort highest-rated with the default options and note the NULL artist on top. Add `nullsFirst: false` and confirm the order becomes 4.8, 4.2, then the unrated one. That flip is the whole lesson.',
          takeaway:
            'Seven sorts, each an `.order()`; nearest needs a location; and highest-rated needs `nullsFirst: false` plus a stable `.order(\'id\')` tiebreaker or unrated artists float to the top and pages wobble.',
        },
        {
          id: 'm9-t7',
          title: 'Pagination: range, count, offset vs keyset',
          explain:
            'Pagination uses `.range(from, to)` for the page window and `{ count: \'exact\' }` for the total — and you should understand why offset pagination is simple-but-flawed and when keyset pagination is the fix.',
          analogy:
            'A long queue at the Kollur temple darshan. Offset pagination is telling someone "start counting from person 1, skip 40, show me the next 20" — every time, the counter re-walks all 40 people it is going to skip. Keyset is instead saying "show me the 20 people standing after the man in the red shirt" — you jump straight to the marker and never recount. On a short queue nobody notices; on a festival-day queue the recount is the whole delay.',
          theory:
            '`.range(from, to)` selects an **inclusive** window of rows: page 1 of 20 is `.range(0, 19)`, page 2 is `.range(20, 39)`. The formula is `from = (page - 1) * pageSize` and `to = from + pageSize - 1`. Pair it with `{ count: \'exact\' }` in `select`, which returns the total matching count so you can render "showing 21–40 of 137" and compute the last page.\n\n**The cost of `count: \'exact\'`.** To return an exact total, Postgres must actually count every matching row, which on a large filtered table is a full scan even though you only display twenty. On a free-tier database with tens of thousands of rows this gets slow. PostgREST offers cheaper alternatives: `count: \'planned\'` uses the query planner\'s estimate (nearly free, approximate), and `count: \'estimated\'` uses the exact count for small results but falls back to the planner\'s estimate above a threshold — a good default for large tables where "about 4,000 results" is fine and "exactly 4,137" is not worth a full scan. KalaKaara uses `exact` because the dataset is small; the moment it grows, switch to `estimated`.\n\n**Offset vs keyset.** `.range()` is **offset pagination**: page 50 means "skip 980 rows, return 20". The database has to walk and discard those 980 skipped rows every time, so deep pages get linearly slower — offset pagination re-scans everything it skips. **Keyset (cursor) pagination** instead remembers the last row seen and asks for rows *after* it: `where (created_at, id) < (:last_created_at, :last_id) order by created_at desc, id desc limit 20`. There is no skipping; an index on `(created_at, id)` jumps straight to the cursor, so page 5,000 is as fast as page 2. The tradeoff is that keyset only does next/previous, not "jump to page 50", and needs a stable, unique sort key.\n\n**KalaKaara uses offset**, because a browse UI wants numbered pages and the dataset is small enough that skipping a few hundred rows is cheap. Switch to keyset when the table is large, when you paginate deep, or for infinite-scroll feeds where "next" is the only motion (Module 13 revisits this for the feed).\n\n**The offset duplicate/skip problem.** Because offset counts positions, inserting or deleting a row between page loads shifts everything. A new artist published while you read page 1 pushes the twentieth artist down to position 21 — so page 2 shows them again, a **duplicate**. A deletion does the reverse and **skips** a row. Keyset is immune because it anchors to a row, not a position. For KalaKaara this is a rare, low-stakes glitch, but you must be able to name it, because it is the reason keyset exists.',
          diagram: `graph TD
    subgraph offset[OFFSET - .range - KalaKaara uses this]
      O1["page 3, size 20"] --> O2["from=40 to=59"]
      O2 --> O3["DB walks + discards rows 1..40"]
      O3 --> O4["returns 41..60"]
      O4 --> O5["deep page = slow<br/>insert between loads = duplicate row"]
    end
    subgraph keyset[KEYSET / cursor - switch when large]
      K1["last seen: created_at + id"] --> K2["where (created_at,id) < (:c,:id)"]
      K2 --> K3["index jumps straight to cursor"]
      K3 --> K4["returns next 20 - no skipping"]
      K4 --> K5["page 5000 as fast as page 2<br/>but no 'jump to page N'"]
    end`,
          flowExplain:
            'Offset re-walks and discards every row before the window, so deep pages slow down and a row inserted between loads reappears on the next page. Keyset anchors to the last row via an indexed cursor, so there is no skipping and no duplicate — at the cost of losing "jump to page N".',
          whyItMatters:
            'Pagination is a guaranteed system-design question, and "offset vs keyset, and why count:exact gets slow" is exactly the depth interviewers want. Shipping `count: \'exact\'` on a table that will grow is a real performance landmine, and knowing the offset duplicate bug shows you have thought past the happy path.',
          steps: [
            'Compute the window: `from = (page - 1) * PAGE_SIZE`, `to = from + PAGE_SIZE - 1`, and pass both to `.range(from, to)`.',
            'Add `{ count: \'exact\' }` to `select` and read `count` for the total; compute `lastPage = Math.ceil(count / PAGE_SIZE)`.',
            'Guard the upper page: if `from >= count`, render an empty page rather than an out-of-range request.',
            'Pair pagination with a stable sort (topic 6) — without a deterministic order, page boundaries are meaningless.',
            'Document in a comment that this is offset pagination and note the switch-to-keyset trigger: large table or deep pages.',
          ],
          code: `// src/services/pagination.js
export const PAGE_SIZE = 20;

export function pageWindow(page) {
  const from = (page - 1) * PAGE_SIZE;
  return { from, to: from + PAGE_SIZE - 1 }; // .range() is inclusive on both ends
}

// Offset page fetch. count:'exact' gives the total for the numbered pager.
export async function fetchPage(buildQuery, page) {
  const { from, to } = pageWindow(page);
  const { data, error, count } = await buildQuery()
    .range(from, to);           // skip (page-1)*20, return 20
  if (error) throw error;
  const total = count ?? 0;
  return {
    rows: data,
    total,
    page,
    lastPage: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/* When the table grows, switch to KEYSET for next/prev feeds:
   supabase.from('artists')
     .select(CARD_COLUMNS)
     .or(\`created_at.lt.\${lastCreatedAt},and(created_at.eq.\${lastCreatedAt},id.lt.\${lastId})\`)
     .order('created_at', { ascending: false }).order('id', { ascending: false })
     .limit(PAGE_SIZE);
   No offset to re-scan; the (created_at, id) index jumps to the cursor.        */`,
          pitfalls: [
            '**Off-by-one in `.range()`.** `.range()` is inclusive, so page 1 of 20 is `(0, 19)` not `(0, 20)` — the latter returns 21 rows and overlaps the next page. Fix: `to = from + pageSize - 1`.',
            '**Shipping `count: \'exact\'` on a table that will grow.** Exact counts force a scan of every matching row on every page load. Fix: use `count: \'estimated\'` once the dataset is large; reserve `exact` for small tables.',
            '**Requesting a page past the end.** `?page=9999` sends `.range(199980, 199999)` and returns an empty array with no explanation. Fix: clamp against `count` and render the empty state.',
            '**Paginating without a stable sort.** With an undefined tiebreak, the same offset returns different rows across requests, so pages drop and repeat. Fix: always end the sort with `.order(\'id\')`.',
            '**Assuming offset pages are consistent under writes.** A publish between page 1 and page 2 makes a row appear on both (duplicate); a delete skips one. Fix: accept it for a numbered UI, or move to keyset for feeds where consistency matters.',
          ],
          tryIt:
            'Set PAGE_SIZE to 5, load page 1, then insert a new published artist from the dashboard, then load page 2. Watch a row you already saw reappear — the offset duplicate bug, live. Then reason out why a keyset cursor on `(created_at, id)` would not have shown it twice.',
          takeaway:
            '`.range(from, to)` is inclusive offset pagination with `count: \'exact\'` for the total; offset re-scans skipped rows and can duplicate rows across pages, so switch to keyset (indexed cursor) when the table grows or pages get deep.',
        },
        {
          id: 'm9-t8',
          title: 'useArtists(filters): tying it all together',
          explain:
            'One hook, `useArtists(filters)`, owns the whole browse fetch: it debounces the search text, memoises the filter object, guards against out-of-order responses, and returns the `{ data, loading, error }` contract plus a `total` for the pager.',
          analogy:
            'A single order-taker at a busy Kundapura mess who ties the whole table together: they wait until you have finished speaking before firing the order to the kitchen (debounce), they ignore an order you cancelled and walked out on (the cancelled guard), and they always tell you one of three things — food is coming, here is your food, or the kitchen is out (loading, data, error). Every list screen talks to this one person.',
          theory:
            'The browse page should not know how to build queries, debounce, or race-guard. It calls `useArtists(filters)` and renders. Everything else lives in the hook.\n\n**Debounce the text inside the hook.** The `filters.q` coming in changes on every keystroke; you debounce it (topic 5) so the effect that fetches does not re-run per letter.\n\n**Memoise the filter object.** This is the subtle one. `useEffect(fetch, [filters])` where `filters` is a fresh object literal built on every render will loop forever — a new object is a new reference every render, so the effect re-runs, which sets state, which re-renders, which builds a new object. The fix is to depend on a **stable key**: either `useMemo` the filter object from its primitive parts, or serialise the filters to a string (`JSON.stringify` or the very URL query string from topic 4) and depend on that string. A string compares by value, so the effect only re-runs when the filters genuinely change.\n\n**Guard against out-of-order responses.** Fetches are async and can return in any order. A visitor types a filter, then quickly changes it; request A (slow) and request B (fast) are both in flight, and if A resolves after B, stale results overwrite fresh ones. The standard cleanup guard: declare `let cancelled = false` inside the effect, check `if (!cancelled)` before every `setState`, and return `() => { cancelled = true }` from the effect so a superseded fetch cannot write. (An `AbortController` does the same at the network level; the boolean is enough here.)\n\n**Return the contract.** Every hook in this course returns exactly `{ data, loading, error }` — no exceptions — and this one adds `total` for the pager. Loading starts `true`, flips `false` in a `finally`; errors are caught and surfaced as the `error` field, never thrown out of the hook (the service threw; the hook catches and reports). The page then renders the four states in order: loading, empty, error, data.',
          diagram: `graph TD
    F[filters prop changes<br/>every render = new object] --> DEB[debounce q 300ms]
    DEB --> KEY[useMemo / serialise -> stable string key]
    KEY --> EFF[useEffect keyed on the string]
    EFF --> C0["cancelled = false"]
    C0 --> LOAD[setLoading true]
    LOAD --> CALL[await searchArtists]
    CALL --> CHK{cancelled?}
    CHK -- yes: superseded --> DROP[discard result]
    CHK -- no --> SET[setData + setTotal]
    CALL -- throws --> ERR{cancelled?}
    ERR -- no --> SETE[setError]
    EFF -.cleanup.-> CANCEL["cancelled = true"]
    SET --> OUT["{ data, loading, error, total }"]`,
          flowExplain:
            'The fresh-object filters are collapsed to a stable string key so the effect runs only on real change, and the `cancelled` flag set by the cleanup function ensures a superseded, late-returning fetch can never overwrite the current results.',
          whyItMatters:
            'The memoised-key and cancelled-guard patterns are the two bugs that make homemade data-fetching hooks flake: the infinite render loop and the stale-overwrite race. Being able to explain both, and the uniform `{ data, loading, error }` contract, is what makes a custom hook production-grade rather than a demo.',
          steps: [
            'Debounce `filters.q` at the top of the hook so search typing does not re-fire the effect.',
            'Build a stable dependency key: `useMemo` the filter object from primitives, or `JSON.stringify` the debounced filters.',
            'In the effect, set `let cancelled = false`, set loading true, await the service, and guard every `setState` with `if (!cancelled)`.',
            'Return `() => { cancelled = true }` as the cleanup so a superseded fetch is dropped.',
            'Return `{ data, loading, error, total }`; start `loading` true and clear it in a `finally`.',
          ],
          code: `// src/hooks/useArtists.js
import { useEffect, useMemo, useState } from 'react';
import { searchArtists } from '../services/artistService';
import { useDebounce } from './useDebounce';
import { pageWindow } from '../services/pagination';
import { applySortMeta } from '../services/artistSort';

export function useArtists(filters) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedQ = useDebounce(filters.q, 300);

  // Stable key: a fresh object every render would loop the effect forever.
  const key = useMemo(
    () => JSON.stringify({ ...filters, q: debouncedQ }),
    [filters, debouncedQ]
  );

  useEffect(() => {
    let cancelled = false;          // out-of-order guard
    const active = JSON.parse(key);
    setLoading(true);
    setError(null);
    searchArtists(active, {
      ...pageWindow(active.page),
      sort: applySortMeta(active.sort),
    })
      .then(({ rows, total }) => {
        if (cancelled) return;      // a newer fetch superseded this one
        setData(rows);
        setTotal(total);
      })
      .catch((e) => {
        if (!cancelled) setError(e);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;            // cleanup: drop this fetch's result
    };
  }, [key]);

  return { data, loading, error, total };
}`,
          pitfalls: [
            '**Depending on the raw filters object in `useEffect`.** A new object literal every render is a new reference, so the effect loops infinitely. Fix: depend on a memoised value or a serialised string key.',
            '**No cancelled guard.** A slow request that resolves after a newer one overwrites fresh results with stale ones. Fix: `let cancelled = false` and check it before every `setState`, with cleanup setting it true.',
            '**Debouncing in the component instead of the hook.** Then every consumer must remember to debounce, and some will not. Fix: own the debounce inside `useArtists` so callers just pass `filters`.',
            '**Leaving `loading` true on error.** The page shows a spinner forever after a failed fetch. Fix: clear loading in a `finally`, and set `error` in `catch`.',
            '**Breaking the `{ data, loading, error }` contract.** Returning `{ artists, isLoading }` here and something else in the next hook makes every consumer bespoke. Fix: keep the exact contract everywhere; add `total` alongside, do not rename the core three.',
          ],
          tryIt:
            'Temporarily remove the `useMemo` and pass the raw `filters` object as the effect dependency. Open the network tab and watch the request fire in an endless loop. Restore the memoised key and confirm it fires exactly once per real filter change.',
          takeaway:
            '`useArtists` debounces `q`, depends on a serialised/memoised key so the effect does not loop, guards late responses with a `cancelled` flag, and returns `{ data, loading, error }` plus `total` for the pager.',
        },
      ],
    },
    {
      id: 'm9-s3',
      title: 'Artist detail and the artwork gallery',
      topics: [
        {
          id: 'm9-t9',
          title: 'The artist detail page and its one joined query',
          explain:
            '`/artists/:slug` fetches the artist and everything hanging off them — artworks, categories, languages, service areas, reviews — in one joined query, and uses `.maybeSingle()` so a missing slug renders a real 404 instead of throwing.',
          analogy:
            'When you ask the temple office for the full record of one archaka, they hand you a single folder that already contains the roster, the sevas performed, the languages spoken, and the areas served — assembled before it reaches your hands. You do not make five trips to five counters. The artist detail query is that pre-assembled folder: one request, the whole profile.',
          theory:
            'The detail page needs a lot of related data, but that is not five requests — it is one embedded select (topic 2). You fetch the artist by slug and embed `artworks(...)`, `artist_categories(categories(...))`, `artist_languages(languages(...))`, `artist_service_areas(...)`, and `reviews(...)`. PostgREST assembles the whole nested object server-side, which is one round trip and one place for RLS to apply its rules.\n\nThe critical choice is **`.single()` versus `.maybeSingle()`**. Both say "I expect one row". The difference is what happens when there are zero rows. `.single()` **throws an error** (PostgREST returns a 406, `supabase-js` surfaces it as an error) when the count is not exactly one. `.maybeSingle()` returns `data: null` with no error when there are zero rows, and only errors on two-or-more. For a detail page keyed on a slug that a user can type or an old link can carry, zero rows is a **normal, expected** outcome — the slug does not exist, or the artist is unpublished (topic 12) and RLS returned nothing. That is a 404, not a crash. So you use `.maybeSingle()`, check for `null`, and render a real `<NotFound />` component.\n\nWhy a real `<NotFound />` and not a blank page or a silent redirect? Three reasons. A blank page looks broken and gives the visitor nothing to do. A silent redirect to home loses the context of what they were looking for. A proper 404 page says "this artist does not exist" and offers a way back to browse — and, for SEO, it should carry a `noindex` signal so search engines do not keep the dead URL. The detail route therefore has three render outcomes, not two: loading, not-found, and loaded.\n\nOne performance note: embedding `reviews(*)` on a popular artist could pull hundreds of rows into the detail request. For the initial load, embed just the most recent few (`reviews(... )` with a `.limit()` on the embed, or a separate paginated reviews fetch), and load the rest on demand. The joined query is for the profile skeleton, not for an unbounded list.',
          diagram: `graph TD
    URL["/artists/:slug"] --> Q["one select, embedded"]
    Q --> A[artists eq slug eq is_published]
    A --> E1[artworks - recent, limited]
    A --> E2[artist_categories -> categories]
    A --> E3[artist_languages -> languages]
    A --> E4[artist_service_areas]
    A --> E5[reviews - recent, limited]
    Q --> M{maybeSingle}
    M -- "0 rows (bad slug OR unpublished via RLS)" --> NF["render NotFound - real 404, noindex"]
    M -- "1 row" --> OK[render profile]
    M -- "2+ rows" --> ERR[error - slug should be unique]
    note["single would THROW on 0 rows -> crash instead of 404"] -.-> M`,
          flowExplain:
            'One embedded select fans out to five related resources server-side, then `maybeSingle()` splits the outcome three ways — zero rows (bad slug or an unpublished artist hidden by RLS) becomes a real 404, one row renders, two-plus is a genuine error because slugs are unique.',
          whyItMatters:
            'The `single` vs `maybeSingle` distinction is a direct quiz and interview question because it is the difference between a detail page that 404s gracefully and one that throws a runtime error on every bad link. Fetching the whole profile in one joined query, bounded sensibly, is the practical PostgREST skill this page is built on.',
          steps: [
            'Write one select on `artists` embedding artworks, categories, languages, service areas, and recent reviews.',
            'Constrain by `.eq(\'slug\', slug).eq(\'is_published\', true)` so an unpublished artist yields zero rows.',
            'End with `.maybeSingle()`, not `.single()`, so zero rows returns `null` instead of throwing.',
            'In the page, branch three ways: loading, `data === null` → `<NotFound />`, else render the profile.',
            'Bound the embedded lists — limit artworks and reviews on the initial load, paginate the rest.',
          ],
          code: `// src/services/artistService.js
const PROFILE_SELECT = \`
  id, slug, display_name, avatar_url, cover_url, tagline, bio,
  rating_avg, rating_count, years_experience, base_price,
  artworks ( id, title, image_url, width, height, price, is_negotiable ),
  artist_categories ( categories ( name, slug ) ),
  artist_languages ( languages ( name, code ) ),
  artist_service_areas ( area_type, label ),
  reviews ( id, rating, body, created_at, reviewer_name )
\`;

export async function getArtistProfile(slug) {
  const { data, error } = await supabase
    .from('artists')
    .select(PROFILE_SELECT)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();            // 0 rows -> null (a 404), never a throw
  if (error) throw error;      // a real DB error still throws
  return data ? mapArtistProfile(data) : null; // null signals not-found to the page
}

// src/pages/ArtistDetailPage.jsx
export default function ArtistDetailPage() {
  const { slug } = useParams();
  const { data, loading, error } = useArtist(slug); // { data, loading, error }
  if (loading) return <ProfileSkeleton />;
  if (error) return <ErrorState onRetry={/* refetch */} />;
  if (!data) return <NotFound message="This artist does not exist or is not published." />;
  return <ArtistProfile artist={data} />;
}`,
          pitfalls: [
            '**Using `.single()` on a slug lookup.** Any bad or unpublished slug throws instead of returning nothing, so every dead link is a runtime error. Fix: `.maybeSingle()` and treat `null` as 404.',
            '**Rendering a blank page for not-found.** The visitor sees nothing and assumes the app is broken. Fix: a real `<NotFound />` with a message and a link back to browse, plus a `noindex` signal.',
            '**Embedding unbounded `reviews(*)` and `artworks(*)`.** A popular artist drags hundreds of rows into every profile load. Fix: limit the embeds on first load and paginate the rest.',
            '**Silently redirecting a missing artist to the home page.** It loses the visitor context and hides broken links from you. Fix: 404 in place so both the user and your logs see the dead URL.',
            '**Forgetting `is_published` on the detail query.** An unpublished artist becomes reachable by direct URL. Fix: `.eq(\'is_published\', true)` (and RLS as the real backstop — topic 12).',
          ],
          tryIt:
            'Visit `/artists/this-slug-does-not-exist`. With `.single()` you get a thrown error in the console and a broken page; switch to `.maybeSingle()` and confirm you get a clean `<NotFound />`. That one method call is the entire difference.',
          takeaway:
            'One embedded select fetches the whole artist profile; `.maybeSingle()` turns a missing slug into `null` you render as a real `<NotFound />`, where `.single()` would throw.',
        },
        {
          id: 'm9-t10',
          title: 'The portfolio gallery and an accessible lightbox',
          explain:
            'The portfolio is a responsive masonry-style grid of lazy-loaded, dimension-stable images, with a lightbox that is fully keyboard-accessible — Escape closes, arrows navigate, and focus is trapped while open and restored on close.',
          analogy:
            'A well-run gallery at an Udupi art exhibition hangs the paintings so nothing jumps as you walk in, lets you step up to any one for a closer look, and — crucially — lets a blind visitor navigate with a guide who says "next", "previous", "back to the hall". A keyboard user is that visitor: Tab, arrows, and Escape are their guide, and the lightbox has to respect them or it locks them out.',
          theory:
            '**The grid.** Artwork images have wildly different aspect ratios — a tall portrait next to a wide mural. A masonry-ish layout packs them without cropping. CSS `columns` (`column-count` responsive via media queries) is the zero-JavaScript way to get a masonry column flow; CSS grid with `grid-auto-rows` and row spans is the more controllable alternative. Either is fine; avoid a JavaScript masonry library for this.\n\n**Lazy loading and layout stability.** Every `<img>` gets `loading="lazy"` so off-screen artworks are not fetched until the visitor scrolls near them, and `decoding="async"` so decoding does not block the main thread. Critically, every image needs **explicit `width` and `height` attributes** (or an aspect-ratio box) so the browser reserves the right space *before* the image loads. Without them, images pop in and shove content around — cumulative layout shift (CLS), which is both jarring and an SEO penalty. This is why you stored `width` and `height` on the `artworks` row in Module 7: so the grid can reserve space from the first paint.\n\n**The lightbox — accessibility is the hard part.** A lightbox is a modal, and a modal that ignores the keyboard is broken for a real slice of users. Four requirements:\n\n1. **Escape closes.** A `keydown` listener maps `Escape` to close. Non-negotiable; it is the universal "get me out".\n2. **Arrows navigate.** `ArrowRight`/`ArrowLeft` move to the next/previous artwork without leaving the lightbox.\n3. **Focus is trapped.** While the lightbox is open, Tab must cycle *within* it — the close button, the nav buttons — and never escape to the page behind. You capture Tab at the boundaries and wrap focus.\n4. **Focus is restored.** When the lightbox opens, remember the element that was focused (the thumbnail that was clicked); when it closes, return focus there. Otherwise a keyboard user is dumped at the top of the page with no idea where they were.\n\nAdd the ARIA: `role="dialog"`, `aria-modal="true"`, and an `aria-label` naming the artwork. Move focus into the lightbox on open. These are not extras — they are the difference between a component that works for everyone and one that works only for mouse users.',
          diagram: `graph TD
    G[Masonry grid<br/>CSS columns, lazy imgs, fixed dims] --> CLK[click / Enter on a thumb]
    CLK --> SAVE[remember focused thumb]
    SAVE --> OPEN[open lightbox]
    OPEN --> FOCUS[move focus into dialog<br/>role=dialog aria-modal]
    FOCUS --> KEYS{keydown}
    KEYS -- Escape --> CLOSE[close]
    KEYS -- ArrowRight --> NEXT[next artwork]
    KEYS -- ArrowLeft --> PREV[previous artwork]
    KEYS -- Tab --> TRAP[wrap focus inside dialog]
    CLOSE --> RESTORE[restore focus to saved thumb]
    note["No dims on img -> layout shift (CLS)<br/>No focus restore -> keyboard user lost"] -.-> G`,
          flowExplain:
            'Clicking a thumbnail saves the currently focused element before opening, then focus moves into the dialog and the keydown handler owns Escape, arrows, and Tab-wrapping; closing restores focus to the exact thumbnail, so a keyboard user never loses their place.',
          whyItMatters:
            'An inaccessible lightbox is the single most common way a portfolio site locks out keyboard and screen-reader users, and it is exactly what an accessibility audit (Module 15) flags first. Fixed image dimensions to prevent layout shift is a Core Web Vitals metric Google actually ranks on, so this topic is both an a11y and an SEO win.',
          steps: [
            'Build the grid with CSS `columns` (responsive `column-count`) or CSS grid; do not reach for a JS masonry library.',
            'Give every `<img>` `loading="lazy"`, `decoding="async"`, and explicit `width`/`height` from the stored artwork dimensions.',
            'On open, save `document.activeElement`; move focus into the dialog; set `role="dialog"` and `aria-modal="true"`.',
            'Add a `keydown` handler: Escape closes, arrows navigate, Tab wraps focus at the first and last focusable elements.',
            'On close, restore focus to the saved element and remove the listener.',
          ],
          code: `// src/components/Lightbox.jsx — keyboard-accessible modal.
import { useEffect, useRef } from 'react';

export function Lightbox({ artworks, index, onClose, onNext, onPrev }) {
  const dialogRef = useRef(null);
  const restoreRef = useRef(null);

  useEffect(() => {
    restoreRef.current = document.activeElement;       // remember where we were
    dialogRef.current?.focus();                        // move focus into the dialog

    function onKey(e) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'Tab') {                      // trap focus inside the dialog
        const f = dialogRef.current.querySelectorAll('button, [href], [tabindex="0"]');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      restoreRef.current?.focus();                     // restore focus on close
    };
  }, [onClose, onNext, onPrev]);

  const art = artworks[index];
  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true"
           aria-label={art.title} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close">×</button>
        <img src={art.imageUrl} alt={art.title}
             width={art.width} height={art.height} decoding="async" />
        <button onClick={onPrev} aria-label="Previous artwork">‹</button>
        <button onClick={onNext} aria-label="Next artwork">›</button>
      </div>
    </div>
  );
}`,
          pitfalls: [
            '**Images with no width/height.** They pop in on load and shove the grid around — layout shift that hurts UX and Core Web Vitals. Fix: set explicit dimensions from the stored artwork size, or an aspect-ratio box.',
            '**A lightbox that ignores Escape.** Keyboard and screen-reader users get stuck in a modal with no way out. Fix: a `keydown` listener mapping Escape to close, always.',
            '**No focus trap.** Tab drifts to the page behind the modal, so a keyboard user is interacting with content they cannot see. Fix: wrap focus at the first/last focusable element.',
            '**Not restoring focus on close.** The visitor is dumped at the top of the document, disoriented. Fix: save `document.activeElement` on open and refocus it on close.',
            '**`loading="lazy"` on the first, above-the-fold hero image.** Lazy-loading what is already visible delays the most important paint. Fix: eager-load the first image, lazy-load the rest.',
          ],
          tryIt:
            'Open the lightbox with the mouse, then put the mouse away entirely. Using only Tab, arrows, and Escape, navigate three artworks and close it — and confirm focus returns to the exact thumbnail you started from. If focus lands anywhere else, your restore is broken.',
          takeaway:
            'A masonry grid of lazy, dimension-stable images feeds a lightbox that closes on Escape, navigates with arrows, traps focus while open, and restores focus on close — accessible to keyboard users, not just mouse users.',
        },
        {
          id: 'm9-t11',
          title: 'The artwork detail page and related items',
          explain:
            '`/artworks/:id` shows one artwork in full — large image, formatted price, negotiable badge, medium, dimensions, tags, created date, and a link back to the artist — plus "more from this artist" and "similar in this category".',
          analogy:
            'At a Yakshagana costume stall, picking up one headdress, you naturally want to know two things: what else this maker has, and what other headdresses in this style exist. The artwork detail page answers exactly those two — "more from this artist" and "similar in this category" — because a buyer who likes one piece is one tap away from the piece they will actually commission.',
          theory:
            'The primary fetch is one artwork by id, embedding its artist (for the back-link) and its category and tags. Use `.maybeSingle()` again — a bad artwork id is a 404, same reasoning as topic 9.\n\n**Formatting matters.** Price is stored as an integer (paise or rupees — pick one and be consistent), and you render it through a `formatPrice` helper using `Intl.NumberFormat(\'en-IN\', { style: \'currency\', currency: \'INR\', maximumFractionDigits: 0 })`, which gives the Indian grouping (₹1,50,000, not ₹150,000). Never hand-concatenate `\'₹\' + price`. If `is_negotiable` is true, show a **"Negotiable" badge** next to the price so the number reads as a starting point, not a fixed tag. Dimensions render from the stored `width`/`height` (and a `unit`), the medium from a lookup, tags as a chip row, and `created_at` through a relative or localised date formatter.\n\n**The two related sections are two more small queries:**\n\n- **More from this artist:** `artworks` where `artist_id = current.artist_id` and `id != current.id`, limited to a handful, newest first. This keeps a buyer inside one artist\'s body of work.\n- **Similar in this category:** `artworks` joined through the category of the current artwork, excluding this one and ideally this artist, limited to a handful. This is discovery *across* artists — the buyer who likes this mural sees other muralists.\n\nBoth related queries should reuse the card column list and `!inner` category embed patterns from earlier topics — there is nothing new in them, which is the point: the earlier abstractions compose. Guard both for the empty case (a brand-new artist with one artwork has no "more from this artist"), and lazy-load their images like any grid.\n\nThe back-link to the artist is not decoration — it is the conversion path. A buyer lands on an artwork from a search or a shared link, likes it, and the fastest route to contact is `/artists/:slug`. Make that link prominent, with the artist name and avatar, so the artwork page is a doorway to the profile, not a dead end.',
          diagram: `graph TD
    URL["/artworks/:id"] --> Q1[fetch artwork + artist + category + tags]
    Q1 --> M{maybeSingle}
    M -- null --> NF[NotFound 404]
    M -- row --> MAIN[render: big image, formatPrice,<br/>negotiable badge, medium, dims, tags, date]
    MAIN --> BACK[prominent link back to artist profile]
    MAIN --> Q2[more from this artist:<br/>artist_id = X, id != this]
    MAIN --> Q3[similar in category:<br/>same category, id != this]
    Q2 --> G1{empty?}
    G1 -- yes --> H1[hide section]
    G1 -- no --> S1[grid of cards]
    Q3 --> G2{empty?}
    G2 -- yes --> H2[hide section]
    G2 -- no --> S2[grid of cards]`,
          flowExplain:
            'One `maybeSingle` fetch drives the main panel (404 on null), and two small related queries — same-artist and same-category — each render a grid or hide themselves when empty; the back-link to the profile is the conversion path out of the page.',
          whyItMatters:
            'Related-item sections are what turn a single-artwork view into browsing momentum, which is the core discovery loop of any marketplace. `formatPrice` with `Intl.NumberFormat(\'en-IN\')` is a small detail that separates a product that respects Indian number formatting from one that looks foreign to its own users.',
          steps: [
            'Fetch the artwork by id with its artist, category, and tags embedded; `.maybeSingle()`; render `<NotFound />` on null.',
            'Render price through `formatPrice` (`Intl.NumberFormat(\'en-IN\', currency INR)`), and show a "Negotiable" badge when `is_negotiable`.',
            'Render medium, dimensions from stored `width`/`height`, tags as chips, and `created_at` through a date formatter.',
            'Query "more from this artist": same `artist_id`, exclude the current id, limit a few.',
            'Query "similar in category": same category via `!inner`, exclude the current id, limit a few; hide each section when empty.',
          ],
          code: `// src/utils/formatPrice.js
export function formatPrice(rupees) {
  if (rupees == null) return 'Price on request';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(rupees);                    // 150000 -> "₹1,50,000" (Indian grouping)
}

// src/services/artworkService.js
export async function getArtwork(id) {
  const { data, error } = await supabase
    .from('artworks')
    .select(\`
      id, title, image_url, width, height, price, is_negotiable, medium,
      tags, created_at,
      artists!inner ( slug, display_name, avatar_url ),
      categories ( name, slug )
    \`)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapArtwork(data) : null;   // null -> 404
}

export async function moreFromArtist(artistId, excludeId) {
  const { data, error } = await supabase
    .from('artworks')
    .select('id, title, image_url, width, height, price')
    .eq('artist_id', artistId)
    .neq('id', excludeId)                  // do not show the piece you are on
    .order('created_at', { ascending: false })
    .limit(6);
  if (error) throw error;
  return data.map(mapArtworkCard);
}

export async function similarInCategory(categorySlug, excludeId) {
  const { data, error } = await supabase
    .from('artworks')
    .select('id, title, image_url, width, height, price, ' +
            'categories!inner ( slug )')
    .eq('categories.slug', categorySlug)   // !inner so this actually filters
    .neq('id', excludeId)
    .limit(6);
  if (error) throw error;
  return data.map(mapArtworkCard);
}`,
          pitfalls: [
            '**Hand-formatting price as `\'₹\' + price`.** You lose Indian digit grouping and get `₹150000` instead of `₹1,50,000`. Fix: `Intl.NumberFormat(\'en-IN\', { style: \'currency\', currency: \'INR\' })`.',
            '**Showing "similar in category" through a left-joined embed.** It returns every artwork, not just the matching category. Fix: `!inner` on the category embed so it filters (topic 2).',
            '**Not excluding the current artwork from related lists.** The piece a buyer is viewing shows up under "more from this artist". Fix: `.neq(\'id\', currentId)` on both related queries.',
            '**Rendering an empty "similar" section as a bare heading.** A new category with one artwork shows a lonely title and no cards. Fix: hide the whole section when the related list is empty.',
            '**Treating the artwork page as a dead end.** Without a prominent link back to the artist, a buyer who loves the piece has no path to contact. Fix: a clear artist link with name and avatar — it is the conversion route.',
          ],
          tryIt:
            'Open an artwork whose artist has several other pieces and confirm "more from this artist" shows them without repeating the current one. Then open an artwork whose artist has only that one piece and confirm the section disappears cleanly rather than showing an empty heading.',
          takeaway:
            'The artwork page renders one `maybeSingle` fetch with `formatPrice` and a negotiable badge, then two small related queries — same-artist and same-category — each hidden when empty, with a prominent link back to the artist as the conversion path.',
        },
        {
          id: 'm9-t12',
          title: 'The four render states nobody builds',
          explain:
            'Every list must ship four states in order — loading, empty, error, data — and the ones people skip are a helpful zero-results view, a retryable network error, and the unpublished-artist case that must 404 rather than leak.',
          analogy:
            'A good bus stand information counter answers all four ways a query can go: "checking the timetable" (loading), "no bus goes to Kollur after 6pm, but there is one to Kundapura you can change at" (empty, with a next step), "the board is down, try again in a minute" (error), and the actual timetable (data). A counter that only prints timetables and stares blankly the rest of the time is the app most beginners ship.',
          theory:
            'The convention from Module 0 is that every list ships **loading → empty → error → data, written in that order**. Loading and data are the two everyone builds. The other two, plus one security case, are where products are made or broken.\n\n**Zero results, done well.** An empty search is not a dead end — it is a chance to widen. "No artists serve Kundapura yet — try Udupi district" with a **button that actually widens the search** (drops the taluk filter and re-searches the district) turns a frustrated exit into a second query. The rule: an empty state should always offer the next action, and the button must *do* something, not just apologise. This is especially real for KalaKaara because coastal Karnataka is sparsely covered early on — a Kundapura search genuinely will return nothing, and pointing to Udupi district is a real, useful widening.\n\n**Network error, with retry.** A failed fetch is not the same as an empty result, and conflating them is a classic bug — "no artists found" when the truth is "the request failed" sends the visitor away thinking the app is empty when it is broken. Show a distinct error state with a **retry button** that re-runs the fetch. The `error` field from `useArtists` (topic 8) is exactly what you branch on.\n\n**The unpublished artist accessed by direct URL — 404, never 403.** This is the security-flavoured one. Someone has the slug of an unpublished (draft) artist and visits `/artists/that-slug` directly. RLS (Module 4) returns **nothing** to an anonymous caller, so your `.maybeSingle()` gives `null`, and you render `<NotFound />`. That is correct and deliberate. The mistake is rendering "You are not allowed to view this artist" — a 403-style message — because that **leaks existence**: it confirms that an artist with this slug exists but is hidden, which is information you should not reveal. A 404 says "there is nothing here", which is exactly what an anonymous visitor should perceive. The database enforces the invisibility; your job is to not undo it in the UI by announcing that something is being hidden. Render 404, never "forbidden".\n\nThe order matters too: check loading first (so you never flash empty before data arrives), then error (so a failure is not mistaken for empty), then empty, then data. Writing them in that order in the component makes the precedence correct by construction.',
          diagram: `graph TD
    F[fetch via useArtists] --> L{loading?}
    L -- yes --> S1[Skeletons - loading]
    L -- no --> E{error?}
    E -- yes --> S2[Error + Retry button<br/>NOT 'no results']
    E -- no --> Z{rows.length === 0?}
    Z -- yes --> S3["Zero results + widen button<br/>'try Udupi district' - actually re-searches"]
    Z -- no --> S4[Results grid - data]
    subgraph sec[Unpublished artist by direct URL]
      U[RLS returns nothing to anon] --> NULL[maybeSingle -> null]
      NULL --> NF["render 404 NotFound<br/>NEVER 'you are not allowed' (leaks existence)"]
    end`,
          flowExplain:
            'The branches are written in precedence order — loading, then error, then empty, then data — so a failure is never misread as empty; and the boxed case shows why an unpublished artist must render a 404, not a 403, so the UI does not leak that a hidden artist exists.',
          whyItMatters:
            'The four-states discipline is what makes a list feel finished, and the 404-not-403 rule is a genuine security principle — information leakage through error messages is a real vulnerability class. "Why does an unpublished artist get a 404 and not a 403?" is a sharp interview question, and "because a 403 confirms the resource exists, which RLS deliberately hides" is the answer that shows you think about what your errors reveal.',
          steps: [
            'In every list component, branch in the exact order loading → error → empty → data.',
            'Make the empty state offer a concrete widening action, and wire its button to actually drop a filter and re-search.',
            'Give the error state a retry button that re-invokes the fetch, and keep it distinct from the empty state.',
            'For the artist detail page, treat `null` from `.maybeSingle()` as 404 for both a bad slug and an unpublished artist — same outcome, no distinction shown.',
            'Never render a "you are not allowed" / forbidden message for a hidden artist; render `<NotFound />` so existence does not leak.',
          ],
          code: `// src/pages/BrowsePage.jsx — four states, in precedence order.
export default function BrowsePage() {
  const [filters, setFilters] = useFiltersFromUrl();
  const { data, loading, error, total } = useArtists(filters);

  // 1. LOADING first, so we never flash "empty" before data arrives.
  if (loading) return <ResultsSkeleton count={8} />;

  // 2. ERROR next, kept distinct from empty — a failure is not "no results".
  if (error) {
    return (
      <ErrorState
        message="Could not load artists. Please check your connection."
        onRetry={() => setFilters({ ...filters })} // re-run the fetch
      />
    );
  }

  // 3. EMPTY, with a widening action that actually does something.
  if (data.length === 0) {
    const canWiden = Boolean(filters.taluk); // e.g. Kundapura taluk -> Udupi district
    return (
      <EmptyState
        title="No artists serve this area yet"
        hint={canWiden ? 'Try widening to Udupi district' : 'Try removing a filter'}
        actionLabel={canWiden ? 'Search Udupi district' : 'Clear filters'}
        onAction={() =>
          canWiden
            ? setFilters({ ...filters, taluk: undefined, district: 'udupi' })
            : setFilters({})
        }
      />
    );
  }

  // 4. DATA.
  return <ResultsGrid artists={data} total={total} />;
}`,
          pitfalls: [
            '**Only building loading and data.** The empty and error states are where a real product proves itself, and skipping them ships a page that looks broken the moment a search returns nothing. Fix: write all four, in order, every time.',
            '**Conflating empty and error.** Showing "no artists found" when the fetch actually failed tells the visitor the marketplace is empty when it is really down. Fix: branch on `error` before `rows.length === 0`, with distinct UI.',
            '**An empty state with no next step.** "No results" and nothing else is a dead end. Fix: offer a concrete widening action wired to actually re-search a broader area.',
            '**Rendering "you are not allowed" for an unpublished artist.** A 403-style message confirms the artist exists, leaking what RLS hid. Fix: render a 404 `<NotFound />` — same as a slug that never existed.',
            '**Checking empty before loading.** The page flashes "no artists" for a frame before the first data arrives. Fix: loading must be the first branch so the empty state never shows prematurely.',
          ],
          tryIt:
            'Search for a village nobody covers yet and confirm you get a helpful "try Udupi district" button that, when clicked, actually returns results. Then throttle your network to offline in DevTools, reload, and confirm you get a retry error — not a "no artists found" message. Finally, take the slug of a draft artist and visit it logged out: you must get a 404, not a "forbidden".',
          takeaway:
            'Every list ships loading → error → empty → data in that order; the empty state offers a real widening action, the error state retries, and an unpublished artist renders a 404 — never a 403 that would leak its existence.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm9-p1',
      type: 'Mini Project',
      title: 'The Complete Browse Experience',
      domain: 'Public Discovery & Search',
      duration: '2 hours',
      description:
        'Build the entire public discovery surface: nine working filters driven entirely by the URL, debounced full-text search, seven sort options, offset pagination with a live total count, a joined artist-detail page with an accessible lightbox, an artwork-detail page with related items, and all four render states on every list. The acceptance test is exact: copy a filtered URL into a fresh incognito window and get the identical result set, logged out.',
      tools: ['React', 'react-router-dom v6', 'Supabase', 'PostgREST', 'PostgreSQL full-text search', 'CSS Modules'],
      blueprint: {
        overview:
          'A `/artists` browse route whose entire state — every filter, the sort, the search text, the page — lives in the URL via `useSearchParams`, feeding a single conditional query builder in the service layer. A `useArtists` hook debounces search, memoises the filter key, and guards out-of-order responses, returning `{ data, loading, error, total }`. The detail routes fetch joined data with `.maybeSingle()` and render a real 404. Every list ships loading, empty, error, and data states. Nothing requires a login; the anonymous path is the only path.',
        functionalRequirements: [
          '**Nine URL-driven filters.** Category (multi), location (Module 8 RPC), budget range, minimum rating, minimum experience, languages (multi), availability, near-me radius, and free-text `q` — all serialised into and parsed defensively out of the query string.',
          '**Debounced full-text search.** A search box whose value settles at 300ms via `useDebounce`, querying a GIN-indexed `search_vector` with `websearch_to_tsquery`, never firing per keystroke.',
          '**Seven sort options.** Newest, highest rated (with `nullsFirst:false`), most experienced, lowest price, highest price, alphabetical, and nearest (offered only when a location is set), each with a stable `id` tiebreaker.',
          '**Offset pagination with a total.** `.range(from, to)` plus `count:\'exact\'` driving a numbered pager that shows "showing X–Y of N" and clamps out-of-range pages.',
          '**Joined artist-detail page.** `/artists/:slug` fetching artist, artworks, categories, languages, service areas, and recent reviews in one embedded select via `.maybeSingle()`, with a masonry portfolio grid and a keyboard-accessible lightbox.',
          '**Artwork-detail page with related items.** `/artworks/:id` with `formatPrice`, negotiable badge, medium, dimensions, tags, date, a link back to the artist, plus "more from this artist" and "similar in this category".',
          '**All four render states on every list.** Loading skeletons, a widening zero-results state, a retryable error state, and data — plus a 404 (never a 403) for a missing or unpublished artist.',
        ],
        technicalImplementation: [
          '**`useSearchParams` as the store.** No filter lives in `useState`; `parseFilters` coerces and clamps every param with safe fallbacks, `serializeFilters` omits defaults, and any filter change resets `page` to 1.',
          '**One conditional query builder** in `artistService.searchArtists`, starting from `.eq(\'is_published\', true)` with named columns and `count:\'exact\'`, attaching a clause per active filter, using `!inner` embeds to filter by category and language.',
          '**`useArtists(filters)`** debouncing `q`, depending on a serialised key so the effect does not loop, guarding responses with a `cancelled` cleanup flag, and returning `{ data, loading, error, total }`.',
          '**Location and near-me via Module 8 RPCs**, resolved to id lists and folded in as `.in(\'id\', ids)`, short-circuiting to an empty page when an RPC matches nobody.',
          '**A generated `search_vector` column + GIN index** for full-text search, queried with `.textSearch(..., { type: \'websearch\' })`.',
          '**An accessible `Lightbox` component** with Escape-to-close, arrow navigation, a focus trap, focus restoration, and `role="dialog"`/`aria-modal`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'URL-as-state: parse, serialise, and the filter panel',
            outcome:
              'A `/artists` route whose filters live entirely in the URL, with defensive parsing and a filter panel that reads and writes search params.',
            prompt:
              'In a Vite + React + react-router-dom v6 project, build the browse route state layer. Write `parseFilters(searchParams)` that reads nine filters — category and languages (comma-serialised arrays), location (city id), budget min/max, minimum rating, minimum experience, availability, near-me, and free-text q — coercing and clamping every value with safe fallbacks so a malformed URL like `?page=abc&rating=999&sort=nonsense` never throws and degrades to a default view (bad page → 1, out-of-range rating → dropped, unknown sort → newest). Write `serializeFilters(filters)` that joins arrays with commas and omits defaults so page 1 and the newest sort produce a clean URL. Build a `FilterPanel` (collapsible drawer on mobile, sticky sidebar on desktop, plain CSS Modules, never Tailwind) whose controls read from and write to `useSearchParams`, resetting page to 1 on any filter change. No filter may live in useState.',
          },
          {
            step: 2,
            label: 'The conditional query builder in the service layer',
            outcome:
              'A single `searchArtists` service function that builds the query clause-by-clause and never selects `*`.',
            prompt:
              'Write `src/services/artistService.js` with a `searchArtists(filters, { from, to, sort })` function. Start the builder with a named column list (id, slug, display_name, avatar_url, cover_url, tagline, rating_avg, rating_count, years_experience, base_price, city_name), `{ count: \'exact\' }`, and `.eq(\'is_published\', true)`. Attach a clause ONLY when a filter is present: `.in()` through an `!inner` embed for multi-select category and languages, `.gte`/`.lte` for budget, `.gte` for rating and experience, `.eq` for availability, and `.textSearch(\'search_vector\', q, { type: \'websearch\', config: \'english\' })` for free text. Resolve location and near-me through the Module 8 RPCs `match_artists_by_location` and `artists_within_km`, turn their results into an id list, fold it in as `.in(\'id\', ids)`, and short-circuit to an empty result when an RPC matches nobody. Never use `select(\'*\')`. Await exactly once, throw on error, and map snake_case to camelCase before returning `{ rows, total }`.',
          },
          {
            step: 3,
            label: 'Full-text search, sort, and pagination',
            outcome:
              'A GIN-indexed search_vector, an `applySort` covering seven options, and offset pagination with a total.',
            prompt:
              'Write the SQL migration adding a generated `search_vector tsvector` column to `artists` concatenating display_name (weight A), tagline (B), and bio (C) via `to_tsvector(\'english\', ...)`, plus a GIN index on it. On the client, write `applySort(query, sortKey, hasLocation)` mapping seven sorts — newest (created_at desc), rating (rating_avg desc with nullsFirst:false), experience, price_low, price_high, name, and nearest (distance_km asc, only when hasLocation) — each ending with a stable `.order(\'id\')` tiebreaker, and falling back to newest for an unknown key. Write `pageWindow(page)` returning an inclusive `.range` window for PAGE_SIZE 20, and a numbered pager component that renders "showing X–Y of N" from the `count:\'exact\'` total and clamps out-of-range pages. Add a comment explaining this is offset pagination and when to switch to keyset.',
          },
          {
            step: 4,
            label: 'The useArtists hook: debounce, memo key, cancelled guard',
            outcome:
              'A `useArtists(filters)` hook returning `{ data, loading, error, total }` with no render loop and no stale overwrites.',
            prompt:
              'Write `src/hooks/useDebounce.js` (value settles after a delay, clearing the timer on change) and `src/hooks/useArtists.js`. In `useArtists(filters)`: debounce `filters.q` at 300ms; build a stable dependency key by serialising the debounced filters so a fresh filter object literal does not loop the effect; inside the effect set `let cancelled = false`, set loading true, call `searchArtists`, and guard every setState with `if (!cancelled)`; return `() => { cancelled = true }` as cleanup so a superseded fetch cannot overwrite fresh results; clear loading in a `finally`; and return exactly `{ data, loading, error, total }`. Demonstrate the infinite-loop bug by depending on the raw filters object, then fix it with the memoised key.',
          },
          {
            step: 5,
            label: 'Artist detail: joined query, masonry grid, accessible lightbox',
            outcome:
              'A `/artists/:slug` page fetching everything in one embedded select via maybeSingle, with a keyboard-accessible lightbox.',
            prompt:
              'Write `getArtistProfile(slug)` selecting the artist and embedding artworks (id, title, image_url, width, height, price, is_negotiable), categories, languages, service areas, and recent reviews in one query, constrained by `.eq(\'slug\', slug).eq(\'is_published\', true)` and ending with `.maybeSingle()` so zero rows returns null. Build `ArtistDetailPage` branching loading → error → `null`-as-`<NotFound />` → profile. Build a masonry portfolio grid using CSS `columns` (responsive column-count, CSS Modules), every `<img>` with `loading="lazy"`, `decoding="async"`, and explicit width/height from the stored dimensions to prevent layout shift. Build a `Lightbox` component that is fully keyboard-accessible: Escape closes, ArrowLeft/ArrowRight navigate, focus is trapped inside the dialog while open (Tab wraps at the first/last focusable element), focus is saved on open and restored to the triggering thumbnail on close, with `role="dialog"` and `aria-modal="true"`.',
          },
          {
            step: 6,
            label: 'Artwork detail, related items, and all four render states',
            outcome:
              'A `/artworks/:id` page with related sections, plus loading/empty/error/data on every list and a 404-not-403 for hidden artists.',
            prompt:
              'Write `getArtwork(id)` (via `.maybeSingle()`, embedding the artist for the back-link and the category), `moreFromArtist(artistId, excludeId)`, and `similarInCategory(categorySlug, excludeId)` (using an `!inner` category embed so it actually filters, and `.neq(\'id\', excludeId)` on both). Write `formatPrice` using `Intl.NumberFormat(\'en-IN\', { style: \'currency\', currency: \'INR\', maximumFractionDigits: 0 })`, and build the artwork page: large image, price, a "Negotiable" badge when is_negotiable, medium, dimensions, tags, created date, a prominent link back to the artist, and the two related grids, each hidden when empty. Finally, ensure every list (browse and both related grids) renders four states in the order loading → error → empty → data: loading skeletons; a zero-results state with a button that actually widens the search (e.g. Kundapura taluk → Udupi district); a distinct retryable error state; and data. Make an unpublished or missing artist render a real `<NotFound />` 404 — never a "you are not allowed" message that would leak the artist exists. Print the acceptance test to run: copy a filtered URL into a fresh incognito window, logged out, and confirm an identical result set.',
          },
        ],
        deliverable:
          'A fully working public discovery surface — browse with nine URL-driven filters, debounced full-text search, seven sorts, offset pagination with a total, a joined artist-detail page with an accessible lightbox, an artwork-detail page with related items, and all four render states on every list — that a logged-out visitor uses end to end. Pasting any filtered URL into a fresh incognito window reproduces the identical result set, proving the URL is the state.',
      },
    },
  ],
  quiz: [
    {
      id: 'm9-q1',
      q: 'You embed `artist_categories(categories(slug))` in a browse query and add `.eq(\'artist_categories.categories.slug\', \'mural\')`, but every artist still comes back. Why?',
      options: [
        'A plain embed is a left join, which returns non-matching artists with an empty category array; you must use `!inner` at each embed level to actually filter by the embedded category',
        'PostgREST cannot filter on embedded resources at all; you must fetch everything and filter in JavaScript',
        'The `.eq` path is wrong — embedded filters must use `.match()` instead of `.eq()`',
        'The category slug must be passed as an array to `.in()`, never to `.eq()`',
      ],
      answer: 0,
    },
    {
      id: 'm9-q2',
      q: 'For KalaKaara\'s primary artist search over name, tagline, and bio, which approach is used and why?',
      options: [
        'A raw `ilike \'%term%\'` because it is the simplest and always uses the primary key index',
        'A pg_trgm GIN index alone, because trigram similarity is the only way to match words across multiple fields',
        'A generated `search_vector` tsvector column with a GIN index, queried with `websearch_to_tsquery`, because it matches stemmed words across fields, is indexable, and safely accepts raw user input',
        'Client-side filtering of all artists with `Array.filter`, because it avoids any database load',
      ],
      answer: 2,
    },
    {
      id: 'm9-q3',
      q: 'Why might KalaKaara switch from `count: \'exact\'` to `count: \'estimated\'` as the artists table grows?',
      options: [
        'Estimated counts are always exact but cached, so they are strictly better in every case',
        'An exact count forces Postgres to actually count every matching row (a full scan) even though only 20 are shown, which gets slow on large tables; estimated uses the planner\'s estimate above a threshold',
        'The `exact` option is deprecated in supabase-js v2 and no longer supported',
        'Estimated counts are required whenever you use `.range()` for pagination',
      ],
      answer: 1,
    },
    {
      id: 'm9-q4',
      q: 'What is the core difference between offset pagination and keyset (cursor) pagination?',
      options: [
        'Keyset pagination can jump directly to any page number, while offset pagination can only move next and previous',
        'Offset and keyset are two names for the same technique; the difference is only in syntax',
        'Offset pagination is always faster because it uses `LIMIT`, while keyset re-scans the whole table every time',
        'Offset pagination skips rows by position and re-scans everything it skips (slow on deep pages), while keyset anchors to the last row seen via an indexed cursor and never re-scans',
      ],
      answer: 3,
    },
    {
      id: 'm9-q5',
      q: 'You sort artists by "highest rated" with `.order(\'rating_avg\', { ascending: false })` and unrated artists (rating_avg IS NULL) appear at the top. What fixes it?',
      options: [
        'Add `nullsFirst: false` so NULL ratings sort to the bottom regardless of the descending direction',
        'Change the sort to ascending so the highest ratings come last',
        'Delete every artist who has no rating yet so there are no NULLs to sort',
        'Wrap the column in `COALESCE(rating_avg, 5)` so unrated artists are treated as five stars',
      ],
      answer: 0,
    },
    {
      id: 'm9-q6',
      q: 'On the `/artists/:slug` detail page, why use `.maybeSingle()` instead of `.single()`?',
      options: [
        '`.maybeSingle()` is faster because it stops scanning after the first row',
        'A slug that does not exist (or an unpublished artist hidden by RLS) yields zero rows, which is a normal 404 case; `.maybeSingle()` returns null there, while `.single()` throws an error',
        '`.single()` cannot be used with embedded joins, but `.maybeSingle()` can',
        'They are interchangeable; `.maybeSingle()` is just the newer name for `.single()`',
      ],
      answer: 1,
    },
    {
      id: 'm9-q7',
      q: 'Why does KalaKaara keep the entire browse state (filters, sort, search, page) in the URL via `useSearchParams` instead of `useState`?',
      options: [
        'Because React state cannot hold arrays, so filters have to live somewhere else',
        'Because `useSearchParams` is faster to read than `useState`',
        'Because Supabase requires filters to be passed as URL parameters',
        'Because a URL-encoded search is shareable, bookmarkable, survives a refresh, and works with the back button — pasting the URL into a fresh incognito window reproduces the identical logged-out result set',
      ],
      answer: 3,
    },
    {
      id: 'm9-q8',
      q: 'An anonymous visitor opens the direct URL of an unpublished (draft) artist. RLS returns nothing. What should the page render, and why?',
      options: [
        'A 403 "you are not allowed to view this artist" message, so the visitor knows the artist exists but is private',
        'A redirect to the home page, so the visitor forgets what they were looking for',
        'A real 404 `<NotFound />`, because a 403 would confirm the artist exists — leaking information that RLS deliberately hides; a 404 says "nothing here", matching what an anonymous visitor should perceive',
        'A login prompt, because viewing any artist requires signing in first',
      ],
      answer: 2,
    },
  ],
}
