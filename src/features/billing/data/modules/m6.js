// Module M6 — Staff Billing Workflow (TunMani Cafe Billing)
// How a waiter builds an order: home dashboard, running orders, and the cart screen.

export const m6 = {
  id: 'm6',
  title: 'Staff Billing Workflow',
  hours: 8,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Build the screens a waiter uses every shift: a live home dashboard of running orders, a way to start walk-in and room orders, and the cart screen where items are searched, added, and saved as a draft.',
  sections: [
    {
      id: 'm6-s1',
      title: 'Home Dashboard',
      topics: [
        {
          id: 'm6-t1',
          title: 'The staff landing screen',
          explain:
            'When a waiter logs in, they land on `home_screen.dart` — one screen showing a "New Order" button and every order still being served right now.',
          analogy:
            'Think of the counter desk at TunMani Cafe in Kundapura. The moment a waiter walks in for the evening shift, they glance at the desk and instantly see which tables are mid-meal and which are free. The home screen is that desk: one look tells you what is running and lets you start something new. You never go hunting through a register — everything that matters is on the first screen.',
          theory:
            'The **home screen** is the first thing a logged-in staff member sees. It has two jobs. First, a prominent **"New Order"** action to start billing a fresh customer. Second, a **live list of running orders** — drafts that are being built but not yet paid.\n\nWe keep this screen deliberately simple. A waiter is busy and standing up; they should not scroll or think. The layout is an `AppBar`, a "New Order" button near the top, and below it a `StreamBuilder` that paints every running order as a tappable card.\n\nAn **admin** logging into the same screen also sees revenue analytics above the orders, but we hide that block for normal staff with a simple `if (isAdmin)` check. The analytics are covered in M9 — for now, just know the same `home_screen.dart` serves both roles.',
          whyItMatters:
            'This is the screen a waiter stares at for the whole shift, so its clarity decides how fast your restaurant turns tables. A confusing home screen means slow service and billing mistakes. Getting the dashboard right is the difference between an app the staff love and one they fight.',
          steps: [
            'Create `lib/screens/staff/home_screen.dart` with a `StatefulWidget` (we will need the welcome overlay later).',
            'Add an `AppBar` with the title "TunMani Cafe" and a logout action.',
            'Place a large **"New Order"** `ElevatedButton.icon` near the top of the body.',
            'Below it, add a `StreamBuilder` that listens to running orders and builds a list of cards.',
            'Wrap the analytics block in `if (auth.isAdmin) ...[ AnalyticsCard() ]` so staff do not see it.',
            'Make each running-order card tappable to resume editing (wired up in the next section).',
          ],
          code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      appBar: AppBar(title: const Text('TunMani Cafe')),
      body: Column(
        children: [
          // Admins also see revenue analytics here (built in M9).
          if (auth.isAdmin) const RevenueAnalyticsCard(),
          Padding(
            padding: const EdgeInsets.all(16),
            child: ElevatedButton.icon(
              icon: const Icon(Icons.add),
              label: const Text('New Order'),
              onPressed: () => _startNewOrder(context),
            ),
          ),
          // Live running orders fill the rest of the screen.
          const Expanded(child: RunningOrdersList()),
        ],
      ),
    );
  }

  void _startNewOrder(BuildContext context) {
    // Opens the walk-in vs room selector (next section).
  }
}`,
          pitfalls: [
            '**Putting too much on the home screen.** A waiter needs two things — start an order and resume a running one. Resist adding menus and settings here.',
            "**Showing admin analytics to staff.** Always guard the analytics block with `if (auth.isAdmin)`; revenue numbers are not a waiter's business.",
            '**Using a plain `StatelessWidget`.** You will soon add a welcome overlay that needs `initState`, so start as a `StatefulWidget` now.',
            '**Forgetting a logout action.** Staff phones are shared at the counter; a quick logout in the `AppBar` prevents one waiter billing under another name.',
          ],
          tryIt:
            'Create `home_screen.dart` with an `AppBar`, a "New Order" button, and a placeholder `Text("Running orders go here")` where the list will sit. Run the app and confirm the screen loads after login.',
          takeaway:
            'The home screen is the waiter’s desk: one button to start an order and a live list of everything still running.',
        },
        {
          id: 'm6-t2',
          title: 'Live running orders with StreamBuilder',
          explain:
            'A `StreamBuilder` listens to the `running_orders` collection so the dashboard updates the instant any waiter changes an order — no refresh button.',
          analogy:
            'Imagine the TunMani Cafe kitchen has a glass window to the dining hall. When a waiter adds a kori rotti to table 4, the cook sees it through the glass immediately. A `StreamBuilder` is that glass window: it watches Firestore and repaints the screen the moment the data behind the glass changes, so every waiter’s phone always shows the truth.',
          theory:
            'A **`StreamBuilder`** rebuilds its widget every time a `Stream` emits new data. We point it at a Firestore query over the **`running_orders`** collection. Because Firestore streams are *live*, any change — a new order, an added item, a finalised bill being deleted — pushes down to every connected device automatically.\n\nInside the builder we handle three states: `snapshot.hasError`, `connectionState == waiting` (show a spinner), and the data state (build the cards). Each document becomes one **running-order card**.\n\nWe order the query by `createdAt` so the newest orders appear in a predictable place. We do **not** add a manual refresh button — that would be a code smell here, because the stream already keeps the list current.',
          whyItMatters:
            'Restaurants have several waiters on one floor. If two waiters see stale lists they will double-bill or lose orders. A live `StreamBuilder` guarantees every phone shows the same running orders at the same moment, which is the whole point of putting this on Firebase instead of paper.',
          steps: [
            'Build a Firestore query: `running_orders` ordered by `createdAt` descending.',
            'Wrap it in a `StreamBuilder<QuerySnapshot>`.',
            'Handle `hasError` first, then the `waiting` state with a `CircularProgressIndicator`.',
            'Map each document to a `RunningOrder` model via `RunningOrder.fromDoc(doc)`.',
            'Render the list with `ListView.builder`, one `RunningOrderCard` per order.',
            'Show a friendly empty state ("No running orders") when the list is empty.',
          ],
          code: `class RunningOrdersList extends StatelessWidget {
  const RunningOrdersList({super.key});

  @override
  Widget build(BuildContext context) {
    final query = FirebaseFirestore.instance
        .collection('running_orders')
        .orderBy('createdAt', descending: true);

    return StreamBuilder<QuerySnapshot>(
      stream: query.snapshots(),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return const Center(child: Text('Could not load orders'));
        }
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        final docs = snapshot.data!.docs;
        if (docs.isEmpty) {
          return const Center(child: Text('No running orders'));
        }
        return ListView.builder(
          itemCount: docs.length,
          itemBuilder: (context, i) {
            final order = RunningOrder.fromDoc(docs[i]);
            return RunningOrderCard(order: order);
          },
        );
      },
    );
  }
}`,
          pitfalls: [
            '**Forgetting `snapshot.hasError`.** A broken query or rules error throws inside the builder; handle the error state first or the screen goes blank.',
            '**Reading `snapshot.data!.docs` while still waiting.** `data` is null during the `waiting` state — check `connectionState` before the `!`.',
            '**Adding a pull-to-refresh.** The stream is already live; a refresh control here is wasted code and confuses staff.',
            '**Not ordering the query.** Without `orderBy`, card positions jump around on every rebuild, making the list feel jittery.',
          ],
          tryIt:
            'Wire the `StreamBuilder` to `running_orders` and manually add a test document in the Firebase console. Watch it appear on your running device without touching the app.',
          takeaway:
            'A `StreamBuilder` over `running_orders` keeps every waiter’s dashboard live and identical, with no refresh button.',
        },
        {
          id: 'm6-t3',
          title: 'Walk-in vs room order cards',
          explain:
            'Cards are colour-coded: a **walk-in** order is dark green with an auto-generated ticket number, a **room** order is blue with the number the waiter typed.',
          analogy:
            'At TunMani Cafe, a customer who walks in off Court Road gets a torn paper token (#7, #8, #9 — printed in sequence), while a guest staying upstairs just says "room 203". The dashboard mirrors this exactly: green cards are the token crowd with a number the system gives them, blue cards are the room guests with a number a human chose. One glance at the colour tells a waiter the kind of customer.',
          theory:
            'A `RunningOrder` carries a **`type`** (`walkin` or `room`) and a **`number`**. We use these to style the card:\n\n- **Walk-in** → dark green background, label like `Ticket #7`. The number is auto-assigned by the system (covered next section).\n- **Room** → blue background, label like `Room 203`. The number was **typed by the waiter**.\n\nEach card also shows a quick summary: **item count**, **total quantity**, and the **subtotal** so far. Tapping the card resumes editing that order. We compute the summary from the order’s item list rather than storing it, so it is always accurate.\n\nColour is doing real work here — it is not decoration. A busy waiter parses colour faster than text, so the green/blue split is an accessibility and speed feature, not styling for its own sake.',
          whyItMatters:
            'A waiter scanning the floor must instantly tell a takeaway token from a room guest, because they are billed and served differently. Colour-coding the cards removes a whole category of mistakes — sending a room order to the wrong table, or losing a walk-in token in a sea of identical white cards.',
          steps: [
            'Add a `type` field (`walkin` / `room`) and a `number` field to the `RunningOrder` model.',
            'In `RunningOrderCard`, pick the colour: dark green for `walkin`, blue for `room`.',
            'Show the label: `Ticket #{number}` for walk-ins, `Room {number}` for rooms.',
            'Compute `itemCount`, `totalQty`, and `subtotal` from the order’s items.',
            'Render the summary line under the label.',
            'Wrap the card in `InkWell`/`GestureDetector` so a tap resumes the order.',
          ],
          code: `class RunningOrderCard extends StatelessWidget {
  final RunningOrder order;
  const RunningOrderCard({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final isWalkin = order.type == OrderType.walkin;
    // Colour is functional: green = walk-in token, blue = room guest.
    final bg = isWalkin ? const Color(0xFF1B5E20) : const Color(0xFF1565C0);
    final label = isWalkin ? 'Ticket #\${order.number}' : 'Room \${order.number}';

    final itemCount = order.items.length;
    final totalQty = order.items.fold<int>(0, (sum, it) => sum + it.qty);
    final subtotal = order.items.fold<double>(
        0, (sum, it) => sum + it.unitPrice * it.qty);

    return Card(
      color: bg,
      child: ListTile(
        onTap: () => resumeOrder(context, order),
        title: Text(label, style: const TextStyle(color: Colors.white)),
        subtitle: Text(
          '\$itemCount items · \$totalQty qty · ₹\${subtotal.toStringAsFixed(0)}',
          style: const TextStyle(color: Colors.white70),
        ),
      ),
    );
  }
}`,
          pitfalls: [
            '**Using the same colour for both types.** The colour split is the fastest signal on the screen — never collapse it to one neutral card.',
            '**Storing the subtotal in the document.** Compute it from items on the fly; a stored subtotal drifts out of sync the moment an item changes.',
            '**Low-contrast text on coloured cards.** Dark green and blue need white text; black text on them is unreadable on a cheap counter phone.',
            '**Confusing `number` with the document id.** The ticket/room number is a human-facing field, not Firestore’s auto id.',
          ],
          tryIt:
            'Create two test running orders in Firestore — one `type: walkin` and one `type: room` — and confirm one card paints green and the other blue with the right label.',
          takeaway:
            'Green walk-in cards and blue room cards let a waiter read the floor at a glance, with a live item/qty/subtotal summary.',
        },
        {
          id: 'm6-t4',
          title: 'The animated welcome overlay',
          explain:
            'On the very first login of a session we show a short animated welcome overlay over the home screen, then fade it away.',
          analogy:
            'When you first walk into TunMani Cafe, the host greets you warmly before pointing you to your table — a brief, pleasant moment, not a wall you have to climb. The welcome overlay is that host: it greets the waiter once at the start of the shift and then politely steps aside so the real work can begin.',
          theory:
            'A **welcome overlay** is a full-screen widget painted *on top of* the home screen using a `Stack`. It shows the staff member’s name and a friendly animation, then **auto-dismisses** after a couple of seconds with a fade.\n\nWe trigger it only on the **first login** of a session — not on every rebuild — by storing a flag (for example in the `AuthProvider` or a simple bool in `initState`). We drive the fade with an `AnimationController` plus an `AnimatedOpacity`, and remove the overlay from the `Stack` once the animation finishes.\n\nKeep it **short and skippable**. A waiter who taps the screen should get straight to work; the overlay is a nicety, never a gate. The key technique is the `Stack` layering: the home screen is always built underneath, so the moment the overlay is gone the dashboard is already there.',
          whyItMatters:
            'Small touches like a warm welcome make staff feel the app was built for them, which drives adoption — and an app the staff actually want to use is one that gets used correctly. But the same touch becomes a liability if it blocks work, so learning to make it brief and dismissible teaches the broader lesson of polish without friction.',
          steps: [
            'Add an `AnimationController` in the home screen’s `State` (so it is a `StatefulWidget`).',
            'Track a `_showWelcome` bool, set true only on the first build of the session.',
            'Wrap the body in a `Stack`: home content first, overlay last (on top).',
            'Build the overlay with `AnimatedOpacity` + the staff member’s name.',
            'Use a short `Future.delayed` (~2s) then `setState(() => _showWelcome = false)`.',
            'Let a tap on the overlay dismiss it immediately so busy staff can skip it.',
          ],
          code: `class _HomeScreenState extends State<HomeScreen> {
  bool _showWelcome = true;

  @override
  void initState() {
    super.initState();
    // Auto-dismiss the welcome after a brief moment.
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _showWelcome = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final name = context.read<AuthProvider>().staffName;
    return Scaffold(
      body: Stack(
        children: [
          _buildHomeContent(context),          // always underneath
          if (_showWelcome)
            GestureDetector(
              onTap: () => setState(() => _showWelcome = false), // skippable
              child: AnimatedOpacity(
                opacity: _showWelcome ? 1 : 0,
                duration: const Duration(milliseconds: 400),
                child: Container(
                  color: Colors.black87,
                  alignment: Alignment.center,
                  child: Text('Welcome, \$name',
                      style: const TextStyle(color: Colors.white, fontSize: 28)),
                ),
              ),
            ),
        ],
      ),
    );
  }
}`,
          pitfalls: [
            '**Showing the overlay on every rebuild.** Gate it behind a session flag, or it flashes every time `setState` runs.',
            '**Calling `setState` after dispose.** Guard the delayed callback with `if (mounted)` or you crash when the screen closes early.',
            '**Making the overlay un-skippable.** Always let a tap dismiss it; a 2-second wall during a rush will make staff hate the app.',
            '**Forgetting to layer the home content underneath.** Build the dashboard first in the `Stack` so it is ready the instant the overlay fades.',
          ],
          tryIt:
            'Add the welcome overlay with the staff member’s name and a 2-second auto-dismiss. Then add a tap-to-skip and confirm both dismiss paths work.',
          takeaway:
            'A short, skippable welcome overlay greets the waiter once per session, then fades to reveal the live dashboard underneath.',
        },
      ],
    },
    {
      id: 'm6-s2',
      title: 'Creating a Running Order',
      topics: [
        {
          id: 'm6-t5',
          title: 'The RunningOrder concept',
          explain:
            'A `RunningOrder` is a **draft bill** saved in the `running_orders` collection while the customer is still eating; it is deleted the moment the bill is finalised.',
          analogy:
            'At TunMani Cafe the waiter scribbles your order on a kora (slip) pinned to the kitchen rail — it grows as you add a neer dosa, then a fish thali. That slip lives only while you eat; once you pay, it is torn off and binned, and the real bill goes to the register. A `RunningOrder` is that pinned slip: a temporary, editable draft that disappears the instant the bill becomes final.',
          theory:
            'We separate **drafts** from **final bills** into two collections:\n\n- **`running_orders`** — editable drafts. A waiter adds and removes items here freely.\n- **`orders`** — finalised, paid bills. Immutable, numbered, and never edited.\n\nWhile the customer eats, everything happens in `running_orders`. The model holds the `type`, `number`, a list of items (each with `sku`, `name`, `unitPrice`, `qty`), and `createdAt`. When the waiter finalises (M7), we **create one `BillOrder` in `orders` and delete the `RunningOrder`** — an atomic hand-off.\n\nThis split is the backbone of the whole billing flow. It means a half-built order can never be mistaken for a paid one, and a paid bill can never be accidentally edited. Drafts are messy and mutable; finals are clean and frozen.',
          whyItMatters:
            'Mixing drafts and final bills in one collection is the classic POS bug: a waiter edits a "running" order that was actually already paid, and your revenue numbers go wrong. Keeping `running_orders` and `orders` separate makes finalisation a clear, one-way door and keeps your accounting trustworthy.',
          steps: [
            'Define a `RunningOrder` model: `id`, `type`, `number`, `List<OrderItem> items`, `createdAt`.',
            'Define `OrderItem`: `sku`, `name`, `unitPrice`, `qty`.',
            'Add `fromDoc` / `toMap` for Firestore serialization.',
            'Store drafts in `running_orders`; reserve `orders` strictly for finalised bills.',
            'Plan the finalise step (M7): write to `orders`, then delete from `running_orders`.',
            'Treat `orders` documents as read-only after creation.',
          ],
          code: `class OrderItem {
  final String sku;
  final String name;
  final double unitPrice;
  final int qty;
  OrderItem({required this.sku, required this.name,
             required this.unitPrice, required this.qty});

  Map<String, dynamic> toMap() => {
        'sku': sku, 'name': name, 'unitPrice': unitPrice, 'qty': qty,
      };
}

enum OrderType { walkin, room }

class RunningOrder {
  final String id;
  final OrderType type;
  final int number;            // ticket # or room #
  final List<OrderItem> items;
  final DateTime createdAt;

  RunningOrder({required this.id, required this.type, required this.number,
                required this.items, required this.createdAt});

  factory RunningOrder.fromDoc(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return RunningOrder(
      id: doc.id,
      type: d['type'] == 'room' ? OrderType.room : OrderType.walkin,
      number: d['number'] as int,
      items: (d['items'] as List)
          .map((m) => OrderItem(
                sku: m['sku'], name: m['name'],
                unitPrice: (m['unitPrice'] as num).toDouble(),
                qty: m['qty'] as int))
          .toList(),
      createdAt: (d['createdAt'] as Timestamp).toDate(),
    );
  }
}`,
          pitfalls: [
            '**Storing drafts and finals in one collection.** Always split `running_orders` from `orders`, or paid bills become editable.',
            '**Forgetting to delete the draft after finalising.** A stale `running_order` left behind shows a paid table as still running.',
            '**Editing an `orders` document.** Final bills are frozen; corrections happen via a new bill, never an edit.',
            '**Casting numbers carelessly.** Firestore returns `num`; call `.toDouble()` on prices or math will throw on integer-stored values.',
          ],
          tryIt:
            'Write the `RunningOrder` and `OrderItem` models with `fromDoc`. Add one running order document by hand in Firestore and parse it back into a model in code.',
          takeaway:
            'A `RunningOrder` is a deletable draft in `running_orders`; finalising moves it to the frozen `orders` collection.',
        },
        {
          id: 'm6-t6',
          title: 'Walk-in orders: nextWalkinNo() counter',
          explain:
            'Walk-in orders get an auto-incrementing ticket number from a `nextWalkinNo()` helper backed by a counter document, so every token is unique and sequential.',
          analogy:
            'The TunMani Cafe counter has a single token pad: tear off #41, the next person gets #42, then #43 — the pad never hands two people the same token. `nextWalkinNo()` is that one shared pad living in Firestore: every waiter’s phone tears from the *same* pad, so two waiters starting walk-ins at the same second still get different numbers.',
          theory:
            'Walk-in numbers must be **unique and gap-aware** even when several phones create orders at once. We keep a **counter document** (for example `counters/walkin` with a `value` field) and increment it inside a **Firestore transaction**.\n\nA transaction reads the current value, adds one, and writes it back atomically. If two waiters race, Firestore retries one of them, so they can never both read `41` and both write `42`. The function returns the new number, which we stamp onto the running order.\n\nThis is the same pattern we will reuse for the final **bill number** in M7 — a single source of truth that hands out sequential ids safely. Never compute the next number by counting existing documents; that races and breaks under load.',
          whyItMatters:
            'Duplicate ticket numbers are chaos at the counter — two customers both holding "#42" cannot be told apart, and bills get swapped. A transactional counter is the only safe way to hand out sequential numbers when multiple staff bill simultaneously, which is exactly what a busy restaurant does.',
          steps: [
            'Create a counter document, e.g. `counters/walkin` with `{ value: 0 }`.',
            'Write `nextWalkinNo()` that runs a `runTransaction`.',
            'Inside, read the counter, compute `current + 1`, write it back.',
            'Return the new number from the transaction.',
            'Stamp the returned number onto the new `RunningOrder`.',
            'Reuse this exact pattern for `nextBillNo()` in M7.',
          ],
          code: `Future<int> nextWalkinNo() async {
  final ref = FirebaseFirestore.instance.collection('counters').doc('walkin');
  return FirebaseFirestore.instance.runTransaction<int>((tx) async {
    final snap = await tx.get(ref);
    final current = (snap.data()?['value'] as int?) ?? 0;
    final next = current + 1;
    tx.update(ref, {'value': next});
    return next; // unique even if two waiters race
  });
}

// Usage when starting a walk-in:
Future<RunningOrder> startWalkin() async {
  final number = await nextWalkinNo();
  final doc = FirebaseFirestore.instance.collection('running_orders').doc();
  final order = RunningOrder(
    id: doc.id, type: OrderType.walkin, number: number,
    items: const [], createdAt: DateTime.now(),
  );
  await doc.set({
    'type': 'walkin', 'number': number, 'items': [],
    'createdAt': FieldValue.serverTimestamp(),
  });
  return order;
}`,
          pitfalls: [
            '**Counting documents to get the next number.** `running_orders.length + 1` races and reuses numbers; always use a transactional counter.',
            '**Reading then writing without a transaction.** Two phones read the same value and both write the same next number — duplicates.',
            '**Forgetting to seed the counter.** If `counters/walkin` does not exist, default to `0` with `?? 0` so the first call returns `1`.',
            '**Resetting the counter casually.** Decide your reset policy (daily? never?) deliberately; a surprise reset duplicates yesterday’s tokens.',
          ],
          tryIt:
            'Implement `nextWalkinNo()` and call it three times in a row. Confirm you get 1, 2, 3 and that the `counters/walkin` document ends at 3.',
          takeaway:
            'A transactional counter document gives every walk-in a unique, sequential ticket number even when waiters race.',
        },
        {
          id: 'm6-t7',
          title: 'Room orders & runningOrderForRoom()',
          explain:
            'Room orders use a **waiter-entered** room number; `runningOrderForRoom()` checks whether that room already has a running order so the waiter resumes it instead of starting a duplicate.',
          analogy:
            'If room 203 at TunMani Cafe already has a slip pinned to the rail, the waiter must add the new fish thali to *that* slip — not start a second one. `runningOrderForRoom()` is the waiter walking to the rail and checking for an existing 203 slip before scribbling a new one. One room, one running slip.',
          theory:
            `Unlike walk-ins, **room numbers are typed by the waiter** (the guest is in room 203). That means the same room could be opened twice by mistake. Before creating a room order, we call **\`runningOrderForRoom(roomNo)\`** which queries \`running_orders\` for an existing \`type == room\` order with that \`number\`.\n\n- If one **exists**, we resume it — navigate straight to the order screen with that draft.\n- If **none** exists, we create a fresh running order for that room.\n\nThe query is \`where('type', isEqualTo: 'room').where('number', isEqualTo: roomNo)\`, fetched with \`.get()\` (a one-time read, not a stream). We return the existing \`RunningOrder\` or \`null\`. This "find-or-create" guard keeps **one running order per room**, which is the invariant the rest of the app relies on.`,
          whyItMatters:
            'Two open orders for the same room split a guest’s bill in half — they get charged twice or, worse, walk out having paid only one slip. The find-or-create check is what keeps a room’s order whole, and it teaches the everyday pattern of querying before inserting.',
          steps: [
            'Show a number-entry field when the waiter picks "Room" in the selector.',
            'On submit, call `runningOrderForRoom(roomNo)`.',
            'Query `running_orders` for `type == room` and `number == roomNo` with `.get()`.',
            'If a document is returned, parse it and resume that order.',
            'If none, create a new running order for that room number.',
            'Navigate to the order screen with the resulting `RunningOrder`.',
          ],
          code: `Future<RunningOrder?> runningOrderForRoom(int roomNo) async {
  final snap = await FirebaseFirestore.instance
      .collection('running_orders')
      .where('type', isEqualTo: 'room')
      .where('number', isEqualTo: roomNo)
      .limit(1)
      .get(); // one-time read, not a stream
  if (snap.docs.isEmpty) return null;          // no order yet for this room
  return RunningOrder.fromDoc(snap.docs.first); // resume the existing one
}

Future<RunningOrder> openRoom(int roomNo) async {
  final existing = await runningOrderForRoom(roomNo);
  if (existing != null) return existing;        // find...
  final doc = FirebaseFirestore.instance.collection('running_orders').doc();
  await doc.set({
    'type': 'room', 'number': roomNo, 'items': [],
    'createdAt': FieldValue.serverTimestamp(),
  });
  return RunningOrder(                            // ...or create
    id: doc.id, type: OrderType.room, number: roomNo,
    items: const [], createdAt: DateTime.now(),
  );
}`,
          pitfalls: [
            '**Skipping the find-or-create check.** Creating a room order without checking duplicates the room and splits the bill.',
            '**Using a stream for the lookup.** Use a one-time `.get()`; you only need a single snapshot to decide find-vs-create.',
            '**Not validating the typed room number.** Reject blanks and non-numbers before querying, or you create an order for "room null".',
            '**Forgetting a composite index.** A `where + where` query may need a Firestore composite index; create it when the console prompts.',
          ],
          tryIt:
            'Implement `openRoom(203)`. Call it twice and confirm the second call resumes the first order (same `id`) instead of creating a new document.',
          takeaway:
            '`runningOrderForRoom()` finds an existing room draft before creating one, keeping exactly one running order per room.',
        },
        {
          id: 'm6-t8',
          title: 'Provider, Consumer & go_router navigation',
          explain:
            'We hold the active order in a `Provider`, read it with `Consumer`, and use `go_router` to move to the order screen — passing the `RunningOrder` through the route’s `extra`.',
          analogy:
            'Think of the order slip as a physical object handed from the counter to the waiter at the table. `Provider` is the hook on the wall that holds the current slip so any part of the app can see it; `go_router`’s `extra` is the waiter physically carrying that exact slip to the next room. You do not photocopy the slip — you carry the one true copy.',
          theory:
            `**Provider** is our state-management layer. An \`OrderProvider extends ChangeNotifier\` holds the currently-active \`RunningOrder\` and exposes methods to mutate it. Widgets read it with **\`Consumer<OrderProvider>\`** (rebuilds on change) or \`context.read<OrderProvider>()\` (one-off action).\n\nFor navigation we use **\`go_router\`**. To open the order screen we call \`context.go('/order')\` or \`context.push('/order', extra: order)\`. The **\`extra\`** parameter lets us pass the whole \`RunningOrder\` object to the destination route without serializing it into the URL.\n\nThe pattern: tap a card → set the active order in the provider → navigate with \`extra\` → the order screen reads it. Passing via \`extra\` keeps the object reference intact (no re-fetch), while the provider gives any nested widget access to it. This is the plumbing every screen transition in the billing flow uses.`,
          whyItMatters:
            'Without a clean way to carry the order between screens, you end up re-fetching from Firestore on every navigation — slow and bug-prone. Provider plus `go_router`’s `extra` is the idiomatic Flutter way to hand state forward, and mastering it here unlocks every other screen transition in the app.',
          steps: [
            'Create `OrderProvider extends ChangeNotifier` holding the active `RunningOrder`.',
            'Register it above the app with `ChangeNotifierProvider`.',
            'Define a `/order` route in your `GoRouter` config.',
            'On card tap: `context.read<OrderProvider>().setActive(order)`.',
            'Navigate with `context.push("/order", extra: order)`.',
            'In the order screen, read the order from `GoRouterState.extra` or the provider.',
          ],
          code: `class OrderProvider extends ChangeNotifier {
  RunningOrder? _active;
  RunningOrder? get active => _active;

  void setActive(RunningOrder order) {
    _active = order;
    notifyListeners();
  }
}

// go_router config
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (c, s) => const HomeScreen()),
  GoRoute(
    path: '/order',
    builder: (c, s) {
      final order = s.extra as RunningOrder;   // passed via extra
      return OrderScreen(order: order);
    },
  ),
]);

// Resuming an order from a dashboard card:
void resumeOrder(BuildContext context, RunningOrder order) {
  context.read<OrderProvider>().setActive(order);
  context.push('/order', extra: order);        // carry the real object
}`,
          pitfalls: [
            '**Putting the order object in the URL path.** Use `extra` for objects; only ids belong in the path.',
            '**Casting `extra` without a null check.** A deep link can open `/order` with no `extra`; guard against null or the cast throws.',
            '**Calling `context.watch` inside an action.** Use `context.read` for one-off taps; `watch` belongs in `build` for rebuilds.',
            '**Forgetting `notifyListeners()`.** Mutating provider state without it leaves `Consumer` widgets showing stale data.',
          ],
          tryIt:
            'Wire a dashboard card tap to set the active order in `OrderProvider` and `context.push("/order", extra: order)`. Confirm the order screen receives the same order via `extra`.',
          takeaway:
            'Provider holds the active order and `go_router`’s `extra` carries the real `RunningOrder` object to the next screen.',
        },
      ],
    },
    {
      id: 'm6-s3',
      title: 'Order Screen',
      topics: [
        {
          id: 'm6-t9',
          title: 'The cart list with line totals',
          explain:
            'The order screen shows the current cart: each row lists the item name, unit price, and line total — the per-item subtotal of price × quantity.',
          analogy:
            'This is the running slip laid out neatly on the table at TunMani Cafe: neer dosa × 3 at ₹20 = ₹60, fish thali × 1 at ₹180 = ₹180. Each line shows what was ordered and what it costs, so both the waiter and the customer can read the meal so far line by line.',
          theory:
            'The **cart** is the `items` list of the active `RunningOrder`. We render it with a `ListView`, one row per `OrderItem`. Each row shows:\n\n- **Item name** (e.g. "Neer Dosa")\n- **Unit price** (₹20)\n- **Line total** = `unitPrice * qty` (₹60 for 3)\n\nWe compute the line total on the fly — never store it — so it always matches the current quantity. The cart is the heart of the order screen; everything else (search, totals, buttons) revolves around keeping this list correct.\n\nWe read the active order from the `OrderProvider` and rebuild rows whenever it changes. Quantities and removals (next topic) mutate this same list, so a single source of truth keeps the display honest.',
          whyItMatters:
            'The cart is what the customer is paying for — if a line total is wrong, you over- or under-charge a real person. Computing line totals from `unitPrice × qty` at render time guarantees the numbers on screen always match the actual order, with no stale cached totals to drift.',
          steps: [
            'Read the active order’s `items` list from `OrderProvider`.',
            'Render each item in a `ListView` row.',
            'Show the item name and unit price on the left.',
            'Compute `lineTotal = item.unitPrice * item.qty`.',
            'Display the line total on the right, formatted as rupees.',
            'Rebuild the list whenever the provider notifies a change.',
          ],
          code: `class CartList extends StatelessWidget {
  const CartList({super.key});

  @override
  Widget build(BuildContext context) {
    final items = context.watch<OrderProvider>().active!.items;
    return ListView.builder(
      itemCount: items.length,
      itemBuilder: (context, i) {
        final item = items[i];
        final lineTotal = item.unitPrice * item.qty;   // computed, not stored
        return ListTile(
          title: Text(item.name),
          subtitle: Text('₹\${item.unitPrice.toStringAsFixed(0)} each'),
          trailing: Text('₹\${lineTotal.toStringAsFixed(0)}'),
        );
      },
    );
  }
}`,
          pitfalls: [
            '**Storing the line total on the item.** Always compute `unitPrice * qty`; a stored total goes stale the instant qty changes.',
            '**Reading items with `read` instead of `watch`.** The cart must rebuild on change, so use `context.watch` in `build`.',
            '**Formatting prices inconsistently.** Pick one rupee format (e.g. no decimals for whole prices) and use it everywhere the cart shows money.',
            '**Assuming `active` is non-null.** Guard the active order; opening the screen without one should not crash with a `!` on null.',
          ],
          tryIt:
            'Render a cart with two hard-coded items at different prices and quantities. Confirm each line total equals price × qty.',
          takeaway:
            'The cart renders one row per item with a live line total of unit price × quantity.',
        },
        {
          id: 'm6-t10',
          title: 'Quantity buttons & remove-on-zero',
          explain:
            'Each cart row has +/- buttons to change quantity; decrementing to zero removes the item from the order entirely.',
          analogy:
            'If the customer says "make that two neer dosas," the waiter bumps the slip from 1 to 2 with a stroke of the pen. If they cancel the dosa, the waiter strikes it off the slip completely — it is gone, not left at zero. The +/- buttons are that pen, and remove-on-zero is the strike-off.',
          theory:
            'We give each row an **increment (+)** and **decrement (-)** button. Increment raises `qty` by one. Decrement lowers it by one — but when `qty` would hit **zero**, we **remove the item** from the list instead of keeping a zero-quantity row.\n\nThese mutations live in the `OrderProvider` so the cart, the running total, and the search panel all stay in sync. A typical API:\n\n- `increment(sku)` — qty + 1\n- `decrement(sku)` — qty - 1, or remove if it reaches 0\n- `removeItem(sku)` — explicit removal\n\nEach call ends with `notifyListeners()` so every `Consumer` repaints. Remove-on-zero keeps the cart clean: a customer who cancels an item should not see a ghost "Neer Dosa × 0" line.',
          whyItMatters:
            'Zero-quantity rows are confusing and can sneak ₹0 lines onto a printed bill or break totals if not handled. Remove-on-zero is the small rule that keeps the cart honest, and centralising mutations in the provider is what stops the displayed total from disagreeing with the actual items.',
          steps: [
            'Add `increment(sku)` and `decrement(sku)` methods to `OrderProvider`.',
            'In `decrement`, if the new qty is `<= 0`, remove the item instead.',
            'Call `notifyListeners()` after every mutation.',
            'Wire the row’s + button to `increment`, - button to `decrement`.',
            'Optionally add a trash icon that calls `removeItem(sku)` directly.',
            'Confirm the running total updates on each press.',
          ],
          code: `class OrderProvider extends ChangeNotifier {
  RunningOrder? _active;
  RunningOrder? get active => _active;

  void increment(String sku) {
    final items = _active!.items;
    final i = items.indexWhere((it) => it.sku == sku);
    items[i] = _copyWithQty(items[i], items[i].qty + 1);
    notifyListeners();
  }

  void decrement(String sku) {
    final items = _active!.items;
    final i = items.indexWhere((it) => it.sku == sku);
    final newQty = items[i].qty - 1;
    if (newQty <= 0) {
      items.removeAt(i);             // remove-on-zero
    } else {
      items[i] = _copyWithQty(items[i], newQty);
    }
    notifyListeners();
  }

  OrderItem _copyWithQty(OrderItem it, int qty) => OrderItem(
        sku: it.sku, name: it.name, unitPrice: it.unitPrice, qty: qty);
}`,
          pitfalls: [
            '**Leaving qty at 0 instead of removing.** A 0-qty row prints "× 0" on the bill; always remove when it reaches zero.',
            '**Allowing negative quantities.** Clamp at the removal boundary; qty should never go below 1 while the item exists.',
            '**Mutating the list without `notifyListeners()`.** The UI freezes on stale data if you forget to notify.',
            '**Looking items up by index across rebuilds.** Find by `sku`, not list index, since removal shifts indices.',
          ],
          tryIt:
            'Add +/- buttons to each cart row. Decrement an item to zero and confirm the row disappears and the total updates.',
          takeaway:
            'Quantity buttons mutate the order through the provider, and decrementing to zero removes the item entirely.',
        },
        {
          id: 'm6-t11',
          title: 'The running total bar',
          explain:
            'A bar shows the live order summary in one line: "{n} items · {qty} qty · ₹{subtotal}" so the waiter always sees the whole order at a glance.',
          analogy:
            'At the bottom of the TunMani Cafe slip the waiter keeps a running tally — "3 dishes, 6 plates, ₹420 so far." The customer glances at it before ordering more. The running total bar is that tally line, updating itself every time an item or quantity changes.',
          theory:
            'We derive three numbers from the cart and show them in a single bar:\n\n- **`n` items** = number of distinct lines (`items.length`)\n- **`qty`** = total plates = sum of every item’s `qty`\n- **`subtotal`** = sum of every `unitPrice * qty`\n\nAll three are **computed from the items list**, not stored, so they cannot drift. We place the bar at the bottom of the order screen, always visible, and rebuild it via `Consumer<OrderProvider>` so it tracks every change instantly.\n\nThe format string is exactly `"{n} items · {qty} qty · ₹{subtotal}"`. The middle dots (·) keep it compact for a phone width. This subtotal is the *pre-tax* figure — GST and discounts are applied later on the finalise screen (M7).',
          whyItMatters:
            'A waiter needs the order total in their head before suggesting "anything else?" — a live summary bar gives them that without mental arithmetic. Because all three numbers come from one computation, the bar can never disagree with the cart above it, which keeps the staff trusting the screen.',
          steps: [
            'Compute `itemCount = items.length`.',
            'Compute `totalQty` by folding over `items` summing `qty`.',
            'Compute `subtotal` by folding over `items` summing `unitPrice * qty`.',
            'Format the bar string: `"$itemCount items · $totalQty qty · ₹$subtotal"`.',
            'Place the bar at the bottom of the order screen.',
            'Wrap it in `Consumer<OrderProvider>` so it updates live.',
          ],
          code: `class RunningTotalBar extends StatelessWidget {
  const RunningTotalBar({super.key});

  @override
  Widget build(BuildContext context) {
    final items = context.watch<OrderProvider>().active!.items;
    final itemCount = items.length;
    final totalQty = items.fold<int>(0, (s, it) => s + it.qty);
    final subtotal = items.fold<double>(0, (s, it) => s + it.unitPrice * it.qty);

    return Container(
      color: Colors.lightBlue.shade50,
      padding: const EdgeInsets.all(12),
      child: Text(
        '\$itemCount items · \$totalQty qty · ₹\${subtotal.toStringAsFixed(0)}',
        style: const TextStyle(fontWeight: FontWeight.bold),
      ),
    );
  }
}`,
          pitfalls: [
            '**Confusing item count with quantity.** `items.length` is distinct lines; total plates needs a fold over `qty`. Show both.',
            '**Storing the subtotal.** Recompute from items every build so it can never lag behind the cart.',
            '**Treating this subtotal as the final amount.** It is pre-tax and pre-discount; GST is added on the finalise screen.',
            '**Not pinning the bar.** Keep it always visible at the bottom; a total that scrolls off defeats its purpose.',
          ],
          tryIt:
            'Add the running total bar and verify the three numbers update the instant you add an item or change a quantity.',
          takeaway:
            'The running total bar shows live item count, total quantity, and pre-tax subtotal, all computed from the cart.',
        },
        {
          id: 'm6-t12',
          title: 'Live search & add panel',
          explain:
            'A search panel filters active SKUs by code or name as the waiter types, lists matches via a `StreamBuilder`, and a + button adds or increments each item in the cart.',
          analogy:
            'Picture the TunMani Cafe menu board where the waiter’s finger slides to find "kori rotti" — as they think of it, they jump straight to it instead of reading the whole board. The search panel is that quick finger: type "kori" or its code and only the matching dishes appear, ready to tap into the order.',
          theory:
            'The **search & add panel** sits alongside the cart. A `TextField` captures the query; on every keystroke we filter the list of **active SKUs** (items marked available) by **code or name**, case-insensitively.\n\nThe item list comes from a `StreamBuilder` over the menu/SKU collection so newly-added dishes appear without an app restart. We filter the streamed list in memory by the query.\n\nEach result row has a **+** button. Tapping it **adds the item to the cart**, or, if it is already there, **increments** its quantity. We also show the **current cart quantity** next to items already in the order, so the waiter sees "Neer Dosa (×2)" without flipping back to the cart. Filtering only **active** SKUs hides discontinued dishes from being billed by mistake.',
          whyItMatters:
            'A waiter must add the right dish in one or two taps during a rush — scrolling a long menu loses tables. Live search by code or name plus an add-or-increment + button is what makes order entry fast, and showing the in-cart quantity prevents accidentally adding the same dish twice.',
          steps: [
            'Add a `TextField` whose `onChanged` updates a `query` in state.',
            '`StreamBuilder` the active-SKU collection (`where(active == true)`).',
            'Filter the streamed list where code or name contains the query (lowercased).',
            'Render each match with its price and a + button.',
            'On + tap: add to cart, or increment if the SKU is already present.',
            'Show the current cart quantity beside items already in the order.',
          ],
          code: `class SearchAddPanel extends StatefulWidget {
  const SearchAddPanel({super.key});
  @override
  State<SearchAddPanel> createState() => _SearchAddPanelState();
}

class _SearchAddPanelState extends State<SearchAddPanel> {
  String query = '';

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<OrderProvider>();
    return Column(children: [
      TextField(
        decoration: const InputDecoration(hintText: 'Search code or name'),
        onChanged: (v) => setState(() => query = v.toLowerCase()),
      ),
      Expanded(
        child: StreamBuilder<QuerySnapshot>(
          stream: FirebaseFirestore.instance
              .collection('skus')
              .where('active', isEqualTo: true)
              .snapshots(),
          builder: (context, snap) {
            if (!snap.hasData) return const SizedBox();
            final matches = snap.data!.docs.where((d) {
              final m = d.data() as Map<String, dynamic>;
              final code = (m['code'] as String).toLowerCase();
              final name = (m['name'] as String).toLowerCase();
              return code.contains(query) || name.contains(query);
            }).toList();
            return ListView(children: matches.map((d) {
              final m = d.data() as Map<String, dynamic>;
              final inCart = provider.qtyOf(m['code']); // 0 if not added
              return ListTile(
                title: Text(m['name']),
                subtitle: inCart > 0 ? Text('In cart: \$inCart') : null,
                trailing: IconButton(
                  icon: const Icon(Icons.add),
                  onPressed: () => provider.addOrIncrement(m), // add or +1
                ),
              );
            }).toList());
          },
        ),
      ),
    ]);
  }
}`,
          pitfalls: [
            '**Case-sensitive matching.** Lowercase both the query and the fields, or "Kori" fails to match "kori rotti".',
            '**Showing inactive SKUs.** Filter `active == true` so discontinued dishes cannot be billed.',
            '**Adding a duplicate row instead of incrementing.** Check if the SKU is already in the cart and bump its qty instead.',
            '**Re-querying Firestore on every keystroke.** Stream once, then filter in memory; do not rebuild the query per character.',
          ],
          tryIt:
            'Build the search panel and type a partial code and a partial name. Confirm both filter the list, and that tapping + on an in-cart item increments rather than duplicates it.',
          takeaway:
            'Live search filters active SKUs by code or name, and the + button adds new items or increments ones already in the cart.',
        },
        {
          id: 'm6-t13',
          title: 'Update vs Finalise & the PopScope guard',
          explain:
            'Two bottom buttons: **Update** saves the draft with `updateRunningItems` and stays running; **Finalise** goes to the finalise screen. A `PopScope` warns about unsaved changes on back.',
          analogy:
            'When the waiter steps away from table 7 they have two choices: pin the updated slip back on the rail (Update — still being served) or carry it to the register to settle up (Finalise — time to pay). And if they try to walk off without pinning the slip, the head waiter stops them: "Did you mean to leave those changes unsaved?" That stop-and-ask is the `PopScope` guard.',
          theory:
            'The order screen has two primary actions at the bottom:\n\n- **Update** — calls `updateRunningItems(orderId, items)` to save the current cart back to the `running_orders` document. The order **stays running**; the waiter returns to the dashboard.\n- **Finalise** — navigates to the **finalise screen** (M7) to apply GST, discounts, and take payment.\n\nWe protect against lost work with **`PopScope`** (the modern replacement for `WillPopScope`). When the waiter presses back with **unsaved changes**, we set `canPop: false` and show a dialog with three choices:\n\n- **Keep editing** — stay on the screen.\n- **Discard** — leave without saving.\n- **Update** — save the draft, then leave.\n\nWe only intercept when there are actual unsaved changes; if nothing changed, `PopScope` lets the back gesture through normally.',
          whyItMatters:
            'A waiter who accidentally swipes back and loses a half-built order will re-key everything and slow the floor — or worse, undercharge the customer. The Update/Finalise split makes the two intentions explicit, and the `PopScope` guard turns an easy fat-finger mistake into a deliberate choice.',
          steps: [
            'Write `updateRunningItems(orderId, items)` to save the cart to Firestore.',
            'Add an **Update** button that calls it and pops to the dashboard.',
            'Add a **Finalise** button that navigates to the finalise route.',
            'Track a `hasUnsavedChanges` flag as the cart mutates.',
            'Wrap the screen in `PopScope(canPop: !hasUnsavedChanges, ...)`.',
            'In `onPopInvoked`, show the Keep editing / Discard / Update dialog.',
          ],
          code: `Future<void> updateRunningItems(String orderId, List<OrderItem> items) {
  return FirebaseFirestore.instance
      .collection('running_orders')
      .doc(orderId)
      .update({'items': items.map((it) => it.toMap()).toList()});
}

// Order screen wrapped in PopScope:
PopScope(
  canPop: !hasUnsavedChanges,                 // free to leave if saved
  onPopInvokedWithResult: (didPop, _) async {
    if (didPop) return;                        // already popped, nothing to do
    final choice = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Unsaved changes'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, 'keep'),
              child: const Text('Keep editing')),
          TextButton(onPressed: () => Navigator.pop(context, 'discard'),
              child: const Text('Discard')),
          TextButton(onPressed: () => Navigator.pop(context, 'update'),
              child: const Text('Update')),
        ],
      ),
    );
    if (choice == 'update') {
      await updateRunningItems(order.id, items);
      if (context.mounted) context.pop();      // save then leave
    } else if (choice == 'discard') {
      if (context.mounted) context.pop();      // leave without saving
    }
    // 'keep' falls through and stays on the screen
  },
  child: orderScreenBody,
);`,
          pitfalls: [
            '**Using the deprecated `WillPopScope`.** Modern Flutter uses `PopScope` with `canPop` + `onPopInvokedWithResult`.',
            '**Always blocking back.** Only set `canPop: false` when there are real unsaved changes, or the dialog nags on every exit.',
            '**Calling `context.pop()` after an await without `mounted`.** Guard with `if (context.mounted)` to avoid using a dead context.',
            '**Confusing Update with Finalise.** Update keeps the order running; Finalise hands it to the settlement flow — never collapse the two.',
          ],
          tryIt:
            'Add Update and Finalise buttons, then wrap the screen in `PopScope`. Make a change, press back, and confirm the three-option dialog appears and each option behaves correctly.',
          takeaway:
            'Update saves the draft and stays running, Finalise moves to settlement, and `PopScope` guards against losing unsaved changes.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm6-p1',
      type: 'Mini Project',
      title: 'Running Orders Dashboard',
      domain: 'Restaurant POS',
      duration: '2 hours',
      description:
        'Build the staff home screen: a "New Order" flow with a walk-in vs room selector and a live, colour-coded list of running orders that resume on tap.',
      tools: ['Flutter', 'Firebase Firestore', 'Provider', 'go_router'],
      blueprint: {
        overview:
          'Recreate the TunMani Cafe home dashboard. Staff land here, start walk-in (auto-numbered) or room (typed number) orders, and see every running order as a live green/blue card they can tap to resume.',
        functionalRequirements: [
          '**New Order.** A button that opens a walk-in vs room selector.',
          '**Walk-in numbering.** Walk-ins get a unique ticket number from a transactional counter.',
          '**Room find-or-create.** Room orders resume an existing draft for that room number if one exists.',
          '**Live list.** A `StreamBuilder` over `running_orders` shows every draft.',
          '**Colour-coded cards.** Walk-in = dark green ticket, room = blue room number, each with an item/qty/subtotal summary.',
          '**Resume on tap.** Tapping a card opens that order via `go_router` with the order in `extra`.',
        ],
        technicalImplementation: [
          '**Models.** `RunningOrder` and `OrderItem` with `fromDoc`/`toMap`.',
          '**Counter.** `nextWalkinNo()` using `runTransaction` on `counters/walkin`.',
          '**Lookup.** `runningOrderForRoom()` querying `type` + `number` with `.get()`.',
          '**State.** `OrderProvider extends ChangeNotifier` holding the active order.',
          '**Navigation.** `go_router` `/order` route receiving the order via `extra`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Models & Firestore shape',
            outcome: 'RunningOrder and OrderItem models with serialization.',
            prompt:
              'Create Dart models `RunningOrder` (id, type enum walkin/room, number int, List<OrderItem> items, createdAt) and `OrderItem` (sku, name, unitPrice, qty) with `fromDoc` and `toMap`. They map to a Firestore `running_orders` collection where items are stored as a list of maps. Show me the full file.',
          },
          {
            step: 2,
            label: 'Walk-in counter & room lookup',
            outcome: 'Safe numbering and find-or-create helpers.',
            prompt:
              'Write `nextWalkinNo()` that atomically increments a `counters/walkin` document inside `runTransaction` and returns the new int. Then write `runningOrderForRoom(int roomNo)` that queries `running_orders` for `type == "room"` and `number == roomNo` using a one-time `.get()` and returns the existing `RunningOrder` or null. Add `openRoom(roomNo)` that finds-or-creates.',
          },
          {
            step: 3,
            label: 'Live dashboard with colour cards',
            outcome: 'Home screen with a StreamBuilder list of green/blue cards.',
            prompt:
              'Build `home_screen.dart` with a "New Order" button (opens a walk-in vs room selector dialog) and a `StreamBuilder` over `running_orders` ordered by `createdAt`. Render each order as a card: dark green "Ticket #n" for walk-ins, blue "Room n" for rooms, with a subtitle showing item count, total quantity, and subtotal computed from items. Handle error, loading, and empty states.',
          },
          {
            step: 4,
            label: 'Resume navigation',
            outcome: 'Tapping a card resumes the order via go_router.',
            prompt:
              'Add an `OrderProvider extends ChangeNotifier` holding the active `RunningOrder`. Wire each dashboard card’s tap to set the active order and `context.push("/order", extra: order)` using `go_router`. Define the `/order` route so it reads the `RunningOrder` from `state.extra`.',
          },
        ],
      },
    },
    {
      id: 'm6-p2',
      type: 'Mini Project',
      title: 'Order / Cart Screen with Live Search',
      domain: 'Restaurant POS',
      duration: '2 hours',
      description:
        'Build the order screen: a cart with +/- quantity and remove-on-zero, a live running total bar, a search-and-add panel over active SKUs, and Update/Finalise buttons guarded by `PopScope`.',
      tools: ['Flutter', 'Firebase Firestore', 'Provider'],
      blueprint: {
        overview:
          'Complete the cart experience. The waiter searches active dishes by code or name, taps + to add, adjusts quantities, watches a live total, and either saves the draft (Update) or moves to settlement (Finalise) — with an unsaved-changes guard on back.',
        functionalRequirements: [
          '**Cart list.** One row per item with name, unit price, and computed line total.',
          '**Quantity controls.** +/- buttons; decrementing to zero removes the item.',
          '**Running total.** A bar showing "{n} items · {qty} qty · ₹{subtotal}".',
          '**Live search.** A `TextField` filtering active SKUs by code or name as you type.',
          '**Add or increment.** A + button that adds the SKU or bumps its quantity, showing the in-cart count.',
          '**Update / Finalise.** Bottom buttons to save the draft or go to the finalise screen, with a `PopScope` unsaved-changes dialog.',
        ],
        technicalImplementation: [
          '**Provider mutations.** `increment`, `decrement` (remove-on-zero), `addOrIncrement`, `qtyOf`.',
          '**Computed totals.** Item count, total quantity, subtotal folded from the items list.',
          '**Stream + filter.** `StreamBuilder` over active SKUs, filtered in memory by the lowercased query.',
          '**Persistence.** `updateRunningItems(orderId, items)` writing the cart back to Firestore.',
          '**Guard.** `PopScope` with `canPop` and a Keep editing / Discard / Update dialog.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Cart with line totals & quantity',
            outcome: 'A cart list with +/- and remove-on-zero.',
            prompt:
              'Build a `CartList` widget reading the active order from `OrderProvider`. Each row shows item name, unit price, a computed line total (unitPrice * qty), and +/- buttons. Add `increment` and `decrement` to the provider where decrementing to zero removes the item. Call `notifyListeners()` after each change.',
          },
          {
            step: 2,
            label: 'Running total bar',
            outcome: 'A live summary bar at the bottom.',
            prompt:
              'Add a `RunningTotalBar` that computes item count (items.length), total quantity (sum of qty), and subtotal (sum of unitPrice * qty) from the active order, and renders the string "{n} items · {qty} qty · ₹{subtotal}". It must update live via Provider.',
          },
          {
            step: 3,
            label: 'Live search & add panel',
            outcome: 'Search active SKUs by code or name and add to cart.',
            prompt:
              'Build a `SearchAddPanel` with a `TextField` and a `StreamBuilder` over `skus` where `active == true`. Filter the streamed list in memory by lowercased code-or-name match against the query. Each result has a + button that adds the SKU to the cart or increments it if already present, and shows the current in-cart quantity.',
          },
          {
            step: 4,
            label: 'Update / Finalise & PopScope',
            outcome: 'Save the draft or move to settlement, guarded on back.',
            prompt:
              'Add bottom Update and Finalise buttons. Update calls `updateRunningItems(orderId, items)` and returns to the dashboard; Finalise navigates to `/finalise`. Wrap the screen in `PopScope` with `canPop: !hasUnsavedChanges` and an `onPopInvokedWithResult` dialog offering Keep editing / Discard / Update, guarding async pops with `context.mounted`.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm6-q1',
      q: 'Why does the home dashboard use a StreamBuilder over the running_orders collection instead of a one-time fetch with a refresh button?',
      options: [
        'Because StreamBuilder is faster to type',
        'So every waiter’s screen updates live the instant any order changes, with no manual refresh',
        'Because Firestore does not support one-time reads',
        'To reduce the number of Firestore documents',
      ],
      answer: 1,
    },
    {
      id: 'm6-q2',
      q: 'How are walk-in ticket numbers assigned uniquely even when two waiters start orders at the same moment?',
      options: [
        'By counting documents in running_orders and adding one',
        'By using the device clock as the number',
        'By incrementing a counter document inside a Firestore transaction (nextWalkinNo)',
        'By asking the waiter to type a number',
      ],
      answer: 2,
    },
    {
      id: 'm6-q3',
      q: 'What does runningOrderForRoom() do before a room order is created?',
      options: [
        'It prints the room’s previous bills',
        'It checks whether a running order already exists for that room so the waiter resumes it instead of duplicating',
        'It locks the room for one hour',
        'It assigns an automatic room number',
      ],
      answer: 1,
    },
    {
      id: 'm6-q4',
      q: 'In the cart, what happens when a waiter decrements an item’s quantity to zero?',
      options: [
        'The item stays in the cart showing × 0',
        'The whole order is deleted',
        'The item is removed from the order entirely',
        'The quantity wraps around to the maximum',
      ],
      answer: 2,
    },
    {
      id: 'm6-q5',
      q: 'How is the order subtotal in the running total bar obtained?',
      options: [
        'It is stored on the running order document and read directly',
        'It is computed by folding over the items list summing unitPrice × qty',
        'It is fetched from the orders collection',
        'It is entered manually by the waiter',
      ],
      answer: 1,
    },
    {
      id: 'm6-q6',
      q: 'What is the difference between the Update and Finalise buttons on the order screen?',
      options: [
        'Update deletes the order; Finalise saves it',
        'They do the same thing',
        'Update saves the draft and keeps the order running; Finalise moves to the settlement (finalise) screen',
        'Update prints the bill; Finalise emails it',
      ],
      answer: 2,
    },
  ],
};
