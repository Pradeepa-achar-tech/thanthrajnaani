// Flutter & Dart curriculum.
// 7-module metadata-only shell. Each module's sections/topics/projects/quiz
// are filled in dedicated sessions — see the per-module implementation playbook
// in this project's memory dir.

export const curriculum = {
  title: 'Flutter & Dart by Thanthrajnaani',
  subtitle: 'Build production mobile apps from scratch',
  modules: [
    {
      id: 'm0',
      title: 'Dart Bootcamp',
      hours: 8,
      color: 'from-emerald-500/20 to-emerald-700/10',
      accent: 'emerald',
      description:
        'Pure-Dart fundamentals: install, syntax, types, null-safety, OOP, generics, async basics, packages.',
      sections: [
        {
          id: 'm0-s1',
          title: 'Setting Up Dart',
          topics: [
            {
              id: 'm0-t1',
              title: 'Install Dart SDK and Verify',
              explain: 'Get the Dart SDK onto your machine and confirm with dart --version that the install worked.',
              analogy: 'Imagine your cousin Pradeep wants to drive an auto-rickshaw in Bangalore. He needs three things first: the auto itself, a driving license, and his name on the RTO records. Skip any one and traffic police pull him over within a kilometre. Installing Dart is the same: the **SDK is the auto**, **PATH is the license** (your shell knows where to find dart), and `dart --version` is the **RTO check** that confirms everything is registered. You will never write a single line of Dart until all three are in place. Skipping the verify step is the most common reason a fresh Flutter setup fails on day one.',
              theory: `The Dart SDK is a single bundle that ships **four command-line tools** you will use every day: \`dart\` (the compiler and runner), \`dart pub\` (the package manager), \`dart format\` (the formatter), and \`dart analyze\` (the linter). Flutter ships its own bundled Dart SDK, but for pure-Dart work in this module you install a **standalone SDK** so you can run \`.dart\` files outside Flutter.\n\nOn Windows you have three install options: **Chocolatey** (\`choco install dart-sdk\`), **the official zip** from dart.dev/get-dart, or **winget** (\`winget install Dart.Dart-SDK\`). On macOS you use Homebrew (\`brew tap dart-lang/dart && brew install dart\`), and on Linux a Debian-style apt repository. All three drop the same \`dart\` executable into a folder that **must be on your PATH** so any terminal can find it.\n\nThe \`PATH\` environment variable is just an ordered list of folders your shell searches when you type a command. If \`dart\` is not in any of those folders, you get a "command not found" error — the SDK is installed but unreachable, like a new auto parked in your garage with no key.\n\n**Verifying** with \`dart --version\` does two jobs at once: it proves the binary runs and it tells you which version you got. Dart 3.x is the modern baseline (sound null safety, records, patterns). If --version prints a 2.x version, upgrade before continuing — half this module relies on Dart 3 features.`,
              whyItMatters: 'Every Flutter interview eventually asks you to **live-code** a small Dart snippet — fizzbuzz, JSON parsing, a Future chain. The interviewer expects you to have a working SDK on your laptop before the call starts. Beyond interviews, when you join a Flutter team your first day is spent setting up tools; being able to install and verify the SDK in under five minutes signals you have done this before. And when something breaks in production at 2 AM, the difference between a senior and a junior is often: the senior knows the SDK location, the version, and how to roll back. Master the install once and you remove an entire class of pebbles from your shoe forever.',
              steps: [
                'Open PowerShell as **Administrator** (right-click PowerShell, Run as Administrator).',
                'Install Chocolatey if not already present: paste the one-liner from chocolatey.org/install. Verify with `choco --version`.',
                'Install the Dart SDK with `choco install dart-sdk -y`. Wait for the success line.',
                'Close that PowerShell window and open a **new** one — Choco modifies PATH but only new shells pick it up.',
                'Run `dart --version`. Expect output like `Dart SDK version: 3.5.0 (stable) ... on "windows_x64"`.',
                'Run `where.exe dart` to see the install location — usually `C:\\tools\\dart-sdk\\bin\\dart.exe`.',
                'Run `dart --help` and skim the subcommands list (compile, run, pub, analyze, format).',
                'Bookmark dart.dev/tools/sdk — the official reference for every command you saw.',
              ],
              code: `// terminal_session.txt
// What you should see, end-to-end, on a fresh Windows install.

PS C:\\Users\\anjali> choco install dart-sdk -y
... Chocolatey downloads and unzips ~80 MB ...
The install of dart-sdk was successful.

PS C:\\Users\\anjali> dart --version
Dart SDK version: 3.5.0 (stable) (Tue Aug 6 12:24:47 2024 +0000) on "windows_x64"

PS C:\\Users\\anjali> where.exe dart
C:\\tools\\dart-sdk\\bin\\dart.exe

PS C:\\Users\\anjali> dart --help
A command-line utility for Dart development.
Usage: dart [<vm-flags>] <command|dart-file> [<arguments>]
Commands:
  analyze    Analyze Dart code in a directory.
  compile    Compile Dart to various formats.
  create     Create a new Dart project.
  format     Idiomatically format Dart source code.
  pub        Work with packages.
  run        Run a Dart program.
  test       Run tests for a project.

// ---------- minimal hello.dart you can run right after installing ----------
// Save as hello.dart, then in the same folder: dart run hello.dart

import 'dart:io';

void main() {
  print('Namaskara, Karnataka — Dart is alive on this machine.');
  final shortVersion = Platform.version.split(' ').first;
  print('Running on Dart \$shortVersion');
}`,
              pitfalls: [
                '**PATH not refreshed.** You installed but `dart --version` says command not found. Fix: close every terminal, open a new one. Restart VS Code too — its integrated terminal also caches PATH.',
                '**Two SDKs fighting.** You installed standalone Dart but Flutter is also on PATH. Now `dart --version` shows the Flutter-bundled one. Fix: run `where.exe dart` and decide which one you want first in PATH; reorder in System Environment Variables.',
                '**Old Dart 2.x installed.** Half this module assumes Dart 3 features (records, patterns, sealed classes). Fix: `choco upgrade dart-sdk`, or uninstall and reinstall from dart.dev.',
                '**Admin permissions missing.** Choco install fails silently in user-mode PowerShell, leaving partial state. Fix: always run install commands from an **Administrator** shell.',
                '**Antivirus quarantines `dart.exe`.** Common with corporate Windows laptops. Fix: whitelist the install folder in your AV exclusions.',
                '**Trying to run .dart files by double-clicking.** Windows opens them in Notepad. Fix: always run via `dart run filename.dart` from a terminal.',
                '**Wrong drive letter on portable installs.** You installed to D: but PATH points to C:. Fix: `where.exe dart` reveals the lie immediately.',
                '**Forgetting to re-verify after Windows updates.** Some major updates reset PATH for system-installed tools. Re-run `dart --version` after big OS updates.',
              ],
              tryIt: `Install the SDK, then create a folder \`dart-bootcamp/\` and inside it a file \`verify.dart\` with one \`void main()\` that prints your name, your city, and the output of \`DateTime.now()\`. Run it with \`dart run verify.dart\`. **Now extend it** to also print the Dart version using \`Platform.version\` (you will need \`import 'dart:io';\` at the top). The exercise drills the install/run/edit loop you will repeat thousands of times during this course.`,
              takeaway: 'No SDK on PATH means no Dart. Verify once, then forget.',
            },
            {
              id: 'm0-t2',
              title: 'Your First Dart Program',
              explain: 'Write the smallest possible Dart program — main() and one print line — and run it. Syntax is explained in later sections; today is just about proving the toolchain works.',
              analogy: 'Picture Anjali opening a new chaat shop on Brigade Road. She paints the signboard, plugs in the lights, stocks the counter — but until she **rolls up the shutter and shouts open**, no customer walks in. The `void main()` function is exactly that shutter. Your file can have a hundred functions, classes, and variables, but the Dart VM only ever looks for one signal to begin: a function literally named `main`. Find it, run it, exit. Miss it and the file is just a dictionary nobody reads.',
              theory: `Every executable Dart program has **exactly one top-level function called \`main\`**. The Dart VM uses it as the entry point — it does not care what other code is in the file until \`main\` calls it. The simplest possible signature is \`void main()\` — no parameters, no return value, just a body of statements that run top to bottom.\n\nInside \`main\`, the most useful starter command is \`print(...)\` which writes a line of text to your terminal. That is genuinely all you need to feel productive on day one. Statements end with a semicolon \`;\`. The body of \`main\` lives between curly braces \`{ }\`. That is the whole shape.\n\nThe **file extension must be \`.dart\`**. The convention is \`snake_case.dart\` (e.g., \`hello_world.dart\`, not \`HelloWorld.dart\`). The filename has zero effect on execution — Dart finds \`main\` regardless of what the file is called.\n\n**Don't worry about the syntax yet.** You will see things like \`void\`, the empty parentheses, the semicolons, and quotes around text. Every one of these has a chapter coming up — \`void\` is covered in Functions (m0-s5), variables and types in m0-s2, control flow in m0-s3. Today you are just proving the toolchain works and earning the right to type \`dart run\` and see output appear.\n\nYou run a Dart file three different ways depending on what you want: \`dart run hello.dart\` for development (the JIT path covered in m0-t3), \`dart compile exe hello.dart\` to produce a self-contained native binary, or \`dart compile js\` for the browser. The bootcamp lives in \`dart run\` — fast, iterative, exactly what you want while learning.`,
              whyItMatters: 'Every Flutter app, every backend service, every CLI you write in Dart starts with the exact same `void main()` skeleton. Once you have written ten hello-worlds you stop thinking about the entry point and start thinking about the actual problem. More importantly, **understanding the boundary between code that runs at startup and code that defines things** is the foundation for everything that comes later — top-level functions, instance methods, lazy initialization, and the Flutter `runApp()` call. Get the entry point right today and the next 100 hours of Flutter make far more sense.',
              steps: [
                'Create a folder named `dart-bootcamp` somewhere convenient (Desktop is fine).',
                'Inside it, create a new file named `hello.dart` (lowercase, with the `.dart` extension).',
                'Open the file in VS Code and install the official **Dart** extension if not already present.',
                'Type exactly four lines: `void main() {` on line 1, `  print("Namaskara, Karnataka!");` on line 2, `}` on line 3. Save.',
                'Open a terminal in that folder and run `dart run hello.dart`. You should see the greeting print.',
                'Add a second `print(...)` line inside the curly braces — try `print("Welcome to Kundapura.");`. Save and re-run.',
                'Note how fast the edit-run loop is — under a second on most machines. This sub-second feedback is why we use `dart run` for the entire bootcamp.',
                'Do not try to add arguments, variables, or anything else yet. The next sections (m0-s2 onward) will introduce each piece in order.',
              ],
              code: `// hello.dart
// The smallest possible Dart program. Run with: dart run hello.dart

void main() {
  print("Namaskara, Karnataka!");
}

// That is it. Three lines. The Dart VM looks for a function called main,
// runs everything between its curly braces, and exits.

// You can add more print lines inside the braces — try this version:
//
// void main() {
//   print("Namaskara, Karnataka!");
//   print("Welcome to Kundapura.");
//   print("Today we start learning Dart.");
// }
//
// Each print(...) line writes one line of output. That is the entire
// vocabulary you need today. Variables, types, conditions, and loops
// all come in the next sections — for now just enjoy seeing your
// own text appear when you press Enter on dart run.`,
              pitfalls: [
                '**No main function.** Your file has classes and functions but no `void main()`. Dart errors with **No main method found**. Fix: every runnable file needs exactly one top-level `main`.',
                '**Two main functions in the same project.** Different files in `bin/` each have a main — fine, but `dart run` needs `dart run my_pkg:other_main` to disambiguate. Keep one main per script for simplicity.',
                '**Wrong filename casing.** `Hello.dart` runs fine, but Dart conventions say `snake_case`. Linters will flag PascalCase or camelCase filenames.',
                '**Missing semicolons.** Every statement ends with `;`. Forgetting one gives a cryptic parser error pointing at the *next* line. Read upward when debugging.',
                '**Using `printf` or `console.log`.** Habit from C or JavaScript. Dart only has `print()`. Use it.',
                '**Confusing `main()` with `main`.** When calling, write `main()`; when declaring, write `void main()`. The body comes after the parens.',
                '**Forgetting to save.** VS Code shows a dot on unsaved files. `dart run` reads from disk, not memory. Ctrl+S before re-running.',
                '**Running the wrong file.** You edited `hello.dart` but ran `hello_v2.dart`. Always glance at the terminal to confirm the filename in the command.',
              ],
              tryIt: `Create a file \`kundapura.dart\` whose \`main()\` prints exactly four lines: line 1 "Good morning from Kundapura.", line 2 "The fishing boats are back at Gangolli harbour.", line 3 "The Court Road tiffin hotel is open from 7 a.m.", line 4 "Today we are learning Dart." Run it with \`dart run kundapura.dart\`. Confirm all four lines appear in the order you wrote them. **Do not try** to add variables, arguments, or conditionals yet — those come in the next two sections. The point of this exercise is to make sure you can edit a \`.dart\` file, save it, run it, and see your own text appear. That muscle memory is the foundation for everything in the next 60 hours.`,
              takeaway: 'Every Dart program starts at main(). No main, no run.',
            },
            {
              id: 'm0-t3',
              title: 'Two Compilers — JIT and AOT',
              explain: 'Dart compiles JIT for fast iteration during dev and AOT for tiny native binaries in release.',
              analogy: 'Imagine the difference between **making dosa batter at home** and **buying it ready-mixed from MTR Foods**. At home you grind rice and urad dal fresh, ferment overnight, and *adjust the ratio* between batches as you taste. That is **JIT**: slower upfront, but you can hot-reload the recipe mid-week. MTR runs a factory line — they grind 500 kg overnight and tomorrow morning every dosa hits the tava in 30 seconds. That is **AOT**: zero startup cost, frozen recipe. Dart ships both compilers in one box. During development you live in the home kitchen (JIT, hot reload). At release you flip to MTR mode (AOT, signed APK that boots in 200 ms).',
              theory: `**JIT** stands for **Just-In-Time** compilation. The Dart VM reads your source, compiles it to bytecode, and then compiles bytecode to native machine code *while the program is running*. It can re-optimize hot functions, swap in new code (this is what powers **hot reload** in Flutter), and run \`dart run\` against an unchanged source file in milliseconds. JIT trades **slower startup and larger memory footprint** for **fastest iteration speed**.\n\n**AOT** stands for **Ahead-Of-Time** compilation. Before shipping, you run \`dart compile exe my_program.dart\` and Dart produces a **single native binary** with no VM, no bytecode, no JIT. The binary boots instantly, has predictable performance, runs on machines that do not have Dart installed, and resists reverse engineering. AOT is what Flutter uses for **release** builds (\`flutter build apk --release\`) and what powers the App Store and Play Store binaries you ship to real users.\n\nThe **same source file** compiles both ways. You write \`void main() { ... }\` once and the toolchain decides what to produce. There is no special syntax, no #ifdef, no separate \`debug.dart\` and \`release.dart\`. This single-source-two-outputs property is what made Dart unusual when Flutter chose it — most languages give you one or the other, never both with first-class tooling.\n\nA few **caveats** matter. AOT cannot use \`dart:mirrors\` (runtime reflection) — it is excluded entirely. JIT supports \`assert(...)\` statements that AOT strips out by default; do not rely on assertions for production logic. AOT binary sizes start around 5 MB for a hello-world (the runtime is statically linked), so do not panic when your tiny program produces a chunky exe.`,
              whyItMatters: 'This is the reason Flutter delivers **sub-second hot reload** during development AND **native-grade performance** in production — same Dart code, two compilers chosen automatically. Knowing which mode you are in explains 80% of the surprises you will hit later: why is my asset missing in release (different bundling), why does my assert fire only in debug (AOT strips them), why does my reflective code throw NoSuchMethodError on the Play Store (mirrors removed). When an interviewer asks why Flutter is fast, the textbook answer is exactly this: **JIT for dev, AOT for release, no language barrier between them.**',
              steps: [
                'Save the `hello.dart` from the previous topic in your `dart-bootcamp` folder.',
                'Run `dart run hello.dart` and note the warm-up — first run is slowest because JIT compiles on demand.',
                'Run `dart compile exe hello.dart -o hello.exe`. Note the size of the resulting `.exe` (around 5 MB).',
                'Run `./hello.exe` on PowerShell. Note startup is near-instant compared to `dart run`.',
                'Compare with `dart compile aot-snapshot hello.dart` which produces a `.aot` requiring `dartaotruntime` to run.',
                'Try `dart compile js hello.dart` to see the JavaScript output for browser deployment.',
                'Open the `.exe` in a hex viewer briefly — confirm it is a real native PE binary, not a wrapper.',
                'In a Flutter project later, run `flutter run` (JIT) vs `flutter run --release` (AOT) and feel the boot-time difference.',
              ],
              code: `// bench.dart
// Compile both ways and compare. Save and run:
//   dart run bench.dart                       (JIT)
//   dart compile exe bench.dart -o bench.exe
//   ./bench.exe                                (AOT)

void main() {
  final stopwatch = Stopwatch()..start();
  final result = fib(35);
  stopwatch.stop();
  print('fib(35) = \$result in \${stopwatch.elapsedMilliseconds} ms');
}

int fib(int n) => n < 2 ? n : fib(n - 1) + fib(n - 2);

/* Typical timings on a mid-range laptop:

   dart run bench.dart                  -> ~700 ms (includes ~400 ms JIT warm-up)
   ./bench.exe (AOT-compiled)           -> ~250 ms (cold start measured to print)

   The pure-compute portion (fib itself) is similar once warm — JIT and AOT
   both produce optimized native code. The difference you see is **startup
   cost**: JIT must compile, AOT is already compiled.

   In Flutter terms:
     flutter run             -> JIT, ~3s boot, hot reload available
     flutter run --release   -> AOT, ~300ms boot, no hot reload, ships to users
*/`,
              pitfalls: [
                '**Assuming JIT-debug and AOT-release behave identically.** They do not. Asserts run in JIT, get stripped in AOT. Test your release build before shipping.',
                '**Using `dart:mirrors` in code that ships.** AOT excludes mirrors entirely; you will get a build error or a runtime crash. Use code generation (`build_runner`) instead.',
                '**Panicking at AOT binary size.** A 5 MB hello-world is normal — the Dart runtime is statically linked. The marginal cost of adding more code is small.',
                '**Forgetting `-o output_name`.** `dart compile exe file.dart` produces `file.exe` next to the source. Always pass `-o` if you want a different name or location.',
                '**JIT-only timing illusions.** Benchmarking with `dart run` includes JIT warm-up. For real numbers, run AOT, or warm up with a few thousand calls before timing.',
                '**Hot reload mistakes thought to be code bugs.** When state survives a hot reload but a class shape changed, you get weird half-states. Hot **restart** (Shift+R) is the cure.',
                '**Mixing up `dart compile aot-snapshot` and `dart compile exe`.** The snapshot needs `dartaotruntime` to run; the exe is fully standalone. For shipping, use `exe`.',
                '**Believing release equals no logging.** AOT keeps your `print()` calls. If you want them stripped, wrap them in `kDebugMode` checks (Flutter) or remove manually.',
              ],
              tryIt: `Take the \`bench.dart\` above and **time \`fib(35)\` 100 times in a loop**, accumulating the milliseconds. Run it both ways: \`dart run bench.dart\` and the AOT-compiled \`bench.exe\`. **Now extend it** by adding an \`assert(fib(10) == 55)\` call near the top of \`main\` and re-run both modes — observe the assert is only checked under JIT (the AOT binary skips it entirely). The exercise gives you a visceral feel for the JIT/AOT split.`,
              takeaway: 'JIT for development speed, AOT for release performance. Same source, two outputs.',
            },
            {
              id: 'm0-t4',
              title: 'DartPad — The Browser REPL',
              explain: 'Use dartpad.dev when you want to test a snippet without installing anything.',
              analogy: 'Think of DartPad as the **tasting counter at MTR** before they finalize a new menu. The chef whips up a small portion, you taste, suggest, tweak — no commitment, no cleanup, no full thali rolled out yet. DartPad is exactly that: open a browser tab, paste 30 lines of Dart, click Run, and see the output two seconds later. Perfect for testing a Stack Overflow answer, learning a new Dart 3 pattern, or sharing a bug reproduction with a colleague over WhatsApp. But just like the tasting counter cannot serve 200 customers during a Sunday morning rush, DartPad cannot read your files, talk to a database, or run pub get on the full pub.dev catalog. It is a tasting kitchen, not a production line.',
              theory: `**DartPad** is a free, browser-based sandbox at \`dartpad.dev\`, hosted by the Dart team. It runs your code by **compiling Dart to JavaScript** behind the scenes (\`dart compile js\` plus a sandboxed iframe), which is why you do not need a local SDK and why some Dart features are unavailable.\n\nDartPad supports **three modes**: a pure-Dart console (default), a Flutter widget preview (great for testing layout snippets), and a package mode that lets you import a small allowlist of pub.dev packages (\`http\`, \`provider\`, \`riverpod\`, and others). You cannot \`import 'dart:io';\` because there is no file system in a browser tab, and you cannot \`import 'package:sqflite';\` because that package needs native plugins.\n\nDartPad **shines for sharing**. Click the share icon and you get a permanent URL (often a GitHub gist) that anybody can open — same code, same output, no setup. The official Dart documentation embeds DartPad iframes inside lessons, which is how new learners write their first Hello world without ever installing anything. When you write a blog post, attach a DartPad link instead of a static code block.\n\nThe **limitations** matter: no file I/O, no native libraries, a memory cap, a 10-second execution timeout, and JavaScript-number semantics for \`int\` and \`double\` (so \`int\` is a 53-bit integer, not 64-bit, in DartPad). Anything serious — even a CLI that reads a config file — needs a local SDK. DartPad is for sketches.`,
              whyItMatters: 'DartPad is the **fastest path from reading about a feature to actually trying it**. New Dart language features (records, patterns, sealed classes) ship with DartPad-runnable examples on the day they are announced. When debugging a tricky null-safety puzzle, paste it into DartPad to share with the team without needing them to clone your repo. And in interviews, many companies use DartPad as a **shared coding environment** — both interviewer and candidate see the same screen. Knowing the keyboard shortcuts (Ctrl+S to format, Ctrl+Enter to run) makes you look like a pro.',
              steps: [
                'Open `dartpad.dev` in any modern browser. Bookmark it.',
                'Delete the default sample. Paste a new `void main() { print(...); }` snippet of your own.',
                'Click **Run** (or press Ctrl+Enter). Watch the output appear in the right pane.',
                'Switch the dropdown to **Flutter** and try a simple `MaterialApp` widget — see live preview.',
                'Click the **Format** button (or Ctrl+S) to auto-indent your code with `dart format`.',
                'Click **Share** to generate a permanent gist URL. Paste it into a teammate WhatsApp message.',
                'Try `import "dart:io";` and confirm the error: DartPad rejects it.',
                'Try `import "package:http/http.dart" as http;` — works, because http is on the allowlist.',
              ],
              code: `// Paste this into dartpad.dev and click Run.

import 'dart:math';

void main() {
  // Generate five random Karnataka district trips from a list.
  final districts = [
    'Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi',
    'Kalaburagi', 'Tumakuru', 'Shivamogga', 'Udupi', 'Kundapura',
  ];

  final rng = Random();
  for (var i = 0; i < 5; i++) {
    final pick = districts[rng.nextInt(districts.length)];
    print('Trip \${i + 1}: heading to \$pick');
  }

  // The next two lines work locally with the standalone SDK
  // but FAIL in DartPad — uncomment to confirm:
  //
  //   import 'dart:io';
  //   stdin.readLineSync();
  //
  // Lesson: DartPad is sandboxed. No file system, no stdin.
}`,
              pitfalls: [
                '**Trying to import `dart:io`.** DartPad runs in a browser; there is no file system, no stdin, no Process. Use a local SDK for anything that touches the OS.',
                '**Importing arbitrary `package:` URIs.** Only the allowlist works. If your package is missing, copy its source into DartPad inline or move to a local project.',
                '**Hitting the 10-second timeout.** A long benchmark or infinite loop kills the tab. Use a local SDK for anything compute-heavy.',
                '**Assuming `int` math is 64-bit.** DartPad compiles to JS, where `int` is a 53-bit double. Numbers above 2^53 lose precision silently. Use a local SDK to test 64-bit math.',
                '**Trusting the Flutter preview to match a phone.** The widget preview is a real render but pixel-density and OS-level behaviour can differ. Confirm on a device before shipping.',
                '**Forgetting Share is public.** A shared DartPad URL is a public gist. Do not paste API keys, tokens, or proprietary code. Treat it like a tweet.',
                '**Pinning to an old DartPad bookmark.** The team upgrades the underlying Dart version regularly; if a Dart 3 feature does not work, hard-refresh the page.',
                '**Confusing DartPad with `dartfiddle` or `try.dart` clones.** DartPad is the official one. Other clones may lag behind on Dart features.',
              ],
              tryIt: `Open DartPad and write a 15-line program that prints the **factorial of 10** using a recursive function \`int fact(int n) => n <= 1 ? 1 : n * fact(n - 1);\`. Run it. **Now extend it** to also print whether each factorial from 1! to 10! is even or odd. Then click Share and copy the URL — that is how you would send a code review request to a teammate without forcing them to clone anything. The exercise teaches DartPad fluency you will lean on every time you read Dart documentation.`,
              takeaway: 'DartPad for quick experiments, your local SDK for real work.',
            },
          ],
        },
        {
          id: 'm0-s2',
          title: 'Variables, Types and Null Safety',
          topics: [
            {
              id: 'm0-t5',
              title: 'var, final, const — Three Different Beasts',
              explain: 'var means mutable, final means assigned-once, const means compile-time constant.',
              analogy: 'Walk into any darshini in Bangalore and you see three types of writing on the walls. The **chalkboard menu** changes daily — that is `var`, you wipe the price of dosa and write a new one every Monday. The **printed paper insert for the daily special** is fixed once printed, but tomorrow they will print a fresh one — that is `final`, set at runtime when the day starts and unchangeable for the rest of the day. Finally, the **painted-on-the-wall restaurant name "MTR 1924"** has been there since the building was built and will be there until it is demolished — that is `const`, baked into the binary at compile time, identical for every customer who ever walks in. Misuse them and your code looks chaotic; pick the right one and your intent becomes obvious to every reader.',
              theory: `**\`var\`** declares a variable whose value can change. The type is **inferred from the first assignment**: \`var name = 'Anjali';\` is the same as \`String name = 'Anjali';\`. You can reassign \`name = 'Pradeep';\` later. Use \`var\` only when you genuinely need mutation — a counter, a buffer being built, an accumulator.\n\n**\`final\`** declares a variable that can be **assigned exactly once**. After the first assignment, attempts to reassign are compile-time errors. The value itself can be computed at runtime: \`final now = DateTime.now();\` is fine. \`final\` does **not** make the underlying object immutable — \`final list = [1, 2]; list.add(3);\` works because you mutated the list, not the variable. \`final\` is the **default choice** for nearly every variable in idiomatic Dart.\n\n**\`const\`** declares a **compile-time constant**: the value must be computable from literals and other compile-time constants when the program is compiled. \`const pi = 3.14;\` is fine; \`const now = DateTime.now();\` is a compile error because \`DateTime.now()\` runs at runtime. \`const\` objects are **canonicalized** — \`const Point(1, 2)\` referenced in two files refers to the **same instance in memory**. This is a giant performance win in Flutter, where \`const Text('Hello')\` widgets are not rebuilt across frames.\n\nA \`const\` constructor (e.g., \`const Point(this.x, this.y);\`) is just a class that allows compile-time construction. Combined with \`const\` call sites it gives you free instance-sharing. Flutter widgets like \`Text\`, \`SizedBox\`, \`Padding\` all expose const constructors for exactly this reason — read any production Flutter codebase and you will see \`const\` everywhere.`,
              whyItMatters: 'In Flutter, **`const` widgets are skipped during rebuilds** — the framework recognizes the canonicalized instance and reuses it. This is the single largest cheap performance win in the Flutter universe. Beyond perf, choosing the **strictest** of the three (`const` > `final` > `var`) communicates intent: a reader sees `const` and knows this never changes, ever. Idiomatic Dart code uses `final` everywhere by default, drops to `var` only when reassignment is needed, and reaches for `const` whenever the value is known at compile time. Get this reflex and your code review comments shrink by 30%.',
              steps: [
                'Create `vars.dart`. Declare `var counter = 0;` and reassign it. Confirm it compiles.',
                'Add `final name = "Anjali";` and try to reassign. Note the compile-time error in your editor.',
                'Add `const dartLaunchYear = 2011;` and try to set it to a runtime value. See the error.',
                'Try `const today = DateTime.now();`. Confirm Dart rejects — `now()` is not compile-time.',
                'Switch to `final today = DateTime.now();` — works. The lesson: const for literals, final for runtime values.',
                'Declare a class with a `const` constructor: `class Point { final int x, y; const Point(this.x, this.y); }`.',
                'Confirm that `identical(const Point(1, 2), const Point(1, 2))` returns `true`.',
                'Wrap a literal list in `const` like `const ["idli", "vada", "dosa"]` and confirm `.add()` throws.',
              ],
              code: `// vars.dart
// Run with: dart run vars.dart

void main() {
  // 1. var — mutable, type inferred from the first assignment.
  var counter = 0;
  counter += 1;
  counter = 42;
  print('counter is now \$counter');

  // 2. final — assigned once, value can be computed at runtime.
  final greeting = 'Namaskara';
  final timestamp = DateTime.now();
  // greeting = 'Hello';   // compile error: cannot reassign final.
  print('\$greeting at \$timestamp');

  // 3. const — compile-time constant. Must be a literal or
  //    a const expression. Deeply immutable.
  const dartLaunchYear = 2011;
  const districts = ['Udupi', 'Bengaluru', 'Mysuru'];
  // districts.add('Tumakuru');  // runtime error: const list is immutable.
  print('Karnataka districts: \$districts since Dart \$dartLaunchYear');

  // 4. Canonicalization: two const objects with the same value
  //    share the same instance in memory.
  const a = Point(1, 2);
  const b = Point(1, 2);
  print('identical(a, b)? \${identical(a, b)}');  // -> true
}

class Point {
  final int x, y;
  const Point(this.x, this.y);
}`,
              pitfalls: [
                '**Reaching for `var` by default.** Idiomatic Dart uses `final` first, `var` only when reassignment is real. Linters flag unnecessary `var`.',
                '**Confusing `final` with deep immutability.** `final list = [1, 2]; list.add(3);` is legal — you mutated the list, not the variable. Use `const` (or `List.unmodifiable`) for true immutability.',
                '**Trying `const` with runtime values.** `const today = DateTime.now();` is a compile error. Use `final` for runtime values, `const` for literals only.',
                '**Forgetting `const` on collection literals.** `[1, 2, 3]` is a fresh list each time; `const [1, 2, 3]` is canonicalized and immutable. The latter is faster and safer.',
                '**Missing `const` on Flutter widgets.** `Padding(child: ...)` rebuilds every frame; `const Padding(child: ...)` does not. Run the linter `prefer_const_constructors` to catch these.',
                '**Declaring `const` instance fields.** Instance fields cannot be `const`; only static fields and locals can. Use `static const` inside a class.',
                '**Misreading `identical(const Point(1,2), const Point(1,2))` as runtime equality.** It is canonicalization — they are literally the same object. Override `==` if you want value equality across non-const instances.',
                '**Using `final` parameters for the wrong reason.** `void foo(final int x)` prevents reassignment **inside the function**, which is rarely useful. Skip the modifier on parameters in most cases.',
              ],
              tryIt: `Create \`shop.dart\` with a \`Shop\` class that has \`final String name\`, \`final String city\`, and a \`const Shop(this.name, this.city);\` constructor. In \`main\`, declare \`const mtr = Shop('MTR', 'Bengaluru');\` and \`const mtr2 = Shop('MTR', 'Bengaluru');\`. Print \`identical(mtr, mtr2)\` — you should see \`true\`. **Now extend it** by adding a non-const field \`int customersToday = 0;\` and observe the compile error: a class with a non-final non-static field cannot have a const constructor. The lesson burns in why \`const\` requires deep immutability.`,
              takeaway: 'Reach for final by default. Drop to var only when you must reassign.',
            },
            {
              id: 'm0-t6',
              title: 'Built-in Types — int, double, num, String, bool',
              explain: 'Dart has a small set of primitive types and they all extend Object.',
              analogy: 'Picture the kirana shop near Malleshwaram circle. Ravi the shopkeeper handles five very different things every minute: **rice in whole kilos** (`int` — you do not buy 1.7 kg of rice, you buy 2 kg or 1 kg), **milk in litres with paise-precision** (`double` — 1.5 litres at ₹54.50), **the running total on his calculator** that could be either kind (`num` — the parent type), **the printed bill header that says "RAVI STORES"** (`String` — text), and **whether the shop is open right now** (`bool` — true or false, no third option). Mix these up and you get either funny errors or wrong totals — try storing a customer phone number as `int` and watch what happens when it starts with zero. Dart has exactly these five primitive types. Master what each one is for and 90% of beginner type errors disappear.',
              theory: `Dart has **five everyday primitive types** plus \`Object\` and \`dynamic\` as escape hatches.\n\n**\`int\`** holds a 64-bit signed integer on the standalone SDK and AOT, but only **53 bits** on the web (because JavaScript numbers are doubles). Range is roughly ±9.2 quintillion natively. Use \`int\` for counts, indices, IDs that are never going to start with a zero, and any whole-number quantity.\n\n**\`double\`** is a 64-bit IEEE 754 floating point. Use it for measurements, percentages, and ratios. **Never use \`double\` for money** — \`0.1 + 0.2\` does not equal \`0.3\` thanks to binary floating point. Store paise as \`int\` (multiply by 100) or use the \`decimal\` package on pub.dev.\n\n**\`num\`** is the **parent type** of both \`int\` and \`double\`. Function signatures that accept either should declare \`num\` rather than overloading: \`num square(num x) => x * x;\` works for both. You will rarely declare local variables as \`num\` — it is mostly a parameter type.\n\n**\`String\`** is an **immutable sequence of UTF-16 code units**. Every operation that appears to modify a String actually returns a new one. Use single quotes \`'like this'\`; double quotes \`"are also fine"\` when the string contains a single quote. For building strings in a loop, reach for \`StringBuffer\` — \`+=\` concatenation is O(n²).\n\n**\`bool\`** is \`true\` or \`false\` — and **only those two values**. Unlike JavaScript or Python, an \`int\` is never truthy or falsy in Dart; \`if (count)\` is a compile error if \`count\` is an \`int\`. You must write \`if (count > 0)\`. This catches an entire class of bugs at compile time.\n\nAll five extend \`Object\`, so any of them can be assigned to an \`Object\` variable. The \`dynamic\` type opts **out** of static checking — values typed \`dynamic\` accept any operation at compile time and crash at runtime if it is invalid. Use \`dynamic\` only when bridging untyped JSON or platform channels. Otherwise the static type system is your friend.`,
              whyItMatters: 'Type confusion is the #1 source of beginner Flutter bugs. Storing a phone number as `int` strips leading zeros. Storing a price as `double` causes one-paise rounding errors that compound into rupees over a year. Forgetting that `String` is immutable causes silent O(n²) loops in production. Picking the right type at declaration time saves you from each of these traps before they ship. And in interviews, when the question is why `0.1 + 0.2` is not `0.3`, the senior who answers IEEE 754 versus the junior who blames Dart is exactly the difference between hire and no-hire.',
              steps: [
                'Create `types.dart`. Declare one variable of each type: `int`, `double`, `num`, `String`, `bool`.',
                'Try to assign an `int` to a `String` variable — observe the compile error in your editor.',
                'Print `0.1 + 0.2` and confirm the output is `0.30000000000000004`, not `0.3`.',
                'Use `int.parse("42")` to convert a String to an int. Then try `int.parse("42.5")` and see it throw.',
                'Use `int.tryParse("not a number")` and confirm it returns `null` instead of throwing.',
                'Convert the other direction with `42.toString()` and `(3.14).toStringAsFixed(2)`.',
                'Build a string with `StringBuffer` in a loop and compare performance against `+=` concatenation.',
                'Try `if (someInt)` and observe Dart rejects it — bool is bool, not 0/1.',
              ],
              code: `// types.dart
// Run with: dart run types.dart

void main() {
  // 1. int — whole numbers.
  int seats = 47;
  int phoneAreaCode = 80;     // Bengaluru. As String it would be '080'.
  print('seats: \$seats, area code: \$phoneAreaCode');

  // 2. double — floating point.
  double pi = 3.14159;
  double rupees = 99.50;
  print('pi: \$pi, rupees: \$rupees');

  // 3. num — parent of int and double. Use as parameter type.
  num add(num a, num b) => a + b;
  print('add(1, 2)     = \${add(1, 2)}');      // 3   (int)
  print('add(1.5, 2.5) = \${add(1.5, 2.5)}');  // 4.0 (double)

  // 4. String — immutable UTF-16 sequence.
  String city = 'Bengaluru';
  String greeting = "It's lovely here";        // double quotes when content has '.
  String multiline = '''
    Karnataka has 31 districts
    and several official languages.
  ''';
  print('\$greeting in \$city');
  print(multiline.trim());

  // 5. bool — true or false. No truthiness.
  bool isOpen = true;
  if (isOpen) print('Shop open');
  // if (seats) print('truthy?');  // compile error: int is not bool.

  // 6. Conversions and parsing.
  int n = int.parse('42');
  int? safe = int.tryParse('xyz');             // null on failure.
  String back = n.toString();
  print('parsed: \$n, safe: \$safe, back: \$back');

  // 7. Floating-point gotcha.
  print('0.1 + 0.2 = \${0.1 + 0.2}');           // 0.30000000000000004
}`,
              pitfalls: [
                '**Storing money in `double`.** `0.1 + 0.2 != 0.3`. Use `int` (paise as integer) or the `decimal` pub package.',
                '**Storing phone numbers in `int`.** Leading zeros vanish, plus signs disappear, country codes break. Always use `String` for any identifier you cannot do arithmetic on.',
                '**Concatenating Strings in a loop.** `result += chunk;` is O(n²). Use `StringBuffer` and call `.toString()` once at the end.',
                '**Treating int as bool.** `if (count)` is a compile error in Dart (unlike JS/Python). Write `if (count > 0)` explicitly. This is a feature, not a bug.',
                '**Calling `int.parse` on possibly-invalid input.** It throws `FormatException`. Use `int.tryParse` for user input and check for `null`.',
                '**Forgetting `String` is UTF-16.** `"😀".length` returns `2` (surrogate pair), not `1`. Use the `characters` package for grapheme clusters in user-facing text.',
                '**Misusing `dynamic` to silence type errors.** `dynamic` postpones errors to runtime. Fix the type instead, or use `Object?` if you genuinely accept anything.',
                '**Using `==` to compare doubles.** `1.0 == 1.0000000000001` is `false` and easy to mistake. For float comparison, check `(a - b).abs() < epsilon`.',
              ],
              tryIt: `Write a function \`String describe(num x)\` that returns \`"<x> is a whole number"\` if \`x is int\`, otherwise \`"<x> is a decimal"\`. Test with \`describe(7)\`, \`describe(7.0)\`, and \`describe(7.5)\`. Pay attention to the second one — \`7.0\` is a \`double\`, not an \`int\`, even though its value looks integer. **Now extend it** by adding a parameter \`bool roundDecimals = true\`; when true, decimals get rounded to one place via \`x.toStringAsFixed(1)\`. The exercise drills the \`is\` operator, \`num\` as a parameter type, and string formatting.`,
              takeaway: 'Pick the narrowest type that fits. num is the escape hatch, not the default.',
            },
            {
              id: 'm0-t7',
              title: 'Sound Null Safety — ?, !, late, ??',
              explain: 'Every type is non-nullable by default. Add ? to allow null and the compiler tracks it for you.',
              analogy: 'Imagine the **Coorg coffee plantations near Madikeri**. Every coffee plant has a small wooden tag tied to its trunk — never blank, always reading either `bearing` (carries this season crop) or `fallow` (resting). The estate adopted this rule after a botched 1992 harvest where unmarked plants were either picked dry or skipped entirely. In Dart, **every type is like that tagged plant**: either it holds a real value or you must explicitly mark it with `?` to mean the slot might hold null. The compiler refuses to let you read from a `?` type until you have proven the value is present. The exclamation mark `!` is the worker who rips off the tag and shouts trust me, this one is bearing — sometimes right, sometimes a 2 AM runtime crash.',
              theory: `**Sound null safety** is Dart most important post-2.12 feature. Every type is **non-nullable by default**: \`String name\` is a String that can never be null. To allow null, you append \`?\` — \`String? name\` is either a String or null, and the compiler tracks the difference at every read site.\n\nThe **\`?\` suffix** turns any type into a nullable variant: \`int?\`, \`List<String>?\`, \`MyClass?\`. To use a value typed \`String?\`, you must first prove it is not null — via \`if (x != null)\`, the \`?.\` null-aware access (\`name?.length\`), or the \`??\` default operator (\`name ?? "unknown"\`).\n\nThe **\`!\` operator** asserts non-null: \`name!\` casts a \`String?\` to a \`String\` at the cost of a runtime crash if you were wrong. Use \`!\` only when you have a proof the compiler cannot follow — for example after a manual null check the analyzer cannot understand.\n\n**\`late\`** is a different beast. \`late String greeting;\` declares a non-nullable variable that you promise to assign before reading. The compiler stops complaining about the missing initializer; the runtime crashes if you read before assignment. Use \`late\` for fields initialized in \`initState()\` (Flutter) or in constructors that compute the value lazily.\n\nThe **\`??\`** (null-coalescing) and **\`??=\`** (null-coalescing assign) operators give you defaults. \`final city = userCity ?? "Bengaluru";\` returns \`userCity\` if non-null, else \`"Bengaluru"\`. The chained form \`a ?? b ?? c\` returns the first non-null value.`,
              whyItMatters: 'Sound null safety eliminates **the single largest class of crashes in mobile app history** — the NullPointerException family. Java and Kotlin shipped half-measures (annotations, platform types). Dart 3 made null safety **sound**, meaning the compiler promise is mathematically guaranteed: a non-nullable type is never null at runtime, period. In interviews, the question how does Dart prevent null crashes is your chance to explain `?`, `!`, `late`, and `??` cleanly — the candidate who answers without hand-waving stands out from one who mumbles about exceptions.',
              steps: [
                'Create `nulls.dart`. Declare `String name = "Anjali";` and try to assign `null` to it — observe the compile error.',
                'Change to `String? maybeName;` — now null is allowed and the variable defaults to null.',
                'Try `print(maybeName.length);` — compile error: the property length cannot be unconditionally accessed.',
                'Use `print(maybeName?.length);` — null-aware: prints `null` if maybeName is null, no crash.',
                'Use `print(maybeName ?? "no name");` — default value when null.',
                'Add `late String greeting;` and read it before assigning — observe the runtime LateInitializationError.',
                'Then assign `greeting = "Namaskara";` before the read and confirm it runs cleanly.',
                'Use `int.tryParse(input)` (returns `int?`) and chain with `?? 0` to get a safe default.',
              ],
              code: `// nulls.dart
// Run with: dart run nulls.dart

void main() {
  // 1. Non-nullable by default.
  String city = 'Bengaluru';
  // city = null;     // compile error: null can not be assigned to 'String'.

  // 2. Opt-in nullability with ?.
  String? maybeName;            // allowed; defaults to null.
  print('maybe: \$maybeName');   // -> null

  // 3. Null-aware property access.
  print('length? \${maybeName?.length}');  // -> null (no crash)

  // 4. Default with ??.
  final display = maybeName ?? 'unknown';
  print('display: \$display');              // -> unknown

  // 5. Assignment-with-default.
  maybeName ??= 'Anjali';                   // assign only if null.
  print('after ??=: \$maybeName');          // -> Anjali

  // 6. Bang operator — assert non-null.
  String? input = readMaybe();
  if (input != null) {
    print('shout: \${input.toUpperCase()}'); // safe; flow analysis.
  }
  // Risky form — runtime crash if input is null:
  // print(input!.toUpperCase());

  // 7. late — declare now, assign later.
  late String greeting;
  greeting = 'Namaskara';
  print(greeting);

  // 8. Null-coalescing chain.
  String? a, b;
  String c = 'fallback';
  print(a ?? b ?? c);                       // -> fallback
}

String? readMaybe() =>
    DateTime.now().millisecond.isEven ? 'hello' : null;`,
              pitfalls: [
                '**Reaching for `!` to silence the compiler.** The compiler is right 99% of the time — fix the type, do not bang the variable. Treat `!` as a code smell unless you have a real proof.',
                '**Reading a `late` variable before assignment.** Crashes with `LateInitializationError`. Use a `?` field with a null check if assignment timing is uncertain.',
                '**Confusing `?.` with `?`.** `String?` is a type; `?.` is null-aware access. `name?.length` returns `int?`, not `int` — propagate or default with `??`.',
                '**Forgetting flow analysis stops at function boundaries.** Inside an `if (x != null)` block x is promoted; pass x to a helper and the helper sees `String?` again. Copy to a local final once.',
                '**Using `??` on a non-nullable.** `int x = 5; final y = x ?? 0;` is a warning — x is non-nullable so the default is unreachable.',
                '**`late final` for an async-computed value.** `late final String name = await fetch();` is illegal. Use `Future<String>` or assign in an async init method.',
                '**Promoting a public field.** `if (widget.title != null) widget.title.length` does NOT promote, because the field could change between reads. Copy to a local first.',
                '**Believing `dynamic` is null-safe.** `dynamic x;` is null and the compiler does not warn. Use `Object?` for genuinely-unknown types.',
              ],
              tryIt: `Write a function \`String greet(String? name) => "Namaskara, \${name ?? "friend"}";\`. Test with \`greet(null)\` and \`greet("Pradeep")\`. **Now extend it** by adding a \`late int counter;\` at the top of \`main\`, assign it inside an \`if\` block based on user input via \`stdin.readLineSync()\`, and read it after the if. Observe what happens when the if branch does not run — the late variable was never assigned. The exercise burns the difference between \`?\` (compiler-checked) and \`late\` (you-promise-the-runtime) into your fingers.`,
              takeaway: 'A non-nullable type is a promise the compiler enforces. ! breaks the promise at your peril.',
            },
            {
              id: 'm0-t8',
              title: 'String Interpolation and Multi-line Strings',
              explain: 'Use $name and ${expr} inside strings. Triple quotes for multi-line literals.',
              analogy: 'Picture the **KSRTC bus depot in Mysuru** at 5 AM. Forty buses lined up, each with a flip-board destination sign at the front: Bengaluru via Mandya, Madikeri via Hunsur, Mangaluru via Sampaje. The signs are not painted fresh each route — they are slotted boards with route names slid into preset gaps. **String interpolation in Dart works exactly the same way**: you write a template once with placeholder slots and the runtime drops the live values in. Concatenation with `+` is the older painted-sign approach where you smear together fragments by hand. Interpolation is the slot-board approach — faster to read, cleaner to write, and the compiler catches typos in the slot names. After two days of Dart you will physically wince at any `+` you see between two strings.',
              theory: `Dart string literals come in three flavours: single-quoted (\`'abc'\`), double-quoted (\`"abc"\`), and triple-quoted (three single quotes or three double quotes). The triple-quoted form preserves newlines and indentation literally, so you can paste an HTML chunk or a SQL query without escape gymnastics.\n\n**Interpolation** is the headline feature. Inside any string literal, \`\$name\` substitutes the value of an in-scope variable, and \`\${expression}\` substitutes the value of any Dart expression. Use the bare \`\$name\` form for plain identifiers and the brace form whenever you need a property access, a method call, or anything more complex than a single variable.\n\nBehind the scenes, interpolation calls \`.toString()\` on the embedded value. For your own classes, override \`toString()\` to control how instances appear in interpolated strings — \`\${user}\` will look readable in your logs.\n\nFor **performance-sensitive concatenation in a loop** (building a CSV row, assembling a 10 MB JSON dump), use \`StringBuffer\`. The \`+=\` operator allocates a fresh String every iteration (O(n²) total), while \`StringBuffer.write\` appends to an internal byte buffer (O(n) amortized).\n\n**Raw strings** (prefix \`r\`) skip all escapes and interpolation: \`r'C:\\\\path\\\\\$var'\` is literally that text. Use raw strings for regex patterns and Windows paths.\n\n**Adjacent string literals** are concatenated automatically at compile time: \`'first ' 'second'\` is a single String. Useful for breaking long messages across source lines without \`+\`.`,
              whyItMatters: 'Every log line, every error message, every UI label, every CSV export, every JSON-by-hand contains a string you assembled. Picking interpolation over concatenation is the difference between code that reads like a sentence and code that reads like an algebra problem. In interviews, when asked why is `+` slow in a loop, the answer **immutability — every `+=` allocates a fresh String** is a senior-level signal. Master interpolation in week one and reviewers will mark you down to zero on string-related comments forever.',
              steps: [
                'Create `strings.dart`. Declare `final name = "Anjali";` and print `"Namaskara, $name"` (yes, the dollar sign is intentional).',
                'Add `print("Length: ${name.length}");` to demonstrate the brace form for expressions.',
                'Use a triple-quoted string (three single quotes) for a 5-line greeting that preserves newlines, and print it.',
                'Build a 1000-row CSV with `StringBuffer` and a second copy with `+=`; time both with `Stopwatch`.',
                'Use a raw string (prefix `r` before the opening quote) for a Windows path and confirm the dollar sign is literal text.',
                'Concatenate adjacent literals: `final big = "part 1 " "part 2";` and print — no plus operator needed.',
                'Define a `User` class with `final String name;` and override `toString()`; interpolate the instance.',
                'Convert a number to a fixed-decimal String with `(3.14159).toStringAsFixed(2)` and interpolate it.',
              ],
              code: `// strings.dart
// Run with: dart run strings.dart

void main() {
  final name = 'Anjali';
  final age = 27;
  final city = 'Bengaluru';

  // 1. Single-variable interpolation.
  print('Namaskara, \$name from \$city');

  // 2. Expression interpolation.
  print('In \${DateTime.now().year}, \$name is \$age years old.');
  print('Name length: \${name.length}');

  // 3. Single vs double quotes — pick whichever avoids escaping.
  print("It is a sunny morning.");
  print('She said "namaskara"');

  // 4. Triple quotes preserve newlines and indentation.
  final greeting = '''
Namaskara, \$name!
Welcome to \$city.
''';
  print(greeting);

  // 5. Raw strings — no escapes, no interpolation.
  print(r'Path: C:\\Users\\anjali\\\$var');

  // 6. Adjacent literal concatenation (compile-time merge).
  final big = 'one ' 'two ' 'three';
  print(big);

  // 7. StringBuffer for hot loops.
  final buf = StringBuffer();
  for (var i = 0; i < 5; i++) {
    buf.writeln('row \$i');
  }
  print(buf.toString());

  // 8. Custom toString on your class.
  final u = User('Pradeep', 32);
  print('User: \$u');
}

class User {
  final String name;
  final int age;
  User(this.name, this.age);

  @override
  String toString() => 'User(name=\$name, age=\$age)';
}`,
              pitfalls: [
                '**Concatenating in a loop with `+=`.** Every iteration allocates a fresh String — O(n²). Use `StringBuffer` and call `.toString()` once at the end.',
                '**Forgetting `${}` around expressions.** `print("$user.name")` prints the User object followed by `.name` literally, not the name field. Use the brace form for any access.',
                '**Confusing interpolation with concatenation.** `print(name age)` is two arguments to print, which fails. Interpolate with `"$name $age"` instead.',
                '**Trying to interpolate inside a raw string.** `r"$var"` is the literal text $var — that is the whole point of `r`. Use a normal string when you want interpolation.',
                '**Forgetting to override `toString()`.** Without an override, your class prints as `Instance of User`. Override it on every domain class for usable logs.',
                '**Mis-indented triple-quoted strings.** Leading whitespace on each line is part of the value. Use `.trimLeft()` or place the closing quotes carefully.',
                '**Unicode length surprises.** A grinning-face emoji has `.length == 2` because UTF-16 surrogate pairs. Use the `characters` package for grapheme-aware text.',
                '**500-character interpolated logs.** Unreadable in a tail. Break into multiple `print` calls or use `dart:developer` `log()` with structured fields.',
              ],
              tryIt: `Write a function \`String describe(String name, int age, String city)\` that returns the sentence \`"Anjali, 27, lives in Bengaluru."\` using interpolation. Test with three different inputs. **Now extend it** by defining \`class Person { final String name; final int age; final String city; Person(this.name, this.age, this.city); @override String toString() => describe(name, age, city); }\` and print \`Person('Pradeep', 32, 'Mysuru')\` directly with \`print(person)\`. The exercise drills both interpolation and the \`toString()\` override pattern that every Dart class deserves.`,
              takeaway: 'String concatenation is a code smell in Dart. Interpolate.',
            },
            {
              id: 'm0-t9',
              title: 'Type Inference vs Explicit Types',
              explain: 'Dart can infer most types but explicit types make APIs and intent clearer.',
              analogy: 'Picture two ways to settle an auto-rickshaw fare in Bangalore. Inside the city the **electronic meter** reads distance from GPS and computes the fare automatically — the driver does not need to write anything on a chit. For an outstation journey to Hosur or Nandi Hills, however, the driver hands you a **printed price card** at the start: ₹650 to Hosur, ₹900 to Nandi Hills, agreed before the wheels move. Dart type inference is the meter — short, internal, the engine reads the right-hand side and figures out the type. Explicit types are the printed card — public, contract-shaped, agreed up front so nobody is surprised. Mix them well: meter for inside-the-function locals, printed card for every public API your teammates will read.',
              theory: `Dart has **strong static type inference**. When you write \`var x = 5;\`, the analyzer sees the integer literal and infers the type as \`int\`. The inferred type is **locked at declaration** — \`x = "five";\` later is a compile-time error. Inference saves typing without giving up safety.\n\n**\`final\` and \`const\` also infer**: \`final names = ['a', 'b'];\` becomes \`final List<String> names\`. The keyword controls mutability; the type still comes from the right-hand side. With no right-hand side (\`String name;\`), you must declare the type explicitly because there is nothing to infer from.\n\nThe **idiomatic split** is captured by two well-known lints: \`omit_local_variable_types\` recommends \`var\` for locals (the IDE shows the inferred type on hover anyway), and \`always_declare_return_types\` plus \`type_annotate_public_apis\` insist on explicit annotations for function signatures and public fields. Reader-facing surface gets the printed card; private internals get the meter.\n\n**Empty collection literals** are inference traps. \`var xs = [];\` infers \`List<dynamic>\`, which silently disables type checking on every later use. Either annotate (\`List<int> xs = [];\`) or use a typed empty literal (\`var xs = <int>[];\`). Same trap for \`{}\` — is it an empty Set or an empty Map? Annotate or write \`<int>{}\` / \`<String, int>{}\`.\n\n**Generic inference flows through chains**: \`List.filled(3, 0)\` returns \`List<int>\` because the second argument is \`int\`. \`map((x) => x.length)\` infers the element type from the closure return. When inference fails, the analyzer prints a clear message asking for a type argument.`,
              whyItMatters: 'Choosing where to infer and where to annotate is a daily judgement call. Pick wrong and your codebase ends up either noisy (`int x = 5;` everywhere) or opaque (a 200-line file where every signature reads `dynamic`). In code review, the seniors are the ones who reach for explicit types on every public boundary and skip them inside short functions. In interviews, the question why does Dart prefer `var` for locals invites you to talk about IDE tooling and lints — a clean answer signals you have read effective_dart, not just the language tour.',
              steps: [
                'Create `infer.dart`. Declare `var n = 5;` and try to assign `n = "five";` — observe the compile error. The inferred type is locked.',
                'Hover over `n` in VS Code; the tooltip shows the inferred type `int`.',
                'Declare `final names = ["a", "b"];` and hover — inferred as `List<String>`.',
                'Declare `var xs = [];` and notice the inferred type `List<dynamic>` — usually wrong. Fix with `var xs = <int>[];`.',
                'Declare `Map<String, int> ages = {};` explicitly when the empty literal cannot infer key/value types.',
                'Write a public function `double average(List<num> values)` with explicit signature — readers see the contract instantly.',
                'Inside that function, write `var sum = values.fold(0.0, (a, b) => a + b);` — local inference is fine here.',
                'Run `dart analyze` and read the messages from `omit_local_variable_types` and `always_declare_return_types`.',
              ],
              code: `// infer.dart
// Run with: dart run infer.dart

// PUBLIC API: signature is fully annotated.
double average(List<num> values) {
  if (values.isEmpty) return 0;
  // LOCAL: var is fine — readers can hover for the type.
  var sum = values.fold<double>(0, (a, b) => a + b);
  return sum / values.length;
}

void main() {
  // 1. Inference from a literal.
  var n = 5;            // int
  var name = 'Anjali';  // String
  final pi = 3.14159;   // double

  print('n=\$n name=\$name pi=\$pi');

  // 2. Inferred type is locked.
  // n = 'five';   // compile error: a value of type 'String' can not be assigned to 'int'.

  // 3. Empty literal trap.
  var loose = [];           // List<dynamic> — bad.
  var tight = <int>[];      // List<int>     — good.
  loose.add('not an int');  // compiles. tight.add('x') would not.
  print('loose=\$loose tight=\$tight');

  // 4. Map literals need explicit types when empty.
  Map<String, int> ages = {};
  ages['Anjali'] = 27;
  ages['Pradeep'] = 32;
  print(ages);

  // 5. Generic inference through chains.
  final nums = [1, 2, 3, 4];
  final lengths = nums.map((x) => x.toString().length).toList();
  // lengths inferred as List<int>.
  print(lengths);

  // 6. Public API in action.
  print('avg = \${average([10, 20, 30])}');
}`,
              pitfalls: [
                '**Empty `[]` or `{}` without a type argument.** Inferred as `List<dynamic>` or a Map you did not want. Write `<int>[]` or annotate the variable.',
                '**Annotating obvious locals.** `int x = 5;` is noise the lint `omit_local_variable_types` catches. Use `var x = 5;`.',
                '**Skipping return type on public functions.** `parse(String s) { ... }` infers `dynamic` and every caller loses type checks. Always declare the return type on public APIs.',
                '**Trusting `dynamic` to be safe.** `dynamic` opts out of static analysis entirely. Use `Object?` if you genuinely accept anything; reach for `dynamic` only at FFI or platform-channel boundaries.',
                '**Forgetting that inference reads the RHS literally.** `var x = jsonDecode(s);` is `dynamic` because `jsonDecode` returns `dynamic`. Cast to the type you expect: `var x = jsonDecode(s) as Map<String, dynamic>;`.',
                '**Inferring `int` when you needed `double`.** `var sum = 0;` is `int`; later `sum + 1.5` is a `double` and the compiler errors. Initialize as `0.0` if you want `double`.',
                '**Confusing `final` with type inference.** `final` controls mutability, not type. `final List<int> xs = ...` is still allowed and sometimes clearer.',
                '**Auto-format hiding type.** Some editors fold the inferred type display. Toggle inlay hints in VS Code to keep types visible while learning.',
              ],
              tryIt: `Write a public function \`Map<String, double> averagesByCity(Map<String, List<num>> readings)\` that returns the average for each city. Inside the function, use \`var\` for the loop variables and \`StringBuffer\` for any logging. **Now extend it** by adding a private helper with no annotations at all — let inference do everything — then run \`dart analyze\`. Read every lint message and decide, lint by lint, whether to fix the code or update analysis_options.yaml. The exercise teaches the difference between can-infer and should-infer.`,
              takeaway: 'Infer locals, declare APIs. Public surface deserves explicit types.',
            },
          ],
        },
        {
          id: 'm0-s3',
          title: 'Control Flow and Collections',
          topics: [
            {
              id: 'm0-t10',
              title: 'if, else, switch — Branching with Pattern Matching',
              explain: 'Dart 3 upgrades switch into a real pattern-matching expression you can return from.',
              analogy: 'Picture the **ticket counter at Lalbagh Botanical Garden** during the August flower show. The cashier looks at four things on every visitor: their age, whether they hold a student ID, whether they have an annual pass, and whether today is the free Lalbagh-Sunday. From those four facts, the right ticket appears in seconds — ₹50 adult, ₹20 child, ₹15 student, free for pass-holders. The cashier is doing **pattern matching**: a small set of conditions checked in order, first match wins, the answer comes back instantly. Dart 3 turned the humble `switch` into exactly this kind of cashier. You feed in a value (a single number, or a record of fields, or a sealed class instance) and write one branch per pattern. The compiler also checks that every case is covered, so the senior-citizen rate never gets quietly forgotten.',
              theory: `Dart has the everyday \`if\`/\`else\` chains plus a far more capable \`switch\`. **Dart 3 promoted \`switch\` from a control-flow statement into a real pattern-matching expression**, so you can return a value directly from each branch.\n\n**\`if\`/\`else\`** are familiar — the same shape as C, Java, JavaScript. Dart adds two niceties: no implicit truthiness (the condition must be a \`bool\`, never an \`int\` or a String), and the analyzer flow-promotes types inside the branch (after \`if (x is String)\`, \`x\` is treated as \`String\` for the rest of the block).\n\n**\`switch\` as an expression** (Dart 3): the body is a series of \`case\` arms separated by commas. Each arm has the shape \`pattern => value\`. Use it on the right of \`=\`, in a \`return\`, or as a function argument.\n\n**Patterns** are the magic. Beyond literal matches (\`case 0\`), you can match types (\`case int n\`), tuples and records (\`case (final x, final y)\`), object shapes with destructuring (\`case Point(:final x)\`), constants (\`case Point.origin\`), and sealed-class hierarchies. Use \`when\` clauses to refine a pattern (\`case int n when n > 0\`).\n\n**Exhaustiveness checking** is the killer feature. When you switch on a \`sealed\` class or an enum and forget a case, the compiler errors. This catches missing branches at refactor time — add a new variant and the whole codebase lights up red until every switch handles it.\n\n**Avoid \`default\`** when you have a sealed type: \`default\` swallows missing cases and silences the exhaustiveness warning. Enumerate every variant explicitly so the compiler keeps you honest.`,
              whyItMatters: 'Dart 3 patterns are the biggest language change since null safety. They collapse dozens of nested `if` chains into single expressive `switch` blocks, eliminate forgotten-case bugs, and make state machines (loading / loaded / error) trivially safe. In interviews, when asked walk me through Dart 3 features, **records and patterns** is the headline answer. In production Flutter, switch-on-state is how every senior writes BLoC and Riverpod state today — once you have it in your fingers, you will never go back to chained `if` checks.',
              steps: [
                'Create `branch.dart`. Write a function `String fare(int age)` using a classic if/else if/else chain.',
                'Refactor to a switch expression: `String fare(int age) => switch (age) { < 12 => "child", >= 60 => "senior", _ => "adult" };`.',
                'Add a `when` clause: `case int n when n > 100 => "VIP"` to refine on a runtime condition.',
                'Define `sealed class Shape` with `Circle(r)` and `Square(side)` subclasses inside the same file.',
                'Switch on a `Shape` value with `case Circle(:final r)` destructuring — read `r` directly without a cast.',
                'Comment out one case from the sealed switch and observe the exhaustiveness error from the compiler.',
                'Use a record literal `(int, String) row = (1, "Anjali");` and switch with `case (final id, final name)`.',
                'Define `enum Status { idle, loading, ready, error }` and switch with every case explicit and no `default`.',
              ],
              code: `// branch.dart
// Run with: dart run branch.dart

void main() {
  // 1. if/else — classic shape.
  var age = 27;
  if (age < 12) {
    print('child');
  } else if (age >= 60) {
    print('senior');
  } else {
    print('adult');
  }

  // 2. switch expression — same logic in one expression.
  String fare(int age) => switch (age) {
        < 12 => 'child',
        >= 60 => 'senior',
        _ => 'adult',
      };
  print(fare(age));

  // 3. when clause — refine a pattern with a runtime check.
  String tier(int n) => switch (n) {
        int x when x > 100 => 'VIP',
        > 50 => 'gold',
        > 0 => 'silver',
        _ => 'free',
      };
  print(tier(150));

  // 4. Records and destructuring.
  (int, String) row = (1, 'Anjali');
  final greeting = switch (row) {
    (final id, final name) => 'id=\$id name=\$name',
  };
  print(greeting);

  // 5. Sealed class + exhaustiveness.
  Shape s = Circle(5);
  final area = switch (s) {
    Circle(:final r) => 3.14 * r * r,
    Square(:final side) => side * side,
  };
  print('area=\$area');

  // 6. Enum + no default — adding a new value forces every switch to update.
  Status status = Status.loading;
  final label = switch (status) {
    Status.idle => 'idle',
    Status.loading => 'loading',
    Status.ready => 'ready',
    Status.error => 'oh no',
  };
  print(label);
}

sealed class Shape {}
class Circle extends Shape {
  final double r;
  Circle(this.r);
}
class Square extends Shape {
  final double side;
  Square(this.side);
}

enum Status { idle, loading, ready, error }`,
              pitfalls: [
                '**Using `default` on a sealed type.** It silences the exhaustiveness check, defeating the safety guarantee. Enumerate every case so the compiler points at this switch when the sealed family grows.',
                '**Confusing switch _statement_ with switch _expression_.** The statement uses `:` and may need `break`; the expression uses `=>` and returns a value. Pick the expression form whenever each branch is a single value.',
                '**Deep nested `if`/`else if` chains over four conditions.** Refactor to a switch on a record `(a, b, c)` — reads like a truth table and the compiler can spot dead branches.',
                '**Writing `if (x)` where x is an `int`.** Dart rejects this with a compile error — there is no implicit truthiness. Write `if (x > 0)` explicitly. This is a feature, not friction.',
                '**Forgetting destructuring requires public final fields.** `Circle(:final r)` works because `r` is a public final field. Private fields and getters with side effects misbehave; keep value classes simple.',
                '**Mutating inside a switch expression arm.** Each arm must be an expression. If you need side effects beyond a single expression, use a switch statement.',
                '**Mismatched record arity.** `case (final a, final b, final c)` does not match a `(int, String)` record — the compiler tells you, but read the message carefully.',
                '**Forgetting `when` ordering matters.** The first matching arm wins, top-down. Put the most specific cases first (`when` clauses) before broader catch-alls.',
              ],
              tryIt: `Define \`enum AccountState { active, frozen, closed }\` and write a function \`String describe(AccountState s)\` using a switch expression with no \`default\`. **Now extend it** by adding a fourth value \`pendingApproval\` and observe how the compiler points at every switch in your file that needs the new branch. Then add a \`when\` clause that distinguishes active accounts with positive balance from active accounts with zero balance. The exercise drills both exhaustiveness and pattern refinement.`,
              takeaway: 'If you are returning a value from each branch, use switch as an expression — not a statement.',
            },
            {
              id: 'm0-t11',
              title: 'for, for-in, while — Loops in Dart',
              explain: 'Dart has classic for loops, for-in for iterables, and while for everything else.',
              analogy: 'Imagine **Suma in her Kundapura kitchen** grinding masala on the stone slab (the **ammi kallu**) before the family lunch rush. She does four very different kinds of repetition without thinking: for each ingredient she has on the counter — cumin, coriander, dried chillies — she grinds it through the stone (that is **for-in**, one cycle per item in the basket). She counts out exactly thirty deliberate strokes per ingredient (that is the classic **for loop with an index**). She keeps grinding **while** the paste still feels coarse against her fingertip (that is **while**, exit when condition fails). And she always grinds at least one full pass even if the paste looked done before she started, because cold pastes lie (that is **do-while**, body runs at least once). Dart gives you exactly these four shapes. Pick the one that matches what you are actually counting.',
              theory: `Dart has the standard four loop shapes plus a couple of niceties.\n\n**Classic indexed \`for\`** — \`for (var i = 0; i < n; i++) { ... }\` — same as C and Java. Use it when you genuinely need the index, for example when you write back into an indexed structure or when stride length is not 1.\n\n**\`for-in\`** — \`for (final x in iterable) { ... }\` — the idiomatic shape for the 95% case where you just want to visit each element. Works on any \`Iterable<T>\`: \`List\`, \`Set\`, \`Map.entries\`, \`Map.keys\`, \`Map.values\`, generators, even \`Stream\` via \`await for\`.\n\n**\`while\`** — \`while (cond) { ... }\` — pre-test loop. Use when the iteration count is not known up front: reading a stream, polling a status, draining a queue.\n\n**\`do\`/\`while\`** — runs the body **at least once** before checking the condition. Use sparingly; a clear \`while (true) { ...; if (done) break; }\` often reads better.\n\n**\`break\`** exits the nearest enclosing loop. **\`continue\`** skips to the next iteration. **Labels** (\`outer: for (...)\`) let you escape nested loops with \`break outer;\`.\n\n**Async note**: \`for (final x in list) { await fetch(x); }\` awaits sequentially, one fetch at a time. \`list.forEach((x) async { await fetch(x); })\` fires every fetch in parallel and **does not wait** — \`forEach\` ignores the returned Future. Use \`for-in\` for sequenced awaits and \`Future.wait(list.map(fetch))\` for parallel.\n\n**Collection-for** — \`[for (var i = 0; i < 5; i++) i * 2]\` builds the list inline without a temp variable. Combines beautifully with \`if\` and spread (covered in the next topic).`,
              whyItMatters: 'Loops are 30% of every program you will write. Picking the wrong shape is rarely a bug, but it is a constant readability tax. The biggest trap is the async one — `forEach` with `async` is the classic Flutter bug that ships sequential code that runs in parallel and then crashes when the database hits a uniqueness constraint. Knowing **`for-in` for sequenced awaits** is the difference between reliable code and a 3 AM Sentry alert. In interviews, the question why is `list.forEach(asyncFn)` broken is a Dart-specific gotcha — answering it cleanly signals real production experience.',
              steps: [
                'Create `loops.dart`. Write a classic indexed for loop that prints 1 through 5.',
                'Convert it to a for-in loop over `[1, 2, 3, 4, 5]` and observe the cleaner shape.',
                'Iterate a Map: `for (final e in {"a": 1, "b": 2}.entries) print("${e.key}=${e.value}");`.',
                'Write a while loop that counts down from 10 by steps of 3 and prints each value.',
                'Use a do-while loop that prompts for input via `stdin.readLineSync()` until the user types `quit`.',
                'Add a labeled `outer:` to a nested loop and use `break outer;` to escape both loops.',
                'Replace a `.forEach((x) async { ... })` with `for (final x in list) { await ... }` and confirm the timing changes from parallel to sequential.',
                'Build a list with collection-for: `final doubled = [for (var i = 0; i < 5; i++) i * 2];` and print it.',
              ],
              code: `// loops.dart
// Run with: dart run loops.dart

void main() async {
  // 1. Classic indexed for loop.
  for (var i = 1; i <= 5; i++) {
    print('classic \$i');
  }

  // 2. for-in over an Iterable.
  final districts = ['Bengaluru', 'Mysuru', 'Mangaluru'];
  for (final d in districts) {
    print('district \$d');
  }

  // 3. Map iteration via .entries.
  final ages = {'Anjali': 27, 'Pradeep': 32};
  for (final e in ages.entries) {
    print('\${e.key} = \${e.value}');
  }

  // 4. while — pre-test loop, count unknown up front.
  var n = 10;
  while (n > 0) {
    print('countdown \$n');
    n -= 3;
  }

  // 5. do-while — body always runs at least once.
  var phase = '';
  do {
    phase = (phase.isEmpty) ? 'first' : 'done';
    print('phase=\$phase');
  } while (phase != 'done');

  // 6. break and continue with a label.
  outer:
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 3; j++) {
      if (j == 2) continue;       // skip when j is 2
      if (i == 2) break outer;    // exit BOTH loops
      print('i=\$i j=\$j');
    }
  }

  // 7. Sequenced await with for-in. forEach would lose ordering.
  final urls = ['https://a', 'https://b'];
  for (final u in urls) {
    final body = await fakeFetch(u);
    print('got \${body.length} chars from \$u');
  }

  // 8. Collection-for inside a literal.
  final doubled = [for (var i = 0; i < 5; i++) i * 2];
  print(doubled);
}

Future<String> fakeFetch(String url) async {
  await Future.delayed(const Duration(milliseconds: 5));
  return 'body of \$url';
}`,
              pitfalls: [
                '**Using `.forEach((x) async { await ... })`.** Async closures fire in parallel and `forEach` does not await them. Use `for (final x in list) { await ... }` for sequenced async, or `Future.wait(list.map(fetch))` for parallel.',
                '**Mutating a List while iterating with for-in.** Throws `ConcurrentModificationError`. Build a fresh list, or iterate `list.toList()` (a snapshot) when you need to remove items.',
                '**Off-by-one in classic for loops.** `for (var i = 0; i <= length; i++)` is one iteration too many. Use `<` for `0..n-1`, `<=` only when the upper bound is inclusive.',
                '**Iterating a Map directly.** `for (final k in map)` does NOT compile — Maps are not directly iterable. Use `.entries`, `.keys`, or `.values`.',
                '**Labeled break confusion.** `break outer;` breaks the loop labeled `outer:`. Without a label, `break` exits only the innermost loop.',
                '**`continue` in switch statements.** Inside a Dart 2 switch statement `continue label;` jumps to a labeled case — it does NOT continue an enclosing loop. Different beast entirely.',
                '**Postfix `i++` inside an expression.** `array[i++]` reads at the old index then increments — clever but easy to misread. Increment on its own line for readability.',
                '**Unbounded while.** `while (true)` without a clearly visible `break` is an infinite loop. Always make the exit condition obvious in the loop body.',
              ],
              tryIt: `Write a function \`int sumOfDigits(int n)\` that uses a \`while\` loop to add up the digits of n by repeatedly mod-10 and divide-by-10 until n becomes 0 — for instance \`sumOfDigits(123) == 6\`. Test with three values including \`0\`. **Now extend it** by writing a second version that converts n to a String, iterates each character with \`for-in\`, parses each back to an int, and accumulates. Time both versions on a 6-digit input with \`Stopwatch\`. The exercise reinforces while as the natural fit for unknown-iteration-count problems and for-in as the readable default.`,
              takeaway: 'Default to for-in. Drop to indexed for when you actually need the index.',
            },
            {
              id: 'm0-t12',
              title: 'List, Set, Map — When to Use Which',
              explain: 'Lists are ordered, Sets are unique, Maps are key-value. Pick by access pattern.',
              analogy: 'Picture **Karthik running a book stall at the Bengaluru book fair at Palace Grounds**. By 11 AM the rush is on and he keeps three different notebooks within arm reach. The first is the **sales register**, where every sale lands in chronological order with the time stamped — the same novel might be sold three times before lunch and each entry is a fresh row. That is a **List**: ordered, indexable, duplicates fine. The second is the **stock checklist** of unique titles he is currently carrying — he does not care which order they go in, only whether `Malgudi Days` is in stock when a customer asks. That is a **Set**: each value once, fast lookup. The third is the **customer ledger** — name to outstanding balance — where Karthik flips to `Anjali` and reads ₹450 in one second flat. That is a **Map**: key to value, fast lookup by key. Reach for the wrong notebook and you are scanning rows when you could have been jumping straight to the answer.',
              theory: `Dart ships three core collection types in \`dart:core\`, all generic over \`T\`.\n\n**\`List<T>\`** is ordered, indexable, and **allows duplicates**. \`[1, 2, 3]\` is the literal. \`list[0]\` is O(1); \`list.contains(x)\` is O(n) (linear scan); insert and remove at the middle are O(n). Use a List when **order matters** or you index by position.\n\n**\`Set<T>\`** holds **unique values** with fast membership. \`{1, 2, 3}\` is the literal — but be careful, **empty \`{}\` is a Map, not a Set** (more on that in a moment). \`set.add\`, \`set.contains\`, \`set.remove\` are O(1) amortized. Use a Set when you only ever ask is x in here.\n\n**\`Map<K, V>\`** is key-to-value with fast lookup. \`{'a': 1, 'b': 2}\` is the literal. \`map[key]\` returns \`V?\` (null if absent). Lookups, inserts, and removals are O(1) amortized. Use a Map when you index by something other than position.\n\nThe **empty-literal trap** matters: \`var s = {};\` is \`Map<dynamic, dynamic>\`. To get an empty Set write \`var s = <int>{};\` or \`Set<int>()\`. To get an empty Map of a specific type write \`Map<String, int>()\` or \`<String, int>{}\`.\n\n**Iteration order**: Dart Lists iterate in index order; default Sets and Maps (\`LinkedHashSet\`/\`LinkedHashMap\` under the hood) preserve **insertion order** across iteration. If you need sorted iteration, use \`SplayTreeSet\` / \`SplayTreeMap\`. If you need unordered hash variants for a tiny perf gain, use \`HashSet\` / \`HashMap\`.\n\nAll three implement \`Iterable<T>\` (Maps via \`.entries\`, \`.keys\`, \`.values\`), so the higher-order methods (\`map\`, \`where\`, \`fold\`) work uniformly. Conversion is one method away: \`list.toSet()\`, \`set.toList()\`, \`map.entries.toList()\`.`,
              whyItMatters: 'Picking the right collection is the single biggest performance lever in everyday Dart. Using a List where you needed a Set turns a fast app into a 10-second freeze on a 5000-item list — every Flutter performance audit has at least one of these. In interviews, when given a problem like find duplicates in a stream, the candidate who reaches for `Set` immediately stands out from the one who writes a nested for loop. And in code review, suggesting `Map<UserId, User>` instead of `List<User>` to a junior is one of those two-minute changes that cuts response time from 200 ms to 2 ms.',
              steps: [
                'Create `coll.dart`. Build `final names = ["Anjali", "Pradeep", "Anjali"];` — note duplicates are kept in a List.',
                'Convert with `final unique = names.toSet();` and print — only Anjali and Pradeep remain.',
                'Build a Map: `final ages = {"Anjali": 27, "Pradeep": 32};` and look up `ages["Anjali"]`.',
                'Time `contains` on a 100k-element List vs the same data as a Set — observe orders-of-magnitude difference.',
                'Iterate the Map with `for (final e in ages.entries) print("${e.key}: ${e.value}");`.',
                'Demonstrate Set algebra: `a.union(b)`, `a.intersection(b)`, `a.difference(b)` for two food sets.',
                'Show the empty-{} ambiguity: `var s = <int>{};` for empty Set, `var m = <String, int>{};` for empty Map.',
                'Convert between: `list.toSet()`, `set.toList()`, `map.entries.toList()` — practise all three round-trips.',
              ],
              code: `// coll.dart
// Run with: dart run coll.dart

void main() {
  // 1. List — ordered, duplicates allowed.
  final districts = ['Bengaluru', 'Mysuru', 'Mangaluru', 'Bengaluru'];
  print('list: \$districts');
  print('first: \${districts.first}, length: \${districts.length}');

  // 2. Set — unique, fast contains.
  final uniqueDistricts = districts.toSet();
  print('set: \$uniqueDistricts');
  print('contains Mysuru? \${uniqueDistricts.contains('Mysuru')}');

  // 3. Map — key/value, fast lookup by key.
  final population = {
    'Bengaluru': 13000000,
    'Mysuru': 1200000,
    'Mangaluru': 700000,
  };
  print('Bengaluru pop: \${population['Bengaluru']}');

  // 4. Empty literal disambiguation.
  var emptySet = <int>{};
  var emptyMap = <String, int>{};
  emptySet.add(42);
  emptyMap['Anjali'] = 27;
  print('emptySet=\$emptySet, emptyMap=\$emptyMap');

  // 5. Set algebra.
  final a = {'idli', 'vada', 'dosa'};
  final b = {'dosa', 'puri', 'paratha'};
  print('union:        \${a.union(b)}');
  print('intersection: \${a.intersection(b)}');
  print('difference:   \${a.difference(b)}');

  // 6. Map iteration is insertion-ordered.
  for (final e in population.entries) {
    print('\${e.key}: \${e.value}');
  }

  // 7. Performance: contains on List vs Set.
  final big = List<int>.generate(100000, (i) => i);
  final bigSet = big.toSet();
  final sw = Stopwatch()..start();
  big.contains(99999);          // O(n)
  print('list contains: \${sw.elapsedMicroseconds} us');
  sw.reset();
  bigSet.contains(99999);       // O(1)
  print('set contains:  \${sw.elapsedMicroseconds} us');
}`,
              pitfalls: [
                '**Using `{}` for an empty Set.** `var s = {};` is `Map<dynamic, dynamic>`, not a Set. Write `<int>{}` or `Set<int>()`.',
                '**Calling `.contains` on a large List in a hot loop.** O(n) per call. Convert once to a Set with `.toSet()` outside the loop and reuse.',
                '**Treating Map iteration order as undefined.** Dart Maps are insertion-ordered (LinkedHashMap by default). Code can safely rely on this across platforms.',
                '**Mutating a Set or Map during iteration.** Throws `ConcurrentModificationError`. Snapshot with `.toList()` if you must remove items mid-iteration.',
                '**Misreading List `.contains` as O(1).** It is O(n) — Lists do not hash. Reach for Set when membership is the access pattern.',
                '**Building a `List<(K, V)>` where you wanted a `Map<K, V>`.** Linear scans for key lookup defeat the purpose; switch to a Map.',
                '**Using `Map<String, dynamic>` for stable shapes.** Convert to a real class with named final fields once the schema is settled. Maps are for genuinely dynamic data.',
                '**`map[missingKey]` returning null silently.** Always handle the null with `??` or use `map.putIfAbsent(key, ifAbsent)` for lazy defaults.',
              ],
              tryIt: `Build a function \`Map<String, int> wordCount(String text)\` that splits on whitespace, lowercases each word, and counts occurrences with \`map.update(key, (v) => v + 1, ifAbsent: () => 1)\`. Test on a 200-word paragraph. **Now extend it** to return the top 5 most frequent words sorted by count: convert \`wordCount.entries.toList()\`, sort with a custom comparator on \`-e.value\`, and take the first 5. The exercise drills Map building, List conversion, and comparator sorting — three operations you will repeat thousands of times in real Flutter apps.`,
              takeaway: 'If your code does .contains() on a List, you wanted a Set.',
            },
            {
              id: 'm0-t13',
              title: 'Spread, Collection-if, Collection-for',
              explain: 'Inline conditionals, loops, and spreads inside collection literals — no helper functions needed.',
              analogy: 'Imagine the **wedding oota at a traditional Mysuru-style wedding**. The plantain leaf is laid in front of every guest, and the servers move down the row in a fixed sequence. The base spread always includes rice, sambar, rasam, curd rice — that is your literal list. If today is Sunday, the kitchen also passes around extra mysore pak — that is **collection-if**. For each mango Pradeep brought from his Ramanagara orchard, the dessert side gets a fresh dollop — that is **collection-for**. And the standard sambar-and-rasam combo is poured straight from the master bucket onto every plate without re-cooking it each time — that is the **spread operator**, taking an existing collection and pouring it into the new one. Dart lets you compose all four kinds of plate-building inside a single literal so you never have to start with an empty list and call `.add` ten times.',
              theory: `Inside a Dart collection literal you can use four composable shorthands.\n\n**Spread \`...\`** flattens an iterable into the surrounding literal: \`[1, 2, ...other, 5]\`. Works inside List, Set, and Map literals. For Maps, \`...otherMap\` spreads the key-value entries.\n\n**Null-aware spread \`...?\`** skips the spread when the source is null: \`[...?maybeList]\`. Required whenever the source has a nullable type — without the \`?\`, the compiler errors.\n\n**Collection-if** conditionally includes an element: \`[1, if (cond) 2, 3]\`. The \`if-else\` form is also legal: \`[if (cond) 'yes' else 'no']\`. The condition must be a \`bool\`.\n\n**Collection-for** generates elements inline: \`[for (final x in xs) x * 2]\`. The classic indexed form works too: \`[for (var i = 0; i < 10; i++) i]\`. You can chain them: \`[for (final x in xs) if (x > 0) x]\` keeps positives only.\n\nAll four **compose freely** in a single literal. The Flutter idiom is exactly this — \`Column(children: [Header(), if (loggedIn) UserCard(), for (final p in posts) PostCard(p), ...?ads, Footer()])\` builds a widget tree without imperative \`.add\` calls.\n\nMap spread has one subtle rule: **later keys override earlier ones**. \`{...defaults, 'theme': 'dark'}\` is the canonical way to express override-on-base. Useful for theme spreads and config layering; surprising if you accidentally rely on the wrong order.`,
              whyItMatters: 'Collection-if, collection-for, and spread are why production Flutter widget trees are readable. Without them, every widget builder starts with `final children = <Widget>[];` and ten lines of imperative `add` calls — code that hides intent behind plumbing. With them, the children list reads top-to-bottom in the same order the user sees on screen. Mastering this trio is the single biggest readability upgrade you make in the first week of Flutter. In code review, the seniors are the ones who refactor every imperative builder into a single composed literal.',
              steps: [
                'Create `compose.dart`. Build `[1, 2, ...[3, 4], 5]` and print — observe the flattened output.',
                'Merge two lists with `[...a, ...b]` and confirm both contents appear.',
                'Set `List<String>? maybe;` (null) and use `[...?maybe]` — confirm no crash.',
                'Use collection-if: `final menu = [if (today == "Sunday") "extra dosa", "rice", "sambar"];` and toggle today.',
                'Use the if-else form: `[if (vip) "VIP sweets" else "regular ladoo"]` and observe both branches.',
                'Use collection-for: `final squares = [for (var n in [1, 2, 3]) n * n];`.',
                'Spread inside a Map: `{...defaults, "theme": "dark"}` — confirm the later key wins.',
                'Compose all four in a Flutter-style children list: header, conditional banner, for-loop posts, optional ads, footer.',
              ],
              code: `// compose.dart
// Run with: dart run compose.dart

void main() {
  // 1. Spread inside a List literal.
  final morning = ['idli', 'vada'];
  final lunch = ['rice', 'sambar', 'rasam'];
  final wholeDay = [...morning, ...lunch, 'curd rice'];
  print(wholeDay);

  // 2. Null-aware spread.
  List<String>? extras;            // null
  final menu = ['rice', ...?extras, 'rasam'];
  print(menu);                     // [rice, rasam]

  extras = ['pickle', 'papad'];
  final menu2 = ['rice', ...?extras, 'rasam'];
  print(menu2);                    // [rice, pickle, papad, rasam]

  // 3. Collection-if.
  final today = 'Sunday';
  final plate = [
    'rice',
    'sambar',
    if (today == 'Sunday') 'extra dosa',
    'curd rice',
  ];
  print(plate);

  // 4. Collection-if/else.
  final vip = true;
  final sweets = [if (vip) 'mysore pak' else 'regular ladoo'];
  print(sweets);

  // 5. Collection-for.
  final squares = [for (var n in [1, 2, 3, 4, 5]) n * n];
  print(squares);

  // 6. Spread inside a Map (later keys override earlier ones).
  final defaults = {'theme': 'light', 'lang': 'en'};
  final overridden = {...defaults, 'theme': 'dark'};
  print(overridden);

  // 7. Composing all four — Flutter-style children list.
  final isLoggedIn = true;
  final posts = ['Post 1', 'Post 2', 'Post 3'];
  List<String>? sponsoredAds;
  final children = [
    'Header',
    if (isLoggedIn) 'UserCard',
    for (final p in posts) 'Card(\$p)',
    ...?sponsoredAds,
    if (!isLoggedIn) 'LoginButton',
    'Footer',
  ];
  print(children);
}`,
              pitfalls: [
                '**Spreading a nullable source without `?`.** `[...maybeList]` is a compile error when `maybeList` is `List<T>?`. Use `...?maybeList` to skip when null.',
                '**Collection-if condition that is not a `bool`.** `if (count)` fails — Dart has no implicit truthiness. Wrap with an explicit comparison.',
                '**Map spread overrides surprise.** `{...a, "k": "b"}` overrides any `a["k"]` because **last write wins**. Useful for theme overrides; bug source if accidental.',
                '**Trying to spread a Stream.** `[...someStream]` is a compile error — Streams are async and not directly iterable. Realize via `.toList()` if the stream is finite.',
                '**Using collection-for in a Flutter `build` over a 10k-item source.** The literal is realized eagerly. Use `ListView.builder` (lazy) when the visible window is smaller than the data.',
                '**Mixing ternary and collection-if confusingly.** `[a ? b : c]` and `[if (a) b else c]` produce the same one-element list, but the second reads cleaner. Prefer it.',
                '**Spread into Set deduplicates silently.** `{...a, ...b}` removes duplicates without warning. Use `[...a, ...b]` if duplicates matter.',
                '**Forgetting parens around complex collection-if conditions.** `[if (a && b) x]` works, `[if a && b x]` does not. Always parenthesize.',
              ],
              tryIt: `Write a function \`List<String> buildFeed({required List<String> posts, required bool isPremium, List<String>? sponsoredAds})\` that returns a children list using all four features: a constant \`'Header'\`, a conditional \`'PremiumBanner'\` when \`isPremium\`, a \`for\`-loop expanding \`'PostCard(\$post)'\` per post, the spread \`...?sponsoredAds\` after the posts, a conditional \`'LoadMore'\` if \`posts.length > 10\`, and a constant \`'Footer'\`. **Now extend it** by adding a leading \`if (!isPremium) 'AdBanner'\` between header and posts. The exercise mirrors exactly how production Flutter trees are built — once you have written three of these, you will never reach for \`list.add()\` in a build method again.`,
              takeaway: 'Build a List inline, not in a temp variable. Collection-if and collection-for are why.',
            },
          ],
        },
        {
          id: 'm0-s4',
          title: 'Functions',
          topics: [
            {
              id: 'm0-t14',
              title: 'Functions and Arrow Syntax',
              explain: 'Functions are first-class values. The fat arrow => is shorthand for one-expression returns.',
              analogy: 'Imagine Anjali running a small Bangalore food-delivery startup. She writes one tiny address-format function on a printed card and **hands a copy to every delivery executive** on the team. Each rider calls it on the orders they pick up, no two riders argue about the format, and when the city changes its pincode rule Anjali reprints one card and everyone is back in sync. That is a function being passed around as a value. The **fat arrow** `=>` is just the same address-format written on a single business card instead of a three-line note — same meaning, less paper. When the body is one expression, use the arrow; when it needs branching, fall back to curly braces.',
              theory: `A Dart function declaration has four parts: a **return type**, a **name**, a **parameter list** in parentheses, and a **body** in braces. Example: \`int add(int a, int b) { return a + b; }\`. The return type can be omitted (Dart infers it) but you should always declare it on top-level functions for clarity and tooling.\n\n**Top-level functions** live outside any class — \`main\` is one. **Static methods** belong to a class but no instance. **Instance methods** belong to an instance. Their declaration syntax is identical; only the scope differs.\n\nThe **fat arrow** \`=>\` is shorthand for \`{ return <expression>; }\`. Use it only when the body is a single expression: \`int square(int x) => x * x;\` reads cleaner than the three-line version. Flutter widget trees lean heavily on arrow syntax — \`Widget build(BuildContext c) => Container(...);\`.\n\nIn Dart, **functions are first-class values**. You can store a function in a variable, pass it as a parameter, return it from another function, or stick it inside a \`List<Function>\`. The type of a function is written \`ReturnType Function(ParamTypes...)\`. Example: \`int Function(int) doubler = (x) => x * 2;\`. **Anonymous (lambda) functions** use \`(params) { body }\` or \`(params) => expression\` — same shape minus the name.\n\nOne syntax sugar worth knowing while we are on calling: the **cascade operator** \`..\`. Instead of \`final s = Stopwatch(); s.start(); s.stop();\`, you write \`final s = Stopwatch()..start()..stop();\`. Each \`..method()\` invokes the method but returns the **original receiver** instead of the method\\'s own return value, letting you chain calls on the same object. Cascades show up everywhere in Flutter — \`<Widget>[]..add(header)..add(body)\` builds a list inline, \`paint..color = Colors.red..strokeWidth = 2\` configures a Paint without naming it twice. Reach for cascade when you would otherwise repeat the receiver 3+ times.`,
              whyItMatters: 'Flutter is a callback-soaked framework: `onPressed`, `onChanged`, `builder`, `itemBuilder`, `validator` are all function-valued parameters. Confidently passing tear-offs and arrow lambdas around is the difference between widget code that reads like prose and widget code that reads like punctuation soup. Master the syntax now and a thousand Flutter examples on YouTube suddenly make sense; fumble it and every callback feels like a foreign language.',
              steps: [
                'Create `functions.dart` in your `dart-bootcamp` folder with a `void main()`.',
                'Write a top-level function `int doubleIt(int x) { return x * 2; }` and call it from main.',
                'Rewrite it with the arrow form: `int doubleIt(int x) => x * 2;`. Re-run — same output, fewer keystrokes.',
                'Store the function in a variable: `final fn = doubleIt; print(fn(5));`. This is a **tear-off** — no parens, you grab the function itself.',
                'Pass a function to another function: `void runTwice(int Function(int) f, int v) => print(f(f(v)));`. Call `runTwice(doubleIt, 3)`.',
                'Use an anonymous arrow inline: `runTwice((x) => x + 10, 1);`. Note no name, just the shape.',
                'Return a function from a function: `Function makeAdder(int n) => (int x) => x + n;`. Call `final add5 = makeAdder(5); print(add5(3));`.',
                'Run `dart format functions.dart` and read the formatted layout — the formatter has strong opinions on arrow style.',
              ],
              code: `// functions.dart — first-class functions, arrow syntax, callbacks.
// Run with: dart run functions.dart

void main() {
  // 1. Long form vs arrow form. Both compile to the same bytecode.
  int doubleLong(int x) {
    return x * 2;
  }
  int doubleArrow(int x) => x * 2;
  print(doubleLong(7));   // 14
  print(doubleArrow(7));  // 14

  // 2. Tear-off: grab the function itself, no parens.
  final fn = doubleArrow;
  print(fn(20));          // 40

  // 3. Pass a function as an argument (higher-order function).
  runTwice(doubleArrow, 3);          // ((3*2)*2) = 12
  runTwice((x) => x + 10, 1);        // anonymous lambda, prints 21

  // 4. Return a function from a function (closure preview).
  final add5 = makeAdder(5);
  print(add5(3));                    // 8

  // 5. Functions as values in a collection.
  final ops = <int Function(int)>[
    (x) => x + 1,
    (x) => x * 10,
    (x) => x * x,
  ];
  for (final op in ops) {
    print(op(4));                    // 5, 40, 16
  }
}

void runTwice(int Function(int) f, int v) {
  print(f(f(v)));
}

int Function(int) makeAdder(int n) => (int x) => x + n;`,
              pitfalls: [
                '**Forgetting the return type on top-level functions.** `add(a, b) { return a + b; }` works but Dart infers `dynamic` parameters and return — every call site loses type safety. Always declare types on functions other people will read.',
                '**Arrow with a block body.** `() => { print(1); }` is NOT a block — it is a function returning a Map literal! Arrow expects exactly ONE expression. Use curly braces and `return` for multi-statement bodies.',
                '**Calling vs passing.** `setState(myMethod)` passes the function. `setState(myMethod())` CALLS it and passes the **result**. One missing pair of parens flips meaning entirely.',
                '**Mismatched function types.** Storing a `void Function()` into an `int Function()` slot fails at compile time. Read the error: it tells you exactly which return type or param type does not match.',
                '**Local helpers leaking.** A function defined inside another function is invisible outside — that is the point. Do not promote it to top-level just to share with one other place; pass it as an argument instead.',
                '**Nullable returns ignored.** `int? square(int x) => x.isNegative ? null : x * x;` is valid, but every caller now must check for null. If you always return a value, drop the `?`.',
                '**Confusing `void` with returning null.** `void foo() {}` cannot be assigned to `final x = foo();` — `void` is not a value, it is the absence of one. Use `Null foo() => null;` if you really need to return null.',
                '**Tear-off vs closure overhead.** `widget.onTap = controller.dispose` is a free tear-off. `widget.onTap = () => controller.dispose()` allocates a fresh closure on every build. Prefer the tear-off when there are no extra args.',
              ],
              tryIt: `Write a function \`List<int> transform(List<int> nums, int Function(int) op)\` that maps every element through \`op\` and returns a new list. Test with three operations: \`(x) => x * x\`, \`(x) => x + 100\`, and a named function \`int triple(int x) => x * 3\`. **Now extend it** to also accept an optional \`bool Function(int)? filter\` parameter — when provided, only items passing the filter get transformed. The exercise drills first-class functions, the arrow form, and the conditional-callback shape you will use in every Flutter \`itemBuilder\`.`,
              takeaway: 'Pass functions like values. They are values.',
            },
            {
              id: 'm0-t15',
              title: 'Optional, Named, and Required Parameters',
              explain: 'Square brackets for positional optional, curly braces for named, required for non-null named params.',
              analogy: 'Picture a **Mysuru wedding invitation card** that just landed in your post box. Some lines are non-negotiable: bride name, groom name, date, venue. Skip any one and the card is useless — those are **required positional** params. Other lines are clearly **labelled** so you do not need to count positions: `Reception: 7:30 PM`, `RSVP: 9876543210`. Those are **named** params. Some extras like `Mehendi: Friday 5 PM` or `Sangeet: Saturday 7 PM` only appear when the family is doing them — those are **optional** params with sensible defaults. Dart parameter syntax mirrors the invitation exactly: positional for the must-haves in order, named for the labelled fields, optional with defaults for the nice-to-haves. Flutter widgets are basically giant invitation cards with thirty named slots — `child:`, `padding:`, `decoration:`, `onPressed:` — most optional, a few required.',
              theory: `Dart supports three parameter flavours beyond plain required positional ones.\n\n**Required positional** is the default: \`void greet(String name, String city) { ... }\` and you call \`greet('Anjali', 'Bengaluru')\` — order matters, both must appear.\n\n**Optional positional** uses square brackets: \`void greet(String name, [String city = 'Karnataka', bool shout = false]) { ... }\`. Call as \`greet('Anjali')\`, \`greet('Anjali', 'Mysuru')\`, or with all three. Defaults must be **compile-time constants**. Order still matters — you cannot skip \`city\` to set \`shout\`.\n\n**Named** uses curly braces: \`void greet(String name, {String city = 'Karnataka', bool shout = false}) { ... }\`. Call as \`greet('Anjali', city: 'Hubballi', shout: true)\` — order is irrelevant, only the labels matter.\n\n**Required named** combines clarity with non-null safety: \`void greet({required String name, required String city, bool shout = false}) { ... }\`. The \`required\` keyword forces callers to provide that named argument; no default needed. **This is the Flutter idiom** — every \`StatelessWidget\` constructor uses required-named for non-defaultable fields, optional-named for the rest.\n\nYou **cannot mix** \`[ ]\` and \`{ }\` in the same function — pick one optional flavour. Optional / named params always come last in the signature, after required positional ones.`,
              whyItMatters: 'Flutter widget constructors routinely have 5–30 fields. Required-named lets the compiler refuse a `Container(...)` missing essential properties, and the named-arg call syntax lets you read a Flutter file aloud without consulting the docs. Get fluent in the syntax now and Flutter code reads like a structured form; stay sloppy and every constructor call will feel like a surprise. This single feature is also why Dart 2.12 became loved overnight — sound null safety made `required` enforceable at compile time, and bug counts dropped across every Flutter codebase that migrated.',
              steps: [
                'Create `params.dart`. Define `String makeAddress(String street, String city, [String? landmark, String state = \'Karnataka\'])`.',
                'Call it three ways from main: with two args, three args, four args. Watch the defaults kick in.',
                'Rewrite as named: `String makeAddress({required String street, required String city, String? landmark, String state = \'Karnataka\'})`.',
                'Call it as `makeAddress(city: \'Mysuru\', street: \'5th Cross\')` — note order does not matter.',
                'Try omitting `street:` from the call — observe the **compile error** "The named parameter \'street\' is required".',
                'Add a `bool isWedding = false` named param, and use it inside the body to add a `(WEDDING)` suffix when true.',
                'Write a Flutter-shaped mock function `String widget({required String label, double padding = 8.0, void Function()? onTap})` to feel the widget-constructor pattern.',
                'Run `dart format params.dart` and observe how named-args calls get one argument per line above a chosen length — that is the Flutter house style.',
              ],
              code: `// params.dart — every Dart parameter flavour, side by side.
// Run with: dart run params.dart

void main() {
  // 1. Required positional only.
  print(greetPositional('Anjali', 'Bengaluru'));

  // 2. Optional positional with defaults.
  print(addressOptional('5th Cross', 'Mysuru'));
  print(addressOptional('5th Cross', 'Mysuru', 'near MTR'));
  print(addressOptional('5th Cross', 'Mysuru', 'near MTR', 'KA'));

  // 3. Named with defaults — order does not matter.
  print(addressNamed(city: 'Hubballi', street: '7th Main'));
  print(addressNamed(street: '12 A', city: 'Mangaluru', landmark: 'beside Kadri Park'));

  // 4. Required-named — Flutter idiom.
  print(formatPrice(amount: 1234.5));
  print(formatPrice(amount: 1234.5, currency: 'USD', decimals: 0));

  // 5. Flutter-shaped mock to feel the widget call shape.
  final btn = button(label: 'Place Order', onTap: () => print('tapped'));
  print(btn);
}

String greetPositional(String name, String city) => 'Namaskara \$name from \$city';

String addressOptional(
  String street,
  String city, [
  String? landmark,
  String state = 'Karnataka',
]) {
  final lm = landmark == null ? '' : ' (\$landmark)';
  return '\$street, \$city\$lm, \$state';
}

String addressNamed({
  required String street,
  required String city,
  String? landmark,
  String state = 'Karnataka',
}) {
  final lm = landmark == null ? '' : ' (\$landmark)';
  return '\$street, \$city\$lm, \$state';
}

String formatPrice({
  required double amount,
  String currency = '₹',
  int decimals = 2,
}) {
  return '\$currency\${amount.toStringAsFixed(decimals)}';
}

String button({
  required String label,
  double padding = 8.0,
  void Function()? onTap,
}) {
  final tap = onTap == null ? '' : ' [tappable]';
  return '[\$label, pad=\$padding\$tap]';
}`,
              pitfalls: [
                '**Forgetting `required` on a non-nullable named param.** `String name` (named, no default, non-null) fails the null-safety check. Mark it `required` or make it nullable `String? name`. Pick one.',
                '**Mixing `[ ]` and `{ }` in the same function.** Dart refuses outright. Pick one flavour and stick with it; for anything beyond two params, named is almost always cleaner.',
                '**Default value not const.** `String city = DateTime.now().toString()` fails at parse time — defaults must be `const`-evaluable. Use `null` and assign inside the body if you need a runtime default.',
                '**Calling a named param positionally.** `greet(\'Anjali\', \'Mysuru\')` against `greet({required String name, required String city})` errors. Always write the labels: `name: \'Anjali\', city: \'Mysuru\'`.',
                '**Wrong order of `required`.** `required` goes BEFORE the type: `required String name`, never `String required name`.',
                '**Missing trailing comma in named-arg list.** `Widget(name: \'A\', city: \'B\')` works on one line but balloons on many. Add a trailing comma so `dart format` puts each arg on its own line — Flutter house style.',
                '**Confusing `?` and `required`.** `String? name` means **nullable**. `required String name` means **must-pass**. They are independent. `required String? name` is legal — caller must pass, value can be null.',
                '**Forgetting `super.key` in Flutter widget constructors.** When you reach module 1, every widget constructor needs `({super.key, required this.label})` — same syntax, just forwarding to the parent. Cover it then.',
              ],
              tryIt: `Write \`String formatPrice({required double amount, String currency = '₹', int decimals = 2, bool showCommas = true})\`. Test calls: \`formatPrice(amount: 1234.5678)\` should give \`₹1,234.57\` (or \`₹1234.57\` if showCommas is false). **Now extend it** by adding a \`bool isPaise = false\` named param — when true, treat \`amount\` as paise and divide by 100 before formatting. The exercise drills required-named, defaults, and the Flutter constructor-call shape you will use a thousand times.`,
              takeaway: 'Named parameters with required is the Flutter idiom. Get used to the syntax now.',
            },
            {
              id: 'm0-t16',
              title: 'Closures and Higher-Order Functions',
              explain: 'A closure captures the variables in its lexical scope. Pass closures as callbacks.',
              analogy: 'Picture **Ganesh the chai vendor** at his first stall in Jayanagar. He spends six months perfecting his masala — exact pinch of cardamom, ginger ratio, milk-fat percentage, the half-second extra simmer that makes his chai famous. Two years later he moves to Indiranagar, then to a Whitefield tech park, then to his cousin\'s wedding in Pune. Wherever he sets up, **the chai tastes identical** — the recipe lives in his head, not in the stall. A **closure** is exactly that: a function that carries the variables from the scope where it was born, no matter where it is later passed or called from. **Higher-order functions** are the catering managers who never make chai themselves but cheerfully pass Ganesh\'s recipe (or any vendor\'s recipe) around to event coordinators across the state.',
              theory: `A **closure** is a function plus a snapshot of the variables it can see at the moment it is created. When you write a function inside another function, the inner one can read the outer one's local variables — and crucially, those variables stay alive as long as the inner function holds a reference to them. Even after the outer function has returned.\n\n\`\`\`dart\nFunction makeCounter() {\n  int count = 0;\n  return () {\n    count++;\n    return count;\n  };\n}\n\nfinal c1 = makeCounter();\nprint(c1()); // 1\nprint(c1()); // 2\nfinal c2 = makeCounter();\nprint(c2()); // 1 — independent counter, fresh closure\n\`\`\`\n\nThe \`count\` variable is gone from the outer scope after \`makeCounter\` returns — but the returned function still holds a private reference to it. Each \`makeCounter()\` call creates a **fresh closure** with its own \`count\`.\n\nA **higher-order function** is any function that takes a function as an argument or returns one. \`List.map\`, \`List.where\`, \`List.forEach\`, \`Future.then\`, \`Stream.listen\` are all higher-order. They are the glue that makes Dart feel functional even though it is class-based at heart.\n\nThe combination is powerful: closures let you carry state into a callback without exposing it as a global. Higher-order functions let you compose tiny operations into pipelines. Together they replace 90% of the design patterns you would otherwise reach for in older languages.`,
              whyItMatters: 'Every Flutter `setState`, `onTap`, `Future.then`, `StreamBuilder.builder`, `ListView.builder.itemBuilder` is a closure capturing `this`, `widget.someField`, or local state. Misunderstand closure capture and you write a classic bug where every list row updates the same item. Master the model once and that entire bug class disappears, plus you start spotting tear-off opportunities (free) versus closure allocations (cheap but not free) in hot rebuild paths.',
              steps: [
                'Create `closures.dart`. Write `makeCounter()` exactly as in the theory block.',
                'Build two counters: `final c1 = makeCounter(); final c2 = makeCounter();`. Confirm they are independent.',
                'Write a higher-order map: `List<R> myMap<T, R>(List<T> xs, R Function(T) op) => [for (final x in xs) op(x)];`.',
                'Use it: `print(myMap([1,2,3], (x) => x * x));` — should print `[1, 4, 9]`.',
                'Build a closure list inside a loop: `final fns = <int Function()>[]; for (var i = 0; i < 3; i++) { fns.add(() => i); } print(fns.map((f) => f()).toList());`. Confirm `[0, 1, 2]` (per-iteration capture).',
                'Compose a pipeline: `int Function(int) pipeline(List<int Function(int)> ops) => (x) => ops.fold(x, (acc, op) => op(acc));`. Try `[(x) => x + 1, (x) => x * 10]`.',
                'Use `List.where`, `List.map`, `List.fold` on a list of orders to compute total revenue from completed orders.',
                'Tear-off vs closure: declare `final fn = makeCounter();` (closure) and compare with passing `print` directly to `forEach` (tear-off). Notice the syntax difference.',
              ],
              code: `// closures.dart — closure capture, higher-order utilities, functional pipeline.
// Run with: dart run closures.dart

void main() {
  // 1. Two independent counters from the same closure factory.
  final c1 = makeCounter();
  final c2 = makeCounter();
  print(c1()); // 1
  print(c1()); // 2
  print(c1()); // 3
  print(c2()); // 1 — independent

  // 2. Generic higher-order map.
  final squares = myMap<int, int>([1, 2, 3, 4], (x) => x * x);
  print(squares); // [1, 4, 9, 16]

  // 3. Per-iteration closure capture (Dart captures by binding, like JS let).
  final fns = <int Function()>[];
  for (var i = 0; i < 3; i++) {
    fns.add(() => i);
  }
  print(fns.map((f) => f()).toList()); // [0, 1, 2]

  // 4. Pipeline via closure composition.
  final pipe = pipeline([(x) => x + 1, (x) => x * 10, (x) => x - 5]);
  print(pipe(3)); // ((3+1)*10) - 5 = 35

  // 5. Real Karnataka use-case: compute total revenue.
  final orders = <Map<String, dynamic>>[
    {'id': 'A', 'amount': 250.0, 'status': 'paid'},
    {'id': 'B', 'amount': 999.0, 'status': 'cancelled'},
    {'id': 'C', 'amount': 1499.0, 'status': 'paid'},
  ];
  final total = orders
      .where((o) => o['status'] == 'paid')
      .map((o) => o['amount'] as double)
      .fold<double>(0.0, (sum, amt) => sum + amt);
  print('Revenue: ₹\${total.toStringAsFixed(2)}'); // Revenue: ₹1749.00
}

Function makeCounter() {
  int count = 0;
  return () {
    count++;
    return count;
  };
}

List<R> myMap<T, R>(List<T> xs, R Function(T) op) =>
    [for (final x in xs) op(x)];

int Function(int) pipeline(List<int Function(int)> ops) =>
    (int x) => ops.fold(x, (acc, op) => op(acc));`,
              pitfalls: [
                '**Closure captures the variable, not its value at call time.** Pre-Dart-2 `for (int i = 0; i < n; i++)` was a famous footgun in JS — Dart\'s `for (var i = 0; ...; ...)` captures per iteration thanks to fresh-binding semantics, so `[0, 1, 2]` is correct. But manually mutating a captured variable later still affects the closure.',
                '**Closures hold memory alive.** Capturing `this` inside a Stream subscription or Timer prevents the enclosing widget from being garbage collected. Always cancel subscriptions in `dispose()`.',
                '**Tear-off vs closure overhead.** `widget.onPressed = myMethod` is a free tear-off. `widget.onPressed = () => myMethod()` allocates a fresh closure every build. Prefer tear-offs when you need no extra args.',
                '**Type inference gone wrong on `fold`.** `orders.fold(0, (a, b) => a + b)` — the seed `0` is `int`, so the accumulator type is `int`. If `b` is `double`, the closure body returns `double` but the param expects `int` — compile error. Specify the type: `fold<double>(0.0, ...)`.',
                '**Chaining on huge lists.** `.map().where().map().toList()` allocates four intermediate lists. For 10k+ items, switch to a single `for` loop or use lazy `Iterable` chains and convert once at the end.',
                '**Confusing closure with currying.** `makeAdder(5)(3)` is closure-based partial application, NOT Haskell-style currying. Dart functions remain uncurried.',
                '**Returning a fresh closure breaks `==` checks.** Each call to a closure-returning method creates a new function instance. `widget1.onTap == widget2.onTap` is false even if they wrap the same logic. Cache the closure if equality matters.',
                '**Captured `this` in a long-lived callback.** A `Timer.periodic` capturing `this` survives even after the screen is popped. Use a `WeakReference` or cancel the timer in `dispose()`.',
              ],
              tryIt: `Write \`Function makeMultiplier(int factor)\` that returns \`(int x) => x * factor\`. Use it to build \`doubler = makeMultiplier(2)\`, \`tripler = makeMultiplier(3)\`, \`tenX = makeMultiplier(10)\` and apply each via \`myMap\` to \`[1, 2, 3, 4, 5]\`. **Now extend it** by writing \`Function compose(Function f, Function g)\` that returns \`(x) => f(g(x))\` and use it to make \`doubleThenAdd5 = compose((x) => x + 5, (x) => x * 2)\`. The exercise drills closure capture, higher-order composition, and the Flutter callback shape.`,
              takeaway: 'A closure remembers where it was born. That is its superpower.',
            },
          ],
        },
        {
          id: 'm0-s5',
          title: 'Object-Oriented Dart',
          topics: [
            {
              id: 'm0-t17',
              title: 'Classes, Constructors, and Initializer Lists',
              explain: 'Dart classes have named constructors, factory constructors, and initializer lists for invariants.',
              analogy: 'Picture a **Mangalore-tile bungalow blueprint** drawn by an architect at a Bengaluru firm. The blueprint itself is the **class** — it describes how a house *can* be built (rooms, dimensions, electrical layout) but it is not yet a house. Every actual house built from that blueprint is an **instance**. The firm offers four ways to commission the house: the **standard package** (default constructor, basic specs), the **custom plan** (named constructor like `House.custom`), the **factory pre-fab** (a factory constructor that may return a cached pre-fab if one already matches), and a **luxury upgrade** (another named constructor with extra fittings). The **initializer list** is the surveyor checking the foundation level *before* a single brick is laid — a one-shot validation that runs before the constructor body and cannot be skipped.',
              theory: `A Dart **class** is declared with \`class Name { ... }\`. Inside live **fields** (instance variables), **constructors**, and **methods**.\n\nThe **default constructor** has the same name as the class: \`class Order { Order(this.id, this.amount); final String id; final double amount; }\`. The \`this.id\` shorthand auto-assigns the parameter to the field — no need to write \`this.id = id;\` in the body.\n\n**Named constructors** let you offer multiple ways to build: \`Order.guest() : id = 'GUEST', amount = 0;\`. The \`: ...\` part is the **initializer list** — it runs before the body, can call other constructors with \`: this.named(...)\`, can validate with \`assert(...)\`, and is the **only place** you can assign \`final\` fields when the value depends on parameters.\n\n**Factory constructors** return an existing instance instead of always creating a new one — useful for caches, singletons, or returning a subclass: \`factory Order.fromJson(Map<String, dynamic> json) { return Order(json['id'], (json['amount'] as num).toDouble()); }\`. Factories use \`return\`; regular constructors do not.\n\n**Const constructors** create compile-time constant instances: \`const Order(this.id, this.amount);\` lets you write \`const Order('X', 100)\` and Dart will reuse the same in-memory instance everywhere it appears as a constant. Flutter widgets aggressively use \`const\` constructors — it is the single biggest performance lever you have, because const widgets get skipped during rebuilds.\n\nClasses also expose **getters and setters** that look like fields from the outside: \`int get area => width * height;\` exposes a *computed* value as \`obj.area\` (no parens). \`set area(int v) { ... }\` runs code when someone writes \`obj.area = 100;\`. Getters and setters are how you keep your public API stable while changing the underlying storage — start with a plain field, later swap to a getter that derives the value, callers do not change. **Static members** (\`static const PI = 3.14;\`, \`static int counter = 0;\`) belong to the class itself, not any instance — accessed as \`Order.counter\`, useful for shared constants and factory caches.`,
              whyItMatters: 'Every Flutter widget is a class with a constructor. Knowing when to reach for a default vs named vs factory constructor decides how clean your widget API feels to the next teammate. Const constructors are also the framework\'s favourite optimization knob — every `const SizedBox(height: 8)` you write skips a rebuild that a non-const version would trigger. On a list of 200 cards, this is the difference between 60 fps and a janky scroll.',
              steps: [
                'Create `classes.dart`. Define `class Order { Order(this.id, this.amount); final String id; final double amount; }`.',
                'Build one in main: `final o = Order(\'ORD-1\', 250.0); print(o.id);`.',
                'Add a named constructor: `Order.guest() : id = \'GUEST\', amount = 0;`. Use it.',
                'Add an initializer-list assertion: `Order(this.id, this.amount) : assert(amount >= 0, \'Amount must be non-negative\');`. Try a negative value — see the assert fire under JIT.',
                'Add a factory: `factory Order.fromJson(Map<String, dynamic> j) => Order(j[\'id\'] as String, (j[\'amount\'] as num).toDouble());`.',
                'Add a const constructor: `const Order.fixed(this.id, this.amount);`. Build two `const Order.fixed(\'A\', 1)` and confirm `identical(...) == true`.',
                'Override `toString()` for nice prints: `@override String toString() => \'Order(\$id, ₹\$amount)\';`.',
                'Add the canonical `copyWith`: `Order copyWith({double? amount}) => Order(id, amount ?? this.amount);`.',
              ],
              code: `// classes.dart — every constructor flavour Dart offers, plus copyWith.
// Run with: dart run classes.dart

class Order {
  final String id;
  final double amount;

  // 1. Default constructor with this.field shorthand and assertion.
  Order(this.id, this.amount) : assert(amount >= 0, 'Amount must be non-negative');

  // 2. Named constructor — initializer list assigns final fields.
  Order.guest()
      : id = 'GUEST',
        amount = 0;

  // 3. Const constructor — compile-time constant instances.
  const Order.fixed(this.id, this.amount);

  // 4. Factory constructor — may return cached or subclass instance.
  factory Order.fromJson(Map<String, dynamic> j) {
    return Order(j['id'] as String, (j['amount'] as num).toDouble());
  }

  // 5. copyWith — the workhorse pattern Flutter uses everywhere.
  Order copyWith({String? id, double? amount}) {
    return Order(id ?? this.id, amount ?? this.amount);
  }

  @override
  String toString() => 'Order(\$id, ₹\${amount.toStringAsFixed(2)})';
}

void main() {
  final o = Order('ORD-1', 250.0);
  print(o); // Order(ORD-1, ₹250.00)

  final guest = Order.guest();
  print(guest); // Order(GUEST, ₹0.00)

  final parsed = Order.fromJson({'id': 'ORD-2', 'amount': 999.5});
  print(parsed); // Order(ORD-2, ₹999.50)

  // Two const-fixed instances: identical thanks to canonicalization.
  const a = Order.fixed('FIX', 100);
  const b = Order.fixed('FIX', 100);
  print(identical(a, b)); // true

  // copyWith — Flutter idiom for state updates.
  final discounted = o.copyWith(amount: o.amount * 0.9);
  print(discounted); // Order(ORD-1, ₹225.00)
}`,
              pitfalls: [
                '**Forgetting `this.field` shorthand.** Writing `Order(String id) { this.id = id; }` works for non-final fields but fails for `final`. Use `Order(this.id)` in the parameter list — concise and works for final fields.',
                '**Initializer list runs before the body.** You cannot reference `this.someOtherField` in the initializer list because the object is not yet built — you can only use the constructor parameters and other initializers.',
                '**Factory cannot use `this.field` shorthand.** A factory must explicitly build and return a value. There is no implicit `this` to assign to.',
                '**Confusing `const` and `final`.** `const` is **compile-time** (baked into the binary, canonicalized). `final` is **set-once at runtime**. A `const` constructor requires every field to be `final`.',
                '**Default constructor name collision.** Once you write any named constructor, you can still define a default `Order(...)`. But if you only write `Order.named(...)`, the default disappears entirely.',
                '**Forgetting `@override` on `toString()`.** Works without it, but you lose linter checks if the parent renames the method. Always annotate.',
                '**Equality without overriding `==` and `hashCode`.** Two `Order(\'A\', 1)` instances are NOT equal by default — Dart compares by identity. Override both, use `package:equatable`, or generate with `freezed`.',
                '**Const-construction in non-const contexts.** `const Order.fixed(\'A\', 1)` works only when constants are allowed (variable declarations, list literals, etc.). In a hot path computing values dynamically, drop the `const`.',
              ],
              tryIt: `Define \`class FoodOrder\` with fields \`id\`, \`restaurant\`, \`amount\`, \`placedAt\` (DateTime). Write a default constructor with required-named params using \`this.field\` shorthand. Add \`FoodOrder.guest()\` named constructor that fills sensible defaults. Add \`factory FoodOrder.fromJson(Map<String, dynamic>)\` and \`Map<String, dynamic> toJson()\`. **Now extend it** by adding a \`copyWith({...})\` method and overriding \`==\` plus \`hashCode\` to compare by \`id\` only. The exercise drills every constructor flavour you will use weekly in Flutter.`,
              takeaway: 'Use named constructors instead of overloaded factories. Each name documents intent.',
            },
            {
              id: 'm0-t18',
              title: 'Inheritance, Abstract Classes, and extends',
              explain: 'Single inheritance with extends, abstract classes for shared contracts, override with @override.',
              analogy: 'Picture a **three-generation Mysuru-style sambar lineage**. **Ammamma** (grandmother) lays down the master rule: every sambar must have **a dal base, a vegetable, tamarind, and a tempering** — but she refuses to commit to *which* dal or *which* vegetable. That is an **abstract class**: the contract is fixed, the implementation is left to the next generation. **Amma** extends Ammamma\'s rule with toor-dal-and-onion sambar. **Anjali** extends Amma\'s with a Mysuru-style jaggery-tamarind balance. Each generation can either accept the parent\'s recipe verbatim or **override** with its own twist — but the underlying contract from Ammamma still holds. If Anjali tries to skip the dal entirely, the lineage rejects her: **abstract methods MUST be implemented**.',
              theory: `Dart supports **single inheritance**: a class can \`extends\` exactly one parent. Multiple inheritance is achieved via mixins (next topic) or interface implementation.\n\n\`\`\`dart\nclass Vehicle {\n  void start() { print('Engine on'); }\n}\n\nclass Auto extends Vehicle {\n  @override\n  void start() {\n    super.start(); // call parent first\n    print('Meter ready');\n  }\n}\n\`\`\`\n\nThe \`@override\` annotation is not strictly required but the linter warns when missing — it catches typos in method names that would otherwise silently create a new method instead of overriding the parent's. \`super\` accesses the parent's implementation. \`super.start()\` runs the parent body first, then your additions.\n\nAn **abstract class** uses the \`abstract\` keyword and may declare methods without a body: \`abstract class Shape { double area(); }\`. You **cannot instantiate** an abstract class directly — you must \`extends\` it and implement every abstract method. Abstract classes are the cleanest way to declare an API that variants must fulfil.\n\n\`is\` checks runtime type: \`if (vehicle is Auto) { ... }\`. Dart **automatically promotes** the variable's type inside the \`if\` block, so you can call Auto-only methods without an explicit cast.\n\n\`as\` is an explicit cast: \`(vehicle as Auto).honk()\`. It throws \`TypeError\` at runtime if wrong. Prefer \`is\` with promotion.`,
              whyItMatters: 'Flutter\'s entire widget tree is one giant inheritance hierarchy: `Widget` → `StatelessWidget` → your custom widget. The `build` method is abstract on the parent — every subclass MUST provide it. Understanding inheritance is the difference between writing a custom widget that composes correctly with the framework and one that breaks the contract in subtle ways. Beyond Flutter, this is also the most-asked topic in junior interviews — "explain abstract vs interface vs mixin" is rarely missed.',
              steps: [
                'Create `inheritance.dart`. Define `abstract class Shape { double area(); String get name; }`.',
                'Create `class Circle extends Shape { Circle(this.r); final double r; @override double area() => 3.14159 * r * r; @override String get name => \'Circle\'; }`.',
                'Create `class Square extends Shape` with side length and similar overrides.',
                'Try `Shape s = Shape();` — observe Dart refuses to instantiate the abstract class.',
                'Build a `List<Shape>` of mixed shapes and loop printing `s.name` and `s.area()`.',
                'Add an `is`-check: `if (s is Circle) print(s.r);` — note the auto-promotion, no explicit cast required.',
                'Override `toString()` in Square and call `super.toString()` to chain.',
                'Define `class Cylinder extends Circle { ... }` to feel multi-level inheritance and `super` chains across two levels.',
              ],
              code: `// inheritance.dart — abstract base, concrete subclasses, super chains, is-promotion.
// Run with: dart run inheritance.dart

abstract class Shape {
  String get name;       // abstract getter — must be overridden
  double area();         // abstract method — must be overridden

  // Concrete method on the abstract class — shared default behaviour.
  String describe() => '\$name with area \${area().toStringAsFixed(2)}';
}

class Circle extends Shape {
  Circle(this.r);
  final double r;

  @override
  String get name => 'Circle';

  @override
  double area() => 3.14159 * r * r;
}

class Square extends Shape {
  Square(this.side);
  final double side;

  @override
  String get name => 'Square';

  @override
  double area() => side * side;
}

class Cylinder extends Circle {
  Cylinder(double r, this.height) : super(r);
  final double height;

  @override
  String get name => 'Cylinder';

  @override
  double area() => 2 * super.area() + 2 * 3.14159 * r * height;
}

void main() {
  // final s = Shape(); // ERROR: Shape is abstract, cannot instantiate.

  final shapes = <Shape>[
    Circle(5),
    Square(4),
    Cylinder(3, 10),
  ];

  for (final s in shapes) {
    print(s.describe());

    // is-promotion — no cast needed.
    if (s is Cylinder) {
      print('  (height: \${s.height})');
    } else if (s is Circle) {
      print('  (radius: \${s.r})');
    }
  }
}`,
              pitfalls: [
                '**Forgetting to implement an abstract method.** The subclass refuses to compile until every abstract method has a body. Read the error — it lists exactly which methods are missing.',
                '**Calling `super.method()` in the wrong order.** Parent should usually go first in lifecycle-style methods (`initState`, `start`, `setUp`). Read the parent\'s docs for the expected order.',
                '**Tightly coupling a subclass to the parent\'s private fields.** Underscore-prefixed fields are library-private — same file works, different files break. Prefer protected accessors via getters.',
                '**Diamond problem.** Two parents both defining `foo()` cannot both be `extends`-ed. Use mixins instead (next topic).',
                '**Abusing inheritance for code reuse.** If the relationship is not "is-a", reach for composition or a mixin. `Order extends List<Item>` is wrong — make it `class Order { final List<Item> items; }` and delegate.',
                '**Forgetting `super.key` in Flutter widget constructors.** `class MyWidget extends StatelessWidget { const MyWidget({super.key}); }` — the `super.key` shorthand (Dart 2.17+) forwards the key to the parent. Skip it and you lose Flutter\'s widget identity tracking.',
                '**Casting with `as` when `is` would do.** `(s as Circle).r` throws if wrong. `if (s is Circle) s.r` promotes safely. Prefer the latter.',
                '**Overriding without `@override`.** Works, but if the parent renames the method, yours silently becomes dead code instead of a compile error.',
              ],
              tryIt: `Define \`abstract class Notification { String render(); String get channel; }\`. Implement \`EmailNotification\`, \`SmsNotification\`, \`PushNotification\` — each renders differently and reports its channel. Build a \`List<Notification>\` and loop dispatching them. **Now extend it** by adding a concrete method \`Future<void> send()\` to the abstract class with a default body that prints \`Sending via \$channel: \${render()}\` — note the parent can mix abstract and concrete methods. The exercise drills Flutter's exact widget pattern.`,
              takeaway: 'Inherit when the relationship is true is-a. Otherwise reach for a mixin or composition.',
            },
            {
              id: 'm0-t19',
              title: 'Mixins with with — Composition over Inheritance',
              explain: 'Mixins let you reuse a class body across unrelated types without diamond-inheritance pain.',
              analogy: 'Picture a **Mysuru palace court musician**. He is fundamentally a **Carnatic vocalist** (his base class), but over thirty years he layers in **Hindustani tabla rhythms from his ustad in Dharwad**, **saxophone improvisation from a Goan jazz colleague**, and **mridangam patterns from a Carnatic guru in Sringeri**. Each skill is a self-contained slice — independent of the others, none the "main" identity. He does not "extend tabla" or "inherit saxophone"; he **mixes them in** to his core vocalist identity, picking and choosing per concert. Dart mixins work the same way: a class declares its main inheritance via `extends`, then **composes additional behaviour slices** via `with Mixin1, Mixin2`. No diamond inheritance pain, no rigid hierarchy.',
              theory: `A **mixin** is a slice of reusable behaviour that can be applied across unrelated classes without traditional inheritance. Declared with \`mixin Name { ... }\`, applied with \`class Foo extends Bar with Name1, Name2 { ... }\`.\n\n\`\`\`dart\nmixin Loggable {\n  void log(String msg) {\n    print('[\${runtimeType}] \$msg');\n  }\n}\n\nmixin Timestamped {\n  DateTime get createdAt => DateTime.now();\n}\n\nclass Cart with Loggable, Timestamped {\n  Cart(this.userId);\n  final String userId;\n}\n\nvoid main() {\n  final c = Cart('u-42');\n  c.log('Created');           // from Loggable\n  print(c.createdAt);          // from Timestamped\n}\n\`\`\`\n\n**Multiple mixins** can be applied: \`class C extends A with M1, M2, M3\`. They are applied **in order** — later mixins override earlier ones if they declare the same method. The class's own methods override everything.\n\nA mixin can declare **abstract methods or fields** that the consuming class must provide, enabling "behaviour that needs a name field"-style patterns.\n\n\`mixin X on Y\` restricts a mixin to be used only by classes that extend \`Y\` — so the mixin can safely call \`Y\`'s methods.\n\n**When to reach for what**:\n- **\`extends\`** — a true is-a relationship; you need exactly one parent.\n- **\`with\` (mixin)** — you want to reuse a slice of behaviour across unrelated types.\n- **\`implements\`** — you want only the public **interface** of another class (no body inheritance); your class must reimplement everything.`,
              whyItMatters: 'Flutter\'s `State<T>`, `ChangeNotifier`, `WidgetsBindingObserver`, `TickerProviderStateMixin`, `SingleTickerProviderStateMixin` are all mixed in via `with`. You will routinely write `class _HomeState extends State<Home> with WidgetsBindingObserver, TickerProviderStateMixin`. Mixins let you compose Flutter capabilities — animation tickers, lifecycle hooks, gesture handling — without diamond inheritance. Misuse them and you get hard-to-debug method-resolution surprises; use them right and your widgets stay tidy.',
              steps: [
                'Create `mixins.dart`. Define `mixin Loggable { void log(String m) => print(\'[\${runtimeType}] \$m\'); }`.',
                'Apply it: `class Cart with Loggable { Cart(this.userId); final String userId; }`.',
                'Add a second mixin `Timestamped` and apply both: `class Cart with Loggable, Timestamped`.',
                'Demonstrate ordering: declare `mixin A { String tag() => \'A\'; }` and `mixin B { String tag() => \'B\'; }`. Apply both — see `tag()` resolves to whichever comes last (last wins).',
                'Write a mixin with an abstract member: `mixin Validatable { String get fieldName; void validate() { if (fieldName.isEmpty) throw \'Empty!\'; } }`. Apply it to a class that supplies `fieldName`.',
                'Use `mixin X on Y` to constrain: `mixin AuthLogger on Loggable { void logAuth(String user) => log(\'AUTH: \$user\'); }`. Apply it: `class AdminCart with Loggable, AuthLogger`.',
                'Compare with `implements`: write `class FakeCart implements Cart` — see you must reimplement every member (no body inheritance).',
                'Open Flutter source for `WidgetsBindingObserver` to see a real-world mixin used in production widgets.',
              ],
              code: `// mixins.dart — composition with mixins, ordering, on-constraints.
// Run with: dart run mixins.dart

mixin Loggable {
  void log(String msg) {
    print('[\${runtimeType}] \$msg');
  }
}

mixin Timestamped {
  DateTime get createdAt => DateTime.now();
}

mixin Validatable {
  String get fieldName; // abstract — consumer must provide
  void validate() {
    if (fieldName.isEmpty) throw StateError('fieldName must not be empty');
  }
}

// On-clause: AuthLogger can only be mixed into a class that already has Loggable.
mixin AuthLogger on Loggable {
  void logAuth(String user) => log('AUTH event for \$user');
}

class Cart with Loggable, Timestamped, Validatable {
  Cart(this.userId);
  final String userId;

  @override
  String get fieldName => userId;
}

class AdminCart with Loggable, AuthLogger {
  AdminCart(this.adminId);
  final String adminId;
}

void main() {
  final c = Cart('u-42');
  c.log('Cart created');           // [Cart] Cart created
  print(c.createdAt);               // current timestamp
  c.validate();                     // OK — userId is non-empty

  final admin = AdminCart('admin-7');
  admin.log('Login');               // [AdminCart] Login
  admin.logAuth('admin-7');         // [AdminCart] AUTH event for admin-7

  // Ordering demo — last mixin wins on conflicts.
  final mixed = MixedTags();
  print(mixed.tag());               // 'B' — B was applied last
}

mixin TagA { String tag() => 'A'; }
mixin TagB { String tag() => 'B'; }

class MixedTags with TagA, TagB {}`,
              pitfalls: [
                '**Mixin order matters.** The last mixin in the `with` clause wins on conflicting methods. If your `tag()` returns the wrong value, swap the order.',
                '**Mixin declared with `mixin` cannot `extends`.** Mixins live outside the inheritance tree. Use `on` to express "this mixin needs a class that extends X".',
                '**Instance fields in mixins are added to every consumer.** They do not share state across consuming classes — each instance gets its own copy.',
                '**Confusing `with` and `implements`.** `with` brings the body in (you get the method implementations). `implements` only enforces the public interface (you must reimplement every member).',
                '**Using a mixin for an is-a relationship.** A `Cat with Animal` reads wrong — Cat IS an Animal, so `extends Animal`. Reserve mixins for slices like Loggable, Cacheable, Timestamped.',
                '**Trying to instantiate a mixin.** `Loggable()` fails — mixins are not standalone classes, they only exist inside a `with` clause.',
                '**Tight coupling between mixins.** Two mixins that call each other\'s methods become impossible to reorder safely. Keep each mixin self-contained.',
                '**Forgetting the `on` constraint.** A mixin that calls `super.something()` needs `on SomeClass` to declare which superclass it expects, otherwise you get a confusing compile error at the application site.',
              ],
              tryIt: `Define \`mixin Cacheable { final Map<String, dynamic> _cache = {}; T? readCache<T>(String key) => _cache[key] as T?; void writeCache<T>(String key, T value) => _cache[key] = value; }\`. Apply it to a class \`Repository\` that fetches user data. **Now extend it** by adding a second mixin \`Expirable\` that wraps \`_cache\` writes with a TTL timestamp and refuses reads after 5 minutes — apply both to Repository and observe the composition. The exercise drills the mixin-stacking pattern that Flutter uses everywhere in its \`State\` classes.`,
              takeaway: 'Mixins for slices of behaviour. Inheritance for identity.',
            },
            {
              id: 'm0-t20',
              title: 'Generics and Type Parameters',
              explain: 'Write one List<T> instead of one class per type. The compiler enforces T at every call site.',
              analogy: 'Picture the **standard Mysuru-style stainless-steel dabba** — three compartments, snap-lock lid, fits in any college bag. You can carry **idli + chutney + sambar** today, **chapathi + dal + pickle** tomorrow, **fried rice + raita + papad** next week. The dabba\'s *shape* is fixed (three compartments, lockable lid, fits in your bag), but the **contents are typed** — you do not pour sambar into the rice compartment, the seal still holds, the lid still fits. **Generics** are exactly that dabba: a single class definition that holds *any* type, where the compiler enforces the type at every use site. `Dabba<Idli>` and `Dabba<Chapathi>` share the same code but the compiler refuses to let you mix them up.',
              theory: `A **generic class** is a class with one or more type parameters: \`class Box<T> { final T item; Box(this.item); }\`. The \`T\` is a placeholder. When you use the class, you supply a real type: \`Box<int> b = Box(5);\` or \`Box<String> s = Box('hi');\`.\n\nThe compiler **substitutes T everywhere** at compile time. \`b.item\` is \`int\` for \`Box<int>\` — try assigning a String and the compiler refuses before the program ever runs.\n\n**Generic functions** work the same way: \`T first<T>(List<T> xs) => xs[0];\`. Call as \`first<int>([1, 2, 3])\` or let inference pick the type: \`first(['a', 'b'])\` returns a \`String\`.\n\n**Type bounds** restrict what \`T\` can be: \`class Sortable<T extends Comparable<T>>\`. Now \`Sortable<int>\` works (int is Comparable to int), but \`Sortable<Widget>\` fails (Widget is not).\n\n**Built-in generics** you already use everywhere: \`List<T>\`, \`Set<T>\`, \`Map<K, V>\`, \`Future<T>\`, \`Stream<T>\`, \`Iterable<T>\`. The \`<T>\` is exactly what makes \`List<int>\` reject a String at compile time, before the bug ever runs in production.\n\nDart generics are **reified** — type arguments are preserved at runtime (unlike Java's erasure). \`myList.runtimeType\` shows \`List<int>\`, and \`if (x is List<int>)\` actually checks the type argument.`,
              whyItMatters: 'Flutter\'s `StreamBuilder<T>`, `FutureBuilder<T>`, `ValueListenableBuilder<T>`, `Provider<T>`, `Consumer<T>` are all generic. You write `StreamBuilder<List<Order>>` and `snapshot.data` is automatically typed as `List<Order>?` — no casts, no runtime guesses. Generics save you from 80% of the cast errors that plague dynamic languages, and they make your IDE\'s autocomplete genuinely useful instead of suggesting every method on `Object`.',
              steps: [
                'Create `generics.dart`. Define `class Box<T> { final T item; Box(this.item); }`.',
                'Build `Box<int>(5)` and `Box<String>(\'hello\')`. Try assigning across — observe the compile error.',
                'Write a generic function: `T first<T>(List<T> xs) => xs.first;`.',
                'Call with explicit and inferred types: `first<int>([1,2,3])` and `first([\'a\',\'b\'])`.',
                'Add a type bound: `T smallest<T extends Comparable<T>>(List<T> xs) { ... }`. Try with `int` (works) and a custom non-Comparable type (fails).',
                'Use a two-parameter generic: `class Pair<A, B> { final A first; final B second; const Pair(this.first, this.second); }`.',
                'Build `Map<String, List<int>>` to feel nested generics — read it aloud as "Map from String to List of int".',
                'Open Flutter source for `StreamBuilder<T>` and trace `T` from constructor → `AsyncSnapshot<T>` → `builder` callback parameter.',
              ],
              code: `// generics.dart — generic classes, generic functions, type bounds, nested generics.
// Run with: dart run generics.dart

class Box<T> {
  final T item;
  Box(this.item);

  @override
  String toString() => 'Box<\${T.toString()}>(\$item)';
}

class Pair<A, B> {
  final A first;
  final B second;
  const Pair(this.first, this.second);

  @override
  String toString() => '(\$first, \$second)';
}

class Cache<K, V> {
  final _store = <K, V>{};
  void put(K k, V v) => _store[k] = v;
  V? get(K k) => _store[k];
  bool has(K k) => _store.containsKey(k);
  int get size => _store.length;
}

T first<T>(List<T> xs) => xs.first;

T smallest<T extends Comparable<T>>(List<T> xs) {
  var best = xs.first;
  for (final x in xs) {
    if (x.compareTo(best) < 0) best = x;
  }
  return best;
}

void main() {
  // 1. Generic class — type enforced at use site.
  final b1 = Box<int>(5);
  final b2 = Box<String>('hello');
  print(b1);                                   // Box<int>(5)
  print(b2);                                   // Box<String>(hello)
  // final b3 = Box<int>('oops');             // COMPILE ERROR

  // 2. Generic function with inference vs explicit.
  print(first<int>([1, 2, 3]));               // 1
  print(first(['a', 'b']));                    // a (T inferred as String)

  // 3. Bounded generics.
  print(smallest<int>([5, 1, 9, 3]));         // 1
  print(smallest<String>(['banana', 'apple', 'mango'])); // apple

  // 4. Two-parameter generic.
  final p = Pair<String, int>('age', 30);
  print(p);                                    // (age, 30)

  // 5. Nested generics — Map of String to List of int.
  final scores = <String, List<int>>{
    'Anjali': [82, 88, 91],
    'Pradeep': [75, 70, 80],
  };
  scores.forEach((name, marks) => print('\$name: \${marks.reduce((a, b) => a + b) / marks.length}'));

  // 6. A small typed cache — what every Flutter repository looks like.
  final cache = Cache<String, int>();
  cache.put('anjali', 30);
  cache.put('pradeep', 25);
  print(cache.get('anjali'));                  // 30
  print(cache.size);                           // 2
}`,
              pitfalls: [
                '**Forgetting type arguments.** `List l = [];` defaults to `List<dynamic>` — every operation returns `dynamic` and you lose all type safety. Always write `List<int> l = [];` or `final l = <int>[];`.',
                '**Casting via `as` instead of declaring properly.** Casting hides the real fix: declare the type at the source. Every `as` is a runtime risk.',
                '**Type bounds that are too loose.** `T extends Object` is the implicit default; do not write it. Reach for `T extends Comparable<T>` only when you actually need comparison methods.',
                '**Confusing `T?` and `T extends Object?`.** `T?` is "T or null". `T extends Object?` means "T may itself be a nullable type". They look similar and behave very differently.',
                '**Generic methods on classes without bounds.** `T process<T>(T x) => x;` is fine but boring — without a bound you can do almost nothing useful with T.',
                '**Runtime type-check surprises.** Dart preserves type arguments at runtime, so `myList is List<int>` actually works. But inside a generic method, `if (x is T)` where T is a method-level parameter checks the runtime substitution — sometimes surprising.',
                '**Over-generic APIs.** A function `T foo<T>(T x)` that takes anything and returns the same type is usually the wrong abstraction. Pick a concrete type or add a bound.',
                '**Variance confusion.** Dart generics are **covariant** by default (a `List<int>` is treated as a `List<num>`). This breaks the type system in rare cases — search "Dart covariance" if a method gets a runtime TypeError when assigning to a typed list.',
              ],
              tryIt: `Define \`class Cache<K, V> { final _store = <K, V>{}; void put(K k, V v) => _store[k] = v; V? get(K k) => _store[k]; bool has(K k) => _store.containsKey(k); int get size => _store.length; }\`. Use it to build a \`Cache<String, int>\` storing user IDs to ages. **Now extend it** by adding \`Cache<K, V> filter(bool Function(K, V) test)\` returning a NEW cache with only matching entries. The exercise drills two-parameter generics and the type-flow that powers Flutter's typed builders.`,
              takeaway: 'Generics are how you write a function once and reuse it for any type — type-safely.',
            },
          ],
        },
        {
          id: 'm0-s6',
          title: 'Async and Packages',
          topics: [
            {
              id: 'm0-t21',
              title: 'Future, async, await — Your First Async',
              explain: 'A Future is a promise of a value later. async/await lets you write async code that reads sequentially.',
              analogy: 'Picture **Suma in a Mysuru kitchen preparing Mysore Pak** for Diwali. The recipe is strictly sequential: heat ghee until shimmering, then add sifted besan and stir until brown, then pour in sugar syrup and beat until it pulls away from the pan. **Each step waits for the previous one to finish** — pouring the syrup before the besan is ready ruins the batch. But while the ghee melts (a slow step), Suma is not standing frozen at the stove. She washes the next vessel, lays out the steel tray, calls Anjali to bring more cardamom — **the kitchen keeps running**, only the dependent next step waits. A `Future` is the promise that the ghee will be ready; `await` is Suma checking the pan when she needs to add besan; `async` marks the recipe as one where waiting is allowed.',
              theory: `A \`Future<T>\` is an object that represents a value that will be available **later**. It is Dart's answer to JavaScript's Promise. A Future is in one of three states: **uncompleted**, **completed with a value**, or **completed with an error**.\n\nYou create a Future implicitly any time you call an async API: \`Future<String> name = fetchName();\`. Or explicitly: \`Future.delayed(Duration(seconds: 2), () => 42)\` resolves to 42 after a 2-second pause.\n\nThe \`async\` keyword on a function does two things: (1) it declares that the function returns a \`Future<T>\` (you write the body as if returning \`T\`, the compiler wraps it), and (2) it allows you to use \`await\` inside.\n\n\`await\` pauses the **current async function** until the Future completes, then unwraps the value. Crucially, \`await\` is **not a thread-blocking sleep**. While your function is paused, the Dart event loop is free to run other tasks — UI rendering, other timers, network callbacks. This is **single-threaded concurrency**.\n\n\`\`\`dart\nFuture<String> fetchUserName() async {\n  await Future.delayed(Duration(seconds: 1));\n  return 'Anjali';\n}\n\nvoid main() async {\n  print('Fetching...');\n  final name = await fetchUserName();\n  print('Got \$name');\n}\n\`\`\`\n\nFor errors, wrap \`await\` in \`try / catch\`. Or chain \`.then()\` and \`.catchError()\` if you prefer the callback style — both work, async/await is just syntactic sugar.\n\nMultiple independent Futures can run **in parallel** with \`Future.wait([f1, f2, f3])\`, which returns when all complete (or one errors).`,
              whyItMatters: 'Every Flutter network call, file read, animation, navigation transition, and database query is a Future. The single most common Flutter beginner bug is calling an async function without awaiting it — the UI shows stale data, errors vanish silently, tests fail mysteriously. Master Future and async/await today and 90% of Flutter\'s "why is my data not showing" questions on Stack Overflow are immediately diagnosable.',
              steps: [
                'Create `async_basics.dart`. Write `Future<String> fetchName() async { await Future.delayed(Duration(seconds: 1)); return \'Anjali\'; }`.',
                'In `void main() async { ... }` call `final n = await fetchName(); print(n);`. Run and observe the 1-second pause.',
                'Demonstrate non-blocking: between two awaits, fire `Future.delayed(Duration.zero, () => print(\'meanwhile\'));` and watch the order.',
                'Add error handling: `Future<int> mayFail() async { throw \'Boom\'; }`. Wrap in `try { await mayFail(); } catch (e) { print(\'caught: \$e\'); }`.',
                'Run two slow Futures sequentially with `await a; await b;` (~2s total) vs in parallel with `await Future.wait([a, b])` (~1s). Time both with a Stopwatch.',
                'Use `.then()` callback style on a Future and observe it is equivalent to `await`.',
                'Write `Future<List<String>> fetchOrders() async` that uses `Future.delayed` to mimic a 500ms network call and returns three sample order IDs.',
                'Read about `unawaited(...)` from `package:meta` — when you intentionally fire-and-forget a Future and want the linter to stop warning.',
              ],
              code: `// async_basics.dart — Future, async, await, error handling, parallel execution.
// Run with: dart run async_basics.dart

import 'dart:async';

Future<String> fetchUserName() async {
  await Future.delayed(const Duration(seconds: 1));
  return 'Anjali';
}

Future<int> fetchAge() async {
  await Future.delayed(const Duration(milliseconds: 500));
  return 30;
}

Future<int> mayFail() async {
  await Future.delayed(const Duration(milliseconds: 200));
  throw StateError('Backend on fire');
}

Future<void> main() async {
  print('Start');

  // 1. Sequential await — total ~1.5s.
  final sw1 = Stopwatch()..start();
  final name = await fetchUserName();
  final age = await fetchAge();
  sw1.stop();
  print('Sequential: \$name (\$age) in \${sw1.elapsedMilliseconds} ms');

  // 2. Parallel via Future.wait — total ~1s (the longer of the two).
  final sw2 = Stopwatch()..start();
  final results = await Future.wait([fetchUserName(), fetchAge()]);
  sw2.stop();
  print('Parallel: \${results[0]} (\${results[1]}) in \${sw2.elapsedMilliseconds} ms');

  // 3. Error handling.
  try {
    await mayFail();
  } catch (e) {
    print('Caught: \$e');
  }

  // 4. .then() chain — equivalent to await, older callback style.
  fetchUserName().then((n) => print('via then: \$n'));

  // 5. Non-blocking proof — main keeps doing work while futures pend.
  print('Bottom of main reached');
  await Future.delayed(const Duration(milliseconds: 1500));
  print('Done');
}`,
              pitfalls: [
                '**Forgetting `await`.** `final name = fetchName();` assigns a `Future<String>`, not a String. Print it and you get `Instance of \'Future<String>\'`. Always `await` (or chain with `.then`).',
                '**Forgetting `async` on the wrapper.** Using `await` inside a non-async function is a compile error. Mark the function `async` and let it return `Future<...>`.',
                '**Sequential when you meant parallel.** `await fetch1(); await fetch2();` runs back-to-back. If they are independent, use `Future.wait([fetch1(), fetch2()])` to run them in parallel.',
                '**Unhandled future errors.** A Future that errors with no `catch` becomes an unhandled exception that can crash the isolate. Always wrap `await` in `try/catch` for IO that might fail.',
                '**`await` inside a sync-style loop expecting parallelism.** `for (final id in ids) { await fetch(id); }` is sequential — N requests, N\\*latency total. Use `Future.wait(ids.map(fetch))` for parallel.',
                '**Treating `await` as a thread block.** It is not — the event loop keeps running other callbacks. Long-running CPU work still freezes the UI; use isolates for that (module 5).',
                '**Returning `Future<Future<T>>` by accident.** `Future<T> outer() async { return inner(); }` — if `inner()` itself returns `Future<T>`, you get a `Future<Future<T>>`. Add `await` to flatten: `return await inner();`.',
                '**Using `.then()` and `await` together.** Pick one style. Mixing makes control flow hard to read. async/await is preferred for new code.',
              ],
              tryIt: `Write three async functions that each \`Future.delayed\` for a different duration (500ms, 800ms, 1200ms) and return a different Karnataka temple name. Build a \`Future<List<String>> fetchAllTemples()\` that runs all three in **parallel** and returns the list. Time it with a \`Stopwatch\` — should complete in ~1.2s, not ~2.5s. **Now extend it** by introducing one Future that throws after 300ms and using \`Future.wait(..., eagerError: true)\` to short-circuit. The exercise drills parallel async, error propagation, and the cost difference between sequential and parallel awaits.`,
              takeaway: 'await is a yield point, not a block. The event loop keeps running while you wait.',
            },
            {
              id: 'm0-t22',
              title: 'pubspec.yaml, pub.dev, and Adding Packages',
              explain: 'pubspec.yaml is your dependencies file. dart pub add fetches packages from pub.dev.',
              analogy: 'Picture **Sapna Book House on Residency Road**. You walk in with a wishlist on a slip of paper: *Pearson Mathematics, RD Sharma Class 10, a Karnataka history coffee-table book*. The clerk takes the slip, walks to the back, pulls each title from the shelves, and returns with a stack at the counter. **`pubspec.yaml` is your wishlist slip**. **`dart pub get` is the clerk fetching the books**. **`pub.dev` is the entire Sapna catalogue** — every Dart package the community has ever published, with star ratings, edition numbers, and reviews. The smarter you write your wishlist (exact editions, no orphan titles), the smoother the trip back. The lazier you write it (`any` version, conflicting titles), the more likely you walk out with the wrong stack and a long argument.',
              theory: `\`pubspec.yaml\` is the manifest file at the root of every Dart and Flutter project. It declares the project name, version, Dart SDK constraint, and **dependencies**. Pub uses it to resolve and download packages from **pub.dev** (the official package registry).\n\nKey sections:\n- \`name\` — your package name (snake_case).\n- \`description\` — one-line summary.\n- \`version\` — semantic version like \`1.0.0+1\`.\n- \`environment\` — Dart SDK constraint, e.g. \`sdk: ^3.0.0\`.\n- \`dependencies:\` — runtime packages.\n- \`dev_dependencies:\` — packages only used during development (test runners, linters, code generators).\n\nVersion constraints use the **caret syntax**: \`^1.2.3\` means "any version >= 1.2.3 and < 2.0.0" (Semver-compatible). \`>=1.2.3 <2.0.0\` is the explicit form. \`any\` accepts any version (rarely a good idea).\n\n\`dart pub add http\` adds the \`http\` package to dependencies and runs pub get. \`dart pub get\` downloads all dependencies into the local \`.dart_tool/\` and produces a \`pubspec.lock\` — the lockfile that pins exact resolved versions for reproducible builds. **Always commit \`pubspec.lock\` for application packages; libraries skip it.**\n\nWhen evaluating a package on pub.dev, check four signals: **Likes** (community vote), **Pub Points** (automated quality score out of 160), **Popularity** (downloads percentile), and **last published date** (stale = abandoned). A 100k-download package updated last week beats a 10k-download package that has not seen a commit in two years.`,
              whyItMatters: 'The Flutter ecosystem lives on pub.dev — `http`, `provider`, `dio`, `freezed`, `riverpod`, `firebase_core`. Every real Flutter app pulls in 20–50 dependencies. Knowing how to read a `pubspec.yaml`, evaluate a package, and resolve version conflicts is the difference between an afternoon of productive feature work and three days of "why does flutter pub get fail" debugging. Senior Flutter devs are partly defined by which packages they reach for first.',
              steps: [
                'In your `dart-bootcamp` folder, run `dart create my_pkg` to generate a new package with a default `pubspec.yaml`.',
                '`cd my_pkg` and open `pubspec.yaml` — read every section.',
                'Add the `http` package: `dart pub add http`. Watch `pubspec.yaml` get a new line under `dependencies:` and `pubspec.lock` appear.',
                'Add a dev dependency: `dart pub add --dev test`. See it land under `dev_dependencies:`.',
                'Edit `pubspec.yaml` manually to pin a version: change `http: ^1.2.0` to `http: 1.2.0` (no caret). Run `dart pub get` to re-resolve.',
                'Visit pub.dev/packages/http and read the README, the Versions tab, and the Scores tab. Practise the four-signal scan.',
                'Try adding two conflicting packages — `dart pub add cookie_jar:1.0.0` and `dart pub add some_pkg_that_needs_cookie_jar_2`. Read the resolver error.',
                'Use the package: in `bin/my_pkg.dart` add `import \'package:http/http.dart\' as http;` and run a tiny `http.get` call to confirm it works end-to-end.',
              ],
              code: `# pubspec.yaml — annotated example for a small Dart package that fetches Instagram-style feed JSON.
# Run \`dart pub get\` after editing.

name: feed_fetcher
description: A pure-Dart CLI that fetches and prints a feed JSON.
version: 0.1.0+1
publish_to: 'none' # remove this line if you intend to publish to pub.dev

environment:
  sdk: ^3.0.0          # any Dart 3.x

dependencies:
  http: ^1.2.0          # the official HTTP client — caret means >=1.2.0 <2.0.0
  args: ^2.4.0          # parse command-line flags
  intl: ^0.19.0         # date/number formatting
  collection: ^1.18.0   # extra collection helpers

dev_dependencies:
  test: ^1.24.0         # the canonical test runner
  lints: ^3.0.0         # the official lint set

# ----------------------------------------------------------------
# Equivalent CLI commands you would run instead of editing by hand:
#
#   dart pub add http args intl collection
#   dart pub add --dev test lints
#
# After any change:
#   dart pub get          # download deps, regenerate pubspec.lock
#   dart pub upgrade      # upgrade within constraints
#   dart pub outdated     # see which deps have newer majors
# ----------------------------------------------------------------

# bin/feed_fetcher.dart — minimal usage of the http dep.
#
# import 'dart:convert';
# import 'package:http/http.dart' as http;
#
# Future<void> main() async {
#   final uri = Uri.parse('https://jsonplaceholder.typicode.com/posts?_limit=3');
#   final res = await http.get(uri);
#   if (res.statusCode != 200) {
#     print('Failed: \${res.statusCode}');
#     return;
#   }
#   final List posts = jsonDecode(res.body) as List;
#   for (final p in posts) {
#     print('[\${p['id']}] \${p['title']}');
#   }
# }`,
              pitfalls: [
                '**Using `any` for versions.** `http: any` will resolve to the latest version every fresh `pub get`. Tomorrow it breaks your build. Always pin with `^X.Y.Z` minimum.',
                '**Forgetting to commit `pubspec.lock`.** For applications, the lockfile is what guarantees you and your CI build the same bytes. Commit it. Libraries (packages you publish) intentionally skip it.',
                '**Editing `pubspec.yaml` without running `dart pub get`.** The IDE will keep showing the old resolution. Re-run pub get after every edit.',
                '**Ignoring deprecation warnings on pub get.** A package marked discontinued or deprecated will still resolve but is a future bug. Replace early.',
                '**Mixing dependencies and dev_dependencies.** Test runners, mocks, and linters belong under `dev_dependencies`. Putting them under `dependencies` ships dead weight to your end users.',
                '**Adding a package without reading its license.** `pub.dev` shows the license; some are GPL or commercial. For client work, stick to MIT/BSD/Apache-2.0.',
                '**Resolver conflicts with vague constraints.** Two transitive deps both demand different majors of `crypto` — pub fails noisily. Read the error, find the offending intermediate package, and either upgrade or replace.',
                '**Not checking the Pub Points score.** A package with 50/160 has missing analyses, no docs, or platform-incompatible code. Prefer 130+ for production use.',
              ],
              tryIt: `Create a fresh package with \`dart create feed_fetcher\`. Add \`http\` and \`args\` as dependencies and \`test\` as a dev dependency via \`dart pub add\`. In \`bin/feed_fetcher.dart\`, write a CLI that fetches \`https://jsonplaceholder.typicode.com/posts?_limit=5\` using \`package:http\` and prints each post\'s id and title. **Now extend it** by accepting a \`--limit N\` command-line flag using \`package:args\` so the user can override the count. The exercise drills the full add-dep / fetch / parse / use cycle that every real Flutter app does on day one.`,
              takeaway: 'pub.dev is where the Flutter ecosystem lives. Check Likes and Pub Points before adding a dep.',
            },
          ],
        },
        {
          id: 'm0-s7',
          title: 'Dart 3 & Modern Essentials',
          topics: [
            {
              id: 'm0-t23',
              title: 'Enums and Enhanced Enums',
              explain: 'A closed list of named alternatives. Enhanced enums (Dart 2.17+) carry fields, constructors, and methods.',
              analogy: 'Picture the **KSRTC bus class system**. A passenger walking up to the counter can buy exactly four kinds of ticket: **Sarige** (regular non-AC), **Rajahamsa** (semi-deluxe), **Airavat** (Volvo AC), **Ambaari Utsav** (sleeper Volvo). Not three, not five — exactly four. Each class has fixed properties: a base fare per km, AC or not, sleeper or seater, a colour code on the bus body. Walk up asking for "super-deluxe-extra" and the conductor stares blank — the class does not exist. **Enums** are exactly this: a closed, named list of alternatives, each member a singleton. **Enhanced enums** add the per-class data and methods so the enum itself can compute the fare instead of needing a parallel table.',
              theory: `A Dart **enum** declares a fixed list of named constants:\n\n\`\`\`dart\nenum BusClass { sarige, rajahamsa, airavat, ambaari }\n\`\`\`\n\nEach member is a **singleton** — \`BusClass.sarige\` is always the same instance everywhere in your program. Enums are perfect for **closed sets**: payment status, traffic light colour, day of week, environment (\`dev\`/\`staging\`/\`prod\`), screen state (\`idle\`/\`loading\`/\`success\`/\`error\`).\n\n**Enhanced enums (Dart 2.17+)** let you attach fields, a const constructor, and methods to each member:\n\n\`\`\`dart\nenum BusClass {\n  sarige(perKm: 0.8, isAc: false),\n  rajahamsa(perKm: 1.2, isAc: false),\n  airavat(perKm: 2.0, isAc: true),\n  ambaari(perKm: 3.5, isAc: true);\n\n  final double perKm;\n  final bool isAc;\n\n  const BusClass({required this.perKm, required this.isAc});\n\n  double fareFor(int km) => perKm * km;\n}\n\`\`\`\n\nNote the **semicolon** after the last member — it separates the values list from the field/method section.\n\nEvery enum gets three free members: \`.values\` (the full list), \`.name\` (the string name like \`'sarige'\`), and \`.index\` (zero-based position). Use \`MyEnum.values.byName('foo')\` to parse from a string.\n\nA \`switch\` over an enum is **exhaustive by default** in Dart 3 — the compiler warns if you miss a case, and a switch *expression* (\`=>\` form) errors outright.`,
              whyItMatters: 'Every real Flutter app has 5+ enums: app theme (light/dark/system), connection state (idle/loading/success/error), navigation tabs, user role (guest/regular/admin), payment method. Combined with exhaustive switching, enums turn a whole class of "did I forget a state" bugs into compile errors. Enhanced enums let each variant carry its own data without a parallel lookup table — your code stays tight, the IDE autocompletes per-variant fields, and there is no chance of the lookup falling out of sync.',
              steps: [
                'Create `enums.dart`. Define `enum BusClass { sarige, rajahamsa, airavat, ambaari }`.',
                'Print `BusClass.values` to see all members.',
                'Print `BusClass.airavat.name` (gives `airavat`) and `BusClass.airavat.index` (gives 2).',
                'Use it in a switch expression: `final tag = switch (cls) { BusClass.sarige => \'cheap\', ... };`. Try removing one case — see the compile error.',
                'Convert to enhanced enum: add `perKm` and `isAc` fields, a const constructor, and per-member values.',
                'Add a method `double fareFor(int km) => perKm * km;` and call it on each member.',
                'Add a getter `String get tagline => \'$name (${isAc ? "AC" : "non-AC"})\';`.',
                'Parse from a string (e.g. JSON-decoded value): `final cls = BusClass.values.byName(\'airavat\');`. Wrap in try/catch — `byName` throws on unknown names.',
              ],
              code: `// enums.dart — enhanced enums with per-member data and methods.
// Run with: dart run enums.dart

enum BusClass {
  sarige(perKm: 0.8, isAc: false, isSleeper: false),
  rajahamsa(perKm: 1.2, isAc: false, isSleeper: false),
  airavat(perKm: 2.0, isAc: true, isSleeper: false),
  ambaari(perKm: 3.5, isAc: true, isSleeper: true);

  final double perKm;
  final bool isAc;
  final bool isSleeper;

  const BusClass({required this.perKm, required this.isAc, required this.isSleeper});

  double fareFor(int km) => perKm * km;
  String get tagline =>
      '\$name — \${isAc ? "AC" : "non-AC"}, \${isSleeper ? "sleeper" : "seater"}';
}

void main() {
  // 1. Iterate every member, compute a Bengaluru–Mangaluru (350 km) fare.
  for (final c in BusClass.values) {
    print('\${c.tagline}: ₹\${c.fareFor(350).toStringAsFixed(0)}');
  }

  // 2. Switch expression — exhaustive over the closed set.
  final myClass = BusClass.airavat;
  final greeting = switch (myClass) {
    BusClass.sarige => 'Bare-bones, fastest cheap fare.',
    BusClass.rajahamsa => 'Reasonably comfy, no AC.',
    BusClass.airavat => 'Volvo AC — nap on the road.',
    BusClass.ambaari => 'Sleeper Volvo — wake up at the destination.',
  };
  print(greeting);

  // 3. Parse from a string (e.g. from JSON or a CLI arg).
  try {
    final fromJson = BusClass.values.byName('airavat');
    print('Parsed: \${fromJson.tagline}');
  } on ArgumentError catch (e) {
    print('Unknown class: \$e');
  }

  // 4. Filter — find all AC classes.
  final acOnly = BusClass.values.where((c) => c.isAc).toList();
  print('AC classes: \${acOnly.map((c) => c.name).join(", ")}');
}`,
              pitfalls: [
                '**Forgetting the semicolon** between the last enum value and the field/method section. The semicolon is what tells Dart "values list ends, declarations begin". Skip it and the parser fails confusingly.',
                '**Treating `.name` as fully qualified.** `BusClass.airavat.name` is `"airavat"`, not `"BusClass.airavat"`. Use `\'\${runtimeType}.\$name\'` if you want both.',
                '**Switching non-exhaustively.** Modern Dart (3.x) warns or errors when you miss an enum value in a switch. Always cover every member explicitly — adding a `default` defeats the safety net.',
                '**Storing enums as `index` in JSON.** `enum.index` shifts if you reorder members — a guaranteed roundtrip bug after any refactor. Always serialize as `name` (string) and parse with `byName`.',
                '**Comparing enums to strings.** `BusClass.airavat == \'airavat\'` is always false. Use the enum value directly or compare `.name`.',
                '**Mutable fields in enhanced enums.** Members are singletons — a mutable field is shared across the entire program. Always use `final`.',
                '**`byName` throws on unknown.** It throws `ArgumentError` for unknown names. Wrap in try/catch, or use `firstWhereOrNull` from `package:collection` for safe lookup.',
                '**Skipping the const constructor.** Enhanced enums require a `const` constructor. Drop the `const` and Dart refuses to compile.',
              ],
              tryIt: `Define \`enum OrderStatus { pending, accepted, preparing, outForDelivery, delivered, cancelled }\` as an enhanced enum where each value carries \`bool isTerminal\` and \`String customerMessage\`. Write \`String greet(OrderStatus s)\` using a switch expression that returns the customer-facing message. **Now extend it** by adding a method \`bool canCancel()\` that returns true only for non-terminal pre-delivery states, and feel how the per-member data eliminates a parallel lookup table.`,
              takeaway: 'Enums close the set. Enhanced enums close the set with data and methods.',
            },
            {
              id: 'm0-t24',
              title: 'Records and Destructuring',
              explain: 'Records (Dart 3) are anonymous, immutable bundles of values with built-in equality. Destructuring unpacks them into variables.',
              analogy: 'Picture grabbing an **auto fare receipt at a Bengaluru meter** — the printout has *fare, distance, duration, paymentMode* on one tiny strip of paper. You do not file it away as a "Receipt object" with a name and a table row — it is a **bundle for one transaction**, you read the four values and toss the paper. **Records** in Dart 3 are exactly that: a quick way to bundle a few values together with names and types, without writing a whole class. When you only need to *return three values from a function* or *pass a small tuple through a callback*, records save you the ceremony of declaring a class for something that lives for one expression.',
              theory: `A **record** is an anonymous, immutable bundle of values introduced in Dart 3. The syntax uses parentheses:\n\n\`\`\`dart\nfinal point = (3, 4);                                    // positional\nfinal user = (name: 'Anjali', age: 30);                  // named\nfinal order = ('ORD-1', amount: 250.0, paid: true);      // mixed\n\`\`\`\n\nAccess **positional fields** with \`.\$1\`, \`.\$2\`, \`.\$3\` (one-indexed). Access **named fields** by name:\n\n\`\`\`dart\nprint(point.\$1);     // 3\nprint(user.name);     // Anjali\n\`\`\`\n\n**Records have value equality** out of the box: \`(1, 2) == (1, 2)\` is true. \`hashCode\` is auto-generated. So records work as Map keys and Set elements without any boilerplate — a common reason for choosing them over a quick class.\n\n**Destructuring** unpacks a record into individual variables in one line:\n\n\`\`\`dart\nfinal (x, y) = point;\nfinal (:name, :age) = user;       // shorthand for (name: name, age: age)\n\`\`\`\n\n**Records as return types** let a function return multiple values without a wrapper class:\n\n\`\`\`dart\n(int, String) parseLine(String input) {\n  final parts = input.split(':');\n  return (int.parse(parts[0]), parts[1]);\n}\n\nfinal (id, name) = parseLine('42:Anjali');\n\`\`\`\n\nRecords pair beautifully with **pattern matching in switch expressions** — the same shape that destructures here also matches in \`case\` clauses.`,
              whyItMatters: 'Records cut 80% of the trivial "I need a wrapper class for two return values" chore. They pair perfectly with pattern matching for clean state branching, and they are the idiomatic answer when you find yourself reaching for `Tuple2` from `package:tuple` (which is now obsolete). In Flutter, records are excellent for local bundles you do not want to formalize as a model class — `(width: w, height: h)` for a measurement, `(loading: true, data: null, error: null)` for a temporary state shape.',
              steps: [
                'Create `records.dart`. Define `final point = (3, 4);` and print `point.\$1` and `point.\$2`.',
                'Define a named record: `final user = (name: \'Anjali\', age: 30);`. Print `user.name`.',
                'Test value equality: `print((1, 2) == (1, 2));` (true) vs `print([1, 2] == [1, 2]);` (false — lists use identity).',
                'Destructure positional: `final (x, y) = point; print(x); print(y);`.',
                'Destructure named with shorthand: `final (:name, :age) = user;`.',
                'Return a record from a function: write `(int, String) parseLine(String s)` and destructure the call site.',
                'Use a record as a Map key: `final cache = <(int, int), String>{}; cache[(0, 0)] = \'origin\';`.',
                'Combine with switch patterns: `final tag = switch (point) { (0, 0) => \'origin\', (_, 0) => \'on x-axis\', _ => \'somewhere else\' };`.',
              ],
              code: `// records.dart — positional, named, mixed; destructuring; function returns; patterns.
// Run with: dart run records.dart

void main() {
  // 1. Positional record.
  final point = (3, 4);
  print('point: \${point.\$1}, \${point.\$2}');

  // 2. Named record.
  final user = (name: 'Anjali', age: 30);
  print('user: \${user.name}, age \${user.age}');

  // 3. Value equality — works out of the box.
  print((1, 2) == (1, 2));         // true
  print([1, 2] == [1, 2]);          // false — list identity

  // 4. Destructuring.
  final (x, y) = point;
  final (:name, :age) = user;
  print('destructured: \$x, \$y, \$name, \$age');

  // 5. Function returning a record — no wrapper class needed.
  final (id, label) = parseLine('42:Mysuru');
  print('parsed: id=\$id, label=\$label');

  // 6. Record as Map key — value equality makes this work.
  final cache = <(int, int), String>{};
  cache[(0, 0)] = 'origin';
  cache[(1, 0)] = 'on x-axis';
  print(cache[(0, 0)]);             // origin

  // 7. Pattern match a record in a switch expression.
  final tag = switch (point) {
    (0, 0) => 'origin',
    (_, 0) => 'on x-axis',
    (0, _) => 'on y-axis',
    _ => 'somewhere else',
  };
  print('point is: \$tag');

  // 8. Multi-return for stats.
  final stats = summarize([10, 20, 30, 40]);
  print('avg=\${stats.avg}, max=\${stats.max}, count=\${stats.count}');
}

(int, String) parseLine(String input) {
  final parts = input.split(':');
  return (int.parse(parts[0]), parts[1]);
}

({double avg, int count, int max}) summarize(List<int> nums) {
  final total = nums.reduce((a, b) => a + b);
  return (avg: total / nums.length, count: nums.length, max: nums.reduce((a, b) => a > b ? a : b));
}`,
              pitfalls: [
                '**Confusing positional and named.** `(3, 4)` is positional, `(x: 3, y: 4)` is named. Mixed `(3, y: 4)` is allowed but readability suffers — pick one style per record.',
                '**Records are immutable.** You cannot reassign a field. To "update", build a new record: `final updated = (user.name, age: user.age + 1);`.',
                '**`.\$1` not `.0`.** Record positional accessors are one-indexed: `.\$1`, `.\$2`, `.\$3`. Common typo coming from JS or Python tuples.',
                '**Records are NOT classes.** You cannot add methods to a specific record type. If you need methods on the bundle, convert to a class.',
                '**Using records for things that should be classes.** A "User" with id, name, email, address is a class — give it a name. Records are for ephemeral local bundles, not domain models.',
                '**Records in public APIs.** A function returning `(int, String)` is fine internally but a fragile public API — adding a third field breaks every caller. Use a class for stable APIs.',
                '**Destructuring with wrong arity.** `final (a, b) = (1, 2, 3);` fails — record has 3 fields but you destructured 2. Match exactly or use `_` to ignore.',
                '**Nested destructuring complexity.** `final ((a, b), c) = ((1, 2), 3);` works but quickly becomes unreadable. Limit to one level.',
              ],
              tryIt: `Write \`({double avg, int count, int max}) summarize(List<int> nums)\` that returns a named record. Use it: \`final (:avg, :count, :max) = summarize([10, 20, 30, 40]);\` (note the \`:name\` shorthand). **Now extend it** with a switch expression that classifies the result: \`final tag = switch (summarize(scores)) { (:final avg, count: 0, max: _) => 'no data', (avg: _, :final count, max: > 90) => 'top performer', _ => 'normal' };\`. The exercise drills records, destructuring, and the new pattern syntax all in one shot.`,
              takeaway: 'Records bundle a few values. Classes bundle a name with values.',
            },
            {
              id: 'm0-t25',
              title: 'Sealed Classes and Exhaustive Switching',
              explain: 'A sealed class restricts its subtypes to one library so the compiler can verify a switch covers every variant.',
              analogy: 'Picture a **food-delivery cloud kitchen status board** in Bengaluru. Every order on the screen is in exactly one of four states: **Placed**, **Cooking**, **Dispatched**, **Delivered**. Not three, not five — the board software literally cannot represent "AlmostCooking" or "MaybeDelivered" because those states do not exist in the system. When the kitchen lead taps "next status" the board *must* know what to do for every possible current state, or the tap does nothing. **Sealed classes** are exactly this: a closed family of subtypes, the compiler knows the full list at compile time, and a `switch` over them must handle every member or the build fails.',
              theory: `A **sealed class** (Dart 3) is an abstract class whose subtypes are **restricted to the same library**. The compiler can therefore enumerate every possible subtype, which lets \`switch\` enforce **exhaustiveness**.\n\n\`\`\`dart\nsealed class OrderStatus {}\n\nclass Placed extends OrderStatus {\n  final DateTime placedAt;\n  Placed(this.placedAt);\n}\n\nclass Cooking extends OrderStatus {\n  final String chefName;\n  Cooking(this.chefName);\n}\n\nclass Delivered extends OrderStatus {\n  final DateTime deliveredAt;\n  Delivered(this.deliveredAt);\n}\n\nclass Cancelled extends OrderStatus {\n  final String reason;\n  Cancelled(this.reason);\n}\n\`\`\`\n\nNow every \`switch\` over an \`OrderStatus\` must cover all four — adding a fifth subtype later forces every switch in the codebase to be updated, surfacing exactly where the new state needs handling.\n\n\`\`\`dart\nString describe(OrderStatus s) => switch (s) {\n  Placed(:final placedAt) => 'Placed at \$placedAt',\n  Cooking(:final chefName) => 'Chef \$chefName is cooking',\n  Delivered(:final deliveredAt) => 'Delivered \$deliveredAt',\n  Cancelled(:final reason) => 'Cancelled: \$reason',\n};\n\`\`\`\n\nThe \`Placed(:final placedAt)\` pattern matches a \`Placed\` instance AND destructures its \`placedAt\` field into a local variable in one go.\n\n**Sealed vs enum**: use **enum** when each variant is a singleton with the same shape. Use **sealed** when each variant carries its own fields and lifecycle. Sealed is the **algebraic data type (ADT)** pattern from functional languages, finally first-class in Dart.`,
              whyItMatters: 'Modeling app state with sealed classes turns "what should happen in this state" into a compile-time check. Riverpod\'s `AsyncValue<T>`, modern Bloc state classes, and most Flutter app-state libraries use sealed classes for exhaustive state handling. One forgotten `case` becomes a build error, not a 2 AM crash report. Sealed classes are also the canonical way to model success/error result types, payment outcomes, navigation events, and any other "one of N" domain concept.',
              steps: [
                'Create `sealed.dart`. Define `sealed class OrderStatus {}` and four subclasses with their own fields.',
                'Write `String describe(OrderStatus s)` using a switch expression — observe the IDE complains until all four cases are covered.',
                'Use destructuring patterns: `Placed(:final placedAt) => \'at $placedAt\'`.',
                'Add a fifth subclass `OutForDelivery` and watch every switch over `OrderStatus` light up red.',
                'Compare with regular `abstract class` — note the switch no longer enforces exhaustiveness without the `sealed` keyword.',
                'Build a generic result type: `sealed class Result<T> {} class Ok<T> extends Result<T> { final T value; Ok(this.value); } class Err<T> extends Result<T> { final Object error; Err(this.error); }`.',
                'Try extending a sealed class from a different library file — observe the compile error.',
                'Add a `default` case to one of your switches — observe the exhaustive check is silenced (and avoid this in production).',
              ],
              code: `// sealed.dart — sealed hierarchy + exhaustive switch + destructuring patterns.
// Run with: dart run sealed.dart

sealed class OrderStatus {}

class Placed extends OrderStatus {
  final DateTime placedAt;
  Placed(this.placedAt);
}

class Cooking extends OrderStatus {
  final String chefName;
  final int eta;
  Cooking(this.chefName, this.eta);
}

class Delivered extends OrderStatus {
  final DateTime deliveredAt;
  Delivered(this.deliveredAt);
}

class Cancelled extends OrderStatus {
  final String reason;
  Cancelled(this.reason);
}

String describe(OrderStatus s) => switch (s) {
      Placed(:final placedAt) => 'Placed at \$placedAt',
      Cooking(:final chefName, :final eta) => 'Chef \$chefName cooking, ETA \$eta min',
      Delivered(:final deliveredAt) => 'Delivered at \$deliveredAt',
      Cancelled(:final reason) => 'Cancelled: \$reason',
    };

// Generic result type — the canonical FP-style ADT.
sealed class Result<T> {}

class Ok<T> extends Result<T> {
  final T value;
  Ok(this.value);
}

class Err<T> extends Result<T> {
  final Object error;
  Err(this.error);
}

String render(Result<int> r) => switch (r) {
      Ok(:final value) => 'Got \$value',
      Err(:final error) => 'Failed: \$error',
    };

void main() {
  final history = <OrderStatus>[
    Placed(DateTime.now().subtract(const Duration(minutes: 30))),
    Cooking('Pradeep', 12),
    Delivered(DateTime.now()),
    Cancelled('Customer unreachable'),
  ];

  for (final s in history) {
    print(describe(s));
  }

  print(render(Ok(42)));
  print(render(Err('Network down')));
}`,
              pitfalls: [
                '**Sealed is library-private, not file-private.** Subclasses can live in the same library across multiple files via `part of`, but never in a different library. Choose your library boundary deliberately.',
                '**Forgetting destructuring in patterns.** `case Placed(:final placedAt)` extracts the field into a local. `case Placed()` only matches the type without binding. Both are valid — pick by need.',
                '**Statement-form switch without exhaustive checking.** Statement-form `switch (s) { case ...: ...; }` is NOT exhaustive. Only the **expression form** with `=>` enforces it. Or use `final switch` syntax.',
                '**Adding `default` defeats the purpose.** A `default` clause silences the exhaustive check. Avoid unless you genuinely mean "and anything else, ignore the type system".',
                '**Mixing sealed with non-sealed extends.** Once a class is sealed, subclasses themselves are NOT automatically sealed. A non-sealed subclass can be further extended freely — the seal only restricts direct subtypes of the sealed class.',
                '**Sealed without subclasses.** Compiles, but useless. The whole point is the closed list of variants.',
                '**Trying to instantiate the sealed class itself.** Sealed classes are abstract — you cannot create a bare instance of `OrderStatus`. Always pick a subclass.',
                '**JSON deserialization is manual.** Sealed classes need a `factory OrderStatus.fromJson(Map j) => switch (j[\'type\']) { \'placed\' => Placed(...), ... };`. Code generators like `freezed` automate this — worth adopting once your model count grows.',
              ],
              tryIt: `Define \`sealed class FetchResult<T> {}\` with subclasses \`Loading<T>\`, \`Success<T>\` (with a \`T data\` field), and \`Failure<T>\` (with \`Object error\` and \`StackTrace trace\` fields). Write \`String render(FetchResult<int> r)\` that switches over the result and returns the right rendering. **Now extend it** by adding a fourth subclass \`Idle<T>\` and feel every switch in your code break until you handle the new case. The exercise drills the exact pattern Flutter\'s \`AsyncValue<T>\` and modern Bloc state classes use.`,
              takeaway: 'Sealed classes are enums with fields. The switch must handle every variant or the build fails.',
            },
            {
              id: 'm0-t26',
              title: 'Extension Methods',
              explain: 'Add methods, getters, and operators to types you do not own — String, int, List, even classes from other packages.',
              analogy: 'Picture **Karthik the retired tailor** running an alterations stall in **Chickpet**. Customers walk in with off-the-rack shirts from Reliance Trends or Westside — Karthik does not own those brands, did not stitch them, has no contract with the manufacturers. But he can still **add buttons, take in the seams, lengthen the cuffs, embroider a name on the pocket**. The original Reliance label stays unchanged; the shirt looks identical from the outside, but now it fits perfectly. **Extension methods** let you do the same to types you do not own — `String`, `int`, `List<T>`, even classes from someone else\'s package — adding methods that *feel* native, without forking the source or wrapping the type.',
              theory: `An **extension** adds methods, getters, setters, and operators to an existing type without modifying it. Declared with \`extension Name on Type { ... }\`:\n\n\`\`\`dart\nextension StringX on String {\n  bool get isPalindrome {\n    final lower = toLowerCase();\n    return lower == lower.split('').reversed.join();\n  }\n\n  String repeat(int n) => List.filled(n, this).join();\n}\n\nvoid main() {\n  print('madam'.isPalindrome);     // true\n  print('hi'.repeat(3));            // hihihi\n}\n\`\`\`\n\nThe \`Name\` (StringX) is optional but recommended — it lets you \`show\` or \`hide\` specific extensions in import statements.\n\nExtensions work on any type: built-ins (\`String\`, \`int\`, \`List\`), generic types (\`List<T>\`, \`Future<T>\`), and other people\'s classes from a \`package:\`.\n\n**Generic extensions** parameterize over the receiver:\n\n\`\`\`dart\nextension ListX<T> on List<T> {\n  T? get firstOrNull => isEmpty ? null : first;\n}\n\`\`\`\n\nExtensions resolve **statically** at compile time based on the declared type of the receiver, not the runtime type. This is the main difference from real instance methods: a \`dynamic\` variable cannot use extensions because the compiler does not know the type.\n\nYou can also extend with **operators** and **setters**, not just methods.`,
              whyItMatters: 'Flutter\'s `BuildContext` is the canonical extension target — `context.theme`, `context.read<T>()`, `context.go(\'/home\')` are all extension methods from third-party packages. Extensions let you grow the standard library to fit your project\'s vocabulary without subclassing or wrapping. They are the cleanest way to add domain-specific helpers (`order.isPaid`, `price.rupees`, `date.kannadaShort`) that read like native methods at the call site, while keeping your model classes lean.',
              steps: [
                'Create `extensions.dart`. Define `extension StringX on String { String get reversed => split(\'\').reversed.join(); }`.',
                'Use it: `print(\'Karnataka\'.reversed);`.',
                'Add a method to the same extension: `String repeat(int n) => List.filled(n, this).join();`.',
                'Define `extension IntX on int { String get rupees => \'₹\$this\'; }` and use `100.rupees`.',
                'Generic extension: `extension ListX<T> on List<T> { T? get firstOrNull => isEmpty ? null : first; }`. Use on `<int>[].firstOrNull`.',
                'Operator extension: add `List<int> operator +(List<int> other)` to `extension VectorMath on List<int>` and try `[1,2,3] + [10,20,30]`.',
                'Use `show` and `hide` in imports: `import \'extensions.dart\' show StringX;` to control which extensions are visible.',
                'Try calling an extension on a `dynamic` variable — observe it fails because extensions need the static type at compile time.',
              ],
              code: `// extensions.dart — extensions on String, int, List<T>, plus an operator.
// Run with: dart run extensions.dart

extension StringX on String {
  String get reversed => split('').reversed.join();
  String repeat(int n) => List.filled(n, this).join();
  bool get isPalindrome {
    final lower = toLowerCase();
    return lower == lower.reversed;
  }
}

extension IntX on int {
  String get rupees => '₹\$this';
  // Indian-style comma grouping: 12,34,567 (lakh/crore separators).
  String get rupeesIndian {
    final s = toString();
    if (s.length <= 3) return '₹\$s';
    final last3 = s.substring(s.length - 3);
    var rest = s.substring(0, s.length - 3);
    final buf = StringBuffer();
    while (rest.length > 2) {
      buf.write(',\${rest.substring(rest.length - 2)}');
      rest = rest.substring(0, rest.length - 2);
    }
    return '₹\$rest\${buf.toString().split(',').reversed.join(',')},\$last3';
  }
}

extension ListX<T> on List<T> {
  T? get firstOrNull => isEmpty ? null : first;
  T? get lastOrNull => isEmpty ? null : last;
}

extension VectorMath on List<int> {
  List<int> operator +(List<int> other) =>
      [for (var i = 0; i < length; i++) this[i] + other[i]];
}

void main() {
  // 1. String extensions.
  print('Karnataka'.reversed);          // akatanrak
  print('hi'.repeat(3));                 // hihihi
  print('madam'.isPalindrome);           // true

  // 2. Int extensions.
  print(100.rupees);                     // ₹100
  print(1234567.rupeesIndian);           // ₹12,34,567

  // 3. Generic list extensions.
  print(<int>[].firstOrNull);            // null
  print([1, 2, 3].lastOrNull);           // 3

  // 4. Operator extension.
  print([1, 2, 3] + [10, 20, 30]);       // [11, 22, 33]

  // 5. Extensions stack — call multiple on one chain.
  print('Bengaluru'.reversed.repeat(2));
}`,
              pitfalls: [
                '**Extensions resolve statically.** A method on `dynamic` cannot find an extension. If you need polymorphic dispatch, use a real method on a class.',
                '**Conflicting extension methods.** Two imported extensions both define `String.foo()` and Dart errors. Use `show`/`hide` in import statements or call explicitly: `StringX(\'hi\').foo()`.',
                '**Extension on nullable types.** `extension on String?` is allowed and useful for `?.foo` chains. But `extension on String` does NOT match a `String?` receiver — distinguish carefully.',
                '**Hidden behaviour.** Extensions feel like native methods, so a reader may not realize `context.go(...)` lives in `package:go_router`. Document or import explicitly to keep magic readable.',
                '**Overusing extensions on common types.** Adding `String.toAnything()` for every conversion clutters autocomplete. Group related helpers in one named extension per concern.',
                '**Generic extension type-arg inference.** `[1, 2, 3].groupBy((x) => x.isEven)` — Dart cannot always infer the K type. Specify when needed: `.groupBy<bool>(...)`.',
                '**Calling `this` inside an extension.** Inside an extension, `this` is the receiver — works fine, but some lint rules flag explicit `this`. `this.length` and `length` are equivalent.',
                '**Performance assumption.** Extensions compile to plain static method calls — no runtime dispatch cost. But there is also no virtual dispatch, so they are not OO methods. They cannot be overridden by subclasses.',
              ],
              tryIt: `Define \`extension RupeeFormatter on num { String get rupees => '₹\${toStringAsFixed(2)}'; }\`. Then add a second method that formats as Indian-style commas (e.g. \`1234567 → ₹12,34,567.00\`). **Now extend it** with \`extension DateX on DateTime { String get kannadaShort => ...; }\` returning a Karnataka-friendly short date like \`30 Apr\` or \`Tue 30/4\`. The exercise drills extension declaration plus the realistic currency and date formatting that every Flutter app reaches for in week one.`,
              takeaway: 'Extensions add methods to types you do not own. Use them to grow the standard library to fit your domain.',
            },
            {
              id: 'm0-t27',
              title: 'Exception Handling — try, catch, finally, throw',
              explain: 'Throw exceptions to signal failure. Catch them to recover. Finally runs cleanup either way. Custom exception classes name the trouble.',
              analogy: 'Picture a **KSEB power cut at home** while Suma is cooking dinner. The cooking is the **try block** — she optimistically assumes the power stays on, the induction works, the rice cooker sings its done-tune. Halfway through, the power dies — that is an **exception thrown** by the universe. Suma\'s response is the **catch block**: switch to the gas stove, light it manually, finish the curry. The **finally block** runs no matter what — clean up the kitchen, put the dishes on the table, sit down to eat. **Custom exceptions** are the specific shapes of trouble: `CylinderEmptyException`, `WaterTankEmptyException`, `NoMatchboxException` — each type tells you exactly what went wrong and lets the catch block decide what to do.',
              theory: `Dart\'s exception model has four moving parts.\n\n**\`throw\`** raises an exception. Anything is throwable, but the convention is to throw an \`Exception\` or \`Error\` subclass:\n\n\`\`\`dart\nthrow FormatException('Bad date string: \$input');\n\`\`\`\n\n**\`try / catch\`** intercepts exceptions. Use \`on Type catch (e)\` to filter by type:\n\n\`\`\`dart\ntry {\n  final result = riskyOperation();\n} on FormatException catch (e) {\n  print('Format issue: \$e');\n} on TimeoutException catch (e, stack) {\n  print('Timed out: \$e\\n\$stack');\n} catch (e) {\n  print('Unknown error: \$e');\n}\n\`\`\`\n\n**\`catch (e)\`** without \`on\` catches everything. **\`catch (e, stack)\`** also captures the stack trace.\n\n**\`finally\`** always runs — success, exception, or early return. Use it for cleanup (closing files, releasing resources, hiding spinners):\n\n\`\`\`dart\ntry {\n  doWork();\n} finally {\n  cleanup();\n}\n\`\`\`\n\n**Custom exceptions** are normal classes that implement \`Exception\`:\n\n\`\`\`dart\nclass CylinderEmptyException implements Exception {\n  final String message;\n  CylinderEmptyException([this.message = 'Gas cylinder is empty']);\n  @override\n  String toString() => 'CylinderEmptyException: \$message';\n}\n\`\`\`\n\n**\`Exception\` vs \`Error\`** — convention: \`Exception\` is for *recoverable* problems (network down, bad input, file missing) that user code should catch. \`Error\` is for *programmer mistakes* (assertion failed, type cast wrong, null check failed) that signal a bug — usually you let \`Error\` crash so the bug surfaces.\n\n**\`rethrow\`** re-raises the current exception while preserving the original stack trace: \`} catch (e) { log(e); rethrow; }\`.`,
              whyItMatters: 'Every Flutter app calls APIs that can fail — network, file I/O, JSON parsing, database queries, platform channels, payment gateways. Without exception handling, a single bad response crashes the screen and the user sees a blank page. With clean `try/catch` you turn errors into UI states ("Something went wrong, retry?"). Senior Flutter developers are partly defined by how cleanly they convert exceptions into recovery flows the user can act on.',
              steps: [
                'Create `exceptions.dart`. Write `int divide(int a, int b) { if (b == 0) throw ArgumentError(\'Cannot divide by zero\'); return a ~/ b; }`.',
                'Wrap the call: `try { print(divide(10, 0)); } on ArgumentError catch (e) { print(\'Caught: $e\'); }`.',
                'Add a generic `catch (e) { ... }` after the typed catches as a fallback.',
                'Use `catch (e, stack)` and print the stack trace.',
                'Add `finally { print(\'Cleanup\'); }` and observe it runs in both success and failure paths.',
                'Define `class CylinderEmptyException implements Exception { ... }` with a `toString()` override and throw it from a function.',
                'Use `rethrow` inside a catch to log-and-propagate without losing the original stack.',
                'Pair with async: `try { await fetchData(); } on TimeoutException catch (_) { showError(); } finally { stopSpinner(); }`.',
              ],
              code: `// exceptions.dart — throw, multiple typed catches, finally, custom exceptions, rethrow.
// Run with: dart run exceptions.dart

// 1. Custom exception type.
class CylinderEmptyException implements Exception {
  final String message;
  CylinderEmptyException([this.message = 'Gas cylinder is empty']);
  @override
  String toString() => 'CylinderEmptyException: \$message';
}

class NoNetworkException implements Exception {
  @override
  String toString() => 'NoNetworkException: Wifi and 4G both down';
}

// 2. A function that throws different exceptions for different failures.
String cookDinner({required bool hasGas, required bool hasMatchbox}) {
  if (!hasGas) throw CylinderEmptyException();
  if (!hasMatchbox) throw StateError('No matchbox — cannot light the stove');
  return 'Dinner ready: rice, sambar, palya';
}

// 3. Demonstrate the full try/on/catch/finally shape.
Future<String> orderFood() async {
  try {
    await Future.delayed(const Duration(milliseconds: 200));
    throw NoNetworkException();
  } on NoNetworkException catch (e) {
    return 'Recovered: \$e — fell back to cash on delivery';
  } catch (e, stack) {
    return 'Unknown error: \$e\\n\$stack';
  } finally {
    print('Order attempt finished — hide loading spinner');
  }
}

// 4. Rethrow preserves the original stack while still logging.
String parseAge(String s) {
  try {
    return 'Age: \${int.parse(s)}';
  } catch (e) {
    print('Logging bad input: \$s');
    rethrow;                    // caller still sees FormatException
  }
}

Future<void> main() async {
  // Sync exception with multiple typed catches.
  try {
    print(cookDinner(hasGas: false, hasMatchbox: true));
  } on CylinderEmptyException catch (e) {
    print('Recovered: \$e — switch to electric kettle for tea, order dinner');
  } on StateError catch (e) {
    print('Recovered: \$e — borrow lighter from neighbour');
  } finally {
    print('Kitchen always cleaned, no matter what');
  }

  // Async with try/on/finally.
  print(await orderFood());

  // Rethrow demo.
  try {
    parseAge('not a number');
  } on FormatException catch (e) {
    print('Caller saw: \$e');
  }
}`,
              pitfalls: [
                '**Catching everything with bare `catch`.** Hides bugs. Catch specific types first; only fall back to bare `catch` for top-level safety nets that log and re-render.',
                '**Throwing strings.** `throw \'oops\'` works but loses type info, has no stack semantics, and offers no IDE help. Always throw an `Exception` or `Error` subclass.',
                '**Not using `on Type`.** A bare `catch (e)` then `if (e is SomeException)` is verbose. Use `on SomeException catch (e)` directly.',
                '**Forgetting `finally` on resources.** Open file → exception thrown mid-read → file never closed → resource leak. Always close in `finally` (or use any `try-with` patterns the API offers).',
                '**Catching `Error` subclasses by mistake.** `Error` (assertion failures, type errors, range errors) signals programmer bugs — usually let them crash so the bug surfaces, do not silently catch.',
                '**Async without `await` inside the try.** `try { fetchData(); } catch (e) {...}` does NOT catch exceptions from the unawaited Future — they become unhandled. Add `await` inside the try block.',
                '**`throw e` instead of `rethrow`.** `throw e` resets the stack trace to the catch site; `rethrow` preserves the original. Use `rethrow` when you log-and-propagate.',
                '**Eating exceptions silently.** `catch (e) {}` with empty body is the worst. At minimum, log it — preferably re-raise or convert to a UI error state.',
              ],
              tryIt: `Build a \`Future<List<String>> fetchOrders(String userId)\` that throws three custom exceptions on different failure modes: \`NoNetworkException\`, \`UnauthorizedException\`, and \`OrderNotFoundException\`. Write a wrapper \`Future<String> safeOrders(String userId)\` that catches each by type and returns a different user-facing message. Use \`finally\` to log "request finished" in both success and failure cases. **Now extend it** by wrapping unknown exceptions in your own \`UnexpectedException\` using \`rethrow\` so the original stack trace is preserved. The exercise drills the full real-world try/catch/finally pattern Flutter network code uses every day.`,
              takeaway: 'Catch what you can recover from. Let the rest crash so you fix the bug.',
            },
          ],
        },
      ],
      projects: [
        {
          id: 'm0-p1',
          type: 'Mini Project',
          title: 'Filter-Coffee Bill Calculator',
          domain: 'CLI / Pure Dart',
          duration: '2 hours',
          description:
            'A small command-line Dart program that prices filter coffee, dosa and idli orders for a Mysuru darshini. Drills classes, named constructors, collections, and basic Dart formatting before any Flutter UI.',
          tools: ['Dart 3.x', 'dart:io', 'package:args'],
          blueprint: {
            overview:
              'Build a single-file Dart program that reads a list of items and quantities, looks up prices in an in-memory menu, and prints a neatly formatted bill in rupees with GST.',
            functionalRequirements: [
              '**Menu.** Hard-coded `Map<String, double>` with at least 8 darshini items (filter coffee, masala dosa, idli vada, kesari bath, etc.).',
              '**Order input.** Accept items via command-line args in the form `dosa:2 coffee:3 idli:1` or read from stdin if no args.',
              '**Pricing.** For each item, multiply quantity by unit price; reject unknown items with a clear error.',
              '**Tax.** Apply 5% CGST + 5% SGST on the subtotal; print as separate lines.',
              '**Formatting.** Right-align rupee amounts; use `padRight` and `toStringAsFixed(2)`.',
              '**Validation.** Reject negative or zero quantities with a friendly error.',
            ],
            technicalImplementation: [
              '**Dart project.** `dart create -t console-simple bill_app`.',
              '**Menu class.** `class Menu { final Map<String, double> items; const Menu(this.items); double? priceOf(String item) => items[item]; }`.',
              '**Order model.** `class OrderLine { final String item; final int qty; final double unitPrice; OrderLine(this.item, this.qty, this.unitPrice); double get subtotal => qty * unitPrice; }`.',
              '**Args parsing.** Split each token on `:`, parse the int, look up the price.',
              '**Bill builder.** A function returning `String` that joins formatted lines with newlines.',
              '**Edge cases.** Empty order list, unknown item, malformed token (`coffee:abc`).',
            ],
            prompts: [
              {
                step: 1,
                label: 'Scaffold',
                outcome: 'Empty Dart console project that prints a hello message.',
                prompt:
                  'Create a fresh Dart console project named `bill_app` using `dart create -t console-simple bill_app`. Inside `bin/bill_app.dart`, write a `void main(List<String> args)` that prints `Karnataka Filter Coffee — Bill Generator v0.1`. Run it once with `dart run` to confirm.',
              },
              {
                step: 2,
                label: 'Core models',
                outcome: 'Menu and OrderLine classes with sample data.',
                prompt:
                  'Add a `Menu` class holding a `Map<String, double>` with these items: dosa 80, masala_dosa 100, idli 40, vada 50, coffee 35, tea 25, kesari 60, upma 50. Add an `OrderLine` class with item, qty, unitPrice fields and a `subtotal` getter. Instantiate the Menu in main and print all items in alphabetical order with prices right-aligned to 8 chars.',
              },
              {
                step: 3,
                label: 'Order parser',
                outcome: 'CLI args turn into a List<OrderLine>.',
                prompt:
                  'Write `List<OrderLine> parseOrder(List<String> tokens, Menu menu)` that splits each token on `:`, validates the item exists in the menu, validates the quantity is a positive int, and returns the parsed lines. Throw a clear FormatException on bad input. Wire it up in main so `dart run bill_app dosa:2 coffee:3` prints the parsed lines.',
              },
              {
                step: 4,
                label: 'Bill formatter',
                outcome: 'Pretty-printed bill with subtotal, taxes, total.',
                prompt:
                  'Write `String formatBill(List<OrderLine> lines)` that returns a multi-line string: a header, each order line as `dosa x 2 ............ ₹ 160.00`, a divider, subtotal, CGST 5%, SGST 5%, and grand total. Use `padRight` and `toStringAsFixed(2)` for alignment. Print the bill from main.',
              },
              {
                step: 5,
                label: 'Tests',
                outcome: 'Unit tests cover happy path and error cases.',
                prompt:
                  'Add `package:test` as a dev dependency. Create `test/bill_test.dart` with these cases: (1) parsing `dosa:2 coffee:3` returns 2 lines with correct subtotals, (2) parsing `pizza:1` throws because pizza is not on the menu, (3) parsing `dosa:0` throws on non-positive qty, (4) `formatBill([dosa x 1, coffee x 1])` produces a string containing `Total: ₹ 126.50`. Run `dart test` and confirm all green.',
              },
              {
                step: 6,
                label: 'README',
                outcome: 'Short README explaining how to use it.',
                prompt:
                  'Create README.md with three sections: Install (the dart pub get command), Usage (one example command and the expected output), Architecture (a 5-line description of Menu, OrderLine, parseOrder, formatBill). End with a one-line note that this is the pure-Dart warm-up before the Flutter capstones in later modules.',
              },
            ],
            deliverable: 'A `bill_app/` Dart package with passing tests that prints a fully formatted darshini bill from a CLI command.',
          },
        },
        {
          id: 'm0-p2',
          type: 'Capstone',
          title: 'Pure-Dart Instagram Feed Fetcher CLI',
          domain: 'Networking / CLI',
          duration: '1 day',
          description:
            'A pure-Dart command-line program that fetches an Instagram-style feed JSON over HTTP, parses it into typed model classes, and prints a nicely formatted feed to the terminal. The first step in this course\'s Instagram-clone arc — every later module layers Flutter, state, and platform features on top.',
          tools: ['Dart 3.x', 'package:http', 'package:args', 'dart:convert', 'package:test'],
          blueprint: {
            overview:
              'Hit a JSON endpoint that returns a list of posts (use jsonplaceholder.typicode.com/posts as a stand-in for a real Instagram backend), parse the response into Post model objects, and render each post to the terminal. Drills async, classes, generics, error handling, and pubspec workflow.',
            functionalRequirements: [
              '**Fetch.** Call `https://jsonplaceholder.typicode.com/posts?_limit=10` using `package:http`.',
              '**Parse.** Decode JSON into a `List<Post>` where Post is a Dart class with `id`, `userId`, `title`, `body`.',
              '**Render.** Print each post with a divider, a header `[user-N] post-N`, the title in caps, and the body wrapped to 70 chars.',
              '**CLI flags.** `--limit N` to override the default count, `--user N` to filter by userId.',
              '**Error handling.** Network failures (timeout, non-200) print a friendly error and exit 1.',
              '**Caching.** Optional `--cache` flag writes the fetched JSON to `feed_cache.json` and reads from it on subsequent runs (drills `dart:io` File).',
              '**Tests.** Unit tests for JSON parsing and feed-rendering pure functions; mock the HTTP call.',
            ],
            technicalImplementation: [
              '**Project.** `dart create -t console-simple feed_fetcher`.',
              '**Deps.** `dart pub add http args` and `dart pub add --dev test`.',
              '**Post model.** `class Post { final int id; final int userId; final String title; final String body; const Post({required this.id, required this.userId, required this.title, required this.body}); factory Post.fromJson(Map<String, dynamic> j) => Post(id: j[\'id\'] as int, userId: j[\'userId\'] as int, title: j[\'title\'] as String, body: j[\'body\'] as String); }`.',
              '**Service.** `class FeedService { final http.Client client; FeedService(this.client); Future<List<Post>> fetchFeed({int limit = 10}) async { ... } }`.',
              '**Renderer.** Pure `String renderFeed(List<Post> posts)` that returns the formatted output — easy to test.',
              '**Args.** `package:args` ArgParser with `addOption(\'limit\')`, `addOption(\'user\')`, `addFlag(\'cache\')`.',
              '**Cache.** `File(\'feed_cache.json\').writeAsString(json)` and `readAsString()` with a try/catch.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Scaffold',
                outcome: 'Dart console project with http and args deps installed.',
                prompt:
                  'Create a Dart console project: `dart create -t console-simple feed_fetcher`. Cd in. Add deps with `dart pub add http args` and `dart pub add --dev test`. Replace `bin/feed_fetcher.dart` main with a stub that prints `Feed Fetcher v0.1`. Confirm `dart run` succeeds and `pubspec.yaml` shows the three deps.',
              },
              {
                step: 2,
                label: 'Post model + JSON parsing',
                outcome: 'Post class with fromJson and a unit test.',
                prompt:
                  'Create `lib/post.dart` with a `Post` class: `id`, `userId`, `title`, `body`, all `final`, named-required constructor, factory `Post.fromJson(Map<String, dynamic>)`, and `toString()`. Add `test/post_test.dart` with one test that parses a sample JSON map and asserts each field. Run `dart test`.',
              },
              {
                step: 3,
                label: 'FeedService + http call',
                outcome: 'fetchFeed() returns a real List<Post> from the network.',
                prompt:
                  'Create `lib/feed_service.dart` with `class FeedService { final http.Client client; FeedService(this.client); Future<List<Post>> fetchFeed({int limit = 10}) async { ... } }`. Build the URI with the limit query param, call `client.get`, throw on non-200 status, decode the body, map each entry through `Post.fromJson`. In `main`, create a `http.Client()`, call fetchFeed, and print the count.',
              },
              {
                step: 4,
                label: 'Renderer + CLI flags',
                outcome: 'Pretty terminal output controlled by --limit and --user.',
                prompt:
                  'Add `lib/renderer.dart` with a pure function `String renderFeed(List<Post> posts)` that joins each post with a divider line of `=` chars, an uppercase title, and the body. In `bin/feed_fetcher.dart`, use `package:args` to parse `--limit` (default 10) and `--user` (optional int filter). After fetching, optionally filter by userId, render, and print. Run with `dart run feed_fetcher --limit 5 --user 1`.',
              },
              {
                step: 5,
                label: 'Cache flag + error handling',
                outcome: 'Optional file cache and graceful network errors.',
                prompt:
                  'Add a `--cache` flag. When set, after fetching successfully, write the raw JSON to `feed_cache.json`. On subsequent runs with `--cache`, if the file exists, read from it instead of hitting the network. Wrap the http call in try/catch — on `SocketException` or non-200, print a friendly error and `exit(1)`. Verify by disabling wifi and re-running with and without --cache.',
              },
              {
                step: 6,
                label: 'Tests + README',
                outcome: 'Tests for parsing and rendering, README with usage.',
                prompt:
                  'Expand `test/` with tests for renderFeed (asserts the output contains expected substrings) and a FeedService test that uses a `MockClient` from `package:http` to simulate a 200 response. Run `dart test` — all green. Write README.md with sections: Install, Usage (3 example commands), Architecture (Post → FeedService → renderer pipeline), and a one-line forward note: "This is module 0 of the Instagram-clone arc; module 1 wraps a Flutter login + scrolling feed UI around it."',
              },
            ],
            deliverable: 'A working `feed_fetcher` Dart package: `dart run feed_fetcher --limit 5` fetches 5 posts and prints them; `dart test` passes; README explains the architecture and the next module\'s build-on plan.',
          },
        },
      ],
      quiz: [
        {
          id: 'm0-q1',
          q: 'Which keyword guarantees a value can never be null?',
          options: ['var', 'final', 'late', 'A non-nullable type without `?`'],
          answer: 3,
        },
        {
          id: 'm0-q2',
          q: 'What does `Future.wait([a, b, c])` do?',
          options: [
            'Runs a, b, c sequentially and returns when the last finishes.',
            'Runs a, b, c in parallel and returns a List of results when all complete.',
            'Cancels a, b, c if any one fails.',
            'Waits for the first one to complete and returns just that result.',
          ],
          answer: 1,
        },
        {
          id: 'm0-q3',
          q: 'Which constructor flavour lets you return a cached or subclass instance instead of always creating a new one?',
          options: ['Default constructor', 'Named constructor', 'Factory constructor', 'Const constructor'],
          answer: 2,
        },
        {
          id: 'm0-q4',
          q: 'What is the difference between `with` and `extends` in Dart?',
          options: [
            'They are aliases for the same operation.',
            '`extends` is for single inheritance; `with` is for mixing in additional behaviour from mixins.',
            '`with` is only for abstract classes.',
            '`extends` works for classes; `with` works for functions.',
          ],
          answer: 1,
        },
        {
          id: 'm0-q5',
          q: 'In the version constraint `http: ^1.2.0`, which version would NOT be accepted?',
          options: ['1.2.0', '1.4.5', '1.99.0', '2.0.0'],
          answer: 3,
        },
      ],
    },
    {
      id: 'm1',
      title: 'Flutter Fundamentals',
      hours: 14,
      color: 'from-sky-500/20 to-sky-700/10',
      accent: 'sky',
      description:
        'Widgets, layouts, MaterialApp, Scaffold slots, navigation, state, gestures, themes.',
      sections: [
        {
          id: 'm1-s1',
          title: 'Flutter Setup & Project Anatomy',
          topics: [
            {
              id: 'm1-t1',
              title: 'Flutter SDK Setup and flutter doctor',
              explain: 'Install the Flutter SDK and run flutter doctor until every checkmark is green.',
              analogy: 'Suma decides to open a kori rotti tiffin centre on Court Road in Kundapura. To serve her first plate she needs five clearances stamped: trade licence from the Kundapura Town Municipal Council, FSSAI food licence, gas-pipeline inspection certificate, weighing-scale calibration sticker, and the Fisheries Department clearance for her bangda supplier at Gangolli harbour. Miss even one and the municipal officer arrives on day three and locks the shutter. Installing the Flutter SDK is the same five-stamp dance: **SDK files unpacked**, **PATH wired up**, **Android toolchain installed**, **iOS toolchain (Mac only)**, and **Chrome on PATH for Flutter web**. The command `flutter doctor` is your municipal officer doing the rounds — it walks the checklist and tells you exactly which clearance is missing. Run it on a fresh laptop and you see green ticks next to passes and red crosses next to pending items. Your job in your first Flutter hour is simple: turn every cross into a tick.',
              theory: `The Flutter SDK is a single Git repository (~1.5 GB) that bundles the **Dart SDK**, the **Flutter framework code**, the **flutter command-line tool**, and a **DevTools** stack. You never install Dart separately when using Flutter — \`flutter\` ships its own pinned Dart version inside \`bin/cache/dart-sdk/\`.\n\nOn Windows you have three install routes: **the official zip** from flutter.dev/get-started (recommended for first-timers), **Chocolatey** (\`choco install flutter\`), or **fvm** (Flutter Version Manager) for managing multiple versions on the same machine. On macOS use Homebrew (\`brew install --cask flutter\`) or fvm. Linux uses the official tarball or snap. All routes give you the same \`flutter\` executable that **must be on your PATH**.\n\n\`flutter doctor\` runs **seven independent checks**: Flutter version itself, Android toolchain (Android Studio + SDK + JDK), Xcode (Mac only), Chrome (web target), Linux/Windows desktop toolchain, IDE plugins (VS Code or Android Studio), and connected devices. Each check returns ✓ green, ! yellow (warning, not blocker), or ✗ red (blocker). Run \`flutter doctor -v\` for full diagnostic output — it prints exact paths it expected and what it found instead.\n\nThe most common day-one failure is **Android licences not accepted**. Fix it with one command: \`flutter doctor --android-licenses\`, then press \`y\` six times. Without those licences, \`flutter run\` for Android silently fails at the build step. The second most common is **Visual Studio Build Tools missing on Windows** if you target desktop — install the C++ workload from the Visual Studio Installer.`,
              whyItMatters: 'Every Flutter job interview eventually says: clone this repo, run `flutter pub get && flutter run`, fix what breaks. If your local toolchain is half-broken, you waste the first hour googling errors instead of writing code, and your tech lead silently logs you as "needs hand-holding". Beyond interviews, **debugging build failures starts with eliminating SDK problems** — a senior always runs `flutter doctor -v` before opening a bug, because half the time the answer is "your Gradle is out of date" or "your JDK is wrong". Build the muscle now: any Flutter weirdness, first move is `flutter doctor -v`.',
              steps: [
                'Download the Flutter SDK zip from flutter.dev/get-started/install/windows and extract to `C:\\src\\flutter` (avoid `Program Files` — spaces in the path break Gradle).',
                'Add `C:\\src\\flutter\\bin` to your **System** PATH via Edit Environment Variables. Open a **new** PowerShell so it picks up the change.',
                'Run `flutter --version`. Expect a Flutter and Dart version line.',
                'Run `flutter doctor`. Read each row top to bottom — note every ✗.',
                'If Android shows ✗, install Android Studio, open it once to trigger SDK download, then run `flutter doctor --android-licenses` and press `y` to all prompts.',
                'For VS Code: install the **Flutter** extension; it pulls in Dart automatically.',
                'Re-run `flutter doctor`. Aim for all ✓ except possibly desktop targets you do not need.',
                'Bookmark docs.flutter.dev/get-started — the canonical reference.',
              ],
              code: `// terminal_session.txt
// What you should see end-to-end on a fresh Windows install in Kundapura.

PS C:\\Users\\suma> flutter --version
Flutter 3.24.0 - channel stable - https://github.com/flutter/flutter.git
Framework - revision 80c2e84975 (5 weeks ago)
Engine - revision b8800d88be
Tools - Dart 3.5.0 - DevTools 2.37.2

PS C:\\Users\\suma> flutter doctor
Doctor summary (to see all details, run flutter doctor -v):
[OK] Flutter (Channel stable, 3.24.0, on Microsoft Windows [Version 10.0.19045])
[OK] Windows Version (Installed version of Windows is version 10 or higher)
[OK] Android toolchain - develop for Android devices (Android SDK version 34.0.0)
[X]  Chrome - develop for the web (Cannot find Chrome executable)
     Try setting CHROME_EXECUTABLE to a Chrome executable.
[!]  Visual Studio - develop Windows apps
     X Visual Studio not installed; this is necessary for Windows development.
[OK] Android Studio (version 2024.1)
[OK] VS Code (version 1.92.2)
[OK] Connected device (3 available)
[OK] Network resources

! Doctor found issues in 2 categories.

PS C:\\Users\\suma> flutter doctor --android-licenses
All SDK package licenses accepted.

// ---------- minimal first project ----------
PS C:\\Users\\suma> flutter create kundapura_kori
PS C:\\Users\\suma> cd kundapura_kori
PS C:\\Users\\suma\\kundapura_kori> flutter run -d chrome
Launching lib\\main.dart on Chrome in debug mode...
Waiting for connection from debug service on Chrome...`,
              pitfalls: [
                '**Path has spaces.** You extracted to `C:\\Program Files\\flutter`. Gradle chokes on spaces and the build fails with a cryptic Java NPE. Fix: extract to `C:\\src\\flutter` instead.',
                '**PATH not refreshed.** You added the path but `flutter` says command not found. Fix: close every terminal, open a new one. Restart VS Code too — its integrated terminal also caches PATH.',
                '**Android licences unaccepted.** `flutter run` builds forever then fails at signing. Fix: `flutter doctor --android-licenses` then press `y` six times.',
                '**Two Flutter SDKs on PATH.** You installed via Choco and also unzipped manually. Now `flutter --version` shows the wrong one. Fix: pick one, remove the other from PATH.',
                '**JDK version mismatch.** Modern Android Gradle Plugin needs JDK 17+; your machine has JDK 8 from some old project. Fix: install JDK 17 and set JAVA_HOME accordingly.',
                '**Antivirus quarantine.** Corporate Windows AVs flag the Dart VM as suspicious. Fix: whitelist `C:\\src\\flutter\\` in your AV exclusions.',
                '**Running flutter inside the SDK folder.** You ran `flutter create app` while inside `C:\\src\\flutter`. The new project ends up nested. Fix: always cd to a separate workspace folder first.',
                '**Forgetting the Chrome target.** Web debugging needs Chrome on PATH. Fix: install Chrome or set the `CHROME_EXECUTABLE` env var to its path.',
              ],
              tryIt: `Install Flutter, run \`flutter doctor\` and screenshot the output. Then create your first project: \`flutter create namma_kundapura\`, cd into it, and run \`flutter run -d chrome\`. You should see the default counter app open in your browser. **Now extend it** by editing \`lib/main.dart\` — change the AppBar title to "Namma Kundapura" and save. The change appears instantly via hot reload (we cover that in m1-t5). The exercise drills the create→run→edit loop you will repeat every working day as a Flutter dev.`,
              takeaway: 'flutter doctor green ticks first; then write code.',
            },
            {
              id: 'm1-t2',
              title: 'Project Structure: lib, pubspec, android, ios',
              explain: 'Tour the lib, pubspec, android, and ios folders so you stop blindly editing files.',
              analogy: 'Picture the Udupi Krishna Matha bhojanashala on Car Street where they serve free annadana to thousands every day. Walk through it: the **central kitchen** is where the cooks actually prepare bisi bele bath and sambhar — that is your `lib/` folder, the only place real cooking happens. The **prasada storeroom** holds rice, jaggery, and ghee bought from Brahmavar farmers — that is your `assets/` folder. The **trustees\' register** at the entrance lists every supplier and quantity — that is your `pubspec.yaml`, the shopping list. The **south and north gates** (one for devotees, one for delivery trucks) are your `android/` and `ios/` folders — they connect the temple to the outside world but no cooking happens there. And the **accountant\'s ledger** in the back office, where every meal served is audited — that is your `test/` folder. Each room has exactly one purpose. The day you start frying onions in the storeroom or storing rice in the sanctum is the day the temple kitchen falls apart.',
              theory: `When you run \`flutter create my_app\`, Flutter scaffolds about a dozen top-level folders and files. Knowing what each one is for saves you hours of confusion later.\n\n**\`lib/\`** is the **only** place your Dart code lives. The entry point is \`lib/main.dart\` with its \`void main()\` function calling \`runApp()\`. Sub-folders inside \`lib/\` are convention, not enforcement — typical layout is \`lib/screens/\`, \`lib/widgets/\`, \`lib/models/\`, \`lib/services/\`. Anything outside \`lib/\` is **not** part of your shipped app.\n\n**\`pubspec.yaml\`** is your project manifest: name, version, SDK constraints, dependencies, dev_dependencies, asset declarations, and font registrations. It is YAML so indentation matters — two spaces, no tabs ever. Running \`flutter pub get\` reads this file and produces \`pubspec.lock\` (the version-pinned shopping list — commit it to git).\n\n**\`android/\`** and **\`ios/\`** hold the **native shells** Flutter uses to package your Dart code into a real APK or .ipa. These contain Gradle build files, Info.plist, native splash images, signing configs, and platform-specific permissions. You rarely edit them in early projects — but later when you add Firebase, push notifications, or native plugins, you will edit \`AndroidManifest.xml\` and \`Info.plist\` here.\n\n**\`test/\`** holds widget tests and unit tests. **\`integration_test/\`** holds end-to-end tests run on a real device. **\`web/\`** holds the HTML/JS shell for Flutter web. **\`build/\`** is generated output — never commit it (\`.gitignore\` excludes it by default). **\`.dart_tool/\`** is package metadata cache — also gitignored. **\`analysis_options.yaml\`** controls the linter — Flutter ships with sensible defaults you can tweak.`,
              whyItMatters: 'On day one of any new Flutter team, you will be dropped into a 200-file repo and asked to "add a search bar to the profile screen". If you know that screen widgets live in `lib/screens/` and the AppBar lives in some shared widget under `lib/widgets/common/`, you find the file in 30 seconds. If you do not, you waste 20 minutes grepping. Beyond that, **understanding which folders ship and which are generated** is the difference between accidentally committing a 200 MB `build/` directory (real story, happens every quarter at every Flutter shop) and a clean PR. Senior engineers never have to think about which folder a file belongs in — it is automatic. Make it automatic for yourself today.',
              steps: [
                'Run `flutter create kori_rotti_app` in your workspace folder.',
                'Open the new folder in VS Code and expand every top-level entry once.',
                'Identify `lib/main.dart` and read it — that is the entire starter app.',
                'Open `pubspec.yaml` and locate the `dependencies:` block. Note the `flutter:` SDK entry.',
                'Run `flutter pub get` and confirm `pubspec.lock` appears next to `pubspec.yaml`.',
                'Add `android/` and `ios/` to your "do not edit yet" mental list.',
                'Run `flutter run` and confirm the app boots; then locate `build/` — it appeared.',
                'Open `.gitignore` and verify `build/` and `.dart_tool/` are excluded.',
              ],
              code: `// project_tree.txt — output of \`flutter create kori_rotti_app\`

kori_rotti_app/
├── android/                  # Native Android shell (Gradle, Manifest)
│   ├── app/
│   │   └── build.gradle
│   └── build.gradle
├── ios/                      # Native iOS shell (Xcode project, Info.plist)
│   └── Runner.xcodeproj/
├── lib/                      # YOUR DART CODE goes here
│   └── main.dart             # Entry point — void main() calls runApp()
├── test/                     # Widget tests + unit tests
│   └── widget_test.dart
├── web/                      # HTML shell for Flutter web
│   ├── index.html
│   └── manifest.json
├── pubspec.yaml              # Project manifest (deps, assets, fonts)
├── pubspec.lock              # Pinned versions — commit this
├── analysis_options.yaml     # Linter config
├── README.md
├── .gitignore                # Excludes build/, .dart_tool/, etc.
├── .dart_tool/               # Generated cache — gitignored
└── build/                    # Compiled output — gitignored

// pubspec.yaml — sample
name: kori_rotti_app
description: A Kundapura kori rotti delivery app.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: ^3.5.0

dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.0
  provider: ^6.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
  fonts:
    - family: KannadaSans
      fonts:
        - asset: assets/fonts/KannadaSans-Regular.ttf`,
              pitfalls: [
                '**Editing `build/`.** You found a generated file there and tweaked it; next `flutter run` regenerates and your edit vanishes. Fix: never edit anything inside `build/` or `.dart_tool/`.',
                '**Tabs in pubspec.yaml.** YAML rejects tabs. The error is unhelpful (`mapping values are not allowed`). Fix: configure your editor to use spaces only for `.yaml`.',
                '**Forgetting to commit `pubspec.lock`.** Different team members get different package versions; build mysteriously breaks for one person. Fix: always commit `pubspec.lock` for app projects (libraries are different).',
                '**Putting Dart files outside `lib/`.** Flutter does not pick them up; imports fail mysteriously. Fix: every `.dart` file you ship lives under `lib/`.',
                '**Editing `android/app/build.gradle` blindly.** You bumped the Gradle version and Android builds break. Fix: only edit Gradle when a plugin docs page tells you to, and read the line before changing it.',
                '**Missing assets in pubspec.yaml.** You added `assets/logo.png` but Flutter says it cannot find it. Fix: add `- assets/` (with trailing slash) under `flutter: assets:` in pubspec, then re-run `flutter pub get`.',
                '**Renaming `lib/main.dart`.** The build expects this exact filename. Renaming breaks `flutter run`. Fix: keep `main.dart` as-is; structure your code in sibling files and import them.',
                '**Committing `.idea/` or `.vscode/` blindly.** Personal IDE settings pollute teammates\' setups. Fix: ensure `.idea/` is gitignored; share only one carefully curated `.vscode/settings.json`.',
              ],
              tryIt: `Run \`flutter create udupi_tiffin\`. Open the project, then in your terminal run \`tree /F /A\` (Windows) or \`tree -L 2\` (Mac/Linux) and screenshot the output. Open \`pubspec.yaml\` and add \`http: ^1.2.0\` under \`dependencies\`. Run \`flutter pub get\` and verify \`pubspec.lock\` updated. **Now extend it** by adding an \`assets/\` folder with one image file (any PNG of a Mookambika temple photo will do), wire it up in pubspec under \`flutter: assets:\`, and confirm with \`flutter pub get\`. You have just learned the entire create→pub-add→build loop.`,
              takeaway: 'lib is your code, pubspec is your shopping list, android and ios are deployment shells.',
            },
            {
              id: 'm1-t3',
              title: 'main(), runApp(), and the Widget Tree',
              explain: 'Trace how Flutter boots from main into a tree of widgets the engine renders.',
              analogy: 'Visit the Mookambika temple at Kollur, just north of Kundapura. From the highway you see the gopuram first — a single tall tower marking the entrance. Step inside and you find a strict hierarchy: the **garbha-griha** at the centre with the deity, the **navaranga** mandapam around it with nine compartments, an outer **prakara** wall with subsidiary shrines for Saraswati, Subrahmanya and the navagrahas, and finally the **outer wall** with its lamp niches. There is exactly one deity at the centre and everything else is arranged as a tree branching outward from her. Devotees enter through the gopuram and walk inward to the centre, but the **structural hierarchy starts at the deity and expands outward**. A Flutter app is the same temple. Your `void main()` is the priest who unlocks the door; `runApp()` installs the deity (your root widget) at the centre; and every widget inside is a sub-shrine arranged in formal nested hierarchy. The Flutter engine is the temple architect — it walks this tree from the root outward and decides how every shrine sits, which lamp lights up, and where each devotee stands.',
              theory: `Every Flutter app starts the exact same way: the Dart VM loads your file, finds the top-level \`void main()\` function, and calls it. Your job inside \`main\` is to call **\`runApp(rootWidget)\`** exactly once, passing whichever widget you want as the root of the tree.\n\n**\`runApp\`** does three things in sequence: it sets up the Flutter binding (the bridge between your Dart code and the C++ engine), it inflates your root widget into an **Element tree**, and it triggers the first frame to be rendered. Behind the scenes Flutter actually maintains **three parallel trees**: the **Widget tree** (your immutable description of UI), the **Element tree** (Flutter's mutable bookkeeping of which widget is mounted where), and the **RenderObject tree** (the actual layout and paint primitives the engine talks to). You write only the widget tree; Flutter builds the other two for you.\n\n**MaterialApp** (or CupertinoApp, or WidgetsApp) is almost always your root. It provides Theme, Navigator, Localizations, and other ambient services that descendants look up via \`InheritedWidget\`. Below MaterialApp you typically have a **Scaffold** (one per screen — see m1-t12), and below Scaffold you compose body widgets like Column, ListView, Row, Container, Text, etc.\n\nThe whole tree is **rebuilt** every time something changes — but Flutter is smart: it diffs the new widget tree against the old element tree and only repaints what actually changed. This is why writing widgets feels declarative even though performance is excellent. Understanding the tree is your foundation for everything else in Flutter — state management, navigation, theming, gestures, all flow through it.`,
              whyItMatters: 'When your screen renders wrong, the bug is somewhere in the widget tree. Senior Flutter engineers debug visually by **walking the tree mentally** — "the AppBar is inside Scaffold, Scaffold is inside MaterialApp, so Theme.of(context) here picks up MaterialApp.theme; if the theme is wrong, my MaterialApp is wrong". Juniors stare at the screen and refresh. Beyond debugging, every advanced Flutter concept (InheritedWidget, BuildContext, keys, Provider, route transitions, animations) is a tool that operates **on the tree**. If the tree is fuzzy in your head, all those tools feel like magic. If the tree is crisp, they feel obvious. Spend the time now to make it crisp.',
              steps: [
                'Open the `lib/main.dart` from your `kundapura_kori` project.',
                'Identify `void main()` at the top — the entry point.',
                'Find the `runApp(MyApp())` call inside `main`.',
                'Locate the `MyApp` class — it `extends StatelessWidget`. Its `build` method returns `MaterialApp`.',
                'Inside `MaterialApp`, find the `home:` argument — that is the first screen widget.',
                'Open Flutter DevTools (`flutter run` then press `v`) and switch to the **Widget Inspector** tab.',
                'Click any widget on screen — the inspector highlights its position in the tree.',
                'Trace from leaf back to root — confirm the chain ends at `MyApp`.',
              ],
              code: `// lib/main.dart — annotated boot of a fresh Flutter app

import 'package:flutter/material.dart';

// 1. Dart VM finds this and calls it.
void main() {
  // 2. runApp installs MyApp as the root widget. Exactly one root.
  runApp(const MyApp());
}

// 3. MyApp is the root of the widget tree.
//    StatelessWidget = pure description, no internal state.
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // 4. MaterialApp provides Theme, Navigator, Localizations to all descendants.
    return MaterialApp(
      title: 'Kundapura Kori',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepOrange),
      ),
      // 5. home: is the first screen — another widget in the tree.
      home: const HomeScreen(),
    );
  }
}

// 6. HomeScreen is a Scaffold — see m1-t12 for what Scaffold provides.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // 7. AppBar is a child of Scaffold via the appBar: slot.
      appBar: AppBar(title: const Text('Mookambika Temple Hours')),
      // 8. body: is the main scrollable area.
      body: const Center(
        // 9. Text is a leaf widget — no children below it.
        child: Text('Open 5:00 AM to 1:30 PM, 3:00 PM to 9:00 PM'),
      ),
    );
  }
}

// Resulting tree:
//   MyApp
//     MaterialApp
//       HomeScreen
//         Scaffold
//           AppBar
//             Text("Mookambika Temple Hours")
//           Center
//             Text("Open 5:00 AM ...")`,
              pitfalls: [
                '**Calling runApp more than once.** You hot-restarted manually and called runApp twice; the tree is now confused. Fix: runApp goes in main() exactly once. Use Navigator to change screens.',
                '**Forgetting `const` on the root.** A non-const root rebuilds children unnecessarily on every parent rebuild. Fix: prefix `const` everywhere you can — `const MyApp()`, `const Text(...)`. The linter nags you about this.',
                '**Doing async work before runApp.** You called `await someService()` before `runApp` but forgot `WidgetsFlutterBinding.ensureInitialized()`. The framework crashes. Fix: add that one line at the top of main() before any await.',
                '**Returning multiple roots from build().** You wrote `return [Widget1(), Widget2()];` — Dart compiles but Flutter expects ONE widget. Fix: wrap in Column, Row, or Stack.',
                '**No MaterialApp wrapper.** You started with just a Scaffold under runApp; Theme.of(context) returns null and your text has no font. Fix: always wrap in MaterialApp at the root.',
                '**Confusing widget tree with element tree.** You think rebuilding rebuilds everything; actually Flutter diffs and only changes what differs. Fix: trust the framework — write declaratively, profile only when you see jank.',
                '**Mutating state in build().** You incremented a counter inside build() — infinite rebuild loop. Fix: never mutate state in build(); use setState (m1-t9) or controllers.',
                '**Returning a non-widget from build().** You returned `null` or a String — runtime crash. Fix: build() must return a Widget; if "nothing", return `const SizedBox.shrink()`.',
              ],
              tryIt: `Open your \`namma_kundapura\` project and replace the body of \`HomeScreen\` with a \`Column\` containing three \`Text\` widgets — one each for Mookambika temple, Maravanthe beach, and Gangolli harbour. Run \`flutter run\` and confirm all three appear stacked vertically. **Now extend it** by opening Flutter DevTools (press \`v\` in the terminal where flutter run is active) and click the Widget Inspector. Click each Text on screen and watch the tree path light up. Notice how every widget you wrote shows up as a node, and the framework adds wrapper nodes (like \`Padding\`, \`DefaultTextStyle\`) you never wrote. That is the engine doing its temple architect job.`,
              takeaway: 'runApp pins the root; everything below it is a tree, not a script.',
            },
            {
              id: 'm1-t4',
              title: 'MaterialApp vs CupertinoApp vs WidgetsApp',
              explain: 'Pick the right app shell for the design language you are targeting.',
              analogy: 'Walk into three different Karnataka tiffin places — Diana in Udupi, an old-school darshini in Bengaluru, and a tiny coastal neer-dosa hotel — and the cook can still start from the same basic dosa idea but serve three different personalities. The **masala dosa** comes folded over a spiced potato bhaji with coconut chutney and sambhar — that is **MaterialApp**: the standard Android-style shell that ships with Theme, Navigator, ScaffoldMessenger, and Snackbar already wired up. The **Mysuru masala dosa** is the Bengaluru-Mysuru variant with a red-chilli garlic chutney smeared on the inside and crisp golden edges — that is **CupertinoApp**: the iOS-style shell with sliding page transitions, segmented controls, and date pickers that look like the iPhone. And then there is the humble **neer dosa** of coastal Karnataka — paper-thin, almost translucent, no filling, just plain coconut chutney on the side — that is **WidgetsApp**: the bare framework canvas with no Material or Cupertino assumptions at all, used by people who want full design control. Same batter (the Flutter framework), three personas. Pick the one whose flavour matches your audience.',
              theory: `Every Flutter app needs **one** of these three at the root: \`MaterialApp\`, \`CupertinoApp\`, or \`WidgetsApp\`. They are different "shells" that wrap the same engine.\n\n**\`MaterialApp\`** is the default for 95% of Flutter apps. It implements the Google Material Design 3 spec: rounded corners, ripple touch feedback, FloatingActionButton, AppBar, BottomNavigationBar, SnackBar, Drawer, etc. It also wires up a default \`Navigator\`, a default \`Theme\` (light + dark), and the entire Material widget catalog. Use it when your design is Android-style or platform-neutral. Imports come from \`package:flutter/material.dart\`.\n\n**\`CupertinoApp\`** mimics the native iOS look and feel: sliding push transitions instead of fade, CupertinoButton instead of ElevatedButton, CupertinoNavigationBar instead of AppBar, CupertinoTextField instead of TextField. Choose it when you ship iOS-only or want pixel-accurate iOS aesthetics on every platform. Imports come from \`package:flutter/cupertino.dart\`.\n\n**\`WidgetsApp\`** is the bare-bones layer underneath both. It provides the \`Navigator\`, basic localization, and a media query — but **no Material widgets, no Cupertino widgets, no theming**. Use it when you are building a fully custom design system from scratch, or for very minimal "splash screen / preload" apps before swapping into MaterialApp.\n\nIn modern Flutter, **adaptive design** is the norm: you use \`MaterialApp\` and inside conditionally render Material or Cupertino widgets based on \`Platform.isIOS\` (or \`defaultTargetPlatform\`). Or you use packages like \`flutter_platform_widgets\` that auto-pick. WidgetsApp remains rare in production code.`,
              whyItMatters: 'Picking the wrong shell wastes weeks. Teams that start with MaterialApp and later "add iOS polish" by swapping to CupertinoApp end up rewriting half their UI because Material widgets break under CupertinoApp. Senior engineers decide this on day one based on the brand brief: "we are an Indian fintech, our users are 80% Android, MaterialApp it is" — done, no waffle. Beyond the choice itself, **understanding what the app shell provides for free** prevents you from re-implementing things like Navigator, Theme, or localization manually. The interview question "what does MaterialApp actually do?" filters out candidates who have not thought past the boilerplate.',
              steps: [
                'Open `lib/main.dart` from `kundapura_kori`.',
                'Locate the `MaterialApp(...)` widget — note its `theme:`, `home:`, and `title:` arguments.',
                'Comment out the import `package:flutter/material.dart` and add `package:flutter/cupertino.dart`.',
                'Replace `MaterialApp` with `CupertinoApp` and `Scaffold` with `CupertinoPageScaffold`.',
                'Replace `AppBar` with `CupertinoNavigationBar` and `Text` styles update via `CupertinoTheme`.',
                'Run `flutter run` and observe the iOS-style transitions and fonts.',
                'Revert to MaterialApp; this is what 95% of your apps will use.',
                'Read the docs page docs.flutter.dev/cookbook/design/themes for the canonical examples.',
              ],
              code: `// three_app_shells.dart
import 'package:flutter/material.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/widgets.dart' as w;

// ---------- MATERIAL — Android-style, the default ----------
class MaterialRoot extends StatelessWidget {
  const MaterialRoot({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kundapura Kori',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepOrange),
        useMaterial3: true,
      ),
      home: Scaffold(
        appBar: AppBar(title: const Text('Masala Dosa')),
        body: const Center(child: Text('MaterialApp shell')),
      ),
    );
  }
}

// ---------- CUPERTINO — iOS-style, sliding transitions ----------
class CupertinoRoot extends StatelessWidget {
  const CupertinoRoot({super.key});
  @override
  Widget build(BuildContext context) {
    return CupertinoApp(
      title: 'Kundapura Kori',
      theme: const CupertinoThemeData(primaryColor: CupertinoColors.systemRed),
      home: CupertinoPageScaffold(
        navigationBar: const CupertinoNavigationBar(
          middle: Text('Mysore Masala'),
        ),
        child: const Center(child: Text('CupertinoApp shell')),
      ),
    );
  }
}

// ---------- WIDGETS — bare canvas, no Material, no Cupertino ----------
class WidgetsRoot extends StatelessWidget {
  const WidgetsRoot({super.key});
  @override
  Widget build(BuildContext context) {
    return w.WidgetsApp(
      title: 'Kundapura Kori',
      color: const Color(0xFFFFA000),
      builder: (context, child) => const w.Center(
        child: w.Text(
          'Neer Dosa',
          textDirection: w.TextDirection.ltr,
          style: w.TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}

// To run, swap the line in main():
//   runApp(const MaterialRoot());
//   runApp(const CupertinoRoot());
//   runApp(const WidgetsRoot());`,
              pitfalls: [
                '**Mixing Material widgets under CupertinoApp.** You used `Scaffold` inside `CupertinoApp` — Theme.of(context) returns null and styling breaks. Fix: under CupertinoApp use only Cupertino widgets, or wrap the section in `Material(child: ...)`.',
                '**Two app roots in the tree.** You nested MaterialApp inside CupertinoApp; Navigator gets confused and back-button history breaks. Fix: exactly one app shell at the root.',
                '**Forgetting `useMaterial3: true`.** You are on a recent Flutter SDK but your buttons look 2018-style. Fix: set `useMaterial3: true` on ThemeData.',
                '**WidgetsApp without `color:`.** WidgetsApp requires a `color:` for the OS task switcher; omitting it is a runtime assert. Fix: pass any Color, e.g. `color: Colors.deepOrange`.',
                '**Hardcoding fonts that vary by platform.** You set Roboto on iOS via Material; Apple users hate it. Fix: use the default platform font or pick adaptive packages.',
                '**Localizations forgotten.** You launched in India and got "EE, MMM d" for dates instead of localized strings. Fix: pass `localizationsDelegates: [...]` and `supportedLocales: [...]` on MaterialApp.',
                '**Theme.of(context) called above MaterialApp.** Returns the default theme, not yours. Fix: read theme inside descendants of MaterialApp, never above.',
                '**Choosing CupertinoApp for an Android-first product.** Your users on Redmi phones see iOS-style sliders that feel alien. Fix: pick the shell that matches your largest user segment, not your designer\'s phone.',
              ],
              tryIt: `Take the \`namma_kundapura\` starter and create three branches: one with MaterialApp, one with CupertinoApp, one with WidgetsApp. In each, render a single \`Text\` widget saying "Welcome to Mookambika". Run all three on Chrome (\`flutter run -d chrome\`) and compare visually. **Now extend it** by adding a button to each — \`ElevatedButton\` in Material, \`CupertinoButton\` in Cupertino, and try to add a button in WidgetsApp (you will discover there is no built-in button and you must compose one from \`GestureDetector\` + \`Container\` — that is exactly the point of WidgetsApp).`,
              takeaway: 'MaterialApp for Android-style, CupertinoApp for iOS-style, WidgetsApp for a blank canvas.',
            },
            {
              id: 'm1-t5',
              title: 'Hot Reload vs Hot Restart vs Full Restart',
              explain: 'Three speed knobs that save hours every week once you know which one to press.',
              analogy: 'Picture the steel dabra at Mitra Samaj on Car Street, Udupi — the cook keeps decoction simmering from 5 AM and stirs it all morning. A customer walks in and asks for "extra strong, less milk" — the cook just splashes a little more decoction into the cup without disturbing the rest of the dabra. That is **hot reload**: a tiny code change is injected into the running app, your widget tree rebuilds, but **all your state survives** — the form data you typed, the screen you navigated to, the items in your cart. Now imagine the milk has soured slightly mid-morning. The cook empties the milk, rinses the dabra, and pours in fresh boiled milk — but the gas is still on, the burner is still hot, and the decoction is still ready. That is **hot restart**: the Dart VM is reset, your app starts from `main()` again, all state is wiped, but the device, the connection, and the build cache are intact. And then there is the end-of-day cleaning ritual: the dabra goes to the wash area, gets descaled with tamarind, dried, and set up again from cold next morning. That is **full restart** (`q` then `flutter run` again): the whole process dies, native code recompiles, and you wait the full thirty seconds. Three speeds, three uses, three keys to press.',
              theory: `Flutter's development loop has three reset levels, each progressively more thorough and slow.\n\n**Hot reload** (press \`r\` in the terminal where flutter run is active) is Flutter's most-loved feature. It injects updated source files into the running Dart VM, calls \`reassemble()\` on every widget, and rebuilds the tree. **State is preserved** because the State objects keep their fields. Edits to \`build()\` methods, widget compositions, colours, and layouts hot-reload in **under one second**. Edits that hot-reload include: changing a Text string, swapping a colour, restructuring a Column, adding a Padding wrapper.\n\n**Hot restart** (press \`R\`) tears down the Dart VM and re-runs \`main()\` from the top. **All in-memory state is lost** but the native side (the Android Activity or iOS UIViewController) is reused, so it is much faster than a full restart. You need hot restart when you change: \`main()\` itself, a class constructor signature, top-level variables, enum definitions, generic type parameters, the structure of an \`InheritedWidget\`. The rule of thumb: if you changed something that runs **only once at startup**, you need hot restart, not hot reload.\n\n**Full restart** (press \`q\` to quit, then \`flutter run\` again) rebuilds and re-deploys the entire app, including the native shell. Use this when you change: \`pubspec.yaml\` dependencies, native plugin code (\`android/\` or \`ios/\`), Gradle configs, Info.plist, splash screens, app icons, or assets that get bundled. Think of full restart as "I changed something the OS sees, not just Dart code".\n\nThe Flutter VS Code extension binds these to keyboard shortcuts: **Ctrl+S** auto-saves and triggers hot reload by default. The "Lightning" icon in the debug toolbar = hot reload. The "Refresh" icon = hot restart. The "Stop" icon = full quit.`,
              whyItMatters: 'Hot reload is the single feature that makes Flutter feel ten times more productive than native Android or iOS development. UI iteration that takes 30 seconds in Android Studio takes 0.5 seconds in Flutter. But juniors waste this gift by **always pressing R when r would do** — they think hot restart is "more thorough" so safer. Wrong: it costs you all your in-app state and makes you re-navigate to test the same screen ten times. Senior engineers reflexively press the right key for the right edit and finish features in half the time. Beyond personal productivity, **understanding why hot reload preserves state** opens the door to deeper concepts: the Element tree, State objects, and why `setState` works the way it does (m1-t9).',
              steps: [
                'Run `flutter run -d chrome` in your `kundapura_kori` project.',
                'In `lib/main.dart`, change the AppBar title from "Kundapura Kori" to "Kundapura Kori Rotti". Save.',
                'Watch the browser — title updates in under a second. That was hot reload.',
                'Increment the counter button a few times (state lives in `_MyHomePageState`).',
                'Now in `main.dart`, change the constructor of `MyApp` to add a `final String region;` field. Save.',
                'Notice the message "Reloaded N libraries in Xms" did not happen — Flutter says "Restart for changes to take effect". Press `R`.',
                'After hot restart, the counter is back to 0 — state was lost.',
                'Now edit `pubspec.yaml`, add a new dependency, save. Press `q`, then `flutter run` again — that is full restart.',
              ],
              code: `// lib/main.dart — counter app to feel the three reload modes

import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // CHANGE 1 (hot reload friendly): change this string and press Ctrl+S.
      title: 'Kundapura Kori',
      home: const CounterScreen(),
    );
  }
}

class CounterScreen extends StatefulWidget {
  const CounterScreen({super.key});
  @override
  State<CounterScreen> createState() => _CounterScreenState();
}

class _CounterScreenState extends State<CounterScreen> {
  int _plates = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // CHANGE 2 (hot reload friendly): swap colour or icon.
        backgroundColor: Colors.deepOrange,
        title: const Text('Kori Rotti Order'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Plates ordered:'),
            // CHANGE 3 (hot reload friendly): change fontSize.
            Text('\$_plates', style: const TextStyle(fontSize: 48)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => setState(() => _plates++),
        child: const Icon(Icons.add),
      ),
    );
  }
}

// CHANGE 4 (REQUIRES hot restart, not hot reload): change main() signature.
//   void main(List<String> args) { ... }
//   In _CounterScreenState, change initial _plates = 0 to = 5.

// CHANGE 5 (REQUIRES full restart): edit pubspec.yaml dependencies.`,
              pitfalls: [
                '**Pressing R when r would do.** You lose all your typed form data and have to re-navigate. Fix: hot reload first; only escalate to hot restart if Flutter explicitly tells you to.',
                '**Hot reload silently failed.** You see "Reloaded 0 libraries" — your edit is not live. Fix: check the terminal for syntax errors that blocked the reload. Fix the syntax, save again.',
                '**Changed `initState` and expected hot reload to re-run it.** initState only runs when a State object is first created; hot reload preserves State objects. Fix: hot restart to force initState to run again.',
                '**Hot reload after enum or generic type change.** Sometimes silently breaks until restart. Fix: when you change types, restart proactively.',
                '**Editing `main.dart` and forgetting to save.** Flutter only watches saved files. Fix: turn on "Auto Save" in VS Code or always Ctrl+S before pressing r.',
                '**Hot reloading on a real device with no USB connection.** Connection drops mid-edit; reload hangs. Fix: re-plug, then `r` again or full restart.',
                '**Plugin native code edited.** You changed `android/app/build.gradle` and pressed r — nothing happened. Fix: native edits ALWAYS need full restart (`q` then `flutter run`).',
                '**Stale build cache after a Flutter SDK upgrade.** Hot reload starts giving weird errors. Fix: `flutter clean && flutter pub get` then full restart.',
              ],
              tryIt: `Run your \`namma_kundapura\` app on Chrome. While it is running, do five edits in sequence and predict what kind of reload each one needs: (1) change AppBar title text, (2) change the FAB icon from \`add\` to \`shopping_cart\`, (3) add a new field \`final String city;\` to your widget constructor, (4) edit \`main()\` to print a debug line before runApp, (5) add \`http: ^1.2.0\` to pubspec.yaml. **Now extend it** by timing each: time how long hot reload takes for a Text change, time hot restart for a constructor change, and time full restart after a pubspec edit. Internalise the speed difference so your fingers reach for the right key automatically.`,
              takeaway: 'r reloads keeping state, R restarts resetting state, q kills the process.',
            },
          ],
        },
        {
          id: 'm1-s2',
          title: 'Widget Fundamentals',
          topics: [
            {
              id: 'm1-t6',
              title: 'Everything Is a Widget',
              explain: 'In Flutter, buttons, padding, themes, and gestures are all widgets — there is no other primitive.',
              analogy: 'Walk down to Gangolli harbour at five in the morning when the fishing trawlers come in. Your cousin\'s co-op tips out a single crate onto the wet concrete floor and inside it is the day\'s catch: silver bangda (mackerel), oily mathi (sardine), the long anjal (kingfish), prawns the size of your thumb, a crab with one claw missing, half a kilo of cuttlefish, two pomfret. Wildly different shapes, sizes, prices, and uses — but every single thing in that crate is a **fish**, in the eyes of the auctioneer. He weighs them, calls a kilo rate, and sells. There is no separate "shellfish category" or "premium category" — all just one primitive called "fish in the crate". Flutter is exactly the same: every entity in your UI tree is a **widget**. The Text on screen is a widget. The Padding around it is a widget. The GestureDetector that listens for taps is a widget. The Theme that picks orange over blue is a widget. The MediaQuery that tells you the screen is 360 px wide — a widget. There is no second category called "directives" or "components" or "modifiers". One primitive for everything. The Flutter engine treats them all the same and your brain should too.',
              theory: `In other UI frameworks you typically have several primitives. **HTML** has tags (DOM elements), CSS rules, and JavaScript event handlers — three different things. **Android XML** has views, layouts, and styles. **React** has components, hooks, and props. Flutter collapses all of this into a single primitive: **the Widget**.\n\nA Widget is just a Dart class that extends \`StatelessWidget\` or \`StatefulWidget\` (or rarely \`InheritedWidget\` / \`RenderObjectWidget\`). Every widget is **immutable** — its fields are \`final\`. To "change" a widget, you create a new instance with new fields and let Flutter diff the old tree against the new.\n\n**Visual widgets** are the obvious ones: \`Text\`, \`Image\`, \`Icon\`, \`Container\`. **Layout widgets** are also widgets: \`Row\`, \`Column\`, \`Stack\`, \`Padding\`, \`Center\`, \`Align\`. **Behaviour widgets** look invisible but are full widgets: \`GestureDetector\` (tap/swipe handling), \`Listener\` (low-level pointer events), \`AnimatedBuilder\`. **Inheritance widgets** propagate data down the tree without props: \`Theme\`, \`MediaQuery\`, \`DefaultTextStyle\`, \`Localizations\`, \`InheritedWidget\` — all widgets. Even \`MaterialApp\` itself is a widget; it is just one that happens to inflate a lot of children.\n\nThe practical consequence: **composition replaces configuration**. Want padding? Wrap in \`Padding\`. Want a tap handler? Wrap in \`GestureDetector\`. Want a different theme on this subtree? Wrap in \`Theme\`. You build complex UI by stacking widgets, not by setting fifty properties on one mega-component. This is why Flutter trees go deep (often 8-15 levels for a single screen) but each level is simple and reusable.`,
              whyItMatters: 'Once "everything is a widget" clicks, you stop fighting Flutter and start composing. Juniors look for "the way to add padding" or "the configuration for tap handling" and waste hours hunting through docs. Seniors instinctively wrap — they read "I need padding around this" and reach for `Padding(padding: ..., child: ...)` in three seconds. Beyond speed, the unified primitive **simplifies your mental model**: there is one thing to learn (widgets), one tree to debug, one composition pattern to master. Flutter interviews routinely ask "is GestureDetector a widget?" — yes. "Is Theme a widget?" — yes. The answer is always yes. Internalise that and the framework becomes obvious.',
              steps: [
                'Open `lib/main.dart` and locate one `Text` widget.',
                'Wrap it in `Padding(padding: const EdgeInsets.all(16), child: Text(...))` — Padding is a widget too.',
                'Save and observe the spacing change via hot reload.',
                'Now wrap the Padding in a `GestureDetector(onTap: () => print("tap"), child: ...)` — also a widget.',
                'Save, tap the text, and watch the print statement in the terminal.',
                'Wrap the whole thing in `Theme(data: ThemeData.dark(), child: ...)` — yet another widget.',
                'Open Flutter DevTools Inspector and confirm the tree shows GestureDetector → Padding → Text.',
                'Notice every layer is just a widget — no exceptions.',
              ],
              code: `// lib/main.dart — every wrapper is a widget

import 'package:flutter/material.dart';

void main() => runApp(const KoriRottiCard());

class KoriRottiCard extends StatelessWidget {
  const KoriRottiCard({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          // Theme is a widget — restyle this subtree only.
          child: Theme(
            data: ThemeData(
              textTheme: const TextTheme(
                bodyLarge: TextStyle(fontSize: 24, color: Colors.deepOrange),
              ),
            ),
            // GestureDetector is a widget — listens for taps.
            child: GestureDetector(
              onTap: () => debugPrint('Card tapped at Mookambika menu'),
              // Padding is a widget — adds spacing around its child.
              child: Padding(
                padding: const EdgeInsets.all(24),
                // Container is a widget — gives a box with decoration.
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.amber.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  // Padding (again) — widgets are reusable, nest freely.
                  child: const Padding(
                    padding: EdgeInsets.all(16),
                    // Column is a widget — stacks children vertically.
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Text is a widget — leaf node.
                        Text('Kori Rotti'),
                        // SizedBox is a widget — empty box for spacing.
                        SizedBox(height: 8),
                        Text('₹140 per plate'),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// Tree depth here: 13 widgets for one card.
// That sounds like a lot but each layer does ONE thing.
// Composition > configuration.`,
              pitfalls: [
                '**Looking for "the property" instead of wrapping.** You google "Flutter Text padding" expecting a `padding:` argument on Text. Fix: there is no padding on Text — wrap in `Padding`.',
                '**Treating GestureDetector as a function.** It is a widget; you put it in your tree, not call it like an event handler. Fix: `GestureDetector(onTap: ..., child: yourWidget)`.',
                '**Trying to mutate a widget after creation.** Widgets are immutable; `myWidget.text = "new"` fails. Fix: create a new widget instance — that is the whole pattern.',
                '**Confusing widgets with state.** Widget itself is immutable; mutable data lives in State (m1-t8). Fix: do not stuff mutable fields into the widget class.',
                '**Forgetting `child:` vs `children:`.** Single-child widgets like Padding take `child:`; multi-child widgets like Column take `children: [...]`. Fix: read the constructor.',
                '**Over-nesting for performance.** "All these wrappers must be slow" — Flutter inflates const widgets once and diffs efficiently. Fix: trust the framework; profile only when DevTools shows actual jank.',
                '**Editing widget fields after construction in build().** Flutter complains about non-final fields. Fix: keep widget fields `final`; pass new values when re-creating.',
                '**Skipping `const` constructors.** Non-const widgets rebuild unnecessarily. Fix: always prefix `const` where possible — Dart Analyzer suggests it.',
              ],
              tryIt: `Take a single \`Text("Welcome to Mookambika")\` and progressively wrap it: first in \`Padding\`, then in \`Container\` with a coloured border, then in \`Center\`, then in \`GestureDetector\` that prints to console on tap, then in \`Theme\` with a custom font size. Run after each wrap and confirm the cumulative effect. **Now extend it** by writing the same thing using \`Container\`'s built-in \`padding:\` and \`alignment:\` arguments — and notice that you cannot add a tap handler that way without bringing GestureDetector back. That is the lesson: composition wins because each widget is a single tool that does one thing.`,
              takeaway: 'If it is on screen, it is a widget. Even invisible things like Padding are widgets.',
            },
            {
              id: 'm1-t7',
              title: 'StatelessWidget — Pure Rebuilds',
              explain: 'Stateless widgets are pure functions of their inputs — same props, same UI.',
              analogy: 'Picture Vidyarthi Bhavan on Gandhi Bazaar Road in Bangalore at 8 a.m. on a Sunday. The benne masala dosa they serve you is exactly the same dosa they served your father in 1985 and exactly the same one they will serve your son in 2050. The cook does not remember you. He does not adjust the recipe because you ordered extra chutney last week. He gets handed three things — batter, ghee, potato masala — and he produces one thing — a dosa. Pure function. If the inputs were the same, the output is the same. Now picture the opposite: a Kundapura tea stall where the chai-wallah remembers that Pradeep takes 1.5 spoons of sugar, that Anjali skips ginger, that the auto driver wants extra kadak. That is **state**. A `StatelessWidget` is Vidyarthi Bhavan. It receives props in its constructor, calls `build()`, returns a widget tree. No memory. No "last time you tapped this card I changed colour". If the parent rebuilds, you get re-cooked from scratch. That sounds wasteful but it is exactly why Flutter UIs are predictable: the same configuration always renders the same pixels.',
              theory: `A `+'`'+`StatelessWidget`+'`'+` is a Dart class that extends `+'`'+`StatelessWidget`+'`'+` and overrides one method: `+'`'+`Widget build(BuildContext context)`+'`'+`. All its data lives in **final** fields set by the constructor — they cannot change after construction. There is no `+'`'+`setState`+'`'+`. There is nowhere to store "the user has tapped this 3 times".\\n\\nWhen does it rebuild? Only when its **parent** rebuilds and decides to construct a new instance with possibly-different props. The framework calls `+'`'+`build()`+'`'+`, gets a fresh widget subtree, and diffs it against the old one. If you mark the constructor `+'`'+`const`+'`'+` and pass `+'`'+`const`+'`'+` arguments, Flutter can skip rebuilding entirely — the same `+'`'+`const`+'`'+` instance is reused frame after frame. This is why you see `+'`'+`const`+'`'+` everywhere in Flutter code: it is free performance.\\n\\nA stateless widget is the right choice when the data shown comes entirely from constructor props or from things looked up via `+'`'+`InheritedWidget`+'`'+` (Theme, MediaQuery, a Provider). The moment you need to remember something between user interactions inside the widget itself — a counter, an expanded/collapsed flag, a TextField's current value — switch to `+'`'+`StatefulWidget`+'`'+`. Do not try to sneak in a mutable field; Flutter will throw the value away on the next rebuild and you will lose your evening debugging it.\\n\\nIn a real Flutter app, **80–90% of your widgets will be stateless** — list tiles, cards, headers, dividers, icons with text, every "dumb" presentation widget. State lives in a few coordinator widgets and gets passed down. Keep that ratio in mind; if every widget you write is stateful, you are doing it wrong.`,
              whyItMatters: 'Every Flutter interview asks "when do you use Stateless vs Stateful?" The answer separates juniors from seniors. Senior devs default to Stateless and only escalate when truly needed; juniors make everything Stateful "just in case" and end up with sluggish UIs. Mastering this also unlocks the `const` optimization — apps that use `const` widgets correctly run noticeably smoother on low-end Android devices, which is most of the Indian market.',
              steps: [
                'In `lib/widgets/` create a new file `kori_rotti_card.dart`.',
                'Import `package:flutter/material.dart` at the top.',
                'Declare `class KoriRottiCard extends StatelessWidget` and add three `final` fields: `String dish`, `int priceRupees`, `bool isVegetarian`.',
                'Add a `const KoriRottiCard({super.key, required this.dish, required this.priceRupees, required this.isVegetarian});` constructor.',
                'Override `Widget build(BuildContext context)` — return a `Card` containing a `Padding` containing a `Column` of `Text` widgets showing dish, price, and a veg/non-veg dot.',
                'In your `HomePage` build, drop in `const KoriRottiCard(dish: "Kundapura Kori Rotti", priceRupees: 220, isVegetarian: false)` — note the `const` prefix.',
                'Run `flutter run` and hot-reload after editing the price; confirm the card updates.',
              ],
              code: `// lib/widgets/kori_rotti_card.dart
import 'package:flutter/material.dart';

// A pure StatelessWidget — three inputs, one card, no memory.
// Used to render a single dish on a Kundapura coastal-Karnataka menu.
class KoriRottiCard extends StatelessWidget {
  final String dish;
  final int priceRupees;
  final bool isVegetarian;

  // const constructor — enables widget caching when parents pass const args.
  const KoriRottiCard({
    super.key,
    required this.dish,
    required this.priceRupees,
    required this.isVegetarian,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Veg/non-veg dot — green for veg, red for non-veg.
            Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                shape: BoxShape.rectangle,
                border: Border.all(
                  color: isVegetarian ? Colors.green : Colors.red,
                  width: 2,
                ),
              ),
              child: Center(
                child: Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isVegetarian ? Colors.green : Colors.red,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Dish name + price stacked vertically.
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(dish, style: theme.textTheme.titleMedium),
                  const SizedBox(height: 4),
                  Text('₹\$priceRupees', style: theme.textTheme.bodyMedium),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Usage from a parent:
//   const KoriRottiCard(
//     dish: 'Kundapura Kori Rotti',
//     priceRupees: 220,
//     isVegetarian: false,
//   )`,
              pitfalls: [
                '**Adding a non-final field "just for now".** You write `int counter = 0` in your StatelessWidget, planning to "fix it later". Flutter will let it compile but every rebuild reconstructs the widget and your counter resets to 0. Fix: if you need to remember a value across rebuilds, use `StatefulWidget`.',
                '**Forgetting `const` on the constructor.** Without it the parent cannot mark its usage `const KoriRottiCard(...)`, and Flutter rebuilds the subtree every frame instead of reusing the cached instance. Fix: every Stateless constructor that takes only compile-time-constant args should be `const`.',
                '**Mutating a field in `build()`.** You write `dish = dish.toUpperCase()` inside `build()`. Compiler stops you on `final`, but newcomers get clever and use a non-final field. Fix: compute derived values inside `build()` as locals (`final upper = dish.toUpperCase();`) — never mutate constructor inputs.',
                '**Skipping the `key` parameter.** Your widget takes `super.key` but you pass `KoriRottiCard(dish: ...)` without one inside a list. When list items reorder, Flutter mismatches them and the wrong card animates into the wrong slot. Fix: pass `ValueKey(dish)` or similar (covered in t11).',
                '**Calling `setState` from a Stateless context.** You copy-paste a tap handler from a Stateful widget that calls `setState(...)` and the compiler errors. Fix: lift state to the parent and pass a `void Function()` callback down as a prop.',
                '**Putting `Random()` or `DateTime.now()` directly in `build()`.** Every rebuild produces a different value, breaking the "same inputs → same output" contract and causing flicker. Fix: generate the value in the parent and pass it in as a prop, or hoist into a Stateful widget.',
                '**Passing huge objects through the constructor.** A stateless widget that receives a 10 MB `List<Order>` rebuilds the whole list comparison on every parent rebuild. Fix: pass only the slice you need, or use `Selector`/`Consumer` from a state-management library (Module 3).',
                '**Confusing `StatelessWidget` rebuild with re-render.** Calling `build()` is cheap — it just produces a description. The real expensive work is the diff and layout. Fix: stop trying to "skip build" with weird tricks; trust `const` and let Flutter optimize.',
              ],
              tryIt: 'In `lib/main.dart` replace the default counter app body with a `ListView` of five `KoriRottiCard` widgets — Kundapura Kori Rotti (₹220, non-veg), Neer Dosa with Chicken Ghassi (₹260, non-veg), Goli Baje with Chutney (₹90, veg), Mangalore Buns (₹70, veg), Anjal Tava Fry (₹450, non-veg). Wrap each in `const`. Now extend it to add a sixth card *without* `const` and use Flutter DevTools (Performance tab) to confirm the const cards skip rebuild while the non-const card rebuilds on every parent rebuild.',
              takeaway: 'No mutable state means no setState; rebuild on parent change only.',
            },
            {
              id: 'm1-t8',
              title: 'StatefulWidget and State<T>',
              explain: 'Stateful widgets pair an immutable Widget with a mutable State object that survives rebuilds.',
              analogy: 'Think of a Sagar-style tiffin centre on Court Road in Kundapura. There are two completely separate things on the premises that look like one business. First: the **printed menu card** on every table. It is laminated, never changes, every customer reads the same words — "idli ₹30, vada ₹40, neer dosa ₹60". That card is the `StatefulWidget` itself: immutable, given to every customer, just configuration. Second: the **kitchen at the back** where Suma is cooking. Suma keeps a running tally on a slate: "table 4 wants two more dosas, table 7 paid already, the chutney pot is half empty, refill needed in 10 minutes". Suma is the `State<T>` object. Customers come and go (the widget gets rebuilt by the framework), the menu card gets reprinted every now and then (Flutter swaps in a fresh widget instance), but Suma stays in the kitchen between rebuilds. Her slate, her chutney pot count, her partially-cooked dosas — all of that survives. That is the magic of `StatefulWidget`: a thin, throwaway widget on top, and a long-lived `State` object underneath that the framework keeps alive across rebuilds and only disposes when the widget is actually removed from the tree.',
              theory: `A `+'`'+`StatefulWidget`+'`'+` is **two classes**, not one. The widget class itself extends `+'`'+`StatefulWidget`+'`'+` and is just configuration — like Stateless, all its fields are `+'`'+`final`+'`'+`. It overrides one method: `+'`'+`State<MyWidget> createState()`+'`'+`. The second class extends `+'`'+`State<MyWidget>`+'`'+` and is where mutable fields, lifecycle hooks, and the `+'`'+`build()`+'`'+` method live.\\n\\nThe framework manages this dance for you. The first time the widget appears in the tree, Flutter calls `+'`'+`createState()`+'`'+`, gets your State object, calls `+'`'+`initState()`+'`'+` once, then calls `+'`'+`build()`+'`'+`. On every parent rebuild, Flutter constructs a **new** widget instance but reuses the **same** State object — it just calls `+'`'+`didUpdateWidget(oldWidget)`+'`'+` so your State can react to changed props. When the widget is removed from the tree forever, Flutter calls `+'`'+`dispose()`+'`'+` so you can cancel timers, close streams, and dispose controllers.\\n\\nKey lifecycle methods you will use constantly: `+'`'+`initState()`+'`'+` (one-time setup — start a Timer, fetch initial data), `+'`'+`dispose()`+'`'+` (one-time teardown — close everything you opened), `+'`'+`didChangeDependencies()`+'`'+` (called when an `+'`'+`InheritedWidget`+'`'+` you depend on changes — e.g., theme changed), `+'`'+`didUpdateWidget()`+'`'+` (called when parent rebuilds with new props for this widget). You almost never override `+'`'+`reassemble()`+'`'+`; that is for hot-reload tooling.\\n\\nThe `+'`'+`State`+'`'+` object holds a `+'`'+`widget`+'`'+` getter that always points at the **current** widget instance — so if you want to read your latest props inside the State, you write `+'`'+`widget.dish`+'`'+`, not `+'`'+`dish`+'`'+`. This trips up everyone exactly once.`,
              whyItMatters: 'Stateful is the workhorse for anything interactive — text fields, switches, animations, anything that responds to taps and remembers what happened. Knowing the lifecycle (initState/dispose especially) is the difference between a clean app and one that leaks memory and battery on long-running screens. A senior interview will ask "what happens between widget rebuild and State recreation" — being able to answer "the widget is thrown away every frame but the State persists until removed from the tree" lands you the offer.',
              steps: [
                'Create `lib/widgets/dosa_counter.dart`.',
                'Declare `class DosaCounter extends StatefulWidget` with one final field `String stallName` and a const constructor.',
                'Override `State<DosaCounter> createState() => _DosaCounterState();`.',
                'Below the widget class, declare `class _DosaCounterState extends State<DosaCounter>` (the underscore makes it library-private).',
                'Inside the State, add a mutable field `int _dosasServed = 0;` and a method `void _serve() { setState(() { _dosasServed++; }); }`.',
                'Override `build(BuildContext context)` to return a `Column` with a `Text` showing `widget.stallName` (note: `widget.` prefix), a `Text` showing the count, and an `ElevatedButton` whose `onPressed` calls `_serve`.',
                'Override `initState()` to print "Stall opened" and `dispose()` to print "Stall closed" — confirms the lifecycle.',
                'Drop `const DosaCounter(stallName: "Sagar Tiffin")` into your home screen and tap the button — count survives parent rebuilds.',
              ],
              code: `// lib/widgets/dosa_counter.dart
import 'package:flutter/material.dart';

// The Widget — immutable configuration, like the laminated menu card.
class DosaCounter extends StatefulWidget {
  final String stallName;

  const DosaCounter({super.key, required this.stallName});

  @override
  State<DosaCounter> createState() => _DosaCounterState();
}

// The State — mutable, long-lived, like Suma's slate in the kitchen.
class _DosaCounterState extends State<DosaCounter> {
  int _dosasServed = 0;

  @override
  void initState() {
    super.initState();
    // Called once when the widget enters the tree. Set up timers, listeners,
    // initial data fetches here. NEVER call setState from initState directly.
    debugPrint('Stall opened: \${widget.stallName}');
  }

  @override
  void didUpdateWidget(covariant DosaCounter oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Called when the parent rebuilds with possibly-new props.
    // Compare oldWidget.x to widget.x to react to changes.
    if (oldWidget.stallName != widget.stallName) {
      debugPrint('Stall renamed: \${oldWidget.stallName} -> \${widget.stallName}');
    }
  }

  @override
  void dispose() {
    // Called once, when the widget is permanently removed from the tree.
    // Cancel timers, close streams, dispose controllers here. Always.
    debugPrint('Stall closed: \${widget.stallName}');
    super.dispose();
  }

  void _serve() {
    setState(() {
      _dosasServed++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(widget.stallName, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text('Dosas served: \$_dosasServed'),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _serve,
              child: const Text('Serve one dosa'),
            ),
          ],
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Reading `dish` instead of `widget.dish` inside State.** The State class does not have your constructor params as fields — they live on the widget. Fix: always access props via `widget.propName`.',
                '**Forgetting to call `super.dispose()` (or calling it first).** Dart will not stop you, but you will leak resources or skip framework cleanup. Fix: dispose your own stuff first, then `super.dispose()` last.',
                '**Calling `setState` in `dispose()`.** Throws "setState called after dispose". You wrote `await fetch(); setState(...)` and the user navigated away mid-await. Fix: guard with `if (!mounted) return;` before every setState that follows an await.',
                '**Calling `setState` in `initState()` directly.** Useless — the framework will build right after initState anyway. Fix: just set the field directly without setState in initState.',
                '**Putting expensive work in `build()`.** Build runs on every setState — if you parse JSON or sort 10k items inside build, your UI will jank. Fix: precompute in initState or didUpdateWidget and store on the State.',
                '**Using a global key on a list of items.** GlobalKey is heavyweight; using it for every list tile causes Flutter to rebuild aggressively. Fix: use ValueKey for list items; reserve GlobalKey for things like accessing State from outside (rare).',
                '**Forgetting `late final` for fields initialized in initState.** Dart cannot prove the field is set before first read; you get a "non-nullable" error. Fix: declare as `late final TextEditingController _ctrl;` and assign in initState.',
                '**Storing a `BuildContext` from one frame and using it after dispose.** The context becomes invalid; calling Theme.of with it throws. Fix: never store context — pass it to a function call site instead.',
                '**Copying the Stateful boilerplate but forgetting to change `_DosaCounterState` to `_NewWidgetState`.** Compiler will not catch all conflicts; you get weird type mismatches. Fix: VS Code\\u2019s "Convert to StatefulWidget" lightbulb does the rename correctly.',
              ],
              tryIt: 'Build a `FishStallCounter` Stateful widget that tracks how many fish were sold today and how many remain in the icebox (start at 50). Wire two buttons: "Sold one" decrements remaining and increments sold; "Restock 10" adds to remaining. Print to debug console in initState ("Gangolli stall opened") and dispose ("Stall closed for the day"). Now extend it: add a TextField for the customer name and a "Mark as paid" button that prints `${customer} paid for the kingfish`. You will need a `TextEditingController` — declare it `late final`, init in `initState`, and dispose in `dispose`.',
              takeaway: 'Widget is the recipe; State is the chef who keeps the kitchen clean between dishes.',
            },
            {
              id: 'm1-t9',
              title: 'setState — The Rebuild Trigger',
              explain: 'setState marks the State as dirty so Flutter schedules a rebuild before the next frame.',
              analogy: 'Picture the morning chai counter at the Kundapura KSRTC bus stand. Ravi the chai-wallah keeps a chalk slate behind him with the running count of empty glasses on the rack. When a passenger drops an empty glass back, Ravi physically picks up the chalk, wipes the old number, writes the new one, AND THEN rings the small brass bell hanging above the counter. The bell tells the cashier at the front: "the count changed, please re-check your tally before the next bus arrives". Now suppose Ravi is in a rush, picks up an empty glass, mentally updates the count, but forgets to ring the bell. The cashier never re-checks. The next bus arrives, the cashier under-counts inventory, Ravi gets short-paid at end of shift. That bell is `setState`. The chalk-update is your mutation. **You can do the mutation without ringing the bell** — Dart will not complain. But Flutter has no way to know your data changed, so it will not rebuild the UI, and the screen will keep showing the stale count. The rule is brutal and simple: every time you change a State field that the UI reads, do it inside `setState(() { ... })`. The callback is where the mutation goes; everything inside the closure runs synchronously, and the framework marks the widget dirty for the next frame.',
              theory: `\`setState(VoidCallback fn)\` does exactly two things, in this order: (1) it runs your callback synchronously — that is where you mutate fields — and (2) it marks the State as **dirty**, scheduling a `+'`'+`build()`+'`'+` call before the next frame paints. It does NOT rebuild immediately. If you call `+'`'+`setState`+'`'+` ten times in a row inside one event handler, Flutter still only rebuilds once.\\n\\nWhy does the callback exist if it just runs synchronously? Two reasons. First, it is a **clear marker** in code reviews — anyone reading the file can grep for "setState" and find every state mutation. Second, it gives Flutter a hook to enforce things in debug builds: it asserts the callback returns void (so you do not accidentally `+'`'+`setState(() => future)`+'`'+` and lose the future), and it asserts the State is currently mounted.\\n\\nThe golden rule is: **mutate inside the callback, not after**. Writing `+'`'+`setState((){}); _count++;`+'`'+` is technically wrong — it works by accident because the next setState picks up the change. But code reviewers will flag it and one day you will hit a race condition where it does not work. Always: `+'`'+`setState(() { _count++; });`+'`'+`.\\n\\nDo NOT call setState from inside `+'`'+`build()`+'`'+`. That schedules another build, which schedules another, and you crash with "setState called during build". Do NOT call it from `+'`'+`dispose()`+'`'+` or after an `+'`'+`await`+'`'+` without checking `+'`'+`mounted`+'`'+`. The framework provides `+'`'+`if (!mounted) return;`+'`'+` for exactly this — your async function returned but the widget is gone, and calling setState on a disposed State throws.\\n\\nFinally, setState only rebuilds **this** State and its descendants. If parent state needs to change, you must lift state up — pass a callback prop down and call it from the child. This is the same pattern as React; the next module covers `+'`'+`Provider`+'`'+`/`+'`'+`Riverpod`+'`'+` for sharing state across the tree without prop-drilling.`,
              whyItMatters: 'Every Flutter dev hits the "I changed the variable but the screen did not update" wall in week one. That moment is the entire reason setState exists, and understanding the dirty-marking model unlocks every state-management library that comes later (Provider, Riverpod, Bloc are all just fancier ways to call setState on the right widget). Interview gold: "what happens if you call setState 100 times in a tight loop?" — answer: only one rebuild, and you sound like you have shipped Flutter to production.',
              steps: [
                'Open the `_DosaCounterState` you built in t8.',
                'Confirm the `_serve` method wraps the increment in `setState(() { _dosasServed++; })`.',
                'Add a second method `void _resetSilent() { _dosasServed = 0; }` — note no setState. Wire a "Silent reset" button to it.',
                'Hot-reload, tap "Serve" three times (count goes to 3), then tap "Silent reset". The count on screen stays at 3 even though the field is 0. Tap "Serve" once more — UI suddenly shows 1, because the next setState rebuilt with the actual value.',
                'Replace `_resetSilent` with `void _reset() { setState(() { _dosasServed = 0; }); }`. Now reset works instantly.',
                'Add an async method `Future<void> _serveAfterDelay() async { await Future.delayed(const Duration(seconds: 2)); if (!mounted) return; setState(() { _dosasServed++; }); }`. Note the mounted guard.',
                'Wire it to a third button. Tap it, then immediately navigate away (push a new screen). No crash, because of the mounted check.',
              ],
              code: `// lib/widgets/setstate_demo.dart
import 'package:flutter/material.dart';

class SetStateDemo extends StatefulWidget {
  const SetStateDemo({super.key});

  @override
  State<SetStateDemo> createState() => _SetStateDemoState();
}

class _SetStateDemoState extends State<SetStateDemo> {
  int _count = 0;
  String _lastAction = 'none';

  // CORRECT: mutation inside the callback.
  void _incrementCorrectly() {
    setState(() {
      _count++;
      _lastAction = 'incremented to \$_count';
    });
  }

  // WRONG: mutation outside setState. Field changes but UI does not refresh.
  // Kept here for the tryIt exercise — DO NOT do this in real code.
  void _incrementSilently() {
    _count++;
    _lastAction = 'silent increment (UI stale)';
  }

  // CORRECT async pattern: always check mounted before setState after await.
  Future<void> _incrementAfterDelay() async {
    await Future.delayed(const Duration(seconds: 2));
    if (!mounted) return; // Widget may have been disposed during the await.
    setState(() {
      _count++;
      _lastAction = 'delayed increment to \$_count';
    });
  }

  // Multiple setStates in one handler — Flutter still only rebuilds once.
  void _bigBatch() {
    setState(() => _count += 5);
    setState(() => _count *= 2);
    setState(() => _lastAction = 'batched: \$_count');
    // All three callbacks run, fields update, ONE rebuild scheduled.
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('setState demo')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Count: \$_count', style: Theme.of(context).textTheme.headlineMedium),
            Text('Last action: \$_lastAction'),
            const SizedBox(height: 24),
            ElevatedButton(onPressed: _incrementCorrectly, child: const Text('Correct +1')),
            ElevatedButton(onPressed: _incrementSilently, child: const Text('Silent +1 (broken)')),
            ElevatedButton(onPressed: _incrementAfterDelay, child: const Text('+1 after 2s')),
            ElevatedButton(onPressed: _bigBatch, child: const Text('Batch x5, x2')),
          ],
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Mutating outside setState.** UI does not refresh; eventually a different setState rebuilds and your old change appears. Fix: every mutation that affects UI goes inside the setState callback, no exceptions.',
                '**Calling setState in `build()`.** You add `setState(() => _x++);` inside build "to make it auto-update". Crash: "setState called during build". Fix: setState belongs in event handlers and lifecycle methods, never in build.',
                '**Calling setState after `await` without `mounted` check.** The user navigated away during your network call; setState throws "called after dispose". Fix: `if (!mounted) return;` immediately after every await before setState.',
                '**Wrapping the wrong code in setState.** `setState(() { fetchData(); })` — the fetch is async, returns a Future, completes later, and your UI rebuilds with no actual data change. Fix: `await fetchData(); if (!mounted) return; setState(() { _data = result; });`.',
                '**Calling setState on the wrong State.** You stored a reference to a child\\u2019s State and call setState from the parent. The child rebuilds; the parent does not. Fix: lift state to the lowest common ancestor and pass it down.',
                '**Ignoring "setState called during dispose".** You forgot to cancel a Timer in dispose. The Timer fires after the widget is gone and tries to setState. Fix: cancel every Timer/StreamSubscription/AnimationController in dispose.',
                '**Using setState for animations.** Calling setState 60 times a second to drive a fade is correct but inefficient — Flutter rebuilds the whole subtree each frame. Fix: use `AnimationController` + `AnimatedBuilder` (Module 2) which rebuilds only the animated widget.',
                '**Calling setState with no actual mutation.** `setState(() {});` works as a "force rebuild" but it is a code smell — it means your data is changing somewhere outside the State. Fix: move that data into the State or use a proper state-management lib.',
              ],
              tryIt: 'Open the `SetStateDemo` widget above. Tap "Silent +1 (broken)" three times — UI stays at 0. Now tap "Correct +1" once — UI jumps to 4. Explain to yourself why. Now extend the demo: add a `TextField` with a `TextEditingController`, and a button "Append name to action" that does `setState(() { _lastAction = "hello \\${_ctrl.text}"; });`. Confirm the typed text appears immediately. Finally, add a 5-second delayed setState; while it is pending, navigate to a new screen and back — confirm no crash thanks to the mounted guard.',
              takeaway: 'Mutate inside setState, never outside — Flutter has no way to know otherwise.',
            },
            {
              id: 'm1-t10',
              title: 'BuildContext Explained',
              explain: 'BuildContext is your handle into the widget tree — Theme.of, Navigator.of, MediaQuery.of all need it.',
              analogy: 'Imagine you are standing in the Krishna Matha darshan queue at Udupi at 7 a.m. on a Krishna Janmashtami morning. The line snakes through three corridors, past four pillars, around the silver Kanaka-window, into the inner sanctum. Someone hands you a slip of paper that says "you are person 247, currently in corridor 2, between pillar B and pillar C, behind the Mookambika family from Kollur, in front of the Brahmavar grandfather". With that slip, you can ask the line manager: "What is the temple closing time today?" — he checks YOUR position, sees you are in corridor 2 where the morning aarti finishes at 8:30, and tells you that. You can ask: "Where is the prasada counter?" — he sees you are heading to the inner sanctum and points you to the EXIT-side counter, not the entry-side one. The slip itself contains no temple knowledge. But it knows **where you are** in the queue, and that lets the manager look up the right answer for your specific spot. `BuildContext` is that slip. Every widget gets one when its `build()` runs. The context knows the widget\\u2019s exact position in the widget tree. With that position, you can call `Theme.of(context)` (look UP from here for the nearest Theme), `Navigator.of(context)` (find the Navigator above me), `MediaQuery.of(context)` (find the screen-size info above me). The context does not store these things; it just knows where to look.',
              theory: `\`BuildContext\` is just an interface — under the hood it is a `+'`'+`Element`+'`'+`, the runtime counterpart of a widget. Every widget in the tree has a corresponding Element, and the Element knows its parent Element, which knows its parent, all the way to the root. When you call `+'`'+`Theme.of(context)`+'`'+`, Flutter walks UP the Element tree starting from your context, looking for the nearest `+'`'+`Theme`+'`'+` (an `+'`'+`InheritedWidget`+'`'+`), and returns its data.\\n\\nThe key insight: **the context you receive in `+'`'+`build()`+'`'+` is for that exact widget**. If you have nested widgets and call `+'`'+`Navigator.of(context)`+'`'+`, the lookup starts from your widget\\u2019s position. This usually does the right thing, but it bites in two cases. First: showing a `+'`'+`SnackBar`+'`'+` from a button inside a `+'`'+`Scaffold`+'`'+`. If your button widget is built BEFORE the Scaffold (e.g., a top-level widget that returns a Scaffold and uses its own context to call `+'`'+`ScaffoldMessenger.of(context).showSnackBar(...)`+'`'+`), the lookup fails because the Scaffold is below, not above. Fix: wrap in a `+'`'+`Builder`+'`'+` widget to get a context that IS below the Scaffold. Second: opening a dialog from an async callback. By the time the await resolves, the original context may be invalid. Fix: capture `+'`'+`final messenger = ScaffoldMessenger.of(context);`+'`'+` BEFORE the await, then use `+'`'+`messenger.showSnackBar(...)`+'`'+` after.\\n\\nNever store a BuildContext in a field. It is tied to a specific Element, which Flutter may dispose at any time. Storing it is a recipe for "looking up Theme of disposed context" crashes. If you need context after an async gap, capture the things you need from it FIRST.\\n\\nThere are two flavours: `+'`'+`context.read<T>()`+'`'+` and `+'`'+`context.watch<T>()`+'`'+` from the Provider package (Module 3). \`read\` looks up once and does not subscribe; \`watch\` subscribes and rebuilds your widget whenever T changes. Same context, different intent.`,
              whyItMatters: 'Every Flutter app uses context constantly — every Theme, Navigator, MediaQuery, Provider lookup goes through it. The "Looking up a deactivated widget\\u2019s ancestor is unsafe" error is one of the top three errors new Flutter devs hit; understanding context as "your address in the tree at this moment" makes that error solvable instead of mysterious. Senior interview question: "explain BuildContext" — answer well and you sound like you know how Flutter\\u2019s render pipeline actually works.',
              steps: [
                'In a Stateless widget\\u2019s `build(BuildContext context)`, write `final theme = Theme.of(context);` and use `theme.colorScheme.primary` somewhere.',
                'Wrap that widget inside a `Theme(data: ThemeData.dark(), child: ...)` parent. Hot-reload — the colour changes because the lookup found the closer Theme.',
                'Inside a `Scaffold(body: ...)`, try `ScaffoldMessenger.of(context).showSnackBar(...)` from a button. It works.',
                'Now try the same from a button placed in a widget that RETURNS the Scaffold (i.e., the button\\u2019s build context is OUTSIDE the Scaffold). It throws "No ScaffoldMessenger widget found".',
                'Fix it by wrapping the button in `Builder(builder: (innerContext) => ElevatedButton(onPressed: () => ScaffoldMessenger.of(innerContext).showSnackBar(...)))`.',
                'In an async handler, capture `final nav = Navigator.of(context);` BEFORE `await someFuture();`, then use `nav.pop()` after — never use the original `context` after the await.',
                'Add `if (!context.mounted) return;` after every await before using context — the modern (Flutter 3.7+) safe pattern.',
              ],
              code: `// lib/widgets/context_demo.dart
import 'package:flutter/material.dart';

class ContextDemo extends StatelessWidget {
  const ContextDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Context demo')),
      // PROBLEM: this onPressed uses the OUTER context (above Scaffold).
      // ScaffoldMessenger.of will fail to find a Scaffold above this context.
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // WRONG: outer context — no Scaffold above it.
            ElevatedButton(
              onPressed: () {
                // This will throw at runtime if ContextDemo is the top-level widget.
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('From outer context (may fail)')),
                );
              },
              child: const Text('Outer context (risky)'),
            ),
            const SizedBox(height: 16),
            // RIGHT: Builder gives us a context that IS below the Scaffold.
            Builder(
              builder: (innerContext) => ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(innerContext).showSnackBar(
                    const SnackBar(content: Text('From Builder — always works')),
                  );
                },
                child: const Text('Inner context via Builder'),
              ),
            ),
            const SizedBox(height: 16),
            // RIGHT: capture-before-await pattern for async work.
            Builder(
              builder: (innerContext) => ElevatedButton(
                onPressed: () async {
                  final messenger = ScaffoldMessenger.of(innerContext);
                  final navigator = Navigator.of(innerContext);
                  await Future.delayed(const Duration(seconds: 1));
                  // Cannot use innerContext here — capture above is the pattern.
                  messenger.showSnackBar(
                    const SnackBar(content: Text('Captured before await')),
                  );
                  // navigator.pop(); // would close this screen safely.
                },
                child: const Text('Async with capture'),
              ),
            ),
            const SizedBox(height: 16),
            // RIGHT: Flutter 3.7+ safe pattern using context.mounted.
            Builder(
              builder: (innerContext) => ElevatedButton(
                onPressed: () async {
                  await Future.delayed(const Duration(seconds: 1));
                  if (!innerContext.mounted) return;
                  ScaffoldMessenger.of(innerContext).showSnackBar(
                    const SnackBar(content: Text('mounted-checked')),
                  );
                },
                child: const Text('Async with mounted check'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**"No Scaffold/Theme/Navigator widget found in context".** Your context is above the widget you are looking for. Fix: wrap in `Builder` to get a context below the ancestor, or restructure the tree.',
                '**Storing context in a field for later use.** The Element backing it gets disposed; using it later throws "deactivated widget ancestor". Fix: never store; capture the thing you need (the Navigator, the Theme) before the async gap.',
                '**Using context after `await` without `mounted` check.** Same crash as above. Fix: `if (!context.mounted) return;` after every await before any context use.',
                '**Calling Theme.of inside a `const` widget\\u2019s build.** It works, but the widget cannot actually be const because Theme.of needs runtime lookup. Fix: drop `const` on widgets that need runtime context lookups.',
                '**Wrong context in a tap handler defined in a parent.** You define `onTap: () => Navigator.of(context).pop();` in a parent that does not have a Navigator above it. Fix: define the handler closer to where the Navigator IS, or use `Navigator.maybeOf` and handle null.',
                '**Calling `.of(context)` 50 times in one build.** Each call walks the tree. Mostly cheap, but for `MediaQuery.of` in a hot loop it shows up in profiling. Fix: cache once at top of build — `final size = MediaQuery.of(context).size;`.',
                '**Confusing `context.read<T>()` and `context.watch<T>()` (Provider).** `read` for one-shot lookups, `watch` for subscribing. Mixing them causes either no rebuild or rebuild-on-everything. Fix: read in callbacks, watch in build.',
                '**Passing context across isolates.** Context is tied to the UI isolate; you cannot use it from a background isolate (Module 5). Fix: do the work in the isolate, send back data via SendPort, use context on the UI side.',
              ],
              tryIt: 'Build a screen with a `Scaffold` containing a button. The button should: (1) call `MediaQuery.of(context).size` and show the screen width in a SnackBar, (2) use a `Builder` so the SnackBar actually appears, (3) wait 2 seconds, then show a second SnackBar with the current `Theme.of(context).colorScheme.primary` colour value — guard the post-await access with `context.mounted`. Now extend it: rotate your phone (or use the device-toolbar in Chrome to resize) and tap again — confirm the new width is reflected because MediaQuery.of triggers a rebuild when the window changes.',
              takeaway: 'Context is your address inside the tree; pass it up, never store it.',
            },
            {
              id: 'm1-t11',
              title: 'Keys: ValueKey, ObjectKey, GlobalKey',
              explain: 'Keys tell Flutter which widget is which when lists reorder so state moves with the right item.',
              analogy: 'Picture the laundry room of a Manipal University boys\\u2019 hostel. There are 80 students in the block, each has a cloth bag. Suma the laundry-mama collects all 80 bags every Wednesday morning, washes them, irons them, and brings them back Thursday evening. Now: how does she know whose bag is whose? Two systems are possible. **System A — by position**: she just remembers "this bag came from room 14, so it goes back to room 14". Works fine. UNTIL the warden reshuffles rooms mid-semester — Pradeep moves from 14 to 22, Karthik from 22 to 14. Suma still puts the "room 14" bag in room 14. Pradeep gets Karthik\\u2019s clothes. Disaster. **System B — by tag**: every bag has a small fabric tag stitched in with the student\\u2019s ID. Suma reads the tag, looks up the room number from her register, and delivers correctly. Reshuffles do not break anything. Flutter is exactly like this. By default Flutter identifies widgets in a list by **position** (System A) — the third item in the list is "the third widget". When you reorder the list (swap items 1 and 3), Flutter sees position 1 has new content and position 3 has new content; if those positions hold StatefulWidgets, the State that was in position 1 stays in position 1 with the new widget — and your animation/scroll/textfield state ends up on the wrong row. **Keys** are the fabric tags. When you give each widget a unique key, Flutter matches by key (System B) and the state moves with the right item.',
              theory: `Flutter has three main key types and one rule. The rule first: **without a key, sibling widgets of the same type are matched by position in the list**. Add keys, they get matched by key. Now the types.\\n\\n`+'`'+`ValueKey<T>(T value)`+'`'+` — the most common. Wraps any value with a sensible `+'`'+`==`+'`'+` and `+'`'+`hashCode`+'`'+`. Use it when you have a stable ID for the item: `+'`'+`ValueKey(order.id)`+'`'+`, `+'`'+`ValueKey(student.rollNumber)`+'`'+`. Two ValueKeys are equal iff their values are equal. NEVER use the index as a ValueKey — that defeats the purpose.\\n\\n`+'`'+`ObjectKey(Object obj)`+'`'+` — wraps the object itself by **identity** (`+'`'+`identical()`+'`'+`), not value. Use when you have a stable object reference but no useful ID field: `+'`'+`ObjectKey(menuItem)`+'`'+`. Reusing the same Order instance across rebuilds keeps the key stable; constructing a fresh Order with the same fields produces a DIFFERENT key.\\n\\n`+'`'+`UniqueKey()`+'`'+` — a fresh key every time it is constructed. Use sparingly — it FORCES the widget to be treated as new, throwing away its State. Sometimes useful to "reset" a widget by changing its key.\\n\\n`+'`'+`GlobalKey<T>`+'`'+` — heavyweight. Lets you access the State or BuildContext of a widget from ANYWHERE in your app. Required for `+'`'+`Form`+'`'+`/`+'`'+`FormState`+'`'+` validation, `+'`'+`Scaffold.of`+'`'+` workarounds, and animations that need to read render-box positions. Each GlobalKey must be unique across the entire app and must not be reused — share it via a top-level final or a Provider, never construct two with the same name.\\n\\n**When do keys matter?** Only for **siblings of the same type in a list**. A `+'`'+`Column`+'`'+` of fixed children does not need keys. A `+'`'+`ListView`+'`'+` of `+'`'+`StudentCard`+'`'+` widgets where the list can reorder, items can be inserted in the middle, or items can be dismissed — needs keys. Stateless widgets with no animation also rarely care; the visual result is identical with or without keys. Stateful widgets, animations, and scroll position survival care intensely.`,
              whyItMatters: 'The "wrong state on wrong row" bug is one of the most-debugged issues in Flutter — your TextField shows the wrong order\\u2019s notes after a deletion, your dismissed item leaves its red background on the wrong card. Knowing keys turns a 2-hour debug into a 5-second fix. Interview classic: "explain when you need a Key" — junior says "always", senior says "for siblings of the same type in a reorderable list when state must follow identity, not position".',
              steps: [
                'Build a `Column` of three `StatefulWidget` items, each with its own internal counter.',
                'Add a "Shuffle" button that randomly reorders the list. Tap +1 on the middle item, then shuffle. Watch the counter stay in the middle slot — wrong item.',
                'Add `key: ValueKey(items[i].id)` to each list item. Re-run. Counter now follows the item across shuffles.',
                'Replace `ValueKey(item.id)` with `ValueKey(i)` (the index). Counters break again — index keys are useless.',
                'For a Form with TextFields and validation, declare `final _formKey = GlobalKey<FormState>();` at the top of your State, pass it to `Form(key: _formKey, ...)`, then call `_formKey.currentState!.validate()` from a button.',
                'Try adding the same `GlobalKey` to two widgets — Flutter throws "Multiple widgets used the same GlobalKey" at runtime.',
                'Use `UniqueKey()` to deliberately RESET a child widget — every parent rebuild produces a new key, forcing the child to discard its State.',
              ],
              code: `// lib/widgets/keys_demo.dart
import 'package:flutter/material.dart';

class StallTile extends StatefulWidget {
  final String name;
  // Always accept a key in the constructor — this is what makes ValueKey work.
  const StallTile({required Key key, required this.name}) : super(key: key);

  @override
  State<StallTile> createState() => _StallTileState();
}

class _StallTileState extends State<StallTile> {
  int _orders = 0;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(widget.name),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Orders: \$_orders'),
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => setState(() => _orders++),
          ),
        ],
      ),
    );
  }
}

class KeysDemo extends StatefulWidget {
  const KeysDemo({super.key});

  @override
  State<KeysDemo> createState() => _KeysDemoState();
}

class _KeysDemoState extends State<KeysDemo> {
  // Each stall has a stable ID. The ID is what we use for the key.
  List<Map<String, String>> _stalls = [
    {'id': 's1', 'name': 'Anjali Tiffin'},
    {'id': 's2', 'name': 'Pradeep Bhel'},
    {'id': 's3', 'name': 'Karthik Chaat'},
  ];

  void _shuffle() {
    setState(() {
      _stalls = [..._stalls.reversed];
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Keys demo')),
      body: Column(
        children: [
          ElevatedButton(onPressed: _shuffle, child: const Text('Shuffle')),
          Expanded(
            child: ListView(
              children: _stalls.map((s) {
                return StallTile(
                  // CORRECT: stable ValueKey. Order count follows the stall.
                  key: ValueKey(s['id']),
                  name: s['name']!,
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}`,
              pitfalls: [
                '**Using the index as a key.** `ValueKey(i)` for the i-th item — when items reorder, the keys do not move with them, so it behaves exactly like no key. Fix: use a stable identifier that belongs to the item itself (id, slug, rollNumber).',
                '**Forgetting to forward `key` from a wrapper widget.** Your `StallTile({required this.name})` does not pass `super.key`, so `ValueKey(...)` you pass from outside is ignored. Fix: every constructor should accept and forward `Key? key` (or `super.key` in modern Dart).',
                '**Constructing GlobalKey inside `build()`.** Every rebuild gets a new GlobalKey, Flutter complains and your State resets. Fix: declare GlobalKey as a `final` field on the State, never inside build.',
                '**Reusing the same GlobalKey on two widgets.** Crash: "Multiple widgets used the same GlobalKey". Fix: each GlobalKey must live on exactly one widget at a time.',
                '**Putting GlobalKey on every list item.** Works but heavy — GlobalKey forces extra bookkeeping. Fix: ValueKey is enough for list items; reserve GlobalKey for forms and one-off cross-tree access.',
                '**Adding keys to widgets that are not in a reorderable list.** No bug, just confusion — keys do nothing for fixed children of a Column. Fix: keys for siblings of the same type in a list, that\\u2019s the rule.',
                '**Using `UniqueKey()` accidentally everywhere.** UniqueKey forces a fresh widget every rebuild, killing your State. Fix: only use it when you DELIBERATELY want a reset (e.g., re-mounting an animation).',
                '**Mixing keyed and non-keyed siblings of the same type.** Half the items have keys, half do not — Flutter\\u2019s reconciliation gets weird. Fix: all-or-nothing for keyed siblings.',
                '**Comparing `ValueKey(student)` instead of `ValueKey(student.id)`.** ValueKey uses `==` on the wrapped value; if your Student class does not override `==`, two equivalent students will compare as different. Fix: pass a primitive ID, not the whole object.',
              ],
              tryIt: 'Build a `ListView` of 5 `StallTile` widgets (use the code above). First version: pass NO keys. Tap +1 on the middle stall to set its count to 7. Hit "Shuffle" — watch the count of 7 stay in the MIDDLE position even though the middle stall is now a different one. Second version: add `key: ValueKey(s["id"])`. Repeat. The count of 7 now FOLLOWS the original stall to its new position. Now extend it: add a "Reset middle stall" button that wraps just the middle tile in `KeyedSubtree(key: UniqueKey(), child: StallTile(...))`. Tap the button — the middle tile\\u2019s count resets to 0 because UniqueKey forced a fresh State.',
              takeaway: 'Reorder a list of stateful widgets without keys and your state ends up on the wrong row.',
            },
          ],
        },
        {
          id: 'm1-s3',
          title: 'Scaffold and the Material Surface',
          topics: [
            {
              id: 'm1-t12',
              title: 'Scaffold Slots — The Banana-Leaf Layout',
              explain: 'Scaffold gives you the standard slots every Material screen needs in one widget.',
              analogy: 'Sit down for lunch at a Udupi banana-leaf bhojanashala — think Diana in Udupi, or the Krishna Matha-style halls around Car Street. The waiter tips a fresh banana leaf in front of you. Notice it is not blank chaos. There are **standardised slots**: rice goes in the middle, the two main curries (sambhar and rasam) get poured to the right of the rice, the dry palya goes top-left, the sweet (Mysore Pak or holige) sits top-right, the salt and pickle hug the upper edge, the chutney is bottom-left, the papad balances on top of the rice, and a small steel glass of buttermilk stands to the upper-right of the leaf. Every meal in every Udupi mess uses the same slots. You never wonder where the pickle is. The waiter never wonders where to pour the rasam. The diner never gets confused. **`Scaffold` is the banana leaf**. It is a Material-design widget that hands you a pre-cut layout with named slots — `appBar` on top (the meal\\u2019s "header" with the restaurant name and hand-wash service), `body` in the middle (the rice mountain — your main content), `bottomNavigationBar` at the bottom (the salt/pickle strip — quick access to top-level destinations), `floatingActionButton` floating in the lower-right (the steel glass of buttermilk — the one signature action), `drawer` swiping in from the left (the menu card you ask for), `endDrawer` from the right (the secondary menu), and a few more. You fill the slots; Scaffold positions, sizes, and layers them correctly with the right elevation, safe-area handling, and gesture support. Build a Material app without Scaffold and you are eating biryani off a paper plate — possible, but you are reinventing the leaf.',
              theory: `\`Scaffold\` is a `+'`'+`StatelessWidget`+'`'+` that lays out the standard Material visual surface for one screen. Every screen in a Material app should be wrapped in a Scaffold (or a Cupertino equivalent if you are doing iOS-only). Its constructor takes named slot parameters; you pass widgets to the slots you need and skip the rest.\\n\\nThe main slots: `+'`'+`appBar`+'`'+` (a `+'`'+`PreferredSizeWidget`+'`'+`, almost always an `+'`'+`AppBar`+'`'+`) docked at top with elevation and safe-area handling; `+'`'+`body`+'`'+` (any widget) filling the rest of the screen; `+'`'+`bottomNavigationBar`+'`'+` docked at bottom (nav, persistent footer, BottomAppBar); `+'`'+`floatingActionButton`+'`'+` (a circular action button) positioned with `+'`'+`floatingActionButtonLocation`+'`'+` (default lower-right); `+'`'+`drawer`+'`'+` and `+'`'+`endDrawer`+'`'+` (slide-from-edge sheets, opened by swipe or by `+'`'+`Scaffold.of(context).openDrawer()`+'`'+`); `+'`'+`bottomSheet`+'`'+` (a persistent bottom sheet); `+'`'+`backgroundColor`+'`'+` (override the surface colour); `+'`'+`resizeToAvoidBottomInset`+'`'+` (default true — body shrinks when keyboard appears); `+'`'+`extendBody`+'`'+` and `+'`'+`extendBodyBehindAppBar`+'`'+` (let body draw under the AppBar/BottomBar for translucent effects).\\n\\nA Scaffold provides one important non-visual service: `+'`'+`ScaffoldMessenger`+'`'+`. SnackBars, MaterialBanners, and the like are shown via `+'`'+`ScaffoldMessenger.of(context).showSnackBar(...)`+'`'+`. The messenger sits ABOVE the Scaffold (provided by `+'`'+`MaterialApp`+'`'+`), so SnackBars survive route changes properly.\\n\\nOne Scaffold per screen is the rule. Nesting Scaffolds is unusual — only do it for embedded layouts like a settings drawer that has its own AppBar. For a tabbed interface, put one Scaffold at the top level and switch the `+'`'+`body`+'`'+` based on the selected tab (or use `+'`'+`IndexedStack`+'`'+` to preserve state).\\n\\nThe banana-leaf is mostly invisible glue. Skip Scaffold and you also skip: keyboard avoidance, system-UI overlay handling (notch/status bar), the FAB pinning logic, drawer gesture detection, and the SnackBar plumbing. Reinventing all of that by hand is a week of work for nothing.`,
              whyItMatters: 'Scaffold is the foundation widget every Material screen sits on; you will type `Scaffold(...)` thousands of times. Knowing every slot lets you express common UI patterns (drawer + bottom nav + FAB) in 30 lines instead of 300. In interviews, "describe a Flutter Scaffold" is the warm-up question — answer fluently and you signal real Flutter experience.',
              steps: [
                'Create `lib/screens/udupi_menu_screen.dart` with a `class UdupiMenuScreen extends StatelessWidget`.',
                'Return a `Scaffold` with `appBar: AppBar(title: const Text("Diana Restaurant — Udupi"))`.',
                'Add `body: ListView(children: [...])` containing five `ListTile`s for kori rotti, neer dosa, ghee roast, etc.',
                'Add `floatingActionButton: FloatingActionButton(onPressed: ..., child: const Icon(Icons.add))` for "Add to order".',
                'Add `bottomNavigationBar: BottomNavigationBar(items: [Home, Menu, Cart, Profile], onTap: ...)` for top-level nav.',
                'Add `drawer: Drawer(child: ListView(...))` with three or four nav links.',
                'Run `flutter run`, swipe from the left edge — drawer opens. Tap the FAB — wire it to `ScaffoldMessenger.of(context).showSnackBar(...)`.',
                'Set `extendBodyBehindAppBar: true` and add a translucent AppBar to see content scrolling underneath.',
              ],
              code: `// lib/screens/udupi_menu_screen.dart
import 'package:flutter/material.dart';

class UdupiMenuScreen extends StatelessWidget {
  const UdupiMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Top slot: title strip with restaurant name and an overflow menu.
      appBar: AppBar(
        title: const Text('Diana Restaurant — Udupi'),
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: () {}),
          IconButton(icon: const Icon(Icons.more_vert), onPressed: () {}),
        ],
      ),
      // Side slot: navigation drawer (the menu card you ask for).
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: const [
            DrawerHeader(child: Text('Menu sections')),
            ListTile(leading: Icon(Icons.breakfast_dining), title: Text('Tiffin')),
            ListTile(leading: Icon(Icons.lunch_dining), title: Text('Meals')),
            ListTile(leading: Icon(Icons.set_meal), title: Text('Coastal seafood')),
            ListTile(leading: Icon(Icons.local_drink), title: Text('Drinks')),
          ],
        ),
      ),
      // Middle slot: the rice mountain — actual content.
      body: ListView(
        children: const [
          ListTile(title: Text('Kundapura Kori Rotti'), trailing: Text('₹220')),
          ListTile(title: Text('Neer Dosa with Chicken Ghassi'), trailing: Text('₹260')),
          ListTile(title: Text('Ghee Roast Mutton'), trailing: Text('₹420')),
          ListTile(title: Text('Anjal Tava Fry'), trailing: Text('₹450')),
          ListTile(title: Text('Goli Baje + Coconut Chutney'), trailing: Text('₹90')),
        ],
      ),
      // Floating slot: the buttermilk glass — one signature action.
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Added to order')),
          );
        },
        icon: const Icon(Icons.add_shopping_cart),
        label: const Text('Add'),
      ),
      // Bottom slot: salt-pickle strip — top-level destinations.
      bottomNavigationBar: BottomNavigationBar(
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.restaurant_menu), label: 'Menu'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: 'Cart'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
        currentIndex: 1,
        onTap: (i) {},
      ),
    );
  }
}`,
              pitfalls: [
                '**Forgetting to wrap your screen in `Scaffold`.** SnackBars throw "No ScaffoldMessenger found", keyboard does not avoid the textfield, status bar overlaps your content. Fix: every screen returns a Scaffold (or `CupertinoPageScaffold` for iOS-only).',
                '**Putting a `Scaffold` as the home of `MaterialApp` AND inside the home widget.** Two Scaffolds, weird elevation. Fix: Scaffold lives in the screen widget; MaterialApp\\u2019s `home` is just `MyHomeScreen()`.',
                '**Calling `ScaffoldMessenger.of(context)` from above the Scaffold.** No messenger above — crash. Fix: wrap in a `Builder` to get a context below the Scaffold (see t10).',
                '**Setting `appBar` to a non-PreferredSize widget.** Compile error. Fix: use `AppBar` directly, or wrap a custom widget in `PreferredSize(preferredSize: Size.fromHeight(60), child: ...)`.',
                '**Disabling `resizeToAvoidBottomInset` by accident.** TextFields go behind the keyboard, user cannot see what they type. Fix: leave it true (default) unless you intentionally want the body fixed (e.g., a chat where the message bar floats).',
                '**Using a `Scaffold` inside a `Dialog`.** Dialogs already provide their own surface — nesting a Scaffold gets you double app-bars. Fix: use `AlertDialog` or plain `Material` widgets inside dialogs.',
                '**Putting heavy stateful widgets in the `drawer` slot.** The drawer rebuilds every time it opens. Fix: extract drawer contents into a const widget, or `IndexedStack` to preserve state.',
                '**Using `Stack` instead of Scaffold to overlay a FAB.** Reinvents positioning, loses safe-area, breaks gesture handling. Fix: use the Scaffold\\u2019s `floatingActionButton` slot — it handles all of this.',
              ],
              tryIt: 'Build a `KundapuraFishMarketScreen` Scaffold with: AppBar titled "Gangolli Harbour Catch", a Drawer listing today\\u2019s sellers (your cousin\\u2019s co-op, Kapu Fishers, Maravanthe Marine), a body `ListView` of 6 fish prices for the day (anjal ₹650/kg, bangda ₹240/kg, mathi ₹180/kg, prawns ₹520/kg, pomfret ₹780/kg, crabs ₹400/dozen), a FAB labelled "Place bid" that shows a SnackBar, and a BottomNavigationBar with Home/Bids/Profile. Now extend it: open the drawer programmatically from a button in the AppBar\\u2019s `actions` using `Scaffold.of(context).openDrawer()` (you will need a Builder).',
              takeaway: 'AppBar on top, body in the middle, FAB and bottomNav below — Scaffold wires it all up.',
            },
            {
              id: 'm1-t13',
              title: 'AppBar — Title, Leading, Actions',
              explain: 'AppBar is the strip across the top with the title, a leading widget, and action buttons.',
              analogy: 'Think of the dashboard of a KSRTC Volvo bus running the Bangalore-Kundapura overnight route. There is a fixed strip across the front of the cabin and it has exactly three zones, never more, never rearranged. **Left zone**: the driver\\u2019s side controls — door-open lever, headlight stalk, indicator stick. The driver reaches there reflexively. **Centre zone**: the destination scroller — the big illuminated board reading "BENGALURU → KUNDAPURA via SHIVAMOGGA". This is what passengers stare at to confirm they boarded the right bus. **Right zone**: the conductor\\u2019s controls — the AC vent dial, the bell push, the LED brightness knob, the stop-request indicator. Quick-access action items, used many times per trip but never the centrepiece. Now look at any Flutter `AppBar`. Same three zones. **`leading`** on the left — usually a back-arrow or the drawer hamburger. **`title`** in the centre — the screen name, just like the destination board. **`actions`** on the right — search icon, share icon, overflow menu (the three dots). Material design enforces this layout because it is what users have learned to scan in 200 milliseconds. The KSRTC dashboard has not changed since the 1990s; the Material AppBar has not meaningfully changed since 2014. Both work because the slots are predictable.',
              theory: `\`AppBar\` is a `+'`'+`PreferredSizeWidget`+'`'+` (preferred height of 56 logical pixels by default, expandable). It is almost always passed to the `+'`'+`appBar:`+'`'+` slot of a `+'`'+`Scaffold`+'`'+`. Its core named parameters: `+'`'+`leading`+'`'+` (the left-most widget, default is a back-arrow if a route exists or a drawer-toggle if a Scaffold has a drawer; pass `+'`'+`null`+'`'+` to suppress, or set `+'`'+`automaticallyImplyLeading: false`+'`'+` to disable the auto-back); `+'`'+`title`+'`'+` (any widget — usually `+'`'+`Text`+'`'+` but can be a `+'`'+`Row`+'`'+` of icons + text or a `+'`'+`SearchBar`+'`'+`); `+'`'+`actions`+'`'+` (a list of widgets along the right edge — typically `+'`'+`IconButton`+'`'+`s and a final `+'`'+`PopupMenuButton`+'`'+` for overflow); `+'`'+`bottom`+'`'+` (a second strip below the title, typically a `+'`'+`TabBar`+'`'+`); `+'`'+`flexibleSpace`+'`'+` (a widget rendered behind the title — for gradient/image backgrounds, often used with `+'`'+`SliverAppBar`+'`'+` for collapsible headers).\\n\\nVisual knobs: `+'`'+`backgroundColor`+'`'+`, `+'`'+`foregroundColor`+'`'+` (icon and text colour), `+'`'+`elevation`+'`'+` (shadow depth), `+'`'+`scrolledUnderElevation`+'`'+` (Material 3 — the elevation when content scrolls under), `+'`'+`centerTitle`+'`'+` (true on iOS by default, false on Android), `+'`'+`toolbarHeight`+'`'+` (override the 56 px default), `+'`'+`titleSpacing`+'`'+` (gap between leading and title), `+'`'+`shape`+'`'+` (rounded bottom corners are trendy in Material 3).\\n\\nFor scrollable screens that need a "stretchy" header that collapses on scroll, use `+'`'+`SliverAppBar`+'`'+` instead — same parameters plus `+'`'+`expandedHeight`+'`'+`, `+'`'+`pinned`+'`'+`, `+'`'+`floating`+'`'+`, `+'`'+`snap`+'`'+`. Place it inside a `+'`'+`CustomScrollView`+'`'+` with `+'`'+`SliverList`+'`'+`/`+'`'+`SliverGrid`+'`'+` underneath.\\n\\nThe `+'`'+`actions`+'`'+` list typically holds 1-3 IconButtons. If you have more, the last action should be a `+'`'+`PopupMenuButton`+'`'+` showing the overflow icon (three vertical dots) so secondary items hide behind it. Cramming five icons into the AppBar makes the title disappear on small screens.`,
              whyItMatters: 'AppBar is the second-most-typed widget in Flutter (after Container). Knowing its slots and Material 3 quirks (scrolledUnderElevation surprises everyone the first time) prevents UI inconsistencies that screenshot reviewers reject in code reviews. SliverAppBar specifically is interview gold — most juniors do not know about it and ship their app with a clunky always-pinned header instead of the smooth collapsing one users expect.',
              steps: [
                'Replace your `AppBar(title: const Text("Diana — Udupi"))` with one that adds `centerTitle: true`, `backgroundColor: Colors.deepOrange`, and `foregroundColor: Colors.white`.',
                'Add `actions: [IconButton(icon: const Icon(Icons.search), onPressed: () {}), IconButton(icon: const Icon(Icons.share), onPressed: () {})]`.',
                'Add a `PopupMenuButton<String>` as the LAST action item with three menu items ("Settings", "About", "Sign out") and an `onSelected` handler that prints which one was tapped.',
                'Add `bottom: const TabBar(tabs: [Tab(text: "Tiffin"), Tab(text: "Meals"), Tab(text: "Coastal")])` and wrap the screen in `DefaultTabController(length: 3, child: ...)`.',
                'Set the body to `TabBarView(children: [...])` with three child screens — confirm tab swipes work.',
                'Convert the AppBar into a `SliverAppBar(expandedHeight: 200, pinned: true, flexibleSpace: FlexibleSpaceBar(title: const Text("Diana — Udupi"), background: Image.network(...)))` inside a `CustomScrollView`.',
                'Scroll up and watch the AppBar collapse from 200 px to 56 px while staying pinned at the top.',
              ],
              code: `// lib/screens/udupi_diana_app_bar.dart
import 'package:flutter/material.dart';

class UdupiDianaAppBarScreen extends StatelessWidget {
  const UdupiDianaAppBarScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          // Left zone: drawer hamburger (auto-added because Scaffold has a drawer)
          // OR a back-arrow if there is a route to pop. Both auto-handled.
          // To override:
          // leading: IconButton(icon: const Icon(Icons.menu), onPressed: () {}),

          // Centre zone: destination board.
          title: const Text('Diana Restaurant — Udupi'),
          centerTitle: true,
          backgroundColor: Colors.deepOrange,
          foregroundColor: Colors.white,
          elevation: 4,
          scrolledUnderElevation: 6,

          // Right zone: conductor controls — quick actions plus an overflow.
          actions: [
            IconButton(
              icon: const Icon(Icons.search),
              tooltip: 'Search dishes',
              onPressed: () {},
            ),
            IconButton(
              icon: const Icon(Icons.share),
              tooltip: 'Share menu',
              onPressed: () {},
            ),
            PopupMenuButton<String>(
              tooltip: 'More',
              onSelected: (value) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Selected: \$value')),
                );
              },
              itemBuilder: (_) => const [
                PopupMenuItem(value: 'settings', child: Text('Settings')),
                PopupMenuItem(value: 'about', child: Text('About Diana Udupi')),
                PopupMenuItem(value: 'signout', child: Text('Sign out')),
              ],
            ),
          ],

          // Secondary strip: section tabs.
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Tiffin'),
              Tab(text: 'Meals'),
              Tab(text: 'Coastal'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            Center(child: Text('Tiffin items')),
            Center(child: Text('Full meals')),
            Center(child: Text('Coastal seafood')),
          ],
        ),
      ),
    );
  }
}

// Bonus — a SliverAppBar version with a collapsible header.
class UdupiDianaSliverAppBar extends StatelessWidget {
  const UdupiDianaSliverAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text('Diana — Udupi'),
              background: Container(
                color: Colors.deepOrange.shade300,
                child: const Center(
                  child: Icon(Icons.restaurant_menu, size: 96, color: Colors.white),
                ),
              ),
            ),
          ),
          SliverList.list(
            children: const [
              ListTile(title: Text('Kundapura Kori Rotti'), trailing: Text('₹220')),
              ListTile(title: Text('Neer Dosa + Ghassi'), trailing: Text('₹260')),
              ListTile(title: Text('Anjal Tava Fry'), trailing: Text('₹450')),
            ],
          ),
        ],
      ),
    );
  }
}`,
              pitfalls: [
                '**Cramming five IconButtons into `actions`.** On a 360 px wide screen the title disappears or wraps. Fix: keep 1-3 visible icons and stuff the rest into a `PopupMenuButton` overflow.',
                '**Forgetting `automaticallyImplyLeading: false` on a root screen.** When you push a route onto a Navigator, AppBar auto-adds a back arrow even if you do not want one. Fix: set `automaticallyImplyLeading: false` on home/root screens.',
                '**Setting `leading: const Icon(Icons.menu)` instead of `IconButton`.** Plain `Icon` is not tappable. Fix: wrap in `IconButton(icon: Icon(Icons.menu), onPressed: () => Scaffold.of(context).openDrawer())` or rely on the auto drawer toggle.',
                '**Using `Text` with a long title that overflows.** AppBar truncates with ellipsis silently — users see "Bangalore Premium Bus..." instead of the destination. Fix: shorten the title, or use `FittedBox(fit: BoxFit.scaleDown, child: Text(...))`.',
                '**Forgetting `bottom` requires a `TabController`.** TabBar inside `bottom` throws "No TabController found". Fix: wrap the Scaffold in `DefaultTabController(length: N, child: ...)` or pass an explicit `controller:`.',
                '**Mixing AppBar in a screen that uses CustomScrollView.** The AppBar does not scroll with content. Fix: switch to `SliverAppBar` inside the slivers list.',
                '**Setting `centerTitle: true` everywhere blindly.** Material spec says left-aligned on Android, centred on iOS — defaulting differs. Fix: leave it null (uses platform default) unless you have a brand reason to centre.',
                '**Overriding `elevation: 0` and forgetting `scrolledUnderElevation`.** In Material 3 the AppBar gets a subtle elevation when content scrolls under it; setting elevation to 0 still shows scrolled-under tint. Fix: set both `elevation: 0` AND `scrolledUnderElevation: 0` if you want a truly flat AppBar.',
                '**Using AppBar inside a Dialog.** AppBars assume a Scaffold context for messenger lookups. Fix: use a plain `Row` with title + close icon for dialogs.',
              ],
              tryIt: 'Build a `KapuLighthouseScreen` AppBar with: title "Kapu Lighthouse Tour", a `leading: IconButton(icon: Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context))`, three actions (search, favourite-toggle, share), and a `PopupMenuButton` overflow with "About Kapu", "Tide times", "Booking history". Add a `bottom: TabBar` with three tabs ("Photos", "History", "Booking") and a `TabBarView` body. Now extend it: convert to a `SliverAppBar` with `expandedHeight: 250`, a `flexibleSpace` showing a coloured container labelled "Kapu Beach", and `pinned: true`. Scroll up — the title should collapse from large to small while pinned.',
              takeaway: 'Title in the centre, actions on the right, leading on the left. Material rules.',
            },
            {
              id: 'm1-t14',
              title: 'BottomNavigationBar and NavigationBar',
              explain: 'BottomNavigationBar is the row of icons at the bottom for switching between top-level destinations.',
              analogy: 'Imagine a Udupi banana-leaf meal at Woodlands near the bus stand. The leaf has fixed, easy-to-reach compartments: rice in the centre, sambar on one side, palya, pickle, payasa. You do not hide rice inside a cupboard because every diner needs it again and again. A **bottom navigation bar** is exactly that: the three to five places users visit every few seconds. In a Bangalore delivery app those are Home, Orders, Cart, and Profile. If you put ten items there, it becomes like serving rasam, curd, papad, bill counter, parcel token, and wash basin on the same banana leaf - messy and confusing.',
              theory: `Bottom navigation is for the big rooms of your app, not every tiny cupboard. Imagine a food delivery app: Home, Orders, Cart, Profile. These are places the user visits again and again. So they deserve permanent seats at the bottom, like regular customers at a Udupi hotel who already know where to sit.\n\nFlutter has two common bottom-tab widgets. \`BottomNavigationBar\` is the older Material 2 widget and still appears in many codebases. \`NavigationBar\` is the Material 3 replacement with cleaner APIs, better animations, and a modern selected indicator. If you are starting fresh in Material 3, use \`NavigationBar\`.\n\nImportant spoon-feed point: bottom tabs usually **do not push new routes**. When the user taps Cart, you are not going "forward" into a new story page. You are switching the main body area. That is why the beginner pattern uses an integer: \`selectedIndex\`.\n\nThe app stores \`selectedIndex = 0\`. The body shows \`pages[selectedIndex]\`. When the user taps the second tab, Flutter gives you \`index = 1\`. You call \`setState(() => selectedIndex = index)\`. Then Flutter rebuilds, reads \`pages[1]\`, and shows that page. That is the entire magic. No secret temple tunnel.\n\nUse three to five destinations. If you put eight tabs, the bottom bar becomes a Bangalore BMTC bus at peak hour: everyone is technically inside, nobody is comfortable. Move extra destinations to a Drawer.`,
              whyItMatters: 'Most production mobile apps have bottom tabs. Interviewers use this topic to check whether you understand **state plus layout plus navigation intent**. If you push a new page every time someone taps a bottom tab, the back button becomes weird and users feel lost. A clean bottom nav tells the hiring manager you can build normal app shells, not just toy screens.',
              steps: [
                'Make the shell a `StatefulWidget` because the selected tab changes.',
                'Write `int selectedIndex = 0;` — 0 means the first tab is active.',
                'Create `pages = const [...]` with exactly one page widget per destination.',
                'Set `body: pages[selectedIndex]`; this is where the selected page appears.',
                'Add `NavigationBar` in `bottomNavigationBar`, not inside the body Column.',
                'Set `selectedIndex: selectedIndex` so Flutter highlights the correct tab.',
                'In `onDestinationSelected`, call `setState(() => selectedIndex = index);`.',
                'Run the app and tap each tab; if one crashes, your pages list and destinations list do not match.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const UdupiTabsApp());

class UdupiTabsApp extends StatelessWidget {
  const UdupiTabsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
      home: const MainShell(),
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int selectedIndex = 0;

  final pages = const [
    _TabPage(title: 'Udupi Specials', subtitle: 'Masala dosa and filter coffee'),
    _TabPage(title: 'Kundapura Orders', subtitle: 'Track kori rotti parcels'),
    _TabPage(title: 'Bangalore Cart', subtitle: 'Office lunch basket'),
    _TabPage(title: 'Profile', subtitle: 'Anjali, Indiranagar'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Namma Food')),
      body: pages[selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) {
          setState(() => selectedIndex = index);
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), selectedIcon: Icon(Icons.receipt_long), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.shopping_bag_outlined), selectedIcon: Icon(Icons.shopping_bag), label: 'Cart'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class _TabPage extends StatelessWidget {
  const _TabPage({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(title, style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text(subtitle),
        ],
      ),
    );
  }
}`,
              pitfalls: [
                '**Too many tabs.** Six destinations become unreadable. Keep the daily three to five and move the rest to a Drawer.',
                '**Pushing routes on tab tap.** Bottom tabs should switch body content, not stack new pages. Use `selectedIndex` for basic tabs.',
                '**Mismatched page count.** Four destinations but three pages causes range errors. Keep both lists aligned.',
                '**Long labels.** `Bangalore Corporate Lunches` will truncate. Use `Lunch` or `Orders`.',
                '**Forgetting selectedIndex.** Without `selectedIndex`, Flutter cannot highlight the current tab.',
                '**State inside tab body lost.** Rebuilding pages from scratch can reset scroll position; later you can use `IndexedStack` to preserve it.',
              ],
              tryIt: 'Build the sample exactly once. Then change the destinations to `Home`, `Menu`, `Offers`, and `Account` for a Udupi hotel app. Add one more `_TabPage` for "Today: neer dosa combo". Now extend it to use `IndexedStack` instead of `pages[selectedIndex]` so tab state is preserved.',
              takeaway: 'Three to five top-level destinations only — anything more belongs in a Drawer.',
            },
            {
              id: 'm1-t15',
              title: 'Drawer and EndDrawer',
              explain: 'Drawer is the swipe-from-edge sheet for navigation that does not fit in a bottom bar.',
              analogy: 'Think about Majestic in Bangalore. The main platforms are obvious: buses to Udupi, Kundapura, Mangaluru, Mysuru. But there are also parcel counters, enquiry desks, lost-and-found, cloak rooms, recharge shops, and staff-only gates. Those useful but less-frequent places sit on side lanes, not on the main platform board. A Flutter **Drawer** is that side lane. Your bottom navigation handles daily travel; the Drawer holds Settings, Help, About, Legal, admin tools, and rarely used screens.',
              theory: `A \`Drawer\` is a side panel owned by \`Scaffold\`. Do not build it manually inside the page body like a secret cupboard. Put it in \`Scaffold.drawer\`, and Flutter automatically gives the AppBar a hamburger menu button. That is one of those lovely Flutter moments where the framework does the boring work.\n\nUse a Drawer for secondary places: Settings, Help, Coupons, About, Logout, admin pages, saved addresses. Daily places like Home and Cart belong in bottom navigation. If bottom navigation is the dining table, Drawer is the side shelf where useful but less-used items wait quietly.\n\nInside a drawer, start boring and clear: \`DrawerHeader\` at the top, then \`ListTile\` rows. \`ListTile\` gives you leading icon, title, subtitle, trailing widget, and tap handling. Beginners sometimes build custom Rows immediately and then spend thirty minutes aligning icons. Please enjoy life: use ListTile first.\n\nWhen the user taps a drawer item, close the drawer first with \`Navigator.pop(context)\`. This pop closes the drawer, not your whole page. Then show a SnackBar, switch state, or navigate. If you skip closing, the drawer can remain awkwardly visible like someone standing in front of the projector during a presentation.\n\n\`endDrawer\` opens from the opposite side. Use it for things like filters or extra controls, not as a random duplicate drawer.`,
              whyItMatters: 'Real apps need more destinations than can fit in a bottom bar. Drawer skills help you build admin menus, settings screens, restaurant dashboards, and support flows. Interviewers also watch whether you remember to close the drawer before navigation because it shows practical UI experience.',
              steps: [
                'Add `drawer: Drawer(...)` directly inside `Scaffold`.',
                'Add a `DrawerHeader` first so the drawer has identity, like a hotel board.',
                'Put drawer content in a `ListView` so it can scroll if items grow.',
                'Use `ListTile` for each action; start simple before custom design.',
                'Give each tile a familiar icon and a short title.',
                'Inside each `onTap`, call `Navigator.pop(context)` first to close the drawer.',
                'After closing, show a SnackBar or navigate to the selected screen.',
                'Use `endDrawer` only for right-side panels such as filters.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const KundapuraDrawerApp());

class KundapuraDrawerApp extends StatelessWidget {
  const KundapuraDrawerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.teal),
      home: const HotelHome(),
    );
  }
}

class HotelHome extends StatelessWidget {
  const HotelHome({super.key});

  void _show(BuildContext context, String message) {
    Navigator.pop(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kundapura Hotel')),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: Colors.teal),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text('Kundapura Hotel', style: TextStyle(color: Colors.white, fontSize: 22)),
                  Text('Main Road, Kundapura', style: TextStyle(color: Colors.white70)),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.restaurant_menu),
              title: const Text('Full menu'),
              onTap: () => _show(context, 'Opening today menu'),
            ),
            ListTile(
              leading: const Icon(Icons.local_offer_outlined),
              title: const Text('Coupons'),
              onTap: () => _show(context, 'No coupons today'),
            ),
            ListTile(
              leading: const Icon(Icons.support_agent),
              title: const Text('Call support'),
              onTap: () => _show(context, 'Calling hotel counter'),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.info_outline),
              title: const Text('About'),
              onTap: () => _show(context, 'Serving since 1998'),
            ),
          ],
        ),
      ),
      body: const Center(child: Text('Swipe from left or tap the menu icon')),
    );
  }
}`,
              pitfalls: [
                '**Drawer inside body.** Drawer belongs to `Scaffold.drawer`, not inside a Column.',
                '**Not closing before action.** Always `Navigator.pop(context)` first, then show the new state.',
                '**Using drawer for primary tabs.** Daily destinations belong in bottom navigation.',
                '**No header.** A drawer without identity feels random. Add app/account context.',
                '**Huge custom rows.** Start with `ListTile`; it already handles tap target size and alignment.',
                '**Right drawer confusion.** `endDrawer` opens from the opposite side. Use it for filters or secondary panels.',
              ],
              tryIt: 'Create a drawer for a Bangalore PG management app. Add tiles for `Rooms`, `Rent payments`, `Complaints`, `Visitors`, and `Logout`. Each tile should close the drawer and show a SnackBar. Now extend it to push a separate `PaymentsPage` when `Rent payments` is tapped.',
              takeaway: 'Drawer is for the deep stuff; bottom nav is for the daily stuff.',
            },
            {
              id: 'm1-t16',
              title: 'FloatingActionButton and SnackBar',
              explain: 'FloatingActionButton is the round elevated button for the screen primary action; SnackBar is your toast.',
              analogy: 'In a Kundapura fish market app, the most important action on the order screen is not hidden in a menu: "Add fresh bangda". That one action deserves a floating button, just like the loud auction call near Gangolli harbour gets everyone moving. After Anjali taps it, she needs a short confirmation: "Added 1 kg bangda". That confirmation is the **SnackBar**. It appears, says one thing, and goes away. It should not become a full lecture or a permanent banner.',
              theory: `A \`FloatingActionButton\`, or FAB, is the one big "do this now" action for the current screen. Not three actions. Not a mini-menu circus. One main action. Add item, create post, compose message, scan QR, book ticket.\n\nPut the FAB in \`Scaffold.floatingActionButton\`. Do not place it manually with Stack unless you have a special design reason. Scaffold already knows how to float it above bottom navigation and keep the spacing sensible. Let Scaffold be the responsible adult.\n\nA \`SnackBar\` is a short temporary message. The user taps "Add fish"; SnackBar says "Added 1 kg bangda". It is not a lecture. It is not a full-screen drama. It appears, confirms, maybe offers Undo, then leaves quietly.\n\nThe object you call is \`ScaffoldMessenger.of(context)\`. Think of ScaffoldMessenger as the waiter who carries your small message to the current Scaffold. You say \`showSnackBar(...)\`, and it displays at the bottom.\n\nIf the user taps quickly five times, snackbars can queue. That means old messages keep appearing after they are no longer useful. Before showing a fresh confirmation, call \`clearSnackBars()\`. It is like clearing old hotel tokens before issuing the new one.`,
              whyItMatters: 'FAB plus SnackBar is one of the first "real app" interaction pairs you will build. A recruiter can ask you to create a simple add-to-cart screen in ten minutes. If you know where FAB lives and how ScaffoldMessenger works, the task becomes mechanical.',
              steps: [
                'Ask: what is the one main action on this screen? If there are five, you have not decided yet.',
                'Add `floatingActionButton:` to `Scaffold`.',
                'Use normal `FloatingActionButton` for icon-only actions; use `.extended` when text helps.',
                'In `onPressed`, update your state first, such as increasing cart count.',
                'Create `final messenger = ScaffoldMessenger.of(context);`.',
                'Call `messenger.clearSnackBars();` so old messages do not queue.',
                'Call `messenger.showSnackBar(SnackBar(content: Text("...")));` with one short message.',
                'Add `SnackBarAction` only when the user can actually do something useful like Undo.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const FishCartApp());

class FishCartApp extends StatelessWidget {
  const FishCartApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.indigo),
      home: const FishCartPage(),
    );
  }
}

class FishCartPage extends StatefulWidget {
  const FishCartPage({super.key});

  @override
  State<FishCartPage> createState() => _FishCartPageState();
}

class _FishCartPageState extends State<FishCartPage> {
  int kilos = 0;

  void _addFish() {
    setState(() => kilos++);

    final messenger = ScaffoldMessenger.of(context);
    messenger.clearSnackBars();
    messenger.showSnackBar(
      SnackBar(
        content: Text('Added 1 kg bangda. Cart: $kilos kg'),
        action: SnackBarAction(
          label: 'Undo',
          onPressed: () {
            setState(() => kilos = (kilos - 1).clamp(0, 999));
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Gangolli Fish Cart')),
      body: Center(
        child: Text(
          '$kilos kg selected',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _addFish,
        icon: const Icon(Icons.add_shopping_cart),
        label: const Text('Add fish'),
      ),
    );
  }
}`,
              pitfalls: [
                '**Multiple primary actions.** A screen should usually have one FAB. If there are many actions, use buttons in the body.',
                '**Wrong context.** Calling `ScaffoldMessenger.of(context)` above `MaterialApp` fails. Use a context inside the app page.',
                '**SnackBar queue.** Rapid taps can queue old messages. Clear current snackbars before showing the latest.',
                '**Long SnackBar text.** Keep it short; long text wraps badly on small phones.',
                '**Using SnackBar for blocking errors.** Serious decisions need dialogs or inline errors.',
                '**FAB covering content.** Let Scaffold place it; avoid manual Stack positioning for normal cases.',
              ],
              tryIt: 'Make a Bangalore grocery cart screen with a FAB labeled `Add milk`. Each tap increases packet count and shows `Added Nandini milk`. Add an Undo action. Now extend it so the FAB disappears when the count reaches 5 packets.',
              takeaway: 'FAB is one primary action; SnackBar is one transient message. Both belong to Scaffold.',
            },
          ],
        },
        {
          id: 'm1-s4',
          title: 'Core Layout Widgets',
          topics: [
            {
              id: 'm1-t17',
              title: 'Container, Padding, Center',
              explain: 'Container, Padding and Center are the three workhorses for spacing, sizing and alignment.',
              analogy: 'Imagine packing a parcel of Kundapura banana chips to send to Bangalore. The **chips** are your child widget. The **paper wrapping** around the chips is `Padding`. The **box** with colour, size, border, and label is `Container`. Placing the box exactly in the middle of the courier counter is `Center`. Beginners mix these up and then wonder why the UI looks squeezed. First wrap the content with breathing room, then give it a box, then decide where that box sits.',
              theory: `Flutter layout becomes easier when you imagine every widget as a box. Some boxes hold content, some add space, some paint decoration, and some decide position. \`Container\`, \`Padding\`, and \`Center\` are your first three box tools.\n\n\`Padding\` does one job: it adds empty space around its child. If your Text is touching the card edge like a passenger squeezed against a KSRTC window, wrap it in Padding. The child becomes more comfortable immediately.\n\n\`Center\` also does one job: it places its child in the middle of the available space. It does not add colour. It does not add border. It does not make coffee. It just says, "You, please stand in the middle."\n\n\`Container\` is the multi-tool. It can set width, height, padding, margin, alignment, colour, border, radius, and constraints. Powerful, yes. But if you use Container for everything, your layout becomes a biryani where nobody knows which ingredient caused the problem.\n\nSpoon-feed rule: start with the child. Add \`Padding\` if it needs inner breathing room. Add \`Container\` if it needs a visible box or size. Add \`Center\` outside if the whole thing should sit in the middle of the screen.`,
              whyItMatters: 'Most Flutter UI work is arranging boxes. If your spacing is random, the app feels amateur even when the logic is correct. Clean usage of Container, Padding, and Center makes your screens easier for teammates to read and easier for you to fix on small Android devices.',
              steps: [
                'First create the plain content: `Text("Banana chips parcel")`.',
                'Wrap the Text with `Padding(padding: EdgeInsets.all(20), child: ...)` so it stops touching edges.',
                'Wrap that Padding with `Container` only when you want colour, border, radius, width, or height.',
                'Put `decoration: BoxDecoration(...)` inside Container for border and rounded corners.',
                'Put `Center` outside the Container if the complete card should sit in the middle.',
                'Change one wrapper at a time and hot reload; do not edit five layout properties at once.',
                'When confused, read from inside to outside: content, padding, box, position.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const ParcelCardApp());

class ParcelCardApp extends StatelessWidget {
  const ParcelCardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.orange),
      home: const ParcelPage(),
    );
  }
}

class ParcelPage extends StatelessWidget {
  const ParcelPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kundapura Parcel')),
      body: Center(
        child: Container(
          width: 280,
          decoration: BoxDecoration(
            color: Colors.orange.shade50,
            border: Border.all(color: Colors.orange.shade300),
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.inventory_2_outlined, size: 48),
                SizedBox(height: 12),
                Text('Banana chips parcel', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                SizedBox(height: 6),
                Text('From Kundapura to Bangalore, packed with extra padding.'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Container for everything.** Too many Containers hide intent. Use `Padding` and `Center` directly when they fit.',
                '**Padding outside decoration confusion.** Padding inside Container creates space inside the coloured box; margin creates space outside it.',
                '**No constraints.** A Container without child, width, height, or constraints may become invisible.',
                '**Huge fixed width.** `width: 500` may overflow small phones. Use reasonable widths or responsive layout later.',
                '**Decoration plus color conflict.** If you use `decoration`, put colour inside `BoxDecoration`, not also in `Container.color`.',
                '**Center in tight space.** Center can only center inside the space its parent gives it.',
              ],
              tryIt: 'Create a Udupi breakfast coupon card. Center it on screen, give the card a light blue background, add 20 pixels of padding, and show `Masala dosa - Rs 60`. Now extend it by adding a border and a second line: `Valid at 8 AM`.',
              takeaway: 'Container is the Swiss army knife; Padding and Center are the focused tools.',
            },
            {
              id: 'm1-t18',
              title: 'Row, Column, and the Main/Cross Axis',
              explain: 'Row arranges children horizontally, Column vertically — both follow the same main and cross axis rules.',
              analogy: 'At an Udupi hotel counter, breakfast tokens are arranged left to right: dosa, idli, vada, coffee. That is a `Row`. On the wall menu, items are written top to bottom: breakfast, lunch, snacks, dinner. That is a `Column`. The **main axis** is the direction the line travels. For Row it is horizontal like the token counter; for Column it is vertical like the wall menu. The **cross axis** is the opposite direction.',
              theory: `\`Row\` means "children, stand next to each other." \`Column\` means "children, stand one below another." That is the simple core. Do not overcomplicate it.\n\nBoth Row and Column are Flex widgets. They follow the same rules, but their directions are swapped. In a \`Row\`, the main axis is left-to-right. In a \`Column\`, the main axis is top-to-bottom. Say it out loud once; it sticks.\n\n\`mainAxisAlignment\` controls spacing along the main direction. In a Row, \`spaceBetween\` pushes children across the horizontal line. In a Column, \`spaceBetween\` pushes children across the vertical line. Same property, different direction.\n\n\`crossAxisAlignment\` controls the opposite direction. In a Row, cross axis is vertical. In a Column, cross axis is horizontal. So if a Column uses \`CrossAxisAlignment.stretch\`, its children stretch wide like a dosa across the tawa.\n\nRows and Columns do not scroll. If you put too many children, Flutter shows the famous yellow-black overflow warning. That warning is not Flutter being angry; it is Flutter saying, "Boss, this bus has 40 seats and you loaded 70 people." Use scroll widgets later for long lists.`,
              whyItMatters: 'Every Flutter layout interview starts here. If you can explain main axis and cross axis with confidence, Row and Column stop feeling magical. This also prevents the classic yellow-black overflow problem on Android screens.',
              steps: [
                'If the widgets should sit left-to-right, choose `Row`.',
                'If the widgets should sit top-to-bottom, choose `Column`.',
                'Identify the main axis before touching alignment. Row main axis is horizontal; Column main axis is vertical.',
                'Use `mainAxisAlignment` to control spacing in that main direction.',
                'Use `crossAxisAlignment` to control the opposite direction.',
                'Add `SizedBox` gaps between children instead of typing spaces into Text.',
                'If you see yellow-black overflow stripes, do not panic; reduce content or use `Expanded`/scrolling.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const AxisDemoApp());

class AxisDemoApp extends StatelessWidget {
  const AxisDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.green),
      home: const AxisDemoPage(),
    );
  }
}

class AxisDemoPage extends StatelessWidget {
  const AxisDemoPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Udupi Counter Layout')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Breakfast tokens', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                _Token(label: 'Dosa'),
                _Token(label: 'Idli'),
                _Token(label: 'Vada'),
                _Token(label: 'Coffee'),
              ],
            ),
            const SizedBox(height: 32),
            Text('Wall menu', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('1. Breakfast'),
                Text('2. Lunch'),
                Text('3. Snacks'),
                Text('4. Dinner'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Token extends StatelessWidget {
  const _Token({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Chip(label: Text(label));
  }
}`,
              pitfalls: [
                '**Mixing up axes.** In Row, main is horizontal; in Column, main is vertical.',
                '**Expecting scroll.** Row and Column overflow instead of scrolling. Use scroll widgets for long content.',
                '**Using spaces in Text.** Do not align UI with manual spaces. Use Row, Column, Spacer, and SizedBox.',
                '**Stretch surprise.** `CrossAxisAlignment.stretch` needs bounded width/height from the parent.',
                '**Huge children in Row.** Long text inside Row needs `Expanded` or it may overflow.',
                '**Nested Columns everywhere.** Break complex layouts into small widgets so the tree stays readable.',
              ],
              tryIt: 'Build a Bangalore Metro mini screen. Use a Column for the station list: `Majestic`, `Cubbon Park`, `MG Road`. Inside each station row, place an icon and station name using Row. Now extend it by using `mainAxisAlignment: spaceBetween` to put travel time on the right.',
              takeaway: 'Main axis is the direction of layout; cross axis is perpendicular. Same rules, swapped axes.',
            },
            {
              id: 'm1-t19',
              title: 'Expanded, Flexible, and Flex Distribution',
              explain: 'Expanded and Flexible decide who gets the leftover space inside a Row or Column.',
              analogy: 'Picture three friends sharing a Bangalore auto from Majestic to Indiranagar. One has a tiny laptop bag, one has a normal backpack, and one has two suitcases. If everyone only takes the space they need, that is `Flexible`. If one friend says, "give me all remaining seat space", that is `Expanded`. In a Flutter Row, leftover width must be assigned deliberately, otherwise long text pushes icons out like suitcases falling out of the auto.',
              theory: `Rows and Columns first give natural space to children that know their size: icons, prices, small buttons. After that, leftover space remains. \`Expanded\` and \`Flexible\` tell Flutter what to do with that leftover space.\n\n\`Expanded\` says, "Give this child the remaining space, and make it fill that space." This is the hero for list rows. Icon on the left, price on the right, long food name in the middle? Wrap the food name with Expanded. Otherwise the long name will shove the price off-screen like luggage falling from an overloaded auto.\n\n\`Flexible\` is gentler. It says, "This child may use extra space, but do not force it to fill everything." Beginners use \`Expanded\` much more often. Learn \`Flexible\` when you want natural-size behavior with permission to shrink or grow.\n\n\`flex\` controls proportions. Two Expanded widgets with flex 2 and flex 1 split leftover space in a 2:1 ratio. It is not rupee calculation; it is leftover-space sharing after fixed children are handled.\n\nImportant rule: Expanded and Flexible only work inside \`Row\`, \`Column\`, or \`Flex\`. Put Expanded inside a random Container and Flutter will complain, correctly, like a hotel cashier seeing a bus ticket in the dosa bill file.`,
              whyItMatters: 'Overflow errors are one of the most common Flutter beginner frustrations. Knowing Expanded and Flexible lets you build list rows, product cards, chat bubbles, payment rows, and dashboards that survive real text lengths like "Kundapura Special Chicken Sukka Combo".',
              steps: [
                'Build the Row first with icon, long Text, and price.',
                'Run it once and notice if long text overflows or pushes the price.',
                'Wrap the long middle Text with `Expanded`.',
                'Add `maxLines: 1` and `overflow: TextOverflow.ellipsis` to the Text.',
                'Use `Spacer()` when you need empty space, not when you need content to resize.',
                'Use `Flexible` only when Expanded feels too forceful.',
                'Try `flex: 2` and `flex: 1` with two Expanded children to see proportional sharing.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const FlexFoodApp());

class FlexFoodApp extends StatelessWidget {
  const FlexFoodApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.red),
      home: const MenuRowPage(),
    );
  }
}

class MenuRowPage extends StatelessWidget {
  const MenuRowPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bangalore Lunch Row')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          MenuRow(name: 'Kundapura Special Chicken Sukka Combo with neer dosa', price: 'Rs 240'),
          MenuRow(name: 'Udupi Masala Dosa', price: 'Rs 80'),
          MenuRow(name: 'Office filter coffee flask', price: 'Rs 120'),
        ],
      ),
    );
  }
}

class MenuRow extends StatelessWidget {
  const MenuRow({super.key, required this.name, required this.price});

  final String name;
  final String price;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            const Icon(Icons.restaurant_menu),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 12),
            Text(price, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Expanded outside Row or Column.** Expanded must be a descendant of Flex widgets only.',
                '**Wrapping everything in Expanded.** Fixed icons and prices usually should keep natural size.',
                '**No overflow rule.** Expanded gives width, but Text can still need `maxLines` and ellipsis.',
                '**Flexible misunderstood.** Flexible may choose smaller size; Expanded must fill.',
                '**Ignoring flex ratios.** `flex` values share leftover space, not total screen width.',
                '**Expanded inside scroll direction.** Expanded inside an unbounded scrollable Column can throw layout errors.',
              ],
              tryIt: 'Create a row for a Bangalore cab booking: leading car icon, long route `Kundapura Bus Stand to Bengaluru Airport`, and price `Rs 4200`. Wrap the route with Expanded and ellipsis. Now extend it by adding a second Expanded below inside a Column for pickup time.',
              takeaway: 'Expanded grabs all leftover space; Flexible takes only what its child wants.',
            },
            {
              id: 'm1-t20',
              title: 'SizedBox, Spacer, and Gap Helpers',
              explain: 'SizedBox creates fixed gaps and Spacer eats remaining space — your toolkit for breathing room.',
              analogy: 'On a KSRTC bus from Kundapura to Bangalore, some gaps are fixed: the aisle width, seat distance, luggage rack height. That is `SizedBox`. Other space changes depending on how full the bus is: empty seats between passengers, extra luggage area, waiting room space. That is `Spacer`. In Flutter, fixed breathing room and flexible leftover room are different tools. Use the correct one and your screen stops wobbling.',
              theory: `Spacing is not empty nothing. Spacing is design. If your UI has no spacing, everything sticks together like wet newspaper in monsoon. If your UI has random spacing, it feels like chairs placed by someone who has never hosted guests.\n\n\`SizedBox\` creates an exact gap. \`SizedBox(height: 16)\` means "leave exactly 16 pixels vertically." Use it inside a Column. \`SizedBox(width: 12)\` means "leave exactly 12 pixels horizontally." Use it inside a Row.\n\n\`Spacer\` creates flexible empty space. It does not mean "12 pixels". It means "eat whatever leftover room exists." In a Row, \`Spacer()\` can push a price to the right edge. In a Column, \`Spacer()\` can push a button toward the bottom.\n\nSo the difference is simple: \`SizedBox\` is a fixed gap like the distance between two hotel tables. \`Spacer\` is elastic space like the empty part of a marriage hall after everyone chooses where to sit.\n\nUse \`const SizedBox(...)\` when the value is fixed. It is clearer and slightly cheaper. Later, teams may use gap helper packages, but first master raw \`SizedBox\` and \`Spacer\` because every Flutter codebase uses them.`,
              whyItMatters: 'Spacing is the difference between a student app and a polished app. Recruiters may not say "your SizedBox choices are good", but they notice when rows breathe correctly and buttons do not crash into text. This topic also prepares you for responsive layouts in Module 2.',
              steps: [
                'When two widgets need a fixed vertical gap, add `const SizedBox(height: 16)` between them.',
                'When two widgets in a Row need a fixed horizontal gap, add `const SizedBox(width: 12)`.',
                'When one widget should stay left and another should go right, place `const Spacer()` between them.',
                'When a button should sit near the bottom of a Column, put `const Spacer()` before the button.',
                'Use `Spacer(flex: 2)` and `Spacer(flex: 1)` only after normal Spacer makes sense.',
                'Avoid `Container(height: 16)` for gaps; it works, but it does not explain itself as clearly.',
                'Pick a simple spacing scale like 4, 8, 12, 16, 24, 32 and reuse it.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const GapDemoApp());

class GapDemoApp extends StatelessWidget {
  const GapDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.purple),
      home: const TicketPage(),
    );
  }
}

class TicketPage extends StatelessWidget {
  const TicketPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('KSRTC Ticket')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Kundapura to Bangalore', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            const Text('Sleeper coach - 420 km'),
            const SizedBox(height: 24),
            Row(
              children: const [
                Icon(Icons.event_seat),
                SizedBox(width: 12),
                Text('Seat 18'),
                Spacer(),
                Text('Rs 950', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: const [
                Icon(Icons.schedule),
                SizedBox(width: 12),
                Text('Departs 9:30 PM'),
                Spacer(),
                Text('Arrives 6:15 AM'),
              ],
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: null,
                child: Text('Ticket booked'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Blank Container gaps.** `Container(height: 16)` works but hides intent. Prefer `SizedBox`.',
                '**Spacer outside Flex.** Spacer only works inside Row, Column, or Flex.',
                '**Random gap values.** Using 7, 19, 23 everywhere makes the UI feel uneven. Pick a small spacing scale.',
                '**Huge fixed gaps on small screens.** `SizedBox(height: 120)` may waste space on compact phones.',
                '**Using Spacer for exact gaps.** Spacer is elastic. Use SizedBox when the gap must be exact.',
                '**Forgetting const.** Static gaps should be `const SizedBox(...)` for clarity and small performance wins.',
              ],
              tryIt: 'Build a Udupi restaurant bill card. Use SizedBox gaps between hotel name, item list, and total. Use Spacer in a Row to push `Rs 180` to the right of `Masala dosa x2`. Now extend it by adding a full-width `Pay now` button pinned near the bottom with Spacer.',
              takeaway: 'SizedBox for fixed gaps, Spacer for elastic gaps.',
            },
            {
              id: 'm1-t21',
              title: 'SafeArea and MediaQuery',
              explain: 'SafeArea avoids notches and status bars; MediaQuery exposes screen size and orientation.',
              analogy: 'Imagine placing a food stall banner near Udupi bus stand. If you hang it under a tree branch, behind an electric pole, or too close to the road edge, people cannot read it. **SafeArea** keeps your UI away from phone notches, status bars, rounded corners, and gesture areas. **MediaQuery** is like measuring the actual shop front before printing the banner: it tells you the screen width, height, orientation, text scale, and padding.',
              theory: `Read this slowly: your app does not own the full glass rectangle of the phone. The status bar, selfie camera notch, rounded corners, and bottom gesture handle are like that one uncle at a Udupi wedding who keeps standing in the photo frame. If you put important UI there, it gets covered. \`SafeArea\` says, "Fine uncle, you stand there; my button will move a little inside."\n\n\`SafeArea\` wraps your content and automatically adds enough padding to avoid system UI. You usually put it inside \`Scaffold.body\`, around the actual page content. If your checkout button is touching the very bottom of an Android phone, wrap the body in SafeArea before doing any complicated debugging.\n\n\`MediaQuery\` is Flutter's measuring tape. \`MediaQuery.sizeOf(context).width\` answers, "How wide is the screen right now?" \`MediaQuery.orientationOf(context)\` answers, "Is this phone standing like a dosa plate or lying sideways like a parcel box?" \`MediaQuery.paddingOf(context)\` tells you the system padding.\n\nDo not guess screen sizes. A Bangalore office worker may use your app on a small Android phone, a tablet, a foldable, or Flutter web in Chrome. Guessing is how you create UI that looks nice only on your laptop and then behaves like a confused auto driver on every real device.\n\nBeginner recipe: first wrap the body with \`SafeArea\`. Next read the width. If width is below 600, use one column. If width is 600 or above, maybe use two columns. That is enough responsive thinking for Module 1; fancy layouts come later.`,
              whyItMatters: 'Professional apps must survive real devices. A screen that looks fine on Chrome but hides the checkout button behind an Android navigation bar feels broken. SafeArea and MediaQuery are your first step toward production-quality responsive Flutter.',
              steps: [
                'First write the normal `Scaffold` with `appBar` and `body` so you can see the page.',
                'Wrap only the page content inside `SafeArea`; do not panic-wrap the whole app like a parcel in five newspapers.',
                'Inside `build`, write `final width = MediaQuery.sizeOf(context).width;` and print/show it once so the number becomes real.',
                'Create `final isWide = width >= 600;` — this is your beginner phone-vs-tablet decision.',
                'If `isWide` is false, use a `Column`; if true, use a `Row` with `Expanded` children.',
                'Resize Flutter web or rotate an emulator and watch the layout change; this is the "aha" moment.',
                'Only after this works should you polish spacing with `Padding` and `SizedBox`.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const SafeMediaApp());

class SafeMediaApp extends StatelessWidget {
  const SafeMediaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.cyan),
      home: const ResponsiveMenuPage(),
    );
  }
}

class ResponsiveMenuPage extends StatelessWidget {
  const ResponsiveMenuPage({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final isWide = width >= 600;

    return Scaffold(
      appBar: AppBar(title: const Text('Udupi Menu')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: isWide
              ? const Row(children: [Expanded(child: MenuList()), SizedBox(width: 16), Expanded(child: OfferBox())])
              : const Column(children: [MenuList(), SizedBox(height: 16), OfferBox()]),
        ),
      ),
    );
  }
}

class MenuList extends StatelessWidget {
  const MenuList({super.key});

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Text('Dosa, idli, vada, coffee'),
      ),
    );
  }
}

class OfferBox extends StatelessWidget {
  const OfferBox({super.key});

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Text('Today offer: breakfast combo Rs 99'),
      ),
    );
  }
}`,
              pitfalls: [
                '**Skipping SafeArea.** Content may hide under notches or status bars.',
                '**Hard-coded device guesses.** Do not assume every phone is 360 px wide.',
                '**Using MediaQuery everywhere.** Read it near layout decisions, not in every tiny widget.',
                '**Huge breakpoint logic.** Start with one phone/tablet breakpoint.',
                '**Forgetting landscape.** Width can change when the phone rotates.',
                '**SafeArea around Scaffold.** Usually put SafeArea inside `body`, not around the whole Scaffold.',
              ],
              tryIt: 'Create a Kundapura hotel page that shows menu and offers in a Column on phones and a Row on wide screens. Resize the browser to see it change. Now extend it by showing the current width in a Text widget.',
              takeaway: 'Wrap your top-level body in SafeArea; ask MediaQuery before guessing screen dimensions.',
            },
          ],
        },
        {
          id: 'm1-s5',
          title: 'Text, Images, and Inputs',
          topics: [
            {
              id: 'm1-t22',
              title: 'Text and the TextStyle Hierarchy',
              explain: 'Text widgets and the TextStyle hierarchy control every glyph rendered on screen.',
              analogy: 'In a Bangalore restaurant menu, the hotel name is large, section headings are medium, item names are normal, and notes like "spicy" are smaller. You do not manually decorate every letter; you follow a menu style. Flutter works the same: `ThemeData.textTheme` gives the app-wide style, and each `Text` can override only what is special.',
              theory: `\`Text\` is the widget that puts words on the screen. That sounds tiny, but text is most of your app: button labels, menu items, prices, warnings, addresses, captions, profile names. If text looks messy, the whole app feels like a hotel menu printed five minutes before opening.\n\n\`TextStyle\` controls the look: size, boldness, colour, line height, underline, and more. But here is the beginner trap: do not give every Text its own random font size like 17, 23, 31, and "whatever looked okay at 1 AM". That is how a UI starts looking like five different people designed it after drinking five different coffees.\n\nMaterial apps already provide named styles through \`Theme.of(context).textTheme\`: \`headlineSmall\` for page headings, \`titleLarge\` for important titles, \`bodyMedium\` for normal reading text, and so on. Use those first. Then use \`.copyWith(...)\` when you need a small change, like making the price green or making the item name bold.\n\nThink of it like a Bangalore restaurant menu: the hotel name, section heading, dish name, description, and price each have a role. You do not shout every line. Flutter text hierarchy is the same: decide what the user should notice first, second, and third.\n\nFor long text, protect the layout with \`maxLines\` and \`overflow: TextOverflow.ellipsis\`. Real app data is not polite. Someone will type "Kundapura Special Chicken Sukka Family Combo With Extra Neer Dosa Parcel", and your Row should not faint dramatically.`,
              whyItMatters: 'Typography makes UI readable. In interviews, clean text hierarchy shows you understand design basics, not just syntax. In real apps, theme-based text also makes dark mode and brand changes much easier.',
              steps: [
                'Start with a plain `Text("Masala dosa")` and confirm the words appear.',
                'Create `final text = Theme.of(context).textTheme;` inside `build` so theme styles are easy to use.',
                'Apply `style: text.headlineSmall` to the page heading.',
                'Apply `style: text.titleLarge?.copyWith(fontWeight: FontWeight.bold)` to item names.',
                'For prices, use `.copyWith(color: Colors.green, fontWeight: FontWeight.w700)` so only the price shouts.',
                'For long descriptions, add `maxLines: 1` and `overflow: TextOverflow.ellipsis`.',
                'Now look at the screen like a customer: can you understand hotel, item, description, and price in three seconds?',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const TextStyleApp());

class TextStyleApp extends StatelessWidget {
  const TextStyleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.deepOrange),
      home: const MenuTextPage(),
    );
  }
}

class MenuTextPage extends StatelessWidget {
  const MenuTextPage({super.key});

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Bangalore Cafe')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Udupi Breakfast', style: text.headlineSmall),
            const SizedBox(height: 8),
            Text('Fresh items before 11 AM', style: text.bodyMedium?.copyWith(color: Colors.grey.shade700)),
            const SizedBox(height: 24),
            Text('Masala dosa', style: text.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            Text('Crispy dosa, potato palya, chutney, sambar', maxLines: 1, overflow: TextOverflow.ellipsis, style: text.bodyMedium),
            const SizedBox(height: 16),
            Text('Rs 80', style: text.titleMedium?.copyWith(color: Colors.green, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Random font sizes.** Prefer theme styles first, then override.',
                '**No overflow control.** Long restaurant names can break rows.',
                '**Low contrast text.** Light grey on white is hard to read.',
                '**Styling every Text manually.** Move repeated styles into ThemeData later.',
                '**Ignoring text scale.** Users may increase system font size; leave room.',
                '**Using Text for icons.** Use Icon widgets for icons, not emoji-like text hacks.',
              ],
              tryIt: 'Create a Udupi menu card with a heading, subtitle, item name, item description, and price. Use at least three theme text styles. Now extend it by making the price green using `.copyWith()`.',
              takeaway: 'Style cascades from Theme down to Text; override only what you need.',
            },
            {
              id: 'm1-t23',
              title: 'Image.asset, Image.network, and FadeInImage',
              explain: 'Three image variants for three sources: bundled assets, the network, and placeholder-while-loading.',
              analogy: 'A Kundapura hotel can show photos in three ways. A printed wall photo never needs internet: `Image.asset`. A live Swiggy-style dish photo comes from the server: `Image.network`. A polite blurred placeholder that appears until the dish photo loads is `FadeInImage`. Same visual idea, different source.',
              theory: `Images are not magic stickers; Flutter needs to know where each image comes from. There are three everyday cases, and mixing them up is like asking the Udupi hotel waiter for a cloud backup of your chutney.\n\n\`Image.asset\` means "this image is packed inside my app". Logos, onboarding art, static icons, and placeholder images belong here. But Flutter will not read your mind. You must declare the asset folder in \`pubspec.yaml\`. If the YAML indentation is wrong, Flutter behaves like a strict school headmaster: no image for you.\n\n\`Image.network\` means "download this image from the internet". Use it for profile photos, restaurant banners, feed photos, product images, and anything that changes from server data. Network images can fail because the user may be on weak mobile data near a highway between Kundapura and Bangalore, so always think about loading and error states.\n\n\`FadeInImage\` is the polite version of network image loading. It shows a placeholder first, then fades into the final photo. Without it, slow images can pop into the screen like a late passenger jumping into a moving bus.\n\nAlways give images a size and a fit. \`BoxFit.cover\` fills the box and may crop edges, perfect for feed cards. \`BoxFit.contain\` shows the full image and may leave empty space, perfect for logos. If you skip size and fit, your layout can jump around like a badly packed parcel.`,
              whyItMatters: 'Every mobile app uses images. Knowing the difference between bundled and remote images prevents slow screens, broken logos, and layout jumps. This also sets you up for profile grids and feeds in later modules.',
              steps: [
                'Decide the source first: shipped with app means `asset`, downloaded means `network`.',
                'For assets, create an `assets/images/` folder and declare it in `pubspec.yaml` before writing `Image.asset`.',
                'For network images, paste the URL into `Image.network` and run the app once.',
                'Immediately add `height` and `fit: BoxFit.cover` so the image card stays stable.',
                'Wrap with `ClipRRect` only after the image works; rounded corners are polish, not step one.',
                'Add `errorBuilder` so a broken URL shows a friendly message instead of ugly failure.',
                'Later, use `FadeInImage` when you want a placeholder while slow images load.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const ImageDemoApp());

class ImageDemoApp extends StatelessWidget {
  const ImageDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true),
      home: const ImageDemoPage(),
    );
  }
}

class ImageDemoPage extends StatelessWidget {
  const ImageDemoPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Food Photos')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Network image'),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.network(
              'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800',
              height: 180,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => const SizedBox(height: 180, child: Center(child: Text('Image failed'))),
            ),
          ),
          const SizedBox(height: 24),
          const Text('Asset example in real apps'),
          const SizedBox(height: 8),
          const Text('Image.asset("assets/images/logo.png") after declaring assets in pubspec.yaml'),
        ],
      ),
    );
  }
}`,
              pitfalls: [
                '**Asset not declared.** Flutter cannot load assets unless pubspec.yaml lists them.',
                '**Wrong indentation in pubspec.** YAML spacing matters; two spaces can break asset loading.',
                '**Unbounded images.** Always give list images a stable height.',
                '**Wrong BoxFit.** `cover` crops; `contain` preserves the full image.',
                '**No error UI.** Network images can fail on weak connections.',
                '**Huge image files.** Compress assets before shipping the app.',
              ],
              tryIt: 'Add a network image of a dosa or cafe banner to a page. Give it height 180 and `BoxFit.cover`. Now extend it by wrapping it with `ClipRRect` for rounded corners and adding an `errorBuilder`.',
              takeaway: 'Asset for shipped art, Network for remote, FadeInImage for the loading dance.',
            },
            {
              id: 'm1-t24',
              title: 'Buttons — Elevated, Outlined, Text, Icon',
              explain: 'Material 3 ships four button flavours; pick by emphasis, not appearance.',
              analogy: 'At a Bangalore darshini counter, "Pay now" is the big main action, "Add coupon" is secondary, "Read terms" is quiet, and the tiny cart icon is compact. Flutter buttons follow that same emphasis ladder: `ElevatedButton` or `FilledButton` for primary, `OutlinedButton` for secondary, `TextButton` for low emphasis, and `IconButton` for compact icon actions.',
              theory: `Buttons are not decoration. Buttons are promises. When the user taps one, something should happen: pay, save, cancel, share, like, open, close. If you put ten equally loud buttons on screen, the user feels like they walked into KR Market during peak bargaining hour.\n\nUse button type to show importance. \`FilledButton\` is your main "do the thing" action: Pay now, Save address, Login. \`ElevatedButton\` is also strong, especially in older codebases. \`OutlinedButton\` is secondary: Apply coupon, View details. \`TextButton\` is quiet: Cancel, Learn more, Skip. \`IconButton\` is compact: heart, share, delete, close.\n\nEvery button depends on \`onPressed\`. If \`onPressed\` is a function, the button is enabled. If \`onPressed: null\`, Flutter disables the button automatically. This is beautifully simple: do not invent a "disabled button look" yourself. Let Flutter do it.\n\nUse \`.icon\` constructors when text plus icon helps: \`FilledButton.icon(icon: Icon(Icons.payment), label: Text('Pay Rs 180'))\`. The icon is the quick visual clue; the label is the exact command.\n\nBeginner test: cover the code and only look at the UI. Can you tell the main action within two seconds? If not, your buttons are arguing with each other.`,
              whyItMatters: 'Buttons are where users commit money, submit forms, and navigate flows. Good button hierarchy reduces mistakes. In interviews, button choice shows whether you understand UI semantics instead of picking widgets by colour.',
              steps: [
                'Write down the screen goal in plain English: "user should pay", "user should save", or "user should cancel".',
                'Make that one main goal a `FilledButton` or `ElevatedButton`.',
                'Make useful but less important actions `OutlinedButton`.',
                'Make quiet actions like Cancel or Terms a `TextButton`.',
                'Use `IconButton` only when the icon is familiar or nearby text explains it.',
                'Disable unavailable actions with `onPressed: null` instead of manually greying them out.',
                'Tap every button and confirm each one gives visible feedback, navigation, or state change.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const ButtonDemoApp());

class ButtonDemoApp extends StatelessWidget {
  const ButtonDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
      home: const ButtonDemoPage(),
    );
  }
}

class ButtonDemoPage extends StatelessWidget {
  const ButtonDemoPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order Actions')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            FilledButton.icon(onPressed: () {}, icon: const Icon(Icons.payment), label: const Text('Pay Rs 180')),
            const SizedBox(height: 12),
            OutlinedButton.icon(onPressed: () {}, icon: const Icon(Icons.local_offer), label: const Text('Apply coupon')),
            const SizedBox(height: 12),
            TextButton(onPressed: () {}, child: const Text('Read cancellation policy')),
            const SizedBox(height: 12),
            Row(
              children: [
                IconButton(onPressed: () {}, icon: const Icon(Icons.favorite_border)),
                IconButton(onPressed: () {}, icon: const Icon(Icons.share)),
                const Spacer(),
                ElevatedButton(onPressed: null, child: const Text('Disabled')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Choosing by colour only.** Choose by importance and meaning.',
                '**Too many primary buttons.** One screen section should have one obvious main action.',
                '**Tiny tap targets.** Icon buttons need enough space around them.',
                '**Disabled confusion.** `onPressed: null` is the Flutter way to disable.',
                '**Long button labels.** Keep labels short and action-oriented.',
                '**Missing feedback.** Important button taps should change state, navigate, or show confirmation.',
              ],
              tryIt: 'Build a checkout action area with `Pay now`, `Apply coupon`, `Cancel`, and a favourite icon. Make `Pay now` primary. Now extend it by disabling `Pay now` when `cartTotal` is 0.',
              takeaway: 'Elevated for primary, Outlined for secondary, Text for tertiary, Icon for compact.',
            },
            {
              id: 'm1-t25',
              title: 'TextField and Form Basics',
              explain: 'TextField and Form give you input widgets and validation lifecycle in one bundle.',
              analogy: 'When a customer in Udupi writes a parcel address, the hotel counter checks three things before sending it: name is present, phone number is usable, and address is not blank. A `TextField` is the writing box. A `Form` is the counter check that validates all boxes together before the parcel leaves.',
              theory: `A \`TextField\` is where the user types. Simple. But a real app cannot trust typed text blindly. If Ravi enters an empty phone number and your app sends a parcel from Kundapura to "somewhere in Bangalore, good luck", the delivery person will not send you blessings.\n\nUse \`TextField\` for simple input. Use \`TextFormField\` when the input belongs to a form and needs validation. The difference is important: \`TextFormField\` has a \`validator\`, which is a tiny function that checks the value and returns either an error message or \`null\`.\n\nA \`Form\` is the supervisor. It wraps multiple fields and checks them together. The \`GlobalKey<FormState>\` is like the counter token that lets your submit button call the supervisor and ask, "Are all fields valid?" That call is \`formKey.currentState!.validate()\`.\n\nValidator rule is spoon-feed simple: return a string when something is wrong; return \`null\` when everything is okay. Not empty string. Not true/false. Error string or null.\n\nUse \`keyboardType\` to make typing easier: phone keyboard for phone, number keyboard for pincode, email keyboard for email. Small UX detail, big professional smell-good moment.`,
              whyItMatters: 'Inputs are where apps collect orders, addresses, logins, and payments. Form validation is a core mobile skill. A clean form flow is also a common internship and fresher interview task.',
              steps: [
                'Create a `StatefulWidget` so the form key can live safely in the State class.',
                'Add `final formKey = GlobalKey<FormState>();` above `build`.',
                'Wrap your input list with `Form(key: formKey, child: ...)`.',
                'Use `TextFormField`, not plain `TextField`, for fields that must be checked.',
                'For each field, write a validator: bad value returns `"Enter phone number"`; good value returns `null`.',
                'In the submit button, call `if (formKey.currentState!.validate()) { ... }`.',
                'Only inside that `if` block should you show success, push the next screen, or save data.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const ParcelFormApp());

class ParcelFormApp extends StatelessWidget {
  const ParcelFormApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.green),
      home: const ParcelFormPage(),
    );
  }
}

class ParcelFormPage extends StatefulWidget {
  const ParcelFormPage({super.key});

  @override
  State<ParcelFormPage> createState() => _ParcelFormPageState();
}

class _ParcelFormPageState extends State<ParcelFormPage> {
  final formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Parcel Address')),
      body: Form(
        key: formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              decoration: const InputDecoration(labelText: 'Name', border: OutlineInputBorder()),
              validator: (value) => value == null || value.trim().isEmpty ? 'Enter customer name' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone', border: OutlineInputBorder()),
              validator: (value) => value != null && value.length >= 10 ? null : 'Enter 10 digit phone',
            ),
            const SizedBox(height: 12),
            TextFormField(
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Bangalore address', border: OutlineInputBorder()),
              validator: (value) => value == null || value.trim().isEmpty ? 'Enter delivery address' : null,
            ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: () {
                if (formKey.currentState!.validate()) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Parcel ready to send')));
                }
              },
              child: const Text('Save address'),
            ),
          ],
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Using TextField for validated forms.** Use `TextFormField` when you need validators.',
                '**No Form key.** Without a key, the submit button cannot validate all fields.',
                '**Returning empty string.** Validators should return `null` when valid, error text when invalid.',
                '**Not trimming input.** Spaces should not count as a real name.',
                '**Forgetting keyboardType.** Phone, email, and number fields should show matching keyboards.',
                '**Controller leaks.** If you create controllers, dispose them in `dispose()`.',
              ],
              tryIt: 'Create a Bangalore delivery address form with name, phone, and address. Validate all three. Now extend it by adding a pincode field that accepts only 6 digits.',
              takeaway: 'Always wrap multiple TextFields in a Form so you can validate them in one shot.',
            },
          ],
        },
        {
          id: 'm1-s6',
          title: 'Navigation and Routes',
          topics: [
            {
              id: 'm1-t26',
              title: 'Navigator.push and Navigator.pop',
              explain: 'Navigator is a stack of routes; push adds a screen on top, pop removes it.',
              analogy: 'Think of the Krishna Matha darshan queue in Udupi. You enter the main hall, then move into a smaller inner queue, then return to the outer path after darshan. `Navigator.push` is stepping into the next queue or screen. `Navigator.pop` is stepping back to where you came from. Flutter remembers this as a stack: last screen in is the first screen out.',
              theory: `Navigation is just screen travel. Do not make it mystical. You are on the orders screen. You tap Order #BLR-1042. A details screen appears. You press back. Orders screen returns. That is \`push\` and \`pop\`.\n\nFlutter basic navigation is stack-based. Imagine a stack of hotel plates in Udupi. The plate on top is the one you can use now. \`Navigator.push\` puts a new plate on top. \`Navigator.pop\` removes the top plate and reveals the old one underneath. Last in, first out. Very computer-science, but also very hotel-counter.\n\nA \`Route\` is Flutter's wrapper for a screen. Most beginner code uses \`MaterialPageRoute\`: you give it a \`builder\`, and that builder returns the next page widget. Flutter then handles the slide animation and back stack.\n\nUse \`push\` when the user is moving forward into a temporary screen: order details, edit profile, payment page. Use \`pop\` when the user is done and should return. Do not use push/pop for bottom tabs; that makes the back button behave like it ate too much bisi bele bath and got confused.\n\nOne more spoon-feed point: the page you push is just a widget. If the details page needs an order id, pass it through the constructor like normal Dart: \`OrderDetailsPage(orderId: 'BLR-1042')\`. Navigation does not cancel normal programming.`,
              whyItMatters: 'Almost every Flutter app has multiple screens. Push/pop is the mental model behind checkout flows, profile details, order pages, and settings. If you understand the stack, back-button bugs become much easier to debug.',
              steps: [
                'Create the first page widget, for example `OrdersPage`.',
                'Create the second page widget, for example `OrderDetailsPage`.',
                'Give the second page a constructor value like `orderId` if it needs data.',
                'On the ListTile tap, call `Navigator.push(context, MaterialPageRoute(builder: ...))`.',
                'Inside the builder, return `OrderDetailsPage(orderId: "BLR-1042")`.',
                'On the details page, call `Navigator.pop(context)` from a button to go back.',
                'Run it and press Android/browser back too; it should return to the previous screen.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const PushPopApp());

class PushPopApp extends StatelessWidget {
  const PushPopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
      home: const OrdersPage(),
    );
  }
}

class OrdersPage extends StatelessWidget {
  const OrdersPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kundapura Orders')),
      body: ListTile(
        leading: const Icon(Icons.receipt_long),
        title: const Text('Order #BLR-1042'),
        subtitle: const Text('Kori rotti parcel to Indiranagar'),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const OrderDetailsPage(orderId: 'BLR-1042')),
          );
        },
      ),
    );
  }
}

class OrderDetailsPage extends StatelessWidget {
  const OrderDetailsPage({super.key, required this.orderId});

  final String orderId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Order #$orderId')),
      body: Center(
        child: FilledButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Back to orders'),
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Wrong context.** Use a context below `MaterialApp` so Navigator exists.',
                '**Pushing for tabs.** Bottom tabs should switch state, not push routes.',
                '**Forgetting back behavior.** Every push adds to the back stack.',
                '**Passing huge objects.** Pass IDs or small data when possible.',
                '**Pop on root page.** Popping the only page may close the app or do nothing.',
                '**Deep navigation chains.** For complex apps, move to named routes or GoRouter.',
              ],
              tryIt: 'Build an orders list with one Udupi food order. Tap it to push a details page. Add a back button using `Navigator.pop`. Now extend it by passing the order price into the details page.',
              takeaway: 'Push to go forward, pop to come back. The stack is your navigation history.',
            },
            {
              id: 'm1-t27',
              title: 'Named Routes and Route Arguments',
              explain: 'Named routes register screen string keys so you push by name and pass arguments declaratively.',
              analogy: 'Bangalore Metro stations have names: Majestic, MG Road, Indiranagar. You do not describe the entire track every time; you say the station name and the route map knows where to go. Named routes are the same. Register `/orders` and `/details`, then navigate by name and pass only the needed ticket or order data.',
              theory: `After a few screens, anonymous \`MaterialPageRoute\` builders can start hiding all over your code like socks after laundry day. Named routes solve that by creating a route table: a small map that says \`'/cart'\` means CartPage, \`'/menu'\` means MenuPage, and so on.\n\nThen, instead of writing the full route builder every time, you say \`Navigator.pushNamed(context, '/details')\`. It is like telling an auto driver "MG Road" instead of explaining every turn from Majestic. The route table already knows what screen lives at that name.\n\nArguments are the parcel you carry with you. Example: you push \`'/details'\` and pass \`arguments: 'Majestic to Indiranagar'\`. On the details page, read it with \`ModalRoute.of(context)!.settings.arguments as String\`. Yes, that line looks long. Read it as: "current route, please give me the package that came with you."\n\nUse named routes when you want a searchable route list and simple app navigation. Use \`onGenerateRoute\` when the route table needs logic. Use GoRouter when URLs, deep links, and redirects become serious.\n\nBeginner warning: route names are strings. Strings can have typos. \`'/cart'\` and \`'/crt'\` are not cousins; one works and one falls into the error pit. In bigger apps, store route names as constants.`,
              whyItMatters: 'Named routes are common in older and mid-sized Flutter apps. Even if your future team uses GoRouter, you will read codebases that use pushNamed. Understanding route arguments also teaches you to keep navigation data explicit.',
              steps: [
                'In `MaterialApp`, add a `routes` map with `"/"` and one more route like `"/details"`.',
                'Keep route names short and boring; boring route names are good route names.',
                'From the home page, call `Navigator.pushNamed(context, "/details")`.',
                'If the page needs data, add `arguments: "Order BLR-1042"`.',
                'In the destination page, read `ModalRoute.of(context)!.settings.arguments` and cast it.',
                'Show the argument on screen so you know it arrived safely.',
                'When the app grows, move route names into constants to avoid typo drama.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const NamedRouteApp());

class NamedRouteApp extends StatelessWidget {
  const NamedRouteApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      routes: {
        '/': (context) => const HomePage(),
        '/details': (context) => const DetailsPage(),
      },
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Metro Routes')),
      body: Center(
        child: FilledButton(
          onPressed: () {
            Navigator.pushNamed(context, '/details', arguments: 'Majestic to Indiranagar');
          },
          child: const Text('Open trip'),
        ),
      ),
    );
  }
}

class DetailsPage extends StatelessWidget {
  const DetailsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final trip = ModalRoute.of(context)!.settings.arguments as String;

    return Scaffold(
      appBar: AppBar(title: const Text('Trip Details')),
      body: Center(child: Text(trip)),
    );
  }
}`,
              pitfalls: [
                '**Typos in route names.** `/detail` and `/details` are different strings. Use constants later.',
                '**Casting wrong argument type.** If you pass a String, cast as String, not Map.',
                '**Huge argument payloads.** Prefer IDs for large records.',
                '**No initial route clarity.** Set `home` or `initialRoute`, not both casually.',
                '**Too many route strings everywhere.** Centralize names in larger apps.',
                '**Using named routes for modern web URLs.** GoRouter handles URLs more cleanly.',
              ],
              tryIt: 'Create named routes for `/`, `/menu`, and `/cart`. From home, push `/cart` with argument `Rs 180`. Show that amount on the cart page. Now extend it by using a Map with item name and price.',
              takeaway: 'Named routes make navigation testable and your route table searchable.',
            },
            {
              id: 'm1-t28',
              title: 'Modern Routing with GoRouter',
              explain: 'GoRouter is the modern declarative router that handles deep links and browser URLs cleanly.',
              analogy: 'A Bangalore Metro route map is not just a stack of where you walked. It can answer: if someone directly enters Indiranagar, which line and station should open? GoRouter gives Flutter that route-map style. A URL like `/orders/BLR1042` can open the exact order screen directly instead of forcing the user through Home first.',
              theory: `GoRouter is what you use when your app stops being a two-room house and becomes a Bangalore apartment complex with blocks, lifts, parking levels, and security gates. Manual push/pop still works, but route rules become easier when one router manages the map.\n\n\`go_router\` is a package, so first install it with \`flutter pub add go_router\`. If you forget this and import it directly, Dart will look at you like you ordered masala dosa in a hardware shop.\n\nYou create a \`GoRouter\` with route objects. A route has a \`path\` and a \`builder\`. The path \`'/orders/:id'\` means the URL has a changing part called \`id\`. If the user opens \`/orders/BLR1042\`, GoRouter can read \`BLR1042\` through \`state.pathParameters['id']\`.\n\nWith GoRouter, the URL/location becomes important. \`context.go('/orders/BLR1042')\` changes the current location. \`context.push('/orders/BLR1042')\` adds a page on top. For Module 1, remember the simple version: **go replaces, push stacks**.\n\nYou also change your app root: use \`MaterialApp.router(routerConfig: router)\`, not \`MaterialApp(home: ...)\`. That is the moment you tell Flutter, "Routing map is in charge now."`,
              whyItMatters: 'Modern Flutter teams often use GoRouter for production apps, especially when Flutter web, deep links, auth redirects, or nested tabs are involved. You do not need every advanced feature yet, but you should recognize the shape early.',
              steps: [
                'Run `flutter pub add go_router`; do this before writing imports.',
                'Import `package:go_router/go_router.dart` at the top of `main.dart`.',
                'Create `final router = GoRouter(routes: [...]);` outside your widgets.',
                'Add a home route with path `"/"` first so the app knows where to start.',
                'Add a dynamic route like `"/orders/:id"` and read `state.pathParameters["id"]`.',
                'Use `MaterialApp.router(routerConfig: router)` in the root widget.',
                'Navigate with `context.go("/orders/BLR1042")` and confirm the details page shows that id.',
              ],
              code: `import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

void main() => runApp(const GoRouterDemoApp());

final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/orders/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return OrderPage(orderId: id);
      },
    ),
  ],
);

class GoRouterDemoApp extends StatelessWidget {
  const GoRouterDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      routerConfig: router,
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Orders Home')),
      body: Center(
        child: FilledButton(
          onPressed: () => context.go('/orders/BLR1042'),
          child: const Text('Open Bangalore order'),
        ),
      ),
    );
  }
}

class OrderPage extends StatelessWidget {
  const OrderPage({super.key, required this.orderId});

  final String orderId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Order $orderId')),
      body: Center(child: Text('Deep-linked order from Kundapura')),
    );
  }
}`,
              pitfalls: [
                '**Forgetting dependency.** GoRouter is a package; add it before importing.',
                '**Using MaterialApp not router.** GoRouter needs `MaterialApp.router`.',
                '**go vs push confusion.** `go` changes location; `push` adds on top.',
                '**Wrong parameter name.** `/orders/:id` must be read as `pathParameters["id"]`.',
                '**Starting too advanced.** For two screens, push/pop is fine. Use GoRouter when routing grows.',
                '**Mixing routing styles wildly.** Pick one main routing approach per app.',
              ],
              tryIt: 'Install `go_router` and create `/`, `/menu`, and `/menu/:itemId`. Navigate to `/menu/dosa` and show `dosa` on the details screen. Now extend it with `/cart`.',
              takeaway: 'For anything beyond two screens, switch to GoRouter early.',
            },
          ],
        },
        {
          id: 'm1-s7',
          title: 'Theming and Polish',
          topics: [
            {
              id: 'm1-t29',
              title: 'ThemeData and Material 3',
              explain: 'ThemeData defines colours, text, shapes and components for your whole app in one object.',
              analogy: 'A hotel chain with branches in Udupi, Kundapura, and Bangalore keeps the same board colour, menu font, staff uniform, and bill format. That is branding. In Flutter, `ThemeData` is the branding rulebook. Set it once at the root and your AppBars, buttons, inputs, cards, and text start speaking the same visual language.',
              theory: `Without a theme, every screen slowly becomes its own little kingdom. One button is blue, another is green, one TextField has a border, another looks like it skipped breakfast. \`ThemeData\` is how you stop that nonsense and make the app feel like one product.\n\n\`ThemeData\` configures app-wide visual decisions: colours, typography, component defaults, shapes, density, and Material version. Put it in \`MaterialApp.theme\`, near the root, so all child widgets can read it.\n\nFor Material 3, start with \`ThemeData(useMaterial3: true, colorSchemeSeed: Colors.indigo)\`. Flutter uses that seed colour to generate a full colour family: primary, secondary, containers, surfaces, error colours, and readable on-colours. It is like giving Flutter one good coconut and getting chutney, oil, burfi, and garnish back.\n\nWidgets read theme values through \`Theme.of(context)\`. Buttons, AppBars, TextFields, Cards, and Chips automatically use the active theme. When you need custom text, use \`Theme.of(context).textTheme\`. When you need colour, use \`Theme.of(context).colorScheme\`.\n\nBeginner rule: set the theme once, then override only when there is a real reason. If every widget has manual colours, changing the app from Udupi-blue to Kundapura-orange later becomes a full-day headache.`,
              whyItMatters: 'ThemeData is how a Flutter app stops looking like random sample screens and starts looking like one product. Teams expect you to understand theme-first styling because it reduces duplication and makes dark mode possible.',
              steps: [
                'Open the root `MaterialApp`; this is where app-wide theme belongs.',
                'Add `theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.indigo)`.',
                'Run the app and notice AppBar, buttons, and inputs now share one colour family.',
                'Inside a page, create `final colors = Theme.of(context).colorScheme;`.',
                'Use `colors.primaryContainer` or `colors.surfaceContainerHighest` for cards instead of random shades.',
                'Create `final text = Theme.of(context).textTheme;` and use named text styles.',
                'Only add per-widget colour when the design truly needs a special case.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const ThemeDemoApp());

class ThemeDemoApp extends StatelessWidget {
  const ThemeDemoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.indigo,
        inputDecorationTheme: const InputDecorationTheme(border: OutlineInputBorder()),
      ),
      home: const ThemeDemoPage(),
    );
  }
}

class ThemeDemoPage extends StatelessWidget {
  const ThemeDemoPage({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Namma Theme')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Bangalore branch', style: text.headlineSmall),
            const SizedBox(height: 12),
            Card(
              color: colors.primaryContainer,
              child: const Padding(
                padding: EdgeInsets.all(16),
                child: Text('Same brand colours across every screen.'),
              ),
            ),
            const SizedBox(height: 16),
            const TextField(decoration: InputDecoration(labelText: 'Search menu')),
            const SizedBox(height: 16),
            FilledButton(onPressed: () {}, child: const Text('Order now')),
          ],
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Styling every widget manually.** Put repeated decisions in ThemeData.',
                '**Not enabling Material 3.** `useMaterial3: true` gives current Material behavior.',
                '**Random colours.** Use `colorScheme` values for consistency.',
                '**Overriding too deeply.** Per-widget style is the last resort.',
                '**Ignoring contrast.** Theme colours are designed to pair well; random shades may fail readability.',
                '**Theme below widgets.** Theme must be above the widgets that read it.',
              ],
              tryIt: 'Create a MaterialApp theme with `colorSchemeSeed: Colors.teal`. Add an AppBar, Card, TextField, and FilledButton. Now extend it by changing only the seed colour and watching the whole screen update.',
              takeaway: 'Theme once at the root, override sparingly per widget.',
            },
            {
              id: 'm1-t30',
              title: 'Dark Mode and Dynamic Theming',
              explain: 'Dark mode flips ThemeData based on system or user preference; dynamic theming reacts at runtime.',
              analogy: 'A Bangalore darshini looks different at 8 AM and 9 PM. Morning lights are bright, night lights are softer, but it is still the same hotel. Dark mode is that night setup for your app. You define a light theme and a dark theme, then let `themeMode` decide which one is active.',
              theory: `Dark mode is not "paint everything black and pray". That is how apps become unreadable at 11 PM. Proper dark mode means the whole colour system changes together: background, cards, text, buttons, dividers, disabled states, and input fields.\n\nFlutter gives you three root properties: \`theme\` for light theme, \`darkTheme\` for dark theme, and \`themeMode\` to choose which one is active. \`ThemeMode.system\` follows the user's phone setting. \`ThemeMode.light\` forces light. \`ThemeMode.dark\` forces dark.\n\nMaterial 3 makes this easier. You can create a light scheme with \`ColorScheme.fromSeed(seedColor: Colors.blue)\`, then create a dark scheme with the same seed plus \`brightness: Brightness.dark\`. Same brand, night-shift lighting.\n\nIf you use \`Theme.of(context).colorScheme\` in your widgets, most colours switch automatically. If you hard-code \`Colors.black\` text everywhere, dark mode will punish you immediately. The text may disappear, and your app will look like it joined a magic show.\n\nIn Module 1, use \`ThemeMode.system\`. Later, when you learn state management, you can build a settings toggle so the user chooses light, dark, or system.`,
              whyItMatters: 'Users expect dark mode, especially developers, students, and late-night commuters. Apps that hard-code black text or white cards break in dark mode. Learning this now trains you to use theme values instead of one-off colours.',
              steps: [
                'First create the normal light `ThemeData` and confirm the app still runs.',
                'Create a second `ThemeData` for `darkTheme` using `brightness: Brightness.dark`.',
                'Set `themeMode: ThemeMode.system` so the app follows the phone or browser setting.',
                'Change your OS/browser theme and reload or hot restart to see the difference.',
                'Replace hard-coded card/text colours with `Theme.of(context).colorScheme` values.',
                'Temporarily force `ThemeMode.dark` to inspect the dark design without changing system settings.',
                'Keep the manual toggle for later modules when state management is introduced.',
              ],
              code: `import 'package:flutter/material.dart';

void main() => runApp(const DarkModeApp());

class DarkModeApp extends StatelessWidget {
  const DarkModeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue, brightness: Brightness.dark),
      ),
      themeMode: ThemeMode.system,
      home: const DarkModePage(),
    );
  }
}

class DarkModePage extends StatelessWidget {
  const DarkModePage({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Night Orders')),
      body: Center(
        child: Card(
          color: colors.surfaceContainerHighest,
          child: const Padding(
            padding: EdgeInsets.all(20),
            child: Text('Kundapura parcel tracking works day and night.'),
          ),
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Hard-coded black text.** It may disappear on dark backgrounds.',
                '**Hard-coded white cards.** They glare in dark mode.',
                '**No darkTheme.** `ThemeMode.system` needs both theme definitions to shine.',
                '**Assuming dark means pure black.** Material dark surfaces use nuanced colours.',
                '**Forgetting images.** Some images need dark-friendly versions or overlays.',
                '**Switching theme without state.** Runtime toggles need state management, covered later.',
              ],
              tryIt: 'Add light and dark themes to a small food-order app. Set `themeMode: ThemeMode.system`, then switch your OS/browser theme to test it. Now extend it by temporarily forcing `ThemeMode.dark`.',
              takeaway: 'Define light and dark themes; let MaterialApp.themeMode choose.',
            },
          ],
        },
      ],
      projects: [
        {
          id: 'm1-p1',
          type: 'Mini Project',
          title: 'Udupi Hotel Menu Shell',
          domain: 'Mobile UI',
          duration: '2 hours',
          description: 'Build a clean Flutter app shell for a small Udupi hotel. The app uses MaterialApp, Scaffold, AppBar, NavigationBar, Drawer, Cards, Text, buttons, and responsive SafeArea layout.',
          tools: ['Flutter', 'Dart', 'Material 3', 'Scaffold', 'NavigationBar'],
          blueprint: {
            overview: 'Create the first real app shell a local hotel could use to show menu, offers, cart, and profile screens.',
            functionalRequirements: [
              '**Home tab.** Show today specials such as masala dosa, neer dosa, filter coffee, and payasa.',
              '**Menu tab.** Display at least five items with price in Rs and one-line descriptions.',
              '**Cart tab.** Show an empty cart state and a primary `Order now` button.',
              '**Profile tab.** Show a customer card for Anjali from Bangalore.',
              '**Drawer.** Include About, Help, Coupons, and Settings actions with SnackBar feedback.',
              '**Responsive safety.** Wrap body content in SafeArea and avoid overflow on small phones.',
            ],
            technicalImplementation: [
              '**App root.** Use `MaterialApp` with `ThemeData(useMaterial3: true, colorSchemeSeed: Colors.teal)`.',
              '**Shell.** Use a `StatefulWidget` with `selectedIndex` and `NavigationBar`.',
              '**Pages.** Store tab pages in a `List<Widget>` or `IndexedStack`.',
              '**Spacing.** Use `Padding`, `SizedBox`, and `Spacer` instead of blank Containers.',
              '**Typography.** Use `Theme.of(context).textTheme` for headings and body text.',
              '**Feedback.** Use `ScaffoldMessenger` for Drawer action SnackBars.',
            ],
            prompts: [
              { step: 1, label: 'Scaffold', outcome: 'A Flutter project with Material 3 root theme', prompt: 'Create a Flutter app called udupi_hotel_menu. Use Material 3, remove the debug banner, and set a teal color scheme seed.' },
              { step: 2, label: 'Shell', outcome: 'NavigationBar with four tabs', prompt: 'Build a StatefulWidget app shell with Home, Menu, Cart, and Profile tabs using NavigationBar and selectedIndex.' },
              { step: 3, label: 'Drawer', outcome: 'Secondary navigation drawer', prompt: 'Add a Scaffold drawer with About, Help, Coupons, and Settings ListTiles. Each tile should close the drawer and show a SnackBar.' },
              { step: 4, label: 'Content', outcome: 'Local Karnataka content', prompt: 'Fill the tabs with Udupi, Kundapura, and Bangalore examples. Use prices in Rs, short menu descriptions, Cards, Text, and buttons.' },
              { step: 5, label: 'Polish', outcome: 'Safe, readable layout', prompt: 'Wrap the body in SafeArea, use consistent SizedBox spacing, and make sure no Text overflows on a small Android phone.' },
            ],
            deliverable: 'A four-tab Flutter app shell for a local Udupi hotel with Drawer actions and polished spacing.',
          },
        },
        {
          id: 'm1-p2',
          type: 'Mini Project',
          title: 'Kundapura Parcel Booking Form',
          domain: 'Forms',
          duration: '3 hours',
          description: 'Create a parcel booking form for sending snacks from Kundapura to Bangalore. The project practices TextFormField, validation, buttons, SnackBar, layout spacing, and push/pop navigation to a confirmation screen.',
          tools: ['Flutter', 'Dart', 'Form', 'TextFormField', 'Navigator'],
          blueprint: {
            overview: 'Build a simple validated booking flow with one form screen and one confirmation screen.',
            functionalRequirements: [
              '**Sender details.** Capture sender name and phone number.',
              '**Receiver details.** Capture Bangalore receiver name, phone, address, and pincode.',
              '**Parcel details.** Let the user enter item name such as banana chips or kori rotti pack.',
              '**Validation.** Block submit until required fields are valid.',
              '**Confirmation.** Push a confirmation screen that shows parcel summary and estimated charge.',
              '**Back flow.** Use Navigator.pop to return from confirmation to the form.',
            ],
            technicalImplementation: [
              '**Form key.** Use `GlobalKey<FormState>` and `TextFormField` validators.',
              '**Keyboard types.** Use phone and number keyboards where appropriate.',
              '**Navigation.** Use `Navigator.push` with `MaterialPageRoute` for confirmation.',
              '**Data.** Pass a small Dart object or Map to the confirmation screen.',
              '**Layout.** Use `ListView` with padding so the form scrolls on small screens.',
              '**Feedback.** Show a SnackBar after validation succeeds.',
            ],
            prompts: [
              { step: 1, label: 'Form', outcome: 'Scrollable form screen', prompt: 'Create a Flutter parcel booking page with a Form, ListView, and TextFormFields for sender, receiver, address, pincode, and item.' },
              { step: 2, label: 'Validate', outcome: 'Required-field validation', prompt: 'Add validators for non-empty names, 10-digit phone numbers, 6-digit pincode, and non-empty address.' },
              { step: 3, label: 'Submit', outcome: 'Validation-driven submit button', prompt: 'When Save is tapped, call formKey.currentState!.validate(). If valid, show a SnackBar and navigate to a confirmation page.' },
              { step: 4, label: 'Confirm', outcome: 'Summary screen', prompt: 'Build a confirmation screen that receives parcel details and displays route Kundapura to Bangalore with charge in Rs.' },
              { step: 5, label: 'Polish', outcome: 'Readable mobile form', prompt: 'Use OutlineInputBorder, SizedBox gaps, SafeArea, and clear button hierarchy. Make sure keyboard-friendly fields use the right keyboardType.' },
            ],
            deliverable: 'A validated two-screen parcel booking app for Kundapura to Bangalore deliveries.',
          },
        },
        {
          id: 'm1-p3',
          type: 'Capstone',
          title: 'Instagram Clone: Login + Hardcoded Feed',
          domain: 'Mobile UI',
          duration: '1 day',
          description: 'Start the Instagram clone arc with a Flutter login screen and a scrolling hardcoded feed. This Module 1 capstone focuses only on fundamentals: app shell, text, images, buttons, simple navigation, and polished layout.',
          tools: ['Flutter', 'Dart', 'Material 3', 'Navigator', 'ListView'],
          blueprint: {
            overview: 'Create the first visual version of an Instagram-style app using only Module 1 concepts.',
            functionalRequirements: [
              '**Login screen.** Show app name, username TextField, password TextField, and Login button.',
              '**Navigation.** On valid login, push the feed screen.',
              '**Feed screen.** Show hardcoded posts from Anjali, Ravi, and Nisha with Bangalore/Udupi/Kundapura captions.',
              '**Post card.** Each post includes user row, image placeholder/network image, caption, like icon, and comment button.',
              '**Bottom navigation.** Include Home, Search, Add, Activity, and Profile destinations even if only Home is functional.',
              '**Theme.** Use Material 3 theme and clean text hierarchy.',
            ],
            technicalImplementation: [
              '**Data model.** Create a small `Post` class with author, location, imageUrl, caption, and likes.',
              '**Login form.** Use `Form`, `TextFormField`, and simple required validators.',
              '**Feed list.** Use `ListView.builder` to render post cards.',
              '**Images.** Use `Image.network` with fixed height, `BoxFit.cover`, and errorBuilder.',
              '**Navigation.** Use `Navigator.pushReplacement` after login.',
              '**Scaffold shell.** Use AppBar and NavigationBar on the feed screen.',
            ],
            prompts: [
              { step: 1, label: 'Scaffold', outcome: 'Flutter app with login route', prompt: 'Create a Flutter Instagram-style app with Material 3 theme, LoginPage as the first screen, and no debug banner.' },
              { step: 2, label: 'Login', outcome: 'Validated login UI', prompt: 'Build a login form with username and password TextFormFields, required validators, and a primary Login button.' },
              { step: 3, label: 'Model', outcome: 'Hardcoded post data', prompt: 'Create a Post class and a list of hardcoded posts using names Anjali, Ravi, and Nisha with Udupi, Kundapura, and Bangalore captions.' },
              { step: 4, label: 'Feed', outcome: 'Scrolling post cards', prompt: 'Build a FeedPage with AppBar, NavigationBar, and ListView.builder that renders each post as a card with image, caption, like icon, and comments action.' },
              { step: 5, label: 'Polish', outcome: 'Module 1 quality app', prompt: 'Use SafeArea, SizedBox spacing, theme text styles, Image.network errorBuilder, and make the UI readable on a small phone.' },
              { step: 6, label: 'README', outcome: 'Clear learning summary', prompt: 'Write a README explaining which Module 1 Flutter fundamentals are used: Scaffold, widgets, forms, navigation, images, text, buttons, and theming.' },
            ],
            deliverable: 'A beginner Instagram-style Flutter app with login and a hardcoded scrolling feed.',
          },
        },
      ],
      quiz: [
        {
          id: 'm1-q1',
          q: 'Where should a FloatingActionButton normally be placed?',
          options: ['Inside a Row', 'Inside Scaffold.floatingActionButton', 'Inside MaterialApp.routes', 'Inside pubspec.yaml'],
          answer: 1,
        },
        {
          id: 'm1-q2',
          q: 'In a Row, what does the main axis represent?',
          options: ['Top to bottom direction', 'Horizontal left to right direction', 'Device brightness', 'Navigator stack depth'],
          answer: 1,
        },
        {
          id: 'm1-q3',
          q: 'Which widget is best for validating multiple input fields together?',
          options: ['Container', 'Form', 'SafeArea', 'NavigationBar'],
          answer: 1,
        },
        {
          id: 'm1-q4',
          q: 'What is the safest beginner rule for bottom navigation destinations?',
          options: ['Use one tab for every screen', 'Use three to five top-level destinations', 'Put settings and legal pages as tabs', 'Push a new route for every tab tap'],
          answer: 1,
        },
        {
          id: 'm1-q5',
          q: 'What does ThemeMode.system do?',
          options: ['Always forces light mode', 'Always forces dark mode', 'Follows the device light or dark preference', 'Disables ThemeData'],
          answer: 2,
        },
      ],
    },
    {
      id: 'm2',
      title: 'UI & Layouts Deep-Dive',
      hours: 12,
      color: 'from-violet-500/20 to-violet-700/10',
      accent: 'violet',
      description:
        'Row/Column/Stack, Slivers, ListView, GridView, custom paint, animations, transitions.',
      sections: (() => {
        const commonPitfalls = [
          '**Decorating before sizing.** You add colors and shadows first, then wonder why the layout jumps. First decide size, then position, then decoration.',
          '**Guessing with random numbers.** A `height: 417` because it looked okay on your laptop becomes comedy on a small phone. Prefer constraints, `Expanded`, `Flexible`, and responsive rules.',
          '**Forgetting scroll.** A layout that fits on your monitor may overflow on a real phone keyboard. If content can grow, plan a scrollable parent.',
          '**Nested scroll confusion.** A `ListView` inside another `ListView` without constraints behaves like two buses trying to enter the same narrow Udupi lane. Give the inner list a height or use slivers.',
          '**Pretty but unreadable.** Tiny text, low contrast, and cramped spacing make the app feel cheap. UI is not decoration; UI is communication.',
          '**Copy-paste widget trees.** Repeating the same card 10 times makes future edits painful. Extract a small widget once the pattern is clear.',
        ]

        const layoutCode = (className, child) => `import 'package:flutter/material.dart';

void main() => runApp(const ${className}App());

class ${className}App extends StatelessWidget {
  const ${className}App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.deepPurple),
      home: const ${className}Screen(),
    );
  }
}

class ${className}Screen extends StatelessWidget {
  const ${className}Screen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('${className.replace(/([A-Z])/g, ' $1').trim()}')),
      body: ${child},
    );
  }
}`

        const topic = ({
          id,
          title,
          explain,
          analogy,
          theory,
          whyItMatters,
          steps,
          code,
          pitfalls,
          tryIt,
          takeaway,
        }) => ({
          id,
          title,
          explain,
          analogy,
          theory,
          whyItMatters,
          steps,
          code,
          pitfalls,
          tryIt,
          takeaway,
        })

        return [
          {
            id: 'm2-s1',
            title: 'Layout Rules, Constraints, and Composition',
            topics: [
              topic({
                id: 'm2-t1',
                title: 'Flutter Layout Mental Model: Constraints Go Down, Sizes Go Up',
                explain: 'Learn the one sentence that explains almost every Flutter layout: parents send constraints down, children choose sizes, parents place them.',
                analogy: 'Imagine an idli steamer in an Udupi hotel kitchen. The big steamer says, "Each plate must fit inside this round rack." Each idli plate decides how much batter sits in each mould. Then the cook stacks the plates neatly. Flutter layout works the same: the parent gives the allowed box, the child picks a size inside that box, and the parent positions it. If you pour batter outside the mould, it leaks; if your widget ignores constraints, you get overflow stripes.',
                theory: 'Every Flutter layout starts with **constraints**. A parent widget does not ask, "How big do you want to be?" like a polite hotel waiter. It says, "You may be between this minimum width/height and this maximum width/height." The child then chooses a concrete size inside that range.\n\nAfter the child chooses a size, the parent performs **placement**. This is why `Center` can center a child only after the child has a final size, and why `Row` can arrange children only after it knows how wide each child became. The three-part rhythm is: **constraints down**, **sizes up**, **positions down**.\n\nWhen you understand this, Flutter error messages become less scary. "RenderFlex overflowed" usually means the parent gave a limited space, but the children together asked for more. "BoxConstraints forces an infinite height" means a child was told it could grow forever, like giving unlimited dosa batter to one plate and expecting a clean counter.',
                whyItMatters: 'Strong Flutter UI developers debug layout by reading constraints, not by guessing pixels. In interviews and real projects, this mental model is the difference between calmly fixing overflow and randomly wrapping everything in `Expanded` until the screen surrenders.',
                steps: [
                  'Create a `Scaffold` with a `Center` body and a small colored `Container` child.',
                  'Wrap the same child in `SizedBox(width: 200, height: 120)` and notice the parent now sends tighter constraints.',
                  'Replace `Center` with `Align(alignment: Alignment.topRight)` and observe placement changes without the child changing size.',
                  'Put three fixed-width containers inside a `Row` and shrink the window to trigger overflow.',
                  'Fix the overflow with one `Expanded` child and explain out loud which constraint changed.',
                ],
                code: layoutCode('ConstraintModel', `Center(
        child: Container(
          width: 220,
          height: 140,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: Colors.deepPurple.shade100,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.deepPurple, width: 2),
          ),
          child: const Text(
            'Parent gives box. Child chooses size.',
            textAlign: TextAlign.center,
          ),
        ),
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Thinking child controls everything.** A child cannot become wider than the parent allows. Fix the parent constraints first.',
                  '**Ignoring error text.** Flutter overflow errors mention the exact direction and pixels. Read them like a bill total, not like fine print.',
                ],
                tryIt: 'Build a screen with three boxes: one inside `Center`, one inside `Align`, and one inside `SizedBox.expand`. Write one sentence under each box explaining who controlled its size. Now extend it to make the same boxes behave differently inside a `Column`.',
                takeaway: 'Flutter layout is a polite negotiation: parent limits, child chooses, parent places.',
              }),
              topic({
                id: 'm2-t2',
                title: 'BoxConstraints, Intrinsic Size, and Why Overflow Happens',
                explain: 'Understand tight, loose, bounded, and unbounded constraints so overflow errors stop feeling mysterious.',
                analogy: 'A Bangalore Metro platform has yellow lines, gates, and a fixed train length. Passengers can stand anywhere inside the marked area, but they cannot extend the train. A tight constraint is like an assigned seat. A loose constraint is like "stand anywhere inside this coach." An unbounded constraint is like saying, "Queue as long as you want on MG Road" and then acting shocked when it reaches Church Street.',
                theory: '`BoxConstraints` has four numbers: **minWidth**, **maxWidth**, **minHeight**, and **maxHeight**. If min and max are equal, the constraint is **tight**. If max is larger than min, the child has room to choose. If max is infinity, the child is in an **unbounded** direction.\n\nOverflow happens when children need more space than the parent can provide. In a `Row`, the horizontal direction is limited by the screen width. If every child has a fixed width and their total is larger than the screen, Flutter paints the famous yellow-black warning stripes.\n\nIntrinsic sizing asks a child, "How big would you naturally like to be?" It is useful for rare polish cases, but expensive because Flutter may measure children more than once. Use it sparingly, like adding extra ghee: great in the right place, heavy everywhere.',
                whyItMatters: 'Most professional Flutter bugs are not syntax bugs; they are sizing bugs across phones, tablets, web, and foldables. Understanding constraints lets you build UI that survives real devices instead of only your development window.',
                steps: [
                  'Create a `Row` with three `Container(width: 180)` children.',
                  'Run it on a narrow screen and read the overflow message.',
                  'Wrap one child with `Expanded` and see how it receives the remaining width.',
                  'Change `Row` to `SingleChildScrollView(scrollDirection: Axis.horizontal)` and compare the behavior.',
                  'Use `LayoutBuilder` to print or display the available `maxWidth`.',
                ],
                code: layoutCode('ConstraintOverflow', `LayoutBuilder(
        builder: (context, constraints) {
          return Column(
            children: [
              Text('Screen width: \${constraints.maxWidth.toStringAsFixed(0)} px'),
              const SizedBox(height: 16),
              Row(
                children: [
                  box('Udupi', Colors.purple.shade100),
                  box('Kundapura', Colors.orange.shade100),
                  Expanded(child: box('Bengaluru fills rest', Colors.green.shade100)),
                ],
              ),
            ],
          );
        },
      )` + `\n\nWidget box(String label, Color color) {
  return Container(
    height: 80,
    width: 140,
    alignment: Alignment.center,
    margin: const EdgeInsets.all(6),
    color: color,
    child: Text(label, textAlign: TextAlign.center),
  );
}`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Using `IntrinsicHeight` everywhere.** It can be expensive in long lists. Prefer predictable sizes first.',
                  '**Unbounded height in columns.** A `ListView` inside `Column` needs `Expanded`, `Flexible`, or a fixed height.',
                ],
                tryIt: 'Make a screen called `MetroConstraintLab` with a row of five station chips. First let it overflow, then fix it two ways: with horizontal scrolling and with `Wrap`. Now extend it to show the available width using `LayoutBuilder`.',
                takeaway: 'Overflow is not Flutter being rude; it is Flutter saying your children asked for more than the parent had.',
              }),
              topic({
                id: 'm2-t3',
                title: 'Row, Column, MainAxisAlignment, and CrossAxisAlignment',
                explain: 'Go deeper than basic `Row` and `Column` by mastering main axis, cross axis, spacing, stretching, and alignment.',
                analogy: 'Think of a Kundapura wedding meal line. If people stand from left to right near the plantain-leaf counter, that is a `Row`. If they stand one behind another from entrance to serving area, that is a `Column`. The **main axis** is the direction of the queue. The **cross axis** is the shoulder-to-shoulder direction. If the server shouts "spread out evenly," that is `spaceEvenly`; if he says "stand near the start," that is `start`.',
                theory: '`Row` lays children horizontally. `Column` lays children vertically. Both are `Flex` widgets, so they use the same vocabulary: **main axis** is the direction children are placed, and **cross axis** is the opposite direction.\n\n`MainAxisAlignment` decides how leftover space is distributed along the main axis. `start`, `center`, `end`, `spaceBetween`, `spaceAround`, and `spaceEvenly` all answer one question: where should unused space go? `CrossAxisAlignment` decides how children line up across the opposite axis: at the start, center, end, baseline, or stretched.\n\nThe trick is to stop memorizing and start pointing. In a `Row`, point left-to-right: that is main. Point top-to-bottom: that is cross. In a `Column`, point top-to-bottom: main. Point left-to-right: cross. Do this with your finger and the axis names stop mixing like chutney in sambar.',
                whyItMatters: 'Almost every screen starts as rows inside columns or columns inside rows. If you master alignment now, later widgets like cards, forms, toolbars, and feed cells become much easier.',
                steps: [
                  'Create a `Column` with `mainAxisAlignment: MainAxisAlignment.center`.',
                  'Add three small containers with different widths.',
                  'Change `crossAxisAlignment` from `center` to `stretch` and observe width behavior.',
                  'Switch the parent to a `Row` and repeat the same alignment experiment.',
                  'Add `SizedBox` gaps only when alignment is not the right tool.',
                ],
                code: layoutCode('AxisPractice', `Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: const [
            MealLineTile(label: 'Rice served first'),
            SizedBox(height: 12),
            MealLineTile(label: 'Sambar next'),
            SizedBox(height: 12),
            MealLineTile(label: 'Payasa final boss'),
          ],
        ),
      )` + `\n\nclass MealLineTile extends StatelessWidget {
  const MealLineTile({super.key, required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.deepPurple.shade50,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(label),
      ),
    );
  }
}`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Main/cross swap.** `Row` main is horizontal; `Column` main is vertical. Point with your finger before coding.',
                  '**Using padding for distribution.** If the gap depends on available space, use `MainAxisAlignment` or flex instead.',
                ],
                tryIt: 'Create a `BananaLeafMealColumn` with rice, sambar, pickle, and payasa tiles. Try every `MainAxisAlignment` value and write which one feels like a real serving line. Now extend it to a horizontal `Row` for a tablet layout.',
                takeaway: 'For `Row` and `Column`, first name the main axis; the right alignment usually follows.',
              }),
              topic({
                id: 'm2-t4',
                title: 'Expanded, Flexible, Spacer, and FractionallySizedBox',
                explain: 'Learn how children share remaining space without hardcoding phone-specific pixel widths.',
                analogy: 'At an MTR breakfast table in Bengaluru, four friends order idli, vada, khara bath, and coffee. Fixed items take fixed space. Hungry Ravi says, "Give me whatever extra idli is left" — that is `Expanded`. Suma says, "I can take extra, but only if available" — that is `Flexible`. The empty chair between two groups is `Spacer`. `FractionallySizedBox` is the friend who says, "I want exactly half the table, no drama."',
                theory: '`Expanded` and `Flexible` work only inside `Flex` widgets: `Row`, `Column`, or `Flex`. They tell the parent how to distribute remaining space after non-flex children are measured. `Expanded` forces its child to fill its assigned share. `Flexible` allows its child to be smaller than its share.\n\n`Spacer` is simply an `Expanded` with an empty child. It is perfect for pushing toolbar items apart. `FractionallySizedBox` sizes a child as a fraction of its parent, such as 0.8 width or 0.4 height.\n\nUse these when your layout should adapt. If one title should take leftover width between an icon and a price, use `Expanded`. If a form card should be 90% of screen width on phones and not exceed a max width on web, combine `FractionallySizedBox` with `ConstrainedBox`.',
                whyItMatters: 'Responsive UI is mainly about sharing space gracefully. These widgets let you build screens that feel natural from a small Android phone in Kundapura to a wide browser in Bengaluru.',
                steps: [
                  'Create a `Row` with a leading icon, title text, and price text.',
                  'Wrap the title with `Expanded` so long names do not push the price off-screen.',
                  'Replace `Expanded` with `Flexible` and compare behavior.',
                  'Add `Spacer()` between two buttons in an app-bar-like row.',
                  'Use `FractionallySizedBox(widthFactor: .9)` for a centered form panel.',
                ],
                code: layoutCode('FlexSharing', `Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: const [
                Icon(Icons.restaurant),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Kundapura special kori rotti family combo',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                SizedBox(width: 12),
                Text('₹260'),
              ],
            ),
            const SizedBox(height: 32),
            FractionallySizedBox(
              widthFactor: .9,
              child: FilledButton(
                onPressed: null,
                child: Text('Book table'),
              ),
            ),
          ],
        ),
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Expanded outside Row/Column.** `Expanded` must be a direct child of `Row`, `Column`, or `Flex`.',
                  '**Flex inside unbounded scroll.** `Expanded` inside a vertical scrollable can fail because there is no remaining height to divide.',
                ],
                tryIt: 'Make a `HotelBillRow` with item name, quantity, and amount. Use `Expanded` so the item name can be long without breaking the amount. Now extend it to show three bill rows inside a card.',
                takeaway: 'Use flex when space must be shared, not guessed.',
              }),
              topic({
                id: 'm2-t5',
                title: 'Stack, Positioned, Align, and Overlay-Style UI',
                explain: 'Build layered interfaces like badges, image captions, floating buttons, and story rings using `Stack`.',
                analogy: 'A Mysuru Dasara procession is layered: elephants in front, musicians behind, lights above, crowd barricades at the side, and the palace glowing in the background. A `Stack` is that procession on your screen. The background child goes first. Later children sit on top. `Positioned` says "stand exactly near the palace gate"; `Align` says "stay top right even if the ground size changes."',
                theory: '`Stack` paints children in order. The first child is the bottom layer, the last child is the top layer. Use it when elements visually overlap: badges on avatars, gradient captions over images, map pins, floating mini-controls, or onboarding illustrations.\n\n`Positioned` gives exact offsets from edges. It is good when the parent has a predictable size. `Align` positions a child using a relative alignment like top right or bottom center. It is usually more responsive because it does not depend on exact pixels.\n\nDo not use `Stack` as your default layout. If items should flow naturally, use `Column`, `Row`, `Wrap`, or scrollables. `Stack` is for intentional overlap. Too many positioned children become hard to maintain, like giving every Dasara performer a separate GPS coordinate.',
                whyItMatters: 'Modern mobile UI uses layering everywhere: profile badges, media cards, story indicators, cart bubbles, and floating mini players. `Stack` makes those designs possible without fake screenshots or brittle images.',
                steps: [
                  'Create a square `Stack` with a background `Container` or image.',
                  'Add a bottom caption using `Align(alignment: Alignment.bottomCenter)`.',
                  'Add a top-right badge using `Positioned(top: 12, right: 12)`.',
                  'Use `ClipRRect` if the stacked content must respect rounded corners.',
                  'Check small screen behavior before adding more positioned children.',
                ],
                code: layoutCode('StackBadgeCard', `Center(
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: SizedBox(
            width: 300,
            height: 220,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Container(color: Colors.deepPurple.shade200),
                Align(
                  alignment: Alignment.bottomCenter,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    color: Colors.black54,
                    child: const Text(
                      'Mysuru Dasara lights',
                      style: TextStyle(color: Colors.white, fontSize: 18),
                    ),
                  ),
                ),
                Positioned(
                  top: 12,
                  right: 12,
                  child: Badge(label: Text('LIVE')),
                ),
              ],
            ),
          ),
        ),
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Wrong paint order.** Later children appear on top. Move the badge after the image.',
                  '**Too many hard offsets.** `left: 37` may fail on another screen. Prefer `Align` when exact placement is not required.',
                ],
                tryIt: 'Create a `UdupiCafePhotoCard` with a background color or image placeholder, a bottom title strip, and a top-right "OPEN" badge. Now extend it with a small circular rating chip at bottom right.',
                takeaway: 'Use `Stack` when UI layers intentionally overlap; order is depth.',
              }),
              topic({
                id: 'm2-t6',
                title: 'Wrap, Flow, Chips, and Responsive Lines',
                explain: 'Use `Wrap` when items should automatically move to the next line instead of overflowing.',
                analogy: 'At a Udupi chaat stall, toppings keep coming: onion, coriander, sev, curd, chutney, masala, tomato. If the counter is small, the bowls move to the next row. Nobody screams "overflow by 42 pixels." That is `Wrap`: it fills one line, then starts another line when space runs out.',
                theory: '`Wrap` is like `Row` with line breaks. It places children along a main direction and moves to a new run when there is no more space. `spacing` controls gaps between children in the same run. `runSpacing` controls gaps between lines.\n\nUse `Wrap` for chips, tags, filters, skill pills, photo thumbnails, and quick action buttons. A `Row` is correct when all children must stay on one line. A `Wrap` is correct when children may flow naturally.\n\n`Flow` is lower level and gives you custom positioning through a delegate. Most apps do not need it until they build unusual menus or animations. For learning and production forms, `Wrap` is the friendly choice.',
                whyItMatters: 'Responsive filter chips and tag lists are everywhere in real apps. `Wrap` gives you a clean layout on both narrow phones and wide screens without writing separate phone/tablet code.',
                steps: [
                  'Create a list of local filter names like Udupi, Kundapura, Bengaluru, Veg, Fish, Coffee.',
                  'Render each item as a `FilterChip` inside `Wrap`.',
                  'Set both `spacing` and `runSpacing` to keep rows readable.',
                  'Resize the screen and watch chips flow into new rows.',
                  'Add selection later with state management in Module 3.',
                ],
                code: layoutCode('WrapChips', `Padding(
        padding: const EdgeInsets.all(16),
        child: Wrap(
          spacing: 10,
          runSpacing: 10,
          children: const [
            Chip(label: Text('Udupi meals')),
            Chip(label: Text('Kundapura curry')),
            Chip(label: Text('Bengaluru coffee')),
            Chip(label: Text('Budget ₹100')),
            Chip(label: Text('Family table')),
            Chip(label: Text('Open now')),
            Chip(label: Text('Near bus stand')),
          ],
        ),
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Using Row for unknown count.** If the number of chips can grow, `Row` will overflow. Use `Wrap`.',
                  '**No run spacing.** Chips on different lines look stuck together. Add `runSpacing`.',
                ],
                tryIt: 'Build a `FoodFilterWrap` with at least 12 chips. Test it at phone width and desktop width. Now extend it to use `ActionChip` for one chip that prints "filter tapped".',
                takeaway: '`Wrap` is a row that knows when to take the next line.',
              }),
              topic({
                id: 'm2-t7',
                title: 'Reusable Layout Widgets and Composition Patterns',
                explain: 'Extract repeated UI into small widgets so your screen does not become one giant unreadable tree.',
                analogy: 'Kundapura koli rotti is not one mysterious mega-item. It is rotti, curry, onion, lemon, and sometimes boiled egg arranged together. Each part has a job. Flutter composition is the same: a screen is not one 400-line widget; it is small widgets combined into a meal that makes sense.',
                theory: 'Flutter UI is built through **composition**. Instead of subclassing a giant base screen, you create small `StatelessWidget` pieces and assemble them. A `MenuCard`, `PriceTag`, `SectionHeader`, and `EmptyState` can each be tiny and readable.\n\nExtract a widget when the same structure repeats, when a build method becomes hard to scan, or when a piece has a clear name in the product language. Do not extract every `Padding` into its own widget. Extract meaning, not noise.\n\nGood composition makes future changes cheap. If every restaurant card uses the same `HotelCard` widget, changing corner radius, padding, or text style takes one edit. If you copied the same 40 lines everywhere, even a small design change becomes a full afternoon.',
                whyItMatters: 'Senior Flutter engineers are judged by how maintainable their widget trees are. Clean composition lets teams move faster without turning the UI layer into coconut-fiber rope knots.',
                steps: [
                  'Build one hotel card inline first so the shape is visible.',
                  'Extract it into a `StatelessWidget` called `HotelCard`.',
                  'Pass only the data that changes: name, area, price, and rating.',
                  'Keep layout constants inside the widget if they are part of the design.',
                  'Use the extracted widget three times with different local data.',
                ],
                code: layoutCode('ReusableCards', `ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          HotelCard(name: 'Diana Restaurant', area: 'Udupi', price: '₹120', rating: '4.6'),
          HotelCard(name: 'Koli Rotti Mane', area: 'Kundapura', price: '₹180', rating: '4.4'),
          HotelCard(name: 'Filter Coffee Stop', area: 'Bengaluru', price: '₹60', rating: '4.8'),
        ],
      )` + `\n\nclass HotelCard extends StatelessWidget {
  const HotelCard({
    super.key,
    required this.name,
    required this.area,
    required this.price,
    required this.rating,
  });

  final String name;
  final String area;
  final String price;
  final String rating;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const CircleAvatar(child: Icon(Icons.restaurant)),
        title: Text(name),
        subtitle: Text(area),
        trailing: Text('$price\\n★ $rating', textAlign: TextAlign.end),
      ),
    );
  }
}`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Extracting too early.** First build one clear example. Extract after the repeated shape is obvious.',
                  '**Passing BuildContext everywhere.** Child widgets already receive their own `context` in `build`.',
                ],
                tryIt: 'Build three repeated bus route cards inline, then extract a `RouteCard`. Use Udupi to Kundapura, Kundapura to Bengaluru, and Bengaluru to Mysuru data. Now extend it by adding an optional "fastest" badge.',
                takeaway: 'Extract widgets around meaning: card, header, row, badge, empty state.',
              }),
            ],
          },
          {
            id: 'm2-s2',
            title: 'Scrollables, Lists, Grids, and Slivers',
            topics: [
              topic({
                id: 'm2-t8',
                title: 'SingleChildScrollView vs ListView vs CustomScrollView',
                explain: 'Choose the right scrolling widget based on whether you have one big child, many similar children, or mixed sliver sections.',
                analogy: 'A small Udupi hotel bill is one page: use `SingleChildScrollView`. A KSRTC passenger list has many similar rows: use `ListView`. A Bengaluru mall has banners, grids, sticky headers, and lists on one long floor: use `CustomScrollView`. Same activity, different crowd management.',
                theory: '`SingleChildScrollView` scrolls one child. That child is often a `Column`. It is good for forms, settings pages, and content pages where the number of children is modest.\n\n`ListView` is for many items in one direction. `ListView.builder` lazily builds visible rows, making it perfect for feeds, menus, and search results. `CustomScrollView` combines **slivers**, which are scrollable building blocks like `SliverAppBar`, `SliverList`, and `SliverGrid`.\n\nThe beginner mistake is using `SingleChildScrollView` plus a giant `Column` for hundreds of items. That builds everything at once. Use builder lists for repeated data. Use slivers when the screen has mixed scroll behavior.',
                whyItMatters: 'Scrolling performance is a core mobile skill. Feeds, carts, profiles, search results, dashboards, and settings all depend on choosing the right scrollable.',
                steps: [
                  'Use `SingleChildScrollView` for a short profile/settings form.',
                  'Use `ListView.builder` for restaurant menu rows from a list.',
                  'Use `CustomScrollView` when you need a collapsing app bar plus list/grid content.',
                  'Never put an unbounded `ListView` directly inside a `Column` without `Expanded` or a fixed height.',
                  'Prefer builders when item count can grow beyond what fits on one screen.',
                ],
                code: layoutCode('ScrollChoice', `ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 30,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: CircleAvatar(child: Text('\${index + 1}')),
              title: Text('Meal parcel order #\${index + 1}'),
              subtitle: const Text('Udupi kitchen queue'),
              trailing: const Icon(Icons.chevron_right),
            ),
          );
        },
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Building 500 children in a Column.** Use `ListView.builder` so off-screen rows are lazy.',
                  '**Scroll inside scroll.** Nested scrollables need clear constraints or slivers.',
                ],
                tryIt: 'Build the same 25-item menu once with `SingleChildScrollView + Column` and once with `ListView.builder`. Now extend it by adding a `debugPrint` inside the builder to see lazy building.',
                takeaway: 'One child scrolls with `SingleChildScrollView`; many similar children scroll with `ListView.builder`; mixed scroll scenes use slivers.',
              }),
              topic({
                id: 'm2-t9',
                title: 'ListView.builder, ListTile, Separators, and Empty States',
                explain: 'Create efficient list screens with rows, dividers, loading-friendly structure, and helpful empty states.',
                analogy: 'A Kundapura fish market stall does not repaint every fish board when one customer asks for bangda. The seller points only to the needed row. `ListView.builder` behaves like that: it prepares rows when they are needed, not all at sunrise.',
                theory: '`ListView.builder` receives an `itemCount` and an `itemBuilder`. Flutter calls the builder for visible items and nearby cached items. This keeps long lists fast. `ListTile` gives you a standard row with leading, title, subtitle, trailing, and tap behavior.\n\nUse `ListView.separated` when every row needs a divider or gap. It keeps separators separate from item UI, which is cleaner than adding borders inside every row. Always handle empty lists with a clear empty state; a blank white screen makes users think the app broke.\n\nA list row should be tappable only when it actually does something. Add visual affordances like a trailing chevron for navigation. For static rows, keep them calm.',
                whyItMatters: 'Real apps are list-heavy: orders, messages, contacts, products, transactions, notifications. Efficient list building is not optional; it is daily Flutter work.',
                steps: [
                  'Create a `List<String>` of restaurant names.',
                  'Render it with `ListView.separated`.',
                  'Use `ListTile` with `leading`, `title`, `subtitle`, and `trailing`.',
                  'If the list is empty, return a centered empty-state widget instead.',
                  'Add `onTap` later to navigate to details.',
                ],
                code: layoutCode('MenuList', `Builder(
        builder: (context) {
          const hotels = ['Diana - Udupi', 'Woodlands - Bengaluru', 'Koli Rotti Mane - Kundapura'];
          if (hotels.isEmpty) {
            return const Center(child: Text('No hotels found. Time for home dosa.'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: hotels.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              return ListTile(
                leading: const Icon(Icons.restaurant_menu),
                title: Text(hotels[index]),
                subtitle: const Text('Tap to view today menu'),
                trailing: const Icon(Icons.chevron_right),
              );
            },
          );
        },
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Missing itemCount.** Without `itemCount`, the builder can act endless. Provide it for finite lists.',
                  '**No empty state.** Empty data should say what happened and what the user can do next.',
                ],
                tryIt: 'Create a `BusStopList` with 10 stops from Udupi to Kundapura. Use `ListView.separated`. Now extend it so an empty route list displays "No buses right now, drink coffee and refresh."',
                takeaway: 'Builder lists are fast because Flutter cooks only the rows the user can reach.',
              }),
              topic({
                id: 'm2-t10',
                title: 'GridView, SliverGrid, and Responsive Card Counts',
                explain: 'Build photo grids, product grids, and dashboard tiles that adapt to available width.',
                analogy: 'An idli steamer has plates with fixed moulds. A small steamer fits 4 idlis per plate; a hotel-size steamer fits 16. `GridView` is the steamer. `crossAxisCount` is how many moulds fit across. On wider screens, you can fit more without making each idli weirdly huge.',
                theory: '`GridView` displays children in rows and columns. `GridView.count` is quick for fixed counts. `GridView.builder` is better for data lists. `SliverGrid` is the sliver version used inside `CustomScrollView`.\n\nTwo common delegates exist: `SliverGridDelegateWithFixedCrossAxisCount` and `SliverGridDelegateWithMaxCrossAxisExtent`. Fixed count says "always 2 columns." Max extent says "each tile may be up to this width; calculate columns automatically." Max extent is often better for responsive web/tablet layouts.\n\nSpacing matters. Use `mainAxisSpacing`, `crossAxisSpacing`, and `childAspectRatio` to prevent tiles from looking like squashed dosa parcels.',
                whyItMatters: 'Profile screens, ecommerce catalogs, galleries, admin dashboards, and Instagram-style grids all use grid thinking. Responsive card counts make your UI feel professional on every screen.',
                steps: [
                  'Start with `GridView.builder` and six local place cards.',
                  'Use `SliverGridDelegateWithMaxCrossAxisExtent(maxCrossAxisExtent: 220)` for responsive columns.',
                  'Add `crossAxisSpacing` and `mainAxisSpacing`.',
                  'Set `childAspectRatio` based on card content.',
                  'Move to `SliverGrid` when combining with sliver headers.',
                ],
                code: layoutCode('ResponsiveGrid', `GridView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 12,
        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
          maxCrossAxisExtent: 220,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.15,
        ),
        itemBuilder: (context, index) {
          return Card(
            child: Center(
              child: Text(
                'Story tile \${index + 1}',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
          );
        },
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Fixed two columns everywhere.** Two columns may be too wide on desktop and too cramped on tiny phones.',
                  '**Bad aspect ratio.** If text gets clipped, adjust `childAspectRatio` instead of shrinking font blindly.',
                ],
                tryIt: 'Build a `ProfilePhotoGrid` with 15 placeholder tiles. Use max tile width rather than fixed count. Now extend it so every third tile says "Reel" with an icon.',
                takeaway: 'Use grids when items are peers, and let available width decide how many peers fit.',
              }),
              topic({
                id: 'm2-t11',
                title: 'SliverAppBar, SliverList, and Collapsing Headers',
                explain: 'Build polished scroll screens with headers that expand, collapse, float, or pin.',
                analogy: 'A Yakshagana stage curtain starts grand and dramatic, then lifts so the actual performance can continue. `SliverAppBar` is that curtain. It can start tall with artwork, shrink into a normal app bar, stay pinned, or float back when the user scrolls up.',
                theory: 'Slivers are portions of a scrollable area. `CustomScrollView` takes a list of slivers instead of normal widgets. `SliverAppBar` creates headers that participate in scrolling. `SliverList` and `SliverGrid` provide list and grid content in the same scroll world.\n\nImportant `SliverAppBar` flags are `pinned`, `floating`, and `snap`. `pinned: true` keeps the toolbar visible after collapse. `floating: true` lets it reappear as soon as the user scrolls up. `expandedHeight` controls the tall header size.\n\nOnce you use slivers, avoid stuffing normal `ListView` inside the same screen. Keep everything inside one `CustomScrollView` so physics and scrolling feel unified.',
                whyItMatters: 'Premium mobile screens often use collapsing headers: profiles, product pages, restaurant pages, and media apps. Slivers let you create that feel with native Flutter tools.',
                steps: [
                  'Create a `CustomScrollView`.',
                  'Add a `SliverAppBar` with `expandedHeight` and `FlexibleSpaceBar`.',
                  'Set `pinned: true` so the title remains visible.',
                  'Add a `SliverList` below it using `SliverChildBuilderDelegate`.',
                  'Later add `SliverGrid` for mixed profile content.',
                ],
                code: layoutCode('SliverHeader', `CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 180,
            flexibleSpace: FlexibleSpaceBar(
              title: const Text('Udupi Food Walk'),
              background: Container(color: Colors.deepPurple.shade200),
            ),
          ),
          SliverList.builder(
            itemCount: 20,
            itemBuilder: (context, index) => ListTile(
              leading: const Icon(Icons.place),
              title: Text('Stop \${index + 1}'),
              subtitle: const Text('Scroll with one smooth sliver world'),
            ),
          ),
        ],
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Mixing normal widgets directly.** Inside `CustomScrollView`, use slivers. Wrap normal boxes with `SliverToBoxAdapter`.',
                  '**Forgetting pinned behavior.** If users need navigation controls, pin the app bar.',
                ],
                tryIt: 'Create a `TempleWalkScreen` with a collapsing `SliverAppBar` and 20 stops. Now extend it by adding one `SliverToBoxAdapter` intro paragraph under the header.',
                takeaway: 'Slivers turn many scroll pieces into one smooth procession.',
              }),
              topic({
                id: 'm2-t12',
                title: 'NestedScrollView, TabBarView, and Coordinated Scrolling',
                explain: 'Coordinate tabs and scroll headers for profile, catalog, and detail screens.',
                analogy: 'In Bengaluru Majestic bus stand, upstairs platforms, downstairs platforms, and ticket counters all belong to one transport system. If each area made its own rules, passengers would riot before reaching Tumakuru. `NestedScrollView` coordinates multiple scroll areas so the header and tab content behave like one managed station.',
                theory: '`NestedScrollView` is useful when an outer header must scroll together with inner tab views. A common pattern is a collapsible `SliverAppBar` at the top, a `TabBar`, and separate scrollable lists inside each tab.\n\nThe key idea is coordination. The outer scroll view manages the header. The inner scroll views manage tab content. Flutter links them so dragging feels natural. Without coordination, the header may get stuck, inner lists may steal gestures, or tabs may feel detached.\n\nUse this pattern for profiles with posts/reels/tags, restaurant pages with menu/reviews/photos, and course pages with lessons/projects/quiz.',
                whyItMatters: 'Complex app screens rarely have only one list. Coordinated scrolling is a professional UI skill because it makes dense content feel simple.',
                steps: [
                  'Wrap the screen in `DefaultTabController`.',
                  'Use `NestedScrollView` with `headerSliverBuilder`.',
                  'Place `SliverAppBar` and a pinned `TabBar` in the header.',
                  'Use `TabBarView` as the body.',
                  'Make each tab content scroll independently with `ListView.builder`.',
                ],
                code: layoutCode('NestedTabs', `DefaultTabController(
        length: 3,
        child: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) => [
            const SliverAppBar(
              title: Text('Kundapura Kitchen'),
              pinned: true,
              bottom: TabBar(
                tabs: [
                  Tab(text: 'Menu'),
                  Tab(text: 'Reviews'),
                  Tab(text: 'Photos'),
                ],
              ),
            ),
          ],
          body: TabBarView(
            children: List.generate(3, (tab) {
              return ListView.builder(
                itemCount: 12,
                itemBuilder: (_, index) => ListTile(
                  title: Text('Tab \${tab + 1} item \${index + 1}'),
                ),
              );
            }),
          ),
        ),
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Using separate Scaffold per tab.** Tabs should usually be content, not full new screens.',
                  '**Uncoordinated headers.** If the header must collapse with tabs, use `NestedScrollView` instead of independent lists.',
                ],
                tryIt: 'Build a `RestaurantTabsScreen` with Menu, Reviews, and Photos tabs. Put 10 rows in each tab. Now extend it with a tall flexible header showing the restaurant name.',
                takeaway: 'When tabs and headers must scroll together, coordinate them instead of letting each scrollable fight alone.',
              }),
              topic({
                id: 'm2-t13',
                title: 'Pull to Refresh, ScrollController, and Infinite Loading',
                explain: 'Add refresh gestures, observe scroll position, and load more data near the end of a list.',
                analogy: 'A KSRTC conductor watches the bus aisle. If passengers are still boarding, he waits. When the bus reaches the last stop, he prepares the next trip sheet. `ScrollController` is your conductor: it knows where the user is in the scroll journey and can trigger work near the end.',
                theory: '`RefreshIndicator` wraps a vertical scrollable and runs an async callback when the user pulls down. It is the standard "refresh feed" gesture. The child must be scrollable, and if the list is short you may need always-scrollable physics.\n\n`ScrollController` lets you read scroll offset and listen for movement. Infinite loading usually checks whether the user is near `position.maxScrollExtent`, then fetches the next page. Guard it with an `isLoading` flag so one scroll does not start five requests.\n\nModule 4 will teach real networking. Here, focus on UI structure: show loading rows, avoid duplicate loads, and keep refresh and pagination behaviors understandable.',
                whyItMatters: 'Feeds, orders, chats, and product catalogs need refresh and pagination. Even before backend work, you must know where the UI hooks belong.',
                steps: [
                  'Create a `StatefulWidget` with a `ScrollController`.',
                  'Attach a listener in `initState` and dispose the controller in `dispose`.',
                  'Wrap the list in `RefreshIndicator`.',
                  'When near the bottom, append mock items after a short delay.',
                  'Show a bottom loading tile while more items are being added.',
                ],
                code: `import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: InfiniteMealsScreen()));

class InfiniteMealsScreen extends StatefulWidget {
  const InfiniteMealsScreen({super.key});

  @override
  State<InfiniteMealsScreen> createState() => _InfiniteMealsScreenState();
}

class _InfiniteMealsScreenState extends State<InfiniteMealsScreen> {
  final controller = ScrollController();
  final meals = List.generate(15, (i) => 'Meal order \${i + 1}');
  bool loading = false;

  @override
  void initState() {
    super.initState();
    controller.addListener(() {
      final nearEnd = controller.position.pixels > controller.position.maxScrollExtent - 160;
      if (nearEnd && !loading) loadMore();
    });
  }

  Future<void> loadMore() async {
    setState(() => loading = true);
    await Future.delayed(const Duration(milliseconds: 700));
    setState(() {
      meals.addAll(List.generate(5, (i) => 'Extra parcel \${meals.length + i + 1}'));
      loading = false;
    });
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Infinite Meals')),
      body: RefreshIndicator(
        onRefresh: () async => setState(() => meals.shuffle()),
        child: ListView.builder(
          controller: controller,
          itemCount: meals.length + (loading ? 1 : 0),
          itemBuilder: (_, index) {
            if (index == meals.length) return const Center(child: CircularProgressIndicator());
            return ListTile(title: Text(meals[index]));
          },
        ),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Not disposing controller.** Controllers hold listeners. Dispose them in `dispose`.',
                  '**Multiple loadMore calls.** Use an `isLoading` guard before starting pagination.',
                ],
                tryIt: 'Build an `OrderFeed` with 20 fake orders. Add pull-to-refresh that reverses the list. Now extend it with bottom pagination that adds 5 more fake orders.',
                takeaway: 'Refresh resets the list; pagination extends it.',
              }),
              topic({
                id: 'm2-t14',
                title: 'Performance Basics: const, Builders, RepaintBoundary, and Keys',
                explain: 'Keep UI smooth by reducing unnecessary rebuilds, lazy-building heavy children, and using keys correctly.',
                analogy: 'In an Udupi kitchen, the cook does not remake coconut chutney from scratch for every single idli plate. Some things are prepared once, some things are assembled on demand, and some things are labelled so they do not get swapped. `const`, builders, repaint boundaries, and keys are Flutter’s kitchen discipline.',
                theory: '`const` tells Flutter an object can be created at compile time and reused. It is not magic performance dust, but it reduces work for static widget subtrees. Use `const` wherever values are known at compile time.\n\nBuilder constructors like `ListView.builder` create children lazily. This is much more efficient than creating hundreds of widgets immediately. `RepaintBoundary` can isolate expensive painting, useful for complex custom-painted regions or animated pieces.\n\n`Key`s help Flutter match widgets to existing elements when order changes. Use keys for reorderable lists, animated list changes, and stateful repeated children. Do not sprinkle random keys everywhere; labels help only when they identify something meaningful.',
                whyItMatters: 'Users may forgive one missing shadow, but they notice jank instantly. Smooth Flutter UI comes from simple habits practiced consistently.',
                steps: [
                  'Add `const` to static widgets until the analyzer stops suggesting it.',
                  'Use builder constructors for long or data-driven lists.',
                  'Add `ValueKey(item.id)` when list items can reorder or be removed.',
                  'Wrap genuinely expensive painted/animated widgets with `RepaintBoundary`.',
                  'Profile later with DevTools when guessing is not enough.',
                ],
                code: layoutCode('PerformanceList', `ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 40,
        itemBuilder: (context, index) {
          final id = 'order-\$index';
          return Card(
            key: ValueKey(id),
            child: ListTile(
              leading: const Icon(Icons.receipt_long),
              title: Text('Parcel order \${index + 1}'),
              subtitle: const Text('Built lazily only when needed'),
            ),
          );
        },
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Ignoring analyzer const hints.** These hints are free cleanup. Accept them when values are static.',
                  '**Wrong keys.** Using list index as key can break when order changes. Prefer stable ids.',
                ],
                tryIt: 'Create a 50-row list with `ListView.builder`. Add `const` wherever possible and stable `ValueKey`s. Now extend it by shuffling the data and observing why keys matter.',
                takeaway: 'Smooth UI is built from small habits: const static pieces, lazy long lists, stable identity.',
              }),
            ],
          },
          {
            id: 'm2-s3',
            title: 'Visual Polish, Media, and Responsive Screens',
            topics: [
              topic({
                id: 'm2-t15',
                title: 'Cards, Material, InkWell, and Tap Feedback',
                explain: 'Make tappable surfaces feel native with Material elevation, shape, and ripple feedback.',
                analogy: 'A Bengaluru darshini token counter gives you feedback: token printed, bell rings, cashier nods. A silent tap feels suspicious. `InkWell` is Flutter’s tap feedback. `Material` is the surface that lets the ripple spread properly. Without it, the button is like a cashier staring into space after taking your money.',
                theory: '`Card` is a Material surface with shape, color, and optional elevation. It is good for grouped content such as restaurant rows, product summaries, and dashboard tiles. `InkWell` adds ripple and tap handling, but the ripple needs a `Material` ancestor to draw correctly.\n\nUse `InkWell` when a custom area is tappable. Use `ListTile` when your row matches standard leading/title/subtitle/trailing structure. Use real `Button` widgets for commands like Save, Submit, Pay, or Continue.\n\nTap targets should be comfortable. A pretty card that is hard to tap is not good UI. Keep important interactive areas at least around 48 logical pixels tall.',
                whyItMatters: 'Polished tap feedback makes apps feel trustworthy. Users may not name the missing ripple, but they feel when the interface is wooden.',
                steps: [
                  'Create a `Card` with rounded shape.',
                  'Place `InkWell` inside the card, not outside it.',
                  'Use `borderRadius` on both card shape and `InkWell` for matching ripple corners.',
                  'Add `onTap` that shows a `SnackBar`.',
                  'Keep content padding separate from tap handling.',
                ],
                code: layoutCode('TappableCard', `Center(
        child: Card(
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Masala dosa selected')),
            ),
            child: const Padding(
              padding: EdgeInsets.all(20),
              child: ListTile(
                leading: Icon(Icons.local_dining),
                title: Text('Masala Dosa'),
                subtitle: Text('Crispy, hot, and very clickable'),
                trailing: Icon(Icons.chevron_right),
              ),
            ),
          ),
        ),
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**InkWell without Material.** Ripple may not show. Put it inside `Material` or `Card`.',
                  '**Tiny tap area.** Do not make users tap exact text. Make the whole useful surface tappable.',
                ],
                tryIt: 'Build three tappable menu cards. Each tap should show a different `SnackBar`. Now extend it so the selected card changes its border color.',
                takeaway: 'Tappable UI should look tappable and feel tappable.',
              }),
              topic({
                id: 'm2-t16',
                title: 'ClipRRect, BorderRadius, Shadows, Gradients, and ShapeBorder',
                explain: 'Use shape and decoration carefully so your UI looks intentional instead of randomly fancy.',
                analogy: 'Mysore Pak works because ghee, sugar, and gram flour are balanced. Too much ghee becomes a puddle; too little becomes a brick. UI polish is the same. Rounded corners, shadows, and gradients must support the content, not shout louder than it.',
                theory: '`BoxDecoration` handles color, gradients, border, border radius, and shadows for boxes. `ClipRRect` clips its child to rounded corners, useful for images. `ShapeBorder` appears in Material widgets such as `Card`, `ButtonStyle`, and `OutlinedButton`.\n\nUse shadows to communicate elevation, not to decorate every rectangle. Use gradients when they help hierarchy or branding, not because the screen looked empty. Use clipping carefully because clipping can have performance cost when overused.\n\nA good rule: if removing the effect makes the UI clearer, the effect was decoration noise. If removing it makes hierarchy confusing, it was doing useful work.',
                whyItMatters: 'Clients often ask for "premium UI." Premium is rarely more effects; it is consistent shape, spacing, contrast, and hierarchy.',
                steps: [
                  'Create a decorated hero card with `BoxDecoration`.',
                  'Add a subtle gradient and one soft `BoxShadow`.',
                  'Use `ClipRRect` for image or colored placeholder clipping.',
                  'Keep border radius consistent across related components.',
                  'Check text contrast after adding gradients.',
                ],
                code: layoutCode('PolishedShape', `Center(
        child: Container(
          width: 320,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.deepPurple.shade500, Colors.deepPurple.shade200],
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: const [
              BoxShadow(blurRadius: 18, offset: Offset(0, 10), color: Colors.black26),
            ],
          ),
          child: const Text(
            'Evening filter coffee plan',
            style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
          ),
        ),
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Shadow soup.** Every card with a heavy shadow makes the app look noisy. Use elevation sparingly.',
                  '**Clipping mismatch.** Rounded card plus square image corners looks broken. Clip the image too.',
                ],
                tryIt: 'Create a `CafeOfferCard` with a gradient, radius, and subtle shadow. Now extend it by making a second calm version and compare which one reads better.',
                takeaway: 'Visual polish should guide the eye, not perform circus tricks.',
              }),
              topic({
                id: 'm2-t17',
                title: 'Images, AspectRatio, BoxFit, Placeholders, and Error Builders',
                explain: 'Display images without stretching, layout jumps, or broken blank spaces.',
                analogy: 'If you hang a Yakshagana poster in a frame, you do not stretch the actor’s face to fit the wall. You choose a frame ratio and decide whether to crop or contain. `AspectRatio` is the frame. `BoxFit.cover` crops neatly. `BoxFit.contain` shows everything with possible empty space.',
                theory: 'Images need predictable space. `AspectRatio` reserves a shape before the image loads, preventing layout jumps. `BoxFit.cover` fills the area and crops edges. `BoxFit.contain` shows the whole image but may leave gaps. `BoxFit.fill` stretches, which is rarely correct for real photos.\n\n`Image.network` should usually include `loadingBuilder` or a placeholder and `errorBuilder`. Broken images happen in real networks. A graceful fallback keeps the card useful.\n\nFor local images, declare assets in `pubspec.yaml` and use `Image.asset`. For production, optimize image sizes; loading a 6 MB photo into a tiny avatar is like sending a full KSRTC bus to deliver one coffee.',
                whyItMatters: 'Image-heavy screens are common: feeds, catalogs, stories, profile grids. Good image handling prevents jank, ugly stretching, and confusing broken states.',
                steps: [
                  'Wrap image areas with `AspectRatio`.',
                  'Use `BoxFit.cover` for photo cards and avatars that can crop.',
                  'Use `BoxFit.contain` for logos or artwork that must remain whole.',
                  'Add `loadingBuilder` for network images.',
                  'Add `errorBuilder` with an icon and message.',
                ],
                code: layoutCode('ImageFrame', `Center(
        child: Card(
          clipBehavior: Clip.antiAlias,
          child: SizedBox(
            width: 320,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Image.network(
                    'https://picsum.photos/800/450',
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.broken_image)),
                  ),
                ),
                const ListTile(title: Text('Coastal evening frame')),
              ],
            ),
          ),
        ),
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Using fill for photos.** Faces and plates stretch weirdly. Use `cover` or `contain`.',
                  '**No reserved image size.** Cards jump when images load. Use `AspectRatio` or fixed constraints.',
                ],
                tryIt: 'Build a `StoryImageCard` with `AspectRatio(1)`, `BoxFit.cover`, and an error icon. Now extend it by trying `contain`, `cover`, and `fill` so you can see the difference.',
                takeaway: 'Images need a frame first; fit is the rule for how the photo behaves inside it.',
              }),
              topic({
                id: 'm2-t18',
                title: 'Responsive LayoutBuilder and Breakpoints',
                explain: 'Use available width to switch layouts for phone, tablet, and desktop screens.',
                analogy: 'A food stall in Udupi serves from one counter. A Bengaluru food court needs separate counters for dosa, meals, coffee, and billing. Same food business, different available space. `LayoutBuilder` lets your UI ask, "How wide is my counter today?" before arranging itself.',
                theory: '`LayoutBuilder` exposes the constraints given to a widget. You can read `constraints.maxWidth` and decide whether to use a one-column phone layout, two-column tablet layout, or wider desktop layout.\n\nBreakpoints are product decisions, not sacred numbers. Common simple thresholds are under 600 for phone, 600-1000 for tablet, and above 1000 for desktop. Use them to change structure, not just font size.\n\nResponsive design does not mean everything scales bigger. Often it means showing side-by-side panels, increasing grid columns, or limiting content width so reading remains comfortable.',
                whyItMatters: 'Flutter can target mobile, web, desktop, and tablets. Teams expect you to build layouts that adapt instead of looking like a stretched phone app on every screen.',
                steps: [
                  'Wrap the main content with `LayoutBuilder`.',
                  'Read `constraints.maxWidth`.',
                  'Return a `Column` for narrow widths.',
                  'Return a `Row` or grid for wider widths.',
                  'Use `ConstrainedBox(maxWidth: ...)` to avoid overly wide reading content.',
                ],
                code: layoutCode('ResponsiveBreakpoints', `LayoutBuilder(
        builder: (context, constraints) {
          final wide = constraints.maxWidth >= 700;
          final menu = Container(color: Colors.deepPurple.shade100, height: 180, child: const Center(child: Text('Menu')));
          final details = Container(color: Colors.orange.shade100, height: 180, child: const Center(child: Text('Details')));
          return Padding(
            padding: const EdgeInsets.all(16),
            child: wide
                ? Row(children: [Expanded(child: menu), const SizedBox(width: 16), Expanded(child: details)])
                : Column(children: [menu, const SizedBox(height: 16), details]),
          );
        },
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Using device size blindly.** `MediaQuery` gives screen size; `LayoutBuilder` gives the space this widget actually has.',
                  '**Only changing text size.** Real responsive layout often changes structure.',
                ],
                tryIt: 'Create a `HotelDashboard` that shows menu and order summary stacked on phone but side-by-side on wide screens. Now extend it with a third panel that appears only above 1000 px.',
                takeaway: 'Responsive UI asks the available space before arranging the furniture.',
              }),
              topic({
                id: 'm2-t19',
                title: 'SafeArea, Insets, Keyboard, and View Padding',
                explain: 'Keep UI away from notches, system bars, and the keyboard while preserving useful screen space.',
                analogy: 'In a Bengaluru traffic signal, vehicles leave space for zebra crossings and medians. If everyone drives right up to every edge, chaos. `SafeArea` is that polite reserved space around notches and system UI. The keyboard is like a sudden roadblock; your form must move instead of hiding under it.',
                theory: '`SafeArea` adds padding to avoid system intrusions such as notches, status bars, and navigation bars. It reads from `MediaQuery` and applies only the needed sides. Use it for custom full-screen layouts, not necessarily every normal `Scaffold` body.\n\nWhen the keyboard appears, `Scaffold` can resize the body by default. For forms, combine scrollable content with padding so fields are still reachable. `MediaQuery.viewInsets.bottom` tells you how much space the keyboard occupies.\n\nDo not solve keyboard issues with giant fixed bottom padding. It may look okay on one phone and silly everywhere else. Let the system tell you the insets.',
                whyItMatters: 'Nothing says "unfinished app" faster than a submit button hidden behind the keyboard or text under a notch. Insets are small details with big user impact.',
                steps: [
                  'Use `SafeArea` around custom full-screen content.',
                  'Make long forms scrollable with `SingleChildScrollView`.',
                  'Add bottom padding based on `MediaQuery.viewInsets.bottom` for keyboard-aware spacing.',
                  'Avoid fixed magic padding for notches or keyboards.',
                  'Test by focusing the last text field on a small phone.',
                ],
                code: layoutCode('KeyboardSafeForm', `SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.fromLTRB(
            16,
            16,
            16,
            16 + MediaQuery.of(context).viewInsets.bottom,
          ),
          child: const Column(
            children: [
              TextField(decoration: InputDecoration(labelText: 'Name')),
              SizedBox(height: 16),
              TextField(decoration: InputDecoration(labelText: 'Phone')),
              SizedBox(height: 400),
              FilledButton(onPressed: null, child: Text('Submit booking')),
            ],
          ),
        ),
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Button hidden by keyboard.** Put forms in a scrollable and respect `viewInsets.bottom`.',
                  '**Double safe padding.** `Scaffold` app bars already handle status bars. Add `SafeArea` only where needed.',
                ],
                tryIt: 'Build a `ParcelBookingForm` with fields near the bottom. Focus the last field and verify the button remains reachable. Now extend it with `SafeArea` only around the body.',
                takeaway: 'Respect system edges and keyboard insets; your UI should never hide under the phone.',
              }),
              topic({
                id: 'm2-t20',
                title: 'Theme Extensions, ColorScheme, TextTheme, and Design Tokens',
                explain: 'Use theme values instead of random colors and font sizes scattered across screens.',
                analogy: 'Yakshagana makeup has a color language. Red, black, white, and gold are not random; each role has a system. Your app theme should behave the same. `ColorScheme`, `TextTheme`, and design tokens keep the whole app speaking one visual language instead of changing costume every screen.',
                theory: '`ThemeData` centralizes app styling. `ColorScheme` defines semantic colors like primary, secondary, surface, error, and outline. `TextTheme` defines text roles like headline, title, body, and label. Use these roles instead of hardcoding `Colors.purple` and `fontSize: 17` everywhere.\n\nDesign tokens are named values for spacing, radius, duration, and other repeated design decisions. Flutter has built-in theme systems, and you can create your own constants or `ThemeExtension` for custom tokens.\n\nThis makes redesigns possible. If the client says "make the app more coastal and less corporate," you should change theme values, not hunt 200 random colors.',
                whyItMatters: 'Consistent theming is a team skill. Designers, developers, and QA can talk in shared tokens instead of arguing about one-off pixels.',
                steps: [
                  'Set `ThemeData(useMaterial3: true, colorSchemeSeed: ...)` in `MaterialApp`.',
                  'Use `Theme.of(context).colorScheme` for colors.',
                  'Use `Theme.of(context).textTheme` for text roles.',
                  'Create a small `AppSpacing` class for repeated spacing values.',
                  'Avoid raw colors in feature widgets unless truly local.',
                ],
                code: layoutCode('ThemeTokens', `Builder(
        builder: (context) {
          final scheme = Theme.of(context).colorScheme;
          final text = Theme.of(context).textTheme;
          return Center(
            child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: scheme.primaryContainer,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                'Theme speaks for the whole app',
                style: text.titleLarge?.copyWith(color: scheme.onPrimaryContainer),
              ),
            ),
          );
        },
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Random color scatter.** Hardcoded colors make redesign painful. Use `ColorScheme`.',
                  '**One text style everywhere.** Use semantic text roles so hierarchy is clear.',
                ],
                tryIt: 'Create a `ThemeDemoCard` using only `colorScheme` and `textTheme`. Now extend it by changing the app `colorSchemeSeed` and watching the card update automatically.',
                takeaway: 'A theme is your app costume department; do not dress every widget by hand.',
              }),
              topic({
                id: 'm2-t21',
                title: 'Accessibility: Semantics, Contrast, Text Scale, and Tap Targets',
                explain: 'Make layouts usable for people with screen readers, larger text, and different interaction needs.',
                analogy: 'At Krishna Matha annadana, signs, queues, volunteers, and clear paths help everyone eat without confusion. Accessibility is that same hospitality in software. A beautiful UI that some users cannot read or tap is not beautiful; it is a locked dining hall with nice paint.',
                theory: 'Flutter provides accessibility through the semantics tree. Many Material widgets already expose good semantics, but custom gesture areas, icons, and painted UI may need `Semantics` labels. Icon-only buttons need tooltips or labels so assistive tech can explain them.\n\nText scale matters. Users can increase font size at system level. Your layout should not explode when text grows. Prefer flexible layouts, avoid fixed tiny heights for text-heavy widgets, and test with larger text.\n\nContrast and tap targets are practical basics. Text must be readable against its background. Important tappable controls should be large enough to hit comfortably, around 48 logical pixels.',
                whyItMatters: 'Accessibility is professional quality, not a bonus. It expands who can use your app and prevents embarrassing product failures.',
                steps: [
                  'Use Material buttons and controls where possible because they include semantics.',
                  'Add `Tooltip` or semantic labels to icon-only actions.',
                  'Avoid fixed heights around text that may scale.',
                  'Check color contrast for text over gradients and images.',
                  'Test with large font settings or `MediaQuery` text scaling.',
                ],
                code: layoutCode('AccessibleActions', `Center(
        child: Semantics(
          label: 'Add one masala dosa to cart',
          button: true,
          child: FilledButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.add_shopping_cart),
            label: const Text('Add dosa'),
          ),
        ),
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Icon with no meaning.** Screen readers cannot guess your custom icon intent. Add label/tooltip.',
                  '**Fixed tiny text boxes.** Larger text settings can clip. Let text breathe.',
                ],
                tryIt: 'Build an icon-only favorite button with `Tooltip` and `Semantics`. Increase system text size and inspect whether your nearby label still fits. Now extend it with a larger tap area.',
                takeaway: 'Accessible UI is simply UI that keeps its promise to more people.',
              }),
            ],
          },
          {
            id: 'm2-s4',
            title: 'Animations, Transitions, and Custom Paint',
            topics: [
              topic({
                id: 'm2-t22',
                title: 'Implicit Animations: AnimatedContainer, AnimatedOpacity, AnimatedAlign',
                explain: 'Animate property changes without manually managing animation controllers.',
                analogy: 'At MTR, the menu board reveal is smooth: first breakfast, then lunch, then snacks. Nobody sees the staff yanking boards violently. Implicit animations are like that: change the value, Flutter handles the in-between motion.',
                theory: 'Implicit animation widgets animate when their input properties change. `AnimatedContainer` animates size, color, padding, margin, and decoration. `AnimatedOpacity` fades visibility. `AnimatedAlign` moves a child between alignment positions.\n\nThey are best for simple state-driven transitions: selected cards, expanded panels, toggles, highlights, and gentle layout changes. You provide `duration`, optional `curve`, and the target values. Flutter creates and manages the animation internally.\n\nUse implicit animations first. Reach for explicit controllers only when you need timeline control, repeating motion, choreography, or multiple staggered pieces.',
                whyItMatters: 'Good micro-interactions make apps feel alive. Implicit animations give you polish with low code and low risk.',
                steps: [
                  'Create a `StatefulWidget` with a boolean `selected`.',
                  'Use `AnimatedContainer` to change width, color, or padding based on `selected`.',
                  'Add `duration` and `curve`.',
                  'Toggle state on tap.',
                  'Keep motion short, usually 150-350 ms for UI feedback.',
                ],
                code: `import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: ImplicitMenuScreen()));

class ImplicitMenuScreen extends StatefulWidget {
  const ImplicitMenuScreen({super.key});

  @override
  State<ImplicitMenuScreen> createState() => _ImplicitMenuScreenState();
}

class _ImplicitMenuScreenState extends State<ImplicitMenuScreen> {
  bool selected = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Implicit Animation')),
      body: Center(
        child: GestureDetector(
          onTap: () => setState(() => selected = !selected),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
            width: selected ? 280 : 180,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: selected ? Colors.deepPurple : Colors.deepPurple.shade100,
              borderRadius: BorderRadius.circular(selected ? 28 : 12),
            ),
            child: Text(
              selected ? 'Full meals selected' : 'Tap menu',
              style: TextStyle(color: selected ? Colors.white : Colors.black),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Animating everything.** Motion should explain change, not distract from it.',
                  '**Long durations.** A 2-second button animation feels broken. Keep feedback quick.',
                ],
                tryIt: 'Create a tappable `AnimatedContainer` that changes from "Mini meals" to "Full meals". Now extend it by also animating opacity of a price label.',
                takeaway: 'Implicit animation means: change the target value, Flutter handles the journey.',
              }),
              topic({
                id: 'm2-t23',
                title: 'Explicit Animations: AnimationController, Tween, CurvedAnimation',
                explain: 'Control animation timing directly for repeat, reverse, and coordinated motion.',
                analogy: 'A Mysuru Dasara procession follows a timetable: drum beat, elephant step, torch wave, palace lights. That is not a casual value change; someone controls the rhythm. `AnimationController` is the procession master for motion that needs timing control.',
                theory: 'Explicit animations use an `AnimationController` to produce values over time. A `Tween` maps the controller value from 0-1 into useful ranges like 0-200 pixels, 0-1 opacity, or small-to-large scale. `CurvedAnimation` changes the feel of progress.\n\nA `StatefulWidget` that owns a controller must mix in `SingleTickerProviderStateMixin` or similar. The controller needs a `vsync` provider and must be disposed. Forgetting `dispose` is one of the classic beginner mistakes.\n\nUse explicit animations for repeatable loaders, hero-like choreography, staggered sequences, custom transitions, and animation that must start/stop/reverse programmatically.',
                whyItMatters: 'Advanced UI roles require animation control. Knowing controllers makes you comfortable with Flutter’s animation system instead of limited to prebuilt effects.',
                steps: [
                  'Create a `StatefulWidget` with `SingleTickerProviderStateMixin`.',
                  'Initialize `AnimationController` in `initState`.',
                  'Create a `Tween<double>` and animate it with a curve.',
                  'Use `AnimatedBuilder` to rebuild only the animated part.',
                  'Dispose the controller in `dispose`.',
                ],
                code: `import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: ControlledPulseScreen()));

class ControlledPulseScreen extends StatefulWidget {
  const ControlledPulseScreen({super.key});

  @override
  State<ControlledPulseScreen> createState() => _ControlledPulseScreenState();
}

class _ControlledPulseScreenState extends State<ControlledPulseScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController controller;
  late final Animation<double> scale;

  @override
  void initState() {
    super.initState();
    controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 800))
      ..repeat(reverse: true);
    scale = Tween<double>(begin: .9, end: 1.15).animate(
      CurvedAnimation(parent: controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Controlled Pulse')),
      body: Center(
        child: AnimatedBuilder(
          animation: scale,
          builder: (_, child) => Transform.scale(scale: scale.value, child: child),
          child: const Icon(Icons.favorite, size: 96, color: Colors.pink),
        ),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Controller not disposed.** Always dispose animation controllers.',
                  '**Rebuilding whole screen.** Use `AnimatedBuilder` around only the animated widget.',
                ],
                tryIt: 'Build a pulsing favorite icon using `AnimationController`. Now extend it with a Start/Stop button that calls `controller.repeat` and `controller.stop`.',
                takeaway: 'Explicit animation gives you the steering wheel, so remember to park it with `dispose`.',
              }),
              topic({
                id: 'm2-t24',
                title: 'AnimatedBuilder, TweenAnimationBuilder, and Staggered Motion',
                explain: 'Build efficient animated widgets and simple staggered effects without rebuilding the whole screen.',
                analogy: 'In Yakshagana, one actor enters, then the drum rises, then the second actor turns. Everything is not simultaneous; the drama has stagger. Flutter staggered animation is the same: card slides, text fades, button appears, each with timing.',
                theory: '`AnimatedBuilder` listens to an animation and rebuilds the widget returned by its builder. Its `child` parameter lets you keep static parts from rebuilding. This is important for performance and clarity.\n\n`TweenAnimationBuilder` is a friendly middle ground. You give it a tween, duration, and builder, and it animates when the tween target changes. It is great for progress bars, counters, and one-off value transitions.\n\nStaggered motion can be built by applying `Interval`s to one controller. Each widget reads a different slice of the same timeline. This creates sequencing without managing five controllers.',
                whyItMatters: 'Polished onboarding, feed entrances, and empty states often need staggered animation. Efficient builders keep that polish smooth.',
                steps: [
                  'Use `TweenAnimationBuilder` for a simple progress value.',
                  'Use `AnimatedBuilder` when you already have a controller.',
                  'Pass static content through the `child` argument.',
                  'For staggered motion, create multiple curved animations with `Interval`.',
                  'Keep stagger subtle; the user came for content, not a school annual day.',
                ],
                code: layoutCode('TweenProgress', `Center(
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: .72),
          duration: const Duration(milliseconds: 900),
          curve: Curves.easeOutCubic,
          builder: (context, value, child) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 180,
                  child: LinearProgressIndicator(value: value),
                ),
                const SizedBox(height: 12),
                Text('Breakfast queue \${(value * 100).round()}% done'),
              ],
            );
          },
        ),
      )`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Animating static child repeatedly.** Use the `child` parameter to avoid rebuilding expensive static content.',
                  '**Too much stagger.** If every label dances, the screen becomes tiring. Animate entry, then settle.',
                ],
                tryIt: 'Build a `QueueProgress` bar with `TweenAnimationBuilder` from 0 to 100%. Now extend it with three text rows that appear one after another using staggered intervals.',
                takeaway: 'Animated builders are for efficient motion; stagger is timing with manners.',
              }),
              topic({
                id: 'm2-t25',
                title: 'Hero Animations and Page Transitions',
                explain: 'Animate shared elements between screens and customize route transitions.',
                analogy: 'A Bengaluru Metro passenger taps their card at Indiranagar and appears at MG Road after a smooth journey. The person is the same; only the station changes. `Hero` is that passenger: the same visual element travels from one route to another instead of disappearing and reappearing.',
                theory: '`Hero` animates a widget shared between two routes. Both source and destination widgets must have the same `tag`. Flutter lifts the hero into an overlay during navigation and animates its size and position.\n\nUse heroes for profile photos, product images, story thumbnails, and cards that expand into detail pages. Keep the hero child visually compatible across both routes. Huge differences can look strange.\n\nCustom page transitions use `PageRouteBuilder` or routing libraries. You can fade, slide, scale, or combine transitions. Use them carefully; platform-default transitions are often best unless the product has a clear reason.',
                whyItMatters: 'Shared-element transitions help users understand navigation. They feel like "this card became that detail page" instead of "a random new screen appeared."',
                steps: [
                  'Wrap a thumbnail on the first screen with `Hero(tag: ...)`.',
                  'Wrap the matching large widget on the detail screen with the same tag.',
                  'Navigate with `Navigator.push`.',
                  'Keep tags unique per item.',
                  'Add a custom route transition only when the default is not enough.',
                ],
                code: `import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: HeroListScreen()));

class HeroListScreen extends StatelessWidget {
  const HeroListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hero Menu')),
      body: Center(
        child: GestureDetector(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const HeroDetailScreen()),
          ),
          child: Hero(
            tag: 'dosa-photo',
            child: CircleAvatar(
              radius: 56,
              backgroundColor: Colors.deepPurple.shade200,
              child: const Icon(Icons.restaurant, size: 56),
            ),
          ),
        ),
      ),
    );
  }
}

class HeroDetailScreen extends StatelessWidget {
  const HeroDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dosa Details')),
      body: Center(
        child: Hero(
          tag: 'dosa-photo',
          child: CircleAvatar(
            radius: 130,
            backgroundColor: Colors.deepPurple.shade200,
            child: const Icon(Icons.restaurant, size: 120),
          ),
        ),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Duplicate hero tags.** Tags must uniquely identify the item in a route.',
                  '**Unrelated hero shapes.** Source and destination should feel like the same object.',
                ],
                tryIt: 'Create a list of three food avatars. Tap one to open a detail screen with a matching `Hero`. Now extend it by giving each item a unique tag based on its name.',
                takeaway: 'A `Hero` makes one visual object travel between screens.',
              }),
              topic({
                id: 'm2-t26',
                title: 'CustomPaint and Canvas Basics',
                explain: 'Draw custom shapes when widgets are not enough, using `CustomPainter` and canvas commands.',
                analogy: 'A rangoli outside a Udupi house is not assembled from square tiles; someone draws it directly. `CustomPaint` is Flutter’s rangoli floor. You use the canvas to draw lines, circles, arcs, and paths exactly where you want.',
                theory: '`CustomPaint` delegates drawing to a `CustomPainter`. The painter receives a `Canvas` and a `Size`. You create `Paint` objects for color, stroke, fill, and style, then call methods like `drawCircle`, `drawRect`, `drawLine`, or `drawPath`.\n\nCustom painting is useful for charts, decorative backgrounds, progress rings, audio waves, maps, and brand-specific shapes. Do not custom-paint normal buttons and text unless you need to; widgets give accessibility and interaction for free.\n\n`shouldRepaint` tells Flutter whether the painter needs repainting when a new painter is provided. Return true when visual inputs change. Return false for static drawings.',
                whyItMatters: 'Sooner or later a designer asks for something no standard widget gives you: a custom progress curve, a ticket stub, a wave, a chart. Canvas basics unlock that work.',
                steps: [
                  'Create a `CustomPainter` class.',
                  'Use `CustomPaint(size: ..., painter: ...)` in your widget tree.',
                  'Read `size.width` and `size.height` instead of hardcoding canvas dimensions.',
                  'Draw one filled circle and one stroked line.',
                  'Return `false` from `shouldRepaint` for static output.',
                ],
                code: `import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: RangoliPaintScreen()));

class RangoliPaintScreen extends StatelessWidget {
  const RangoliPaintScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Custom Paint')),
      body: Center(
        child: CustomPaint(
          size: const Size(260, 260),
          painter: RangoliPainter(),
        ),
      ),
    );
  }
}

class RangoliPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final fill = Paint()..color = Colors.deepPurple.shade100;
    final stroke = Paint()
      ..color = Colors.deepPurple
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;

    canvas.drawCircle(center, 90, fill);
    canvas.drawCircle(center, 90, stroke);
    canvas.drawLine(Offset(center.dx - 90, center.dy), Offset(center.dx + 90, center.dy), stroke);
    canvas.drawLine(Offset(center.dx, center.dy - 90), Offset(center.dx, center.dy + 90), stroke);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Hardcoded canvas math.** Use `size`, or your drawing breaks in different boxes.',
                  '**Painting interactive controls.** If it needs taps, focus, semantics, or text selection, prefer widgets.',
                ],
                tryIt: 'Draw a simple circular "coffee strength" meter with `CustomPaint`. Now extend it by adding a second arc in another color.',
                takeaway: 'Use widgets for interface; use canvas when you truly need drawing.',
              }),
              topic({
                id: 'm2-t27',
                title: 'GestureDetector, Draggable, Dismissible, and Interactive Cards',
                explain: 'Respond to taps, long presses, swipes, drags, and dismiss gestures in layout-friendly ways.',
                analogy: 'At a Kundapura parcel counter, you can tap the bell, drag a token from pending to packed, or slide a cancelled order aside. Different gestures mean different actions. Flutter gives you gesture widgets so the UI can understand the user’s hands.',
                theory: '`GestureDetector` recognizes low-level gestures like tap, double tap, long press, pan, and drag updates. `InkWell` is better for Material tap surfaces because it includes ripple feedback. `Dismissible` gives standard swipe-to-remove behavior for list rows.\n\n`Draggable` and `DragTarget` let users drag data from one place to another. They are useful for kanban boards, reorder-like interactions, educational games, and custom builders.\n\nBe careful with gesture conflicts. A horizontal swipe inside a vertical list is common and okay. A drag, tap, and scroll all fighting on the same tiny card becomes frustrating.',
                whyItMatters: 'Interactive UI is not only buttons. Real mobile apps use swipe actions, drag interactions, long press menus, and card gestures to speed up workflows.',
                steps: [
                  'Use `InkWell` for simple Material card taps.',
                  'Use `GestureDetector` for custom gestures like long press or pan.',
                  'Wrap list rows in `Dismissible` for swipe-to-remove.',
                  'Give `Dismissible` a stable key.',
                  'Show a confirmation or undo for destructive actions.',
                ],
                code: `import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: DismissOrdersScreen()));

class DismissOrdersScreen extends StatefulWidget {
  const DismissOrdersScreen({super.key});

  @override
  State<DismissOrdersScreen> createState() => _DismissOrdersScreenState();
}

class _DismissOrdersScreenState extends State<DismissOrdersScreen> {
  final orders = List.generate(8, (i) => 'Parcel order \${i + 1}');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Swipe Orders')),
      body: ListView.builder(
        itemCount: orders.length,
        itemBuilder: (_, index) {
          final order = orders[index];
          return Dismissible(
            key: ValueKey(order),
            background: Container(color: Colors.green, alignment: Alignment.centerLeft, child: const Icon(Icons.check)),
            onDismissed: (_) => setState(() => orders.removeAt(index)),
            child: ListTile(title: Text(order), subtitle: const Text('Swipe when packed')),
          );
        },
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Dismissible without stable key.** Use item ids or names, not unstable positions.',
                  '**No undo for destructive swipe.** Users swipe accidentally. Offer undo for real deletion.',
                ],
                tryIt: 'Build a swipe-to-pack order list with `Dismissible`. Now extend it so dismissing shows a `SnackBar` with Undo.',
                takeaway: 'Gestures should make common actions faster, not make users nervous.',
              }),
              topic({
                id: 'm2-t28',
                title: 'Layout Debugging Toolkit: Flutter Inspector, Debug Paint, and DevTools',
                explain: 'Use Flutter’s visual debugging tools to inspect widget trees, constraints, repaint areas, and layout problems.',
                analogy: 'When a dosa tears on the tava, an experienced cook checks batter thickness, heat, oil, and timing. They do not blame "bad dosa vibes." Flutter debugging is the same. Inspector, debug paint, and DevTools show the real reason your layout tore.',
                theory: 'Flutter Inspector lets you select widgets on screen, inspect their properties, and understand the widget tree. It is the fastest way to find where padding, alignment, constraints, or unexpected parent widgets come from.\n\nDebug paint options draw visual outlines around layouts, baselines, repaint regions, and tap targets. They look messy, but they reveal truth. DevTools adds performance views, frame charts, memory, logging, and more.\n\nThe debugging habit is simple: reproduce the issue, inspect the specific widget, read its parent constraints, then make the smallest layout change. Random wrapping is not debugging; it is bargaining.',
                whyItMatters: 'Professional developers do not merely know widgets; they know how to diagnose them. Debugging tools make you faster and more confident when UI behaves strangely.',
                steps: [
                  'Run the app in debug mode from VS Code or Android Studio.',
                  'Open Flutter Inspector and select the problem widget.',
                  'Check size, padding, parent, and constraints.',
                  'Toggle debug paint to see layout bounds.',
                  'Use DevTools performance view if animations feel janky.',
                ],
                code: `// main.dart
// Debug paint is usually enabled from Flutter Inspector.
// You can also toggle some visual debugging flags while learning:

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

void main() {
  debugPaintSizeEnabled = true; // Shows layout boxes. Turn off for normal work.
  runApp(const MaterialApp(home: DebugPaintDemo()));
}

class DebugPaintDemo extends StatelessWidget {
  const DebugPaintDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Debug Paint Demo')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Row(
          children: const [
            Icon(Icons.bug_report),
            SizedBox(width: 12),
            Expanded(child: Text('Inspect me instead of guessing.')),
          ],
        ),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Leaving debug paint on.** It is for debugging only. Turn it off before sharing screenshots.',
                  '**Guessing instead of inspecting.** The inspector can show the exact parent and size. Use it.',
                ],
                tryIt: 'Turn on Flutter Inspector for any Module 2 demo screen. Select a card, read its padding and size, then change exactly one property and observe the result. Now extend it by enabling debug paint briefly.',
                takeaway: 'When layout behaves oddly, inspect first and guess last.',
              }),
            ],
          },
        ]
      })(),
      projects: [
        {
          id: 'm2-p1',
          type: 'Mini Project',
          title: 'Udupi Restaurant Responsive Menu',
          domain: 'Mobile UI',
          duration: '3 hours',
          description:
            'Build a responsive restaurant menu with filter chips, tappable cards, image placeholders, and phone/tablet layouts. The same menu should feel natural on a small phone and a wide browser.',
          tools: ['Flutter', 'Dart', 'LayoutBuilder', 'GridView', 'Cards'],
          blueprint: {
            overview:
              'Create a polished menu screen for a Udupi restaurant with categories, responsive grid/list behavior, and clear tap feedback.',
            functionalRequirements: [
              '**Categories.** Show filter chips for meals, dosa, coffee, sweets, and parcels.',
              '**Cards.** Show menu item cards with name, area, price in ₹, rating, and vegetarian marker.',
              '**Responsive.** Use one-column list on narrow phones and grid cards on wider screens.',
              '**Feedback.** Tapping a card shows a `SnackBar` with the selected item.',
              '**Empty state.** If a filter has no items, show a friendly empty message.',
              '**Accessibility.** Ensure card text is readable and tap areas are comfortable.',
            ],
            technicalImplementation: [
              '**Layout.** Use `LayoutBuilder` to choose list or grid based on width.',
              '**Data.** Store menu items as simple Dart objects or maps.',
              '**Filtering.** Keep selected category in local `setState` for now.',
              '**UI polish.** Use `Card`, `InkWell`, `Chip`, `AspectRatio`, and theme colors.',
              '**Responsiveness.** Use `SliverGridDelegateWithMaxCrossAxisExtent` for wide layouts.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Scaffold',
                outcome: 'Flutter project and first menu screen',
                prompt:
                  'Create a Flutter app called udupi_menu_layout with a Material 3 theme and a MenuScreen showing a title, category chips, and placeholder menu data.',
              },
              {
                step: 2,
                label: 'Cards',
                outcome: 'Reusable menu card widget',
                prompt:
                  'Extract a reusable MenuItemCard widget with name, area, price, rating, category, and tap feedback using Card and InkWell.',
              },
              {
                step: 3,
                label: 'Responsive',
                outcome: 'Phone list and wide grid behavior',
                prompt:
                  'Use LayoutBuilder to render menu items as a vertical list under 700 px and a responsive GridView above 700 px.',
              },
              {
                step: 4,
                label: 'Empty',
                outcome: 'Friendly empty state and polish',
                prompt:
                  'Add filter logic, empty state copy, consistent spacing, and accessible tap targets for all menu cards.',
              },
              {
                step: 5,
                label: 'Review',
                outcome: 'Clean final UI',
                prompt:
                  'Review the code for repeated widget trees, extract small widgets where useful, and ensure the app runs without layout overflow.',
              },
            ],
            deliverable:
              'A responsive Udupi restaurant menu screen that adapts from phone list to wide grid.',
          },
        },
        {
          id: 'm2-p2',
          type: 'Mini Project',
          title: 'Bengaluru Metro Sliver Guide',
          domain: 'Scrolling UI',
          duration: '3 hours',
          description:
            'Build a sliver-based route guide with a collapsing header, pinned tabs, station list, and refreshable service updates. It teaches scrolling structure without needing a backend.',
          tools: ['Flutter', 'Dart', 'CustomScrollView', 'SliverAppBar', 'TabBarView'],
          blueprint: {
            overview:
              'Create a Bengaluru Metro guide that uses slivers and coordinated scrolling to show routes, stations, and alerts.',
            functionalRequirements: [
              '**Header.** Use a collapsing `SliverAppBar` with route name and color.',
              '**Tabs.** Provide Stations, Alerts, and Fare tabs.',
              '**Lists.** Render station rows with icons, distance, and interchange markers.',
              '**Refresh.** Add pull-to-refresh to the alerts list with mock updates.',
              '**Responsive.** Keep content width comfortable on desktop.',
              '**Debuggability.** Avoid nested scroll overflow and document why slivers are used.',
            ],
            technicalImplementation: [
              '**Scroll shell.** Use `DefaultTabController` plus `NestedScrollView`.',
              '**Header.** Use `SliverAppBar` with `FlexibleSpaceBar` and pinned behavior.',
              '**Tab content.** Use `ListView.builder` inside each `TabBarView` page.',
              '**Data.** Keep mock station and alert data in lists.',
              '**Polish.** Add chips for interchange and active service status.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Shell',
                outcome: 'Nested scroll with tabs',
                prompt:
                  'Create a Flutter app called metro_sliver_guide using DefaultTabController, NestedScrollView, SliverAppBar, TabBar, and three TabBarView pages.',
              },
              {
                step: 2,
                label: 'Stations',
                outcome: 'Station list tab',
                prompt:
                  'Implement the Stations tab with ListView.builder, station names, distance in km, and interchange chips.',
              },
              {
                step: 3,
                label: 'Alerts',
                outcome: 'Refreshable alerts tab',
                prompt:
                  'Implement the Alerts tab with RefreshIndicator and mock service messages that change order on refresh.',
              },
              {
                step: 4,
                label: 'Fare',
                outcome: 'Fare cards and layout polish',
                prompt:
                  'Implement the Fare tab with responsive cards showing sample route fares in rupees and a clear empty/loading style.',
              },
              {
                step: 5,
                label: 'Harden',
                outcome: 'No overflow, clean scrolling',
                prompt:
                  'Inspect the app for nested scroll issues, test narrow and wide widths, and extract repeated row/card widgets.',
              },
            ],
            deliverable:
              'A sliver-driven Bengaluru Metro guide with collapsing header, tabs, lists, and refresh behavior.',
          },
        },
        {
          id: 'm2-p3',
          type: 'Capstone',
          title: 'Instagram Clone: Stories, Post Cards, Profile Grid, and Like Animation',
          domain: 'Mobile UI',
          duration: '1 day',
          description:
            'Extend the Instagram-style app from Module 1 with richer UI: horizontal stories, polished feed cards, profile grid, hero navigation, and a double-tap like animation.',
          tools: ['Flutter', 'Dart', 'ListView', 'GridView', 'Hero', 'Animations'],
          blueprint: {
            overview:
              'Build the UI layer of an Instagram-style experience using Module 2 layout, scrolling, grid, gesture, and animation skills.',
            functionalRequirements: [
              '**Stories.** Add a horizontal stories carousel with circular avatars and names.',
              '**Feed cards.** Build reusable post cards with image frame, caption, actions, and like count.',
              '**Double tap.** Double-tapping a post triggers a heart animation.',
              '**Profile.** Add a profile screen with stats, bio, and responsive `GridView` photo layout.',
              '**Hero.** Tapping a profile photo or post image uses a `Hero` transition to a detail screen.',
              '**Polish.** Use theme tokens, accessible labels, and no layout overflow.',
            ],
            technicalImplementation: [
              '**Composition.** Extract `StoryBubble`, `PostCard`, `ProfileHeader`, and `PhotoGridTile` widgets.',
              '**Scrolling.** Use vertical `ListView` for feed and horizontal `ListView` for stories.',
              '**Grid.** Use `GridView.builder` or slivers for profile photos.',
              '**Animation.** Use implicit animation or `AnimationController` for the like heart.',
              '**Navigation.** Use `Navigator.push` plus `Hero` tags for detail transitions.',
              '**State.** Keep simple local state now; Module 3 will move it to Provider/Riverpod.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Stories',
                outcome: 'Horizontal story carousel',
                prompt:
                  'Extend the existing Instagram clone with a horizontal stories carousel using a reusable StoryBubble widget and local mock users from Udupi, Kundapura, and Bengaluru.',
              },
              {
                step: 2,
                label: 'Feed',
                outcome: 'Polished post cards',
                prompt:
                  'Create a reusable PostCard widget with image area, action row, caption, like count, and accessible tap targets.',
              },
              {
                step: 3,
                label: 'Animation',
                outcome: 'Double-tap heart animation',
                prompt:
                  'Add double-tap like behavior to PostCard using GestureDetector and an animated heart overlay that fades and scales.',
              },
              {
                step: 4,
                label: 'Profile',
                outcome: 'Profile grid screen',
                prompt:
                  'Build a ProfileScreen with profile header, stats, bio, and a responsive GridView photo grid using placeholder assets or colored tiles.',
              },
              {
                step: 5,
                label: 'Hero',
                outcome: 'Shared-element navigation',
                prompt:
                  'Add Hero transitions from post images and profile grid tiles to a detail screen with matching tags.',
              },
              {
                step: 6,
                label: 'Review',
                outcome: 'Module 2 quality pass',
                prompt:
                  'Run the app on narrow and wide widths, fix overflow, extract repeated widgets, and ensure all animations remain smooth.',
              },
            ],
            deliverable:
              'An Instagram-style UI prototype with stories, animated likes, feed cards, profile grid, and hero transitions.',
          },
        },
      ],
      quiz: [
        {
          id: 'm2-q1',
          q: 'In Flutter layout, what happens first?',
          options: [
            'Children choose any size they want',
            'Parents send constraints down to children',
            'The screen paints before measuring',
            'Animations decide widget positions',
          ],
          answer: 1,
        },
        {
          id: 'm2-q2',
          q: 'Which widget is best for a long feed of similar rows?',
          options: ['Column inside SingleChildScrollView', 'ListView.builder', 'Stack', 'IntrinsicHeight'],
          answer: 1,
        },
        {
          id: 'm2-q3',
          q: 'What is `Stack` mainly used for?',
          options: [
            'Laying children in a single horizontal line',
            'Creating layered or overlapping UI',
            'Fetching network data',
            'Managing app-wide state',
          ],
          answer: 1,
        },
        {
          id: 'm2-q4',
          q: 'When should you prefer implicit animations like `AnimatedContainer`?',
          options: [
            'For simple property changes driven by state',
            'Only for network loading',
            'Only when drawing with Canvas',
            'When you need manual frame-by-frame control',
          ],
          answer: 0,
        },
        {
          id: 'm2-q5',
          q: 'Why use `LayoutBuilder`?',
          options: [
            'To read the exact constraints available to a widget',
            'To store user login state',
            'To compile Dart faster',
            'To replace every `MediaQuery` automatically',
          ],
          answer: 0,
        },
      ],
    },
    {
      id: 'm3',
      title: 'State Management',
      hours: 14,
      color: 'from-orange-500/20 to-orange-700/10',
      accent: 'orange',
      description:
        'setState, Provider, Riverpod, Bloc, GetX, immutability, freezed, redux patterns.',
      sections: (() => {
        const commonPitfalls = [
          '**Changing data but not notifying UI.** The value changed, but the screen does not know. Call `setState`, `notifyListeners`, emit a Bloc state, or update the provider state.',
          '**Keeping state too high.** If one small button changes, do not rebuild the whole app like closing all Udupi shops because one tea glass broke.',
          '**Keeping state too low.** If five screens need cart data, do not hide it inside one tiny widget. Lift or provide it.',
          '**Mutating lists silently.** Changing a list in place can confuse rebuild logic. Prefer creating a new list when using immutable state.',
          '**Mixing business logic into build.** `build` should describe UI. Put decisions in controllers, not in a 200-line widget method.',
          '**Choosing a package before understanding the problem.** State management is not a fashion parade. First ask who owns the data and who needs to react.',
        ]

        const stateCode = (className, body) => `import 'package:flutter/material.dart';

void main() => runApp(const ${className}App());

class ${className}App extends StatelessWidget {
  const ${className}App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.orange),
      home: const ${className}Screen(),
    );
  }
}

class ${className}Screen extends StatefulWidget {
  const ${className}Screen({super.key});

  @override
  State<${className}Screen> createState() => _${className}ScreenState();
}

class _${className}ScreenState extends State<${className}Screen> {
${body}
}`

        const topic = (data) => data

        return [
          {
            id: 'm3-s1',
            title: 'State Fundamentals and setState',
            topics: [
              topic({
                id: 'm3-t1',
                title: 'What Is State? Ephemeral vs App State',
                explain: 'Understand what state means in Flutter and separate short-lived screen state from shared app-wide state.',
                analogy: 'Imagine Namma Metro smart card balance. The card balance follows you from Indiranagar to Majestic; that is app state. But the gate flap opening for two seconds is temporary; that is ephemeral state. In Flutter, a text field focus, selected tab, or animation progress may live briefly inside one screen, while cart items, login user, theme, and feed likes may need to travel across the app.',
                theory: 'State is any information that can change while the app is running. If the UI can look different tomorrow, after a tap, after login, after a network call, or after rotating the phone, some state is involved.\n\n**Ephemeral state** belongs to one widget or one small screen moment: selected chip, current page index, expanded card, text field visibility, animation progress. **App state** is shared or long-lived: logged-in user, cart, permissions, cached feed, theme mode, language, and payment status.\n\nThe spoon-feed question is: who needs this value? If only this widget needs it, keep it local. If siblings need it, lift it to their parent. If many screens need it, use a state management tool such as Provider, Riverpod, Bloc, or another pattern.',
                whyItMatters: 'Many Flutter bugs come from putting state in the wrong place. Once you can classify state, choosing the tool becomes much easier and interviews become less scary.',
                steps: [
                  'List every value that can change on your screen.',
                  'Mark values used only by one widget as **ephemeral**.',
                  'Mark values used by multiple screens as **app state**.',
                  'Keep tiny UI toggles local with `setState`.',
                  'Move shared values into a controller or provider.',
                  'Before adding a package, explain who owns the state and who reads it.',
                ],
                code: stateCode('StateMeaning', `  bool showParcelNote = false;
  int cartCount = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('State Meaning')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Cart count: \$cartCount'),
            SwitchListTile(
              title: const Text('Show Kundapura parcel note'),
              value: showParcelNote,
              onChanged: (value) => setState(() => showParcelNote = value),
            ),
            if (showParcelNote)
              const Card(child: Padding(
                padding: EdgeInsets.all(16),
                child: Text('Pack kori rotti separately or it becomes soft.'),
              )),
            FilledButton(
              onPressed: () => setState(() => cartCount++),
              child: const Text('Add one item'),
            ),
          ],
        ),
      ),
    );
  }`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Calling everything global.** Not every changing value deserves app-wide storage. Keep small screen state small.',
                  '**Forgetting ownership.** If you cannot name the owner, the state will wander around the app like a lost parcel.',
                ],
                tryIt: 'Take your Module 2 menu screen and write down every changing value: selected filter, tapped card, cart count, theme, and loading flag. Sort them into ephemeral or app state. Now extend it to keep the selected filter local with `setState`.',
                takeaway: 'State is changing memory; put it as close as possible and as high as necessary.',
              }),
              topic({
                id: 'm3-t2',
                title: 'setState Lifecycle and Rebuild Boundaries',
                explain: 'Use `setState` correctly and understand which part of the widget tree rebuilds after a local state change.',
                analogy: 'Filter coffee has decoction and milk. If the customer asks for stronger coffee, the waiter adjusts that cup, not the whole hotel kitchen. `setState` should be like that: update the small screen area that owns the change, not the entire app for one spoon of sugar.',
                theory: '`setState` tells Flutter: this `State` object changed, please run its `build` method again. It does not repaint the whole universe. Flutter rebuilds the widget subtree below that stateful widget and then efficiently updates what actually changed.\n\nPut `setState` around the data mutation, not around expensive work. Do calculations first if needed, then call `setState` to assign final values. Never call `setState` after a widget is disposed; async callbacks must check `mounted` if they might finish later.\n\nUse `setState` for local UI state. If a count, toggle, selected chip, or simple form flag belongs only to one screen, `setState` is not a beginner tool; it is the correct tool.',
                whyItMatters: 'A developer who understands rebuild boundaries writes simpler code and avoids unnecessary Provider/Riverpod complexity for tiny UI changes.',
                steps: [
                  'Create a `StatefulWidget` for one screen.',
                  'Store local mutable values as fields in the `State` class.',
                  'Call `setState` only when those values change.',
                  'Keep heavy async work outside the `setState` callback.',
                  'Use `if (!mounted) return;` before `setState` after awaited work.',
                ],
                code: stateCode('SetStateCounter', `  int coffeeStrength = 1;

  void makeStronger() {
    setState(() {
      coffeeStrength++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Filter Coffee State')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Decoction spoons: \$coffeeStrength',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: makeStronger,
              child: const Text('Make it stronger'),
            ),
          ],
        ),
      ),
    );
  }`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Async setState after dispose.** After `await`, check `mounted` before updating UI.',
                  '**Huge stateful parent.** If one tiny badge changes, consider extracting that badge into its own stateful widget.',
                ],
                tryIt: 'Build a filter coffee strength counter with plus and minus buttons. Keep it in one `StatefulWidget`. Now extend it by disabling minus when strength is already 1.',
                takeaway: '`setState` is perfect for local screen memory when you respect its rebuild boundary.',
              }),
              topic({
                id: 'm3-t3',
                title: 'Lifting State Up and Passing Callbacks Down',
                explain: 'Share state between sibling widgets by moving ownership to their nearest common parent.',
                analogy: 'At a Udupi banana-leaf meal, the rice server and sambar server must coordinate. If the rice server alone decides second serving count, the sambar person gets confused. The supervisor watching both lines owns the count and tells each server what to do. That is lifting state up.',
                theory: 'When two sibling widgets need the same value, neither sibling should secretly own it. Move the value to their nearest common parent. The parent passes the value down as constructor data and passes callback functions down for children to request changes.\n\nThis pattern keeps data flow easy to read: state flows down, events flow up. The child does not mutate the parent directly. It says, "button tapped," and the parent decides how state changes.\n\nLifting state is the bridge between `setState` and bigger state tools. Many screens can stay clean with this pattern before you need Provider or Riverpod.',
                whyItMatters: 'Callback-based data flow is used everywhere in Flutter, even inside advanced architectures. If you skip this, Provider and Bloc feel like magic instead of organized ownership.',
                steps: [
                  'Create a parent `StatefulWidget` that owns the selected item.',
                  'Create a child display widget that receives the selected value.',
                  'Create a child button/list widget that receives an `onChanged` callback.',
                  'Inside the callback, parent calls `setState`.',
                  'Keep children stateless when they only display passed data.',
                ],
                code: stateCode('LiftedState', `  String selectedStop = 'Udupi';

  void chooseStop(String stop) {
    setState(() => selectedStop = stop);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lift State Up')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text('Selected stop: \$selectedStop',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              children: [
                for (final stop in ['Udupi', 'Kundapura', 'Bengaluru'])
                  ChoiceChip(
                    label: Text(stop),
                    selected: selectedStop == stop,
                    onSelected: (_) => chooseStop(stop),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Child mutates parent data directly.** Pass callbacks instead. Events go up, state comes down.',
                  '**Lifting too far.** Put state at the nearest common parent, not automatically at app root.',
                ],
                tryIt: 'Create a parent screen with selected hotel state. Child A shows the selected hotel, Child B shows chips to change it. Now extend it by adding a reset button in a third child.',
                takeaway: 'When siblings need the same value, lift ownership to their nearest shared parent.',
              }),
              topic({
                id: 'm3-t4',
                title: 'ValueNotifier and ValueListenableBuilder',
                explain: 'Use lightweight reactive state for one value without creating a full state management setup.',
                analogy: 'A Manipal Hospital token display changes one number at a time. The waiting room does not need a full committee meeting for every token. A `ValueNotifier` is that token display: one value changes, listeners update.',
                theory: '`ValueNotifier<T>` stores one value and notifies listeners when `value` is assigned. `ValueListenableBuilder` listens to it and rebuilds only the builder area. This is useful for focused state such as selected tab, counter, text preview, small settings, or a simple cart count.\n\nIt is lighter than `ChangeNotifier` because it usually represents one value. It is more reactive than plain `setState` because multiple widgets can listen to the same notifier if you pass it around.\n\nDispose notifiers you own. If you create it inside a `State` class, call `dispose`. If it is global or provided elsewhere, its owner should dispose it.',
                whyItMatters: 'ValueNotifier is a clean middle step. It teaches reactive thinking before Provider, Riverpod, and Bloc enter the stage.',
                steps: [
                  'Create a `ValueNotifier<int>` inside a `State` class.',
                  'Wrap only the changing text with `ValueListenableBuilder`.',
                  'Update the value by assigning `notifier.value = ...`.',
                  'Dispose the notifier in `dispose`.',
                  'Use this for small single-value state, not complex business logic.',
                ],
                code: stateCode('TokenNotifier', `  final token = ValueNotifier<int>(42);

  @override
  void dispose() {
    token.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hospital Token')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ValueListenableBuilder<int>(
              valueListenable: token,
              builder: (_, value, __) => Text('Now serving token \$value',
                  style: Theme.of(context).textTheme.headlineSmall),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => token.value++,
              child: const Text('Next token'),
            ),
          ],
        ),
      ),
    );
  }`),
                pitfalls: [
                  ...commonPitfalls,
                  '**Forgetting dispose.** A notifier owned by a widget should be disposed with the widget.',
                  '**Using it for huge app state.** If many related values and rules exist, use a controller or state management package.',
                ],
                tryIt: 'Create a `ValueNotifier<String>` for the currently selected snack. Display it with `ValueListenableBuilder`. Now extend it with three buttons: Dosa, Idli, Coffee.',
                takeaway: '`ValueNotifier` is a small loudspeaker for one changing value.',
              }),
              topic({
                id: 'm3-t5',
                title: 'InheritedWidget and BuildContext Dependency Lookup',
                explain: 'Learn the core Flutter mechanism that lets descendants read shared values from ancestors.',
                analogy: 'Pejawar Matha prasada distribution has a central vessel. Volunteers near different doors do not cook separately; they receive from the same source. `InheritedWidget` is that central vessel in the widget tree. Descendants look upward using `BuildContext` and receive the shared value.',
                theory: '`InheritedWidget` is Flutter’s built-in way for data to flow down the widget tree and notify interested descendants. Provider is built on this idea. `Theme.of(context)`, `MediaQuery.of(context)`, and many Flutter APIs use inherited lookup.\n\nA descendant calls a static `of(context)` method to find the nearest ancestor of that type. When the inherited widget updates and `updateShouldNotify` returns true, dependent widgets rebuild.\n\nYou do not hand-write `InheritedWidget` often in everyday apps, but understanding it removes the mystery from Provider, Riverpod, Theme, Navigator, and localization.',
                whyItMatters: 'State management packages are easier when you know the engine underneath. `BuildContext` is not magic; it is the address used to search ancestors.',
                steps: [
                  'Create an `InheritedWidget` that stores one shared value.',
                  'Add a static `of(BuildContext context)` helper.',
                  'Wrap a subtree with the inherited widget.',
                  'Read the value from a deep child using `of(context)`.',
                  'Use Provider later instead of hand-writing this in most apps.',
                ],
                code: `import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: InheritedPrasadaScreen()));

class PrasadaScope extends InheritedWidget {
  const PrasadaScope({super.key, required this.count, required super.child});
  final int count;

  static PrasadaScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<PrasadaScope>();
    assert(scope != null, 'No PrasadaScope found');
    return scope!;
  }

  @override
  bool updateShouldNotify(PrasadaScope oldWidget) => oldWidget.count != count;
}

class InheritedPrasadaScreen extends StatelessWidget {
  const InheritedPrasadaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PrasadaScope(count: 108, child: DeepVolunteer());
  }
}

class DeepVolunteer extends StatelessWidget {
  const DeepVolunteer({super.key});

  @override
  Widget build(BuildContext context) {
    final count = PrasadaScope.of(context).count;
    return Scaffold(
      appBar: AppBar(title: const Text('InheritedWidget')),
      body: Center(child: Text('Prasada packets available: \$count')),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Using wrong context.** The context must be below the provider/scope in the tree.',
                  '**Manual InheritedWidget everywhere.** Learn it, then usually use Provider/Riverpod for nicer APIs.',
                ],
                tryIt: 'Create a `HotelScope` with today special as a shared value. Read it from a deep child widget. Now extend it by changing the value in a parent and watching the child rebuild.',
                takeaway: '`InheritedWidget` is ancestor data lookup with rebuild notification.',
              }),
              topic({
                id: 'm3-t6',
                title: 'Choosing Local, Shared, and Persistent State',
                explain: 'Decide whether data belongs in a widget, a state manager, or persistent storage.',
                analogy: 'At a Kundapura fish co-op, today’s token queue is local, member records are shared office data, and yearly accounts are stored permanently. You would not write today’s temporary queue into the annual ledger. Flutter state also has levels: local, shared, and persistent.',
                theory: 'Local state lives only while a widget or screen is alive. Shared state is available to multiple widgets or screens while the app runs. Persistent state survives app restarts by writing to storage, which Module 4 covers in depth.\n\nDo not confuse state management with storage. Provider or Riverpod can hold the logged-in user during the session, but if you need it after app restart, you also need persistence such as SharedPreferences, Hive, SQLite, secure storage, or backend refresh.\n\nThe decision flow is simple: Does one widget need it? local. Do many widgets need it now? shared. Must it survive restart? persistent too.',
                whyItMatters: 'This prevents two opposite mistakes: saving temporary UI toggles to storage, or losing important user data because it lived only in one screen.',
                steps: [
                  'Write each changing value on paper.',
                  'Mark who reads it: one widget, one screen, many screens, or future app sessions.',
                  'Use `setState` for local values.',
                  'Use Provider/Riverpod/Bloc for shared runtime values.',
                  'Add storage only when data must survive app restart.',
                ],
                code: stateCode('StateDecision', `  bool showOffer = true; // local UI state
  int cartCount = 2; // shared in real apps

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('State Decision')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SwitchListTile(
              title: const Text('Show today offer'),
              value: showOffer,
              onChanged: (value) => setState(() => showOffer = value),
            ),
            Text('Cart count: \$cartCount'),
            const Text('If cart is needed on many screens, move it to Provider/Riverpod.'),
            const Text('If cart must survive app restart, save it in storage too.'),
          ],
        ),
      ),
    );
  }`),
                pitfalls: [
                  ...commonPitfalls,
                  '**State manager as database.** Runtime state disappears when the app closes unless you persist it.',
                  '**Persisting every tap.** Save important data, not every temporary expansion panel.',
                ],
                tryIt: 'For an Instagram clone, classify: liked posts, current tab, login token, draft comment, theme mode, and scroll position. Now extend it by choosing which ones need persistence.',
                takeaway: 'Local is for now, shared is for many, persistent is for later too.',
              }),
            ],
          },
          {
            id: 'm3-s2',
            title: 'Provider and ChangeNotifier',
            topics: [
              topic({
                id: 'm3-t7',
                title: 'Provider Setup and ChangeNotifier Basics',
                explain: 'Install Provider and expose a `ChangeNotifier` controller to the widget tree.',
                analogy: 'Pejawar Matha prasada distribution works because one kitchen prepares and many volunteers serve. `ChangeNotifier` is the kitchen state. `Provider` is the serving path that lets widgets receive updates without cooking their own duplicate prasada.',
                theory: '`ChangeNotifier` is a class that owns mutable state and calls `notifyListeners()` when the state changes. `ChangeNotifierProvider` creates and provides it to a subtree. Widgets read it using Provider APIs such as `context.watch`, `context.read`, or `Consumer`.\n\nUse Provider when you want a simple, readable state controller for app features: cart, auth, settings, selected filters, checkout, and feed likes. It is beginner-friendly but still used in real production apps.\n\nThe basic discipline is: controller owns data and methods; widgets display state and call methods. Do not let widgets directly mutate controller fields.',
                whyItMatters: 'Provider is one of the most common Flutter state tools. Even if a company uses Riverpod or Bloc, Provider teaches the shared-state pattern clearly.',
                steps: [
                  'Run `flutter pub add provider`.',
                  'Create a class that extends `ChangeNotifier`.',
                  'Keep fields private and expose getters.',
                  'Call `notifyListeners()` after changing state.',
                  'Wrap your app or screen with `ChangeNotifierProvider`.',
                ],
                code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(ChangeNotifierProvider(
    create: (_) => CartController(),
    child: const MaterialApp(home: ProviderCartScreen()),
  ));
}

class CartController extends ChangeNotifier {
  int _count = 0;
  int get count => _count;

  void addMeal() {
    _count++;
    notifyListeners();
  }
}

class ProviderCartScreen extends StatelessWidget {
  const ProviderCartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final count = context.watch<CartController>().count;
    return Scaffold(
      appBar: AppBar(title: const Text('Provider Cart')),
      body: Center(child: Text('Meals in cart: \$count')),
      floatingActionButton: FloatingActionButton(
        onPressed: context.read<CartController>().addMeal,
        child: const Icon(Icons.add),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Public mutable fields.** Use private fields plus methods so changes always notify listeners.',
                  '**Provider above wrong subtree.** Widgets can only read providers above them in the tree.',
                ],
                tryIt: 'Install Provider and create a `TeaCounterController` with add and reset methods. Show the count on screen. Now extend it with a reset button.',
                takeaway: 'Provider shares a controller; ChangeNotifier rings the bell when data changes.',
              }),
              topic({
                id: 'm3-t8',
                title: 'context.watch, context.read, and Consumer',
                explain: 'Learn which Provider reading style rebuilds UI and which one only calls actions.',
                analogy: 'At a Bengaluru darshini token counter, customers watching the token display need live updates. The cashier pressing the next-token button does not need to watch the display; they only send a command. `watch` listens and rebuilds. `read` sends a command without listening. `Consumer` listens around only one small area.',
                theory: '`context.watch<T>()` reads a provider and rebuilds the widget when that provider notifies. Use it where UI displays changing state. `context.read<T>()` reads once and does not rebuild. Use it in callbacks such as button taps.\n\n`Consumer<T>` is useful when you want only a small part of a larger widget to rebuild. Wrap the exact text, badge, or row that depends on state rather than rebuilding the whole screen.\n\nA clean Provider screen often uses `watch` for displayed values and `read` for actions. If you use `watch` inside every button callback, you may rebuild more than needed.',
                whyItMatters: 'Provider performance and clarity depend on reading state correctly. This topic prevents the classic "why is my whole screen rebuilding?" confusion.',
                steps: [
                  'Use `watch` in build where you show changing values.',
                  'Use `read` inside `onPressed`, `onTap`, and other callbacks.',
                  'Use `Consumer` to rebuild a small subtree.',
                  'Avoid `watch` in callbacks when you only need to call a method.',
                  'Name the controller variable clearly, such as `cart` or `settings`.',
                ],
                code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class LikeCounter extends ChangeNotifier {
  int likes = 0;
  void like() {
    likes++;
    notifyListeners();
  }
}

class WatchReadDemo extends StatelessWidget {
  const WatchReadDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => LikeCounter(),
      child: Scaffold(
        appBar: AppBar(title: const Text('watch vs read')),
        body: Center(
          child: Consumer<LikeCounter>(
            builder: (_, counter, __) => Text('Likes: \${counter.likes}'),
          ),
        ),
        floatingActionButton: Builder(
          builder: (context) => FloatingActionButton(
            onPressed: context.read<LikeCounter>().like,
            child: const Icon(Icons.favorite),
          ),
        ),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Using read for displayed values.** UI will not rebuild. Use `watch` or `Consumer`.',
                  '**Using watch for button-only actions.** It can cause unnecessary rebuilds. Use `read`.',
                ],
                tryIt: 'Create a like counter with `Consumer` for the text and `read` for the button. Now extend it by adding a second text that uses `context.watch` directly.',
                takeaway: '`watch` listens, `read` commands, `Consumer` narrows the listening area.',
              }),
              topic({
                id: 'm3-t9',
                title: 'MultiProvider and Feature Controllers',
                explain: 'Provide multiple controllers cleanly without nesting providers like a tower of steel tiffin boxes.',
                analogy: 'A Bengaluru food-delivery startup has separate teams: menu, cart, user profile, and delivery tracking. One manager doing all jobs becomes chaos. `MultiProvider` lets each feature have its own controller while the app receives all of them neatly.',
                theory: '`MultiProvider` is syntax sugar for nesting multiple providers. Instead of deeply nested `ChangeNotifierProvider` widgets, you list providers in one array. This keeps app setup readable.\n\nFeature controllers should be focused. A `CartController` should not also manage theme mode and login. Smaller controllers are easier to test, easier to reason about, and rebuild fewer screens.\n\nPut providers at the lowest level that still covers all readers. App-wide settings may sit above `MaterialApp`. A checkout controller may sit above only checkout screens.',
                whyItMatters: 'Real apps have more than one state object. MultiProvider teaches you to organize feature state without building a giant god-controller.',
                steps: [
                  'Create one controller per feature, such as cart and profile.',
                  'Wrap your app or module route with `MultiProvider`.',
                  'Add each provider to the `providers` list.',
                  'Read only the controller needed by each widget.',
                  'Move feature-specific providers lower when they are not app-wide.',
                ],
                code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class CartController extends ChangeNotifier {
  int count = 0;
  void add() { count++; notifyListeners(); }
}

class ProfileController extends ChangeNotifier {
  String name = 'Anjali from Udupi';
}

void main() {
  runApp(MultiProvider(
    providers: [
      ChangeNotifierProvider(create: (_) => CartController()),
      ChangeNotifierProvider(create: (_) => ProfileController()),
    ],
    child: const MaterialApp(home: MultiProviderDemo()),
  ));
}

class MultiProviderDemo extends StatelessWidget {
  const MultiProviderDemo({super.key});

  @override
  Widget build(BuildContext context) {
    final name = context.watch<ProfileController>().name;
    final count = context.watch<CartController>().count;
    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: Center(child: Text('Cart count: \$count')),
      floatingActionButton: FloatingActionButton(
        onPressed: context.read<CartController>().add,
        child: const Icon(Icons.add),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**One mega controller.** Splitting by feature keeps code understandable.',
                  '**App-wide by laziness.** Do not put screen-only controllers at root unless many routes need them.',
                ],
                tryIt: 'Create `CartController` and `ThemeChoiceController` in `MultiProvider`. Display both values on one screen. Now extend it by moving a screen-only provider closer to that screen.',
                takeaway: 'Use one focused controller per feature and provide them neatly with `MultiProvider`.',
              }),
              topic({
                id: 'm3-t10',
                title: 'Selector and Rebuild Optimization',
                explain: 'Use `Selector` to rebuild only when the specific piece of provider state changes.',
                analogy: 'In Manipal Hospital, the pharmacy does not react when the parking token changes. It reacts only when prescription status changes. `Selector` gives widgets that same selective hearing: listen only to the slice you care about.',
                theory: '`Selector<A, S>` reads a provider of type `A` and selects a smaller value `S`. The widget rebuilds only when the selected value changes. This is useful when one controller holds several fields but a widget needs just one.\n\nFor example, a cart badge only needs item count, not total price, coupon text, delivery address, and loading flag. Selecting only count prevents needless badge rebuilds.\n\nDo not optimize prematurely everywhere. First write clear code. Use `Selector` when rebuilds are visible, expensive, or conceptually tied to one field.',
                whyItMatters: 'As apps grow, careless watching can rebuild large UI sections. Selector gives you precision without abandoning Provider.',
                steps: [
                  'Create a controller with more than one field.',
                  'Use `Selector<Controller, int>` for a count badge.',
                  'Return only the field the widget needs.',
                  'Keep selected values simple and comparable.',
                  'Use DevTools or debug prints if you need to prove rebuild behavior.',
                ],
                code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class OrderController extends ChangeNotifier {
  int packed = 0;
  String note = 'No note';
  void packOne() { packed++; notifyListeners(); }
  void changeNote() { note = 'Call customer near Udupi bus stand'; notifyListeners(); }
}

class SelectorDemo extends StatelessWidget {
  const SelectorDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => OrderController(),
      child: Scaffold(
        appBar: AppBar(title: const Text('Selector Demo')),
        body: Center(
          child: Selector<OrderController, int>(
            selector: (_, controller) => controller.packed,
            builder: (_, packed, __) => Text('Packed orders: \$packed'),
          ),
        ),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Selecting a mutable object.** If the selected list is mutated in place, Selector may not detect a meaningful change. Prefer new objects.',
                  '**Optimizing before clarity.** Use Selector where it helps, not everywhere like chutney on dessert.',
                ],
                tryIt: 'Create a controller with `likes`, `comments`, and `caption`. Use `Selector` so a like badge rebuilds only when likes change. Now extend it by adding a comment badge selector.',
                takeaway: '`Selector` listens to one slice, not the whole kitchen.',
              }),
              topic({
                id: 'm3-t11',
                title: 'Provider with Async Loading, Error, and Retry',
                explain: 'Represent loading, success, and error states in a Provider controller without confusing the UI.',
                analogy: 'A KSRTC bus from Kundapura to Bengaluru has states: booking, confirmed, delayed, cancelled. The passenger should not see all states at once. Async Provider code needs the same clear board: loading, data, or error.',
                theory: 'Async state needs explicit fields or a model that says what is happening. A controller might hold `isLoading`, `errorMessage`, and `items`. The UI then shows a spinner, error card, or list based on those values.\n\nAlways wrap async work with try/catch/finally. Set loading before starting, clear or set error after failure, and notify listeners when the visible state changes. Check whether the operation can be retried and expose a `retry` method.\n\nModule 4 covers real HTTP. In Module 3, use fake delays so you learn the state shape without network noise.',
                whyItMatters: 'Professional apps spend half their life loading or failing gracefully. Clean async state prevents stuck spinners and blank screens.',
                steps: [
                  'Create a controller with `isLoading`, `error`, and `items`.',
                  'Set loading true before async work.',
                  'Use try/catch to fill data or error.',
                  'Call `notifyListeners()` after visible changes.',
                  'Show retry UI when error is not null.',
                ],
                code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class MenuLoader extends ChangeNotifier {
  bool isLoading = false;
  String? error;
  List<String> items = [];

  Future<void> load() async {
    isLoading = true; error = null; notifyListeners();
    try {
      await Future.delayed(const Duration(seconds: 1));
      items = ['Idli', 'Masala dosa', 'Filter coffee'];
    } catch (_) {
      error = 'Could not load menu';
    } finally {
      isLoading = false; notifyListeners();
    }
  }
}

class AsyncProviderDemo extends StatelessWidget {
  const AsyncProviderDemo({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => MenuLoader()..load(),
      child: Consumer<MenuLoader>(
        builder: (_, loader, __) {
          if (loader.isLoading) return const Center(child: CircularProgressIndicator());
          if (loader.error != null) return Center(child: Text(loader.error!));
          return ListView(children: [for (final item in loader.items) ListTile(title: Text(item))]);
        },
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Stuck loading.** Use `finally` so loading becomes false after success or failure.',
                  '**No error UI.** Users need a clear message and retry path when work fails.',
                ],
                tryIt: 'Make a fake menu loader with a 1-second delay. Show spinner, menu, and error states. Now extend it with a Retry button that calls `load` again.',
                takeaway: 'Async UI should always know whether it is loading, successful, or failed.',
              }),
            ],
          },
          {
            id: 'm3-s3',
            title: 'Riverpod and Modern Provider Patterns',
            topics: [
              topic({
                id: 'm3-t12',
                title: 'Riverpod Setup: ProviderScope, Provider, and ConsumerWidget',
                explain: 'Start Riverpod with `ProviderScope`, read simple providers, and understand why it is independent of `BuildContext` ancestry.',
                analogy: 'Namma Metro smart card balance can be checked at different stations because the system is not tied to one gate. Riverpod providers feel similar: state is registered in a provider system, and widgets read it without depending on fragile ancestor placement.',
                theory: 'Riverpod is a modern state management library inspired by Provider but safer and more testable. You wrap the app with `ProviderScope`, declare providers as top-level variables, and read them inside `ConsumerWidget` or `ConsumerStatefulWidget` using `ref`.\n\nA simple `Provider` exposes read-only values or services. `ref.watch` listens and rebuilds. `ref.read` reads once for commands. This mirrors Provider ideas but avoids many `BuildContext` lookup problems.\n\nRiverpod is especially strong for dependency injection, async state, derived state, and testing. It can feel strict at first, but the strictness saves you from many runtime surprises.',
                whyItMatters: 'Many newer Flutter teams prefer Riverpod. Learning it after Provider helps you see the same state principles in a more robust package.',
                steps: [
                  'Run `flutter pub add flutter_riverpod`.',
                  'Wrap your app with `ProviderScope`.',
                  'Declare a top-level `Provider<String>`.',
                  'Create a `ConsumerWidget`.',
                  'Read the value with `ref.watch(providerName)`.',
                ],
                code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final cityProvider = Provider<String>((ref) => 'Udupi');

void main() {
  runApp(const ProviderScope(child: MaterialApp(home: RiverpodHello())));
}

class RiverpodHello extends ConsumerWidget {
  const RiverpodHello({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final city = ref.watch(cityProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Riverpod')),
      body: Center(child: Text('Today city: \$city')),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Forgetting ProviderScope.** Riverpod needs `ProviderScope` above consumers.',
                  '**Watching inside callbacks.** Use `ref.read` for button actions, `ref.watch` for UI display.',
                ],
                tryIt: 'Create a `Provider<String>` for today special restaurant. Display it in a `ConsumerWidget`. Now extend it by adding a second provider for city name.',
                takeaway: 'Riverpod providers live in `ProviderScope`; widgets read them with `ref`.',
              }),
              topic({
                id: 'm3-t13',
                title: 'StateProvider and NotifierProvider',
                explain: 'Use `StateProvider` for small mutable values and `NotifierProvider` for richer state logic.',
                analogy: 'A tea stall token number can be a simple counter: `StateProvider`. But a parcel kitchen with add item, remove item, discount, and total rules needs a manager: `NotifierProvider`. Use the small tool for the small job and the manager for rules.',
                theory: '`StateProvider` stores a simple mutable value. It is good for selected tab, filter value, checkbox, counter, or sorting option. You update it through `ref.read(provider.notifier).state = newValue`.\n\nFor state with business methods, use `NotifierProvider`. A notifier class owns state and exposes methods like add, remove, clear, and applyCoupon. The UI calls methods; the notifier protects the rules.\n\nDo not cram complex cart logic into many separate `StateProvider`s. Once values belong together, move them into a notifier.',
                whyItMatters: 'Choosing between StateProvider and NotifierProvider keeps Riverpod code simple. You avoid both overengineering tiny values and underengineering real business state.',
                steps: [
                  'Use `StateProvider<int>` for one small counter.',
                  'Display it with `ref.watch`.',
                  'Update it with `ref.read(counterProvider.notifier).state++`.',
                  'Create a `Notifier` when state has multiple operations.',
                  'Keep all related state transitions inside the notifier.',
                ],
                code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final coffeeCountProvider = StateProvider<int>((ref) => 0);

void main() => runApp(const ProviderScope(child: MaterialApp(home: CoffeeCounter())));

class CoffeeCounter extends ConsumerWidget {
  const CoffeeCounter({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(coffeeCountProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('StateProvider')),
      body: Center(child: Text('Coffee count: \$count')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => ref.read(coffeeCountProvider.notifier).state++,
        child: const Icon(Icons.add),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Too many loose StateProviders.** Related state should live together in a notifier.',
                  '**Mutating outside rules.** If rules matter, expose methods instead of direct state changes.',
                ],
                tryIt: 'Create a `StateProvider<int>` for cart count. Then design a `CartNotifier` on paper with add, remove, clear, and total methods. Now extend it by implementing one method.',
                takeaway: '`StateProvider` is a knob; `NotifierProvider` is a control room.',
              }),
              topic({
                id: 'm3-t14',
                title: 'FutureProvider, StreamProvider, and AsyncValue',
                explain: 'Handle async data in Riverpod using `AsyncValue` instead of manual loading/error flags.',
                analogy: 'A KSRTC timetable board has three clear states: loading route info, showing buses, or saying service unavailable. Riverpod `AsyncValue` gives you exactly those states: loading, data, and error.',
                theory: '`FutureProvider` exposes the result of a future. `StreamProvider` exposes values over time. Both return `AsyncValue<T>` when watched. `AsyncValue` forces you to handle loading, error, and data cases cleanly.\n\nUse `.when(loading: ..., error: ..., data: ...)` for beginner-friendly UI. This prevents forgotten error screens and stuck spinners. Later you can use pattern matching or helper widgets.\n\nThe provider owns the async work. The UI simply reacts to the async state. This separation makes screens much cleaner.',
                whyItMatters: 'Network-heavy apps need consistent async UI. Riverpod makes the loading/error/data pattern explicit and harder to forget.',
                steps: [
                  'Create a `FutureProvider<List<String>>` with a fake delay.',
                  'Watch it in a `ConsumerWidget`.',
                  'Use `asyncValue.when` to show loading, error, and data UI.',
                  'Use `ref.refresh(provider)` for retry or pull refresh.',
                  'Move real HTTP into Module 4 later.',
                ],
                code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final menuProvider = FutureProvider<List<String>>((ref) async {
  await Future.delayed(const Duration(seconds: 1));
  return ['Neer dosa', 'Kori rotti', 'Filter coffee'];
});

class FutureProviderMenu extends ConsumerWidget {
  const FutureProviderMenu({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final menu = ref.watch(menuProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('AsyncValue')),
      body: menu.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: \$error')),
        data: (items) => ListView(
          children: [for (final item in items) ListTile(title: Text(item))],
        ),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Ignoring error case.** `AsyncValue.when` nudges you to handle it. Do not skip it.',
                  '**Doing async work in build.** Put async work inside providers, not directly in `build`.',
                ],
                tryIt: 'Create a fake `FutureProvider` for Bengaluru cafe names. Show spinner, data list, and error text. Now extend it with a refresh button using `ref.refresh`.',
                takeaway: '`AsyncValue` is the three-compartment tiffin box for async UI: loading, data, error.',
              }),
              topic({
                id: 'm3-t15',
                title: 'Provider Families, autoDispose, and keepAlive',
                explain: 'Pass parameters into providers and clean up state when screens no longer need it.',
                analogy: 'A Bengaluru Metro fare depends on from-station and to-station. You do not create one fare calculator for every possible journey by hand. A provider family accepts the journey as input. `autoDispose` is like clearing the ticket counter after the passenger leaves.',
                theory: 'A provider family creates parameterized providers. For example, `restaurantProvider(id)` can load one restaurant by id. This keeps provider definitions reusable and avoids global variables for selected ids.\n\n`autoDispose` tells Riverpod to dispose provider state when no one listens anymore. This is useful for detail screens, search queries, temporary forms, and network results that should not live forever.\n\nSometimes you want to keep data even after listeners disappear briefly. Riverpod offers keep-alive tools for caching. The rule is simple: auto-dispose temporary state; keep alive expensive or intentionally cached state.',
                whyItMatters: 'Real apps have detail screens, search pages, and dynamic ids. Families and lifecycle control make Riverpod scale cleanly.',
                steps: [
                  'Create a provider family that accepts an id or city name.',
                  'Watch it with a parameter from the screen.',
                  'Use auto-dispose for temporary detail/search state.',
                  'Refresh or invalidate when data must reload.',
                  'Avoid storing selected ids globally when route arguments already provide them.',
                ],
                code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final fareProvider = Provider.family<int, String>((ref, route) {
  if (route == 'Udupi-Kundapura') return 85;
  if (route == 'Indiranagar-Majestic') return 35;
  return 50;
});

class FareFamilyScreen extends ConsumerWidget {
  const FareFamilyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    const route = 'Indiranagar-Majestic';
    final fare = ref.watch(fareProvider(route));
    return Scaffold(
      appBar: AppBar(title: const Text('Provider Family')),
      body: Center(child: Text('\$route fare: ₹\$fare')),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Using global selected id.** Pass parameters with families when the provider depends on input.',
                  '**Leaking temporary search state.** Use auto-dispose for state that should vanish after leaving.',
                ],
                tryIt: 'Create a fare provider family that accepts a route string and returns a rupee amount. Display fares for three routes. Now extend it with auto-dispose for a fake detail loader.',
                takeaway: 'Provider families answer: same logic, different input.',
              }),
              topic({
                id: 'm3-t16',
                title: 'Testing Riverpod Providers',
                explain: 'Test provider logic without launching a whole widget app by using `ProviderContainer`.',
                analogy: 'Before opening a Kundapura fish auction, the co-op tests the weighing scale with a known 1 kg weight. Riverpod provider tests are that calibration: check the logic in isolation before the UI crowd arrives.',
                theory: 'Riverpod providers can be tested with `ProviderContainer`. You create a container, read providers, call notifier methods, and assert state. This is much faster than widget testing every business rule.\n\nProvider overrides let you replace real services with fake ones. For example, a real API provider can be overridden with a fake menu service in tests. This is dependency injection with less ceremony.\n\nAlways dispose the test container. Tests should not leak provider state between cases.',
                whyItMatters: 'State bugs are easier to catch when business logic is testable without tapping through screens. Riverpod is excellent here.',
                steps: [
                  'Add `flutter_test` and Riverpod test imports.',
                  'Create a `ProviderContainer` inside the test.',
                  'Read the provider or notifier.',
                  'Call methods and expect state changes.',
                  'Dispose the container after the test.',
                ],
                code: `// cart_provider_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final countProvider = StateProvider<int>((ref) => 0);

void main() {
  test('increments cart count', () {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    expect(container.read(countProvider), 0);
    container.read(countProvider.notifier).state++;
    expect(container.read(countProvider), 1);
  });
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Only testing UI taps.** Test provider rules directly when possible.',
                  '**No overrides.** Use overrides to replace real services with predictable fakes.',
                ],
                tryIt: 'Write a Riverpod test for a cart count provider. Then extend it by testing a fake discount provider that returns ₹20 off for orders above ₹200.',
                takeaway: 'Riverpod tests let you test the kitchen before opening the restaurant.',
              }),
            ],
          },
          {
            id: 'm3-s4',
            title: 'Bloc, Cubit, GetX, and State Machines',
            topics: [
              topic({
                id: 'm3-t17',
                title: 'Cubit Basics: State Out, Methods In',
                explain: 'Use Cubit for predictable state changes with simple method calls and emitted states.',
                analogy: 'A Manipal Hospital token counter has one current display. The nurse presses Next, Skip, or Reset. Patients do not edit the display directly. Cubit works the same: UI calls methods, Cubit emits new states.',
                theory: 'Cubit is part of the Bloc ecosystem. It is simpler than full Bloc because there are no event classes. You define a Cubit class with current state and methods that call `emit(newState)`.\n\nCubit is good for features with clear commands: increment, submit, load, retry, select, reset. The UI uses `BlocBuilder` to rebuild when state changes and calls Cubit methods from buttons.\n\nCompared with Provider, Cubit encourages immutable emitted states and predictable transitions. Compared with full Bloc, it is less ceremony for straightforward flows.',
                whyItMatters: 'Many companies use Bloc or Cubit for production architecture. Cubit is a friendly entrance into that world.',
                steps: [
                  'Run `flutter pub add flutter_bloc`.',
                  'Create a Cubit class that extends `Cubit<int>`.',
                  'Expose methods that call `emit`.',
                  'Provide it with `BlocProvider`.',
                  'Display it with `BlocBuilder`.',
                ],
                code: `import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class TokenCubit extends Cubit<int> {
  TokenCubit() : super(1);
  void next() => emit(state + 1);
  void reset() => emit(1);
}

class CubitTokenScreen extends StatelessWidget {
  const CubitTokenScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => TokenCubit(),
      child: Scaffold(
        appBar: AppBar(title: const Text('Cubit Token')),
        body: Center(
          child: BlocBuilder<TokenCubit, int>(
            builder: (_, token) => Text('Token \$token'),
          ),
        ),
        floatingActionButton: Builder(
          builder: (context) => FloatingActionButton(
            onPressed: context.read<TokenCubit>().next,
            child: const Icon(Icons.skip_next),
          ),
        ),
      ),
    );
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Mutating state object.** Emit a new state instead of secretly editing the old one.',
                  '**Cubit doing UI work.** Cubit should decide state, not show snackbars or navigate directly.',
                ],
                tryIt: 'Create a `LikeCubit` that starts at 0 and has like and reset methods. Display it with `BlocBuilder`. Now extend it by adding unlike but never going below 0.',
                takeaway: 'Cubit is simple: UI calls methods, Cubit emits state.',
              }),
              topic({
                id: 'm3-t18',
                title: 'Bloc Events, States, and Transitions',
                explain: 'Learn full Bloc when you want explicit events and traceable state transitions.',
                analogy: 'A KSRTC booking office records events: passenger requested seat, payment started, payment succeeded, ticket printed. Each event leads to a state. Full Bloc is that ledger: you can see what happened and what state came next.',
                theory: 'Bloc separates **events** from **states**. UI adds events such as `AddToCartPressed` or `LoginSubmitted`. Bloc receives events, runs logic, and emits states such as loading, success, or failure.\n\nThis extra ceremony is useful for complex flows, auditability, and teams that want strict patterns. You can log transitions, test event-to-state behavior, and keep business logic away from widgets.\n\nUse Cubit for simple method-driven features. Use Bloc when events matter, flows are complex, or the team standard requires explicit event classes.',
                whyItMatters: 'Bloc is common in enterprise Flutter work. Knowing the event-state model helps you join codebases with established architecture.',
                steps: [
                  'Define state classes for initial, loading, success, and failure.',
                  'Define event classes for user or system actions.',
                  'Create a Bloc that maps events to emitted states.',
                  'Use `BlocBuilder` for UI and `BlocListener` for side effects.',
                  'Test event-to-state sequences.',
                ],
                code: `// Pseudocode-style full Bloc structure
abstract class LoginEvent {}
class LoginSubmitted extends LoginEvent {
  LoginSubmitted(this.phone);
  final String phone;
}

abstract class LoginState {}
class LoginInitial extends LoginState {}
class LoginLoading extends LoginState {}
class LoginSuccess extends LoginState {}
class LoginFailure extends LoginState {
  LoginFailure(this.message);
  final String message;
}

// In a real app:
// class LoginBloc extends Bloc<LoginEvent, LoginState> {
//   LoginBloc() : super(LoginInitial()) {
//     on<LoginSubmitted>((event, emit) async {
//       emit(LoginLoading());
//       await Future.delayed(const Duration(seconds: 1));
//       emit(LoginSuccess());
//     });
//   }
// }`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Using Bloc for tiny toggles.** Full Bloc may be too much for a simple password visibility flag.',
                  '**Side effects in builder.** Navigation and snackbars belong in `BlocListener`, not `BlocBuilder`.',
                ],
                tryIt: 'Model a parcel booking flow as events and states on paper: started, submitted, loading, success, failed. Now extend it by implementing the Cubit version first, then compare ceremony.',
                takeaway: 'Bloc is an event ledger that emits predictable states.',
              }),
              topic({
                id: 'm3-t19',
                title: 'BlocBuilder, BlocListener, and BlocConsumer',
                explain: 'Separate UI rebuilding from one-time side effects such as SnackBars and navigation.',
                analogy: 'In a Bengaluru restaurant, the kitchen display updates every order status, but the waiter shouts "table ready" only once. `BlocBuilder` updates the display. `BlocListener` handles one-time shouts. `BlocConsumer` does both when needed.',
                theory: '`BlocBuilder` rebuilds UI based on Bloc/Cubit state. It should be pure: given a state, return widgets. Do not navigate, show snackbars, or open dialogs inside a builder.\n\n`BlocListener` reacts to state changes for side effects. Use it for snackbars, navigation, dialogs, haptics, and analytics. `BlocConsumer` combines builder and listener in one widget when a screen needs both.\n\nThis separation prevents repeated side effects. If you show a snackbar in a builder, it may fire again after any rebuild, which feels like the app has hiccups.',
                whyItMatters: 'Side-effect discipline is a senior skill. It prevents duplicate navigation, repeated snackbars, and hard-to-debug UI behavior.',
                steps: [
                  'Use `BlocBuilder` for visual state.',
                  'Use `BlocListener` for one-time reactions.',
                  'Use `BlocConsumer` when both are needed in one place.',
                  'Keep builder free of `Navigator` and `ScaffoldMessenger` calls.',
                  'Use `listenWhen` or `buildWhen` to narrow reactions if needed.',
                ],
                code: `// Typical BlocConsumer shape
BlocConsumer<OrderCubit, OrderState>(
  listener: (context, state) {
    if (state is OrderSuccess) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Parcel booked successfully')),
      );
    }
  },
  builder: (context, state) {
    if (state is OrderLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    return FilledButton(
      onPressed: context.read<OrderCubit>().submit,
      child: const Text('Book parcel'),
    );
  },
)`,
                pitfalls: [
                  ...commonPitfalls,
                  '**SnackBar in builder.** Builders can run many times. Use listener.',
                  '**Listener changing layout.** Listener is for side effects; builder controls visible UI.',
                ],
                tryIt: 'Create a fake order Cubit with idle, loading, and success states. Use builder for spinner/button and listener for success snackbar. Now extend it with an error snackbar.',
                takeaway: 'Builder draws the screen; listener reacts once.',
              }),
              topic({
                id: 'm3-t20',
                title: 'GetX Reactive State and When to Be Careful',
                explain: 'Understand GetX reactive variables and the tradeoffs of its compact style.',
                analogy: 'A tiny Bengaluru darshini can run fast with one energetic cashier handling token, billing, and shouting orders. That is GetX: quick and compact. But in a large hotel, that same style can become confusing if no one knows who owns what.',
                theory: 'GetX offers reactive variables such as `.obs`, controllers, dependency lookup, routing, and more. UI can rebuild through `Obx` when observed values change. It is popular because it is concise and fast to prototype.\n\nThe tradeoff is discipline. GetX makes it easy to access controllers from many places, so ownership can become blurry if the team is not strict. Compact code can turn into hidden coupling.\n\nLearn the pattern, but evaluate it honestly. For small apps, it can be productive. For large teams, explicit boundaries from Riverpod or Bloc may be easier to maintain.',
                whyItMatters: 'You will see GetX in many Flutter projects. Knowing both the syntax and the caution helps you work with existing code without blindly copying habits.',
                steps: [
                  'Install GetX only in projects that choose that architecture.',
                  'Create a controller with reactive values.',
                  'Use `Obx` to rebuild UI when values change.',
                  'Keep controller ownership clear.',
                  'Avoid using global lookup as an excuse to skip architecture.',
                ],
                code: `// GetX-style example
// flutter pub add get
//
// class CartController extends GetxController {
//   final count = 0.obs;
//   void add() => count.value++;
// }
//
// class CartView extends StatelessWidget {
//   final cart = Get.put(CartController());
//
//   @override
//   Widget build(BuildContext context) {
//     return Obx(() => Text('Cart: \${cart.count.value}'));
//   }
// }`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Global access everywhere.** Easy access can hide dependencies. Be deliberate.',
                  '**Mixing many architectures.** Do not use Provider, Riverpod, Bloc, and GetX together without a serious reason.',
                ],
                tryIt: 'Read a small GetX counter example and identify where state lives, where UI listens, and where mutation happens. Now extend the design on paper to include cart total without making everything global.',
                takeaway: 'GetX is fast; your architecture discipline must be faster.',
              }),
              topic({
                id: 'm3-t21',
                title: 'State Machines for Forms, Payments, and Workflows',
                explain: 'Model complex flows as allowed states and transitions instead of scattered booleans.',
                analogy: 'Manipal Hospital patient flow is not random: registered, waiting, consulting, billing, pharmacy, done. A patient cannot jump from not registered to pharmacy. State machines give your app that same strict route map.',
                theory: 'A state machine defines possible states and allowed transitions. Instead of many booleans like `isLoading`, `hasPaid`, `hasError`, `isRetrying`, you create clear states such as idle, validating, submitting, success, and failure.\n\nThis prevents impossible combinations. For example, a form should not be both loading and success and error at the same time. One state object or sealed class can represent exactly one truth.\n\nState machines work with Provider, Riverpod, Bloc, or plain Dart. They are a modeling habit, not a package.',
                whyItMatters: 'Payments, booking, checkout, upload, login, and verification flows become safer when impossible states are impossible to represent.',
                steps: [
                  'List every screen state in the workflow.',
                  'Draw allowed transitions between states.',
                  'Replace scattered booleans with one state value or sealed class.',
                  'Make UI render from the current state.',
                  'Reject transitions that do not make business sense.',
                ],
                code: `enum BookingState {
  editing,
  validating,
  submitting,
  success,
  failure,
}

class BookingController {
  BookingState state = BookingState.editing;

  void submit() {
    if (state != BookingState.editing && state != BookingState.failure) return;
    state = BookingState.validating;
    // validate fields
    state = BookingState.submitting;
    // call API later in Module 4
    state = BookingState.success;
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Boolean explosion.** Three booleans can create eight combinations, many impossible. Prefer one explicit state.',
                  '**No transition rules.** If every state can jump anywhere, it is not really a state machine.',
                ],
                tryIt: 'Model login with states: editing, validating, submitting, success, failure. Write allowed transitions. Now extend it by adding otpSent and otpVerifying states.',
                takeaway: 'A state machine is a route map for complex app behavior.',
              }),
            ],
          },
          {
            id: 'm3-s5',
            title: 'Immutability, Architecture, and Real App Patterns',
            topics: [
              topic({
                id: 'm3-t22',
                title: 'Immutability, copyWith, Equatable, and freezed',
                explain: 'Represent state as immutable data so changes are predictable and easy to compare.',
                analogy: 'A restaurant bill should not be edited silently after the customer pays. If one item changes, print a new corrected bill. Immutable state works like that: make a new state object instead of secretly scratching the old one.',
                theory: 'Immutable state means once an object is created, you do not change its fields. To update it, create a new object, often using a `copyWith` method. This makes rebuilds, comparisons, undo, and tests easier.\n\n`Equatable` helps Dart compare objects by value instead of identity. `freezed` can generate immutable classes, unions/sealed states, `copyWith`, equality, and JSON helpers. It adds setup, but saves boilerplate in larger apps.\n\nFor small demos, manual classes are fine. For serious apps with many states and models, immutability tools reduce bugs and repetitive code.',
                whyItMatters: 'Most advanced state management assumes immutable state. If you mutate objects in place, rebuilds and comparisons become unreliable.',
                steps: [
                  'Make state fields `final`.',
                  'Create a constructor requiring all fields.',
                  'Add a `copyWith` method for updates.',
                  'Use value equality with Equatable or generated code when needed.',
                  'Use freezed for larger union-style states.',
                ],
                code: `class CartState {
  const CartState({required this.items, required this.total});

  final List<String> items;
  final int total;

  CartState copyWith({List<String>? items, int? total}) {
    return CartState(
      items: items ?? this.items,
      total: total ?? this.total,
    );
  }
}

void main() {
  const oldState = CartState(items: ['Dosa'], total: 80);
  final newState = oldState.copyWith(
    items: [...oldState.items, 'Coffee'],
    total: 120,
  );
  print(newState.total);
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Mutating final list contents.** `final` prevents reassignment, not list mutation. Create a new list.',
                  '**copyWith without equality.** For some tools, value equality matters. Consider Equatable/freezed.',
                ],
                tryIt: 'Create an immutable `PostState` with likes, comments, and isLiked. Add `copyWith`. Now extend it by creating a new state when the user likes a post.',
                takeaway: 'Immutable state changes by replacement, not secret editing.',
              }),
              topic({
                id: 'm3-t23',
                title: 'Derived State, Selectors, and Computed Values',
                explain: 'Compute values like totals, filters, and badges from source state instead of storing duplicates.',
                analogy: 'A hotel bill total is derived from item prices. The cashier does not maintain a separate magical total in another notebook and hope it matches. Derived state means calculate the total from the real items.',
                theory: 'Derived state is computed from other state: cart total from items, unread count from messages, filtered list from search query and all items, delivery fee from distance. Store the source of truth and compute the rest.\n\nDuplicating derived values causes mismatch bugs. If `cartItems` says three items but `cartCount` says two, which one is true? Prefer getters, selectors, providers, or computed methods.\n\nUse memoization or selectors only when computation is expensive. For simple totals, a getter is enough.',
                whyItMatters: 'Clean derived state prevents bugs where badges, totals, and lists disagree. This is especially important in ecommerce, finance, and feeds.',
                steps: [
                  'Identify the source data.',
                  'Remove duplicated values that can be computed.',
                  'Create getters or providers for computed values.',
                  'Use selectors if only one computed value should rebuild.',
                  'Test that changing source data updates computed UI.',
                ],
                code: `class CartController {
  final items = <int>[80, 120, 60]; // prices in rupees

  int get count => items.length;
  int get total => items.fold(0, (sum, price) => sum + price);
  bool get freeDelivery => total >= 300;
}

void main() {
  final cart = CartController();
  print('Items: \${cart.count}');
  print('Total: ₹\${cart.total}');
  print('Free delivery: \${cart.freeDelivery}');
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Storing duplicate truth.** If a value can be computed reliably, compute it.',
                  '**Expensive compute in every build.** For heavy filtering, use selectors or cached derived providers.',
                ],
                tryIt: 'Create cart items with prices and compute count, subtotal, GST, and total using getters. Now extend it with a free-delivery boolean above ₹300.',
                takeaway: 'Store source truth; compute the rest.',
              }),
              topic({
                id: 'm3-t24',
                title: 'Repository, Controller, and UI Separation',
                explain: 'Separate data access, business rules, and widgets so state code stays clean as the app grows.',
                analogy: 'Vidhana Soudha works because departments have roles. The front desk does not write policy, the archive does not handle crowds, and the minister does not stamp every visitor pass. In Flutter, repository fetches data, controller manages state, UI displays it.',
                theory: 'A simple layered structure is: **UI** shows widgets and sends user actions, **controller/notifier/bloc** owns state and business decisions, **repository** talks to APIs, databases, or local storage. This separation keeps widgets from becoming everything.\n\nRepositories are especially useful when you later swap fake data for real HTTP or local cache. The controller does not care whether data came from a server, Hive box, or mock list; it calls the repository.\n\nDo not over-layer tiny demos. But once a feature has async data, retries, caching, or business rules, separation saves your future self.',
                whyItMatters: 'Architecture is how teams avoid 1,000-line screens. This pattern appears in Provider, Riverpod, Bloc, and clean architecture codebases.',
                steps: [
                  'Create a repository class for data access.',
                  'Create a controller/notifier that calls the repository.',
                  'Expose state from the controller.',
                  'Keep widgets focused on rendering and user actions.',
                  'Inject repositories so tests can use fakes.',
                ],
                code: `class MenuRepository {
  Future<List<String>> fetchMenu() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return ['Idli', 'Dosa', 'Coffee'];
  }
}

class MenuController {
  MenuController(this.repository);
  final MenuRepository repository;

  bool loading = false;
  List<String> items = [];

  Future<void> load() async {
    loading = true;
    items = await repository.fetchMenu();
    loading = false;
  }
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**API calls inside widgets.** Move data access into repository/controller layers.',
                  '**Too many folders too soon.** Structure should clarify, not create empty architecture theatre.',
                ],
                tryIt: 'Refactor a fake menu loader into `MenuRepository` and `MenuController`. Keep the widget only responsible for rendering. Now extend it by creating a fake repository for tests.',
                takeaway: 'UI displays, controller decides, repository fetches.',
              }),
              topic({
                id: 'm3-t25',
                title: 'Pagination State for Feeds',
                explain: 'Manage first load, loading more, refresh, empty, error, and end-of-list states for feed screens.',
                analogy: 'A Kundapura fish auction releases batches. First batch comes at dawn, next batch arrives after boats unload, and sometimes the sea says "finished for today." Feed pagination is that: load first page, load more, refresh, and know when no more items exist.',
                theory: 'Pagination state is more than a list. You usually need `items`, `isFirstLoading`, `isLoadingMore`, `error`, and `hasMore`. Pull-to-refresh resets the list. Load-more appends to the list.\n\nKeep guards so multiple load-more calls do not run together. Track page number or cursor. Show bottom loading UI during pagination, not a full-screen spinner that hides existing content.\n\nIn Module 4 you will fetch real pages. Here, model the state clearly with fake data so the UI behavior is ready.',
                whyItMatters: 'Instagram-style feeds, product lists, chat history, and search results all need pagination. Bad pagination creates duplicate items, endless spinners, and angry users.',
                steps: [
                  'Create a feed state with items, loading flags, error, and hasMore.',
                  'On first load, show full-screen loading.',
                  'On load more, append items and show bottom spinner.',
                  'Prevent load more when already loading or hasMore is false.',
                  'On refresh, reset items and page cursor.',
                ],
                code: `class FeedState {
  const FeedState({
    this.items = const [],
    this.isFirstLoading = false,
    this.isLoadingMore = false,
    this.hasMore = true,
    this.error,
  });

  final List<String> items;
  final bool isFirstLoading;
  final bool isLoadingMore;
  final bool hasMore;
  final String? error;

  FeedState copyWith({
    List<String>? items,
    bool? isFirstLoading,
    bool? isLoadingMore,
    bool? hasMore,
    String? error,
  }) => FeedState(
    items: items ?? this.items,
    isFirstLoading: isFirstLoading ?? this.isFirstLoading,
    isLoadingMore: isLoadingMore ?? this.isLoadingMore,
    hasMore: hasMore ?? this.hasMore,
    error: error,
  );
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**One loading flag for everything.** First load and load-more need different UI.',
                  '**No hasMore flag.** Without it, the app keeps asking the sea for fish after the boats are done.',
                ],
                tryIt: 'Design a feed controller with first load and load-more methods using fake posts. Now extend it by adding refresh that clears and reloads page one.',
                takeaway: 'A feed is not just items; it is items plus loading, error, cursor, and end state.',
              }),
              topic({
                id: 'm3-t26',
                title: 'State Management Decision Guide',
                explain: 'Choose between setState, ValueNotifier, Provider, Riverpod, Cubit/Bloc, and GetX based on problem size and team needs.',
                analogy: 'You do not take a Volvo bus from Diana in Udupi to the next street, and you do not ride a bicycle from Kundapura to Bengaluru with luggage. State tools are vehicles. Pick the smallest vehicle that safely carries the people and baggage.',
                theory: '`setState` is great for local screen state. `ValueNotifier` is great for one reactive value. Provider is simple and readable for shared app state. Riverpod adds safer dependency injection, async handling, and testability. Cubit/Bloc gives strict state transitions and enterprise structure. GetX gives compact reactive style but needs discipline.\n\nThe decision is not "which package is best forever?" It is "which tool matches this feature, this team, and this app size?" A solo prototype and a banking app should not have identical architecture.\n\nAlso avoid mixing tools randomly. A project can use local `setState` plus one main app-state tool. That is normal. But using Provider, Riverpod, Bloc, and GetX for the same type of feature becomes confusing.',
                whyItMatters: 'Interviewers often ask why you chose a state management approach. A thoughtful answer beats package fan-club energy every time.',
                steps: [
                  'Use `setState` for one-screen UI toggles and counters.',
                  'Use `ValueNotifier` for one focused reactive value.',
                  'Use Provider for simple shared controllers.',
                  'Use Riverpod when testability, DI, async, and safety matter.',
                  'Use Cubit/Bloc for complex workflows and strict team architecture.',
                  'Use GetX only with clear ownership rules if the project chooses it.',
                ],
                code: `String chooseStateTool({
  required bool oneWidget,
  required bool oneValue,
  required bool manyScreens,
  required bool complexWorkflow,
  required bool needsStrongTesting,
}) {
  if (oneWidget) return 'setState';
  if (oneValue) return 'ValueNotifier';
  if (complexWorkflow) return 'Cubit or Bloc';
  if (needsStrongTesting) return 'Riverpod';
  if (manyScreens) return 'Provider or Riverpod';
  return 'setState';
}`,
                pitfalls: [
                  ...commonPitfalls,
                  '**Package loyalty.** Good engineers choose tools by problem, not by online arguments.',
                  '**Ignoring team standard.** In a job, consistency with the codebase often matters more than your favorite package.',
                ],
                tryIt: 'For each feature, choose a tool and explain why: password visibility, cart, login flow, feed pagination, theme mode, and upload progress. Now extend it by writing your own decision table.',
                takeaway: 'Pick the smallest state tool that keeps ownership, reactions, and tests clear.',
              }),
            ],
          },
        ]
      })(),
      projects: [
        {
          id: 'm3-p1',
          type: 'Mini Project',
          title: 'Kundapura Parcel Cart with Provider',
          domain: 'State',
          duration: '3 hours',
          description:
            'Build a parcel-order cart where users add kori rotti, neer dosa, coffee, and meals. The cart count, total, discount, and item list are managed with Provider and ChangeNotifier.',
          tools: ['Flutter', 'Dart', 'Provider', 'ChangeNotifier'],
          blueprint: {
            overview:
              'Create a beginner-friendly cart app that teaches shared state through a local food-ordering flow.',
            functionalRequirements: [
              '**Menu.** Show at least eight local items with prices in ₹.',
              '**Cart.** Add, remove, and clear cart items.',
              '**Derived totals.** Compute count, subtotal, discount, and final total from cart items.',
              '**Provider.** Keep cart logic in `CartController`, not inside widgets.',
              '**Feedback.** Show SnackBars for add/remove actions.',
              '**Empty state.** Show a helpful empty cart message.',
            ],
            technicalImplementation: [
              '**State.** Use `ChangeNotifierProvider` for `CartController`.',
              '**Reads.** Use `context.watch` for UI values and `context.read` for button actions.',
              '**Optimization.** Use `Selector` for the cart badge count.',
              '**Composition.** Extract `MenuItemCard` and `CartSummary` widgets.',
              '**Validation.** Prevent totals from becoming negative.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Scaffold',
                outcome: 'Provider app shell',
                prompt:
                  'Create a Flutter app called kundapura_provider_cart with Provider installed, Material 3 theme, and a CartController provided above the home screen.',
              },
              {
                step: 2,
                label: 'Menu',
                outcome: 'Menu items and add buttons',
                prompt:
                  'Add a list of local menu items with prices in rupees and reusable MenuItemCard widgets that call CartController.addItem.',
              },
              {
                step: 3,
                label: 'Cart',
                outcome: 'Cart summary and remove actions',
                prompt:
                  'Build a cart summary area that watches cart items, computes total, supports remove and clear, and shows an empty state.',
              },
              {
                step: 4,
                label: 'Optimize',
                outcome: 'Selector badge',
                prompt:
                  'Add a cart badge using Selector so it rebuilds only when item count changes.',
              },
              {
                step: 5,
                label: 'Polish',
                outcome: 'Clean UX and no state leaks',
                prompt:
                  'Review Provider usage: use watch only for displayed state, read for callbacks, and keep fields private inside CartController.',
              },
            ],
            deliverable:
              'A Provider-powered Kundapura parcel cart with shared cart state and derived totals.',
          },
        },
        {
          id: 'm3-p2',
          type: 'Mini Project',
          title: 'Manipal Token Queue with Riverpod',
          domain: 'State',
          duration: '3 hours',
          description:
            'Build a hospital-style token queue using Riverpod. Learners practice StateProvider, NotifierProvider, AsyncValue, and provider testing with a simple, memorable workflow.',
          tools: ['Flutter', 'Dart', 'Riverpod', 'AsyncValue'],
          blueprint: {
            overview:
              'Create a token queue app where Riverpod manages current token, departments, loading doctors, and queue actions.',
            functionalRequirements: [
              '**Token.** Show current token and next/reset actions.',
              '**Departments.** Use provider families for department-specific queue messages.',
              '**Async.** Use `FutureProvider` to load fake doctor availability.',
              '**Queue rules.** Prevent token from going below 1.',
              '**Testing.** Add at least one provider test with `ProviderContainer`.',
              '**UI.** Show loading, error, and data states clearly.',
            ],
            technicalImplementation: [
              '**Scope.** Wrap the app with `ProviderScope`.',
              '**Simple state.** Use `StateProvider` for selected department.',
              '**Controller.** Use `NotifierProvider` for token queue rules.',
              '**Async.** Use `FutureProvider` and `AsyncValue.when`.',
              '**Tests.** Test token increment/reset without launching UI.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Setup',
                outcome: 'Riverpod app shell',
                prompt:
                  'Create a Flutter app called manipal_token_riverpod with flutter_riverpod, ProviderScope, and a ConsumerWidget home screen.',
              },
              {
                step: 2,
                label: 'Token',
                outcome: 'NotifierProvider token logic',
                prompt:
                  'Implement a TokenNotifier with next, previous, and reset rules, then display it in the UI with ref.watch.',
              },
              {
                step: 3,
                label: 'Department',
                outcome: 'Selected department state',
                prompt:
                  'Add StateProvider for selected department and provider family for department-specific queue instructions.',
              },
              {
                step: 4,
                label: 'Async',
                outcome: 'Doctor availability loading',
                prompt:
                  'Add a FutureProvider that loads fake doctor availability and render AsyncValue loading, error, and data states.',
              },
              {
                step: 5,
                label: 'Test',
                outcome: 'ProviderContainer tests',
                prompt:
                  'Write provider tests for TokenNotifier increment and reset behavior using ProviderContainer.',
              },
            ],
            deliverable:
              'A Riverpod token queue app with simple state, derived state, async state, and tests.',
          },
        },
        {
          id: 'm3-p3',
          type: 'Capstone',
          title: 'Instagram Clone: Provider/Riverpod Likes, Comments, and Feed Pagination',
          domain: 'State',
          duration: '1 day',
          description:
            'Upgrade the Instagram-style app so likes, comments, current profile, selected tab, and feed pagination are real managed state instead of scattered local variables.',
          tools: ['Flutter', 'Dart', 'Provider or Riverpod', 'Immutable State'],
          blueprint: {
            overview:
              'Turn the Module 2 Instagram UI into a state-managed app with predictable likes, comments, pagination, and derived counts.',
            functionalRequirements: [
              '**Likes.** Like/unlike posts and keep counts consistent.',
              '**Comments.** Add local comments to posts and derive comment count.',
              '**Pagination.** Load first fake page, load more, refresh, and show end-of-feed.',
              '**Selected tab.** Manage Home/Profile/Reels tab state clearly.',
              '**Architecture.** Keep feed logic in a controller/notifier, not in widgets.',
              '**Immutability.** Use copyWith-style updates for post state.',
            ],
            technicalImplementation: [
              '**Choice.** Use either Provider ChangeNotifier or Riverpod NotifierProvider consistently.',
              '**Models.** Create immutable `Post` and `FeedState` models.',
              '**Derived values.** Compute like count, comment count, and hasMore from source state.',
              '**Pagination guards.** Prevent duplicate load-more calls.',
              '**Testing.** Test like toggling and pagination state transitions.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Models',
                outcome: 'Immutable post/feed models',
                prompt:
                  'Create immutable Post and FeedState models with copyWith methods for an Instagram-style local feed.',
              },
              {
                step: 2,
                label: 'Controller',
                outcome: 'Feed state manager',
                prompt:
                  'Implement a FeedController using Provider or Riverpod with firstLoad, refresh, loadMore, toggleLike, and addComment methods.',
              },
              {
                step: 3,
                label: 'Connect UI',
                outcome: 'State-managed feed cards',
                prompt:
                  'Connect existing PostCard widgets to the feed controller so like and comment counts update from managed state.',
              },
              {
                step: 4,
                label: 'Pagination',
                outcome: 'Refresh and load-more feed behavior',
                prompt:
                  'Add pull-to-refresh and scroll-triggered load-more using FeedState flags for loading, error, and hasMore.',
              },
              {
                step: 5,
                label: 'Tests',
                outcome: 'State transition tests',
                prompt:
                  'Write tests for toggling likes, adding comments, first load, and preventing duplicate load-more calls.',
              },
              {
                step: 6,
                label: 'Review',
                outcome: 'Clean state architecture',
                prompt:
                  'Review the app for misplaced state, duplicated derived values, and widget methods that should live in the controller.',
              },
            ],
            deliverable:
              'An Instagram-style app whose feed, likes, comments, tabs, and pagination are managed by a clear state architecture.',
          },
        },
      ],
      quiz: [
        {
          id: 'm3-q1',
          q: 'Which state should usually stay local with `setState`?',
          options: [
            'Logged-in user used by the whole app',
            'Password visibility toggle on one form',
            'Cart items shared across screens',
            'Cached feed data after app restart',
          ],
          answer: 1,
        },
        {
          id: 'm3-q2',
          q: 'In Provider, which API is best inside a button callback when you only need to call a method?',
          options: ['context.watch', 'context.read', 'Consumer', 'Selector'],
          answer: 1,
        },
        {
          id: 'm3-q3',
          q: 'What does Riverpod `AsyncValue` help you represent?',
          options: [
            'Only successful data',
            'Only animation progress',
            'Loading, error, and data states',
            'Only widget size constraints',
          ],
          answer: 2,
        },
        {
          id: 'm3-q4',
          q: 'What is the main difference between Cubit and full Bloc?',
          options: [
            'Cubit uses methods to emit state, Bloc uses events that map to states',
            'Cubit cannot change state',
            'Bloc is only for animations',
            'Cubit works only with GetX',
          ],
          answer: 0,
        },
        {
          id: 'm3-q5',
          q: 'Why is immutable state useful?',
          options: [
            'It lets widgets ignore all changes',
            'It makes changes predictable by replacing state instead of secretly mutating it',
            'It removes the need for testing',
            'It only works for web apps',
          ],
          answer: 1,
        },
      ],
    },
    {
      id: 'm4',
      title: 'Data, Networking & Storage',
      hours: 14,
      color: 'from-cyan-500/20 to-cyan-700/10',
      accent: 'cyan',
      description:
        'HTTP, Dio, REST, GraphQL, JSON serialization, SharedPreferences, sqflite, Hive, Firebase.',
      sections: (() => {
        const commonPitfalls = [
          '**Forgetting loading state.** The user taps and nothing changes, so show a spinner or disabled button.',
          '**Trusting happy path only.** Wi-Fi, server, JSON, and permissions can fail, so design error UI first.',
          '**Doing work in build.** Network calls inside build repeat like a waiter asking your order every 2 seconds.',
          '**Leaking secrets.** API keys and tokens need secure handling, not random print statements.',
          '**Skipping models.** Raw maps spread confusion; typed Dart models make bugs easier to catch.',
          '**No empty state.** A successful request can still return zero items, so explain that clearly.',
        ]

        const topic = ({
          n,
          title,
          explain,
          analogy,
          theory,
          whyItMatters,
          steps,
          code,
          pitfalls = commonPitfalls,
          tryIt,
          takeaway,
        }) => ({
          id: `m4-t${n}`,
          title,
          explain,
          analogy,
          theory,
          whyItMatters,
          steps,
          code,
          pitfalls,
          tryIt,
          takeaway,
        })

        const topics = [
          topic({
            n: 1,
            title: 'How Mobile Apps Talk to Servers',
            explain:
              'Networking is how your Flutter app asks another computer for data, like menu items, posts, user profiles, or payment status.',
            analogy:
              'Imagine you are at Diana in Udupi. You ask for masala dosa, the waiter takes the request to the kitchen, the kitchen prepares it, and the waiter brings the response. Your app is the customer, the API is the kitchen, and HTTP is the waiter.',
            theory:
              '**Client-server** means your phone is the client and a remote machine is the server. The client sends a request; the server sends a response.\n\nA request usually has a URL, method, headers, and sometimes a body. A response usually has a status code, headers, and body data.\n\nIn Flutter, the UI should not directly know kitchen details. Keep network code in a service or repository, then let the screen simply show loading, data, or error.',
            whyItMatters:
              'Almost every serious app fetches data. Interviews often check if you understand request lifecycle, status codes, and error handling before asking about fancy UI.',
            steps: [
              'Add the package with `flutter pub add http`.',
              'Create an `ApiService` class so the screen does not become a messy hotel bill.',
              'Call the service from `initState`, a controller, or a provider, not directly inside `build`.',
              'Track **loading**, **data**, and **error** separately.',
              'Render a friendly message when the server says no or the internet disappears.',
            ],
            code: `import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class ApiService {
  Future<String> fetchWelcomeMessage() async {
    final uri = Uri.parse('https://jsonplaceholder.typicode.com/posts/1');
    final response = await http.get(uri);

    if (response.statusCode != 200) {
      throw Exception('Server returned \${response.statusCode}');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data['title'] as String;
  }
}

class ServerTalkDemo extends StatefulWidget {
  const ServerTalkDemo({super.key});

  @override
  State<ServerTalkDemo> createState() => _ServerTalkDemoState();
}

class _ServerTalkDemoState extends State<ServerTalkDemo> {
  final api = ApiService();
  String message = 'Loading from server...';

  @override
  void initState() {
    super.initState();
    api.fetchWelcomeMessage().then((value) {
      if (!mounted) return;
      setState(() => message = value);
    }).catchError((error) {
      if (!mounted) return;
      setState(() => message = 'Could not load: $error');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(message)));
  }
}`,
            tryIt:
              'Build a screen called `TodaySpecialScreen` that fetches one post title and shows it as the special dish. Now extend it to show loading, success, and error with different icons.',
            takeaway:
              'A network request is just order, kitchen, response; keep the waiter logic outside your UI plate.',
          }),
          topic({
            n: 2,
            title: 'HTTP Methods: GET, POST, PUT, PATCH, DELETE',
            explain:
              'HTTP methods are verbs that tell the server what you want to do: read, create, replace, edit, or remove.',
            analogy:
              'At a Kundapura parcel counter, asking for the menu is GET, placing a new fish curry order is POST, changing the full order is PUT, changing only spice level is PATCH, and cancelling the parcel is DELETE.',
            theory:
              '**GET** reads data and should not change server state. **POST** creates something new. **PUT** replaces a whole resource. **PATCH** changes only part of it. **DELETE** removes it.\n\nDo not choose methods based on vibes. The method is part of the contract between app and backend.\n\nA clean Flutter app often wraps these methods in friendly functions like `getPosts`, `createOrder`, or `cancelBooking`.',
            whyItMatters:
              'Wrong methods cause confusing bugs and backend arguments. Knowing the verbs makes API documentation feel less like a mysterious temple notice board.',
            steps: [
              'Use `http.get` when you only read.',
              'Use `http.post` when the app creates a new record.',
              'Send JSON body with `jsonEncode` and `Content-Type: application/json`.',
              'Check status code before trusting the response.',
              'Name service methods after user actions, not raw HTTP verbs.',
            ],
            code: `import 'dart:convert';
import 'package:http/http.dart' as http;

class ParcelApi {
  final _base = Uri.parse('https://jsonplaceholder.typicode.com');

  Future<List<dynamic>> getOrders() async {
    final res = await http.get(_base.replace(path: '/posts'));
    if (res.statusCode != 200) throw Exception('Menu list failed');
    return jsonDecode(res.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>> createOrder(String item) async {
    final res = await http.post(
      _base.replace(path: '/posts'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'title': item, 'body': 'medium spicy', 'userId': 1}),
    );

    if (res.statusCode != 201) throw Exception('Order failed');
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<void> cancelOrder(int id) async {
    final res = await http.delete(_base.replace(path: '/posts/$id'));
    if (res.statusCode >= 400) throw Exception('Cancel failed');
  }
}`,
            tryIt:
              'Create `ParcelApi` buttons for GET and POST. Print the status code beside each button, then extend it with a DELETE button for a fake order id.',
            takeaway:
              'HTTP methods are verbs; pick the verb that matches the user action.',
          }),
          topic({
            n: 3,
            title: 'Status Codes and Response Handling',
            explain:
              'Status codes are short server signals that tell whether your request worked, failed, or needs attention.',
            analogy:
              'Krishna Matha darshan queue has clear signals: entry allowed, wait, wrong gate, or closed. HTTP status codes do the same for your app.',
            theory:
              '**2xx** means success. **3xx** means redirect. **4xx** means the app or user request had a problem. **5xx** means the server side failed.\n\nYour Flutter code should never blindly decode every response. First check the status code, then decide what message the user deserves.\n\nA 404 should not look like a crash. A 500 should not blame the user. Good apps translate technical status into calm UI.',
            whyItMatters:
              'Handling status codes well makes your app feel professional even when things fail. Recruiters notice this because real apps fail daily.',
            steps: [
              'Treat `200` and `201` as common success codes.',
              'Show login or permission UI for `401` and `403`.',
              'Show not-found UI for `404`.',
              'Show retry UI for `500` and network problems.',
              'Keep status translation in one helper so every screen behaves consistently.',
            ],
            code: `import 'package:http/http.dart' as http;

class ApiFailure implements Exception {
  ApiFailure(this.message);
  final String message;

  @override
  String toString() => message;
}

String explainStatus(int code) {
  if (code >= 200 && code < 300) return 'success';
  if (code == 401) return 'Please login again.';
  if (code == 403) return 'You do not have permission.';
  if (code == 404) return 'Nothing found here.';
  if (code >= 500) return 'Server is tired. Try again.';
  return 'Request failed with status $code.';
}

Future<String> fetchBody(Uri uri) async {
  final response = await http.get(uri);
  final meaning = explainStatus(response.statusCode);

  if (meaning != 'success') {
    throw ApiFailure(meaning);
  }

  return response.body;
}`,
            tryIt:
              'Make a small status-code tester screen with chips for 200, 401, 404, and 500. Now extend it to show different colors for each family.',
            takeaway:
              'Decode the server response only after the status code has given permission.',
          }),
          topic({
            n: 4,
            title: 'Query Parameters, Headers, and Request Body',
            explain:
              'A URL can carry small filters, headers can carry metadata, and the body can carry the main payload.',
            analogy:
              'A Bengaluru darshini order has three layers: table number on the token, extra instruction like less chutney, and the actual order. Query, headers, and body are those layers.',
            theory:
              '**Query parameters** are good for filters like page, search text, or city. **Headers** are good for tokens, content type, and app version. **Body** is good for bigger data like signup forms.\n\nUse `Uri` helpers instead of hand-building URLs with string plus signs. Spaces, Kannada names, and special symbols can break manual URLs.\n\nA request body should match what the backend expects. If the backend says JSON, send JSON and set the content type.',
            whyItMatters:
              'Many beginner bugs are tiny URL mistakes. Proper `Uri` building saves you from invisible character problems.',
            steps: [
              'Use `Uri.https` or `uri.replace(queryParameters: ...)`.',
              'Put search and pagination in query parameters.',
              'Put auth token in headers.',
              'Put form data in JSON body for POST or PATCH.',
              'Log the final URI while learning, then remove sensitive logs.',
            ],
            code: `import 'dart:convert';
import 'package:http/http.dart' as http;

class SearchApi {
  Future<void> searchHotels({
    required String city,
    required String keyword,
    required String token,
  }) async {
    final uri = Uri.https(
      'example.com',
      '/api/hotels',
      {'city': city, 'q': keyword, 'page': '1'},
    );

    final response = await http.post(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'budget': 500, 'vegOnly': true}),
    );

    if (response.statusCode >= 400) {
      throw Exception('Search failed: \${response.statusCode}');
    }
  }
}`,
            tryIt:
              'Create a `HotelSearchApi` that searches `city=Udupi` and `q=breakfast`. Now extend it with `page` and `sort=rating` parameters.',
            takeaway:
              'Query filters the address, headers describe the request, body carries the parcel.',
          }),
          topic({
            n: 5,
            title: 'Futures, async, await, and Timeout',
            explain:
              'A Future is a promise that a value will arrive later; async and await let you write waiting code in a readable way.',
            analogy:
              'At a KSRTC counter, the bus to Bengaluru will not appear because you stare harder. You wait, track status, and set a limit if it is getting too late.',
            theory:
              '**async** marks a function that can pause. **await** pauses that function until the Future completes. The UI thread remains free to paint loading indicators.\n\nNetwork calls can hang. Use `timeout` so the user is not stuck forever watching a spinner with emotional damage.\n\nAlways catch errors around awaited calls. A Future can complete with data or with failure.',
            whyItMatters:
              'Async code is everywhere in Flutter: APIs, databases, file reads, permissions, and Firebase. This topic is the key to not panicking.',
            steps: [
              'Mark the method as `async`.',
              'Use `await` on the network call.',
              'Wrap it in `try` and `catch`.',
              'Add `.timeout(const Duration(seconds: 10))` for slow networks.',
              'Update UI only when the widget is still mounted.',
            ],
            code: `import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class TimeoutDemo extends StatefulWidget {
  const TimeoutDemo({super.key});

  @override
  State<TimeoutDemo> createState() => _TimeoutDemoState();
}

class _TimeoutDemoState extends State<TimeoutDemo> {
  String status = 'Tap to fetch';

  Future<void> fetchWithLimit() async {
    setState(() => status = 'Waiting for server...');
    try {
      final uri = Uri.parse('https://jsonplaceholder.typicode.com/posts/1');
      final response = await http.get(uri).timeout(const Duration(seconds: 5));
      if (!mounted) return;
      setState(() => status = 'Done: \${response.statusCode}');
    } catch (error) {
      if (!mounted) return;
      setState(() => status = 'Failed politely: $error');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(status),
        ElevatedButton(onPressed: fetchWithLimit, child: const Text('Fetch')),
      ],
    );
  }
}`,
            tryIt:
              'Build a fake bus status button that waits 2 seconds before showing Arrived. Now extend it with a timeout message.',
            takeaway:
              'Await the bus, but set a deadline before the spinner becomes furniture.',
          }),
          topic({
            n: 6,
            title: 'REST API Shape and Resource URLs',
            explain:
              'REST is a common way to organize server URLs around resources like users, orders, posts, and comments.',
            analogy:
              'Think of a Udupi hotel menu: `/dishes` lists all dishes, `/dishes/7` opens one dish, and `/dishes/7/reviews` shows reviews for that dish.',
            theory:
              'REST URLs should feel like nouns. Methods provide the action, while the path names the resource.\n\nFor example, GET `/orders` reads orders, POST `/orders` creates one, and GET `/orders/42` reads a specific order.\n\nClean URL design helps Flutter developers predict the API instead of memorizing random endpoints like secret family recipes.',
            whyItMatters:
              'When you read API docs, REST patterns help you guess where data lives. That saves time during real project onboarding.',
            steps: [
              'Identify the resource noun: posts, users, orders, products.',
              'Use plural paths for collections.',
              'Use ids for single resources.',
              'Use nested paths only when the relationship is truly owned.',
              'Keep action words out unless the backend specifically defines them.',
            ],
            code: `class Routes {
  static const base = 'https://example.com/api';

  static Uri orders() => Uri.parse('$base/orders');
  static Uri order(int id) => Uri.parse('$base/orders/$id');
  static Uri orderItems(int id) => Uri.parse('$base/orders/$id/items');
}

void main() {
  print(Routes.orders());
  print(Routes.order(42));
  print(Routes.orderItems(42));
}`,
            tryIt:
              'Write route helpers for `/restaurants`, `/restaurants/3`, and `/restaurants/3/menu`. Now extend it for reviews.',
            takeaway:
              'REST paths name the thing; HTTP methods say what to do with it.',
          }),
          topic({
            n: 7,
            title: 'JSON Basics: Decode, Read, and Guard Types',
            explain:
              'JSON is the most common format servers send to Flutter apps, and Dart reads it as maps and lists.',
            analogy:
              'A Bengaluru PG notice board may have name, rent, room type, and rules. JSON is that notice board written in a format your app can read.',
            theory:
              '**JSON decode** turns text into Dart data. Objects become maps, arrays become lists, strings stay strings, and numbers become num, int, or double.\n\nThe risky part is assuming every key exists and every type is perfect. Real backend data sometimes arrives like a hurried handwriting note.\n\nStart by decoding, then move quickly to model classes so your app is not full of `data["something"]` guessing.',
            whyItMatters:
              'Parsing JSON is a daily mobile task. If you can decode safely, you can connect almost any public API to Flutter.',
            steps: [
              'Import `dart:convert`.',
              'Use `jsonDecode(response.body)`.',
              'Cast carefully to `Map<String, dynamic>` or `List<dynamic>`.',
              'Check missing keys with defaults.',
              'Convert parsed data into model objects.',
            ],
            code: `import 'dart:convert';

void main() {
  const raw = '''
  {
    "name": "Udupi Breakfast Combo",
    "price": 80,
    "available": true
  }
  ''';

  final map = jsonDecode(raw) as Map<String, dynamic>;
  final name = map['name'] as String? ?? 'Unnamed item';
  final price = map['price'] as int? ?? 0;
  final available = map['available'] as bool? ?? false;

  print('$name costs Rs $price');
  print(available ? 'Ready to order' : 'Sold out');
}`,
            tryIt:
              'Decode a JSON string for a Kundapura fish meal with name, price, and spiceLevel. Now extend it with a missing discount field and provide a default.',
            takeaway:
              'JSON is server handwriting; read it carefully before trusting it.',
          }),
          topic({
            n: 8,
            title: 'Model Classes and fromJson',
            explain:
              'Model classes turn loose JSON maps into typed Dart objects your app can safely use.',
            analogy:
              'At an Udupi banana-leaf meal, every compartment has a known place. A model class gives each JSON field its own clean compartment.',
            theory:
              'A model class defines the shape of data. Instead of passing raw maps everywhere, you create objects like `Dish`, `Post`, or `User`.\n\n`fromJson` reads server data into a model. `toJson` writes your model back into a map for sending or storing.\n\nGood models make UI code calmer because `dish.name` is easier to understand than `dishMap["name"]` repeated everywhere.',
            whyItMatters:
              'Typed models reduce runtime surprises and make refactoring safer. They are basic professional Flutter hygiene.',
            steps: [
              'Create a class with final fields.',
              'Add a constructor with required values.',
              'Write `factory ClassName.fromJson(Map<String, dynamic> json)`.',
              'Add `toJson` when you need to send or store data.',
              'Keep default values sensible for optional fields.',
            ],
            code: `class Dish {
  const Dish({
    required this.id,
    required this.name,
    required this.price,
    required this.isAvailable,
  });

  final int id;
  final String name;
  final int price;
  final bool isAvailable;

  factory Dish.fromJson(Map<String, dynamic> json) {
    return Dish(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? 'Unnamed dish',
      price: json['price'] as int? ?? 0,
      isAvailable: json['isAvailable'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'isAvailable': isAvailable,
    };
  }
}`,
            tryIt:
              'Create a `BusTrip` model with fromJson for route, fare, and seatsLeft. Now extend it with `toJson`.',
            takeaway:
              'Raw JSON is grocery items; a model class packs them into labeled boxes.',
          }),
          topic({
            n: 9,
            title: 'Nested JSON and Lists',
            explain:
              'Real API data often contains lists inside objects and objects inside objects, like posts with comments or orders with items.',
            analogy:
              'A Kundapura wedding lunch is not one item; it has rows of dishes, sweets, pickle, and refills. Nested JSON is that full lunch structure.',
            theory:
              'Nested JSON needs layered parsing. Parse the outer object first, then map each inner list item into its own model.\n\nUse `.map(...).toList()` to convert a list of raw JSON objects into typed Dart objects.\n\nDo not parse everything in the widget. Keep nested parsing inside model factories or repositories.',
            whyItMatters:
              'Feeds, carts, bookings, invoices, and chat screens all use nested data. Learning this early prevents spaghetti parsing.',
            steps: [
              'Model the inner object first.',
              'Model the outer object second.',
              'Cast the raw list as `List<dynamic>?` safely.',
              'Map each item with the inner `fromJson`.',
              'Return an empty list if the server omits the array.',
            ],
            code: `class OrderItem {
  const OrderItem({required this.name, required this.qty});
  final String name;
  final int qty;

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      name: json['name'] as String? ?? 'Item',
      qty: json['qty'] as int? ?? 1,
    );
  }
}

class FoodOrder {
  const FoodOrder({required this.id, required this.items});
  final int id;
  final List<OrderItem> items;

  factory FoodOrder.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    return FoodOrder(
      id: json['id'] as int? ?? 0,
      items: rawItems
          .map((item) => OrderItem.fromJson(item as Map<String, dynamic>))
          .toList(),
    );
  }
}`,
            tryIt:
              'Create a `TravelPlan` model with a list of `Stop` objects: Udupi, Kundapura, Bengaluru. Now extend it with total fare.',
            takeaway:
              'Parse nested JSON one floor at a time; do not jump from ground floor to terrace.',
          }),
          topic({
            n: 10,
            title: 'json_serializable for Generated Models',
            explain:
              'json_serializable generates fromJson and toJson code so you avoid hand-writing boring conversion code.',
            analogy:
              'At an MTR breakfast assembly line, one person does idli, one does chutney, one does billing. Code generation is the helper who repeats the boring part perfectly.',
            theory:
              'Manual JSON code is fine for small apps. For bigger projects, generated serialization reduces typo bugs and keeps models consistent.\n\nYou annotate a class, run a build command, and Dart creates a `.g.dart` file with conversion helpers.\n\nGenerated code is not magic; it is just automated typing. You still design the model correctly.',
            whyItMatters:
              'Production apps have many models. Code generation saves time and avoids one-letter key mistakes that waste afternoons.',
            steps: [
              'Add packages: `flutter pub add json_annotation`.',
              'Add dev packages: `flutter pub add dev:build_runner dev:json_serializable`.',
              'Annotate the model with `@JsonSerializable()`.',
              'Add `part "dish.g.dart";` to the file.',
              'Run `dart run build_runner build --delete-conflicting-outputs`.',
            ],
            code: `import 'package:json_annotation/json_annotation.dart';

part 'dish.g.dart';

@JsonSerializable()
class Dish {
  const Dish({
    required this.id,
    required this.name,
    required this.price,
  });

  final int id;
  final String name;
  final int price;

  factory Dish.fromJson(Map<String, dynamic> json) => _$DishFromJson(json);
  Map<String, dynamic> toJson() => _$DishToJson(this);
}

// Run:
// dart run build_runner build --delete-conflicting-outputs`,
            tryIt:
              'Convert your manual `Dish` model to json_serializable. Now extend it with `rating` and regenerate.',
            takeaway:
              'Let generators do the repetitive kitchen chopping; you still choose the recipe.',
          }),
          topic({
            n: 11,
            title: 'Dio Setup and Interceptors',
            explain:
              'Dio is a powerful HTTP client for Flutter with interceptors, cancellation, timeout settings, and cleaner configuration.',
            analogy:
              'A Bengaluru food-delivery startup does not send every rider with fresh instructions. It gives standard bag, route rules, and phone script. Dio centralizes those rules.',
            theory:
              'The `http` package is simple and excellent for basics. Dio is useful when your app needs shared base URL, auth headers, retries, file upload, logs, or interceptors.\n\nAn interceptor can run before the request, after the response, or when an error occurs. This is perfect for attaching tokens and logging API problems.\n\nKeep one configured Dio instance and inject it into services.',
            whyItMatters:
              'Many companies use Dio in production Flutter apps. Understanding interceptors helps with auth, debugging, and clean architecture.',
            steps: [
              'Add Dio with `flutter pub add dio`.',
              'Create one Dio client with base URL and timeout.',
              'Add an interceptor for auth and logs.',
              'Use services to call endpoints.',
              'Avoid creating a new Dio object for every button tap.',
            ],
            code: `import 'package:dio/dio.dart';

class DioClient {
  DioClient(String token)
      : dio = Dio(
          BaseOptions(
            baseUrl: 'https://jsonplaceholder.typicode.com',
            connectTimeout: const Duration(seconds: 8),
            receiveTimeout: const Duration(seconds: 8),
          ),
        ) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          options.headers['Authorization'] = 'Bearer $token';
          return handler.next(options);
        },
        onError: (error, handler) {
          print('API failed: \${error.message}');
          return handler.next(error);
        },
      ),
    );
  }

  final Dio dio;
}`,
            tryIt:
              'Create a `DioClient` for a restaurant API. Now extend the interceptor to add `X-App-Version` header.',
            takeaway:
              'Dio interceptors are the common instruction sheet for every API trip.',
          }),
          topic({
            n: 12,
            title: 'Dio Error Handling and Retries',
            explain:
              'Dio gives structured errors so you can distinguish timeout, bad response, cancellation, and connection failures.',
            analogy:
              'If a bus from Kundapura to Bengaluru is late, cancelled, full, or stuck in traffic, each problem needs a different response. API failures are the same.',
            theory:
              '`DioException` contains a type, response, request options, and message. Use that data to create user-friendly messages.\n\nRetry only when retrying makes sense. A timeout or temporary network issue may deserve retry; a wrong password does not.\n\nKeep retry rules limited so the app does not hammer the server like an impatient doorbell.',
            whyItMatters:
              'Good retry behavior improves real user experience on weak networks without hiding actual bugs.',
            steps: [
              'Catch `DioException` separately.',
              'Convert exception type into a readable message.',
              'Retry timeout or connection errors a small number of times.',
              'Do not retry validation errors like 400.',
              'Show retry button in UI after final failure.',
            ],
            code: `import 'package:dio/dio.dart';

String friendlyDioError(DioException error) {
  switch (error.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.receiveTimeout:
      return 'Network is slow. Try again.';
    case DioExceptionType.badResponse:
      final code = error.response?.statusCode;
      return 'Server replied with $code.';
    case DioExceptionType.cancel:
      return 'Request was cancelled.';
    default:
      return 'Could not connect. Check internet.';
  }
}

Future<Response<dynamic>> getWithOneRetry(Dio dio, String path) async {
  try {
    return await dio.get(path);
  } on DioException catch (error) {
    if (error.type == DioExceptionType.connectionTimeout) {
      return dio.get(path);
    }
    throw Exception(friendlyDioError(error));
  }
}`,
            tryIt:
              'Write a helper that converts Dio errors into Kannada-English friendly messages. Now extend it with one retry for connection timeout.',
            takeaway:
              'Retry late buses, not wrong tickets.',
          }),
          topic({
            n: 13,
            title: 'Repository Pattern for Data',
            explain:
              'A repository hides where data comes from so UI can ask for meaning instead of caring about HTTP, cache, or database details.',
            analogy:
              'If your cousin asks for Kundapura chicken sukka, they do not care whether you bought masala from the market or made it at home. They care that dinner arrives.',
            theory:
              'A repository sits between UI/state management and data sources. It can call remote API, local cache, database, or Firebase.\n\nScreens should call `menuRepository.getDishes()` instead of constructing URLs and parsing JSON.\n\nThis separation makes testing easier because you can replace the real repository with a fake one.',
            whyItMatters:
              'Clean data boundaries are a major step from beginner Flutter to job-ready Flutter.',
            steps: [
              'Create a model class.',
              'Create a remote API class.',
              'Create a repository that uses the API.',
              'Expose friendly methods like `getMenu` or `saveOrder`.',
              'Inject the repository into Provider, Riverpod, or Bloc.',
            ],
            code: `class Dish {
  const Dish(this.name, this.price);
  final String name;
  final int price;
}

abstract class MenuRepository {
  Future<List<Dish>> getDishes();
}

class RemoteMenuRepository implements MenuRepository {
  @override
  Future<List<Dish>> getDishes() async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    return const [
      Dish('Neer dosa', 60),
      Dish('Kori rotti', 140),
      Dish('Filter coffee', 25),
    ];
  }
}

class FakeMenuRepository implements MenuRepository {
  @override
  Future<List<Dish>> getDishes() async => const [Dish('Test idli', 1)];
}`,
            tryIt:
              'Create `BusRepository` with a fake implementation that returns Udupi to Bengaluru trips. Now extend it with a remote implementation later.',
            takeaway:
              'UI asks the repository for food; it should not inspect the kitchen.',
          }),
          topic({
            n: 14,
            title: 'Pagination and Infinite Scroll',
            explain:
              'Pagination loads data in pages so your app does not download the whole world at once.',
            analogy:
              'At Bengaluru Metro, people enter in manageable groups. Nobody opens one gate and sends all of Majestic through at once.',
            theory:
              'Large lists need pagination for speed, memory, and server safety. The app asks for page 1, then page 2 when the user nears the bottom.\n\nTrack `items`, `page`, `isLoading`, `hasMore`, and `error`. These flags prevent duplicate requests and endless loading.\n\nCursor pagination is often better than page numbers for feeds because new items can appear while the user scrolls.',
            whyItMatters:
              'Feeds, search results, product lists, and chat history all need pagination. It is a common interview and production topic.',
            steps: [
              'Start with `page = 1` and empty items.',
              'Fetch the first page during screen load.',
              'Listen to scroll position.',
              'When near bottom, load next page if not already loading.',
              'Stop when the server returns fewer items or says no more.',
            ],
            code: `class FeedPager {
  int page = 1;
  bool isLoading = false;
  bool hasMore = true;
  final List<String> posts = [];

  Future<void> loadNext() async {
    if (isLoading || !hasMore) return;
    isLoading = true;

    await Future<void>.delayed(const Duration(milliseconds: 500));
    final newPosts = List.generate(10, (i) => 'Post \${(page - 1) * 10 + i + 1}');

    posts.addAll(newPosts);
    page++;
    hasMore = page <= 5;
    isLoading = false;
  }
}`,
            tryIt:
              'Build a fake feed pager that loads 10 posts at a time. Now extend it to stop after 30 posts and show End of feed.',
            takeaway:
              'Load the next bus when passengers reach the platform, not all buses at sunrise.',
          }),
          topic({
            n: 15,
            title: 'Pull to Refresh and Cache Refresh',
            explain:
              'Pull to refresh lets users manually ask for the latest data while your app manages old cached data safely.',
            analogy:
              'A Bengaluru darshini changes today special. The old board helps until someone wipes and writes the fresh item.',
            theory:
              'Refresh is not the same as first load. First load may show a full-screen spinner; refresh can keep old data visible while fetching new data.\n\nA nice app keeps stale data on screen and shows a smaller refresh indicator. If refresh fails, keep old data and show a gentle message.\n\nThis pattern is called stale-while-revalidate in many apps.',
            whyItMatters:
              'Users hate blank screens when they already had data. Refresh strategy makes the app feel stable.',
            steps: [
              'Use `RefreshIndicator` around a scrollable.',
              'Keep existing items while refresh runs.',
              'Replace items only when fresh data succeeds.',
              'Show a snackbar if refresh fails.',
              'Reset pagination when refreshing list screens.',
            ],
            code: `import 'package:flutter/material.dart';

class RefreshDemo extends StatefulWidget {
  const RefreshDemo({super.key});

  @override
  State<RefreshDemo> createState() => _RefreshDemoState();
}

class _RefreshDemoState extends State<RefreshDemo> {
  List<String> items = ['Old dosa', 'Old coffee'];

  Future<void> refresh() async {
    await Future<void>.delayed(const Duration(seconds: 1));
    setState(() {
      items = ['Fresh neer dosa', 'Fresh coffee', 'Fresh buns'];
    });
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: refresh,
      child: ListView(
        children: items.map((item) => ListTile(title: Text(item))).toList(),
      ),
    );
  }
}`,
            tryIt:
              'Create a menu list with pull to refresh. Now extend it so refresh failure keeps the old list and shows a snackbar.',
            takeaway:
              'Refresh should update the board, not burn down the hotel.',
          }),
          topic({
            n: 16,
            title: 'GraphQL Basics',
            explain:
              'GraphQL lets the app ask for exactly the fields it needs instead of receiving fixed REST responses.',
            analogy:
              'At an Udupi meal, you can say only sambar and palya today. GraphQL is that specific plate request instead of accepting the full default meal.',
            theory:
              'GraphQL uses a single endpoint where you send a query describing the data shape. The response matches the query shape.\n\nIt is useful when screens need different combinations of fields. But it adds schema, tooling, and caching decisions.\n\nFlutter can use packages like `graphql_flutter`, but the concept matters more than the package first.',
            whyItMatters:
              'Some modern apps use GraphQL for flexible feeds, dashboards, and profile screens. Knowing the idea helps you adapt quickly.',
            steps: [
              'Add `graphql_flutter` when your project needs it.',
              'Create a GraphQL client with endpoint and auth.',
              'Write a query string with only needed fields.',
              'Run it using a query widget or repository.',
              'Handle loading, error, and data just like REST.',
            ],
            code: `const String dishesQuery = r'''
query GetDishes {
  dishes {
    id
    name
    price
  }
}
''';

class DishSummary {
  const DishSummary({required this.id, required this.name, required this.price});
  final String id;
  final String name;
  final int price;

  factory DishSummary.fromJson(Map<String, dynamic> json) {
    return DishSummary(
      id: json['id'] as String,
      name: json['name'] as String,
      price: json['price'] as int,
    );
  }
}`,
            tryIt:
              'Write a GraphQL query string for user id, name, and photoUrl. Now extend it with posts containing caption and likeCount.',
            takeaway:
              'GraphQL lets the screen order exactly the fields it can eat.',
          }),
          topic({
            n: 17,
            title: 'SharedPreferences for Tiny Local Values',
            explain:
              'SharedPreferences stores small key-value data like theme choice, onboarding seen, or last selected city.',
            analogy:
              'A Namma Metro smart card remembers balance and trips. SharedPreferences remembers tiny app preferences, not your entire family history.',
            theory:
              'Use SharedPreferences for small simple values: bool, int, double, string, and string list. It is not a database.\n\nGood examples are dark mode, language selection, and whether the user completed onboarding.\n\nDo not store sensitive tokens here unless your security requirements allow it. For secrets, consider secure storage.',
            whyItMatters:
              'Small persistence makes apps feel personal. Users expect settings to stay after closing the app.',
            steps: [
              'Add `shared_preferences`.',
              'Get an instance with `SharedPreferences.getInstance()`.',
              'Save values with `setBool`, `setString`, or similar.',
              'Read values during app startup or controller init.',
              'Use clear key names like `settings.city`.',
            ],
            code: `import 'package:shared_preferences/shared_preferences.dart';

class SettingsStore {
  static const _cityKey = 'settings.city';
  static const _darkKey = 'settings.darkMode';

  Future<void> saveCity(String city) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_cityKey, city);
  }

  Future<String> loadCity() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_cityKey) ?? 'Udupi';
  }

  Future<void> setDarkMode(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_darkKey, value);
  }
}`,
            tryIt:
              'Save the user preferred city as Udupi, Kundapura, or Bengaluru. Now extend it to remember dark mode.',
            takeaway:
              'SharedPreferences is a pocket notebook, not a warehouse.',
          }),
          topic({
            n: 18,
            title: 'Secure Storage for Tokens',
            explain:
              'Secure storage protects sensitive values like login tokens better than normal preferences.',
            analogy:
              'You can write grocery items on a fridge magnet, but you keep house keys in a locked drawer. Tokens deserve the locked drawer.',
            theory:
              'Authentication tokens can let someone access user data. Treat them carefully.\n\n`flutter_secure_storage` uses platform security features like Keychain on iOS and encrypted storage on Android.\n\nStill avoid printing tokens, committing test tokens, or sending them to random logs. Storage is only one part of security.',
            whyItMatters:
              'Bad token handling is a serious production risk. Even junior developers are expected to know the basics.',
            steps: [
              'Add `flutter_secure_storage`.',
              'Create one wrapper service.',
              'Write token after login succeeds.',
              'Read token when adding auth headers.',
              'Delete token during logout.',
            ],
            code: `import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStore {
  const TokenStore(this.storage);
  final FlutterSecureStorage storage;

  static const _tokenKey = 'auth.token';

  Future<void> saveToken(String token) {
    return storage.write(key: _tokenKey, value: token);
  }

  Future<String?> readToken() {
    return storage.read(key: _tokenKey);
  }

  Future<void> clearToken() {
    return storage.delete(key: _tokenKey);
  }
}`,
            tryIt:
              'Create login and logout buttons that write and delete a fake token. Now extend it to read the token before calling an API.',
            takeaway:
              'Preferences remember choices; secure storage guards keys.',
          }),
          topic({
            n: 19,
            title: 'sqflite for Relational Local Database',
            explain:
              'sqflite stores structured local data in tables, useful for offline records, history, and searchable lists.',
            analogy:
              'A Kundapura fishing co-op ledger has rows, columns, ids, dates, and totals. sqflite is that ledger inside your phone.',
            theory:
              'SQLite is a small relational database. You create tables, insert rows, query rows, update rows, and delete rows.\n\nUse it when data has structure and relationships. Example: customers, orders, order items, and payments.\n\nDo not place SQL directly all over widgets. Keep database code inside a database helper or repository.',
            whyItMatters:
              'Offline-first apps often need local databases. Knowing SQLite makes you useful for field apps, billing apps, and inventory apps.',
            steps: [
              'Add `sqflite` and `path` packages.',
              'Open a database with a version number.',
              'Create tables in `onCreate`.',
              'Write helper methods for insert and query.',
              'Plan migrations before changing tables.',
            ],
            code: `import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class CatchDb {
  Future<Database> open() async {
    final root = await getDatabasesPath();
    final path = join(root, 'catch.db');

    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) {
        return db.execute('''
          CREATE TABLE catches(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fish TEXT NOT NULL,
            kilos REAL NOT NULL
          )
        ''');
      },
    );
  }

  Future<int> insertCatch(String fish, double kilos) async {
    final db = await open();
    return db.insert('catches', {'fish': fish, 'kilos': kilos});
  }
}`,
            tryIt:
              'Create a `notes` table with id and text. Now extend it with createdAt and a query method.',
            takeaway:
              'sqflite is your phone-side ledger with rows, columns, and responsibility.',
          }),
          topic({
            n: 20,
            title: 'Hive for Fast Local Boxes',
            explain:
              'Hive is a fast local key-value database that is friendly for Flutter apps needing offline lists and cached objects.',
            analogy:
              'A Bengaluru PG shoe rack has labeled boxes: each person keeps items in their own space. Hive boxes store app data in named compartments.',
            theory:
              'Hive stores data in boxes. A box can hold key-value pairs and can be fast for simple offline data.\n\nIt is less relational than SQLite. If you need joins and complex queries, SQLite may fit better. If you need fast cached objects, Hive can feel simpler.\n\nFor custom objects, Hive needs adapters. For simple maps and strings, setup is lighter.',
            whyItMatters:
              'Hive is popular in Flutter for offline cache, settings, and small local collections.',
            steps: [
              'Add Hive packages.',
              'Initialize Hive before running the app.',
              'Open a named box.',
              'Put and get values by key.',
              'Close boxes when appropriate.',
            ],
            code: `import 'package:hive_flutter/hive_flutter.dart';

class RecentSearchStore {
  static const boxName = 'recent_searches';

  Future<void> init() async {
    await Hive.initFlutter();
    await Hive.openBox<String>(boxName);
  }

  Future<void> saveSearch(String text) async {
    final box = Hive.box<String>(boxName);
    await box.put(DateTime.now().toIso8601String(), text);
  }

  List<String> allSearches() {
    final box = Hive.box<String>(boxName);
    return box.values.toList().reversed.toList();
  }
}`,
            tryIt:
              'Store recent searches like Udupi lunch and Bengaluru metro. Now extend it to clear all searches.',
            takeaway:
              'Hive boxes are quick labeled shelves for local app data.',
          }),
          topic({
            n: 21,
            title: 'Choosing SharedPreferences, Hive, sqflite, or Secure Storage',
            explain:
              'Different storage tools solve different problems; choosing the wrong one makes the app either weak or overcomplicated.',
            analogy:
              'You do not book a Volvo bus from Diana in Udupi to the next street, and you do not carry a Kundapura wedding lunch in your shirt pocket. Storage tools also need the right vehicle.',
            theory:
              'Use SharedPreferences for tiny non-secret settings. Use secure storage for secrets. Use Hive for fast local boxes and cache. Use sqflite when you need tables, relationships, and queries.\n\nThe best tool is the smallest one that safely carries the data. Overengineering makes simple tasks annoying; underengineering makes serious data fragile.\n\nBefore choosing, ask: how big is the data, is it secret, does it need search, does it need relations, and must it work offline?',
            whyItMatters:
              'Tool choice affects performance, security, and future maintenance. This decision shows maturity.',
            steps: [
              'List what data you need to store.',
              'Mark whether each value is secret.',
              'Mark whether it is tiny, list-like, or relational.',
              'Choose the simplest safe storage tool.',
              'Document the choice so the team does not mix five styles randomly.',
            ],
            code: `enum StorageChoice {
  preferences,
  secureStorage,
  hive,
  sqlite,
}

StorageChoice chooseStorage({
  required bool isSecret,
  required bool isTinySetting,
  required bool needsRelationalQueries,
}) {
  if (isSecret) return StorageChoice.secureStorage;
  if (isTinySetting) return StorageChoice.preferences;
  if (needsRelationalQueries) return StorageChoice.sqlite;
  return StorageChoice.hive;
}

void main() {
  final cityChoice = chooseStorage(
    isSecret: false,
    isTinySetting: true,
    needsRelationalQueries: false,
  );
  print(cityChoice);
}`,
            tryIt:
              'Make a table of five values: auth token, theme, cached posts, order items, recent searches. Choose storage for each and explain why.',
            takeaway:
              'Pick the smallest storage vehicle that safely carries the baggage.',
          }),
          topic({
            n: 22,
            title: 'Offline-First Cache Strategy',
            explain:
              'Offline-first means the app can show useful data even when the network is weak or unavailable.',
            analogy:
              'During monsoon near coastal Karnataka, shops keep backup stock because roads may flood. Offline cache is backup stock for your app.',
            theory:
              'A cache stores a copy of remote data locally. The app can show cached data immediately, then refresh from the network in the background.\n\nYou need freshness rules. Some data can be old for hours, like restaurant photos. Some data must be fresh, like payment status.\n\nA good offline-first flow is: read cache, show cache, fetch network, update cache, refresh UI.',
            whyItMatters:
              'Indian mobile networks are not always perfect. Offline-friendly apps feel reliable in buses, basements, and rainy evenings.',
            steps: [
              'Decide which data can be cached.',
              'Store cached data with a timestamp.',
              'Show cached data immediately if available.',
              'Fetch fresh data in the background.',
              'Update cache and UI when fresh data arrives.',
            ],
            code: `class CachedMenu {
  const CachedMenu({required this.items, required this.savedAt});
  final List<String> items;
  final DateTime savedAt;

  bool get isFresh {
    final age = DateTime.now().difference(savedAt);
    return age.inMinutes < 30;
  }
}

Future<List<String>> loadMenuOfflineFirst({
  required Future<CachedMenu?> Function() readCache,
  required Future<List<String>> Function() fetchRemote,
  required Future<void> Function(List<String>) saveCache,
}) async {
  final cached = await readCache();
  if (cached != null && cached.isFresh) return cached.items;

  final fresh = await fetchRemote();
  await saveCache(fresh);
  return fresh;
}`,
            tryIt:
              'Create an offline-first menu loader with fake cache and fake network. Now extend it with a stale data banner.',
            takeaway:
              'Cache first for speed, network next for freshness.',
          }),
          topic({
            n: 23,
            title: 'Streams for Live Data',
            explain:
              'A Stream sends many values over time, useful for live updates like chat, location, timers, or database changes.',
            analogy:
              'Sringeri temple bell sequence is not one sound; it rings over time. A Stream is data ringing again and again.',
            theory:
              'A Future gives one result. A Stream can give zero, one, many, or endless results.\n\nFlutter has `StreamBuilder` for showing stream values in the UI. You provide the stream and build different UI for waiting, error, and data.\n\nAlways understand whether your stream ends and whether you need to cancel subscriptions.',
            whyItMatters:
              'Firebase, sockets, timers, and local database watchers often use streams. This is the door to realtime apps.',
            steps: [
              'Create or receive a `Stream<T>`.',
              'Use `StreamBuilder<T>` in UI.',
              'Handle waiting state.',
              'Handle error state.',
              'Render the latest snapshot data.',
            ],
            code: `import 'package:flutter/material.dart';

class TokenStreamDemo extends StatelessWidget {
  const TokenStreamDemo({super.key});

  Stream<int> tokenStream() async* {
    for (var token = 1; token <= 5; token++) {
      await Future<void>.delayed(const Duration(seconds: 1));
      yield token;
    }
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<int>(
      stream: tokenStream(),
      builder: (context, snapshot) {
        if (snapshot.hasError) return Text('Error: \${snapshot.error}');
        if (!snapshot.hasData) return const Text('Waiting for token...');
        return Text('Now serving token \${snapshot.data}');
      },
    );
  }
}`,
            tryIt:
              'Create a stream that emits bus stop names: Udupi, Kundapura, Bengaluru. Now extend it with a Done message when the stream completes.',
            takeaway:
              'Future is one parcel; Stream is a moving queue of parcels.',
          }),
          topic({
            n: 24,
            title: 'StreamSubscription and Cancellation',
            explain:
              'When you manually listen to a stream, you must cancel the subscription when the widget or controller is done.',
            analogy:
              'If you subscribe to temple bell announcements, you should stop listening when you leave. Otherwise your phone keeps buzzing after you reached home.',
            theory:
              '`StreamBuilder` handles subscription cleanup for you. But when you call `.listen`, you own the `StreamSubscription`.\n\nCancel subscriptions in `dispose` for StatefulWidgets or controller cleanup methods. This prevents memory leaks and duplicate updates.\n\nLeaks are especially painful with location, sockets, and long-running timers.',
            whyItMatters:
              'Memory leaks make apps slow and unpredictable. Knowing cancellation is part of responsible async programming.',
            steps: [
              'Store the subscription in a field.',
              'Assign it when calling `.listen`.',
              'Update state only if mounted.',
              'Cancel in `dispose`.',
              'Avoid creating multiple listeners accidentally.',
            ],
            code: `import 'dart:async';
import 'package:flutter/material.dart';

class BellListener extends StatefulWidget {
  const BellListener({super.key});

  @override
  State<BellListener> createState() => _BellListenerState();
}

class _BellListenerState extends State<BellListener> {
  StreamSubscription<int>? subscription;
  int count = 0;

  @override
  void initState() {
    super.initState();
    subscription = Stream.periodic(const Duration(seconds: 1), (i) => i).listen((value) {
      if (mounted) setState(() => count = value);
    });
  }

  @override
  void dispose() {
    subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Text('Bell count: $count');
}`,
            tryIt:
              'Create a timer subscription that updates every second. Now extend it with a stop button that cancels the subscription early.',
            takeaway:
              'If you start listening manually, you must leave the hall politely.',
          }),
          topic({
            n: 25,
            title: 'Firebase Setup: Auth, Firestore, and Storage',
            explain:
              'Firebase gives ready-made backend services for login, realtime database, file storage, analytics, and notifications.',
            analogy:
              'A Bengaluru startup can rent a cloud kitchen instead of building a full hotel from scratch. Firebase is that cloud kitchen for backend features.',
            theory:
              'Firebase can speed up app development because it provides hosted services. Flutter apps commonly use Firebase Auth, Cloud Firestore, and Firebase Storage.\n\nSetup involves a Firebase project, platform configuration files, packages, and initialization before `runApp`.\n\nFirebase is powerful, but still design your data model, security rules, and error states carefully.',
            whyItMatters:
              'Many Flutter jobs and prototypes use Firebase. Knowing the setup flow lets you build real apps faster.',
            steps: [
              'Install Firebase CLI and FlutterFire CLI.',
              'Run `flutterfire configure` in the Flutter project.',
              'Add needed packages like `firebase_core` and `firebase_auth`.',
              'Initialize Firebase before `runApp`.',
              'Add one feature at a time: Auth, then Firestore, then Storage.',
            ],
            code: `import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Firebase ready')),
        body: const Center(child: Text('Backend cloud kitchen is open')),
      ),
    );
  }
}`,
            tryIt:
              'Create a fresh Firebase project and connect a Flutter app using FlutterFire CLI. Now extend it by adding Firebase Auth package.',
            takeaway:
              'Firebase gives you backend services, but you still own the recipe and rules.',
          }),
          topic({
            n: 26,
            title: 'Firestore CRUD and Realtime Lists',
            explain:
              'Cloud Firestore stores documents in collections and can stream realtime updates to your Flutter UI.',
            analogy:
              'A Manipal hospital token board updates as soon as the next patient is called. Firestore streams can update your app with the same live feeling.',
            theory:
              'Firestore data is organized as collections and documents. A collection contains documents; each document contains fields.\n\nCRUD means create, read, update, delete. Firestore supports one-time reads and realtime streams.\n\nSecurity rules matter. Never assume client-side code alone protects your database.',
            whyItMatters:
              'Firestore is a fast way to build chats, feeds, booking lists, and admin dashboards with realtime updates.',
            steps: [
              'Add `cloud_firestore`.',
              'Write a document with `.add` or `.set`.',
              'Read collections with `.get` for one-time reads.',
              'Use `.snapshots()` for realtime streams.',
              'Write security rules before real users arrive.',
            ],
            code: `import 'package:cloud_firestore/cloud_firestore.dart';

class TokenRepository {
  TokenRepository(this.db);
  final FirebaseFirestore db;

  CollectionReference<Map<String, dynamic>> get tokens => db.collection('tokens');

  Future<void> createToken(String name) {
    return tokens.add({
      'name': name,
      'status': 'waiting',
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  Stream<QuerySnapshot<Map<String, dynamic>>> watchTokens() {
    return tokens.orderBy('createdAt').snapshots();
  }

  Future<void> markDone(String id) {
    return tokens.doc(id).update({'status': 'done'});
  }
}`,
            tryIt:
              'Create a Firestore collection called `posts` with caption and likeCount. Now extend it with a stream that watches posts ordered by time.',
            takeaway:
              'Firestore collections are live notice boards when you use snapshots.',
          }),
          topic({
            n: 27,
            title: 'File Uploads and Image Storage',
            explain:
              'File upload sends local files like photos to remote storage and saves the resulting URL in your database.',
            analogy:
              'For a Kundapura fish market listing, the photo goes to the display board storage, while the price and seller details go to the ledger.',
            theory:
              'Apps usually store the file in object storage and store metadata in a database. For Firebase, photos go to Firebase Storage and URLs can be saved in Firestore.\n\nUploads need progress, error handling, file size checks, and permission handling.\n\nDo not upload huge images blindly. Compress or resize when appropriate to save data and money.',
            whyItMatters:
              'Profiles, posts, receipts, restaurant menus, and marketplace apps all need uploads.',
            steps: [
              'Pick an image using an image picker package.',
              'Check file size and type.',
              'Upload the file to storage.',
              'Get the download URL.',
              'Save the URL with the related database document.',
            ],
            code: `import 'dart:io';
import 'package:firebase_storage/firebase_storage.dart';

class PhotoUploader {
  PhotoUploader(this.storage);
  final FirebaseStorage storage;

  Future<String> uploadPostPhoto({
    required File file,
    required String userId,
  }) async {
    final name = DateTime.now().millisecondsSinceEpoch;
    final ref = storage.ref('users/$userId/posts/$name.jpg');

    final task = await ref.putFile(
      file,
      SettableMetadata(contentType: 'image/jpeg'),
    );

    return task.ref.getDownloadURL();
  }
}`,
            tryIt:
              'Write a fake upload service that returns a URL after 2 seconds. Now extend it to show progress from 0 to 100 percent.',
            takeaway:
              'Upload the photo to storage, save the address in the database.',
          }),
          topic({
            n: 28,
            title: 'Data Layer Testing and Mock APIs',
            explain:
              'Testing data code means proving your app handles success, failure, bad JSON, and offline cases without touching real servers every time.',
            analogy:
              'Before serving a full Bengaluru lunch rush, a darshini tests chutney, cash counter, and token system quietly. Mock APIs are that rehearsal.',
            theory:
              'Repositories are easy to test when dependencies are injected. Give the repository a fake client and verify the result.\n\nTest success responses, error responses, malformed JSON, timeout behavior, and cache fallback.\n\nAvoid tests that depend on live public APIs. They can fail because of network, rate limits, or someone else changing data.',
            whyItMatters:
              'Data bugs can break entire apps. Tests give confidence before release and before refactoring.',
            steps: [
              'Keep data parsing in small functions.',
              'Inject API clients and stores.',
              'Use fake implementations in tests.',
              'Test one behavior per test.',
              'Cover failure cases, not just the happy idli plate.',
            ],
            code: `class FakeMenuApi {
  FakeMenuApi({required this.shouldFail});
  final bool shouldFail;

  Future<List<String>> fetchMenu() async {
    if (shouldFail) throw Exception('Network failed');
    return ['Idli', 'Dosa', 'Coffee'];
  }
}

class MenuRepository {
  MenuRepository(this.api);
  final FakeMenuApi api;

  Future<List<String>> getMenu() async {
    try {
      return await api.fetchMenu();
    } catch (_) {
      return ['Cached neer dosa'];
    }
  }
}

Future<void> main() async {
  final repo = MenuRepository(FakeMenuApi(shouldFail: true));
  final menu = await repo.getMenu();
  assert(menu.first == 'Cached neer dosa');
}`,
            tryIt:
              'Write tests for success and failure in `MenuRepository`. Now extend it with a bad JSON test for your model parser.',
            takeaway:
              'Test the kitchen before the lunch crowd arrives.',
          }),
        ]

        return [
          {
            id: 'm4-s1',
            title: 'HTTP, REST, and Request Lifecycle',
            topics: topics.slice(0, 6),
          },
          {
            id: 'm4-s2',
            title: 'JSON, Models, and API Architecture',
            topics: topics.slice(6, 16),
          },
          {
            id: 'm4-s3',
            title: 'Local Storage and Offline Data',
            topics: topics.slice(16, 22),
          },
          {
            id: 'm4-s4',
            title: 'Streams, Firebase, Uploads, and Testing',
            topics: topics.slice(22, 28),
          },
        ]
      })(),
      projects: [
        {
          id: 'm4-p1',
          type: 'Mini Project',
          title: 'Udupi Breakfast API Menu',
          domain: 'Networking',
          duration: '3 hours',
          description:
            'Build a Flutter menu screen that fetches breakfast items from a REST endpoint, parses JSON into models, and shows loading, empty, error, and retry states. Keep examples grounded in Udupi dishes and clear status-code handling.',
          tools: ['Flutter', 'Dart', 'http', 'REST', 'JSON models'],
          blueprint: {
            overview:
              'A small but professional API screen where the UI asks a repository for menu data instead of touching HTTP directly.',
            functionalRequirements: [
              '**Menu list.** Show item name, price in Rs, availability, and category.',
              '**State handling.** Include loading, success, empty, and error UI.',
              '**Retry.** Add a retry button when the network call fails.',
              '**Parsing.** Convert JSON maps into a typed `Dish` model.',
              '**Refresh.** Add pull-to-refresh without clearing old data first.',
            ],
            technicalImplementation: [
              '**Service.** Create `MenuApi` for HTTP calls and status checks.',
              '**Model.** Add `Dish.fromJson` and sensible defaults.',
              '**Repository.** Add `MenuRepository` to hide API details from UI.',
              '**UI.** Use a list screen with retry and refresh states.',
              '**Tests.** Unit test model parsing and repository fallback.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Scaffold',
                outcome: 'Project and menu screen created',
                prompt:
                  'Create a Flutter app with a MenuScreen for an Udupi breakfast menu. Add http package and set up clean folders for models, services, repositories, and screens.',
              },
              {
                step: 2,
                label: 'Models',
                outcome: 'Dish model parses API JSON safely',
                prompt:
                  'Implement a Dish model with id, name, price, category, and isAvailable. Add fromJson and toJson with defaults for missing fields.',
              },
              {
                step: 3,
                label: 'Networking',
                outcome: 'Repository fetches and returns dishes',
                prompt:
                  'Create MenuApi and MenuRepository. Fetch JSON from a configurable URL, check status codes, parse dishes, and return typed results.',
              },
              {
                step: 4,
                label: 'States',
                outcome: 'Loading, success, empty, error, retry, and refresh work',
                prompt:
                  'Build MenuScreen with loading, empty, error, retry button, and RefreshIndicator. Keep old data visible during refresh.',
              },
              {
                step: 5,
                label: 'Tests',
                outcome: 'Parsing and repository behavior verified',
                prompt:
                  'Add unit tests for Dish.fromJson, successful repository fetch, and failed fetch returning a friendly error.',
              },
            ],
            deliverable:
              'A working Udupi breakfast API screen that feels clear even when the internet misbehaves.',
          },
        },
        {
          id: 'm4-p2',
          type: 'Project',
          title: 'Kundapura Offline Fish Market Ledger',
          domain: 'Offline Storage',
          duration: '1 day',
          description:
            'Create an offline-first ledger for a Kundapura fishing co-op with local storage, cached entries, search, and sync-ready repository structure. The app should work even when monsoon network is weak.',
          tools: ['Flutter', 'Dart', 'sqflite', 'Repository Pattern', 'Offline Cache'],
          blueprint: {
            overview:
              'A local database app for fish catch entries with a clean repository boundary and future sync support.',
            functionalRequirements: [
              '**Entries.** Add fish name, kilos, price, seller, and date.',
              '**Local list.** Show saved entries instantly from local database.',
              '**Search.** Filter entries by fish name or seller.',
              '**Totals.** Calculate today total kilos and total value.',
              '**Offline promise.** App remains usable without internet.',
            ],
            technicalImplementation: [
              '**Database.** Use sqflite with a `catches` table.',
              '**Repository.** Hide database calls behind `CatchRepository`.',
              '**Models.** Use typed `CatchEntry` with fromMap and toMap.',
              '**State.** Use simple controller, Provider, or Riverpod.',
              '**Migration.** Keep versioned database setup ready for schema changes.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Database',
                outcome: 'sqflite database opens and table is created',
                prompt:
                  'Build a Flutter app for a Kundapura fish market ledger. Add sqflite and path, create a database helper, and create a catches table.',
              },
              {
                step: 2,
                label: 'Model',
                outcome: 'CatchEntry maps cleanly to database rows',
                prompt:
                  'Create CatchEntry with id, fish, kilos, price, seller, and createdAt. Add fromMap and toMap methods.',
              },
              {
                step: 3,
                label: 'CRUD',
                outcome: 'Entries can be added, listed, searched, and deleted',
                prompt:
                  'Implement CatchRepository with insert, getAll, searchByText, delete, and total calculation methods.',
              },
              {
                step: 4,
                label: 'UI',
                outcome: 'Offline ledger screen works end to end',
                prompt:
                  'Create screens for adding catch entries and viewing the ledger. Show totals and search results with simple empty states.',
              },
              {
                step: 5,
                label: 'Polish',
                outcome: 'App explains offline behavior clearly',
                prompt:
                  'Add friendly offline-first copy, validation, and tests for database mapping and repository totals.',
              },
            ],
            deliverable:
              'A practical offline-first Kundapura fish market ledger backed by sqflite.',
          },
        },
        {
          id: 'm4-p3',
          type: 'Capstone',
          title: 'Instagram Clone: Backend, Cache, and Image Upload',
          domain: 'Full Stack Mobile Data',
          duration: '2 days',
          description:
            'Extend the Instagram clone with a real data layer: REST or Firebase feed, local cache, pull-to-refresh, pagination, auth token handling, and image upload. Keep the UI smooth while data travels.',
          tools: ['Flutter', 'Dart', 'Firebase', 'Dio', 'Hive', 'Firestore', 'Storage'],
          blueprint: {
            overview:
              'The Module 4 capstone turns the Instagram-style UI into a data-backed app with offline cache and upload flow.',
            functionalRequirements: [
              '**Feed source.** Load posts from Firebase or a dummy REST backend.',
              '**Models.** Parse users, posts, comments, and media into typed models.',
              '**Pagination.** Load more posts when the user scrolls near the bottom.',
              '**Cache.** Show cached posts first, then refresh from network.',
              '**Upload.** Pick an image, upload it, and create a post document.',
              '**Auth token.** Store login token or user id safely.',
              '**Failure UI.** Show retry, empty, and offline states without crashing.',
            ],
            technicalImplementation: [
              '**Repository.** Create `FeedRepository`, `UploadRepository`, and `AuthTokenStore`.',
              '**Client.** Use Dio for REST or Firestore snapshots for Firebase.',
              '**Cache.** Use Hive for cached feed cards and recent profile data.',
              '**Upload.** Use Firebase Storage or a fake upload service with progress.',
              '**Tests.** Mock repositories for success, network failure, and cache fallback.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Data Models',
                outcome: 'Post, User, Comment, and Media models created',
                prompt:
                  'Extend the Instagram clone with typed data models for users, posts, comments, and media. Include fromJson/toJson and sample fixtures.',
              },
              {
                step: 2,
                label: 'Backend',
                outcome: 'Feed loads from REST or Firebase',
                prompt:
                  'Implement a FeedRepository that loads paginated posts from either Firebase Firestore or a REST endpoint. Keep the UI independent from the data source.',
              },
              {
                step: 3,
                label: 'Cache',
                outcome: 'Cached feed appears before network refresh',
                prompt:
                  'Add Hive feed cache with savedAt timestamp. Show cached posts immediately, refresh from network, and update cache when fresh data arrives.',
              },
              {
                step: 4,
                label: 'Upload',
                outcome: 'Image upload creates a new post',
                prompt:
                  'Add image picking and upload flow. Upload the selected photo, get its URL, create a post record, and show progress and failure states.',
              },
              {
                step: 5,
                label: 'Hardening',
                outcome: 'Data layer survives bad network and tests pass',
                prompt:
                  'Add tests for parsing, pagination, offline cache fallback, and upload failure. Add clear retry UI for network errors.',
              },
            ],
            deliverable:
              'A data-backed Instagram clone slice with feed loading, cache, pagination, and upload flow.',
          },
        },
      ],
      quiz: [
        {
          id: 'm4-q1',
          q: 'Which HTTP method should you usually use to read a list of menu items without changing server data?',
          options: ['POST', 'GET', 'PATCH', 'DELETE'],
          answer: 1,
        },
        {
          id: 'm4-q2',
          q: 'Why should a Flutter app use model classes instead of passing raw JSON maps everywhere?',
          options: [
            'Models make the app use more RAM automatically',
            'Models make data typed, readable, and safer to refactor',
            'Models remove the need for API status codes',
            'Models make every request offline by default',
          ],
          answer: 1,
        },
        {
          id: 'm4-q3',
          q: 'Which storage tool is the best fit for a tiny non-secret setting like selected city?',
          options: ['SharedPreferences', 'Firebase Storage', 'GraphQL', 'StreamSubscription'],
          answer: 0,
        },
        {
          id: 'm4-q4',
          q: 'What is the main difference between a Future and a Stream?',
          options: [
            'A Future can emit many values; a Stream emits only one',
            'A Future is only for databases; a Stream is only for HTTP',
            'A Future gives one result later; a Stream can give many results over time',
            'They are exactly the same in Flutter',
          ],
          answer: 2,
        },
        {
          id: 'm4-q5',
          q: 'In an offline-first cache flow, what should the app usually do first?',
          options: [
            'Delete local data before every request',
            'Show cached data if available, then refresh from network',
            'Block the UI until Firebase returns',
            'Store auth tokens in plain text logs',
          ],
          answer: 1,
        },
      ],
    },
    {
      id: 'm5',
      title: 'Platform, Native & Advanced',
      hours: 12,
      color: 'from-rose-500/20 to-rose-700/10',
      accent: 'rose',
      description:
        'Platform channels, isolates, FFI, plugins, permissions, camera, location, push notifications.',
      sections: (() => {
        const commonPitfalls = [
          '**Forgetting platform differences.** Android and iOS are like two counters in the same bus stand: same trip goal, different forms and rules.',
          '**Blocking the main isolate.** Heavy work on the UI thread makes the app freeze like Silk Board traffic at 6 PM.',
          '**Asking permission too early.** Ask for camera, location, or notification permission when the user understands why, not on the first hello.',
          '**Trusting one device.** Native features must be tested on real Android and iOS devices because simulators do not behave exactly like phones.',
          '**Leaking native errors.** Convert platform exceptions into friendly app states instead of showing scary technical text.',
          '**Overusing advanced tools.** Platform channels, isolates, and FFI are powerful vehicles. Pick the smallest one that safely carries the job.',
        ]

        const topic = (
          id,
          title,
          explain,
          analogy,
          theory,
          whyItMatters,
          steps,
          code,
          pitfalls,
          tryIt,
          takeaway,
        ) => ({
          id,
          title,
          explain,
          analogy,
          theory,
          whyItMatters,
          steps,
          code,
          pitfalls: [...commonPitfalls.slice(0, 2), ...pitfalls],
          tryIt,
          takeaway,
        })

        const topics = [
          topic(
            'm5-t1',
            'Why Flutter Needs Native Access',
            'Flutter draws your UI beautifully, but the phone still owns many real-world powers: camera, GPS, Bluetooth, battery, notifications, contacts, and speech. Native access is how your Dart app politely asks the phone for those powers.',
            'Imagine you are ordering breakfast at Diana in Udupi. Flutter is you at the table. Android or iOS is the kitchen. You cannot directly jump into the kitchen and make dosa. You ask the waiter, the waiter talks to the kitchen, and breakfast returns. Platform access is that waiter system.',
            'Flutter runs Dart code in its own world. Android native code usually uses Kotlin or Java. iOS native code usually uses Swift or Objective-C. For most features, plugins already wrap native code for you. When a plugin does not exist or your app needs special native logic, you create a bridge using platform channels.',
            'Without this idea, learners think Flutter can magically control every phone feature by itself. Real apps need to respect OS rules, permissions, lifecycle, and device differences.',
            [
              '**Step 1: Ask if a plugin already exists.** For camera, location, notifications, and storage, use maintained packages first.',
              '**Step 2: Identify the native owner.** Camera is OS/device. UI is Flutter. Business flow is Dart.',
              '**Step 3: Bridge only the missing part.** Do not write native code for everything when only one native method is missing.',
              '**Step 4: Return simple data.** Send strings, numbers, booleans, lists, and maps across the bridge.',
              '**Step 5: Handle failure.** Native code can deny, crash, or return unavailable.',
            ],
            `// Mental model only
// Flutter UI -> Plugin/platform channel -> Android/iOS API -> result back to Dart

class NativeFeaturePlan {
  final String feature;
  final bool pluginExists;
  final String fallback;

  const NativeFeaturePlan({
    required this.feature,
    required this.pluginExists,
    required this.fallback,
  });
}`,
            [
              '**Writing native code too soon.** First search for a reliable plugin.',
              '**Ignoring permissions.** Native feature access is not a free pass.',
              '**Returning complex objects directly.** Convert native objects into maps or simple values.',
            ],
            'Pick three features from your phone: camera, torch, and contacts. Write which one Flutter UI controls and which one Android/iOS controls.',
            'Flutter is the face of the app; the platform owns many device powers. Use plugins first, channels when needed.',
          ),
          topic(
            'm5-t2',
            'MethodChannel Basics',
            'A MethodChannel lets Dart call one named native method and wait for one result. It is perfect for "get battery level", "start payment", or "open a native screen" style tasks.',
            'Think of Tulu-Kannada code-switching near Kundapura. You speak to one person in the language they understand, they talk to another person in their language, and the meaning comes back. MethodChannel translates Flutter request into native action.',
            'Both Dart and native code create a channel with the same name. Dart calls `invokeMethod`. Native code listens for that method name, performs the platform work, then returns success or error. The channel name should be unique, often like `com.yourapp/device`.',
            'MethodChannel is the foundation for custom native features. Once this pattern clicks, plugins stop feeling mysterious.',
            [
              '**Step 1: Name the channel.** Use a stable app-specific name.',
              '**Step 2: Call from Dart.** Use `invokeMethod` with a method name.',
              '**Step 3: Receive on native side.** Match the same channel and method string.',
              '**Step 4: Return simple values.** Keep the response small and predictable.',
              '**Step 5: Catch `PlatformException`.** Native errors must not crash your UI.',
            ],
            `import 'package:flutter/services.dart';

class BatteryService {
  static const _channel = MethodChannel('com.thanthrajnaani.device/battery');

  Future<int?> getBatteryLevel() async {
    try {
      final level = await _channel.invokeMethod<int>('getBatteryLevel');
      return level;
    } on PlatformException catch (error) {
      // Show friendly UI instead of native error text.
      debugPrint('Battery check failed: ' + error.message.toString());
      return null;
    }
  }
}`,
            [
              '**Channel name mismatch.** Dart and native names must match exactly.',
              '**Method name spelling mistakes.** `getBatteryLevel` and `getBatterylevel` are different.',
              '**No fallback UI.** If native call fails, show "Not available" gracefully.',
            ],
            'Create a fake `DeviceInfoService` with a `MethodChannel` and one method called `getDeviceNickname`. You do not need native code yet; just write the Dart side.',
            'MethodChannel is a one-question, one-answer bridge between Dart and native code.',
          ),
          topic(
            'm5-t3',
            'Sending Arguments Through MethodChannel',
            'Arguments are the parcel you send with a native method call. Instead of saying "do something", you say "open map with this latitude and longitude" or "start payment for Rs 499".',
            'At a Kundapura parcel counter, saying "send this" is not enough. You must give address, phone number, weight, and payment. Native methods also need proper parcels.',
            'MethodChannel supports simple platform message types: null, bool, int, double, String, Uint8List, List, and Map. In Dart, pass a map. On native side, read the same keys carefully. Treat the map like an API contract.',
            'Many native bugs are not big architecture problems. They are tiny argument shape mistakes: wrong key, wrong type, missing value.',
            [
              '**Step 1: Decide the argument contract.** Write exact keys before coding.',
              '**Step 2: Pass a `Map<String, dynamic>`.** Keep values simple.',
              '**Step 3: Validate before calling.** Do not send empty required values.',
              '**Step 4: Validate again on native side.** Never trust input blindly.',
              '**Step 5: Version carefully.** If you rename a key, update both sides together.',
            ],
            `class NativeMapLauncher {
  static const _channel = MethodChannel('com.thanthrajnaani.device/maps');

  Future<void> openPlace({
    required double latitude,
    required double longitude,
    required String label,
  }) {
    return _channel.invokeMethod('openPlace', {
      'latitude': latitude,
      'longitude': longitude,
      'label': label,
    });
  }
}`,
            [
              '**Using unclear keys.** `x` and `y` become confusion later. Use `latitude` and `longitude`.',
              '**Sending Dart-only objects.** Convert custom classes into maps first.',
              '**Forgetting required fields.** Native code should return a clear error for missing arguments.',
            ],
            'Design the argument map for `startUpiPayment`: amount, receiverName, upiId, and note. Write the Dart method signature.',
            'Arguments are a contract. Clear keys save hours of native debugging.',
          ),
          topic(
            'm5-t4',
            'PlatformException and Friendly Errors',
            'Native calls can fail for normal reasons: permission denied, feature unavailable, bad arguments, app not installed, or OS restriction. PlatformException is how those failures travel back to Dart.',
            'At Bengaluru Majestic, a counter may say "bus full", "route cancelled", or "wrong platform". You do not shout stack trace at your family. You explain the next useful step.',
            '`PlatformException` has a code, message, and details. Use `code` for program decisions and `message` for debugging. In production UI, convert it into learner-friendly or user-friendly text.',
            'Advanced apps feel trustworthy because failure is handled calmly. A denied permission should become "Enable camera to add a photo", not a crash.',
            [
              '**Step 1: Define native error codes.** Examples: `permission_denied`, `unavailable`, `invalid_args`.',
              '**Step 2: Catch in Dart.** Wrap every platform call.',
              '**Step 3: Map to app errors.** Convert native detail into domain language.',
              '**Step 4: Show next action.** Retry, open settings, or continue without feature.',
              '**Step 5: Log technical detail quietly.** Keep UI clean.',
            ],
            `class NativeFailure implements Exception {
  final String message;
  const NativeFailure(this.message);
}

Future<String> readKannadaSpeechText() async {
  try {
    final text = await const MethodChannel('com.app/speech')
        .invokeMethod<String>('listenKannada');
    return text ?? '';
  } on PlatformException catch (error) {
    if (error.code == 'permission_denied') {
      throw const NativeFailure('Please allow microphone permission to record notes.');
    }
    throw const NativeFailure('Speech note is not available on this device.');
  }
}`,
            [
              '**Showing raw native messages.** Users should not see plugin internals.',
              '**Treating all errors same.** Permission denied and unavailable need different UI.',
              '**No details for developers.** Log enough for debugging without exposing secrets.',
            ],
            'Write three error codes for a camera feature and one friendly message for each.',
            'Platform errors are expected roadblocks. Translate them into clear next steps.',
          ),
          topic(
            'm5-t5',
            'EventChannel for Continuous Native Data',
            'EventChannel is for ongoing native updates. Use it when native side keeps sending values: sensor readings, GPS movement, speech partial text, step counter, or battery changes.',
            'A Sringeri temple bell that rings once is like MethodChannel. A continuous announcement stream during a festival is EventChannel. Your app listens until it is no longer needed.',
            'Dart receives an EventChannel as a Stream. Native side creates an event sink and pushes values over time. The UI can use `StreamBuilder` or a state manager. Cancel the subscription when the screen leaves.',
            'If learners use repeated MethodChannel calls for live updates, they create polling mess. EventChannel gives the correct shape for continuous data.',
            [
              '**Step 1: Use EventChannel for many values over time.** Do not force it into one-shot calls.',
              '**Step 2: Expose a Dart Stream.** Hide channel details inside a service.',
              '**Step 3: Listen in UI or controller.** Use `StreamBuilder` or subscription.',
              '**Step 4: Cancel when finished.** Avoid battery drain and duplicate listeners.',
              '**Step 5: Handle stream errors.** Native streams can fail too.',
            ],
            `class StepCounterService {
  static const _channel = EventChannel('com.thanthrajnaani.device/steps');

  Stream<int> watchSteps() {
    return _channel.receiveBroadcastStream().map((value) => value as int);
  }
}

// UI idea:
// StreamBuilder<int>(
//   stream: StepCounterService().watchSteps(),
//   builder: (_, snapshot) => Text('Steps: ' + (snapshot.data ?? 0).toString()),
// )`,
            [
              '**Using EventChannel for one value.** One battery check belongs in MethodChannel.',
              '**Forgetting cancellation.** Streams should stop when nobody listens.',
              '**Ignoring native pause/resume.** Sensors may need cleanup on lifecycle changes.',
            ],
            'List three features in your future apps. Mark each as MethodChannel or EventChannel.',
            'EventChannel is MethodChannel\'s streaming cousin: use it when native keeps talking.',
          ),
          topic(
            'm5-t6',
            'BasicMessageChannel',
            'BasicMessageChannel is a lower-level two-way message pipe. Use it when Dart and native need to pass custom messages without the strict method-call shape.',
            'Imagine a Bengaluru apartment WhatsApp group between security and residents. It is not always "call this exact method". Sometimes it is small messages both sides understand: parcel arrived, visitor waiting, gate open.',
            'BasicMessageChannel sends messages using codecs like `StringCodec` or `StandardMessageCodec`. It is less common than MethodChannel, but useful for custom protocols, embedded native views, or bidirectional lightweight messaging.',
            'You may not use it every week, but knowing it exists prevents forcing every problem into MethodChannel.',
            [
              '**Step 1: Choose a codec.** StandardMessageCodec handles simple maps and lists.',
              '**Step 2: Create same channel name on both sides.** Names must match.',
              '**Step 3: Send message.** Dart can send and receive replies.',
              '**Step 4: Set message handler.** Native can also initiate agreed messages.',
              '**Step 5: Keep protocol tiny.** Too much custom messaging becomes hard to maintain.',
            ],
            `class NativeChatBridge {
  static const _channel = BasicMessageChannel<dynamic>(
    'com.thanthrajnaani.native/chat',
    StandardMessageCodec(),
  );

  Future<dynamic> sendPing() {
    return _channel.send({
      'type': 'ping',
      'sentBy': 'flutter',
    });
  }
}`,
            [
              '**Choosing it without reason.** Most app features are simpler with MethodChannel.',
              '**No message type field.** Add `type` so both sides know what message means.',
              '**Growing a hidden protocol.** Document every message shape.',
            ],
            'Design two BasicMessageChannel message maps: one for `nativeReady`, one for `flutterPaused`.',
            'BasicMessageChannel is a flexible message pipe for special two-way native conversations.',
          ),
          topic(
            'm5-t7',
            'Plugin Structure',
            'A Flutter plugin packages Dart API plus Android and iOS native implementations so other screens or apps can reuse the feature cleanly.',
            'Vidhana Soudha looks like one building from outside, but it has layers: public halls, offices, records, security, and foundation. A plugin is similar: Dart public API on top, native Android/iOS foundation below.',
            'A plugin usually has a Dart interface, a platform interface, Android code, iOS code, and example app. Many official plugins follow a federated structure so each platform can evolve separately.',
            'Understanding plugin structure helps you debug plugin issues, contribute fixes, or create private company plugins.',
            [
              '**Step 1: Keep Dart API pleasant.** App screens should call clean Dart methods.',
              '**Step 2: Hide native details.** Do not expose Kotlin/Swift concepts to UI.',
              '**Step 3: Implement each platform separately.** Android and iOS may need different code.',
              '**Step 4: Add an example app.** Test the plugin like a real user.',
              '**Step 5: Version carefully.** Plugin changes can break apps.',
            ],
            `// App code should feel simple:
final speech = KannadaSpeechPlugin();
final text = await speech.listenOnce();

// Internally the plugin can decide:
// Android -> SpeechRecognizer
// iOS -> SFSpeechRecognizer
// Flutter UI should not care.`,
            [
              '**Letting UI know native details.** Keep screen code clean.',
              '**No example app.** Plugin bugs hide until someone uses it.',
              '**Only testing Android.** iOS implementation may be missing or different.',
            ],
            'Sketch folders for a private `kannada_speech_notes` plugin: Dart API, Android, iOS, and example.',
            'A plugin is reusable native access wrapped in a nice Dart jacket.',
          ),
          topic(
            'm5-t8',
            'Permissions Lifecycle',
            'Permissions are the phone asking, "Is it okay if this app uses camera, location, microphone, or notifications?" Your app must ask at the right time and handle yes, no, and permanently denied.',
            'You do not walk into Krishna Matha kitchen without permission. You explain why you are there, ask respectfully, and if the answer is no, you do not push through the door.',
            'Permissions have states: granted, denied, permanently denied, restricted, or limited depending on platform. Use packages like `permission_handler`, but design the user flow yourself. The best moment to ask is right before the feature is needed.',
            'Bad permission UX makes users uninstall apps. Good permission UX builds trust.',
            [
              '**Step 1: Explain value first.** "Add a post photo" makes camera permission understandable.',
              '**Step 2: Check current status.** Do not ask blindly.',
              '**Step 3: Request only when needed.** Delay until the action.',
              '**Step 4: Handle denial.** Offer another path or explain settings.',
              '**Step 5: Update platform files.** Android manifest and iOS Info.plist need permission descriptions.',
            ],
            `Future<bool> ensureCameraPermission() async {
  final status = await Permission.camera.status;
  if (status.isGranted) return true;

  final next = await Permission.camera.request();
  if (next.isGranted) return true;

  if (next.isPermanentlyDenied) {
    await openAppSettings();
  }
  return false;
}`,
            [
              '**Permission at app launch.** The user has no context yet.',
              '**Missing iOS description.** iOS may reject or crash if usage text is missing.',
              '**No denied state UI.** Explain what feature is unavailable.',
            ],
            'Write the exact friendly sentence you would show before asking microphone permission for Kannada speech notes.',
            'Ask permission like a decent human: with timing, reason, and respect.',
          ),
          topic(
            'm5-t9',
            'Camera and Image Picker',
            'Camera and image picker features let users capture photos or choose existing media. In Flutter, use plugins first, then add custom native only when you need special behavior.',
            'For an Instagram-style Udupi food post, the user may take a fresh dosa photo or pick yesterday\'s beach photo from gallery. Both paths should land in the same preview screen.',
            '`image_picker` gives a simple route to camera/gallery. For advanced camera preview, zoom, flash, and real-time frames, use `camera`. Always handle permission, cancelled picker, file size, and upload preparation.',
            'Media is central to social apps. Learners need to understand that camera is not just one button; it is permission, capture, preview, compression, and upload flow.',
            [
              '**Step 1: Choose plugin.** `image_picker` for simple capture, `camera` for custom camera UI.',
              '**Step 2: Ask permission when user taps camera.** Keep reason clear.',
              '**Step 3: Handle cancel.** User may back out.',
              '**Step 4: Preview before upload.** Let user confirm.',
              '**Step 5: Compress or resize.** Huge images make slow uploads.',
            ],
            `Future<XFile?> pickPostPhoto(ImageSource source) async {
  final picker = ImagePicker();
  return picker.pickImage(
    source: source,
    imageQuality: 80,
    maxWidth: 1600,
  );
}`,
            [
              '**Assuming file is always returned.** User can cancel.',
              '**Uploading original huge photo.** Compress for speed and cost.',
              '**No gallery fallback.** If camera fails, gallery may still work.',
            ],
            'Design a post creation flow with four screens or states: choose source, capture/pick, preview, upload.',
            'Camera work is a flow, not just a plugin call.',
          ),
          topic(
            'm5-t10',
            'Location and Geolocator',
            'Location lets your app know where the device is, with user permission. Use it for maps, delivery, travel, nearby places, or location-tagged posts.',
            'If a user tags "Malpe Beach, Udupi" on a post, the app should not randomly say "Kundapura bus stand". GPS is the friend who checks the actual place before announcing it.',
            'Location has permission, service enabled state, accuracy, timeout, and privacy concerns. `geolocator` can get current position and stream updates. Use one-time location for tagging; use streams only for tracking movement.',
            'Location is sensitive. A respectful app uses the smallest location access needed.',
            [
              '**Step 1: Decide one-time or continuous.** Tagging a post needs one-time location.',
              '**Step 2: Check service enabled.** GPS can be off.',
              '**Step 3: Ask location permission.** Explain why.',
              '**Step 4: Use timeout.** Do not spin forever.',
              '**Step 5: Store readable place separately.** Coordinates and display label are different.',
            ],
            `Future<Position?> getPostLocation() async {
  final enabled = await Geolocator.isLocationServiceEnabled();
  if (!enabled) return null;

  final permission = await Geolocator.requestPermission();
  if (permission == LocationPermission.denied ||
      permission == LocationPermission.deniedForever) {
    return null;
  }

  return Geolocator.getCurrentPosition(
    desiredAccuracy: LocationAccuracy.medium,
    timeLimit: const Duration(seconds: 10),
  );
}`,
            [
              '**Using continuous tracking for one tag.** That wastes battery.',
              '**Forgetting GPS off state.** Permission granted does not mean location service is enabled.',
              '**Storing exact location unnecessarily.** Respect privacy.',
            ],
            'For an Instagram post, decide whether you need exact coordinates, city name, or user-selected place label.',
            'Location should be accurate enough for the feature and private enough for the user.',
          ),
          topic(
            'm5-t11',
            'Contacts, Files, and Share Sheets',
            'Many apps need to open system UI for contacts, documents, or sharing. These are native experiences wrapped by Flutter plugins.',
            'In Bengaluru, you do not build a whole courier network just to send one parcel. You use the existing courier counter. Similarly, for sharing text or files, use the system share sheet.',
            'Plugins like `share_plus`, `file_picker`, and contact-related packages call platform APIs for common device tasks. The app should validate file type, handle cancel, and avoid requesting more access than needed.',
            'Using platform UI keeps the app familiar and reduces custom native work.',
            [
              '**Step 1: Use existing platform UI when possible.** Share sheet and file picker are familiar.',
              '**Step 2: Request narrow access.** Pick one file instead of reading all storage.',
              '**Step 3: Handle cancel.** User may close picker.',
              '**Step 4: Validate result.** Check file extension, size, and null values.',
              '**Step 5: Keep privacy clear.** Tell users what data is used.',
            ],
            `Future<void> sharePostLink(String postId) async {
  final link = 'https://example.com/posts/' + postId;
  await Share.share('See my Udupi food post: ' + link);
}`,
            [
              '**Building custom share UI unnecessarily.** Native share sheet already knows installed apps.',
              '**Reading too much data.** Pick what you need.',
              '**Not handling no app available.** Some actions can fail.',
            ],
            'Write a share message for a Kundapura fish market listing with name, price, and link.',
            'For common device actions, let the OS do OS things.',
          ),
          topic(
            'm5-t12',
            'App Lifecycle',
            'App lifecycle tells you when your app opens, pauses, resumes, or closes. Native features often depend on these changes.',
            'A shop near Udupi bus stand opens shutters, serves customers, pauses for lunch, and closes at night. Your app also has moments when it is active, paused, resumed, or detached.',
            'Flutter exposes lifecycle through `WidgetsBindingObserver` and `AppLifecycleListener`. Use it to pause camera preview, refresh data on resume, stop sensors, or lock secure screens.',
            'Ignoring lifecycle causes battery drain, camera conflicts, stale data, and weird bugs after returning from another app.',
            [
              '**Step 1: Listen only when needed.** Add lifecycle observer for screens that care.',
              '**Step 2: Pause expensive features.** Camera, location, and streams should rest.',
              '**Step 3: Refresh on resume when useful.** Payment or permission flows may change outside app.',
              '**Step 4: Remove observer.** Clean up in dispose.',
              '**Step 5: Test app switching.** Home button and incoming calls matter.',
            ],
            `class CameraScreenState extends State<CameraScreen>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused) {
      // Pause camera or sensor work here.
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
}`,
            [
              '**Leaving camera active in background.** Pause it.',
              '**Forgetting dispose.** Observers can call dead screens.',
              '**Only testing fresh launch.** Resume bugs appear after app switching.',
            ],
            'List what your Instagram clone should do when the user leaves the camera screen to answer a phone call.',
            'Lifecycle is the app\'s daily routine. Respect it and native features behave better.',
          ),
          topic(
            'm5-t13',
            'Platform Views',
            'Platform views let you embed native Android or iOS views inside Flutter, such as maps, web views, ads, or special camera surfaces.',
            'Think of a Bengaluru tech park inside an older city area. The surrounding roads are Flutter, but one building is managed by a separate native team. They must fit together without blocking traffic.',
            'Flutter can display native views using platform view mechanisms. This is powerful but heavier than normal widgets. Gesture handling, performance, clipping, and composition differ by platform.',
            'Some SDKs only provide native views. Knowing platform views helps you integrate maps, payment widgets, video SDKs, or enterprise components.',
            [
              '**Step 1: Prefer Flutter widgets when available.** They are lighter.',
              '**Step 2: Use platform views for native-only UI.** Maps and SDK widgets are common cases.',
              '**Step 3: Test gestures.** Scrolling and touch events can conflict.',
              '**Step 4: Watch performance.** Native view composition is costlier.',
              '**Step 5: Keep boundaries clear.** Flutter controls layout; native view controls its own content.',
            ],
            `// Example concept:
// GoogleMap, WebViewWidget, and some payment SDK views
// may internally use platform views.

class NativeSdkPanel extends StatelessWidget {
  const NativeSdkPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      height: 300,
      child: Text('Native view placeholder'),
    );
  }
}`,
            [
              '**Using platform views for normal UI.** Flutter widgets are usually better.',
              '**Ignoring gesture conflicts.** Scroll inside scroll can feel broken.',
              '**No device testing.** Platform views can behave differently across Android versions.',
            ],
            'Name two screens where a platform view is justified and two where plain Flutter widgets are better.',
            'Platform views are useful native islands inside Flutter, but they are not everyday layout tools.',
          ),
          topic(
            'm5-t14',
            'Main Isolate vs Background Isolate',
            'An isolate is Dart’s separate worker. The main isolate handles UI. Background isolates handle heavy work without freezing the screen.',
            'Silk Board traffic jam happens when every vehicle tries to use the same road. If heavy JSON parsing, image processing, and UI painting all use the main road, your app freezes.',
            'Dart isolates do not share memory directly. They send messages. Flutter’s main isolate should stay free for frames, gestures, and animations. CPU-heavy tasks can move to another isolate.',
            'Performance is not only about fast code. It is about keeping the UI responsive while work happens.',
            [
              '**Step 1: Identify CPU-heavy work.** Big JSON, image filters, encryption, and compression are suspects.',
              '**Step 2: Keep UI on main isolate.** Do not block gestures.',
              '**Step 3: Move heavy pure Dart work.** Use `compute` or isolate APIs.',
              '**Step 4: Send simple data.** Isolates communicate with messages.',
              '**Step 5: Measure before and after.** Use DevTools.',
            ],
            `// Heavy work should be a top-level or static function for compute.
int countExpensiveItems(List<int> numbers) {
  return numbers.where((n) => n > 5000).length;
}

Future<int> countWithoutFreezingUi(List<int> numbers) {
  return compute(countExpensiveItems, numbers);
}`,
            [
              '**Moving tiny work to isolate.** Starting an isolate has overhead.',
              '**Trying to share objects.** Send data messages instead.',
              '**Doing plugin calls from random isolates.** Many plugins expect main isolate setup.',
            ],
            'Think of your app\'s slowest screen. Write whether the slowness is network wait, database wait, or CPU-heavy work.',
            'Use isolates when the UI road is blocked by CPU-heavy traffic.',
          ),
          topic(
            'm5-t15',
            'compute for Simple Heavy Work',
            '`compute` is Flutter’s easy helper for running one heavy function in a background isolate and getting the result back.',
            'If one Bengaluru darshini counter is overloaded chopping vegetables, send that chopping job to the back kitchen. The serving counter stays fast.',
            '`compute(function, message)` runs a top-level or static function with one message argument. It is great for parsing large JSON, generating thumbnails, or calculating summaries. It is not for UI work.',
            'This gives learners a practical performance tool without needing low-level isolate ceremony immediately.',
            [
              '**Step 1: Make a pure function.** Input in, output out.',
              '**Step 2: Keep it top-level or static.** `compute` needs a function it can spawn.',
              '**Step 3: Pass serializable data.** Use maps, lists, strings, numbers.',
              '**Step 4: Await the result.** UI can show loading meanwhile.',
              '**Step 5: Keep errors handled.** Background work can throw too.',
            ],
            `List<String> parseNames(List<dynamic> raw) {
  return raw
      .whereType<Map<String, dynamic>>()
      .map((item) => item['name'] as String? ?? 'Unnamed')
      .toList();
}

Future<List<String>> parseNamesFast(List<dynamic> raw) {
  return compute(parseNames, raw);
}`,
            [
              '**Using closures with context.** Keep compute functions standalone.',
              '**Passing BuildContext.** UI objects do not belong in background isolate.',
              '**Using compute for network calls.** Async I/O usually does not need compute.',
            ],
            'Take a large feed JSON parsing function and rewrite it as a top-level function suitable for `compute`.',
            '`compute` is the beginner-friendly worker counter for one heavy pure Dart job.',
          ),
          topic(
            'm5-t16',
            'Long JSON Parsing Without Jank',
            'Large JSON responses can freeze scrolling if decoded and converted into models on the main isolate. Move parsing away from the UI path when data is big.',
            'Imagine unloading luggage from a Kundapura to Bengaluru bus in the middle of the road. Everyone waits. Move luggage sorting to the side area and traffic continues.',
            '`jsonDecode` plus model conversion can be CPU-heavy for thousands of items. Network waiting is async, but parsing after response may still block frames. Use `compute` for large payloads and keep models simple.',
            'This is a real performance issue in feeds, reports, chat histories, and catalog apps.',
            [
              '**Step 1: Fetch response normally.** Network is async already.',
              '**Step 2: Send response body to parser.** Move decode/model work.',
              '**Step 3: Parse into typed models.** Avoid raw maps in UI.',
              '**Step 4: Show progress or skeleton.** Large data still needs UX.',
              '**Step 5: Profile frame times.** Confirm jank improved.',
            ],
            `List<Post> parsePosts(String body) {
  final decoded = jsonDecode(body) as List<dynamic>;
  return decoded
      .map((item) => Post.fromJson(item as Map<String, dynamic>))
      .toList();
}

Future<List<Post>> fetchAndParsePosts(http.Client client) async {
  final response = await client.get(Uri.parse('https://example.com/posts'));
  return compute(parsePosts, response.body);
}`,
            [
              '**Assuming await means no CPU cost.** Await avoids blocking during network, not necessarily during parsing.',
              '**Parsing in build.** Never decode large data inside build.',
              '**Sending giant model objects back and forth repeatedly.** Cache results sensibly.',
            ],
            'Write a rule for your app: at what list size will you move parsing to compute, 100, 1000, or 10000 items?',
            'Async network prevents waiting jank; background parsing prevents CPU jank.',
          ),
          topic(
            'm5-t17',
            'Image Processing and Filters',
            'Image filters, resizing, thumbnails, and compression can be heavy. For social apps, this work should feel smooth even on budget phones.',
            'A Kundapura fish market seller cleans and packs fish before delivery. If they do all cleaning at the billing counter, the whole line gets annoyed. Process images away from the UI counter.',
            'Use packages for common image operations. For heavy pure Dart processing, isolates can help. For advanced real-time filters, native/GPU approaches may be needed. Always balance quality, speed, file size, and battery.',
            'Instagram-style apps live or die on media performance. Slow filters make the app feel broken.',
            [
              '**Step 1: Decide required output.** Thumbnail, compressed upload, or visible filter.',
              '**Step 2: Avoid original size when not needed.** Resize early.',
              '**Step 3: Move heavy work off main isolate.** Keep preview responsive.',
              '**Step 4: Cache processed result.** Do not repeat same filter again and again.',
              '**Step 5: Test on low-end device.** Your laptop is not the user’s phone.',
            ],
            `class ImageJob {
  final String inputPath;
  final int maxWidth;

  const ImageJob(this.inputPath, this.maxWidth);
}

// Real implementation would read bytes, resize/compress, and save output.
Future<String> createUploadImage(ImageJob job) async {
  return compute(_processImage, job);
}

String _processImage(ImageJob job) {
  return job.inputPath; // Placeholder for image package processing.
}`,
            [
              '**Processing full-size image for thumbnails.** Wasteful.',
              '**No loading state.** Filters need progress feedback.',
              '**Reprocessing on every rebuild.** Store the processed file path.',
            ],
            'For a photo post, decide three output sizes: feed thumbnail, detail view, and upload original/compressed.',
            'Image processing needs its own lane so UI does not get stuck in traffic.',
          ),
          topic(
            'm5-t18',
            'Background Work with WorkManager',
            'Background work lets tasks run later or outside the current screen, such as syncing drafts, uploading logs, or refreshing small data.',
            'During coastal Karnataka monsoon, a shop may restock early morning before customers arrive. Background work is like planned restocking: useful, limited, and controlled by outside conditions.',
            'On mobile, background work is heavily controlled by Android and iOS to protect battery. Use packages like `workmanager` for scheduled/background tasks, but never assume exact timing. For urgent user-visible work, use foreground flows.',
            'Learners often think background means "run whenever I want". The OS is the boss here.',
            [
              '**Step 1: Decide if work truly needs background.** Many tasks can happen when app opens.',
              '**Step 2: Keep task small.** Background time is limited.',
              '**Step 3: Make task retry-safe.** It may run again.',
              '**Step 4: Store state locally.** Background task should know what remains.',
              '**Step 5: Respect platform rules.** iOS is stricter for arbitrary work.',
            ],
            `void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    // Example: sync saved draft posts.
    // Keep work short and retry-safe.
    return Future.value(true);
  });
}`,
            [
              '**Expecting exact schedule.** Background tasks are best-effort.',
              '**Doing huge uploads silently.** Use user-visible upload state for important media.',
              '**No retry safety.** Duplicate sync can create duplicate records.',
            ],
            'Name one task in your app that can wait until the app opens and one task that deserves background sync.',
            'Background work is a scheduled helper, not a secret always-running engine.',
          ),
          topic(
            'm5-t19',
            'Local Notifications',
            'Local notifications are reminders created by the app on the device, without needing a server push at that moment.',
            'A Bengaluru tuition teacher sets a reminder: "Class at 6 PM." The teacher does not call every student manually at 5:55. The phone reminder rings locally.',
            'Use `flutter_local_notifications` for scheduled reminders, foreground notification behavior, and local alerts. Android notification channels and iOS permission text matter. Keep notifications useful, rare, and controllable.',
            'Notifications are powerful but easy to abuse. Helpful reminders increase trust; noisy alerts cause uninstall.',
            [
              '**Step 1: Ask notification permission with context.** Especially important on iOS and newer Android.',
              '**Step 2: Create channels on Android.** Channel controls sound/importance.',
              '**Step 3: Schedule meaningful alerts.** Reminders, upload complete, daily practice.',
              '**Step 4: Handle tap.** Open the right screen.',
              '**Step 5: Let user control.** Add settings for notification types.',
            ],
            `Future<void> schedulePracticeReminder(
  FlutterLocalNotificationsPlugin plugin,
) {
  return plugin.show(
    1,
    'Flutter practice time',
    'Spend 20 minutes building your Udupi notes app.',
    const NotificationDetails(),
  );
}`,
            [
              '**No notification channel.** Android behavior may be wrong.',
              '**Too many reminders.** Users will mute you.',
              '**Tap opens wrong screen.** Notification payload should route properly.',
            ],
            'Write three notification types for a learning app and mark which ones the user should be able to turn off.',
            'Local notifications are device-side reminders. Use them like a helpful teacher, not a shouting vendor.',
          ),
          topic(
            'm5-t20',
            'Push Notifications with FCM',
            'Push notifications come from a server through Firebase Cloud Messaging or platform services. They can alert users about new likes, comments, messages, or important updates.',
            'If a friend in Bengaluru comments on your Udupi food post, your phone should know even if the app is closed. That is like a courier delivering news to your door.',
            'FCM needs Firebase setup, platform configuration, device token handling, permission, foreground/background behavior, and server-side sending. Tokens can refresh. Users can deny permission.',
            'Social apps rely on push notifications, but they require careful setup across Flutter, Firebase, Android, iOS, and backend.',
            [
              '**Step 1: Configure Firebase for Android and iOS.** Add the correct files.',
              '**Step 2: Request permission where required.** iOS and Android versions differ.',
              '**Step 3: Get FCM token.** Send it to backend for this user.',
              '**Step 4: Listen for foreground messages.** App-open behavior needs custom UI.',
              '**Step 5: Handle notification tap.** Deep link to post/comment/chat.',
            ],
            `Future<void> setupPush() async {
  final messaging = FirebaseMessaging.instance;
  await messaging.requestPermission();

  final token = await messaging.getToken();
  debugPrint('FCM token: ' + token.toString());

  FirebaseMessaging.onMessage.listen((message) {
    debugPrint('Foreground push: ' + (message.notification?.title ?? 'No title'));
  });
}`,
            [
              '**Not storing token in backend.** Server cannot target the user.',
              '**Ignoring token refresh.** Tokens can change.',
              '**Assuming foreground push shows automatically.** You may need in-app UI.',
            ],
            'For the Instagram clone, write payload fields for a comment notification: postId, commentId, senderName.',
            'Push notifications are server-delivered nudges that need platform setup and routing discipline.',
          ),
          topic(
            'm5-t21',
            'Deep Links and App Links',
            'Deep links open a specific screen inside your app from a URL, notification, QR code, or another app.',
            'A normal address says "go to Bengaluru." A proper address says "Indiranagar, 12th Main, this cafe table." Deep links are exact addresses inside your app.',
            'Deep links require route parsing in Flutter and platform configuration in Android/iOS. App links/universal links prove your domain owns the link. Notification taps often use the same routing idea.',
            'Without deep links, users tap a post notification and land on the home page confused. With deep links, they land directly on the post.',
            [
              '**Step 1: Define link shape.** Example: `/posts/post_123`.',
              '**Step 2: Parse route in Flutter.** Extract ids safely.',
              '**Step 3: Configure Android/iOS.** Platform must send links to your app.',
              '**Step 4: Handle cold start and warm app.** App may be closed or already running.',
              '**Step 5: Validate permissions.** Private content may need login first.',
            ],
            `RouteSettings postRouteFromUri(Uri uri) {
  if (uri.pathSegments.length == 2 && uri.pathSegments.first == 'posts') {
    return RouteSettings(
      name: '/post',
      arguments: {'postId': uri.pathSegments[1]},
    );
  }
  return const RouteSettings(name: '/home');
}`,
            [
              '**Only handling app-open state.** Cold start links need testing.',
              '**No fallback route.** Unknown links should land safely.',
              '**Skipping auth guard.** Deep link to private screen may need login.',
            ],
            'Create three links for your app: one post, one profile, one settings screen.',
            'Deep links are exact addresses that take users to the right room, not just the front gate.',
          ),
          topic(
            'm5-t22',
            'FFI Basics',
            'FFI lets Dart call C-compatible native libraries directly. Use it for existing C libraries, high-performance native code, or platform SDKs that expose C APIs.',
            'If Flutter plugins are like calling a waiter, FFI is like calling the specialist cook directly in the kitchen. Powerful, fast, and not something you do for ordering one idli.',
            'Dart FFI uses `dart:ffi` to load dynamic libraries and bind native functions. You must manage types carefully: integers, pointers, structs, memory, and platform binaries. This is advanced and should be isolated behind a clean Dart API.',
            'FFI unlocks serious native performance, but it also brings native-level responsibility.',
            [
              '**Step 1: Confirm FFI is needed.** Do not use it for normal app logic.',
              '**Step 2: Prepare native library.** Android, iOS, desktop need correct binaries.',
              '**Step 3: Map C types to Dart types.** Be exact.',
              '**Step 4: Hide FFI behind service class.** UI should never touch pointers.',
              '**Step 5: Test every platform.** Binary loading differs.',
            ],
            `import 'dart:ffi';

typedef NativeAdd = Int32 Function(Int32 a, Int32 b);
typedef DartAdd = int Function(int a, int b);

class NativeMath {
  NativeMath(DynamicLibrary library)
      : _add = library.lookupFunction<NativeAdd, DartAdd>('add_numbers');

  final DartAdd _add;

  int add(int a, int b) => _add(a, b);
}`,
            [
              '**Using FFI for simple Dart work.** Dart can already add numbers.',
              '**Pointer mistakes.** Memory bugs are possible.',
              '**Missing platform binary.** App works on one OS and fails on another.',
            ],
            'Write two cases where FFI is reasonable and two where MethodChannel or a plugin is better.',
            'FFI is for direct native library power. Respect it like a sharp kitchen knife.',
          ),
          topic(
            'm5-t23',
            'Android and iOS Configuration Files',
            'Native features often require platform configuration files: AndroidManifest.xml, Gradle files, Info.plist, entitlements, and Firebase config files.',
            'A KSRTC bus trip from Kundapura to Bengaluru needs ticket, route permit, driver, fuel, and platform number. Dart code is not enough if platform paperwork is missing.',
            'Android permissions and activities live in manifest/Gradle. iOS usage descriptions, background modes, and capabilities live in Info.plist and Xcode settings. Firebase needs generated config files. These files are part of the feature, not boring extras.',
            'Many Flutter native bugs are configuration bugs. Learning where to look saves enormous time.',
            [
              '**Step 1: Read plugin setup docs.** Native setup steps matter.',
              '**Step 2: Add permissions and descriptions.** Camera/location/microphone need platform text.',
              '**Step 3: Check min SDK and iOS version.** Some plugins require newer versions.',
              '**Step 4: Keep config per environment.** Dev and prod Firebase may differ.',
              '**Step 5: Rebuild cleanly after native changes.** Hot reload cannot apply native config.',
            ],
            `// Example checklist, not Dart code
// Android:
// - android/app/src/main/AndroidManifest.xml
// - android/app/build.gradle
//
// iOS:
// - ios/Runner/Info.plist
// - Signing & Capabilities in Xcode
//
// Firebase:
// - google-services.json
// - GoogleService-Info.plist`,
            [
              '**Expecting hot reload to fix native config.** Rebuild the app.',
              '**Wrong Firebase file.** Dev app talking to prod backend is painful.',
              '**Missing iOS usage string.** Permission dialogs need clear text.',
            ],
            'For camera, location, and notifications, list one Android file and one iOS file you must check.',
            'Native features need native paperwork. Code plus config equals working feature.',
          ),
          topic(
            'm5-t24',
            'Debugging Platform Channel Issues',
            'Platform channel bugs usually come from mismatched names, wrong argument types, missing native registration, or platform-side exceptions.',
            'If a parcel from Udupi to Bengaluru is lost, you check sender address, receiver address, tracking number, and counter receipt. Debug platform channels the same systematic way.',
            'Start from the Dart call, verify channel name, method name, arguments, native handler registration, native logs, result callback, and Dart exception handling. Use `adb logcat`, Xcode console, and Flutter logs.',
            'Advanced work feels less scary when debugging has a checklist.',
            [
              '**Step 1: Confirm Dart call runs.** Add a temporary log before invoke.',
              '**Step 2: Confirm exact channel and method names.** Copy-paste to avoid spelling drift.',
              '**Step 3: Inspect arguments.** Types must match.',
              '**Step 4: Read native logs.** Android Studio and Xcode show platform errors.',
              '**Step 5: Return both success and error properly.** Every native path must finish.',
            ],
            `Future<void> debugNativeCall() async {
  debugPrint('Calling native battery method');
  try {
    final result = await const MethodChannel('com.app/battery')
        .invokeMethod<int>('getBatteryLevel');
    debugPrint('Native result: ' + result.toString());
  } catch (error) {
    debugPrint('Native call failed: ' + error.toString());
  }
}`,
            [
              '**Changing Dart only.** Native handler may still be missing.',
              '**No native logs.** Flutter console is only half the story.',
              '**Forgetting to return result.** Native call hangs if no response is sent.',
            ],
            'Create a five-line checklist you will follow when MethodChannel says "MissingPluginException".',
            'Debug native bridges like parcel tracking: check every handoff point.',
          ),
          topic(
            'm5-t25',
            'Secure Native Configuration',
            'Native configuration can contain API keys, package names, bundle IDs, URL schemes, and capabilities. Some values are public identifiers; some secrets must never be shipped.',
            'A Bengaluru PG notice board can show Wi-Fi name, but not the router admin password. App config has the same rule: know what is public and what must be protected.',
            'Mobile apps cannot truly hide secrets shipped inside the app. Use backend servers for sensitive secrets. Keep Firebase rules strict, use secure storage for tokens, avoid printing secrets, and separate dev/prod config.',
            'Security mistakes in native setup can expose user data even when Dart code looks clean.',
            [
              '**Step 1: Classify config.** Public identifier, environment value, or secret.',
              '**Step 2: Never ship server secrets.** Put them on backend.',
              '**Step 3: Separate dev and prod.** Avoid testing with real user data.',
              '**Step 4: Lock backend rules.** Firebase rules matter more than hiding keys.',
              '**Step 5: Remove debug prints.** Logs can leak tokens.',
            ],
            `class AppEnvironment {
  final String apiBaseUrl;
  final bool analyticsEnabled;

  const AppEnvironment({
    required this.apiBaseUrl,
    required this.analyticsEnabled,
  });
}

const devEnvironment = AppEnvironment(
  apiBaseUrl: 'https://dev-api.example.com',
  analyticsEnabled: false,
);`,
            [
              '**Calling every key secret.** Some mobile keys are identifiers; backend rules still protect data.',
              '**Shipping private server keys.** That is never okay.',
              '**Mixing dev and prod.** One wrong config can damage real data.',
            ],
            'Make a table with three values: Firebase project id, server private key, API base URL. Mark public, secret, or environment-specific.',
            'Mobile config is visible enough to treat real secrets as backend-only.',
          ),
          topic(
            'm5-t26',
            'Choosing the Right Advanced Tool',
            'Advanced Flutter gives you many vehicles: plugin, MethodChannel, EventChannel, BasicMessageChannel, isolate, background task, FFI, platform view. The skill is choosing the smallest safe vehicle.',
            'You do not take a Volvo bus from Diana in Udupi to the next street, and you do not ride a bicycle from Kundapura to Bengaluru with luggage. Advanced tools are vehicles. Pick the smallest vehicle that safely carries the people and baggage.',
            'Use a plugin for common device features. Use MethodChannel for one-shot native calls. Use EventChannel for continuous native updates. Use isolates for CPU-heavy Dart work. Use background tasks for OS-approved delayed work. Use FFI for direct C libraries. Use platform views for native UI surfaces.',
            'This decision habit prevents over-engineering and under-engineering. It helps learners build practical apps without turning every feature into a complicated native adventure.',
            [
              '**Step 1: Identify the job.** Device API, continuous data, heavy CPU, background timing, native UI, or C library?',
              '**Step 2: Check plugin first.** Existing maintained plugin wins for common jobs.',
              '**Step 3: Pick the smallest bridge.** One result, stream, message pipe, or direct native library.',
              '**Step 4: Design failure states.** Every advanced tool can fail.',
              '**Step 5: Document the choice.** Future you should know why this tool was chosen.',
            ],
            `String chooseAdvancedTool(String job) {
  switch (job) {
    case 'one native answer':
      return 'MethodChannel';
    case 'many native updates':
      return 'EventChannel';
    case 'heavy Dart CPU work':
      return 'Isolate or compute';
    case 'existing C library':
      return 'FFI';
    case 'native UI surface':
      return 'Platform view';
    default:
      return 'Use a plugin if one exists';
  }
}`,
            [
              '**Using the fanciest tool.** Advanced does not mean better.',
              '**Ignoring maintenance.** Custom native code must be maintained for both platforms.',
              '**No decision record.** Write a short reason in code docs or project notes.',
            ],
            'For camera capture, step counter, large JSON parsing, and C image library, choose the correct tool and explain one sentence each.',
            'Advanced Flutter is mostly good vehicle selection.',
          ),
        ]

        return [
          {
            title: 'Platform Channels and Native Bridges',
            topics: topics.slice(0, 7),
          },
          {
            title: 'Plugins, Permissions, and Device APIs',
            topics: topics.slice(7, 13),
          },
          {
            title: 'Isolates, Background Work, and Notifications',
            topics: topics.slice(13, 21),
          },
          {
            title: 'FFI, Configuration, Debugging, and Tool Choice',
            topics: topics.slice(21, 26),
          },
        ]
      })(),
      projects: [
        {
          id: 'm5-p1',
          type: 'Mini Project',
          title: 'Kannada Speech Notes Platform Channel',
          domain: 'Platform Channels',
          duration: '4 hours',
          description:
            'Build a notes app that calls a native speech-to-text feature through a clean Dart service. Keep the learning flow simple: tap mic, ask permission, receive Kannada text, save the note, and show friendly errors.',
          tools: ['Flutter', 'Dart', 'MethodChannel', 'Permissions', 'Native Speech APIs'],
          blueprint: {
            overview:
              'A small app where Flutter UI talks to native speech recognition through a MethodChannel instead of mixing native details into widgets.',
            functionalRequirements: [
              '**Mic flow.** Tap a button to start listening and show clear permission state.',
              '**Speech result.** Display recognized Kannada text in an editable note field.',
              '**Save notes.** Store a simple list of notes locally.',
              '**Error states.** Show friendly messages for denied permission and unavailable speech.',
              '**History.** Show recent notes with created time.',
            ],
            technicalImplementation: [
              '**Dart service.** Create `SpeechNotesService` that wraps MethodChannel.',
              '**Native contract.** Use method name `listenKannada` and return plain text.',
              '**Permission.** Ask microphone permission only when user taps record.',
              '**State.** Use loading, listening, success, and error states.',
              '**Testing.** Mock the service to test UI without native speech.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Scaffold',
                outcome: 'Notes UI created',
                prompt:
                  'Create a Flutter notes app with a home screen, mic button, editable note text field, and recent notes list.',
              },
              {
                step: 2,
                label: 'Bridge',
                outcome: 'Dart MethodChannel service added',
                prompt:
                  'Add SpeechNotesService with MethodChannel com.thanthrajnaani.speech/notes and method listenKannada. Catch PlatformException and return friendly failures.',
              },
              {
                step: 3,
                label: 'Permission',
                outcome: 'Microphone permission flow works',
                prompt:
                  'Ask microphone permission only when the user taps the mic. Show denied and permanently denied states clearly.',
              },
              {
                step: 4,
                label: 'Native',
                outcome: 'Native speech result reaches Flutter',
                prompt:
                  'Implement the native handler or a temporary fake native response so the Flutter flow can be tested end to end.',
              },
              {
                step: 5,
                label: 'Polish',
                outcome: 'Notes app feels reliable',
                prompt:
                  'Add loading/listening states, save notes locally, and write widget tests with a fake speech service.',
              },
            ],
            deliverable:
              'A Kannada speech-to-text notes app that teaches platform channels without drowning the learner in native setup.',
          },
        },
        {
          id: 'm5-p2',
          type: 'Project',
          title: 'Bengaluru Traffic Feed Isolate Parser',
          domain: 'Performance',
          duration: '1 day',
          description:
            'Create a traffic incident feed that parses a large JSON response off the main isolate, keeps scrolling smooth, and explains performance using the Silk Board traffic analogy.',
          tools: ['Flutter', 'Dart', 'compute', 'Isolates', 'DevTools'],
          blueprint: {
            overview:
              'A performance-focused feed where heavy JSON parsing moves away from the UI isolate.',
            functionalRequirements: [
              '**Large feed.** Load at least 1000 traffic incident records from local or mock JSON.',
              '**Smooth UI.** Show skeleton loading and keep scrolling responsive.',
              '**Parser.** Convert raw JSON into typed `TrafficIncident` models.',
              '**Toggle.** Compare main-isolate parse and compute-based parse.',
              '**Metrics.** Show simple parse duration in milliseconds.',
            ],
            technicalImplementation: [
              '**Model.** Build `TrafficIncident.fromJson` with safe defaults.',
              '**Parser function.** Keep top-level parser compatible with `compute`.',
              '**Repository.** Hide raw data loading behind a repository.',
              '**UI.** Add filter chips for area, severity, and status.',
              '**Verification.** Use Flutter DevTools to compare jank before and after.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Data',
                outcome: 'Mock traffic JSON ready',
                prompt:
                  'Create mock JSON for Bengaluru traffic incidents with area, severity, delayMinutes, and updatedAt fields.',
              },
              {
                step: 2,
                label: 'Models',
                outcome: 'Typed incident models parse safely',
                prompt:
                  'Implement TrafficIncident model and parser for a list of JSON maps.',
              },
              {
                step: 3,
                label: 'Isolate',
                outcome: 'compute parser added',
                prompt:
                  'Move large JSON parsing into a top-level function and call it using compute.',
              },
              {
                step: 4,
                label: 'Compare',
                outcome: 'Performance difference visible',
                prompt:
                  'Add a UI toggle to parse on main isolate or background isolate and show duration.',
              },
              {
                step: 5,
                label: 'Polish',
                outcome: 'Feed is usable and smooth',
                prompt:
                  'Add loading, empty, error, filters, and a short explanation panel for why isolate parsing helps.',
              },
            ],
            deliverable:
              'A smooth traffic feed that makes isolates memorable through a real Bengaluru traffic example.',
          },
        },
        {
          id: 'm5-p3',
          type: 'Capstone',
          title: 'Instagram Clone: Camera, Location Tags, and Push',
          domain: 'Advanced Native Features',
          duration: '2 days',
          description:
            'Extend the Instagram clone with camera capture, gallery picker, image compression, optional Udupi/Kundapura/Bengaluru location tags, deep links to posts, and push notification setup.',
          tools: ['Flutter', 'Dart', 'Camera/Image Picker', 'Geolocator', 'Firebase Messaging', 'Deep Links'],
          blueprint: {
            overview:
              'A native-feature upgrade for the Instagram clone where media capture, location, notifications, and routing feel like one complete post flow.',
            functionalRequirements: [
              '**Create post.** Choose camera or gallery and preview the selected image.',
              '**Location tag.** Let user attach current location or manually choose Udupi, Kundapura, or Bengaluru.',
              '**Compression.** Prepare a smaller upload image without freezing UI.',
              '**Push.** Register FCM token and handle a sample comment notification.',
              '**Deep link.** Tapping a notification opens the correct post screen.',
            ],
            technicalImplementation: [
              '**Permissions.** Request camera, photo, location, and notification permissions only when needed.',
              '**Media service.** Wrap camera/gallery and compression inside services.',
              '**Location service.** Use one-time location for post tags.',
              '**Notification service.** Initialize Firebase Messaging, token refresh, and foreground messages.',
              '**Routing.** Parse post deep links and guard private routes behind login.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Media',
                outcome: 'Photo selection flow works',
                prompt:
                  'Add create-post flow with camera/gallery choice, preview screen, cancel handling, and friendly permission messages.',
              },
              {
                step: 2,
                label: 'Location',
                outcome: 'Location tags attach to posts',
                prompt:
                  'Add optional location tagging with current location and manual city choices: Udupi, Kundapura, Bengaluru.',
              },
              {
                step: 3,
                label: 'Performance',
                outcome: 'Image prep does not freeze UI',
                prompt:
                  'Compress or resize selected image before upload and keep the UI responsive with loading progress.',
              },
              {
                step: 4,
                label: 'Push',
                outcome: 'Notification setup is ready',
                prompt:
                  'Initialize Firebase Messaging, request permission, print/store FCM token, and handle foreground comment notification.',
              },
              {
                step: 5,
                label: 'Routing',
                outcome: 'Notification opens correct post',
                prompt:
                  'Add deep link parsing for /posts/:postId and route notification taps to the matching post screen after login check.',
              },
            ],
            deliverable:
              'An Instagram clone upgrade where camera, location, push, and deep links work together in a real post experience.',
          },
        },
      ],
      quiz: [
        {
          question: 'Which tool is best for one Flutter call that asks Android for the current battery level?',
          options: ['MethodChannel', 'EventChannel', 'FFI', 'Platform view'],
          answer: 0,
          explain:
            'Battery level is one question with one answer, so MethodChannel is the smallest correct bridge.',
        },
        {
          question: 'When should you use EventChannel instead of MethodChannel?',
          options: [
            'When native sends continuous updates like steps or GPS movement',
            'When you need to draw a normal button',
            'When JSON parsing takes 2 milliseconds',
            'When storing a username locally',
          ],
          answer: 0,
          explain:
            'EventChannel exposes a stream. It fits ongoing native data, not one-time calls or normal UI.',
        },
        {
          question: 'What is the main reason to move large JSON parsing to `compute`?',
          options: [
            'To keep the UI isolate free and avoid jank',
            'To make the API server faster',
            'To skip model classes',
            'To avoid internet permission',
          ],
          answer: 0,
          explain:
            'Network waiting is async, but big parsing is CPU work. `compute` moves that work away from the UI isolate.',
        },
        {
          question: 'For an Instagram-style app, when is the best time to ask camera permission?',
          options: [
            'When the user taps camera or create photo post',
            'Immediately when the app first opens',
            'After the photo is already uploaded',
            'Only after uninstalling the app',
          ],
          answer: 0,
          explain:
            'Permission makes sense when the user understands the feature. Ask close to the action.',
        },
        {
          question: 'Which statement about mobile secrets is safest?',
          options: [
            'Do not ship real server secrets inside the mobile app',
            'Hide all secrets in a Dart constant',
            'Print tokens so debugging is easy',
            'Firebase rules are unnecessary if the key is hard to find',
          ],
          answer: 0,
          explain:
            'Mobile app contents can be inspected. Real secrets belong on a backend, and backend/Firebase rules must protect data.',
        },
      ],
    },
    {
      id: 'm6',
      title: 'Testing, Build & Deploy',
      hours: 12,
      color: 'from-yellow-500/20 to-yellow-700/10',
      accent: 'yellow',
      description:
        'Unit, widget, and integration tests, CI/CD, flavors, signing, Play Store, App Store, web, desktop.',
      sections: (() => {
        const commonPitfalls = [
          '**Testing only happy paths.** A hotel bill app that works only when the customer orders one idli is not tested enough.',
          '**Mocking everything.** If you fake the whole Bengaluru traffic system, your test may pass while the real route screen fails.',
          '**Skipping release mode.** Debug builds are forgiving; release builds are the final exam hall.',
          '**Putting secrets in the app.** Mobile apps can be opened and inspected, so never hide real server secrets inside them.',
          '**Changing flavor config by hand.** Manual edits before every build are how Udupi parcel orders accidentally go to Bengaluru.',
          '**Deploying without a checklist.** Store release is not one button; it is a counter process with forms, signatures, screenshots, and patience.',
        ]

        const topic = (
          id,
          title,
          explain,
          analogy,
          theory,
          whyItMatters,
          steps,
          code,
          pitfalls,
          tryIt,
          takeaway,
        ) => ({
          id,
          title,
          explain,
          analogy,
          theory,
          whyItMatters,
          steps,
          code,
          pitfalls: [...commonPitfalls, ...pitfalls],
          tryIt,
          takeaway,
        })

        const topics = [
          topic(
            'm6-t1',
            'Why Testing Matters',
            'Testing means asking your app small questions before users ask painful questions. Instead of tapping every screen manually like a tired shop owner counting coins at midnight, tests repeat checks for you. A good test says: when I give this input, I expect this exact output. If tomorrow you change code and break something, the test shouts early.',
            'Think of Manipal Hospital token system. Before the rush starts, staff checks whether token numbers print correctly, counters call the right patient, and emergency cases do not get lost. Testing your Flutter app is the same: check the system before real people depend on it.',
            'Flutter testing usually has three layers. Unit tests check plain Dart logic. Widget tests check UI behavior without a real phone. Integration tests run bigger flows on an emulator or device. The goal is confidence: small tests catch logic mistakes quickly, bigger tests catch wiring mistakes.',
            'Without tests, every feature becomes scary. You fix login and accidentally break feed refresh. You improve cart total and break discount calculation. Tests make refactoring feel like using Google Maps in Bengaluru: still traffic, but at least you know where the turn is.',
            [
              'List the most important user promises in the app.',
              'Start with plain logic that does not need Flutter UI.',
              'Add widget tests for screens with forms, buttons, and visible states.',
              'Add integration tests for complete flows like login to feed.',
              'Run tests before every important build.',
            ],
            "test('adds hotel bill items', () {\n  final total = 40 + 25 + 10;\n\n  expect(total, 75);\n});",
            [
              '**Testing after everything is built.** Add tests while building, not only when the app is already too big.',
              '**Testing implementation details.** Prefer checking visible results and public behavior.',
            ],
            'Write three promises for an Instagram-style app: login works, post appears in feed, and like count increases. Mark each as unit, widget, or integration test.',
            'Tests are your early warning system. They protect user promises before users discover broken promises.',
          ),
          topic(
            'm6-t2',
            'The Test Pyramid',
            'The test pyramid is a simple idea: many small tests at the bottom, fewer large tests at the top. Unit tests are cheap and fast, so write many. Widget tests are medium. Integration tests are powerful but slower, so use them for the most important journeys.',
            'Do not use a Volvo bus to carry one masala dosa parcel from Diana in Udupi to a nearby house. Use a small vehicle for small jobs and a bigger vehicle for bigger jobs. Same with tests: unit test for small logic, integration test for full journeys.',
            'A healthy Flutter app usually has many unit tests, a good number of widget tests, and selected integration tests. This keeps the suite fast enough to run often while still covering real behavior. The pyramid is not a law; it is a cost guide.',
            'If every test launches the full app, your CI becomes slow. If every test is tiny and isolated, you may miss broken screens. The pyramid helps you balance speed and confidence.',
            [
              'Put pure Dart calculations in unit tests.',
              'Put UI state changes in widget tests.',
              'Put login, checkout, upload, and navigation flows in integration tests.',
              'Keep slow tests focused on business-critical paths.',
              'Review the pyramid when tests become too slow or too weak.',
            ],
            "/// Example pyramid plan:\n/// 40 unit tests: validators, models, repositories\n/// 18 widget tests: forms, lists, empty states\n/// 5 integration tests: login, post upload, profile edit",
            [
              '**Upside-down pyramid.** Too many integration tests can make feedback painfully slow.',
              '**No top layer.** Unit tests alone cannot prove screens are wired correctly.',
            ],
            'Take one app feature, like uploading a post. Write one unit test idea, one widget test idea, and one integration test idea.',
            'Use the smallest test that gives real confidence. Small checks should carry small jobs.',
          ),
          topic(
            'm6-t3',
            'Unit Tests with package:test',
            'A unit test checks one small piece of Dart logic. It does not need a screen, a phone, or a button. It is perfect for validators, calculators, formatters, mappers, and repository decisions.',
            'A Bengaluru darshini cashier checks one bill before handing it to the customer. They do not inspect the full kitchen, dining area, and parking lot for every bill. Unit tests are that focused cashier check.',
            'Flutter projects can use the `test` package through `flutter_test`. A test file usually lives in `test/` and ends with `_test.dart`. You call `test`, run the function, and use `expect` to compare actual value with expected value.',
            'Unit tests are fast. They let you test many edge cases, like empty names, invalid phone numbers, zero totals, and failed parsing, without opening the whole app.',
            [
              'Create a file like `test/price_calculator_test.dart`.',
              'Import `package:flutter_test/flutter_test.dart`.',
              'Write one `test` with a clear name.',
              'Call the function being tested.',
              'Use `expect(actual, expected)`.',
            ],
            "import 'package:flutter_test/flutter_test.dart';\n\nint addGst(int price) => (price * 1.18).round();\n\nvoid main() {\n  test('adds 18 percent GST to a Udupi meal bill', () {\n    expect(addGst(100), 118);\n  });\n}",
            [
              '**Testing many things in one test.** One failing reason per test is easier to debug.',
              '**Vague names.** `test works` tells you nothing when it fails.',
            ],
            'Write a unit test for a function that returns `true` only when a phone number has 10 digits.',
            'Unit tests are the fastest way to lock down plain Dart behavior.',
          ),
          topic(
            'm6-t4',
            'Arrange, Act, Assert',
            'Arrange, Act, Assert is the simplest test rhythm. Arrange means prepare the data. Act means run the thing. Assert means check the result. This makes tests readable even after two months when your brain has moved to another problem.',
            'At a Kundapura parcel counter: arrange the parcel and address, act by handing it to the counter, assert by checking the receipt. If you mix all three, nobody knows whether the parcel, counter, or receipt caused the problem.',
            'AAA is not a Flutter feature; it is a testing habit. It works for unit, widget, and integration tests. Keeping these stages separate makes failures easier to understand and tests easier to maintain.',
            'Readable tests become documentation. A junior developer can read the test and understand what the feature promises, without asking five people and one group chat.',
            [
              'Arrange the input objects, fake data, and initial state.',
              'Act by calling exactly the behavior you want to test.',
              'Assert the result, visible UI, or method call.',
              'Keep each stage visually separated with blank lines.',
              'Rename variables until the test reads like a tiny story.',
            ],
            "test('applies student discount to bus ticket', () {\n  // Arrange\n  const ticketPrice = 200;\n  const studentDiscount = 50;\n\n  // Act\n  final finalPrice = ticketPrice - studentDiscount;\n\n  // Assert\n  expect(finalPrice, 150);\n});",
            [
              '**Too much Arrange.** If setup is huge, extract helpers carefully.',
              '**No clear Act.** A test should have one main behavior under inspection.',
            ],
            'Rewrite any messy test idea into three comments: Arrange, Act, Assert.',
            'AAA makes tests calm: prepare, do, check.',
          ),
          topic(
            'm6-t5',
            'Fakes, Mocks, and Stubs',
            'Sometimes your code talks to APIs, databases, location, camera, or payment services. In tests, you often replace those real services with controlled test doubles. A fake has working simple behavior. A stub returns fixed answers. A mock records calls so you can verify interactions.',
            'If you are training a new cashier at MTR, you do not use real customers with real money on day one. You use practice bills. Fakes and mocks are practice counters for your app.',
            'In Flutter, test doubles are commonly created by hand or with packages like mocktail/mockito. Repositories should depend on interfaces or injectable clients so tests can replace the real network with fake responses.',
            'Test doubles make tests fast, reliable, and safe. You do not want unit tests depending on real internet, real Firebase, or a real camera permission popup.',
            [
              'Identify the external dependency.',
              'Create an interface or class boundary around it.',
              'Inject that dependency into the class being tested.',
              'Use a fake or mock version in tests.',
              'Assert the app behavior, not the external service itself.',
            ],
            "class FakeMenuApi {\n  Future<List<String>> fetchItems() async {\n    return ['idli', 'vada', 'coffee'];\n  }\n}\n\ntest('loads fake breakfast menu', () async {\n  final api = FakeMenuApi();\n\n  final items = await api.fetchItems();\n\n  expect(items, contains('coffee'));\n});",
            [
              '**Mocking simple values.** Do not mock what can be created normally.',
              '**Testing the mock instead of app behavior.** The user cares what the app shows.',
            ],
            'Create a fake API that returns two posts: one from Udupi and one from Bengaluru. Test that the repository returns both.',
            'Use test doubles to control outside services without dragging the whole outside world into your test.',
          ),
          topic(
            'm6-t6',
            'Testing Repositories and Services',
            'Repositories decide where data comes from: API, cache, database, or memory. Service tests check those decisions. For example: if network succeeds, use fresh data; if network fails, use cached data.',
            'A Kundapura fish market seller first checks today\'s fresh catch. If rain blocks supply, they use yesterday\'s preserved stock and tell the customer clearly. A repository makes the same kind of fallback decision.',
            'Repository tests usually fake API clients and local storage. You test success, failure, empty data, bad JSON, and cache fallback. This is where app reliability becomes visible.',
            'Many real bugs live in service logic, not buttons. Testing repositories protects offline mode, retry logic, error messages, and data transformation.',
            [
              'Inject fake API and fake cache into the repository.',
              'Test the success path with fresh API data.',
              'Test API failure with cached data.',
              'Test API failure without cached data.',
              'Check that errors are converted into friendly states.',
            ],
            "test('uses cache when menu API fails', () async {\n  final repo = MenuRepository(\n    api: FailingMenuApi(),\n    cache: FakeMenuCache(['neer dosa']),\n  );\n\n  final items = await repo.loadMenu();\n\n  expect(items, ['neer dosa']);\n});",
            [
              '**Only testing API success.** Offline and failure paths matter more in real life.',
              '**Using real storage.** Keep repository unit tests isolated unless you are intentionally doing integration testing.',
            ],
            'Design three repository tests for an Instagram feed: fresh posts, cached posts, and no internet with empty cache.',
            'Repository tests prove your app behaves sensibly when the outside world is messy.',
          ),
          topic(
            'm6-t7',
            'Widget Test Basics',
            'A widget test checks what appears on the screen and what happens when the user taps or types. It runs faster than a real device test because Flutter builds the widget in a test environment.',
            'Before opening a new Udupi cafe, the owner checks whether menu boards, token display, and payment counter are visible. They do not wait for a full Sunday rush to notice the coffee board is missing. Widget tests check screens early.',
            'Widget tests use `testWidgets`, a `WidgetTester`, `pumpWidget`, finders, actions like `tap` and `enterText`, and expectations. They are ideal for forms, buttons, loading states, empty states, and navigation triggers.',
            'UI code breaks easily when text, state, or layout changes. Widget tests catch broken labels, missing buttons, disabled states, and forms that do not submit.',
            [
              'Create a `testWidgets` block.',
              'Pump the widget inside a `MaterialApp` if it needs Material features.',
              'Find text, icons, fields, or buttons.',
              'Interact with the widget.',
              'Pump again and assert the visible result.',
            ],
            "testWidgets('shows login title', (tester) async {\n  await tester.pumpWidget(\n    const MaterialApp(home: Text('Login to Udupi Feed')),\n  );\n\n  expect(find.text('Login to Udupi Feed'), findsOneWidget);\n});",
            [
              '**Forgetting MaterialApp.** Many widgets need app context, theme, navigator, or localization.',
              '**Testing pixels too early.** Start with visible behavior before exact visuals.',
            ],
            'Write a widget test idea for a login button that becomes enabled only after email and password are typed.',
            'Widget tests check whether the screen behaves the way the user expects.',
          ),
          topic(
            'm6-t8',
            'Finders, Matchers, and Keys',
            'Finders locate widgets. Matchers check how many were found or what state exists. Keys give important widgets stable names so tests do not depend only on visible text.',
            'In Majestic bus stand, you find your bus by platform number, route board, or vehicle number. In widget tests, `find.text`, `find.byIcon`, and `find.byKey` are your platform numbers.',
            'Common finders include `find.text`, `find.byType`, `find.byIcon`, and `find.byKey`. Matchers include `findsOneWidget`, `findsNothing`, and `findsNWidgets`. Keys are helpful when text changes due to language or copy updates.',
            'Good finders make tests stable. If every test depends on exact English text, a small copy improvement can break many tests even though the app still works.',
            [
              'Use text finders for user-visible labels that are part of behavior.',
              'Use keys for important controls like submit buttons and list items.',
              'Use type finders sparingly when many widgets share the same type.',
              'Use clear key names such as `loginSubmitButton`.',
              'Assert exact counts when duplicates matter.',
            ],
            "const loginButtonKey = Key('loginSubmitButton');\n\nElevatedButton(\n  key: loginButtonKey,\n  onPressed: submit,\n  child: const Text('Login'),\n);\n\n// Test:\nexpect(find.byKey(loginButtonKey), findsOneWidget);",
            [
              '**Overusing keys everywhere.** Add keys to meaningful test targets, not every tiny widget.',
              '**Finding by fragile text.** If text is decorative or likely to change, prefer a key.',
            ],
            'Add key names for a feed refresh button, post card, and profile edit button.',
            'Finders are how tests point at the right UI element without confusion.',
          ),
          topic(
            'm6-t9',
            'pump and pumpAndSettle',
            '`pump` tells Flutter to build the next frame. `pumpAndSettle` keeps pumping until animations and scheduled frames finish. In widget tests, actions often need a pump before the UI updates.',
            'If you order coffee at a Bengaluru darshini, you do not shout result immediately after paying. You wait one beat for the counter to prepare it. `pump` is that one beat. `pumpAndSettle` waits until the counter stops moving.',
            'Flutter UI updates happen in frames. After tapping, entering text, navigation, or state change, the test must allow Flutter to rebuild. `pump` is precise; `pumpAndSettle` is convenient but can hang if animation never stops.',
            'Many beginner widget tests fail because the test checks too soon. Learning pump timing makes tests less mysterious.',
            [
              'Pump the initial widget.',
              'Perform an action such as tap or enterText.',
              'Call `pump` for a normal rebuild.',
              'Call `pumpAndSettle` for navigation or finite animations.',
              'Avoid `pumpAndSettle` when an infinite animation is running.',
            ],
            "await tester.tap(find.text('Login'));\nawait tester.pump();\n\nexpect(find.text('Checking account...'), findsOneWidget);\n\nawait tester.pumpAndSettle();\nexpect(find.text('Welcome'), findsOneWidget);",
            [
              '**Expecting instant UI changes.** Actions usually need a pump.',
              '**Settling forever.** Infinite progress indicators can keep frames alive.',
            ],
            'Create a test plan for tapping a button that first shows loading and then shows success.',
            'In widget tests, tap first, pump next, expect after Flutter has had time to rebuild.',
          ),
          topic(
            'm6-t10',
            'Testing Forms and Validation',
            'Form tests check whether text fields, validators, error messages, and submit buttons behave correctly. They are perfect for login, signup, search, checkout, and profile edit screens.',
            'A lodge in Udupi does not accept a guest register with name blank and phone number as `123`. Form validation is the reception desk saying, please fill this properly before we give the room key.',
            'Flutter forms commonly use `Form`, `TextFormField`, validators, controllers, and a submit button. Widget tests can type text, tap submit, and check for validation messages or successful callbacks.',
            'Forms are user-facing and error-prone. Good tests prevent embarrassing mistakes like allowing empty passwords or blocking valid phone numbers.',
            [
              'Pump the screen with the form.',
              'Tap submit with empty fields and expect errors.',
              'Enter invalid data and expect specific validation errors.',
              'Enter valid data and tap submit.',
              'Verify success callback, navigation, or state change.',
            ],
            "await tester.enterText(find.byKey(const Key('phoneField')), '123');\nawait tester.tap(find.byKey(const Key('submitButton')));\nawait tester.pump();\n\nexpect(find.text('Enter a 10 digit phone number'), findsOneWidget);",
            [
              '**Only testing valid input.** Invalid input is where users spend half their time.',
              '**Unclear error text.** Test that errors help the user fix the problem.',
            ],
            'Write validation rules for an Instagram clone signup form: name, phone, password, and username.',
            'Form tests protect the front door of your app.',
          ),
          topic(
            'm6-t11',
            'Golden Tests',
            'Golden tests compare a widget screenshot with a saved reference image. They are useful when visual layout matters, like cards, profile headers, or design-system components.',
            'A Yakshagana artist checks costume, crown, and makeup against the expected character look before going on stage. Golden tests do the same for important UI: does this still look like the approved design?',
            'Golden tests render widgets and compare pixels. They are powerful but sensitive to fonts, platform rendering, screen size, and theme changes. Use them for stable components, not every screen.',
            'Golden tests catch accidental visual changes that normal widget tests miss, such as broken spacing, missing avatar circles, or wrong button colors.',
            [
              'Pick a stable widget with important visuals.',
              'Set a fixed surface size and theme.',
              'Render the widget with predictable data.',
              'Compare against a golden image.',
              'Review golden changes intentionally when design changes.',
            ],
            "testWidgets('profile card matches golden', (tester) async {\n  await tester.pumpWidget(const MaterialApp(home: ProfileCardPreview()));\n\n  await expectLater(\n    find.byType(ProfileCardPreview),\n    matchesGoldenFile('goldens/profile_card.png'),\n  );\n});",
            [
              '**Golden testing everything.** Too many golden files become noisy.',
              '**Uncontrolled fonts or sizes.** Keep rendering conditions stable.',
            ],
            'Choose three widgets from an Instagram-style app that deserve golden tests.',
            'Golden tests guard important visuals, but use them where visual precision is worth the maintenance.',
          ),
          topic(
            'm6-t12',
            'Integration Tests',
            'Integration tests run a bigger slice of the app on an emulator or real device. They check complete journeys: launch app, login, open feed, create post, logout.',
            'A KSRTC trial trip from Kundapura to Bengaluru is not just checking the bus engine. It checks driver, route, stops, ticket, luggage, and arrival. Integration tests check the full journey.',
            'Flutter uses the `integration_test` package for end-to-end flows. These tests are slower than unit and widget tests but give high confidence that screens, navigation, services, and platform behavior work together.',
            'Some bugs only appear when pieces meet. A login button may work alone, repository may work alone, but navigation after login may still be broken. Integration tests catch that.',
            [
              'Add `integration_test` to the project.',
              'Create a test file in `integration_test/`.',
              'Launch the real app or test entry point.',
              'Perform the user journey with tester actions.',
              'Run on emulator, simulator, or device.',
            ],
            "void main() {\n  IntegrationTestWidgetsFlutterBinding.ensureInitialized();\n\n  testWidgets('user can open feed', (tester) async {\n    app.main();\n    await tester.pumpAndSettle();\n\n    expect(find.text('Feed'), findsOneWidget);\n  });\n}",
            [
              '**Testing too many tiny details.** Integration tests should focus on important journeys.',
              '**Depending on live random data.** Use predictable test accounts or test backend data.',
            ],
            'Define one integration test for posting a photo: login, tap create, choose fake image, add caption, publish, see it in feed.',
            'Integration tests prove the route works from start to finish.',
          ),
          topic(
            'm6-t13',
            'Debug, Profile, and Release Builds',
            'Flutter has different build modes. Debug is for development with hot reload and helpful checks. Profile measures performance. Release is optimized for real users.',
            'Practice cricket in a Udupi ground, net session, and final match are different moods. Debug is practice, profile is serious timing, release is match day. Do not judge final performance from practice mode.',
            'Debug builds are slower and include development tools. Profile builds keep performance tracing. Release builds optimize Dart and platform code, remove debug aids, and behave closest to store builds.',
            'Some issues only show in release: minification, signing, permissions, asset paths, native config, and performance. Always test release before shipping.',
            [
              'Use debug while coding.',
              'Use profile when measuring performance.',
              'Use release for final pre-store testing.',
              'Run the app on a real device in release mode.',
              'Keep mode-specific assumptions out of app logic.',
            ],
            "# Common commands\nflutter run\nflutter run --profile\nflutter run --release\nflutter build apk --release",
            [
              '**Shipping after only debug testing.** Release can expose hidden config issues.',
              '**Measuring performance in debug.** Debug mode includes extra overhead.',
            ],
            'Run your current Flutter app in debug and release mode. Note one visible difference in logs, speed, or behavior.',
            'Debug is for building, profile is for measuring, release is for users.',
          ),
          topic(
            'm6-t14',
            'Flavors and Build Variants',
            'Flavors let one app have multiple personalities: development, staging, and production. Each flavor can use different app names, API URLs, icons, Firebase projects, and feature switches.',
            'Yakshagana performers can change costume and makeup for different roles while the artist underneath is the same person. Flutter flavors are like that: same codebase, different role for dev, staging, or production.',
            'Android uses product flavors. iOS uses schemes and configurations. Flutter can pass values with `--flavor` and `--dart-define`. A clean flavor setup prevents accidental production changes during testing.',
            'Without flavors, developers may test against production by mistake or ship a staging API to real users. That is like sending a trial bus full of test passengers to the real Bengaluru route board.',
            [
              'Decide the environments: dev, staging, prod.',
              'Give each environment a clear app name and bundle id if needed.',
              'Configure API base URLs per flavor.',
              'Configure Firebase or native files per flavor.',
              'Build and test each flavor before release.',
            ],
            "# Example commands\nflutter run --flavor dev --dart-define=APP_ENV=dev\nflutter build apk --flavor prod --dart-define=APP_ENV=prod",
            [
              '**One hidden global URL.** Make environment choice explicit.',
              '**Manual file swapping.** Automate flavor config to avoid mistakes.',
            ],
            'Plan dev, staging, and prod names for an Instagram clone. Example: Thanthra Feed Dev, Thanthra Feed Staging, Thanthra Feed.',
            'Flavors keep testing and real users in separate, clearly labeled lanes.',
          ),
          topic(
            'm6-t15',
            'Environment Configuration',
            'Environment configuration is how your app knows which API, feature flags, analytics settings, and app behavior to use for a given build. It should be clear, repeatable, and safe.',
            'A Kundapura to Bengaluru ticket must say date, bus type, seat, and destination. If the ticket only says travel somewhere, chaos. Environment config is the clear ticket for your app build.',
            '`--dart-define` can pass compile-time values into Flutter. Packages and native configs can also help manage environment files. Sensitive secrets should stay on your server, not inside mobile config.',
            'Good config prevents embarrassing mistakes: dev banners in production, production payment on test app, staging API in store release, or feature flags stuck in the wrong state.',
            [
              'List every value that changes by environment.',
              'Keep public config in controlled files or dart defines.',
              'Keep real secrets on secure backend services.',
              'Show a visible debug banner for dev/staging builds.',
              'Print safe environment info in debug logs only.',
            ],
            "class AppConfig {\n  static const env = String.fromEnvironment('APP_ENV', defaultValue: 'dev');\n  static const apiBaseUrl = String.fromEnvironment(\n    'API_BASE_URL',\n    defaultValue: 'https://dev.example.com',\n  );\n}",
            [
              '**Calling public config a secret.** Anything shipped in the app can be inspected.',
              '**No visible environment marker.** Developers should quickly know whether they are in dev or prod.',
            ],
            'Create a tiny `AppConfig` plan with app name, API URL, and analytics enabled true/false for dev and prod.',
            'Environment config tells the same codebase which lane it is driving in.',
          ),
          topic(
            'm6-t16',
            'Android Signing and App Bundles',
            'Android signing proves that an app update comes from the same owner. For Play Store release, Flutter commonly builds an Android App Bundle, also called AAB.',
            'A hotel parcel without the correct stamp can be rejected at the counter. Android signing is that official stamp. The AAB is the neatly packed parcel format Play Store prefers.',
            'Android release setup involves a keystore, key alias, passwords, Gradle signing config, and `flutter build appbundle`. You must protect the keystore and passwords because losing them can block future updates.',
            'Store release fails without signing. Bad signing hygiene can create serious long-term problems, especially when you need to update the app later.',
            [
              'Create or obtain the release keystore.',
              'Store keystore and passwords securely.',
              'Configure Android signing in Gradle through safe properties.',
              'Build an AAB for Play Store.',
              'Install and test a release APK/AAB path before rollout.',
            ],
            "# Typical release build\nflutter build appbundle --release\n\n# Output is usually under:\n# build/app/outputs/bundle/release/",
            [
              '**Committing keystore passwords.** Keep signing secrets out of git.',
              '**Losing the keystore.** Back it up securely before release.',
            ],
            'Write a release checklist item: where the keystore is stored, who has access, and how passwords are protected.',
            'Android release needs a signed package. Treat signing keys like house keys, not sticky notes.',
          ),
          topic(
            'm6-t17',
            'iOS Signing and TestFlight',
            'iOS release uses certificates, profiles, bundle identifiers, and App Store Connect. TestFlight lets testers install a near-store version before public release.',
            'A Bengaluru apartment visitor needs gate approval, flat number, and entry record. iOS signing is similarly strict: the device, app id, certificate, and profile must all agree.',
            'Flutter iOS builds depend on Xcode configuration. You set bundle id, team, signing, version, build number, permissions, and assets. TestFlight is the safe testing lane before App Store release.',
            'iOS deployment has more paperwork than debug running. Understanding the pieces reduces panic when Xcode gives a long red error.',
            [
              'Set the correct bundle identifier.',
              'Choose the Apple developer team.',
              'Configure signing certificates and provisioning profiles.',
              'Archive from Xcode or build using Flutter and upload.',
              'Test through TestFlight before public release.',
            ],
            "# Common Flutter build command for iOS release\nflutter build ipa --release\n\n# Upload usually happens through Xcode Organizer or Transporter.",
            [
              '**Bundle id mismatch.** App Store Connect, Xcode, and Firebase must agree.',
              '**Ignoring permission text.** iOS requires clear user-facing permission descriptions.',
            ],
            'List the iOS permissions your app needs and write friendly permission text for camera and photos.',
            'iOS release is strict, but it becomes manageable when each certificate and profile has a clear job.',
          ),
          topic(
            'm6-t18',
            'CI/CD Basics',
            'CI/CD means your project can automatically test, build, and sometimes deploy whenever code changes. CI is continuous integration. CD is continuous delivery or deployment.',
            'MTR breakfast assembly line works because each station has a job: batter, dosa pan, chutney, billing, serving. CI/CD is the app release assembly line: checkout code, install dependencies, test, build, archive.',
            'Common CI tools include GitHub Actions, Codemagic, Bitrise, and GitLab CI. A Flutter pipeline usually installs Flutter, gets packages, runs analyze, runs tests, and builds release artifacts.',
            'Automation prevents the classic problem: it works on my laptop, but fails on everyone else\'s. CI gives the whole team one shared truth.',
            [
              'Choose a CI provider.',
              'Run `flutter pub get`.',
              'Run `flutter analyze`.',
              'Run unit and widget tests.',
              'Build at least one release artifact.',
            ],
            "name: Flutter CI\n\non: [push, pull_request]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: subosito/flutter-action@v2\n      - run: flutter pub get\n      - run: flutter analyze\n      - run: flutter test",
            [
              '**Only building locally.** CI should prove the project builds from a clean checkout.',
              '**Skipping analyze.** Static issues are cheap to catch early.',
            ],
            'Sketch a CI pipeline with four steps for your app: get packages, analyze, test, build.',
            'CI/CD is the disciplined counter line that checks every code parcel before release.',
          ),
          topic(
            'm6-t19',
            'Scheduled and Manual CI Runs',
            'Not every CI run must wait for a code push. Scheduled runs happen at fixed times. Manual runs let you start a workflow when needed, like before a release.',
            'A KSRTC timetable does not wait for passengers to shout. The bus has scheduled trips. Manual CI is like requesting an extra special trip when a festival crowd appears.',
            'GitHub Actions supports `schedule` for cron-based runs and `workflow_dispatch` for manual starts. Scheduled jobs are useful for nightly integration tests, dependency checks, and longer build validations.',
            'Some checks are too slow for every push but still important. Nightly CI catches slow breakages without blocking everyday development.',
            [
              'Run fast tests on every push.',
              'Run slower integration tests nightly.',
              'Add a manual release workflow.',
              'Store required secrets in CI secret storage.',
              'Notify the team when scheduled jobs fail.',
            ],
            "on:\n  push:\n  pull_request:\n  workflow_dispatch:\n  schedule:\n    - cron: '30 18 * * *' # midnight IST approximately",
            [
              '**Running heavy jobs on every small change.** Keep developer feedback fast.',
              '**Ignoring scheduled failures.** A nightly red build is still a real problem.',
            ],
            'Decide which checks should run on every push and which should run nightly for a Flutter app.',
            'Use CI timing wisely: fast checks now, heavier checks on schedule, release checks on demand.',
          ),
          topic(
            'm6-t20',
            'Play Store and App Store Readiness',
            'Store readiness means your app is not only built but also acceptable to users and store reviewers. You need app name, icon, screenshots, privacy details, permissions, versioning, signing, and tested builds.',
            'Opening a Bengaluru food stall is not only cooking good dosa. You need board, license, menu, UPI QR, hygiene, and crowd handling. Store release is the same: app quality plus official materials.',
            'Play Store and App Store both require metadata, screenshots, age/privacy declarations, signed builds, version numbers, and review compliance. Permission usage must match what the app actually does.',
            'A technically good app can still be rejected or delayed because metadata, privacy, or permission explanations are weak.',
            [
              'Prepare app icon and splash screen.',
              'Set app version and build number.',
              'Prepare screenshots for required device sizes.',
              'Write clear store description and privacy details.',
              'Upload signed build to internal testing first.',
            ],
            "# Version lives in pubspec.yaml\nversion: 1.0.0+1\n\n# Build number should increase for each store upload.",
            [
              '**Vague permission reasons.** Explain why camera, photos, or location are needed.',
              '**Forgetting build number.** Stores require each upload to have a new build number.',
            ],
            'Write a store description for your Instagram-style app in three lines: what it does, who it helps, and why permissions are needed.',
            'Store readiness is product packaging, paperwork, and technical correctness together.',
          ),
          topic(
            'm6-t21',
            'Web and Desktop Builds',
            'Flutter can build for web and desktop, but not every mobile feature automatically works everywhere. Camera, files, notifications, permissions, and storage may behave differently by platform.',
            'A menu that works inside Diana in Udupi may need changes for parcel delivery, wedding catering, or a Bengaluru office cafeteria. Same food idea, different serving rules. Web and desktop are different serving rules for the same Flutter app.',
            'Flutter web builds produce browser assets. Desktop builds produce platform apps for Windows, macOS, or Linux. Responsive layout, mouse/keyboard input, window sizes, and platform-specific plugins must be checked.',
            'If you promise multi-platform support, users expect more than the app merely opening. It should feel correct on that device.',
            [
              'Check whether every plugin supports the target platform.',
              'Use responsive layouts for wide screens.',
              'Test mouse, keyboard, and touch behavior.',
              'Build web and inspect asset loading.',
              'Build desktop only after enabling and configuring the platform.',
            ],
            "# Web build\nflutter build web --release\n\n# Windows desktop build\nflutter build windows --release",
            [
              '**Assuming mobile plugins work everywhere.** Check plugin platform support.',
              '**Stretching mobile UI blindly.** Wide screens need layout decisions.',
            ],
            'Pick one mobile-only feature in your app and describe what web or desktop should do instead.',
            'Multi-platform Flutter is powerful, but each platform deserves its own checks.',
          ),
          topic(
            'm6-t22',
            'Release Checklist and Rollback Thinking',
            'A release checklist is a boring document that saves exciting disasters. It confirms tests, builds, signing, permissions, analytics, crash reporting, store notes, and rollback plan before users get the update.',
            'Before a Kundapura to Bengaluru night bus leaves, staff checks fuel, driver, route, luggage, tickets, and emergency contacts. Nobody says, let us remember everything mentally. A release checklist is that departure check.',
            'A good checklist includes pre-release checks, rollout steps, monitoring, and rollback thinking. Mobile rollback is not instant because users already installed builds, so staged rollout and quick hotfix planning matter.',
            'Release pressure makes people forget simple things. A checklist keeps the team calm when the publish button is staring at them.',
            [
              'Run analyze and all required tests.',
              'Build and install release artifacts.',
              'Verify flavor, API URL, version, and build number.',
              'Check crash reporting and analytics.',
              'Start with internal testing or staged rollout.',
            ],
            "/// Tiny release checklist\n/// [ ] flutter analyze passes\n/// [ ] flutter test passes\n/// [ ] release build installed on real device\n/// [ ] correct prod API\n/// [ ] version and build number increased\n/// [ ] rollback or hotfix plan ready",
            [
              '**No rollback plan.** Think before release, not during panic.',
              '**No monitoring.** Release is not complete until you watch crash and feedback signals.',
            ],
            'Create a 10-item checklist for releasing an Instagram clone to internal testers.',
            'A calm release is not luck. It is a checklist, staged rollout, and quick response plan.',
          ),
        ]

        return [
          {
            title: 'Testing Foundation',
            topics: topics.slice(0, 6),
          },
          {
            title: 'Widget and Integration Testing',
            topics: topics.slice(6, 12),
          },
          {
            title: 'Build Modes, Flavors, and Automation',
            topics: topics.slice(12, 19),
          },
          {
            title: 'Stores, Platforms, and Release Readiness',
            topics: topics.slice(19),
          },
        ]
      })(),
      projects: [
        {
          id: 'm6-p1',
          type: 'Mini Project',
          title: 'Manipal Hospital Token Test Suite',
          domain: 'Testing',
          duration: '3-4 hours',
          description:
            'Build a tiny hospital token app and cover it with unit and widget tests. The app should issue tokens, show current counter, validate patient name and phone, and show friendly empty/error states.',
          tools: ['flutter_test', 'testWidgets', 'fakes', 'form validation', 'AAA pattern'],
          blueprint: {
            overview:
              'Create a small Flutter token queue app and use it as a beginner-friendly testing playground. The learner should understand unit tests, widget tests, keys, validation, and test naming by building one complete mini app.',
            functionalRequirements: [
              '**Token issuing.** User enters patient name, 10-digit phone number, and department, then receives the next token number.',
              '**Queue view.** Show current token, waiting tokens, department badge, and a clear empty queue state.',
              '**Validation.** Block empty names, invalid phone numbers, and missing department selection.',
              '**State changes.** Support mark-as-called and clear-completed actions.',
              '**Testing.** Include unit tests for token logic and widget tests for form validation and queue rendering.',
              '**Local context.** Use Manipal Hospital token counter examples without implying any real hospital integration.',
            ],
            technicalImplementation: [
              '**Files.** Keep `Token`, `TokenQueue`, and validators separate from widgets so unit tests stay simple.',
              '**UI.** Use `MaterialApp`, `Scaffold`, `Form`, `TextFormField`, `DropdownButtonFormField`, and `ListView`.',
              '**Keys.** Add stable keys such as `patientNameField`, `phoneField`, `departmentField`, `issueTokenButton`, and `tokenCard-N`.',
              '**Tests.** Use `flutter_test`; write Arrange/Act/Assert comments in each beginner-facing test.',
              '**No backend.** Store queue state in memory only; persistence is not part of this project.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Scaffold',
                outcome: 'A clean Flutter app shell for a token queue',
                prompt:
                  'Create a Flutter app called `manipal_token_tests`. Remove the counter demo. Build `main.dart` with `MaterialApp`, no debug banner, a yellow/orange Material 3 theme, and a `TokenHomePage` placeholder showing title `Manipal Token Queue`. Create folders `lib/models`, `lib/services`, `lib/screens`, and `test`. Run the app or at least run `flutter analyze` after the scaffold.',
              },
              {
                step: 2,
                label: 'Model and Logic',
                outcome: 'Pure Dart token logic ready for unit testing',
                prompt:
                  'Create `lib/models/token.dart` with a `Token` class containing `number`, `patientName`, `phone`, `department`, and `status`. Create `lib/services/token_queue.dart` with methods to issue the next token, mark a token called, clear completed tokens, filter by department, and expose current/waiting lists. Keep this file free of Flutter widgets so it can be unit tested easily.',
              },
              {
                step: 3,
                label: 'Unit Tests',
                outcome: 'Core token behavior protected by tests',
                prompt:
                  'Add unit tests in `test/token_queue_test.dart`. Test that token numbers start at 1 and increase, department filtering returns only matching tokens, marking a token called updates status, clearing completed removes called tokens, and phone validation accepts only 10 digits. Use clear test names and Arrange/Act/Assert comments. Run `flutter test` and fix all failures.',
              },
              {
                step: 4,
                label: 'Token UI',
                outcome: 'A working form and queue screen',
                prompt:
                  'Build `TokenHomePage` with a `Form`, patient name field, phone field, department dropdown, `Issue Token` button, current token banner, waiting queue list, and empty state. Use the stable keys from the technical notes. Show friendly validation messages and SnackBar feedback when a token is issued. Keep sample departments simple: General, Cardiology, Orthopedics, Pediatrics.',
              },
              {
                step: 5,
                label: 'Widget Tests',
                outcome: 'UI behavior verified with widget tests',
                prompt:
                  'Add widget tests for the token screen. Test empty submit shows validation errors, invalid phone shows the phone error, valid input creates a visible token card, and tapping mark-as-called changes the current/waiting display. Use `pumpWidget(MaterialApp(home: TokenHomePage()))`, keys, `tap`, `enterText`, and `pump`. Run `flutter test`.',
              },
              {
                step: 6,
                label: 'Polish and README',
                outcome: 'Beginner-ready project with clear learning notes',
                prompt:
                  'Polish spacing, labels, empty states, and card hierarchy so the app is readable on a small phone. Add a README explaining the test pyramid pieces used in this project: unit tests for queue logic, widget tests for form and queue UI, and why stable keys make tests reliable. Include the exact commands to run analyze and tests.',
              },
            ],
            deliverable:
              'A tested Flutter token queue app that teaches unit tests and widget tests through a Manipal Hospital-style token counter.',
          },
        },
        {
          id: 'm6-p2',
          type: 'Project',
          title: 'MTR CI Pipeline for Flutter App',
          domain: 'CI/CD',
          duration: '3-5 hours',
          description:
            'Create a CI-ready Flutter workflow that behaves like a breakfast assembly line: get packages, analyze, test, build, and report failure clearly.',
          tools: ['GitHub Actions', 'flutter analyze', 'flutter test', 'release build', 'scheduled CI'],
          blueprint: {
            overview:
              'Add a production-style CI workflow to a Flutter project. The learner should see CI/CD as an MTR breakfast assembly line where every station checks one thing before the app parcel moves forward.',
            functionalRequirements: [
              '**Push checks.** Run the pipeline on push and pull request.',
              '**Quality gate.** Install dependencies, run analyze, run tests, and fail clearly on errors.',
              '**Build gate.** Build an Android artifact when tests pass.',
              '**Manual run.** Allow a release check to be started manually.',
              '**Scheduled run.** Run a nightly check for slower confidence.',
              '**Documentation.** Explain what each CI station proves in simple language.',
            ],
            technicalImplementation: [
              '**Workflow file.** Create `.github/workflows/flutter_ci.yml`.',
              '**Flutter setup.** Use a pinned stable Flutter version or stable channel action.',
              '**Commands.** Use `flutter pub get`, `flutter analyze`, `flutter test`, and an Android build command.',
              '**Artifacts.** Upload build output only if practical for the project.',
              '**Secrets.** Do not put keystore passwords or tokens directly in YAML.',
            ],
            prompts: [
              {
                step: 1,
                label: 'CI Skeleton',
                outcome: 'Workflow runs on push and pull request',
                prompt:
                  'Create `.github/workflows/flutter_ci.yml` for a Flutter project. Name it `Flutter CI`. Trigger it on `push`, `pull_request`, and `workflow_dispatch`. Add one job on `ubuntu-latest` that checks out code and installs Flutter using a stable Flutter GitHub Action. Keep the YAML readable and add short comments naming each station like an MTR breakfast assembly line.',
              },
              {
                step: 2,
                label: 'Analyze and Test',
                outcome: 'Pipeline fails on static analysis or test failures',
                prompt:
                  'Extend the workflow with steps for `flutter pub get`, `flutter analyze`, and `flutter test`. Make the step names beginner-readable: `Get packages`, `Analyze code`, and `Run tests`. Ensure commands run from the Flutter project root. If this repository has the Flutter app inside a subfolder, set `working-directory` correctly instead of assuming root.',
              },
              {
                step: 3,
                label: 'Build Artifact',
                outcome: 'CI proves the app can build after tests pass',
                prompt:
                  'Add an Android build step after tests. Use `flutter build apk --debug` for a safe CI artifact unless the project already has release signing configured. Upload the generated APK as a GitHub Actions artifact with a clear name like `debug-apk`. Do not add fake signing secrets.',
              },
              {
                step: 4,
                label: 'Scheduled Checks',
                outcome: 'Nightly CI run added for slower confidence',
                prompt:
                  'Add a `schedule` trigger for a nightly run and keep `workflow_dispatch` for manual release checks. Use a comment explaining the cron time in IST approximately. Keep fast push checks and scheduled checks in the same workflow unless the file becomes confusing.',
              },
              {
                step: 5,
                label: 'README Notes',
                outcome: 'Learner understands every CI station',
                prompt:
                  'Update or create `README.md` with a section called `CI/CD Pipeline`. Explain each step in plain English: checkout, Flutter setup, package install, analyze, test, build, and artifact upload. Use the MTR breakfast assembly line analogy briefly, then list the exact commands a learner can run locally before pushing.',
              },
              {
                step: 6,
                label: 'Failure Practice',
                outcome: 'Pipeline debugging instructions included',
                prompt:
                  'Add a `How to debug a failed CI run` section to the README. Explain where to click in GitHub Actions, how to read the first failing step, how to reproduce locally, and when to rerun the workflow. Do not tell learners to ignore red CI. Finish by running YAML validation if available, or at minimum inspect indentation carefully.',
              },
            ],
            deliverable:
              'A GitHub Actions CI workflow and README that make Flutter analyze, test, and build checks feel like a clear assembly line.',
          },
        },
        {
          id: 'm6-p3',
          type: 'Capstone',
          title: 'Instagram Clone: Tested, Signed, and Store-Ready',
          domain: 'Capstone',
          duration: '1-2 days',
          description:
            'Take the Instagram-style learning app from earlier modules and prepare it for real release: tests, flavors, release config, store checklist, and multi-platform sanity checks.',
          tools: ['unit tests', 'widget tests', 'integration_test', 'flavors', 'signing', 'store checklist'],
          blueprint: {
            overview:
              'Finish the Instagram-style learning app like a real product: tested, configured, signed, documented, and ready for internal store testing. This is a release-readiness capstone, not another UI-only feature.',
            functionalRequirements: [
              '**Unit tests.** Cover auth validation, post parsing, like count updates, and cached feed fallback.',
              '**Widget tests.** Cover login form, empty feed, post card, create-post form, and profile edit state.',
              '**Integration tests.** Cover login-to-feed and create-post journeys using predictable test data.',
              '**Flavors.** Define dev and prod behavior with visible dev marker and separate API/Firebase config plan.',
              '**Release notes.** Document Android signing, version/build number rules, and app bundle command.',
              '**Store pack.** Prepare screenshots list, permission reasons, privacy notes, staged rollout, and rollback plan.',
            ],
            technicalImplementation: [
              '**Test organization.** Keep unit tests in `test/unit`, widget tests in `test/widget`, and integration tests in `integration_test` if the project structure allows.',
              '**Fakes.** Use fake repositories or test fixtures instead of live network calls in automated tests.',
              '**Keys.** Add stable keys to login, feed, post card, create post, and profile edit controls.',
              '**Config.** Use `--dart-define` or documented flavor files; never hard-code production secrets.',
              '**Release docs.** Store checklist should be a markdown file inside the project, not hidden in chat history.',
            ],
            prompts: [
              {
                step: 1,
                label: 'Test Audit',
                outcome: 'Clear map of missing tests and required keys',
                prompt:
                  'Inspect the Instagram clone project. Create or update `docs/testing_plan.md` with a table of features, current coverage, missing tests, and needed widget keys. Do not implement tests yet. Identify auth validation, feed loading, post card rendering, like/comment state, create post, profile edit, cache fallback, and upload flow. Mention exact files that need keys or test seams.',
              },
              {
                step: 2,
                label: 'Unit Tests',
                outcome: 'Core logic protected without launching UI',
                prompt:
                  'Add unit tests for pure Dart logic: auth validators, post/user JSON mapping, like count toggle behavior, and cached feed fallback using fake repositories. Keep live Firebase/REST calls out of unit tests. Use Arrange/Act/Assert comments and beginner-readable test names. Run `flutter test` for the new unit tests and fix failures.',
              },
              {
                step: 3,
                label: 'Widget Tests',
                outcome: 'Important screens verified through UI behavior',
                prompt:
                  'Add stable keys where needed, then write widget tests for login form validation, successful login navigation or state change, empty feed state, post card display, create-post form validation, and profile edit save behavior. Use fake repositories/providers so tests do not need internet or real Firebase. Run the widget tests and document any intentionally skipped platform-specific behavior.',
              },
              {
                step: 4,
                label: 'Integration Tests',
                outcome: 'Two critical user journeys pass on device/emulator',
                prompt:
                  'Set up `integration_test` if it is not already present. Add one integration test for login to feed and one for creating a post with test data. Use a test app entry point or fake backend config so the tests are repeatable. Include instructions in `docs/testing_plan.md` for running the integration tests on an emulator/device.',
              },
              {
                step: 5,
                label: 'Flavors and Config',
                outcome: 'Dev/prod release lanes are documented and partially wired',
                prompt:
                  'Create `docs/flavors_and_config.md`. Define dev and prod app names, API base URLs, Firebase project names/placeholders, visible dev marker behavior, and `--dart-define` commands. If safe, add an `AppConfig` class that reads `APP_ENV` and `API_BASE_URL`. Do not commit real secrets. Add a small UI marker that appears only in dev builds if the current app architecture supports it cleanly.',
              },
              {
                step: 6,
                label: 'Store Readiness',
                outcome: 'Release checklist ready for internal testing',
                prompt:
                  'Create `docs/release_checklist.md` for the Instagram clone. Include pre-release test commands, Android app bundle command, signing checklist, version/build number policy, Play Store internal testing steps, iOS/TestFlight notes, screenshot checklist, permission explanations for camera/photos/location/notifications, staged rollout plan, monitoring plan, and rollback/hotfix thinking. Run `flutter analyze` and all practical tests before final response.',
              },
            ],
            deliverable:
              'A release-ready Instagram clone package with tests, flavor/config documentation, signing notes, and a store rollout checklist.',
          },
        },
      ],
      quiz: [
        {
          question: 'Which test should you choose for a pure Dart phone number validator?',
          options: ['Unit test', 'Golden test', 'Manual store review', 'Release signing'],
          answer: 'Unit test',
        },
        {
          question: 'Why should most apps have many unit tests and fewer integration tests?',
          options: [
            'Unit tests are faster and cheaper for small logic checks',
            'Integration tests are not allowed in Flutter',
            'Widget tests cannot tap buttons',
            'Release builds automatically test everything',
          ],
          answer: 'Unit tests are faster and cheaper for small logic checks',
        },
        {
          question: 'What is the safest reason to use flavors?',
          options: [
            'To separate dev, staging, and production configuration',
            'To make every widget yellow',
            'To avoid writing tests',
            'To hide real server secrets inside the app',
          ],
          answer: 'To separate dev, staging, and production configuration',
        },
        {
          question: 'Which command is commonly used to create a Play Store Android App Bundle?',
          options: [
            'flutter build appbundle --release',
            'flutter test --golden-store',
            'flutter clean --publish',
            'dart deploy ios',
          ],
          answer: 'flutter build appbundle --release',
        },
        {
          question: 'What should happen before publishing a mobile app update to all users?',
          options: [
            'Run tests, verify release build, check config, and use a staged rollout/checklist',
            'Only check that hot reload works',
            'Change production URLs manually at the last minute',
            'Skip version number updates',
          ],
          answer:
            'Run tests, verify release build, check config, and use a staged rollout/checklist',
        },
      ],
    },
  ],
}

export const getTotals = () => {
  let topics = 0
  let projects = 0
  let hours = 0
  for (const m of curriculum.modules) {
    hours += m.hours || 0
    projects += m.projects?.length || 0
    for (const s of m.sections || []) {
      topics += s.topics?.length || 0
    }
  }
  return {
    modules: curriculum.modules.length,
    topics,
    projects,
    hours,
  }
}

// One entry per topic, with lowercase fields for SearchBar's scoring.
export const flattenTopics = () => {
  const out = []
  for (const m of curriculum.modules) {
    for (const s of m.sections || []) {
      for (const t of s.topics || []) {
        const bodyParts = [
          t.explain || '',
          t.analogy || '',
          t.theory || '',
          t.whyItMatters || '',
          ...(t.steps || []),
          t.code || '',
          ...(t.pitfalls || []),
          t.tryIt || '',
          t.takeaway || '',
        ]
        const body = bodyParts.filter(Boolean).join('\n')
        out.push({
          id: t.id,
          title: t.title,
          titleLower: (t.title || '').toLowerCase(),
          moduleId: m.id,
          moduleTitle: m.title,
          moduleLower: (m.title || '').toLowerCase(),
          sectionTitle: s.title,
          sectionLower: (s.title || '').toLowerCase(),
          body,
          bodyLower: body.toLowerCase(),
        })
      }
    }
  }
  return out
}
