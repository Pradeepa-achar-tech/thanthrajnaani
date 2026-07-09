// Module 7 — Stories & Notifications
// LocalInsta (Flutter + Supabase) course content for the React course player.

export const m7 = {
  id: 'm7',
  title: 'Stories & Notifications',
  hours: 8,
  color: 'from-yellow-500/20 to-yellow-700/10',
  accent: 'yellow',
  description:
    'Build 24-hour expiring stories with a pg_cron cleanup job, a full-screen tap-to-advance story viewer, trigger-generated in-app notifications with a live unread badge, and an optional real push-notification integration — all on services that never ask for a card.',
  sections: [
    {
      id: 'm7-s1',
      title: 'Stories: data model & capture',
      topics: [
        {
          id: 'm7-t1',
          title: 'The stories table & storage bucket',
          explain:
            'A `stories` table with an `expires_at` column, and a dedicated `stories` Storage bucket — structurally close to `posts`, but genuinely temporary by design.',
          analogy:
            'A chalk announcement on a shop\'s outside board, rubbed off automatically the next morning, versus the shop\'s permanent signboard that stays up for years — a story and a post look similar (both are an image with an owner) but carry fundamentally different lifetimes.',
          theory:
            '`stories` mirrors `posts`\' shape closely — `id`, `user_id references profiles(id)`, `image_url`, `created_at` — plus one new column: `expires_at timestamptz not null default (now() + interval \'24 hours\')`, computed automatically at insert time so the client never has to calculate or trust its own clock for this. RLS follows the exact same pattern as `posts`: public `select`, owner-only `insert`/`delete` via `auth.uid() = user_id`.\n\nA dedicated `stories` Storage bucket (public, folder-owned exactly like `avatars`/`posts` from Module 4) keeps story media cleanly separated from permanent post media — useful both for the cleanup job (next section) and for reasoning about the bucket\'s contents at a glance in the dashboard.',
          whyItMatters:
            'This topic is a fast, confident review of two entire modules\' worth of patterns (Module 3\'s schema+RLS discipline, Module 4\'s Storage+policy discipline) applied to a new table — by now, you should be able to predict most of this schema yourself before reading it.',
          steps: [
            'Write `create table public.stories` with the schema described above.',
            'Enable RLS and write the four familiar policies (public select; owner-scoped insert/delete; no update policy — a story is never edited, only created or removed).',
            'Create the `stories` Storage bucket (public) with the same folder-owned RLS policies as `avatars`/`posts` from Module 4.',
            'Insert one test story via SQL Editor and confirm `expires_at` is automatically set to 24 hours from insert time with zero client input.',
          ],
          code: `create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index idx_stories_user_id on public.stories(user_id);
create index idx_stories_expires_at on public.stories(expires_at);

alter table public.stories enable row level security;

create policy "stories are publicly readable"
on public.stories for select to public using (true);

create policy "users create their own stories"
on public.stories for insert to authenticated
with check (auth.uid() = user_id);

create policy "users delete their own stories"
on public.stories for delete to authenticated
using (auth.uid() = user_id);

-- Storage bucket, same folder-owned pattern as Module 4
insert into storage.buckets (id, name, public) values ('stories', 'stories', true)
on conflict (id) do nothing;

create policy "public read on stories bucket"
on storage.objects for select to public using (bucket_id = 'stories');

create policy "users upload to their own stories folder"
on storage.objects for insert to authenticated
with check (bucket_id = 'stories' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own story files"
on storage.objects for delete to authenticated
using (bucket_id = 'stories' and (storage.foldername(name))[1] = auth.uid()::text);`,
          pitfalls: [
            '**Computing `expires_at` in Flutter and sending it explicitly.** Trusts the client\'s clock, which can be wrong, manipulated, or simply inconsistent across devices. Fix: `default (now() + interval \'24 hours\')` computes it server-side, always correct relative to the database\'s own clock.',
            '**Adding an `update` policy "for consistency with other tables".** Stories are deliberately create-or-delete only in this design — an editable story is a different, more complex feature not needed here. Fix: only add the operations a table\'s actual design calls for, exactly the same discipline from Module 3\'s comments/likes tables.',
            '**Reusing the `posts` bucket for story images "to save a bucket".** Muddies the cleanup job\'s scope (next section) — a scheduled deletion job needs to cleanly target only expired-story files, not accidentally risk touching permanent post media. Fix: a dedicated bucket keeps the blast radius of any cleanup logic obviously contained.',
            '**Forgetting the `expires_at` index.** The cleanup job (next section) filters on this column — without an index, that query degrades as stories accumulate, exactly like Module 3\'s indexing lesson.',
          ],
          tryIt:
            'Insert a test story via SQL Editor and confirm `select expires_at - created_at from stories limit 1;` returns almost exactly `24:00:00`, computed automatically with zero client involvement.',
          takeaway: 'Compute expires_at server-side with a default expression — never trust a client\'s clock for something a cleanup job will later act on.',
        },
        {
          id: 'm7-t2',
          title: 'Capturing and uploading a story',
          explain:
            'A camera-first capture flow (skipping the gallery choice most of the time, matching real Instagram Stories UX) reusing Module 4\'s crop-compress-upload pipeline, minus the square-crop constraint.',
          analogy:
            'A quick voice note versus a carefully edited podcast episode — both use a microphone, but one is meant to be dashed off in the moment. Story capture is LocalInsta\'s "quick voice note" — camera-first, minimal friction, no square-crop ceremony.',
          theory:
            'Unlike Module 5\'s `CreatePostScreen`, a story capture screen defaults straight to `ImageSource.camera` (still offering a gallery fallback via a secondary button, not a modal choice every time) and **skips the square crop** — stories are traditionally full-height/portrait, matching a phone\'s natural camera aspect ratio, so `cropToSquare` is deliberately not called here. Compression (Module 4\'s `compressForUpload`) still applies unchanged — the same free-tier-protection logic matters just as much for temporary content.\n\n`StoriesRepository.createStory({required String imageUrl})` inserts into `stories` exactly like `PostsRepository.createPost` inserts into `posts` — the same insert-then-select-single pattern from Module 5, reused directly.',
          whyItMatters:
            'This topic is a deliberate exercise in recognising which parts of an established pipeline (Module 4\'s upload plumbing) transfer directly, and which specific product decisions (square crop) do not — copy-pasting a pipeline wholesale without questioning each piece is a common source of subtly wrong behaviour.',
          steps: [
            'Build `CreateStoryScreen`, defaulting to `ImageSource.camera` on open, with a secondary "choose from gallery" affordance.',
            'Skip the crop step entirely — pass the picked image straight to `compressForUpload`.',
            'Upload to the `stories` bucket using the same `buildUploadPath` + `StorageRepository.uploadImageBytes` pattern from Module 4.',
            'Call `StoriesRepository.createStory(imageUrl: url)`.',
            'On success, pop back to the feed and confirm the story ring (next topic) reflects the new story immediately.',
          ],
          code: `class StoriesRepository {
  StoriesRepository({SupabaseClient? client}) : _client = client ?? Supabase.instance.client;
  final SupabaseClient _client;

  Future<void> createStory({required String imageUrl}) async {
    await _client.from('stories').insert({
      'user_id': _client.auth.currentUser!.id,
      'image_url': imageUrl,
    });
  }

  Future<List<Map<String, dynamic>>> fetchActiveStoriesGroupedByUser() async {
    // expires_at filter here is a query-time convenience — the real
    // cleanup happens server-side, covered in the next section.
    final rows = await _client
        .from('stories')
        .select('*, profiles(username, avatar_url)')
        .gt('expires_at', DateTime.now().toIso8601String())
        .order('created_at');
    return (rows as List).cast<Map<String, dynamic>>();
  }
}`,
          pitfalls: [
            '**Reusing `cropToSquare` out of habit.** Forces a story into the wrong aspect ratio, immediately looking out of place compared to every real Instagram-style story. Fix: deliberately skip cropping for stories.',
            '**Skipping compression "since stories are temporary anyway".** Temporary does not mean free — every uploaded byte still counts against the same free-tier storage/bandwidth quotas from Module 4, for the 24 hours the story is live. Fix: compress stories exactly as diligently as posts.',
            '**Not offering any gallery fallback at all.** A user without a working camera (or wanting to share an existing photo as a story) is stuck. Fix: camera-first, with an easy secondary path to the gallery.',
            '**Filtering `expires_at` client-side as the *only* mechanism keeping expired stories from appearing.** Works for display, but does nothing about the underlying Storage files and rows piling up forever. Fix: this is exactly why the next section builds a real server-side cleanup job.',
          ],
          tryIt:
            'Capture and upload a real test story, then confirm it appears correctly (full portrait aspect ratio, no square crop) both in the Storage dashboard and via `fetchActiveStoriesGroupedByUser()`.',
          takeaway: 'Reuse a pipeline\'s genuinely-shared parts (compression, upload, path convention) but question every product-specific step (cropping) before assuming it transfers.',
        },
        {
          id: 'm7-t3',
          title: 'The story ring on the feed header',
          explain:
            'A horizontal scroll of circular avatars at the top of the feed — a coloured ring for unseen stories, a plain grey ring once viewed.',
          analogy:
            'A row of unopened versus already-opened letters in a mailbox — the same physical shape, but a small visual cue (a coloured edge, a torn seal) instantly tells you which ones still need your attention.',
          theory:
            'The story ring is a `ListView.builder(scrollDirection: Axis.horizontal, ...)` (Module 0\'s pattern, just rotated) of `StoryAvatar` widgets, one per user with at least one active (non-expired) story, grouped by `user_id` from `fetchActiveStoriesGroupedByUser()`. Each avatar wraps `AvatarImage` (Module 4) in a `CustomPaint`-drawn or simply a coloured `Container` border — a gradient/orange ring for "has unseen stories", plain grey for "already viewed all of this user\'s current stories".\n\n"Seen" state is tracked locally (a `Set<String>` of viewed story ids, persisted to `shared_preferences` for simplicity at this course\'s scope) rather than a server-side `story_views` table — a deliberate scope decision: tracking exactly *who* viewed *your* story (a real Instagram feature) is a reasonable stretch extension, not required for LocalInsta\'s core build.',
          whyItMatters:
            'The seen/unseen ring is one of those small visual details that makes a photo-sharing app instantly feel familiar and "real" to anyone who has used Instagram — disproportionately high visual payoff for the moderate implementation effort.',
          steps: [
            'Group active stories by `user_id` client-side after fetching (or write a small SQL `distinct on` variant if preferred).',
            'Build `StoryAvatar(profile, hasUnseen)` with a coloured vs grey ring based on local seen-state.',
            'Track seen story ids in a `Set<String>` inside a `StoriesState` `ChangeNotifier`, persisted via `shared_preferences`.',
            'Render the horizontal `ListView.builder` at the very top of the feed screen, above the post list.',
            'Tapping an avatar opens the full-screen story viewer (next topic), passing that user\'s story list.',
          ],
          code: `Widget storyAvatar(Profile profile, bool hasUnseen) {
  return Padding(
    padding: const EdgeInsets.symmetric(horizontal: 6),
    child: Column(
      children: [
        Container(
          padding: const EdgeInsets.all(2.5),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: hasUnseen ? const Color(0xFFE85A2A) : Colors.grey.shade300,
              width: 2.5,
            ),
          ),
          child: AvatarImage(url: profile.avatarUrl, radius: 28),
        ),
        const SizedBox(height: 4),
        SizedBox(
          width: 64,
          child: Text(profile.username, maxLines: 1, overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 11), textAlign: TextAlign.center),
        ),
      ],
    ),
  );
}

// The horizontal story rail
SizedBox(
  height: 96,
  child: ListView.builder(
    scrollDirection: Axis.horizontal,
    itemCount: storyGroups.length,
    itemBuilder: (context, i) => GestureDetector(
      onTap: () => openStoryViewer(context, storyGroups[i]),
      child: storyAvatar(storyGroups[i].profile, storyGroups[i].hasUnseen),
    ),
  ),
)`,
          pitfalls: [
            '**Building a full `story_views` table for a course-scope feature that does not strictly need it.** A reasonable stretch extension, but scope-inappropriate as a required core feature — local seen-state is the right-sized solution here. Fix: match implementation weight to the feature\'s actual required depth.',
            '**Losing seen-state entirely on app restart** (in-memory only, no persistence). Every story looks "new" again after closing and reopening the app, which is mildly annoying. Fix: persist the seen-id set via `shared_preferences`, a lightweight, appropriate choice.',
            '**Not filtering out the current user\'s own stories from this rail, or not giving them a special "your story" first position.** A reasonable polish detail — real Instagram-style apps show "Your Story" first with a "+" affordance, distinct from other users\' rings. Worth adding as a natural refinement.',
            '**Forgetting `ListView.builder` for the horizontal rail too, defaulting to a plain `Row` for "just a few avatars".** With enough active stories, the same performance lesson from Module 0 applies regardless of scroll axis. Fix: `.builder` for any horizontally-scrolling list too.',
          ],
          tryIt:
            'Create a few test stories from two different seeded accounts, confirm both show up as coloured rings in the rail, tap one, then return to the feed and confirm its ring is now grey while the other remains coloured.',
          takeaway: 'A locally-tracked seen-state set, persisted simply, is the right-sized solution for LocalInsta\'s scope — a full view-tracking table is a reasonable but unnecessary stretch.',
        },
        {
          id: 'm7-t4',
          title: 'The full-screen story viewer',
          explain:
            'Tap-to-advance, tap-to-go-back, auto-advance after a few seconds, and a segmented progress bar across the top — the exact interaction language every Instagram-style story viewer shares.',
          analogy:
            'Flipping through a stack of photo prints held up to a light box, one after another — tap the right edge to move forward, the left edge to go back, and if you just wait, the next one comes up on its own after a moment.',
          theory:
            '`StoryViewerScreen(stories: List<Story>, startIndex: int)` shows one story\'s image full-screen, with a **segmented progress bar** (one thin bar per story in the current user\'s set, the active one animating from empty to full over a fixed duration — typically 5 seconds) driven by a single `AnimationController`. `GestureDetector` zones split the screen: tapping the right third advances to the next story (or closes the viewer if it was the last), tapping the left third goes back, and the controller\'s completion callback auto-advances exactly like a tap-right would.\n\nMarking a story "seen" (updating the local `Set<String>` from the previous topic) happens the instant a story\'s progress bar starts animating, not just on explicit dismissal — matching the real-world expectation that simply viewing a story, even briefly, counts as having seen it.',
          whyItMatters:
            'This is a genuinely satisfying animation-and-gesture topic — assembling `AnimationController`, `GestureDetector` zones, and a segmented progress indicator into one cohesive, recognisable interaction is real, transferable Flutter skill well beyond just this feature.',
          steps: [
            'Build `StoryViewerScreen` with a `PageController`-free approach: a single `AnimationController` (5 second duration) driving both the current segment\'s progress and the auto-advance trigger.',
            'Render the segmented progress bar as a `Row` of thin `LinearProgressIndicator`-style bars — completed segments full, current segment animated, future segments empty.',
            'Split the screen into left/right `GestureDetector` zones (roughly 30%/70% width) for back/forward taps.',
            'On the controller\'s `addStatusListener` completion, advance to the next story or `Navigator.pop` if none remain.',
            'Mark each story "seen" (update the local set, from the previous topic\'s `StoriesState`) the moment its segment starts animating.',
          ],
          code: `class StoryViewerScreen extends StatefulWidget {
  const StoryViewerScreen({super.key, required this.stories, required this.startIndex});
  final List<Story> stories;
  final int startIndex;
  @override
  State<StoryViewerScreen> createState() => _StoryViewerScreenState();
}

class _StoryViewerScreenState extends State<StoryViewerScreen>
    with SingleTickerProviderStateMixin {
  late int _index = widget.startIndex;
  late final _controller = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 5),
  )..addStatusListener((status) {
      if (status == AnimationStatus.completed) _advance();
    });

  @override
  void initState() {
    super.initState();
    _startCurrent();
  }

  void _startCurrent() {
    context.read<StoriesState>().markSeen(widget.stories[_index].id);
    _controller.forward(from: 0);
  }

  void _advance() {
    if (_index >= widget.stories.length - 1) {
      Navigator.pop(context);
      return;
    }
    setState(() => _index++);
    _startCurrent();
  }

  void _goBack() {
    if (_index == 0) return;
    setState(() => _index--);
    _startCurrent();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final story = widget.stories[_index];
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          Center(child: CachedNetworkImage(imageUrl: story.imageUrl, fit: BoxFit.contain)),
          Positioned(
            top: 40, left: 8, right: 8,
            child: Row(
              children: List.generate(widget.stories.length, (i) => Expanded(
                child: Container(
                  height: 2,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  color: i < _index
                      ? Colors.white
                      : i == _index
                          ? Colors.white.withOpacity(0.4)
                          : Colors.white.withOpacity(0.2),
                  child: i == _index
                      ? AnimatedBuilder(
                          animation: _controller,
                          builder: (_, __) => FractionallySizedBox(
                            alignment: Alignment.centerLeft,
                            widthFactor: _controller.value,
                            child: Container(color: Colors.white),
                          ),
                        )
                      : null,
                ),
              )),
            ),
          ),
          Row(
            children: [
              Expanded(flex: 3, child: GestureDetector(onTap: _goBack, behavior: HitTestBehavior.translucent)),
              Expanded(flex: 7, child: GestureDetector(onTap: _advance, behavior: HitTestBehavior.translucent)),
            ],
          ),
        ],
      ),
    );
  }
}`,
          pitfalls: [
            '**Not disposing the `AnimationController`.** Leaks memory and can trigger the status listener on a disposed widget. Fix: always dispose, exactly as every other `AnimationController` topic in this course has emphasised.',
            '**Using `onTap` on the whole screen instead of split left/right zones.** Loses the "go back" affordance entirely, breaking a well-established interaction convention users already know. Fix: two distinct `GestureDetector` zones.',
            '**Forgetting `HitTestBehavior.translucent` on the tap zones.** Without it, taps on areas with no visible child (the transparent gesture zones layered over the image) may not register. Fix: always set this explicitly on invisible-but-tappable overlay zones.',
            '**Marking a story "seen" only on full completion instead of on start.** A user who taps through quickly without waiting for the full 5 seconds would see it marked unseen again next time, contradicting the real-world expectation. Fix: mark seen the instant a story begins showing.',
          ],
          tryIt:
            'Open a story set with three stories, confirm the progress bar animates and auto-advances correctly, tap the left zone to go back a story, tap the right zone to skip forward, and confirm the viewer closes cleanly after the last story completes.',
          takeaway: 'One AnimationController, two gesture zones, and a segmented progress row is the entire recipe for the classic story-viewer interaction.',
        },
      ],
    },
    {
      id: 'm7-s2',
      title: 'Expiring stories for real: pg_cron',
      topics: [
        {
          id: 'm7-t5',
          title: 'Why display-time filtering is not enough',
          explain:
            'Filtering `expires_at > now()` at query time hides expired stories from the UI, but the rows and their Storage files remain forever — a genuine, separate cleanup job is needed.',
          analogy:
            'Sweeping dust under a rug hides it from view, but it is still very much there, slowly piling up — filtering expired stories out of a query is exactly that sweep, not an actual cleanup.',
          theory:
            'Module 7\'s earlier `fetchActiveStoriesGroupedByUser()` query already filters `.gt(\'expires_at\', now)` — this correctly controls what a *user* ever sees, but does nothing about the underlying data: expired story rows stay in the `stories` table forever, and their corresponding files stay in the `stories` Storage bucket forever, both silently consuming the free tier\'s 500MB database and 1GB storage quotas (Modules 3 and 4) for content nobody can ever see again.\n\nA **genuine cleanup** needs a process that runs periodically, finds rows where `expires_at < now()`, deletes both the Storage files and the database rows, and does this **without a user\'s app needing to be open** — this is precisely the kind of "something must run on a schedule, in the background, forever" requirement that Firebase would solve with a Cloud Function (requiring the Blaze plan and a card, per Module 1\'s framing) but Supabase can solve with `pg_cron`, a genuinely free Postgres extension.',
          whyItMatters:
            'This topic explicitly names the gap between "looks correct in the UI" and "is actually correct in the data" — a distinction worth internalising broadly, not just for stories.',
          steps: [
            'Run `select expires_at, now(), expires_at < now() as is_expired from public.stories;` and confirm some test rows would already read `is_expired = true` if you wait or backdate a test row.',
            'Manually backdate one test story\'s `created_at`/`expires_at` to the past via a direct `update` in SQL Editor.',
            'Confirm `fetchActiveStoriesGroupedByUser()` correctly excludes it from the app\'s display.',
            'Confirm the row (and its Storage file) still very much exist — `select * from stories where id = \'<that id>\';` still returns it.',
            'This gap is exactly what the next topic\'s `pg_cron` job closes.',
          ],
          code: `-- Manually simulate an expired story for testing the gap
update public.stories
set created_at = now() - interval '25 hours',
    expires_at = now() - interval '1 hour'
where id = '<a test story id>';

-- The display query correctly hides it:
select count(*) from public.stories where expires_at > now(); -- excludes it

-- But it is still fully present in the table:
select count(*) from public.stories where id = '<that same id>'; -- still 1`,
          pitfalls: [
            '**Believing display-time filtering is "good enough" because the UI looks correct.** The data itself is not actually clean, and free-tier quota consumption is real regardless of what any single query happens to show. Fix: always distinguish "hidden from view" from "actually removed".',
            '**Assuming Supabase automatically expires rows based on a `expires_at` column.** Postgres has no built-in row-expiry mechanism — `expires_at` is just a regular timestamp column until something explicitly acts on it. Fix: a scheduled job (next topic) is required.',
            '**Forgetting Storage files are separate from database rows entirely.** Deleting a `stories` row does **not** automatically delete its corresponding file in the `stories` bucket — these are two different systems that must both be cleaned up. Fix: the next topic\'s job explicitly handles both.',
            '**Not testing this gap deliberately, only noticing it once free-tier storage usage unexpectedly climbs.** Fix: the manual backdating test in this topic\'s steps is worth doing now, deliberately, rather than discovering the gap by surprise later.',
          ],
          tryIt:
            'Run the backdating test above yourself, confirm the app-facing query correctly hides the expired story while the raw row and its Storage file both remain fully present — internalise this gap before building the fix.',
          takeaway: 'A query filter controls what users see; it does nothing to what the database actually stores — those are two genuinely separate problems.',
        },
        {
          id: 'm7-t6',
          title: 'The pg_cron cleanup job',
          explain:
            '`pg_cron`, a free Postgres extension available on Supabase, schedules a SQL function to run periodically — no Blaze plan, no card, no external scheduler needed.',
          analogy:
            'A temple\'s bell-ringer who shows up at the same time every single day without being individually asked — `pg_cron` is that reliable, self-triggering bell-ringer, living inside the database itself rather than requiring a separate external service to remember to call it.',
          theory:
            '`pg_cron` is a genuinely free Postgres extension, enabled per-project via **Database → Extensions** in the Supabase dashboard (a one-click toggle, no billing plan change required) or via `create extension pg_cron;` in SQL Editor. Once enabled, `cron.schedule(\'job-name\', \'*/30 * * * *\', $$ ... $$)` registers a SQL statement (or block) to run on a standard cron schedule — here, every 30 minutes is a reasonable cadence for cleaning up 24-hour-lived content.\n\nThe cleanup function itself needs to do two things: delete expired rows from `stories`, **and** delete their corresponding Storage objects — Storage objects are just rows in `storage.objects` (Module 4), so a `delete from storage.objects where bucket_id = \'stories\' and name like (expired_user_id || \'/%\')` pattern, run just before deleting the `stories` rows themselves (while you can still read which files belong to which expired story), closes the loop completely.',
          whyItMatters:
            'This is the single clearest example in the entire course of Supabase\'s free tier doing something Firebase\'s free tier structurally cannot — a genuinely scheduled, recurring, server-side job with zero billing plan required. It directly makes good on the course\'s "free tier, no card, ever" promise for a real, non-trivial feature.',
          steps: [
            'Enable the `pg_cron` extension via **Database → Extensions** (search "pg_cron", toggle on) or `create extension if not exists pg_cron;`.',
            'Write `cleanup_expired_stories()` as a SQL function: first delete matching `storage.objects` rows, then delete the expired `stories` rows.',
            'Register it with `select cron.schedule(\'cleanup-expired-stories\', \'*/30 * * * *\', \'select public.cleanup_expired_stories();\');`.',
            'Manually invoke the function once (`select public.cleanup_expired_stories();`) against your earlier backdated test story and confirm both the row and its Storage file are genuinely gone.',
            'Check `select * from cron.job;` to confirm the schedule is registered, and `select * from cron.job_run_details order by start_time desc limit 5;` after waiting for one real scheduled run to confirm it actually executed.',
          ],
          code: `create extension if not exists pg_cron;

create or replace function public.cleanup_expired_stories()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete the Storage files for expired stories FIRST, while we can
  -- still identify exactly which files belong to which expiring rows.
  delete from storage.objects
  where bucket_id = 'stories'
    and name in (
      select split_part(image_url, '/stories/', 2)
      from public.stories
      where expires_at < now()
    );

  -- Then delete the now-orphaned database rows themselves.
  delete from public.stories where expires_at < now();
end;
$$;

-- Run every 30 minutes, forever, entirely server-side
select cron.schedule(
  'cleanup-expired-stories',
  '*/30 * * * *',
  'select public.cleanup_expired_stories();'
);

-- Verify it is registered
select jobid, schedule, jobname, active from cron.job;

-- Verify it actually ran (check a while after scheduling)
select * from cron.job_run_details order by start_time desc limit 5;`,
          pitfalls: [
            '**Deleting the `stories` rows before deleting their Storage files.** Once the row is gone, you no longer have a clean way to know which files belonged to it — always clean up files first, rows second, when the two are linked only by data that is about to disappear.',
            '**Forgetting `security definer` on the cleanup function.** The scheduled job runs without a normal user session, and needs elevated permission to delete across all users\' stories, not just "its own" (the concept does not even apply to a scheduled job). Fix: mark it `security definer`, exactly like Module 2\'s `handle_new_user`.',
            '**Scheduling too infrequently (e.g. once a day).** Expired content lingers, visible in the raw data, for up to nearly a full day past its intended lifetime. Fix: a 15-30 minute cadence keeps the gap small without being wastefully frequent.',
            '**Never actually verifying the job ran, trusting the `cron.schedule` call alone.** A typo in the cron expression or function name can silently mean nothing ever executes. Fix: always check `cron.job_run_details` after enough time has passed for at least one run.',
          ],
          tryIt:
            'Run the full setup, manually invoke `cleanup_expired_stories()` once against your earlier backdated test story, and confirm via SQL Editor that both the `stories` row and its `storage.objects` row are genuinely gone — not just filtered from a query, but actually deleted.',
          takeaway: 'pg_cron gives you a genuinely free, server-side scheduled job — the exact capability that would require Firebase\'s paid Blaze plan, at zero cost and no card, ever.',
        },
        {
          id: 'm7-t7',
          title: 'Belt and suspenders: keep the client-side filter too',
          explain:
            'Even with a working cleanup job, the app still filters `expires_at > now()` at query time — because a job running every 30 minutes always leaves a small window where an expired story is technically still in the table.',
          analogy:
            'A restaurant both takes yesterday\'s unsold bread off the shelf each morning *and* still checks the date on anything a customer picks up before ringing it through — one layer catches the routine case, the other layer catches the gap between routine sweeps.',
          theory:
            'Because `pg_cron` runs on a schedule (every 30 minutes in the previous topic), there is an inherent window — up to 30 minutes — where a story has technically passed `expires_at` but has not yet been physically deleted. The client-side `.gt(\'expires_at\', now)` filter from earlier this module is what closes *that* gap instantly, at query time, regardless of where the cleanup job currently stands in its cycle.\n\nThis is a deliberate **defense-in-depth** pattern, structurally similar to Module 3\'s "client validates for UX, database enforces for real" pairing: the display filter gives instant, always-correct UI behaviour; the cron job gives eventual, actual data cleanliness. Neither alone is sufficient — the filter alone leaves data lingering forever (this section\'s first topic); the cron job alone leaves up to a 30-minute window of technically-expired-but-still-displayed content if you removed the filter.',
          whyItMatters:
            'Recognising when a problem genuinely needs two complementary layers — rather than assuming one "fixes" it — is a mature engineering instinct worth calling out explicitly, not just implementing implicitly.',
          steps: [
            'Confirm `fetchActiveStoriesGroupedByUser()`\'s `.gt(\'expires_at\', now)` filter is still in place — do not remove it now that the cron job exists.',
            'Reason through the timeline explicitly: a story expiring at 10:14, with the cron job scheduled at :00/:30, is invisible to users (filter) from 10:14 onward, but not physically deleted until the 10:30 run.',
            'Write a short note in your README explicitly describing this two-layer design and why both layers are necessary.',
            'Consider (as a discussion point, not required extra work) what cadence trade-off a real production app might choose — more frequent cron runs cost more compute; the display filter cost is negligible regardless of cadence.',
          ],
          code: `-- Layer 1 (instant, every query): the client-side filter, unchanged
-- from earlier this module:
select * from public.stories
where expires_at > now()
order by created_at;

-- Layer 2 (eventual, every 30 min): the pg_cron job from the previous
-- topic, physically removing rows and files.
--
-- Together: users NEVER see expired content (layer 1 is instant),
-- and the database NEVER accumulates it forever (layer 2 eventually
-- catches up). Neither layer alone is sufficient.`,
          pitfalls: [
            '**Removing the display filter now that a cleanup job exists, reasoning "the job handles it".** Reintroduces up to a 30-minute window of expired content still being shown to users. Fix: keep both layers — they solve genuinely different halves of the problem.',
            '**Scheduling the cron job extremely frequently (e.g. every minute) to try to make the display filter "unnecessary".** Still never actually closes the gap to zero, and wastes compute for no real benefit given the display filter already handles the UI-correctness half perfectly. Fix: a modest cadence (15-30 min) for the job; let the filter handle instant correctness.',
            '**Not documenting this two-layer design anywhere.** A future maintainer (including future-you) might "simplify" by removing one layer, not realising both are load-bearing. Fix: the README note in this topic\'s steps exists specifically to prevent that.',
            '**Applying this exact two-layer thinking nowhere else in the app, treating it as a one-off story-specific trick.** The same pattern (instant client-side correctness + eventual server-side cleanup) generalizes to plenty of other "temporary or time-bound data" problems. Fix: recognise it as a general technique.',
          ],
          tryIt:
            'Write the two-sentence README note described in the steps, in your own words, explicitly naming both layers and the specific gap each one closes that the other does not.',
          takeaway: 'Instant client-side filtering and eventual server-side cleanup solve two different halves of the same problem — keep both, understand why neither alone suffices.',
        },
      ],
    },
    {
      id: 'm7-s3',
      title: 'In-app notifications',
      topics: [
        {
          id: 'm7-t8',
          title: 'The notifications table',
          explain:
            'One row per notification-worthy event — a like, a comment, a follow — with a `type`, the `actor` who caused it, the `recipient` who should see it, and a `read` flag.',
          analogy:
            'A hotel\'s message-slip system at the front desk: each slip names who left the message, who it is for, what kind of message it is, and whether the recipient has picked it up yet — one simple, uniform shape covering every kind of message the hotel might need to hand over.',
          theory:
            '`notifications` has `id`, `recipient_id uuid not null references profiles(id)` (who should see this), `actor_id uuid not null references profiles(id)` (who caused it), `type text not null check (type in (\'like\', \'comment\', \'follow\'))` (a constrained enum-like column — Module 3\'s check-constraint technique, reused), `post_id uuid references posts(id)` (nullable — a follow notification has no related post), `read boolean not null default false`, `created_at timestamptz not null default now()`.\n\nRLS here is deliberately **stricter** than any table so far: a user should only ever read notifications where `recipient_id = auth.uid()` — you should never be able to see notifications meant for someone else, unlike the broadly-public `select` policies on `profiles`/`posts`. Insert policy: notifications are only ever created by triggers (next topic), never directly by a client — meaning the `insert` policy can be **omitted entirely** (default-deny, from Module 3) since only `security definer` trigger functions, which bypass RLS, will ever write to this table.',
          whyItMatters:
            'This is the first table in the course where the "obviously public" default from `profiles`/`posts` genuinely does not apply — a good, concrete moment to practice deliberately reasoning about a table\'s correct privacy model from first principles rather than pattern-matching the previous table.',
          steps: [
            'Write `create table public.notifications` with the schema above.',
            'Enable RLS, write **only** a `select` policy: `to authenticated using (auth.uid() = recipient_id)`.',
            'Deliberately write **no** insert/update/delete policies — confirm this means even the recipient cannot manually insert or edit their own notifications, only the (upcoming) trigger functions can, via `security definer`.',
            'Add a `read` update policy scoped narrowly: `to authenticated using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id)` — this is the **one** mutation a recipient should be allowed: marking their own notification as read.',
            'Test via impersonation (Module 3\'s technique) that a user genuinely cannot read another user\'s notifications.',
          ],
          code: `create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'follow')),
  post_id uuid references public.posts(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_recipient on public.notifications(recipient_id, created_at desc);

alter table public.notifications enable row level security;

-- Only ever read your own notifications
create policy "users read their own notifications"
on public.notifications for select
to authenticated
using (auth.uid() = recipient_id);

-- The ONE mutation a recipient may make: marking their own as read
create policy "users mark their own notifications read"
on public.notifications for update
to authenticated
using (auth.uid() = recipient_id)
with check (auth.uid() = recipient_id);

-- Deliberately NO insert policy — only security definer triggers (next
-- topic) may ever create a notification row. This is default-deny at work.`,
          pitfalls: [
            '**Adding a broad `insert` policy "so the app can create notifications directly from Flutter".** Would let any client fabricate fake notifications appearing to come from anyone, about anything. Fix: notifications are only ever trigger-generated, server-side — no client insert path needed or wanted.',
            '**Making the `select` policy public (`to public using (true)`) by pattern-matching `profiles`/`posts`.** A serious privacy leak — every user\'s notifications would be readable by anyone. Fix: always reason about each table\'s correct privacy model independently; do not assume the previous table\'s pattern transfers.',
            '**Allowing an `update` on any column, not just `read`.** A recipient should be able to mark their own notification read, but should not be able to rewrite its `type` or `actor_id` to fabricate a different event. Fix: this course\'s scope treats the whole-row `using`/`with check` as adequate; a stricter production setup might use a Postgres function limiting the update to only the `read` column specifically.',
            '**Forgetting the composite index on `(recipient_id, created_at desc)`.** The notifications screen\'s primary query — "my notifications, newest first" — needs exactly this index to stay fast as the table grows. Fix: index the real query shape, per Module 3\'s indexing lesson.',
          ],
          tryIt:
            'Using Module 3\'s impersonation technique, confirm that user A genuinely cannot `select` from `notifications` where `recipient_id` belongs to user B — even though both users can freely read each other\'s public profiles and posts.',
          takeaway: 'Not every table is public by default — notifications need a genuinely private, recipient-scoped select policy, reasoned from first principles rather than copied from posts/profiles.',
        },
        {
          id: 'm7-t9',
          title: 'Trigger-generated notifications',
          explain:
            'A like, a comment, or a follow automatically creates a matching notification row via a database trigger — the same "atomic, impossible-to-forget" pattern from Module 2\'s auto-profile trigger.',
          analogy:
            'A hotel\'s automatic wake-up call system: the front desk does not have to remember to personally call every guest — the system itself triggers the call the instant the requested time arrives, every time, without fail.',
          theory:
            'An `after insert` trigger on `likes` calls a function that inserts a matching `notifications` row (`recipient_id` = the post\'s owner, `actor_id` = the person who liked it, `type` = `\'like\'`, `post_id` = the liked post) — but **only if** the actor is not liking their own post (a self-like should never generate a "someone liked your post" notification about yourself). The same pattern repeats for `comments` (`after insert`) and `follows` (`after insert`), each with its own small trigger function, each `security definer` so it can write into the recipient-locked `notifications` table regardless of who is performing the underlying action.\n\nThis is the exact same "database-enforced, atomic, impossible to skip" reasoning from Module 2\'s `handle_new_user` trigger — a client-side "also insert a notification after a successful like" approach would risk exactly the same crash/race/forgotten-code-path problems Module 2 explicitly avoided by using a trigger instead.',
          whyItMatters:
            'This topic ties together nearly every trigger technique from Modules 2, 3, and 6 (auto-provisioning, counter maintenance, self-action exclusion) into one final, satisfying application — and should feel like assembly of known parts, not new territory.',
          steps: [
            'Write `notify_on_like()`, an `after insert` trigger function on `likes`, looking up the post\'s `user_id` and inserting a notification — skipped entirely if that equals `new.user_id` (a self-like).',
            'Write `notify_on_comment()`, structurally identical, on `comments`.',
            'Write `notify_on_follow()` on `follows`, using `new.following_id` as recipient and `new.follower_id` as actor directly (no self-check needed — Module 3\'s `check (follower_id <> following_id)` constraint already makes a self-follow impossible).',
            'Attach all three as triggers.',
            'Test: like a test post from a different account, confirm a notification row appears for the post\'s owner; like your own post, confirm no notification is created.',
          ],
          code: `create or replace function public.notify_on_like()
returns trigger language plpgsql security definer as $$
declare
  post_owner_id uuid;
begin
  select user_id into post_owner_id from public.posts where id = new.post_id;
  if post_owner_id is distinct from new.user_id then -- skip self-likes
    insert into public.notifications (recipient_id, actor_id, type, post_id)
    values (post_owner_id, new.user_id, 'like', new.post_id);
  end if;
  return new;
end;
$$;

create trigger on_like_notify
  after insert on public.likes
  for each row execute function public.notify_on_like();

create or replace function public.notify_on_comment()
returns trigger language plpgsql security definer as $$
declare
  post_owner_id uuid;
begin
  select user_id into post_owner_id from public.posts where id = new.post_id;
  if post_owner_id is distinct from new.user_id then
    insert into public.notifications (recipient_id, actor_id, type, post_id)
    values (post_owner_id, new.user_id, 'comment', new.post_id);
  end if;
  return new;
end;
$$;

create trigger on_comment_notify
  after insert on public.comments
  for each row execute function public.notify_on_comment();

create or replace function public.notify_on_follow()
returns trigger language plpgsql security definer as $$
begin
  -- No self-check needed — follows already forbids self-follow (Module 3)
  insert into public.notifications (recipient_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');
  return new;
end;
$$;

create trigger on_follow_notify
  after insert on public.follows
  for each row execute function public.notify_on_follow();`,
          pitfalls: [
            '**Forgetting the self-action exclusion on likes/comments.** Every time you like or comment on your own post, you would receive a pointless notification about your own action. Fix: always check `post_owner_id is distinct from new.user_id` before inserting.',
            '**Forgetting `security definer` on any of the three trigger functions.** They need to write into `notifications` on behalf of a recipient who is not the currently-authenticated actor — exactly the kind of elevated-privilege, narrowly-scoped write Module 2\'s `handle_new_user` established the pattern for.',
            '**Creating notifications from Flutter after a successful like/comment/follow call instead of via triggers.** Reopens the exact "what if the app crashes between the two calls" gap Module 2 explicitly warned against for profile creation. Fix: triggers, always, for this class of "must happen atomically with the real event" logic.',
            '**Using `=` instead of `is distinct from` for the self-action check.** `null = null` evaluates to `null` (not true) in SQL, which can behave unexpectedly in edge cases; `is distinct from` handles null comparisons correctly and is the safer idiom. Fix: prefer `is distinct from` for this kind of comparison in trigger logic.',
          ],
          tryIt:
            'From a second test account, like and comment on a test post owned by your first account, then follow that first account — confirm exactly three notification rows appear, all correctly attributed. Then like your own post from your first account and confirm zero notifications are created.',
          takeaway: 'Notification creation is another instance of "atomic, database-enforced, impossible to skip" — the same trigger reasoning from Module 2, now applied a third time with full confidence.',
        },
        {
          id: 'm7-t10',
          title: 'The notifications screen with Realtime',
          explain:
            'A chronological list of notifications, each rendered with type-specific copy ("X liked your post", "Y started following you"), live-updating via the same Postgres Changes technique from Module 5.',
          analogy:
            'A village notice-board that a runner updates the instant news arrives, rather than a board that only gets refreshed once a day — the notifications screen should feel exactly that immediate.',
          theory:
            '`fetchNotifications()` queries `notifications` filtered to the current user (RLS already enforces this even without an explicit filter, but an explicit `.eq(\'recipient_id\', currentUserId)` makes the query\'s intent clear to any reader) joined with the `actor`\'s profile data, ordered newest-first. Each row renders type-specific copy: `\'\${actor.username} liked your post\'`, `\'\${actor.username} commented: "\${commentPreview}"\'`, `\'\${actor.username} started following you\'` — tapping a like/comment notification opens that post\'s detail screen; tapping a follow notification opens the actor\'s profile.\n\nA filtered Realtime subscription (`event: PostgresChangeEvent.insert, table: \'notifications\', filter: recipient_id = currentUserId`) — the exact same technique from Module 5\'s comments — prepends new notifications live as they arrive, so a user actively viewing this screen sees a new like or follow appear without any manual refresh.',
          whyItMatters:
            'This screen is a genuine, satisfying capstone of the notification system — every trigger, every RLS policy, and the Realtime technique from Module 5 all converge here into a real, live, working feature.',
          steps: [
            'Add `fetchNotifications()` to a `NotificationsRepository`, joining `actor` profile data.',
            'Build `NotificationsScreen` rendering type-branched copy per row, with tap targets routing to the right destination (post detail vs profile).',
            'Add a filtered Realtime subscription (mirroring Module 5\'s comments pattern) prepending new notifications live.',
            'Remember to `alter publication supabase_realtime add table public.notifications;`.',
            'Test across two devices: trigger a like/comment/follow from device B while device A has the notifications screen open, and confirm it appears live.',
          ],
          code: `Future<List<AppNotification>> fetchNotifications() async {
  final userId = supabase.auth.currentUser!.id;
  final rows = await supabase
      .from('notifications')
      .select('*, actor:profiles!notifications_actor_id_fkey(username, avatar_url)')
      .eq('recipient_id', userId) // explicit, even though RLS already enforces it
      .order('created_at', ascending: false);
  return (rows as List).map((r) => AppNotification.fromMap(r)).toList();
}

String notificationCopy(AppNotification n) => switch (n.type) {
  'like' => '\${n.actor.username} liked your post',
  'comment' => '\${n.actor.username} commented on your post',
  'follow' => '\${n.actor.username} started following you',
  _ => '\${n.actor.username} interacted with your content',
};

-- alter publication supabase_realtime add table public.notifications;`,
          pitfalls: [
            '**Relying only on RLS and skipping the explicit `.eq(\'recipient_id\', ...)` filter "since it is redundant".** Technically correct (RLS enforces it regardless), but an explicit filter makes the query self-documenting to any future reader, and is cheap to include. Fix: keep it for clarity even though RLS is the real guard.',
            '**Using the same `profiles!follows_...` disambiguation syntax incorrectly here.** `notifications` has two foreign keys to `profiles` too (`recipient_id`, `actor_id`) — the same Module 6 disambiguation technique applies, aliasing as `actor:profiles!notifications_actor_id_fkey(...)`. Fix: recognise and reapply the pattern, do not re-derive it from scratch.',
            '**Not branching tap destinations by notification type.** A follow notification has no `post_id` to open — tapping it should go to the actor\'s profile, not attempt to open a nonexistent post. Fix: branch navigation logic on `type`, exactly as copy is branched.',
            '**Forgetting the publication step for `notifications`, same as every other Realtime-enabled table this course has built.** Fix: keep a running checklist (Module 5 already suggested this) of every table added to `supabase_realtime`.',
          ],
          tryIt:
            'With two test accounts, open the notifications screen on account A\'s device, then like one of account A\'s posts from account B — confirm the notification appears live on account A\'s screen with correct, type-appropriate copy.',
          takeaway: 'The notifications screen is where triggers, RLS, disambiguated joins, and Realtime — four separate techniques from four different modules — all converge into one working feature.',
        },
        {
          id: 'm7-t11',
          title: 'The unread badge count',
          explain:
            'A small red badge on the Notifications tab showing the count of unread notifications, updating live and clearing when the screen is opened.',
          analogy:
            'The small red dot on a phone\'s messaging app icon — a single glance tells you something is waiting, without needing to open the app to check.',
          theory:
            '`fetchUnreadCount()` — `supabase.from(\'notifications\').select(\'id\').eq(\'recipient_id\', userId).eq(\'read\', false).count(CountOption.exact)` (or a lighter approach: fetch the count directly via a `count` query rather than fetching full rows) — feeds a small badge overlay on the bottom navigation\'s Notifications icon (Module 6\'s `HomeScaffold`). The same Realtime subscription from the previous topic can increment this count live as new notifications arrive, without a separate query.\n\nOpening the notifications screen should mark all currently-visible unread notifications as read — `supabase.from(\'notifications\').update({\'read\': true}).eq(\'recipient_id\', userId).eq(\'read\', false)`, protected by the narrow `read`-only update RLS policy from two topics ago — clearing the badge back to zero.',
          whyItMatters:
            'The unread badge is a small feature with outsized product value — it is the single strongest signal that pulls a user back into the app, and getting its count genuinely accurate (not just "roughly right") matters for trust in the feature.',
          steps: [
            'Add `fetchUnreadCount()` and `markAllAsRead()` to `NotificationsRepository`.',
            'Track the count in a small `NotificationsState` `ChangeNotifier`, fetched on app start (inside `HomeScaffold`\'s lifecycle) and incremented live by the Realtime subscription.',
            'Render a small red circular badge on the Notifications `BottomNavigationBarItem` icon when the count is greater than zero.',
            'Call `markAllAsRead()` when the Notifications tab is actually opened, resetting the local count to zero.',
            'Test: receive two notifications while the tab is not open, confirm the badge shows "2", open the tab, confirm the badge clears.',
          ],
          code: `class NotificationsState extends ChangeNotifier {
  int unreadCount = 0;

  Future<void> refreshUnreadCount() async {
    final userId = supabase.auth.currentUser!.id;
    final response = await supabase
        .from('notifications')
        .select('id')
        .eq('recipient_id', userId)
        .eq('read', false)
        .count(CountOption.exact);
    unreadCount = response.count;
    notifyListeners();
  }

  void incrementLocally() {
    unreadCount++;
    notifyListeners();
  }

  Future<void> markAllAsRead() async {
    final userId = supabase.auth.currentUser!.id;
    await supabase
        .from('notifications')
        .update({'read': true})
        .eq('recipient_id', userId)
        .eq('read', false);
    unreadCount = 0;
    notifyListeners();
  }
}

// Bottom nav icon with a badge overlay
Stack(
  clipBehavior: Clip.none,
  children: [
    const Icon(Icons.favorite_border),
    if (unreadCount > 0)
      Positioned(
        right: -6, top: -4,
        child: Container(
          padding: const EdgeInsets.all(3),
          decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
          child: Text('\$unreadCount', style: const TextStyle(color: Colors.white, fontSize: 9)),
        ),
      ),
  ],
)`,
          pitfalls: [
            '**Fetching every unread row just to count them client-side (`.select()` then `.length`).** Wastes bandwidth pulling full row data for a number you only need the count of. Fix: use a genuine count query (`.count(CountOption.exact)`), not a full row fetch.',
            '**Not clearing the badge until the user explicitly does something beyond just opening the tab.** Feels unresponsive — real apps clear the badge the moment the relevant screen is viewed. Fix: `markAllAsRead()` fires on tab open, not on some separate explicit action.',
            '**Letting the badge count drift out of sync with reality after extended use (e.g. never re-syncing with the true server count, only ever incrementing locally).** Fix: `refreshUnreadCount()` on app start/resume as a periodic correction, with `incrementLocally()` only as a fast, optimistic top-up between refreshes.',
            '**Showing a badge with an unbounded number (e.g. "247") instead of a sane cap.** Real apps typically cap the displayed number (e.g. "99+"). A reasonable, small polish detail worth adding.',
          ],
          tryIt:
            'From a second test account, generate two or three notifications for your first account while its Notifications tab is closed, confirm the badge shows the correct count, then open the tab and confirm the badge clears to zero.',
          takeaway: 'A genuine count query, not a full row fetch, plus clearing on tab-open — that is the entire recipe for a trustworthy unread badge.',
        },
      ],
    },
    {
      id: 'm7-s4',
      title: 'Optional: real push notifications',
      topics: [
        {
          id: 'm7-t12',
          title: 'Why in-app notifications are not the same as push',
          explain:
            'Everything built so far only works while LocalInsta is open — genuine push notifications, arriving even when the app is closed, need a different, external delivery mechanism.',
          analogy:
            'A notice board inside a shop only informs people who are already standing in the shop — a text message sent to their phone reaches them anywhere, whether they are in the shop or not. In-app notifications are the noticeboard; push notifications are the text message.',
          theory:
            'Everything built this module — the `notifications` table, triggers, Realtime subscription, unread badge — only ever reaches a device with LocalInsta **actively open and connected**. **Push notifications** (the kind that show up in a phone\'s system notification tray even when the app is fully closed) require an entirely separate delivery path: a message sent to Google\'s Firebase Cloud Messaging (FCM) or an equivalent push gateway, which routes it to the specific device via the OS\'s own background push infrastructure — something no ordinary app-level code can do on its own, closed-app or not.\n\nSupabase itself has no built-in push-notification service — triggering one requires either a Supabase Edge Function calling an external push provider\'s API, or a third-party push service with its own SDK. This module\'s final two topics cover exactly this, as an **optional** extension, deliberately kept separate from the core, required build.',
          whyItMatters:
            'Being explicit about this boundary — in-app notifications work today, real push is a genuinely separate, optional system — avoids the common confusion of assuming "I built a notifications table, so push notifications must already work."',
          steps: [
            'Close LocalInsta completely on a test device (swipe it away, not just background it).',
            'From a second account, like a post belonging to the closed app\'s account.',
            'Confirm: no system notification appears — because nothing is currently listening; the Realtime subscription only exists while the app is running.',
            'Reopen the app and confirm the notification is there, correctly, in the in-app list — the data was never lost, only its live delivery while closed.',
            'This gap is exactly what the next two topics address, as an optional module extension.',
          ],
          code: `-- Nothing to run — this topic is a deliberate conceptual checkpoint.
-- The gap demonstrated:
--   App open   -> Realtime subscription delivers the event live. Works today.
--   App closed -> No code is running on-device to receive anything.
--                 Real push notifications need OS-level delivery
--                 (FCM or equivalent), which is a genuinely separate system.`,
          pitfalls: [
            '**Assuming the `notifications` table + Realtime automatically means "push notifications work".** A very common, reasonable-sounding misconception this topic exists specifically to correct. Fix: always distinguish in-app (requires the app open) from true push (works app-closed).',
            '**Treating push notifications as a required, core part of "a real social app" for this course\'s scope.** A legitimate, valuable feature, but genuinely optional given the added complexity and (for the FCM path) potential card requirement. Fix: the course explicitly frames this as an optional extension, not a required capstone piece.',
            '**Not testing the "app fully closed" case explicitly.** Easy to assume everything works because testing only ever happens with the app open and Realtime connected. Fix: the deliberate closed-app test in this topic\'s steps is worth doing for your own understanding.',
            '**Confusing this gap with a bug in the trigger/RLS/Realtime work from earlier this module.** Nothing built so far is broken — it is working exactly as designed for an app-open scenario; this is a scope boundary, not a defect.',
          ],
          tryIt:
            'Do the deliberate closed-app test described in the steps yourself, and write one sentence in your README explicitly stating: "In-app notifications require LocalInsta to be open; real push notifications are an optional Module 7 extension, not yet implemented / implemented via [your choice]."',
          takeaway: 'In-app notifications need the app open; true push needs OS-level delivery via an external service — know this boundary explicitly, do not assume one implies the other.',
        },
        {
          id: 'm7-t13',
          title: 'A free path to real push: Supabase Edge Functions + OneSignal',
          explain:
            'Supabase Edge Functions (genuinely free, no card, 500K invocations/month) can call OneSignal\'s free tier (also no card) to deliver real, app-closed push notifications — entirely within this course\'s "no card, ever" constraint.',
          analogy:
            'A courier company (OneSignal) with its own delivery network, hired by your shop (a Supabase Edge Function acting as the trigger) to hand-deliver a note directly to a customer\'s door, whether or not the customer is currently browsing your storefront.',
          theory:
            '**Supabase Edge Functions** are serverless Deno/TypeScript functions, deployed via the Supabase CLI, genuinely included in the free tier at 500,000 invocations/month with **no billing plan required** — unlike Firebase Cloud Functions, which (per Module 1\'s framing) requires the Blaze plan regardless of actual usage. An Edge Function can be invoked directly from Flutter (`supabase.functions.invoke(\'send-push\', body: {...})`) or triggered by a **database webhook** (Supabase\'s mechanism for calling an Edge Function automatically whenever a row is inserted into a table — here, whenever a new `notifications` row is created by this module\'s triggers).\n\n**OneSignal**\'s free tier supports unlimited notifications with no card required at signup, and provides a REST API an Edge Function can call directly with the recipient\'s registered OneSignal player id (obtained via the `onesignal_flutter` package\'s initialization, which itself just needs OneSignal\'s free App ID — no payment details anywhere in this chain). This combination — Postgres trigger creates a notification row → database webhook fires an Edge Function → Edge Function calls OneSignal\'s API → OneSignal delivers to the device\'s OS-level push tray — closes the app-closed gap from the previous topic entirely within the free, no-card stack this whole course has been built on.',
          whyItMatters:
            'This is the course\'s final, clearest demonstration that "free tier, no card, ever" extends even to genuinely advanced infrastructure (scheduled jobs via pg_cron, serverless functions via Edge Functions, real push via a free third-party service) — not just the basics of auth and a database.',
          steps: [
            'Create a free OneSignal account and app (no card required) — note the App ID and REST API key.',
            'Add `onesignal_flutter` to `pubspec.yaml`, initialize it in `main.dart` with the OneSignal App ID, and confirm a `player_id` is generated for a signed-in test device.',
            'Store each user\'s `player_id` in a new `profiles.onesignal_player_id text` column, updated on app start.',
            'Write a Supabase Edge Function (`supabase functions new send-push`) that reads a `notifications` row payload and calls OneSignal\'s REST API with the recipient\'s `player_id` and type-appropriate notification text.',
            'Wire a **database webhook** (Database → Webhooks in the dashboard) firing this Edge Function on every `insert` into `notifications`.',
          ],
          code: `// pubspec.yaml
// onesignal_flutter: ^5.2.5

// main.dart initialization
OneSignal.initialize('your-onesignal-app-id');
OneSignal.Notifications.requestPermission(true);

final playerId = OneSignal.User.pushSubscription.id;
if (playerId != null) {
  await supabase.from('profiles').update({'onesignal_player_id': playerId})
      .eq('id', supabase.auth.currentUser!.id);
}

// supabase/functions/send-push/index.ts (Deno Edge Function, simplified)
Deno.serve(async (req) => {
  const { record } = await req.json(); // the new notifications row from the webhook
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY); // server-side only

  const { data: recipient } = await supabaseAdmin
    .from('profiles')
    .select('onesignal_player_id')
    .eq('id', record.recipient_id)
    .single();

  if (!recipient?.onesignal_player_id) return new Response('no player id', { status: 200 });

  await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Basic \${ONESIGNAL_REST_API_KEY}\`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_player_ids: [recipient.onesignal_player_id],
      contents: { en: notificationCopyFor(record) },
    }),
  });

  return new Response('sent', { status: 200 });
});`,
          pitfalls: [
            '**Calling OneSignal\'s REST API directly from Flutter with the REST API key embedded in the app.** That key is a genuine secret (unlike Supabase\'s anon key) — shipping it in a client binary would let anyone send push notifications to your entire user base. Fix: the REST API key lives only inside the Edge Function, never in the Flutter app.',
            '**Using the Supabase `service_role` key inside the Edge Function without understanding why it is safe here.** Edge Functions run in a trusted, server-side environment you control — this is precisely the legitimate use case Module 1 described for that key, unlike a mobile app binary.',
            '**Forgetting to request Android 13+\'s notification permission (`OneSignal.Notifications.requestPermission`).** Without it, notifications are silently never shown, mirroring the exact runtime-permission lesson from Module 4\'s camera/gallery access.',
            '**Not handling a user with no `onesignal_player_id` yet (e.g. they have never opened the app since this feature was added).** The Edge Function should exit gracefully, exactly as shown, not error.',
          ],
          tryIt:
            'Wire the full chain end to end, fully close the app on a test device, trigger a like from a second account, and confirm a real system-tray push notification appears on the closed-app device — the exact gap demonstrated in the previous topic, now closed.',
          takeaway: 'pg_cron, Edge Functions, and OneSignal\'s free tier together deliver genuine app-closed push notifications without a card anywhere in the chain — the course\'s "free, no card, ever" promise holds even for advanced infrastructure.',
        },
        {
          id: 'm7-t14',
          title: 'Testing push end to end & respecting notification permission',
          explain:
            'A deliberate checklist for verifying the full push chain works, plus handling Android 13+\'s explicit notification permission gracefully rather than assuming it is granted.',
          analogy:
            'A courier company\'s dry run before their first real delivery day — testing every leg of the route once, deliberately, rather than discovering a broken link only when a real customer complains.',
          theory:
            'Android 13 (API 33) made the `POST_NOTIFICATIONS` permission an explicit, user-facing runtime prompt (rather than automatically granted) — exactly like Module 4\'s camera/gallery permission split. `OneSignal.Notifications.requestPermission(true)` triggers this prompt; a denied permission means push notifications will never show for that user, and the app should degrade gracefully (falling back to in-app notifications only, which already work regardless) rather than assuming push always succeeds.\n\nA genuine end-to-end test checklist: (1) confirm `onesignal_player_id` is actually saved to the recipient\'s profile row, (2) confirm the database webhook is correctly configured and firing (check its logs in the Supabase dashboard), (3) confirm the Edge Function\'s own logs (`supabase functions logs send-push`) show a successful OneSignal API call, (4) confirm OneSignal\'s own dashboard shows the notification as delivered, (5) confirm it actually appears on the physical/emulated device\'s system tray.',
          whyItMatters:
            'A five-hop delivery chain (trigger → webhook → Edge Function → OneSignal → device) has five places something can silently fail — a systematic test checklist, checked hop by hop, turns "push notifications don\'t work, somehow" into a fast, specific diagnosis.',
          steps: [
            'Confirm notification permission is explicitly requested and its result (granted/denied) is logged for your own debugging.',
            'Walk the five-hop checklist above in order, confirming each hop before assuming the next one is the problem.',
            'Test the denied-permission case explicitly: deny the prompt, confirm in-app notifications (Realtime, badge) still work perfectly, and no crash occurs anywhere in the push-specific code path.',
            'Document the full working chain (or the deliberate decision to skip this optional module extension) in your README.',
          ],
          code: `// Respecting the explicit permission result
final accepted = await OneSignal.Notifications.requestPermission(true);
if (!accepted) {
  debugPrint('Push notifications denied — in-app notifications remain fully functional.');
  // No further action needed: everything from earlier this module
  // (triggers, Realtime, unread badge) works regardless of this permission.
}

# The five-hop diagnostic checklist, run in order:
# 1. select onesignal_player_id from profiles where id = '<recipient>';  -- is it set?
# 2. Supabase Dashboard -> Database -> Webhooks -> check delivery logs
# 3. supabase functions logs send-push                                   -- did it run, any errors?
# 4. OneSignal Dashboard -> Delivery -> confirm the notification shows as sent/delivered
# 5. Physically check the test device's system notification tray`,
          pitfalls: [
            '**Assuming notification permission is always granted, with no fallback path.** Silently breaks push for any user who denies the prompt, with no graceful degradation. Fix: always design for the denied case explicitly, as this topic\'s code shows.',
            '**Debugging by guessing which of the five hops is broken instead of checking each in order.** Wastes far more time than the systematic checklist. Fix: always start from hop 1 and confirm each before moving to the next.',
            '**Not distinguishing "the Edge Function ran but OneSignal rejected the request" (a hop-4 problem, visible in OneSignal\'s dashboard) from "the Edge Function never ran at all" (a hop-2/3 problem, visible in Supabase\'s webhook/function logs).** Fix: each hop has its own distinct log source — check the right one for the right question.',
            '**Treating this entire optional extension as required for LocalInsta to be "done".** It is explicitly optional — a learner who skips it still has a fully functional, complete app via in-app notifications alone. Fix: do not let scope creep here block finishing the core, required course.',
          ],
          tryIt:
            'Run the full five-hop checklist against your own real setup (or, if you chose to skip the optional push extension, write a short README note explaining that decision and confirming in-app notifications work completely on their own) — either outcome is a legitimate, complete way to finish this module.',
          takeaway: 'A five-hop delivery chain needs a five-step checklist, checked in order — and the entire push extension is optional, never a blocker to calling LocalInsta finished.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm7-p1',
      type: 'Project',
      title: '24-Hour Stories, Fully Cleaned Up',
      domain: 'Stories / pg_cron',
      duration: '3 hours',
      description:
        'Build the complete stories feature — schema, camera-first capture, the story ring, a full-screen tap-to-advance viewer — and a genuine pg_cron cleanup job that removes expired stories and their Storage files server-side.',
      tools: ['Flutter', 'supabase_flutter', 'pg_cron'],
      blueprint: {
        overview:
          'A stories table and Storage bucket with a 24-hour expires_at default; a camera-first capture flow reusing the compression pipeline without cropping; a horizontal seen/unseen story ring; a full-screen AnimationController-driven story viewer; and a pg_cron job running every 30 minutes that physically deletes expired stories and their Storage files.',
        functionalRequirements: [
          '**Schema.** stories table + bucket, RLS matching the posts pattern minus an update policy.',
          '**Capture.** Camera-first, no crop, compressed, uploaded to the stories bucket.',
          '**Story ring.** Horizontal scroll, coloured ring for unseen, grey for seen, persisted locally.',
          '**Viewer.** Segmented progress bar, tap zones for back/forward, auto-advance, seen tracked on start not completion.',
          '**Cleanup.** A pg_cron job deleting both storage.objects and stories rows for expired content, verified via cron.job_run_details.',
        ],
        technicalImplementation: [
          '**supabase/migrations/0006_stories.sql.** Table, bucket, RLS, and the pg_cron extension + scheduled cleanup function.',
          '**features/stories/data/stories_repository.dart.**',
          '**features/stories/state/stories_state.dart.** Local seen-id set persisted via shared_preferences.',
          '**features/stories/presentation/{create_story_screen.dart, story_viewer_screen.dart}.**',
        ],
        prompts: [
          {
            step: 1,
            label: 'Stories schema, bucket, and pg_cron cleanup',
            outcome: 'A complete, self-cleaning stories backend.',
            prompt:
              'Write supabase/migrations/0006_stories.sql: the stories table (expires_at defaulting to now() + 24 hours), its RLS policies (public select, owner-scoped insert/delete, no update), a public stories Storage bucket with folder-owned policies matching Module 4\'s pattern, the pg_cron extension enabled, a security definer cleanup_expired_stories() function deleting matching storage.objects then expired stories rows, and cron.schedule registering it every 30 minutes. Include a manual test backdating one story and confirming the function removes both its row and its file.',
          },
          {
            step: 2,
            label: 'Capture flow + story ring',
            outcome: 'Users can post a story and see a live seen/unseen ring.',
            prompt:
              'Build lib/features/stories/presentation/create_story_screen.dart defaulting to camera capture (with a gallery fallback), skipping the square crop, reusing compressForUpload and the stories-bucket upload path. Build lib/features/stories/state/stories_state.dart tracking active stories grouped by user and a locally-persisted (shared_preferences) set of seen story ids. Build the horizontal story ring widget with a coloured ring for unseen users and grey for fully-seen ones, placed above the feed.',
          },
          {
            step: 3,
            label: 'Full-screen story viewer',
            outcome: 'A working tap-to-advance viewer with a segmented progress bar.',
            prompt:
              'Build lib/features/stories/presentation/story_viewer_screen.dart(stories, startIndex) with a single 5-second AnimationController driving a segmented progress bar across the top, left/right GestureDetector zones (roughly 30/70 width) for back/forward navigation, auto-advance on animation completion (popping the screen after the last story), and marking each story seen the instant it starts (not on completion).',
          },
        ],
        deliverable:
          'A working stories feature where posting a story shows a coloured ring, viewing it plays a segmented, tap-navigable full-screen viewer, and a manually-backdated test story is genuinely deleted (row and file) after invoking the pg_cron job — verified in the raw data, not just the UI.',
      },
    },
    {
      id: 'm7-p2',
      type: 'Project',
      title: 'Trigger-Generated Notifications with a Live Unread Badge',
      domain: 'Notifications / Realtime',
      duration: '2.5 hours',
      description:
        'Build the notifications table with a genuinely private RLS policy, trigger-generated rows for likes/comments/follows, a realtime notifications screen, and a live unread badge on the bottom navigation.',
      tools: ['Flutter', 'supabase_flutter', 'provider'],
      blueprint: {
        overview:
          'A recipient-locked notifications table (select and read-only update policies, no client insert path); three trigger functions generating notification rows on like/comment/follow inserts with self-action exclusion; a notifications screen with type-branched copy and a filtered Realtime subscription; and a live unread-count badge on the Notifications tab that clears on open.',
        functionalRequirements: [
          '**Schema + RLS.** notifications table, select limited to the recipient, update limited to marking read, no insert policy at all.',
          '**Triggers.** notify_on_like/comment/follow, each excluding self-actions where applicable.',
          '**Screen.** Type-branched copy and tap destinations, newest-first, filtered Realtime subscription appending new events live.',
          '**Badge.** An accurate unread count via a real count query, incrementing live, clearing on tab open.',
        ],
        technicalImplementation: [
          '**supabase/migrations/0007_notifications.sql.** Table, RLS, and all three trigger functions + triggers.',
          '**features/notifications/data/notifications_repository.dart.**',
          '**features/notifications/state/notifications_state.dart.** Unread count + Realtime lifecycle.',
          '**features/notifications/presentation/notifications_screen.dart.**',
          '**home_scaffold.dart update.** Badge overlay on the Notifications tab icon.',
        ],
        prompts: [
          {
            step: 1,
            label: 'notifications table, RLS, and trigger functions',
            outcome: 'A fully secured, trigger-populated notifications table.',
            prompt:
              'Write supabase/migrations/0007_notifications.sql: the notifications table (recipient_id, actor_id, type check constraint, nullable post_id, read boolean, created_at) with an index on (recipient_id, created_at desc); RLS enabled with only a recipient-scoped select policy and a recipient-scoped read-only update policy (no insert policy at all); and three security definer trigger functions (notify_on_like, notify_on_comment excluding self-actions via is distinct from, notify_on_follow with no self-check needed) with their after insert triggers on likes, comments, and follows respectively.',
          },
          {
            step: 2,
            label: 'NotificationsRepository + realtime screen',
            outcome: 'A working, live-updating notifications list.',
            prompt:
              'Create lib/features/notifications/data/notifications_repository.dart with fetchNotifications (joining actor:profiles!notifications_actor_id_fkey), fetchUnreadCount (a real count query), and markAllAsRead. Build lib/features/notifications/presentation/notifications_screen.dart rendering type-branched copy (like/comment/follow) with correct tap destinations (post detail vs profile), and a filtered Realtime subscription (after running alter publication supabase_realtime add table public.notifications;) prepending new notifications live, properly unsubscribed in dispose.',
          },
          {
            step: 3,
            label: 'Live unread badge on the bottom nav',
            outcome: 'An accurate, live-updating badge that clears on tab open.',
            prompt:
              'Create lib/features/notifications/state/notifications_state.dart as a ChangeNotifier with unreadCount, refreshUnreadCount (using a real count query, not a full row fetch), incrementLocally (called from the Realtime subscription), and markAllAsRead (called when the Notifications tab is opened). Wire a small red badge overlay onto the Notifications BottomNavigationBarItem icon in home_scaffold.dart, visible only when unreadCount > 0.',
          },
        ],
        deliverable:
          'A working notification system where liking, commenting on, or following a second test account generates a correctly-attributed, live-arriving notification with an accurate unread badge that clears the instant the notifications tab is opened — and where a self-like or self-comment generates no notification at all.',
      },
    },
  ],
  quiz: [
    {
      id: 'm7-q1',
      q: 'Why does the stories table compute `expires_at` with a database-side default expression instead of the Flutter app sending an explicit value?',
      options: [
        'It avoids trusting a client device\'s clock, which can be wrong or inconsistent',
        'Supabase requires all timestamp columns to use default expressions',
        'It makes the insert query run faster',
        'Flutter cannot compute date arithmetic',
      ],
      answer: 0,
    },
    {
      id: 'm7-q2',
      q: 'Why is filtering `expires_at > now()` at query time not sufficient on its own to consider stories properly "expired"?',
      options: [
        'The underlying rows and Storage files remain in the database and bucket indefinitely, still consuming free-tier quota',
        'Query-time filters do not work correctly in Supabase',
        'It causes the app to crash after 24 hours',
        'RLS prevents filtering by timestamp columns',
      ],
      answer: 0,
    },
    {
      id: 'm7-q3',
      q: 'Why can LocalInsta use pg_cron for a genuinely scheduled server-side cleanup job without ever requiring a card?',
      options: [
        'pg_cron is a free Postgres extension included in Supabase\'s free tier, unlike Firebase Cloud Functions which require the paid Blaze plan',
        'pg_cron only works for read-only queries',
        'Scheduled jobs are not actually possible on any free tier',
        'pg_cron requires a Supabase Pro subscription',
      ],
      answer: 0,
    },
    {
      id: 'm7-q4',
      q: 'Why does the notifications table have no INSERT policy at all, unlike posts, likes, or comments?',
      options: [
        'Notifications should only ever be created by security definer trigger functions, never directly by a client',
        'It is an oversight that should be fixed',
        'Notifications do not need Row Level Security',
        'Supabase automatically creates insert policies for every table',
      ],
      answer: 0,
    },
    {
      id: 'm7-q5',
      q: 'Why does `notify_on_like()` check that the post owner is "distinct from" the person who liked it before creating a notification?',
      options: [
        'To avoid generating a pointless "you liked your own post" notification for self-likes',
        'Because RLS blocks self-likes entirely',
        'Because Postgres requires this check for all triggers',
        'To prevent the like itself from being recorded',
      ],
      answer: 0,
    },
    {
      id: 'm7-q6',
      q: 'Why are real push notifications (arriving even when the app is fully closed) not automatically provided by the in-app notifications table and Realtime subscription built earlier in this module?',
      options: [
        'Realtime subscriptions only work while the app is open and connected; app-closed delivery requires a separate OS-level push mechanism',
        'Push notifications require a completely different database',
        'Realtime subscriptions are disabled by default in Supabase',
        'Push notifications are not possible without Firebase',
      ],
      answer: 0,
    },
  ],
}
