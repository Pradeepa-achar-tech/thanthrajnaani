// Module 12 — Reviews & Ratings
// KalaKaara (React + Supabase) course content for the React course player.

export const m12 = {
  id: 'm12',
  title: 'Reviews & Ratings',
  hours: 6,
  color: 'from-yellow-500/20 to-yellow-700/10',
  accent: 'yellow',
  description:
    'Reviews turn a directory into a marketplace people trust. In this module you build the reviews table with a CHECK constraint and a one-per-user rule, block self-reviews inside Postgres where they cannot be bypassed, ship an accessible radio-based star input, handle the three real errors of writing a review, keep a denormalised average rating in sync with a trigger, and sort by highest-rated using an honest Bayesian weighting rather than a naive average.',
  sections: [
    {
      id: 'm12-s1',
      title: 'The reviews table and its rules',
      topics: [
        {
          id: 'm12-t1',
          title: 'The reviews schema, the CHECK constraint, and one review per user',
          explain:
            'A review is a small row — a rating, an optional comment, who wrote it and about whom — but two of its constraints must live in the database, not in React.',
          analogy:
            'Think of the complaint-and-praise register at a Kundapura hotel front desk. The register has two printed rules at the top: give a score out of five, and one entry per guest per visit. If those rules lived only in the manager\'s head, a guest could scribble a score of nine, or fill three pages praising themselves. Printing the rules into the register — so the paper itself refuses the ninth star and the second entry — is what a CHECK constraint and a UNIQUE constraint do for your reviews table.',
          theory:
            'The table is deliberately small. A review belongs to one artist and one user, carries a `rating` between 1 and 5, an optional `comment`, and the usual timestamps.\n\n```sql\ncreate table reviews (\n  id uuid primary key default gen_random_uuid(),\n  artist_id uuid not null references artists(id) on delete cascade,\n  user_id uuid not null references auth.users(id) on delete cascade,\n  rating smallint not null check (rating between 1 and 5),\n  comment text,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now(),\n  unique (artist_id, user_id)\n);\n```\n\nThe **`check (rating between 1 and 5)`** is the important line. You will *also* validate the rating in React — a star input that only offers five stars cannot physically submit a six. So why duplicate the rule in Postgres? Because the React validation protects the *form*, and the database protects the *data*. Those are different jobs. A `curl` request with the anon key, a bug in a future refactor, a second client you write next year, a paste in the SQL editor — none of them go through your React form. The database is the **last line of defence**, and the last line has to hold even when every line in front of it has been walked around. A constraint is a promise Postgres keeps on every write from every source, forever. React validation is a courtesy it extends to one form.\n\nThe **`unique (artist_id, user_id)`** enforces one review per user per artist. Without it, a happy customer could leave forty five-star reviews and single-handedly inflate an artist\'s average. With it, the second insert for the same pair fails loudly with error code `23505` — and in topic 7 you will turn that "failure" into the feature that switches the UI into edit mode.\n\nNote `on delete cascade` on both foreign keys. If an artist deletes their profile, their reviews go with it — a review about a profile that no longer exists is noise. If a user deletes their account, their reviews go too. Cascade is the right call here precisely because a review has no meaning without both of its parents.\n\nOne thing the schema does **not** have: a `rating` default. A review with no rating is not a review. `not null` with no default forces every insert to state a score, and the CHECK forces that score to be sane.',
          diagram: `graph TD
    W[A write arrives at the reviews table] --> SRC{Where from?}
    SRC -->|React form| F[Star input caps at 5,<br/>form validates before submit]
    SRC -->|curl with anon key| C[No React anywhere in sight]
    SRC -->|SQL editor paste| E[No React anywhere in sight]
    SRC -->|next year's 2nd client| N[No React anywhere in sight]
    F --> DB[(Postgres CHECK<br/>rating between 1 and 5)]
    C --> DB
    E --> DB
    N --> DB
    DB -->|rating in range| OK[Row written]
    DB -->|rating out of range| REJ[Write rejected,<br/>no bad data stored]`,
          flowExplain:
            'Every arrow into the database passes through the same CHECK. React validates only the top-left path; the constraint validates all four. That is the entire argument for putting the rule in Postgres as well.',
          whyItMatters:
            'Interviewers probe exactly this: "you already validate in the UI, why also in the database?" The answer — that the UI protects one entry point and the constraint protects the data against every entry point, including ones that do not exist yet — separates people who think in forms from people who think in systems.',
          steps: [
            'Write the `reviews` table with `rating smallint not null` and no default — a review must state a score.',
            'Add `check (rating between 1 and 5)` so an out-of-range score is rejected by Postgres regardless of caller.',
            'Add `unique (artist_id, user_id)` so a user can review a given artist at most once.',
            'Set `on delete cascade` on both foreign keys — a review has no meaning if either parent is gone.',
            'Prove the constraint from the SQL editor: try to insert `rating = 9` and watch Postgres refuse it with a check-violation error.',
          ],
          code: `-- reviews: small table, two rules that MUST live in the database.
create table reviews (
  id         uuid primary key default gen_random_uuid(),
  artist_id  uuid not null references artists(id)     on delete cascade,
  user_id    uuid not null references auth.users(id)  on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- one review per user per artist. The second insert fails with 23505.
  unique (artist_id, user_id)
);

-- keep updated_at honest (the shared trigger from Module 3)
create trigger reviews_set_updated_at
  before update on reviews
  for each row execute function set_updated_at();

-- PROOF that React is not the guard. Run this in the SQL editor:
--   insert into reviews (artist_id, user_id, rating)
--   values ('...'::uuid, auth.uid(), 9);
-- ERROR:  new row for relation "reviews" violates check constraint
--         "reviews_rating_check"
-- The form never ran. The database still said no.`,
          pitfalls: [
            '**Validating the rating only in React.** The star widget cannot submit a six, so it feels airtight — until a `curl` request or a future second client writes `rating = 42` straight to PostgREST. Fix: the CHECK constraint is not a duplicate of the UI rule, it is the only rule that covers every caller.',
            '**Leaving out the UNIQUE constraint and "handling duplicates in code".** Two rapid taps, two tabs, or a retry after a timeout all produce a second row, and now the average is wrong. Fix: `unique (artist_id, user_id)` makes a duplicate physically impossible; the database enforces it atomically, no race window.',
            '**Giving `rating` a default of 0 or 5.** A default invites a review with no real score, and 0 is not even a legal star value. Fix: `not null` with no default forces every insert to state a rating, and the CHECK keeps it in 1..5.',
            '**Using `int` for the rating.** It works, but it advertises the wrong intent and wastes space at scale. Fix: `smallint` says "a small bounded number", and the CHECK says exactly how small and how bounded.',
          ],
          tryIt:
            'From the SQL editor, insert a review with `rating = 5` for an artist, then run the exact same insert again. The first succeeds; the second fails with `23505` on the unique constraint. You have just triggered, by hand, the error that topic 7 turns into edit mode.',
          takeaway:
            'Two rules belong to Postgres, not React: `check (rating between 1 and 5)` guards the data against every caller, and `unique (artist_id, user_id)` guarantees one review per user per artist.',
        },
        {
          id: 'm12-t2',
          title: 'The self-review problem: why a CHECK cannot solve it, and RLS can',
          explain:
            'An artist must not review their own profile, but a CHECK constraint cannot express that rule because it is not allowed to look at another table.',
          analogy:
            'At a santhe, a vegetable seller cannot walk to the front of their own stall and loudly declare "best tomatoes in the market" as if they were a customer. The rule is obvious to every human there — but notice it depends on knowing *who owns this stall*, which is information the price tag on the tomato does not carry. A CHECK constraint is that price tag: it can inspect the tomato in your hand, but it cannot know whose stall you are standing in.',
          theory:
            'The rule is simple to state: a user may not write a review whose `artist_id` points at an artist profile they own — because "artist owns the profile" is spelled `artists.user_id = auth.uid()`. The problem is *where* to enforce it.\n\n**A CHECK constraint cannot do it.** A CHECK may only reference columns of the row being written. The forbidden fact — "does this user own the artist being reviewed?" — lives in the *artists* table, and a CHECK is not permitted to run a subquery against another table. Postgres will let you write `check (user_id != some_column_on_this_row)` but never `check (user_id != (select user_id from artists where id = artist_id))`. The rule is fundamentally cross-table, and CHECK is fundamentally single-row.\n\nThere are three honest ways to enforce a cross-table rule on write:\n\n**1. A `before insert` trigger** that runs a subquery and `raise`s an exception if the user owns the artist. Correct, but it fires for every insert and puts business logic in PL/pgSQL, where it is easy to forget it exists.\n\n**2. An RLS `with check` clause containing a subquery.** RLS policies *are* allowed to run subqueries, because their whole job is to make authorisation decisions that depend on other tables. This is the natural home for the rule: it sits next to the other write rules for the table, it is visible in one place, and PostgREST enforces it on every insert without any code of yours running.\n\n**3. A denormalised column** — copy `artists.user_id` onto the review at insert time and CHECK against it. This works but duplicates a fact, which can drift, and it still needs *something* to populate the column correctly.\n\nWe use option 2. The insert policy carries a `with check` that both confirms the row belongs to the caller **and** forbids reviewing a profile the caller owns:\n\n```sql\nwith check (\n  user_id = auth.uid()\n  and artist_id not in (select id from artists where user_id = auth.uid())\n)\n```\n\nRead the second line slowly. `select id from artists where user_id = auth.uid()` is "the set of artist profiles I own" — usually zero or one row. `artist_id not in (...)` says the review\'s target must not be in that set. A buyer owns no artist rows, so the subquery is empty and the clause is always satisfied. An artist trying to review themselves *is* in that set, and the insert is rejected by Postgres — not by React, not by a courtesy check, by the database itself. That is the layer the rule belongs in, because authorisation that depends on ownership is exactly what RLS exists to express.',
          diagram: `graph TD
    I[insert into reviews<br/>artist_id = X] --> P{RLS with check runs}
    P --> A[user_id = auth.uid?]
    P --> B["artist_id NOT IN<br/>(select id from artists<br/>where user_id = auth.uid)"]
    A -->|yes| A2[clause 1 passes]
    A -->|no, spoofed user_id| REJ[Rejected]
    B -->|X is not one of<br/>my artist profiles| B2[clause 2 passes]
    B -->|X IS my own profile| REJ
    A2 --> OK[Insert allowed]
    B2 --> OK
    REJ[Postgres rejects the write,<br/>not React]`,
          flowExplain:
            'The subquery in clause 2 is the part a CHECK constraint can never contain — it reads the artists table. That single subquery, living inside RLS, is what makes self-review impossible at the database layer.',
          whyItMatters:
            'This is a favourite interview scenario: "stop a user from reviewing their own listing." Candidates reach for a CHECK, discover it cannot see the other table, and stall. Knowing that cross-table write rules belong in a trigger or an RLS `with check` — and being able to say why — is a senior-level distinction.',
          steps: [
            'State the rule precisely: reject any review whose `artist_id` belongs to a profile where `artists.user_id = auth.uid()`.',
            'Confirm why CHECK is out: a CHECK may only reference the current row, and the ownership fact lives in the `artists` table.',
            'List the three cross-table options — before-insert trigger, RLS `with check` subquery, denormalised column — and pick the RLS subquery as the clearest home.',
            'Write the `with check` with both halves: `user_id = auth.uid()` and the `not in (select id from artists where user_id = auth.uid())` subquery.',
            'Test it as an artist: try to insert a review for your own profile and confirm Postgres refuses it.',
          ],
          code: `-- WHY THIS DOES NOT WORK: a CHECK cannot read another table.
-- alter table reviews add check (
--   artist_id not in (select id from artists where user_id = auth.uid())
-- );
-- ERROR: cannot use subquery in check constraint

-- THE RIGHT LAYER: RLS with check, which MAY run subqueries.
create policy "insert own review, never self-review"
  on reviews for insert
  to authenticated
  with check (
    user_id = auth.uid()                       -- the row is mine
    and artist_id not in (                      -- and it is not MY profile
      select id from artists where user_id = auth.uid()
    )
  );

-- A buyer owns no artist rows -> subquery empty -> always allowed.
-- An artist reviewing themselves IS in that set -> rejected by Postgres.

-- (Alternative you could have chosen instead of the subquery:)
-- create function forbid_self_review() returns trigger as $$
-- begin
--   if exists (select 1 from artists
--              where id = new.artist_id and user_id = new.user_id) then
--     raise exception 'You cannot review your own artist profile';
--   end if;
--   return new;
-- end $$ language plpgsql;
-- create trigger no_self_review before insert on reviews
--   for each row execute function forbid_self_review();`,
          pitfalls: [
            '**Trying to write the rule as a CHECK constraint.** Postgres refuses it outright with "cannot use subquery in check constraint", because the ownership fact lives in another table. Fix: cross-table write rules go in a trigger or an RLS `with check`, never a CHECK.',
            '**Enforcing self-review only in React by hiding the review button on your own profile.** Hiding a button hides nothing — a direct PostgREST call ignores your JSX entirely. Fix: the button-hiding is UX; the RLS subquery is the actual guard, and only the second one is real.',
            '**Writing `with check (user_id = auth.uid())` and forgetting the second clause.** Now an artist can review their own profile, because clause one is satisfied by their own id. Fix: both halves are required — one proves ownership of the review, the other forbids the self-target.',
            '**Using `!=` against a single subquery value.** `artist_id != (select id from artists where user_id = auth.uid())` breaks the moment a user owns zero or two artist rows — a scalar subquery returns null or errors. Fix: `not in (select ...)` handles empty and multi-row sets correctly.',
          ],
          tryIt:
            'Sign in as an artist who owns a profile. From the browser console, call `supabase.from(\'reviews\').insert({ artist_id: YOUR_OWN_ID, user_id: yourUid, rating: 5 })`. It fails at the database with a row-level-security violation — no React ran. Now try it against a *different* artist and it succeeds. The rule lives in Postgres, exactly where you cannot walk around it.',
          takeaway:
            'A CHECK cannot reference another table, so self-review is stopped in an RLS `with check` subquery — `artist_id not in (select id from artists where user_id = auth.uid())` — the layer built for cross-table authorisation.',
        },
        {
          id: 'm12-t3',
          title: 'The full RLS policy set — and why the artist cannot delete a bad review',
          explain:
            'Four policies: reviews are public to read, only signed-in users may write them, and only the author may edit or delete their own — the artist being reviewed has no power over them at all.',
          analogy:
            'A temple\'s suggestion box is bolted shut and public: anyone can read the slips through the glass, but only the person who wrote a slip can reach in and change it. Crucially, the archaka whose seva was criticised cannot open the box and remove the unflattering slip. That would defeat the entire purpose of a suggestion box, and everyone would know the praise inside it was curated. Your reviews table works the same way, and for the same reason.',
          theory:
            'Reviews are the one table in KalaKaara where the whole point is that they are **public**. A review nobody can read protects nobody. So the SELECT policy is generous:\n\n```sql\ncreate policy "reviews are public"\n  on reviews for select\n  to anon, authenticated\n  using (true);\n```\n\nBoth `anon` and `authenticated` are named explicitly, and `using (true)` means every row is readable. This is deliberate and correct: an anonymous buyer deciding whether to trust an artist must be able to read the reviews without signing in.\n\nWrites are gated. The INSERT policy is the one from topic 2 — `to authenticated`, with the two-clause `with check` that proves ownership and forbids self-review. An anonymous visitor cannot reach it at all.\n\nUPDATE and DELETE are **author-only**:\n\n```sql\ncreate policy "author edits own review"\n  on reviews for update\n  to authenticated\n  using (user_id = auth.uid())\n  with check (user_id = auth.uid());\n\ncreate policy "author deletes own review"\n  on reviews for delete\n  to authenticated\n  using (user_id = auth.uid());\n```\n\nThe `using` clause decides which existing rows the caller may target; on UPDATE the `with check` also confirms the row still belongs to them afterwards, so nobody can reassign a review to another user. The author can fix a typo, raise or lower their score, or delete their review entirely.\n\nNow the decision that matters. **The artist being reviewed is granted no policy over reviews about them.** There is no "artist can delete a 1-star review" clause, and there is not going to be one. If an artist could delete reviews they dislike, every average on the site would be a lie, and buyers would learn to distrust all of them. The value of a review system is exactly its incorruptibility by the reviewed party. So the answer to "can the artist remove a bad review?" is a flat no, enforced by the *absence* of a policy.\n\nBe honest that this is a **product decision with real consequences**. A furious artist will email you about a review they consider unfair. A genuinely defamatory or spam review has no removal path in this MVP. You are choosing trust in the aggregate over relief for the individual — and you should be able to defend that choice, and name the escape valve you would build later: a *report* flow that flags a review for a human, plus an artist *reply* feature so they can respond in public rather than erase. Neither exists in the MVP; both are the mature answer to the email. What you never do is quietly hand the artist a delete button.',
          diagram: `graph TD
    R[(reviews table<br/>RLS enabled)] --> SEL[SELECT: to anon + authenticated<br/>using true]
    R --> INS[INSERT: to authenticated<br/>with check: own + not self]
    R --> UPD[UPDATE: to authenticated<br/>using user_id = auth.uid]
    R --> DEL[DELETE: to authenticated<br/>using user_id = auth.uid]
    SEL --> P1[Anyone reads every review]
    INS --> P2[Signed-in users write,<br/>never on their own profile]
    UPD --> P3[Only the author edits]
    DEL --> P4[Only the author deletes]
    ART[The reviewed artist] -.->|no policy grants this| X[Cannot touch<br/>reviews about them]`,
          flowExplain:
            'The dotted line is the important one: there is deliberately no policy connecting the reviewed artist to write access on reviews about them. The protection is the absence of a grant, not the presence of a block.',
          whyItMatters:
            'Product-sense questions like "should a seller be able to delete a buyer\'s review?" separate engineers who only implement from engineers who reason about consequences. The correct answer — no, with a report-and-reply flow as the mature alternative — shows you understand that a review system\'s value is its resistance to the reviewed party.',
          steps: [
            'Write the SELECT policy as `to anon, authenticated using (true)` — reviews are public by design.',
            'Reuse the topic-2 INSERT policy with its two-clause `with check`.',
            'Add author-only UPDATE with both `using (user_id = auth.uid())` and a matching `with check`.',
            'Add author-only DELETE with `using (user_id = auth.uid())`.',
            'Write NO policy that lets the reviewed artist modify or delete reviews about them, and note in your README why: incorruptibility is the feature.',
            'Sketch the future escape valve — a report flow plus an artist public reply — so you have an answer ready when the angry email arrives.',
          ],
          code: `alter table reviews enable row level security;

-- 1. PUBLIC READ. The entire point of reviews is that anyone can read them.
create policy "reviews are public"
  on reviews for select
  to anon, authenticated
  using (true);

-- 2. INSERT: signed-in only, own row, never your own profile (topic 2).
create policy "insert own review, never self-review"
  on reviews for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and artist_id not in (select id from artists where user_id = auth.uid())
  );

-- 3. UPDATE: author only. using = which rows; with check = what it may become.
create policy "author edits own review"
  on reviews for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 4. DELETE: author only.
create policy "author deletes own review"
  on reviews for delete
  to authenticated
  using (user_id = auth.uid());

-- NOTE the policy that is deliberately absent: nowhere can the reviewed
-- artist update or delete a review about themselves. That absence is the
-- feature. The mature alternative (later) is a report flow + a public
-- artist reply, never a delete button handed to the reviewed party.`,
          pitfalls: [
            '**Restricting SELECT to `authenticated`.** Then a logged-out buyer sees zero reviews and cannot judge an artist — which is the exact moment reviews are supposed to help. Fix: `to anon, authenticated using (true)`; reviews are public on purpose.',
            '**Adding an "artist can moderate their reviews" policy to keep artists happy.** It quietly lets every artist delete criticism, and the site\'s ratings become worthless. Fix: no such policy; build a report-and-reply flow later if moderation is truly needed.',
            '**Omitting `with check` on the UPDATE policy.** With only `using`, an author could edit their review and set `user_id` to someone else, orphaning or hijacking a row. Fix: include `with check (user_id = auth.uid())` so the row still belongs to them after the edit.',
            '**Forgetting to `enable row level security`.** A table with policies written but RLS not enabled is wide open — the policies are ignored. Fix: `alter table reviews enable row level security;` is the line that switches the whole set on.',
          ],
          tryIt:
            'Sign in as artist A. Try to `delete` a 1-star review that buyer B left on A\'s profile, via `supabase.from(\'reviews\').delete().eq(\'id\', reviewId)`. Nothing is deleted — the DELETE policy\'s `using (user_id = auth.uid())` matches zero rows for A. Write down, in one sentence, why this refusal is a feature and not a bug.',
          takeaway:
            'Reviews are public-read, author-write, author-edit, author-delete. The reviewed artist gets no policy at all — incorruptibility by the reviewed party is the entire value of the system, and that is a product decision you must be able to defend.',
        },
        {
          id: 'm12-t4',
          title: 'Indexes: the review list, and the lookup the unique constraint gives you free',
          explain:
            'One deliberate index powers the paginated review list; the second lookup you need comes free from the unique constraint you already created.',
          analogy:
            'A well-run seva counter keeps two registers. One is sorted by date so the archaka can read out "the ten most recent bookings" without flipping through the whole book — that is your deliberate index. The other, the register that guarantees no devotee books the same slot twice, happens to be sorted by name-and-slot, so looking up "did this devotee already book?" is instant. You did not build the second register for lookups; you built it to enforce uniqueness, and fast lookup fell out of it.',
          theory:
            'Two access patterns dominate the reviews table.\n\n**Pattern one: show an artist\'s reviews, newest first, paginated.** This runs on every artist detail page and looks like `where artist_id = :id order by created_at desc limit 10 offset ...`. Without an index, Postgres scans every review in the table, filters to the one artist, then sorts — fine at ten reviews, painful at fifty thousand. The right index is composite and ordered:\n\n```sql\ncreate index reviews_artist_recent\n  on reviews (artist_id, created_at desc);\n```\n\nThe leading `artist_id` lets Postgres jump straight to one artist\'s reviews; the trailing `created_at desc` means the rows are *already* in newest-first order inside that group, so the `order by` is free and pagination is a cheap range scan. Column order matters: `(created_at, artist_id)` would sort the whole table by date and be useless for filtering to one artist.\n\n**Pattern two: does this user already have a review for this artist?** You need this on page load to decide whether the button reads "Write a review" or "Edit your review" (topic 8), and PostgREST needs it internally to enforce the unique constraint on every insert. The query is `where artist_id = :id and user_id = :uid`. Here is the pleasant part: **you already have this index.** A UNIQUE constraint is backed by a unique index, so `unique (artist_id, user_id)` created a `(artist_id, user_id)` index automatically. The lookup you need for edit-mode detection is served for free by the constraint you added for correctness. Do not create a second index over the same columns — it would be redundant, waste space, and slow every write.\n\nThe lesson generalises: before adding an index, check whether a primary key or unique constraint already covers the columns. Constraints create indexes as a side effect, and duplicating them is a common, quiet form of bloat.',
          whyItMatters:
            'Knowing that a UNIQUE constraint creates a backing index — and therefore that adding a matching index by hand is pure waste — is the kind of detail that shows up in query-tuning interviews and in real slow-write incidents. Composite-index column ordering (filter column first, sort column second) is the other half of that same skill.',
          steps: [
            'Identify the two hot queries: the paginated newest-first list, and the "does this user already have a review here?" lookup.',
            'Create `reviews (artist_id, created_at desc)` so the list is a filtered range scan with the sort already done.',
            'Recognise that `unique (artist_id, user_id)` already built a `(artist_id, user_id)` index — the edit-mode lookup is free.',
            'Do NOT add a separate `(artist_id, user_id)` index; it would duplicate the unique index and slow writes.',
            'Confirm with `explain analyze` that the list query uses `reviews_artist_recent` and not a sequential scan.',
          ],
          code: `-- HOT QUERY 1: an artist's reviews, newest first, paginated.
--   select * from reviews
--   where artist_id = :id
--   order by created_at desc
--   limit 10 offset 0;
--
-- Composite index: filter column FIRST, sort column SECOND (descending).
create index reviews_artist_recent
  on reviews (artist_id, created_at desc);
-- artist_id narrows to one artist; created_at desc means the rows are
-- already ordered, so ORDER BY and LIMIT/OFFSET are a cheap range scan.

-- HOT QUERY 2: has this user already reviewed this artist?
--   select id from reviews
--   where artist_id = :id and user_id = :uid;
--
-- You do NOT write an index for this. It already exists:
--   unique (artist_id, user_id)   -->   creates a unique index on
--                                        (artist_id, user_id) automatically.
-- Adding your own duplicate here wastes space and slows every insert.

-- Verify the list uses the index, not a Seq Scan:
--   explain analyze
--   select * from reviews where artist_id = '...'
--   order by created_at desc limit 10;
-- Expect: Index Scan using reviews_artist_recent`,
          pitfalls: [
            '**Adding a manual `(artist_id, user_id)` index for the edit-mode lookup.** The unique constraint already created exactly that index; a second one is dead weight that slows every write. Fix: rely on the constraint\'s backing index and check `pg_indexes` before adding any index.',
            '**Getting composite column order backwards.** `(created_at, artist_id)` sorts the whole table by date and cannot efficiently filter to one artist. Fix: the equality-filtered column (`artist_id`) goes first, the ordered column (`created_at desc`) second.',
            '**Omitting `desc` in the index and relying on Postgres to reverse it.** Postgres *can* scan an ascending index backwards, so this often works — but on multi-column sorts the direction can matter. Fix: match the index order to the query\'s `order by ... desc` so intent is explicit and plans are stable.',
            '**Indexing `comment` or other columns "just in case".** Unused indexes cost write performance and storage for nothing. Fix: index the columns your actual queries filter and sort on; add more only when `explain analyze` on a real slow query asks for them.',
          ],
          tryIt:
            'Run `select indexname, indexdef from pg_indexes where tablename = \'reviews\';` after creating the table and the one index. You should see three: the primary key on `id`, the unique index on `(artist_id, user_id)`, and your `reviews_artist_recent`. Notice you only wrote one of them by hand.',
          takeaway:
            'Build one index — `(artist_id, created_at desc)` — for the paginated list. The `(artist_id, user_id)` lookup for edit-mode detection is already served by the unique constraint\'s backing index; do not duplicate it.',
        },
      ],
    },
    {
      id: 'm12-s2',
      title: 'Writing a review',
      topics: [
        {
          id: 'm12-t5',
          title: 'An accessible star-rating input built from radio buttons',
          explain:
            'A star rating that users can actually operate with a keyboard and a screen reader is five radio inputs styled as stars, not five clickable divs.',
          analogy:
            'Think of the five printed boxes on a temple donation form: "tick the amount you are giving." You tick exactly one box, the paper visibly shows which, and a person reading the form aloud can say "the fifty-rupee box is ticked." That is a radio group. Five hand-drawn stars with no boxes underneath might look nicer, but a blind devotee cannot fill the form and a clerk reading it aloud has nothing to announce. The native input is the box; the star is just paint on top of it.',
          theory:
            'Most star-rating widgets on the web are broken for anyone not using a mouse. Five `<div onClick>` stars cannot be reached by Tab, cannot be operated by the keyboard, announce nothing to a screen reader, and do not submit with the form. Rebuilding all of that with JavaScript is a large, bug-prone effort — and completely unnecessary, because the platform already ships a control with exactly the right semantics: a radio group.\n\nThe pattern is a `<fieldset>` with a `<legend>`, containing five `<input type="radio">` elements that share a `name`. Because they share a name, the browser gives you single-selection, arrow-key navigation, correct focus management, form submission, and screen-reader announcements — all for free, because it is the native control doing its job. You then **visually replace** each radio with a star using CSS: hide the actual input (accessibly, not with `display:none`, which would remove it from the tab order), and style the adjacent `<label>` as a star that fills in when its input is checked.\n\nThe fill-on-hover and fill-on-focus previews come from CSS sibling selectors and a clever ordering trick. If you lay the stars out in reverse DOM order (5 down to 1) and float them, then `:hover` and `:checked` combined with the general-sibling combinator (`~`) can light up the hovered star and every star before it. Modern CSS also lets you do it left-to-right with `:has()`, but the reverse-order technique works everywhere and is worth knowing.\n\nThe accessibility payoff is concrete: Tab moves focus to the group, arrow keys change the rating, the current value is announced ("3 stars, radio button, 3 of 5"), and the value submits with the form exactly like any other field. You wrote CSS, not a keyboard-event state machine. That is the whole argument — the accessible version is *less* code, not more, because you let the native control carry the behaviour.',
          whyItMatters:
            'Accessible form controls are a standard interview and code-review topic, and star ratings are the canonical example of a control usually built wrong. Demonstrating the radio-group approach — native semantics, CSS for looks — signals that you reach for the platform before reaching for JavaScript.',
          steps: [
            'Wrap the control in a `<fieldset>` with a `<legend>` naming what is being rated.',
            'Render five `<input type="radio">` with a shared `name`, each paired with a `<label>` you will style as a star.',
            'Hide the radios accessibly (clip them, do not `display:none`) so they keep focus and tab order.',
            'Style the labels as stars; use `:checked ~` and `:hover ~` sibling selectors (reverse-ordered) for the fill and hover preview.',
            'Test with the keyboard only — Tab to the group, arrow keys to choose — and with a screen reader to confirm it announces the value.',
          ],
          code: `// components/StarRatingInput/StarRatingInput.jsx
import styles from './StarRatingInput.module.css';

// Reverse order (5..1) so the CSS ~ sibling fill works without :has().
const STARS = [5, 4, 3, 2, 1];

export function StarRatingInput({ value, onChange, name = 'rating' }) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>Your rating</legend>
      <div className={styles.stars}>
        {STARS.map((n) => (
          <label key={n} className={styles.star} title={\`\${n} star\${n > 1 ? 's' : ''}\`}>
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className={styles.input}   // visually hidden, still focusable
            />
            <span className={styles.glyph} aria-hidden="true">★</span>
            <span className={styles.srOnly}>{n} of 5</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* StarRatingInput.module.css
.stars { display: inline-flex; flex-direction: row-reverse; }
.input {                       /* hide the radio but KEEP it focusable */
  position: absolute; width: 1px; height: 1px;
  opacity: 0; clip: rect(0 0 0 0);
}
.glyph { font-size: 2rem; color: #d4d4d8; cursor: pointer; transition: color .1s; }
/* fill this star and every EARLIER one (row-reverse => visually to the left) */
.star:hover .glyph,
.star:hover ~ .star .glyph          { color: #f59e0b; }  /* hover preview  */
.input:checked ~ .glyph,
.star:has(.input:checked) ~ .star .glyph { color: #eab308; }  /* selected  */
.input:focus-visible ~ .glyph { outline: 2px solid #2563eb; border-radius: 4px; }
.srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
*/`,
          pitfalls: [
            '**Building the stars from `<div onClick>`.** They are unreachable by Tab, silent to screen readers, and never submit with the form — the control is invisible to a third of your users. Fix: five radio inputs in a fieldset; style them, do not replace them.',
            '**Hiding the radio with `display:none` or `visibility:hidden`.** That removes it from the tab order, so keyboard users can no longer focus or change the rating. Fix: clip it to a 1px box with `opacity:0` so it stays focusable but invisible.',
            '**Forgetting the `<legend>` / `<fieldset>`.** A screen reader then announces five stray radios with no idea what they rate. Fix: a fieldset with a legend gives the group an accessible name ("Your rating").',
            '**Removing the focus outline "because it looks messy".** Keyboard users lose all sense of where they are. Fix: style `:focus-visible` into a clear, on-brand outline instead of deleting it.',
            '**Relying only on colour to show the selected rating.** A colour-blind user cannot tell three filled stars from four. Fix: keep the visually-hidden "3 of 5" text and consider a small numeric label, so the value is conveyed non-visually too.',
          ],
          tryIt:
            'Unplug your mouse. Tab to the star input, use the arrow keys to set it to 4, and submit the form — all without touching the pointer. If you cannot, your stars are divs pretending to be inputs. The radio-group version passes this test with zero extra JavaScript.',
          takeaway:
            'A star input is a `<fieldset>` of five radios styled with CSS. The native control gives keyboard operation, focus, announcements, and form submission for free; you only paint the stars on top.',
        },
        {
          id: 'm12-t6',
          title: 'The review form: validation, the character counter, and the auth gate',
          explain:
            'The form needs a required rating, an optional comment capped at 1000 characters with a live counter, disable-while-pending, comment preservation on failure, and a login gate that replays the intent after sign-in.',
          analogy:
            'Filling in a bank challan: the amount is mandatory (the teller rejects a blank one), the remarks line is optional but has a fixed number of boxes so you cannot overflow it, and once you hand it over the window you cannot submit a second one until the first is processed. And if the teller sends you away to fetch a signature, you do not want to rewrite the whole challan when you come back — you want the one you already filled in, waiting.',
          theory:
            'The form has one required field and one optional field, and both need care.\n\n**Rating is required.** A submit with no rating selected is blocked before it reaches Supabase, with an inline message next to the stars. This is UX validation — the database CHECK from topic 1 is the real guard, but a good form never lets the user hit that error blind.\n\n**Comment is optional, capped at 1000 characters, with a live counter.** You show "240 / 1000" and update it on every keystroke. The cap is enforced with `maxLength` on the textarea *and* re-checked before submit (a paste can, in some browsers, exceed `maxLength`). The counter turns amber as the user approaches the limit, so running out of room is never a surprise.\n\n**Disable while pending.** The moment the user submits, the button is disabled and shows a spinner. This prevents the double-submit that would otherwise fire two inserts — the second of which fails on the unique constraint anyway, but you want to avoid the round trip and the flicker. Track a `submitting` boolean and gate the button on it.\n\n**Preserve the comment if the insert fails.** This is the detail that separates a form people trust from a form people rage-quit. On a network failure or an RLS rejection, you must **not** clear the textarea. The user wrote three paragraphs; losing them to a dropped connection is unforgivable. Keep the form state intact, show the error above the button, and let them press submit again with everything still typed.\n\n**The auth gate.** Writing a review is one of KalaKaara\'s five login-gated actions. An anonymous visitor who clicks "Write a review" must be sent through Google sign-in and returned to *this artist* with the form open — not dumped on the home page. You use the shared `useAuthGate()` hook (Module 10\'s contact-gate pattern) with an intent describing what they wanted: `{ type: \'review\', slug }`. On return, the intent is replayed, the review form reopens, and the comment they may have started typing is restored from the same preserved state.',
          whyItMatters:
            'Form resilience — disable-on-submit, preserve-on-failure, and a login gate that returns the user to where they were — is what interviewers mean by "attention to detail". Losing a user\'s typed text on an error is the kind of bug that never shows in a demo and always shows in production.',
          steps: [
            'Gate the whole form behind `useAuthGate()`; if the user is anonymous, save `{ type: \'review\', slug }` and redirect to sign-in.',
            'Make rating required with an inline error; treat the database CHECK as the backstop, not the primary message.',
            'Cap the comment at 1000 with `maxLength` plus a live "n / 1000" counter that warns as it fills.',
            'Set a `submitting` flag on submit and disable the button until the request settles.',
            'On failure, keep the form state untouched — never clear the comment — and surface the error above the button for an easy retry.',
          ],
          code: `// components/ReviewForm/ReviewForm.jsx
import { useState } from 'react';
import { StarRatingInput } from '../StarRatingInput/StarRatingInput';
import { useAuthGate } from '../../hooks/useAuthGate';
import { createReview } from '../../services/reviewService';

const MAX = 1000;

export function ReviewForm({ artistId, slug, onSaved }) {
  const gate = useAuthGate();                 // Module 10's intent-replay gate
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!gate.ensureSignedIn({ type: 'review', slug })) return; // redirects if anon
    if (rating < 1 || rating > 5) { setError('Please choose a rating.'); return; }
    if (comment.length > MAX)     { setError(\`Keep it under \${MAX} characters.\`); return; }

    setSubmitting(true);
    try {
      const saved = await createReview({ artistId, rating, comment: comment.trim() });
      onSaved(saved);                          // success: hand the review up
    } catch (err) {
      // CRITICAL: do NOT clear the form. Keep rating + comment for the retry.
      setError(err.message);
    } finally {
      setSubmitting(false);                    // re-enable either way
    }
  }

  const remaining = MAX - comment.length;
  return (
    <form onSubmit={handleSubmit} noValidate>
      <StarRatingInput value={rating} onChange={setRating} />
      <textarea
        value={comment}
        maxLength={MAX}
        placeholder="What was working with this artist like? (optional)"
        onChange={(e) => setComment(e.target.value)}
        disabled={submitting}
      />
      <div aria-live="polite" style={{ color: remaining < 100 ? '#b45309' : '#71717a' }}>
        {comment.length} / {MAX}
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Post review'}
      </button>
    </form>
  );
}`,
          pitfalls: [
            '**Clearing the form in a `finally` block or on error.** A dropped connection then wipes three paragraphs the user typed, and they leave. Fix: only reset the form on success; on failure keep every field exactly as it was.',
            '**Not disabling the submit button while the request is in flight.** An impatient double-tap fires two inserts; the second dies on the unique constraint but you have already caused a flicker and a wasted round trip. Fix: a `submitting` flag disables the button until the promise settles.',
            '**Sending an anonymous user to the home page after sign-in.** They wanted to review *this* artist and now have to find them again. Fix: `useAuthGate()` stores `{ type: \'review\', slug }` and replays it, returning them to the same profile with the form open.',
            '**Trusting `maxLength` alone to cap the comment.** Some browsers let a paste exceed it, and the database has no length limit. Fix: re-check `comment.length > MAX` before submit, and consider a `check (char_length(comment) <= 1000)` on the column.',
            '**Showing the counter without an `aria-live` region.** A screen-reader user gets no feedback as they approach the limit. Fix: wrap the "n / 1000" text in `aria-live="polite"` so the count is announced as it changes.',
          ],
          tryIt:
            'Type a long comment, then throttle your network to Offline in DevTools and submit. The insert fails — confirm your comment is still sitting in the textarea, the button is re-enabled, and the error is visible. Turn the network back on and submit again: one click, no retyping. If the box emptied, your `catch` is clearing state it should have left alone.',
          takeaway:
            'A trustworthy review form requires the rating, caps the comment with a live counter, disables on submit, and — above all — never clears the user\'s text on failure. The auth gate stores `{ type: \'review\', slug }` and returns the user to the same artist.',
        },
        {
          id: 'm12-t7',
          title: 'Insert, and the three real errors: 23505, self-review, and network failure',
          explain:
            'A review insert has three realistic failure modes, and each deserves a different, specific response — not one generic red banner.',
          analogy:
            'A seva counter clerk handles three kinds of "no" completely differently. "You already booked this seva" — she smiles and pulls up your existing booking to amend. "You cannot book a seva for your own family\'s counter" — a polite explanation of the rule. "The power just went out" — "please try again in a moment". Same word, "no", three different human responses. A form that answers all three with an identical scary red box is a clerk who barks "REJECTED" at everyone.',
          theory:
            'When you call `insert` on the reviews table, three things can realistically go wrong, and they map to three distinct error signatures.\n\n**1. `23505` — unique violation. You already reviewed this artist.** This is Postgres\'s SQLSTATE code for a duplicate key, raised by your `unique (artist_id, user_id)` constraint. It is emphatically **not an error to show the user**. It means they have an existing review, and the correct response is to **switch the UI into edit mode** — load their existing review into the form and change the button to "Update review". The user experiences no error at all; they experience the app remembering them. Detecting `error.code === \'23505\'` and pivoting to edit mode is the single most important branch in this topic.\n\n**2. The RLS `with check` violation — you tried to review your own profile.** This comes back as a row-level-security error (PostgREST maps it to HTTP 403 / Postgres code `42501`). Here you *do* show a message, but a friendly one: "You cannot review your own artist profile." The button-hiding in your UI should have prevented this, so reaching it means the user hit the API directly or something is off — but the message stays gentle, because the rule is legitimate and the user is not a criminal for bumping into it.\n\n**3. Network failure — the request never reached Postgres.** No SQLSTATE, just a fetch that timed out or a dropped connection. The response is "Something went wrong, please try again" with the form intact (topic 6) and a retry button. This is transient; nothing is wrong with the data or the rules.\n\nThe insert should also be **optimistic**: show the new review in the list immediately, before the server confirms, so the UI feels instant. If the insert then fails, **roll back** — remove the optimistic review from the list and restore the form. Optimistic UI with rollback is what makes the happy path feel fast without lying to the user when the unhappy path happens. The rollback is not optional; an optimistic update with no rollback shows reviews that were never saved.',
          diagram: `graph TD
    S[Optimistic insert:<br/>show review immediately] --> API[supabase.insert]
    API --> R{Result}
    R -->|success| C[Confirm — replace<br/>optimistic row with saved row]
    R -->|error.code 23505| E[NOT an error:<br/>load existing review,<br/>switch to EDIT MODE]
    R -->|RLS 42501 / 403| SELF[Friendly message:<br/>#quot;cannot review your<br/>own profile#quot;]
    R -->|network / timeout| NET[#quot;Try again#quot; + retry;<br/>form kept intact]
    E --> RB[roll back optimistic row]
    SELF --> RB
    NET --> RB`,
          flowExplain:
            'The three error branches are not interchangeable. `23505` is a silent pivot to edit mode; the RLS violation is a friendly explanation; the network error is a retry. Only the last two are shown as errors at all, and every failing branch rolls back the optimistic row.',
          whyItMatters:
            'Mapping database error codes to specific user experiences — especially treating `23505` as "switch to edit" rather than "show error" — is exactly the kind of real-world error handling that distinguishes a shipped product from a tutorial. Interviewers love the "you already reviewed this" case because the naive answer (show an error) is worse than useless.',
          steps: [
            'Insert optimistically: add the review to the list in local state before the server responds.',
            'On success, replace the optimistic row with the server row (which carries the real `id` and timestamps).',
            'Branch on `error.code`: `23505` loads the existing review and switches to edit mode with no error shown.',
            'Map the RLS violation (`42501` / 403) to a friendly "cannot review your own profile" message.',
            'Treat everything else as a transient network error: keep the form, show "try again", offer a retry.',
            'On any failure, roll back the optimistic row so the list never shows an unsaved review.',
          ],
          code: `// services/reviewService.js
import { supabase } from '../supabase/client';

export async function createReview({ artistId, rating, comment }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('reviews')
    .insert({ artist_id: artistId, user_id: user.id, rating, comment })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      // duplicate: caller should switch to edit mode, not show an error.
      const dup = new Error('You have already reviewed this artist.');
      dup.code = 'ALREADY_REVIEWED';
      throw dup;
    }
    if (error.code === '42501') {               // RLS with check violation
      throw new Error('You cannot review your own artist profile.');
    }
    throw new Error('Could not post your review. Please try again.');
  }
  return toReview(data);
}

// components/ReviewSection.jsx (the optimistic + rollback branch)
async function handleSaved(draft) {
  const optimistic = { id: 'temp', ...draft, pending: true };
  setReviews((r) => [optimistic, ...r]);        // show immediately
  try {
    const saved = await createReview(draft);
    setReviews((r) => r.map((x) => (x.id === 'temp' ? saved : x))); // confirm
  } catch (err) {
    setReviews((r) => r.filter((x) => x.id !== 'temp'));            // ROLL BACK
    if (err.code === 'ALREADY_REVIEWED') {
      const mine = await getMyReview(draft.artistId);
      enterEditMode(mine);                       // 23505 => edit, not error
    } else {
      setFormError(err.message);                 // self-review or network
    }
  }
}`,
          pitfalls: [
            '**Showing `23505` as a red error.** "Error: duplicate key value violates unique constraint" is meaningless to a user and hides the real situation — they have a review already. Fix: catch `error.code === \'23505\'`, load the existing review, and switch to edit mode with no error shown.',
            '**Doing an optimistic insert with no rollback.** A failed insert leaves a phantom review in the list that was never saved; a refresh makes it vanish and the user is confused. Fix: always remove the optimistic row in the `catch`, then handle the specific error.',
            '**Leaking the raw Postgres error message to the UI.** SQLSTATE codes and constraint names are noise to users and a small information leak. Fix: the service maps codes to human messages and throws those; components never render `error.message` straight from Supabase.',
            '**Treating the RLS self-review rejection as a bug to log loudly.** It is an expected outcome for someone hitting the API directly; a stack-trace alert is overkill. Fix: a calm inline "you cannot review your own profile" is the right response — the rule worked.',
            '**Assuming a timeout means the insert did not happen.** Occasionally the row was written but the response was lost, so a blind retry hits `23505`. Fix: that is fine — your `23505` branch already routes it to edit mode, so the retry resolves gracefully instead of erroring.',
          ],
          tryIt:
            'Insert a review, then insert an identical one again through your own form. Confirm the second attempt does not show an error banner but instead flips the form into "Update review" mode with your existing text loaded. That silent pivot on `23505` is the behaviour that makes the feature feel considerate.',
          takeaway:
            'Three errors, three responses: `23505` silently switches to edit mode, the RLS violation shows a friendly self-review message, and a network failure offers a retry. Insert optimistically, and roll back the optimistic row on every failure.',
        },
        {
          id: 'm12-t8',
          title: 'Detecting an existing review with useUserReview, and edit/delete',
          explain:
            'On page load you check whether the signed-in user already reviewed this artist, so the button reads "Edit your review" instead of "Write a review" — and edit and delete reuse the same author-only policies.',
          analogy:
            'When you walk back into the seva counter that already has your booking on file, the clerk does not hand you a blank form and ask you to book again. She recognises you, pulls your existing slip, and asks whether you want to change it. The app should do exactly that: recognise on arrival that you have already spoken, and offer to amend rather than to repeat.',
          theory:
            'The `23505` branch in topic 7 is a *reactive* discovery of an existing review — you find out only after trying to insert. That works, but it is nicer to know *before* the user writes anything. So on page load, for a signed-in user, you fetch their existing review (if any) with a dedicated hook.\n\n`useUserReview(artistId)` follows the standard `{ data, loading, error }` shape. It queries `reviews` for a row matching this artist and the current user — served instantly by the unique index from topic 4. If a row comes back, `data` is that review; if none, `data` is `null`. The component uses this to choose the button label: `data ? \'Edit your review\' : \'Write a review\'`. For an anonymous user the hook does not run at all — there is no `auth.uid()` to match — and the button reads "Write a review", which correctly triggers the auth gate on click.\n\n**Editing** reuses the same form, pre-filled with the existing rating and comment, and calls `update` instead of `insert`. The author-only UPDATE policy from topic 3 (`using (user_id = auth.uid())`) guarantees a user can only ever edit their own row, so no ownership check is needed in JavaScript — the database enforces it. On save, the denormalised average recomputes automatically via the trigger you build in topic 9, so an edited rating is reflected everywhere without any extra client work.\n\n**Deleting** calls `delete().eq(\'id\', reviewId)`; the author-only DELETE policy makes it a no-op for anyone but the author. After a successful delete, remove the review from the list optimistically and — again — the trigger fixes the average, including the case where this was the artist\'s last review and `rating_avg` must return to null.\n\nThe broader lesson: derive UI state from the data, not from a flag you maintain. "Has this user reviewed this artist?" is answered by a query, not by a boolean you try to keep in sync. One source of truth, checked on load, and the button always tells the truth.',
          diagram: `graph TD
    L[Artist page loads] --> A{Signed in?}
    A -->|no| W1[Button: #quot;Write a review#quot;<br/>-> click triggers auth gate]
    A -->|yes| H["useUserReview(artistId)<br/>query reviews for my row"]
    H --> D{Row found?}
    D -->|null| W2[Button: #quot;Write a review#quot;<br/>-> opens empty form]
    D -->|my review| E[Button: #quot;Edit your review#quot;<br/>-> opens form pre-filled]
    E --> EDIT["update() — author-only<br/>RLS enforces ownership"]
    E --> DEL["delete() — author-only"]
    EDIT --> T[trigger recomputes rating_avg]
    DEL --> T`,
          flowExplain:
            'The branch at "Row found?" is the whole feature: a query on load, not a maintained flag, decides whether the user sees "Write" or "Edit". The trigger keeps the average correct after either edit or delete.',
          whyItMatters:
            'Deriving UI state from a query rather than from a synced boolean is a recurring correctness principle — the same idea as "artist is a row you own, not a role column" from Module 0. Interviewers notice when you reach for the query instead of inventing a flag that can drift.',
          steps: [
            'Write `useUserReview(artistId)` returning `{ data, loading, error }`; `data` is the user\'s review or `null`.',
            'Skip the query entirely for anonymous users — there is no `auth.uid()` to match.',
            'Choose the button label from `data`: "Edit your review" when it exists, "Write a review" when it does not.',
            'Pre-fill the form from `data` for edits and call `update`; rely on the author-only policy for ownership, not a JS check.',
            'For delete, call `delete().eq(\'id\', ...)`, remove the row optimistically, and let the trigger fix the average — including the last-review-becomes-null case.',
          ],
          code: `// hooks/useUserReview.js — does the signed-in user already review this artist?
import { useState, useEffect } from 'react';
import { getMyReview } from '../services/reviewService';
import { useSession } from '../contexts/SessionContext';

export function useUserReview(artistId) {
  const { user } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) { setData(null); setLoading(false); return; }  // anon: no query
    let cancelled = false;
    setLoading(true);
    getMyReview(artistId)
      .then((r) => !cancelled && setData(r))       // r is the review or null
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [artistId, user]);

  return { data, loading, error };
}

// services/reviewService.js
export async function getMyReview(artistId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('artist_id', artistId)
    .eq('user_id', user.id)
    .maybeSingle();                 // 0 or 1 row -> null or the review
  if (error) throw new Error(error.message);
  return data ? toReview(data) : null;
}

// In the component:
// const { data: mine } = useUserReview(artistId);
// <button>{mine ? 'Edit your review' : 'Write a review'}</button>`,
          pitfalls: [
            '**Maintaining a `hasReviewed` boolean in state instead of querying.** It drifts the moment a review is deleted in another tab, and the button lies. Fix: `useUserReview` queries the truth on load; derive the label from `data`, never from a flag.',
            '**Running the lookup for anonymous users.** With no `auth.uid()` the query matches nothing and wastes a round trip on every page load. Fix: short-circuit when there is no signed-in user and just show "Write a review".',
            '**Adding a JavaScript ownership check before update or delete.** It duplicates the RLS policy and gives a false sense that the JS is the guard. Fix: trust the author-only `using (user_id = auth.uid())` policy — the database refuses other users\' rows regardless of your JS.',
            '**Using `.single()` for the lookup.** `single()` throws when there are zero rows, turning "no review yet" into an error. Fix: `maybeSingle()` returns `null` for zero rows and the review for one.',
            '**Forgetting that an edit changes the average.** If you update a rating but do not let the trigger run (e.g. by patching only client state), the displayed average goes stale. Fix: always go through the real `update`, and the topic-9 trigger recomputes `rating_avg` for you.',
          ],
          tryIt:
            'Review an artist, then reload their page. The button should now read "Edit your review" and clicking it should open the form already filled with your rating and comment — proof that `useUserReview` found your row on load. Delete the review and reload again; the button reverts to "Write a review" and, if it was the only review, the average disappears.',
          takeaway:
            'Query for the user\'s existing review on load with `useUserReview(artistId)` and derive the button label from the result. Edit and delete lean entirely on the author-only RLS policies, and the trigger keeps the average correct after both.',
        },
      ],
    },
    {
      id: 'm12-s3',
      title: 'Average rating, and the honest maths',
      topics: [
        {
          id: 'm12-t9',
          title: 'Two ways to compute the average, and the trigger that keeps it in sync',
          explain:
            'You can compute the average live with an aggregate query, or store it denormalised on the artist and maintain it with a trigger — and the denormalised version is what "sort by highest rated" needs.',
          analogy:
            'A temple can count its donation box in two ways. It can tip the whole box out and count every coin each time someone asks the total — always correct, but slow, and unbearable if a hundred people ask per minute. Or it can keep a running tally on a slate, adding each donation as it arrives and correcting the slate if someone takes a coin back. The slate can be read instantly and even sorted against other temples\' slates — but only if every single add, change, and removal updates it. The trigger is the discipline that never forgets to update the slate.',
          theory:
            'There are two honest ways to get an artist\'s average rating.\n\n**(a) Compute it live.** A `view`, or an aggregate query, `select avg(rating), count(*) from reviews where artist_id = :id`. This is **correct by construction** — it can never be stale, because it reads the reviews directly every time. The cost: on a browse page showing thirty artists, thirty averages means a join and an aggregate scan folded into the query, on every page load, forever. And you cannot cheaply `order by avg_rating` across all artists without computing every average first.\n\n**(b) Denormalise.** Add two columns to `artists` — `rating_avg numeric(2,1)` and `review_count int not null default 0` — and keep them current with a trigger that fires `after insert or update or delete on reviews`. Now every browse query reads `artists.rating_avg` directly: no join, no aggregate, and — crucially — you can put an index on `rating_avg` and `order by` it. **This is what "sort by highest rated" needs.** Sorting is the requirement that tips the decision: an aggregate you compute per-page cannot be sorted across the whole table without computing all of them, but a stored column can be indexed and ordered like any other.\n\nThe trade is the classic one. (a) is correct-by-construction but slow and unsortable; (b) is fast, sortable, and indexable but must be *maintained*, and maintenance is where bugs live. The trigger is what makes (b) trustworthy — it recomputes the two columns after every write to reviews, so they are never hand-updated and never drift.\n\nThe trigger has a subtle case that people get wrong: **the DELETE that removes the last review.** When `review_count` reaches zero, `rating_avg` must become **`null`, not `0.0`**. A new artist with no reviews has *no rating*, and null says exactly that. Zero would be a lie — worse, `0.0` sorts *below* a genuine 1-star artist, so "sort by highest rated" would rank an unrated newcomer beneath the worst-reviewed artist on the site. Null sorts out of the ranking entirely (with `nulls last`), which is correct: an artist with no reviews should not be ranked as if they scored zero. The trigger must detect the count hitting zero and set `rating_avg = null` explicitly.\n\nBecause the trigger recomputes from the reviews table on every event, it handles insert, update, and delete uniformly: it does not try to incrementally adjust a running sum (which is fragile across the UPDATE case where a rating changes from 5 to 2), it simply re-aggregates for the one affected artist. That is cheap — it touches only that artist\'s reviews — and it is impossible to get out of sync.',
          diagram: `graph TD
    INS[INSERT review] --> TR[Trigger fires:<br/>after insert/update/delete]
    UPD[UPDATE rating 5 -> 2] --> TR
    DEL[DELETE review] --> TR
    TR --> AGG["Re-aggregate for THIS artist:<br/>count(*) and avg(rating)<br/>from reviews"]
    AGG --> Z{count = 0?}
    Z -->|yes| NULLV["rating_avg = NULL<br/>review_count = 0"]
    Z -->|no| SETV["rating_avg = avg<br/>review_count = count"]
    NULLV --> A[(artists row updated)]
    SETV --> A
    A --> SORT[Browse can index +<br/>order by rating_avg]`,
          flowExplain:
            'All three events funnel into one re-aggregation for the affected artist. The `count = 0` branch setting `rating_avg = NULL` — not 0.0 — is the case that keeps unrated artists out of the ranking instead of below the 1-star ones.',
          whyItMatters:
            'Denormalisation-with-a-trigger is a core database design pattern, and the "null vs zero on empty" subtlety is a favourite interview trap. Being able to explain when you would store a computed value (you need to sort or index it) versus compute it live (correctness matters more than read speed) is exactly the trade-off judgement senior roles test for.',
          steps: [
            'Add `rating_avg numeric(2,1)` and `review_count int not null default 0` to the `artists` table.',
            'Write a trigger function that, for the affected artist, recomputes `count(*)` and `avg(rating)` from `reviews`.',
            'Handle the zero case explicitly: when `review_count` is 0, set `rating_avg = null`, never `0.0`.',
            'Attach the trigger `after insert or update or delete on reviews`, keying off `new`/`old` to find the affected `artist_id`.',
            'Index `rating_avg` (with `nulls last` in your sort) so "sort by highest rated" is a cheap ordered scan.',
          ],
          code: `alter table artists
  add column rating_avg   numeric(2,1),          -- NULL when no reviews
  add column review_count int not null default 0;

-- Recompute both columns for ONE artist from the reviews table.
create or replace function refresh_artist_rating(target uuid)
returns void language sql as $$
  update artists a set
    review_count = sub.n,
    -- when n = 0, avg(...) is NULL, and we WANT NULL, not 0.0
    rating_avg   = sub.avg
  from (
    select count(*)::int as n,
           round(avg(rating), 1) as avg          -- NULL if no rows
    from reviews where artist_id = target
  ) sub
  where a.id = target;
$$;

-- Trigger: after any change to reviews, refresh the affected artist(s).
create or replace function reviews_sync_rating()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'DELETE') then
    perform refresh_artist_rating(old.artist_id);
    return old;
  else
    perform refresh_artist_rating(new.artist_id);
    return new;
  end if;
end $$;

create trigger reviews_sync_rating_trg
  after insert or update or delete on reviews
  for each row execute function reviews_sync_rating();

-- sort-by-highest-rated wants this index (topic 10 refines the ordering):
create index artists_rating_avg on artists (rating_avg desc nulls last);`,
          pitfalls: [
            '**Setting `rating_avg = 0` when the last review is deleted.** Zero sorts below every 1-star artist, so an unrated newcomer ranks beneath the worst artist on the site. Fix: when `review_count` hits 0, set `rating_avg = null`; null with `nulls last` correctly drops them out of the ranking.',
            '**Incrementally adjusting a running sum in the trigger.** The UPDATE case — a rating changing from 5 to 2 — makes running-sum arithmetic fragile and easy to desync. Fix: re-aggregate from `reviews` for the one affected artist; it is cheap and cannot drift.',
            '**Forgetting the DELETE branch uses `old`, not `new`.** In a DELETE trigger `new` is null, so `new.artist_id` errors. Fix: branch on `tg_op` and read `old.artist_id` for deletes, `new.artist_id` otherwise.',
            '**Computing the average live on the browse page and then trying to sort by it.** `order by avg(rating)` forces Postgres to aggregate every artist\'s reviews before it can rank them. Fix: denormalise into an indexed column so sorting is an ordered index scan.',
            '**Using `numeric` without a scale, or an `int`, for `rating_avg`.** You either store noise like 4.333333 or you lose the decimal entirely. Fix: `numeric(2,1)` stores exactly one decimal place — 4.5, 3.0 — which is all a star display needs.',
          ],
          tryIt:
            'Give an artist three reviews (5, 4, 3) and check `rating_avg` reads 4.0 and `review_count` reads 3. Now delete all three, one by one, and watch `review_count` fall to 0 and `rating_avg` become `null` — not 0.0. Query `select display_name, rating_avg from artists order by rating_avg desc nulls last;` and confirm the unrated artist sorts to the bottom, below the 1-star ones, exactly where they belong.',
          takeaway:
            'Store `rating_avg` and `review_count` on `artists` and maintain them with an `after insert/update/delete` trigger that re-aggregates for the affected artist. When the count hits zero, `rating_avg` must be `null` — 0.0 would rank an unrated artist below a 1-star one.',
        },
        {
          id: 'm12-t10',
          title: 'Why a naive average ranks badly, and the Bayesian fix applied at sort time',
          explain:
            'A raw average lets one 5-star review outrank forty-two 4.8-star reviews; a Bayesian weighted average fixes the ranking, and KalaKaara applies it at sort time rather than storing it.',
          analogy:
            'Two neer dosa stalls at the santhe. One has a single hand-written note pinned up: "Best dosa ever — 5 stars". The other has forty-two notes averaging 4.8. A sign that ranks purely by the number printed would put the one-note stall first, which no experienced santhe-goer would accept — a single glowing note means far less than forty-two consistent ones. The Bayesian weighting is the instinct every seasoned buyer already has: trust a high score more when many people gave it.',
          theory:
            'A raw average is right for *display* and wrong for *ranking*. Displayed, "5.0 from 1 review" and "4.8 from 42 reviews" are both honest. Ranked by raw average, the artist with one 5-star review sits above the artist with forty-two 4.8-star reviews — which is absurd, because the second artist has vastly more evidence behind a nearly-as-high score. Confidence should count. A high average from many reviews deserves to outrank a slightly higher average from one.\n\nThe standard fix is a **Bayesian (weighted) average**, the same formula IMDb famously uses for its Top 250:\n\n```\nweighted = (v / (v + m)) * R + (m / (v + m)) * C\n```\n\nwhere `v` is *this* artist\'s review count, `R` is *this* artist\'s raw average, `m` is a minimum-votes threshold (a tunable constant, say 5), and `C` is the *global* average rating across all artists. Read it as a blend: an artist with few reviews (`v` small relative to `m`) is pulled toward the global average `C`; an artist with many reviews (`v` far larger than `m`) keeps almost all of their own average `R`. The one 5-star artist, with `v = 1` and `m = 5`, gets dragged down toward `C`; the 42-review artist barely moves. Rankings now reflect confidence, not just height.\n\nIn SQL, at sort time:\n\n```sql\nselect id, display_name, rating_avg, review_count,\n       (review_count::numeric / (review_count + :m)) * rating_avg\n     + (:m::numeric / (review_count + :m)) * :global_avg   as weighted\nfrom artists\nwhere is_published and rating_avg is not null\norder by weighted desc nulls last;\n```\n\nNow the important design decision, and it is deliberate: **KalaKaara stores the raw average (`rating_avg`) and applies the weighting only at sort time.** It does **not** store a `weighted_rating` column. The reason is that `C`, the global average, **changes as the site grows.** Every new review anywhere shifts `C` slightly, which changes the weighted score of *every* artist — including artists whose own reviews did not change at all. If you stored the weighted value, you would have to recompute it for all artists on every review of any artist, which is a global write amplification for a value you only need at read time when sorting. Storing the raw average is correct-by-construction (it depends only on that artist\'s own reviews, via the topic-9 trigger); the weighting is a cheap arithmetic expression layered on at query time, using the current `C`. Compute `C` once per sort (`select avg(rating) from reviews`, or cache it briefly) and pass it in.\n\nSo the division of labour is: the trigger keeps the honest per-artist average always current and cheap to maintain, and the sort query applies the site-wide weighting using the up-to-the-second global average. Nothing stored ever goes stale, and nothing global has to be written on every review.',
          whyItMatters:
            'Ranking quality is a real product lever, and "why not just sort by average?" is a question with a genuinely interesting answer. Knowing the Bayesian weighting *and* knowing to apply it at query time rather than storing it — because the global term is non-local — is a two-part insight that demonstrates you think about both correctness and write amplification.',
          steps: [
            'Confirm the failure of raw averages: one 5-star review outranking forty-two 4.8-star reviews.',
            'Adopt the Bayesian formula `(v/(v+m))*R + (m/(v+m))*C`; pick `m` (e.g. 5) as your confidence threshold.',
            'Compute `C = avg(rating)` across all reviews once per sort, and pass it plus `m` into the query.',
            'Sort by the weighted expression, keeping `rating_avg` as the raw value you display.',
            'Do NOT store the weighted value: `C` moves with every review site-wide, so a stored value would need a global recompute constantly.',
          ],
          code: `-- Global average C: computed once per sort (cache for a minute if you like).
-- select avg(rating)::numeric(3,2) from reviews;   ->  e.g. 4.31

-- Sort by highest rated, HONESTLY. m = confidence threshold (e.g. 5).
-- v = review_count (this artist), R = rating_avg (this artist), C = global.
select
  id, display_name, rating_avg, review_count,
  round(
      (review_count::numeric / (review_count + :m)) * rating_avg
    + (:m::numeric        / (review_count + :m)) * :global_avg
  , 3) as weighted_score
from artists
where is_published
  and rating_avg is not null           -- unrated artists are not ranked here
order by weighted_score desc, review_count desc
limit 30 offset :page;

-- Worked example, m = 5, C = 4.31:
--   Artist X: v=1,  R=5.0  -> (1/6)*5.0 + (5/6)*4.31 = 4.42
--   Artist Y: v=42, R=4.8  -> (42/47)*4.8 + (5/47)*4.31 = 4.75
--   Y now outranks X, which is correct. The lone 5-star is pulled toward C.

-- WHY NOT store weighted_score on artists?
--   C changes every time ANY review is added anywhere. A stored weighted
--   value would go stale for EVERY artist on EVERY review -> a site-wide
--   recompute for a number you only need while sorting. So: store the raw
--   rating_avg (depends only on this artist), weight at query time.`,
          pitfalls: [
            '**Sorting "top rated" by raw `rating_avg`.** One 5-star review beats forty-two 4.8-star reviews, and your "best artists" list is dominated by artists with a single review. Fix: rank by the Bayesian weighted score so confidence, not just height, decides order.',
            '**Storing a `weighted_rating` column.** Because `C` shifts with every review anywhere, the stored value is stale the instant any other artist is reviewed, forcing a site-wide recompute. Fix: store the raw average; apply the weighting at sort time with the current `C`.',
            '**Recomputing `C` per row instead of once per query.** `avg(rating)` over all reviews inside a correlated subquery runs for every artist and is slow. Fix: compute `C` once, pass it as a parameter into the sort query.',
            '**Picking `m` without thinking.** Too large and even well-reviewed artists are dragged to the mean; too small and the weighting barely helps. Fix: choose `m` near the review count at which you start trusting an average (5–10 for a young site) and tune it as data grows.',
            '**Applying the weighting to the number you display.** Showing "4.42" for an artist whose reviews are all 5 stars is confusing and feels dishonest. Fix: display the raw `rating_avg` ("5.0 from 1 review"); use the weighted score only to order the list.',
          ],
          tryIt:
            'Seed one artist with a single 5-star review and another with a hundred 4.6-star reviews. Sort by raw average — the one-review artist wins. Now sort by the Bayesian expression with `m = 5` and the global `C` — the hundred-review artist wins. Change nothing about either artist\'s reviews but add fifty 3-star reviews to a *third* artist and watch `C` drop, nudging both weighted scores. That nudge is exactly why you never stored the weighted value.',
          takeaway:
            'Raw averages rank by height and ignore confidence, so a lone 5-star beats forty-two 4.8s. The Bayesian blend `(v/(v+m))*R + (m/(v+m))*C` fixes it — and because `C` moves with the whole site, you store the raw average and weight only at sort time.',
        },
        {
          id: 'm12-t11',
          title: 'Rendering: RatingStars, the paginated list, the distribution chart, and the empty state',
          explain:
            'Displaying reviews well means an accessible RatingStars component with half-stars, a paginated review list, a rating-distribution bar chart from one grouped query, and a real empty state.',
          analogy:
            'Look at how a well-made product shelf presents its reputation: a clear star mark you can read at a glance, the actual comments below it in order, a little bar chart showing how many gave five versus one so you can spot a polarised product, and — for something brand new — an honest "no reviews yet, be the first" rather than a blank gap that looks broken. Each piece answers a different question a buyer is silently asking.',
          theory:
            'Four rendering concerns, each with a correctness detail.\n\n**RatingStars (display, not input).** This is the read-only counterpart to topic 5\'s input. It is not interactive, so it must not be a set of radios or buttons — it is a single image, semantically. Give the container `role="img"` and a complete `aria-label` like `"4.5 out of 5, 23 reviews"`, and mark the decorative star glyphs `aria-hidden`. A screen reader then announces one meaningful sentence instead of spelling out five star characters. Half-stars are rendered with a **clipped overlay**: draw five empty stars, then draw a gold-filled copy on top, clipped with `width` (or `clip-path`) to the exact fraction — 4.5 stars is a gold layer clipped to 90%. This is pure CSS, no half-star glyph needed, and it renders any fraction precisely.\n\n**The paginated review list.** Reuse the topic-4 index (`artist_id, created_at desc`) and page with `range()` in supabase-js (or `limit`/`offset`). Ship the four states in order, as the course convention demands: loading skeleton, error, empty, then the data. Each review row shows the reviewer, their stars, the comment, and a relative timestamp.\n\n**The rating-distribution bar chart.** Buyers trust a rating more when they can see its shape — forty 5-star reviews reads very differently from twenty 5s and twenty 1s, even at the same average. You build this from **one grouped query**: `select rating, count(*) from reviews where artist_id = :id group by rating`. That returns at most five rows; you render five horizontal bars (5 down to 1), each width proportional to its share of the total. One query, five bars, and the polarisation is visible instantly.\n\n**The empty state.** An artist with no reviews must not render a blank space that looks like a bug. Show "No reviews yet — be the first" with the write-review call to action. This is the same "empty state is a feature" discipline from Module 0: the zero-data case gets designed copy, not an accidental gap. And because `rating_avg` is `null` for such an artist (topic 9), RatingStars must handle null gracefully — render five empty stars with an aria-label like "No ratings yet", never "0 out of 5".',
          diagram: `graph TD
    ART[Artist detail page] --> RS[RatingStars<br/>role=img, aria-label<br/>#quot;4.5 out of 5, 23 reviews#quot;]
    RS --> HALF[Half-star = gold overlay<br/>clipped to 90% width]
    ART --> DIST["Distribution chart:<br/>one query — group by rating"]
    DIST --> BARS[5 bars, width = share of total]
    ART --> LIST[Review list<br/>index: artist_id, created_at desc]
    LIST --> STATES[loading -> error -> empty -> data]
    ART --> EMPTY{review_count = 0?}
    EMPTY -->|yes| E[#quot;No reviews yet — be the first#quot;<br/>rating_avg is null -> empty stars]
    EMPTY -->|no| RS`,
          flowExplain:
            'Each branch answers a different buyer question: the stars give the headline, the distribution reveals whether the score is consistent or polarised, the list gives the detail, and the empty state keeps a new artist from looking broken.',
          whyItMatters:
            'Accessible read-only rating components (`role="img"` with a full label, not five announced glyphs), building a distribution from a single grouped query, and designing the empty state are all concrete, reviewable skills. The half-star clipped-overlay technique in particular is a common "how would you render 4.5 stars?" question with an elegant CSS-only answer.',
          steps: [
            'Build RatingStars as `role="img"` with a full `aria-label` ("4.5 out of 5, 23 reviews") and `aria-hidden` glyphs.',
            'Render half-stars with a gold overlay clipped to the fractional width — no half-star glyph required.',
            'Handle `rating_avg === null`: show empty stars labelled "No ratings yet", never "0 out of 5".',
            'Paginate the review list with `range()` and ship loading → error → empty → data in that order.',
            'Build the distribution chart from one `group by rating` query into five proportional bars.',
            'Design the empty state — "No reviews yet — be the first" — with the write-review CTA.',
          ],
          code: `// components/RatingStars/RatingStars.jsx — DISPLAY only (not an input).
import styles from './RatingStars.module.css';

export function RatingStars({ value, count }) {
  if (value == null) {                          // null = no reviews yet
    return <span role="img" aria-label="No ratings yet" className={styles.empty}>★★★★★</span>;
  }
  const pct = (value / 5) * 100;                 // 4.5 -> 90%
  const label = \`\${value} out of 5, \${count} review\${count === 1 ? '' : 's'}\`;
  return (
    <span role="img" aria-label={label} className={styles.wrap}>
      <span aria-hidden="true" className={styles.back}>★★★★★</span>
      {/* gold overlay clipped to the exact fraction — renders any half-star */}
      <span aria-hidden="true" className={styles.front} style={{ width: \`\${pct}%\` }}>
        ★★★★★
      </span>
    </span>
  );
}
/* .wrap { position: relative; display: inline-block; }
   .back  { color: #d4d4d8; }
   .front { position: absolute; inset: 0; overflow: hidden; white-space: nowrap; color: #eab308; } */

// The distribution chart from ONE grouped query.
// services/reviewService.js
export async function getRatingDistribution(artistId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating, count:rating.count()')      // group by rating
    .eq('artist_id', artistId);
  if (error) throw new Error(error.message);
  const byStar = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  data.forEach((r) => { byStar[r.rating] = r.count; });
  return byStar;                                  // { 5: 18, 4: 3, 3: 1, 2: 0, 1: 1 }
}

// The review list, four states in order.
// if (loading) return <ReviewSkeleton count={5} />;
// if (error)   return <ErrorState onRetry={reload} />;
// if (!reviews.length) return <EmptyState title="No reviews yet — be the first" cta={<WriteReviewButton/>} />;
// return reviews.map((r) => <ReviewItem key={r.id} review={r} />);`,
          pitfalls: [
            '**Rendering display stars as five separate elements a screen reader spells out.** "star star star star star" tells a blind user nothing about the score. Fix: `role="img"` on the container with one `aria-label` like "4.5 out of 5, 23 reviews", and `aria-hidden` on the glyphs.',
            '**Showing "0 out of 5" for an artist with no reviews.** `rating_avg` is null, and rendering it as 0 both looks like a real bad score and contradicts the null-not-zero decision from topic 9. Fix: detect null and render empty stars labelled "No ratings yet".',
            '**Rounding 4.5 to 5 (or 4) instead of drawing a half-star.** Half-star precision is easy to lose and the display then misrepresents the score. Fix: the clipped gold overlay renders any fraction exactly — 4.5 is a 90%-width overlay.',
            '**Building the distribution with five separate count queries.** Five round trips for what one `group by rating` returns. Fix: a single grouped query returns all five counts at once; fill zeros for missing star values on the client.',
            '**Leaving a bare gap where reviews would go.** An artist with no reviews looks broken, and buyers assume the page failed to load. Fix: a designed empty state — "No reviews yet — be the first" with a write-review CTA — turns the zero case into an invitation.',
          ],
          tryIt:
            'Render RatingStars for value 4.5 and inspect it with a screen reader or the accessibility panel — it should announce a single "4.5 out of 5, N reviews", and the gold overlay should visibly cover exactly four and a half stars. Then load an artist with no reviews and confirm you see "No reviews yet — be the first" and empty stars labelled "No ratings yet", never "0 out of 5".',
          takeaway:
            'Display ratings as a single `role="img"` element with a full label and a clipped gold overlay for half-stars; build the distribution from one `group by rating` query; and give an unrated artist a designed empty state with null-safe stars, never "0 out of 5".',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm12-p1',
      type: 'Mini Project',
      title: 'Trustworthy Ratings',
      domain: 'Reviews, Constraints & Honest Ranking',
      duration: '2 hours',
      description:
        'Build the complete reviews system: the table with both constraints, the anti-self-review RLS subquery, the full policy set, an accessible radio-based star input, review create/edit/delete with the "23505 means edit mode" branch, the denormalising trigger with correct null-on-zero behaviour, sort-by-highest-rated using a Bayesian weighting at query time, and a rating-distribution chart. The acceptance test is adversarial: try to review your own artist profile via a direct Supabase call and confirm the database — not React — rejects it.',
      tools: ['React', 'Supabase', 'PostgreSQL', 'RLS', 'CSS Modules', 'PL/pgSQL'],
      blueprint: {
        overview:
          'A working reviews feature on the artist detail page. Anyone can read reviews; signed-in users can write exactly one per artist and edit or delete their own; nobody can review their own profile or delete someone else\'s review; the average rating stays in sync via a trigger and correctly becomes null when the last review is removed; and the browse page can sort by a Bayesian weighted score computed at query time. The star input works with a keyboard and a screen reader, and a distribution chart shows the shape of an artist\'s reputation.',
        functionalRequirements: [
          '**Reviews table with both constraints.** `check (rating between 1 and 5)` and `unique (artist_id, user_id)`, with `on delete cascade` on both foreign keys.',
          '**Anti-self-review RLS.** An INSERT policy whose `with check` contains the subquery `artist_id not in (select id from artists where user_id = auth.uid())`, plus `user_id = auth.uid()`.',
          '**Full policy set.** Public SELECT to `anon, authenticated`; authenticated INSERT; author-only UPDATE and DELETE. No policy grants the reviewed artist any write access.',
          '**Accessible star input.** A `<fieldset>` of five radio inputs styled as stars, keyboard-operable, with hover and focus previews, submitting with the form.',
          '**Create / edit / delete.** Insert with optimistic UI and rollback; `error.code === \'23505\'` switches to edit mode instead of showing an error; `useUserReview` detects an existing review on load; the comment is preserved on failure.',
          '**Denormalising trigger.** `rating_avg` and `review_count` on `artists`, maintained `after insert or update or delete`, with `rating_avg` set to null (not 0.0) when the count reaches zero.',
          '**Sort by highest rated.** A query applying the Bayesian weight `(v/(v+m))*R + (m/(v+m))*C` at sort time, with `C` computed once and the weighted value never stored.',
          '**Rating distribution chart.** Five proportional bars built from a single `group by rating` query, plus a designed empty state for unrated artists.',
        ],
        technicalImplementation: [
          '**SQL migration** creating the table, the two constraints, the four RLS policies, the `refresh_artist_rating` function, and the `after insert/update/delete` trigger.',
          '**components/StarRatingInput** — the radio-based accessible input, and **components/RatingStars** — the read-only `role="img"` display with a clipped half-star overlay.',
          '**services/reviewService.js** — `createReview` (mapping `23505` and `42501` to specific errors), `getMyReview`, `updateReview`, `deleteReview`, `getRatingDistribution`, and the Bayesian-sorted browse query.',
          '**hooks/useUserReview.js** — returns `{ data, loading, error }`, skips the query for anonymous users, and drives the "Write" vs "Edit your review" button label.',
          '**components/ReviewForm** and **ReviewSection** — the gated form with counter and disable-on-submit, plus the optimistic-insert-with-rollback logic.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Table, constraints, and the anti-self-review RLS',
            outcome:
              'A reviews table with both constraints and the full policy set, including the self-review-blocking subquery.',
            prompt:
              'Write a Supabase SQL migration for a `reviews` table: `id uuid pk default gen_random_uuid()`, `artist_id uuid not null references artists(id) on delete cascade`, `user_id uuid not null references auth.users(id) on delete cascade`, `rating smallint not null check (rating between 1 and 5)`, `comment text`, `created_at`/`updated_at timestamptz default now()`, and `unique (artist_id, user_id)`. Enable RLS and add four policies: SELECT to `anon, authenticated` using `true`; INSERT to `authenticated` with check `user_id = auth.uid() and artist_id not in (select id from artists where user_id = auth.uid())`; UPDATE to `authenticated` using and with check `user_id = auth.uid()`; DELETE to `authenticated` using `user_id = auth.uid()`. Add a comment explaining why the self-review rule must be RLS and not a CHECK constraint, and why the reviewed artist deliberately has no write policy. Create the index `reviews (artist_id, created_at desc)` and note that the `(artist_id, user_id)` lookup is already served by the unique constraint.',
          },
          {
            step: 2,
            label: 'The denormalising trigger with null-on-zero',
            outcome:
              'rating_avg and review_count on artists, kept in sync by a trigger, correctly null when empty.',
            prompt:
              'Add `rating_avg numeric(2,1)` and `review_count int not null default 0` to `artists`. Write a `refresh_artist_rating(target uuid)` SQL function that updates those two columns from `select count(*), round(avg(rating),1) from reviews where artist_id = target` — so that when there are zero reviews, `rating_avg` becomes null (avg of no rows is null) and never 0.0. Write a PL/pgSQL trigger function `reviews_sync_rating` that calls `refresh_artist_rating` using `old.artist_id` for DELETE and `new.artist_id` otherwise, and attach it `after insert or update or delete on reviews for each row`. Add an index `artists (rating_avg desc nulls last)`. Then write a short test script: insert three reviews (5,4,3), assert avg 4.0 and count 3, delete all three, and assert count 0 and rating_avg null. Explain in a comment why null (not 0.0) is required so an unrated artist does not sort below a 1-star one.',
          },
          {
            step: 3,
            label: 'Accessible radio-based star input and read-only display',
            outcome:
              'A keyboard-operable StarRatingInput and a role=img RatingStars with half-star support.',
            prompt:
              'Create `components/StarRatingInput/StarRatingInput.jsx` and its CSS Module: a `<fieldset>` with a `<legend>` and five `<input type="radio">` sharing a name, styled as stars. Hide the radios accessibly (clip to 1px with opacity 0, not display:none, so they stay focusable), render the stars in reverse order so `:hover ~` and `:checked ~` sibling selectors fill the hovered/selected star and all earlier ones, and style `:focus-visible` with a visible outline. Include a visually-hidden "n of 5" label per option. Then create `components/RatingStars/RatingStars.jsx`: a read-only display with `role="img"` and an `aria-label` like "4.5 out of 5, 23 reviews", `aria-hidden` glyphs, and a gold overlay clipped by width to render half-stars precisely. Handle a null value by rendering empty stars labelled "No ratings yet", never "0 out of 5".',
          },
          {
            step: 4,
            label: 'reviewService and useUserReview with the 23505 branch',
            outcome:
              'A service layer that maps error codes to behaviours and a hook that detects an existing review.',
            prompt:
              'Write `services/reviewService.js` with `createReview`, `getMyReview`, `updateReview`, and `deleteReview`, all returning plain mapped data or throwing. In `createReview`, map `error.code === \'23505\'` to a thrown error tagged `code: \'ALREADY_REVIEWED\'` (so callers switch to edit mode, not show an error), map `error.code === \'42501\'` to a friendly "You cannot review your own artist profile", and map anything else to "Could not post your review. Please try again." `getMyReview` uses `.maybeSingle()` so zero rows returns null. Write `hooks/useUserReview.js` returning `{ data, loading, error }`, skipping the query entirely for anonymous users, so a component can render "Edit your review" when `data` exists and "Write a review" otherwise.',
          },
          {
            step: 5,
            label: 'Review form and optimistic create/edit/delete',
            outcome:
              'A gated form with counter and disable-on-submit, plus optimistic insert with rollback and edit mode.',
            prompt:
              'Create `components/ReviewForm` and `components/ReviewSection`. The form uses StarRatingInput (rating required), a textarea capped at 1000 chars with a live "n / 1000" counter in an aria-live region, disables the submit button while pending, and — critically — never clears the comment on failure. Gate submission behind `useAuthGate()` with intent `{ type: \'review\', slug }` so anonymous users are returned to this artist after sign-in. ReviewSection inserts optimistically (show the review immediately), replaces the optimistic row with the saved row on success, and on failure rolls back the optimistic row then branches: `ALREADY_REVIEWED` loads the existing review via getMyReview and enters edit mode, self-review and network errors show a message with the form intact. Wire edit (update) and delete (delete + optimistic remove), relying on the author-only RLS policies rather than any JS ownership check.',
          },
          {
            step: 6,
            label: 'Bayesian sort, distribution chart, and the adversarial acceptance test',
            outcome:
              'Sort-by-highest-rated done honestly, a distribution chart, and a proof that Postgres blocks self-review.',
            prompt:
              'Add a browse-page sort option "Highest rated" that orders by the Bayesian weight `(review_count/(review_count+:m))*rating_avg + (:m/(review_count+:m))*:C` where `:m` is a threshold (5) and `:C` is the global average from `select avg(rating) from reviews`, computed once per request and passed in — never stored on the artist. Add `getRatingDistribution(artistId)` using a single `group by rating` query, and render five proportional horizontal bars plus a "No reviews yet — be the first" empty state. Finally, write the acceptance test: signed in as an artist who owns a profile, call `supabase.from(\'reviews\').insert({ artist_id: <own id>, user_id: <own uid>, rating: 5 })` directly, bypassing all React, and assert that it fails with a row-level-security error — proving the database, not the UI, enforces the no-self-review rule. Print a clear PASS/FAIL.',
          },
        ],
        deliverable:
          'A reviews feature where every rule is enforced by Postgres: ratings are bounded, one review per user is guaranteed, self-review is impossible even via a direct API call, the reviewed artist cannot delete criticism, the average stays in sync and goes null when empty, and "highest rated" ranks by an honest Bayesian weight computed at query time. The acceptance test proves the self-review block lives in the database by defeating React entirely and still being refused.',
      },
    },
  ],
  quiz: [
    {
      id: 'm12-q1',
      q: 'Why can a CHECK constraint not prevent an artist from reviewing their own profile?',
      options: [
        'CHECK constraints are disabled by default in Supabase and must be enabled per table',
        'A CHECK may only reference columns of the row being written, and "does this user own the artist?" is a fact in the separate artists table, requiring a subquery a CHECK cannot contain',
        'CHECK constraints cannot compare two UUID columns to each other',
        'A CHECK runs only on UPDATE, never on INSERT, so it misses new reviews',
      ],
      answer: 1,
    },
    {
      id: 'm12-q2',
      q: 'When the last review for an artist is deleted, what must the trigger set rating_avg to, and why?',
      options: [
        '0.0, because zero reviews logically means a zero score',
        'The global average C, so the artist blends into the site mean',
        'null, because an unrated artist has no rating — and 0.0 would sort them below a genuine 1-star artist',
        'The previous value, frozen, so the ranking does not suddenly change',
      ],
      answer: 2,
    },
    {
      id: 'm12-q3',
      q: 'Why does KalaKaara deliberately give the reviewed artist no policy to delete reviews about them?',
      options: [
        'If artists could delete reviews they dislike, every average would become untrustworthy — a review system\'s value is its incorruptibility by the reviewed party; the mature alternative is a report-and-reply flow, never a delete button',
        'Postgres does not allow DELETE policies that reference a second table',
        'Deleting reviews would break the foreign key cascade and orphan the artist row',
        'Artists can delete reviews, but only within 24 hours of posting',
      ],
      answer: 0,
    },
    {
      id: 'm12-q4',
      q: 'Why is an accessible star-rating INPUT built from five radio buttons rather than five clickable divs?',
      options: [
        'Radio buttons render faster than divs in React',
        'Divs cannot display a star character, but radios can',
        'A shared-name radio group is required by the reviews table schema',
        'The native radio group provides keyboard navigation, focus management, screen-reader announcements, and form submission for free, whereas divs provide none of these and would each have to be re-implemented in JavaScript',
      ],
      answer: 3,
    },
    {
      id: 'm12-q5',
      q: 'A review insert returns error code 23505. What is the correct response?',
      options: [
        'Show a red error banner reading "duplicate key value violates unique constraint"',
        'Recognise it as "you already reviewed this artist", load the existing review, and switch the UI into edit mode — showing no error at all',
        'Retry the insert automatically until it succeeds',
        'Delete the existing review and insert the new one to replace it',
      ],
      answer: 1,
    },
    {
      id: 'm12-q6',
      q: 'Why does KalaKaara apply the Bayesian weight at sort time instead of storing a weighted_rating column?',
      options: [
        'Storing the weighted value would violate the reviews table\'s unique constraint',
        'The Bayesian formula cannot be expressed in SQL, only in JavaScript at read time',
        'numeric(2,1) cannot hold a weighted score with enough precision to store',
        'The global average C changes with every new review anywhere on the site, so a stored weighted value would go stale for every artist on every review, forcing a constant site-wide recompute',
      ],
      answer: 3,
    },
    {
      id: 'm12-q7',
      q: 'What is the main trade-off of denormalising rating_avg and review_count onto the artists table instead of computing them live?',
      options: [
        'Denormalised columns are fast to read, sortable, and indexable (which "sort by highest rated" needs), but must be maintained by a trigger, whereas a live aggregate is always correct but slower and cannot be cheaply sorted across all artists',
        'Denormalised columns are always stale and can never be trusted for display',
        'A live aggregate query is both faster and sortable, so denormalisation has no advantage at all',
        'Denormalisation requires PostGIS, which the course forbids',
      ],
      answer: 0,
    },
  ],
}
