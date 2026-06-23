// Module M6 — Receipts, Tokens & Printing (Maranakatte Seva)
// Offline desktop app: Electron + React + Vite + LOCAL PostgreSQL (pg).
// Teaches printing seva receipts and tokens from the counter app — designing the
// printable receipt (temple header, Kannada + English, devotee gotra/nakshatra,
// token, rupee total), printing from Electron via webContents.print and a hidden
// window, printToPDF for an offline copy, and reprinting a past token by number.

export const m6 = {
  id: 'm6',
  title: 'Receipts, Tokens & Printing',
  hours: 8,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Print real seva receipts and tokens from the counter app at Shri Brahmalingeshwara Temple. Build a print-only receipt component with the temple header, Kannada and English text, devotee gotra and nakshatra, token number and the rupee total; print silently from Electron through a hidden window; save a PDF copy under userData for the offline record; and reprint any past token by number.',
  sections: [
    {
      id: 'm6-s1',
      title: 'Building the printable receipt',
      topics: [
        {
          id: 'm6-t1',
          title: 'What a seva receipt must show',
          explain:
            'Before drawing anything, list every line the printed receipt needs: the temple header, the seva booked, the devotee details, the token number, the rupee amount and the date and time.',
          analogy:
            'Think of the old carbon-copy receipt book the counter clerk at Maranakatte used to tear a slip from. Each slip had the temple name printed at the top, a blank for the devotee name and gotra, the seva, the amount and a serial number. Our receipt is the same slip — only now the app fills the blanks and a thermal printer tears it for us.',
          theory:
            'A **seva receipt** is the small slip the devotee carries away after booking. It is both a proof of payment and the token they show at the seva counter. So it must carry, top to bottom: the **temple header** (`Shri Brahmalingeshwara Temple, Maranakatte`), the **seva line(s)** (`Rangapooje`, `Mangalarathi`, `Hannikaayi`...), the **devotee details** (`name`, `gotra`, `nakshatra`, sometimes `phone`), the **token number**, the **rupee amount** and the **date and time**.\n\nThink of the receipt as a small data object first, HTML second. Your app already has the booking row from the database — `name`, `gotra`, `nakshatra`, `seva`, `amount`, `token`, `createdAt`. The receipt is just that object laid out on paper. Keep a single `buildReceiptModel(booking)` function that shapes the raw row into exactly the fields the template prints, so the template never has to think.\n\nMoney is **rupees** stored as a Postgres `numeric` and read into JS as a string like `\'250.00\'`. Format it for display with a `₹` prefix, but never do math on the printed string — the math was already done when the booking was saved.',
          whyItMatters:
            'During the evening Rangapooje rush, 500+ slips print in a couple of hours. If one required field is missing — say the token number — a devotee cannot claim their seva and the queue stalls. Nailing the field list first means every later printing trick has solid, complete data to render.',
          steps: [
            'List the fixed header fields (temple name, place) that print on every receipt.',
            'List the per-booking fields: seva, devotee name, gotra, nakshatra, token, amount, date/time.',
            'Write a `buildReceiptModel(booking)` helper that returns just those fields.',
            'Format the rupee amount once, here, as a ₹ string for display.',
            'Format the token as a zero-padded string (e.g. `R-0042`) so it sorts and reads well.',
            'Pass the finished model — never the raw DB row — into the receipt component.',
          ],
          code: `// receipt/buildReceiptModel.js — shape a DB booking row into receipt fields.\nfunction formatRupees(value) {\n  // value comes from Postgres numeric as a string like '250.00'\n  const n = Number(value);\n  return '\\u20b9' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });\n}\n\nexport function buildReceiptModel(booking) {\n  return {\n    templeName: 'Shri Brahmalingeshwara Temple',\n    templePlace: 'Maranakatte',\n    token: 'R-' + String(booking.token).padStart(4, '0'),\n    sevaName: booking.seva,            // e.g. 'Rangapooje'\n    devoteeName: booking.name,\n    gotra: booking.gotra,\n    nakshatra: booking.nakshatra,\n    phone: booking.phone || '',\n    amount: formatRupees(booking.amount),\n    dateTime: new Date(booking.createdAt).toLocaleString('en-IN'),\n  };\n}`,
          pitfalls: [
            'Doing rupee math on the formatted string — keep the number and the display string separate.',
            'Forgetting the token number, the one field the devotee actually needs at the counter.',
            'Reading `numeric` as a JS float and printing `249.99999` instead of `250.00`.',
            'Hard-coding the temple name in many places instead of one model field.',
            'Letting an empty gotra/nakshatra print as the word `undefined`.',
            'Mixing display formatting into the React template, so two screens format rupees differently.',
          ],
          tryIt:
            'Write `buildReceiptModel` and log it for a fake booking `{ token: 42, seva: \'Rangapooje\', name: \'Ramesh\', gotra: \'Kashyapa\', nakshatra: \'Ashwini\', amount: \'250.00\', createdAt: Date.now() }`. Confirm the token reads `R-0042` and the amount reads `₹250.00`.',
          takeaway:
            'A receipt is a small, complete data object first and HTML second — shape it once with a helper so the template only has to lay it out.',
        },
        {
          id: 'm6-t2',
          title: 'A print-only React receipt component',
          explain:
            'Build a dedicated `<Receipt model={...}/>` component whose only job is to lay out the slip — never a button, never a network call, just the printable markup.',
          analogy:
            'The counter has two things: the busy ledger screen the clerk types into, and a clean rubber-stamp slip that goes to the devotee. The `Receipt` component is the stamp — it shows nothing but the slip, so what prints is exactly what the devotee should hold.',
          theory:
            'In React, keep the **printable receipt separate** from your normal UI. A dedicated `Receipt` component takes the receipt model as a prop and renders only the slip — header, seva lines, devotee block, token, amount, footer. It has **no buttons, no IPC, no state** beyond its props. This separation matters because the print pipeline will load *just this* markup into a hidden window.\n\nLay it out as simple, vertical HTML — a `<div>` per logical block. Avoid flex grids and fancy layout; thermal-roll rendering is unforgiving. Give the root a class like `receipt` so your print CSS (next topic) can target it precisely.\n\nFor the **token**, make it big and bold — it is the one thing the seva-counter volunteer reads at a glance during the rush. The temple header sits at the top centred, the devotee block in the middle, the amount near the bottom, and a small `Sri Gurubhyo Namaha` style footer line if the temple wants it.',
          whyItMatters:
            'When the print component is pure and prop-driven, the same markup renders identically on screen (for preview) and inside the hidden print window. No surprises between what the clerk previews and what the printer tears.',
          steps: [
            'Create `components/Receipt.jsx` taking a single `model` prop.',
            'Render the temple header (name + place) centred at the top.',
            'Render the token number large and bold below the header.',
            'Render the seva line and the devotee block (name, gotra, nakshatra).',
            'Render the amount and the date/time near the bottom.',
            'Give the root element a `receipt` class for the print stylesheet to target.',
          ],
          code: `// components/Receipt.jsx — pure, prop-driven, print-only markup.\nexport default function Receipt({ model }) {\n  return (\n    <div className='receipt'>\n      <div className='receipt-header'>\n        <div className='temple-name'>{model.templeName}</div>\n        <div className='temple-place'>{model.templePlace}</div>\n      </div>\n\n      <div className='receipt-token'>Token: {model.token}</div>\n\n      <div className='receipt-seva'>{model.sevaName}</div>\n\n      <div className='receipt-devotee'>\n        <div>{model.devoteeName}</div>\n        <div>Gotra: {model.gotra}</div>\n        <div>Nakshatra: {model.nakshatra}</div>\n      </div>\n\n      <div className='receipt-amount'>{model.amount}</div>\n      <div className='receipt-time'>{model.dateTime}</div>\n    </div>\n  );\n}`,
          pitfalls: [
            'Putting a Print button inside `Receipt` — keep actions in the parent screen, not the slip.',
            'Reaching for `fetch`/IPC inside the component instead of receiving a ready model prop.',
            'Using complex flex/grid layout that thermal printers render unevenly.',
            'Forgetting the `receipt` root class, leaving print CSS with nothing to target.',
            'Making the token small — the counter volunteer must read it instantly.',
            'Letting global app CSS (colours, shadows) leak into the slip and waste thermal ink.',
          ],
          tryIt:
            'Render `<Receipt model={buildReceiptModel(fakeBooking)} />` on a normal page. Check every field shows and the token is the most prominent line. Resist adding any button to the component itself.',
          takeaway:
            'A pure, prop-driven print component means the slip you preview is byte-for-byte the slip that prints.',
        },
        {
          id: 'm6-t3',
          title: 'Showing Kannada alongside English',
          explain:
            'Render the temple name and key labels in Kannada as well as English, which means choosing a font that has Kannada glyphs and serving it offline.',
          analogy:
            'The stone board at the Maranakatte temple gate carries the name in Kannada first, English below. Many devotees read the Kannada line and skip the English. Our slip should honour the same order — Kannada for the local devotee, English so anyone can read it.',
          theory:
            'Kannada is a script with its own Unicode block. Browsers (and Electron, which is Chromium) render Kannada **only if a font with Kannada glyphs is available**. The safe choice for an **offline** app is to bundle a font like **Noto Sans Kannada** as a local file and load it via `@font-face` — never a Google Fonts URL, because the counter machine has no internet.\n\nStore the Kannada strings as normal UTF-8 in your JS, e.g. `शरी ब्रह्मलिंगेश्वर` style strings (use the real Kannada text in your file). Keep a tiny translation map so the template can show `kn` and `en` side by side — `templeName.kn` and `templeName.en`. This mirrors the course translations file pattern.\n\nThe practical rule: **bundle the font, reference it locally, and set the receipt root to use it** with an English fallback. Then both scripts render even though the machine is fully offline.',
          whyItMatters:
            'Get the font wrong and Kannada prints as empty boxes (tofu) — the slip looks broken and devotees lose trust. Bundling the font offline guarantees the temple name renders correctly on every machine, internet or not.',
          steps: [
            'Download a Kannada-capable font file (e.g. NotoSansKannada) into `src/assets/fonts/`.',
            'Declare it with `@font-face` using a local `url()`, not a web URL.',
            'Set the receipt root `font-family` to that font with a system fallback.',
            'Keep Kannada + English strings in a small map (`{ kn, en }`) per label.',
            'Render the Kannada line first, the English line beneath, like the temple gate board.',
            'Print a test slip and confirm no empty boxes appear where Kannada should be.',
          ],
          code: `/* receipt-fonts.css — bundle the Kannada font for OFFLINE use. */\n@font-face {\n  font-family: 'Noto Sans Kannada';\n  /* local file shipped inside the app — no internet needed */\n  src: url('../assets/fonts/NotoSansKannada-Regular.ttf') format('truetype');\n  font-weight: normal;\n}\n\n.receipt {\n  /* Kannada font first, English/system fallback after */\n  font-family: 'Noto Sans Kannada', 'Segoe UI', sans-serif;\n}\n\n/* labels.js — keep both scripts together */\nexport const labels = {\n  templeName: { kn: '\\u0936\\u094d\\u0930\\u0940 \\u0c2c\\u0c4d...', en: 'Shri Brahmalingeshwara Temple' },\n  gotra: { kn: '\\u0c97\\u0c4b\\u0c24\\u0c4d\\u0c30', en: 'Gotra' },\n};`,
          pitfalls: [
            'Loading the font from a Google Fonts URL — it fails on the offline counter machine.',
            'Forgetting to ship the .ttf inside the packaged app, so Kannada turns into boxes.',
            'Saving the JS file in a non-UTF-8 encoding and mangling the Kannada characters.',
            'Setting only an English font, so Kannada falls back to tofu (empty rectangles).',
            'Assuming the thermal printer has Kannada built in — it renders what Chromium rasterises.',
            'Hard-coding Kannada strings in many files instead of one labels map.',
          ],
          tryIt:
            'Add `@font-face` for a bundled Kannada font, then render the temple name in Kannada above its English line. Disconnect the internet and reload — the Kannada must still render perfectly.',
          takeaway:
            'For an offline temple app, bundle the Kannada font locally and load it with @font-face — never rely on a web font URL.',
        },
        {
          id: 'm6-t4',
          title: 'Designing for a narrow thermal roll',
          explain:
            'A thermal roll is only 58mm or 80mm wide, so the receipt layout must be a single narrow column with print CSS that sets the right paper width.',
          analogy:
            'A thermal slip is as narrow as a temple prasad packet wrapper — tall and thin. You cannot lay things out side by side; everything stacks down the strip, just like writing on a long thin palm-leaf.',
          theory:
            'Thermal counter printers use a continuous roll, commonly **80mm wide** (printable area ~72mm) or **58mm** (printable ~48mm). There is **no fixed page height** — the printer cuts after the content. So you design a **single narrow column**, centre the header, and let everything flow downward.\n\nControl this with **print CSS**. Use an `@page` rule to set the paper width and tiny margins, set the `.receipt` width to the roll width, use a readable monospace-ish font size (about `12px`–`14px`), and avoid anything wider than the roll. A `@media print` block keeps these rules from affecting the on-screen preview.\n\nA second target is the **A5 sheet** for temples that print on a small laser/inkjet instead of thermal. Same component, different `@page size`. Keep both as separate CSS files (`thermal-80.css`, `a5.css`) and load the right one based on a setting, so the layout adapts without touching the component.',
          whyItMatters:
            'If the layout is wider than the roll, text gets clipped at the edge and the token or amount can be cut off — unusable at the counter. Matching the CSS to the exact roll width means clean, complete slips every time.',
          steps: [
            'Decide the roll width in settings: `58mm` or `80mm` (or `A5`).',
            'Add an `@page` rule with that `size` and small (`2mm`) margins.',
            'Set `.receipt { width: 72mm }` for an 80mm roll (printable area).',
            'Use a single-column, centred layout — no side-by-side blocks.',
            'Wrap print rules in `@media print` so the screen preview is unaffected.',
            'Keep `thermal-80.css`, `thermal-58.css`, `a5.css` and load by setting.',
          ],
          code: `/* thermal-80.css — print CSS for an 80mm thermal roll. */\n@media print {\n  @page {\n    size: 80mm auto;   /* width fixed, height grows with content */\n    margin: 2mm;\n  }\n  body { margin: 0; }\n  .receipt {\n    width: 72mm;        /* printable area inside the 80mm roll */\n    font-size: 12px;\n    text-align: center;\n  }\n  .receipt-token { font-size: 18px; font-weight: bold; }\n  .receipt-devotee { text-align: left; }\n}`,
          pitfalls: [
            'Setting `.receipt` to the full 80mm — the printable area is smaller, so text clips.',
            'Designing two-column rows that do not fit a 58mm roll.',
            'Forgetting `@media print`, so the narrow width also squashes the on-screen UI.',
            'Using huge margins that waste roll and push content off the strip.',
            'Hard-coding `80mm` when the temple actually bought a 58mm printer.',
            'Relying on a fixed page height — thermal rolls have no fixed height.',
          ],
          tryIt:
            'Add `thermal-80.css`, set `.receipt` to `72mm`, and use the browser print preview (Ctrl+P) with paper set to a narrow custom size. Confirm the token and amount sit fully inside the strip with nothing clipped.',
          takeaway:
            'Design the slip as one narrow centred column and let print CSS set the exact roll width — never assume a normal page.',
        },
        {
          id: 'm6-t5',
          title: 'A standalone receipt HTML page',
          explain:
            'For printing from Electron, the receipt also needs to exist as a tiny self-contained HTML file the print window can load — not buried inside the main React app.',
          analogy:
            'The clerk does not hand over the whole ledger to print one slip; they photocopy a single page. Likewise we give the printer one small standalone HTML page, not the entire app.',
          theory:
            'Electron prints whatever a `BrowserWindow` has loaded. The cleanest approach is a **small standalone receipt page** — its own HTML with the receipt markup, the print CSS and the bundled font inlined or linked. This page receives the receipt model (via a query string, a local file, or an IPC message) and renders the slip.\n\nYou can build this page two ways. The **simple way**: a `receipt.html` template with placeholders that the main process fills with string replacement, then writes to a temp file and loads. The **React way**: a second tiny Vite entry that renders `<Receipt />` from data passed in. For a beginner, the string-template route is easiest and has no build wiring.\n\nKeep this page **dependency-light**: inline the CSS and reference the local font, so it renders correctly inside a fresh hidden window with no app context. That hidden window is exactly what the next section builds.',
          whyItMatters:
            'A self-contained receipt page means the print window loads fast and renders the same slip every time, independent of the main app’s state, routing or React tree. Fewer moving parts means fewer ways a rush-hour print can fail.',
          steps: [
            'Create `receipt.html` with the slip markup and `{{token}}`, `{{amount}}` placeholders.',
            'Inline the print CSS and link the bundled Kannada font inside that page.',
            'Write a `renderReceiptHtml(model)` that fills placeholders and returns the HTML string.',
            'Decide how the page receives data: temp file, query string, or IPC.',
            'Keep the page free of app imports so it renders in a bare window.',
            'Verify the file opens standalone in a browser and shows the slip.',
          ],
          code: `// main/renderReceiptHtml.js — fill a tiny standalone receipt page.\nexport function renderReceiptHtml(model) {\n  return '<!doctype html><html><head><meta charset=\"utf-8\">' +\n    '<style>' +\n      '@page { size: 80mm auto; margin: 2mm; }' +\n      '.receipt { width: 72mm; text-align: center; font-family: sans-serif; }' +\n      '.receipt-token { font-size: 18px; font-weight: bold; }' +\n    '</style></head><body>' +\n    '<div class=\"receipt\">' +\n      '<div class=\"temple-name\">' + model.templeName + '</div>' +\n      '<div class=\"temple-place\">' + model.templePlace + '</div>' +\n      '<div class=\"receipt-token\">Token: ' + model.token + '</div>' +\n      '<div>' + model.sevaName + '</div>' +\n      '<div>' + model.devoteeName + ' | Gotra: ' + model.gotra + '</div>' +\n      '<div>Nakshatra: ' + model.nakshatra + '</div>' +\n      '<div>' + model.amount + '</div>' +\n      '<div>' + model.dateTime + '</div>' +\n    '</div></body></html>';\n}`,
          pitfalls: [
            'Inserting devotee text without escaping — a stray `<` could break the markup.',
            'Linking the font with a web URL instead of a local path inside the page.',
            'Forgetting `<meta charset="utf-8">`, so Kannada and the ₹ sign garble.',
            'Importing app modules into the standalone page, so it fails in a bare window.',
            'Leaving placeholders unfilled, printing literal `{{token}}` on the slip.',
            'Building a full React entry when a string template would have been enough.',
          ],
          tryIt:
            'Write `renderReceiptHtml(model)`, save its output to `test-receipt.html`, and open that file directly in a browser. The slip should render fully with no app running.',
          takeaway:
            'Give the printer a small self-contained HTML page, independent of the main app, so every print renders the same way fast.',
        },
      ],
    },
    {
      id: 'm6-s2',
      title: 'Printing from Electron',
      topics: [
        {
          id: 'm6-t6',
          title: 'webContents.print — the core call',
          explain:
            'Electron prints a window’s contents with `webContents.print(options, callback)`, which can show the system print dialog or print silently to a chosen printer.',
          analogy:
            'It is the app pressing the printer button for you. With the dialog on, it is like asking the clerk “which printer?” each time; silent, it is the clerk who already knows and just hits print.',
          theory:
            'Every `BrowserWindow` has a `webContents`, and **`webContents.print(options, callback)`** sends what is loaded to a printer. The key option is **`silent`**: `silent: false` pops the OS print dialog; `silent: true` skips it and prints straight to a printer (the default, or one named in `deviceName`).\n\nOther useful options: **`printBackground: true`** (so background colours/borders print), **`margins`** (`{ marginType: \'custom\', ... }` or `\'none\'`), **`pageSize`** (a named size or `{ width, height }` in microns for a thermal roll), and **`copies`**. The **callback** `(success, failureReason)` tells you whether it printed — always handle it.\n\nCrucially, `print` lives in the **main process** on a `webContents`. The renderer cannot call it directly (and should not, with `nodeIntegration` off). So printing is triggered over **IPC**: the renderer asks `api.receipts.print(token)`, the main process does the work. This respects the security model the course set up — Node and printing in MAIN, renderer talks only through the preload bridge.',
          whyItMatters:
            'This one call is the heart of the whole module. Knowing `silent`, `deviceName` and the callback lets you choose between a friendly dialog for setup and fast silent printing for the Rangapooje rush — and to detect when a print fails instead of losing a devotee’s slip.',
          steps: [
            'Get the `webContents` of the window that holds the receipt.',
            'Call `webContents.print(options, callback)` from the MAIN process.',
            'Set `silent: false` first to confirm the slip looks right in the dialog.',
            'Switch to `silent: true` with a `deviceName` for the counter printer.',
            'Set `printBackground`, `margins` and `pageSize` for the thermal roll.',
            'Handle the callback: log or surface `failureReason` when `success` is false.',
          ],
          code: `// main/printReceipt.js — the core print call (runs in MAIN).\nfunction printWindow(win, deviceName) {\n  win.webContents.print(\n    {\n      silent: true,            // no dialog — fast for the rush\n      deviceName: deviceName,  // the counter thermal printer\n      printBackground: true,\n      margins: { marginType: 'none' },\n      pageSize: { width: 80000, height: 297000 }, // microns: 80mm wide\n    },\n    (success, failureReason) => {\n      if (!success) console.error('Print failed:', failureReason);\n    }\n  );\n}`,
          pitfalls: [
            'Calling `print` from the renderer — it is a main-process API and is blocked with nodeIntegration off.',
            'Ignoring the callback, so a failed print silently loses the devotee’s slip.',
            'Leaving `silent: false` in production, forcing a dialog on every Rangapooje slip.',
            'Naming a `deviceName` that does not exactly match the OS printer name.',
            'Forgetting `printBackground`, so coloured header bars vanish on paper.',
            'Giving `pageSize` in millimetres — Electron expects microns (80mm = 80000).',
          ],
          tryIt:
            'In the main process, load the receipt HTML into a window and call `print` with `silent: false`. Confirm the OS dialog shows your slip, then flip to `silent: true` with your printer’s exact `deviceName`.',
          takeaway:
            'webContents.print is the core call — master silent vs dialog, deviceName, pageSize in microns and the success callback.',
        },
        {
          id: 'm6-t7',
          title: 'A hidden window that prints',
          explain:
            'To avoid disturbing the busy counter UI, create a hidden BrowserWindow, load the receipt HTML into it, print it, then close it.',
          analogy:
            'It is a back-office printer the clerk never sees. The front desk keeps serving devotees while, out of sight, a quiet helper loads the slip, prints it and tidies up.',
          theory:
            'You do not want to print the *main* window — it holds the live counter UI, and printing it would print the whole app. Instead, the main process opens a **hidden `BrowserWindow`** (`show: false`), loads **just the receipt page**, waits for it to finish loading, prints it, and **destroys** the window.\n\nThe sequence: create the window with `show: false`, load the standalone receipt HTML (a temp file or a data URL), listen for **`did-finish-load`** so you print only after the slip and font have rendered, call `webContents.print(...)`, and in the print callback **`win.destroy()`** to free it.\n\nThis keeps the main UI untouched and lets you print many slips back to back without flashing windows on screen. Give the hidden window a secure `webPreferences` (`nodeIntegration: false`, `contextIsolation: true`) just like every other window in the app — even though it is hidden, the same rules apply.',
          whyItMatters:
            'A hidden print window means the clerk’s screen never blinks or loses focus mid-booking. The counter keeps flowing through the rush while slips print quietly in the background — exactly what a 500-slips-an-evening temple needs.',
          steps: [
            'In MAIN, create a `BrowserWindow` with `show: false`.',
            'Use secure `webPreferences` (nodeIntegration off, contextIsolation on).',
            'Load the standalone receipt HTML (temp file or data URL).',
            'Wait for `webContents.did-finish-load` before printing.',
            'Call `webContents.print(...)` with the thermal options.',
            'In the print callback, `win.destroy()` to release the window.',
          ],
          code: `// main/printReceipt.js — hidden window, load, print, destroy.\nconst { BrowserWindow } = require('electron');\n\nfunction printReceiptHtml(html, deviceName) {\n  const win = new BrowserWindow({\n    show: false,\n    webPreferences: { nodeIntegration: false, contextIsolation: true },\n  });\n\n  win.webContents.once('did-finish-load', () => {\n    win.webContents.print(\n      { silent: true, deviceName, margins: { marginType: 'none' } },\n      (success, reason) => {\n        if (!success) console.error('Print failed:', reason);\n        win.destroy();   // tidy up the hidden window\n      }\n    );\n  });\n\n  // load the standalone slip as a data URL (no temp file needed)\n  win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));\n}`,
          pitfalls: [
            'Printing before `did-finish-load`, so a blank or font-less slip prints.',
            'Forgetting `win.destroy()`, leaking a hidden window per print until memory fills.',
            'Setting `show: true` by mistake, flashing a window over the counter UI.',
            'Reusing one hidden window unsafely across overlapping prints, mixing content.',
            'Dropping the secure webPreferences because “it is only hidden”.',
            'Not URL-encoding the data URL, so Kannada and ₹ break the load.',
          ],
          tryIt:
            'Wire `printReceiptHtml(renderReceiptHtml(model), deviceName)` and trigger it. The main window must not flicker, and a slip should print. Comment out `did-finish-load` and watch a blank slip print to feel why it matters.',
          takeaway:
            'Print from a hidden, secure BrowserWindow that loads only the slip, prints on did-finish-load, then destroys itself — the main UI stays calm.',
        },
        {
          id: 'm6-t8',
          title: 'Selecting the printer & silent printing',
          explain:
            'List the available printers, let the temple pick a default in settings, and print silently to that `deviceName` so the rush never stops for a dialog.',
          analogy:
            'You set the counter’s printer once, like fixing which hundi box the day’s collection goes into. After that, every slip just goes there without asking.',
          theory:
            'Electron exposes the installed printers via **`webContents.getPrintersAsync()`**, which returns each printer’s `name`, `displayName`, `isDefault` and status. The main process can return this list to the settings screen so the temple admin **chooses the counter printer once** and you save its `name` (the value you pass as `deviceName`).\n\nFor speed during **Rangapooje**, you print with **`silent: true`** and that saved `deviceName`. No dialog appears, so a slip prints the instant a booking is saved. If no printer is configured yet, fall back to `silent: false` (show the dialog) so nothing is lost while the temple finishes setup.\n\nStore the chosen printer in your local settings (the same offline settings store the rest of the app uses). Because everything is offline, this list and choice live entirely on the counter machine — no cloud printer service involved.',
          whyItMatters:
            'Silent printing to a fixed printer is what makes 500+ slips an evening possible. A dialog on every slip would jam the queue. Letting the temple pick the printer in settings keeps it flexible across machines without code changes.',
          steps: [
            'Add a main handler that calls `getPrintersAsync()` and returns the list.',
            'Show the list in settings; let the admin pick the counter printer.',
            'Save the chosen printer `name` to the offline settings store.',
            'Pass that saved name as `deviceName` on every silent print.',
            'Fall back to `silent: false` when no printer is configured.',
            'Re-fetch the list when the admin opens settings, in case printers changed.',
          ],
          code: `// main/printers.js — list printers and resolve the chosen one.\nconst { ipcMain } = require('electron');\n\nipcMain.handle('printers:list', async (event) => {\n  const wc = event.sender;                 // the requesting window\n  const printers = await wc.getPrintersAsync();\n  return printers.map((p) => ({\n    name: p.name,                          // pass this as deviceName\n    displayName: p.displayName,\n    isDefault: p.isDefault,\n  }));\n});\n\n// when printing, read the saved choice from settings:\nfunction resolveDeviceName(settings) {\n  return settings.counterPrinterName || undefined; // undefined = OS default\n}`,
          pitfalls: [
            'Saving `displayName` but passing it as `deviceName` — only `name` works.',
            'Assuming a printer is always set; handle the unconfigured first-run case.',
            'Caching the printer list forever, missing a newly plugged-in printer.',
            'Hard-coding one printer name, breaking the app on a different machine.',
            'Calling `getPrintersAsync` from the renderer — it is a main-process API.',
            'Forgetting to fall back to the dialog when `deviceName` is missing.',
          ],
          tryIt:
            'Add the `printers:list` handler, call it from a settings screen, and log the names. Save one as `counterPrinterName`, then print silently to it and confirm no dialog appears.',
          takeaway:
            'List printers with getPrintersAsync, let the temple pick one in settings, and print silently to its name — with a dialog fallback when none is set.',
        },
        {
          id: 'm6-t9',
          title: 'printToPDF — a PDF instead of paper',
          explain:
            'The same hidden window can produce a PDF with `webContents.printToPDF(options)`, returning the file bytes you can save or preview.',
          analogy:
            'It is the carbon copy of the slip — the same print, but kept on file instead of handed over. The temple office keeps the copy; the devotee keeps the paper.',
          theory:
            '**`webContents.printToPDF(options)`** renders the loaded page to a PDF and resolves with a **`Buffer`** of the PDF bytes. The options mirror printing: **`pageSize`** (a named size or `{ width, height }` in **inches**), `printBackground`, `margins`, and `landscape`. Note the unit difference from `print`: `printToPDF` page sizes are in **inches**, not microns.\n\nThe flow reuses the hidden window: load the receipt HTML, wait for `did-finish-load`, then `const pdf = await win.webContents.printToPDF(options)`. You now have a `Buffer` you can write to disk with `fs.writeFile`, or send back to the renderer to preview.\n\nThis is the foundation for the **offline record**: every receipt can be both printed on the thermal roll *and* saved as a PDF under the app’s `userData` folder. The next section wires that saving and the reprint flow.',
          whyItMatters:
            'A PDF copy is the temple’s permanent, offline proof of each seva booking — survives a lost paper slip, a jammed printer, or an audit. Same hidden window, one extra call, and you have a durable record alongside the printed slip.',
          steps: [
            'Reuse the hidden window that already loaded the receipt HTML.',
            'After `did-finish-load`, `await webContents.printToPDF(options)`.',
            'Set `pageSize` in INCHES for `printToPDF` (e.g. a custom narrow size).',
            'Receive the resolved `Buffer` of PDF bytes.',
            'Write the buffer to a `.pdf` file (next topic covers the path).',
            'Destroy the hidden window once the PDF is captured.',
          ],
          code: `// main/receiptToPdf.js — render the slip to PDF bytes.\nasync function receiptToPdf(win) {\n  const pdfBuffer = await win.webContents.printToPDF({\n    printBackground: true,\n    margins: { top: 0, bottom: 0, left: 0, right: 0 },\n    // printToPDF sizes are in INCHES (not microns like print):\n    pageSize: { width: 3.15, height: 8 },  // ~80mm wide roll\n  });\n  return pdfBuffer;   // a Node Buffer of PDF bytes, ready to save\n}`,
          pitfalls: [
            'Using microns for `printToPDF.pageSize` — it expects inches, unlike `print`.',
            'Calling `printToPDF` before `did-finish-load`, capturing a blank PDF.',
            'Forgetting `await` — `printToPDF` returns a Promise of the buffer.',
            'Destroying the window before the Promise resolves, aborting the PDF.',
            'Leaving `printBackground` off, dropping coloured header bars in the PDF.',
            'Assuming the buffer is text — it is binary; write it without an encoding.',
          ],
          tryIt:
            'In the hidden window, after load, `await win.webContents.printToPDF({...})` and `console.log(pdf.length)`. A non-zero byte count means you have a real PDF buffer ready to save.',
          takeaway:
            'printToPDF turns the same slip into a PDF Buffer — remember its sizes are in inches, and await the Promise before destroying the window.',
        },
      ],
    },
    {
      id: 'm6-s3',
      title: 'PDF, reprint & the print queue',
      topics: [
        {
          id: 'm6-t10',
          title: 'Saving the PDF under userData',
          explain:
            'Write each PDF buffer to a `receipts` folder inside `app.getPath(\'userData\')`, named by token, so the temple keeps an offline record.',
          analogy:
            'It is the temple’s slip register — a drawer where every carbon copy is filed by serial number, kept on the office machine itself, never sent anywhere.',
          theory:
            'All of this app’s data lives **locally** under **`app.getPath(\'userData\')`** — the OS-specific per-user app folder. Receipts are no different: create a `receipts` subfolder there and write each PDF as `R-0042.pdf` (the token). Use `fs.promises.writeFile(path, buffer)` from the **main process**.\n\nBecause the token is unique, naming files by token gives you instant lookup for reprint and a tidy, sortable register. Make the folder once with `fs.mkdir(dir, { recursive: true })` on startup so the write never fails for a missing directory.\n\nThis is the same `userData` location the course’s headline uninstaller question is about: **keep or delete this data** when the app is removed. The PDFs are part of that local record, so they sit under `userData` with the database, not scattered elsewhere on disk.',
          whyItMatters:
            'Storing PDFs under userData keeps the offline record in one predictable, per-machine place — easy to back up, easy to reason about for the keep-or-delete uninstall decision, and never dependent on the internet.',
          steps: [
            'On startup, compute `path.join(app.getPath(\'userData\'), \'receipts\')`.',
            'Create it with `fs.mkdir(dir, { recursive: true })`.',
            'Name each file by token, e.g. `R-0042.pdf`.',
            'Write the buffer with `fs.promises.writeFile(filePath, pdfBuffer)`.',
            'Return the saved path so the UI can confirm or open it.',
            'Keep all of this in MAIN — the renderer only asks via IPC.',
          ],
          code: `// main/saveReceiptPdf.js — write the PDF into userData/receipts.\nconst { app } = require('electron');\nconst fs = require('fs/promises');\nconst path = require('path');\n\nasync function saveReceiptPdf(token, pdfBuffer) {\n  const dir = path.join(app.getPath('userData'), 'receipts');\n  await fs.mkdir(dir, { recursive: true });   // safe if it exists\n  const filePath = path.join(dir, token + '.pdf'); // e.g. R-0042.pdf\n  await fs.writeFile(filePath, pdfBuffer);\n  return filePath;   // local path, offline record\n}`,
          pitfalls: [
            'Writing outside `userData` (e.g. Program Files), where the app lacks write rights.',
            'Skipping `mkdir recursive`, so the first write fails on a missing folder.',
            'Naming files by timestamp only, making reprint-by-token lookup awkward.',
            'Passing an encoding to `writeFile` for a binary PDF buffer.',
            'Doing the file write in the renderer instead of MAIN.',
            'Forgetting these PDFs count in the keep-or-delete uninstall decision.',
          ],
          tryIt:
            'Call `saveReceiptPdf(\'R-0042\', pdfBuffer)` and log the returned path. Open that folder on disk and confirm `R-0042.pdf` opens to your slip — all without any internet.',
          takeaway:
            'Save each receipt PDF by token under app.getPath(userData)/receipts so the offline record is local, predictable and part of the keep-or-delete data.',
        },
        {
          id: 'm6-t11',
          title: 'Reprinting a past token',
          explain:
            'A Reprint button takes a token number, fetches that booking from PostgreSQL, rebuilds the receipt model, and prints it again through the same pipeline.',
          analogy:
            'A devotee comes back saying they lost their slip. The clerk looks up the serial in the register and writes a fresh copy. Reprint is exactly that — find token R-0042, print it again.',
          theory:
            'Reprint reuses everything you built. The renderer sends a token to **`api.receipts.print(token)`**; the main process **queries Postgres** for that booking (`SELECT ... FROM bookings WHERE token = $1`), runs **`buildReceiptModel`**, renders the HTML, and prints through the **hidden window** exactly like a fresh print.\n\nBecause the booking is already saved, reprint **changes no data** — it never re-inserts or re-numbers. It just re-renders an existing row. You may also choose to serve the **already-saved PDF** for speed: if `R-0042.pdf` exists under `userData/receipts`, you can print that file instead of re-rendering. Either path gives the devotee an identical slip.\n\nUse the parameterised `pg` query (`$1`) — never string-concatenate the token into SQL — the same safe pattern the course used for all database access. If the token is not found, return a clear “no such token” so the clerk knows it was mistyped.',
          whyItMatters:
            'Devotees lose paper slips, printers jam mid-slip, and the counter needs a clean way to reissue. Reprint-by-token turns a stressful “I lost my token” moment into a two-second lookup, using code you already wrote.',
          steps: [
            'Add `api.receipts.print(token)` to the preload bridge and an IPC handler.',
            'In MAIN, query `SELECT * FROM bookings WHERE token = $1` with `pg`.',
            'If found, run `buildReceiptModel` on the row.',
            'Render the HTML and print via the hidden-window pipeline.',
            'If not found, return a clear error for the clerk.',
            'Optionally print the saved PDF if it already exists for speed.',
          ],
          code: `// main/reprint.js — fetch a past booking by token and print it.\nconst { ipcMain } = require('electron');\nconst { pool } = require('./db'); // pg Pool, set up earlier in the course\n\nipcMain.handle('receipts:print', async (event, token) => {\n  const num = Number(String(token).replace('R-', ''));\n  const { rows } = await pool.query(\n    'SELECT * FROM bookings WHERE token = $1',  // parameterised — safe\n    [num]\n  );\n  if (rows.length === 0) return { ok: false, error: 'No such token' };\n\n  const model = buildReceiptModel(rows[0]);\n  printReceiptHtml(renderReceiptHtml(model), resolveDeviceName(settings));\n  return { ok: true, token: model.token };\n});`,
          pitfalls: [
            'Re-inserting or re-numbering on reprint — reprint must not change data.',
            'String-concatenating the token into SQL instead of using `$1`.',
            'Not handling a missing token, leaving the clerk confused.',
            'Forgetting to strip the `R-` prefix before querying the numeric token.',
            'Exposing the raw DB query to the renderer instead of going through IPC.',
            'Assuming the saved PDF always exists; fall back to re-rendering if not.',
          ],
          tryIt:
            'Print a booking, note its token, then call `api.receipts.print(token)` for that same token. The reprinted slip should be identical and no new booking row should appear in the database.',
          takeaway:
            'Reprint = fetch the existing booking by token with a parameterised pg query, rebuild the model, and print through the same pipeline — never re-create data.',
        },
        {
          id: 'm6-t12',
          title: 'A print queue for the rush',
          explain:
            'When many bookings are saved in quick succession, queue the prints so the printer handles them one at a time instead of overlapping.',
          analogy:
            'It is the prasad queue during Rangapooje — everyone is served, but one at a time, in order. The queue stops people crowding the counter; a print queue stops slips crowding the printer.',
          theory:
            'During the evening **Rangapooje rush**, bookings can be saved faster than a thermal printer prints. If you fire a hidden window per booking all at once, windows pile up, the printer gets overlapping jobs, and some slips can fail. The fix is a **simple in-memory queue** in the main process: push each print job onto an array and process them **one at a time**.\n\nKeep a `processing` flag and a `jobs` array. `enqueue(job)` pushes and, if not already running, starts `processNext`. `processNext` shifts one job, prints it (awaiting the hidden-window print to finish), then calls itself for the next, stopping when the array is empty. Because Electron printing is async, awaiting each job keeps the printer fed steadily rather than flooded.\n\nThis queue is small and lives entirely in main memory — no library needed. If the app closes mid-rush, unfinished jobs are simply re-printable by token later, since every booking is already saved in Postgres. Keep it humble: one printer, one job at a time, in order.',
          whyItMatters:
            'A queue is what keeps 500+ slips an evening reliable. Without it, a burst of bookings spawns overlapping print windows and dropped slips at the worst possible moment. With it, every devotee gets their token in order, even at peak.',
          steps: [
            'Keep a `jobs` array and a `processing` boolean in MAIN.',
            'Expose `enqueue(job)` that pushes and kicks off processing.',
            'Write `processNext` that shifts one job and awaits its print.',
            'Recurse to the next job; stop when the array is empty.',
            'Have the booking-save flow `enqueue` a print instead of printing directly.',
            'Rely on Postgres + reprint-by-token to recover any job lost on a crash.',
          ],
          code: `// main/printQueue.js — print one slip at a time during the rush.\nconst jobs = [];\nlet processing = false;\n\nfunction enqueue(job) {        // job = { html, deviceName, token }\n  jobs.push(job);\n  if (!processing) processNext();\n}\n\nasync function processNext() {\n  if (jobs.length === 0) { processing = false; return; }\n  processing = true;\n  const job = jobs.shift();\n  try {\n    await printReceiptHtmlAsync(job.html, job.deviceName); // resolves on print done\n  } catch (err) {\n    console.error('Print job failed for', job.token, err);\n  }\n  processNext();               // next slip in line\n}\n\nmodule.exports = { enqueue };`,
          pitfalls: [
            'Firing all prints in parallel, spawning overlapping hidden windows.',
            'Not awaiting each print, so `processNext` races ahead of the printer.',
            'Forgetting to reset `processing` to false when the queue empties.',
            'Letting one failed job stop the whole queue instead of logging and moving on.',
            'Building a heavy job-queue library when a small array suffices offline.',
            'Not relying on reprint-by-token to recover jobs lost in a crash.',
          ],
          tryIt:
            'Enqueue five fake print jobs in a tight loop and add a log in `processNext`. Confirm they print strictly one after another, in order, not all at once.',
          takeaway:
            'A tiny one-at-a-time queue in main keeps the printer fed in order through the Rangapooje rush — and Postgres + reprint recovers anything lost.',
        },
        {
          id: 'm6-t13',
          title: 'Wiring print over the preload bridge',
          explain:
            'Expose printing to the React UI through the preload `contextBridge`, so the renderer calls `api.receipts.print(token)` without ever touching Node.',
          analogy:
            'The preload bridge is the counter window grille — the devotee (renderer) passes a request through the slot, the clerk (main) does the work in the back room. Nothing dangerous crosses the grille.',
          theory:
            'The course’s security model is firm: **`nodeIntegration` OFF, `contextIsolation` ON**, Node and the database in **MAIN**, and the renderer reaching the back end **only** through a **preload `contextBridge`**. Printing follows the same rule. In `preload.js`, expose a small `api.receipts` object with **`print(token)`** and maybe **`reprint(token)`**, each just an `ipcRenderer.invoke` to a named channel.\n\nThe main process registers matching **`ipcMain.handle`** handlers (`receipts:print`) that do the real work — query, render, queue, print, save PDF — and return a small result `{ ok, token }`. The renderer never sees `fs`, `pg`, `BrowserWindow` or printer APIs; it only sees the tidy `api`.\n\nThis is the same `contextBridge` + IPC shape used everywhere else in the app. Keeping printing inside it means the receipt feature inherits the app’s security and stays easy to reason about: one channel in, one result out.',
          whyItMatters:
            'Routing print through the preload bridge keeps the renderer sandboxed — no Node, no direct printer or filesystem access — so a bug or bad input in the UI can never reach the OS directly. It also makes the print API a clean, testable surface for the React screens.',
          steps: [
            'In `preload.js`, `contextBridge.exposeInMainWorld(\'api\', { receipts: {...} })`.',
            'Give `receipts.print(token)` as `ipcRenderer.invoke(\'receipts:print\', token)`.',
            'In MAIN, register `ipcMain.handle(\'receipts:print\', ...)` with the real logic.',
            'Return a small `{ ok, token, error }` result to the renderer.',
            'In React, call `await window.api.receipts.print(token)` from a button.',
            'Keep `nodeIntegration:false`, `contextIsolation:true` on every window.',
          ],
          code: `// preload.js — expose ONLY a tidy print API to the renderer.\nconst { contextBridge, ipcRenderer } = require('electron');\n\ncontextBridge.exposeInMainWorld('api', {\n  receipts: {\n    print: (token) => ipcRenderer.invoke('receipts:print', token),\n    reprint: (token) => ipcRenderer.invoke('receipts:print', token),\n  },\n});\n\n// In React (renderer) — no Node, no printer APIs, just the bridge:\n// const res = await window.api.receipts.print(currentToken);\n// if (!res.ok) showError(res.error);`,
          pitfalls: [
            'Turning `nodeIntegration` on to “make printing easier” — breaks the whole security model.',
            'Exposing `fs`, `pg` or `BrowserWindow` through the bridge instead of a small api.',
            'Channel name mismatch between `invoke` and `handle` (a silent no-op).',
            'Returning raw DB rows to the renderer instead of a small result object.',
            'Using `ipcRenderer.send` (fire-and-forget) when you need `invoke` to await a result.',
            'Putting print logic in preload — preload only wires channels; logic stays in MAIN.',
          ],
          tryIt:
            'Expose `api.receipts.print` in preload, handle `receipts:print` in main, and call it from a button. Then check `typeof window.require` in the renderer console — it must be `undefined`, proving Node is sealed off.',
          takeaway:
            'Expose printing as a tiny api.receipts over contextBridge + IPC; the renderer stays sandboxed while MAIN does the Node, DB and printer work.',
        },
        {
          id: 'm6-t14',
          title: 'Handling print failures gracefully',
          explain:
            'Printers run out of paper, go offline or jam — detect failures from the print callback and tell the clerk clearly, with the slip still saved as PDF.',
          analogy:
            'If the temple bell cracks mid-aarti, the priest does not stop the pooje — they note it and carry on. A failed print should not lose the booking; the data and PDF are safe, only the paper failed.',
          theory:
            'Real counters hit real problems: the roll runs out, the USB cable slips, the printer is busy. Your `webContents.print` **callback** gives `(success, failureReason)` — treat `success === false` as a real event, not a silent log. Surface it to the renderer through the IPC result (`{ ok: false, error }`) so the React UI can show a clear banner: “Print failed — reload paper and press Reprint.”\n\nCritically, because the booking is **already saved in Postgres** and you can also **save the PDF first**, a failed print never loses data. The clerk fixes the printer and uses **reprint-by-token** to reissue the slip. Order the flow so saving (DB + PDF) happens before or independent of the paper print, so paper is the only thing that can fail.\n\nKeep messages plain and local: no devotee should leave without a token, and the clerk should always know whether the paper actually came out. Offline-first means the record survives even when the hardware does not.',
          whyItMatters:
            'Hardware fails most during the busiest hour. Graceful failure handling means a jammed printer is a 10-second reload and reprint, not a lost booking or a confused devotee — the difference between a calm counter and chaos.',
          steps: [
            'Save the booking (and optionally the PDF) before the paper print.',
            'Read `(success, failureReason)` in the print callback.',
            'On failure, return `{ ok: false, error }` over IPC.',
            'In React, show a clear banner with a Reprint action.',
            'Let the clerk fix the printer and reprint by token.',
            'Log the failure reason locally for later troubleshooting.',
          ],
          code: `// main — turn the print callback into a clear IPC result.\nfunction printAndReport(win, deviceName) {\n  return new Promise((resolve) => {\n    win.webContents.print(\n      { silent: true, deviceName, margins: { marginType: 'none' } },\n      (success, failureReason) => {\n        win.destroy();\n        if (success) resolve({ ok: true });\n        else resolve({ ok: false, error: failureReason || 'Printer not ready' });\n      }\n    );\n  });\n}\n// The booking + PDF are already saved, so a false result loses no data.`,
          pitfalls: [
            'Printing before saving, so a jam loses the whole booking.',
            'Swallowing `failureReason` in a silent log the clerk never sees.',
            'Showing a cryptic error instead of “reload paper and reprint”.',
            'Assuming `success:true` means the paper physically came out (it usually does, but reload checks help).',
            'No reprint path, forcing a re-booking when only the paper failed.',
            'Blocking the whole UI on a print error instead of a dismissible banner.',
          ],
          tryIt:
            'Turn the printer off and trigger a print. Confirm the callback reports failure, the UI shows a clear message, the booking still exists in the DB, and reprint works once the printer is back on.',
          takeaway:
            'Save first, then print, and surface the print callback’s failure clearly — offline data plus reprint-by-token means a failed print never costs a booking.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm6-p1',
      type: 'guided-build',
      title: 'Printable receipt component',
      domain: 'Maranakatte Seva — seva receipt slip',
      duration: '3–4 hours',
      description:
        'Build a pure, prop-driven React receipt component that lays out a Maranakatte seva slip: the temple header in Kannada and English, the seva line(s), the devotee’s name, gotra and nakshatra, a bold token number and the ₹ total — all styled with print CSS for an 80mm thermal roll so the browser print preview matches the real slip.',
      tools: ['React', 'Vite', 'CSS @media print + @page', 'Noto Sans Kannada (bundled)', 'Electron (preview)'],
      blueprint: {
        overview:
          'You will create a `Receipt` component and its print stylesheet so a single narrow slip renders identically on screen and on an 80mm thermal roll. The component takes a ready receipt model (from `buildReceiptModel`) and renders only the slip — no buttons, no IPC — with the bundled Kannada font so the temple name shows in both scripts even offline.',
        functionalRequirements: [
          'Render the temple header (Shri Brahmalingeshwara Temple, Maranakatte) in Kannada above English.',
          'Show the seva line(s), the devotee name, gotra and nakshatra clearly.',
          'Display the token number large and bold, and the ₹ total formatted with two decimals.',
          'Lay out as a single narrow centred column sized for an 80mm (72mm printable) roll.',
          'Match the on-screen preview to the printed slip via `@media print` and `@page`.',
        ],
        technicalImplementation: [
          'Write `buildReceiptModel(booking)` to shape a DB row into receipt fields and format ₹ once.',
          'Build `Receipt.jsx` as a pure component taking only a `model` prop, root class `receipt`.',
          'Bundle Noto Sans Kannada locally and load it with `@font-face` (no web URL).',
          'Create `thermal-80.css` with `@page { size: 80mm auto }`, `.receipt { width: 72mm }`.',
          'Verify with Ctrl+P print preview at a narrow custom size that nothing clips.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Model + component',
            outcome: 'A pure Receipt component fed by a buildReceiptModel helper.',
            prompt:
              'In a React + Vite project, write `buildReceiptModel(booking)` that turns a booking row { token, seva, name, gotra, nakshatra, amount (a numeric string), createdAt } into receipt fields, formatting the amount as a ₹ string with two decimals and the token as `R-0042`. Then write a pure `Receipt.jsx` component that takes only a `model` prop and renders, top to bottom: temple header, a bold token line, the seva, a devotee block (name, gotra, nakshatra), the ₹ amount and the date/time. No buttons, no IPC. Give the root a `receipt` class.',
          },
          {
            step: 2,
            label: 'Kannada + thermal CSS',
            outcome: 'Kannada renders offline and the slip fits an 80mm roll.',
            prompt:
              'Add an offline Kannada font: declare `@font-face` for a bundled NotoSansKannada .ttf using a local `url()` and set `.receipt { font-family: \'Noto Sans Kannada\', sans-serif }`. Render the temple name in Kannada above its English line. Then write `thermal-80.css` inside `@media print` with `@page { size: 80mm auto; margin: 2mm }`, `.receipt { width: 72mm; text-align: center }` and a large bold `.receipt-token`. Explain why the printable width is 72mm, not 80mm.',
          },
          {
            step: 3,
            label: 'Preview & verify',
            outcome: 'The print preview matches the intended slip with nothing clipped.',
            prompt:
              'Render `<Receipt model={buildReceiptModel(fakeBooking)} />` on a page, open the browser print preview (Ctrl+P), and set a narrow custom paper size. Walk through a checklist: token is the most prominent line, Kannada shows (no empty boxes), ₹ amount has two decimals, and nothing is clipped at the right edge. List three fixes if any field overflows the 72mm width.',
          },
        ],
      },
    },
    {
      id: 'm6-p2',
      type: 'guided-build',
      title: 'Print + save PDF over IPC',
      domain: 'Maranakatte Seva — Electron print pipeline',
      duration: '4–5 hours',
      description:
        'Wire an `api.receipts.print(token)` channel that, in the main process, opens a hidden BrowserWindow, prints the slip silently to the counter printer, and also writes a PDF copy into `app.getPath(\'userData\')/receipts`. Add a Reprint button that prints any past token by fetching it from PostgreSQL — all through the secure preload bridge with nodeIntegration off.',
      tools: ['Electron (main + preload)', 'contextBridge + IPC', 'webContents.print / printToPDF', 'pg (PostgreSQL)', 'Node fs/promises'],
      blueprint: {
        overview:
          'You will build the full offline print pipeline. The renderer calls `api.receipts.print(token)` over the preload bridge; the main process fetches the booking from Postgres, renders the standalone receipt HTML, prints it silently from a hidden window, saves a PDF under userData, and returns a small result. A Reprint button reuses the same channel for any past token. Node, the DB and the printer stay entirely in MAIN.',
        functionalRequirements: [
          'Expose `api.receipts.print(token)` (and reprint) via contextBridge — renderer never touches Node.',
          'In MAIN, fetch the booking by token with a parameterised `pg` query.',
          'Print silently from a hidden BrowserWindow to the configured counter printer.',
          'Save a PDF copy as `R-0042.pdf` under `app.getPath(\'userData\')/receipts`.',
          'A Reprint button reissues any past token, changing no data, with clear errors.',
        ],
        technicalImplementation: [
          'In `preload.js`, expose `api.receipts.print` as an `ipcRenderer.invoke(\'receipts:print\', token)`.',
          'Register `ipcMain.handle(\'receipts:print\')`: query Postgres, `buildReceiptModel`, render HTML.',
          'Open a hidden `BrowserWindow` (show:false, secure webPreferences), print on `did-finish-load`, then destroy.',
          'Call `printToPDF` (sizes in inches) and `fs.writeFile` the buffer into userData/receipts.',
          'Return `{ ok, token, error }`; show failures as a banner with a Reprint action.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Bridge + main handler',
            outcome: 'The renderer can request a print without touching Node.',
            prompt:
              'In an Electron app with `nodeIntegration:false` and `contextIsolation:true`, expose `window.api.receipts.print(token)` from `preload.js` using `contextBridge` + `ipcRenderer.invoke(\'receipts:print\', token)`. In the main process, register `ipcMain.handle(\'receipts:print\', ...)` that queries PostgreSQL with `SELECT * FROM bookings WHERE token = $1` (parameterised), runs `buildReceiptModel`, and returns `{ ok, token }`. Explain why the print logic must live in MAIN and not preload.',
          },
          {
            step: 2,
            label: 'Hidden window + silent print',
            outcome: 'Slips print silently without disturbing the counter UI.',
            prompt:
              'Add a `printReceiptHtml(html, deviceName)` in the main process that creates a hidden `BrowserWindow` (show:false, secure webPreferences), loads the standalone receipt HTML as a data URL, waits for `did-finish-load`, then calls `webContents.print({ silent:true, deviceName, margins:{marginType:\'none\'} }, cb)` and `win.destroy()` in the callback. Pass the printer name from saved settings. Show how to list printers with `getPrintersAsync()` so the temple picks one.',
          },
          {
            step: 3,
            label: 'Save PDF + Reprint',
            outcome: 'Every slip is saved offline and any token can be reprinted.',
            prompt:
              'Extend the pipeline: after load, also `await win.webContents.printToPDF({ pageSize: { width:3.15, height:8 } })` (inches) and write the buffer with `fs.writeFile` to `path.join(app.getPath(\'userData\'), \'receipts\', token + \'.pdf\')`, creating the folder with `mkdir({recursive:true})`. Then add a React Reprint button that calls `await window.api.receipts.print(token)` for a past token and shows `{ ok:false, error }` as a banner. Confirm reprint inserts no new booking row.',
          },
        ],
      },
    },
  ],
  quiz: [
    {
      id: 'm6-q1',
      q: 'On the counter machine at Maranakatte (fully offline), how should the receipt load its Kannada font so the temple name does not print as empty boxes?',
      options: [
        'Link Google Fonts in the page head',
        'Bundle the font file and load it locally with @font-face',
        'Assume the thermal printer has Kannada built in',
        'Use only an English font and transliterate',
      ],
      answer: 1,
    },
    {
      id: 'm6-q2',
      q: 'Why is the receipt printed from a hidden BrowserWindow rather than the main window?',
      options: [
        'Hidden windows print faster on every OS',
        'The main window cannot access a printer',
        'So the live counter UI is not disturbed and only the slip prints',
        'Electron cannot print visible windows',
      ],
      answer: 2,
    },
    {
      id: 'm6-q3',
      q: 'During the Rangapooje rush you want slips to print with no dialog. Which option does that?',
      options: [
        'printBackground: true',
        'silent: true with a saved deviceName',
        'landscape: true',
        'margins: { marginType: \'none\' }',
      ],
      answer: 1,
    },
    {
      id: 'm6-q4',
      q: 'Where should the saved PDF copies of receipts be written in this offline app?',
      options: [
        'In a cloud bucket for backup',
        'Inside the Program Files install folder',
        'Under app.getPath(\'userData\')/receipts, named by token',
        'In the system temp folder, deleted on exit',
      ],
      answer: 2,
    },
    {
      id: 'm6-q5',
      q: 'A devotee lost their slip. The clerk presses Reprint for token R-0042. What must the reprint flow NOT do?',
      options: [
        'Fetch the booking with a parameterised pg query',
        'Re-insert or re-number the booking as new data',
        'Rebuild the receipt model from the existing row',
        'Print through the same hidden-window pipeline',
      ],
      answer: 1,
    },
    {
      id: 'm6-q6',
      q: 'How does the React renderer trigger printing while keeping nodeIntegration off and contextIsolation on?',
      options: [
        'It imports the pg and fs modules directly',
        'It calls webContents.print itself',
        'It calls window.api.receipts.print(token) exposed via the preload contextBridge',
        'It enables nodeIntegration just for the receipt screen',
      ],
      answer: 2,
    },
  ],
};
