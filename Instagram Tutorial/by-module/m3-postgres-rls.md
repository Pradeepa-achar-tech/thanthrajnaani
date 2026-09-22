# Module 3 Reels — Postgres Data Modeling & Row Level Security (10 reels)

Deep-dive arc, Season 2. Same 5-beat format as the trailer series
(`../reel-scripts-01-10.md`). Screen recording = Supabase SQL Editor, the star of this module.

---

### Reel 1 — "Firestore vs Postgres: The Mental Shift Nobody Warns You About"
**Hook:** *(Two shelves: one with mismatched tiffin boxes, one with identical banana-leaf compartments)* "Firestore alli, ondhondhu document different shape irbahudu. Postgres alli? ILLA!"
**Setup:** On-screen: **"Every row in a table has the EXACT same columns"**
**Payoff:** SQL Editor: `create table` with typed columns → insert a row missing a required field → instant rejection. VO: "Idhu feature — database ne guarantee kodutte, prati row correct shape irutte antha, app code check maadoke munche!"
**Punchline:** "First week idhu confusing, aadre idhe reason — Postgres ge, bugs KAM aagutte!"
**CTA:** "Reel 2 — foreign keys, the feature that makes bad data IMPOSSIBLE. Follow!"
**Caption:** Coming from Firestore? This is the #1 mental shift — shape lives on the table, not the row.
**Tags:** #Postgres #Supabase #DatabaseDesign #SQLBasics #BackendDev

---

### Reel 2 — "Foreign Keys: The Database Refuses Bad Data For You"
**Hook:** *(Try inserting a post with a fake, non-existent user_id)* "Ee post, illadhiruva user ge belongs aagutte antha, insert maadoke try maadthini..."
**Setup:** On-screen: **"references profiles(id) — Postgres checks it for you"**
**Payoff:** SQL: `user_id uuid references profiles(id)` → insert with a random UUID → **REJECTED**, error shown big. VO: "Idhu manually check maadoke beke illa — database ne 'idhu user exist agalla' antha heltade!"
**Punchline:** "Idhu ondhu line, aadha ondhu WHOLE category of bugs disappear aagutte!"
**CTA:** "Reel 3 — indexes, and the query that got 100x faster. Follow!"
**Caption:** One line of SQL makes it structurally impossible to create a post for a user who doesn't exist.
**Tags:** #ForeignKeys #Postgres #DataIntegrity #SQL #DatabaseDesign

---

### Reel 3 — "This Query Got 100x Faster With ONE Line"
**Hook:** *(Show `explain analyze` with a slow "Seq Scan" result)* "Ee query, EVERY row check maadutte — slow!"
**Setup:** On-screen: **"CREATE INDEX — turn 'check everything' into 'jump straight there'"**
**Payoff:** Before: `explain analyze` shows `Seq Scan`, high cost. `create index idx_posts_user_id ...` → re-run → `Index Scan`, cost drops dramatically. VO: "Idhu ondhu book na index hage — page by page nododhu bidu, straight ge jump maadthivi!"
**Punchline:** "Nim feed 20 post ge test aagbahudu, aadre 20,000 post ge — idhu illa antha, app CRAWL aagutte!"
**CTA:** "Reel 4 — designing the profiles table, the hub of the whole app. Follow!"
**Caption:** A missing index is the #1 reason a fast demo becomes a slow real app. One command fixes it.
**Tags:** #DatabaseIndexing #PostgresPerformance #SQLOptimization #BackendEngineering

---

### Reel 4 — "Designing the ONE Table Everything Else Points To"
**Hook:** *(Show the profiles table with follower_count, following_count, post_count columns)* "Ee counts — LIVE calculate maadalla, idhu STORE aagide, direct!"
**Setup:** On-screen: **"Denormalized counters — read fast, kept honest by triggers"**
**Payoff:** SQL: `profiles` table with `follower_count int default 0`. VO: "Technically, follows table count maadi calculate maadbahudu — aadhre EVERY profile view ge, slow aggregate query beku aagutte. Idhu bere — count already ready irutte!"
**Punchline:** "Trade-off idhu — chikka redundancy, adhare HUGE speed. Real engineering decision!"
**CTA:** "Reel 5 — the composite unique constraint that makes double-liking IMPOSSIBLE. Follow!"
**Caption:** Why store a count instead of calculating it live? Because a profile view shouldn't need a slow aggregate query.
**Tags:** #DatabaseDesign #Postgres #Denormalization #SoftwareArchitecture

---

