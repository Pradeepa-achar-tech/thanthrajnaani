# Module 9 Reels — Reels & Video Posts (10 reels)

Deep-dive arc, Season 2. Same 5-beat format as the trailer series
(`../reel-scripts-01-10.md`). Screen recording = video capture, vertical feed, meta moment — filming Reels content ABOUT building Reels.

---

### Reel 1 — "Adding Video Support Without Breaking a SINGLE Existing Photo"
**Hook:** *(Show old photo posts still working perfectly after a schema change)* "HOSA VIDEO FEATURE ADD MAADIDHE — OLD PHOTO POSTS? ONDHU KOODA BREAK AAGALILLA!"
**Setup:** On-screen: **"Additive columns — media_type, video_url — image_url NEVER changes meaning"**
**Payoff:** SQL: `alter table posts add column media_type text default 'image', add column video_url text`. VO: "image_url, PHOTO POST GE 'THE PHOTO' ANTHA MEANING. VIDEO POST GE? 'THE THUMBNAIL' ANTHA — SAME COLUMN, EXTENDED MEANING!"
**Punchline:** "IDHU ADDITIVE CHANGE — RIP-AND-REPLACE ALLA, IDHU REAL SCHEMA EVOLUTION!"
**CTA:** "Reel 2 — recording a 60-second Reel, capped at the source. Follow!"
**Caption:** Video support added with zero breaking changes to existing photo posts — additive schema design, in action.
**Tags:** #DatabaseMigration #Postgres #SoftwareEngineering #BackendDev

---

### Reel 2 — "Recording a Reel — Capped at EXACTLY 60 Seconds"
**Hook:** *(Try to record past 60 seconds — camera auto-stops)* "60 SECOND GE, CAMERA TANNAGE STOP AAYTU — NODI!"
**Setup:** On-screen: **"maxDuration on pickVideo — the OS enforces it for you"**
**Payoff:** Code: `ImagePicker().pickVideo(source: ImageSource.camera, maxDuration: Duration(seconds: 60))`. VO: "IMAGE_PICKER, VIDEO KOODA HANDLE MAADUTTE — PHOTO PICKER GE KALITHDHA EXACT API, VIDEO GE KOODA!"
**Punchline:** "SHORT-FORM VIDEO FORMAT GE, 60 SECOND PERFECT — AND FREE-TIER STORAGE GE KOODA HELP MAADUTTE!"
**CTA:** "Reel 3 — compressing video AND extracting a thumbnail, one function call. Follow!"
**Caption:** The same image_picker you already know handles video too — with a hard duration cap at the source.
**Tags:** #FlutterDev #VideoCapture #MobileDevelopment #ImagePicker

---

### Reel 3 — "One Function. Compressed Video AND a Thumbnail."
**Hook:** *(Show a 50MB video shrink to a few MB, plus a still frame pop out)* "50MB VIDEO — CHIKKA FILE, MATTHE THUMBNAIL, RENDU ONDHE FUNCTION ALLI!"
**Setup:** On-screen: **"video_compress — re-encodes AND grabs a frame, one call"**
**Payoff:** Code: `VideoCompress.compressVideo()` + `getFileThumbnail()`. VO: "PHOTO GE FLUTTER_IMAGE_COMPRESS USE MAADIDHIVI. VIDEO GE? SAME IDEA, DIFFERENT PACKAGE — AADRE MUKHYA REASON SAME: FREE TIER PROTECT MAADODHU!"
**Punchline:** "COMPRESS ILLA ANTHA, ONDHU 60-SECOND VIDEO, 50-100MB IRBAHUDU — FREE TIER, FEW REELS ALLE FULL AAGUTTE!"
**CTA:** "Reel 4 — the free-tier math that changes completely with video. Follow!"
**Caption:** One package call compresses your video AND grabs a thumbnail frame — essential, not optional, for video.
**Tags:** #VideoCompression #FlutterDev #MobileOptimization #FreeTierHacks

---

