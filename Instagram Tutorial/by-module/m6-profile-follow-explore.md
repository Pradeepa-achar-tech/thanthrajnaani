# Module 6 Reels — Profile, Follow & Explore (10 reels)

Deep-dive arc, Season 2. Same 5-beat format as the trailer series
(`../reel-scripts-01-10.md`). Screen recording = profile screens, two test accounts.

---

### Reel 1 — "A Profile Screen That Loads With ONE Query"
**Hook:** *(Open a profile — avatar, bio, and 3 stats all appear instantly)* "Posts count, followers, following — ELLA INSTANT bantu, ONDHE query alli!"
**Setup:** On-screen: **"Denormalized columns — read fast, no aggregate query needed"**
**Payoff:** Code: `.select().eq('id', userId).single()` — one row, three counts already present. VO: "Module 3 nalli, ee counts na TRIGGER update maadutte antha kalithdivi. Idhu payoff — profile screen, ONDHE row fetch!"
**Punchline:** "Idhu 'why did we bother with triggers' answer — EXACTLY IDHAKKE!"
**CTA:** "Reel 2 — the 3-column grid that never lags, even with 1000 posts. Follow!"
**Caption:** Three stats, zero extra queries — the direct payoff of Module 3's denormalized counters.
**Tags:** #Supabase #DatabaseDesign #FlutterDev #BackendPerformance

---

### Reel 2 — "A Photo Grid That Never Lags"
**Hook:** *(Scroll a profile grid of 50+ photos, buttery smooth)* "50+ photo, ondhu lag illa — nodi scroll!"
**Setup:** On-screen: **"GridView.builder — same lazy-loading trick as the feed"**
**Payoff:** Code: `SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3)` + `.builder`. VO: "Feed alli kalithdha idea — grid ge kooda SAME apply aagutte. Only visible cells build aagutte!"
**Punchline:** "Ondhu pattern kalithre, MULTIPLE screen alli reuse maadthiri — idhu real engineering!"
**CTA:** "Reel 3 — one screen, two completely different views (yours vs someone else's). Follow!"
**Caption:** The same lazy-loading trick from the feed, applied to a photo grid. Smooth at any scale.
**Tags:** #FlutterGridView #MobilePerformance #AppDevelopment #CodingTips

---

