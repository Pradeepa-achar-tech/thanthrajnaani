// Module 1 — Project Overview, Requirements & Architecture
// KalaKaara (React + Supabase) course content for the React course player.

export const m0 = {
  id: 'm0',
  title: 'Project Overview & Architecture',
  hours: 5,
  color: 'from-slate-500/20 to-slate-700/10',
  accent: 'slate',
  description:
    'Before a single line of code: understand exactly what KalaKaara is, who uses it, which features ship in the MVP, why React + Supabase beats a hand-rolled backend for this problem, how every service in the stack stays genuinely free with no credit card, and how the folders you create in Module 2 map onto that architecture.',
  sections: [
    {
      id: 'm0-s1',
      title: 'The product: what we are building and for whom',
      topics: [
        {
          id: 'm0-t1',
          title: 'KalaKaara — the problem, the users, the product',
          explain:
            'KalaKaara is a discovery marketplace that connects artists — wall painters, portrait artists, calligraphers, sculptors — with people who want artwork made.',
          analogy:
            'Think of the notice board outside the Kundapura bus stand. Artists pin small cards: "Wedding portraits, ₹3000, call this number." A customer walks past, squints, calls one. It works, but the board has no search, no way to see past work, no way to tell a good artist from a confident one, and it only reaches people who physically walk past it. KalaKaara is that notice board rebuilt properly: searchable, photo-rich, reputation-aware, and visible from anywhere.',
          theory:
            'Every marketplace has a **supply side** and a **demand side**, and the two have completely different needs.\n\nOn the **supply side** are artists. An artist wants a professional-looking public page: a profile photo, a cover image, a bio, years of experience, the categories they work in (portrait, mural, calligraphy), their pricing, their availability, links to Instagram, and — critically — a portfolio of their actual artwork with images. They also want to control **where** they take work: some paint murals only within 25 km of Udupi, some ship canvases anywhere in India.\n\nOn the **demand side** are visitors. A visitor wants to browse and search **without being forced to sign up**. Forcing a login before a stranger has seen a single artwork is the fastest way to lose them. Only when the visitor wants something that costs the artist something — a phone number, a WhatsApp message, a saved favourite, a public review — do we ask them to sign in with Google.\n\nThat asymmetry is the single most important product decision in this course, and it drives the database design (Module 4), the Row Level Security policies (Module 4), and the auth flow (Module 5). **Public read, authenticated write, owner-only edit.** Memorise that phrase; you will implement it four different ways before this course ends.',
          whyItMatters:
            'Beginners build the login wall first because it feels like the "serious" part. Real marketplaces do the opposite: they make the browsing experience free and frictionless, then charge friction only where it buys the user something. Getting this ordering right up front means you never have to unpick a login wall from twelve components later.',
          steps: [
            'Write down, in one sentence, who the two sides of this marketplace are: **artists who want to be found**, and **buyers who want to find them**.',
            'For each side, list the top three things they need. Artists: a credible profile, a portfolio, control over service area. Buyers: search, proof of quality, a way to make contact.',
            'Circle every buyer action that costs the artist something real: viewing a phone number, sending WhatsApp, leaving a review. These are your login-gated actions.',
            'Everything not circled — browsing, searching, filtering, viewing artwork — must work for a logged-out stranger. Write that rule on a sticky note.',
            'Name the app. We use **KalaKaara** (ಕಲಾಕಾರ, "artist" in Kannada) throughout this course.',
          ],
          code: `KalaKaara — one-paragraph product spec

  For:        people who want custom artwork made (portraits, murals, calligraphy)
  Who:        cannot easily find, evaluate, or contact local artists
  KalaKaara:  is an artist discovery marketplace
  That:       lets artists publish a portfolio and define where they work,
              and lets anyone search those artists by category and location
  Unlike:     a phone directory or an Instagram hashtag
  Our product: is searchable by service area, shows real portfolio images,
              carries verified reviews, and never asks a browser to sign up.

Login is required for exactly five actions:
  1. View an artist's phone number
  2. Open WhatsApp to an artist
  3. Save an artist as a favourite
  4. Write a review
  5. Manage your own artist profile

Everything else works signed out. Every single thing.`,
          pitfalls: [
            '**Building the login page first.** It feels productive and it is the most common beginner ordering. It also means you will discover, in Module 10, that half your queries assumed a logged-in user. Fix: assume **anonymous** is the default caller everywhere, and treat a logged-in user as the exception.',
            '**Treating "artist" as a user role stored on the user record.** An artist is not a *type* of account, it is a *profile a user has created*. Any signed-in user can become an artist by filling in an artist profile. Fix: separate `profiles` (every user) from `artists` (the subset who published a profile) — Module 4 does exactly this.',
            '**Designing for the artist first because the artist screens are more fun to build.** Ninety-nine percent of page views will be buyers browsing. Fix: design the browse and search experience first; the artist dashboard is a smaller, later, simpler surface.',
            '**Deciding features by listing screens.** Screens are an output, not an input. Fix: list *user goals*, then derive the screens that serve them. A screen with no goal behind it always gets built and never gets used.',
          ],
          tryIt:
            'Open a blank note. Write the five login-gated actions from memory, then write five actions that must work signed out. If you cannot fill the second list faster than the first, re-read the theory section — the anonymous path is the main path.',
          takeaway:
            'KalaKaara is public-read by default. Login buys the user contact details, favourites, reviews, and a profile of their own — nothing else.',
        },
        {
          id: 'm0-t2',
          title: 'Functional vs non-functional requirements',
          explain:
            'Functional requirements say what the system does. Non-functional requirements say how well it must do it — and they are the ones that quietly decide your architecture.',
          analogy:
            'A restaurant menu lists functional requirements: dosa, idli, filter coffee. The non-functional requirements are never printed but decide everything about the kitchen: food arrives in under ten minutes, the dosa is hot, the kitchen passes a health inspection, and the whole thing works when two hundred people walk in after a temple festival. Nobody orders "under ten minutes," but the kitchen layout is designed around it.',
          theory:
            '**Functional requirements** are the verbs. "A visitor can filter artists by category." "An artist can upload up to twenty portfolio images." "A signed-in user can favourite an artist." They are testable: you either can or cannot do the thing.\n\n**Non-functional requirements** (NFRs) are the adverbs. They describe qualities: performance, security, cost, accessibility, availability. They sound soft, and beginners skip them, but they are what actually constrain the design. For KalaKaara, four NFRs shape every decision in this course:\n\n**1. Cost: ₹0, and no credit card, ever.** Not "cheap." Not "free tier that asks for a card just in case." This single constraint eliminates Google Places (billing account required), Firebase Storage (Blaze plan required for new buckets), and AWS anything. It is why we choose Supabase and Vercel, and it is why Module 9 teaches a location system that does not depend on a paid geocoding API.\n\n**2. Security: the database is the last line of defence, not the UI.** A hidden phone number in React is not hidden — anyone can open DevTools, read the network response, and see it. Contact details must be withheld by **Postgres itself**, via Row Level Security, based on whether the caller is authenticated. This NFR is the entire reason Module 4 spends so long on RLS.\n\n**3. Performance: a search must feel instant on a 4G phone in Kundapura.** That rules out fetching all artists and filtering in JavaScript. It forces server-side filtering, database indexes, and pagination — Modules 4, 10 and 14.\n\n**4. Accessibility & SEO: an artist profile must be readable by a screen reader and findable by Google.** This forces semantic HTML, real `<h1>` tags, alt text on every artwork image, and meaningful page titles — Module 16.\n\nNotice that not one of those four NFRs is a feature, and every one of them changes the code you write.',
          whyItMatters:
            'In a job interview, "tell me about a project" answers that list features are forgettable. Answers that say "our hard constraint was zero cost with no card, which ruled out Google Places, so we seeded India\'s administrative hierarchy into Postgres and did radius search with the Haversine formula in plain SQL" are the ones that get callbacks. NFRs are where engineering judgment lives.',
          steps: [
            'Write the four NFRs on a card and keep it visible: **zero cost / no card**, **security enforced in the database**, **instant search on mobile data**, **accessible and indexable**.',
            'For each functional requirement you later implement, ask: which of these four does it threaten? Uploading images threatens cost (storage) and performance (image size).',
            'Note which NFRs are impossible to retrofit. Security-in-the-database and accessible markup are cheap now and brutally expensive later.',
            'Accept that NFR #1 forces a trade-off you will feel in Module 9. Write down now that you are comfortable with that.',
          ],
          code: `KalaKaara — requirements summary

FUNCTIONAL (what it does)
  F1  Anonymous visitors browse, search, and filter artists
  F2  Anonymous visitors view artist profiles and artwork galleries
  F3  Users sign in with Google (only Google — no passwords to leak)
  F4  Signed-in users reveal contact details, favourite artists, write reviews
  F5  Signed-in users create and manage one artist profile
  F6  Artists upload profile, cover, and portfolio images
  F7  Artists declare multiple service areas (country / state / district /
      taluk / city / radius)
  F8  Search matches an artist if ANY of their service areas covers the
      searched location
  F9  Results sort by newest, rating, price, experience, alphabetical

NON-FUNCTIONAL (how well)
  N1  COST      Every service free, no credit card at any signup
  N2  SECURITY  Contact details withheld by Postgres RLS, not by React
  N3  SPEED     Filtered, paginated, indexed queries — never fetch-all-and-filter
  N4  REACH     Semantic HTML, alt text, real page titles, screen-reader safe

N1 rules out: Google Places API, Firebase Storage (new buckets), AWS S3
N2 rules out: "just hide the phone number with a CSS class"
N3 rules out: .select('*') on the artists table
N4 rules out: <div onClick> where a <button> belongs`,
          pitfalls: [
            '**Writing NFRs as vague adjectives.** "The app should be fast" is not a requirement, it is a wish. Fix: make it falsifiable — "search results render in under 500 ms on a 4G connection with 500 artists in the database." Now you can test it.',
            '**Assuming security is a feature you add at the end.** By then, twelve components already read `artist.phone` from a response that should never have contained it. Fix: design the query shape around the security rule from day one.',
            '**Treating "free" as "free tier."** Many "free tiers" require a card on file and silently start charging. Fix: the test is not the price, it is whether the signup form asks for a card. Apply that test to every service before you depend on it.',
            '**Skipping accessibility because "it is just a learning project."** Accessible markup is not extra work, it is *correct* work — `<button>` is fewer characters than `<div onClick>`. Fix: use the right element from the first commit.',
          ],
          tryIt:
            'Take functional requirement F4 ("signed-in users reveal contact details"). Write down two ways to implement it: one that satisfies NFR N2 and one that violates it. If you cannot describe the violating version, you do not yet understand why RLS exists — that is fine, Module 4 will make it vivid.',
          takeaway:
            'Features tell you what to build. Non-functional requirements tell you how to build it — and they are the ones that eliminate whole technologies from consideration.',
        },
        {
          id: 'm0-t3',
          title: 'The three actors: anonymous visitor, signed-in user, artist',
          explain:
            'KalaKaara has exactly three actors, and every table policy you write in Module 4 answers the question "which of these three is calling?"',
          analogy:
            'A temple has three kinds of people inside it. Anyone can walk in and look at the deity — no questions, no register. To make a seva booking you write your name in the register. To stand behind the counter and change what sevas are offered, you must be the archaka whose counter it is. Anonymous visitor, signed-in user, owner. Nothing else.',
          theory:
            'An **anonymous visitor** has no account. In Supabase terms, their requests carry the `anon` key and their `auth.uid()` is `null`. They can read: the artists list, artist profiles (minus contact details), artworks, categories, reviews, and average ratings. They cannot write anything, anywhere.\n\nA **signed-in user** has authenticated with Google. Their requests carry a JWT and `auth.uid()` returns their user id. They can do everything an anonymous visitor can, plus: read contact details, insert a row into `favorites`, insert a row into `reviews`, and create their own artist profile.\n\nAn **artist** is not a separate account type. An artist is simply a signed-in user **who owns a row in the `artists` table**. Ownership is what grants power: they may update *their* artist row, insert artworks whose `artist_id` points at *their* row, and delete *their* artworks. They have no special powers over anyone else\'s data. In SQL, "is this person the artist?" is literally the expression `artists.user_id = auth.uid()`.\n\nThis is worth sitting with. There is no `role` column. There is no `is_artist` boolean to keep in sync. There is no admin panel that flips someone into artist mode. **Ownership of a row is the role.** That design removes an entire category of bug — the "user says they are an artist but the artists table disagrees" bug — because there is only one source of truth.',
          diagram: `graph TD
    A[Person opens KalaKaara] --> B{Signed in with Google?}
    B -- No --> C[Anonymous visitor<br/>auth.uid is null]
    B -- Yes --> D[Signed-in user<br/>auth.uid = their id]
    C --> C1[Browse artists]
    C --> C2[Search and filter]
    C --> C3[View artwork gallery]
    C --> C4[See profile minus phone/WhatsApp]
    D --> D1[Everything a visitor can do]
    D --> D2[Reveal contact details]
    D --> D3[Save favourites]
    D --> D4[Write reviews]
    D --> E{Owns a row in artists table?}
    E -- No --> F[Just a buyer]
    E -- Yes --> G[Artist<br/>artists.user_id = auth.uid]
    G --> G1[Edit own profile]
    G --> G2[Upload own artwork]
    G --> G3[Set own service areas]`,
          flowExplain:
            'Read the diamond at the bottom carefully: being an artist is decided by a row existing, not by a flag being true. That is the whole authorisation model of this application in one shape.',
          whyItMatters:
            'Almost every authorisation bug in real applications comes from storing the same fact in two places — a `role` column *and* a table of owned rows — and letting them drift apart. Deriving the role from ownership means they can never disagree, because there is only one of them.',
          steps: [
            'For each of the three actors, write what `auth.uid()` returns for them: `null`, a UUID, a UUID.',
            'Note that the difference between "signed-in user" and "artist" is not in the auth system at all — it is a row in a table.',
            'For each feature in the F-list from the previous topic, write which actor it belongs to.',
            'Convince yourself there is no fourth actor. There is no admin in this course; moderation is listed as a future enhancement in Module 16.',
            'Predict the shape of the RLS policy that will protect artist updates. It will look like `using (user_id = auth.uid())`. You just designed it.',
          ],
          code: `-- A preview of Module 4. Do not run this yet; just read the shape.
-- Three actors, three kinds of policy.

-- 1. ANONYMOUS: anyone at all may read published artists.
create policy "artists are publicly readable"
  on public.artists for select
  to anon, authenticated          -- both actors, explicitly
  using (is_published = true);

-- 2. SIGNED-IN USER: only a logged-in person may favourite,
--    and only on their own behalf.
create policy "users manage their own favourites"
  on public.favorites for insert
  to authenticated                -- anon cannot reach this at all
  with check (user_id = auth.uid());

-- 3. ARTIST (= owner of the row): only the owner may edit.
create policy "artists update their own profile"
  on public.artists for update
  to authenticated
  using (user_id = auth.uid())         -- which rows they may target
  with check (user_id = auth.uid());   -- what they may leave behind

-- Notice: nowhere is there a role column.
-- "Artist" is spelled: artists.user_id = auth.uid()`,
          pitfalls: [
            '**Adding an `is_artist` boolean to the profiles table.** It will drift out of sync with the `artists` table the first time an artist deletes their profile. Fix: derive it — `select exists(select 1 from artists where user_id = auth.uid())`.',
            '**Confusing `using` and `with check` in an UPDATE policy.** `using` decides which existing rows you may target; `with check` decides what the row is allowed to look like afterwards. Omit `with check` and an artist can reassign their row to another user\'s id. Fix: on UPDATE, write both, and make them identical unless you have a specific reason.',
            '**Forgetting that `anon` is a real, named Postgres role in Supabase.** Policies that only say `to authenticated` silently deny every logged-out visitor — which is correct for `favorites` and catastrophic for `artists`. Fix: name the roles explicitly on every policy.',
            '**Modelling an admin actor "just in case."** It doubles the policy surface and you will never use it in this course. Fix: build the three real actors; add admin later, deliberately, when a real moderation requirement exists.',
          ],
          tryIt:
            'Write, in plain English, the policy that should protect `artworks` on DELETE. Then write it as a `using (...)` clause. Hint: an artwork does not have a `user_id` column — it has an `artist_id`. You will need a subquery, and you will meet exactly that subquery in Module 4.',
          takeaway:
            'Three actors: anonymous, signed-in, owner. "Artist" is not a role you are granted — it is a row you own.',
        },
        {
          id: 'm0-t4',
          title: 'Feature planning: what ships in the MVP, what waits',
          explain:
            'Sixteen modules is a lot of runway, but scope still has to be cut deliberately rather than accidentally.',
          analogy:
            'When a family builds a house in Kundapura, they finish the kitchen, one bedroom, and the bathroom, then move in and live there while the upstairs stays bare concrete for two years. That is not failure — that is sequencing. The house is *usable* at every stage. A half-plumbed house with beautiful cornices is not.',
          theory:
            'A **Minimum Viable Product** is not the smallest thing you can build. It is the smallest thing that delivers the core loop end to end. For KalaKaara the core loop is: *an artist publishes a profile with artwork → a buyer searches and finds them → the buyer contacts them.* If any link in that chain is missing, nothing else matters. Favourites are lovely. Reviews are lovely. Neither creates a single connection between an artist and a buyer.\n\nSo we sequence in three tiers.\n\n**Tier 1 — the core loop (Modules 2 to 11).** Environment, Supabase, database, auth, React fundamentals, UI, artist dashboard, location system, public pages, contact. At the end of Module 11 KalaKaara is a *complete product*. Ugly in places, unoptimised, undeployed — but a real artist could publish a real profile and a real buyer could WhatsApp them.\n\n**Tier 2 — the retention layer (Modules 12 to 13).** Favourites and reviews. These do not create connections; they make people come back and make the marketplace trustworthy. They are correctly *after* the core loop, and they are correctly *before* deployment, because reviews change the database schema and you do not want to migrate production on day one.\n\n**Tier 3 — the professional layer (Modules 14 to 16).** Performance, deployment, SEO, accessibility, security review, testing. Beginners think this tier is optional polish. It is not; it is the difference between a portfolio project and a product. But it is genuinely last, because you cannot optimise or deploy something that does not work yet.\n\nAnd then there is **Tier 4 — the things we deliberately do not build.** In-app messaging. Payments. Commission handling. Artist verification badges. An admin moderation queue. Push notifications. Each is a reasonable feature and each is a trap: they multiply scope without strengthening the core loop. Module 16 lists them as future enhancements, which is the professional way of saying "I saw this, I understood it, I chose not to."',
          whyItMatters:
            'The most common way a side project dies is not difficulty — it is building Tier 2 and Tier 3 features before Tier 1 exists. You end up with a beautiful favourites system on top of an app where nobody can find an artist. Sequencing by the core loop is what keeps a project shippable at every commit.',
          steps: [
            'Write the core loop as a single sentence with three arrows. Publish → find → contact.',
            'For every feature in the brief, ask: does removing this break the core loop? If no, it is Tier 2 or later.',
            'Verify the module order against the tiers. Contact is Module 11 — the last module of Tier 1. That is not a coincidence.',
            'Write the Tier 4 "not building" list explicitly. An unwritten cut is not a cut; it is a thing you will drift into building at 1 a.m.',
            'Commit to the rule: no Tier 2 work begins until the core loop runs end to end on your machine.',
          ],
          code: `TIER 1 — the core loop. KalaKaara is a real product at the end of this.
  M2  Environment       Node, VS Code, Git, GitHub, Vite, React
  M3  Supabase          project, SDK, env vars, first query
  M4  Database          schema, relationships, indexes, RLS
  M5  Authentication    Google OAuth, sessions, protected routes
  M6  React             components, props, state, hooks, router, forms, context
  M7  UI                navbar, hero, cards, footer, responsive, CSS Modules
  M8  Artist dashboard  create/edit profile, Storage uploads, manage portfolio
  M9  Location          service areas, matching, Haversine radius search
  M10 Public pages      browse, search, filters, artist detail, gallery
  M11 Contact           login gate, reveal phone, WhatsApp deep link
       ^-- core loop closed. Publish -> find -> contact. It works.

TIER 2 — retention and trust.
  M12 Favorites         save, remove, favourites page
  M13 Reviews           ratings, comments, average rating

TIER 3 — production quality.
  M14 Performance       pagination, lazy loading, image optimisation, caching
  M15 Deployment        Vercel, production env vars, Supabase in prod
  M16 Professional      SEO, accessibility, security review, testing

TIER 4 — deliberately NOT building (documented in M16 as future work).
  x   In-app chat       messaging is a product in itself; WhatsApp already works
  x   Payments          needs a card, a company, and KYC. Violates NFR N1.
  x   Commission        depends on payments
  x   Verified badges   needs a human verification process, not code
  x   Admin moderation  needs an admin actor; adds a whole policy surface
  x   Push notifications needs a paid service or a native app shell`,
          pitfalls: [
            '**Building favourites in Module 6 "because it is easy."** It is easy, and it is useless until artists exist to favourite. Fix: respect the tiers; easy is not the same as valuable.',
            '**Deploying in Module 3 "to get it out of the way."** Deploying an empty app teaches you nothing and forces you to manage production secrets for thirteen modules. Fix: deploy once the thing is worth deploying.',
            '**Leaving the "not building" list implicit.** Every unlisted feature is a feature you might start at midnight. Fix: write the Tier 4 list into the README, with one line each on why. It reads as maturity, not laziness.',
            '**Confusing MVP with low quality.** The MVP has fewer features, not sloppier ones. Fix: every Tier 1 feature ships with loading, empty, and error states — those are not polish, they are the feature.',
          ],
          tryIt:
            'Your friend suggests adding artist verification badges ("blue tick for real artists"). Write a three-sentence reply that (a) agrees it is valuable, (b) identifies what it actually requires beyond code, and (c) places it in a tier. This is the exact conversation you will have in every engineering job.',
          takeaway:
            'Sequence by the core loop, not by difficulty. KalaKaara becomes a real product at the end of Module 11 — everything after that makes it a good one.',
        },
      ],
    },
    {
      id: 'm0-s2',
      title: 'Architecture, and the zero-cost constraint',
      topics: [
        {
          id: 'm0-t5',
          title: 'Why React + Supabase, and not React + a Node backend',
          explain:
            'Supabase is a Backend-as-a-Service: it hands you a real Postgres database that your React app talks to directly, with security enforced inside the database instead of inside a server you write.',
          analogy:
            'The traditional way is to hire a gatekeeper who stands outside the record room. Every request goes to the gatekeeper, who checks your identity, walks in, fetches the file, and hands it out. Supabase removes the gatekeeper and instead locks each individual shelf, keyed to who you are. You walk into the record room yourself — but the shelves that are not yours simply will not open. Fewer moving parts, and no risk that the gatekeeper forgets to check one particular request.',
          theory:
            'In a classical three-tier app, your React frontend calls an Express/Node server, which calls Postgres. The Node server exists to do three jobs: **authenticate** the caller, **authorise** the request, and **shape** the data. It is also where every security bug lives, because authorisation is scattered across every route handler and one forgotten `if (req.user.id !== row.owner_id)` opens a hole.\n\nSupabase collapses this. It exposes Postgres over HTTPS through **PostgREST**, an auto-generated REST API derived from your schema. The `supabase-js` client speaks to it, so `supabase.from(\'artists\').select(\'*\')` becomes `GET /rest/v1/artists?select=*`. Authentication is handled by **GoTrue**, which issues a JWT after Google sign-in. And authorisation — the part that used to be scattered across Node routes — moves into the database as **Row Level Security policies**, which Postgres enforces on *every single query*, from every client, forever, whether you remembered to check or not.\n\nThe trade is real and worth stating honestly. **You give up**: arbitrary server-side business logic (though Edge Functions exist), a place to hide third-party API secrets, and the comfort of a familiar Express router. **You gain**: no server to write, deploy, monitor, patch, or pay for; authorisation that cannot be bypassed by forgetting a check; and realtime subscriptions for free.\n\nFor KalaKaara, the fit is close to perfect. Our data is relational (artists have artworks, artworks have categories, artists have service areas). Our authorisation rules are exactly row-ownership rules. We have no secrets to hide from the client, because we deliberately chose no paid APIs. And our NFR is zero cost. A Node server would need hosting, which needs money or a card. **Supabase does not.**',
          diagram: `graph LR
    subgraph Browser
      R[React app on Vercel]
    end
    subgraph Supabase[Supabase project - free tier]
      G[GoTrue<br/>Auth + JWT]
      P[PostgREST<br/>auto REST API]
      S[Storage<br/>S3-compatible]
      DB[(PostgreSQL 15<br/>+ Row Level Security)]
    end
    GO[Google OAuth]
    R -- 1. sign in --> G
    G <-- 2. verify --> GO
    G -- 3. JWT --> R
    R -- 4. query + JWT + anon key --> P
    P -- 5. sets auth.uid from JWT --> DB
    DB -- 6. RLS decides row by row --> P
    P -- 7. only permitted rows --> R
    R -- upload/read images --> S
    S -- bucket policies --> DB`,
          flowExplain:
            'Step 6 is the whole point. There is no code of ours between the browser and the database — and that is safe precisely because the database itself refuses to hand over rows the caller is not entitled to.',
          whyItMatters:
            'Understanding *why* the client talks straight to the database is what makes RLS feel necessary instead of bureaucratic. Every learner who skips this explanation later writes a policy like `using (true)` "to make it work," and ships an app where anyone can read every phone number.',
          steps: [
            'Say out loud: "there is no backend server in this project." Sit with the discomfort.',
            'Identify what replaced each job of the Node server. Authentication → GoTrue. Authorisation → RLS. Data shaping → PostgREST `select()` with embedded joins.',
            'Identify what we lose: nowhere to hide a secret API key. Note that this is *fine* only because NFR N1 means we have no paid API keys to hide.',
            'Note when this architecture would be the wrong choice: if we needed to charge cards (Stripe secret key), send email (SMTP credentials), or run heavy business logic. Supabase Edge Functions cover those, but we need none of them.',
            'Accept that the anon key ships publicly in your JavaScript bundle. It is designed to. RLS is what protects the data, not the key.',
          ],
          code: `// The same operation, two architectures.

// ---------- CLASSICAL: React -> Node -> Postgres ----------
// server/routes/artists.js
app.get('/api/artists/:id', async (req, res) => {
  const artist = await db.query('select * from artists where id = $1', [req.params.id]);
  //  ^ Did you remember to strip the phone number for logged-out callers?
  //    If not, it just leaked. Nothing in the system stops you.
  res.json(artist.rows[0]);
});
// Every route is a fresh chance to forget. Plus: a server to host and pay for.

// ---------- SUPABASE: React -> Postgres (with RLS) ----------
// src/services/artistService.js
const { data, error } = await supabase
  .from('artists')
  .select('id, display_name, bio, phone')
  .eq('id', artistId)
  .single();
// If the caller is anonymous, Postgres itself returns phone as null,
// because a column-level rule said so. You cannot forget. There is no route
// to forget it in. And there is no server to host.

// The anon key sits in your public JS bundle. That is BY DESIGN:
// it says "I am an anonymous caller", it does not say "let me in".`,
          pitfalls: [
            '**Thinking the anon key is a password.** It identifies the *kind* of caller. RLS decides what that caller may do. Leaking it is not a breach; disabling RLS is. Fix: internalise this now — it is the number one Supabase misconception.',
            '**Reaching for the `service_role` key when a query returns nothing.** The `service_role` key bypasses all RLS. Putting it in a React app hands your entire database to anyone who opens DevTools. Fix: an empty result means your policy is wrong. Fix the policy. KalaKaara never uses the service_role key anywhere.',
            '**Assuming "no backend" means "no architecture."** You still have layers: components, hooks, services, the database. Fix: keep every Supabase call inside `src/services/` (Module 2) so your components never talk to the database directly.',
            '**Choosing BaaS for a problem it does not fit.** If you need to charge a card or call a paid API with a secret key, you need a server (or an Edge Function). Fix: recognise the fit. KalaKaara fits because it has no secrets and no payments.',
          ],
          tryIt:
            'Write down the one sentence you would say in an interview when asked "why no backend?" It should mention row-level authorisation, zero hosting cost, and the fact that you had no server-side secrets to protect. If your answer is "because it was easier," you have the right instinct and the wrong words.',
          takeaway:
            'Supabase moves authorisation out of route handlers you might forget to write and into the database, which never forgets. That is the trade, and for KalaKaara it is a good one.',
        },
        {
          id: 'm0-t6',
          title: 'The zero-cost audit — and why Google Places fails it',
          explain:
            'Every service in this stack is tested against one rule: does the signup flow ask for a credit card? Google Places does. So we design around it.',
          analogy:
            'A shop that says "free entry" but asks for your ATM card at the door has not offered you free entry. It has offered you a tab. The card sitting behind the counter is the whole problem, regardless of whether they ever swipe it.',
          theory:
            'NFR N1 says: **zero cost, no credit card, at any point.** This is stricter than "free tier," and the strictness is the point. Let us audit every service honestly.\n\n**Supabase — PASSES.** Sign up with GitHub or email. No card requested anywhere. Free tier: 500 MB database, 1 GB file storage, 5 GB bandwidth per month, 50,000 monthly active auth users. The one real catch: a free project **pauses after 7 days of zero API activity**, and you restore it with one click in the dashboard, with no data loss.\n\n**Vercel — PASSES.** The Hobby plan deploys from GitHub with no card. Generous bandwidth, automatic HTTPS, preview deploys per branch.\n\n**GitHub — PASSES.** Unlimited free public and private repositories.\n\n**Google OAuth (sign-in) — PASSES.** Creating OAuth credentials in Google Cloud Console requires a Google account, not a billing account. Sign-in itself is free and card-free. Be careful not to confuse this with the next item.\n\n**Google Places API — FAILS.** This is the important one, and the brief specifically asks for it. Places Autocomplete lives behind Google Maps Platform, and **Maps Platform requires an enabled billing account — which requires a credit card — even to use the free monthly quota.** Google will not charge you inside the quota, but the card must be on file. That is a tab. Under NFR N1 it is disqualified.\n\nSo what do we actually build? Something better for our use case, as it happens.\n\n**Primary: our own Postgres location tables.** India has a stable administrative hierarchy — state, district, taluk, city/village. We seed `states`, `districts`, `taluks`, and `cities` into our own database (Module 4), each row carrying a latitude and longitude. Autocomplete then queries *our* table with a `ilike` prefix match. It is instant, free, rate-limit-free, works offline in development, and — crucially — it returns exactly the administrative units our service-area matching logic needs. A Google Places result gives you a `place_id` and a free-text address; it does *not* tell you "this is inside Udupi district," which is precisely the fact our matching logic depends on.\n\n**Secondary, for free-text and reverse geocoding: Nominatim or Photon (OpenStreetMap).** Both are genuinely free, need no API key, and need no card. Nominatim asks for a descriptive `User-Agent` and a maximum of one request per second — fine for "Near me" reverse geocoding, which happens once per session. We wire these behind a `geocodingProvider` interface (Module 9) so the entire external dependency is one swappable file.\n\n**And if you personally want Google Places anyway?** Module 9 includes a complete lesson on wiring it — the API key, the referrer restrictions, the session tokens that keep you inside the free quota. Because our provider is an interface, it is a forty-line file, not a rewrite. But it is not the default, and the course never requires you to enter a card.',
          whyItMatters:
            'The brief asked for Google Places *and* asked for no credit card. Those two requirements are in direct conflict. Noticing the conflict, naming it, and proposing an alternative that is actually better suited to the matching logic is exactly what a senior engineer is paid to do. Blindly implementing both would have produced a course that cannot be completed by its own audience.',
          steps: [
            'Apply the card test to every service before you depend on it: open the signup flow and look for a card field. Do not trust the pricing page.',
            'Note the one Supabase catch — the 7-day inactivity pause — and that restoring is one click with no data loss.',
            'Note the distinction between **Google OAuth** (free, no card, we use it) and **Google Maps Platform** (billing account required, we do not).',
            'Understand why our own location tables are not merely a workaround: they return administrative units, which is what service-area matching actually needs.',
            'Plan for the interface. Every external geocoding call in this course goes through `src/services/geocoding/` with a swappable provider. Google, Nominatim, Photon, or a mock in tests.',
          ],
          code: `THE CARD TEST — does signup ask for a credit card?

  Supabase              NO CARD   500MB db / 1GB storage / 50k MAU
                                  (pauses after 7 idle days; 1 click to restore)
  Vercel Hobby          NO CARD   deploy from GitHub, free HTTPS
  GitHub                NO CARD   unlimited private repos
  Google OAuth client   NO CARD   sign-in only. This is NOT Maps Platform.

  Google Places API     CARD      Maps Platform needs an enabled billing
                                  account. Free quota exists, but the card
                                  must be on file. -> FAILS NFR N1.
  Firebase Storage      CARD      new buckets require the Blaze plan.
  AWS S3 / Cloudinary   CARD      free tiers, card on file.

OUR LOCATION STACK — all free, all card-free:

  1. Autocomplete       our own Postgres tables (states/districts/taluks/cities)
                        -> instant, no rate limit, returns admin units
  2. Free-text search   Nominatim or Photon (OpenStreetMap), no key, no card
  3. "Near me"          navigator.geolocation (browser, free)
                        + Nominatim reverse geocode (free)
  4. Radius matching    Haversine formula in plain SQL. No PostGIS. No API.

  All four sit behind src/services/geocoding/provider.js
  Swap in Google Places later by writing ONE file. Module 9 shows how.`,
          pitfalls: [
            '**Trusting a pricing page that says "Free".** The pricing page is marketing; the signup form is the truth. Fix: click through to the actual account creation and look for the card field.',
            '**Confusing Google OAuth with Google Maps Platform because both live in Google Cloud Console.** They are separate products with separate billing rules. Fix: OAuth credentials = free. Anything under "Maps Platform" = billing account required.',
            '**Hammering Nominatim from a loop.** Its usage policy is roughly one request per second, and abusing it gets your IP blocked. Fix: use it only for one-shot reverse geocoding, debounce user input, and cache results. Our own Postgres tables handle the high-frequency autocomplete.',
            '**Hardcoding a provider throughout the codebase.** Then swapping it means touching thirty files. Fix: one `geocodingProvider` interface, one implementation file per provider, chosen by an env var.',
            '**Letting a free Supabase project pause mid-course and assuming the data is gone.** It is paused, not deleted. Fix: open the dashboard, click Restore, keep working.',
          ],
          tryIt:
            'Open the Google Maps Platform "Get Started" flow and go as far as you can without entering a card. Note exactly where it stops you. Then open supabase.com and create an account. Compare. This five-minute exercise is worth more than any paragraph I can write about the difference.',
          takeaway:
            'Google Places needs a card, so it fails our first non-functional requirement. Seeding India\'s administrative hierarchy into our own Postgres is free, faster, and returns exactly the district/taluk facts our matching logic needs.',
        },
        {
          id: 'm0-t7',
          title: 'System architecture: the whole app on one page',
          explain:
            'Four layers — browser, Vercel edge, Supabase, and the external free services — with every arrow labelled.',
          analogy:
            'A wiring diagram for a house. You will never remember which wire runs where, but you will remember that the mains comes in at one point, the fuse box guards everything, and no room is wired directly to the street. In KalaKaara, Postgres with RLS is the fuse box: nothing reaches the data without passing through it.',
          theory:
            'Reading the diagram from top to bottom:\n\n**The browser** runs a React single-page application, built by Vite and served as static files. It holds one long-lived object — the Supabase client — created once in `src/supabase/client.js` and imported everywhere. It also holds a `SessionContext` (Module 5) that knows whether anyone is signed in.\n\n**Vercel** serves those static files from a CDN edge close to the user. It runs no server code for us. Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are baked into the bundle at build time — which is safe, because both are public values by design.\n\n**Supabase** is four services over one database. **GoTrue** handles the Google OAuth redirect dance and mints a JWT. **PostgREST** turns your schema into a REST API and, on every request, extracts the JWT and sets the `auth.uid()` that RLS policies read. **Storage** holds three buckets — `avatars`, `covers`, `artworks` — each with its own access policies expressed in the same RLS language. And **Postgres** holds the eighteen tables of Module 4, every one of them with RLS enabled.\n\n**External free services** are deliberately few: Google\'s OAuth endpoint (during sign-in only) and Nominatim (for reverse geocoding "Near me", roughly once per session). WhatsApp is not an integration at all — it is a `https://wa.me/91XXXXXXXXXX` link, which costs nothing and requires no account.\n\nNotice what is absent: no Node server, no Redis, no message queue, no payment gateway, no email service. Every box on the diagram is free and card-free. That is not an accident, it is NFR N1 rendered as a picture.',
          diagram: `graph TD
    subgraph browser[Browser - the only code we ship]
      UI[React components]
      HK[Hooks: useArtists, useAuth, useFavorites]
      SVC[Services layer: artistService, geocoding]
      CL[Supabase client singleton]
      UI --> HK --> SVC --> CL
    end

    subgraph vercel[Vercel Hobby - free, no card]
      CDN[Static files on the edge CDN]
    end

    subgraph sb[Supabase free tier - no card]
      GT[GoTrue: Google OAuth + JWT]
      PR[PostgREST: auto REST API]
      ST[Storage: avatars, covers, artworks]
      PG[(PostgreSQL 15<br/>18 tables, RLS on every one)]
      GT --> PG
      PR --> PG
      ST --> PG
    end

    subgraph ext[External - free, card-free]
      GO[Google OAuth endpoint]
      NM[Nominatim / Photon<br/>reverse geocode only]
      WA[wa.me link - not an API]
    end

    CDN -.serves.-> browser
    CL -- JWT + anon key --> PR
    CL -- sign in --> GT
    CL -- upload / getPublicUrl --> ST
    GT <--> GO
    SVC -. once per session .-> NM
    UI -. plain link .-> WA`,
          flowExplain:
            'Every arrow that touches data passes through the Postgres box, and every table in that box has RLS enabled. There is no side door. Trace any path you like — it is the same conclusion.',
          whyItMatters:
            'Being able to draw your own system on a whiteboard in under two minutes is a genuine interview skill, and more importantly it is how you debug. When a query returns an empty array, knowing that the request went browser → PostgREST → RLS → Postgres tells you exactly where to look: the policy.',
          steps: [
            'Redraw this diagram from memory on paper. Do not peek. Then compare and note what you left out.',
            'Trace the path of "an anonymous visitor opens an artist profile." Which boxes are involved? (Browser, CDN, PostgREST, Postgres. Not GoTrue.)',
            'Trace "a signed-in user reveals a phone number." Now GoTrue is involved, because a JWT must exist for `auth.uid()` to be non-null.',
            'Trace "an artist uploads a portfolio image." Browser → Storage → bucket policy → Postgres row insert into `artworks`. Two writes, and Module 8 makes them consistent.',
            'Count the boxes that cost money. Zero. Confirm each against the card test from the previous topic.',
          ],
          code: `Request lifecycle — anonymous visitor opens /artists/rukmini-shetty

 1. Browser requests the page. Vercel's CDN returns index.html + JS bundle.
    Cost: free. No Supabase involved yet.

 2. React mounts. src/supabase/client.js creates the client with
    VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (both baked into the bundle).

 3. useArtist(slug) hook calls artistService.getBySlug(slug), which runs:

      supabase.from('artists')
        .select('*, artworks(*), artist_categories(categories(*))')
        .eq('slug', slug)
        .single()

 4. That becomes:  GET /rest/v1/artists?slug=eq.rukmini-shetty&select=...
    Headers:       apikey: <anon key>       (no Authorization header — nobody
                                             is signed in)

 5. PostgREST authenticates the anon key, opens a Postgres transaction, and
    executes:   set local role anon;
    So inside the query, auth.uid() returns NULL.

 6. Postgres runs the SELECT. For every row it consults the RLS policies on
    artists, artworks, artist_categories, categories. Rows that fail the
    policy are not filtered out afterwards — they are never returned at all.

 7. The phone column comes back NULL, because the contact-reveal rule
    (Module 11) checks auth.uid() is not null. React shows a
    "Sign in to view contact" button. Nothing leaked. Nothing was hidden
    in CSS. The data never left the database.`,
          pitfalls: [
            '**Drawing an arrow from React straight to Postgres.** It goes through PostgREST, and PostgREST is what translates the JWT into `auth.uid()`. Missing that step is why people cannot explain how RLS knows who they are.',
            '**Assuming environment variables prefixed `VITE_` are secret.** Vite inlines them into the client bundle at build time. Anyone can read them. Fix: only ever put public values behind `VITE_`. The anon key qualifies; the service_role key never does.',
            '**Forgetting that Storage has its own policies.** A public bucket URL is public to the entire internet, forever, even if the `artworks` row is deleted. Fix: Module 8 covers deleting the object alongside the row.',
            '**Believing "no backend" means nothing can be attacked.** The database is directly reachable from the internet. That is safe *only* because RLS is on. Fix: never ship a table with RLS disabled — Module 4 makes this a checklist item.',
          ],
          tryIt:
            'Take the seven-step request lifecycle above and rewrite it for a **signed-in** user. Which step changes? (Step 4 gains an `Authorization: Bearer <jwt>` header; step 5 sets role `authenticated`; step 7 returns the phone number.) Write it out. This is the mental model that makes Module 11 trivial.',
          takeaway:
            'Four layers, every arrow through Postgres, every box free. If you can draw this from memory, you understand the app.',
        },
        {
          id: 'm0-t8',
          title: 'The location and service-area problem, stated properly',
          explain:
            'This is the hardest problem in the course, and stating it precisely now makes Module 9 feel inevitable rather than magical.',
          analogy:
            'A carpenter in Brahmavara might say "I work anywhere in Udupi district." A courier says "I deliver anywhere in India." A tuition teacher says "within 5 km of my house." Three completely different sentences about coverage — but a customer standing in Kundapura asks all three the same question: *do you serve me?* Your database has to answer that one question, three different ways.',
          theory:
            'An artist declares one or more **service areas**. Each service area has a **type**, and the type determines how matching works:\n\n- `country` — "Pan India." Matches every search.\n- `state` — "Entire Karnataka." Matches any location whose state is Karnataka.\n- `district` — "Entire Udupi district." Matches any location inside that district.\n- `taluk` — "Kundapura taluk only."\n- `city` — "Manipal only."\n- `radius` — "Within 25 km of my studio." Matches by distance, not by administrative boundary.\n\nA single artist may declare several: *Pan Karnataka* **and** *Udupi* **and** *Manipal* **and** *Kundapura* **and** *Brahmavara*. The matching rule is **OR, not AND** — an artist appears if *any one* of their service areas covers the searched location. Beginners write `AND` here almost every time, and the search silently returns nobody.\n\nThe searcher, meanwhile, supplies a location that is *also* one of these things — a city, a taluk, a district, a state — or a raw latitude/longitude from `navigator.geolocation`. So matching means answering: **is the searched location contained within, or within N km of, any of this artist\'s declared areas?**\n\nContainment is the easy half, and it is why we seed the administrative hierarchy into Postgres. If `cities` has a `taluk_id`, `taluks` has a `district_id`, and `districts` has a `state_id`, then "is Manipal inside Udupi district?" is a join, not a geometry problem. Searching for Kundapura must surface artists who declared Kundapura taluk, *and* artists who declared Udupi district, *and* artists who declared Karnataka, *and* artists who declared Pan India — because each of those contains Kundapura. That is walking **up** the hierarchy from the searched location and matching at every level.\n\nDistance is the other half. For `radius` areas we need "how far is Kundapura from this artist\'s studio?" The brief says: no PostGIS. Good — we do not need it. The **Haversine formula** computes great-circle distance between two lat/lng pairs using plain trigonometry, and Postgres has `sin`, `cos`, `asin`, `sqrt`, and `radians` built in. We wrap it in a SQL function, and because a naive Haversine over every row cannot use an index, we first narrow candidates with a cheap bounding-box filter on indexed `lat`/`lng` columns, then compute exact distance only on the survivors. Module 9 builds precisely this, step by step.',
          diagram: `graph TD
    S[User searches: Kundapura] --> H[Resolve to a location row<br/>city or taluk with lat/lng]
    H --> UP[Walk UP the hierarchy]
    UP --> T[taluk: Kundapura]
    UP --> D[district: Udupi]
    UP --> ST[state: Karnataka]
    UP --> C[country: India]
    T --> M{Match artists whose<br/>service area is ANY of these}
    D --> M
    ST --> M
    C --> M
    H --> R[Also: radius areas]
    R --> BB[Cheap bounding box filter<br/>on indexed lat/lng]
    BB --> HV[Exact Haversine distance]
    HV --> M2{distance_km <= radius_km}
    M --> RES[Result set - union, deduplicated]
    M2 --> RES`,
          flowExplain:
            'Two independent paths — hierarchy containment and radius distance — that union into one result set. An artist matching on either path appears exactly once. That deduplication is why the query ends in a DISTINCT.',
          whyItMatters:
            'This is the feature that makes KalaKaara more than a CRUD app, and it is the one interviewers will ask about. "How did you do radius search without PostGIS?" has a real answer: bounding box on an index, then Haversine on the survivors. That answer demonstrates you understand why the naive version is slow.',
          steps: [
            'Write the six service-area types on paper: country, state, district, taluk, city, radius.',
            'For a search for "Kundapura", list every artist declaration that must match: Kundapura taluk, Udupi district, Karnataka, Pan India, and any radius area whose centre is within its own radius of Kundapura.',
            'Convince yourself the combining rule is OR. An artist serving both "Pan India" and "Manipal" must appear for a Manipal search, not be excluded because one clause failed.',
            'Note the containment insight: "Is Manipal in Udupi district?" is a foreign-key join, provided we seed the hierarchy. That is the whole reason for the `states`/`districts`/`taluks`/`cities` tables.',
            'Note the distance insight: Haversine on every row is O(n) with no index. A bounding-box prefilter on indexed lat/lng columns turns it into an index scan plus arithmetic on a handful of rows.',
            'Accept that this is Module 9. You do not need to solve it now — you need to be able to state it.',
          ],
          code: `-- A preview of Module 9. Read it; do not run it yet.

-- HALF ONE: containment. Walk up from the searched location.
-- Searching Kundapura (a taluk in Udupi district, Karnataka, India)
-- must match artists who declared ANY ancestor of it.

select distinct a.id, a.display_name
from artists a
join artist_service_areas asa on asa.artist_id = a.id
where a.is_published
  and (
       asa.area_type = 'country'                          -- Pan India
    or (asa.area_type = 'state'    and asa.state_id    = :state_id)
    or (asa.area_type = 'district' and asa.district_id = :district_id)
    or (asa.area_type = 'taluk'    and asa.taluk_id    = :taluk_id)
    or (asa.area_type = 'city'     and asa.city_id     = :city_id)
  );
--     ^^ OR, never AND. One matching area is enough.


-- HALF TWO: radius, without PostGIS.
-- Step 1 (cheap, uses the index on lat/lng): a bounding box.
-- 1 degree of latitude is always ~111 km.
-- 1 degree of longitude is ~111 km * cos(latitude).
-- Step 2 (exact, runs on few rows): the Haversine formula.

create or replace function km_between(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision
language sql immutable parallel safe as $$
  select 2 * 6371 * asin(sqrt(
      power(sin(radians(lat2 - lat1) / 2), 2)
    + cos(radians(lat1)) * cos(radians(lat2))
    * power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;
-- 6371 = Earth's mean radius in km. Swap for 3959 to get miles.

-- Both halves UNION into one result. An artist matching both appears once.`,
          pitfalls: [
            '**Combining service areas with AND.** "Show artists serving Karnataka AND Manipal" excludes the artist who serves all of India. Fix: an artist matches if **any** of their areas covers the search. It is a union, not an intersection.',
            '**Matching only at the exact level searched.** Search "Kundapura", match only `area_type = \'taluk\'`, and you hide every Pan-India artist. Fix: walk up the hierarchy and match at every ancestor level.',
            '**Running Haversine across the whole table.** It cannot use an index — every row gets trigonometry. With 50,000 artists on a free-tier database it will crawl. Fix: bounding-box prefilter on indexed `lat`/`lng`, then exact distance on the survivors.',
            '**Reaching for PostGIS.** It is genuinely excellent and Supabase supports it. It is also unnecessary here, adds an extension to manage, and the brief rules it out. Fix: plain SQL trigonometry is enough at this scale, and you will understand it completely.',
            '**Storing "Udupi" as a free-text string on the artist row.** Then "Udupi", "udupi", and "Udupi District" are three different places, and containment is impossible. Fix: normalise into `states`/`districts`/`taluks`/`cities` with real foreign keys.',
          ],
          tryIt:
            'Artist A declares: Pan India. Artist B declares: Karnataka state, and Manipal city. Artist C declares: 25 km radius around Udupi (13.34°N, 74.75°E). A user searches for Kundapura (13.62°N, 74.69°E), which is a taluk in Udupi district. Which artists appear? Work it out by hand — including whether C matches. (Kundapura to Udupi is roughly 32 km. So C does not match. A matches on country; B matches on state.)',
          takeaway:
            'Service-area matching is containment up an administrative hierarchy, OR-ed with Haversine distance. Seed the hierarchy, index the coordinates, prefilter with a bounding box. No PostGIS, no paid API.',
        },
      ],
    },
    {
      id: 'm0-s3',
      title: 'Screens, flows, and the folder structure they imply',
      topics: [
        {
          id: 'm0-t9',
          title: 'Wireframes: the seven screens of KalaKaara',
          explain:
            'Low-fidelity boxes on paper, mobile-first, before any CSS exists. Seven screens carry the entire product.',
          analogy:
            'A film director storyboards before hiring a single actor. The storyboard is ugly stick figures, and that is exactly why it is useful — nobody argues about the colour of a stick figure\'s shirt. Wireframes let you argue about *what is on the screen* before you can be distracted by *how it looks*.',
          theory:
            '**Mobile-first** is not a slogan; it is a constraint that forces prioritisation. A 360px-wide phone screen can hold roughly one idea. Design that first, and the desktop layout becomes a matter of letting things breathe. Design desktop first, and the phone layout becomes an exercise in deleting things you already fell in love with.\n\nThe seven screens:\n\n**1. Home (`/`).** Hero with a search bar. Popular categories as a scrollable chip row. Featured artists (a grid of cards). Latest artwork (an image grid). How-it-works, three steps. Footer.\n\n**2. Browse artists (`/artists`).** The workhorse. A filter panel — collapsible drawer on mobile, a sticky sidebar on desktop — plus a results grid and a sort dropdown. This screen is where NFR N3 (speed) is won or lost.\n\n**3. Artist detail (`/artists/:slug`).** Cover image, avatar overlapping it, name, location, rating, experience. Tabs or sections for bio, portfolio gallery, reviews. A sticky "Contact" bar on mobile — the single most important button in the app.\n\n**4. Artwork detail (`/artworks/:id`).** Large image, title, price, medium, dimensions, tags, and a link back to the artist.\n\n**5. Artist dashboard (`/dashboard`).** Protected. Profile form, image uploads, service-area picker, portfolio manager.\n\n**6. Favourites (`/favourites`).** Protected. A grid of saved artist cards, each removable.\n\n**7. Auth callback (`/auth/callback`).** Invisible. Google redirects here, Supabase exchanges the code for a session, we redirect the user back where they came from.\n\nOne detail deserves emphasis. On the artist detail screen, the contact button for a logged-out visitor must not read "Sign in." It must read **"Show phone number"**, and clicking it opens the Google sign-in. The user asked for a phone number; they should not be told they wanted to sign in. Sign-in is the toll, not the destination. Get this wording right and your conversion doubles; get it wrong and people bounce.',
          diagram: `graph LR
    H["/ Home<br/>hero, categories,<br/>featured, latest"]
    B["/artists Browse<br/>filters + grid + sort"]
    AD["/artists/:slug<br/>cover, portfolio,<br/>reviews, CONTACT"]
    AW["/artworks/:id<br/>image, price, medium"]
    D["/dashboard<br/>PROTECTED<br/>profile, uploads,<br/>service areas"]
    F["/favourites<br/>PROTECTED"]
    CB["/auth/callback<br/>invisible"]

    H -->|search or category| B
    H -->|featured card| AD
    H -->|latest artwork| AW
    B -->|artist card| AD
    AD -->|artwork thumb| AW
    AW -->|by this artist| AD
    AD -.->|not signed in:<br/>click Show phone| CB
    CB -.->|return to where<br/>you were| AD
    H -->|nav: my profile| D
    H -->|nav: favourites| F`,
          flowExplain:
            'Notice the dotted lines. The auth callback is a detour, never a destination — the user always lands back on the page that sent them, with the action they wanted now completed.',
          whyItMatters:
            'Wireframing before coding is what stops you from building a beautiful component nobody navigates to. It also produces your route table for free: seven screens, seven routes, two of them protected. Module 6 will implement exactly this.',
          steps: [
            'Draw all seven screens on paper, at phone width. Boxes and labels only. No colour, no fonts, twenty minutes total.',
            'Mark the two protected screens (`/dashboard`, `/favourites`) with a padlock.',
            'On the artist detail wireframe, write the exact button label for a logged-out visitor: "Show phone number", not "Sign in".',
            'Draw the desktop variant of `/artists` only. Note the single real change: the filter drawer becomes a persistent sidebar.',
            'Count your components. A card appears on Home and on Browse — that is one `ArtistCard`, used twice. Circle every repeat; those are your reusable components.',
          ],
          code: `KalaKaara route table — derived directly from the wireframes

  PATH                  SCREEN            ACCESS       KEY DATA
  /                     Home              public       featured artists, categories
  /artists              Browse            public       filtered, paginated artists
  /artists/:slug        Artist detail     public*      artist + artworks + reviews
  /artworks/:id         Artwork detail    public       artwork + its artist
  /dashboard            Artist dashboard  PROTECTED    own artist row
  /favourites           Favourites        PROTECTED    own favourites
  /auth/callback        OAuth landing     public       exchanges code for session
  *                     404               public       -

  * public, but the phone/WhatsApp fields come back NULL for anonymous
    callers. The page renders; the contact details do not. This is enforced
    in Postgres (Module 11), not in React.

REUSABLE COMPONENTS (spotted by circling repeats in the wireframes):
  ArtistCard      home featured + browse grid + favourites grid   -> 3 uses
  ArtworkCard     home latest + artist gallery + artwork related  -> 3 uses
  CategoryChip    home + browse filters                           -> 2 uses
  RatingStars     artist card + artist detail + review item       -> 3 uses
  EmptyState      browse (no results) + favourites + portfolio    -> 3 uses
  Skeleton        every list that loads                           -> many

MOBILE-FIRST BREAKPOINTS (Module 7):
  base   <  600px   one column, filter drawer, sticky contact bar
  600px  -  900px   two columns
  > 900px           three/four columns, persistent filter sidebar`,
          pitfalls: [
            '**Wireframing at desktop width.** You will design a three-column filter sidebar and then discover it has nowhere to go on a phone. Fix: 360px first, always.',
            '**Labelling the login-gated button "Sign in".** It tells the user what *you* need, not what *they* want. Fix: "Show phone number" — the sign-in is an implementation detail that happens on the way.',
            '**Designing screens before flows.** You end up with a page nothing links to. Fix: draw the arrows between screens, and if a box has no incoming arrow, delete it.',
            '**Skipping the empty, loading, and error variants of each screen.** They are two-thirds of the states your users will actually see on a bad connection. Fix: wireframe "Browse with zero results" as a separate box. It needs its own copy and its own illustration.',
          ],
          tryIt:
            'Wireframe the "Browse with zero results" state. What does it say? What does it offer? ("No artists serve Kundapura yet. Try widening your search to Udupi district" — with a button that does exactly that.) A good empty state is a feature, not an apology.',
          takeaway:
            'Seven screens, two protected. The wireframes hand you the route table, the reusable component list, and the breakpoints — for free, before a line of CSS.',
        },
        {
          id: 'm0-t10',
          title: 'The two core user flows, end to end',
          explain:
            'The artist onboarding flow and the buyer discovery flow. If both work, KalaKaara works.',
          analogy:
            'A shop has two doors: the one the shopkeeper unlocks in the morning, and the one customers walk through all day. Both must open. Most beginners polish the customer door and never test whether the shopkeeper can get in.',
          theory:
            '**Flow A — the artist publishes.** A painter in Brahmavara hears about KalaKaara. She lands on the home page, clicks "Become an artist," and is sent to Google sign-in because `/dashboard` is protected. She returns signed in. Her `profiles` row was created automatically the moment she authenticated — by a Postgres trigger on `auth.users`, which Module 4 writes, so no React code has to remember to do it. The dashboard sees she has no `artists` row and shows a create-profile form. She fills in name, bio, experience, pricing, languages, categories, service areas, and uploads a profile photo, a cover, and six artworks. She publishes.\n\nCount the failure modes in that paragraph: the redirect after sign-in must return her to `/dashboard` and not the home page. The upload must show progress and survive a flaky 4G connection. The form must not lose her bio when an upload fails. The publish button must be disabled until required fields are valid. Each of those is a lesson in Modules 5, 8, and 6 respectively.\n\n**Flow B — the buyer discovers.** Someone in Kundapura wants a wedding portrait. They land on the home page, never sign in, type "Kundapura" into the search bar, pick "Portrait Painting" from the category chips, and land on `/artists?category=portrait&location=kundapura`. The service-area matching from Module 9 returns our Brahmavara painter, because she declared Udupi district and Kundapura sits inside it. They open her profile, scroll her portfolio, read two reviews, and tap "Show phone number." *Now*, for the first time, they meet Google sign-in. They sign in, land back on her profile exactly where they were, and the number is revealed. They tap the WhatsApp button.\n\nThat last sequence — tap, sign in, return, and the action they wanted has already happened — is the single most important interaction in the app, and the easiest to get wrong. The naive implementation signs them in and dumps them on the home page, where they must find the artist again. Module 11 stores the intent before redirecting and replays it on return.',
          diagram: `sequenceDiagram
    autonumber
    actor V as Visitor in Kundapura
    participant R as React app
    participant PG as Postgres + RLS
    participant G as Google OAuth

    V->>R: Search "Kundapura" + category Portrait
    R->>PG: select artists where service area covers Kundapura
    PG-->>R: 4 artists (phone = NULL, caller is anon)
    V->>R: Open Rukmini's profile
    R->>PG: select artist + artworks + reviews
    PG-->>R: profile data (phone still NULL)
    V->>R: Tap "Show phone number"
    R->>R: Save intent: {action:'reveal', slug:'rukmini'}
    R->>G: Redirect to Google sign-in
    G-->>R: Redirect to /auth/callback?code=...
    R->>PG: Exchange code, receive JWT session
    R->>R: Read saved intent, navigate back to Rukmini
    R->>PG: select artist (now with Authorization: Bearer JWT)
    PG-->>R: phone = "+91 98xxxxxxxx" (auth.uid is not null)
    R-->>V: Number revealed + WhatsApp button, same scroll position`,
          flowExplain:
            'Steps 7 and 12 are the ones beginners omit. Saving the intent before the redirect, and replaying it after, is what turns a jarring detour into an invisible one.',
          whyItMatters:
            'These two flows are the acceptance test for the entire course. Every module either serves Flow A or Flow B. If you ever wonder whether a feature is worth building, ask which flow it belongs to. If it belongs to neither, it is Tier 4.',
          steps: [
            'Write Flow A as a numbered list of user actions, then annotate each with the module that implements it.',
            'Do the same for Flow B.',
            'For each flow, identify the step most likely to fail on a poor connection. (A: the image upload. B: nothing — it is all reads, which is why browsing must never require auth.)',
            'Note where the two flows touch: they touch only at the database. The artist never sees the buyer\'s screen, and vice versa. That is why the RLS policies can be written independently.',
            'Write down the "return to intent" requirement now, as a one-line note, so Module 11 does not surprise you: **store where you were and what you wanted before redirecting to Google.**',
          ],
          code: `FLOW A — artist publishes (module that implements each step)

  1. Land on home                               M7  UI
  2. Click "Become an artist" -> /dashboard     M6  routing
  3. Redirected to Google (route is protected)  M5  protected routes
  4. Sign in, return to /dashboard              M5  session + redirect
  5. profiles row auto-created by DB trigger    M4  trigger on auth.users
  6. Dashboard sees no artists row -> show form M8  dashboard
  7. Fill profile, pick categories + languages  M6  forms, M8 dashboard
  8. Pick service areas (Udupi district, ...)   M9  location system
  9. Upload avatar, cover, 6 artworks           M8  Supabase Storage
 10. Publish -> is_published = true             M8  RLS: owner-only update

FLOW B — buyer discovers (never signs in until step 7)

  1. Land on home                               M7  UI
  2. Type "Kundapura", pick Portrait Painting   M10 search
  3. /artists?category=portrait&loc=kundapura   M10 filters
  4. Service-area match returns the artist      M9  matching logic
  5. Open profile, scroll portfolio             M10 artist detail
  6. Read reviews and average rating            M13 reviews
  7. Tap "Show phone number"                    M11 contact gate
  8.   -> save intent, redirect to Google       M11 + M5
  9.   -> return, replay intent, reveal number  M11
 10. Tap WhatsApp -> wa.me/91xxxxxxxxxx          M11

  Steps 1-6 happen with auth.uid() = NULL. That is not a limitation.
  That is the product.`,
          pitfalls: [
            '**Dumping the user on the home page after sign-in.** They wanted a phone number and you gave them a hero section. Fix: persist the intent (sessionStorage or the OAuth `redirectTo`) and replay it.',
            '**Creating the `profiles` row from React after sign-in.** If the network drops between sign-in and the insert, you have an authenticated user with no profile — an orphan state you will be debugging for hours. Fix: a Postgres trigger on `auth.users` creates it atomically. Module 4.',
            '**Letting a failed image upload clear the whole form.** The artist retypes a 300-word bio and leaves forever. Fix: uploads are independent of the form state; failures are per-image and retryable.',
            '**Testing only Flow B because it is the pretty one.** Flow A has every hard part: auth, uploads, validation, ownership. Fix: run Flow A end to end, on a phone, on real mobile data, before you believe it works.',
          ],
          tryIt:
            'Flow B step 8 says "save intent." Name three places you could save it: `sessionStorage`, a query parameter on the OAuth `redirectTo` URL, or a React context that survives the redirect (it does not — the page reloads). Which two actually work, and which is more robust if the user has multiple tabs open? Think it through; Module 11 will confirm.',
          takeaway:
            'Two flows: the artist publishes, the buyer discovers. Every module serves one of them. Sign-in is a detour inside Flow B, never a destination.',
        },
        {
          id: 'm0-t11',
          title: 'Folder structure — every folder, and why it exists',
          explain:
            'Eleven folders under `src/`. Each one answers a different question, and a file that could live in two of them is a file doing two jobs.',
          analogy:
            'A well-run kitchen has a place for raw vegetables, a place for cut vegetables, a place for spices, and a place for finished dishes. Nobody stores the finished dosa in the spice drawer. The reason is not tidiness — it is that when you are cooking fast, you must reach for something without looking.',
          theory:
            'We use a **layer-first** structure. That is a deliberate choice, and it is the opposite of the feature-first structure a Flutter or Next.js app of this size might use. The reason is scale: KalaKaara has seven screens and roughly forty components. Below about fifty components, layer-first is easier to navigate because you always know *what kind* of thing you are looking for. Above that, feature-first wins because you always know *which feature* you are working on. Know both; choose by size.\n\nWalking down the tree:\n\n**`assets/`** — images, icons, fonts that Vite processes at build time. Static, no logic.\n\n**`components/`** — reusable presentational components. `ArtistCard`, `RatingStars`, `Skeleton`, `EmptyState`. The rule: a component here **never** calls Supabase and never knows a route exists. It receives props and renders. This makes them trivially testable and reusable, and it is the single most valuable discipline in this list.\n\n**`layouts/`** — the shells that wrap pages. `MainLayout` (navbar + outlet + footer), `DashboardLayout`. They exist because React Router\'s nested routes need a component to render an `<Outlet />` into.\n\n**`pages/`** — one component per route. `HomePage`, `BrowsePage`, `ArtistDetailPage`. A page composes components, calls hooks, and owns the screen\'s state. Pages *may* read from hooks; they still do not call Supabase directly.\n\n**`contexts/`** — React Context providers for genuinely global state. In KalaKaara there are exactly two: `SessionContext` (who is signed in) and `FavoritesContext` (the current user\'s favourite artist ids). Two. Not seven. Context is for state that many distant components need; anything else is a prop.\n\n**`hooks/`** — custom hooks. `useArtists(filters)`, `useArtist(slug)`, `useDebounce(value, ms)`. A hook is where "fetch data, track loading, track error" lives. Every hook returns the same shape: `{ data, loading, error }`. Consistency here removes an entire class of bug.\n\n**`services/`** — the **only** folder allowed to import the Supabase client. `artistService.js`, `artworkService.js`, `favoriteService.js`, `geocoding/`. Each function takes plain arguments and returns plain data or throws. Why so strict? Because when Supabase changes an API, or you want to swap the geocoding provider, or you want to test a component without a network — you change one folder. Components that call `supabase.from(...)` inline are components welded to a vendor.\n\n**`supabase/`** — the client singleton (`client.js`) and nothing else. Separate from `services/` because it is configuration, not logic.\n\n**`utils/`** — pure functions. `formatPrice(1500)` → `"₹1,500"`. `slugify("Rukmini Shetty")` → `"rukmini-shetty"`. `haversineKm(a, b)`. No React, no imports from anywhere else in the app. If it needs a hook, it is not a util.\n\n**`constants/`** — frozen values. `ART_CATEGORIES`, `SERVICE_AREA_TYPES`, `SORT_OPTIONS`, `ROUTES`. Magic strings scattered across components are how `"portait"` ships to production.\n\n**`styles/`** — global CSS, CSS custom properties (the design tokens), and the reset. Component-specific styles live next to their component as `ArtistCard.module.css`, not here.\n\nThe dependency rule that ties it together: **pages → hooks → services → supabase.** Arrows point one way. A service never imports a hook. A component never imports a service. If you find yourself wanting to break that, the thing you are building is in the wrong folder.',
          diagram: `graph TD
    P[pages/<br/>one per route] --> C[components/<br/>presentational, no data]
    P --> HK[hooks/<br/>data + loading + error]
    P --> CX[contexts/<br/>session, favorites]
    HK --> SV[services/<br/>ONLY folder that<br/>imports supabase]
    CX --> SV
    SV --> SB[supabase/client.js<br/>the singleton]
    P --> L[layouts/<br/>navbar + Outlet + footer]
    C --> U[utils/<br/>pure functions]
    HK --> U
    SV --> U
    P --> K[constants/<br/>no magic strings]
    C --> K
    SV --> K

    style SV fill:#fde68a
    style SB fill:#fecaca`,
          flowExplain:
            'Every arrow points downward. Nothing under `services/` ever reaches back up to a hook or a component. When you cannot decide where a file belongs, ask which way its arrows point.',
          whyItMatters:
            'Folder structure is not aesthetics. The rule "only `services/` imports Supabase" is what will let you, in Module 14, add caching to every query by editing one folder — and in Module 16, test components with zero network. Structure is leverage you grant your future self.',
          steps: [
            'Create the eleven folders in Module 2, each with a one-line `README.md` stating its rule. Yes, really. It takes four minutes and settles every future argument.',
            'Write the dependency rule at the top of your project README: **pages → hooks → services → supabase**.',
            'Adopt the naming conventions: components `PascalCase.jsx`, hooks `useCamelCase.js`, services `camelCaseService.js`, constants `SCREAMING_SNAKE_CASE` inside `camelCase.js` files, CSS Modules `ComponentName.module.css`.',
            'Decide the co-location rule: a component and its CSS Module live side by side. `components/ArtistCard/ArtistCard.jsx` + `ArtistCard.module.css` + `index.js`.',
            'Set one guardrail you will actually enforce: grep for `from \'../supabase\'` outside `services/`. If it appears, the file is in the wrong layer.',
          ],
          code: `src/
├── assets/                    images, fonts, svg. Static. No logic.
│   └── logo.svg
│
├── components/                Reusable + presentational. NEVER call Supabase.
│   ├── ArtistCard/
│   │   ├── ArtistCard.jsx
│   │   ├── ArtistCard.module.css
│   │   └── index.js           re-export, so imports stay short
│   ├── ArtworkCard/
│   ├── RatingStars/
│   ├── CategoryChip/
│   ├── EmptyState/
│   ├── Skeleton/
│   └── ProtectedRoute/
│
├── layouts/                   Page shells with <Outlet />.
│   ├── MainLayout/            navbar + outlet + footer
│   └── DashboardLayout/       sidebar + outlet
│
├── pages/                     One component per route. Composes, does not fetch.
│   ├── HomePage/
│   ├── BrowsePage/
│   ├── ArtistDetailPage/
│   ├── ArtworkDetailPage/
│   ├── DashboardPage/
│   ├── FavouritesPage/
│   ├── AuthCallbackPage/
│   └── NotFoundPage/
│
├── contexts/                  Global state ONLY. Exactly two of them.
│   ├── SessionContext.jsx     who is signed in
│   └── FavoritesContext.jsx   current user's favourite artist ids
│
├── hooks/                     Data fetching. Always returns {data, loading, error}.
│   ├── useArtists.js
│   ├── useArtist.js
│   ├── useArtworks.js
│   ├── useFavorites.js
│   ├── useDebounce.js
│   └── useGeolocation.js
│
├── services/                  THE ONLY FOLDER THAT IMPORTS THE SUPABASE CLIENT.
│   ├── artistService.js
│   ├── artworkService.js
│   ├── favoriteService.js
│   ├── reviewService.js
│   ├── storageService.js
│   └── geocoding/
│       ├── provider.js        picks an implementation from an env var
│       ├── postgresProvider.js    our own tables. The default.
│       ├── nominatimProvider.js   free, no key, no card
│       └── googleProvider.js      optional. Needs a card. Not the default.
│
├── supabase/
│   └── client.js              createClient(url, anonKey). Imported once.
│
├── utils/                     Pure functions. No React. No imports from src/.
│   ├── formatPrice.js
│   ├── slugify.js
│   ├── haversine.js
│   └── validators.js
│
├── constants/                 Frozen. No magic strings anywhere else.
│   ├── routes.js
│   ├── categories.js
│   ├── serviceAreaTypes.js
│   └── sortOptions.js
│
├── styles/                    Global only. Component styles are co-located.
│   ├── reset.css
│   ├── tokens.css             CSS custom properties: colours, spacing, radii
│   └── global.css
│
├── App.jsx                    Router + providers
└── main.jsx                   createRoot. Four lines.

THE DEPENDENCY RULE:   pages -> hooks -> services -> supabase
                       components -> utils, constants
                       arrows never point back up.`,
          pitfalls: [
            '**Calling `supabase.from(...)` inside a component "just this once."** It is never once. Within a month, Supabase is welded into thirty components and you cannot test any of them. Fix: the service layer is a hard boundary, from the very first query.',
            '**Putting every piece of state in a Context because prop-drilling felt tedious.** Context re-renders every consumer on every change. Two contexts is right for this app. Fix: drill props two levels; reach for Context at three, and only for genuinely global facts.',
            '**A `utils/` file that imports React or a service.** Then it is not a util, it is a hook or a service in the wrong folder. Fix: the test is mechanical — can you unit-test it with zero mocks? If not, it does not belong in `utils/`.',
            '**Naming a folder `helpers/` or `common/`.** These are not categories, they are places where files go to die. Fix: if you cannot name the folder after what its files *are*, you have not decided what they are.',
            '**Choosing feature-first because a blog post said so.** Feature-first is right for large apps. KalaKaara has seven screens. Fix: pick the structure that fits the size, and be able to explain why in one sentence.',
          ],
          tryIt:
            'Where does the Haversine distance function live? Answer: `utils/haversine.js` — it is a pure function of four numbers. Now: where does the *query* that uses it live? Answer: `services/artistService.js`, because it touches Supabase. And the React state that holds the search radius? A `useState` in `BrowsePage`. Three homes, three reasons. Practise this categorisation on `formatPrice`, `useDebounce`, and `SessionContext`.',
          takeaway:
            'Eleven folders, one dependency rule: pages → hooks → services → supabase. The most valuable line in this course is "only `services/` imports the Supabase client."',
        },
        {
          id: 'm0-t12',
          title: 'Naming, conventions, and the rules we will not break',
          explain:
            'Six conventions, adopted now, that keep a sixteen-module codebase navigable.',
          analogy:
            'Every house in a village numbers its rooms differently and no postman can deliver anything. Conventions are boring precisely because they work: nobody admires a well-numbered street, they simply arrive.',
          theory:
            'Conventions are cheap to adopt on day one and expensive to retrofit on day sixty. Here are the six that matter for this codebase, each with the reasoning attached, because a convention you cannot justify is a convention you will abandon under pressure.\n\n**1. Database columns are `snake_case`; JavaScript is `camelCase`.** Postgres folds unquoted identifiers to lowercase, so `displayName` becomes `displayname` and you will spend an evening confused. Use `display_name` in SQL, and map at the service boundary — which is another reason the service layer exists.\n\n**2. Every table has `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`, and — where it can be edited — `updated_at timestamptz default now()` maintained by a trigger.** Uniform, boring, and it means every query, index, and sort works the same way everywhere.\n\n**3. Booleans are named as assertions, and default to the safe value.** `is_published` defaults to `false`. `is_negotiable` defaults to `false`. Never `published` (ambiguous), never `disabled` (double negatives destroy code review).\n\n**4. Every custom hook returns `{ data, loading, error }` — that exact shape, in that order.** Not `{ artists, isLoading, err }`. When every hook has the same shape, a page that renders a loading skeleton, an error state, and an empty state can be copy-pasted and will be right.\n\n**5. Every async service function either returns data or throws.** Never returns `{ data, error }` to the caller. Supabase returns that shape internally; the service unwraps it, throws on error, and returns plain data. Why? Because `if (error) return` scattered through forty components is how errors get silently swallowed. One `throw` and one error boundary beats forty forgotten checks.\n\n**6. No magic strings.** `\'portrait-painting\'` appears once, in `constants/categories.js`. Sort keys, route paths, service-area types, and bucket names all live in `constants/`. A typo in a constant is a build error; a typo in a string literal is a Tuesday afternoon.\n\nAnd one rule that is not a naming convention but belongs here: **every list view ships with three states — loading, empty, and error — before it ships with data.** Write the skeleton first, the empty state second, the error state third, and the happy path last. It sounds backwards. It is the only order that produces a UI that does not fall apart on a train.',
          whyItMatters:
            'A codebase is read far more often than it is written, and most of that reading is you, three weeks later, at 11 p.m. Conventions are a message to that person. The `{ data, loading, error }` rule alone will save you writing the same three-state render logic seven times.',
          steps: [
            'Write the six conventions into `CONTRIBUTING.md` in your repo before Module 2 ends.',
            'Set up ESLint and Prettier in Module 2 and never argue about formatting again.',
            'Adopt the three-state rule literally: for every new list, write the `<Skeleton />` branch and the `<EmptyState />` branch before you write the `.map()`.',
            'Grep-check your own rules occasionally. `grep -r "supabase" src/components/` must return nothing, and a search for the raw string `portrait-painting` outside `constants/` must return nothing either.',
            'Pick the boring option every time there is a tie. Boring code is code you can read while tired.',
          ],
          code: `// 1. snake_case in SQL, camelCase in JS. Map at the service boundary.
//    services/artistService.js
const toArtist = (row) => ({
  id: row.id,
  displayName: row.display_name,      // <- the map lives HERE, once
  yearsExperience: row.years_experience,
  isPublished: row.is_published,
  createdAt: row.created_at,
});

// 2 & 5. Services return data or throw. Never { data, error } to the caller.
export async function getArtistBySlug(slug) {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw new Error(\`Could not load artist "\${slug}": \${error.message}\`);
  return toArtist(data);          // plain object. The caller never sees Supabase.
}

// 4. Every hook, the same shape. Every time.
export function useArtist(slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;                     // guards against a race on unmount
    setLoading(true);
    getArtistBySlug(slug)
      .then((a) => !cancelled && setData(a))
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [slug]);

  return { data, loading, error };   // this exact shape. Always.
}

// 6. No magic strings. constants/categories.js
export const CATEGORY_SLUGS = Object.freeze({
  PORTRAIT: 'portrait-painting',
  MURAL: 'mural-painting',
  CALLIGRAPHY: 'calligraphy',
});
// A typo here is a build error. A typo in a string literal is a bad Tuesday.

// The three-state rule, written in the order you should write it:
function ArtistList({ filters }) {
  const { data, loading, error } = useArtists(filters);
  if (loading) return <ArtistGridSkeleton count={6} />;   // FIRST
  if (error)   return <ErrorState onRetry={...} />;       // SECOND
  if (!data.length) return <EmptyState ... />;            // THIRD
  return data.map((a) => <ArtistCard key={a.id} artist={a} />);  // LAST
}`,
          pitfalls: [
            '**Using `camelCase` for Postgres columns.** Unquoted identifiers fold to lowercase, so `displayName` silently becomes `displayname`, and then you need double quotes everywhere forever. Fix: `snake_case` in SQL, without exception.',
            '**Returning `{ data, error }` from your own service functions.** Every caller must now remember to check `error`, and one day one of them will not. Fix: throw. Errors that are ignored are worse than errors that crash.',
            '**Letting hooks return different shapes.** `useArtists` returns `{ artists, isLoading }` and `useArtist` returns `{ data, loading }`. Now no page can be copy-pasted. Fix: one shape, enforced by review.',
            '**Writing the happy path first and promising to add loading states later.** Later never arrives, and the first person on a slow connection sees a blank white screen. Fix: skeleton, empty, error, then data. In that order.',
            '**Bikeshedding formatting in code review.** Fix: Prettier decides. Nobody argues with Prettier because nobody can.',
          ],
          tryIt:
            'Look at the `useArtist` hook above. It sets `cancelled = true` in the cleanup function. Explain, in one sentence, what breaks without it. (A user opens artist A, navigates to artist B before A\'s request resolves; A\'s response arrives late and overwrites B\'s data — and React warns about setting state on an unmounted component.) Every hook in this course has that guard.',
          takeaway:
            'Six conventions, adopted now: snake_case in SQL, uniform table columns, assertive booleans, one hook shape, services throw, no magic strings. And always: skeleton, empty, error, then data.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm0-p1',
      type: 'Mini Project',
      title: 'The KalaKaara Product Spec & Architecture Document',
      domain: 'Requirements & System Design',
      duration: '2 hours',
      description:
        'Before writing any code, produce the document a real team would produce: a one-page product spec, a labelled architecture diagram, a service-by-service zero-cost audit, the route table, and the annotated folder tree — committed to a fresh GitHub repository as the first commit of the project.',
      tools: ['Markdown', 'Mermaid', 'Git', 'GitHub'],
      blueprint: {
        overview:
          'A GitHub repository containing a `docs/` folder with four documents — product spec, architecture, cost audit, and structure guide — plus a README that links them and a CONTRIBUTING.md that states the six coding conventions. No application code yet. This is the document a new engineer would read on their first day, and it is the document you will check every decision against for the next fifteen modules.',
        functionalRequirements: [
          '**docs/01-product-spec.md.** The three actors, the F1–F9 functional requirements, the N1–N4 non-functional requirements, the tier list, and the explicit "not building" list with one line of reasoning each.',
          '**docs/02-architecture.md.** A Mermaid diagram of the four layers, a written request lifecycle for both an anonymous and an authenticated read, and a paragraph justifying BaaS over a Node backend.',
          '**docs/03-cost-audit.md.** Every service, the result of the card test, the free-tier ceiling, and — for each service that fails — the chosen free alternative and why. Google Places must appear here as a documented rejection.',
          '**docs/04-structure.md.** The eleven folders, one sentence each, plus the dependency rule and the six naming conventions.',
          '**docs/05-flows.md.** Mermaid sequence diagrams for Flow A (artist publishes) and Flow B (buyer discovers), with the sign-in detour drawn explicitly.',
          '**README.md.** What KalaKaara is, the stack, the zero-cost promise, and links to all five documents.',
          '**CONTRIBUTING.md.** The six conventions, stated as rules, with the two grep commands that check them.',
        ],
        technicalImplementation: [
          '**Mermaid in Markdown.** GitHub renders ```mermaid fenced blocks natively — no image files, no diagram tool, and the diagrams stay in version control as text you can diff.',
          '**The route table** is a Markdown table with columns: path, screen, access, key data. Derive it from the wireframes, not from imagination.',
          '**The cost audit** is a Markdown table with columns: service, card required?, free ceiling, verdict, alternative. Fill the "card required?" column by actually opening each signup flow.',
          '**The folder tree** is a fenced code block, annotated with a trailing comment on each folder stating its one rule.',
          '**Git hygiene from commit one.** `git init`, a `.gitignore` that already excludes `.env.local` and `node_modules/` (before either exists), and a first commit message that describes the document, not the act of committing.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Repository, gitignore, and README skeleton',
            outcome:
              'A fresh repo with a correct .gitignore and a README that states the product and the zero-cost promise.',
            prompt:
              'Create a new folder `kalakaara`, run `git init`, and add a `.gitignore` for a Vite + React project that already excludes `node_modules/`, `dist/`, `.env`, `.env.local`, `.env.*.local`, `.DS_Store`, and editor folders — before any of those exist. Write `README.md` describing KalaKaara: an artist discovery marketplace connecting artists (wall painting, portraits, calligraphy, murals, sculpture, digital art) with buyers; the stack (React + Vite, Supabase Postgres/Auth/Storage, Vercel, all free with no credit card); and a table of contents linking to five documents in `docs/` that do not exist yet. Do not scaffold any application code.',
          },
          {
            step: 2,
            label: 'Product spec: actors, requirements, tiers, and the cut list',
            outcome:
              'docs/01-product-spec.md — the document every later scope decision is checked against.',
            prompt:
              'Write `docs/01-product-spec.md`. Include: (a) the three actors — anonymous visitor, signed-in user, and artist-as-owner-of-a-row — with a Mermaid graph showing that "artist" is derived from owning a row in the artists table, not from a role column; (b) functional requirements F1 through F9; (c) non-functional requirements N1 (zero cost, no credit card) through N4 (accessible and indexable), each stated so it is falsifiable; (d) the four tiers, mapping each of Modules 2–16 to a tier and explaining why the core loop closes at Module 11; (e) an explicit "deliberately not building" list — in-app chat, payments, commissions, verification badges, admin moderation, push notifications — with one sentence each on what it would actually require. Keep it under 400 lines.',
          },
          {
            step: 3,
            label: 'Architecture document with request lifecycles',
            outcome:
              'docs/02-architecture.md — a Mermaid diagram plus two traced request lifecycles.',
            prompt:
              'Write `docs/02-architecture.md`. Include: (a) a Mermaid `graph TD` of four layers — browser (components → hooks → services → supabase client), Vercel CDN, Supabase (GoTrue, PostgREST, Storage, Postgres with RLS), and external free services (Google OAuth endpoint, Nominatim, wa.me links); (b) a numbered request lifecycle for an anonymous visitor loading `/artists/:slug`, showing that PostgREST sets the `anon` role so `auth.uid()` is NULL and the phone column comes back NULL from Postgres itself; (c) the same lifecycle for an authenticated user, highlighting exactly which steps differ; (d) a section titled "Why not a Node backend?" arguing that authorisation moves into RLS where it cannot be forgotten, that we have no server-side secrets because we chose no paid APIs, and that hosting a server would violate N1 — and stating honestly when this architecture would be the wrong choice.',
          },
          {
            step: 4,
            label: 'The zero-cost audit, including the Google Places rejection',
            outcome:
              'docs/03-cost-audit.md — every service card-tested, with alternatives for the failures.',
            prompt:
              'Write `docs/03-cost-audit.md`. Build a Markdown table with columns: Service, Card required at signup?, Free ceiling, Verdict, Alternative. Cover Supabase, Vercel Hobby, GitHub, Google OAuth (sign-in), Google Maps Platform / Places API, Firebase Storage, AWS S3, and Cloudinary. Explicitly document that Google Places fails the card test because Maps Platform requires an enabled billing account even to consume its free quota, and that this is distinct from Google OAuth sign-in, which is free and card-free despite living in the same console. Then write the replacement location stack: (1) autocomplete against our own seeded `states`/`districts`/`taluks`/`cities` Postgres tables — instant, unlimited, and returning the administrative units our matching logic actually needs; (2) Nominatim or Photon for free-text and reverse geocoding, no key, no card, with their one-request-per-second policy noted; (3) `navigator.geolocation` for "Near me"; (4) Haversine in plain SQL for radius matching, no PostGIS. Note the Supabase 7-day inactivity pause and that restoring is one click with no data loss.',
          },
          {
            step: 5,
            label: 'Flows, wireframes, and the route table',
            outcome:
              'docs/05-flows.md — two sequence diagrams and the route table derived from them.',
            prompt:
              'Write `docs/05-flows.md`. Include: (a) a Mermaid `sequenceDiagram` for Flow A, the artist publishing — landing, protected `/dashboard` redirect to Google, the `profiles` row created by a Postgres trigger on `auth.users` rather than by React, the dashboard detecting no `artists` row, profile creation, image uploads, service-area selection, and publish; (b) a Mermaid `sequenceDiagram` for Flow B, the buyer discovering — searching Kundapura for portrait painting, service-area matching returning an artist who declared Udupi district, opening the profile, and tapping "Show phone number", which saves the intent, redirects to Google, returns, replays the intent, and reveals the number without losing scroll position; (c) the seven-row route table with an access column marking `/dashboard` and `/favourites` as protected, and a footnote explaining that `/artists/:slug` is public but returns NULL contact fields for anonymous callers; (d) a short section on the empty, loading, and error variant of the browse screen. Emphasise in prose that the logged-out contact button must read "Show phone number", never "Sign in".',
          },
          {
            step: 6,
            label: 'Structure guide, conventions, and the first commit',
            outcome:
              'docs/04-structure.md + CONTRIBUTING.md, and a clean first commit pushed to GitHub.',
            prompt:
              'Write `docs/04-structure.md` containing the annotated `src/` tree — assets, components, layouts, pages, contexts, hooks, services, supabase, utils, constants, styles — with a trailing comment on each folder stating its one rule, and a Mermaid diagram of the dependency rule `pages → hooks → services → supabase`. State explicitly that `services/` is the only folder permitted to import the Supabase client, and explain that this is what will later allow caching to be added in one place and components to be tested without a network. Justify layer-first over feature-first for a seven-screen app in one paragraph. Then write `CONTRIBUTING.md` with the six conventions — snake_case in SQL and camelCase in JS mapped at the service boundary; uniform `id`/`created_at`/`updated_at` on every table; booleans named as assertions with safe defaults; every hook returns exactly `{ data, loading, error }`; every service returns data or throws, never `{ data, error }`; no magic strings, everything in `constants/` — plus the two grep commands that enforce the first and last of them. Finally, run `git add -A`, make a first commit with a message describing the specification (not the act of committing), and print the exact commands to create a GitHub repo and push. Do not push without my go-ahead.',
          },
        ],
        deliverable:
          'A GitHub repository with zero application code and five documents that fully specify KalaKaara: what it does, who uses it, how it is architected, why every service in it is free, how the folders are organised, and what you have deliberately chosen not to build. A stranger could read it in twenty minutes and start Module 2 with no further questions.',
      },
    },
  ],
  quiz: [
    {
      id: 'm0-q1',
      q: 'In KalaKaara, what makes a signed-in user an "artist"?',
      options: [
        'An is_artist boolean is set to true on their profiles row',
        'An administrator grants them the artist role',
        'They own a row in the artists table — artists.user_id = auth.uid(). There is no role column.',
        'They sign in through a separate artist-only login page',
      ],
      answer: 2,
    },
    {
      id: 'm0-q2',
      q: 'Why does the Google Places API fail this course\'s first non-functional requirement?',
      options: [
        'Google Maps Platform requires an enabled billing account — and therefore a credit card on file — even to consume its free monthly quota',
        'Google Places is technically incapable of autocompleting Indian place names',
        'The Places API is deprecated and no longer available',
        'Places costs money on every single request with no free quota at all',
      ],
      answer: 0,
    },
    {
      id: 'm0-q3',
      q: 'An artist declares three service areas: "Pan India", "Karnataka", and "Manipal city". A user searches for Manipal. How should the matching logic combine those areas?',
      options: [
        'With AND — all three must cover the searched location',
        'Only the most specific area counts; the others are ignored',
        'Only the first area created is ever used for matching',
        'With OR — the artist appears if ANY one of their declared areas covers the searched location',
      ],
      answer: 3,
    },
    {
      id: 'm0-q4',
      q: 'Why is it safe for the Supabase anon key to be baked into the public JavaScript bundle that Vercel serves?',
      options: [
        'Vite encrypts all VITE_ prefixed environment variables at build time',
        'The anon key only identifies the caller as anonymous or authenticated; Row Level Security policies in Postgres decide what that caller may actually read or write',
        'The anon key expires after a few minutes, so leaking it is harmless',
        'It is not safe, but there is no alternative when there is no backend server',
      ],
      answer: 1,
    },
    {
      id: 'm0-q5',
      q: 'Which folder in the src/ tree is the only one permitted to import the Supabase client, and why?',
      options: [
        'components/ — because that is where data is actually rendered',
        'hooks/ — because hooks are where useEffect calls the network',
        'services/ — so that swapping providers, adding caching, or testing components without a network is a change in one folder rather than thirty',
        'supabase/ — because the client lives there, so all queries should live there too',
      ],
      answer: 2,
    },
    {
      id: 'm0-q6',
      q: 'A visitor taps "Show phone number" on an artist profile while logged out. What must happen for this to be a well-designed flow?',
      options: [
        'Save the intent (which artist, which action), redirect to Google, then on return navigate back to that artist and reveal the number — the sign-in is an invisible detour',
        'Redirect to Google, then land the user on the home page so they can start browsing again',
        'Show an alert saying "You must sign in first" and do nothing else',
        'Reveal the number anyway and hide it with CSS until the user signs in',
      ],
      answer: 0,
    },
    {
      id: 'm0-q7',
      q: 'Why does the course compute radius matching with a bounding-box prefilter before applying the Haversine formula?',
      options: [
        'The Haversine formula is inaccurate over long distances, so the box corrects it',
        'PostgreSQL forbids calling trigonometric functions inside a WHERE clause',
        'The bounding box is required by Supabase\'s free tier query limits',
        'Haversine involves trigonometry on every row and cannot use an index; a bounding box on indexed lat/lng columns cheaply narrows candidates so exact distance runs on only a handful of rows',
      ],
      answer: 3,
    },
    {
      id: 'm0-q8',
      q: 'Why is the profiles row for a new user created by a Postgres trigger on auth.users rather than by React after sign-in?',
      options: [
        'React is not allowed to insert into the profiles table under any circumstances',
        'A trigger creates it atomically with the auth user; doing it from React means a dropped network call leaves an authenticated user with no profile row',
        'Triggers are faster than an insert from the client',
        'Supabase does not expose an insert API for the profiles table',
      ],
      answer: 1,
    },
  ],
}
