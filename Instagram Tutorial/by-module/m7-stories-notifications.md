# Module 7 Reels — Stories & Notifications (10 reels)

Deep-dive arc, Season 2. Same 5-beat format as the trailer series
(`../reel-scripts-01-10.md`). Screen recording = story viewer, SQL Editor, two test accounts.

---

### Reel 1 — "A Story That Expires ITSELF (No Client Involved)"
**Hook:** *(Post a story, show its expiry timestamp)* "Ee story, 24 hours alli automatic EXPIRE aagutte — MY PHONE INVOLVED ALLA!"
**Setup:** On-screen: **"expires_at default (now() + interval '24 hours')"**
**Payoff:** SQL: the default expression computes expiry on the SERVER, at insert time. VO: "Phone clock WRONG irbahudu — DATABASE clock, ALWAYS correct. Client ge, calculate maadoke BEKE ILLA!"
**Punchline:** "Never trust a phone's clock for something a cleanup job later depends on!"
**CTA:** "Reel 2 — why hiding expired content isn't the same as deleting it. Follow!"
**Caption:** The expiry timestamp is computed by the database itself, not the phone — never trust a client's clock.
**Tags:** #Postgres #Supabase #DatabaseDesign #BackendDev

---

### Reel 2 — "Hidden ≠ Deleted (The Gap That Costs You Storage)"
**Hook:** *(Show an "expired" story still sitting in the raw database)* "App alli KANISALLA, aadre DATABASE alli INNU IDE — nodi!"
**Setup:** On-screen: **"A query filter controls what you SEE. It does nothing to what's STORED."**
**Payoff:** SQL: filter `expires_at > now()` hides it from the app, but `select * from stories where id = ...` still returns the row AND its Storage file. VO: "Idhu 'sweep under the rug' hage — KANISALLA, aadre DUST INNU IDE!"
**Punchline:** "Idhu REAL gap — free tier storage, INVISIBLE agi FULL aagbahudu, idhu fix maadadhidre!"
**CTA:** "Reel 3 — the free scheduled job that Firebase would make you PAY for. Follow!"
**Caption:** Hiding expired content from a query is not the same as deleting it — the gap that quietly fills your storage.
**Tags:** #DatabaseDesign #Postgres #DataCleanup #BackendEngineering

---

### Reel 3 — "A Scheduled Job. Free. Forever. (Firebase Would Charge You)"
**Hook:** *(Dramatic reveal)* "Firebase alli, scheduled job beku antha, PAID plan beku. NAMGE? FREE!"
**Setup:** On-screen: **"pg_cron — a genuine background job, inside Postgres itself"**
**Payoff:** SQL: `create extension pg_cron;` → `cron.schedule('cleanup', '*/30 * * * *', 'select cleanup_expired_stories();')`. VO: "EVERY 30 minutes, ondhu function AUTOMATIC run aagutte — expired story galella, FILE MATTHE ROW, ELLA delete maadutte!"
**Punchline:** "Idhu PROOF — free tier, ADVANCED infrastructure kooda cover maadutte, CARD BEKE ILLA!"
**CTA:** "Reel 4 — why we STILL keep the display filter, even with the cron job. Follow!"
**Caption:** A real scheduled job, running forever, genuinely free — no billing plan required. Try that on Firebase.
**Tags:** #pgcron #Supabase #FreeTier #BackendAutomation #NoCard

---

### Reel 4 — "Two Layers of Cleanup (Neither Alone Is Enough)"
**Hook:** *(Timeline graphic: a story expires at 10:14, cron runs at 10:00 and 10:30)* "Story 10:14 ge expire aaythu, aadre cleanup job 10:30 ge run aagutte — GAP IDE!"
**Setup:** On-screen: **"Instant filter (every query) + eventual cleanup (every 30 min) = complete coverage"**
**Payoff:** VO: "Filter ONE illa antha, USER expired content NODUTHARE, 30 min tanaka. Cron ONE illa antha, database FOREVER FULL AAGUTHE. RENDU BEKU!"
**Punchline:** "Idhu MATURE engineering — ONDHU solution SAAKU antha ASSUME maadadhe, RENDU layer thinking!"
**CTA:** "Reel 5 — why notifications get their OWN, stricter security rule. Follow!"
**Caption:** Instant filtering AND scheduled cleanup — two layers solving two different halves of the same problem.
**Tags:** #SoftwareEngineering #DatabaseDesign #Postgres #SystemDesign

---

