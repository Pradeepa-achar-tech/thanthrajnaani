// Module 3 — Database Design, the Eighteen Tables & Row Level Security
// KalaKaara (React + Supabase) course content for the React course player.

export const m3 = {
  id: 'm3',
  title: 'Database Design & Row Level Security',
  hours: 9,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'The conceptual core of KalaKaara. You will model the whole domain as an entity-relationship diagram, normalise it to third normal form, then build all eighteen tables in one idempotent migration with constraints, indexes, and triggers. Finally you will lock the entire database down with Row Level Security so the browser can talk straight to Postgres and still never leak a phone number.',
  sections: [
    {
      id: 'm3-s1',
      title: 'Modelling the domain',
      topics: [
        {
          id: 'm3-t1',
          title: 'Entities and relationships — the full ER diagram',
          explain:
            'Before any SQL, you draw the nouns of KalaKaara as boxes and the relationships between them as lines, deciding for each pair whether it is one-to-many, many-to-many, or one-to-one.',
          analogy:
            'Think of the Kundapura fish market at dawn. There are boats, there are fishermen, there are the varieties of fish, and there are the buyers. One boat lands many baskets (one-to-many). Any fisherman may work many boats and any boat carries many fishermen (many-to-many). Each fisherman has exactly one ration card (one-to-one). Before you can build the market ledger, you have to name those nouns and decide how they connect — and you do it on paper, not in code.',
          theory:
            'An **entity** is a noun your application must remember: an artist, an artwork, a category, a district. A **relationship** is how two entities connect, and there are only three shapes you will ever draw.\n\n**One-to-many** is the workhorse. One artist has many artworks; one artwork belongs to exactly one artist. You implement it by putting a foreign key on the **many** side: `artworks.artist_id` points back at `artists.id`. There is no separate table. If you catch yourself putting a foreign key on the *one* side you have the direction backwards.\n\n**Many-to-many** cannot be expressed with a single foreign key, because each side has many of the other. One artist works in many categories (portrait, mural, calligraphy); one category is worked by many artists. The same is true for artists and the languages they speak. You resolve this with a third table — a **junction** — whose rows each pair one artist with one category. `artist_categories` and `artist_languages` are exactly this. The junction turns one impossible relationship into two ordinary one-to-many relationships.\n\n**One-to-one** is the rarest. A KalaKaara user has at most one artist profile: `artists.user_id` is unique, so a single `profiles` row maps to at most one `artists` row. You implement one-to-one as a one-to-many with a `unique` constraint on the foreign key, which is why it is easy to miss.\n\nThe diagram below is the whole domain. Read it as sentences: an `artists` row *belongs to* one `profiles` row; an `artworks` row *belongs to* one `artists` row; `artist_categories` *links* `artists` and `categories`. Notice the location chain on the right — `cities` sits in a `taluks`, which sits in a `districts`, which sits in a `states`. That chain is what makes containment matching possible in Module 8, and it is why we never store a place as free text.',
          diagram: `erDiagram
    profiles ||--o| artists : "has one"
    artists ||--o{ artworks : "creates"
    artists ||--o{ artist_categories : "tagged with"
    categories ||--o{ artist_categories : "groups"
    artists ||--o{ artist_languages : "speaks"
    languages ||--o{ artist_languages : "spoken by"
    availability ||--o{ artists : "sets pace for"
    categories ||--o{ artworks : "classifies"
    artists ||--o{ artist_service_areas : "serves"
    service_area_types ||--o{ artist_service_areas : "typed as"
    countries ||--o{ states : "contains"
    states ||--o{ districts : "contains"
    districts ||--o{ taluks : "contains"
    taluks ||--o{ cities : "contains"
    cities ||--o{ pincodes : "contains"
    states ||--o{ artist_service_areas : "scopes"
    districts ||--o{ artist_service_areas : "scopes"
    taluks ||--o{ artist_service_areas : "scopes"
    cities ||--o{ artist_service_areas : "scopes"
    profiles ||--o{ favorites : "saves"
    artists ||--o{ favorites : "saved as"
    profiles ||--o{ reviews : "writes"
    artists ||--o{ reviews : "reviewed as"`,
          flowExplain:
            'Read `||--o{` as "one to zero-or-many" and `||--o|` as "one to zero-or-one". The single one-to-one in the whole schema is `profiles` to `artists`: most users never become artists, so the artist side is optional.',
          whyItMatters:
            'An ER diagram is the artefact interviewers ask you to draw on a whiteboard, and it is the single cheapest place to catch a design mistake. Fixing a mis-drawn line costs a pencil stroke; fixing the same mistake after twelve components query the table costs a weekend migration.',
          steps: [
            'List every noun KalaKaara must remember. Artist, artwork, category, language, availability, the four location levels, service area, favourite, review, profile.',
            'For each pair of nouns that connect, say the relationship out loud in both directions. "One artist has many artworks; one artwork has one artist" is one-to-many.',
            'Whenever both directions say "many", draw a junction table between them. You will draw three: artist_categories, artist_languages, artist_service_areas.',
            'Mark the single one-to-one — profiles to artists — and remember it becomes a unique foreign key, not a special table.',
            'Trace the location chain top to bottom and confirm every level points up to exactly one parent. That chain is the backbone of Module 8.',
          ],
          code: `-- The three relationship shapes, spelled as they land in SQL.

-- ONE-TO-MANY: foreign key on the MANY side. No junction table.
--   one artist  ->  many artworks
create table artworks (
  id        uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade
  -- ^ the FK lives here, on artworks, the "many" side.
);

-- MANY-TO-MANY: a junction table, two foreign keys, composite primary key.
--   many artists <-> many categories
create table artist_categories (
  artist_id   uuid not null references artists(id)    on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (artist_id, category_id)   -- the pair is unique; no id column
);

-- ONE-TO-ONE: a one-to-many with a UNIQUE constraint on the FK.
--   one profile  ->  at most one artist
create table artists (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade
  -- ^ unique is what turns "many" into "at most one".
);`,
          pitfalls: [
            '**Putting the foreign key on the wrong side of a one-to-many.** A `category_id` on `artists` would let an artist have only one category. Fix: the foreign key always lives on the *many* side, and if both sides are many you need a junction, not a column.',
            '**Trying to express many-to-many without a junction table.** People reach for a `category_ids` array on `artists`. It cannot be joined, cannot be indexed for containment cleanly, and breaks referential integrity. Fix: a junction table with two real foreign keys.',
            '**Forgetting the `unique` on a one-to-one foreign key.** Without `unique` on `artists.user_id`, one user can create ten artist profiles. Fix: mark the foreign key unique so the "at most one" is enforced by Postgres, not by hope.',
            '**Storing a location as a free-text string on the artist row.** Then the location chain does not exist, containment is impossible, and Module 8 collapses. Fix: model states, districts, taluks, and cities as real tables with real parent foreign keys.',
          ],
          tryIt:
            'On paper, add a hypothetical "collections" feature where an artist groups artworks into named collections and one artwork may appear in several collections. Draw the entities and relationships. (Answer: a `collections` table one-to-many from artists, plus a `collection_artworks` junction, because an artwork in many collections and a collection of many artworks is many-to-many.)',
          takeaway:
            'Three relationship shapes cover the whole domain: one-to-many is a foreign key on the many side, many-to-many is a junction table, and one-to-one is a unique foreign key.',
        },
        {
          id: 'm3-t2',
          title: 'Normalisation to third normal form, practically',
          explain:
            'Normalisation is the discipline of storing every fact exactly once, so that no two rows can ever disagree about the same truth.',
          analogy:
            'A temple seva counter that writes the priest name next to every single booking will, within a week, have "Ganesh Bhat", "G. Bhat", and "Ganesha Bhat" all referring to the same person. Move the priest into their own register and give each booking a priest number, and the name is written once, spelled once, corrected once. Normalisation is moving repeated facts into their own register.',
          theory:
            'Normal forms are rules for removing redundancy, and for a CRUD app you need the first three. They sound academic; they are intensely practical.\n\n**First normal form (1NF): no repeating groups, every cell is a single value.** A column named `categories` holding the string "portrait, mural, calligraphy" violates 1NF. You cannot filter it reliably, you cannot join it, and "portrait" versus "Portrait" versus "potrait" all live in there. The fix is the junction table from the previous topic.\n\n**Second normal form (2NF): every non-key column depends on the whole primary key.** This only bites tables with composite keys. In `artist_categories`, whose key is `(artist_id, category_id)`, there is no room for a stray column like `category_name`, because the category name depends on `category_id` alone, not on the pair. That column belongs in `categories`.\n\n**Third normal form (3NF): non-key columns depend on the key, the whole key, and nothing but the key.** This is the one that catches the "Udupi as a string" mistake. Suppose you put `city text`, `district text`, and `state text` all on the `artists` row. Now `district` depends on `city`, not on the artist — a transitive dependency. Two artists in Manipal might record "Udupi" and "Udupi District" as their district, and now "is this artist in Udupi district?" has no reliable answer. The fix is the location chain: the artist points at a `cities` row, the city points at its `taluks` row, which points at its `districts` row. Each fact is stored once, at the level it belongs to.\n\nThis is the deep reason KalaKaara seeds its own location tables. It is not merely to avoid a paid geocoding API — it is that a free-text "Udupi" makes **containment matching mathematically impossible**. You cannot ask "is Manipal inside the searched district?" of a string. You can ask it of a foreign key.\n\nAnd then, deliberately, you break the rules — in exactly two places. An artist page needs an average rating and a review count. You *could* compute them with `avg(rating)` and `count(*)` over the `reviews` table on every page load. Instead you store `rating_avg` and `review_count` as columns on the `artists` row and keep them fresh with a trigger. That is **denormalisation**: the same fact (a review) now influences two places (the reviews table and the counter). You accept the risk of drift because reads vastly outnumber writes, and a browse grid showing fifty artists would otherwise fire fifty aggregate queries. Module 13 builds those counters. The rule is: normalise by default, denormalise only with a measured reason and a trigger to keep the copy honest.',
          diagram: `graph TD
    A["artists row with<br/>city text, district text, state text<br/>(violates 3NF)"] --> P{Problem}
    P --> P1["'Udupi' vs 'Udupi District'<br/>vs 'udupi' = 3 places"]
    P --> P2["containment query<br/>has no reliable answer"]
    A --> N[Normalise: split the chain]
    N --> C[artists.city_id -> cities]
    C --> T[cities.taluk_id -> taluks]
    T --> D[taluks.district_id -> districts]
    D --> S[districts.state_id -> states]
    N --> R["each place spelled ONCE,<br/>containment is a JOIN"]
    subgraph deliberate[Deliberate denormalisation - Module 13]
      RV[reviews table<br/>source of truth] -. trigger .-> CNT[artists.rating_avg<br/>artists.review_count]
    end`,
          flowExplain:
            'The left path shows the disease — three text columns that can disagree. The right path is the cure — a chain of foreign keys where each place name is stored once. The dashed box is the one place you intentionally keep a second copy, guarded by a trigger.',
          whyItMatters:
            'Under-normalising is the most common junior data-modelling mistake, and it is invisible until the data grows. By the time "Udupi" and "udupi" are both in production you cannot filter, cannot count, and cannot trust a single report. Knowing *when* to denormalise — and being able to name the trigger that keeps the copy honest — is what separates a data modeller from someone who just makes tables.',
          steps: [
            'Scan every table for a column holding a list, a comma-separated string, or a "tags in one cell" value. Each is a 1NF violation headed for a junction table or an array.',
            'For any table with a composite key, check that every other column depends on the whole key, not half of it. If it depends on half, it belongs in the parent lookup table.',
            'Hunt for transitive dependencies: a column that depends on another non-key column. City-district-state on the artist row is the classic. Split it into the chain.',
            'List every place you are tempted to store a computed value. For each, decide: recompute on read, or store and maintain with a trigger?',
            'Write down your two sanctioned denormalisations — rating_avg and review_count — and note that each one requires a trigger, or it will silently rot.',
          ],
          code: `-- BEFORE: everything crammed onto the artist row. Looks convenient. Rots fast.
create table artists_bad (
  id        uuid primary key,
  name      text,
  city      text,            -- 'Manipal'
  district  text,            -- 'Udupi' ... or 'Udupi District' ... or 'udupi'
  state     text,            -- 'Karnataka' ... or 'karnataka'
  categories text            -- 'portrait, mural, calligraphy'  <- 1NF violation
);
-- "Show artists in Udupi district" is now a LIKE against dirty free text.
-- It will miss rows, match wrong rows, and never be trustworthy.

-- AFTER: normalised. Each fact lives once, at the right level.
create table artists (
  id      uuid primary key default gen_random_uuid(),
  name    text not null,
  city_id uuid references cities(id)     -- points into the location chain
);
-- "Show artists in Udupi district" becomes an exact, indexable JOIN:
select a.*
from artists a
join cities c    on c.id = a.city_id
join taluks t    on t.id = c.taluk_id
join districts d on d.id = t.district_id
where d.name = 'Udupi';        -- one spelling, one source of truth

-- DELIBERATE denormalisation (Module 13): a maintained copy, not a stored guess.
alter table artists
  add column rating_avg   numeric(2,1) not null default 0,
  add column review_count integer      not null default 0;
-- Kept honest by a trigger on the reviews table. Never hand-edited.`,
          pitfalls: [
            '**Storing "Udupi" as a text column on the artist row.** "Udupi", "udupi", and "Udupi District" become three different places and containment matching is impossible. Fix: a `city_id` foreign key into the seeded location chain.',
            '**Denormalising because it "feels faster" without measuring.** A copied value that nothing maintains is a lie waiting to be read. Fix: only denormalise a value you can point a trigger at, and only when reads genuinely dominate.',
            '**Putting a descriptive column on a junction table.** `category_name` on `artist_categories` duplicates the name for every artist in that category. Fix: keep the name in `categories`; the junction holds only the two foreign keys.',
            '**Over-normalising trivia into its own table.** A `medium` on an artwork ("oil on canvas") is free-form label text; it does not need a `mediums` table with policies and joins. Fix: normalise controlled vocabularies that you filter on; leave free-form labels as columns.',
          ],
          tryIt:
            'A teammate proposes storing `district_name` directly on `artist_service_areas` "to avoid a join when displaying results". Explain in two sentences why this violates 3NF and what breaks when a district is renamed. (Answer: district name depends on the district, not on the service area, so a rename now has to be found and fixed in two places, and until it is, the two disagree.)',
          takeaway:
            'Normalise so every fact is stored once and containment becomes a join; denormalise only the rating counters, and only with a trigger to keep the copy honest.',
        },
        {
          id: 'm3-t3',
          title: 'The uniform table contract and the updated_at trigger',
          explain:
            'Every editable table in KalaKaara carries the same three columns — id, created_at, updated_at — and updated_at is maintained by one trigger function you write once and attach everywhere.',
          analogy:
            'Every seva receipt at the Kollur temple has the same three things printed at the top: a receipt number, the date issued, and the date last amended. It does not matter whether the receipt is for an archane or an annadana — the header is identical. That sameness is what lets one clerk read any receipt without relearning the format. Your tables get the same standard header.',
          theory:
            'A **table contract** is a set of columns that every table honours, so that every query, index, and sort behaves the same way everywhere. KalaKaara uses three.\n\n**`id uuid primary key default gen_random_uuid()`.** Every row has a universally unique identifier, generated by Postgres. The alternative, `bigserial`, hands out 1, 2, 3, and that is a problem for a public app. Sequential ids **enumerate**: anyone who sees `/artworks/41` can walk to `/artworks/1` through `/artworks/40` and scrape your whole catalogue, and they can measure how fast you are growing by watching the numbers climb. UUIDs are unguessable. They can also be **generated on the client** before the row is saved, which matters when you upload an image named after the artwork id before the artwork row exists. And they never **collide across tables** — an id from `artists` can never accidentally equal an id from `artworks`, so a bug that passes the wrong id somewhere fails loudly instead of silently reading the wrong row. The cost is eight extra bytes per row and slightly larger indexes. For an app of this size that cost is invisible.\n\n**`created_at timestamptz not null default now()`.** Set once, at insert, never touched again. Always `timestamptz`, never plain `timestamp` — `timestamptz` stores an absolute instant in UTC and renders correctly for a viewer in India or anywhere else, whereas `timestamp` stores a wall-clock reading with no timezone and will eventually lie to you.\n\n**`updated_at timestamptz not null default now()`.** This one must change on every update, and you must not trust the application to remember. Forty code paths update an artist row; forty chances to forget to set `updated_at`. So you do not set it in JavaScript at all. You write **one trigger function**, `set_updated_at()`, that stamps `new.updated_at = now()` before every update, and you attach it to every editable table with a `before update` trigger. Write it once, attach it eighteen times, forget about it forever.\n\nOne subtlety worth internalising now: the function is written once and is completely generic — it names no table and no other column, so the same function body serves `artists`, `artworks`, `reviews`, and every other table. The trigger is what binds the generic function to a specific table. Functions are reusable; triggers are the wiring.',
          diagram: `graph TD
    F["set_updated_at()<br/>generic trigger function<br/>new.updated_at = now()"]
    F --> TA[trigger on artists]
    F --> TB[trigger on artworks]
    F --> TC[trigger on reviews]
    F --> TD[trigger on profiles]
    F --> TE["... every editable table"]
    U[UPDATE arrives on any row] --> BE{before update<br/>trigger fires}
    BE --> STAMP[row.updated_at set to now]
    STAMP --> WRITE[row written with fresh timestamp]
    subgraph choice[id type choice]
      UUID["uuid: unguessable,<br/>client-generatable,<br/>no cross-table collision"]
      SER["bigserial: 1,2,3...<br/>enumerable, leaks growth rate"]
    end`,
          flowExplain:
            'One generic function fans out to a trigger on every editable table. The application never touches updated_at; the database stamps it on the way in, so it can never be forgotten.',
          whyItMatters:
            'Interviewers probe this because it reveals whether you understand that the database can enforce invariants the application keeps forgetting. "How do you keep updated_at correct?" has a wrong answer ("I set it in the service layer") and a right one ("a before-update trigger, so it is impossible to forget"). The uuid-versus-serial reasoning — enumeration, client generation, collision safety — is a second, separate signal of maturity.',
          steps: [
            'Adopt the three-column contract as non-negotiable: id uuid, created_at timestamptz, updated_at timestamptz. Every editable table, no exceptions.',
            'Write the `set_updated_at()` function exactly once, near the top of your migration, before any table that uses it.',
            'For each editable table, add a `before update ... for each row execute function set_updated_at()` trigger. Lookup tables you never edit at runtime can skip it.',
            'Always choose `timestamptz`, never `timestamp`. Store the instant, render the local time in the UI.',
            'Default ids with `gen_random_uuid()` so a row can be inserted without the client supplying an id, while still allowing the client to supply one when it needs the id early.',
          ],
          code: `-- Written ONCE, near the top of schema.sql. Generic: names no table.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- The uniform contract, on every editable table.
create table if not exists public.artists (
  id         uuid        primary key default gen_random_uuid(),
  created_at timestamptz not null    default now(),   -- set once, never touched
  updated_at timestamptz not null    default now()    -- maintained by the trigger
  -- ... the rest of the columns follow in m3-t6
);

-- Attach the generic function to this table. Repeat per editable table.
drop trigger if exists trg_artists_updated_at on public.artists;
create trigger trg_artists_updated_at
  before update on public.artists
  for each row execute function public.set_updated_at();

-- Why uuid and not bigserial, in one demonstration:
--   /artworks/41  with bigserial  -> attacker visits /artworks/1..40 and scrapes all
--   /artworks/9c8f...-...  with uuid -> nothing to guess, nothing to enumerate
-- And a uuid can be generated in JS before the row exists, so an uploaded
-- image can be named artworkId.jpg before the artworks INSERT runs.`,
          pitfalls: [
            '**Setting updated_at from the service layer.** One of your forty update paths will forget, and that row will silently claim it was last changed months ago. Fix: a before-update trigger stamps it in the database, where forgetting is impossible.',
            '**Using `timestamp` instead of `timestamptz`.** It stores a wall-clock reading with no zone; the same value means different instants to different servers. Fix: `timestamptz` everywhere, always.',
            '**Choosing bigserial primary keys for a public app.** Sequential ids let anyone enumerate your catalogue and read your growth rate off the URL bar. Fix: `uuid default gen_random_uuid()`.',
            '**Writing a separate updated_at function per table.** Eighteen near-identical functions is eighteen things to change when the logic evolves. Fix: one generic function, many triggers.',
            '**Forgetting `drop trigger if exists` before `create trigger`.** Re-running the migration then errors on the duplicate trigger. Fix: drop-if-exists before create, so the whole schema.sql is idempotent.',
          ],
          tryIt:
            'Add the trigger to the `reviews` table yourself, then update a review and select `created_at, updated_at`. Confirm created_at is unchanged and updated_at moved. Then delete the trigger, update again, and watch updated_at go stale — that stale value is exactly the bug the trigger prevents.',
          takeaway:
            'Every editable table wears the same three columns; write set_updated_at() once and attach it everywhere; prefer uuid over bigserial so ids are unguessable, client-generatable, and collision-free.',
        },
        {
          id: 'm3-t4',
          title: 'Constraints as documentation',
          explain:
            'A constraint is a rule the database refuses to break, and a well-chosen set of constraints documents your intentions more reliably than any comment ever could.',
          analogy:
            'A well-designed seva form at the temple will not physically let you leave the amount blank, will not accept a rating of six stars out of five, and ties every receipt to a real booking so a receipt can never float free of its booking. The form is the rule. You do not need a note that says "please fill the amount" — the form simply will not proceed. Constraints are that form, enforced by Postgres on every write from every client forever.',
          theory:
            'Comments drift out of date; constraints cannot, because the database enforces them on every single write. Four kinds carry almost all the weight in KalaKaara.\n\n**`not null`** says a fact is mandatory. An artwork without an `artist_id` is meaningless — it belongs to nobody — so `artist_id uuid not null`. A bio, by contrast, is optional, so it is nullable. Each `not null` you write is a sentence: "this is required." Each column you leave nullable is the opposite sentence, and you should mean it.\n\n**`check`** encodes a business rule directly into the column. `check (rating between 1 and 5)` makes a six-star review impossible to store, from any client, forever. `check (radius_km > 0)` makes a nonsensical service radius impossible. These rules would otherwise live in scattered validation code that some code path forgets; in the schema they are enforced once and cannot be bypassed.\n\n**`unique`** says a value, or a combination of values, may appear at most once. `slug text unique` guarantees two artists cannot claim the same URL. The more interesting form is the **composite** unique: `unique(user_id, artist_id)` on `favorites` means one user may favourite one artist at most once — the pair is unique, though each column repeats freely. The same shape on `reviews` enforces one review per user per artist, which is a real product rule made unbreakable in one line.\n\n**`references ... on delete`** is where most beginners guess and most bugs hide. A foreign key ties a child row to a parent, and you must choose what happens to the child when the parent is deleted. **`on delete cascade`** deletes the children too — correct when the child cannot exist without the parent. Delete an artist and their artworks, favourites, and service areas should vanish with them; they are meaningless orphaned. **`on delete restrict`** blocks the delete while children exist — correct for lookup tables you must protect. You should not be able to delete the `categories` row for "Portrait" while forty artists are tagged with it; restrict forces you to deal with the artists first. **`on delete set null`** keeps the child but nulls the link — correct when the child survives the parent meaningfully. If an `availability` option is retired, an artist row should survive with `availability_id` set to null rather than being deleted.\n\nChoosing correctly for each foreign key is a design act, not a default. Walk every foreign key in the schema and ask one question: if the parent disappears, should this child die with it, block the deletion, or live on orphaned? The answer picks cascade, restrict, or set null.',
          diagram: `graph TD
    FK[A foreign key: parent deleted, what happens to the child?] --> Q{Can the child<br/>exist without<br/>the parent?}
    Q -- "No, it is meaningless" --> CAS["on delete cascade<br/>artworks, favorites,<br/>artist_service_areas"]
    Q -- "No, and the parent<br/>must be protected" --> RES["on delete restrict<br/>categories, languages,<br/>location lookups"]
    Q -- "Yes, it survives<br/>with a broken link" --> SN["on delete set null<br/>artists.availability_id"]
    subgraph other[Other constraints as documentation]
      NN["not null = required fact"]
      CK["check = business rule<br/>rating between 1 and 5"]
      UQ["unique(user_id, artist_id)<br/>= at most once per pair"]
    end`,
          flowExplain:
            'The decision tree is the whole skill: for every foreign key, ask whether the child can survive without its parent, and whether the parent needs protecting. That one question chooses cascade, restrict, or set null.',
          whyItMatters:
            'Cascade choices are a favourite interview trap because getting them wrong is catastrophic in opposite directions: too much cascade and deleting one lookup row wipes half your data; too little and you accumulate orphaned rows that break every join. Being able to justify each choice per foreign key demonstrates you think about data integrity as a system property, not a per-query afterthought.',
          steps: [
            'Mark every column as `not null` unless you can name a real reason it may be absent. Absence should be a decision, not an oversight.',
            'For every column with a bounded range or a business rule, add a `check`. Ratings, radii, prices, and percentages all deserve one.',
            'Add a composite `unique` wherever a pair must not repeat: favorites and reviews both use `unique(user_id, artist_id)`.',
            'Walk every foreign key and choose its on-delete action deliberately: cascade for owned children, restrict for protected lookups, set null for survivors.',
            'Read your finished table definition top to bottom as prose. If it does not describe the business rules accurately, your constraints are wrong, not your comments.',
          ],
          code: `-- Constraints that document the reviews table so completely you barely need comments.
create table public.reviews (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references profiles(id) on delete cascade,
  artist_id  uuid        not null references artists(id)  on delete cascade,
  rating     integer     not null check (rating between 1 and 5),
  comment    text,                       -- nullable ON PURPOSE: a rating alone is allowed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, artist_id)            -- one review per user per artist. Unbreakable.
);
-- Read it aloud: a review must have a user and an artist (not null);
-- deleting either removes the review (cascade); the rating is 1 to 5 (check);
-- a user reviews an artist at most once (unique pair). No comment required.

-- The three on-delete choices, each correct for its case:
--   artworks.artist_id      references artists(id)     on delete cascade
--     -> an artwork cannot exist without its artist; delete both together.
--   artist_categories.category_id references categories(id) on delete restrict
--     -> do NOT let someone delete the "Portrait" category out from under artists.
--   artists.availability_id references availability(id) on delete set null
--     -> retire an availability option; the artist survives with a null link.`,
          pitfalls: [
            '**Defaulting every foreign key to cascade.** Then deleting the "Portrait" category silently deletes its junction rows and quietly changes which categories forty artists appear under. Fix: cascade only owned children; restrict protected lookups.',
            '**Leaving columns nullable by inertia.** A nullable `artist_id` on artworks lets an orphaned artwork exist, and every join has to defend against it. Fix: `not null` by default; nullable only when absence is a real, intended state.',
            '**Enforcing "one review per user per artist" in application code.** Two rapid taps create two reviews before your check runs. Fix: a composite `unique(user_id, artist_id)` makes the race impossible at the database.',
            '**Putting range checks in React instead of the column.** The browser can be bypassed; a crafted request sends rating 99. Fix: `check (rating between 1 and 5)` on the column, so no client can store an invalid value.',
            '**Choosing `set null` on a `not null` foreign key.** The two contradict — Postgres cannot null a column that forbids null — and the delete errors. Fix: `set null` requires a nullable column; use cascade or restrict when the link is mandatory.',
          ],
          tryIt:
            'Decide the on-delete action for `favorites.artist_id`. Should deleting an artist remove the favourites pointing at them, block the deletion, or orphan them? (Answer: cascade — a favourite of a deleted artist is meaningless, so it should vanish with the artist.)',
          takeaway:
            'Constraints document intent the database will enforce forever: not null for required facts, check for business rules, composite unique for "at most once", and a deliberate cascade / restrict / set null on every foreign key.',
        },
      ],
    },
    {
      id: 'm3-s2',
      title: 'The eighteen tables',
      topics: [
        {
          id: 'm3-t5',
          title: 'profiles and the new-user trigger',
          explain:
            'The `profiles` table mirrors Supabase auth users into your own schema, and a trigger on auth.users creates the profile row atomically the instant someone signs in.',
          analogy:
            'When a devotee registers at the temple office, the clerk does not wait for them to walk to a second counter to open a donation ledger page — the moment the register entry is made, the ledger page is created in the same stroke. If those were two separate walks, some devotees would register and then wander off, leaving a ledger with no page. The trigger is the clerk doing both in one motion.',
          theory:
            'Supabase manages authentication in a schema you do not own: `auth.users`. You can read it, but you should not build foreign keys and application columns onto a table another system controls. So KalaKaara keeps its own `profiles` table in the `public` schema, with `id` referencing `auth.users(id)`, plus the application-level fields you actually display: `full_name` and `avatar_url`. Every other table that needs to point at a user points at `profiles`, never at `auth.users` directly.\n\nThe question is *when* the profile row gets created. The tempting answer is "from React, right after sign-in". That answer is a trap. Sign-in and the profile insert would be two separate network calls, and if the connection drops between them — a real event on 4G near Maravanthe — you are left with an authenticated user who has no profile row. Every page that joins to `profiles` now breaks for that user, and you will spend an evening chasing an "orphaned auth user" you cannot easily reproduce.\n\nThe correct answer is a **database trigger**. You write a function `handle_new_user()` and attach it as an `after insert` trigger on `auth.users`. The instant GoTrue inserts the auth user, in the same transaction, the trigger inserts the matching `profiles` row. It is atomic: either both happen or neither does. React never has to remember, and there is no window in which a user exists without a profile.\n\nTwo details make this function correct rather than merely working. First, it must be **`security definer`**. A trigger on `auth.users` runs in the context of whoever caused the insert — an anonymous sign-up — who has no permission to write into `public.profiles`. `security definer` runs the function with the privileges of its owner (the schema owner) instead of the caller, so the insert is allowed. Second, precisely because it is `security definer`, you must **pin the search_path**: `set search_path = public`. Without that pin, a `security definer` function inherits the caller search_path, and a hostile caller could prepend a schema of their own to hijack an unqualified table name and run their code with owner privileges. Pinning the search_path closes that hole. Write these two lines every time you write a `security definer` function; they are not optional decoration.',
          diagram: `graph TD
    U[User taps 'Sign in with Google'] --> GT[GoTrue completes OAuth]
    GT --> INS[INSERT into auth.users]
    INS --> TRG{after insert trigger<br/>handle_new_user}
    TRG --> DEF["runs as SECURITY DEFINER<br/>search_path pinned to public"]
    DEF --> PROF[INSERT into public.profiles<br/>id, full_name, avatar_url]
    PROF --> DONE[User has an auth row<br/>AND a profile row<br/>atomically]
    X[The WRONG way] -.-> R[React inserts profile after sign-in]
    R -.-> DROP[network drops between the two calls]
    DROP -.-> ORPH[authenticated user,<br/>no profile row = orphan]`,
          flowExplain:
            'The solid path is one atomic transaction: the auth insert and the profile insert succeed or fail together. The dashed path is the bug — two separate calls with a gap where the profile never gets created.',
          whyItMatters:
            'This exact pattern — mirror auth users into a profiles table via an after-insert trigger — is the canonical Supabase setup, and interviewers who know Supabase ask about it directly. The `security definer` plus pinned `search_path` pairing is a genuine security control; getting it half-right (definer without the pin) is a real, exploitable vulnerability, so knowing both halves signals you understand privilege escalation, not just syntax.',
          steps: [
            'Create `public.profiles` with `id uuid primary key references auth.users(id) on delete cascade`, plus `full_name` and `avatar_url`.',
            'Write `handle_new_user()` as a plpgsql function that inserts into `public.profiles` using `new.id` and the OAuth metadata.',
            'Mark the function `security definer` so it may write to profiles despite the anonymous caller, and `set search_path = public` to close the hijack hole.',
            'Attach it as `after insert on auth.users for each row`, dropping any existing trigger first so the migration re-runs cleanly.',
            'Never insert into profiles from React. Let the trigger own that row so an authenticated user can never exist without a profile.',
          ],
          code: `-- profiles mirrors auth.users into a schema you own.
create table if not exists public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The trigger function. Two non-negotiable lines: security definer + search_path.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer            -- runs as the owner, so it may write to profiles
set search_path = public    -- pin it, or a hostile caller can hijack table names
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',   -- Google fills this in
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

-- Fire it the instant an auth user is created. Same transaction. Atomic.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();`,
          pitfalls: [
            '**Creating the profile from React after sign-in.** A dropped call between sign-in and insert leaves an authenticated user with no profile, breaking every join to profiles for that user. Fix: an after-insert trigger on auth.users creates it atomically.',
            '**Writing `security definer` without pinning `search_path`.** A caller can prepend their own schema and make an unqualified table name resolve to their malicious table, running it with owner privileges. Fix: always `set search_path = public` on definer functions, and schema-qualify tables inside.',
            '**Forgetting `security definer` entirely.** The anonymous sign-up caller has no rights on public.profiles, so the trigger insert is denied and sign-in fails. Fix: the function must run as its owner, not the caller.',
            '**Referencing auth.users directly from application tables.** Coupling your foreign keys to a schema Supabase controls is fragile. Fix: point application foreign keys at public.profiles, and let profiles alone reference auth.users.',
            '**Omitting `on delete cascade` from profiles.id.** Delete an auth user and the profile lingers as an orphan. Fix: `references auth.users(id) on delete cascade` so removing the auth user removes the profile.',
          ],
          tryIt:
            'In the Supabase SQL editor, insert a fake row into auth.users (or sign in once with Google), then `select * from public.profiles`. Confirm the profile appeared with no React code involved. Then read the function and explain, in one sentence, what a caller could do if you removed the `set search_path` line.',
          takeaway:
            'profiles mirrors auth.users into your own schema, and a security-definer, search-path-pinned trigger on auth.users creates each profile atomically so a user can never exist without one.',
        },
        {
          id: 'm3-t6',
          title: 'artists — every column, explained',
          explain:
            'The artists table is the heart of KalaKaara, and every one of its columns earns its place — identity, presentation, pricing, contact, publishing state, and the denormalised rating counters.',
          analogy:
            'The artists row is like the full registration card an artist fills at a santhe stall: who they are, one photo of themselves and one of their stall banner, how long they have been at it, what they charge, how to reach them, and whether their stall is open to the public today. Every line on that card is a column, and a blank line means a real decision about what the public may see.',
          theory:
            'Read the artists table in five groups.\n\n**Identity and ownership.** `id` is the uuid primary key. `user_id` references `profiles(id)` and is **unique** — this is the one-to-one from Module topic 1, guaranteeing at most one artist profile per user, and it is the column every RLS policy on this table checks against `auth.uid()`. `slug` is a unique, URL-safe handle like `rukmini-shetty` so the public URL is `/artists/rukmini-shetty` rather than a raw uuid; it is unique because two artists cannot share a URL.\n\n**Presentation.** `display_name` is required text. `bio` is nullable long text. `years_experience` is an integer. `avatar_url` and `cover_url` are the storage paths for the profile photo and the banner, both nullable because a brand-new artist may not have uploaded them yet.\n\n**Pricing and pace.** `base_price` is the starting price, `is_negotiable` a boolean defaulting to false (the safe default — assume fixed unless the artist says otherwise). `availability_id` references the `availability` lookup ("available now", "booked till next month") with `on delete set null`, so retiring an availability option does not delete the artist.\n\n**Contact.** `phone`, `whatsapp`, `instagram`, `facebook`, `website` — all nullable, all withheld from anonymous callers by RLS in Module 10. They live on the row; the database simply refuses to return the sensitive ones to a caller who is not signed in.\n\n**Publishing and reputation.** `is_published` is a boolean defaulting to **false** — the assertion-with-safe-default rule, so a half-built profile is never accidentally public. `rating_avg` and `review_count` are the two deliberate denormalisations from topic 2: maintained by a trigger on the reviews table (Module 13), they let a browse grid of fifty artists sort by rating without firing fifty aggregate queries. `home_lat` and `home_lng` are the artist studio coordinates, used by the radius-matching half of Module 8 and indexed for the bounding-box prefilter.\n\nEvery nullable column here is a product decision. A required `display_name` says "you cannot publish without a name". A nullable `bio` says "a bio is encouraged but not mandatory". Read the table and you have read the rules of what it means to be an artist on KalaKaara.',
          diagram: `graph TD
    subgraph artists[artists row]
      ID[id uuid pk]
      UID[user_id uuid UNIQUE -> profiles<br/>= ownership, checked by RLS]
      SLUG[slug text UNIQUE -> the public URL]
      PRES[display_name, bio,<br/>years_experience,<br/>avatar_url, cover_url]
      PRICE[base_price, is_negotiable=false,<br/>availability_id -> availability]
      CON[phone, whatsapp, instagram,<br/>facebook, website<br/>= withheld by RLS to anon]
      PUB[is_published=false<br/>= safe default]
      REP[rating_avg, review_count<br/>= denormalised, trigger-maintained]
      GEO[home_lat, home_lng<br/>= indexed for radius match]
    end`,
          flowExplain:
            'The two columns to keep in mind everywhere else in the course are `user_id` (unique, the ownership key every policy checks) and `is_published` (false by default, the switch that makes a profile public).',
          whyItMatters:
            'The artists table is where the whole design comes together: the one-to-one ownership key, the assertive boolean with a safe default, the withheld contact columns, and the denormalised counters all live on this one row. Being able to explain why `user_id` is unique and why `is_published` defaults to false shows you understand that schema columns encode product and security rules, not just data.',
          steps: [
            'Make `user_id` a unique foreign key to profiles — this both enforces one-artist-per-user and gives every RLS policy its ownership check.',
            'Make `slug` unique and URL-safe; generate it from the display name in the service layer, appending a suffix on collision.',
            'Default `is_negotiable` and `is_published` to false — booleans are assertions with the safe value as default.',
            'Add `rating_avg numeric(2,1)` and `review_count integer`, both defaulting to 0, and leave them for the Module 13 trigger to maintain.',
            'Add `home_lat` and `home_lng` as double precision, nullable until the artist sets a studio location, and remember to index them in topic 11.',
          ],
          code: `create table if not exists public.artists (
  id              uuid        primary key default gen_random_uuid(),
  -- identity + ownership
  user_id         uuid        not null unique references profiles(id) on delete cascade,
  slug            text        not null unique,
  -- presentation
  display_name    text        not null,
  bio             text,
  years_experience integer     not null default 0 check (years_experience >= 0),
  avatar_url      text,
  cover_url       text,
  -- pricing + pace
  base_price      numeric(10,2) check (base_price >= 0),
  is_negotiable   boolean     not null default false,   -- safe default: assume fixed
  availability_id uuid        references availability(id) on delete set null,
  -- contact (withheld from anon by RLS, Module 10)
  phone           text,
  whatsapp        text,
  instagram       text,
  facebook        text,
  website         text,
  -- publishing + reputation
  is_published    boolean     not null default false,   -- safe default: private until ready
  rating_avg      numeric(2,1) not null default 0,       -- denormalised, trigger-maintained
  review_count    integer     not null default 0,        -- denormalised, trigger-maintained
  -- geo, for radius matching (Module 8)
  home_lat        double precision,
  home_lng        double precision,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);`,
          pitfalls: [
            '**Leaving `user_id` non-unique.** One user can then create many artist profiles, and "which one is theirs?" has no answer. Fix: `unique` on user_id enforces the one-to-one and anchors every RLS policy.',
            '**Defaulting `is_published` to true.** Half-built profiles go public the instant they are created. Fix: default false; the artist flips it to true only when the profile is ready.',
            '**Treating rating_avg as a column you write from React.** Client-computed averages drift the moment two reviews race. Fix: leave it to the Module 13 trigger; never set it by hand.',
            '**Storing contact details in a separate "public" and "private" table to hide them.** That duplicates the artist and complicates every join. Fix: keep contact columns on the artists row and let RLS withhold them per caller.',
            '**Making `slug` non-unique or deriving it without collision handling.** Two "Ganesh Acharya" artists then fight over the same URL. Fix: unique slug, with a numeric suffix appended on collision in the service layer.',
          ],
          tryIt:
            'Two artists both named "Shalini Kamath" sign up. What must the slug for the second one become, and where does that logic live? (Answer: something like `shalini-kamath-2`, generated in artistService before insert; the unique constraint on slug is the safety net that forces the retry.)',
          takeaway:
            'The artists row carries identity, presentation, pricing, contact, and reputation; its unique user_id is the ownership key every policy checks, and its false-by-default is_published keeps unfinished profiles private.',
        },
        {
          id: 'm3-t7',
          title: 'Lookups and junctions — categories, languages, availability',
          explain:
            'Controlled vocabularies live in their own lookup tables, and an artist connects to many of them through junction tables with composite primary keys.',
          analogy:
            'At the santhe, the list of stall types — vegetables, flowers, pots, cloth — is printed once on the notice board, and each stall holder ticks the types they deal in. The board is the lookup table; the ticks are the junction rows. Nobody writes "vegetabels" freehand on their own sign, because then no customer could reliably find all the vegetable stalls.',
          theory:
            'A **lookup table** holds a controlled vocabulary — a fixed, curated set of values you filter on. `categories` (Portrait, Mural, Calligraphy, Sculpture) and `languages` (Kannada, Tulu, Konkani, English, Hindi) are lookups. Each has an `id`, a `name`, and often a `slug`. The point of a lookup is that "Portrait" is spelled once, in one row, so filtering is exact.\n\nAn artist works in many categories and speaks many languages, and each category and language belongs to many artists — pure many-to-many. So you connect them with **junction tables**: `artist_categories(artist_id, category_id)` and `artist_languages(artist_id, language_id)`. The critical design choice is the **composite primary key** `(artist_id, category_id)`. It has two effects at once: it makes the pair unique, so an artist cannot be tagged with "Portrait" twice, and it removes the need for a separate `id` column, because the pair *is* the identity of the row.\n\nWhy a junction table and not a `text[]` column of category names on the artist? An array cannot hold a foreign key, so nothing stops "Portriat" from creeping in. An array cannot participate in a clean join, so "give me every artist in the Portrait category, sorted by rating" becomes an awkward array-contains query that fights the planner. And renaming "Portrait" to "Portrait Painting" in an array means rewriting every artist row, whereas in the lookup it is one update to one row that every junction reference sees instantly. The junction is more tables and more joins, and it is worth it every time the values are a **controlled vocabulary you filter on**. (Contrast this with artwork `tags` in the next topic, which are free-form and genuinely belong in an array.)\n\n`availability` is a simpler lookup — a small set of pace options like "Available now", "Booked for a month", "Not taking work" — but it is a plain one-to-many, not a junction, because an artist has exactly one availability at a time. So `artists.availability_id` references it directly, no junction needed. Recognising when a relationship is many-to-many (needs a junction) versus one-to-many (needs only a foreign key) is the judgment this topic trains.',
          diagram: `graph TD
    subgraph lookups[Lookup tables: controlled vocabulary, spelled once]
      CAT[categories: id, name, slug]
      LAN[languages: id, name]
      AV[availability: id, label]
    end
    A[artists] -->|many-to-many| AC[artist_categories<br/>PK: artist_id + category_id]
    CAT -->|many-to-many| AC
    A -->|many-to-many| AL[artist_languages<br/>PK: artist_id + language_id]
    LAN -->|many-to-many| AL
    A -->|one-to-many| AVFK[artists.availability_id]
    AV --> AVFK
    NOTE["junction = composite PK,<br/>no id column, the pair IS the row"]`,
          flowExplain:
            'Categories and languages need junction tables because the relationship is many-to-many; availability needs only a foreign key on artists because an artist has exactly one at a time. The composite primary key on each junction makes the pair unique and removes the need for a surrogate id.',
          whyItMatters:
            'The junction-table-versus-array decision is a classic data-modelling interview question, and the composite-primary-key detail is what distinguishes someone who has actually built a many-to-many from someone who has only read about it. Being able to say "controlled vocabulary I filter on gets a junction; free-form text I never join gets an array" is exactly the judgment the question is probing.',
          steps: [
            'Create `categories` and `languages` as lookup tables with id, name, and a unique slug, seeded once with the controlled vocabulary.',
            'Create `artist_categories` and `artist_languages` with two foreign keys each and a composite primary key on the pair — no surrogate id column.',
            'Give both foreign keys in each junction `on delete cascade` so removing an artist cleans up their tags, and set the category/language side to `restrict` to protect the vocabulary.',
            'Create `availability` as a lookup, but connect it with a single `availability_id` foreign key on artists — one-to-many, no junction.',
            'When you next model a set of values, ask: controlled vocabulary I filter on, or free-form text I never join? The first is a junction; the second is an array.',
          ],
          code: `-- Lookup tables: the vocabulary, spelled once.
create table if not exists public.categories (
  id   uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);
create table if not exists public.languages (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);
create table if not exists public.availability (
  id    uuid primary key default gen_random_uuid(),
  label text not null unique          -- 'Available now', 'Booked for a month'
);

-- Junction: many artists <-> many categories. Composite PK, no id column.
create table if not exists public.artist_categories (
  artist_id   uuid not null references artists(id)    on delete cascade,
  category_id uuid not null references categories(id) on delete restrict,
  primary key (artist_id, category_id)   -- the pair is unique AND is the identity
);
create table if not exists public.artist_languages (
  artist_id   uuid not null references artists(id)   on delete cascade,
  language_id uuid not null references languages(id) on delete restrict,
  primary key (artist_id, language_id)
);

-- Filtering is now an exact join, never a fuzzy array-contains:
select a.* from artists a
join artist_categories ac on ac.artist_id = a.id
join categories c on c.id = ac.category_id
where c.slug = 'portrait-painting' and a.is_published;`,
          pitfalls: [
            '**Storing categories as a `text[]` of names on the artist.** No foreign key means typos creep in, joins get awkward, and renaming a category means rewriting every artist row. Fix: a junction table for any controlled vocabulary you filter on.',
            '**Adding a surrogate `id` to a junction table.** It invites duplicate pairs — the same artist-category twice — because nothing forbids them. Fix: a composite primary key on the two foreign keys makes the pair unique by construction.',
            '**Cascading the delete on the category side of the junction.** Then deleting a category quietly untags every artist. Fix: `on delete restrict` on the lookup side protects the vocabulary; cascade only on the artist side.',
            '**Modelling availability as a junction table.** An artist has exactly one availability, so a junction is over-engineering and lets contradictory rows exist. Fix: a single `availability_id` foreign key on artists.',
            '**Putting a category name column on the junction.** It duplicates the name per artist and drifts on rename. Fix: the name lives only in categories; the junction holds ids.',
          ],
          tryIt:
            'An artist should list the mediums they own (oil paints, watercolours, digital tablet) so buyers can filter by "artists who work in oil". Junction or array? (Answer: junction — it is a controlled vocabulary you filter on, so `mediums` lookup plus `artist_mediums` junction, exactly like categories.)',
          takeaway:
            'Controlled vocabularies get lookup tables; many-to-many links get junction tables with a composite primary key and no surrogate id; a one-per-artist attribute like availability needs only a foreign key.',
        },
        {
          id: 'm3-t8',
          title: 'artworks — and why tags is an array but categories are not',
          explain:
            'The artworks table is the portfolio, and it deliberately uses an array column for tags while using a junction table for categories — because the two kinds of value have opposite jobs.',
          analogy:
            'A painting at a gallery has a printed label — title, medium, size, price — and beside it a small basket where the artist drops loose hand-written keyword cards: "sunset", "temple", "commission". The printed label is controlled; the loose cards are whatever the artist felt like writing that morning. You file paintings by their controlled category, never by the loose cards. The label is a column, the basket is an array.',
          theory:
            'An `artworks` row belongs to one artist (`artist_id`, one-to-many) and describes one piece: `title`, `description`, `category_id` referencing the same `categories` lookup the artist uses, `price`, `is_negotiable`, `medium` (free text like "oil on canvas"), `dimensions` (free text like "24 by 36 inches"), `image_url` (the storage path), `is_featured` (a boolean the artist sets to surface a piece), and `created_at`. Most of these you have seen before.\n\nThe interesting column is `tags text[]` — an actual Postgres array. This looks like it contradicts everything the previous topic said about arrays being bad. It does not, and understanding why is the whole point of this topic.\n\n**Categories are a controlled vocabulary that is filtered on.** The browse page has a category filter. "Show me all Portrait artworks" must be exact, must join cleanly, and must survive a rename of the category. So `category_id` is a foreign key into `categories`, and the relationship is a proper one-to-many. A category is a structural fact about the artwork.\n\n**Tags are free-form and never joined.** An artist types whatever describes the piece — "monsoon", "grandmother", "in progress" — and no filter dropdown is ever built from them. There is no `tags` lookup table because there is no controlled vocabulary; the set is open and per-artist. Tags are searched, at most, with a loose "does this artwork mention X" — never joined, never aggregated into a filter. For a value that is a per-row bag of free text you never join on, a `text[]` array is exactly right: it stores the bag directly on the row, needs no junction, and Postgres can index it with a GIN index if you ever want containment search.\n\nSo the rule crystallises: **join it and filter on it with a dropdown, and it is a foreign key to a lookup (or a junction). Bag of free text you only ever display or loosely search, and it is an array.** Categories and tags sit on opposite sides of that line, and putting each on the correct side is the judgment this topic teaches. Getting it backwards — categories as an array, tags as a junction — gives you a category filter that cannot be trusted and a tags table nobody ever queries.',
          diagram: `graph TD
    AW[artworks row] --> CAT{category_id}
    CAT --> LK["FK -> categories lookup<br/>CONTROLLED, filtered on,<br/>joined, survives rename"]
    AW --> TG{tags}
    TG --> ARR["text[] array on the row<br/>FREE-FORM, never joined,<br/>open per-artist vocabulary"]
    DEC[The deciding question] --> Q1["Filtered with a dropdown<br/>and joined? -> lookup / FK"]
    DEC --> Q2["Bag of free text you<br/>only display? -> array"]
    style LK fill:#ddd6fe
    style ARR fill:#ddd6fe`,
          flowExplain:
            'Same table, two collection-valued attributes, opposite implementations. Category is a foreign key because it is joined and filtered; tags is an array because it is a free-form bag you never join on.',
          whyItMatters:
            'This is one of the sharpest data-modelling judgment calls, and it comes up constantly in real work: someone always wants to "just use an array" for something that should be a join, or build a whole table for something that is really free text. Being able to articulate the deciding question — do you filter and join on it? — is what makes you the person who gets the schema right the first time.',
          steps: [
            'Give artworks a `category_id` foreign key into the same categories lookup the artist uses, so category filtering is exact and joinable.',
            'Give artworks a `tags text[]` column with a sensible default of an empty array, for free-form keywords.',
            'Keep `medium` and `dimensions` as free text — they are displayed, occasionally searched, never filtered with a controlled dropdown.',
            'If you later want tag search, add a GIN index on the tags array rather than converting tags into a junction table.',
            'Before adding any new collection column, ask the deciding question: filtered-and-joined means a foreign key; free-form bag means an array.',
          ],
          code: `create table if not exists public.artworks (
  id            uuid        primary key default gen_random_uuid(),
  artist_id     uuid        not null references artists(id) on delete cascade,
  title         text        not null,
  description   text,
  category_id   uuid        references categories(id) on delete set null, -- CONTROLLED
  price         numeric(10,2) check (price >= 0),
  is_negotiable boolean     not null default false,
  medium        text,                          -- free text: 'oil on canvas'
  dimensions    text,                          -- free text: '24 x 36 in'
  image_url     text,
  tags          text[]      not null default '{}',  -- FREE-FORM bag, never joined
  is_featured   boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- CATEGORY: exact, joinable, filterable (controlled vocabulary).
select * from artworks where category_id = :portrait_id;

-- TAGS: loose containment on a free-form bag (no lookup, no join).
select * from artworks where tags @> array['monsoon'];
-- '@>' means "array contains". Add a GIN index if this gets frequent:
-- create index artworks_tags_gin on artworks using gin (tags);`,
          pitfalls: [
            '**Making category a `text[]` array to "keep it flexible".** The category filter can no longer be trusted, joins get awkward, and renames rewrite every row. Fix: category is a controlled vocabulary you filter on, so it is a foreign key.',
            '**Building a `tags` lookup and junction table.** You will maintain a vocabulary nobody curates and joins nobody runs, for values that are inherently free-form. Fix: `text[]` on the artwork; add a GIN index only if search demands it.',
            '**Forgetting the empty-array default on the tags column.** Null arrays and empty arrays behave differently and every consumer must then defend against null. Fix: default to an empty array so tags is always a real array.',
            '**Cascading category deletes onto artworks.** Deleting a category would delete artworks tagged with it. Fix: `on delete set null` on artworks.category_id — the artwork survives, merely uncategorised.',
            '**Putting `medium` into a lookup table.** It is free-form descriptive text ("charcoal and pastel on toned paper") that you display, not filter with a dropdown. Fix: leave it a text column.',
          ],
          tryIt:
            'The team wants a "Trending this week" filter driven by hashtags on artworks. Does that change tags from an array into a lookup? (Answer: if the hashtags become a curated, filterable dropdown, yes — that is now a controlled vocabulary and wants a lookup plus junction; if they stay free-form and you only rank by frequency, an array with a GIN index still fits.)',
          takeaway:
            'Category is a foreign key because it is controlled, joined, and filtered; tags is an array because it is free-form and never joined — the deciding question is whether you filter and join on the values.',
        },
        {
          id: 'm3-t9',
          title: 'The location hierarchy and service areas',
          explain:
            'Four nested location tables form a chain from state down to city, and a service-area table lets each artist declare coverage at any level — or as a radius — with a check constraint enforcing that exactly the right column is filled.',
          analogy:
            'A Karnataka postal address nests like a set of stacking dabbas: the state contains districts, a district contains taluks, a taluk contains villages and towns. And a delivery boy declares his range differently depending on the job — "all of Udupi district", or "just Kundapura town", or "anything within 5 km of my shop". The address dabbas are the location tables; the delivery boy declarations are the service areas.',
          theory:
            'The location chain is four tables — `states`, `districts`, `taluks`, `cities` — each carrying a `name`, a `lat`, a `lng`, and a foreign key pointing **up** to its parent: `cities.taluk_id`, `taluks.district_id`, `districts.state_id`. (KalaKaara also seeds a `countries` table above states and a `pincodes` table below cities for fine-grained reverse geocoding, rounding the geography out.) Because the chain exists, "is Manipal inside Udupi district?" is a join up the foreign keys, not a string comparison — which is precisely the normalisation payoff from topic 2 and the foundation of Module 8 matching. Each row also stores lat/lng so a searched place has coordinates for the radius half of matching.\n\nThe harder table is `artist_service_areas`. An artist declares one or more areas, and each area has a **type** drawn from the `service_area_types` lookup: country, state, district, taluk, city, or radius. The type dictates which columns are meaningful. A `district` area fills `district_id` and leaves the rest null. A `city` area fills `city_id`. A `radius` area fills `center_lat`, `center_lng`, and `radius_km` and leaves all the administrative ids null. A `country` area fills nothing — it matches everyone.\n\nThis is where a **check constraint** earns its keep. Without it, nothing stops a row that claims to be a `city` area but has `city_id` null and a stray `district_id` set — a corrupt row that matching logic cannot interpret. The check constraint encodes the rule "for each area_type, exactly the right column(s) must be populated and the rest must be null". It is verbose, but it makes an incoherent service area impossible to store, which means Module 8 matching can trust every row it reads. A junior engineer enforces this in application code and watches corrupt rows appear anyway; a senior one writes the check constraint and never thinks about it again.\n\nThe foreign keys from `artist_service_areas` up to `states`/`districts`/`taluks`/`cities` are nullable — because most of them are null for any given area type — and that nullability is exactly why the check constraint is mandatory: nullable columns give you the flexibility to represent six area types in one table, and the check constraint is what stops that flexibility from becoming chaos.',
          diagram: `graph TD
    CO[countries] --> ST[states<br/>name, lat, lng]
    ST --> DI[districts<br/>state_id, lat, lng]
    DI --> TA[taluks<br/>district_id, lat, lng]
    TA --> CI[cities<br/>taluk_id, lat, lng]
    CI --> PI[pincodes<br/>city_id, lat, lng]
    SAT[service_area_types<br/>country, state, district,<br/>taluk, city, radius] --> ASA
    A[artists] --> ASA[artist_service_areas]
    ASA --> CHK{"CHECK: exactly the<br/>right column filled<br/>for this area_type"}
    CHK --> R1["type=district -> district_id set,<br/>others null"]
    CHK --> R2["type=radius -> center_lat/lng<br/>+ radius_km set, ids null"]
    CHK --> R3["type=country -> all null,<br/>matches everyone"]`,
          flowExplain:
            'The chain on the left makes containment a join. The check constraint on the right is what guarantees every service-area row is coherent, so Module 8 matching can trust the data without defensive checks.',
          whyItMatters:
            'This is the schema that makes KalaKaara more than a CRUD app, and interviewers love the check-constraint pattern for a "one table, several shapes" design. Being able to say "the nullable foreign keys let one table hold six area types, and the check constraint stops that flexibility from producing incoherent rows" demonstrates you can design a flexible table without sacrificing integrity.',
          steps: [
            'Build the chain states -> districts -> taluks -> cities, each with name, lat, lng, and a foreign key up to its parent.',
            'Seed `service_area_types` with the six types: country, state, district, taluk, city, radius.',
            'Create `artist_service_areas` with a required `artist_id`, an `area_type`, nullable `state_id`/`district_id`/`taluk_id`/`city_id`, and nullable `center_lat`/`center_lng`/`radius_km`.',
            'Add a check constraint that, for each area_type, requires exactly the correct columns to be non-null and the rest to be null.',
            'Index the location foreign keys and the artist studio lat/lng in topic 11, so both halves of Module 8 matching stay fast.',
          ],
          code: `-- The chain: each level points UP to its parent, and carries coordinates.
create table if not exists public.states (
  id uuid primary key default gen_random_uuid(),
  name text not null, lat double precision, lng double precision
);
create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references states(id) on delete restrict,
  name text not null, lat double precision, lng double precision
);
create table if not exists public.taluks (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references districts(id) on delete restrict,
  name text not null, lat double precision, lng double precision
);
create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  taluk_id uuid not null references taluks(id) on delete restrict,
  name text not null, lat double precision, lng double precision
);

-- One table, six shapes, kept coherent by a CHECK constraint.
create table if not exists public.artist_service_areas (
  id         uuid not null default gen_random_uuid() primary key,
  artist_id  uuid not null references artists(id) on delete cascade,
  area_type  text not null references service_area_types(code),
  state_id   uuid references states(id)    on delete cascade,
  district_id uuid references districts(id) on delete cascade,
  taluk_id   uuid references taluks(id)    on delete cascade,
  city_id    uuid references cities(id)    on delete cascade,
  center_lat double precision,
  center_lng double precision,
  radius_km  double precision check (radius_km is null or radius_km > 0),
  constraint area_shape_valid check (
    case area_type
      when 'country'  then state_id is null and district_id is null and taluk_id is null and city_id is null and center_lat is null
      when 'state'    then state_id is not null    and district_id is null and taluk_id is null and city_id is null and center_lat is null
      when 'district' then district_id is not null and state_id is null and taluk_id is null and city_id is null and center_lat is null
      when 'taluk'    then taluk_id is not null     and state_id is null and district_id is null and city_id is null and center_lat is null
      when 'city'     then city_id is not null      and state_id is null and district_id is null and taluk_id is null and center_lat is null
      when 'radius'   then center_lat is not null and center_lng is not null and radius_km is not null
                          and state_id is null and district_id is null and taluk_id is null and city_id is null
      else false
    end
  )
);`,
          pitfalls: [
            '**Skipping the check constraint on artist_service_areas.** Nullable columns then let a "city" area exist with no city_id and a stray district_id, and matching cannot interpret it. Fix: a check constraint per area_type that pins exactly which columns are set.',
            '**Storing the location as one denormalised string instead of the chain.** Containment ("is Manipal in Udupi?") then has no reliable answer. Fix: four nested tables with parent foreign keys, seeded once.',
            '**Forgetting lat/lng on the location rows.** The radius half of matching has no coordinates to compare against. Fix: every location row carries lat and lng, seeded from open data.',
            '**Using `on delete restrict` on artist_service_areas.artist_id.** Deleting an artist would then be blocked by their own service areas. Fix: cascade on the artist side — the areas are owned children — and restrict on the location lookups they reference.',
            '**Making the location foreign keys `not null` on artist_service_areas.** Then one table cannot represent six area types. Fix: nullable location columns plus a check constraint is what lets the single table stay both flexible and coherent.',
          ],
          tryIt:
            'Write the row an artist would create to declare "I work anywhere within 25 km of my Udupi studio at 13.34, 74.75". Which columns are set and which are null, and which check branch validates it? (Answer: area_type radius, center_lat 13.34, center_lng 74.75, radius_km 25, every administrative id null — validated by the radius branch of the check.)',
          takeaway:
            'The location chain makes containment a join, and one artist_service_areas table holds all six coverage types by using nullable columns guarded by a check constraint that keeps every row coherent.',
        },
        {
          id: 'm3-t10',
          title: 'favorites and reviews — the engagement tables',
          explain:
            'Two small tables capture user engagement, and both lean on a composite unique constraint to enforce "at most once per user per artist".',
          analogy:
            'The temple keeps two registers. One lists which devotees have marked a particular deity as their family deity — you can only mark it once, marking it twice is meaningless. The other lists the feedback each devotee left after a seva — one considered review per devotee per seva, not fifty duplicate scribbles. Both registers quietly enforce "one entry per person per thing", and that single rule is what keeps them trustworthy.',
          theory:
            'These are the smallest tables in the schema and they teach the composite-unique pattern cleanly.\n\n**`favorites`** records that a user saved an artist. It needs only `user_id`, `artist_id`, and `created_at` — plus the crucial `unique(user_id, artist_id)`. Without that constraint, a user who double-taps the heart creates two favourite rows, and the "favourites" count and the un-favourite logic both break. With it, the second insert simply fails (or, with an upsert, is absorbed), and "is this artist favourited by me?" is a single-row lookup that can never return two rows. Both foreign keys cascade: delete the user or the artist and the favourite is meaningless, so it vanishes.\n\n**`reviews`** records a rating and an optional comment. It carries `user_id`, `artist_id`, `rating integer check (rating between 1 and 5)`, a nullable `comment`, and the same `unique(user_id, artist_id)`. That composite unique is the product rule "one review per user per artist" made unbreakable at the database — no amount of rapid clicking or concurrent requests can produce two reviews from the same user for the same artist, because Postgres rejects the second before it lands. The `check` on rating makes a zero-star or six-star review impossible from any client. Comment is nullable on purpose: a rating with no words is a valid review.\n\nNotice how much these two tiny tables encode with almost no columns. The composite unique is the entire "one per user per artist" rule. The rating check is the entire "valid score" rule. The cascade choices are the entire "clean up on delete" rule. This is constraints-as-documentation from topic 4 in its most concentrated form: read the two `create table` statements and you have read the complete behaviour of favouriting and reviewing, with no application code needed to describe it. Module 11 wires the favourites UI and Module 13 wires reviews plus the trigger that rolls each new review into the denormalised `rating_avg` and `review_count` on the artists row.',
          diagram: `graph TD
    U[profiles / user] --> F[favorites]
    U --> R[reviews]
    A[artists] --> F
    A --> R
    F --> FU["unique(user_id, artist_id)<br/>= save an artist at most once"]
    R --> RU["unique(user_id, artist_id)<br/>= one review per user per artist"]
    R --> RC["check(rating between 1 and 5)<br/>= no 0-star, no 6-star"]
    R -. Module 13 trigger .-> DEN[artists.rating_avg<br/>artists.review_count]`,
          flowExplain:
            'Both tables use the identical composite-unique key to forbid duplicates. The dashed line is the Module 13 trigger that keeps the denormalised counters on the artists row in step with the reviews table.',
          whyItMatters:
            'The composite unique constraint is the correct, race-proof way to enforce "one per user per thing", and reaching for it instead of an application-level check is a strong signal in code review and interviews. Many production bugs — double favourites, duplicate reviews inflating an average — trace directly to a missing composite unique that these two tables get right.',
          steps: [
            'Create `favorites` with user_id, artist_id, created_at, both foreign keys cascading, and `unique(user_id, artist_id)`.',
            'Create `reviews` with user_id, artist_id, a checked rating, a nullable comment, timestamps, and the same composite unique.',
            'Rely on the composite unique instead of a "does a row already exist?" check in the service layer, which races under concurrent taps.',
            'Leave the review `comment` nullable so a star-only review is valid, and check the rating range on the column.',
            'Leave the denormalised counters to the Module 13 trigger; favorites and reviews here are the source of truth.',
          ],
          code: `-- favorites: tiny, and entirely defined by its unique constraint.
create table if not exists public.favorites (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references profiles(id) on delete cascade,
  artist_id  uuid        not null references artists(id)  on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, artist_id)          -- save an artist at most once. Race-proof.
);

-- reviews: rating is checked, the pair is unique, the comment is optional.
create table if not exists public.reviews (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references profiles(id) on delete cascade,
  artist_id  uuid        not null references artists(id)  on delete cascade,
  rating     integer     not null check (rating between 1 and 5),
  comment    text,                         -- star-only review is valid
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, artist_id)            -- one review per user per artist. Unbreakable.
);

-- Favouriting with an upsert leans on the unique key instead of a pre-check:
insert into public.favorites (user_id, artist_id)
values (auth.uid(), :artist_id)
on conflict (user_id, artist_id) do nothing;   -- the double-tap simply no-ops`,
          pitfalls: [
            '**Enforcing "one review per user per artist" with a select-then-insert in code.** Two concurrent requests both see no existing row and both insert. Fix: a composite `unique(user_id, artist_id)` rejects the second at the database, no race possible.',
            '**Making the review comment `not null`.** Users who want to leave five stars and no words are blocked. Fix: nullable comment; a rating alone is a complete review.',
            '**Checking the rating range only in the star widget.** A crafted request stores rating 42 and skews the average. Fix: `check (rating between 1 and 5)` on the column.',
            '**Not cascading favorites on artist delete.** Deleting an artist leaves dangling favourites pointing at nothing. Fix: `on delete cascade` on both foreign keys.',
            '**Writing rating_avg into the reviews flow by hand.** The average drifts under concurrency. Fix: leave it to the Module 13 trigger; reviews is the source of truth, the counter is a maintained copy.',
          ],
          tryIt:
            'Attempt to insert two favourites for the same user and artist in the SQL editor. Observe the second one error on the unique constraint. Then rewrite the insert as the `on conflict do nothing` upsert above and confirm the double-tap becomes harmless. That upsert is exactly what the favourites button will call in Module 11.',
          takeaway:
            'favorites and reviews are tiny tables whose behaviour is almost entirely encoded in a composite unique constraint that makes "at most once per user per artist" race-proof, plus a rating check that no client can bypass.',
        },
        {
          id: 'm3-t11',
          title: 'Indexes — because Postgres does not auto-index foreign keys',
          explain:
            'An index is a lookup structure that turns a full-table scan into a direct jump, and the single most surprising fact for beginners is that Postgres does not create one for foreign keys automatically.',
          analogy:
            'A book with no index forces you to read every page to find the word "Yakshagana". The index at the back sends you straight to page 212. A database index is the same thing: without it, "find artworks where artist_id = X" reads every artwork row; with it, Postgres jumps straight to the matching ones. And crucially, printing an index at the back of a book is a choice the author makes — the book does not grow one by itself, and neither does Postgres for your foreign keys.',
          theory:
            'A **primary key gets an index for free** — Postgres builds one to enforce uniqueness. Almost everyone assumes foreign keys get the same treatment. **They do not.** Postgres indexes the *referenced* side (the primary key it points at) but not the *referencing* column. So `artworks.artist_id` has no index unless you create one, and every "give me this artist artworks" query — the artist detail page, run constantly — does a full scan of the artworks table. On a free-tier database with tens of thousands of artworks this is the difference between instant and sluggish, and it is completely invisible until the data grows. **Every foreign key you write needs an explicit index.** This is the most important sentence in the topic.\n\nBeyond the foreign-key rule, three specialised indexes earn their place in KalaKaara.\n\nA **partial index** covers only the rows you actually query. The browse page only ever shows published artists, so `create index ... on artists (rating_avg desc) where is_published` indexes just the published rows. It is smaller, faster, and never wastes space indexing the draft profiles nobody browses.\n\nA **composite index** covers a multi-column query in one structure. If the browse query filters by published state and sorts by rating, an index on `(is_published, rating_avg desc)` serves both the filter and the sort together, so Postgres neither scans nor sorts.\n\nA **pg_trgm GIN index** makes a leading-wildcard `ilike` fast. Location autocomplete searches city names with a substring match, and a normal B-tree index cannot help a pattern that starts with a wildcard. The `pg_trgm` extension breaks text into three-character trigrams and a GIN index over them makes "does this name contain the typed fragment?" fast enough for autocomplete on every keystroke.\n\nThe way to *prove* an index is used, rather than hope, is **`explain analyze`**. Run it before and after creating an index: a `Seq Scan` (reading every row) should become an `Index Scan` (jumping to the matches), and the measured time should drop. An index you added on faith and never verified is an index that might be sitting unused while the planner scans anyway. Measure, do not assume.',
          diagram: `graph TD
    PK[primary key] --> AUTO["indexed automatically<br/>(enforces uniqueness)"]
    FK["foreign key column<br/>e.g. artworks.artist_id"] --> NONE["NOT indexed automatically!<br/>you must create it"]
    NONE --> SLOW["without it: Seq Scan<br/>reads every row"]
    NONE --> FIX[create index -> Index Scan]
    subgraph special[Specialised indexes]
      PART["partial: WHERE is_published<br/>= index only browsed rows"]
      COMP["composite: (is_published,<br/>rating_avg desc) = filter+sort"]
      TRGM["pg_trgm GIN: ilike '%x%'<br/>= autocomplete"]
    end
    PROVE["explain analyze<br/>Seq Scan -> Index Scan?"] --> special`,
          flowExplain:
            'The top half is the rule beginners miss: primary keys are indexed for you, foreign keys are not. The bottom half is the three specialised indexes, and `explain analyze` is how you confirm any of them is actually being used.',
          whyItMatters:
            '"Does Postgres auto-index foreign keys?" is a direct interview question with a counterintuitive answer (no), and the slow-query bugs it causes are everywhere in real systems. Knowing to index every foreign key, when to reach for a partial or composite or trigram index, and how to prove usage with `explain analyze` is core database-performance literacy that separates people who write queries from people who make them fast.',
          steps: [
            'Create an explicit index on every foreign key column: artworks.artist_id, artist_categories.artist_id, favorites.artist_id, and so on. This is the highest-value indexing you will do.',
            'Add a partial index for the browse query, restricted with `where is_published`, so it indexes only the rows the public actually sees.',
            'Add a composite index matching the browse filter-and-sort, such as `(is_published, rating_avg desc)`.',
            'Enable `pg_trgm` and add GIN indexes on city and taluk names to make autocomplete `ilike` fast.',
            'Run `explain analyze` on your real queries before and after each index and confirm a Seq Scan became an Index Scan and the time fell. Keep only indexes that prove their worth.',
          ],
          code: `-- THE RULE: every foreign key needs its own index. Postgres will not add these.
create index if not exists idx_artworks_artist_id
  on public.artworks (artist_id);
create index if not exists idx_artist_categories_artist_id
  on public.artist_categories (artist_id);
create index if not exists idx_artist_service_areas_artist_id
  on public.artist_service_areas (artist_id);
create index if not exists idx_favorites_artist_id
  on public.favorites (artist_id);
create index if not exists idx_reviews_artist_id
  on public.reviews (artist_id);

-- PARTIAL: only published artists are ever browsed, so index only those.
create index if not exists idx_artists_published_rating
  on public.artists (rating_avg desc)
  where is_published;

-- COMPOSITE: serve the browse filter AND sort in one structure.
create index if not exists idx_artists_browse
  on public.artists (is_published, rating_avg desc);

-- TRIGRAM: fast ilike '%fragment%' for location autocomplete.
create extension if not exists pg_trgm;
create index if not exists idx_cities_name_trgm
  on public.cities using gin (name gin_trgm_ops);

-- PROVE it. Seq Scan should become Index Scan; time should drop.
explain analyze
select * from public.artworks where artist_id = '00000000-0000-0000-0000-000000000000';`,
          pitfalls: [
            '**Assuming foreign keys are indexed automatically.** They are not — only the referenced primary key is — so every join on the referencing column silently does a full scan. Fix: create an explicit index on every foreign key column.',
            '**Indexing every column "to be safe".** Each index slows every insert and update and consumes space; unused ones are pure cost. Fix: index what your real queries filter, join, and sort on, and prove each with explain analyze.',
            '**Expecting a B-tree index to speed up a leading-wildcard ilike.** A pattern like `%text%` cannot use a B-tree. Fix: enable pg_trgm and add a GIN trigram index for substring search.',
            '**Adding an index and never running explain analyze.** The planner may ignore it, leaving you with the maintenance cost and none of the benefit. Fix: verify Seq Scan became Index Scan on the actual query.',
            '**Building a composite index in the wrong column order.** `(rating_avg, is_published)` cannot serve a query that filters on is_published alone as well as `(is_published, rating_avg)` can. Fix: put the equality-filtered column first, the sort column second.',
          ],
          tryIt:
            'Run `explain analyze select * from artworks where artist_id = :some_id` before creating `idx_artworks_artist_id`, note the Seq Scan and the time, create the index, and run it again. Confirm it flipped to an Index Scan and got faster. That before/after is the muscle every performance conversation is built on.',
          takeaway:
            'Postgres does not index foreign keys for you, so index every one explicitly; reach for partial, composite, and pg_trgm GIN indexes where the query shape calls for them, and prove every index with explain analyze.',
        },
      ],
    },
    {
      id: 'm3-s3',
      title: 'Row Level Security — the whole security model',
      topics: [
        {
          id: 'm3-t12',
          title: 'Why RLS exists here, and default-deny',
          explain:
            'Because the browser talks straight to Postgres with no server in between, there is no route handler in which to check permissions — so authorisation moves into the database as Row Level Security, which denies everything by default the moment you enable it.',
          analogy:
            'In most shops a guard at the door decides who may enter which room. KalaKaara has no guard and no door — customers walk straight up to the shelves. So instead every shelf has its own lock keyed to who you are, and the moment you install the locks, every shelf is locked until you explicitly cut a key. Nothing is readable by accident. You open exactly what you mean to open, and not one shelf more.',
          theory:
            'Recall the architecture from Module 0: there is no Node backend. The React app, holding the public `anon` key, calls PostgREST, which runs your query directly against Postgres. In a classical app, authorisation lives in route handlers — `if (req.user.id !== row.owner_id) return 403`. KalaKaara has **no route handlers**, so there is nowhere to put that check except the database itself. That is the entire reason **Row Level Security** exists in this project: it is authorisation for an app that has deleted its middle tier.\n\nRLS is per-table, and you turn it on with `alter table public.artists enable row level security`. The instant you do, the behaviour is **default-deny**: with RLS enabled and no policies written, *every* query against that table returns zero rows and *every* write is rejected — even for you, even for the owner, even for a select that would obviously be fine. This feels broken the first time it happens, and it is the most important safety property in the system. A table you forget to write policies for is invisible, not wide open. The failure mode is "nobody can see it" (which you notice immediately) rather than "everybody can see it" (which you notice after the breach). You then open access deliberately, one policy at a time.\n\nTo write policies you need to know who the caller is, and Postgres tells you through two roles and two functions. Supabase requests arrive as one of two Postgres roles: **`anon`** for a caller with only the public key and no session, and **`authenticated`** for a caller carrying a valid JWT. Inside a policy, **`auth.uid()`** returns the signed-in user id (or null for anon), and **`auth.role()`** returns the role name. So a policy can say "readable by anon and authenticated" for public data, or "only where `user_id = auth.uid()`" for owned data. Every policy you write in the next topic is built from exactly these pieces: a role list, and a condition over `auth.uid()`.\n\nOne caution that the default-deny property makes vivid: a table with RLS *disabled* is the dangerous one, because then Postgres does no row checking at all and the anon key can read everything. So the discipline is the mirror image of most systems — you enable RLS on every table as a checklist item, accept that it locks everything, and then unlock precisely what each actor should reach.',
          diagram: `graph TD
    B[React app + anon key] -->|no backend to check permissions| PR[PostgREST]
    PR --> ROLE{Which Postgres role?}
    ROLE -->|no JWT| AN[anon<br/>auth.uid = null]
    ROLE -->|valid JWT| AU[authenticated<br/>auth.uid = user id]
    AN --> RLS[Row Level Security on the table]
    AU --> RLS
    RLS --> DEF{Policies written?}
    DEF -->|none: DEFAULT-DENY| ZERO[0 rows, all writes rejected]
    DEF -->|explicit policy| CHK["evaluate USING / WITH CHECK<br/>against auth.uid()"]
    CHK --> OUT[only permitted rows returned]`,
          flowExplain:
            'With no server to check permissions, every request lands on the table RLS. Enable RLS and, until you write a policy, the answer is always zero rows — default-deny is the safe failure mode.',
          whyItMatters:
            '"Why does the client talking straight to Postgres not leak everything?" is the defining Supabase interview question, and the answer is RLS with default-deny. Understanding that enabling RLS locks a table until you open it — and that the danger is a table with RLS *off*, not on — is the mental shift that makes the whole no-backend architecture safe rather than reckless.',
          steps: [
            'Internalise the premise: no backend means no route handler, so authorisation must live in the database.',
            'Run `alter table ... enable row level security` on every application table, as a non-negotiable checklist item.',
            'Accept and verify the default-deny: right after enabling RLS with no policies, confirm the table returns zero rows even to you.',
            'Learn the two roles (anon, authenticated) and the two functions (auth.uid(), auth.role()) — every policy is built from these.',
            'Treat a table with RLS *disabled* as the alarm condition; grep your migration to confirm enable-RLS appears for every table.',
          ],
          code: `-- No backend means the database itself must be the guard.
-- Step 1: enable RLS on every table. This LOCKS the table (default-deny).
alter table public.artists enable row level security;

-- Prove default-deny: with RLS on and NO policy yet, this returns 0 rows,
-- even for the table owner, even though the data is right there.
select count(*) from public.artists;   -- -> 0

-- The two roles every request arrives as:
--   anon           = public key, no session   -> auth.uid() is null
--   authenticated  = valid JWT in the request  -> auth.uid() = the user id

-- The two functions every policy is built from:
--   auth.uid()   -> uuid of the signed-in user, or null
--   auth.role()  -> 'anon' or 'authenticated'

-- Only an explicit policy opens a door. This one lets anyone read published rows:
create policy "published artists are public"
  on public.artists for select
  to anon, authenticated
  using (is_published);
-- Now, and only now, the count above returns the published artists.`,
          pitfalls: [
            '**Shipping a table with RLS disabled.** Postgres then does no row checking and the public anon key reads every row, including draft profiles and phone numbers. Fix: enable RLS on every table; treat a disabled one as a live incident.',
            '**Panicking when a table returns zero rows after enabling RLS.** That is default-deny working, not a bug. Fix: it means you have not written the policy yet — add the select policy the data needs.',
            '**Assuming enabling RLS is enough on its own.** RLS with no policies denies everyone, including legitimate readers. Fix: enable RLS *and* write the explicit policies each actor needs.',
            '**Confusing the anon key with authorisation.** The anon key only names the caller as anonymous; it grants nothing. Fix: RLS policies, evaluated against auth.uid(), decide what anon may actually do.',
            '**Reaching for the service_role key to "get past" default-deny during development.** It bypasses all RLS and must never touch the client. Fix: fix the policy; a zero-row result is a policy you have not written yet.',
          ],
          tryIt:
            'On a fresh table, run `enable row level security`, then a `select *`, and confirm zero rows come back even though the table has data. Then add a single `for select to anon using (true)` policy and watch the rows appear. You have just felt default-deny turn into deliberate access.',
          takeaway:
            'With no backend to check permissions, authorisation lives in the database as RLS; enabling it locks the table by default, and you open access deliberately with policies built from the anon/authenticated roles and auth.uid().',
        },
        {
          id: 'm3-t13',
          title: 'Writing the policy set — using vs with check',
          explain:
            'A complete policy set gives each table a select, insert, update, and delete policy, and the update policy needs both a `using` clause and a `with check` clause for reasons that are precise and easy to get wrong.',
          analogy:
            'Think of a temple seva counter clerk amending a booking. Two separate permissions are involved: which bookings the clerk is allowed to pull from the drawer (the ones under their own name), and what the amended slip is allowed to say when it goes back in (still under their own name, not reassigned to someone else). Grant only the first and the clerk could pull their own booking and rewrite it into your name. You need both permissions, and RLS spells them `using` and `with check`.',
          theory:
            'Every table gets a policy per operation. The **select** policy is usually the simplest: `for select to anon, authenticated using (is_published)` makes published artists readable by everyone, anonymous or not. The `using` clause on a select is the filter that decides which rows the caller may see.\n\nThe **insert** policy uses `with check`, never `using`: `for insert to authenticated with check (user_id = auth.uid())`. There are no existing rows to filter on an insert, so there is nothing for `using` to do; `with check` validates the *new* row, and here it guarantees a signed-in user can only insert a row that belongs to themselves — they cannot create an artist profile owned by someone else.\n\nThe **update** policy is where the two clauses both appear, and understanding why is the crux of this entire module. `for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())`. The **`using`** clause decides *which existing rows you may target* — you may only update rows you already own. The **`with check`** clause decides *what the row is allowed to look like afterwards* — the updated row must still be owned by you. Both are necessary, and here is the attack if you omit `with check`: with only `using (user_id = auth.uid())`, an artist may target their own row (using passes) and, in the same update, set `user_id` to another person id — reassigning their profile to a victim, or worse, claiming a victim row on the next pass. `using` guards the row you start from; `with check` guards the row you end at. Omit either and there is a hole. The rule: **on update, write both, and make them identical unless you have a specific reason not to.**\n\nThe **delete** policy uses `using` alone: `for delete to authenticated using (user_id = auth.uid())` — you may delete only rows you own. There is no resulting row, so no `with check`.\n\nOne table breaks the simple `user_id = auth.uid()` pattern: **`artworks` has no `user_id`**, only `artist_id`. Ownership is one hop away — an artwork belongs to you if its artist belongs to you. So the condition becomes a **subquery**: `using (artist_id in (select id from artists where user_id = auth.uid()))`. This "am I the owner via a join" pattern recurs for every child table, and it is the single most useful RLS idiom to memorise.\n\nFinally, you must be able to **test** a policy without deploying. In the Supabase SQL editor you can impersonate a role: `set local role anon;` makes the session anonymous, and setting the JWT claims lets you become a specific authenticated user. The gold-standard assertion is that a **cross-user update returns 0 rows rather than raising an error** — RLS does not throw when you try to update a row you do not own; it simply matches no rows, so the update affects zero rows. A test that expects an exception will misread success as failure; the correct assertion is "rows affected = 0".',
          diagram: `graph TD
    OP[Policy per operation] --> SEL["SELECT: using(is_published)<br/>= which rows you may READ"]
    OP --> INS["INSERT: with check(user_id=auth.uid())<br/>= the NEW row must be yours"]
    OP --> UPD[UPDATE: needs BOTH clauses]
    OP --> DEL["DELETE: using(user_id=auth.uid())<br/>= only your rows"]
    UPD --> U1["using = which rows you may TARGET<br/>(the row you start from)"]
    UPD --> U2["with check = what it may BECOME<br/>(the row you end at)"]
    U2 --> ATK["omit it -> artist reassigns<br/>user_id to a victim"]
    subgraph child[artworks has no user_id]
      SUB["using(artist_id in<br/>(select id from artists<br/>where user_id = auth.uid()))"]
    end
    TEST["test: set local role anon<br/>cross-user update -> 0 rows,<br/>not an exception"]`,
          flowExplain:
            'The update branch is the heart of it: `using` guards the row you start from and `with check` guards the row you end at. Drop `with check` and an owner can rewrite their row into someone else. The child-table subquery and the "0 rows, not an error" test are the two other things to carry away.',
          whyItMatters:
            'The using-versus-with-check distinction is the single most asked RLS interview question, and getting it wrong ships a real privilege-escalation bug where a user reassigns their row to another account. The artworks subquery is the pattern every child table needs, and knowing that a blocked update returns zero rows rather than raising is what lets you write correct security tests instead of tests that pass for the wrong reason.',
          steps: [
            'Give every table a select policy naming both roles for public data, or restricting to owners for private data.',
            'Write insert policies with `with check (user_id = auth.uid())` so a user can only create rows they own.',
            'Write update policies with BOTH `using` and `with check`, identical unless you have a reason, so a user can neither target nor produce a row they do not own.',
            'For child tables like artworks that lack user_id, express ownership with the `artist_id in (select id from artists where user_id = auth.uid())` subquery.',
            'Test in the SQL editor with `set local role` and JWT claims, asserting that a cross-user update affects 0 rows rather than expecting an exception.',
          ],
          code: `-- SELECT: public read of published artists (anon and authenticated).
create policy "artists public read"
  on public.artists for select
  to anon, authenticated
  using (is_published);

-- INSERT: a user may only create their OWN artist row.
create policy "artists insert own"
  on public.artists for insert
  to authenticated
  with check (user_id = auth.uid());

-- UPDATE: BOTH clauses. This is the one everyone gets wrong.
create policy "artists update own"
  on public.artists for update
  to authenticated
  using (user_id = auth.uid())        -- which rows you may TARGET
  with check (user_id = auth.uid());  -- what the row may BECOME
-- Omit with check and an artist can set user_id to a victim's id. That is the bug.

-- DELETE: using alone; there is no resulting row to check.
create policy "artists delete own"
  on public.artists for delete
  to authenticated
  using (user_id = auth.uid());

-- CHILD TABLE: artworks has no user_id. Ownership is one join away.
create policy "artworks modify via owning artist"
  on public.artworks for all
  to authenticated
  using (artist_id in (select id from artists where user_id = auth.uid()))
  with check (artist_id in (select id from artists where user_id = auth.uid()));

-- TEST a policy without deploying. Assert 0 ROWS, not an exception.
set local role authenticated;
set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';
update public.artists set bio = 'hacked'
  where user_id = '22222222-2222-2222-2222-222222222222';   -- someone else's row
-- Result: UPDATE 0. RLS matched no rows. It did NOT raise. That is the pass condition.
reset role;`,
          pitfalls: [
            '**Writing an update policy with `using` but no `with check`.** The owner can target their own row and, in the same statement, reassign user_id to a victim. Fix: always include `with check` on update, identical to `using` unless you have a deliberate reason.',
            '**Using the `user_id = auth.uid()` pattern on artworks.** Artworks has no user_id, so the policy references a non-existent column and fails. Fix: the subquery `artist_id in (select id from artists where user_id = auth.uid())`.',
            '**Expecting a blocked update to raise an exception.** RLS filters rather than throws, so a forbidden update simply affects 0 rows; a test that awaits an error passes for the wrong reason. Fix: assert rows-affected = 0.',
            '**Naming only `to authenticated` on a public-read policy.** Anonymous visitors are then denied and the whole browse experience breaks for logged-out users. Fix: `to anon, authenticated` on anything the public must read.',
            '**Forgetting a policy for one operation.** Default-deny then silently blocks that operation — an insert works but updates mysteriously do nothing. Fix: write select, insert, update, and delete policies deliberately for every table that needs them.',
          ],
          tryIt:
            'In the SQL editor, impersonate artist A with `set local role` and JWT claims, then try to update artist B bio. Confirm the result is `UPDATE 0` and no error. Then add a second artist row you own and confirm you *can* update that one. You have now proven both halves: you can edit your own row and are silently blocked from others.',
          takeaway:
            'Give every table select/insert/update/delete policies; on update use both using (rows you may target) and with check (what the row may become); express child-table ownership with a subquery; and test by asserting a cross-user update affects zero rows, not that it raises.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm3-p1',
      type: 'Mini Project',
      title: 'The Complete KalaKaara Schema, Locked Down',
      domain: 'Database Design & Security',
      duration: '2 hours',
      description:
        'Produce the entire KalaKaara database as three runnable SQL files: an idempotent schema.sql that creates all eighteen tables with constraints, indexes, the updated_at trigger, and the new-user trigger, then enables RLS with an explicit policy on every table; a seed.sql with Karnataka geography and around ten coastal-Karnataka artists; and an rls_test.sql that proves anonymous callers cannot write and one artist cannot edit another artist row.',
      tools: ['Supabase', 'PostgreSQL', 'SQL', 'Row Level Security'],
      blueprint: {
        overview:
          'A migration folder containing schema.sql, seed.sql, and rls_test.sql. schema.sql must be idempotent — running it twice changes nothing and errors nowhere — using `create table if not exists`, `create or replace function`, and `drop policy if exists` before each `create policy`. Every table ends with RLS enabled and a full policy set. The eighteen tables are: profiles, artists, categories, artist_categories, languages, artist_languages, availability, artworks, countries, states, districts, taluks, cities, pincodes, service_area_types, artist_service_areas, favorites, and reviews. When you finish, a stranger can run these three files against a fresh Supabase project and have a fully seeded, fully secured database.',
        functionalRequirements: [
          '**All eighteen tables created.** profiles, artists, categories, artist_categories, languages, artist_languages, availability, artworks, countries, states, districts, taluks, cities, pincodes, service_area_types, artist_service_areas, favorites, reviews — each with the uniform id / created_at / updated_at contract where it is editable.',
          '**Constraints throughout.** not null on required facts, check on rating and radius and price, composite unique on favorites and reviews and the junctions, and a deliberate cascade / restrict / set null on every foreign key.',
          '**Both triggers.** A generic set_updated_at() attached to every editable table, and a security-definer, search-path-pinned handle_new_user() on auth.users creating the profile row.',
          '**Indexes.** An explicit index on every foreign key, a partial index for published artists, a composite browse index, and a pg_trgm GIN index on city and taluk names.',
          '**RLS on every table with an explicit policy set.** Public read where appropriate, owner-only insert/update/delete, the both-clauses update policy, and the artworks ownership subquery.',
          '**seed.sql.** Karnataka state, the coastal districts (Udupi, Dakshina Kannada), their taluks (Kundapura, Udupi, Brahmavara, Byndoor, Mangaluru) and cities (Kundapura, Udupi, Manipal, Maravanthe, Kollur, Mangaluru), each with lat/lng, plus around ten published artists with names like Rukmini Shetty, Ganesh Acharya, and Shalini Kamath.',
          '**rls_test.sql.** Impersonate anon and assert an insert into artists is rejected; impersonate artist A and assert an update to artist B row affects zero rows; assert artist A can update their own row.',
        ],
        technicalImplementation: [
          '**Idempotency everywhere.** create table if not exists, create or replace function, create index if not exists, and drop policy if exists before every create policy, so the whole file re-runs cleanly.',
          '**Ordering.** Create lookup and parent tables before the tables that reference them; write set_updated_at() before the tables that trigger on it; enable RLS and write policies after all tables exist.',
          '**The check constraint on artist_service_areas** uses a case over area_type to require exactly the right columns per type, so no incoherent service area can be stored.',
          '**Role impersonation for testing** uses `set local role` plus `set local request.jwt.claims` with a sub uuid, and asserts rows-affected rather than expecting exceptions.',
          '**Seed with deterministic ids** where cross-references are needed, or use CTEs that insert parents and return their ids for the children, so seed.sql is also idempotent and re-runnable.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Tables, contract, and constraints',
            outcome:
              'schema.sql part one: all eighteen tables with the uniform contract and full constraints, idempotent and correctly ordered.',
            prompt:
              'Write the first part of an idempotent `schema.sql` for KalaKaara on Supabase Postgres. Create all eighteen tables with `create table if not exists`, in dependency order (lookups and parents first): profiles (id references auth.users on delete cascade, full_name, avatar_url), then the location chain countries -> states -> districts -> taluks -> cities -> pincodes each with name/lat/lng and a parent foreign key using on delete restrict, then categories, languages, availability, service_area_types, then artists with every column from the course (unique user_id, unique slug, display_name, bio, years_experience, base_price, is_negotiable, availability_id set null, phone/whatsapp/instagram/facebook/website, is_published default false, rating_avg, review_count, home_lat, home_lng), then artworks (artist_id cascade, title, description, category_id set null, price check >= 0, is_negotiable, medium, dimensions, image_url, tags text[] default empty, is_featured), then the junctions artist_categories and artist_languages with composite primary keys and artist-side cascade / lookup-side restrict, then artist_service_areas with nullable location foreign keys and a check constraint over area_type, then favorites and reviews each with unique(user_id, artist_id) and reviews.rating check between 1 and 5. Give every editable table id uuid default gen_random_uuid(), created_at, and updated_at. Do not write triggers, indexes, or policies yet.',
          },
          {
            step: 2,
            label: 'The two triggers',
            outcome:
              'schema.sql part two: set_updated_at() on every editable table and handle_new_user() on auth.users.',
            prompt:
              'Continue `schema.sql`. Write a generic `set_updated_at()` plpgsql function that sets `new.updated_at = now()`, then attach it as a `before update` trigger to every editable table (profiles, artists, artworks, reviews, and any other table with an updated_at column), using `drop trigger if exists` before each `create trigger` so it is idempotent. Then write `handle_new_user()` as a `security definer` function with `set search_path = public`, inserting into public.profiles the new user id, full_name, and avatar_url read from `new.raw_user_meta_data`, and attach it as an `after insert` trigger on auth.users, again dropping any existing trigger first. Add a comment above handle_new_user explaining why security definer plus the pinned search_path are both required.',
          },
          {
            step: 3,
            label: 'Every index the queries need',
            outcome:
              'schema.sql part three: foreign-key indexes, a partial index, a composite browse index, and pg_trgm GIN indexes.',
            prompt:
              'Continue `schema.sql`. Add `create index if not exists` for an explicit index on every foreign key column across all tables (artworks.artist_id, artworks.category_id, artist_categories.artist_id, artist_languages.artist_id, artist_service_areas.artist_id and its location foreign keys, favorites.artist_id and user_id, reviews.artist_id and user_id, and the parent foreign keys on the location chain). Add a partial index on artists(rating_avg desc) where is_published, a composite index on artists(is_published, rating_avg desc), and an index on artists(home_lat, home_lng) for radius matching. Enable the pg_trgm extension and add GIN trigram indexes on cities.name and taluks.name for autocomplete. Add a comment noting that Postgres does not auto-index foreign keys, which is why these are explicit.',
          },
          {
            step: 4,
            label: 'RLS enabled with a full policy set on every table',
            outcome:
              'schema.sql part four: enable RLS on all eighteen tables and write select/insert/update/delete policies for each.',
            prompt:
              'Finish `schema.sql`. For all eighteen tables run `alter table ... enable row level security`. Then, using `drop policy if exists` before every `create policy` for idempotency, write the policy set. Location tables, categories, languages, availability, and service_area_types get public read (`for select to anon, authenticated using (true)`) and no write policies (seed-only). artists gets public read where is_published, plus owner insert (with check user_id = auth.uid()), owner update (BOTH using and with check on user_id = auth.uid()), and owner delete. artworks gets public read where the owning artist is_published, plus owner insert/update/delete using the subquery `artist_id in (select id from artists where user_id = auth.uid())` in both using and with check. The junctions artist_categories, artist_languages, and artist_service_areas get the same artist-ownership subquery. favorites and reviews get owner-only insert/update/delete on user_id = auth.uid(), and reviews plus favorites get public read (reviews are public; favorites read restricted to the owner). profiles gets self read and self update. Add a comment on the artists update policy explaining precisely why both using and with check are required.',
          },
          {
            step: 5,
            label: 'Seed Karnataka geography and ten artists',
            outcome:
              'seed.sql: coastal-Karnataka location rows and around ten published artists, idempotent.',
            prompt:
              'Write an idempotent `seed.sql`. Insert India (countries), Karnataka (states), the districts Udupi and Dakshina Kannada, the taluks Kundapura, Udupi, Brahmavara, Byndoor, and Mangaluru, and the cities Kundapura, Udupi, Manipal, Maravanthe, Kollur, and Mangaluru, each with realistic lat/lng, wiring each row to its parent. Use CTEs or fixed uuids so the file re-runs without duplicating. Seed the categories (Portrait, Mural, Calligraphy, Sculpture, Digital Art, Wedding Portraits), languages (Kannada, Tulu, Konkani, English, Hindi), availability options, and the six service_area_types. Then insert around ten published artists with coastal-Karnataka names such as Rukmini Shetty, Ganesh Acharya, and Shalini Kamath, each with a slug, bio, years_experience, base_price, is_published true, home_lat/home_lng near their city, a couple of artist_categories and artist_languages, and at least one artist_service_areas row (mix district, city, and radius types so the check constraint is exercised). Use `on conflict do nothing` so re-running is safe.',
          },
          {
            step: 6,
            label: 'Prove the lockdown with rls_test.sql',
            outcome:
              'rls_test.sql: anon cannot write, and artist A cannot edit artist B, asserted by rows-affected.',
            prompt:
              'Write `rls_test.sql` that proves the RLS is real. First, `set local role anon` and attempt an insert into artists; wrap it so the expected rejection is caught and reported as a PASS. Second, `set local role authenticated` with `set local request.jwt.claims` for artist A sub, run an update on artist B row (`set bio = ...`), and assert the result is 0 rows affected — printing PASS if 0, FAIL otherwise — with a comment explaining that RLS filters rather than raising, so the correct assertion is rows-affected = 0, not an exception. Third, with the same artist A claims, update artist A own row and assert 1 row affected, proving legitimate edits still work. Finally `reset role`. Add a header comment explaining how to run this in the Supabase SQL editor and what a fully passing run looks like.',
          },
        ],
        deliverable:
          'Three SQL files — schema.sql, seed.sql, rls_test.sql — that run cleanly and repeatedly against a fresh Supabase project. schema.sql builds all eighteen tables with constraints, indexes, both triggers, and RLS with an explicit policy on every table; seed.sql fills coastal-Karnataka geography and around ten artists; rls_test.sql proves anon cannot write and no artist can edit another artist row. Together they are the entire KalaKaara database, designed and locked down.',
      },
    },
  ],
  quiz: [
    {
      id: 'm3-q1',
      q: 'In an UPDATE policy, what is the difference between the `using` clause and the `with check` clause?',
      options: [
        'using and with check are interchangeable aliases; you only need one of them',
        'using decides which existing rows you may target; with check decides what the row is allowed to look like afterwards — omit with check and an owner can reassign their row to another user',
        'using validates the new row; with check filters which rows are visible',
        'with check runs before the update and using runs after it, in that order',
      ],
      answer: 1,
    },
    {
      id: 'm3-q2',
      q: 'The artworks table has no user_id column, only artist_id. How should its owner-only RLS policy express ownership?',
      options: [
        'It cannot have RLS because it lacks a user_id column',
        'using (user_id = auth.uid()), relying on Postgres to find the column automatically',
        'using (artist_id in (select id from artists where user_id = auth.uid())) — a subquery that checks ownership one join away',
        'using (auth.role() = \'authenticated\'), since any signed-in user may edit any artwork',
      ],
      answer: 2,
    },
    {
      id: 'm3-q3',
      q: 'Why must you create an explicit index on a foreign key column like artworks.artist_id?',
      options: [
        'Because Postgres does not automatically index foreign keys — it indexes the referenced primary key, not the referencing column — so joins on it would otherwise do a full table scan',
        'Because foreign keys cannot be queried at all until an index exists',
        'Because the index is what enforces the foreign key relationship',
        'You do not need to — Postgres indexes every foreign key automatically',
      ],
      answer: 0,
    },
    {
      id: 'm3-q4',
      q: 'What happens the moment you run `alter table ... enable row level security` on a table that has no policies yet?',
      options: [
        'The table becomes readable and writable by anyone with the anon key',
        'Nothing changes until you also write a policy; RLS has no effect on its own',
        'Only the table owner can read it; everyone else is blocked',
        'Default-deny takes effect: every query returns zero rows and every write is rejected until you write explicit policies',
      ],
      answer: 3,
    },
    {
      id: 'm3-q5',
      q: 'Why is the profiles row for a new user created by a trigger on auth.users rather than by React after sign-in, and why must handle_new_user() be security definer with a pinned search_path?',
      options: [
        'The trigger creates the profile atomically with the auth user so a dropped network call cannot orphan a user; security definer lets it write to profiles despite the anonymous caller, and pinning search_path stops a caller from hijacking unqualified table names',
        'React is forbidden from inserting into profiles, and security definer simply makes the function run faster',
        'Triggers are the only way to insert into any table, and search_path is a stylistic preference',
        'The trigger is optional; its only purpose is to avoid writing an insert statement in JavaScript',
      ],
      answer: 0,
    },
    {
      id: 'm3-q6',
      q: 'Why do artist categories use a junction table while artwork tags use a text[] array column?',
      options: [
        'Arrays are always faster than junction tables, so tags were optimised and categories were not',
        'Categories are a controlled vocabulary that is joined and filtered on, so they need a foreign key into a lookup; tags are free-form values never joined, so an array on the row fits',
        'Categories change often and tags never change, which is the deciding factor',
        'There is no real difference; either could have been done the other way with identical results',
      ],
      answer: 1,
    },
    {
      id: 'm3-q7',
      q: 'You are testing an RLS update policy by impersonating artist A and updating artist B row. What is the correct assertion for a PASS?',
      options: [
        'The update raises a permission-denied exception that your test must catch',
        'The update succeeds but the change is silently rolled back on commit',
        'The update affects 0 rows — RLS filters rather than raising, so a blocked update simply matches no rows',
        'The update returns artist B row unchanged so you can compare it to the original',
      ],
      answer: 2,
    },
    {
      id: 'm3-q8',
      q: 'When you delete an artist, their artworks should vanish, but deleting the "Portrait" category should be blocked while artists are tagged with it. Which on-delete actions encode this correctly?',
      options: [
        'cascade from artist to artworks so the artworks are deleted, and restrict on the category foreign key so the delete is blocked while references exist',
        'restrict everywhere, so no delete of any kind ever succeeds',
        'set null on both, so the artworks and the category references are simply nulled out',
        'cascade on both, so deleting a category also deletes every artist tagged with it',
      ],
      answer: 0,
    },
  ],
}
