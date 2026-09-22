# Module 2 Reels — Authentication (10 reels)

Deep-dive arc, Season 2. Same 5-beat format as the trailer series
(`../reel-scripts-01-10.md`). Screen recording = phone (real Google picker) + code editor.

---

### Reel 1 — "What ACTUALLY Happens When You Tap 'Sign In'"
**Hook:** *(Tap "Continue with Google", freeze frame right before picker appears)* "Ee ondhu tap, hinde yenu nadiythu gotta?"
**Setup:** On-screen: **"auth.users — the table you never write to directly"**
**Payoff:** Diagram-style: sign-in → Supabase creates a row in `auth.users` with a UUID → returns a JWT session (access token + refresh token). VO: "Ee UUID ne, nim app na REAL identity — email badalisidru, idhu never change aagalla."
**Punchline:** "Idhu invisible kelasa, aadre ELLA security idhe UUID mele build aagide!"
**CTA:** "Reel 2 — the repository pattern, why you never call Supabase directly from a screen. Follow!"
**Caption:** One tap, a lot happens behind it — a real user row, a real session token. Auth explained in 30s.
**Tags:** #Supabase #Authentication #JWT #BackendDev #Karnataka

---

### Reel 2 — "Never Call Supabase Directly From Your Screen"
**Hook:** *(Show messy code: Supabase calls scattered across 5 different screens)* "Idhu nodi — same login code, 5 kade copy-paste aagide!"
**Setup:** On-screen: **"AuthRepository — one file, every screen calls it"**
**Payoff:** Code: `class AuthRepository { signUp(), signInWithPassword(), signOut() }`. VO: "Restaurant alli, waiter kitchen ge hogalla — order kodthare, kitchen counter handle maadutte. AuthRepository idhe counter, screen galella waiter!"
**Punchline:** "Bug bantre, ondhe file check maadidre saaku — 5 screen alli hudkodu beke illa!"
**CTA:** "Reel 3 — the 3 states every login screen actually has (most apps get this wrong). Follow!"
**Caption:** Every screen talks to ONE repository, never the SDK directly. Cleaner code, easier debugging.
**Tags:** #FlutterArchitecture #CleanCode #RepositoryPattern #MobileDev

---

