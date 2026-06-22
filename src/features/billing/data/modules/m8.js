// Module 8 — Bluetooth Printing & PDF Invoices
// TunMani Cafe Billing (Flutter POS) course content for the React course player.

export const m8 = {
  id: 'm8',
  title: 'Bluetooth Printing & PDF Invoices',
  hours: 8,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Turn a finalized order into a real paper receipt on a 58mm thermal printer, and into a shareable PDF invoice. You build the PrintService, the ESC/POS receipt layout, and the PDF generator with a share sheet.',
  sections: [
    {
      id: 'm8-s1',
      title: 'Bluetooth Thermal Printer',
      topics: [
        {
          id: 'm8-t1',
          title: 'Android Bluetooth Permissions with permission_handler',
          explain:
            'Before any printing can happen, Android 12+ needs you to request the runtime BLUETOOTH_CONNECT and BLUETOOTH_SCAN permissions at the exact moment the cashier taps "Connect printer".',
          analogy:
            'At TunMani Cafe, the thermal printer sits behind the cash counter, but the steward at the door still checks every delivery boy who walks in before letting him near the kitchen. Android is that doorman: even though the printer is paired and sitting right there, the OS will not let your app talk to it until the user has personally said "yes, this app may connect to Bluetooth devices". You ask politely, once, at the counter — not while the customer is waiting for kori rotti.',
          theory:
            'On **Android 12 (API 31) and above**, the old `BLUETOOTH` and `BLUETOOTH_ADMIN` permissions were split into runtime permissions: **`BLUETOOTH_CONNECT`** (talk to an already-paired device) and **`BLUETOOTH_SCAN`** (discover nearby devices). These are *dangerous* permissions, so they must be requested at runtime, not just declared in the manifest.\n\nYou declare them in `android/app/src/main/AndroidManifest.xml` and request them with the **`permission_handler`** package. The pattern is: check the current status, request if not granted, and only proceed to Bluetooth work when the user grants it.\n\n`Permission.bluetoothConnect.request()` returns a `PermissionStatus`. Useful states are `granted`, `denied` (user said no, can ask again), and `permanentlyDenied` (user ticked "don\'t ask again" — you must send them to app settings with `openAppSettings()`).\n\nOlder devices (Android 11 and below) do not have these split permissions; there `BLUETOOTH` is a normal install-time permission and the request returns `granted` immediately, so the same code path works everywhere.',
          whyItMatters:
            'If you skip the runtime request, your printer code throws a `SecurityException` the first time it touches Bluetooth on a modern phone — and the cashier just sees "print failed" with no idea why. Handling permissions cleanly is the difference between a one-tap "Connect printer" and a confusing dead end at the counter during a dinner rush.',
          steps: [
            'Add `permission_handler` to `pubspec.yaml` and run `flutter pub get`.',
            'In `AndroidManifest.xml`, declare `BLUETOOTH_CONNECT` and `BLUETOOTH_SCAN` with `android:usesPermissionFlags="neverForLocation"` on SCAN.',
            'Also keep legacy `BLUETOOTH` and `BLUETOOTH_ADMIN` with `android:maxSdkVersion="30"` for old phones.',
            'Write a `requestBluetoothPermissions()` helper that requests both `bluetoothConnect` and `bluetoothScan`.',
            'Check the returned statuses; return `true` only if every required permission is `granted`.',
            'If any is `permanentlyDenied`, call `openAppSettings()` so the user can flip it on manually.',
            'Call this helper from the Printer Setup screen before scanning or connecting.',
          ],
          code: `// AndroidManifest.xml (inside <manifest>, above <application>)
// <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
// <uses-permission android:name="android.permission.BLUETOOTH_SCAN"
//     android:usesPermissionFlags="neverForLocation" />
// <uses-permission android:name="android.permission.BLUETOOTH"
//     android:maxSdkVersion="30" />
// <uses-permission android:name="android.permission.BLUETOOTH_ADMIN"
//     android:maxSdkVersion="30" />

import 'package:permission_handler/permission_handler.dart';

/// Asks for the Bluetooth permissions the printer needs.
/// Returns true only when every permission is granted.
Future<bool> requestBluetoothPermissions() async {
  final statuses = await [
    Permission.bluetoothConnect,
    Permission.bluetoothScan,
  ].request();

  // If any permission was permanently denied, send the user to settings.
  final permanentlyDenied =
      statuses.values.any((s) => s.isPermanentlyDenied);
  if (permanentlyDenied) {
    await openAppSettings();
    return false;
  }

  return statuses.values.every((s) => s.isGranted);
}`,
          pitfalls: [
            '**Only declaring permissions in the manifest.** On Android 12+ that is not enough — dangerous permissions must be requested at runtime or Bluetooth calls throw `SecurityException`. Fix: always call `.request()`.',
            '**Requesting at app startup.** Users deny permissions they do not understand. Fix: request the moment they tap "Connect printer", when the reason is obvious.',
            '**Forgetting `neverForLocation` on BLUETOOTH_SCAN.** Without it, Android also demands location permission, confusing the user. Fix: add `usesPermissionFlags="neverForLocation"`.',
            '**Not handling `permanentlyDenied`.** Once the user ticks "don\'t ask again", `.request()` silently returns denied forever. Fix: detect it and call `openAppSettings()`.',
            '**Testing only on one phone.** Android 11 and Android 13 behave differently here. Fix: test on at least one pre-12 and one post-12 device.',
            '**Blocking the UI while requesting.** The request shows a system dialog; do not freeze the screen. Fix: `await` it inside an async handler and show a spinner if needed.',
          ],
          tryIt:
            'Add the four manifest entries and the `requestBluetoothPermissions()` helper. Wire a temporary button that prints the result to the console. Run it on a real Android 12+ phone (not the emulator — emulators have no Bluetooth) and confirm you see the system permission dialog, then `true` in the log.',
          takeaway:
            'Declare Bluetooth permissions in the manifest, then request BLUETOOTH_CONNECT and BLUETOOTH_SCAN at runtime exactly when the user taps "Connect printer".',
        },
        {
          id: 'm8-t2',
          title: 'Listing & Connecting Paired Printers',
          explain:
            'Use the print_bluetooth_thermal package to list the phone\'s already-paired Bluetooth devices and connect to the chosen one by its MAC address.',
          analogy:
            'Pairing a Bluetooth device is like the printer salesman first introducing himself to the TunMani Cafe manager and exchanging visiting cards — done once, in Android Settings. After that, every evening the cashier just picks the printer\'s name off a short list and says "you, come here" — no re-introduction needed. Your app reads that list of already-introduced devices and dials the right one by its MAC address, the printer\'s unique phone number.',
          theory:
            'The **`print_bluetooth_thermal`** package works with **classic Bluetooth (SPP)** thermal printers — the common 58mm counter printers. It does not pair devices for you; pairing happens once in **Android Settings → Bluetooth**. Your app then reads the *paired* list.\n\n`PrintBluetoothThermal.pairedBluetooths` returns a `List<BluetoothInfo>`, where each entry has a `name` (e.g. "POS58") and a `macAdress` (the package\'s spelling — note the single `d`). The **MAC address** is the stable identifier; the name can repeat or be blank, so always connect and persist by MAC.\n\nTo connect, call `PrintBluetoothThermal.connect(macPrinterAddress: mac)`, which returns a `bool`. You can check the live link with `PrintBluetoothThermal.connectionStatus` and the adapter state with `PrintBluetoothThermal.bluetoothEnabled`.\n\nThis all belongs in a single **`services/print_service.dart`** so the UI never touches the package directly — screens ask the service to "list", "connect", "isConnected", and the service hides the package details.',
          whyItMatters:
            'A clean PrintService is what lets you swap printer brands or libraries later without rewriting every screen. And connecting by MAC (not name) is what makes "remember my printer" reliable — two identical "POS58" printers in a busy kitchen will not confuse your app.',
          steps: [
            'Add `print_bluetooth_thermal` to `pubspec.yaml` and run `flutter pub get`.',
            'Create `services/print_service.dart` with a `PrintService` class.',
            'Add `Future<List<BluetoothInfo>> pairedDevices()` returning `PrintBluetoothThermal.pairedBluetooths`.',
            'Add `Future<bool> connect(String mac)` calling `PrintBluetoothThermal.connect(macPrinterAddress: mac)`.',
            'Add `Future<bool> isConnected()` returning `PrintBluetoothThermal.connectionStatus`.',
            'Guard everything: first ensure permissions and that `bluetoothEnabled` is true.',
            'In the Printer Setup screen, show the paired list and connect on tap, by MAC.',
          ],
          code: `import 'package:print_bluetooth_thermal/print_bluetooth_thermal.dart';

class PrintService {
  /// Devices already paired in Android Settings.
  Future<List<BluetoothInfo>> pairedDevices() async {
    final on = await PrintBluetoothThermal.bluetoothEnabled;
    if (!on) return [];
    return PrintBluetoothThermal.pairedBluetooths;
  }

  /// Connect by MAC address (the stable identifier).
  Future<bool> connect(String mac) async {
    return PrintBluetoothThermal.connect(macPrinterAddress: mac);
  }

  /// Is a printer link currently open?
  Future<bool> isConnected() async {
    return PrintBluetoothThermal.connectionStatus;
  }
}

// --- in printer_screen.dart, listing then connecting ---
// final devices = await printService.pairedDevices();
// ListView(children: [
//   for (final d in devices)
//     ListTile(
//       title: Text(d.name),
//       subtitle: Text(d.macAdress), // note: single 'd' spelling
//       onTap: () => printService.connect(d.macAdress),
//     ),
// ]);`,
          pitfalls: [
            '**Expecting the package to discover/pair devices.** It only lists *paired* ones. Fix: tell the user to pair in Android Settings first.',
            '**Connecting by device name.** Names repeat or are empty. Fix: always connect and store by `macAdress`.',
            '**Misspelling the property.** The package field is `macAdress` (single d), not `macAddress`. Fix: use the exact spelling the package exposes.',
            '**Listing while Bluetooth is off.** `pairedBluetooths` returns empty or errors. Fix: check `bluetoothEnabled` first and prompt the user.',
            '**Calling the package from widgets.** Spreads printer logic everywhere. Fix: keep it all inside `PrintService`.',
            '**Assuming connect is instant.** It is async and can fail. Fix: `await` the `bool` and show feedback.',
          ],
          tryIt:
            'Pair your thermal printer in Android Settings. In a test screen, call `pairedDevices()` and render the list with name and MAC. Tap one, call `connect()`, then `isConnected()`, and show a green "Connected" tick. Confirm the MAC, not the name, is what you pass to connect.',
          takeaway:
            'List the OS-paired devices, connect by MAC address, and hide the package behind a single PrintService.',
        },
        {
          id: 'm8-t3',
          title: 'Persisting the Chosen Printer with shared_preferences',
          explain:
            'Save the selected printer\'s MAC address in shared_preferences so the app auto-reconnects every time, instead of asking the cashier to pick it again.',
          analogy:
            'Once the TunMani Cafe manager has decided "this is our printer", he writes its name on a sticky note taped to the cash drawer — nobody has to rediscover it each morning. `shared_preferences` is that sticky note: a tiny, always-there scrap of storage where you jot the printer\'s MAC so the very next bill prints without a single extra tap.',
          theory:
            '**`shared_preferences`** is a small key–value store backed by Android `SharedPreferences`. It is perfect for a single string like a printer MAC — not for orders or bills (those live in your database). It persists across app restarts.\n\nYou get an instance with `SharedPreferences.getInstance()`, then `prefs.setString(key, value)` to save and `prefs.getString(key)` to read (returns `String?` — null when never set). To forget the printer, `prefs.remove(key)`.\n\nFold this into `PrintService`: a `saveSelectedMac(mac)`, a `savedMac()` getter, and a `clearSavedMac()`. On app start (or when the cashier opens billing), the service reads `savedMac()` and, if present and not already connected, silently calls `connect(mac)`. This gives a true "set it once" experience.\n\nKeep a single constant key like `_kPrinterMacKey = \'printer_mac\'` so you never typo it in two places.',
          whyItMatters:
            'Re-selecting the printer on every shift is exactly the kind of friction that makes counter staff abandon a "smart" app and go back to a manual bill book. Auto-reconnect from a saved MAC is a small feature that earns daily trust.',
          steps: [
            'Add `shared_preferences` to `pubspec.yaml` and run `flutter pub get`.',
            'Define a private key constant `_kPrinterMacKey = \'printer_mac\'` in `PrintService`.',
            'Add `Future<void> saveSelectedMac(String mac)` using `setString`.',
            'Add `Future<String?> savedMac()` using `getString`.',
            'Add `Future<void> clearSavedMac()` using `remove`.',
            'Add `Future<bool> ensureConnected()` that reconnects from `savedMac()` if not already connected.',
            'Call `saveSelectedMac` right after a successful connect on the Printer Setup screen.',
          ],
          code: `import 'package:shared_preferences/shared_preferences.dart';
import 'package:print_bluetooth_thermal/print_bluetooth_thermal.dart';

class PrintService {
  static const _kPrinterMacKey = 'printer_mac';

  Future<void> saveSelectedMac(String mac) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kPrinterMacKey, mac);
  }

  Future<String?> savedMac() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_kPrinterMacKey);
  }

  Future<void> clearSavedMac() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kPrinterMacKey);
  }

  /// Reconnect silently using the remembered printer.
  Future<bool> ensureConnected() async {
    if (await PrintBluetoothThermal.connectionStatus) return true;
    final mac = await savedMac();
    if (mac == null) return false;
    return PrintBluetoothThermal.connect(macPrinterAddress: mac);
  }
}`,
          pitfalls: [
            '**Storing orders or bills in shared_preferences.** It is for tiny settings only. Fix: keep business data in Firestore/your DB; store just the MAC here.',
            '**Hard-coding the key string twice.** A typo in one place silently breaks save/read. Fix: one private constant.',
            '**Forgetting that getString returns null.** First run has no saved MAC. Fix: null-check before reconnecting.',
            '**Never offering a "forget printer" option.** Staff may switch printers. Fix: expose `clearSavedMac()` in settings.',
            '**Reconnecting on a non-existent device.** A saved MAC can point to an unpaired printer. Fix: handle the `false` return and re-prompt selection.',
            '**Calling getInstance repeatedly in tight loops.** Minor waste. Fix: it is cached, but avoid calling it per item; call once per operation.',
          ],
          tryIt:
            'Extend PrintService with the save/read/clear methods. After connecting on the setup screen, save the MAC. Kill and relaunch the app, call `ensureConnected()`, and confirm it reconnects with zero taps. Then add a "Forget printer" button and verify the next launch asks you to pick again.',
          takeaway:
            'Persist only the printer MAC in shared_preferences and auto-reconnect on launch for a true set-it-once experience.',
        },
        {
          id: 'm8-t4',
          title: 'isConnected, disconnect & Connection State',
          explain:
            'Track and reflect the live connection: check isConnected before printing, disconnect cleanly, and show the cashier a clear connected/disconnected status.',
          analogy:
            'Before a TunMani Cafe waiter shouts an order through the kitchen window, he glances to see the cook is actually standing there. Calling `isConnected()` before printing is that glance — there is no point firing receipt bytes at a printer that wandered off (ran out of battery, got switched off, walked out of range). And at closing time you tell the cook "you can go now" — that is `disconnect()`, freeing the link cleanly.',
          theory:
            'Bluetooth links are fragile: the printer can be powered off, drift out of range, or the OS can drop the socket. So your service should never *assume* a connection — it should **check before each print** and **reconnect if needed** (via the `ensureConnected()` you built).\n\n`PrintBluetoothThermal.connectionStatus` is your live truth. Wrap it as `isConnected()`. For teardown, `PrintBluetoothThermal.disconnect` closes the socket; call it from the Printer Setup screen\'s "Disconnect" button and consider it on app dispose.\n\nFor the UI, expose the state so the **Printer Setup screen** (`screens/admin/printer_screen.dart`) can show a green "Connected to POS58" chip or a red "Not connected" one. A simple approach is a `FutureBuilder` or a small state flag refreshed after each connect/disconnect. The screen lists paired devices, lets the user connect (and persist), shows status, and offers disconnect/forget.',
          whyItMatters:
            'A stale "Connected" label that lies is worse than none — the cashier taps Print, nothing comes out, and the customer waits. Checking and surfacing the real state keeps the counter honest and makes "why is it not printing?" a one-glance answer.',
          steps: [
            'Add `Future<bool> isConnected()` and `Future<void> disconnect()` to `PrintService`.',
            'In `printBill` (next topic), call `ensureConnected()` and bail early if it returns false.',
            'Build `printer_screen.dart`: a paired-device list, a status chip, Connect, Disconnect, and Forget buttons.',
            'After connect/disconnect, refresh the status chip.',
            'Show the connected device name when available.',
            'Disconnect on screen dispose if you opened the link only for setup.',
            'Surface errors as a SnackBar rather than crashing.',
          ],
          code: `class PrintService {
  Future<bool> isConnected() => PrintBluetoothThermal.connectionStatus;

  Future<void> disconnect() async {
    await PrintBluetoothThermal.disconnect;
  }
}

// --- printer_screen.dart: a live status chip ---
FutureBuilder<bool>(
  future: printService.isConnected(),
  builder: (context, snap) {
    final connected = snap.data ?? false;
    return Chip(
      avatar: Icon(
        connected ? Icons.check_circle : Icons.error_outline,
        color: connected ? Colors.green : Colors.red,
      ),
      label: Text(connected ? 'Connected' : 'Not connected'),
    );
  },
);

// Connect + persist + refresh, on tapping a device:
// final ok = await printService.connect(device.macAdress);
// if (ok) {
//   await printService.saveSelectedMac(device.macAdress);
//   setState(() {}); // refresh the FutureBuilder
// }`,
          pitfalls: [
            '**Caching a boolean "connected" forever.** It goes stale silently. Fix: re-check `connectionStatus` before each print.',
            '**Printing without an isConnected guard.** Bytes vanish into nowhere. Fix: guard with `ensureConnected()`.',
            '**Never disconnecting.** Leaves the socket open and can block reconnects. Fix: disconnect on explicit user action or dispose.',
            '**Status chip not refreshed.** UI lies after connect. Fix: `setState` after connect/disconnect, or use a stream.',
            '**Assuming disconnect is synchronous.** It is a Future. Fix: `await` it.',
            '**Crashing on Bluetooth errors.** They are routine. Fix: try/catch and SnackBar the message.',
          ],
          tryIt:
            'Finish `printer_screen.dart` with the status chip, Connect, Disconnect, and Forget buttons. Connect to your printer, power the printer off, and tap a refresh — the chip should flip to red. Power it back on, reconnect, and confirm green. This proves your status reflects reality.',
          takeaway:
            'Treat the Bluetooth link as fragile: re-check isConnected before every print, disconnect cleanly, and show the real state.',
        },
      ],
    },
    {
      id: 'm8-s2',
      title: 'ESC/POS Receipt Format',
      topics: [
        {
          id: 'm8-t5',
          title: 'ESC/POS Basics & a 32-Character Wide Receipt',
          explain:
            'Thermal printers speak ESC/POS — a stream of bytes with control commands. A 58mm printer fits about 32 characters per line, which shapes your whole layout.',
          analogy:
            'A thermal printer does not understand "make this bold and centered" the way a fancy invoice does. It is more like the old TunMani Cafe telegram operator: you send it a stream of plain characters plus a few coded signals — "tall now", "center now", "cut the paper" — and it obeys in order. ESC/POS is that telegram code, and your receipt is a narrow 32-column strip, like a single column of a thali menu card.',
          theory:
            '**ESC/POS** (Epson Standard Code for Point of Sale) is the de-facto command language for thermal receipt printers. A receipt is just a **stream of bytes**: printable characters plus small **control sequences** that start with `ESC` (0x1B) or `GS` (0x1D). For example `ESC a 1` centers text, `ESC E 1` turns on bold, `GS V` cuts the paper.\n\nA **58mm printer** prints roughly **32 characters per line** in the standard font (some print 42 in a smaller font; 32 is the safe default). This width is the single most important constraint of your layout: store names, item rows, and totals must all fit — or wrap ugly.\n\nRather than hand-encode raw bytes, the **`esc_pos_utils_plus`** package gives a `Generator` that emits the right bytes for `text`, `row`, `feed`, `cut`, alignment, and styles. You build a `List<int>` of bytes, then hand it to `print_bluetooth_thermal` to send.\n\nThink in **helpers**: a `divider()` that prints 32 dashes, a `kv(label, value)` that puts a label left and value right on one 32-char line, and a `center(text)` wrapper. These keep the receipt code readable.',
          whyItMatters:
            'Every misaligned column, every clipped store name, every receipt that prints garbage comes from misunderstanding the byte stream and the 32-char width. Master the model once and your receipts look professionally typeset on a ₹1500 printer.',
          steps: [
            'Add `esc_pos_utils_plus` to `pubspec.yaml` and run `flutter pub get`.',
            'Create a `Generator` with a `PaperSize.mm58` profile.',
            'Write a `divider()` helper that emits 32 dashes.',
            'Write a `center(text)` helper using `PosAlign.center`.',
            'Write a `kv(label, value)` helper using two `PosColumn`s that total 12 width units.',
            'Build a tiny test receipt: centered title, divider, one kv row, feed, cut.',
            'Send the resulting bytes through the printer and inspect alignment.',
          ],
          code: `import 'package:esc_pos_utils_plus/esc_pos_utils_plus.dart';

Future<List<int>> buildTestReceipt() async {
  final profile = await CapabilityProfile.load();
  final g = Generator(PaperSize.mm58, profile); // 58mm ~= 32 chars
  final bytes = <int>[];

  // Centered, double-height title.
  bytes.addAll(g.text(
    'TUNMANI CAFE',
    styles: const PosStyles(
      align: PosAlign.center,
      height: PosTextSize.size2,
      width: PosTextSize.size2,
      bold: true,
    ),
  ));

  bytes.addAll(g.text('-' * 32)); // a 32-char divider

  // A label-left / value-right row using the 12-unit column grid.
  bytes.addAll(g.row([
    PosColumn(text: 'Bill No', width: 6),
    PosColumn(
      text: '0042',
      width: 6,
      styles: const PosStyles(align: PosAlign.right),
    ),
  ]));

  bytes.addAll(g.feed(2));
  bytes.addAll(g.cut());
  return bytes;
}`,
          pitfalls: [
            '**Assuming 80mm width.** A 58mm printer is ~32 chars; an 80mm layout overflows and wraps. Fix: design for 32.',
            '**Hand-rolling raw ESC bytes.** Error-prone and unreadable. Fix: use the `Generator` helpers.',
            '**PosColumn widths not summing to 12.** The row grid is 12 units; bad sums misalign. Fix: make every row total exactly 12.',
            '**Forgetting the paper cut/feed.** The next bill tears off mid-receipt. Fix: end with `feed` then `cut`.',
            '**Not loading a CapabilityProfile.** Some commands depend on it. Fix: `await CapabilityProfile.load()` once.',
            '**Hard-coding 32-dash strings everywhere.** Repetition breeds typos. Fix: a `divider()` helper.',
          ],
          tryIt:
            'Build `buildTestReceipt()` and print it. Hold a ruler to the paper: the title should be centered, the divider should reach both edges, and "Bill No" left with "0042" hard against the right margin. If the value floats in the middle, your column widths do not sum to 12 — fix and reprint.',
          takeaway:
            'Receipts are byte streams 32 characters wide; build them with Generator helpers, and always feed-and-cut at the end.',
        },
        {
          id: 'm8-t6',
          title: 'Receipt Header: Store Details from Settings',
          explain:
            'Print the store header — name, address, phone, GSTIN — pulled from your Store settings, then the "CASH BILL" title and the bill metadata block.',
          analogy:
            'Every TunMani Cafe bill, whether it is one neer dosa or a full fish thali for twelve, opens the same way: the restaurant\'s name in bold at the top, the Court Road address, the phone, and the GSTIN — exactly like the letterhead on the manager\'s order pad. You print this masthead first so the customer instantly knows whose kitchen this came from.',
          theory:
            'The header should be **data-driven**, read from a `Store` settings object (loaded from Firestore), not hard-coded — so the same code works if the restaurant updates its phone or GSTIN. Typical fields: `name`, `address`, `phone`, `gstin`.\n\nLayout, centered: **store name** (bold, double-height), **address** (may wrap across two 32-char lines), **phone**, and **GSTIN** (e.g. `GSTIN: 29ABCDE1234F1Z5`). Then a divider, then a centered **"CASH BILL"** title.\n\nBelow that comes the **metadata block**, usually as label/value rows: **date & time**, **bill no**, a **place label** (e.g. "Kundapura"), and an **attended-by / user / machine** line so you know which cashier and till produced the bill. Pull date from the order\'s timestamp, bill no from the order, and the user from your auth/session.\n\nKeep header building in its own helper inside the receipt builder so `printBill` reads top-to-bottom like the printed receipt itself.',
          whyItMatters:
            'The GSTIN and store identity on a receipt are not decoration — they are what make the bill a valid tax document and let a customer trust it. Driving them from settings means a single edit updates every future receipt, no app rebuild needed.',
          steps: [
            'Define or load a `Store` object with `name`, `address`, `phone`, `gstin`.',
            'Center and bold-print the store name at double height.',
            'Print address (wrapping is fine), phone, and `GSTIN: ...` centered.',
            'Print a divider, then a centered "CASH BILL".',
            'Print a metadata block: date/time, bill no, place label.',
            'Print an "Attended by / Machine" line from the session.',
            'Wrap all of this in a `_header(g, store, order)` helper.',
          ],
          code: `List<int> _header(Generator g, Store store, Order order) {
  final b = <int>[];
  final center = const PosStyles(align: PosAlign.center);

  b.addAll(g.text(store.name,
      styles: const PosStyles(
        align: PosAlign.center,
        bold: true,
        height: PosTextSize.size2,
        width: PosTextSize.size2,
      )));
  b.addAll(g.text(store.address, styles: center));
  b.addAll(g.text('Ph: \${store.phone}', styles: center));
  b.addAll(g.text('GSTIN: \${store.gstin}', styles: center));
  b.addAll(g.text('-' * 32));
  b.addAll(g.text('CASH BILL',
      styles: const PosStyles(align: PosAlign.center, bold: true)));

  // Metadata rows.
  b.addAll(g.row([
    PosColumn(text: 'Date', width: 4),
    PosColumn(
        text: _fmt(order.createdAt),
        width: 8,
        styles: const PosStyles(align: PosAlign.right)),
  ]));
  b.addAll(g.row([
    PosColumn(text: 'Bill No', width: 6),
    PosColumn(
        text: order.billNo,
        width: 6,
        styles: const PosStyles(align: PosAlign.right)),
  ]));
  b.addAll(g.text('Place: Kundapura', styles: center));
  b.addAll(g.text('Attended by: \${order.userName}', styles: center));
  return b;
}`,
          pitfalls: [
            '**Hard-coding the store name and GSTIN.** Any change needs an app rebuild. Fix: read from the Store settings object.',
            '**Address overflowing one line silently.** It wraps unpredictably. Fix: keep it short or accept a clean two-line wrap.',
            '**Omitting GSTIN.** Makes the receipt invalid as a tax bill. Fix: always print it when present.',
            '**No bill number on the receipt.** Customer disputes become un-traceable. Fix: print the order bill no.',
            '**Forgetting attended-by/machine.** Hard to audit which cashier billed. Fix: include user and till.',
            '**Formatting the date differently from the PDF.** Confuses customers comparing copies. Fix: one shared date formatter.',
          ],
          tryIt:
            'Wire `_header` to read your real Store settings and a sample Order. Print it. Check that the store name dominates the top, the GSTIN line is present and centered, and the bill number and date are right-aligned in their rows. Edit the store phone in settings, reprint, and confirm it changed with no rebuild.',
          takeaway:
            'Drive the receipt header from Store settings so the masthead, GSTIN, and metadata stay correct and editable.',
        },
        {
          id: 'm8-t7',
          title: 'The Item Table & Tax Lines',
          explain:
            'Print the item rows (name, qty, price, total) within 32 columns, then CGST/SGST/total-tax lines, and a bold grand total.',
          analogy:
            'This is the heart of the TunMani Cafe bill: the same list the steward reads back at the table — "two neer dosa, one kori rotti, one fish thali" — each with its rate and line total, then the government\'s share split into CGST and SGST, and finally the big bold number the customer actually pays. Getting these columns to line up on a 32-char strip is like neatly stacking thali plates: everything has its place.',
          theory:
            'On a 32-char receipt you cannot show four full columns comfortably, so the common pattern is a **two-line item**: line 1 is the **item name** (full width), line 2 is **`qty x price`** on the left and the **line total** right-aligned. This keeps long item names readable and money aligned.\n\nAfter the items and a divider, print the **tax breakdown**. For intra-state GST the tax splits into **CGST** and **SGST** (each half the GST rate). Use label/value rows: `Sub Total`, `CGST`, `SGST`, then a divider and a **bold, double-height GRAND TOTAL**.\n\nAlways format money consistently — two decimals, with a rupee symbol or `Rs.` (some printers cannot render `₹`, so `Rs.` is the safe default on thermal). A small `_money(double)` helper avoids drift between receipt and PDF.\n\nDrive every number from the **Order** model — `order.items`, `order.subTotal`, `order.cgst`, `order.sgst`, `order.total` — never recompute inside the printer. The Order is the single source of truth computed at billing time.',
          whyItMatters:
            'The item table and the grand total are what the customer scrutinizes. A misaligned column or a total that does not match the items destroys trust instantly. Printing straight from the Order model guarantees the paper agrees with what was saved.',
          steps: [
            'Loop over `order.items`; for each print the name on its own line.',
            'On the next line print `qty x price` left and the line total right.',
            'After all items, print a divider.',
            'Print `Sub Total`, `CGST`, and `SGST` as label/value rows.',
            'Print a divider, then a bold double-height `GRAND TOTAL`.',
            'Use a shared `_money()` formatter for every amount.',
            'Read all figures from the Order; do not recompute.',
          ],
          code: `String _money(double v) => 'Rs.\${v.toStringAsFixed(2)}';

List<int> _itemsAndTotals(Generator g, Order order) {
  final b = <int>[];
  for (final item in order.items) {
    b.addAll(g.text(item.name)); // full-width name
    b.addAll(g.row([
      PosColumn(text: '\${item.qty} x \${_money(item.price)}', width: 7),
      PosColumn(
          text: _money(item.qty * item.price),
          width: 5,
          styles: const PosStyles(align: PosAlign.right)),
    ]));
  }
  b.addAll(g.text('-' * 32));

  void line(String label, double amt) => b.addAll(g.row([
        PosColumn(text: label, width: 7),
        PosColumn(
            text: _money(amt),
            width: 5,
            styles: const PosStyles(align: PosAlign.right)),
      ]));

  line('Sub Total', order.subTotal);
  line('CGST', order.cgst);
  line('SGST', order.sgst);
  b.addAll(g.text('-' * 32));

  b.addAll(g.row([
    PosColumn(
        text: 'GRAND TOTAL',
        width: 7,
        styles: const PosStyles(bold: true, height: PosTextSize.size2)),
    PosColumn(
        text: _money(order.total),
        width: 5,
        styles: const PosStyles(
            bold: true,
            height: PosTextSize.size2,
            align: PosAlign.right)),
  ]));
  return b;
}`,
          pitfalls: [
            '**Cramming name+qty+price+total on one 32-char line.** It clips. Fix: two-line item layout.',
            '**Printing the rupee glyph the printer cannot render.** You get garbage. Fix: use `Rs.` on thermal.',
            '**Recomputing tax in the printer.** It can diverge from the saved order. Fix: read `order.cgst`/`sgst`/`total`.',
            '**Inconsistent decimals.** `45` vs `45.00` looks unprofessional. Fix: always `toStringAsFixed(2)`.',
            '**Grand total not visually dominant.** Customers miss it. Fix: bold + double height.',
            '**Right column too narrow for big totals.** A ₹12,000 total overflows. Fix: size columns for the largest realistic amount.',
          ],
          tryIt:
            'Print a real order with at least three items including one long name (e.g. "Kundapura Special Fish Thali"). Verify each name sits on its own line, the qty×price and line totals align in a clean right column, and the GRAND TOTAL is unmistakably the biggest text. Confirm Sub Total + CGST + SGST equals the grand total.',
          takeaway:
            'Use a two-line item layout, split GST into CGST/SGST, make the grand total bold and large, and read every number from the Order.',
        },
        {
          id: 'm8-t8',
          title: 'Payment Line, UPI QR Code & Footer',
          explain:
            'Finish the receipt with the payment type (or "COMPLIMENTARY"), a printed UPI QR code the customer can scan, a thank-you footer, and the paper cut.',
          analogy:
            'After the fish thali is paid for, the TunMani Cafe cashier stamps "PAID — UPI" and slides over a little QR card so the next customer can just scan and pay. Your receipt does the same: it states how the bill was settled, prints a scannable UPI QR right on the paper, thanks the guest, and then the printer snips the paper clean — ready for the next order.',
          theory:
            'After the grand total, print the **payment line**: `Paid via CASH` / `CARD` / `UPI` / `CREDIT`, read from `order.paymentType`. If the bill is on the house, print **`COMPLIMENTARY`** instead of a payment type — a real POS need for staff meals and goodwill.\n\nESC/POS printers can render a **QR code natively**. The `Generator.qrcode(data)` command sends a QR the printer draws itself (crisp, not a fuzzy bitmap). Encode a **UPI deep link** like `upi://pay?pa=tunmani@okaxis&pn=TunMani Cafe&am=540.00&cu=INR` so a customer can scan and pay the exact amount. Center it.\n\nFinish with a centered **footer** — "Thank you! Visit again" and maybe FSSAI/legal text — then `feed(2)` and `cut()`. The feed pushes the printed area clear of the cutter before it slices.\n\nKeep the whole receipt as one `buildBill(order, store)` that calls `_header`, `_itemsAndTotals`, then this payment/QR/footer block, returning a single `List<int>`.',
          whyItMatters:
            'A printed UPI QR turns a paper receipt into a payment instrument — the customer pays without typing your VPA, reducing errors and speeding the queue. And a clean cut means the next bill does not tear off mid-total.',
          steps: [
            'Print the payment type, or "COMPLIMENTARY" when the bill is free.',
            'Build a UPI deep-link string with payee, name, amount, and currency.',
            'Center and print it with `g.qrcode(...)`.',
            'Print a centered thank-you footer (and any legal text).',
            'Add `feed(2)` then `cut()`.',
            'Compose `buildBill(order, store)` from the three helper blocks.',
            'Send the bytes via the printer in `printBill`.',
          ],
          code: `List<int> _paymentAndFooter(Generator g, Order order, Store store) {
  final b = <int>[];
  final center = const PosStyles(align: PosAlign.center, bold: true);

  if (order.isComplimentary) {
    b.addAll(g.text('COMPLIMENTARY', styles: center));
  } else {
    b.addAll(g.text('Paid via \${order.paymentType}', styles: center));
  }

  // Native QR — printer draws it crisply.
  final upi =
      'upi://pay?pa=\${store.upiId}&pn=\${store.name}'
      '&am=\${order.total.toStringAsFixed(2)}&cu=INR';
  b.addAll(g.text('Scan to pay',
      styles: const PosStyles(align: PosAlign.center)));
  b.addAll(g.qrcode(upi, size: QRSize.size6));

  b.addAll(g.text('Thank you! Visit again',
      styles: const PosStyles(align: PosAlign.center)));
  b.addAll(g.feed(2));
  b.addAll(g.cut());
  return b;
}

Future<List<int>> buildBill(Order order, Store store) async {
  final g = Generator(PaperSize.mm58, await CapabilityProfile.load());
  return [
    ..._header(g, store, order),
    ..._itemsAndTotals(g, order),
    ..._paymentAndFooter(g, order, store),
  ];
}`,
          pitfalls: [
            '**Embedding a QR as a bitmap image.** Slow and fuzzy on thermal. Fix: use the native `qrcode` command.',
            '**Wrong UPI link format.** Apps fail to parse it. Fix: use `upi://pay?pa=...&pn=...&am=...&cu=INR` exactly.',
            '**No COMPLIMENTARY path.** Free bills print a misleading "Paid via CASH". Fix: branch on `isComplimentary`.',
            '**Cutting without feeding.** The cutter slices through the total. Fix: `feed(2)` before `cut()`.',
            '**Amount in the QR not matching the grand total.** Customer underpays/overpays. Fix: use `order.total` formatted to two decimals.',
            '**QR too small to scan.** Phones struggle. Fix: use a larger `QRSize`.',
          ],
          tryIt:
            'Complete `buildBill` and print a UPI order. Scan the printed QR with a payment app — it should pre-fill TunMani Cafe as payee and the exact bill amount. Then print a complimentary order and confirm it shows "COMPLIMENTARY" instead of a payment line, and that the paper cuts cleanly below the footer.',
          takeaway:
            'End the receipt with the payment type (or COMPLIMENTARY), a native UPI QR matching the total, a footer, and a feed-then-cut.',
        },
        {
          id: 'm8-t9',
          title: 'printBill Flow & Error Handling',
          explain:
            'Wire the full printBill(order, store) flow: ensure connection, build bytes, send them, and on failure throw so the caller can show "Bill saved but print failed — tap to retry".',
          analogy:
            'At TunMani Cafe the rule is sacred: the order is recorded in the bill book first, then printed. If the printer jams, the sale is still safely saved — the steward just walks back and tries the print again. Your `printBill` follows the same rule: saving the order and printing are separate steps, and a print failure must never lose the sale; it just surfaces a calm "tap to retry".',
          theory:
            'Sequence matters. The billing flow **saves the Order first** (to Firestore), then calls `printService.printBill(order, store)`. Printing is a *side effect*, not part of the save — so a Bluetooth hiccup never costs you a recorded sale.\n\nInside `printBill`: call `ensureConnected()`; if it fails, **throw** a clear exception. Otherwise build bytes with `buildBill(order, store)` and send them with `PrintBluetoothThermal.writeBytes(bytes)`, which returns a `bool`. If it returns false, throw.\n\nThe **caller** wraps the call in try/catch. On success, nothing extra. On failure, it shows a non-blocking message — "Bill saved but print failed. Tap to retry." — wired to re-run `printBill` for the same order. Because the order already exists, retry is safe and idempotent (it just reprints).\n\nUse a custom `PrintException` with a human message so the UI can show something better than a raw stack trace. Keep `printBill` free of UI code — it throws; the screen decides how to show it.',
          whyItMatters:
            'This separation is what makes the POS trustworthy: the cashier never loses a sale to a printer problem, and a failed print is a one-tap recovery instead of a panic. It is the single most important reliability decision in the whole printing feature.',
          steps: [
            'In the billing flow, save the Order before printing.',
            'Add `printBill(order, store)` to `PrintService`.',
            'Inside it, `ensureConnected()`; throw `PrintException` if false.',
            'Build bytes via `buildBill` and send with `writeBytes`.',
            'Throw if `writeBytes` returns false.',
            'In the caller, try/catch and show "Bill saved but print failed — tap to retry".',
            'Wire the retry action to call `printBill` again for the same order.',
          ],
          code: `class PrintException implements Exception {
  PrintException(this.message);
  final String message;
  @override
  String toString() => message;
}

class PrintService {
  Future<void> printBill(Order order, Store store) async {
    final connected = await ensureConnected();
    if (!connected) {
      throw PrintException('Printer not connected.');
    }
    final bytes = await buildBill(order, store);
    final ok = await PrintBluetoothThermal.writeBytes(bytes);
    if (!ok) {
      throw PrintException('Printer rejected the data.');
    }
  }
}

// --- caller (billing screen) ---
Future<void> finalizeAndPrint(Order order, Store store) async {
  await orderRepo.save(order); // save FIRST — never lose the sale
  try {
    await printService.printBill(order, store);
  } on PrintException catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('Bill saved but print failed. \$e'),
      action: SnackBarAction(
        label: 'Retry',
        onPressed: () => printService.printBill(order, store),
      ),
    ));
  }
}`,
          pitfalls: [
            '**Printing before saving.** A print crash can lose the sale. Fix: save the Order first, always.',
            '**Swallowing print errors silently.** The cashier thinks it printed. Fix: throw and show a SnackBar.',
            '**Putting UI code inside printBill.** Couples service to widgets. Fix: throw; let the screen render the message.',
            '**No retry path.** Staff must re-bill from scratch. Fix: a Retry action that reprints the saved order.',
            '**Throwing raw exceptions.** Ugly messages. Fix: a `PrintException` with a friendly string.',
            '**Assuming writeBytes always succeeds.** It returns a bool. Fix: check it and throw on false.',
          ],
          tryIt:
            'Implement `printBill` and the caller. Bill an order with the printer ON — it prints. Now turn the printer OFF and bill again: the order must still be saved, and you should see "Bill saved but print failed — Retry". Turn the printer on and tap Retry — the same bill prints. That proves the sale survives a printer outage.',
          takeaway:
            'Save the order first, treat printing as a throwing side effect, and give failures a one-tap retry that reprints.',
        },
      ],
    },
    {
      id: 'm8-s3',
      title: 'PDF Invoices & Sharing',
      topics: [
        {
          id: 'm8-t10',
          title: 'A Thermal-Style PDF with the pdf Package',
          explain:
            'Generate a narrow 57mm-wide PDF invoice in a Courier monospace font that mirrors the printed receipt, using the pdf package.',
          analogy:
            'Not every TunMani Cafe customer wants paper — the lady who booked the fish thali for an office lunch wants the bill on WhatsApp for her accounts. The PDF is that same receipt photocopied onto a phone-sized slip: same narrow width, same typewriter font, same line order — just digital. Customers should recognize it instantly as "the TunMani Cafe bill".',
          theory:
            'The **`pdf`** package builds PDF documents in pure Dart. For a receipt that *looks* like the thermal print, set a **narrow page**: roughly **57mm wide** with generous height, using `PdfPageFormat(57 * PdfPageFormat.mm, double.infinity)` or a fixed tall page. Use a **Courier monospace** font (`pw.Font.courier()`) so columns line up exactly like the printer\'s fixed-width output.\n\nMirror the receipt structure: store header, CASH BILL, metadata, the item table, tax lines, grand total, payment line, and footer. Because the layout matches, build a **shared `bill_text.dart`** that produces the receipt as plain monospace lines; both the thermal printer (after wrapping in ESC/POS) and the PDF can render the same text, guaranteeing they agree.\n\nYou assemble widgets with `pw.Column`, `pw.Row`, and `pw.Text`, then `doc.save()` returns the `Uint8List` PDF bytes. Keep this in **`utils/bill_pdf.dart`** as `Future<Uint8List> buildBillPdf(order, store)`.',
          whyItMatters:
            'A PDF that matches the paper receipt means staff and customers never second-guess which document is "real". Reusing the same monospace text source removes an entire class of "the PDF says something different from the printout" bugs.',
          steps: [
            'Add `pdf` to `pubspec.yaml` and run `flutter pub get`.',
            'Create `utils/bill_text.dart` that returns the receipt as monospace lines.',
            'Create `utils/bill_pdf.dart` with `buildBillPdf(order, store)`.',
            'Use a narrow ~57mm `PdfPageFormat` and `pw.Font.courier()`.',
            'Render the header, items, totals, payment, and footer as `pw.Text`.',
            'Return `await doc.save()` as `Uint8List`.',
            'Preview the PDF on screen to confirm it mirrors the print.',
          ],
          code: `import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

Future<Uint8List> buildBillPdf(Order order, Store store) async {
  final doc = pw.Document();
  final mono = pw.Font.courier();
  final lines = buildBillText(order, store); // from bill_text.dart

  doc.addPage(
    pw.Page(
      pageFormat: PdfPageFormat(
        57 * PdfPageFormat.mm,
        double.infinity, // grow to fit content
        marginAll: 4,
      ),
      build: (context) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          for (final line in lines)
            pw.Text(
              line,
              style: pw.TextStyle(font: mono, fontSize: 8),
            ),
        ],
      ),
    ),
  );
  return doc.save();
}`,
          pitfalls: [
            '**Using an A4 page.** A receipt looks lost on A4. Fix: a ~57mm-wide narrow page.',
            '**A proportional font.** Columns drift. Fix: `pw.Font.courier()` monospace.',
            '**Duplicating layout logic.** PDF and print diverge. Fix: share `bill_text.dart`.',
            '**Fixed page height clipping long bills.** Many items overflow. Fix: `double.infinity` height or multi-page.',
            '**Returning the document instead of bytes.** Sharing needs bytes. Fix: return `await doc.save()`.',
            '**Forgetting margins.** Text touches the edge. Fix: a small `marginAll`.',
          ],
          tryIt:
            'Build `buildBillPdf` reusing your `bill_text.dart` lines, then preview it with the `printing` package\'s `Printing.layoutPdf` or an on-screen `PdfPreview`. Place the PDF next to the thermal printout — the header, item rows, and grand total should line up character-for-character. If they differ, your two renderers are not sharing the same text source.',
          takeaway:
            'Build a narrow monospace PDF from the same shared bill-text so it mirrors the thermal receipt exactly.',
        },
        {
          id: 'm8-t11',
          title: 'Sharing the PDF with share_plus',
          explain:
            'Save the generated PDF to a temp file and open the native share sheet with Share.shareXFiles so staff can send it on WhatsApp, email, or save it.',
          analogy:
            'Once the digital TunMani Cafe bill is ready, the cashier just needs to hand it over — the way you would pass a paper slip across the counter. `share_plus` opens the phone\'s familiar share tray, and the staff taps WhatsApp, picks the customer\'s chat, and the bill is delivered. No custom UI, just the same share sheet everyone already knows.',
          theory:
            '**`share_plus`** opens the platform share sheet. To share a file you need an actual file path, so first write the PDF bytes to a temporary file using **`path_provider`** (`getTemporaryDirectory()`), then pass it as an **`XFile`** to `Share.shareXFiles([XFile(path)], text: ...)`.\n\nThe flow: build bytes with `buildBillPdf`, write them to `\${tempDir.path}/bill_\${order.billNo}.pdf`, then call `Share.shareXFiles`. Name the file meaningfully (include the bill number) so the received file is identifiable.\n\nPut this in **`utils/bill_pdf.dart`** as `shareBillPdf(order, store)` so any screen — billing, order detail — can trigger sharing with one call. On Android 7+, `share_plus` already handles the `FileProvider` content URI plumbing, so you do not configure it manually.',
          whyItMatters:
            'Sharing is how a digital bill actually reaches the customer. Using the OS share sheet means zero custom integration with WhatsApp or email, it works with whatever apps the staff have, and it feels native and trustworthy.',
          steps: [
            'Add `share_plus` and `path_provider` to `pubspec.yaml`.',
            'Build the PDF bytes with `buildBillPdf`.',
            'Get the temp directory with `getTemporaryDirectory()`.',
            'Write the bytes to `bill_<billNo>.pdf`.',
            'Call `Share.shareXFiles([XFile(path)], text: ...)`.',
            'Expose it as `shareBillPdf(order, store)`.',
            'Trigger it from a "Share" button after billing.',
          ],
          code: `import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

Future<void> shareBillPdf(Order order, Store store) async {
  final bytes = await buildBillPdf(order, store);

  // share_plus needs a real file path, so write to a temp file.
  final dir = await getTemporaryDirectory();
  final file = File('\${dir.path}/bill_\${order.billNo}.pdf');
  await file.writeAsBytes(bytes);

  await Share.shareXFiles(
    [XFile(file.path)],
    text: 'TunMani Cafe bill #\${order.billNo} — Rs.\${order.total.toStringAsFixed(2)}',
  );
}

// --- a Share button on the billing/order screen ---
// IconButton(
//   icon: const Icon(Icons.share),
//   onPressed: () => shareBillPdf(order, store),
// );`,
          pitfalls: [
            '**Sharing raw bytes.** The share sheet needs a file. Fix: write to a temp file first.',
            '**Using the app documents dir for throwaway PDFs.** Clutters storage. Fix: `getTemporaryDirectory()`.',
            '**Generic file names like file.pdf.** Recipients cannot tell bills apart. Fix: include the bill number.',
            '**Manually configuring FileProvider.** share_plus already does it. Fix: do not reinvent it.',
            '**Not awaiting the write.** Sharing an empty/partial file. Fix: `await file.writeAsBytes`.',
            '**Blocking the UI during generation.** Big bills take a moment. Fix: show a brief spinner while building.',
          ],
          tryIt:
            'Implement `shareBillPdf` and add a Share button. Bill an order, tap Share, and send the PDF to your own WhatsApp. Open it on another device — it should be a clean, named `bill_<n>.pdf` that matches the printout. Then try sharing to Gmail to confirm it works across apps.',
          takeaway:
            'Write the PDF to a temp file, then hand it to the native share sheet with Share.shareXFiles for WhatsApp/email delivery.',
        },
        {
          id: 'm8-t12',
          title: 'Re-print & Re-share a Past Bill',
          explain:
            'From the order detail screen, let staff reprint a past bill to the thermal printer or re-share its PDF — reusing the exact same builders.',
          analogy:
            'A customer comes back the next morning: "I lost the bill for yesterday\'s fish thali, can I get another copy?" At TunMani Cafe the manager flips to that page in the bill book and prints it again — nothing is recomputed, it is the same recorded sale. Your order detail screen does the same: it pulls the stored Order and runs the very same print and PDF builders.',
          theory:
            'Because both `printBill` and `buildBillPdf` take an **`Order`** and a **`Store`**, re-printing or re-sharing a *past* bill is trivial: load the stored Order (from Firestore) on the **order detail screen** and call the same functions. No special "reprint" code path is needed — the builders are pure functions of the data.\n\nAdd two actions to the order detail screen: a **Reprint** button (calls `printService.printBill(order, store)`, with the same connect/retry handling) and a **Share PDF** button (calls `shareBillPdf(order, store)`). Both reuse everything you built.\n\nThis is the payoff of keeping the builders **stateless and data-driven**. The same code that printed the bill at billing time prints it again days later, guaranteeing the reprint is byte-identical to the original — important when a customer compares copies.',
          whyItMatters:
            'Reprints and re-shares are everyday counter requests. Reusing the same builders means zero duplicate logic, guaranteed consistency between the original and the copy, and a tiny code footprint for a high-value feature.',
          steps: [
            'On the order detail screen, load the stored Order and Store.',
            'Add a "Reprint" button calling `printService.printBill(order, store)`.',
            'Reuse the same connect check and retry SnackBar.',
            'Add a "Share PDF" button calling `shareBillPdf(order, store)`.',
            'Optionally add "Save PDF" for offline copies (next topic).',
            'Confirm a reprint matches the original receipt exactly.',
            'Guard actions so deleted/void orders cannot be reprinted as valid.',
          ],
          code: `// order_detail_screen.dart — reuse the same builders for a past bill.
class OrderDetailActions extends StatelessWidget {
  const OrderDetailActions({
    super.key,
    required this.order,
    required this.store,
    required this.printService,
  });

  final Order order;
  final Store store;
  final PrintService printService;

  Future<void> _reprint(BuildContext context) async {
    try {
      await printService.printBill(order, store); // same builder
    } on PrintException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Reprint failed. \$e'),
        action: SnackBarAction(
          label: 'Retry',
          onPressed: () => printService.printBill(order, store),
        ),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      TextButton.icon(
        icon: const Icon(Icons.print),
        label: const Text('Reprint'),
        onPressed: () => _reprint(context),
      ),
      TextButton.icon(
        icon: const Icon(Icons.share),
        label: const Text('Share PDF'),
        onPressed: () => shareBillPdf(order, store), // same builder
      ),
    ]);
  }
}`,
          pitfalls: [
            '**Writing a separate reprint code path.** Causes drift from the original. Fix: reuse `printBill`/`buildBillPdf`.',
            '**Recomputing totals on reprint.** The copy may not match. Fix: print straight from the stored Order.',
            '**Allowing reprint of voided bills as valid.** Misleads customers. Fix: mark or block reprints of deleted orders.',
            '**Not handling printer-off on reprint.** Same failure mode as billing. Fix: reuse the retry SnackBar.',
            '**Loading a partial Order.** Missing items break the layout. Fix: load the full document before printing.',
            '**No share option, only print.** Customers often want digital. Fix: offer both.',
          ],
          tryIt:
            'Open a past order in the detail screen and tap Reprint — compare it to a fresh print of the same order; they must be identical. Then tap Share PDF and send it. Finally, void an order and confirm reprint is blocked or clearly marked, so a cancelled bill cannot masquerade as a paid one.',
          takeaway:
            'Reprint and re-share are free when builders are pure functions of the Order — just reload and call the same code.',
        },
        {
          id: 'm8-t13',
          title: 'Saving & Downloading the PDF',
          explain:
            'Save the PDF to device storage with path_provider so staff keep an offline copy or download a bill for records.',
          analogy:
            'Beyond handing the customer a copy, TunMani Cafe keeps its own file of bills in a drawer for the auditor. Saving the PDF to the phone\'s storage is that drawer: a durable copy the manager can pull up later even without internet, separate from the temporary one used just for sharing.',
          theory:
            'Sharing used a *temporary* file. To **keep** a copy, write to a more durable location with **`path_provider`** — `getApplicationDocumentsDirectory()` for app-private storage, or the downloads/external directory if you want it visible in the phone\'s file manager (which needs the right storage handling on newer Android).\n\nThe pattern mirrors sharing: build bytes with `buildBillPdf`, then `writeAsBytes` to the chosen directory, named `bill_<billNo>.pdf`. Return the path so the UI can confirm "Saved to …" or offer to open it.\n\nFor a simple "Download" that the user can find, the cleanest cross-version approach on Android is to write to app storage and then use `share_plus`/an open-file intent — but a straightforward "Save copy" to the documents directory covers the core records need without storage-permission headaches. Add `saveBillPdf(order, store)` to `bill_pdf.dart` and confirm success with a SnackBar.',
          whyItMatters:
            'Offline access to bill copies matters when the network is down or for an audit months later. A reliable save path means the restaurant always has its own record, independent of the customer\'s copy or connectivity.',
          steps: [
            'Reuse `buildBillPdf` to get the bytes.',
            'Pick a durable directory with `getApplicationDocumentsDirectory()`.',
            'Write `bill_<billNo>.pdf` there with `writeAsBytes`.',
            'Return the saved path.',
            'Show a "Saved to …" SnackBar.',
            'Add `saveBillPdf(order, store)` to `bill_pdf.dart`.',
            'Wire a "Save PDF" button on the order detail screen.',
          ],
          code: `import 'dart:io';
import 'package:path_provider/path_provider.dart';

Future<String> saveBillPdf(Order order, Store store) async {
  final bytes = await buildBillPdf(order, store);

  // Durable, app-private location (no extra storage permission needed).
  final dir = await getApplicationDocumentsDirectory();
  final file = File('\${dir.path}/bill_\${order.billNo}.pdf');
  await file.writeAsBytes(bytes);
  return file.path; // show this in a "Saved to ..." message
}

// --- order_detail_screen.dart ---
// TextButton.icon(
//   icon: const Icon(Icons.download),
//   label: const Text('Save PDF'),
//   onPressed: () async {
//     final path = await saveBillPdf(order, store);
//     ScaffoldMessenger.of(context).showSnackBar(
//       SnackBar(content: Text('Saved to \$path')),
//     );
//   },
// );`,
          pitfalls: [
            '**Saving to the temp dir for records.** The OS can wipe it anytime. Fix: use the documents directory.',
            '**Assuming external/downloads needs no handling.** Newer Android restricts it. Fix: prefer app storage, or handle scoped storage.',
            '**Overwriting copies silently.** Same name clobbers. Fix: bill-number names are unique per bill, which is fine; avoid generic names.',
            '**Not returning the path.** UI cannot confirm. Fix: return and display it.',
            '**Rebuilding the PDF differently for save vs share.** Inconsistency. Fix: both call `buildBillPdf`.',
            '**No success feedback.** Staff unsure it worked. Fix: SnackBar with the path.',
          ],
          tryIt:
            'Add `saveBillPdf` and a Save button. Save a bill, note the path in the SnackBar, then turn on airplane mode and reopen that file — it should open offline. Confirm the saved file name includes the bill number so the records drawer stays organized.',
          takeaway:
            'For durable copies, save the same PDF bytes to app documents storage with a bill-numbered name and confirm the path.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm8-p1',
      type: 'Project',
      title: 'PrintService + ESC/POS Receipt',
      domain: 'Restaurant POS / Thermal Printing',
      duration: '3 hours',
      description:
        'Build the complete Bluetooth printing pipeline for TunMani Cafe: a PrintService that handles permissions, listing, connecting, and persistence; the Printer Setup admin screen; and a full 58mm ESC/POS receipt with header, item table, GST lines, UPI QR, and a save-first printBill flow with retry.',
      tools: [
        'Flutter',
        'print_bluetooth_thermal',
        'esc_pos_utils_plus',
        'permission_handler',
        'shared_preferences',
      ],
      blueprint: {
        overview:
          'Wire end-to-end receipt printing: from requesting Bluetooth permissions, to connecting and remembering a printer, to building and sending a professional 32-char-wide receipt, with billing that never loses a sale when the printer fails.',
        functionalRequirements: [
          '**Permissions.** Request BLUETOOTH_CONNECT/SCAN at runtime when the user opens Printer Setup.',
          '**Device list.** Show all OS-paired devices with name and MAC; connect on tap by MAC.',
          '**Persistence.** Save the chosen printer MAC and auto-reconnect on launch.',
          '**Status.** Show a live connected/disconnected chip with Disconnect and Forget actions.',
          '**Receipt.** Print store header + GSTIN, CASH BILL, metadata, item table, CGST/SGST, bold grand total, payment type or COMPLIMENTARY, UPI QR, footer, and paper cut.',
          '**Reliability.** Save the order first; on print failure show "Bill saved but print failed — tap to retry".',
        ],
        technicalImplementation: [
          '**services/print_service.dart.** Methods: requestPermissions, pairedDevices, connect, saveSelectedMac/savedMac/clearSavedMac, ensureConnected, isConnected, disconnect, printBill.',
          '**Receipt builders.** `_header`, `_itemsAndTotals`, `_paymentAndFooter`, composed by `buildBill(order, store)` returning List<int>.',
          '**screens/admin/printer_screen.dart.** Lists devices, connects+persists, shows status, disconnect/forget.',
          '**Error handling.** A `PrintException` thrown by printBill; caller shows a Retry SnackBar.',
          '**Money/format helpers.** Shared `_money` and date formatters so receipt and PDF agree.',
        ],
        prompts: [
          {
            step: 1,
            label: 'PrintService skeleton + permissions',
            outcome:
              'A PrintService with runtime Bluetooth permission handling and the manifest entries.',
            prompt:
              'In a Flutter app, create services/print_service.dart with a PrintService class. Add a requestBluetoothPermissions() method using permission_handler that requests Permission.bluetoothConnect and Permission.bluetoothScan, sends the user to app settings if permanently denied, and returns true only when all are granted. Also give me the exact AndroidManifest.xml uses-permission entries for BLUETOOTH_CONNECT, BLUETOOTH_SCAN (neverForLocation), and legacy BLUETOOTH/BLUETOOTH_ADMIN with maxSdkVersion 30.',
          },
          {
            step: 2,
            label: 'List, connect, persist, reconnect',
            outcome:
              'PrintService can list paired devices, connect by MAC, persist it, and auto-reconnect.',
            prompt:
              'Extend PrintService using print_bluetooth_thermal and shared_preferences. Add pairedDevices() (only when bluetoothEnabled), connect(String mac), isConnected(), disconnect(), saveSelectedMac/savedMac/clearSavedMac using a single private key constant, and ensureConnected() that reconnects from the saved MAC if not already connected. Use the package field macAdress exactly.',
          },
          {
            step: 3,
            label: 'Printer Setup screen',
            outcome:
              'An admin screen to pick, connect, persist, and monitor the printer.',
            prompt:
              'Create screens/admin/printer_screen.dart. Show a live connected/disconnected Chip via a FutureBuilder on isConnected(), a ListView of pairedDevices() with name and MAC, connect-and-saveSelectedMac on tap with setState refresh, and Disconnect and Forget buttons. Wrap Bluetooth errors in SnackBars.',
          },
          {
            step: 4,
            label: 'ESC/POS receipt builder',
            outcome:
              'A complete 58mm receipt mirroring a real restaurant bill.',
            prompt:
              'Using esc_pos_utils_plus with PaperSize.mm58 and a 32-char width, build buildBill(Order order, Store store) returning List<int>. Include _header (store name bold double-height, address, phone, GSTIN, CASH BILL, date/bill no/place, attended-by), _itemsAndTotals (two-line items: name then qty x price with right-aligned line total; Sub Total, CGST, SGST; bold double-height GRAND TOTAL using PosColumn widths summing to 12; Rs. money format), and _paymentAndFooter (payment type or COMPLIMENTARY, a native UPI QR via g.qrcode of upi://pay, a thank-you footer, feed(2) then cut()).',
          },
          {
            step: 5,
            label: 'printBill flow + retry',
            outcome:
              'Billing saves first and recovers gracefully from print failures.',
            prompt:
              'Add printBill(order, store) to PrintService that calls ensureConnected(), throws a custom PrintException if not connected, builds bytes via buildBill, sends them with PrintBluetoothThermal.writeBytes, and throws if it returns false. Then write the billing caller that saves the Order to the repo FIRST, then try/catches printBill and shows a SnackBar "Bill saved but print failed" with a Retry action that reprints the same order.',
          },
        ],
      },
    },
    {
      id: 'm8-p2',
      type: 'Project',
      title: 'PDF Invoice Generator with Share',
      domain: 'Restaurant POS / Invoicing',
      duration: '3 hours',
      description:
        'Build the PDF side of TunMani Cafe billing: a thermal-style 57mm monospace PDF that mirrors the receipt, shareable via the native share sheet, savable for records, and re-printable/re-sharable from the order detail screen.',
      tools: ['Flutter', 'pdf', 'printing', 'share_plus', 'path_provider'],
      blueprint: {
        overview:
          'Turn an Order into a digital invoice: one shared monospace text source feeds both the PDF and the thermal receipt, the PDF shares via WhatsApp/email, saves for records, and reprints from any past order.',
        functionalRequirements: [
          '**Shared text.** A bill_text.dart that renders the receipt as monospace lines used by both PDF and print.',
          '**PDF.** A ~57mm Courier PDF mirroring the receipt header, items, GST, total, payment, footer.',
          '**Share.** Share.shareXFiles from a temp file with a bill-numbered name.',
          '**Save.** Durable save to app documents with a confirmation path.',
          '**Reprint/Reshare.** Order detail screen actions reusing the same builders.',
        ],
        technicalImplementation: [
          '**utils/bill_text.dart.** Produces the receipt as a List<String> of 32-char monospace lines.',
          '**utils/bill_pdf.dart.** buildBillPdf, shareBillPdf (temp file + share_plus), saveBillPdf (path_provider documents dir).',
          '**screens/admin/order_detail_screen.dart.** Reprint and Share/Save actions for stored orders.',
          '**Consistency.** PDF and ESC/POS both derive from bill_text so they never diverge.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Shared bill text',
            outcome:
              'One monospace text source both renderers can use.',
            prompt:
              'Create utils/bill_text.dart with buildBillText(Order order, Store store) returning a List<String> of fixed-width 32-character lines: centered store name, address, phone, GSTIN, CASH BILL, date/bill no/place, a dashed divider, two-line items, Sub Total/CGST/SGST, a GRAND TOTAL line, payment type or COMPLIMENTARY, and a thank-you footer. Use Rs. formatting to two decimals.',
          },
          {
            step: 2,
            label: 'Thermal-style PDF',
            outcome:
              'A narrow monospace PDF mirroring the receipt.',
            prompt:
              'Create utils/bill_pdf.dart with buildBillPdf(order, store) using the pdf package: a PdfPageFormat of 57mm width and double.infinity height with small margins, pw.Font.courier(), rendering each line from buildBillText as a pw.Text at fontSize 8. Return await doc.save() as Uint8List.',
          },
          {
            step: 3,
            label: 'Share the PDF',
            outcome:
              'Staff can send the bill via the native share sheet.',
            prompt:
              'Add shareBillPdf(order, store) to bill_pdf.dart: build the bytes, write them to a temp file named bill_<billNo>.pdf using path_provider getTemporaryDirectory, then call Share.shareXFiles with an XFile and a text caption containing the bill number and total.',
          },
          {
            step: 4,
            label: 'Save for records',
            outcome:
              'A durable, offline-readable copy of each bill.',
            prompt:
              'Add saveBillPdf(order, store) to bill_pdf.dart that writes buildBillPdf bytes to getApplicationDocumentsDirectory as bill_<billNo>.pdf and returns the path. Then show me an order detail Save button that calls it and SnackBars "Saved to <path>".',
          },
          {
            step: 5,
            label: 'Reprint & reshare from order detail',
            outcome:
              'Any past bill can be reprinted or reshared with no duplicate logic.',
            prompt:
              'In screens/admin/order_detail_screen.dart, add Reprint, Share PDF, and Save PDF actions for a stored Order that reuse printService.printBill, shareBillPdf, and saveBillPdf. Reuse the PrintException Retry SnackBar for reprint, and block or clearly mark reprints of deleted/void orders.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm8-q1',
      q: 'On Android 12+, which permissions must your app request at runtime to use a paired Bluetooth thermal printer?',
      options: [
        'BLUETOOTH_CONNECT and BLUETOOTH_SCAN',
        'Only the legacy BLUETOOTH permission',
        'INTERNET and ACCESS_FINE_LOCATION',
        'No runtime permissions are needed',
      ],
      answer: 0,
    },
    {
      id: 'm8-q2',
      q: 'Why do you persist and reconnect to the printer by its MAC address rather than its name?',
      options: [
        'The MAC is the stable unique identifier; names can repeat or be blank',
        'Names are not allowed in shared_preferences',
        'The package cannot connect by name at all',
        'MAC addresses print faster',
      ],
      answer: 0,
    },
    {
      id: 'm8-q3',
      q: 'About how many characters wide is a standard 58mm thermal receipt line, and what does that drive?',
      options: [
        'About 32 characters, which shapes the entire receipt layout',
        'About 80 characters, the same as A4',
        'Unlimited width; the printer wraps automatically',
        'Exactly 12 characters, the PosColumn grid',
      ],
      answer: 0,
    },
    {
      id: 'm8-q4',
      q: 'In the billing flow, what is the correct order of operations for saving and printing?',
      options: [
        'Save the Order first, then print as a separate side effect that can fail and retry',
        'Print first, and only save the order if printing succeeds',
        'Save and print inside a single transaction that rolls both back on failure',
        'Print and save simultaneously on different threads',
      ],
      answer: 0,
    },
    {
      id: 'm8-q5',
      q: 'How should the UPI QR code be added to the thermal receipt?',
      options: [
        'With the native ESC/POS qrcode command so the printer draws it crisply',
        'As a large bitmap image rendered by Flutter',
        'As plain text of the UPI ID only',
        'It cannot be printed on thermal printers',
      ],
      answer: 0,
    },
    {
      id: 'm8-q6',
      q: 'Why does the PDF invoice use a ~57mm page and a Courier monospace font?',
      options: [
        'To mirror the thermal receipt so columns align and customers recognize it',
        'Because the pdf package only supports Courier',
        'To make the file size smaller than A4',
        'Because share_plus requires monospace fonts',
      ],
      answer: 0,
    },
  ],
}
