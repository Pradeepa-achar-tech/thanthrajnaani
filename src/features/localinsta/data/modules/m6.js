// Module 6 — Profile, Follow & Explore
// LocalInsta (Flutter + Supabase) course content for the React course player.

export const m6 = {
  id: 'm6',
  title: 'Profile, Follow & Explore',
  hours: 8,
  color: 'from-rose-500/20 to-rose-700/10',
  accent: 'rose',
  description:
    'Build the profile grid, edit-profile flow, a trigger-backed follow system with an optimistic follow button, username search with debouncing, an explore grid, and the five-tab bottom navigation shell that ties every screen in LocalInsta together.',
  sections: [
    {
      id: 'm6-s1',
      title: 'The profile screen',
      topics: [
        {
          id: 'm6-t1',
          title: 'The profile header',
          explain:
            'Avatar, username, bio, and the three stat counters — posts, followers, following — read directly off `profiles`\' denormalized columns from Module 3, no aggregate query needed.',
          analogy:
            'A shop\'s signboard at a glance: the name, a short tagline, and three numbers a regular customer cares about — years open, staff count, branch count. The profile header is LocalInsta\'s signboard, all of it readable in one glance, none of it requiring the visitor to "go count" anything themselves.',
          theory:
            'Because `profiles.post_count`, `follower_count`, and `following_count` are already denormalized (Module 3) and kept accurate by triggers (this module extends that pattern to follows), rendering the header is a **single-row fetch** — `supabase.from(\'profiles\').select().eq(\'id\', userId).single()` — with zero aggregate `count(*)` queries needed at render time. This is precisely the payoff of the denormalization trade-off made back in Module 3: a screen that would otherwise require three separate `count(*)` queries (posts, followers, following) needs only one already-fast single-row fetch.\n\nLayout: `CircleAvatar`/`AvatarImage` (Module 4) on the left, three tappable stat columns (post count, "Followers", "Following" — the latter two navigate to list screens, this module\'s later topic) to the right, with the bio text below spanning the full width.',
          whyItMatters:
            'This header is a clean, visible demonstration of *why* Module 3 bothered with denormalized counters at all — the alternative (three live aggregate queries every time any profile is viewed) would be a measurably slower, more expensive screen at any real scale.',
          steps: [
            'Build `ProfileHeader(profile: Profile)` as a pure, stateless presentation widget.',
            'Layout the avatar, username, bio, and three stat columns using Module 0\'s Row/Column/Expanded patterns.',
            'Make the "Followers" and "Following" stat columns tappable, navigating to their respective list screens (built later this module) passing only the `userId`.',
            'Fetch the profile via a single-row query in the screen hosting this header, passing the result down as a prop — the header itself does no fetching.',
          ],
          code: `class ProfileHeader extends StatelessWidget {
  const ProfileHeader({super.key, required this.profile, required this.userId});
  final Profile profile;
  final String userId;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              AvatarImage(url: profile.avatarUrl, radius: 36),
              const SizedBox(width: 20),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _StatColumn(label: 'Posts', value: profile.postCount, onTap: null),
                    _StatColumn(
                      label: 'Followers',
                      value: profile.followerCount,
                      onTap: () => Navigator.push(context, MaterialPageRoute(
                        builder: (_) => FollowListScreen(userId: userId, mode: FollowListMode.followers),
                      )),
                    ),
                    _StatColumn(
                      label: 'Following',
                      value: profile.followingCount,
                      onTap: () => Navigator.push(context, MaterialPageRoute(
                        builder: (_) => FollowListScreen(userId: userId, mode: FollowListMode.following),
                      )),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(profile.fullName ?? profile.username, style: const TextStyle(fontWeight: FontWeight.w600)),
          if (profile.bio != null) Text(profile.bio!),
        ],
      ),
    );
  }
}`,
          pitfalls: [
            '**Computing stats with a live `count(*)` query instead of reading the denormalized columns.** Works, but throws away the entire point of Module 3\'s counter-trigger investment, and is measurably slower at any real scale. Fix: always read `profiles.post_count`/`follower_count`/`following_count` directly.',
            '**Fetching the profile inside `ProfileHeader` itself instead of the parent screen.** Couples a pure presentation widget to network/state concerns, making it harder to reuse (e.g. inside a search result preview later this module). Fix: keep `ProfileHeader` a dumb, prop-driven widget.',
            '**Not making "Followers"/"Following" tappable.** A common, expected interaction on any social profile screen. Fix: wire both to their list screens from the start.',
            '**Showing `profile.username` as the primary display name even when `full_name` is set.** Real Instagram-style apps lead with the display name and show the handle secondarily. Fix: prefer `full_name`, falling back to `username` only when unset.',
          ],
          tryIt:
            'Render this header for one of your seeded test profiles and confirm the three stat numbers match what you would get from manually running `count(*)` queries against `posts`, `follows` (as follower), and `follows` (as following) for that same user.',
          takeaway: 'A denormalized header is a one-row fetch — the counters exist specifically so this screen never needs a slow aggregate query.',
        },
        {
          id: 'm6-t2',
          title: 'The post grid',
          explain:
            'A three-column `GridView.builder` of a user\'s own posts, reusing Module 0\'s layout pattern and Module 4\'s `PostImage` widget, tapping into the post detail screen.',
          analogy:
            'A photographer\'s contact sheet — every frame from a roll laid out in a neat grid, small enough to scan quickly, each one enlargeable with a single tap. That is exactly the role of a profile\'s post grid.',
          theory:
            'Fetch this specific user\'s posts with `supabase.from(\'posts\').select().eq(\'user_id\', userId).order(\'created_at\', ascending: false)` — no author join needed here (unlike the feed), since every post in this grid obviously belongs to the same, already-known profile. Render with the exact `GridView.builder` + `SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3)` pattern from Module 0\'s layout topic, each cell an `AspectRatio(aspectRatio: 1)`-wrapped `PostImage` (Module 4).\n\nTapping any grid cell navigates to `PostDetailScreen(postId: post.id)` — the exact same detail screen built in Module 5 for feed taps, reused here with zero duplication, since it was deliberately built to take only a `postId` and fetch fresh.',
          whyItMatters:
            'This topic is a direct payoff of two earlier architectural decisions — Module 0\'s `.builder`-everywhere discipline and Module 5\'s "pass only the id" navigation convention — both now saving real work by being reusable rather than needing screen-specific rewrites.',
          steps: [
            'Add `fetchPostsByUser(String userId)` to `PostsRepository`, filtering (not joining) by `user_id`.',
            'Build the grid with the Module 0 three-column pattern, using Module 4\'s `PostImage` per cell.',
            'Wire each cell\'s `onTap` to push `PostDetailScreen(postId: post.id)`.',
            'Add a simple empty state ("No posts yet") for a profile with zero posts.',
            'Confirm scrolling a grid of 30+ test posts performs smoothly, thanks to `.builder`.',
          ],
          code: `Future<List<Post>> fetchPostsByUser(String userId) async {
  final rows = await supabase
      .from('posts')
      .select() // no join needed — the profile is already known by the caller
      .eq('user_id', userId)
      .order('created_at', ascending: false);
  return (rows as List).map((r) => Post.fromMap({...r, 'profiles': null})).toList();
  // Note: adapt Post.fromMap to tolerate a missing 'profiles' key for this
  // owner-already-known case, or use a lighter PostSummary model — either
  // is a reasonable, small implementation choice at this point.
}

Widget postGrid(List<Post> posts, BuildContext context) {
  if (posts.isEmpty) {
    return const Center(child: Padding(padding: EdgeInsets.all(32), child: Text('No posts yet')));
  }
  return GridView.builder(
    padding: const EdgeInsets.all(2),
    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
      crossAxisCount: 3,
      crossAxisSpacing: 2,
      mainAxisSpacing: 2,
    ),
    itemCount: posts.length,
    itemBuilder: (context, i) => GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(
        builder: (_) => PostDetailScreen(postId: posts[i].id),
      )),
      child: PostImage(imageUrl: posts[i].imageUrl),
    ),
  );
}`,
          pitfalls: [
            '**Reusing the feed\'s joined query for this grid.** Wastes bandwidth pulling the same, already-known profile data redundantly for every single post. Fix: a plain, unjoined query is correct here — the owner is already known by context.',
            '**Not handling the empty-grid case.** A blank white rectangle where the grid should be looks broken on a brand-new account with zero posts. Fix: always design the empty state alongside the populated one.',
            '**Forgetting `.builder` and using a plain `GridView(children: ...)`.** The exact same performance mistake Module 0 warned against for lists applies identically to grids. Fix: always `.builder` for anything that can grow.',
            '**Loading the entire post history at once for a very prolific poster.** Acceptable for this course\'s scope; a production app might paginate the grid too, using the same `.range()` technique from Module 5 — worth noting as a natural extension, not required here.',
          ],
          tryIt:
            'View your own profile grid after seeding 10+ test posts for your account, confirm they render in a clean 3-column grid ordered newest-first, and tap one to confirm it opens the correct post in the detail screen.',
          takeaway: 'The profile grid reuses the exact same detail screen from the feed by passing only an id — the "pass the id, refetch fresh" convention pays for itself here.',
        },
        {
          id: 'm6-t3',
          title: 'Another user\'s profile screen',
          explain:
            'The same header and grid, but with a Follow/Unfollow button in place of an Edit button — one screen, branched by whether you are viewing your own profile or someone else\'s.',
          analogy:
            'A shop owner sees a "manage inventory" button on their own storefront dashboard; a customer visiting the same storefront sees a "follow this shop for updates" button instead — same storefront, a role-appropriate action button.',
          theory:
            '`ProfileScreen(userId: String)` fetches the target profile and post grid exactly as the own-profile view does, but conditionally renders either an **Edit Profile** button (if `userId == supabase.auth.currentUser!.id`) or a **Follow/Unfollow** button (otherwise) — a single screen serving two roles cleanly via one `if`, rather than two near-duplicate screens that would drift out of sync over time.\n\nDetermining whether the viewer already follows this profile requires one extra query: `supabase.from(\'follows\').select().eq(\'follower_id\', currentUserId).eq(\'following_id\', userId).maybeSingle()` — `maybeSingle()` (versus `single()`) returns `null` gracefully instead of throwing when no matching row exists, exactly the "not yet following" case.',
          whyItMatters:
            'This is the same "one screen, two roles, branched by identity" pattern useful across countless real apps — recognising it here, rather than building two separate near-identical screens, is a small but genuine architecture win.',
          steps: [
            'Build `ProfileScreen(userId: String)` fetching the profile, post grid, and (if not your own) the current follow status.',
            'Branch the action button: `EditProfileButton` if `userId == currentUserId`, else `FollowButton` (next topic wires its real logic).',
            'Reuse `ProfileHeader` and the post grid from the previous two topics unchanged.',
            'Test navigating to your own profile via the bottom nav (Edit button shown) versus tapping another test user\'s avatar/username anywhere in the app (Follow button shown).',
          ],
          code: `class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key, required this.userId});
  final String userId;
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Profile? _profile;
  List<Post> _posts = [];
  bool _isFollowing = false;
  bool _loading = true;

  bool get isOwnProfile => widget.userId == supabase.auth.currentUser?.id;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final profileRow = await supabase.from('profiles').select().eq('id', widget.userId).single();
    final posts = await fetchPostsByUser(widget.userId);

    bool following = false;
    if (!isOwnProfile) {
      final existing = await supabase
          .from('follows')
          .select()
          .eq('follower_id', supabase.auth.currentUser!.id)
          .eq('following_id', widget.userId)
          .maybeSingle();
      following = existing != null;
    }

    setState(() {
      _profile = Profile.fromMap(profileRow);
      _posts = posts;
      _isFollowing = following;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    return Scaffold(
      appBar: AppBar(title: Text(_profile!.username)),
      body: ListView(
        children: [
          ProfileHeader(profile: _profile!, userId: widget.userId),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: isOwnProfile
                ? OutlinedButton(onPressed: () {/* Module 6 edit flow */}, child: const Text('Edit Profile'))
                : FollowButton(targetUserId: widget.userId, initiallyFollowing: _isFollowing),
          ),
          const SizedBox(height: 8),
          postGrid(_posts, context),
        ],
      ),
    );
  }
}`,
          pitfalls: [
            '**Building two nearly-identical screens (OwnProfileScreen, OtherProfileScreen) instead of one branched screen.** Any future header/grid change now needs to be made twice, and the two inevitably drift apart. Fix: one screen, one `if`, as shown.',
            '**Using `.single()` instead of `.maybeSingle()` for the "am I already following them" check.** Throws an exception for the completely normal, common case of not yet following. Fix: `.maybeSingle()` treats "no row" as a valid, non-error result.',
            '**Forgetting to skip the follow-status query entirely for your own profile.** Wastes a query and is conceptually meaningless (you cannot follow yourself, enforced back in Module 3). Fix: the `isOwnProfile` guard shown above.',
            '**Not passing `widget.userId` (not `_profile!.id`) into the header/grid before the profile has loaded.** Minor, but keep the loading and loaded states cleanly separated as shown, rather than accessing possibly-null fields early.',
          ],
          tryIt:
            'Navigate to your own profile and confirm you see Edit Profile; navigate to a different seeded test profile and confirm you see a correctly-labelled Follow (or Following, if already following) button instead.',
          takeaway: 'One profile screen, branched cleanly by identity, beats two near-duplicate screens that will inevitably drift apart.',
        },
        {
          id: 'm6-t4',
          title: 'Edit profile: username, bio & avatar',
          explain:
            'A form pre-filled with the current profile, validating the same username shape rules as Module 3\'s database check constraint, updating on save.',
          analogy:
            'Updating your details at a co-operative society office: the clerk hands you a form already filled with what they have on record, you cross out and rewrite only what has changed, and the update takes effect the moment you hand it back — not before.',
          theory:
            '`EditProfileScreen` pre-fills `TextEditingController`s from the currently-loaded `Profile`, validates locally (mirroring Module 3\'s `check (username ~ \'^[a-z0-9_]{3,20}$\')` constraint — validate the *same* rule client-side for instant feedback, while the database constraint remains the true, final guard), then calls `supabase.from(\'profiles\').update({...}).eq(\'id\', userId)` on save — protected by Module 3\'s `update` RLS policy, which already ensures a user can only ever update their own row.\n\nA changed username can collide with an existing one (Module 3\'s `unique` constraint) — catch this specific `PostgrestException` and show a friendly "username already taken" message rather than a raw database error.',
          whyItMatters:
            'Mirroring a database constraint in client-side validation — rather than only relying on either one alone — is a recurring, valuable pattern: instant UX feedback from the client check, guaranteed correctness from the database check, with graceful handling of the rare cases where they could theoretically disagree (a race between two users grabbing the same username at nearly the same instant).',
          steps: [
            'Build `EditProfileScreen(profile: Profile)`, pre-filling `username`/`bio` controllers from the passed-in profile.',
            'Add a validator on the username field matching Module 3\'s regex shape.',
            'Add an "Change photo" tap target reusing Module 4\'s avatar upload flow.',
            'On save, call the update, catching a unique-constraint violation specifically for a friendly "username already taken" message.',
            'On success, pop back and refresh the calling profile screen\'s cached data.',
          ],
          code: `Future<void> saveProfileEdits({
  required String userId,
  required String username,
  String? bio,
}) async {
  try {
    await supabase.from('profiles').update({
      'username': username,
      'bio': bio,
    }).eq('id', userId);
  } on PostgrestException catch (e) {
    if (e.code == '23505') { // unique_violation
      throw Exception('That username is already taken — try another.');
    }
    rethrow;
  }
}

// Validator mirroring Module 3's database check constraint
String? validateUsername(String? value) {
  if (value == null || !RegExp(r'^[a-z0-9_]{3,20}$').hasMatch(value)) {
    return 'Lowercase letters, numbers, underscore, 3-20 characters';
  }
  return null;
}`,
          pitfalls: [
            '**Only validating client-side and trusting it fully.** A direct API call could still submit an invalid username; the database `check` constraint is the true final guard, exactly like every other topic in this course that pairs client validation with server enforcement. Fix: keep both layers, always.',
            '**Not catching the unique-constraint violation specifically.** Shows a raw, technical Postgres error message instead of a friendly one. Fix: check for Postgres error code `23505` and translate it.',
            '**Forgetting to refresh the calling screen\'s cached profile after a successful edit.** The profile screen keeps showing stale data until a full app restart. Fix: either refetch on pop, or pass the updated `Profile` back via `Navigator.pop(context, updatedProfile)`.',
            '**Allowing an empty username to be submitted.** Module 3\'s `not null` constraint blocks this at the database level, but a friendly client-side check catches it sooner and more clearly. Fix: validate for presence, not just shape.',
          ],
          tryIt:
            'Edit your test profile\'s bio and save, confirming it updates; then try changing your username to one already taken by your other seeded test profile, and confirm you see the friendly "already taken" message rather than a raw error.',
          takeaway: 'Validate the same rule on both the client (for instant feedback) and the database (for the real guarantee) — and handle the rare disagreement gracefully.',
        },
      ],
    },
    {
      id: 'm6-s2',
      title: 'The follow system',
      topics: [
        {
          id: 'm6-t5',
          title: 'Follow & unfollow: insert/delete on follows',
          explain:
            'Following is a plain insert into Module 3\'s `follows` table; unfollowing is a plain delete — the RLS `with check (auth.uid() = follower_id)` policy is the entire security model, already written.',
          analogy:
            'Signing (or crossing your name off) a shared community-event attendance sheet — a simple add or remove, with the sheet\'s own rule ("you may only sign or unsign your own name") already enforced by the sheet\'s design, not by anyone standing over your shoulder.',
          theory:
            '`supabase.from(\'follows\').insert({\'follower_id\': currentUserId, \'following_id\': targetUserId})` to follow; `supabase.from(\'follows\').delete().eq(\'follower_id\', currentUserId).eq(\'following_id\', targetUserId)` to unfollow. Module 3 already wrote every piece of security this needs: the `with check (auth.uid() = follower_id)` insert policy, the `unique(follower_id, following_id)` constraint (preventing a double-follow), and the `check (follower_id <> following_id)` constraint (preventing a self-follow) — this topic is purely about calling those already-secured operations from Flutter.\n\nA `PostgrestException` from the unique constraint (attempting to follow someone you already follow, perhaps from a rapid double-tap) is safe to catch and silently ignore — the end state ("now following") is already true, so a duplicate-insert error is not actually a failure from the user\'s perspective.',
          whyItMatters:
            'This topic is a satisfying, fast payoff of Module 3\'s upfront schema investment — the entire client-side implementation of "follow" and "unfollow" is genuinely just two one-line database calls, because all the real thinking already happened when the schema and RLS were designed.',
          steps: [
            'Add `follow(String targetUserId)` and `unfollow(String targetUserId)` to a small `FollowRepository`.',
            'Wrap the insert in `try`/`catch`, silently swallowing a unique-constraint violation specifically.',
            'Call these from a `FollowButton` widget (next topic wires the full optimistic UI around these calls).',
            'Confirm in the dashboard that a follow row appears/disappears correctly after each action.',
          ],
          code: `class FollowRepository {
  FollowRepository({SupabaseClient? client}) : _client = client ?? Supabase.instance.client;
  final SupabaseClient _client;

  Future<void> follow(String targetUserId) async {
    final currentUserId = _client.auth.currentUser!.id;
    try {
      await _client.from('follows').insert({
        'follower_id': currentUserId,
        'following_id': targetUserId,
      });
    } on PostgrestException catch (e) {
      if (e.code == '23505') return; // already following — treat as success
      rethrow;
    }
  }

  Future<void> unfollow(String targetUserId) async {
    final currentUserId = _client.auth.currentUser!.id;
    await _client
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);
  }
}`,
          pitfalls: [
            '**Re-implementing the self-follow or double-follow checks in Dart.** Unnecessary — Module 3\'s constraints already guarantee both, and duplicating the logic client-side risks it drifting out of sync with the real database rule. Fix: trust the database, handle its specific error codes gracefully.',
            '**Letting a unique-constraint error surface as a scary error message to the user.** The actual end state they wanted (following this person) is already true. Fix: catch code `23505` specifically and treat it as a no-op success.',
            '**Forgetting `unfollow` needs both `.eq()` filters, not just one.** Deleting by `follower_id` alone would remove every single person that user follows, not just the one target. Fix: always filter by the exact composite pair.',
            '**Calling these methods with a `targetUserId` equal to the current user\'s own id from somewhere the UI check was skipped.** The database `check` constraint blocks it outright — a good example of defense in depth, though the UI should never present this option in the first place (there is no follow button on your own profile).',
          ],
          tryIt:
            'Follow a test profile, confirm the row appears in `follows` via SQL Editor, unfollow, confirm it disappears — then follow the same profile twice in rapid succession and confirm the second call fails gracefully with no visible error.',
          takeaway: 'Follow/unfollow are two one-line database calls — Module 3\'s schema design did all the real security work in advance.',
        },
        {
          id: 'm6-t6',
          title: 'Follower/following counter triggers',
          explain:
            'The exact same trigger pattern from Module 3\'s likes/comments counters, applied to `follows` — keeping `profiles.follower_count`/`following_count` accurate automatically.',
          analogy:
            'The same turnstile-counter idea from the temple-festival analogy in Module 3, just watching a different gate — every follow/unfollow ticks the right counter on the right profile row, instantly and atomically.',
          theory:
            'An `after insert` trigger on `follows` increments both `profiles.follower_count` (on the `following_id` row — someone gained a follower) **and** `profiles.following_count` (on the `follower_id` row — someone now follows one more person) in the same transaction; an `after delete` trigger decrements both. This is structurally identical to Module 3\'s like/comment counter triggers, just touching two rows instead of one per event.\n\nThis is the piece of "keeping counters honest" that Module 3 deliberately deferred — that module built the pattern on `likes`/`comments`; this topic is the direct, confidence-building repetition of the same idea on a new table, cementing it as a genuinely general technique rather than a one-off trick.',
          whyItMatters:
            'Recognising "I have already learned this pattern, I am just applying it again" is exactly the kind of confidence a well-structured course should build — this topic should feel notably faster to understand than Module 3\'s original version, precisely because it is the same idea.',
          steps: [
            'Write `increment_follow_counts()` — an `after insert` trigger function updating both profiles in one function.',
            'Write `decrement_follow_counts()` — the `after delete` mirror.',
            'Attach both as triggers on `follows`.',
            'Test: follow a test profile from another test account, confirm both accounts\' relevant counters move by exactly one.',
            'Unfollow, confirm both counters revert.',
          ],
          code: `create or replace function public.increment_follow_counts()
returns trigger language plpgsql as $$
begin
  update public.profiles set following_count = following_count + 1 where id = new.follower_id;
  update public.profiles set follower_count = follower_count + 1 where id = new.following_id;
  return new;
end;
$$;

create or replace function public.decrement_follow_counts()
returns trigger language plpgsql as $$
begin
  update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
  update public.profiles set follower_count = greatest(follower_count - 1, 0) where id = old.following_id;
  return old;
end;
$$;

create trigger on_follow_insert
  after insert on public.follows
  for each row execute function public.increment_follow_counts();

create trigger on_follow_delete
  after delete on public.follows
  for each row execute function public.decrement_follow_counts();

-- Test
select username, follower_count, following_count from public.profiles
where username in ('anjali_ks', 'ravi_kundapura');`,
          pitfalls: [
            '**Only updating one side of the relationship (just `follower_count` or just `following_count`).** A follow event genuinely affects two different profile rows — both must update in the same trigger. Fix: two `update` statements inside one trigger function, as shown.',
            '**Not clamping decrements at zero, exactly the same risk from Module 3\'s like-counter trigger.** Fix: `greatest(x - 1, 0)`, consistently applied everywhere a denormalized counter is decremented.',
            '**Forgetting this trigger needs to be added to the migrations file discipline from Module 3.** Fix: append it to `0003_triggers_and_functions.sql` (or a new numbered migration) — never let a trigger exist only in SQL Editor history.',
            '**Manually adjusting `follower_count`/`following_count` from Flutter "just to make the UI feel instant".** The next topic\'s optimistic-UI pattern already solves the "feels instant" problem correctly, without risking the client and trigger disagreeing. Fix: let the trigger be the only thing that ever writes these columns.',
          ],
          tryIt:
            'From two different test accounts, follow each other, and confirm all four relevant counters (each account\'s follower_count and following_count) update correctly and simultaneously — then have one unfollow the other and confirm exactly the right two counters revert.',
          takeaway: 'One event, two affected rows, one trigger updating both — the same denormalized-counter discipline from Module 3, now applied with more confidence.',
        },
        {
          id: 'm6-t7',
          title: 'The optimistic FollowButton',
          explain:
            'The button flips its label and the visible follower count instantly on tap — the same optimistic-UI-with-rollback pattern from Module 5\'s likes, applied to follows.',
          analogy:
            'Raising your hand to volunteer at a village meeting — everyone sees your hand up immediately; the secretary formally recording your name in the minutes happens a beat later, and would only need correcting in the rare case something went wrong.',
          theory:
            '`FollowButton(targetUserId, initiallyFollowing)` tracks a local `bool isFollowing` and flips it, plus calls `notifyListeners()`/`setState`, **immediately** on tap — before the `FollowRepository.follow()`/`unfollow()` call resolves — exactly mirroring Module 5\'s like-button pattern. On a caught failure, revert the local state, exactly as before.\n\nThe button\'s label and style change based on state: "Follow" (filled, brand-colored) when not following, "Following" (outlined, neutral) when already following — a deliberate visual distinction so it is immediately obvious which state you are in without reading carefully, matching the real Instagram convention users already expect.',
          whyItMatters:
            'This topic is intentionally a near-repeat of Module 5\'s optimistic-like pattern — by this point in the course, you should recognise the shape immediately and implement it with much less hesitation than the first time, which is exactly the kind of pattern-reuse real engineering rewards.',
          steps: [
            'Build `FollowButton` as a `StatefulWidget` with local `bool _isFollowing` initialized from the `initiallyFollowing` prop.',
            'On tap, flip `_isFollowing` and call `setState` immediately.',
            'Fire the real repository call in the background, matched to the new state (follow if now true, unfollow if now false).',
            'On failure, revert `_isFollowing` and show a small error.',
            'Style: filled brand-color button for "Follow", outlined neutral button for "Following".',
          ],
          code: `class FollowButton extends StatefulWidget {
  const FollowButton({super.key, required this.targetUserId, required this.initiallyFollowing});
  final String targetUserId;
  final bool initiallyFollowing;
  @override
  State<FollowButton> createState() => _FollowButtonState();
}

class _FollowButtonState extends State<FollowButton> {
  late bool _isFollowing = widget.initiallyFollowing;
  final _repo = FollowRepository();

  Future<void> _toggle() async {
    final wasFollowing = _isFollowing;
    setState(() => _isFollowing = !wasFollowing); // instant, optimistic

    try {
      if (wasFollowing) {
        await _repo.unfollow(widget.targetUserId);
      } else {
        await _repo.follow(widget.targetUserId);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isFollowing = wasFollowing); // roll back
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not update follow status — try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return _isFollowing
        ? OutlinedButton(onPressed: _toggle, child: const Text('Following'))
        : ElevatedButton(onPressed: _toggle, child: const Text('Follow'));
  }
}`,
          pitfalls: [
            '**Awaiting the network call before flipping the button state.** The exact same laggy-feeling mistake Module 5 warned against for likes. Fix: flip local state first, always.',
            '**Not reverting on failure.** Leaves the button showing "Following" when the follow row was never actually created. Fix: always wire the rollback path.',
            '**Using identical visual styling for both states.** Users cannot tell at a glance whether they are following or not. Fix: a clearly different button style (filled vs outlined) per state.',
            '**Re-fetching the follow status from the database on every rebuild instead of trusting local optimistic state.** Defeats the purpose and adds unnecessary queries. Fix: the local `_isFollowing` bool is the UI\'s source of truth between explicit refreshes.',
          ],
          tryIt:
            'Tap Follow on a test profile and confirm the button flips to "Following" with zero visible delay, then confirm (via SQL Editor) the underlying row genuinely exists a moment later — the UI should never appear to "wait" for this confirmation.',
          takeaway: 'Same optimistic-update-then-rollback shape as Module 5\'s likes — recognising and reusing a pattern is faster than re-deriving it.',
        },
        {
          id: 'm6-t8',
          title: 'Followers & Following list screens',
          explain:
            'Tapping the follower/following stat opens a paginated list of profiles — the same embedded-join and pagination techniques from Modules 3 and 5, applied to `follows`.',
          analogy:
            'Flipping through the guest register at a wedding hall, either "who attended this event" or "which events has this person attended" — same register, read in whichever direction the question asks.',
          theory:
            '`FollowListScreen(userId, mode)` where `mode` is `followers` or `following` determines which column to filter on and which side of the relationship to join against: for followers, `supabase.from(\'follows\').select(\'follower_id, profiles!follows_follower_id_fkey(username, avatar_url, bio)\').eq(\'following_id\', userId)`; for following, the mirror, filtering `follower_id` and joining the `following_id` side. Because `follows` has **two** foreign keys both pointing at `profiles`, PostgREST needs the explicit foreign-key-constraint name (shown in the embedded-select syntax above) to disambiguate which relationship you mean — a genuinely new wrinkle beyond the single-foreign-key joins used everywhere earlier in the course.\n\nEach row in the resulting list renders as a compact profile tile (avatar, username, a small Follow button reusing this module\'s own `FollowButton`), tapping through to that profile\'s full `ProfileScreen`.',
          whyItMatters:
            'The disambiguated-foreign-key join syntax here is a genuinely new technique this module introduces — self-referencing tables with two relationships to the same target table are common enough (blocks, friend requests, follows) that recognising this exact syntax pattern is worth having in your toolkit.',
          steps: [
            'Add `fetchFollowers(userId)` and `fetchFollowing(userId)` to `FollowRepository`, using the disambiguated join syntax for each direction.',
            'Build `FollowListScreen(userId, mode)` rendering a `ListView.builder` of compact profile tiles.',
            'Include a `FollowButton` per row so a user can follow/unfollow directly from this list without navigating away.',
            'Add an empty state ("No followers yet" / "Not following anyone yet").',
            'Test both directions against your seeded test accounts\' follow relationships.',
          ],
          code: `// follows has TWO foreign keys to profiles — the constraint name
// disambiguates which relationship a given select() means.
Future<List<Profile>> fetchFollowers(String userId) async {
  final rows = await supabase
      .from('follows')
      .select('profiles!follows_follower_id_fkey(id, username, avatar_url, bio)')
      .eq('following_id', userId);
  return (rows as List)
      .map((r) => Profile.fromMap(r['profiles'] as Map<String, dynamic>))
      .toList();
}

Future<List<Profile>> fetchFollowing(String userId) async {
  final rows = await supabase
      .from('follows')
      .select('profiles!follows_following_id_fkey(id, username, avatar_url, bio)')
      .eq('follower_id', userId);
  return (rows as List)
      .map((r) => Profile.fromMap(r['profiles'] as Map<String, dynamic>))
      .toList();
}

enum FollowListMode { followers, following }

class FollowListScreen extends StatelessWidget {
  const FollowListScreen({super.key, required this.userId, required this.mode});
  final String userId;
  final FollowListMode mode;
  // build() fetches via the matching repository method and renders a
  // ListView.builder of profile tiles — same shape as every other list
  // screen built across this course.
}`,
          pitfalls: [
            '**Omitting the foreign-key constraint name in the embedded select.** PostgREST cannot know which of the two relationships to `profiles` you mean and returns an ambiguity error. Fix: always specify `profiles!<constraint_name>(...)` when a table has more than one relationship to the same target.',
            '**Not knowing the actual constraint name.** It follows a predictable Postgres-generated pattern (`<table>_<column>_fkey`) but is worth confirming directly: `select conname from pg_constraint where conrelid = \'public.follows\'::regclass;`.',
            '**Confusing which mode filters which column** — followers filters `following_id` (people following *this* user), following filters `follower_id` (people *this* user follows). Easy to flip by mistake. Fix: write out the plain-English meaning before writing the query, exactly as Module 3\'s follows topic recommended.',
            '**Not paginating a very popular profile\'s follower list.** Acceptable for this course\'s scope and seeded data size; a production app would apply Module 5\'s `.range()` pagination here too — a natural, well-understood extension.',
          ],
          tryIt:
            'Run `select conname from pg_constraint where conrelid = \'public.follows\'::regclass and contype = \'f\';` in SQL Editor to see both real foreign-key constraint names, then use them in the two queries above and confirm each returns the correct, non-ambiguous direction of the relationship.',
          takeaway: 'A table with two foreign keys to the same target needs the constraint name to disambiguate which relationship an embedded select means.',
        },
      ],
    },
    {
      id: 'm6-s3',
      title: 'Explore & search',
      topics: [
        {
          id: 'm6-t9',
          title: 'Searching profiles by username',
          explain:
            '`ilike` performs a case-insensitive partial match — `supabase.from(\'profiles\').select().ilike(\'username\', \'%query%\')` — the SQL foundation of LocalInsta\'s search box.',
          analogy:
            'A shopkeeper flipping through a phone directory for anyone whose name *contains* "raj", not just an exact match — `ilike` with wildcard `%` markers on both sides is exactly that flexible, partial, case-blind search.',
          theory:
            '`ilike` (case-**i**nsensitive `like`) with `%` wildcards on both sides of the search term matches the term anywhere within the column — `ilike(\'username\', \'%raj%\')` matches `raj`, `Rajesh`, `suraj_k`, all alike. This is a straightforward, genuinely useful search for a username field at LocalInsta\'s scale; full-text search (Postgres\'s `tsvector`/`tsquery` machinery, or a dedicated search service) exists for more sophisticated needs (ranking, typo tolerance, multi-word relevance) but would be over-engineering for this course\'s single-field username search.\n\nCombine with `.limit(20)` to cap result size, and consider also matching `full_name` with an `.or()` filter for a friendlier search experience that finds people by their real name too, not just their handle.',
          whyItMatters:
            'Knowing when `ilike` is the right, proportionate tool — versus reaching for full-text search machinery you do not yet need — is the same "match complexity to actual need" judgment call from Module 4\'s thumbnail-strategy topic, applied to a new problem.',
          steps: [
            'Add `searchProfiles(String query)` to a `SearchRepository`, using `.ilike(\'username\', \'%\$query%\')` with `.limit(20)`.',
            'Extend the query with `.or(\'username.ilike.%\$query%,full_name.ilike.%\$query%\')` to also match display names.',
            'Test with a partial, lowercase, and mixed-case query against your seeded profiles, confirming all match correctly.',
            'Guard against an empty query string returning the entire table — return an empty list instead when the query is blank.',
          ],
          code: `class SearchRepository {
  SearchRepository({SupabaseClient? client}) : _client = client ?? Supabase.instance.client;
  final SupabaseClient _client;

  Future<List<Profile>> searchProfiles(String query) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty) return [];

    final rows = await _client
        .from('profiles')
        .select()
        .or('username.ilike.%\$trimmed%,full_name.ilike.%\$trimmed%')
        .limit(20);
    return (rows as List).map((r) => Profile.fromMap(r)).toList();
  }
}`,
          pitfalls: [
            '**Running a search query on every single keystroke with no debounce.** Fires far more requests than necessary — the very next topic fixes exactly this. Fix: read on before wiring this to a live `TextField`.',
            '**Not guarding against an empty query.** `ilike(\'username\', \'%%\')` matches literally every row, silently returning your entire profiles table. Fix: always short-circuit on an empty/whitespace-only query.',
            '**Forgetting `.limit()`.** An unbounded result set on a popular search term wastes bandwidth and slows the UI for no benefit past the first screenful of results. Fix: always cap search results at a sane number.',
            '**Building a bespoke full-text-search setup for a course-scale username search.** Real over-engineering — `ilike` is genuinely the right tool at this scale. Fix: reach for more sophisticated search machinery only when actual usage demonstrates the need.',
          ],
          tryIt:
            'Search for a partial, lowercase substring of one of your seeded usernames (e.g. `"anj"` for `anjali_ks`) and confirm it matches, then search for a substring of a seeded `full_name` and confirm the `.or()` clause finds it too.',
          takeaway: 'ilike with wildcards is the right, proportionate search tool at this scale — always guard the empty-query case and cap the result count.',
        },
        {
          id: 'm6-t10',
          title: 'Debouncing search input',
          explain:
            'A `Timer`-based debounce waits for a short pause in typing before actually firing the search query — cutting wasted requests dramatically.',
          analogy:
            'A shop clerk who waits until you have finished speaking your full order before walking to the kitchen, rather than running back and forth after every single word you say — debouncing is that patient pause before acting.',
          theory:
            'A **debounce** delays acting on an event until a specified quiet period has passed with no further events — implemented with a single `Timer` that gets **cancelled and restarted** on every new keystroke via `TextField.onChanged`, and only actually fires the search once the user pauses typing for, typically, 300-500ms. This directly reuses Module 0\'s `Timer`/debounce concept, now applied to a genuinely concrete use case.\n\nWithout debouncing, typing a five-letter search term fires five separate network requests, four of which are instantly wasted the moment the next keystroke lands — debouncing collapses this down to (typically) exactly one request, fired once the user has actually finished typing what they meant to search for.',
          whyItMatters:
            'Search-as-you-type without debouncing is one of the most common, easily-avoidable sources of wasted network requests in real apps — and at LocalInsta\'s free-tier scale, every avoided request is directly protecting the same bandwidth budget Module 4 taught you to respect.',
          steps: [
            'In the search screen\'s State, hold a nullable `Timer? _debounce`.',
            'In `TextField.onChanged`, cancel any existing timer and start a new one with a 400ms delay.',
            'Inside the timer\'s callback, call `SearchRepository.searchProfiles(query)` and update the results list.',
            'Always cancel the timer in `dispose()` to avoid a stray search firing after the screen is gone.',
            'Test by typing a search term at normal speed and confirming (via a debug print) only one request fires per pause, not one per keystroke.',
          ],
          code: `class _SearchScreenState extends State<SearchScreen> {
  Timer? _debounce;
  List<Profile> _results = [];
  bool _loading = false;

  void _onQueryChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 400), () async {
      setState(() => _loading = true);
      final results = await context.read<SearchRepository>().searchProfiles(query);
      if (mounted) setState(() { _results = results; _loading = false; });
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          autofocus: true,
          decoration: const InputDecoration(hintText: 'Search LocalInsta'),
          onChanged: _onQueryChanged,
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _results.length,
              itemBuilder: (context, i) => profileTile(_results[i]),
            ),
    );
  }
}`,
          pitfalls: [
            '**Forgetting to `cancel()` the previous timer before starting a new one.** Multiple overlapping timers eventually fire multiple overlapping searches for stale queries. Fix: always cancel first, exactly as shown, before creating a new `Timer`.',
            '**Not cancelling the timer in `dispose()`.** A pending debounce can fire after the screen is gone, calling `setState` on a disposed widget. Fix: always cancel in `dispose()`.',
            '**Choosing too long a debounce delay (over ~600ms).** Starts to feel sluggish and unresponsive. Fix: 300-400ms is a good default — long enough to collapse rapid typing, short enough to still feel immediate.',
            '**Debouncing but not also handling an in-flight request being superseded by a newer one (a rare fast-typing race).** Acceptable to leave simple for this course; a stretch improvement is tracking a request "generation" number and discarding stale responses.',
          ],
          tryIt:
            'Type a five-character search term at a natural typing pace with a debug print inside the debounced callback, and confirm only one print fires, roughly 400ms after your last keystroke — not five prints, one per letter.',
          takeaway: 'Cancel-and-restart a single Timer on every keystroke — the simplest possible debounce, and almost always sufficient.',
        },
        {
          id: 'm6-t11',
          title: 'The explore grid',
          explain:
            'A discovery feed of recent posts from across LocalInsta — the same three-column grid pattern as the profile screen, just sourced from every user instead of one.',
          analogy:
            'A community noticeboard at the edge of the santhe (market), showing a mixed sample of everyone\'s stalls that day, rather than any one shop\'s own display — explore is LocalInsta\'s noticeboard, not scoped to who you follow.',
          theory:
            '`ExploreScreen` fetches recent posts across **all** users (not filtered by follow relationships — that distinction matters: explore is deliberately a discovery surface, while the main feed in a fuller version of Instagram is typically follows-only; LocalInsta keeps the main feed showing everyone\'s posts for simplicity at this course\'s scope, making explore mostly a visual "everything, in a grid" alternative view — still a valuable, real screen to build for the grid-layout and query-reuse practice it provides).\n\nThe query and grid rendering reuse almost everything already built: Module 5\'s `fetchFeedPage` pagination technique, this module\'s three-column `GridView.builder` pattern from the profile screen — genuinely the least *new* code of any topic so far, which is itself worth noticing as a marker of how much reusable groundwork the course has built.',
          whyItMatters:
            'Recognising when a "new feature" is mostly assembly of already-built pieces — rather than net-new work — is a realistic reflection of how much real production feature work actually goes, once a codebase has enough of a foundation.',
          steps: [
            'Add `fetchExplorePosts(page)` to `PostsRepository`, essentially identical to `fetchFeedPage` (reuse it directly if the two never diverge).',
            'Build `ExploreScreen` rendering the same three-column grid pattern from this module\'s profile-grid topic, tapping into `PostDetailScreen(postId: ...)`.',
            'Wire the same infinite-scroll `ScrollController` pattern from Module 5.',
            'Confirm tapping any explore grid post opens the correct, fully-functional post detail screen — likes, comments, everything, with zero special-casing.',
          ],
          code: `class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});
  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  final _scrollController = ScrollController();
  List<Post> _posts = [];
  int _page = 0;
  bool _isLoadingMore = false;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _loadFirstPage();
    _scrollController.addListener(_maybeLoadMore);
  }

  Future<void> _loadFirstPage() async {
    final repo = context.read<PostsRepository>();
    final first = await repo.fetchFeedPage(0); // same query shape as the main feed
    setState(() { _posts = first; _hasMore = first.length == PostsRepository.pageSize; });
  }

  void _maybeLoadMore() {
    if (_isLoadingMore || !_hasMore) return;
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  Future<void> _loadMore() async {
    setState(() => _isLoadingMore = true);
    final repo = context.read<PostsRepository>();
    _page++;
    final next = await repo.fetchFeedPage(_page);
    setState(() {
      _posts = [..._posts, ...next];
      _hasMore = next.length == PostsRepository.pageSize;
      _isLoadingMore = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Explore')),
      body: GridView.builder(
        controller: _scrollController,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3),
        itemCount: _posts.length,
        itemBuilder: (context, i) => GestureDetector(
          onTap: () => Navigator.push(context, MaterialPageRoute(
            builder: (_) => PostDetailScreen(postId: _posts[i].id),
          )),
          child: PostImage(imageUrl: _posts[i].imageUrl),
        ),
      ),
    );
  }
}`,
          pitfalls: [
            '**Building an entirely separate, parallel query/pagination implementation instead of reusing `fetchFeedPage`.** Unnecessary duplication for two screens that currently want identical data. Fix: reuse directly; only fork the implementation later if the two screens\' actual requirements genuinely diverge (e.g. explore later gets a "popular" sort while feed stays chronological).',
            '**Forgetting the `ScrollController` on a `GridView` needs the exact same dispose/listener care as a `ListView`.** Fix: identical discipline as Module 5\'s feed screen.',
            '**Not testing that grid-cell taps correctly open posts from users you do not follow, with full like/comment functionality.** Fix: explicitly test this cross-user case, since it is easy to only test with your own seeded posts during development.',
            '**Treating "explore" as needing genuinely different backend logic (recommendation ranking, etc.) at this course\'s scope.** A reasonable stretch idea for later, not a requirement here — keep the scope proportionate.',
          ],
          tryIt:
            'Open Explore and confirm it shows a mixed grid of posts from multiple different seeded test accounts, tap one from an account you do not follow, and confirm the post detail screen — likes, comments, everything — works identically to any other post.',
          takeaway: 'Explore is mostly assembly of Modules 5 and 6\'s already-built pieces — a good marker of how much foundation this course has laid by this point.',
        },
        {
          id: 'm6-t12',
          title: 'Empty & no-results states, everywhere',
          explain:
            'A deliberate pass across every list/grid screen built this module and the last, ensuring each has a genuine, considered empty state — not a blank screen by accident.',
          analogy:
            'A shop that has run out of a particular item still has a small "temporarily out of stock" card on the shelf, rather than an unexplained gap that makes a customer wonder if they are even in the right aisle.',
          theory:
            'An **empty state** — deliberate copy and/or an icon shown when a list/grid genuinely has zero results — communicates three different things depending on context, and conflating them is a common polish mistake: **"there is nothing here yet"** (a new profile with no posts — encouraging, not alarming), **"no results match your search"** (a search with no hits — helps the user refine, not despair), and **"something went wrong"** (a genuine error — distinct from either empty case above, and should never be silently rendered as if it were just "no results"). Each of LocalInsta\'s list/grid screens — feed, profile grid, explore, followers/following lists, search results, and (Module 5) comments — needs its own, specifically-worded version of whichever of these three states actually applies.',
          whyItMatters:
            'This is a deliberate polish pass, not new functionality — and polish passes like this are exactly what separates a course project from something that feels genuinely finished and shippable. A reviewer or interviewer scrolling through a portfolio app notices empty states (or their absence) immediately.',
          steps: [
            'List every list/grid screen built in Modules 5-6 and identify which of the three empty-state categories applies to each.',
            'Write specific, friendly copy for each — not a generic "No data" everywhere.',
            'Confirm error states (a genuinely failed fetch) are visually and textually distinct from a legitimately-empty successful result.',
            'Test each empty state deliberately: a brand-new test account with zero posts, a search with no matches, a profile with zero followers.',
          ],
          code: `// A small, reusable empty-state widget, parameterized per screen's needs
class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.icon, required this.title, this.subtitle});
  final IconData icon;
  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 48, color: Colors.grey.shade400),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontWeight: FontWeight.w600), textAlign: TextAlign.center),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(subtitle!, style: TextStyle(color: Colors.grey.shade600), textAlign: TextAlign.center),
            ],
          ],
        ),
      ),
    );
  }
}

// Usage per context — specific copy, not generic
// EmptyState(icon: Icons.photo_camera_outlined, title: 'No posts yet', subtitle: 'Share your first photo!')
// EmptyState(icon: Icons.search_off, title: 'No results', subtitle: 'Try a different username')
// EmptyState(icon: Icons.people_outline, title: 'No followers yet')`,
          pitfalls: [
            '**One generic "No data" empty state reused everywhere.** Technically informative, emotionally flat, and a small but real tell of an unfinished-feeling app. Fix: specific, context-appropriate copy per screen.',
            '**Rendering a genuine fetch error identically to a legitimate empty result.** Hides real problems (a broken query, a network failure) behind copy that says "nothing here yet", confusing debugging later and misleading users in the moment. Fix: always distinguish error states from empty-but-successful states.',
            '**Forgetting to test the empty state at all, only ever developing against seeded data.** Fix: deliberately create a genuinely empty scenario (a fresh test account, an unmatched search term) for every list/grid screen before considering it done.',
            '**An empty state with no encouragement or next action where one would help** (e.g. a bare "No posts yet" instead of one that hints "Share your first photo!"). Fix: where natural, nudge toward the obvious next action.',
          ],
          tryIt:
            'Deliberately trigger every empty state across the app — a brand-new account\'s profile grid, a search with an unmatched term, a profile with zero followers — and confirm each shows distinct, appropriate, friendly copy rather than a blank screen or a generic message.',
          takeaway: 'Empty states are a deliberate design decision per screen, not an afterthought — and they are one of the fastest ways to make a project feel genuinely finished.',
        },
      ],
    },
    {
      id: 'm6-s4',
      title: 'The navigation shell',
      topics: [
        {
          id: 'm6-t13',
          title: 'The five-tab bottom navigation',
          explain:
            'Feed, Explore, Post, Notifications, Profile — `HomeScaffold`, the real signed-in home of LocalInsta that `AuthGate` (Module 2) has been pointing at as a placeholder this whole time.',
          analogy:
            'A five-counter service hall — billing, enquiry, deposit, complaints, and the manager\'s office — laid out along one corridor so a visitor always knows exactly which door leads where, from anywhere else in the building.',
          theory:
            '`HomeScaffold` wraps a `Scaffold` with a `bottomNavigationBar: BottomNavigationBar(items: [...], currentIndex: _index, onTap: (i) => setState(() => _index = i))` and a body showing the currently-selected tab\'s screen. The five tabs: **Feed** (Module 5), **Explore** (this module), **Post** (a special tab — tapping it should open `CreatePostScreen` directly as a modal/full-screen route, *not* switch to a persistent "create" tab body, exactly matching how real Instagram\'s centre "+" button behaves), **Notifications** (Module 7), **Profile** (this module, `ProfileScreen(userId: currentUserId)`).\n\nThis is the moment `AuthGate`\'s `AuthSignedIn()` branch (Module 2) stops pointing at a placeholder and becomes the real, fully-featured home of the app — tying together every module built so far into one coherent, navigable whole.',
          whyItMatters:
            'This is a genuine integration milestone: every module from 2 through 6 converges into one real, usable app shell for the first time. It is worth pausing here and using LocalInsta as a real app for a few minutes, not just verifying individual features in isolation.',
          steps: [
            'Build `HomeScaffold` with the five-item `BottomNavigationBar`.',
            'Wire indices 0, 1, 3, 4 to Feed/Explore/Notifications/Profile screen bodies via a simple index-based switch.',
            'Wire index 2 (Post) specially: on tap, immediately push `CreatePostScreen` as a full route, then **revert** `_index` back to whatever tab was active before (never let "Post" become a persistently selected tab).',
            'Replace `AuthGate`\'s `AuthSignedIn() => const HomeScaffold()` placeholder (Module 2) with this real implementation.',
            'Walk the entire app once, tab by tab, confirming every screen built across Modules 5-6 is reachable and functions correctly from this shell.',
          ],
          code: `class HomeScaffold extends StatefulWidget {
  const HomeScaffold({super.key});
  @override
  State<HomeScaffold> createState() => _HomeScaffoldState();
}

class _HomeScaffoldState extends State<HomeScaffold> {
  int _index = 0;

  void _onTap(int i) {
    if (i == 2) {
      // "Post" is an action, not a persistent tab — open it, then snap back
      Navigator.push(context, MaterialPageRoute(builder: (_) => const CreatePostScreen()));
      return;
    }
    setState(() => _index = i);
  }

  @override
  Widget build(BuildContext context) {
    final currentUserId = supabase.auth.currentUser!.id;
    final screens = [
      const FeedScreen(),
      const ExploreScreen(),
      const SizedBox.shrink(), // index 2 never actually renders — Post is action-only
      const NotificationsScreen(), // built in Module 7
      ProfileScreen(userId: currentUserId),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: _onTap,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Feed'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Explore'),
          BottomNavigationBarItem(icon: Icon(Icons.add_box_outlined), label: 'Post'),
          BottomNavigationBarItem(icon: Icon(Icons.favorite_border), label: 'Notifications'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}`,
          pitfalls: [
            '**Letting "Post" become a selectable, persistent tab whose body is `CreatePostScreen`.** Breaks the expected mental model (Post is an action you take, not a place you stay) and leaves an awkward "which tab am I actually on" state after posting. Fix: always push it as a route and revert the index, exactly as shown.',
            '**Forgetting to swap `AuthGate`\'s placeholder for this real `HomeScaffold`.** The whole app still shows a blank spinner screen after sign-in despite every feature being built. Fix: this is the literal final wiring step — do not skip it.',
            '**Rebuilding every tab\'s screen from scratch on every tab switch** (using a plain conditional instead of `IndexedStack`) — covered fully in the very next topic, but worth flagging here too. Fix: `IndexedStack`, not a naive `if`/`else` returning a fresh widget each time.',
            '**Not testing the full app end to end from this shell once assembled.** Individual features tested in isolation can still have integration gaps (a missing import, a provider not reaching a nested screen) that only surface once everything is wired together. Fix: do the full walkthrough described in this topic\'s steps.',
          ],
          tryIt:
            'Do the complete walkthrough: sign in, browse the feed, explore other posts, create a real post, check your own profile grid updated, follow a test account, and confirm every single screen from Modules 2 through 6 is reachable and working from this one shell.',
          takeaway: 'HomeScaffold is where every module from 2 through 6 finally becomes one real, navigable app — and Post is an action, never a persistent tab.',
        },
        {
          id: 'm6-t14',
          title: 'IndexedStack: preserving state across tab switches',
          explain:
            '`IndexedStack` keeps every tab\'s widget alive in memory, just hidden — switching back to Feed after visiting Profile shows you exactly where you scrolled to, not a fresh reload.',
          analogy:
            'Leaving a book open at your exact page on your desk while you step away to another task, versus closing it and losing your place every single time — `IndexedStack` is leaving every tab\'s book open on the desk simultaneously, just stacked, with only the top one currently visible.',
          theory:
            'A naive `body: _index == 0 ? const FeedScreen() : _index == 1 ? const ExploreScreen() : ...` **destroys and recreates** the non-visible tabs\' entire widget trees on every switch — losing scroll position, any in-progress state, and re-triggering every `initState` network fetch redundantly. `IndexedStack(index: _index, children: [...])` instead builds **all** children once and keeps them alive in the widget tree simultaneously, using `Offstage`-like behaviour to show only the selected one — switching tabs is purely a visibility change, not a rebuild.\n\nThe trade-off: all five tabs\' widgets (and their underlying state, controllers, and any active subscriptions) exist in memory simultaneously, even while hidden — a reasonable, deliberate cost for the dramatically better UX of preserved scroll position and no redundant refetching, at LocalInsta\'s scale.',
          whyItMatters:
            'Losing your scroll position every time you glance at your profile and come back to the feed is a small but constant irritation in a badly-built tabbed app — `IndexedStack` is a one-line-of-difference fix that most users will never consciously notice precisely because it behaves the way they already expect.',
          steps: [
            'Confirm `HomeScaffold` (previous topic) already uses `IndexedStack`, not a conditional rebuild.',
            'Scroll partway down the feed, switch to Profile, then switch back to Feed — confirm your scroll position was preserved.',
            'Compare: temporarily swap in a naive conditional instead, repeat the same test, and observe the feed reset to the top — then swap back to `IndexedStack`.',
            'Note the memory trade-off explicitly in your README as a deliberate, understood decision.',
          ],
          code: `// The naive version — DO NOT use this for the main tab shell
Widget naiveBody(int index) {
  if (index == 0) return const FeedScreen();
  if (index == 1) return const ExploreScreen();
  // ...each switch destroys and rebuilds the previous screen entirely
}

// IndexedStack — every tab's widget tree stays alive, just hidden
IndexedStack(
  index: _index,
  children: const [
    FeedScreen(),
    ExploreScreen(),
    SizedBox.shrink(),
    NotificationsScreen(),
    ProfileScreen(userId: 'current-user-id-placeholder'),
  ],
)`,
          pitfalls: [
            '**Using a conditional rebuild "because it seemed simpler".** Works, but silently degrades UX in a way that is easy to miss during quick manual testing (you might not scroll far enough during casual testing to notice the reset). Fix: `IndexedStack` for any tab bar meant to preserve state, as a default habit.',
            '**Assuming `IndexedStack` has no cost.** All children\'s state, controllers, and any open Realtime subscriptions (Module 5\'s feed like-count subscription, for instance) stay active even while a tab is hidden. Fix: acceptable and correct for LocalInsta\'s five tabs; would need reconsidering for a hypothetical app with dozens of heavy tabs.',
            '**Not disposing resources correctly just because the widget never technically leaves the tree.** `dispose()` still only fires when a widget is genuinely removed, which with `IndexedStack` may be "never" for the app\'s lifetime — meaning subscriptions opened in one tab\'s `initState` may need explicit lifecycle awareness (e.g. pausing when not visible) for very resource-heavy screens, a refinement beyond this course\'s required scope.',
            '**Forgetting `ProfileScreen(userId: currentUserId)` needs the real current user id, not a hardcoded placeholder, when wiring the actual `children` list.** Fix: read `supabase.auth.currentUser!.id` at the point `HomeScaffold` builds its children list.',
          ],
          tryIt:
            'Scroll deep into the feed, switch through all five tabs in sequence, then switch back to Feed and confirm you land exactly where you left off — this single test is the entire point of this topic.',
          takeaway: 'IndexedStack trades a small, deliberate memory cost for scroll-position and state preservation across tabs — the right trade-off at LocalInsta\'s scale.',
        },
        {
          id: 'm6-t15',
          title: 'Navigating into a profile from anywhere',
          explain:
            'Every username, avatar, and comment author across the entire app pushes the same `ProfileScreen(userId: ...)` — one navigation target, reachable consistently from a dozen different places.',
          analogy:
            'Every signpost in a well-run town, no matter which street it stands on, points to the same "Town Hall" using the same name — not five different signs calling it five different things depending on which street you happen to be standing on.',
          theory:
            'Every place LocalInsta shows a username or avatar — a feed post\'s header, a comment tile, a search result, a followers list row, a like-list entry (a natural stretch feature) — should wire an identical `onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => ProfileScreen(userId: authorId)))`. Because `ProfileScreen` was deliberately built (earlier this module) to take only a `userId` and fetch everything fresh itself, this is a trivial, uniform wire-up everywhere — no special-casing needed depending on *where* the tap originated.\n\nThis is the payoff of a navigation convention established once (Module 5\'s "pass the id, not the object") and applied with discipline throughout: by this point in the course, adding a new tappable-username surface anywhere in the app is a one-line change, not a new pattern to invent.',
          whyItMatters:
            'A social app where tapping a username *sometimes* works and sometimes does not (because one screen was built before this convention was established, or someone forgot to wire it) is a genuinely common, avoidable inconsistency in real apps — this topic is explicitly about closing every such gap deliberately.',
          steps: [
            'Audit every screen built in Modules 5-6 for a username or avatar that is not yet tappable.',
            'Wire each to the identical `ProfileScreen(userId: ...)` push shown above.',
            'Specifically check: feed post headers, comment tile authors, search results, follower/following list rows.',
            'Test navigating into a profile from at least three different originating screens and confirm all land on the identical, fully-functional profile screen.',
          ],
          code: `// One small, reusable helper keeps this wiring consistent everywhere
void openProfile(BuildContext context, String userId) {
  Navigator.push(context, MaterialPageRoute(builder: (_) => ProfileScreen(userId: userId)));
}

// Used identically from every surface:
// Feed post header:      onTap: () => openProfile(context, post.userId)
// Comment tile:           onTap: () => openProfile(context, comment.author.id)
// Search result row:      onTap: () => openProfile(context, profile.id)
// Follower list row:      onTap: () => openProfile(context, profile.id)`,
          pitfalls: [
            '**A different navigation shape from different origin screens** (one place pushes `ProfileScreen(userId: ...)`, another accidentally pushes a stale, pre-fetched `Profile` object). Fix: one small shared `openProfile` helper, used everywhere, removes the chance of drift entirely.',
            '**Missing tappability on a username somewhere, discovered only by a user (or reviewer) tapping it and nothing happening.** Fix: the explicit audit step in this topic\'s steps exists precisely to catch this before anyone else does.',
            '**Navigating to your own profile via this generic path instead of the dedicated Profile tab, causing a confusing "two different ways to reach the same screen with slightly different back-stack behaviour" experience.** Acceptable and expected — `ProfileScreen(userId: currentUserId)` correctly shows the Edit button either way, since the ownership check (this module\'s earlier topic) is based on the id, not on *how* you navigated there.',
            '**Forgetting this convention the next time a new feature adds a new username-bearing surface** (Module 8\'s chat, for instance). Fix: treat `openProfile` as the permanent, standard way to link to any profile from anywhere in the app, going forward.',
          ],
          tryIt:
            'From the feed, tap a post\'s username to reach their profile; go back, open a post\'s comments and tap a commenter\'s name; go back, search for and tap a result — confirm all three journeys land on a correctly-functioning `ProfileScreen` for the right user.',
          takeaway: 'One shared openProfile helper, used everywhere a username appears, is what keeps navigation consistent as the app keeps growing.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm6-p1',
      type: 'Project',
      title: 'Profiles, Follow & the Real Navigation Shell',
      domain: 'Profile / Social Graph',
      duration: '3 hours',
      description:
        'Build the full profile experience — header, grid, edit flow, an optimistic follow system backed by counter triggers, followers/following lists with the disambiguated-join technique, and the five-tab HomeScaffold that finally replaces AuthGate\'s placeholder.',
      tools: ['Flutter', 'supabase_flutter', 'provider'],
      blueprint: {
        overview:
          'A branched ProfileScreen (own profile shows Edit, others show Follow) built from a reusable header and post grid; a trigger-backed follow/unfollow system with an optimistic FollowButton; followers/following list screens using disambiguated foreign-key joins; and a real five-tab HomeScaffold wired as the true signed-in home of the app.',
        functionalRequirements: [
          '**Profile screen.** One screen, branched by identity, showing the correct action button and a working post grid.',
          '**Edit profile.** Username/bio editing with client + database validation and a friendly duplicate-username error.',
          '**Follow system.** Insert/delete on follows, protected by existing RLS, with an optimistic FollowButton and accurate counter triggers.',
          '**Followers/Following lists.** Correctly disambiguated joins, each row followable/unfollowable inline.',
          '**HomeScaffold.** Five real tabs (Feed, Explore, Post-as-action, Notifications placeholder, Profile), using IndexedStack, replacing AuthGate\'s Module 2 placeholder.',
        ],
        technicalImplementation: [
          '**supabase/migrations/0005_follow_triggers.sql.** increment/decrement_follow_counts trigger functions and triggers.',
          '**features/profile/data/{follow_repository.dart, search_repository.dart}.**',
          '**features/profile/presentation/{profile_screen.dart, edit_profile_screen.dart, follow_button.dart, follow_list_screen.dart}.**',
          '**app.dart / home_scaffold.dart.** The real five-tab shell, wired into AuthGate.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Follow counter triggers migration',
            outcome: 'follower_count/following_count stay accurate automatically.',
            prompt:
              'Write supabase/migrations/0005_follow_triggers.sql with increment_follow_counts() and decrement_follow_counts() trigger functions (each updating both the follower\'s following_count and the followed user\'s follower_count, clamped at zero on decrement) and their after insert/delete triggers on public.follows. Include a verification query testing both directions with two seed profiles.',
          },
          {
            step: 2,
            label: 'ProfileScreen, header, grid, edit flow',
            outcome: 'A working, branched profile screen with editing.',
            prompt:
              'Build lib/features/profile/presentation/profile_screen.dart(userId) with a ProfileHeader (avatar, stats, bio, tappable follower/following counts) and a three-column post grid (reusing PostImage and pushing PostDetailScreen(postId) on tap), branching between an Edit Profile button (own profile) and a FollowButton (others). Build edit_profile_screen.dart with username/bio fields, client-side validation matching the Module 3 username check constraint, and friendly handling of a unique-constraint violation on save.',
          },
          {
            step: 3,
            label: 'FollowRepository + optimistic FollowButton + lists',
            outcome: 'A complete, instant-feeling follow system.',
            prompt:
              'Create lib/features/profile/data/follow_repository.dart with follow/unfollow (catching and ignoring a duplicate-follow unique-constraint error) and fetchFollowers/fetchFollowing using the disambiguated profiles!follows_follower_id_fkey / profiles!follows_following_id_fkey join syntax. Build follow_button.dart with optimistic instant toggle-and-rollback-on-failure. Build follow_list_screen.dart(userId, mode) rendering a ListView of profile tiles each with an inline FollowButton, with a mode-appropriate empty state.',
          },
          {
            step: 4,
            label: 'HomeScaffold replacing the AuthGate placeholder',
            outcome: 'The real, fully wired signed-in home of LocalInsta.',
            prompt:
              'Build lib/features/home/home_scaffold.dart with a BottomNavigationBar (Feed, Explore, Post, Notifications-placeholder, Profile) using IndexedStack to preserve tab state, where tapping "Post" pushes CreatePostScreen as a route and reverts the selected index rather than becoming a persistent tab. Replace the AuthSignedIn() branch in lib/app.dart\'s AuthGate (from Module 2) to render this HomeScaffold instead of the old placeholder. Confirm the full app is now navigable end to end from sign-in.',
          },
        ],
        deliverable:
          'A fully navigable LocalInsta: sign in, land on a real five-tab home, browse the feed and explore grid, view and edit your own profile, follow another test account and see both counters update, and confirm your scroll position survives switching tabs.',
      },
    },
  ],
  quiz: [
    {
      id: 'm6-q1',
      q: 'Why does the profile header read `profiles.post_count`/`follower_count`/`following_count` directly instead of running three count(*) queries?',
      options: [
        'The denormalized columns, kept accurate by triggers, make the header a fast single-row fetch instead of three aggregate queries',
        'Postgres cannot run count(*) queries on the profiles table',
        'It is required by Row Level Security',
        'It has no real performance benefit, only style',
      ],
      answer: 0,
    },
    {
      id: 'm6-q2',
      q: 'Why does ProfileScreen use one branched implementation instead of two separate screens for "my profile" vs "someone else\'s profile"?',
      options: [
        'It avoids two near-duplicate screens drifting out of sync as the header/grid evolve over time',
        'Flutter does not allow more than one profile-related screen',
        'RLS requires a single shared screen',
        'It reduces the number of database queries needed',
      ],
      answer: 0,
    },
    {
      id: 'm6-q3',
      q: 'Why does fetching a user\'s followers require specifying the foreign-key constraint name (e.g. `profiles!follows_follower_id_fkey`) in the embedded select?',
      options: [
        'The follows table has two foreign keys to profiles, so PostgREST needs to know which relationship the query means',
        'It is required syntax for every embedded select regardless of the table',
        'It makes the query run faster',
        'It is only needed when RLS is disabled',
      ],
      answer: 0,
    },
    {
      id: 'm6-q4',
      q: 'Why does the search screen debounce the search-as-you-type input instead of querying on every keystroke?',
      options: [
        'It collapses many wasted, immediately-superseded requests into roughly one request per pause in typing',
        'Supabase blocks more than one request per second',
        'Debouncing is required for ilike queries to function',
        'It has no real effect on the number of requests sent',
      ],
      answer: 0,
    },
    {
      id: 'm6-q5',
      q: 'Why does tapping the "Post" tab push CreatePostScreen as a route instead of making it a persistently selected tab in the bottom navigation?',
      options: [
        'Posting is a one-off action, not a place to stay — matching the expected mental model from real Instagram-style apps',
        'IndexedStack does not support a fifth tab',
        'CreatePostScreen cannot be reached any other way',
        'It has no practical difference either way',
      ],
      answer: 0,
    },
    {
      id: 'm6-q6',
      q: 'Why does HomeScaffold use IndexedStack instead of a conditional that rebuilds the selected tab\'s screen from scratch each time?',
      options: [
        'IndexedStack keeps every tab\'s widget tree alive, preserving scroll position and state instead of resetting it on every tab switch',
        'IndexedStack uses less memory than a conditional rebuild',
        'A conditional rebuild is not valid Dart syntax inside a Scaffold body',
        'It has no meaningful effect on user experience',
      ],
      answer: 0,
    },
  ],
}
