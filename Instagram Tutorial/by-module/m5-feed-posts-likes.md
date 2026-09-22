# Module 5 Reels — Feed, Posts, Likes & Comments (10 reels)

Deep-dive arc, Season 2. Same 5-beat format as the trailer series
(`../reel-scripts-01-10.md`). Screen recording = live feed, two test accounts for Realtime demos.

---

### Reel 1 — "One Query. Posts AND Their Authors. Zero Extra Calls."
**Hook:** *(Show a feed loading instantly, usernames and avatars all present)* "Ee feed — ondhe query alli, post MATTHE author info, ELLA bantu!"
**Setup:** On-screen: **"Embedded select — the join that avoids N+1 queries"**
**Payoff:** Code: `.select('*, profiles(username, avatar_url)')`. VO: "Idhu illa antha, 20 post ge, 20 EXTRA query beku aagthidu — author hudkoke. Ondhe query alli, ELLA sigathe!"
**Punchline:** "Idhu 'N+1 query problem' antha helthare — REAL interview question, real app mistake!"
**CTA:** "Reel 2 — pagination, the reason your feed doesn't load 10,000 posts at once. Follow!"
**Caption:** One query gets you every post AND its author — no separate lookup per post. The N+1 mistake, avoided.
**Tags:** #Supabase #SQLJoins #BackendPerformance #FlutterDev

---

### Reel 2 — "Why Your Feed Loads 20 Posts, Not 20,000"
**Hook:** *(Scroll a feed, new posts load smoothly as you near the bottom)* "Nan scroll maadthini, HOSA post automatic load aagutte — nodi!"
**Setup:** On-screen: **".range() — fetch a slice, not the whole table"**
**Payoff:** Code: `.range(0, 19)` then `.range(20, 39)`. VO: "Ondhe sala 20,000 post load maadidre, app FREEZE aagutte. Idhu bere — 20-20 tegethivi, user scroll maadidha hage!"
**Punchline:** "Idhu simple decision, aadre EVERY real feed app idhe pattern use maadutte!"
**CTA:** "Reel 3 — the exact trick that triggers loading BEFORE you hit the bottom. Follow!"
**Caption:** A feed of 20 posts and 20,000 should load exactly the same way. Pagination in 30 seconds.
**Tags:** #Pagination #FlutterListView #BackendDev #MobilePerformance

---

### Reel 3 — "The Scroll Trick That Loads Content BEFORE You Notice"
**Hook:** *(Scroll fast, next page appears with zero visible delay)* "Nan bottom ge reach aagoke munche, HOSA post READY irutte!"
**Setup:** On-screen: **"Trigger the next page 200px early — give it a head start"**
**Payoff:** Code: `ScrollController` listener checking `pixels >= maxScrollExtent - 200`. VO: "EXACT bottom alli trigger maadidre, user WAIT maadbeku, spinner nodbeku. 200px early trigger maadidre, by the time user reach aagutte, READY!"
**Punchline:** "Idhu chikka number, aadre idhe difference — 'smooth app' matthe 'laggy app' na madhye!"
**CTA:** "Reel 4 — pull-to-refresh, and the ONE mistake that duplicates your whole feed. Follow!"
**Caption:** Load the next page 200px before the bottom — by the time you get there, it's already ready.
**Tags:** #InfiniteScroll #FlutterUX #MobileAppDev #PerformanceTips

---

### Reel 4 — "Pull-to-Refresh: Replace, Don't Append"
**Hook:** *(Pull down on the feed, native spinner, fresh content appears)* "Ee gesture — EVERYONE knows idhu, aadre REALLY build maadoke tricky!"
**Setup:** On-screen: **"refresh() REPLACES the list. loadMore() APPENDS it. Don't mix them up."**
**Payoff:** Code showing two distinct methods. VO: "Idhu mix maadidre — pull-to-refresh maadidha kooda, DUPLICATE post kaanisutte, top alli!"
**Punchline:** "Chikka naming mistake, DODDA bug — idhu real app alli happen aagutte!"
**CTA:** "Reel 5 — posting a photo, and why it appears INSTANTLY. Follow!"
**Caption:** Pull-to-refresh replaces your feed's top; scrolling down appends to the bottom. Mix them up, and posts duplicate.
**Tags:** #FlutterDev #PullToRefresh #StateManagement #MobileAppBugs

---

### Reel 5 — "Why Your Post Appears INSTANTLY (No Wait, No Refresh)"
**Hook:** *(Post a photo, it appears at the top of the feed in under a second)* "Nan post maadidhe — 1 second alle, feed alli KANISUTTE!"
**Setup:** On-screen: **"Optimistic prepend — you already KNOW what you posted"**
**Payoff:** VO: "Server ge round-trip WAIT maadoke beke illa — nivu YAVUDE post maadidhira antha, nimge ALREADY GOTTU. Local list ge, straight prepend maadthivi."
**Punchline:** "Idhu 'your own action, instant. Others' action, realtime.' — idhu RULE, WHOLE app alli repeat aagutte!"
**CTA:** "Reel 6 — double-tap to like, and the animation everyone copies. Follow!"
**Caption:** You already know what you just posted — no need to wait for the server to confirm it back to you.
**Tags:** #OptimisticUI #FlutterDev #AppDesign #UXPatterns