### Reel 3 — "One Screen. Two People See Two Different Things."
**Hook:** *(Visit your own profile — see "Edit Profile"; visit a friend's — see "Follow")* "SAME screen, DIFFERENT button — nodi!"
**Setup:** On-screen: **"if (userId == currentUserId) — one screen, branched by identity"**
**Payoff:** Code: a single `ProfileScreen(userId)` with one `if` deciding Edit vs Follow. VO: "Idhu RENDU separate screen build maadidre — future alli, ONDHU update maadidhre, MATHONDHU FORGET aagutte. ONDHE screen, SAFER!"
**Punchline:** "Chikka decision, DODDA maintenance headache SAVE maadutte!"
**CTA:** "Reel 4 — editing your profile, and the username rule enforced TWICE. Follow!"
**Caption:** One profile screen, branched by a single `if` — not two screens that quietly drift apart over time.
**Tags:** #FlutterArchitecture #CodeReuse #SoftwareDesign #MobileDev

---

### Reel 4 — "Your Username Rule, Enforced TWICE (On Purpose)"
**Hook:** *(Type an invalid username — instant red error, before even hitting Save)* "Save button touch maadoke MUNCHE, error kaanisutte!"
**Setup:** On-screen: **"Client validates for speed. Database validates for TRUTH."**
**Payoff:** Show the same regex rule in the Flutter form AND as a Postgres `check` constraint. VO: "Client-side check, INSTANT feedback kodutte. Aadre database check, REAL guarantee — direct API call kooda bypass maadalla!"
**Punchline:** "Ondhu rule, RENDU kade — idhu REDUNDANT ALLA, idhu SAFE!"
**CTA:** "Reel 5 — follow/unfollow, done in literally 2 lines of code. Follow!"
**Caption:** The same username rule lives in two places — the form (for speed) and the database (for truth).
**Tags:** #FormValidation #DatabaseConstraints #FlutterDev #FullStackDev

---

### Reel 5 — "Follow/Unfollow: 2 Lines of Code (Thanks to Module 3)"
**Hook:** *(Tap Follow — instant, no loading spinner)* "Follow button — ONDHU line INSERT, ONDHU line DELETE. Idhu itself!"
**Setup:** On-screen: **"All the hard work already happened — in the schema"**
**Payoff:** Code: `insert into follows(follower_id, following_id)` / `delete from follows where...` — that's the ENTIRE implementation. VO: "Self-follow block? Database CHECK constraint. Double-follow block? UNIQUE constraint. App code? Just RENDU line!"
**Punchline:** "Idhu proof — SCHEMA properly design maadidhre, FEATURE build maadodhu EASY aagutte!"
**CTA:** "Reel 6 — the trigger that updates BOTH people's counters at once. Follow!"
**Caption:** Following someone is genuinely 2 lines of code — because the real security work already happened in the database.
**Tags:** #Supabase #DatabaseDesign #FlutterDev #BackendArchitecture

---

### Reel 6 — "One Follow, TWO Counters Update Instantly"
**Hook:** *(Follow someone — YOUR following count AND their follower count both jump)* "ONDHU tap — RENDU different profile na count, ELLA update aaythu!"
**Setup:** On-screen: **"One trigger, updating two different rows, same transaction"**
**Payoff:** SQL: `increment_follow_counts()` updating BOTH `follower_count` (their row) and `following_count` (your row) in one function. VO: "ONDHU event, RENDU row affect maadutte — SAME trigger, RENDU update statement!"
**Punchline:** "Idhu Module 3 nalli kalithdha pattern — NOW MORE confident agi apply maadthivi!"
**CTA:** "Reel 7 — the follow button that never waits for the server. Follow!"
**Caption:** One follow event, two profiles' counters updated — atomically, in the same database transaction.
**Tags:** #PostgresTriggers #DatabaseAutomation #Supabase #BackendDev

---

### Reel 7 — "A Follow Button That NEVER Waits"
**Hook:** *(Tap Follow — button flips to "Following" INSTANTLY, before network even responds)* "Nodi speed — button UDHANE flip aaythu!"
**Setup:** On-screen: **"Optimistic UI, same pattern as the like button"**
**Payoff:** Code: flip local state → fire network call in background → rollback ONLY on genuine failure. VO: "Idhu Module 5 nalli kalithdha EXACT pattern — recognize maadidhre, IMPLEMENT maadodhu FAST aagutte!"
**Punchline:** "Pattern recognize maadodhu — idhe REAL skill, RE-derive maadodhu ALLA!"
**CTA:** "Reel 8 — the followers list, and a join trick you haven't seen yet. Follow!"
**Caption:** The same instant-feedback trick from the like button, reused for Follow — recognizing patterns saves real time.
**Tags:** #OptimisticUI #FlutterDev #UXPatterns #SoftwareEngineering

---

### Reel 8 — "One Table, Two Foreign Keys to the SAME Place — Here's the Trick"
**Hook:** *(Open a followers list — confused face)* "'Followers' query bareyoke try maadidhe... error, 'ambiguous relationship'!"
**Setup:** On-screen: **"follows has TWO foreign keys to profiles — you have to say WHICH one"**
**Payoff:** SQL: `profiles!follows_follower_id_fkey(...)` vs `profiles!follows_following_id_fkey(...)` — same table, disambiguated. VO: "Database ge, 'follower' antha, 'following' antha, RENDU different relationship — ONDHE table ge!"
**Punchline:** "Idhu NEW trick — self-referencing table, RENDU relationship. Idhu real-world alli, COMMON pattern!"
**CTA:** "Reel 9 — search with a 400ms delay that saves hundreds of wasted requests. Follow!"
**Caption:** A table with two relationships to the same target needs you to say which one you mean. A genuinely new SQL trick.
**Tags:** #SQL #Postgres #DatabaseJoins #BackendDevelopment #Karnataka

---

### Reel 9 — "Why Your Search Bar Waits 400ms Before Searching"
**Hook:** *(Type a username fast — search only fires ONCE, after you stop typing)* "5 letter type maadidhe, aadre SEARCH ondhe sala matra fire aaythu!"
**Setup:** On-screen: **"Debounce — wait for a pause, then act"**
**Payoff:** Code: `Timer` cancelled and restarted on every keystroke, only firing after 400ms of silence. VO: "Debounce illa antha, ONDHONDHU letter ge, ONDHU search request — 5 letter, 5 wasted request!"
**Punchline:** "Chikka Timer trick, aadre REAL apps ella idhu use maadutte — search, autosave, ELLA kade!"
**CTA:** "Reel 10 — Module 6 recap, and why your tabs remember your scroll position. Follow!"
**Caption:** One Timer, cancelled and restarted on every keystroke — the debounce trick behind every good search bar.
**Tags:** #Debounce #FlutterDev #SearchUX #CodingTips

---

### Reel 10 — "Module 6 Recap: Why Your Tabs Remember Everything"
**Hook:** *(Scroll deep into the feed, switch tabs, come back — scroll position PRESERVED)* "Tab switch maadidhe, WAAPAS bandhe — SAME scroll position!"
**Setup:** On-screen: **"IndexedStack — every tab stays alive, just hidden"**
**Payoff:** Code comparison: naive conditional (rebuilds tab from scratch) vs `IndexedStack` (keeps all 5 tabs alive). VO: "ELLA tab, MEMORY alli alive irutte — HIDE aagutte matra, DESTROY aagalla!"
**Punchline:** "Idhu chikka widget choice, aadre HUGE UX difference — user EVER notice aagalla, EXACTLY correct!"
**CTA:** "Module 7 next — Stories that disappear in 24 hours, for free. Follow!"
**Caption:** Module 6 done — profile, follow, search, and a 5-tab shell that remembers exactly where you left off.
**Tags:** #FlutterIndexedStack #NavigationUX #ModuleRecap #LearnFlutter