### Reel 5 — "Making Double-Liking a Post IMPOSSIBLE (Not Just Blocked)"
**Hook:** *(Rapidly double-tap a post's like button)* "Fast fast tap maadidhe — but like count ondhe sala matra jump aaythu. Yaake?"
**Setup:** On-screen: **"UNIQUE(post_id, user_id) — the database has no room for a duplicate"**
**Payoff:** SQL: `likes` table with `unique(post_id, user_id)` → insert the same pair twice → 2nd insert **rejected instantly**. VO: "Idhu 'check maadi block maadodhu' alla — idhu STRUCTURALLY possible ALLA. No race condition can beat it."
**Punchline:** "App-side check madidre, fast double-tap idha beat maadbahudu. Database constraint? NEVER!"
**CTA:** "Reel 6 — Row Level Security, explained in one sentence that'll change how you see databases. Follow!"
**Caption:** A composite unique constraint doesn't just block double-likes — it makes them impossible, even under a race condition.
**Tags:** #Postgres #DatabaseConstraints #SQLTricks #BackendDev #CodingIndia

---

### Reel 6 — "The Database Itself Refuses to Leak Your Data"
**Hook:** *(Serious tone)* "Nim app hack aagide antha imagine maadi — attacker, nim API key kooda ide antha. Nim data still safe irutte?"
**Setup:** On-screen: **"Row Level Security — a security guard built INTO the database"**
**Payoff:** SQL: `create policy ... using (auth.uid() = user_id)`. Then live demo: impersonate a different user, try to read someone else's data → **denied**, even with valid credentials. VO: "Idhu client-side check ALLA — idhu DATABASE itself heltade 'illa' antha. App code bypass maadidru, database bypass aagalla!"
**Punchline:** "Idhu ONE concept, adhu whole course na worth maadutte!"
**CTA:** "Reel 7 — the 4-part shape of every RLS policy. Follow!"
**Caption:** Even a fully compromised app can't bypass this — the database itself decides who sees what.
**Tags:** #RowLevelSecurity #DatabaseSecurity #Postgres #Supabase #CyberSecurity

---

### Reel 7 — "Every Security Policy Has 4 Parts (Memorize This)"
**Hook:** *(Show a policy being written line by line)* "RLS policy bareyodu, idhu 4 questions matra!"
**Setup:** On-screen: **"WHICH operation. WHICH role. USING (read check). WITH CHECK (write check)."**
**Payoff:** Break down a real policy: `for insert to authenticated with check (auth.uid() = user_id)`. VO: "Insert ge, WITH CHECK use maadthivi. Delete ge, USING use maadthivi. Idhu miss aadre, policy WRONG aagutte — silently!"
**Punchline:** "Idhu confusing sound aagutte, aadre 4 questions kelko — 'yaavudhu operation, yaaru, yenu check' — solved!"
**CTA:** "Reel 8 — testing your own security by trying to break it. Follow!"
**Caption:** Every RLS policy answers 4 questions. Break it down once, and every future policy makes sense.
**Tags:** #RLS #Postgres #DatabaseSecurity #SQLTutorial #BackendDevelopment

---

### Reel 8 — "I Tried to Hack My Own App (On Purpose)"
**Hook:** *(Dramatic)* "Nan nan swantha app hack maadoke try maadidhe. Nodi yenu aaythu!"
**Setup:** On-screen: **"Impersonation testing — pretend to be a different user in SQL Editor"**
**Payoff:** SQL Editor: `set local role authenticated; set local "request.jwt.claims" = '{"sub": "<other-user-id>"}';` → attempt to update someone else's post → **UPDATE 0** shown big. VO: "Zero rows affected — idhu SUCCESS! Silent block, loud error alla, aadhre EXACT correct behavior."
**Punchline:** "Idhu satisfying moment — nim swantha security policy na, nivu bhreak maadoke try maadi, FAIL aaythu antha nododhu!"
**CTA:** "Reel 9 — the trigger that keeps every count in the app accurate, automatically. Follow!"
**Caption:** I tried to break into my own database as a different user. Here's what "secure" actually looks like.
**Tags:** #EthicalHacking #DatabaseTesting #RLS #Supabase #SecurityTesting

---

### Reel 9 — "Counters That Update Themselves — No Manual Math, Ever"
**Hook:** *(Like a post, watch the count jump instantly on a DIFFERENT device)* "Idhu automatic — nan code alli, count += 1 antha ondhu sala kooda barelilla!"
**Setup:** On-screen: **"Database triggers — a function that fires automatically on every insert"**
**Payoff:** SQL: `after insert on likes execute function increment_post_like_count()`. VO: "Like insert aagutte antha, ondhu function AUTOMATIC fire aagutte, post na like_count update maadutte — SAME transaction alli, atomic!"
**Punchline:** "App side alli count += 1 maadidre, 2 devices SAME time alli like maadidru, count WRONG aagbahudu. Trigger? NEVER wrong!"
**CTA:** "Reel 10 — Module 3 recap, and the database that's now genuinely production-ready. Follow!"
**Caption:** Never trust client-side counter math — a database trigger keeps every count perfectly accurate, atomically.
**Tags:** #PostgresTriggers #DatabaseAutomation #SQL #BackendEngineering

---

### Reel 10 — "Module 3 Recap: A Database That Can't Be Tricked"
**Hook:** *(Show a full schema diagram: profiles, posts, likes, comments, follows, all connected)* "Idhu — WHOLE app na foundation, ondhu screen alli!"
**Setup:** On-screen: **"Tables. Indexes. RLS on every table. Triggers keeping counts honest."**
**Payoff:** Fast recap flash-frames. VO: "Idhu module, course na CONCEPTUAL CORE — idhu properly ardha maadidhre, ella else easy aagutte."
**Punchline:** "Ivaga database bulletproof. Next — real photos upload maadoke time!"
**CTA:** "Module 4 next — Storage & the media pipeline. Follow so you don't miss it!"
**Caption:** Module 3 done — the conceptual core of this entire course. A database that genuinely can't be tricked.
**Tags:** #Postgres #RowLevelSecurity #DatabaseDesign #ModuleRecap #Karnataka
