// Module 2 — Firebase Setup & Google Sign-In Auth (TunMani Cafe Billing).
// Teaches the real app's authentication system end to end.

export const m2 = {
  id: 'm2',
  title: 'Firebase Setup & Google Sign-In Auth',
  hours: 8,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'Wire TunMani Cafe Billing to Firebase, enable Google Sign-In, and build a whitelist-gated AuthService with role-based routing so only approved staff and admins can ever open the till.',
  sections: [
    {
      id: 'm2-s1',
      title: 'Firebase Project Setup',
      topics: [
        {
          id: 'm2-t1',
          title: 'Create a Firebase Project & Register the Android App',
          explain:
            'Spin up a Firebase project in the console and register the TunMani Cafe Billing Android app against its package name so the cloud backend knows your app exists.',
          analogy:
            'Think of opening the TunMani Cafe restaurant on the Kundapura–Udupi highway. Before you serve a single neer dosa you register the business with the panchayat — you get a licence number, an address on record, and a slot in the municipal ledger. A Firebase project is that municipal ledger for your app, and registering the Android app with its `applicationId` (like `com.tunmani.billing`) is pinning your restaurant to a fixed address so the authorities recognise you. Without that registration the kitchen can cook, but the inspector (Firebase) will not let any official paperwork through.',
          theory:
            'A **Firebase project** is a container in Google Cloud that holds Authentication, Firestore, Storage and more for one logical app. You create it once at `console.firebase.google.com`.\n\nInside the project you **register one app per platform**. For TunMani Cafe Billing that is an **Android app**, identified by its **package name** (the `applicationId` in `android/app/build.gradle`, e.g. `com.tunmani.billing`). Firebase uses this string to match incoming requests to your project — it must be identical in the console and in Gradle, forever.\n\nRegistration produces a config file, **`google-services.json`**, that carries your project number, API keys and the OAuth client IDs. This file is not a secret in the password sense (it ships inside the APK) but it IS environment-specific: a debug build and a release build can need different SHA fingerprints registered against the same app.\n\nThe console is also where you later **enable products** (Authentication → Google provider) and **add SHA-1/SHA-256 fingerprints**. Everything in this module flows from this one project.',
          whyItMatters:
            'Every Flutter + Firebase job assumes you can stand up a project from scratch and explain the relationship between package name, config file and the cloud project. Getting the `applicationId` wrong is the single most common reason `Sign in failed` appears in beginner apps, and interviewers love asking why Google Sign-In returns `ApiException: 10`.',
          steps: [
            'Go to `console.firebase.google.com` and click **Add project**; name it `tunmani-billing`.',
            'Disable or accept Google Analytics (optional for a POS app) and finish creation.',
            'On the project overview, click the **Android** icon to register an app.',
            'Find your package name in `android/app/build.gradle` under `applicationId` and paste it exactly (e.g. `com.tunmani.billing`).',
            'Give it a friendly nickname like `TunMani Cafe Billing (Android)`.',
            'Download the generated **`google-services.json`** when prompted.',
            'Keep the console tab open — you will return to enable Auth and add SHA fingerprints.',
          ],
          code: `// android/app/build.gradle — the applicationId must match Firebase exactly.
android {
    namespace "com.tunmani.billing"
    defaultConfig {
        applicationId "com.tunmani.billing" // <-- paste THIS into the console
        minSdkVersion 23   // Firebase Auth + Google Sign-In need >= 21; 23 is safe
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}`,
          pitfalls: [
            '**Typo between `applicationId` and the console package name.** Auth silently fails with `ApiException: 10`. Fix: copy-paste, never retype.',
            '**Changing `applicationId` after launch.** Firebase treats it as a new app and orphans your users. Fix: lock it before your first real install.',
            '**`minSdkVersion` too low.** Google Sign-In needs at least 21. Fix: set `minSdkVersion 23` to be comfortably safe.',
            '**Treating the project name as the package name.** The display name is cosmetic; only the package name binds. Fix: never confuse the two.',
            '**Creating a second project to "start fresh".** You then split users across two backends. Fix: reuse one project; manage environments with build flavours later.',
            '**Forgetting to download `google-services.json`.** The build will not find Firebase. Fix: re-download any time from Project settings.',
          ],
          tryIt:
            'Create a real Firebase project named `tunmani-billing` and register an Android app with package name `com.tunmani.billing`. Download `google-services.json` but do not place it yet — the next topic explains exactly where it goes. Confirm the app appears under Project settings → Your apps.',
          takeaway:
            'One Firebase project, one Android app, one immutable package name — get this binding right and everything else clicks into place.',
        },
        {
          id: 'm2-t2',
          title: 'Drop in google-services.json & Wire the Gradle Plugin',
          explain:
            'Place `google-services.json` in the right folder and add the Google Services Gradle plugin so the build injects your Firebase config into the APK.',
          analogy:
            'The `google-services.json` is the laminated FSSAI certificate that must hang on the TunMani Cafe kitchen wall — not in a drawer, not in the office across the road, but in the exact spot the inspector looks. Put it in the wrong room (the wrong folder) and the inspection fails even though you own a valid certificate. The Gradle plugin is the inspector who reads that certificate at build time and stamps your APK as licensed.',
          theory:
            'The config file must live at **`android/app/google-services.json`** — note `app`, not the outer `android` folder. The build will not search elsewhere.\n\nTwo Gradle edits make it work. In the **project-level** `android/build.gradle` you declare the plugin dependency; in the **app-level** `android/app/build.gradle` you **apply** it. The plugin reads `google-services.json` at build time and generates resources (string resources holding your project number and OAuth client id) that the Firebase SDK reads at runtime.\n\nModern Flutter projects often use the **plugins DSL** (`id "com.google.gms.google-services"`), while older ones use `apply plugin:`. Either works as long as the version is compatible with your Android Gradle Plugin.\n\nThis file is environment-specific: it encodes your package name and the SHA fingerprints registered for it. If you later add a release SHA, you re-download a fresh `google-services.json`.',
          whyItMatters:
            'A correct Gradle wiring is the difference between an app that compiles and an app that throws `Default FirebaseApp is not initialized` at launch. Build-system questions ("where does google-services.json go, and what does the plugin do?") are standard in Flutter screening rounds.',
          steps: [
            'Move the downloaded file to `android/app/google-services.json` (inside `app`).',
            'Open `android/build.gradle` (project level) and add the classpath / plugin entry for `com.google.gms:google-services`.',
            'Open `android/app/build.gradle` and apply the `com.google.gms.google-services` plugin at the bottom or in the plugins block.',
            'Run `flutter clean` to clear stale build caches.',
            'Run `flutter pub get` then build once with `flutter run` to let Gradle pick up the plugin.',
            'Watch the build log for the `google-services` task running without warnings.',
          ],
          code: `// android/build.gradle (PROJECT level) — declare the plugin.
plugins {
    id "com.android.application" version "8.1.0" apply false
    id "com.google.gms.google-services" version "4.4.2" apply false
}

// android/app/build.gradle (APP level) — apply it.
plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
    id "com.google.gms.google-services" // <-- reads google-services.json
}`,
          pitfalls: [
            '**File in `android/` instead of `android/app/`.** Build cannot find it. Fix: it must sit beside `build.gradle` inside `app`.',
            '**Plugin declared but never applied.** No resources are generated. Fix: apply it in the app-level file too.',
            '**Skipping `flutter clean` after adding the plugin.** Stale caches hide the change. Fix: clean, then rebuild.',
            '**Plugin version incompatible with the Android Gradle Plugin.** Build crashes with a version error. Fix: match versions from the FlutterFire docs.',
            '**Committing `google-services.json` carelessly across environments.** Debug and release configs get mixed up. Fix: keep one source of truth per package name.',
            '**Editing the wrong `build.gradle`.** There are two; project-level declares, app-level applies. Fix: read the comment header before editing.',
          ],
          tryIt:
            'Place `google-services.json` under `android/app/`, add both Gradle entries, run `flutter clean && flutter run`, and confirm the build log shows the `processDebugGoogleServices` task succeeding. If the app crashes on launch, the next topic (initialize) will fix it.',
          takeaway:
            'Right folder, plugin declared and applied — Gradle injects Firebase into the APK so the SDK can find it at runtime.',
        },
        {
          id: 'm2-t3',
          title: 'FlutterFire CLI & firebase_options.dart',
          explain:
            'Use the FlutterFire CLI to generate `firebase_options.dart`, a typed, cross-platform config that replaces hand-copied keys.',
          analogy:
            'Instead of every waiter at TunMani Cafe memorising the kitchen radio frequency, the manager prints one laminated card listing every channel for every counter — dosa station, fish-thali station, billing. The FlutterFire CLI prints that card for you as `firebase_options.dart`: one generated file with the correct settings for Android, iOS and web, so you never hand-copy an API key wrong again.',
          theory:
            'The **FlutterFire CLI** (`flutterfire configure`) talks to your Firebase project and **generates `lib/firebase_options.dart`** containing a `DefaultFirebaseOptions` class with per-platform `FirebaseOptions`. This is the modern, recommended way to configure Firebase in Flutter — it removes the guesswork of copying values out of `google-services.json` by hand.\n\nYou install two tools: the **Firebase CLI** (`npm i -g firebase-tools`, then `firebase login`) and the **FlutterFire CLI** (`dart pub global activate flutterfire_cli`). Running `flutterfire configure` lets you pick the project and platforms; it writes `firebase_options.dart` and ensures `google-services.json` is in place.\n\nIn code you import this file and pass `DefaultFirebaseOptions.currentPlatform` to `Firebase.initializeApp`. The `currentPlatform` getter switches on the running platform and returns the matching options, so one call works everywhere.\n\nRegenerate the file whenever you add a platform or change project — never edit it by hand.',
          whyItMatters:
            'Generated config is now the expected setup in any serious Flutter + Firebase codebase; interviewers will ask why `firebase_options.dart` exists and how `currentPlatform` resolves. It also eliminates an entire class of "wrong API key" bugs that cost juniors hours.',
          steps: [
            'Install the Firebase CLI: `npm install -g firebase-tools`, then `firebase login`.',
            'Activate FlutterFire: `dart pub global activate flutterfire_cli`.',
            'Ensure `~/.pub-cache/bin` (or the Windows equivalent) is on your PATH so `flutterfire` resolves.',
            'From the project root run `flutterfire configure`.',
            'Select the `tunmani-billing` project and tick the Android platform.',
            'Confirm `lib/firebase_options.dart` is generated and `google-services.json` is in `android/app/`.',
            'Open the generated file and read the `currentPlatform` getter to see how it switches platforms.',
          ],
          code: `// lib/firebase_options.dart — GENERATED by flutterfire configure. Do not edit.
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      default:
        throw UnsupportedError('TunMani Cafe Billing only ships for Android.');
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIza...redacted',
    appId: '1:1234567890:android:abc123',
    messagingSenderId: '1234567890',
    projectId: 'tunmani-billing',
    storageBucket: 'tunmani-billing.appspot.com',
  );
}`,
          pitfalls: [
            '**Hand-editing `firebase_options.dart`.** Your edits vanish on regeneration. Fix: change config in the console, then re-run `flutterfire configure`.',
            '**`flutterfire` command not found.** PATH is missing the pub global bin. Fix: add `~/.pub-cache/bin` to PATH and restart the terminal.',
            '**Not logged into the Firebase CLI.** `configure` cannot list projects. Fix: run `firebase login` first.',
            '**Selecting the wrong project.** Generated keys point elsewhere. Fix: re-run and pick `tunmani-billing`.',
            '**Forgetting to re-run after adding a platform.** `currentPlatform` throws for the new platform. Fix: regenerate.',
            '**Committing different versions per developer.** Causes confusing key drift. Fix: treat it as generated and regenerate from one project.',
          ],
          tryIt:
            'Run `flutterfire configure`, select `tunmani-billing`, and confirm `lib/firebase_options.dart` exists with an `android` entry. Open it and trace how `currentPlatform` would throw on web — proof the file is platform-aware.',
          takeaway:
            'Generate, never hand-copy: `firebase_options.dart` gives you one typed, platform-switching source of truth for Firebase config.',
        },
        {
          id: 'm2-t4',
          title: 'Firebase.initializeApp in main.dart',
          explain:
            'Initialize Firebase before the app runs by awaiting `Firebase.initializeApp` in an async `main`, guarded by `WidgetsFlutterBinding.ensureInitialized`.',
          analogy:
            'TunMani Cafe never opens the shutter before the gas is lit and the rice is on the boil. If a customer walks in at 6 AM and the kitchen has not warmed up, you serve nothing but apologies. `Firebase.initializeApp` is lighting the gas: you `await` it before `runApp` so that by the time the first screen renders, Auth and Firestore are already hot and ready to take orders.',
          theory:
            '`main` must be **`async`** and you must call **`WidgetsFlutterBinding.ensureInitialized()`** before any plugin work, because Firebase uses platform channels that need the binding ready.\n\nThen you **`await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform)`**. Awaiting matters: if you call `runApp` before initialization completes, any early Firestore or Auth call throws `No Firebase App "[DEFAULT]" has been created`.\n\nThis is also the natural place for one-time global setup: locking orientation, setting up error handlers, or reading a cached user. Keep it lean — heavy work here delays first paint.\n\nThe pattern is identical across every Firebase Flutter app, which is why it is muscle memory for working developers.',
          whyItMatters:
            'The "Firebase not initialized" crash is the most-Googled Flutter+Firebase error, and the fix (async main + ensureInitialized + await) is a guaranteed interview talking point. Doing it correctly also lets you safely read the current user before the first frame.',
          steps: [
            'Open `lib/main.dart` and make `main` `async`.',
            'Call `WidgetsFlutterBinding.ensureInitialized()` as the first line.',
            'Import `firebase_core` and your generated `firebase_options.dart`.',
            'Await `Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform)`.',
            'Only after the await, call `runApp(const TunMani CafeApp())`.',
            'Run the app and confirm no initialization exception appears in the console.',
          ],
          code: `// lib/main.dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'app.dart';

Future<void> main() async {
  // Plugins need the binding ready before any platform-channel call.
  WidgetsFlutterBinding.ensureInitialized();

  // Light the gas: Firebase must be hot before the first screen renders.
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const TunMani CafeApp());
}`,
          pitfalls: [
            '**Forgetting `ensureInitialized()`.** Platform channels are not ready; init throws. Fix: make it the first line of `main`.',
            '**Not awaiting `initializeApp`.** Early Auth/Firestore calls crash. Fix: `await` before `runApp`.',
            '**Keeping `main` synchronous.** You cannot `await`. Fix: declare `Future<void> main() async`.',
            '**Heavy work inside `main`.** Delays first paint and feels like a frozen launch. Fix: defer non-critical setup to after first frame.',
            '**Calling `initializeApp` twice.** Throws `[core/duplicate-app]`. Fix: call it exactly once.',
            '**Importing the wrong `firebase_options.dart` path.** Build fails. Fix: import relative to `lib`.',
          ],
          tryIt:
            'Rewrite your `main` to be async with `ensureInitialized` and an awaited `initializeApp`. Then temporarily move `runApp` ABOVE the await and observe the `No Firebase App` crash, proving why order matters. Restore the correct order.',
          takeaway:
            'Async `main`, ensure the binding, await `initializeApp`, then `runApp` — Firebase must be hot before the first frame.',
        },
        {
          id: 'm2-t5',
          title: 'Enable Google Sign-In & Register SHA-1 Fingerprints',
          explain:
            'Turn on the Google provider in Firebase Authentication and register your debug (and release) SHA-1/SHA-256 fingerprints so Google trusts your signing key.',
          analogy:
            'At TunMani Cafe, only staff whose thumbprint is on file can open the cash drawer. Google Sign-In works the same way: your app is signed with a key, and its **SHA-1 fingerprint** is that thumbprint. You must register the thumbprint with Firebase so Google recognises the build asking to sign people in. A debug build and a release build have different thumbprints — register both, or the Play Store version mysteriously refuses to log anyone in.',
          theory:
            'In the console, **Authentication → Sign-in method → Google → Enable**, and set a project support email. This switches on the Google identity provider and provisions an OAuth client.\n\nGoogle Sign-In on Android verifies the **signing certificate** of the requesting app. You must register its **SHA-1** (and ideally **SHA-256**) fingerprint under Project settings → Your apps → Android → Add fingerprint.\n\nGet the debug fingerprint with the **`signingReport`** Gradle task (`./gradlew signingReport`) or `keytool` against `~/.android/debug.keystore`. The release fingerprint comes from your release keystore — or, if you use **Play App Signing**, from the Play Console (Google re-signs your app, so the Play-provided SHA-1 must be registered too).\n\nAfter adding fingerprints, **re-download `google-services.json`** so the new OAuth client id is included. The classic `ApiException: 10` ("DEVELOPER_ERROR") almost always means a missing or wrong SHA-1.',
          whyItMatters:
            'Missing SHA-1 is THE reason Google Sign-In works in debug but breaks in release, and explaining `ApiException: 10` is a rite of passage for Android/Flutter developers. Knowing the Play App Signing wrinkle separates juniors from people who have actually shipped.',
          steps: [
            'In the console, go to **Authentication → Sign-in method** and enable **Google**; set a support email.',
            'In a terminal, run `cd android && ./gradlew signingReport` (use `gradlew.bat` on Windows).',
            'Copy the **SHA1** value from the `debug` variant.',
            'In Firebase Project settings → Your apps → Android, click **Add fingerprint** and paste the SHA-1.',
            'Optionally add the SHA-256 from the same report.',
            'For release, add the SHA-1 from your release keystore or Play App Signing.',
            'Re-download `google-services.json` and replace the one in `android/app/`.',
          ],
          code: `# Get the debug SHA-1 (run from the project's android/ folder)
cd android
./gradlew signingReport      # Windows: gradlew.bat signingReport

# Example output — copy the SHA1 line of the debug variant:
# Variant: debug
# Config: debug
# Store: C:\\Users\\you\\.android\\debug.keystore
# SHA1: AB:CD:12:34:...:EF   <-- paste THIS into Firebase

# Alternative using keytool directly:
keytool -list -v -keystore ~/.android/debug.keystore \\
  -alias androiddebugkey -storepass android -keypass android`,
          pitfalls: [
            '**No SHA-1 registered.** Google Sign-In throws `ApiException: 10`. Fix: add the debug SHA-1 and re-download config.',
            '**Only the debug fingerprint registered.** Release builds fail to sign in. Fix: add the release / Play App Signing SHA-1 too.',
            '**Not re-downloading `google-services.json` after adding a SHA.** The new OAuth client id is missing. Fix: download the fresh file.',
            '**Provider not enabled.** Sign-in returns an immediate error. Fix: enable Google under Sign-in method.',
            '**Wrong keystore.** Pasting a stale SHA from another machine. Fix: run `signingReport` on the machine that builds.',
            '**Forgetting the support email.** The console blocks enabling Google. Fix: set a project support email.',
          ],
          tryIt:
            'Enable the Google provider, run `./gradlew signingReport`, register your debug SHA-1, and re-download `google-services.json`. You now have everything the AuthService in the next section needs to actually sign a user in.',
          takeaway:
            'Enable Google, register your SHA fingerprints, re-download the config — no thumbprint, no sign-in.',
        },
      ],
    },
    {
      id: 'm2-s2',
      title: 'Authentication Service',
      topics: [
        {
          id: 'm2-t6',
          title: 'The signInWithGoogle Flow',
          explain:
            'Build `signInWithGoogle()` in `services/auth_service.dart`: sign out any old Google session, show the account picker, exchange the Google credential for a Firebase credential, and sign in.',
          analogy:
            'When a new shift starts at TunMani Cafe, the previous cashier logs out completely before the next one taps in — otherwise the till still thinks the morning cashier is on duty. `signInWithGoogle` does the same: it first signs out the cached Google account so the picker always appears fresh, lets the user choose, then hands the chosen identity to Firebase Auth like handing the till key to the verified cashier.',
          theory:
            'The flow has a deliberate order. First **sign out the cached Google session** (`GoogleSignIn().signOut()`) so the **account chooser always appears** — without this, the device silently reuses the last account, which is wrong on a shared POS terminal.\n\nThen call **`GoogleSignIn().signIn()`**, which returns a `GoogleSignInAccount?` (null if the user dismisses the chooser). From it you fetch **`authentication`** to get the `idToken` and `accessToken`.\n\nYou wrap those in a **`GoogleAuthProvider.credential(...)`** and pass it to **`FirebaseAuth.instance.signInWithCredential(credential)`**, which returns a `UserCredential` containing the Firebase `User` (with `email`, `uid`).\n\nAt this point the user is authenticated with Google and Firebase — but in TunMani Cafe they are **not yet authorised**. The next topics add the whitelist check, bootstrap admins, and active-flag check before we ever return an `AppUser`.',
          whyItMatters:
            'This token-exchange dance is the canonical OAuth-to-Firebase pattern and a frequent live-coding interview task. The "sign out first for a fresh picker" detail is exactly the kind of real-world nuance that distinguishes shipped apps from tutorials, especially on shared hardware like a restaurant till.',
          steps: [
            'Create `lib/services/auth_service.dart` and add `firebase_auth` and `google_sign_in` imports.',
            'Instantiate `final _auth = FirebaseAuth.instance;` and `final _google = GoogleSignIn();`.',
            'In `signInWithGoogle()`, first `await _google.signOut()` to force a fresh chooser.',
            'Call `final account = await _google.signIn();` and return early if it is null (user cancelled).',
            'Fetch `final auth = await account.authentication;`.',
            'Build `GoogleAuthProvider.credential(idToken: auth.idToken, accessToken: auth.accessToken)`.',
            'Call `await _auth.signInWithCredential(credential)` and read `userCredential.user`.',
          ],
          code: `// lib/services/auth_service.dart (excerpt — the raw Google->Firebase exchange)
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _google = GoogleSignIn();

  /// Returns the signed-in Firebase [User], or null if the user cancelled.
  Future<User?> _googleToFirebase() async {
    // 1. Force a fresh account picker on this shared till.
    await _google.signOut();

    // 2. Show the chooser; null means the user dismissed it.
    final GoogleSignInAccount? account = await _google.signIn();
    if (account == null) return null;

    // 3. Get Google tokens.
    final GoogleSignInAuthentication auth = await account.authentication;

    // 4. Wrap them as a Firebase credential and sign in.
    final credential = GoogleAuthProvider.credential(
      idToken: auth.idToken,
      accessToken: auth.accessToken,
    );
    final result = await _auth.signInWithCredential(credential);
    return result.user;
  }
}`,
          pitfalls: [
            '**Not signing out first.** The picker is skipped and the wrong cashier stays logged in on a shared till. Fix: `await _google.signOut()` before `signIn()`.',
            '**Ignoring the null return.** Treating a cancelled sign-in as success crashes downstream. Fix: return early when `account == null`.',
            '**Forgetting `await` on `authentication`.** You read null tokens. Fix: await the `authentication` getter.',
            '**Not handling `FirebaseAuthException`.** Network errors bubble up raw. Fix: wrap in try/catch and surface a friendly message.',
            '**Returning the Firebase user as the app user.** A Firebase user is authenticated, not authorised. Fix: still run the whitelist check (next topic).',
            '**Hardcoding scopes you do not need.** Extra OAuth scopes trigger consent screens. Fix: keep default scopes for email sign-in.',
          ],
          tryIt:
            'Implement `_googleToFirebase()` exactly as above and call it from a temporary debug button. Print `user?.email`. Cancel the picker once to confirm you get `null` and no crash. You now have a real Firebase identity to authorise in the next topic.',
          takeaway:
            'Sign out, pick, exchange tokens, sign in — that four-step dance turns a Google account into a Firebase user.',
        },
        {
          id: 'm2-t7',
          title: 'Whitelist Validation against users/{email}',
          explain:
            'After Firebase sign-in, look up `users/{email}` in Firestore and reject anyone not pre-added by the owner — TunMani Cafe is invite-only.',
          analogy:
            'Anyone can walk up to the TunMani Cafe counter, but only staff whose names the owner wrote in the duty register may step behind it. Google can prove "this really is Anjali\'s Gmail", but the duty register — the `users` collection in Firestore — decides whether Anjali is allowed to run the till at all. No entry in the register, no apron.',
          theory:
            'The **whitelist** lives in Firestore at **`users/{email}`**, where the document id is the **lowercased email**. The owner pre-creates a doc for each allowed staff member or admin.\n\nAfter `_googleToFirebase()` returns a Firebase `User`, you read `FirebaseFirestore.instance.collection("users").doc(email.toLowerCase()).get()`. If the document **does not exist**, the user is authenticated but **not authorised** — you immediately `signOut()` of both Firebase and Google and surface a clear "not allowed" message.\n\nUsing the **email as the doc id** (lowercased) makes the lookup an O(1) `doc(...).get()` instead of a query, and guarantees one document per person. Lowercasing avoids `Anjali@` vs `anjali@` duplicates.\n\nOnly if the doc exists do you proceed to parse it into an `AppUser`. This single check is the backbone of the app\'s security model.',
          whyItMatters:
            'Whitelisting is a real authorisation pattern (authentication proves identity, authorisation grants access) and a great interview answer to "how do you restrict an app to specific users without a custom backend?". For a POS handling cash, blocking unknown Google accounts is non-negotiable.',
          steps: [
            'After getting the Firebase user, read `final email = user.email!.toLowerCase();`.',
            'Fetch `final snap = await _db.collection("users").doc(email).get();`.',
            'If `!snap.exists`, call `await signOut()` and throw or return a "not allowed" result.',
            'If it exists, read `snap.data()!` into an `AppUser.fromMap`.',
            'Return the `AppUser` to the caller as the authorised app identity.',
            'Test by signing in with a Gmail that has no `users` doc and confirm rejection.',
          ],
          code: `// lib/services/auth_service.dart (excerpt — whitelist gate)
final FirebaseFirestore _db = FirebaseFirestore.instance;

Future<AppUser> signInWithGoogle() async {
  final user = await _googleToFirebase();
  if (user == null) {
    throw const AuthException('Sign-in cancelled.');
  }

  final email = user.email!.toLowerCase();
  final ref = _db.collection('users').doc(email);
  final snap = await ref.get();

  // Not on the duty register -> kick them back out immediately.
  if (!snap.exists) {
    await signOut();
    throw AuthException('$email is not authorised for TunMani Cafe Billing.');
  }

  return AppUser.fromMap(snap.data()!);
}`,
          pitfalls: [
            '**Not lowercasing the email.** `Anjali@` and `anjali@` become two identities. Fix: always `email.toLowerCase()` for the doc id.',
            '**Leaving the user signed in after a failed whitelist check.** They linger half-authorised. Fix: `signOut()` before throwing.',
            '**Using a query instead of `doc(email)`.** Slower and allows duplicates. Fix: email as doc id, single `get()`.',
            '**Assuming `user.email` is non-null.** Some providers omit it. Fix: guard it; Google always provides email but null-check anyway.',
            '**Relying only on client checks.** A determined attacker bypasses the app. Fix: back it with Firestore security rules (covered later).',
            '**Forgetting the message detail.** A vague error confuses staff. Fix: include the email and a "contact the owner" hint.',
          ],
          tryIt:
            'Add the whitelist check to `signInWithGoogle`. Create one `users/{your-email}` doc by hand in the console, sign in successfully, then sign in with a second Gmail that has no doc and confirm you are bounced out with a clear message.',
          takeaway:
            'Authentication proves who you are; the `users/{email}` whitelist decides whether TunMani Cafe lets you in.',
        },
        {
          id: 'm2-t8',
          title: 'Bootstrap Admins on First Login',
          explain:
            'Hardcode a small set of owner emails so that, on their very first sign-in, an admin `users` doc is auto-created — solving the chicken-and-egg of "who adds the first admin?".',
          analogy:
            'When TunMani Cafe first opens, the duty register is blank — but the owner clearly runs the place. So the rule is: if the person signing in is one of the named founders, write them into the register as an admin automatically. After that, the founder manages everyone else from inside the app. Bootstrap admins are those founders printed on the very first page of the register.',
          theory:
            'There is a **chicken-and-egg problem**: the whitelist blocks anyone without a `users` doc, but if the collection is empty nobody can sign in to create the first admin.\n\nThe fix is a **hardcoded list of bootstrap admin emails** inside `AuthService`. During sign-in, if the `users/{email}` doc is **missing** but the email is in this constant list, you **auto-create the doc** with `role: admin` and `active: true` instead of rejecting.\n\nRoles are an **enum, `UserRole { admin, staff }`**. Bootstrap users are always created as `admin`. Everyone else must be added by an existing admin from inside the app.\n\nKeep the list tiny (one or two real owner emails) and treat it as the seed, not the ongoing source of truth. Once the first admin exists, normal management flows take over.',
          whyItMatters:
            'Every whitelist system needs a bootstrap path, and "how does the first admin get created?" is a sharp design question interviewers use to probe whether you have shipped a real auth system. Getting it wrong locks you out of your own app.',
          steps: [
            'Add `static const _bootstrapAdmins = {"owner@tunmani.com"};` to `AuthService`.',
            'In `signInWithGoogle`, when the doc is missing, check `if (_bootstrapAdmins.contains(email))`.',
            'If it matches, build an admin `AppUser` and write it with `ref.set(appUser.toMap())`.',
            'Otherwise, run the normal rejection path from the previous topic.',
            'Use the `UserRole.admin` enum value, not a magic string, when constructing the user.',
            'Sign in once as the bootstrap admin and confirm the doc appears in Firestore.',
          ],
          code: `// lib/services/auth_service.dart (excerpt — bootstrap admins)
class AuthService {
  // Seed admins. Keep this tiny; everyone else is added from inside the app.
  static const Set<String> _bootstrapAdmins = {
    'owner@tunmani.com',
  };

  Future<AppUser> signInWithGoogle() async {
    final user = await _googleToFirebase();
    if (user == null) throw const AuthException('Sign-in cancelled.');

    final email = user.email!.toLowerCase();
    final ref = _db.collection('users').doc(email);
    final snap = await ref.get();

    if (!snap.exists) {
      if (_bootstrapAdmins.contains(email)) {
        // Auto-create the very first admin so we are never locked out.
        final admin = AppUser(
          uid: user.uid,
          name: user.displayName ?? email,
          email: email,
          role: UserRole.admin,
          active: true,
        );
        await ref.set(admin.toMap());
        return admin;
      }
      await signOut();
      throw AuthException('$email is not authorised.');
    }
    return AppUser.fromMap(snap.data()!);
  }
}`,
          pitfalls: [
            '**Bootstrapping with a typo\'d email.** You can never become admin. Fix: double-check the constant against the exact Gmail you sign in with.',
            '**Leaving a large bootstrap list in production.** Anyone you forget to remove is silently admin. Fix: keep it to one or two seed emails.',
            '**Creating the doc as staff by mistake.** No one can manage users. Fix: bootstrap users must be `UserRole.admin`.',
            '**Using a string role instead of the enum.** Typos like `"adimn"` slip through. Fix: use `UserRole.admin`.',
            '**Not lowercasing in the contains check.** Mismatch means no bootstrap. Fix: compare lowercased emails.',
            '**Treating bootstrap as the permanent admin source.** It is only a seed. Fix: manage users in-app after the first login.',
          ],
          tryIt:
            'Add your own Gmail to `_bootstrapAdmins`, clear the `users` collection, then sign in. Confirm an admin doc is created automatically. Remove your email from the constant afterwards to prove the in-app management path now works.',
          takeaway:
            'A tiny hardcoded admin seed solves the empty-whitelist chicken-and-egg without ever locking the owner out.',
        },
        {
          id: 'm2-t9',
          title: 'Active-Flag Check & currentAppUser()',
          explain:
            'Honour the `active` flag so a deactivated user is signed out on the next read, and expose `currentAppUser()` to re-fetch the authorised user on app start.',
          analogy:
            'A TunMani Cafe waiter who quits keeps his name in the old register, but the owner strikes a line through it — `active: false`. Next time he tries to badge in, the gate reads the struck-through entry and turns him away even though Google still says it is him. `currentAppUser()` is the gate re-reading the register every morning to confirm whoever is holding the till key is still on active duty.',
          theory:
            'Each `users` doc carries an **`active` boolean**. Setting it to `false` is a **soft deactivation**: the document still exists (preserving history) but the user is no longer allowed in.\n\nDuring sign-in and inside **`currentAppUser()`**, after reading the doc you check `if (!appUser.active) { await signOut(); throw ... }`. Because the app re-reads the doc on launch via `currentAppUser()`, **deactivation takes effect on the next read** — the user is forced out without you having to revoke tokens.\n\n`currentAppUser()` is called at startup: if `FirebaseAuth.instance.currentUser` is non-null, fetch its `users/{email}` doc and re-run the whitelist + active checks, returning the `AppUser` or null. This drives the router\'s decision of where to send the user.\n\nThis pattern gives the owner an instant "fire" switch from the admin screen without any server-side session management.',
          whyItMatters:
            'Soft-delete plus a re-validated session is the standard way to revoke access without a custom auth server, and "how do you kick a user out without deleting their account?" is a common system-design question. For a cash-handling app, instant deactivation is a real business requirement.',
          steps: [
            'Add `final bool active` to `AppUser` and parse it in `fromMap`.',
            'In `signInWithGoogle`, after building the `AppUser`, check `if (!user.active)` and sign out.',
            'Implement `currentAppUser()` that reads `_auth.currentUser` and returns null if signed out.',
            'If signed in, fetch the `users/{email}` doc and re-run whitelist + active checks.',
            'Return the parsed `AppUser`, or null (after signing out) if not allowed.',
            'Call `currentAppUser()` on app start to decide initial routing.',
          ],
          code: `// lib/services/auth_service.dart (excerpt — active flag + session restore)
/// Re-validates the persisted Firebase session against the whitelist.
/// Returns null (and signs out) if the user is gone or deactivated.
Future<AppUser?> currentAppUser() async {
  final user = _auth.currentUser;
  if (user == null) return null;

  final email = user.email!.toLowerCase();
  final snap = await _db.collection('users').doc(email).get();
  if (!snap.exists) {
    await signOut();
    return null;
  }

  final appUser = AppUser.fromMap(snap.data()!);
  if (!appUser.active) {
    // Owner struck them off the register -> force sign-out on next read.
    await signOut();
    return null;
  }
  return appUser;
}`,
          pitfalls: [
            '**Hard-deleting users instead of `active: false`.** You lose audit history and may orphan past bills. Fix: soft-deactivate.',
            '**Not re-checking `active` on launch.** A fired staffer stays in until they manually log out. Fix: re-validate in `currentAppUser()`.',
            '**Returning the user without signing out on deactivation.** They keep a live session. Fix: `signOut()` before returning null.',
            '**Assuming `currentUser` means authorised.** It only means a Firebase session exists. Fix: always re-fetch the Firestore doc.',
            '**Defaulting `active` to false in `fromMap`.** Existing users get locked out. Fix: default missing `active` to true, or always write it.',
            '**Forgetting to await the Firestore read.** You branch on a Future. Fix: await the `get()`.',
          ],
          tryIt:
            'Sign in as a staff user, then in the console flip their `active` field to `false`. Restart the app and confirm `currentAppUser()` signs them out and returns null. Flip it back and confirm they return to the till.',
          takeaway:
            '`active: false` plus a re-validating `currentAppUser()` gives the owner an instant, history-preserving "off" switch.',
        },
        {
          id: 'm2-t10',
          title: 'signOut() and the AppUser Model',
          explain:
            'Round out the service with a `signOut()` that clears both Firebase and Google sessions, and define the `AppUser` model with a `UserRole` enum and `isAdmin` getter.',
          analogy:
            'At closing time the TunMani Cafe cashier hands back the till key AND logs out of the tablet — two locks, both turned. Sign out only one and the next person inherits a half-open session. `signOut()` turns both locks: Firebase and Google. The `AppUser` is the laminated staff badge that says who they are and whether the admin stripe is printed on it.',
          theory:
            '**`signOut()`** must clear **both** sessions: `await _auth.signOut()` for Firebase and `await _google.signOut()` for Google. Skipping the Google one leaves the cached account so the next picker is pre-filled with the previous user — wrong on a shared till.\n\nThe **`AppUser`** model holds `uid`, `name`, `email`, `role` (a `UserRole` enum of `admin`/`staff`), and `active`. A convenience **`isAdmin` getter** returns `role == UserRole.admin`, so UI and routing code reads naturally (`if (user.isAdmin) ...`).\n\nEnums serialize as their **name string** in Firestore: `role.name` writes `"admin"`, and `UserRole.values.byName(map["role"])` reads it back. This keeps Firestore human-readable and avoids brittle integer indices.\n\nWith `signInWithGoogle`, `currentAppUser`, and `signOut` complete, `AuthService` is a clean, testable seam the rest of the app depends on.',
          whyItMatters:
            'Clean sign-out across providers is a real bug source on shared devices, and enum (de)serialization is a daily Firestore task. The `isAdmin` getter is the kind of small abstraction that keeps role checks consistent — interviewers notice when role logic is scattered as raw string comparisons.',
          steps: [
            'Add `signOut()` that awaits both `_auth.signOut()` and `_google.signOut()`.',
            'Define `enum UserRole { admin, staff }`.',
            'Create `AppUser` with `uid`, `name`, `email`, `role`, `active` final fields.',
            'Add an `isAdmin` getter returning `role == UserRole.admin`.',
            'Write `toMap()` using `role.name` and `fromMap` using `UserRole.values.byName(...)`.',
            'Confirm a round-trip: `AppUser.fromMap(user.toMap())` equals the original.',
          ],
          code: `// lib/models/app_user.dart
enum UserRole { admin, staff }

class AppUser {
  final String uid;
  final String name;
  final String email;   // lowercased; also the users/{email} doc id
  final UserRole role;
  final bool active;

  const AppUser({
    required this.uid,
    required this.name,
    required this.email,
    required this.role,
    required this.active,
  });

  bool get isAdmin => role == UserRole.admin;

  factory AppUser.fromMap(Map<String, dynamic> m) => AppUser(
        uid: m['uid'] as String? ?? '',
        name: m['name'] as String? ?? '',
        email: (m['email'] as String).toLowerCase(),
        role: UserRole.values.byName(m['role'] as String? ?? 'staff'),
        active: m['active'] as bool? ?? true,
      );

  Map<String, dynamic> toMap() => {
        'uid': uid,
        'name': name,
        'email': email,
        'role': role.name,     // "admin" or "staff"
        'active': active,
      };
}

// lib/services/auth_service.dart (excerpt)
Future<void> signOut() async {
  await _auth.signOut();   // clear Firebase session
  await _google.signOut(); // clear cached Google account (shared till!)
}`,
          pitfalls: [
            '**Only signing out of Firebase.** The Google picker stays pre-filled with the last user. Fix: sign out of both.',
            '**Serializing the enum by `index`.** Reordering the enum corrupts old data. Fix: use `role.name` / `byName`.',
            '**Comparing raw strings for admin checks everywhere.** Inconsistent and typo-prone. Fix: use the `isAdmin` getter.',
            '**Not lowercasing email in `fromMap`.** Doc-id lookups drift. Fix: lowercase on parse.',
            '**Defaulting an unknown role to admin.** A data glitch grants power. Fix: default to `staff`.',
            '**Forgetting `active` in `toMap`.** The field disappears and the active-check breaks. Fix: always write it.',
          ],
          tryIt:
            'Finish `AuthService` with `signOut()`, then build the `AppUser` model with the `UserRole` enum and `isAdmin`. Write a tiny test that round-trips `AppUser.fromMap(admin.toMap())` and asserts `isAdmin` is true. Sign out and confirm the next sign-in shows a fresh account picker.',
          takeaway:
            'Two locks on sign-out, an enum role with an `isAdmin` getter — a clean `AuthService` seam the whole app can trust.',
        },
      ],
    },
    {
      id: 'm2-s3',
      title: 'Auth State & Routing',
      topics: [
        {
          id: 'm2-t11',
          title: 'AuthNotifier: Holding AppUser? and justLoggedIn',
          explain:
            'Create `AuthNotifier`, a `ChangeNotifier` that holds the current `AppUser?` and a `justLoggedIn` flag used to trigger a one-time welcome overlay.',
          analogy:
            'AuthNotifier is the TunMani Cafe front-desk board that everyone glances at: it shows who is currently on shift (`AppUser?`) and lights a little "just clocked in!" lamp the moment a cashier badges in, so the welcome banner flashes once and then the lamp goes dark again. Every screen watches this one board instead of each asking the back office independently.',
          theory:
            '`AuthNotifier` extends **`ChangeNotifier`**, the simplest Flutter state primitive. It holds a private `AppUser? _user` exposed via a getter, plus a `bool justLoggedIn` flag.\n\nWhen sign-in succeeds, you set `_user` and **set `justLoggedIn = true`**, then call **`notifyListeners()`**. Widgets listening (via `Provider`/`ListenableBuilder`) rebuild. The router and a top-level overlay both watch this notifier.\n\nThe **`justLoggedIn` flag drives a one-time welcome overlay** ("Namaskara, Anjali!"). After the overlay shows, you call a `consumeWelcome()` method that sets the flag back to false so the banner does not reappear on every rebuild.\n\nOn sign-out you clear `_user` to null and `notifyListeners()`, which the router\'s redirect picks up to send the user back to `/login`. Centralising auth state here means there is exactly one source of truth for "who is logged in".',
          whyItMatters:
            '`ChangeNotifier` + `notifyListeners` is the foundational Flutter state-management pattern and the basis for understanding Provider/Riverpod. The "one-shot flag that you consume" idiom (`justLoggedIn`) is a clean way to fire transient UI events from persistent state — a frequent design discussion.',
          steps: [
            'Create `lib/state/auth_notifier.dart` with `class AuthNotifier extends ChangeNotifier`.',
            'Add private `AppUser? _user;` and a public `AppUser? get user => _user;`.',
            'Add `bool justLoggedIn = false;`.',
            'Write `setUser(AppUser? u, {bool justLoggedIn = false})` that updates fields and calls `notifyListeners()`.',
            'Add `consumeWelcome()` that sets `justLoggedIn = false` and notifies.',
            'Expose a `bool get isLoggedIn => _user != null;` convenience.',
          ],
          code: `// lib/state/auth_notifier.dart
import 'package:flutter/foundation.dart';

class AuthNotifier extends ChangeNotifier {
  AppUser? _user;
  bool justLoggedIn = false;

  AppUser? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get isAdmin => _user?.isAdmin ?? false;

  /// Called after a successful sign-in or session restore.
  void setUser(AppUser? u, {bool justLoggedIn = false}) {
    _user = u;
    this.justLoggedIn = justLoggedIn;
    notifyListeners();
  }

  /// The welcome banner calls this once it has been shown.
  void consumeWelcome() {
    justLoggedIn = false;
    notifyListeners();
  }

  void clear() {
    _user = null;
    justLoggedIn = false;
    notifyListeners();
  }
}`,
          pitfalls: [
            '**Mutating `_user` without `notifyListeners()`.** The UI never updates. Fix: notify after every change.',
            '**Never resetting `justLoggedIn`.** The welcome overlay reappears on every rebuild. Fix: `consumeWelcome()` after showing it.',
            '**Exposing the private field directly.** External code mutates state uncontrolled. Fix: expose a getter and a method.',
            '**Calling `notifyListeners()` during `build`.** Throws a setState-during-build error. Fix: call it from event handlers, not build.',
            '**Storing the Firebase user instead of `AppUser`.** Loses role/active info. Fix: store the authorised `AppUser`.',
            '**Forgetting to clear on sign-out.** The router still thinks someone is logged in. Fix: `clear()` on sign-out.',
          ],
          tryIt:
            'Build `AuthNotifier` and wire it above your widget tree with a `ChangeNotifierProvider`. Add a temporary `ListenableBuilder` that prints `notifier.user?.email`. Call `setUser(testUser, justLoggedIn: true)` and watch it rebuild; then `consumeWelcome()` and confirm the flag flips to false.',
          takeaway:
            'One `ChangeNotifier` holds the current user and a one-shot welcome flag — the single source of truth every screen watches.',
        },
        {
          id: 'm2-t12',
          title: 'go_router Redirect Guards: Forcing /login',
          explain:
            'Use go_router\'s `redirect` with `refreshListenable` so that any unauthenticated navigation is bounced to `/login` automatically.',
          analogy:
            'TunMani Cafe has one security guard at the corridor entrance. No matter which door a person tries — kitchen, store, office — the guard checks their badge and, if they have none, walks them straight to the reception desk (`/login`). The go_router `redirect` is that single guard: it sees every navigation attempt and reroutes the badgeless to the login screen.',
          theory:
            `\`go_router\` exposes a top-level **\`redirect\`** callback that runs on every navigation. It receives the target location and returns either \`null\` (allow) or a **new path** to redirect to.\n\nYou read auth state from the \`AuthNotifier\`. The logic: if **not logged in and not already at \`/login\`**, return \`'/login'\`. If **logged in and currently at \`/login\`**, return \`'/'\` (the home/till screen). Otherwise return \`null\`.\n\nFor the guard to re-run when auth changes, you pass the \`AuthNotifier\` as **\`refreshListenable\`**. When \`notifyListeners()\` fires (sign-in or sign-out), go_router re-evaluates the redirect and moves the user accordingly — no manual navigation needed in the auth code.\n\nThis declarative approach means there is exactly one place that decides routing, instead of scattered \`Navigator.push\`/\`pop\` calls reacting to auth.`,
          whyItMatters:
            'Centralised redirect guards are the modern Flutter routing pattern and a common interview topic ("how do you protect routes?"). `refreshListenable` tying routing to a `ChangeNotifier` is the elegant glue most tutorials skip — knowing it signals real go_router experience.',
          steps: [
            'Create `GoRouter` with your routes including `/login`, `/`, and `/admin`.',
            'Pass `refreshListenable: authNotifier` so it re-evaluates on auth changes.',
            'In `redirect`, compute `final loggedIn = authNotifier.isLoggedIn;` and `final atLogin = state.matchedLocation == "/login";`.',
            'If `!loggedIn && !atLogin` return `"/login"`.',
            'If `loggedIn && atLogin` return `"/"`.',
            'Otherwise return `null` to allow the navigation.',
          ],
          code: `// lib/router/app_router.dart (excerpt)
GoRouter buildRouter(AuthNotifier auth) {
  return GoRouter(
    // Re-run redirect whenever auth state changes.
    refreshListenable: auth,
    initialLocation: '/',
    redirect: (context, state) {
      final loggedIn = auth.isLoggedIn;
      final atLogin = state.matchedLocation == '/login';

      // Badgeless visitor -> reception desk.
      if (!loggedIn && !atLogin) return '/login';

      // Already badged in but sitting at login -> go to the till.
      if (loggedIn && atLogin) return '/';

      return null; // allow
    },
    routes: [
      GoRoute(path: '/login', builder: (c, s) => const LoginScreen()),
      GoRoute(path: '/', builder: (c, s) => const TillScreen()),
      GoRoute(path: '/admin', builder: (c, s) => const AdminScreen()),
    ],
  );
}`,
          pitfalls: [
            '**Omitting `refreshListenable`.** The guard never re-runs after sign-in; the user is stuck. Fix: pass the `AuthNotifier`.',
            '**Infinite redirect loop.** Redirecting to `/login` without exempting `/login`. Fix: check `atLogin` before redirecting.',
            '**Comparing `state.uri` instead of `matchedLocation`.** Query params break the match. Fix: use `matchedLocation`.',
            '**Doing navigation inside the auth service.** Conflicts with the router. Fix: let the redirect handle all routing.',
            '**Reading auth via context inside redirect awkwardly.** Closure capture is cleaner. Fix: capture `auth` in `buildRouter`.',
            '**Forgetting the logged-in-at-login case.** Users stay on the login screen after success. Fix: redirect them to `/`.',
          ],
          tryIt:
            'Wire the router with `refreshListenable: authNotifier`. Start signed out and confirm any deep link bounces to `/login`. Sign in and watch the redirect carry you to `/` automatically, with no `Navigator` call in your auth code.',
          takeaway:
            'One `redirect` plus `refreshListenable` is your whole route guard — sign-in and sign-out reroute the app declaratively.',
        },
        {
          id: 'm2-t13',
          title: 'Blocking /admin for Non-Admins',
          explain:
            'Extend the redirect guard so that staff users cannot reach `/admin`, redirecting them back to the till.',
          analogy:
            'Inside TunMani Cafe, the office where the day\'s cash and staff register live is owner-only. A waiter who wanders toward that door is politely turned back to the counter. The `/admin` guard does the same: a `staff` user who tries the admin route is sent back to `/`, while an `admin` walks right in.',
          theory:
            'You add a **role check** to the same `redirect`. If the target location **starts with `/admin`** and the user **is not admin** (`!auth.isAdmin`), redirect to `'/'`.\n\nBecause `AuthNotifier.isAdmin` reads the `AppUser`\'s role, the check is a single boolean. Putting it in the central redirect means **every** admin sub-route is protected at once — you do not repeat the check per screen.\n\nOrder matters: handle the not-logged-in case first (send to `/login`), then the role case. A logged-in non-admin hitting `/admin` falls through to the role check and is bounced to the till.\n\nClient-side guarding is a UX convenience; the real enforcement lives in **Firestore security rules** that reject admin-only writes from non-admins. The guard simply prevents the wrong screen from ever rendering.',
          whyItMatters:
            'Role-based route protection is a textbook authorization requirement and a frequent interview scenario. Doing it in one central place (not per-widget) is exactly the maintainability point reviewers look for, and pairing it with "the server still enforces it" shows defense-in-depth thinking.',
          steps: [
            'In the same `redirect`, after the login checks, read `final goingAdmin = state.matchedLocation.startsWith("/admin");`.',
            'Compute `final isAdmin = auth.isAdmin;`.',
            'If `goingAdmin && !isAdmin`, return `"/"`.',
            'Leave admin users to pass through (`null`).',
            'Hide the admin entry point in the UI for staff as a courtesy.',
            'Plan Firestore rules to enforce admin-only writes server-side.',
          ],
          code: `// lib/router/app_router.dart (excerpt — role guard added)
redirect: (context, state) {
  final loggedIn = auth.isLoggedIn;
  final atLogin = state.matchedLocation == '/login';

  if (!loggedIn && !atLogin) return '/login';
  if (loggedIn && atLogin) return '/';

  // Admin corridor is owner-only.
  final goingAdmin = state.matchedLocation.startsWith('/admin');
  if (goingAdmin && !auth.isAdmin) {
    return '/'; // staff bounced back to the till
  }

  return null;
},`,
          pitfalls: [
            '**Checking the role before the login check.** A null user crashes `isAdmin`. Fix: handle login first; let `isAdmin` default to false.',
            '**Using `==` instead of `startsWith` for `/admin`.** Sub-routes like `/admin/users` slip through. Fix: `startsWith("/admin")`.',
            '**Relying only on hiding the button.** Staff can still deep-link. Fix: guard the route too.',
            '**Skipping server-side rules.** A patched client bypasses everything. Fix: enforce in Firestore rules.',
            '**Redirecting non-admins to `/login`.** They are logged in, just unauthorised. Fix: send them to `/`.',
            '**Scattering role checks per screen.** Inconsistent and error-prone. Fix: one central guard.',
          ],
          tryIt:
            'Sign in as a `staff` user and try to navigate to `/admin` directly — confirm you are redirected to `/`. Flip the user to `admin` in Firestore, restart, and confirm `/admin` now opens. Note that the redirect change protected every `/admin/...` sub-route at once.',
          takeaway:
            'A two-line role check in the central redirect protects the entire admin corridor — back it with server rules for real security.',
        },
        {
          id: 'm2-t14',
          title: 'The Login Screen UI & Error Handling',
          explain:
            'Build the login screen with a single Google button, a loading state, and friendly error messages for cancelled, unauthorised, and failed sign-ins.',
          analogy:
            'The TunMani Cafe reception desk is deliberately simple: one clear "Sign in with Google" board, a spinning fan while the badge is checked, and a polite note if you are not on the staff list — never a cryptic engine-room error. The login screen mirrors that calm front-of-house: one button, one spinner, one human-readable message.',
          theory:
            'The login screen is a `StatefulWidget` (or uses a notifier) with a **single Google sign-in button**. On tap it sets a `loading` flag, calls `AuthService.signInWithGoogle()`, and on success updates the `AuthNotifier` (which triggers the redirect to `/`).\n\nErrors are **caught and translated**. A cancelled picker, an unauthorised email, and a network failure each map to a clear sentence shown via a `SnackBar` or inline text — never a raw exception string. You distinguish them by catching your own `AuthException` (with its message) and `FirebaseAuthException`.\n\nThe **loading state** disables the button and shows a spinner so the user cannot double-tap during the token exchange. On error, you reset `loading` to false and display the message.\n\nBecause routing is handled by the redirect guard, the login screen never calls `Navigator` itself — it just updates auth state and lets the router move the user. This keeps the screen focused purely on presentation and error feedback.',
          whyItMatters:
            'Graceful error handling is what separates a demo from a shippable app, and "how do you surface auth errors to users?" is a common product-minded interview question. The pattern of "update state, let the router navigate" is the clean separation reviewers reward.',
          steps: [
            'Create `lib/screens/login_screen.dart` as a `StatefulWidget`.',
            'Add `bool _loading = false;` and `String? _error;`.',
            'Build a centered Google button; when `_loading`, show a `CircularProgressIndicator` instead.',
            'On tap, set `_loading = true`, clear `_error`, and call `signInWithGoogle()` in a try/catch.',
            'On success, call `authNotifier.setUser(appUser, justLoggedIn: true)`.',
            'On `AuthException`/`FirebaseAuthException`, set `_error` to a friendly message and reset `_loading`.',
            'Show `_error` below the button when non-null.',
          ],
          code: `// lib/screens/login_screen.dart (excerpt)
class _LoginScreenState extends State<LoginScreen> {
  bool _loading = false;
  String? _error;

  Future<void> _signIn() async {
    setState(() { _loading = true; _error = null; });
    try {
      final appUser = await context.read<AuthService>().signInWithGoogle();
      // Router redirect will carry us to '/'; just update state.
      context.read<AuthNotifier>().setUser(appUser, justLoggedIn: true);
    } on AuthException catch (e) {
      setState(() => _error = e.message); // "not authorised", "cancelled"...
    } catch (_) {
      setState(() => _error = 'Something went wrong. Check your connection.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: _loading
            ? const CircularProgressIndicator()
            : Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ElevatedButton.icon(
                    onPressed: _signIn,
                    icon: const Icon(Icons.login),
                    label: const Text('Sign in with Google'),
                  ),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(_error!, style: const TextStyle(color: Colors.red)),
                  ],
                ],
              ),
      ),
    );
  }
}`,
          pitfalls: [
            '**Showing raw exception text.** Users see `[firebase_auth/...]`. Fix: translate to plain sentences.',
            '**Not disabling the button while loading.** Double-taps fire two sign-ins. Fix: gate on `_loading`.',
            '**Calling `setState` after dispose.** Throws if the user left the screen. Fix: guard with `if (mounted)`.',
            '**Navigating manually from the screen.** Fights the redirect guard. Fix: only update auth state.',
            '**Treating cancellation as an error toast.** Annoys users who simply backed out. Fix: handle cancel quietly or with a soft message.',
            '**Forgetting to clear `_error` on retry.** Stale errors linger. Fix: reset `_error` at the start of `_signIn`.',
          ],
          tryIt:
            'Build the login screen with loading and error states. Sign in successfully and watch the redirect move you to the till. Then sign in with a non-whitelisted Gmail and confirm a friendly "not authorised" message appears instead of a raw exception.',
          takeaway:
            'One button, one spinner, human-readable errors, and zero manual navigation — the login screen just updates state and lets the router drive.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm2-p1',
      type: 'Mini Project',
      title: 'TunMani Cafe Login Screen + Whitelisted AuthService',
      domain: 'Restaurant POS Authentication',
      duration: '2 hours',
      description:
        'Build the full sign-in path for TunMani Cafe Billing: a Google Sign-In login screen backed by an AuthService that exchanges Google credentials for Firebase, validates the user against the Firestore whitelist, auto-bootstraps a hardcoded admin, and signs out deactivated users.',
      tools: ['Flutter', 'firebase_auth', 'google_sign_in', 'cloud_firestore', 'provider'],
      blueprint: {
        overview:
          'Wire a real Firebase project, then implement AuthService.signInWithGoogle(), currentAppUser(), and signOut(), plus an AuthNotifier and a login screen. Only users present in users/{email} (or a bootstrap admin) may enter, and deactivated users are forced out on the next read.',
        functionalRequirements: [
          '**Google sign-in.** Tapping the button shows a fresh account picker (old Google session signed out first).',
          '**Whitelist gate.** A signed-in Google user with no users/{email} doc is rejected with a clear message.',
          '**Bootstrap admin.** A hardcoded owner email auto-creates an admin doc on first login.',
          '**Active flag.** Setting active=false in Firestore signs the user out on the next launch.',
          '**Welcome flag.** A successful login sets justLoggedIn so the UI can show a one-time welcome.',
          '**Sign out.** Clears both Firebase and Google sessions.',
        ],
        technicalImplementation: [
          '**AuthService.** Holds FirebaseAuth and GoogleSignIn; methods signInWithGoogle, currentAppUser, signOut.',
          '**AppUser model.** uid, name, email (lowercased doc id), UserRole enum, active bool, isAdmin getter, fromMap/toMap.',
          '**Whitelist read.** users/{email}.get(); reject if missing unless email is a bootstrap admin.',
          '**AuthNotifier.** ChangeNotifier with AppUser? and justLoggedIn; setUser/consumeWelcome/clear.',
          '**Login screen.** StatefulWidget with loading and error states; translates AuthException to friendly text.',
          '**Provider wiring.** AuthService and AuthNotifier provided above the widget tree.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold',
            outcome:
              'A Flutter project initialized with Firebase, Google Sign-In enabled, and the dependencies added.',
            prompt:
              'Scaffold a Flutter app called tunmani_billing targeting Android. Add dependencies firebase_core, firebase_auth, google_sign_in, cloud_firestore, and provider. Set up Firebase.initializeApp in an async main with WidgetsFlutterBinding.ensureInitialized and DefaultFirebaseOptions.currentPlatform. Create the folder structure lib/models, lib/services, lib/state, lib/screens. Do not write business logic yet.',
          },
          {
            step: 2,
            label: 'AppUser model',
            outcome: 'An immutable AppUser with a UserRole enum, isAdmin getter, and fromMap/toMap.',
            prompt:
              'Create lib/models/app_user.dart with an enum UserRole { admin, staff } and a class AppUser holding final uid, name, email (lowercased), role (UserRole), and active (bool). Add an isAdmin getter, a const constructor with required named params, a fromMap factory using UserRole.values.byName and defaulting active to true, and a toMap using role.name. Lowercase email in fromMap.',
          },
          {
            step: 3,
            label: 'AuthService',
            outcome: 'signInWithGoogle with whitelist, bootstrap admin, and active checks, plus currentAppUser and signOut.',
            prompt:
              'Create lib/services/auth_service.dart with an AuthService that holds FirebaseAuth.instance, GoogleSignIn(), and FirebaseFirestore.instance. Implement signInWithGoogle(): sign out the cached Google session first for a fresh picker, run GoogleSignIn().signIn(), exchange the Google tokens for a Firebase credential via GoogleAuthProvider, then read users/{email} (lowercased). If the doc is missing, auto-create an admin if the email is in a hardcoded _bootstrapAdmins set, otherwise sign out and throw an AuthException. Reject and sign out if active is false. Also implement currentAppUser() that re-validates the persisted session and signOut() clearing both Firebase and Google. Add an AuthException class with a message.',
          },
          {
            step: 4,
            label: 'AuthNotifier + Login UI',
            outcome: 'An AuthNotifier and a login screen with loading and friendly error handling.',
            prompt:
              'Create lib/state/auth_notifier.dart as a ChangeNotifier holding AppUser? and a bool justLoggedIn, with setUser({justLoggedIn}), consumeWelcome, clear, isLoggedIn, and isAdmin getters. Then create lib/screens/login_screen.dart: a StatefulWidget with a single Sign in with Google button, a loading spinner, and an error message area. On tap, call AuthService.signInWithGoogle inside try/catch, update AuthNotifier on success (justLoggedIn: true), and translate AuthException into a friendly message. Wire AuthService and AuthNotifier with Provider above the app. Do not call Navigator from the screen.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm2-q1',
      q: 'Why does signInWithGoogle() call GoogleSignIn().signOut() before showing the picker?',
      options: [
        'To force a fresh account chooser so the previous user is not silently reused on a shared till',
        'To delete the user from Firebase',
        'To speed up the network request',
        'Because Firebase requires it before initializeApp',
      ],
      answer: 0,
    },
    {
      id: 'm2-q2',
      q: 'Where does the TunMani Cafe whitelist live and what is the document id?',
      options: [
        'In a hardcoded list only',
        'In Firestore at users/{email}, with the lowercased email as the doc id',
        'In SharedPreferences keyed by uid',
        'In firebase_options.dart',
      ],
      answer: 1,
    },
    {
      id: 'm2-q3',
      q: 'What problem do hardcoded bootstrap admin emails solve?',
      options: [
        'They speed up sign-in',
        'They replace SHA-1 fingerprints',
        'The chicken-and-egg of an empty whitelist: who creates the very first admin',
        'They store the user password',
      ],
      answer: 2,
    },
    {
      id: 'm2-q4',
      q: 'How is a user deactivated, and when does it take effect?',
      options: [
        'Delete their Firebase account; effective immediately via token revocation',
        'Set active=false in their users doc; effective on the next read, which signs them out',
        'Remove their SHA-1; effective at next build',
        'Set role to staff; effective never',
      ],
      answer: 1,
    },
    {
      id: 'm2-q5',
      q: 'In the go_router setup, what makes the redirect guard re-run when the user signs in or out?',
      options: [
        'A manual Navigator.push in AuthService',
        'Passing the AuthNotifier as refreshListenable so notifyListeners triggers re-evaluation',
        'Calling setState in main',
        'Re-downloading google-services.json',
      ],
      answer: 1,
    },
    {
      id: 'm2-q6',
      q: 'A Google Sign-In returns ApiException: 10 in a release build but works in debug. The most likely cause is:',
      options: [
        'Firebase.initializeApp was not awaited',
        'The release/Play App Signing SHA-1 fingerprint is not registered in Firebase',
        'The user is not an admin',
        'The AuthNotifier was not provided',
      ],
      answer: 1,
    },
  ],
};