---

### Reel 6 — "The Double-Tap Heart: A Toggle That's ONE-Way, On Purpose"
**Hook:** *(Double-tap an already-liked post — heart pops, but it does NOT unlike)* "Already-liked post na, double-tap maadidhe — unlike AAGALILLA, gamaniso!"
**Setup:** On-screen: **"Double-tap ALWAYS likes. Never toggles. That's deliberate."**
**Payoff:** Code: `if (!isLiked) onLike();` — double-tap on an already-liked post plays the animation but doesn't call unlike. VO: "Toggle maadidre, user 'admire maadoke' double-tap maadidhre, ACCIDENTALLY unlike aagbahudu — bad experience!"
**Punchline:** "Idhu chikka product decision — real Instagram idhe rule follow maadutte, coincidence ALLA!"
**CTA:** "Reel 7 — the RPC function that makes liking a post one atomic step. Follow!"
**Caption:** Double-tap always likes, never unlikes — even on an already-liked post. A deliberate UX choice, not an accident.
**Tags:** #InstagramUX #FlutterAnimation #ProductDesign #MobileUX

---

### Reel 7 — "One Function Call. Like OR Unlike. Zero Race Conditions."
**Hook:** *(Show rapid tapping on a like button, count stays perfectly accurate)* "Fast tap maadidhre kooda, count EXACT aagi irutte!"
**Setup:** On-screen: **"toggle_like() — check and act, atomically, on the server"**
**Payoff:** SQL: `toggle_like(post_id)` function — checks if already liked, inserts or deletes accordingly, all in one transaction. VO: "Client side alli 'check then insert' maadidre, 2 rapid taps RACE maadbahudu. Server-side ONE function? NEVER!"
**Punchline:** "Idhu Module 3 nalli kalithdha 'atomic function' idea — REAL use case alli, idhu bartte!"
**CTA:** "Reel 8 — optimistic likes, and what happens when the network actually fails. Follow!"
**Caption:** One atomic database function handles like-or-unlike — no race condition can ever beat it.
**Tags:** #Postgres #RPCFunctions #Supabase #BackendEngineering

---

### Reel 8 — "What REALLY Happens When Your Like Fails to Send"
**Hook:** *(Turn on airplane mode, tap like — heart fills instantly, then reverts)* "Nan offline aagidhe, like tap maadidhe — heart fill aaythu, aamele... revert aaythu!"
**Setup:** On-screen: **"Update instantly. Roll back ONLY if it genuinely fails."**
**Payoff:** Code: flip local state immediately → fire the network call → catch block reverts state on failure. VO: "Idhu 'hope network never fails' ALLA — idhu GENUINE rollback path, tested!"
**Punchline:** "Idhu satisfying — instant feel BEKU, aadre WRONG state kooda ONDHU sala kaanisabaardu!"
**CTA:** "Reel 9 — seeing someone ELSE'S like appear live, on your screen. Follow!"
**Caption:** Instant feedback, but with a real rollback if the network genuinely fails. Optimistic UI, done safely.
**Tags:** #FlutterDev #OptimisticUpdates #ErrorHandling #MobileAppDesign

---

### Reel 9 — "Watching a Like Appear LIVE From Someone Else's Phone"
**Hook:** *(Two phones side by side — like on phone A, count updates INSTANTLY on phone B)* "Ee RENDU phone nodi — ondhu phone alli like, MATHONDHU phone alli UDHANE update!"
**Setup:** On-screen: **"Supabase Realtime — the database pushes changes to you"**
**Payoff:** SQL: `alter publication supabase_realtime add table posts;` then Flutter: `onPostgresChanges` subscription. VO: "Idhu POLLING ALLA — database ITSELF, change aaythu antha, PUSH maadutte. Zero delay!"
**Punchline:** "First time nan idhu test maadi, RENDU phone MADHYE like appear aagodhu nodi — GOOSEBUMPS!"
**CTA:** "Reel 10 — Module 5 recap, the beating heart of this whole app. Follow!"
**Caption:** No polling, no refresh button — the database pushes the update straight to a second device, live.
**Tags:** #SupabaseRealtime #LiveUpdates #FlutterDev #RealtimeApps #Karnataka

---

### Reel 10 — "Module 5 Recap: The Beating Heart of the App"
**Hook:** *(Fast montage: post, like, comment, scroll, refresh — all in one continuous clip)* "Idhu — WHOLE feed, ondhu flow alli!"
**Setup:** On-screen: **"Pagination. Optimistic UI. Realtime. Working together."**
**Payoff:** VO: "Nim post, instant. Bereyavr post, realtime. Like, optimistic + rollback. Comment, same idea. Idhu MODULE, app na core!"
**Punchline:** "Ivaga real feed ready. Adhre — profile, follow, explore? Next module!"
**CTA:** "Module 6 next — profiles, following people, and search. Follow!"
**Caption:** Module 5 done — pagination, optimistic UI, and Realtime, working together as one feed. The heart of LocalInsta.
**Tags:** #FlutterSupabase #RealtimeFeed #ModuleRecap #LearnFlutter
