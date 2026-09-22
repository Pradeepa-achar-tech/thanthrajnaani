# Module 1 Reels — Supabase Project & Flutter Scaffold (10 reels)

Deep-dive arc, Season 2. Same 5-beat format as the trailer series
(`../reel-scripts-01-10.md`). Screen recording = Supabase dashboard + your Flutter project.

---

### Reel 1 — "Sign Up for a Real Database. No Card. I'll Prove It."
**Hook:** *(Cursor hovering over supabase.com signup)* "Nan idhu live madthini — nodi, card kelthara antha!"
**Setup:** On-screen: **"supabase.com → New Project → done"**
**Payoff:** Live signup: email/GitHub → project name → password → region (`ap-south-1`) → wait 2 min timelapse → project ready. Circle the payment section: **empty, never appeared.**
**Punchline:** "Firebase alli Storage beku antha, card kelthare. Idhu? Ondhu sala kooda kelalilla!"
**CTA:** "Reel 2 — the dashboard tour, all 6 panels in 30 seconds. Follow!"
**Caption:** A real Postgres database, real Auth, real Storage — zero card, ever. Signing up live.
**Tags:** #Supabase #FreeTier #NoCard #BackendAsAService #StudentDeveloper

---

### Reel 2 — "The Supabase Dashboard, Toured in 30 Seconds"
**Hook:** *(Dashboard sidebar visible)* "6 panels, ondhu course full ide idhu use maadi!"
**Setup:** On-screen: **"Table Editor · SQL Editor · Auth · Storage · Realtime · API Docs"**
**Payoff:** Quick-cut, 4s each: Table Editor (spreadsheet view) → SQL Editor (run `select now();`) → Authentication (user list) → Storage (bucket view) → Realtime toggle → API Docs (auto-generated).
**Punchline:** "Idhu dashboard alla, idhu nim whole backend — ondhe page alli!"
**CTA:** "Reel 3 — the ONE key you must NEVER put in your app. Follow!"
**Caption:** Every button you need to build a real backend, in one dashboard. Quick tour.
**Tags:** #Supabase #WebDev #BackendDevelopment #TechTutorial #Karnataka

---

### Reel 3 — "The Key You Must NEVER Ship (anon vs service_role)"
**Hook:** *(Dramatic zoom on two keys on screen)* "Ee two keys — ondhu safe, matthondhu... nim app na destroy maadbahudu!"
**Setup:** On-screen: **"anon key = public. service_role key = NEVER in your app."**
**Payoff:** Highlight `anon` key: "designed to be public, RLS protects it." Highlight `service_role`: "bypasses EVERY security rule." VO: "service_role key nim app binary alli irutte antha, decompile maadi, yaaru bekaadru nim WHOLE database read/write maadbahudu!"
**Punchline:** "Idhu real incident — yaaro developer ee mistake maadi, database wipe aaythu. Nam course alli, service_role key ondhu sala kooda touch maadalla!"
**CTA:** "Reel 4 — never hardcode a secret again, the --dart-define trick. Follow!"
**Caption:** Two keys, two completely different risk levels. The one rule that keeps your database safe.
**Tags:** #Supabase #APIKeySecurity #BackendSecurity #WebSecurity #CodingTips

---

### Reel 4 — "Never Hardcode a Secret Again"
**Hook:** *(Show a GitHub repo with an API key visible in code)* "Idhu nodi — secret key, straight up committed. Public repo alli!"
**Setup:** On-screen: **"--dart-define — secrets that never touch your source code"**
**Payoff:** Code: `String.fromEnvironment('SUPABASE_URL')` — value comes from a build flag, not a literal string. VO: "Source file alli, key na NAME matra ide, VALUE alla. Build maadoke, terminal alli flag pass maadthivi — git history alli ondhu sala kooda kaanisalla!"
**Punchline:** "Idhu habit — ondhu sala kalithre, nim whole career ge use aagutte!"
**CTA:** "Reel 5 — Supabase.initialize(), the one line that wires your whole app. Follow!"
**Caption:** Your API keys should never live in a committed file. Here's the compile-time trick that keeps them out.
**Tags:** #SecureCoding #FlutterDev #EnvironmentVariables #DevSecOps #TechStudent

---

### Reel 5 — "One Line. Your Whole Backend, Connected."
**Hook:** *(Typing furiously, then stop)* "Ondhu line — idhu ge full backend connect aagutte!"
**Setup:** On-screen: **"await Supabase.initialize(url:, anonKey:)"**
**Payoff:** `main.dart`: `WidgetsFlutterBinding.ensureInitialized()` → `Env.assertConfigured()` → `await Supabase.initialize(...)` → `runApp(...)`. VO: "Idhu order matter maadutte — initialize aagoke munche, database call maadidre, crash aagutte."
**Punchline:** "Nan first time order tappi, 10 minute debug maadidhe — 'binding not initialized' antha error!"
**CTA:** "Reel 6 — the folder structure that keeps a big app from turning into chaos. Follow!"
**Caption:** One `Supabase.initialize()` call — auth, database, storage, realtime, all wired in one line.
**Tags:** #FlutterSupabase #AppArchitecture #MobileDevelopment #CodeWithMe

