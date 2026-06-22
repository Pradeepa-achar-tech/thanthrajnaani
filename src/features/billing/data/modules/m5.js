// Module 5 — The Menu / SKU System for the "TunMani Cafe Billing" POS app.
// Teaches services/sku_seed.dart and screens/admin/sku_admin_screen.dart:
// seeding ~208 menu items, the SKU admin CRUD screen, and seasonal/active flags.

export const m5 = {
  id: 'm5',
  title: 'The Menu / SKU System',
  hours: 8,
  color: 'from-rose-500/20 to-rose-700/10',
  accent: 'rose',
  description:
    'Build the menu behind TunMani Cafe Billing: seed ~208 real coastal-Karnataka dishes once with a batched importer, manage them in a live SKU admin screen, and handle seasonal market-price items with the active flag.',
  sections: [
    {
      id: 'm5-s1',
      title: 'Seeding the Menu',
      topics: [
        {
          id: 'm5-t1',
          title: 'What a SKU Seed Is and Why It Exists',
          explain:
            'A seed is a one-time import that loads the full starting menu (~208 dishes) into Firestore so the app launches with a real menu instead of an empty screen.',
          analogy:
            'When TunMani Cafe first opens in Kundapura, nobody hand-types all 208 dishes — neer dosa, kori rotti, fish thali, ghee roast, goli baje, gadbad ice cream — one by one into the till on opening morning. Instead the owner brings a **printed master menu** and a helper copies the whole list into the system in one go before the first guest arrives. The SKU seed is that printed master menu: a fixed list shipped with the app and poured into Firestore once.',
          theory:
            "A **SKU** (Stock Keeping Unit) is one sellable menu item: a `code`, a `name`, and a `price`. The restaurant's full menu is roughly **208 SKUs**. A brand-new Firestore database starts empty, so the very first thing the app needs is that menu loaded in.\n\nThe **seed** is a hard-coded list of those 208 items living in `services/sku_seed.dart` — a Dart `List<Map<String, dynamic>>` or a list of small records, each `{ code, name, price }`. Shipping the list in code (rather than asking the owner to type it) means a fresh install can populate a real, correct menu in one button press.\n\nSeeding is an **admin action**, not something that runs on every launch. The owner taps **\"Import SKU Menu\"** once in the admin screen; the app writes all 208 documents into the `skus` collection. After that the menu lives in Firestore and is edited normally through the admin screen — the seed is never needed again unless you reset the database.\n\nThe seed data is the **source of truth for the initial menu only**. Once seeded, edits (price changes, new dishes, deactivations) happen in Firestore and are **not** written back to the Dart list. Treat the seed as a starting snapshot, not a live mirror.\n\nThe key properties a good seed needs — covered across this section — are: a clean data shape, **batched writes** so 208 documents go in efficiently, and **idempotency** so tapping import twice does not create 416 duplicate dishes.",
          whyItMatters:
            'Without a seed, a freshly installed TunMani Cafe Billing app shows an empty menu and is useless until someone types 208 items by hand — error-prone and slow. A code-shipped, one-tap seed means the app is demo-ready and store-ready instantly, with a correct, consistent menu every time. It is the difference between a usable product and a blank screen on day one.',
          steps: [
            'Define a SKU as `{ code, name, price }` — the three fields every menu item needs.',
            'Collect the full ~208-item menu as a hard-coded list in `services/sku_seed.dart`.',
            'Treat seeding as a one-time admin action, not a per-launch task.',
            'Expose it behind an "Import SKU Menu" button in the admin screen.',
            'On import, write every seed item into the `skus` collection.',
            'After seeding, edit the menu only through Firestore — not the Dart list.',
            'Plan for batching and idempotency (next topics) before wiring the button.',
          ],
          code: `// services/sku_seed.dart — the hard-coded starting menu (excerpt of ~208).
class SkuSeed {
  // Each entry is one menu item: code, name, price (in rupees).
  static const List<Map<String, dynamic>> items = [
    {'code': 101, 'name': 'Neer Dosa (2 pcs)', 'price': 30},
    {'code': 102, 'name': 'Neer Dosa (4 pcs)', 'price': 55},
    {'code': 110, 'name': 'Goli Baje (plate)', 'price': 60},
    {'code': 142, 'name': 'Kori Rotti', 'price': 120},
    {'code': 150, 'name': 'Chicken Ghee Roast', 'price': 240},
    {'code': 175, 'name': 'Anjal Fish Thali', 'price': 320},
    {'code': 176, 'name': 'Fish Thali (market)', 'price': 0}, // seasonal
    {'code': 201, 'name': 'Gadbad Ice Cream', 'price': 110},
    // ... ~200 more dishes ...
  ];
}

// The seed is the source of truth for the INITIAL menu only.
// After import, the live menu lives in Firestore and is edited there.`,
          pitfalls: [
            '**Running the seed on every app launch.** It re-imports each start, risking duplicates and overwriting edits. Fix: make it a one-time admin button.',
            '**Expecting price edits to flow back into the Dart list.** They do not. Fix: treat the seed as a starting snapshot; edit live in Firestore.',
            '**Hard-coding only a few items "for now".** The app then ships a half-menu. Fix: seed the full ~208-item list.',
            "**Storing price as a string.** Totals and sorting break. Fix: store `price` as a number.",
            '**Putting the seed list in the UI layer.** It bloats widgets and is hard to reuse. Fix: keep it in `services/sku_seed.dart`.',
            '**Skipping a code on some items.** Staff cannot search them. Fix: give every dish a unique `code`.',
          ],
          tryIt:
            "Open services/sku_seed.dart and add five real coastal dishes you know — for example Bothi (Boodida) Fry, Kane Rava Fry, Pundi (rice dumplings), Patrode, and Mangalore Buns — each with a unique code and a price. Confirm the list still compiles and count your total items.",
          takeaway:
            'A SKU seed is a code-shipped master menu imported once via an admin button so a fresh app launches with the full ~208-item menu.',
        },
        {
          id: 'm5-t2',
          title: 'Shaping the Seed Data: code, name, price',
          explain:
            'Design the seed entry shape carefully — unique integer codes, clean names, numeric prices — because every menu screen reads this shape.',
          analogy:
            'A well-run TunMani Cafe kitchen gives every dish a **short number** the waiters shout to the cooks — "one 142!" for kori rotti — a **clear printed name** for the guest\'s bill, and a **fixed price** on the board. Sloppy numbering (two dishes sharing 142) or vague names ("special") cause chaos at the pass. The seed entry shape enforces that same discipline in data.',
          theory:
            "Every seed entry has exactly three fields, and each carries rules.\n\n**`code`** is a **unique integer** staff use to find a dish fast — they type or scan the number rather than scroll. Group codes by category for usability: 1xx for tiffin (dosas, baje), 14x–17x for mains (kori rotti, ghee roast, thalis), 2xx for desserts (gadbad). Uniqueness is non-negotiable: two dishes sharing a code make the order screen ambiguous.\n\n**`name`** is the **human-readable label** printed on the bill and shown to staff. Keep it specific and self-explanatory — `'Neer Dosa (4 pcs)'` not just `'Dosa'`, `'Chicken Ghee Roast'` not `'Ghee Roast'`. The name is what the guest sees, so portion and protein should be unambiguous.\n\n**`price`** is a **number** in rupees. A normal dish has a positive price; a **seasonal/market-price** item (fish that costs whatever the morning catch costs) uses **`price: 0`** as a sentinel meaning \"price set at billing time\" — covered fully in Section 3. Never store price as a string; you need to multiply and sum it.\n\nWhen seeded, each entry also gains an implied **`active: true`** so it shows up in the order screen immediately. The seed itself can omit `active` and let the importer default it to `true`, keeping the seed list focused on the three essential fields.\n\nGood seed shape means every downstream screen — order entry, admin list, bill print — reads the same predictable map and never has to guess a field's type.",
          whyItMatters:
            'The seed shape is read by every menu-facing screen, so getting it clean once saves type-coercion bugs everywhere. Unique codes make staff fast; clear names make bills correct; numeric prices make math possible. A `price: 0` convention for seasonal items, decided here, unlocks the market-price workflow later without a schema change.',
          steps: [
            'Give every dish a unique integer `code`; group ranges by category.',
            'Write specific `name`s with portion/protein, not vague labels.',
            'Store `price` as a number in rupees, never a string.',
            'Use `price: 0` to mark seasonal/market-price items.',
            'Let the importer default `active: true` so seeded items show immediately.',
            'Scan the list for duplicate codes before importing.',
            'Keep the seed focused on `code`, `name`, `price` — derive the rest.',
          ],
          code: `// Seed entries grouped by category with disciplined codes and names.
class SkuSeed {
  static const List<Map<String, dynamic>> items = [
    // --- 1xx: Tiffin & starters ---
    {'code': 101, 'name': 'Neer Dosa (2 pcs)', 'price': 30},
    {'code': 110, 'name': 'Goli Baje (plate)', 'price': 60},
    {'code': 118, 'name': 'Mangalore Buns (2 pcs)', 'price': 45},

    // --- 14x-17x: Mains ---
    {'code': 142, 'name': 'Kori Rotti', 'price': 120},
    {'code': 150, 'name': 'Chicken Ghee Roast', 'price': 240},
    {'code': 175, 'name': 'Anjal Fish Thali', 'price': 320},
    {'code': 176, 'name': 'Pomfret Tawa Fry (market)', 'price': 0}, // seasonal

    // --- 2xx: Desserts ---
    {'code': 201, 'name': 'Gadbad Ice Cream', 'price': 110},
  ];

  // Validate uniqueness at dev time.
  static bool hasDuplicateCodes() {
    final codes = items.map((m) => m['code']).toList();
    return codes.toSet().length != codes.length;
  }
}`,
          pitfalls: [
            '**Reusing a code across two dishes.** The order screen cannot tell them apart. Fix: enforce unique codes (use `hasDuplicateCodes`).',
            '**Vague names like "Fish Fry".** The bill is unclear and dishes collide. Fix: specify protein and portion.',
            "**Price as a string `'120'`.** Arithmetic and sorting fail. Fix: store the number `120`.",
            '**Using `null` for seasonal price.** Downstream null-handling gets messy. Fix: use the `0` sentinel consistently.',
            '**Putting `active` in every seed row.** Noisy and repetitive. Fix: default it to `true` in the importer.',
            '**Random unstructured codes.** Staff cannot guess or group them. Fix: assign category ranges.',
          ],
          tryIt:
            "Add three seasonal seafood items to the seed with `price: 0` (e.g. Lady Fish Fry, Crab Masala, Prawns Ghee Roast). Then call `SkuSeed.hasDuplicateCodes()` in a quick `main()` and confirm it returns false. Introduce a deliberate duplicate code and confirm it flips to true.",
          takeaway:
            'Unique integer codes, specific names, and numeric prices (with `0` for seasonal) make one clean seed shape that every menu screen can trust.',
        },
        {
          id: 'm5-t3',
          title: 'Batch Writes: Importing 208 Items Efficiently',
          explain:
            'Use Firestore WriteBatch to commit many SKU documents in chunks of 500 instead of 208 separate network round-trips.',
          analogy:
            'Carrying 208 dishes from the TunMani Cafe kitchen to the counter **one plate at a time** means 208 trips — slow and exhausting. A smart server stacks them on a **trolley** and wheels many at once. A Firestore `WriteBatch` is that trolley: it groups many writes and commits them in a single trip, so seeding the whole menu is a couple of round-trips, not 208.',
          theory:
            "Writing 208 documents with 208 separate `.set()` calls means **208 network round-trips** — slow, and each can fail independently leaving a half-seeded menu. Firestore's **`WriteBatch`** solves both problems.\n\nA `WriteBatch` collects multiple writes and commits them **atomically in one network call**: `final batch = db.batch(); batch.set(ref1, data1); batch.set(ref2, data2); await batch.commit();`. Either all writes in the batch land or none do, and it is dramatically faster than individual writes.\n\nThere is one hard limit: **a single batch can hold at most 500 operations**. With ~208 items you fit in one batch, but writing the importer to **chunk into groups of 500** future-proofs it for a bigger menu and is the correct general pattern. You loop the seed list, start a fresh batch every 500 items, and commit each batch.\n\nFor the doc ID, you can let Firestore auto-generate (`_skus.doc()`) or — better for idempotency, covered next — use a **deterministic ID derived from the code** (`_skus.doc('sku_\${code}')`) so re-running maps the same item to the same document. Each batched `set` writes `{ code, name, price, active: true }`.\n\nBecause `batch.commit()` returns a `Future`, you `await` it and can show progress (\"Imported 208 items\"). If a batch fails, its atomicity means you retry that whole chunk cleanly rather than guessing which of 500 writes succeeded.",
          whyItMatters:
            'Batching turns a slow, fragile 208-trip import into a fast, atomic one — the difference between a seed that takes seconds and reliably finishes versus one that crawls and can strand the menu half-loaded. The 500-op chunking pattern is the standard Firestore bulk-write technique you will reuse for any mass import.',
          steps: [
            'Create a batch with `db.batch()`.',
            'Loop the seed list, adding `batch.set(ref, data)` per item.',
            'Start a fresh batch every 500 operations to respect the limit.',
            'Use a deterministic doc ID like `sku_<code>` for idempotency.',
            'Default `active: true` on each written document.',
            'Commit each batch with `await batch.commit()`.',
            'Await all batches and report the imported count.',
          ],
          code: `// services/sku_seed.dart — batched importer (chunks of 500).
Future<int> importSeed(FirebaseFirestore db) async {
  final skus = db.collection('skus');
  const chunkSize = 500; // Firestore hard limit per batch
  var written = 0;

  for (var start = 0; start < SkuSeed.items.length; start += chunkSize) {
    final batch = db.batch();
    final end = (start + chunkSize).clamp(0, SkuSeed.items.length);

    for (final item in SkuSeed.items.sublist(start, end)) {
      final code = item['code'] as int;
      // Deterministic doc id => re-import maps to the same doc (idempotent).
      final ref = skus.doc('sku_\$code');
      batch.set(ref, {
        'code': code,
        'name': item['name'],
        'price': item['price'],
        'active': true,
      });
      written++;
    }

    await batch.commit(); // one network round-trip per chunk
  }
  return written; // e.g. 208
}`,
          pitfalls: [
            '**Writing each item with a separate `.set()`.** 208 round-trips, slow and non-atomic. Fix: use a `WriteBatch`.',
            '**Putting more than 500 ops in one batch.** `commit()` throws. Fix: chunk into groups of 500.',
            "**Forgetting to `await batch.commit()`.** The import silently does nothing. Fix: await each commit.",
            '**Auto-generating doc IDs while wanting idempotency.** Re-imports duplicate everything. Fix: use a deterministic `sku_<code>` ID.',
            '**Omitting `active` on the batched write.** Items may default to hidden. Fix: set `active: true` explicitly.',
            '**Ignoring a failed chunk.** Half the menu lands. Fix: surface the error and retry the whole (atomic) chunk.',
          ],
          tryIt:
            "Wire importSeed to an admin button and run it against a test Firestore. Confirm the skus collection gains 208 documents and that each doc ID is `sku_<code>`. Time the import and compare it (mentally) to 208 separate writes. Then temporarily raise the seed past 500 items and confirm the chunking still commits in two batches.",
          takeaway:
            'A WriteBatch commits up to 500 documents atomically per round-trip — chunk the seed into 500s and use deterministic `sku_<code>` IDs.',
        },
        {
          id: 'm5-t4',
          title: 'Idempotency: Never Double-Seed',
          explain:
            'Make the importer safe to run twice — re-running must update existing items, not create 416 duplicate dishes.',
          analogy:
            'If a flustered helper imports the TunMani Cafe master menu **twice** on opening morning, you must not end up with two kori rottis, two of every dish, on the board. A disciplined system says: "kori rotti already has a slot — just overwrite that slot, do not add a second one." That overwrite-in-place behaviour is **idempotency**: running the import once or five times leaves the same clean menu.',
          theory:
            "**Idempotency** means an operation produces the same result no matter how many times you run it. A seed importer must be idempotent because the owner *will* tap \"Import SKU Menu\" twice — by accident, after a reinstall, or to refresh prices.\n\nThe naive importer using **auto-generated doc IDs** is *not* idempotent: each run creates 208 brand-new documents, so a second run yields 416, a third 624. The menu fills with duplicates.\n\nThe fix is a **deterministic doc ID** derived from the item's stable key — the `code`: `_skus.doc('sku_\${code}')`. Because the ID is the same every run, `batch.set` on that ID **overwrites the existing document** rather than creating a new one. Run the import ten times and you still have exactly 208 documents, each holding the latest seed values. This is the simplest and most robust idempotency strategy.\n\nA second, complementary guard is a **\"seed once\" flag** or a pre-check: before importing, read whether the `skus` collection is already non-empty (or check a `settings/seeded` flag) and either skip or ask the user to confirm a re-import. This prevents an accidental overwrite of *edited* prices — since `set` would reset a manually changed price back to the seed value.\n\nThe pragmatic combination the app uses: deterministic IDs guarantee **no duplicates ever**, and a confirmation prompt (\"Menu already imported — re-import and overwrite prices?\") guards against **clobbering live edits**. Together they make the import safe to tap any number of times.",
          whyItMatters:
            'A non-idempotent seed is a duplicate-menu bug waiting to happen — and duplicates in a POS are not cosmetic; they confuse staff and corrupt order entry. Deterministic IDs make the importer safe by construction, and the confirm-before-overwrite guard protects the owner\'s hand-edited prices. This is what lets you ship an import button you do not have to fear.',
          steps: [
            'Derive each doc ID deterministically from the stable `code`: `sku_<code>`.',
            'Use `batch.set` on that ID so re-runs overwrite, never duplicate.',
            'Before importing, check whether `skus` is already populated.',
            'If populated, prompt the user to confirm a re-import.',
            'Warn that re-import overwrites manually edited prices back to seed values.',
            'Optionally store a `settings/seeded = true` flag after the first import.',
            'Test by importing twice and asserting the count stays 208.',
          ],
          code: `// Idempotent import: deterministic IDs + a one-time guard.
Future<int> importSeedSafe(FirebaseFirestore db, {bool force = false}) async {
  final skus = db.collection('skus');

  // Guard: avoid clobbering edited prices unless forced.
  final existing = await skus.limit(1).get();
  if (existing.docs.isNotEmpty && !force) {
    throw StateError('Menu already imported. Re-import with force: true '
        'to overwrite prices.');
  }

  final batch = db.batch();
  for (final item in SkuSeed.items) {
    final code = item['code'] as int;
    // Same code => same doc id => overwrite, never duplicate. Idempotent.
    batch.set(skus.doc('sku_\$code'), {
      'code': code,
      'name': item['name'],
      'price': item['price'],
      'active': true,
    });
  }
  await batch.commit();
  return SkuSeed.items.length; // always 208, no matter how many runs
}`,
          pitfalls: [
            '**Auto-generated IDs in the seed.** Every run duplicates the whole menu. Fix: deterministic `sku_<code>` IDs.',
            '**No re-import guard.** Tapping import again silently resets edited prices. Fix: check existing data and confirm.',
            "**Using `add()` instead of `set()` with a fixed ID.** `add()` always creates new docs. Fix: `set` on a known ID.",
            '**Assuming users tap import only once.** They will not. Fix: design for repeated taps.',
            '**Forcing overwrite without warning.** Owner loses hand-tuned prices. Fix: warn explicitly before `force`.',
            "**Keying the ID on `name` instead of `code`.** Renaming a dish breaks idempotency. Fix: key on the stable `code`.",
          ],
          tryIt:
            "Run importSeedSafe twice in a row. Confirm the second call throws the 'already imported' guard, and that calling it with `force: true` succeeds while the skus document count stays at 208 (not 416). Edit one price in Firestore, force re-import, and observe the price reset — then explain why the guard exists.",
          takeaway:
            'Deterministic `sku_<code>` IDs make the import idempotent by construction; a confirm-before-overwrite guard protects hand-edited prices.',
        },
      ],
    },
    {
      id: 'm5-s2',
      title: 'SKU Admin Screen',
      topics: [
        {
          id: 'm5-t5',
          title: 'The Live SKU List with StreamBuilder',
          explain:
            'Build the admin list as a StreamBuilder over allSkus() ordered by code, so edits appear instantly across devices.',
          analogy:
            'The TunMani Cafe manager\'s **menu board behind the counter** updates the moment a price is chalked in — every waiter sees the change at once, no one re-reads the whole board. The SKU admin list is that live board: a StreamBuilder that redraws itself whenever any dish changes in Firestore.',
          theory:
            "The SKU admin screen is the owner's control panel for the menu. Its backbone is a **`StreamBuilder<List<Sku>>`** bound to the `allSkus()` stream from the FirestoreService (Module 4), which is `_skus.orderBy('code').snapshots().map(...)`.\n\nBecause it is a stream, the list **auto-updates**: when the owner toggles a dish or another device edits a price, the `StreamBuilder` rebuilds with fresh data — no pull-to-refresh, no manual reload. The `orderBy('code')` keeps items in the staff-familiar numeric order.\n\nThe `StreamBuilder` handles three states you must render: **waiting** (show a spinner while the first snapshot loads), **error** (show a friendly message if the stream faults), and **data** (build a `ListView` of rows). A robust builder checks `snapshot.connectionState`, `snapshot.hasError`, and `snapshot.hasData` before reading `snapshot.data`.\n\nInside the data branch you build a `ListView.builder` over the `List<Sku>`, one row per dish (the next topic details the row). Using `ListView.builder` (not a plain `Column`) means only visible rows are built, which matters for a 208-item menu.\n\nThe screen also hosts the **Add SKU FAB** and the **Import SKU Menu** action — but the live list is the heart of it. Binding to a stream rather than a one-time read is the single decision that makes the admin screen feel real-time and keeps every device consistent.",
          whyItMatters:
            'A live admin list means the owner sees their own edits and other devices\' edits instantly, with zero refresh logic to write or get wrong. Handling the waiting/error/data states properly is what separates a polished admin screen from one that flashes blank or crashes on a slow network. This StreamBuilder pattern recurs on every live screen in the app.',
          steps: [
            'Get the `allSkus()` stream from the FirestoreService.',
            'Wrap the body in `StreamBuilder<List<Sku>>(stream: service.allSkus(), ...)`.',
            'Handle the waiting state with a `CircularProgressIndicator`.',
            'Handle the error state with a readable message.',
            'On data, build a `ListView.builder` over the SKU list.',
            'Render one row per SKU (next topic) in `code` order.',
            'Add the Add-SKU FAB and Import action to the scaffold.',
          ],
          code: `// screens/admin/sku_admin_screen.dart — the live list.
class SkuAdminScreen extends StatelessWidget {
  const SkuAdminScreen({super.key, required this.service});
  final FirestoreService service;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Menu / SKUs')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openEditDialog(context), // Add SKU
        child: const Icon(Icons.add),
      ),
      body: StreamBuilder<List<Sku>>(
        stream: service.allSkus(), // orderBy('code')
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return const Center(child: Text('Could not load the menu.'));
          }
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final skus = snapshot.data!;
          if (skus.isEmpty) {
            return const Center(child: Text('No items yet. Import the menu.'));
          }
          return ListView.builder(
            itemCount: skus.length,
            itemBuilder: (context, i) => SkuRow(sku: skus[i], service: service),
          );
        },
      ),
    );
  }
}`,
          pitfalls: [
            '**Reading the menu once with a FutureBuilder.** Edits do not appear without a refresh. Fix: use a StreamBuilder over `allSkus()`.',
            '**Ignoring the waiting state.** The screen flashes a null-data crash. Fix: check `!snapshot.hasData` and show a spinner.',
            "**Reading `snapshot.data!` without a null check.** Crashes on first frame. Fix: guard with `hasData`.",
            '**Building a `Column` of 208 rows.** Janky and memory-heavy. Fix: `ListView.builder` builds only visible rows.',
            '**No empty-state message.** A blank screen looks broken before seeding. Fix: show "Import the menu".',
            '**Creating the stream inside `build` anew each frame.** Spawns listeners. Fix: get one stream from the service.',
          ],
          tryIt:
            'Build SkuAdminScreen with the StreamBuilder above and run it against a seeded Firestore. Confirm all 208 items load in code order. Then edit a price directly in the Firebase console and watch the row update live on the screen without any refresh.',
          takeaway:
            'A StreamBuilder over `allSkus()` with proper waiting/error/empty handling gives a live, code-ordered admin list that updates everywhere instantly.',
        },
        {
          id: 'm5-t6',
          title: 'The SKU Row: Code Badge, Name, Price, Active Toggle',
          explain:
            'Design each list row: a code badge, the dish name, the price, and an inline active toggle that calls toggleSku.',
          analogy:
            'Each line on the TunMani Cafe menu board reads at a glance: a **number tag** (142), the **dish** (Kori Rotti), the **price** (₹120), and a little **"available today?" tick** the manager flips on or off. The SKU row mirrors that line exactly — and flipping the tick instantly updates the kitchen, not after a save button.',
          theory:
            "Each row presents one `Sku` and offers inline actions. A clean layout is a `ListTile` with:\n\n- **leading: a code badge** — the `code` in a small rounded container so staff can scan numbers quickly.\n- **title: the name** — the dish label.\n- **subtitle or trailing: the price** — formatted as `₹120`, or a `Market` chip when `price == 0` (seasonal, Section 3).\n- **trailing: an active `Switch`** — bound to `sku.active`, calling `service.toggleSku(sku.id, value)` on change.\n\nThe **active toggle is inline** and writes immediately — `onChanged: (v) => service.toggleSku(sku.id, v)`. Because the list is a StreamBuilder, the write flows back through the stream and the switch reflects the persisted state; you do not manage local toggle state yourself. This optimistic-yet-stream-confirmed pattern keeps the UI honest.\n\nTapping the row body opens the **edit dialog** (next topic); a trailing overflow or a swipe action offers **delete**. Keep destructive delete behind a confirmation so a mis-tap does not erase a dish.\n\nThe row is a small, focused widget (`SkuRow`) taking a `Sku` and the `service`. Keeping it separate from the list makes it testable and keeps the StreamBuilder lean. The code badge plus name plus price plus toggle is exactly the information density a busy admin needs — nothing more.",
          whyItMatters:
            'The row is where the owner spends most of their admin time — toggling availability and scanning prices. An inline, instantly-persisting toggle (no save button) makes day-to-day menu management fast, and the code badge makes a 208-item list scannable. Routing the toggle through `toggleSku` keeps the write scoped to one field so a quick toggle never clobbers price or name.',
          steps: [
            'Make a `SkuRow` widget taking a `Sku` and the `FirestoreService`.',
            'Use a `ListTile` with a leading code badge container.',
            'Show the name as the title.',
            'Show the price (or a Market chip when `price == 0`) as trailing/subtitle.',
            'Add a trailing `Switch` bound to `sku.active`.',
            'On switch change, call `service.toggleSku(sku.id, value)` — no local state.',
            'Open the edit dialog on row tap; offer delete behind a confirm.',
          ],
          code: `// SkuRow — one menu item as a scannable, actionable line.
class SkuRow extends StatelessWidget {
  const SkuRow({super.key, required this.sku, required this.service});
  final Sku sku;
  final FirestoreService service;

  @override
  Widget build(BuildContext context) {
    final isSeasonal = sku.price == 0;
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.rose.shade50,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text('\${sku.code}'),
      ),
      title: Text(sku.name),
      subtitle: Text(isSeasonal ? 'Market price' : '₹\${sku.price}'),
      trailing: Switch(
        value: sku.active,
        // Inline write — scoped to the active field only.
        onChanged: (v) => service.toggleSku(sku.id, v),
      ),
      onTap: () => _openEditDialog(context, sku), // edit dialog
      onLongPress: () => _confirmDelete(context, sku),
    );
  }
}`,
          pitfalls: [
            '**Managing the toggle with local `setState`.** It can drift from Firestore. Fix: bind to `sku.active` and let the stream confirm.',
            '**Calling `saveSku` to flip active.** Risks rewriting price/name. Fix: use `toggleSku` (one field).',
            "**Delete on a single tap.** Easy to erase a dish by accident. Fix: confirm destructive delete.",
            '**Cramming too much into the row.** It becomes unreadable. Fix: badge + name + price + toggle, nothing more.',
            '**Hard-coding the rupee symbol inconsistently.** Bills and rows mismatch. Fix: format price in one helper.',
            '**Not distinguishing seasonal items.** Staff see `₹0` and are confused. Fix: show a Market chip when `price == 0`.',
          ],
          tryIt:
            'Build SkuRow and flip the active switch on a dish. Confirm the change persists in Firestore and the switch stays put after a hot restart. Then long-press to delete (behind a confirm dialog) and verify the row disappears from the live list.',
          takeaway:
            'Each row is a code badge, name, price (or Market chip), and an inline active Switch wired straight to `toggleSku` — no local toggle state.',
        },
        {
          id: 'm5-t7',
          title: 'The Edit Dialog: Add and Update with Validation',
          explain:
            'Build one dialog for both add and edit: fields for code, name, price, and active — with a unique-code check before saving via saveSku.',
          analogy:
            'When the TunMani Cafe owner adds a new dish or fixes one, he fills a small **booking slip**: number, name, price, available?. Before pinning it up he checks the number is not already taken. The edit dialog is that slip — and the unique-code check is the glance at the board before pinning.',
          theory:
            "One dialog serves both **Add** (FAB) and **Edit** (row tap). It takes an optional existing `Sku`: null means add (blank fields, new doc), non-null means edit (pre-filled fields, same doc ID).\n\nThe dialog has four inputs:\n- **code** — a numeric `TextFormField`, validated as a positive integer.\n- **name** — a text field, validated non-empty.\n- **price** — a numeric field; `0` is allowed and means seasonal.\n- **active** — a `Switch` defaulting to true.\n\n**Validation** runs before saving. The most important rule is **code uniqueness**: a new or changed code must not collide with another SKU. You check by querying `_skus.where('code', isEqualTo: enteredCode).limit(1).get()` and rejecting if a *different* document already uses it. Name must be non-empty; price must parse as a non-negative number.\n\nOn save, build a `Sku` (keeping the existing `id` for edits, empty for adds) and call **`service.saveSku(sku)`** — which `set`s the document. Because the list is a StreamBuilder, the new or edited row appears automatically when the write lands; you just close the dialog.\n\nUsing one dialog for both operations avoids duplicated form code and keeps add/edit behaviour identical. The only difference is the seed `Sku` and whether you reuse the doc ID — the validation, fields, and save path are shared.",
          whyItMatters:
            'The unique-code validation prevents the single worst menu bug — two dishes sharing a code, which makes order entry ambiguous. Sharing one dialog for add and edit halves the form code and guarantees consistent validation. Allowing `price: 0` here is what lets the owner create seasonal items directly from the admin screen.',
          steps: [
            'Build one dialog taking an optional existing `Sku` (null = add).',
            'Pre-fill fields from the `Sku` for edit, blank for add.',
            'Add validated fields: code (positive int), name (non-empty), price (>= 0), active switch.',
            'Before saving, query `where(\'code\', isEqualTo: code).limit(1)` to enforce uniqueness.',
            'Reject if a *different* document already uses the code.',
            'Build a `Sku` (reuse id for edit, empty for add) and call `service.saveSku`.',
            'Close the dialog; the StreamBuilder shows the change automatically.',
          ],
          code: `// Add/Edit dialog with code-uniqueness validation.
Future<void> saveFromDialog(
  FirestoreService service, {
  Sku? existing,
  required int code,
  required String name,
  required num price,
  required bool active,
}) async {
  // 1. Uniqueness: no OTHER doc may use this code.
  final clash = await service.skuByCode(code); // where('code'==code).limit(1)
  if (clash != null && clash.id != (existing?.id ?? '')) {
    throw StateError('Code \$code is already used by "\${clash.name}".');
  }

  // 2. Build the model — reuse id for edits, empty for adds.
  final sku = Sku(
    id: existing?.id ?? '',
    code: code,
    name: name.trim(),
    price: price,     // 0 allowed => seasonal/market-price item
    active: active,
  );

  // 3. Persist. set() creates (add) or replaces (edit).
  await service.saveSku(sku);
}`,
          pitfalls: [
            '**Skipping the unique-code check.** Two dishes share a code and order entry breaks. Fix: query by code before saving.',
            '**Failing the uniqueness check against the item being edited.** You block legitimate edits. Fix: allow a match whose id equals the existing id.',
            "**Rejecting `price: 0`.** You cannot create seasonal items. Fix: validate price as `>= 0`, not `> 0`.",
            '**Two separate add/edit forms.** Validation drifts apart. Fix: one dialog with an optional existing Sku.',
            '**Not trimming the name.** Stray spaces create near-duplicate labels. Fix: `name.trim()`.',
            "**Using `_skus.doc()` for an edit.** Creates a duplicate. Fix: reuse `existing.id` so `saveSku` replaces.",
          ],
          tryIt:
            "Open the dialog via the FAB and add a new dish with a code that already exists — confirm it is rejected with a clear message. Add it again with a free code and price 0, and confirm it appears as a Market item. Then edit an existing dish's price and confirm the unique-code check does not block the edit.",
          takeaway:
            'One add/edit dialog with a unique-code query and `saveSku` covers both operations; allow `price: 0` so seasonal items can be created.',
        },
        {
          id: 'm5-t8',
          title: 'Deleting vs Deactivating a SKU',
          explain:
            'Offer delete for genuine mistakes but prefer the active toggle for retiring a dish, so historical bills keep resolving.',
          analogy:
            'When a dish leaves the TunMani Cafe menu, the owner faces a choice: **shred the slip entirely** (delete) or **flip its "not available" tick** (deactivate). Shredding is right only for a slip created by mistake; for a real dish that old bills still reference, he just hides it — because tearing it up would leave last month\'s bills pointing at a missing dish.',
          theory:
            "The admin screen offers two ways to remove a dish, and choosing correctly matters.\n\n**`deleteSku(id)`** permanently removes the document via `_skus.doc(id).delete()`. Use it **only** for a genuine mistake — a typo dish, a wrong duplicate — that no bill has ever referenced. Always guard it behind a confirmation dialog because it is irreversible.\n\n**`toggleSku(id, false)`** (deactivate) is the right tool for **retiring a real dish**. Old orders in the `orders` collection store the dish name and price at sale time, but if any reporting or reorder feature looks the dish up by ID, a deleted SKU resolves to nothing. Deactivating keeps the document alive — so historical lookups still work — while the order screen filters it out (it shows only `active == true` items, next section). The dish vanishes from staff view without erasing history.\n\nThe practical rule: **deactivate to retire, delete only to undo a mistake.** The UI reflects this by making the active toggle the prominent, one-tap action and tucking delete behind a long-press or overflow menu with a confirm step.\n\nThis mirrors the soft-delete pattern from Module 4: the `active` flag is a reversible hide, while `delete` is a destructive purge. Defaulting staff toward deactivation protects the integrity of past bills, which is non-negotiable for a billing app.",
          whyItMatters:
            'Deleting a dish that historical bills reference can break reports and reorder flows that resolve items by ID — a subtle data-integrity bug. Steering the owner toward deactivation keeps every past bill resolvable while still hiding retired dishes from staff. Reserving delete for true mistakes, behind a confirm, prevents irreversible data loss from a mis-tap.',
          steps: [
            'Offer the active toggle as the prominent, reversible retire action.',
            'Tuck delete behind a long-press or overflow menu.',
            'Always confirm before calling `deleteSku`.',
            'Use `deleteSku` only for genuine mistakes no bill references.',
            'Use `toggleSku(id, false)` to retire a real dish.',
            'Rely on the order screen filtering `active == true` to hide retired items.',
            'Document the rule: deactivate to retire, delete to undo a mistake.',
          ],
          code: `// Retire vs purge — two paths, very different consequences.
class SkuActions {
  final FirestoreService service;
  SkuActions(this.service);

  // Preferred: reversible, keeps history intact.
  Future<void> retire(Sku sku) => service.toggleSku(sku.id, false);

  // Destructive: only for genuine mistakes, behind a confirm.
  Future<void> purge(BuildContext context, Sku sku) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Delete "\${sku.name}"?'),
        content: const Text(
            'This permanently removes the item. Old bills are unaffected, '
            'but you cannot undo this. To just hide it, deactivate instead.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Delete')),
        ],
      ),
    );
    if (ok == true) await service.deleteSku(sku.id);
  }
}`,
          pitfalls: [
            '**Deleting a dish to retire it.** Reports/reorder that resolve by ID break. Fix: deactivate with `toggleSku(id, false)`.',
            '**Delete without confirmation.** Irreversible loss from a mis-tap. Fix: always confirm.',
            "**Making delete the prominent action.** Owners delete instead of deactivate. Fix: surface the toggle, hide delete.",
            '**Assuming old bills break when a SKU is deleted.** They keep their stored snapshot, but ID lookups fail. Fix: deactivate to keep lookups working.',
            '**No way to un-retire.** Deactivation must be reversible. Fix: the same toggle flips it back active.',
            '**Bulk-deleting on a seed reset.** Wipes history references. Fix: prefer re-import (overwrite) over delete-all.',
          ],
          tryIt:
            'Retire a dish with the toggle and confirm it disappears from the order screen (active filter) but still exists in Firestore. Then delete a deliberately wrong test dish behind the confirm dialog. Explain in one line why a real, previously-sold dish should be retired, not deleted.',
          takeaway:
            'Deactivate to retire a real dish (reversible, history-safe); delete only to undo a genuine mistake, always behind a confirmation.',
        },
      ],
    },
    {
      id: 'm5-s3',
      title: 'Seasonal Items & Active Flag',
      topics: [
        {
          id: 'm5-t9',
          title: 'price == 0: The Market-Price Convention',
          explain:
            'A SKU with price 0 means seasonal/market-price — the price is unknown until the dish is ordered and staff enter it at billing time.',
          analogy:
            'At TunMani Cafe the fish thali price is **not on the board** — it depends on the morning catch at Gangolli harbour. The board just says "Fish Thali — market price". The cashier writes the actual rupees only when the guest orders, based on that day\'s rate. `price: 0` is exactly that "market price" label: a dish whose number is filled in at billing time, not in advance.',
          theory:
            "Coastal restaurants sell **seasonal, market-priced** items — fresh fish, crab, prawns — whose cost swings with the daily catch. You cannot bake a fixed price into the menu. The app encodes this with a simple, deliberate convention: **`price == 0` means \"market price\"**.\n\nWhy `0` and not `null`? Because `0` is a valid number that flows through every existing field, sort, and read without special null-handling, yet no real dish costs zero rupees — so it is an unambiguous sentinel. The whole app agrees: **a SKU whose `price` is `0` is a market-price item.**\n\nA market-price SKU behaves differently in two places. In the **admin list and order screen** it shows a **\"Market\" chip** instead of a rupee amount. At **billing time**, when staff add it to an order, the app **prompts for the price** and stores that entered amount on the order line — not back on the SKU. The SKU stays at `0` (still seasonal); only the order line carries the actual price the guest paid that day.\n\nThis separation is important: the **SKU price** is the catalog default (`0` = ask), while the **order line price** (covered next) is the actual transacted amount. One seed convention — `price: 0` — drives the entire market-price workflow without any extra schema, flags, or special collections.",
          whyItMatters:
            'Coastal menus genuinely cannot fix seafood prices in advance, so the app must support per-sale pricing — and the `price == 0` sentinel does it with zero schema overhead. Picking `0` over `null` keeps every read and sort simple. This one convention is what lets TunMani Cafe bill a fish thali correctly on a day the rate jumped, which a fixed-price system could never do.',
          steps: [
            'Adopt the rule: `price == 0` on a SKU means market/seasonal price.',
            'Use `0` (not `null`) so existing reads and sorts stay simple.',
            'Seed seasonal seafood items with `price: 0`.',
            'In lists, show a "Market" chip instead of `₹0`.',
            'At order time, prompt staff to enter the actual price.',
            'Store the entered price on the order line, not back on the SKU.',
            'Keep the SKU at `0` so it stays seasonal for the next sale.',
          ],
          code: `// The market-price convention in one helper plus its UI use.
extension SkuPricing on Sku {
  bool get isMarketPrice => price == 0; // the whole convention
}

// In a row or order tile:
Widget priceLabel(Sku sku) {
  if (sku.isMarketPrice) {
    return const Chip(label: Text('Market'));   // ask at billing time
  }
  return Text('₹\${sku.price}');
}

// At order time, a market item asks for the actual price:
Future<num> resolveUnitPrice(BuildContext context, Sku sku) async {
  if (!sku.isMarketPrice) return sku.price;     // fixed price, use as-is
  final entered = await promptForPrice(context, sku.name); // staff types it
  return entered; // stored on the OrderItem, NOT back on the Sku
}`,
          pitfalls: [
            '**Using `null` for seasonal price.** Forces null-handling through every read. Fix: use the `0` sentinel.',
            '**Showing `₹0` to staff.** Looks like a free dish or a bug. Fix: render a "Market" chip.',
            "**Writing the entered price back onto the SKU.** Next sale loses the seasonal behaviour. Fix: store it on the order line only.",
            '**Letting a market item be added without a price prompt.** The bill shows 0. Fix: prompt before adding to the order.',
            '**Treating any low price as seasonal.** Only exactly `0` is the sentinel. Fix: check `price == 0`.',
            '**Allowing a real dish to be priced 0 by mistake.** It silently becomes market-price. Fix: warn when saving a non-seasonal dish at 0.',
          ],
          tryIt:
            "Seed a 'Crab Masala (market)' SKU with price 0. In the admin list, confirm it shows a Market chip, not ₹0. Then sketch the order-time flow: when staff add it, a price prompt appears, and the entered amount goes on the order line while the SKU stays at 0.",
          takeaway:
            '`price == 0` is the app-wide sentinel for market-price items — show a Market chip and ask staff for the real price at billing time, leaving the SKU at 0.',
        },
        {
          id: 'm5-t10',
          title: 'Entering the Price at Finalize: OrderItem.unitPrice',
          explain:
            'When a market-price SKU is billed, staff enter the price into the order line OrderItem.unitPrice, which starts at 0 and must be filled before finalizing.',
          analogy:
            'The TunMani Cafe order slip has a blank in the price column for the fish thali — the waiter leaves it empty when taking the order and the cashier **fills it in at the till** based on today\'s catch rate before printing the bill. `OrderItem.unitPrice == 0` is that blank price column; finalizing is forbidden until every blank is filled.',
          theory:
            "An order is a list of **`OrderItem`** lines, each carrying `code`, `name`, `qty`, and **`unitPrice`**. For a fixed-price dish, `unitPrice` is copied straight from the SKU. For a **market-price** SKU (whose SKU `price` is `0`), the order line is created with **`unitPrice == 0`** — a placeholder meaning \"not yet priced\".\n\nThe rule: **an order cannot be finalized while any line has `unitPrice == 0`.** Before billing, the finalize flow scans the items; if any `unitPrice` is still `0`, it blocks finalize and prompts staff to enter the price for that line. Staff type the day's price, the line's `unitPrice` is updated, and the line total (`qty * unitPrice`) becomes valid.\n\nThis keeps the two prices cleanly separated. The **SKU `price == 0`** marks the *catalog* item as seasonal (permanent). The **`OrderItem.unitPrice == 0`** marks a *specific order line* as awaiting a price (transient, resolved at billing). Filling the order line never touches the SKU, so the dish stays seasonal for the next guest.\n\nThe finalize guard is the safety net: it guarantees no bill prints with a ₹0 seafood line. A simple `items.any((i) => i.unitPrice == 0)` check before saving the order enforces it. Once all lines are priced, the order's `total` is the sum of `qty * unitPrice` and `saveOrder` (Module 4) persists it with a real bill number.",
          whyItMatters:
            'This is where the market-price convention becomes correct money: staff enter the real seafood price per sale, and the finalize guard guarantees no zero-priced line slips into a printed bill. Separating SKU `price` from `OrderItem.unitPrice` keeps the catalog seasonal forever while each sale records what the guest actually paid — exactly what a coastal restaurant needs.',
          steps: [
            'Model each order line as `OrderItem(code, name, qty, unitPrice)`.',
            'For fixed dishes, copy `unitPrice` from the SKU price.',
            'For market dishes (SKU `price == 0`), create the line with `unitPrice == 0`.',
            'Before finalize, scan items for any `unitPrice == 0`.',
            'If found, prompt staff to enter the price and update that line.',
            'Block finalize until no line has `unitPrice == 0`.',
            'Compute `total` as the sum of `qty * unitPrice` and call `saveOrder`.',
          ],
          code: `// OrderItem + the finalize guard for market-price lines.
class OrderItem {
  final int code;
  final String name;
  final int qty;
  final num unitPrice; // 0 => awaiting price (market item, not yet entered)

  const OrderItem({
    required this.code,
    required this.name,
    required this.qty,
    required this.unitPrice,
  });

  num get lineTotal => qty * unitPrice;

  OrderItem withPrice(num price) => OrderItem(
        code: code, name: name, qty: qty, unitPrice: price,
      );
}

// Cannot finalize while any line is unpriced.
bool canFinalize(List<OrderItem> items) =>
    items.isNotEmpty && items.every((i) => i.unitPrice > 0);

// Before saving the order:
void assertPriced(List<OrderItem> items) {
  if (!canFinalize(items)) {
    throw StateError('Enter a price for every market-price item first.');
  }
}`,
          pitfalls: [
            '**Finalizing with a `unitPrice == 0` line.** The bill shows a free seafood dish. Fix: block finalize until all lines are priced.',
            '**Writing the entered price back to the SKU.** Breaks seasonality for the next sale. Fix: update only `OrderItem.unitPrice`.',
            "**Confusing SKU `price == 0` with line `unitPrice == 0`.** They mean different things. Fix: SKU = seasonal catalog flag; line = awaiting price this sale.",
            '**Computing total before prices are entered.** Total is wrong/low. Fix: gate total on `canFinalize`.',
            '**Allowing a zero or negative entered price.** Free or refunded by mistake. Fix: validate the entered price `> 0`.',
            '**Silently skipping unpriced lines.** They vanish from the bill. Fix: prompt explicitly for each.',
          ],
          tryIt:
            "Build an order with a fixed dish and a market 'Fish Thali' line (unitPrice 0). Call `canFinalize` — expect false. Enter a price with `withPrice(280)` on the market line, call `canFinalize` again — expect true. Confirm the SKU's own price stayed 0.",
          takeaway:
            'Market lines start at `OrderItem.unitPrice == 0`; finalize is blocked until staff enter every price, and the entered amount lives on the line, not the SKU.',
        },
        {
          id: 'm5-t11',
          title: 'The Active Flag: Hiding Items Without Losing History',
          explain:
            'The active flag is a soft-delete switch — false hides a dish from staff while keeping its document so old bills and reports still resolve.',
          analogy:
            'When the TunMani Cafe monsoon shuts down the fresh-crab supply, the owner does not erase crab from the system — he flips its **"not available now" tick**. It disappears from what the waiters can order, but last month\'s crab bills still make sense, and when the season returns he flips the tick back. The active flag is that reversible "available now?" switch.',
          theory:
            "Every SKU has a boolean **`active`** flag. It is a **soft-delete / availability switch**: `active == true` means the dish is sellable and visible; `active == false` means it is hidden from staff but its document — and all the history pointing at it — stays intact.\n\nThis solves a real problem. A dish goes off the menu for many reasons: out of season, ingredient shortage, temporarily retired. Deleting it would orphan reports and any ID-based lookups. Toggling `active` to `false` hides it **without destroying data**, and it is fully **reversible** — flip it back to `true` and the dish returns instantly across all devices (the live streams update).\n\nThe admin screen shows **all** SKUs (`allSkus()`) including inactive ones, so the owner can manage and re-enable them; inactive rows are visually muted but present. The **order screen**, by contrast, shows only active SKUs (`activeSkus()`, next topic) so staff never bill a dish that is unavailable.\n\nCombined with the market-price convention, the two flags compose cleanly: a dish can be **active and fixed-price** (normal), **active and market-price** (`price == 0`, available, ask price), or **inactive** (hidden regardless of price). The active flag is orthogonal to price — it controls *visibility*, while price controls *amount*.\n\nDefaulting newly seeded and newly added SKUs to `active: true` means dishes are sellable the moment they exist, and the owner opts dishes *out* with the toggle rather than opting every dish *in*.",
          whyItMatters:
            'The active flag is what lets a restaurant pull a dish for a day or a season without losing its sales history or breaking reports — essential for a coastal menu that changes with supply. Being reversible and live means re-enabling a dish is one tap that propagates everywhere instantly. It is the soft-delete that keeps the billing record whole.',
          steps: [
            'Give every SKU a boolean `active`, defaulting to `true`.',
            'Treat `active == false` as "hidden from staff, history preserved".',
            'Toggle availability with `toggleSku(id, value)` — reversible.',
            'Show all SKUs (including inactive, muted) in the admin screen.',
            'Show only active SKUs in the order screen (next topic).',
            'Keep `active` orthogonal to price (visibility vs amount).',
            'Re-enable a dish by flipping `active` back to `true`.',
          ],
          code: `// The active flag: soft-delete that preserves history.
extension SkuVisibility on Sku {
  bool get isSellable => active;     // staff can order it
  bool get isHidden => !active;      // off the menu, still in the DB
}

// Admin shows ALL skus; inactive ones are muted but present.
Widget adminTile(Sku sku) => Opacity(
      opacity: sku.active ? 1.0 : 0.4, // muted when hidden
      child: SkuRow(sku: sku /* ... */),
    );

// Toggling is reversible and live (streams update everywhere).
Future<void> setAvailability(FirestoreService s, Sku sku, bool on) =>
    s.toggleSku(sku.id, on); // false hides, true restores — never deletes

// History stays intact: an old order referencing this sku still resolves,
// because the document was never removed.`,
          pitfalls: [
            '**Deleting instead of deactivating to pull a dish.** History/lookups break. Fix: toggle `active` to false.',
            '**Hiding inactive items from the admin screen too.** The owner cannot re-enable them. Fix: admin shows all, muted.',
            "**Treating `active` as tied to price.** They are independent. Fix: keep visibility and amount separate.",
            '**Defaulting new SKUs to inactive.** Dishes are invisible until manually enabled. Fix: default `active: true`.',
            '**Forgetting the toggle is reversible.** Owners delete because they think hiding is permanent. Fix: communicate it un-hides.',
            '**Not muting inactive rows visually.** Owner cannot tell what is hidden. Fix: dim inactive rows.',
          ],
          tryIt:
            'Deactivate a dish in the admin screen and confirm it stays visible (muted) there but its document remains in Firestore. Find an old order that references it and confirm the order still resolves the name. Re-activate it and watch it reappear sellable across the app.',
          takeaway:
            'The `active` flag is a reversible, history-safe soft delete: false hides a dish from staff while keeping its document and all referencing bills intact.',
        },
        {
          id: 'm5-t12',
          title: 'Filtering Active SKUs in the Order Screen',
          explain:
            'The order screen binds to activeSkus() so staff only ever see and bill dishes that are active and available.',
          analogy:
            'The waiters at TunMani Cafe work off a **"today\'s available" board** — a filtered version of the full menu that drops anything marked unavailable. They never have to know a dish is off; it simply is not on their board. `activeSkus()` builds that filtered board so staff cannot order what the kitchen cannot make.',
          theory:
            "The order screen — where staff actually build a bill — must show **only sellable dishes**. It binds to **`activeSkus()`** from the FirestoreService, which is `_skus.where('active', isEqualTo: true).orderBy('code').snapshots().map(...)`. The `where('active', isEqualTo: true)` filter is the crucial difference from the admin's `allSkus()`.\n\nFiltering **on the server** (in the query) rather than in Dart matters: the order screen never even downloads inactive dishes, so staff cannot accidentally bill them and the screen stays lean. As an owner toggles dishes active/inactive in the admin screen, the order screen's stream updates live — a dish pulled off the menu disappears from staff view within moments, across every device.\n\nMarket-price items (SKU `price == 0`) that are **active** still appear here — they are sellable, just unpriced until billing. So the order screen shows: active fixed-price dishes (tap to add at their price) and active market-price dishes (tap to add, then prompt for price per the previous topics). Inactive dishes — fixed or seasonal — are simply absent.\n\nThis closes the loop of the whole module: the **seed** loads the menu, the **admin screen** manages it (`allSkus()`), the **active flag** controls visibility, and the **order screen** consumes the filtered `activeSkus()` so the only dishes staff can bill are the ones currently on offer. One boolean and one query clause keep the front-of-house menu always correct.",
          whyItMatters:
            'Filtering to active SKUs at the source guarantees staff can never bill an unavailable dish — a correctness and customer-trust issue in a live restaurant. Doing it as a server-side query keeps the order screen fast and the data minimal. The live stream means menu changes reach every waiter\'s screen in seconds without any manual sync.',
          steps: [
            'Bind the order screen to `activeSkus()`, not `allSkus()`.',
            'Ensure `activeSkus()` filters `where(\'active\', isEqualTo: true)` server-side.',
            'Order results by `code` for the familiar staff layout.',
            'Render active fixed-price dishes as tap-to-add at their price.',
            'Render active market-price dishes as tap-to-add, then prompt for price.',
            'Rely on the live stream so toggles propagate to staff instantly.',
            'Confirm inactive dishes never appear on the order screen.',
          ],
          code: `// Order screen consumes the filtered, active-only stream.
class OrderMenuPanel extends StatelessWidget {
  const OrderMenuPanel({super.key, required this.service, required this.onAdd});
  final FirestoreService service;
  final void Function(Sku) onAdd;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Sku>>(
      stream: service.activeSkus(), // server-side where('active'==true)
      builder: (context, snap) {
        if (!snap.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        final sellable = snap.data!; // inactive dishes are already excluded
        return GridView.builder(
          itemCount: sellable.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
          ),
          itemBuilder: (context, i) {
            final sku = sellable[i];
            return InkWell(
              onTap: () => onAdd(sku), // market items prompt price on add
              child: Card(
                child: Column(children: [
                  Text('\${sku.code}'),
                  Text(sku.name),
                  Text(sku.price == 0 ? 'Market' : '₹\${sku.price}'),
                ]),
              ),
            );
          },
        );
      },
    );
  }
}`,
          pitfalls: [
            '**Binding the order screen to `allSkus()`.** Staff can bill inactive dishes. Fix: use `activeSkus()`.',
            '**Filtering inactive items in Dart after download.** Wasteful and error-prone. Fix: filter in the query with `where`.',
            "**Forgetting market items are still active.** They wrongly vanish from the order screen. Fix: active market items appear, priced at billing.",
            '**Using a one-time read for the order menu.** Toggles do not propagate. Fix: stream it.',
            '**Showing `₹0` for market items here.** Confuses staff at point of sale. Fix: show a Market label.',
            '**Not ordering by code.** Staff lose their muscle-memory layout. Fix: `orderBy(\'code\')`.',
          ],
          tryIt:
            'Bind OrderMenuPanel to `activeSkus()` and run it next to the admin screen. Toggle a dish inactive in admin and watch it disappear from the order panel live. Toggle it back and watch it return. Confirm an active market item still shows (as Market) and prompts for a price when tapped.',
          takeaway:
            'The order screen binds to `activeSkus()` so staff only ever see and bill currently-available dishes; the active flag plus a server-side filter keeps the front-of-house menu correct in real time.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm5-p1',
      type: 'Mini Project',
      title: 'SKU Admin CRUD Screen',
      domain: 'Flutter + Firestore',
      duration: '2 hours',
      description:
        'Build the full SKU admin screen for TunMani Cafe Billing: a live StreamBuilder list ordered by code, an add/edit dialog with unique-code validation, inline active toggles, and confirmed delete — backed by saveSku/toggleSku/deleteSku.',
      tools: ['Flutter 3.x', 'cloud_firestore', 'Dart 3.x'],
      blueprint: {
        overview:
          'Create screens/admin/sku_admin_screen.dart presenting every SKU in a live, code-ordered list with inline availability toggles, an add/edit dialog enforcing unique codes, and a confirmed delete, all writing through the Module 4 FirestoreService.',
        functionalRequirements: [
          '**Live list.** StreamBuilder over allSkus() ordered by code with waiting/error/empty states.',
          '**Row.** Code badge, name, price (or Market chip when price 0), and an inline active Switch.',
          '**Inline toggle.** The Switch calls toggleSku(id, value) and persists immediately.',
          '**Add/Edit dialog.** One dialog for both; fields code, name, price, active; unique-code validation.',
          '**Delete.** Behind a long-press and a confirmation dialog; calls deleteSku.',
          '**Add SKU FAB.** Opens the dialog in add mode.',
        ],
        technicalImplementation: [
          '**StreamBuilder.** Bind service.allSkus(); guard hasError/hasData; ListView.builder for 208 rows.',
          '**SkuRow widget.** Stateless, takes Sku + service; switch bound to sku.active with onChanged => toggleSku.',
          '**Dialog.** Optional existing Sku; pre-fill on edit; reuse id on save via saveSku.',
          '**Uniqueness.** skuByCode(code) query; reject when a different doc owns the code.',
          '**Delete confirm.** showDialog returning bool before deleteSku.',
          '**Price formatting.** One helper: Market chip when price == 0, else rupee text.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Screen + live list',
            outcome: 'SkuAdminScreen shows all SKUs in code order, live.',
            prompt:
              "Create screens/admin/sku_admin_screen.dart with a Scaffold whose body is a StreamBuilder<List<Sku>> over service.allSkus(). Handle hasError (friendly message), no data (spinner), and empty (an 'Import the menu' message). On data, render a ListView.builder. Run it against a seeded Firestore and confirm 208 items load in code order.",
          },
          {
            step: 2,
            label: 'SKU row',
            outcome: 'Each row shows badge/name/price and an active toggle.',
            prompt:
              "Add a SkuRow stateless widget taking a Sku and the FirestoreService. Use a ListTile: leading code badge, title name, subtitle price (a 'Market' chip when price == 0, else a rupee string), trailing Switch bound to sku.active calling service.toggleSku(sku.id, value). Confirm flipping the switch persists and survives a hot restart.",
          },
          {
            step: 3,
            label: 'Add/Edit dialog',
            outcome: 'One dialog adds and edits SKUs.',
            prompt:
              "Build an _openEditDialog(context, [Sku? existing]) showing a form with code (int), name (non-empty), price (>= 0, 0 allowed), and an active switch, pre-filled when editing. On save, build a Sku (reuse existing.id for edits, empty for adds) and call service.saveSku. Wire the FAB to open it in add mode and a row tap to open it in edit mode.",
          },
          {
            step: 4,
            label: 'Unique-code validation',
            outcome: 'Duplicate codes are rejected; edits still allowed.',
            prompt:
              "Add service.skuByCode(int code) running where('code', isEqualTo: code).limit(1).get() returning Sku?. In the dialog save path, reject the save if a SKU with that code exists AND its id differs from the one being edited. Show a clear error. Test: adding a duplicate code fails; editing an existing dish's price succeeds.",
          },
          {
            step: 5,
            label: 'Confirmed delete',
            outcome: 'Delete is reversible-guarded behind a confirm.',
            prompt:
              "Add a long-press on each row that shows an AlertDialog explaining delete is permanent and suggesting deactivation instead. On confirm, call service.deleteSku(sku.id). Verify a deliberately-wrong test dish can be deleted, and that the dialog steers the user toward the active toggle for real dishes.",
          },
          {
            step: 6,
            label: 'Polish',
            outcome: 'Inactive rows muted; price formatting consistent.',
            prompt:
              "Mute inactive rows (e.g. Opacity 0.4) so hidden dishes are visible but clearly off. Extract a single priceLabel(Sku) helper used by both the row and the order screen so a Market chip and rupee formatting stay consistent everywhere. Run flutter analyze and fix any issues.",
          },
        ],
        deliverable:
          'A complete SKU admin screen with a live code-ordered list, inline active toggles, a validated add/edit dialog, and confirmed delete, all persisting through saveSku/toggleSku/deleteSku.',
      },
    },
    {
      id: 'm5-p2',
      type: 'Mini Project',
      title: 'Idempotent Menu Seed Importer',
      domain: 'Flutter + Firestore',
      duration: '2 hours',
      description:
        'Build services/sku_seed.dart with ~208 coastal-Karnataka dishes and a batched, idempotent "Import SKU Menu" admin action that seeds the menu once and is safe to re-run.',
      tools: ['Flutter 3.x', 'cloud_firestore', 'Dart 3.x'],
      blueprint: {
        overview:
          'Create a hard-coded seed list of real coastal dishes and a batched importer using deterministic sku_<code> IDs so the menu loads in a couple of round-trips and re-running never duplicates items.',
        functionalRequirements: [
          '**Seed list.** ~208 entries of { code, name, price } in services/sku_seed.dart, real coastal dishes, unique codes.',
          '**Seasonal items.** Several seafood dishes seeded with price 0 (market price).',
          '**Batched import.** WriteBatch in chunks of 500 writing { code, name, price, active: true }.',
          '**Idempotent.** Deterministic doc id sku_<code> so re-running overwrites, never duplicates.',
          '**Re-import guard.** A check that warns/confirms before overwriting an already-seeded menu.',
          '**Admin action.** An "Import SKU Menu" button reporting the count imported.',
        ],
        technicalImplementation: [
          '**SkuSeed.items.** A const List<Map<String,dynamic>>; a hasDuplicateCodes() dev check.',
          '**importSeed.** Loop in chunks of 500, db.batch(), batch.set(skus.doc("sku_$code"), data), await commit.',
          '**Guard.** skus.limit(1).get(); throw/confirm if non-empty unless force.',
          '**Active default.** Every seeded doc gets active: true.',
          '**Reporting.** Return the count and surface it in a SnackBar.',
          '**Verification.** Doc count stays at the seed length across repeated imports.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Seed data',
            outcome: 'A compiling seed list of real dishes with unique codes.',
            prompt:
              "Create services/sku_seed.dart with a class SkuSeed holding a `static const List<Map<String, dynamic>> items` of at least 40 real coastal-Karnataka dishes (neer dosa, goli baje, mangalore buns, kori rotti, chicken/mutton ghee roast, anjal/pomfret fish thali, gadbad ice cream, patrode, pundi, kane fry, crab masala, prawns ghee roast, etc.) with unique integer codes grouped by category and numeric prices. Mark several seafood items price 0 (seasonal). Add a static hasDuplicateCodes() helper.",
          },
          {
            step: 2,
            label: 'Batched importer',
            outcome: 'importSeed writes all items via WriteBatch.',
            prompt:
              "Add `Future<int> importSeed(FirebaseFirestore db)` that loops SkuSeed.items in chunks of 500, creates a db.batch() per chunk, and for each item does batch.set(db.collection('skus').doc('sku_$code'), { code, name, price, active: true }), then awaits batch.commit() per chunk. Return the total written. Confirm it respects the 500-op limit.",
          },
          {
            step: 3,
            label: 'Idempotency',
            outcome: 'Re-running keeps the count constant.',
            prompt:
              "Confirm the deterministic sku_<code> doc id makes importSeed idempotent: run it twice against a test Firestore and assert the skus document count equals SkuSeed.items.length both times (not double). Explain in a comment why auto-generated ids would have duplicated everything.",
          },
          {
            step: 4,
            label: 'Re-import guard',
            outcome: 'Accidental overwrite of edited prices is prevented.',
            prompt:
              "Add `Future<int> importSeedSafe(FirebaseFirestore db, {bool force = false})` that first runs skus.limit(1).get(); if non-empty and not force, throw a StateError telling the user the menu is already imported and to pass force to overwrite. Otherwise run the batched import. Test that the second call throws and force: true succeeds.",
          },
          {
            step: 5,
            label: 'Admin button',
            outcome: 'An Import SKU Menu action wired into admin.',
            prompt:
              "On the SKU admin screen, add an 'Import SKU Menu' action (overflow menu or button) that calls importSeedSafe. On a non-empty menu, show a confirm dialog before passing force: true. On success, show a SnackBar 'Imported N items'. On the guard error, show the explanatory message. Run it on a fresh database and confirm 208 (or your N) items appear.",
          },
          {
            step: 6,
            label: 'Verify and harden',
            outcome: 'Import is proven safe and correct.',
            prompt:
              "Write a debug check that imports, edits one price in Firestore, force re-imports, and observes the price reset — confirming overwrite semantics. Assert hasDuplicateCodes() is false. Confirm seasonal (price 0) items show a Market chip in the admin list, not ₹0. Run flutter analyze and fix any issues.",
          },
        ],
        deliverable:
          'A services/sku_seed.dart with ~208 real coastal dishes and an idempotent, batched "Import SKU Menu" admin action that seeds once, is safe to re-run, and reports the count.',
      },
    },
  ],
  quiz: [
    {
      id: 'm5-q1',
      q: 'What is the purpose of the SKU seed in services/sku_seed.dart?',
      options: [
        'It runs on every app launch to refresh the menu.',
        'It is a code-shipped master menu imported once (via an admin button) so a fresh app starts with the full menu.',
        'It is a live mirror that syncs Firestore edits back into Dart.',
        'It stores the daily sales totals.',
      ],
      answer: 1,
    },
    {
      id: 'm5-q2',
      q: 'Why does the importer use a deterministic doc id like `sku_<code>` instead of an auto-generated id?',
      options: [
        'Auto-generated ids are slower to write.',
        'So re-running the import overwrites the same document and never creates duplicates (idempotency).',
        'Because Firestore requires integer ids.',
        'To sort the menu alphabetically.',
      ],
      answer: 1,
    },
    {
      id: 'm5-q3',
      q: 'A Firestore WriteBatch can hold at most how many operations before commit() fails?',
      options: ['100', '208', '500', 'Unlimited'],
      answer: 2,
    },
    {
      id: 'm5-q4',
      q: 'On a SKU, what does `price == 0` signify?',
      options: [
        'The dish is free.',
        'The dish is deleted.',
        'The dish is seasonal/market-price — staff enter the actual price at billing time.',
        'The dish is inactive.',
      ],
      answer: 2,
    },
    {
      id: 'm5-q5',
      q: 'For a market-price item, where is the actual price the guest pays stored?',
      options: [
        'Written back onto the SKU document.',
        'On the order line as OrderItem.unitPrice, leaving the SKU at 0.',
        'In the counters/main document.',
        'Nowhere — it is recalculated each time.',
      ],
      answer: 1,
    },
    {
      id: 'm5-q6',
      q: 'Why does the order screen bind to activeSkus() while the admin screen binds to allSkus()?',
      options: [
        'activeSkus() is faster to type.',
        'So staff can only see and bill currently-available dishes, while the owner can still manage and re-enable inactive ones.',
        'allSkus() does not exist.',
        'The order screen needs inactive items to compute totals.',
      ],
      answer: 1,
    },
  ],
};
