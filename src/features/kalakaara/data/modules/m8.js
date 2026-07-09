// Module 9 (m8) — The Location & Service-Area System
// KalaKaara (React + Supabase) course content for the React course player.
// This is the hardest and most distinctive module in the course.

export const m8 = {
  id: 'm8',
  title: 'The Location & Service-Area System',
  hours: 9,
  color: 'from-teal-500/20 to-teal-700/10',
  accent: 'teal',
  description:
    'The feature that makes KalaKaara more than a CRUD app: seed India\'s administrative hierarchy into your own Postgres, autocomplete against it with no API key and no card, wrap every external geocoder behind one swappable provider interface, let artists declare service areas of six different types, and answer the single question the whole product exists to answer — "does this artist serve the place I searched?" — with plain-SQL containment matching and a Haversine radius search that needs no PostGIS.',
  sections: [
    {
      id: 'm8-s1',
      title: 'Place data you own',
      topics: [
        {
          id: 'm8-t1',
          title: 'Why we seed the hierarchy instead of calling a geocoding API',
          explain:
            'We copy India\'s state / district / taluk / city hierarchy into our own Postgres tables so that "is Manipal inside Udupi district?" is a foreign-key join rather than a network call.',
          analogy:
            'The Kundapura taluk office keeps a bound register of every village under it, and every taluk register sits inside the Udupi district record room. When a clerk needs to know whether Gangolli falls under Kundapura, he does not phone Bangalore — he opens the shelf beside his desk. Owning the register means the answer is instant, free, works when the phone line is down, and is the same answer every single time. A geocoding API is phoning Bangalore for something already on your shelf.',
          theory:
            'A geocoding API — Google Places, Mapbox, anything — is built to answer a different question than ours. You type "Manipal", it returns a `place_id`, a formatted address string ("Manipal, Karnataka 576104, India"), and a latitude/longitude. What it does **not** return is the fact our whole product depends on: *Manipal is contained inside Udupi district, which is inside Karnataka, which is inside India.* Containment is the fact our matching needs, and a Places result simply does not carry it.\n\nYou could try to reconstruct containment from the formatted address by string-parsing "Udupi" out of it — and you would be building a fragile parser on top of a paid API to recover a fact you could have stored as a foreign key. "Udupi", "udupi", "Udupi District", and "Udupi Taluk" would all be different strings, and none of them would join to anything.\n\nSo we invert the problem. India has a **stable administrative hierarchy**: 28 states and 8 union territories, ~750 districts, ~5,500 taluks/tehsils, and hundreds of thousands of cities and villages. It changes rarely and slowly. We seed it into four tables — `states`, `districts`, `taluks`, `cities` — each row carrying a foreign key to its parent and a `lat`/`lng`. Now "is Manipal inside Udupi district?" is `cities join taluks join districts` and reading the `district_id`. It is a join, not a geometry problem, not a string-parse, not a billed request.\n\nOwning the data buys five things that no external API gives you at once: **no rate limit** (query it ten times per keystroke if you like), **no API key** to manage or leak, **no credit card** (it is your own Postgres, which passes NFR N1 by construction), **works offline** in development (seed once, develop on a plane), and — the one that matters most — **it joins**. Your place data lives in the same database as your `artists` and `artist_service_areas`, so matching is one query across tables that are already related, not a client-side reconciliation between an API response and your rows.\n\nThe cost is real and worth stating: you own the seeding and the freshness. A new district gets carved out of an old one every few years, and you will not get it until you re-seed. For a discovery marketplace in coastal Karnataka, that trade is trivially worth it. For an app that needed street-level precision worldwide, it would not be — and that is exactly the judgment an interviewer wants to hear you make.',
          diagram: `erDiagram
    states ||--o{ districts : contains
    districts ||--o{ taluks : contains
    taluks ||--o{ cities : contains
    states {
      uuid id PK
      text name
      text slug
      float lat
      float lng
    }
    districts {
      uuid id PK
      uuid state_id FK
      text name
      text slug
      float lat
      float lng
    }
    taluks {
      uuid id PK
      uuid district_id FK
      text name
      text slug
      float lat
      float lng
    }
    cities {
      uuid id PK
      uuid taluk_id FK
      text name
      text slug
      float lat
      float lng
    }`,
          flowExplain:
            'Every arrow is a foreign key pointing at its parent. Because the chain is unbroken from `cities` up to `states`, any containment question — "is this city in that district?" — is answered by following FKs, never by comparing coordinates or parsing strings.',
          whyItMatters:
            'When an interviewer asks "why not just use Google Places?", the weak answer is "it costs money". The strong answer is "a Places result gives me a place_id and an address string, but my matching logic needs containment — is this location inside that district — and only owning the administrative hierarchy as foreign keys gives me that as a join." That answer shows you understood the problem, not just the price tag.',
          steps: [
            'Write the one question the location system exists to answer: **does this artist serve the place the user searched?**',
            'Note that answering it needs containment — "is X inside Y" — and that a geocoding API returns a place_id and an address, not containment.',
            'List the four tables that model the hierarchy: `states`, `districts`, `taluks`, `cities`, each with a foreign key to its parent.',
            'List the five things owning the data buys: no rate limit, no key, no card, offline, and joins.',
            'Name the cost honestly: you own seeding and freshness. Decide it is acceptable for a coastal-Karnataka marketplace, and write down when it would not be.',
          ],
          code: `-- The fact a geocoding API gives you:
--   place_id:  "ChIJ...Manipal..."
--   address:   "Manipal, Karnataka 576104, India"
--   location:  { lat: 13.3525, lng: 74.7868 }
-- Nowhere in that response is the sentence "Manipal is in Udupi district".

-- The fact our matching needs, as a query against data we own:
select
  c.name        as city,
  t.name        as taluk,
  d.name        as district,
  s.name        as state
from cities c
join taluks    t on t.id = c.taluk_id
join districts d on d.id = t.district_id
join states    s on s.id = d.state_id
where c.slug = 'manipal';

--  city   | taluk | district | state
-- --------+-------+----------+-----------
--  Manipal| Udupi | Udupi    | Karnataka
--
-- Containment falls straight out of the foreign keys. No API. No key.
-- No card. No rate limit. And it lives in the same database as artists,
-- so the next join reaches artist_service_areas for free.`,
          pitfalls: [
            '**Storing an artist\'s area as the free-text string "Udupi".** Then "Udupi", "udupi", and "Udupi District" are three different places and containment is impossible. Fix: normalise into `states`/`districts`/`taluks`/`cities` with real foreign keys, and reference places by `id`, never by name.',
            '**Trying to recover containment by parsing a Places formatted address.** You end up regex-splitting "Manipal, Karnataka 576104, India" and guessing which token is the district. Fix: do not parse addresses for containment — model the hierarchy as foreign keys and join.',
            '**Calling a geocoding API on every keystroke of autocomplete.** That is a paid, rate-limited network round-trip per character. Fix: autocomplete against your own indexed tables; reserve any external API for the rare free-text query your tables genuinely miss.',
            '**Assuming the hierarchy never changes so you can hardcode ids.** Districts get created and renamed. Fix: seed from a dated source, keep a `slug`, and treat re-seeding as a maintenance task, not a one-time event.',
            '**Seeding only cities and skipping the parent tables to "save time".** Without `districts` and `taluks` you cannot answer district-level containment at all. Fix: seed the full chain; the parent rows are tiny and they are the whole point.',
          ],
          tryIt:
            'Open the Google Places response format in your head: place_id, formatted_address, geometry. Now write, in one sentence, the exact fact it does not contain that a search for artists serving Kundapura requires. (Answer: that Kundapura is contained inside Udupi district, inside Karnataka, inside India — the ancestry, not the point.)',
          takeaway:
            'A geocoding API returns a place_id and an address; our matching needs containment. Seed the administrative hierarchy as foreign keys and containment becomes a join — free, offline, rate-limit-free, and in the same database as your artists.',
        },
        {
          id: 'm8-t2',
          title: 'The four tables, free data sources, and real seed SQL',
          explain:
            'Four tables — states, districts, taluks, cities — each with a name, a foreign key to its parent, a lat/lng, and a slug; seeded from free government and OpenStreetMap sources that never ask for a card.',
          analogy:
            'A Yakshagana troupe keeps its costumes in nested trunks: the big state trunk holds the district trunks, which hold the taluk trunks, which hold each character\'s box. You never store a headdress loose — it always lives inside the box that lives inside the trunk. Our four tables are those nested trunks: a city always lives inside a taluk, which lives inside a district, which lives inside a state.',
          theory:
            'Each of the four tables has the same skeleton: `id uuid primary key default gen_random_uuid()`, a `name`, a `slug` (the URL-safe lowercase form, so `/browse?district=udupi` works), a `lat` and `lng` (`double precision`) for the row\'s representative point, `created_at`, and — for every table except `states` — a foreign key to its parent. That uniformity is deliberate: the same index strategy, the same autocomplete query, and the same slug lookups work identically at all four levels.\n\nThe `lat`/`lng` on an administrative row is its **centroid or headquarters point**. Udupi district\'s coordinates are roughly the district headquarters town; Kundapura taluk\'s are the taluk town. We are not storing the district\'s polygon — that is a PostGIS problem we deliberately avoid. A single representative point is enough for two things we actually do: showing a marker, and computing rough distances for the "Near me" snap in a later topic.\n\n**Where free data comes from, all card-free.** The Government of India\'s **LGD (Local Government Directory)** publishes the official state → district → sub-district (taluk) → village hierarchy as downloadable CSVs. The **Census of India** publishes town and village directories with the same codes. **OpenStreetMap extracts** — from Geofabrik, or an Overpass query — give you names plus coordinates for cities and villages, and are what we lean on for `lat`/`lng`. All three are free, downloadable, and never ask for a credit card. You reconcile them offline (a small Node or Python script), then emit the seed SQL. None of that reconciliation happens at runtime; it happens once, at your desk.\n\n**How much do we seed?** Karnataka **fully** — every district, taluk, and the cities and larger villages of coastal Karnataka especially — because that is where our artists and buyers are. The rest of India we seed only at **state level** for now, so a Pan-India search still resolves and a Mumbai artist can declare "Maharashtra". This is the same MVP sequencing you learned in Module 1: seed the depth you need where your users are, seed the breadth you need everywhere else, and expand later. Coastal Karnataka gets city-level detail; Assam gets a state row.\n\nThe seed itself is ordinary SQL `insert` statements, generated by your reconciliation script and committed as a migration. Parents first, children second, because the child rows carry foreign keys the parents must already satisfy. Below is the real seed for Udupi district and its six taluks with representative coordinates — the exact rows the rest of this module\'s examples query against.',
          diagram: `graph TD
    LGD[LGD CSV<br/>official hierarchy + codes] --> REC[Reconcile offline<br/>Node or Python script]
    CEN[Census town/village directory] --> REC
    OSM[OpenStreetMap extract<br/>names + lat/lng] --> REC
    REC --> SQL[Generated seed.sql<br/>parents first, children second]
    SQL --> ST[(states)]
    SQL --> DI[(districts)]
    SQL --> TA[(taluks)]
    SQL --> CI[(cities)]
    ST --> DI --> TA --> CI`,
          flowExplain:
            'All the messy reconciliation of three free sources happens once, offline, and emits plain insert statements. At runtime there is only the seeded table — no source is ever contacted while a user is searching.',
          whyItMatters:
            'Data provenance is a real engineering concern interviewers probe: "where did your location data come from and what did it cost?" Being able to say "LGD and Census for the official hierarchy, OpenStreetMap for coordinates, reconciled offline into four tables, zero cost, zero card" is a complete, credible answer that also happens to satisfy the course\'s hardest constraint.',
          steps: [
            'Create the four tables with the uniform skeleton: `id`, `name`, `slug`, `lat`, `lng`, `created_at`, plus a parent FK on all but `states`.',
            'Download the free sources: LGD for the hierarchy and codes, Census for town/village lists, an OpenStreetMap extract for coordinates.',
            'Write a one-off reconciliation script that joins them on names/codes and emits `insert` statements — parents before children.',
            'Seed Karnataka fully (all districts and taluks, coastal cities in detail) and every other state at state level only.',
            'Commit the generated seed as a migration so the whole team gets the same place data with one command.',
          ],
          code: `-- Parent tables first. states has no parent FK.
create table states (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  lat        double precision,
  lng        double precision,
  created_at timestamptz default now()
);

create table districts (
  id         uuid primary key default gen_random_uuid(),
  state_id   uuid not null references states(id) on delete cascade,
  name       text not null,
  slug       text not null unique,
  lat        double precision,
  lng        double precision,
  created_at timestamptz default now()
);

create table taluks (
  id          uuid primary key default gen_random_uuid(),
  district_id uuid not null references districts(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  lat         double precision,
  lng         double precision,
  created_at  timestamptz default now()
);

create table cities (
  id         uuid primary key default gen_random_uuid(),
  taluk_id   uuid not null references taluks(id) on delete cascade,
  name       text not null,
  slug       text not null unique,
  lat        double precision,
  lng        double precision,
  created_at timestamptz default now()
);

-- Real seed for Udupi district. Parents already exist; we reference them
-- by slug via subqueries so the script needs no hardcoded uuids.
insert into states (name, slug, lat, lng)
values ('Karnataka', 'karnataka', 15.3173, 75.7139);

insert into districts (state_id, name, slug, lat, lng)
values (
  (select id from states where slug = 'karnataka'),
  'Udupi', 'udupi', 13.3409, 74.7421
);

insert into taluks (district_id, name, slug, lat, lng)
select d.id, v.name, v.slug, v.lat, v.lng
from districts d
cross join (values
  ('Kundapura', 'kundapura', 13.6257, 74.6912),
  ('Karkala',   'karkala',   13.2151, 74.9910),
  ('Udupi',     'udupi-taluk', 13.3409, 74.7421),
  ('Byndoor',   'byndoor',   13.8660, 74.6380),
  ('Brahmavara','brahmavara',13.4300, 74.7470),
  ('Hebri',     'hebri',     13.4700, 74.9800)
) as v(name, slug, lat, lng)
where d.slug = 'udupi';

-- A few cities under Kundapura taluk (coastal detail where our users are).
insert into cities (taluk_id, name, slug, lat, lng)
select t.id, v.name, v.slug, v.lat, v.lng
from taluks t
cross join (values
  ('Kundapura', 'kundapura-city', 13.6257, 74.6912),
  ('Gangolli',  'gangolli',       13.6470, 74.6720),
  ('Maravanthe','maravanthe',     13.7250, 74.6480),
  ('Kollur',    'kollur',         13.8640, 74.8090)
) as v(name, slug, lat, lng)
where t.slug = 'kundapura';`,
          pitfalls: [
            '**Inserting children before parents.** The foreign key rejects a taluk whose district row does not exist yet. Fix: always seed states → districts → taluks → cities, and reference parents by slug subquery so you never hardcode a uuid.',
            '**Hardcoding uuids in the seed file.** They differ between your machine and your teammate\'s reseed. Fix: reference parents with `(select id from districts where slug = ...)` so ids are resolved at insert time.',
            '**Trying to store district polygons for "accurate" containment.** That drags in PostGIS and gigabytes of geometry the course explicitly avoids. Fix: store one representative `lat`/`lng` per row; containment comes from foreign keys, not geometry.',
            '**Seeding all of India at city level up front.** Hundreds of thousands of villages blow past the 500 MB free-tier database and slow every query. Fix: full depth for Karnataka, state-level only elsewhere, expand on demand.',
            '**Forgetting a unique slug and shipping two "udupi" rows.** A district and a taluk are both named Udupi; identical slugs make URL routing ambiguous. Fix: disambiguate slugs (`udupi`, `udupi-taluk`) and enforce `unique`.',
          ],
          tryIt:
            'Kundapura is both a taluk and a city inside that taluk (the taluk headquarters). Look at the seed: the taluk slug is `kundapura` and the city slug is `kundapura-city`. Explain why they cannot share the slug `kundapura`, and what would break in the URL `/browse?place=kundapura` if they did. (Answer: the slug must resolve to exactly one row and one `kind`; a collision makes the lookup ambiguous.)',
          takeaway:
            'Four uniform tables, seeded parents-first from free LGD/Census/OpenStreetMap data reconciled offline. Karnataka full, the rest of India at state level, every row an `id`, `name`, `slug`, `lat`, `lng`, and a parent foreign key.',
        },
        {
          id: 'm8-t3',
          title: 'Autocomplete against your own tables, with the right indexes',
          explain:
            'A single UNION ALL view lets one query search all four levels at once, and the right index — a `text_pattern_ops` btree for prefix, a `pg_trgm` GIN for substring — makes it instant.',
          analogy:
            'The santhe (weekly market) has a single enquiry counter, not four. You do not walk to a separate desk for vegetables, cloth, and utensils — you ask one clerk "where is X?" and he knows the whole market. The `searchable_places` view is that one counter: the user types "kunda" and one query answers across states, districts, taluks, and cities together.',
          theory:
            'Users do not know or care whether "Kundapura" is a taluk or a city — they type a few letters and expect suggestions. So we present a single searchable surface across all four tables with a `UNION ALL` **view**, `searchable_places`. Each branch of the union normalises a table into the same columns: `id`, `kind` (`\'state\'`, `\'district\'`, `\'taluk\'`, `\'city\'`), `name`, a human-readable `display_path` ("Kundapura, Udupi, Karnataka"), `lat`, `lng`, and the resolved ancestry ids `state_id`, `district_id`, `taluk_id`, `city_id`. That last group is the gift: the view does the "walk up the hierarchy" for us, so a selected suggestion already carries every ancestor id the matching query will need.\n\nOne query now searches everything: `select * from searchable_places where name ilike \'kunda%\'`. But **a view has no indexes of its own** — it is just a stored query. The indexes must live on the **base tables**, and Postgres pushes the `where` down into each union branch. So you index `name` on all four tables, and the planner uses those indexes when it expands the view.\n\n**Prefix match vs substring match are two different index problems.** A prefix match — `name ilike \'kunda%\'`, "starts with kunda" — can use a plain **btree**, but only if you build it with `text_pattern_ops`, the operator class that makes btree understand `LIKE`/`ILIKE` prefix ranges. A default btree on text sorts by locale collation and will *not* be used for `LIKE`. So: `create index ... on cities (lower(name) text_pattern_ops)` and query `lower(name) like \'kunda%\'`. That turns a prefix search into an index range scan.\n\nA **substring** match — `name ilike \'%kunda%\'`, "contains kunda anywhere" — a btree cannot help with at all, because there is no range for "anywhere". For that you enable the **`pg_trgm`** extension (built into Supabase, no card) and build a **GIN index** with `gin_trgm_ops`. Trigrams break each name into overlapping three-character chunks and index those, so `%kunda%` becomes a fast index lookup instead of a full scan.\n\nWhich do you want? For autocomplete, **prefix is the right default** — people type the start of a place name — and it is cheaper. Offer substring as a fallback for when prefix finds nothing. And on the client, **debounce at 250ms** (the `useDebounce` hook from Module 6): do not fire a query on every keystroke, fire it 250ms after the user stops typing. Own tables plus a debounce plus the right index is what makes autocomplete feel instant with zero external calls. Run `explain analyze` on both queries and read the plan line — "Index Scan using ..." is what you are looking for; "Seq Scan" means your index is wrong or unused.',
          diagram: `graph TD
    Q["User types 'kunda'"] --> DEB[useDebounce 250ms]
    DEB --> V[[searchable_places view<br/>UNION ALL of 4 tables]]
    V --> B1[states.name index]
    V --> B2[districts.name index]
    V --> B3[taluks.name index]
    V --> B4[cities.name index]
    B1 --> R["Suggestions:<br/>Kundapura (taluk), Udupi<br/>Kundapura (city), Kundapura, Udupi"]
    B2 --> R
    B3 --> R
    B4 --> R
    R --> SEL["Selected row already carries<br/>state_id, district_id, taluk_id, city_id"]`,
          flowExplain:
            'The debounce guards the database from per-keystroke queries; the view fans one query across four indexed tables; and the row the user picks already contains the full ancestry, so the matching query in section 3 needs no extra lookups.',
          whyItMatters:
            '"How did you make search-as-you-type fast without a paid autocomplete API?" is a concrete interview question with a concrete answer: a UNION ALL view over four owned tables, a `text_pattern_ops` btree for the prefix case, a `pg_trgm` GIN index for substrings, and a 250ms debounce on the client. Being able to read an `explain analyze` plan and point at "Index Scan" versus "Seq Scan" is what separates "I used an index" from "I verified the index was used".',
          steps: [
            'Create the `searchable_places` view as a UNION ALL of the four tables, normalised to the same columns including the ancestry ids.',
            'On each base table, create a prefix index: `create index on <table> (lower(name) text_pattern_ops)`.',
            'Enable `pg_trgm` and add a GIN index per table for the substring fallback: `create index using gin (name gin_trgm_ops)`.',
            'Query prefix with `lower(name) like \'kunda%\'`; only fall back to `name ilike \'%kunda%\'` when prefix returns nothing.',
            'Debounce the input at 250ms on the client, and run `explain analyze` on both queries to confirm you see Index Scan, not Seq Scan.',
          ],
          code: `-- One searchable surface across all four levels.
create view searchable_places as
  select s.id, 'state'::text as kind, s.name,
         s.name as display_path,
         s.lat, s.lng,
         s.id as state_id, null::uuid as district_id,
         null::uuid as taluk_id, null::uuid as city_id
  from states s
  union all
  select d.id, 'district', d.name,
         d.name || ', ' || s.name,
         d.lat, d.lng,
         s.id, d.id, null::uuid, null::uuid
  from districts d
  join states s on s.id = d.state_id
  union all
  select t.id, 'taluk', t.name,
         t.name || ', ' || d.name || ', ' || s.name,
         t.lat, t.lng,
         s.id, d.id, t.id, null::uuid
  from taluks t
  join districts d on d.id = t.district_id
  join states s on s.id = d.state_id
  union all
  select c.id, 'city', c.name,
         c.name || ', ' || t.name || ', ' || d.name || ', ' || s.name,
         c.lat, c.lng,
         s.id, d.id, t.id, c.id
  from cities c
  join taluks t on t.id = c.taluk_id
  join districts d on d.id = t.district_id
  join states s on s.id = d.state_id;

-- Indexes live on the BASE tables; a view has none of its own.
-- Prefix ("starts with"): btree needs text_pattern_ops to serve LIKE.
create index cities_name_prefix   on cities   (lower(name) text_pattern_ops);
create index taluks_name_prefix   on taluks   (lower(name) text_pattern_ops);
create index districts_name_prefix on districts (lower(name) text_pattern_ops);
create index states_name_prefix   on states   (lower(name) text_pattern_ops);

-- Substring ("contains"): trigram GIN. pg_trgm ships with Supabase.
create extension if not exists pg_trgm;
create index cities_name_trgm on cities using gin (name gin_trgm_ops);
create index taluks_name_trgm on taluks using gin (name gin_trgm_ops);

-- PREFIX plan: an index range scan.
explain analyze
select * from searchable_places
where lower(name) like 'kunda%'
order by kind limit 8;
--  ...Index Scan using cities_name_prefix... rows=2 ...  (<1 ms)

-- SUBSTRING plan: a trigram GIN lookup, not a Seq Scan.
explain analyze
select * from searchable_places
where name ilike '%kunda%'
limit 8;
--  ...Bitmap Index Scan on cities_name_trgm... (fast, no Seq Scan)`,
          pitfalls: [
            '**Building a plain btree on `name` and expecting `LIKE` to use it.** A default text btree sorts by collation and Postgres will not use it for `LIKE \'kunda%\'`. Fix: build it with `text_pattern_ops` (and index `lower(name)` so it is case-insensitive).',
            '**Using an `ilike \'%kunda%\'` substring search for the common case.** A leading `%` cannot use a btree and forces trigrams or a scan on every keystroke. Fix: make prefix (`kunda%`) the default and only fall back to substring when prefix is empty.',
            '**Trying to `create index` on the view.** A view is a stored query and cannot be indexed. Fix: index the four base tables; the planner pushes the `where` down into each union branch.',
            '**Firing a query on every keystroke.** Ten characters is ten queries and a janky input. Fix: debounce at 250ms with `useDebounce` so one query runs after the user pauses.',
            '**Trusting that "it feels fast" means the index is used.** On 50 seeded rows a Seq Scan is also instant. Fix: run `explain analyze` and confirm the plan says Index Scan; a wrong index only reveals itself at scale.',
          ],
          tryIt:
            'Run `explain analyze select * from searchable_places where name ilike \'%pura%\'` before and after creating the `pg_trgm` GIN indexes. Read the first line of each plan. (Before: "Seq Scan". After: "Bitmap Index Scan on ..._name_trgm".) That one-line change is the whole lesson.',
          takeaway:
            'One UNION ALL view searches all four levels; a `text_pattern_ops` btree serves prefix, a `pg_trgm` GIN serves substring, indexes live on base tables, and a 250ms debounce keeps the database calm. Verify with `explain analyze`.',
        },
      ],
    },
    {
      id: 'm8-s2',
      title: 'A geocoding provider you can swap',
      topics: [
        {
          id: 'm8-t4',
          title: 'The provider interface: one file per external dependency',
          explain:
            'Every geocoder — our own Postgres, Nominatim, Google, a test mock — implements the same three-function interface, and an env var chooses which one is live.',
          analogy:
            'A temple kitchen has one serving hatch and one set of vessels, whoever is cooking that day. The cook changes for the festival, but the hatch, the ladle, and the plate stay identical, so the servers never learn a new routine. Our provider interface is that hatch: `search`, `reverse`, `getPlace` — the rest of the app calls those three and never knows which cook is behind the wall.',
          theory:
            'An external dependency you scatter across thirty files is an external dependency you can never remove. So we do the opposite: every geocoding backend implements **one interface**, and the app talks only to that interface. The contract is three functions — `search(query)` (free-text or prefix to a list of places), `reverse(lat, lng)` (coordinates to the nearest place), and `getPlace(id)` (an id back to a full place). Every provider — `postgresProvider`, `nominatimProvider`, `googleProvider`, and a `mockProvider` for tests — exports exactly those three.\n\n`services/geocoding/provider.js` is the switchboard. It imports each implementation, keys them by name, reads `import.meta.env.VITE_GEOCODING_PROVIDER`, and exports the chosen one as `geocoder`. Default to `postgres` — our own tables — because that is the card-free, rate-limit-free path that handles the overwhelming majority of queries. Flip one env var to try Nominatim or Google; no other file changes.\n\nWhy is this worth a whole topic? Two payoffs. **First, the external world becomes one file.** When Nominatim changes its response shape, or you decide to add Photon, or Google deprecates an endpoint, you edit one file under `services/geocoding/` and the pages, hooks, and matching query are untouched. That is the dependency rule from Module 1 — `pages → hooks → services → supabase` — applied to a third party. **Second, tests get a mock for free.** Because the interface is three functions, a `mockProvider` that returns canned places is ten lines, and every component that searches can be tested with zero network, zero key, and deterministic data. An interface is not ceremony; it is what makes the untestable testable.\n\nThe shape each provider returns is normalised — the same place object regardless of backend — so a component rendering a suggestion list does not branch on which provider produced it. Normalising at the provider boundary is the same discipline as mapping `snake_case` to `camelCase` at the service boundary: translate once, at the edge, so the inside of the app speaks one language.',
          diagram: `graph TD
    subgraph app[The app calls only the interface]
      HOOK[useGeolocation / search box]
    end
    HOOK --> IFACE{{"geocoder\\nsearch(q) · reverse(lat,lng) · getPlace(id)"}}
    IFACE -.VITE_GEOCODING_PROVIDER.-> PG[postgresProvider<br/>our own tables · DEFAULT]
    IFACE -.-> NM[nominatimProvider<br/>OpenStreetMap · free · no card]
    IFACE -.-> GG[googleProvider<br/>optional · CARD-GATED]
    IFACE -.-> MK[mockProvider<br/>canned data · tests]
    PG --> DB[(Postgres)]
    NM --> OSM[nominatim.openstreetmap.org]
    GG --> GAPI[Google Maps Platform]`,
          flowExplain:
            'The app depends on the box in the middle, never on any box below it. Swapping the live provider is one env var; adding a new one is one file; testing is the `mockProvider` branch that touches no network at all.',
          whyItMatters:
            'The brief demanded Google Places and a zero-card constraint, which conflict. An interface is how a senior engineer holds both: ship the free provider as the default, leave the card-gated one as a one-file swap, and let tests run on a mock. "I put the external dependency behind an interface" is the answer that turns a conflict into a configuration.',
          steps: [
            'Define the contract: every provider exports `search(query)`, `reverse(lat, lng)`, and `getPlace(id)`, all returning the same normalised place shape.',
            'Write `provider.js` to import each implementation, key them by name, and export the one named by `VITE_GEOCODING_PROVIDER` (default `postgres`).',
            'Implement `postgresProvider` first — it is the default and needs no key or card.',
            'Add `nominatimProvider` for the free-text and reverse cases the tables miss; leave `googleProvider` as an optional swap.',
            'Write a `mockProvider` returning canned places, and point tests at it so components can be tested with no network.',
          ],
          code: `// services/geocoding/provider.js
// The switchboard. The rest of the app imports { geocoder } from here.
import { postgresProvider } from './postgresProvider';
import { nominatimProvider } from './nominatimProvider';
import { googleProvider } from './googleProvider';
import { mockProvider } from './mockProvider';

const providers = {
  postgres: postgresProvider,
  nominatim: nominatimProvider,
  google: googleProvider,
  mock: mockProvider,
};

// Default to our own tables: card-free, rate-limit-free, offline-capable.
const chosen = import.meta.env.VITE_GEOCODING_PROVIDER || 'postgres';

export const geocoder = providers[chosen] || postgresProvider;

// The contract every provider satisfies:
//   search(query)      -> Promise<Place[]>
//   reverse(lat, lng)  -> Promise<Place | null>
//   getPlace(id)       -> Promise<Place | null>
//
// A normalised Place, whatever the backend:
//   { id, kind, name, displayPath, lat, lng,
//     stateId, districtId, talukId, cityId }

// services/geocoding/postgresProvider.js  (the default)
import { supabase } from '../../supabase/client';

const toPlace = (r) => ({
  id: r.id, kind: r.kind, name: r.name, displayPath: r.display_path,
  lat: r.lat, lng: r.lng,
  stateId: r.state_id, districtId: r.district_id,
  talukId: r.taluk_id, cityId: r.city_id,
});

export const postgresProvider = {
  async search(query) {
    const { data, error } = await supabase
      .from('searchable_places')
      .select('*')
      .ilike('name', \`\${query}%\`)   // prefix; hits the text_pattern_ops index
      .limit(8);
    if (error) throw new Error(\`Place search failed: \${error.message}\`);
    return data.map(toPlace);
  },
  async reverse(lat, lng) {
    const { data, error } = await supabase
      .rpc('nearest_city', { p_lat: lat, p_lng: lng });
    if (error) throw new Error(\`Reverse geocode failed: \${error.message}\`);
    return data?.[0] ? toPlace(data[0]) : null;
  },
  async getPlace(id) {
    const { data, error } = await supabase
      .from('searchable_places').select('*').eq('id', id).single();
    if (error) throw new Error(\`getPlace failed: \${error.message}\`);
    return toPlace(data);
  },
};`,
          pitfalls: [
            '**Calling `fetch(\'https://nominatim...\')` directly inside a component.** Now the external dependency is welded into the UI and cannot be swapped or mocked. Fix: every geocoding call goes through `geocoder`, and only `services/geocoding/` knows a provider exists.',
            '**Returning each provider\'s raw response shape.** Then components branch on Google vs Nominatim field names. Fix: normalise to one `Place` object at the provider boundary, exactly like the service-layer camelCase mapping.',
            '**Selecting the provider with an `if (env === \'google\')` scattered in callers.** That defeats the interface. Fix: the single switch lives in `provider.js`; callers import `geocoder` and never name a provider.',
            '**Forgetting a `mockProvider`.** Without it, every search test needs a live network or a fragile fetch stub. Fix: ten lines of canned places make every location-dependent component deterministically testable.',
            '**Defaulting to a card-gated provider.** If `googleProvider` were the default, a fresh clone would fail on a missing key. Fix: default to `postgres`, which needs nothing, so the app runs on first `git clone` with no setup.',
          ],
          tryIt:
            'Write the entire `mockProvider` in your head: `search` returns a two-element array of canned `Place` objects for any query, `reverse` returns the Kundapura place, `getPlace` returns whichever id matches. Roughly how many lines is it? (Under fifteen — and that is the payoff of the interface: the untestable becomes trivially testable.)',
          takeaway:
            'One interface — `search`, `reverse`, `getPlace` — one switch file chosen by an env var, one normalised place shape. The external world collapses to a single folder, the default needs no card, and tests get a mock for free.',
        },
        {
          id: 'm8-t5',
          title: 'nominatimProvider — OpenStreetMap\'s free geocoder, used politely',
          explain:
            'Nominatim geocodes free text and reverse-geocodes coordinates with no key and no card, in exchange for respecting a strict, low-volume usage policy.',
          analogy:
            'Nominatim is the neighbour with the borewell who lets the whole lane draw water for free — on the understanding that you fill one pot at a time, you say who you are, and you do not run a pipe to sell it. Abuse the goodwill and the tap gets locked. Use it once, politely, when your own tank is empty, and it is there for years.',
          theory:
            'Nominatim is the geocoder behind OpenStreetMap. It has a public endpoint that needs **no API key and no credit card** — which is exactly why it fits NFR N1 where Google Places does not. But "free" here comes with a **usage policy you must honour**, because the public server is a shared community resource, not a product you paid for.\n\nThe policy, in practical terms: a **maximum of roughly one request per second**; a descriptive **`User-Agent`** (and, from a browser, a truthful `Referer`) so they can identify traffic; **no bulk scraping** or systematic downloading; and **attribution** to OpenStreetMap wherever you show results. Break these and your IP gets blocked — quietly, and for everyone sharing it. So Nominatim is never our high-frequency autocomplete backend. Our own Postgres tables handle every keystroke; Nominatim is the **fallback for the two cases the tables cannot serve**: a genuine free-text query for a place we did not seed, and **reverse geocoding for "Near me"**, which happens once per session at most.\n\nOne honest browser caveat: `User-Agent` is a **forbidden header** in the Fetch API — the browser sets it and JavaScript cannot override it. What the browser *does* send automatically is a `Referer` with your site\'s origin, which is the identification Nominatim actually sees from web clients. If you ever move geocoding server-side (an Edge Function), *there* you set a descriptive `User-Agent`. From the browser, send `Accept-Language`, keep volume to once-per-session, and rely on the automatic `Referer`. Being precise about this is the difference between cargo-culting a header and understanding the constraint.\n\n**Photon** (built on OpenStreetMap data, run by Komoot) is a drop-in alternative with a more autocomplete-friendly API and its own free public endpoint under similar politeness rules. Because both sit behind our provider interface, choosing Photon over Nominatim is a one-file change. **Cache every response.** A `Map` keyed by the query string means the second identical lookup costs nothing and never touches the network — which respects the rate policy and makes repeat searches instant. The pattern is: try our tables first, fall back to Nominatim only on a miss, cache whatever comes back.',
          diagram: `graph TD
    Q[Query or lat/lng] --> OWN{Our own tables<br/>have it?}
    OWN -- yes --> DONE[Return from Postgres<br/>instant · unlimited]
    OWN -- no --> C{In cache?}
    C -- yes --> HIT[Return cached response]
    C -- no --> RATE[Respect: 1 req/sec max<br/>Accept-Language header<br/>browser sends Referer]
    RATE --> NM[nominatim.openstreetmap.org]
    NM --> STORE[Cache the response]
    STORE --> ATTR[Show OpenStreetMap attribution]`,
          flowExplain:
            'Nominatim is only ever reached after a miss on both our tables and the cache. That ordering is what keeps a free community service free: almost every request is answered before it ever leaves your database.',
          whyItMatters:
            'Rate-limit and acceptable-use policies are real operational constraints, and mishandling them gets your production IP blocked at the worst moment. "I used Nominatim only for once-per-session reverse geocoding, cached every response, and let our own tables absorb the autocomplete volume" is the answer that shows you can consume a free resource without abusing it.',
          steps: [
            'Use Nominatim only for free-text queries the tables miss and for once-per-session reverse geocoding — never for per-keystroke autocomplete.',
            'Send `Accept-Language` and `countrycodes=in`; rely on the browser\'s automatic `Referer` since `User-Agent` cannot be set from the browser.',
            'Keep volume under ~1 request/second and never loop the endpoint.',
            'Cache every response in a `Map` keyed by the query so repeats never hit the network.',
            'Show OpenStreetMap attribution wherever Nominatim results appear, and note Photon as a one-file alternative behind the same interface.',
          ],
          code: `// services/geocoding/nominatimProvider.js
const BASE = 'https://nominatim.openstreetmap.org';
const cache = new Map();   // query -> normalised result. Respects the rate policy.

const toPlace = (r) => ({
  id: \`osm:\${r.osm_type}:\${r.osm_id}\`,
  kind: 'external',
  name: r.name || r.display_name.split(',')[0],
  displayPath: r.display_name,
  lat: Number(r.lat), lng: Number(r.lon),
  stateId: null, districtId: null, talukId: null, cityId: null,
});

async function getJson(url) {
  if (cache.has(url)) return cache.get(url);
  // NOTE: User-Agent is a forbidden header in the browser Fetch API — it is
  // set by the browser, not by us. The browser sends a truthful Referer,
  // which is the identification Nominatim sees from web clients.
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  if (!res.ok) throw new Error(\`Nominatim \${res.status}\`);
  const json = await res.json();
  cache.set(url, json);
  return json;
}

export const nominatimProvider = {
  // Only for free-text places our own tables did not seed.
  async search(query) {
    const url = \`\${BASE}/search?format=jsonv2&addressdetails=1\`
      + \`&countrycodes=in&limit=5&q=\${encodeURIComponent(query)}\`;
    const rows = await getJson(url);
    return rows.map(toPlace);
  },
  // Only for "Near me" — once per session at most.
  async reverse(lat, lng) {
    const url = \`\${BASE}/reverse?format=jsonv2&lat=\${lat}&lon=\${lng}\`;
    const row = await getJson(url);
    return row && row.lat ? toPlace(row) : null;
  },
  async getPlace() {
    // Nominatim has no stable id lookup we rely on; the tables own getPlace.
    return null;
  },
};
// Attribution: show "© OpenStreetMap contributors" wherever these appear.
// Photon (komoot) is a drop-in alternative behind this same interface.`,
          pitfalls: [
            '**Pointing autocomplete at Nominatim.** Per-keystroke requests blow past ~1 req/sec instantly and get your IP blocked. Fix: autocomplete is our own tables; Nominatim is only the free-text and reverse fallback.',
            '**Trying to set a `User-Agent` header from browser `fetch`.** It is a forbidden header and is silently ignored. Fix: rely on the automatic `Referer` from the browser; set `User-Agent` only if you move geocoding to an Edge Function.',
            '**Not caching responses.** The same "Near me" reverse lookup fires every time the user reopens the sheet. Fix: a `Map` keyed by URL makes repeats free and keeps you well under the rate limit.',
            '**Omitting attribution.** OpenStreetMap\'s licence requires crediting contributors when you show their data. Fix: render "© OpenStreetMap contributors" beside any Nominatim/Photon result.',
            '**Looping Nominatim to bulk-geocode your seed data.** That is exactly the scraping the policy forbids. Fix: seed from LGD/Census/Geofabrik extracts offline; use the live endpoint only for one-off user queries.',
          ],
          tryIt:
            'You want to reverse-geocode 4,000 seed rows to fill their `lat`/`lng`. Explain why hammering Nominatim in a loop is the wrong tool, and name the right one. (Answer: it violates the no-bulk-scraping policy and the ~1 req/sec limit; use a downloaded OpenStreetMap/Geofabrik extract offline instead.)',
          takeaway:
            'Nominatim is free with no key and no card, in exchange for politeness: ~1 req/sec, truthful identification, attribution, no bulk scraping. Use it only for free-text misses and once-per-session reverse geocoding, cache everything, and let your own tables carry the volume.',
        },
        {
          id: 'm8-t6',
          title: 'googleProvider — taught honestly as optional and card-gated',
          explain:
            'Google Places is a complete, working provider you can swap in — but it requires an enabled billing account even for the free quota, so it fails the course\'s first constraint and is never the default.',
          analogy:
            'It is the premium stall at the santhe that gives you a "free sample" only after you leave your ATM card at the counter. The sample really is free, the produce really is excellent — but the card on the counter is the whole objection. You may choose to shop there; the course will not require you to hand over the card.',
          theory:
            'This topic is taught straight, without either boosterism or dismissiveness, because honesty about trade-offs is the skill. Google Maps Platform is genuinely excellent: high-quality autocomplete, worldwide coverage, structured `address_components`. And it **requires an enabled billing account — a credit card on file — even to consume the free monthly quota.** Google will not charge you inside the quota, but the card must be there. Under NFR N1 ("the test is not the price, it is whether the signup asks for a card") that is a fail. So `googleProvider` exists, works, and is **never the default**. You reach it only by deliberately setting `VITE_GEOCODING_PROVIDER=google` and supplying your own key.\n\nIf you do choose it, three things matter. **First, restrict the key.** A Maps key in a client bundle is public; lock it to your HTTP referrers (your Vercel domains) in the Cloud Console so a stolen key cannot be used from another site. **Second, use Autocomplete session tokens.** Google bills autocomplete-plus-details as a *session*: the keystrokes and the final "get details" call are one billable unit **only if** you pass a session token through them. Forget the token and every keystroke bills as an individual request — the classic surprise invoice. Generate a fresh token per search, pass it on every predictions call, pass it on the final details call, then discard it. **Third, parse and store the structured result.** Google returns `address_components`, each tagged with types; you extract country, `administrative_area_level_1` (state), `administrative_area_level_2` (district), the locality/taluk, and the city, plus `place_id`, lat, and lng. Store those so a Google-sourced place still resolves into the same ancestry ids the rest of the app expects.\n\nThe reason to show the **whole file** is the point of the entire section: swapping in Google is about **sixty lines**, not a rewrite, precisely because the provider interface already exists. Every hard part — where the key lives, how sessions are billed, how components are parsed — is contained in one file that the pages and the matching query never see. That containment is the payoff of topic t4 made concrete: even the card-gated, most-complex provider is a single swappable unit.',
          diagram: `graph TD
    START[User starts typing] --> TOK[Create ONE session token]
    TOK --> KEY{Keystrokes}
    KEY -->|token on every call| PRED[getPlacePredictions<br/>billed as session, not per key]
    PRED --> PICK[User picks a prediction]
    PICK -->|same token| DET[getDetails<br/>place_id + address_components + geometry]
    DET --> PARSE[Parse components:<br/>country · admin_area_1 state<br/>admin_area_2 district · city]
    PARSE --> DISCARD[Discard token]
    DISCARD --> STORE[Store place_id, lat, lng, ancestry]`,
          flowExplain:
            'The single session token threaded from the first keystroke through the final details call is what makes an unfinished search bill as one unit instead of many. Drop it and the meter runs per character.',
          whyItMatters:
            'Being able to say "Google Places works and here is exactly how I would integrate it — key restriction, session tokens, component parsing — but it fails our no-card constraint so it is behind the interface as an opt-in" demonstrates the two things interviews probe: you can integrate a real paid API correctly, and you can reason about when not to.',
          steps: [
            'Accept the verdict first: Maps Platform needs a billing account, so this is opt-in, never the default.',
            'If you opt in, create an API key and restrict it by HTTP referrer to your own domains.',
            'Generate one Autocomplete session token per search and pass it through every predictions call and the final details call.',
            'On selection, fetch details and parse `address_components` into country / state (`administrative_area_level_1`) / district (`administrative_area_level_2`) / city, plus `place_id`, lat, lng.',
            'Keep the entire integration in `googleProvider.js` so swapping it in or out is one env var and one file.',
          ],
          code: `// services/geocoding/googleProvider.js
// OPTIONAL. Requires a Google Maps key AND an enabled billing account
// (card on file) even for the free quota -> fails NFR N1. Not the default.
// Enable with VITE_GEOCODING_PROVIDER=google and VITE_GOOGLE_MAPS_KEY=...

let sdk;                         // the loaded google.maps.places namespace
let sessionToken;                // ONE token per search keeps billing per-session

async function ensureSdk() {
  if (sdk) return sdk;
  const { Loader } = await import('@googlemaps/js-api-loader');
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,   // restrict by referrer in Cloud Console
    libraries: ['places'],
  });
  await loader.load();
  sdk = window.google.maps.places;
  return sdk;
}

const pick = (components, type) =>
  components.find((c) => c.types.includes(type))?.long_name ?? null;

export const googleProvider = {
  async search(query) {
    const places = await ensureSdk();
    sessionToken = sessionToken || new places.AutocompleteSessionToken();
    const svc = new places.AutocompleteService();
    const { predictions } = await svc.getPlacePredictions({
      input: query,
      sessionToken,                       // WITHOUT this, every keystroke bills separately
      componentRestrictions: { country: 'in' },
    });
    return predictions.map((p) => ({
      id: p.place_id, kind: 'external', name: p.structured_formatting.main_text,
      displayPath: p.description, lat: null, lng: null,
      stateId: null, districtId: null, talukId: null, cityId: null,
    }));
  },

  async getPlace(placeId) {
    const places = await ensureSdk();
    const svc = new places.PlacesService(document.createElement('div'));
    const detail = await new Promise((resolve, reject) =>
      svc.getDetails(
        { placeId, sessionToken, fields: ['address_components', 'geometry'] },
        (r, status) => (status === 'OK' ? resolve(r) : reject(new Error(status))),
      ),
    );
    sessionToken = undefined;             // session ends; next search starts a new one
    const comp = detail.address_components;
    return {
      id: placeId, kind: 'external',
      name: pick(comp, 'locality') || pick(comp, 'administrative_area_level_2'),
      country: pick(comp, 'country'),
      state: pick(comp, 'administrative_area_level_1'),
      district: pick(comp, 'administrative_area_level_2'),
      city: pick(comp, 'locality'),
      lat: detail.geometry.location.lat(),
      lng: detail.geometry.location.lng(),
      stateId: null, districtId: null, talukId: null, cityId: null,
    };
  },

  async reverse() { return null; },       // use Nominatim (free) for "Near me"
};`,
          pitfalls: [
            '**Making Google the default provider.** A fresh clone with no key and no billing account breaks immediately, and you have shipped a card requirement into the core path. Fix: default to `postgres`; Google is an explicit opt-in.',
            '**Skipping the Autocomplete session token.** Each keystroke then bills as a separate Autocomplete request and an abandoned search still costs money. Fix: one token per search, threaded through predictions and details, discarded after.',
            '**Leaving the API key unrestricted.** A public bundle key can be lifted and run up a bill from any site. Fix: restrict by HTTP referrer to your Vercel domains in the Cloud Console.',
            '**Storing only the `place_id`.** A place_id alone gives you no ancestry, so containment still fails. Fix: parse `address_components` into state/district/city and store lat/lng too.',
            '**Believing "free quota" means "no card".** The quota is free; the billing account behind it needs a card regardless. Fix: apply the card test to the signup flow, not the pricing page — Maps Platform fails it.',
          ],
          tryIt:
            'Trace the billing for a user who types "kund", sees "Kundapura", but never clicks a prediction. With a session token, how many billable units is that? Without one? (With: effectively one abandoned session, often unbilled. Without: several individual Autocomplete requests — the surprise invoice.)',
          takeaway:
            'Google Places works and is sixty lines behind the interface, but Maps Platform needs a card even for the free quota, so it fails NFR N1 and is opt-in only. If you use it: restrict the key, use session tokens, parse `address_components`.',
        },
        {
          id: 'm8-t7',
          title: '"Near me" with navigator.geolocation, snapped to our tables',
          explain:
            'The browser\'s Geolocation API turns a device into a lat/lng, which we reverse-geocode once and snap to the nearest seeded city so "Near me" resolves to a real place in our hierarchy.',
          analogy:
            'A fisherman off Maravanthe knows his GPS coordinates but tells the auction "I am landing at Gangolli jetty" — he snaps his raw position to the named landing everyone recognises. "Near me" does the same: the browser hands you a bare lat/lng, and we snap it to the nearest city row so it slots into the same hierarchy every other search uses.',
          theory:
            '`navigator.geolocation.getCurrentPosition(success, error, options)` asks the browser for the device\'s location. Four realities shape how you use it. **It requires a secure context** — it only works over HTTPS (localhost is exempt for development), which is fine because Vercel serves HTTPS by default. **It is permission-gated** — the browser prompts the user, and you must handle three outcomes: granted, denied, and dismissed. **It is asynchronous and can hang** — so you pass `options`: `enableHighAccuracy` (GPS-grade vs coarse network location), `timeout` (give up after N ms instead of spinning forever), and `maximumAge` (accept a recently cached fix rather than forcing a fresh one). **And it can fail gracefully in known ways** — `PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT` — each of which your UI must turn into a calm message, never a dead spinner.\n\nWe wrap all of this in a `useGeolocation()` hook. It returns the course\'s standard `{ data, loading, error }` — plus one `request()` trigger, because unlike a data hook that fetches on mount, geolocation **must be user-initiated**: browsers reject a permission prompt that fires without a click. So the "Near me" button calls `request()`; the hook flips `loading`, calls `getCurrentPosition`, and resolves into `data` (a `{ lat, lng }`) or `error`.\n\nThen comes the important half: a raw `{ lat, lng }` is useless to our matching logic, which speaks in `state_id`/`district_id`/`taluk_id`/`city_id`. So we **reverse-geocode once** and **snap to the nearest city row in our own tables**. "Once" matters — reverse geocoding is the Nominatim call, and it is a once-per-session action, so it respects the rate policy. "Snap to our tables" matters more: we do not keep the raw coordinates as the search location, we find the closest seeded `cities` row (a small `km_between` query, which you build in the next section) and use *its* ancestry. Now "Near me" produces exactly the same shape as typing "Kundapura" — a place with full ancestry — and the entire matching query downstream does not care that this one came from GPS.\n\nThis is the same normalisation principle running through the whole module: whatever the source — typed prefix, free-text, Google, or GPS — collapse it, at the edge, into one place with `state_id`/`district_id`/`taluk_id`/`city_id`, so the hard matching logic in section 3 sees one clean input.',
          diagram: `graph TD
    BTN["User taps 'Near me'"] --> REQ[request called - must be user-initiated]
    REQ --> SEC{HTTPS secure context?}
    SEC -- no --> ERRH[error: geolocation needs HTTPS]
    SEC -- yes --> PROMPT{Browser permission prompt}
    PROMPT -- denied --> DEN[error: permission denied<br/>show 'type your area instead']
    PROMPT -- dismissed/timeout --> TMO[error: timed out<br/>options.timeout fired]
    PROMPT -- granted --> POS[getCurrentPosition -> lat/lng]
    POS --> REV[Reverse geocode ONCE<br/>Nominatim]
    REV --> SNAP[Snap to nearest cities row<br/>km_between in our tables]
    SNAP --> PLACE[A place with full ancestry<br/>same shape as a typed search]`,
          flowExplain:
            'Every branch except the rightmost ends in a calm, specific error message rather than a hung spinner. The success path deliberately does not stop at raw coordinates — it snaps to a seeded city so "Near me" feeds the matching query the same ancestry-carrying place a typed search would.',
          whyItMatters:
            'Geolocation is where beginners ship dead spinners: they handle success and forget denial, HTTPS, and timeout. Handling all four states, and knowing that a raw lat/lng must be snapped to your own hierarchy before it is useful, is the difference between a demo and a feature.',
          steps: [
            'Build `useGeolocation()` returning `{ data, loading, error }` plus a `request()` trigger, because the prompt must be user-initiated.',
            'Pass `options`: `enableHighAccuracy`, a `timeout` (e.g. 10s), and a `maximumAge` so a recent fix is reused.',
            'Handle all three failures — `PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT` — as specific, calm messages.',
            'On success, reverse-geocode the coordinates once via the Nominatim provider (respecting once-per-session).',
            'Snap the result to the nearest `cities` row with a small `km_between` query so "Near me" yields a place with full ancestry.',
          ],
          code: `// hooks/useGeolocation.js
// Returns the standard { data, loading, error } plus request(), because a
// geolocation prompt must be triggered by a user gesture, not fired on mount.
import { useState, useCallback } from 'react';

const MESSAGES = {
  1: 'Location permission was denied. Type your area instead.',
  2: 'Your location is unavailable right now. Type your area instead.',
  3: 'Finding your location took too long. Type your area instead.',
};

export function useGeolocation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError(new Error('This browser cannot share your location.'));
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setData({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(new Error(MESSAGES[err.code] || 'Could not get your location.'));
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return { data, loading, error, request };
}

// In the component: turn raw coordinates into a place in OUR hierarchy.
// import { geocoder } from '../services/geocoding/provider';
//
// const { data: coords, loading, error, request } = useGeolocation();
// useEffect(() => {
//   if (!coords) return;
//   // reverse() -> Nominatim once; then snap to nearest seeded city (RPC).
//   geocoder.reverse(coords.lat, coords.lng).then(setNearMePlace);
// }, [coords]);
//
// <button onClick={request} disabled={loading}>
//   {loading ? 'Locating...' : 'Near me'}
// </button>`,
          pitfalls: [
            '**Calling `getCurrentPosition` on mount.** Browsers reject a permission prompt with no user gesture, and users hate an unprompted location request. Fix: trigger it from a "Near me" click via `request()`.',
            '**Handling only the success callback.** Denial, unavailable, and timeout then leave a spinner forever. Fix: map all three error codes to specific messages and always clear `loading`.',
            '**Omitting `timeout`.** On a poor GPS fix the request spins indefinitely. Fix: set `timeout` (10s) so failure is bounded, and `maximumAge` so a fresh fix is not forced every time.',
            '**Using the raw lat/lng as the search location.** Matching speaks in ancestry ids, not coordinates. Fix: reverse-geocode once and snap to the nearest `cities` row so "Near me" carries a full hierarchy.',
            '**Assuming it works on your deployed HTTP preview.** Geolocation needs a secure context and silently no-ops off HTTPS. Fix: rely on Vercel\'s HTTPS; test on `localhost` (exempt) or the real domain, never a plain-HTTP host.',
          ],
          tryIt:
            'Deny the location permission in your browser, then click "Near me". Does your UI show a specific message ("permission denied — type your area instead") or an endless spinner? If it spins, your error branch is missing — wire all three `err.code` values before you call this feature done.',
          takeaway:
            '`navigator.geolocation` needs HTTPS, a user gesture, and handling of granted/denied/timeout. `useGeolocation()` returns `{ data, loading, error }` plus `request()`; reverse-geocode once and snap to the nearest seeded city so "Near me" feeds the matching query a place with full ancestry.',
        },
      ],
    },
    {
      id: 'm8-s3',
      title: 'Service areas and the matching query',
      topics: [
        {
          id: 'm8-t8',
          title: 'Six service-area types and the CHECK that enforces their shape',
          explain:
            'An artist\'s coverage is stored as rows in `artist_service_areas`, each of one of six types, with a CHECK constraint guaranteeing exactly the right columns are non-null for that type.',
          analogy:
            'The seva counter at Kollur temple has different forms for different offerings: an abhisheka form needs the deity and the time slot; an annadana form needs a head-count and a date; you cannot submit a half-filled form from the wrong category. The CHECK constraint is that rule made unbreakable: a "radius" service area must carry a centre and a distance, and a "district" one must carry a district id and nothing else — the database refuses any other shape.',
          theory:
            'A service area declares *where an artist works*, and there are six kinds. `country` — "Pan India", matches everything. `state` — "all of Karnataka". `district` — "all of Udupi district". `taluk` — "Kundapura taluk only". `city` — "Manipal only". And `radius` — "within N km of my studio", which is distance, not administrative boundary. These live in `artist_service_areas`, one row per declared area, so a single artist can hold several rows of mixed types.\n\nBecause the six types need different columns, the table is **deliberately sparse**: it has nullable `state_id`, `district_id`, `taluk_id`, `city_id`, `center_lat`, `center_lng`, and `radius_km`, and any given row uses only some of them. A `district` row fills `district_id` and leaves the rest null; a `radius` row fills `center_lat`/`center_lng`/`radius_km` and leaves the ids null; a `country` row fills none. Sparse columns are fine — what is *not* fine is letting a row be filled wrongly, because the matching query trusts that a row\'s type matches its columns.\n\nThat trust is enforced by a **CHECK constraint**, written as a `case` on `area_type`, that spells out for each type exactly which columns must be non-null and which must be null. This is the single most valuable line in the schema: it makes an inconsistent service area *unrepresentable*. You cannot insert a `radius` row with no `radius_km`; you cannot insert a `city` row that also carries a stray `center_lat`. The database rejects it. That is the same philosophy as RLS from Module 1 — put the guarantee in Postgres, where it cannot be forgotten — applied to data shape instead of access.\n\nEnforcing the invariant at write time means the read-time matching query in the next topics can be simple and fearless: it never has to defend against a malformed row, because malformed rows cannot exist. Cap `radius_km` in the same constraint (say 1–100 km) — an artist who genuinely serves more than 100 km should declare a district or state, not a giant circle, and the cap also makes the bounding-box prefilter in topic t12 a clean constant.',
          diagram: `graph TD
    ROW[artist_service_areas row] --> T{area_type}
    T -->|country| C[all id + geo cols NULL]
    T -->|state| S[state_id set · rest NULL]
    T -->|district| D[district_id set · rest NULL]
    T -->|taluk| TK[taluk_id set · rest NULL]
    T -->|city| CY[city_id set · rest NULL]
    T -->|radius| R[center_lat + center_lng + radius_km set<br/>all ids NULL · radius_km 1..100]
    C --> CHK[[CHECK constraint<br/>rejects any other shape]]
    S --> CHK
    D --> CHK
    TK --> CHK
    CY --> CHK
    R --> CHK`,
          flowExplain:
            'Every write funnels through the CHECK. A row whose filled columns do not match its `area_type` never reaches the table, so every reader downstream can assume the shape is correct.',
          whyItMatters:
            'A CHECK constraint that makes bad data unrepresentable is exactly what interviewers mean by "push invariants into the database". It is cheaper than validation code, cannot be bypassed by a direct insert, and lets every query that reads the table stop defending against shapes that can no longer occur.',
          steps: [
            'Define an enum `service_area_type` with the six values so `area_type` cannot hold a typo.',
            'Create `artist_service_areas` with nullable `state_id`/`district_id`/`taluk_id`/`city_id`/`center_lat`/`center_lng`/`radius_km`.',
            'Write a `case`-on-`area_type` CHECK naming, per type, exactly which columns are non-null and which are null.',
            'Cap `radius_km` (1–100 km) inside the constraint so radius areas stay sane and the bounding box stays a clean constant.',
            'Add the owner-only RLS policy (`artist_id` belongs to `auth.uid()`\'s artist) so only an artist edits their own areas.',
          ],
          code: `create type service_area_type as enum
  ('country', 'state', 'district', 'taluk', 'city', 'radius');

create table artist_service_areas (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references artists(id) on delete cascade,
  area_type   service_area_type not null,
  state_id    uuid references states(id),
  district_id uuid references districts(id),
  taluk_id    uuid references taluks(id),
  city_id     uuid references cities(id),
  center_lat  double precision,
  center_lng  double precision,
  radius_km   double precision,
  created_at  timestamptz default now(),

  -- The invariant, in full: exactly the right columns non-null per type.
  constraint service_area_shape check (
    case area_type
      when 'country' then
        state_id is null and district_id is null and taluk_id is null
        and city_id is null and center_lat is null and center_lng is null
        and radius_km is null
      when 'state' then
        state_id is not null and district_id is null and taluk_id is null
        and city_id is null and center_lat is null and center_lng is null
        and radius_km is null
      when 'district' then
        district_id is not null and taluk_id is null and city_id is null
        and center_lat is null and center_lng is null and radius_km is null
      when 'taluk' then
        taluk_id is not null and city_id is null
        and center_lat is null and center_lng is null and radius_km is null
      when 'city' then
        city_id is not null
        and center_lat is null and center_lng is null and radius_km is null
      when 'radius' then
        center_lat is not null and center_lng is not null
        and radius_km is not null and radius_km between 1 and 100
        and state_id is null and district_id is null
        and taluk_id is null and city_id is null
    end
  )
);

-- Owner-only writes: an artist manages only their own areas (Module 1 pattern).
alter table artist_service_areas enable row level security;
create policy "artists manage their own service areas"
  on artist_service_areas for all
  to authenticated
  using (artist_id in (select id from artists where user_id = auth.uid()))
  with check (artist_id in (select id from artists where user_id = auth.uid()));`,
          pitfalls: [
            '**Skipping the CHECK and validating shape only in React.** A direct PostgREST insert or a bug then writes a `radius` row with no `radius_km`, and the matching query silently misbehaves. Fix: the invariant lives in the CHECK, where nothing can bypass it.',
            '**Using a free-text `area_type` column.** "district", "District", and "distrct" become three types and the matching `where` misses rows. Fix: a Postgres `enum` makes an invalid type a write error.',
            '**Allowing an unbounded `radius_km`.** A 5,000 km "radius" is really "Pan India" wearing a costume, and it wrecks the bounding-box prefilter. Fix: cap it (1–100 km) in the CHECK and steer large coverage to administrative types.',
            '**One giant "coverage" JSON column instead of typed rows.** You lose foreign keys, the CHECK, and any hope of an OR-across-levels query. Fix: one typed row per area, with real FKs to the place tables.',
            '**Forgetting RLS on the table.** Then any signed-in user can edit any artist\'s coverage. Fix: an owner-only policy keyed through `artists.user_id = auth.uid()`, exactly as in Module 1.',
          ],
          tryIt:
            'Try to insert a `city` service area that also sets `center_lat = 13.6`. Predict what happens, then reason about why that is the behaviour you want. (The CHECK rejects it: a `city` row must have `center_lat` null. You want the rejection, because a matching query that trusts type-implies-columns must never meet a row that breaks the rule.)',
          takeaway:
            'Six service-area types, one sparse table, one CHECK constraint that makes every wrong shape unrepresentable. Enforce the invariant at write time and the matching query can read fearlessly.',
        },
        {
          id: 'm8-t9',
          title: 'The service-area picker UI',
          explain:
            'A React UI where an artist adds several service areas as chips, removes them, and is warned when a new area is redundant given one they already declared.',
          analogy:
            'A shopkeeper listing where he delivers writes each area on a slip and pins it to the board: "Kundapura", "Brahmavara", "all of Udupi", "25 km around the shop". If he then pins "Kundapura" again after already pinning "all of Udupi", a sensible assistant says "you already cover that". The picker is that assistant: it collects the slips as chips and quietly points out the redundant ones.',
          theory:
            'The picker lets an artist assemble a real coverage list — for example: *Pan Karnataka* **and** *Udupi district* **and** *Manipal* **and** *Kundapura* **and** *Brahmavara* **and** *within 25 km of my studio*. Each declared area is a **chip**: a small removable pill showing its type and place. Adding one uses the autocomplete from t3 (or the type selector for `country`/`radius`), removing one deletes its row. The state is just an array of areas; the UI is loading → empty ("No areas yet — add where you work") → error → data, in that order, per the Module 1 convention.\n\nThe interesting logic is **preventing redundant selections**. Because service areas OR together and each type contains the ones below it, some combinations add nothing. If an artist has already declared **Karnataka (state)**, then adding **Udupi (district)** changes no search result — Udupi is inside Karnataka, so any search Udupi would match, Karnataka already matches. Likewise **country** subsumes everything, and a **district** subsumes its **taluks** and **cities**. The picker should not silently block these (the artist might be mid-thought), but it should **warn**: "You already cover all of Karnataka, so adding Udupi changes nothing." That warning is computed client-side by walking the ancestry the autocomplete already gave you — remember, a selected place carries `state_id`/`district_id`/`taluk_id`/`city_id`, so "is this new area contained in an existing one?" is an array check, not a query.\n\nThe reverse redundancy is worth flagging too: adding **Karnataka** when the artist already has **Udupi** and **Kundapura** makes those two narrower chips redundant, and a thoughtful UI offers to remove them. Radius areas never subsume or get subsumed by administrative areas (a circle is not a district), so they are always kept as-is.\n\nEverything the picker does is presentation and light client logic; the actual writes go through `artistService` to `artist_service_areas`, and the CHECK from t8 is the backstop that guarantees whatever the UI sends is well-shaped. The UI improves the experience; the constraint guarantees the correctness. Never rely on the UI for the guarantee.',
          diagram: `graph TD
    ADD[Artist picks a place or type] --> RESOLVE[Resolve ancestry from autocomplete<br/>state_id / district_id / taluk_id / city_id]
    RESOLVE --> CHECK{Contained in an<br/>area already declared?}
    CHECK -- yes --> WARN["Warn: 'You already cover this.<br/>Adding it changes nothing.'"]
    CHECK -- no --> WIDER{Does it subsume<br/>existing chips?}
    WIDER -- yes --> OFFER["Offer to remove now-redundant chips"]
    WIDER -- no --> ADDCHIP[Add chip]
    WARN --> ADDCHIP
    OFFER --> ADDCHIP
    ADDCHIP --> SAVE[artistService -> artist_service_areas<br/>CHECK constraint validates shape]`,
          flowExplain:
            'Redundancy is detected purely from the ancestry ids the autocomplete already returned — no extra query — and the CHECK constraint at the bottom is the real guarantee; the warnings above it are courtesy, not correctness.',
          whyItMatters:
            'A picker that lets an artist declare overlapping areas without a word produces confusing coverage and duplicate matches. Detecting containment redundancy in the UI — while leaning on the database CHECK for the hard guarantee — is a clean example of "UI for experience, database for correctness", a distinction interviewers listen for.',
          steps: [
            'Model picker state as an array of area objects, each with a `type` and its resolved ancestry ids (or centre/radius).',
            'Render each area as a removable chip; ship loading → empty → error → data states for the list.',
            'On add, compute containment against existing areas from the ancestry ids and warn if the new area is already covered.',
            'When a wider area is added, offer to remove the now-redundant narrower chips (never force it).',
            'Persist through `artistService`; trust the t8 CHECK constraint to reject any malformed shape the UI might send.',
          ],
          code: `// components/ServiceAreaPicker/redundancy.js  (pure helpers, unit-testable)

// Is 'candidate' already covered by any area in 'existing'?
export function isRedundant(candidate, existing) {
  return existing.some((a) => covers(a, candidate));
}

// Does area A cover area B? (A is wider or equal.)
function covers(a, b) {
  if (a.type === 'country') return true;                 // country covers all
  if (a.type === 'state')    return b.stateId === a.stateId
    && b.type !== 'country';
  if (a.type === 'district') return b.districtId === a.districtId
    && ['district', 'taluk', 'city'].includes(b.type);
  if (a.type === 'taluk')    return b.talukId === a.talukId
    && ['taluk', 'city'].includes(b.type);
  if (a.type === 'city')     return b.type === 'city' && b.cityId === a.cityId;
  return false;                                          // radius covers nothing here
}

// Which existing chips does a newly added wider area make redundant?
export function nowRedundant(added, existing) {
  return existing.filter((a) => covers(added, a));
}

// components/ServiceAreaPicker/ServiceAreaPicker.jsx  (sketch)
// const [areas, setAreas] = useState([]);
//
// function handleAdd(candidate) {
//   if (isRedundant(candidate, areas)) {
//     setNotice('You already cover this area. Adding it changes nothing.');
//   }
//   const shadowed = nowRedundant(candidate, areas);
//   if (shadowed.length) {
//     setNotice(\`Adding this makes \${shadowed.length} narrower area(s) redundant.\`);
//   }
//   setAreas((prev) => [...prev, candidate]);      // keep, then persist via service
// }
//
// {areas.length === 0
//   ? <EmptyState label="No service areas yet. Add where you work." />
//   : areas.map((a) => (
//       <Chip key={a.key} label={labelFor(a)}
//             onRemove={() => setAreas((p) => p.filter((x) => x !== a))} />
//     ))}`,
          pitfalls: [
            '**Blocking redundant additions outright.** The artist may be reorganising and briefly wants both. Fix: warn, do not forbid — the OR-matching makes a redundant area harmless, just pointless.',
            '**Computing containment with an extra database round-trip per add.** The autocomplete already returned the ancestry ids. Fix: check redundancy from data you hold, in a pure function you can unit-test.',
            '**Treating a radius area as subsuming a district (or vice versa).** A circle and an administrative boundary are not comparable. Fix: `covers()` returns false for any radius comparison; keep radius areas independent.',
            '**Relying on the UI to guarantee valid shapes.** A stale client or a direct API call can still send garbage. Fix: the t8 CHECK is the guarantee; the picker is only the pleasant path to it.',
            '**Skipping the empty state.** A brand-new artist sees a blank box and does not know to add anything. Fix: an explicit "No service areas yet — add where you work" with an add button.',
          ],
          tryIt:
            'An artist has chips: Karnataka (state) and 25 km around their studio. They add Udupi (district). What should the picker say, and which chip(s), if any, does it offer to remove? (Answer: warn that Karnataka already covers Udupi so it changes nothing; offer to remove nothing — the radius is independent and Udupi is the redundant newcomer, not a subsumer.)',
          takeaway:
            'The picker collects service areas as removable chips and warns on containment redundancy using ancestry ids it already holds. UI for experience, the t8 CHECK for correctness — never confuse the two.',
        },
        {
          id: 'm8-t10',
          title: 'Containment matching: walk up, then OR across every level',
          explain:
            'Resolve the searched place to its full ancestry by walking up the hierarchy, then match artists whose service area is ANY of those levels — OR, never AND, at every ancestor.',
          analogy:
            'A postman delivering to a house in Kundapura does not check one label — he accepts the parcel if it is addressed to this house, OR this street, OR Kundapura, OR Udupi district, OR Karnataka, OR India. Any correct level of address gets it delivered. Match an artist the same way: they serve this searcher if their declared area is the searcher\'s city, OR taluk, OR district, OR state, OR the whole country. One match at any level is enough.',
          theory:
            'This is the heart of the module. A user searches for **Kundapura**. To match artists, you must first know Kundapura\'s **full ancestry**: it is a taluk, inside Udupi district, inside Karnataka, inside India. So step one is to **walk up the hierarchy** from the searched place, resolving `{ state_id, district_id, taluk_id, city_id }`. If the search resolved to a city, you join `cities → taluks → districts` to read every ancestor id; if it resolved to a taluk (as Kundapura does), `taluk_id` is set and `city_id` is null. The `searchable_places` view from t3 already did this walk for you — the selected suggestion carries all four ids — but when you only have a bare `city_id` or `taluk_id`, the join below recovers the rest.\n\nStep two is the match, and here is the rule that beginners get wrong almost every time: **combine the levels with OR, never AND.** An artist matches the Kundapura search if **any single one** of these holds: they declared `country` (Pan India), OR `state` with `state_id` = Karnataka, OR `district` with `district_id` = Udupi, OR `taluk` with `taluk_id` = Kundapura, OR `city` with `city_id` = (a Kundapura city). Write AND and you demand an artist have declared *all* of those, which essentially no one has, and the search returns nobody.\n\nAnd you must match at **every ancestor level**, not just the exact level searched. This is the second classic bug. If you search "Kundapura" and match only `area_type = \'taluk\'`, you correctly find the artist who declared Kundapura taluk — and you silently **hide every Pan-India artist, every Karnataka artist, and every Udupi-district artist**, all of whom genuinely serve Kundapura. Containment means: the searched place is served by anyone covering it *or any of its ancestors*. Miss a level and coverage vanishes. Hammer this: OR across levels, and match at every level from the searched place all the way up to `country`.\n\nThe SQL is one `select` joining `artists` to `artist_service_areas`, with the OR-chain in the `where`, ending in `distinct` because an artist who declared both "Karnataka" and "Kundapura" would otherwise appear twice. Below is the full query, with the ancestry-resolution CTE included so it runs from nothing but a `city_id`.',
          diagram: `graph TD
    S["Search: Kundapura"] --> W[Walk UP the hierarchy]
    W --> L1["city_id (if a city)"]
    W --> L2["taluk_id = Kundapura"]
    W --> L3["district_id = Udupi"]
    W --> L4["state_id = Karnataka"]
    W --> L5["country (implicit)"]
    L1 --> OR{Match if service area is<br/>ANY of these levels}
    L2 --> OR
    L3 --> OR
    L4 --> OR
    L5 --> OR
    OR --> A1["Pan-India artist ✓"]
    OR --> A2["Karnataka artist ✓"]
    OR --> A3["Udupi-district artist ✓"]
    OR --> A4["Kundapura-taluk artist ✓"]
    OR --> RES["distinct artists"]`,
          flowExplain:
            'Read the fan-out: one searched place resolves to five levels, and an artist matches on ANY of them. Drop the `country`/`state`/`district` branches and A1–A3 disappear even though they truly serve Kundapura — which is exactly the "match at every level" bug.',
          whyItMatters:
            'This query is the feature interviewers ask about, and the two failure modes — AND instead of OR, and matching only the exact level — are the exact mistakes they are listening for you to avoid. Explaining "an Udupi-district artist must surface for a Kundapura search because Kundapura is contained in Udupi, so I OR across every ancestor level" demonstrates you understood containment, not just SQL.',
          steps: [
            'Resolve the searched place to `{ state_id, district_id, taluk_id, city_id }` by walking up the hierarchy (or read them straight off the `searchable_places` row).',
            'Join `artists` to `artist_service_areas` on `artist_id`.',
            'In the `where`, OR together one branch per level: `country`, `state`, `district`, `taluk`, `city`.',
            'Match at every ancestor level, not only the level searched, or Pan-India and higher-level artists vanish.',
            'End with `distinct` so an artist who declared multiple covering areas appears once.',
          ],
          code: `-- Full containment match, runnable from just a searched city_id.
-- (When you search a taluk directly, pass its taluk_id and null city_id.)

with searched as (
  -- Walk UP: recover every ancestor id from the searched place.
  select
    c.id           as city_id,
    c.taluk_id     as taluk_id,
    t.district_id  as district_id,
    d.state_id     as state_id
  from cities c
  join taluks    t on t.id = c.taluk_id
  join districts d on d.id = t.district_id
  where c.id = :searched_city_id
)
select distinct a.id, a.display_name
from artists a
join artist_service_areas sa on sa.artist_id = a.id
cross join searched q
where a.is_published
  and (
        sa.area_type = 'country'                              -- Pan India
     or (sa.area_type = 'state'    and sa.state_id    = q.state_id)
     or (sa.area_type = 'district' and sa.district_id = q.district_id)
     or (sa.area_type = 'taluk'    and sa.taluk_id    = q.taluk_id)
     or (sa.area_type = 'city'     and sa.city_id     = q.city_id)
  );
--          ^^ OR, never AND. One matching level is enough,
--             and we test EVERY level from city up to country.
--
-- Search Kundapura and this returns:
--   the Pan-India artist   (matched sa.area_type = 'country')
--   the Karnataka artist   (matched sa.state_id)
--   the Udupi artist       (matched sa.district_id)
--   the Kundapura artist   (matched sa.taluk_id)
-- Replace the OR-chain with AND and it returns nobody.`,
          pitfalls: [
            '**Combining levels with AND.** It demands an artist declared every level at once, so the result is almost always empty. Fix: OR the levels — an artist matches if any one of their areas covers the search.',
            '**Matching only the exact level searched.** Search a taluk, match only `area_type = \'taluk\'`, and every Pan-India, state, and district artist who serves it disappears. Fix: match at every ancestor level up to `country`.',
            '**Forgetting `distinct`.** An artist who declared both "Karnataka" and "Kundapura" matches two branches and appears twice. Fix: `select distinct` (or group by the artist id).',
            '**Comparing place names instead of ids in the OR-chain.** "Udupi" the district and "Udupi" the taluk collide, and case differences break equality. Fix: match on the resolved `*_id` foreign keys, never on names.',
            '**Assuming the searched place always resolves to a city.** Users often search a taluk or district directly. Fix: accept whichever level was searched and null the deeper ids; the OR-chain handles a null `city_id` cleanly.',
          ],
          tryIt:
            'Artist X declared only "Udupi district". A user searches "Kundapura" (a taluk in Udupi). Walk the query by hand: which OR branch matches X, and what would happen to X if you had written `and` between the branches or matched only `area_type = \'taluk\'`? (Answer: the `district` branch matches via `district_id`; with AND or taluk-only matching, X vanishes despite genuinely serving Kundapura.)',
          takeaway:
            'Resolve the searched place to its full ancestry, then match artists whose area is ANY level from the searched place up to `country`. OR, never AND; every level, not just one; `distinct` at the end.',
        },
        {
          id: 'm8-t11',
          title: 'Haversine without PostGIS: great-circle distance in plain SQL',
          explain:
            'The Haversine formula computes the distance between two lat/lng points across the curved surface of the Earth using ordinary trigonometry Postgres already has — no PostGIS required.',
          analogy:
            'Two fishing boats off Byndoor want the distance between them. They cannot lay a straight ruler through the sea — the Earth curves — so they measure along the surface, the way a rope would lie taut over a globe. Haversine is that taut rope: the shortest path along the sphere\'s skin, computed from two pairs of coordinates and the Earth\'s radius.',
          theory:
            'For `radius` service areas we need "how far is the searched point from the artist\'s studio?" On a flat map you would use Pythagoras, but the Earth is a sphere and degrees of longitude shrink as you move away from the equator, so flat distance is wrong. The correct measure is **great-circle distance**: the length of the shortest arc along the sphere\'s surface between two points.\n\nThe **Haversine formula** computes exactly that. In plain language: take the differences in latitude and longitude between the two points, convert them to radians (trig functions work in radians, and coordinates are in degrees), feed them through a specific combination of `sin` and `cos` that accounts for the curvature, take an `asin` and a `sqrt`, and multiply by the Earth\'s radius **R = 6371 km**. The middle term — `cos(lat1) · cos(lat2)` multiplying the longitude part — is what shrinks east-west distance as you leave the equator, which is the whole reason flat math fails. The output is a distance in kilometres (swap 6371 for 3959 to get miles).\n\nPostgres has every function this needs built in: `radians`, `sin`, `cos`, `asin`, `sqrt`, `power`. So we wrap Haversine in a SQL function `km_between(lat1, lng1, lat2, lng2)`, and we mark it **`immutable`** (same inputs always give the same output, so Postgres may cache and inline it and use it in indexes) and **`parallel safe`** (it touches nothing external, so parallel workers may run it). Those two markers are not decoration — `immutable` in particular is what lets the planner treat the function as a pure computation.\n\nBut here is the performance trap, and it is the one interviewers probe. A bare Haversine call in a `WHERE` clause — `where km_between(:lat, :lng, sa.center_lat, sa.center_lng) <= sa.radius_km` — **cannot use any index**. Why? An index sorts rows by stored column values; `km_between` is a computation over two columns and two constants that produces a different answer for every row, so there is no pre-sorted structure to seek into. Postgres has no choice but a **sequential scan**: read every row, run six trig operations on it, then test the threshold. On 50 seeded rows that is instant; on a full free-tier table it is slow trigonometry on every single row. The function is correct — it is just unindexable on its own. That is precisely why the next topic puts a cheap, *indexable* bounding-box filter in front of it, so the expensive exact distance runs on only a handful of survivors.',
          diagram: `graph TD
    P1["Point A (lat1, lng1)<br/>the searched place"] --> DIFF[Δlat, Δlng in radians]
    P2["Point B (lat2, lng2)<br/>the artist's studio"] --> DIFF
    DIFF --> HAV["haversine term:<br/>sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlng/2)"]
    HAV --> ARC["2 · asin( sqrt( term ) )"]
    ARC --> R["× R (6371 km)"]
    R --> KM[distance in km]
    KM -.->|bare call in WHERE| SEQ[[Sequential scan:<br/>trigonometry on EVERY row]]`,
          flowExplain:
            'The dotted branch is the warning: the formula is exact and cheap per row, but placed alone in a WHERE it forces a full scan, because a per-row computation has no index to seek into. That is the problem topic t12 solves.',
          whyItMatters:
            '"How did you do radius search without PostGIS?" has a precise answer — Haversine in a plain SQL function — and the follow-up, "why is that slow at scale?", separates people who copied a snippet from people who understand it: a per-row trig computation cannot use an index, so it scans the whole table.',
          steps: [
            'State the goal: great-circle distance between two lat/lng points, because the Earth is curved and flat distance is wrong.',
            'Convert degree differences to radians, combine with the sin/cos haversine term, take `asin`/`sqrt`, multiply by R = 6371 km.',
            'Wrap it as `km_between(lat1, lng1, lat2, lng2)` marked `immutable parallel safe`.',
            'Verify the result against a known pair (Udupi ↔ Kundapura ≈ 32 km) so you trust the function.',
            'Recognise that a bare `km_between` in a `WHERE` is a sequential scan, and that t12\'s bounding box is what rescues it.',
          ],
          code: `-- Great-circle distance in plain SQL. No PostGIS, no extension.
create or replace function km_between(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision
language sql
immutable            -- pure: same inputs -> same output. Lets the planner inline it.
parallel safe        -- touches nothing external. Parallel workers may run it.
as $$
  select 2 * 6371 * asin(sqrt(
      power(sin(radians(lat2 - lat1) / 2), 2)
    + cos(radians(lat1)) * cos(radians(lat2))
    * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;
-- 6371 = Earth's mean radius in km. Use 3959 for miles.

-- Sanity check against a known distance.
select round(km_between(13.3409, 74.7421,     -- Udupi
                        13.6257, 74.6912)) as udupi_to_kundapura_km;
--  udupi_to_kundapura_km
-- -----------------------
--                    32          <- matches reality; the function is trustworthy.

-- The trap: this WHERE cannot use ANY index. It is a sequential scan
-- that runs six trig operations on every row in the table.
explain analyze
select a.id
from artists a
join artist_service_areas sa on sa.artist_id = a.id
where sa.area_type = 'radius'
  and km_between(13.6257, 74.6912, sa.center_lat, sa.center_lng) <= sa.radius_km;
--  ...Seq Scan on artist_service_areas...  (fine at 50 rows, slow at 50k)`,
          pitfalls: [
            '**Using flat Pythagoras on lat/lng.** A degree of longitude is not a fixed distance — it shrinks toward the poles — so flat math overstates east-west distance. Fix: Haversine, which includes the `cos(lat)` term that accounts for it.',
            '**Forgetting to convert degrees to radians.** SQL trig functions expect radians; feeding raw degrees gives nonsense distances. Fix: wrap every angle in `radians(...)`.',
            '**Marking the function `volatile` (the default) or omitting the markers.** The planner then cannot inline or safely parallelise it. Fix: declare it `immutable parallel safe`.',
            '**Expecting a bare `km_between` in a WHERE to use an index.** A per-row computation has nothing to seek into, so it scans the whole table. Fix: prefilter with an indexable bounding box first (t12).',
            '**Trusting the formula without a sanity check.** A transposed lat/lng or a stray radian error is easy to miss. Fix: assert a known pair (Udupi ↔ Kundapura ≈ 32 km) before you depend on it.',
          ],
          tryIt:
            'Compute `km_between` for Udupi (13.34, 74.75) to Kundapura (13.62, 74.69). You should get roughly 32 km. Now reason: if `artist_service_areas` held 50,000 radius rows and you filtered with only this function in the WHERE, how many rows get trigonometry run on them? (All 50,000 — that is the sequential scan t12 exists to prevent.)',
          takeaway:
            'Haversine gives exact great-circle distance from plain SQL trig, wrapped as an `immutable parallel safe` `km_between`. It is correct but unindexable on its own — a bare call in a WHERE scans every row, which is why a bounding-box prefilter comes next.',
        },
        {
          id: 'm8-t12',
          title: 'The bounding-box prefilter: index first, Haversine on the survivors',
          explain:
            'Before the exact Haversine, filter on a cheap lat/lng box using the indexed columns, so trigonometry runs on a handful of candidates instead of the whole table.',
          analogy:
            'To find every boat within 25 km of Gangolli jetty, the harbour master does not measure the exact distance to every boat on the coast. He first draws a rough square on the chart around the jetty and ignores everything outside it — a glance, not a calculation — then measures precisely only the few boats left inside the square. The square is the bounding box; the precise measurement is Haversine.',
          theory:
            'Topic t11 left us with an exact but unindexable distance test. The fix is a two-stage filter. **Stage one** is a **bounding box**: a simple rectangle in latitude/longitude around the search point, expressed as plain `between` comparisons on `center_lat` and `center_lng` — and *those* columns are indexed, so the box is an **index range scan** that discards almost every far-away row without a single trig operation. **Stage two** runs the exact `km_between` only on the rows that survived the box. Cheap filter first, expensive filter second, on far fewer rows.\n\nSizing the box needs one fact and one adjustment. The fact: **one degree of latitude is ≈ 111 km everywhere on Earth** (lines of latitude are evenly spaced), so a box that reaches R kilometres north-south spans `R / 111` degrees of latitude. The adjustment: **one degree of longitude is ≈ 111 × cos(latitude) km** — meridians converge toward the poles, so a degree of longitude is full width at the equator and shrinks as latitude rises. At Kundapura\'s ~13.6°N, `cos(13.6°) ≈ 0.972`, so a degree of longitude is about 108 km there; the box must divide by `111 × cos(lat)` for its east-west half-width, or it will be too narrow and wrongly exclude valid points. Because t8 capped `radius_km` at 100, the box is a clean constant — search point ± `100/111` in latitude and ± `100/(111·cos(lat))` in longitude — an index-friendly range with literal bounds.\n\nThe payoff is visible in `explain analyze`. The bare-Haversine version reads *Seq Scan* and runs trig on every row. The box-first version reads *Index Scan* (or *Bitmap Index Scan*) on the lat/lng index, hands a small candidate set to the exact distance test, and returns in a fraction of the time. Same answer, a different order of operations, a different complexity class.\n\nTwo edge cases the textbooks skip, and one honest reason they do not matter here. A box that straddles the **±180° meridian** (the date line, in the Pacific) wraps around and a naive `between` breaks. And **at the poles**, `cos(latitude)` approaches zero, so `111 × cos(lat)` approaches zero and the longitude half-width explodes toward infinity. Both are real. Both are **irrelevant for India**, which sits entirely between roughly 68°E–97°E and 8°N–37°N — nowhere near the date line, nowhere near a pole. We say so explicitly, and we say *why we checked*: an engineer who ships a distance filter without knowing where it breaks is guessing; one who checked, found the failure modes, and confirmed they are out of range for the deployment is doing the job.',
          diagram: `graph TD
    ALL["All radius rows (e.g. 50,000)"] --> BOX{"Bounding box<br/>lat ± 100/111<br/>lng ± 100/(111·cos lat)"}
    BOX -->|indexed range scan<br/>no trig| SURV["A few dozen survivors"]
    BOX -.->|discarded cheaply| OUT[far-away rows]
    SURV --> HAV{Exact km_between<br/>≤ radius_km?}
    HAV -->|trig on the few| MATCH[Matching radius artists]
    HAV -.-> DROP[just outside the circle]`,
          flowExplain:
            'The funnel narrows in two stages: a cheap indexed box throws out almost everything, then exact trigonometry runs only on the survivors. The wide top and narrow bottom are the whole performance story — trig never touches the discarded rows.',
          whyItMatters:
            'This is the crown-jewel interview answer of the whole course: "radius search without PostGIS is a bounding-box prefilter on indexed lat/lng, then exact Haversine on the survivors — and the box uses 111 km per degree of latitude and 111×cos(lat) per degree of longitude." It shows you understand indexes, the cos(lat) geometry, and how to turn a sequential scan into an index scan.',
          steps: [
            'Ensure `center_lat` and `center_lng` are indexed (a composite or per-column index) so `between` filters seek instead of scan.',
            'Compute the box: latitude half-width `R/111`, longitude half-width `R/(111·cos(lat))`, with R the capped max radius (100 km).',
            'Filter with `between` on the indexed columns first — this discards distant rows with no trigonometry.',
            'Run exact `km_between <= radius_km` only on the survivors of the box.',
            'Confirm with `explain analyze` that the plan is an Index/Bitmap scan, not a Seq Scan, and note that the ±180° and pole edge cases are out of range for India.',
          ],
          code: `-- Index the coordinates so the box is a range scan, not a table scan.
create index asa_center_coords
  on artist_service_areas (center_lat, center_lng)
  where area_type = 'radius';         -- partial index: only radius rows

-- Two-stage filter. Search point = Kundapura (13.6257, 74.6912).
-- radius_km is capped at 100 (topic t8), so the box is a clean constant.
explain analyze
select a.id, a.display_name,
       km_between(13.6257, 74.6912, sa.center_lat, sa.center_lng) as distance_km
from artists a
join artist_service_areas sa on sa.artist_id = a.id
where sa.area_type = 'radius'
  -- STAGE 1: cheap, indexed bounding box. No trigonometry here.
  and sa.center_lat between 13.6257 - (100.0 / 111.0)
                        and 13.6257 + (100.0 / 111.0)
  and sa.center_lng between 74.6912 - (100.0 / (111.0 * cos(radians(13.6257))))
                        and 74.6912 + (100.0 / (111.0 * cos(radians(13.6257))))
  -- STAGE 2: exact distance, only on rows that survived the box.
  and km_between(13.6257, 74.6912, sa.center_lat, sa.center_lng) <= sa.radius_km;

--  Bare Haversine (t11):  Seq Scan ... trig on every row
--  Box-first (this):      Bitmap Index Scan on asa_center_coords -> few rows
--                         -> exact km_between on the survivors. Same answer, fast.

-- Edge cases we checked and dismissed, on purpose:
--   * ±180° meridian: a box that wraps the date line breaks a naive BETWEEN.
--   * Poles: cos(lat) -> 0, so the longitude half-width blows up.
-- India spans ~68E-97E, ~8N-37N: nowhere near either. Irrelevant here,
-- and we say so because we checked, not because we assumed.`,
          pitfalls: [
            '**Dividing longitude by a flat 111 like latitude.** East-west degrees shrink with latitude, so the box comes out too narrow and drops valid points. Fix: use `111 × cos(radians(lat))` for the longitude half-width.',
            '**Leaving `center_lat`/`center_lng` unindexed.** Then the "prefilter" is itself a sequential scan and buys nothing. Fix: index the coordinate columns (a partial index on radius rows is ideal).',
            '**Skipping the box and trusting Haversine alone.** Correct, but it scans every row forever. Fix: box first (indexed), exact distance second (on survivors).',
            '**Using the box as the final answer.** A box is a square; a radius is a circle, so the corners include points just outside the true radius. Fix: the box only prefilters — `km_between <= radius_km` is the exact test that trims the corners.',
            '**Not verifying with `explain analyze`.** On seed data both plans look instant, hiding a Seq Scan that only bites in production. Fix: read the plan and confirm an Index/Bitmap scan on the coordinate index.',
          ],
          tryIt:
            'At Kundapura (~13.6°N), compute the box half-widths for a 100 km reach: latitude is `100/111 ≈ 0.90°`, longitude is `100/(111·cos 13.6°) ≈ 100/107.9 ≈ 0.93°`. Now redo the longitude half-width for a point at 30°N and notice it grows (cos shrinks). Explain in one line why the longitude box widens as you move north. (Because a degree of longitude covers fewer km up north, so more degrees are needed to reach the same 100 km.)',
          takeaway:
            'Prefilter with an indexed lat/lng bounding box — `R/111` for latitude, `R/(111·cos lat)` for longitude — then run exact Haversine only on the survivors. Verify the Index Scan with `explain analyze`; the date-line and pole edge cases are real but out of range for India.',
        },
        {
          id: 'm8-t13',
          title: 'One RPC to rule them all: search_artists via supabase.rpc()',
          explain:
            'Package containment matching and radius matching into a single Postgres function `search_artists(...)`, called from the client with `supabase.rpc()`, returning distinct artists with an optional `distance_km` for sort-by-nearest.',
          analogy:
            'The KSRTC enquiry window does not hand you the timetable, the route map, and a calculator and tell you to work out your own connection — you state where you are and where you want to go, and one clerk returns the answer. `search_artists` is that window: the client states the searched place (and maybe coordinates), and one database call returns the matching artists, already deduplicated and distance-sorted.',
          theory:
            'You now have two independent matchers — containment (t10) and radius (t11–t12). The search result is their **union**: an artist appears if they match *either*. You could assemble that in the client by running two queries and merging arrays in JavaScript, but that would be a mistake, and understanding why is the point of this topic. The matching logic is **set-based** — unions, containment across levels, deduplication, distance sorting — and set-based logic belongs in the database, which was built for exactly this and can use indexes across the whole operation. Doing it in the client means shipping rows to the browser only to filter and merge them there, losing the indexes, multiplying round-trips, and scattering the OR-not-AND rule across JavaScript where the next developer will get it wrong.\n\nSo we put the whole thing in **one Postgres function**, `search_artists(...)`, and expose it to the client via **`supabase.rpc(\'search_artists\', params)`**. PostgREST turns any function into a callable RPC endpoint automatically. Inside, the function is two CTEs — one for containment, one for the box-then-Haversine radius match — combined with `union all`, then collapsed with a `group by artist_id` that both **deduplicates** (an artist matching several ways appears once) and computes `min(distance_km)` so a `distance_km` column comes back for **sort-by-nearest** (null for artists matched purely by containment, which sort last). Optional parameters — a category id, the searched place\'s ancestry ids, and the "Near me" lat/lng — default to null, so the same function serves a location-only search, a category-only search, or both.\n\nThe architectural payoff is that `services/artistService.js` stays a **thin caller**: it maps camelCase params to the function\'s snake_case arguments, calls `supabase.rpc(...)`, unwraps the result or throws, and returns plain artist objects — no matching logic at all. The hard, set-based reasoning lives once, in the database, tested with SQL; the service is a translator, exactly as the dependency rule intends. This is the same principle as RLS in Module 1: the thing that must be correct everywhere lives in Postgres, and the client is a caller, not a re-implementer.',
          diagram: `graph TD
    C["Client: supabase.rpc('search_artists', params)"] --> FN[[search_artists Postgres function]]
    FN --> CT[CTE containment<br/>OR across ancestry levels]
    FN --> RD[CTE radius<br/>bounding box -> Haversine]
    CT --> U[union all]
    RD --> U
    U --> G[group by artist_id<br/>dedupe + min distance_km]
    G --> OUT["rows: artist_id, distance_km"]
    OUT --> SVC[artistService: thin caller<br/>maps + throws + returns]
    SVC --> UI[Browse page sorts by distance_km]`,
          flowExplain:
            'Two set-based CTEs union, deduplicate, and carry a distance out of one database call. The service layer never re-implements matching — it calls the RPC and returns the rows, which is why the OR-not-AND rule exists in exactly one place.',
          whyItMatters:
            '"Why an RPC instead of building the query in the client?" is a design question with a crisp answer: the matching is set-based (union, containment, dedupe, distance sort), so it belongs in the database where it can use indexes and be defined once, keeping the service a thin caller. Being able to justify where logic lives is exactly the judgment senior interviews test.',
          steps: [
            'Write `search_artists(...)` with nullable params: the searched ancestry ids, optional `p_lat`/`p_lng`, and an optional `p_category_id`.',
            'Build a containment CTE (t10 OR-chain) and a radius CTE (t12 box + t11 Haversine), guarded so radius runs only when coordinates are supplied.',
            '`union all` the two, then `group by artist_id` with `min(distance_km)` to deduplicate and expose nearest-distance.',
            'Call it from the service with `supabase.rpc(\'search_artists\', { ... })`, unwrap or throw, return plain objects.',
            'Sort by `distance_km` on the browse page for "nearest first", with containment-only matches (null distance) sorting last.',
          ],
          code: `create or replace function search_artists(
  p_state_id    uuid default null,
  p_district_id uuid default null,
  p_taluk_id    uuid default null,
  p_city_id     uuid default null,
  p_lat         double precision default null,
  p_lng         double precision default null,
  p_category_id uuid default null
) returns table (artist_id uuid, distance_km double precision)
language sql stable as $$
  with containment as (              -- HALF ONE: OR across every ancestor level
    select a.id as artist_id, null::double precision as distance_km
    from artists a
    join artist_service_areas sa on sa.artist_id = a.id
    where a.is_published
      and (p_category_id is null or exists (
            select 1 from artist_categories ac
            where ac.artist_id = a.id and ac.category_id = p_category_id))
      and (
            sa.area_type = 'country'
         or (sa.area_type = 'state'    and sa.state_id    = p_state_id)
         or (sa.area_type = 'district' and sa.district_id = p_district_id)
         or (sa.area_type = 'taluk'    and sa.taluk_id    = p_taluk_id)
         or (sa.area_type = 'city'     and sa.city_id     = p_city_id)
      )
  ),
  radius as (                        -- HALF TWO: bounding box, then exact Haversine
    select a.id as artist_id,
           km_between(p_lat, p_lng, sa.center_lat, sa.center_lng) as distance_km
    from artists a
    join artist_service_areas sa on sa.artist_id = a.id
    where a.is_published
      and p_lat is not null and p_lng is not null
      and sa.area_type = 'radius'
      and (p_category_id is null or exists (
            select 1 from artist_categories ac
            where ac.artist_id = a.id and ac.category_id = p_category_id))
      and sa.center_lat between p_lat - (100.0 / 111.0)
                            and p_lat + (100.0 / 111.0)
      and sa.center_lng between p_lng - (100.0 / (111.0 * cos(radians(p_lat))))
                            and p_lng + (100.0 / (111.0 * cos(radians(p_lat))))
      and km_between(p_lat, p_lng, sa.center_lat, sa.center_lng) <= sa.radius_km
  )
  select artist_id, min(distance_km) as distance_km      -- dedupe + nearest
  from (select * from containment
        union all
        select * from radius) matched
  group by artist_id;
$$;

// services/artistService.js -- a THIN caller. No matching logic here.
export async function searchArtists({ place, coords, categoryId }) {
  const { data, error } = await supabase.rpc('search_artists', {
    p_state_id: place?.stateId ?? null,
    p_district_id: place?.districtId ?? null,
    p_taluk_id: place?.talukId ?? null,
    p_city_id: place?.cityId ?? null,
    p_lat: coords?.lat ?? null,
    p_lng: coords?.lng ?? null,
    p_category_id: categoryId ?? null,
  });
  if (error) throw new Error(\`Artist search failed: \${error.message}\`);
  // null distance (containment-only) sorts after real distances.
  return data.sort((x, y) =>
    (x.distance_km ?? Infinity) - (y.distance_km ?? Infinity));
}`,
          pitfalls: [
            '**Running the two matchers as separate client queries and merging in JS.** You lose indexes, double the round-trips, and re-implement OR-not-AND in JavaScript. Fix: one RPC unions them in the database where the logic and the indexes live.',
            '**Forgetting to deduplicate.** An artist matched by both containment and radius appears twice. Fix: `group by artist_id` (with `min(distance_km)`) collapses duplicates and keeps the nearest distance.',
            '**Running the radius CTE when no coordinates were supplied.** It computes `cos(radians(null))` and wastes work. Fix: guard with `p_lat is not null and p_lng is not null` so radius only runs for coordinate searches.',
            '**Putting matching logic in the service and calling the RPC a "wrapper".** Then the rule lives in two places and drifts. Fix: the service maps params, calls, and throws — nothing more; the logic is the function\'s job.',
            '**Sorting nulls first when sorting by distance.** Containment-only matches have null `distance_km` and would jump to the top. Fix: coalesce null to `Infinity` so pure-containment matches sort after measured ones.',
          ],
          tryIt:
            'Call the RPC for a Kundapura search with no coordinates, then again with Kundapura\'s lat/lng. Which artists gain a non-null `distance_km`, and why does the no-coordinates call still return the containment matches? (Answer: only radius matches carry a distance; without coordinates the radius CTE is skipped entirely, so you still get every containment match with null distance.)',
          takeaway:
            'One `search_artists` RPC unions containment and radius, deduplicates with `group by`, and returns an optional `distance_km` for nearest-first sorting. Set-based logic lives in Postgres; `artistService` stays a thin caller — call `supabase.rpc()`, throw, return.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm8-p1',
      type: 'Mini Project',
      title: 'Search That Actually Finds the Right Artist',
      domain: 'Location, Geocoding & Set-Based Matching',
      duration: '2 hours',
      description:
        'Build the complete location system end to end: seed Karnataka\'s administrative hierarchy, expose a `searchable_places` view with a trigram index, ship the geocoding provider interface with postgres and nominatim implementations (google left as an exercise), build the artist service-area picker, write the `search_artists` RPC that matches by containment OR radius, add "Near me", and sort results by distance. It must pass a precise acceptance test that a naive implementation fails.',
      tools: ['React', 'Vite', 'Supabase', 'PostgreSQL', 'pg_trgm', 'Nominatim', 'navigator.geolocation'],
      blueprint: {
        overview:
          'A working search that answers the one question the product exists to answer — "does this artist serve the place I searched?" — for coastal Karnataka. Places come from four seeded tables you own, autocomplete hits a UNION ALL view backed by a trigram index, every geocoder sits behind one swappable provider interface, artists declare service areas of six types guarded by a CHECK constraint, and one Postgres RPC unions containment matches with Haversine radius matches, deduplicated and distance-sorted. The build is done when it passes the acceptance test below, which a naive AND-based or exact-level-only matcher cannot.',
        functionalRequirements: [
          '**Seeded hierarchy.** `states`/`districts`/`taluks`/`cities` seeded with Karnataka in full and Udupi district in detail (Kundapura, Karkala, Udupi, Byndoor, Brahmavara, Hebri taluks and their cities), each row carrying `lat`/`lng` and a `slug`.',
          '**Autocomplete.** A `searchable_places` UNION ALL view searched by one query, with a `text_pattern_ops` btree for prefix and a `pg_trgm` GIN index for substring, debounced at 250ms on the client.',
          '**Provider interface.** `services/geocoding/provider.js` exporting `search`/`reverse`/`getPlace`, chosen by `VITE_GEOCODING_PROVIDER`, with `postgresProvider` (default) and `nominatimProvider` implemented; `googleProvider` left as a documented exercise.',
          '**Service-area picker.** An artist can add several areas (Pan Karnataka, Udupi, Manipal, Kundapura, Brahmavara, a 25 km radius) as removable chips, with a redundancy warning when a new area is already covered.',
          '**search_artists RPC.** One Postgres function unioning containment (OR across every ancestor level) with radius (bounding box then Haversine), deduplicated with `group by`, returning an optional `distance_km`, called via `supabase.rpc()`.',
          '**Near me.** A `useGeolocation()` hook returning `{ data, loading, error }` plus a trigger, reverse-geocoding once and snapping to the nearest seeded city, with graceful denial and timeout handling.',
          '**Sort by distance.** Results sortable "nearest first" using the RPC\'s `distance_km`, with containment-only matches sorting last.',
        ],
        technicalImplementation: [
          '**Seed migration.** SQL inserts, parents before children, referencing parents by slug subquery so no uuids are hardcoded; committed as a migration so a fresh clone gets identical place data.',
          '**Indexes.** `text_pattern_ops` btree on `lower(name)` per base table, `pg_trgm` GIN per table for substrings, and a partial `(center_lat, center_lng)` index on radius rows; each verified with `explain analyze`.',
          '**CHECK constraint.** A `case`-on-`area_type` CHECK on `artist_service_areas` making every wrong column-shape unrepresentable, with `radius_km` capped 1–100 so the bounding box is a constant.',
          '**km_between function.** An `immutable parallel safe` SQL Haversine, sanity-checked against Udupi↔Kundapura ≈ 32 km.',
          '**Provider normalisation.** Each provider maps its backend response to one `Place` shape (`{ id, kind, name, displayPath, lat, lng, stateId, districtId, talukId, cityId }`); Nominatim responses cached in a `Map`.',
          '**Thin service.** `artistService.searchArtists()` maps camelCase params to the RPC\'s snake_case arguments, calls `supabase.rpc()`, throws on error, and returns sorted plain objects — no matching logic in JS.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Seed the hierarchy and the searchable view',
            outcome:
              'Four seeded tables and a searchable_places view with prefix and trigram indexes, verified with explain analyze.',
            prompt:
              'In my Supabase Postgres, create `states`, `districts`, `taluks`, `cities`, each with `id uuid primary key default gen_random_uuid()`, `name`, unique `slug`, `lat`/`lng double precision`, `created_at`, and a foreign key to its parent (all but `states`). Seed Karnataka, Udupi district, and the six Udupi taluks (Kundapura, Karkala, Udupi, Byndoor, Brahmavara, Hebri) with real coordinates, plus a few Kundapura-taluk cities (Kundapura, Gangolli, Maravanthe, Kollur) — inserts parents-first, referencing parents by slug subquery, no hardcoded uuids. Then create a `searchable_places` view as a UNION ALL of all four tables normalised to `(id, kind, name, display_path, lat, lng, state_id, district_id, taluk_id, city_id)`. Add a `lower(name) text_pattern_ops` btree index per base table for prefix search, enable `pg_trgm`, and add a `gin (name gin_trgm_ops)` index per table for substring search. Finish by running `explain analyze` on a prefix query (`lower(name) like \'kunda%\'`) and a substring query (`name ilike \'%pura%\'`) and show me the plan lines.',
          },
          {
            step: 2,
            label: 'Provider interface: postgres + nominatim',
            outcome:
              'A swappable geocoding provider chosen by an env var, with postgres as default and nominatim for free-text and reverse geocoding.',
            prompt:
              'Create `src/services/geocoding/` with `provider.js` that imports `postgresProvider`, `nominatimProvider`, and a `mockProvider`, keys them by name, reads `import.meta.env.VITE_GEOCODING_PROVIDER` (default `postgres`), and exports the chosen one as `geocoder`. Every provider must export `search(query)`, `reverse(lat, lng)`, and `getPlace(id)` returning a normalised `{ id, kind, name, displayPath, lat, lng, stateId, districtId, talukId, cityId }`. Implement `postgresProvider` against the `searchable_places` view (prefix `ilike \`${query}%\``, limit 8) and a `nearest_city` RPC for reverse. Implement `nominatimProvider` calling `https://nominatim.openstreetmap.org` with `countrycodes=in` and an `Accept-Language` header, caching every response in a `Map`, and comment clearly that `User-Agent` cannot be set from the browser and that volume must stay ~1 req/sec. Leave a `googleProvider.js` stub with a header comment explaining it is card-gated and optional. Keep all Supabase access inside these files — no component imports the client.',
          },
          {
            step: 3,
            label: 'Service-area schema, CHECK constraint, and picker',
            outcome:
              'The artist_service_areas table with its shape-enforcing CHECK and a React picker with redundancy warnings.',
            prompt:
              'Create a `service_area_type` enum (`country`, `state`, `district`, `taluk`, `city`, `radius`) and an `artist_service_areas` table with `artist_id` FK, `area_type`, nullable `state_id`/`district_id`/`taluk_id`/`city_id`/`center_lat`/`center_lng`/`radius_km`, and `created_at`. Add a `case`-on-`area_type` CHECK constraint that enforces exactly which columns are non-null for each type, with `radius_km between 1 and 100`, and an owner-only RLS policy keyed through `artists.user_id = auth.uid()`. Then build `src/components/ServiceAreaPicker/` with pure `redundancy.js` helpers (`isRedundant`, `nowRedundant`, `covers`) computed from the ancestry ids the autocomplete returns, and a `ServiceAreaPicker.jsx` that renders areas as removable chips, warns when a new area is already covered, offers to remove chips a wider area makes redundant, and ships loading/empty/error/data states. Writes go through `artistService`; the CHECK is the backstop.',
          },
          {
            step: 4,
            label: 'km_between and the search_artists RPC',
            outcome:
              'A Haversine function and one RPC that unions containment with radius, deduplicated and distance-sorted.',
            prompt:
              'Create an `immutable parallel safe` SQL function `km_between(lat1, lng1, lat2, lng2)` computing great-circle km (R = 6371), and sanity-check it against Udupi (13.34, 74.75) ↔ Kundapura (13.62, 74.69) ≈ 32 km. Add a partial index `(center_lat, center_lng) where area_type = \'radius\'`. Then write `search_artists(p_state_id, p_district_id, p_taluk_id, p_city_id, p_lat, p_lng, p_category_id)` returning `table(artist_id uuid, distance_km double precision)` as two CTEs: a containment CTE OR-ing across country/state/district/taluk/city, and a radius CTE using the bounding box (lat ± 100/111, lng ± 100/(111·cos(radians(p_lat)))) guarded by `p_lat is not null` then exact `km_between <= radius_km`; `union all` them and `group by artist_id` with `min(distance_km)`. Show me the `explain analyze` for a radius search proving it uses the coordinate index, not a Seq Scan.',
          },
          {
            step: 5,
            label: 'Near me, thin service, and sort by distance',
            outcome:
              'A geolocation hook that snaps to the nearest city, and a thin artistService that calls the RPC and sorts by distance.',
            prompt:
              'Create `src/hooks/useGeolocation.js` returning `{ data, loading, error }` plus a `request()` trigger (the prompt must be user-initiated), calling `navigator.geolocation.getCurrentPosition` with `{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }` and mapping `PERMISSION_DENIED`/`POSITION_UNAVAILABLE`/`TIMEOUT` to calm messages. On success, reverse-geocode once via `geocoder.reverse` and snap to the nearest seeded city (a `nearest_city` RPC using `km_between`). Then write `artistService.searchArtists({ place, coords, categoryId })` that maps camelCase params to the RPC\'s snake_case arguments, calls `supabase.rpc(\'search_artists\', ...)`, throws on error, and returns the rows sorted by `distance_km` with null distances (containment-only) coalesced to Infinity so they sort last. Wire a "Near me" button and a "nearest first" sort on the browse page. Keep all matching logic in the database — the service only maps, calls, throws, and sorts.',
          },
          {
            step: 6,
            label: 'The acceptance test',
            outcome:
              'A reproducible test proving containment matches and radius exclusion behave exactly as specified.',
            prompt:
              'Write a SQL (or Vitest-against-Supabase) acceptance test with this fixture: Artist U declares only "Udupi district"; Artist R declares a 25 km radius around Udupi (13.34, 74.75); Artist K declares only "Kundapura taluk"; Artist P declares "Pan India". Then assert, for a search resolving to Kundapura (taluk in Udupi, ~32 km from Udupi town): (1) Artist U MUST appear — a district area contains the searched taluk (this is the test a naive AND-based or exact-level-only matcher fails); (2) Artist R MUST NOT appear — Udupi→Kundapura is ~32 km, outside the 25 km radius; (3) Artist K and Artist P MUST appear. Print each assertion with PASS/FAIL, and if any fails, show the failing artist and the branch that should have matched. This test is the definition of done for the whole module.',
          },
        ],
        deliverable:
          'A working coastal-Karnataka artist search: four seeded place tables you own, an indexed searchable_places view with 250ms-debounced autocomplete, a swappable geocoding provider (postgres + nominatim, google as an exercise), a CHECK-guarded service-area picker, one search_artists RPC unioning containment with Haversine radius, "Near me" snapped to the nearest city, and distance sorting — all zero-cost and card-free, and all passing the acceptance test: an artist who declared only "Udupi district" appears for a "Kundapura" search, and a 25 km-radius-around-Udupi artist does not.',
      },
    },
  ],
  quiz: [
    {
      id: 'm8-q1',
      q: 'An artist declares three service areas: "Pan India", "Karnataka", and "Manipal". A user searches for Manipal. How must the matching logic combine those areas?',
      options: [
        'With AND — all three areas must cover the searched location',
        'Only the most specific area (Manipal) is consulted; the others are ignored',
        'With OR — the artist appears if ANY one of their declared areas covers the searched location',
        'The areas are averaged into a single coverage score above a threshold',
      ],
      answer: 2,
    },
    {
      id: 'm8-q2',
      q: 'When a user searches "Kundapura" (a taluk in Udupi district, Karnataka), why must the query match at every ancestor level and not only at the taluk level?',
      options: [
        'Because an artist who declared Pan India, Karnataka, or Udupi district genuinely serves Kundapura — matching only the taluk level silently hides all of them',
        'Because Postgres cannot compare taluk_id columns directly',
        'Because the searched place might be spelled differently at each level',
        'Because matching only one level would return duplicate rows',
      ],
      answer: 0,
    },
    {
      id: 'm8-q3',
      q: 'Why can a bare Haversine call in a WHERE clause not use an index, forcing a sequential scan?',
      options: [
        'Because Postgres forbids trigonometric functions inside a WHERE clause',
        'Because the km_between function is marked volatile and volatile functions are never indexed',
        'Because floating-point results cannot be stored in a btree index',
        'Because it is a per-row computation over two columns and two constants that yields a different value for every row, so there is no pre-sorted structure to seek into',
      ],
      answer: 3,
    },
    {
      id: 'm8-q4',
      q: 'When sizing the bounding box, why is the longitude half-width divided by 111 × cos(latitude) rather than a flat 111?',
      options: [
        'Because latitude degrees are longer than longitude degrees at the equator',
        'Because a degree of longitude covers ~111 × cos(latitude) km — meridians converge toward the poles, so east-west degrees shrink with latitude and a flat 111 makes the box too narrow',
        'Because cosine corrects for the Earth being an ellipsoid rather than a sphere',
        'Because Postgres trigonometry returns radians that must be rescaled by cosine',
      ],
      answer: 1,
    },
    {
      id: 'm8-q5',
      q: 'Why does the Google Places API fail this course\'s zero-cost, no-card constraint even though it has a free monthly quota?',
      options: [
        'Because Google Places cannot autocomplete Indian place names',
        'Because every Places request is billed with no free tier at all',
        'Because Google Maps Platform requires an enabled billing account — a credit card on file — even to consume the free quota',
        'Because the Places API has been deprecated and removed',
      ],
      answer: 2,
    },
    {
      id: 'm8-q6',
      q: 'What is the correct way to use Nominatim within this project\'s constraints?',
      options: [
        'Only for free-text queries our tables miss and once-per-session reverse geocoding, kept under ~1 request/second, with responses cached and OpenStreetMap attributed — never for per-keystroke autocomplete',
        'As the primary autocomplete backend, one request per keystroke, for the fastest suggestions',
        'To bulk-geocode all seed rows in a loop at startup so coordinates are always fresh',
        'Only after obtaining a paid API key that raises the rate limit',
      ],
      answer: 0,
    },
    {
      id: 'm8-q7',
      q: 'Why is the artist search implemented as one Postgres RPC (search_artists) rather than assembled with a client-side query builder?',
      options: [
        'Because supabase-js cannot express OR conditions from the client',
        'Because RPCs are the only way to read from a view in Supabase',
        'Because client queries cannot call the anon key safely',
        'Because the matching is set-based — union, containment across levels, deduplication, distance sort — which belongs in the database where it uses indexes and is defined once, keeping artistService a thin caller',
      ],
      answer: 3,
    },
    {
      id: 'm8-q8',
      q: 'Why do our own seeded place tables beat a geocoding API\'s place_id for service-area matching?',
      options: [
        'Because place_id values change every time the API is called',
        'Because a place_id and formatted address do not encode containment ("Manipal is inside Udupi district"), whereas our foreign-key hierarchy makes that ancestry a join in the same database as our artists',
        'Because geocoding APIs cannot return latitude and longitude for Indian places',
        'Because a place_id cannot be stored in a Postgres column',
      ],
      answer: 1,
    },
  ],
}
