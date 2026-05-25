// Build Catering Management app for Local Catering Owners — curriculum.
// 10-module metadata-only shell. Sections, topics, projects, and quiz arrays
// fill in over the §8 build sequence (see memory/project_chittoor_catering_tutorial.md).

export const curriculum = {
  title: 'Build Catering Management app for Local Catering Owners',
  subtitle: 'A real Flutter + Firebase Android app, taught the Kundapura way',
  modules: [
    {
      id: 'm0',
      title: 'Foundations: Dart, Flutter & Async',
      hours: 8,
      color: 'from-orange-500/20 to-amber-700/10',
      accent: 'orange',
      description:
        'Pure Dart fundamentals, the Flutter widget tree, async/await, streams — everything you need before touching Firebase.',
      sections: [
        {
          id: 'm0-s1',
          title: 'Dart Language',
          topics: [
            {
              id: 'm0-t1',
              title: 'Install Flutter SDK & Android Studio (Windows)',
              explain: 'Get the Flutter SDK, Android Studio, and JDK 17 onto your Windows machine, then run `flutter doctor` until every check is green.',
              analogy: 'Picture **Suresh, a Kundapura coastal-cuisine caterer**, opening a brand-new kitchen on Court Road. Before the first customer walks in he needs the **gas connection** (cylinder + regulator + pipe), the **water connection** (Mahanadi pipeline + tank + tap), and the **commercial electricity meter** (license + wiring + earthing). One missing piece and the kitchen cannot serve a single dosa. Installing Flutter on Windows is the same three-piece setup: the **Flutter SDK is the gas** (the language + tooling that powers everything), **Android Studio is the water** (the IDE + emulator + Android SDK platform), and **JDK 17 is the electricity** (the Java runtime Gradle needs to build the APK). Skip any one and `flutter doctor` lights up red. Today you install all three, run one command, and never think about it again.',
              theory: `Flutter is **two things** bundled together: the **Dart SDK** (the language and its compilers) and the **Flutter framework** (the widget library, the engine, the platform integrations). When you "install Flutter" you actually unzip a folder that contains both, plus a CLI called \`flutter\` that orchestrates everything. There is no MSI installer on Windows — just a ZIP, a PATH entry, and \`flutter doctor\`.\n\n**Android Studio** is the official IDE for Android development. You do not have to use it as your editor (most Flutter devs prefer VS Code) but you DO have to install it because it ships the **Android SDK**, **Android SDK platform-tools** (for \`adb\`), the **Android emulator**, and crucially the **command-line tools** that \`flutter doctor\` checks for. Skipping Android Studio "to save disk space" is the #1 reason fresh installs fail.\n\n**JDK 17** is the Java Development Kit version Flutter currently expects. Gradle (the Android build system) runs on the JVM, and it needs JDK 17 specifically — not 11 (too old), not 21 (too new for the Gradle version Flutter 3.22 ships). Install **Eclipse Temurin 17** from adoptium.net. Set \`JAVA_HOME\` to the install folder and add \`%JAVA_HOME%\\bin\` to PATH.\n\n**\`flutter doctor\`** is your truth source. It checks every dependency in order, prints a green tick or red cross, and tells you exactly what to install or configure for each red mark. Run it after every install step — never assume something worked. The first run will likely have 2-3 red marks; each subsequent run should green-check one more line.`,
              diagram: `flowchart TD
    Start[Fresh Windows laptop] --> SDK["Download Flutter SDK ZIP<br/>flutter.dev/get-started"]
    SDK --> Unzip["Unzip to C:/src/flutter<br/>NOT Program Files"]
    Unzip --> PathA[Add C:/src/flutter/bin to PATH]
    PathA --> AS[Install Android Studio]
    AS --> ASsdk["Open Android Studio once<br/>let it install Android SDK"]
    ASsdk --> JDK[Install JDK 17 - set JAVA_HOME]
    JDK --> Doc[Run flutter doctor]
    Doc --> Lic["flutter doctor --android-licenses<br/>accept all"]
    Lic --> Plug[Install VS Code Flutter extension]
    Plug --> Done[All green — ready to flutter create]`,
              flowExplain: 'Three downloads (Flutter ZIP, Android Studio, JDK 17), three PATH/HOME entries, then `flutter doctor` repeatedly until every line shows a green tick. The licence-accept step is mandatory — Gradle refuses to build without it.',
              whyItMatters: 'Every Flutter job interview eventually asks **"can you build a release APK on your laptop right now?"** — they are not testing your Dart, they are testing whether you have done a real install once. Beyond interviews, this exact `flutter doctor` workflow is the diagnostic flow you will run dozens of times: every Windows update, every IDE upgrade, every new project clone. Master it once on day one and you skip the **"works on my machine"** trap that catches half of all junior Flutter devs.',
              steps: [
                'Download the **Flutter SDK ZIP** for Windows from `flutter.dev/docs/get-started/install/windows`. Pick the **stable** channel.',
                'Unzip into `C:\\src\\flutter` (avoid `C:\\Program Files\\` — Flutter writes into its own folder and admin-only paths break it).',
                'Add `C:\\src\\flutter\\bin` to your **User PATH** (Settings → System → About → Advanced system settings → Environment Variables).',
                'Close every terminal, open a fresh PowerShell, run `flutter --version`. Expect `Flutter 3.22.x • channel stable`.',
                'Install **Android Studio** from `developer.android.com/studio`. Run it once and let it download the Android SDK + emulator (~6 GB).',
                'Install **JDK 17** from `adoptium.net` (Eclipse Temurin). Set `JAVA_HOME` to the install folder; add `%JAVA_HOME%\\bin` to PATH.',
                'Run `flutter doctor`. Expect 2-3 red marks. Run `flutter doctor --android-licenses` and answer **y** to every prompt.',
                'Install the **Flutter** and **Dart** extensions in VS Code. Run `flutter doctor` one last time — every line should be green.',
              ],
              code: `# PowerShell session — what success looks like end-to-end
PS C:\\Users\\suresh> flutter --version
Flutter 3.22.0 • channel stable • https://github.com/flutter/flutter.git
Framework • revision a14f74ff3a • 2024-05-14
Engine • revision 0883b3c1b1
Tools • Dart 3.4.0 • DevTools 2.34.3

PS C:\\Users\\suresh> flutter doctor
Doctor summary (to see all details, run flutter doctor -v):
[OK] Flutter (Channel stable, 3.22.0, on Microsoft Windows 10.0.19045.4291)
[OK] Windows Version (Installed version of Windows is version 10 or higher)
[OK] Android toolchain - develop for Android devices (Android SDK version 34.0.0)
[OK] Chrome - develop for the web
[OK] Android Studio (version 2023.3)
[OK] VS Code (version 1.89.1)
[OK] Connected device (3 available)
[OK] Network resources

* No issues found!

PS C:\\Users\\suresh> echo \$env:JAVA_HOME
C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.11.9-hotspot

PS C:\\Users\\suresh> flutter doctor --android-licenses
All SDK package licenses accepted.`,
              pitfalls: [
                '**Unzipping into `C:\\Program Files\\flutter`.** Windows treats it as admin-only; Flutter writes into its own folder and silently fails. Fix: unzip into `C:\\src\\flutter` or `C:\\Users\\<you>\\flutter`.',
                '**JDK 21 installed but Flutter wants 17.** Symptom: Gradle build crashes with `Unsupported class file major version 65`. Fix: install JDK 17 alongside, set `JAVA_HOME` to the 17 path, OR run `flutter config --jdk-dir "C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.11.9-hotspot"`.',
                '**Android licences not accepted.** `flutter doctor` shows "Android licenses not accepted (run flutter doctor --android-licenses)". Fix: run that exact command and answer `y` to every prompt — there are usually 6-7.',
                '**PATH not refreshed in VS Code terminal.** You added Flutter to PATH but VS Code\'s integrated terminal still says "command not found". Fix: fully quit VS Code (not just close the window) and reopen — its terminals cache PATH at startup.',
                '**Skipping Android Studio "to save disk space".** Then `flutter doctor` complains about cmdline-tools. Fix: install Android Studio anyway; it is the official source for the Android SDK and cmdline-tools.',
                '**Antivirus quarantines `dart.exe` or `flutter.bat`.** Common on corporate Windows laptops. Fix: whitelist `C:\\src\\flutter\\` in your AV exclusions.',
                '**Visual Studio missing red mark.** Only needed for Windows desktop builds. For Android-only catering app development, ignore safely.',
                '**Running `flutter` from inside the unzipped folder.** Works locally but breaks for relative-path projects. Fix: always run `flutter` from your project folder; the global PATH entry routes the call.',
              ],
              tryIt: 'Run `flutter doctor` and screenshot the output. If any line is red, fix it before continuing. Now extend it: run `flutter create hello_world && cd hello_world && flutter run -d chrome` and confirm the default counter app launches in your browser. **You have just compiled and run real Flutter code** — the rest of this course builds on this exact loop.',
              takeaway: 'No green doctor, no Flutter — verify the toolchain before writing one line of Dart.',
            },
            {
              id: 'm0-t2',
              title: 'Dart Variables, Types & Null Safety',
              explain: 'Declare values the Dart way — sound null safety, immutable defaults with `final` and `const`, and `late` for promises you keep.',
              analogy: 'Imagine the **order pad at a Kundapura tiffin centre**. The pad is **pre-printed** with three columns: *item name* (text), *quantity* (number), *served?* (yes/no). The waiter **cannot write a price in the quantity column** — the column itself enforces the type. Even better, the *served?* column starts empty until the food leaves the kitchen, but at the end of the day the manager checks: every order MUST have a tick or a cross — never an empty box. That is **sound null safety**: every variable has a type, the type controls what you can put in it, and the type tells you whether *empty* is allowed at all. A Dart program that compiles is a program where the manager has already audited every column.',
              theory: `Dart is **statically and soundly typed**: every variable has a type known at compile time, and the compiler refuses to let a value of one type sneak into a slot meant for another. You declare with \`var\` (type inferred), \`final\` (type inferred, value set once), \`const\` (compile-time constant), or by writing the type explicitly (\`String name = 'Suresh';\`). The convention is **\`final\` first, \`const\` when the value is known at compile time, \`var\` only when type-inference makes the code shorter without losing clarity**, and explicit types when the right-hand side is opaque.\n\n**Null safety** is the headline Dart 3 feature. Every type is **non-nullable by default**: \`String name\` cannot hold \`null\`. To opt into nullability you write \`String? name\` — the \`?\` is part of the type, not a modifier. The compiler then forces you to handle the null case at every read site (with \`if (name != null)\`, the \`??\` default operator, or the \`!\` bang operator when you can prove non-null). This eliminates the entire class of \`NullPointerException\` crashes that used to dominate Android development.\n\n**\`late\`** is the escape hatch for "this will be non-null, but I cannot initialize it in the constructor". The classic case is a field that depends on \`context\` or an async fetch. Writing \`late final String userId;\` promises the compiler "I will assign this exactly once before any read" — break the promise and you get a \`LateInitializationError\` at runtime. Use \`late\` sparingly; prefer constructor parameters when you can.\n\n**\`final\` vs \`const\`**: \`final\` means the *variable* cannot be reassigned — but the *object* it points to can still mutate. \`const\` means the value is **deeply immutable AND computed at compile time**. \`const\` lists, maps, and widgets are canonicalized: ten \`const SizedBox(height: 16)\` widgets share one instance in memory, which is why \`const\` constructors are a Flutter performance superpower.`,
              diagram: `stateDiagram-v2
    [*] --> Declared: var / final / const / late
    Declared --> NonNullable: String name
    Declared --> Nullable: String? name
    NonNullable --> MustInitialize: compiler enforces value
    Nullable --> MaybeNull: read needs null check
    MaybeNull --> SafeRead: if (name != null) OR name ?? 'default'
    MaybeNull --> BangRead: name! (throws if null)
    NonNullable --> Reassign: var
    NonNullable --> Frozen: final / const
    Frozen --> [*]: cannot rebind`,
              flowExplain: 'Pick a declaration keyword, pick a type with or without `?`, and the compiler picks the rules: nullable types force a null-check on every read; non-nullable types must be initialized; `final`/`const` lock the binding so it cannot be reassigned.',
              whyItMatters: 'In a real Flutter app the difference between **`String?`** and **`String`** on a single field is the difference between a runtime crash on the owner\'s phone and a compile-time error you fix in two seconds. Every Firestore field, every URL parameter, every shared-prefs read returns a nullable type — so you will spend the rest of your Flutter career deciding **where to handle null**. Get the mental model right today and `null` becomes a tame compile-time concern instead of a 2 AM Crashlytics page.',
              steps: [
                'In a fresh `dart-bootcamp/` folder, create `variables.dart` and add `void main() { ... }`.',
                'Inside main, write `final String name = \'Anjali\';` and `print(name);`. Run with `dart run variables.dart`.',
                'Add `String? phone;` (no value) and `print(phone);` — confirm it prints `null`.',
                'Try `print(phone.length);` — note the **compile error**: "The property \'length\' can\'t be unconditionally accessed because the receiver can be null."',
                'Fix it with `print(phone?.length ?? 0);` — the `?.` skips when null, the `??` supplies a default.',
                'Add `const int hallCount = 2;` and try to reassign it — note the compile error.',
                'Add `late String userId;` and `print(userId);` — note the **runtime** `LateInitializationError`. Now assign first then print — works.',
                'Run `dart analyze` in the folder — the analyzer should report **No issues found**.',
              ],
              code: `// variables.dart — every flavour of declaration in one file.
void main() {
  // 1. final — type inferred, value set once.
  final ownerName = 'Suresh Bhat';
  print(ownerName);

  // 2. Explicit type — clearer when the right-hand side is opaque.
  final String customerPhone = '+91-9845012345';
  print(customerPhone);

  // 3. const — compile-time constant, deeply immutable.
  const int hallCount = 2;
  const taxRate = 0.05;
  print('Halls: \$hallCount, GST: \${(taxRate * 100)}%');

  // 4. Nullable types — opt-in with the ? suffix.
  String? eventNotes;             // starts as null, allowed.
  print(eventNotes ?? 'No notes yet');

  // 5. Null-aware operators.
  eventNotes = 'Birthday party';
  print(eventNotes?.length);      // 15 (the ? skips when null)
  print(eventNotes!.toUpperCase()); // BIRTHDAY PARTY (! asserts non-null)

  // 6. late — promise the compiler "I will assign before reading".
  late final String invoiceNumber;
  invoiceNumber = 'INV-2026-0042';
  print(invoiceNumber);

  // 7. var — type inferred, value can be reassigned (rare in real code).
  var guestCount = 120;
  guestCount = 150;
  print('Guests: \$guestCount');

  // 8. The compiler refuses this:
  // final String forbidden;        // Error: must initialize a non-late final.
  // String forbidden = null;        // Error: null can't be assigned to String.
}`,
              pitfalls: [
                '**Reaching for `var` everywhere.** Works, but loses readability when the right-hand side is a complex generic. Fix: prefer `final`; reach for explicit types when inference would hurt clarity.',
                '**Adding `?` to silence a compile error.** If the field is conceptually never null (e.g. a customer name), making it nullable just postpones the bug. Fix: keep it non-nullable and supply a real default in the constructor.',
                '**Using `!` (bang) liberally.** Each `!` is a runtime time bomb that will throw `Null check operator used on a null value`. Fix: use `??` to supply a default, or restructure so the null case cannot reach that code path.',
                '**`late` everywhere.** `late` defers the null check to runtime, exactly the bug Dart\'s null safety is supposed to prevent. Fix: pass values through the constructor instead.',
                '**Confusing `final` with `const`.** `final List items = [];` lets you `items.add(...)` later (the variable is final, the list is mutable). `const List items = [];` blocks all mutation — `items.add(...)` throws.',
                '**Forgetting that `const` propagates.** `const Customer(name: \'Suresh\')` requires `Customer` to have a `const` constructor AND every field to be `const` itself.',
                '**Treating `null` and an empty string as the same.** A null `eventNotes` means *unknown*; `\'\'` means *known to be empty*. The Firestore layer cares — null fields are absent from the document, empty strings are present.',
                '**Initializing `late final` twice.** Throws `LateInitializationError: Field has already been initialized` at runtime. Fix: assign exactly once.',
              ],
              tryIt: 'Create `customer.dart` with a top-level `main()`. Declare a `final String customerName`, a `String? secondaryPhone`, a `late final String customerId`, and a `const int maxBookingsPerDay = 5`. Print all four. Now extend it: write a function that takes a `String?` and returns `String` using `??` to fall back to `\'Unknown\'`. Call it twice — once with `null`, once with `\'Anjali\'`.',
              takeaway: 'Reach for `final` first, `const` when you can, `?` only when null is a real meaningful state.',
            },
            {
              id: 'm0-t3',
              title: 'Functions, Named Parameters & Arrow Syntax',
              explain: 'Write Dart functions with positional, named, optional, and required parameters — and use the `=>` arrow form for one-liners.',
              analogy: 'Picture the **bhattaru taking a thali order at a Maravante-side wedding**. He could shout *"one thali, full meals, extra rasam, no chutney, banana-leaf seating"* — five facts in a fixed order, and if he swaps two by mistake the kitchen plates the wrong meal. OR he can ask **"meal type? extras? omissions? seating?"** one labelled question at a time, in any order. Dart calls the first style **positional parameters** (fast but error-prone) and the second style **named parameters** (longer to call, impossible to mix up). Real Flutter widgets are almost entirely named parameters because a `Container` has thirty knobs and nobody can remember the order. The bhattaru learnt this the day a guest got pickle instead of payasa — you learn it today, before your first widget tree.',
              theory: `A Dart function has **a name, a return type, a parameter list, and a body**. The parameter list supports four flavours: **positional required** (\`int add(int a, int b)\`), **positional optional** with defaults (\`String greet(String name, [String greeting = 'Namaskara'])\`), **named optional** with defaults (\`Widget pad({double horizontal = 0, double vertical = 0})\`), and **named required** with the \`required\` keyword (\`Customer({required String name, required String phone})\`).\n\n**Named parameters** are the workhorse of Flutter. Every \`Widget\` constructor uses them so call sites are self-documenting: \`Padding(padding: EdgeInsets.all(8), child: Text('Hi'))\` reads top to bottom. The price you pay is verbosity — three extra characters per parameter — but the gain in readability and refactorability is worth it ten times over.\n\nThe **\`required\`** keyword on a named parameter forces the caller to supply it; without \`required\`, named parameters are optional and either need a default or be nullable. With sound null safety, omitting \`required\` on a non-nullable named parameter is a compile error.\n\nThe **\`=>\` arrow** is shorthand for a function whose body is a single expression. \`int double(int x) => x * 2;\` is identical to \`int double(int x) { return x * 2; }\`. The arrow form is widely used for getters, callbacks (\`onPressed: () => print('tap')\`), and one-line transformations on lists (\`names.map((n) => n.toUpperCase())\`).\n\n**Functions are first-class** in Dart: you can pass them as arguments, return them from other functions, and store them in variables. \`final greet = (String n) => 'Hi \$n';\` declares a function-valued variable. This is what makes \`onPressed\`, \`builder\`, and every Flutter callback so clean.`,
              diagram: `flowchart LR
    Call["Call site"] --> Pos["Positional<br/>add(2, 3)"]
    Call --> Named["Named<br/>Padding(padding: ..., child: ...)"]
    Pos --> Req["int add(int a, int b)"]
    Pos --> Opt["String greet(String n, [String g = 'Hi'])"]
    Named --> NReq["({required String name})"]
    Named --> NOpt["({double horizontal = 0})"]
    Req --> Body["{ return ...; }"]
    NReq --> Arrow["=> single expression"]`,
              flowExplain: 'A call site uses either positional args (order matters) or named args (label matters). The signature picks one style; `required` on a named parameter forces the caller to supply it. The body can be either a `{ ... }` block or a single `=>` expression.',
              whyItMatters: 'Every Flutter widget you will ever build is a function call with **named parameters**. Every callback (`onPressed`, `onChanged`, `builder`) is a **first-class function**. Every `.map(...)`, `.where(...)`, `.then(...)` you will write uses an **arrow lambda**. Internalise these four flavours today and Flutter\'s widget syntax stops feeling magical — it is just Dart functions with one Material-themed paint job on top.',
              steps: [
                'Create `functions.dart` and add `void main() { ... }`.',
                'Inside, write a positional function `int add(int a, int b) => a + b;` (top-level, outside main). Call `print(add(2, 3));` from main.',
                'Add a function with a default positional parameter: `String greet(String name, [String greeting = \'Namaskara\']) => \'\$greeting, \$name!\';`. Call it with one and two arguments.',
                'Convert it to named parameters: `String greetN({required String name, String greeting = \'Namaskara\'}) => \'\$greeting, \$name!\';`. Call as `greetN(name: \'Anjali\')`.',
                'Try omitting `name` — note the compile error: "The named parameter \'name\' is required, but there\'s no corresponding argument."',
                'Store a function in a variable: `final shout = (String s) => s.toUpperCase();`. Call `print(shout(\'hi\'));`.',
                'Pass it as an argument: `print([\'a\', \'b\'].map(shout).toList());`.',
                'Run `dart format .` and `dart analyze` — both should be clean.',
              ],
              code: `// functions.dart — the four parameter flavours, plus arrow form.

// 1. Positional required.
int add(int a, int b) => a + b;

// 2. Positional optional with a default.
String greet(String name, [String greeting = 'Namaskara']) => '\$greeting, \$name!';

// 3. Named optional + named required.
String describeEvent({
  required String title,
  required int guestCount,
  String hall = 'Hall 1',
  String? notes,
}) {
  final base = '\$title at \$hall for \$guestCount guests';
  return notes == null ? base : '\$base (\$notes)';
}

// 4. First-class function — stored in a variable, passed around.
final shout = (String s) => s.toUpperCase();

// Higher-order function — takes a function as a parameter.
List<String> transformAll(List<String> names, String Function(String) op) {
  return names.map(op).toList();
}

void main() {
  print(add(2, 3));                                // 5
  print(greet('Anjali'));                          // Namaskara, Anjali!
  print(greet('Pradeep', 'Good morning'));         // Good morning, Pradeep!

  print(describeEvent(
    title: 'Rao wedding',
    guestCount: 250,
    hall: 'Hall 2',
    notes: 'pulimunchi as starter',
  ));
  // Rao wedding at Hall 2 for 250 guests (pulimunchi as starter)

  print(transformAll(['anjali', 'pradeep', 'shreya'], shout));
  // [ANJALI, PRADEEP, SHREYA]
}`,
              pitfalls: [
                '**Forgetting `required` on a non-nullable named parameter.** Compile error: "The parameter \'name\' can\'t have a value of \'null\' because of its type, but the implicit default value is \'null\'." Fix: add `required` or supply a default or make the type nullable.',
                '**Mixing positional optional `[ ]` and named optional `{ }` in the same signature.** Dart allows one or the other, not both. Pick named — it scales.',
                '**Using positional parameters for widgets in your own code.** `MyCard(\'Anjali\', \'+91-...\')` is unreadable two months later. Fix: always use named parameters for widget constructors.',
                '**Returning from an arrow function with a `return` keyword.** `int x() => return 1;` is a syntax error. The arrow already implies return.',
                '**Passing arguments out of order with positional functions.** `add(b, a)` compiles but does the wrong thing. With named, `add(a: 2, b: 3)` is order-proof.',
                '**Treating named-default values as runtime defaults.** Defaults must be **compile-time constants** (`0`, `\'Hall 1\'`, `const []`). You cannot default to `DateTime.now()` — wrap the call: `void f({DateTime? when}) { when ??= DateTime.now(); }`.',
                '**Forgetting that closures capture by reference.** `for (var i = 0; i < 3; i++) callbacks.add(() => print(i));` prints `3 3 3` not `0 1 2`. Fix: use `for (final i in [0,1,2])` or capture into a `final` inside the loop body.',
                '**Confusing `void Function()` with `Function`.** `Function` is the untyped catch-all; prefer typed function signatures (`String Function(int)`) so the analyzer can help you.',
              ],
              tryIt: 'Write a function `priceQuote({required int guests, required double perPlate, double discount = 0, double gstRate = 0.05})` that returns the formatted total `\'\\u20B95,250.00\'` (₹5,250.00). Call it three ways: minimum named args, with discount, and with a custom gstRate. **Now extend it** to accept an optional `String? customerName` and prefix the output with `\'Quote for \$customerName: \'` when present.',
              takeaway: 'Positional for math-y two-argument functions; named for everything else.',
            },
            {
              id: 'm0-t4',
              title: 'Classes, Constructors & the `copyWith` Pattern',
              explain: 'Build immutable Dart classes with named constructors and a `copyWith` method — the pattern every Flutter model class uses.',
              analogy: 'The **caterer\'s order pad with a carbon copy** is the perfect mental model. The original page records the order at the moment of booking — names, date, hall, menu — and is **never erased**. When the customer phones two days later to add 20 guests, the bhattaru does NOT scratch out the old number; he tears off a **fresh carbon copy**, writes the new guest count, and clips it under the original. The history is preserved, the change is auditable, and there is no risk of half-edited state. That is exactly **`copyWith`**: every model object is immutable; "editing" it means **constructing a new one** with the changed fields and the rest copied across. Flutter\'s entire reactive model — `setState`, `Provider`, `Bloc` — depends on this pattern. Skip it and you will spend your career chasing state-mutation bugs.',
              theory: `A Dart **class** is the standard OOP construct: a blueprint for objects with fields and methods. The shape is \`class Customer { final String name; final String phone; Customer({required this.name, required this.phone}); }\`. Note the **\`final\` fields** and the **\`required this.name\`** shorthand in the constructor — this is the idiomatic immutable-model style.\n\nDart supports **multiple constructors** via **named constructors**: \`Customer.fromMap(Map<String, dynamic> m) : name = m['name'], phone = m['phone'];\`. The \`: name = ...\` syntax is the **initializer list** — runs before the body, the only place to assign \`final\` fields. Named constructors are how Firestore deserialization (\`Event.fromMap\`), JSON parsing, and copy-from-existing patterns are wired up.\n\n**\`factory\`** constructors look like regular constructors but explicitly return an instance — useful when you want to return a cached instance, return a subclass, or fail with a thrown exception. \`factory Customer.fromJson(String s) { ... return Customer(name: ..., phone: ...); }\`.\n\nThe **\`copyWith\`** pattern is a method that returns a new instance with the specified fields overridden and the rest copied: \`Customer copyWith({String? name, String? phone}) => Customer(name: name ?? this.name, phone: phone ?? this.phone);\`. The \`??\` falls back to the existing value when the caller omits a field. Combined with \`final\` fields, this gives you fully immutable models that still support "edit one field" UX.\n\nThere is **one famous trap** with \`copyWith\`: if a field is itself nullable, the \`??\` collapses an intentional null. Setting \`notes = null\` to clear a note will be silently ignored because \`null ?? this.notes\` falls back to the old value. The chittoorCatering source repo carries this exact bug in [event.dart](lib/features/events/data/event.dart) early commits — see Module 5 for the full fix using a sentinel object.`,
              diagram: `flowchart LR
    Original["Customer<br/>name: 'Anjali'<br/>phone: '+91-...'"] --> Copy["copyWith(phone: '+91-NEW')"]
    Copy --> NewObj["NEW Customer<br/>name: 'Anjali'<br/>phone: '+91-NEW'"]
    Original -.untouched.-> Original2["Original still in memory<br/>(immutable)"]
    NewObj --> Save["repo.update(NewObj)"]`,
              flowExplain: 'The original `Customer` object is never mutated. `copyWith` constructs a brand-new object with the requested change; the original stays in memory until garbage-collected. This is what makes Flutter `setState` safe — old and new state can coexist while the framework diffs them.',
              whyItMatters: 'Every model in your Flutter app — `Customer`, `Event`, `Hall`, `Invoice`, `Menu` — will be a class with `final` fields, a primary constructor, a `fromMap` constructor for Firestore, a `toMap` method back to Firestore, and a `copyWith`. Master this skeleton today and you will write the next 30 model classes in 5 minutes each. Get it wrong (mutable fields, no `copyWith`) and your UI will glitch in ways no debugger can untangle.',
              steps: [
                'Create `customer.dart`. Declare `class Customer` with `final String name;` and `final String phone;`.',
                'Add a primary constructor: `Customer({required this.name, required this.phone});`.',
                'Add a named constructor: `Customer.empty() : name = \'\', phone = \'\';`.',
                'Add a `fromMap` constructor: `Customer.fromMap(Map<String, dynamic> m) : name = m[\'name\'] as String, phone = m[\'phone\'] as String;`.',
                'Add a `toMap` method that returns `{\'name\': name, \'phone\': phone}`.',
                'Add a `copyWith({String? name, String? phone})` method using the `??` pattern.',
                'In `main()`, create `final c = Customer(name: \'Anjali\', phone: \'+91-9845012345\');` and `final c2 = c.copyWith(phone: \'+91-NEW\');`. Print both.',
                'Confirm `c.phone` is unchanged — `c2` is the only one with the new number.',
              ],
              code: `// customer.dart — the canonical immutable model + copyWith.
class Customer {
  final String name;
  final String phone;
  final String? notes;     // intentionally nullable — null means "no notes"

  const Customer({
    required this.name,
    required this.phone,
    this.notes,
  });

  // Empty default — used in form-init state.
  const Customer.empty()
      : name = '',
        phone = '',
        notes = null;

  // Firestore deserialization.
  factory Customer.fromMap(Map<String, dynamic> m) {
    return Customer(
      name: m['name'] as String,
      phone: m['phone'] as String,
      notes: m['notes'] as String?,
    );
  }

  // Firestore serialization.
  Map<String, dynamic> toMap() => {
        'name': name,
        'phone': phone,
        if (notes != null) 'notes': notes,
      };

  // The copy-on-edit pattern.
  // NB: this version has the famous "cannot clear notes" bug — see Module 5
  // for the sentinel-object fix.
  Customer copyWith({String? name, String? phone, String? notes}) {
    return Customer(
      name: name ?? this.name,
      phone: phone ?? this.phone,
      notes: notes ?? this.notes,
    );
  }

  @override
  String toString() => 'Customer(\$name, \$phone)';
}

void main() {
  final c = Customer(name: 'Anjali', phone: '+91-9845012345');
  final c2 = c.copyWith(phone: '+91-9000000000');

  print(c);   // Customer(Anjali, +91-9845012345)
  print(c2);  // Customer(Anjali, +91-9000000000)

  // Round-trip via Firestore-style map.
  final map = c.toMap();
  final c3 = Customer.fromMap(map);
  print(c3);  // Customer(Anjali, +91-9845012345)
}`,
              pitfalls: [
                '**Mutable fields.** Dropping `final` lets you write `c.phone = \'NEW\'` — works, but breaks every framework that compares old vs new state. Fix: keep all model fields `final`; reach for `copyWith`.',
                '**`copyWith` collapsing nullable fields.** `notes ?? this.notes` cannot distinguish "caller wants to clear notes" from "caller did not pass notes". Fix: use a sentinel (`Object _unset = Object();`) — covered in Module 5.',
                '**Forgetting to mark the constructor `const`.** Without `const`, you cannot use `const Customer.empty()` in `const` contexts (e.g. as a default value). Fix: add `const` to the constructor whenever every field is `final`.',
                '**Using a positional constructor.** `Customer(\'Anjali\', \'+91-...\')` is fragile when fields swap order. Fix: always use named parameters with `required this.name` syntax.',
                '**Skipping `fromMap`/`toMap` in favour of JSON code-generation.** Fine for big projects, overkill for a 5-field catering model. Hand-written serializers are clearer and survive Dart upgrades better.',
                '**Throwing inside a constructor body.** Can leave half-constructed objects in memory. Fix: validate via a `factory` that throws before calling the real constructor.',
                '**Overriding `==` without overriding `hashCode`.** Dart maps and sets use `hashCode` for bucketing; mismatched implementations cause silent lookup failures. Fix: override both, or use `package:equatable`.',
                '**Calling `copyWith` for every keystroke.** Each call allocates a new object — fine for occasional edits, expensive in tight loops. Fix: batch edits, or move to a mutable draft object inside the form layer.',
              ],
              tryIt: 'Build a `Hall` class with `final String id`, `final String name`, `final int capacity`, and a `bool isActive` (default `true`). Add primary, `empty()`, `fromMap`, `toMap`, and `copyWith`. In `main()`, create `Hall(id: \'h1\', name: \'Maravante Mantapa\', capacity: 300)`, then derive a `copyWith(isActive: false)` to mark it as decommissioned. Confirm the original is unchanged.',
              takeaway: 'Final fields + named constructor + copyWith = every model class you will ever write in Flutter.',
            },
            {
              id: 'm0-t5',
              title: 'Collections: List, Map, Set & Spread',
              explain: 'Use Dart lists, maps, and sets fluently — including the `...` spread, collection-if, and collection-for inside literals.',
              analogy: 'Walk into the **Kundapura caterer\'s back office** at 6 AM. Three notebooks sit on the desk. The **menu card book** (\'rice, sambar, palya, payasa\') has items in a fixed order — that is a **List**. The **customer phone directory** (\'Anjali → +91-9845...\', \'Pradeep → +91-9000...\') looks up a number by name — that is a **Map**. The **today\'s confirmed-guest tag list** (each guest has exactly one tag, no duplicates allowed at the door) is a **Set**. Each notebook is a different *shape* of memory because each is the right tool for a different question — *show me everything in order*, *give me the value for this key*, *is this guest already on the list*. Pick the wrong notebook and you will spend the whole evening flipping pages while the dosa goes cold.',
              theory: `Dart ships **three core collection types** in \`dart:core\`: **\`List<T>\`** (ordered, indexable, allows duplicates), **\`Map<K,V>\`** (key→value lookup, key uniqueness enforced), and **\`Set<T>\`** (unordered, deduped membership). All three have **literal syntax** with type-inference: \`[1, 2, 3]\` is a \`List<int>\`, \`{'a': 1, 'b': 2}\` is a \`Map<String, int>\`, and \`{1, 2, 3}\` is a \`Set<int>\` (yes — same braces as Map, the key/value distinction tells Dart which).\n\n**Spread (\`...\`)** lets you splat one collection into another literal: \`[0, ...existing, 99]\`. The **null-aware spread (\`...?\`)** safely handles a possibly-null source: \`[...?maybeList]\`. Both work for List and Map; for Map the spread copies entries.\n\n**Collection-if** and **collection-for** are Dart's killer feature for building widget trees and Firestore maps inline: \`[if (showHeader) Text('Header'), ...items, if (showFooter) Text('Footer')]\` and \`[for (final c in customers) ListTile(title: Text(c.name))]\`. These let you build conditional, dynamic collection literals **without** intermediate variables. Flutter widget trees lean on this constantly.\n\n**Common operations** — \`.map\`, \`.where\`, \`.toList\`, \`.fold\`, \`.reduce\`, \`.any\`, \`.every\`, \`.firstWhere\` — return **lazy iterables**, which means nothing executes until you call \`.toList()\` or iterate. This is why you so often see \`.map(...).toList()\` in Flutter code: \`ListView.builder\` needs a real list, not a lazy iterable.\n\n**Maps** have \`map[key]\` returning \`V?\` (nullable — key may not exist), \`map.containsKey(key)\` for explicit checks, and \`map[key] ??= defaultValue\` for "insert if absent". For ordered iteration use \`LinkedHashMap\` (Dart's default for literal maps already preserves insertion order).`,
              diagram: `flowchart TB
    subgraph Literals["Literal syntax"]
        L["[1, 2, 3]<br/>List<int>"]
        M["{'a': 1, 'b': 2}<br/>Map<String, int>"]
        S["{1, 2, 3}<br/>Set<int>"]
    end
    subgraph Operators["Spread & comprehension"]
        Spread["[0, ...existing, 99]"]
        NSpread["[...?maybeNullList]"]
        IfFor["[if (cond) X, for (final y in ys) Y(y)]"]
    end
    subgraph Methods["Lazy iterable methods"]
        Map[".map(fn)"]
        Where[".where(pred)"]
        ToList[".toList() — materialise"]
    end
    Literals --> Operators
    Literals --> Methods`,
              flowExplain: 'Pick the right literal shape (`[]`, `{}`, or key→value `{}`), then either compose with `...` and `if`/`for` inside the literal, or chain `.map`/`.where` on the iterable and `.toList()` to materialise.',
              whyItMatters: 'Every Flutter widget tree is a **`List<Widget>`** built with collection-if and collection-for. Every Firestore document is a **`Map<String, dynamic>`**. Every "currently selected items" UX is a **`Set<String>`**. You will use all three within the first hour of writing Flutter code. Knowing spread and collection-comprehension fluently is the difference between **clean, declarative widget trees** and **30-line nested if-blocks** that nobody can refactor.',
              steps: [
                'Create `collections.dart` with `void main() { ... }`.',
                'Build a list: `final menu = [\'rice\', \'sambar\', \'palya\', \'payasa\'];`. Print `menu.length` and `menu[2]`.',
                'Build a map: `final phones = {\'Anjali\': \'+91-9845...\', \'Pradeep\': \'+91-9000...\'};`. Print `phones[\'Anjali\']` and `phones[\'Unknown\']` (note the latter is null).',
                'Build a set: `final tags = {\'vip\', \'vip\', \'sponsor\'};`. Print `tags` — note `vip` appears once.',
                'Use spread: `final fullMenu = [\'welcome drink\', ...menu, \'paan\'];`. Print it.',
                'Use collection-if: `final showFooter = true; final items = [\'a\', \'b\', if (showFooter) \'footer\'];`.',
                'Use collection-for: `final upper = [for (final m in menu) m.toUpperCase()];`. Print it.',
                'Chain `.where` + `.map` + `.toList`: `final longNames = menu.where((m) => m.length > 4).map((m) => m.toUpperCase()).toList();`.',
              ],
              code: `// collections.dart — every literal flavour, plus spread and comprehension.
void main() {
  // 1. List — ordered, indexable, allows duplicates.
  final menu = <String>['rice', 'sambar', 'palya', 'payasa'];
  print(menu.length);          // 4
  print(menu[2]);               // palya
  print(menu.first);            // rice

  // 2. Map — key→value, key uniqueness enforced.
  final phones = <String, String>{
    'Anjali': '+91-9845012345',
    'Pradeep': '+91-9000000000',
  };
  print(phones['Anjali']);      // +91-9845012345
  print(phones['Unknown']);     // null
  phones['Shreya'] = '+91-9111122222';
  print(phones.length);         // 3

  // 3. Set — unordered, deduped.
  final tags = <String>{'vip', 'vip', 'sponsor'};
  print(tags);                  // {vip, sponsor}

  // 4. Spread — splat a collection into another literal.
  final fullMenu = ['welcome drink', ...menu, 'paan'];
  print(fullMenu);              // [welcome drink, rice, ..., paan]

  // 5. Null-aware spread.
  List<String>? maybeAddons;
  final menuWithAddons = [...menu, ...?maybeAddons];
  print(menuWithAddons);        // [rice, sambar, palya, payasa]

  // 6. Collection-if and collection-for.
  const showFooter = true;
  final lines = [
    'Header',
    for (final m in menu) '- \$m',
    if (showFooter) 'Footer',
  ];
  print(lines.join('\\n'));

  // 7. .where + .map + .toList chain — note the .toList() at the end.
  final longUpper = menu
      .where((m) => m.length > 4)
      .map((m) => m.toUpperCase())
      .toList();
  print(longUpper);             // [SAMBAR, PALYA, PAYASA]

  // 8. Map iteration with .entries.
  for (final e in phones.entries) {
    print('\${e.key}: \${e.value}');
  }
}`,
              pitfalls: [
                '**Forgetting `.toList()` after `.map`.** `.map` returns a lazy `Iterable`; passing it to `ListView.builder` or printing it gives `(MapIterable)`-style output. Fix: append `.toList()`.',
                '**Mistaking `{}` for an empty Map vs empty Set.** `{}` defaults to `Map<dynamic, dynamic>` — for an empty Set write `<int>{}` or `Set<int>()`.',
                '**Using a `List` to enforce uniqueness.** Re-checking `if (!list.contains(x)) list.add(x)` is O(n²). Fix: use a `Set` from the start.',
                '**Mutating a `const` collection.** `const items = [];` then `items.add(...)` throws `Unsupported operation: Cannot add to an unmodifiable list`. Fix: drop `const` or use `List.of(constList)` to make a mutable copy.',
                '**Indexing a `Map` and treating the result as non-null.** `phones[\'Unknown\'].length` crashes — `phones[k]` always returns `V?`. Fix: `phones[k]?.length ?? 0` or `phones.containsKey(k)`.',
                '**Spreading into the wrong collection type.** Spreading a `List` into a `Map` literal is a compile error. Fix: spread `Map.fromEntries(list.map(...))` or use `addAll`.',
                '**Modifying a list while iterating it.** `for (final x in list) list.remove(x)` throws `Concurrent modification`. Fix: `list.removeWhere((x) => predicate(x))`.',
                '**Trusting `firstWhere` to return null.** It throws by default if no match. Fix: pass `orElse: () => fallback` OR use `.firstWhereOrNull` from `package:collection`.',
              ],
              tryIt: 'Build `final orders = <Map<String, dynamic>>[];` then push three orders with `add({\'customer\': \'Anjali\', \'guests\': 100}, ...)`. Compute the total guest count with `.fold`. Now extend it: filter to orders with `> 50` guests, map to a `List<String>` of customer names, and de-dup into a `Set`.',
              takeaway: 'List for order, Map for lookup, Set for uniqueness — pick the shape, not the workaround.',
            },
            {
              id: 'm0-t6',
              title: 'Sealed Classes & Pattern Matching (Dart 3)',
              explain: 'Use Dart 3 sealed classes plus `switch` expressions to model exhaustive states like `AuthSession` and `SignInResult` — the compiler proves you handled every case.',
              analogy: 'Picture the **receptionist at a Kota wedding mantapa** with a printed guest register. Every entry must fall into one of exactly **three categories**: *invited and arrived*, *invited but declined*, or *invited plus-one of someone*. The register has no fourth column — the host decided in advance there are only three possibilities. Now imagine the receptionist building the seating chart: she goes through each entry and *must* place it somewhere — if she misses *plus-ones* she will literally have nowhere to seat half a family. A **sealed class** in Dart is exactly that pre-printed register: a type with a known, finite set of subtypes the compiler can enumerate. A **`switch` expression** is the seating chart — and the compiler refuses to build it unless you handle every category. Forget one and the build fails before the wedding day, not at the venue gate.',
              theory: `**Sealed classes** (Dart 3) are types whose subclasses are restricted to the same library. The compiler can therefore see the **complete list** of subtypes and reason about exhaustiveness. You declare with \`sealed class AuthSession { ... }\` and add \`final class\`, \`base class\`, or \`interface class\` subtypes in the same file. Outside that file nobody can extend it, so the set never grows behind your back.\n\nCombined with **\`switch\` expressions** (also Dart 3 — note: *expression*, not *statement*), sealed classes give you **exhaustiveness checking**. A \`switch\` over a sealed type fails to compile if you miss a subtype — there is no \`default\` cop-out unless you actively want one. Add a new \`SignInResult\` variant and every UI \`switch\` lights up red until you handle it. This is the single best refactoring tool Dart 3 added; you will rely on it heavily in the auth, event-status, and notification flows.\n\nThe **switch expression** syntax is \`final label = switch (value) { Type1() => ..., Type2(field: var f) => ..., };\` — note the trailing comma, the \`=>\` arrows, and that the whole thing **returns a value**. Inside each pattern you can deconstruct fields with \`Type(field: var f)\` so the body has direct access to the data without casting.\n\n**Why \`final class\` for subtypes?** Dart 3 introduced class modifiers: \`final\`, \`base\`, \`interface\`, \`sealed\`, \`mixin\`. \`final class\` means *cannot be extended further* — perfect for the leaves of a sealed hierarchy. The chittoorCatering source uses \`final class SignInSuccess\`, \`final class SignInCancelled\`, etc., which signals to readers "the hierarchy stops here".\n\nThe pre-Dart-3 alternative was an \`enum\` (no per-variant data) or a hand-rolled tagged union with \`if (x is Type)\` chains and no exhaustiveness check. Both worked; neither caught the "you forgot a case" bug at compile time.`,
              diagram: `stateDiagram-v2
    [*] --> AuthSessionLoading: app boots
    AuthSessionLoading --> AuthSessionSignedOut: no Firebase user
    AuthSessionLoading --> AuthSessionSignedIn: whitelisted user found
    AuthSessionSignedOut --> AuthSessionSignedIn: signInWithGoogle ok
    AuthSessionSignedIn --> AuthSessionSignedOut: signOut OR whitelist fail
    AuthSessionSignedIn --> [*]: app closes
    note right of AuthSessionLoading
      sealed class AuthSession
      compiler enforces every
      switch covers all three
    end note`,
              flowExplain: 'Every state the auth UI ever sees is exactly one of `Loading`, `SignedOut`, or `SignedIn` — a sealed class declared in [auth_session.dart](lib/core/auth/auth_session.dart). The widget tree pattern-matches on the session and the compiler refuses to build if any branch is missing.',
              whyItMatters: 'When the source app adds a fourth auth state next year (think `AuthSessionExpired` for token-refresh failures), the compiler will instantly tell you **every UI file that needs updating**. No grep, no QA cycle, no production NullPointerException. This is the single feature most likely to come up in a Dart 3 interview question — and the single feature most likely to save you a 2 AM page in production.',
              steps: [
                'Open `dart-bootcamp/` and create `auth_session.dart`. Declare `sealed class AuthSession { const AuthSession(); }`.',
                'Add three `final class` subtypes in the same file: `AuthSessionLoading`, `AuthSessionSignedOut`, and `AuthSessionSignedIn(String email)`.',
                'In `main()`, write `AuthSession s = AuthSessionSignedIn(\'anjali@example.com\');`.',
                'Use a `switch` expression: `final label = switch (s) { AuthSessionLoading() => \'…\', AuthSessionSignedOut() => \'Sign in\', AuthSessionSignedIn(email: var e) => \'Hello \$e\' };`.',
                'Print `label` — confirm it picks the right branch.',
                'Now **delete** the `AuthSessionSignedOut()` arm and try to compile — note the error: "The type \'AuthSession\' is not exhaustively matched by the switch cases".',
                'Restore the arm. Add a fourth subtype `AuthSessionExpired` and watch the `switch` fail to compile until you add an arm for it.',
                'Run `dart analyze` — should be clean once every case is handled.',
              ],
              code: `// Verbatim from the source repo — see lib/core/auth/sign_in_result.dart
// Sealed class with four exhaustive variants.

/// Outcome returned by [AuthRepository.signInWithGoogle] so the UI can render
/// the right feedback without inspecting exceptions.
sealed class SignInResult {
  const SignInResult();
}

final class SignInSuccess extends SignInResult {
  const SignInSuccess();
}

/// User dismissed the Google account chooser.
final class SignInCancelled extends SignInResult {
  const SignInCancelled();
}

/// The Google account exists but is not on the operator whitelist.
final class SignInNotAllowed extends SignInResult {
  const SignInNotAllowed(this.email);
  final String email;
}

/// Network error, missing token, or any other unexpected failure.
final class SignInFailed extends SignInResult {
  const SignInFailed(this.message);
  final String message;
}

// ---------- usage from the LoginScreen widget ----------
// Compiler refuses to compile this switch if you forget a case.

String describe(SignInResult r) {
  return switch (r) {
    SignInSuccess() => 'Welcome back!',
    SignInCancelled() => 'Sign-in cancelled — try again when ready.',
    SignInNotAllowed(email: final e) =>
        '\$e is not on the operator whitelist. Contact the owner.',
    SignInFailed(message: final m) => 'Sign-in failed: \$m',
  };
}

void main() {
  print(describe(const SignInSuccess()));
  print(describe(const SignInNotAllowed('stranger@example.com')));
  print(describe(const SignInFailed('No internet')));
}`,
              pitfalls: [
                '**Adding a `default:` case to silence exhaustiveness.** Defeats the entire point — the compiler can no longer flag missing variants. Fix: handle each variant explicitly; reach for `default` only when the type is genuinely open-ended.',
                '**Subclassing a sealed class from another file.** Compile error: "The class can\'t be extended outside of its library." Fix: keep the hierarchy in one file (the chittoorCatering source does exactly this).',
                '**Using `switch` *statement* (with `case Type():`) instead of `switch` *expression*.** Both work; the expression form is more concise and returns a value. Prefer the expression form when each arm produces a value.',
                '**Forgetting the trailing `,` in a switch expression.** Each arm and the closing `}` use commas, not semicolons — easy to mistype.',
                '**Declaring a sealed class without `const` constructor.** All four `SignInResult` subtypes use `const` so the UI can pre-allocate them. Drop `const` only if a variant has non-final fields.',
                '**Confusing `sealed` with `abstract`.** `abstract` only blocks instantiation; subclasses can come from anywhere. `sealed` does both: cannot instantiate AND cannot extend outside the library.',
                '**Pattern destructuring with the wrong field name.** `SignInNotAllowed(email: var e)` works only if the field is literally `email`. Rename the field and every destructure breaks — fix it via the IDE rename, not search/replace.',
                '**Using `is Type` chains instead of `switch`.** Works, but loses exhaustiveness checking. Fix: rewrite as `switch (x) { Type1() => ..., Type2() => ..., }`.',
              ],
              tryIt: 'Build a sealed class `EventStatus` with three `final class` variants: `Draft`, `Confirmed(DateTime confirmedAt)`, `Completed(DateTime completedAt, double finalAmount)`. Write a `switch` expression `String label(EventStatus s) => switch (s) { ... }` returning a one-line description for each. Then add a fourth variant `Cancelled(String reason)` and watch the compiler tell you exactly where to add the new arm.',
              takeaway: 'Sealed + switch = compile-time proof you handled every state in your model.',
            },
          ],
        },
        {
          id: 'm0-s2',
          title: 'Flutter Widgets & State',
          topics: [
            {
              id: 'm0-t7',
              title: 'Everything is a Widget — Stateless vs Stateful',
              explain: 'Understand the two widget kinds: `StatelessWidget` (immutable, rebuilds when parent changes) and `StatefulWidget` (carries mutable state across rebuilds).',
              analogy: 'Walk through a **Maravante-side wedding mantapa** at noon. The **printed welcome banner**, the **stainless-steel chafing dishes**, the **brass dīpa stands** — all of these are *fixed for the day*. Once placed, they do not change. They are **`StatelessWidget`s**: their look is fully determined by the props (the printed name, the brass colour) the host gave them at setup. Now look at the **head cook stirring sambar** and the **counter showing remaining payasa servings**. These actors carry **memory between moments** — the cook remembers how much salt he already added, the counter ticks down with each ladle. They are **`StatefulWidget`s**: same widget instance, but a private internal state evolves over time. Build the wedding correctly and 90% of your decorations are stateless; the few stateful pieces are the ones that *remember*.',
              theory: `Flutter has **exactly two widget base classes** you will use day-to-day: \`StatelessWidget\` and \`StatefulWidget\`. Everything else — \`Container\`, \`Text\`, \`Padding\`, \`ElevatedButton\`, your own widgets — extends one of these two.\n\nA **\`StatelessWidget\`** is a function-of-props: its \`build(BuildContext context)\` method takes the current props (\`final\` fields on the widget) and returns a widget tree. There is no internal mutable state — when the widget needs to look different, the parent rebuilds it with new props. Use stateless for **anything you can derive purely from props**: a customer card, a styled label, a layout wrapper, a static icon row.\n\nA **\`StatefulWidget\`** is a *pair* of classes: the widget itself (immutable, just configuration) and a separate \`State<MyWidget>\` object (mutable, lives across rebuilds). You override \`createState()\` to produce the state object. Inside \`State\`, you store mutable fields (\`int _count = 0;\`), call \`setState(() { _count++; })\` to mark the widget as needing rebuild, and override \`initState()\` / \`dispose()\` for setup and teardown of resources (controllers, subscriptions, timers).\n\n**The key mental shift**: \`build()\` runs *many times*. Every \`setState\` call, every parent rebuild, every screen rotation — Flutter calls \`build()\` again. This is cheap because the widget tree is just configuration; the actual rendering layer (the **Element tree** and **RenderObject tree**) only updates the bits that changed. Treat \`build()\` as a pure function of state and props; never start network calls or timers from inside \`build()\`.\n\n**When to choose which**: default to \`StatelessWidget\`. Promote to \`StatefulWidget\` only when (a) the widget owns mutable data nobody else needs to know about (a counter, a form's draft text) OR (b) the widget needs lifecycle hooks (\`initState\`/\`dispose\`) for controllers or subscriptions. For state shared across screens (the signed-in user, the event list) you reach for **state-management** packages — \`Provider\`, \`Riverpod\`, \`Bloc\` — covered in later modules.`,
              diagram: `flowchart TD
    subgraph Stateless["StatelessWidget"]
        SLW["class CustomerCard extends StatelessWidget"]
        SLB["build(context) — pure function of props"]
        SLP["final String name, phone (props only)"]
        SLW --> SLB
        SLW --> SLP
    end
    subgraph Stateful["StatefulWidget"]
        SFW["class CounterPage extends StatefulWidget"]
        SFC["createState() => _CounterPageState()"]
        SFS["class _CounterPageState extends State<CounterPage>"]
        SFI["initState() — controllers, subscriptions"]
        SFB["build(context) — uses _count + props"]
        SFD["dispose() — cancel subs, dispose controllers"]
        SFSet["setState(() => _count++)"]
        SFW --> SFC --> SFS
        SFS --> SFI --> SFB --> SFD
        SFB -.user tap.-> SFSet -.triggers.-> SFB
    end`,
              flowExplain: 'A `StatelessWidget` is one class with one `build`. A `StatefulWidget` is two classes: the widget (config) and the `State` (mutable, with `initState`/`build`/`dispose` lifecycle). `setState` schedules a rebuild that calls `build` again with the updated state.',
              whyItMatters: 'Every Flutter screen you ever build is a tree of these two kinds. Default to stateless wrong way and you will write 200 unnecessary `setState` calls per screen, fighting the framework. Default the other direction and you will leak controllers, leak subscriptions, and have UIs that drop state on every rotation. The stateless-vs-stateful decision is the **single most-asked Flutter interview question after "what is a widget"** — and the most common cause of jank in first-quarter Flutter projects.',
              steps: [
                'Create a fresh app: `flutter create widget_basics && cd widget_basics`. Open `lib/main.dart`.',
                'Replace the body with a `StatelessWidget` called `CustomerCard` that takes `final String name` and `final String phone` and returns `Card(child: ListTile(title: Text(name), subtitle: Text(phone)))`.',
                'In `MyApp`, render three `CustomerCard`s in a `Column`. Run with `flutter run`. Note: no setState anywhere; the cards are pure props.',
                'Now add a `StatefulWidget` called `CounterPage`. Inside its `_CounterPageState`, declare `int _count = 0;` and a `_increment` method that calls `setState(() => _count++);`.',
                'Render a `Column` with `Text(\'Count: \$_count\')` and an `ElevatedButton(onPressed: _increment, child: Text(\'+\'))`.',
                'Tap the button — note the count updates. Comment out `setState` (just call `_count++` directly) and observe: the value increments in memory but the UI does NOT update. **That is the whole point of `setState`**.',
                'Override `initState()` to `print(\'init\')` and `dispose()` to `print(\'dispose\')`. Push and pop the page; watch the lifecycle log.',
                'Run `flutter analyze` — should be clean.',
              ],
              code: `// lib/main.dart — both widget kinds in one file.
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

// ---------- 1. Pure StatelessWidget — function of props ----------
class CustomerCard extends StatelessWidget {
  const CustomerCard({super.key, required this.name, required this.phone});

  final String name;
  final String phone;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.person_outline),
        title: Text(name),
        subtitle: Text(phone),
      ),
    );
  }
}

// ---------- 2. StatefulWidget — owns mutable _count ----------
class CounterPage extends StatefulWidget {
  const CounterPage({super.key});

  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _count = 0;

  @override
  void initState() {
    super.initState();
    debugPrint('CounterPage: init');
  }

  @override
  void dispose() {
    debugPrint('CounterPage: dispose');
    super.dispose();
  }

  void _increment() => setState(() => _count++);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Counter')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Count: \$_count', style: const TextStyle(fontSize: 24)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _increment, child: const Text('+1')),
          ],
        ),
      ),
    );
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Widget basics')),
        body: ListView(
          children: const [
            CustomerCard(name: 'Anjali', phone: '+91-9845012345'),
            CustomerCard(name: 'Pradeep', phone: '+91-9000000000'),
            CustomerCard(name: 'Shreya', phone: '+91-9111122222'),
          ],
        ),
        floatingActionButton: FloatingActionButton(
          child: const Icon(Icons.add),
          onPressed: () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const CounterPage()),
          ),
        ),
      ),
    );
  }
}`,
              pitfalls: [
                '**Mutating a field without `setState`.** UI does not refresh because Flutter does not know the widget is dirty. Fix: every mutation that affects what `build` returns must be inside `setState(() { ... })`.',
                '**Calling `setState` after `dispose`.** Throws "setState() called after dispose()". Common cause: an async callback that resolves after the user popped the page. Fix: guard with `if (!mounted) return;` before the `setState`.',
                '**Initializing controllers in `build` instead of `initState`.** Build runs many times; you would create a new controller every rebuild and leak the previous ones. Fix: create in `initState`, dispose in `dispose`.',
                '**Using a `StatefulWidget` for data shared across screens.** State is lost when the page pops. Fix: lift state to a parent or use a state-management package (`Provider`, `Riverpod`).',
                '**Forgetting `super.initState()` and `super.dispose()`.** Subtle lifecycle bugs (animations not registered, controllers not cleaned). Fix: always call super first in `initState`, last in `dispose`.',
                '**Doing async work in `build`.** Triggers a re-fetch on every rebuild. Fix: trigger from `initState` or from a button callback; wrap with a `FutureBuilder`/`StreamBuilder` for the UI side.',
                '**Not adding `const` to `StatelessWidget` constructors.** Each instantiation allocates a new object. Fix: add `const` to the constructor and use `const CustomerCard(...)` at call sites — Flutter canonicalises identical const widgets.',
                '**Treating `BuildContext` as a long-lived reference.** Storing `context` in a field and using it after the widget is gone causes "Looking up a deactivated widget\'s ancestor". Fix: only use `context` inside the `build` or callback that received it.',
              ],
              tryIt: 'Build `EventTile` as a `StatelessWidget` with `final String title, hall; final int guestCount;` rendering a `ListTile`. Then build a `BookingCounter` `StatefulWidget` that shows "Bookings today: N" and increments on a button tap. Drop both into the same screen. **Now extend it**: add a `bool _expanded` state to `EventTile` (so it must become stateful) that toggles a hidden notes section on tap. Notice how the conversion forces a `createState` and a separate `_EventTileState` class.',
              takeaway: 'Default to `StatelessWidget`; reach for `StatefulWidget` only when the widget owns mutable state.',
            },
            {
              id: 'm0-t8',
              title: 'MaterialApp, Scaffold, AppBar & FAB',
              explain: 'Wire the top-level `MaterialApp`, drop a `Scaffold` per screen, and add an `AppBar` plus `FloatingActionButton` — the standard Material skeleton every Flutter screen sits on.',
              analogy: 'A **Kundapura kalyana mantapa** has a fixed structural pattern. The **outer compound wall + signboard + colour scheme** is the *one-and-only* mantapa branding — it wraps the whole property. Inside, **each function room** (the wedding hall, the dining hall, the side bedroom for the bride) has the **same skeleton**: a *roof* (top banner), a *raised dais* (main area), and a *bell* near the entrance the priest rings to call attention. **`MaterialApp` is the compound wall + signboard** — set it once at the very top, never twice. **`Scaffold` is the per-room skeleton** — every screen in your app gets its own. **`AppBar` is the roof banner**, **the body is the dais**, and **`FloatingActionButton` is the priest\'s bell** — always there, always reachable, always says "do the main action here". Once you have built three Scaffolds you have built three hundred — the pattern never changes.',
              theory: `**\`MaterialApp\`** is the Material-Design root widget. It owns app-wide concerns: the **theme** (colours, typography), the **navigator** (page stack), the **localization** (translations + locale), the **routes** (named navigation), and the **directionality** (LTR vs RTL). You instantiate it **exactly once** at the very top of your widget tree, typically inside the \`build\` of your root \`StatelessWidget\` that \`runApp(...)\` mounts.\n\n**\`Scaffold\`** is the per-screen skeleton. It provides slots — \`appBar\`, \`body\`, \`floatingActionButton\`, \`bottomNavigationBar\`, \`drawer\`, \`endDrawer\`, \`bottomSheet\`, \`snackBar\` — and arranges them according to Material guidelines. You drop **one \`Scaffold\` per screen**; nesting Scaffolds is allowed but rare (mostly for nested navigators with their own app bars). The chittoorCatering app has roughly 12 screens → 12 Scaffolds.\n\n**\`AppBar\`** is the top bar widget that lives in the Scaffold\'s \`appBar\` slot. It has \`title\`, \`leading\` (back button or hamburger), \`actions\` (right-aligned icons like search, more-menu), \`bottom\` (a \`TabBar\` or \`PreferredSize\` widget), and gets its colours from the \`Theme\` automatically. Override locally when you need (e.g. a transparent app bar over a hero image).\n\n**\`FloatingActionButton\`** (FAB) is the round elevated button anchored to the bottom-right by default. Material guidelines say a screen should have **at most one** primary action and the FAB is where it lives — *create event*, *new customer*, *book hall*. Reach for \`FloatingActionButton.extended\` when the action needs a label alongside the icon. Place it in the Scaffold\'s \`floatingActionButton\` slot, NOT inside the body — the slot handles the keyboard avoidance and SnackBar offset.\n\n**\`SnackBar\`** is summoned via \`ScaffoldMessenger.of(context).showSnackBar(...)\` — note the *Messenger*, not the Scaffold itself, so it survives navigation. Always prefer \`ScaffoldMessenger\` over the deprecated \`Scaffold.of(context).showSnackBar\`.`,
              diagram: `flowchart TD
    Run["runApp(MyApp)"] --> MA["MaterialApp<br/>theme, routes, navigator"]
    MA --> S1["Scaffold (Login screen)"]
    MA --> S2["Scaffold (Dashboard screen)"]
    MA --> S3["Scaffold (Event detail screen)"]
    S2 --> AB["AppBar<br/>title + actions"]
    S2 --> Body["body<br/>main scrollable content"]
    S2 --> FAB["FloatingActionButton<br/>primary action"]
    S2 --> Drawer["drawer (optional)"]
    S2 --> SM["ScaffoldMessenger<br/>SnackBars"]`,
              flowExplain: 'One `MaterialApp` at the root supplies theme + navigation. Each screen is a `Scaffold` with named slots — `appBar`, `body`, `floatingActionButton`, `drawer` — that the framework lays out per Material rules. `ScaffoldMessenger` lives one level above each Scaffold so SnackBars survive page transitions.',
              whyItMatters: 'Every Flutter app you ever build follows this exact `MaterialApp → Scaffold(appBar, body, FAB)` recipe — there is **no second pattern**. Memorise the slot names today (`appBar`, `body`, `floatingActionButton`, `bottomNavigationBar`, `drawer`) and you can sketch a new screen on a whiteboard in 10 seconds during an interview, then translate it to code in 60. The chittoorCatering app you will build has 12 screens and uses this skeleton 12 times — the consistency is the point, not a limitation.',
              steps: [
                'In `lib/main.dart`, set `void main() => runApp(const MyApp());`.',
                'Build `MyApp` as a `StatelessWidget` whose `build` returns `MaterialApp(title: \'Chittoor Catering\', theme: ThemeData(colorSchemeSeed: const Color(0xFFE85A2A)), home: const DashboardScreen())`.',
                'Build `DashboardScreen` as a `StatelessWidget` returning `Scaffold(appBar: AppBar(title: const Text(\'Today\\\'s events\')), body: const _EventList(), floatingActionButton: ...)`.',
                'Add `actions: [IconButton(icon: const Icon(Icons.search), onPressed: () { ... })]` to the `AppBar`.',
                'Add a `FloatingActionButton.extended(icon: const Icon(Icons.add), label: const Text(\'New event\'), onPressed: () { ... })`.',
                'On the FAB tap, push a new `EventCreateScreen` (its own Scaffold) using `Navigator.of(context).push(MaterialPageRoute(builder: (_) => const EventCreateScreen()))`.',
                'Show a SnackBar after a successful create: `ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text(\'Event created\')))`.',
                'Run `flutter run`, navigate, hit the back arrow, confirm the AppBar back button auto-appears on the pushed route.',
              ],
              code: `// lib/main.dart — the canonical Material skeleton.
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Chittoor Catering',
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFFE85A2A),  // brand orange
        useMaterial3: true,
      ),
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Today's events"),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {/* push search screen */},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {/* show menu */},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: const [
          ListTile(title: Text('Rao wedding'), subtitle: Text('Hall 1 — 250 guests')),
          ListTile(title: Text('Shetty engagement'), subtitle: Text('Hall 2 — 80 guests')),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        icon: const Icon(Icons.add),
        label: const Text('New event'),
        onPressed: () async {
          await Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const EventCreateScreen()),
          );
          if (!context.mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Returned from event create')),
          );
        },
      ),
    );
  }
}

class EventCreateScreen extends StatelessWidget {
  const EventCreateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New event')),  // back button auto-added
      body: const Center(child: Text('Form goes here')),
    );
  }
}`,
              pitfalls: [
                '**Two `MaterialApp`s in the tree.** Theme/navigation conflict — random crashes and lost routes. Fix: exactly one `MaterialApp`, near the root.',
                '**Nesting Scaffolds for "convenience".** Tab bars, snack bars, and FAB positioning all break in subtle ways. Fix: one Scaffold per screen; use `Padding`/`Column` inside the body for layout.',
                '**Putting the FAB inside the body.** It scrolls with content, gets covered by the keyboard, and SnackBars overlap it. Fix: use the Scaffold\'s `floatingActionButton` slot.',
                '**Calling `Scaffold.of(context).showSnackBar`.** Deprecated and breaks across navigation. Fix: `ScaffoldMessenger.of(context).showSnackBar(...)`.',
                '**Reading `context` after an `await`.** The widget may have unmounted during the wait. Fix: `if (!context.mounted) return;` before using `context` post-await.',
                '**Forgetting `useMaterial3: true`.** Defaults to Material 2 styling — looks dated next to current Android. Fix: enable Material 3 in `ThemeData`.',
                '**Hard-coding the brand colour in every widget.** Theme changes become find-and-replace nightmares. Fix: set `colorSchemeSeed` once on `ThemeData`; read via `Theme.of(context).colorScheme.primary` (covered in m0-t11).',
                '**Pushing routes without `MaterialPageRoute`.** Loses Material transitions and back-gesture support. Fix: always wrap with `MaterialPageRoute(builder: (_) => Page())`.',
              ],
              tryIt: 'Build a 3-screen mini app: `LoginScreen` → `HomeScreen` (with FAB) → `ProfileScreen`. Each screen is its own Scaffold. The FAB on Home pushes Profile. The Profile AppBar has an `Icons.logout` action that pops back to Login (use `Navigator.of(context).popUntil((r) => r.isFirst);`). Show a SnackBar after logout. **Now extend it** by adding a `Drawer` to the Home Scaffold with three `ListTile` entries.',
              takeaway: 'One `MaterialApp` at the root; one `Scaffold` per screen; everything else is just children.',
            },
            {
              id: 'm0-t9',
              title: 'Layout: Column, Row, Expanded, Flexible & Padding',
              explain: 'Compose UI with `Column`, `Row`, and the `Expanded`/`Flexible`/`Padding`/`SizedBox` quartet — the layout primitives every screen leans on.',
              analogy: 'Picture a **South Indian banana-leaf meal** in a Kundapura wedding. The leaf has a **fixed length** (the screen width) and the cook must arrange items along it. Down the *centre*, top to bottom: rice → sambar → rasam → curd. That is a **`Column`**: items stacked vertically in order. Across the *top edge*, side by side: pickle, salt, kosambari, payasa. That is a **`Row`**: items laid horizontally. The cook gives the **rice the biggest share** of the leaf and lets sambar take whatever is left — that is **`Expanded`**: "you take all the remaining width." A small **gap of empty leaf** between items so they do not run together — that is **`SizedBox`** or **`Padding`**. Every Flutter screen is an arrangement of Columns and Rows, with Expanded telling the framework who is greedy and who is content with the leftovers.',
              theory: `**\`Column\`** stacks children vertically (top to bottom by default). **\`Row\`** lays children horizontally (left to right). Both take a \`children: List<Widget>\` and two crucial alignment knobs: **\`mainAxisAlignment\`** (along the layout direction — vertical for Column, horizontal for Row) and **\`crossAxisAlignment\`** (perpendicular). Defaults are \`MainAxisAlignment.start\` and \`CrossAxisAlignment.center\`.\n\n**\`mainAxisSize\`** controls whether the Column/Row hugs its children (\`MainAxisSize.min\`) or expands to fill the parent (\`MainAxisSize.max\`, the default). Inside a constrained parent — a Card, a ListTile, a bottom sheet — \`MainAxisSize.min\` is almost always what you want; in an unconstrained parent (a Scaffold body), \`max\` lets you align with \`mainAxisAlignment\` properly.\n\n**\`Expanded\`** wraps a child of a Row/Column and tells it to grab the remaining space. Multiple \`Expanded\` children share the leftover space proportionally via the \`flex\` parameter (default 1). \`Expanded(flex: 2, ...)\` next to \`Expanded(flex: 1, ...)\` produces a 2:1 split. **\`Flexible\`** is the softer cousin: child can be smaller than its share if it wants to be. Reach for \`Flexible\` for text that should wrap; reach for \`Expanded\` for fillers, dividers, and equally-sized columns.\n\n**\`Padding\`** wraps a child with empty space (\`EdgeInsets.all(8)\`, \`EdgeInsets.symmetric(horizontal: 12)\`, \`EdgeInsets.only(top: 4)\`). **\`SizedBox\`** is the Flutter idiom for a fixed-dimension gap — \`SizedBox(height: 16)\` between two stacked widgets is the standard "vertical spacer". Both are preferable to wrapping things in \`Container\`s with explicit sizes.\n\nThe **constraint-passing model**: every layout in Flutter is "**parent passes down constraints, child picks a size, parent positions the child**". A Row with three \`Expanded\` kids reads "I have 360px wide, three equal flexes, so each kid gets 120px." This top-down constraint flow is fast and predictable — and the source of the famous "**RenderFlex overflowed by N pixels**" yellow-and-black warning when the children ask for more than the parent offers.`,
              diagram: `flowchart TB
    subgraph Screen["Scaffold body — width=360"]
        Col["Column<br/>mainAxisSize: max"]
        Col --> P1["Padding(EdgeInsets.all(12))"]
        Col --> R1["Row<br/>crossAxis: center"]
        R1 --> Avatar["CircleAvatar<br/>(48 px)"]
        R1 --> SB["SizedBox(width: 12)"]
        R1 --> Exp1["Expanded(flex: 2)<br/>Text(name)"]
        R1 --> Exp2["Expanded(flex: 1)<br/>Text(phone)"]
        Col --> SB2["SizedBox(height: 16)"]
        Col --> Notes["Text(notes, maxLines: 3)"]
    end`,
              flowExplain: 'A `Column` stacks the row of (avatar + name + phone) above a vertical gap above the notes. Inside the row, the avatar takes its intrinsic 48 px; the two `Expanded`s share the remaining width 2:1. `Padding` and `SizedBox` are the standard breathing-space tools.',
              whyItMatters: '90% of the layout debugging you will do as a Flutter dev is a `Column`/`Row`/`Expanded` problem — usually a missing `Expanded` or a wrong `mainAxisSize`. The famous **"RenderFlex overflowed"** error has one of three fixes (wrap a child in `Expanded`, change `mainAxisSize`, or add a `SingleChildScrollView`); knowing them cold separates seniors from juniors. Beyond bug fixing, fluent layout composition is the difference between sketching a screen on paper and shipping it in 30 minutes vs spending an afternoon nudging widgets.',
              steps: [
                'Build a `CustomerListTile` `StatelessWidget` taking `final String name, phone, notes`.',
                'Inside `build`, return a `Padding(padding: EdgeInsets.all(12), child: ...)`.',
                'The child is a `Column(crossAxisAlignment: CrossAxisAlignment.start, children: [...])`.',
                'Top of the Column: a `Row(crossAxisAlignment: CrossAxisAlignment.center, children: [CircleAvatar(child: Text(name[0])), const SizedBox(width: 12), Expanded(child: Text(name)), Text(phone)])`.',
                'Wrap the *name* `Text` in `Expanded` so a long name does not push the phone off-screen.',
                'Below the row, add `const SizedBox(height: 8)` then a `Text(notes, maxLines: 3, overflow: TextOverflow.ellipsis)`.',
                'Drop several into a `ListView` and run. Try a name long enough to overflow and confirm it ellipsises instead of pushing the phone.',
                'Remove the `Expanded` and watch the **yellow-and-black overflow warning** appear in the bottom of the row — fix it by re-adding `Expanded`.',
              ],
              code: `// lib/widgets/customer_list_tile.dart
import 'package:flutter/material.dart';

class CustomerListTile extends StatelessWidget {
  const CustomerListTile({
    super.key,
    required this.name,
    required this.phone,
    this.notes,
  });

  final String name;
  final String phone;
  final String? notes;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 22,
                child: Text(name.isEmpty ? '?' : name[0].toUpperCase()),
              ),
              const SizedBox(width: 12),
              // Name takes 2x the leftover; phone takes 1x.
              Expanded(
                flex: 2,
                child: Text(
                  name,
                  style: Theme.of(context).textTheme.titleMedium,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  phone,
                  style: Theme.of(context).textTheme.bodySmall,
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
          if (notes != null) ...[
            const SizedBox(height: 8),
            Text(
              notes!,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade700,
                  ),
            ),
          ],
        ],
      ),
    );
  }
}`,
              pitfalls: [
                '**RenderFlex overflowed by N pixels (yellow stripe).** A child asked for more space than the Row/Column offers. Fix: wrap the offending child in `Expanded` or `Flexible`, or reduce its content (`maxLines`, `overflow: ellipsis`).',
                '**`Column` inside an unbounded vertical parent.** Crashes with "Vertical viewport was given unbounded height." Fix: wrap the parent in a fixed-size container OR use a `ListView` instead.',
                '**Multiple `Expanded` inside a `SingleChildScrollView`.** Same "unbounded constraints" crash — `Expanded` needs a bounded parent. Fix: use `IntrinsicHeight` or remove `Expanded` and give the children fixed sizes.',
                '**Wrapping every `Text` in `Container` with explicit sizes.** Bloats the tree and breaks responsive layouts. Fix: lean on `Padding` + `SizedBox`; only use `Container` when you actually need decoration.',
                '**Defaulting to `mainAxisSize: max` in a `Card`.** The Column eats the whole card height even with one child. Fix: set `mainAxisSize: MainAxisSize.min` inside cards, list tiles, and bottom sheets.',
                '**Confusing `mainAxisAlignment` with `crossAxisAlignment`.** For a `Column`, main is vertical, cross is horizontal — easy to swap mentally. Fix: read main = "the direction this thing flows".',
                '**Forgetting `crossAxisAlignment: stretch` for full-width buttons in a Column.** Buttons stay their intrinsic width. Fix: set `crossAxisAlignment: CrossAxisAlignment.stretch` OR wrap the button in `SizedBox(width: double.infinity, child: ElevatedButton(...))`.',
                '**Using `Padding(padding: EdgeInsets.all(0))`.** Pointless allocation. Fix: just remove the Padding wrapper.',
              ],
              tryIt: 'Build a `EventSummaryCard` widget: top row has a hall name (Expanded) and a date chip on the right. Below, a row with three equally-spaced `Expanded` columns: guest count, plate price, total. At the bottom, a notes line that ellipsises after 2 lines. Use `Padding(EdgeInsets.all(12))` outside and `SizedBox(height: 8)` between rows. **Now extend it**: make the date chip pop out by adding a `Container(decoration: BoxDecoration(color: ..., borderRadius: ...))` around it.',
              takeaway: 'Column and Row first; reach for `Expanded` only when you need to share remaining space.',
            },
            {
              id: 'm0-t10',
              title: 'Lists: ListView.builder & Scroll Physics',
              explain: 'Render long, dynamic lists with `ListView.builder`, add separators with `ListView.separated`, and tune scroll behaviour with `physics`.',
              analogy: 'Picture two ways the **Kundapura caterer feeds 800 wedding guests**. The lazy way: he orders **800 plates of food in advance**, stacks them all on the counter, and waits — most go cold before anyone picks them up, half the kitchen is occupied with dishes nobody will touch in the next five minutes. The smart way: he keeps **15 plates ready at a time** — exactly what fits on the counter the guests are looking at — and the moment a plate is taken, the kitchen makes one more. The guest never notices, the kitchen is never overwhelmed, and at the end of the night nothing is wasted. The first approach is **`Column(children: events.map((e) => Tile(e)).toList())`** — Flutter builds every tile up-front, even the 750 you cannot see, and your scroll stutters on a low-end phone. The smart approach is **`ListView.builder(itemCount: events.length, itemBuilder: (ctx, i) => Tile(events[i]))`** — Flutter builds tiles on demand as you scroll, recycles them when they leave the screen, and stays buttery on every phone the owner might own.',
              theory: `**\`ListView\`** has four constructors and the choice matters. \`ListView(children: [...])\` is the **eager** form — every child is built up-front, even off-screen ones. Fine for short, fixed lists (≤ 20 items). \`ListView.builder(itemCount: N, itemBuilder: ...)\` is the **lazy** form — children are built only as they scroll into view and recycled when they scroll out. **Always use \`builder\` for dynamic or large lists.** \`ListView.separated(itemCount, itemBuilder, separatorBuilder)\` adds a divider widget between every pair of items. \`ListView.custom\` is the escape hatch with a \`SliverChildDelegate\` for advanced cases.\n\n**Lazy rendering** works by way of a viewport: Flutter measures the visible portion of the list, asks the \`itemBuilder\` for the items that intersect, and caches a small overscroll window so quick swipes feel instant. Tiles that scroll off the screen are **disposed and recycled** — which means a \`StatefulWidget\` tile loses its in-memory state when it leaves the screen unless you give it a stable \`Key\` (\`ValueKey(item.id)\`). For pure stateless tiles this does not matter.\n\n**\`physics\`** controls the bounce, snap, and clamp behaviour. \`AlwaysScrollableScrollPhysics()\` lets the list scroll even when content fits entirely (useful with \`RefreshIndicator\` so the user can always pull). \`NeverScrollableScrollPhysics()\` disables scrolling — required when you nest a \`ListView.builder\` inside another scroller (set \`shrinkWrap: true\` too). \`ClampingScrollPhysics()\` is Android default (no overscroll glow needed); \`BouncingScrollPhysics()\` is iOS rubber-band.\n\n**\`shrinkWrap: true\`** tells the list to size itself to its content instead of grabbing all available height. It is necessary inside \`Column\`s and bottom sheets but **expensive** — every layout pass measures every item. Avoid for long lists; prefer \`SliverList\` inside a \`CustomScrollView\` if you need composite scrolling.\n\n**\`RefreshIndicator\`** wraps a scrollable and gives you the standard pull-to-refresh gesture. \`onRefresh\` returns a \`Future\` and the spinner stays until that future completes. Pair with \`AlwaysScrollableScrollPhysics\` so the gesture works on short lists.`,
              diagram: `flowchart LR
    Data["List<Event> events<br/>(800 items)"] --> LV["ListView.builder<br/>itemCount: 800<br/>itemBuilder: (ctx, i)"]
    LV --> Visible["Viewport (≈15 visible tiles)"]
    LV -.lazy build.-> Build["Tile(events[i])<br/>only when on-screen"]
    Visible -.scroll up.-> Recycle["Off-screen tiles<br/>disposed & recycled"]
    Recycle --> Build
    LV --> Sep["ListView.separated<br/>+ separatorBuilder"]
    LV --> Phys["physics:<br/>Always / Never / Bouncing"]`,
              flowExplain: 'A 800-item list does NOT build 800 tiles. The viewport asks for the ~15 currently visible, and the builder runs only for those. Scroll → off-screen tiles are recycled, on-screen ones are built. This is what makes Flutter lists fast on cheap phones.',
              whyItMatters: 'The owner of the chittoorCatering app might have **3 years of past events** by year three — that is 1,000+ rows in the History screen. The difference between `ListView(children: events.map(...))` and `ListView.builder(...)` is the difference between a 4-second freeze on launch and an instant scrollable list on the same Redmi 9. This single decision (made in two seconds at the keyboard) is what separates a Flutter app that feels native from one that feels like a Cordova webview.',
              steps: [
                'In a Scaffold body, replace `Column(children: events.map((e) => EventTile(e)).toList())` with `ListView.builder(itemCount: events.length, itemBuilder: (ctx, i) => EventTile(events[i]))`.',
                'Add separators: switch to `ListView.separated(itemCount: ..., itemBuilder: ..., separatorBuilder: (_, __) => const Divider(height: 1))`.',
                'Wrap in a `RefreshIndicator(onRefresh: _reload, child: ListView.builder(physics: const AlwaysScrollableScrollPhysics(), ...))` so pull-to-refresh works even when the list is short.',
                'For nested scrollers (e.g. a list inside a bottom sheet), pass `shrinkWrap: true, physics: NeverScrollableScrollPhysics()` and let the parent handle scrolling.',
                'Add a stable key: `EventTile(key: ValueKey(events[i].id), event: events[i])` so animations and stateful tiles survive reordering.',
                'Test with a list of 1,000 fake events: `final events = List.generate(1000, (i) => Event(...));`. Confirm scroll is smooth on a debug build.',
                'Profile with Flutter DevTools → **Performance** tab: each scroll frame should stay under 16 ms (60 fps).',
                'Switch the same screen to `ListView(children: ...)` and feel the difference on a low-end emulator.',
              ],
              code: `// lib/screens/event_history_screen.dart
import 'package:flutter/material.dart';
import 'event.dart';

class EventHistoryScreen extends StatefulWidget {
  const EventHistoryScreen({super.key});

  @override
  State<EventHistoryScreen> createState() => _EventHistoryScreenState();
}

class _EventHistoryScreenState extends State<EventHistoryScreen> {
  late List<Event> _events;

  @override
  void initState() {
    super.initState();
    _events = _seed();
  }

  Future<void> _reload() async {
    await Future.delayed(const Duration(milliseconds: 600));
    setState(() => _events = _seed());
  }

  List<Event> _seed() => List.generate(
        500,
        (i) => Event(
          id: 'evt-\$i',
          title: 'Event #\$i',
          hall: i.isEven ? 'Hall 1' : 'Hall 2',
          guests: 50 + (i % 200),
        ),
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('History')),
      body: RefreshIndicator(
        onRefresh: _reload,
        child: ListView.separated(
          // Always-scrollable so RefreshIndicator works on short lists.
          physics: const AlwaysScrollableScrollPhysics(),
          itemCount: _events.length,
          separatorBuilder: (_, __) => const Divider(height: 1),
          itemBuilder: (context, i) {
            final e = _events[i];
            return ListTile(
              key: ValueKey(e.id),                    // stable identity
              title: Text(e.title),
              subtitle: Text('\${e.hall} — \${e.guests} guests'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {/* push detail */},
            );
          },
        ),
      ),
    );
  }
}

class Event {
  const Event({required this.id, required this.title, required this.hall, required this.guests});
  final String id;
  final String title;
  final String hall;
  final int guests;
}`,
              pitfalls: [
                '**`Column(children: items.map(...).toList())` for dynamic lists.** Builds every tile up-front; janks badly past 50 items. Fix: switch to `ListView.builder`.',
                '**Forgetting a stable `Key` on stateful tiles.** Reordering or deletion makes tiles inherit each other\'s state. Fix: `key: ValueKey(item.id)`.',
                '**Nesting a `ListView.builder` inside a `Column` without `shrinkWrap`.** Crash: "Vertical viewport was given unbounded height." Fix: `shrinkWrap: true, physics: NeverScrollableScrollPhysics()`.',
                '**Using `shrinkWrap: true` for long lists.** Forces a full layout pass on every scroll — defeats the laziness. Fix: refactor to a `CustomScrollView` with a `SliverList`.',
                '**`RefreshIndicator` not triggering on a short list.** Without `AlwaysScrollableScrollPhysics()` the gesture is ignored. Fix: pass that physics explicitly.',
                '**Side effects in `itemBuilder`.** `itemBuilder` runs many times, sometimes off-screen for cache. Side-effect calls (analytics, network) duplicate. Fix: trigger from `onTap` or `initState`, not from inside the builder.',
                '**Stateful tiles losing state on scroll.** Tiles are recycled when they leave the viewport. Fix: lift the state to a parent `Map<id, value>` keyed by item id.',
                '**Reading `events[i]` after a reload that shrunk the list.** Index out of bounds. Fix: read from a single source of truth in `build`, never cache indices across rebuilds.',
              ],
              tryIt: 'Build a `CustomerListScreen` that takes `final List<Customer> customers`. Use `ListView.separated` with a `Divider` between tiles. Add a `RefreshIndicator` that calls a fake `Future.delayed(Duration(seconds: 1))` and rebuilds. Each tile shows name + phone with `onTap` printing the customer id. **Now extend it**: add a `TextField` at the top that filters the list as the user types, and confirm the filtered list re-uses the same `ListView.builder` (just with a smaller `itemCount`).',
              takeaway: 'Always use `ListView.builder` for dynamic data — never a `Column` of mapped widgets.',
            },
            {
              id: 'm0-t11',
              title: 'Theming: ThemeData, ColorScheme & Theme.of(context)',
              explain: 'Define the app-wide look with `ThemeData`/`ColorScheme`, then read tokens via `Theme.of(context)` so widgets stay theme-aware and dark-mode-ready.',
              analogy: 'Picture **Suresh\'s catering brand** rolling out across the wedding circuit. Every piece of kit — staff uniforms, banana-leaf packets, cash receipts, the van itself — wears the **same orange branding**. He decided the brand colour ONCE (PMS 165, the same #E85A2A you see on the launcher icon) and printed every uniform from that single swatch. The day he switches to a deeper coral for the rebrand, he changes the *one master swatch* at the printer and the next batch of every item — uniforms, packets, receipts, van decals — comes out in the new colour. Nobody hunts through 40 individual fabric orders to update the colour. **`ThemeData` is that master swatch**, **`ColorScheme` is the printer\'s reference card**, and **`Theme.of(context)` is each tailor reading the swatch when stitching a new uniform**. Hard-code the brand colour in 40 widgets and your future-self will hate the day she has to rebrand.',
              theory: `**\`ThemeData\`** is the per-app appearance bundle Flutter passes down through the widget tree. It collects \`colorScheme\` (semantic colour roles like \`primary\`, \`onPrimary\`, \`surface\`, \`error\`), **\`textTheme\`** (typography sizes from \`displayLarge\` down to \`labelSmall\`), **\`appBarTheme\`**, **\`cardTheme\`**, **\`elevatedButtonTheme\`**, **\`inputDecorationTheme\`**, and many more. You construct it once in \`MaterialApp(theme: ...)\` and every widget below reads it via inherited-widget propagation.\n\n**\`ColorScheme.fromSeed(seedColor: Color(0xFFE85A2A))\`** is the Material 3 pattern: you give Flutter a single brand colour, and it derives a full set of harmonious colour roles (primary, secondary, tertiary, surface, surfaceTint, error, onPrimary, onSurface, etc.) for both light and dark modes. The chittoorCatering brand orange is the seed; every Card surface, AppBar background, FAB, and chip then matches automatically.\n\n**\`Theme.of(context)\`** is how widgets read the current theme. \`Theme.of(context).colorScheme.primary\` returns the brand orange in light mode and the matching primary in dark mode without you writing a single conditional. Same for typography: \`Theme.of(context).textTheme.titleMedium\`. **Never hard-code a brand colour or a font size in a widget**; always go through the theme. If you need a context-free read for an assert or a print, use \`ThemeData()\` defaults.\n\n**Light + dark themes** are two \`ThemeData\` objects passed to \`MaterialApp(theme: ..., darkTheme: ..., themeMode: ThemeMode.system)\`. \`ThemeMode.system\` follows the device setting; \`.light\` and \`.dark\` force one. Build both with the same \`seedColor\` for instant cross-mode consistency.\n\n**\`Theme(data: ..., child: ...)\`** lets you locally override the theme for a subtree — useful for "this card uses the destructive red button style" without polluting the global theme. Reach for it sparingly; per-widget styling overrides are usually clearer.\n\n**\`useMaterial3: true\`** opts into the Material 3 visual language (rounded corners, larger touch targets, surface-tint elevation). Default in new Flutter projects since 3.16; explicitly set anyway so the choice is visible in code.`,
              diagram: `flowchart TD
    Seed["Color(0xFFE85A2A)<br/>brand orange"] --> CS["ColorScheme.fromSeed"]
    CS --> Light["light: ThemeData<br/>(useMaterial3: true)"]
    CS --> Dark["dark: ThemeData<br/>(brightness: dark)"]
    Light --> MA["MaterialApp<br/>theme + darkTheme + themeMode"]
    Dark --> MA
    MA --> Tree["Widget tree"]
    Tree --> R1["Theme.of(context).colorScheme.primary"]
    Tree --> R2["Theme.of(context).textTheme.titleMedium"]
    Tree --> R3["Theme.of(context).appBarTheme.backgroundColor"]
    Mode["Device dark-mode toggle"] -.flips.-> MA`,
              flowExplain: 'One brand colour seeds two `ThemeData` objects (light + dark). `MaterialApp` plumbs them down; widgets read tokens via `Theme.of(context)`. Flipping the OS dark-mode toggle re-runs every `Theme.of(context)` read — no manual rebuild calls.',
              whyItMatters: 'When the chittoorCatering owner asks for a rebrand from orange to deep saffron in year two, the difference between **changing one `seedColor` constant and rebuilding** vs **find-and-replace across 40 widgets** is a 30-minute task vs an afternoon-with-bugs. Beyond rebrand, theme-correct widgets mean **dark mode works for free** when you eventually enable it. Flutter interviewers ask the theming pattern more than they ask null-safety; cementing it today is high-leverage.',
              steps: [
                'Open `lib/main.dart`. In `MaterialApp`, set `theme: _buildTheme(Brightness.light), darkTheme: _buildTheme(Brightness.dark), themeMode: ThemeMode.system`.',
                'Define `ThemeData _buildTheme(Brightness b) => ThemeData(useMaterial3: true, colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFE85A2A), brightness: b));`.',
                'In a widget, replace `color: Colors.orange` with `color: Theme.of(context).colorScheme.primary`.',
                'Replace `style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)` with `style: Theme.of(context).textTheme.titleMedium`.',
                'Add an `appBarTheme: AppBarTheme(centerTitle: true)` inside `_buildTheme` and confirm every AppBar centres its title.',
                'Toggle the device dark mode (Android: Settings → Display → Dark theme). Confirm the app re-themes without restart.',
                'Add a per-screen override using `Theme(data: Theme.of(context).copyWith(colorScheme: ...), child: ...)`.',
                'Run `flutter analyze` — should be clean.',
              ],
              code: `// lib/main.dart — single brand colour drives both light and dark themes.
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

const _brandOrange = Color(0xFFE85A2A);  // matches launcher icon

ThemeData _buildTheme(Brightness brightness) {
  final scheme = ColorScheme.fromSeed(
    seedColor: _brandOrange,
    brightness: brightness,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    appBarTheme: AppBarTheme(
      centerTitle: true,
      backgroundColor: scheme.primary,
      foregroundColor: scheme.onPrimary,
    ),
    cardTheme: CardTheme(
      elevation: 1,
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: scheme.primary,
        foregroundColor: scheme.onPrimary,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      ),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Chittoor Catering',
      theme: _buildTheme(Brightness.light),
      darkTheme: _buildTheme(Brightness.dark),
      themeMode: ThemeMode.system,         // follow OS toggle
      home: const DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final text = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: ListView(
        children: [
          Card(
            child: ListTile(
              leading: Icon(Icons.event, color: scheme.primary),
              title: Text("Today's events", style: text.titleMedium),
              subtitle: Text('3 confirmed, 1 draft', style: text.bodySmall),
            ),
          ),
          ElevatedButton(
            onPressed: () {},
            child: const Text('New event'),  // theme drives the colour
          ),
        ],
      ),
    );
  }
}`,
              pitfalls: [
                '**Hard-coding `Colors.orange` in widgets.** Rebrand becomes a 40-file find-and-replace. Fix: read `Theme.of(context).colorScheme.primary` everywhere.',
                '**Hard-coded `TextStyle(fontSize: 18, ...)`.** Bypasses `textTheme`, breaks dark mode contrast. Fix: use `Theme.of(context).textTheme.titleMedium` and `.copyWith(...)` for one-off overrides.',
                '**Defining a separate `ThemeData` for dark with a different palette.** Brand consistency suffers. Fix: same `seedColor`, just flip `brightness: Brightness.dark`.',
                '**Calling `Theme.of(context)` outside `build`.** `BuildContext` may not have the InheritedWidget mounted. Fix: pass the theme down as a parameter, or move the read into `build`.',
                '**Forgetting `useMaterial3: true`.** App looks Material 2 — boxy buttons, harsh elevation. Fix: enable Material 3 in `ThemeData`.',
                '**Putting brand colours in `Container(decoration: BoxDecoration(color: 0xFFE85A2A))`.** Same hard-code problem with extra steps. Fix: `color: scheme.primary`.',
                '**Building theme inside `MaterialApp` constructor each rebuild.** Recreates the ThemeData on every parent rebuild. Fix: move to a top-level `final lightTheme = ...` constant or a memoised getter.',
                '**Forgetting `themeMode: ThemeMode.system`.** App ignores the OS dark-mode toggle. Fix: set it explicitly so the OS controls the experience.',
              ],
              tryIt: 'Convert every widget in your `widget_basics` app from m0-t7 to read theme tokens — colours via `Theme.of(context).colorScheme.primary`, text via `Theme.of(context).textTheme.titleMedium`. Confirm the app still looks identical. Now flip `themeMode: ThemeMode.dark` for one debug session and watch the entire UI re-skin without touching individual widgets. **Then extend it**: add a toggle button in the AppBar that flips `themeMode` at runtime (you will need a `StatefulWidget` to hold the current mode).',
              takeaway: 'Define theme tokens once at the root; read `Theme.of(context)` everywhere else.',
            },
            {
              id: 'm0-t12',
              title: 'Navigation: push, pop & Modal Bottom Sheets',
              explain: 'Move between screens with `Navigator.push`/`pop` and `MaterialPageRoute`, and slide up edit forms with `showModalBottomSheet`.',
              takeaway: 'Push for full-screen flows; modal bottom sheet for quick edits that should not lose context.',
            },
          ],
        },
        {
          id: 'm0-s3',
          title: 'Async & Streams',
          topics: [
            {
              id: 'm0-t13',
              title: 'Future, async/await & try/catch',
              explain: 'Run async work with `Future`, await results in `async` functions, and handle errors with `try/catch` instead of leaving uncaught rejections.',
              takeaway: 'Every `await` belongs inside a `try` — uncaught Futures are silent crashes.',
            },
            {
              id: 'm0-t14',
              title: 'Stream vs Future — When to Use Which',
              explain: 'Pick `Future` for one-shot results (a single Firestore read) and `Stream` for continuous flows (a Firestore live snapshot, FCM messages).',
              takeaway: 'One value → Future; many values over time → Stream.',
            },
            {
              id: 'm0-t15',
              title: 'StreamBuilder & FutureBuilder UX',
              explain: 'Render async data in widgets with `StreamBuilder`/`FutureBuilder` — handle waiting, error, and data states without boilerplate `setState` calls.',
              takeaway: 'Always handle `waiting`, `hasError`, and `hasData` — never assume the data path.',
            },
            {
              id: 'm0-t16',
              title: 'StreamController & StreamSubscription Lifecycle',
              explain: 'Emit your own events with `StreamController`, share them across listeners with broadcast streams, and cancel `StreamSubscription`s in `dispose()` to avoid leaks.',
              takeaway: 'Every `.listen(...)` deserves a matching `.cancel()` in `dispose()`.',
            },
            {
              id: 'm0-t17',
              title: 'Timer, Debounce & Throttle Patterns',
              explain: 'Schedule one-shot and periodic work with `Timer`, then debounce search-box input and throttle scroll-driven loads.',
              takeaway: 'Debounce for typed input, throttle for scroll/gesture streams — never both at once.',
            },
            {
              id: 'm0-t18',
              title: 'Isolates and the FCM Background Handler',
              explain: 'Understand why FCM background messages run in a **separate Dart isolate** that does NOT inherit your app\'s `Firebase.initializeApp` — the most surprising rule in Flutter + Firebase.',
              takeaway: 'The FCM background isolate is a fresh Dart VM — re-initialize Firebase as the very first line.',
            },
          ],
        },
      ],
      projects: [],
      quiz: [],
    },
    {
      id: 'm1',
      title: 'Firebase Project Setup',
      hours: 6,
      color: 'from-amber-500/20 to-orange-700/10',
      accent: 'amber',
      description:
        'Spin up the Firebase project, enable Auth/Firestore/Functions, wire FlutterFire CLI and the Android app.',
      sections: [],
      projects: [],
      quiz: [],
    },
    {
      id: 'm2',
      title: 'App Scaffolding & Auth',
      hours: 7,
      color: 'from-yellow-500/20 to-amber-700/10',
      accent: 'yellow',
      description:
        'Project structure, routing, theme, sign-in flow, owner profile — the skeleton every screen hangs off.',
      sections: [],
      projects: [],
      quiz: [],
    },
    {
      id: 'm3',
      title: 'Firestore Data Layer',
      hours: 12,
      color: 'from-rose-500/20 to-orange-700/10',
      accent: 'rose',
      description:
        'Repositories, converters, composite indexes, denormalisation, the hall-conflict query — Firestore done right.',
      sections: [],
      projects: [],
      quiz: [],
    },
    {
      id: 'm4',
      title: 'Core CRUD UIs',
      hours: 9,
      color: 'from-pink-500/20 to-rose-700/10',
      accent: 'pink',
      description:
        'Halls, menus, packages, customers — list/detail/edit screens shared across the app.',
      sections: [],
      projects: [],
      quiz: [],
    },
    {
      id: 'm5',
      title: 'Event Lifecycle',
      hours: 10,
      color: 'from-fuchsia-500/20 to-pink-700/10',
      accent: 'fuchsia',
      description:
        'Draft → confirmed → completed → cancelled, the state machine, the copyWith trap, the audit trail.',
      sections: [],
      projects: [],
      quiz: [],
    },
    {
      id: 'm6',
      title: 'Pricing, Invoicing & PDF',
      hours: 8,
      color: 'from-violet-500/20 to-fuchsia-700/10',
      accent: 'violet',
      description:
        'Price tiers, GST math, invoice generation, PDF rendering with `pdf` + `printing`, share-sheet dispatch.',
      sections: [],
      projects: [],
      quiz: [],
    },
    {
      id: 'm7',
      title: 'Notifications & Cloud Functions',
      hours: 7,
      color: 'from-indigo-500/20 to-violet-700/10',
      accent: 'indigo',
      description:
        'FCM topics, server-side reminders, the daily catering digest function, denormalised reads from Functions.',
      sections: [],
      projects: [],
      quiz: [],
    },
    {
      id: 'm8',
      title: 'Polish, Deployment & Distribution',
      hours: 12,
      color: 'from-blue-500/20 to-indigo-700/10',
      accent: 'blue',
      description:
        'Launcher icons, signed bundles, internal testing, Play Store listing, Crashlytics, performance tuning.',
      sections: [],
      projects: [],
      quiz: [],
    },
    {
      id: 'm9',
      title: 'Troubleshooting & Common Fixes',
      hours: 6,
      color: 'from-sky-500/20 to-blue-700/10',
      accent: 'sky',
      description:
        'Real Logcat / Firebase CLI / Gradle errors copied from production sessions — and the fixes that work.',
      sections: [],
      projects: [],
      quiz: [],
    },
  ],
}

export const flattenTopics = (mods) =>
  (mods || []).flatMap((m) =>
    (m.sections || []).flatMap((s) =>
      (s.topics || []).map((t) => ({ ...t, moduleId: m.id, sectionId: s.id }))
    )
  )

export const getTotals = (mods) => {
  const flat = flattenTopics(mods)
  return { topics: flat.length, modules: (mods || []).length }
}
