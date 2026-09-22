# Module 4 Reels — Storage & Media Pipeline (10 reels)

Deep-dive arc, Season 2. Same 5-beat format as the trailer series
(`../reel-scripts-01-10.md`). Screen recording = phone camera + Storage dashboard.

---

### Reel 1 — "Public vs Private Buckets (Get This Wrong, Everything Breaks)"
**Hook:** *(Show two folders labeled "public" and "private")* "Photo upload maadoke munche, ONDHU decision — public antha, private antha?"
**Setup:** On-screen: **"Public bucket = anyone with the URL can view. Upload is still protected."**
**Payoff:** Storage dashboard: create `posts` bucket, toggle "Public bucket" ON. VO: "Public antha, ANYONE view maadbahudu — instagram post hage. Upload matra restrict aagide, RLS use maadi."
**Punchline:** "Confuse maadbedi — 'public' antha, 'yaaru bekaadru upload maadbahudu' antha ALLA!"
**CTA:** "Reel 2 — folder-based security on your actual FILES. Follow!"
**Caption:** Public bucket ≠ open upload. Read and write are two completely separate questions.
**Tags:** #SupabaseStorage #CloudStorage #BackendDev #FileUpload

---

### Reel 2 — "Your Photos Have Row Level Security Too"
**Hook:** *(Try uploading a file into someone else's folder)* "Nan bereyavr folder alli, file upload maadoke try maadthini..."
**Setup:** On-screen: **"storage.foldername(name)[1] = auth.uid() — same RLS idea, on files"**
**Payoff:** SQL: insert policy on `storage.objects` checking the first folder segment matches the uploader's own user id. Path convention: `<user_id>/<uuid>.jpg`. VO: "Idhu Module 3 nalli kalithdha idea — ondhe pattern, files ge apply maadthivi!"
**Punchline:** "Database tables matra alla — FILES kooda, same security guard idhe!"
**CTA:** "Reel 3 — the camera-or-gallery picker, in one bottom sheet. Follow!"
**Caption:** File security works exactly like table security — your own folder, your own files, enforced by the database.
**Tags:** #Supabase #StorageRLS #CloudSecurity #FlutterDev

---

### Reel 3 — "Camera or Gallery? One Bottom Sheet Handles Both"
**Hook:** *(Tap the "+" button, a clean bottom sheet slides up)* "Ondhu tap — camera antha, gallery antha, CHOICE kodutte!"
**Setup:** On-screen: **"image_picker — one package, both sources"**
**Payoff:** Code: `showModalBottomSheet` with two `ListTile`s → `ImagePicker().pickImage(source: ImageSource.camera/gallery)`. VO: "User cancel maadidre, error ALLA — idhu NORMAL outcome, silent return maadthivi."
**Punchline:** "Idhu chikka UI decision, aadre Instagram, Swiggy, ELLA app idhe pattern use maadutte!"
**CTA:** "Reel 4 — forcing every post into a perfect square, guaranteed. Follow!"
**Caption:** Camera or gallery — one clean bottom sheet, handled by one Flutter package.
**Tags:** #ImagePicker #FlutterUI #MobileAppDesign #CameraIntegration

---

### Reel 4 — "How Instagram Forces Every Photo Into a Perfect Square"
**Hook:** *(Pick a wide landscape photo, watch it get cropped to a square live)* "Ee wide photo, square aagi convert aagutte — nodi!"
**Setup:** On-screen: **"image_cropper — locked 1:1, no way around it"**
**Payoff:** Code: `ImageCropper().cropImage(aspectRatio: CropAspectRatio(ratioX: 1, ratioY: 1), lockAspectRatio: true)`. VO: "Lock maadadhidre, user drag maadi non-square banisbahudu — grid LAYOUT break aagutte. Lock ondhu sala, ella post SAME shape!"
**Punchline:** "Idhu 'why does my grid look messy' problem na, ONE setting alli fix maadutte!"
**CTA:** "Reel 5 — the compression trick that saves your storage from filling up. Follow!"
**Caption:** Every post is forced into a perfect square at crop time — not faked later with CSS. Here's the one setting.
**Tags:** #ImageCropper #FlutterUI #InstagramClone #MobileDesign

---

### Reel 5 — "4MB Photo → 300KB, No Visible Quality Loss"
**Hook:** *(Show a photo file size: 4.2 MB, then after processing: 280 KB)* "SAME photo — 4MB inda 280KB ge, quality nodi!"
**Setup:** On-screen: **"flutter_image_compress — resize + compress, before upload"**
**Payoff:** Code: `compressWithFile(path, quality: 80, minWidth: 1080)`. Side-by-side zoom comparison — visually identical. VO: "Phone camera, 4-5MB photo tegethade — compress maadadhidre, free tier storage FAST full aagutte!"
**Punchline:** "Idhu chikka setting, aadre idhu 10x MORE posts free tier alli fit aagbahudu antha maadutte!"
**CTA:** "Reel 6 — the full pipeline, camera to live post, in real time. Follow!"
**Caption:** A tiny quality trade-off that lets your free tier hold 10x more posts. The compression step nobody skips.
**Tags:** #ImageCompression #FlutterDev #FreeTierHacks #MobileOptimization

---

### Reel 6 — "Camera to Live Post — Full Pipeline, Real Time"
**Hook:** *(Take a real photo)* "Nan ee photo tegethini, LIVE upload aagutte nodi!"
**Setup:** On-screen: **"Pick → Crop → Compress → Upload → Post appears"**
**Payoff:** Unbroken screen recording: tap camera → take photo → crop to square → brief spinner → photo appears in the feed. On-screen labels flash at each stage.
**Punchline:** "4 steps, ondhu unbroken flow — idhu FEEL maadutte hage, 'real Instagram' hage!"
**CTA:** "Reel 7 — what happens when your upload fails (and why that's not a crash). Follow!"
**Caption:** From camera tap to a live post in the feed — the full pipeline, unedited.
**Tags:** #FlutterDev #MediaPipeline #AppDemo #CodingReels

---

### Reel 7 — "What Happens When Your Upload Fails Mid-Air?"
**Hook:** *(Turn on airplane mode, try to post)* "Airplane mode ON maadi, post maadoke try maadthini..."
**Setup:** On-screen: **"A failed upload should NEVER feel like a crash"**
**Payoff:** Show a clear, friendly "You're offline" message instead of a hang or crash. Turn wifi back on, tap "Try again" — succeeds without re-picking the photo. VO: "Connectivity check UPFRONT maadthivi — slow timeout wait maadoke beke illa. Compressed bytes memory alli irutte, retry ge re-pick maadoke beke illa!"
**Punchline:** "Idhu polish — aadre idhe difference, 'college project' matthe 'real app' na madhye!"
**CTA:** "Reel 8 — why a scrolled-past image never re-downloads. Follow!"
**Caption:** A good failure state is invisible until you need it — instant offline detection, retry without re-picking.
**Tags:** #FlutterUX #ErrorHandling #OfflineFirst #AppDevelopment

---

### Reel 8 — "Why Scrolling Back Up Never Re-Downloads a Photo"
**Hook:** *(Scroll down a feed, scroll back up — images appear instantly, no reload)* "Nan scroll up maadidhe — photo INSTANT bantu, reload aagalilla!"
**Setup:** On-screen: **"CachedNetworkImage — download once, remember forever"**
**Payoff:** Code: `CachedNetworkImage(imageUrl:, placeholder:, errorWidget:)` with a `shimmer` skeleton shown while loading. VO: "First time download aagutte, disk alli cache aagutte. Second time? Zero network call — instant!"
**Punchline:** "Idhu UX improvement MATRA alla — idhu nim free tier bandwidth kooda SAVE maadutte!"
**CTA:** "Reel 9 — the shimmer effect, and why a spinner alone isn't enough. Follow!"
**Caption:** Every image caches automatically — scroll back up and it loads instantly, zero extra network cost.
**Tags:** #CachedNetworkImage #FlutterPerformance #MobileDev #BandwidthOptimization

---

### Reel 9 — "That Shimmer Effect You See in Every Good App"
**Hook:** *(Show a shimmering grey placeholder while a photo loads)* "Ee shimmering box nodidhira? Idhu ondhu chikka trick, HUGE difference maadutte!"
**Setup:** On-screen: **"A skeleton loader feels faster than a blank spinner"**
**Payoff:** Code: `Shimmer.fromColors` wrapping a grey placeholder box. Compare: blank white space (feels broken) vs shimmer (feels like "content is coming").
**Punchline:** "Idhu PSYCHOLOGY — same loading time, aadre shimmer FASTER antha feel aagutte!"
**CTA:** "Reel 10 — Module 4 recap, and the ONE size-fits-all decision that keeps this simple. Follow!"
**Caption:** Same loading time, completely different feeling — a shimmer skeleton vs a blank screen.
**Tags:** #ShimmerEffect #FlutterUI #LoadingStates #UXDesign #Karnataka

---

### Reel 10 — "Module 4 Recap: One Photo Size, Used Everywhere"
**Hook:** *(Show the same photo rendering perfectly in a tiny grid cell AND a full feed card)* "SAME photo, chikka grid alli, dodda feed alli — ELLA sharp!"
**Setup:** On-screen: **"No thumbnail pipeline. One good size, everywhere."**
**Payoff:** VO: "Instagram scale alli, multiple sizes generate maadthare. Namge? Ondhe 1080px compressed image, EVERYWHERE reuse maadthivi. Simpler, aadhre exact correct decision, NAM scale ge."
**Punchline:** "Idhu engineering judgment — 'possible' antha ALLA, 'necessary' antha yochane maadbeku!"
**CTA:** "Module 5 next — the live feed, likes, and comments. Follow so you don't miss it!"
**Caption:** Module 4 done — a full media pipeline, one deliberate simplification, and a real reason for it.
**Tags:** #FlutterSupabase #MediaPipeline #ModuleRecap #SoftwareEngineering