---

### Reel 6 — "Why Your Folders Should Match Your Features, Not Your File Types"
**Hook:** *(Show a messy folder: screens/, widgets/, repositories/ all mixed)* "1000 file aagbeku antha, idhu hudki hudki, tale kettu hoytu!"
**Setup:** On-screen: **"feature-first — one folder per feature, not per file type"**
**Payoff:** Show the real structure: `features/auth/`, `features/feed/`, `features/chat/` — each with its own `data/`, `state/`, `presentation/`. VO: "Feed feature ge, ondhe folder alli — model, state, screen ella. Chat feature touch maadbeku antha, chat folder matra open maadthivi!"
**Punchline:** "10-module app alli, idhu illa antha — guru, second week alle nivu lost aagthiri!"
**CTA:** "Reel 7 — lints and formatting, the habit every team expects. Follow!"
**Caption:** Group your code by what it DOES, not what type of file it is. The folder structure behind this whole app.
**Tags:** #CleanArchitecture #FlutterProject #CodeOrganization #SoftwareDesign

---

### Reel 7 — "Your Code Should Look the Same As Your Teammate's"
**Hook:** *(Two code snippets, wildly different formatting)* "Idhu ondhe person alla bareidhu antha helbahuda?"
**Setup:** On-screen: **"dart format . — one command, one style, forever"**
**Payoff:** Run `dart analyze` → warnings appear → fix one by one → `dart format .` → messy code snaps into uniform style instantly.
**Punchline:** "Idhu boring sound aagutte, aadre real team alli, idhu illa antha — PR review alle jagala!"
**CTA:** "Reel 8 — your app icon and splash screen, generated in one command. Follow!"
**Caption:** dart format turns "whoever wrote this" code into consistent, professional code — instantly.
**Tags:** #CodeQuality #DartLint #DeveloperTips #CleanCode #Karnataka

---

### Reel 8 — "From Default Flutter Icon to a REAL App, in One Command"
**Hook:** *(Show the default Flutter icon on a home screen)* "Idhu nodidhira? Idhu 'nan app finish madilla' antha signal!"
**Setup:** On-screen: **"flutter_launcher_icons — every icon size, one command"**
**Payoff:** Before/after: default Flutter logo icon → real branded icon on the home screen, plus splash screen shown on cold launch. VO: "Ondhu 1024x1024 image kodi, adhu ella size ge — 192, 512, adaptive icon — automatic generate aagutte."
**Punchline:** "Idhu 10-minute kelasa, aadre 'serious app' antha feeling kodutte!"
**CTA:** "Reel 9 — git secrets, the mistake that follows you forever if you don't catch it early. Follow!"
**Caption:** Default icon = unfinished project vibes. One command fixes it for every size, every screen.
**Tags:** #FlutterLauncherIcons #AppBranding #MobileAppDesign #FlutterDev

---

### Reel 9 — "The Git Mistake You Can't Undo"
**Hook:** *(Show `git add .` about to run)* "Ondhu sala commit aaythu antha, DELETE maadidru, adhu HISTORY alli irutte!"
**Setup:** On-screen: **"Always git status BEFORE git add ." **
**Payoff:** Show `.gitignore` with `.env`, `key.properties`, `*.jks` listed BEFORE the first commit. VO: "Secret file commit aagoke munche, gitignore ready irbeku. Ondhu sala push aaythu antha — password change madbeku, delete saaku illa!"
**Punchline:** "Idhu ondhu habit — ella professional developer, commit maadoke munche, status nodthare!"
**CTA:** "That's Module 1 — the setup. Module 2 (Google Login, done right) starts next week. Follow!"
**Caption:** A secret in git history stays there forever, even if you delete the file later. Get .gitignore right BEFORE the first commit.
**Tags:** #GitTips #SecureCoding #DeveloperMistakes #GitHub #TechEducation

---

### Reel 10 — "Module 1, Recap: What We Actually Built"
**Hook:** *(Split screen: empty terminal → full working Supabase-connected app)* "Ondhu ghante alli, idhu build aaythu!"
**Setup:** On-screen: **"Free database. Zero secrets in git. Real folder structure."**
**Payoff:** Fast recap montage of the 9 previous reels, one flash-frame each with its key on-screen text. VO: "No card database, secret handling, folder structure, branding — foundation ready!"
**Punchline:** "Ivaga real kelasa start — Module 2 alli, real Google login barutte, screen recording sahitha!"
**CTA:** "Follow for Module 2 — Authentication, starting Monday!"
**Caption:** Module 1 done — a free, secure, well-organized Flutter + Supabase project. Next: real login.
**Tags:** #FlutterSupabase #ModuleRecap #LearnFlutter #WeeklyCodingSeries #Karnataka
