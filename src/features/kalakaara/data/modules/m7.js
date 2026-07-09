// Module 7 — The Artist Dashboard & Supabase Storage
// KalaKaara (React + Supabase) course content for the React course player.

export const m7 = {
  id: 'm7',
  title: 'The Artist Dashboard & Supabase Storage',
  hours: 8,
  color: 'from-amber-500/20 to-amber-700/10',
  accent: 'amber',
  description:
    'The artist dashboard is where Flow A lives: a signed-in user creates or edits their artist profile, uploads a portfolio of real images, and publishes. This module teaches Supabase Storage from first principles — buckets, objects, paths, and the folder-ownership RLS pattern — then builds the create-vs-edit profile form, slug generation, many-to-many category and language editing, image upload with client-side WebP compression (because Supabase image transformations cost money and we have no card), and portfolio CRUD with careful orphan-free deletion.',
  sections: [
    {
      id: 'm7-s1',
      title: 'Supabase Storage from first principles',
      topics: [
        {
          id: 'm7-t1',
          title: 'What Storage is — objects, buckets, paths, and the same RLS language',
          explain:
            'Supabase Storage is S3-compatible object storage whose access rules are written in the exact same Row Level Security language you already know — against a real Postgres table called storage.objects.',
          analogy:
            'Think of the cold-storage godown behind the Kundapura fish market. A bucket is a whole godown — "avatars", "covers", "artworks" — and each one has its own door policy. An object is a single crate inside it. A path is the label written on the crate: the aisle, the shelf, the crate number. The godown does not care what is in the crate; it only enforces who is allowed to walk down which aisle, and that rule is written in the same register the rest of the market uses.',
          theory:
            'Storage is for the things a database column cannot sensibly hold: image files, ideally. A Postgres row is a great place for `display_name` and `price`, and a terrible place for a two-megabyte JPEG. So Supabase gives you **object storage** — an S3-compatible service — that sits alongside your database in the same project, on the same free tier, protected by the same auth system.\n\nThree words carry the whole model. A **bucket** is a top-level container, like `avatars` or `artworks`. An **object** is a single stored file. A **path** (also called the object `name`) is the string that identifies the object inside its bucket, and it looks like a file path: `3f9c.../portrait-01.webp`. The slashes are not real folders — Storage is flat — but the API treats path segments *as if* they were folders, and that fiction is exactly what makes the ownership pattern in the next few topics work.\n\nHere is the part that makes Supabase Storage special, and it is worth slowing down for. Every object you upload is recorded as a **row in a real Postgres table named `storage.objects`**. That table has columns: `bucket_id`, `name` (the path), `owner` (the uploader\'s `auth.uid()`), `created_at`, and `metadata`. Because it is an ordinary table, you protect it with **ordinary Row Level Security policies** — the identical `using (...)` and `with check (...)` clauses you wrote for `artists` in Module 4. There is no separate "storage permissions" system to learn. Reading, uploading, updating, and deleting a file are just `select`, `insert`, `update`, and `delete` on `storage.objects`, guarded by RLS.\n\nThe free tier is generous enough for this whole course and asks for **no credit card**: 1 GB of stored files and 5 GB of egress bandwidth per month. A portfolio of WebP images compressed to around 200 KB each (Topic 5) means roughly five thousand images before you touch the storage ceiling, and the bandwidth budget comfortably covers a real launch. Contrast this with Firebase Storage, which now requires the Blaze (card-on-file) plan to create a bucket at all — that single fact is why KalaKaara is built on Supabase and not Firebase.',
          diagram: `graph TD
    PROJ[Your Supabase project] --> DB[(Postgres 15)]
    PROJ --> STO[Storage service<br/>S3-compatible]
    STO --> B1[bucket: avatars]
    STO --> B2[bucket: covers]
    STO --> B3[bucket: artworks]
    B3 --> O1["object 3f9c.../a1b2.webp"]
    B3 --> O2["object 7d21.../c3d4.webp"]
    O1 -. is really a row in .-> OT[(storage.objects table<br/>bucket_id, name, owner)]
    O2 -. is really a row in .-> OT
    OT -. guarded by .-> RLS[RLS policies<br/>same language as every other table]
    RLS --> DB`,
          flowExplain:
            'Follow the dotted lines: an uploaded object is a row in storage.objects, and that table is guarded by the same RLS you already know. There is no second permission system — Storage security is database security.',
          whyItMatters:
            'Most beginners treat file storage as a magic sidecar with its own mysterious rules, then either make everything public or paste in the service_role key to "make uploads work". Understanding that Storage is just a Postgres table under RLS means you secure it with the one mental model you already have, and you never reach for the key that would hand your whole project to anyone with DevTools.',
          steps: [
            'Say the three words out loud and define each: **bucket** (a container), **object** (a file), **path** (the object\'s name inside the bucket).',
            'Internalise that every object is a row in `storage.objects`, with an `owner` column equal to the uploader\'s `auth.uid()`.',
            'Map the four file operations to SQL verbs: read is `select`, upload is `insert`, replace is `update`, delete is `delete` — all on `storage.objects`.',
            'Note the free-tier ceilings: 1 GB stored, 5 GB bandwidth per month, no card. Write them next to the compression target from Topic 5.',
            'Contrast with Firebase Storage (Blaze plan, card required) so you can explain the choice in one sentence.',
          ],
          code: `-- Storage is not magic. Prove it to yourself with plain SQL in the SQL editor.

-- 1. Buckets are rows in storage.buckets.
select id, name, public, created_at
from storage.buckets;
--  id        name       public
--  avatars   avatars    true
--  covers    covers     true
--  artworks  artworks   true

-- 2. Every uploaded file is a row in storage.objects.
select
  bucket_id,
  name,                        -- the path, e.g. '3f9c.../a1b2c3d4.webp'
  owner,                       -- the auth.uid() of whoever uploaded it
  (metadata ->> 'size')::int as bytes,
  metadata ->> 'mimetype'   as mimetype,
  created_at
from storage.objects
where bucket_id = 'artworks'
order by created_at desc
limit 5;

-- 3. Because it is a table, you protect it with ordinary RLS. This is
--    the SAME language as the artists policies from Module 4:
--
--       create policy "..." on storage.objects for insert
--         to authenticated with check ( ... );
--
--    There is no separate storage-permission system to learn. The next
--    topics write these policies. The point right now: it is just a table.`,
          pitfalls: [
            '**Thinking Storage has its own separate permission system.** It does not — access is RLS on `storage.objects`, the same language as every other table. Fix: stop looking for a special storage-rules screen; write policies against `storage.objects`.',
            '**Storing image bytes in a Postgres column to "keep everything in one place".** A `bytea` column bloats the database, blows the 500 MB db limit fast, and makes every `select *` slow. Fix: files go in Storage; the row keeps only the `avatar_url` / path string.',
            '**Assuming path slashes create real folders.** Storage is flat; `a/b/c.webp` is one object whose name contains slashes. Fix: rely on the *convention* that the first segment is a user id — that is what the ownership policy checks — but do not expect a real directory tree.',
            '**Picking Firebase Storage out of habit.** It now needs the Blaze plan (a card on file) to create any bucket, which fails NFR N1. Fix: use Supabase Storage; it is card-free on the same project as your database.',
            '**Forgetting the bandwidth ceiling exists.** 5 GB/month of egress is plenty for compressed WebP, and trivial to blow through if you serve 4 MB originals. Fix: compress before upload (Topic 5); that one habit protects the bandwidth budget too.',
          ],
          tryIt:
            'In the SQL editor, run `select bucket_id, name, owner from storage.objects limit 5;` (it will be empty until you upload something). Then predict: after an artist uploads their avatar, what will `owner` equal? (Their `auth.uid()` — which is exactly what the ownership policy in Topic 3 checks.)',
          takeaway:
            'Storage is S3-compatible object storage where every file is a row in storage.objects, guarded by the same RLS language as every other table. Buckets contain objects; objects are named by paths. Free tier: 1 GB stored, 5 GB bandwidth, no card.',
        },
        {
          id: 'm7-t2',
          title: 'Three public buckets — and what "public" really means',
          explain:
            'KalaKaara needs three buckets — avatars, covers, and artworks — all public, because portfolio images must be visible to anonymous browsers and indexable by Google.',
          analogy:
            'A public bucket is like a poster pasted on the wall of the Kundapura bus stand. Anyone walking past can see it, no ticket required — which is exactly what you want for an artist\'s portfolio. But it also means anyone can photograph it, and once the photo is taken, taking the poster down later does not un-take the photo. You never paste anything on that wall that you would mind a stranger keeping forever.',
          theory:
            'A bucket is either **public** or **private**, and the choice changes what a URL grants. In a **private** bucket, the only way to fetch an object is to ask Supabase to mint a **signed URL** — a temporary link with an expiry baked in — and RLS decides whether you are even allowed to ask. In a **public** bucket, every object has a permanent, unauthenticated URL of the form `https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>`, and anyone who has that URL can fetch the file, forever, with no token and no login.\n\nFor KalaKaara, all three buckets are **public**, and that is the correct design, not a shortcut. An artist\'s avatar, cover, and artworks are *meant* to be seen by anonymous visitors — that is the entire product (Module 0, Flow B). They must also be fetchable by Google\'s crawler so an artist\'s profile can be indexed and found. A private bucket would force a signed-URL round-trip on every image, break crawlability, and add latency for zero benefit, because there is nothing secret about a portrait an artist *wants* the world to see.\n\nNow the sentence you must not skip, because it is where beginners create real problems. **"Public" means the URL is guessable-forever.** Not "public until you flip a setting". Once an object sits in a public bucket, its URL works for anyone, indefinitely, regardless of RLS — because public read is precisely the thing "public bucket" turns on. The practical rule: **never put anything private in a public bucket.** No ID scans, no unwatermarked originals you sell, no draft the artist has not chosen to publish. If it should ever be hidden from a stranger, it does not belong in a public bucket at all.\n\nA subtlety that trips people: making a bucket public controls **who can read**, but it does **not** decide **who can write**. Anyone can *fetch* from a public bucket, but *uploading, replacing, and deleting* are still gated by the RLS policies you write on `storage.objects` (Topic 3). So "public" is not "a free-for-all" — it is "public read, owner-only write". Getting that pair right is the whole security story for images in this app.',
          diagram: `graph TD
    UP[Artist uploads image] --> INS{Bucket is public?}
    INS -- Yes: read is open --> PUB[Permanent public URL<br/>.../object/public/artworks/path]
    INS -- No: read is gated --> PRV[Signed URL only<br/>expires, RLS-checked]
    PUB --> ANY[Anyone with the URL<br/>fetches it forever]
    PUB --> GOOG[Google crawler indexes it]
    ANY --> RULE[So: never store anything<br/>private in a public bucket]
    WRITE[Upload / replace / delete] --> POL[Still gated by RLS<br/>owner-only, both bucket types]`,
          flowExplain:
            'The left branch is what we want for portfolios: open read, Google-indexable. The bottom box is the catch that beginners forget — read is open, but write is still owner-only RLS.',
          whyItMatters:
            'The single most common Supabase security incident in beginner projects is a private document dropped into a public bucket, then "deleted" — but the URL was already indexed or shared, and the file is still reachable. Knowing that public means guessable-forever changes what you are willing to store there, which is a judgment interviewers probe directly.',
          steps: [
            'Create three buckets in the dashboard: `avatars`, `covers`, `artworks`. Mark all three **public**.',
            'For each, write one sentence justifying public: these images are meant for anonymous visitors and Google.',
            'Repeat the rule until it is reflex: **public read means the URL works forever for anyone** — never store anything private here.',
            'Separate the two axes in your head: public controls **read**; RLS policies (Topic 3) control **write**. Public is not a free-for-all.',
            'Decide, deliberately, that unpublished artworks are still fine in the public bucket (their image is not secret) but are hidden by the `is_published` flag on the *row*, not by bucket privacy.',
          ],
          code: `-- Create the three buckets from SQL (or click "New bucket" in the dashboard).
-- public = true is the deliberate choice for portfolio imagery.

insert into storage.buckets (id, name, public)
values
  ('avatars',  'avatars',  true),
  ('covers',   'covers',   true),
  ('artworks', 'artworks', true)
on conflict (id) do nothing;

-- What "public" buys you: a permanent, tokenless URL for every object.
-- In JS you never build this string by hand — you ask for it:
--
--   const { data } = supabase
--     .storage.from('artworks')
--     .getPublicUrl('3f9c.../a1b2c3d4.webp');
--   data.publicUrl
--   // => https://<proj>.supabase.co/storage/v1/object/public/artworks/3f9c.../a1b2c3d4.webp
--
-- That URL works for ANYONE, FOREVER, with no auth header. That is the
-- feature (Google can crawl it) and the warning (do not store secrets here).

-- Reminder: public affects READ only. Upload/replace/delete are still
-- gated by the RLS policies we write in the next topic. Public bucket
-- does NOT mean anyone can write.`,
          pitfalls: [
            '**Believing a "deleted" public object is gone from the internet.** The URL may already be cached by a CDN, saved by a visitor, or indexed by Google. Fix: treat public upload as permanent publication; only put things there you are happy to have copied forever.',
            '**Making a bucket private to protect portfolio images, then wondering why they will not load for logged-out visitors.** Private buckets need signed URLs; anonymous browsers cannot fetch them. Fix: portfolios are public by design — privacy is the wrong tool here.',
            '**Assuming a public bucket lets anyone upload.** Public controls read only; without an insert policy, uploads fail. Fix: write the owner-only write policies in Topic 3 — public plus RLS is the correct pair.',
            '**Storing an artist\'s unwatermarked, for-sale original in the public bucket.** Anyone can right-click and keep it forever. Fix: only display resolutions belong in a public bucket; keep true originals out of Storage entirely, or watermark them.',
            '**Hiding an unpublished artwork by putting its image in a private bucket.** That couples visibility to bucket type and breaks when you publish. Fix: keep the image public, and control visibility with `is_published` on the artwork *row* (Topic 12).',
          ],
          tryIt:
            'Upload one test image to the `artworks` bucket via the dashboard, copy its public URL, and open it in a private browsing window where you are logged out. It loads — proving the URL needs no auth. Now imagine that had been someone\'s Aadhaar scan. That feeling is the lesson.',
          takeaway:
            'All three KalaKaara buckets are public because portfolios must be seen by anonymous visitors and indexed by Google. Public means the URL is guessable-forever, so never store anything private there. Public controls read only; write is still owner-only RLS.',
        },
        {
          id: 'm7-t3',
          title: 'Storage RLS and the folder-ownership pattern',
          explain:
            'The trick that makes per-user file security work: put each user\'s files under a folder named with their user id, and write policies that check the first path segment equals auth.uid().',
          analogy:
            'The seva counter at a temple gives every archaka a numbered drawer. The rule is simple and unbreakable: you may only put things into, or take things out of, the drawer whose number matches your token. The clerk does not need to inspect what is inside — the drawer number on the front is enough to decide. In Storage, the user id is that drawer number, and it is the first segment of every file\'s path.',
          theory:
            'We need three guarantees for uploads. **Anyone may read** (the buckets are public). **Only signed-in users may write.** And **a user may only write into their own space** — Rukmini must never be able to overwrite Ganesh\'s avatar. Public read handles the first. The second and third come from RLS policies on `storage.objects`, and the mechanism is the **folder-ownership pattern**.\n\nThe pattern is a naming convention plus a policy that enforces it. Every object\'s path is `{user_id}/{filename}` — the uploader\'s `auth.uid()` is the first segment, always. Then the policy checks that first segment against the caller\'s id. Supabase gives you a helper for exactly this: **`storage.foldername(name)`** takes an object\'s path and returns a `text[]` of its "folder" segments — everything except the final filename. So for the path `3f9c.../a1b2.webp`, `storage.foldername(name)` returns `{"3f9c..."}`, and `(storage.foldername(name))[1]` is the string `3f9c...`. (Postgres arrays are 1-indexed, so `[1]` is the first element — a classic off-by-one trap for anyone coming from JavaScript.) Compare that to `auth.uid()::text` and you have ownership: `(storage.foldername(name))[1] = auth.uid()::text`.\n\nThat single expression is the heart of the module. On **insert** it is a `with check` — it decides what path you are allowed to create, so you can only write into your own folder. On **update** and **delete** it is a `using` clause — it decides which existing objects you are allowed to touch, so you can only replace or remove your own files. On **select** we want the opposite: fully open, because the buckets are public, so the read policy is simply `using (true)` scoped to the relevant buckets.\n\nYou write this set of four policies (select, insert, update, delete) once per bucket — three buckets, so twelve policies, but they are copy-paste-identical except for the `bucket_id`. The `bucket_id = \'artworks\'` guard matters: without it, a single policy would apply to *every* bucket in the project, which is usually not what you want. Note also the `::text` cast: `auth.uid()` returns a `uuid`, and `storage.foldername()` returns `text`, so you must cast the uuid to text or the comparison silently fails and every upload is denied.\n\nThe deep payoff of this pattern is that ownership lives in the path itself, not in a separate lookup. The database never has to join anything or ask "who owns this file?" — the answer is written on the front of the drawer. That is why it is fast, and why it cannot drift out of sync.',
          diagram: `graph TD
    U[Signed-in user<br/>auth.uid = 3f9c...] --> A[Wants to upload to<br/>artworks bucket]
    A --> P["Path must be<br/>3f9c.../filename.webp"]
    P --> POL{"with check:<br/>(storage.foldername(name))[1]<br/>= auth.uid()::text"}
    POL -- "first segment = 3f9c..." --> OK[Allowed]
    POL -- "first segment = someone else" --> NO[Denied by RLS]
    R[Anyone, even anon] --> RS{select policy}
    RS -- "using (true)" --> READ[Read allowed<br/>bucket is public]`,
          flowExplain:
            'The diamond is the whole security model: the policy compares the first path segment to the caller\'s id. Upload into your own folder passes; anything else is denied before a byte is written.',
          whyItMatters:
            'Per-user file isolation is a real requirement in almost every app with uploads, and the folder-ownership pattern is the idiomatic Supabase answer. Being able to write `(storage.foldername(name))[1] = auth.uid()::text` from memory, and explain why it goes in with check on insert but using on delete, is a concrete, testable Supabase skill.',
          steps: [
            'Adopt the path convention everywhere: every upload path starts with `${auth.uid()}/`. No exceptions — the policy depends on it.',
            'Understand `storage.foldername(name)`: it returns the path\'s folder segments as a 1-indexed `text[]`; `[1]` is the first (the user id).',
            'Write the `select` policy as `using (true)` scoped to the three buckets — open read, because they are public.',
            'Write `insert` with a `with check` on the ownership expression; write `update` and `delete` with a `using` clause on the same expression.',
            'Remember the `::text` cast on `auth.uid()`, and the `bucket_id = \'...\'` guard so each policy applies to one bucket only.',
          ],
          code: `-- Folder-ownership policies. Repeat this block for each bucket, changing
-- only the bucket_id. Shown here for 'artworks'; do the same for
-- 'avatars' and 'covers'.

-- READ: open to everyone, because the bucket is public.
create policy "artworks are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using ( bucket_id = 'artworks' );

-- UPLOAD: only a signed-in user, and only into their own {uid}/ folder.
create policy "users upload into their own artworks folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'artworks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
--         ^ first path segment must equal the caller's id.
--           auth.uid() is a uuid, so cast it ::text to compare.

-- REPLACE: you may overwrite only files already in your own folder.
create policy "users update their own artworks"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'artworks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: you may remove only files in your own folder.
create policy "users delete their own artworks"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'artworks'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- storage.foldername('3f9c-.../a1b2.webp')  ->  {'3f9c-...'}   (a text[])
-- (storage.foldername('3f9c-.../a1b2.webp'))[1]  ->  '3f9c-...'  (1-indexed!)`,
          pitfalls: [
            '**Forgetting the `::text` cast on `auth.uid()`.** It is a `uuid`; the path segment is `text`; without the cast the comparison fails and *every* upload is silently denied. Fix: always write `auth.uid()::text`.',
            '**Indexing the array with `[0]`.** Postgres arrays are 1-indexed, so `(storage.foldername(name))[1]` is the first segment — `[0]` is null. Fix: use `[1]`; this catches JavaScript developers every time.',
            '**Omitting the `bucket_id` guard.** A policy with only the foldername check applies to every bucket in the project. Fix: always scope with `bucket_id = \'...\'` so avatars, covers, and artworks stay independent.',
            '**Putting the ownership check in `using` on an insert (or `with check` on a delete).** Insert has no existing row, so its guard must be `with check`; delete has no new row, so its guard must be `using`. Fix: `with check` = "what may you create", `using` = "what may you target".',
            '**Uploading to a path that does not start with the user id.** Then `(storage.foldername(name))[1]` is some filename or a wrong id, and the policy denies it. Fix: build every path as `${userId}/${randomName}` in the service layer, never from the original filename.',
          ],
          tryIt:
            'Predict the result of `select (storage.foldername(\'u-123/covers/hero.webp\'))[1], (storage.foldername(\'u-123/covers/hero.webp\'))[2];`. (Answer: `u-123` and `covers` — foldername returns every segment except the final filename, and the array is 1-indexed.) This tells you why a two-level path still ownership-checks correctly on `[1]`.',
          takeaway:
            'Store each user\'s files under a {user_id}/ folder and enforce it with (storage.foldername(name))[1] = auth.uid()::text — as with check on insert, as using on update and delete — plus a using (true) select policy because the buckets are public. Ownership lives in the path itself.',
        },
        {
          id: 'm7-t4',
          title: 'The Storage JS API: upload, getPublicUrl, remove, and deterministic paths',
          explain:
            'Four calls do everything: upload a file, get its public URL, and remove objects — and the paths you choose matter as much as the calls themselves.',
          analogy:
            'When the fish market clerk logs a new crate, they do not write "Ravi\'s big box" on it — that name collides the moment Ravi brings a second box, and a mischievous label could point at someone else\'s aisle. Instead they stamp a fresh serial number no one can guess or duplicate. Your upload paths work the same way: a random id under the user\'s folder, never the customer\'s own filename.',
          theory:
            'The Storage client hangs off `supabase.storage.from(bucket)`, and three methods carry this module. **`.upload(path, file, options)`** writes bytes to a path. The options that matter: `upsert` (if `true`, overwrite an existing object at that path instead of erroring on conflict — essential for replacing an avatar), `cacheControl` (a string of seconds, e.g. `\'3600\'`, that becomes the object\'s `Cache-Control` header and controls how long browsers and CDNs cache it), and `contentType` (the MIME type, e.g. `\'image/webp\'`, which you should set explicitly after compressing so the browser serves it correctly). **`.getPublicUrl(path)`** returns `{ data: { publicUrl } }` — a pure string builder that does no network call and works for any path in a public bucket, even one that does not exist yet. **`.remove([paths])`** deletes one or more objects; it takes an **array** of paths, not a single string, which is a trap the first time.\n\nNow the path decision, which is more important than any option. **Never upload under the user\'s original filename.** Three things go wrong. **Collisions:** two artists both upload `IMG_2024.jpg`, or one artist uploads it twice, and the second silently overwrites the first (or errors without `upsert`). **Unicode and spaces:** phone galleries produce names like `ಚಿತ್ರ ೧.jpg` or `photo (1).jpg`, which need URL-encoding and break in subtle ways. **Path traversal:** a crafted filename like `../../someone-else/avatar.webp` is an attempt to climb out of the user\'s folder. The fix for all three is a **deterministic, app-generated path**: `${userId}/${crypto.randomUUID()}.webp`. The user id satisfies the ownership policy from Topic 3; the random UUID guarantees no collision and nothing guessable or traversable; the `.webp` extension matches what you compressed to in Topic 5. The original filename is thrown away — you never needed it.\n\nOne case genuinely wants a *stable* path rather than a random one: a user\'s single avatar. If you always write the avatar to `${userId}/avatar.webp` with `upsert: true`, replacing it is one call and the row\'s `avatar_url` never changes. But there is a catch — **cache-busting**. Because you set `cacheControl` and the URL is identical after replacement, the browser and CDN happily serve the *old* cached avatar. The fix is a cache-busting query string: store or render the URL as `${publicUrl}?v=${Date.now()}` (or `?v=${updated_at}`), which is ignored by Storage but forces caches to treat it as a new resource. For artworks, where each image is a distinct object with a random name, this never arises — a new artwork is a new URL.',
          diagram: `graph LR
    F[Compressed WebP file] --> PATH["Build path:<br/>userId + / + randomUUID + .webp"]
    PATH --> UP["storage.from('artworks')<br/>.upload(path, file,<br/>{ upsert, cacheControl, contentType })"]
    UP -- ok --> GET[".getPublicUrl(path)<br/>returns publicUrl string"]
    GET --> ROW[Save publicUrl / path<br/>on the artworks row]
    DEL[Delete flow] --> RM[".remove([path])<br/>takes an ARRAY"]
    AV[Avatar replace] --> STABLE["Stable path avatar.webp<br/>+ upsert: true"]
    STABLE --> BUST["Render URL + ?v=Date.now()<br/>to bust the cache"]`,
          flowExplain:
            'The main path builds a deterministic name, uploads, then reads back a public URL to store on the row. The avatar branch shows the one place a stable path is right — and why it forces cache-busting.',
          whyItMatters:
            'Filename handling is a classic source of both bugs and security holes. An interviewer who asks "how do you name uploaded files?" is checking whether you know about collisions, unicode, and path traversal — and "a UUID under the user\'s folder" is the answer that shows you have been bitten before.',
          steps: [
            'Build every path in the service layer as `${userId}/${crypto.randomUUID()}.webp` — never from the incoming filename.',
            'On upload, pass `contentType: \'image/webp\'` and a `cacheControl` like `\'3600\'`; add `upsert: true` only when you intend to overwrite.',
            'Read the public URL with `.getPublicUrl(path)` and persist it (or the path) on the corresponding row.',
            'Delete with `.remove([path])` — remember the argument is an **array**, even for a single file.',
            'For the single avatar, use a stable path plus `upsert: true`, and render the URL with a `?v=${Date.now()}` cache-buster so replacements show immediately.',
          ],
          code: `// src/services/storageService.js — the ONLY place uploads happen.
import { supabase } from '../supabase/client';

// Upload a compressed WebP and return its public URL.
export async function uploadArtworkImage(userId, file) {
  const path = \`\${userId}/\${crypto.randomUUID()}.webp\`;   // deterministic, safe
  const { error } = await supabase
    .storage.from('artworks')
    .upload(path, file, {
      upsert: false,               // a new artwork must never clobber another
      cacheControl: '3600',        // browsers/CDN cache for 1 hour
      contentType: 'image/webp',   // set it explicitly after compression
    });
  if (error) throw new Error(\`Artwork upload failed: \${error.message}\`);

  const { data } = supabase.storage.from('artworks').getPublicUrl(path);
  return { path, url: data.publicUrl };   // store BOTH: url to show, path to delete
}

// Avatar: one stable path per user, overwritten in place, cache-busted on read.
export async function uploadAvatar(userId, file) {
  const path = \`\${userId}/avatar.webp\`;
  const { error } = await supabase
    .storage.from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600', contentType: 'image/webp' });
  if (error) throw new Error(\`Avatar upload failed: \${error.message}\`);

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return \`\${data.publicUrl}?v=\${Date.now()}\`;   // ?v= forces caches to refetch
}

// Delete takes an ARRAY of paths, even for one file.
export async function removeArtworkImage(path) {
  const { error } = await supabase.storage.from('artworks').remove([path]);
  if (error) throw new Error(\`Artwork delete failed: \${error.message}\`);
}`,
          pitfalls: [
            '**Uploading under the original filename.** Collisions, unicode breakage, and `../` path-traversal attempts all follow. Fix: `${userId}/${crypto.randomUUID()}.webp`, generated in your code, discarding the incoming name.',
            '**Passing a string to `.remove()` instead of an array.** `remove(path)` silently does nothing useful; the signature is `remove([path])`. Fix: always wrap in an array, even for a single object.',
            '**Storing only the public URL and not the path.** To delete later you need the path, and parsing it back out of the URL is fragile. Fix: persist both `url` (to render) and `path` (to `remove`).',
            '**Replacing an avatar and seeing the old one for an hour.** The URL is unchanged and `cacheControl` did its job — the cache is stale, not the storage. Fix: render avatars with `?v=${Date.now()}` (or `?v=updated_at`) to bust the cache.',
            '**Setting `upsert: true` on new artworks.** A path collision (however unlikely with a UUID) would then silently overwrite instead of erroring. Fix: `upsert: false` for new artworks; reserve `upsert: true` for the deliberately-stable avatar path.',
          ],
          tryIt:
            'You replace your avatar, the upload succeeds, but the page still shows the old face. Storage clearly has the new bytes. Name the cause in one word and the fix in one word. (Cause: cache. Fix: cache-busting — append `?v=${Date.now()}` to the rendered URL.)',
          takeaway:
            'upload(path, file, { upsert, cacheControl, contentType }), getPublicUrl(path), and remove([paths]) do everything. Build paths as ${userId}/${crypto.randomUUID()}.webp to defeat collisions, unicode, and traversal; use a stable path plus cache-busting only for the single avatar.',
        },
        {
          id: 'm7-t5',
          title: 'Compress and re-encode BEFORE upload — because transformations are paid',
          explain:
            'Shrink and convert every image to WebP in the browser before it ever reaches Storage, because Supabase\'s on-the-fly image transformations are a paid Pro feature and we have no card.',
          analogy:
            'Sending a 4 MB phone photo to display a 300px thumbnail is like hauling a whole jackfruit to the santhe when the buyer wanted one bulb. You pay to carry it, they wait while it arrives, and most of it is thrown away. Cut it at home, carry the one bulb, and everyone is faster and lighter.',
          theory:
            'A modern phone photo is 3–6 MB and four thousand pixels wide. An artist card shows it at maybe 400 pixels. Uploading the original wastes your 1 GB storage budget, chews the 5 GB monthly bandwidth every time it is viewed, and makes the page crawl on the exact 4G connection your Kundapura buyers are on. The obvious fix is a server-side image CDN that resizes on the fly — and Supabase has one, **image transformations**, where you append `?width=400` to a render URL and get a resized image back. But that feature lives on the **paid Pro plan**. Under NFR N1 (zero cost, no card) it is off the table. So we do the resizing **before upload, in the browser**, for free.\n\nThe rule is: **cap the long edge and re-encode to WebP, client-side, then upload the small result.** Concretely, cap the longest edge at around **1600px** (large enough for a full-screen artwork view, small enough to be tiny) and re-encode to **WebP at ~0.8 quality**. WebP is dramatically smaller than JPEG at the same visual quality and is supported by every browser that matters. The outcome is routine and a little startling the first time: a **4 MB phone photo becomes roughly 200 KB** — a twenty-fold reduction — with no visible loss on screen. That one step does more for perceived performance than any CDN, and it costs nothing.\n\nThere are two ways to do it. The dependency-free way is a **`<canvas>`**: load the file into an `Image`, draw it onto a canvas scaled to the capped dimensions, and call `canvas.toBlob(cb, \'image/webp\', 0.8)` to get the compressed blob. The library way is **`browser-image-compression`**, a small package that wraps this (with a web-worker option so the UI does not freeze on huge images) behind `imageCompression(file, { maxWidthOrHeight: 1600, useWebWorker: true, fileType: \'image/webp\' })`. For a course project the canvas is instructive and has zero install; the library is what you would reach for in production because it handles EXIF orientation and off-main-thread work for you. Either way, the blob you hand to `.upload()` is small and already WebP, so you set `contentType: \'image/webp\'` and you are done.\n\nDo this compression in a **utility** (`utils/compressImage.js`, a pure-ish function of a File returning a Blob) and call it from the dashboard just before upload. Keep it out of the service layer: it touches no Supabase, so by the folder rules of Module 0 it is a util, and the storage service receives an already-small blob.',
          diagram: `graph TD
    SEL[User selects a 4MB photo] --> IMG[Load into an Image element]
    IMG --> CAP{Long edge > 1600px?}
    CAP -- Yes --> SCALE[Scale down to 1600px long edge]
    CAP -- No --> KEEP[Keep dimensions]
    SCALE --> CANVAS[Draw onto canvas]
    KEEP --> CANVAS
    CANVAS --> ENC["canvas.toBlob(cb,<br/>'image/webp', 0.8)"]
    ENC --> SMALL[~200KB WebP blob]
    SMALL --> UP["upload(path, blob,<br/>{ contentType: 'image/webp' })"]
    NOTE[Supabase transformations<br/>would resize server-side] -. but Pro-only, needs a card .-> X[Not used]`,
          flowExplain:
            'Everything happens in the browser before upload. The dotted box is the paid feature we deliberately replace with the free client-side path.',
          whyItMatters:
            'Image weight is the number-one cause of slow pages on mobile, and "resize on a CDN" is the expensive reflex. Doing it client-side is free, and being able to say "I cap the long edge at 1600 and re-encode to WebP at 0.8, turning a 4 MB photo into 200 KB, because server-side transforms are a paid feature" is exactly the cost-and-performance judgment senior engineers are hired for.',
          steps: [
            'Decide the budget: long edge ≤ 1600px, WebP, quality ≈ 0.8. Write it as a constant.',
            'Write `utils/compressImage.js` — a pure function taking a `File`, returning a small WebP `Blob` via canvas (or `browser-image-compression`).',
            'Call it in the dashboard immediately after the user selects a file, before handing the result to `storageService`.',
            'Set `contentType: \'image/webp\'` on the upload so browsers serve it correctly.',
            'Log the before/after byte sizes once, so you *see* the 4 MB → 200 KB reduction and trust it.',
          ],
          code: `// src/utils/compressImage.js — pure, no Supabase. A util, per Module 0's rules.
// Caps the long edge at 1600px and re-encodes to WebP at ~0.8 quality.

const MAX_EDGE = 1600;
const QUALITY = 0.8;

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);                 // free the object URL immediately
      let { width, height } = img;
      if (Math.max(width, height) > MAX_EDGE) {
        const scale = MAX_EDGE / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('WebP encode failed'))),
        'image/webp',
        QUALITY,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Not an image')); };
    img.src = url;
  });
}

// In the dashboard, just before upload:
//   const small = await compressImage(file);   // ~200KB WebP
//   await uploadArtworkImage(userId, small);   // storageService sets contentType
//
// Library alternative (handles EXIF + web worker):
//   import imageCompression from 'browser-image-compression';
//   const small = await imageCompression(file, {
//     maxWidthOrHeight: 1600, useWebWorker: true, fileType: 'image/webp',
//   });`,
          pitfalls: [
            '**Reaching for Supabase image transformations to resize.** They are a Pro (paid) feature and fail NFR N1. Fix: compress client-side before upload; it is free and works on the anon plan.',
            '**Uploading the 4 MB original "to keep full quality".** It blows storage and bandwidth and slows every view for imperceptible gain on a 400px card. Fix: 1600px WebP at 0.8 is visually identical on screen and twenty times smaller.',
            '**Compressing on the main thread for very large images.** A 12 MP canvas encode can freeze the UI for a second. Fix: use `browser-image-compression` with `useWebWorker: true`, or show a spinner while the promise resolves.',
            '**Forgetting to revoke the object URL created for the `Image`.** Each un-revoked `createObjectURL` leaks memory. Fix: call `URL.revokeObjectURL(url)` as soon as the image loads or errors.',
            '**Leaving `contentType` unset after compressing.** Storage may guess the wrong MIME type and browsers can mis-handle the file. Fix: pass `contentType: \'image/webp\'` explicitly on upload, matching what you encoded.',
          ],
          tryIt:
            'Compress one real 4 MB phone photo with the util and log `file.size` before and `blob.size` after. You should see roughly 4,000,000 → ~200,000 bytes. Now multiply: at 5 GB monthly bandwidth, how many more views does that one step buy you? (About twenty times as many.)',
          takeaway:
            'Cap the long edge at 1600px and re-encode to WebP at ~0.8 in the browser before upload, turning a 4 MB photo into ~200 KB. Supabase transformations would do this server-side but are a paid Pro feature — client-side compression is the free, card-safe equivalent and matters more than any CDN.',
        },
      ],
    },
    {
      id: 'm7-s2',
      title: 'Create and edit the artist profile',
      topics: [
        {
          id: 'm7-t6',
          title: 'Create vs edit: does auth.uid() own a row in artists?',
          explain:
            'The dashboard\'s first job is one query: does the signed-in user already own an artists row? If not, show a create form; if so, show an edit form.',
          analogy:
            'When you walk up to the seva counter, the clerk does not ask "are you a registered devotee?" and consult a badge. They flip to your page in the register. No page means you are new — fill a fresh form. A page exists means you are returning — here is what we have, change what you like. The register is the single source of truth; there is no separate "is-registered" stamp to keep in sync.',
          theory:
            'Recall the actor model from Module 0: an "artist" is not a role stored on the user — it is a **signed-in user who owns a row in `artists` where `user_id = auth.uid()`**. The dashboard turns that definition into a branch. On mount, it runs one query: fetch the `artists` row for the current `auth.uid()`. Two outcomes. **No row** → the user has never created a profile → render the **create form** (empty fields, a "Create profile" button that inserts). **A row exists** → render the **edit form** (fields pre-filled from that row, a "Save changes" button that updates). The same form component serves both; only the initial state and the submit verb differ.\n\nThe right query is `.select(\'*\').eq(\'user_id\', user.id).maybeSingle()`. The key is **`maybeSingle()`**, not `single()`. `single()` throws an error when there are zero rows — which is the *normal, expected* state for a first-time visitor, not an error. `maybeSingle()` returns `data: null` for zero rows and the row for one, which is exactly the branch you want. Using `single()` here means every brand-new artist hits an error path on their very first visit, and beginners then "fix" it by swallowing all errors, which hides the real ones.\n\nWhy does this replace an `is_artist` flag? Because a flag is a second copy of a fact that already exists. If you stored `is_artist` on `profiles`, you would have to set it true when the artists row is created and false when it is deleted — and the first time those two operations are not perfectly paired (a failed delete, a manual row removal, a bug), the flag lies. The row itself is the fact. "Are you an artist?" is answered by "does your row exist?", which cannot disagree with itself. This is the same single-source-of-truth argument from Module 0, now made concrete in a component.\n\nThis branch also shapes the loading experience. The dashboard has the usual three states — loading (checking for the row), error (the query failed), and data — but "data" splits into two sub-states (has-row → edit, no-row → create). Render the skeleton while the row is being fetched, and only decide create-vs-edit once you actually know, so a returning artist never sees an empty create form flash before their data loads.',
          diagram: `graph TD
    M[Dashboard mounts] --> Q["select * from artists<br/>where user_id = auth.uid()<br/>.maybeSingle()"]
    Q --> L{Result}
    L -- loading --> SK[Show skeleton]
    L -- error --> ER[Show error + retry]
    L -- "data = null" --> CREATE[Render CREATE form<br/>empty fields, insert on submit]
    L -- "data = row" --> EDIT[Render EDIT form<br/>prefilled, update on submit]
    NOTE[No is_artist flag anywhere:<br/>the row's existence IS the answer] -.-> L`,
          flowExplain:
            'One query, one branch. maybeSingle() makes "no row" a clean null rather than a thrown error, so a first-time artist flows straight into the create form.',
          whyItMatters:
            'Deriving state from data instead of duplicating it into a flag is a core engineering instinct, and this dashboard is the cleanest possible example. Interviewers love "why no is_artist boolean?" because the answer — a flag is a second source of truth that will eventually drift — separates people who have maintained a real system from people who have not.',
          steps: [
            'On dashboard mount, query `artists` by `user_id = auth.uid()` using `.maybeSingle()`.',
            'Treat `data === null` as "no profile yet" → create form; a returned row → edit form pre-filled from it.',
            'Never use `.single()` here — zero rows is expected, not an error.',
            'Render a skeleton until the query resolves, so a returning artist never sees a create form flash.',
            'Convince yourself no `is_artist` column is needed: the row\'s existence is the entire answer.',
          ],
          code: `// src/hooks/useMyArtistProfile.js — the create-vs-edit decision, once.
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { useSession } from '../contexts/SessionContext';

export function useMyArtistProfile() {
  const { user } = useSession();
  const [data, setData] = useState(null);      // null = no profile yet
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from('artists')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()                            // NOT single(): zero rows is normal
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error);
        else setData(data);                     // data is the row, or null
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [user]);

  return { data, loading, error };
}

// In DashboardPage:
//   const { data: profile, loading, error } = useMyArtistProfile();
//   if (loading) return <DashboardSkeleton />;
//   if (error)   return <ErrorState onRetry={...} />;
//   return <ProfileForm mode={profile ? 'edit' : 'create'} initial={profile} />;
//   // one component, two modes. "artist" is spelled: this row exists.`,
          pitfalls: [
            '**Using `.single()` to fetch the profile.** It throws on zero rows, so every first-time artist hits an error on their first visit. Fix: `.maybeSingle()`, which returns `null` for zero rows.',
            '**Adding an `is_artist` boolean to speed up the check.** It is a second source of truth that drifts the moment a create or delete is not perfectly mirrored. Fix: derive artist-ness from the row\'s existence.',
            '**Deciding create-vs-edit before the query resolves.** You flash an empty create form at a returning artist. Fix: show a skeleton until `loading` is false, then branch.',
            '**Swallowing the query error to "make the create form show".** Now a genuine failure (RLS misconfigured, network down) looks like "new user". Fix: keep a real error state; only `data === null` means "no profile".',
            '**Querying by `id` instead of `user_id`.** The artists `id` is the row\'s own uuid, not the user\'s; matching on it returns nothing. Fix: filter on `user_id = auth.uid()`.',
          ],
          tryIt:
            'A returning artist reports that the dashboard sometimes flashes a blank "Create profile" form before showing their data. Which line causes it, and what is the fix? (The component decided create-vs-edit before `loading` was false; gate the branch behind the skeleton until the `maybeSingle()` query resolves.)',
          takeaway:
            'The dashboard branches on one query — .maybeSingle() on artists by user_id — showing a create form when the row is null and an edit form when it exists. The row\'s existence replaces any is_artist flag, because a flag is a second truth that eventually lies.',
        },
        {
          id: 'm7-t7',
          title: 'The profile form: controlled fields, validation, and never losing the bio',
          explain:
            'A controlled form object holds every field, validates on blur and on submit, disables the button while saving, and — critically — keeps the user\'s typed bio if the save fails.',
          analogy:
            'A good seva-counter clerk does not tear up your half-filled form because one box was wrong. They point at the box, you fix it, and everything else you wrote stays. A form that clears itself on the smallest error is a clerk who makes you start over every time — nobody comes back to that counter.',
          theory:
            'The profile has many fields: `display_name`, `bio`, `years_experience`, `base_price`, `is_negotiable`, `phone`, `whatsapp`, and social links (`instagram`, `facebook`, `website`), plus `availability`. Hold them in **one controlled state object**, `form`, with a single `update(field, value)` handler, rather than a `useState` per field — one object is easier to reset, submit, and reason about. Each input is *controlled*: its `value` comes from `form`, its `onChange` calls `update`. That means React state is the single source of truth for what the user has typed, which is exactly what lets you preserve it across a failed save.\n\nValidation happens at two moments, and the two feel different to the user. **Blur validation** fires when a field loses focus: the user finishes typing their phone, tabs away, and immediately sees "Enter a 10-digit number" if it is wrong — quiet, per-field, non-nagging. **Submit validation** runs the whole rule set at once when they press the button, and blocks the save if anything fails. Track a `touched` set so you only show a field\'s error *after* it has been blurred or a submit attempted — showing "required" on an empty field the instant the form loads is hostile. Per-field rules for KalaKaara: `display_name` required and non-trivial; `bio` within a length range; `years_experience` a non-negative integer; `base_price` a non-negative number; `phone`/`whatsapp` valid Indian mobile numbers; social links well-formed URLs when present.\n\nThe submit lifecycle guards against the classic double-submit. Keep a `pending` boolean; set it true when the save starts, disable the submit button while it is true, and clear it in a `finally`. A disabled button while pending stops the artist from clicking twice and creating two rows or two uploads. Show a spinner or "Saving…" so the disabled state is explained rather than mysterious.\n\nAnd the rule that separates a form people tolerate from one they abandon: **if the save fails, do not touch `form`.** Because the fields are controlled from state and you only clear that state on *success*, a failed insert or update leaves every character the artist typed exactly where it was — the 300-word bio survives, they read the error, fix the one problem, and resubmit. The failure mode to avoid is optimistically clearing the form or navigating away before the promise resolves; do neither until you have confirmed success.',
          diagram: `graph TD
    T[User types] --> ST[Controlled form object<br/>update field value]
    ST --> BL{Field blurred?}
    BL -- yes --> FV[Validate that field<br/>show error if touched]
    SUB[Press Save] --> ALL[Validate ALL fields]
    ALL -- invalid --> SHOW[Show errors, do not submit]
    ALL -- valid --> PEND[pending = true<br/>disable button]
    PEND --> SAVE[insert or update]
    SAVE -- success --> DONE[Clear pending, toast, maybe redirect]
    SAVE -- failure --> KEEP["Clear pending, show error,<br/>KEEP the form object intact"]`,
          flowExplain:
            'The bottom-right box is the one that matters: on failure you clear only the pending flag and surface the error — the form object, and the bio in it, is never wiped.',
          whyItMatters:
            'Form quality is where users decide whether an app respects them. Preserving input on failure, validating on blur not on every keystroke, and disabling the button while pending are the exact details that separate a professional form from a student one — and they come up in every front-end interview and code review.',
          steps: [
            'Hold all fields in one controlled `form` object with a single `update(field, value)` handler.',
            'Track a `touched` set; show a field\'s error only after it is blurred or a submit is attempted.',
            'Validate per-field on blur and the whole set on submit; block submit if anything is invalid.',
            'Keep a `pending` flag; disable the submit button and show "Saving…" while it is true; clear it in `finally`.',
            'On failure, clear only `pending` and show the error — never mutate `form`, so the typed bio survives.',
          ],
          code: `// A trimmed profile form showing the shape. Controlled object + blur validation.
function ProfileForm({ mode, initial, onSaved }) {
  const { user } = useSession();
  const [form, setForm] = useState(() => ({
    display_name: '', bio: '', years_experience: '', base_price: '',
    is_negotiable: false, phone: '', whatsapp: '', instagram: '',
    facebook: '', website: '', availability: 'available',
    ...initial,                                   // edit mode prefills from the row
  }));
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const blur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validateField(field, form[field]) }));
  };

  async function handleSubmit(evt) {
    evt.preventDefault();
    const all = validateAll(form);               // { field: message } for failures
    setErrors(all);
    setTouched(Object.fromEntries(Object.keys(form).map((k) => [k, true])));
    if (Object.values(all).some(Boolean)) return; // block: something is invalid

    setPending(true);
    setSaveError(null);
    try {
      const saved = await saveArtistProfile(user.id, form, mode); // insert or update
      onSaved(saved);                            // success: NOW we may clear/redirect
    } catch (err) {
      setSaveError(err.message);                 // failure: form is left untouched...
    } finally {
      setPending(false);                         // ...only pending is reset
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <textarea
        value={form.bio}                          // controlled: survives a failed save
        onChange={(e) => update('bio', e.target.value)}
        onBlur={() => blur('bio')}
      />
      {touched.bio && errors.bio && <p className="err">{errors.bio}</p>}
      {/* ...other fields... */}
      {saveError && <p className="err">{saveError}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Saving…' : mode === 'create' ? 'Create profile' : 'Save changes'}
      </button>
    </form>
  );
}`,
          pitfalls: [
            '**Clearing the form (or navigating away) before the save resolves.** A failed insert then loses the whole bio. Fix: clear or redirect only inside the success branch, never optimistically.',
            '**A `useState` per field.** Ten fields become ten setters, and reset/submit logic sprawls. Fix: one controlled object plus a single `update(field, value)`.',
            '**Validating on every keystroke.** "Invalid phone" flashes while the user is still typing the second digit. Fix: validate on blur and on submit; gate error display behind a `touched` flag.',
            '**Leaving the submit button enabled during the save.** An impatient double-click creates two rows or two uploads. Fix: disable while `pending` and show "Saving…".',
            '**Using an uncontrolled input (defaultValue / refs) for the bio.** Then React does not hold the text and you cannot reliably preserve or reset it. Fix: controlled inputs, value driven from `form`.',
          ],
          tryIt:
            'Simulate a failed save (throw inside `saveArtistProfile`). Confirm the 300-word bio is still in the textarea afterwards. Then move the state-clearing line into the `catch` by mistake and watch the bio vanish — that one misplaced line is the difference between a form people trust and one they abandon.',
          takeaway:
            'Hold the profile in one controlled object, validate on blur and on submit, disable the button while pending, and clear the form only on success — so a failed save never wipes the artist\'s carefully typed bio.',
        },
        {
          id: 'm7-t8',
          title: 'Slugs: generation, collisions, immutability, and error 23505',
          explain:
            'Turn a display name into a clean URL slug, resolve collisions with a numeric suffix, enforce uniqueness in the database, and treat a published slug as permanent.',
          analogy:
            'A slug is a shop\'s street address. "Rukmini Shetty" becomes `rukmini-shetty`, and that address goes on every business card, every WhatsApp forward, every Google result. If two shops want the same address, the second becomes `rukmini-shetty-2`. And once cards are printed and the address is on Google, you do not renumber the street — every card and every search would point at an empty plot.',
          theory:
            'A **slug** is the human-readable id in a URL: `/artists/rukmini-shetty` instead of `/artists/9f3c-uuid`. It is prettier, shareable, and good for SEO. You generate it from the display name with a `slugify` step: lowercase, transliterate or strip accents, replace any run of non-alphanumeric characters with a single hyphen, and trim leading/trailing hyphens. `slugify(\'Rukmini Shetty\')` → `rukmini-shetty`; `slugify(\'Ganesh Acharya & Sons\')` → `ganesh-acharya-sons`.\n\nTwo Rukmini Shettys will collide. **Collision resolution** appends a numeric suffix: the first is `rukmini-shetty`, the second becomes `rukmini-shetty-2`, the third `rukmini-shetty-3`. You could pre-check by querying "does this slug exist?" and counting, but that check-then-insert has a race: two signups a millisecond apart both see "free" and both try `rukmini-shetty`. So the check is a *convenience*, and the real guarantee lives in the database.\n\n**Enforce uniqueness with a DB constraint** — `unique` on the `slug` column. Now the database itself refuses a duplicate, race or no race, and when it does, PostgREST returns Postgres error code **`23505`** (unique_violation). You handle that specific code: catch the error, check `error.code === \'23505\'`, bump the suffix (`-2`, `-3`, …), and retry the insert. Handling `23505` specifically — rather than treating every error the same — is what lets you distinguish "this slug is taken, try the next number" from "the database is down, tell the user". A retry loop of two or three attempts covers every realistic case.\n\nNow the rule that must be a rule: **a published slug is immutable.** Once an artist is live, `rukmini-shetty` is printed on cards, forwarded on WhatsApp, and indexed by Google. Change it to `rukmini-shetty-art` and *every one of those links 404s* — the shared profile is dead, the Google result points at nothing, and there is no automatic redirect. So: generate the slug once, at creation, from the name at that moment; and when the artist later edits their display name, **do not regenerate the slug.** The edit form updates `display_name` freely but leaves `slug` alone. If you ever must change a slug, it is a deliberate migration with an old→new redirect, not a side effect of renaming — and for this course, the answer is simply "you don\'t".',
          diagram: `graph TD
    N["display_name: 'Rukmini Shetty'"] --> SL["slugify -> 'rukmini-shetty'"]
    SL --> INS["insert artists with slug"]
    INS --> R{Result}
    R -- success --> LIVE["Slug is now permanent<br/>(printed, shared, indexed)"]
    R -- "error.code 23505" --> BUMP["Append -2, -3, ...<br/>retry insert"]
    BUMP --> INS
    LIVE --> EDIT[Artist later renames themselves]
    EDIT --> KEEP["Update display_name only<br/>slug is NEVER regenerated"]`,
          flowExplain:
            'The 23505 branch is the collision handler: the DB constraint, not the pre-check, is the real guarantee. The bottom branch is the immutability rule — a rename updates the name, never the slug.',
          whyItMatters:
            'Slugs sit at the intersection of UX, SEO, and data integrity, and "why are slugs immutable?" plus "how do you handle a unique-violation race?" are common interview questions. Knowing that the constraint is the guarantee and 23505 is the signal — not a pre-check — shows you understand that databases, not application code, enforce invariants.',
          steps: [
            'Write `utils/slugify.js`: lowercase, strip/transliterate accents, collapse non-alphanumerics to single hyphens, trim edge hyphens.',
            'Add a `unique` constraint on `artists.slug` so the database guarantees uniqueness.',
            'On insert, generate the base slug; on a `23505` error, append `-2`, `-3`, … and retry a few times.',
            'Generate the slug once at creation only. In the edit form, update `display_name` but leave `slug` untouched.',
            'Write down the immutability rule where you will see it: changing a live slug breaks every shared link and Google result.',
          ],
          code: `// src/utils/slugify.js — pure function, no imports.
export function slugify(name) {
  return name
    .normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '') // strip diacritics
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')                         // non-alnum -> hyphen
    .replace(/^-+|-+$/g, '');                            // trim edge hyphens
}
// slugify('Rukmini Shetty')          -> 'rukmini-shetty'
// slugify('Ganesh Acharya & Sons')   -> 'ganesh-acharya-sons'

// src/services/artistService.js — insert with collision-safe retry on 23505.
export async function createArtistProfile(userId, form) {
  const base = slugify(form.display_name);
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : \`\${base}-\${attempt + 1}\`; // -2, -3, ...
    const { data, error } = await supabase
      .from('artists')
      .insert({ ...toRow(form), user_id: userId, slug })
      .select()
      .single();

    if (!error) return toArtist(data);          // success
    if (error.code === '23505') continue;        // slug taken -> try next suffix
    throw new Error(\`Could not create profile: \${error.message}\`); // real failure
  }
  throw new Error('Could not find a free slug after several attempts.');
}

// Edit path: update display_name freely, but NEVER regenerate the slug.
export async function updateArtistProfile(userId, form) {
  const { slug, ...editable } = form;            // drop slug: it is immutable
  const { data, error } = await supabase
    .from('artists')
    .update(toRow(editable))                      // slug not included -> unchanged
    .eq('user_id', userId)
    .select().single();
  if (error) throw new Error(\`Could not save profile: \${error.message}\`);
  return toArtist(data);
}`,
          pitfalls: [
            '**Regenerating the slug when the artist renames themselves.** Every printed card, WhatsApp forward, and Google result now 404s. Fix: generate once at creation; the edit path never touches `slug`.',
            '**Relying on a check-then-insert to avoid duplicates.** Two near-simultaneous signups both see the slug as free and collide. Fix: a `unique` DB constraint is the guarantee; the pre-check is only a nicety.',
            '**Catching every error the same way on insert.** You cannot tell "slug taken, bump it" from "database down, stop". Fix: branch on `error.code === \'23505\'` specifically and retry only for that.',
            '**Forgetting to trim edge hyphens or collapse runs.** `slugify(\'  Ravi!! \')` yielding `-ravi--` produces ugly, sometimes duplicate URLs. Fix: collapse non-alnum runs to one hyphen and trim both ends.',
            '**Putting the slug in a hidden, editable form field.** A user (or a bug) can then change it on save. Fix: never send `slug` from the edit form; strip it in the service before the update.',
          ],
          tryIt:
            'Two artists both named "Shalini Kamath" sign up. Trace the slugs each receives and the error code that drives the second one. (First: `shalini-kamath` inserts cleanly. Second: the insert hits the unique constraint, PostgREST returns `23505`, the loop retries with `shalini-kamath-2`, which succeeds.)',
          takeaway:
            'Generate a slug from the display name, resolve collisions with a numeric suffix driven by the 23505 unique-violation code and a DB constraint, and treat a published slug as immutable — a rename updates the name, never the slug, because changing it breaks every shared link and Google result.',
        },
        {
          id: 'm7-t9',
          title: 'Editing many-to-many: categories and languages, naive vs diff',
          explain:
            'A multi-select for categories and languages writes to the join tables artist_categories and artist_languages — and for this app the naive delete-all-then-insert-all is the right call.',
          analogy:
            'Updating which sevas a counter offers: the simplest reliable method is to wipe the little slate clean and rewrite today\'s full list. It is not the cleverest — you rewrite three sevas that did not change — but with five sevas nobody notices, and there is no chance of the slate disagreeing with reality. Only when the list runs to hundreds, or someone is watching each line, does rewriting the whole slate start to cost something.',
          theory:
            'An artist works in several **categories** (portrait, mural, calligraphy) and several **languages** (Kannada, Tulu, English). These are many-to-many relationships, so from Module 4 they live in **join tables**: `artist_categories(artist_id, category_id)` and `artist_languages(artist_id, language_id)`, each row a single pairing. The UI is a multi-select — a set of checkboxes or chips — whose value is an array of selected ids. On save you must make the join table match that array.\n\nThere are two strategies. The **naive** one: delete every existing join row for this artist, then insert one row per selected id. Two statements, dead simple, obviously correct. The **diff-based** one: compare the newly selected set against the currently stored set, compute which ids were *added* and which were *removed*, then insert only the additions and delete only the removals. More code, more correct-looking, and it touches fewer rows.\n\nFor KalaKaara, **the naive version is fine, and choosing it deliberately is the point.** An artist has maybe three to eight categories and two to four languages. Deleting eight rows and inserting eight rows is trivial for Postgres, runs inside one request, and has zero chance of the "I updated the diff wrong and now the sets disagree" class of bug. Reaching for the diff here is over-engineering — solving a scale problem you do not have at the cost of code you have to maintain.\n\nSo where does naive stop being fine? Three places, and naming them is what turns "I used the easy way" into "I chose the easy way". **Scale:** if the join had hundreds or thousands of rows per parent, delete-all-insert-all rewrites the world on every save — then diff. **Foreign-key fan-out:** if other rows referenced these join rows (unlikely for a pure link table, but possible), deleting them would cascade or orphan those dependents — then you must preserve unchanged rows, i.e. diff. **Auditing/timestamps:** if each join row carried a `created_at` you wanted to mean "when this pairing began", delete-all resets it every save and lies — then diff to keep untouched rows untouched. None of those apply here, so naive wins. One caution even for naive: wrap the delete and the insert so a failure does not leave the artist with *no* categories — ideally a single RPC/transaction, or at minimum insert-then-verify before trusting the result.',
          diagram: `graph TD
    UI[Multi-select value:<br/>array of selected ids] --> SAVE[Save]
    SAVE --> STRAT{Which strategy?}
    STRAT -- "naive (this app)" --> DEL["delete all artist_categories<br/>where artist_id = me"]
    DEL --> INS["insert one row per selected id"]
    STRAT -- "diff (only at scale)" --> COMP["added = new - old<br/>removed = old - new"]
    COMP --> IA[insert added]
    COMP --> DR[delete removed]
    NAIVE_OK[Fine when: few rows,<br/>no FK dependents, no per-row timestamps] -.-> DEL`,
          flowExplain:
            'For a handful of categories, the left path is correct and boring. The right path only earns its complexity at scale, with FK dependents, or with meaningful per-row timestamps.',
          whyItMatters:
            'Knowing when the simple solution is correct — and being able to state the exact conditions under which it stops being correct — is more valuable than always reaching for the clever one. "I used delete-all-insert-all because there are under ten rows and no dependents; I would switch to a diff at scale or if the rows had meaningful timestamps" is a senior answer.',
          steps: [
            'Model the multi-select value as an array of ids; the UI writes to `artist_categories` / `artist_languages`.',
            'Implement the naive save: delete all join rows for the artist, then insert one per selected id.',
            'Wrap delete+insert so a mid-way failure cannot leave the artist with zero categories (transaction/RPC or verify).',
            'Write the three conditions where naive stops being fine: large row counts, FK dependents on the join rows, meaningful per-row timestamps.',
            'Confirm none apply here, and record that you chose naive on purpose.',
          ],
          code: `// src/services/artistService.js — set an artist's categories the naive way.
// Few rows, no dependents, no meaningful timestamps -> delete-all + insert-all.

export async function setArtistCategories(artistId, categoryIds) {
  // 1. Clear the current set.
  const { error: delErr } = await supabase
    .from('artist_categories')
    .delete()
    .eq('artist_id', artistId);
  if (delErr) throw new Error(\`Could not clear categories: \${delErr.message}\`);

  if (categoryIds.length === 0) return;          // an artist may have none

  // 2. Insert the new set in one batch.
  const rows = categoryIds.map((category_id) => ({ artist_id: artistId, category_id }));
  const { error: insErr } = await supabase.from('artist_categories').insert(rows);
  if (insErr) throw new Error(\`Could not set categories: \${insErr.message}\`);
}

// Safer still: do both inside one Postgres function so a failure cannot
// leave the artist with zero categories. Call it with a single rpc:
//
//   create or replace function set_artist_categories(p_artist uuid, p_ids uuid[])
//   returns void language plpgsql security invoker as $$
//   begin
//     delete from artist_categories where artist_id = p_artist;
//     insert into artist_categories (artist_id, category_id)
//     select p_artist, unnest(p_ids);
//   end $$;
//
//   await supabase.rpc('set_artist_categories', { p_artist: id, p_ids: ids });
//
// languages are identical: swap the table and column names.`,
          pitfalls: [
            '**Reaching for a diff when there are eight rows.** You write and maintain more code to solve a scale problem you do not have. Fix: use naive delete-all-insert-all; note the conditions that would change your mind.',
            '**Deleting the old rows and then failing the insert.** The artist is left with zero categories. Fix: wrap both in one transaction/RPC, or verify the insert before trusting it.',
            '**Assuming naive is always fine.** At thousands of rows, with FK dependents, or with meaningful `created_at` per pairing, it rewrites or corrupts state. Fix: switch to a diff exactly then, and not before.',
            '**Inserting duplicate pairings.** Without a unique constraint on `(artist_id, category_id)`, a double-submit doubles the rows. Fix: add a composite unique constraint; the join is a set.',
            '**Forgetting the empty case.** If the artist deselects everything, an `insert([])` may error. Fix: return early when the selected array is empty, after the delete.',
          ],
          tryIt:
            'Your join table grows a `featured_order integer` column so an artist can rank their categories. Does delete-all-insert-all still work? (No — it throws the ordering away on every save. This is the "meaningful per-row data" condition; now you must diff, updating only changed rows and preserving `featured_order` on the rest.)',
          takeaway:
            'Write the multi-select to the join tables with delete-all-then-insert-all — the naive strategy is correct for a handful of rows with no dependents or meaningful timestamps. Switch to a diff only when scale, FK fan-out, or per-row data makes rewriting the whole set costly.',
        },
        {
          id: 'm7-t10',
          title: 'Avatar and cover upload: preview, progress, and the two-step write',
          explain:
            'A controlled file input with client-side validation, a local preview via createObjectURL, an upload indicator, and the two-step write — upload the object, then update the row\'s avatar_url.',
          analogy:
            'Framing a portrait for the shop wall is two acts, not one. First you hang the frame (upload the image). Then you write the label underneath saying "this is Rukmini\'s" (update the row to point at it). If you hang the frame but never write the label, the picture is on the wall but no visitor is directed to it. The two acts must both complete, and if the second fails, the wall quietly disagrees with the labels.',
          theory:
            'Uploading an avatar or cover has a satisfying front end and a subtle back end. The front end: a **controlled file input**, client-side validation, and an instant preview. Validate before you upload anything — check the MIME **type** (accept `image/*`, reject a PDF) and the **size** (reject a 20 MB file before it wastes bandwidth) — and reject with a clear message, not a silent failure. Then show a **preview** immediately with `URL.createObjectURL(file)`, which creates a local blob URL the browser can render without any network round-trip, so the artist sees their photo the instant they pick it. Crucially, **revoke that URL** with `URL.revokeObjectURL` once you no longer need it (on unmount, or when they pick a different file), or each pick leaks memory. While the upload runs, show a **progress indicator** — at minimum a spinner and a disabled control; the compressed WebP is small so it is quick, but the artist should never wonder whether their click registered.\n\nNow the back end, which is the real lesson: **it is two writes, not one.** Step one uploads the object to Storage (`avatars/${userId}/avatar.webp`). Step two updates the `artists` row so `avatar_url` points at the new public URL. These are two separate operations against two separate systems (Storage, then the database), and **either can succeed while the other fails.** The dangerous case is: step one succeeds (the file is in Storage) but step two fails (the network drops before the row update). Now Storage holds a file the row does not reference — an orphan — and the artist still sees their old avatar because the row still points at it.\n\nWhat makes this *converge* — self-heal toward correctness — is the **stable path** from Topic 4. Because the avatar always lives at exactly `${userId}/avatar.webp` with `upsert: true`, a failed step two is fully recoverable: the artist simply saves again, step one overwrites the same object, step two retries the same row update, and the system lands in the correct state. There is no accumulating pile of orphans, because every attempt targets the identical path. Contrast this with a random path per attempt, which would leave one orphan per failed save. So the design choice "avatar has a stable path" is not just about cache-busting — it is what makes the two-step write **idempotent and self-correcting**. Order the steps upload-then-update (never update the row to a URL whose object does not exist yet), surface a clear error if step two fails, and let the artist retry.',
          diagram: `graph TD
    PICK[Artist picks a file] --> VAL{Valid type and size?}
    VAL -- no --> REJ[Reject with a message]
    VAL -- yes --> PREV["Preview via createObjectURL<br/>(revoke it later)"]
    PREV --> CMP[Compress to WebP]
    CMP --> S1["STEP 1: upload to<br/>avatars/{uid}/avatar.webp<br/>upsert: true"]
    S1 -- fails --> E1[Show error, nothing changed, retry]
    S1 -- ok --> S2["STEP 2: update artists row<br/>avatar_url = publicUrl?v=..."]
    S2 -- ok --> DONE[Avatar shown everywhere]
    S2 -- fails --> ORPH["File in Storage, row not updated.<br/>Stable path -> just save again<br/>and it converges"]`,
          flowExplain:
            'The bottom-right branch is the whole point: step-two failure leaves a harmless, self-healing mismatch because the stable path means a retry overwrites the same object and re-runs the same row update.',
          whyItMatters:
            'Any write that spans two systems — object storage and a database, or a database and a payment provider — has this "what if the second half fails?" problem, and it is a favourite distributed-systems interview topic. Recognising the two-step nature, choosing a design that converges on retry, and ordering the steps safely is exactly the reasoning that prevents silent data corruption in production.',
          steps: [
            'Use a controlled file input; validate MIME type and size **before** doing anything else.',
            'Preview instantly with `URL.createObjectURL(file)`, and `revokeObjectURL` on unmount or reselect.',
            'Show a spinner / disabled state while the upload runs.',
            'Do the two-step write in order: (1) upload the object to Storage, then (2) update the row\'s `avatar_url`.',
            'Use the stable avatar path with `upsert: true` so a failed step two converges on the next save; surface a retryable error.',
          ],
          code: `function AvatarUploader({ currentUrl, onUpdated }) {
  const { user } = useSession();
  const [preview, setPreview] = useState(currentUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const previewUrlRef = useRef(null);

  useEffect(() => () => {                          // revoke on unmount -> no leak
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  async function onPick(evt) {
    const file = evt.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Please choose an image.');
    if (file.size > 20 * 1024 * 1024) return setError('Image must be under 20 MB.');
    setError(null);

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const localUrl = URL.createObjectURL(file);    // instant local preview
    previewUrlRef.current = localUrl;
    setPreview(localUrl);

    setBusy(true);
    try {
      const small = await compressImage(file);              // Topic 5
      const publicUrl = await uploadAvatar(user.id, small); // STEP 1: to Storage
      await updateArtistAvatar(user.id, publicUrl);         // STEP 2: to the row
      onUpdated(publicUrl);
    } catch (err) {
      // If STEP 2 failed, the file is in Storage but the row is stale.
      // Because the path is stable, saving again overwrites and retries -> converges.
      setError(\`Upload failed — please save again. (\${err.message})\`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {preview && <img src={preview} alt="Avatar preview" />}
      <input type="file" accept="image/*" onChange={onPick} disabled={busy} />
      {busy && <span>Uploading…</span>}
      {error && <p className="err">{error}</p>}
    </div>
  );
}`,
          pitfalls: [
            '**Updating the row before the upload succeeds.** The row points at an object that does not exist, so the image 404s. Fix: order it upload-then-update; only write the URL after step one returns.',
            '**Never revoking `createObjectURL` blob URLs.** Every reselect leaks memory. Fix: revoke the previous URL before creating a new one and on unmount.',
            '**Treating the two writes as one that cannot half-fail.** A dropped network between step one and step two orphans the file and staleness the row. Fix: expect it; use the stable path so a retry converges, and show a retryable error.',
            '**Skipping client-side type/size validation.** A 20 MB PDF wastes bandwidth and a Storage slot before anything rejects it. Fix: validate type and size before compressing or uploading.',
            '**Using a random path for the avatar.** Each failed step two then leaves a distinct orphan and never self-heals. Fix: stable `${userId}/avatar.webp` with `upsert: true` for the single avatar.',
          ],
          tryIt:
            'Force step two to throw (comment out the row update and raise an error). Reload: the avatar is unchanged (row is stale) but the file is in Storage. Now save again with the code working — confirm it converges to correct in one retry. Then imagine the path were random: how many orphans would three failed saves leave? (Three.)',
          takeaway:
            'Validate, preview with createObjectURL (and revoke it), show progress, then do the two-step write: upload the object, then update the row\'s avatar_url. A stable avatar path with upsert makes a failed second step self-healing — the next save overwrites the same object and converges.',
        },
      ],
    },
    {
      id: 'm7-s3',
      title: 'Manage the portfolio',
      topics: [
        {
          id: 'm7-t11',
          title: 'Artwork CRUD and the owner-only RLS subquery',
          explain:
            'Create, edit, and delete artworks — title, description, category, price, medium, dimensions, a tag chip input writing to text[], and an image — all protected by an RLS policy that checks ownership through a subquery on artist_id.',
          analogy:
            'Each artwork is a framed piece in the artist\'s own stall at the santhe. The stallholder can hang a new piece, re-price one, or take one down — but only in their own stall. The market\'s rule does not tag each frame with the owner\'s name; it checks which stall the frame is in and who rents that stall. That indirection — frame → stall → renter — is exactly the subquery the artwork policy uses.',
          theory:
            'An artwork row carries: `title`, `description`, `category` (or a `category_id`), `price`, `is_negotiable`, `medium` (oil, watercolour, charcoal…), `dimensions` (a free-text `30 × 40 cm`), `tags`, an `image_url` and its `image_path`, and an `artist_id` linking it to its artist. **Create** inserts a row after uploading the image (Topic 4); **edit** updates the row (and, if the image changes, uploads a new object and swaps the URL); **delete** removes the row and its image (Topic 12). It is ordinary CRUD, with two details worth calling out: the tag input and the ownership policy.\n\n**Tags are a `text[]` column**, and the UI is a **chip input**: the artist types a tag, presses Enter, and it becomes a removable chip; the component\'s value is a string array. Postgres stores arrays natively, so you insert `tags: [\'wedding\', \'couple\', \'acrylic\']` directly — no join table needed for free-form tags (unlike categories, which are a controlled vocabulary in their own table). Trim and de-duplicate on entry, and cap the count so nobody pastes an essay.\n\nThe security detail is the interesting one. An artwork has **no `user_id` column** — it belongs to an *artist*, and the artist belongs to a *user*. So "may this caller modify this artwork?" cannot be answered by comparing a column to `auth.uid()` directly. It needs a hop: the artwork\'s `artist_id` must point at an `artists` row whose `user_id` is the caller. That is a **subquery**: `artist_id in (select id from artists where user_id = auth.uid())`. On **insert** it is a `with check` (you may only create artworks under your own artist row); on **update** and **delete** it is a `using` clause (you may only touch artworks under your own artist row). The `select` policy stays open (`using (true)` or gated on the artist being published) because artworks are public. Restated plainly: **an artist can touch only their own artworks because the policy resolves artist_id back to a user id through the artists table, and compares that to auth.uid().** This is the same subquery Module 0 foreshadowed in its DELETE-on-artworks exercise.',
          diagram: `graph TD
    ACT[Artist edits/deletes an artwork] --> POL{"RLS using clause"}
    POL --> SUB["artist_id in (<br/>select id from artists<br/>where user_id = auth.uid()<br/>)"]
    SUB --> RES{artwork's artist_id<br/>belongs to caller?}
    RES -- yes --> OK[Allowed]
    RES -- no --> NO[Denied by RLS]
    READ[Anyone] --> RP["select policy using (true)"]
    RP --> PUB[Artworks are public]
    TAGS[Chip input] --> ARR["tags text array<br/>['wedding','couple']"]
    ARR --> INS[Stored natively, no join table]`,
          flowExplain:
            'The subquery is the whole ownership check: an artwork has no user_id, so the policy resolves artist_id back through the artists table to a user id and compares it to auth.uid().',
          whyItMatters:
            'Ownership-through-a-relationship is the most common non-trivial RLS pattern — the owned row is one hop from the user. Being able to write `artist_id in (select id from artists where user_id = auth.uid())` and explain why the direct column comparison does not work is a concrete, frequently-tested Supabase skill.',
          steps: [
            'Model the artwork row: title, description, category, price, is_negotiable, medium, dimensions, tags `text[]`, image_url, image_path, artist_id.',
            'Build a chip input for tags whose value is a de-duplicated, trimmed, capped string array written to the `text[]` column.',
            'Write the artwork `select` policy open (public), and `insert` as a `with check` subquery on `artist_id`.',
            'Write `update` and `delete` as `using` subqueries: `artist_id in (select id from artists where user_id = auth.uid())`.',
            'Test that a second signed-in user cannot edit or delete your artwork — the subquery denies them.',
          ],
          code: `-- RLS on artworks. No user_id column here: ownership is one hop away.

create policy "artworks are publicly readable"
  on public.artworks for select
  to anon, authenticated
  using ( true );                                  -- public portfolios

create policy "artists insert their own artworks"
  on public.artworks for insert
  to authenticated
  with check (
    artist_id in (select id from artists where user_id = auth.uid())
  );

create policy "artists update their own artworks"
  on public.artworks for update
  to authenticated
  using (
    artist_id in (select id from artists where user_id = auth.uid())
  );

create policy "artists delete their own artworks"
  on public.artworks for delete
  to authenticated
  using (
    artist_id in (select id from artists where user_id = auth.uid())
  );

-- Create an artwork (image already uploaded via Topic 4). Tags are a text[].
-- src/services/artworkService.js
--   await supabase.from('artworks').insert({
--     artist_id: myArtistId,
--     title, description, category_id, price,
--     is_negotiable: negotiable,
--     medium, dimensions,                 // e.g. 'oil', '30 × 40 cm'
--     tags,                               // ['wedding', 'couple', 'acrylic']
--     image_url: url, image_path: path,
--   });`,
          pitfalls: [
            '**Trying to protect artworks with `user_id = auth.uid()`.** There is no `user_id` on artworks — the comparison references a missing column. Fix: hop through `artist_id in (select id from artists where user_id = auth.uid())`.',
            '**Putting the subquery in `using` on insert.** Insert has no existing row to target; ownership of a *new* artwork is a `with check`. Fix: `with check` on insert, `using` on update/delete.',
            '**Storing tags in a join table like categories.** Free-form tags do not need a controlled vocabulary; a join table is overkill. Fix: a `text[]` column, written directly; keep join tables for categories/languages.',
            '**Not de-duplicating or capping chip input.** An artist pastes fifty tags or the same tag twice. Fix: trim, lowercase, de-dupe, and cap the array on entry.',
            '**Forgetting the open `select` policy.** Without it, RLS denies reads and public visitors see no artworks. Fix: an explicit `using (true)` (or published-gated) select policy for `anon, authenticated`.',
          ],
          tryIt:
            'Sign in as a second user and try to `update` another artist\'s artwork by its id. It fails. Now read the policy and say exactly which clause stopped you. (The `using` subquery: the artwork\'s `artist_id` is not in `select id from artists where user_id = auth.uid()` for you, so no row is targetable.)',
          takeaway:
            'Artwork CRUD is ordinary except for two things: tags are a native text[] fed by a chip input, and ownership is enforced by a subquery — artist_id in (select id from artists where user_id = auth.uid()) — as with check on insert and using on update/delete, because an artwork has no user_id of its own.',
        },
        {
          id: 'm7-t12',
          title: 'Orphans, deletion order, and the publish toggle',
          explain:
            'Deleting a row does not delete its image and vice versa; delete the object first, then the row — and gate a publish toggle on required fields so nothing half-finished goes live.',
          analogy:
            'Taking a painting off the shop wall is two acts, and the order matters. Take the frame down first, then cross it off the catalogue: if crossing-off fails, the catalogue lists a piece that is gone — visible, embarrassing, easily fixed. Do it the other way — cross it off first, then fail to take it down — and a painting hangs on the wall that no catalogue knows about, quietly taking up space and, in a rented gallery, still being billed for. Always remove the physical thing first.',
          theory:
            'Storage and the database are **two independent systems**, and neither cascades into the other. **Deleting an `artworks` row does not delete the image** from Storage — the object sits there forever, still counting against your 1 GB. **Deleting the image does not delete the row** — the row survives with an `image_url` that now 404s. Consistency is *your* job, and the key decision is **order**.\n\n**Delete the object first, then the row.** Reason through both failure orderings. If you delete the object first and the row-delete then fails, you are left with a **row whose image is broken** — the artwork shows a broken thumbnail in the artist\'s own dashboard. That is **visible and fixable**: the artist sees it, retries the delete, done. If instead you delete the row first and the object-delete fails, you are left with an **object no row references** — an **orphan**. That is **invisible** (nothing in the app points to it, so nobody notices) and **billable** (it silently eats your storage quota forever). Between a loud, self-correcting failure and a silent, accumulating one, choose loud every time. Hence: object first, row second. (For extra safety, sweep for orphans periodically, but correct ordering means you rarely need to.)\n\nThe second half of the topic is the **publish toggle**. An artist row has `is_published` (default `false`, per Module 0\'s safe-boolean rule). Browse and search only ever show published artists, so publishing is the act that makes an artist discoverable. Two controls wrap it. A **required-fields gate**: before `is_published` can flip to `true`, validate that the profile is actually presentable — display name, bio, at least one category, an avatar, and at least one artwork. Block the toggle and list what is missing, so nobody publishes an empty shell that buyers will bounce off. And an **"unpublish"**: flipping `is_published` back to `false` **hides the artist from browse without deleting anything** — the profile, artworks, and images all remain, ready to be republished. Unpublish is not delete; it is a reversible curtain. This matters because an artist who is travelling, or between commissions, wants to step out of search without losing the work they built up — and because "soft hide" is almost always the right default over destructive delete.',
          diagram: `graph TD
    DEL[Delete an artwork] --> O1["STEP 1: remove([image_path])<br/>from Storage"]
    O1 -- fails --> STOP[Stop: row still intact,<br/>nothing orphaned, retry]
    O1 -- ok --> O2["STEP 2: delete the artworks row"]
    O2 -- fails --> BROKEN["Broken image on a row:<br/>VISIBLE + fixable (retry)"]
    O2 -- ok --> CLEAN[Consistent: gone from both]
    WRONG["Wrong order: row first"] -. if object-delete then fails .-> ORPH["Orphan object:<br/>INVISIBLE + billable forever"]
    PUB[Publish toggle] --> GATE{Required fields present?}
    GATE -- no --> LIST[Block + list what's missing]
    GATE -- yes --> ON[is_published = true -> discoverable]
    ON --> UNPUB["Unpublish: is_published = false<br/>hides from browse, deletes nothing"]`,
          flowExplain:
            'Object-first deletion turns any failure into a visible, fixable broken image rather than an invisible, billable orphan. The publish path gates going live on required fields and makes unpublish a reversible hide, not a delete.',
          whyItMatters:
            'Cross-system consistency and the "soft hide vs hard delete" decision are everyday production concerns, and the reasoning — order operations so failures are visible and cheap, never invisible and accumulating — generalises to files-and-rows, caches-and-databases, and payments-and-orders. It is exactly the judgment that keeps a real system from silently rotting.',
          steps: [
            'Internalise that Storage and the database do not cascade: deleting a row leaves the image; deleting the image leaves the row.',
            'Delete in order: `remove([image_path])` first, then delete the `artworks` row.',
            'Justify the order out loud: a failed row-delete is a visible broken image; a failed object-delete after a row-delete is an invisible billable orphan.',
            'Gate the publish toggle: validate required fields (name, bio, a category, an avatar, ≥1 artwork) before allowing `is_published = true`, and list what is missing otherwise.',
            'Implement unpublish as `is_published = false` — hides from browse, deletes nothing, fully reversible.',
          ],
          code: `// src/services/artworkService.js — delete object FIRST, then row.
export async function deleteArtwork(artwork) {
  // STEP 1: remove the Storage object. If this fails, we stop here and the
  // row stays intact — nothing is orphaned, the artist can retry.
  const { error: rmErr } = await supabase
    .storage.from('artworks').remove([artwork.image_path]);
  if (rmErr) throw new Error(\`Could not remove image: \${rmErr.message}\`);

  // STEP 2: delete the row. If THIS fails, we have a visible broken-image
  // row (fixable on retry) — never an invisible, billable orphan object.
  const { error: rowErr } = await supabase
    .from('artworks').delete().eq('id', artwork.id);
  if (rowErr) throw new Error(\`Image removed, but row delete failed: \${rowErr.message}\`);
}

// src/services/artistService.js — publish is gated; unpublish just hides.
export function missingForPublish(profile, artworkCount) {
  const missing = [];
  if (!profile.display_name?.trim()) missing.push('a display name');
  if (!profile.bio?.trim())          missing.push('a bio');
  if (!profile.avatar_url)           missing.push('an avatar');
  if (!profile.category_count)       missing.push('at least one category');
  if (artworkCount < 1)              missing.push('at least one artwork');
  return missing;                                   // [] means "ready to publish"
}

export async function setPublished(artistId, next, profile, artworkCount) {
  if (next) {
    const missing = missingForPublish(profile, artworkCount);
    if (missing.length) throw new Error(\`Add \${missing.join(', ')} before publishing.\`);
  }
  const { error } = await supabase
    .from('artists').update({ is_published: next }).eq('id', artistId);
  if (error) throw new Error(\`Could not update publish state: \${error.message}\`);
  // next === false -> unpublish: hidden from browse, nothing deleted.
}`,
          pitfalls: [
            '**Deleting the row first, then the image.** A failed image-delete leaves an invisible orphan that bills you forever. Fix: object first, row second — so any failure is a visible broken image instead.',
            '**Assuming a row-delete cascades to Storage.** It never does; Storage and the database are separate systems. Fix: explicitly `remove([path])` — and store the `image_path` on the row so you can.',
            '**Publishing without a required-fields gate.** An empty profile goes live and buyers bounce. Fix: validate name, bio, avatar, a category, and ≥1 artwork before allowing `is_published = true`.',
            '**Implementing "hide me" as a delete.** The artist loses everything and cannot come back. Fix: unpublish is `is_published = false` — reversible, destroys nothing.',
            '**Not surfacing what is missing when publish is blocked.** A disabled toggle with no explanation frustrates. Fix: list the missing items ("add a bio, an avatar") so the artist knows exactly what to fix.',
          ],
          tryIt:
            'You delete an artwork row first and the subsequent object-delete throws. Describe the resulting bad state and why it is worse than the reverse ordering. (An orphan object no row references: invisible to everyone, so nobody fixes it, and it silently consumes your 1 GB quota. The reverse — object gone, row-delete failed — is a broken thumbnail the artist sees and retries.)',
          takeaway:
            'Storage and the database do not cascade, so consistency is your job: delete the object first, then the row, so a failure is a visible broken image rather than an invisible billable orphan. Gate the publish toggle on required fields, and make unpublish a reversible is_published = false that hides without deleting.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm7-p1',
      type: 'Mini Project',
      title: 'A Complete, Publishable Artist Profile',
      domain: 'Artist Dashboard & Supabase Storage',
      duration: '2 hours',
      description:
        'Build the artist dashboard end to end: three Storage buckets with correct folder-ownership policies, client-side WebP compression, an avatar, a cover, and six artworks uploaded, the full profile form with validation and slug generation, category and language multi-selects, portfolio CRUD, and a publish toggle gated on required fields. Then prove the security holds by confirming a second signed-in user cannot upload into your folder.',
      tools: ['React', 'Vite', 'Supabase', 'Supabase Storage', 'PostgreSQL', 'RLS'],
      blueprint: {
        overview:
          'By the end, one real artist profile — call her Rukmini Shetty, portrait and mural painter in Brahmavara — is created, populated with a compressed avatar, cover, and six artworks, and published. Every image is a ~200 KB WebP the artist compressed in the browser. Every write is owner-scoped by RLS. The final step is an adversarial test: a second account tries to upload into Rukmini\'s folder and is denied by the database, proving the folder-ownership policy is real and not decorative.',
        functionalRequirements: [
          '**Three public buckets with folder-ownership policies.** `avatars`, `covers`, `artworks`, each with a `using (true)` select policy and insert/update/delete policies checking `(storage.foldername(name))[1] = auth.uid()::text`.',
          '**Client-side WebP compression.** Every image is capped to a 1600px long edge and re-encoded to WebP at ~0.8 before upload, via a `utils/compressImage.js` — no paid Supabase transformations.',
          '**Create-vs-edit dashboard.** A `.maybeSingle()` query on `artists` by `user_id` decides whether to show a create or an edit form; no `is_artist` flag.',
          '**Full profile form.** display_name, bio, years_experience, base_price, is_negotiable, phone, whatsapp, instagram, facebook, website, availability — controlled, blur-validated, submit-disabled-while-pending, and preserving the bio on a failed save.',
          '**Slug generation.** `slugify(display_name)` with numeric-suffix collision handling driven by the `23505` unique-violation code and a `unique` DB constraint; the slug is immutable on edit.',
          '**Category and language multi-selects.** Writing to `artist_categories` / `artist_languages` with delete-all-then-insert-all, wrapped so a failure cannot leave the artist with none.',
          '**Portfolio CRUD + publish toggle.** Create/edit/delete six artworks (with a `text[]` tag chip input), delete the object before the row, and a publish toggle gated on required fields with a reversible unpublish.',
        ],
        technicalImplementation: [
          '**storageService.js** owns every `upload` / `getPublicUrl` / `remove` call, building paths as `${userId}/${crypto.randomUUID()}.webp` (artworks) and a stable `${userId}/avatar.webp` with `upsert: true` (avatar), setting `contentType` and `cacheControl`.',
          '**compressImage.js** is a pure util (canvas `toBlob` to `image/webp` at 0.8, revoking its object URL) called just before every upload; no Supabase import.',
          '**artistService.js / artworkService.js** map snake_case rows to camelCase, throw on error, run the slug retry loop on `23505`, do the two-step avatar write (upload then update `avatar_url`), and delete the object before the row.',
          '**RLS policies** are applied to `storage.objects` (folder-ownership per bucket) and to `artworks` (ownership via the `artist_id in (select id from artists where user_id = auth.uid())` subquery).',
          '**The dashboard** renders loading → error → (create | edit) from a `useMyArtistProfile()` hook, and gates the publish toggle with a `missingForPublish()` check that lists what is absent.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Buckets and folder-ownership RLS',
            outcome:
              'Three public buckets and twelve Storage policies enforcing per-user folder ownership.',
            prompt:
              'In my Supabase project, create three public buckets — `avatars`, `covers`, `artworks` — and write the RLS policies on `storage.objects` for each. For every bucket: a `select` policy `using (bucket_id = <bucket>)` for `anon, authenticated` (public read); an `insert` policy for `authenticated` with `with check (bucket_id = <bucket> and (storage.foldername(name))[1] = auth.uid()::text)`; and matching `update` and `delete` policies using the same expression in a `using` clause. Explain in comments why `auth.uid()` needs the `::text` cast, why the array index is `[1]` not `[0]`, and why the `bucket_id` guard is required so each policy applies to only one bucket. Give me the full SQL for all three buckets.',
          },
          {
            step: 2,
            label: 'Client-side WebP compression util',
            outcome:
              'utils/compressImage.js turning a 4 MB photo into a ~200 KB WebP in the browser.',
            prompt:
              'Write `src/utils/compressImage.js`: a pure function `compressImage(file)` that loads the file into an `Image` via `URL.createObjectURL`, scales it so the longest edge is at most 1600px, draws it onto a canvas, and calls `canvas.toBlob(cb, \'image/webp\', 0.8)` to return a compressed WebP `Blob`. Revoke the object URL as soon as the image loads or errors. Reject non-images. Add a comment explaining that this replaces Supabase image transformations (a paid Pro feature) so the app stays card-free, and log before/after sizes so I can see the ~4 MB → ~200 KB reduction. Do not import Supabase — this is a util.',
          },
          {
            step: 3,
            label: 'Storage service with safe paths and the two-step avatar write',
            outcome:
              'storageService.js and the avatar upload-then-update-row flow.',
            prompt:
              'Write `src/services/storageService.js` with three functions: `uploadArtworkImage(userId, blob)` that uploads to `artworks` at `${userId}/${crypto.randomUUID()}.webp` with `{ upsert: false, cacheControl: \'3600\', contentType: \'image/webp\' }` and returns `{ path, url }` from `getPublicUrl`; `uploadAvatar(userId, blob)` that uploads to `avatars` at the stable path `${userId}/avatar.webp` with `upsert: true` and returns the public URL with a `?v=${Date.now()}` cache-buster; and `removeArtworkImage(path)` calling `.remove([path])`. Then, in `artistService.js`, add the two-step avatar write: upload the object, THEN update the `artists` row\'s `avatar_url`. In comments, explain what happens if step two fails and why the stable path makes a retry converge. Explain why paths use a UUID rather than the original filename (collisions, unicode, path traversal).',
          },
          {
            step: 4,
            label: 'Create-vs-edit dashboard, profile form, and slugs',
            outcome:
              'The dashboard branch, the validated profile form, and 23505-safe slug generation.',
            prompt:
              'Build the dashboard. Write `useMyArtistProfile()` querying `artists` by `user_id = auth.uid()` with `.maybeSingle()`, returning `{ data, loading, error }`; render loading → error → (create form if data is null | edit form if a row exists), with no `is_artist` flag. Write a controlled `ProfileForm` for display_name, bio, years_experience, base_price, is_negotiable, phone, whatsapp, instagram, facebook, website, availability — validating on blur and on submit, disabling the submit button while pending, and preserving the form (especially the bio) if the save throws. Write `utils/slugify.js` and, in `artistService.js`, a `createArtistProfile` that generates the slug, inserts, and on Postgres error code `23505` retries with a `-2`, `-3` suffix (with a matching `unique` constraint on `artists.slug`). In the edit path, update `display_name` but never regenerate the slug; add a comment on why a live slug is immutable.',
          },
          {
            step: 5,
            label: 'Multi-selects and portfolio CRUD',
            outcome:
              'Category/language editing and six artworks created, edited, and deleted object-first.',
            prompt:
              'Add category and language multi-selects that write to `artist_categories` and `artist_languages` using delete-all-then-insert-all (`setArtistCategories(artistId, ids)` / `setArtistLanguages`), wrapped in a Postgres RPC so a failure cannot leave the artist with none; comment on the three conditions (scale, FK dependents, per-row timestamps) under which I would switch to a diff. Then build artwork CRUD: a form for title, description, category, price, is_negotiable, medium, dimensions, a tag chip input writing to a `text[]` column, and an image (compressed then uploaded via storageService). Write the `artworks` RLS policies using `artist_id in (select id from artists where user_id = auth.uid())` — `with check` on insert, `using` on update/delete, open `select`. Implement `deleteArtwork` that removes the Storage object FIRST, then the row, and explain why that order turns a failure into a visible broken image rather than an invisible billable orphan. Upload six real artworks.',
          },
          {
            step: 6,
            label: 'Publish gate, and the adversarial ownership test',
            outcome:
              'A gated publish toggle plus a proof that another user cannot upload into your folder.',
            prompt:
              'Add a publish toggle bound to `artists.is_published` (default false). Write `missingForPublish(profile, artworkCount)` returning a list of what is absent (display name, bio, avatar, at least one category, at least one artwork); block turning the toggle on until the list is empty and show the artist exactly what to add. Implement unpublish as `is_published = false` — hiding the artist from browse without deleting anything — and comment on why soft-hide beats delete. Finally, write a short adversarial test I can run signed in as a SECOND account: attempt `supabase.storage.from(\'avatars\').upload(\'<first-user-id>/avatar.webp\', file, { upsert: true })` targeting the FIRST user\'s folder, and confirm it is denied by the folder-ownership policy (the first path segment is not the second user\'s `auth.uid()`). Print the RLS error so I can see the database — not React — did the refusing.',
          },
        ],
        deliverable:
          'A working artist dashboard where one signed-in user creates a full profile — compressed avatar and cover, six WebP artworks, validated fields, an immutable slug, category and language selections — and publishes it only once required fields are present. Three public buckets carry the images under per-user folders, every write is owner-scoped by RLS, deletions remove the object before the row, and a second account is provably unable to upload into the first user\'s folder — the security enforced by Postgres, not by the UI.',
      },
    },
  ],
  quiz: [
    {
      id: 'm7-q1',
      q: 'Which expression, in a Storage RLS policy, enforces that a user may only write files into their own folder?',
      options: [
        'name.startsWith(auth.uid())',
        'owner = auth.uid() only, with no path check',
        '(storage.foldername(name))[1] = auth.uid()::text',
        'bucket_id = auth.uid()::text',
      ],
      answer: 2,
    },
    {
      id: 'm7-q2',
      q: 'Why must you never store anything private in a public Supabase Storage bucket?',
      options: [
        'Public buckets have a much smaller storage quota than private ones',
        'Every object has a permanent, tokenless URL that works for anyone forever, so a file placed there can be copied or indexed and is effectively public even after you "delete" it',
        'Public buckets do not support RLS policies at all',
        'Files in public buckets are automatically deleted after 7 days',
      ],
      answer: 1,
    },
    {
      id: 'm7-q3',
      q: 'Why does KalaKaara compress and re-encode images to WebP in the browser before uploading, rather than resizing them on demand?',
      options: [
        'Supabase image transformations are a paid Pro feature, so client-side compression keeps the app card-free while cutting a 4 MB photo to ~200 KB',
        'Browsers cannot display images larger than 1600px',
        'Supabase rejects any upload larger than 500 KB',
        'WebP is the only image format Supabase Storage accepts',
      ],
      answer: 0,
    },
    {
      id: 'm7-q4',
      q: 'When deleting an artwork, why delete the Storage object BEFORE deleting the database row?',
      options: [
        'Postgres refuses to delete a row while a referenced object still exists',
        'It is faster, because Storage deletes are quicker than row deletes',
        'The order is irrelevant since deleting the row cascades to Storage automatically',
        'A failed row-delete then leaves a visible, fixable broken image; the reverse order risks an invisible, billable orphan object that no row references',
      ],
      answer: 3,
    },
    {
      id: 'm7-q5',
      q: 'An artist profile insert fails with Postgres error code 23505. What does it mean and how do you handle it?',
      options: [
        'The database is unreachable; you should show a generic error and stop',
        'The user is not authenticated; you should redirect them to sign in',
        'A unique constraint was violated (the slug is taken); append a numeric suffix and retry the insert',
        'The row is too large; you should truncate the bio and retry',
      ],
      answer: 2,
    },
    {
      id: 'm7-q6',
      q: 'Why is a published artist slug treated as immutable, so that renaming the artist does not regenerate it?',
      options: [
        'Supabase forbids updating any column that has a unique constraint',
        'The slug is printed on cards, forwarded on WhatsApp, and indexed by Google, so changing it 404s every shared link and search result with no automatic redirect',
        'Regenerating a slug would delete the artist\'s uploaded images',
        'Slugs are stored in Storage, not the database, and cannot be edited',
      ],
      answer: 1,
    },
    {
      id: 'm7-q7',
      q: 'How does the dashboard decide whether to show a create form or an edit form, without any is_artist flag?',
      options: [
        'It queries artists by user_id with .maybeSingle(): a null result means show the create form, an existing row means show the edit form — the row\'s existence is the source of truth',
        'It reads an is_artist boolean stored on the user\'s profiles row',
        'It checks whether the user signed in through an artist-only login page',
        'It counts the user\'s uploaded images in Storage and shows edit if there are any',
      ],
      answer: 0,
    },
  ],
}