### Reel 5 — "Not Every Table Should Be Public (Here's the One That Isn't)"
**Hook:** *(Try to read someone else's notifications — blocked)* "Profile, post — YAARU BEKAADRU NODBAHUDU. Notifications? ILLA!"
**Setup:** On-screen: **"select policy: to authenticated using (auth.uid() = recipient_id)"**
**Payoff:** SQL: notifications table's select policy, genuinely private, unlike posts/profiles. VO: "Idhu MODULE 3 nalli, 'profiles PUBLIC' antha pattern-match maadi COPY maadidhre, PRIVACY LEAK aagbahudu — EVERY table na SWANTHA situation THINK maadbeku!"
**Punchline:** "Idhu REAL lesson — PREVIOUS pattern BLINDLY copy maadodhu ALLA, PROPER REASON maadodhu!"
**CTA:** "Reel 6 — notifications with NO insert policy at all (and why that's correct). Follow!"
**Caption:** Not every table should default to public — notifications are genuinely private, and the RLS policy proves it.
**Tags:** #RowLevelSecurity #Postgres #DatabaseSecurity #Supabase

---

### Reel 6 — "A Table With ZERO Insert Policy (On Purpose)"
**Hook:** *(Try to manually create a fake notification — blocked)* "Nan FAKE notification insert maadoke try maadthini... REJECTED!"
**Setup:** On-screen: **"No insert policy = default deny. Only triggers can write here."**
**Payoff:** SQL: `notifications` table has select + update policies, but DELIBERATELY no insert policy. VO: "App code ge, DIRECT notification create maadoke PATH ILLA. TRIGGER MATRA — 'security definer' use maadi, ATOMIC agi create maadutte."
**Punchline:** "Idhu Module 2 nalli kalithdha 'atomic trigger' idea — FAKE notification, STRUCTURALLY IMPOSSIBLE!"
**CTA:** "Reel 7 — a like that automatically becomes a notification, with one exception. Follow!"
**Caption:** No insert policy at all — notifications can ONLY be created by a trigger, never faked by a client.
**Tags:** #Supabase #RLS #DatabaseSecurity #BackendDev #Karnataka

---

### Reel 7 — "A Like Becomes a Notification — Except When It's YOUR Own"
**Hook:** *(Like your own post — check notifications, nothing appears)* "Nan SWANTHA post like maadidhe — notification BARALILLA. Yaake?"
**Setup:** On-screen: **"is distinct from — the self-action exclusion"**
**Payoff:** SQL: `notify_on_like()` trigger checks `post_owner_id is distinct from new.user_id` before inserting a notification. VO: "SELF-like ge, notification create maadidhre, USELESS — 'nivu NIM POST like maadidhri' antha ARTHA ILLA!"
**Punchline:** "Chikka check, aadre USER EXPERIENCE ge, HUGE difference!"
**CTA:** "Reel 8 — the notifications screen, updating live as you watch. Follow!"
**Caption:** Every like generates a notification — except when you like your own post. One line stops the pointless ones.
**Tags:** #PostgresTriggers #DatabaseAutomation #ProductDesign #BackendDev

---

### Reel 8 — "Watching a Notification Arrive LIVE, On Screen"
**Hook:** *(Notification screen open, a second account likes a post — notification slides in LIVE)* "Nan notification screen NODUTHIDHINI — DUSRA account like maadidhre, LIVE bantu!"
**Setup:** On-screen: **"Filtered Realtime — the 4th time we've used this exact pattern"**
**Payoff:** Code: `onPostgresChanges` filtered to `recipient_id = currentUserId`. VO: "Likes, comments, feed — EVERYWHERE idhe pattern. NOTIFICATIONS ge kooda SAME — RECOGNIZE maadi, FAST implement maadthivi!"
**Punchline:** "Idhu MASTERED skill hage FEEL AAGUTTE — ONDHU pattern, NALKU DIFFERENT feature ge!"
**CTA:** "Reel 9 — the unread badge, and why it uses a REAL count query. Follow!"
**Caption:** The 4th time this exact Realtime pattern shows up — likes, comments, and now notifications, live.
**Tags:** #SupabaseRealtime #FlutterDev #LiveNotifications #RealtimeApps

---

### Reel 9 — "The Unread Badge That's NEVER Wrong"
**Hook:** *(Badge shows "3", open notifications, badge clears INSTANTLY)* "3 unread — OPEN maadidhe, ZERO aaythu, INSTANT!"
**Setup:** On-screen: **"A REAL count query, not fetching every row just to count them"**
**Payoff:** Code: `.count(CountOption.exact)` instead of fetching full rows. VO: "COUNT MATRA BEKU antha, WHOLE row data DOWNLOAD maadodhu WASTE — COUNT QUERY, JUST THE NUMBER tegethukolthivi!"
**Punchline:** "Chikka detail, aadre BANDWIDTH SAVE maadutte — free tier RESPECT maadodhu, EVERYWHERE!"
**CTA:** "Reel 10 — Module 7 recap, and the two-layer thinking that shows up everywhere now. Follow!"
**Caption:** A genuine count query, not a full row fetch — the unread badge that's fast AND accurate.
**Tags:** #Supabase #DatabaseOptimization #FlutterDev #BackendPerformance

---

### Reel 10 — "Module 7 Recap: Free Infrastructure, Properly Secured"
**Hook:** *(Split screen: a story vanishing after 24h, a notification arriving live)* "Stories THAT DELETE THEMSELVES. Notifications THAT ARRIVE LIVE. RENDU FREE!"
**Setup:** On-screen: **"pg_cron. Trigger-generated notifications. A genuinely private table."**
**Payoff:** VO: "Idhu MODULE, PROVE maadutte — free tier, ADVANCED features (SCHEDULED jobs, LIVE push) HANDLE maadbahudu, PROPERLY."
**Punchline:** "Ivaga app ALIVE FEEL AAGUTTE — REAL time, REAL cleanup, ZERO manual work!"
**CTA:** "Module 8 next — real-time chat, the hardest security rule in the whole course. Follow!"
**Caption:** Module 7 done — self-cleaning stories and live notifications, both genuinely free, both properly secured.
**Tags:** #Supabase #pgcron #ModuleRecap #FlutterDev #Karnataka
