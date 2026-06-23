// Module 5 — The Seva Counter UI: Issuing Seva Tickets for "Maranakatte Seva".
// Electron + React + Vite + LOCAL PostgreSQL (pg). OFFLINE desktop app for the
// counter staff at Shri Brahmalingeshwara Temple, Maranakatte. Teaches the core
// fast-counter screen: a seva grid, a ticket cart with devotee details and a live
// rupee total, a keyboard-first workflow, and saving a receipt over IPC to get a
// token number. Consumed by the React course player (see components/TopicItem.jsx).

export const m5 = {
  id: 'm5',
  title: 'The Seva Counter UI: Issuing Seva Tickets',
  hours: 9,
  color: 'from-rose-500/20 to-rose-700/10',
  accent: 'rose',
  description:
    'Build the heart of Maranakatte Seva — a fast counter screen that staff use to issue seva tickets. A clickable seva grid, a ticket cart that captures devotee name, gotra and nakshatra per line, a live rupee total with cash/UPI payment, a keyboard-first workflow to push 500+ Rangapooje tickets during the evening rush, and saving the receipt over IPC to get back a token number.',
  sections: [
    {
      id: 'm5-s1',
      title: 'The counter screen',
      topics: [
        {
          id: 'm5-t1',
          title: 'Laying Out a Fast Counter Screen',
          explain:
            'Split the counter screen into three zones — a **seva grid** on the left, a **ticket cart** on the right, and **devotee fields** above the cart — so a staff member can work without hunting around.',
          analogy:
            'Picture the seva counter at **Shri Brahmalingeshwara Temple in Maranakatte** on a busy evening. The staff member has a **board of seva names** in front of them (Rangapooje, Mangalarathi, Hannikaayi), a **slip pad** where the current devotee\'s sevas are listed, and a little space to jot the devotee\'s **name, gotra and nakshatra**. Our screen is exactly that desk turned into pixels: grid on the left, slip on the right, devotee box on top.',
          theory:
            'A counter screen lives or dies on **layout**. During the evening Rangapooje rush the staff member is not reading the screen carefully — their eyes flick to the same three places again and again. So we fix those places: a **seva grid** (a wall of big tappable buttons), a **cart panel** (the running list of what this devotee is paying for), and a **devotee strip** (name / gotra / nakshatra inputs). Nothing moves around between devotees.\n\nIn React this is one component, say `CounterScreen`, that renders three child regions inside a CSS grid or flex layout. The left region maps over a list of sevas to draw buttons; the right region maps over the **cart array** to draw line rows; the top strip holds the controlled inputs. Keeping them as separate child components (`SevaGrid`, `CartPanel`, `DevoteeFields`) keeps each file small and lets you restyle one zone without touching the others.\n\nBecause this is an **offline Electron app**, the screen has no network spinner and no \"loading\" states for the grid — the seva list is read once from the local Postgres database when the screen mounts and then it just sits there. That is a big reason the app feels instant: there is no cloud round-trip between the button and the screen.',
          whyItMatters:
            'This screen is used hundreds of times every single evening, so a layout that wastes even one second per devotee costs minutes across a Rangapooje rush. A fixed, predictable three-zone layout lets staff build muscle memory and stop looking at the screen — which is the whole point of a fast counter.',
          steps: [
            'Create `src/renderer/screens/CounterScreen.jsx` as the top-level counter component.',
            'Lay out three regions with CSS grid: a wide left column for the seva grid, a narrower right column for the cart.',
            'Put the devotee fields (name, gotra, nakshatra) in a strip above the cart panel.',
            'Split the regions into `SevaGrid`, `DevoteeFields` and `CartPanel` child components.',
            'Load the seva list once on mount and hold it in state; never re-fetch it on every render.',
            'Test the layout at the actual counter screen size (usually a small 1366x768 monitor).',
          ],
          code: `// src/renderer/screens/CounterScreen.jsx — the three-zone counter.
import { useState, useEffect } from 'react';
import SevaGrid from '../components/SevaGrid';
import DevoteeFields from '../components/DevoteeFields';
import CartPanel from '../components/CartPanel';

export default function CounterScreen() {
  const [sevas, setSevas] = useState([]);
  const [cart, setCart] = useState([]);

  // Load the seva list ONCE from local Postgres (over IPC) when the screen opens.
  useEffect(() => {
    api.sevas.list().then(setSevas);
  }, []);

  return (
    <div className='counter' style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px' }}>
      <SevaGrid sevas={sevas} onPick={(seva) => setCart((c) => [...c, makeLine(seva)])} />
      <div className='cart-column'>
        <DevoteeFields />
        <CartPanel cart={cart} setCart={setCart} />
      </div>
    </div>
  );
}

function makeLine(seva) {
  return { id: crypto.randomUUID(), sevaId: seva.id, name: seva.name, amount: seva.amount, qty: 1, devotee: { name: '', gotra: '', nakshatra: '' } };
}`,
          pitfalls: [
            'Re-fetching the seva list on every render (put it in a `useEffect` with an empty dependency array so it runs once).',
            'A scrollable seva grid — staff should see every common seva without scrolling during the rush.',
            'Tiny buttons: on a counter, big targets are faster and harder to mis-tap.',
            'Cramming everything into one giant component instead of `SevaGrid` / `CartPanel` / `DevoteeFields`.',
            'Designing on a big developer monitor, then finding it broken on the counter\'s small screen.',
            'Adding loading spinners to a local, offline screen where data is already in memory.',
          ],
          tryIt:
            'Open the counter screen and resize the window to 1366x768. Can you see the seva grid, the cart and the devotee fields all at once without scrolling? If not, shrink the grid buttons or the cart column until you can.',
          takeaway:
            'A fast counter is three fixed zones — seva grid, devotee fields, cart — loaded once and never moving, so staff build muscle memory instead of hunting.',
        },
        {
          id: 'm5-t2',
          title: 'Drawing the Seva Grid From Data',
          explain:
            'Render the seva grid by mapping over the **list of sevas from the database**, so adding a new seva never means editing the screen code.',
          analogy:
            'The temple sometimes adds a new seva — say a special **Hannikaayi** offering for a festival. The staff should not have to wait for a programmer to add a button. If the grid is drawn from the seva **list in the database**, then adding a row to that list makes a new button appear by itself, the way a new name on the temple notice board just shows up for everyone to read.',
          theory:
            'A seva grid is just an array of seva rows turned into an array of buttons. Each seva row from Postgres has an `id`, a `name` (e.g. `\'Rangapooje\'`), and an `amount` (the rupee price as a Postgres `numeric`, which arrives in JavaScript as a string you parse). You `map` over that array and render one `<button>` per seva.\n\nThe golden rule of React lists is the **key**: every button needs a stable, unique `key`, and the seva\'s database `id` is perfect for that. Never use the array index as the key, because if the seva list ever reorders, React will get confused about which button is which.\n\nClicking a seva button does **not** charge anyone — it just **adds a line** to the cart. So the grid takes an `onPick` callback from its parent and calls `onPick(seva)` on click. The grid stays \"dumb\": it knows how to draw sevas and report a click, but it does not own the cart. That separation is what keeps the grid reusable and easy to test.',
          whyItMatters:
            'Drawing the grid from data means the temple can add, rename or re-price a seva by editing the database — no code change, no new app build. For an offline app installed on a counter machine, that is the difference between a five-minute change and a developer visit.',
          steps: [
            'Receive the `sevas` array and an `onPick` callback as props in `SevaGrid`.',
            'Map over `sevas` to render one `<button>` per seva, showing the name and rupee amount.',
            'Use `seva.id` as the React `key`, never the array index.',
            'Call `onPick(seva)` in the button\'s `onClick` handler.',
            'Style buttons large and arrange them in a CSS grid (e.g. four across).',
            'Show an empty state if the seva list is empty (e.g. database not seeded yet).',
          ],
          code: `// src/renderer/components/SevaGrid.jsx — buttons drawn from the seva list.
export default function SevaGrid({ sevas, onPick }) {
  if (sevas.length === 0) {
    return <p className='empty'>No sevas configured yet.</p>;
  }
  return (
    <div className='seva-grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
      {sevas.map((seva) => (
        <button key={seva.id} className='seva-btn' onClick={() => onPick(seva)}>
          <span className='seva-name'>{seva.name}</span>
          <span className='seva-amount'>{'\\u20B9'}{seva.amount}</span>
        </button>
      ))}
    </div>
  );
}`,
          pitfalls: [
            'Using the array index as `key` — it breaks when the seva list reorders.',
            'Hard-coding seva buttons in JSX instead of mapping over the database list.',
            'Letting the grid own the cart; it should only report a click via `onPick`.',
            'Forgetting that `amount` arrives from Postgres `numeric` as a string, not a number.',
            'No empty state, so a freshly installed (unseeded) database shows a blank, scary screen.',
            'Putting business rules (like discounts) inside the grid instead of the cart logic.',
          ],
          tryIt:
            'Add a new row to the `sevas` table in your local database (e.g. a festival Hannikaayi at ₹50), restart the screen, and confirm a new button appears with no code change.',
          takeaway:
            'Map the seva list to buttons with a stable `id` key, and let the grid only report clicks — the temple edits sevas in data, not in code.',
        },
        {
          id: 'm5-t3',
          title: 'Picking a Seva and Adding It to the Cart',
          explain:
            'When a seva button is clicked, build a fresh **line item** and append it to the cart array in React state immutably.',
          analogy:
            'Each click is like the staff member writing one more line on the devotee\'s slip: \"Rangapooje — ₹20\". They never erase the slip and rewrite it; they just **add a line**. In React we do the same — we make a brand-new slip (a new array) that has all the old lines plus the new one.',
          theory:
            'The cart is an **array of line items** held in React state. A line item is a small object: a unique `id` (so we can update or remove just that line later), the `sevaId` and `name` copied from the seva, the `amount`, a `qty` (starts at 1), and a `devotee` sub-object for name / gotra / nakshatra.\n\nThe critical React rule is **immutability**: you never `push` into the existing array, because React compares the old and new array references to decide whether to re-render. Instead you create a **new array** with the spread operator: `setCart(c => [...c, newLine])`. The `c =>` updater form is important during a fast rush, because two clicks can land almost together and the updater form always builds on the latest state.\n\nGiving each line a unique `id` (from `crypto.randomUUID()`) is what makes later edits sane. When the staff member changes the quantity on line three, you find the line **by its id**, not by its position — so even if lines are added or removed the right line gets updated.',
          whyItMatters:
            'Adding to the cart is the single most repeated action in the whole app — it happens for every seva of every devotee, 500+ times an evening. Doing it immutably with stable line ids prevents the subtle bugs (wrong line updated, missed re-render) that would otherwise pile up exactly when the counter is busiest.',
          steps: [
            'In `CounterScreen`, define an `addLine(seva)` function that builds a line item object.',
            'Give the line a unique `id` with `crypto.randomUUID()`.',
            'Copy `sevaId`, `name`, `amount` from the seva and default `qty` to 1.',
            'Add an empty `devotee` object: `{ name: \'\', gotra: \'\', nakshatra: \'\' }`.',
            'Append immutably: `setCart(c => [...c, line])` — never `c.push(line)`.',
            'Pass `addLine` down to `SevaGrid` as the `onPick` prop.',
          ],
          code: `// Adding a seva to the cart — immutable append with a stable line id.
function addLine(seva) {
  const line = {
    id: crypto.randomUUID(),       // stable id for later edit / remove
    sevaId: seva.id,
    name: seva.name,
    amount: Number(seva.amount),   // numeric from Postgres arrives as a string
    qty: 1,
    devotee: { name: '', gotra: '', nakshatra: '' },
  };
  setCart((c) => [...c, line]);    // new array, NOT c.push(line)
}`,
          pitfalls: [
            'Mutating the array with `cart.push(...)` — React will not re-render reliably.',
            'Using `setCart([...cart, line])` instead of the updater form, losing clicks during fast taps.',
            'Reusing the seva\'s `id` as the line `id` — two Rangapooje lines would then collide.',
            'Forgetting to parse `amount` to a number, so totals concatenate strings (\'20\' + \'20\' = \'2020\').',
            'Not initialising the `devotee` object, causing a crash when a field input reads `line.devotee.name`.',
            'Storing the seva\'s full object in the line, so a later seva re-price silently changes old lines.',
          ],
          tryIt:
            'Click Rangapooje three times. You should get three separate cart lines, each with its own id. Log the cart and confirm none of the ids match.',
          takeaway:
            'A click builds a new immutable line with its own `id` and an empty `devotee`, appended with the `setCart(c => [...c, line])` updater form.',
        },
        {
          id: 'm5-t4',
          title: 'Capturing Devotee Details: Name, Gotra, Nakshatra',
          explain:
            'Add controlled inputs for the devotee\'s **name**, **gotra** and **nakshatra** — the details the priest needs to perform the sankalpa for that seva.',
          analogy:
            'When a devotee books a Rangapooje, the priest does not just light the lamp — he announces a **sankalpa**: \"for so-and-so, of such gotra, born under such nakshatra.\" So the counter must capture those three details, exactly the way the old paper slip had a line for *Hesaru* (name), *Gotra* and *Nakshatra*.',
          theory:
            'In React, an input you fully control is a **controlled input**: its `value` comes from state and its `onChange` writes back to state. For the devotee strip you bind three inputs to a `devotee` object: `name`, `gotra`, `nakshatra`. As the staff member types, each keystroke updates state and the input shows exactly what state holds — there is one source of truth.\n\nWhy does the temple actually need these? Because they feed the **sankalpa**, the priest\'s ritual dedication of the seva. Name is obvious; **gotra** is the devotee\'s ancestral lineage; **nakshatra** is their birth star. For sevas like Rangapooje and Mangalarathi the priest reads these aloud, so a blank gotra or nakshatra means an incomplete ritual. (Phone number is captured too, but that is for the temple\'s records, not the sankalpa.)\n\nThere is a design choice here: do you capture devotee details **once per receipt** (the same devotee for the whole slip) or **per line** (different sevas for different family members)? At Maranakatte the common case is one devotee per slip, so we keep the devotee fields in the top strip and copy them onto each line when saving — with the option to override on a specific line if a family member\'s seva differs.',
          whyItMatters:
            'The whole reason a devotee comes to the counter is to have a seva performed in their name — and the priest cannot perform the sankalpa without the gotra and nakshatra. Capturing these cleanly is not paperwork; it is the spiritual point of the transaction, so the fields must be obvious and fast to fill.',
          steps: [
            'Hold a `devotee` object in state: `{ name: \'\', gotra: \'\', nakshatra: \'\' }`.',
            'Render three controlled inputs, each with `value` from state and an `onChange` that writes back.',
            'Update immutably: `setDevotee(d => ({ ...d, name: e.target.value }))`.',
            'Label the fields in plain temple language (Name / Gotra / Nakshatra).',
            'Decide your model: devotee-per-receipt (default) vs devotee-per-line, and document it.',
            'Copy the devotee details onto each cart line when the receipt is saved.',
          ],
          code: `// src/renderer/components/DevoteeFields.jsx — controlled sankalpa inputs.
export default function DevoteeFields({ devotee, setDevotee }) {
  const set = (field) => (e) =>
    setDevotee((d) => ({ ...d, [field]: e.target.value }));

  return (
    <div className='devotee-fields'>
      <input placeholder='Name'      value={devotee.name}      onChange={set('name')} />
      <input placeholder='Gotra'     value={devotee.gotra}     onChange={set('gotra')} />
      <input placeholder='Nakshatra' value={devotee.nakshatra} onChange={set('nakshatra')} />
    </div>
  );
}`,
          pitfalls: [
            'Uncontrolled inputs (no `value` bound to state), so you cannot reset them after a save.',
            'Mutating the devotee object directly instead of spreading: `setDevotee(d => ({ ...d, ... }))`.',
            'Using one shared `onChange` that overwrites the whole object and wipes the other fields.',
            'Treating gotra/nakshatra as optional everywhere — they are required for sankalpa sevas.',
            'Capturing devotee details per line when the temple\'s real case is one devotee per slip (extra typing).',
            'Storing only a name and discovering later the priest needs gotra and nakshatra too.',
          ],
          tryIt:
            'Type a name, gotra and nakshatra, then check that all three stay independent — editing gotra must not clear the name. If it does, your `onChange` is overwriting the whole object.',
          takeaway:
            'Devotee name, gotra and nakshatra are controlled inputs feeding the priest\'s sankalpa — bind each to state and update with `{ ...d, [field]: value }`.',
        },
        {
          id: 'm5-t5',
          title: 'Quantity and Per-Line Amount',
          explain:
            'Let each cart line carry a **quantity** and compute its **line total** (`amount × qty`) so a devotee can book, say, three Mangalarathis in one line.',
          analogy:
            'Sometimes a family wants the **same seva several times** — three Mangalarathis for three children. Rather than clicking the button three times, the staff member types a quantity of 3 on one line. It is like the shopkeeper writing \"Mangalarathi x3\" on the slip instead of three separate lines.',
          theory:
            'A line total is simply `amount × qty`. The line\'s `amount` is fixed (the seva\'s price), but `qty` is a **controlled number input** the staff can change. When `qty` changes you do not recompute and store the total — you **derive** it on the fly, because derived values that you store always drift out of sync.\n\nUpdating one line\'s quantity means updating **only that line** in the cart array, by id. You `map` over the cart and, for the matching line, return a new object with the new `qty`; every other line is returned untouched. This is the immutable update pattern for arrays of objects, and it is the second-most-common cart operation after adding a line.\n\nGuard the input: quantity must be a **whole number of at least 1**. Empty, zero, negative or fractional quantities make no sense for a seva. Parse the input, clamp it, and if the field is mid-typing-empty, keep the line at 1 rather than crashing the total with `NaN`.',
          whyItMatters:
            'Quantity turns five clicks into one keystroke during the rush, and a correctly derived line total is the foundation the receipt total is built on. Get the immutable per-line update right and editing a busy cart stays bug-free; get it wrong and the wrong devotee\'s seva count changes.',
          steps: [
            'Add a `qty` number input to each cart line row, bound to `line.qty`.',
            'On change, parse and clamp the value to a whole number >= 1.',
            'Update the cart immutably, replacing only the matching line by `id`.',
            'Display the derived line total as `amount * qty`, never a stored field.',
            'Format the line total as rupees (covered next topic).',
            'Disable or hide the qty control for sevas that are always quantity 1, if any.',
          ],
          code: `// Update one line's quantity immutably, by id.
function setQty(lineId, raw) {
  const qty = Math.max(1, Math.floor(Number(raw) || 1));   // whole number >= 1
  setCart((c) =>
    c.map((line) =>
      line.id === lineId ? { ...line, qty } : line
    )
  );
}

// In the cart row JSX, the line total is DERIVED, never stored:
// <span>{'\\u20B9'}{(line.amount * line.qty).toFixed(2)}</span>
// <input type='number' min='1' value={line.qty}
//        onChange={(e) => setQty(line.id, e.target.value)} />`,
          pitfalls: [
            'Storing a `lineTotal` field that drifts out of sync with `amount` and `qty` — derive it instead.',
            'Allowing qty 0, negative, or fractional values, producing nonsense seva counts.',
            'An empty number input parsing to `NaN` and poisoning the receipt total.',
            'Mutating the line object in place inside `map` instead of returning a new object.',
            'Updating by array index instead of `id`, hitting the wrong line after add/remove.',
            'Forgetting `Math.floor`, so a typed `2.5` Mangalarathis slips through.',
          ],
          tryIt:
            'Add a Mangalarathi line and set its quantity to 3. The line total should read 3× the seva price, and the receipt total at the bottom should update with it.',
          takeaway:
            'Quantity is a clamped whole-number controlled input; the line total is derived as `amount × qty` and the line is updated immutably by its `id`.',
        },
      ],
    },
    {
      id: 'm5-s2',
      title: 'The ticket cart & totals',
      topics: [
        {
          id: 'm5-t6',
          title: 'Cart State: Add, Update, Remove Lines',
          explain:
            'Treat the cart as one array in state and give it three immutable operations — **add**, **update a line**, and **remove a line** — all keyed by the line `id`.',
          analogy:
            'The slip on the counter only ever does three things: a new line is **written**, an existing line is **corrected**, or a wrong line is **struck off**. Our cart is the same slip, and every change makes a clean new copy rather than scribbling over the old one.',
          theory:
            'All cart behaviour reduces to three array operations. **Add** appends a new line (`[...c, line]`). **Update** maps over the array and returns a changed copy of the one matching line, leaving the rest alone. **Remove** filters the array to drop the matching line (`c.filter(l => l.id !== id)`). Every one of these returns a **new array**, which is what tells React to re-render.\n\nKeeping all three operations in the parent that owns `cart` (here, `CounterScreen`) means there is a **single source of truth**. The child components — `SevaGrid`, `CartPanel`, each cart row — receive data and callbacks as props and never own cart state themselves. This \"lift state up\" pattern is what keeps the total, the line rows, and the save button always agreeing with each other.\n\nFor a cart this small (a single devotee\'s sevas, rarely more than a handful of lines), plain `useState` with these three functions is plenty. You do not need a reducer or a state library; reaching for one here is over-engineering. If the cart ever grew complex you could refactor to `useReducer`, but a fast temple counter does not.',
          whyItMatters:
            'A cart with clean add/update/remove by id is the backbone the total, validation and save all stand on. Centralising the operations in one owner prevents the classic bug where the displayed total and the list of lines disagree — which at a temple counter means a devotee charged the wrong amount.',
          steps: [
            'Hold the cart array in `CounterScreen` with `useState([])`.',
            'Write `addLine`, `updateLine(id, changes)`, and `removeLine(id)` as immutable functions.',
            'Implement `updateLine` with `map`, returning `{ ...line, ...changes }` for the match.',
            'Implement `removeLine` with `filter` on `line.id !== id`.',
            'Pass the cart and the three callbacks down to `CartPanel` as props.',
            'Resist adding a reducer or state library for this small, single-devotee cart.',
          ],
          code: `// The three immutable cart operations, owned by CounterScreen.
const [cart, setCart] = useState([]);

const addLine = (line) => setCart((c) => [...c, line]);

const updateLine = (id, changes) =>
  setCart((c) => c.map((l) => (l.id === id ? { ...l, ...changes } : l)));

const removeLine = (id) =>
  setCart((c) => c.filter((l) => l.id !== id));

// <CartPanel cart={cart} updateLine={updateLine} removeLine={removeLine} />`,
          pitfalls: [
            'Spreading cart state across child components instead of lifting it to one owner.',
            'Using `splice`/`push` (mutating) rather than `map`/`filter` (new array).',
            'Reaching for Redux or `useReducer` for a tiny single-devotee cart — over-engineering.',
            'Updating or removing by index, which breaks after other lines change.',
            '`updateLine` replacing the whole line object and dropping fields not in `changes`.',
            'Forgetting that `removeLine` must also be reachable from each row (a small × button).',
          ],
          tryIt:
            'Add three lines, remove the middle one, and change the quantity on another. Confirm only the intended line changes and the other two are untouched.',
          takeaway:
            'The cart is one array with three immutable operations — add (spread), update (map by id), remove (filter by id) — owned in one place.',
        },
        {
          id: 'm5-t7',
          title: 'Computing the Total With reduce and Formatting Rupees',
          explain:
            'Sum every line\'s `amount × qty` with `reduce` to get the receipt total, then format it as Indian rupees for display.',
          analogy:
            'At the bottom of the paper slip the staff member adds up every line to write the **grand total**. `reduce` is that adding-up: it walks down the slip line by line, carrying a running sum, and hands you the final figure.',
          theory:
            'A receipt total is a **derived value**: you never store it, you compute it from the cart whenever you render. `reduce` is the right tool — it starts at 0 and adds each line\'s `amount * qty`. Because it is derived, the total can never drift out of sync with the lines; change a quantity and the total updates on the next render automatically.\n\nMoney must be exact, and that starts in the database: amounts are stored as Postgres **`numeric`** (not floating point), which arrives in JavaScript as a string. You parse to a number for arithmetic, but be aware that JavaScript floating point can produce `0.1 + 0.2 = 0.30000000000000004`. For temple seva amounts (whole or half rupees) this rarely bites, but you should still round to two decimals when displaying, and for the value you save you round to paise (two decimals) deliberately.\n\nFor display, format with the browser\'s built-in **`Intl.NumberFormat(\'en-IN\')`**, which gives proper Indian digit grouping (₹1,25,000 not ₹125,000) and the ₹ symbol. Wrap it in a small `formatRupees` helper so every place in the app shows money the same way.',
          whyItMatters:
            'The total is the number the devotee pays, so it must always equal the lines exactly — deriving it with `reduce` guarantees that. Correct rupee formatting (Indian grouping and the ₹ symbol) makes the receipt look official and trustworthy at the temple counter.',
          steps: [
            'Compute `total` with `cart.reduce((sum, l) => sum + l.amount * l.qty, 0)`.',
            'Derive it inline on render; do not keep it in state.',
            'Round to two decimals for the saved value.',
            'Write a `formatRupees(n)` helper using `Intl.NumberFormat(\'en-IN\')`.',
            'Show the formatted total prominently at the bottom of the cart.',
            'Reuse the same helper anywhere money appears (line totals, receipts).',
          ],
          code: `// Derive the total with reduce; format with Intl for Indian rupees.
const total = cart.reduce((sum, l) => sum + l.amount * l.qty, 0);

function formatRupees(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n);
}

// In the cart footer JSX:
// <div className='cart-total'>Total: {formatRupees(total)}</div>
// formatRupees(125000) -> '\\u20B9' + '1,25,000.00'`,
          pitfalls: [
            'Storing the total in state, where it drifts the moment a line changes.',
            'Building the total string by hand instead of `Intl.NumberFormat(\'en-IN\')` (wrong grouping).',
            'Forgetting that `numeric` from Postgres is a string, so the sum concatenates instead of adds.',
            'Trusting raw floating point for money instead of rounding to two decimals.',
            'Initialising `reduce` without the `0` seed, so an empty cart returns `undefined`.',
            'Using `en-US` formatting and getting ₹125,000 instead of the Indian ₹1,25,000.',
          ],
          tryIt:
            'Put a few lines with different quantities in the cart and check the footer total equals the sum of the line totals, formatted with Indian grouping. Empty the cart — the total should read ₹0.00, not NaN.',
          takeaway:
            'Derive the total with `reduce` from `amount × qty`, never store it, and format every rupee value through one `Intl.NumberFormat(\'en-IN\')` helper.',
        },
        {
          id: 'm5-t8',
          title: 'The Cash / UPI Payment Toggle',
          explain:
            'Add a simple **cash vs UPI** toggle so the receipt records how the devotee paid.',
          analogy:
            'At the counter the devotee either hands over **cash** or scans the temple\'s **UPI** QR code. The toggle is the little tick the staff member makes on the slip to say which one — so the day\'s collection can later be split into \"cash in the box\" and \"money in the bank\".',
          theory:
            'Payment mode is a single piece of state with two values — `\'cash\'` or `\'upi\'`. Hold it as a string (or a small set of constants) and render two buttons or a segmented control where the selected one is highlighted. Clicking a mode sets the state; the receipt carries that value when saved.\n\nDefault sensibly: at a temple counter **cash** is still the common case during the evening rush, so start the toggle on `\'cash\'` and let the staff switch to `\'upi\'` only when needed. A good default removes a tap from the most common path, which over 500 receipts is real time saved.\n\nKeep the toggle **per receipt**, not per line — a devotee pays the whole slip one way. Store the chosen mode alongside the total when you save, because the temple\'s daily reconciliation depends on knowing the cash-versus-UPI split. Without it, the cash box and the bank statement can never be matched against the day\'s receipts.',
          whyItMatters:
            'Recording cash versus UPI is what lets the temple reconcile the day\'s collection — counting the cash box against the cash receipts and the bank against the UPI ones. A missing or wrong payment mode quietly breaks the end-of-day accounts the temple trustees rely on.',
          steps: [
            'Hold `paymentMode` in state, defaulting to `\'cash\'`.',
            'Render two buttons (Cash / UPI); highlight the selected one.',
            'On click, `setPaymentMode(\'cash\')` or `setPaymentMode(\'upi\')`.',
            'Keep the toggle at the receipt level, not per line.',
            'Include `paymentMode` in the payload sent to `api.receipts.create`.',
            'Reset to the default `\'cash\'` after each save.',
          ],
          code: `// A two-value payment toggle, defaulting to cash.
const [paymentMode, setPaymentMode] = useState('cash');

function PaymentToggle({ mode, setMode }) {
  return (
    <div className='pay-toggle'>
      {['cash', 'upi'].map((m) => (
        <button
          key={m}
          className={mode === m ? 'active' : ''}
          onClick={() => setMode(m)}
        >
          {m === 'cash' ? 'Cash' : 'UPI'}
        </button>
      ))}
    </div>
  );
}
// <PaymentToggle mode={paymentMode} setMode={setPaymentMode} />`,
          pitfalls: [
            'Free-typing the payment mode instead of constraining it to two known values.',
            'No default, forcing an extra tap on every single receipt.',
            'Putting the toggle per line, so a one-devotee slip asks the question many times.',
            'Forgetting to include `paymentMode` in the saved payload, breaking reconciliation.',
            'Not resetting the toggle after a save, so the next devotee inherits the last mode.',
            'Storing a boolean `isCash` that cannot grow to a third mode (e.g. card) later.',
          ],
          tryIt:
            'Toggle between Cash and UPI and confirm only one is highlighted at a time. Save a receipt and check the stored row records the mode you picked.',
          takeaway:
            'Payment mode is one receipt-level value (`cash`/`upi`) defaulting to cash, highlighted in the UI, saved with the receipt, and reset after each save.',
        },
        {
          id: 'm5-t9',
          title: 'A Keyboard-First Workflow for the Rangapooje Rush',
          explain:
            'Make the whole counter usable from the keyboard — number keys to pick sevas, **Enter** to commit, **Esc** to clear — so staff can push 500+ tickets without the mouse.',
          analogy:
            'A fast typist at a railway counter never lifts their hand to the mouse — their fingers stay on the keys and the slips fly out. During the evening **Rangapooje** at Maranakatte, with hundreds of devotees in line, the counter must work the same way: hands on the keyboard, eyes barely on the screen.',
          theory:
            'The mouse is the slowest part of any counter. A keyboard-first design assigns **number keys** (1, 2, 3…) to the most common sevas so a single key adds a line, uses **Enter** to commit the receipt, and **Esc** to clear the cart. You wire these with a keydown handler — either a `useEffect` that adds a `window` listener, or `onKeyDown` on the screen container.\n\nThe second half of keyboard-first is **focus management**. After a receipt saves, the cursor should land automatically back in the devotee **name** field so the staff member can start the next devotee by just typing. You do this with a `ref` on the input and calling `inputRef.current.focus()` after the save completes. Done right, the staff member never reaches for the mouse between devotees.\n\nBe careful that global shortcuts do not fire while the user is **typing in a field** — pressing `2` in the name field must type a \"2\", not add seva number two. So your keydown handler checks whether the event target is an input and ignores number-key shortcuts when it is, only acting on them when focus is on the grid or screen body.',
          whyItMatters:
            'During the Rangapooje rush of 500+ tickets, every mouse trip costs a second or two, and seconds become a long queue of waiting devotees. A keyboard-first workflow with auto-focus is the single biggest speed win in the whole app — it is what makes the counter keep pace with the evening crowd.',
          steps: [
            'Add a keydown handler on the screen (via `useEffect` + `window` listener or `onKeyDown`).',
            'Map number keys 1-9 to the first sevas in the grid, adding a line on press.',
            'Bind **Enter** to save the receipt and **Esc** to clear the cart.',
            'Ignore number-key shortcuts when the event target is a text input.',
            'Keep a `ref` on the devotee name input.',
            'After a save, call `nameRef.current.focus()` to ready the next devotee.',
          ],
          code: `// Keyboard-first: number keys add sevas, Enter saves, Esc clears.
useEffect(() => {
  function onKey(e) {
    const typing = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
    if (!typing && e.key >= '1' && e.key <= '9') {
      const seva = sevas[Number(e.key) - 1];
      if (seva) addLine(seva);
    }
    if (e.key === 'Enter') saveReceipt();
    if (e.key === 'Escape') setCart([]);
  }
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [sevas, cart]);

// After a successful save, return focus for the next devotee:
// nameRef.current?.focus();`,
          pitfalls: [
            'Number-key shortcuts firing while typing in the name/gotra fields.',
            'Forgetting to remove the `window` keydown listener on unmount (memory leak, double-fires).',
            'A stale closure: the handler captures an old `cart`; include the right deps or use refs.',
            'No auto-focus after save, so staff must click back into the name field every time.',
            'Binding Enter to save while an input has focus and is also submitting a form (double action).',
            'Hard-coding which seva each number maps to instead of using the grid order.',
          ],
          tryIt:
            'With the grid focused, press 1, 1, 2 and watch three lines appear. Then click into the name field and press 2 — it should type a \"2\", not add a seva.',
          takeaway:
            'Keyboard-first means number keys add sevas, Enter saves, Esc clears, shortcuts ignore typing, and focus returns to the name field after each save.',
        },
      ],
    },
    {
      id: 'm5-s3',
      title: 'Saving the ticket',
      topics: [
        {
          id: 'm5-t10',
          title: 'Submitting the Receipt Over IPC',
          explain:
            'Send the finished cart to the main process with `api.receipts.create(...)`, which writes to local Postgres and returns the saved receipt with its token number.',
          analogy:
            'The staff member at the counter (the **renderer**) cannot reach into the temple\'s record book themselves — that book lives in the back office (the **main process**). So they pass the slip through a hatch (the **IPC bridge**) to the clerk, who writes it in the book and hands back the official **token number**.',
          theory:
            'In this app the renderer (React) has **no database access at all** — that is the security model from earlier modules: Node and `pg` live in the **main process**, and the renderer reaches them only through a narrow `api` object exposed by the **preload** script via `contextBridge`. So saving a receipt is a call like `await api.receipts.create(payload)`, which sends an IPC message to a main-process handler that runs the SQL `INSERT` and returns the new row.\n\nThe **payload** is the data the cart already holds: the line items (seva id, qty, amount), the devotee (name, gotra, nakshatra, phone), the payment mode, and the computed total. You do **not** send the token number — the main process generates that (it owns the database and the day\'s counter, tying back to the token logic from Modules 3 and 4). The renderer asks, the main process decides.\n\nBecause IPC is **asynchronous**, `api.receipts.create` returns a Promise. You `await` it and you wrap it in `try/catch`: a local database can still fail (disk full, locked file), and the staff member needs a clear message rather than a silently lost receipt. On success you read `result.tokenNumber` from what the main process returns.',
          whyItMatters:
            'This call is where a devotee\'s seva becomes a permanent temple record. Going through IPC (not direct DB access in the renderer) is what keeps the app secure and the data layer in one place, and letting the main process mint the token number is what guarantees no two devotees ever get the same token.',
          steps: [
            'Build a payload: `{ lines, devotee, paymentMode, total }`.',
            'Call `const result = await api.receipts.create(payload)` inside a `try/catch`.',
            'Do not send a token number — the main process generates it.',
            'On success, read `result.tokenNumber` (and `result.id`) from the response.',
            'On error, show the staff a clear message and keep the cart intact for a retry.',
            'Confirm the preload exposes `api.receipts.create` over `contextBridge`.',
          ],
          code: `// Renderer asks the main process to save; gets back a token number.
async function saveReceipt() {
  const payload = {
    lines: cart.map((l) => ({ sevaId: l.sevaId, qty: l.qty, amount: l.amount })),
    devotee,                 // { name, gotra, nakshatra, phone }
    paymentMode,             // 'cash' | 'upi'
    total,                   // derived rupee total
  };
  try {
    const result = await api.receipts.create(payload);   // IPC -> main -> Postgres
    showToken(result.tokenNumber);                        // main minted this
    resetScreen();
  } catch (err) {
    showError('Could not save the receipt. Please try again.');
  }
}`,
          pitfalls: [
            'Trying to import `pg` or query the database directly in the renderer (it has no DB access).',
            'Sending a renderer-generated token number, risking duplicates across devotees.',
            'Not awaiting the Promise, so you reset the screen before the save actually finishes.',
            'No `try/catch`, so a local DB error loses the receipt silently.',
            'Sending the whole cart objects (with React-only fields) instead of a clean payload.',
            'Forgetting to expose `receipts.create` in the preload, so `api.receipts` is undefined.',
          ],
          tryIt:
            'Save a small receipt and log `result`. Confirm it comes back with a `tokenNumber` and an `id` that you did not send, proving the main process generated them.',
          takeaway:
            'Saving is `await api.receipts.create(payload)` over IPC; the renderer sends cart + devotee + payment, and the main process writes Postgres and mints the token number.',
        },
        {
          id: 'm5-t11',
          title: 'Showing Today\'s Token Number',
          explain:
            'Display the **token number** the main process returns, so the devotee can be called by it and the temple can track the day\'s receipts.',
          analogy:
            'After the slip goes into the record book, the clerk calls out \"**Token 142!**\" The number is how the devotee knows it is their turn for prasada or their booked seva, and how the temple counts how many sevas were done that evening.',
          theory:
            'A **token number** is the day\'s running count of receipts — it resets each morning and climbs through the evening Rangapooje. The main process owns it (it has the database and a query like `count of today\'s receipts + 1`, the logic introduced back in Modules 3 and 4), so the renderer simply **displays** what comes back; it never computes the number itself.\n\nWhen the save resolves, you take `result.tokenNumber` and show it big and clear — a large number the staff can read aloud and, ideally, that prints on the slip. Briefly flashing it on screen (a toast or a highlighted panel) confirms to the staff that the save succeeded and gives them the number to announce before the screen resets.\n\nKeep the token display **honest**: only show it after the save genuinely succeeds. Showing a number before the database confirms could announce a token for a receipt that failed to save, putting the on-screen count and the record book out of step — exactly the kind of mismatch the end-of-day reconciliation would later expose.',
          whyItMatters:
            'The token number is how a devotee is identified for the rest of their visit and how the temple counts the evening\'s sevas. Showing it only after a confirmed save keeps the spoken token, the printed slip, and the database in perfect agreement.',
          steps: [
            'Read `result.tokenNumber` from the resolved `api.receipts.create` response.',
            'Show it only after the save succeeds, never before.',
            'Display it large (a toast, banner, or highlighted panel) so staff can read it aloud.',
            'Optionally include it on the printed slip for the devotee.',
            'Keep token generation in the main process (resets daily) — the renderer just shows it.',
            'Clear the displayed token when the screen resets for the next devotee.',
          ],
          code: `// Show the token the main process returned, only after success.
const [token, setToken] = useState(null);

async function saveReceipt() {
  const result = await api.receipts.create(payload);
  setToken(result.tokenNumber);   // e.g. 142 — minted by main, daily reset
  resetScreen({ keepToken: true });
}

// JSX: flash the token big for the staff to call out.
// {token && <div className='token-banner'>Token {token}</div>}`,
          pitfalls: [
            'Computing the token in the renderer instead of trusting the main process.',
            'Showing the token before the save confirms, then announcing a failed receipt.',
            'A token display too small to read aloud across a busy counter.',
            'Not clearing the previous token, so the next devotee sees a stale number.',
            'Assuming tokens never reset — they restart each morning, so the count is per-day.',
            'Treating the token as a database primary key; it is a daily human-facing number, not the row `id`.',
          ],
          tryIt:
            'Save two receipts in a row and confirm the second token is exactly one more than the first. Restart the app the next day (or fake the date) and confirm the count starts over.',
          takeaway:
            'The token is a daily running number minted by the main process; the renderer only displays it big after a confirmed save and clears it on reset.',
        },
        {
          id: 'm5-t12',
          title: 'Resetting the Screen for the Next Devotee',
          explain:
            'After a save, **clear the cart and devotee fields** and return focus to the name input so the staff can start the next devotee instantly.',
          analogy:
            'The moment one slip is filed, the staff member tears off a fresh blank slip and is ready for the next person in line. The screen must do the same — wipe itself clean in an instant, with the pen already hovering over the name line.',
          theory:
            'Resetting is just setting state back to its empty starting values: `setCart([])`, `setDevotee({ name: \'\', gotra: \'\', nakshatra: \'\', phone: \'\' })`, and `setPaymentMode(\'cash\')`. Because the inputs are **controlled**, clearing the state clears the inputs automatically — there is nothing else to wipe.\n\nThe finishing touch is **focus**: immediately after resetting, call `nameRef.current.focus()` so the cursor lands in the name field. Combined with the keyboard-first workflow, this means the staff member finishes one devotee and is already typing the next name without touching the mouse. During the Rangapooje rush this single behaviour shaves a real chunk off each transaction.\n\nDecide what to **keep** versus clear. The cart, devotee and total clearly reset. The payment mode usually resets to the default `\'cash\'`. The just-shown token may linger briefly (as a banner) so the staff can still read it out, then fade. Be deliberate about each: an accidentally retained devotee name on the next slip is a subtle, embarrassing bug at a temple counter.',
          whyItMatters:
            'A clean, instant reset with auto-focus is what lets the counter keep a steady rhythm through hundreds of devotees. Leaving stale data on the screen risks charging the next devotee the wrong amount or filing the wrong name — errors that are very visible at a temple.',
          steps: [
            'Write a `resetScreen()` that clears cart, devotee and payment mode to defaults.',
            'Rely on controlled inputs clearing themselves when state empties.',
            'Call `nameRef.current.focus()` right after resetting.',
            'Decide whether to keep the token banner briefly or clear it immediately.',
            'Call `resetScreen()` only after a confirmed successful save.',
            'Double-check no devotee field carries over to the next slip.',
          ],
          code: `// Reset to blank starting state and ready the next devotee.
function resetScreen() {
  setCart([]);
  setDevotee({ name: '', gotra: '', nakshatra: '', phone: '' });
  setPaymentMode('cash');
  // Controlled inputs clear themselves when state empties.
  nameRef.current?.focus();   // cursor ready for the next name
}`,
          pitfalls: [
            'Forgetting to reset one field (e.g. phone), so it bleeds onto the next devotee.',
            'Resetting before the save confirms, losing the receipt if the save then fails.',
            'No auto-focus, forcing a mouse click into the name field every time.',
            'Trying to clear uncontrolled inputs by hand because they were never bound to state.',
            'Keeping the token banner forever, cluttering the next devotee\'s screen.',
            'Not resetting payment mode, so an unusual UPI sale sticks for the next cash devotee.',
          ],
          tryIt:
            'Save a receipt and watch the cart empty, the devotee fields clear, and the cursor jump back to the name field. Type immediately — you should not need the mouse.',
          takeaway:
            'Reset clears cart, devotee and payment to defaults (controlled inputs clear themselves) and refocuses the name field — but only after a confirmed save.',
        },
        {
          id: 'm5-t13',
          title: 'Validating the Receipt Before Saving',
          explain:
            'Block a save when the cart is **empty** or a **sankalpa seva is missing the devotee name**, and show the staff a clear, friendly reason.',
          analogy:
            'A careful clerk will not file a blank slip, and will not file a Rangapooje slip with no name on it — because the priest cannot perform a nameless sankalpa. The app should be that careful clerk, gently refusing to save until the slip makes sense.',
          theory:
            'Validation is a small function that runs **before** the IPC save and returns either \"ok\" or a reason to show. Two rules matter most at this counter. First, the **cart must not be empty** — there is nothing to charge. Second, **sankalpa sevas require a devotee name** (and ideally gotra and nakshatra), because the priest reads them aloud; a Rangapooje with no name is a ritual that cannot be performed.\n\nKeep validation **fast and forgiving**. It runs on the rush, so it should not nag about optional fields. Phone number is nice to have but not required to save. Nakshatra is needed for the sankalpa but the temple may choose to allow saving with a warning. Be explicit about which fields are hard-required (name for sankalpa sevas) versus soft (phone), and code exactly that policy.\n\nSurface the result well: if validation fails, **do not** call the save, show the message near the offending field or as a clear banner, and put focus on the field to fix. A good validation message says what is wrong and how to fix it (\"Add a devotee name for the Rangapooje\"), not a generic \"Invalid input\".',
          whyItMatters:
            'Validation stops two real temple problems: charging nothing on an empty cart, and filing a sankalpa seva the priest cannot actually perform because it has no name. Catching these before the save keeps the record book clean and the rituals correct.',
          steps: [
            'Write a `validate(cart, devotee)` returning `{ ok: true }` or `{ ok: false, message }`.',
            'Reject an empty cart with a clear message.',
            'Require a devotee name when any line is a sankalpa seva (e.g. Rangapooje, Mangalarathi).',
            'Decide and code the policy for gotra/nakshatra (hard-required vs warn).',
            'Call `validate` at the top of `saveReceipt` and bail out if not ok.',
            'Show the message near the field and move focus there.',
          ],
          code: `// Validate before the IPC save; return a friendly reason on failure.
function validate(cart, devotee) {
  if (cart.length === 0) {
    return { ok: false, message: 'Cart is empty — add a seva first.' };
  }
  const needsName = cart.some((l) => l.isSankalpa);   // e.g. Rangapooje, Mangalarathi
  if (needsName && !devotee.name.trim()) {
    return { ok: false, message: 'Add a devotee name for the sankalpa seva.' };
  }
  return { ok: true };
}

// At the top of saveReceipt:
// const check = validate(cart, devotee);
// if (!check.ok) { showError(check.message); nameRef.current?.focus(); return; }`,
          pitfalls: [
            'Letting an empty cart save, creating a zero-rupee receipt.',
            'Allowing a sankalpa seva with no name, so the priest cannot perform it.',
            'Generic messages (\"Invalid\") that do not tell the staff what to fix.',
            'Validating after the IPC call instead of before, wasting a round-trip.',
            'Making phone or every field hard-required and slowing the rush with nags.',
            'Not focusing the offending field, so the staff hunts for what is wrong.',
          ],
          tryIt:
            'Try to save with an empty cart — it should refuse with a clear message. Add a Rangapooje but no name and try again — it should ask for the devotee name and focus that field.',
          takeaway:
            'Validate before saving: block an empty cart and require a devotee name for sankalpa sevas, with a clear message and focus on the field to fix.',
        },
        {
          id: 'm5-t14',
          title: 'Guarding Against an Accidental Double-Submit',
          explain:
            'Use a **busy flag** so a second Enter or double-click during the save cannot file the same receipt twice.',
          analogy:
            'In the rush, an anxious staff member might hit Enter twice. Without a guard, the clerk would file **two identical slips** for one devotee — two tokens, double the money in the book. A busy flag is the clerk holding up a hand: \"I am already writing this one, wait.\"',
          theory:
            'A double-submit happens because IPC is asynchronous: between pressing Enter and the save resolving, there is a window where a second Enter or click fires `saveReceipt` again. The fix is a **busy flag** — a piece of state, say `saving`, that you set to `true` at the start of the save and back to `false` when it finishes.\n\nGuard the entry point: at the very top of `saveReceipt`, `if (saving) return;` — ignore the call if one is already in flight. Set `setSaving(true)` before the `await api.receipts.create(...)`, and reset it in a `finally` block so it clears whether the save succeeds or throws. Also **disable the Save button** while `saving` is true, so the UI visibly reflects that it is working.\n\nThis pairs with validation and reset: validate, set busy, save over IPC, show the token, reset, clear busy. Because the temple counter is offline and the local save is usually fast, the busy state may flash by — but in the one case where the disk is slow or the user is jittery, the guard is exactly what prevents a duplicate token and a money discrepancy in the day\'s accounts.',
          whyItMatters:
            'A duplicated receipt means a duplicated token and double money recorded for one devotee — a real error that surfaces at end-of-day reconciliation. A simple busy flag, costing a few lines, removes that whole class of bug from the busiest screen in the app.',
          steps: [
            'Add a `saving` boolean to state, starting `false`.',
            'At the top of `saveReceipt`, `if (saving) return;` to ignore re-entry.',
            'Set `setSaving(true)` before the IPC call.',
            'Wrap the call in `try/catch/finally` and reset `setSaving(false)` in `finally`.',
            'Disable the Save button (and Enter handler) while `saving` is true.',
            'Confirm a fast double Enter produces exactly one receipt.',
          ],
          code: `// Busy flag prevents a double-submit during the async save.
const [saving, setSaving] = useState(false);

async function saveReceipt() {
  if (saving) return;                       // already in flight — ignore
  const check = validate(cart, devotee);
  if (!check.ok) { showError(check.message); return; }

  setSaving(true);
  try {
    const result = await api.receipts.create(payload);
    setToken(result.tokenNumber);
    resetScreen();
  } catch (err) {
    showError('Could not save the receipt. Please try again.');
  } finally {
    setSaving(false);                       // clear whether it worked or threw
  }
}
// <button disabled={saving} onClick={saveReceipt}>Save</button>`,
          pitfalls: [
            'No busy flag, so a fast double Enter files two identical receipts.',
            'Setting `saving` true but resetting it only on success, leaving the button stuck after an error.',
            'Not disabling the Save button, so the UI invites a second click.',
            'Resetting `saving` outside a `finally`, so a thrown error never clears it.',
            'Guarding the button but not the Enter-key path, leaving one route open.',
            'Relying on the local save being \"too fast to double-click\" instead of guarding properly.',
          ],
          tryIt:
            'Add a small artificial delay in the main-process handler, then mash Enter twice quickly. Confirm only one receipt and one token are created, and the Save button greys out while saving.',
          takeaway:
            'A `saving` flag — checked at entry, set before the IPC call, cleared in `finally`, and wired to a disabled button — stops accidental double-submits cold.',
        },
        {
          id: 'm5-t15',
          title: 'Tying It Together: The Full Save Flow',
          explain:
            'Assemble validate → guard → save over IPC → show token → reset into one clear `saveReceipt` so the whole counter cycle is one readable function.',
          analogy:
            'A practised clerk has one smooth routine for every devotee: check the slip, make sure they are not already mid-writing, write it in the book, call the token, tear off a fresh slip. Our `saveReceipt` is that routine written down once, in order.',
          theory:
            'Everything in this module meets in one function. The order matters: **validate** first (cheap, no round-trip), then the **busy guard**, then **set busy**, then the **IPC save**, then on success **show the token** and **reset**, with the busy flag cleared in `finally`. Reading the function top to bottom should tell the whole story of a counter transaction.\n\nKeeping this logic in the screen component (or a small `useCounter` hook) — rather than scattered across child components — means there is one place to read, debug and change the flow. The children stay simple: the grid reports clicks, the cart rows report edits, the Save button calls `saveReceipt`. The orchestration lives in one owner.\n\nThis is also where the **offline, local** nature of the app pays off: there is no network latency, no auth token to refresh, no retry-with-backoff. The save is a fast local Postgres write over IPC, so the cycle — click sevas, type name, Enter — can repeat hundreds of times an evening with almost no waiting. The whole module exists to make that one loop fast, correct, and hard to get wrong.',
          whyItMatters:
            'A single, ordered `saveReceipt` is what makes the counter both fast and trustworthy: validation protects the data, the guard protects against duplicates, the token confirms success, and the reset readies the next devotee — all in one place you can reason about.',
          steps: [
            'Order the flow: validate, guard, set busy, save, show token, reset, clear busy.',
            'Put `saveReceipt` in the screen component or a `useCounter` hook (one owner).',
            'Keep child components dumb — they call up to `saveReceipt`, they do not orchestrate.',
            'Wire Enter and the Save button to the same `saveReceipt`.',
            'Use `try/catch/finally` so errors are shown and the busy flag always clears.',
            'Walk the whole cycle once by hand to confirm it reads top-to-bottom clearly.',
          ],
          code: `// The full counter cycle, in order, in one place.
async function saveReceipt() {
  if (saving) return;                                   // 1. guard
  const check = validate(cart, devotee);                // 2. validate
  if (!check.ok) { showError(check.message); return; }

  setSaving(true);                                       // 3. busy
  try {
    const result = await api.receipts.create({          // 4. save over IPC
      lines: cart.map((l) => ({ sevaId: l.sevaId, qty: l.qty, amount: l.amount })),
      devotee, paymentMode, total,
    });
    setToken(result.tokenNumber);                        // 5. show token
    resetScreen();                                       // 6. reset for next devotee
  } catch (err) {
    showError('Could not save the receipt. Please try again.');
  } finally {
    setSaving(false);                                    // 7. always clear busy
  }
}`,
          pitfalls: [
            'Validating after the save instead of before, wasting an IPC round-trip on bad data.',
            'Scattering the steps across child components so no one place tells the whole story.',
            'Skipping the busy guard inside the assembled flow, re-opening the double-submit bug.',
            'Resetting before `setToken`, so the staff never sees the token to call out.',
            'Omitting `finally`, leaving the screen stuck \"saving\" after an error.',
            'Wiring Enter and the Save button to different code paths that drift apart.',
          ],
          tryIt:
            'Run the full loop ten times: pick sevas with number keys, type a name, press Enter. You should be able to do all ten without touching the mouse, each ending in a fresh screen and a new token.',
          takeaway:
            'The whole counter is one ordered `saveReceipt` — guard, validate, busy, IPC save, token, reset, clear — owned in one place, with dumb children calling up to it.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm5-p1',
      type: 'Project',
      title: 'Seva Grid + Ticket Cart',
      domain: 'Temple counter operations / Electron + React + local PostgreSQL',
      duration: '4.5 hours',
      description:
        'Build the counter screen for Maranakatte Seva: a clickable seva grid drawn from the local database that adds lines to a ticket cart, captures devotee name / gotra / nakshatra, supports per-line quantity, offers a cash/UPI toggle, and shows a live rupee total computed with reduce — all keyboard-friendly for the Rangapooje rush.',
      tools: ['Electron', 'React', 'Vite', 'PostgreSQL (pg)', 'contextBridge / IPC'],
      blueprint: {
        overview:
          'Stand up the three-zone counter screen — seva grid, devotee fields, ticket cart — with the cart state owned in one place and exposing immutable add / update / remove operations, a derived rupee total, a cash/UPI toggle, and number-key shortcuts so staff can work the evening rush from the keyboard.',
        functionalRequirements: [
          '**Seva grid from data.** Big tappable buttons drawn by mapping the seva list loaded once over IPC; a new database seva appears with no code change.',
          '**Add to cart.** Clicking a seva appends an immutable line (unique id, sevaId, name, amount, qty 1, empty devotee).',
          '**Devotee fields.** Controlled name / gotra / nakshatra inputs feeding the sankalpa, plus phone for records.',
          '**Quantity + line total.** A clamped whole-number qty per line with a derived `amount × qty` line total.',
          '**Live total + payment.** A reduce-based rupee total formatted with `Intl.NumberFormat(\'en-IN\')` and a cash/UPI toggle defaulting to cash.',
          '**Keyboard-first.** Number keys add the first sevas, with shortcuts ignored while typing in a field.',
        ],
        technicalImplementation: [
          '**Components.** `CounterScreen` owns cart state; `SevaGrid`, `DevoteeFields`, `CartPanel` are dumb children taking props.',
          '**Immutable cart.** `addLine` (spread), `updateLine` (map by id), `removeLine` (filter by id); never mutate the array.',
          '**Derived totals.** Line total and receipt total computed on render with `reduce`; never stored in state.',
          '**Rupee formatting.** One `formatRupees` helper using `Intl.NumberFormat(\'en-IN\', { style:\'currency\', currency:\'INR\' })`.',
          '**Seva load.** `api.sevas.list()` over IPC in a `useEffect` with an empty dependency array (loads once).',
          '**Keyboard.** A `window` keydown listener mapping 1-9 to sevas, ignoring events whose target is an INPUT.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Counter layout + seva grid',
            outcome: 'A three-zone screen with a data-driven seva grid.',
            prompt:
              'In an Electron + React (Vite) renderer, create a CounterScreen component with a CSS-grid layout: a wide left column for a SevaGrid and a narrower right column for devotee fields and a cart. Load the seva list once with api.sevas.list() in a useEffect with an empty dependency array and hold it in state. Build SevaGrid({ sevas, onPick }) that maps the sevas to large buttons (name + rupee amount), using seva.id as the React key, and calls onPick(seva) on click. Render an empty state when there are no sevas.',
          },
          {
            step: 2,
            label: 'Cart state + add/update/remove',
            outcome: 'A cart array with immutable line operations.',
            prompt:
              'In CounterScreen hold a cart array with useState([]). Add addLine(seva) that appends an immutable line { id: crypto.randomUUID(), sevaId, name, amount: Number(seva.amount), qty: 1, devotee: { name:\'\', gotra:\'\', nakshatra:\'\' } } via setCart(c => [...c, line]). Add updateLine(id, changes) using map (return { ...l, ...changes } for the match) and removeLine(id) using filter. Build a CartPanel that renders each line with a remove button and wire onPick to addLine.',
          },
          {
            step: 3,
            label: 'Devotee fields + quantity + total + payment',
            outcome: 'Devotee capture, per-line qty, a live rupee total and a cash/UPI toggle.',
            prompt:
              'Add a DevoteeFields component with controlled name / gotra / nakshatra inputs updating a devotee object immutably with setDevotee(d => ({ ...d, [field]: value })). In each cart row add a number input for qty, clamped to a whole number >= 1, updating the line by id, and show a derived line total of amount * qty. Compute the receipt total with cart.reduce and format it with a formatRupees helper using Intl.NumberFormat(\'en-IN\', { style:\'currency\', currency:\'INR\' }). Add a cash/UPI PaymentToggle defaulting to cash. Add a window keydown listener mapping number keys 1-9 to the first sevas, ignoring events whose target is an INPUT.',
          },
        ],
        deliverable:
          'A working counter screen: a data-driven seva grid that adds immutable cart lines, controlled devotee fields, per-line quantity with derived totals, a cash/UPI toggle, a live Indian-formatted rupee total, and number-key shortcuts for the rush.',
      },
    },
    {
      id: 'm5-p2',
      type: 'Project',
      title: 'Save a Receipt End-to-End',
      domain: 'Temple counter operations / Electron + React + local PostgreSQL',
      duration: '4.5 hours',
      description:
        'Wire the cart\'s Save button to api.receipts.create over IPC: validate the receipt, guard against a double-submit with a busy flag, send the payload to the main process, display the returned token number, and reset the screen with focus back on the name field so the next devotee can be served instantly.',
      tools: ['Electron', 'React', 'Vite', 'PostgreSQL (pg)', 'contextBridge / IPC'],
      blueprint: {
        overview:
          'Complete the counter cycle by building one ordered saveReceipt function — validate, busy-guard, save over IPC, show the token, reset — that turns a cart into a permanent temple record and readies the screen for the next devotee, all from the keyboard.',
        functionalRequirements: [
          '**Validation.** Block an empty cart and require a devotee name for sankalpa sevas, with a clear message and focus on the field to fix.',
          '**Double-submit guard.** A `saving` busy flag ignores re-entry and disables the Save button while a save is in flight.',
          '**IPC save.** A clean payload (lines, devotee, paymentMode, total) sent via `api.receipts.create`; the main process writes Postgres.',
          '**Token display.** Show the main-process-minted `tokenNumber` only after a confirmed save, large enough to read aloud.',
          '**Instant reset.** Clear cart, devotee and payment to defaults and refocus the name field after success.',
          '**Keyboard finish.** Enter triggers the same saveReceipt as the Save button, with focus returning automatically.',
        ],
        technicalImplementation: [
          '**Order.** saveReceipt runs guard → validate → setSaving(true) → await save → setToken → resetScreen, clearing saving in `finally`.',
          '**Payload.** Map cart lines to `{ sevaId, qty, amount }` and include devotee, paymentMode and the derived total; do not send a token.',
          '**Error handling.** `try/catch/finally`; on error show a clear message and keep the cart for a retry.',
          '**Focus management.** A `ref` on the name input; call `nameRef.current.focus()` inside resetScreen.',
          '**Single owner.** Keep saveReceipt in CounterScreen (or a useCounter hook); children call up to it.',
          '**Preload contract.** `api.receipts.create` exposed via contextBridge in preload; renderer never touches `pg`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Validation + busy guard',
            outcome: 'Bad or duplicate saves are blocked before any IPC call.',
            prompt:
              'Add a validate(cart, devotee) function returning { ok:false, message } for an empty cart or a sankalpa seva (line.isSankalpa true) with no trimmed devotee name, otherwise { ok:true }. Add a saving boolean in state. Write saveReceipt() that first does `if (saving) return;`, then runs validate and shows the message (and focuses the name field) on failure, returning early. Disable the Save button while saving is true.',
          },
          {
            step: 2,
            label: 'IPC save + token',
            outcome: 'A valid cart is saved and the returned token is shown.',
            prompt:
              'In saveReceipt, after validation, setSaving(true) and in a try block call const result = await api.receipts.create({ lines: cart.map(l => ({ sevaId: l.sevaId, qty: l.qty, amount: l.amount })), devotee, paymentMode, total }). Do not send a token number. On success store result.tokenNumber in state and render it in a large token banner. Catch errors and show a clear retry message. Clear saving in a finally block. Confirm the preload exposes api.receipts.create via contextBridge.',
          },
          {
            step: 3,
            label: 'Reset + keyboard finish',
            outcome: 'The screen clears and refocuses for the next devotee, Enter-driven.',
            prompt:
              'Add resetScreen() that does setCart([]), setDevotee({ name:\'\', gotra:\'\', nakshatra:\'\', phone:\'\' }), setPaymentMode(\'cash\') and nameRef.current?.focus(), and call it after a successful save. Add a ref to the name input. Wire the Enter key (in the existing keydown handler) to call the same saveReceipt as the Save button. Verify the full loop runs from the keyboard: number keys add sevas, type a name, press Enter, see a token, and land back in a cleared name field.',
          },
        ],
        deliverable:
          'An end-to-end save: validation and a busy guard, an IPC call to api.receipts.create, a displayed token number from the main process, and an instant reset with focus on the name field — the complete counter cycle, keyboard-driven.',
      },
    },
  ],
  quiz: [
    {
      id: 'm5-q1',
      q: 'Why is the seva grid drawn by mapping over a list loaded from the database instead of hard-coding the buttons in JSX?',
      options: [
        'Because React cannot render hard-coded buttons',
        'So the temple can add, rename or re-price a seva by editing data — no code change or new build',
        'Because the database is faster than JSX',
        'So the buttons animate automatically',
      ],
      answer: 1,
    },
    {
      id: 'm5-q2',
      q: 'When a seva button is clicked to add a line to the cart, what is the correct React way to update the cart array?',
      options: [
        'cart.push(line) so the change is immediate',
        'setCart(c => [...c, line]) — a new array via the updater form',
        'cart = [...cart, line] then re-render manually',
        'Store the line in a global variable',
      ],
      answer: 1,
    },
    {
      id: 'm5-q3',
      q: 'Why does the counter capture the devotee\'s gotra and nakshatra, not just the name?',
      options: [
        'They are required by Electron',
        'The priest needs them to perform the sankalpa (ritual dedication) for the seva',
        'They are used as the database primary key',
        'They make the receipt print faster',
      ],
      answer: 1,
    },
    {
      id: 'm5-q4',
      q: 'How should the receipt total be obtained for display?',
      options: [
        'Stored in state and updated by hand whenever a line changes',
        'Derived on render with cart.reduce((sum, l) => sum + l.amount * l.qty, 0)',
        'Fetched from the cloud each time',
        'Calculated only once when the cart is first created',
      ],
      answer: 1,
    },
    {
      id: 'm5-q5',
      q: 'In this app, how does the renderer save a receipt to PostgreSQL?',
      options: [
        'It imports pg and runs the INSERT directly in React',
        'It calls api.receipts.create over IPC; the main process runs the SQL and mints the token',
        'It writes a file the database watches',
        'It posts to a cloud API endpoint',
      ],
      answer: 1,
    },
    {
      id: 'm5-q6',
      q: 'What prevents a jittery double Enter during the rush from filing the same receipt twice?',
      options: [
        'A `saving` busy flag checked at entry, set before the IPC call and cleared in finally, with the Save button disabled',
        'Saving the receipt twice and deleting one copy',
        'A 5-second delay before every save',
        'Nothing — local saves are too fast to double-submit',
      ],
      answer: 0,
    },
  ],
};
