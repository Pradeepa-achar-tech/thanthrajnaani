# LocalInsta

A real, working Flutter + Supabase Instagram-style app — the hands-on companion to the
LocalInsta course in this portfolio. Auth, a live feed, photo posting, likes, comments,
profiles, and follow — all backed by a genuine Postgres schema with Row Level Security,
on Supabase's free tier (no card required, ever).

This is a **core-loop build**, not the full 11-module/154-topic course implemented end
to end — stories, direct messages, Reels/video, and push notifications are covered in
the course but not yet in this codebase. See "What's next" at the bottom.

## What's already built and working

- **Auth** — email/password sign up, sign in, sign out, session handling via a sealed
  `AuthSession` and a single `AuthGate`
- **Feed** — paginated (`.range()`), infinite scroll, pull-to-refresh, embedded
  post+author joins (no N+1 queries)
- **Posting** — camera/gallery picker → square crop → upload to Supabase Storage →
  appears instantly in the feed
- **Likes** — double-tap heart animation + tap icon, backed by the atomic `toggle_like`
  Postgres function, optimistic UI with rollback on failure
- **Comments** — post detail screen, optimistic posting, delete your own
- **Profiles** — header with live stats, post grid, edit profile (with avatar upload),
  follow/unfollow, followers/following lists, username search
- **Dark mode** — persisted `ThemeState`, reads `Theme.of(context)` everywhere
- **A real signed release APK** — already built, see below

## Get it running against YOUR OWN free backend

I can't create a Supabase account on your behalf (it needs your own email/signup), so
the app currently builds against placeholder credentials. Three steps to make it real:

### 1. Create a free Supabase project (no card, ever)

Go to [supabase.com](https://supabase.com), sign up, click **New Project**, name it
`localinsta`, pick the `ap-south-1` (Mumbai) region. Takes about 2 minutes to provision.

### 2. Run the migrations

Open your project's **SQL Editor** and run these four files, in order:

1. `supabase/migrations/0001_schema.sql` — tables (profiles, posts, likes, comments, follows)
2. `supabase/migrations/0002_rls_policies.sql` — Row Level Security on every table
3. `supabase/migrations/0003_triggers_and_functions.sql` — auto-profile creation,
   denormalized counters, the `toggle_like` function
4. `supabase/migrations/0004_storage.sql` — the `avatars`/`posts` Storage buckets + policies

### 3. Run or build the app with your real credentials

Find your **Project URL** and **anon/public key** under **Project Settings → Data API**,
then:

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://your-project-ref.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key-here
```

To build a fresh signed release APK with real credentials:

```bash
flutter build apk --release --split-per-abi \
  --dart-define=SUPABASE_URL=https://your-project-ref.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=your-anon-key-here
```

Output lands in `build/app/outputs/flutter-apk/` — `app-arm64-v8a-release.apk` is the
one to install on any modern phone (Settings → Install unknown apps → enable for your
file manager/WhatsApp, then transfer and tap the APK).

**Note:** by default, Supabase requires email confirmation before a new account can sign
in. For faster testing, toggle **Confirm email** off under **Authentication → Providers
→ Email** in your dashboard (see the course's Module 2 for the full explanation).

## Already built for you: a signed release APK

`build/app/outputs/flutter-apk/` already contains three real, signed release APKs
(split per CPU architecture — `app-arm64-v8a-release.apk` covers virtually every modern
phone), built with placeholder Supabase credentials so they install and open, but can't
sign in/load data until you rebuild with your own project's URL/key (step 3 above).
Verified signed with a genuine release certificate (`keytool -printcert`/`apksigner
verify`), not a debug fallback.

**The release keystore** (`android/upload.jks`, password in `android/key.properties`,
both gitignored) is the single most precious file here — if you ever publish a real
update under this app identity, losing it means starting over. Back it up somewhere
safe outside this repo.

## Project structure

```
lib/
  main.dart, app.dart          # entry point, provider wiring, MaterialApp
  core/                        # env config, Supabase client, theme, shared repos
  shared/widgets/, media/      # AvatarImage, PostImage, EmptyState, pick/crop helpers
  features/
    auth/                      # AuthRepository, SessionState, sign in/up, AuthGate
    feed/                      # Post model, PostsRepository, feed/create/detail screens
    profile/                   # Profile model, follow system, edit profile, search
    home/                      # HomeScaffold — the 4-tab bottom nav shell
supabase/migrations/           # the 4 SQL files described above
android/                       # signing config, launcher icon, the release keystore
```

## What's next (covered in the course, not yet in this codebase)

- **Stories** — 24h expiring, cleaned up by a free `pg_cron` job
- **Direct messages** — real-time chat with the hardest RLS policies in the course
- **Reels** — vertical video feed, extending `posts` additively
- **Notifications** — trigger-generated, with a live unread badge
- **Realtime** — the feed/comments currently refetch rather than subscribing live;
  wiring `supabase.channel(...).onPostgresChanges(...)` is a natural next step
- **Google Sign-In** — `AuthRepository` is structured to add it cleanly (see the
  course's Module 2 for the two-OAuth-client setup), not wired in yet

Each of these is fully taught, step by step, in the LocalInsta course itself — this app
is the real, working foundation everything else builds on top of.
