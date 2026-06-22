// Module 1 — Project Architecture & Dependencies
// Scaffolds the real "TunMani Cafe Billing" app: dependencies, folder structure, and app shell.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m1 = {
  id: 'm1',
  title: 'Project Architecture & Dependencies',
  hours: 8,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Add and understand every package the billing app needs, organise lib/ into models/services/screens, and build the app shell — Firebase init, MultiProvider, the Material 3 theme, and an auth-guarded go_router.',
  sections: [
    {
      id: 'm1-s1',
      title: 'Dependencies (pubspec.yaml)',
      topics: [
        {
          id: 'm1-t1',
          title: 'pubspec.yaml & flutter pub add / pub get',
          explain:
            'The `pubspec.yaml` file lists your dependencies; `flutter pub add` adds one and `flutter pub get` downloads them all.',
          analogy:
            'Before a big TunMani Cafe catering order, the head cook writes a provisions list — rice 10kg, coconut 50, kokum, kori masala. The grocer reads the list and delivers everything. `pubspec.yaml` is that provisions list, and `flutter pub get` is the grocer fetching every item so the kitchen is fully stocked before cooking starts.',
          theory:
            '**`pubspec.yaml`** is your project manifest. Its `dependencies:` section lists every package the app uses, each pinned to a version range. The `flutter:` section declares assets and fonts.\n\nYou rarely edit the dependency list by hand. **`flutter pub add provider`** adds the package and writes the correct version into `pubspec.yaml`. **`flutter pub get`** then downloads everything and updates the `pubspec.lock` (the exact resolved versions).\n\nPackages come from **pub.dev**, the official registry. After adding a package you `import` it in Dart. If you edit `pubspec.yaml` by hand you must run `flutter pub get` yourself; `pub add` does both in one step.',
          whyItMatters:
            'The TunMani Cafe app depends on around eighteen packages — Firebase, printing, PDF, routing, state management. Knowing how to add and resolve dependencies cleanly is fundamental to every Flutter project, and version conflicts in `pubspec.yaml` are one of the most common things you will debug as a Flutter developer.',
          steps: [
            'Open the project and look at `pubspec.yaml`.',
            'Find the `dependencies:` section under `flutter:`.',
            'Run `flutter pub add provider` and watch it appear in the file.',
            'Run `flutter pub add go_router intl uuid` to add several at once.',
            'Run `flutter pub get` to download everything.',
            'Open `pubspec.lock` and note the exact resolved versions.',
            'Import a package in Dart, e.g. `import \'package:provider/provider.dart\';`.',
          ],
          code: `# Add packages (writes versions into pubspec.yaml automatically)
$ flutter pub add provider go_router intl uuid
$ flutter pub add shared_preferences permission_handler

# Download everything declared in pubspec.yaml
$ flutter pub get

# pubspec.yaml after the commands (excerpt)
# dependencies:
#   flutter:
#     sdk: flutter
#   provider: ^6.1.2
#   go_router: ^14.2.0
#   intl: ^0.19.0
#   uuid: ^4.4.0
#   shared_preferences: ^2.2.3
#   permission_handler: ^11.3.1`,
          pitfalls: [
            '**Editing `pubspec.yaml` by hand then forgetting `flutter pub get`.** Imports fail. Fix: run `pub get`, or just use `pub add`.',
            '**Wrong indentation in `pubspec.yaml`.** YAML is whitespace-sensitive; one wrong space breaks parsing. Fix: use two-space indents, no tabs.',
            '**Pinning an exact version with `1.2.3` everywhere.** Blocks patch fixes. Fix: use caret ranges like `^1.2.3`.',
            '**Adding a package but never importing it.** Dead weight. Fix: import what you add, remove what you do not use.',
            '**Ignoring `flutter pub outdated`.** You miss updates and security fixes. Fix: run it periodically.',
            '**Committing without `pubspec.lock`.** Teammates get different versions. Fix: commit the lock file.',
          ],
          tryIt:
            'Run `flutter pub add uuid`, then in a Dart file create a unique id with `import \'package:uuid/uuid.dart\';` and `final id = const Uuid().v4();`. Print it. You now know the full add-import-use loop you will repeat for every package.',
          takeaway: '`pub add` writes the dependency and downloads it; `pub get` resolves everything in pubspec.yaml.',
        },
        {
          id: 'm1-t2',
          title: 'State & routing: provider and go_router',
          explain:
            '`provider` shares app state (like the signed-in user) across screens; `go_router` declares your navigation with URLs and guards.',
          analogy:
            'Think of the TunMani Cafe front desk announcement board: whatever it shows, every staff member across all rooms sees the same thing instantly. `provider` is that shared board for app data. `go_router` is the floor map with clearly numbered rooms and a security guard who checks whether you are allowed into the staff-only section.',
          theory:
            '**`provider`** is a lightweight state-management package. You wrap your app in providers (often a `MultiProvider`) so any descendant widget can read shared objects via `context.read<T>()` or `context.watch<T>()`. A `ChangeNotifier` calls `notifyListeners()` to rebuild watchers — that is how the billing app broadcasts auth and data changes.\n\n**`go_router`** is the declarative router. You define a list of routes with paths (`/login`, `/staff`, `/admin`) and builders, plus a **`redirect`** function that acts as an **auth guard** — sending signed-out users to `/login`. It also gives you clean page transitions and deep linking.',
          whyItMatters:
            'In the TunMani Cafe app, `provider` carries the `AuthService`, `FirestoreService`, and `AuthNotifier` to every screen, while `go_router` decides whether a user lands on the staff billing screen or the admin dashboard. These two packages define how state flows and how the user navigates — the backbone of the whole app architecture.',
          steps: [
            'Run `flutter pub add provider go_router`.',
            'Create a `ChangeNotifier` class (e.g. `AuthNotifier`) with a `bool isSignedIn`.',
            'Wrap the app in a `ChangeNotifierProvider` (or `MultiProvider`).',
            'Read it in a widget with `context.watch<AuthNotifier>()`.',
            'Define a `GoRouter` with `/login`, `/staff`, and `/admin` routes.',
            'Add a `redirect` that sends signed-out users to `/login`.',
            'Navigate with `context.go(\'/staff\')`.',
          ],
          code: `// Minimal provider + go_router wiring.
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

class AuthNotifier extends ChangeNotifier {
  bool isSignedIn = false;
  void signIn()  { isSignedIn = true;  notifyListeners(); }
  void signOut() { isSignedIn = false; notifyListeners(); }
}

GoRouter buildRouter(AuthNotifier auth) {
  return GoRouter(
    refreshListenable: auth,                  // re-run redirect on change
    redirect: (context, state) {
      final loggedIn = auth.isSignedIn;
      final goingToLogin = state.matchedLocation == '/login';
      if (!loggedIn && !goingToLogin) return '/login';   // auth guard
      if (loggedIn && goingToLogin) return '/staff';
      return null;                            // no redirect
    },
    routes: [
      GoRoute(path: '/login', builder: (c, s) => const LoginScreen()),
      GoRoute(path: '/staff', builder: (c, s) => const StaffHome()),
      GoRoute(path: '/admin', builder: (c, s) => const AdminHome()),
    ],
  );
}`,
          pitfalls: [
            '**Reading state with `context.read` inside `build`.** It will not rebuild on change. Fix: use `context.watch` in `build`, `read` in callbacks.',
            '**Forgetting `notifyListeners()`.** UI never updates. Fix: call it after every state change in a ChangeNotifier.',
            '**No `refreshListenable` on the router.** The auth guard does not re-run after sign-in. Fix: pass the notifier as `refreshListenable`.',
            '**Using `Navigator.push` and `go_router` together randomly.** Confusing back stack. Fix: pick `go_router` (`context.go`/`context.push`) consistently.',
            '**A redirect with no exit condition.** Infinite redirect loop. Fix: allow the login route through when signed out.',
            '**Putting heavy logic in the redirect.** It runs on every navigation. Fix: keep it to quick boolean checks.',
          ],
          tryIt:
            'Wire an `AuthNotifier` into a `ChangeNotifierProvider`, build a `GoRouter` with `/login` and `/staff`, and add a redirect that guards `/staff`. Add a button that calls `auth.signIn()` and confirm the router moves you to `/staff` automatically.',
          takeaway: 'provider broadcasts shared state; go_router declares routes and guards them with redirect.',
        },
        {
          id: 'm1-t3',
          title: 'The Firebase packages & google_sign_in',
          explain:
            '`firebase_core` boots Firebase, `firebase_auth` + `google_sign_in` handle login, and `cloud_firestore` is the live database.',
          analogy:
            'Firebase is the TunMani Cafe central office in the cloud. `firebase_core` is unlocking the office in the morning so it is open for business. `firebase_auth` and `google_sign_in` are the security desk that checks staff ID cards. `cloud_firestore` is the live ledger book everyone reads and writes — and it updates on every device the moment anyone makes an entry.',
          theory:
            '**`firebase_core`** initialises the Firebase connection; nothing else works until `Firebase.initializeApp()` runs in `main()`.\n\n**`firebase_auth`** manages users — sign in, sign out, and the current user. **`google_sign_in`** provides the Google account chooser; its credential is handed to `firebase_auth` to complete login. The billing app uses this so only whitelisted Google accounts can operate the counter.\n\n**`cloud_firestore`** is a real-time NoSQL database of collections and documents. Reads return `Future`s for one-shot fetches and `Stream`s for live updates, so the menu and bills sync across the owner\'s phone and the counter tablet automatically.',
          whyItMatters:
            'Firebase is the entire backend of the TunMani Cafe app — auth, menu storage, bill history, and reports all live in Firestore, with Google sign-in gating access. These packages are also the most common backend stack in Flutter job postings, so wiring them correctly is a directly marketable skill.',
          steps: [
            'Run `flutter pub add firebase_core firebase_auth cloud_firestore google_sign_in`.',
            'Set up the Firebase project with the FlutterFire CLI (`flutterfire configure`).',
            'Call `await Firebase.initializeApp(...)` in `main()` before `runApp`.',
            'Build the Google sign-in flow with `GoogleSignIn` and `FirebaseAuth`.',
            'Read the current user with `FirebaseAuth.instance.currentUser`.',
            'Read a Firestore collection with `FirebaseFirestore.instance.collection(\'menu\')`.',
            'Use `.snapshots()` for a live stream or `.get()` for a one-shot read.',
          ],
          code: `// Firebase init + Google sign-in (simplified).
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();   // boot Firebase first
  // runApp(...) goes here
}

Future<UserCredential?> signInWithGoogle() async {
  final googleUser = await GoogleSignIn().signIn();   // account chooser
  if (googleUser == null) return null;                 // user cancelled
  final auth = await googleUser.authentication;
  final cred = GoogleAuthProvider.credential(
    accessToken: auth.accessToken,
    idToken: auth.idToken,
  );
  return FirebaseAuth.instance.signInWithCredential(cred);
}

// A live stream of menu documents from Firestore.
Stream<QuerySnapshot> menuStream() =>
    FirebaseFirestore.instance.collection('menu').snapshots();`,
          pitfalls: [
            '**Calling Firebase before `initializeApp`.** Throws "No Firebase App". Fix: await `Firebase.initializeApp()` first in `main`.',
            '**Forgetting `WidgetsFlutterBinding.ensureInitialized()`.** Async setup in `main` crashes. Fix: call it before any await.',
            "**Not handling a cancelled Google sign-in.** `signIn()` returns null. Fix: check for null before using it.",
            '**Treating Firestore reads as synchronous.** They return Futures/Streams. Fix: `await` `.get()` or `StreamBuilder` over `.snapshots()`.',
            '**Skipping platform config (google-services.json).** Android build fails. Fix: run `flutterfire configure` and add the file.',
            '**Open Firestore security rules.** Anyone can read/write. Fix: lock rules to whitelisted users (covered later).',
          ],
          tryIt:
            'After `flutterfire configure`, add `Firebase.initializeApp()` to `main` and run the app to confirm it boots without errors. Then write a `Stream<QuerySnapshot>` over a `menu` collection and log how many documents it returns.',
          takeaway: 'firebase_core boots, auth + google_sign_in gate access, cloud_firestore is the live database.',
        },
        {
          id: 'm1-t4',
          title: 'Printing & receipts: thermal, pdf, printing, qr_flutter',
          explain:
            '`print_bluetooth_thermal` drives the counter printer, `pdf` + `printing` make shareable bills, and `qr_flutter` renders UPI QR codes.',
          analogy:
            'At the TunMani Cafe counter, finishing a bill means three things: a slip rolls out of the little thermal printer, a clean copy can be saved or shared as a document, and a QR appears for the customer to scan and pay by UPI. These three packages are exactly those three machines on the counter.',
          theory:
            '**`print_bluetooth_thermal`** connects to a Bluetooth thermal printer (the small 58/80mm receipt printers) and sends bytes/ESC-POS commands to print a receipt.\n\n**`pdf`** builds a PDF document in memory, and **`printing`** lets you preview, print, or share it through the OS print dialog — useful for an A4 invoice or emailing a bill.\n\n**`qr_flutter`** renders a QR code as a widget from any string — the billing app encodes a UPI payment URL so customers scan to pay. Together these cover every "give the customer their bill" path: thermal slip, PDF copy, or QR-to-pay.',
          whyItMatters:
            'A billing app is judged on whether the receipt actually prints. These packages turn the abstract "total" into something the customer holds or scans. Bluetooth thermal printing in particular is fiddly and device-specific, so knowing the package and its permission needs is a real differentiator for a POS app.',
          steps: [
            'Run `flutter pub add print_bluetooth_thermal pdf printing qr_flutter`.',
            'List paired thermal printers and connect to one.',
            'Build a receipt string and send it to the thermal printer.',
            'Build a PDF with the `pdf` package for an A4 copy.',
            'Use `printing` to preview/share the PDF.',
            'Render a UPI string as a QR with `QrImageView`.',
            'Test thermal printing on a real device (emulators have no Bluetooth printer).',
          ],
          code: `// A UPI QR widget + a tiny PDF, plus thermal print call.
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:print_bluetooth_thermal/print_bluetooth_thermal.dart';

// 1. UPI QR code as a widget.
Widget upiQr(String upiUrl) => QrImageView(data: upiUrl, size: 180);
// e.g. 'upi://pay?pa=tunmani@okaxis&pn=TunMani Cafe&am=180.00&cu=INR'

// 2. Build a simple PDF bill.
Future<List<int>> buildPdf() async {
  final doc = pw.Document();
  doc.addPage(pw.Page(build: (ctx) => pw.Text('TunMani Cafe Bill')));
  return doc.save();
}

// 3. Send a receipt to a connected thermal printer.
Future<void> printReceipt(String receiptText) async {
  final connected = await PrintBluetoothThermal.connectionStatus;
  if (connected) {
    await PrintBluetoothThermal.writeString(
      printText: PrintTextSize(size: 2, text: receiptText),
    );
  }
}`,
          pitfalls: [
            '**Testing thermal printing on an emulator.** No Bluetooth hardware. Fix: test on a real Android device.',
            '**Missing Bluetooth permissions.** Print silently fails on Android 12+. Fix: request the runtime permissions (next topic).',
            '**Sending the wrong byte width.** 58mm vs 80mm rolls differ. Fix: match the receipt width to the printer.',
            "**Encoding a malformed UPI string.** Customer's app rejects the QR. Fix: build a valid `upi://pay?...` URL with all required params.",
            '**Building a huge PDF on the UI thread.** Jank. Fix: build it in an async function.',
            '**Assuming the printer stays connected.** It drops often. Fix: check `connectionStatus` before each print.',
          ],
          tryIt:
            'Render a `QrImageView` for a sample UPI URL with a fixed amount and confirm a UPI app can scan it. Then build a one-line PDF with the `pdf` package and open it via the `printing` preview dialog.',
          takeaway: 'Thermal for the slip, pdf+printing for a shareable copy, qr_flutter for UPI-to-pay.',
        },
        {
          id: 'm1-t5',
          title: 'Utility packages: intl, shared_preferences, uuid, files & permissions',
          explain:
            'A cluster of small but essential packages: `intl` (currency/dates), `shared_preferences` (settings), `uuid` (ids), `pdf`/`path_provider`/`share_plus`/`archive`/`excel` (files & exports), and `permission_handler`.',
          analogy:
            'These are the TunMani Cafe counter drawer: nothing flashy, but every item is reached for daily. The calculator and date stamp (`intl`), the sticky note of preferences (`shared_preferences`), the numbered token printer (`uuid`), the file folder and stapler for exports (`path_provider`, `share_plus`, `archive`, `excel`), and the keyring that unlocks restricted drawers (`permission_handler`).',
          theory:
            '**`intl`** formats currency, numbers, and dates by locale — essential for clean `₹` amounts and Indian date formats. **`shared_preferences`** stores small key-value settings on the device (last printer, theme choice). **`uuid`** generates unique ids for bills and items.\n\nFor files and exports: **`path_provider`** finds safe folders to write to, **`share_plus`** opens the OS share sheet, **`archive`** zips files (e.g. a backup bundle), and **`excel`** writes `.xlsx` sales reports. **`permission_handler`** requests runtime permissions (Bluetooth, storage) on Android — without it, printing and exporting fail on modern Android versions.',
          whyItMatters:
            'These packages handle the unglamorous-but-essential parts of a real POS: correct money formatting, remembering settings, generating unique bill numbers, exporting reports the owner can open in Excel, and getting the permissions Android demands. Forgetting any one of them is how a "finished" app fails in the field.',
          steps: [
            'Run `flutter pub add intl shared_preferences uuid path_provider share_plus archive excel permission_handler`.',
            'Format a price with `NumberFormat.currency(locale: \'en_IN\', symbol: \'₹\')`.',
            'Save and read a setting with `SharedPreferences`.',
            'Generate a bill id with `const Uuid().v4()`.',
            'Find a writable directory with `path_provider`.',
            'Build an `.xlsx` report with `excel` and share it via `share_plus`.',
            'Request a runtime permission with `permission_handler` before printing.',
          ],
          code: `// A few utility packages in action.
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'package:permission_handler/permission_handler.dart';

// 1. Indian rupee formatting.
final rupee = NumberFormat.currency(locale: 'en_IN', symbol: '₹');
String money(double a) => rupee.format(a);   // ₹1,80,000.00

// 2. Persist a small setting.
Future<void> saveLastPrinter(String mac) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString('lastPrinter', mac);
}

// 3. Unique bill id.
String newBillId() => const Uuid().v4();      // e.g. 3f2c...-...

// 4. Ask for Bluetooth permission before printing (Android 12+).
Future<bool> ensureBluetooth() async {
  final status = await Permission.bluetoothConnect.request();
  return status.isGranted;
}`,
          pitfalls: [
            '**Hand-formatting currency with string concatenation.** Wrong grouping for Indian numbering. Fix: use `intl` `NumberFormat`.',
            '**Storing big data in `shared_preferences`.** It is for small settings only. Fix: use Firestore/files for real data.',
            '**Generating ids manually (timestamps).** Collisions. Fix: use `uuid`.',
            '**Writing files to arbitrary paths.** Permission errors. Fix: use `path_provider` directories.',
            '**Skipping `permission_handler` on Android 12+.** Bluetooth/storage actions silently fail. Fix: request permissions at runtime.',
            '**Forgetting to declare permissions in the manifest.** Requests are denied outright. Fix: add the matching entries in AndroidManifest.xml.',
          ],
          tryIt:
            'Format ₹1,80,000 with `intl` and confirm the Indian grouping (1,80,000 not 180,000). Then save a "lastPrinter" value with `shared_preferences`, restart the app, and read it back to confirm it persisted.',
          takeaway: 'These utility packages cover money formatting, settings, ids, file exports, and Android permissions.',
        },
      ],
    },
    {
      id: 'm1-s2',
      title: 'Folder Structure',
      topics: [
        {
          id: 'm1-t6',
          title: 'Organising lib/: models, services, screens, utils, theme',
          explain:
            'Split `lib/` into folders by responsibility — models/, services/, screens/, utils/, theme/ — so the code stays navigable as it grows.',
          analogy:
            'A well-run TunMani Cafe kitchen has zones: the cold store (ingredients), the prep station (services that transform them), the serving counter (what the customer sees), and the spice shelf (small helpers). Throwing everything onto one table is chaos. Folders in `lib/` are those kitchen zones.',
          theory:
            'A flat `lib/` with thirty files becomes unsearchable fast. The convention is to group by **responsibility**: **`models/`** (plain data classes like `MenuItem`, `Bill`), **`services/`** (classes that talk to Firebase, printing, etc.), **`screens/`** (the UI pages), **`utils/`** (small helpers and formatters), and **`theme/`** (colors, text styles, `ThemeData`).\n\nTop-level files `main.dart`, `router.dart`, and `auth_notifier.dart` stay directly in `lib/` because they wire everything together.\n\nThis is "separation of concerns": each folder has one job, so you always know where a file belongs and where to look when something breaks.',
          whyItMatters:
            'Architecture is what makes an app maintainable past week one. A recruiter or teammate dropped into a clean `lib/` can find any feature in seconds. The TunMani Cafe app uses exactly this layout, and being able to explain "why is this in services and not screens" is a common senior-level interview question.',
          steps: [
            'Inside `lib/`, create folders: `models/`, `services/`, `screens/`, `utils/`, `theme/`.',
            'Move data classes (e.g. `menu_item.dart`) into `models/`.',
            'Put Firebase/printing classes (e.g. `firestore_service.dart`) into `services/`.',
            'Put UI pages (e.g. `staff_home.dart`) into `screens/`.',
            'Add subfolders under `screens/`: `shared/`, `staff/`, `admin/`.',
            'Put formatters and constants in `utils/`.',
            'Keep `main.dart`, `router.dart`, `auth_notifier.dart` at the `lib/` root.',
          ],
          code: `// Target lib/ layout for TunMani Cafe Billing.
lib/
  main.dart              // entry point: Firebase init + MultiProvider + router
  router.dart            // go_router config with auth guards
  auth_notifier.dart     // ChangeNotifier that drives route redirects

  models/
    menu_item.dart
    bill.dart
    bill_line.dart

  services/
    auth_service.dart       // Firebase Auth + Google sign-in
    firestore_service.dart  // reads/writes menu, bills
    print_service.dart      // thermal + PDF printing

  screens/
    shared/                 // login, splash, widgets used everywhere
      login_screen.dart
    staff/                  // the billing counter UI
      staff_home.dart
      bill_screen.dart
    admin/                  // owner dashboard, reports
      admin_home.dart
      reports_screen.dart

  utils/
    formatters.dart         // money(), date helpers
    constants.dart

  theme/
    app_theme.dart          // Material 3 ThemeData`,
          pitfalls: [
            '**A flat `lib/` with everything in one folder.** Unsearchable. Fix: group by responsibility from day one.',
            '**Business logic inside screen widgets.** Hard to test, hard to reuse. Fix: push it into `services/`.',
            '**Models that import Flutter.** They should be plain Dart. Fix: keep `models/` UI-free.',
            '**Deeply nested folders.** Over-engineering. Fix: a few clear folders beat a deep tree.',
            '**Circular imports between folders.** Services importing screens importing services. Fix: keep dependencies flowing one way (screens -> services -> models).',
            '**Renaming folders mid-project carelessly.** Breaks imports everywhere. Fix: use the IDE move/rename refactor.',
          ],
          tryIt:
            'Create the five folders plus the `screens/` subfolders, move your `MenuItem` model into `models/`, and fix the import in `main.dart`. Run the app to confirm nothing broke. Sketch on paper which folder each future file (a "report exporter", a "login page") belongs in.',
          takeaway: 'Group lib/ by responsibility — models, services, screens, utils, theme — and keep the wiring files at the root.',
        },
        {
          id: 'm1-t7',
          title: 'Separation of concerns: models vs services vs screens',
          explain:
            'Each layer has one job: models hold data, services do the work, screens show the UI — and they never blur into each other.',
          analogy:
            'At TunMani Cafe, the menu card (data) does not cook; the cook (service) does not greet customers; the waiter (screen) does not store the recipe. Each role stays in its lane, and the restaurant runs smoothly because nobody is doing three jobs at once.',
          theory:
            '**Separation of concerns** means a piece of code does exactly one kind of thing. **Models** are dumb data containers — fields plus `fromMap`/`toMap`/`copyWith`, no UI, no network. **Services** contain the logic — `FirestoreService.saveBill(bill)`, `PrintService.printReceipt(...)` — and depend on models but not on widgets. **Screens** build the UI and call services; they hold no business logic of their own.\n\nThe data flow is one-directional: **screens depend on services, services depend on models**. A screen never queries Firestore directly; it asks a service. This makes each layer independently testable and replaceable.',
          whyItMatters:
            'When a bug appears in the TunMani Cafe app you instantly know which layer to open: wrong total math is in a service, wrong field is in a model, wrong button placement is in a screen. This discipline is the difference between a codebase you can grow and one that collapses under its own weight — and interviewers probe it constantly.',
          steps: [
            'Identify the three layers in your app: data, logic, UI.',
            'Ensure `models/` files import only `dart:` and other models.',
            'Put every Firestore/print call inside a `services/` class.',
            'Have screens call services, never Firebase directly.',
            'Pass models between layers (a `Bill` object), not raw maps.',
            'Inject services via `provider` so screens receive them.',
            'Write a quick mental test: could you swap Firestore for a fake without touching any screen?',
          ],
          code: `// One feature across the three layers.

// models/bill.dart — pure data.
class Bill {
  final String id;
  final double total;
  const Bill({required this.id, required this.total});
  Map<String, dynamic> toMap() => {'id': id, 'total': total};
}

// services/firestore_service.dart — the logic/IO layer.
import 'package:cloud_firestore/cloud_firestore.dart';
class FirestoreService {
  final _db = FirebaseFirestore.instance;
  Future<void> saveBill(Bill bill) =>
      _db.collection('bills').doc(bill.id).set(bill.toMap());
}

// screens/staff/bill_screen.dart — the UI, calls the service.
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
// ...
ElevatedButton(
  onPressed: () {
    final svc = context.read<FirestoreService>();  // from provider
    svc.saveBill(const Bill(id: 'b1', total: 180));  // no Firestore here
  },
  child: const Text('Save bill'),
);`,
          pitfalls: [
            '**Calling Firestore directly from a widget.** Untestable, duplicated. Fix: route through a service.',
            '**Models that format strings or build widgets.** Mixed concerns. Fix: keep formatting in utils, UI in screens.',
            '**Services that import `material.dart`.** They should not need the UI. Fix: keep services UI-free.',
            '**Passing raw `Map`s between layers.** Loses type safety. Fix: pass model objects.',
            '**Giant "god" service doing everything.** Hard to maintain. Fix: split by domain (auth, firestore, print).',
            '**Business logic in `build()`.** Re-runs constantly. Fix: compute in services, render in screens.',
          ],
          tryIt:
            'Take one feature — "save a bill" — and implement it across all three layers: a `Bill` model, a `FirestoreService.saveBill`, and a screen button that calls the service via `context.read`. Confirm the screen contains zero Firestore imports.',
          takeaway: 'Models hold data, services do the work, screens show it — dependencies flow one way only.',
        },
        {
          id: 'm1-t8',
          title: 'The wiring files: main.dart, router.dart, auth_notifier.dart',
          explain:
            'Three root files glue the app together: `main.dart` boots it, `router.dart` defines navigation, and `auth_notifier.dart` drives auth-based redirects.',
          analogy:
            'These are the TunMani Cafe control room: the main switchboard that powers everything on in the morning (`main.dart`), the floor map that says which door leads where (`router.dart`), and the duty-status board that flips when a staff member clocks in or out, instantly updating who can go where (`auth_notifier.dart`).',
          theory:
            '**`main.dart`** is the entry point: it initialises Firebase, sets up the `MultiProvider`, and hands the `GoRouter` to a `MaterialApp.router`. It is small — its only job is wiring.\n\n**`router.dart`** holds the `GoRouter` configuration: the route table and the `redirect` auth guard. Keeping it separate from `main.dart` keeps both readable.\n\n**`auth_notifier.dart`** is a `ChangeNotifier` exposing the current auth state. The router listens to it via `refreshListenable`, so the instant a user signs in or out, every guarded route re-evaluates. This trio is the standard Flutter app-shell pattern.',
          whyItMatters:
            'Anyone opening the TunMani Cafe codebase reads these three files first to understand the whole app. Getting the wiring right — Firebase before runApp, providers above the router, the notifier driving redirects — is what makes auth, navigation, and state "just work" everywhere else. It is the architecture an interviewer asks you to whiteboard.',
          steps: [
            'In `main.dart`, make `main()` async and `await Firebase.initializeApp()`.',
            'Wrap the app in a `MultiProvider` with your services and the `AuthNotifier`.',
            'Use `MaterialApp.router(routerConfig: ...)` with the router from `router.dart`.',
            'In `auth_notifier.dart`, expose the sign-in state as a `ChangeNotifier`.',
            'In `router.dart`, build a `GoRouter` that takes the notifier as `refreshListenable`.',
            'Add a `redirect` that guards routes based on the notifier.',
            'Run the app and confirm sign-in changes which screen you see.',
          ],
          code: `// main.dart — boot + providers + router.
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'auth_notifier.dart';
import 'router.dart';
import 'services/auth_service.dart';
import 'services/firestore_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const TunMani CafeApp());
}

class TunMani CafeApp extends StatelessWidget {
  const TunMani CafeApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = AuthNotifier();
    return MultiProvider(
      providers: [
        Provider(create: (_) => AuthService()),
        Provider(create: (_) => FirestoreService()),
        ChangeNotifierProvider.value(value: auth),
      ],
      child: MaterialApp.router(
        title: 'TunMani Cafe',
        routerConfig: buildRouter(auth),   // from router.dart
      ),
    );
  }
}`,
          pitfalls: [
            '**runApp before Firebase init.** Crashes. Fix: await `Firebase.initializeApp()` first.',
            '**Providers placed below the router.** Routes cannot read them. Fix: MultiProvider wraps `MaterialApp.router`.',
            '**No `refreshListenable`.** Redirects do not re-run on sign-in. Fix: pass the notifier to the router.',
            '**Stuffing routes into `main.dart`.** It bloats. Fix: keep them in `router.dart`.',
            '**Creating the notifier inside `build` without keeping it stable.** It resets on rebuild. Fix: hold it once (or via provider) so its identity is stable.',
            '**Mixing `MaterialApp` and `MaterialApp.router`.** Only one works with go_router. Fix: use `MaterialApp.router` with `routerConfig`.',
          ],
          tryIt:
            'Create the three files: a minimal `auth_notifier.dart`, a `router.dart` exposing `buildRouter(auth)`, and a `main.dart` that boots Firebase and wires the MultiProvider. Run it and toggle sign-in to watch the guarded route switch.',
          takeaway: 'main.dart boots and wires, router.dart routes and guards, auth_notifier.dart flips the auth state.',
        },
      ],
    },
    {
      id: 'm1-s3',
      title: 'App Shell',
      topics: [
        {
          id: 'm1-t9',
          title: 'Firebase.initializeApp & MultiProvider setup',
          explain:
            'Boot Firebase in `main()`, then expose `AuthService`, `FirestoreService`, `PrintService`, and `AuthNotifier` to the whole app via `MultiProvider`.',
          analogy:
            'Opening TunMani Cafe for the day: first you switch on the mains (Firebase), then you put the day-staff at their stations — the cashier, the cook, the printer operator, the duty manager — so any waiter on the floor can call on them. `MultiProvider` is putting all those staff on duty in one place at the top of the app.',
          theory:
            '`main()` must `await Firebase.initializeApp()` before `runApp`, after calling `WidgetsFlutterBinding.ensureInitialized()`.\n\nThen you wrap the app in a **`MultiProvider`** that creates each shared object once: **`AuthService`** (login), **`FirestoreService`** (data), **`PrintService`** (receipts), and the **`AuthNotifier`** (`ChangeNotifierProvider`). Plain `Provider` is for services that do not need to notify; `ChangeNotifierProvider` is for ones that rebuild listeners.\n\nBecause these sit above the router, every screen can pull them with `context.read<FirestoreService>()`. This is **dependency injection** the Flutter way — no global singletons, fully testable.',
          whyItMatters:
            'This single setup block is what lets every screen in the TunMani Cafe app reach the database, printer, and auth state without passing them down manually through dozens of constructors. Correctly distinguishing `Provider` from `ChangeNotifierProvider` and placing them above the router is core Flutter architecture knowledge.',
          steps: [
            'Call `WidgetsFlutterBinding.ensureInitialized()` then `await Firebase.initializeApp()` in `main`.',
            'Create the `MultiProvider` at the top of your widget tree.',
            'Register `AuthService`, `FirestoreService`, `PrintService` with `Provider`.',
            'Register `AuthNotifier` with `ChangeNotifierProvider`.',
            'Place the `MaterialApp.router` as the `child`.',
            'In a screen, read a service with `context.read<FirestoreService>()`.',
            'In a screen, watch the notifier with `context.watch<AuthNotifier>()`.',
          ],
          code: `// MultiProvider holding all app-wide dependencies.
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'services/auth_service.dart';
import 'services/firestore_service.dart';
import 'services/print_service.dart';
import 'auth_notifier.dart';
import 'router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const TunMani CafeApp());
}

class TunMani CafeApp extends StatelessWidget {
  const TunMani CafeApp({super.key});

  @override
  Widget build(BuildContext context) {
    final authNotifier = AuthNotifier();
    return MultiProvider(
      providers: [
        Provider<AuthService>(create: (_) => AuthService()),
        Provider<FirestoreService>(create: (_) => FirestoreService()),
        Provider<PrintService>(create: (_) => PrintService()),
        ChangeNotifierProvider<AuthNotifier>.value(value: authNotifier),
      ],
      child: MaterialApp.router(
        routerConfig: buildRouter(authNotifier),
      ),
    );
  }
}`,
          pitfalls: [
            '**Using `Provider` for a ChangeNotifier.** Listeners never rebuild. Fix: use `ChangeNotifierProvider` for notifiers.',
            '**Creating services inside each screen.** Multiple instances, wasted connections. Fix: create once in MultiProvider.',
            '**Providers below `MaterialApp.router`.** Routes cannot see them. Fix: put MultiProvider above it.',
            '**`context.watch` in a callback.** Wrong and noisy. Fix: `read` in callbacks, `watch` in `build`.',
            '**Forgetting `ensureInitialized()`.** Async `main` crashes. Fix: call it first.',
            '**Heavy work in a provider `create`.** Slows startup. Fix: keep `create` cheap; lazy-load data later.',
          ],
          tryIt:
            'Build a `MultiProvider` with stub `AuthService`, `FirestoreService`, and `PrintService` classes plus a `ChangeNotifierProvider` for `AuthNotifier`. In a test screen, read one service and watch the notifier, and confirm both resolve without errors.',
          takeaway: 'Boot Firebase, then expose every service and the auth notifier once via MultiProvider above the router.',
        },
        {
          id: 'm1-t10',
          title: 'app_theme.dart: Material 3 with dark green & amber',
          explain:
            'Define one `ThemeData` (Material 3) with primary dark green `#1B5E20` and accent amber `#F57F17` so the whole app looks consistent.',
          analogy:
            'TunMani Cafe has a brand: dark green walls, amber signage, the same font on every board. A customer recognises it instantly. `app_theme.dart` is that brand sheet — define the colours once and every screen, button, and app bar wears the uniform automatically.',
          theory:
            '**Material 3** themes are built from a **`ColorScheme`**, usually via `ColorScheme.fromSeed(seedColor: ...)`, which derives a harmonious palette from one seed colour. The TunMani Cafe brand uses **primary dark green `#1B5E20`** and an **amber `#F57F17`** accent (set as `secondary`).\n\nYou create a single `ThemeData(useMaterial3: true, colorScheme: ...)` in `theme/app_theme.dart` and pass it to `MaterialApp.theme`. Component themes (`appBarTheme`, `elevatedButtonTheme`, `textTheme`) let you tune specifics once.\n\nScreens then read colours via `Theme.of(context).colorScheme` instead of hardcoding hex values, so a rebrand is a one-file change.',
          whyItMatters:
            'A consistent theme is the difference between an app that looks professional and one that looks like a student project. Centralising the brand in one `ThemeData` means the TunMani Cafe owner gets a polished, on-brand POS, and you can restyle the entire app from a single file — a skill every Flutter team expects.',
          steps: [
            'Create `theme/app_theme.dart` with a top-level `ThemeData buildTheme()`.',
            'Define the brand colours: green `0xFF1B5E20`, amber `0xFF F57F17`.',
            'Build a `ColorScheme.fromSeed(seedColor: green)` and override `secondary` with amber.',
            'Return `ThemeData(useMaterial3: true, colorScheme: scheme)`.',
            'Add an `appBarTheme` using the green background.',
            'Pass the theme into `MaterialApp.router(theme: buildTheme())`.',
            'In a screen, use `Theme.of(context).colorScheme.primary` instead of a hex literal.',
          ],
          code: `// theme/app_theme.dart — the TunMani Cafe Material 3 brand.
import 'package:flutter/material.dart';

const _green = Color(0xFF1B5E20);   // primary
const _amber = Color(0xFFF57F17);   // accent

ThemeData buildTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: _green,
    primary: _green,
    secondary: _amber,
    brightness: Brightness.light,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    appBarTheme: const AppBarTheme(
      backgroundColor: _green,
      foregroundColor: Colors.white,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: _amber,
        foregroundColor: Colors.black,
      ),
    ),
  );
}`,
          pitfalls: [
            '**Hardcoding hex colours in every widget.** A rebrand means editing dozens of files. Fix: read from the theme.',
            '**Forgetting `useMaterial3: true`.** You get the old Material 2 look. Fix: enable it.',
            '**Building the whole palette by hand.** Tedious and inconsistent. Fix: use `ColorScheme.fromSeed`.',
            '**Poor contrast (amber text on white).** Fails accessibility. Fix: pair amber with dark text.',
            '**Defining the theme inline in `main.dart`.** Clutters the entry point. Fix: keep it in `theme/app_theme.dart`.',
            '**Ignoring dark mode entirely.** Some users want it. Fix: optionally provide a `darkTheme` later.',
          ],
          tryIt:
            'Create `theme/app_theme.dart`, build the green+amber Material 3 theme, and pass it to `MaterialApp.router`. Add an `AppBar` and an `ElevatedButton` to a screen and confirm they pick up the brand colours without any hex literals in the screen.',
          takeaway: 'One ThemeData (green primary, amber accent, Material 3) brands every screen consistently.',
        },
        {
          id: 'm1-t11',
          title: 'go_router with auth guards & page transitions',
          explain:
            'Configure `go_router` so a `redirect` guards staff/admin routes by auth state, with smooth custom page transitions.',
          analogy:
            'The TunMani Cafe building has a public entrance (login), a staff-only counter, and an owner-only office. A guard at each inner door checks your badge and turns you away if you do not belong — and the doors slide open smoothly rather than slamming. `go_router`\'s redirect is the guard; custom transitions are the smooth doors.',
          theory:
            'A **`GoRouter`** has a `routes` list and a top-level **`redirect`** callback. The redirect runs before navigation and returns either `null` (proceed) or a path to send the user to instead — this is the **auth guard**. With `refreshListenable` set to the `AuthNotifier`, the guard re-runs the moment auth state changes.\n\nFor **page transitions**, you replace a route\'s `builder` with a **`pageBuilder`** that returns a `CustomTransitionPage`, letting you define a fade or slide. The TunMani Cafe app guards `/staff` and `/admin`, sends signed-out users to `/login`, and can route admins and staff to different home screens based on their role.',
          whyItMatters:
            'Route guarding is a security boundary: it is what stops a signed-out person from reaching the billing counter. Doing it declaratively in one `redirect` (rather than scattered checks in every screen) is robust and easy to audit. Smooth transitions are the polish that makes the app feel native — both are expected of a production POS.',
          steps: [
            'Build a `GoRouter` with `/login`, `/staff`, and `/admin` routes.',
            'Pass the `AuthNotifier` as `refreshListenable`.',
            'Write a `redirect` that sends signed-out users to `/login`.',
            'Send signed-in users away from `/login` to their home.',
            'Optionally branch staff vs admin based on a role flag.',
            'Replace a `builder` with a `pageBuilder` returning a `CustomTransitionPage` for a fade.',
            'Navigate with `context.go(\'/admin\')` and watch the guard and transition.',
          ],
          code: `// router.dart — guarded routes with a fade transition.
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'auth_notifier.dart';
import 'screens/shared/login_screen.dart';
import 'screens/staff/staff_home.dart';
import 'screens/admin/admin_home.dart';

GoRouter buildRouter(AuthNotifier auth) {
  return GoRouter(
    initialLocation: '/staff',
    refreshListenable: auth,
    redirect: (context, state) {
      final loggedIn = auth.isSignedIn;
      final atLogin = state.matchedLocation == '/login';
      if (!loggedIn && !atLogin) return '/login';          // guard
      if (loggedIn && atLogin) {
        return auth.isAdmin ? '/admin' : '/staff';          // role route
      }
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (c, s) => const LoginScreen()),
      GoRoute(path: '/staff', builder: (c, s) => const StaffHome()),
      GoRoute(
        path: '/admin',
        pageBuilder: (c, s) => CustomTransitionPage(
          key: s.pageKey,
          child: const AdminHome(),
          transitionsBuilder: (c, anim, sec, child) =>
              FadeTransition(opacity: anim, child: child),
        ),
      ),
    ],
  );
}`,
          pitfalls: [
            '**Auth checks inside each screen instead of the redirect.** Easy to miss one. Fix: guard centrally in `redirect`.',
            '**No `refreshListenable`.** Guard does not re-run after login. Fix: pass the notifier.',
            '**Redirect loops.** Sending login to login. Fix: always let the login route through when signed out.',
            '**Forgetting `key: state.pageKey` in CustomTransitionPage.** Animation glitches. Fix: pass the page key.',
            '**Mixing Navigator and go_router navigation.** Broken back stack. Fix: use `context.go`/`context.push` consistently.',
            '**Heavy work in the redirect.** Runs on every navigation. Fix: keep it to fast checks.',
          ],
          tryIt:
            'Add a `bool isAdmin` to `AuthNotifier` and make the redirect route admins to `/admin` and staff to `/staff` after login. Give `/admin` a fade transition via `CustomTransitionPage`. Toggle the flags and confirm both the guard and the animation work.',
          takeaway: 'A central redirect (with refreshListenable) guards routes; pageBuilder adds smooth transitions.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm1-p1',
      type: 'Project',
      title: 'Scaffold the TunMani Cafe App Skeleton + Theme',
      domain: 'Flutter / App Architecture',
      duration: '2.5 hours',
      description:
        'Set up the real project: add the core dependencies, create the lib/ folder structure, and build the Material 3 green+amber theme so every later module slots into a clean architecture.',
      tools: ['Flutter 3.x', 'Dart 3.x', 'pub.dev packages'],
      blueprint: {
        overview:
          'Take the fresh tunmani_billing project and turn it into a properly structured app: dependencies added, lib/ organised into models/services/screens/utils/theme, and an app_theme.dart implementing the brand colours, wired into a single MaterialApp.',
        functionalRequirements: [
          '**Dependencies.** Add provider, go_router, firebase_core, intl, uuid, shared_preferences via `flutter pub add`.',
          '**Folders.** Create models/, services/, screens/{shared,staff,admin}/, utils/, theme/ under lib/.',
          '**Theme.** A Material 3 theme with primary green #1B5E20 and accent amber #F57F17 in theme/app_theme.dart.',
          '**Wiring.** main.dart uses the theme and shows a placeholder home screen.',
          '**No analyzer errors.** `flutter analyze` is clean.',
        ],
        technicalImplementation: [
          '**buildTheme().** Uses `ColorScheme.fromSeed` with the green seed and amber secondary.',
          '**Placeholder screens.** Empty StatelessWidgets in screens/shared, staff, admin.',
          '**Service stubs.** Empty AuthService/FirestoreService/PrintService classes in services/.',
          '**utils/formatters.dart.** A `money(double)` helper using intl.',
          '**main.dart.** A single MaterialApp using `buildTheme()`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Add dependencies',
            outcome: 'pubspec.yaml updated with the core packages and resolved.',
            prompt:
              "I have a fresh Flutter project called tunmani_billing. Give me the exact terminal commands to add these dependencies with flutter pub add: provider, go_router, firebase_core, intl, uuid, shared_preferences. Then explain in one line what each package is for, and remind me to run flutter pub get.",
          },
          {
            step: 2,
            label: 'Create folder structure',
            outcome: 'lib/ organised into the standard architecture folders.',
            prompt:
              "Create this folder structure under lib/ for my Flutter app: models/, services/, screens/ with subfolders shared/ staff/ admin/, utils/, and theme/. In services/ add empty placeholder classes AuthService, FirestoreService, and PrintService (each in its own file). In screens/shared/ add a LoginScreen StatelessWidget, in screens/staff/ a StaffHome, and in screens/admin/ an AdminHome — each a simple Scaffold with a centered Text naming the screen. In utils/formatters.dart add a money(double) function using the intl package that formats Indian rupees. Show me each file.",
          },
          {
            step: 3,
            label: 'Build the theme & wire main.dart',
            outcome: 'A branded Material 3 app that runs and shows a placeholder home.',
            prompt:
              "Create lib/theme/app_theme.dart with a function buildTheme() returning a Material 3 ThemeData: use ColorScheme.fromSeed with seed color 0xFF1B5E20 (dark green) as primary and 0xFFF57F17 (amber) as secondary, plus an AppBarTheme using the green. Then rewrite lib/main.dart to a single MaterialApp (no router yet) that uses buildTheme() and sets home to StaffHome. Make sure flutter analyze passes and the app runs. Then tell me what to build in the next module.",
          },
        ],
      },
    },
    {
      id: 'm1-p2',
      type: 'Mini Project',
      title: 'Wire Provider + a Placeholder go_router',
      domain: 'Flutter / State & Routing',
      duration: '1.5 hours',
      description:
        'Add the app shell wiring: an AuthNotifier in a MultiProvider, and a go_router with login/staff/admin routes plus an auth-guard redirect — using a fake sign-in so you can test the flow before Firebase exists.',
      tools: ['Flutter 3.x', 'provider', 'go_router'],
      blueprint: {
        overview:
          'Connect provider and go_router into the skeleton from the previous project. Use an AuthNotifier with a fake signIn()/signOut() to drive an auth-guard redirect, so navigating between login, staff, and admin works end-to-end before any real Firebase auth.',
        functionalRequirements: [
          '**AuthNotifier.** A ChangeNotifier with isSignedIn and isAdmin flags and signIn/signOut methods.',
          '**MultiProvider.** Wraps the app and provides the AuthNotifier (and stub services).',
          '**Router.** A go_router with /login, /staff, /admin routes.',
          '**Guard.** A redirect that sends signed-out users to /login and routes by role after login.',
          '**Refresh.** The router uses the notifier as refreshListenable.',
        ],
        technicalImplementation: [
          '**buildRouter(AuthNotifier).** Returns a configured GoRouter.',
          '**MaterialApp.router.** Uses routerConfig from buildRouter.',
          '**Fake auth.** signIn() flips flags and calls notifyListeners().',
          '**Role branch.** isAdmin decides /admin vs /staff after login.',
          '**Buttons.** Login screen has Sign in as Staff / Sign in as Admin buttons.',
        ],
        prompts: [
          {
            step: 1,
            label: 'AuthNotifier + MultiProvider',
            outcome: 'A ChangeNotifier provided to the whole app.',
            prompt:
              "Add lib/auth_notifier.dart: a ChangeNotifier called AuthNotifier with bool isSignedIn (default false) and bool isAdmin (default false), plus methods signInAsStaff(), signInAsAdmin(), and signOut() that update the flags and call notifyListeners(). Then update lib/main.dart to wrap the app in a MultiProvider that provides the AuthNotifier via ChangeNotifierProvider (and Provider stubs for AuthService, FirestoreService, PrintService). Keep using buildTheme(). Show me both files.",
          },
          {
            step: 2,
            label: 'go_router with auth guard',
            outcome: 'Routes for login/staff/admin guarded by the notifier.',
            prompt:
              "Create lib/router.dart with a function buildRouter(AuthNotifier auth) returning a GoRouter. Routes: /login -> LoginScreen, /staff -> StaffHome, /admin -> AdminHome. Set refreshListenable to auth. Add a redirect: if not signed in and not already at /login, go to /login; if signed in and at /login, go to /admin when isAdmin else /staff; otherwise return null. Then change main.dart to use MaterialApp.router with routerConfig: buildRouter(auth). Make sure it compiles.",
          },
          {
            step: 3,
            label: 'Test the flow',
            outcome: 'Tappable login that routes by role and a working sign-out.',
            prompt:
              "Update LoginScreen to show two buttons: 'Sign in as Staff' (calls auth.signInAsStaff()) and 'Sign in as Admin' (calls auth.signInAsAdmin()), reading the notifier via context.read<AuthNotifier>(). Add a sign-out button to StaffHome and AdminHome that calls auth.signOut(). Confirm that signing in as admin lands on /admin, as staff on /staff, and signing out returns to /login automatically. Then tell me exactly what changes when I later swap the fake auth for Firebase.",
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm1-q1',
      q: 'What does `flutter pub add provider` do?',
      options: [
        'Deletes the provider package',
        'Adds provider to pubspec.yaml and downloads it',
        'Creates a new Flutter project',
        'Runs the app with provider',
      ],
      answer: 1,
    },
    {
      id: 'm1-q2',
      q: 'Which package provides the auth-guarded routing used in the TunMani Cafe app?',
      options: ['provider', 'go_router', 'intl', 'uuid'],
      answer: 1,
    },
    {
      id: 'm1-q3',
      q: 'In the recommended lib/ structure, where does a class that reads and writes Firestore belong?',
      options: ['models/', 'screens/', 'services/', 'theme/'],
      answer: 2,
    },
    {
      id: 'm1-q4',
      q: 'Why must `Firebase.initializeApp()` be awaited before `runApp`?',
      options: [
        'To make the app start faster',
        'Because Firebase services do not work until the connection is initialised',
        'Because runApp requires a Future',
        'To enable hot reload',
      ],
      answer: 1,
    },
    {
      id: 'm1-q5',
      q: 'In the TunMani Cafe theme, what are the primary and accent colors?',
      options: [
        'Blue primary, red accent',
        'Dark green (#1B5E20) primary, amber (#F57F17) accent',
        'Black primary, white accent',
        'Orange primary, teal accent',
      ],
      answer: 1,
    },
    {
      id: 'm1-q6',
      q: 'What makes a go_router `redirect` re-run automatically when the user signs in or out?',
      options: [
        'Calling setState in main.dart',
        'Setting the router\'s refreshListenable to the AuthNotifier',
        'Restarting the app',
        'Using a StatelessWidget',
      ],
      answer: 1,
    },
  ],
}
