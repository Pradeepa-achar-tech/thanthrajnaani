// Module 1 — Supabase Project & Flutter Scaffold
// LocalInsta (Flutter + Supabase) course content for the React course player.

export const m1 = {
  id: 'm1',
  title: 'Supabase Project & Flutter Scaffold',
  hours: 6,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Create a free Supabase project (no card, ever), scaffold the real LocalInsta Flutter app, wire in supabase_flutter without hardcoding a single secret, and lay out the folder architecture every later module builds on.',
  sections: [
    {
      id: 'm1-s1',
      title: 'Supabase project bootstrap',
      topics: [
        {
          id: 'm1-t1',
          title: 'Create a free Supabase project — no card, ever',
          explain:
            'Sign up at supabase.com and create a new project on the free tier — genuinely no payment method required at any point.',
          analogy:
            'Renting a small stall at the Kundapura weekly santhe (market) for free during the trial season, no deposit asked — you get a real table, real footfall, real shelves, you just cannot yet handle the volume of the big Friday market. Supabase\'s free tier is that stall: a full production-grade Postgres database, real Auth, real Storage — just with sensible ceilings.',
          theory:
            'A **Supabase project** is a dedicated Postgres 15 database plus a bundle of managed services layered on top of it: **Auth** (users, sessions, JWTs), **Storage** (S3-compatible file buckets), **Realtime** (live Postgres change streams), and **Edge Functions** (serverless Deno functions). Signing up needs only an email or a GitHub account — **no credit card is requested anywhere in the free-tier signup flow**, unlike Firebase, where a *new* Storage bucket now requires the paid Blaze plan (and therefore a card on file) even if your usage stays free.\n\nThe free tier gives you: 500MB database space, 1GB file storage, 5GB monthly bandwidth, 50,000 monthly active auth users, and 500,000 Edge Function invocations — enormous headroom for a learning project or even a genuinely small real app. The one real-world catch: a **free project pauses automatically after 7 days with no API activity** — you just log back into the dashboard and click "Restore" to unpause it. That is the entire cost of staying on free forever.',
          whyItMatters:
            'This is the single decision that makes "free tier, no card, ever" actually true for LocalInsta. Naming this trade-off explicitly — Firebase\'s Blaze-gated Storage vs. Supabase\'s genuinely free Storage — is exactly the kind of architecture judgment call that comes up in real interviews about picking a backend.',
          steps: [
            'Go to `supabase.com`, sign up with GitHub or email — no card requested.',
            'Click **New Project**, name it `localinsta`, pick a strong database password (save it — you will rarely need it directly, but it exists).',
            'Pick the region closest to your users — `ap-south-1` (Mumbai) for a Karnataka-based app.',
            'Wait ~2 minutes while Supabase provisions the Postgres instance.',
            'Open **Project Settings → General** and note the **Project URL** and **Reference ID** — you will need the URL shortly.',
            'Bookmark **Project Settings → Data API** — that is where the `anon` key lives (next topic).',
          ],
          code: `# Nothing to run yet — this is a dashboard-only step.
# Once created, your project has a permanent URL shape:
# https://<project-ref>.supabase.co

# Free tier ceiling reference (2026):
# - 500 MB database
# - 1 GB file storage, 5 GB bandwidth / month
# - 50,000 monthly active Auth users
# - 500,000 Edge Function invocations / month
# - 2 free projects per organisation
# - Project pauses after 7 days of zero API activity (one click to restore)`,
          pitfalls: [
            '**Picking a distant region "by default".** Every query pays extra latency for the life of the project. Fix: pick the region nearest your actual users at creation time — it cannot be changed later without migrating.',
            '**Losing the database password.** It is shown once at creation. Fix: save it in a password manager immediately; you can reset it later from Project Settings but that is extra friction.',
            '**Panicking when a demo project "disappears" after a week of inactivity.** It is only paused, not deleted. Fix: log into the dashboard and click Restore — data is intact.',
            '**Creating a new project for every experiment.** The free tier caps you at 2 active projects per organisation. Fix: reuse one `localinsta` project for the whole course; use the SQL Editor to reset tables instead of recreating projects.',
          ],
          tryIt:
            'Create your `localinsta` Supabase project right now, region `ap-south-1`. Open Project Settings → General and copy the Project URL into a scratch note — you will paste it into Flutter in the next section.',
          takeaway: 'Supabase\'s free tier needs no card anywhere — the only real cost of staying free is a 7-day inactivity pause, one click to undo.',
        },
        {
          id: 'm1-t2',
          title: 'Tour the Supabase dashboard',
          explain:
            'Table Editor, SQL Editor, Authentication, Storage, Realtime, and API Docs — the six panels you will live in for the rest of this course.',
          analogy:
            'Think of the dashboard as the back office of a photo studio: one room for the ledger book (Table Editor), one for writing custom instructions to staff (SQL Editor), one for the visitor register (Authentication), one for the negative/print archive (Storage), and a public counter where anyone can ask "what services do you offer?" (auto-generated API docs).',
          theory:
            '**Table Editor** is a spreadsheet-like view over your Postgres tables — create columns, set types, browse rows, no SQL required for basic work. **SQL Editor** is a raw query console where you will run every `CREATE TABLE`, every RLS policy, and every migration in Module 3 onward — treat it like a proper code editor, not a toy.\n\n**Authentication** shows every signed-up user, lets you manually confirm/ban/delete accounts, and configures providers (email/password, Google OAuth in Module 2). **Storage** manages file buckets — think folders of images with their own access policies. **Realtime** lets you inspect which tables have live change-broadcasting enabled. The **API docs** tab is auto-generated, live documentation of every table\'s REST and Dart-client call shape — genuinely useful, not boilerplate filler.',
          whyItMatters:
            'Confidently navigating this dashboard is the difference between debugging a broken RLS policy in two minutes via SQL Editor versus flailing in your Flutter code for an hour. Every Supabase job posting assumes dashboard fluency.',
          steps: [
            'Open **Table Editor** — note it is currently empty (no tables yet).',
            'Open **SQL Editor**, run `select now();` and confirm you get a timestamp back.',
            'Open **Authentication → Users** — empty for now, will fill up in Module 2.',
            'Open **Storage** — note the "New bucket" button (used in Module 4).',
            'Open **Database → Realtime** — note which tables currently have realtime enabled (none yet).',
            'Open **API Docs** (the book icon) and skim the auto-generated Dart client examples.',
          ],
          code: `-- Try this in the SQL Editor right now
select now() as server_time, version() as postgres_version;

-- You should see something like:
-- server_time            | postgres_version
-- 2026-07-09 10:41:03+00 | PostgreSQL 15.6 on x86_64-pc-linux-gnu...`,
          pitfalls: [
            '**Editing data only through Table Editor and never learning SQL Editor.** Fine for toy apps, but every RLS policy, trigger, and function in Module 3 requires SQL. Fix: get comfortable with SQL Editor early.',
            '**Ignoring the auto-generated API docs.** They update live as your schema changes and show the *exact* Dart call shape for your actual tables — more reliable than guessing from memory.',
            '**Not realising Table Editor changes are real, immediate, production writes.** There is no "draft mode" — a column you drop there is gone. Fix: treat the dashboard with the same care as a deploy.',
            '**Confusing the SQL Editor\'s query history with version-controlled migrations.** History is a personal scratchpad, not a migration system. Fix: from Module 3 onward, keep schema SQL in versioned `.sql` files in your repo too.',
          ],
          tryIt:
            'In SQL Editor, run `select current_database(), current_user;` and note the output — you will recognise this exact console when you write LocalInsta\'s schema in Module 3.',
          takeaway: 'Table Editor for quick looks, SQL Editor for everything that matters — both point at the same real, live database.',
        },
        {
          id: 'm1-t3',
          title: 'Project URL, anon key & service_role key — what is safe to ship',
          explain:
            'The anon (public) key is meant to ship inside your Flutter app; the service_role key must never leave your server — LocalInsta never uses it at all.',
          analogy:
            'The anon key is like a shop\'s public storefront key that only opens the display window — safe to hand to any visitor, because the real safe (Row Level Security policies) still guards the valuables behind it. The service_role key is the master key that bypasses every lock in the building — you would never staple that to a flyer and hand it out.',
          theory:
            'Every Supabase project exposes two keys under **Project Settings → Data API**: the **`anon` (public) key** and the **`service_role` key**. The anon key identifies requests as "an anonymous or logged-in app user" and is **designed to be embedded in client apps** — it is not a secret in the traditional sense, because **Row Level Security (RLS) policies**, which you write starting Module 3, are what actually decide what any given request can read or write, regardless of which key it used.\n\nThe `service_role` key **bypasses RLS entirely** — it is meant only for trusted server-side code (an Edge Function, a backend you control), never for a mobile app binary that a user could decompile. LocalInsta, being client-only, **never uses the service_role key anywhere** — every single read and write goes through the anon key plus RLS. This single fact is why Module 3\'s RLS work is not optional homework — it is the entire security model.',
          whyItMatters:
            'Confusing these two keys is the #1 real-world Supabase security incident — shipping the service_role key inside an app APK means anyone can extract it and read/write your entire database with zero restrictions. Understanding this distinction now is what makes Module 3\'s RLS module click instead of feeling like an arbitrary chore.',
          steps: [
            'Open **Project Settings → Data API**.',
            'Copy the **Project URL** (`https://<ref>.supabase.co`).',
            'Copy the **anon / public key** — this is the one Flutter will use.',
            'Note the **service_role / secret key** exists — do not copy it anywhere near the Flutter project.',
            'Confirm in your head: "anon key + no RLS policy yet = a table that is either fully open or fully closed by default" — Supabase tables default to **RLS-enabled-but-no-policies**, which means fully closed until you write a policy.',
          ],
          code: `-- Confirm a brand-new table starts fully locked down (no policies yet):
create table if not exists public.scratch_test (id uuid default gen_random_uuid() primary key);
alter table public.scratch_test enable row level security;
-- No policies written yet -> every single request, even with the anon key,
-- is denied by default. This is the safe default LocalInsta relies on.`,
          pitfalls: [
            '**Committing the service_role key to a Flutter repo "just to test something quickly".** Even in a private repo, this is the exact mistake that leads to a fully compromised database. Fix: it never leaves the Supabase dashboard / trusted server code.',
            '**Assuming the anon key alone is enough protection.** It identifies the *type* of caller, not what they are allowed to do — RLS policies (Module 3) are what actually enforce access. Fix: never ship a table with RLS disabled "temporarily".',
            '**Disabling RLS on a table "to make the app work faster during development".** This is the single most common way a Supabase app ships wide open. Fix: keep RLS on always; write permissive-but-correct policies instead of turning it off.',
            '**Hardcoding the anon key directly in a committed `main.dart`.** Not a security disaster (it is meant to be public) but still bad practice — rotating it later means hunting through git history. Fix: the next topic shows the `--dart-define` pattern.',
          ],
          tryIt:
            'Run the `scratch_test` table snippet above in SQL Editor, then try `select * from public.scratch_test;` from the same SQL Editor (which uses elevated dashboard access) versus imagining the same query from an anon-key client — internalise that the two see different worlds.',
          takeaway: 'The anon key is meant to be public; RLS policies are the actual lock — LocalInsta never touches the service_role key at all.',
        },
      ],
    },
    {
      id: 'm1-s2',
      title: 'Flutter scaffold + supabase_flutter',
      topics: [
        {
          id: 'm1-t4',
          title: 'pubspec.yaml — every LocalInsta package explained',
          explain:
            'One dependency block, all free, all zero-cost — supabase_flutter plus the image, state, and utility packages LocalInsta needs end to end.',
          analogy:
            'A tiffin-centre owner does not buy every kitchen gadget on day one — they stock exactly what the day\'s menu needs: a dosa tawa, a filter for coffee, a specific ladle for sambar. `pubspec.yaml` is that stocked kitchen for LocalInsta — each package earns its place for a specific, named job later in the course.',
          theory:
            'Every package below is free and open-source (pub.dev, MIT/BSD-licensed) — none of them require any paid tier: `supabase_flutter` (the official Dart client — Auth, Postgres queries, Storage, Realtime, all in one), `image_picker` (camera/gallery access, Module 4), `image_cropper` (square crop like Instagram, Module 4), `cached_network_image` (disk+memory image caching so the feed does not re-download every scroll, Module 4-5), `provider` (the ChangeNotifier plumbing from Module 0, wiring every repository, Module 2 onward), `google_fonts` (typography), `timeago` (human-friendly "2h ago" timestamps), `uuid` (client-generated ids where useful), `share_plus` (native share sheet for posts), `shimmer` (skeleton loading placeholders), `flutter_svg` (the LocalInsta logo/icons), `connectivity_plus` (offline detection for friendly error states).\n\n`pubspec.yaml` pins **version ranges** with `^` (caret syntax) — `^2.3.4` means "2.3.4 or newer, but below 3.0.0". Run `flutter pub get` after any edit to resolve and download.',
          whyItMatters:
            'A real Flutter job will hand you a `pubspec.yaml` with forty packages and expect you to know roughly what each one is for within a day of onboarding. Learning to read a dependency list as "a stocked kitchen for known dishes" rather than a wall of noise is a genuine professional skill.',
          steps: [
            'Open `pubspec.yaml` in the `localinsta` project from Module 0.',
            'Add every package below under `dependencies:`.',
            'Run `flutter pub get` and confirm no version conflicts.',
            'Open `pubspec.lock` once and note it pins **exact** resolved versions — this file gets committed to git, unlike `.env`.',
          ],
          code: `# pubspec.yaml (dependencies block)
dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^2.5.6
  image_picker: ^1.1.2
  image_cropper: ^8.0.2
  cached_network_image: ^3.4.1
  provider: ^6.1.2
  google_fonts: ^6.2.1
  timeago: ^3.7.0
  uuid: ^4.5.1
  share_plus: ^10.1.2
  shimmer: ^3.0.0
  flutter_svg: ^2.0.10+1
  connectivity_plus: ^6.1.0
  cupertino_icons: ^1.0.8

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0`,
          pitfalls: [
            '**Adding a package you do not yet use "just in case".** Bloats build time and app size for no benefit. Fix: add a package the same topic you first use it.',
            '**Pinning exact versions with `=2.3.4` everywhere.** Blocks you from getting compatible bugfixes. Fix: use caret (`^`) ranges unless you have a specific reason to pin.',
            '**Forgetting `flutter pub get` after editing `pubspec.yaml`.** Imports fail with "package not found" even though the line is right there. Fix: always re-run after any dependency edit; most editors also do this automatically on save.',
            '**Committing `pubspec.lock` inconsistently across a team.** Different teammates resolve slightly different transitive versions. Fix: always commit `pubspec.lock` for an app (not a library) so everyone builds identical dependency versions.',
          ],
          tryIt:
            'Add all the packages above, run `flutter pub get`, then run `flutter pub outdated` once just to see the report format — you will use this command periodically to keep the app\'s dependencies healthy.',
          takeaway: 'Every LocalInsta package is free and pinned by caret range — add a package the moment you actually need it, not before.',
        },
        {
          id: 'm1-t5',
          title: 'Never hardcode secrets: --dart-define & compile-time config',
          explain:
            'The Supabase URL and anon key are read via `String.fromEnvironment` at compile time, passed with `--dart-define`, and never committed as literal strings.',
          analogy:
            'A shop does not paint its safe combination on the front window — the combination is written on a card kept in the manager\'s pocket, handed over at opening time each morning. `--dart-define` is that card: the secret is supplied at build time, never baked permanently into the source file anyone can read on GitHub.',
          theory:
            'Dart supports **compile-time environment variables** via `--dart-define=KEY=value`, read in code with `String.fromEnvironment(\'KEY\')`. This keeps the actual URL/key values out of your committed `.dart` files entirely — the source only ever contains the *name* of the variable, never its value.\n\nFor local development, a small helper script or a `.vscode/launch.json` entry with `"args": ["--dart-define=SUPABASE_URL=...", "--dart-define=SUPABASE_ANON_KEY=..."]` keeps you from retyping long flags. **Both files that would contain the real values — the launch config and any `.env`-style file — go straight into `.gitignore`.** The anon key is not catastrophic if leaked (RLS is the real guard, per the previous topic), but treating it as a secret from day one builds the habit you need for every other credential in your career.',
          whyItMatters:
            'This exact pattern — compile-time config, gitignored local secrets — is what every production mobile app does for API keys, and it is one of the first things a code reviewer checks for in a pull request.',
          steps: [
            'Create `lib/core/env.dart` exposing `Env.supabaseUrl` and `Env.supabaseAnonKey` via `String.fromEnvironment`.',
            'Create `.vscode/launch.json` (or a `run.sh` / `run.ps1` script) passing both values via `--dart-define`.',
            'Add `.vscode/launch.json` and any `.env` file to `.gitignore`.',
            'Run `flutter run --dart-define=SUPABASE_URL=https://xxxx.supabase.co --dart-define=SUPABASE_ANON_KEY=eyJ...` once from the terminal to confirm the flags work.',
            'Confirm `git status` shows no secret-bearing files as trackable.',
          ],
          code: `// lib/core/env.dart
class Env {
  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: '',
  );
  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: '',
  );

  static void assertConfigured() {
    if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
      throw StateError(
        'Missing --dart-define SUPABASE_URL / SUPABASE_ANON_KEY. '
        'Run via the VS Code launch config or pass both flags manually.',
      );
    }
  }
}

// .vscode/launch.json (gitignored)
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "localinsta (dev)",
      "request": "launch",
      "type": "dart",
      "args": [
        "--dart-define=SUPABASE_URL=https://your-ref.supabase.co",
        "--dart-define=SUPABASE_ANON_KEY=your-anon-key-here"
      ]
    }
  ]
}

# .gitignore additions
.vscode/launch.json
*.env`,
          pitfalls: [
            '**Writing `const url = \'https://xxxx.supabase.co\';` directly in `main.dart`.** Works, but now it is permanently in git history even if you delete it later. Fix: always route secrets through `String.fromEnvironment`.',
            '**Forgetting `--dart-define` flags when building a release APK.** The app compiles but crashes on `Env.assertConfigured()` at startup. Fix: your release build command (Module 9) must pass the same flags.',
            '**Committing `launch.json` by accident because it "looked like config, not a secret".** Fix: gitignore it explicitly and keep a `launch.json.example` with placeholder values checked in instead.',
            '**Using `Platform.environment` instead of `String.fromEnvironment`.** Reads OS environment variables at *runtime*, which does not exist the same way on a compiled mobile app. Fix: `String.fromEnvironment` is resolved at *compile* time — the correct tool for Flutter.',
          ],
          tryIt:
            'Wire `Env.assertConfigured()` to run first thing in `main()`, then deliberately run `flutter run` with no `--dart-define` flags and confirm you get a clear, friendly `StateError` instead of a confusing crash three screens later.',
          takeaway: 'Secrets are supplied at build time via --dart-define, read via String.fromEnvironment, never typed as a literal into a committed file.',
        },
        {
          id: 'm1-t6',
          title: 'Supabase.initialize() and the global client singleton',
          explain:
            'One call in `main()` bootstraps the Supabase client; `Supabase.instance.client` is your single, app-wide handle to Auth, Postgres, Storage, and Realtime.',
          analogy:
            'A restaurant plugs in its billing machine once at opening time — after that, every counter in the building uses the same machine, not five separate ones with five separate ledgers. `Supabase.initialize()` is that one plug-in; `Supabase.instance.client` is the one machine every screen in LocalInsta shares.',
          theory:
            '`await Supabase.initialize(url: Env.supabaseUrl, anonKey: Env.supabaseAnonKey)` must run **before** `runApp()`, and needs `WidgetsFlutterBinding.ensureInitialized()` called first since it touches platform channels before the widget tree exists. After that single call, `Supabase.instance.client` is a ready-to-use singleton anywhere in your code — `.auth` for authentication, `.from(\'table\')` for Postgres queries, `.storage` for file buckets, `.channel(...)` for Realtime.\n\nThis mirrors exactly the `Firebase.initializeApp()` pattern from the billing/resort courses in this portfolio — same shape, different vendor. A short top-level helper, `final supabase = Supabase.instance.client;`, is a common convenience so you are not typing the full path in every repository file.',
          whyItMatters:
            'Every single Supabase call anywhere in LocalInsta — auth, feed, likes, chat — routes through this one client. Getting initialization order right here is what stops the entire app from crashing at startup with "Supabase has not been initialized".',
          steps: [
            'In `main.dart`, call `WidgetsFlutterBinding.ensureInitialized();` first.',
            'Call `Env.assertConfigured();` to fail fast on missing config.',
            'Await `Supabase.initialize(url: ..., anonKey: ...)`.',
            'Only then call `runApp(const LocalInstaApp());`.',
            'Create `lib/core/supabase_client.dart` exporting `final supabase = Supabase.instance.client;` for convenient imports.',
          ],
          code: `// lib/main.dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/env.dart';
import 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  Env.assertConfigured();

  await Supabase.initialize(
    url: Env.supabaseUrl,
    anonKey: Env.supabaseAnonKey,
  );

  runApp(const LocalInstaApp());
}

// lib/core/supabase_client.dart
import 'package:supabase_flutter/supabase_flutter.dart';

final supabase = Supabase.instance.client;

// usage anywhere else in the app
// final rows = await supabase.from('posts').select();`,
          pitfalls: [
            '**Calling `Supabase.instance.client` before `Supabase.initialize()` finishes.** Throws immediately. Fix: always `await` initialize before `runApp`.',
            '**Forgetting `WidgetsFlutterBinding.ensureInitialized()`.** Platform channel calls inside `initialize()` fail with an obscure binding error. Fix: it is always the very first line of `main()`.',
            '**Re-calling `Supabase.initialize()` more than once (e.g. in a test harness or hot-restart edge case).** Throws "already initialized". Fix: initialize exactly once, guard test setups accordingly.',
            '**Creating multiple `SupabaseClient` instances by hand instead of using the singleton.** Splits your auth session state across two clients. Fix: always go through `Supabase.instance.client`.',
          ],
          tryIt:
            'Wire this up, run the app, and add a temporary `print(supabase.auth.currentSession)` in a button — it should print `null` (no one is signed in yet) without throwing, proving the client is alive and ready for Module 2.',
          takeaway: 'One `Supabase.initialize()` before `runApp`, one shared client after — every screen in LocalInsta reads from the same source of truth.',
        },
        {
          id: 'm1-t7',
          title: 'Folder architecture: features, core & shared',
          explain:
            'A feature-first folder structure — `features/auth`, `features/feed`, `features/profile`, `features/stories`, `features/chat`, `features/notifications` — keeps LocalInsta navigable as it grows across ten modules.',
          analogy:
            'A well-run kitchen keeps ingredients organised by dish station, not by alphabet — the tandoor station has its own spices, tools, and prep counter, separate from the dessert station. Feature-first folders do the same for LocalInsta: everything the feed needs lives together, everything chat needs lives together, and `core/` holds the shared plumbing every station uses (the gas line, the water supply).',
          theory:
            'A **feature-first** layout groups files by what they do for the user, not by their technical type: `features/feed/` holds the feed screen, the post-card widget, and the feed repository together, instead of scattering them into a global `screens/`, `widgets/`, `repositories/` split. This scales far better than a **layer-first** layout once an app has real breadth — you can open one folder and see everything one feature needs.\n\n`lib/core/` holds cross-cutting plumbing shared by every feature: `env.dart`, `supabase_client.dart`, `theme.dart`, `router.dart`. `lib/shared/` (or `lib/widgets/`) holds small, genuinely reusable UI atoms with no feature-specific knowledge — a generic `LoadingSpinner`, an `ErrorBanner`, an `AvatarCircle`. The rule of thumb: if a widget only makes sense inside one feature, it lives in that feature\'s folder; if three unrelated features would each want it, it moves to `shared/`.',
          whyItMatters:
            'This exact structure is what you will see in almost every mid-to-large production Flutter codebase, and it is what makes a ten-module, multi-thousand-line app like LocalInsta stay comprehensible instead of turning into a junk drawer.',
          steps: [
            'Create `lib/core/` with `env.dart`, `supabase_client.dart` (already written), plus empty `theme.dart` and `router.dart` placeholders.',
            'Create `lib/shared/widgets/` for cross-feature UI atoms.',
            'Create empty `lib/features/auth/`, `lib/features/feed/`, `lib/features/profile/`, `lib/features/stories/`, `lib/features/chat/`, `lib/features/notifications/` folders.',
            'Inside each feature folder, plan (do not build yet) three sub-folders: `data/` (models + repository), `state/` (ChangeNotifier), `presentation/` (screens + widgets).',
            'Delete the default `lib/main.dart` counter demo boilerplate now that its job (proving the scaffold worked) is done.',
          ],
          code: `lib/
  main.dart
  app.dart                     # MaterialApp + theme + routing shell
  core/
    env.dart
    supabase_client.dart
    theme.dart
    router.dart
  shared/
    widgets/
      loading_spinner.dart
      error_banner.dart
      avatar_circle.dart
  features/
    auth/
      data/                    # AuthRepository, session models
      state/                   # SessionState (ChangeNotifier)
      presentation/            # login_screen.dart, signup_screen.dart
    feed/
      data/                    # Post model, FeedRepository
      state/                   # FeedState
      presentation/            # feed_screen.dart, post_card.dart
    profile/
    stories/
    chat/
    notifications/`,
          pitfalls: [
            '**Mixing feature-first and layer-first halfway through.** Half the app in `screens/`, half in `features/*/presentation/` — nobody can find anything. Fix: commit to feature-first from this module onward.',
            '**Putting a genuinely shared widget inside one feature folder "because that is where it was first needed".** Other features end up importing across feature boundaries, creating tangled dependencies. Fix: promote it to `shared/` the moment a second feature needs it.',
            '**Creating deeply nested folders for a two-file feature.** Over-engineering a `stories/data/models/entities/` chain for what is currently one model class. Fix: start flat within a feature, split into sub-folders only once a folder actually gets crowded.',
            '**Leaving the demo counter app\'s leftover files around "just in case".** Dead code confuses anyone new to the repo, including future-you. Fix: delete `lib/main.dart`\'s demo content once its scaffold job is done.',
          ],
          tryIt:
            'Create the full folder tree above (empty folders are fine — Flutter/git do not track truly empty directories, so drop a one-line `// TODO` file in each if you want them to show up in git). You will fill `features/auth/` completely in Module 2.',
          takeaway: 'Group by feature, not by file type — a folder you open should show you everything one part of LocalInsta needs, nothing more.',
        },
      ],
    },
    {
      id: 'm1-s3',
      title: 'Project polish & tooling',
      topics: [
        {
          id: 'm1-t8',
          title: 'Lint rules & consistent formatting',
          explain:
            '`flutter_lints` plus `dart format` keep LocalInsta\'s code consistent from the very first commit, across every module and every future contributor.',
          analogy:
            'A shared recipe book only works if everyone measures a "cup" the same way — the lint rules are that shared measurement standard, so code written in Module 1 still reads naturally next to code written in Module 9.',
          theory:
            '`flutter_lints` (already added to `dev_dependencies` in an earlier topic) ships a curated set of Dart/Flutter static-analysis rules — unused imports, missing `const`, prefer-final-fields, and more — enforced via `analysis_options.yaml`. VS Code\'s Dart extension surfaces these as live squiggly warnings as you type.\n\n`dart format .` auto-formats every `.dart` file to a single, consistent style (2-space indent, trailing commas, line-wrapping rules) — no more bikeshedding over spacing in code review. Run it before every commit; many teams wire it into a pre-commit hook so it is never optional.',
          whyItMatters:
            'Every real Flutter team runs lints and formatting in CI — a pull request that fails `dart analyze` or `dart format --set-exit-if-changed` does not get merged. Building this habit on a solo project now means it is automatic on a team project later.',
          steps: [
            'Confirm `analysis_options.yaml` exists with `include: package:flutter_lints/flutter.yaml`.',
            'Run `dart analyze` from the project root and read every warning.',
            'Fix warnings one at a time — do not mass-ignore them.',
            'Run `dart format .` and note every file it touches.',
            'Optionally add a couple of stricter rules under a `linter: rules:` block (e.g. `prefer_single_quotes`).',
          ],
          code: `# analysis_options.yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    prefer_single_quotes: true
    prefer_const_constructors: true
    avoid_print: false  # fine for a learning project; tighten for production

# Run before every commit
$ dart analyze
$ dart format .`,
          pitfalls: [
            '**Silencing a lint with `// ignore:` instead of fixing the underlying issue.** Hides real bugs (like a genuinely unused import that signals dead code). Fix: fix the root cause; reserve `ignore:` for rare, deliberate exceptions with a comment explaining why.',
            '**Running `dart format` on files with unrelated changes mixed in.** Creates a noisy diff that hides your real edit. Fix: format on save in your editor so formatting never becomes a separate, sprawling commit.',
            '**Never running `dart analyze` until the app already has 40 files.** A wall of warnings appears at once, overwhelming. Fix: run it from day one, keep the count at zero as you go.',
            '**Assuming lints catch logic bugs.** They catch style and common-mistake patterns, not "your RLS policy is wrong". Fix: treat lints as a floor, not a substitute for actually understanding the code (Modules 2-9).',
          ],
          tryIt:
            'Deliberately write a throwaway function with an unused variable and a missing `const`, run `dart analyze`, read the exact warning text, then fix it and re-run to confirm zero issues.',
          takeaway: 'Lint + format from commit one — a consistent codebase is cheap to maintain and expensive to retrofit.',
        },
        {
          id: 'm1-t9',
          title: 'App icon & splash screen — first brand touch',
          explain:
            '`flutter_launcher_icons` and `flutter_native_splash` turn LocalInsta from "a Flutter demo" into something that looks like a real installed app from the very first launch.',
          analogy:
            'A catering van without a signboard could be anyone\'s van — the LocalInsta launcher icon and splash screen are the signboard and the gate decoration: the first thing anyone sees, and the thing that makes it feel like a real business, not a work-in-progress.',
          theory:
            '`flutter_launcher_icons` (a dev-only build tool, not a runtime dependency) reads a single source PNG and generates every density-specific Android launcher icon (`mipmap-hdpi` through `xxxhdpi`) plus the **adaptive icon** foreground/background split Android expects. `flutter_native_splash` similarly generates the native splash screen shown for the brief moment between tapping the icon and Flutter\'s first frame rendering — critical because Flutter itself cannot draw anything until its engine has booted.\n\nBoth are configured entirely in `pubspec.yaml` under their own top-level keys, then triggered by a one-off `dart run` command — they are **build-time generators**, not something you import in Dart code.',
          whyItMatters:
            'A missing or default Flutter icon is one of the fastest tells that an app is unfinished — reviewers, testers, and the App/Play Store review process all judge a listing partly on this first impression.',
          steps: [
            'Add `flutter_launcher_icons: ^0.14.1` and `flutter_native_splash: ^2.4.1` under `dev_dependencies`.',
            'Add an `assets/icon/localinsta_icon.png` (1024×1024, the brand orange from Module 0\'s theme) and an `assets/splash/localinsta_logo.png`.',
            'Configure `flutter_launcher_icons:` in `pubspec.yaml` pointing at the icon PNG, with `adaptive_icon_background` set to the brand orange hex.',
            'Configure `flutter_native_splash:` with a plain background colour and the logo centred.',
            'Run `dart run flutter_launcher_icons` then `dart run flutter_native_splash:create`.',
            'Full-restart the app on a device (not hot reload — icons/splash are native assets) and confirm both show up.',
          ],
          code: `# pubspec.yaml additions
flutter_launcher_icons:
  android: true
  ios: false
  image_path: "assets/icon/localinsta_icon.png"
  adaptive_icon_background: "#E85A2A"
  adaptive_icon_foreground: "assets/icon/localinsta_icon.png"

flutter_native_splash:
  color: "#FFFFFF"
  image: "assets/splash/localinsta_logo.png"
  android_12:
    color: "#FFFFFF"
    image: "assets/splash/localinsta_logo.png"

# Generate both (run after every icon/splash asset change)
$ dart run flutter_launcher_icons
$ dart run flutter_native_splash:create`,
          pitfalls: [
            '**Using a low-resolution source PNG.** Icons look blurry on high-density screens. Fix: start from a genuine 1024×1024 (or larger) source image.',
            '**Expecting hot reload to show the new icon.** Native assets require a full rebuild/reinstall. Fix: uninstall the old debug app or do a full `flutter run` (not hot reload/restart).',
            '**Forgetting `adaptive_icon_background`.** Android 8+ adaptive icons render with a transparent or wrong background, looking broken on some launchers. Fix: always set an explicit background colour matching the brand.',
            '**A splash image with a transparent background on a coloured splash.** Looks fine in testing, inconsistent across OEM skins. Fix: test on more than one device/emulator skin if possible.',
          ],
          tryIt:
            'Generate both, fully reinstall the app, and confirm: the launcher icon on the home screen is the LocalInsta mark (not the Flutter default), and there is a branded splash between tap and first frame.',
          takeaway: 'A branded icon and splash are cheap, build-time wins that make LocalInsta look shipped from the very first run.',
        },
        {
          id: 'm1-t10',
          title: 'Git, GitHub & .gitignore for a Flutter + Supabase repo',
          explain:
            'Initialize git, push to GitHub, and get `.gitignore` right the first time — secrets, build output, and IDE clutter never belong in the repo.',
          analogy:
            'A caterer\'s recipe notebook is shared freely with the next cook — but the safe combination and the day\'s cash tally are kept in a separate, private drawer. Your git repo is the recipe notebook; `.gitignore` is what keeps the safe combination (secrets) and today\'s clutter (build artifacts) out of it.',
          theory:
            '`flutter create` already generates a solid baseline `.gitignore` (covering `build/`, `.dart_tool/`, platform-specific caches). You extend it with the LocalInsta-specific exclusions from earlier topics: `.vscode/launch.json` (holds the Supabase URL/anon key locally), any `.env` file, and later the Android signing `key.properties`/`*.jks` files from Module 9.\n\n`pubspec.lock` is the one "generated-looking" file you **do** commit for an app (not a library) — it pins exact dependency versions so every clone builds identically. A clean first commit, a `README.md` describing the project, and a sensible default branch name (`main`) round out a repo that looks professional from commit one.',
          whyItMatters:
            'A leaked API key or keystore in git history is one of the most common real-world security incidents — and once something is pushed to a public GitHub repo, treat it as compromised forever, even if you delete it in a later commit. Getting `.gitignore` right *before* the first commit is far cheaper than scrubbing history after.',
          steps: [
            'Run `git init` inside the `localinsta` project (if not already done by `flutter create`).',
            'Open the generated `.gitignore` and append `.vscode/launch.json`, `*.env`, `android/key.properties`, `*.jks`.',
            'Run `git status` and sanity-check nothing secret-looking appears as untracked-and-about-to-be-added.',
            'Create a `README.md` with a one-paragraph project description and the exact `--dart-define` run command (with placeholder values).',
            'Create a GitHub repo, `git remote add origin ...`, and push the first commit.',
          ],
          code: `# .gitignore additions (append to the flutter create default)
.vscode/launch.json
*.env
android/key.properties
*.jks
*.keystore

# First commit
$ git init
$ git add .
$ git status   # <- read this output carefully before committing
$ git commit -m "Initial LocalInsta scaffold: Flutter + Supabase, no secrets committed"
$ git branch -M main
$ git remote add origin https://github.com/<you>/localinsta.git
$ git push -u origin main`,
          pitfalls: [
            '**Running `git add .` without reading `git status` first, ever.** The single most common way a secret ends up in a commit. Fix: always read the file list before every `git add`/`git commit` of a broad path.',
            '**Adding `.gitignore` rules *after* a secret was already committed.** The file is still in history and recoverable. Fix: gitignore comes before the first commit that would include the secret; if one already leaked, rotate the credential, do not just delete the file.',
            '**Committing `build/` or `.dart_tool/`.** Bloats the repo with regenerable junk. Fix: trust the default Flutter `.gitignore` for these — do not remove those lines.',
            '**No README at all.** Six months from now, even you will forget the exact run command. Fix: always document the `--dart-define` invocation in the README, with placeholder (not real) values.',
          ],
          tryIt:
            'Push your current LocalInsta scaffold to a real GitHub repo, then clone it fresh into a different folder and confirm `flutter pub get` plus the documented `--dart-define` run command gets a stranger (future-you) running the app with zero guesswork.',
          takeaway: 'Get .gitignore right before the first commit — a secret in git history is a secret that must be rotated, not just deleted.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm1-p1',
      type: 'Mini Project',
      title: 'A Fully Wired, Secret-Free LocalInsta Scaffold',
      domain: 'Flutter + Supabase Setup',
      duration: '2 hours',
      description:
        'Stand up the real Supabase project, wire supabase_flutter through compile-time config, lay out the feature-first folder tree, and push a clean first commit — the foundation every later module builds directly on top of.',
      tools: ['Flutter', 'supabase_flutter', 'Supabase', 'Git'],
      blueprint: {
        overview:
          'A runnable Flutter app that successfully calls Supabase.initialize() using --dart-define config, prints a non-throwing null session to prove the client is alive, follows the feature-first folder layout, has branded icon/splash, and is pushed to a clean GitHub repo with zero secrets in history.',
        functionalRequirements: [
          '**Supabase project.** A real, free-tier `localinsta` project in `ap-south-1`, confirmed reachable from SQL Editor.',
          '**Config.** `Env` class reading `SUPABASE_URL`/`SUPABASE_ANON_KEY` via `String.fromEnvironment`, asserted non-empty at startup.',
          '**Client.** `Supabase.initialize()` called before `runApp`, a shared `supabase` client export.',
          '**Structure.** Feature-first folders (`core/`, `shared/`, `features/{auth,feed,profile,stories,chat,notifications}/`).',
          '**Branding.** Generated launcher icon + splash screen in the LocalInsta brand colour.',
          '**Repo.** Clean git history, correct `.gitignore`, pushed to GitHub, README with placeholder run instructions.',
        ],
        technicalImplementation: [
          '**lib/core/env.dart.** Compile-time config reader with a friendly startup assertion.',
          '**lib/core/supabase_client.dart.** Singleton client export.',
          '**lib/main.dart.** Correct initialization order: binding → env assert → Supabase.initialize → runApp.',
          '**pubspec.yaml.** Every package from this module, plus launcher-icon/splash generator config.',
          '**.gitignore.** Secrets and native signing files excluded before the first commit.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Compile-time config + client singleton',
            outcome: 'Env and supabase_client wired, main.dart initializes in the right order.',
            prompt:
              'Create lib/core/env.dart with an Env class reading SUPABASE_URL and SUPABASE_ANON_KEY via String.fromEnvironment and an assertConfigured() that throws a friendly StateError if either is empty. Create lib/core/supabase_client.dart exporting a top-level `final supabase = Supabase.instance.client;`. Rewrite lib/main.dart to call WidgetsFlutterBinding.ensureInitialized(), Env.assertConfigured(), await Supabase.initialize(url: Env.supabaseUrl, anonKey: Env.supabaseAnonKey), then runApp(const LocalInstaApp()).',
          },
          {
            step: 2,
            label: 'Feature-first folder scaffold',
            outcome: 'Every feature folder exists with a placeholder file so git tracks it.',
            prompt:
              'Create the folder tree lib/core/{theme.dart,router.dart}, lib/shared/widgets/{loading_spinner.dart,error_banner.dart,avatar_circle.dart} (each a minimal placeholder StatelessWidget), and lib/features/{auth,feed,profile,stories,chat,notifications}/{data,state,presentation}/ with a one-line `// TODO: Module N` comment file in each empty leaf folder so git tracks the structure.',
          },
          {
            step: 3,
            label: 'pubspec.yaml — full dependency + branding setup',
            outcome: 'Every package installed, launcher icon and splash generated.',
            prompt:
              'Add every dependency from this module to pubspec.yaml (supabase_flutter, image_picker, image_cropper, cached_network_image, provider, google_fonts, timeago, uuid, share_plus, shimmer, flutter_svg, connectivity_plus, cupertino_icons) plus dev dependencies flutter_lints, flutter_launcher_icons, flutter_native_splash. Configure flutter_launcher_icons and flutter_native_splash pointing at placeholder brand-orange (#E85A2A) square PNGs under assets/icon and assets/splash. Run flutter pub get, dart run flutter_launcher_icons, and dart run flutter_native_splash:create, and report the result.',
          },
          {
            step: 4,
            label: 'Lints, .gitignore & first commit',
            outcome: 'Zero analyzer warnings, no secrets trackable, first commit pushed.',
            prompt:
              'Add analysis_options.yaml including package:flutter_lints/flutter.yaml with prefer_single_quotes and prefer_const_constructors enabled. Run dart analyze and fix every warning. Extend .gitignore with .vscode/launch.json, *.env, android/key.properties, *.jks, *.keystore. Write a README.md describing LocalInsta and the exact --dart-define run command with placeholder values. Run git status, confirm nothing secret-looking is staged, then report the exact commands to init, commit, and push to a new GitHub repo (do not actually push without my go-ahead).',
          },
        ],
        deliverable:
          'A cloneable LocalInsta repo that a stranger could `git clone`, `flutter pub get`, plug in their own Supabase URL/anon key via --dart-define, and get a running (currently blank-screen) app with zero secrets anywhere in git history.',
      },
    },
  ],
  quiz: [
    {
      id: 'm1-q1',
      q: 'Why can LocalInsta genuinely promise "no card required" while Firebase-based courses in this portfolio cannot make the same promise for Storage?',
      options: [
        'Supabase\'s free tier includes real file Storage with no billing account required; new Firebase Storage buckets now require the paid Blaze plan',
        'Firebase is more expensive than Supabase in every case',
        'Supabase does not offer a database, only storage',
        'Firebase requires a card for Auth, Supabase does not',
      ],
      answer: 0,
    },
    {
      id: 'm1-q2',
      q: 'What is the anon (public) Supabase key actually meant to be used for?',
      options: [
        'Embedding in the client app — it identifies the caller, while Row Level Security policies decide what they can actually do',
        'Bypassing all database security for admin tasks',
        'It should never be shipped anywhere, including the app',
        'Authenticating server-to-server calls only',
      ],
      answer: 0,
    },
    {
      id: 'm1-q3',
      q: 'Why does LocalInsta read the Supabase URL and anon key via `String.fromEnvironment` and `--dart-define` instead of hardcoding them in main.dart?',
      options: [
        'To keep the literal values out of committed source files and git history, following secret-hygiene best practice',
        'Because hardcoded strings are not allowed by the Dart compiler',
        'Because it makes the app run faster',
        'Because Supabase requires environment variables specifically',
      ],
      answer: 0,
    },
    {
      id: 'm1-q4',
      q: 'What must happen before `Supabase.instance.client` can be safely used anywhere in the app?',
      options: [
        '`await Supabase.initialize(...)` must complete, after `WidgetsFlutterBinding.ensureInitialized()`, before `runApp()`',
        'Nothing — the client works immediately with no setup',
        'The user must be signed in first',
        'A Postgres table must already exist',
      ],
      answer: 0,
    },
    {
      id: 'm1-q5',
      q: 'What happens to a free Supabase project after 7 days with no API activity?',
      options: [
        'It automatically pauses and can be restored with one click in the dashboard — no data loss',
        'It is permanently deleted with no recovery',
        'It automatically upgrades to a paid plan',
        'Nothing changes; free projects never pause',
      ],
      answer: 0,
    },
    {
      id: 'm1-q6',
      q: 'Why does LocalInsta use a feature-first folder structure (features/feed/, features/chat/, ...) instead of a layer-first one (screens/, widgets/, repositories/)?',
      options: [
        'It keeps everything one feature needs together, staying navigable as the app grows across many modules',
        'Flutter requires feature-first structure to compile',
        'Layer-first structures cannot use Provider',
        'It reduces the number of files needed',
      ],
      answer: 0,
    },
  ],
}
