// Module 5 — Feed, Posts, Likes & Comments
// LocalInsta (Flutter + Supabase) course content for the React course player.

export const m5 = {
  id: 'm5',
  title: 'Feed, Posts, Likes & Comments',
  hours: 11,
  color: 'from-orange-500/20 to-orange-700/10',
  accent: 'orange',
  description:
    'Build the beating heart of LocalInsta: a paginated, pull-to-refresh feed; the full post-creation flow; a double-tap like gesture wired to the toggle_like RPC; and a realtime comment thread powered by Supabase Realtime\'s Postgres Changes.',
  sections: [
    {
      id: 'm5-s1',
      title: 'The feed query & pagination',
      topics: [
        {
          id: 'm5-t1',
          title: 'The feed query: joining posts to profiles',
          explain:
            '`supabase.from(\'posts\').select(\'*, profiles(username, avatar_url)\')` fetches each post together with its owner\'s display data in a single round-trip.',
          analogy:
            'A restaurant bill that already shows the waiter\'s name printed on it, rather than making the cashier separately look up "who served table 4?" for every single bill — one query, everything you need to render a post card, no follow-up lookups.',
          theory:
            'PostgREST (the auto-generated API layer Supabase Storage/Postgres calls run through) supports **embedded resource** syntax: `select(\'*, profiles(username, avatar_url)\')` follows the `posts.user_id -> profiles.id` foreign key from Module 3 and nests the related profile fields directly into each returned post object — a genuine SQL join under the hood, expressed as a simple nested select in the Dart client, with zero manual join-writing required.\n\nThe result comes back as `List<Map<String, dynamic>>`, where each post map has a nested `profiles` map inside it. Parsing this into a proper `Post` Dart model (Module 0\'s `copyWith` pattern) means writing a `Post.fromMap` factory that reads both the top-level post fields and the nested profile fields in one pass.',
          whyItMatters:
            'Avoiding "N+1 queries" — one query for posts, then a separate query per post to fetch its owner — is one of the most impactful things you can get right in a feed screen. This embedded-select syntax gets you there for free, without hand-writing SQL joins.',
          steps: [
            'Write `PostsRepository.fetchFeed()` calling `supabase.from(\'posts\').select(\'*, profiles(username, avatar_url)\').order(\'created_at\', ascending: false)`.',
            'Define a `Post` model with a nested `PostAuthor` (username, avatarUrl) — both immutable, both with `copyWith`.',
            'Write `Post.fromMap(Map<String, dynamic> map)` parsing both levels.',
            'Call `fetchFeed()` from a scratch script or a temporary debug button and print the first result\'s username to confirm the join worked.',
          ],
          code: `class PostAuthor {
  const PostAuthor({required this.username, this.avatarUrl});
  final String username;
  final String? avatarUrl;

  factory PostAuthor.fromMap(Map<String, dynamic> map) => PostAuthor(
        username: map['username'] as String,
        avatarUrl: map['avatar_url'] as String?,
      );
}

class Post {
  const Post({
    required this.id,
    required this.userId,
    required this.imageUrl,
    required this.likeCount,
    required this.commentCount,
    required this.createdAt,
    required this.author,
    this.caption,
  });

  final String id;
  final String userId;
  final String imageUrl;
  final String? caption;
  final int likeCount;
  final int commentCount;
  final DateTime createdAt;
  final PostAuthor author;

  factory Post.fromMap(Map<String, dynamic> map) => Post(
        id: map['id'] as String,
        userId: map['user_id'] as String,
        imageUrl: map['image_url'] as String,
        caption: map['caption'] as String?,
        likeCount: map['like_count'] as int,
        commentCount: map['comment_count'] as int,
        createdAt: DateTime.parse(map['created_at'] as String),
        author: PostAuthor.fromMap(map['profiles'] as Map<String, dynamic>),
      );
}

class PostsRepository {
  PostsRepository({SupabaseClient? client}) : _client = client ?? Supabase.instance.client;
  final SupabaseClient _client;

  Future<List<Post>> fetchFeed() async {
    final rows = await _client
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .order('created_at', ascending: false);
    return (rows as List).map((r) => Post.fromMap(r as Map<String, dynamic>)).toList();
  }
}`,
          pitfalls: [
            '**Fetching posts, then looping to fetch each owner\'s profile separately.** Exactly the N+1 pattern this embedded-select syntax exists to avoid — dozens of extra round-trips for a feed of dozens of posts. Fix: always reach for the nested `select` syntax first.',
            '**Forgetting the embedded table name (`profiles`) must exactly match Postgres\'s foreign-key-derived relationship name.** A typo here fails with a fairly clear "could not find a relationship" error from PostgREST — read it carefully rather than assuming it is a Dart-side bug.',
            '**Not casting nested maps correctly in `fromMap`.** `map[\'profiles\']` comes back as `Map<String, dynamic>` at runtime but Dart\'s type system needs an explicit cast, or you get subtle type errors. Fix: cast deliberately at every level, as shown.',
            '**Selecting `\'*\'` on the embedded `profiles` when you only need two fields.** Pulls extra data (bio, counts) into every single feed post unnecessarily. Fix: name exactly the nested fields you need, `profiles(username, avatar_url)`, not a nested `*`.',
          ],
          tryIt:
            'Run `fetchFeed()` against your seeded test data from Module 3 and confirm each returned `Post` correctly carries its author\'s `username` — with zero separate profile-lookup queries anywhere in your code.',
          takeaway: 'One embedded select gets you posts and their authors together — never loop back to fetch owner data post-by-post.',
        },
        {
          id: 'm5-t2',
          title: 'Range-based pagination with .range()',
          explain:
            '`.range(from, to)` fetches a specific slice of results — the foundation for loading the feed in pages instead of all at once.',
          analogy:
            'A library does not hand you the entire card catalogue at once — you request drawer 1, then drawer 2, as you need them. `.range(0, 19)` then `.range(20, 39)` is asking for exactly those drawers, one at a time.',
          theory:
            '`supabase.from(\'posts\').select(...).order(\'created_at\', ascending: false).range(0, 19)` fetches rows 0 through 19 (20 rows, zero-indexed and inclusive on both ends) of the ordered result set — the next page is `.range(20, 39)`, and so on. This is **offset-based** pagination: simple to reason about and implement, genuinely fine for LocalInsta\'s scale (a personal or small-community app), though it has a well-known theoretical weakness at very large scale — if new posts are inserted while a user is paging through, row *positions* can shift slightly between pages (an occasional skipped or repeated post at a page boundary), unlike cursor-based pagination (used in the billing course in this portfolio via Firestore\'s `startAfterDocument`), which anchors to a specific row\'s value instead of a numeric position.\n\nFor LocalInsta\'s feed, range-based pagination\'s simplicity is the right trade-off — the occasional boundary edge case is a minor, rare cosmetic issue, not a correctness bug, and it keeps the pagination code genuinely simple to read and maintain.',
          whyItMatters:
            'Understanding *why* you are choosing offset-based pagination here — not just how to call `.range()` — means you can make an informed call the next time you are picking a pagination strategy for a different app, rather than cargo-culting whichever one you saw first.',
          steps: [
            'Add a `static const pageSize = 20;` constant to `PostsRepository`.',
            'Change `fetchFeed()` to `fetchFeedPage(int page)` calling `.range(page * pageSize, (page + 1) * pageSize - 1)`.',
            'Call page 0, then page 1, against your seed data and print each page\'s post count and first post id.',
            'Confirm a page returning fewer than `pageSize` rows means you have reached the end of the feed.',
          ],
          code: `class PostsRepository {
  // ...existing code...
  static const pageSize = 20;

  Future<List<Post>> fetchFeedPage(int page) async {
    final from = page * pageSize;
    final to = from + pageSize - 1;
    final rows = await _client
        .from('posts')
        .select('*, profiles(username, avatar_url)')
        .order('created_at', ascending: false)
        .range(from, to);
    return (rows as List).map((r) => Post.fromMap(r as Map<String, dynamic>)).toList();
  }
}

// A page with fewer than pageSize results means: no more pages
final page0 = await postsRepo.fetchFeedPage(0); // rows 0-19
final page1 = await postsRepo.fetchFeedPage(1); // rows 20-39
final hasMore = page1.length == PostsRepository.pageSize;`,
          pitfalls: [
            '**Off-by-one errors in the range math.** `.range()` is inclusive on both ends, so page 1 is `(20, 39)`, not `(20, 40)`. Fix: always compute `to` as `from + pageSize - 1`.',
            '**Fetching the entire feed at once "since it is a small app".** Works today, becomes a real problem the moment there are hundreds of posts — pagination is cheap to build now and expensive to retrofit under time pressure later. Fix: paginate from the start, even at small scale.',
            '**Assuming `.range()` alone guarantees stable ordering without an explicit `.order()`.** Without an explicit sort, Postgres does not guarantee consistent row order across separate queries. Fix: always pair `.range()` with an explicit `.order()`.',
            '**Not handling the "reached the end" case in the UI.** A feed that keeps showing a loading spinner forever after the last real page looks broken. Fix: track `hasMore` and stop triggering further loads once a short page comes back.',
          ],
          tryIt:
            'Seed at least 25 test posts (via a quick SQL insert loop), then call `fetchFeedPage(0)` and `fetchFeedPage(1)` and confirm you get 20 posts then 5, with `hasMore` correctly flipping to `false` after the second page.',
          takeaway: 'Offset-based .range() pagination is simple and correct at LocalInsta\'s scale — know its rare edge-case trade-off, and choose it deliberately, not by default.',
        },
        {
          id: 'm5-t3',
          title: 'Infinite scroll with a ScrollController',
          explain:
            'A `ScrollController` listener that fires near the bottom of the list triggers loading the next page automatically — the classic infinite-scroll pattern.',
          analogy:
            'A tea-stall server who notices your cup is nearly empty and brings a refill before you even ask — a `ScrollController` watching the scroll position near the bottom of the list is exactly that anticipatory refill trigger for the next page of posts.',
          theory:
            'Attach a `ScrollController` to the feed\'s `ListView.builder` (Module 0\'s pattern) and add a listener checking `controller.position.pixels >= controller.position.maxScrollExtent - 200` — "within 200 logical pixels of the bottom" — as the trigger to fetch the next page, giving the network request a head start before the user actually hits the literal end of the list, so the next page is often ready before they need it.\n\nGuard the load-more call with an `isLoadingMore` flag to prevent firing multiple overlapping requests as the listener fires repeatedly during a fast scroll gesture — exactly the same double-submit problem Module 2\'s auth forms solved with a `_submitting` bool, now applied to pagination.',
          whyItMatters:
            'This exact `ScrollController` + threshold + in-flight guard pattern is the standard shape of infinite scroll in every production Flutter app with a feed, chat, or search-results list — genuinely reusable knowledge well beyond LocalInsta.',
          steps: [
            'Add a `ScrollController _scrollController` field to the feed screen\'s State.',
            'In `initState`, add a listener checking the near-bottom threshold.',
            'In `FeedState` (a `ChangeNotifier`), add `loadMore()` guarded by an `isLoadingMore` bool, appending the next page\'s results to the existing list.',
            'Wire the `ListView.builder`\'s `controller:` to `_scrollController`.',
            'Add a small loading-footer widget at the end of the list, visible only while `isLoadingMore` is true.',
            'Always `dispose()` the `ScrollController`.',
          ],
          code: `class FeedState extends ChangeNotifier {
  FeedState(this._repo);
  final PostsRepository _repo;

  List<Post> posts = [];
  int _page = 0;
  bool isLoading = false;
  bool isLoadingMore = false;
  bool hasMore = true;

  Future<void> loadFirstPage() async {
    isLoading = true;
    notifyListeners();
    posts = await _repo.fetchFeedPage(0);
    _page = 0;
    hasMore = posts.length == PostsRepository.pageSize;
    isLoading = false;
    notifyListeners();
  }

  Future<void> loadMore() async {
    if (isLoadingMore || !hasMore) return; // guard against overlapping calls
    isLoadingMore = true;
    notifyListeners();
    final nextPage = await _repo.fetchFeedPage(_page + 1);
    posts = [...posts, ...nextPage];
    _page++;
    hasMore = nextPage.length == PostsRepository.pageSize;
    isLoadingMore = false;
    notifyListeners();
  }
}

// In the feed screen's State
final _scrollController = ScrollController();

@override
void initState() {
  super.initState();
  _scrollController.addListener(() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      context.read<FeedState>().loadMore();
    }
  });
  context.read<FeedState>().loadFirstPage();
}

@override
void dispose() {
  _scrollController.dispose();
  super.dispose();
}`,
          pitfalls: [
            '**No `isLoadingMore` guard.** A fast scroll fires the listener many times, each triggering an overlapping fetch of the same next page, potentially duplicating posts in the list. Fix: always guard with an in-flight boolean.',
            '**Triggering exactly at `maxScrollExtent` instead of with a buffer.** The next page only starts loading once the user is already staring at the very bottom, creating a visible pause. Fix: a 150-300px threshold gives the request a head start.',
            '**Forgetting to dispose the `ScrollController`.** Leaks memory, and can trigger a listener callback on a disposed context. Fix: always `dispose()` in the State\'s own `dispose()`.',
            '**Not checking `hasMore` before calling `loadMore()`.** Keeps firing pointless requests past the true end of the feed. Fix: short-circuit immediately when `hasMore` is false.',
          ],
          tryIt:
            'With your 25+ seeded test posts, scroll the real feed screen and confirm the next page loads automatically before you hit the literal bottom, with no duplicate posts and no overlapping loading spinners during a fast scroll.',
          takeaway: 'A near-bottom threshold plus an in-flight guard is the entire recipe for correct, non-duplicating infinite scroll.',
        },
        {
          id: 'm5-t4',
          title: 'Pull-to-refresh',
          explain:
            'A `RefreshIndicator` wraps the feed, resetting to page 0 and reloading — the standard "check for new posts" gesture on every mobile feed.',
          analogy:
            'Shaking a thermos to check if there is still hot coffee inside before pouring — pull-to-refresh is that quick "let me check what\'s new" gesture users reach for instinctively at the top of any feed.',
          theory:
            '`RefreshIndicator(onRefresh: () => context.read<FeedState>().refresh(), child: ListView.builder(...))` gives the native circular pull-down animation for free — the `onRefresh` callback must return a `Future` that completes when the refresh is done, which is exactly `FeedState.refresh()`\'s job: reset `_page` to 0, clear `posts`, refetch the first page, replacing (not appending to) the existing list.\n\nThis is deliberately a **different** method from `loadFirstPage()` (used on initial screen load) versus `refresh()` (used on pull-to-refresh) conceptually, even though their implementation is nearly identical — separating the intent makes the `FeedState` class\'s public API read clearly to anyone maintaining it later.',
          whyItMatters:
            'Pull-to-refresh is one of the most muscle-memory gestures on mobile — omitting it, or implementing it so it silently does nothing, is a small but noticeable polish gap users will immediately notice on a social feed.',
          steps: [
            'Add `Future<void> refresh()` to `FeedState`, resetting `_page` to 0 and calling the exact same fetch logic as `loadFirstPage()`.',
            'Wrap the feed\'s `ListView.builder` in `RefreshIndicator(onRefresh: ..., child: ...)`.',
            'Ensure `RefreshIndicator`\'s child list has `physics: const AlwaysScrollableScrollPhysics()` (Module 0\'s pattern) so pull-to-refresh works even when the feed is short enough not to naturally scroll.',
            'Test on a real device: pull down, observe the native spinner, confirm the feed genuinely refetches (add a temporary new test post via SQL Editor mid-test to see it appear).',
          ],
          code: `class FeedState extends ChangeNotifier {
  // ...loadFirstPage, loadMore from previous topic...

  Future<void> refresh() async {
    _page = 0;
    hasMore = true;
    final freshFirstPage = await _repo.fetchFeedPage(0);
    posts = freshFirstPage; // replace, not append
    hasMore = freshFirstPage.length == PostsRepository.pageSize;
    notifyListeners();
  }
}

// Feed screen build method
RefreshIndicator(
  onRefresh: () => context.read<FeedState>().refresh(),
  child: ListView.builder(
    controller: _scrollController,
    physics: const AlwaysScrollableScrollPhysics(),
    itemCount: feedState.posts.length + (feedState.isLoadingMore ? 1 : 0),
    itemBuilder: (context, i) {
      if (i >= feedState.posts.length) {
        return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()));
      }
      return PostCard(post: feedState.posts[i]);
    },
  ),
)`,
          pitfalls: [
            '**`onRefresh` not returning the actual Future from the fetch call.** The native spin-down animation completes immediately instead of waiting for real data, looking broken. Fix: always `return` (or directly pass) the awaited Future\'s chain.',
            '**Forgetting `AlwaysScrollableScrollPhysics`.** On a short feed with only a couple of posts (not enough content to scroll naturally), pull-to-refresh cannot be triggered at all. Fix: always set this physics on a `RefreshIndicator`\'s child.',
            '**Appending the refreshed first page to the existing list instead of replacing it.** Duplicates every post already shown. Fix: `refresh()` replaces `posts` wholesale, `loadMore()` appends — keep this distinction clear.',
            '**Resetting `hasMore` incorrectly after a refresh.** If forgotten, a feed that had reached its end before refreshing might never allow loading more again even though new content exists. Fix: recompute `hasMore` fresh, exactly as the initial load does.',
          ],
          tryIt:
            'Insert a brand-new test post directly via SQL Editor, then pull-to-refresh the real feed screen on your device and confirm the new post appears at the top within a couple of seconds.',
          takeaway: 'refresh() replaces the first page wholesale; loadMore() appends the next one — two distinct, clearly-named operations on the same FeedState.',
        },
      ],
    },
    {
      id: 'm5-s2',
      title: 'Creating a post',
      topics: [
        {
          id: 'm5-t5',
          title: 'The create-post screen',
          explain:
            'A dedicated screen chaining Module 4\'s media pipeline with a caption field and a "Share" button — LocalInsta\'s core content-creation flow.',
          analogy:
            'A tiffin-centre order slip: pick your dish (the photo), add any special instructions (the caption), hand it to the counter (Share) — three deliberate, distinct steps, not one confusing blur.',
          theory:
            '`CreatePostScreen` opens directly into Module 4\'s pick-and-crop flow (skipping a blank intermediate screen — Instagram-style apps open the picker immediately on tapping the "+" tab), then shows a preview of the cropped image with a caption `TextField` below it and a "Share" button in the app bar. This screen intentionally does **not** do the compression or upload itself inline as the user types — those happen only once, on submit, keeping the screen\'s job focused on "gather the inputs", not "manage the network request" (that responsibility belongs to `CreatePostState`, next topic).',
          whyItMatters:
            'Keeping this screen\'s responsibility narrow — collect inputs, delegate the actual submission — is the same separation-of-concerns principle from every repository/state pattern this course has built since Module 2, applied consistently to a new screen.',
          steps: [
            'Build `CreatePostScreen` as a `StatefulWidget` that immediately calls Module 4\'s `pickPostImage` + `cropToSquare` in `initState` (or on first build via a post-frame callback).',
            'If the user cancels the picker/cropper, `Navigator.pop` back to the previous tab immediately — no empty screen with nothing to do.',
            'Show the cropped image as a preview (`Image.file` for the local cropped file — not `CachedNetworkImage`, since it is not uploaded yet).',
            'Add a multi-line `TextField` below for the caption, with a reasonable `maxLength`.',
            'Add a "Share" button in the `AppBar` calling `CreatePostState.submit(...)` (Module 4\'s pattern), disabled while `status == UploadStatus.uploading`.',
          ],
          code: `class CreatePostScreen extends StatefulWidget {
  const CreatePostScreen({super.key});
  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  CroppedFile? _cropped;
  final _captionController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _pickAndCrop());
  }

  Future<void> _pickAndCrop() async {
    final picked = await pickPostImage(context);
    if (picked == null) {
      if (mounted) Navigator.pop(context);
      return;
    }
    final cropped = await cropToSquare(picked.path);
    if (cropped == null) {
      if (mounted) Navigator.pop(context);
      return;
    }
    setState(() => _cropped = cropped);
  }

  @override
  Widget build(BuildContext context) {
    final createState = context.watch<CreatePostState>();
    final uploading = createState.status == UploadStatus.uploading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('New post'),
        actions: [
          TextButton(
            onPressed: (_cropped == null || uploading) ? null : _submit,
            child: uploading
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Share'),
          ),
        ],
      ),
      body: _cropped == null
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                AspectRatio(aspectRatio: 1, child: Image.file(File(_cropped!.path), fit: BoxFit.cover)),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: TextField(
                    controller: _captionController,
                    maxLength: 500,
                    maxLines: 3,
                    decoration: const InputDecoration(hintText: 'Write a caption...'),
                  ),
                ),
              ],
            ),
    );
  }

  Future<void> _submit() async {
    final bytes = await compressForUpload(_cropped!.path);
    await context.read<CreatePostState>().submit(
          imageBytes: bytes,
          userId: supabase.auth.currentUser!.id,
          caption: _captionController.text.trim().isEmpty ? null : _captionController.text.trim(),
        );
    if (mounted && context.read<CreatePostState>().status == UploadStatus.success) {
      Navigator.pop(context);
    }
  }
}`,
          pitfalls: [
            '**Compressing the image immediately on crop, before the user has even written a caption.** Wastes CPU/battery if they end up cancelling instead of sharing. Fix: compress only at actual submit time, exactly as shown.',
            '**Leaving an empty caption stored as an empty string instead of `null`.** Module 3\'s schema treats `caption` as nullable specifically to distinguish "no caption" cleanly. Fix: trim and convert empty input to `null` before submitting.',
            '**Not popping back automatically on success.** Leaves the user staring at a stale create-post screen after a successful share. Fix: check `status == UploadStatus.success` and pop.',
            '**No cancel/back affordance if the user changes their mind after cropping but before sharing.** Fix: the standard `AppBar` back button already provides this via normal Navigator behaviour — just confirm it is not accidentally disabled.',
          ],
          tryIt:
            'Walk through the full flow on a real device: tap the create tab, pick a photo, crop it, write a caption, tap Share, and confirm you land back on the feed with your new post visible (the next topic covers exactly how it appears without a manual refresh).',
          takeaway: 'The create-post screen only gathers inputs and previews them — it delegates the actual compress-and-upload work to submit time, not before.',
        },
        {
          id: 'm5-t6',
          title: 'PostsRepository.createPost',
          explain:
            'One insert, returning the newly created row (with its owner join) so the feed can display it immediately without a full refetch.',
          analogy:
            'A tailor who hands you the finished garment the moment it is stitched, rather than making you come back tomorrow and ask "is it ready?" — an insert that returns the created row (via `.select()`) hands your Flutter code the finished `Post` object immediately.',
          theory:
            '`supabase.from(\'posts\').insert({...}).select(\'*, profiles(username, avatar_url)\').single()` does two things in one round-trip: inserts the new row (Module 3\'s RLS `with check (auth.uid() = user_id)` policy protects this exactly as it protects every other post write), and immediately re-selects it — with the same embedded-profile join from earlier this module — so the caller gets back a fully-formed `Post` object, complete with the author\'s username/avatar, ready to prepend straight into the feed\'s `posts` list.\n\n`.single()` asserts exactly one row is returned (true for a fresh insert) and unwraps it from the list PostgREST would otherwise return, saving a manual `.first` access.',
          whyItMatters:
            'Returning the created row from an insert — rather than inserting blind and trusting the client\'s own copy of what it sent — guarantees the Flutter-side `Post` object reflects exactly what the database actually stored (including server-set defaults like `created_at`, `like_count: 0`), never a client-side guess that could drift from reality.',
          steps: [
            'Add `Future<Post> createPost({required String imageUrl, String? caption})` to `PostsRepository`.',
            'Build the insert map: `user_id` (from `supabase.auth.currentUser!.id`), `image_url`, `caption`.',
            'Chain `.select(\'*, profiles(username, avatar_url)\').single()` onto the insert call.',
            'Parse the single returned row through the same `Post.fromMap` from earlier this module.',
            'Wire `CreatePostState.submit()` (Module 4\'s pattern) to call this after a successful upload, then prepend the result into `FeedState.posts`.',
          ],
          code: `class PostsRepository {
  // ...existing fetchFeedPage code...

  Future<Post> createPost({required String imageUrl, String? caption}) async {
    final userId = _client.auth.currentUser!.id;
    final row = await _client
        .from('posts')
        .insert({
          'user_id': userId,
          'image_url': imageUrl,
          'caption': caption,
        })
        .select('*, profiles(username, avatar_url)')
        .single();
    return Post.fromMap(row);
  }
}

// CreatePostState.submit — extending Module 4's pattern
Future<void> submit({required Uint8List imageBytes, required String userId, String? caption}) async {
  status = UploadStatus.uploading;
  notifyListeners();
  try {
    final path = buildUploadPath(userId: userId, extension: 'jpg');
    final url = await _storageRepo.uploadImageBytes(bucket: 'posts', path: path, bytes: imageBytes);
    final newPost = await _postsRepo.createPost(imageUrl: url, caption: caption);
    _feedState.prependNewPost(newPost); // instant feed update — see next topic
    status = UploadStatus.success;
  } catch (e) {
    status = UploadStatus.failed;
    errorMessage = e.toString();
  } finally {
    notifyListeners();
  }
}`,
          pitfalls: [
            '**Building the `Post` object client-side from the input data instead of re-selecting after insert.** Misses server-set fields like the real `created_at` timestamp and the database-assigned `id`, and risks drifting from what was actually stored. Fix: always `.select().single()` after an insert you need to immediately use.',
            '**Forgetting `.single()` and handling a `List` with one element awkwardly everywhere the created post is used.** Fix: `.single()` cleanly unwraps it once, at the source.',
            '**Not setting `user_id` explicitly, relying on some assumed default.** Postgres has no way to know who is inserting beyond what you explicitly pass — Module 3\'s RLS `with check` policy will reject a mismatched or missing value outright. Fix: always set it explicitly from the current session.',
            '**Racing the upload and the insert — starting the database insert before the Storage upload has genuinely completed.** Fix: strict sequential await, exactly as Module 4\'s avatar flow established.',
          ],
          tryIt:
            'Call `createPost` directly from a scratch test with a real uploaded image URL, and confirm the returned `Post` object\'s `createdAt` and `id` genuinely came from the database, not from any value you passed in.',
          takeaway: 'Insert then re-select in one call — the caller gets back the database\'s own truth, not a client-side guess.',
        },
        {
          id: 'm5-t7',
          title: 'Instant feed update: optimistic prepend vs waiting for Realtime',
          explain:
            'The posting user sees their new post immediately via a local prepend — LocalInsta deliberately does not wait for a Realtime event to display your own just-created post.',
          analogy:
            'When you hand-deliver a letter yourself, you already know it arrived — you do not need the postal service to separately confirm it to you. Prepending your own new post locally is that same direct knowledge; Realtime (next section) is for *other people\'s* posts, which you genuinely have no other way to know about instantly.',
          theory:
            '`FeedState.prependNewPost(Post post)` simply does `posts = [post, ...posts]; notifyListeners();` — a plain, synchronous local state update. This is deliberately **not** routed through a Realtime subscription round-trip: the user who just created the post already has perfect, first-hand knowledge of what they posted (it is literally the object `createPost` just returned), so waiting for a server round-trip notification of your own action would only add unnecessary latency for zero benefit.\n\nRealtime subscriptions (this module\'s final topic, and heavily used in Modules 7-8) earn their complexity for information you could not otherwise have — *someone else\'s* new comment, *someone else\'s* new like arriving while you are looking at a screen. Your own actions are always known instantly and locally; save Realtime for genuinely other-originated events.',
          whyItMatters:
            'This distinction — "optimistic local update for my own actions" vs "Realtime subscription for other people\'s actions" — is a recurring architectural decision throughout the rest of this course (likes, comments, chat) and is worth understanding as a general principle, not a one-off trick.',
          steps: [
            'Add `void prependNewPost(Post post)` to `FeedState`.',
            'Wire it as shown in the previous topic\'s `CreatePostState.submit()`.',
            'Test: create a post and confirm it appears at the top of the feed the instant you navigate back — with no visible delay, no spinner, no "refreshing" state.',
            'Compare mentally against what a Realtime-subscription-based approach would look like for this same case, and articulate to yourself why it would be strictly worse here.',
          ],
          code: `class FeedState extends ChangeNotifier {
  // ...existing pagination code...

  void prependNewPost(Post post) {
    posts = [post, ...posts];
    notifyListeners();
  }
}`,
          pitfalls: [
            '**Waiting for a Realtime event to show your own newly-created post.** Adds a needless round-trip delay for information you already have with certainty. Fix: always prepend locally and instantly for your own actions.',
            '**Forgetting this local prepend can drift from the true feed order if a lot of time passes before the user next refreshes.** A minor, acceptable cosmetic case — a subsequent pull-to-refresh (this module\'s earlier topic) naturally resolves it. Fix: no special handling needed, this is expected and fine.',
            '**Applying this "just prepend locally" logic to *other users\'* new posts too, and never building the Realtime piece at all.** That is a genuinely different, incorrect trade-off — you would have no way to know about someone else\'s new post without either a manual refresh or a Realtime subscription. Fix: keep the two cases (own actions vs. others\' actions) clearly distinct in your mental model.',
            '**Duplicate posts appearing if a Realtime subscription (added later) is not deliberately designed to avoid double-adding a post the local optimistic update already added.** Fix: this exact concern is addressed explicitly in Module 5\'s comments Realtime topic and worth applying the same care to if you ever add feed-level realtime as a stretch goal.',
          ],
          tryIt:
            'Create a post, time how instantly it appears at the top of your feed (it should be indistinguishable from a local, no-network action), and write one sentence for yourself explaining why this specific case does not need Realtime.',
          takeaway: 'Your own actions are known instantly and locally — reserve Realtime subscriptions for information only a live server push can tell you.',
        },
      ],
    },
    {
      id: 'm5-s3',
      title: 'Likes',
      topics: [
        {
          id: 'm5-t8',
          title: 'Double-tap to like, with a heart animation',
          explain:
            'A `GestureDetector.onDoubleTap` over the post image triggers the like toggle and a brief animated heart overlay — the single most recognisable Instagram-style interaction.',
          analogy:
            'A quick double-clap at a temple bell to mark a moment of appreciation, rather than a formal spoken request — double-tap-to-like is exactly that fast, low-friction gesture, deliberately quicker than tapping a small heart icon precisely.',
          theory:
            '`GestureDetector(onDoubleTap: () => ..., child: PostImage(...))` layered with an `AnimatedOpacity`/`AnimatedScale`-driven heart icon (a `Icons.favorite` widget that briefly scales up from zero and fades out — a short, self-contained `AnimationController` lifecycle) gives the classic "double-tap, heart pops, fades away" feedback. The double-tap always **likes** (never unlikes) if the post is not already liked — mirroring real Instagram behaviour, where double-tapping an already-liked post does nothing destructive, avoiding an accidental unlike from an extra tap.\n\nThe visible heart animation is purely cosmetic feedback; the actual state change is the `toggle_like` RPC call from Module 3, covered as its own topic next — this topic is specifically about the gesture and animation layer sitting on top of that call.',
          whyItMatters:
            'Getting this specific interaction right — instant, delightful, and safe against accidental double-unlikes — is disproportionately noticeable to users precisely because it is the single most-repeated gesture in the entire app.',
          steps: [
            'Build a `DoubleTapLikeOverlay` `StatefulWidget` wrapping any child with a `Stack` and an animated heart.',
            'Use a short `AnimationController` (400-600ms) driving both scale (0 to 1.2 to 1.0) and opacity (0 to 1 to 0).',
            'On `onDoubleTap`, if the post is not already liked, trigger both the animation and the like action; if already liked, play the animation only (visual delight) without calling unlike.',
            'Dispose the `AnimationController` properly.',
            'Wire this wrapper around `PostImage` in the feed\'s `PostCard`.',
          ],
          code: `class DoubleTapLikeOverlay extends StatefulWidget {
  const DoubleTapLikeOverlay({
    super.key,
    required this.child,
    required this.isLiked,
    required this.onLike,
  });
  final Widget child;
  final bool isLiked;
  final VoidCallback onLike;

  @override
  State<DoubleTapLikeOverlay> createState() => _DoubleTapLikeOverlayState();
}

class _DoubleTapLikeOverlayState extends State<DoubleTapLikeOverlay>
    with SingleTickerProviderStateMixin {
  late final _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 500),
  );

  void _handleDoubleTap() {
    if (!widget.isLiked) widget.onLike(); // double-tap only ever LIKES, never unlikes
    _controller.forward(from: 0);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onDoubleTap: _handleDoubleTap,
      child: Stack(
        alignment: Alignment.center,
        children: [
          widget.child,
          FadeTransition(
            opacity: Tween(begin: 1.0, end: 0.0).animate(
              CurvedAnimation(parent: _controller, curve: const Interval(0.4, 1.0)),
            ),
            child: ScaleTransition(
              scale: Tween(begin: 0.6, end: 1.2).animate(
                CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
              ),
              child: const Icon(Icons.favorite, color: Colors.white, size: 90),
            ),
          ),
        ],
      ),
    );
  }
}`,
          pitfalls: [
            '**Toggling (like/unlike) on every double-tap.** A user double-tapping an already-liked post to "admire it again" would accidentally unlike it — jarring and against the established convention every Instagram-style app user expects. Fix: double-tap always likes, never unlikes; unliking is a deliberate single-tap on the heart icon (next topic).',
            '**Not disposing the `AnimationController`.** Leaks memory across every post card in a long feed. Fix: always dispose in the State\'s `dispose()`.',
            '**Playing the animation only when the like action actually succeeds, adding a network-round-trip delay before any visual feedback.** Feels laggy. Fix: play the animation immediately/optimistically; handle a rare failure quietly in the background (next topic\'s optimistic-update pattern).',
            '**Making the heart animation too slow or too fast relative to real Instagram\'s well-known feel.** Fix: 400-600ms with an elastic-out curve is a good starting point; tune by feel on a real device.',
          ],
          tryIt:
            'Wire this into the real feed, double-tap a post twice in a row, and confirm: first double-tap shows the heart and likes it; second double-tap (on an already-liked post) still shows the heart animation but does not unlike it.',
          takeaway: 'Double-tap is a one-way "like" gesture with instant visual feedback — never a toggle, exactly matching user expectations from every other app like it.',
        },
        {
          id: 'm5-t9',
          title: 'Wiring toggle_like with optimistic UI',
          explain:
            'Calling Module 3\'s `toggle_like` RPC updates the local like state and count instantly, before the network response even returns — rolling back only if the call genuinely fails.',
          analogy:
            'A shopkeeper who marks an item "sold" on the shelf the instant a customer says yes, rather than waiting for the receipt to finish printing — confident it will complete, and quick to fix the shelf tag if, rarely, the payment somehow fails afterward.',
          theory:
            '**Optimistic UI** updates the local state (`isLiked = true`, `likeCount += 1`) immediately, synchronously, on user action — the UI never waits for the network round-trip to feel responsive — then fires the actual `supabase.rpc(\'toggle_like\', params: {\'post_id_input\': postId})` call in the background. If that call throws, you **roll back** the optimistic change (`isLiked = false`, `likeCount -= 1`) and can optionally show a small, unobtrusive error.\n\nThis pattern is safe specifically *because* of Module 3\'s design: `toggle_like` is idempotent-feeling from the UI\'s perspective (it always reflects true server state on success) and RLS guarantees no cross-user corruption is possible even under a rare race. The optimistic count update is a **local display convenience only** — the true, authoritative `like_count` still lives in Postgres, kept accurate by Module 3\'s trigger regardless of what the client briefly displayed.',
          whyItMatters:
            'Optimistic UI is what makes a like button feel instant rather than laggy — but doing it safely (with a genuine rollback path) rather than just "hope the network never fails" is the difference between a polished feature and a subtly buggy one.',
          steps: [
            'Add local `isLiked`/`likeCount` fields to a `PostCardState` (or track a `Map<String, bool>` of liked-post-ids in `FeedState`).',
            'On like/unlike, flip the local state and count **immediately**, call `notifyListeners()` right away.',
            'Fire `supabase.rpc(\'toggle_like\', params: {\'post_id_input\': postId})` in the background (not awaited before the UI update).',
            'On a caught exception from the RPC call, revert the local state and count back to their pre-tap values.',
            'Test the rollback path by simulating a failure (e.g. airplane mode) and confirming the heart/count visually reverts.',
          ],
          code: `class FeedState extends ChangeNotifier {
  // ...existing code...
  final Map<String, bool> _optimisticLikes = {};

  bool isLikedOptimistic(Post post, bool serverIsLiked) =>
      _optimisticLikes[post.id] ?? serverIsLiked;

  Future<void> toggleLike(Post post, {required bool currentlyLiked}) async {
    // 1. Update optimistically, instantly, before any network call
    _optimisticLikes[post.id] = !currentlyLiked;
    _adjustLikeCount(post.id, currentlyLiked ? -1 : 1);
    notifyListeners();

    // 2. Fire the real call in the background
    try {
      await _client.rpc('toggle_like', params: {'post_id_input': post.id});
      // success — the optimistic state was correct, nothing further to do
    } catch (e) {
      // 3. Roll back on failure
      _optimisticLikes[post.id] = currentlyLiked;
      _adjustLikeCount(post.id, currentlyLiked ? 1 : -1);
      notifyListeners();
    }
  }

  void _adjustLikeCount(String postId, int delta) {
    posts = posts.map((p) {
      if (p.id != postId) return p;
      return p.copyWith(likeCount: p.likeCount + delta);
    }).toList();
  }
}`,
          pitfalls: [
            '**Awaiting the RPC call before updating the UI at all.** Defeats the entire purpose of optimistic UI — the button feels exactly as laggy as a naive, non-optimistic implementation. Fix: update local state first, synchronously, then fire the network call.',
            '**Forgetting the rollback path entirely.** A failed request silently leaves the UI showing a like that never actually happened server-side — confusing the next time the feed refreshes and the count "mysteriously" changes back. Fix: always wire a genuine rollback in the catch block.',
            '**Double-counting by both updating the optimistic count locally AND separately refetching/trusting a stale server count on the next unrelated rebuild.** Fix: keep the optimistic overlay (`_optimisticLikes`) as the single source of truth for "what does this device currently believe", reconciled naturally on the next full feed refresh.',
            '**Allowing rapid repeated taps to fire many overlapping RPC calls.** Debounce or disable the gesture briefly during the in-flight call if this becomes a visible issue in testing — a light touch is enough here since `toggle_like` is safe to call repeatedly, just wasteful.',
          ],
          tryIt:
            'Like a post normally and confirm the heart and count update instantly with no visible delay, then turn on airplane mode, like a different post, and confirm it optimistically updates and then visibly rolls back a moment later when the RPC call fails.',
          takeaway: 'Update local state first, call the network second, roll back only on genuine failure — that ordering is the entire trick to a like button that feels instant and stays correct.',
        },
        {
          id: 'm5-t10',
          title: 'Realtime: seeing other users\' likes arrive live',
          explain:
            'A Supabase Realtime subscription on the `posts` table\'s `like_count` column updates the feed the instant *someone else* likes a post you are currently looking at.',
          analogy:
            'A shared scoreboard at a cricket match updates the instant any scorer anywhere enters a run — every spectator sees the same live number, not just the one who happened to be looking at the scorebook at that exact second.',
          theory:
            'Supabase Realtime\'s **Postgres Changes** feature streams row-level `INSERT`/`UPDATE`/`DELETE` events straight from the database to any subscribed client, the instant they commit — this is what will let a user genuinely see a post\'s like count tick up live, without polling, when someone else (not their own optimistic update from the previous topic) likes it. This requires the target table to be added to Supabase\'s `supabase_realtime` publication — a one-time SQL step, not automatic for every table by default.\n\n`supabase.channel(\'posts-likes\').onPostgresChanges(event: PostgresChangeEvent.update, schema: \'public\', table: \'posts\', callback: (payload) { ... }).subscribe()` opens a live subscription; the `payload.newRecord` map carries the updated row\'s new values, including the fresh `like_count` your trigger (Module 3) just wrote. You reconcile this incoming value with the local optimistic overlay from the previous topic — the incoming server value always wins once it arrives, since it is the authoritative truth.',
          whyItMatters:
            'This is the first genuine "live, multi-user" feature in the entire course — everything before this point only ever reflected the current device\'s own actions. Getting comfortable with Realtime here is the direct foundation for Module 7\'s notifications and Module 8\'s chat.',
          steps: [
            'In SQL Editor, run `alter publication supabase_realtime add table public.posts;` to enable Realtime change streaming for that table.',
            'In `FeedState`, open a channel subscription in `loadFirstPage()` (or a dedicated `startListening()` method), filtered to `event: PostgresChangeEvent.update` on `table: \'posts\'`.',
            'In the callback, find the matching local `Post` by id and update its `likeCount`/`commentCount` from `payload.newRecord`, calling `notifyListeners()`.',
            'Always `unsubscribe()` the channel when the feed screen is disposed.',
            'Test with two devices/emulators signed in as two different test users: like a post on device A, confirm the count updates live on device B with no manual refresh.',
          ],
          code: `-- One-time SQL setup — without this, no Postgres Changes events fire at all
alter publication supabase_realtime add table public.posts;`,
          pitfalls: [
            '**Forgetting the `alter publication` step.** Realtime subscriptions silently connect but never receive any events — a genuinely confusing "nothing happens" bug with no obvious error message. Fix: always confirm the target table was added to the publication.',
            '**Not unsubscribing the channel when the feed screen is disposed.** Leaks the WebSocket connection and can call `notifyListeners()` on a disposed provider. Fix: always `supabase.removeChannel(channel)` in `dispose()`.',
            '**Overwriting the local optimistic like count with a stale incoming Realtime event that predates your own most recent optimistic update.** A genuine but rare race; acceptable to leave unresolved for this course\'s scope (a subsequent refresh always self-corrects) — worth knowing the edge case exists.',
            '**Subscribing to every column change on `posts`, including ones irrelevant to the feed (caption edits, if ever added).** Fine for this course\'s scope, but worth knowing you can filter more precisely with `PostgresChangeFilter` if a table carries many unrelated concerns later.',
          ],
          tryIt:
            'With two test accounts on two devices (or one physical device plus the SQL Editor simulating a like insert on behalf of a different user), confirm a like registered by one account appears live, with no manual refresh, on a different device already viewing that post.',
          takeaway: 'Postgres Changes streams real database events straight to subscribed clients — the missing publication step is the #1 reason it silently does nothing.',
        },
      ],
    },
    {
      id: 'm5-s4',
      title: 'Comments',
      topics: [
        {
          id: 'm5-t11',
          title: 'The post detail screen & comment thread layout',
          explain:
            'Tapping a post (or its comment icon) opens a detail screen: the full image, caption, like/comment counts, and a scrollable comment thread below.',
          analogy:
            'A shop\'s single storefront photo is what draws you in from the street; stepping inside reveals the full counter — every item, every price, every conversation happening at that moment. The post detail screen is that "stepping inside" view.',
          theory:
            '`PostDetailScreen` receives a `postId` (Module 0\'s navigation pattern — pass the id, not the whole object, so the detail screen always fetches fresh data rather than trusting a possibly-stale object handed from the feed). Layout: the post image at the top (reusing `PostImage` from Module 4), the caption and like/comment counts, then a `ListView.builder` of `CommentTile`s (avatar, username, body, relative timestamp via the `timeago` package), and a persistent bottom `TextField` + send button for posting a new comment.\n\nFetching comments uses the same embedded-join pattern from earlier this module: `supabase.from(\'comments\').select(\'*, profiles(username, avatar_url)\').eq(\'post_id\', postId).order(\'created_at\')`.',
          whyItMatters:
            'This screen is where Module 3\'s `comments` table, Module 0\'s navigation and list patterns, and this module\'s join-query technique all come together into the single most content-dense screen in LocalInsta.',
          steps: [
            'Build `PostDetailScreen(postId: ...)` fetching the post fresh via a single-row query (`.eq(\'id\', postId).single()`) plus the joined author.',
            'Fetch comments via the query shown above.',
            'Render: post image, caption, like/comment count row, then the comment list.',
            'Add a bottom-anchored `TextField` + send `IconButton` for posting a new comment (next topic wires the actual submit logic).',
            'Use `timeago.format(comment.createdAt)` for each comment\'s relative timestamp.',
          ],
          code: `class CommentModel {
  const CommentModel({
    required this.id,
    required this.body,
    required this.createdAt,
    required this.author,
  });
  final String id;
  final String body;
  final DateTime createdAt;
  final PostAuthor author;

  factory CommentModel.fromMap(Map<String, dynamic> map) => CommentModel(
        id: map['id'] as String,
        body: map['body'] as String,
        createdAt: DateTime.parse(map['created_at'] as String),
        author: PostAuthor.fromMap(map['profiles'] as Map<String, dynamic>),
      );
}

Future<List<CommentModel>> fetchComments(String postId) async {
  final rows = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at');
  return (rows as List).map((r) => CommentModel.fromMap(r)).toList();
}

// A single comment row
Widget commentTile(CommentModel c) => ListTile(
      leading: AvatarImage(url: c.author.avatarUrl, radius: 16),
      title: RichText(
        text: TextSpan(
          style: DefaultTextStyle.of(navigatorKey.currentContext!).style,
          children: [
            TextSpan(text: '\${c.author.username} ', style: const TextStyle(fontWeight: FontWeight.bold)),
            TextSpan(text: c.body),
          ],
        ),
      ),
      subtitle: Text(timeago.format(c.createdAt), style: const TextStyle(fontSize: 11)),
    );`,
          pitfalls: [
            '**Passing the whole `Post` object from the feed instead of just its id.** The detail screen then shows a possibly-stale like/comment count captured at feed-load time instead of fresh data. Fix: pass only the id, always refetch fresh on the detail screen.',
            '**Fetching comments without the embedded profile join, then looping to fetch each commenter separately.** The exact N+1 mistake this module already covered for the feed — apply the same lesson here.',
            '**No empty state for a post with zero comments.** A blank white space below the post looks unfinished. Fix: a simple "No comments yet — be the first!" placeholder.',
            '**Not handling the post being deleted between opening the feed and opening the detail screen (a genuine possible race in a multi-user app).** Fix: handle a `null`/not-found single-row fetch gracefully with a "This post is no longer available" message rather than crashing.',
          ],
          tryIt:
            'Open the detail screen for a test post with several seeded comments and confirm they render in chronological order with correct usernames, avatars, and relative timestamps.',
          takeaway: 'Pass only the postId across navigation, always refetch fresh — a detail screen showing stale feed-time data is a common, avoidable bug.',
        },
        {
          id: 'm5-t12',
          title: 'Posting a comment with optimistic append',
          explain:
            'Submitting a comment appends it to the local list immediately (this is the user\'s own action — Module 5\'s earlier "own actions are known instantly" principle applies again), then confirms against the real inserted row.',
          analogy:
            'Writing your own name in a guestbook — you already know exactly what you wrote and where it sits on the page the instant your pen leaves the paper; you do not need to wait for the innkeeper to separately confirm your entry back to you.',
          theory:
            'This mirrors the feed\'s "optimistic prepend for your own post" pattern from earlier this module, applied to comments: on submit, immediately append a locally-constructed comment object to the visible list (using the current user\'s already-known profile data, no network round-trip needed to know your own username), then fire the real `supabase.from(\'comments\').insert({...}).select(\'*, profiles(...)\').single()` in the background. On success, you can optionally reconcile the temporary local comment\'s id with the real database id (rarely visible to the user); on failure, remove the optimistic comment and show a retry affordance.\n\nModule 3\'s `comment_count` trigger fires automatically on the real insert — the post\'s comment count catches up to match once that insert lands, exactly as the like-count trigger does.',
          whyItMatters:
            'A comment box that visibly delays before showing what you just typed feels sluggish and cheap — optimistic append is what makes commenting feel as instant as typing a text message.',
          steps: [
            'On submit, immediately clear the `TextField` and append a locally-built `CommentModel` (using the current user\'s cached profile) to the comment list, calling `notifyListeners()`.',
            'Fire the real insert in the background.',
            'On success, nothing further is strictly needed — the optimistic comment already matches what was stored (identical content, near-identical timestamp).',
            'On failure, remove the optimistic comment from the list and show a small inline error with a retry option.',
            'Confirm the parent post\'s `commentCount` (shown in the feed) eventually reflects the trigger-updated true value on next fetch/Realtime update.',
          ],
          code: `class PostDetailState extends ChangeNotifier {
  PostDetailState(this._client, this.postId);
  final SupabaseClient _client;
  final String postId;

  List<CommentModel> comments = [];

  Future<void> postComment(String body, PostAuthor myProfile) async {
    // Build a temporary, locally-known comment and show it instantly
    final optimistic = CommentModel(
      id: 'temp-\${DateTime.now().microsecondsSinceEpoch}',
      body: body,
      createdAt: DateTime.now(),
      author: myProfile,
    );
    comments = [...comments, optimistic];
    notifyListeners();

    try {
      final row = await _client
          .from('comments')
          .insert({'post_id': postId, 'user_id': _client.auth.currentUser!.id, 'body': body})
          .select('*, profiles(username, avatar_url)')
          .single();
      final real = CommentModel.fromMap(row);
      // Swap the temporary comment for the real, database-confirmed one
      comments = comments.map((c) => c.id == optimistic.id ? real : c).toList();
    } catch (e) {
      // Roll back — remove the optimistic comment, surface the error
      comments = comments.where((c) => c.id != optimistic.id).toList();
    } finally {
      notifyListeners();
    }
  }
}`,
          pitfalls: [
            '**Waiting for the network round-trip before showing the typed comment at all.** Feels laggy for an action users expect to be instant, like sending a text message. Fix: append optimistically, reconcile in the background.',
            '**Never swapping the temporary local comment for the real one, leaving a fake `temp-...` id in the list forever.** Harmless visually in most cases but a latent bug if anything downstream ever keys off comment id (e.g. a future delete-comment feature). Fix: always reconcile on success.',
            '**Not clearing the text input until after the network call resolves.** Feels laggy and risks a double-submit if the user is impatient. Fix: clear immediately on submit, exactly like the optimistic append itself.',
            '**Silently swallowing a failed comment post with no rollback or error shown at all.** The user believes their comment posted; it did not. Fix: always roll back visibly and offer a retry.',
          ],
          tryIt:
            'Post a comment and confirm it appears in the thread instantly, with no visible delay — then turn on airplane mode and post another, confirming it appears briefly and then is removed with a visible error once the insert genuinely fails.',
          takeaway: 'Your own comment is known the instant you type it — append it optimistically, reconcile with the real database row quietly in the background.',
        },
        {
          id: 'm5-t13',
          title: 'Realtime comments: seeing others\' comments arrive live',
          explain:
            'A Postgres Changes subscription filtered to `post_id = <this post>` streams in *other users\'* new comments while you are viewing the detail screen — genuinely live, not polled.',
          analogy:
            'Sitting in a village panchayat meeting where new arrivals are announced the moment they walk in the door, rather than only finding out who showed up by counting heads again every few minutes. A filtered Realtime subscription is that live door-announcement, scoped to just this one meeting (this one post), not every meeting happening across the village.',
          theory:
            '`supabase.channel(\'comments-for-\$postId\').onPostgresChanges(event: PostgresChangeEvent.insert, schema: \'public\', table: \'comments\', filter: PostgresChangeFilter(type: PostgresChangeFilterType.eq, column: \'post_id\', value: postId), callback: (payload) { ... }).subscribe()` narrows the subscription to only inserts on comments belonging to *this specific post* — far more efficient than subscribing to every comment across the entire app and filtering client-side.\n\nThe incoming `payload.newRecord` gives you the raw new comment row, but **without** the embedded profile join (Postgres Changes payloads are the raw row, not a PostgREST-style joined select) — so you either do a small follow-up query to fetch that one commenter\'s profile, or (a simpler, often-sufficient approach for this course) just show the new comment with a placeholder author until the next full refresh reconciles it properly. Critically: **skip appending the event if it is your own just-posted comment** — the previous topic\'s optimistic append already added it locally, and blindly appending again from the Realtime event would duplicate it.',
          whyItMatters:
            'Filtered subscriptions are dramatically more efficient than "subscribe to everything, filter in Dart" — at LocalInsta\'s scale, the difference is minor, but the *habit* of filtering at the source is what keeps a Realtime-heavy app (Module 8\'s chat leans on this constantly) performant at real scale.',
          steps: [
            'Confirm `comments` is added to the Realtime publication: `alter publication supabase_realtime add table public.comments;`.',
            'In `PostDetailState`, open a filtered channel subscription scoped to this screen\'s `postId` when the state is created.',
            'In the callback, check if the incoming comment\'s `user_id` matches the current user — if so, skip (already shown optimistically).',
            'Otherwise, parse the raw row (author profile fetched separately or shown as a lightweight placeholder) and append it to `comments`.',
            'Always unsubscribe the channel in `dispose()`.',
          ],
          code: `-- One-time setup
alter publication supabase_realtime add table public.comments;

// PostDetailState
RealtimeChannel? _channel;

void startListening() {
  _channel = _client
      .channel('comments-for-\$postId')
      .onPostgresChanges(
        event: PostgresChangeEvent.insert,
        schema: 'public',
        table: 'comments',
        filter: PostgresChangeFilter(
          type: PostgresChangeFilterType.eq,
          column: 'post_id',
          value: postId,
        ),
        callback: (payload) async {
          final newRow = payload.newRecord;
          final commenterId = newRow['user_id'] as String;

          // Skip our own comment — already appended optimistically
          if (commenterId == _client.auth.currentUser?.id) return;

          // Fetch just this one commenter's profile for display
          final profileRow = await _client
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', commenterId)
              .single();

          final comment = CommentModel(
            id: newRow['id'] as String,
            body: newRow['body'] as String,
            createdAt: DateTime.parse(newRow['created_at'] as String),
            author: PostAuthor.fromMap(profileRow),
          );
          comments = [...comments, comment];
          notifyListeners();
        },
      )
      .subscribe();
}

@override
void dispose() {
  if (_channel != null) _client.removeChannel(_channel!);
  super.dispose();
}`,
          pitfalls: [
            '**Not skipping the current user\'s own comment in the Realtime callback.** Produces a visible duplicate — the optimistic one plus the Realtime one. Fix: always check the incoming row\'s `user_id` against the current session.',
            '**Subscribing to the entire `comments` table with no `filter`.** Every LocalInsta user\'s browser/device would receive every comment posted anywhere in the app, filtered client-side after the fact — wasteful and, at real scale, a genuine performance problem. Fix: always filter at the subscription level when a natural filter column exists.',
            '**Forgetting the `alter publication` step for `comments` specifically** (each table needs its own explicit opt-in, per the earlier likes-Realtime topic). Fix: keep a running checklist of every table added to the publication as you go.',
            '**Not unsubscribing when navigating away from the detail screen.** Leaks a WebSocket subscription per visited post over a session, and can call `notifyListeners()` on a disposed state. Fix: always pair `subscribe()` with a corresponding `removeChannel()` in `dispose()`.',
          ],
          tryIt:
            'With two test accounts on two devices, open the same post\'s detail screen on both, post a comment from device A, and confirm it appears live on device B within a second or two, with no duplicate ever appearing on device A itself.',
          takeaway: 'Filter Realtime subscriptions at the source, and always skip your own just-posted events — otherwise you either waste bandwidth or duplicate what optimistic UI already showed.',
        },
        {
          id: 'm5-t14',
          title: 'Deleting your own comment',
          explain:
            'A long-press or swipe on a comment you authored offers delete — protected end-to-end by Module 3\'s RLS delete policy, with the counter trigger keeping `comment_count` accurate automatically.',
          analogy:
            'Crossing out your own line in a shared guestbook is fine; crossing out someone else\'s is not, and the innkeeper (RLS) would simply refuse to hand you the eraser for anyone else\'s entry in the first place.',
          theory:
            'Show a delete affordance (a long-press context menu, or a leading swipe action) **only** on comments where `comment.author.id == currentUserId` — a client-side UI convenience, not the real security boundary (that is Module 3\'s `using (auth.uid() = user_id)` delete policy on `comments`, which would reject the attempt server-side regardless of what the UI shows). `supabase.from(\'comments\').delete().eq(\'id\', commentId)` performs the delete; Module 3\'s decrement trigger on `comment_count` fires automatically as part of the same transaction.\n\nRemove the comment from the local `comments` list immediately on confirmed delete (another instance of "your own action, known instantly, no need to wait for Realtime") — and note the Realtime subscription from the previous topic only listens for `insert` events, so a delete never needs special-casing there.',
          whyItMatters:
            'This topic is a satisfying, compact review of nearly everything the course has built so far: RLS as the real security boundary, UI-level affordances as a courtesy rather than the actual guard, database triggers keeping denormalized data honest, and optimistic local updates for a user\'s own actions.',
          steps: [
            'Add a `showDeleteButton = comment.author.id == currentUserId` check when building each `CommentTile`.',
            'Wrap the tile in a `GestureDetector.onLongPress` (or `Dismissible`) showing a delete confirmation for eligible comments.',
            'On confirm, call `supabase.from(\'comments\').delete().eq(\'id\', comment.id)`.',
            'On success, remove the comment from the local list immediately.',
            'Attempt (via the Module 3 impersonation technique, for your own understanding) to delete a comment that is not yours and confirm the RLS policy blocks it even if you bypassed the UI check.',
          ],
          code: `Future<void> deleteComment(String commentId) async {
  await _client.from('comments').delete().eq('id', commentId);
  comments = comments.where((c) => c.id != commentId).toList();
  notifyListeners();
}

// UI — only show the affordance for your own comments
GestureDetector(
  onLongPress: comment.author.id == currentUserId
      ? () => _confirmAndDelete(context, comment.id)
      : null,
  child: commentTile(comment),
)

Future<void> _confirmAndDelete(BuildContext context, String commentId) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Delete comment?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete')),
      ],
    ),
  );
  if (confirmed == true && context.mounted) {
    await context.read<PostDetailState>().deleteComment(commentId);
  }
}`,
          pitfalls: [
            '**Trusting the client-side `showDeleteButton` check as the actual security boundary.** It is purely a UI convenience — a modified or malicious client could still attempt the delete call directly. Fix: always confirm the real RLS policy independently blocks it, as this topic\'s final step does.',
            '**Deleting without a confirmation dialog.** An accidental long-press permanently removes a comment with no recovery. Fix: always confirm before a destructive action, mirroring Module 2\'s sign-out pattern.',
            '**Forgetting the `comment_count` trigger already handles the decrement — do not also manually decrement it from Flutter.** Fix: trust the same database-trigger pattern established in Module 3; manual client-side counter math risks drift.',
            '**Not handling the case where the comment was already deleted by the time the delete call fires (e.g. deleted from another device).** Supabase\'s delete on a non-existent row is simply a no-op, not an error — acceptable behaviour, worth knowing rather than being surprised by.',
          ],
          tryIt:
            'Post a test comment, delete it via long-press with confirmation, and confirm it disappears from the thread and the post\'s comment count decreases — then, using the Module 3 impersonation technique, confirm a different user genuinely cannot delete it even with a direct API call.',
          takeaway: 'The UI-level ownership check is a courtesy; the RLS delete policy is the real guard — always verify the latter independently, never trust the former alone.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm5-p1',
      type: 'Project',
      title: 'The Complete LocalInsta Feed',
      domain: 'Feed / Pagination / Realtime',
      duration: '3 hours',
      description:
        'Build the full feed experience: paginated infinite scroll, pull-to-refresh, end-to-end post creation with instant local display, and double-tap-to-like with optimistic UI and live Realtime updates from other users.',
      tools: ['Flutter', 'supabase_flutter', 'provider'],
      blueprint: {
        overview:
          'A production-feeling feed screen: 20-per-page range-paginated posts joined with author data, infinite scroll with a loading footer, pull-to-refresh, a full create-post flow that prepends the new post instantly, and a double-tap like gesture backed by the toggle_like RPC with optimistic UI and a live Realtime subscription for other users\' likes.',
        functionalRequirements: [
          '**Feed query.** Embedded posts+profiles join, ordered newest-first, paginated at 20 per page via .range().',
          '**Infinite scroll.** ScrollController-driven load-more with a guard against overlapping requests and a visible loading footer.',
          '**Pull-to-refresh.** RefreshIndicator resetting to page 0 and replacing the list.',
          '**Post creation.** Pick/crop/compress/upload (Module 4) then insert-and-select, prepended into the feed instantly.',
          '**Likes.** Double-tap and single-tap heart both call toggle_like with optimistic UI; a Realtime subscription updates like_count live for other users\' likes.',
        ],
        technicalImplementation: [
          '**features/feed/data/posts_repository.dart.** fetchFeedPage, createPost, both using the embedded profiles join.',
          '**features/feed/state/feed_state.dart.** Pagination state, optimistic like overlay, prependNewPost, Realtime subscription lifecycle.',
          '**features/feed/presentation/feed_screen.dart, post_card.dart, double_tap_like_overlay.dart.**',
          '**features/feed/presentation/create_post_screen.dart + state/create_post_state.dart.**',
          '**SQL.** alter publication supabase_realtime add table public.posts.',
        ],
        prompts: [
          {
            step: 1,
            label: 'PostsRepository + Post model',
            outcome: 'A tested repository fetching paginated, joined feed data.',
            prompt:
              'Create lib/features/feed/data/post.dart with Post and PostAuthor immutable models (copyWith included) and fromMap factories handling the embedded profiles join. Create lib/features/feed/data/posts_repository.dart with fetchFeedPage(page) using select(\'*, profiles(username, avatar_url)\').order(created_at desc).range(...) at page size 20, and createPost({imageUrl, caption}) using insert().select(...).single().',
          },
          {
            step: 2,
            label: 'FeedState: pagination, refresh, optimistic likes',
            outcome: 'A ChangeNotifier driving the entire feed screen.',
            prompt:
              'Create lib/features/feed/state/feed_state.dart as a ChangeNotifier with loadFirstPage, loadMore (guarded against overlapping in-flight calls, tracking hasMore), refresh (replaces the list), prependNewPost, and toggleLike(post, currentlyLiked) implementing optimistic UI (instant local flip + count adjust, calling supabase.rpc(\'toggle_like\', ...) in the background, rolling back on failure).',
          },
          {
            step: 3,
            label: 'Feed screen: infinite scroll + pull-to-refresh',
            outcome: 'A fully working, scrollable, refreshable feed UI.',
            prompt:
              'Build lib/features/feed/presentation/feed_screen.dart with a ScrollController triggering loadMore within 200px of the bottom, wrapped in a RefreshIndicator calling refresh, rendering PostCard widgets via ListView.builder with a loading footer while isLoadingMore is true. Build post_card.dart composing AvatarImage + username row, PostImage wrapped in a DoubleTapLikeOverlay, a like/comment icon row, and the caption.',
          },
          {
            step: 4,
            label: 'Create post + Realtime likes',
            outcome: 'Posting works end to end; likes update live across devices.',
            prompt:
              'Build create_post_screen.dart and create_post_state.dart chaining Module 4\'s pick/crop/compress with PostsRepository.createPost, prepending the result into FeedState on success and popping back to the feed. Add a Realtime Postgres Changes subscription in FeedState (after running alter publication supabase_realtime add table public.posts;) listening for UPDATE events on posts, updating the matching post\'s like_count/comment_count from payload.newRecord, unsubscribed properly in dispose.',
          },
        ],
        deliverable:
          'A LocalInsta feed that infinite-scrolls smoothly through 25+ seeded posts, pull-to-refreshes to show newly seeded content, lets you create a real post that appears instantly, and shows another test account\'s like on a post updating live with no manual refresh.',
      },
    },
    {
      id: 'm5-p2',
      type: 'Project',
      title: 'A Realtime Comment Thread',
      domain: 'Realtime / Postgres Changes',
      duration: '2.5 hours',
      description:
        'Build the post detail screen with a full comment thread — optimistic posting, filtered Realtime subscriptions for other users\' comments, and RLS-protected deletion of your own comments.',
      tools: ['Flutter', 'supabase_flutter', 'timeago'],
      blueprint: {
        overview:
          'A post detail screen showing the full image, caption, and a live comment thread: optimistic instant-append on posting your own comment, a filtered Postgres Changes subscription streaming in other users\' comments live (skipping your own to avoid duplicates), and a long-press delete flow for your own comments protected by RLS.',
        functionalRequirements: [
          '**Detail screen.** Fetches the post fresh by id, plus its full comment thread joined with author data.',
          '**Posting.** Optimistic instant append using the current user\'s known profile, reconciled against the real inserted row.',
          '**Realtime.** A post_id-filtered subscription appending other users\' new comments live, explicitly skipping the current user\'s own inserts.',
          '**Deletion.** A long-press-and-confirm delete flow, UI-gated to the comment\'s own author, with RLS as the true enforcement.',
        ],
        technicalImplementation: [
          '**features/feed/data/comment_model.dart.** CommentModel + fromMap with the embedded profile join.',
          '**features/feed/state/post_detail_state.dart.** Comment list, postComment (optimistic), Realtime channel lifecycle, deleteComment.',
          '**features/feed/presentation/post_detail_screen.dart.** Image, caption, comment ListView, bottom input bar.',
          '**SQL.** alter publication supabase_realtime add table public.comments.',
        ],
        prompts: [
          {
            step: 1,
            label: 'CommentModel + fetch + post detail screen shell',
            outcome: 'A working screen showing a post and its existing comments.',
            prompt:
              'Create lib/features/feed/data/comment_model.dart with CommentModel and fromMap handling the embedded profiles join. Build lib/features/feed/presentation/post_detail_screen.dart(postId) fetching the post fresh via .eq(\'id\', postId).single() and its comments via .eq(\'post_id\', postId).order(created_at), rendering the image, caption, a ListView of comment tiles (avatar, bold username, body, timeago relative timestamp), and a bottom TextField + send button.',
          },
          {
            step: 2,
            label: 'Optimistic comment posting',
            outcome: 'Comments appear instantly on submit.',
            prompt:
              'Create lib/features/feed/state/post_detail_state.dart with postComment(body, myProfile) that immediately appends a locally-built CommentModel (temp id) to the list and notifies listeners, then inserts the real row via insert().select(\'*, profiles(...)\').single() in the background, swapping the temp comment for the real one on success or removing it and surfacing an error on failure.',
          },
          {
            step: 3,
            label: 'Filtered Realtime subscription',
            outcome: 'Other users\' comments appear live, with no duplicates.',
            prompt:
              'Add startListening() to PostDetailState opening a channel filtered to event: insert, table: comments, filter post_id = postId. In the callback, skip the event if user_id matches the current session, otherwise fetch that commenter\'s profile and append a new CommentModel to the list. Ensure the channel is removed in dispose(). Remind me to run alter publication supabase_realtime add table public.comments; first.',
          },
          {
            step: 4,
            label: 'Delete your own comment',
            outcome: 'A working, RLS-verified delete flow.',
            prompt:
              'Add deleteComment(commentId) to PostDetailState calling delete().eq(\'id\', commentId) and removing it locally on success. Wire a long-press-to-delete affordance on comment tiles, shown only when the comment\'s author id matches the current user, behind a confirmation AlertDialog. Show me the Module 3-style impersonation SQL to independently verify a different user genuinely cannot delete this comment even bypassing the UI check.',
          },
        ],
        deliverable:
          'A post detail screen where posting a comment feels instant, a second test account\'s comment appears live within a couple of seconds with zero duplicates, and only a comment\'s own author can delete it — verified independently at the RLS level, not just the UI level.',
      },
    },
  ],
  quiz: [
    {
      id: 'm5-q1',
      q: 'Why does LocalInsta\'s feed query use `select(\'*, profiles(username, avatar_url)\')` instead of fetching posts and then separately querying each post\'s author?',
      options: [
        'It avoids the N+1 query problem, fetching posts and their authors in a single round-trip',
        'Supabase requires all queries to include every related table',
        'It makes the feed load in random order',
        'Plain select() cannot fetch more than 10 rows',
      ],
      answer: 0,
    },
    {
      id: 'm5-q2',
      q: 'Why does LocalInsta prepend a newly created post to the feed locally instead of waiting for a Realtime event to display it?',
      options: [
        'The posting user already has certain, first-hand knowledge of their own action — waiting for a round-trip would only add latency',
        'Realtime cannot detect insert events on the posts table',
        'Local prepending is required by Row Level Security',
        'It has no benefit over waiting for Realtime',
      ],
      answer: 0,
    },
    {
      id: 'm5-q3',
      q: 'In the optimistic like-toggle pattern, what happens if the background `toggle_like` RPC call fails after the UI already updated?',
      options: [
        'The local like state and count are rolled back to their pre-tap values',
        'The app crashes immediately',
        'Nothing — the UI stays in the optimistic state permanently',
        'The post is automatically deleted',
      ],
      answer: 0,
    },
    {
      id: 'm5-q4',
      q: 'What must be done before a Postgres Changes Realtime subscription on a table will receive any events at all?',
      options: [
        'The table must be added to the supabase_realtime publication via `alter publication supabase_realtime add table ...`',
        'The table must have at least 100 rows',
        'RLS must be disabled on that table',
        'Nothing — Realtime works automatically on every table by default',
      ],
      answer: 0,
    },
    {
      id: 'm5-q5',
      q: 'Why does the comments Realtime subscription explicitly skip events where the comment\'s user_id matches the current signed-in user?',
      options: [
        'To avoid duplicating a comment that was already appended optimistically when the user posted it themselves',
        'Because Supabase blocks users from seeing their own comments via Realtime',
        'Because RLS prevents this specific case',
        'It has no real purpose, it is optional cleanup',
      ],
      answer: 0,
    },
    {
      id: 'm5-q6',
      q: 'When a user tries to delete a comment via a modified client that bypasses the UI\'s "only show delete for your own comments" check, what actually stops them from deleting someone else\'s comment?',
      options: [
        'The RLS delete policy on the comments table, which checks auth.uid() = user_id at the database level',
        'The UI-level check is the only protection, so the delete would succeed',
        'Supabase automatically detects modified clients and blocks them',
        'Deleting other users\' comments is allowed by design',
      ],
      answer: 0,
    },
  ],
}
