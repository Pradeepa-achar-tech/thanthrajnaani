// Module 9 — Reels & Video Posts
// LocalInsta (Flutter + Supabase) course content for the React course player.

export const m9 = {
  id: 'm9',
  title: 'Reels & Video Posts',
  hours: 8,
  color: 'from-pink-500/20 to-pink-700/10',
  accent: 'pink',
  description:
    'Extend LocalInsta with short-form vertical video — capture, compress, and upload a Reel, then build a swipeable, autoplaying full-screen video feed — while confirming that likes, comments, and notifications already work for video with zero schema changes, because they were built to reference a post, not a photo.',
  sections: [
    {
      id: 'm9-s1',
      title: 'Video schema & capture',
      topics: [
        {
          id: 'm9-t1',
          title: 'Extending posts for video: media_type, video_url, duration',
          explain:
            'Three new columns on the existing `posts` table — `media_type`, `video_url`, `duration_seconds` — are all it takes to support Reels, because `image_url` keeps its job as the thumbnail for every post, photo or video.',
          analogy:
            'A photo album that starts including the occasional postcard-with-a-QR-code does not need a second album — the same page slot holds a printed image either way, and the QR code (linking to a video) is just an extra detail printed on some pages, not on others.',
          theory:
            '`alter table public.posts add column media_type text not null default \'image\' check (media_type in (\'image\', \'video\'))` reuses Module 3\'s enum-via-check-constraint technique from `notifications.type`. Rather than making `image_url` nullable for video posts (which would ripple into every existing query and Dart model that assumes it is always present), LocalInsta keeps `image_url` **always non-null** and gives it a slightly broader meaning: for a photo post it is the photo; for a video post it is the **generated thumbnail frame**. A new nullable `video_url` holds the actual video file\'s URL, only ever populated when `media_type = \'video\'`, and `duration_seconds numeric` records the clip length for the feed UI.\n\nA `check` constraint — `check (media_type <> \'video\' or video_url is not null)` — enforces that a video post can never exist without its video file reference, the same "keep the database honest, not just the client" discipline from every constraint this course has written since Module 3.',
          whyItMatters:
            'This is a genuinely elegant example of extending a schema **additively** — every existing query, every existing `Post.fromMap`, every existing feed/grid/detail screen from Modules 5-6 keeps working completely unchanged for photo posts, because `image_url` never stopped meaning "the image to show for this post".',
          steps: [
            'Run `alter table public.posts add column media_type text not null default \'image\' check (media_type in (\'image\', \'video\'));`.',
            'Add `video_url text` and `duration_seconds numeric check (duration_seconds is null or duration_seconds > 0)`.',
            'Add the `posts_video_needs_url` check constraint tying `media_type = \'video\'` to a required `video_url`.',
            'Update the Dart `Post` model (Module 5) with nullable `mediaType`, `videoUrl`, `durationSeconds` fields and matching `copyWith`/`fromMap` entries.',
            'Confirm every existing seeded photo post still reads back correctly — `media_type` defaults to `\'image\'`, `video_url` is `null`, nothing else changes.',
          ],
          code: `alter table public.posts
  add column media_type text not null default 'image'
    check (media_type in ('image', 'video')),
  add column video_url text,
  add column duration_seconds numeric
    check (duration_seconds is null or duration_seconds > 0);

alter table public.posts
  add constraint posts_video_needs_url
  check (media_type <> 'video' or video_url is not null);

-- Every existing seeded post is untouched and still valid:
select id, media_type, image_url, video_url from public.posts limit 3;
-- media_type='image', image_url='<real url>', video_url=null — exactly as before

// Dart model addition (Post, from Module 5)
class Post {
  const Post({
    // ...existing fields...
    this.mediaType = 'image',
    this.videoUrl,
    this.durationSeconds,
  });
  final String mediaType;    // 'image' | 'video'
  final String? videoUrl;
  final double? durationSeconds;

  bool get isVideo => mediaType == 'video';
}`,
          pitfalls: [
            '**Making `image_url` nullable to "make room" for video posts.** Would force a null-check onto every single existing screen that reads `post.imageUrl` — a needless, sprawling change for something a thumbnail column already solves cleanly. Fix: keep `image_url` non-null, let it mean "thumbnail" for video posts.',
            '**Forgetting the `posts_video_needs_url` check constraint.** Without it, a buggy upload flow could insert a `media_type = \'video\'` row with no actual video to play — a broken post with no database-level guard against it. Fix: always tie the enum value to its required companion data.',
            '**Adding a separate `reels` table instead of extending `posts`.** Would duplicate the entire likes/comments/notifications/RLS infrastructure this course already built, for content that is conceptually just "a post with a video attached". Fix: additive columns on the existing table, exactly as this topic does.',
            '**Not defaulting `media_type` to `\'image\'`.** Every one of the hundreds of test rows seeded across Modules 3, 5, 6, 7 would need a manual backfill instead of just working via the column default. Fix: always give a new required column on an existing table a sensible default.',
          ],
          tryIt:
            'Run the migration against your real LocalInsta database, then re-run Module 5\'s feed query and confirm every existing seeded post still returns correctly with `media_type: \'image\'` and a `null` `video_url` — zero breakage from an additive schema change.',
          takeaway: 'image_url keeps meaning "the thumbnail to show" for every post — video is an additive extension, not a schema fork.',
        },
        {
          id: 'm9-t2',
          title: 'Recording or picking a video',
          explain:
            '`image_picker` (already in `pubspec.yaml` since Module 4) has a `pickVideo` method alongside `pickImage` — the same permissions, the same camera-or-gallery choice, now capped by a maximum duration.',
          analogy:
            'The same camera counter at a photo studio that sells both still-photo sittings and short video-message bookings — one counter, one booking desk, just a different service selected, with the video slot capped at a fixed number of minutes so the schedule stays predictable.',
          theory:
            '`ImagePicker().pickVideo(source: ImageSource.camera, maxDuration: const Duration(seconds: 60))` mirrors Module 4\'s `pickImage` call almost exactly, returning an `XFile?` — `null` on cancellation, handled identically. `maxDuration` caps recording length at the source (the OS camera UI itself stops recording at the limit), which is both a UX choice (short-form video, matching the "Reels" format) and a direct, deliberate lever on the free-tier video math this module\'s final section covers — a 60-second cap keeps individual files bounded and predictable.\n\nThe same bottom-sheet pattern from Module 4 (Take Photo / Choose from Gallery) extends naturally to a third or alternate mode: Record Reel / Choose Video from Gallery — reusing the exact modal-sheet shape, just pointed at `pickVideo` instead of `pickImage`.',
          whyItMatters:
            'Recognising that `image_picker` already covers video (not just photos) means this topic is mostly configuration, not new API surface to learn — exactly the kind of "the tool you already know does more than you first used it for" realisation worth having.',
          steps: [
            'Add a "Record Reel" entry point (a new tab-bar affordance or a toggle on the existing Create Post flow) calling `pickVideo` instead of `pickImage`.',
            'Set `maxDuration: const Duration(seconds: 60)` — LocalInsta\'s chosen Reel length cap.',
            'Handle the `null` (cancelled) case identically to Module 4\'s photo flow.',
            'On a real device, confirm the native camera UI itself visibly enforces the 60-second cap, stopping recording automatically.',
            'Also wire a gallery fallback via `pickVideo(source: ImageSource.gallery)` for an already-recorded clip — and check its duration client-side, since a gallery pick has no OS-enforced cap.',
          ],
          code: `Future<XFile?> pickReelVideo(BuildContext context) async {
  final source = await showModalBottomSheet<ImageSource>(
    context: context,
    builder: (ctx) => SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.videocam),
            title: const Text('Record Reel'),
            onTap: () => Navigator.pop(ctx, ImageSource.camera),
          ),
          ListTile(
            leading: const Icon(Icons.video_library),
            title: const Text('Choose Video from Gallery'),
            onTap: () => Navigator.pop(ctx, ImageSource.gallery),
          ),
        ],
      ),
    ),
  );
  if (source == null) return null;

  final picked = await ImagePicker().pickVideo(
    source: source,
    maxDuration: const Duration(seconds: 60),
  );
  return picked; // null if the user cancelled — same as every other picker flow
}`,
          pitfalls: [
            '**Only setting `maxDuration` for the camera source.** A gallery pick has no such enforcement — a user could select a 10-minute video from their library. Fix: always separately check `VideoPlayerController` duration (next topic) after a gallery pick and reject or trim anything over the cap.',
            '**Reusing `pickImage`\'s `imageQuality` parameter, which does not apply to video at all.** Fix: `pickVideo` has its own, separate parameter surface — read the actual method signature rather than assuming symmetry with `pickImage`.',
            '**Choosing an unrealistically long `maxDuration` "to be flexible".** A longer cap directly multiplies file size, storage cost, and compression time — 30-90 seconds is the genre-appropriate range for short-form video; do not casually pick 5 minutes.',
            '**Not testing on a real device.** Emulator camera video capture can behave inconsistently across different emulator images — always confirm the recording flow on real hardware before considering it done.',
          ],
          tryIt:
            'Record a real 60-second test clip on a physical device and confirm the camera UI stops you automatically at the cap, then pick a longer pre-existing video from your gallery and confirm your app can detect (even if it does not yet reject) that it exceeds the cap.',
          takeaway: 'image_picker already does video — pickVideo plus a duration cap is nearly the entire capture story.',
        },
        {
          id: 'm9-t3',
          title: 'Generating a thumbnail & compressing the video',
          explain:
            '`video_compress` (free, MIT-licensed, no card) both re-encodes a video to a smaller file size and extracts a thumbnail frame — the two things this module\'s new `image_url`/`video_url` split needs.',
          analogy:
            'A print shop that, from one submitted video file, produces both a compressed, easier-to-mail copy AND a single still frame to paste on the front of the envelope — one shop visit, two useful outputs from the same source.',
          theory:
            '`VideoCompress.compressVideo(path, quality: VideoQuality.MediumQuality, deleteOrigin: false)` re-encodes a video file, typically shrinking it substantially (the exact ratio varies by source, but often 50-70% smaller) — the direct video equivalent of Module 4\'s `flutter_image_compress` for photos, same underlying motivation (protect the free tier\'s storage and bandwidth). `VideoCompress.getFileThumbnail(path, quality: 50)` extracts a single JPEG frame (by default, partway into the clip) — exactly the file this module\'s schema extension stores as `image_url` for a video post.\n\nBoth operations run on-device, natively, genuinely free with no external service or card involved — consistent with every other tool this course has chosen specifically for the "free tier, no card, ever" constraint.',
          whyItMatters:
            'This one package call produces both artefacts (a smaller video, a representative thumbnail) this module\'s schema needs — recognising that a single well-chosen tool can serve two related needs at once is a small but real efficiency worth noticing.',
          steps: [
            'Add `video_compress: ^3.1.3` to `pubspec.yaml`.',
            'After picking a video (previous topic), call `VideoCompress.compressVideo(path, quality: VideoQuality.MediumQuality)`, awaiting the returned `MediaInfo`.',
            'Call `VideoCompress.getFileThumbnail(path, quality: 50)` to extract the thumbnail JPEG.',
            'Log before/after file sizes (mirroring Module 4\'s compression-logging habit) to see the real reduction on a test clip.',
            'Confirm visually that the compressed video still looks acceptable at normal phone-screen viewing size — mirroring Module 4\'s "test visually, do not just chase the smallest file" lesson.',
          ],
          code: `Future<({File video, File thumbnail, double? durationSeconds})> compressReel(String sourcePath) async {
  final originalSize = await File(sourcePath).length();

  final info = await VideoCompress.compressVideo(
    sourcePath,
    quality: VideoQuality.MediumQuality,
    deleteOrigin: false,
  );

  final thumbnail = await VideoCompress.getFileThumbnail(sourcePath, quality: 50);

  if (info?.file == null) {
    throw Exception('Video compression failed — try a shorter clip.');
  }

  debugPrint(
    'Reel compressed \${(originalSize / 1024 / 1024).toStringAsFixed(1)}MB '
    '-> \${((info!.filesize ?? 0) / 1024 / 1024).toStringAsFixed(1)}MB',
  );

  return (video: info.file!, thumbnail: thumbnail, durationSeconds: info.duration != null ? info.duration! / 1000 : null);
}`,
          pitfalls: [
            '**Skipping compression entirely "since video_compress adds a dependency".** A single uncompressed 60-second phone video can easily be 50-100MB — directly threatening the free tier\'s 1GB storage ceiling after only a handful of Reels. Fix: compression is not optional for video the way it barely was for photos in Module 4 — it is essential here.',
            '**Setting `quality: VideoQuality.HighestQuality` by default.** Defeats the entire purpose of compressing at all. Fix: `MediumQuality` is a sensible default for short-form, phone-screen-viewed content; reserve higher quality only if a real product need demands it.',
            '**Forgetting `deleteOrigin: false` and accidentally losing the original file before confirming the compression succeeded.** Fix: keep the original until the compressed output is verified, exactly as shown.',
            '**Not handling a `null`/failed compression result.** A corrupt or unusually-encoded source video can occasionally fail to compress. Fix: always check for `null` and surface a clear error rather than silently proceeding with a missing file.',
          ],
          tryIt:
            'Run a real 30-60 second test clip through this full pipeline and confirm you get back both a meaningfully smaller video file and a real JPEG thumbnail, with a printed before/after size comparison in your debug console.',
          takeaway: 'One package call produces both the compressed video and its thumbnail — the same free-tier-protection instinct from Module 4, now applied to a format that needs it even more.',
        },
        {
          id: 'm9-t4',
          title: 'Uploading video: bigger files, and the real bandwidth math',
          explain:
            'The upload call itself is identical to Module 4\'s photo pipeline — `uploadBinary` into the existing `posts` bucket — but video\'s much larger file size means the free-tier bandwidth conversation from Module 4 needs a second, more urgent look.',
          analogy:
            'The same courier service that delivers postcards also delivers parcels — same counter, same process, but a parcel eats far more of a monthly shipping budget than a postcard does, and a business that only ever budgeted for postcards needs to redo the math the day parcels start shipping too.',
          theory:
            '`StorageRepository.uploadImageBytes` (Module 4) works unchanged for video bytes — Supabase Storage does not care about file type, only bytes and a path, and the same folder-owned RLS policies from Module 4\'s `posts` bucket apply identically (a video file at `<user_id>/<uuid>.mp4` is governed by the exact same `(storage.foldername(name))[1] = auth.uid()::text` check as any photo). No new bucket, no new Storage policy, is needed — a second confirmation (after this module\'s schema topic) that the foundation built in Modules 3-4 was designed generally enough to extend cleanly.\n\nThe number that changes is the **math**: where Module 4 estimated ~300KB per compressed photo (2,500-5,000 posts per GB), a compressed 30-60 second Reel at medium quality typically lands in the 3-8MB range — roughly **15-25x larger per post**. The free tier\'s 1GB storage now holds more like 125-330 Reels instead of thousands of photos, and the 5GB/month bandwidth ceiling (every feed view of a Reel counts against it) becomes the binding constraint far sooner than it did for a photo-only app.',
          whyItMatters:
            'This is the single most consequential free-tier number in the entire course to get right — shipping Reels without redoing this math is exactly how a course project could unexpectedly hit its free-tier ceiling mid-demo.',
          steps: [
            'Confirm `StorageRepository.uploadImageBytes(bucket: \'posts\', path: ..., bytes: ...)` (Module 4) works unchanged for a compressed video\'s bytes — same method, same bucket, same RLS.',
            'Build the upload path with the same `buildUploadPath` helper (Module 4), just a `.mp4` extension instead of `.jpg`.',
            'Upload both the compressed video AND its thumbnail (two separate Storage objects, two URLs) for a single Reel post.',
            'Recalculate the free-tier math explicitly: at ~5MB/Reel average, estimate how many Reels the 1GB storage ceiling and 5GB/month bandwidth ceiling each support.',
            'Write the updated number in your README, right next to Module 4\'s original photo-only estimate, so the trade-off is explicit and visible.',
          ],
          code: `Future<({String videoUrl, String thumbnailUrl})> uploadReel({
  required File video,
  required File thumbnail,
  required String userId,
}) async {
  final storageRepo = StorageRepository();

  final videoPath = buildUploadPath(userId: userId, extension: 'mp4');
  final videoUrl = await storageRepo.uploadImageBytes(
    bucket: 'posts', // the SAME bucket from Module 4 — no new bucket needed
    path: videoPath,
    bytes: await video.readAsBytes(),
  );

  final thumbPath = buildUploadPath(userId: userId, extension: 'jpg');
  final thumbnailUrl = await storageRepo.uploadImageBytes(
    bucket: 'posts',
    path: thumbPath,
    bytes: await thumbnail.readAsBytes(),
  );

  return (videoUrl: videoUrl, thumbnailUrl: thumbnailUrl);
}

// Updated free-tier math (README note)
// Photos (Module 4):  ~300KB/post  -> ~2,500-5,000 posts per 1GB
// Reels (this module): ~3-8MB/reel -> ~125-330 reels per 1GB
// Bandwidth (5GB/mo) is now the binding constraint far sooner — each
// Reel VIEW in the feed re-downloads (or re-streams) roughly its full
// compressed size unless cached, unlike a tiny already-cached thumbnail.`,
          pitfalls: [
            '**Assuming Module 4\'s photo-only free-tier estimate still applies once Reels ship.** A course README that never revisits this number after adding video is quietly misleading. Fix: always recalculate and re-document when a feature meaningfully changes resource usage, exactly as this topic does.',
            '**Creating a separate Storage bucket for video "since it feels like a different kind of content".** Unnecessary — the existing `posts` bucket\'s RLS policies are file-type-agnostic, and a second bucket would only duplicate policy maintenance for no benefit. Fix: reuse the existing bucket.',
            '**Uploading the thumbnail and video sequentially when they could run concurrently.** A small, genuine performance opportunity — `Future.wait([uploadVideo(), uploadThumbnail()])` would upload both in parallel rather than one after the other. Fix: consider this a worthwhile, low-risk optimisation once the sequential version works correctly.',
            '**Not considering that repeated feed views of the same Reel re-consume bandwidth unless genuinely cached.** Module 4\'s `CachedNetworkImage` caches images to disk; video playback (this module\'s next section) needs its own caching consideration for the same reason. Fix: keep this in mind heading into the feed-playback topics.',
          ],
          tryIt:
            'Upload a real compressed test Reel and its thumbnail, confirm both appear in the Supabase Storage dashboard under your user folder in the existing `posts` bucket, and write the updated free-tier Reel-capacity estimate into your README.',
          takeaway: 'The upload call is unchanged from Module 4 — the real work this topic asks of you is redoing the free-tier math honestly now that files are 15-25x larger.',
        },
      ],
    },
    {
      id: 'm9-s2',
      title: 'The vertical Reels feed',
      topics: [
        {
          id: 'm9-t5',
          title: 'video_player fundamentals',
          explain:
            '`VideoPlayerController.networkUrl(...)` gives you play, pause, loop, and mute control over a remote video — the low-level building block every Reels screen sits on top of.',
          analogy:
            'A cassette player\'s basic controls — play, pause, and a loop switch — are the same handful of buttons whether the tape is a 3-minute song or a 30-second jingle. `VideoPlayerController` is that same small, universal control surface for any video, regardless of what screen it is embedded in.',
          theory:
            '`VideoPlayerController.networkUrl(Uri.parse(videoUrl))` creates a controller; `await controller.initialize()` prepares it (buffering, reading metadata) before it can render anything — always await this before building the `VideoPlayer` widget. `controller.play()` / `.pause()`, `controller.setLooping(true)` (Reels conventionally loop, unlike a one-shot post-detail video), and `controller.setVolume(0)`/`setVolume(1)` for mute control round out the API this module needs.\n\nUnlike Module 7\'s `AnimationController` (a Flutter-side timer), `VideoPlayerController` wraps genuine platform media playback — it must be **disposed** explicitly (`controller.dispose()`) or it leaks native decoder resources, not just Dart memory — a real distinction worth being precise about heading into the next topic\'s lifecycle-management focus.',
          whyItMatters:
            'Every later topic in this section — autoplay, preloading, mute — is built entirely from these five or six method calls. Getting comfortable with the raw controller now makes the more involved lifecycle topic next feel like composition, not new complexity.',
          steps: [
            'Add `video_player: ^2.9.2` to `pubspec.yaml`.',
            'Build a minimal `ReelPlayer(videoUrl: String)` StatefulWidget creating and initializing a `VideoPlayerController.networkUrl`.',
            'Call `setLooping(true)` once initialized.',
            'Render the initialized controller via `AspectRatio(aspectRatio: controller.value.aspectRatio, child: VideoPlayer(controller))`.',
            'Add a simple tap-to-toggle play/pause, and confirm `dispose()` is called correctly when the widget is removed.',
          ],
          code: `class ReelPlayer extends StatefulWidget {
  const ReelPlayer({super.key, required this.videoUrl});
  final String videoUrl;
  @override
  State<ReelPlayer> createState() => _ReelPlayerState();
}

class _ReelPlayerState extends State<ReelPlayer> {
  late final VideoPlayerController _controller;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl))
      ..setLooping(true)
      ..initialize().then((_) {
        if (mounted) setState(() => _ready = true);
      });
  }

  @override
  void dispose() {
    _controller.dispose(); // releases native decoder resources — not optional
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) return const Center(child: CircularProgressIndicator());
    return GestureDetector(
      onTap: () => setState(() {
        _controller.value.isPlaying ? _controller.pause() : _controller.play();
      }),
      child: AspectRatio(
        aspectRatio: _controller.value.aspectRatio,
        child: VideoPlayer(_controller),
      ),
    );
  }
}`,
          pitfalls: [
            '**Building `VideoPlayer(controller)` before `initialize()` completes.** Throws or renders nothing useful — always gate rendering on a `_ready`-style flag, exactly as `FutureBuilder`\'s `ConnectionState.waiting` gated rendering back in Module 0. Fix: never render before initialization resolves.',
            '**Forgetting `dispose()`.** Unlike most Flutter objects, a `VideoPlayerController` holds a genuine native platform resource (a media decoder) — forgetting to dispose it is a much more expensive leak than a typical Dart memory leak, and repeated across a scrolling feed of Reels, this compounds fast.',
            '**Not calling `setLooping(true)` for the Reels context specifically.** A Reel that plays once and freezes on its last frame breaks the expected "endless loop" feel of the format. Fix: loop for the feed context; a one-shot post-detail view (if built) might reasonably not loop.',
            '**Using `VideoPlayerController.asset` or `.file` out of habit instead of `.networkUrl`.** LocalInsta\'s videos live in Supabase Storage as remote URLs, exactly like every image this course has ever displayed — always the network variant.',
          ],
          tryIt:
            'Build this minimal player against one of your real uploaded test Reels, confirm it initializes, plays, loops correctly, and that tapping toggles play/pause — this is the exact building block the rest of this section assembles into a full feed.',
          takeaway: 'VideoPlayerController wraps real native media playback — five or six method calls, and one non-negotiable dispose() call.',
        },
        {
          id: 'm9-t6',
          title: 'A vertical, swipeable feed with PageView',
          explain:
            '`PageView.builder(scrollDirection: Axis.vertical, ...)` renders one full-screen Reel per page, swiped vertically — the defining interaction of the format.',
          analogy:
            'A flip-book of postcards held sideways, where flipping to the next card reveals a whole new scene filling your entire view, rather than a shelf of small thumbnails you scan across — the vertical `PageView` is exactly that: one full-bleed experience at a time.',
          theory:
            '`PageView.builder(scrollDirection: Axis.vertical, itemCount: reels.length, itemBuilder: (context, i) => ReelPlayer(videoUrl: reels[i].videoUrl))` is a close cousin of Module 0\'s `ListView.builder`, differing in two ways: `scrollDirection: Axis.vertical` (a `ListView` scrolls vertically by default; a `PageView` needs it stated explicitly since its default is horizontal), and its **paging** behaviour — a `PageView` snaps to show exactly one full item at a time, rather than a continuous scroll of many partially-visible items, which is precisely the "one Reel fills the whole screen" feel this format requires.\n\nA `PageController` attached to the `PageView` exposes the current page index via a listener, which the very next topic uses to decide which Reel should actually be playing.',
          whyItMatters:
            'This is the one genuinely new Flutter widget this course introduces — `PageView` is the correct, purpose-built tool for "one full-screen item at a time, swiped between" and recognising it (rather than reaching for a `ListView` with manual snap logic) saves real implementation effort.',
          steps: [
            'Fetch a `List<Post>` filtered to `media_type = \'video\'` for the Reels feed (a straightforward `.eq(\'media_type\', \'video\')` filter on Module 5\'s existing feed query).',
            'Build `ReelsFeedScreen` wrapping a `PageView.builder(scrollDirection: Axis.vertical, ...)` over this list.',
            'Render each page as a full-screen `ReelPlayer` (previous topic) plus an overlay for caption/username/like-comment icons (mirroring `PostCard`\'s content, repositioned for a full-screen dark background).',
            'Attach a `PageController`, logging the current page index on change for now — the next topic wires real behaviour to it.',
            'Test swiping through several seeded test Reels, confirming each snaps cleanly to fill the screen.',
          ],
          code: `Future<List<Post>> fetchReelsFeed() async {
  final rows = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .eq('media_type', 'video')
      .order('created_at', ascending: false);
  return (rows as List).map((r) => Post.fromMap(r)).toList();
}

class ReelsFeedScreen extends StatefulWidget {
  const ReelsFeedScreen({super.key, required this.reels});
  final List<Post> reels;
  @override
  State<ReelsFeedScreen> createState() => _ReelsFeedScreenState();
}

class _ReelsFeedScreenState extends State<ReelsFeedScreen> {
  final _pageController = PageController();

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: PageView.builder(
        controller: _pageController,
        scrollDirection: Axis.vertical,
        itemCount: widget.reels.length,
        onPageChanged: (i) => debugPrint('Now viewing reel \$i'), // wired for real next topic
        itemBuilder: (context, i) => Stack(
          fit: StackFit.expand,
          children: [
            ReelPlayer(videoUrl: widget.reels[i].videoUrl!),
            Positioned(
              left: 12, right: 60, bottom: 24,
              child: Text(
                '@\${widget.reels[i].author.username}  \${widget.reels[i].caption ?? ''}',
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
          pitfalls: [
            '**Forgetting `scrollDirection: Axis.vertical`.** `PageView`\'s default is horizontal — omitting this produces a left-right swiping feed, the wrong interaction entirely for Reels. Fix: always set it explicitly.',
            '**Using `ListView` with manual scroll-snapping logic instead of `PageView`.** More code, more edge cases, solving a problem `PageView` already solves natively. Fix: reach for the purpose-built widget.',
            '**Building every `ReelPlayer` in the list eagerly (not via `.builder`).** The exact same performance mistake Module 0 warned against, now with a far more expensive resource (video decoders, not just widgets) at stake per item. Fix: `PageView.builder`, never a plain `PageView(children: ...)`, for anything beyond a handful of items.',
            '**Not disposing the `PageController`.** Fix: same discipline as every other controller in this course — dispose it in the State\'s `dispose()`.',
          ],
          tryIt:
            'Seed at least five test video posts, open `ReelsFeedScreen`, and confirm vertical swiping snaps cleanly between full-screen Reels — do not worry yet that every video plays simultaneously in the background; the next topic fixes exactly that.',
          takeaway: 'PageView with a vertical scroll direction is the purpose-built widget for "one full-screen item at a time, swiped between" — the defining Reels interaction in one widget.',
        },
        {
          id: 'm9-t7',
          title: 'Autoplay-when-visible: the single biggest pitfall',
          explain:
            'Without deliberate lifecycle management, `PageView.builder` would happily construct (and start playing) every Reel\'s video controller at once — the single most damaging mistake this module can make, and the one this topic exists entirely to prevent.',
          analogy:
            'A jukebox that started every record in the building playing simultaneously the moment you walked in, rather than the one you actually selected — chaotic, resource-draining, and obviously not how a jukebox should behave. Unmanaged video controllers in a `PageView` are exactly this failure mode.',
          theory:
            'The previous topic\'s naive `itemBuilder` creates a **new** `ReelPlayer` (and therefore a new `VideoPlayerController`, decoding and playing video) for every page `PageView.builder` happens to construct — which, depending on `PageView`\'s internal caching (`allowImplicitScrolling`, viewport extent), can be more than just the one visible page. The fix: lift controller lifecycle **out** of `ReelPlayer` and into the parent `ReelsFeedScreen`, which already tracks the current page via `PageController`\'s `onPageChanged` — only the **current** page\'s controller should ever call `.play()`; every other page\'s controller should be paused (or, more aggressively, not even initialized until it becomes the current or adjacent page).\n\nA clean pattern: `ReelPlayer` accepts an `isActive` bool prop; internally, it calls `.play()`/`.pause()` reactively whenever `isActive` changes (via `didUpdateWidget`), rather than deciding for itself. The parent computes `isActive: i == _currentPage` for every item it builds, keeping the "who should be playing" decision in exactly one place.',
          whyItMatters:
            'This is, without qualification, the highest-stakes correctness topic in this entire module — get it wrong, and LocalInsta\'s Reels feed silently plays every video in a session simultaneously, burning battery, bandwidth, and CPU on a real device in a way that would be immediately, embarrassingly obvious to anyone testing it.',
          steps: [
            'Add an `isActive` bool parameter to `ReelPlayer`.',
            'Inside `ReelPlayer`, override `didUpdateWidget` to call `_controller.play()` when `isActive` becomes true and `_controller.pause()` when it becomes false.',
            'In `ReelsFeedScreen`, track `int _currentPage = 0`, updated via the `PageController`\'s real `onPageChanged` callback (replacing the previous topic\'s placeholder `debugPrint`).',
            'Pass `isActive: i == _currentPage` into every `ReelPlayer` the `itemBuilder` constructs.',
            'Test deliberately: swipe through several Reels and confirm — by ear, and by checking `controller.value.isPlaying` in each — that **only** the currently visible one is ever playing.',
          ],
          code: `class ReelPlayer extends StatefulWidget {
  const ReelPlayer({super.key, required this.videoUrl, required this.isActive});
  final String videoUrl;
  final bool isActive;
  @override
  State<ReelPlayer> createState() => _ReelPlayerState();
}

class _ReelPlayerState extends State<ReelPlayer> {
  late final VideoPlayerController _controller;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl))
      ..setLooping(true)
      ..initialize().then((_) {
        if (!mounted) return;
        setState(() => _ready = true);
        if (widget.isActive) _controller.play(); // may already be active on first build
      });
  }

  @override
  void didUpdateWidget(covariant ReelPlayer old) {
    super.didUpdateWidget(old);
    if (!_ready) return;
    if (widget.isActive && !old.isActive) _controller.play();
    if (!widget.isActive && old.isActive) _controller.pause();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_ready) return const Center(child: CircularProgressIndicator());
    return AspectRatio(aspectRatio: _controller.value.aspectRatio, child: VideoPlayer(_controller));
  }
}

// ReelsFeedScreen — the single source of truth for "who is active"
int _currentPage = 0;

PageView.builder(
  controller: _pageController,
  scrollDirection: Axis.vertical,
  onPageChanged: (i) => setState(() => _currentPage = i),
  itemCount: reels.length,
  itemBuilder: (context, i) => ReelPlayer(
    videoUrl: reels[i].videoUrl!,
    isActive: i == _currentPage,
  ),
)`,
          pitfalls: [
            '**Letting each `ReelPlayer` decide for itself whether to play, based on its own guess at visibility.** Leads to exactly the "everything plays at once" failure this topic warns against — the decision must be made in one place (the parent, which alone knows the true current page) and handed down. Fix: `isActive` is always computed by the parent, never inferred locally.',
            '**Calling `.play()` unconditionally in `initState` regardless of `isActive`.** Every newly-built page (even ones `PageView` pre-builds slightly ahead of the visible one) would start playing immediately. Fix: only play in `initState` if already active; otherwise wait for `didUpdateWidget`.',
            '**Not testing with more than 2-3 Reels.** The bug is far more obvious (and far more damaging) with ten or more — a shallow test might miss it. Fix: test with a genuinely long seeded list.',
            '**Forgetting this same "who is active" discipline applies again if the Reels feed is ever embedded inside a larger tab structure using `IndexedStack` (Module 6).** An off-screen but `IndexedStack`-preserved Reels tab could keep a video playing in the background. Fix: consider pausing the current Reel explicitly when the Reels tab itself loses focus, not just when swiping within it.',
          ],
          tryIt:
            'Swipe through at least eight seeded test Reels at a normal pace, and — with the device volume up — confirm you only ever hear exactly one video playing at a time, with no overlap or background audio bleeding from a page you have swiped past.',
          takeaway: 'Exactly one page decides who is playing, and it is always the parent, computed from the real current page index — never left to each item to guess.',
        },
        {
          id: 'm9-t8',
          title: 'Preloading the next Reel',
          explain:
            'Initializing (but not yet playing) the *next* page\'s controller slightly ahead of time removes the visible stutter of starting a fresh video decode exactly at the moment a swipe completes.',
          analogy:
            'A relay race baton handoff rehearsed in advance — the incoming runner is already up to speed before the baton actually changes hands, rather than starting from a standstill at the exact handoff moment.',
          theory:
            'The previous topic\'s `isActive`-driven play/pause already avoids the *worst* problem (everything playing at once); this topic is a **polish** refinement — initializing the next likely page\'s `VideoPlayerController` (buffering its first frames) slightly before the user swipes to it, so playback can start instantly rather than showing a brief loading spinner on arrival. A simple, proportionate approach: keep the current page\'s neighbours\' controllers alive (not disposed) via `PageView`\'s own built-in `allowImplicitScrolling` or a small manual cache of the current ± 1 page\'s controllers, disposing anything outside that window as the user swipes further.\n\nThis is explicitly framed as a refinement, not a correctness requirement — the previous topic\'s fix is what prevents a genuinely broken experience; this topic is what turns a *working* Reels feed into a *smooth* one.',
          whyItMatters:
            'Distinguishing "this fixes a real bug" (previous topic) from "this is a worthwhile but optional polish pass" (this topic) is itself a useful habit — not every improvement carries equal urgency, and being able to tell the difference helps prioritise real project time.',
          steps: [
            'Confirm the previous topic\'s `isActive` correctness fix is solid before adding this refinement on top of it.',
            'Extend `ReelsFeedScreen` to keep a small window of controllers alive: current page, plus one page ahead and one page behind.',
            'Initialize (but do not play) the ahead/behind pages\' controllers as soon as they enter this window.',
            'Dispose any controller that falls outside the window as the user continues swiping.',
            'Test: swipe at a brisk, realistic pace through a long seeded list and confirm playback starts noticeably faster than the un-preloaded version.',
          ],
          code: `// A minimal preload window: keep current ± 1 controller initialized.
// (Illustrative sketch — the full implementation manages a Map<int, VideoPlayerController>
// keyed by page index, initializing entries as they enter the window and disposing
// entries that fall outside it as _currentPage changes.)

void _maintainPreloadWindow(int currentPage, int totalPages) {
  final windowStart = (currentPage - 1).clamp(0, totalPages - 1);
  final windowEnd = (currentPage + 1).clamp(0, totalPages - 1);

  // Initialize any page in [windowStart, windowEnd] not already controlled.
  for (var i = windowStart; i <= windowEnd; i++) {
    _ensureControllerInitialized(i); // no-op if already present
  }

  // Dispose anything outside the window.
  _controllers.keys
      .where((i) => i < windowStart || i > windowEnd)
      .toList()
      .forEach(_disposeController);
}`,
          pitfalls: [
            '**Preloading too wide a window (e.g. ±3 pages).** Multiplies memory and native-decoder resource usage for diminishing returns — a swipe rarely skips more than one page ahead. Fix: current ± 1 is a proportionate default.',
            '**Attempting this refinement before the previous topic\'s correctness fix is solid.** Preloading on top of a broken "everything plays at once" implementation only makes the underlying problem worse, not better. Fix: always get correctness right first, polish second.',
            '**Not disposing controllers that fall outside the window as the user swipes onward.** Silently reintroduces a slow resource leak across a long scrolling session — the exact failure mode this whole section has been careful to avoid. Fix: the disposal half of the window-maintenance logic is just as important as the initialization half.',
            '**Over-investing in this refinement for a course project\'s realistic testing scale.** A working, correctness-first Reels feed (previous topic) is a complete, legitimate deliverable on its own — treat this topic as a genuine but optional enhancement, not a blocker.',
          ],
          tryIt:
            'If you implement the preload window, compare the perceived startup delay when swiping to a next Reel with and without it, on a real device — the difference should be a clearly noticeable reduction in the brief loading-spinner moment.',
          takeaway: 'Preloading is a genuine, optional polish pass on top of the previous topic\'s correctness fix — know the difference, and get correctness right first.',
        },
        {
          id: 'm9-t9',
          title: 'Mute, tap-to-pause & double-tap-to-like',
          explain:
            'A persistent mute toggle, a tap-anywhere-to-pause gesture, and Module 5\'s double-tap-like overlay, reused directly on top of the video layer.',
          analogy:
            'The same set of quick, one-handed gestures a museum audio-guide remote offers — pause, mute, and a single "mark this one" button — familiar enough that no visitor ever needs instructions.',
          theory:
            'A simple `bool _muted` (defaulting to `true` — Reels conventionally start muted in a feed context, since audio autoplay in a public/social setting is often unwelcome by default) drives `controller.setVolume(_muted ? 0 : 1)`, toggled by a persistent speaker-icon button overlaid in a corner of the screen. Tap-anywhere-to-pause reuses the `GestureDetector.onTap` pattern from this module\'s first topic, now layered *underneath* the double-tap-to-like gesture.\n\nModule 5\'s `DoubleTapLikeOverlay` widget — built to wrap "any child" — slots directly over a `ReelPlayer` with zero modification, calling the exact same `toggle_like` RPC (Module 3) via the exact same `FeedState.toggleLike` method (Module 5). This is a genuine, satisfying confirmation that a widget built to be generic (Module 5 deliberately typed it as `{required Widget child, ...}`, not `{required PostImage image, ...}`) pays off the moment a second, unforeseen use case (video) appears.',
          whyItMatters:
            'This topic is the clearest demonstration in the whole module of *why* Module 5\'s like-toggle infrastructure was worth building generically — the exact same widget, the exact same RPC call, the exact same optimistic-update logic, now serving a media type that did not exist when it was first written.',
          steps: [
            'Add a `bool _muted = true` field to `ReelsFeedScreen`, toggled by a persistent speaker icon, applied via `controller.setVolume` on the currently active `ReelPlayer`.',
            'Add a tap-to-pause `GestureDetector` inside `ReelPlayer`, toggling `controller.play()`/`.pause()` (already built in this module\'s first topic — confirm it survives the `isActive` refactor from two topics ago).',
            'Wrap the whole `ReelPlayer` in Module 5\'s existing `DoubleTapLikeOverlay`, passing the Reel\'s current liked-state and the same `FeedState.toggleLike` call used by the photo feed.',
            'Confirm a like on a Reel updates `posts.like_count` via the same trigger from Module 3 — no special-casing needed anywhere in the database layer.',
            'Test all three gestures together on a real device: mute toggle, tap-to-pause, and double-tap-to-like, confirming none interfere with each other.',
          ],
          code: `// Reusing Module 5's DoubleTapLikeOverlay completely unmodified —
// it was always generic over "any child", exactly for a moment like this.
DoubleTapLikeOverlay(
  isLiked: feedState.isLikedOptimistic(reel, /* known liked state */ false),
  onLike: () => feedState.toggleLike(reel, currentlyLiked: false),
  child: ReelPlayer(
    videoUrl: reel.videoUrl!,
    isActive: i == _currentPage,
    muted: _muted,
  ),
)

// Mute toggle, applied to whichever controller is currently active
IconButton(
  icon: Icon(_muted ? Icons.volume_off : Icons.volume_up, color: Colors.white),
  onPressed: () => setState(() => _muted = !_muted),
)`,
          pitfalls: [
            '**Defaulting to unmuted audio in the feed.** Autoplaying audio unexpectedly in a scrolling social feed is a well-known, disliked pattern across every major platform, for good reason. Fix: default muted, let the user opt in.',
            '**Rebuilding a new like-toggle implementation for Reels instead of reusing `DoubleTapLikeOverlay` and `FeedState.toggleLike` verbatim.** Would duplicate logic that already correctly handles optimistic updates and rollback (Module 5) for no benefit. Fix: always check whether an existing, generic widget/method already solves a new problem before writing something new.',
            '**Letting the tap-to-pause gesture and the double-tap-to-like gesture conflict** (a naive single `GestureDetector` cannot always cleanly distinguish a single tap from the first half of a double tap without care). Fix: `GestureDetector` natively handles this distinction via its separate `onTap`/`onDoubleTap` callbacks correctly when both are provided on the same detector — test this specific interaction deliberately rather than assuming it just works.',
            '**Applying the mute toggle to every controller instead of only the currently active one.** Since only one controller is ever playing (per this section\'s earlier topic), this rarely causes an audible bug, but is worth being precise about — mute state should be considered global UI state (as shown, a screen-level `_muted` bool), applied to whichever controller is active at any moment.',
          ],
          tryIt:
            'On a real device with sound, confirm a Reel starts muted, tapping the speaker icon unmutes it, a single tap on the video pauses/resumes it, and a double tap likes it with the same heart animation from the photo feed — all three working together without interfering.',
          takeaway: 'DoubleTapLikeOverlay needed zero changes to work on video — a genuine payoff of building it generically over "any child" back in Module 5.',
        },
      ],
    },
    {
      id: 'm9-s3',
      title: 'Posting & integrating with existing infrastructure',
      topics: [
        {
          id: 'm9-t10',
          title: 'CreateReelScreen: publishing a video post',
          explain:
            'A close cousin of Module 5\'s `CreatePostScreen` — capture/pick, preview, caption, publish — with the crop step swapped for compression and thumbnail generation.',
          analogy:
            'The same order-slip counter used for both a photo print and a short video message — the shape of the interaction (choose the media, add a note, hand it over) barely changes even though what happens behind the counter differs.',
          theory:
            '`CreateReelScreen` mirrors Module 5\'s `CreatePostScreen` structurally: open directly into the picker (this module\'s capture topic) on load, preview the result, collect a caption, and a "Share" button that runs the full pipeline — compress + thumbnail (this module\'s compression topic) → upload both files (this module\'s upload topic) → insert a `posts` row with `media_type: \'video\'`, `image_url: thumbnailUrl`, `video_url: videoUrl`, `duration_seconds: ...`.\n\n`PostsRepository.createPost` (Module 5) needs a small, additive extension to accept these new optional fields — not a rewrite, exactly mirroring this module\'s opening schema topic\'s "additive, not forked" philosophy.',
          whyItMatters:
            'This topic is where every earlier piece of this module — schema, capture, compression, upload — assembles into one real, working, publishable feature, the same "vertical slice" satisfaction Module 4\'s avatar-upload topic delivered for the photo pipeline.',
          steps: [
            'Extend `PostsRepository.createPost` with optional `mediaType`, `videoUrl`, `durationSeconds` parameters, defaulting to the existing photo-only behaviour when omitted.',
            'Build `CreateReelScreen`, opening directly into `pickReelVideo` (this module\'s capture topic).',
            'On pick, run `compressReel` (compression topic) and preview the compressed result (or a static frame) with a caption field.',
            'On "Share", run `uploadReel` (upload topic) then call the extended `createPost`, passing `mediaType: \'video\'`.',
            'Confirm the new Reel appears correctly in both the main feed (Module 5, since it is still just a `posts` row) and the dedicated Reels feed (this module) — the two are simply different queries over the same table.',
          ],
          code: `// Extending Module 5's createPost — additive, not rewritten
Future<Post> createPost({
  required String imageUrl,
  String? caption,
  String mediaType = 'image',
  String? videoUrl,
  double? durationSeconds,
}) async {
  final userId = _client.auth.currentUser!.id;
  final row = await _client
      .from('posts')
      .insert({
        'user_id': userId,
        'image_url': imageUrl, // thumbnail, for a video post
        'caption': caption,
        'media_type': mediaType,
        'video_url': videoUrl,
        'duration_seconds': durationSeconds,
      })
      .select('*, profiles(username, avatar_url)')
      .single();
  return Post.fromMap(row);
}

// CreateReelScreen's submit handler
Future<void> _publishReel() async {
  final compressed = await compressReel(_pickedPath);
  final uploaded = await uploadReel(
    video: compressed.video,
    thumbnail: compressed.thumbnail,
    userId: supabase.auth.currentUser!.id,
  );
  await context.read<PostsRepository>().createPost(
        imageUrl: uploaded.thumbnailUrl,
        videoUrl: uploaded.videoUrl,
        mediaType: 'video',
        durationSeconds: compressed.durationSeconds,
        caption: _captionController.text.trim().isEmpty ? null : _captionController.text.trim(),
      );
}`,
          pitfalls: [
            '**Writing a separate `createReel` method instead of extending `createPost`.** Both ultimately insert into the same table with the same ownership rules — a parallel method would duplicate the RLS-respecting insert logic for no real benefit. Fix: one method, optional parameters, exactly as Module 3\'s schema philosophy intended.',
            '**Forgetting to pass `mediaType: \'video\'` explicitly.** The parameter\'s default of `\'image\'` would silently mis-tag a real video post, and the `posts_video_needs_url` check constraint would then correctly reject the insert (since `video_url` would be set but `media_type` would not say `\'video\'`) — a good example of the database catching a client-side bug, but better to get it right the first time.',
            '**Not testing that a newly created Reel shows up correctly in the ALREADY EXISTING main feed too.** Module 5\'s feed query has no `media_type` filter — it would show a video post using `image_url` (the thumbnail) exactly like a photo post, with no video-specific handling. This is expected and fine for a first pass, but worth confirming deliberately (this module\'s next topic covers making it visually distinguishable there).',
            '**Blocking the "Share" button on an unrealistically long compression step with no feedback.** Video compression can genuinely take several seconds longer than photo compression. Fix: apply Module 4\'s uploading-state pattern (a visible "Processing..." indicator) here too, scaled to video\'s longer processing time.',
          ],
          tryIt:
            'Publish a real test Reel end to end, then confirm it appears in your seeded data both via `fetchReelsFeed()` (this module) and via Module 5\'s original `fetchFeedPage()` — the same row, correctly serving two different queries.',
          takeaway: 'createPost grew three optional parameters, not a sibling method — the same additive philosophy from this module\'s opening schema topic, now applied to the repository layer.',
        },
        {
          id: 'm9-t11',
          title: 'Reels in the grid & explore: a play-icon overlay',
          explain:
            'Module 6\'s profile grid and explore grid already render every post via its `image_url` — a small play-icon overlay on video posts is the only change needed to visually distinguish them.',
          analogy:
            'A photo album where video-message pages get a small printed film-reel icon stamped in the corner — everything else about the page looks the same, one small mark tells you it plays.',
          theory:
            'Because a video post\'s `image_url` is always populated (this module\'s schema topic), Module 6\'s `postGrid` widget already renders it correctly with **zero changes** — the thumbnail simply appears exactly like a photo would. The only enhancement worth adding: a small `Icons.play_arrow` badge in the corner of any grid cell where `post.isVideo` is true, so a browsing user can tell at a glance which cells are tappable-into-a-video versus a static photo.\n\nTapping through still goes to `PostDetailScreen(postId: ...)` unchanged — a genuinely nice consequence of Module 5\'s "pass only the id, refetch fresh" navigation convention: the detail screen does not need to know in advance whether it is about to render a photo or a video, it discovers that from the fetched row\'s `media_type` and branches its own rendering accordingly (next topic touches this briefly, though full post-detail video playback is a natural, small extension left to the learner using this module\'s `ReelPlayer` widget directly).',
          whyItMatters:
            'This is the smallest topic in the module by implementation effort, and deliberately so — it is here specifically to demonstrate how far Module 6\'s existing, well-factored grid code carries a genuinely new content type with almost no new code.',
          steps: [
            'Add a small `Positioned` play-icon `Icon(Icons.play_arrow, color: Colors.white)` badge, shown only when `post.isVideo`, layered over the existing `PostImage` in Module 6\'s grid cell builder.',
            'Confirm no other change is needed to the grid layout, the `GridView.builder`, or the tap-to-navigate wiring.',
            'Apply the identical badge to Module 6\'s explore grid (which reuses the same rendering pattern).',
            'Visually confirm a mixed grid of photos and Reels renders correctly, with only video cells showing the play icon.',
          ],
          code: `// Module 6's grid cell builder — one small addition, everything else unchanged
GridView.builder(
  // ...unchanged gridDelegate, padding, etc. from Module 6...
  itemBuilder: (context, i) {
    final post = posts[i];
    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(
        builder: (_) => PostDetailScreen(postId: post.id), // unchanged
      )),
      child: Stack(
        fit: StackFit.expand,
        children: [
          PostImage(imageUrl: post.imageUrl), // unchanged — this is the thumbnail either way
          if (post.isVideo)
            const Positioned(
              top: 4, right: 4,
              child: Icon(Icons.play_arrow, color: Colors.white, size: 18,
                  shadows: [Shadow(blurRadius: 4, color: Colors.black54)]),
            ),
        ],
      ),
    );
  },
)`,
          pitfalls: [
            '**Rewriting the grid cell builder from scratch "to support video".** The existing builder already works correctly for video posts via `image_url`; only a small additive overlay is needed. Fix: extend, do not rewrite, matching every other integration topic in this module.',
            '**Forgetting the play icon needs a visible contrast treatment (a drop shadow, or a translucent background circle) regardless of the underlying thumbnail\'s colours.** A plain white icon can vanish against a bright thumbnail. Fix: a small shadow or backing circle, as shown.',
            '**Adding this overlay only to the profile grid and forgetting explore uses the identical rendering pattern.** Fix: since both grids share the same underlying builder shape (Module 6), apply the fix once, in the shared code path, rather than twice in two near-duplicate places.',
            '**Assuming the post-detail screen automatically knows how to play a video just because the grid links to it correctly.** The grid change is purely cosmetic; actual video playback inside `PostDetailScreen` is a separate, small extension (branching on `post.isVideo` to render `ReelPlayer` instead of `PostImage`) worth doing but distinct from this topic\'s narrow scope.',
          ],
          tryIt:
            'View a profile or explore grid containing a mix of your seeded photo and video test posts, and confirm only the video ones show a play-icon badge, with tapping either type still correctly opening the post detail screen.',
          takeaway: 'A well-factored grid from Module 6 needed one small overlay, not a rewrite, to correctly represent a brand-new content type.',
        },
        {
          id: 'm9-t12',
          title: 'Confirming zero changes to likes, comments & notifications',
          explain:
            'Every one of Module 5\'s likes/comments and Module 7\'s notifications already reference `post_id` generically — a deliberate audit confirming none of them need to know or care whether that post is a photo or a video.',
          analogy:
            'A library\'s "borrow this item" desk process does not change based on whether the item is a book, a DVD, or a magazine — the desk only ever asks "which item, which member", and that same process turns out to already work perfectly for a format nobody had invented yet when the desk was designed.',
          theory:
            'This topic is deliberately **verification, not implementation** — walking through `likes` (`post_id references posts(id)`), `comments` (`post_id references posts(id)`), and `notifications` (`post_id references posts(id)`, nullable) from Modules 3 and 7, confirming each one\'s foreign key, RLS policy, and trigger logic operates purely on a post\'s `id`, with **zero** reference to `image_url`, `media_type`, or anything photo-specific anywhere in their schema or logic. The `notify_on_like`/`notify_on_comment` triggers (Module 7) look up `posts.user_id` to find the recipient — a column that exists identically on every post regardless of media type.\n\nThis is the payoff of *why* Module 3\'s schema was designed the way it was: every related table references "a post", an abstraction that always included the possibility of a post being something other than a photo, even though video did not exist as a concept until this module.',
          whyItMatters:
            'This topic is arguably the single best teaching moment in the entire course about the value of designing around the right abstraction — "a post" instead of "a photo" — paying off, concretely and provably, five modules later for a feature nobody had planned in detail at the time.',
          steps: [
            'Re-read Module 3\'s `likes`, `comments` schema and RLS policies, confirming every reference is to `posts.id`, never `posts.image_url` or any photo-specific column.',
            'Re-read Module 3\'s `increment_post_like_count`/`increment_post_comment_count` triggers, confirming they update `posts.like_count`/`comment_count` — columns that exist identically for every post.',
            'Re-read Module 7\'s `notify_on_like`/`notify_on_comment` triggers, confirming the same.',
            'Test directly: like and comment on a real seeded video post from a second test account, and confirm the like/comment counters and the resulting notification all work exactly as they do for a photo post, with zero code changes anywhere in this module.',
            'Write a short README note capturing this specific finding — genuinely worth documenting as evidence of a well-designed schema.',
          ],
          code: `-- A direct verification query — likes/comments/notifications on a
-- VIDEO post, using tables and triggers that were never touched by
-- this entire module.
select p.id, p.media_type, p.like_count, p.comment_count
from public.posts p
where p.media_type = 'video'
order by p.created_at desc
limit 1;

-- Like it as a different test user (reusing the exact Module 5 RPC)
select public.toggle_like('<that video post id>');

-- Confirm the count updated via the SAME Module 3 trigger
select like_count from public.posts where id = '<that video post id>';

-- Confirm a notification was generated via the SAME Module 7 trigger
select type, actor_id, post_id from public.notifications
where post_id = '<that video post id>' order by created_at desc limit 1;`,
          pitfalls: [
            '**Assuming a new content type automatically needs new supporting infrastructure without checking first.** The instinct to build `video_likes`, `video_comments`, or video-specific notification types would have been pure, unnecessary duplication. Fix: always check whether an existing, sufficiently-general abstraction already covers a new case before building something new — this topic is the concrete proof it is worth checking.',
            '**Skipping this verification because "it probably just works".** Probably is not verified — the point of this topic is running the real queries and confirming, not assuming. Fix: always do the actual test, exactly as the steps describe.',
            '**Not appreciating this as a genuine architecture win, treating it as an unremarkable non-event.** A design decision paying off cleanly, five modules later, for a feature that was not originally planned, is worth explicitly recognising and remembering — it is exactly the kind of thing worth being able to point to in an interview as an example of good abstraction design.',
            '**Confusing "no code changes needed" with "no testing needed."** The absence of new code is precisely why a deliberate, explicit test matters — there is no new code path whose correctness would otherwise be exercised by simply writing it.',
          ],
          tryIt:
            'Run the full verification query sequence above against a real seeded video post, confirming likes, comments, and notifications all work identically to a photo post — then write the one-paragraph README note this topic\'s steps ask for.',
          takeaway: 'Nothing in likes, comments, or notifications needed to change — the strongest possible evidence that Module 3\'s "reference a post, not a photo" design was the right call.',
        },
      ],
    },
    {
      id: 'm9-s4',
      title: 'Free-tier video stewardship',
      topics: [
        {
          id: 'm9-t13',
          title: 'A duration & size cap policy',
          explain:
            'A deliberate, documented policy — 60-second max duration, a hard file-size ceiling enforced after compression, and a friendly rejection message — keeps Reels from quietly overwhelming the free tier this course has protected since Module 1.',
          analogy:
            'A postal service that accepts parcels up to a clearly posted weight limit, printed right at the counter, rather than accepting anything and being surprised later when a delivery truck cannot handle the load — a clear, upfront policy beats an unpleasant surprise.',
          theory:
            'This module\'s earlier capture topic already caps recording at 60 seconds via `maxDuration` — but a gallery-picked video has no such enforcement, and even a 60-second clip can occasionally compress to a larger-than-expected file depending on source content (a fast-motion, high-detail clip compresses less efficiently than a mostly-static one). A **post-compression size check** — reject (with a clear, friendly message) any compressed result over a hard ceiling, e.g. 15MB — is the belt-and-suspenders safeguard, mirroring Module 7\'s "instant client-side filter plus eventual server-side cleanup" two-layer thinking: the duration cap is the first, preventative layer; the size check is the second, corrective layer that catches whatever the first layer did not.\n\nThis policy is a genuine product decision worth stating explicitly (in-app copy, and the README), not a silent, undocumented limit a user discovers only by hitting it.',
          whyItMatters:
            'A clearly communicated limit, hit occasionally with a helpful message, reads as a deliberate, professional product decision; a silent failure or a mysterious crash at the same limit reads as a bug — the exact same underlying constraint, two very different user experiences depending on whether it was designed for.',
          steps: [
            'After compression (this module\'s earlier topic), check the resulting file size against a hard ceiling (e.g. 15MB).',
            'If over the limit, reject the upload with a specific, friendly message ("This video is a bit long — try trimming it under a minute") rather than a generic error.',
            'Document both the duration cap (60s) and the size ceiling (15MB) explicitly in the app\'s create-Reel screen copy, not just in code.',
            'Add the same numbers to your README\'s free-tier stewardship section, alongside this module\'s earlier bandwidth-math topic.',
            'Test deliberately: pick an unusually long gallery video and confirm the friendly rejection message appears rather than a confusing partial upload or crash.',
          ],
          code: `Future<void> _publishReel() async {
  final compressed = await compressReel(_pickedPath);

  const maxBytes = 15 * 1024 * 1024; // 15MB hard ceiling, post-compression
  final compressedSize = await compressed.video.length();
  if (compressedSize > maxBytes) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(
          "This video is a bit long or detailed to fit our size limit — "
          "try a shorter clip (under a minute works best).",
        )),
      );
    }
    return; // reject before ever reaching the network
  }

  // ...proceed with upload + createPost as before...
}`,
          pitfalls: [
            '**Relying only on the 60-second duration cap and skipping the post-compression size check.** A gallery-picked video (no OS-enforced duration cap) or an unusually detail-heavy 60-second clip could still slip through oversized. Fix: always check the real, final compressed size before uploading, not just the recording duration.',
            '**Rejecting an oversized video with a generic or technical error message.** Fix: a specific, friendly, actionable message — telling the user roughly what to do differently — is a small effort with an outsized impact on how the limit is perceived.',
            '**Not documenting the limits anywhere visible to the user until they hit one.** Fix: state the cap in the create-Reel screen\'s own copy (e.g. a small "up to 60 seconds" hint near the record button), not only in an error message after the fact.',
            '**Picking an arbitrary size ceiling without connecting it back to this module\'s earlier free-tier math.** Fix: 15MB is chosen deliberately here as roughly 2-3x this module\'s typical compressed-Reel estimate — a generous but real ceiling, not a round number picked at random.',
          ],
          tryIt:
            'Deliberately test the rejection path with an oversized gallery video, confirm the friendly message appears and no upload is attempted, then confirm a normal, well-within-limits test Reel still publishes successfully.',
          takeaway: 'Duration cap at capture, size check after compression — two layers, the same "prevent, then catch" thinking from Module 7\'s story-expiry design, now protecting video specifically.',
        },
        {
          id: 'm9-t14',
          title: 'End-to-end testing & updating the deployment checklist',
          explain:
            'A final pass confirming the whole Reels feature works together, plus folding video-specific checks into Module 10\'s existing state-coverage and free-tier-usage checklists rather than treating them as separate, forgotten lists.',
          analogy:
            'Adding a new dish to a restaurant\'s menu means walking it through the exact same pre-opening checklist as every other dish — can it be ordered, cooked, served, and cleaned up correctly — rather than inventing a brand-new, separate checklist just for that one item.',
          theory:
            'Module 10\'s capstone work (state-coverage audit, free-tier usage check, RLS security pass) was written before this module existed — this final topic is about **folding Reels into those same existing checklists**, not creating parallel ones. Add "Reels feed" and "Create Reel" rows to Module 10\'s loading/error/empty state table; re-check the free-tier usage dashboard now that video content exists; re-run the RLS impersonation test against `posts` specifically confirming a video post\'s ownership checks behave identically to a photo post\'s (they do, per this module\'s earlier verification topic — but worth confirming once more as part of the *complete*, final security pass).\n\nA genuine end-to-end walkthrough: sign in, capture a Reel, publish it, see it in the main feed AND the dedicated Reels feed, swipe through several Reels confirming only one plays at a time, like and comment on one from a second account, confirm the notification arrives — the full loop, exercised for real.',
          whyItMatters:
            'Treating a new feature\'s quality bar as "fold it into the existing rigour" rather than "it is new, so it gets a pass for now" is exactly the discipline that keeps a growing codebase\'s overall quality from eroding one feature at a time.',
          steps: [
            'Add "Reels feed" and "Create Reel" rows to Module 10\'s state-coverage checklist (README), testing loading/error/empty states for each exactly as rigorously as every other screen.',
            'Re-check the Supabase usage dashboard (Module 10\'s free-tier topic) now that real test Reels exist, updating the recorded numbers.',
            'Re-run the RLS impersonation test (Module 10\'s security pass) against `posts` specifically for a video row, confirming cross-user protection holds identically to a photo row.',
            'Do the full manual walkthrough described in this topic\'s theory, on a real device, start to finish.',
            'Update Module 10\'s architecture-walkthrough README section (its capstone topic) to mention Reels as part of the honest, complete picture of what LocalInsta does.',
          ],
          code: `<!-- README.md — state-coverage checklist, extended -->
| Screen              | Loading | Error | Empty |
|----------------------|---------|-------|-------|
| ...existing rows from Module 10 unchanged...
| Reels feed            | ✅       | ✅     | ✅     |
| Create Reel            | ✅       | ✅     | n/a   |

<!-- RLS checklist, extended -->
| Table (case)                          | Owner succeeds | Non-owner blocked |
|----------------------------------------|:---:|:---:|
| posts — video row insert/update/delete | ✅  | ✅  |`,
          pitfalls: [
            '**Creating a separate "Reels checklist" document instead of extending Module 10\'s existing ones.** Fragments the project\'s quality tracking across multiple places, easy to let one drift out of date while updating the other. Fix: one set of living checklists, every feature folded in.',
            '**Assuming the RLS re-check is redundant given this module\'s earlier verification topic already confirmed it.** That earlier topic checked the *trigger and schema* logic conceptually; this final pass is the *literal impersonation test* from Module 10\'s security methodology, applied to a video row specifically — related, but not identical, verification. Fix: do both; they check different things.',
            '**Skipping the real, full manual walkthrough because individual pieces were each tested in isolation while building them.** The same integration-gap risk Module 10\'s own capstone topic warned about for the rest of the app applies just as much to this module\'s late addition. Fix: one complete, real walkthrough, start to finish.',
            '**Forgetting to update the architecture-walkthrough README section from Module 10\'s final topic.** An architecture overview that does not mention a real, shipped feature is quietly inaccurate. Fix: treat documentation as part of "done", not an afterthought.',
          ],
          tryIt:
            'Do the complete real-device walkthrough described in this topic — capture, publish, browse both feeds, like/comment from a second account, confirm the notification — and update every relevant Module 10 checklist and README section with the real results.',
          takeaway: 'A new feature earns its place by meeting the same bar as everything that came before it — folded into the existing checklists, not exempted from them.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm9-p1',
      type: 'Project',
      title: 'Reels, End to End',
      domain: 'Video / Storage / Realtime UI',
      duration: '3.5 hours',
      description:
        'Extend posts for video, build the capture-compress-upload pipeline, and ship a correct, non-leaking vertical Reels feed with autoplay, mute, and full reuse of the existing like/comment/notification infrastructure.',
      tools: ['Flutter', 'video_player', 'video_compress', 'supabase_flutter'],
      blueprint: {
        overview:
          'An additive posts schema extension (media_type, video_url, duration_seconds) with a matching check constraint; a capture-compress-thumbnail-upload pipeline reusing Module 4\'s Storage plumbing; a vertical PageView Reels feed with correct single-active-controller playback (no leaked or simultaneously-playing videos), mute toggle, and Module 5\'s double-tap-like reused unmodified; a play-icon overlay on Module 6\'s existing grids; and an explicit verification that likes/comments/notifications needed zero changes.',
        functionalRequirements: [
          '**Schema.** Additive posts columns with a check constraint tying media_type to a required video_url; zero changes to existing RLS policies.',
          '**Capture & compression.** A 60-second duration cap, video_compress-based compression and thumbnail extraction, a post-compression size ceiling with a friendly rejection message.',
          '**Reels feed.** Vertical PageView, exactly one active/playing controller at any time verified by real testing, a preload window (optional refinement), mute toggle, tap-to-pause, double-tap-to-like via the unmodified Module 5 overlay.',
          '**Integration.** A play-icon overlay on Module 6\'s grids; a verified, unmodified path for likes/comments/notifications on video posts.',
        ],
        technicalImplementation: [
          '**supabase/migrations/0009_reels.sql.** The additive posts columns and check constraint.',
          '**features/feed/data/{post.dart, posts_repository.dart}.** Extended Post model and createPost signature.',
          '**features/reels/data/{reel_capture.dart, reel_compression.dart, reel_upload.dart}.**',
          '**features/reels/presentation/{create_reel_screen.dart, reels_feed_screen.dart, reel_player.dart}.**',
          '**features/profile/presentation/profile_screen.dart & explore_screen.dart updates.** The play-icon overlay only.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Schema extension + Post model',
            outcome: 'An additive migration and an extended, backward-compatible Post model.',
            prompt:
              'Write supabase/migrations/0009_reels.sql adding media_type (default \'image\', check constraint), video_url, and duration_seconds columns to posts, plus a posts_video_needs_url check constraint tying media_type=\'video\' to a required video_url. Extend the Dart Post model with mediaType/videoUrl/durationSeconds fields (all optional, defaulting to the existing photo behaviour) and an isVideo getter, updating copyWith and fromMap. Confirm every existing seeded photo post still round-trips correctly with zero other changes.',
          },
          {
            step: 2,
            label: 'Capture, compression, and upload pipeline',
            outcome: 'A working pick-to-uploaded-URLs pipeline for video.',
            prompt:
              'Add video_compress to pubspec.yaml. Create lib/features/reels/data/reel_capture.dart with pickReelVideo (camera-or-gallery bottom sheet, 60-second maxDuration on the camera source). Create reel_compression.dart with compressReel(path) returning the compressed video file, an extracted thumbnail file, and duration, with a post-compression 15MB size check rejecting oversized results with a friendly message. Create reel_upload.dart with uploadReel reusing Module 4\'s StorageRepository against the existing posts bucket for both the video and thumbnail files.',
          },
          {
            step: 3,
            label: 'The vertical Reels feed with correct playback lifecycle',
            outcome: 'A working feed where exactly one video ever plays at a time.',
            prompt:
              'Build lib/features/reels/presentation/reel_player.dart as a StatefulWidget taking videoUrl and isActive, using VideoPlayerController.networkUrl, looping, playing/pausing reactively in didUpdateWidget based on isActive, and disposing correctly. Build reels_feed_screen.dart with a vertical PageView.builder tracking the real current page via onPageChanged, passing isActive: i == currentPage to every ReelPlayer, wrapping each in Module 5\'s existing DoubleTapLikeOverlay unmodified, with a mute toggle and tap-to-pause. Have me test on a real device with sound that only one video ever plays at a time across at least eight seeded Reels.',
          },
          {
            step: 4,
            label: 'Publishing + grid integration + infrastructure verification',
            outcome: 'A complete, integrated Reels feature.',
            prompt:
              'Extend PostsRepository.createPost with optional mediaType/videoUrl/durationSeconds parameters. Build create_reel_screen.dart chaining pickReelVideo -> compressReel -> uploadReel -> createPost(mediaType: \'video\'). Add a play-icon overlay to Module 6\'s existing grid cell builder, shown only when post.isVideo, with no other grid changes. Finally, walk me through verifying (with real SQL queries, not just UI testing) that liking, commenting on, and receiving a notification for a video post all work through the exact same Module 3/Module 7 triggers with zero code changes, and update Module 10\'s state-coverage and RLS checklists to include Reels.',
          },
        ],
        deliverable:
          'A working Reels feature: recording or picking a video, publishing it with a real thumbnail and caption, seeing it in both the main feed and a dedicated vertical swipeable Reels feed where exactly one video ever plays at a time, liking and commenting on it from a second test account with the notification arriving correctly — all verified end to end on a real device.',
      },
    },
  ],
  quiz: [
    {
      id: 'm9-q1',
      q: 'Why does LocalInsta keep `posts.image_url` non-null and add a separate nullable `video_url`, rather than making `image_url` nullable for video posts?',
      options: [
        'It avoids a null-check ripple effect across every existing screen that already reads image_url as the thumbnail, for both photo and video posts',
        'Postgres does not allow nullable text columns',
        'RLS policies require every column to be non-null',
        'It has no real benefit, it is just a style choice',
      ],
      answer: 0,
    },
    {
      id: 'm9-q2',
      q: 'What is the single biggest correctness risk in a naive PageView.builder-based Reels feed?',
      options: [
        'Every page\'s video controller can end up initialized and playing simultaneously instead of just the currently visible one',
        'PageView cannot scroll vertically under any configuration',
        'video_player cannot play more than one video per app session',
        'Supabase Storage rejects video file uploads by default',
      ],
      answer: 0,
    },
    {
      id: 'm9-q3',
      q: 'Why does the "isActive" decision in the Reels feed get computed by the parent ReelsFeedScreen rather than by each ReelPlayer deciding for itself?',
      options: [
        'Only the parent, via the real PageController page index, actually knows which page is truly current — leaving it to each item to guess reintroduces the multi-playback bug',
        'Flutter requires all boolean state to live in a StatelessWidget',
        'ReelPlayer cannot access BuildContext',
        'It has no functional difference, only code style',
      ],
      answer: 0,
    },
    {
      id: 'm9-q4',
      q: 'Why do likes, comments, and notifications need zero schema or trigger changes to work correctly on a new video post?',
      options: [
        'They were always designed to reference a post by its id, never anything photo-specific — an abstraction general enough to cover a content type that did not exist yet',
        'Likes and comments do not actually work on video posts',
        'A separate video_likes table was created automatically',
        'RLS policies are disabled for video posts',
      ],
      answer: 0,
    },
    {
      id: 'm9-q5',
      q: 'Why does LocalInsta enforce both a 60-second recording duration cap AND a separate post-compression file-size ceiling for Reels?',
      options: [
        'The duration cap does not apply to gallery-picked videos, and even a capped-duration clip can occasionally compress larger than expected — two layers catch what one alone would miss',
        'Supabase requires exactly two validation layers for every upload',
        'The size ceiling replaces the need for video compression entirely',
        'It has no real purpose beyond redundancy',
      ],
      answer: 0,
    },
    {
      id: 'm9-q6',
      q: 'Why does the Reels-specific free-tier math (~3-8MB per Reel) matter more than Module 4\'s original photo-only estimate (~300KB per post)?',
      options: [
        'Video files are roughly 15-25x larger per post, meaning the free tier\'s storage and especially bandwidth ceilings become binding far sooner than they did for photos alone',
        'Video does not count against the Supabase free tier at all',
        'Photos and video consume identical amounts of storage once compressed',
        'The free tier ceiling automatically increases when video content is added',
      ],
      answer: 0,
    },
  ],
}
