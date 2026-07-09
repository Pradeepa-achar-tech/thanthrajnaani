// Module 0 — Dart & Flutter Foundations
// Gets a complete beginner ready to build "LocalInsta", a hyperlocal
// Instagram-style photo & video app. Consumed by the React course player
// (see components/TopicItem.jsx).

export const m0 = {
  id: 'm0',
  title: 'Dart & Flutter Foundations',
  hours: 7,
  color: 'from-slate-500/20 to-slate-700/10',
  accent: 'slate',
  description:
    'Install the Flutter toolchain, learn just-enough Dart (types, null safety, classes, collections, async), and the core Flutter widgets and streams you will lean on for every screen of LocalInsta — the feed, the grid, the realtime badges.',
  sections: [
    {
      id: 'm0-s1',
      title: 'Setup',
      topics: [
        {
          id: 'm0-t1',
          title: 'Install the Flutter SDK & run flutter doctor',
          explain:
            'Download the Flutter SDK, put it on your PATH, then run `flutter doctor` until every check turns green.',
          analogy:
            'Before a Kundapura photo studio opens for the first customer, the owner checks the camera battery, the printer ink, and the backup lights — all three, every single time. `flutter doctor` is that pre-opening checklist for your machine: it walks every dependency and tells you exactly what is still unplugged.',
          theory:
            'Flutter ships as a **ZIP folder**, not an installer. It bundles the **Dart SDK** (language + compiler) and the **Flutter framework** (widgets + rendering engine), plus a `flutter` CLI.\n\nYou "install" it by unzipping and adding its `bin` folder to your **PATH**. `flutter doctor` is your source of truth — it inspects Flutter itself, the Android toolchain, a connected device, and your IDE, printing a green tick or a red cross with the exact fix for each.',
          whyItMatters:
            'Every Flutter interview eventually asks "can you build and run right now on your machine?" LocalInsta touches camera, storage, and network permissions early — a clean `flutter doctor` from day one saves you from debugging three problems at once later.',
          steps: [
            'Download the **Flutter SDK ZIP** (stable channel) from `flutter.dev`.',
            'Unzip to a simple path like `C:\\src\\flutter` — never `Program Files`.',
            'Add `C:\\src\\flutter\\bin` to your **User PATH**.',
            'Open a fresh terminal, run `flutter --version` — expect a version and `channel stable`.',
            'Run `flutter doctor` and fix each red line in order.',
            'Run `flutter doctor --android-licenses`, answer `y` to every prompt.',
            'Re-run `flutter doctor` until every line shows `[OK]`.',
          ],
          code: `# Terminal — a healthy install
$ flutter --version
Flutter 3.24.0 • channel stable • https://github.com/flutter/flutter.git
Tools • Dart 3.5.0 • DevTools 2.37.2

$ flutter doctor
Doctor summary (to see all details, run flutter doctor -v):
[OK] Flutter (Channel stable, 3.24.0)
[OK] Android toolchain - develop for Android devices (Android SDK 34.0.0)
[OK] Android Studio (version 2024.1)
[OK] VS Code (version 1.92.0)
[OK] Connected device (1 available)

• No issues found!`,
          pitfalls: [
            '**Unzipping into `C:\\Program Files\\flutter`.** Admin-only folder blocks Flutter writing its own cache files. Fix: unzip to `C:\\src\\flutter`.',
            '**PATH not refreshed.** Terminal still says "command not found" after editing PATH. Fix: close every terminal, open a fresh one.',
            '**Android licences not accepted.** Doctor shows a warning that never clears. Fix: `flutter doctor --android-licenses`.',
            '**Skipping doctor and hoping for the best.** You hit cryptic build errors three steps later with no idea which tool is broken. Fix: run doctor after every setup step.',
            '**On the beta/master channel by accident.** Tutorials assume stable and version numbers drift. Fix: `flutter channel stable && flutter upgrade`.',
          ],
          tryIt:
            'Run `flutter doctor` and note every red line. Fix them one at a time, re-running doctor after each fix, until the summary reads "No issues found!" — you are not allowed to write Dart until then.',
          takeaway: 'No green doctor, no Flutter — verify the toolchain before writing any code.',
        },
        {
          id: 'm0-t2',
          title: 'Set up your editor & an Android emulator',
          explain:
            'Install VS Code with the Flutter extension, then create an Android emulator or plug in a real phone.',
          analogy:
            'LocalInsta needs a camera and a gallery — features that behave differently on a virtual phone than on real hardware. Think of the emulator as a photo studio\'s test print: good enough to check composition, but you still show the client the real print (a real device) before the shoot ships.',
          theory:
            '**VS Code** with the **Flutter** extension (it bundles Dart) gives you hot reload, autocomplete, and a debugger. To *run* an app you need a **device**: an **Android emulator** (created in Android Studio\'s Device Manager) or a **real phone** with USB debugging on.\n\n`flutter devices` lists every target Flutter can deploy to; `flutter run -d <id>` launches on a specific one. Camera and image-picker behaviour is one of the few things that genuinely differs between emulator and real hardware, so keep both available for LocalInsta.',
          whyItMatters:
            'A photo app lives or dies on camera/gallery UX. Testing only on an emulator (whose "camera" is a static test pattern) hides real bugs — teams expect you to validate media flows on real hardware before shipping.',
          steps: [
            'Install **VS Code**, add the **Flutter** extension.',
            'Open **Android Studio** once, let the Android SDK finish downloading.',
            'In **Device Manager**, create a virtual device (Pixel 7, a recent API level).',
            'Start the emulator; run `flutter devices` to confirm Flutter sees it.',
            'Alternatively enable **Developer Options → USB debugging** on a real phone and plug it in.',
            'Run `flutter devices` again — your phone or emulator should be listed.',
          ],
          code: `# List everything Flutter can deploy to
$ flutter devices
2 connected devices:
sdk gphone64 x86 64 (mobile) • emulator-5554 • android-x64
Pixel 7 (mobile)             • 2B131FDH200xyz • android-arm64

# Launch on a specific device by id
$ flutter run -d emulator-5554`,
          pitfalls: [
            '**Emulator painfully slow.** Hardware acceleration is off. Fix: enable VT-x/AMD-V in BIOS, install the HAXM/Hyper-V backend.',
            '**Phone not detected.** USB debugging off or a charge-only cable. Fix: enable USB debugging, use a data cable, accept the "trust this computer" prompt.',
            '**Installed "Dart" but not "Flutter" extension.** No Flutter-specific features. Fix: install the **Flutter** extension — it pulls in Dart.',
            '**Forgetting `-d <id>`.** `flutter run` with multiple devices connected prompts every single time. Fix: pass the device id explicitly.',
          ],
          tryIt:
            'Get at least one emulator AND (if you own an Android phone) a real device both showing in `flutter devices`. You will compare camera behaviour between the two once LocalInsta reaches the media module.',
          takeaway: 'A configured editor plus one working device is the launchpad for every run.',
        },
        {
          id: 'm0-t3',
          title: 'Create the project: flutter create localinsta',
          explain:
            'Scaffold the real app folder with `flutter create`, then explore the generated structure.',
          analogy:
            'A building contractor does not pour a foundation from scratch for every job — a template crew hands over walls, wiring, and a signboard already up. `flutter create` is that crew: one command and you have a fully wired project ready for LocalInsta\'s features.',
          theory:
            '`flutter create localinsta` generates a starter project: `lib/main.dart` with a demo counter app, `pubspec.yaml` (your dependency manifest), `android/`/`ios/` native folders, and a `test/` folder.\n\nThe **package name** must be lowercase with underscores — `localinsta` is valid, `LocalInsta App` is not. The two files you will live in for the rest of this course are `lib/main.dart` and `pubspec.yaml`; the `android/` folder holds the native config that becomes your installable APK.',
          whyItMatters:
            'Every Flutter project on earth starts with `flutter create`. Knowing the generated layout means you can drop into any codebase — including LocalInsta\'s real source — and immediately know where things live.',
          steps: [
            'Open a terminal in your projects folder.',
            'Run `flutter create localinsta`.',
            '`cd localinsta`.',
            'Open it in VS Code (`code .`).',
            'Open `lib/main.dart` and read the generated counter app.',
            'Open `pubspec.yaml`, note the `dependencies:` and `flutter:` sections.',
            'Run `flutter run` to confirm the scaffold works end to end.',
          ],
          code: `# Scaffold the real app
$ flutter create localinsta
Creating project localinsta...
Wrote 129 files.
All done! In order to run your application, type:
  $ cd localinsta
  $ flutter run

# Generated structure (trimmed)
localinsta/
  lib/
    main.dart        # your Dart code starts here
  pubspec.yaml        # dependency + asset manifest
  android/            # native Android config -> the APK
  ios/
  test/`,
          pitfalls: [
            '**Capital letters or hyphens in the name.** `flutter create Local-Insta` fails. Fix: lowercase with underscores.',
            '**Running create inside another Flutter project.** Nests projects and confuses tooling. Fix: run in a plain empty parent folder.',
            '**A path with spaces.** Some native build tools choke. Fix: keep the project path space-free.',
            '**Editing the demo code before running it once.** You cannot tell if a later break is yours or the scaffold\'s. Fix: run the generated app first.',
          ],
          tryIt:
            'Run `flutter create localinsta`, open it, and read `lib/main.dart` top to bottom. Find `home: const MyHomePage(...)` and trace how it wires to the widget below. You will replace this file completely — get familiar with it now.',
          takeaway: 'One `flutter create` command gives you the entire wired project skeleton.',
        },
      ],
    },
    {
      id: 'm0-s2',
      title: 'Dart language essentials',
      topics: [
        {
          id: 'm0-t4',
          title: 'Variables, types & null safety',
          explain:
            'Dart is statically typed with sound null safety — every variable\'s type is known, and nullability is explicit in the type itself.',
          analogy:
            'A LocalInsta profile has a required `username` but an optional `bio` — some accounts never fill one in. Dart makes you write that difference into the type itself, the way a form clearly marks which fields are mandatory and which say "optional".',
          theory:
            '`String username = \'anjali_ks\';` is non-nullable — it can never be `null`, and the compiler enforces it. `String? bio;` (note the `?`) says "this may be `null`". Accessing a nullable value without checking (`bio.length`) is a **compile error**, not a runtime crash waiting to happen.\n\nUse `late` for a non-null variable you will assign before first use (common in `initState`). Use `final` for a variable set once at runtime; `const` for a value known at **compile time**. The `??` operator gives a fallback (`bio ?? \'No bio yet\'`), and `!` asserts "I promise this isn\'t null" (use sparingly — it\'s an escape hatch, not a habit).',
          whyItMatters:
            'Firestore-style NoSQL nudges you toward "everything might be missing"; Postgres/Supabase (what LocalInsta uses) is closer to Dart\'s own strictness — columns are typed and nullability is explicit in the schema too. Getting comfortable with `?`/`??`/`late` here pays off directly when you model the `profiles` table in Module 3.',
          steps: [
            'Declare a non-nullable `String name = \'Ravi\';` and try assigning `null` — watch the compiler reject it.',
            'Declare `String? bio;` and print it — Dart shows `null`, no crash.',
            'Use `bio ?? \'No bio yet\'` to provide a fallback for display.',
            'Try `bio!.length` when `bio` is `null` and observe the runtime exception — then remove the `!` and guard with `if (bio != null)` instead.',
            'Declare a `late String caption;`, assign it in a constructor body, and read it after.',
          ],
          code: `void main() {
  String username = 'anjali_ks';   // non-nullable — always has a value
  String? bio;                     // nullable — may be null

  print(bio ?? 'No bio yet');      // safe fallback -> "No bio yet"

  bio = 'Beach mornings 🌊 Kundapura';
  print(bio.length);               // Dart smart-casts bio to non-null here

  const appName = 'LocalInsta';    // compile-time constant
  final createdAt = DateTime.now(); // runtime constant, set once
}`,
          pitfalls: [
            '**Reaching for `!` instead of a null check.** `bio!.length` crashes the instant `bio` really is null. Fix: prefer `if (bio != null)` or `??`.',
            '**Confusing `final` and `const`.** `final now = DateTime.now();` is fine; `const now = DateTime.now();` is a compile error because the value is not known until runtime.',
            '**Declaring everything nullable "just in case".** Makes every read site defensive for no reason. Fix: make a field non-nullable unless the domain genuinely allows absence.',
            '**Using `late` and never assigning before first read.** Throws a `LateInitializationError`. Fix: only use `late` when you can guarantee assignment happens first (e.g. in `initState`).',
          ],
          tryIt:
            'Model a tiny in-memory `Profile` with `String username`, `String? bio`, `int followerCount = 0`. Write a `displayBio()` function that returns the bio or "No bio yet" using `??`.',
          takeaway: 'Let the type system say what can be missing — `?` and `??` beat "hope it\'s not null".',
        },
        {
          id: 'm0-t5',
          title: 'Classes, constructors & copyWith',
          explain:
            'Dart classes model LocalInsta\'s core entities — `Post`, `Profile`, `Comment` — with named constructors and an immutable `copyWith` pattern.',
          analogy:
            'A printed photo caption card is fixed once printed — to change one word you print a fresh card, copying everything else across. That is exactly what `copyWith` does: build a new object, copying every field except the ones you override.',
          theory:
            'A class bundles fields and behaviour. Dart\'s shorthand constructor `Post({required this.id, required this.caption})` assigns constructor parameters straight to fields — no boilerplate `this.id = id`.\n\nMost of LocalInsta\'s models are **immutable**: once built, a `Post` object never mutates its own fields. When something changes (a like count goes up), you build a *new* `Post` via `copyWith`, which copies every field except the ones you explicitly pass in. This plays perfectly with Flutter\'s rebuild model — a new object reference signals "something changed" cleanly, and it avoids a whole class of "who else is holding a reference to this object" bugs.',
          whyItMatters:
            'copyWith is everywhere in real Flutter codebases — every model class you meet in a job will have one. Getting the pattern right here means every repository method you write from Module 3 onward reads naturally.',
          steps: [
            'Define a `Post` class with `final` fields: `id`, `caption`, `imageUrl`, `likeCount`.',
            'Write a constructor with named, `required` parameters.',
            'Add a `copyWith` method that defaults every parameter to the current field value.',
            'Create a `Post`, then derive a liked copy with `post.copyWith(likeCount: post.likeCount + 1)`.',
            'Print both — confirm the original is untouched.',
          ],
          code: `class Post {
  const Post({
    required this.id,
    required this.caption,
    required this.imageUrl,
    this.likeCount = 0,
  });

  final String id;
  final String caption;
  final String imageUrl;
  final int likeCount;

  Post copyWith({String? caption, int? likeCount}) {
    return Post(
      id: id,
      caption: caption ?? this.caption,
      imageUrl: imageUrl,
      likeCount: likeCount ?? this.likeCount,
    );
  }
}

void main() {
  const original = Post(
    id: 'p1',
    caption: 'Sunset at Trasi beach 🌅',
    imageUrl: 'https://.../trasi.jpg',
  );

  final liked = original.copyWith(likeCount: original.likeCount + 1);

  print(original.likeCount); // 0 — untouched
  print(liked.likeCount);    // 1
}`,
          pitfalls: [
            '**Making fields mutable (`String caption;` without `final`).** Any code anywhere can silently change a shared instance. Fix: `final` fields, mutate only via `copyWith`.',
            '**A `copyWith` that forgets a field.** New instances silently drop data. Fix: every field in the constructor must appear in `copyWith`.',
            '**`caption ?? this.caption` when `null` is a valid deliberate value to set.** This is the exact bug the billing course hit with notes — you cannot clear a field via `??`-style `copyWith`. Fix: use a sentinel or a dedicated "clear" method when a field genuinely needs to become null.',
            '**Passing positional args instead of named.** Easy to swap `caption` and `imageUrl` by accident. Fix: always use `required this.x` named constructors for models.',
          ],
          tryIt:
            'Add a `Profile` class (`id`, `username`, `bio` (nullable), `followerCount`) with its own `copyWith`. Write a function `incrementFollowers(Profile p)` that returns a new `Profile` with `followerCount + 1`, leaving `p` unchanged.',
          takeaway: 'Immutable models + copyWith = predictable state, one honest reason for every rebuild.',
        },
        {
          id: 'm0-t6',
          title: 'Collections & async: List, Map, and Future',
          explain:
            'A feed is a `List<Post>`; a profile lookup by id is a `Map`; network calls to Supabase always return a `Future`.',
          analogy:
            'A photo album on a shelf is a `List` — ordered, you flip through it top to bottom, exactly like scrolling LocalInsta\'s feed. A visiting-card box sorted by name is a `Map` — you jump straight to "Anjali" instead of flipping every card. And placing an order at a filter-coffee stall and waiting for it is a `Future` — you asked, you\'ll get exactly one result, later.',
          theory:
            '`List<Post> feed = [];` holds an ordered, growable sequence — `.map()`, `.where()`, `.fold()` transform it without mutating the original. `Map<String, Profile> profilesById = {};` gives O(1) lookup by key, exactly the shape you want for caching profiles you have already fetched.\n\nEvery Supabase call — `select()`, `insert()`, `upload()` — is `async` and returns a `Future<T>`: a value that is not ready yet but will be, exactly once. `await` pauses the current `async` function until that Future completes, without blocking the UI thread. Wrap awaited calls in `try`/`catch` — a dropped network connection on a college wifi is not an edge case, it is Tuesday.',
          whyItMatters:
            'Every single Supabase query you write from Module 2 onward returns a Future. If `Future`, `async`, and `await` are not muscle memory by the end of this module, every later topic will feel twice as hard.',
          steps: [
            'Build a `List<Post> feed` with three sample posts using collection literals.',
            'Use `.where((p) => p.likeCount > 0)` to filter it — confirm the original list is unchanged.',
            'Build a `Map<String, Profile>` keyed by `id` and look one up.',
            'Write an `async` function `Future<Post> fetchPost(String id)` that awaits `Future.delayed` to simulate a network call.',
            'Call it with `await` inside another `async` function, wrapped in `try`/`catch`.',
          ],
          code: `Future<Post> fetchPost(String id) async {
  // Simulates a Supabase round-trip
  await Future.delayed(const Duration(milliseconds: 400));
  return Post(id: id, caption: 'Neer dosa breakfast 🥞', imageUrl: '...');
}

Future<void> loadFeed() async {
  try {
    final post = await fetchPost('p1');
    print('Loaded: \${post.caption}');
  } catch (e) {
    print('Feed load failed: \$e');
  }
}

void main() {
  final feed = <Post>[
    const Post(id: 'p1', caption: 'A', imageUrl: '...', likeCount: 3),
    const Post(id: 'p2', caption: 'B', imageUrl: '...', likeCount: 0),
  ];
  final liked = feed.where((p) => p.likeCount > 0).toList();
  print(liked.length); // 1

  loadFeed();
}`,
          pitfalls: [
            '**Forgetting `await`.** You get a `Future<Post>` object instead of a `Post`, and printing it shows `Instance of \'Future<Post>\'`. Fix: always `await` inside an `async` function, or chain `.then()`.',
            '**An `async` function with no `try`/`catch` anywhere upstream.** An unhandled network error crashes the whole widget tree. Fix: wrap every awaited call in `try`/`catch` at the call site that shows UI.',
            '**Mutating a list while iterating it (`for (var p in feed) feed.remove(p)`).** Throws a concurrent-modification error. Fix: build a new filtered list instead.',
            '**Using `Map` when order matters.** Dart `Map` iteration order is insertion order but is easy to forget — for a feed that must render top-to-bottom, use `List`, not `Map`.',
          ],
          tryIt:
            'Write `Future<List<Post>> fetchFeed()` that returns three fake posts after a simulated delay, then a `main()` that awaits it and prints each caption. This is the exact shape you will reuse for the real Supabase feed query in Module 5.',
          takeaway: 'List for order, Map for lookup, Future for "not yet, but soon" — pick the shape that matches the question you\'re asking.',
        },
      ],
    },
    {
      id: 'm0-s3',
      title: 'Flutter widgets & layout',
      topics: [
        {
          id: 'm0-t7',
          title: 'Everything is a widget',
          explain:
            'StatelessWidget for things that never change themselves; StatefulWidget for things that hold their own mutable state.',
          analogy:
            'A printed post caption on a card is a `StatelessWidget` — give it text once, it never changes itself. A like button that flips between filled and outline hearts when tapped is a `StatefulWidget` — it remembers whether it has been tapped.',
          theory:
            'In Flutter, **everything** you see — text, padding, a whole screen — is a widget, composed into a tree. A `StatelessWidget` describes its `build(context)` purely from its constructor parameters; give it the same inputs, get the same output, forever.\n\nA `StatefulWidget` splits into two classes: the widget itself (immutable, like any other) and a paired `State<T>` object that Flutter keeps alive across rebuilds, holding mutable fields. Calling `setState(() { ... })` inside the State tells Flutter "something changed, rebuild me" — it is the single mechanism every other state-management approach (including Provider, which LocalInsta uses from Module 2 onward) ultimately sits on top of.',
          whyItMatters:
            'This StatelessWidget/StatefulWidget split is the first thing any Flutter interview probes, because it reveals whether you understand *why* Flutter rebuilds what it rebuilds — which directly explains why a badly-placed `setState` call can make an entire feed screen re-render on every keystroke.',
          steps: [
            'Write a `PostCaption` StatelessWidget that renders a `Text` from a constructor field.',
            'Write a `LikeButton` StatefulWidget with a private `_liked` bool in its State.',
            'Toggle `_liked` inside `setState` on tap; swap the icon between `Icons.favorite` and `Icons.favorite_border`.',
            'Run it, tap the button, and confirm only the icon rebuilds — not the whole screen.',
          ],
          code: `class PostCaption extends StatelessWidget {
  const PostCaption({super.key, required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text, style: const TextStyle(fontWeight: FontWeight.w600));
  }
}

class LikeButton extends StatefulWidget {
  const LikeButton({super.key});
  @override
  State<LikeButton> createState() => _LikeButtonState();
}

class _LikeButtonState extends State<LikeButton> {
  bool _liked = false;

  void _toggle() => setState(() => _liked = !_liked);

  @override
  Widget build(BuildContext context) {
    return IconButton(
      onPressed: _toggle,
      icon: Icon(
        _liked ? Icons.favorite : Icons.favorite_border,
        color: _liked ? Colors.red : null,
      ),
    );
  }
}`,
          pitfalls: [
            '**Calling `setState` outside the State class it belongs to.** Compile error, or worse, silently rebuilds the wrong widget. Fix: `setState` only exists on `State<T>` — call it from inside that class.',
            '**Putting mutable fields on a StatelessWidget.** Nothing stops you writing `late bool liked;` on one, but Flutter may discard and recreate the widget at any time, silently resetting it. Fix: mutable, rebuild-triggering data belongs in State.',
            '**Rebuilding way more than needed.** Calling `setState` at the top of a huge screen to update one icon rebuilds the whole subtree. Fix: push state down to the smallest widget that needs it (exactly what `LikeButton` does here).',
            '**Forgetting `super.key`.** Breaks Flutter\'s ability to correctly match widgets across rebuilds in lists — always forward the `key` parameter.',
          ],
          tryIt:
            'Extend `LikeButton` to also show a live like count next to the icon, incrementing/decrementing it in the same `setState` call as the toggle.',
          takeaway: 'Stateless describes; Stateful remembers — and `setState` is the one true rebuild trigger underneath everything else.',
        },
        {
          id: 'm0-t8',
          title: 'MaterialApp, Scaffold & navigation basics',
          explain:
            'MaterialApp is the app shell; Scaffold gives each screen its app bar, body, and bottom navigation; Navigator moves between screens.',
          analogy:
            'MaterialApp is the whole building; each Scaffold is one room with a signboard (AppBar) and a floor (body). Navigator.push is walking through a door into a new room, and it remembers the door you came from so `pop()` can walk you back.',
          theory:
            '`MaterialApp` sets app-wide concerns: theme, title, the initial route. Every screen is typically a `Scaffold`, which lays out an optional `appBar`, the main `body`, and often a `bottomNavigationBar` — LocalInsta\'s five tabs (Feed, Explore, Post, Notifications, Profile) live here.\n\n`Navigator.push(context, MaterialPageRoute(builder: (_) => PostDetailScreen(post: post)))` pushes a new screen onto a stack; `Navigator.pop(context)` pops it back off. Passing data forward is just a constructor parameter (`PostDetailScreen(post: post)`); passing data *back* uses `Navigator.pop(context, result)` paired with `await Navigator.push(...)` at the call site.',
          whyItMatters:
            'This push/pop stack model is the backbone of navigating from the feed into a post, into a profile, into a follower list — LocalInsta is essentially a tree of Scaffolds connected by Navigator calls, and getting comfortable with the stack model now avoids "why did three screens stack on top of each other" bugs later.',
          steps: [
            'Wrap the app in `MaterialApp(title: \'LocalInsta\', theme: ThemeData(...), home: const FeedScreen())`.',
            'Build `FeedScreen` as a `Scaffold` with an `AppBar` titled "LocalInsta".',
            'Add a `ListTile` that pushes a `PostDetailScreen`, passing a `Post` object forward.',
            'Add a back button behaviour check: confirm the system back gesture pops correctly with no extra code.',
            'Have `PostDetailScreen` pop with a result (`Navigator.pop(context, true)`) and read it with `await Navigator.push(...)` on the feed side.',
          ],
          code: `class FeedScreen extends StatelessWidget {
  const FeedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('LocalInsta')),
      body: ListView(
        children: [
          ListTile(
            title: const Text('Sunset at Trasi beach 🌅'),
            onTap: () async {
              final refreshed = await Navigator.push<bool>(
                context,
                MaterialPageRoute(
                  builder: (_) => const PostDetailScreen(postId: 'p1'),
                ),
              );
              if (refreshed == true) {
                // caller can now reload this post's like count, etc.
              }
            },
          ),
        ],
      ),
    );
  }
}

class PostDetailScreen extends StatelessWidget {
  const PostDetailScreen({super.key, required this.postId});
  final String postId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Post \$postId')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => Navigator.pop(context, true),
          child: const Text('Like & go back'),
        ),
      ),
    );
  }
}`,
          pitfalls: [
            '**Pushing a screen with `Navigator.push` but no `Scaffold` wrapping it.** No app bar, no safe-area handling, content can render under the status bar. Fix: every full screen gets its own `Scaffold`.',
            '**Forgetting `await` on `Navigator.push` when you need the return value.** The code after it runs before the pushed screen even appears. Fix: `await` when you care about the result.',
            '**Deeply nesting Navigator.push calls without a clear "root" to return to.** Users get lost five screens deep. Fix: prefer `Navigator.popUntil` or named routes back to the tab root for LocalInsta\'s five main tabs.',
            '**Passing mutable objects between screens and expecting both sides to see later changes.** Dart objects passed by reference *do* share mutations, but combined with immutable `copyWith` models (Module 0.5), this rarely does what you expect. Fix: pass an id, refetch fresh data on the far side.',
          ],
          tryIt:
            'Add a third screen, `CommentsScreen`, reachable from `PostDetailScreen`, and confirm the back stack pops correctly through all three screens with the system back button.',
          takeaway: 'MaterialApp is the building, Scaffold is the room, Navigator is the stack of doors between them.',
        },
        {
          id: 'm0-t9',
          title: 'Layout: Row, Column, Expanded & GridView',
          explain:
            'Row/Column arrange children in a line; Expanded/Flexible share remaining space; GridView.builder renders LocalInsta\'s profile photo grid.',
          analogy:
            'A `Column` is a stack of banana-leaf compartments, top to bottom; a `Row` is the same compartments side by side. `Expanded` is telling one compartment "take whatever space is left over" instead of just its natural size — exactly how a caption text should fill the space next to a fixed-size avatar.',
          theory:
            '`Row` and `Column` lay children out along one axis, sized to their natural (`intrinsic`) size by default — put an unconstrained `Text` next to an image inside a `Row` and it can overflow. Wrapping a child in `Expanded` tells it to fill whatever space remains along that axis; `Flexible` is the softer cousin that lets a child be smaller than the available space.\n\n`GridView.builder(gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3), itemBuilder: ...)` is exactly what renders a profile\'s photo grid, three thumbnails per row — it builds only the visible cells, just like `ListView.builder` does for a single column.',
          whyItMatters:
            'The profile grid and the feed list are the two layouts you will touch constantly. A `RenderFlex overflowed by N pixels` yellow-and-black error is the single most common first Flutter bug — understanding Expanded fixes it permanently, not just once.',
          steps: [
            'Build a post header `Row`: a circular avatar (fixed size) + username `Expanded` inside a `Text` + a "..." menu icon.',
            'Resize the simulated screen narrower and watch the username truncate with an ellipsis instead of overflowing.',
            'Build a `GridView.builder` with `crossAxisCount: 3` and a small `crossAxisSpacing`/`mainAxisSpacing`.',
            'Feed it a list of 12 fake image URLs, rendering each as an `Image.network` inside an `AspectRatio(aspectRatio: 1)`.',
          ],
          code: `Widget postHeader(String avatarUrl, String username) {
  return Row(
    children: [
      CircleAvatar(radius: 16, backgroundImage: NetworkImage(avatarUrl)),
      const SizedBox(width: 8),
      Expanded(
        child: Text(
          username,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
      ),
      const Icon(Icons.more_vert),
    ],
  );
}

Widget profileGrid(List<String> imageUrls) {
  return GridView.builder(
    padding: const EdgeInsets.all(2),
    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
      crossAxisCount: 3,
      crossAxisSpacing: 2,
      mainAxisSpacing: 2,
    ),
    itemCount: imageUrls.length,
    itemBuilder: (context, i) => AspectRatio(
      aspectRatio: 1,
      child: Image.network(imageUrls[i], fit: BoxFit.cover),
    ),
  );
}`,
          pitfalls: [
            '**An unconstrained `Text` next to a fixed-width image inside a `Row`.** Long usernames overflow with the classic yellow-and-black stripes. Fix: wrap the text in `Expanded` and set `overflow: TextOverflow.ellipsis`.',
            '**`GridView.builder` inside a `Column` with no bounded height.** Throws "RenderBox was not laid out" — a scrolling grid needs bounded constraints or `shrinkWrap: true` (only for small, non-scrolling cases).',
            '**Not setting `AspectRatio` or a fixed size in grid cells.** Thumbnails render at inconsistent sizes as images load at different aspect ratios. Fix: force a 1:1 `AspectRatio` and `BoxFit.cover`.',
            '**Reaching for nested `Expanded`s to "fix" overflow everywhere without understanding why.** Hides bugs instead of fixing them. Fix: understand which axis is actually constrained before reaching for Expanded.',
          ],
          tryIt:
            'Build the full post-card layout: avatar + username row on top, a square image below, then a like/comment icon row. Confirm nothing overflows with a very long username like `"anjali.kundapura.beachlife.official"`.',
          takeaway: 'Expanded shares leftover space; without it, unconstrained children overflow the moment content gets long.',
        },
        {
          id: 'm0-t10',
          title: 'Lists: ListView.builder for the feed',
          explain:
            '`ListView.builder` lazily builds only the visible feed items — essential once LocalInsta\'s feed has hundreds of posts.',
          analogy:
            'A tiffin-centre order pad does not print every past order on one giant sheet — it shows you today\'s page and flips to the next only when asked. `ListView.builder` is that order pad: it constructs a post card only when it is about to scroll into view.',
          theory:
            'A plain `ListView(children: [...])` builds **every** child up front — fine for five items, disastrous for a feed of thousands. `ListView.builder(itemCount: posts.length, itemBuilder: (context, i) => PostCard(post: posts[i]))` builds lazily: only visible cards (plus a small buffer) exist as widgets at any moment, recycling as you scroll.\n\n`ListView.separated` adds a `separatorBuilder` between items — handy for a thin divider between posts. Later, in Module 5, this exact builder pattern is what your paginated Supabase feed query feeds into: fetch a page, append to the list, `ListView.builder` renders it, a scroll listener near the bottom fetches the next page.',
          whyItMatters:
            'Every scrolling list in every production Flutter app — chat, feeds, search results — uses `.builder`. Reaching for the non-builder `ListView` on a real feed is a performance bug that will surface the moment a real user has more than a screenful of posts.',
          steps: [
            'Create a `List<Post>` of 50 fake posts.',
            'Render them with `ListView.builder`, one `PostCard` per item.',
            'Swap in `ListView.separated` with a 1px `Divider` between cards.',
            'Add `physics: const AlwaysScrollableScrollPhysics()` so the list can pull-to-refresh even when short.',
          ],
          code: `class FeedList extends StatelessWidget {
  const FeedList({super.key, required this.posts});
  final List<Post> posts;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      physics: const AlwaysScrollableScrollPhysics(),
      itemCount: posts.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, i) {
        final post = posts[i];
        return ListTile(
          leading: const CircleAvatar(),
          title: Text(post.caption, maxLines: 1, overflow: TextOverflow.ellipsis),
          subtitle: Text('\${post.likeCount} likes'),
        );
      },
    );
  }
}`,
          pitfalls: [
            '**Plain `ListView(children: posts.map(...).toList())` on a long feed.** Builds every card immediately, janky scroll and slow first paint. Fix: always `.builder` for anything that can grow unbounded.',
            '**No `key` on list items that can reorder (e.g. after a delete).** Flutter mismatches widget state across items. Fix: `ValueKey(post.id)` on each item widget.',
            '**Nesting a `ListView` inside another scrollable without `shrinkWrap`/bounded height.** Layout exceptions. Fix: for a feed, keep it as the single primary scrollable, not nested.',
            '**Forgetting a loading footer for pagination.** Users think the feed just... stopped. You will add this properly with real pagination in Module 5.',
          ],
          tryIt:
            'Add a `RefreshIndicator` wrapping the `ListView.separated`, with an `onRefresh` callback that awaits a fake 1-second delay before returning — this is the exact shape of the real pull-to-refresh you\'ll wire to Supabase later.',
          takeaway: '`.builder` is not an optimisation you add later — for a feed, it is the only correct choice from day one.',
        },
      ],
    },
    {
      id: 'm0-s4',
      title: 'Async UI, streams & state management primer',
      topics: [
        {
          id: 'm0-t11',
          title: 'Future vs Stream — why LocalInsta needs both',
          explain:
            'A Future resolves once; a Stream can emit many times over its lifetime — exactly the difference between "load the feed" and "watch the feed update live".',
          analogy:
            'Ordering one filter coffee at a stall is a `Future` — you get exactly one cup, then you\'re done. Standing under a temple bell that rings every time a new devotee arrives is a `Stream` — you keep hearing new events for as long as you\'re listening.',
          theory:
            'A `Future<T>` completes exactly once, with a value or an error. A `Stream<T>` can emit zero, one, or many values over time, and can also error or close. LocalInsta uses **both**: a one-off `select()` query for "load this profile once" is a Future; Supabase Realtime\'s `.stream()` / channel subscriptions for "tell me the instant a new comment lands on this post" is a Stream.\n\nA `StreamController<T>` is how you *create* your own stream — you `.add()` values into it and anything `.listen()`-ing receives them. Supabase\'s realtime client wraps Postgres change notifications in exactly this shape under the hood.',
          whyItMatters:
            'The realtime feed, live comment counts, and the chat module (Modules 5, 7, 8) are all built on Streams, not repeated polling. Confusing "fetch once" with "watch forever" is the single most common cause of a LocalInsta screen that never updates — or one that leaks a subscription and drains battery.',
          steps: [
            'Write `Future<int> fetchLikeCountOnce()` returning a single value after a delay.',
            'Write `Stream<int> watchLikeCount()` using `Stream.periodic` to emit an incrementing count every second (simulating realtime updates).',
            'Consume the Future with `await`.',
            'Consume the Stream with `.listen((count) => print(count))`, and manually `.cancel()` the subscription after 5 seconds.',
          ],
          code: `Future<int> fetchLikeCountOnce() async {
  await Future.delayed(const Duration(milliseconds: 300));
  return 42; // one-time snapshot
}

Stream<int> watchLikeCount() {
  var count = 42;
  return Stream.periodic(const Duration(seconds: 1), (_) => count++);
}

Future<void> main() async {
  final once = await fetchLikeCountOnce();
  print('Loaded once: \$once');

  final sub = watchLikeCount().listen((count) {
    print('Realtime update: \$count likes');
  });

  await Future.delayed(const Duration(seconds: 5));
  await sub.cancel(); // always cancel — never let a subscription outlive its screen
}`,
          pitfalls: [
            '**Polling with a repeated `Future`/`Timer` instead of a real Stream subscription.** Wastes Supabase\'s free-tier request quota and adds needless latency. Fix: use Realtime subscriptions for anything that should feel "live".',
            '**Never cancelling a `StreamSubscription`.** The listener keeps firing after its screen is disposed, sometimes calling `setState` on a dead widget and crashing. Fix: cancel in `dispose()`.',
            '**Treating a Stream like it only ever emits once.** Code written assuming "the" value, not "a" value, breaks the second update arrives. Fix: always design stream consumers to handle repeated emissions.',
            '**Using `StreamBuilder` for a value that only ever loads once.** Overkill and rebuilds the widget tree needlessly. Fix: `FutureBuilder` for one-shot loads, `StreamBuilder` for genuinely live data.',
          ],
          tryIt:
            'Extend `watchLikeCount()` to also randomly emit a comment count on the same stream using a small record `(likes: int, comments: int)`, and print both fields on each tick.',
          takeaway: 'Future answers "what is it right now"; Stream answers "tell me every time it changes" — LocalInsta needs the second for anything that should feel alive.',
        },
        {
          id: 'm0-t12',
          title: 'StreamBuilder & FutureBuilder — loading, error & data states',
          explain:
            'These two widgets rebuild automatically as a Future resolves or a Stream emits, exposing `ConnectionState` so you can render loading/error/data UI correctly.',
          analogy:
            'A railway station display board is a `StreamBuilder` for train arrivals: it silently updates itself the moment new data arrives, no one has to refresh the page. A one-time "checking your balance..." screen at an ATM is a `FutureBuilder`: shows a spinner, then either the balance or an error, once.',
          theory:
            '`FutureBuilder<T>(future: ..., builder: (context, snapshot) { ... })` gives you a `snapshot` with `.connectionState` (`waiting`, `done`), `.hasError`, `.error`, `.hasData`, `.data`. You branch on these to render a spinner, an error message, or the real content.\n\n`StreamBuilder<T>` is the same shape but for a `Stream`, and its builder re-runs on **every** emission, not just once. Both widgets automatically subscribe on build and unsubscribe on dispose — you do not manage the subscription lifecycle by hand, which is exactly why they are the preferred way to consume Streams/Futures directly inside a widget tree (versus manual `.listen()` calls, which you reserve for logic outside the widget tree).',
          whyItMatters:
            'Every screen in LocalInsta that talks to Supabase needs a genuine loading state, a genuine error state (a phone on 2G in a Kundapura village *will* time out), and a genuine data state. Skipping any of the three is the difference between a demo and a real app.',
          steps: [
            'Build a screen using `FutureBuilder<Profile>` over `fetchProfile(id)`.',
            'Render a `CircularProgressIndicator` while `connectionState == ConnectionState.waiting`.',
            'Render a retry button with the error message when `snapshot.hasError`.',
            'Render the real `Profile` UI when `snapshot.hasData`.',
            'Repeat the same three-state pattern with `StreamBuilder<int>` over `watchLikeCount()`.',
          ],
          code: `FutureBuilder<Profile>(
  future: fetchProfile(userId),
  builder: (context, snapshot) {
    if (snapshot.connectionState == ConnectionState.waiting) {
      return const Center(child: CircularProgressIndicator());
    }
    if (snapshot.hasError) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Could not load profile: \${snapshot.error}'),
            TextButton(onPressed: () {/* re-trigger fetch */}, child: const Text('Retry')),
          ],
        ),
      );
    }
    final profile = snapshot.data!;
    return ProfileHeader(profile: profile);
  },
)

StreamBuilder<int>(
  stream: watchLikeCount(),
  initialData: 0,
  builder: (context, snapshot) {
    return Text('\${snapshot.data} likes');
  },
)`,
          pitfalls: [
            '**Creating the Future/Stream directly inside `build()`.** A new Future starts on *every* rebuild — infinite reload loop. Fix: create it once in `initState` (or hold it as a field), pass the same instance to the builder.',
            '**Only handling the happy path.** No error branch means a network blip shows a blank white screen with no explanation. Fix: always branch on `hasError` explicitly.',
            '**Using `snapshot.data!` without checking `hasData` first.** Null-check crash the instant the Future/Stream has neither errored nor produced data yet. Fix: check `hasData` (or give `StreamBuilder` an `initialData`).',
            '**Reaching for `setState` + manual `.listen()` when `StreamBuilder` would do the same job more safely.** More code, more chances to forget `dispose()`. Fix: default to `StreamBuilder`/`FutureBuilder` unless you have a specific reason not to.',
          ],
          tryIt:
            'Wire a fake "posting..." flow: a button that starts a `Future<void>` upload, shown via `FutureBuilder` as a disabled button with a spinner while pending, then either a success checkmark or a red error banner with the caught exception message.',
          takeaway: 'Three states, every time: loading, error, data — a screen that only handles "data" is a demo, not an app.',
        },
        {
          id: 'm0-t13',
          title: 'setState vs a shared ChangeNotifier — why LocalInsta needs Provider',
          explain:
            '`setState` only rebuilds the widget that owns it — fine for a single like button, useless when five different screens need to know the current user\'s session at once.',
          analogy:
            'A cashier scribbling a note only they can see is `setState` — private, local. A shared whiteboard at the shop entrance that every counter can read and write is `ChangeNotifier` shared through Provider — one source of truth, visible everywhere, updated in one place.',
          theory:
            '`setState` rebuilds exactly one `State` object and its subtree. That is perfect for a single widget\'s private UI state (a text field\'s focus, one like button\'s toggle) — but LocalInsta needs the signed-in user, the unread-notification count, and the current theme mode visible from the feed, the profile tab, and the app bar simultaneously. Re-fetching or re-threading that through constructor parameters everywhere is unworkable.\n\nA `ChangeNotifier` is a plain Dart class that calls `notifyListeners()` whenever its internal state changes; anything listening rebuilds. **Provider** (the package, not a new concept) is the plumbing that makes a `ChangeNotifier` reachable from anywhere below it in the widget tree via `context.watch<T>()` (rebuilds on change) or `context.read<T>()` (one-off read, no rebuild subscription) — without threading it through every constructor by hand.',
          whyItMatters:
            'From Module 2 onward, LocalInsta wraps its Supabase repositories (auth session, feed, notifications) in `ChangeNotifier`s exposed via Provider. Understanding *why* — not just *how* — means you will reach for the right tool instead of cargo-culting `Provider.of` everywhere.',
          steps: [
            'Write a `SessionState extends ChangeNotifier` with a nullable `String? userId` and a `signIn(id)` method that sets it and calls `notifyListeners()`.',
            'Wrap a small demo app in `ChangeNotifierProvider(create: (_) => SessionState())`.',
            'In one widget, read the value reactively with `context.watch<SessionState>().userId`.',
            'In a button\'s `onPressed`, call `context.read<SessionState>().signIn(\'u1\')` — note `read`, not `watch`, since you are not building UI from it there.',
            'Confirm every widget watching `SessionState` rebuilds the instant `signIn` is called, with zero manual wiring between them.',
          ],
          code: `class SessionState extends ChangeNotifier {
  String? _userId;
  String? get userId => _userId;

  void signIn(String id) {
    _userId = id;
    notifyListeners(); // tells every listener to rebuild
  }

  void signOut() {
    _userId = null;
    notifyListeners();
  }
}

// main.dart
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => SessionState(),
      child: const LocalInstaApp(),
    ),
  );
}

// anywhere below in the tree
class AppBarUserBadge extends StatelessWidget {
  const AppBarUserBadge({super.key});
  @override
  Widget build(BuildContext context) {
    final userId = context.watch<SessionState>().userId; // rebuilds on change
    return Text(userId == null ? 'Signed out' : 'Signed in as \$userId');
  }
}

class SignInButton extends StatelessWidget {
  const SignInButton({super.key});
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () => context.read<SessionState>().signIn('u1'), // no rebuild subscription
      child: const Text('Sign in'),
    );
  }
}`,
          pitfalls: [
            '**Using `context.watch` inside a callback like `onPressed`.** Subscribes the whole widget to rebuild for no reason, or throws outright outside `build`. Fix: `context.read` for one-off actions, `context.watch` only inside `build`.',
            '**Forgetting `notifyListeners()`.** State changes silently and nothing on screen updates — the classic "I set the variable but the UI didn\'t change" bug. Fix: every mutating method ends with `notifyListeners()`.',
            '**One giant `ChangeNotifier` holding the entire app\'s state.** Every unrelated change rebuilds everything. Fix: split by concern — SessionState, FeedState, NotificationState as separate providers, exactly how LocalInsta\'s repositories will be structured from Module 3 onward.',
            '**Creating a new `ChangeNotifier` instance inside `build()`.** Loses all state on every rebuild. Fix: always construct providers once, at the top of the tree, via `create:`.',
          ],
          tryIt:
            'Add an `unreadCount` int and an `incrementUnread()` method to `SessionState`, display it as a badge next to a notifications icon, and confirm it updates live from a button press elsewhere in the tree with no direct reference between the two widgets.',
          takeaway: 'setState rebuilds one widget; a shared ChangeNotifier behind Provider rebuilds every widget that cares — pick based on how many screens need the answer.',
        },
        {
          id: 'm0-t14',
          title: 'Theming with ThemeData — laying the groundwork for dark mode',
          explain:
            'A single `ThemeData` object drives every default colour, font, and spacing across the app — and switching it is how Module 10\'s dark mode works.',
          analogy:
            'A restaurant\'s house style — plate colour, font on the menu, the shade of the tablecloth — is decided once by the owner and every dish just inherits it. `ThemeData` is that house style for LocalInsta: set it once at the root, and every `Text`, `AppBar`, and `ElevatedButton` picks it up automatically unless you override it locally.',
          theory:
            '`MaterialApp(theme: ThemeData(...))` sets the **light** theme; `darkTheme: ThemeData.dark(...)` sets the dark one, and `themeMode: ThemeMode.system` (or `.light`/`.dark`) picks which is active. Inside a widget, `Theme.of(context).colorScheme.primary` reads the current theme rather than hardcoding a colour — meaning the same widget automatically looks right in both modes.\n\nDefine LocalInsta\'s palette once via `ColorScheme.fromSeed(seedColor: ...)`, which Material 3 uses to derive a full, harmonious set of shades — primary, surface, error, and their "on-" text-contrast pairs — instead of you picking a dozen colours by hand.',
          whyItMatters:
            'Retrofitting theming after fifty screens hardcode `Colors.white` and `Colors.black` directly is a miserable multi-day job. Wiring theme-aware colours from the very first screen means Module 10\'s dark-mode toggle is a five-minute feature, not a rewrite.',
          steps: [
            'Define `ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepOrange))` for light mode.',
            'Define a second `ThemeData.dark(...)` variant for dark mode.',
            'Set `themeMode: ThemeMode.system` on `MaterialApp` so it follows the phone\'s system setting.',
            'In a widget, replace any hardcoded `Colors.black` text colour with `Theme.of(context).colorScheme.onSurface`.',
            'Toggle your emulator\'s system dark mode and confirm the app follows without a single code change.',
          ],
          code: `final lightTheme = ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepOrange),
);

final darkTheme = ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: Colors.deepOrange,
    brightness: Brightness.dark,
  ),
);

class LocalInstaApp extends StatelessWidget {
  const LocalInstaApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LocalInsta',
      theme: lightTheme,
      darkTheme: darkTheme,
      themeMode: ThemeMode.system, // Module 10 swaps this for a user toggle
      home: const FeedScreen(),
    );
  }
}

// theme-aware, not hardcoded
Text('LocalInsta', style: TextStyle(color: Theme.of(context).colorScheme.onSurface));`,
          pitfalls: [
            '**Hardcoding `Colors.white`/`Colors.black` throughout the app.** Looks broken the moment dark mode is added — white text on a white dark-mode card. Fix: always read colours from `Theme.of(context)`.',
            '**Defining `theme` but forgetting `darkTheme`.** `ThemeMode.system` silently falls back to light theme for dark-mode users. Fix: always define both if you support system mode.',
            '**Picking colours ad-hoc per screen instead of from `ColorScheme`.** Ten screens, ten slightly different oranges. Fix: derive everything from one seed colour.',
            '**Not testing dark mode until the very end.** Contrast bugs (grey text on grey background) pile up silently. Fix: toggle dark mode regularly while building each screen.',
          ],
          tryIt:
            'Build a small `PostCard` using only `Theme.of(context)` colours (no hardcoded `Colors.*`), then flip your emulator between light and dark system mode and confirm it stays legible in both.',
          takeaway: 'Read colours from Theme.of(context) from day one — dark mode should be a toggle, never a rewrite.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm0-p1',
      type: 'Mini Project',
      title: 'A Static LocalInsta Feed Mockup',
      domain: 'Flutter Fundamentals',
      duration: '2 hours',
      description:
        'Build a scrollable, theme-aware feed screen from hardcoded fake data — no backend yet — to prove out the widget-tree fundamentals before Supabase enters the picture in Module 1.',
      tools: ['Flutter', 'Dart'],
      blueprint: {
        overview:
          'A single-screen Flutter app: a MaterialApp with light/dark ThemeData, a Scaffold with an AppBar, and a ListView.builder of ten hardcoded PostCard widgets (avatar, username, square image placeholder, caption, like count) — plus a StatefulWidget LikeButton per card that toggles locally.',
        functionalRequirements: [
          '**Feed screen.** `ListView.builder` rendering 10 hardcoded `Post` model instances.',
          '**PostCard.** Avatar + username row (Expanded + ellipsis), square image placeholder (AspectRatio), caption, and a like row.',
          '**LikeButton.** StatefulWidget toggling filled/outline heart with `setState`, incrementing a local like count.',
          '**Theming.** Full light + dark ThemeData via `ColorScheme.fromSeed`, `themeMode: ThemeMode.system`, zero hardcoded colours.',
        ],
        technicalImplementation: [
          '**models/post.dart.** Immutable `Post` class with `copyWith`.',
          '**widgets/post_card.dart.** Composes avatar row + image + LikeButton using only `Theme.of(context)` colours.',
          '**widgets/like_button.dart.** `StatefulWidget` with private `_liked` and `_count` fields.',
          '**screens/feed_screen.dart.** `Scaffold` + `ListView.builder` over a hardcoded `List<Post>`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Post model + fake data',
            outcome: 'An immutable Post class and ten fake instances.',
            prompt:
              'Create lib/models/post.dart with an immutable Post class (id, username, avatarUrl, imageUrl, caption, likeCount as final fields, named required constructor, copyWith). Create lib/data/fake_posts.dart exporting a List<Post> of 10 sample posts using coastal Karnataka usernames and captions (Kundapura, Udupi, Trasi beach, Maravanthe).',
          },
          {
            step: 2,
            label: 'Theme setup',
            outcome: 'Light + dark ThemeData wired into MaterialApp.',
            prompt:
              'In lib/theme.dart define lightTheme and darkTheme ThemeData using ColorScheme.fromSeed with a deep-orange seed colour (light and dark brightness respectively), useMaterial3: true. Wire both into MaterialApp with themeMode: ThemeMode.system in lib/main.dart.',
          },
          {
            step: 3,
            label: 'LikeButton widget',
            outcome: 'A tappable heart icon with a live local count.',
            prompt:
              'Create lib/widgets/like_button.dart as a StatefulWidget taking an initial likeCount, with private _liked and _count state, toggling the heart icon (filled red when liked, outline when not) and incrementing/decrementing _count via setState on tap.',
          },
          {
            step: 4,
            label: 'PostCard widget',
            outcome: 'One fully laid-out feed card with no overflow.',
            prompt:
              'Create lib/widgets/post_card.dart taking a Post. Layout: a Row with CircleAvatar + Expanded username Text (ellipsis overflow) + a "..." icon; a square Image.network inside AspectRatio(aspectRatio: 1) with a grey placeholder while loading; a caption Text; a LikeButton passing post.likeCount. Use only Theme.of(context) colours, no hardcoded Colors.*.',
          },
          {
            step: 5,
            label: 'Feed screen',
            outcome: 'A scrollable feed of all ten cards with pull-to-refresh.',
            prompt:
              'Create lib/screens/feed_screen.dart as a Scaffold with an AppBar titled "LocalInsta" and a body RefreshIndicator wrapping a ListView.separated (Divider between cards) rendering a PostCard per fake post. onRefresh should await a fake 1-second delay. Set this as MaterialApp.home.',
          },
        ],
        deliverable:
          'A running Flutter app showing a scrollable feed of 10 post cards, each with a working local like toggle, correctly legible in both light and dark system theme, with zero layout overflow at any screen width.',
      },
    },
  ],
  quiz: [
    {
      id: 'm0-q1',
      q: 'Why does LocalInsta declare `bio` as `String?` on the Profile model instead of `String`?',
      options: [
        'Because not every account has filled in a bio — the type honestly reflects that it may be absent',
        'Because Dart requires all text fields to be nullable',
        'Because nullable fields load faster from Supabase',
        'Because `String?` is required for JSON serialization',
      ],
      answer: 0,
    },
    {
      id: 'm0-q2',
      q: 'What is the main reason LocalInsta\'s models use `copyWith` instead of mutable fields?',
      options: [
        'A new object reference cleanly signals "something changed" and avoids shared-reference bugs',
        'copyWith makes the app run faster',
        'Flutter requires all classes to have a copyWith method',
        'Mutable fields are not allowed in Dart',
      ],
      answer: 0,
    },
    {
      id: 'm0-q3',
      q: 'A feed screen needs to show a live, ever-updating like count from Supabase Realtime. Should you use a Future or a Stream?',
      options: [
        'Stream — it can emit multiple values over time as new updates arrive',
        'Future — it is simpler to write',
        'Either works identically for repeated updates',
        'Neither; use only setState and a Timer',
      ],
      answer: 0,
    },
    {
      id: 'm0-q4',
      q: 'What is wrong with creating a Future directly inside a widget\'s `build()` method and passing it to FutureBuilder?',
      options: [
        'A new Future starts on every rebuild, causing an unintended reload loop',
        'FutureBuilder cannot accept Futures created in build()',
        'It causes a compile error',
        'Nothing — this is the recommended pattern',
      ],
      answer: 0,
    },
    {
      id: 'm0-q5',
      q: 'Why does LocalInsta reach for a shared ChangeNotifier + Provider instead of just setState for the signed-in user\'s session?',
      options: [
        'Multiple unrelated screens (feed, profile, app bar) all need to read and react to the same session state',
        'setState cannot be used more than once per app',
        'ChangeNotifier is required for any network call',
        'Provider is faster than setState in every case',
      ],
      answer: 0,
    },
    {
      id: 'm0-q6',
      q: 'Why should LocalInsta read colours from `Theme.of(context)` instead of hardcoding `Colors.white`/`Colors.black`?',
      options: [
        'So the same widget looks correct in both light and dark mode without any rewrite',
        'Theme.of(context) is required by Dart\'s type system',
        'Hardcoded colours are slower to render',
        'It has no real benefit, it is just a style preference',
      ],
      answer: 0,
    },
  ],
}