### Reel 4 — "Video Eats 15-25x MORE Storage Than Photos — The Real Math"
**Hook:** *(Side by side: 300KB photo icon vs 5MB video icon)* "ONDHU PHOTO — 300KB. ONDHU REEL — 5MB. MATH NODI!"
**Setup:** On-screen: **"1GB storage = ~3,000 photos OR ~200 Reels"**
**Payoff:** VO: "SAME FREE TIER, COMPLETELY DIFFERENT CAPACITY — VIDEO ADD MAADIDHRE, MATH REDO MAADBEKU, HONEST AGI!"
**Punchline:** "IDHU REAL ENGINEERING HONESTY — 'IT WORKS' ANTHA HELODHU SAAKU ILLA, 'HOW FAR DOES IT SCALE' ANTHA THINK MAADBEKU!"
**CTA:** "Reel 5 — video_player fundamentals, the building block for everything next. Follow!"
**Caption:** Adding video to a free-tier app means redoing your capacity math, honestly — here's the real number.
**Tags:** #CloudStorage #Supabase #FreeTier #BackendEngineering

---

### Reel 5 — "video_player: Play, Pause, Loop — 5 Lines"
**Hook:** *(A single video playing cleanly, looping)* "IDHU — WHOLE video PLAYER, 5 LINES ALLI!"
**Setup:** On-screen: **"VideoPlayerController.networkUrl — the building block for the whole Reels feed"**
**Payoff:** Code: create controller → `initialize()` → `setLooping(true)` → `play()`. VO: "IDHU NATIVE MEDIA PLAYBACK WRAP MAADUTTE — DISPOSE() CALL MAADODHU CRITICAL, ILLA ANTHA NATIVE DECODER RESOURCE LEAK AAGUTTE!"
**Punchline:** "SIMPLE API, AADRE REAL RESOURCE HANDLE MAADUTTE — RESPECT WITH CARE!"
**CTA:** "Reel 6 — the vertical swipeable feed, one widget you haven't used yet. Follow!"
**Caption:** Play, pause, loop — the video player building block behind every Reel in this app.
**Tags:** #FlutterVideoPlayer #MobileDevelopment #VideoPlayback #FlutterDev

---

### Reel 6 — "The ONE Widget That Makes Reels Feel Like Reels"
**Hook:** *(Swipe up vertically, full-screen video snaps to the next one)* "SWIPE UP — NEXT VIDEO, FULL SCREEN, SNAP!"
**Setup:** On-screen: **"PageView — vertical, not horizontal. One new widget for this whole course."**
**Payoff:** Code: `PageView.builder(scrollDirection: Axis.vertical, ...)`. VO: "LISTVIEW, CONTINUOUS SCROLL — PAGEVIEW, ONDHU ONDHU FULL-SCREEN ITEM, SNAP MAADUTTE. EXACT REELS FEEL!"
**Punchline:** "RIGHT WIDGET, RIGHT JOB — MANUAL SNAP LOGIC BUILD MAADODHU BEKE ILLA!"
**CTA:** "Reel 7 — the #1 bug every beginner hits building this feature. Follow!"
**Caption:** PageView with a vertical scroll direction — the purpose-built widget behind every Reels-style feed.
**Tags:** #FlutterPageView #FlutterUI #ReelsClone #MobileAppDev

---

### Reel 7 — "I Broke My Own App — Every Video Played AT ONCE"
**Hook:** *(Chaotic clip: 5 videos all playing simultaneously, muted, overlapping audio icons)* "FIRST TRY — ELLA VIDEO, ONDHE SALA PLAY AAYTU. CHAOS!"
**Setup:** On-screen: **"The #1 mistake: every page's controller auto-plays"**
**Payoff:** VO: "PAGEVIEW.BUILDER, VISIBLE PAGE MATRA ALLA, NEARBY PAGES KOODA BUILD MAADBAHUDU — EACH ONE, OWN CONTROLLER, OWN PLAY() CALL — DISASTER!"
**Punchline:** "IDHU MOST DAMAGING BUG THIS MODULE ALLI — BATTERY, BANDWIDTH, EMBARRASSING, ELLA ONDHE SALA!"
**CTA:** "Reel 8 — the fix, and the ONE variable that solves everything. Follow!"
**Caption:** My first attempt at a Reels feed played every video at once. Here's exactly why that happens.
**Tags:** #FlutterBugs #DebuggingTips #MobileDevelopment #CodingFails

