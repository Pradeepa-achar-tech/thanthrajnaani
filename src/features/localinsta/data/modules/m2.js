// Module 2 — Authentication (Email/Password + Google Sign-In via Supabase)
// LocalInsta (Flutter + Supabase) course content for the React course player.

export const m2 = {
  id: 'm2',
  title: 'Authentication with Supabase Auth',
  hours: 8,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Wrap Supabase Auth in a repository pattern, ship email/password sign-up and sign-in, wire native Google Sign-In through Supabase, auto-create a profile row on signup with a Postgres trigger, and build the AuthGate that routes the whole app off one session stream.',
  sections: [
    {
      id: 'm2-s1',
      title: 'Supabase Auth concepts',
      topics: [
        {
          id: 'm2-t1',
          title: 'How Supabase Auth actually works: auth.users, sessions & JWTs',
          explain:
            'Every sign-up creates a row in the managed `auth.users` table; every successful sign-in returns a short-lived JWT access token plus a longer-lived refresh token.',
          analogy:
            'The visitor register at a temple entrance (`auth.users`) records who has ever come through the gate. The wristband they hand you for the day (the JWT access token) proves you\'re allowed inside *right now*, but it expires by evening — the cloakroom token you keep to get a fresh wristband tomorrow without re-registering is the refresh token.',
          theory:
            '**`auth.users`** is a special, Supabase-managed table living in the `auth` schema (separate from your `public` schema) — you never write to it directly; the Auth API does that for you on sign-up/sign-in. Every row has a stable `id` (a UUID) — this is the id you will reference as a foreign key from your own `public.profiles` table in Module 3.\n\nA successful sign-in returns a **`Session`**: a short-lived **JWT access token** (embeds the user\'s id and expiry, sent with every API request to prove identity) and a **refresh token** (long-lived, used to silently mint a new access token when the old one expires). `supabase_flutter` handles refresh automatically and persists the session to local storage between app launches — you almost never touch a raw JWT by hand, but understanding that it *is* a JWT explains why RLS policies (Module 3) can read `auth.uid()` inside Postgres: the database itself decodes the same token.',
          whyItMatters:
            'This is the mental model every Supabase RLS policy in Module 3 leans on — `auth.uid() = user_id` only makes sense once you understand that the database is reading the same JWT your Flutter app received at sign-in.',
          steps: [
            'Open **Authentication → Users** in the Supabase dashboard — currently empty.',
            'Open **Authentication → Policies** and note it currently shows "no tables" — RLS-policy UI, covered fully in Module 3.',
            'In SQL Editor, run `select * from auth.users;` — confirm it returns zero rows but the columns (`id`, `email`, `created_at`, ...) are visible.',
            'Read the **Authentication → Providers** tab and note Email is enabled by default; Google is off (you enable it later in this module).',
          ],
          code: `-- Peek at the managed auth schema (read-only from your side in practice)
select id, email, created_at, email_confirmed_at
from auth.users
limit 10;

-- This is the exact id you will reference from your own table:
-- create table public.profiles (
--   id uuid primary key references auth.users(id) on delete cascade,
--   ...
-- );`,
          pitfalls: [
            '**Trying to `insert` directly into `auth.users`.** Not how you create users — always go through `supabase.auth.signUp()` / OAuth. Fix: treat `auth.users` as read-only from application code.',
            '**Assuming the JWT never changes.** Access tokens rotate on refresh; code that caches a token string long-term will eventually use a stale one. Fix: always read the current token from the live session, never cache it yourself.',
            '**Confusing `auth.users.id` with `auth.users.email` as the "real" identity.** Emails can change; the UUID `id` is the stable foreign key to use everywhere. Fix: always key your own tables off `id`.',
            '**Not realising `auth` and `public` are separate Postgres schemas.** Queries against `profiles` without a schema prefix default to `public`, which is correct — but forgetting this distinction confuses early debugging.',
          ],
          tryIt:
            'Run the `select * from auth.users` query now (before any signups exist) and again after you complete the sign-up topic later in this module — compare the new row that appears.',
          takeaway: 'auth.users is Supabase-managed and read-only from your code; its UUID id is the one identity your own tables should always key against.',
        },
        {
          id: 'm2-t2',
          title: 'The AuthRepository pattern',
          explain:
            'Wrap every `supabase.auth` call behind a small `AuthRepository` class — the rest of the app never talks to Supabase directly for auth.',
          analogy:
            'A restaurant\'s waiters never walk into the kitchen and cook — they hand an order to the kitchen counter and wait for a plate. `AuthRepository` is that counter: every screen hands it a request ("sign in with this email/password") and gets a clean result back, never touching the Supabase SDK directly.',
          theory:
            'A **repository** is a thin class that owns all communication with one external system — here, Supabase Auth — and exposes a small, purpose-built API to the rest of the app: `signUp()`, `signInWithPassword()`, `signInWithGoogle()`, `signOut()`, plus a `sessionChanges` stream. This buys you three things: **testability** (you can fake an `AuthRepository` in tests without touching a real network), **a single choke point** for error handling and logging, and **insulation** — if you ever swapped auth providers, only this one file would change.\n\nEvery method should catch Supabase\'s `AuthException` and translate it into a small, app-specific result type rather than letting raw SDK exceptions leak into your UI code.',
          whyItMatters:
            'This exact repository pattern is what every course in this portfolio uses for Firebase Auth too — recognising it here means you already know the shape before writing a line of it, and any interviewer asking "why not call the SDK straight from your widgets?" gets a confident, concrete answer.',
          steps: [
            'Create `lib/features/auth/data/auth_repository.dart`.',
            'Add a constructor taking a `SupabaseClient` (default to the shared `supabase` singleton, but keep it injectable for tests).',
            'Add `Future<void> signUp({required String email, required String password})`.',
            'Add `Future<void> signInWithPassword({required String email, required String password})`.',
            'Add `Future<void> signOut()`.',
            'Add a `Stream<AuthState> get onAuthStateChange => _client.auth.onAuthStateChange;` passthrough for now — you will wrap it in a friendlier sealed class next topic.',
          ],
          code: `import 'package:supabase_flutter/supabase_flutter.dart';

class AuthRepository {
  AuthRepository({SupabaseClient? client}) : _client = client ?? Supabase.instance.client;
  final SupabaseClient _client;

  Stream<AuthState> get onAuthStateChange => _client.auth.onAuthStateChange;

  Session? get currentSession => _client.auth.currentSession;

  Future<void> signUp({required String email, required String password}) async {
    await _client.auth.signUp(email: email, password: password);
  }

  Future<void> signInWithPassword({
    required String email,
    required String password,
  }) async {
    await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }
}`,
          pitfalls: [
            '**Calling `Supabase.instance.client.auth` directly from a widget\'s `onPressed`.** Scatters error-handling logic across every screen and makes testing painful. Fix: always route through `AuthRepository`.',
            '**Letting raw `AuthException` messages (written for developers) reach end-user UI unfiltered.** "invalid_credentials" is not friendly copy. Fix: catch and translate in the repository or the calling ChangeNotifier, covered next.',
            '**Hardcoding the `SupabaseClient` inside the repository with no way to inject a fake one.** Makes unit testing the repository\'s logic impossible without a live network call. Fix: accept it as an optional constructor parameter as shown.',
            '**Putting business logic (like "redirect to onboarding if new user") inside the repository.** The repository\'s job is talking to Supabase, not deciding navigation — that belongs in Module 2\'s AuthGate topic.',
          ],
          tryIt:
            'Write a `FakeAuthRepository` that extends nothing but implements the same three methods with in-memory behaviour (no network), and swap it in for a quick manual test of a sign-up button\'s UI without touching Supabase at all.',
          takeaway: 'One repository owns every Supabase Auth call — the rest of the app only ever talks to that one clean interface.',
        },
        {
          id: 'm2-t3',
          title: 'Sealed AuthSession & the session stream',
          explain:
            'Model the three real states — loading, signed in, signed out — as a Dart 3 sealed class, and drive the whole app off one `Stream<AuthSession>`.',
          analogy:
            'A shop\'s front shutter has exactly three states: still being rolled up (loading), open with the owner inside (signed in), or closed and locked (signed out) — never some fourth ambiguous state. A sealed class enforces exactly that: the compiler will not let you forget to handle one of the three.',
          theory:
            'A **sealed class** in Dart 3 lists every possible subtype in one file, letting the compiler **exhaustively check** every `switch` you write against it — miss a case, get a compile error, not a runtime surprise. Model `AuthSession` as `AuthLoading`, `AuthSignedIn(userId)`, `AuthSignedOut` — the "unknown yet" state matters because on cold app start, Supabase needs a moment to check for a persisted session before you know which of the other two states you\'re really in.\n\nMap Supabase\'s raw `onAuthStateChange` stream (which emits `AuthState` events like `initialSession`, `signedIn`, `signedOut`, `tokenRefreshed`) into this cleaner three-state shape inside the repository or a small `SessionState extends ChangeNotifier` (from Module 0\'s Provider primer) that the whole app watches.',
          whyItMatters:
            'This sealed-class pattern is exactly what the billing course in this portfolio teaches for Firebase Auth — same idea, same payoff: a `switch` that the compiler guarantees is exhaustive is a whole category of "forgot to handle sign-out" bugs eliminated at compile time, not caught in production.',
          steps: [
            'Define a `sealed class AuthSession` with three subtypes: `AuthLoading`, `AuthSignedIn(String userId)`, `AuthSignedOut`.',
            'In `SessionState extends ChangeNotifier`, hold a private `AuthSession _session = const AuthLoading();`.',
            'In the constructor, `listen` to `authRepository.onAuthStateChange` and map each event to the right `AuthSession` subtype, calling `notifyListeners()` on every change.',
            'Expose a public `AuthSession get session => _session;`.',
            'Write a `switch` in a throwaway `print` statement that handles all three cases — delete a case and confirm Dart refuses to compile.',
          ],
          code: `sealed class AuthSession {
  const AuthSession();
}
class AuthLoading extends AuthSession {
  const AuthLoading();
}
class AuthSignedIn extends AuthSession {
  const AuthSignedIn(this.userId);
  final String userId;
}
class AuthSignedOut extends AuthSession {
  const AuthSignedOut();
}

class SessionState extends ChangeNotifier {
  SessionState(this._authRepository) {
    _sub = _authRepository.onAuthStateChange.listen((event) {
      final user = event.session?.user;
      _session = user == null ? const AuthSignedOut() : AuthSignedIn(user.id);
      notifyListeners();
    });
  }

  final AuthRepository _authRepository;
  late final StreamSubscription _sub;
  AuthSession _session = const AuthLoading();

  AuthSession get session => _session;

  @override
  void dispose() {
    _sub.cancel();
    super.dispose();
  }
}

// Exhaustive switch — the compiler enforces every case is handled
String describe(AuthSession s) => switch (s) {
  AuthLoading() => 'Checking session…',
  AuthSignedIn(userId: final id) => 'Signed in as \$id',
  AuthSignedOut() => 'Signed out',
};`,
          pitfalls: [
            '**Forgetting to cancel the `StreamSubscription` in `dispose()`.** Leaks memory and can call `notifyListeners()` on a disposed `ChangeNotifier`. Fix: always cancel in `dispose()`, exactly as shown.',
            '**Using a plain `bool isSignedIn` instead of the sealed class.** Cannot represent the "still checking" loading state, so the app briefly flashes the login screen on every cold start even for already-signed-in users. Fix: always model the third state explicitly.',
            '**Using `if`/`else if` chains instead of `switch` over the sealed class.** Loses the compiler\'s exhaustiveness check — the whole reason to use a sealed class in the first place. Fix: prefer `switch` expressions/statements over sealed types.',
            '**Reading `event.session?.user` without realising some `AuthChangeEvent` types (like `passwordRecovery`) carry a session too.** Can misclassify a password-recovery flow as a normal sign-in. Fix: branch on `event.event` explicitly if your app needs to distinguish these (LocalInsta keeps it simple by treating any non-null user as signed in).',
          ],
          tryIt:
            'Wire `SessionState` into a `ChangeNotifierProvider` at the app root, and build a tiny debug `Text` widget anywhere that calls `describe(context.watch<SessionState>().session)` — confirm it correctly shows "Checking session…" for a brief moment on cold start.',
          takeaway: 'Three real states, one sealed class, one exhaustive switch — the compiler will not let you forget the "still loading" case.',
        },
      ],
    },
    {
      id: 'm2-s2',
      title: 'Email & password auth',
      topics: [
        {
          id: 'm2-t4',
          title: 'Sign-up screen: validation & supabase.auth.signUp',
          explain:
            'A form with client-side validation, calling `AuthRepository.signUp`, with friendly loading/error/success states.',
          analogy:
            'A membership form at a Kundapura co-operative society will not accept a torn or half-filled form — the clerk checks it right there at the counter before it ever reaches the registrar. Client-side form validation is that first-line clerk, catching obvious mistakes before a single network call is made.',
          theory:
            'Use a `Form` with a `GlobalKey<FormState>` and `TextFormField.validator` callbacks (Module 0\'s pattern) to check email shape and a minimum password length **before** calling the network — this gives instant feedback and avoids wasting a request on obviously-invalid input.\n\nOn submit, call `AuthRepository.signUp(email:, password:)` inside a `try`/`catch`, tracking a local `_submitting` bool to disable the button and show a spinner mid-flight. Supabase\'s default configuration **requires email confirmation** before a new account can sign in — so a successful `signUp()` call does not immediately sign the user in; the next topic covers exactly what UI that requires.',
          whyItMatters:
            'A sign-up form that silently does nothing on a slow connection, or that lets a user tap "Create account" five times because the button was not disabled, is a classic first impression killer — and the fix (a `_submitting` guard) is three lines of code with zero excuse to skip it.',
          steps: [
            'Build `SignUpScreen` with `TextFormField`s for email, password, confirm-password.',
            'Validators: email regex, password `length >= 6` (Supabase\'s own minimum), confirm-password matches.',
            'On submit: `if (!_formKey.currentState!.validate()) return;`.',
            'Set `_submitting = true`, call `authRepository.signUp(...)` in `try`/`catch`.',
            'On success, show a "Check your email to confirm your account" message (next topic explains why).',
            'On `AuthException`, show the message in a `SnackBar`; always reset `_submitting = false` in a `finally` block.',
          ],
          code: `class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});
  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _submitting = false;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      await context.read<AuthRepository>().signUp(
            email: _email.text.trim(),
            password: _password.text,
          );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Check your email to confirm your account.')),
      );
    } on AuthException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create account')),
      body: Form(
        key: _formKey,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              TextFormField(
                controller: _email,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: (v) => (v == null || !v.contains('@')) ? 'Enter a valid email' : null,
              ),
              TextFormField(
                controller: _password,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password'),
                validator: (v) => (v == null || v.length < 6) ? 'At least 6 characters' : null,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _submitting ? null : _submit,
                child: _submitting
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Create account'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`,
          pitfalls: [
            '**Not disabling the submit button while a request is in flight.** Users double-tap, firing two sign-up requests. Fix: `onPressed: _submitting ? null : _submit`.',
            '**Calling `setState` after the widget is disposed (user navigated away mid-request).** Throws in debug mode. Fix: guard every post-await `setState`/`ScaffoldMessenger` call with `if (!mounted) return;`.',
            '**Trusting only server-side validation and skipping client-side checks.** Every invalid submission becomes a wasted round-trip and a slower, worse UX. Fix: validate locally first, treat server errors as the second line of defence, not the first.',
            '**Showing raw `AuthException.message` for every error without translation.** Some Supabase messages are technical. Fix: map the most common ones (e.g. "User already registered") to friendlier copy; fall back to the raw message for the rest.',
          ],
          tryIt:
            'Submit the form with a password under 6 characters and confirm the validator blocks it with zero network call, then submit validly and confirm the success SnackBar appears.',
          takeaway: 'Validate locally before ever touching the network, and always guard post-await UI updates with a mounted check.',
        },
        {
          id: 'm2-t5',
          title: 'Email confirmation — the flow, and the dev-mode shortcut',
          explain:
            'By default a new Supabase account cannot sign in until the confirmation link in their email is clicked — understand the real flow, and the one dashboard toggle that speeds up local development.',
          analogy:
            'A gym membership is not "active" the moment you fill the form — it activates once you have verified your phone number with an OTP. Supabase\'s default email confirmation is exactly that OTP step, just via a link instead of a code.',
          theory:
            'Supabase\'s **free tier includes a limited built-in email sender** for auth emails (confirmation, password reset, magic link) — genuinely free, no card, but rate-limited (a few emails per hour), which is intentionally too low for production but plenty for development and this course. When **Confirm email** is enabled (the default, under **Authentication → Providers → Email**), `signUp()` creates the `auth.users` row but the user cannot `signInWithPassword()` successfully until they click the confirmation link, which redirects to a **Site URL** / **Redirect URLs** you configure under **Authentication → URL Configuration**.\n\nFor faster local iteration, you can **toggle "Confirm email" off** in the dashboard during development — accounts become immediately usable after `signUp()`. This is a legitimate, documented development convenience, not a security hole, **provided you turn it back on (or configure a real email flow) before treating the app as anything beyond a personal learning project.**',
          whyItMatters:
            'Not knowing this toggle exists is the #1 reason beginners get stuck with "my sign-in isn\'t working" right after signing up — the account is real, it just is not confirmed yet. Recognising this instantly saves you a debugging session.',
          steps: [
            'Open **Authentication → Providers → Email** in the Supabase dashboard.',
            'For development, toggle **Confirm email** off, and note down that you did — this is a reminder to revisit before any real deployment.',
            'Under **Authentication → URL Configuration**, set the **Site URL** to a placeholder for now (`https://localinsta.app` or similar — mobile deep-linking is covered in the Google Sign-In topics).',
            'Sign up a fresh test account from your Flutter app.',
            'Confirm in **Authentication → Users** that the row appears immediately, and (with confirmation off) that `signInWithPassword` succeeds right after signUp with no extra step.',
          ],
          code: `-- Confirm your test user's status directly in SQL Editor
select id, email, email_confirmed_at, created_at
from auth.users
order by created_at desc
limit 5;

-- email_confirmed_at is null until confirmed (or immediately set,
-- if "Confirm email" is switched off in the dashboard).`,
          pitfalls: [
            '**Leaving "Confirm email" off and forgetting about it before wider testing.** Anyone could sign up with someone else\'s email and immediately use the account. Fix: re-enable before sharing the app beyond your own device, and note the toggle state in your README.',
            '**Hitting the free tier\'s email rate limit while testing repeatedly.** Confirmation emails silently stop arriving for a while. Fix: keep "Confirm email" off during heavy local testing precisely to avoid this; test the real email flow sparingly and deliberately.',
            '**Not configuring Site URL / Redirect URLs at all.** The confirmation link in the email points nowhere sensible. Fix: set it even to a placeholder value during development; you\'ll set it properly once the Google Sign-In deep link is wired later in this module.',
            '**Assuming a "successful" `signUp()` call means the user is signed in.** With confirmation on, it means only that an account now exists. Fix: always branch your UI on the actual session state, not on the signUp call resolving without error.',
          ],
          tryIt:
            'With confirmation off, sign up a test account, immediately sign in with the same credentials, and confirm it succeeds — then flip confirmation back on and repeat, observing the "check your email" state instead.',
          takeaway: 'A signUp() that resolves without error only means the account was created — email confirmation is a separate step you can toggle for development speed.',
        },
        {
          id: 'm2-t6',
          title: 'Sign-in screen: signInWithPassword & error handling',
          explain:
            'Mirror the sign-up form for sign-in, with clear, specific error messages for the cases users actually hit.',
          analogy:
            'A locked gate with a single "wrong" buzzer tells a visitor nothing — a good gate guard says specifically "wrong password" versus "you\'re not on today\'s guest list" versus "the office hasn\'t confirmed your entry yet." Good sign-in error handling is that specific guard.',
          theory:
            '`AuthRepository.signInWithPassword` wraps `supabase.auth.signInWithPassword(email:, password:)`, which throws `AuthException` with a `message` and sometimes a `statusCode` for specific failure reasons — invalid credentials, unconfirmed email, or a network failure surfaced generically. Map the common ones to friendly copy: "invalid_credentials" → "Wrong email or password", "email_not_confirmed" → "Please confirm your email first — check your inbox".\n\nOn success, you do **not** need to manually navigate anywhere — the `SessionState`/`AuthGate` pattern from earlier this module reacts to the `onAuthStateChange` stream automatically and swaps the screen for you. The sign-in screen\'s only job is to call the repository and show errors; navigation is a side effect it does not need to know about.',
          whyItMatters:
            'Letting the AuthGate (not the sign-in button) own navigation is what keeps LocalInsta\'s auth flow bug-free even as you add Google Sign-In, password reset, and email confirmation on top — there is exactly one place that decides "what screen is the user looking at", not five scattered `Navigator.push` calls that can get out of sync.',
          steps: [
            'Build `SignInScreen`, structurally identical to `SignUpScreen` but calling `signInWithPassword`.',
            'Write a `_friendlyMessage(AuthException e)` helper mapping known error strings to friendly copy, falling back to `e.message`.',
            'On success, do **nothing** navigation-wise — trust the AuthGate.',
            'Add a "Forgot password?" link (wired in the next topic) and a "Create account" link to `SignUpScreen`.',
          ],
          code: `String _friendlyMessage(AuthException e) {
  final msg = e.message.toLowerCase();
  if (msg.contains('invalid login credentials')) return 'Wrong email or password.';
  if (msg.contains('email not confirmed')) {
    return 'Please confirm your email first — check your inbox.';
  }
  return e.message; // fall back to Supabase's own message
}

Future<void> _submit() async {
  if (!_formKey.currentState!.validate()) return;
  setState(() => _submitting = true);
  try {
    await context.read<AuthRepository>().signInWithPassword(
          email: _email.text.trim(),
          password: _password.text,
        );
    // No navigation here — AuthGate reacts to the session stream automatically.
  } on AuthException catch (e) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(_friendlyMessage(e))));
  } finally {
    if (mounted) setState(() => _submitting = false);
  }
}`,
          pitfalls: [
            '**Manually `Navigator.push`-ing to the home screen after a successful sign-in.** Now two things think they own navigation (the button *and* the AuthGate), leading to double-navigation or flicker. Fix: let the AuthGate be the single source of truth.',
            '**Showing the exact same generic error for every failure.** Users cannot tell "wrong password" from "server is down". Fix: translate the handful of common cases explicitly.',
            '**Not trimming the email field before submitting.** A trailing space from autofill causes a confusing "invalid credentials" on an otherwise-correct password. Fix: always `.trim()` email input.',
            '**Re-throwing or swallowing exceptions that are not `AuthException`.** A genuine network timeout (a `SocketException`) needs its own friendly message too. Fix: add a broader `catch (e)` fallback below the specific `on AuthException catch`.',
          ],
          tryIt:
            'Deliberately sign in with a wrong password and confirm you see "Wrong email or password", then turn off wifi/data entirely and confirm you see a sensible message rather than an unhandled exception crashing the screen.',
          takeaway: 'The sign-in button\'s only job is calling the repository and reporting errors — let the AuthGate own navigation, always.',
        },
        {
          id: 'm2-t7',
          title: 'Password reset flow',
          explain:
            '`resetPasswordForEmail` sends a reset link; the app must handle the deep-link callback to let the user set a new password.',
          analogy:
            'Forgetting the gate combination at a housing society, you do not get a new one shouted across the compound — the watchman sends a sealed note to your registered address, and only that note lets you set a fresh combination. That sealed note is the password-reset email link.',
          theory:
            '`supabase.auth.resetPasswordForEmail(email, redirectTo: <deep-link>)` sends a reset email containing a link that, when opened, redirects to your app via the `redirectTo` deep link, carrying a **recovery session** — `onAuthStateChange` fires with `AuthChangeEvent.passwordRecovery`. Your app must listen for exactly this event and route to a "Set a new password" screen rather than treating it as a normal sign-in.\n\nThe deep link needs the same Android **intent-filter** / custom URL scheme groundwork as Google Sign-In\'s OAuth callback (next section) — both rely on the same underlying mechanism of "a link opens this specific app instead of a browser".',
          whyItMatters:
            'Password reset is one of the most-used, least-tested flows in real apps — interviewers specifically probe whether you know it is not just "send an email" but also "handle the app being opened by a link and recognise the special recovery state".',
          steps: [
            'Add a "Forgot password?" link on `SignInScreen` opening a small email-only form.',
            'Call `authRepository.resetPasswordForEmail(email, redirectTo: \'io.supabase.localinsta://reset-callback\')`.',
            'Show "Check your email for a reset link" regardless of whether the email exists (never reveal account existence).',
            'In `SessionState`\'s stream listener, branch specifically on `event.event == AuthChangeEvent.passwordRecovery` and expose a flag/route to a `SetNewPasswordScreen`.',
            'On that screen, call `supabase.auth.updateUser(UserAttributes(password: newPassword))`.',
          ],
          code: `// Requesting the reset
Future<void> requestPasswordReset(String email) async {
  await Supabase.instance.client.auth.resetPasswordForEmail(
    email,
    redirectTo: 'io.supabase.localinsta://reset-callback',
  );
}

// Recognising the special recovery event in the session listener
_authRepository.onAuthStateChange.listen((event) {
  if (event.event == AuthChangeEvent.passwordRecovery) {
    _needsNewPassword = true; // AuthGate routes to SetNewPasswordScreen
    notifyListeners();
    return;
  }
  // ...normal signed-in/out mapping as before
});

// Setting the new password once the recovery screen is shown
Future<void> setNewPassword(String newPassword) async {
  await Supabase.instance.client.auth.updateUser(
    UserAttributes(password: newPassword),
  );
}`,
          pitfalls: [
            '**Revealing whether an email exists in your system via different UI for "found" vs "not found".** A privacy/security leak. Fix: always show the same "check your email" message regardless.',
            '**Treating the `passwordRecovery` event as a normal sign-in and routing straight to the feed.** The user never actually gets to set a new password. Fix: branch on the specific event before the generic signed-in mapping.',
            '**Not configuring the deep link / redirect URL in the Supabase dashboard\'s Redirect URLs allowlist.** The reset link opens a browser error page instead of your app. Fix: add the exact scheme to Authentication → URL Configuration → Redirect URLs.',
            '**Letting the recovery session linger and silently signing the user in as if nothing happened.** Fix: explicitly clear `_needsNewPassword` only after `updateUser` succeeds.',
          ],
          tryIt:
            'Trigger a real reset email to your own test account, tap the link on your test device, and confirm the app opens directly to a "Set a new password" screen rather than the normal login/feed flow.',
          takeaway: 'A password reset link is not a normal sign-in — recognise the specific recovery event and route to a dedicated screen.',
        },
      ],
    },
    {
      id: 'm2-s3',
      title: 'Google Sign-In through Supabase',
      topics: [
        {
          id: 'm2-t8',
          title: 'Google Cloud OAuth clients — Android + Web, both free',
          explain:
            'Native Google Sign-In on Flutter needs two OAuth clients in Google Cloud Console — an Android client for the SHA-1 handshake, and a Web client whose ID Supabase uses to verify the token — and creating both costs nothing.',
          analogy:
            'Getting a duplicate house key cut needs the locksmith to verify you\'re the real owner (the Android client, matched by your app\'s fingerprint) before they will also register a spare key with the building\'s central office (the Web client, which Supabase trusts as the "real" identity of your app).',
          theory:
            'For **native** Google Sign-In (the recommended, better-UX approach for a mobile app — a proper account picker instead of a browser redirect), you need two separate OAuth 2.0 client IDs in the same Google Cloud project: an **Android** client, matched to your app\'s **package name and SHA-1 signing fingerprint** (no secret involved, since Android verifies via the signature itself), and a **Web application** client, which has an actual Client Secret. Counter-intuitively, the **Web client ID** (not the Android one) is what you pass as `serverClientId` to the `google_sign_in` package, and the **Web client ID + Secret** are what you paste into Supabase\'s Google provider settings — this is how Supabase verifies the ID token your app receives really was issued for your app.\n\nCreating a Google Cloud project and OAuth clients is entirely free — Google only requires billing to be enabled for certain *paid* APIs (Maps, some AI APIs), never for OAuth client creation or the consent screen.',
          whyItMatters:
            'This Android-client-plus-Web-client-ID pairing is the single most confusing part of wiring Google Sign-In on any Firebase *or* Supabase Flutter app, and getting the "wrong" client ID in the wrong place is the #1 cause of a mysteriously failing sign-in. Understanding *why* two clients exist turns a frustrating trial-and-error debugging session into a five-minute checklist.',
          steps: [
            'At `console.cloud.google.com`, create a new project (or reuse one) — no billing required.',
            'Go to **APIs & Services → OAuth consent screen**, set it to **External**, fill in the app name "LocalInsta" and your email — no card requested.',
            'Go to **Credentials → Create Credentials → OAuth client ID**, type **Android**: enter package name `com.thanthrajnaani.localinsta` and your debug SHA-1 (next topic shows how to get it).',
            'Create a second OAuth client ID, type **Web application** — no redirect URIs needed yet for the native flow; note its **Client ID** and **Client Secret**.',
            'In the Supabase dashboard, **Authentication → Providers → Google**, paste the **Web** client\'s ID and Secret, and enable the provider.',
          ],
          code: `# Nothing to run yet — this topic is entirely console configuration.
# Checklist to keep straight:
#
# Android OAuth client  -> matched by package name + SHA-1, NO secret
#                        -> used implicitly by Google Play Services on-device
#
# Web OAuth client       -> has a Client ID AND Client Secret
#                        -> Client ID goes into google_sign_in's serverClientId
#                        -> Client ID + Secret go into Supabase's Google provider config`,
          pitfalls: [
            '**Pasting the Android client\'s ID into Supabase\'s Google provider settings.** Supabase needs the Web client, not the Android one — sign-in fails with a token audience mismatch. Fix: always use the Web client ID/Secret in Supabase.',
            '**Forgetting the Android client entirely and only creating a Web one.** The native account picker fails silently on-device because Google Play Services cannot match your app\'s signature to any registered Android client. Fix: both clients are required for the native flow.',
            '**Creating the OAuth consent screen as "Internal" instead of "External".** Internal restricts sign-in to your own Google Workspace organisation only — irrelevant and blocking for a public app. Fix: choose External (still free, just requires the consent screen fields).',
            '**Assuming any billing prompt during this flow is mandatory.** Google Cloud does show billing upsells in its UI, but none are required to create OAuth clients or use the consent screen at the "Testing" publishing status. Fix: dismiss any billing prompts; you do not need them for this course.',
          ],
          tryIt:
            'Create both OAuth clients now and paste the Web client ID + Secret into Supabase\'s Google provider settings, leaving the SHA-1 field on the Android client blank for a moment — you will fill it in from the very next topic.',
          takeaway: 'Native Google Sign-In needs two OAuth clients — the Android one authenticates your app\'s signature, the Web one is what Supabase actually trusts.',
        },
        {
          id: 'm2-t9',
          title: 'The SHA-1 fingerprint dance',
          explain:
            'Generate your debug keystore\'s SHA-1, register it on the Android OAuth client, and remember release builds need their own SHA-1 later.',
          analogy:
            'Every signature on a bank cheque is compared against a signature card on file — a debug build and a release build sign with two different "pens", so each needs its own signature registered before the bank (Google) will honour it.',
          theory:
            'Every Android app is cryptographically **signed** — during development, Flutter auto-generates and uses a shared **debug keystore** on your machine; production builds use a separate **release keystore** you generate yourself (covered fully in Module 9). Google Sign-In validates the calling app by checking its **SHA-1 certificate fingerprint** against what is registered on the Android OAuth client — an unregistered fingerprint means Google refuses to hand back a token at all, no error dialog, just silent failure or a generic `ApiException: 10`.\n\n`cd android && ./gradlew signingReport` prints every variant\'s SHA-1 (and SHA-256). For now you only need the **debug** SHA-1; register it on the Android OAuth client from the previous topic. You will repeat this exact step with your **release** keystore\'s SHA-1 in Module 9, right before shipping — forgetting that second registration is the single most common "Google Sign-In worked in development but broke in the release APK" bug.',
          whyItMatters:
            '`ApiException: 10` (DEVELOPER_ERROR) is one of the most-searched Android errors precisely because a missing SHA-1 gives almost no useful information back to your app — recognising the symptom immediately, instead of debugging your Dart code for an hour, is a genuinely valuable skill.',
          steps: [
            'From the project root, run `cd android && ./gradlew signingReport`.',
            'Find the `Variant: debug` block and copy its `SHA1:` value.',
            'Go back to Google Cloud Console → your Android OAuth client → paste the SHA-1 into the fingerprint field.',
            'Save, and wait 1-5 minutes for Google\'s propagation (it is not always instant).',
            'Keep a note: "release SHA-1 still needed before shipping" — you will action this in Module 9.',
          ],
          code: `# From the android/ folder
$ ./gradlew signingReport

> Task :app:signingReport
Variant: debug
Config: debug
Store: C:\\Users\\you\\.android\\debug.keystore
Alias: AndroidDebugKey
SHA1: A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:A1:B2:C3:D4
SHA256: ...

Variant: release
Config: release
Store: android/app/upload-keystore.jks   # does not exist yet — Module 9
...`,
          pitfalls: [
            '**Getting `ApiException: 10` and assuming it is a Dart/Flutter bug.** It almost always means an unregistered or mismatched SHA-1. Fix: re-run `signingReport`, double-check the exact fingerprint is pasted into the correct Android OAuth client.',
            '**Registering the SHA-1 but not waiting for propagation.** Google\'s change can take a few minutes to take effect. Fix: wait, then retry, before assuming the fix did not work.',
            '**Forgetting that every teammate\'s machine has a different debug keystore (hence a different SHA-1).** Google Sign-In works for you, fails for a teammate. Fix: register every developer\'s debug SHA-1, or share one debug keystore file across the team (a common real-world practice).',
            '**Not planning ahead for the release SHA-1.** Google Sign-In silently breaks the day you ship a signed release build. Fix: note this now; Module 9 makes it an explicit checklist item.',
          ],
          tryIt:
            'Run `signingReport` yourself, register your real debug SHA-1 on the Android OAuth client, and write both the debug SHA-1 and today\'s date in your project README so future-you (in Module 9) knows exactly what was already done.',
          takeaway: 'Every signing key needs its own registered SHA-1 — debug now, release later — or Google Sign-In fails silently.',
        },
        {
          id: 'm2-t10',
          title: 'Implementing native Google Sign-In with signInWithIdToken',
          explain:
            'Use the `google_sign_in` package to get a native ID token, then hand it to `supabase.auth.signInWithIdToken` — no browser redirect required.',
          analogy:
            'Instead of sending a visitor outside the building to a separate verification office and back (a browser redirect), the native flow is like having the verification desk right inside your own lobby — the account picker appears as a native Android sheet, never leaving your app.',
          theory:
            'Add `google_sign_in` alongside `supabase_flutter`. Instantiate `GoogleSignIn(serverClientId: <your Web client ID>)` — the `serverClientId` is exactly the Web OAuth client from two topics ago, and it is what makes the returned `idToken` valid for Supabase to check. Calling `googleSignIn.signIn()` shows the native account picker; on success, `googleAuth.idToken` and `googleAuth.accessToken` are passed to `supabase.auth.signInWithIdToken(provider: OAuthProvider.google, idToken: idToken, accessToken: accessToken)`, which both verifies the token **and** completes the Supabase sign-in in one call.\n\nWrap this in `AuthRepository.signInWithGoogle()` so the rest of the app treats it identically to email/password sign-in — same `onAuthStateChange` stream, same `AuthGate` reaction.',
          whyItMatters:
            'This exact pattern — native account picker feeding an ID token into a backend\'s own auth verification — is the modern standard across Firebase *and* Supabase *and* most other backends, because it avoids the clunkier, slower browser-redirect OAuth dance on mobile.',
          steps: [
            'Add `google_sign_in: ^6.2.2` to `pubspec.yaml`, run `flutter pub get`.',
            'Add `signInWithGoogle()` to `AuthRepository`, instantiating `GoogleSignIn(serverClientId: <Web client ID>)`.',
            'Call `.signIn()`; guard for the user cancelling (returns `null`, not an exception).',
            'Extract `idToken` and `accessToken` from `googleAuth.authentication`.',
            'Call `supabase.auth.signInWithIdToken(...)`; wrap in `try`/`catch` like every other auth call.',
            'Add a "Continue with Google" button on both `SignInScreen` and `SignUpScreen` calling this method.',
          ],
          code: `class AuthRepository {
  // ...existing code from earlier topics...

  final _googleSignIn = GoogleSignIn(
    serverClientId: '123456789-abc.apps.googleusercontent.com', // Web client ID
  );

  Future<void> signInWithGoogle() async {
    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) return; // user cancelled the picker — not an error

    final googleAuth = await googleUser.authentication;
    final idToken = googleAuth.idToken;
    final accessToken = googleAuth.accessToken;

    if (idToken == null) {
      throw const AuthException('Google sign-in did not return an ID token.');
    }

    await _client.auth.signInWithIdToken(
      provider: OAuthProvider.google,
      idToken: idToken,
      accessToken: accessToken,
    );
  }
}

// SignInScreen — a Google button that reuses the same submitting/error pattern
OutlinedButton.icon(
  onPressed: _submitting ? null : () async {
    setState(() => _submitting = true);
    try {
      await context.read<AuthRepository>().signInWithGoogle();
    } on AuthException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  },
  icon: const Icon(Icons.g_mobiledata),
  label: const Text('Continue with Google'),
)`,
          pitfalls: [
            '**Using the Android client ID as `serverClientId` instead of the Web one.** `idToken` comes back `null` with no clear error. Fix: `serverClientId` is always the Web client ID.',
            '**Treating a `null` return from `.signIn()` as an error.** It means the user cancelled the picker — a completely normal outcome, not a failure to report. Fix: silently return, no SnackBar needed.',
            '**Not handling the case where `idToken` is present but `accessToken` is not (varies by platform/version).** Fix: `accessToken` is often optional for Supabase\'s call; check the current `supabase_flutter` docs and only require what your version actually needs.',
            '**Forgetting this entirely fails if the SHA-1 from the previous topic was not registered or has not propagated yet.** Fix: if Google Sign-In fails immediately with no picker shown, re-check the SHA-1 topic before debugging this code further.',
          ],
          tryIt:
            'Wire the button, tap it on a real device or emulator with a Google account signed in, pick an account, and confirm a new row appears in Supabase\'s **Authentication → Users** with your Google email — with `email_confirmed_at` already set, since Google itself already verified the email.',
          takeaway: 'The native flow trades a browser redirect for one ID token handoff — same Supabase session on the other end.',
        },
        {
          id: 'm2-t11',
          title: 'Session persistence & what "safe sign out" means',
          explain:
            '`supabase_flutter` persists sessions to local storage automatically — sign out must clear that, cancel subscriptions, and reset local caches, not just call one API.',
          analogy:
            'Simply telling the front-desk register "this guest checked out" is not enough if the room key still opens the door — a proper checkout also deactivates the key card. `signOut()` deactivating the Supabase session is the register entry; clearing local caches is deactivating the key.',
          theory:
            '`supabase_flutter` automatically persists the current session (via `shared_preferences` under the hood) so a user stays signed in across app restarts — you get this for free, no extra code needed. `AuthRepository.signOut()` calls `supabase.auth.signOut()`, which invalidates the refresh token server-side and clears the persisted local session; the `onAuthStateChange` stream then fires a `signedOut` event, which `SessionState` picks up and the `AuthGate` reacts to automatically.\n\n**Safe sign out** goes one step further in a real app: any feature-level `ChangeNotifier` holding user-specific cached data (a `FeedState` with cached posts, a `NotificationState` with an unread count) should also reset itself on sign-out, so a second user signing in on the same device never briefly sees the previous user\'s cached data flash on screen.',
          whyItMatters:
            'Shared or shop-floor devices are common in a hyperlocal, small-business context — the same phone genuinely might sign in as two different LocalInsta users in one day. A sign-out that leaves stale cached data behind is a real privacy bug, not just a cosmetic glitch.',
          steps: [
            'Confirm session persistence works: sign in, fully close the app, reopen it, and observe the user is still signed in with no extra code.',
            'Add `signOut()` to `AuthRepository`, calling `_client.auth.signOut()`.',
            'In your top-level app widget, listen for the session becoming `AuthSignedOut` and, at that point, call a `resetAll()` method on every other feature `ChangeNotifier` (feed, notifications, chat) via `context.read`.',
            'Add a "Sign out" button in the profile screen calling `authRepository.signOut()` with a confirmation dialog.',
            'Manually test: sign in as user A, note some cached state, sign out, sign in as user B, and confirm no trace of A\'s data appears anywhere.',
          ],
          code: `// AuthRepository
Future<void> signOut() async {
  await _client.auth.signOut(); // clears persisted session + fires signedOut event
}

// A confirmation dialog before the destructive action
Future<void> _confirmSignOut(BuildContext context) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Sign out?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Sign out')),
      ],
    ),
  );
  if (confirmed == true && context.mounted) {
    await context.read<AuthRepository>().signOut();
  }
}

// Every feature ChangeNotifier exposes a reset, called when session -> signed out
class FeedState extends ChangeNotifier {
  List<Post> _posts = [];
  void resetAll() {
    _posts = [];
    notifyListeners();
  }
}`,
          pitfalls: [
            '**Only calling `auth.signOut()` and assuming everything else "just clears".** Feature-level caches (feed, chat, notifications) hold their own state independently and do not know a sign-out happened unless told. Fix: explicitly reset every feature ChangeNotifier on sign-out.',
            '**Signing out with no confirmation dialog.** An accidental tap loses an in-progress caption draft with zero warning. Fix: confirm before any destructive/disruptive action.',
            '**Assuming session persistence means you never need to handle a `AuthSignedOut` state at cold start.** A token can also expire or be revoked server-side while the app is closed. Fix: `SessionState` must genuinely react to `AuthLoading` → `AuthSignedIn`/`AuthSignedOut` on every cold start, not assume the previous session is still valid.',
            '**Leaving image/network caches (from `cached_network_image`, Module 4) untouched on sign-out on a shared device.** Not a security leak (cache is content, not credentials) but can look like a privacy issue if a previous user\'s avatar flashes briefly. Fix: acceptable to leave for this course, but worth noting as a real production concern.',
          ],
          tryIt:
            'Kill and relaunch the app after signing in and confirm you land straight on the feed, not the login screen — then sign out with the confirmation dialog and confirm you land back on the login screen with no stale data visible anywhere.',
          takeaway: 'signOut() is not just one API call — it is an event every feature-level cache should react to, not just the session itself.',
        },
      ],
    },
    {
      id: 'm2-s4',
      title: 'Auto-provisioning & the auth gate',
      topics: [
        {
          id: 'm2-t12',
          title: 'Postgres trigger: auto-create a profile row on signup',
          explain:
            'A `handle_new_user()` function plus a trigger on `auth.users` automatically inserts a matching row into `public.profiles` the instant any account is created — email, Google, or otherwise.',
          analogy:
            'A hospital does not make a new patient fill out a second, separate admission form for the pharmacy — registering at the front desk automatically creates their pharmacy record behind the scenes. The database trigger is that automatic behind-the-scenes step for LocalInsta: signing up automatically creates a matching profile row.',
          theory:
            'Postgres **triggers** run a function automatically in response to a table event — here, `after insert on auth.users`. The function, conventionally named `handle_new_user()`, runs with elevated privilege (`security definer`) so it can insert into `public.profiles` even though the calling context (a brand-new, not-yet-fully-authenticated user) would not normally have permission to. It reads `new.id` and `new.email` from the just-inserted `auth.users` row and inserts a starter `profiles` row — a default `username` derived from the email, an empty bio, zero follower counts.\n\nThis single trigger is what guarantees **every** signed-up user — whether via email/password or Google — ends up with exactly one matching `profiles` row, with no risk of the Flutter app "forgetting" to create one on some code path. It is covered fully with the rest of the schema in Module 3, but wiring it now means Module 2\'s signup flows are already complete end-to-end.',
          whyItMatters:
            'Relying on client-side code ("after signup succeeds, also insert a profile row") is a common real-world bug source — a crash, a killed app, or a flaky network between the two calls leaves a user with an auth account but no profile. A database trigger makes this atomic and impossible to skip.',
          steps: [
            'In SQL Editor, write a `handle_new_user()` function that inserts into `public.profiles` (created properly in Module 3; a minimal version is fine here).',
            'Mark the function `security definer` so it can write despite normal RLS restrictions.',
            'Create a trigger `on_auth_user_created` firing `after insert on auth.users for each row execute function handle_new_user()`.',
            'Sign up a fresh test account from the app.',
            'Query `select * from public.profiles;` and confirm a matching row appeared with zero manual Flutter code.',
          ],
          code: `-- A minimal profiles table so the trigger has somewhere to write
-- (the full version with RLS arrives in Module 3)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    -- derive a starter username from the email, made unique-ish
    split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();`,
          pitfalls: [
            '**Forgetting `security definer`.** The insert fails silently or errors, because a brand-new auth row has no RLS-granted permission to write into `profiles` yet. Fix: always mark this specific function `security definer`.',
            '**Making the derived username genuinely unique-proof.** Two people with the same email local-part could theoretically collide. Fix: the id-suffix trick here is good enough for a course; a production app might retry with a random suffix on conflict.',
            '**Doing this insert from Flutter instead of a trigger.** Reintroduces the exact "forgot to create the profile" race condition this topic exists to eliminate. Fix: the trigger is the single, atomic source of truth — Flutter never manually inserts a profile row on signup.',
            '**Not testing the Google Sign-In path against this same trigger.** Some learners only test email signup. Fix: verify a Google-based signup also produces a `profiles` row, since the trigger fires on any `auth.users` insert regardless of provider.',
          ],
          tryIt:
            'Sign up via both email/password and Google Sign-In, and confirm `select id, email from auth.users` and `select id, username from public.profiles` show a matching row for both, with zero manual profile-creation code anywhere in your Flutter app.',
          takeaway: 'A security-definer trigger on auth.users guarantees every signup gets exactly one profile row — atomically, regardless of which auth method was used.',
        },
        {
          id: 'm2-t13',
          title: 'The AuthGate widget',
          explain:
            'One widget at the root of the app watches `SessionState` and routes between a splash spinner, the login flow, and the main app — no screen anywhere else needs to think about auth.',
          analogy:
            'A single receptionist at the one front door decides who goes where — into the waiting room, into the main hall, or turned away — so that no other door in the building needs its own separate ID check. AuthGate is that one receptionist for the whole of LocalInsta.',
          theory:
            '`AuthGate` is a `StatelessWidget` (or `Consumer<SessionState>`) that switches on the sealed `AuthSession` from Module 2\'s session-stream topic: `AuthLoading` renders a splash/spinner, `AuthSignedOut` renders the `LoginScreen` (nested tab bar for sign-in/sign-up), `AuthSignedIn` renders LocalInsta\'s real main scaffold — the five-tab bottom navigation (Feed, Explore, Post, Notifications, Profile) built out across the rest of this course.\n\nBecause every other screen is reached only by navigating *through* this signed-in branch, none of them ever need to independently check "is someone logged in?" — that question is answered exactly once, at the root.',
          whyItMatters:
            'This is the architectural payoff of everything else in this module — a sealed `AuthSession`, a repository, a session stream — all converge into one small, easy-to-read widget that is the entire authorization boundary of the app.',
          steps: [
            'Create `lib/app.dart` with `AuthGate` as the `home` of `MaterialApp`.',
            'Use `context.watch<SessionState>().session` and `switch` over the three cases.',
            '`AuthLoading` → a simple centered `CircularProgressIndicator` on a branded background.',
            '`AuthSignedOut` → `LoginScreen` (hosting both sign-in and sign-up, e.g. via a `TabBar`).',
            '`AuthSignedIn` → the main `HomeScaffold` (bottom nav shell — a placeholder for now, built out from Module 5 onward).',
          ],
          code: `class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionState>().session;

    return switch (session) {
      AuthLoading() => const _SplashScreen(),
      AuthSignedOut() => const LoginScreen(),
      AuthSignedIn() => const HomeScaffold(), // built out from Module 5 onward
    };
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();
  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}

// lib/app.dart
class LocalInstaApp extends StatelessWidget {
  const LocalInstaApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LocalInsta',
      theme: lightTheme,
      darkTheme: darkTheme,
      themeMode: ThemeMode.system,
      home: const AuthGate(),
    );
  }
}`,
          pitfalls: [
            '**Adding an auth check inside individual screens "just to be safe".** Duplicates logic that AuthGate already guarantees, and drifts out of sync over time. Fix: trust AuthGate as the single boundary; downstream screens assume a signed-in user.',
            '**Using `Navigator.push` to "go to" the signed-in app after login instead of letting the session-driven switch handle it.** Leaves a login screen sitting underneath on the navigation stack. Fix: the `switch` swapping the entire `home` widget is what correctly discards the login screen, not a push.',
            '**Forgetting the `AuthLoading` branch and defaulting straight to `AuthSignedOut`.** Every cold start flashes the login screen for a moment even for already-signed-in users. Fix: always render a neutral splash for the loading state.',
            '**Nesting AuthGate below other navigation instead of as `MaterialApp.home`.** Parts of the widget tree above it might render before auth state is known. Fix: keep AuthGate as close to the app root as possible.',
          ],
          tryIt:
            'Cold-start the app while already signed in and confirm you briefly see the splash, then land directly on the (placeholder) signed-in home — then sign out and confirm you land on the login screen with the entire signed-in scaffold gone from the widget tree.',
          takeaway: 'One AuthGate at the root, one exhaustive switch — every other screen in LocalInsta gets to assume a signed-in user and nothing else.',
        },
        {
          id: 'm2-t14',
          title: 'Wiring it all together in main.dart',
          explain:
            'Assemble every piece from this module — repository, SessionState, MultiProvider, AuthGate — into a working, testable auth flow end to end.',
          analogy:
            'Handing over a finished dish is not just cooking each component separately — the rice, the sambar, the papad all have to land on the same plate at the same time. This topic is the plating: every class built this module, served together on one screen.',
          theory:
            '`MultiProvider` at the app root wires `AuthRepository` (a plain value, rarely rebuilt) and `ChangeNotifierProvider` for `SessionState` (which depends on the repository) together, in the correct order — `SessionState`\'s constructor needs a live `AuthRepository` instance, so `ChangeNotifierProxyProvider` or simply constructing `SessionState(AuthRepository())` directly inside `create:` both work for this stage of the app.\n\nThis is the exact moment the whole module clicks together: sign up, confirm (or skip confirmation in dev), sign in with email or Google, land on a signed-in placeholder screen, sign out, land back on login — with every intermediate state (loading, error, submitting) handled gracefully.',
          whyItMatters:
            'Integration is where "I understand each piece" becomes "I built a working feature" — this is the checkpoint that proves Module 2\'s auth system is genuinely done, not just a pile of unconnected files.',
          steps: [
            'In `main.dart`, after `Supabase.initialize()`, wrap `LocalInstaApp` in a `MultiProvider`.',
            'Provide `AuthRepository()` via a plain `Provider<AuthRepository>`.',
            'Provide `SessionState` via `ChangeNotifierProvider(create: (ctx) => SessionState(ctx.read<AuthRepository>()))`.',
            'Confirm `AuthGate` (already built) receives both correctly.',
            'Manually walk the full flow once: sign up → (confirm or skip) → sign in → see placeholder home → sign out → back at login → sign in with Google → same placeholder home.',
          ],
          code: `Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  Env.assertConfigured();
  await Supabase.initialize(url: Env.supabaseUrl, anonKey: Env.supabaseAnonKey);

  runApp(
    MultiProvider(
      providers: [
        Provider<AuthRepository>(create: (_) => AuthRepository()),
        ChangeNotifierProvider<SessionState>(
          create: (ctx) => SessionState(ctx.read<AuthRepository>()),
        ),
      ],
      child: const LocalInstaApp(),
    ),
  );
}`,
          pitfalls: [
            '**Constructing `SessionState()` with no repository, or a fresh `AuthRepository()` instead of reading the provided one.** Works by accident today (both instances are stateless wrappers around the same singleton `supabase` client) but breaks the moment you inject a `FakeAuthRepository` for testing. Fix: always read the provided instance via `ctx.read<AuthRepository>()`.',
            '**Provider ordering mistakes** — referencing `AuthRepository` before it is provided higher in the tree. Fix: list `Provider<AuthRepository>` before the `ChangeNotifierProvider` that depends on it, exactly as shown.',
            '**Skipping the manual end-to-end walkthrough because "each piece worked in isolation".** Integration bugs (wrong provider order, a missed `mounted` check) only show up when you run the real flow start to finish. Fix: always do one full manual pass before calling a module done.',
            '**Leaving "Confirm email" off (from earlier in this module) and forgetting to note it.** Fix: keep that noted in your README as a known dev-mode setting, revisited before anything beyond personal use.',
          ],
          tryIt:
            'Do the full walkthrough described in the steps above on a real device, narrating each screen transition out loud to yourself — if any step feels surprising or requires a workaround, that is a signal to revisit the relevant earlier topic before moving to Module 3.',
          takeaway: 'A module is not done when each file compiles — it is done when you have walked the real user flow, start to finish, once.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm2-p1',
      type: 'Mini Project',
      title: 'Email/Password Auth, End to End',
      domain: 'Supabase Auth',
      duration: '2 hours',
      description:
        'Wire the full email/password flow — sign up, confirm, sign in, forgot password, sign out — behind the AuthRepository, SessionState, and AuthGate pattern, with the auto-profile trigger already firing correctly.',
      tools: ['Flutter', 'supabase_flutter', 'Supabase Auth', 'Postgres'],
      blueprint: {
        overview:
          'A complete, working email/password authentication flow: sign-up and sign-in screens with client-side validation and friendly error messages, a forgot-password flow with a real recovery-screen deep link, a sealed AuthSession-driven AuthGate, and a Postgres trigger that auto-creates a matching profiles row on every signup.',
        functionalRequirements: [
          '**Sign up.** Validated form, calls signUp, shows a confirm-email message.',
          '**Sign in.** Validated form, calls signInWithPassword, friendly error mapping.',
          '**Forgot password.** Sends a reset email, correctly routes the recovery deep link to a dedicated "set new password" screen.',
          '**Sign out.** Confirmation dialog, resets any feature-level cached state.',
          '**Auto-profile.** A signup always results in exactly one matching public.profiles row with zero manual Flutter code.',
        ],
        technicalImplementation: [
          '**features/auth/data/auth_repository.dart.** signUp, signInWithPassword, resetPasswordForEmail, signOut, onAuthStateChange passthrough.',
          '**features/auth/state/session_state.dart.** Sealed AuthSession (Loading/SignedIn/SignedOut), mapped from the auth stream, with a passwordRecovery branch.',
          '**features/auth/presentation/.** sign_up_screen.dart, sign_in_screen.dart, forgot_password_screen.dart, set_new_password_screen.dart.',
          '**app.dart.** AuthGate switching on the sealed session, MultiProvider wiring in main.dart.',
          '**SQL.** handle_new_user() trigger function + on_auth_user_created trigger on auth.users.',
        ],
        prompts: [
          {
            step: 1,
            label: 'AuthRepository + sealed AuthSession',
            outcome: 'The full auth data layer, no UI yet.',
            prompt:
              'Create lib/features/auth/data/auth_repository.dart with signUp, signInWithPassword, resetPasswordForEmail(redirectTo:), signOut, and an onAuthStateChange passthrough, all wrapping the shared supabase client and catching AuthException. Create lib/features/auth/state/session_state.dart with a sealed AuthSession (AuthLoading, AuthSignedIn(userId), AuthSignedOut) ChangeNotifier that listens to the repository stream, branching separately on AuthChangeEvent.passwordRecovery into a needsNewPassword flag.',
          },
          {
            step: 2,
            label: 'Sign up + sign in screens',
            outcome: 'Working forms with validation and friendly errors.',
            prompt:
              'Build lib/features/auth/presentation/sign_up_screen.dart and sign_in_screen.dart. Both: a Form with GlobalKey<FormState>, email/password TextFormFields with validators, a submitting bool disabling the button during the async call, try/on AuthException/finally error handling with a friendly-message mapper, and mounted checks around every post-await UI update. Sign-up shows a "check your email" SnackBar on success; sign-in does not navigate manually.',
          },
          {
            step: 3,
            label: 'Forgot password + recovery screen',
            outcome: 'A working password-reset loop including the deep-link callback.',
            prompt:
              'Build forgot_password_screen.dart (email-only form calling resetPasswordForEmail with redirectTo io.supabase.localinsta://reset-callback) and set_new_password_screen.dart (new-password form calling supabase.auth.updateUser). Wire Android deep-link handling (intent-filter for the io.supabase.localinsta scheme) so tapping the email link opens the app directly. Register this same scheme in Supabase\'s Redirect URLs allowlist.',
          },
          {
            step: 4,
            label: 'Auto-profile trigger + AuthGate',
            outcome: 'Signup always creates a profile row; the whole app is wired end to end.',
            prompt:
              'Write the SQL for a minimal public.profiles table, a security definer handle_new_user() function deriving a starter username from the email, and an on_auth_user_created trigger on auth.users. Build lib/app.dart\'s AuthGate switching on SessionState\'s sealed AuthSession (loading/signed-out/signed-in branches, plus routing to SetNewPasswordScreen when needsNewPassword is true), and wire MultiProvider in main.dart. Walk me through a full manual test: sign up, confirm the profiles row exists, sign in, request a password reset, complete it, sign out.',
          },
        ],
        deliverable:
          'A LocalInsta build where a brand-new user can sign up, get a matching profile row automatically, sign in, reset a forgotten password via a real email deep link, and sign out — with every step showing correct loading/error/success UI.',
      },
    },
    {
      id: 'm2-p2',
      type: 'Project',
      title: 'Native Google Sign-In',
      domain: 'Supabase Auth / OAuth',
      duration: '2 hours',
      description:
        'Wire native Google Sign-In through two Google Cloud OAuth clients and supabase.auth.signInWithIdToken, sharing the same session pipeline and auto-profile trigger as email/password auth.',
      tools: ['Flutter', 'google_sign_in', 'supabase_flutter', 'Google Cloud Console'],
      blueprint: {
        overview:
          'A "Continue with Google" button on both the sign-in and sign-up screens that opens the native account picker (no browser redirect), completes a Supabase session via signInWithIdToken, and results in the same auto-created profiles row as the email flow — because it fires the same auth.users trigger.',
        functionalRequirements: [
          '**Google Cloud setup.** An Android OAuth client (package name + debug SHA-1) and a Web OAuth client (ID + Secret) in one free Google Cloud project.',
          '**Supabase provider.** Google provider enabled with the Web client\'s ID + Secret.',
          '**Native sign-in.** GoogleSignIn(serverClientId: <Web client ID>) driving a native account picker, feeding idToken/accessToken into signInWithIdToken.',
          '**Shared pipeline.** Reuses the exact same AuthRepository, SessionState, and AuthGate as email/password — no parallel auth system.',
          '**Cancellation handling.** A user backing out of the account picker is treated as a no-op, not an error.',
        ],
        technicalImplementation: [
          '**Google Cloud Console.** OAuth consent screen (External), Android client, Web client — all free, no billing.',
          '**android/app/build.gradle / AndroidManifest.xml.** Package name matches the registered Android client exactly.',
          '**features/auth/data/auth_repository.dart.** signInWithGoogle() added alongside the existing methods.',
          '**Supabase dashboard.** Authentication → Providers → Google enabled with the Web credentials.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Google Cloud OAuth clients',
            outcome: 'Both OAuth clients created and correctly configured.',
            prompt:
              'Walk me through creating a free Google Cloud project, an External OAuth consent screen for "LocalInsta", an Android OAuth client using package name com.thanthrajnaani.localinsta and my debug SHA-1 (from `cd android && ./gradlew signingReport`), and a Web application OAuth client. Confirm none of this requires billing to be enabled.',
          },
          {
            step: 2,
            label: 'Supabase Google provider',
            outcome: 'Google enabled as a Supabase auth provider.',
            prompt:
              'Show me exactly where in the Supabase dashboard to paste the Web OAuth client\'s ID and Secret to enable Google as an auth provider, and how to verify it is active.',
          },
          {
            step: 3,
            label: 'signInWithGoogle in AuthRepository',
            outcome: 'A working native Google Sign-In method sharing the existing session pipeline.',
            prompt:
              'Add google_sign_in to pubspec.yaml. Add a signInWithGoogle() method to AuthRepository that instantiates GoogleSignIn(serverClientId: <Web client ID>), calls signIn(), treats a null result (user cancelled) as a silent no-op, extracts idToken/accessToken from the authentication object, throws a clear AuthException if idToken is null, and calls supabase.auth.signInWithIdToken(provider: OAuthProvider.google, idToken:, accessToken:).',
          },
          {
            step: 4,
            label: 'Google buttons on sign-in/sign-up',
            outcome: 'A visible, working "Continue with Google" button on both screens.',
            prompt:
              'Add a "Continue with Google" OutlinedButton.icon to both sign_in_screen.dart and sign_up_screen.dart, reusing the same submitting-state and error-SnackBar pattern as the email/password buttons, calling authRepository.signInWithGoogle(). Confirm a Google sign-in also lands on the same AuthGate-driven signed-in screen as email/password, and that the same handle_new_user trigger creates a matching profiles row.',
          },
        ],
        deliverable:
          'A working "Continue with Google" button that opens a native account picker and lands the user on the same signed-in app as email/password auth, with a correctly auto-created profile row.',
      },
    },
  ],
  quiz: [
    {
      id: 'm2-q1',
      q: 'Why can LocalInsta\'s Postgres RLS policies use `auth.uid()` to identify the current user?',
      options: [
        'The database decodes the same JWT session token that Supabase Auth issued to the client on sign-in',
        'Postgres has its own separate login system unrelated to Supabase Auth',
        'auth.uid() reads a value the Flutter app sends manually with every request',
        'It only works for Google Sign-In, not email/password',
      ],
      answer: 0,
    },
    {
      id: 'm2-q2',
      q: 'Why does LocalInsta wrap every Supabase Auth call inside an AuthRepository instead of calling supabase.auth directly from widgets?',
      options: [
        'It centralizes error handling and makes the auth logic testable with a fake implementation',
        'Supabase requires all Auth calls to go through a repository class',
        'It makes network requests faster',
        'Widgets are not allowed to import supabase_flutter',
      ],
      answer: 0,
    },
    {
      id: 'm2-q3',
      q: 'Why is AuthSession modeled as a Dart 3 sealed class instead of a plain nullable boolean?',
      options: [
        'It can represent a genuine third "still checking" loading state, and the compiler enforces every case is handled in a switch',
        'Sealed classes are required by supabase_flutter',
        'It makes the app compile faster',
        'Booleans cannot be used with ChangeNotifier',
      ],
      answer: 0,
    },
    {
      id: 'm2-q4',
      q: 'For native Google Sign-In on Flutter, which OAuth client ID should be passed as `serverClientId` to the google_sign_in package?',
      options: [
        'The Web application client ID — Supabase verifies the token against this one',
        'The Android client ID — it matches the app\'s package name',
        'Either one works interchangeably',
        'Neither; serverClientId is not required',
      ],
      answer: 0,
    },
    {
      id: 'm2-q5',
      q: 'Why does LocalInsta use a Postgres trigger on auth.users to create the matching profiles row, instead of inserting it from Flutter right after signUp() succeeds?',
      options: [
        'A trigger is atomic with the signup itself — a crashed or killed app can never leave a user with an auth account but no profile',
        'Postgres triggers run faster than Flutter code',
        'Flutter cannot write to the profiles table under any circumstances',
        'It removes the need for Row Level Security',
      ],
      answer: 0,
    },
    {
      id: 'm2-q6',
      q: 'What should happen after a user taps "Sign out" and the AuthGate reacts to AuthSignedOut?',
      options: [
        'Every feature-level ChangeNotifier holding cached user data should reset itself, not just the auth session',
        'Nothing further is needed beyond the Supabase signOut() call',
        'The app should restart entirely',
        'Only the profile screen needs to clear its state',
      ],
      answer: 0,
    },
  ],
}
