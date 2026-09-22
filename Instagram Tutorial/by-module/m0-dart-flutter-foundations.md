# Module 0 Reels — Dart & Flutter Foundations (10 reels)

Deep-dive arc, Season 2. Same 5-beat format as the trailer series
(`../reel-scripts-01-10.md`) — Hook 0-3s / Setup 3-7s / Payoff 7-24s / Punchline 24-27s /
CTA 27-30s. Screen recording = your Flutter project + terminal, cut with talking-head bits.

---

### Reel 1 — "flutter doctor: The Health Checkup Every App Needs"
**Hook:** *(Terminal full of red X's)* "Idhu nodi — first time flutter doctor run maadidre state!"
**Setup:** On-screen: **"Before ANY code — get this all green"**
**Payoff:** Sped-up (3x) recording: unzip SDK → add PATH → `flutter doctor` → fix each red line one by one, counter ticking down → final green checklist held for 2 extra seconds.
**Punchline:** "Doctor green agalikke, code barilikke illa. Exam ge attendance hage — first idhu, aamele ella!"
**CTA:** "Save this before your next Flutter project. Reel 2 tomorrow — null safety in 30s. Follow!"
**Caption:** Every Flutter journey starts here — flutter doctor, from all-red to all-green.
**Tags:** #FlutterDoctor #FlutterSetup #LearnFlutter #CodingBasics #Karnataka

---

### Reel 2 — "The ? That Saves Your App From Crashing"
**Hook:** *(Phone shows a red crash screen)* "Ondhe ondhu character illa antha, app crash aaythu — nodi!"
**Setup:** On-screen: **"String? vs String — Dart's null safety"**
**Payoff:** Code editor: `String bio` (non-nullable) vs `String? bio` (nullable) side by side. Type `bio.length` on the nullable one — red squiggle appears instantly. VO: "Compiler ne heltade — 'idhu null aagbahudu, check maadu!' Runtime crash aagoke munche, compile time nalli hidithu."
**Punchline:** "Guru, idhu Dart na best feature — nim app run aagoke munche, bugs hidithu bidutte!"
**CTA:** "This ONE feature prevents 90% of beginner crashes. Reel 3 — copyWith, the pattern every model needs. Follow!"
**Caption:** Dart catches your null-crash BEFORE you even run the app. Here's the `?` that does it.
**Tags:** #DartLang #NullSafety #FlutterDev #CodingTips #BCA

---

### Reel 3 — "Why Your Models Should Never Change (copyWith Explained)"
**Hook:** *(Hold up two printed photos)* "Ondhu photo edit maadbeku antha, original ge scribble maadthira? Illa — hosa print tegithira!"
**Setup:** On-screen: **"copyWith — build a NEW object, don't mutate the old one"**
**Payoff:** Code: a `Post` class with `final` fields, `copyWith(likeCount: ...)` call shown creating a fresh instance. VO: "`final` fields antha — ondhu sala set aaythu antha, change aagalla. Like count badalisbeku antha, hosa Post object cheatthivi, copyWith use maadi."
**Punchline:** "First time nan idhu maadadhe, chikka bug hudki hudki, tale kettu hoytu. Immutable models — life saver!"
**CTA:** "Every model in this course uses this pattern. Reel 4 — Stateless vs Stateful, the first thing every interview asks. Follow!"
**Caption:** Never mutate a model — build a fresh copy instead. copyWith in 30 seconds.
**Tags:** #Dart #Flutter #CleanCode #ImmutableData #SoftwareEngineering

---

### Reel 4 — "Stateless vs Stateful (The Question Every Interview Asks)"
**Hook:** *(Two icons on screen: a printed card, and a person holding a scoreboard)* "Ondhu widget yaake 'remember' maadutte, matthondhu maadalla?"
**Setup:** On-screen: **"StatelessWidget = fixed. StatefulWidget = remembers."**
**Payoff:** Side by side: a caption `Text` (Stateless) next to a like-button toggling filled/outline heart on tap (Stateful, with `setState` highlighted). VO: "Caption ondhu sala print aaythu antha, change aagalla — Stateless. Like button tap maadidha kooda, heart badlaagbeku — adhu Stateful, `setState` use maadi rebuild maadutte."
**Punchline:** "Interview alli idhu kelidre, confident aagi heli — nam course alli nodidhini antha!"
**CTA:** "Reel 5 — the 3 widgets every screen needs (MaterialApp, Scaffold, Navigator). Follow!"
**Caption:** The #1 Flutter interview question, explained with a like button. Stateless vs Stateful in 30s.
**Tags:** #FlutterInterview #StatefulWidget #FlutterBasics #CodingInterview #TechStudent

---

### Reel 5 — "3 Widgets, Every Screen Ever"
**Hook:** *(Zoom into app, tap through 3 different screens fast)* "Feed screen, Profile screen, Chat screen — ella ondhe 3 building blocks!"
**Setup:** On-screen: **"MaterialApp → Scaffold → Navigator"**
**Payoff:** Diagram-style screen recording: MaterialApp labeled "the whole building," Scaffold labeled "one room — app bar + body," Navigator labeled "the stack of doors between screens." Show a `Navigator.push` transition live.
**Punchline:** "Idhu ondhu sala ke, ella app ge use maadthivi — building block anthe!"
**CTA:** "Reel 6 — the yellow-black stripes error EVERY beginner hits (and the 1-line fix). Follow!"
**Caption:** Every Flutter screen you'll ever build uses these same 3 widgets. Here's the mental model.
**Tags:** #Flutter #MaterialApp #FlutterNavigation #MobileDevelopment #LearnToCode

---

### Reel 6 — "The Yellow-Black Stripes Every Beginner Fears"
**Hook:** *(Show the classic Flutter overflow error, yellow-black stripes)* "Ee stripes nodidhira? Guru, ELLA beginner idhu nodithare!"
**Setup:** On-screen: **"RenderFlex overflowed — the most-Googled Flutter error"**
**Payoff:** Recreate it live: a long username next to an avatar overflows. Wrap the `Text` in `Expanded` + `overflow: ellipsis` → error disappears instantly. VO: "Row alli, unconstrained text beku illa image beside irutte antha, overflow aagutte. Expanded use maadi — 'idhu leftover space tegoko' antha heltivi."
**Punchline:** "Nan first Flutter week, ee error 10 sala nodidhe. Ivaga? 2 second alli fix!"
**CTA:** "Screenshot this fix. Reel 7 — why plain ListView will slow down your app. Follow!"
**Caption:** The yellow-black stripes error, demystified — and fixed in one `Expanded` widget.
**Tags:** #FlutterErrors #Expanded #FlutterUI #DebuggingTips #CodeNewbie

---

### Reel 7 — "Why .builder Is the Only ListView You Should Use"
**Hook:** *(Scroll a laggy, janky-looking list)* "Ee list, 1000 items ide antha, phone ne freeze aagutte — yaake gotta?"
**Setup:** On-screen: **"ListView vs ListView.builder — one loads everything, one loads what you SEE"**
**Payoff:** Split screen: plain `ListView` builds all 1000 widgets upfront (slow, janky scroll) vs `ListView.builder` only building visible items (buttery smooth). VO: "Idu order pad hage — ella past order print maadalla, indina page thoristhivi, adjuste!"
**Punchline:** "Feed alli, chat alli, everywhere — `.builder` illa antha, nim app crawl aagutte!"
**CTA:** "Reel 8 — Future vs Stream, the difference that powers your whole realtime feed. Follow!"
**Caption:** A feed of 5 items and a feed of 5,000 should code EXACTLY the same way. That's `.builder`.
**Tags:** #FlutterListView #PerformanceOptimization #FlutterDev #MobileApp #CodingReels

---

### Reel 8 — "Future vs Stream: One Drop vs a Running Tap"
**Hook:** *(Pour one cup of filter coffee, then stand under a running tap)* "Ondhu cup coffee tegonodu — Future. Running tap kelage nilbodu — Stream!"
**Setup:** On-screen: **"Future = happens ONCE. Stream = keeps happening."**
**Payoff:** Code: `Future<Post> fetchPost()` (one result) vs `Stream<int> watchLikeCount()` (keeps emitting). VO: "Profile ondhe sala load maadthivi antha, Future saaku. Aadre like count LIVE update aagbeku antha, Stream beku — matte matte 'hosa value bantu' antha heltha ide."
**Punchline:** "Nim whole realtime feed, chat, notifications — ELLA ide idea mele stand aagide!"
**CTA:** "Reel 9 — FutureBuilder & StreamBuilder, the 3 states every screen needs. Follow!"
**Caption:** Future answers "what is it right now." Stream answers "tell me every time it changes." The idea behind every live feature in this app.
**Tags:** #Dart #AsyncProgramming #FlutterStreams #RealtimeApps #CodingConcepts

---

### Reel 9 — "3 States Every Screen MUST Handle"
**Hook:** *(Show a blank white screen)* "Network slow aayithu antha, app idhu thoristhe — ondhu blank screen. Bad!"
**Setup:** On-screen: **"Loading. Error. Data. All three, every time."**
**Payoff:** Live demo: `FutureBuilder` with a spinner (loading) → airplane mode toggled on → friendly error + retry button appears (error) → toggled off, retry tapped → real content loads (data). VO: "Bere 2 state forget maadi, 'data' matra handle maadidre — real app alla, adhu demo!"
**Punchline:** "Idhu chikka detail, aadre idhe difference — polished app matte 'college project' app na madhye!"
**CTA:** "Final Module 0 reel tomorrow — Provider, why setState isn't enough. Follow!"
**Caption:** A screen that only handles the happy path is a demo, not an app. Loading, error, data — every time.
**Tags:** #FlutterUX #ErrorHandling #AppDevelopment #UIUXDesign #FlutterTips

---

### Reel 10 — "setState Isn't Enough (Meet Provider)"
**Hook:** *(App bar shows a badge, tap a button on a totally different screen, badge updates)* "Idhu nodi — ondhu screen alli tap maadidhe, matthondhu screen ge udhane update aaytu!"
**Setup:** On-screen: **"One shared brain for the whole app — ChangeNotifier + Provider"**
**Payoff:** Diagram: `setState` labeled "rebuilds ONE widget," `ChangeNotifier` + `Provider` labeled "rebuilds EVERY widget watching it." Live code: `context.read` vs `context.watch` shown side by side.
**Punchline:** "Login status, notification count, dark mode — ella idhe pattern use maadthivi. Ondhu sala kalithre, forever use maadthiri!"
**CTA:** "That's Module 0 — the foundations. Module 1 (Supabase, the free Firebase alternative) starts next week. Follow so you don't miss it!"
**Caption:** setState rebuilds one widget. A shared ChangeNotifier rebuilds every widget watching it — the pattern behind login, notifications, dark mode, everything.
**Tags:** #Provider #StateManagement #Flutter #ChangeNotifier #AppArchitecture #Karnataka
