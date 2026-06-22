// Module 0 — Flutter & Dart Foundations
// Gets a complete beginner ready to build the "TunMani Cafe Billing" POS app.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m0 = {
  id: 'm0',
  title: 'Flutter & Dart Foundations',
  hours: 8,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Install the Flutter toolchain, learn just-enough Dart (types, null safety, collections, classes, enums, async), and the core Flutter widgets — everything you need before building the TunMani Cafe billing app.',
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
            'Think of opening the TunMani Cafe kitchen in Kundapura. Before you fry a single neer dosa you need the gas connection, the water line, and the power meter — all three working. `flutter doctor` is the health inspector who walks in, checks every connection, and hands you a checklist of what is still missing. You do not start cooking until the inspector says everything is green.',
          theory:
            'Flutter is shipped as a **ZIP folder**, not an installer. Inside it bundles the **Dart SDK** (the language + compilers) and the **Flutter framework** (widgets + engine), plus a CLI called `flutter`.\n\nYou "install" Flutter by unzipping it and adding its `bin` folder to your system **PATH** so the `flutter` command works from any terminal.\n\n`flutter doctor` is your truth source. It inspects each dependency in order — Flutter itself, the Android toolchain, a connected device, an IDE — and prints a green tick or a red cross with the exact fix. Run it after every setup step; never assume something worked.',
          whyItMatters:
            'Every Flutter interview eventually asks "can you build and run an app on your machine right now?" They are testing whether you have done a real install once. This same `flutter doctor` flow is the diagnostic you will run dozens of times across OS updates and project clones, so mastering it on day one saves you the classic "works on my machine" trap.',
          steps: [
            'Download the **Flutter SDK ZIP** for your OS from `flutter.dev` (pick the **stable** channel).',
            'Unzip it to a simple path such as `C:\\src\\flutter` (avoid `Program Files` or any admin-only folder).',
            'Add `C:\\src\\flutter\\bin` to your **User PATH** environment variable.',
            'Open a fresh terminal and run `flutter --version` — you should see a version and `channel stable`.',
            'Run `flutter doctor` and read the red marks; each one tells you what to install next.',
            'Run `flutter doctor --android-licenses` and answer `y` to every prompt.',
            'Re-run `flutter doctor` until every line shows a green `[OK]`.',
          ],
          code: `# Terminal — what a healthy install looks like
$ flutter --version
Flutter 3.22.0 • channel stable • https://github.com/flutter/flutter.git
Tools • Dart 3.4.0 • DevTools 2.34.3

$ flutter doctor
Doctor summary (to see all details, run flutter doctor -v):
[OK] Flutter (Channel stable, 3.22.0)
[OK] Android toolchain - develop for Android devices (Android SDK 34.0.0)
[OK] Android Studio (version 2023.3)
[OK] VS Code (version 1.89.1)
[OK] Connected device (1 available)

• No issues found!`,
          pitfalls: [
            '**Unzipping into `C:\\Program Files\\flutter`.** Windows treats it as admin-only and Flutter fails to write its own files. Fix: unzip to `C:\\src\\flutter`.',
            '**PATH not refreshed.** You added Flutter to PATH but the open terminal still says "command not found". Fix: close every terminal and open a fresh one.',
            "**Android licences not accepted.** doctor shows a warning. Fix: run `flutter doctor --android-licenses` and answer `y` to each prompt.",
            '**Skipping `flutter doctor` and assuming it worked.** You hit cryptic build errors later. Fix: run doctor after each setup step.',
            '**Picking the master/beta channel by accident.** Tutorials assume stable. Fix: run `flutter channel stable && flutter upgrade`.',
            '**Antivirus quarantining `dart.exe`.** Common on locked-down work laptops. Fix: whitelist the `C:\\src\\flutter\\` folder.',
          ],
          tryIt:
            'Run `flutter doctor` and screenshot the output. If any line is red, fix it before continuing. You are not allowed to write a line of Dart until your doctor summary is green — that is the discipline that keeps the whole course smooth.',
          takeaway: 'No green doctor, no Flutter — verify the toolchain before writing any code.',
        },
        {
          id: 'm0-t2',
          title: 'Set up your editor & an Android emulator',
          explain:
            'Install VS Code (or Android Studio) with the Flutter/Dart extensions, then create an Android emulator or plug in a real phone.',
          analogy:
            'The TunMani Cafe kitchen has a real serving counter for customers, but it also keeps a test plate where the cook tastes the sambar before it goes out. A real Android phone is the serving counter; the emulator is the test plate — a virtual phone on your computer where you taste-test the app before any customer sees it.',
          theory:
            '**VS Code** is the lightest editor for Flutter. Install the **Flutter** extension (it pulls in the Dart one) and you get hot reload, autocomplete, and a debugger.\n\nTo *run* an app you need a **device**: either an **Android emulator** (a virtual phone created in Android Studio\'s Device Manager) or a **real phone** with USB debugging enabled.\n\nThe command `flutter devices` lists everything Flutter can deploy to. `flutter run` then launches your app on the selected device. A real phone is faster and more honest; an emulator is convenient when you have no device handy.',
          whyItMatters:
            'Day-to-day Flutter work is a tight loop: edit code, hot reload, look at the screen. A working device and a configured editor are what make that loop instant. Teams expect you to test on both an emulator and a real device, because some bugs (Bluetooth printing, camera, performance) only appear on real hardware — exactly the kind the TunMani Cafe app will hit.',
          steps: [
            'Install **VS Code** and add the **Flutter** extension from the Extensions panel.',
            'Open **Android Studio** once and let it finish downloading the Android SDK.',
            'In Android Studio open **Device Manager** and create a virtual device (e.g. Pixel 7, a recent API level).',
            'Start the emulator, then run `flutter devices` in a terminal to confirm Flutter sees it.',
            'Alternatively, enable **Developer Options** and **USB debugging** on a real Android phone and plug it in.',
            'Run `flutter devices` again — your phone or emulator should appear in the list.',
          ],
          code: `# List everything Flutter can deploy to
$ flutter devices
2 connected devices:
sdk gphone64 x86 64 (mobile) • emulator-5554 • android-x64
Pixel 7 (mobile)             • 2B131FDH200xyz • android-arm64

# Launch on a specific device by id
$ flutter run -d emulator-5554`,
          pitfalls: [
            '**Emulator extremely slow.** Hardware acceleration is off. Fix: enable virtualization (VT-x/AMD-V) in BIOS and install the Intel HAXM / Hyper-V backend.',
            '**Phone not detected.** USB debugging is off or the cable is charge-only. Fix: enable USB debugging and use a data cable; accept the "trust this computer" prompt.',
            '**Flutter extension installed but no Dart features.** You installed only "Dart" or only "Flutter". Fix: install the **Flutter** extension — it bundles Dart.',
            '**`flutter devices` shows nothing.** Emulator not started or licences not accepted. Fix: start the emulator first; run `flutter doctor`.',
            '**Choosing a huge emulator image.** Wastes disk and is slow. Fix: a recent Pixel image at a mid API level is plenty.',
            '**Forgetting to pick a device.** `flutter run` with several devices asks every time. Fix: pass `-d <id>`.',
          ],
          tryIt:
            'Start your emulator (or plug in your phone), run `flutter devices`, and confirm at least one device is listed. Note its device id — you will pass it to `flutter run -d` for the rest of the course.',
          takeaway: 'A configured editor plus one working device is the launchpad for every run.',
        },
        {
          id: 'm0-t3',
          title: 'Create the project: flutter create tunmani_billing',
          explain:
            'Use `flutter create` to scaffold the real app folder, then open it and explore the generated structure.',
          analogy:
            'When the TunMani Cafe owner builds a new outlet, he does not pour the foundation himself — a contractor hands over a ready building with walls, wiring, and a sign board. `flutter create` is that contractor: one command and you get a fully wired project, ready for you to start cooking up features.',
          theory:
            '`flutter create tunmani_billing` generates a complete starter project: a `lib/main.dart` with the demo counter app, a `pubspec.yaml` (your dependency manifest), `android/` and `ios/` native folders, and a `test/` folder.\n\nThe **package name** must be lowercase with underscores — `tunmani_billing` is valid, `TunMani CafeBilling` is not.\n\nThe most important files for you right now are `lib/main.dart` (your Dart code) and `pubspec.yaml` (where you declare packages, covered in Module 1). The `android/` folder holds the native config that becomes the installable APK.',
          whyItMatters:
            'Every Flutter project on earth starts with `flutter create`. Knowing the generated layout means you can drop into any codebase and immediately know where `main.dart`, the manifest, and the platform folders live. The TunMani Cafe app lives entirely in this scaffold, so understanding it is understanding the project map.',
          steps: [
            'Open a terminal in the folder where you keep your projects.',
            'Run `flutter create tunmani_billing`.',
            'Change into it with `cd tunmani_billing`.',
            'Open the folder in VS Code (`code .`).',
            'Open `lib/main.dart` and read the generated counter app.',
            'Open `pubspec.yaml` and notice the `dependencies:` and `flutter:` sections.',
            'Run `flutter run` to launch the demo app and confirm the scaffold works end to end.',
          ],
          code: `# Scaffold the real app
$ flutter create tunmani_billing
Creating project tunmani_billing...
Wrote 127 files.
All done! In order to run your application, type:
  $ cd tunmani_billing
  $ flutter run

# Generated structure (trimmed)
tunmani_billing/
  lib/
    main.dart        # your Dart code starts here
  pubspec.yaml       # dependency + asset manifest
  android/           # native Android config -> the APK
  ios/
  test/`,
          pitfalls: [
            '**Using a capital letter or hyphen in the name.** `flutter create TunMani Cafe-Billing` fails. Fix: use lowercase with underscores.',
            '**Running create inside another Flutter project.** Nests projects and confuses tooling. Fix: run it in a plain, empty parent folder.',
            "**A path with spaces (e.g. 'My Projects').** Some build tools choke. Fix: keep the project path space-free.",
            '**Deleting `android/` to "clean up".** That folder is what makes the APK. Fix: never touch the native folders unless you know why.',
            '**Editing the demo code before running it once.** You cannot tell if a break is yours or the scaffold\'s. Fix: run the generated app first, then start editing.',
            '**Forgetting to `cd` into the project.** `flutter run` from the parent folder fails. Fix: change into the project directory first.',
          ],
          tryIt:
            'Run `flutter create tunmani_billing`, open it in your editor, and read `lib/main.dart` top to bottom. Find the line `home: const MyHomePage(...)` and trace how it connects to the widget below it. You will rewrite this file completely later — get familiar with it now.',
          takeaway: 'One `flutter create` command gives you the entire wired project skeleton.',
        },
        {
          id: 'm0-t4',
          title: 'Run the counter app & use hot reload',
          explain:
            'Launch the generated app with `flutter run`, then change the code and press `r` to see hot reload update the UI instantly.',
          analogy:
            'Imagine the TunMani Cafe cook tasting the fish curry and deciding it needs more kokum. He does not throw out the whole pot and start over — he adjusts and tastes again in seconds. Hot reload is that instant taste-and-adjust: change one line, the running app updates while keeping its place, no full restart.',
          theory:
            '`flutter run` compiles your app and deploys it to the selected device. While it runs, the terminal listens for single-key commands.\n\nPressing **`r`** triggers a **hot reload**: Flutter injects your changed Dart code into the running app and rebuilds the widget tree, **preserving state** (your counter keeps its value).\n\nPressing **`R`** does a **hot restart**: it rebuilds from scratch and **resets state**. Use hot reload for UI tweaks, hot restart when you changed `main()` or app-wide setup. Press **`q`** to quit.',
          whyItMatters:
            'Hot reload is the single feature that makes Flutter so productive — sub-second feedback on UI changes. Every Flutter developer leans on this loop hundreds of times a day. Understanding the difference between hot reload (keeps state) and hot restart (resets state) saves you from confusing bugs where stale state lingers.',
          steps: [
            'In the project folder run `flutter run` and wait for the counter app to appear.',
            'Tap the **+** button a few times so the counter reads a non-zero value.',
            "In `lib/main.dart`, change the app bar title text to `'TunMani Cafe'`.",
            'Save the file, then press **`r`** in the terminal — watch the title update while the counter keeps its value.',
            'Now press **`R`** (capital) — note the counter resets to 0 (hot restart).',
            'Press **`q`** to quit the app cleanly.',
          ],
          code: `// lib/main.dart — change this line and hot reload
appBar: AppBar(
  // before: title: const Text('Flutter Demo Home Page'),
  title: const Text('TunMani Cafe'),   // press r to see it instantly
),

/*
Terminal while flutter run is live:
  r  Hot reload.  (keeps state)
  R  Hot restart. (resets state)
  q  Quit.
*/`,
          pitfalls: [
            '**Expecting hot reload to pick up `main()` changes.** It will not — those need a hot restart. Fix: press `R`.',
            '**Editing a `const` widget and seeing no change.** Const widgets can be skipped. Fix: hot restart, or remove `const` while iterating.',
            '**Confusing reset state with a bug.** A hot restart wipes your counter — that is by design. Fix: use lowercase `r` to keep state.',
            '**Saving the wrong file.** Hot reload only applies what was saved. Fix: confirm the file is saved (no dot on the tab).',
            '**Adding a new package then hot reloading.** New dependencies need `flutter pub get` and a full restart. Fix: stop, run pub get, run again.',
            '**Leaving many `flutter run` sessions open.** They fight over the device. Fix: quit with `q` before starting a new run.',
          ],
          tryIt:
            'With the app running, change the counter increment from `+1` to `+5` in the `_incrementCounter` method, hot reload, and confirm taps now jump by five. Then change a color and reload again to feel how fast the loop is.',
          takeaway: 'Hot reload (r) keeps state; hot restart (R) resets it — both beat a full rebuild.',
        },
      ],
    },
    {
      id: 'm0-s2',
      title: 'Dart Essentials for Billing',
      topics: [
        {
          id: 'm0-t5',
          title: 'Variables, types & null safety',
          explain:
            'Declare values with `final`/`const`/`var`, use the core types `int`, `double`, `String`, `bool`, and opt into null with the `?` suffix.',
          analogy:
            'The TunMani Cafe order pad has pre-printed columns: item name (text), quantity (number), served? (yes/no). The waiter cannot scribble a price into the quantity column — the column itself enforces what fits. And the served? box is never left blank; it is a tick or a cross. Dart types work the same way: each variable has a type that controls what goes in, and null safety decides whether "blank" is even allowed.',
          theory:
            'Dart is **statically typed**: every variable has a type known at compile time. The core types you will use in billing are **`int`** (whole numbers like quantity), **`double`** (decimals like price), **`String`** (text), and **`bool`** (true/false).\n\nDeclare with **`final`** (set once, type inferred), **`const`** (compile-time constant), **`var`** (mutable, type inferred), or an explicit type like `String name`.\n\n**Null safety** is the headline feature: every type is **non-nullable by default**, so `String name` can never be `null`. To allow null you write `String? name`. The compiler then forces you to handle the null case using `?.`, the `??` default operator, or the `!` bang. This kills the entire class of null-crash bugs.',
          whyItMatters:
            'In the billing app, the difference between `double` and `int` is the difference between a correct ₹52.50 total and a wrong ₹52. And every value you read from Firestore or shared preferences comes back nullable, so deciding *where* to handle null is a daily decision. Getting this right keeps the owner from seeing a crash mid-bill.',
          steps: [
            'Create a file `variables.dart` with `void main() { ... }`.',
            "Add `final String item = 'Neer Dosa';` and `print(item);`.",
            'Add `final double price = 12.50;` and `final int qty = 3;`.',
            'Compute `final double line = price * qty;` and print it.',
            'Add `String? note;` (no value) and print it — confirm it shows `null`.',
            'Try `print(note.length);` and see the compile error, then fix it with `note?.length ?? 0`.',
            'Run `dart run variables.dart` and confirm the output.',
          ],
          code: `// variables.dart — types and null safety for a bill line.
void main() {
  final String item = 'Neer Dosa';   // text
  final double price = 12.50;          // money -> double
  final int qty = 3;                   // count -> int
  final bool isVeg = true;             // yes/no

  final double lineTotal = price * qty;
  print('$item x $qty = ₹$lineTotal');  // Neer Dosa x 3 = ₹37.5

  String? note;                        // nullable: starts as null
  print(note ?? 'no note');            // no note

  note = 'extra chutney';
  print(note?.length);                 // 13 (? skips when null)
  print(note!.toUpperCase());          // EXTRA CHUTNEY (! asserts non-null)

  // The compiler refuses these:
  // String bad = null;   // null can't be assigned to String
  // print(note.length);  // receiver can be null
}`,
          pitfalls: [
            '**Storing money in an `int`.** `price * qty` loses the paise. Fix: use `double` for prices and totals.',
            '**Adding `?` just to silence an error.** If a value is never really null, you only postpone the bug. Fix: keep it non-nullable and supply a real default.',
            '**Overusing `!` (bang).** Each `!` is a runtime crash waiting to happen. Fix: prefer `??` to supply a default.',
            '**Confusing `final` and `const`.** `final list = []` lets you `list.add(...)`; `const list = []` blocks it. Fix: pick based on whether the value is compile-time constant.',
            '**Treating null and empty string as the same.** A null note means "unknown"; `\'\'` means "known to be empty". Fix: be deliberate, especially before Firestore.',
            '**Reaching for `var` everywhere.** Loses readability for complex values. Fix: prefer `final` and explicit types.',
          ],
          tryIt:
            'Create a bill line for "Kori Rotti" priced at 95.0 with quantity 2. Compute and print the line total. Then add a nullable `String? discountCode` and print `discountCode ?? \'none\'`. Confirm the total is a `double`.',
          takeaway: 'Reach for `final` first, use `double` for money, and add `?` only when null is a real state.',
        },
        {
          id: 'm0-t6',
          title: 'Collections: List & Map (the menu)',
          explain:
            'Use a `List` for an ordered menu of items and a `Map` to look up a price by item code.',
          analogy:
            'In the TunMani Cafe back office two notebooks sit on the desk. The menu card lists items in order — that is a **List**. The price chart looks up the rate for each item by its code — that is a **Map**. You flip the menu to see everything; you jump straight to a code in the price chart to get its rate.',
          theory:
            'Dart has **`List<T>`** (ordered, indexable, allows duplicates) and **`Map<K,V>`** (key to value lookup, keys unique). Both have literal syntax: `[a, b, c]` is a List and `{\'k\': v}` is a Map.\n\nFor billing, a `List<String>` holds the menu order while a `Map<String, double>` maps an item code to its price. Reading `prices[\'ND\']` returns a **nullable** `double?` because the key might not exist.\n\nUseful tools: `.length`, indexing `list[0]`, `.add(...)`, `map[key]`, `map.containsKey(key)`, and iterating with `for (final x in list)`. Methods like `.map(...)` and `.where(...)` return lazy iterables, so you call `.toList()` to materialise them.',
          whyItMatters:
            'The entire TunMani Cafe menu is a List of items, and price lookup is a Map. Every billing screen will iterate a list to render rows and index a map to fetch a rate. Picking the right collection — list for order, map for lookup — keeps your code fast and readable instead of full of nested loops.',
          steps: [
            'Create `menu.dart` with `void main() { ... }`.',
            "Build `final menu = ['Neer Dosa', 'Kori Rotti', 'Fish Thali'];` and print `menu.length`.",
            "Build a price map `final prices = {'Neer Dosa': 12.5, 'Kori Rotti': 95.0, 'Fish Thali': 180.0};`.",
            "Look up `prices['Fish Thali']` and print it.",
            "Try `prices['Idli']` and notice it returns `null`.",
            'Loop over the menu and print each item with its price using `prices[item] ?? 0`.',
            'Run the file and confirm the output.',
          ],
          code: `// menu.dart — List for order, Map for price lookup.
void main() {
  final List<String> menu = ['Neer Dosa', 'Kori Rotti', 'Fish Thali'];
  print('Items: \${menu.length}');   // Items: 3
  print(menu.first);                  // Neer Dosa

  final Map<String, double> prices = {
    'Neer Dosa': 12.5,
    'Kori Rotti': 95.0,
    'Fish Thali': 180.0,
  };

  print(prices['Fish Thali']);        // 180.0
  print(prices['Idli']);              // null (key absent)

  // Render every menu line.
  for (final item in menu) {
    final price = prices[item] ?? 0;
    print('$item -> ₹$price');
  }

  // Lazy chain: items above ₹50, names only.
  final premium = menu.where((m) => (prices[m] ?? 0) > 50).toList();
  print(premium);                     // [Kori Rotti, Fish Thali]
}`,
          pitfalls: [
            '**Treating `map[key]` as non-null.** `prices[\'Idli\'].toString()` crashes. Fix: use `prices[key] ?? 0` or `containsKey`.',
            '**Using a List to find a price.** Looping the list to match a name is slow. Fix: use a Map keyed by code/name.',
            '**Forgetting `.toList()` after `.map`/`.where`.** You get a lazy iterable, not a list. Fix: append `.toList()`.',
            "**Mutating a `const` list.** `const items = []; items.add(...)` throws. Fix: drop `const` or copy with `List.of(...)`.",
            '**Assuming map order is random.** Dart literal maps keep insertion order. Fix: rely on it only when you set it intentionally.',
            '**Modifying a list while iterating it.** Throws "Concurrent modification". Fix: use `removeWhere(...)`.',
          ],
          tryIt:
            'Add "Goli Baje" at ₹40 to both the menu list and the price map. Then compute the total price of the whole menu using a loop and a running `double total`. Print the grand total.',
          takeaway: 'List for ordered items, Map for keyed price lookup — pick the shape, not a workaround.',
        },
        {
          id: 'm0-t7',
          title: 'Functions & named parameters',
          explain:
            'Write Dart functions with positional and named parameters, the `required` keyword, and the `=>` arrow form for one-liners.',
          analogy:
            'A waiter could shout "one thali, extra rasam, no chutney, banana leaf" — four facts in a fixed order, easy to mix up. Or he can answer labelled questions: meal? extras? omissions? seating? Dart calls the first style positional and the second named. TunMani Cafe bills have many optional details, so named parameters keep every order unambiguous.',
          theory:
            'A Dart function has a return type, a name, parameters, and a body. Parameters come in flavours: **positional required** (`int add(int a, int b)`), **positional optional** with a default (`[String tax = \'5%\']`), and **named** parameters in `{ }` which can be `required` or have defaults.\n\n**Named parameters** are everywhere in Flutter because widget call sites read top to bottom. The **`required`** keyword forces the caller to pass a non-nullable named parameter.\n\nThe **`=>` arrow** is shorthand for a function whose body is a single expression: `double gst(double a) => a * 0.05;`. Functions are also **first-class** — you can store them in variables and pass them as arguments, which is how Flutter callbacks like `onPressed` work.',
          whyItMatters:
            'Every Flutter widget is a function call with named parameters, and every button callback is a first-class function. Internalising these flavours now means widget syntax later feels like ordinary Dart. In the billing code you will write helper functions like `lineTotal(...)` and `gstAmount(...)` constantly.',
          steps: [
            'Create `functions.dart` with `void main() { ... }`.',
            'Write a positional function `double lineTotal(double price, int qty) => price * qty;` and call it.',
            'Write a named function `double billTotal({required double subtotal, double gstRate = 0.05})`.',
            'Return `subtotal + subtotal * gstRate` from it.',
            "Call `billTotal(subtotal: 100)` and `billTotal(subtotal: 100, gstRate: 0.12)`.",
            'Try omitting `subtotal` and read the compile error about a required argument.',
            'Store a function in a variable and pass it to `.map(...)`.',
          ],
          code: `// functions.dart — positional, named, required, arrow.
double lineTotal(double price, int qty) => price * qty;   // positional

double billTotal({required double subtotal, double gstRate = 0.05}) {
  return subtotal + subtotal * gstRate;                    // named + default
}

String format(double amount) => '₹\${amount.toStringAsFixed(2)}'; // arrow

void main() {
  final dosa = lineTotal(12.5, 3);     // 37.5
  print(format(dosa));                  // ₹37.50

  print(format(billTotal(subtotal: 100)));              // ₹105.00
  print(format(billTotal(subtotal: 100, gstRate: 0.12))); // ₹112.00

  // First-class function passed to .map
  final prices = [12.5, 95.0, 180.0];
  final labels = prices.map(format).toList();
  print(labels);  // [₹12.50, ₹95.00, ₹180.00]
}`,
          pitfalls: [
            '**Forgetting `required` on a non-nullable named parameter.** Compile error about a missing default. Fix: add `required`, a default, or make it nullable.',
            '**Using positional params for many-argument helpers.** `bill(100, 0.05, true)` is unreadable. Fix: switch to named parameters.',
            '**Writing `=> return x`.** The arrow already returns. Fix: just `=> x`.',
            '**Defaulting to a non-constant value.** `({DateTime when = DateTime.now()})` fails. Fix: default to null then assign inside.',
            '**Passing arguments out of order positionally.** `lineTotal(qty, price)` compiles but is wrong. Fix: prefer named for clarity.',
            '**Confusing `void Function()` with `Function`.** The untyped form loses analyzer help. Fix: write typed signatures like `double Function(double)`.',
          ],
          tryIt:
            'Write a function `quote({required int guests, required double perPlate, double gstRate = 0.05})` that returns the GST-inclusive total formatted as `₹...`. Call it with the default rate and with a custom rate, and print both.',
          takeaway: 'Named parameters with `required` make every TunMani Cafe billing helper self-documenting.',
        },
        {
          id: 'm0-t8',
          title: 'Classes, constructors & a MenuItem',
          explain:
            'Build a Dart class with `final` fields and a named constructor — model a `MenuItem` with a code, name, and price.',
          analogy:
            'The TunMani Cafe laminated menu card is a template: every item has the same three slots — a short code, a dish name, a price. A `MenuItem` class is that template in code. Each dosa or thali on the menu becomes one filled-in card built from the same blueprint.',
          theory:
            'A Dart **class** is a blueprint for objects with fields and methods. The idiomatic model uses **`final` fields** and a constructor with the **`required this.field`** shorthand: `MenuItem({required this.code, required this.name, required this.price});`.\n\nKeeping fields `final` makes the object **immutable** — safer and friendly to Flutter\'s rebuild model.\n\nClasses can have **named constructors** like `MenuItem.fromMap(Map<String, dynamic> m)` for building from Firestore data, and methods like `toMap()` to serialise back. A common helper is **`copyWith`**, which returns a new object with some fields changed and the rest copied — the standard "edit without mutating" pattern.',
          whyItMatters:
            'Every model in the billing app — `MenuItem`, `BillLine`, `Order`, `Receipt` — is a class with final fields, a constructor, `fromMap`/`toMap`, and `copyWith`. Master this skeleton once and you write the next dozen models in minutes. It is also the most common shape of code in any Flutter codebase.',
          steps: [
            'Create `menu_item.dart`.',
            'Declare `class MenuItem` with `final String code;`, `final String name;`, `final double price;`.',
            'Add a constructor `MenuItem({required this.code, required this.name, required this.price});`.',
            'Add a `MenuItem.fromMap(Map<String, dynamic> m)` factory.',
            'Add a `toMap()` method returning the three fields.',
            'Add a `copyWith({double? price})` to make a price-changed copy.',
            'In `main()`, build a MenuItem, print it, then a copy with a new price.',
          ],
          code: `// menu_item.dart — the canonical immutable model.
class MenuItem {
  final String code;
  final String name;
  final double price;

  const MenuItem({
    required this.code,
    required this.name,
    required this.price,
  });

  // Build from a Firestore-style map.
  factory MenuItem.fromMap(Map<String, dynamic> m) {
    return MenuItem(
      code: m['code'] as String,
      name: m['name'] as String,
      price: (m['price'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toMap() => {
        'code': code,
        'name': name,
        'price': price,
      };

  // Copy with some fields changed, the rest preserved.
  MenuItem copyWith({String? code, String? name, double? price}) {
    return MenuItem(
      code: code ?? this.code,
      name: name ?? this.name,
      price: price ?? this.price,
    );
  }

  @override
  String toString() => 'MenuItem($code, $name, ₹$price)';
}

void main() {
  final dosa = MenuItem(code: 'ND', name: 'Neer Dosa', price: 12.5);
  print(dosa);                            // MenuItem(ND, Neer Dosa, ₹12.5)

  final hiked = dosa.copyWith(price: 15.0);
  print(hiked);                           // MenuItem(ND, Neer Dosa, ₹15.0)
  print(dosa.price);                      // 12.5 (original unchanged)
}`,
          pitfalls: [
            '**Mutable fields.** Dropping `final` lets `dosa.price = 15` work but breaks rebuild logic. Fix: keep fields `final`, use `copyWith`.',
            '**Casting `price` straight to `double`.** Firestore may store it as `int`. Fix: `(m[\'price\'] as num).toDouble()`.',
            '**Using a positional constructor.** `MenuItem(\'ND\', \'Neer Dosa\', 12.5)` is fragile. Fix: named params with `required this.x`.',
            '**Forgetting `const` on the constructor.** You lose `const` usage in defaults. Fix: add `const` when all fields are `final`.',
            '**Throwing inside the constructor body.** Leaves half-built objects. Fix: validate in a `factory` before constructing.',
            '**Overriding `==` without `hashCode`.** Breaks Set/Map lookups. Fix: override both or use `package:equatable`.',
          ],
          tryIt:
            'Add a `bool isAvailable` field (default `true`) to `MenuItem` and wire it through the constructor, `fromMap`, `toMap`, and `copyWith`. Build a "Fish Thali" item, then a `copyWith(isAvailable: false)` to mark it sold out. Confirm the original stays available.',
          takeaway: 'Final fields + named constructor + copyWith = every model you will write for the billing app.',
        },
        {
          id: 'm0-t9',
          title: 'Enums for fixed choices (PaymentType)',
          explain:
            'Use a Dart `enum` to model a fixed set of options like the payment method: cash, card, UPI, or credit.',
          analogy:
            'At the TunMani Cafe counter, payment is always one of exactly four buttons: cash, card, UPI, or running credit. There is no fifth option. An `enum` is that fixed button panel in code — a named, complete set of choices the compiler can check for you.',
          theory:
            'An **`enum`** declares a fixed set of named constant values: `enum PaymentType { cash, card, upi, credit }`. Each value is a constant of that type, accessed as `PaymentType.upi`.\n\nEnums have a built-in **`.name`** (the string `\'upi\'`) and **`.values`** (the full list), handy for dropdowns and serialisation.\n\nDart 3 enums can also have fields and methods (enhanced enums), but the simple form is enough here. The big win is **`switch`**: switching over an enum is exhaustive — the compiler warns you if you forget a case, so adding a new payment type later flags every place that must handle it.',
          whyItMatters:
            'The billing app records how every bill was paid, and reports group revenue by payment type. Modelling this as an enum (instead of loose strings) means typos are impossible and the compiler guides you when the business adds a new method like "wallet". This is a frequent interview topic too.',
          steps: [
            'Create `payment.dart`.',
            'Declare `enum PaymentType { cash, card, upi, credit }`.',
            'In `main()`, set `final method = PaymentType.upi;` and print `method.name`.',
            'Print `PaymentType.values` to see all options.',
            'Write a `String label(PaymentType p)` using a `switch` expression.',
            'Call `label` for each value and print the friendly labels.',
            'Add a fifth value and watch the switch warn you to handle it.',
          ],
          code: `// payment.dart — a fixed, compiler-checked set of choices.
enum PaymentType { cash, card, upi, credit }

String label(PaymentType p) => switch (p) {
      PaymentType.cash => 'Cash',
      PaymentType.card => 'Card',
      PaymentType.upi => 'UPI',
      PaymentType.credit => 'Khata (Credit)',
    };

void main() {
  final method = PaymentType.upi;
  print(method.name);            // upi
  print(PaymentType.values);     // [PaymentType.cash, .card, .upi, .credit]
  print(label(method));          // UPI

  for (final p in PaymentType.values) {
    print('\${p.name} -> \${label(p)}');
  }
}`,
          pitfalls: [
            '**Using bare strings instead of an enum.** `\'upi\'` vs `\'UPI\'` typos slip through. Fix: use an enum and convert with `.name`.',
            '**Adding a `default:` to a switch over an enum.** It hides the "you forgot a case" warning. Fix: handle each value explicitly.',
            '**Saving the enum object to Firestore directly.** It is not JSON. Fix: store `p.name` and rebuild with `PaymentType.values.byName(s)`.',
            '**Comparing with strings.** `method == \'upi\'` is always false. Fix: compare `method == PaymentType.upi`.',
            '**Forgetting `.values` exists.** People hardcode the list. Fix: use `PaymentType.values` for dropdowns.',
            '**Reordering enum values that were stored by index.** Breaks old data. Fix: serialise by `.name`, not by index.',
          ],
          tryIt:
            'Add a `wallet` value to `PaymentType`. Notice the `switch` in `label` now warns. Add the missing case returning `\'Wallet\'`. Then write a function that, given a `PaymentType`, returns whether it settles instantly (everything except `credit`).',
          takeaway: 'Enums turn a fixed list of choices into compiler-checked, typo-proof values.',
        },
        {
          id: 'm0-t10',
          title: 'async/await & Future basics',
          explain:
            'Understand `Future`, `async`, and `await` — the way Dart handles work that takes time, like reading from Firestore.',
          analogy:
            'When you order a fish thali at TunMani Cafe, the waiter hands you a token and you keep chatting — you do not freeze at the counter until the food arrives. The token is a **Future**: a promise of a value that is not ready yet. `await` is waiting for your token number to be called. Because the kitchen works in the background, the rest of the restaurant keeps running.',
          theory:
            'A **`Future<T>`** represents a value that will be available *later* — a network response, a database read, a file load. It is Dart\'s promise object.\n\nA function marked **`async`** can use **`await`**, which pauses that function until the Future completes and then gives you the unwrapped value. Crucially, `await` does **not** freeze the whole app — other work continues; only the awaiting function waits.\n\nFirestore (and Firebase Auth) return Futures everywhere — `getDocument()`, `signIn()`, `set()` all return `Future`. So almost every data call in the billing app is `await`ed inside an `async` function. Errors are handled with `try`/`catch`, and you can simulate delay with `Future.delayed(...)`.',
          whyItMatters:
            'The TunMani Cafe app reads the menu, saves bills, and signs the owner in — all asynchronous. Without `async`/`await` the UI would freeze on every database call. This is also the #1 source of confusion for beginners, so understanding Futures early prevents the classic "my data is null because I forgot to await" bug.',
          steps: [
            'Create `async_demo.dart`.',
            'Write an `async` function `Future<double> fetchPrice(String code)`.',
            "Inside, `await Future.delayed(const Duration(seconds: 1));` to simulate a network call.",
            'Return a price from a small map based on the code.',
            'Make `main()` itself `async`.',
            'Call `final price = await fetchPrice(\'ND\');` and print it.',
            'Wrap the call in `try`/`catch` to handle a missing code.',
          ],
          code: `// async_demo.dart — Future, async, await, try/catch.
Future<double> fetchPrice(String code) async {
  // Pretend this is a Firestore read that takes time.
  await Future.delayed(const Duration(seconds: 1));

  const prices = {'ND': 12.5, 'KR': 95.0, 'FT': 180.0};
  final price = prices[code];
  if (price == null) {
    throw Exception('Unknown item code: $code');
  }
  return price;
}

Future<void> main() async {
  print('Fetching price...');
  try {
    final price = await fetchPrice('FT');   // waits ~1s, no UI freeze
    print('Price: ₹$price');                 // Price: ₹180.0
  } catch (e) {
    print('Error: $e');
  }

  try {
    await fetchPrice('XYZ');                  // triggers the catch
  } catch (e) {
    print('Error: $e');                       // Error: Exception: Unknown...
  }
}`,
          pitfalls: [
            '**Forgetting `await`.** You get a `Future<double>` instead of a number, and prints show `Instance of Future`. Fix: `await` the call.',
            '**Using `await` outside an `async` function.** Compile error. Fix: mark the enclosing function `async`.',
            '**Not catching errors.** A failed Future throws and can crash the flow. Fix: wrap in `try`/`catch`.',
            '**Blocking the UI with heavy sync work.** `async` does not parallelise CPU work. Fix: use `compute`/isolates for heavy loops.',
            "**Awaiting in a loop when you could parallelise.** Slow. Fix: use `Future.wait([...])` when calls are independent.",
            '**Returning before the Future completes.** Forgetting to `await` inside a helper leaks unfinished work. Fix: await and return the value.',
          ],
          tryIt:
            'Write an `async` function `Future<List<String>> loadMenu()` that delays one second and returns `[\'Neer Dosa\', \'Kori Rotti\', \'Fish Thali\']`. Await it in `main`, print each item, and add a `try`/`catch`. Then make it sometimes throw and confirm the catch runs.',
          takeaway: 'Futures + async/await let the billing app wait for data without freezing the screen.',
        },
      ],
    },
    {
      id: 'm0-s3',
      title: 'Flutter Basics',
      topics: [
        {
          id: 'm0-t11',
          title: 'Widgets: Stateless vs Stateful',
          explain:
            'Learn the two widget kinds: `StatelessWidget` (fixed from its inputs) and `StatefulWidget` (carries changing state).',
          analogy:
            'Walk through the TunMani Cafe dining hall. The printed menu board and the brass nameplate never change once placed — they are **StatelessWidgets**, fully decided by what was printed on them. The remaining-thalis counter ticks down as plates go out — it remembers a number that changes — that is a **StatefulWidget**.',
          theory:
            'Flutter has two everyday base classes. A **`StatelessWidget`** is a pure function of its inputs: its `build(context)` returns a widget tree based only on its `final` fields. When it must look different, the parent rebuilds it with new values.\n\nA **`StatefulWidget`** is a pair: the widget (immutable config) plus a separate **`State`** object that holds mutable fields across rebuilds. You call **`setState(() {...})`** to change state and trigger a rebuild, and you get lifecycle hooks `initState()` and `dispose()`.\n\nKey idea: `build()` runs many times and must stay cheap and side-effect-free. Default to `StatelessWidget`; promote to `StatefulWidget` only when the widget owns changing data or needs lifecycle hooks.',
          whyItMatters:
            'Every TunMani Cafe screen is a tree of these two. A billing screen that tracks the current order quantity needs state; a row that just displays a menu item does not. Choosing correctly avoids unnecessary `setState` calls and prevents leaked controllers — and it is the most-asked beginner Flutter interview question.',
          steps: [
            'In a `flutter create` app open `lib/main.dart`.',
            'Write a `StatelessWidget` `MenuRow` taking `final String name` and `final double price`.',
            'Return a `ListTile(title: Text(name), trailing: Text(\'₹$price\'))`.',
            'Write a `StatefulWidget` `QtyCounter` with `int _qty = 0;` in its State.',
            'Add a method calling `setState(() => _qty++);`.',
            'Show the value with `Text(\'$_qty\')` and a button to increment it.',
            'Run the app and confirm only the counter changes on tap.',
          ],
          code: `// lib/main.dart — both widget kinds.
import 'package:flutter/material.dart';

// 1. Stateless: pure function of inputs.
class MenuRow extends StatelessWidget {
  const MenuRow({super.key, required this.name, required this.price});
  final String name;
  final double price;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(name),
      trailing: Text('₹\${price.toStringAsFixed(2)}'),
    );
  }
}

// 2. Stateful: owns a changing _qty.
class QtyCounter extends StatefulWidget {
  const QtyCounter({super.key});
  @override
  State<QtyCounter> createState() => _QtyCounterState();
}

class _QtyCounterState extends State<QtyCounter> {
  int _qty = 0;

  void _add() => setState(() => _qty++);   // rebuild with new value

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text('Qty: $_qty'),
        IconButton(onPressed: _add, icon: const Icon(Icons.add)),
      ],
    );
  }
}`,
          pitfalls: [
            '**Changing a field without `setState`.** The value updates in memory but the UI does not refresh. Fix: wrap changes in `setState`.',
            '**Making everything stateful "just in case".** Wastes rebuilds and leaks resources. Fix: default to stateless.',
            '**Doing network calls inside `build()`.** It runs many times, firing repeated calls. Fix: do them in `initState` or on events.',
            '**Forgetting `dispose()` for controllers.** Leaks memory. Fix: dispose controllers/subscriptions in `dispose`.',
            '**Mutating `final` widget fields.** They are config, not state. Fix: keep mutable data in the `State` object.',
            '**Calling `setState` after the widget is disposed.** Throws. Fix: guard with `if (mounted)`.',
          ],
          tryIt:
            'Build a screen with three `MenuRow`s and one `QtyCounter`. Confirm tapping the counter rebuilds only that widget, while the menu rows stay put. Then remove `setState` from `_add` and observe the counter stop updating.',
          takeaway: 'Stateless for fixed-from-inputs UI; stateful (with setState) for UI that remembers.',
        },
        {
          id: 'm0-t12',
          title: 'MaterialApp & Scaffold',
          explain:
            'Wrap your app in `MaterialApp` and give each screen a `Scaffold` — the skeleton that provides the app bar, body, and floating buttons.',
          analogy:
            'A Scaffold is the steel frame of the TunMani Cafe building: it defines where the signboard (app bar) goes on top, the dining hall (body) in the middle, and the order bell (floating button) in the corner. MaterialApp is the whole property that wires up Material styling, navigation, and theming across every floor.',
          theory:
            '**`MaterialApp`** is the root widget that turns on Material Design: it provides theming, navigation/routing, localization, and the directionality your widgets assume. You usually create exactly one, at the top of `runApp(...)`.\n\n**`Scaffold`** is the per-screen layout skeleton. Its common slots are **`appBar`** (top bar), **`body`** (the main content), **`floatingActionButton`** (corner action), and **`bottomNavigationBar`**.\n\nTogether they give you a standard, themed screen with almost no boilerplate. In the TunMani Cafe app every screen returns a `Scaffold`, and the whole thing is wrapped once in a `MaterialApp` configured with the app theme (covered in Module 1).',
          whyItMatters:
            'These two widgets are the frame around literally every Flutter screen. Knowing the Scaffold slots means you can lay out any screen — billing, menu, reports — in seconds. Getting the `MaterialApp` root right is also what unlocks theming and navigation for the entire app.',
          steps: [
            'In `lib/main.dart`, make `main()` call `runApp(const MyApp());`.',
            'Create `MyApp` as a `StatelessWidget` returning a `MaterialApp`.',
            "Give it `title: 'TunMani Cafe'` and `theme: ThemeData(useMaterial3: true)`.",
            'Set `home:` to a screen widget that returns a `Scaffold`.',
            "Add an `AppBar(title: Text('TunMani Cafe Billing'))`.",
            'Put a `Center(child: Text(\'Welcome\'))` in the `body`.',
            'Add a `FloatingActionButton` and run the app.',
          ],
          code: `// lib/main.dart — MaterialApp at the root, Scaffold per screen.
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TunMani Cafe',
      theme: ThemeData(useMaterial3: true),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('TunMani Cafe Billing')),
      body: const Center(child: Text('Welcome to the counter')),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }
}`,
          pitfalls: [
            '**Forgetting the `MaterialApp` wrapper.** Widgets like `Text` complain about missing Directionality/Material. Fix: wrap the app in `MaterialApp`.',
            '**Nesting multiple `MaterialApp`s.** Breaks navigation and theming. Fix: keep one at the root.',
            '**Putting page content directly in `MaterialApp.home` without a `Scaffold`.** You lose the app bar and proper layout. Fix: return a `Scaffold` per screen.',
            '**Overflowing the `body` with a tall column.** Causes the yellow/black overflow stripes. Fix: wrap in `SingleChildScrollView` or use a `ListView`.',
            '**Hardcoding colors instead of using the theme.** Inconsistent UI. Fix: pull from `Theme.of(context)`.',
            '**Forgetting `useMaterial3: true`.** You get the old look. Fix: enable Material 3 in `ThemeData`.',
          ],
          tryIt:
            'Add a `bottomNavigationBar` with two `BottomNavigationBarItem`s (Bill and Reports). It will not switch screens yet — just confirm it renders at the bottom of the Scaffold. Then change the app bar background color via the theme.',
          takeaway: 'One MaterialApp at the root, one Scaffold per screen — the frame for every Flutter UI.',
        },
        {
          id: 'm0-t13',
          title: 'Layout widgets: Text, Row, Column, ListView',
          explain:
            'Compose UI with `Text`, stack widgets vertically with `Column`, side by side with `Row`, and scroll long lists with `ListView`.',
          analogy:
            'Plating a TunMani Cafe fish thali is layout. The rice, curry, and pickle sit side by side across the plate — that is a **Row**. The thali, the dessert bowl, and the finger bowl stack down the table — a **Column**. A long buffet line of dishes that scrolls past you is a **ListView**.',
          theory:
            '**`Text`** renders a string, optionally styled with a `TextStyle`. **`Column`** arranges children vertically; **`Row`** arranges them horizontally. Both take `mainAxisAlignment` and `crossAxisAlignment` to control spacing and alignment.\n\nFor a fixed, small number of children use `Column`/`Row`. For a **long or dynamic** list, use **`ListView`** (or `ListView.builder`), which scrolls and only builds visible items.\n\nA non-scrolling `Column` that is taller than the screen overflows; that is the signal to switch to a `ListView` or wrap in `SingleChildScrollView`. Spacing is usually added with `SizedBox` or `Padding`.',
          whyItMatters:
            'The billing screen is a scrolling list of order lines (ListView), each line a Row of name + qty + price, with a Column of totals beneath. These four widgets compose 90% of any screen. Knowing when a Column should become a ListView prevents the most common beginner bug — the overflow stripes.',
          steps: [
            'In a Scaffold body, place a `Column` with two `Text` widgets.',
            'Add a `Row` with a name on the left and a price on the right using `mainAxisAlignment: MainAxisAlignment.spaceBetween`.',
            'Insert a `SizedBox(height: 8)` between rows for spacing.',
            'Replace a long static `Column` with a `ListView`.',
            'Use `ListView.builder` with `itemCount` and `itemBuilder` over a menu list.',
            'Wrap each item in a `ListTile` for clean spacing.',
            'Run and scroll the list.',
          ],
          code: `// A billing-style list built from layout widgets.
import 'package:flutter/material.dart';

class BillBody extends StatelessWidget {
  const BillBody({super.key});

  @override
  Widget build(BuildContext context) {
    final menu = const [
      ('Neer Dosa', 12.5),
      ('Kori Rotti', 95.0),
      ('Fish Thali', 180.0),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.all(12),
          child: Text('Order', style: TextStyle(fontSize: 20)),
        ),
        // Long/dynamic list -> ListView (Expanded so it can scroll).
        Expanded(
          child: ListView.builder(
            itemCount: menu.length,
            itemBuilder: (context, i) {
              final (name, price) = menu[i];
              return ListTile(
                title: Text(name),
                // A Row inside the trailing slot: price right-aligned.
                trailing: Text('₹\${price.toStringAsFixed(2)}'),
              );
            },
          ),
        ),
      ],
    );
  }
}`,
          pitfalls: [
            '**Tall `Column` overflowing.** Yellow/black stripes appear. Fix: use `ListView` or `SingleChildScrollView`.',
            '**`ListView` inside a `Column` without `Expanded`.** Throws an unbounded-height error. Fix: wrap the `ListView` in `Expanded`.',
            '**Using `ListView` (not builder) for a big list.** Builds everything at once. Fix: use `ListView.builder` for long/dynamic lists.',
            '**Adding spacing with empty `Text(\' \')`.** Hacky. Fix: use `SizedBox` or `Padding`.',
            '**Wrong axis alignment.** Confusing main vs cross axis. Fix: main axis = direction of the Row/Column; cross = perpendicular.',
            '**Forgetting `itemCount`.** `ListView.builder` builds forever. Fix: always pass `itemCount`.',
          ],
          tryIt:
            'Build a `ListView.builder` over your menu list where each row is a `ListTile` showing the dish name as the title and the price as the trailing text. Add a header `Text` above the list using a `Column` + `Expanded`. Confirm it scrolls when you add ten items.',
          takeaway: 'Row across, Column down, ListView for long scrolling lists — the building blocks of every screen.',
        },
        {
          id: 'm0-t14',
          title: 'Buttons, TextField & handling input',
          explain:
            'Capture user input with `TextField` and a `TextEditingController`, and respond to taps with `ElevatedButton`.',
          analogy:
            'At the TunMani Cafe counter the cashier types a custom amount on a keypad and presses a green "Add" button. The keypad is a **TextField** (with a controller that remembers what was typed) and the green button is an **ElevatedButton** whose `onPressed` runs the "add to bill" action.',
          theory:
            'A **`TextField`** lets the user type. To read its value you attach a **`TextEditingController`** and read `controller.text`. Controllers must be created in `initState` and disposed in `dispose` — so a screen with text fields is usually a `StatefulWidget`.\n\nButtons like **`ElevatedButton`**, `TextButton`, and `OutlinedButton` take an **`onPressed`** callback. A `null` `onPressed` disables the button.\n\nYou combine them: type a quantity into a `TextField`, press an `ElevatedButton`, read `controller.text`, parse it with `int.tryParse(...)`, and call `setState` to update the order. `tryParse` returns null on bad input so you can validate gracefully.',
          whyItMatters:
            'Billing is all input: item quantities, custom prices, discounts, customer names. TextField + controller + button is the exact pattern for every form in the app. Disposing controllers and validating with `tryParse` are habits that separate a crash-prone app from a solid one the TunMani Cafe owner can trust.',
          steps: [
            'Make the screen a `StatefulWidget`.',
            'In `initState`, create `final _qtyCtrl = TextEditingController();` (or as a field).',
            'In `dispose`, call `_qtyCtrl.dispose();`.',
            'Add a `TextField(controller: _qtyCtrl, keyboardType: TextInputType.number)`.',
            'Add an `ElevatedButton(onPressed: _add, child: Text(\'Add\'))`.',
            'In `_add`, read `int.tryParse(_qtyCtrl.text)` and validate it.',
            'Call `setState` to update a running total and clear the field.',
          ],
          code: `// Input handling: TextField + controller + button.
import 'package:flutter/material.dart';

class AddItem extends StatefulWidget {
  const AddItem({super.key});
  @override
  State<AddItem> createState() => _AddItemState();
}

class _AddItemState extends State<AddItem> {
  final _qtyCtrl = TextEditingController();
  int _totalQty = 0;

  void _add() {
    final qty = int.tryParse(_qtyCtrl.text);   // null if not a number
    if (qty == null || qty <= 0) return;        // simple validation
    setState(() {
      _totalQty += qty;
      _qtyCtrl.clear();
    });
  }

  @override
  void dispose() {
    _qtyCtrl.dispose();   // always dispose controllers
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: _qtyCtrl,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Quantity'),
        ),
        const SizedBox(height: 8),
        ElevatedButton(onPressed: _add, child: const Text('Add')),
        Text('Total qty: $_totalQty'),
      ],
    );
  }
}`,
          pitfalls: [
            '**Not disposing the controller.** Memory leak. Fix: dispose it in `dispose()`.',
            '**Using `int.parse` on user input.** Crashes on bad text. Fix: use `int.tryParse` and check for null.',
            '**Reading `controller.text` without a controller.** TextField has no value to read. Fix: attach a `TextEditingController`.',
            '**Forgetting `setState` after updating state.** UI does not refresh. Fix: wrap state changes in `setState`.',
            '**Wrong keyboard type for numbers.** Owner gets a full keyboard for a quantity. Fix: `keyboardType: TextInputType.number`.',
            '**Calling `setState` in `build`.** Causes loops. Fix: only call it from event handlers.',
          ],
          tryIt:
            'Add a second `TextField` for a custom price (use `double.tryParse`) and a button that adds `qty * price` to a running `double total`. Validate both inputs, show the total, and clear both fields after a successful add.',
          takeaway: 'TextField + controller (read it) + button (act on it), with tryParse for safe input.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm0-p1',
      type: 'Mini Project',
      title: 'Coastal Bill Calculator (CLI)',
      domain: 'CLI / Pure Dart',
      duration: '2 hours',
      description:
        'A pure-Dart command-line program that totals a coastal-Karnataka restaurant order, applies 5% GST, and prints a formatted bill — no Flutter required.',
      tools: ['Dart 3.x', 'VS Code', 'Terminal'],
      blueprint: {
        overview:
          'Build a small Dart CLI that holds a menu (Map of name -> price), takes an order as a list of (item, qty) pairs, computes the subtotal, adds 5% GST, and prints a neatly formatted bill for the TunMani Cafe counter.',
        functionalRequirements: [
          '**Menu data.** A `Map<String, double>` of at least four coastal items (neer dosa, kori rotti, fish thali, goli baje).',
          '**Order input.** A list of `(itemName, quantity)` records the program iterates over.',
          '**Line totals.** For each order line, compute `price * qty` and print the line.',
          '**Subtotal & GST.** Sum the lines, then add 5% GST as a separate line.',
          '**Formatted output.** Print every amount as `₹` with two decimals using `toStringAsFixed(2)`.',
          '**Validation.** Skip or warn on items not present in the menu.',
        ],
        technicalImplementation: [
          '**Model.** A small `MenuItem`-style record or class for clarity.',
          '**Functions.** `double lineTotal(...)`, `double gst(double subtotal)`, and a `printBill(...)` helper.',
          '**Collections.** Use a `Map` for prices and a `List` for the order.',
          '**Formatting.** A `format(double)` arrow function returning `₹...` with two decimals.',
          '**Entry point.** A `void main()` that wires it all together and prints the bill.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold',
            outcome: 'A runnable Dart CLI file with a menu map and an order list.',
            prompt:
              "Create a single-file Dart console program called bill_calculator.dart. Define a Map<String, double> named menu with these coastal-Karnataka items and prices: 'Neer Dosa' 12.5, 'Kori Rotti' 95.0, 'Fish Thali' 180.0, 'Goli Baje' 40.0. Define a List of (String, int) records named order with three lines of my choice. Add a void main() that just prints the menu for now. Keep it beginner-friendly with comments, valid Dart 3, and runnable via `dart run bill_calculator.dart`.",
          },
          {
            step: 2,
            label: 'Compute totals',
            outcome: 'Per-line totals, a subtotal, and 5% GST computed correctly.',
            prompt:
              'Extend bill_calculator.dart. Add a function double lineTotal(double price, int qty) and a function double gst(double subtotal) that returns 5% of the subtotal. In main, loop over the order list, look up each price in the menu (skip with a warning if the item is missing), compute and accumulate the subtotal, then compute the GST and the grand total. Use double for all money. Show me the updated file with comments.',
          },
          {
            step: 3,
            label: 'Format & print the bill',
            outcome: 'A clean, aligned, rupee-formatted bill printed to the terminal.',
            prompt:
              "Finish bill_calculator.dart by adding a String format(double amount) arrow function that returns the amount as '₹' followed by two decimals (use toStringAsFixed(2)). Print a formatted bill: a header 'TUNMANI CAFE RESTAURANT', one line per item showing name, qty, and line total, then a divider, the Subtotal, GST (5%), and the Grand Total. Make the output readable in a terminal. Then suggest two small improvements I could add next.",
          },
        ],
      },
    },
    {
      id: 'm0-p2',
      type: 'Mini Project',
      title: 'TunMani Cafe Menu Screen (Flutter)',
      domain: 'Flutter UI',
      duration: '2 hours',
      description:
        'A tiny single-screen Flutter app that shows the TunMani Cafe menu as a scrollable list with each dish name and price, built from Scaffold + ListView + ListTile.',
      tools: ['Flutter 3.x', 'Dart 3.x', 'Android emulator or device'],
      blueprint: {
        overview:
          'Create a one-screen Flutter app whose Scaffold body is a ListView of menu items. Each row is a ListTile showing a coastal dish name and its rupee price. This is your first real Flutter UI and the seed of the billing app.',
        functionalRequirements: [
          '**One screen.** A `MaterialApp` with a single `Scaffold` titled "TunMani Cafe Menu".',
          '**Menu list.** A `List<MenuItem>` (or list of records) with at least five coastal items.',
          '**Scrollable rows.** A `ListView.builder` rendering one `ListTile` per item.',
          '**Price display.** Each tile shows the dish name and a right-aligned `₹` price.',
          '**Material 3.** Enable `useMaterial3: true` in the theme.',
        ],
        technicalImplementation: [
          '**Model.** A `MenuItem` class with `final String name` and `final double price`, with a constructor.',
          '**Widget tree.** `MaterialApp` -> `Scaffold(appBar, body)` -> `ListView.builder` -> `ListTile`.',
          '**Formatting.** Show price as `₹` with two decimals via `toStringAsFixed(2)`.',
          '**Stateless.** The screen is a `StatelessWidget` since the menu does not change yet.',
          '**Run target.** Launch on an emulator or device with `flutter run`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold the app',
            outcome: 'A running Flutter app showing an empty "TunMani Cafe Menu" screen.',
            prompt:
              "I have a fresh `flutter create` project. Replace lib/main.dart with a single-file app: a MaterialApp (useMaterial3: true) whose home is a StatelessWidget HomeScreen returning a Scaffold with an AppBar titled 'TunMani Cafe Menu' and a body that just says 'Loading menu...' for now. Keep it beginner-friendly with comments and make sure it runs with flutter run.",
          },
          {
            step: 2,
            label: 'Add the model & data',
            outcome: 'A MenuItem class and a list of coastal menu items.',
            prompt:
              "Extend lib/main.dart. Add a class MenuItem with final String name and final double price and a const constructor using required named parameters. Create a top-level const list of at least five coastal-Karnataka items: Neer Dosa 12.5, Kori Rotti 95.0, Fish Thali 180.0, Goli Baje 40.0, and Mangalore Buns 30.0. Don't change the UI yet — just add the model and data, and show me the file.",
          },
          {
            step: 3,
            label: 'Render the list',
            outcome: 'A scrollable menu where each row shows the dish and its price.',
            prompt:
              "Update the Scaffold body to a ListView.builder over the MenuItem list. Each item should be a ListTile with the dish name as the title and the price as the trailing text, formatted as '₹' plus two decimals (toStringAsFixed(2)). Make sure it scrolls. Then suggest how I would later turn each tile into an 'add to bill' button.",
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm0-q1',
      q: 'Which command verifies your Flutter toolchain is correctly installed?',
      options: ['flutter check', 'flutter doctor', 'flutter verify', 'dart health'],
      answer: 1,
    },
    {
      id: 'm0-q2',
      q: 'In Dart null safety, what does the type `String?` mean?',
      options: [
        'The string must never be empty',
        'The variable can hold a String or null',
        'The string is immutable',
        'The string is asynchronous',
      ],
      answer: 1,
    },
    {
      id: 'm0-q3',
      q: 'Which collection is best for looking up a menu price by item name?',
      options: ['List', 'Set', 'Map', 'Queue'],
      answer: 2,
    },
    {
      id: 'm0-q4',
      q: 'What is the right Dart construct for a fixed set of payment methods (cash/card/upi/credit)?',
      options: ['A List of strings', 'An enum', 'A Map of booleans', 'A nullable int'],
      answer: 1,
    },
    {
      id: 'm0-q5',
      q: 'Why does reading data from Firestore require `async`/`await`?',
      options: [
        'Because Firestore returns a Future that completes later, and await unwraps it without freezing the UI',
        'Because Dart cannot read maps synchronously',
        'Because await makes the code run faster',
        'Because Firestore only works inside StatelessWidgets',
      ],
      answer: 0,
    },
    {
      id: 'm0-q6',
      q: 'What does calling `setState` in a StatefulWidget do?',
      options: [
        'Permanently saves data to disk',
        'Marks the widget as needing a rebuild so the UI reflects the new state',
        'Creates a new MaterialApp',
        'Disposes the widget',
      ],
      answer: 1,
    },
  ],
}
