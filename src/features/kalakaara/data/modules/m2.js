// Module 2 — Supabase Setup & Your First Query
// KalaKaara (React + Supabase) course content for the React course player.

export const m2 = {
  id: 'm2',
  title: 'Supabase Setup & Your First Query',
  hours: 5,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Create a genuinely free Supabase project with no credit card, understand that it is a real Postgres database and not a proprietary black box, wire it into your React app through a single client singleton behind the services layer, and run your first query — including the moment it returns an empty array and you learn, first-hand, that Supabase denies everything by default until you write a policy that says otherwise.',
  sections: [
    {
      id: 'm2-s1',
      title: 'A free Supabase project, no card, ever',
      topics: [
        {
          id: 'm2-t1',
          title: 'Create the free account and the kalakaara project',
          explain:
            'You sign up with GitHub or email, create one project in the Mumbai region, save the database password, and you now have a real Postgres database on the internet — with no card asked for at any point.',
          analogy:
            'Opening a Supabase project is like being handed the keys to a fully-built shop unit in a Kundapura market complex. The walls, the water connection, and the electricity are already in. You did not pour concrete. But the address is now fixed: you cannot pick up this unit and move it to Udupi next week. Choose the location on day one, because the shop stays where you built it.',
          theory:
            'Go to supabase.com and sign up. The fastest path is **Continue with GitHub**, which also means the account you deploy from and the account that owns your database are the same identity. Email and password works too. What matters — and what you should verify with your own eyes — is that **at no point does the signup ask for a credit card**. This is the card test from Module 0, applied for real. Supabase passes it.\n\nOnce you are in, create a **New project**. You give it three things: a **name** (`kalakaara`), a **database password**, and a **region**.\n\nThe **database password** is the master password for the Postgres database itself. You will rarely type it — `supabase-js` uses API keys, not this password — but you need it for direct SQL connections, `pg_dump` backups, and connection strings. Supabase shows it once. Put it in a password manager the moment it appears. If you lose it you can reset it, but resetting it breaks any connection string that embedded the old one.\n\nThe **region** is where your database physically lives. Pick **`ap-south-1` (Mumbai)**. Every KalaKaara user is in coastal Karnataka, and a query from Kundapura to a Mumbai datacentre is a few hundred kilometres; the same query to a Virginia datacentre crosses an ocean and adds 200-plus milliseconds to *every single request*. On a marketplace where search must feel instant, that latency is the difference between snappy and sluggish. **The region is permanent.** There is no "move region" button. To change it you create a new project and migrate your data. So this is a real decision, made once, and Mumbai is the right one for this audience.\n\nThe project takes a minute or two to provision — Supabase is spinning up a genuine Postgres instance, an auth server, and the REST layer for you. When it is ready, note the two things you will need constantly: the **Project URL** and the **anon key**, both under Project Settings → API. Module topic t5 puts them into your app.\n\nOne ceiling to internalise now. The free tier gives you **500 MB of database, 1 GB of file storage, 5 GB of bandwidth per month, and 50,000 monthly active auth users** — comfortably more than a learning project or a small real marketplace needs. The one catch that surprises people: **a free project pauses after 7 days of zero API activity.** It is not deleted, and no data is lost — the dashboard shows a **Restore** button, one click brings it back. If you return to this course after a two-week gap and your queries suddenly fail, this is almost certainly why. Open the dashboard, click Restore, keep going.',
          whyItMatters:
            'The single most common reason a beginner abandons a "free" backend is discovering a card field three screens into signup. Verifying the card test yourself, on the real signup flow, is what lets you build the next fifteen modules with confidence that the rug will not be pulled. And knowing about the 7-day pause up front turns a panic ("my database is gone") into a one-click non-event.',
          steps: [
            'Open supabase.com and sign up with GitHub or email. Watch the whole flow and confirm no credit card field ever appears.',
            'Click New project. Name it `kalakaara`.',
            'Generate a strong database password and save it in a password manager immediately — Supabase shows it once.',
            'Choose region `ap-south-1` (Mumbai). Understand this is permanent and is correct for a coastal-Karnataka audience.',
            'Wait for provisioning, then open Project Settings → API and locate the Project URL and the anon public key. You will use both in topic t5.',
            'Read the Usage page once to see the free-tier ceilings and note the 7-day inactivity pause.',
          ],
          code: `SUPABASE PROJECT — the three things you choose, and what each is

  Name       kalakaara            cosmetic; rename anytime in settings
  Password   (from your manager)  the Postgres master password.
                                  Shown ONCE. Save it now. Needed for
                                  pg_dump, psql, and connection strings.
  Region     ap-south-1 (Mumbai)  PHYSICAL location of the database.
                                  PERMANENT. Closest region to coastal
                                  Karnataka -> lowest latency per query.

FREE TIER CEILINGS (more than enough for KalaKaara)
  Database         500 MB
  File storage     1 GB
  Bandwidth        5 GB / month
  Monthly users    50,000 MAU
  Inactivity       pauses after 7 days of ZERO API activity
                   -> one click to Restore. NO data loss.

THE CARD TEST
  Does signup ask for a credit card?   NO.   -> Supabase passes.

WHAT YOU WALK AWAY WITH (Settings -> API)
  Project URL      https://<ref>.supabase.co
  anon public key  a long JWT string, safe to ship publicly (topic t4)`,
          pitfalls: [
            '**Picking a US or EU region because it is the default suggestion.** Every query from your Karnataka users then pays an ocean of latency. Fix: choose `ap-south-1` (Mumbai) at creation — there is no move-region button afterwards, only a full migration.',
            '**Not saving the database password.** Supabase shows it exactly once. Lose it and every connection string that embedded it breaks until you reset it. Fix: paste it into a password manager the instant it appears, before you click away.',
            '**Confusing the database password with the anon key.** They are different secrets for different jobs — the password is for direct Postgres connections, the anon key is what `supabase-js` sends. Fix: the app uses the anon key; you will barely ever touch the password.',
            '**Panicking when the project pauses after a break and assuming the data is gone.** It is paused, not deleted. Fix: open the dashboard and click Restore. Nothing is lost.',
            '**Creating five throwaway projects while experimenting.** The free plan limits how many active projects you get. Fix: create one `kalakaara` project and reuse it for the whole course.',
          ],
          tryIt:
            'Before creating anything, open the Supabase signup flow and go as far as you can while watching for a credit card field. Then create the project in `ap-south-1`. Afterwards, open Settings → API and copy the Project URL and anon key into a scratch note — you will paste them into `.env.local` in topic t5.',
          takeaway:
            'One free project, named kalakaara, in the Mumbai region, with the database password saved and the anon key noted. No card, ever. The region is the only choice you cannot undo.',
        },
        {
          id: 'm2-t2',
          title: 'What a Supabase project actually IS',
          explain:
            'A Supabase project is a real PostgreSQL 15 database with four open-source services bolted around it — not a proprietary datastore you can never leave.',
          analogy:
            'A Supabase project is a temple complex, and Postgres is the sanctum at its centre. Around the sanctum stand four purpose-built counters: one checks who you are at the entrance (auth), one takes your requests and fetches from inside (the API), one holds the offerings and lamps you brought (storage), and one rings the bell the moment anything changes (realtime). The counters make the complex usable, but the deity — your data — lives in the sanctum, and you can always walk in and carry your own belongings out.',
          theory:
            'This is the most important mental model in the whole module, and it is the one that separates people who *use* Supabase from people who are *afraid* of it. Supabase is not a database. **Supabase is a bundle of open-source services arranged around a database you fully own.**\n\nAt the centre is **PostgreSQL 15** — the real thing, the same Postgres that runs banks and airlines, not a Supabase-flavoured imitation. Every table you create is a normal Postgres table. Every query is normal SQL. Every constraint, index, trigger, and view behaves exactly as the Postgres documentation says, because it *is* Postgres.\n\nAround it sit four services, each solving one job so you do not have to write a server:\n\n**GoTrue** is the authentication server. It handles Google sign-in, issues JWTs, and manages the `auth.users` table. Module 4 uses it heavily.\n\n**PostgREST** reads your database schema and automatically exposes it as a REST API over HTTPS. When you write `supabase.from(\'categories\').select()`, PostgREST is what turns that into an HTTP request and a SQL query. You wrote no API code; it derived the API from your tables.\n\n**Storage** is an S3-compatible file store for images and documents, with access rules written in the same policy language as your tables. Module 7 uploads artwork here.\n\n**Realtime** streams database changes to subscribed clients over WebSockets, so a new review can appear without a refresh.\n\nNow the sentence that should make you relax: **you can `pg_dump` your entire database and walk away.** Because it is standard Postgres, a single command exports every table, row, index, and function into a plain SQL file that will restore into *any* Postgres anywhere — your laptop, a different host, a rival service. The four services around it are open-source and self-hostable too. This is what "no vendor lock-in" actually means, concretely: not a marketing promise, but a `pg_dump` command that produces a portable artifact. Compare that to a proprietary NoSQL cloud database where your data lives in a format only that vendor understands and leaving means rewriting every query. **Supabase chose the least lock-in path available**, and knowing that is what lets you commit to it without fear.',
          diagram: `graph TD
    subgraph project[One Supabase project - no credit card]
      GT[GoTrue<br/>auth + JWT + Google sign-in]
      PR[PostgREST<br/>auto REST API from your schema]
      ST[Storage<br/>S3-compatible file store]
      RT[Realtime<br/>DB changes over WebSockets]
      PG[(PostgreSQL 15<br/>YOUR data. Standard Postgres.)]
      GT --> PG
      PR --> PG
      ST --> PG
      RT --> PG
    end
    DUMP[pg_dump -> one portable .sql file] -.exit anytime.-> PG`,
          flowExplain:
            'Every service points inward at the same Postgres box, and the dotted arrow is your exit: because it is standard Postgres, one `pg_dump` command carries all of it away. That is what "not locked in" means in practice.',
          whyItMatters:
            'Engineers hesitate to adopt a BaaS because they fear being trapped. The honest, checkable answer — "it is plain Postgres, here is the `pg_dump` command that exports everything" — is exactly what a senior reviewer or an interviewer wants to hear. It reframes Supabase from a risky dependency into a convenience layer over a database you already trust.',
          steps: [
            'Say the mental model out loud: "Supabase is four services around a Postgres database I own."',
            'Name each of the four services and its one job: GoTrue (auth), PostgREST (REST API), Storage (files), Realtime (change streams).',
            'Locate the Postgres version in Settings → Infrastructure (or by running `select version();` in topic t3). Confirm it is genuine PostgreSQL.',
            'Understand the exit path: `pg_dump` produces a plain SQL file that restores into any Postgres. Your data is never trapped in a proprietary format.',
            'Reframe the four services as conveniences you would otherwise have to build and host yourself.',
          ],
          code: `WHAT YOU ACTUALLY HAVE

  PostgreSQL 15        <- the real database. Your tables, your SQL.
    + GoTrue           <- auth server (Google sign-in, JWTs, auth.users)
    + PostgREST        <- turns your schema into a REST API automatically
    + Storage          <- S3-compatible file buckets (artwork images)
    + Realtime         <- streams row changes over WebSockets

  None of it is a proprietary datastore. All of it is open source.

THE ANTI-LOCK-IN PROOF (do not run yet; just read the shape)

  # Export EVERYTHING your project holds into one portable file:
  pg_dump "postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres" \\
    > kalakaara_backup.sql

  # That file restores into ANY Postgres, anywhere:
  psql "postgresql://user:pass@some-other-host:5432/postgres" \\
    < kalakaara_backup.sql

  Standard Postgres in, standard Postgres out. No rewrite. No vendor magic.`,
          pitfalls: [
            '**Thinking Supabase is a database you are learning instead of Postgres you are learning.** Every hour you spend on Supabase SQL is transferable Postgres knowledge. Fix: read the PostgreSQL docs when stuck — they apply directly.',
            '**Assuming your data is locked in a proprietary format.** It is plain Postgres; `pg_dump` exports it all. Fix: run the export once early so you *know* the exit door opens.',
            '**Believing you must use all four services.** You can use only the database and ignore Realtime entirely. Fix: adopt each service when a real need appears — KalaKaara leans on Postgres, PostgREST, Auth, and Storage, and barely touches Realtime.',
            '**Treating PostgREST as a mysterious black box.** It is a documented, open-source project that maps your schema to REST by fixed rules. Fix: when a query behaves oddly, remember it is just translating to SQL — reason about the SQL.',
          ],
          tryIt:
            'In one sentence, answer the interview question "aren\'t you worried about being locked into Supabase?" A strong answer names the `pg_dump` export and the fact that it is standard Postgres. If your answer is "I hope not," re-read the anti-lock-in section — the point is that you can prove it.',
          takeaway:
            'A Supabase project is standard PostgreSQL 15 wrapped by four open-source services. Your data is yours: one `pg_dump` command carries it anywhere.',
        },
        {
          id: 'm2-t3',
          title: 'Dashboard tour, and select now(), version()',
          explain:
            'Six areas of the dashboard do almost everything you need; the SQL Editor is where you will spend the most time, and your first query proves the database is live.',
          analogy:
            'The dashboard is the control room of a fishing harbour. There is a board showing every boat (the Table Editor), a radio to issue direct orders (the SQL Editor), a gate register of who may enter (Authentication), a cold store for the catch (Storage), a rulebook of who is allowed to touch what (Roles and Policies), and a printed guide for visiting traders (API Docs). Learn where each one is now, and you never fumble during a busy tide.',
          theory:
            'The left sidebar of your project dashboard is the entire toolkit. Six areas matter for this course.\n\n**Table Editor** is a spreadsheet-like view of your tables. You can browse rows, add columns, and insert data by clicking. It is convenient for a quick look, but everything it does can be done more precisely in SQL — and in this course we prefer SQL, because SQL is text you can save, review, and re-run, whereas clicks vanish.\n\n**SQL Editor** is where you will live. It is a full Postgres console in the browser. You type SQL, press run, and see results. Every table you create in Module 4, every RLS policy, every seed insert — all of it is SQL you write here and, ideally, save into your repository so the database can be rebuilt from scratch.\n\n**Authentication** lists your users and configures providers. In Module 4 you will enable Google here and see the `auth.users` table populate as people sign in.\n\n**Storage** manages file buckets. Module 7 creates `avatars`, `covers`, and `artworks` buckets here and sets their access policies.\n\n**Database** is the deep menu: Roles (including the `anon` and `authenticated` roles that RLS targets), Policies (every RLS policy across every table, in one list), Functions, Triggers, Extensions, and Backups. When you need to see *all* your security rules at once, this is the page.\n\n**API Docs** is a quietly brilliant feature: Supabase auto-generates JavaScript and cURL examples for *your specific tables*, with your actual column names filled in. After you create the `categories` table in topic t8, come back here and Supabase will show you the exact `supabase.from(\'categories\').select()` call, tailored to your schema.\n\nNow prove the database is alive. Open the SQL Editor and run `select now(), version();`. `now()` returns the current server timestamp — confirming the database is responding — and `version()` returns the full PostgreSQL version string, confirming that yes, this really is Postgres 15, exactly as topic t2 claimed. Two functions, one query, and you have both a heartbeat and a receipt.',
          whyItMatters:
            'Knowing where things live turns the dashboard from intimidating to routine, and the habit of writing SQL in the editor instead of clicking in the Table Editor is what makes your database reproducible — a reviewer can read your saved SQL and rebuild the whole schema, which clicks can never give them.',
          steps: [
            'Open the dashboard and find all six areas in the left sidebar: Table Editor, SQL Editor, Authentication, Storage, Database, API Docs.',
            'Open Database → Roles and note that `anon` and `authenticated` are real, named roles — the same ones RLS policies target.',
            'Open the SQL Editor and run `select now(), version();`.',
            'Read the version string and confirm it says PostgreSQL 15. That is your proof from topic t2, made concrete.',
            'Bookmark the SQL Editor. It is where the rest of this module happens.',
          ],
          code: `-- Your first-ever query against KalaKaara's database.
-- Paste into SQL Editor and run.

select now(), version();

-- Expected shape of the result:
--   now                              version
--   2026-07-09 09:14:22.51+00        PostgreSQL 15.x on x86_64-pc-linux-gnu ...
--
-- now()      -> the database is alive and responding.
-- version()  -> it really is PostgreSQL 15, exactly as topic t2 promised.

-- A couple more one-liners worth running to feel at home:
select current_user;        -- who Postgres thinks you are in the editor
select current_database();  -- 'postgres'
select 2 + 2 as sanity;     -- 4. It is a real SQL engine, not a mock.`,
          pitfalls: [
            '**Building your whole schema by clicking in the Table Editor.** Those clicks leave no record, so nobody — including future you — can rebuild the database from scratch. Fix: write schema as SQL in the SQL Editor and save it in your repo.',
            '**Ignoring the auto-generated API Docs.** They show the exact `supabase-js` call for your real tables, which saves guessing column names. Fix: after creating a table, open API Docs and copy the tailored example.',
            '**Missing the Database → Policies page.** When debugging "why is this empty," seeing every RLS policy in one list is invaluable. Fix: bookmark it; you will visit it constantly in Module 4.',
            '**Not realising `anon` and `authenticated` are actual Postgres roles.** They are not abstract labels — RLS policies name them directly. Fix: open Database → Roles once so they stop feeling magical.',
          ],
          tryIt:
            'Run `select now(), version();` in the SQL Editor. Then, without looking, name the six dashboard areas and one thing each does. If you can, you are oriented; if not, take the two-minute tour again — you will open these pages hundreds of times.',
          takeaway:
            'Six dashboard areas, and the SQL Editor is home. `select now(), version();` is your first query: a heartbeat and a receipt proving the database is live Postgres 15.',
        },
      ],
    },
    {
      id: 'm2-s2',
      title: 'Keys, secrets and the client singleton',
      topics: [
        {
          id: 'm2-t4',
          title: 'The anon key vs the service_role key',
          explain:
            'The anon key is designed to ship publicly in your bundle and is protected by RLS; the service_role key bypasses RLS entirely and must never touch your frontend — mixing them up is the number-one Supabase security incident.',
          analogy:
            'The anon key is the public entrance ticket to the temple: everyone holds one, and it gets you no further than the rules of the temple allow — the locked shelves stay locked. The service_role key is the head priest\'s master key that opens every room, every safe, every locked cupboard. You do not photocopy the master key and hand it to every visitor at the gate. That is exactly what shipping the service_role key in your JavaScript would do.',
          theory:
            'Every Supabase project issues two API keys, and understanding the difference is not optional — getting it wrong is how databases get dumped onto the internet.\n\nThe **anon key** (labelled "anon public" in the dashboard) is a JWT that identifies the caller as *anonymous, or authenticated once they log in*. It carries **no special privileges**. When a request arrives with only the anon key, PostgREST runs the query as the Postgres `anon` role, and **Row Level Security decides, row by row, what that request may see**. The anon key is **designed to be public.** It ships in your JavaScript bundle, it is visible in DevTools, it is baked into the files Vercel serves — all by design. Leaking the anon key is not a breach, because the key grants nothing on its own. **RLS is the actual protection**, not the secrecy of the key. Internalise that sentence; it is the entire security model.\n\nThe **service_role key** is the opposite in every way. It is a JWT that **bypasses Row Level Security completely.** A request bearing the service_role key can read every phone number, every private row, every other user\'s data, and can delete anything, because RLS policies are simply not consulted for it. It exists for trusted server-side jobs — a backend cron task, a migration script, an admin tool running on a machine you control — where there is no untrusted user in the loop.\n\nHere is the rule, in bold, because it is the one that matters: **KalaKaara never uses the service_role key. Anywhere. Not in the frontend, not in an env var that Vite can read, not "just for testing."** Our entire architecture (Module 0) is a React app talking straight to Postgres, so there is no trusted server for the service_role key to live on. If a query returns nothing and you feel tempted to "fix it" by switching to the service_role key, stop — that is not a fix, it is a catastrophe. The empty result means your RLS policy is wrong (topic t9). Fix the policy.\n\nWhy is this the **number-one Supabase security incident**? Because the two keys sit next to each other on the same settings page, and a rushed developer copies the wrong one into `.env.local`, prefixes it with `VITE_`, and Vite inlines it into the public bundle. Now anyone who opens DevTools has a master key to the entire database. It has happened to real companies. The defence is a habit: **the frontend gets the anon key and only the anon key, and the service_role key never leaves a server — and KalaKaara has no server, so it never leaves the settings page at all.**',
          diagram: `graph TD
    subgraph anon[anon key - ships in your bundle BY DESIGN]
      A1[Request with anon key] --> A2[PostgREST: role = anon or authenticated]
      A2 --> A3{RLS policies consulted<br/>row by row}
      A3 -- allowed --> A4[permitted rows returned]
      A3 -- denied --> A5[row never returned]
    end
    subgraph service[service_role key - NEVER in a browser]
      S1[Request with service_role key] --> S2[PostgREST: bypass RLS]
      S2 --> S3[EVERY row. No checks. Master key.]
    end
    RULE[KalaKaara has no server -> service_role key is NEVER used, anywhere]
    S3 -.forbidden in frontend.-> RULE`,
          flowExplain:
            'The left path always passes through the RLS diamond; the right path skips it entirely. KalaKaara only ever walks the left path — the service_role key never enters the picture because there is no server to hold it.',
          whyItMatters:
            'This is the security question you will be asked in any interview that touches Supabase: "isn\'t it dangerous to put the key in the frontend?" The correct answer — the anon key is public by design and RLS is the real protection, while the service_role key bypasses RLS and must never reach a client — demonstrates that you understand where security actually lives. Getting this wrong in production leaks entire databases.',
          steps: [
            'Open Settings → API and find both keys. Note that one is labelled "anon public" and the other "service_role secret".',
            'Read the warning Supabase itself prints next to the service_role key. It says, in effect, never expose this in a browser.',
            'Copy only the anon key for use in your app. Leave the service_role key on the settings page.',
            'Say the rule aloud: the anon key ships publicly and RLS protects the data; the service_role key bypasses RLS and KalaKaara never uses it.',
            'If you ever feel tempted to reach for the service_role key to make a query work, treat that as a signal that an RLS policy is missing — not as a solution.',
          ],
          code: `TWO KEYS, ONE SETTINGS PAGE. Do not mix them up.

  anon public key
    - identifies caller as anonymous / authenticated
    - carries NO privilege on its own
    - RLS decides what it may read or write, row by row
    - SHIPS PUBLICLY in your JS bundle. This is BY DESIGN.
    - leaking it is not a breach; disabling RLS is.
    -> this is the ONLY key KalaKaara's frontend uses.

  service_role secret key
    - BYPASSES Row Level Security entirely
    - a master key: reads every row, deletes anything
    - for trusted SERVER-SIDE code only
    - KalaKaara has no server, so it is NEVER used. Anywhere.

THE #1 SUPABASE SECURITY INCIDENT, in three lines:
    VITE_SUPABASE_KEY=<service_role key>   // WRONG key copied
    // Vite inlines it into the public bundle...
    // ...and now anyone with DevTools owns your entire database.

  The fix is a habit: frontend gets the anon key, and ONLY the anon key.`,
          pitfalls: [
            '**Copying the service_role key into `.env.local` because it was next to the anon key.** Vite inlines it into the public bundle and hands your whole database to anyone with DevTools. Fix: copy only the "anon public" key; never let service_role near the frontend.',
            '**Reaching for the service_role key when a query returns an empty array.** That does not fix the problem, it detonates your security model. Fix: an empty result means a missing or wrong RLS policy — fix the policy (topic t9).',
            '**Thinking the anon key must be kept secret.** Treating a public-by-design value as a secret leads to fragile, confused practices. Fix: understand that RLS, not key secrecy, is the protection — the anon key is meant to be seen.',
            '**Assuming "we have no backend" means the service_role key is harmless to store somewhere.** The moment it is reachable by client code it is a master key in public hands. Fix: KalaKaara never stores or uses it at all.',
          ],
          tryIt:
            'Open Settings → API and read the exact warning text Supabase shows beside the service_role key. Write down, in your own words, why the anon key does not need that same warning. (Because the anon key grants nothing on its own — RLS gates every request — whereas the service_role key grants everything.)',
          takeaway:
            'The anon key is public by design and guarded by RLS; the service_role key is a master key that bypasses RLS and KalaKaara never uses it. Copying the wrong one into the frontend is the number-one Supabase security incident.',
        },
        {
          id: 'm2-t5',
          title: 'Environment variables, the VITE_ prefix, and .env.local',
          explain:
            'Vite exposes only variables prefixed with VITE_ to your code and inlines them into the build, so they are public — which is fine for the URL and anon key, and never acceptable for a real secret.',
          analogy:
            'Think of the `VITE_` prefix as the difference between what you shout across the santhe market and what you whisper to one trader. Anything you say into the `VITE_` megaphone is heard by every shopper — perfectly fine for your shop name and stall number, disastrous for your bank PIN. Vite will only pick up what you say through the megaphone, so a whispered secret never reaches your code anyway.',
          theory:
            'Hardcoding your Supabase URL and key directly into `client.js` works, but it is a bad habit: it mixes configuration with code, and it means different environments (local development, production on Vercel) cannot use different values. The fix is **environment variables**, and Vite has specific, important rules about them.\n\n**Rule one: only variables prefixed with `VITE_` are exposed to your client code.** Vite deliberately hides every other environment variable from the browser bundle, precisely so that a stray secret in your shell environment cannot accidentally leak into shipped JavaScript. So your two values must be named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. A variable named `SUPABASE_URL` without the prefix simply will not exist in your app — `import.meta.env.SUPABASE_URL` is `undefined`.\n\n**Rule two: you read them through `import.meta.env`, not `process.env`.** Vite is not Node. `import.meta.env.VITE_SUPABASE_URL` is how you reach the value. (`process.env` is a Node concept; using it in Vite frontend code returns nothing.)\n\n**Rule three — the one that trips everyone: Vite INLINES these values into the bundle at build time. They are PUBLIC.** When you run `vite build`, Vite finds every `import.meta.env.VITE_...` and literally replaces it with the string value, right there in the output JavaScript. There is no runtime lookup, no server fetching a secret — the value is baked into the file Vercel serves. Anyone can open the bundle and read it. This is completely fine for the Supabase URL (which is just an address) and the anon key (public by design, per topic t4). It is a **catastrophe for a real secret.** The rule follows directly: **never, ever prefix a genuine secret with `VITE_`.** A Stripe secret key, a database password, a service_role key — none of these may carry the `VITE_` prefix, because that prefix is a promise to publish them. (KalaKaara has no such secrets, by the deliberate design of Module 0, which is why this architecture is safe.)\n\nThe file mechanics: you put your values in **`.env.local`**, which Vite loads automatically and which your `.gitignore` must exclude so it never reaches GitHub. Alongside it you commit **`.env.example`** — the same keys with placeholder values and no real data — so that anyone cloning the repo knows exactly which variables to set. `.env.example` is committed; `.env.local` is gitignored. That pairing is the standard, and it is how a teammate (or future you on a new machine) knows what to fill in without ever seeing your actual values.',
          diagram: `graph TD
    ENV[.env.local  -  gitignored, never committed] --> VITE{Vite build}
    VITE -- has VITE_ prefix? --> YES[Inlined into the public bundle]
    VITE -- no VITE_ prefix --> HIDE[Hidden. import.meta.env sees undefined]
    YES --> BUNDLE[dist/ JS served by Vercel<br/>value is now PUBLIC, readable in DevTools]
    EX[.env.example  -  committed, placeholder values only] -.tells teammates which keys to set.-> ENV
    SECRET[A real secret e.g. service_role key] -.NEVER give it a VITE_ prefix.-> YES`,
          flowExplain:
            'Follow the VITE_ branch: prefixed values land in the public bundle, readable by anyone. That is why only public values (URL, anon key) may carry the prefix, and a real secret never may.',
          whyItMatters:
            'The `VITE_`-inlines-and-publishes rule is the single most misunderstood thing about Vite, and misunderstanding it is how secrets end up on GitHub and in production bundles. Knowing that the prefix is a promise to publish — and that `.env.local` is gitignored while `.env.example` is committed — is basic professional hygiene that reviewers check for immediately.',
          steps: [
            'Create `.env.local` in your project root with two lines: `VITE_SUPABASE_URL=...` and `VITE_SUPABASE_ANON_KEY=...`, using the values from Settings → API.',
            'Confirm `.env.local` is listed in `.gitignore` (Module 1 set this up). Run `git status` and verify it does not appear.',
            'Create `.env.example` with the same two keys but placeholder values, and commit it so teammates know what to set.',
            'Read the values in code with `import.meta.env.VITE_SUPABASE_URL` — never `process.env`.',
            'Say the rule aloud: the `VITE_` prefix means "publish this." Only truly public values may carry it.',
            'Restart the Vite dev server after editing `.env.local` — env changes are picked up at startup, not hot-reloaded.',
          ],
          code: `# .env.local  --  gitignored. Your real values. NEVER committed.
VITE_SUPABASE_URL=https://abcdefghijklmno.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...   # anon key ONLY

# .env.example  --  committed. Placeholders only. The map for teammates.
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here

# .gitignore MUST contain (Module 1 added this):
#   .env
#   .env.local
#   .env.*.local`,
          pitfalls: [
            '**Forgetting the `VITE_` prefix.** Without it, Vite hides the variable and `import.meta.env.SUPABASE_URL` is `undefined`, so the client fails to initialise. Fix: both variables must start with `VITE_`.',
            '**Using `process.env.VITE_SUPABASE_URL`.** That is Node syntax; Vite uses `import.meta.env`. Fix: read every env var through `import.meta.env` in Vite frontend code.',
            '**Committing `.env.local`.** Even though these particular values are public, committing the file is a bad habit that will one day commit a real secret. Fix: keep `.env.local` gitignored and commit only `.env.example`.',
            '**Prefixing a real secret with `VITE_` "to make it available."** The prefix publishes it into the bundle. Fix: never give a genuine secret the `VITE_` prefix — a secret that must reach the browser is a design mistake, not a config one.',
            '**Editing `.env.local` and not seeing the change.** Vite reads env files at server start. Fix: stop and restart `npm run dev` after any env change.',
          ],
          tryIt:
            'After creating `.env.local`, run `npm run build` and open a file in `dist/assets/`. Search it for your project ref (the `abcdefghijklmno` part of the URL). You will find it, in plain text. That is the inlining rule made visible — and exactly why a real secret must never carry the `VITE_` prefix.',
          takeaway:
            'Only `VITE_`-prefixed variables reach your code, read via `import.meta.env`, and Vite inlines them publicly into the bundle. Perfect for the URL and anon key; forbidden for any real secret. `.env.local` is gitignored, `.env.example` is committed.',
        },
        {
          id: 'm2-t6',
          title: 'Install supabase-js and write the client singleton',
          explain:
            'You install @supabase/supabase-js v2 and create the client exactly once in src/supabase/client.js, failing loudly at startup if the environment variables are missing.',
          analogy:
            'The Supabase client is the single telephone line between your shop and the harbour warehouse. You install one phone, on one desk, and everyone in the shop uses that same line. Installing a second phone for every clerk means every clerk also hears the warehouse\'s incoming calls — and now three clerks answer the same call and argue about who wrote it down. One phone, one line, one source of truth.',
          theory:
            'Install the official client: `npm install @supabase/supabase-js`. Make sure it is **version 2** (the `supabase-js` v2 API is what this entire course uses — `createClient`, the `{ data, error }` return shape, the query builder). A fresh install today gives you v2; if you inherited an older project, check `package.json`.\n\nNow the important architectural decision: **you create the client exactly once, in one file, and export that single instance.** That file is `src/supabase/client.js`. It calls `createClient(url, anonKey)` a single time and exports the result. Every service in your app imports *that* instance. This is the **singleton pattern**, and it is not a stylistic preference — it is a correctness requirement.\n\n**Why one client and not many?** The Supabase client is not a lightweight helper; it holds real state. It manages the auth session, it registers an `onAuthStateChange` listener, it refreshes JWTs on a timer, and it may hold WebSocket connections for Realtime. If you call `createClient` in five different files, you now have **five independent auth listeners**, each with its own idea of the current session. When a user signs in, these copies drift: one knows about the session, another does not, and you get maddening bugs where the app thinks you are simultaneously logged in and logged out. Multiple clients means **duplicated sessions and duplicated listeners** — a whole category of bugs that simply cannot occur if there is only ever one client.\n\n**Fail loudly at startup.** Before calling `createClient`, check that both environment variables actually exist. If `.env.local` is missing, or a variable is misspelled, `import.meta.env.VITE_SUPABASE_URL` is `undefined`, and `createClient(undefined, undefined)` produces a client that fails on every query with a cryptic error, deep inside your app, long after the real cause. Instead, check up front and `throw` a clear message. A build that dies immediately with "Missing VITE_SUPABASE_URL — did you create .env.local?" is infinitely kinder than one that mysteriously returns network errors on page three. **Fail at startup, with a message that names the fix.**\n\nNote where this file lives: `src/supabase/`, its own folder, separate from `src/services/`. That separation (from Module 0) is deliberate — `client.js` is *configuration* (the one connection object), while `services/` is *logic* (the functions that use it). Keeping them apart keeps each folder honest.',
          diagram: `graph TD
    subgraph wrong[WRONG: createClient called in many files]
      W1[artistService.js<br/>createClient] --> WB[auth listener A]
      W2[categoryService.js<br/>createClient] --> WC[auth listener B]
      W3[SomeComponent.jsx<br/>createClient] --> WD[auth listener C]
      WB --> WBUG[three sessions drift apart -> login bugs]
      WC --> WBUG
      WD --> WBUG
    end
    subgraph right[RIGHT: one singleton]
      C[src/supabase/client.js<br/>createClient ONCE] --> SVC1[artistService.js imports it]
      C --> SVC2[categoryService.js imports it]
      C --> ONE[one session, one auth listener, one truth]
    end`,
          flowExplain:
            'The top half shows what multiple `createClient` calls produce: three auth listeners and three drifting sessions. The bottom half is the fix — one file calls `createClient`, everyone imports that instance.',
          whyItMatters:
            'The singleton client is a genuine source of hard-to-diagnose bugs when done wrong — intermittent "you are logged out" flashes, duplicated realtime events, doubled network calls. Being able to explain *why* one client matters (shared auth state, a single listener) is exactly the kind of architectural reasoning that separates a developer who copied a tutorial from one who understands it.',
          steps: [
            'Run `npm install @supabase/supabase-js` and confirm `package.json` shows a version starting with `2`.',
            'Create `src/supabase/client.js`.',
            'Read `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `import.meta.env`.',
            'Before calling `createClient`, throw a clear error if either value is missing — name the file to create in the message.',
            'Call `createClient(url, anonKey)` exactly once and export the result as a named `supabase` constant.',
            'Never call `createClient` anywhere else. Every other file imports this instance.',
          ],
          code: `// src/supabase/client.js
// The ONE and ONLY place createClient is ever called in KalaKaara.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail loudly, at startup, with a message that names the fix.
// A crash here is far kinder than cryptic network errors on page three.
if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase env vars. Create a .env.local file with ' +
      'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server. ' +
      'Copy .env.example to .env.local and fill in the values from ' +
      'Supabase -> Settings -> API.',
  );
}

// createClient runs exactly ONCE. This module is cached by the bundler,
// so every import below shares this single instance -> one auth session,
// one onAuthStateChange listener, one source of truth.
export const supabase = createClient(url, anonKey);

// Everywhere else in the app:
//   import { supabase } from '../supabase/client';
// Never import { createClient } outside this file. Never.`,
          pitfalls: [
            '**Calling `createClient` in more than one file.** Each call spins up its own auth listener and session, and they drift apart into login/logout bugs. Fix: one `createClient`, in `client.js`, exported and imported everywhere else.',
            '**Skipping the missing-env-var check.** `createClient(undefined, undefined)` builds a broken client that fails cryptically on the first query, far from the real cause. Fix: throw a named error at startup so the failure is instant and obvious.',
            '**Installing v1 by accident on an old project.** The v1 API differs (different auth methods, different return shapes) and none of this course\'s code will match. Fix: confirm `@supabase/supabase-js` is v2 in `package.json`.',
            '**Putting `client.js` inside `services/`.** It muddies the boundary between configuration and logic. Fix: keep the client in `src/supabase/`, separate from the service functions that consume it.',
            '**Re-exporting a new client per request "to be safe".** That defeats the singleton entirely. Fix: export the instance itself, once, and let the module cache do its job.',
          ],
          tryIt:
            'Temporarily rename `VITE_SUPABASE_URL` to `VITE_SUPABASE_URLX` in `.env.local`, restart the dev server, and confirm the app dies immediately with your clear error message rather than limping along and failing on a query later. Then rename it back. Failing loudly is a feature you just tested.',
          takeaway:
            'One `createClient` call in `src/supabase/client.js`, exported once and shared everywhere, guarded by a loud startup check for missing env vars. Multiple clients mean multiple auth listeners and duplicated sessions — a bug class you avoid by never calling `createClient` twice.',
        },
        {
          id: 'm2-t7',
          title: 'The services layer boundary — why components never import the client',
          explain:
            'Only files in src/services/ may import the Supabase client; components, pages, and hooks reach the database through service functions, never directly.',
          analogy:
            'In a temple, devotees do not walk into the kitchen and stir the pots. They place their request at the seva counter, and the counter staff — the only people allowed inside the kitchen — bring back exactly what was asked for. The services layer is that counter. Components hand it a request; it goes into the kitchen (Supabase) and returns a clean plate. No devotee ever touches a pot.',
          theory:
            'Module 0 stated the dependency rule: **pages → hooks → services → supabase**. This topic makes it real by writing it down as a rule your future self must obey. The core of it: **`src/services/` is the only folder permitted to import the Supabase client.** Not components, not pages, not even hooks call `supabase.from(...)` directly. Hooks call service functions; service functions call Supabase.\n\nWhy be this strict? Four concrete payoffs, each of which you will feel in a later module.\n\n**One: you can swap or upgrade Supabase in one place.** If Supabase changes an API in v3, or you decide to add a caching layer, or you want to move a query to an Edge Function, you edit files in `services/` and nothing else. A component that called `supabase.from(...)` inline is welded to the vendor; thirty such components are thirty edits and thirty chances to miss one.\n\n**Two: you can test components without a network.** A component that receives data as props, and a hook that calls a service function, can both be tested by substituting a fake service that returns canned data. A component with `supabase.from(...)` baked in cannot be tested without a live database.\n\n**Three: the `{ data, error }` shape is unwrapped in exactly one layer.** Supabase returns `{ data, error }` from every call. If components handled that shape, every component would need its own `if (error)` check, and one day one of them would forget and silently swallow an error. Instead, services unwrap it once — throw on error, return plain data (topic t10) — so components only ever see clean data or a thrown error.\n\n**Four: snake_case-to-camelCase mapping happens once.** The database speaks `snake_case`; JavaScript speaks `camelCase`. The service layer is where `display_name` becomes `displayName`, in one place, so no component ever sees a database column name.\n\nTo make this rule non-negotiable, you write it into `src/services/README.md` — a short file that states the boundary in plain English. It costs two minutes and settles every future argument about where a query belongs. When you (or a teammate, or a reviewer) wonder "can I just call Supabase from this component," the README answers: no, and here is why. A rule that lives only in your head is a rule you will break at midnight; a rule written into the folder is a rule with teeth.',
          diagram: `graph TD
    P[pages/ + components/] -->|call hooks / receive props| H[hooks/]
    H -->|call service functions| S[services/<br/>THE ONLY folder that<br/>imports the supabase client]
    S -->|import supabase| CL[supabase/client.js]
    CL --> DB[(Postgres + RLS)]
    X[A component importing supabase directly] -.FORBIDDEN.-> CL
    S --> MAP[unwrap data/error + map snake_case to camelCase HERE, once]
    style S fill:#bae6fd
    style X fill:#fecaca`,
          flowExplain:
            'Every arrow to the database passes through the highlighted `services/` box, and the red dotted arrow — a component importing the client directly — is the one path the rule forbids.',
          whyItMatters:
            'The services boundary is the highest-leverage discipline in the entire codebase. It is what lets Module 13 add caching in one folder, lets Module 15 test components without a network, and keeps Supabase from bleeding into forty files. Reviewers grep for `supabase` outside `services/` as a first-pass code-quality check — an inline query there is an instant red flag.',
          steps: [
            'Create `src/services/README.md` and write the rule in it: only files in `services/` import the Supabase client.',
            'State the four reasons in the README: swappable vendor, testable components, one place to unwrap `{ data, error }`, one place to map snake_case to camelCase.',
            'Adopt the habit: components receive data as props, pages call hooks, hooks call services, services call Supabase.',
            'Set a guardrail you will actually run: `grep -rn "supabase" src/components src/pages` must return nothing.',
            'When you feel the urge to call Supabase from a component "just this once," open the README and remember it is never once.',
          ],
          code: `<!-- src/services/README.md -->
# The services layer

**Rule: this is the ONLY folder allowed to import the Supabase client.**

    pages / components  ->  hooks  ->  services  ->  supabase/client.js

Components and pages NEVER import \`supabase\`. Hooks NEVER call
\`supabase.from(...)\` directly. All database access lives in a service
function here.

## Why

1. **Swap/upgrade in one place.** A Supabase API change, a caching layer,
   or a move to an Edge Function is edited HERE, not across 30 components.
2. **Testable components.** Substitute a fake service in tests; no live DB.
3. **Unwrap { data, error } once.** Services throw on error and return
   plain data. Components never see Supabase's { data, error } shape.
4. **Map snake_case -> camelCase once.** \`display_name\` becomes
   \`displayName\` here, so no component ever sees a column name.

## Each service function
- takes plain arguments
- returns plain data, or THROWS
- never returns { data, error } to the caller

Guardrail:  grep -r "from '../supabase" src/components src/pages
            (must return nothing)`,
          pitfalls: [
            '**Calling `supabase.from(...)` inside a component "just this once".** It is never once; within a month Supabase is welded into dozens of components and none can be tested. Fix: the services boundary is hard from the very first query.',
            '**Letting hooks call Supabase directly.** Hooks are for React state (`data`, `loading`, `error`); services are for data access. Blurring them means the query logic cannot be reused outside React. Fix: hooks call service functions, not the client.',
            '**Not writing the rule down.** A convention that lives only in your head is one you will break under deadline pressure. Fix: `src/services/README.md` gives the rule teeth and answers the question before it is asked.',
            '**Mapping snake_case to camelCase in components.** Then every component knows database column names, and a column rename ripples everywhere. Fix: map once, in the service function.',
            '**Returning `{ data, error }` from a service to a hook.** Now the hook must re-check `error`, defeating the point. Fix: unwrap in the service — throw on error, return plain data (topic t10).',
          ],
          tryIt:
            'Write the guardrail grep command and run it against your project now, while it is empty: `grep -rn "supabase" src/components src/pages`. It should return nothing. Note it down — you will run it again after Module 7, when the temptation to shortcut is real.',
          takeaway:
            'Only `services/` imports the Supabase client. Components receive props, hooks call services, services call Supabase and unwrap the result. Write the rule into `src/services/README.md` so it has teeth.',
        },
      ],
    },
    {
      id: 'm2-s3',
      title: 'Your first query, and the default-deny surprise',
      topics: [
        {
          id: 'm2-t8',
          title: 'Create the categories table, clause by clause',
          explain:
            'You write a create table statement in the SQL Editor and understand every clause — the uuid primary key, the not-null and unique text column, and the timestamptz default — then insert eight real art categories.',
          analogy:
            'Defining a table is like ruling the columns of a temple seva register before anyone writes in it. You decide, in advance, that every entry gets a unique serial number nobody can forge, a name that cannot be left blank, no two names the same, and the date it was added stamped automatically. Rule the register well and every future entry is clean; rule it sloppily and you spend the festival arguing over duplicate names.',
          theory:
            'Open the SQL Editor and create your first table. We start with `categories` — the art categories buyers filter by (portrait, mural, calligraphy, and so on). It is the simplest table in KalaKaara, which makes it the perfect place to understand `create table` completely, clause by clause. Every table in Module 4 reuses these same building blocks.\n\n`create table public.categories (` — we create the table in the `public` schema. Supabase exposes `public` through PostgREST, so tables here become queryable from your app. (Tables in the `auth` schema, like `auth.users`, are managed by GoTrue and not directly exposed.)\n\n`id uuid primary key default gen_random_uuid()` — the identity column. **`uuid`** is a 128-bit random identifier, not a sequential integer. We use UUIDs rather than `1, 2, 3` for two reasons: they do not leak how many rows exist (an auto-increment `id=4823` tells a competitor your row count), and they can be generated anywhere without coordination. **`primary key`** means unique and not null and indexed — the one column that identifies a row. **`default gen_random_uuid()`** means Postgres generates the value for you on insert; you never supply an id. `gen_random_uuid()` is built into Postgres 15, no extension needed.\n\n`name text not null` — the category name. **`text`** is Postgres\'s string type (there is no penalty for `text` over `varchar(n)` in Postgres, and it avoids arbitrary length limits). **`not null`** means the database rejects any insert that omits a name. This is a constraint enforced by Postgres itself, not by your React validation — so even a buggy client, or a direct SQL insert, cannot create a nameless category.\n\n`slug text not null unique` — a URL-safe identifier like `portrait-painting`. **`unique`** means no two rows may share a slug; Postgres enforces it and, as a bonus, builds an index that makes slug lookups fast. This is how `/artists?category=portrait-painting` reliably maps to exactly one category.\n\n`created_at timestamptz default now()` — the audit timestamp. **`timestamptz`** is timestamp *with time zone* — always use this over plain `timestamp`, because it stores an unambiguous moment rather than a naive wall-clock reading. **`default now()`** stamps the current server time automatically, so every row records when it was created without your app having to remember.\n\nThen insert eight real categories. Use `insert into ... values (...)` with genuine art categories from the KalaKaara domain. You supply only `name` and `slug`; `id` and `created_at` fill themselves in, which is the whole point of those defaults.',
          whyItMatters:
            'These four clauses — uuid pk with a default, not-null text, unique, timestamptz default now() — are the skeleton of every one of the eighteen tables in Module 4. Understanding them here, on the simplest table, means Module 4 is assembly rather than confusion. And knowing that constraints are enforced by Postgres, not React, is the foundation of the "security lives in the database" theme.',
          steps: [
            'Open the SQL Editor in your Supabase dashboard.',
            'Write `create table public.categories (...)` with the four columns: `id`, `name`, `slug`, `created_at`.',
            'Read each clause aloud and state what promise it makes: unguessable id, non-blank name, unique slug, automatic timestamp.',
            'Run the statement. Confirm the table appears in the Table Editor.',
            'Insert eight real categories with `insert into public.categories (name, slug) values (...)`, supplying only name and slug.',
            'Run `select * from public.categories;` and confirm eight rows, each with a generated uuid and a `created_at`.',
          ],
          code: `-- Run in the SQL Editor. Your first table.
create table public.categories (
  id          uuid primary key default gen_random_uuid(),  -- unguessable, auto-made
  name        text not null,                                -- cannot be blank
  slug        text not null unique,                         -- URL id, no duplicates, indexed
  created_at  timestamptz default now()                     -- tz-aware auto timestamp
);

-- Insert 8 real art categories. Supply only name + slug;
-- id and created_at fill themselves in.
insert into public.categories (name, slug) values
  ('Portrait Painting',   'portrait-painting'),
  ('Wall Painting',       'wall-painting'),
  ('Mural Art',           'mural-art'),
  ('Calligraphy',         'calligraphy'),
  ('Oil Painting',        'oil-painting'),
  ('Watercolour',         'watercolour'),
  ('Pencil & Charcoal',   'pencil-charcoal'),
  ('Digital Art',         'digital-art');

-- Confirm:
select id, name, slug, created_at from public.categories order by name;
-- 8 rows, each with a generated uuid and a timestamp you never typed.`,
          pitfalls: [
            '**Using a serial integer id instead of a uuid.** Sequential ids leak your row count and cannot be generated client-side without coordination. Fix: `uuid primary key default gen_random_uuid()` on every table.',
            '**Using plain `timestamp` instead of `timestamptz`.** Plain timestamps store a naive wall-clock value with no time zone, and comparisons across regions become ambiguous. Fix: always `timestamptz`.',
            '**Forgetting `unique` on `slug`.** Two categories with the slug `mural-art` make `/artists?category=mural-art` ambiguous, and no error warns you. Fix: `unique` lets Postgres reject the duplicate and indexes the column for free.',
            '**Relying on React to enforce not-null.** A buggy client or a direct insert bypasses React entirely. Fix: `not null` in the schema means the database itself refuses blank values, no matter who calls.',
            '**Creating the table in the wrong schema.** A table outside `public` is not exposed by PostgREST and your app cannot query it. Fix: create app tables in `public.`.',
          ],
          tryIt:
            'After inserting the eight rows, try to insert a ninth whose slug reuses the existing `portrait-painting` value. Postgres rejects it with a unique-violation error before it is ever written. That rejection is your `unique` constraint doing its job — the database protecting your data even when the caller is careless.',
          takeaway:
            'Four clauses build every KalaKaara table: uuid primary key with a default, not-null text, unique, and timestamptz default now(). Constraints are enforced by Postgres itself, so even a buggy client cannot create bad data.',
        },
        {
          id: 'm2-t9',
          title: 'The empty array, and the default-deny surprise',
          explain:
            'You query the categories table from React and get back an empty array — not because of a bug, but because Supabase enables RLS on new tables and denies everything until you write a policy.',
          analogy:
            'You built the seva counter, stocked the shelves, and opened for the day — but the shutter is locked and there is no rule yet that says who may lift it. A devotee walks up, asks for a category list, and the counter, having no instruction permitting it, hands over nothing. The shelves are full; the shutter is simply shut by default. You have to post a notice — "this list is public, anyone may read it" — before anything comes across the counter. The locked shutter is not a fault. It is the safe default.',
          theory:
            'You created `categories` and inserted eight rows. You confirmed them in the SQL Editor with `select * from public.categories` — eight rows, right there. Now you query the same table from React through your service layer, and you get back... an **empty array.** No error. No crash. Just `[]`.\n\nThis is the moment that confuses every Supabase beginner, so let us name exactly what is happening. **Supabase enables Row Level Security on tables, and a table with RLS enabled but no policies denies every request by default.** Your data is not gone — you just saw it in the SQL Editor. But the SQL Editor runs as a privileged Postgres role that is not subject to RLS. Your React app arrives as the `anon` role, RLS is consulted, and RLS finds **no policy that permits `anon` to select from `categories`** — so it permits nothing. Zero rows. An empty array.\n\nHere is the crucial reframe: **this is the safe default, not a bug.** Postgres RLS is deny-by-default for a reason. Imagine the opposite: a new table is world-readable and world-writable until you remember to lock it down. You would ship a table, forget the policy, and leak every row — the classic "open database" breach. Supabase inverts that. A new table gives up nothing until you *explicitly* decide who may see what. The empty array is the system protecting you from your own forgetfulness. Every table starts locked; you open exactly the doors you mean to.\n\nSo you write your first policy. For `categories`, the decision is easy: category names are public — buyers browse them without logging in, exactly as Module 0 requires. The policy grants `select` to both `anon` and `authenticated` roles, with a `using (true)` condition meaning "every row qualifies."\n\nRead the policy clause by clause. `create policy "categories are public"` names it (names show up in the Database → Policies list). `on public.categories` targets the table. `for select` applies to reads only — not insert, update, or delete, which remain denied, which is correct because nobody edits categories through the app. `to anon, authenticated` names both actor roles explicitly, so a logged-out visitor and a logged-in user are both allowed. `using (true)` is the row condition: `true` means every row passes, so the whole table is readable. Run that policy, re-run your React query, and the eight rows appear. The shutter is open, and only for reading, and only because you posted the notice.',
          diagram: `graph TD
    Q[React app queries categories as anon] --> RLS{RLS enabled on the table?}
    RLS -- yes, always on new tables --> POL{Any policy permitting<br/>anon to select?}
    POL -- NO policy yet --> DENY[Deny all -> empty array<br/>NOT an error. The safe default.]
    POL -- policy exists --> ROW{using condition true<br/>for the row?}
    ROW -- true --> ALLOW[row returned]
    ROW -- false --> SKIP[row withheld]
    DENY -.you write the first policy.-> FIX["create policy ... for select<br/>to anon, authenticated using (true)"]
    FIX --> ALLOW`,
          flowExplain:
            'Follow the "NO policy yet" branch: RLS is on, no policy permits the read, so every row is denied and you get `[]`. Writing the `using (true)` select policy moves you onto the allow path.',
          whyItMatters:
            'The empty-array-with-no-error is the single most common "why is Supabase broken" moment, and it is not broken — it is deny-by-default working exactly as designed. Understanding this turns a frustrating dead end into a two-line fix, and it plants the mental model that RLS is where all of KalaKaara\'s security lives. Module 4 writes dozens of these policies; this is the first, and the simplest.',
          steps: [
            'Query `categories` from React (or from the API Docs sample) as an anonymous caller. Observe an empty array and, importantly, no error.',
            'Confirm the data still exists by running `select * from public.categories` in the SQL Editor — eight rows. The data is fine; access is the issue.',
            'Understand why: the SQL Editor runs privileged and skips RLS; your app arrives as `anon`, RLS is enforced, and no policy permits the read.',
            'Reframe it: deny-by-default is the safe default. A new table leaks nothing until you open it deliberately.',
            'Write the first policy: `for select`, `to anon, authenticated`, `using (true)`.',
            'Re-run the React query and confirm eight rows now come back.',
          ],
          code: `-- The confusing moment: React (as anon) gets [] while the SQL Editor
-- (privileged) sees all 8 rows. The data is fine. RLS is denying the read.

-- THE FIX: your first Row Level Security policy.
-- Categories are public information -- buyers browse them logged out.
create policy "categories are public"
  on public.categories          -- which table
  for select                    -- reads only; insert/update/delete stay denied
  to anon, authenticated        -- BOTH actor roles, named explicitly
  using (true);                 -- row condition: true = every row qualifies

-- Re-run the React query now: the 8 rows appear.

-- If RLS was somehow disabled on the table, this turns it on (Supabase
-- enables it by default on tables created via the Table Editor; for
-- SQL-created tables, be explicit):
alter table public.categories enable row level security;

-- Read every clause:
--   for select            -> only reading is allowed
--   to anon, authenticated-> logged-out AND logged-in callers
--   using (true)          -> no row is filtered out; the list is fully public`,
          pitfalls: [
            '**Assuming an empty array means the query is wrong or the data is missing.** Neither — the data exists and the query is fine; RLS is denying the read. Fix: check for a `select` policy before you debug the query.',
            '**"Fixing" the empty array by reaching for the service_role key.** That bypasses RLS and hands your database to the public (topic t4). Fix: write the correct policy instead; the empty array is telling you a policy is missing.',
            '**Writing `to authenticated` only and forgetting `anon`.** Then logged-out visitors — the main audience — see an empty category list, while you (logged in) see it fine and think it works. Fix: name `anon, authenticated` explicitly for public data.',
            '**Believing you tested access because the SQL Editor showed the rows.** The SQL Editor skips RLS; it never tests the anon path. Fix: test as your app does — anonymous, through the client — or you will ship broken policies.',
            '**Disabling RLS to "make it work".** That removes all protection from the table forever. Fix: keep RLS on and write a narrow policy; never trade security for a quick unblock.',
          ],
          tryIt:
            'Query categories from React and confirm the empty array with no error. Then add the `using (true)` policy and re-query. Watch `[]` become eight rows. You have just experienced deny-by-default and fixed it the right way — the exact loop you will repeat for every table in Module 4.',
          takeaway:
            'A new Supabase table denies every request until you write a policy — that is the safe default, not a bug. The first policy grants `select` to `anon` and `authenticated` with `using (true)`, and the empty array becomes your eight rows.',
        },
        {
          id: 'm2-t10',
          title: 'The supabase-js query API and the { data, error } shape',
          explain:
            'The v2 query builder chains .from().select().eq().order().limit().single(), always returns { data, error }, and you unwrap that shape once in the service layer — throwing on error and returning plain data.',
          analogy:
            'The query builder is like placing an order at a busy dosa counter by pointing: "that table" (from), "these items" (select), "the ones for table four" (eq), "newest first" (order), "just two" (limit). Every order comes back on a tray holding two things: your food, or a slip explaining what went wrong — never both full. The kitchen (your service layer) checks the slip, and if there is a problem it refuses to serve a half-order; otherwise it hands the customer a clean plate with no slip attached.',
          theory:
            'The `supabase-js` v2 client builds queries by chaining methods. Each method narrows or shapes the query, and the chain does not execute until you `await` it. The methods you will use constantly:\n\n**`.from(\'categories\')`** — choose the table. Every query starts here.\n\n**`.select(\'id, name, slug\')`** — choose the columns. Passing specific column names instead of `*` is a habit worth building: it returns less data (faster on mobile, NFR N3 from Module 0) and documents exactly what the caller needs. `.select()` with no arguments returns all columns.\n\n**`.eq(\'slug\', slug)`** — filter: rows where `slug` equals the given value. There is a whole family — `.neq()`, `.gt()`, `.lt()`, `.gte()`, `.lte()`, `.in()`, `.ilike()` for case-insensitive pattern matching — but `.eq()` is the workhorse.\n\n**`.order(\'name\', { ascending: true })`** — sort the results.\n\n**`.limit(20)`** — cap the number of rows. Essential for pagination (Module 13).\n\n**`.single()`** — return one object instead of an array, and treat "not exactly one row" as an error. Use it when you expect exactly one result (fetching by a unique slug). Without it, even a one-row result comes back as a one-element array.\n\nEvery one of these, when awaited, resolves to the same shape: **`{ data, error }`.** This is the most important thing to understand about the API. Supabase **never throws** on a database error — it *returns* the error in the `error` field. On success, `data` holds the rows and `error` is `null`. On failure, `data` is `null` and `error` holds a message. Both fields always exist; exactly one is populated.\n\nHere is the discipline, and it is the reason the services layer exists (topic t7): **you unwrap `{ data, error }` exactly once, in the service function, and you never return that shape to a component.** The service checks `if (error) throw new Error(...)` — converting Supabase\'s return-based errors into thrown exceptions that a React error boundary or a hook\'s `.catch()` can handle uniformly — and then returns plain `data`. A component calling `getCategories()` receives an array or sees an exception; it never sees `{ data, error }`, never writes `if (error)`, and can never forget to check. One unwrap, in one layer, versus forty scattered checks that one day one component forgets. This is the single most valuable pattern in the data layer, and it is why "services return data or throw" is a hard rule.',
          diagram: `graph LR
    B[supabase] --> F[".from('categories')"]
    F --> SEL[".select('id, name, slug')"]
    SEL --> EQ[".eq('slug', slug)"]
    EQ --> OR[".order('name')"]
    OR --> LIM[".limit(20)"]
    LIM --> SG[".single() optional"]
    SG --> AW[await -> returns { data, error }]
    AW --> SVC{service layer unwraps}
    SVC -- error not null --> THROW[throw new Error]
    SVC -- error is null --> RET[return plain data]
    RET --> COMP[component sees clean data, never data/error]`,
          flowExplain:
            'The chain builds the query, `await` yields `{ data, error }`, and the service layer is the single place that unwraps it — throwing on error, returning plain data — so components never touch the raw shape.',
          whyItMatters:
            'Every query in KalaKaara uses this builder and this unwrap pattern, so getting it right once is leverage across the whole app. The "services throw, components never see { data, error }" rule is exactly what interviewers probe when they ask "how do you handle errors in your data layer" — the answer is centralised unwrapping, not scattered checks.',
          steps: [
            'Write a `categoryService.js` in `src/services/` that imports the singleton `supabase` client.',
            'Build the query: `.from(\'categories\').select(\'id, name, slug\').order(\'name\')`.',
            'Await it and destructure `{ data, error }`.',
            'Check `if (error) throw new Error(...)` with a message that names the operation.',
            'Return plain `data` (mapped to camelCase if needed) — never `{ data, error }`.',
            'Use `.single()` in a second function that fetches one category by slug, and understand it errors if zero or many rows match.',
          ],
          code: `// src/services/categoryService.js
// The ONLY layer that touches supabase, and the ONLY place we unwrap
// { data, error }. Components call these functions and get data, or an
// exception -- never the raw Supabase shape.
import { supabase } from '../supabase/client';

// Map snake_case columns -> camelCase, once, here.
const toCategory = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
});

// Return an array of categories, or throw.
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) throw new Error(\`Could not load categories: \${error.message}\`);
  return data.map(toCategory); // plain array. Caller never sees { data, error }.
}

// Fetch exactly one category by slug. .single() makes "not one row" an error.
export async function getCategoryBySlug(slug) {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (error) throw new Error(\`Category "\${slug}" not found: \${error.message}\`);
  return toCategory(data);
}`,
          pitfalls: [
            '**Returning `{ data, error }` from a service to the caller.** Every component must then remember its own `if (error)` check, and one will forget and swallow the error silently. Fix: unwrap once in the service — throw on error, return plain data.',
            '**Expecting Supabase to throw on a database error.** It does not; it returns the error in the `error` field, so an unchecked query looks like it "worked" while `data` is null. Fix: always destructure and check `error` in the service.',
            '**Using `.single()` when zero or many rows are possible.** `.single()` treats anything but exactly one row as an error, so a legitimately empty result throws. Fix: use `.single()` only for by-unique-key lookups; use plain `.select()` (returning an array) otherwise.',
            '**Selecting `*` everywhere.** It fetches columns you do not need, wasting bandwidth on mobile and hiding what the query actually depends on. Fix: name the columns you use.',
            '**Forgetting to `await` the query.** An un-awaited builder is a pending object, not a result, and destructuring `{ data, error }` from it gives `undefined`. Fix: `await` before destructuring.',
          ],
          tryIt:
            'Call `getCategoryBySlug(\'does-not-exist\')` and observe that `.single()` causes it to throw rather than return null. Then change it to `.maybeSingle()` and observe that a no-match now returns `null` data with no error. Knowing the difference between `.single()` and `.maybeSingle()` saves hours of confusion.',
          takeaway:
            'The v2 builder chains `.from().select().eq().order().limit().single()` and always resolves to `{ data, error }`. Unwrap that shape once in the service — throw on error, return plain data — so components never see it and can never forget to check.',
        },
        {
          id: 'm2-t11',
          title: 'The useCategories hook and rendering all four states',
          explain:
            'You write a useCategories hook that returns exactly { data, loading, error } with a cancelled-cleanup guard, then render a CategoryChip list that handles loading, empty, error, and data — in that order.',
          analogy:
            'A hook is like the seva counter clerk who takes your token and stands between you and the kitchen. While the food is being made, the clerk holds up a "please wait" sign (loading); if the kitchen sends back a problem slip, the clerk shows it to you (error); if the pot is empty, the clerk says "sold out today" (empty); and only when a full plate arrives does the clerk hand it over (data). A good clerk never leaves you staring at a blank counter wondering what is happening.',
          theory:
            'The service layer returns data or throws. The hook layer turns that into React state that a component can render. Every hook in KalaKaara returns **exactly `{ data, loading, error }`** — that precise shape, from Module 0 — so that any list component can be written the same way and copy-pasted correctly.\n\nInside `useCategories`, three pieces of state: `data` (starts `null` or `[]`), `loading` (starts `true`, because you begin fetching immediately), and `error` (starts `null`). A `useEffect` runs the fetch on mount: set loading true, call `getCategories()`, and on resolution set `data`; on rejection set `error`; in either case set `loading` false.\n\nThe subtle-but-essential part is the **cancelled cleanup guard.** A `useEffect` can start a fetch and then the component unmounts — or its dependencies change and the effect re-runs — before the fetch resolves. If the late response then calls `setData`, React either warns about setting state on an unmounted component, or worse, a stale response overwrites fresh data (the user navigated to a new filter, the old request resolves last, and stale results win). The guard is a local `let cancelled = false;` that the cleanup function sets to `true`. Every state setter is wrapped in `if (!cancelled)`. When the effect tears down, `cancelled` flips, and any late-arriving response quietly does nothing. Every data hook in this course carries this guard; it is not optional.\n\nThen the component renders **four states, written in this exact order: loading → empty → error → data.** The order is not arbitrary — it is the order Module 0 mandated, and it is the order that produces a UI that does not fall apart on a slow connection. **Loading first**, because on a 4G phone in Kundapura that is the first thing the user sees, and a blank screen reads as broken. **Error second**, because a failed request must show a message and ideally a retry, not silently render nothing. **Empty third**, because "zero categories" is a real, legitimate state that needs its own friendly copy, not an accidental blank. **Data last**, the happy path, which is genuinely the least of your worries because it is the one case that obviously works.\n\nThe `<CategoryChip>` is a pure presentational component (it lives in `components/`, never touches Supabase — topic t7): it takes a category and renders a rounded pill with the name. The list maps over `data` and renders one chip each. Write the skeleton, empty, and error branches *before* the `.map()`, and your first list is robust from the first commit rather than robust "later" — which, as every developer learns, never arrives.',
          diagram: `graph TD
    M[Component mounts] --> H[useCategories runs useEffect]
    H --> L[loading = true]
    L --> C[call getCategories from service]
    C --> R{resolves?}
    R -- rejects --> E[if not cancelled: set error]
    R -- resolves --> D[if not cancelled: set data]
    E --> LF[loading = false]
    D --> LF
    LF --> RENDER{render, in THIS order}
    RENDER --> S1[1. loading -> Skeleton chips]
    RENDER --> S2[2. error -> message + retry]
    RENDER --> S3[3. empty -> friendly copy]
    RENDER --> S4[4. data -> map CategoryChip]
    UM[unmount / deps change] -.cleanup sets cancelled = true.-> R`,
          flowExplain:
            'The dotted cleanup arrow is the guard: if the component unmounts or re-fetches before the request resolves, `cancelled` flips and the late response updates nothing. The four render branches run strictly loading → error → empty → data.',
          whyItMatters:
            'This topic ties the whole module together: env-configured client → services layer → hook → component, with security enforced by the RLS policy from t9. The `{ data, loading, error }` shape and the four-state render are patterns you will repeat for artists, artworks, reviews, and favourites. The cancelled guard is the exact detail that separates a hook that works in a demo from one that survives real navigation — and it is a common interview question.',
          steps: [
            'Create `src/hooks/useCategories.js` with three `useState` calls: `data`, `loading` (initial `true`), `error`.',
            'In a `useEffect`, declare `let cancelled = false;`, call `getCategories()`, and guard every setter with `if (!cancelled)`.',
            'Return a cleanup function that sets `cancelled = true`.',
            'Return exactly `{ data, loading, error }` — that shape, no other.',
            'Create a presentational `<CategoryChip>` in `components/` that renders a category name as a pill and imports no service.',
            'In the component, render loading, error, empty, and data branches in that order — skeleton and empty copy written before the `.map()`.',
          ],
          code: `// src/hooks/useCategories.js
import { useEffect, useState } from 'react';
import { getCategories } from '../services/categoryService';

export function useCategories() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;             // the guard against late responses
    setLoading(true);
    getCategories()
      .then((rows) => { if (!cancelled) setData(rows); })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; }; // flips on unmount / re-run
  }, []);

  return { data, loading, error };     // this exact shape. Always.
}

// src/components/CategoryChip/CategoryChip.jsx  -- presentational. No Supabase.
export function CategoryChip({ category }) {
  return <span className="category-chip">{category.name}</span>;
}

// Rendering all four states, in the mandated order.
function CategoryList() {
  const { data, loading, error } = useCategories();

  if (loading) return <ChipSkeleton count={8} />;                 // 1. loading
  if (error) return <ErrorState message={error.message} />;       // 2. error
  if (!data.length) return <EmptyState label="No categories yet" />; // 3. empty
  return (                                                         // 4. data
    <div className="chip-row">
      {data.map((c) => <CategoryChip key={c.id} category={c} />)}
    </div>
  );
}`,
          pitfalls: [
            '**Omitting the cancelled guard.** A late response then sets state on an unmounted component (React warns) or a stale response overwrites fresh data. Fix: `let cancelled = false;`, guard every setter, flip it in cleanup.',
            '**Returning a different shape from the hook.** `{ categories, isLoading }` here and `{ data, loading }` elsewhere means no list component can be reused. Fix: every hook returns exactly `{ data, loading, error }`.',
            '**Writing the `.map()` first and adding loading/empty/error "later".** Later never comes, and the first user on a slow connection sees a blank screen. Fix: write skeleton, error, and empty branches before the happy path.',
            '**Initialising `loading` to `false`.** Then the first render shows the empty state for a flash before the fetch starts. Fix: `loading` starts `true` because you fetch on mount.',
            '**Letting `<CategoryChip>` import a service or the client.** That breaks the boundary from topic t7 and makes the component untestable. Fix: chips receive a category as a prop and render — nothing else.',
          ],
          tryIt:
            'Force each of the four states: render the list normally (data), drop the RLS policy from t9 and watch it become empty, throw inside `getCategories` to see the error branch, and add an artificial delay to see the skeleton. If all four render cleanly, your first end-to-end feature is genuinely production-shaped.',
          takeaway:
            '`useCategories` returns exactly `{ data, loading, error }` with a cancelled-cleanup guard, and the component renders loading → error → empty → data in that order. That shape and that ordering are the template for every list in KalaKaara.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm2-p1',
      type: 'Mini Project',
      title: 'Categories, End to End',
      domain: 'Supabase Setup & Data Layer',
      duration: '2 hours',
      description:
        'Wire the complete vertical slice for one table, from Postgres to a rendered chip row: a `categories` table with a real seed of 20-plus art categories, RLS enabled with a public-read policy, the client singleton, a category service, a `useCategories` hook, and a CategoryChip row that handles loading, empty, error, and data. Along the way you deliberately drop the policy and watch the list go empty, so that deny-by-default becomes something you have felt rather than merely read.',
      tools: ['React', 'Vite', 'Supabase', 'PostgREST', 'JavaScript', 'CSS'],
      blueprint: {
        overview:
          'One table, taken all the way through the stack, so that every later table in Module 4 is a repeat of a path you already walked. You create and seed `categories` in the SQL Editor, protect it with a single public-read RLS policy, configure the client singleton behind `.env.local`, write a service that unwraps `{ data, error }`, expose it through a `{ data, loading, error }` hook, and render a chip row with all four states. The load-bearing step is temporarily dropping the policy: the list goes empty with no error, and you see deny-by-default with your own eyes before restoring the policy.',
        functionalRequirements: [
          '**A `categories` table.** `id uuid primary key default gen_random_uuid()`, `name text not null`, `slug text not null unique`, `created_at timestamptz default now()`, created via SQL in the editor.',
          '**A real seed of 20+ categories.** Genuine KalaKaara art categories (portrait, wall painting, mural, oil, watercolour, pencil/charcoal, digital, illustration, cartoon, caricature, calligraphy, sculpture, and more), each with a unique slug.',
          '**RLS enabled with one public-read policy.** `for select to anon, authenticated using (true)` — categories are public; insert/update/delete stay denied.',
          '**The client singleton.** `src/supabase/client.js` calls `createClient` once, reads env via `import.meta.env`, and throws a clear error if a variable is missing.',
          '**A category service.** `src/services/categoryService.js` with `getCategories()` and `getCategoryBySlug()`, both unwrapping `{ data, error }` and returning plain data or throwing.',
          '**A `useCategories` hook.** Returns exactly `{ data, loading, error }` with a cancelled-cleanup guard.',
          '**A CategoryChip row with four states.** Loading (skeleton), empty, error, and data — rendered in that order, with `<CategoryChip>` a pure presentational component.',
          '**The drop-policy observation.** A documented step where you drop the select policy, reload, observe the empty array with no error, then recreate the policy.',
        ],
        technicalImplementation: [
          '**SQL in the editor, saved to the repo.** Keep the `create table`, the seed `insert`, and the policy in a `db/` SQL file so the schema is reproducible, not click-built.',
          '**`.env.local` + `.env.example`.** Real values in the gitignored `.env.local`; placeholder keys in the committed `.env.example`. Both variables carry the `VITE_` prefix; the anon key only.',
          '**The services boundary.** `src/services/README.md` states that only `services/` imports the client. The hook calls the service; the component calls the hook; nothing else touches Supabase.',
          '**snake_case to camelCase mapping** happens once, in `categoryService.js`, via a `toCategory` mapper.',
          '**Four-state rendering** with the skeleton and empty branches written before the `.map()`, using the `{ data, loading, error }` shape returned by the hook.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Table, 20+ seed, and the public-read policy',
            outcome:
              'A categories table, seeded with 20+ real art categories, protected by a single public-read RLS policy — all as saved SQL.',
            prompt:
              'In the Supabase SQL Editor, write and run SQL that: (a) creates `public.categories` with `id uuid primary key default gen_random_uuid()`, `name text not null`, `slug text not null unique`, and `created_at timestamptz default now()`; (b) inserts at least 20 real art categories drawn from the KalaKaara domain — portrait painting, wall painting, mural art, oil painting, watercolour, pencil and charcoal sketch, digital art, illustration, cartoon, caricature, calligraphy, customised gifts, wedding portraits, pet portraits, home decor, office wall art, religious art, handmade craft, sculpture, and traditional art — each with a unique URL-safe slug, supplying only name and slug so the defaults fill id and created_at; (c) enables row level security with `alter table public.categories enable row level security`; and (d) creates a policy named "categories are public" for select, to anon and authenticated, using (true). Explain each clause in a comment. Save the whole thing into `db/001_categories.sql` in the repo so the schema is reproducible.',
          },
          {
            step: 2,
            label: 'Env config and the client singleton',
            outcome:
              'A gitignored .env.local, a committed .env.example, and src/supabase/client.js that creates the client once and fails loudly if env is missing.',
            prompt:
              'Create `.env.local` (gitignored) with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set to the real values from Supabase Settings -> API, using the anon public key only. Create a committed `.env.example` with the same two keys and placeholder values. Confirm `.gitignore` excludes `.env.local`. Then write `src/supabase/client.js` that reads both variables from `import.meta.env`, throws a clear error naming the fix if either is missing, calls `createClient(url, anonKey)` exactly once, and exports the instance as a named `supabase` constant. Add a comment explaining why there must be only one client (shared auth session and a single onAuthStateChange listener) and why the service_role key must never appear here.',
          },
          {
            step: 3,
            label: 'The category service behind the boundary',
            outcome:
              'src/services/categoryService.js with getCategories and getCategoryBySlug that unwrap { data, error }, plus a services/README.md stating the boundary rule.',
            prompt:
              'Write `src/services/categoryService.js` importing the singleton `supabase` client. Add a private `toCategory` mapper turning a snake_case row into a camelCase object. Export `getCategories()` that runs `.from(\'categories\').select(\'id, name, slug\').order(\'name\', { ascending: true })`, destructures `{ data, error }`, throws `new Error(...)` with a descriptive message if error is set, and otherwise returns `data.map(toCategory)`. Export `getCategoryBySlug(slug)` that adds `.eq(\'slug\', slug).single()` and throws if not found. Then write `src/services/README.md` stating that this is the only folder allowed to import the Supabase client, that components and pages never import it, that services return data or throw (never { data, error }), and that snake_case to camelCase mapping happens here. Include the guardrail grep command.',
          },
          {
            step: 4,
            label: 'The useCategories hook and the four-state chip row',
            outcome:
              'A useCategories hook returning { data, loading, error } with a cancelled guard, a presentational CategoryChip, and a list rendering loading, error, empty, and data in that order.',
            prompt:
              'Write `src/hooks/useCategories.js` returning exactly `{ data, loading, error }`: `data` initial `[]`, `loading` initial `true`, `error` initial `null`; a `useEffect` with `let cancelled = false`, calling `getCategories()` and guarding every state setter with `if (!cancelled)`, and a cleanup that sets `cancelled = true`. Write a presentational `src/components/CategoryChip/CategoryChip.jsx` that takes a `category` prop and renders its name as a rounded pill, importing no service and no client. Write a `CategoryList` component using the hook and rendering four branches strictly in this order: loading -> a skeleton row of eight placeholder chips; error -> a message with a retry affordance; empty -> friendly "no categories yet" copy; data -> a flex row mapping `data` to `<CategoryChip>`. Add plain CSS for the chips and the skeleton (no Tailwind).',
          },
          {
            step: 5,
            label: 'Feel deny-by-default: drop the policy, observe the empty array',
            outcome:
              'A documented experiment proving RLS deny-by-default: the list goes empty with no error when the policy is dropped, and returns when it is recreated.',
            prompt:
              'Guide me through an experiment and record it in `db/002_rls_experiment.md`. First confirm the chip row renders all 20+ categories. Then, in the SQL Editor, run `drop policy "categories are public" on public.categories;` and reload the app. Observe that the list renders the EMPTY state, with no error thrown and no crash — because RLS is enabled but now has no policy permitting anon to select, so every row is denied. Confirm in the SQL Editor that `select * from public.categories` still returns all rows (the SQL Editor runs privileged and skips RLS), proving the data is intact and only access changed. Write two or three sentences explaining that this is the safe default, not a bug, and that the fix is never the service_role key but always the correct policy. Finally, recreate the policy (`create policy "categories are public" on public.categories for select to anon, authenticated using (true);`), reload, and confirm the chips return.',
          },
        ],
        deliverable:
          'A running app that renders a row of 20-plus art-category chips fetched from Supabase through a singleton client, a services boundary, and a four-state hook, protected by a public-read RLS policy — plus a short written record of dropping the policy and watching the list go empty, so deny-by-default is something you have experienced. Every table in Module 4 is now just a repeat of this exact path.',
      },
    },
  ],
  quiz: [
    {
      id: 'm2-q1',
      q: 'Your React app queries the categories table and receives an empty array with no error, even though the SQL Editor clearly shows eight rows. What is the cause?',
      options: [
        'The Supabase project has paused due to inactivity',
        'The anon key is wrong, so the request silently fails',
        'RLS is enabled on the table but no policy permits the anon role to select, so every row is denied by default',
        'The categories were inserted into the wrong schema and are not exposed',
      ],
      answer: 2,
    },
    {
      id: 'm2-q2',
      q: 'Why is it safe for the Supabase anon key to ship in your public JavaScript bundle?',
      options: [
        'The anon key only identifies the caller as anonymous or authenticated; Row Level Security policies decide what that caller may actually read or write',
        'Vite encrypts the anon key when it inlines it at build time',
        'The anon key rotates automatically every few minutes, so a leak is harmless',
        'It is not actually safe, but there is no alternative without a backend server',
      ],
      answer: 0,
    },
    {
      id: 'm2-q3',
      q: 'What is the correct response when a query returns nothing because of a missing RLS policy?',
      options: [
        'Switch the client to the service_role key so the query bypasses RLS',
        'Write the correct RLS policy that permits the intended role to read the rows',
        'Disable Row Level Security on the table entirely',
        'Add the service_role key to .env.local with a VITE_ prefix',
      ],
      answer: 1,
    },
    {
      id: 'm2-q4',
      q: 'What does the VITE_ prefix on an environment variable actually do in a Vite project?',
      options: [
        'It marks the variable as a server-only secret that never reaches the browser',
        'It tells Vite to read the value from process.env instead of import.meta.env',
        'It encrypts the value so it can safely hold real secrets',
        'It exposes the variable to client code and inlines its value into the public bundle at build time',
      ],
      answer: 3,
    },
    {
      id: 'm2-q5',
      q: 'Why must createClient be called only once, in a single client.js file that everything else imports?',
      options: [
        'Calling it more than once is a syntax error that Vite rejects at build time',
        'Multiple clients each register their own auth session and onAuthStateChange listener, which drift apart and cause login/logout bugs',
        'The Supabase free tier bills per client instance created',
        'A second createClient call overwrites the first and erases the database connection',
      ],
      answer: 1,
    },
    {
      id: 'm2-q6',
      q: 'A Supabase query resolves to { data, error }. Where should that shape be unwrapped, and how?',
      options: [
        'In each component, with an if (error) check before rendering',
        'In the hook, by returning { data, error } straight through to the component',
        'In the service function, which throws on error and returns plain data so the caller never sees { data, error }',
        'Nowhere; components should read data and error directly from the Supabase response',
      ],
      answer: 2,
    },
    {
      id: 'm2-q7',
      q: 'In what order should a list component render its states, and why does the order matter?',
      options: [
        'loading, then error, then empty, then data — because loading is what a user on a slow connection sees first, errors and empties are real states needing their own copy, and the happy path is the least of your worries',
        'data, then loading, then error, then empty — render the happy path first and handle the rest afterwards',
        'error, then data, then loading, then empty — surface failures before anything else',
        'The order does not matter as long as all four states appear somewhere',
      ],
      answer: 0,
    },
  ],
}
