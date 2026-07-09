// Module 12 — Favourites: save/remove, optimistic UI, FavoritesContext, favourites page
// KalaKaara (React + Supabase) course content for the React course player.

export const m11 = {
  id: 'm11',
  title: 'Favourites',
  hours: 5,
  color: 'from-fuchsia-500/20 to-fuchsia-700/10',
  accent: 'fuchsia',
  description:
    'Build the favourites feature end to end: a join table whose composite primary key makes double-favouriting structurally impossible, three RLS policies plus one deliberately absent policy, a memoised FavoritesContext holding a Set of ids, a useFavorite hook that updates the UI instantly and rolls back on failure, the auth-gated favourite-then-sign-in flow, and a /favourites page that survives an artist unpublishing under it.',
  sections: [
    {
      id: 'm11-s1',
      title: 'The table, and the constraint that does the work',
      topics: [
        {
          id: 'm11-t1',
          title: 'The favorites table and its composite primary key',
          explain:
            'A favourite is nothing but a link between a user and an artist, so the table needs no id of its own — the pair of foreign keys is the identity, and making that pair the primary key makes a duplicate favourite impossible.',
          analogy:
            'Think of the seva register at the Kollur temple counter. Each line reads "this devotee, this seva". Nobody prints a serial number on the line — the devotee-and-seva pair is what a line *is*. And if the same devotee tries to book the same seva for the same slot twice, the register itself should refuse the second line, not politely accept a duplicate. A favourite is exactly that kind of line: a user, an artist, and a timestamp.',
          theory:
            'A join table like `favorites` exists only to say "this row over here relates to that row over there". Its natural key is the pair of things it relates: `(user_id, artist_id)`. If you make that pair the **composite primary key**, three good things happen at once. The pair is guaranteed unique, so a user physically cannot have two favourite rows for the same artist. There is an automatic index on the pair, which is exactly the lookup you do most (does this user favourite this artist?). And you carry no surrogate `id uuid` that nobody ever references, because nothing else in the schema points *at* a favourite.\n\nThis is a deliberate exception to the KalaKaara convention that every table has `id uuid primary key default gen_random_uuid()`. That convention exists for entity tables — `artists`, `artworks`, `reviews` — because other rows reference them by id and you want a stable handle that never changes. A pure join row is referenced by nobody. Giving it a surrogate id would add a column, add a second index, and — this is the trap — let two rows with the *same* pair but *different* ids coexist unless you *also* add a `unique (user_id, artist_id)` constraint. So the surrogate-id version needs the composite constraint anyway, plus a useless id on top.\n\nSo when is `id` + `unique(...)` the right shape instead? When the join row is itself an entity that other rows reference, or when it accumulates its own child data. `reviews` in the next module is a good contrast: a review relates a user and an artist, but it also has a rating, a comment, edits over time, and — crucially — it is a thing you might link to (a "helpful" vote points at a review id). That earns a surrogate id. A favourite earns nothing. It is a fact that is either true or absent.\n\nHold on to that framing — **either true or absent** — because it explains almost every decision in this module. A favourite is a boolean stored as the presence of a row. There is no half-favourite, no favourite to edit, no favourite that means something different depending on its column values. That is why the primary key can be the whole story.',
          diagram: `graph TD
    P[profiles<br/>id PK] -->|user_id FK| F
    A[artists<br/>id PK] -->|artist_id FK| F
    F[favorites<br/>PRIMARY KEY = user_id + artist_id<br/>no surrogate id column]
    F --> R1[Rukmini + Ganesh -> one row, ok]
    F --> R2[Rukmini + Shalini -> one row, ok]
    F --> X[Rukmini + Ganesh AGAIN<br/>same pair already exists<br/>rejected by the PK]
    style X fill:#fecaca`,
          flowExplain:
            'The red node is the whole point: the second attempt to favourite the same artist is refused by the primary key itself, before any application code runs. Uniqueness is a property of the table, not of your React.',
          whyItMatters:
            'Interviewers love the composite-key question because it separates people who reach for a surrogate id by reflex from people who ask what the key actually is. Being able to say "a join row is identified by the pair it joins, so the pair is the key, and that also gives me the exact index I query on" is a concrete signal of database judgement.',
          steps: [
            'Write down what a favourite *is* in one sentence: a fact that a given user has saved a given artist. Note that it has no attributes worth editing.',
            'Model it as a table with exactly three columns: `user_id`, `artist_id`, `created_at`. Resist adding an `id`.',
            'Declare `primary key (user_id, artist_id)` and read it aloud as "the pair is the identity".',
            'Add `on delete cascade` to both foreign keys, so that deleting a user or an artist takes their favourite rows with them and leaves no dangling links.',
            'Contrast with `reviews`: because a review has editable content and is referenced elsewhere, it keeps a surrogate `id` and adds a separate `unique (user_id, artist_id)`. Same uniqueness, different reason.',
          ],
          code: `-- favorites: a pure join table. The pair IS the identity.
create table public.favorites (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  artist_id  uuid not null references public.artists(id)  on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, artist_id)   -- composite PK: no duplicates possible,
                                      -- and this IS the index you query on
);

-- Contrast: reviews is an ENTITY, referenced elsewhere and edited over time.
-- It keeps a surrogate id AND adds a unique constraint for one-per-user.
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  artist_id  uuid not null references public.artists(id)  on delete cascade,
  rating     int  not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, artist_id)   -- one review per user per artist
);

-- The rule: no surrogate id on a row nobody references and nothing edits.
-- Add id + unique only when the row is itself an entity.`,
          pitfalls: [
            '**Adding an `id uuid` to `favorites` out of habit.** Now two rows with the same `(user_id, artist_id)` but different ids can both exist, and your "is it favourited?" check can return two rows. Fix: drop the id, make the pair the primary key. If you must keep an id, you still need `unique (user_id, artist_id)` on top of it — so the id bought you nothing.',
            '**Using `unique (user_id, artist_id)` but forgetting to make either column the key at all.** A unique constraint over two nullable columns still lets multiple rows through if a column is null. Fix: mark both columns `not null` (a favourite with a null side is meaningless) or use them as the primary key, which forces `not null`.',
            '**Leaving off `on delete cascade`.** Delete an artist and their favourite rows become dangling references to a row that no longer exists, or the delete fails outright. Fix: cascade on both foreign keys so favourites clean themselves up.',
            '**Assuming the composite PK also gives you a fast "who favourited this artist?" query.** A composite PK on `(user_id, artist_id)` indexes user-first, so it does not help a lookup by `artist_id` alone. Fix: if you ever count favourites per artist, add a separate index on `artist_id`. For KalaKaara you query user-first, so the PK is enough.',
          ],
          tryIt:
            'A favourite is "either true or absent" — write down two other facts in KalaKaara that are also just the presence of a join row (a service-area declaration; an artist-to-category link). Then write one fact that is NOT — a review — and say in one sentence why it earns a surrogate id (it has editable content and other rows may reference it).',
          takeaway:
            'A favourite is a pure join row identified by the pair it joins. Make `(user_id, artist_id)` the primary key and duplicates become structurally impossible, with no surrogate id and no extra index needed.',
        },
        {
          id: 'm11-t2',
          title: 'Why the database prevents duplicates, not the client',
          explain:
            'On a slow connection a user double-taps the heart and fires two identical inserts; the composite primary key rejects the second with error code 23505, and the correct response is to treat that error as success.',
          analogy:
            'At a busy santhe stall you shout your order, then — unsure the vendor heard over the crowd — shout it again. A good vendor does not hand you two plates of the same thing; the order was already taken, so the second shout is a no-op. Your app should behave like that vendor: the second identical favourite is not an error to shout back at the user, it is simply "already done".',
          theory:
            'Picture the real failure. A user on a patchy 4G connection near Maravanthe taps the heart. Nothing visibly happens for 300ms, so they tap again. Now two `insert` requests are in flight for the same `(user_id, artist_id)`. If you tried to prevent this only in JavaScript — "disable the button after the first tap" — you would be trusting the client, and the client is exactly the thing that is slow and racy right now. Two taps can both read `isFavorite === false` before either write lands.\n\nThe database does not have this problem, because the composite primary key is enforced inside a single Postgres transaction per insert. The first insert succeeds. The second insert violates the primary key and Postgres raises a **unique-violation error**, whose SQLSTATE code is **`23505`**. PostgREST passes that code straight through to `supabase-js`, so in your service you can read `error.code === \'23505\'`.\n\nHere is the judgement call that separates a polished app from a janky one: `23505` on a favourite insert is **not a failure**. The user wanted the artist favourited; the artist is favourited; the operation is **idempotent** — running it twice leaves the world in the same state as running it once. So you catch `23505` and return quietly, as if the insert had succeeded. You do **not** surface an error toast that says "duplicate key value violates unique constraint" — that is a database implementation detail leaking into a human face.\n\nEvery other error code is different and must still throw: a network failure, an RLS denial, a foreign key violation because the artist was deleted. Those are real. So the shape is precise: swallow exactly `23505`, throw everything else. Getting this exactly right — not "swallow all insert errors", which would hide real bugs — is the mark of someone who has actually run this on a bad connection.',
          diagram: `graph TD
    U[User double-taps the heart<br/>on a slow 4G connection] --> I1[insert 1 fires]
    U --> I2[insert 2 fires]
    I1 --> DB[(favorites<br/>PK = user_id + artist_id)]
    I2 --> DB
    DB --> OK[insert 1 -> row created]
    DB --> ERR{insert 2}
    ERR -->|pair already present| C[Postgres raises 23505<br/>unique_violation]
    C --> H[service catches 23505<br/>returns silently]
    H --> DONE[UI shows ONE filled heart<br/>no error toast]
    style C fill:#fde68a
    style DONE fill:#bbf7d0`,
          flowExplain:
            'Follow insert 2: it does not corrupt anything and it does not deserve an error message. The 23505 branch collapses into the same happy outcome as insert 1, because the favourite the user asked for already exists.',
          whyItMatters:
            'Idempotency is a word that appears in every distributed-systems interview, and favourites are the cleanest possible example of it. "The second identical write returns 23505, which I treat as success because the operation is idempotent" is a sentence that demonstrates you understand why retries are safe here and why the database, not the button, is the source of truth.',
          steps: [
            'Reproduce the bug deliberately: throttle your network in DevTools, tap a heart twice fast, and watch two inserts leave the browser.',
            'Confirm the second one comes back with `error.code === \'23505\'` by logging the error object once.',
            'In `addFavorite`, add the guard `if (error && error.code === \'23505\') return;` *before* the general `if (error) throw`.',
            'Verify you did NOT swallow other errors: temporarily point at a non-existent artist id and confirm a foreign-key error still throws.',
            'Note that you did not need to disable the button to be correct — the database made the operation safe. Disabling the button is a UX nicety, not the safety mechanism.',
          ],
          code: `import { supabase } from '../supabase/client';

// Adding a favourite is idempotent. A duplicate is success, not failure.
export async function addFavorite(artistId) {
  const { error } = await supabase
    .from('favorites')
    .insert({ artist_id: artistId });   // user_id filled by a column default (next topic)

  // 23505 = unique_violation. The pair already exists, i.e. already favourited.
  // The user wanted it favourited; it is. Return quietly.
  if (error && error.code === '23505') return;

  // Anything else is a real error: network down, RLS denied, artist deleted.
  if (error) throw new Error('Could not add favourite: ' + error.message);
}

// Why not just "disable the button"? Because the client is the slow, racy part.
// Two taps can both read isFavorite === false before either write lands.
// The composite PK is the only place the race is actually resolved.`,
          pitfalls: [
            '**Swallowing every insert error, not just 23505.** Then an RLS denial or a deleted-artist foreign-key error silently does nothing and the user thinks it worked. Fix: check `error.code === \'23505\'` specifically; re-throw everything else.',
            '**Showing the raw Postgres message to the user.** "duplicate key value violates unique constraint favorites_pkey" is terrifying and meaningless to a buyer. Fix: 23505 shows nothing at all; other errors show a friendly "Could not save, tap to retry".',
            '**Relying on a disabled button as the safety mechanism.** A disabled button does not help across two tabs, a page reload mid-tap, or a retry after a timeout. Fix: the database constraint is the guarantee; the button state is only polish.',
            '**Assuming the second insert overwrites the first with a new `created_at`.** It does not — it is rejected entirely, so the original `created_at` is preserved. Fix: rely on that; the favourite keeps the timestamp of when it was first saved, which is what your "recently saved" ordering wants.',
          ],
          tryIt:
            'Write, in one sentence each, what your service should do for these three error codes on a favourite insert: `23505` (unique violation), `23503` (foreign key violation, artist was deleted), and a network timeout. (Swallow the first as success; throw the second and third so the UI can retry.)',
          takeaway:
            'The composite primary key resolves the double-tap race inside Postgres. Catch `23505`, treat it as success because the operation is idempotent, and throw every other error.',
        },
        {
          id: 'm11-t3',
          title: 'RLS for favourites, and the policy that is deliberately absent',
          explain:
            'Favourites need three policies — select, insert, delete — all scoped to the current user, and pointedly no update policy at all, because a favourite has nothing to update.',
          analogy:
            'A locker at the Kundapura bus stand: you can open yours to look inside, put a bag in, and take a bag out — but there is no operation called "edit the bag while it sits there". The locker offers three verbs, not four. Favourites offer the same three, and the missing fourth is not an oversight; there is simply nothing an "edit favourite" verb could mean.',
          theory:
            'Every table in KalaKaara has Row Level Security enabled and denies everything by default, so a table with zero policies is a table nobody can touch. For `favorites` we add exactly three policies, and each one is scoped to "rows belonging to the caller".\n\n**Select** — `to authenticated using (user_id = auth.uid())`. You may read your own favourites and no one else\'s. There is no reason for one user to see another user\'s saved artists, so the `using` clause filters every read to the caller\'s own rows.\n\n**Insert** — `to authenticated with check (user_id = auth.uid())`. On an insert there are no existing rows to filter, so `using` does not apply; instead `with check` validates the row you are trying to create. It says the `user_id` of the new row must equal your own id — you cannot favourite something *on behalf of* another user.\n\n**Delete** — `to authenticated using (user_id = auth.uid())`. You may delete only your own favourite rows. Same ownership predicate as select.\n\nNow the interesting part: **there is no update policy, on purpose.** A favourite has three columns — `user_id`, `artist_id`, `created_at` — and not one of them is a thing a user should change. Changing `user_id` or `artist_id` would turn "I saved Ganesh" into "someone else saved Shalini", which is nonsense; changing `created_at` is meaningless. So the correct set of operations is: create it, read it, destroy it. To *change* a favourite you delete the old row and insert a new one. Because RLS denies by default, simply **writing no update policy** means no authenticated user can ever update a favourite — the absence enforces the rule.\n\nThis is worth internalising as a design principle: **a deliberately omitted policy is a decision, not a gap.** A reviewer who sees three policies and asks "where is update?" should find a one-line comment saying "no update: a favourite is immutable, replace by delete+insert". Silence looks like forgetfulness; a comment turns it into intent.\n\nFinally, note who gets nothing. Every policy names `to authenticated`. The `anon` role is never mentioned, so an anonymous visitor has no policy that grants them anything on `favorites` — they cannot read, insert, or delete a single row. That is correct: favourites are a signed-in feature, and the database refuses anonymous access to them without any code in React deciding so.',
          diagram: `graph TD
    F[favorites table<br/>RLS enabled -> deny by default] --> S[SELECT policy<br/>to authenticated<br/>using user_id = auth.uid]
    F --> I[INSERT policy<br/>to authenticated<br/>with check user_id = auth.uid]
    F --> D[DELETE policy<br/>to authenticated<br/>using user_id = auth.uid]
    F --> U[UPDATE policy]
    U --> NONE[NONE - deliberately absent<br/>a favourite is immutable<br/>replace by delete + insert]
    F --> AN[anon role]
    AN --> NOTHING[no policy names anon<br/>anonymous callers get nothing]
    style NONE fill:#fde68a
    style NOTHING fill:#fecaca`,
          flowExplain:
            'Read the two highlighted leaves together: the missing update policy and the missing anon policy are both enforced by absence. RLS denies by default, so what you do not write is exactly what you forbid.',
          whyItMatters:
            'The most common RLS mistake is writing `using (true)` to "make it work" and accidentally exposing every user\'s data. Understanding that absence is enforcement — that not writing a policy is the same as forbidding the operation — is what lets you reason about security by what you granted, not by what you blocked.',
          steps: [
            'Enable RLS on the table first: `alter table public.favorites enable row level security;`. Without this, policies are ignored and the table is wide open.',
            'Write the select policy with `using (user_id = auth.uid())` so reads are scoped to the caller.',
            'Write the insert policy with `with check (user_id = auth.uid())` — note it is `with check`, not `using`, because there is no existing row to filter on an insert.',
            'Write the delete policy with `using (user_id = auth.uid())`.',
            'Deliberately write NO update policy, and add a SQL comment explaining why, so the next reader knows it is intent, not an omission.',
            'Confirm anonymous access is denied by testing a select with the anon key — it must return zero rows, because no policy names `anon`.',
          ],
          code: `alter table public.favorites enable row level security;

-- SELECT: read only your own favourites.
create policy "read own favourites"
  on public.favorites for select
  to authenticated
  using (user_id = auth.uid());

-- INSERT: you may only create a favourite that belongs to you.
-- with check validates the NEW row; there is no existing row to "use".
create policy "insert own favourites"
  on public.favorites for insert
  to authenticated
  with check (user_id = auth.uid());

-- DELETE: you may only remove your own favourites.
create policy "delete own favourites"
  on public.favorites for delete
  to authenticated
  using (user_id = auth.uid());

-- UPDATE: deliberately NONE. A favourite is immutable — none of its three
-- columns is a thing a user should change. To "change" a favourite, delete
-- the row and insert a new one. RLS denies by default, so writing no update
-- policy IS the rule. This comment is here so nobody thinks it was forgotten.

-- anon is never named above, so anonymous callers get nothing on this table.`,
          pitfalls: [
            '**Forgetting `enable row level security`.** Policies exist but are never consulted, and the table is readable by anyone with the anon key. Fix: enabling RLS is step one on every table; a table without it is a public spreadsheet.',
            '**Using `using` instead of `with check` on the insert policy.** `using` filters existing rows and does nothing on an insert, so the policy silently allows any row through. Fix: inserts are validated by `with check`; updates need both `using` (which rows) and `with check` (what they become).',
            '**Adding an update policy "for completeness".** Now a user can rewrite `artist_id` on an existing row and quietly change what they favourited, breaking your `created_at` ordering and any counters. Fix: omit it on purpose and document the omission.',
            '**Writing `using (true)` on select because "favourites are not secret".** They are — one user seeing another user\'s saved artists is a privacy leak. Fix: `using (user_id = auth.uid())` on every policy without exception.',
            '**Assuming naming only `authenticated` accidentally lets anon through.** It does the opposite: unnamed roles are denied. But do not rely on assumptions — test it. Fix: run a select with the anon key and confirm zero rows.',
          ],
          tryIt:
            'Delete-then-insert is how you "move" a favourite. Explain in two sentences why that is strictly better than an update policy here. (An update could rewrite `user_id` to impersonate another user or corrupt the pair; delete+insert can only ever produce a row you are allowed to own, because the insert policy re-checks `user_id = auth.uid()`.)',
          takeaway:
            'Three policies — select, insert, delete — all `to authenticated` and all scoped with `user_id = auth.uid()`. No update policy, on purpose: absence is the rule, and RLS denies by default.',
        },
        {
          id: 'm11-t4',
          title: 'favoriteService.js, and never trusting the client to send user_id',
          explain:
            'The service exposes three functions — listFavorites, addFavorite, removeFavorite — and none of them ever sends `user_id`, because the database fills it and the RLS check makes forging it pointless anyway.',
          analogy:
            'At the temple seva counter you do not write your own name in the register — the archaka, who already knows who is standing in front of them, writes it. If you tried to write someone else\'s name, the counter would refuse, because the register is stamped with whoever actually presented themselves. The database is that archaka: it already knows `auth.uid()` from your token, so it fills in who you are; you do not get to claim to be someone else.',
          theory:
            'Following the KalaKaara dependency rule, every Supabase call for favourites lives in `services/favoriteService.js`, and the rest of the app only ever imports these three functions. Each returns plain data or throws, never `{ data, error }`.\n\nThe important discipline is what you do **not** send. A naive `addFavorite` writes `insert({ user_id: currentUser.id, artist_id })`. Never do this. The client should not be the authority on who the caller is — the client is a program running on a stranger\'s laptop, and any value it sends is a value an attacker can change in DevTools. There are two correct ways to fill `user_id`, and they compose.\n\n**Option A — a column default of `auth.uid()`.** In the migration you write `alter column user_id set default auth.uid()`. Now when the client inserts a row with no `user_id`, Postgres fills it with the id extracted from the caller\'s JWT. The client literally cannot get it wrong, because it does not supply it. This is the cleanest approach and the one KalaKaara uses.\n\n**Option B — set it server-side in a trigger or an RPC.** A `before insert` trigger overwrites `new.user_id := auth.uid()` regardless of what arrived. Useful when you want to force the value even if the client tries to send one. For a simple favourite, the default is enough; the trigger is the pattern to reach for when the rule is more than "just fill this column".\n\nNow the part that makes the whole question almost moot: even if an attacker *does* send `user_id: someone_elses_id`, the insert policy\'s `with check (user_id = auth.uid())` rejects it. The row they are trying to create has a `user_id` that is not theirs, the check fails, and Postgres refuses the insert. So the client-sent value is defended twice: it is never needed (the default fills it) and it is validated anyway (the check rejects a forged one). Belt and braces — and both belt and braces live in the database, not in React.\n\nThis is why "never trust the client" is not paranoia but architecture. The service omits `user_id` because it is cleaner; the database enforces `user_id` because the service could be bypassed entirely by someone calling PostgREST directly with the anon key. The security does not depend on the service behaving.',
          whyItMatters:
            'The single most common security bug in a beginner Supabase app is trusting a client-supplied owner id. Being able to explain the two defences — a default that means the client need not send it, and a `with check` that means a forged one is rejected — is exactly the reasoning that separates "it works" from "it is safe".',
          steps: [
            'Add the column default in your migration: `alter table public.favorites alter column user_id set default auth.uid();`.',
            'In `addFavorite`, insert only `{ artist_id }`. Do not read the current user id in React and do not send it.',
            'In `removeFavorite`, delete `where artist_id = ...` only — the RLS delete policy already restricts the delete to your own rows, so you cannot delete someone else\'s favourite even without naming `user_id`.',
            'In `listFavorites`, select `artist_id` — RLS scopes the result to your rows automatically, so no `where user_id = ...` is needed either.',
            'Convince yourself the `with check` is the real guard by imagining an attacker calling PostgREST directly: the default and the service are bypassed, but the check still rejects a forged `user_id`.',
          ],
          code: `import { supabase } from '../supabase/client';

// List the current user's favourite artist ids.
// No "where user_id = ..." needed: the SELECT policy already scopes rows to us.
export async function listFavorites() {
  const { data, error } = await supabase
    .from('favorites')
    .select('artist_id');
  if (error) throw new Error('Could not list favourites: ' + error.message);
  return data.map((row) => ({ artistId: row.artist_id }));  // snake -> camel
}

// Add a favourite. Note what is ABSENT: user_id.
// The column default auth.uid() fills it; with check rejects a forged one.
export async function addFavorite(artistId) {
  const { error } = await supabase
    .from('favorites')
    .insert({ artist_id: artistId });
  if (error && error.code === '23505') return;   // already favourited, idempotent
  if (error) throw new Error('Could not add favourite: ' + error.message);
}

// Remove a favourite. No user_id here either: the DELETE policy restricts
// the delete to rows we own, so we can only ever delete our own.
export async function removeFavorite(artistId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('artist_id', artistId);
  if (error) throw new Error('Could not remove favourite: ' + error.message);
}`,
          pitfalls: [
            '**Sending `user_id` from the client.** It is unnecessary (the default fills it) and it teaches you the wrong habit of trusting client-supplied owner ids. Fix: omit it; let `default auth.uid()` and `with check` do the work.',
            '**Adding `.eq(\'user_id\', currentUser.id)` to the delete "to be safe".** It reads a user id in React that could be stale or wrong, and it is redundant because RLS already scopes the delete. Fix: delete by `artist_id` alone and trust the delete policy.',
            '**Returning Supabase\'s `{ data, error }` shape from the service.** Then every caller must remember to check `error`, and one will not. Fix: unwrap it — throw on error, return plain camelCase data.',
            '**Believing the service layer is the security boundary.** Anyone can call PostgREST directly with the public anon key and skip your service entirely. Fix: never rely on the service for safety; the RLS `with check` is what actually defends the insert.',
          ],
          tryIt:
            'An attacker opens DevTools and calls PostgREST directly: `insert into favorites (user_id, artist_id) values (\'<someone-elses-id>\', \'<artist>\')`. Trace what happens. (The insert policy\'s `with check (user_id = auth.uid())` sees a `user_id` that is not the caller\'s, the check fails, Postgres rejects the insert — the forged owner id is defeated in the database, not in your code.)',
          takeaway:
            'Never send `user_id` from the client. A `default auth.uid()` fills it so you do not have to, and `with check (user_id = auth.uid())` rejects a forged one — the attack is pointless either way.',
        },
      ],
    },
    {
      id: 'm11-s2',
      title: 'Optimistic UI, done correctly',
      topics: [
        {
          id: 'm11-t5',
          title: 'What optimistic UI is, and the three states of a heart',
          explain:
            'Optimistic UI updates local state the instant the user acts, fires the request in the background, and rolls back only if the request fails — so a heart never sits waiting for a round trip.',
          analogy:
            'When you hand cash to the neer dosa vendor, they start pouring the batter before your coins have finished landing in the box. They are optimistic: they assume the payment is good and act immediately, and only in the rare case that a coin bounces out do they pause. If they waited for every coin to settle before touching the batter, the queue would never move. A heart that waits 400ms for the server before filling in feels exactly like that stalled queue.',
          theory:
            'The naive way to build a favourite button is **pessimistic**: on tap, show a spinner, send the request, wait for the response, then update the heart. On a fast connection this is invisible. On a Kundapura 4G connection it is 400ms of a spinning heart that the user taps again in frustration. Pessimistic UI makes the user pay for the network on every single interaction.\n\n**Optimistic UI** inverts the order. On tap, you *immediately* update the local state — fill the heart — as if the request had already succeeded. Then you fire the request in the background. If it succeeds, you do nothing, because the UI already shows the right thing. If it fails, you **roll back**: restore the heart to its previous state and tell the user something went wrong. You are betting that the request will succeed, and for a favourite on a working connection that bet wins virtually every time.\n\nThe bet is safe here for two reasons specific to favourites. First, the operation is idempotent and reversible — the worst case of a wrong optimistic update is a heart that flips back, not corrupted data. Second, the composite primary key means even a duplicate insert is harmless. Optimistic UI is *not* appropriate for everything (you would never optimistically show "payment complete"), but it is ideal for a low-stakes, reversible toggle like a favourite.\n\nThat gives a heart exactly **three states**, and naming them is the whole mental model:\n\n**1. Idle.** The heart reflects the truth in local state — filled if favourited, outline if not. No request is in flight.\n\n**2. Optimistic-pending.** The user just tapped. The heart has *already* flipped to the new state, and a request is in flight. Crucially, the heart is not showing a spinner — it is showing the *result*, optimistically. The pending-ness is invisible to the user unless it fails.\n\n**3. Reverted-with-a-toast.** The request failed. The heart flips *back* to its previous state, and a small toast appears: "Could not save, tap to retry". This is the only state where the user learns the network exists.\n\nMost of the time a heart lives in state 1, blinks through state 2 imperceptibly, and never sees state 3. But you must build all three, because state 3 is what makes the optimism honest — you are allowed to lie to the user about success only if you promise to correct the lie when it turns out false.',
          diagram: `graph LR
    IDLE[1. idle<br/>heart reflects the Set<br/>no request in flight] -->|user taps| PEND[2. optimistic-pending<br/>heart flips INSTANTLY<br/>request in flight, invisible]
    PEND -->|request resolves| IDLE
    PEND -->|request throws| REV[3. reverted + toast<br/>heart flips BACK<br/>retry toast appears]
    REV -->|user taps retry| PEND
    REV -->|user gives up| IDLE2[idle at old state]
    style PEND fill:#fde68a
    style REV fill:#fecaca`,
          flowExplain:
            'The arrow from pending back to idle on success carries no visible change, because the heart already showed the new state. Only the failure arrow does visible work — flipping back and raising the toast. That asymmetry is what makes the interaction feel instant.',
          whyItMatters:
            'Optimistic UI is a named pattern interviewers ask about directly, and favourites are the textbook example. Being able to say "I update local state first, fire the request, and roll back to a snapshot on failure, because the operation is reversible and low-stakes" shows you understand both the technique and when it is and is not appropriate.',
          steps: [
            'Name the three states out loud: idle, optimistic-pending, reverted-with-a-toast. Sketch the heart in each.',
            'Decide what "immediately" means: the local state (the Set of favourite ids) changes synchronously in the tap handler, before any `await`.',
            'Decide what success does: nothing visible, because the UI already shows the optimistic result.',
            'Decide what failure does: restore the previous state and surface a retry affordance. Never leave the heart lying.',
            'Sanity-check that this is an appropriate place for optimism: the action is reversible, low-stakes, and idempotent. Note that a payment or a destructive delete would not qualify.',
          ],
          code: `// The shape of optimistic UI, in pseudocode, before we build the real hook.

function onHeartTap() {
  const previous = readCurrentState();   // 1. snapshot the truth
  applyChangeLocally();                  // 2. lie immediately: flip the heart
                                         //    -> state is now "optimistic-pending"

  sendRequestToServer()
    .then(() => {
      // 3a. success: do nothing. The UI already shows the right thing.
      //     -> state returns to "idle" with no visible change.
    })
    .catch(() => {
      restoreState(previous);            // 3b. failure: undo the lie
      showRetryToast();                  //     -> state is "reverted-with-a-toast"
    });
}

// Pessimistic (what we are NOT doing) would be:
//   showSpinner(); await sendRequest(); applyChange(); hideSpinner();
// which makes the user watch the network on every tap. On 4G that is 400ms
// of nothing, and they tap again.`,
          pitfalls: [
            '**Showing a spinner on the heart while the request is in flight.** That is pessimistic UI wearing an optimistic costume — the user still waits. Fix: flip the heart to the final state immediately and keep the pending-ness invisible unless it fails.',
            '**Applying optimism to irreversible actions.** Optimistically showing "review deleted" or "payment done" and then rolling back is a disaster. Fix: reserve optimism for reversible, low-stakes toggles; favourites qualify, deletes of real content do not.',
            '**Rolling back to a hardcoded state instead of a snapshot.** If you "undo" by setting `isFavorite = false`, you are wrong whenever the failed action was a *remove*. Fix: snapshot the exact previous state and restore *that*.',
            '**Failing silently on rollback.** If the heart quietly flips back with no message, the user thinks they mis-tapped and the app looks broken. Fix: state 3 always includes a visible, tappable retry.',
          ],
          tryIt:
            'A user taps to REMOVE a favourite and the request fails. Write down exactly what the heart should look like before the tap, during the optimistic window, and after the rollback. (Filled -> outline -> filled again, plus a "Could not remove, tap to retry" toast.) Notice the rollback restores "filled", which a hardcoded `false` would have gotten wrong.',
          takeaway:
            'Optimistic UI updates local state first, fires the request, and rolls back to a snapshot on failure. A heart has three states — idle, optimistic-pending, reverted-with-a-toast — and you must build all three.',
        },
        {
          id: 'm11-t6',
          title: 'FavoritesContext — a memoised Set, loaded once',
          explain:
            'FavoritesContext is the second and last context in KalaKaara: it holds a Set of the current user\'s favourite artist ids, loaded once on sign-in, so every ArtistCard can render its heart without its own query.',
          analogy:
            'Imagine every stall at the santhe having to send a runner to the town hall to ask "has this customer registered?" every time the customer walks past. Absurd — you would fetch the register once in the morning and keep it at the front of the market for everyone to glance at. FavoritesContext is that shared register: loaded once when you sign in, glanced at by every card, never re-fetched per card.',
          theory:
            'KalaKaara has exactly two contexts — `SessionContext` (who is signed in, from the auth module) and now `FavoritesContext`. Two. Context is expensive to overuse because every consumer re-renders when the value changes, so it is reserved for genuinely global facts that many distant components need. The favourite state qualifies: an `ArtistCard` appears on the home grid, the browse grid, and the favourites page, and *each* card needs to know whether *its* artist is favourited so it can render a filled or outline heart.\n\nWithout a context, each card would have to ask the database "is this artist favourited?" — N cards, N queries, a waterfall of round trips on every grid. With a context, you load the user\'s favourites **once** on sign-in into a `Set` of artist ids, and each card does a synchronous `favorites.has(artist.id)` with no network at all. A `Set` is the right structure precisely because the only questions you ask are "is this id in the collection?" (O(1) membership), "add this id", and "remove this id" — never "give me the third favourite" or "sort them". A `Set` answers exactly those three questions in constant time; an array would make `has` an O(n) scan on every card render.\n\nThe context loads its data in a `useEffect` keyed on the signed-in user. When `user` becomes non-null (sign-in), it calls `listFavorites()` and builds the `Set`. When `user` becomes null (sign-out), it **clears the set** — you must not leave one user\'s favourites visible to the next person on a shared machine at an internet cafe in Udupi. That clear-on-sign-out is a one-liner and a real privacy requirement.\n\nThe last detail is performance-critical: **memoise the context value.** A React context value that is a fresh object on every render (`value={{ ids, setIds }}`) forces *every* consumer to re-render on every parent render, even when the favourites did not change. Wrap the value in `useMemo(() => ({ ids, setIds }), [ids, setIds])` and wrap `setIds` in `useCallback`, so the value object is stable unless the favourites actually change. With dozens of `ArtistCard` consumers on a grid, this is the difference between one card re-rendering when you favourite it and all of them re-rendering.',
          diagram: `graph TD
    SI[User signs in] --> LOAD[useEffect keyed on user<br/>calls listFavorites once]
    LOAD --> SET[build a Set of artist ids]
    SET --> VAL[useMemo value = ids + setIds]
    VAL --> C1["ArtistCard on home grid<br/>ids.has id -> O(1)"]
    VAL --> C2["ArtistCard on browse grid<br/>ids.has id -> O(1)"]
    VAL --> C3["ArtistCard on favourites page<br/>ids.has id -> O(1)"]
    SO[User signs out] --> CLR[clear the Set<br/>next person sees nothing]
    style VAL fill:#fde68a
    style CLR fill:#fecaca`,
          flowExplain:
            'One load feeds every card, and the memoised value node is what stops an unrelated re-render from cascading to all three cards. The clear-on-sign-out branch is the privacy guarantee on a shared computer.',
          whyItMatters:
            'Choosing a `Set` over an array for membership, loading once instead of per-card, and memoising the context value are three concrete performance decisions an interviewer can probe. "Why a Set?" has a real answer — O(1) membership for the only question cards ask — and "why memoise the value?" prevents the classic context re-render storm.',
          steps: [
            'Create `contexts/FavoritesContext.jsx` exporting a `FavoritesProvider` and a `useFavorites` hook.',
            'Hold the ids in `useState(() => new Set())` — a lazy initialiser so a fresh Set is created once, not on every render.',
            'In a `useEffect` keyed on the session `user`, load favourites when the user is present and clear the Set when the user is null.',
            'Wrap `setIds` in `useCallback` and the context value in `useMemo` so the value object is referentially stable.',
            'Have `useFavorites` throw if used outside the provider, so a misplaced consumer fails loudly instead of reading null.',
            'Mount `<FavoritesProvider>` inside `<SessionProvider>` in `App.jsx`, because it depends on knowing who is signed in.',
          ],
          code: `import {
  createContext, useContext, useState, useEffect, useMemo, useCallback,
} from 'react';
import { useSession } from './SessionContext';
import { listFavorites } from '../services/favoriteService';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useSession();
  const [ids, setIds] = useState(() => new Set());   // lazy init: one Set

  useEffect(() => {
    if (!user) { setIds(new Set()); return; }         // clear on sign-out
    let cancelled = false;
    listFavorites()
      .then((rows) => {
        if (!cancelled) setIds(new Set(rows.map((r) => r.artistId)));
      })
      .catch(() => { if (!cancelled) setIds(new Set()); });
    return () => { cancelled = true; };
  }, [user]);                                          // reload when user changes

  const replace = useCallback((next) => setIds(next), []);

  // Memoise so consumers do not re-render unless ids actually change.
  const value = useMemo(() => ({ ids, setIds: replace }), [ids, replace]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}`,
          pitfalls: [
            '**Storing favourites as an array.** Then every card runs `favourites.includes(id)`, an O(n) scan, on every render — death by a thousand cards on a large grid. Fix: a `Set`, whose `.has()` is O(1), matching the only question cards ask.',
            '**Not memoising the context value.** `value={{ ids, setIds }}` is a new object every render, so all consumers re-render on any parent render. Fix: `useMemo` the value and `useCallback` the setter.',
            '**Forgetting to clear the Set on sign-out.** The next person on a shared machine sees the previous user\'s saved artists. Fix: the `useEffect` clears the Set the moment `user` becomes null.',
            '**Querying "is favourited?" per card from the database.** N cards means N queries and a visible render waterfall. Fix: load once into the context; cards read synchronously from the Set.',
            '**Making a third and fourth context because it feels organised.** Context re-renders are a cost; two is the right number for this app. Fix: keep global state to session and favourites; everything else is props.',
          ],
          tryIt:
            'Add a fourth `ArtistCard` mid-grid and favourite the first card. With the memoised value and a `React.memo`-wrapped card, how many cards re-render? (Ideally only the one whose `has(id)` result changed — but note that because the whole Set reference changes, cards re-render unless each also memoises on its own `isFavorite`. This is the exact trade-off worth reasoning about.)',
          takeaway:
            'FavoritesContext holds a `Set` of favourite ids, loaded once on sign-in and cleared on sign-out, with a memoised value — so every ArtistCard reads its heart state in O(1) with no per-card query.',
        },
        {
          id: 'm11-t7',
          title: 'useFavorite(artistId) — the hook with rollback',
          explain:
            'useFavorite returns `{ isFavorite, toggle, pending }`, and its toggle implements optimistic update with a snapshot-and-restore rollback, guarded against a double-toggle while a request is in flight.',
          analogy:
            'A careful shopkeeper, before changing the price on the board, jots the old price on a chit in their pocket. They rub out the board and write the new price immediately so customers see it — but if head office rejects the change over the phone, they pull the chit out and restore the old number exactly. The snapshot is the chit in the pocket: proof of what the truth was before you optimistically changed the board.',
          theory:
            '`useFavorite(artistId)` is the bridge between a single `ArtistCard` and the shared `FavoritesContext`. It reads the context Set to derive `isFavorite`, and it exposes a `toggle` that performs the optimistic dance from the previous topics. It returns exactly `{ isFavorite, toggle, pending }` — a small, honest surface.\n\n`isFavorite` is derived, not stored: `favorites.has(artistId)`. Deriving it means it can never drift out of sync with the context, which is the single source of truth. There is no local `useState(isFavorite)` shadow copy to keep aligned — a shadow copy is how "the heart says filled but the favourites page disagrees" bugs happen.\n\n`toggle` is where the rollback lives, and the order of operations is exact. First, **guard**: if `pending` is already true, return immediately — a second tap while the first request is in flight must be ignored, or you fire competing add/remove requests and the final state becomes a coin flip. Second, **snapshot**: copy the current Set (`new Set(ids)`) — this is the chit in the pocket, the truth before you touch anything. Third, **apply optimistically**: build the next Set with the id added or removed and call `setIds(next)` so every card updates instantly. Fourth, **await the service**: call `addFavorite` or `removeFavorite`. Fifth, in the **catch**: restore the snapshot with `setIds(snapshot)` and surface a retry. Sixth, in the **finally**: clear `pending`.\n\nThe snapshot is the crux. You cannot roll back by "doing the opposite", because you do not always know the opposite is correct — concurrent changes, a stale render, an add that was really a re-add after a failed remove. Restoring the exact Set you captured is the only rollback that is always right. Copy the Set (do not alias it); `new Set(ids)` gives you an independent snapshot that a later `setIds` cannot mutate underneath you.\n\nOne subtlety on the guard: you might allow the *derived* `isFavorite` to reflect the optimistic state while `pending`, so the heart looks toggled, but block a *second* toggle from starting. That is the correct feel: the user sees their tap register instantly, and a frantic double-tap does not launch a second request. The composite primary key would forgive a duplicate insert, but the guard keeps a rapid add-remove-add from ending in the wrong place.',
          diagram: `graph TD
    T[toggle called] --> G{pending already?}
    G -->|yes| STOP[ignore this tap]
    G -->|no| SNAP[snapshot = new Set of current ids]
    SNAP --> OPT[build next Set, add or remove id<br/>setIds next -> heart flips now]
    OPT --> REQ[set pending, await favoriteService]
    REQ -->|resolves| KEEP[keep the optimistic Set<br/>truth and UI agree]
    REQ -->|throws| RB[setIds snapshot<br/>show retry toast]
    KEEP --> FIN[finally: pending = false]
    RB --> FIN
    style KEEP fill:#bbf7d0
    style RB fill:#fecaca`,
          flowExplain:
            'The snapshot node is captured before the optimistic setIds, so the throw branch can restore the exact prior Set. The finally node clears pending on both paths, so the button never gets stuck disabled.',
          whyItMatters:
            'This hook is the concrete implementation interviewers mean when they say "walk me through optimistic UI with rollback". Snapshot, apply, await, restore-on-catch, guard-while-pending — narrating those five moves with a reason for each is a strong, specific answer that most candidates only wave at.',
          steps: [
            'Read `ids` from `useFavorites()` and derive `isFavorite = ids.has(artistId)` — do not copy it into local state.',
            'Track `pending` with a local `useState(false)`.',
            'At the top of `toggle`, guard: `if (pending) return;`.',
            'Snapshot the Set with `new Set(ids)` before changing anything.',
            'Apply the optimistic change to a *new* Set and `setIds(next)`; then await the correct service call inside a try.',
            'In `catch`, `setIds(snapshot)` and surface a retry; in `finally`, set `pending` false.',
          ],
          code: `import { useState } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import * as favoriteService from '../services/favoriteService';

export function useFavorite(artistId) {
  const { ids, setIds } = useFavorites();
  const [pending, setPending] = useState(false);

  const isFavorite = ids.has(artistId);   // derived, never a shadow copy

  async function toggle() {
    if (pending) return;                  // guard: ignore taps while in flight

    const snapshot = new Set(ids);        // the chit in the pocket
    const next = new Set(ids);            // an independent copy to mutate
    const adding = !isFavorite;
    if (adding) next.add(artistId);
    else next.delete(artistId);

    setPending(true);
    setIds(next);                         // optimistic: heart flips immediately

    try {
      if (adding) await favoriteService.addFavorite(artistId);
      else await favoriteService.removeFavorite(artistId);
      // success: nothing to do; the optimistic Set was correct
    } catch (err) {
      setIds(snapshot);                   // rollback to the exact prior truth
      // surface a retry toast to the user here
      throw err;                          // let the caller show the retry
    } finally {
      setPending(false);                  // never leave the button stuck
    }
  }

  return { isFavorite, toggle, pending };
}`,
          pitfalls: [
            '**Rolling back by inverting the action instead of restoring the snapshot.** After a failed remove you "undo" by adding, but a concurrent change makes that wrong. Fix: restore the captured Set verbatim; it is the only always-correct rollback.',
            '**Aliasing the Set instead of copying it.** `const snapshot = ids;` captures a reference that a later mutation changes underneath you, so the rollback restores the wrong thing. Fix: `new Set(ids)` for an independent snapshot.',
            '**Omitting the pending guard.** A frantic double-tap fires add then remove (or two adds), and the final state is whichever response lands last — a race. Fix: `if (pending) return;` at the top of toggle.',
            '**Keeping `isFavorite` in local `useState`.** Now the heart and the favourites page can disagree because two sources of truth drift. Fix: derive `isFavorite` from the context Set every render.',
            '**Setting pending false only in the try, not a finally.** An early throw leaves `pending` stuck true and the heart permanently unresponsive. Fix: clear it in `finally`, which runs on both success and failure.',
          ],
          tryIt:
            'The user taps to add, the add is slow, and they tap again before it resolves. With the `if (pending) return;` guard, what happens? (The second tap is ignored, so exactly one add fires and the heart stays filled. Remove the guard and you get add-then-remove, ending outline — the opposite of what they wanted.)',
          takeaway:
            '`useFavorite` derives `isFavorite` from the context Set and toggles by snapshot, apply-optimistically, await, restore-on-catch, guarded against double-toggle by `pending`.',
        },
        {
          id: 'm11-t8',
          title: 'The auth gate again — favourite while logged out',
          explain:
            'An anonymous visitor taps the heart, so you reuse useAuthGate with a favourite intent, sign them in with Google, and on return replay the intent so the artist is already favourited at the same scroll position.',
          analogy:
            'You are halfway through a temple queue when the counter tells you to register first. A good counter does not send you back to the entrance — it takes your token, registers you, and returns you to the exact spot you were standing, with your seva already noted. Making you re-join the queue from the back and re-find your place is what a careless system does. The favourite intent is that token that holds your place.',
          theory:
            'Favourites are a signed-in feature — the RLS policies name only `authenticated`, so an anonymous tap of the heart cannot write a row. But the *worst* thing you can do is tell the visitor "sign in first" and dump them on the home page, where they must find the artist again and tap the heart a second time. That is two taps for one intention, across a page reload, with a lost scroll position. People give up there.\n\nThe fix is the same `useAuthGate()` hook built for the contact-reveal flow in the previous module, reused with a different intent. When an anonymous user taps the heart, instead of calling `toggle` directly you call the gate with an intent object: `{ type: \'favorite\', artistId }`. The gate saves that intent (and the scroll position) somewhere that survives the OAuth redirect — `sessionStorage`, keyed so multiple tabs do not collide — and sends the user to Google sign-in. On return to `/auth/callback`, the session is established, the gate reads the saved intent back, restores the scroll position, and **replays** the intent: it calls `addFavorite(artistId)`. The visitor lands back exactly where they were, and the heart is *already filled*. They never tapped twice.\n\nThe intent is a small tagged object, and reusing one gate for both contact-reveal and favourite is why it takes a `type`. A `switch (intent.type)` on return routes `\'reveal\'` to the contact flow and `\'favorite\'` to `addFavorite`. This is the payoff of having built the gate generically in the contact module: adding favourites to it is a new case, not a new mechanism.\n\nOne correctness note: on return you should update the `FavoritesContext` Set as well as writing the row, so the heart across every card reflects the new favourite immediately. And because `addFavorite` swallows `23505`, a visitor who somehow triggers the replay twice (double sign-in, a stale intent) still ends in the right state — the idempotency from earlier in the module quietly protects the replay path too.',
          diagram: `sequenceDiagram
    autonumber
    actor V as Anonymous visitor
    participant H as Heart on ArtistCard
    participant AG as useAuthGate
    participant G as Google OAuth
    participant PG as Postgres + RLS
    V->>H: Tap heart (not signed in)
    H->>AG: run intent {type:'favorite', artistId}
    AG->>AG: save intent + scroll position to sessionStorage
    AG->>G: redirect to Google sign-in
    G-->>AG: return to /auth/callback, session ready
    AG->>AG: read saved intent, restore scroll position
    AG->>PG: addFavorite(artistId) with JWT (auth.uid set)
    PG-->>AG: row inserted (user_id = auth.uid)
    AG->>AG: add id to FavoritesContext Set
    AG-->>V: heart ALREADY filled, same spot on the page`,
          flowExplain:
            'Steps 3 and 6 are the ones beginners drop: saving the intent before the redirect and replaying it after. Without them the visitor returns to the home page and must find the artist and tap again.',
          whyItMatters:
            'Intent replay across an OAuth redirect is a genuinely tricky, genuinely common flow, and reusing one gate for two intents shows design maturity. "I made the auth gate take a tagged intent so contact-reveal and favourite share one save-redirect-replay mechanism" is the kind of answer that signals you build for reuse, not for the demo.',
          steps: [
            'In the ArtistCard heart handler, check the session: if signed in, call `toggle()`; if not, call the auth gate with `{ type: \'favorite\', artistId }`.',
            'Have the gate persist the intent and the scroll position to `sessionStorage` before redirecting to Google.',
            'On `/auth/callback`, after the session is set, read the intent back and `switch` on `intent.type`.',
            'For `\'favorite\'`, call `addFavorite(artistId)` and add the id to the FavoritesContext Set.',
            'Restore the scroll position and clear the stored intent so it does not replay again on the next navigation.',
            'Test the whole loop on a phone: tap heart logged out, sign in, land back on the same artist with the heart already filled.',
          ],
          code: `// In ArtistCard: decide between toggle and the auth gate.
function HeartButton({ artistId }) {
  const { user } = useSession();
  const { isFavorite, toggle, pending } = useFavorite(artistId);
  const runWithAuth = useAuthGate();   // reused from the contact module

  function onTap() {
    if (user) {
      toggle();                        // signed in: optimistic toggle
    } else {
      // signed out: save the intent, sign in, replay on return
      runWithAuth({ type: 'favorite', artistId });
    }
  }

  return (
    <button aria-pressed={isFavorite} disabled={pending} onClick={onTap}>
      {isFavorite ? 'Saved' : 'Save'}
    </button>
  );
}

// On /auth/callback, after the session is established:
function replayIntent(intent, favorites) {
  switch (intent.type) {
    case 'reveal':                     // from the contact module
      return; // navigate back and reveal the number
    case 'favorite':
      // addFavorite swallows 23505, so a double replay is still safe
      return favoriteService.addFavorite(intent.artistId)
        .then(() => favorites.add(intent.artistId));   // update the Set too
    default:
      return;
  }
}`,
          pitfalls: [
            '**Dumping the user on the home page after sign-in.** They wanted to favourite one artist and now must find it again. Fix: save the intent before redirecting and replay it on return, restoring scroll.',
            '**Making the user tap the heart a second time after signing in.** Two taps for one intention feels broken. Fix: the replay performs the favourite for them; they return to an already-filled heart.',
            '**Storing the intent in React state or a context.** The OAuth redirect reloads the page, so in-memory state is gone. Fix: `sessionStorage`, keyed per tab, survives the redirect.',
            '**Building a separate gate for favourites.** Now you maintain two copies of the fragile save-redirect-replay logic. Fix: reuse the contact module\'s `useAuthGate` with a tagged `type`, and add a case.',
            '**Not updating the FavoritesContext Set on replay.** The row is written but the heart across other cards still shows outline until a reload. Fix: add the id to the Set as part of the replay.',
          ],
          tryIt:
            'Name three things the auth gate must persist across the Google redirect for the favourite flow to feel seamless. (The intent `{ type, artistId }`, the scroll position, and the page it happened on — all in `sessionStorage`, because the redirect reloads the page and wipes memory.)',
          takeaway:
            'Reuse `useAuthGate` with `{ type: \'favorite\', artistId }`: save the intent, sign in with Google, and replay on return so the artist is already favourited at the same scroll position. Never make them tap twice.',
        },
      ],
    },
    {
      id: 'm11-s3',
      title: 'The favourites page',
      topics: [
        {
          id: 'm11-t9',
          title: 'The /favourites page and the embedded join',
          explain:
            'The /favourites route is protected and fetches saved artists in a single embedded join — `select(\'created_at, artists(*)\')` ordered by newest — then renders the same ArtistCard used everywhere else.',
          analogy:
            'Instead of pulling one card from the register and then walking to the shelf to fetch each artist file one by one, you ask the clerk once for "every artist I saved, with their full file attached". One trip, everything stapled together. That single stapled request is the embedded join; the alternative — a trip per artist — is the N+1 problem that makes a page crawl.',
          theory:
            '`/favourites` is a **protected route**: wrap it in the same `ProtectedRoute` guard used for `/dashboard`, so an anonymous visitor hitting the URL directly is sent to sign-in rather than shown an empty or erroring page. Only a signed-in user has favourites to show.\n\nThe naive way to build this page is to fetch the favourite rows (giving you a list of `artist_id`s) and then, for each id, fetch the artist. That is the **N+1 query** anti-pattern: one query for the list, then N queries for the details, a waterfall that gets slower with every saved artist. PostgREST — and therefore `supabase-js` — solves this with an **embedded join**: `select(\'created_at, artists(*)\')` on the `favorites` table follows the `artist_id` foreign key and pulls the full related `artists` row *inside the same query*. One request, one round trip, every artist attached.\n\nThe shape you get back is a list of `{ created_at, artists: {...} }` objects — the favourite\'s timestamp plus the nested artist. Order by `created_at desc` so the most recently saved artist appears first, which is what a favourites list should do. Because the embed uses the foreign key, you do not write a join condition; PostgREST infers it from the `artist_id references artists(id)` relationship you declared in the schema.\n\nThen comes the payoff of every disciplined decision earlier in the course: you render the **same `ArtistCard`** you use on the home grid and the browse grid. The card takes an artist object as a prop and never fetches anything itself, so it does not care that this artist arrived via an embedded join on `favorites` rather than a direct query on `artists`. A component that takes props and never fetches is a component you can drop into any page — this page is where that discipline pays for itself. You write the favourites page in an afternoon because the hard part, the card, already exists.',
          whyItMatters:
            'N+1 is one of the most asked-about performance problems, and the embedded join is the concrete Supabase answer. "I fetched favourites with `select(\'created_at, artists(*)\')` so it is one query, not one per artist" is a precise, correct response, and reusing the same prop-driven `ArtistCard` demonstrates why component discipline compounds.',
          steps: [
            'Register `/favourites` inside the `ProtectedRoute` wrapper so anonymous hits redirect to sign-in.',
            'Write `listFavoriteArtists()` in the service using `select(\'created_at, artists(*)\')` on the `favorites` table.',
            'Order by `created_at` descending so the newest save is first.',
            'Return the raw rows `[{ created_at, artists }]` from the service and let the page decide how to render them.',
            'In a hook `useFavoriteArtists`, wrap the call in the standard `{ data, loading, error }` shape with a `refetch`.',
            'Map each row to `<ArtistCard artist={row.artists} />` — the same card used on every other grid.',
          ],
          code: `import { supabase } from '../supabase/client';

// One query, not N+1. The embed follows favorites.artist_id -> artists.id
// and staples the whole artist row onto each favourite.
export async function listFavoriteArtists() {
  const { data, error } = await supabase
    .from('favorites')
    .select('created_at, artists(*)')        // embedded join via the FK
    .order('created_at', { ascending: false }); // newest saved first

  if (error) throw new Error('Could not load favourites: ' + error.message);
  return data;   // [{ created_at, artists: {...} | null }, ...]
}

// The page renders the SAME ArtistCard used on home and browse.
// The card takes a prop and never fetches, so it does not care where
// the artist came from. That is the payoff of prop-driven components.
function FavouritesGrid({ rows }) {
  return (
    <div className="grid">
      {rows.map((row) => (
        <ArtistCard key={row.artists.id} artist={row.artists} />
      ))}
    </div>
  );
}`,
          pitfalls: [
            '**Fetching favourite ids, then looping to fetch each artist.** That is N+1 — one query becomes dozens on a well-stocked favourites list. Fix: one embedded `select(\'created_at, artists(*)\')`.',
            '**Leaving `/favourites` unprotected.** An anonymous visitor sees an error or an empty page instead of a sign-in prompt. Fix: wrap it in `ProtectedRoute` like `/dashboard`.',
            '**Ordering by the artist\'s `created_at` instead of the favourite\'s.** Then the list is sorted by when each artist joined, not when you saved them. Fix: `order(\'created_at\')` on the `favorites` row, which is what the embed selects.',
            '**Building a new bespoke card for this page.** Now a design change means editing two cards. Fix: reuse `ArtistCard`; it takes an artist prop and does not know or care which page it is on.',
          ],
          tryIt:
            'Write the one-line difference between the N+1 version and the embedded-join version of this page, in terms of round trips for a user with 12 favourites. (N+1: 1 + 12 = 13 requests. Embedded join: 1 request. On a 4G connection that is roughly 400ms versus 5 seconds.)',
          takeaway:
            '`/favourites` is a protected route that fetches saved artists in one embedded join — `select(\'created_at, artists(*)\')` ordered newest-first — and renders the same prop-driven `ArtistCard` used everywhere else.',
        },
        {
          id: 'm11-t10',
          title: 'Three states, and the null-artist subtlety',
          explain:
            'The favourites page ships loading, empty, and error states like every list — plus one subtlety: an artist you saved may later unpublish, so RLS returns `{ created_at, artists: null }`, and you must filter those null artists out.',
          analogy:
            'You wrote down the names of five stalls at the santhe you wanted to revisit. Next week two of them did not open. Your list still has five lines, but two point at empty spaces. A good list quietly shows you the three that are open and mentions "2 saved stalls are not here today" — it does not crash trying to read the signboard of a stall that is not there.',
          theory:
            'Every list in KalaKaara ships four states in order: **loading, empty, error, then data.** The favourites page is no exception. **Loading** shows skeleton cards while the query runs. **Error** shows a friendly message with a retry button wired to the hook\'s `refetch`. **Empty** — and this one matters — must actually help: not a bare "No favourites", but "You have not saved any artists yet" *and* a button that takes them to Browse. An empty state is a chance to move the user forward, not an apology.\n\nThen the subtlety that trips up every beginner. You favourited Rukmini last month. This week she unpublished her profile (`is_published` went to false, or she deleted it). The RLS policy on the `artists` table only returns **published** artists to a public embed. So your embedded join `select(\'created_at, artists(*)\')` still returns the favourite *row* — because you own it and can read it — but the embedded `artists` comes back as **`null`**, because RLS filtered out the artist. You get `{ created_at: \'...\', artists: null }`: a favourite row with a hole where the artist should be.\n\nBeginners crash here, and predictably. They map straight to `<ArtistCard artist={row.artists} />`, the card reads `artist.display_name`, `null.display_name` throws, and the whole page white-screens because one saved artist unpublished. The fix has two parts. First, **filter out the null artists** before rendering: `rows.filter((r) => r.artists !== null)`. Second — and this is the difference between "does not crash" and "is thoughtful" — count how many you dropped and tell the user: "1 saved artist is no longer available". They saved it for a reason; silently vanishing it is confusing, and a small note explains where it went.\n\nThere is a nice interaction with the empty state here: if a user saved three artists and *all three* later unpublished, the filtered list is empty, so you fall through to the empty state — but you might prefer to show "3 saved artists are no longer available" rather than the generic "you have not saved any artists yet", because those are two different situations. Handling that gracefully is what separates a robust page from a happy-path demo.',
          diagram: `graph TD
    Q[select created_at, artists&#40;*&#41;<br/>from favorites] --> J{for each favourite row}
    J -->|artist still published| OK[artists is present<br/>render ArtistCard]
    J -->|artist unpublished / deleted| RLS[RLS on artists hides the row]
    RLS --> NUL[row returns as<br/>created_at set, artists = null]
    NUL --> FIL[filter out the null artists<br/>BEFORE rendering]
    FIL --> MSG[show '1 saved artist is<br/>no longer available']
    OK --> GRID[grid of live ArtistCards]
    style NUL fill:#fecaca
    style MSG fill:#fde68a`,
          flowExplain:
            'The red node is the trap: a favourite row survives but its embedded artist is null. Filtering before render is what stops `null.display_name` from white-screening the page, and the amber node turns the dropped rows into a helpful message instead of a silent disappearance.',
          whyItMatters:
            'The null-embedded-row case is a real production bug that a happy-path developer never sees until a user reports a blank page. Knowing that RLS on the joined table produces a null embed — and handling it by filtering plus a count message — is exactly the defensive, user-aware thinking that distinguishes shipped software from a tutorial.',
          steps: [
            'Write the four states in order: loading skeletons, error with retry, empty with a Browse button, then data.',
            'After the data arrives, split it: `live = rows.filter((r) => r.artists !== null)` and `hiddenCount = rows.length - live.length`.',
            'Render the grid from `live` only, so no `ArtistCard` ever receives a null artist.',
            'If `hiddenCount > 0`, show a small notice: "N saved artist(s) are no longer available".',
            'Handle the all-unpublished case: if `live` is empty but `rows` was not, show the "no longer available" message rather than the generic empty state.',
            'Make the empty-state button navigate to `/artists`, turning a dead end into a next step.',
          ],
          code: `function FavouritesPage() {
  const { data, loading, error, refetch } = useFavoriteArtists();

  if (loading) return <ArtistGridSkeleton count={6} />;      // 1. loading
  if (error)   return <ErrorState onRetry={refetch} />;      // 2. error

  const rows = data ?? [];
  // An unpublished artist is filtered out by RLS on the artists table,
  // so its embed comes back null. Drop those BEFORE rendering.
  const live = rows.filter((row) => row.artists !== null);
  const hiddenCount = rows.length - live.length;

  if (live.length === 0) {                                    // 3. empty
    return (
      <EmptyState
        title="You have not saved any artists yet"
        note={hiddenCount > 0
          ? hiddenCount + ' saved artist(s) are no longer available'
          : undefined}
        action={<Link to="/artists">Browse artists</Link>}
      />
    );
  }

  return (                                                    // 4. data
    <>
      {hiddenCount > 0 && (
        <p className="notice">
          {hiddenCount} saved artist(s) are no longer available
        </p>
      )}
      <div className="grid">
        {live.map((row) => (
          <ArtistCard key={row.artists.id} artist={row.artists} />
        ))}
      </div>
    </>
  );
}`,
          pitfalls: [
            '**Mapping rows straight to `ArtistCard` without filtering.** One unpublished artist gives a null embed, `null.display_name` throws, and the whole page white-screens. Fix: `rows.filter((r) => r.artists !== null)` before rendering.',
            '**Filtering the nulls but never telling the user.** A saved artist silently vanishes and the user wonders if the app lost it. Fix: count the dropped rows and show "N saved artist(s) are no longer available".',
            '**Showing the generic empty state when every saved artist unpublished.** "You have not saved any artists yet" is factually wrong — they did, the artists just left. Fix: detect `live.length === 0 && rows.length > 0` and show the not-available message instead.',
            '**Skipping the loading and error states because "favourites load fast".** On a paused free-tier project or a bad connection they do not, and the user sees a flash of empty or a crash. Fix: skeleton, error, empty, data — in that order, always.',
            '**Assuming a deleted artist behaves differently from an unpublished one.** Both produce a null embed (delete via the cascade removes the favourite too; unpublish leaves the favourite with a null artist). Fix: handle null uniformly; do not special-case.',
          ],
          tryIt:
            'A user saved 4 artists; 1 later unpublished. Write down what the page should render. (A notice "1 saved artist is no longer available" above a grid of the 3 live `ArtistCard`s — never a crash, never a silent drop to 3 with no explanation.) Now: all 4 unpublished — what changes? (The empty state, but with the not-available note, not the generic copy.)',
          takeaway:
            'Ship loading, empty, and error states — and handle the null embedded artist: RLS on `artists` returns `{ created_at, artists: null }` for an unpublished favourite, so filter the nulls out before rendering and tell the user how many are no longer available.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm11-p1',
      type: 'Mini Project',
      title: 'Favourites With Optimistic Hearts',
      domain: 'State Management & Optimistic UI',
      duration: '2 hours',
      description:
        'Build the complete favourites feature: a join table whose composite primary key makes duplicates impossible, three RLS policies plus a deliberately absent update policy, a memoised FavoritesContext holding a Set, a useFavorite hook with snapshot-based rollback, a heart on every ArtistCard, the auth-gated favourite-then-sign-in-then-already-saved flow, and a /favourites page that survives an artist unpublishing under it.',
      tools: ['React', 'Supabase', 'PostgreSQL', 'RLS', 'React Context', 'React Router'],
      blueprint: {
        overview:
          'By the end, favouriting an artist feels instant, works across the auth gate, and is defended by the database rather than the UI. The acceptance test proves the source of truth is Postgres, not React state: favourite an artist in one browser tab, refresh a second tab, and the heart is filled there too — because both tabs read the same rows through the same RLS.',
        functionalRequirements: [
          '**Composite-PK table.** A `favorites` table with `user_id`, `artist_id`, `created_at`, `primary key (user_id, artist_id)`, both FKs `on delete cascade`, and a `default auth.uid()` on `user_id`. No surrogate id.',
          '**Three RLS policies plus one absence.** Select, insert, and delete policies all `to authenticated` and scoped with `user_id = auth.uid()`, and NO update policy, with a SQL comment stating the omission is deliberate.',
          '**Idempotent add.** `addFavorite` catches error code `23505` and treats it as success; every other error throws.',
          '**Memoised FavoritesContext.** A Set of favourite artist ids loaded once on sign-in, cleared on sign-out, with a `useMemo`d value so consumers do not re-render on unrelated changes.',
          '**useFavorite hook with rollback.** Returns `{ isFavorite, toggle, pending }`; toggle snapshots the Set, applies optimistically, awaits the service, restores the snapshot on failure, and guards against a double-toggle while pending.',
          '**Heart on every ArtistCard.** The same card on home, browse, and favourites shows a filled or outline heart from the context Set with no per-card query.',
          '**Auth-gated favourite.** A logged-out tap reuses `useAuthGate` with `{ type: \'favorite\', artistId }`, signs in with Google, and replays the intent so the artist is already saved at the same scroll position.',
          '**/favourites page.** A protected route fetching `select(\'created_at, artists(*)\')` newest-first, rendering the shared ArtistCard, and filtering out null artists with a "N no longer available" notice.',
        ],
        technicalImplementation: [
          '**Migration.** One SQL migration creates the table, enables RLS, adds the three policies with a comment where update would be, and sets the `auth.uid()` default. Keep it in version control.',
          '**favoriteService.js.** `listFavorites`, `addFavorite` (with the 23505 guard), `removeFavorite`, and `listFavoriteArtists` (the embedded join). Only this folder imports the Supabase client; each function returns data or throws.',
          '**FavoritesContext.jsx.** Lazy `useState(() => new Set())`, a `useEffect` keyed on the session user that loads and clears, `useCallback` on the setter, `useMemo` on the value, and a `useFavorites` hook that throws outside the provider.',
          '**useFavorite.js.** Derives `isFavorite` from the context Set (no shadow state), tracks `pending`, and implements snapshot -> optimistic setIds -> await -> restore-on-catch -> clear-in-finally.',
          '**Auth-gate reuse.** Extend the contact module\'s `useAuthGate` with a `favorite` case in its intent `switch`; persist intent and scroll to `sessionStorage`; add the id to the context Set on replay.',
          '**FavouritesPage.jsx.** Standard loading/error/empty/data order, `rows.filter((r) => r.artists !== null)`, a `hiddenCount`, and the shared `ArtistCard`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'The table, the composite PK, and the RLS policies',
            outcome:
              'A committed SQL migration creating favorites with a composite primary key, three policies, a deliberately absent update policy, and a default auth.uid() on user_id.',
            prompt:
              'Write a Supabase SQL migration for a `favorites` feature. Create `public.favorites` with `user_id uuid not null references public.profiles(id) on delete cascade`, `artist_id uuid not null references public.artists(id) on delete cascade`, `created_at timestamptz not null default now()`, and `primary key (user_id, artist_id)` — no surrogate id, because the pair is the identity and this makes double-favouriting structurally impossible. Enable row level security. Add three policies, all `to authenticated`: a select policy `using (user_id = auth.uid())`, an insert policy `with check (user_id = auth.uid())`, and a delete policy `using (user_id = auth.uid())`. Do NOT add an update policy; instead add a SQL comment explaining that a favourite is immutable so the omission is deliberate and RLS denies by default. Finally, `alter column user_id set default auth.uid()` so the client never sends it. Explain in comments why the composite PK is preferred over a surrogate id plus a unique constraint here.',
          },
          {
            step: 2,
            label: 'favoriteService with the idempotent 23505 guard',
            outcome:
              'favoriteService.js exposing listFavorites, addFavorite, removeFavorite, and listFavoriteArtists, never sending user_id and treating 23505 as success.',
            prompt:
              'Create `src/services/favoriteService.js` as the only place importing the Supabase client for favourites. Export `listFavorites()` returning the current user\'s favourite artist ids mapped to camelCase (no `where user_id` clause — RLS scopes the rows). Export `addFavorite(artistId)` that inserts only `{ artist_id }` (never `user_id`, which the column default fills) and, if the error code is `23505`, returns silently because a duplicate favourite is idempotent success; any other error throws. Export `removeFavorite(artistId)` deleting by `artist_id` only, relying on the delete RLS policy. Export `listFavoriteArtists()` using `.select(\'created_at, artists(*)\').order(\'created_at\', { ascending: false })` — one embedded join, not N+1 — returning the raw `[{ created_at, artists }]` rows. Every function returns data or throws; none returns Supabase\'s `{ data, error }` shape.',
          },
          {
            step: 3,
            label: 'The memoised FavoritesContext',
            outcome:
              'FavoritesContext holding a Set loaded once on sign-in, cleared on sign-out, with a memoised value.',
            prompt:
              'Create `src/contexts/FavoritesContext.jsx`. Export a `FavoritesProvider` that reads the signed-in user from `useSession()` and holds favourite artist ids in `useState(() => new Set())` (lazy init). In a `useEffect` keyed on `user`: when there is no user, clear the Set to protect the next person on a shared machine; when there is a user, call `listFavorites()` and build a `new Set` of ids, with a `cancelled` guard against a race on unmount. Wrap the setter in `useCallback` and the context value `{ ids, setIds }` in `useMemo` so consumers do not re-render on unrelated changes. Export a `useFavorites()` hook that throws if used outside the provider. Explain in a comment why a Set (O(1) membership) beats an array here, since the only questions cards ask are has/add/remove.',
          },
          {
            step: 4,
            label: 'useFavorite with optimistic rollback, and the heart on ArtistCard',
            outcome:
              'useFavorite({ isFavorite, toggle, pending }) with snapshot rollback, wired to a heart button on the shared ArtistCard.',
            prompt:
              'Create `src/hooks/useFavorite.js` returning `{ isFavorite, toggle, pending }`. Derive `isFavorite` from the FavoritesContext Set (`ids.has(artistId)`) — do not keep a shadow copy in local state. In `toggle`: guard with `if (pending) return;`; snapshot the current Set with `new Set(ids)`; build an independent `next` Set adding or removing the id; call `setIds(next)` so the heart flips immediately (optimistic); await `addFavorite` or `removeFavorite`; on catch, `setIds(snapshot)` to roll back and rethrow so the caller can show a retry toast; clear `pending` in `finally`. Then add a heart button to the shared `ArtistCard` that uses this hook, sets `aria-pressed={isFavorite}` and `disabled={pending}`, and — when the user is signed OUT — calls `useAuthGate` with `{ type: \'favorite\', artistId }` instead of toggling directly. Explain why the snapshot, not "do the opposite", is the correct rollback.',
          },
          {
            step: 5,
            label: 'The auth-gated replay and the /favourites page with the null-artist case',
            outcome:
              'The favourite-then-sign-in-then-already-saved flow plus a protected /favourites page handling loading, error, empty, and the null embedded artist.',
            prompt:
              'Two parts. First, extend the contact module\'s `useAuthGate` so that on return from Google it reads the saved intent from `sessionStorage`, and for `intent.type === \'favorite\'` it calls `favoriteService.addFavorite(intent.artistId)`, adds the id to the FavoritesContext Set, and restores the saved scroll position — so a logged-out heart tap results in the artist being already favourited on return, never a second tap. Note that `addFavorite` swallowing 23505 keeps a double replay safe. Second, build `src/pages/FavouritesPage.jsx` as a protected route: render loading skeletons, then an error state with retry, then handle data by computing `live = rows.filter((r) => r.artists !== null)` and `hiddenCount = rows.length - live.length`. If `live` is empty, show an empty state titled "You have not saved any artists yet" with a Browse button (and, if `hiddenCount > 0`, note that N saved artists are no longer available). Otherwise render the shared `ArtistCard` for each live row, with a notice above the grid when `hiddenCount > 0`. Explain in a comment that the null artist arises because RLS on `artists` filters out an unpublished artist while the favourite row itself remains readable.',
          },
        ],
        deliverable:
          'A working favourites feature where hearts flip instantly and roll back on failure, a logged-out favourite survives Google sign-in and returns already saved, and the /favourites page never crashes when an artist unpublishes. Acceptance test: favourite an artist in one tab, refresh a second tab, and the heart is filled there too — proving Postgres, not React, is the source of truth.',
      },
    },
  ],
  quiz: [
    {
      id: 'm11-q1',
      q: 'Why does the favorites table use a composite primary key on (user_id, artist_id) instead of a surrogate id plus a unique constraint?',
      options: [
        'A surrogate id is faster to index than a composite key',
        'Supabase does not support unique constraints on join tables',
        'The pair IS the identity, it makes duplicates impossible and gives the exact index you query on, and nothing references a favourite by id — so a surrogate id would add a column and still need the same unique constraint on top',
        'Composite keys are required whenever a table has two foreign keys',
      ],
      answer: 2,
    },
    {
      id: 'm11-q2',
      q: 'A user double-taps the heart on a slow connection and two identical inserts fire. The second returns Postgres error code 23505. How should the service treat it?',
      options: [
        'As success — a duplicate favourite is idempotent (the artist is already favourited), so catch 23505 and return silently with no error shown',
        'As a fatal error — show the raw "duplicate key" message so the user knows what happened',
        'By retrying the insert until it succeeds',
        'By deleting the existing favourite and inserting a fresh one',
      ],
      answer: 0,
    },
    {
      id: 'm11-q3',
      q: 'The favorites table has select, insert, and delete policies but deliberately no update policy. Why?',
      options: [
        'Update policies are not supported on tables with a composite primary key',
        'A favourite is immutable — none of its three columns is a thing a user should change — so you replace by delete+insert, and because RLS denies by default, writing no update policy IS the rule',
        'The update is handled by a database trigger instead of a policy',
        'An update policy was simply forgotten and should be added',
      ],
      answer: 1,
    },
    {
      id: 'm11-q4',
      q: 'Why does FavoritesContext hold the favourite artist ids in a Set rather than an array?',
      options: [
        'A Set automatically syncs itself with the database',
        'React contexts can only hold Set or Map values, not arrays',
        'An array preserves insertion order, which the favourites feature requires',
        'The only questions cards ask are membership, add, and remove — a Set answers has() in O(1), while an array makes includes() an O(n) scan on every card render',
      ],
      answer: 3,
    },
    {
      id: 'm11-q5',
      q: 'In the useFavorite hook, how should toggle roll back when the network request fails?',
      options: [
        'Restore the exact Set snapshot captured before the optimistic change, because "doing the opposite" is wrong whenever a concurrent change or a failed remove is involved',
        'Reload the entire page to re-fetch the true state from the server',
        'Invert the last action — if it was an add, do a remove',
        'Leave the optimistic state in place and let the next load correct it',
      ],
      answer: 0,
    },
    {
      id: 'm11-q6',
      q: 'On the /favourites page, an artist you saved has since unpublished. The embedded join select(\'created_at, artists(*)\') returns { created_at, artists: null }. What must the page do?',
      options: [
        'Show the raw null so the user can see something is wrong',
        'Delete the favourite row automatically as soon as it renders',
        'Filter out rows whose artists is null before rendering (so ArtistCard never reads null.display_name) and, better, show "N saved artist(s) are no longer available"',
        'Retry the query until the artist reappears',
      ],
      answer: 2,
    },
    {
      id: 'm11-q7',
      q: 'Why should addFavorite never send user_id from the client?',
      options: [
        'Because supabase-js strips the user_id field from every insert automatically',
        'Because the client is a program on a stranger\'s machine whose values can be forged — instead a column default of auth.uid() fills it, and the insert policy\'s with check (user_id = auth.uid()) rejects any forged value, so sending it is both unnecessary and pointless',
        'Because sending user_id would exceed the free-tier request size limit',
        'Because user_id is a computed column that cannot accept a value',
      ],
      answer: 1,
    },
  ],
}
