// Module M7 — Finalising a Bill: GST, Discounts & Payments (TunMani Cafe Billing)
// Bill settlement: the finalise screen, tax math, discounts/comp/parcel, and payment.

export const m7 = {
  id: 'm7',
  title: 'Finalising a Bill: GST, Discounts & Payments',
  hours: 8,
  color: 'from-yellow-500/20 to-yellow-700/10',
  accent: 'yellow',
  description:
    'Turn a running order into a paid bill: review and price every item, apply 5% GST split into CGST + SGST, handle discounts, comp and parcel, then take payment via cash, card, UPI QR, or credit and settle safely.',
  sections: [
    {
      id: 'm7-s1',
      title: 'The Finalise Screen',
      topics: [
        {
          id: 'm7-t1',
          title: 'Add-more-items collapsible search',
          explain:
            'The finalise screen keeps a collapsible search panel so the waiter can add a last-minute item right before settling, without going back to the order screen.',
          analogy:
            'At TunMani Cafe the customer always asks for "one more solkadi" just as the bill is being made. The waiter does not walk back to the kitchen rail — they add it on the spot at the counter. The collapsible search on the finalise screen is that on-the-spot add: tucked away by default, expanded when a final craving strikes.',
          theory:
            'The **finalise screen** (`finalise_screen.dart`) is where a running order becomes a paid bill. But customers add items at the last second, so we embed the **same search-and-add panel** from the order screen here — wrapped in an **`ExpansionTile`** (or an animated container) so it stays collapsed until needed.\n\nCollapsing it matters because the finalise screen is busy: it already shows the full order, totals, discounts, and payment. The search is a secondary action, so we hide it behind a tap to keep the primary settlement controls front and centre.\n\nWhen expanded, it behaves exactly like M6’s panel: live filter of active SKUs, + to add or increment. Any item added here flows into the same totals and tax math the rest of the screen uses, because it mutates the same `OrderProvider`.',
          whyItMatters:
            'Forcing a waiter back to a previous screen for one extra item is slow and error-prone during the pay-up rush. A collapsible add panel right on the finalise screen keeps last-minute additions fast while keeping the screen uncluttered, which is the balance every settlement UI must strike.',
          steps: [
            'Reuse the search-and-add panel widget from the order screen (M6).',
            'Wrap it in an `ExpansionTile` titled "Add more items".',
            'Keep it collapsed by default so settlement controls dominate.',
            'On expand, show the live SKU filter and + buttons.',
            'Route added items through the same `OrderProvider` mutations.',
            'Confirm totals and tax recompute when an item is added here.',
          ],
          code: `class AddMorePanel extends StatelessWidget {
  const AddMorePanel({super.key});

  @override
  Widget build(BuildContext context) {
    return const ExpansionTile(
      title: Text('Add more items'),
      initiallyExpanded: false,    // tucked away by default
      childrenPadding: EdgeInsets.symmetric(horizontal: 12),
      children: [
        // Same live-search panel from the order screen.
        // Adding here mutates the same OrderProvider, so totals stay in sync.
        SearchAddPanel(),
      ],
    );
  }
}`,
          pitfalls: [
            '**Leaving the panel expanded by default.** It crowds out the payment controls; keep it collapsed until tapped.',
            '**Duplicating the search logic.** Reuse the M6 panel widget instead of rewriting the filter — one source of truth.',
            '**Adding items that skip the tax math.** Route additions through the same provider so GST and totals recompute automatically.',
            '**Forgetting to mark the order changed.** A last-minute add must flag unsaved changes just like the order screen.',
          ],
          tryIt:
            'Embed the search panel inside an `ExpansionTile` on the finalise screen. Add an item while finalising and confirm the totals update.',
          takeaway:
            'A collapsible search panel lets the waiter add last-minute items on the finalise screen without losing the settlement controls.',
        },
        {
          id: 'm7-t2',
          title: 'The current order card',
          explain:
            'The finalise screen shows the full order in a card: every item with per-item +/- buttons and its line total, so the waiter can make final corrections.',
          analogy:
            'Before stamping the bill, the TunMani Cafe cashier reads the slip back to the customer: "two neer dosa, one fish thali, one solkadi — correct?" If the customer says "only one dosa," the cashier fixes it right there. The order card is that read-back-and-correct moment, with +/- buttons standing in for the cashier’s pen.',
          theory:
            'The **order card** restates the entire cart on the finalise screen. Each row shows the item name, quantity, unit price, and **line total** (`unitPrice * qty`), plus **per-item +/- buttons** identical to the order screen.\n\nWhy allow edits here? Because the finalise screen is the last checkpoint before money changes hands. A customer canceling or adding a plate at settlement time is common, and forcing the waiter back a screen wastes time. The +/- buttons mutate the same `OrderProvider`, so totals, GST, and the grand total all recompute live.\n\nThis card is read-heavy: it should be scannable top to bottom so the waiter can verify the order against what is on the table. The +/- controls are there for corrections, not primary entry — most items are already added before reaching this screen.',
          whyItMatters:
            'The finalise screen is the last chance to catch an error before charging a real customer. Letting the waiter adjust quantities right on the order card — with every total recomputing live — turns settlement into a verification step rather than a point of no return.',
          steps: [
            'Render the active order’s items in a card on the finalise screen.',
            'Show name, quantity, unit price, and line total per row.',
            'Add per-item + and - buttons wired to the provider.',
            'Recompute line totals from `unitPrice * qty` on every change.',
            'Ensure the running subtotal and GST update live with edits.',
            'Keep the card scannable so the waiter can verify against the table.',
          ],
          code: `class FinaliseOrderCard extends StatelessWidget {
  const FinaliseOrderCard({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<OrderProvider>();
    final items = provider.active!.items;
    return Card(
      child: Column(
        children: items.map((item) {
          final lineTotal = item.unitPrice * item.qty;
          return ListTile(
            title: Text(item.name),
            subtitle: Text('₹\${item.unitPrice.toStringAsFixed(2)} × \${item.qty}'),
            trailing: Row(mainAxisSize: MainAxisSize.min, children: [
              IconButton(icon: const Icon(Icons.remove),
                  onPressed: () => provider.decrement(item.sku)),
              Text('₹\${lineTotal.toStringAsFixed(2)}'),
              IconButton(icon: const Icon(Icons.add),
                  onPressed: () => provider.increment(item.sku)),
            ]),
          );
        }).toList(),
      ),
    );
  }
}`,
          pitfalls: [
            '**Making the card read-only.** Customers change their minds at the till; keep +/- here so corrections do not need a screen change.',
            '**Recomputing totals only on screen open.** Watch the provider so GST and grand total update on every quantity change.',
            '**Cramming controls so the card is unscannable.** Keep rows clean; the waiter must verify the order at a glance.',
            '**Editing the order document directly.** Mutate through the provider so all derived numbers stay consistent.',
          ],
          tryIt:
            'Build the finalise order card with per-item +/- buttons. Change a quantity and confirm both the line total and the overall totals below update immediately.',
          takeaway:
            'The order card restates the full bill with live per-item +/- controls so the waiter can verify and correct before settling.',
        },
        {
          id: 'm7-t3',
          title: 'Seasonal items & mandatory price entry',
          explain:
            'Items stored with `unitPrice == 0` are seasonal (price varies daily); each gets an inline orange price field that the waiter must fill before the bill can be settled.',
          analogy:
            'At TunMani Cafe the fish thali price swings with the morning catch — some days ₹180, some days ₹240. The dish is on the menu, but its price is written on a chalk slate that day. A seasonal item with `unitPrice == 0` is that chalk slate: the app refuses to total the bill until the waiter chalks in today’s price.',
          theory:
            'Some dishes have **no fixed price** — fish thali, crab, seasonal catch. We store these SKUs with **`unitPrice == 0`** as a sentinel meaning "ask at billing time." On the finalise screen we detect any item where `unitPrice == 0` and render an **inline price field**, styled **orange** to draw the eye.\n\nThis field is **mandatory**: the **Settle** button stays disabled (or validation fails) until every seasonal item has a price greater than zero. We track this with a **validation state** — for example, a computed `bool allPriced` that the settle action checks.\n\nThe entered price updates that item’s `unitPrice` in the provider, which flows straight into line totals, subtotal, GST, and grand total. The orange colour is a deliberate alert: it tells the waiter "this needs your input before you can take money."',
          whyItMatters:
            'Settling a bill with a ₹0 fish thali means giving away the most expensive dish for free — a direct revenue leak. Forcing a mandatory price on seasonal items, with a clear orange prompt and a blocked Settle button, makes that mistake impossible rather than merely unlikely.',
          steps: [
            'Detect items where `unitPrice == 0` as seasonal.',
            'Render an inline `TextField` (number keyboard) styled orange for each.',
            'On input, update that item’s `unitPrice` in the provider.',
            'Compute `allPriced` = no seasonal item still at 0.',
            'Disable the Settle button while `allPriced` is false.',
            'Recompute totals as prices are entered.',
          ],
          code: `// In the order card row, branch on seasonal items:
final isSeasonal = item.unitPrice == 0;

Widget priceCell = isSeasonal
    ? SizedBox(
        width: 90,
        child: TextField(
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            prefixText: '₹',
            hintText: 'Today',
            // Orange draws the eye to a required field.
            focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.orange, width: 2),
            ),
            enabledBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.orange),
            ),
          ),
          onChanged: (v) {
            final price = double.tryParse(v) ?? 0;
            context.read<OrderProvider>().setPrice(item.sku, price);
          },
        ),
      )
    : Text('₹\${item.unitPrice.toStringAsFixed(2)}');

// Settle button validation:
final allPriced = provider.active!.items.every((it) => it.unitPrice > 0);
// ElevatedButton(onPressed: allPriced ? settle : null, ...)`,
          pitfalls: [
            '**Letting a ₹0 item through to settlement.** Block Settle until every seasonal item has a price > 0.',
            '**Parsing the price without a fallback.** Use `double.tryParse(v) ?? 0` so a blank field does not crash.',
            '**Hiding the seasonal field’s urgency.** The orange styling is the signal that input is required — do not make it look like a normal field.',
            '**Forgetting to recompute totals.** Setting the price must notify listeners so GST and grand total reflect it.',
          ],
          tryIt:
            'Add a seasonal SKU with `unitPrice: 0`. On the finalise screen, confirm an orange price field appears and the Settle button stays disabled until you enter a price.',
          takeaway:
            'Seasonal items (`unitPrice == 0`) demand a mandatory orange price entry that gates settlement until filled.',
        },
      ],
    },
    {
      id: 'm7-s2',
      title: 'Tax & Money Math',
      topics: [
        {
          id: 'm7-t4',
          title: '5% GST split into CGST + SGST',
          explain:
            'A fixed 5% GST is split equally into CGST 2.5% and SGST 2.5%, printed as two separate lines on the bill.',
          analogy:
            'Think of the GST as a single ₹10 note the customer hands over for tax — but the rule says half goes to the Karnataka state pot and half to the central pot. So TunMani Cafe writes it on the bill as two ₹5 entries: CGST and SGST. Same total, but the bill shows the split because that is what the tax office expects to see.',
          theory:
            'Indian GST on restaurant service is **5%**, and the law requires it shown as **two halves**:\n\n- **CGST** (Central GST) = **2.5%**\n- **SGST** (State GST) = **2.5%**\n\nWe compute tax on the **taxable subtotal** (covered next topic). Both halves come from the same base:\n\n`cgst = taxable * 0.025`\n`sgst = taxable * 0.025`\n`totalTax = cgst + sgst`\n\nWe keep the rate as a named constant so it is easy to find and change. Computing CGST and SGST separately (rather than one 5% then halving) keeps the bill lines exact and avoids a rounding mismatch between the two printed amounts. Both lines appear on the printed bill so the customer — and any auditor — sees the legally required breakdown.',
          whyItMatters:
            'A restaurant bill that does not split GST into CGST and SGST is non-compliant and can be rejected by customers claiming expenses or by tax inspections. Encoding the 5% = 2.5% + 2.5% split correctly is a legal requirement, not a nicety, and getting the rounding right keeps your printed totals trustworthy.',
          steps: [
            'Define a constant `gstRate = 0.05` (and 0.025 per half).',
            'Compute `cgst = taxable * 0.025`.',
            'Compute `sgst = taxable * 0.025`.',
            'Sum them into `totalTax = cgst + sgst`.',
            'Print CGST and SGST as separate bill lines.',
            'Keep the rate in one place so it is easy to update.',
          ],
          code: `class TaxResult {
  final double cgst;
  final double sgst;
  double get totalTax => cgst + sgst;
  TaxResult(this.cgst, this.sgst);
}

// 5% GST = 2.5% CGST + 2.5% SGST, both from the same taxable base.
const double kCgstRate = 0.025;
const double kSgstRate = 0.025;

TaxResult computeTax(double taxableSubtotal) {
  final cgst = taxableSubtotal * kCgstRate;
  final sgst = taxableSubtotal * kSgstRate;
  return TaxResult(cgst, sgst); // two lines on the printed bill
}`,
          pitfalls: [
            '**Printing one 5% line.** The law requires CGST and SGST shown separately; one combined line is non-compliant.',
            '**Hard-coding 0.05 in many places.** Keep the rate in named constants so a rate change is a one-line edit.',
            '**Computing 5% then halving with rounding.** Compute each half from the base to avoid a 1-paisa mismatch between the lines.',
            '**Taxing the wrong base.** GST applies to the taxable subtotal (after discount, including parcel) — not the raw subtotal.',
          ],
          tryIt:
            'Write `computeTax(1000)` and confirm it returns CGST ₹25.00 and SGST ₹25.00 for a total tax of ₹50.00.',
          takeaway:
            'GST is a fixed 5% shown as two equal halves — CGST 2.5% and SGST 2.5% — computed from the taxable subtotal.',
        },
        {
          id: 'm7-t5',
          title: 'Taxable subtotal & parcel charge',
          explain:
            'taxableSubtotal = (subtotal − discount + parcelCharge) clamped to never go below zero; the parcel charge is itself taxable.',
          analogy:
            'Imagine the TunMani Cafe cashier with a small box for "what tax is calculated on." First they drop in the food total, take out the discount coupon, then add the takeaway box fee — because the box fee is taxed too. And if the discount is bigger than the bill, the box cannot hold a negative amount, so it sits at zero. That box is the taxable subtotal.',
          theory:
            'GST is not charged on the raw subtotal — it is charged on the **taxable subtotal**, which we build in order:\n\n`taxableSubtotal = (subtotal - discount + parcelCharge).clamp(0, double.infinity)`\n\n- **subtotal** — sum of all line totals (pre-tax).\n- **discount** — admin-applied reduction, subtracted **before** tax.\n- **parcelCharge** — takeaway packing fee, which **is taxable**, so we add it into the base.\n- **`.clamp(0, ∞)`** — guards against a discount larger than the bill producing a negative, which would create nonsensical negative tax.\n\nOnce we have the taxable subtotal we apply GST to it, then:\n\n`grandTotal = taxableSubtotal + totalTax`\n\nThe order of operations is the whole point: discount first (so the customer is taxed on the reduced amount), parcel folded in (because it is taxable), and a clamp so totals can never go negative.',
          whyItMatters:
            'Get the taxable base wrong and you either overcharge the customer (taxing before the discount) or undercharge the tax office (forgetting parcel is taxable) — both are real liabilities. The clamp also prevents a generous discount from producing an absurd negative bill, which would corrupt your revenue reports.',
          steps: [
            'Compute `subtotal` from the line totals.',
            'Subtract the `discount` (defaults to 0).',
            'Add the `parcelCharge` because it is taxable.',
            'Clamp the result to `[0, ∞)` to forbid negatives.',
            'Pass the taxable subtotal to `computeTax`.',
            'Add tax to get `grandTotal = taxableSubtotal + totalTax`.',
          ],
          code: `class BillMath {
  final double subtotal;     // sum of line totals
  final double discount;     // applied before tax
  final double parcelCharge; // taxable

  BillMath({required this.subtotal, this.discount = 0, this.parcelCharge = 0});

  // Discount first, parcel added (it is taxable), then clamp to avoid negatives.
  double get taxableSubtotal =>
      (subtotal - discount + parcelCharge).clamp(0, double.infinity);

  TaxResult get tax => computeTax(taxableSubtotal);

  double get grandTotal => taxableSubtotal + tax.totalTax;
}`,
          pitfalls: [
            '**Taxing the subtotal before subtracting the discount.** Discount applies before GST; taxing first overcharges the customer.',
            '**Treating parcel as tax-free.** The packing charge is taxable — fold it into the base, not added after tax.',
            '**Skipping the clamp.** A discount larger than the bill yields a negative taxable amount and negative tax without `.clamp(0, ∞)`.',
            '**Reordering the operations.** The sequence subtotal − discount + parcel, then clamp, then tax is fixed; changing it changes the bill.',
          ],
          tryIt:
            'Compute the taxable subtotal for subtotal ₹1000, discount ₹200, parcel ₹50. Confirm it is ₹850 and that a ₹2000 discount clamps it to ₹0.',
          takeaway:
            'Taxable subtotal = (subtotal − discount + taxable parcel) clamped at zero, and grand total = taxable subtotal + GST.',
        },
        {
          id: 'm7-t6',
          title: 'Formatting rupees with intl',
          explain:
            'Use the `intl` package and `toStringAsFixed(2)` to format every money value as clean rupees with exactly two decimals.',
          analogy:
            'A handwritten TunMani Cafe bill always shows "₹180.00", never "₹180.0000001" or "₹179.999". Neat, two-decimal rupee amounts are what a customer trusts. `intl` plus `toStringAsFixed(2)` is the cashier’s neat handwriting: it makes every amount look exactly the way money should on a bill.',
          theory:
            'Money math in Dart uses `double`, which carries **floating-point noise** — `0.1 + 0.2` is not exactly `0.3`. We never *display* a raw double. Two tools fix this:\n\n- **`toStringAsFixed(2)`** — rounds to two decimals and returns a string, e.g. `grandTotal.toStringAsFixed(2)` → `"850.00"`.\n- **`intl`’s `NumberFormat`** — formats with a currency symbol and locale-aware separators, e.g. `NumberFormat.currency(locale: "en_IN", symbol: "₹")` → `"₹1,250.00"` with Indian grouping.\n\nFor the Indian rupee, `en_IN` gives the correct comma placement (lakhs/crores style). We apply formatting **only at display and print time** — internal math stays in `double` so we do not accumulate string-rounding errors mid-calculation.\n\nThe rule: compute in `double`, **format at the edges**. Every rupee shown on screen or printed on the bill goes through the formatter.',
          whyItMatters:
            'A bill showing "₹179.9999998" looks broken and erodes trust in the app on day one. Formatting consistently with `intl` and `toStringAsFixed(2)` is what makes the totals look professional, and keeping the math in `double` until display avoids compounding rounding errors into the actual charge.',
          steps: [
            'Add `intl` to `pubspec.yaml` and import it.',
            'Create a `NumberFormat.currency(locale: "en_IN", symbol: "₹")`.',
            'Use it to format displayed and printed amounts.',
            'For simple cases, use `value.toStringAsFixed(2)` directly.',
            'Keep all internal math in `double`; format only at the edges.',
            'Apply the same formatter everywhere money appears.',
          ],
          code: `import 'package:intl/intl.dart';

// Indian rupee formatter with lakh/crore grouping.
final rupee = NumberFormat.currency(locale: 'en_IN', symbol: '₹');

String money(double v) => rupee.format(v);      // ₹1,250.00

// For a quick two-decimal string without a symbol:
String plain(double v) => v.toStringAsFixed(2); // 1250.00

// Usage on the bill:
// Text('Grand Total: \${money(bill.grandTotal)}')
// Text('CGST (2.5%): \${money(bill.tax.cgst)}')`,
          pitfalls: [
            '**Displaying raw doubles.** Floating-point noise shows ugly long decimals; always format before showing money.',
            '**Formatting mid-calculation.** Round only at display; rounding intermediate values compounds errors into the final charge.',
            '**Wrong locale.** Use `en_IN` for correct rupee grouping (lakhs), not `en_US` which groups in thousands only.',
            '**Forgetting to add `intl` to pubspec.** The import fails to resolve without the dependency.',
          ],
          tryIt:
            'Format ₹1250.5 and ₹179.999 with both `toStringAsFixed(2)` and the `en_IN` currency formatter. Compare the outputs and note the grouping.',
          takeaway:
            'Compute money in `double` but always format at display with `intl` and `toStringAsFixed(2)` for clean, two-decimal rupees.',
        },
      ],
    },
    {
      id: 'm7-s3',
      title: 'Discounts, Comp & Parcel',
      topics: [
        {
          id: 'm7-t7',
          title: 'Admin-only discount field',
          explain:
            'A rupee discount field, visible only to admins, reduces the bill before tax — waiters cannot apply it themselves.',
          analogy:
            'At TunMani Cafe only the owner can wave a hand and say "give the regulars ₹100 off." A waiter cannot decide that on their own, or every friend would eat at a discount. The admin-only discount field is that owner’s authority encoded in the app: the discount box simply does not appear for a normal waiter.',
          theory:
            'The **discount** is a flat **rupee amount** subtracted from the subtotal **before** GST. It is **admin-only**: we render the discount field only when `auth.isAdmin` is true, so a waiter never sees or applies it.\n\nWhy rupees, not a percentage? It is concrete and auditable — "₹100 off" is unambiguous and easy to reconcile. The amount feeds straight into the taxable-subtotal formula (`subtotal − discount + parcel`), so the customer is correctly taxed on the reduced amount.\n\nWe validate it: the discount cannot be negative, and (combined with the clamp from the tax math) it cannot push the bill below zero. Gating it behind `isAdmin` is an **authorization** control — the same role check that hides revenue analytics from staff in M6.',
          whyItMatters:
            'Uncontrolled discounts are a classic source of restaurant revenue leakage and staff fraud. Making the discount admin-only enforces who is allowed to give money away, and applying it before tax keeps the GST calculation honest with the tax office.',
          steps: [
            'Add a `discount` value to the bill state (defaults to 0).',
            'Render the discount `TextField` only when `auth.isAdmin`.',
            'Parse input as rupees with a `double.tryParse(...) ?? 0` fallback.',
            'Reject negative values.',
            'Feed the discount into the taxable-subtotal formula.',
            'Confirm GST and grand total recompute when it changes.',
          ],
          code: `// Only admins see the discount control.
if (auth.isAdmin)
  TextField(
    keyboardType: TextInputType.number,
    decoration: const InputDecoration(
      labelText: 'Discount (₹)',
      prefixText: '₹',
    ),
    onChanged: (v) {
      final d = double.tryParse(v) ?? 0;
      // Never negative; clamp in the math guards the rest.
      context.read<BillProvider>().setDiscount(d < 0 ? 0 : d);
    },
  ),

// In BillProvider, discount flows into the taxable subtotal:
// taxableSubtotal = (subtotal - discount + parcelCharge).clamp(0, infinity)`,
          pitfalls: [
            '**Showing the discount field to waiters.** Gate it behind `auth.isAdmin`; an open discount box invites abuse.',
            '**Applying the discount after tax.** Discount comes before GST so tax is on the reduced amount.',
            '**Allowing negative discounts.** A negative discount silently inflates the bill; clamp input at zero.',
            '**Storing discount as a percentage.** Use rupees for a concrete, auditable amount that reconciles cleanly.',
          ],
          tryIt:
            'Add an admin-only discount field. Log in as a waiter and confirm it is hidden; log in as admin, apply ₹100, and watch the taxable subtotal and GST drop.',
          takeaway:
            'The discount is an admin-only rupee amount subtracted before GST, gated by the same role check that hides analytics from staff.',
        },
        {
          id: 'm7-t8',
          title: 'The Comp (complimentary) toggle',
          explain:
            'A Comp toggle makes the entire bill free: discount becomes the full subtotal, status is set to DELETED, grand total is ₹0, and the print reads "COMPLIMENTARY — NO CHARGE".',
          analogy:
            'Sometimes the TunMani Cafe owner tells a special guest, "this one is on the house." The waiter still rings up every dish — for the records — but the customer pays nothing, and the slip is stamped "complimentary" so no one thinks money was pocketed. The Comp toggle is that "on the house" stamp: the bill exists for accounting, but the amount due is zero.',
          theory:
            'A **comp** (complimentary) bill is given free, usually by the owner, but it must still be **recorded** for accountability. Flipping the **Comp toggle** does four things:\n\n1. Sets **`discount = subtotal`** — so the taxable subtotal becomes 0.\n2. Sets the bill **`status = DELETED`** — marking it as a non-revenue, written-off bill.\n3. Forces **`grandTotal = ₹0`** — nothing is owed.\n4. Makes the printed bill read **"COMPLIMENTARY — NO CHARGE"** instead of a payable amount.\n\nWe still create the `BillOrder` document so there is a paper trail — who comped it, when, and what was on it. The `DELETED` status keeps it out of normal revenue totals while preserving the audit record. Because the taxable subtotal is zero, GST is zero too, so the math falls out cleanly from the existing formula.',
          whyItMatters:
            'Free meals happen, but an untracked free meal is indistinguishable from theft. The Comp toggle gives away the food while still recording exactly what was comped and marking it DELETED so it never inflates revenue — turning a trust problem into an auditable event.',
          steps: [
            'Add a `comp` boolean to the bill state.',
            'When toggled on, set `discount = subtotal`.',
            'Set the bill `status` to `DELETED`.',
            'Ensure `grandTotal` computes to ₹0 (taxable subtotal is 0).',
            'Switch the print label to "COMPLIMENTARY — NO CHARGE".',
            'Still save the `BillOrder` document for the audit trail.',
          ],
          code: `class BillProvider extends ChangeNotifier {
  bool comp = false;
  double discount = 0;
  String status = 'COMPLETED';

  void toggleComp(bool on, double subtotal) {
    comp = on;
    if (on) {
      discount = subtotal;     // wipe out the whole amount
      status = 'DELETED';      // written off, excluded from revenue
    } else {
      discount = 0;
      status = 'COMPLETED';
    }
    notifyListeners();
  }
}

// grandTotal falls out to 0 because taxableSubtotal is 0.
// On the printed bill:
// final label = comp ? 'COMPLIMENTARY — NO CHARGE' : money(bill.grandTotal);`,
          pitfalls: [
            '**Not saving comp bills.** Always record the bill (status DELETED) for the audit trail; deleting it outright destroys accountability.',
            '**Leaving comp bills in revenue totals.** The DELETED status must exclude them from sales reports.',
            '**Forgetting to zero the tax.** Setting discount = subtotal makes the taxable base 0, so GST is 0 automatically — verify it.',
            '**Showing a payable amount on a comp print.** Switch the label to "COMPLIMENTARY — NO CHARGE".',
          ],
          tryIt:
            'Add a Comp toggle. Flip it on a ₹500 order and confirm grand total is ₹0, status is DELETED, and the bill preview shows "COMPLIMENTARY — NO CHARGE".',
          takeaway:
            'The Comp toggle zeroes the bill via a full discount, marks it DELETED, and prints "COMPLIMENTARY — NO CHARGE" while keeping the record.',
        },
        {
          id: 'm7-t9',
          title: 'The parcel (takeaway) toggle',
          explain:
            'A parcel toggle marks the order as takeaway and reveals a taxable parcel-charge field that is added into the taxable subtotal.',
          analogy:
            'When a Kundapura family takes their kori rotti home instead of eating in, TunMani Cafe adds a small charge for the packing — the leaf-wrap, the box, the carry bag. That packing fee is part of the sale, so it is taxed like the food. The parcel toggle adds that fee, and because it is a sale, GST rides on it too.',
          theory:
            'The **parcel toggle** marks an order as **takeaway**. When on, it reveals a **parcel-charge field** — a rupee amount for packing. Crucially, this charge **is taxable**: it folds into the taxable subtotal *before* GST, exactly as we saw in the tax math:\n\n`taxableSubtotal = (subtotal − discount + parcelCharge).clamp(0, ∞)`\n\nSo the parcel charge increases both the base and the GST on it. We store a `parcel` boolean (for the record and the print) and a `parcelCharge` double. When the toggle is off, `parcelCharge` is 0 and the field is hidden.\n\nWe validate the charge as a non-negative number with a `tryParse` fallback. Marking the order as parcel also lets the printed bill and reports distinguish dine-in from takeaway, which the restaurant may want for analytics later.',
          whyItMatters:
            'Charging for packing without taxing it under-reports GST; not charging at all eats into margins on every takeaway. Treating the parcel charge as a taxable line keeps the restaurant both compliant and profitable, and flagging the order as parcel feeds cleaner dine-in vs takeaway reporting.',
          steps: [
            'Add a `parcel` boolean and a `parcelCharge` double to the bill state.',
            'Show the parcel-charge field only when the toggle is on.',
            'Parse input with a `double.tryParse(...) ?? 0` fallback; reject negatives.',
            'Add `parcelCharge` into the taxable subtotal so GST applies to it.',
            'Set `parcelCharge = 0` and hide the field when the toggle is off.',
            'Record the `parcel` flag on the bill for the print and reports.',
          ],
          code: `class BillProvider extends ChangeNotifier {
  bool parcel = false;
  double parcelCharge = 0;

  void toggleParcel(bool on) {
    parcel = on;
    if (!on) parcelCharge = 0;   // clear charge when not takeaway
    notifyListeners();
  }

  void setParcelCharge(double v) {
    parcelCharge = v < 0 ? 0 : v;
    notifyListeners();
  }
}

// UI: reveal the charge field only when parcel is on.
// if (provider.parcel)
//   TextField(decoration: InputDecoration(labelText: 'Parcel charge (₹)'),
//     onChanged: (v) => provider.setParcelCharge(double.tryParse(v) ?? 0))
//
// The charge is taxable: it is added inside taxableSubtotal before GST.`,
          pitfalls: [
            '**Adding parcel charge after tax.** It is taxable — fold it into the base before computing GST.',
            '**Leaving a stale charge when toggling off.** Reset `parcelCharge = 0` so a hidden field does not silently keep charging.',
            '**Allowing a negative parcel charge.** Clamp input at zero like the discount.',
            '**Not recording the parcel flag.** Store it on the bill so prints and reports can tell takeaway from dine-in.',
          ],
          tryIt:
            'Add a parcel toggle and charge field. Enable it with a ₹20 charge on a ₹400 order and confirm the taxable subtotal becomes ₹420 and GST rises accordingly.',
          takeaway:
            'The parcel toggle adds a taxable packing charge into the subtotal before GST and flags the order as takeaway.',
        },
      ],
    },
    {
      id: 'm7-s4',
      title: 'Payment & Settle',
      topics: [
        {
          id: 'm7-t10',
          title: 'Payment type ChoiceChips',
          explain:
            'The waiter picks a payment method from ChoiceChips — CASH, CARD, UPI, or CREDIT — with UPI selected by default.',
          analogy:
            'At the TunMani Cafe counter the customer says how they are paying: "cash," "card," "PhonePe," or "put it on my tab." The waiter just taps the matching chip. ChoiceChips are that quick tap-to-choose — four clear options, one tapped at a time, with UPI already lit up because that is how most Kundapura customers pay now.',
          theory:
            '**`ChoiceChip`** is Flutter’s widget for "pick exactly one from a small set." We render four chips:\n\n- **CASH** — physical cash.\n- **CARD** — debit/credit card machine.\n- **UPI** — GPay/PhonePe/Paytm (the default, since it is most common).\n- **CREDIT** — put on the customer’s running tab.\n\nWe hold the selected method in state (an enum or string) and mark exactly one chip `selected`. Tapping a chip updates the selection and triggers any side effects — most importantly, choosing **UPI** reveals the QR code (next topic).\n\nDefaulting to **UPI** saves the most common tap. The selected `paymentType` is saved onto the `BillOrder` so reports can break down sales by method. ChoiceChips give a clear, single-select control that beats a dropdown for speed at a busy counter.',
          whyItMatters:
            'Recording how each bill was paid is essential for daily cash reconciliation and accounting — you must know how much came as cash vs UPI vs credit. ChoiceChips make selection a single tap, and defaulting to UPI matches real customer behaviour so the common case is fastest.',
          steps: [
            'Define a `PaymentType` enum: cash, card, upi, credit.',
            'Hold the selected type in state, defaulting to `upi`.',
            'Render four `ChoiceChip`s, one per type.',
            'Mark a chip `selected` when it matches the state.',
            'On tap, update the selection and trigger UPI QR if relevant.',
            'Save the chosen `paymentType` onto the `BillOrder`.',
          ],
          code: `enum PaymentType { cash, card, upi, credit }

class PaymentChips extends StatelessWidget {
  final PaymentType selected;
  final ValueChanged<PaymentType> onSelect;
  const PaymentChips({super.key, required this.selected, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      children: PaymentType.values.map((t) {
        return ChoiceChip(
          label: Text(t.name.toUpperCase()),       // CASH / CARD / UPI / CREDIT
          selected: selected == t,                  // single-select
          onSelected: (_) => onSelect(t),
        );
      }).toList(),
    );
  }
}

// Default selection in state:
// PaymentType selected = PaymentType.upi;  // UPI is most common`,
          pitfalls: [
            '**Allowing multiple chips selected.** ChoiceChip is single-select; ensure only the matching chip shows `selected`.',
            '**Not defaulting to UPI.** Most customers pay by UPI; defaulting saves a tap every bill.',
            '**Forgetting to persist the method.** Save `paymentType` on the bill for cash/UPI reconciliation.',
            '**Using checkboxes or a dropdown.** A row of chips is faster to tap at a busy counter than a dropdown.',
          ],
          tryIt:
            'Render the four payment ChoiceChips defaulting to UPI. Tap each one and confirm only one is highlighted at a time and the selection updates state.',
          takeaway:
            'Payment method is a single-select ChoiceChip row (CASH/CARD/UPI/CREDIT) defaulting to UPI and saved on the bill.',
        },
        {
          id: 'm7-t11',
          title: 'UPI QR code with qr_flutter',
          explain:
            'When UPI is selected, we show a QR code built with `qr_flutter` from a `upi://pay` deep link carrying the store’s UPI id and the grand total — hidden for comp bills.',
          analogy:
            'Instead of reading out "scan my number and type ₹450," the TunMani Cafe counter shows a printed QR that the customer points their phone at — the amount and the shop’s UPI handle are baked in, so they just confirm and pay. The `qr_flutter` QR is that scan-and-go code: it encodes exactly who gets paid and how much, with no typing.',
          theory:
            'A **UPI deep link** is a URL of the form:\n\n`upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR`\n\n- **`pa`** — payee address (the store’s UPI id, from settings/store `upiId`).\n- **`pn`** — payee name.\n- **`am`** — amount = the **grand total**.\n- **`cu`** — currency, INR.\n\nWe build this string, then render it as a scannable QR using the **`qr_flutter`** package’s `QrImageView`. The customer scans it with any UPI app, which pre-fills the payee and amount — they only confirm.\n\nWe read the `upiId` from the store **settings** (saved earlier), so the right account is paid. The QR is shown **only when UPI is selected** and is **hidden for comp bills**, since a ₹0 complimentary bill has nothing to collect. Encoding the amount into the link avoids the customer mistyping the total.',
          whyItMatters:
            'A QR with the amount baked in removes the two most common UPI errors — paying the wrong shop and typing the wrong amount — which protects both the customer and the restaurant’s takings. Pulling the UPI id from settings means the money always lands in the correct account, and hiding the QR for comp bills avoids collecting on a free meal.',
          steps: [
            'Add `qr_flutter` to `pubspec.yaml` and import it.',
            'Read the store `upiId` from settings.',
            'Build the deep link: `upi://pay?pa=...&pn=...&am={grandTotal}&cu=INR`.',
            'Render it with `QrImageView(data: link)`.',
            'Show the QR only when the payment type is UPI.',
            'Hide it entirely for comp bills (grand total ₹0).',
          ],
          code: `import 'package:qr_flutter/qr_flutter.dart';

String buildUpiLink({required String upiId, required String name,
                     required double amount}) {
  final am = amount.toStringAsFixed(2);
  return 'upi://pay?pa=\$upiId&pn=\${Uri.encodeComponent(name)}&am=\$am&cu=INR';
}

class UpiQr extends StatelessWidget {
  final String upiId;
  final double grandTotal;
  final bool isComp;
  const UpiQr({super.key, required this.upiId,
               required this.grandTotal, required this.isComp});

  @override
  Widget build(BuildContext context) {
    if (isComp) return const SizedBox.shrink();   // nothing to collect
    final link = buildUpiLink(
      upiId: upiId, name: 'TunMani Cafe', amount: grandTotal);
    return QrImageView(data: link, size: 200);    // scannable UPI QR
  }
}`,
          pitfalls: [
            '**Hard-coding the UPI id.** Read it from store settings so the correct account is paid and it can change without a rebuild.',
            '**Showing the QR for comp bills.** A ₹0 bill has nothing to collect; hide it.',
            '**Not URL-encoding the payee name.** Spaces and special characters break the deep link; use `Uri.encodeComponent`.',
            '**Putting the amount as an int.** Format with two decimals (`toStringAsFixed(2)`) so the UPI app shows the exact total.',
          ],
          tryIt:
            'Build the `upi://pay` link for ₹450.00 to a test UPI id and render it with `QrImageView`. Scan it with a UPI app and confirm the payee and amount pre-fill.',
          takeaway:
            'A `qr_flutter` QR encodes a `upi://pay` link with the store’s UPI id and grand total, shown only for UPI and never for comp bills.',
        },
        {
          id: 'm7-t12',
          title: 'The settle flow & Retry Print',
          explain:
            'Settling fetches a transactional bill number, saves the BillOrder to `orders` once, deletes the running order, then prints — with a "Retry Print" if printing fails but the bill is already saved.',
          analogy:
            'When the TunMani Cafe customer pays, the cashier does three things in order: tear the next numbered receipt from the book, file the carbon copy in the register, and bin the kitchen slip — and only then hand over the printed receipt. If the printer jams, the sale is still recorded; the cashier just re-prints. The settle flow is exactly that disciplined sequence, with Retry Print covering a jammed printer.',
          theory:
            'Settling is a **carefully ordered sequence** so money is never lost:\n\n1. **`nextBillNo()`** — fetch the next sequential bill number from a counter **inside a transaction** (same pattern as `nextWalkinNo()` in M6).\n2. **Save the `BillOrder` to `orders` — exactly once.** This is the durable record of the sale.\n3. **Delete the running order** from `running_orders`. The draft is done.\n4. **Print** the bill (covered in M8).\n\nThe key insight: **save before print**. Printing is the flaky step — printers jam, run out of paper, or lose Bluetooth. If we printed first and saving failed, we would have a paper bill with no record. By saving first, a print failure never loses the sale.\n\nSo if printing fails, the bill is **already safe** in `orders`. We surface a **"Retry Print"** button that re-attempts only the print step — it does **not** re-save or re-number the bill. Saving the `BillOrder` **once** (idempotency) prevents duplicate orders if the waiter taps settle twice.',
          whyItMatters:
            'Printers are the least reliable part of any POS, so the difference between "save then print" and "print then save" is the difference between a robust system and one that loses sales on every paper jam. Settling in this exact order, saving once, and offering Retry Print means a hardware hiccup never costs the restaurant a recorded bill.',
          steps: [
            'Fetch `nextBillNo()` via a Firestore transaction (like `nextWalkinNo`).',
            'Build the `BillOrder` with items, totals, tax, payment type, and bill number.',
            'Save it to `orders` exactly once (guard against double-tap).',
            'Delete the running order from `running_orders`.',
            'Attempt to print the bill (M8).',
            'If printing fails, show "Retry Print" that re-runs only the print step.',
          ],
          code: `Future<void> settle(BillOrder bill, RunningOrder running) async {
  // 1. Next sequential bill number — transactional, never duplicated.
  final billNo = await nextBillNo();
  final saved = bill.copyWith(billNo: billNo);

  // 2. Save the sale ONCE — this is the durable record.
  final ref = FirebaseFirestore.instance.collection('orders').doc();
  await ref.set(saved.toMap());

  // 3. Remove the draft.
  await FirebaseFirestore.instance
      .collection('running_orders').doc(running.id).delete();

  // 4. Print last — the flaky step. Bill is already safe if this throws.
  try {
    await printBill(saved);          // covered in M8
  } catch (e) {
    // Bill is saved; offer Retry Print without re-saving or re-numbering.
    showRetryPrint(() => printBill(saved));
  }
}`,
          pitfalls: [
            '**Printing before saving.** If the print succeeds but the save fails, you have a paper bill with no record — always save first.',
            '**Re-saving on Retry Print.** Retry must re-run only the print; re-saving creates a duplicate order with a new number.',
            '**Not guarding double-tap settle.** Disable the button after the first tap so the bill is written to `orders` exactly once.',
            '**Forgetting to delete the running order.** A settled order left in `running_orders` shows a paid table as still running.',
          ],
          tryIt:
            'Implement the settle flow saving a `BillOrder` then printing. Simulate a print failure (throw inside `printBill`) and confirm the bill is still in `orders` and a Retry Print option appears.',
          takeaway:
            'Settle in order — bill number, save once to `orders`, delete the draft, then print — so a print failure never loses a saved sale.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm7-p1',
      type: 'Mini Project',
      title: 'Finalise Screen with GST Math',
      domain: 'Restaurant POS',
      duration: '2 hours',
      description:
        'Build the finalise screen: an editable order card, mandatory pricing for seasonal items, and correct GST math — 5% split into CGST + SGST on a discount-and-parcel-aware taxable subtotal.',
      tools: ['Flutter', 'Firebase Firestore', 'Provider', 'intl'],
      blueprint: {
        overview:
          'Recreate the TunMani Cafe finalise screen with correct money math. The waiter reviews items, prices seasonal dishes, and the screen computes taxable subtotal, CGST, SGST, and grand total live as discount and parcel change.',
        functionalRequirements: [
          '**Order card.** Every item with per-item +/- and a computed line total.',
          '**Seasonal pricing.** Items with `unitPrice == 0` show a mandatory orange price field that gates settlement.',
          '**Add more items.** A collapsible search panel for last-minute additions.',
          '**GST split.** Fixed 5% shown as CGST 2.5% + SGST 2.5%.',
          '**Taxable subtotal.** (subtotal − discount + parcel) clamped at zero, with parcel taxable.',
          '**Formatted money.** All amounts shown via `intl` / `toStringAsFixed(2)`.',
        ],
        technicalImplementation: [
          '**Bill math.** A `BillMath` class computing taxableSubtotal, tax, and grandTotal.',
          '**Tax.** `computeTax` returning CGST and SGST from the taxable base.',
          '**Validation.** `allPriced` gate disabling Settle while any seasonal item is ₹0.',
          '**Provider.** `setPrice`, `setDiscount`, `setParcelCharge` mutations.',
          '**Formatting.** A shared `NumberFormat.currency(locale: "en_IN", symbol: "₹")`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Bill math & GST',
            outcome: 'Correct taxable subtotal and CGST/SGST split.',
            prompt:
              'Write a Dart `BillMath` class with fields subtotal, discount, parcelCharge. Compute `taxableSubtotal = (subtotal - discount + parcelCharge).clamp(0, double.infinity)`, a `computeTax` returning CGST (2.5%) and SGST (2.5%) from that base, and `grandTotal = taxableSubtotal + totalTax`. Include unit-test-style examples for subtotal 1000, discount 200, parcel 50.',
          },
          {
            step: 2,
            label: 'Editable order card',
            outcome: 'A finalise order card with per-item +/-.',
            prompt:
              'Build a `FinaliseOrderCard` reading the active order from `OrderProvider`. Each row shows item name, unit price, computed line total, and +/- buttons that mutate the provider. The card must rebuild and the totals below it must recompute on every change.',
          },
          {
            step: 3,
            label: 'Seasonal price entry',
            outcome: 'Mandatory orange price field gating settlement.',
            prompt:
              'For items where `unitPrice == 0`, render an inline orange-bordered number `TextField` that sets that item’s price via `provider.setPrice(sku, value)`. Compute `allPriced` = every item has `unitPrice > 0`, and disable the Settle button while `allPriced` is false.',
          },
          {
            step: 4,
            label: 'Formatted totals panel',
            outcome: 'A totals panel showing the GST breakdown in rupees.',
            prompt:
              'Add a totals panel below the order card showing Subtotal, Discount, Parcel, CGST (2.5%), SGST (2.5%), and Grand Total, each formatted with a shared `NumberFormat.currency(locale: "en_IN", symbol: "₹")`. Wire it to recompute live from `BillMath`.',
          },
        ],
      },
    },
    {
      id: 'm7-p2',
      type: 'Mini Project',
      title: 'Payment Selector with UPI QR & Settle',
      domain: 'Restaurant POS',
      duration: '2 hours',
      description:
        'Build the payment section: CASH/CARD/UPI/CREDIT ChoiceChips, a UPI QR generated from the store’s UPI id and grand total, and a robust settle flow that saves before printing with Retry Print on failure.',
      tools: ['Flutter', 'Firebase Firestore', 'qr_flutter', 'Provider'],
      blueprint: {
        overview:
          'Complete settlement. The waiter picks a payment method, shows a UPI QR for the exact amount when UPI is chosen, and settles — fetching a bill number, saving the BillOrder once, deleting the draft, then printing with a Retry Print fallback.',
        functionalRequirements: [
          '**Payment chips.** Single-select CASH/CARD/UPI/CREDIT defaulting to UPI.',
          '**UPI QR.** A `qr_flutter` QR from a `upi://pay` link with the store UPI id and grand total, shown only for UPI.',
          '**Comp handling.** Hide the QR for complimentary (₹0) bills.',
          '**Settle order.** nextBillNo → save to `orders` once → delete running order → print.',
          '**Save before print.** The bill is durable before the flaky print step runs.',
          '**Retry Print.** On print failure, re-attempt only the print without re-saving.',
        ],
        technicalImplementation: [
          '**Chips.** A `PaymentChips` widget over a `PaymentType` enum.',
          '**Deep link.** `buildUpiLink(upiId, name, amount)` producing `upi://pay?...`.',
          '**QR.** `QrImageView` rendering the link, guarded for comp bills.',
          '**Numbering.** `nextBillNo()` via a Firestore transaction.',
          '**Settle.** Save once, delete draft, print, and a `showRetryPrint` fallback.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Payment ChoiceChips',
            outcome: 'Single-select payment method defaulting to UPI.',
            prompt:
              'Create a `PaymentType` enum (cash, card, upi, credit) and a `PaymentChips` widget rendering one `ChoiceChip` per value, single-select, defaulting to UPI. Selecting a chip updates state and, when UPI, reveals the QR section.',
          },
          {
            step: 2,
            label: 'UPI deep link & QR',
            outcome: 'A scannable QR with payee and amount baked in.',
            prompt:
              'Write `buildUpiLink({upiId, name, amount})` returning `upi://pay?pa=...&pn=...&am=<2dp>&cu=INR` with the name URL-encoded. Render it via `qr_flutter`’s `QrImageView`. Read the upiId from store settings, show the QR only for UPI, and hide it for comp bills.',
          },
          {
            step: 3,
            label: 'Transactional bill number',
            outcome: 'Unique sequential bill numbers under load.',
            prompt:
              'Write `nextBillNo()` that atomically increments a `counters/bill` document inside `runTransaction` and returns the new int, mirroring the `nextWalkinNo()` pattern from M6.',
          },
          {
            step: 4,
            label: 'Settle flow with Retry Print',
            outcome: 'Save before print; recover from print failure.',
            prompt:
              'Write a `settle(bill, running)` function that: fetches `nextBillNo()`, saves the `BillOrder` to `orders` exactly once, deletes the running order, then prints. Wrap the print in try/catch so a failure shows a "Retry Print" action that re-runs only the print step without re-saving or re-numbering. Guard against double-tap so the order is saved once.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm7-q1',
      q: 'How is the fixed 5% GST shown on a TunMani Cafe bill?',
      options: [
        'As a single 5% line',
        'As CGST 2.5% + SGST 2.5%, two separate lines computed from the taxable subtotal',
        'As an 18% line for restaurants',
        'It is not shown to the customer',
      ],
      answer: 1,
    },
    {
      id: 'm7-q2',
      q: 'What is the formula for the taxable subtotal?',
      options: [
        'subtotal + discount − parcel',
        'subtotal × 1.05',
        '(subtotal − discount + parcelCharge) clamped to a minimum of 0',
        'subtotal − parcelCharge',
      ],
      answer: 2,
    },
    {
      id: 'm7-q3',
      q: 'What happens to an item stored with unitPrice == 0 on the finalise screen?',
      options: [
        'It is removed automatically',
        'It is billed at ₹0',
        'It shows a mandatory orange price field that must be filled before settling',
        'It is hidden from the waiter',
      ],
      answer: 2,
    },
    {
      id: 'm7-q4',
      q: 'When the Comp toggle is switched on, what does the bill become?',
      options: [
        'Discount = full subtotal, status DELETED, grand total ₹0, prints "COMPLIMENTARY — NO CHARGE"',
        'Deleted from the database with no record',
        'Charged at double price',
        'Marked as UPI paid',
      ],
      answer: 0,
    },
    {
      id: 'm7-q5',
      q: 'What does the UPI QR code encode, and when is it hidden?',
      options: [
        'A website URL; hidden for card payments',
        'A upi://pay link with the store UPI id and grand total; hidden for comp bills',
        'The customer’s phone number; never hidden',
        'Just the amount as plain text; hidden at night',
      ],
      answer: 1,
    },
    {
      id: 'm7-q6',
      q: 'Why does the settle flow save the BillOrder before printing?',
      options: [
        'Because printing is faster than saving',
        'So that if printing fails, the sale is already safely recorded and only the print needs retrying',
        'Because Firestore requires it',
        'To save paper',
      ],
      answer: 1,
    },
  ],
};
