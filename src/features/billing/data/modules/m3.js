// Module 3 — Data Models (TunMani Cafe Billing).
// Every model class with fromMap/toMap, serialization patterns, and computed getters.

export const m3 = {
  id: 'm3',
  title: 'Data Models',
  hours: 8,
  color: 'from-cyan-500/20 to-cyan-700/10',
  accent: 'cyan',
  description:
    'Model the entire TunMani Cafe menu, draft order, and finalized bill as immutable Dart classes with Firestore fromMap/toMap, enum and Timestamp serialization, and the computed getters (subtotal, GST, grand total) that drive the till.',
  sections: [
    {
      id: 'm3-s1',
      title: 'The Model Classes',
      topics: [
        {
          id: 'm3-t1',
          title: 'AppUser: Identity, Role & Machine',
          explain:
            'Model the staff/admin user with uid, name, email (doc id), a UserRole enum, an active flag, a sequential userId, a machineNo, and an isAdmin getter.',
          analogy:
            'Every person who steps behind the TunMani Cafe counter wears a numbered apron. The apron tells you their name, whether they hold the owner\'s keys (admin) or just the order pad (staff), which till station they man (machineNo), and a running staff number stamped when they joined (userId). AppUser is that apron written down — one laminated card per person on the duty register.',
          theory:
            '`AppUser` carries `uid` (Firebase auth id), `name`, **`email`** (lowercased — also the `users/{email}` doc id), **`role`** (a `UserRole { admin, staff }` enum), **`active`** (soft-deactivation flag), **`userId`** (a sequential integer assigned per staff member), and **`machineNo`** (which physical till station this user is bound to).\n\n`userId` and `machineNo` are **stamped onto every bill** the user creates, so reports can group sales by cashier and by terminal. They are plain `int`s.\n\nThe **`isAdmin` getter** (`role == UserRole.admin`) keeps role checks readable across the UI and router. The enum serializes by **name** (`role.name`), never index, so reordering the enum never corrupts data.\n\nLike every model in this module, `AppUser` is **immutable** (all `final`) with a `fromMap`/`toMap` pair for Firestore.',
          whyItMatters:
            'A clean user model is the anchor for role-based UI, per-cashier reporting, and multi-terminal POS setups. Interviewers probing data modelling will ask why role is an enum (not a string) and why email is the doc id — both have crisp answers here.',
          steps: [
            'Define `enum UserRole { admin, staff }`.',
            'Create `AppUser` with final `uid`, `name`, `email`, `role`, `active`, `userId`, `machineNo`.',
            'Add an `isAdmin` getter returning `role == UserRole.admin`.',
            'Lowercase `email` in `fromMap`.',
            'Serialize `role` with `role.name`; parse with `UserRole.values.byName`.',
            'Default `active` to true and integer fields to 0 when absent.',
          ],
          code: `// lib/models/app_user.dart
enum UserRole { admin, staff }

class AppUser {
  final String uid;
  final String name;
  final String email;     // lowercased; doc id of users/{email}
  final UserRole role;
  final bool active;
  final int userId;       // sequential staff number, stamped on bills
  final int machineNo;    // which till station this user mans

  const AppUser({
    required this.uid,
    required this.name,
    required this.email,
    required this.role,
    required this.active,
    required this.userId,
    required this.machineNo,
  });

  bool get isAdmin => role == UserRole.admin;

  factory AppUser.fromMap(Map<String, dynamic> m) => AppUser(
        uid: m['uid'] as String? ?? '',
        name: m['name'] as String? ?? '',
        email: (m['email'] as String).toLowerCase(),
        role: UserRole.values.byName(m['role'] as String? ?? 'staff'),
        active: m['active'] as bool? ?? true,
        userId: (m['userId'] as num?)?.toInt() ?? 0,
        machineNo: (m['machineNo'] as num?)?.toInt() ?? 0,
      );

  Map<String, dynamic> toMap() => {
        'uid': uid,
        'name': name,
        'email': email,
        'role': role.name,
        'active': active,
        'userId': userId,
        'machineNo': machineNo,
      };
}`,
          pitfalls: [
            '**Serializing role by index.** Reordering the enum corrupts stored data. Fix: use `role.name` / `byName`.',
            '**Not lowercasing email.** Doc-id lookups drift between `Anjali@` and `anjali@`. Fix: lowercase in `fromMap`.',
            '**Reading ints with `as int` directly.** Firestore numbers may arrive as `double`. Fix: `(m["x"] as num?)?.toInt()`.',
            '**Defaulting an unknown role to admin.** A glitch grants power. Fix: default to `staff`.',
            '**Mutable fields.** Breaks equality and copyWith. Fix: all `final`.',
            '**Forgetting userId/machineNo in toMap.** Reports lose attribution. Fix: always serialize them.',
          ],
          tryIt:
            'Create the `AppUser` model and write a round-trip test: `AppUser.fromMap(admin.toMap())` should equal the original and report `isAdmin == true`. Then feed it a map with `role: "staff"` and confirm `isAdmin` flips to false.',
          takeaway:
            'AppUser is an immutable, enum-roled apron card whose userId and machineNo follow every bill it creates.',
        },
        {
          id: 'm3-t2',
          title: 'Sku: A Menu Item',
          explain:
            'Model a menu item (Sku) with id, a unique numeric code, name, a double price where 0 means seasonal/TBD, and an active toggle.',
          analogy:
            'The TunMani Cafe menu board lists every dish with a little number beside it — 12 for neer dosa, 47 for kori rotti, 103 for fish thali. Each dish has a fixed code so staff can punch it fast. Some dishes, like today\'s catch, have no fixed price yet — the board shows a blank and the cashier fills it at billing. A Sku is one line on that board.',
          theory:
            '`Sku` (Stock Keeping Unit) is the menu-item model: **`id`** (Firestore doc id), **`code`** (a unique integer, 1–208, that staff type to add the item fast), **`name`**, **`price`** (a `double`), and **`active`** (a toggle to hide a dish without deleting it).\n\nA **price of `0` is a sentinel meaning "seasonal / to be decided"** — typically market-rate items like fresh fish. The till treats a 0-price item specially: staff enter the price at the moment of finalizing the bill.\n\n`code` is the human-facing fast key; `id` is the database key. Keeping both lets you rename or restructure docs without changing the codes printed on the counter cheat-sheet.\n\n`active: false` is a soft hide — the dish stays in history (old bills still reference its code/name) but no longer appears in the order screen.',
          whyItMatters:
            'Sentinel values (0 = seasonal) are a real-world modelling decision interviewers love to discuss versus using a nullable price. Separating a stable human code from a database id is a pattern you will reuse across many catalog apps.',
          steps: [
            'Create `Sku` with final `id`, `code` (int), `name`, `price` (double), `active` (bool).',
            'Document that `price == 0` means seasonal/TBD.',
            'Parse `price` defensively with `(m["price"] as num?)?.toDouble() ?? 0`.',
            'Parse `code` with `(m["code"] as num?)?.toInt() ?? 0`.',
            'Default `active` to true when absent.',
            'Write `toMap` mirroring the fields.',
          ],
          code: `// lib/models/sku.dart
class Sku {
  final String id;     // Firestore doc id
  final int code;      // unique 1..208, staff type this to add the item
  final String name;
  final double price;  // 0 == seasonal / price-on-finalize
  final bool active;   // false hides it from the order screen

  const Sku({
    required this.id,
    required this.code,
    required this.name,
    required this.price,
    required this.active,
  });

  bool get isSeasonal => price == 0;

  factory Sku.fromMap(String id, Map<String, dynamic> m) => Sku(
        id: id,
        code: (m['code'] as num?)?.toInt() ?? 0,
        name: m['name'] as String? ?? '',
        price: (m['price'] as num?)?.toDouble() ?? 0,
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
            '**Reading price as `as double`.** Firestore may store it as int `0`, which crashes. Fix: `(m["price"] as num?)?.toDouble()`.',
            '**Treating 0 price as free.** It means seasonal/TBD. Fix: branch on `isSeasonal` at finalize.',
            '**Hard-deleting a Sku.** Old bills lose their dish name. Fix: set `active: false`.',
            '**Putting the doc id inside toMap.** Duplicates the key. Fix: id stays the doc name, not a field.',
            '**Assuming code is unique without enforcing it.** Two dishes share a code and staff punch the wrong one. Fix: enforce uniqueness on write.',
            '**Defaulting active to false.** Existing items vanish from the menu. Fix: default to true.',
          ],
          tryIt:
            'Model three Skus: neer dosa (code 12, ₹40), kori rotti (code 47, ₹120), and today\'s fish (code 103, price 0). Confirm `isSeasonal` is true only for the fish, and that a round-trip through `toMap`/`fromMap` preserves every field.',
          takeaway:
            'A Sku is one menu line keyed by a fast human code, with price 0 reserved for seasonal items priced at billing.',
        },
        {
          id: 'm3-t3',
          title: 'OrderItem: A Line on the Bill',
          explain:
            'Model a single line item with skuCode, skuName, qty, a unitPrice (0 = seasonal, staff sets at finalize), and a lineTotal getter.',
          analogy:
            'On the TunMani Cafe order chit, each row reads "2 × neer dosa @ 40 = 80". That single row — the dish, how many, the price each, and the multiplied total — is an OrderItem. The waiter scribbles a blank in the price column for the day\'s fish and fills it when the bill is settled.',
          theory:
            '`OrderItem` is a **snapshot of a Sku at order time**: it copies **`skuCode`** and **`skuName`** (so the bill is stable even if the menu later changes), plus **`qty`** (int) and **`unitPrice`** (double).\n\nA **`unitPrice` of 0 means seasonal** — the staff member enters the real price when finalizing the bill. Until then it sits at 0.\n\nThe **`lineTotal` getter** is `unitPrice * qty` — computed, never stored, so it is always consistent with its inputs. Storing it would risk drift if qty changed but the total did not.\n\nCopying name/code into the line (rather than referencing the Sku) is the standard **denormalization for invoices**: a printed bill must reflect the dish exactly as sold, frozen in time.',
          whyItMatters:
            'Denormalizing line items so a bill is immutable history is a core commerce-modelling lesson and a frequent interview point ("why copy the name instead of joining?"). Computed totals (getter, not stored) prevent an entire class of data-integrity bugs.',
          steps: [
            'Create `OrderItem` with final `skuCode` (int), `skuName`, `qty` (int), `unitPrice` (double).',
            'Add a `lineTotal` getter: `unitPrice * qty`.',
            'Add `isSeasonal => unitPrice == 0` for finalize logic.',
            'Parse numbers defensively with `num?` casts.',
            'Write `toMap`/`fromMap` (no getter in the map).',
            'Add a `copyWith` to support qty edits in the order screen.',
          ],
          code: `// lib/models/order_item.dart
class OrderItem {
  final int skuCode;
  final String skuName;
  final int qty;
  final double unitPrice; // 0 == seasonal; staff enters price at finalize

  const OrderItem({
    required this.skuCode,
    required this.skuName,
    required this.qty,
    required this.unitPrice,
  });

  // Computed — never stored, so it can never drift from its inputs.
  double get lineTotal => unitPrice * qty;
  bool get isSeasonal => unitPrice == 0;

  factory OrderItem.fromMap(Map<String, dynamic> m) => OrderItem(
        skuCode: (m['skuCode'] as num?)?.toInt() ?? 0,
        skuName: m['skuName'] as String? ?? '',
        qty: (m['qty'] as num?)?.toInt() ?? 1,
        unitPrice: (m['unitPrice'] as num?)?.toDouble() ?? 0,
      );

  Map<String, dynamic> toMap() => {
        'skuCode': skuCode,
        'skuName': skuName,
        'qty': qty,
        'unitPrice': unitPrice,
        // lineTotal is intentionally NOT stored.
      };

  OrderItem copyWith({int? qty, double? unitPrice}) => OrderItem(
        skuCode: skuCode,
        skuName: skuName,
        qty: qty ?? this.qty,
        unitPrice: unitPrice ?? this.unitPrice,
      );
}`,
          pitfalls: [
            '**Storing lineTotal.** It can drift from qty/price. Fix: keep it a getter.',
            '**Referencing the Sku instead of copying name/code.** A later menu edit rewrites old bills. Fix: denormalize at order time.',
            '**Defaulting qty to 0.** A line with zero quantity is meaningless. Fix: default to 1.',
            '**Forgetting seasonal handling.** A 0-price line bills as free. Fix: prompt for price at finalize when `isSeasonal`.',
            '**`as int` on qty.** Firestore may send a double. Fix: `(m["qty"] as num?)?.toInt()`.',
            '**No copyWith.** Editing qty forces rebuilding the whole object by hand. Fix: add `copyWith`.',
          ],
          tryIt:
            'Build an OrderItem for "2 × kori rotti @ ₹120" and assert `lineTotal == 240`. Then `copyWith(qty: 3)` and confirm the total recomputes to 360 without you touching `lineTotal` directly.',
          takeaway:
            'An OrderItem is a frozen snapshot of a sale line whose lineTotal is always computed, never stored.',
        },
        {
          id: 'm3-t4',
          title: 'RunningOrder: The Draft Ticket',
          explain:
            'Model an in-progress order in running_orders with a RunningType enum (walkin/room), a number, an item list, staff/machine metadata, timestamps, and getters like label and subtotal.',
          analogy:
            'Before a TunMani Cafe bill is printed, the order lives on a clip behind the counter — "Walk-in 0007" or "Room 12" — with dishes added and removed as the table calls them out. That live clip, growing through the meal, is a RunningOrder. Only when the guest asks for the bill does it harden into a printed BillOrder.',
          theory:
            '`RunningOrder` lives in the **`running_orders`** collection and represents a **draft**. It has **`type`** (`RunningType { walkin, room }`), **`number`** (an auto-incremented walk-in ticket OR a user-entered room number), **`items`** (a `List<OrderItem>`), and staff/terminal metadata: `staffUid`, `staffName`, `userId`, `machineNo`, plus `createdAt`/`updatedAt` timestamps.\n\nIt exposes computed getters: **`isWalkin`** (`type == RunningType.walkin`), **`label`** ("Walk-in 0001" or "Room 12"), **`billOrderType`** ("WALKIN" / "ROOM" — the string the finalized bill stores), **`subtotal`** (sum of `lineTotal`), **`titems`** (count of distinct lines), and **`tqty`** (total quantity across lines).\n\nThe `label` formats the walk-in number with zero-padding (`number.toString().padLeft(4, "0")`) for a tidy "Walk-in 0007", while room orders show the raw room number.\n\nWhen the bill is settled, a RunningOrder is converted into a `BillOrder` and removed from `running_orders`.',
          whyItMatters:
            'Separating a mutable draft (running_orders) from an immutable finalized record (orders) is a classic POS/order-state pattern. The list-of-items aggregation getters (subtotal, tqty) are exactly the computed-property design questions interviewers use to test modelling instincts.',
          steps: [
            'Define `enum RunningType { walkin, room }`.',
            'Create `RunningOrder` with `id`, `type`, `number`, `items`, `staffUid`, `staffName`, `userId`, `machineNo`, `createdAt`, `updatedAt`.',
            'Add `isWalkin`, `label`, `billOrderType` getters.',
            'Add `subtotal` (fold of lineTotal), `titems` (items.length), `tqty` (fold of qty).',
            'Map the items list with `items.map((e) => e.toMap()).toList()`.',
            'Convert Timestamps to DateTime in fromMap.',
          ],
          code: `// lib/models/running_order.dart
import 'package:cloud_firestore/cloud_firestore.dart';

enum RunningType { walkin, room }

class RunningOrder {
  final String id;
  final RunningType type;
  final int number;            // auto walk-in ticket OR user-entered room no
  final List<OrderItem> items;
  final String staffUid;
  final String staffName;
  final int userId;
  final int machineNo;
  final DateTime createdAt;
  final DateTime updatedAt;

  const RunningOrder({
    required this.id,
    required this.type,
    required this.number,
    required this.items,
    required this.staffUid,
    required this.staffName,
    required this.userId,
    required this.machineNo,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isWalkin => type == RunningType.walkin;
  String get billOrderType => isWalkin ? 'WALKIN' : 'ROOM';
  String get label => isWalkin
      ? 'Walk-in \${number.toString().padLeft(4, '0')}'
      : 'Room \$number';

  double get subtotal =>
      items.fold(0.0, (sum, it) => sum + it.lineTotal);
  int get titems => items.length;
  int get tqty => items.fold(0, (sum, it) => sum + it.qty);

  factory RunningOrder.fromMap(String id, Map<String, dynamic> m) =>
      RunningOrder(
        id: id,
        type: RunningType.values.byName(m['type'] as String? ?? 'walkin'),
        number: (m['number'] as num?)?.toInt() ?? 0,
        items: ((m['items'] as List?) ?? [])
            .map((e) => OrderItem.fromMap(e as Map<String, dynamic>))
            .toList(),
        staffUid: m['staffUid'] as String? ?? '',
        staffName: m['staffName'] as String? ?? '',
        userId: (m['userId'] as num?)?.toInt() ?? 0,
        machineNo: (m['machineNo'] as num?)?.toInt() ?? 0,
        createdAt: (m['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
        updatedAt: (m['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
      );

  Map<String, dynamic> toMap() => {
        'type': type.name,
        'number': number,
        'items': items.map((e) => e.toMap()).toList(),
        'staffUid': staffUid,
        'staffName': staffName,
        'userId': userId,
        'machineNo': machineNo,
        'createdAt': Timestamp.fromDate(createdAt),
        'updatedAt': Timestamp.fromDate(updatedAt),
      };
}`,
          pitfalls: [
            '**Storing subtotal/tqty.** They drift when items change. Fix: keep them getters.',
            '**Not padding the walk-in number.** "Walk-in 7" looks scrappy. Fix: `padLeft(4, "0")`.',
            '**Casting the items list without a fallback.** A missing field throws. Fix: `(m["items"] as List?) ?? []`.',
            '**Forgetting Timestamp -> DateTime.** You store a Timestamp object in a DateTime field. Fix: `.toDate()`.',
            '**Mixing walk-in and room numbering.** Room number is user-entered, walk-in is auto. Fix: branch on `type`.',
            '**Leaving drafts in running_orders after finalize.** They double-count. Fix: delete on conversion to BillOrder.',
          ],
          tryIt:
            'Build a walk-in RunningOrder number 7 with two OrderItems and confirm `label == "Walk-in 0007"`, `billOrderType == "WALKIN"`, `titems == 2`, and `subtotal` equals the sum of both line totals. Then make a room order and confirm the label switches to "Room N".',
          takeaway:
            'A RunningOrder is the live draft ticket whose label, subtotal, and quantities are all computed from its item list.',
        },
        {
          id: 'm3-t5',
          title: 'BillOrder: The Finalized Bill',
          explain:
            'Model the finalized bill in orders with a sequential billNo, tableNo, an orderType string, payment type, discount and parcel charge, status, edit log, and the full pricing getters.',
          analogy:
            'When the TunMani Cafe guest pays, the live clip is torn off and a numbered receipt is printed — Bill #1042, Table 5, paid by UPI, ₹50 discount, packed-parcel charge added. That receipt is permanent: it never changes its line items again, and any later owner correction is noted in the margin (the edit log). BillOrder is that printed, archived receipt.',
          theory:
            '`BillOrder` lives in the **`orders`** collection and is the **finalized, immutable** record. Key fields: **`billNo`** (a sequential integer invoice number), **`tableNo`** (int), **`orderType`** (a string: `TABLE` / `COUNTER` / `WALKIN` / `ROOM`), staff/terminal metadata (`staffUid`, `staffName`, `userId`, `machineNo`), the **`items`** list, **`discount`** (double), **`parcelCharge`** (double, taxable), **`paymentType`** (a `PaymentType { cash, card, upi, credit }` enum), **`status`** (`PAID` / `DELETED`), `createdAt`, and an **`editLog`** (a `List<OrderEdit>` of post-bill admin corrections).\n\nThe pricing getters are the heart of the till and are covered in detail in section 3: `subtotal`, `taxableSubtotal`, `cgst` (2.5%), `sgst` (2.5%), `totalTax` (5%), and `grandTotal`.\n\nBecause the bill is history, line items are **never edited in place** after finalize; instead, admin corrections append an `OrderEdit` to `editLog`, preserving a full audit trail.\n\nDeleting a bill is a **soft delete**: `status` becomes `DELETED` (via `isDeleted`), keeping the record for reconciliation.',
          whyItMatters:
            'The finalized-bill model ties together enums, nested lists, an audit log, and computed money math — it is the capstone modelling exercise of the app. Explaining immutable financial records with soft deletes and audit logs is exactly the senior-level reasoning interviewers probe.',
          steps: [
            'Define `enum PaymentType { cash, card, upi, credit }`.',
            'Create `BillOrder` with billNo, tableNo, orderType, staff/machine fields, items, discount, parcelCharge, paymentType, status, createdAt, editLog.',
            'Add `isDeleted`, `statusLabel`, and place-label getters.',
            'Add the money getters (subtotal through grandTotal) — detailed in section 3.',
            'Serialize items and editLog as lists of maps.',
            'Convert Timestamp <-> DateTime and enum <-> name.',
          ],
          code: `// lib/models/bill_order.dart (shape — full fromMap/toMap in section 3)
enum PaymentType { cash, card, upi, credit }

class BillOrder {
  final String id;
  final int billNo;            // sequential invoice number
  final int tableNo;
  final String orderType;      // 'TABLE' | 'COUNTER' | 'WALKIN' | 'ROOM'
  final String staffUid;
  final String staffName;
  final int userId;
  final int machineNo;
  final List<OrderItem> items;
  final double discount;
  final double parcelCharge;   // taxable
  final PaymentType paymentType;
  final String status;         // 'PAID' | 'DELETED'
  final DateTime createdAt;
  final List<OrderEdit> editLog;

  const BillOrder({
    required this.id,
    required this.billNo,
    required this.tableNo,
    required this.orderType,
    required this.staffUid,
    required this.staffName,
    required this.userId,
    required this.machineNo,
    required this.items,
    required this.discount,
    required this.parcelCharge,
    required this.paymentType,
    required this.status,
    required this.createdAt,
    required this.editLog,
  });

  bool get isDeleted => status == 'DELETED';
  String get statusLabel => isDeleted ? 'Deleted' : 'Paid';
  // place labels + money getters live in section 3.
}`,
          pitfalls: [
            '**Editing line items in place after finalize.** Destroys the audit trail. Fix: append to editLog instead.',
            '**Hard-deleting a bill.** Reconciliation breaks. Fix: set status to DELETED (soft delete).',
            '**Storing orderType as an enum here.** It is a free-ish string across four values; keep it a string for flexibility. Fix: validate the four allowed values.',
            '**Forgetting parcelCharge is taxable.** Tax math is wrong. Fix: include it in taxableSubtotal.',
            '**Losing the editLog on save.** Corrections vanish. Fix: serialize editLog as a list of maps.',
            '**Non-sequential billNo.** Invoice numbering must be ordered. Fix: allocate billNo atomically (transaction).',
          ],
          tryIt:
            'Sketch a BillOrder for Bill #1042, Table 5, two items, ₹50 discount, ₹20 parcel, paid by UPI, status PAID, empty editLog. Confirm `isDeleted` is false and `statusLabel` is "Paid". You will add the money getters in section 3.',
          takeaway:
            'BillOrder is the immutable, soft-deletable receipt with an audit log — the financial source of truth for TunMani Cafe.',
        },
        {
          id: 'm3-t6',
          title: 'OrderEdit & OrderEditChange: The Audit Log',
          explain:
            'Model the audit trail of post-bill admin edits: each OrderEdit records when and by whom, plus a list of OrderEditChange entries with label/from/to.',
          analogy:
            'When the TunMani Cafe owner corrects a settled bill — say the discount was keyed wrong — she does not erase the receipt; she writes a dated margin note: "22 Jun, by Owner: Discount 50 → 30". Each margin note is an OrderEdit, and each individual field change inside it is an OrderEditChange. The original numbers are still legible beneath.',
          theory:
            '`OrderEdit` records a single editing session: **`at`** (DateTime), **`by`** (the editor\'s name/email), and **`changes`** (a `List<OrderEditChange>`).\n\n`OrderEditChange` is one field delta: **`label`** (human-readable field name, e.g. "Discount"), **`from`** (old value as a string), and **`to`** (new value as a string). Storing values as **strings** keeps the log schema-agnostic — it can record changes to numbers, enums, or text uniformly.\n\nThe `editLog` on `BillOrder` is a `List<OrderEdit>`, appended to (never overwritten) so the full history of corrections is preserved in order.\n\nThis design gives the owner an accountability trail: every post-bill change is attributable to a person and a moment, which matters for cash-handling disputes.',
          whyItMatters:
            'Audit logs are a non-negotiable feature for any money-handling system and a strong portfolio talking point. Modelling a generic from/to change list (strings for schema-agnosticism) is the kind of pragmatic design choice that impresses in code review.',
          steps: [
            'Create `OrderEditChange` with `label`, `from`, `to` (all String).',
            'Create `OrderEdit` with `at` (DateTime), `by` (String), `changes` (List<OrderEditChange>).',
            'Serialize `at` as a Firestore Timestamp.',
            'Serialize `changes` as a list of maps.',
            'On a correction, build the change list and append a new OrderEdit to editLog.',
            'Never mutate existing entries — append only.',
          ],
          code: `// lib/models/order_edit.dart
import 'package:cloud_firestore/cloud_firestore.dart';

class OrderEditChange {
  final String label;  // e.g. "Discount"
  final String from;   // old value, stringified
  final String to;     // new value, stringified

  const OrderEditChange({
    required this.label,
    required this.from,
    required this.to,
  });

  factory OrderEditChange.fromMap(Map<String, dynamic> m) => OrderEditChange(
        label: m['label'] as String? ?? '',
        from: m['from'] as String? ?? '',
        to: m['to'] as String? ?? '',
      );

  Map<String, dynamic> toMap() => {'label': label, 'from': from, 'to': to};
}

class OrderEdit {
  final DateTime at;
  final String by;
  final List<OrderEditChange> changes;

  const OrderEdit({required this.at, required this.by, required this.changes});

  factory OrderEdit.fromMap(Map<String, dynamic> m) => OrderEdit(
        at: (m['at'] as Timestamp?)?.toDate() ?? DateTime.now(),
        by: m['by'] as String? ?? '',
        changes: ((m['changes'] as List?) ?? [])
            .map((e) => OrderEditChange.fromMap(e as Map<String, dynamic>))
            .toList(),
      );

  Map<String, dynamic> toMap() => {
        'at': Timestamp.fromDate(at),
        'by': by,
        'changes': changes.map((c) => c.toMap()).toList(),
      };
}`,
          pitfalls: [
            '**Overwriting editLog instead of appending.** History is lost. Fix: append a new OrderEdit.',
            '**Storing from/to as dynamic.** Mixed types complicate display. Fix: stringify uniformly.',
            '**Omitting `by`.** Changes are unattributable. Fix: always record the editor.',
            '**Forgetting Timestamp conversion for `at`.** Type mismatch on read. Fix: `.toDate()` / `Timestamp.fromDate`.',
            '**Nesting changes without a fallback cast.** Missing field throws. Fix: `(m["changes"] as List?) ?? []`.',
            '**Logging no-op changes.** Clutters the trail. Fix: only append when from != to.',
          ],
          tryIt:
            'Model an OrderEdit by "Owner" changing Discount from "50" to "30" and Parcel from "0" to "20" (two OrderEditChanges). Round-trip it through toMap/fromMap and confirm both changes survive with their labels intact.',
          takeaway:
            'OrderEdit + OrderEditChange form an append-only, attributable trail of every correction made to a settled bill.',
        },
      ],
    },
    {
      id: 'm3-s2',
      title: 'Serialization Patterns',
      topics: [
        {
          id: 'm3-t7',
          title: 'fromMap / toMap: The Two-Way Contract',
          explain:
            'Establish the fromMap (Firestore -> Dart) and toMap (Dart -> Firestore) pair as the single, symmetric contract every model implements.',
          analogy:
            'TunMani Cafe keeps two notebooks in sync: the kitchen\'s working pad (Dart objects in memory) and the accountant\'s ledger (Firestore documents). `fromMap` copies a ledger entry onto the pad; `toMap` copies the pad back into the ledger. As long as both clerks use the exact same column names, nothing is ever lost in translation.',
          theory:
            'Every model exposes a **`factory X.fromMap(Map<String, dynamic> m)`** and a **`Map<String, dynamic> toMap()`**. They must be **symmetric**: every key written by `toMap` is read by `fromMap`, and vice versa, so a round-trip `X.fromMap(x.toMap())` reconstructs an equal object.\n\nFirestore documents are untyped `Map<String, dynamic>`, so `fromMap` is where you **cast and defend**: pick the right type, default missing fields, and normalize (lowercase emails, etc.). `toMap` is simpler — you already hold typed fields — but it decides what gets persisted (e.g. omit computed getters).\n\nThe **doc id** is often passed separately (`fromMap(String id, Map ...)`) because Firestore stores the id outside the document body. `toMap` never includes the id as a field.\n\nKeeping this contract hand-written (rather than code-generated) is fine for an app of this size and keeps the mapping fully visible and debuggable.',
          whyItMatters:
            'fromMap/toMap is the single most-repeated pattern in Flutter+Firebase work, and "walk me through serializing a model" is an almost-guaranteed interview prompt. Symmetric, defensive mapping is what keeps production data clean across schema changes.',
          steps: [
            'For each model, list its persisted fields (excluding computed getters).',
            'Write `toMap` returning a literal map of those fields.',
            'Write `fromMap` reading each key with the correct cast and a sensible default.',
            'Pass the doc id separately where Firestore needs it.',
            'Exclude getters (lineTotal, subtotal) from the map.',
            'Add a round-trip unit test asserting equality.',
          ],
          code: `// The symmetric contract, illustrated on Sku.
class Sku {
  final String id;
  final int code;
  final String name;
  final double price;
  final bool active;

  const Sku({required this.id, required this.code, required this.name,
             required this.price, required this.active});

  // Firestore -> Dart. Defensive: cast, default, normalize. id comes separately.
  factory Sku.fromMap(String id, Map<String, dynamic> m) => Sku(
        id: id,
        code: (m['code'] as num?)?.toInt() ?? 0,
        name: m['name'] as String? ?? '',
        price: (m['price'] as num?)?.toDouble() ?? 0,
        active: m['active'] as bool? ?? true,
      );

  // Dart -> Firestore. Only persisted fields; no id, no getters.
  Map<String, dynamic> toMap() => {
        'code': code,
        'name': name,
        'price': price,
        'active': active,
      };
}

// Round-trip guarantee: Sku.fromMap('x', sku.toMap()) == sku (sans id).`,
          pitfalls: [
            '**Asymmetric maps.** toMap writes a key fromMap never reads (or vice versa). Fix: keep them mirror images.',
            '**Including the id as a field in toMap.** Duplicates the doc name. Fix: id stays out of the body.',
            '**No defaults in fromMap.** A missing field throws on null. Fix: `?? default`.',
            '**Serializing computed getters.** Stale data on read. Fix: persist only source fields.',
            '**Using `as int`/`as double` rigidly.** Firestore number types vary. Fix: cast via `num`.',
            '**Skipping the round-trip test.** Drift goes unnoticed. Fix: assert `fromMap(toMap()) == original`.',
          ],
          tryIt:
            'Pick any model and write a test that builds an instance, calls `toMap`, feeds it back into `fromMap`, and asserts field-by-field equality. Intentionally remove a key from the map and confirm your default keeps it from crashing.',
          takeaway:
            'fromMap and toMap are a symmetric, defensive contract: round-tripping a model must reconstruct an equal object.',
        },
        {
          id: 'm3-t8',
          title: 'Enum (De)serialization by Name',
          explain:
            'Serialize enums (UserRole, RunningType, PaymentType) using their name string and parse them back with values.byName, never by index.',
          analogy:
            'The TunMani Cafe payment register writes "UPI" or "Cash" in words, not a secret code number. If the owner ever reorders the payment list on the screen, the words still mean the same thing — but a numbered code would suddenly point to the wrong method. Storing the enum\'s name is writing the word, not the seat number.',
          theory:
            'Dart enums have a **`.name`** property (the identifier as a string) and **`values.byName(String)`** to parse it back. Always serialize with `e.name` and read with `Enum.values.byName(s)`.\n\nUsing **`.index` is fragile**: it stores a position, so adding or reordering enum values silently remaps old data to the wrong meaning. Names are stable as long as you do not rename the identifiers.\n\nDefend `byName` against bad data: wrap with a default when the stored string is missing or unknown, e.g. `UserRole.values.byName(m["role"] as String? ?? "staff")`. For truly unknown strings, `byName` throws — guard it if your data may be dirty.\n\nThis applies uniformly to `UserRole`, `RunningType`, and `PaymentType` across the app.',
          whyItMatters:
            'Enum-by-name is a small decision with large data-integrity consequences, and "how do you store an enum in Firestore?" is a classic gotcha question. Getting it right means you can evolve enums safely for the life of the app.',
          steps: [
            'Serialize every enum with `value.name`.',
            'Parse with `EnumType.values.byName(string)`.',
            'Provide a default string when the field may be absent.',
            'For dirty data, wrap `byName` in a try/catch or use a safe lookup helper.',
            'Never persist or read `.index`.',
            'Document the allowed name strings near the enum.',
          ],
          code: `// Safe enum helpers, reused by every model.
enum PaymentType { cash, card, upi, credit }

extension PaymentTypeX on PaymentType {
  String get wire => name; // 'cash' | 'card' | 'upi' | 'credit'
}

PaymentType paymentFromWire(String? s) {
  if (s == null) return PaymentType.cash;
  // byName throws on unknown -> guard for dirty data.
  return PaymentType.values
      .firstWhere((e) => e.name == s, orElse: () => PaymentType.cash);
}

// In BillOrder.fromMap / toMap:
// paymentType: paymentFromWire(m['paymentType'] as String?),
// 'paymentType': paymentType.name,`,
          pitfalls: [
            '**Storing `.index`.** Reordering corrupts old documents. Fix: store `.name`.',
            '**`byName` on unknown strings.** Throws at runtime. Fix: a guarded `firstWhere(..., orElse:)`.',
            '**Renaming an enum identifier.** Breaks existing stored names. Fix: treat enum names as a wire contract.',
            '**No default for missing fields.** Crashes on legacy docs. Fix: default to a safe value.',
            '**Mixing display label with wire value.** "UPI" vs "upi". Fix: store lowercase `.name`, format for UI separately.',
            '**Duplicating parse logic per model.** Drifts over time. Fix: a shared helper/extension.',
          ],
          tryIt:
            'Round-trip every PaymentType through `name` and your `paymentFromWire` helper and assert equality. Then feed in the string "venmo" and confirm your guarded parser falls back to a safe default instead of throwing.',
          takeaway:
            'Persist enums by name and parse with a guarded byName so reordering or dirty data never corrupts meaning.',
        },
        {
          id: 'm3-t9',
          title: 'Timestamp <-> DateTime Conversion',
          explain:
            'Convert Firestore Timestamp to Dart DateTime on read (.toDate()) and DateTime to Timestamp on write (Timestamp.fromDate), with sensible defaults.',
          analogy:
            'The TunMani Cafe wall clock (Firestore Timestamp) and the cashier\'s wristwatch (Dart DateTime) tell the same time in different dials. Reading a bill, you glance at the wall clock and copy it to your wrist (`.toDate()`); writing one, you set the wall clock from your wrist (`Timestamp.fromDate`). Forget to convert and you try to read the wall clock as if it were a wristwatch — and it cracks.',
          theory:
            'Firestore stores times as **`Timestamp`** objects, not Dart `DateTime`. On **read**, call **`(m["createdAt"] as Timestamp?)?.toDate()`** to get a `DateTime`; on **write**, wrap with **`Timestamp.fromDate(createdAt)`**.\n\nAlways provide a **default** on read (e.g. `?? DateTime.now()`) because a freshly created doc or a partial write may lack the field. For server-set times you can write **`FieldValue.serverTimestamp()`** instead of a client clock — but then the field is briefly null on the writing client until the server fills it, so your `fromMap` default matters even more.\n\nNever cast a `Timestamp` directly to `DateTime` — it is a different type and throws. The `Timestamp` import comes from `cloud_firestore`.\n\nThis conversion appears on every timestamped field: `createdAt`, `updatedAt`, and the `at` inside each `OrderEdit`.',
          whyItMatters:
            'The Timestamp/DateTime mismatch is one of the most common runtime crashes for Firestore beginners, and handling serverTimestamp\'s transient null is a subtle point that signals real experience. Every timestamped model field depends on getting this right.',
          steps: [
            'Import `Timestamp` from `cloud_firestore`.',
            'On read: `(m["createdAt"] as Timestamp?)?.toDate() ?? DateTime.now()`.',
            'On write: `"createdAt": Timestamp.fromDate(createdAt)`.',
            'Consider `FieldValue.serverTimestamp()` for authoritative server times.',
            'Always default the read in case the field is null.',
            'Apply the same to updatedAt and OrderEdit.at.',
          ],
          code: `// Timestamp <-> DateTime, the safe way.
import 'package:cloud_firestore/cloud_firestore.dart';

DateTime readTime(dynamic v) =>
    (v as Timestamp?)?.toDate() ?? DateTime.now();

// In a model fromMap:
//   createdAt: readTime(m['createdAt']),
//   updatedAt: readTime(m['updatedAt']),

// In a model toMap (client clock):
//   'createdAt': Timestamp.fromDate(createdAt),

// Or, for an authoritative server time on first write:
//   'createdAt': FieldValue.serverTimestamp(),
// NOTE: this is briefly null on the writing client until the server resolves
// it, which is exactly why the read above defaults to DateTime.now().`,
          pitfalls: [
            '**Casting Timestamp directly to DateTime.** Throws a type error. Fix: `.toDate()`.',
            '**Writing a raw DateTime to Firestore.** Stored as an opaque/incorrect value. Fix: `Timestamp.fromDate`.',
            '**No default on read.** serverTimestamp is transiently null and crashes. Fix: `?? DateTime.now()`.',
            '**Mixing client and server time inconsistently.** Ordering bugs across devices. Fix: pick one strategy per field.',
            '**Forgetting the cloud_firestore import.** `Timestamp` is undefined. Fix: import it.',
            '**Ignoring time zones.** DateTime is local by default. Fix: store UTC if cross-zone reporting matters.',
          ],
          tryIt:
            'Write a `readTime` helper and use it for createdAt/updatedAt in RunningOrder. Save a doc with `FieldValue.serverTimestamp()` and immediately read it back on the same client — confirm your default prevents a null crash before the server resolves the value.',
          takeaway:
            '.toDate() on read, Timestamp.fromDate on write, and always default the read so serverTimestamp\'s transient null never crashes you.',
        },
        {
          id: 'm3-t10',
          title: 'Serializing Nested Lists (items & editLog)',
          explain:
            'Serialize lists of nested objects (List<OrderItem>, List<OrderEdit>) by mapping each element through its own toMap, and reverse on read.',
          analogy:
            'A TunMani Cafe bill is a stack of chits — each dish chit and each correction note has its own little form. To file the bill you photocopy every chit (`item.toMap()`) and clip the copies together (`.toList()`). To reopen it, you read each copy back into its own form (`OrderItem.fromMap`). The stack pattern is identical whether the chits are dishes or correction notes.',
          theory:
            'Firestore supports **arrays of maps**, so a `List<OrderItem>` serializes as `items.map((e) => e.toMap()).toList()`. On read you reverse it: `((m["items"] as List?) ?? []).map((e) => OrderItem.fromMap(e as Map<String, dynamic>)).toList()`.\n\nThe same pattern handles **`editLog` (List<OrderEdit>)**, which is doubly nested because each `OrderEdit` itself contains a `List<OrderEditChange>` — the recursion just works because each level owns its `toMap`/`fromMap`.\n\nAlways **cast the list defensively** (`as List?` with a `?? []` fallback) and cast each element to `Map<String, dynamic>`. A missing array field is common on older docs.\n\nDeeply nested arrays of maps are fine in Firestore but cannot be queried by inner fields — that is acceptable here because bills are read whole, not queried by line item.',
          whyItMatters:
            'Nested collection serialization is where beginners crash most often (raw casts on null arrays), and recursive toMap/fromMap composition is an elegant pattern worth demonstrating. Knowing Firestore cannot query inside arrays informs real schema decisions.',
          steps: [
            'Serialize a list with `list.map((e) => e.toMap()).toList()`.',
            'Deserialize with `(m["key"] as List?) ?? []` then map each element.',
            'Cast each element to `Map<String, dynamic>` before its fromMap.',
            'Apply recursively for editLog -> OrderEdit -> OrderEditChange.',
            'Default missing arrays to empty lists.',
            'Avoid relying on querying inside nested arrays.',
          ],
          code: `// Nested list serialization, used in BillOrder.
// WRITE:
Map<String, dynamic> toMap() => {
      'items': items.map((e) => e.toMap()).toList(),
      'editLog': editLog.map((e) => e.toMap()).toList(),
      // ...other fields
    };

// READ (defensive casts + empty-list fallbacks):
factory BillOrder.fromList(Map<String, dynamic> m) {
  final items = ((m['items'] as List?) ?? [])
      .map((e) => OrderItem.fromMap(e as Map<String, dynamic>))
      .toList();
  final editLog = ((m['editLog'] as List?) ?? [])
      .map((e) => OrderEdit.fromMap(e as Map<String, dynamic>))
      .toList();
  // editLog recurses: OrderEdit.fromMap itself maps its 'changes' list.
  return BillOrder._withLists(items: items, editLog: editLog /* ... */);
}`,
          pitfalls: [
            '**Casting a null array with `as List`.** Throws on missing field. Fix: `as List?` then `?? []`.',
            '**Forgetting to map each element.** You store/read raw maps, not typed objects. Fix: `.map(...).toList()`.',
            '**Not casting elements to Map.** `fromMap` gets a dynamic and fails. Fix: `e as Map<String, dynamic>`.',
            '**Expecting to query inside arrays.** Firestore cannot. Fix: model queryable data as separate docs if needed.',
            '**Dropping `.toList()`.** A lazy iterable is not a Firestore array. Fix: materialize with `.toList()`.',
            '**Shallow editLog handling.** Forgetting the inner changes list. Fix: let OrderEdit.fromMap own its recursion.',
          ],
          tryIt:
            'Serialize a BillOrder with two items and one OrderEdit (containing two changes) to a map, then deserialize it back. Assert the items count, the editLog length, and the nested changes count all survive the round-trip.',
          takeaway:
            'Map each element through its own toMap/fromMap and default arrays to empty — nested lists serialize recursively and safely.',
        },
      ],
    },
    {
      id: 'm3-s3',
      title: 'Computed Getters & Business Logic',
      topics: [
        {
          id: 'm3-t11',
          title: 'lineTotal, subtotal, titems & tqty',
          explain:
            'Derive line and order aggregates with getters: lineTotal per item, and subtotal, titems, and tqty across the item list.',
          analogy:
            'When the TunMani Cafe cashier tallies a bill, she never writes the totals on a sticky note that might go stale — she recomputes them by glancing down the chit each time. lineTotal is "price × count" for one row; subtotal is the running sum down the column; titems is how many rows; tqty is how many plates in all. All read straight off the live chit.',
          theory:
            'Aggregates are **computed getters**, never stored fields, so they cannot drift from the items they summarize.\n\n**`lineTotal`** on `OrderItem` is `unitPrice * qty`. On the order, **`subtotal`** folds those: `items.fold(0.0, (s, it) => s + it.lineTotal)`. **`titems`** is `items.length` (number of distinct lines). **`tqty`** is `items.fold(0, (s, it) => s + it.qty)` (total plates).\n\nUse `fold` with the right seed type — `0.0` for doubles, `0` for ints — or you will accidentally get an `int` sum for money. These getters appear on both `RunningOrder` (live total as staff add items) and `BillOrder` (final total).\n\nBecause they are pure functions of `items`, the UI can call them freely on every rebuild without cache-invalidation worries.',
          whyItMatters:
            'Computed-over-stored is a foundational data-integrity principle and a common code-review topic. The fold-seed-type subtlety (0.0 vs 0) is a genuine bug source, making this a precise, demonstrable competence.',
          steps: [
            'Add `lineTotal => unitPrice * qty` to OrderItem.',
            'Add `subtotal` to the order: fold lineTotal with a `0.0` seed.',
            'Add `titems => items.length`.',
            'Add `tqty`: fold qty with a `0` seed.',
            'Never store these as fields.',
            'Unit-test against a known item list.',
          ],
          code: `// Aggregates as pure getters (shared by RunningOrder & BillOrder).
double get subtotal =>
    items.fold(0.0, (sum, it) => sum + it.lineTotal); // 0.0 seed -> double

int get titems => items.length;                       // distinct lines
int get tqty => items.fold(0, (sum, it) => sum + it.qty); // 0 seed -> int

// Example:
//   items = [ neerDosa x2 @40 (=80), koriRotti x1 @120 (=120) ]
//   subtotal = 200.0,  titems = 2,  tqty = 3`,
          pitfalls: [
            '**Storing subtotal as a field.** Drifts when items change. Fix: keep it a getter.',
            '**Folding money with a `0` seed.** Sum becomes int, losing paise. Fix: seed `0.0`.',
            '**Confusing titems with tqty.** Lines vs plates are different. Fix: length vs fold(qty).',
            '**Recomputing in many places.** Inconsistency. Fix: one getter, called everywhere.',
            '**Ignoring seasonal 0-price lines.** They contribute 0 until priced. Fix: ensure unitPrice is set at finalize.',
            '**Caching the getter unnecessarily.** Premature optimization. Fix: it is cheap; just call it.',
          ],
          tryIt:
            'Build an order with neer dosa ×2 @40 and kori rotti ×1 @120. Assert `subtotal == 200.0`, `titems == 2`, and `tqty == 3`. Change a qty and confirm all three update with no extra code.',
          takeaway:
            'Line and order aggregates are cheap pure getters over the item list — compute, never store.',
        },
        {
          id: 'm3-t12',
          title: 'Discount, Parcel Charge & taxableSubtotal',
          explain:
            'Compute taxableSubtotal as (subtotal - discount + parcelCharge) clamped to a non-negative floor.',
          analogy:
            'At TunMani Cafe, the bill base is the food total, minus any goodwill discount the owner grants, plus a packing charge if the fish thali is parcelled to go. But the owner will never tax a negative amount — if a generous discount overshoots, the taxable base bottoms out at zero, never goes red.',
          theory:
            '**`taxableSubtotal`** is the base GST is charged on: `(subtotal - discount + parcelCharge).clamp(0, double.infinity)`.\n\n**`discount`** reduces the base; **`parcelCharge`** is **taxable**, so it is added before tax (not after). The **`.clamp(0, double.infinity)`** guards against a discount larger than the food total producing a negative taxable base — tax is computed on zero, not on a negative number.\n\nOrder of operations matters: discount and parcel are applied to the raw `subtotal` first, then GST is computed on the result (next topic). Getting this sequence wrong is the most common billing math bug.\n\nLike all the money math, `taxableSubtotal` is a getter so it always reflects current items, discount, and parcel.',
          whyItMatters:
            'Tax-base computation with clamping is real commerce logic, and the "is the parcel charge taxable?" / "what if discount exceeds subtotal?" questions are exactly the edge cases reviewers and auditors care about. Demonstrating clamp shows defensive numeric thinking.',
          steps: [
            'Start from `subtotal`.',
            'Subtract `discount`.',
            'Add `parcelCharge` (it is taxable).',
            'Clamp the result to `[0, infinity)`.',
            'Expose it as a getter `taxableSubtotal`.',
            'Test with a discount larger than subtotal to confirm the floor.',
          ],
          code: `// Tax base: discount reduces, parcel adds (taxable), never below zero.
double get taxableSubtotal =>
    (subtotal - discount + parcelCharge).clamp(0, double.infinity);

// Examples:
//   subtotal 200, discount 50, parcel 20 -> 170.0
//   subtotal 100, discount 150, parcel 0 -> clamped to 0.0 (no negative tax base)`,
          pitfalls: [
            '**Adding parcel after tax.** Parcel is taxable; it belongs in the base. Fix: add before computing GST.',
            '**No clamp.** A big discount yields a negative tax base. Fix: `.clamp(0, double.infinity)`.',
            '**Applying discount after tax.** Wrong total. Fix: discount before tax.',
            '**Treating parcel as non-taxable.** Under-collects GST. Fix: include in taxableSubtotal.',
            '**Storing the value.** Drifts. Fix: getter.',
            '**Clamping to an int.** Loses paise. Fix: clamp with double bounds.',
          ],
          tryIt:
            'With subtotal 200, set discount 50 and parcel 20 and assert `taxableSubtotal == 170.0`. Then set discount 250 and assert it clamps to 0.0 — proving the floor protects against negative tax.',
          takeaway:
            'taxableSubtotal = subtotal − discount + parcel, clamped at zero — the correctly ordered, never-negative tax base.',
        },
        {
          id: 'm3-t13',
          title: 'CGST, SGST, totalTax & grandTotal',
          explain:
            'Split GST into CGST (2.5%) and SGST (2.5%) for a 5% total, then add it to the taxable base to get grandTotal.',
          analogy:
            'The TunMani Cafe bill shows GST as two equal halves — CGST for the centre and SGST for Karnataka — each 2.5%, together 5%. The cashier adds that 5% on top of the taxable base, and the figure the guest actually pays at the counter is the grand total.',
          theory:
            'Indian restaurant GST splits into **CGST** and **SGST**, each **2.5%**, totalling **5%**, both charged on `taxableSubtotal`.\n\n**`cgst`** = `taxableSubtotal * 0.025`. **`sgst`** = `taxableSubtotal * 0.025`. **`totalTax`** = `cgst + sgst` (equivalently `taxableSubtotal * 0.05`). **`grandTotal`** = `taxableSubtotal + totalTax`.\n\nShowing CGST and SGST **separately** is a legal requirement on Indian tax invoices, which is why they are distinct getters rather than one 5% figure. Computing each at 2.5% (rather than halving a 5% result) keeps the rounding behaviour explicit and matches the printed invoice line by line.\n\nAll four are getters chained off `taxableSubtotal`, so the entire money column recomputes automatically from items, discount, and parcel.',
          whyItMatters:
            'GST math is real, region-specific business logic that shows you can implement domain rules correctly, and the CGST/SGST split is a concrete India-market detail that strengthens a portfolio. Chained getters demonstrate clean, dependency-ordered computed properties.',
          steps: [
            'Add `cgst => taxableSubtotal * 0.025`.',
            'Add `sgst => taxableSubtotal * 0.025`.',
            'Add `totalTax => cgst + sgst`.',
            'Add `grandTotal => taxableSubtotal + totalTax`.',
            'Display CGST and SGST as separate invoice lines.',
            'Test the full chain against a known taxableSubtotal.',
          ],
          code: `// GST split + grand total, chained off taxableSubtotal.
double get cgst => taxableSubtotal * 0.025;     // 2.5%
double get sgst => taxableSubtotal * 0.025;     // 2.5%
double get totalTax => cgst + sgst;             // 5%
double get grandTotal => taxableSubtotal + totalTax;

// Example: taxableSubtotal 170.0
//   cgst = 4.25, sgst = 4.25, totalTax = 8.50, grandTotal = 178.50`,
          pitfalls: [
            '**Showing one combined 5% line.** Invalid Indian tax invoice. Fix: separate CGST and SGST lines.',
            '**Taxing subtotal instead of taxableSubtotal.** Ignores discount/parcel. Fix: tax the clamped base.',
            '**Rounding each tax then summing inconsistently.** Penny mismatches. Fix: decide a rounding policy and apply once at display.',
            '**Hardcoding 0.05 in many places.** Hard to change rates. Fix: derive from the 2.5% halves or a constant.',
            '**Adding tax before discount.** Wrong base. Fix: discount/parcel feed taxableSubtotal first.',
            '**Storing grandTotal.** Drifts. Fix: getter.',
          ],
          tryIt:
            'With taxableSubtotal 170.0, assert `cgst == 4.25`, `sgst == 4.25`, `totalTax == 8.50`, and `grandTotal == 178.50`. Change the discount and watch every figure recompute through the getter chain.',
          takeaway:
            'CGST 2.5% + SGST 2.5% = 5% on the taxable base, and grandTotal stacks that tax on top — all chained getters.',
        },
        {
          id: 'm3-t14',
          title: 'Status, Place & Bill Label Getters',
          explain:
            'Add presentation getters: isDeleted/statusLabel for status, and placeLabel/shortPlaceLabel to render where a bill belongs (Table/Counter/Walk-in/Room).',
          analogy:
            'A glance at a TunMani Cafe receipt tells you instantly: "Table 5", "Counter", "Walk-in 0007", or "Room 12", and whether it is Paid or Deleted. Those at-a-glance phrases are presentation getters — they turn raw fields (orderType, tableNo, number, status) into the words printed on the ticket and shown in the admin list.',
          theory:
            'Presentation getters keep formatting logic in the model, out of the widgets.\n\n**`isDeleted`** = `status == "DELETED"`; **`statusLabel`** maps it to "Deleted"/"Paid". **`placeLabel`** switches on `orderType` to produce a human phrase: `TABLE` -> "Table N", `COUNTER` -> "Counter", `WALKIN` -> "Walk-in NNNN" (zero-padded), `ROOM` -> "Room N". **`shortPlaceLabel`** is the compact form for tight UI (e.g. "T5", "WI", "R12").\n\nKeeping these on the model means the bill list, the printed receipt, and the admin screen all show **identical wording** with no duplicated `switch` statements scattered across widgets.\n\nBecause they are pure getters over existing fields, they cost nothing and never go stale.',
          whyItMatters:
            'Pushing formatting into model getters (a thin "view model" instinct) keeps UI code clean and consistent, a point reviewers consistently reward. Demonstrating one source of truth for labels shows maintainable design thinking.',
          steps: [
            'Add `isDeleted => status == "DELETED"`.',
            'Add `statusLabel => isDeleted ? "Deleted" : "Paid"`.',
            'Add `placeLabel` switching on `orderType`.',
            'Zero-pad the walk-in number inside placeLabel.',
            'Add `shortPlaceLabel` for compact UI.',
            'Use these getters everywhere instead of inline switches.',
          ],
          code: `// Presentation getters on BillOrder.
bool get isDeleted => status == 'DELETED';
String get statusLabel => isDeleted ? 'Deleted' : 'Paid';

String get placeLabel {
  switch (orderType) {
    case 'TABLE':
      return 'Table \$tableNo';
    case 'COUNTER':
      return 'Counter';
    case 'WALKIN':
      return 'Walk-in \${tableNo.toString().padLeft(4, '0')}';
    case 'ROOM':
      return 'Room \$tableNo';
    default:
      return orderType;
  }
}

String get shortPlaceLabel {
  switch (orderType) {
    case 'TABLE':
      return 'T\$tableNo';
    case 'COUNTER':
      return 'CTR';
    case 'WALKIN':
      return 'WI';
    case 'ROOM':
      return 'R\$tableNo';
    default:
      return orderType;
  }
}`,
          pitfalls: [
            '**Duplicating the orderType switch in widgets.** Labels drift apart. Fix: one getter on the model.',
            '**Forgetting the default case.** Unknown orderType renders blank. Fix: fall back to the raw string.',
            '**Hardcoding status strings in the UI.** Inconsistent capitalization. Fix: use statusLabel.',
            '**Not zero-padding walk-in numbers.** "Walk-in 7" looks unfinished. Fix: `padLeft(4, "0")`.',
            '**Mixing place and status logic.** Harder to read. Fix: separate getters.',
            '**Putting locale text inline.** Hard to translate. Fix: centralize, then localize later.',
          ],
          tryIt:
            'For a WALKIN bill with number 7, assert `placeLabel == "Walk-in 0007"` and `shortPlaceLabel == "WI"`. Flip status to DELETED and confirm `statusLabel` becomes "Deleted". Swap a widget\'s inline label for the getter and watch the duplication vanish.',
          takeaway:
            'Status and place labels belong on the model as pure getters, giving every screen one consistent source of wording.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm3-p1',
      type: 'Mini Project',
      title: 'TunMani Cafe Models + Unit Tests',
      domain: 'Restaurant POS Data Modelling',
      duration: '2 hours',
      description:
        'Implement the full TunMani Cafe model layer — AppUser, Sku, OrderItem, RunningOrder, BillOrder, OrderEdit/OrderEditChange — with symmetric fromMap/toMap (enum-by-name, Timestamp conversion, nested lists) and computed getters, then prove it all with round-trip and money-math unit tests.',
      tools: ['Flutter', 'cloud_firestore', 'flutter_test'],
      blueprint: {
        overview:
          'Write every model class as an immutable Dart class with defensive fromMap and symmetric toMap, enum serialization by name, Timestamp<->DateTime conversion, recursive nested-list handling, and all computed getters (lineTotal, subtotal, taxableSubtotal, cgst/sgst, grandTotal, place/status labels). Back it with a test suite that round-trips each model and verifies the GST math.',
        functionalRequirements: [
          '**All models implemented.** AppUser, Sku, OrderItem, RunningOrder, BillOrder, OrderEdit, OrderEditChange.',
          '**Round-trip integrity.** fromMap(toMap()) reconstructs an equal object for every model.',
          '**Enum by name.** UserRole, RunningType, PaymentType serialize via name with safe defaults.',
          '**Timestamp conversion.** createdAt/updatedAt/at convert correctly and default when absent.',
          '**Money math.** taxableSubtotal clamps at zero; CGST/SGST are 2.5% each; grandTotal stacks 5%.',
          '**Labels.** placeLabel/shortPlaceLabel/statusLabel render the four order types and status correctly.',
        ],
        technicalImplementation: [
          '**Defensive fromMap.** num-casts for numbers, lowercase email, byName for enums, ?? defaults everywhere.',
          '**Symmetric toMap.** No id, no getters; enums as name; DateTimes as Timestamp.',
          '**Nested lists.** items and editLog mapped recursively with as List? + ?? [] fallbacks.',
          '**Computed getters.** lineTotal, subtotal, titems, tqty, taxableSubtotal, cgst, sgst, totalTax, grandTotal.',
          '**Presentation getters.** isDeleted, statusLabel, placeLabel, shortPlaceLabel, label, billOrderType.',
          '**Tests.** flutter_test round-trip per model plus explicit GST and clamp assertions.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold models',
            outcome: 'Empty model files and enums in lib/models with cloud_firestore imported where needed.',
            prompt:
              'In a Flutter project, create lib/models with files app_user.dart, sku.dart, order_item.dart, running_order.dart, bill_order.dart, and order_edit.dart. Declare the enums UserRole { admin, staff }, RunningType { walkin, room }, and PaymentType { cash, card, upi, credit }. Add immutable class skeletons with const constructors and required named params for each model. Do not write fromMap/toMap or getters yet.',
          },
          {
            step: 2,
            label: 'Serialization',
            outcome: 'Symmetric fromMap/toMap for every model with enum-by-name, Timestamp conversion, and nested lists.',
            prompt:
              'Implement fromMap and toMap for every TunMani Cafe model. Use num-casts for numeric fields with sensible defaults, lowercase email in AppUser, serialize enums with .name and parse with a guarded values.byName, convert Firestore Timestamp to DateTime with .toDate() (defaulting to DateTime.now()) and back with Timestamp.fromDate. For RunningOrder.items and BillOrder.items/editLog, map nested objects recursively using (m[key] as List?) ?? [] and cast each element to Map<String, dynamic>. Exclude the doc id and computed getters from toMap.',
          },
          {
            step: 3,
            label: 'Computed getters',
            outcome: 'All money and presentation getters implemented and chained correctly.',
            prompt:
              'Add computed getters. OrderItem.lineTotal = unitPrice * qty. On RunningOrder and BillOrder add subtotal (fold lineTotal with 0.0 seed), titems (items.length), tqty (fold qty with 0 seed). On BillOrder add taxableSubtotal = (subtotal - discount + parcelCharge).clamp(0, double.infinity), cgst = taxableSubtotal*0.025, sgst = taxableSubtotal*0.025, totalTax = cgst+sgst, grandTotal = taxableSubtotal+totalTax. Add isDeleted/statusLabel and placeLabel/shortPlaceLabel switching on orderType (TABLE/COUNTER/WALKIN/ROOM), zero-padding walk-in numbers. On RunningOrder add isWalkin, label, and billOrderType.',
          },
          {
            step: 4,
            label: 'Unit tests',
            outcome: 'A flutter_test suite proving round-trip integrity and GST math.',
            prompt:
              'Write flutter_test unit tests in test/models_test.dart. For each model, build an instance, round-trip it through fromMap(toMap()) and assert field-by-field equality (including nested items and editLog). Add explicit tests: an order with neer dosa x2 @40 and kori rotti x1 @120 has subtotal 200.0, titems 2, tqty 3; with discount 50 and parcel 20, taxableSubtotal is 170.0, cgst and sgst are 4.25 each, totalTax 8.50, grandTotal 178.50; a discount of 250 clamps taxableSubtotal to 0.0; a WALKIN bill numbered 7 yields placeLabel "Walk-in 0007".',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm3-q1',
      q: 'Why is OrderItem.lineTotal a getter (unitPrice * qty) instead of a stored field?',
      options: [
        'Firestore cannot store doubles',
        'So it can never drift out of sync with unitPrice and qty',
        'To save network bandwidth',
        'Because getters are faster than fields',
      ],
      answer: 1,
    },
    {
      id: 'm3-q2',
      q: 'How should the UserRole/PaymentType enums be persisted to Firestore?',
      options: [
        'By their .index integer',
        'By their .name string, parsed back with a guarded values.byName',
        'As a boolean',
        'As the doc id',
      ],
      answer: 1,
    },
    {
      id: 'm3-q3',
      q: 'A Sku has price 0. What does that signify in TunMani Cafe Billing?',
      options: [
        'The item is free',
        'The item is deleted',
        'The item is seasonal/TBD and staff enter the price at finalize',
        'The item is an admin-only item',
      ],
      answer: 2,
    },
    {
      id: 'm3-q4',
      q: 'How is taxableSubtotal computed on a BillOrder?',
      options: [
        '(subtotal - discount + parcelCharge).clamp(0, double.infinity)',
        'subtotal + discount - parcelCharge',
        'subtotal * 1.05',
        'subtotal - parcelCharge',
      ],
      answer: 0,
    },
    {
      id: 'm3-q5',
      q: 'For a restaurant bill in Karnataka, how is the 5% GST represented in the model?',
      options: [
        'A single 5% totalTax getter only',
        'CGST 2.5% and SGST 2.5% as separate getters that sum to totalTax (5%)',
        'IGST 5% as one line',
        'It is stored as a fixed field on the document',
      ],
      answer: 1,
    },
    {
      id: 'm3-q6',
      q: 'When reading a Firestore document field stored as a Timestamp into a DateTime, you should:',
      options: [
        'Cast it directly with `as DateTime`',
        'Call `(value as Timestamp?)?.toDate()` and default when null',
        'Parse it from a string',
        'Multiply it by 1000',
      ],
      answer: 1,
    },
  ],
};
