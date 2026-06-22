// Module 4 — Firestore Data Layer for the "TunMani Cafe Billing" POS app.
// Teaches services/firestore_service.dart: collection design, streams vs reads,
// transactional counters, and cursor-based server-side pagination.

export const m4 = {
  id: 'm4',
  title: 'Firestore Data Layer',
  hours: 8,
  color: 'from-orange-500/20 to-orange-700/10',
  accent: 'orange',
  description:
    'Design the Firestore collections behind TunMani Cafe Billing and build the one FirestoreService class that every screen talks to — streams for live data, one-time reads for reports, transactions for safe bill numbers, and cursor pagination for big order history.',
  sections: [
    {
      id: 'm4-s1',
      title: 'Firestore Collections',
      topics: [
        {
          id: 'm4-t1',
          title: 'Documents vs Collections — the Firestore Mental Model',
          explain:
            'Firestore stores data as documents (JSON-like maps) grouped into collections (named folders of documents). Get this shape right before writing a single read.',
          analogy:
            'Walk into the back office of **TunMani Cafe restaurant in Kundapura**. There is a steel rack of **labelled folders**: one folder for *menu items*, one for *finished bills*, one for *staff*. Each folder holds many **single-page order slips** — every slip is one item, one bill, one waiter. The folder is a **collection**; each slip inside is a **document**. You never store "the whole menu" on one slip; you store one neer dosa per slip and let the folder hold them all. Firestore is exactly that steel rack.',
          theory:
            "Firestore is a **document database**, not a table database. The two building blocks are **documents** and **collections**.\n\nA **document** is a single record stored as a map of field-name to value — much like a Dart `Map<String, dynamic>`. A document for a menu item might be `{ code: 101, name: 'Neer Dosa', price: 15, active: true }`. Documents are lightweight (max 1 MB) and are the only thing you ever read or write.\n\nA **collection** is a named container that holds documents. Collections do not store data themselves; they only group documents. In our app the top-level collections are `skus`, `orders`, `running_orders`, `users`, `counters`, and `settings`.\n\nEvery document lives at a **path** of alternating collection/document segments: `skus/abc123` means *the document `abc123` inside the `skus` collection*. `counters/main` means *the `main` document inside `counters`*. A path always has an **even** number of segments to point at a document, **odd** to point at a collection.\n\nIn Dart you reach data through references: `FirebaseFirestore.instance.collection('skus')` gives a `CollectionReference`, and `.doc('abc123')` narrows it to a `DocumentReference`. You build the whole service on top of these two reference types.",
          whyItMatters:
            "Firestore charges and indexes per document read, so your collection shape decides how fast and how cheap your app is. A flat, well-named set of top-level collections keeps reads simple and queries possible. Pick the wrong shape early — for example cramming every bill into one giant document — and you hit the 1 MB limit and rewrite the data layer mid-project. TunMani Cafe Billing only works because each bill is its own document.",
          steps: [
            'Open the Firebase console and look at the **Firestore Database** tab — you will see collections as the top row.',
            'Note the six top-level collections this app uses: `skus`, `orders`, `running_orders`, `users`, `counters`, `settings`.',
            'Click into `skus` and observe that each menu item is **one document** with fields `code`, `name`, `price`, `active`.',
            'In Dart, get a reference with `FirebaseFirestore.instance.collection(\'skus\')`.',
            'Narrow to one document with `.doc(\'someId\')` and read it later with `.get()`.',
            'Confirm every document path you write has an **even** number of segments (collection/doc/collection/doc).',
            'Decide for each kind of data: is it many small records (collection of docs) or one fixed config (single doc)? `settings/store` is one fixed doc; `orders` is many docs.',
          ],
          code: `// firestore_service.dart — reference helpers used everywhere in the service.
import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // A CollectionReference points at a *folder* of documents.
  CollectionReference<Map<String, dynamic>> get _skus =>
      _db.collection('skus');

  CollectionReference<Map<String, dynamic>> get _orders =>
      _db.collection('orders');

  // A DocumentReference points at a *single* document.
  DocumentReference<Map<String, dynamic>> get _counters =>
      _db.collection('counters').doc('main');

  DocumentReference<Map<String, dynamic>> get _storeSettings =>
      _db.collection('settings').doc('store');

  // Read one document — returns a snapshot you must unwrap.
  Future<Map<String, dynamic>?> readSku(String id) async {
    final snap = await _skus.doc(id).get();
    return snap.data(); // null if the document does not exist
  }
}`,
          pitfalls: [
            '**Treating a collection like a single record.** A collection holds documents; it has no fields of its own. Fix: put fields inside a document such as `settings/store`.',
            '**Building an odd-length document path.** `skus/abc/price` points at nothing valid. Fix: paths to a document must alternate collection/doc and end on a doc id.',
            '**Cramming all bills into one document.** You hit the 1 MB document limit and lose per-bill queries. Fix: one bill = one document inside `orders`.',
            '**Reading a whole collection just to find one doc.** Wasteful and slow. Fix: use `.doc(id).get()` when you know the id.',
            "**Assuming `.get()` always returns data.** A missing document returns a snapshot whose `.data()` is `null`. Fix: null-check before using it.",
            '**Hard-coding collection names as raw strings everywhere.** Typos like `oders` fail silently. Fix: expose one `get _orders` reference and reuse it.',
          ],
          tryIt:
            "In the Firebase console, manually create a `skus` collection and add one document with fields `code: 101`, `name: 'Neer Dosa'`, `price: 15`, `active: true`. Then in a Dart scratch file, read it back with `FirebaseFirestore.instance.collection('skus').doc('<id>').get()` and print `snap.data()`. Confirm the map matches what you typed.",
          takeaway:
            'Collections are folders, documents are the records inside them — design every feature as "many small documents in a well-named collection".',
        },
        {
          id: 'm4-t2',
          title: 'Designing the SKU and Order Collections',
          explain:
            'Lay out `skus/{docId}` and `orders/{docId}` — the two core collections — with stable doc IDs and a clear field shape.',
          analogy:
            'At TunMani Cafe the **menu board** lists every dish with a number — 101 Neer Dosa, 142 Kori Rotti, 210 Fish Thali. That number is the *code* staff shout to the kitchen, but the slip itself has its own filing tag. Firestore is the same: each menu item gets an auto-generated **doc ID** (the filing tag) while `code` stays a human-facing field. The finished-bill folder (`orders`) works the same way — every printed bill is one slip with its own tag plus a `billNo` everyone reads.',
          theory:
            "The `skus` collection holds one document per menu item. A typical SKU document looks like `{ code: 142, name: 'Kori Rotti', price: 120, active: true }`. The **doc ID** is auto-generated by Firestore (`.add(...)` or `.doc()` with no argument) — it is opaque and never shown to staff. The human-facing identifier is the `code` field, which staff use to find items quickly.\n\nWhy not use `code` as the doc ID? Because codes can change, and a doc ID is permanent. Keeping them separate means you can renumber a dish without breaking any bill that referenced its document.\n\nThe `orders` collection holds one document per finished bill. An order document carries `{ billNo, items: [...], total, createdAt, ... }`. `billNo` is the printed sequential number (from a counter we build later), while the doc ID is again opaque. `createdAt` is a Firestore **`Timestamp`** so you can later query bills by date range.\n\nThe **`active`** flag on a SKU is a soft-delete switch: instead of deleting a dish (which would orphan old bills that reference it), staff flip `active` to `false` and the item simply stops appearing in the order screen. History stays intact.\n\nWhen designing any collection, decide three things: **what is one document** (one menu item, one bill), **what is the doc ID** (auto vs meaningful), and **which fields you will query on** (you will need `code` and `createdAt` to be indexed).",
          whyItMatters:
            'These two collections are the spine of the whole POS. If SKU documents are shaped well, the menu screen, the order screen, and seeding all read the same map. If order documents carry a `Timestamp` and a `billNo`, every report and the pagination feature later just works. Get the field names wrong now and you patch them in six places later.',
          steps: [
            'Decide one SKU document = one menu item with fields `code` (int), `name` (string), `price` (num), `active` (bool).',
            'Let Firestore auto-generate the SKU doc ID; keep `code` as a separate human-facing field.',
            'Decide one order document = one finished bill with `billNo` (int), `items` (list of maps), `total` (num), `createdAt` (Timestamp).',
            'Store `createdAt` with `FieldValue.serverTimestamp()` so the server clock decides the time.',
            'Plan to sort SKUs by `code` and orders by `createdAt` — note both fields for indexing.',
            'Use `active: false` instead of deleting a SKU so old bills still resolve.',
            'Sketch one example document of each on paper before writing any Dart.',
          ],
          code: `// Example documents and the model mapping the service relies on.

// skus/{autoId}
// { "code": 142, "name": "Kori Rotti", "price": 120, "active": true }

// orders/{autoId}
// {
//   "billNo": 5012,
//   "items": [ { "code": 101, "name": "Neer Dosa", "qty": 2, "unitPrice": 15 } ],
//   "total": 30,
//   "createdAt": <serverTimestamp>
// }

class Sku {
  final String id;     // Firestore doc ID (opaque)
  final int code;      // human-facing menu number
  final String name;
  final num price;
  final bool active;

  const Sku({
    required this.id,
    required this.code,
    required this.name,
    required this.price,
    required this.active,
  });

  // Build a Sku from a Firestore snapshot.
  factory Sku.fromMap(String id, Map<String, dynamic> m) => Sku(
        id: id,
        code: (m['code'] as num).toInt(),
        name: m['name'] as String? ?? '',
        price: m['price'] as num? ?? 0,
        active: m['active'] as bool? ?? true,
      );

  Map<String, dynamic> toMap() => {
        'code': code,
        'name': name,
        'price': price,
        'active': active,
      };
}`,
          pitfalls: [
            '**Using `code` as the document ID.** Renumbering a dish then breaks every reference. Fix: auto-generate the doc ID and keep `code` as a field.',
            '**Storing `createdAt` as a client-side `DateTime`.** Phone clocks drift; reports sort wrong. Fix: use `FieldValue.serverTimestamp()`.',
            '**Deleting a SKU that old bills reference.** Old bills lose their item name. Fix: set `active: false` (soft delete).',
            '**Mixing string and int for `code`.** Sorting and matching break. Fix: pick `int` and coerce on read with `(m[\'code\'] as num).toInt()`.',
            '**Forgetting a default in `fromMap`.** A missing field throws on cast. Fix: use `as Type?` with `?? default`.',
            "**Embedding the full menu inside each order.** Bills bloat. Fix: store only the item snapshot you need (code, name, qty, unitPrice).",
          ],
          tryIt:
            "Write the `Order` model class to mirror the example `orders` document: fields `id`, `billNo`, `items` (List of maps), `total`, and `createdAt` (DateTime). Add a `fromMap(String id, Map<String, dynamic> m)` factory that reads `createdAt` via `(m['createdAt'] as Timestamp).toDate()`. Confirm it compiles.",
          takeaway:
            'One menu item and one bill are each a single document with an opaque ID and a clear, query-friendly field shape.',
        },
        {
          id: 'm4-t3',
          title: 'The users, settings, and counters Collections',
          explain:
            'Model the supporting data: `users/{email}` for staff, `settings/store` for one fixed config doc, and `counters/main` for sequence numbers.',
          analogy:
            'Besides the menu and the bills, the TunMani Cafe office keeps three more things: a **staff register** where each waiter has a page filed under their email, a **single laminated house-rules card** pinned to the wall (one card, never duplicated), and a **little tally counter** the cashier clicks to hand out the next bill number. Firestore mirrors these exactly: `users` keyed by email, the single `settings/store` doc, and the `counters/main` doc that only ever holds running numbers.',
          theory:
            "Three smaller collections round out the design.\n\n**`users/{email}`** stores one document per staff member, keyed by their **email as the doc ID**. Using email as the ID means a lookup is `users.doc(email).get()` with no query needed, and it guarantees one account per email. Fields include `name`, `role`, `active`, and an internal numeric `userId`.\n\n**`settings/store`** is a **single fixed document** holding app-wide config: restaurant name, GST number, address, footer text for the printed bill. There is only ever one such document, so it has a known fixed ID (`store`) rather than an auto ID. You read it once at startup and occasionally update it from the admin screen.\n\n**`counters/main`** is also a single fixed document, but it holds **monotonic counters**: `billNo`, `userId`, `walkinNo`. Each is just an integer that only ever goes up. Storing all counters in one document lets a single transaction read and bump exactly one of them safely (covered in Section 3).\n\nThe pattern to notice: **collections of many records use auto IDs** (`skus`, `orders`), **a per-key record uses a meaningful ID** (`users/{email}`), and **a singleton config uses a fixed ID** (`settings/store`, `counters/main`). Choosing the right ID strategy per collection is most of good Firestore design.",
          whyItMatters:
            "Keying users by email removes an entire class of duplicate-account bugs and makes the login whitelist a one-line read. Keeping settings and counters as single known documents means you never query for them — you read them directly, which is the cheapest and fastest Firestore operation. These choices keep auth, printing, and bill numbering simple for the rest of the app.",
          steps: [
            'Create `users` with each document ID set to the staff member\'s lowercased email.',
            'Give each user document fields `name`, `role`, `active`, `userId`.',
            'Create `settings` with one fixed document ID `store` holding restaurant name, GST, address, footer.',
            'Create `counters` with one fixed document ID `main` holding `billNo`, `userId`, `walkinNo` as integers.',
            'Read settings directly with `settings.doc(\'store\').get()` — no query.',
            'Look up a user directly with `users.doc(email).get()` — no query.',
            'Seed initial counter values (e.g. all starting at 0 or a paper-sequence start) when the app is first installed.',
          ],
          code: `// Supporting collections and their references.
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _users =>
      _db.collection('users');

  // Singleton config document.
  DocumentReference<Map<String, dynamic>> get _storeSettings =>
      _db.collection('settings').doc('store');

  // Singleton counters document.
  DocumentReference<Map<String, dynamic>> get _counters =>
      _db.collection('counters').doc('main');

  // users/{email} — email IS the document id.
  Future<void> saveUser({
    required String email,
    required String name,
    required String role,
    required bool active,
    required int userId,
  }) {
    return _users.doc(email.toLowerCase()).set({
      'name': name,
      'role': role,
      'active': active,
      'userId': userId,
    }, SetOptions(merge: true));
  }

  // Read the one settings doc directly — no query needed.
  Future<Map<String, dynamic>?> storeSettings() async {
    final snap = await _storeSettings.get();
    return snap.data();
  }
}

// Example documents:
// users/anita@tunmani.in
//   { "name": "Anita", "role": "waiter", "active": true, "userId": 4 }
// settings/store
//   { "name": "TunMani Cafe", "gstin": "29ABCDE1234F1Z5", "footer": "Thank you!" }
// counters/main
//   { "billNo": 5012, "userId": 7, "walkinNo": 38 }`,
          pitfalls: [
            '**Auto-generating user IDs instead of keying by email.** You then need a query to find a user and can create duplicates. Fix: use the email as the doc ID.',
            '**Storing email IDs with mixed case.** `Anita@...` and `anita@...` become two documents. Fix: lowercase the email before using it as an ID.',
            '**Creating many settings documents.** The app does not know which to read. Fix: one fixed `settings/store` document.',
            '**Spreading counters across separate documents.** A single transaction can only span limited docs cleanly. Fix: keep `billNo`, `userId`, `walkinNo` in one `counters/main` doc.',
            "**Using `set` without `merge` on user updates.** You wipe fields you did not include. Fix: pass `SetOptions(merge: true)` for partial updates.",
            '**Forgetting to seed counters at install.** First bill read finds no counter and may produce billNo 0 or an error. Fix: initialise counters on first run.',
          ],
          tryIt:
            "Add a `saveStoreSettings(Map<String, dynamic> data)` method that writes to `settings/store` with `SetOptions(merge: true)`. Then write a quick test in `main()` that saves `{ 'name': 'TunMani Cafe', 'footer': 'Visit again!' }` and reads it back with `storeSettings()`. Confirm both fields print.",
          takeaway:
            'Per-key data keys by a meaningful ID (email), singleton data uses a fixed ID (store, main) — never query for what you can read directly.',
        },
        {
          id: 'm4-t4',
          title: 'When to Stream and When to Read Once',
          explain:
            'Choose `snapshots()` (a live stream that re-fires on every change) for data that must stay fresh, and `get()` (a one-time read) for snapshots in time like reports.',
          analogy:
            'At TunMani Cafe the **live order board** by the kitchen must update the instant a waiter adds a dish — that is a **stream**: it keeps re-printing itself whenever anything changes. But the **end-of-month sales report** is a photograph: you take it once for June 1–30 and it never needs to refresh while you read it — that is a **one-time read**. Watching the photograph live would waste the cashier\'s time and the restaurant\'s data bill.',
          theory:
            "Firestore gives you two ways to read.\n\n**`snapshots()`** returns a **`Stream`** that emits the current data immediately and then emits again **every time the underlying data changes**. You consume it with a `StreamBuilder` in the UI, so the screen redraws automatically when another device adds a bill or toggles a SKU. Use streams for: the active SKU menu, the running-orders board, the staff list — anything where staleness would mislead the user.\n\n**`get()`** returns a **`Future`** that resolves once with the data as it exists right now, then stops. No live updates, no listener to clean up. Use one-time reads for: date-range order reports, reading `settings/store` at startup, peeking a counter value — anything that is a snapshot in time or that you trigger on demand.\n\nThe cost difference matters. A stream holds an open listener and bills you for each change it delivers; leaving streams open on screens the user left behind quietly drains the Firestore quota. A `get()` reads once and is done. The rule of thumb: **if the user is staring at it and it can change under them, stream it; otherwise read it once.**\n\nBoth paths hand you snapshots, and both go through the same `fromMap` factory to become model objects — so streaming and reading differ only in *how many times* the data arrives, not in how you parse it.",
          whyItMatters:
            'Choosing stream vs read decides both correctness and cost. Stream the order board and waiters always see the truth; read the report once and you avoid a listener that re-bills you every time someone elsewhere edits a bill. Most jank and most surprise Firestore bills in POS apps come from streaming things that should have been read once, or reading things that should have streamed.',
          steps: [
            'List your data needs and mark each as **live** (must auto-update) or **point-in-time** (snapshot).',
            'For live data, expose a method returning `Stream<List<T>>` built from `collection.snapshots()`.',
            'In the UI, consume that stream with a `StreamBuilder`.',
            'For point-in-time data, expose a method returning `Future<...>` built from `.get()`.',
            'Map every snapshot to a model with `fromMap` regardless of stream or read.',
            'Make sure `StreamBuilder` widgets are disposed with the screen so listeners close.',
            'Audit: any stream feeding a screen the user has left should not still be open.',
          ],
          code: `// Streams for live data, Futures for point-in-time reads.
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _skus =>
      _db.collection('skus');

  // LIVE — re-emits on every change. UI uses a StreamBuilder.
  Stream<List<Sku>> activeSkus() {
    return _skus
        .where('active', isEqualTo: true)
        .orderBy('code')
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => Sku.fromMap(d.id, d.data())).toList());
  }

  // POINT-IN-TIME — resolves once. UI uses a FutureBuilder or awaits it.
  Future<Map<String, dynamic>?> storeSettings() async {
    final snap = await _db.collection('settings').doc('store').get();
    return snap.data();
  }
}`,
          pitfalls: [
            '**Streaming a report.** A live listener re-fires while the user reads, wasting reads. Fix: use `.get()` for point-in-time data.',
            '**Reading once where data must stay live.** The order board goes stale. Fix: use `.snapshots()`.',
            '**Leaving streams open after leaving a screen.** Listeners keep billing. Fix: let `StreamBuilder` own the subscription so it closes on dispose.',
            "**Calling `.snapshots()` inside `build()` repeatedly.** Each rebuild can spawn a new listener. Fix: expose the stream from the service and pass the same instance.",
            '**Forgetting `.map(...)` to convert docs to models.** The UI then juggles raw maps. Fix: convert in the service via `fromMap`.',
            '**Awaiting a stream.** A `Stream` is not a `Future`; `await stream` is a mistake. Fix: `await for` or use a `StreamBuilder`.',
          ],
          tryIt:
            'Add `allSkus()` returning `Stream<List<Sku>>` over the whole `skus` collection ordered by `code` (no `active` filter). Then add `allUsers()` returning `Stream<List<...>>`. Decide which screen each belongs to. Confirm both compile and that you used `.snapshots().map(...)` for each.',
          takeaway:
            'Stream it if the user watches it and it can change; read it once if it is a snapshot in time — both parse through the same `fromMap`.',
        },
      ],
    },
    {
      id: 'm4-s2',
      title: 'Reads & Writes',
      topics: [
        {
          id: 'm4-t5',
          title: 'Building Streams with snapshots().map',
          explain:
            'Turn a Firestore query into a typed `Stream<List<T>>` using `.snapshots().map(...)` and a `fromMap` factory.',
          analogy:
            'Imagine a **conveyor belt** from the TunMani Cafe store-room that drops a fresh copy of the menu board onto the counter whenever any dish changes. Raw, each drop is a stack of handwritten slips. You install a quick **sorting station** (`.map`) that turns each stack into neat typed cards before it reaches the cashier. The belt is `snapshots()`; the sorting station is `.map` with `fromMap`.',
          theory:
            "A live query is three chained calls.\n\nFirst, build the **query** off a collection reference: `_skus.where('active', isEqualTo: true).orderBy('code')`. This filters and sorts on the server.\n\nSecond, call **`.snapshots()`** to turn that query into a `Stream<QuerySnapshot>`. Each emission is a `QuerySnapshot` whose `.docs` is a `List<QueryDocumentSnapshot>`. The stream emits once immediately and again on every change matching the query.\n\nThird, call **`.map(...)`** on the stream to transform each `QuerySnapshot` into your own model list: `.map((snap) => snap.docs.map((d) => Sku.fromMap(d.id, d.data())).toList())`. The outer `.map` is on the *stream* (transform each emission); the inner `.map` is on the *list of docs* (transform each document). The result is a clean `Stream<List<Sku>>` the UI can bind to with zero Firestore types leaking out.\n\nThe `fromMap(d.id, d.data())` call is the seam between Firestore and your app: `d.id` is the doc ID, `d.data()` is the field map. Passing both lets your model keep its ID for later updates and deletes.\n\nIn this app the live streams are `activeSkus()` (sorted by `code`), `allSkus()`, `allUsers()`, and `runningOrders()` (the live order feed). Each follows this same three-call shape — only the query and the model differ.",
          whyItMatters:
            'This single pattern powers every live screen in the app. Get it right once and the menu, the staff list, and the running-order board are each a four-line method. The discipline of converting in the service (not the widget) means the UI never touches `QuerySnapshot`, which keeps screens testable and swappable.',
          steps: [
            'Start from a collection reference, e.g. `_skus`.',
            'Add `.where(...)` and `.orderBy(...)` to filter and sort on the server.',
            'Call `.snapshots()` to get a `Stream<QuerySnapshot>`.',
            'Call `.map((snap) => ...)` to transform each emission.',
            'Inside, do `snap.docs.map((d) => Model.fromMap(d.id, d.data())).toList()`.',
            'Declare the return type as `Stream<List<Model>>` so callers stay typed.',
            'Bind it in the UI with a `StreamBuilder<List<Model>>`.',
          ],
          code: `// Four live streams, all built from the same snapshots().map shape.
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  CollectionReference<Map<String, dynamic>> get _skus => _db.collection('skus');
  CollectionReference<Map<String, dynamic>> get _users => _db.collection('users');
  CollectionReference<Map<String, dynamic>> get _running =>
      _db.collection('running_orders');

  Stream<List<Sku>> activeSkus() => _skus
      .where('active', isEqualTo: true)
      .orderBy('code')
      .snapshots()
      .map((s) => s.docs.map((d) => Sku.fromMap(d.id, d.data())).toList());

  Stream<List<Sku>> allSkus() => _skus
      .orderBy('code')
      .snapshots()
      .map((s) => s.docs.map((d) => Sku.fromMap(d.id, d.data())).toList());

  Stream<List<AppUser>> allUsers() => _users
      .orderBy('name')
      .snapshots()
      .map((s) => s.docs.map((d) => AppUser.fromMap(d.id, d.data())).toList());

  Stream<List<RunningOrder>> runningOrders() => _running
      .orderBy('roomNo')
      .snapshots()
      .map((s) =>
          s.docs.map((d) => RunningOrder.fromMap(d.id, d.data())).toList());
}`,
          pitfalls: [
            '**Confusing the two `.map` calls.** The outer maps the stream emission; the inner maps the doc list. Fix: read it as "for each snapshot, for each doc".',
            '**Passing only `d.data()` to `fromMap`.** You lose the doc ID needed for updates. Fix: pass `d.id` too.',
            '**Filtering or sorting in Dart after the fact.** You download the whole collection first. Fix: push `.where`/`.orderBy` to the query.',
            '**Returning `Stream<QuerySnapshot>` from the service.** The UI then knows Firestore types. Fix: map to `Stream<List<Model>>`.',
            '**`orderBy` on a field with mixed types.** The query errors. Fix: keep `code` consistently `int`.',
            '**Forgetting `.toList()` after the inner `.map`.** You hand the UI a lazy iterable. Fix: append `.toList()`.',
          ],
          tryIt:
            "Write `inactiveSkus()` returning `Stream<List<Sku>>` filtered to `where('active', isEqualTo: false)` and ordered by `code`. Then bind `activeSkus()` to a `StreamBuilder` in a throwaway screen and confirm toggling a SKU's `active` flag in the console makes the list update live.",
          takeaway:
            'Every live list is `query.snapshots().map((s) => s.docs.map((d) => Model.fromMap(d.id, d.data())).toList())`.',
        },
        {
          id: 'm4-t6',
          title: 'One-Time Reads: ordersInRange and storeSettings',
          explain:
            'Build `Future`-returning methods with `.get()` for data you fetch on demand — date-range order reports and the store config.',
          analogy:
            'When the TunMani Cafe owner wants the **sales for last Sunday**, the cashier pulls every bill slip filed between two dates, totals them once, and hands over the sheet. He does not stand at the file cabinet watching for new slips — he takes the snapshot and walks away. That on-demand pull is a one-time `.get()` read.',
          theory:
            "Some data is fetched on demand, not watched. For these you return a `Future` and call **`.get()`**.\n\n**`ordersInRange(from, to)`** is the classic report read. You build a query on `orders` with two `where` clauses bracketing `createdAt` between two `Timestamp`s, order by `createdAt`, and call `.get()`:\n`_orders.where('createdAt', isGreaterThanOrEqualTo: Timestamp.fromDate(from)).where('createdAt', isLessThan: Timestamp.fromDate(to)).orderBy('createdAt').get()`.\nThe result is a `QuerySnapshot` you map to `List<Order>` exactly like a stream — except it resolves once.\n\nThe date boundaries are **`Timestamp`** values, not `DateTime`. Firestore stores times as `Timestamp`, so you convert with `Timestamp.fromDate(from)` on the way in and `(...as Timestamp).toDate()` on the way out. Use a half-open range — `>= from` and `< to` — so a day boundary belongs to exactly one bucket and you never double-count midnight bills.\n\n**`storeSettings()`** is even simpler: a single `.doc('store').get()` returning the config map. There is no query, just a direct document read.\n\nThe shape mirrors streams: build query, get snapshot, map through `fromMap`. The only difference is `Future` + `.get()` instead of `Stream` + `.snapshots()`.",
          whyItMatters:
            'Reports and config reads are where streams would silently waste money and confuse users with mid-read updates. Returning `Future`s here keeps the data layer honest about intent — this is a snapshot, fetched once — and gives the UI a clean `FutureBuilder` or `await` to work with. The half-open date range is what makes daily totals add up correctly.',
          steps: [
            'Decide the read is point-in-time, so the method returns a `Future`.',
            'Convert `from`/`to` `DateTime`s to `Timestamp` with `Timestamp.fromDate(...)`.',
            'Build the query: two `where` clauses on `createdAt` (>= from, < to) plus `orderBy(\'createdAt\')`.',
            'Call `.get()` and `await` the `QuerySnapshot`.',
            'Map `snap.docs` to `List<Order>` via `Order.fromMap(d.id, d.data())`.',
            'For settings, just `.doc(\'store\').get()` and return `.data()`.',
            'Use a half-open range (`>=` and `<`) to avoid double-counting boundary times.',
          ],
          code: `// One-time reads return Futures and use .get().
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  CollectionReference<Map<String, dynamic>> get _orders =>
      _db.collection('orders');

  // Date-range report — resolves once.
  Future<List<Order>> ordersInRange(DateTime from, DateTime to) async {
    final snap = await _orders
        .where('createdAt', isGreaterThanOrEqualTo: Timestamp.fromDate(from))
        .where('createdAt', isLessThan: Timestamp.fromDate(to))
        .orderBy('createdAt')
        .get();
    return snap.docs.map((d) => Order.fromMap(d.id, d.data())).toList();
  }

  // Single config document — direct read, no query.
  Future<Map<String, dynamic>?> storeSettings() async {
    final snap = await _db.collection('settings').doc('store').get();
    return snap.data();
  }
}`,
          pitfalls: [
            '**Comparing `createdAt` against a `DateTime` instead of a `Timestamp`.** The query returns nothing. Fix: wrap with `Timestamp.fromDate(...)`.',
            '**Using `<=` on the upper bound.** Midnight bills get counted in two days. Fix: use a half-open range `>= from` and `< to`.',
            '**Streaming a report.** Wastes reads and refreshes mid-view. Fix: `.get()` returns a `Future`.',
            '**`orderBy` on a different field than the range filter without an index.** Firestore errors. Fix: order by `createdAt`, the same field you range on.',
            "**Forgetting to await `.get()`.** You map over an unresolved `Future`. Fix: `await` before `.docs`.",
            '**Returning raw maps from a report read.** The UI then parses dates itself. Fix: map to typed `Order` objects.',
          ],
          tryIt:
            'Add a `todaysOrders()` convenience method that computes `from = DateTime(now.year, now.month, now.day)` and `to = from.add(Duration(days: 1))`, then calls `ordersInRange(from, to)`. Print the count and the summed `total`. Confirm a bill created today appears and one from yesterday does not.',
          takeaway:
            'Point-in-time reads return `Future`s via `.get()`; bracket dates with `Timestamp` and a half-open `>= from, < to` range.',
        },
        {
          id: 'm4-t7',
          title: 'Writes: saveSku, toggleSku, deleteSku',
          explain:
            'Implement the SKU write methods — `set` to create or replace, a merge-update to toggle a single field, and `delete` to remove.',
          analogy:
            'Three pens at the TunMani Cafe counter: a **full pen** to write a brand-new menu slip (`set`), a **tiny correction pen** to flip just the "available today?" tick without rewriting the slip (a merge update for `toggleSku`), and a **shredder** for slips you truly want gone (`delete`). Most days you reach for the correction pen — flipping availability — far more than the shredder.',
          theory:
            "Firestore writes come in three shapes.\n\n**`set(data)`** writes a whole document, creating it if absent or replacing it if present. `saveSku(sku)` uses `_skus.doc(id).set(sku.toMap())` to create a new menu item or fully update an existing one. For a brand-new SKU you call `_skus.doc()` (no arg) to mint a fresh ID, then `set`.\n\n**A merge update** changes only the fields you name. `toggleSku(id, active)` flips the `active` flag without touching `name`, `price`, or `code`: `_skus.doc(id).update({'active': active})`. `update` requires the document to already exist; `set(..., SetOptions(merge: true))` does the same partial write but also creates the doc if missing. For toggling, `update` is the right choice because the SKU must already exist.\n\n**`delete()`** removes the document entirely: `_skus.doc(id).delete()`. Use it only when you truly want the record gone — for menu items you usually prefer `toggleSku(id, false)` so old bills still resolve, and reserve `delete` for mistakes.\n\nAll three return `Future<void>`; you `await` them and surface errors to the UI. Notice the asymmetry: **create/replace** rewrites everything, **toggle** touches one field, **delete** removes the whole document. Matching the write to the intent keeps data clean and avoids accidentally clobbering fields.",
          whyItMatters:
            'These three methods are the entire write surface of the SKU admin screen. Knowing when to `set` (full), `update` (partial), and `delete` (gone) prevents the classic bug where toggling availability accidentally wipes the price because someone used `set` with a partial map. The toggle-vs-delete choice also protects your bill history.',
          steps: [
            'For a new SKU, mint an ID with `_skus.doc()` then `set(sku.toMap())`.',
            'For a full edit of an existing SKU, `set` the whole map again at its known ID.',
            'To flip availability, call `update({\'active\': value})` — one field only.',
            'To remove a SKU permanently, call `delete()`.',
            'Prefer `toggleSku(id, false)` over `delete` to keep history intact.',
            'Return `Future<void>` from each and `await` at the call site.',
            'Wrap calls in try/catch in the UI to show write errors.',
          ],
          code: `// SKU writes: create/replace, partial toggle, delete.
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  CollectionReference<Map<String, dynamic>> get _skus => _db.collection('skus');

  // Create a new SKU (auto id) or replace an existing one (known id).
  Future<void> saveSku(Sku sku) {
    final ref = sku.id.isEmpty ? _skus.doc() : _skus.doc(sku.id);
    return ref.set(sku.toMap()); // full write
  }

  // Flip ONLY the active flag — leaves name/price/code untouched.
  Future<void> toggleSku(String id, bool active) {
    return _skus.doc(id).update({'active': active}); // partial write
  }

  // Permanently remove. Prefer toggleSku(id, false) to keep bill history.
  Future<void> deleteSku(String id) {
    return _skus.doc(id).delete();
  }
}`,
          pitfalls: [
            '**Using `set` with a partial map to toggle.** Missing fields get wiped. Fix: use `update({field: value})` for partial writes.',
            '**Using `update` on a document that may not exist.** It throws `not-found`. Fix: use `set(..., SetOptions(merge: true))` when the doc might be new.',
            "**Deleting a SKU referenced by old bills.** History loses the item name. Fix: `toggleSku(id, false)` instead.",
            '**Forgetting to `await` the write.** Errors go unnoticed and the UI thinks it succeeded. Fix: `await` and try/catch.',
            '**Reusing a stale doc ID after delete.** Writing to a deleted ID recreates it unexpectedly. Fix: clear local references after delete.',
            '**Calling `_skus.doc()` for an edit.** It mints a new ID and creates a duplicate. Fix: pass the existing id for edits.',
          ],
          tryIt:
            "Add a `bumpPrice(String id, num newPrice)` method using a partial `update({'price': newPrice})`. Save a SKU, toggle it inactive, bump its price, then read it back and confirm `code`, `name`, and `active` survived while only `price` changed.",
          takeaway:
            '`set` for full create/replace, `update` for one-field changes, `delete` only when truly gone — and prefer toggling SKUs to deleting them.',
        },
        {
          id: 'm4-t8',
          title: 'User Writes and the Running-Orders Feed',
          explain:
            'Round out writes: `saveUser`, `toggleUserActive`, `deleteUser`, plus running-order writes `addRunningOrder`, `updateRunningItems`, `deleteRunningOrder`.',
          analogy:
            'At TunMani Cafe a **running order** is the open tab for table 5 — staff keep adding neer dosa and kori rotti to it through the meal, and when the guest pays it moves to the finished-bills folder and the open tab is torn up. The staff register works the same way: add a waiter, mark one inactive when they go on leave, or remove a wrong entry. Adding items to the tab, editing it, and clearing it on payment are the three running-order writes.',
          theory:
            "User writes mirror the SKU pattern. **`saveUser`** does a merge `set` keyed by email so partial profile updates do not wipe fields. **`toggleUserActive(email, active)`** is a one-field `update` that disables login without losing the record. **`deleteUser(email)`** removes the document for a truly wrong entry. As with SKUs, prefer toggling inactive over deleting so audit history survives.\n\n**Running orders** model open tabs in `running_orders`. **`addRunningOrder(order)`** creates a new tab document with `_running.doc().set(...)`, capturing the table/room and an initial item list. **`updateRunningItems(id, items)`** does a partial `update({'items': items, 'updatedAt': FieldValue.serverTimestamp()})` as staff add or remove dishes during the meal — only the items change, not the table number or who opened it. **`deleteRunningOrder(id)`** clears the tab once the bill is finalised and the order has been moved into the permanent `orders` collection.\n\nThe key idea across all of these: **create with `set`, edit one slice with a partial `update`, remove with `delete`**. Running orders churn the most — items get edited constantly — so `updateRunningItems` is the hot path and must touch only the `items` array, leaving the rest of the tab stable. The finalise flow reads the running order, writes a permanent order (next topic shows the bill-number transaction), then deletes the running order.",
          whyItMatters:
            'The running-orders feed is what makes the POS feel live: every device sees open tabs update as items are added. If `updateRunningItems` accidentally rewrote the whole document, you would race other staff edits and lose the table number. Scoping each write to its true intent keeps concurrent table service correct — which is the whole point of a multi-waiter billing app.',
          steps: [
            'Implement `saveUser` as a merge `set` keyed by lowercased email.',
            'Implement `toggleUserActive` as a one-field `update({\'active\': value})`.',
            'Implement `deleteUser` as a `delete()`; prefer toggling for real staff.',
            'Implement `addRunningOrder` as `_running.doc().set(order.toMap())`.',
            'Implement `updateRunningItems` as a partial `update` of just `items` (+ `updatedAt`).',
            'Implement `deleteRunningOrder` as `delete()` after the bill is finalised.',
            'Stream the running orders with `runningOrders()` so every device stays in sync.',
          ],
          code: `// User and running-order writes — same set / update / delete vocabulary.
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  CollectionReference<Map<String, dynamic>> get _users => _db.collection('users');
  CollectionReference<Map<String, dynamic>> get _running =>
      _db.collection('running_orders');

  Future<void> saveUser(AppUser u) =>
      _users.doc(u.email.toLowerCase()).set(u.toMap(), SetOptions(merge: true));

  Future<void> toggleUserActive(String email, bool active) =>
      _users.doc(email.toLowerCase()).update({'active': active});

  Future<void> deleteUser(String email) =>
      _users.doc(email.toLowerCase()).delete();

  // Open a new tab for a table/room.
  Future<void> addRunningOrder(RunningOrder o) =>
      _running.doc().set(o.toMap());

  // Hot path: staff add/remove dishes during the meal — items only.
  Future<void> updateRunningItems(String id, List<Map<String, dynamic>> items) =>
      _running.doc(id).update({
        'items': items,
        'updatedAt': FieldValue.serverTimestamp(),
      });

  // Clear the tab once the bill is finalised into 'orders'.
  Future<void> deleteRunningOrder(String id) => _running.doc(id).delete();
}`,
          pitfalls: [
            '**Rewriting the whole running order on each item change.** You race other edits and can lose the table number. Fix: partial `update({\'items\': ...})`.',
            '**Deleting staff instead of deactivating.** Audit trail breaks. Fix: `toggleUserActive(email, false)`.',
            "**Forgetting `updatedAt` on item updates.** You cannot sort tabs by recency. Fix: include `FieldValue.serverTimestamp()`.",
            '**Saving a user with `set` (no merge).** Partial profile edits wipe other fields. Fix: `SetOptions(merge: true)`.',
            '**Not deleting the running order after finalise.** The open tab lingers forever. Fix: `deleteRunningOrder(id)` once the permanent order is written.',
            '**Storing `items` as nested documents.** Over-complicates a small list. Fix: store `items` as an array of maps in the tab doc.',
          ],
          tryIt:
            "Simulate a table's life: `addRunningOrder` with one neer dosa, then `updateRunningItems` to add a kori rotti, then `deleteRunningOrder`. Watch the `running_orders` collection in the console gain, change, and lose the document. Confirm the table number never changed during the item update.",
          takeaway:
            'Open tabs and staff records use the same create/partial-update/delete vocabulary — keep the hot `updateRunningItems` write scoped to just the items array.',
        },
        {
          id: 'm4-t9',
          title: 'Finalising a Bill: saveOrder and updateOrderEdits',
          explain:
            'Write a finished bill with `saveOrder` (returning the new doc ID) and amend a saved bill with `updateOrderEdits`.',
          analogy:
            'When the TunMani Cafe guest pays, the cashier files the slip into the **finished-bills folder** and writes the new filing tag on a receipt stub so it can be found again — that returned tag is the doc ID from `saveOrder`. If later the owner spots a wrong discount on a filed bill, the cashier pulls that exact slip and pencils a correction, noting the edit — that is `updateOrderEdits`.',
          theory:
            "**`saveOrder(order)`** writes a completed bill into the `orders` collection and **returns the new document ID** so the caller can navigate to, print, or reference it. The shape is:\n`final ref = _orders.doc(); await ref.set(order.toMap()); return ref.id;`\nMinting the reference first with `_orders.doc()` gives you the ID up front, even before the write resolves — handy for linking the printed receipt to the stored bill. The order map carries `billNo`, `items`, `total`, and `createdAt: FieldValue.serverTimestamp()`.\n\n**`updateOrderEdits(id, edits)`** amends an already-saved bill. Real restaurants sometimes correct a finalised bill — a wrong item, a missed discount. Rather than rewrite the document, you apply a **partial `update`** of just the changed fields plus an audit trail: `_orders.doc(id).update({...edits, 'editedAt': FieldValue.serverTimestamp(), 'edited': true})`. Marking `edited: true` lets reports flag amended bills.\n\nThe pairing matters: `saveOrder` is a one-shot create that hands back an ID; `updateOrderEdits` is a targeted correction that preserves the original `createdAt` and `billNo`. Never re-`set` a finalised order — that would risk changing its bill number or timestamp. The bill number itself comes from a transaction (next section) so two cashiers never grab the same number.",
          whyItMatters:
            'Returning the doc ID from `saveOrder` is what lets the app print, share, and reopen the exact bill it just saved — without it you would have to query for the bill you just created. Scoping `updateOrderEdits` to a partial update with an audit flag keeps amendments honest and traceable, which matters for tax and disputes.',
          steps: [
            'Mint the order reference first: `final ref = _orders.doc();`.',
            'Call `await ref.set(order.toMap())` with `createdAt` as a server timestamp.',
            'Return `ref.id` so callers can print or navigate.',
            'For an amendment, build an `edits` map of only the changed fields.',
            'Apply `_orders.doc(id).update({...edits, \'editedAt\': serverTimestamp, \'edited\': true})`.',
            'Never re-`set` a finalised order; only partial-update it.',
            'Use the returned ID to link the printed receipt to the stored bill.',
          ],
          code: `// Finalise a bill, get its id back; amend later with an audit trail.
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  CollectionReference<Map<String, dynamic>> get _orders =>
      _db.collection('orders');

  // Write a finished bill and return the new document id.
  Future<String> saveOrder(Order order) async {
    final ref = _orders.doc(); // mint id up front
    await ref.set({
      ...order.toMap(),
      'createdAt': FieldValue.serverTimestamp(),
    });
    return ref.id; // caller uses this to print / navigate
  }

  // Amend an already-saved bill with a partial update + audit flag.
  Future<void> updateOrderEdits(String id, Map<String, dynamic> edits) {
    return _orders.doc(id).update({
      ...edits,
      'edited': true,
      'editedAt': FieldValue.serverTimestamp(),
    });
  }
}`,
          pitfalls: [
            '**Querying for the bill you just saved.** Wasteful and racy. Fix: return `ref.id` from `saveOrder`.',
            '**Re-`set`ting a finalised order to amend it.** Risks changing `billNo`/`createdAt`. Fix: partial `update` only.',
            "**Amending without an audit flag.** Reports cannot tell edited bills apart. Fix: set `edited: true` and `editedAt`.",
            '**Setting `createdAt` from the phone clock.** Drifts across devices. Fix: `FieldValue.serverTimestamp()`.',
            '**Generating the bill number inside `saveOrder` with a plain read+write.** Two cashiers can collide. Fix: use a counter transaction (next section).',
            '**Ignoring the returned ID.** You then cannot reopen the printed bill. Fix: store and use `ref.id`.',
          ],
          tryIt:
            "Call `saveOrder` with a small two-item bill and print the returned ID. Then call `updateOrderEdits(id, {'total': 0, 'voided': true})` to void it, and read the doc back. Confirm `createdAt` is unchanged, `edited` is `true`, and an `editedAt` timestamp appeared.",
          takeaway:
            '`saveOrder` creates the bill and hands back its ID; `updateOrderEdits` amends it with a partial, audit-flagged update — never re-`set` a finalised order.',
        },
      ],
    },
    {
      id: 'm4-s3',
      title: 'Transactions & Counters',
      topics: [
        {
          id: 'm4-t10',
          title: 'Why Bill Numbers Need a Transaction',
          explain:
            'Understand the race condition: two cashiers finalising at once can read the same counter and print duplicate bill numbers unless the increment is atomic.',
          analogy:
            'Picture two TunMani Cafe cashiers at the dinner rush both reaching for the **single tally counter** to grab the next bill number. If both glance at it, both see "5012", both write 5012 on their receipts, then both click it to 5013 — now two different guests hold bill 5012 and the GST records are corrupt. The fix is a rule: **only one hand may touch the counter at a time, and that hand must read-and-click in one motion.** That single indivisible motion is a transaction.',
          theory:
            "A bill number must be **unique and sequential** — duplicates break printing, refunds, and tax filings. The naive approach is *read the counter, add one, write it back*. Under concurrency this is a classic **race condition**: between your read and your write, another cashier reads the same value, and you both produce the same number.\n\nA **Firestore transaction** solves this by making the read-modify-write **atomic**. `_db.runTransaction((tx) async { ... })` reads the counter, computes the next value, and writes it — and Firestore guarantees that if any document the transaction read changed before it committed, the **whole transaction retries** automatically with fresh data. So even if two cashiers fire at the same millisecond, the transactions serialise: one wins, the other re-reads the now-incremented value and gets the next number.\n\nThe rule inside a transaction is strict: **all reads must happen before any write**, and you must use the transaction's own `tx.get(ref)` / `tx.set(ref, ...)` — never the plain `ref.get()`/`ref.set()`. The transaction function may run more than once (on retry), so it must be **idempotent** and side-effect-free except for its Firestore writes; do not, for example, send a notification inside it.\n\nThis is exactly why all the counters live in one `counters/main` document: a transaction reads that one doc, bumps the right field, and writes it back atomically. The next topic implements `nextBillNo()` on this foundation.",
          whyItMatters:
            "Duplicate bill numbers are not a cosmetic bug — they corrupt the legal and financial record of the restaurant. A busy TunMani Cafe dinner service has multiple waiters finalising within the same second, which is precisely when the race fires. Transactions are the only correct fix; a plain read-then-write will pass every single-user test and then fail in production on the first busy night.",
          steps: [
            'Recognise that read-then-write on a shared counter is a race under concurrency.',
            'Use `_db.runTransaction((tx) async { ... })` to make it atomic.',
            'Inside, read with `tx.get(counterRef)` — not `ref.get()`.',
            'Compute `next = current + 1` from the transaction read.',
            'Write back with `tx.set(counterRef, {field: next}, merge)` or `tx.update`.',
            'Do all reads before any writes inside the transaction.',
            'Keep the transaction body idempotent — no notifications or external side effects.',
          ],
          code: `// The shape of an atomic counter bump. Detail in the next topic.
Future<int> _bump(String field) async {
  final ref = FirebaseFirestore.instance.collection('counters').doc('main');

  return FirebaseFirestore.instance.runTransaction<int>((tx) async {
    // READ first — using the transaction's get, not ref.get().
    final snap = await tx.get(ref);
    final current = (snap.data()?[field] as num?)?.toInt() ?? 0;

    final next = current + 1;

    // WRITE after all reads. Firestore retries if 'ref' changed meanwhile.
    tx.set(ref, {field: next}, SetOptions(merge: true));

    return next; // safe: each caller gets a distinct number
  });
}`,
          pitfalls: [
            '**Read-modify-write without a transaction.** Two cashiers collide on the same number. Fix: wrap in `runTransaction`.',
            "**Using `ref.get()` inside a transaction.** It is not tracked for retries. Fix: use `tx.get(ref)`.",
            '**Writing before all reads in a transaction.** Firestore rejects it. Fix: read everything first, then write.',
            '**Side effects inside the transaction body.** Retries fire them twice. Fix: only do Firestore reads/writes; notify after commit.',
            '**Spreading counters across many docs.** Harder to keep atomic. Fix: one `counters/main` doc for all sequences.',
            '**Assuming the body runs once.** It can retry. Fix: make it pure and idempotent.',
          ],
          tryIt:
            'Write a small script that fires `_bump(\'billNo\')` 20 times concurrently with `Future.wait`. Collect the returned numbers into a `Set` and confirm the set has exactly 20 distinct values — no duplicates. Then try the naive read-then-write version and watch duplicates appear.',
          takeaway:
            'A shared counter must be read-and-incremented atomically in a transaction, or concurrent cashiers will print duplicate bill numbers.',
        },
        {
          id: 'm4-t11',
          title: 'nextBillNo, peekNextBillNo and setNextBillNo',
          explain:
            'Implement the bill-number trio: consume the next number atomically, peek it read-only, and let an admin set the starting number to continue a paper sequence.',
          analogy:
            "Three things the TunMani Cafe owner does with the bill tally counter: **click it to hand the next guest their number** (consume — `nextBillNo`), **glance at it to see what's coming without clicking** (peek — `peekNextBillNo`), and on opening day, **dial it to 5000 to continue from where the old paper bill book left off** (set — `setNextBillNo`). Only the click changes the counter; the glance and the dial-to-start are special cases.",
          theory:
            "**`nextBillNo()`** is the consume operation: it runs the transaction from the previous topic, bumps `billNo` by one, and returns the new value. Every finalised bill calls it exactly once. Because it is transactional, concurrent calls return distinct, gap-free numbers.\n\n**`peekNextBillNo()`** is **read-only**: it returns *what the next bill number would be* without consuming it, so the UI can preview the upcoming number on the order screen. It is a plain `.get()` plus one — no transaction, no write. The previewed number is advisory; the real number is only fixed when `nextBillNo()` actually commits, so never print a peeked number on a final bill.\n\n**`setNextBillNo(value)`** is an **admin** operation: it writes the counter to a chosen starting point. Restaurants migrating from a paper bill book need digital bill 1 to continue from, say, 5000 so the sequence is unbroken for tax. This is a deliberate `set` of `billNo` to `value - 1` (so the next consume returns `value`) or directly to the desired last-used number — guarded behind an admin screen because mis-setting it corrupts the sequence.\n\nThe three form a clean contract: **consume** changes and returns, **peek** reads without changing, **set** overrides for migration. Only `nextBillNo` is used in the hot finalise path; `peek` feeds the UI preview; `set` is a once-per-deployment admin action.",
          whyItMatters:
            'These three cover every real bill-number need: safe sequential allocation under load, a live preview for staff, and a migration hook so the restaurant does not restart numbering at 1 and confuse its accountant. Splitting consume from peek prevents the common bug of accidentally burning a bill number just to show it on screen.',
          steps: [
            'Implement `nextBillNo()` as the transactional bump returning the new `billNo`.',
            'Call `nextBillNo()` exactly once per finalised bill, in the finalise flow.',
            'Implement `peekNextBillNo()` as a plain `.get()` returning `current + 1`, no write.',
            'Use the peeked number only for on-screen preview, never on a printed bill.',
            'Implement `setNextBillNo(value)` to write the counter so the next consume yields `value`.',
            'Guard `setNextBillNo` behind the admin screen.',
            'Document that mis-setting the counter corrupts the legal sequence.',
          ],
          code: `// The bill-number trio.
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  DocumentReference<Map<String, dynamic>> get _counters =>
      _db.collection('counters').doc('main');

  // CONSUME — atomic; each call returns a distinct, gap-free number.
  Future<int> nextBillNo() {
    return _db.runTransaction<int>((tx) async {
      final snap = await tx.get(_counters);
      final next = ((snap.data()?['billNo'] as num?)?.toInt() ?? 0) + 1;
      tx.set(_counters, {'billNo': next}, SetOptions(merge: true));
      return next;
    });
  }

  // PEEK — read-only preview; does NOT consume a number.
  Future<int> peekNextBillNo() async {
    final snap = await _counters.get();
    return ((snap.data()?['billNo'] as num?)?.toInt() ?? 0) + 1;
  }

  // SET — admin migrates the sequence so next consume returns 'value'.
  Future<void> setNextBillNo(int value) {
    return _counters.set({'billNo': value - 1}, SetOptions(merge: true));
  }
}`,
          pitfalls: [
            '**Calling `nextBillNo()` just to show a preview.** You burn a number every time the screen opens. Fix: use `peekNextBillNo()` for previews.',
            '**Printing a peeked number on a final bill.** It may differ from the consumed value. Fix: print only what `nextBillNo()` returns.',
            "**Exposing `setNextBillNo` outside admin.** Anyone can corrupt the sequence. Fix: guard it behind the admin screen.",
            '**Setting the counter to `value` instead of `value - 1`.** The first consume then skips a number. Fix: store `value - 1` so the next consume yields `value`.',
            '**Calling `nextBillNo()` twice for one bill on retry.** Wastes a number. Fix: call it exactly once and store the result.',
            '**Peeking with a transaction.** Unnecessary overhead. Fix: a plain `.get()` is enough for read-only.',
          ],
          tryIt:
            'Set the sequence to start at 5000 with `setNextBillNo(5000)`. Call `peekNextBillNo()` (should read 5000 without consuming), then `nextBillNo()` (should return 5000), then `peekNextBillNo()` again (should now read 5001). Confirm peek never changed the stored value.',
          takeaway:
            'Consume with `nextBillNo` (atomic, once per bill), preview with `peekNextBillNo` (read-only), and migrate the sequence with admin-only `setNextBillNo`.',
        },
        {
          id: 'm4-t12',
          title: 'More Counters: nextUserId and nextWalkinNo',
          explain:
            'Reuse the transactional bump for the other monotonic sequences — internal `userId` and the per-session `walkinNo` for walk-in guests.',
          analogy:
            'Beyond bill numbers, TunMani Cafe hands out two more running numbers: an **internal staff number** when a new waiter joins (so reports can group by waiter without using their email), and a **walk-in token** for guests with no table — like the paper token at a busy darshini counter. Both come off the same kind of tally counter, just different fields in the same `counters/main` document.',
          theory:
            "The transactional bump generalises. Rather than copy the transaction three times, factor it into one private `_nextCounter(field)` helper and call it for each sequence.\n\n**`nextUserId()`** allocates a stable internal integer for each new staff member. The email is the natural key (`users/{email}`), but reports and shift logs are cleaner keyed on a short `userId`. Calling `nextUserId()` when creating a user gives a gap-free staff number.\n\n**`nextWalkinNo()`** allocates a token for **walk-in** customers who have no fixed table — the equivalent of the numbered slip you take at a tiffin counter. Each new walk-in order calls it to get a display token (\"Walk-in 38\") staff can call out when the food is ready.\n\nBoth use the **same `counters/main` document**, just different fields (`userId`, `walkinNo`). Because they share the document, a single transaction reads and bumps exactly the field it needs while leaving the others untouched — `tx.set(ref, {field: next}, merge)` does not disturb `billNo`. This is the payoff of keeping all counters in one doc: one helper, one document, three sequences, all atomic.\n\nWhether a counter ever resets is a policy choice. `billNo` and `userId` grow forever. `walkinNo` could reset daily if the restaurant prefers tokens to start from 1 each morning — implemented by an admin `set` of `walkinNo` to 0 at open, reusing the same `setNextBillNo` pattern.",
          whyItMatters:
            'Factoring the bump into one helper means new sequences cost one line, not a copy-pasted transaction with a subtle bug. Stable `userId`s make reports readable; walk-in tokens give counter-service guests the familiar numbered-slip experience. Sharing one counters document keeps every sequence atomic without coordinating across documents.',
          steps: [
            'Extract the transaction into a private `_nextCounter(String field)` helper.',
            'Implement `nextBillNo()` as `_nextCounter(\'billNo\')`.',
            'Implement `nextUserId()` as `_nextCounter(\'userId\')`.',
            'Implement `nextWalkinNo()` as `_nextCounter(\'walkinNo\')`.',
            'Call `nextUserId()` when creating a staff member.',
            'Call `nextWalkinNo()` when opening a walk-in (table-less) order.',
            'If walk-in tokens reset daily, add an admin `set` of `walkinNo` to 0 at open.',
          ],
          code: `// One helper, three sequences, all in counters/main.
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  DocumentReference<Map<String, dynamic>> get _counters =>
      _db.collection('counters').doc('main');

  // Generic atomic bump for any counter field.
  Future<int> _nextCounter(String field) {
    return _db.runTransaction<int>((tx) async {
      final snap = await tx.get(_counters);
      final next = ((snap.data()?[field] as num?)?.toInt() ?? 0) + 1;
      tx.set(_counters, {field: next}, SetOptions(merge: true));
      return next;
    });
  }

  Future<int> nextBillNo() => _nextCounter('billNo');
  Future<int> nextUserId() => _nextCounter('userId');     // staff number
  Future<int> nextWalkinNo() => _nextCounter('walkinNo'); // walk-in token
}`,
          pitfalls: [
            '**Copy-pasting the transaction per counter.** Bugs multiply. Fix: one `_nextCounter(field)` helper.',
            '**Putting each counter in its own document.** Loses single-doc atomicity. Fix: keep all fields in `counters/main`.',
            "**Using a `set` without merge in the helper.** It wipes the other counter fields. Fix: `SetOptions(merge: true)`.",
            '**Keying reports on email instead of `userId`.** Reports get verbose and PII-heavy. Fix: allocate a short `userId`.',
            '**Forgetting to reset `walkinNo` if policy wants daily tokens.** Tokens climb into the hundreds. Fix: admin `set` to 0 at open.',
            '**Allocating a `userId` before the user is actually saved.** A failed save leaves a gap. Fix: allocate inside the same flow that writes the user.',
          ],
          tryIt:
            "Add `nextWalkinNo()` and call it three times — expect 1, 2, 3 (assuming a fresh counter). Then add an admin `resetWalkins()` that `set`s `walkinNo` to 0, call `nextWalkinNo()` again, and confirm it returns 1. Verify `billNo` was never touched by any of this.",
          takeaway:
            'Factor the atomic bump into one `_nextCounter(field)` helper and drive every sequence — bill, user, walk-in — off the shared `counters/main` document.',
        },
        {
          id: 'm4-t13',
          title: 'Finding an Existing Tab: runningOrderForRoom',
          explain:
            'Query `running_orders` by `roomNo` to find an already-open tab so staff continue the same order instead of opening a duplicate.',
          analogy:
            'A waiter walks up to table 7 at TunMani Cafe mid-meal. Before scribbling a fresh slip he checks the rack: **is there already an open tab for room 7?** If yes, he adds the new neer dosa to that slip; if no, he starts one. `runningOrderForRoom(7)` is that "is there already a tab?" check — without it you get two half-bills for one table.',
          theory:
            "When staff add items to a table that already has an open tab, the app must find the existing running order rather than create a second one. **`runningOrderForRoom(roomNo)`** is a one-time query that looks up `running_orders` where `roomNo` equals the given room and returns the first match (or null).\n\nThe implementation is a filtered `.get()` with a limit of one:\n`_running.where('roomNo', isEqualTo: roomNo).limit(1).get()`.\nThe `.limit(1)` is important — there should only ever be one open tab per room, and limiting keeps the read cheap. If the result is empty, no tab is open and the caller creates one with `addRunningOrder`; if a document comes back, the caller continues it with `updateRunningItems`.\n\nThis is a **point-in-time** read (a `Future`), not a stream: you check once at the moment the waiter opens the table. The live board uses `runningOrders()` separately to show all open tabs.\n\nReturning `null` for \"no tab\" is the cleanest contract — the caller branches on null to decide create-vs-continue. Mapping the single doc through `RunningOrder.fromMap(d.id, d.data())` gives the caller the tab's ID so the very next call can `updateRunningItems` against it. This find-or-create pattern is what prevents the duplicate-tab bug that plagues naive POS apps.",
          whyItMatters:
            'Without this lookup, two waiters serving the same table create two separate tabs and the guest gets two partial bills — a real, common failure in multi-waiter restaurants. A single cheap `limit(1)` query at table-open time enforces one tab per room and makes the running-order feature trustworthy.',
          steps: [
            'Build a query: `_running.where(\'roomNo\', isEqualTo: roomNo)`.',
            'Add `.limit(1)` since there should be at most one open tab per room.',
            'Call `.get()` and `await` the snapshot.',
            'If `snap.docs.isEmpty`, return `null` (no open tab).',
            'Otherwise map the first doc with `RunningOrder.fromMap(d.id, d.data())`.',
            'In the caller, branch on null: create with `addRunningOrder`, else continue with `updateRunningItems`.',
            'Keep this as a one-time read; use `runningOrders()` for the live board.',
          ],
          code: `// Find an existing open tab for a room, or null.
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  CollectionReference<Map<String, dynamic>> get _running =>
      _db.collection('running_orders');

  Future<RunningOrder?> runningOrderForRoom(int roomNo) async {
    final snap = await _running
        .where('roomNo', isEqualTo: roomNo)
        .limit(1) // at most one open tab per room
        .get();
    if (snap.docs.isEmpty) return null; // no open tab
    final d = snap.docs.first;
    return RunningOrder.fromMap(d.id, d.data());
  }
}

// Caller — find-or-create:
// final existing = await service.runningOrderForRoom(7);
// if (existing == null) {
//   await service.addRunningOrder(newTabForRoom7);
// } else {
//   await service.updateRunningItems(existing.id, mergedItems);
// }`,
          pitfalls: [
            '**Skipping the lookup and always creating a tab.** You get duplicate tabs per table. Fix: find-or-create with `runningOrderForRoom`.',
            "**Omitting `.limit(1)`.** You read every tab and pay for it. Fix: limit to one — there should only be one.",
            '**Streaming this check.** It is a one-time decision at table-open. Fix: use `.get()`, not `.snapshots()`.',
            '**Returning an empty list instead of null.** Callers must then check `.isEmpty` everywhere. Fix: return `RunningOrder?` and null for none.',
            '**Allowing two open tabs for one room.** The lookup then returns an ambiguous first. Fix: enforce one-tab-per-room on create.',
            '**Comparing `roomNo` as a string when stored as int.** The query matches nothing. Fix: keep `roomNo` type consistent.',
          ],
          tryIt:
            'Open a tab for room 7 with `addRunningOrder`. Call `runningOrderForRoom(7)` and confirm it returns that tab. Call `runningOrderForRoom(99)` and confirm it returns null. Then wire a find-or-create helper that adds an item to room 7 without creating a second tab.',
          takeaway:
            'A `where(\'roomNo\').limit(1).get()` returning null-or-tab gives you find-or-create, the pattern that stops duplicate open tabs per table.',
        },
      ],
    },
    {
      id: 'm4-s4',
      title: 'Server-side Pagination',
      topics: [
        {
          id: 'm4-t14',
          title: 'Why Pagination — and Cursor vs Offset',
          explain:
            'Big order history cannot be loaded all at once; fetch it in pages of 25 using a Firestore cursor (`startAfterDocument`) rather than an offset.',
          analogy:
            "TunMani Cafe has served fifty thousand bills. Asking for all of them at once is like demanding the whole year's bill book be carried to your table — slow, heavy, and you only ever read one page. Instead you ask for **25 bills, then the next 25 starting right after the last one you saw**. You keep a finger on the last slip (the cursor) and resume from there. That finger is `startAfterDocument`.",
          theory:
            "A finished-orders history grows without bound. Loading it all is slow, expensive (you pay per document read), and pointless — the user sees one screen at a time. **Pagination** fetches a fixed-size **page** (here 25) and loads the next page on demand.\n\nThere are two strategies. **Offset pagination** ('skip 50, take 25') is what SQL databases do, but Firestore has no true offset — emulating it still reads and discards the skipped documents, so page 100 costs 2,500 reads. **Cursor pagination** instead remembers the **last document of the current page** and asks for the next page *starting after that document*. Cost is always one page, no matter how deep you scroll.\n\nFirestore implements cursors with **`startAfterDocument(lastDoc)`**: you pass the actual `DocumentSnapshot` that ended the previous page, and the query resumes right after it. The query must `orderBy` a field (here `createdAt`) so 'after' has a well-defined meaning. Combine with `.limit(25)` to cap each page.\n\nThe page method returns both the **list of orders** and the **last snapshot** (the cursor) so the caller can request the next page. When a page returns fewer than 25 documents, you have reached the end.\n\nCrucially, cursor pagination is **stable under inserts at the top**: because you anchor on a real document, a new bill arriving while the user scrolls does not shift the page boundaries the way an offset would.",
          whyItMatters:
            'Offset pagination quietly turns a deep-history screen into a money pit — every page deeper re-reads everything before it. Cursor pagination keeps each page at a flat 25-read cost no matter how far the owner scrolls into last year. It is the only pagination that scales on Firestore, and getting it right is what keeps the reports screen fast and cheap.',
          steps: [
            'Decide a page size (25) and that history loads page by page.',
            'Reject offset pagination — Firestore reads and bills the skipped docs.',
            'Choose cursor pagination anchored on the last document of each page.',
            '`orderBy(\'createdAt\')` so "after" is well-defined.',
            'Use `startAfterDocument(lastSnapshot)` to resume after the previous page.',
            'Cap each page with `.limit(25)`.',
            'Return both the orders and the last snapshot so the next call can continue; an under-full page means the end.',
          ],
          code: `// Cursor pagination beats offset on Firestore — flat cost per page.

// OFFSET (do NOT do this): page 100 reads ~2500 docs you throw away.
//   _orders.orderBy('createdAt').limit(2525).get(); // then skip 2500

// CURSOR (do this): always reads exactly one page.
//   _orders
//     .orderBy('createdAt', descending: true)
//     .startAfterDocument(lastDocOfPreviousPage)
//     .limit(25)
//     .get();

// A small holder so the caller gets the orders AND the cursor back.
class OrdersPage {
  final List<Order> orders;
  final DocumentSnapshot<Map<String, dynamic>>? cursor; // null => end
  const OrdersPage(this.orders, this.cursor);
}`,
          pitfalls: [
            '**Loading the whole history at once.** Slow and expensive. Fix: page it, 25 at a time.',
            '**Emulating offset by over-fetching and skipping.** Firestore still reads the skipped docs. Fix: use `startAfterDocument`.',
            "**Paginating without `orderBy`.** 'After' is undefined and the cursor fails. Fix: always `orderBy` the cursor field.",
            '**Passing a field value to `startAfter` when a doc would be safer.** Ties on `createdAt` can skip or repeat rows. Fix: use `startAfterDocument(snapshot)`.',
            '**Not returning the cursor to the caller.** The next page cannot resume. Fix: return the last snapshot alongside the orders.',
            '**Forgetting the end condition.** You loop forever. Fix: an under-full page (fewer than 25) means the end.',
          ],
          tryIt:
            'Seed 60 dummy orders with increasing `createdAt`. Conceptually fetch page 1 (25), note the last document, and describe how page 2 uses `startAfterDocument` on it. Explain in one line why offset would have read 50 documents to get page 2 while the cursor reads only 25.',
          takeaway:
            'Cursor pagination with `orderBy` + `startAfterDocument` + `limit` keeps every page at a flat cost; offset on Firestore re-reads everything before it.',
        },
        {
          id: 'm4-t15',
          title: 'Implementing ordersPage(from, to, startAfter, limit)',
          explain:
            'Build the paginated history query: a date-range filter, ordering, an optional cursor, and a page limit returning both rows and the next cursor.',
          analogy:
            "The TunMani Cafe owner wants June's bills, 25 at a time. The cashier opens the bill book to June 1, reads 25 slips, slips a bookmark after the 25th, and on 'next page' resumes from the bookmark — still inside June. `ordersPage` is that bookmarked, date-bounded read: range filter for June, cursor for the bookmark, limit for the page.",
          theory:
            "**`ordersPage(from, to, startAfter, limit)`** combines everything: a **date-range filter**, an **order-by**, an **optional cursor**, and a **limit**.\n\nThe query starts on `orders`, brackets `createdAt` between `from` and `to` as `Timestamp`s (half-open: `>= from`, `< to`), orders by `createdAt` descending (newest first), and applies `.limit(limit)` (default 25). When `startAfter` is non-null, it inserts `.startAfterDocument(startAfter)` before the limit to resume after the previous page.\n\nThe method returns an `OrdersPage` holding the mapped `List<Order>` **and** the last `DocumentSnapshot` as the next cursor. The caller stores the cursor and passes it back on the next call. When the returned list is shorter than `limit`, there are no more pages.\n\nBuilding the query conditionally is the one subtlety. Firestore's `Query` is immutable — each `.where`/`.orderBy`/`.startAfterDocument` returns a *new* query — so you build it up in a local variable and only add `.startAfterDocument` when `startAfter != null`:\n`Query q = _orders.where(...).where(...).orderBy('createdAt', descending: true); if (startAfter != null) q = q.startAfterDocument(startAfter); q = q.limit(limit);`\n\nThis one method backs the entire order-history screen: first call with `startAfter: null` loads page one; each scroll-to-bottom calls again with the saved cursor. Because it is a one-time `.get()`, the screen is cheap and predictable, and the date range keeps reports scoped to the period the owner asked for.",
          whyItMatters:
            'This is the real, production-shaped pagination method — date-scoped, cursor-driven, limit-capped — that the history and reports screens depend on. Returning the cursor alongside the rows is what makes endless-scroll possible without re-reading. Building the query conditionally is the exact pattern you reuse for any optional-cursor Firestore query.',
          steps: [
            'Start the query on `_orders`.',
            'Add range `where` clauses on `createdAt` using `Timestamp.fromDate(from)` and `Timestamp.fromDate(to)`, half-open.',
            'Add `orderBy(\'createdAt\', descending: true)` for newest-first.',
            'If `startAfter != null`, add `.startAfterDocument(startAfter)`.',
            'Add `.limit(limit)` (default 25).',
            'Call `.get()`, map docs to `List<Order>`, capture the last snapshot as the next cursor.',
            'Return an `OrdersPage(orders, cursor)`; an under-full page means no more pages.',
          ],
          code: `// The full paginated, date-ranged history read.
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  CollectionReference<Map<String, dynamic>> get _orders =>
      _db.collection('orders');

  Future<OrdersPage> ordersPage({
    required DateTime from,
    required DateTime to,
    DocumentSnapshot<Map<String, dynamic>>? startAfter,
    int limit = 25,
  }) async {
    // Query is immutable — build it up in a local, adding the cursor only if set.
    Query<Map<String, dynamic>> q = _orders
        .where('createdAt', isGreaterThanOrEqualTo: Timestamp.fromDate(from))
        .where('createdAt', isLessThan: Timestamp.fromDate(to))
        .orderBy('createdAt', descending: true);

    if (startAfter != null) {
      q = q.startAfterDocument(startAfter); // resume after last page
    }
    q = q.limit(limit);

    final snap = await q.get();
    final orders =
        snap.docs.map((d) => Order.fromMap(d.id, d.data())).toList();
    final cursor = snap.docs.isEmpty ? null : snap.docs.last; // next cursor
    return OrdersPage(orders, cursor);
  }
}`,
          pitfalls: [
            '**Adding `.startAfterDocument(null)`.** Throws. Fix: only add the cursor when `startAfter != null`.',
            '**Mutating the query in place expecting it to change.** `Query` is immutable. Fix: reassign `q = q.something()`.',
            "**Ordering ascending but expecting newest first.** History looks backwards. Fix: `descending: true` on `createdAt`.",
            '**Returning rows without the cursor.** The next page cannot resume. Fix: return the last snapshot too.',
            '**Range-filtering on `createdAt` but ordering by another field.** Firestore requires the first orderBy to match the range field. Fix: order by `createdAt`.',
            '**Using a closed range `<=` on `to`.** Boundary bills double-count across periods. Fix: half-open `< to`.',
          ],
          tryIt:
            "Call `ordersPage(from: monthStart, to: monthEnd, startAfter: null)` and print the count and the cursor's ID. Then call it again passing that cursor as `startAfter` and confirm you get the *next* 25 distinct bills with no overlap. Stop when a page returns fewer than 25.",
          takeaway:
            'Build the query in an immutable-aware local, add the cursor only when present, and return rows plus the next cursor so the history screen can endlessly scroll cheaply.',
        },
        {
          id: 'm4-t16',
          title: 'Composite Indexes and the Index Error',
          explain:
            'Multi-field queries (range + orderBy) need a composite index; Firestore throws a FAILED_PRECONDITION error with a one-click link to create it.',
          analogy:
            'A plain bill book sorted only by date is fine for "show me June". But "show me June, newest first, only paid bills" needs a **specially cross-referenced index card set** the office prepares once. Firestore is the same: simple queries work off automatic indexes, but combine a range with a sort or a second filter and it needs a **composite index** built ahead of time — and it will hand you the exact link to build it.',
          theory:
            "Firestore answers every query from an **index** — it never scans documents. Single-field indexes are created automatically, so a query that filters or sorts on **one** field just works. But the moment a query combines fields in a way the automatic indexes cannot serve — most commonly a **range filter on one field plus an `orderBy`**, or **two filters plus a sort** — Firestore needs a **composite index** you create in advance.\n\nWhen the index is missing, the query fails at runtime with **`FAILED_PRECONDITION: The query requires an index`** and, helpfully, a **direct console URL** that pre-fills the exact index definition. Clicking it and pressing Create builds the index in a minute or two; after that the query runs forever. You can also declare indexes in `firestore.indexes.json` and deploy them with the Firebase CLI so they ship with the app rather than being created by hand.\n\nOur `ordersPage` query — range on `createdAt` plus `orderBy createdAt descending` — is borderline (same field), but as soon as you add a second filter (say `where('paid', isEqualTo: true)` plus the date range plus the sort) you will trip the composite-index requirement. The fix is never to remove the filter; it is to create the index Firestore asks for.\n\nThe practical workflow: run the query once in development, watch for the index error in the console, click the link to create the index (or add it to `firestore.indexes.json`), wait for it to build, and re-run. Treat the first index error of any new multi-field query as expected, not a bug.",
          whyItMatters:
            'The index error is the single most common Firestore surprise for new developers — the query works in a tutorial with one filter and then explodes when you add a real-world second condition. Knowing it is expected, that the error contains the fix link, and that indexes can be version-controlled in `firestore.indexes.json` turns a scary runtime crash into a one-click, one-time setup step.',
          steps: [
            'Know that single-field queries use automatic indexes — no setup.',
            'Expect a composite index when combining a range filter with an `orderBy`, or two filters with a sort.',
            'Run the query once and read the `FAILED_PRECONDITION` error in the console.',
            'Click the pre-filled URL in the error to create the exact index.',
            'Alternatively, declare it in `firestore.indexes.json` and `firebase deploy --only firestore:indexes`.',
            'Wait for the index status to flip to Enabled (a minute or two).',
            'Re-run the query — it now serves from the new index.',
          ],
          code: `// A query that needs a composite index once you add the second filter.
Future<List<Order>> paidOrdersInRange(DateTime from, DateTime to) async {
  final snap = await FirebaseFirestore.instance
      .collection('orders')
      .where('paid', isEqualTo: true)                       // filter 1
      .where('createdAt',                                   // range filter
          isGreaterThanOrEqualTo: Timestamp.fromDate(from))
      .where('createdAt', isLessThan: Timestamp.fromDate(to))
      .orderBy('createdAt', descending: true)               // sort
      .get();
  // First run throws:
  //   [cloud_firestore/failed-precondition] The query requires an index.
  //   You can create it here: https://console.firebase.google.com/.../indexes?create_composite=...
  return snap.docs.map((d) => Order.fromMap(d.id, d.data())).toList();
}

// firestore.indexes.json — declare the index so it ships with the app:
// {
//   "indexes": [{
//     "collectionGroup": "orders",
//     "queryScope": "COLLECTION",
//     "fields": [
//       { "fieldPath": "paid",      "order": "ASCENDING" },
//       { "fieldPath": "createdAt", "order": "DESCENDING" }
//     ]
//   }]
// }`,
          pitfalls: [
            '**Treating the index error as a code bug.** It is expected for multi-field queries. Fix: create the index it asks for.',
            '**Removing the filter to dodge the error.** You break the feature. Fix: keep the query, add the index.',
            "**Creating the index by hand and forgetting to version it.** Other environments miss it. Fix: add to `firestore.indexes.json` and deploy.",
            '**Querying before the index finishes building.** It still errors. Fix: wait for status Enabled.',
            '**Mismatched field order in the index vs the query.** The index is not used. Fix: match field order and direction exactly.',
            '**Assuming every query needs an index.** Single-field queries do not. Fix: only composite/multi-field queries require manual indexes.',
          ],
          tryIt:
            "Add a `where('paid', isEqualTo: true)` filter to your date-range orders query and run it. When the `FAILED_PRECONDITION` error appears, copy the console link, create the index, wait for it to enable, and re-run. Then move the same index into `firestore.indexes.json` and deploy it.",
          takeaway:
            'Range-plus-sort or multi-filter queries need a composite index — the error gives you the create link, and `firestore.indexes.json` lets you ship indexes with the app.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm4-p1',
      type: 'Mini Project',
      title: 'FirestoreService with Live Streams',
      domain: 'Flutter + Firestore',
      duration: '2 hours',
      description:
        'Build the core FirestoreService class for TunMani Cafe Billing with typed live streams for active SKUs, all users, and running orders, plus the one-time reads for reports and settings. The data layer every later screen binds to.',
      tools: ['Flutter 3.x', 'cloud_firestore', 'Dart 3.x'],
      blueprint: {
        overview:
          'Create a single FirestoreService that exposes typed Stream and Future methods over the skus, users, running_orders, orders, and settings collections, hiding all raw Firestore types behind fromMap-backed models.',
        functionalRequirements: [
          '**Models.** `Sku`, `AppUser`, `RunningOrder`, `Order` each with a `fromMap(id, map)` factory and a `toMap()`.',
          '**Live streams.** `activeSkus()` (active only, ordered by code), `allSkus()`, `allUsers()`, `runningOrders()` — each `Stream<List<T>>`.',
          '**One-time reads.** `ordersInRange(from, to)` and `storeSettings()` as `Future`s.',
          '**Writes.** `saveSku`, `toggleSku`, `deleteSku`, `saveUser`, `toggleUserActive`, `deleteUser`.',
          '**Running orders.** `addRunningOrder`, `updateRunningItems`, `deleteRunningOrder`, `runningOrderForRoom`.',
          '**No leaks.** No method returns a `QuerySnapshot` or `DocumentReference`; everything is models or primitives.',
        ],
        technicalImplementation: [
          '**Service skeleton.** One class holding `FirebaseFirestore.instance` and typed `get` references per collection.',
          '**Stream shape.** `query.snapshots().map((s) => s.docs.map((d) => T.fromMap(d.id, d.data())).toList())`.',
          '**Read shape.** `await query.get()` then map docs to models; `settings/store` via direct `.doc().get()`.',
          '**Write shape.** `set` for create/replace, `update` for partial toggles, `delete` for removal.',
          '**Find-or-create.** `runningOrderForRoom` via `where(roomNo).limit(1).get()` returning a nullable model.',
          '**Timestamps.** `createdAt` written with `FieldValue.serverTimestamp()`, range reads bracketed with `Timestamp.fromDate`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Models',
            outcome: 'Four model classes with fromMap/toMap compile cleanly.',
            prompt:
              "In a Flutter project with cloud_firestore added, create lib/models/ with Sku, AppUser, RunningOrder, and Order classes. Each has final fields, a const constructor, a `factory T.fromMap(String id, Map<String, dynamic> m)` that safely coerces fields with `as Type?` and defaults, and a `Map<String, dynamic> toMap()`. Order.fromMap should read createdAt via `(m['createdAt'] as Timestamp).toDate()`. Run `flutter analyze` and fix any issues.",
          },
          {
            step: 2,
            label: 'Service skeleton',
            outcome: 'FirestoreService with typed collection references.',
            prompt:
              "Create lib/services/firestore_service.dart with a FirestoreService class holding `final FirebaseFirestore _db = FirebaseFirestore.instance`. Add typed getters `_skus`, `_users`, `_orders`, `_running` (CollectionReference<Map<String, dynamic>>) and `_storeSettings`, `_counters` (DocumentReference) pointing at settings/store and counters/main.",
          },
          {
            step: 3,
            label: 'Live streams',
            outcome: 'Four Stream<List<T>> methods backed by snapshots().map.',
            prompt:
              "Add activeSkus() (where active==true, orderBy code), allSkus() (orderBy code), allUsers() (orderBy name), and runningOrders() (orderBy roomNo). Each returns Stream<List<T>> built as `query.snapshots().map((s) => s.docs.map((d) => T.fromMap(d.id, d.data())).toList())`. No QuerySnapshot leaks to callers.",
          },
          {
            step: 4,
            label: 'Reads and writes',
            outcome: 'ordersInRange, storeSettings, and all SKU/user writes.',
            prompt:
              "Add ordersInRange(DateTime from, DateTime to) using two where clauses on createdAt with Timestamp.fromDate (half-open >= from, < to) plus orderBy createdAt, returning Future<List<Order>>. Add storeSettings() reading settings/store. Add saveSku, toggleSku (update active only), deleteSku, saveUser (merge set keyed by lowercased email), toggleUserActive, deleteUser.",
          },
          {
            step: 5,
            label: 'Running orders',
            outcome: 'Open-tab CRUD plus find-or-create lookup.',
            prompt:
              "Add addRunningOrder, updateRunningItems (partial update of items + updatedAt serverTimestamp), deleteRunningOrder, and runningOrderForRoom(int roomNo) that runs `where('roomNo', isEqualTo: roomNo).limit(1).get()` and returns RunningOrder? (null when no open tab). Then write a find-or-create helper that adds an item to a room without creating a duplicate tab.",
          },
          {
            step: 6,
            label: 'Smoke test',
            outcome: 'A screen binds activeSkus() and runningOrders() live.',
            prompt:
              "Build a throwaway DebugScreen with two StreamBuilders: one over activeSkus() listing code/name/price, one over runningOrders() listing roomNo and item count. Add buttons to saveSku a sample dish and addRunningOrder a sample tab. Run the app, perform each action, and confirm both lists update live without a manual refresh.",
          },
        ],
        deliverable:
          'A FirestoreService class plus four models that expose typed live streams and one-time reads with zero Firestore types leaking to the UI, verified live in a debug screen.',
      },
    },
    {
      id: 'm4-p2',
      type: 'Mini Project',
      title: 'Transactional Bill-Number Counter',
      domain: 'Flutter + Firestore',
      duration: '2 hours',
      description:
        'Add the monotonic counter layer to FirestoreService — a single transactional bump driving nextBillNo, nextUserId, and nextWalkinNo — and prove it is collision-free under concurrency.',
      tools: ['Flutter 3.x', 'cloud_firestore', 'Dart 3.x'],
      blueprint: {
        overview:
          'Implement atomic, gap-free counters in the counters/main document using runTransaction, expose consume/peek/set for bill numbers, and verify no duplicates appear under concurrent allocation.',
        functionalRequirements: [
          '**Shared counter doc.** All sequences (`billNo`, `userId`, `walkinNo`) live in counters/main.',
          '**Atomic bump.** A private `_nextCounter(field)` runs a transaction: tx.get, +1, tx.set(merge).',
          '**Bill trio.** `nextBillNo()` (consume), `peekNextBillNo()` (read-only), `setNextBillNo(value)` (admin migrate).',
          '**Other sequences.** `nextUserId()` and `nextWalkinNo()` reuse the helper.',
          '**No collisions.** 50 concurrent `nextBillNo()` calls yield 50 distinct, gap-free numbers.',
          '**Peek is read-only.** `peekNextBillNo()` never changes the stored value.',
        ],
        technicalImplementation: [
          '**Transaction.** `_db.runTransaction<int>((tx) async { ... })` with tx.get before tx.set.',
          '**Merge write.** `tx.set(_counters, {field: next}, SetOptions(merge: true))` to avoid wiping sibling counters.',
          '**Peek.** Plain `_counters.get()` returning stored value + 1, no write.',
          '**Set.** `_counters.set({field: value - 1}, merge)` so the next consume returns `value`.',
          '**Concurrency test.** `Future.wait(List.generate(50, (_) => nextBillNo()))` collected into a Set.',
          '**Idempotency.** Transaction body does only Firestore reads/writes; no side effects.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Counter helper',
            outcome: 'A private transactional bump compiles.',
            prompt:
              "In FirestoreService, add a private `Future<int> _nextCounter(String field)` that calls `_db.runTransaction<int>` over the counters/main doc: read with tx.get, compute current+1 (defaulting 0 when absent), write back with `tx.set(_counters, {field: next}, SetOptions(merge: true))`, and return next. Add a `_counters` getter if not present.",
          },
          {
            step: 2,
            label: 'Bill trio',
            outcome: 'nextBillNo, peekNextBillNo, setNextBillNo work.',
            prompt:
              "Add nextBillNo() => _nextCounter('billNo'). Add peekNextBillNo() as a plain `_counters.get()` returning the stored billNo + 1 with no write. Add setNextBillNo(int value) that writes `{ 'billNo': value - 1 }` with merge so the next consume returns exactly value. Document that setNextBillNo is admin-only.",
          },
          {
            step: 3,
            label: 'More sequences',
            outcome: 'nextUserId and nextWalkinNo reuse the helper.',
            prompt:
              "Add nextUserId() => _nextCounter('userId') and nextWalkinNo() => _nextCounter('walkinNo'). Add an admin resetWalkins() that sets walkinNo to 0 with merge. Confirm these never touch billNo by checking the counters/main document after calling each.",
          },
          {
            step: 4,
            label: 'Concurrency test',
            outcome: 'Proof of 50 distinct numbers under load.',
            prompt:
              "Write a debug button that runs `final nums = await Future.wait(List.generate(50, (_) => nextBillNo()));` then `final unique = nums.toSet();` and asserts `unique.length == 50`. Display the result. Run it twice and confirm no duplicates either time. Then temporarily replace the transaction with a naive get-then-set and observe duplicates appear under the same load.",
          },
          {
            step: 5,
            label: 'Migration flow',
            outcome: 'Sequence can be started at a paper-book number.',
            prompt:
              "Build a tiny admin form with a number field and a 'Set starting bill number' button calling setNextBillNo. Set it to 5000, then call peekNextBillNo (expect 5000), then nextBillNo (expect 5000), then peekNextBillNo again (expect 5001). Show all three values on screen to verify the migration math.",
          },
          {
            step: 6,
            label: 'Wire into finalise',
            outcome: 'saveOrder consumes exactly one bill number.',
            prompt:
              "In a finalise flow, call nextBillNo() once, put the returned number into the order map as billNo, then saveOrder and return its doc id. Add a guard so a retry of the same finalise does not call nextBillNo twice. Verify two rapid finalises produce two consecutive billNos and two distinct order documents.",
          },
        ],
        deliverable:
          'A counters layer on FirestoreService providing atomic nextBillNo/nextUserId/nextWalkinNo plus peek and admin-set, proven collision-free with a 50-way concurrency test.',
      },
    },
  ],
  quiz: [
    {
      id: 'm4-q1',
      q: 'In Firestore, what is the relationship between a collection and a document?',
      options: [
        'A document contains many collections; collections hold the field values.',
        'A collection is a named container of documents; a document is a single record holding the fields.',
        'They are the same thing with different names.',
        'A collection holds exactly one document.',
      ],
      answer: 1,
    },
    {
      id: 'm4-q2',
      q: 'Which read API should back the live running-orders board that must update the instant another device adds an item?',
      options: [
        '`.get()` polled every few seconds',
        '`.snapshots()` consumed by a StreamBuilder',
        '`ordersInRange(from, to)`',
        'A one-time transaction',
      ],
      answer: 1,
    },
    {
      id: 'm4-q3',
      q: 'Why must `nextBillNo()` use a Firestore transaction?',
      options: [
        'To make the read faster.',
        'To compress the counter document.',
        'So concurrent cashiers cannot read the same value and print duplicate bill numbers — the read-and-increment is atomic.',
        'Because Firestore forbids reading counters outside transactions.',
      ],
      answer: 2,
    },
    {
      id: 'm4-q4',
      q: 'What does `peekNextBillNo()` do that `nextBillNo()` does not?',
      options: [
        'It returns the next number without consuming or changing the stored counter.',
        'It increments the counter twice.',
        'It runs inside a transaction while nextBillNo does not.',
        'It deletes the counter after reading.',
      ],
      answer: 0,
    },
    {
      id: 'm4-q5',
      q: 'For deep order history, why is cursor pagination (`startAfterDocument`) preferred over offset pagination on Firestore?',
      options: [
        'Offset returns wrong results.',
        'Cursor pagination reads a flat one page per request, while emulated offset still reads and bills every skipped document.',
        'Offset pagination is not supported by Dart.',
        'Cursor pagination loads the whole collection first.',
      ],
      answer: 1,
    },
    {
      id: 'm4-q6',
      q: 'A query combining a `createdAt` range filter with a second `where` and an `orderBy` throws `FAILED_PRECONDITION: The query requires an index`. What is the correct fix?',
      options: [
        'Remove the second filter so the query is simpler.',
        'Switch the query to a transaction.',
        'Create the composite index Firestore asks for (via the error link or firestore.indexes.json), then re-run.',
        'Download all documents and filter in Dart.',
      ],
      answer: 2,
    },
  ],
};