---

### Reel 8 — "The Fix: ONE Boolean, Decided in ONE Place"
**Hook:** *(Same chaotic clip from before, now cut to: only ONE video playing, clean, silent audio elsewhere)* "SAME CODE — ONDHU FIX, ELLA SOLVED!"
**Setup:** On-screen: **"isActive: i == currentPage — the PARENT decides, every child just listens"**
**Payoff:** Code: `ReelPlayer(isActive: i == _currentPage)`, reacting via `didUpdateWidget`. VO: "EACH VIDEO, TANNAGE DECIDE MAADALLA 'NAN PLAY AAGBEKA' ANTHA — PARENT SCREEN, REAL CURRENT PAGE GOTTIDE, ADHU DECIDE MAADUTTE!"
**Punchline:** "ONDHU SOURCE OF TRUTH — IDHU PRINCIPLE, EVERY BUG LIKE IDHAKKE, SAME FIX!"
**CTA:** "Reel 9 — preloading the next Reel so swiping never stutters. Follow!"
**Caption:** One boolean, decided in exactly one place — the fix for the "everything plays at once" bug.
**Tags:** #FlutterDev #StateManagement #BugFix #MobileAppDevelopment

---

### Reel 9 — "Why the NEXT Reel Is Already Loading Before You Swipe"
**Hook:** *(Swipe to a new Reel — it starts playing INSTANTLY, no buffering spinner)* "SWIPE MAADIDHE — ZERO DELAY, INSTANT PLAY!"
**Setup:** On-screen: **"Preloading — the next page's video is ready BEFORE you arrive"**
**Payoff:** VO: "CURRENT PAGE PLUS ONE PAGE AHEAD, CONTROLLER ALREADY INITIALIZE AAGIDE — BUFFERING START AAGIDE, JUST NOT PLAYING YET!"
**Punchline:** "IDHU CORRECTNESS FIX ALLA — IDHU POLISH. AADRE POLISH NA DIFFERENCE, 'WORKING' MATTHE 'SMOOTH' NA MADHYE!"
**CTA:** "Reel 10 — Module 9 recap, and the moment we realized likes just... worked. Follow!"
**Caption:** The next Reel starts buffering before you even swipe — the polish that makes it feel instant.
**Tags:** #FlutterPerformance #VideoStreaming #MobileUX #AppDevelopment

---

### Reel 10 — "We Added Video. Likes and Comments Needed ZERO Changes."
**Hook:** *(Like a video post from a second account — count updates, notification arrives, EXACT same as a photo)* "VIDEO POST LIKE MAADIDHE — SAME TRIGGER, SAME NOTIFICATION, ZERO NEW CODE!"
**Setup:** On-screen: **"likes/comments/notifications reference a POST, not a photo — they never needed to know"**
**Payoff:** SQL verification: same `toggle_like()`, same `notify_on_like()` trigger, working identically on a `media_type='video'` row. VO: "MODULE 3 ALLI, 'POST' ANTHA GENERAL ABSTRACTION DESIGN MAADIDHIVI — VIDEO EXIST KOODA MAADADHE IRUVAGA! 5 MODULE AAMELE, PAYOFF!"
**Punchline:** "IDHU BEST TEACHING MOMENT — RIGHT ABSTRACTION, FUTURE FEATURE NA FREE AGI SUPPORT MAADUTTE!"
**CTA:** "Module 10 next — the final module. Dark mode, security audit, and shipping a REAL signed app. Follow!"
**Caption:** Module 9 done — a whole Reels feature, and the best proof yet that good abstractions pay for themselves.
**Tags:** #FlutterSupabase #InstagramReelsClone #ModuleRecap #SoftwareArchitecture
