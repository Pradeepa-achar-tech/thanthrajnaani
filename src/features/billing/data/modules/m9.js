// Module 9 — Admin Panel & Analytics (Capstone)
// TunMani Cafe Billing (Flutter POS) course content for the React course player.

export const m9 = {
  id: 'm9',
  title: 'Admin Panel & Analytics',
  hours: 8,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'Build the entire admin side of TunMani Cafe — dashboard analytics, paginated order history with filters and exports, post-bill edits with an audit log, user management — then ship a signed, secured release.',
  sections: [
    {
      id: 'm9-s1',
      title: 'Admin Hub & Dashboard',
      topics: [
        {
          id: 'm9-t1',
          title: 'The Admin Hub Screen',
          explain:
            'Build admin_screen.dart as a simple hub that routes the owner to the seven admin sections: Dashboard, All Orders, Printer, Users, Settings, and exports.',
          analogy:
            'The TunMani Cafe owner does not stand at the billing counter all evening — he has a small back office with a board of labelled keys: one for the accounts ledger, one for the staff register, one for the printer cupboard. The admin hub is that key board: a single tidy screen of big tappable tiles, each opening one well-defined back-office task, so nothing is buried three menus deep.',
          theory:
            'The **`screens/admin/admin_screen.dart`** hub is intentionally dumb: a grid or list of **tiles**, each with an icon, a label, and an `onTap` that pushes one admin sub-screen. Typical seven sections: **Dashboard**, **All Orders**, **Order/Bill settings**, **Printer Setup**, **User Management**, **Store Settings**, and **Exports** (or these can be folded into the screens they belong to).\n\nThe hub should be **role-gated**: only an admin/owner role reaches it. You check the signed-in user\'s role (from your auth/whitelist) and either show the hub or block with a message. This pairs with the Firestore rules you write at go-live.\n\nKeep navigation explicit with named routes or `Navigator.push`. Because each tile maps to one screen, the hub stays trivially easy to extend — add a tile, point it at a screen, done. Use a `GridView` of `Card`s for a clean, thumb-friendly layout on a phone held behind the counter.',
          whyItMatters:
            'A clear hub is what makes the admin side usable by a non-technical owner. Centralizing entry points (and the role gate) in one screen keeps the rest of the admin code focused and keeps unauthorized staff out of sensitive screens.',
          steps: [
            'Create `screens/admin/admin_screen.dart`.',
            'Define a list of admin sections (icon, label, builder/route).',
            'Render them as a `GridView` of tappable `Card`s.',
            'Gate the whole screen behind an admin-role check.',
            'Wire each tile to push its sub-screen.',
            'Add an AppBar title "Admin".',
            'Confirm a non-admin user cannot reach it.',
          ],
          code: `class AdminSection {
  const AdminSection(this.icon, this.label, this.builder);
  final IconData icon;
  final String label;
  final WidgetBuilder builder;
}

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key, required this.isAdmin});
  final bool isAdmin;

  @override
  Widget build(BuildContext context) {
    if (!isAdmin) {
      return const Scaffold(
        body: Center(child: Text('Admins only')),
      );
    }
    final sections = <AdminSection>[
      AdminSection(Icons.dashboard, 'Dashboard', (_) => const DashboardScreen()),
      AdminSection(Icons.receipt_long, 'All Orders', (_) => const AllOrdersScreen()),
      AdminSection(Icons.print, 'Printer', (_) => const PrinterScreen()),
      AdminSection(Icons.people, 'Users', (_) => const UserManagerScreen()),
      AdminSection(Icons.store, 'Store', (_) => const StoreSettingsScreen()),
      AdminSection(Icons.confirmation_number, 'Bill No', (_) => const BillNoScreen()),
      AdminSection(Icons.ios_share, 'Exports', (_) => const ExportsScreen()),
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('Admin')),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(12),
        children: [
          for (final s in sections)
            Card(
              child: InkWell(
                onTap: () => Navigator.push(
                  context, MaterialPageRoute(builder: s.builder)),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [Icon(s.icon, size: 40), Text(s.label)],
                ),
              ),
            ),
        ],
      ),
    );
  }
}`,
          pitfalls: [
            '**No role gate on the hub.** Any staff member reaches admin screens. Fix: check the admin role before rendering.',
            '**Putting business logic in the hub.** It should only route. Fix: keep each task in its own screen.',
            '**Deeply nested menus.** Owners get lost. Fix: one flat grid of tiles.',
            '**Hard-coded navigation everywhere.** Hard to maintain. Fix: a section list drives the grid.',
            '**Tiny tap targets.** Hard to use behind a busy counter. Fix: large cards.',
            '**Relying only on UI gating.** UI checks are not security. Fix: back it with Firestore rules.',
          ],
          tryIt:
            'Build the hub with seven tiles. Log in as an admin and confirm every tile opens its screen. Then flip your test user to a non-admin role and confirm the hub shows "Admins only". This proves both navigation and the role gate work before you add real data.',
          takeaway:
            'The admin hub is a flat, role-gated grid of tiles that route to focused sub-screens — keep it dumb and central.',
        },
        {
          id: 'm9-t2',
          title: 'Date-Filtered Revenue Card',
          explain:
            'Build the dashboard\'s headline revenue card: total revenue, bill count, and average bill for a chosen date range.',
          analogy:
            'At the end of a TunMani Cafe evening the owner asks one question first: "How much did we make today?" The revenue card answers exactly that — total takings, how many bills, and the average per bill — and lets him swing the date picker to "this week" or a custom range, like flipping back through pages of the cash register. It is the heartbeat number of the whole business.',
          theory:
            'The **`screens/admin/dashboard_screen.dart`** centers on a **revenue card** driven by a **date range**. You query orders where `createdAt` falls in `[start, end)` and the status is `PAID` (exclude deleted/void), then aggregate: **total revenue** = sum of `total`, **bill count** = number of orders, **average bill** = total ÷ count (guard against divide-by-zero).\n\nThe date range is a small piece of state with presets — **Today**, **This Week**, **This Month**, **Custom** (via `showDateRangePicker`). Changing it re-runs the query. For a small restaurant, querying the filtered orders and aggregating client-side is perfectly fine; for large volumes you would precompute daily rollups.\n\nKeep the aggregation in a pure function `summarize(List<Order>)` returning a small `DashboardSummary` (revenue, count, average) so it is testable and reused by the summary cards. Format money consistently with the rest of the app.',
          whyItMatters:
            'This is the number the owner checks first, every single day. If the date filter or the PAID-only rule is wrong, every business decision built on it is wrong. Getting this card right is the foundation of trust in the whole analytics screen.',
          steps: [
            'Create `dashboard_screen.dart` with a date-range selector (Today/Week/Month/Custom).',
            'Query PAID orders where `createdAt` is in the range.',
            'Write `summarize(orders)` returning revenue, count, average.',
            'Guard average against zero bills.',
            'Render a card with the three figures.',
            'Re-run the query when the range changes.',
            'Format all money consistently.',
          ],
          code: `class DashboardSummary {
  const DashboardSummary(this.revenue, this.count, this.average);
  final double revenue;
  final int count;
  final double average;
}

DashboardSummary summarize(List<Order> orders) {
  final paid = orders.where((o) => o.status == 'PAID').toList();
  final revenue = paid.fold<double>(0, (sum, o) => sum + o.total);
  final count = paid.length;
  final average = count == 0 ? 0.0 : revenue / count;
  return DashboardSummary(revenue, count, average);
}

// --- dashboard_screen.dart: querying a date range ---
Query<Order> ordersInRange(DateTime start, DateTime end) {
  return ordersRef
      .where('createdAt', isGreaterThanOrEqualTo: start)
      .where('createdAt', isLessThan: end)
      .where('status', isEqualTo: 'PAID');
}

// Revenue card UI:
// Column(children: [
//   Text('Revenue', style: ...),
//   Text(money(summary.revenue), style: bigBold),
//   Text('\${summary.count} bills · avg \${money(summary.average)}'),
// ]);`,
          pitfalls: [
            '**Including deleted/void orders in revenue.** Inflates takings. Fix: filter status == PAID.',
            '**Dividing by zero for the average.** Crashes on an empty day. Fix: guard `count == 0`.',
            '**Off-by-one date ranges.** Today\'s last bill drops out. Fix: use `[start, nextDay)` half-open ranges.',
            '**Local vs UTC timestamp mismatch.** Bills land in the wrong day. Fix: be consistent about the timezone of `createdAt`.',
            '**Re-querying on every rebuild.** Wasteful reads. Fix: query only when the range changes.',
            '**Aggregating in the widget tree.** Untestable. Fix: a pure `summarize` function.',
          ],
          tryIt:
            'Build the revenue card with a Today/Week/Custom selector. Bill a few orders today, then check the card matches your manual sum. Switch to a custom range that excludes today and confirm revenue drops to zero. Void one bill and confirm it disappears from the total — proving the PAID-only filter works.',
          takeaway:
            'The revenue card aggregates PAID orders over a half-open date range into revenue, count, and a divide-safe average.',
        },
        {
          id: 'm9-t3',
          title: 'Payment-Type Breakdown Cards',
          explain:
            'Show CASH/CARD/UPI/CREDIT totals as four tappable cards, each filtering All Orders to that payment type.',
          analogy:
            'The TunMani Cafe owner also wants to know how the money came in: how much cash is in the drawer to count, how much went to card, how much by UPI, and how much is still owed on credit. Four little cards split the evening\'s takings into those buckets — and tapping any one walks him straight to the matching list of bills, like pulling just the UPI slips out of the spike.',
          theory:
            'From the same filtered PAID orders, **group by `paymentType`** into the four buckets: **CASH**, **CARD**, **UPI**, **CREDIT**. Sum the `total` per bucket. Render four cards, each showing the type and its sum (and optionally a count).\n\nMake each card **tappable**: on tap, navigate to **All Orders** pre-filtered to that payment type. This is the "drill-down" pattern — the dashboard is a summary, and tapping any figure takes you to the underlying rows. Pass the filter through the route arguments so All Orders opens already scoped.\n\nCompute the grouping with a simple fold into a `Map<String, double>`, defaulting missing buckets to zero so all four cards always render even on a quiet day. Keep CREDIT visible — unpaid/credit bills are a real cash-flow concern the owner watches closely.',
          whyItMatters:
            'Cash-drawer reconciliation at close depends on the CASH figure; chasing credit depends on the CREDIT figure. The tap-to-filter drill-down turns a glanceable summary into an actionable list, which is what makes the dashboard a daily tool rather than a static report.',
          steps: [
            'Group the filtered PAID orders by `paymentType` into a `Map<String, double>`.',
            'Default all four buckets to zero so every card renders.',
            'Render CASH/CARD/UPI/CREDIT cards with their sums.',
            'Make each card tappable.',
            'On tap, push All Orders with a paymentType filter argument.',
            'Confirm All Orders opens already scoped.',
            'Optionally show a per-bucket bill count.',
          ],
          code: `Map<String, double> byPaymentType(List<Order> orders) {
  final buckets = <String, double>{
    'CASH': 0, 'CARD': 0, 'UPI': 0, 'CREDIT': 0,
  };
  for (final o in orders.where((o) => o.status == 'PAID')) {
    buckets[o.paymentType] = (buckets[o.paymentType] ?? 0) + o.total;
  }
  return buckets;
}

// --- dashboard_screen.dart: four tappable cards ---
Widget paymentCard(BuildContext context, String type, double amount) {
  return Card(
    child: InkWell(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => AllOrdersScreen(initialPaymentType: type),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(children: [
          Text(type, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text(money(amount)),
        ]),
      ),
    ),
  );
}`,
          pitfalls: [
            '**Omitting buckets with zero bills.** A quiet UPI day shows no card. Fix: seed all four buckets at zero.',
            '**Hiding CREDIT.** Owner loses sight of dues. Fix: always show it.',
            '**Cards not tappable.** No drill-down. Fix: wrap in InkWell with navigation.',
            '**Not passing the filter to All Orders.** Tap leads to an unfiltered list. Fix: pass `initialPaymentType`.',
            '**Mismatched type strings.** "Cash" vs "CASH" splits buckets. Fix: a single source of payment-type constants.',
            '**Recomputing on every frame.** Wasteful. Fix: compute once per data load.',
          ],
          tryIt:
            'Render the four payment cards from real data and confirm their sum equals the revenue card total. Tap the UPI card and verify All Orders opens showing only UPI bills. Add a credit bill and watch the CREDIT card update — proving both the grouping and the drill-down.',
          takeaway:
            'Group PAID orders by payment type into four always-present, tappable cards that drill into a pre-filtered All Orders.',
        },
        {
          id: 'm9-t4',
          title: 'Summary Cards: Highest Bill, Items Sold, GST Collected',
          explain:
            'Round out the dashboard with secondary metrics: highest bill, average bill, total items sold, and GST collected over the range.',
          analogy:
            'Beyond "how much did we make", the TunMani Cafe owner likes a few more pulse-checks: what was the biggest single table tonight, how many plates left the kitchen, and how much GST he owes the government this period. These summary cards are the small dials around the big revenue gauge — quick context that helps him spot a record night or a busy-but-low-margin one.',
          theory:
            'Add a row of **summary cards** computed from the same filtered orders: **highest bill** (`orders.map(total).reduce(max)`, guarded for empty), **average bill** (reuse the dashboard summary), **items sold** (sum of all `item.qty` across all orders\' item lists), and **GST collected** (sum of `cgst + sgst`).\n\nEach is a small pure computation. Items sold needs a nested fold — for each order, sum its items\' quantities, then sum across orders. GST collected is the government\'s share you must remit, so it is genuinely useful at filing time.\n\nGuard every reducer against an **empty list** (no bills in range) so the dashboard renders zeros instead of crashing. Keep all these in a single `DashboardMetrics` object built once, so the cards are pure presentation. Consistent money/number formatting ties the whole screen together.',
          whyItMatters:
            'These secondary metrics turn the dashboard from a single number into a real management view: GST collected feeds tax filing, items sold hints at kitchen load, and highest bill flags record nights. Computing them safely (empty-guarded, from PAID orders) keeps the screen reliable every day, including slow ones.',
          steps: [
            'Compute highest bill with a guarded `reduce(max)`.',
            'Reuse the average from the dashboard summary.',
            'Compute items sold via a nested fold over order items.',
            'Compute GST collected as the sum of cgst + sgst.',
            'Bundle them into a `DashboardMetrics` object.',
            'Render a card per metric with consistent formatting.',
            'Guard all reducers against an empty order list.',
          ],
          code: `class DashboardMetrics {
  const DashboardMetrics({
    required this.highestBill,
    required this.average,
    required this.itemsSold,
    required this.gstCollected,
  });
  final double highestBill;
  final double average;
  final int itemsSold;
  final double gstCollected;
}

DashboardMetrics metricsFor(List<Order> orders) {
  final paid = orders.where((o) => o.status == 'PAID').toList();
  if (paid.isEmpty) {
    return const DashboardMetrics(
      highestBill: 0, average: 0, itemsSold: 0, gstCollected: 0);
  }
  final totals = paid.map((o) => o.total);
  final highest = totals.reduce((a, b) => a > b ? a : b);
  final revenue = totals.fold<double>(0, (s, t) => s + t);
  final itemsSold = paid.fold<int>(
      0, (s, o) => s + o.items.fold<int>(0, (n, i) => n + i.qty));
  final gst = paid.fold<double>(0, (s, o) => s + o.cgst + o.sgst);

  return DashboardMetrics(
    highestBill: highest,
    average: revenue / paid.length,
    itemsSold: itemsSold,
    gstCollected: gst,
  );
}`,
          pitfalls: [
            '**reduce() on an empty list.** Throws. Fix: early-return zeros when empty.',
            '**Counting items as order count.** Wrong figure. Fix: nested fold over item quantities.',
            '**Mixing in voided orders.** Skews GST owed. Fix: PAID only.',
            '**Recomputing per card.** Wasteful. Fix: one `DashboardMetrics` build.',
            '**Inconsistent rounding on GST.** Filing mismatch. Fix: round consistently with the rest of the app.',
            '**No empty-state UI.** Blank cards confuse. Fix: show zeros clearly.',
          ],
          tryIt:
            'Add the four summary cards. Bill several orders, then verify highest bill matches your largest order and items sold matches the total plates billed. Cross-check GST collected against the CGST+SGST printed on those receipts. Switch to an empty date range and confirm everything shows zero without crashing.',
          takeaway:
            'Build secondary metrics (highest bill, items sold, GST collected) as empty-guarded pure computations from PAID orders.',
        },
      ],
    },
    {
      id: 'm9-s2',
      title: 'Order History & Exports',
      topics: [
        {
          id: 'm9-t5',
          title: 'Cursor Pagination with Load-More',
          explain:
            'Build all_orders_screen.dart with server-side cursor pagination — 25 orders per page, loading the next page as the user scrolls.',
          analogy:
            'The TunMani Cafe bill book has thousands of pages by now — nobody photocopies the whole book to read the last few entries. Instead the manager opens to the most recent page and flips back 25 bills at a time as he scrolls. Cursor pagination is that: fetch one page, remember the last bill you saw, and ask Firestore for the next 25 "after this one" only when the owner scrolls down.',
          theory:
            '**Cursor pagination** fetches a fixed page (here **25**) ordered by `createdAt` descending, and uses the **last document** of one page as the cursor (`startAfterDocument`) for the next. Unlike offset pagination, it stays fast no matter how deep you scroll, and Firestore bills you only for the documents you actually read.\n\nThe state: the current `List<Order>`, the **last `DocumentSnapshot`** (the cursor), a `hasMore` flag, and an `isLoading` guard. The first load runs the base query with `.limit(25)`. **Load-more** appends another 25 `startAfterDocument(lastDoc)`, updates the cursor, and sets `hasMore = false` when a page returns fewer than 25.\n\nTrigger load-more from a `ScrollController` near the bottom, or a "Load more" button. Guard against double-loading with the `isLoading` flag. Keep the query building separate so filters (next topic) can be layered on before pagination.',
          whyItMatters:
            'Loading every order at once would be slow, expensive, and would crash on a year of data. Cursor pagination keeps the order history instant and cheap whether the restaurant has 50 bills or 50,000 — essential for a screen the owner opens daily.',
          steps: [
            'Create `all_orders_screen.dart` with a base query ordered by `createdAt` desc.',
            'Load the first page with `.limit(25)` and store the last snapshot as the cursor.',
            'Track `orders`, `lastDoc`, `hasMore`, and `isLoading` in state.',
            'Add a `ScrollController` that triggers load-more near the bottom.',
            'Load-more appends `startAfterDocument(lastDoc).limit(25)`.',
            'Set `hasMore = false` when a page returns fewer than 25.',
            'Guard re-entry with `isLoading`.',
          ],
          code: `class _AllOrdersState extends State<AllOrdersScreen> {
  final _orders = <Order>[];
  DocumentSnapshot? _lastDoc;
  bool _hasMore = true;
  bool _isLoading = false;
  static const _pageSize = 25;

  Query<Map<String, dynamic>> _baseQuery() =>
      ordersCollection.orderBy('createdAt', descending: true);

  Future<void> loadMore() async {
    if (_isLoading || !_hasMore) return;
    setState(() => _isLoading = true);

    var q = _baseQuery().limit(_pageSize);
    if (_lastDoc != null) q = q.startAfterDocument(_lastDoc!);

    final snap = await q.get();
    if (snap.docs.isNotEmpty) _lastDoc = snap.docs.last;
    _orders.addAll(snap.docs.map((d) => Order.fromDoc(d)));

    setState(() {
      _hasMore = snap.docs.length == _pageSize;
      _isLoading = false;
    });
  }

  @override
  void initState() {
    super.initState();
    loadMore(); // first page
  }
}`,
          pitfalls: [
            '**Offset pagination.** Slows down and over-reads deep into the list. Fix: cursor with `startAfterDocument`.',
            '**Forgetting the orderBy before the cursor.** Cursors require a stable order. Fix: always order by createdAt descending.',
            '**No isLoading guard.** Scrolling fires many overlapping loads. Fix: a boolean re-entry guard.',
            '**hasMore never turning false.** Infinite spinner. Fix: set false when a page is short.',
            '**Reading all docs to count.** Defeats pagination. Fix: do not count; paginate.',
            '**Losing the cursor on rebuild.** Re-fetches page one. Fix: keep `lastDoc` in state, not in build.',
          ],
          tryIt:
            'Seed 60+ test orders. Open All Orders and confirm only 25 load initially, with more appearing as you scroll. Watch your Firestore reads in the console — they should grow in steps of 25, not all at once. Scroll to the very end and confirm the spinner stops (hasMore false).',
          takeaway:
            'Paginate order history with a 25-per-page cursor using startAfterDocument, guarded against double-loads, with a hasMore flag.',
        },
        {
          id: 'm9-t6',
          title: 'Filters: Date, Payment, Order Type & Status',
          explain:
            'Layer filters onto the order query — date range (All/Today/Week/Custom), payment type, order type (TABLE/COUNTER/WALKIN/ROOM), and status (PAID/DELETED).',
          analogy:
            'When the auditor asks "show me all the room-service UPI bills from last week", the TunMani Cafe manager does not read every page — he applies a few filters and the book narrows itself. Your All Orders screen offers the same dials: pick a date range, a payment type, an order type, and a status, and the query returns only the matching bills, still paginated.',
          theory:
            'Filters are **`where` clauses** added to the base query *before* pagination. The four dials: **date range** (`createdAt` between start/end — presets All/Today/Week/Custom), **payment type** (`paymentType == X`), **order type** (`orderType == TABLE/COUNTER/WALKIN/ROOM`), and **status** (`status == PAID` or `DELETED`).\n\nKey rule: when you change any filter, you must **reset pagination** — clear `orders`, null the `lastDoc` cursor, and reload page one. Otherwise you append filtered results to stale unfiltered ones.\n\nFirestore needs a **composite index** for queries that combine a range (`createdAt`) with equality filters and an `orderBy`. The console gives you a one-click "create index" link the first time such a query runs — accept it. Keep filters in a small `OrderFilter` value object so the screen, the dashboard drill-downs, and exports all describe a query the same way. The dashboard passing `initialPaymentType` (previous section) is just a pre-set `OrderFilter`.',
          whyItMatters:
            'Filters turn a flat history into an answer machine for the owner and auditor. Doing them server-side (not filtering an already-loaded list) is what keeps them correct across the full dataset and cheap on reads, while resetting pagination on change prevents subtly wrong, mixed result lists.',
          steps: [
            'Define an `OrderFilter` (dateRange, paymentType, orderType, status).',
            'Build the query: start from the collection, add each active `where`.',
            'Add an orderBy on createdAt descending and the page limit.',
            'On any filter change, clear orders, null the cursor, reload page one.',
            'Accept the composite-index link Firestore prompts for.',
            'Reuse `OrderFilter` for dashboard drill-downs and exports.',
            'Show active filters as chips the user can clear.',
          ],
          code: `class OrderFilter {
  const OrderFilter({
    this.start, this.end, this.paymentType, this.orderType, this.status,
  });
  final DateTime? start;
  final DateTime? end;
  final String? paymentType; // CASH/CARD/UPI/CREDIT
  final String? orderType;   // TABLE/COUNTER/WALKIN/ROOM
  final String? status;      // PAID/DELETED
}

Query<Map<String, dynamic>> buildQuery(OrderFilter f) {
  Query<Map<String, dynamic>> q = ordersCollection;
  if (f.status != null) q = q.where('status', isEqualTo: f.status);
  if (f.paymentType != null) q = q.where('paymentType', isEqualTo: f.paymentType);
  if (f.orderType != null) q = q.where('orderType', isEqualTo: f.orderType);
  if (f.start != null) q = q.where('createdAt', isGreaterThanOrEqualTo: f.start);
  if (f.end != null) q = q.where('createdAt', isLessThan: f.end);
  return q.orderBy('createdAt', descending: true);
}

// On filter change: reset pagination, then reload.
void applyFilter(OrderFilter f) {
  setState(() {
    _filter = f;
    _orders.clear();
    _lastDoc = null;
    _hasMore = true;
  });
  loadMore();
}`,
          pitfalls: [
            '**Filtering an already-loaded page in memory.** Misses unloaded matches. Fix: filter in the query.',
            '**Not resetting pagination on filter change.** Mixes old and new results. Fix: clear orders + cursor.',
            '**Ignoring the composite-index error.** The query just fails. Fix: click the console link to create it.',
            '**Range + orderBy on different fields.** Firestore forbids it. Fix: range and first orderBy on the same field (`createdAt`).',
            '**Too many simultaneous equality filters without indexes.** Slow setup. Fix: create the suggested indexes.',
            '**No way to clear filters.** Users get stuck. Fix: filter chips with a clear action.',
          ],
          tryIt:
            'Add the four filters. Apply "Today + UPI + TABLE + PAID" and confirm the list narrows and still paginates. The first time, follow Firestore\'s console link to create the composite index, wait for it to build, and retry. Change a filter and confirm the list resets to page one rather than appending.',
          takeaway:
            'Apply filters as server-side where-clauses before pagination, reset the cursor on every change, and create the composite indexes Firestore asks for.',
        },
        {
          id: 'm9-t7',
          title: 'Export a ZIP of Per-Bill PDFs',
          explain:
            'Build order_export.dart that generates one PDF per filtered bill, zips them with the archive package, and shares the ZIP via share_plus.',
          analogy:
            'When the accountant wants the whole month\'s bills, the TunMani Cafe manager does not WhatsApp 300 separate PDFs — he bundles them into one folder and hands it over. The `archive` package is that folder: it gathers a PDF for every filtered bill into a single .zip the owner can share or email in one tap.',
          theory:
            'Reusing **`buildBillPdf`** from Module 8, you generate a PDF per order in the current filtered set, then bundle them with the **`archive`** package. Build an `Archive`, add each PDF as an `ArchiveFile(name, length, bytes)` (name it `bill_<billNo>.pdf`), then `ZipEncoder().encode(archive)` to get the ZIP bytes.\n\nWrite the ZIP to a temp file via `path_provider` and share it with **`share_plus`** `Share.shareXFiles`, exactly like a single PDF. Name it meaningfully, e.g. `tunmani_bills_<from>_<to>.zip`.\n\nFor large exports, generating hundreds of PDFs is heavy — do it off the main isolate or show a progress indicator, and cap the export to the active filter (the user already narrowed it). Put all of this in **`utils/order_export.dart`** as `exportBillsZip(orders)`. Because it consumes the same `Order` list the filter produced, it always exports exactly what the owner sees.',
          whyItMatters:
            'Bulk export is what an accountant or auditor actually needs at month-end. Reusing the existing PDF builder guarantees the exported bills match the printed ones, and zipping keeps a 300-bill handover to a single shareable file.',
          steps: [
            'Add `archive` to `pubspec.yaml`.',
            'For each filtered order, build its PDF via `buildBillPdf`.',
            'Create an Archive and add each PDF as an ArchiveFile named bill_<n>.pdf.',
            'Encode with `ZipEncoder()`.',
            'Write the ZIP to a temp file with path_provider.',
            'Share it via `Share.shareXFiles`.',
            'Show progress and cap to the active filter.',
          ],
          code: `import 'package:archive/archive.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

Future<void> exportBillsZip(List<Order> orders, Store store) async {
  final archive = Archive();

  for (final order in orders) {
    final pdfBytes = await buildBillPdf(order, store); // reuse Module 8
    archive.addFile(ArchiveFile(
      'bill_\${order.billNo}.pdf',
      pdfBytes.length,
      pdfBytes,
    ));
  }

  final zipBytes = ZipEncoder().encode(archive)!;
  final dir = await getTemporaryDirectory();
  final file = File('\${dir.path}/tunmani_bills.zip');
  await file.writeAsBytes(zipBytes);

  await Share.shareXFiles(
    [XFile(file.path)],
    text: 'TunMani Cafe bills export (\${orders.length} bills)',
  );
}`,
          pitfalls: [
            '**Sharing PDFs one by one.** Floods the recipient. Fix: bundle into one ZIP.',
            '**Generating all PDFs on the UI thread.** Freezes the app. Fix: show progress / use an isolate for big sets.',
            '**Exporting the whole database.** Huge and slow. Fix: export only the active filter.',
            '**Duplicate file names in the archive.** Some get overwritten. Fix: unique bill-number names.',
            '**Forgetting the null-check on encode.** `encode` returns nullable. Fix: assert or handle null.',
            '**Re-implementing PDF layout.** Drifts from printed bills. Fix: reuse `buildBillPdf`.',
          ],
          tryIt:
            'Filter to a small set (say today\'s bills) and run `exportBillsZip`. Share the ZIP to yourself, unzip it on a computer, and confirm there is one correctly named PDF per bill, each matching its receipt. Then widen the filter and watch the progress indicator while a larger ZIP builds.',
          takeaway:
            'Export the active filter as a ZIP of per-bill PDFs using the archive package, reusing buildBillPdf and sharing via share_plus.',
        },
        {
          id: 'm9-t8',
          title: 'Export an Excel .xlsx Summary',
          explain:
            'Generate an Excel spreadsheet of the filtered bills with the excel package — columns Sl No, Order ID, Date, Taxable, SGST, CGST, Total, Status — and share it.',
          analogy:
            'The accountant does not want 300 PDFs to add up by hand — she wants one spreadsheet she can sort, sum, and paste into the GST return. The `excel` package builds that ledger: one row per bill with neat columns for the taxable value, the tax split, and the total, ready to open in any spreadsheet app.',
          theory:
            'The **`excel`** package builds `.xlsx` files in Dart. Create an `Excel` workbook, grab a sheet, write a **header row** (Sl No, Order ID, Date, Taxable, SGST, CGST, Total, Status), then one **data row per filtered order**.\n\n**Taxable** is the pre-tax value (`subTotal`), then **SGST** and **CGST** separately, then **Total** and **Status** (PAID/DELETED). Use `CellValue` types (`TextCellValue`, `DoubleCellValue`) so numbers stay numeric for the accountant\'s formulas — do not write money as strings.\n\nEncode with `excel.encode()` (returns `List<int>?`), write to a temp file, and share via **`share_plus`**. Name it `tunmani_bills_<range>.xlsx`. Like the ZIP, this consumes the same filtered `Order` list, so the spreadsheet always matches what the owner filtered to. Put it in `utils/order_export.dart` as `exportBillsExcel(orders)`.',
          whyItMatters:
            'A numeric, columned spreadsheet is what makes GST filing and reconciliation possible without re-keying. Splitting taxable/SGST/CGST per row maps directly to the tax return, turning the app from a billing tool into a bookkeeping aid the accountant actually wants.',
          steps: [
            'Add `excel` to `pubspec.yaml`.',
            'Create an `Excel` workbook and select a sheet.',
            'Write the header row: Sl No, Order ID, Date, Taxable, SGST, CGST, Total, Status.',
            'Write one row per filtered order with numeric cell values.',
            'Encode with `excel.encode()`.',
            'Write to a temp file and share via share_plus.',
            'Name the file with the date range.',
          ],
          code: `import 'package:excel/excel.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

Future<void> exportBillsExcel(List<Order> orders) async {
  final excel = Excel.createExcel();
  final sheet = excel['Bills'];

  sheet.appendRow([
    TextCellValue('Sl No'), TextCellValue('Order ID'),
    TextCellValue('Date'), TextCellValue('Taxable'),
    TextCellValue('SGST'), TextCellValue('CGST'),
    TextCellValue('Total'), TextCellValue('Status'),
  ]);

  for (var i = 0; i < orders.length; i++) {
    final o = orders[i];
    sheet.appendRow([
      IntCellValue(i + 1),
      TextCellValue(o.id),
      TextCellValue(fmtDate(o.createdAt)),
      DoubleCellValue(o.subTotal),   // taxable value
      DoubleCellValue(o.sgst),
      DoubleCellValue(o.cgst),
      DoubleCellValue(o.total),
      TextCellValue(o.status),
    ]);
  }

  final bytes = excel.encode()!;
  final dir = await getTemporaryDirectory();
  final file = File('\${dir.path}/tunmani_bills.xlsx');
  await file.writeAsBytes(bytes);
  await Share.shareXFiles([XFile(file.path)], text: 'TunMani Cafe bills (xlsx)');
}`,
          pitfalls: [
            '**Writing amounts as text.** Breaks the accountant\'s SUM formulas. Fix: use `DoubleCellValue`/`IntCellValue`.',
            '**Combining tax into one column.** GST filing needs the split. Fix: separate SGST and CGST columns.',
            '**No header row.** The sheet is unreadable. Fix: write headers first.',
            '**Inconsistent date format.** Sorting breaks. Fix: one date formatter, ideally ISO-friendly.',
            '**Ignoring the nullable encode result.** Crash on null. Fix: handle/assert `encode()`.',
            '**Exporting unfiltered data.** Mismatch with the view. Fix: pass the filtered `orders` list.',
          ],
          tryIt:
            'Run `exportBillsExcel` on a filtered set and open the .xlsx. Confirm Taxable + SGST + CGST equals Total in each row, that the amounts are real numbers (try a SUM on the Total column), and that the row count matches your filtered list. This proves the export is bookkeeping-ready.',
          takeaway:
            'Export filtered bills as a numeric .xlsx with split Taxable/SGST/CGST columns using the excel package, shared via share_plus.',
        },
      ],
    },
    {
      id: 'm9-s3',
      title: 'Order Detail, Post-Bill Edits & Audit Log',
      topics: [
        {
          id: 'm9-t9',
          title: 'Read-Only Order Detail View',
          explain:
            'Build order_detail_screen.dart as a faithful, read-only rendering of a finalized bill — the same information that printed.',
          analogy:
            'When the TunMani Cafe owner taps a bill in the history, he wants to *see* it exactly as it was handed to the customer — every item, the tax, the total, how it was paid — not an editable form he might fat-finger. The order detail screen is that framed copy on the wall: look, do not casually touch; edits are a deliberate, separate action.',
          theory:
            'The **`screens/admin/order_detail_screen.dart`** loads one stored `Order` and renders it **read-only**: header (store, bill no, date, attended-by), the item table, CGST/SGST, grand total, payment type, and order/room metadata. It mirrors the receipt so there is one mental model across paper, PDF, and screen.\n\nKeeping it read-only by default is a deliberate safety choice: a finalized bill is a financial record. Any change must go through an explicit **admin edit dialog** (next topic) — never inline editing where a stray tap alters a total.\n\nThis screen is also the **action hub** for a past bill: it hosts Reprint, Share PDF, Save PDF (from Module 8), the admin **Edit** action, and a view of the **edit log** (audit trail). Load the full order document so nothing is missing, and show the status (PAID/DELETED) prominently so a voided bill is never mistaken for a live one.',
          whyItMatters:
            'A read-only detail view protects the integrity of finalized bills while still giving the owner everything in one place — view, reprint, share, and a clearly separated edit path. It is the screen that ties Module 8\'s outputs and this module\'s edits and audit log together.',
          steps: [
            'Create `order_detail_screen.dart` taking a stored `Order`.',
            'Render the header, items, tax, total, and payment read-only.',
            'Show the status badge (PAID/DELETED) prominently.',
            'Host Reprint, Share PDF, Save PDF actions from Module 8.',
            'Add an admin-only Edit action (next topic).',
            'Add a section that displays the edit log.',
            'Load the full document before rendering.',
          ],
          code: `class OrderDetailScreen extends StatelessWidget {
  const OrderDetailScreen({super.key, required this.order, required this.isAdmin});
  final Order order;
  final bool isAdmin;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Bill #\${order.billNo}'),
        actions: [
          if (isAdmin)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () => showAdminEditDialog(context, order),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          _StatusBadge(order.status), // PAID / DELETED
          _ReadOnlyHeader(order),
          _ReadOnlyItems(order.items),
          _ReadOnlyTotals(order),     // CGST / SGST / GRAND TOTAL
          _PaymentLine(order),
          const Divider(),
          _EditLogView(order.editLog), // audit trail
          OrderDetailActions(order: order, /* reprint/share/save */),
        ],
      ),
    );
  }
}`,
          pitfalls: [
            '**Making fields editable inline.** Invites accidental edits to a financial record. Fix: read-only + explicit edit dialog.',
            '**Hiding the status.** A voided bill looks live. Fix: a prominent badge.',
            '**Recomputing totals for display.** May disagree with the stored order. Fix: render stored values.',
            '**Loading a partial order.** Missing items/log. Fix: load the full document.',
            '**Showing Edit to non-admins.** Unauthorized changes. Fix: gate on `isAdmin`.',
            '**Different layout from the receipt.** Confuses staff. Fix: mirror the receipt structure.',
          ],
          tryIt:
            'Build the detail screen and open a paid bill — confirm it reads exactly like the printout and nothing is tappable to edit. Open a voided bill and confirm the DELETED badge is unmistakable. Verify the Edit button only appears for an admin user.',
          takeaway:
            'Order detail is a read-only mirror of the receipt plus an action hub; edits are a deliberate, admin-gated, separate path.',
        },
        {
          id: 'm9-t10',
          title: 'Admin Edit: Discount & Room Number',
          explain:
            'Add an admin edit dialog that changes the goodwill discount or room number on a finalized bill, recomputing tax and total.',
          analogy:
            'A regular asks the TunMani Cafe owner for a small goodwill discount after the bill is printed, or the front desk realizes the room-service order went to the wrong room number. The owner cannot pretend the bill never happened — instead he makes a controlled correction, the way you would strike through and initial a ledger entry, and the totals update accordingly.',
          theory:
            'Some post-bill corrections are legitimate: a **goodwill discount** (a small amount the owner waives) and a **room number** fix (for ROOM orders). The **admin edit dialog** exposes only these safe fields — not item prices or quantities, which would let staff quietly alter sales.\n\nChanging the discount means **recomputing** downstream values: new `subTotal` after discount, then CGST/SGST on the new taxable base, then the new grand total. This recompute must use the *same* tax logic as billing so the edited bill stays internally consistent. A room-number change is metadata only — no recompute.\n\nThe dialog collects the new values, then calls `updateOrderEdits()` (next topic) which performs the recompute, writes the updated order, and appends an audit entry. Keep the dialog thin: it gathers input and delegates; the recompute and persistence live in one tested place. Validate that a discount cannot exceed the bill or go negative.',
          whyItMatters:
            'Real restaurants need to correct bills without deleting and re-creating them (which would break the bill-number sequence and the audit trail). Restricting edits to discount and room number, and always recomputing tax, keeps corrections both possible and tamper-evident.',
          steps: [
            'Build an admin edit dialog with fields for goodwill discount and room number.',
            'Pre-fill current values from the order.',
            'Validate the discount (≥ 0 and ≤ the bill total).',
            'On confirm, call `updateOrderEdits` with the changed fields.',
            'Recompute subTotal, CGST/SGST, and total using the billing tax logic.',
            'Persist and append an audit entry (next topic).',
            'Refresh the detail screen to show new totals.',
          ],
          code: `Future<void> showAdminEditDialog(BuildContext context, Order order) async {
  final discountCtrl =
      TextEditingController(text: order.discount.toStringAsFixed(2));
  final roomCtrl = TextEditingController(text: order.roomNo ?? '');

  final saved = await showDialog<bool>(
    context: context,
    builder: (_) => AlertDialog(
      title: const Text('Edit Bill (Admin)'),
      content: Column(mainAxisSize: MainAxisSize.min, children: [
        TextField(
          controller: discountCtrl,
          decoration: const InputDecoration(labelText: 'Goodwill discount'),
          keyboardType: TextInputType.number,
        ),
        TextField(
          controller: roomCtrl,
          decoration: const InputDecoration(labelText: 'Room number'),
        ),
      ]),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: const Text('Cancel')),
        TextButton(
          onPressed: () => Navigator.pop(context, true),
          child: const Text('Save')),
      ],
    ),
  );

  if (saved == true) {
    final newDiscount = double.tryParse(discountCtrl.text) ?? order.discount;
    await updateOrderEdits(
      order,
      discount: newDiscount,                      // triggers tax recompute
      roomNo: roomCtrl.text.isEmpty ? null : roomCtrl.text,
    );
  }
}`,
          pitfalls: [
            '**Letting admins edit item prices/quantities.** Hides sales manipulation. Fix: limit edits to discount and room.',
            '**Changing discount without recomputing tax.** Totals go inconsistent. Fix: recompute the full chain.',
            '**Using different tax logic than billing.** Edited bills diverge. Fix: share one tax function.',
            '**Allowing a negative or over-the-bill discount.** Nonsense totals. Fix: validate bounds.',
            '**Editing without an audit entry.** Untraceable changes. Fix: always append to the edit log.',
            '**Not refreshing the screen.** Stale totals shown. Fix: reload after save.',
          ],
          tryIt:
            'Open a paid bill, edit the goodwill discount to ₹20, and confirm the subtotal, CGST, SGST, and grand total all recompute correctly (taxable base shrinks). Try entering a discount larger than the bill and confirm it is rejected. Change the room number and confirm only that metadata updates, with no tax change.',
          takeaway:
            'Admin edits are limited to discount and room number; changing the discount recomputes the full tax chain via the same billing logic.',
        },
        {
          id: 'm9-t11',
          title: 'updateOrderEdits() & the Audit Log',
          explain:
            'Implement updateOrderEdits() that recomputes totals, writes the order, and appends an OrderEdit entry (at/by/changes) to the editLog.',
          analogy:
            'Every correction to the TunMani Cafe ledger is signed and dated in the margin: "discount ₹20 added — by owner — 9:40 PM". The `editLog` is that margin: an append-only history where each change records when, who, and what — so months later anyone can see the bill was adjusted, by whom, and how. You never erase the original; you add a note beside it.',
          theory:
            '**`updateOrderEdits()`** is the single, tested place where post-bill changes happen. It: (1) builds a new order via `copyWith` with the changed fields, (2) **recomputes** subTotal/CGST/SGST/total when the discount changed, (3) constructs an **`OrderEdit`** audit entry — `at` (timestamp), `by` (admin user id/name), and `changes` (a map of field → old→new) — and **appends** it to the order\'s `editLog`, then (4) writes the updated order to Firestore.\n\nThe `editLog` is **append-only**: never modify or remove past entries. Each `OrderEdit` makes the change tamper-evident. Store the log as an array on the order document (fine for the handful of edits a bill ever gets) or a subcollection for heavy auditing.\n\nKeep the recompute using the **same tax helper** as billing. Return the updated order so the UI can refresh. This function is also what powers the "this bill was edited" indicator and the edit-log view on the detail screen.',
          whyItMatters:
            'An append-only audit log is what makes post-bill edits trustworthy and compliant: corrections are allowed but never silent. Centralizing recompute + log + write in one function guarantees you can never edit a bill without leaving a traceable, consistent record.',
          steps: [
            'Define an `OrderEdit` with `at`, `by`, and a `changes` map.',
            'In `updateOrderEdits`, diff old vs new to build the `changes` map.',
            'Recompute subTotal/CGST/SGST/total when discount changed.',
            'Append the `OrderEdit` to a copy of `editLog`.',
            'Write the updated order via `copyWith` to Firestore.',
            'Return the updated order for UI refresh.',
            'Render the log on the detail screen, newest first.',
          ],
          code: `class OrderEdit {
  const OrderEdit({required this.at, required this.by, required this.changes});
  final DateTime at;
  final String by;                 // admin who made the change
  final Map<String, String> changes; // field -> "old -> new"

  Map<String, dynamic> toMap() =>
      {'at': at, 'by': by, 'changes': changes};
}

Future<Order> updateOrderEdits(
  Order order, {
  double? discount,
  String? roomNo,
}) async {
  final changes = <String, String>{};
  var updated = order;

  if (discount != null && discount != order.discount) {
    changes['discount'] = '\${order.discount} -> \$discount';
    final recomputed = computeTotals(order.items, discount); // same as billing
    updated = updated.copyWith(
      discount: discount,
      subTotal: recomputed.subTotal,
      cgst: recomputed.cgst,
      sgst: recomputed.sgst,
      total: recomputed.total,
    );
  }
  if (roomNo != order.roomNo) {
    changes['roomNo'] = '\${order.roomNo} -> \$roomNo';
    updated = updated.copyWith(roomNo: roomNo);
  }

  final edit = OrderEdit(
    at: DateTime.now(),
    by: currentUser.name,
    changes: changes,
  );
  updated = updated.copyWith(editLog: [...order.editLog, edit]);

  await ordersCollection.doc(order.id).set(updated.toMap());
  return updated;
}`,
          pitfalls: [
            '**Overwriting or deleting old log entries.** Destroys the audit trail. Fix: append only.',
            '**Editing the order in multiple places.** Inconsistent logs. Fix: one `updateOrderEdits` function.',
            '**Recording the change but not who made it.** Useless for audit. Fix: capture `by`.',
            '**Recomputing with different tax logic.** Divergent totals. Fix: reuse `computeTotals`.',
            '**Mutating the order in place.** Breaks immutability/state. Fix: `copyWith`.',
            '**Forgetting to record old→new.** Log lacks context. Fix: store both values in `changes`.',
          ],
          tryIt:
            'Edit a bill\'s discount via the dialog, then inspect the order document — confirm `editLog` gained one entry with the timestamp, your admin name, and a `discount: "0.0 -> 20.0"` change, and that totals recomputed. Edit again and confirm the log now has two entries, newest visible on the detail screen. Verify nothing in the original entry changed.',
          takeaway:
            'updateOrderEdits is the one place that recomputes totals and appends an immutable at/by/changes entry to the order audit log.',
        },
      ],
    },
    {
      id: 'm9-s4',
      title: 'User Management & Go-Live',
      topics: [
        {
          id: 'm9-t12',
          title: 'User Whitelist & Management',
          explain:
            'Build user_manager_screen.dart to whitelist users — add by email/name/role, edit, activate/deactivate, show role badges and a pending (empty uid) state.',
          analogy:
            'Not everyone can walk behind the TunMani Cafe counter — the owner keeps a list of who is allowed: this person is a cashier, that one a manager, and the new hire is invited but has not shown up for their first shift yet. The user manager is that staff register: you add people by email, give them a role, switch them on or off, and a "pending" tag marks those who have not yet signed in.',
          theory:
            'Access is controlled by a **whitelist** of user documents, each with `email`, `name`, `role` (e.g. ADMIN/CASHIER), `active` (bool), and `uid`. The **`screens/admin/user_manager_screen.dart`** lists them with **role badges** and active toggles.\n\n**Adding a user** creates a whitelist doc by **email** with an **empty `uid`** — a **pending** state. When that person first signs in with Google, your auth flow matches their email, fills in the `uid`, and they become active. Until then the row shows a "Pending — not signed in yet" badge.\n\n**Activate/deactivate** flips the `active` flag without deleting the user, so you can revoke access (a departed cashier) while keeping their history and re-enable later. **Editing** changes name or role. All of this is admin-gated and, crucially, **backed by Firestore security rules** (next topic) — the UI is convenience, the rules are the actual gate.',
          whyItMatters:
            'A whitelist with roles is how a small restaurant controls who can bill and who can see the admin panel, without anyone managing passwords. The pending/active states and role badges make it obvious at a glance who has access right now — essential when staff turns over.',
          steps: [
            'Create `user_manager_screen.dart` listing whitelist user docs.',
            'Add-user dialog: email, name, role; create a doc with empty uid (pending).',
            'Show role badges and a Pending badge when uid is empty.',
            'Edit dialog to change name/role.',
            'Activate/deactivate toggle flipping `active`.',
            'On first sign-in, match by email and fill the uid.',
            'Gate the whole screen behind the admin role.',
          ],
          code: `class AppUser {
  const AppUser({
    required this.email, required this.name,
    required this.role, required this.active, required this.uid,
  });
  final String email;
  final String name;
  final String role;   // ADMIN / CASHIER
  final bool active;
  final String uid;    // '' until first sign-in (pending)

  bool get isPending => uid.isEmpty;
}

// --- user_manager_screen.dart row ---
Widget userTile(AppUser u) => ListTile(
  title: Text(u.name),
  subtitle: Text(u.email),
  leading: Chip(label: Text(u.role)), // role badge
  trailing: Row(mainAxisSize: MainAxisSize.min, children: [
    if (u.isPending)
      const Chip(label: Text('Pending'), backgroundColor: Colors.amber),
    Switch(
      value: u.active,
      onChanged: (v) => usersCollection.doc(u.email).update({'active': v}),
    ),
  ]),
);

// Add a pending user (empty uid, filled on first sign-in):
Future<void> addUser(String email, String name, String role) {
  return usersCollection.doc(email).set({
    'email': email, 'name': name, 'role': role,
    'active': true, 'uid': '',
  });
}`,
          pitfalls: [
            '**Deleting users to revoke access.** Loses history. Fix: deactivate via the `active` flag.',
            '**Keying users by uid before they sign in.** No uid yet. Fix: key by email; fill uid on first sign-in.',
            '**No pending state.** Confusing why a user "does not work". Fix: show a Pending badge when uid is empty.',
            '**UI-only gating.** Bypassable. Fix: enforce with Firestore rules.',
            '**Free-text roles.** Typos break checks. Fix: a fixed role enum/constant set.',
            '**No way to change a role.** Promotions need re-adding. Fix: an edit dialog.',
          ],
          tryIt:
            'Add a user by email with the CASHIER role and confirm the row shows a Pending badge and an empty uid. Sign in as that user in a second session and confirm the uid fills and Pending disappears. Deactivate them and confirm they can no longer reach billing, then reactivate.',
          takeaway:
            'Manage access with an email-keyed whitelist: add as pending (empty uid), fill uid on first sign-in, and revoke via an active toggle, all admin-gated.',
        },
        {
          id: 'm9-t13',
          title: 'Bill Number Continuity',
          explain:
            'Add setNextBillNo so the app continues the restaurant\'s existing paper bill sequence instead of restarting from one.',
          analogy:
            'TunMani Cafe has been writing bills by hand for years and is already on bill number 4,512. When the app takes over, the owner does not want it to start at 1 — that would confuse customers and the auditor. So on go-live you tell the app "the next bill is 4,513" and it continues the sequence seamlessly, like a new bill book that picks up where the old one ended.',
          theory:
            'Bill numbers must be a **continuous, gapless sequence** for accounting. The app stores a **next-bill-number counter** (e.g. a `counters/bills` document). At billing time you atomically read-and-increment it (a Firestore **transaction** or `FieldValue.increment(1)`) so two simultaneous bills never get the same number.\n\n**`setNextBillNo(n)`** is an admin action (in settings or the Bill No screen) that **seeds** this counter — used once at go-live to continue the paper sequence (e.g. set it to 4513), and rarely afterward to correct drift. Guard it: setting it *backwards* could create duplicate numbers, so warn or restrict.\n\nUse a transaction for the increment so the counter is race-safe under concurrent billing. Format the displayed bill number consistently (with any prefix the restaurant uses). This continuity is exactly why you never delete-and-recreate bills (the edit log from §3 exists precisely so corrections do not break the sequence).',
          whyItMatters:
            'A gapless, continuous bill sequence is an accounting and GST requirement — auditors notice gaps and restarts. Seeding the counter at go-live lets the app inherit years of paper history without a jarring reset, and transactional increments keep it correct under a busy counter.',
          steps: [
            'Store a next-bill-number counter document.',
            'At billing, increment it atomically in a transaction.',
            'Add `setNextBillNo(n)` as an admin action on the Bill No screen.',
            'Use it at go-live to continue the paper sequence.',
            'Warn/restrict setting the number backwards.',
            'Format bill numbers consistently with any prefix.',
            'Confirm concurrent bills get distinct numbers.',
          ],
          code: `final _counterRef = firestore.doc('counters/bills');

/// Atomically take the next bill number (race-safe).
Future<int> nextBillNo() async {
  return firestore.runTransaction((tx) async {
    final snap = await tx.get(_counterRef);
    final current = (snap.data()?['next'] as int?) ?? 1;
    tx.update(_counterRef, {'next': current + 1});
    return current;
  });
}

/// Admin: seed the sequence at go-live (e.g. 4513).
Future<void> setNextBillNo(int n) async {
  if (n < 1) throw ArgumentError('Bill number must be positive');
  await _counterRef.set({'next': n}, SetOptions(merge: true));
}

// --- Bill No screen ---
// TextField + "Continue from this number" button calling setNextBillNo,
// with a confirmation warning that lowering it risks duplicates.`,
          pitfalls: [
            '**Restarting bill numbers at 1.** Breaks the paper continuity. Fix: seed with `setNextBillNo` at go-live.',
            '**Non-atomic increment.** Concurrent bills collide. Fix: a Firestore transaction.',
            '**Setting the number backwards unguarded.** Creates duplicates. Fix: warn/restrict.',
            '**Deriving bill no from a count of orders.** Deletions/edits skew it. Fix: a dedicated counter.',
            '**Forgetting a prefix the restaurant uses.** Mismatch with old bills. Fix: format consistently.',
            '**Storing the counter on each order.** No single source of truth. Fix: one counters doc.',
          ],
          tryIt:
            'Use `setNextBillNo(4513)` to seed the sequence, then create a bill and confirm it is numbered 4513 and the counter advances to 4514. Fire two bills nearly simultaneously (two devices) and confirm they get distinct consecutive numbers — proving the transaction prevents collisions.',
          takeaway:
            'Continue the paper bill sequence by seeding a transactional counter with setNextBillNo, keeping numbers gapless and race-safe.',
        },
        {
          id: 'm9-t14',
          title: 'Firestore Security Rules for Role-Based Access',
          explain:
            'Write Firestore security rules so only whitelisted, active users can read/write, and only admins reach admin-only data — the real gate behind your UI.',
          analogy:
            'All the role checks in your screens are like a polite "staff only" sign on a door — helpful, but a determined person can walk past a sign. Firestore security rules are the actual lock on that door, enforced by Google\'s servers no matter what app or script knocks. Before TunMani Cafe goes live, you fit the real lock.',
          theory:
            '**Firestore security rules** run on Google\'s servers and decide every read/write — they are the true authorization layer; UI gating is only convenience. You write them in `firestore.rules` and deploy with the Firebase CLI.\n\nThe pattern for this app: a helper that the requesting user is **authenticated, whitelisted, and active**, and another that they are an **admin**. Orders are writable by any active user (cashiers bill) but admin-only edits and user management require the admin role. Reads of admin data (dashboard aggregates, the user list) require admin.\n\nUse `request.auth.uid` and a `get()` on the user\'s whitelist document to read their role and active flag. Be careful: `get()` calls count as reads and must themselves be allowed. Test rules in the **Firebase console Rules Playground** before deploying. Never ship the default `allow read, write: if true;` — that is an open database.',
          whyItMatters:
            'Without server-side rules, anyone who extracts your Firebase config (it ships in the app) can read or alter every bill directly, bypassing your UI entirely. Rules are the difference between a demo and a production app you can trust with real revenue data.',
          steps: [
            'Create `firestore.rules` with `isActiveUser()` and `isAdmin()` helpers.',
            'Allow order reads/writes only for active users.',
            'Restrict admin collections (users, counters) to admins.',
            'Restrict order edits/deletes to admins where required.',
            'Test scenarios in the Rules Playground.',
            'Deploy with `firebase deploy --only firestore:rules`.',
            'Remove any leftover `if true` open rules.',
          ],
          code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }

    function userDoc() {
      return get(/databases/$(database)/documents/users/$(request.auth.token.email));
    }
    function isActiveUser() {
      return isSignedIn() && userDoc().data.active == true;
    }
    function isAdmin() {
      return isActiveUser() && userDoc().data.role == 'ADMIN';
    }

    // Bills: active staff can create/read; only admins can edit/delete.
    match /orders/{orderId} {
      allow read, create: if isActiveUser();
      allow update, delete: if isAdmin();
    }

    // Whitelist + counters: admin only.
    match /users/{email}   { allow read, write: if isAdmin(); }
    match /counters/{id}   { allow read: if isActiveUser();
                             allow write: if isAdmin(); }
  }
}`,
          pitfalls: [
            '**Shipping `allow read, write: if true;`.** Wide-open database. Fix: real role-based rules.',
            '**Relying on UI checks only.** Trivially bypassed. Fix: enforce in rules.',
            '**Forgetting get() calls need permission.** Rule evaluation fails. Fix: ensure the user doc is readable in-rule.',
            '**Not testing before deploy.** Locks out real users. Fix: use the Rules Playground.',
            '**Allowing cashiers to edit/delete bills.** Sales tampering. Fix: restrict update/delete to admin.',
            '**Keying user docs differently than rules expect.** Lookups fail. Fix: match the doc id (email) in code and rules.',
          ],
          tryIt:
            'Write and deploy these rules. In the Rules Playground, simulate a cashier trying to delete an order (should be denied) and an admin doing the same (allowed). Then try reading the users collection as a cashier (denied). Finally confirm a real cashier can still create a bill from the app.',
          takeaway:
            'Firestore rules are the real authorization gate: allow active users to bill, restrict edits/admin data to admins, and never ship open rules.',
        },
        {
          id: 'm9-t15',
          title: 'Go-Live: Signed Release Build & Play Store',
          explain:
            'Build a signed release APK/AAB with a keystore, and cover the Play Store basics to ship TunMani Cafe Billing.',
          analogy:
            'A signed release build is like the TunMani Cafe health-and-safety certificate framed at the entrance — proof the kitchen is the real, registered one and not an impostor. Android refuses to update an app unless every new version is signed with the *same* key, so the keystore is your restaurant\'s official seal: lose it and you can never update the app again. On go-live day you create that seal, sign the build, and hand it to the Play Store.',
          theory:
            'Debug builds are signed with a throwaway key; the **release build** needs **your** keystore. Generate one with `keytool`, store it safely (and back it up — losing it means you can never update the app), and reference it in **`android/key.properties`** plus `android/app/build.gradle`\'s `signingConfigs`.\n\nBuild an **AAB** (Android App Bundle) for the Play Store with `flutter build appbundle --release`, or an **APK** (`flutter build apk --release`) for side-loading. The AAB lets Google generate optimized per-device APKs.\n\nSet the **`applicationId`**, **versionCode**/**versionName**, app **name**, and **launcher icon** before shipping. For the **Play Store**: create a Play Console app, fill the store listing (title, description, screenshots), complete the content/data-safety questionnaires, set up **internal testing** to validate the signed build on real devices, then promote to production. Enable **Crashlytics** so you see real-world crashes after launch. This is the final step — the app is now in users\' hands.',
          whyItMatters:
            'A correctly signed, versioned release is the only way to actually ship and *keep updating* the app — a lost keystore is an unrecoverable mistake that ends your update path. Getting the build, signing, and Play Console basics right is what turns the whole course\'s work into a real product running at TunMani Cafe.',
          steps: [
            'Generate a keystore with `keytool` and back it up securely.',
            'Create `android/key.properties` and wire `signingConfigs` in build.gradle.',
            'Set applicationId, versionCode/Name, app name, and launcher icon.',
            'Run `flutter build appbundle --release`.',
            'Create the Play Console app and complete the store listing + questionnaires.',
            'Upload to internal testing and validate on real devices.',
            'Enable Crashlytics, then promote to production.',
          ],
          code: `# 1. Generate a signing keystore (run once; BACK THIS UP).
keytool -genkey -v -keystore tunmani-release.jks \\
  -keyalg RSA -keysize 2048 -validity 10000 -alias tunmani

# 2. android/key.properties (never commit this file)
# storePassword=*****
# keyPassword=*****
# keyAlias=tunmani
# storeFile=../tunmani-release.jks

# 3. android/app/build.gradle (signingConfigs.release)
#   signingConfigs {
#     release {
#       keyAlias keystoreProperties['keyAlias']
#       keyPassword keystoreProperties['keyPassword']
#       storeFile file(keystoreProperties['storeFile'])
#       storePassword keystoreProperties['storePassword']
#     }
#   }
#   buildTypes { release { signingConfig signingConfigs.release } }

# 4. Build the signed bundle for the Play Store.
flutter build appbundle --release
# -> build/app/outputs/bundle/release/app-release.aab

# Or a signed APK for side-loading:
flutter build apk --release`,
          pitfalls: [
            '**Losing the keystore.** You can never update the app again. Fix: back it up in multiple safe places.',
            '**Committing key.properties / the keystore.** Leaks signing secrets. Fix: gitignore them.',
            '**Shipping the debug build.** Slow and unsigned for release. Fix: `--release`.',
            '**Forgetting to bump versionCode.** Play rejects the upload. Fix: increment every release.',
            '**Skipping the data-safety questionnaire.** Blocks publishing. Fix: complete all Play Console forms.',
            '**Going straight to production.** No real-device validation. Fix: internal testing first.',
          ],
          tryIt:
            'Generate a keystore, wire the signing config, and run `flutter build appbundle --release` to produce a signed AAB. Side-load a release APK on a real phone and confirm TunMani Cafe Billing launches with its proper icon and name. Then create a Play Console internal testing track and upload the AAB.',
          takeaway:
            'Ship by signing the release build with a safely backed-up keystore and uploading the AAB through Play Console internal testing to production.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm9-p1',
      type: 'Project',
      title: 'Admin Dashboard + All Orders with Filters & Exports',
      domain: 'Restaurant POS / Admin Analytics',
      duration: '3 hours',
      description:
        'Build the analytics and history half of the TunMani Cafe admin: a date-filtered dashboard with revenue, payment-type drill-downs, and summary metrics; plus a paginated All Orders screen with full filters and ZIP/Excel exports.',
      tools: ['Flutter', 'cloud_firestore', 'archive', 'excel', 'share_plus', 'path_provider', 'pdf'],
      blueprint: {
        overview:
          'Wire the owner\'s management view: aggregate PAID orders into a dashboard, let any figure drill into a filtered, paginated order list, and export the active filter as a ZIP of PDFs or an Excel ledger.',
        functionalRequirements: [
          '**Dashboard.** Date-filtered revenue card (total/count/average), CASH/CARD/UPI/CREDIT tappable cards, summary cards (highest bill, items sold, GST collected).',
          '**Drill-down.** Tapping a payment card opens All Orders pre-filtered.',
          '**Pagination.** 25-per-page cursor with load-more on scroll.',
          '**Filters.** Date range, payment type, order type, status — server-side, resetting pagination on change.',
          '**Exports.** ZIP of per-bill PDFs and an .xlsx ledger of the filtered set, both shared.',
        ],
        technicalImplementation: [
          '**dashboard_screen.dart.** Pure `summarize`/`metricsFor`/`byPaymentType` functions over filtered PAID orders.',
          '**all_orders_screen.dart.** Cursor pagination state (orders/lastDoc/hasMore/isLoading) + `OrderFilter` query builder.',
          '**utils/order_export.dart.** `exportBillsZip` (archive + buildBillPdf) and `exportBillsExcel` (excel package, split tax columns).',
          '**Indexes.** Create the composite Firestore indexes the filtered queries require.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Dashboard aggregations',
            outcome: 'Pure functions that summarize PAID orders for the dashboard.',
            prompt:
              'Write Dart functions over a List<Order>: summarize() returning revenue/count/divide-safe average for PAID orders; byPaymentType() grouping PAID totals into a Map with CASH/CARD/UPI/CREDIT all seeded to zero; and metricsFor() returning highest bill, average, items sold (nested fold over item qty), and GST collected (cgst+sgst), all empty-guarded.',
          },
          {
            step: 2,
            label: 'Dashboard screen UI',
            outcome: 'A date-filtered dashboard with drill-down cards.',
            prompt:
              'Build dashboard_screen.dart with a Today/Week/Custom date selector that queries PAID orders in a half-open range, a revenue card, four tappable payment-type cards that push AllOrdersScreen(initialPaymentType: type), and summary cards for highest bill, items sold, and GST collected. Recompute only when the range changes.',
          },
          {
            step: 3,
            label: 'Paginated All Orders',
            outcome: 'A 25-per-page cursor-paginated order list.',
            prompt:
              'Build all_orders_screen.dart with cursor pagination: state of orders, lastDoc (DocumentSnapshot), hasMore, isLoading; a base query ordered by createdAt desc; loadMore() that limits to 25 and uses startAfterDocument(lastDoc), guarded against double-loads; a ScrollController that loads more near the bottom; and hasMore=false when a page returns fewer than 25.',
          },
          {
            step: 4,
            label: 'Filters with pagination reset',
            outcome: 'Server-side filters that reset the cursor on change.',
            prompt:
              'Add an OrderFilter (start, end, paymentType, orderType TABLE/COUNTER/WALKIN/ROOM, status PAID/DELETED) and a buildQuery(filter) that layers where-clauses then orderBy createdAt desc. On any filter change, clear orders, null lastDoc, reset hasMore, and reload page one. Note which composite Firestore indexes are needed.',
          },
          {
            step: 5,
            label: 'ZIP & Excel exports',
            outcome: 'Export the active filter as a ZIP of PDFs and an .xlsx.',
            prompt:
              'In utils/order_export.dart, write exportBillsZip(orders, store) that builds a PDF per order via buildBillPdf, adds each as an ArchiveFile named bill_<billNo>.pdf, ZipEncoder-encodes, writes to a temp file, and shares via share_plus. Also write exportBillsExcel(orders) using the excel package with columns Sl No/Order ID/Date/Taxable/SGST/CGST/Total/Status using numeric cell values, encoded, written, and shared.',
          },
        ],
      },
    },
    {
      id: 'm9-p2',
      type: 'Capstone',
      title: 'Ship TunMani Cafe Billing End-to-End',
      domain: 'Restaurant POS / Full App Delivery',
      duration: '3 hours',
      description:
        'The capstone: wire the entire app together — billing, printing, PDF, dashboard, order history, post-bill edits with audit log, user management, and bill-number continuity — then secure it with Firestore rules and ship a signed release through Play Console.',
      tools: [
        'Flutter',
        'cloud_firestore',
        'firebase_auth',
        'print_bluetooth_thermal',
        'pdf',
        'share_plus',
        'archive',
        'excel',
        'firebase_crashlytics',
      ],
      blueprint: {
        overview:
          'Assemble the complete TunMani Cafe Billing POS from all nine modules: authentication + whitelist, billing with tax, Bluetooth printing and PDF, the admin hub with dashboard/history/exports, post-bill edits with an audit log, user management, bill-number continuity, role-based security rules, and a signed, Crashlytics-enabled release on the Play Store.',
        functionalRequirements: [
          '**End-to-end billing.** Create an order, compute tax, save, print to thermal, and generate/share a PDF.',
          '**Admin suite.** Hub → dashboard, all-orders with filters/exports, order detail with reprint/edit/audit.',
          '**Post-bill edits.** Admin discount/room edits recompute totals and append an immutable audit entry.',
          '**Access control.** Email whitelist with roles, pending/active states, enforced by Firestore rules.',
          '**Continuity.** setNextBillNo seeds a gapless, transactional bill-number sequence.',
          '**Ship.** Signed AAB via a backed-up keystore, internal testing, Crashlytics, production release.',
        ],
        technicalImplementation: [
          '**Integration.** Connect PrintService, bill_pdf, order_export, dashboard, all_orders, order_detail, user_manager into one navigation graph behind an auth gate.',
          '**Security.** Deploy role-based firestore.rules (isActiveUser/isAdmin) and verify in the Rules Playground.',
          '**Counter.** Transactional nextBillNo() + admin setNextBillNo() seeding.',
          '**Release.** Keystore + signingConfigs, `flutter build appbundle --release`, Crashlytics init, Play Console internal track → production.',
          '**Smoke test.** A full billing-to-export run on a real device with the real printer.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Wire the navigation graph',
            outcome: 'One coherent app from auth gate to admin hub.',
            prompt:
              'Wire the TunMani Cafe Billing app navigation: an auth gate that checks the Firebase user against the active whitelist, the billing screen as home for cashiers, and an admin hub (admin_screen.dart) reachable only by ADMIN role linking to dashboard, all-orders, order detail, printer setup, user manager, store settings, and bill-no. Pass the user role down so screens can gate admin-only actions.',
          },
          {
            step: 2,
            label: 'End-to-end billing smoke path',
            outcome: 'Create→save→print→PDF works on a real device.',
            prompt:
              'Implement the full billing path: build an Order with items, compute subTotal/CGST/SGST/total via the shared computeTotals, take a bill number from the transactional nextBillNo(), save to Firestore FIRST, then printBill via PrintService (with the save-first retry SnackBar) and offer Share PDF via buildBillPdf. Confirm the printed receipt and PDF match.',
          },
          {
            step: 3,
            label: 'Post-bill edits + audit log',
            outcome: 'Admins can correct bills with a tamper-evident trail.',
            prompt:
              'Wire order_detail_screen.dart read-only view with an admin edit dialog for goodwill discount and room number, calling updateOrderEdits() which recomputes totals via computeTotals and appends an immutable OrderEdit (at/by/changes) to editLog. Render the edit log newest-first and a reprint/share action for the past bill.',
          },
          {
            step: 4,
            label: 'Security rules + bill continuity',
            outcome: 'Server-enforced access and a gapless bill sequence.',
            prompt:
              'Write and deploy firestore.rules with isActiveUser() and isAdmin() helpers: active users can read/create orders, only admins can update/delete orders and read/write users and counters. Then implement transactional nextBillNo() and an admin setNextBillNo(n) to seed the paper sequence at go-live, guarded against going backwards. Give me Rules Playground test cases to verify.',
          },
          {
            step: 5,
            label: 'Sign, test & ship',
            outcome: 'A signed, Crashlytics-enabled release on the Play Store.',
            prompt:
              'Walk me through shipping: generate a release keystore with keytool, wire key.properties and signingConfigs.release in build.gradle (gitignored), set applicationId/versionCode/versionName/app name/launcher icon, initialize Firebase Crashlytics, run flutter build appbundle --release, and upload the AAB to a Play Console internal testing track before promoting to production. Include a final on-device smoke-test checklist covering billing, printing, PDF share, dashboard, and exports.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm9-q1',
      q: 'On the dashboard, why must revenue be computed only from orders with status PAID?',
      options: [
        'Including deleted/void orders would inflate the reported takings',
        'PAID orders load faster from Firestore',
        'Firestore cannot query other statuses',
        'It is required by the excel package',
      ],
      answer: 0,
    },
    {
      id: 'm9-q2',
      q: 'What makes cursor pagination (startAfterDocument) better than offset pagination for the order history?',
      options: [
        'It stays fast and cheap no matter how deep you scroll, reading only the page you need',
        'It loads the entire collection once and caches it',
        'It avoids needing an orderBy clause',
        'It removes the need for Firestore indexes',
      ],
      answer: 0,
    },
    {
      id: 'm9-q3',
      q: 'When the user changes a filter on the All Orders screen, what must happen to pagination?',
      options: [
        'Reset it — clear the orders list and the cursor, then reload page one',
        'Keep appending the new results to the existing list',
        'Nothing; filters are applied in memory after loading',
        'Disable load-more permanently',
      ],
      answer: 0,
    },
    {
      id: 'm9-q4',
      q: 'When an admin changes the goodwill discount on a finalized bill, updateOrderEdits must do what?',
      options: [
        'Recompute the tax/total and append an immutable at/by/changes entry to the audit log',
        'Delete the old order and create a new one with the new total',
        'Only change the discount field and leave totals untouched',
        'Overwrite the previous audit entry with the new change',
      ],
      answer: 0,
    },
    {
      id: 'm9-q5',
      q: 'Why is a new whitelisted user created with an empty uid (a "pending" state)?',
      options: [
        'The uid is unknown until they first sign in; the auth flow fills it by matching their email',
        'Empty uids are required by Firestore security rules',
        'It prevents the user from ever being deactivated',
        'The excel export needs an empty uid column',
      ],
      answer: 0,
    },
    {
      id: 'm9-q6',
      q: 'Why are Firestore security rules essential before going live, beyond the in-app role checks?',
      options: [
        'Rules are enforced server-side; UI checks can be bypassed by anyone with the app\'s Firebase config',
        'Rules make the app build faster',
        'Rules replace the need for a signed release build',
        'Rules are only needed for the Play Store listing',
      ],
      answer: 0,
    },
  ],
}
