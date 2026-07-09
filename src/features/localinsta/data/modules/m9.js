// Module 9 — Polish, Performance & Deployment (Capstone)
// LocalInsta (Flutter + Supabase) course content for the React course player.

export const m9 = {
  id: 'm9',
  title: 'Polish, Performance & Deployment',
  hours: 9,
  color: 'from-red-500/20 to-red-700/10',
  accent: 'red',
  description:
    'Wire a real dark-mode toggle, audit every loading/error/empty state and every query for N+1 and missing-index problems, run a final RLS security pass across the whole schema, ship a signed release APK, and close the course with an architecture walkthrough tying all nine modules together.',
  sections: [
    {
      id: 'm9-s1',
      title: 'Dark mode & UX polish',
      topics: [
        {
          id: 'm9-t1',
          title: 'A real, persisted dark-mode toggle',
          explain:
            'Module 0 built the theme data; this topic finally wires a user-facing toggle, persisted across app restarts via `shared_preferences`.',
          analogy:
            'A shop that installed dimmable lighting on day one, but never actually wired the switch to the wall — Module 0 installed the fixtures; this topic is finally wiring the switch, and remembering its last position the next time the shop opens.',
          theory:
            'A `ThemeState extends ChangeNotifier` holds a `ThemeMode` (`system`, `light`, or `dark`), read from and written to `shared_preferences` on every change, and provided at the app root alongside every other `ChangeNotifier` from earlier modules. `MaterialApp.themeMode` reads `context.watch<ThemeState>().mode` instead of the hardcoded `ThemeMode.system` from Module 0 — a one-line change, now that everything downstream already reads colours from `Theme.of(context)` rather than hardcoded values (Module 0\'s discipline, paying off here directly).\n\nA simple three-option picker (System / Light / Dark) on a Settings screen, or a quick toggle in the Profile screen\'s app bar, is enough — LocalInsta does not need anything more elaborate than persisting one enum value.',
          whyItMatters:
            'This topic is the direct, satisfying payoff of a discipline established all the way back in Module 0 — every screen already reads theme-aware colours, so adding a real toggle here is genuinely a small, low-risk change, not a scramble to retrofit hardcoded colours across dozens of files.',
          steps: [
            'Add `ThemeState extends ChangeNotifier` with a `ThemeMode mode` field, loaded from `shared_preferences` on construction.',
            'Add `setMode(ThemeMode mode)` persisting the choice and calling `notifyListeners()`.',
            'Provide it via `ChangeNotifierProvider` in `main.dart`, alongside the existing providers.',
            'Change `MaterialApp.themeMode` to read from `context.watch<ThemeState>().mode`.',
            'Add a three-option picker on a small Settings screen (or Profile app-bar action) calling `setMode`.',
            'Test: switch to Dark, fully close and reopen the app, confirm it remembers Dark — not just for the current session.',
          ],
          code: `class ThemeState extends ChangeNotifier {
  ThemeState() {
    _load();
  }

  ThemeMode mode = ThemeMode.system;

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('theme_mode');
    mode = switch (saved) {
      'light' => ThemeMode.light,
      'dark' => ThemeMode.dark,
      _ => ThemeMode.system,
    };
    notifyListeners();
  }

  Future<void> setMode(ThemeMode newMode) async {
    mode = newMode;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('theme_mode', newMode.name);
  }
}

// main.dart — added to the existing MultiProvider
ChangeNotifierProvider<ThemeState>(create: (_) => ThemeState()),

// app.dart
MaterialApp(
  theme: lightTheme,
  darkTheme: darkTheme,
  themeMode: context.watch<ThemeState>().mode, // was hardcoded ThemeMode.system
  home: const AuthGate(),
)`,
          pitfalls: [
            '**Discovering hardcoded `Colors.white`/`Colors.black` calls only now, at the end of the course.** If Module 0\'s discipline was skipped anywhere, this is where it surfaces as visibly broken dark-mode screens. Fix: do a deliberate visual pass through every screen in dark mode now, fixing any stragglers found.',
            '**Not persisting the choice, only holding it in memory for the current session.** Frustrating — the user picks Dark every single time they reopen the app. Fix: always persist via `shared_preferences`, exactly as shown.',
            '**Forgetting to `await` the `SharedPreferences.getInstance()` load before the first build, causing a visible flash of the wrong theme on cold start.** A brief, minor flash is generally acceptable and hard to fully eliminate without a native splash screen coordinating with it (Module 1\'s splash-screen topic) — worth being aware of, not necessarily worth over-engineering away for this course.',
            '**Adding theme-switching logic scattered across multiple places instead of one centralized `ThemeState`.** Fix: one provider, one source of truth, exactly like every other piece of app-wide state this course has built.',
          ],
          tryIt:
            'Switch through all three modes (System, Light, Dark), confirming each renders correctly across the feed, profile, and chat screens, then fully close and reopen the app after picking Dark and confirm it remembers your choice.',
          takeaway: 'Module 0\'s theme-aware-colours discipline is what makes this final wiring step small and safe — a real payoff for consistent early habits.',
        },
        {
          id: 'm9-t2',
          title: 'A full loading/error/empty state audit',
          explain:
            'A deliberate, screen-by-screen pass confirming every single async operation in LocalInsta has a genuine loading state, a genuine error state, and (where relevant) a genuine empty state — no exceptions.',
          analogy:
            'A restaurant\'s pre-opening walkthrough, checking that every single table has a menu, every light switch works, and every dish on the menu can actually be made with what is in the kitchen right now — not assuming everything is fine because it worked once during setup.',
          theory:
            'Module 0 taught the three-state discipline (loading/error/data) for `FutureBuilder`/`StreamBuilder`; Module 6 taught deliberate, specific empty-state copy. This topic is the **enforcement pass**: a literal checklist walk through every screen built across Modules 2-8 — sign-in/up, feed, create-post, post-detail/comments, profile, edit-profile, followers/following, search, explore, story capture/viewer, notifications, conversations list, chat — confirming each one genuinely handles all three states, not just the happy path exercised during development.\n\nA good habit for finding gaps: deliberately trigger each bad case once per screen — airplane mode mid-load, a brand-new empty account, a search with no matches — rather than trusting memory of "I think I handled that."',
          whyItMatters:
            'This is exactly the kind of unglamorous, systematic pass that separates a demo-quality project from one that would survive real users — and it is disproportionately valuable in a portfolio review, where a reviewer poking at edge cases is far more common than one just admiring the happy path.',
          steps: [
            'List every screen built across Modules 2-8 in a simple checklist (a markdown table in the README works well).',
            'For each, deliberately trigger: a loading state (throttle network or add an artificial delay temporarily), an error state (airplane mode), and an empty state (fresh test data) where applicable.',
            'Mark each cell pass/fail; fix any genuine gaps found.',
            'Re-run the full checklist once after fixes to confirm everything now passes.',
            'Keep the checklist in the README as a living reference for any future feature work.',
          ],
          code: `<!-- README.md — LocalInsta state-coverage checklist -->
| Screen              | Loading | Error | Empty |
|----------------------|---------|-------|-------|
| Sign in / Sign up    | ✅       | ✅     | n/a   |
| Feed                 | ✅       | ✅     | ✅     |
| Create post           | ✅       | ✅     | n/a   |
| Post detail / comments| ✅       | ✅     | ✅     |
| Profile (own/other)   | ✅       | ✅     | ✅     |
| Edit profile           | ✅       | ✅     | n/a   |
| Followers / Following | ✅       | ✅     | ✅     |
| Search                | ✅       | ✅     | ✅     |
| Explore               | ✅       | ✅     | ✅     |
| Story capture/viewer  | ✅       | ✅     | n/a   |
| Notifications          | ✅       | ✅     | ✅     |
| Conversations list    | ✅       | ✅     | ✅     |
| Chat screen            | ✅       | ✅     | ✅     |`,
          pitfalls: [
            '**Trusting "it worked when I built it" instead of deliberately re-testing each bad case now.** Development testing naturally over-indexes on the happy path; a dedicated audit pass is what catches the rest. Fix: literally trigger each bad case, do not rely on memory.',
            '**Skipping screens that "seem simple" (like Edit Profile).** Simple screens still make network calls, still can fail. Fix: apply the checklist uniformly, no screen is too small to skip.',
            '**Fixing a gap on one screen and not checking whether the identical pattern is duplicated (and equally broken) elsewhere.** Fix: when a genuine gap is found, search for the same missing pattern across other screens built with similar code.',
            '**Treating this as a one-time task instead of updating the checklist as new features are added later.** Fix: keep it in the README specifically so it stays a living reference, not a one-off exercise.',
          ],
          tryIt:
            'Actually build and walk this checklist against your real app right now, fixing anything genuinely missing — this is real, valuable work, not busywork, and the finished checklist belongs in your README.',
          takeaway: 'A deliberate, systematic audit — not memory of what you think you handled — is what actually confirms every screen\'s three states are real.',
        },
        {
          id: 'm9-t3',
          title: 'Accessibility basics',
          explain:
            'Semantic labels for icon-only buttons, sufficient colour contrast, and tap targets no smaller than 48x48 logical pixels — a focused, achievable accessibility pass, not an exhaustive audit.',
          analogy:
            'Adding a small ramp beside a shop\'s front steps costs little at construction time and makes the shop usable by far more of the community — accessibility work is exactly that kind of proportionate, worthwhile investment, not an all-or-nothing overhaul.',
          theory:
            'Every icon-only button (the "..." menu, the heart/comment icons, the send button) needs a `Semantics(label: \'...\')` wrapper or a `tooltip` so a screen-reader user knows what it does — `IconButton` already accepts a `tooltip` parameter directly, the easiest win in this whole topic. Flutter\'s `Theme.of(context).colorScheme` (Module 0) generally provides reasonable built-in contrast, but any custom-coloured text (LocalInsta\'s brand orange on white, for instance) should be checked against a 4.5:1 contrast ratio for body text. Tap targets — buttons, icons, list items — should be **at least 48x48 logical pixels**, even if their visible icon is smaller; wrap small icons in enough padding to reach this minimum.',
          whyItMatters:
            'This is a focused, achievable slice of a much larger topic — covering the highest-impact, lowest-effort wins rather than attempting exhaustive WCAG compliance, which is more than this course\'s scope calls for but still genuinely worth doing.',
          steps: [
            'Add `tooltip:` to every icon-only `IconButton` across the app (like, comment, more-options, send, back).',
            'Check LocalInsta\'s brand orange against white and against your dark theme\'s background using any online contrast checker, adjusting the shade slightly if it falls short of 4.5:1 for text use.',
            'Audit tap targets smaller than 48x48 logical pixels (a common culprit: a small heart icon with no surrounding padding) and add `Padding`/`SizedBox` to reach the minimum.',
            'Enable a screen reader (TalkBack on Android) briefly and navigate the feed and profile screens, noting anywhere the experience is confusing or unlabeled.',
          ],
          code: `// Before: no label for a screen reader
IconButton(icon: const Icon(Icons.favorite_border), onPressed: toggleLike)

// After: a genuine, specific label
IconButton(
  icon: const Icon(Icons.favorite_border),
  tooltip: 'Like this post',
  onPressed: toggleLike,
)

// Ensuring a minimum 48x48 tap target around a small icon
SizedBox(
  width: 48,
  height: 48,
  child: IconButton(
    icon: const Icon(Icons.more_vert, size: 20),
    tooltip: 'More options',
    onPressed: showOptionsMenu,
  ),
)`,
          pitfalls: [
            '**Treating accessibility as optional polish rather than a real, if scoped, requirement.** A meaningful fraction of real users benefit from these fixes, and they are genuinely cheap here given how much time they cost to retrofit later. Fix: do this focused pass now, as part of finishing the course, not as an afterthought.',
            '**Adding a generic tooltip like "Button" instead of a specific, meaningful one.** Fix: describe the actual action — "Like this post", not "Icon button".',
            '**Only checking contrast for the light theme, forgetting the dark theme entirely.** Fix: check both, since Module 9\'s dark-mode work (this section\'s first topic) means both are genuinely live, user-facing themes now.',
            '**Attempting a full WCAG AA/AAA audit and getting overwhelmed, abandoning the effort entirely.** Fix: the three specific, bounded checks in this topic (labels, contrast, tap targets) are a genuinely worthwhile, achievable scope — perfect is the enemy of good here.',
          ],
          tryIt:
            'Enable TalkBack (Settings → Accessibility on a real Android device) and navigate the feed and a post\'s like/comment buttons using only the screen reader — note anywhere the experience is confusing, and fix at least the icon-button labelling gaps you find.',
          takeaway: 'Icon labels, contrast checks, and 48x48 tap targets are a focused, genuinely achievable accessibility pass — not an all-or-nothing commitment.',
        },
        {
          id: 'm9-t4',
          title: 'Sign-out and data-cleanup review',
          explain:
            'A final check that Module 2\'s "safe sign out" principle was actually followed everywhere new features (stories, notifications, chat) were added since.',
          analogy:
            'A final walkthrough of every room in a guesthouse before a new guest checks in, confirming the previous guest\'s belongings are genuinely gone from every drawer — not just the ones checked the first time the process was designed.',
          theory:
            'Module 2 established the principle: sign-out should reset every feature-level `ChangeNotifier` holding user-specific cached state, not just clear the auth session. Since then, this course has added `FeedState`, `StoriesState`, `NotificationsState`, `ConversationsListState`, `ChatState` — this topic is the deliberate check that **every one** of them has a working `resetAll()`-style method, called from the same central sign-out flow.\n\nThis matters more now than it did in Module 2: a shared or handed-down device signing out of one LocalInsta account and into another should never flash a previous user\'s cached feed, notifications, or (especially) private chat messages, even briefly.',
          whyItMatters:
            'Private chat message data lingering after sign-out would be a genuine, serious privacy bug — this final review exists specifically to catch that class of gap before considering the app finished.',
          steps: [
            'List every `ChangeNotifier` added since Module 2 (Feed, Stories, Notifications, ConversationsList, Chat, Theme — note Theme deliberately should NOT reset on sign-out, since it is a device preference, not user data).',
            'Confirm each user-data-holding one has a reset method, called from the central sign-out flow.',
            'Manually test: sign in as user A, browse the feed, open a chat, sign out, sign in as user B, and confirm zero traces of A\'s data appear anywhere, even briefly.',
            'Specifically test the chat case, given its heightened privacy sensitivity.',
          ],
          code: `// The central sign-out flow, extended since Module 2 to cover every
// feature added along the way.
Future<void> _confirmSignOut(BuildContext context) async {
  final confirmed = await showDialog<bool>(/* Module 2's confirmation dialog */);
  if (confirmed != true || !context.mounted) return;

  // Reset every user-data-holding provider — NOT ThemeState, which is a
  // device preference, not user data, and should persist across accounts.
  context.read<FeedState>().resetAll();
  context.read<StoriesState>().resetAll();
  context.read<NotificationsState>().resetAll();
  context.read<ConversationsListState>().resetAll();
  // ChatState is typically screen-scoped and disposed on navigation away
  // rather than app-wide — confirm this is genuinely true in your build,
  // not assumed.

  await context.read<AuthRepository>().signOut();
}`,
          pitfalls: [
            '**Adding a new feature\'s state provider without also adding it to this sign-out checklist.** The exact gap this review pass exists to close — easy to forget in the moment a new feature ships, only caught by a deliberate later audit. Fix: this topic, done now, catches everything accumulated since Module 2.',
            '**Resetting `ThemeState` on sign-out by mistake.** Dark mode is a device/user-interface preference, not sensitive user data — resetting it needlessly annoys a user who has to re-pick their preferred theme after every sign-out. Fix: distinguish "user content that must not leak" from "device preference that should persist".',
            '**Assuming a screen-scoped state (like `ChatState`, typically created fresh per chat screen and disposed on navigation away) needs the same app-wide reset treatment as a persistent provider like `FeedState`.** Fix: reason about each provider\'s actual lifecycle rather than applying one blanket rule everywhere.',
            '**Not testing the actual account-switch scenario end to end, only checking that each reset method exists in isolation.** Fix: the real, manual two-account test in this topic\'s steps is what actually proves the fix works.',
          ],
          tryIt:
            'Sign in as test account A, browse the feed and open a chat conversation, sign out, sign in as test account B, and confirm — deliberately watching for even a brief flash — that none of account A\'s data appears anywhere during or after the transition.',
          takeaway: 'Every feature added since Module 2 needs its own place in the sign-out reset checklist — a deliberate audit now catches gaps that accumulate silently as a course (or a real app) grows.',
        },
      ],
    },
    {
      id: 'm9-s2',
      title: 'Performance & free-tier stewardship',
      topics: [
        {
          id: 'm9-t5',
          title: 'A final N+1 and indexing audit',
          explain:
            'A deliberate re-read of every repository method built across Modules 5-8, checking each for the N+1 query mistake Module 5 first warned against, and confirming every genuinely hot query has a matching index.',
          analogy:
            'A final proofread of a long letter after writing it end to end — individual paragraphs made sense in isolation while writing, but a full re-read catches the inconsistencies and repeated mistakes that only become visible in hindsight, across the whole.',
          theory:
            'Module 5 taught the embedded-select technique specifically to avoid N+1 queries; this topic is the discipline of re-checking every repository method written since **for that same mistake resurfacing under time pressure** — a genuinely common thing to slip on later in a project even after learning the lesson early. Grep your own codebase for any loop containing an `await supabase.from(...)` call — that pattern is almost always an N+1 mistake waiting to be converted into a single embedded-select or batch query.\n\nFor indexing, `explain analyze` (Module 3) run against each of LocalInsta\'s real, hot queries — the feed, a profile\'s post grid, a conversation\'s messages, a notification list — confirms each one is genuinely using an index (`Index Scan`) rather than falling back to a full table scan (`Seq Scan`) as your seeded test data has grown across the course.',
          whyItMatters:
            'This topic is explicitly about the gap between "I learned this lesson in Module 5" and "I actually applied it consistently for the rest of the course under the pressure of building new features" — a very real, very common gap worth deliberately checking for.',
          steps: [
            'Search your codebase for any `for`/`.map()` loop containing an `await supabase.from(...)` call — each hit is a candidate N+1 bug.',
            'For each candidate, determine whether an embedded select (Module 5) or a single batched query would replace the loop.',
            'Run `explain analyze` against the feed query, the profile grid query, the chat message-history query, and the notifications query.',
            'Confirm each shows `Index Scan`, not `Seq Scan`, on your current (course-scale) seeded data.',
            'Fix any genuine gaps found in either category.',
          ],
          code: `-- Example: confirming the feed query is index-backed after a course's
-- worth of seeded data
explain analyze
select * from public.posts
order by created_at desc
limit 20;
-- Look for: Index Scan using idx_posts_created_at ...
-- A red flag: Seq Scan on posts (cost=0.00..N.NN rows=...) ...

-- Example: confirming chat history pagination is index-backed
explain analyze
select * from public.messages
where conversation_id = '<a real conversation id>'
order by created_at desc
limit 50;
-- Look for: Index Scan using idx_messages_conversation ...`,
          pitfalls: [
            '**Assuming Module 5\'s lesson was internalized once and would automatically apply to every later module without re-checking.** A genuinely common failure mode — knowing a principle and consistently applying it under the pressure of building new features across five more modules are different things. Fix: this deliberate re-audit is exactly what catches the gap.',
            '**Testing `explain analyze` only against nearly-empty tables.** At very small row counts, Postgres may reasonably choose a sequential scan even *with* an index present, since it is genuinely faster for a handful of rows — not itself a bug. Fix: seed enough test data (a few hundred rows per hot table) for the `explain analyze` results to be meaningful.',
            '**Fixing a found N+1 or missing-index issue without re-testing the specific screen afterward.** Fix: always confirm the fix actually resolves the issue by re-running `explain analyze` or re-checking network call counts.',
            '**Treating this as a one-time pass rather than a habit to carry into any future feature work.** Fix: the grep-for-loop-queries technique and the `explain analyze` habit are both cheap enough to repeat any time a new query is added going forward.',
          ],
          tryIt:
            'Actually run the grep search and the four `explain analyze` queries above against your real, course-scale seeded data, and fix anything genuinely found — this is real verification work, not a rhetorical exercise.',
          takeaway: 'Learning a lesson once (Module 5) and consistently applying it under later time pressure are different skills — a deliberate final audit is what closes that gap.',
        },
        {
          id: 'm9-t6',
          title: 'Checking real free-tier usage after a full build',
          explain:
            'A concrete look at Supabase\'s dashboard usage meters — database size, Storage, bandwidth, Edge Function invocations — now that LocalInsta has a full course\'s worth of features and seeded test data.',
          analogy:
            'Checking the electricity meter after a full month of actually living in a house, rather than only estimating usage on moving-in day — the real number, after real use, is what tells you whether your assumptions held up.',
          theory:
            'Module 4 discussed free-tier ceilings in the abstract, before LocalInsta had many real features; this topic is the concrete follow-up, checking **actual** usage after building the entire app: **Project Settings → Usage** shows Database size (Modules 3, 6, 7, 8\'s schema and seeded rows), Storage size and bandwidth (Module 4\'s images, Module 7\'s stories), Edge Function invocations (Module 7\'s optional push extension, if built), and Realtime concurrent connections (every Modules 5, 7, 8 subscription).\n\nFor a course project with realistic test data (a few dozen posts, a handful of test accounts, some chat history), usage should sit comfortably within free-tier limits — if any meter is surprisingly high, this is the moment to investigate why (an uncompressed image slipping through Module 4\'s pipeline is a common culprit) rather than after the app is already \'finished\'.',
          whyItMatters:
            'This is the honest, concrete conclusion to the "free tier, no card, ever" promise threaded through the entire course — actually checking real numbers, not just trusting the promise abstractly, is what a genuinely careful engineer does before calling a project done.',
          steps: [
            'Open **Project Settings → Usage** (or the main dashboard\'s usage summary).',
            'Record Database size, Storage size, Storage bandwidth, Edge Function invocations, and Realtime concurrent peak connections.',
            'Compare each against its free-tier ceiling from Modules 1 and 4.',
            'If anything is surprisingly high, investigate — check for an uncompressed image, an accidentally-unbounded query, or leftover test data from early debugging.',
            'Write the final numbers in your README as a concrete "here is what this course actually costs on the free tier" data point.',
          ],
          code: `-- A rough self-check via SQL, alongside the dashboard's own usage page
select pg_size_pretty(pg_database_size(current_database())) as db_size;

select bucket_id, count(*) as files, pg_size_pretty(sum((metadata->>'size')::bigint)) as total_size
from storage.objects
group by bucket_id;`,
          pitfalls: [
            '**Never actually checking, trusting the free-tier promise purely in the abstract.** The whole point of this topic is verifying, not assuming. Fix: check the real dashboard numbers now.',
            '**Panicking over a number that is technically within limits but "feels high".** Compare against the actual documented ceiling, not a vague gut feeling. Fix: know the real numbers from Modules 1/4 and compare precisely.',
            '**Not investigating a genuinely surprising number, just accepting it.** A single uncompressed multi-megabyte image slipping past Module 4\'s compression step (perhaps from an early testing session before compression was wired up) is a realistic, findable cause worth tracking down. Fix: treat a surprising number as a signal worth a few minutes of investigation.',
            '**Forgetting Realtime concurrent connections has its own free-tier ceiling, separate from database/storage/bandwidth.** Worth checking specifically given how many Realtime subscriptions this course built (likes, comments, notifications, messages, presence).',
          ],
          tryIt:
            'Check your actual dashboard usage right now and write the real numbers into your README — this concrete data point is worth having for your own portfolio narrative ("built a full social app, used X% of the free tier").',
          takeaway: 'Verify the free-tier promise with real dashboard numbers after a full build, rather than trusting it only in the abstract.',
        },
        {
          id: 'm9-t7',
          title: 'Living with the weekly-pause gotcha',
          explain:
            'A practical playbook for the one genuine inconvenience of Supabase\'s free tier — a project pausing after 7 days of no API activity — for a portfolio project that might sit untouched between demos or interviews.',
          analogy:
            'A well shop that closes its shutter after a week with no customers, reopening the instant someone knocks — mildly inconvenient if you show up unannounced, but a single knock (logging into the dashboard) is all it takes to reopen for good.',
          theory:
            'Module 1 first mentioned this: a free Supabase project pauses after 7 consecutive days with zero API activity — genuinely harmless (no data loss, one click to "Restore" in the dashboard) but worth planning around for a **portfolio project** specifically, since it might sit untouched between when you build it and when you show it to an interviewer or reviewer weeks later. A practical playbook: before any planned demo, log into the Supabase dashboard a day ahead to confirm the project is active (and restore it if not — restoration is fast but not always instant); for a project you want to keep permanently "warm" with minimal effort, a free, external scheduled ping (a free-tier cron service like GitHub Actions\' scheduled workflows, calling a trivial Supabase endpoint weekly) can prevent the pause entirely, at zero cost.',
          whyItMatters:
            'This is a genuinely practical, portfolio-specific piece of advice — the difference between confidently demoing a live project and an awkward "let me just restore this real quick" moment in front of an interviewer.',
          steps: [
            'Note the exact pause condition (7 days, zero API activity) and the exact recovery step (dashboard → Restore) in your README.',
            'Before any planned demo or interview, check the dashboard a day ahead as a habit.',
            'Optionally, set up a free weekly GitHub Actions scheduled workflow that calls a trivial Supabase endpoint (e.g. a lightweight `select 1;` via the REST API) to keep the project permanently active with zero manual effort.',
            'Test the actual restore flow once deliberately, so it is not an unfamiliar process the first time it matters.',
          ],
          code: `# .github/workflows/keep-supabase-warm.yml (optional, entirely free)
name: Keep Supabase project warm
on:
  schedule:
    - cron: '0 6 * * 1' # every Monday at 06:00 UTC
  workflow_dispatch: {} # allow manual triggering too

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase REST endpoint
        run: |
          curl -s "\${{ secrets.SUPABASE_URL }}/rest/v1/profiles?select=id&limit=1" \\
            -H "apikey: \${{ secrets.SUPABASE_ANON_KEY }}"`,
          pitfalls: [
            '**Being caught off guard by a paused project during an actual demo or interview.** Entirely avoidable with a day-ahead check — the single most practical piece of advice in this topic. Fix: build the habit, or automate it away entirely with the optional GitHub Actions workflow.',
            '**Storing the Supabase URL or anon key as plain workflow text instead of GitHub Actions secrets.** The anon key alone is low-risk (Module 1), but using secrets is still the correct, professional habit regardless. Fix: always use repository secrets for any credential-shaped value, even a low-risk one.',
            '**Assuming restoration is always instant.** It is typically fast but can occasionally take a minute or two — worth checking the day before a demo, not five minutes before. Fix: build in a buffer.',
            '**Over-engineering a keep-alive solution for a project that will only ever be demoed by you, personally, whenever you feel like it.** The manual day-ahead check is genuinely sufficient for many learners; the GitHub Actions automation is a nice-to-have, not a requirement. Fix: match the solution to your actual, real usage pattern.',
          ],
          tryIt:
            'Add the pause/restore note to your README now, and decide (and act on) whether the manual day-ahead check or the automated GitHub Actions keep-alive better fits how you plan to use this project going forward.',
          takeaway: 'The weekly pause is a real, minor, well-understood inconvenience with a one-click fix — plan for it explicitly rather than being surprised by it before a demo.',
        },
        {
          id: 'm9-t8',
          title: 'A final, systematic RLS security pass',
          explain:
            'A single, complete pass through every table\'s RLS policies, using the Module 3 impersonation technique against every table this course has built, before calling the schema genuinely finished.',
          analogy:
            'A locksmith\'s final walkthrough of an entire building before handing over the keys — checking every single door, not just the ones that got the most attention during construction.',
          theory:
            'This course built RLS policies incrementally across five modules (3, 4, 6, 7, 8) — `profiles`, `posts`, `likes`, `comments`, `follows`, `storage.objects` (three buckets), `notifications`, `conversations`, `conversation_participants`, `messages`. A final security pass means systematically re-running the Module 3 impersonation test against **every single one**: for each table, confirm a legitimate owner/participant can do exactly what they should, and a non-owner/non-participant is genuinely blocked from everything they should not be able to do — not just spot-checking the tables that felt trickiest at the time they were built.\n\nThis is also the moment to re-confirm the `service_role` key has never once been used anywhere in the Flutter app (Module 1\'s original promise) — a `grep -r "service_role"` across the entire codebase should return zero matches outside of Edge Function code (if Module 7\'s optional push extension was built), which runs in a trusted server environment, not the client.',
          whyItMatters:
            'This is the single most important verification step before considering LocalInsta genuinely done — a beautiful UI and working features mean nothing if the underlying data is not actually secured the way ten modules of careful RLS design intended.',
          steps: [
            'List every table with RLS policies built across this course: profiles, posts, likes, comments, follows, storage.objects, notifications, conversations, conversation_participants, messages.',
            'For each, run the Module 3 impersonation technique twice: once as a legitimate actor (should succeed), once as an illegitimate one (should fail).',
            'Record pass/fail for each table in your README\'s security checklist.',
            'Run `grep -r "service_role" lib/` (or your Flutter source folder) across the entire Flutter codebase and confirm zero matches.',
            'Fix any genuine gap found — do not consider the course finished until every row in the checklist passes.',
          ],
          code: `<!-- README.md — final RLS verification checklist -->
| Table                        | Owner action succeeds | Non-owner action blocked |
|-------------------------------|:---:|:---:|
| profiles (update own)         | ✅  | ✅  |
| posts (insert/update/delete)  | ✅  | ✅  |
| likes (insert/delete)         | ✅  | ✅  |
| comments (insert/delete)      | ✅  | ✅  |
| follows (insert/delete)       | ✅  | ✅  |
| storage.objects (avatars)     | ✅  | ✅  |
| storage.objects (posts)       | ✅  | ✅  |
| storage.objects (stories)     | ✅  | ✅  |
| notifications (select/update) | ✅  | ✅  |
| conversations (select)        | ✅  | ✅  |
| conversation_participants     | ✅  | ✅  |
| messages (select/insert)      | ✅  | ✅  |

\`\`\`bash
# Confirm the service_role key never appears in client code
grep -r "service_role" lib/
# Expect: no matches (or matches only inside Edge Function source,
# which is trusted server code, never shipped in the Flutter binary)
\`\`\``,
          pitfalls: [
            '**Only re-testing tables that felt tricky at the time (like chat\'s subquery policies), skipping the ones that felt "obviously fine" (like posts).** Every table deserves the same systematic re-check — confidence at build time is not the same as verified correctness now. Fix: apply the checklist uniformly, no exceptions.',
            '**Testing only the positive case (legitimate access) and treating that as sufficient.** The negative case (illegitimate access genuinely blocked) is the half that actually matters for security. Fix: always test both, exactly as Module 3 established from the start.',
            '**Skipping this pass because "it all worked during development".** Development testing naturally happens as the legitimate owner of test data — it rarely deliberately attempts the attack case unless you make a point of it. Fix: this final pass is precisely where that gap gets closed.',
            '**Finding a genuine gap and patching it without immediately re-running the full checklist to confirm the fix.** Fix: always re-verify after any policy change, treating RLS fixes with the same rigor as the original policy work.',
          ],
          tryIt:
            'Actually complete the full checklist above against your real, deployed schema — every single row — and only consider this topic (and, meaningfully, the whole course\'s security posture) done once every cell genuinely passes.',
          takeaway: 'A systematic re-verification of every table, not just the ones that felt hardest at build time, is what actually confirms LocalInsta\'s data is secure.',
        },
      ],
    },
    {
      id: 'm9-s3',
      title: 'Signed release APK & distribution',
      topics: [
        {
          id: 'm9-t9',
          title: 'Generating a release keystore',
          explain:
            'A one-time, precious cryptographic key that signs every future release build of LocalInsta — lose it, and you can never publish an update under the same app identity again.',
          analogy:
            'A business\'s official rubber stamp and seal, used to certify every document as genuinely theirs — lose the seal, and you cannot simply carve a new one and claim it is the same business\'s seal; every past document stamped with the old one becomes unverifiable against anything new.',
          theory:
            '`keytool -genkey -v -keystore upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload` generates a release signing keystore — genuinely the single most precious file in the entire project, exactly as the billing course in this portfolio emphasizes for its own release process. Losing it means you can never publish an update to the same app listing again; a new keystore produces a build Android and app stores treat as a completely different, unrelated app.\n\n`android/key.properties` (holding the keystore path, alias, and passwords) must be added to `.gitignore` immediately — never committed — and `android/app/build.gradle` wires a `signingConfigs.release` block reading from it, replacing the default debug-signing config for release builds.',
          whyItMatters:
            'This is a genuinely high-stakes, one-time step — getting it right (and backed up) now avoids a permanent, unfixable mistake that has ended real published apps\' ability to ever update again.',
          steps: [
            'Run `keytool -genkey -v -keystore upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload` in a terminal, choosing a strong password.',
            'Immediately back up `upload.jks` to **two separate locations** (e.g. a password manager\'s file storage and a separate cloud drive) — never just one copy on one machine.',
            'Create `android/key.properties` with the keystore path, alias, and both passwords.',
            'Add `android/key.properties` and `*.jks` to `.gitignore` — confirm via `git status` that neither is staged.',
            'Wire `android/app/build.gradle`\'s `signingConfigs.release` to read from `key.properties`, and set `buildTypes.release.signingConfig signingConfigs.release`.',
          ],
          code: `# Generate the keystore (run once, ever, for this app's lifetime)
$ keytool -genkey -v -keystore upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload

# android/key.properties (gitignored, never committed)
storePassword=<your-strong-password>
keyPassword=<your-strong-password>
keyAlias=upload
storeFile=../upload.jks

// android/app/build.gradle (relevant excerpt)
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}`,
          pitfalls: [
            '**Keeping only one copy of `upload.jks`, on one machine, with no backup.** A single hard drive failure permanently ends your ability to publish updates under this app\'s identity. Fix: back up to at least two separate, genuinely independent locations immediately after generation.',
            '**Committing `key.properties` or the `.jks` file to git "just this once, I\'ll remove it later".** Even a single commit puts it in git history permanently unless you rewrite history (a painful, error-prone process). Fix: gitignore both before ever running `git add`.',
            '**Forgetting the exact keystore password anywhere retrievable.** Functionally identical to losing the file itself — a strong password manager entry is essential, not optional. Fix: store the password with the same care as the file.',
            '**Choosing a low `validity` value.** `10000` days (~27 years) is the conventional, sensible choice, matching Android\'s own documentation — a shorter validity risks the certificate expiring while the app is still actively maintained. Fix: use the standard, generous validity period.',
          ],
          tryIt:
            'Generate your real keystore now, back it up to two separate locations immediately, and confirm via `git status` that neither the `.jks` file nor `key.properties` ever appears as a trackable file.',
          takeaway: 'The release keystore is the single most precious file in the project — back it up in two places the moment it is created, and never let it near git.',
        },
        {
          id: 'm9-t10',
          title: 'Building the signed release APK',
          explain:
            '`flutter build apk --release --split-per-abi` produces smaller, signed, installable APKs — and every `--dart-define` secret from Module 1 must be passed again, explicitly, at this final build step.',
          analogy:
            'A final, official print run of a document, using the business\'s real seal (the keystore) rather than the informal draft stamp used during editing (the debug signing key) — the same content, but now bearing the mark that makes it genuinely official.',
          theory:
            '`flutter build apk --release` produces a release-mode, signed (via the previous topic\'s config) APK — release mode strips debug information and enables optimizations, producing a meaningfully smaller, faster binary than any debug build. `--split-per-abi` produces **separate** APKs per CPU architecture (`arm64-v8a`, `armeabi-v7a`, `x86_64`) instead of one universal APK bundling all three — roughly a third the size each, ideal for direct side-loading where you know the target device\'s architecture (`arm64-v8a` covers essentially every modern Android phone).\n\n**Critically**, this build command must repeat the exact `--dart-define=SUPABASE_URL=...` and `--dart-define=SUPABASE_ANON_KEY=...` flags from Module 1 — the release build has no memory of your `launch.json`\'s dev-time flags, and omitting them produces an app that crashes immediately on `Env.assertConfigured()` (Module 1).',
          whyItMatters:
            'Forgetting the `--dart-define` flags on a release build is a genuinely common, easy-to-hit mistake that produces a confusing "works in debug, crashes in release" bug — recognising this specific failure mode immediately, rather than debugging from scratch, is valuable.',
          steps: [
            'Confirm the release keystore and `key.properties` from the previous topic are correctly wired.',
            'Run `flutter build apk --release --split-per-abi --dart-define=SUPABASE_URL=<real-url> --dart-define=SUPABASE_ANON_KEY=<real-anon-key>`.',
            'Locate the output APKs under `build/app/outputs/flutter-apk/`.',
            'Note the file sizes — confirm `app-arm64-v8a-release.apk` is meaningfully smaller than a universal build would be.',
            'Bump `pubspec.yaml`\'s `version:` (e.g. `1.0.0+1`) before this first release build, so any future update has a clear version to increment from.',
          ],
          code: `# The full release build command — note EVERY --dart-define flag repeated
$ flutter build apk --release --split-per-abi \\
    --dart-define=SUPABASE_URL=https://your-ref.supabase.co \\
    --dart-define=SUPABASE_ANON_KEY=your-real-anon-key-here

# Output location
build/app/outputs/flutter-apk/
  app-armeabi-v7a-release.apk
  app-arm64-v8a-release.apk   <- the one to side-load on any modern phone
  app-x86_64-release.apk

# pubspec.yaml — bump before every release
# version: 1.0.0+1
#          ^^^^^ ^
#          versionName (user-visible)
#                +versionCode (must increase on every update)`,
          pitfalls: [
            '**Forgetting the `--dart-define` flags entirely.** Produces an app that installs fine but crashes instantly on launch with Module 1\'s `Env.assertConfigured()` error — a specific, recognisable failure mode worth remembering. Fix: always repeat the full flag set for any release build.',
            '**Distributing the universal (non-split) APK when a split, architecture-specific one would do.** Roughly 3x larger for no benefit when you know the target device. Fix: `--split-per-abi` and pick `arm64-v8a` for any modern phone.',
            '**Forgetting to bump `versionCode` before a second release build.** Installing over an existing app with the same or lower `versionCode` fails with `INSTALL_FAILED_VERSION_DOWNGRADE` — a specific, well-known error worth recognising if hit later.',
            '**Testing only the debug build and assuming the release build behaves identically.** Release mode\'s optimizations and stripped debug info can occasionally surface behaviour differences (though rare in typical Flutter apps) — always do at least one real test install of the actual release APK before considering it done.',
          ],
          tryIt:
            'Run the full release build command with your real Supabase credentials, confirm three architecture-specific APKs are produced, and note their file sizes compared to what a debug build would produce.',
          takeaway: 'A release build needs its own --dart-define flags every time — the exact same flags used in development, repeated explicitly, or the app crashes on first launch.',
        },
        {
          id: 'm9-t11',
          title: 'Side-loading on a real phone',
          explain:
            'Transferring `app-arm64-v8a-release.apk` to a real Android device and installing it directly — LocalInsta\'s primary, entirely free distribution path.',
          analogy:
            'Hand-delivering a finished print run directly to a customer\'s door, rather than routing it through a formal distributor first — perfectly legitimate, immediate, and appropriate for a personal or small-audience app.',
          theory:
            'Side-loading (installing an APK directly, outside the Play Store) requires the target device to have **"Install unknown apps"** enabled for whichever app you use to open the file — Settings → Apps → [Chrome/Files/WhatsApp] → Install unknown apps → toggle on, specific to Android\'s per-source permission model. Transfer the APK via USB, a self-sent WhatsApp/Telegram file, or a cloud drive link, then tap to install.\n\nA common first-install snag: if a **debug** build of LocalInsta was ever installed on the same device during development, Android will refuse to install the release build over it (**"App not installed"**, with no further detail) because the two builds are signed with different keys (the debug keystore vs. the new release keystore) — Android treats a signature mismatch as a potential security risk and blocks the install rather than silently overwriting. The fix is simply uninstalling the debug build first.',
          whyItMatters:
            'This entire distribution path — side-loading a signed APK — is completely free, requires no Play Console registration, no review process, and no fee, making it the natural, appropriate distribution channel for a personal project or a small hyperlocal community app exactly like LocalInsta\'s premise.',
          steps: [
            'On the target phone, enable "Install unknown apps" for whichever app you will use to open the APK file.',
            'Transfer `app-arm64-v8a-release.apk` to the device (USB cable, WhatsApp self-message, cloud drive — any method works).',
            'If a debug build of LocalInsta is already installed, uninstall it first.',
            'Tap the transferred APK file and confirm the install prompt.',
            'Open the installed app and confirm it runs correctly, connecting to your real Supabase project exactly as the debug build did.',
          ],
          code: `# No commands here — this is a device-level, manual process. Checklist:
#
# 1. Settings -> Apps -> [chosen app] -> Install unknown apps -> ON
# 2. Transfer app-arm64-v8a-release.apk to the device
# 3. IF a debug build is already installed: uninstall it first
#    (mismatched signing keys will otherwise block the install silently)
# 4. Tap the APK, confirm install
# 5. Open, verify it connects and behaves correctly`,
          pitfalls: [
            '**Hitting "App not installed" with no further explanation and assuming the APK build itself is broken.** The far more common cause is a leftover debug build with a mismatched signing key already on the device. Fix: always uninstall any prior debug install before side-loading a release build for the first time.',
            '**Forgetting to enable "Install unknown apps" first, being blocked entirely with a vague warning.** Fix: enable it specifically for whichever app you use to open the file (this permission is per-source-app on modern Android, not a single global toggle).',
            '**Transferring the wrong architecture-specific APK for the target device.** `arm64-v8a` covers virtually every modern phone (the last several years of Android devices), but a very old or unusual device might need `armeabi-v7a` instead. Fix: `arm64-v8a` is the safe default; fall back to the others only if install genuinely fails on a specific old device.',
            '**Not actually testing the installed release build against the real, live Supabase project.** Fix: open it, sign in, browse the feed — a genuine smoke test, not just a successful install.',
          ],
          tryIt:
            'Actually side-load `app-arm64-v8a-release.apk` onto a real Android phone (uninstalling any prior debug build first), and confirm you can sign in, browse the feed, and post — a real, working, distributed copy of LocalInsta, entirely free.',
          takeaway: 'Side-loading is completely free, needs no Play Console registration, and is the appropriate distribution path for a personal or small-community app like LocalInsta.',
        },
        {
          id: 'm9-t12',
          title: 'The Play Store path — informational, and the one place a fee could enter',
          explain:
            'Publishing to the Play Store is entirely optional and involves a one-time $25 Play Console registration fee — the single place any money could ever enter LocalInsta\'s story, and even this step is not required to consider the app finished.',
          analogy:
            'Registering a small home business with the local trade office is a real, sometimes-worthwhile step for reaching more customers — but plenty of legitimate small shops (like side-loading, the previous topic) operate perfectly well without it, and the registration fee is a one-time, known, optional cost, not a recurring one baked into daily operations.',
          theory:
            'The Google Play Console requires a **one-time $25 USD registration fee** per developer account — genuinely the only place, in this entire course, where real money could ever be required, and even then, only if you choose to pursue Play Store distribution at all. Every other service used throughout LocalInsta\'s build — Supabase, Google Cloud OAuth clients, OneSignal, pg_cron, Edge Functions — is genuinely free with no card required, exactly as promised from Module 1 onward.\n\nFor context (informational, not a requirement to act on): **Internal testing track** is the fastest path — upload the signed AAB (`flutter build appbundle --release`, the Play Store\'s preferred format over a raw APK), add specific testers by Google account email, share an opt-in link, live within 5-10 minutes, no public review required. **Production listing** requires a store icon, screenshots, a privacy policy URL, a completed data-safety form, and content rating — a genuine half-day-or-more undertaking with a 1-7 day review period, appropriate only if wide public distribution is actually the goal.',
          whyItMatters:
            'Being explicit and honest about this one boundary — rather than silently glossing over it — is exactly the kind of transparent, trustworthy communication the "no card, ever" promise deserves, and it leaves the choice genuinely informed and entirely optional for the learner.',
          steps: [
            'Read through this topic as informational context — no action is required to complete LocalInsta or this course.',
            'If (and only if) you choose to pursue Play Store distribution: register a Google Play Console developer account (one-time $25 fee).',
            'For the fastest path, build an AAB (`flutter build appbundle --release`, with the same `--dart-define` flags from the previous topic) and use the Internal testing track.',
            'For a public listing, budget genuine time for store assets, the privacy policy, and the data-safety form, and expect a multi-day review.',
            'Whichever path (or neither) you choose, note the decision explicitly in your README — side-loading alone is a complete, legitimate, and free way to finish this course.',
          ],
          code: `# Building an AAB (Android App Bundle) — the Play Store's preferred format
$ flutter build appbundle --release \\
    --dart-define=SUPABASE_URL=https://your-ref.supabase.co \\
    --dart-define=SUPABASE_ANON_KEY=your-real-anon-key-here

# Output:
# build/app/outputs/bundle/release/app-release.aab
#
# This AAB is what you would upload to Play Console's Internal testing
# track — a decision entirely separate from, and not required for,
# finishing LocalInsta as a complete, working, side-loadable app.`,
          pitfalls: [
            '**Feeling obligated to publish to the Play Store to consider the course "really" finished.** Explicitly false — side-loading (the previous topic) is a complete, legitimate distribution method, and this entire topic is informational only. Fix: treat Play Store publishing as a genuinely optional next step, not a requirement.',
            '**Confusing the one-time $25 developer registration fee with a recurring cost.** It is paid once, ever, per developer account, not per app or per year. Fix: know the real, bounded cost if you do choose this path.',
            '**Underestimating the time cost of a production listing (screenshots, privacy policy, data-safety form, review time) versus the fast Internal testing track.** Fix: Internal testing is the right choice for sharing with a handful of specific people (like the real business owner this course\'s other apps are built for); production listing is a different, larger undertaking.',
            '**Building an APK when the Play Store specifically wants an AAB, or vice versa.** Side-loading needs an APK (Module 9\'s previous topic); Play Store upload needs an AAB. Fix: use the right build command for the right destination.',
          ],
          tryIt:
            'No action is required — read this topic, note your decision (Play Store or side-load-only) in your README, and move on to the capstone review with a complete, honest picture of every cost (there is exactly one, optional, one-time $25 fee) in LocalInsta\'s entire build.',
          takeaway: 'The Play Store\'s one-time $25 fee is the single place money could ever enter this course\'s story — and it is entirely optional; side-loading alone is a complete finish.',
        },
      ],
    },
    {
      id: 'm9-s4',
      title: 'Capstone review',
      topics: [
        {
          id: 'm9-t13',
          title: 'Architecture walkthrough: explain LocalInsta end to end',
          explain:
            'A deliberate, spoken (or written) exercise: explain LocalInsta\'s entire architecture, module by module, as if walking a new teammate through the codebase on their first day.',
          analogy:
            'A head chef walking a new cook through the entire kitchen on their first morning — not just pointing at stations, but explaining *why* the tandoor sits where it does, why the prep counter is ordered the way it is, so the new cook understands the reasoning, not just the layout.',
          theory:
            'True understanding shows itself in the ability to **explain**, not just to have built something once by following instructions. This topic asks you to narrate LocalInsta\'s full architecture out loud (or in writing, as a genuine README architecture section) in your own words, covering: why Supabase over Firebase for this specific "no card" constraint (Module 1); the repository + ChangeNotifier pattern and why it exists (Modules 2, 5); why RLS with subquery-based policies is the real security boundary, not client-side checks (Modules 3, 8); the denormalized-counter-plus-trigger pattern and why it recurs across likes, comments, follows (Modules 3, 6); the optimistic-UI-for-your-own-actions vs. Realtime-for-others\'-actions distinction (Module 5); and the two genuinely free advanced-infrastructure pieces — pg_cron and Edge Functions — that make the whole "no card, ever" promise hold even for scheduled jobs and push notifications (Module 7).',
          whyItMatters:
            'This is explicitly modeled on the real interview question "walk me through a project you built" — practicing a clear, confident, accurate narration of your own architecture now, in a low-stakes setting, is directly transferable to that exact real-world moment.',
          steps: [
            'Without looking anything up, write (or say out loud, recorded) a 5-10 minute walkthrough of LocalInsta\'s architecture, module by module.',
            'Cover, at minimum: the backend choice and why; the repository/state pattern; RLS as the real security boundary; the counter-trigger pattern; optimistic UI vs. Realtime; the free-tier-advanced-infrastructure story (pg_cron, Edge Functions).',
            'Afterward, check your walkthrough against this course\'s actual module descriptions — note anything you glossed over or got slightly wrong, and revisit that specific module\'s content.',
            'Save the written version in your README as a genuine architecture overview — valuable both for your own portfolio and for anyone else reading the codebase.',
          ],
          code: `<!-- README.md — a real architecture overview, written in your own words -->
## Architecture

LocalInsta is a Flutter + Supabase Instagram-style app built to run entirely
on free-tier services, with no credit card required anywhere in the stack.

**Backend choice.** Supabase (Postgres + Auth + Storage + Realtime + Edge
Functions), chosen over Firebase specifically because Firebase's Cloud
Storage now requires the paid Blaze plan for new projects — a hard
conflict with this project's "no card, ever" constraint.

**Data & security.** Every table uses Row Level Security as the real
access-control boundary — never client-side checks alone. [...continue
in your own words, covering the repository pattern, denormalized
counters + triggers, optimistic UI vs. Realtime, and the pg_cron /
Edge Functions story...]`,
          pitfalls: [
            '**Only ever having explained pieces of this in isolation (per-module), never the whole thing end to end in one sitting.** The connections *between* modules — why the same optimistic-UI pattern reappears three times, why RLS underlies both posts and chat — are exactly what this exercise surfaces. Fix: do the full walkthrough in one sitting, not piecemeal.',
            '**Reading module descriptions and paraphrasing them instead of genuinely explaining in your own words from memory first.** Fix: attempt the walkthrough cold first, then check against the material — the gap between the two is the most valuable signal.',
            '**Treating this as optional busywork rather than genuine interview preparation.** Fix: this is close to verbatim what a real technical interview\'s "tell me about a project" question looks like — practice it with that seriousness.',
            '**Not writing any of it down.** A spoken walkthrough is valuable practice, but a written README architecture section is a permanent, reusable artifact for your actual portfolio. Fix: do both — speak it first, then write it.',
          ],
          tryIt:
            'Actually do the cold, unaided 5-10 minute walkthrough right now, either recorded or written, then compare it against this course\'s module descriptions and fill in anything genuinely missed — then write the polished version into your README.',
          takeaway: 'Explaining your own architecture cold, end to end, is the realest test of whether you understood it — and it is near-identical practice for a real interview question.',
        },
        {
          id: 'm9-t14',
          title: 'Interview questions this build prepares you for',
          explain:
            'A curated list of realistic technical interview questions LocalInsta directly equips you to answer confidently, each traced back to the specific module and decision that taught it.',
          analogy:
            'A student who has actually cooked every dish on a menu, rather than only reading the recipes, walks into a kitchen trial able to answer "why did you rest the dough" with real, lived experience — not a memorized textbook line.',
          theory:
            'Real interview questions this build genuinely prepares you for, each with a concrete anchor in LocalInsta\'s own code: **"Why did you choose your backend?"** — the Firebase-Storage-requires-Blaze constraint (Module 1). **"How do you prevent a race condition in a like/follow toggle?"** — the unique-constraint-plus-RPC-function pattern (Modules 3, 6). **"Walk me through your database security model."** — RLS policies, including the subquery-based chat policies (Modules 3, 8). **"How do you keep a denormalized counter accurate?"** — the trigger pattern (Modules 3, 6). **"How would you implement a live-updating feed?"** — Postgres Changes vs. Presence, and when to use which (Modules 5, 8). **"How do you handle a scheduled background job without a paid tier?"** — pg_cron (Module 7). **"How do you test that your access control actually works?"** — the impersonation technique, used systematically across the whole course (Modules 3, 9).',
          whyItMatters:
            'Recognising these questions as ones you can now answer with a real, specific, lived example — not a rehearsed generic answer — is a concrete, confidence-building way to close out the course.',
          steps: [
            'Read through the question list above.',
            'For each, without looking anything up, give yourself a genuine, spoken answer using LocalInsta as the concrete example.',
            'Note any question where your answer felt shaky, and revisit that specific module\'s topics.',
            'Consider adding two or three of your strongest answers to your README or portfolio notes as talking points for a future interview.',
          ],
          code: `<!-- A worked example answer, in your own README/notes -->
Q: "Walk me through your database security model."

A: "Every table in LocalInsta has Row Level Security enabled by default,
which means a table with no policies is fully closed, not fully open —
that's the safe default I built every table around. For simple ownership
tables like posts, the policy is a straightforward auth.uid() = user_id
check. For chat, though, a message doesn't directly say who's allowed to
read it — so I used a subquery checking whether the current user has a
row in conversation_participants for that message's conversation. I
verified every single policy by literally trying to break it — impersonating
a non-owner in the SQL editor and confirming the write or read genuinely
failed, not just assuming the policy text was correct."`,
          pitfalls: [
            '**Giving a generic, textbook answer instead of anchoring it in your own actual build.** Interviewers can tell the difference immediately, and a specific example is always more convincing. Fix: always reference the real table, the real trigger, the real decision from your own code.',
            '**Only preparing answers for the questions on this list, treating it as exhaustive.** It is a representative sample, not the complete universe of possible questions — the real preparation is genuine understanding (this topic\'s predecessor), which generalizes to questions not explicitly listed here.',
            '**Memorizing a scripted answer word-for-word instead of genuinely understanding it well enough to explain it differently if asked a follow-up.** Fix: practice explaining each answer two different ways, to confirm real understanding rather than rote recall.',
            '**Skipping this topic because the course already feels "done" after Module 9\'s deployment work.** This reflective, consolidating step is exactly what turns "I built something" into "I can confidently discuss what I built" — a genuinely different, valuable skill.',
          ],
          tryIt:
            'Pick the three questions from the list that feel hardest to answer confidently right now, and spend focused time revisiting the relevant module until you can answer each with a specific, concrete example from your own LocalInsta build.',
          takeaway: 'Every one of these questions has a real, specific answer sitting in your own codebase — practice retrieving it fluently, not just recognising it when read.',
        },
        {
          id: 'm9-t15',
          title: 'Where to go next',
          explain:
            'A closing map of natural extensions — Reels-style video posts, multi-language support, admin moderation tools — each explicitly scoped as a genuine next step, not a required part of this course.',
          analogy:
            'A well-built starter home, finished and genuinely livable, with the electrical and plumbing already run to support an eventual extra room — the room itself is not part of the original build, but the foundation was laid to make adding it straightforward later.',
          theory:
            '**Reels-style video posts** — `video_player`/`chewie` for playback, extending `posts.image_url` (perhaps renamed or paired with a `media_type` column) to support video files uploaded through the exact same Module 4 Storage pipeline, just skipping the compression step in favour of video-specific handling. **Multi-language support** — this course\'s `translations_kn.js` pattern (seen across every course in this portfolio) is ready and waiting, just never filled in; LocalInsta\'s coastal-Karnataka framing makes Kannada a natural first addition. **Admin moderation** — a `role` column on `profiles`, an admin-only screen for reviewing reported content, and a `reports` table modeled closely on `notifications`\' RLS pattern (a report is visible only to its creator and to admins, a genuinely new, three-way RLS shape worth exploring). **Group chat** — Module 8\'s conversation/participants schema was deliberately designed to support this as an additive change, exactly as promised.\n\nEach of these is a genuine, realistic extension — but **none is required** to consider LocalInsta, or this course, complete. The app built across Modules 0-9 is a real, working, secured, deployable social app on its own.',
          whyItMatters:
            'Ending with a clear, honest boundary — "here is what you built, fully finished; here is what a natural next step could look like, entirely optional" — respects both the real accomplishment of finishing a ten-module course and the learner\'s own judgment about what to build next.',
          steps: [
            'Read through the four extension ideas above.',
            'Pick zero, one, or several that genuinely interest you — none is a requirement.',
            'For any you pursue, notice how much of the existing foundation (Storage pipeline, RLS patterns, repository/state architecture) transfers directly, versus what is genuinely new.',
            'If you pursue none of them right now, that is a completely legitimate, finished outcome — LocalInsta as built across this course is a real, working app.',
          ],
          code: `-- A sketch of the admin-moderation extension's core new RLS shape,
-- for anyone curious what a genuinely new pattern (beyond anything
-- built in this course) might look like:

alter table public.profiles add column role text not null default 'user'
  check (role in ('user', 'admin'));

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  post_id uuid references public.posts(id),
  reason text not null,
  created_at timestamptz not null default now()
);

-- Visible to its own creator OR any admin — a genuinely new,
-- three-way RLS shape this course never needed until now.
create policy "reports visible to creator or admin"
on public.reports for select
to authenticated
using (
  auth.uid() = reporter_id
  or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);`,
          pitfalls: [
            '**Feeling obligated to build every extension listed here to consider the course "really" finished.** Explicitly false — this topic is a map of possibilities, not a checklist. Fix: treat the completed Modules 0-9 build as the genuine, real finish line.',
            '**Attempting a major extension (like group chat) without re-reading the specific module that laid its foundation.** Module 8\'s participants-table design decision exists precisely to make this easier — revisit that reasoning before diving in. Fix: reread the relevant "why we built it this way" theory before extending.',
            '**Underestimating a seemingly small extension\'s real scope** (e.g. assuming multi-language is "just translate the strings" when the actual UI/RTL/pluralization concerns can run deeper). Fix: scope any real extension carefully, the same deliberate way this entire course approached every feature.',
            '**Not appreciating what was actually built by immediately jumping to "what\'s next" without pausing on the accomplishment.** Ten modules, a real Postgres schema, genuine RLS security, working Realtime features, and a signed release APK is a substantial, complete piece of work. Fix: let that land before deciding what (if anything) comes next.',
          ],
          tryIt:
            'Take a moment to actually open your finished LocalInsta app, browse the feed, post something, chat with a test account, and simply use the thing you built end to end — a genuine, complete, deployable Instagram-style app, built entirely on free-tier services with no card required anywhere.',
          takeaway: 'LocalInsta as built across Modules 0-9 is a complete, real, secured, deployable app — everything past this point is a genuine, entirely optional choice, not an unfinished obligation.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm9-p1',
      type: 'Project',
      title: 'Polish, Audit & Ship',
      domain: 'Deployment / Quality',
      duration: '3 hours',
      description:
        'Wire a persisted dark-mode toggle, complete a full loading/error/empty-state and accessibility audit, run a final N+1/indexing and RLS security pass across the entire schema, and produce a signed, side-loadable release APK.',
      tools: ['Flutter', 'Supabase', 'keytool'],
      blueprint: {
        overview:
          'A ThemeState-driven dark mode toggle persisted via shared_preferences; a completed state-coverage checklist across every screen; icon-button tooltips and tap-target fixes; a documented N+1/index audit using explain analyze; a fully re-verified RLS impersonation checklist across every table; and a signed, split-per-abi release APK successfully side-loaded and smoke-tested on a real device.',
        functionalRequirements: [
          '**Dark mode.** A real, persisted ThemeMode toggle reachable from Settings/Profile, correct across every screen.',
          '**State audit.** A completed loading/error/empty checklist across every screen built in Modules 2-8, with any found gaps fixed.',
          '**Accessibility.** Tooltips on every icon-only button, verified contrast on custom colours, 48x48 minimum tap targets.',
          '**Performance & security.** A documented explain analyze pass on every hot query, and a completed RLS impersonation checklist across every table.',
          '**Release.** A signed, split-per-abi APK, successfully side-loaded and smoke-tested on a real device.',
        ],
        technicalImplementation: [
          '**core/theme_state.dart.** Persisted ThemeMode via shared_preferences.',
          '**README.md.** State-coverage checklist, RLS verification checklist, and free-tier usage numbers, all filled in with real results.',
          '**android/key.properties + build.gradle signing config.** Release keystore wired, gitignored.',
          '**Build artifacts.** app-arm64-v8a-release.apk, verified installed on a real device.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Dark mode + accessibility pass',
            outcome: 'A working, persisted theme toggle and accessibility fixes applied.',
            prompt:
              'Create lib/core/theme_state.dart as a ChangeNotifier persisting ThemeMode via shared_preferences, wired into MaterialApp.themeMode and a Settings/Profile toggle. Then audit the whole app for icon-only IconButtons missing a tooltip, adding specific, meaningful labels to each; check the brand orange against white and the dark background for 4.5:1 contrast; and pad any tap target smaller than 48x48 logical pixels.',
          },
          {
            step: 2,
            label: 'Loading/error/empty state and N+1/index audit',
            outcome: 'Every screen genuinely handles all three states; every hot query is index-backed.',
            prompt:
              'Walk every screen built since Module 2 (auth, feed, create-post, post-detail/comments, profile, edit-profile, followers/following, search, explore, stories, notifications, conversations list, chat) and verify genuine loading, error, and empty-state handling by deliberately testing each (throttled network, airplane mode, fresh test data), fixing any gaps found. Then grep the codebase for any loop containing an await supabase.from(...) call, converting any genuine N+1 pattern found to an embedded select, and run explain analyze against the feed, profile grid, chat history, and notifications queries, confirming Index Scan not Seq Scan on realistic seeded data.',
          },
          {
            step: 3,
            label: 'Final RLS security pass',
            outcome: 'Every table\'s access control independently re-verified.',
            prompt:
              'Using the Module 3 impersonation technique, systematically re-verify RLS on every table built this course (profiles, posts, likes, comments, follows, all three storage buckets, notifications, conversations, conversation_participants, messages): for each, confirm a legitimate owner/participant action succeeds and an illegitimate one is blocked. Also grep the Flutter codebase for "service_role" and confirm zero matches. Report the full pass/fail checklist.',
          },
          {
            step: 4,
            label: 'Signed release build and side-load',
            outcome: 'A working, installed, signed release APK on a real device.',
            prompt:
              'Guide me through generating a release keystore with keytool, wiring android/key.properties (gitignored) and build.gradle\'s signingConfigs.release, bumping pubspec.yaml\'s version, and running flutter build apk --release --split-per-abi with the real --dart-define SUPABASE_URL and SUPABASE_ANON_KEY flags. Then walk me through side-loading app-arm64-v8a-release.apk onto a real Android device (uninstalling any prior debug build first) and confirm it runs correctly against the live Supabase project.',
          },
        ],
        deliverable:
          'A polished, audited, secured, and signed release build of LocalInsta — dark mode works everywhere, every screen handles loading/error/empty states, every hot query is index-backed, every table\'s RLS is independently re-verified, and a real signed APK is installed and working on a physical Android device.',
      },
    },
    {
      id: 'm9-p2',
      type: 'Capstone',
      title: 'Ship LocalInsta End-to-End',
      domain: 'Full App Delivery',
      duration: '3 hours',
      description:
        'The capstone: confirm every module\'s feature works together as one coherent app, write the complete architecture walkthrough, and close out the course with a genuine, deployable, free-tier social app.',
      tools: ['Flutter', 'Supabase', 'Everything built across Modules 0-9'],
      blueprint: {
        overview:
          'A full, end-to-end walkthrough of the finished LocalInsta app — sign-up through Google or email, a live feed with likes and comments, stories, follows, search and explore, notifications, real-time chat, dark mode, and a signed release build — paired with a written architecture overview explaining every major decision from Module 1 through Module 9.',
        functionalRequirements: [
          '**End-to-end user journey.** Sign up, build a profile, post, like, comment, follow, message — every core feature working together as one coherent app, not isolated demos.',
          '**Architecture documentation.** A written README section explaining the backend choice, the security model, the recurring patterns (repositories, triggers, optimistic UI), and the free-tier stewardship story.',
          '**Verified security.** Every table\'s RLS independently re-verified (from the previous project).',
          '**Deployed artifact.** A signed release APK, side-loaded and smoke-tested on a real device.',
          '**Interview readiness.** Confident, specific answers to the representative interview questions from this module, anchored in the real build.',
        ],
        technicalImplementation: [
          '**Full manual walkthrough.** Every screen, every feature, exercised in one continuous session as a real user would.',
          '**README.md.** Complete architecture section, state-coverage checklist, RLS verification checklist, free-tier usage numbers, and the Play Store/side-load decision — all real, filled-in results, not placeholders.',
          '**Final commit.** A clean git history with no committed secrets, keystores, or credential files.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Full end-to-end manual walkthrough',
            outcome: 'Confirmation that every module\'s feature genuinely works together.',
            prompt:
              'Walk me through testing the complete LocalInsta app end to end on a real or emulated device, in one continuous session: sign up with email, confirm the auto-created profile, sign in with Google on a second account, follow the first account, post a photo, like and comment on it from the second account, confirm the notification arrives, post and view a story, search for a username, browse explore, start a chat and exchange messages with live delivery, toggle dark mode, and sign out and back in confirming no data leaked between accounts. Report any integration gap found between features built in different modules.',
          },
          {
            step: 2,
            label: 'Write the complete architecture README',
            outcome: 'A genuine, complete architecture document.',
            prompt:
              'Help me write a complete "Architecture" section for LocalInsta\'s README covering: why Supabase was chosen over Firebase for this project\'s no-card constraint; the repository + ChangeNotifier pattern used throughout; Row Level Security as the real access-control boundary, including the subquery-based chat policies; the denormalized-counter-plus-trigger pattern and everywhere it recurs; the optimistic-UI-for-own-actions versus Realtime-for-others\'-actions distinction; and how pg_cron and Edge Functions extend the free-tier promise to scheduled jobs and optional push notifications. Base it on what I actually built, not generic boilerplate.',
          },
          {
            step: 3,
            label: 'Final git hygiene check',
            outcome: 'A clean, secret-free git history ready to share publicly.',
            prompt:
              'Audit my LocalInsta git history for anything that should never have been committed: the release keystore, key.properties, any .env file, or a hardcoded Supabase URL/anon key in a committed .dart file. If anything is found, walk me through the safest remediation (rotating the credential if it is a genuine secret, and/or rewriting history if appropriate) rather than just deleting the file in a new commit.',
          },
        ],
        deliverable:
          'A complete, working, end-to-end LocalInsta app — every feature from every module functioning together as one coherent product, a genuine architecture write-up in the README, a verified-clean git history, and a signed release APK ready to hand to a real user. This is the finished course capstone.',
      },
    },
  ],
  quiz: [
    {
      id: 'm9-q1',
      q: 'Why is wiring the dark-mode toggle in Module 9 a relatively small, low-risk change rather than a major undertaking?',
      options: [
        'Every screen was already built to read colours from Theme.of(context) since Module 0, instead of hardcoding them',
        'Flutter automatically supports dark mode with zero code required',
        'Dark mode only affects the app bar, nothing else',
        'Supabase manages theme state automatically',
      ],
      answer: 0,
    },
    {
      id: 'm9-q2',
      q: 'Why does the final state-coverage audit involve deliberately triggering loading/error/empty states rather than trusting memory of what was handled during development?',
      options: [
        'Development testing naturally over-indexes on the happy path, so a deliberate audit is needed to actually verify the bad-path handling',
        'Flutter cannot detect these states automatically',
        'It is required for App Store submission',
        'It has no real value beyond documentation',
      ],
      answer: 0,
    },
    {
      id: 'm9-q3',
      q: 'Why does the N+1/indexing audit specifically re-check modules built AFTER Module 5, where the lesson was first taught?',
      options: [
        'Knowing a principle and consistently applying it under the pressure of building later features are different skills, worth deliberately re-verifying',
        'Only later modules can have N+1 query problems',
        'Module 5 code is automatically exempt from needing review',
        'Indexes only matter for tables created after Module 5',
      ],
      answer: 0,
    },
    {
      id: 'm9-q4',
      q: 'What happens if a release APK build omits the --dart-define SUPABASE_URL and SUPABASE_ANON_KEY flags used during development?',
      options: [
        'The app installs but crashes immediately on Env.assertConfigured() since the compile-time config is empty',
        'It automatically falls back to a demo mode',
        'Supabase provides default credentials automatically',
        'The build fails to compile entirely',
      ],
      answer: 0,
    },
    {
      id: 'm9-q5',
      q: 'Why does installing a release build over an existing debug build sometimes fail with "App not installed"?',
      options: [
        'The debug and release builds are signed with different keystores, and Android blocks installs with a signature mismatch',
        'The release APK is always corrupted',
        'Android limits each device to one Flutter app',
        'The dart-define flags were formatted incorrectly',
      ],
      answer: 0,
    },
    {
      id: 'm9-q6',
      q: 'What is the one place real money could ever be required across LocalInsta\'s entire build, and is it required to finish the course?',
      options: [
        'The optional one-time $25 Play Console registration fee, only if choosing to publish to the Play Store — side-loading alone is a complete, free finish',
        'The Supabase free tier eventually requires payment after a certain usage level',
        'Google Cloud OAuth client creation requires a paid plan',
        'OneSignal requires a credit card for its free tier',
      ],
      answer: 0,
    },
  ],
}