### Reel 3 — "Loading, Signed In, Signed Out — The 3 States Most Apps Get Wrong"
**Hook:** *(App opens, flashes login screen for a split second even though you're already logged in)* "Idhu kandhira? Already login aagidhe, aadre login screen flash aagutte!"
**Setup:** On-screen: **"A boolean can't say 'still checking' — a sealed class can"**
**Payoff:** Code: `sealed class AuthSession { AuthLoading, AuthSignedIn, AuthSignedOut }`. VO: "True/false matra irutte antha, 'ivaga check maadthaidini' antha state illa. 3rd state add maadidre, ee flash bug fix aagutte."
**Punchline:** "Chikka detail, aadre idhe 'polished app' feel kodutte!"
**CTA:** "Reel 4 — sign-up validation done right. Follow!"
**Caption:** That annoying login-screen flash on app open? A missing "still loading" state. Here's the fix.
**Tags:** #Dart #SealedClasses #FlutterUX #AppPolish #CodingTips

---

### Reel 4 — "Validate BEFORE You Waste a Network Call"
**Hook:** *(Submit a form with a 3-character password, spinner shows, then fails)* "Password chikkadagide antha, server ge kaadi, aamele error bartte — waste!"
**Setup:** On-screen: **"Client-side validation = instant feedback, zero wasted requests"**
**Payoff:** Code: `TextFormField` validators checking email format + password length BEFORE `signUp()` is ever called. VO: "Form alle check maadidre, network call beke illa. Fast, aadhare kooda — server side check ALWAYS irutte, backup ge."
**Punchline:** "Idhu simple, aadre 90% beginner form alli idhu missing irutte!"
**CTA:** "Reel 5 — the toggle that speeds up your dev testing 10x. Follow!"
**Caption:** Catch a bad password before it ever touches the network. Simple validators, instant feedback.
**Tags:** #FormValidation #FlutterForms #UXDesign #MobileAppDev

---

### Reel 5 — "The Dev Toggle That Saves You Hours of Testing"
**Hook:** *(Sign up, then immediately try to sign in, get blocked)* "Sign up aaythu, sign in try maadidhre — 'confirm your email' antha block aagutte!"
**Setup:** On-screen: **"Confirm email toggle — OFF for dev speed, ON before real users"**
**Payoff:** Supabase dashboard: Authentication → Providers → Email → toggle "Confirm email" off. Sign up + sign in immediately, works instantly. VO: "Testing time alli, idhu OFF maadi — account udhane usable aagutte. Real app ge, back ON maadbeku, security ge."
**Punchline:** "Nan first week, idhu gotta illa antha, 'nan login broken' antha 2 hours debug maadidhe. It wasn't broken — email just wasn't confirmed!"
**CTA:** "Reel 6 — password reset, done properly with a real deep link. Follow!"
**Caption:** "My login isn't working" is usually just an unconfirmed email. The one dashboard toggle that saves hours.
**Tags:** #Supabase #DevTips #DebuggingTips #FlutterAuth #TechStudent

---

### Reel 6 — "Forgot Password? Here's What ACTUALLY Happens"
**Hook:** *(Tap "Forgot password", email arrives, tap the link — app opens directly)* "Ee link tap maadidhe, browser alla — nam APP udhane open aaythu!"
**Setup:** On-screen: **"Deep links — a link that opens YOUR app, not a browser"**
**Payoff:** Show the flow: `resetPasswordForEmail()` → email link → Android intent-filter catches it → app opens to a "Set new password" screen, recognizing the special recovery event.
**Punchline:** "Idhu 'magic' hage kaanisutte, aadre idhu ondhu specific event type check maadodhu, adhithe!"
**CTA:** "Reel 7 — the two Google Cloud clients you need (and why just one isn't enough). Follow!"
**Caption:** A password-reset email link that opens your app directly, straight to the right screen. Deep links explained.
**Tags:** #DeepLinking #FlutterDev #PasswordReset #MobileUX

---

### Reel 7 — "Google Login Needs TWO Cloud Clients (Nobody Tells You This)"
**Hook:** *(Confused face)* "Google login setup maadthini antha, ondhu client saaku antha thili — WRONG!"
**Setup:** On-screen: **"Android client = your app's fingerprint. Web client = what Supabase trusts."**
**Payoff:** Google Cloud Console: create Android OAuth client (package name + SHA-1) → create Web OAuth client (ID + Secret) → paste Web credentials into Supabase's Google provider. VO: "Android client, Google Play Services verify maadutte. Web client ID, Supabase verify maadutte. Ondhu miss aadre, login FAIL aagutte."
**Punchline:** "Idhu confusing part — nan idhu first time 3 hours struggle maadidhe. Ivaga nimge 30 second alli!"
**CTA:** "Reel 8 — the error every Flutter dev sees at least once (ApiException 10). Follow!"
**Caption:** Google Sign-In needs TWO OAuth clients, not one — and mixing them up is the #1 setup mistake.
**Tags:** #GoogleOAuth #GoogleCloudConsole #AndroidDev #FlutterAuth #SetupTips

---

### Reel 8 — "ApiException: 10 — The Error Every Android Dev Fears"
**Hook:** *(Show the cryptic error: `ApiException: 10`)* "Ee error nodidhira? Idhu Google search alle number 1 Flutter error!"
**Setup:** On-screen: **"It's ALWAYS a missing SHA-1 fingerprint"**
**Payoff:** Terminal: `cd android && ./gradlew signingReport` → copy the debug SHA-1 → paste into Google Cloud Console's Android client → wait 2 min → retry → login works.
**Punchline:** "Idhu error, error message alle 'yenu problem' antha helalla — idhu nam course alli, idhu instant recognize maadthivi!"
**CTA:** "Reel 9 — one gate, every screen. The AuthGate pattern. Follow!"
**Caption:** ApiException 10 has almost always got one fix: a missing SHA-1 fingerprint. Here's the 2-minute solution.
**Tags:** #FlutterErrors #AndroidDebugging #GoogleSignIn #SHA1 #DeveloperLife

---

### Reel 9 — "One Gate. Every Screen Behind It Just... Trusts It."
**Hook:** *(Show the app instantly routing between splash → login → feed based on auth state)* "Nodi — ondhu widget, WHOLE app na navigation decide maadutte!"
**Setup:** On-screen: **"AuthGate — the single receptionist at the front door"**
**Payoff:** Code: `switch` over `AuthLoading / AuthSignedOut / AuthSignedIn` returning splash / login / home screen. VO: "Idhu ondhu place alli decide aagutte — matte YAVUDHE screen, 'login aagide antha check maadbeku' antha yochane maadalla."
**Punchline:** "Idhu architecture idea — chikka, aadre POWERFUL. Whole app, ondhu gate!"
**CTA:** "That's Module 2. Module 3 — Row Level Security, the concept that protects everything. Follow!"
**Caption:** One receptionist at the front door — every screen behind it can just assume you're logged in. The AuthGate pattern.
**Tags:** #FlutterArchitecture #AuthGate #AppDesign #MobileDevelopment

---

### Reel 10 — "Module 2 Recap: Real Login, Zero Shortcuts"
**Hook:** *(Show both sign-in methods working: email/password AND Google, back to back)* "Email login, Google login — RENDU idhu properly build aaythu!"
**Setup:** On-screen: **"Sessions. Validation. Password reset. Google OAuth. AuthGate."**
**Payoff:** Fast recap flash-frames of the 9 reels. VO: "Idhu 'fake demo login' alla — real session, real security, real error handling."
**Punchline:** "Ivaga nam users login aagbahudu. Adhre — database alli, nam data secure aagide antha, hege guarantee maadodhu?"
**CTA:** "Module 3 next — the ONE line of SQL that protects your whole database. Follow!"
**Caption:** Module 2 done — real authentication, not a fake demo button. Next: the database security that backs it up.
**Tags:** #FlutterAuth #ModuleRecap #Supabase #LearnFlutter #Karnataka
