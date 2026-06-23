// Module 6 — Kannada Data Entry: the Edit Popup, IME & Fonts.
// Electron + React + TypeScript + Prisma over a bundled LOCAL PostgreSQL. OFFLINE
// desktop app for a coastal-Karnataka village temple committee — the year-wise
// pooja/donor register ("Upralli Seva"). This module makes Kannada a first-class
// citizen: the full UTF-8 chain, a bundled Noto Sans Kannada font, and the CRITICAL
// UX rule — editing a household's text opens a MODAL popup with an OS IME, never an
// inline editor. Plus add/delete/reorder and debounced auto-save. Consumed by the
// React course player (see components/TopicItem.jsx).

export const m6 = {
  id: 'm6',
  title: 'Kannada Data Entry: the Edit Popup, IME & Fonts',
  hours: 8,
  color: 'from-yellow-500/20 to-yellow-700/10',
  accent: 'yellow',
  description:
    'Make Kannada a first-class citizen in the Upralli Seva register. Build the full UTF-8 chain so a household name typed in Kannada survives the round-trip from keyboard to local PostgreSQL and back, byte for byte. Bundle Noto Sans Kannada so rendering never depends on the user\'s OS. Then build the heart of data entry — a reusable Modal and an EditPersonDialog with a multi-line Kannada name/address textarea — because the rule for this app is that editing text opens a calm popup, never an inline contentEditable cell. Finish with add, delete, drag-to-reorder, debounced auto-save and a locked-year guard.',
  sections: [
    {
      id: 'm6-s1',
      title: 'Kannada end to end (UTF-8 & fonts)',
      topics: [
        {
          id: 'm6-t1',
          title: 'The UTF-8 Chain From Keyboard to Database',
          explain:
            'Kannada text survives only if **every link** in the chain speaks UTF-8 — the database encoding, Electron/Chromium, the HTML page, and the save — because one weak link turns ಉಪ್ರಳ್ಳಿ into garbled **mojibake**.',
          analogy:
            'Think of writing a household\'s name in the temple register and then photocopying it through five machines in a row. If even one machine is set to the wrong paper size, the name comes out smudged and unreadable. UTF-8 is the agreed paper size: the keyboard, the page, the database and the export must all use it, or somewhere along the line the Kannada letters get mangled.',
          theory:
            'A character like ಳ is not one byte — in UTF-8 it is a sequence of three bytes. **Encoding** is the agreement on how letters become bytes and back again. If the keyboard sends UTF-8 but the database stores it as Latin-1, the bytes are reinterpreted wrongly and you get **mojibake** — those telltale question-mark boxes and Ã-style gibberish. The fix is not clever code; it is making sure the same encoding (UTF-8) is set at every single hop.\n\nIn this stack the hops are: the **PostgreSQL database**, which must have been created with `initdb --encoding=UTF8` (we set this back in Module 2 — this is why it matters now); **Electron/Chromium**, which is UTF-8 by default so the renderer is already on side; the **HTML page**, which declares `<meta charset=\'utf-8\'>`; and any **export** you write (CSV, print) which must be written as UTF-8 too. Prisma sits in the **main process** and talks to Postgres over a connection that is UTF-8 because the database is.\n\nThe quietly important point is that **you rarely write encoding code** — you configure it once and then trust it. The bug appears when one default is wrong: a database restored from a non-UTF-8 dump, a file written with the wrong encoding, a terminal that cannot display Kannada. So the skill here is knowing the whole chain exists, so that when ಉಪ್ರಳ್ಳಿ shows as `?????`, you can walk the hops and find the one that is misconfigured instead of randomly editing code.',
          whyItMatters:
            'Kannada is the PRIMARY data language of this register — every household name and address is in it. If even one hop drops UTF-8, the committee\'s data is silently corrupted, and corrupted names in a temple\'s donor book are not a cosmetic bug — they are lost records. Knowing the full chain is what lets you guarantee the data is safe.',
          steps: [
            'Confirm the database was created with `initdb --encoding=UTF8` (recap from Module 2).',
            'Add `<meta charset=\'utf-8\'>` to the renderer\'s `index.html` `<head>`.',
            'Rely on Electron/Chromium being UTF-8 by default in the renderer.',
            'Ensure Prisma\'s `DATABASE_URL` points at the UTF-8 Postgres instance (it inherits the encoding).',
            'When writing any export file, write it explicitly as UTF-8 (e.g. `\'utf-8\'` encoding).',
            'Test one Kannada name through the whole chain before trusting it (next topic).',
          ],
          code: `<!-- src/renderer/index.html — declare UTF-8 for the page itself. -->
<!doctype html>
<html lang='kn'>
  <head>
    <meta charset='utf-8' />
    <meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
    <title>Upralli Seva</title>
  </head>
  <body>
    <div id='root'></div>
    <script type='module' src='/src/renderer/main.tsx'></script>
  </body>
</html>

<!-- The database was created in Module 2 with: initdb --encoding=UTF8 -->
<!-- Electron/Chromium is UTF-8 by default, so the renderer is already safe. -->`,
          pitfalls: [
            'Assuming \'it works on my machine\' — a Kannada font may hide a wrong DB encoding until another machine shows boxes.',
            'Creating the Postgres cluster without `--encoding=UTF8`, so multi-byte letters get mangled on insert.',
            'Forgetting `<meta charset=\'utf-8\'>`, leaving the page to guess the encoding.',
            'Writing an export (CSV/print) with a default OS encoding instead of explicit UTF-8.',
            'Restoring the database from a dump made in a different encoding and inheriting its corruption.',
            'Treating mojibake as a font problem when it is actually a bytes/encoding problem.',
          ],
          tryIt:
            'Open your `index.html` and temporarily change `charset=\'utf-8\'` to `charset=\'iso-8859-1\'`, reload, and type a Kannada name. Watch it break — then change it back. Seeing the failure once teaches you to recognise mojibake instantly.',
          takeaway:
            'UTF-8 must hold at every hop — DB (`initdb --encoding=UTF8`), Chromium (default), the HTML `charset`, and exports — because one weak link turns Kannada into mojibake.',
        },
        {
          id: 'm6-t2',
          title: 'Bundling Noto Sans Kannada So It Always Renders',
          explain:
            'Ship a **Noto Sans Kannada** TTF inside the app and apply it with `@font-face`, so Kannada renders correctly even on a machine whose OS has no Kannada font installed.',
          analogy:
            'Imagine the committee buys a computer for the temple office and it turns out to have no Kannada font installed — the register would show empty boxes for every name. Bundling the font is like bringing your own pen and ink to the office instead of hoping a usable pen is already on the desk: you are never at the mercy of what the machine happens to have.',
          theory:
            'Correct UTF-8 storage guarantees the **bytes** are right, but it does not guarantee the screen can **draw** them. Drawing needs a font that contains Kannada glyphs. Many Windows machines do have one, but you cannot assume it — and even when present, versions differ. So we **bundle** an open-licensed font, **Noto Sans Kannada** (Noto literally means \'no tofu\', the nickname for those missing-glyph boxes), as a TTF file shipped in the app\'s resources, and load it with a CSS `@font-face` rule.\n\nThe key is referencing the file by a path that works in the **packaged** app, not just in dev. In an Electron + Vite renderer you typically place the TTF under an assets folder and import it (Vite rewrites the URL), or copy it into `resources` and load it via a `file://`-safe path. Then a `@font-face` declares the family name and the `src`, and your base CSS sets `font-family` so every Kannada element — especially the edit textarea — uses it.\n\nKannada is a **complex script**: it stacks consonants into conjuncts using the **virama** (U+0CCD, the halant) — for example ಪ್ರ is ಪ + virama + ರ rendered as a single ligature. A good Kannada font with proper shaping (which Noto has) is what makes these conjuncts render correctly; a partial or wrong font may show the base letters un-joined. So bundling Noto is not just about presence — it is about correct **shaping** of real Kannada.',
          whyItMatters:
            'The temple committee\'s machine is out of your control, and a register that shows boxes instead of names is useless. Bundling Noto Sans Kannada means the app looks identical and correct on every machine, and complex conjuncts render properly — the difference between a professional tool and one that breaks on someone else\'s computer.',
          steps: [
            'Download the open-licensed `NotoSansKannada-Regular.ttf` (and a Bold weight if needed).',
            'Place it in the renderer assets (e.g. `src/renderer/assets/fonts/`) or app `resources`.',
            'Declare an `@font-face` with `font-family: \'Noto Sans Kannada\'` pointing at the TTF.',
            'Set the base `font-family` so Kannada text — especially inputs/textarea — uses it.',
            'Verify it loads in the PACKAGED build, not only in `vite dev`.',
            'Test a conjunct (e.g. ಪ್ರ) renders as one ligature, confirming proper shaping.',
          ],
          code: `/* src/renderer/styles/fonts.css — bundle the font, never trust the OS. */
@font-face {
  font-family: 'Noto Sans Kannada';
  src: url('../assets/fonts/NotoSansKannada-Regular.ttf') format('truetype');
  font-weight: 400;
  font-display: swap;
}

/* Apply it everywhere Kannada appears, especially editable fields. */
:root {
  --font-kannada: 'Noto Sans Kannada', system-ui, sans-serif;
}
body,
textarea,
input {
  font-family: var(--font-kannada);
}

/* ಪ್ರ = ಪ + U+0CCD (virama) + ರ — Noto shapes this conjunct correctly. */`,
          pitfalls: [
            'Relying on a font the OS \'probably has\' — it may be absent or an older version.',
            'A font path that works in `vite dev` but 404s in the packaged app (wrong resources path).',
            'Bundling a font without the proper Kannada shaping tables, so conjuncts break apart.',
            'Forgetting to set `font-family` on `textarea`/`input`, so the edit popup uses a fallback font.',
            'Shipping a huge font with every weight when Regular (and maybe Bold) is enough.',
            'Ignoring the font licence — use the openly-licensed Noto, not a restricted font.',
          ],
          tryIt:
            'Temporarily rename or remove the bundled TTF and reload. If Kannada still renders, your OS is quietly providing a font — comment out the `@font-face` AND test on a machine without Kannada fonts to prove the bundle is doing the work.',
          takeaway:
            'Bundle Noto Sans Kannada as a TTF and load it via `@font-face`, applied to inputs too, so Kannada — including virama conjuncts — renders correctly on any machine.',
        },
        {
          id: 'm6-t3',
          title: 'Testing the Kannada Round-Trip: Trust the Bytes',
          explain:
            'Prove Kannada is safe by **round-tripping** it: type via the OS IME, save to Postgres, reload, and confirm the bytes are identical — and learn to trust the stored bytes over what a terminal or chat window shows.',
          analogy:
            'When the committee copies a name from an old register into the new one, they read it back aloud to check it matches before moving on. A round-trip test is the same read-back: you do not assume the name saved correctly, you reload it and compare, so you catch corruption the moment it happens rather than weeks later.',
          theory:
            'A **round-trip test** is the most reliable way to verify encoding. The procedure: type a known Kannada string via the OS IME into the edit popup, save it through Prisma to Postgres, then reload it and compare. If the reloaded string equals what you typed — character for character, byte for byte — the whole chain is sound. If it does not, you have localised the bug to whichever hop changed the bytes.\n\nThe deeper lesson is **trust the bytes, not the display**. Different surfaces render text differently: a terminal may lack a Kannada font, a log viewer may use the wrong encoding, a chat paste may itself corrupt the text in transit. (There is a real bug pattern here: a developer pastes a Kannada value into a chat to ask why it is broken, the paste arrives as mojibake, and everyone debugs the wrong thing — when the actual file on disk was perfectly fine all along.) So when something looks wrong, do not trust the terminal; check the **actual stored bytes** — query the column length, compare the raw string in code, or read the file as a byte array.\n\nIn practice you verify in code, not by eyeballing. Read the saved row back through Prisma and assert `saved.name === typed`. Or compare byte lengths: a correct three-byte-per-character Kannada string has a predictable UTF-8 byte length, and a corrupted one will not match. Make this a habit early and you will never ship a register full of silently mangled names.',
          whyItMatters:
            'Encoding bugs are insidious because they often look fine on the developer\'s machine and only surface later on the committee\'s. A disciplined round-trip test — and the habit of trusting bytes over a possibly-broken display — is what catches corruption immediately, while it is cheap to fix, instead of after a year of data entry.',
          steps: [
            'Pick a known Kannada test string (e.g. a household name with a conjunct like ಪ್ರ).',
            'Type it via the OS IME into the edit popup and save it through Prisma.',
            'Reload the row and compare in code: assert `saved.name === typed`.',
            'If they differ, compare UTF-8 byte lengths to see whether bytes changed.',
            'When a terminal or chat shows mojibake, distrust the display — check the stored bytes.',
            'Keep one round-trip test as a quick manual or automated check you re-run after DB changes.',
          ],
          code: `// A round-trip check in the main process (Prisma) — trust the bytes.
const typed = 'ಉಪ್ರಳ್ಳಿ';   // typed via the OS IME in the edit popup

const created = await prisma.personEntry.create({ data: { name: typed } });
const reloaded = await prisma.personEntry.findUnique({ where: { id: created.id } });

console.log(reloaded?.name === typed);                  // expect: true
console.log(Buffer.byteLength(typed, 'utf-8'));         // stable UTF-8 byte length
console.log(Buffer.byteLength(reloaded?.name ?? '', 'utf-8'));  // must match

// If a chat/terminal shows '?????' but these match, the DATA is fine —
// the display is lying. Trust the bytes.`,
          pitfalls: [
            'Eyeballing a terminal that lacks a Kannada font and concluding the data is corrupt when it is fine.',
            'Debugging a chat-pasted value that got mangled in transit, not the actual stored bytes.',
            'Comparing strings only by sight instead of asserting equality in code.',
            'Skipping the round-trip after restoring or migrating the database.',
            'Assuming \'it rendered once\' means the save is correct — render and storage are different concerns.',
            'Not having a known test string, so you cannot tell a correct round-trip from a lucky one.',
          ],
          tryIt:
            'Save a Kannada name, then query it back in a tiny script and log `saved === typed` plus both UTF-8 byte lengths. Then paste the same value into a terminal and notice how the display might differ — proof that bytes, not screens, are the source of truth.',
          takeaway:
            'Verify Kannada with a type→save→reload round-trip and assert equality in code; when a screen shows mojibake, trust the stored bytes, not the display.',
        },
      ],
    },
    {
      id: 'm6-s2',
      title: 'The edit popup (the critical UX rule)',
      topics: [
        {
          id: 'm6-t4',
          title: 'Why a Modal, Not Inline contentEditable',
          explain:
            'Editing a household\'s text fields must open a **modal popup**, never an inline `contentEditable` cell — for predictable IME behaviour, room to validate, and a calm form for multi-line Kannada.',
          analogy:
            'When a committee member needs to correct a name in the register, they do not scribble over the line in the crowded book; they take the entry to a clean side-desk, write it carefully with the proper pen, and only then copy it back in. The modal is that side-desk: a quiet, focused space to enter Kannada properly, away from the busy grid.',
          theory:
            'This is the explicit, non-negotiable UX rule of the app: **text editing happens in a modal popup**. The reason is partly the **IME**. An Indian-language input method behaves predictably inside a normal `<textarea>`/`<input>`, where the browser knows how to host composition events. Inline `contentEditable` cells are a notorious source of IME glitches — composition can drop, the caret can jump, and conjuncts can break — exactly the kind of subtle failure that is maddening when your primary language is Kannada.\n\nA modal also gives you **space and structure**. A household entry here is one combined, multi-line Kannada name/address field plus an optional mobile and some pooja chips. That does not fit calmly into a single editable grid cell; it wants a small form with a proper `<textarea>`, labels, and validation messages. The modal provides that form without cramming it into the table.\n\nFinally, a modal makes the **read vs edit** distinction crisp: the grid/cards are **read-only** displays, and clicking one **opens** the editor. This separation means the table can be optimised purely for scanning and the editor purely for careful entry, instead of one widget trying to be both. It is more code than an inline editor, but it is the code that makes Kannada entry reliable — which is the whole point of the app.',
          whyItMatters:
            'Kannada is the primary data language, and the user explicitly mandated the modal pattern because inline editing makes the IME unreliable. Getting this rule right is the single most important UX decision in the app: it is the difference between data entry that the committee can trust and one that randomly drops or mangles characters.',
          steps: [
            'Decide and document the rule: grid/cards are read-only; clicking opens an edit modal.',
            'Never reach for `contentEditable` for the Kannada fields — use real `<textarea>`/`<input>`.',
            'Plan the modal as a small form: name/address textarea, mobile input, pooja chips.',
            'Give the modal room for labels and inline validation messages.',
            'Make clicking a row/card the single way to start editing.',
            'Keep read components and edit components separate so each does one job well.',
          ],
          code: `// The rule in one place: a read-only card that OPENS the modal to edit.
function PersonCard({ entry, onEdit }: { entry: PersonEntry; onEdit: () => void }) {
  return (
    <button type='button' className='person-card' onClick={onEdit}>
      {/* Read-only display — NEVER contentEditable. */}
      <pre className='kn'>{entry.name}</pre>
      {entry.mobile && <span className='mobile'>{entry.mobile}</span>}
    </button>
  );
}

// Clicking the card sets which entry is being edited; the modal does the rest.
// <PersonCard entry={e} onEdit={() => setEditingId(e.id)} />
// {editingId && <EditPersonDialog id={editingId} onClose={() => setEditingId(null)} />}`,
          pitfalls: [
            'Using `contentEditable` for Kannada and hitting dropped IME composition and jumping carets.',
            'Trying to make a grid cell both display and edit, so neither job is done well.',
            'Cramming a multi-line address into a single-line cell with no room to read it.',
            'No clear read/edit separation, so the table re-renders on every keystroke.',
            'Skipping validation because there is nowhere to show a message inline.',
            'Treating the modal as optional polish rather than the app\'s core, mandated pattern.',
          ],
          tryIt:
            'Sketch (or prototype) the same name field two ways: a `contentEditable` cell and a modal `<textarea>`. Type a Kannada conjunct via the IME in both and notice how much more predictable the textarea feels. That gap is why the rule exists.',
          takeaway:
            'Text edits open a modal with real `<textarea>`/`<input>` fields — never inline `contentEditable` — because that is what makes Kannada IME entry predictable and gives room to validate.',
        },
        {
          id: 'm6-t5',
          title: 'A Reusable Modal: Overlay, Focus Trap, Escape',
          explain:
            'Build one reusable `Modal` component with an **overlay**, a **focus trap**, and **Escape-to-close**, so every popup in the app behaves consistently and accessibly.',
          analogy:
            'A modal is like calling one family up to the committee desk while everyone else waits behind the rope. While that family is at the desk, attention stays on them (focus trap), the rope keeps others out (overlay), and they can step back any time (Escape). One well-run desk procedure is reused for every family, instead of improvising each time.',
          theory:
            'A modal is a focused layer rendered above the page. It needs three behaviours to feel right. The **overlay** is a dimmed backdrop that covers the page, signalling \'deal with this first\' and catching clicks outside to close. The **focus trap** keeps keyboard focus inside the dialog while it is open — Tab cycles through the dialog\'s fields and does not wander off into the table behind it. **Escape-to-close** lets the user dismiss with a key, which pairs naturally with the keyboard-first feel of a data-entry tool.\n\nIn React you render this once as a `Modal` that takes `children` and an `onClose`. On mount you move focus into the dialog (often the first field or a `ref`), and you add a `keydown` listener for Escape that calls `onClose`. A clean implementation portals the modal to the document body so it sits above everything regardless of where it is used, and restores focus to the triggering element on close so the user is not left lost.\n\nBuilding it **once, reusably** matters: the EditPersonDialog, a delete confirm, and any future popup all wrap this same `Modal`. That gives consistent behaviour and one place to fix accessibility. Remember to remove the `keydown` listener on unmount (the same cleanup discipline as any effect) so closed modals do not leave stray listeners firing.',
          whyItMatters:
            'Every edit and confirm in the app goes through a modal, so a single well-behaved `Modal` — trapping focus, dimming the page, closing on Escape — sets the quality bar for the entire UI. Get it right once and every popup is accessible and predictable; get it wrong and focus bugs haunt the whole app.',
          steps: [
            'Create a `Modal` taking `children` and an `onClose` callback.',
            'Render a dimmed overlay that closes the modal when clicked outside the dialog.',
            'On mount, move focus into the dialog (a `ref` on the first field or the dialog).',
            'Add a `keydown` listener that calls `onClose` on Escape; remove it on unmount.',
            'Trap Tab focus within the dialog so it does not escape to the page behind.',
            'Optionally portal to `document.body` and restore focus to the trigger on close.',
          ],
          code: `// src/renderer/components/Modal.tsx — one reusable, accessible modal.
import { useEffect, useRef, type ReactNode } from 'react';

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();                 // move focus into the dialog
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();        // Escape closes
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);  // cleanup
  }, [onClose]);

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div
        className='modal-dialog'
        role='dialog'
        aria-modal='true'
        tabIndex={-1}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}    // clicks inside do NOT close
      >
        {children}
      </div>
    </div>
  );
}`,
          pitfalls: [
            'Forgetting to remove the Escape `keydown` listener on unmount, leaking listeners.',
            'Closing on a click inside the dialog because you did not `stopPropagation`.',
            'No focus trap, so Tab wanders into the table behind the modal.',
            'Never moving focus into the dialog, so keyboard users start outside it.',
            'Re-implementing modal behaviour per popup instead of one reusable `Modal`.',
            'Missing `role=\'dialog\'`/`aria-modal`, hurting accessibility for the committee\'s users.',
          ],
          tryIt:
            'Open the modal, press Tab repeatedly, and confirm focus cycles only within the dialog. Press Escape and confirm it closes. Click the dimmed overlay outside the dialog — it should close; click inside — it should not.',
          takeaway:
            'One reusable `Modal` — overlay to close, focus moved in and trapped, Escape-to-close with listener cleanup — powers every popup consistently and accessibly.',
        },
        {
          id: 'm6-t6',
          title: 'EditPersonDialog: the Multi-Line Kannada Form',
          explain:
            'Build an `EditPersonDialog` inside the modal with a **multi-line `<textarea>`** for the combined Kannada name/address, a **mobile** input, and **pooja chips** — the calm form where all household text is entered.',
          analogy:
            'This dialog is the clean side-desk form the committee fills for one household: a big ruled box for the name-and-address written together over a few lines, a small line for the phone, and a row of tick-boxes for which poojas they take part in. Everything for one household, on one tidy form.',
          theory:
            'The PersonEntry in this domain is deliberately simple: **one combined, multi-line Kannada name/address field**, an **optional mobile**, and the household\'s **pooja participation**. So the form has a `<textarea>` (multi-line, because a name and address span several lines), a single-line mobile `<input>`, and a set of **pooja chips** that toggle which PoojaTypes this household participates in.\n\nThe critical detail is that the `<textarea>` must use the **bundled Kannada font** (from Topic 2) — set its `font-family` explicitly so the editing surface, not just the display, shows Kannada correctly. The textarea is a normal hosted input, which is exactly what makes the OS IME behave; this is the payoff of choosing a modal over `contentEditable`.\n\nThe dialog is opened from a read-only card/row: clicking one passes the entry\'s id, the dialog loads that entry\'s current values into local state, and on confirm it saves. The pooja chips are a small controlled set — each chip is on/off, toggling membership in a list of pooja type ids. Keep the form\'s own state local while editing and commit it on confirm (and, as the next section covers, auto-save while typing), so the dialog is a self-contained unit of \'edit one household\'.',
          whyItMatters:
            'This dialog is where essentially all data enters the register — every household name, address, phone and pooja choice. Making the multi-line Kannada textarea comfortable and correctly-fonted, with the mobile and chips alongside, is what turns the mandated modal rule into a form the committee actually enjoys using.',
          steps: [
            'Wrap the form in the reusable `Modal`; receive the entry `id` and an `onClose`.',
            'Load the entry\'s current name, mobile and pooja ids into local form state.',
            'Render a multi-line `<textarea>` for the combined Kannada name/address.',
            'Set the textarea\'s `font-family` to the bundled Kannada font explicitly.',
            'Add a single-line mobile `<input>` (optional) and a row of toggleable pooja chips.',
            'On confirm, save the values (via `window.api.register.updateEntry`) and close.',
          ],
          code: `// src/renderer/components/EditPersonDialog.tsx — the calm Kannada form.
import { useState } from 'react';
import { Modal } from './Modal';

export function EditPersonDialog({ entry, poojas, onSave, onClose }: EditDialogProps) {
  const [name, setName] = useState(entry.name);
  const [mobile, setMobile] = useState(entry.mobile ?? '');
  const [poojaIds, setPoojaIds] = useState<string[]>(entry.poojaIds);

  const toggle = (id: string) =>
    setPoojaIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <Modal onClose={onClose}>
      <h3>Edit household</h3>
      <textarea
        className='kn'
        style={{ fontFamily: 'Noto Sans Kannada, sans-serif' }}
        rows={4}
        value={name}                                  // controlled, IME-friendly
        onChange={(e) => setName(e.target.value)}
        placeholder='ಹೆಸರು ಮತ್ತು ವಿಳಾಸ'
      />
      <input
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        placeholder='Mobile (optional)'
        inputMode='numeric'
      />
      <div className='pooja-chips'>
        {poojas.map((p) => (
          <button
            key={p.id}
            type='button'
            className={poojaIds.includes(p.id) ? 'chip on' : 'chip'}
            onClick={() => toggle(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className='dialog-actions'>
        <button onClick={() => onSave({ name, mobile, poojaIds })}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}`,
          pitfalls: [
            'Using a single-line `<input>` for a multi-line name/address (no room to read it).',
            'Forgetting to set the textarea\'s `font-family`, so editing shows a fallback font.',
            'Not loading the entry\'s current values into form state, so editing starts blank.',
            'Mutating `poojaIds` in place instead of returning a new array when toggling chips.',
            'Reaching for `contentEditable` for the name despite the modal rule.',
            'Letting the dialog own database access directly instead of calling up via `window.api`.',
          ],
          tryIt:
            'Open the dialog for a household, type a two-line Kannada name and address with the IME, toggle two pooja chips on, and save. Reopen it and confirm the text, mobile and chip selections all loaded back correctly.',
          takeaway:
            'EditPersonDialog is a modal form: a Kannada-fonted multi-line `<textarea>` for name/address, an optional mobile input, and toggleable pooja chips — controlled and committed on save.',
        },
        {
          id: 'm6-t7',
          title: 'Controlled Kannada Inputs in React',
          explain:
            'Bind the Kannada fields as **controlled inputs** — `value` from state, `onChange` writing back — so React stays the single source of truth even while the IME composes characters.',
          analogy:
            'A controlled input is like the committee secretary who writes only what is in the agreed minutes: the field on screen always shows exactly what state holds, and every keystroke updates the minutes first. There is never a second, hidden copy of the name drifting out of sync with the book.',
          theory:
            'A **controlled input** in React has its `value` driven by state and an `onChange` that writes each change back to state. For Kannada this is the right model because it keeps **one source of truth** — what you see is exactly what you will save. The textarea and mobile field both follow this pattern: `value={name}` and `onChange={e => setName(e.target.value)}`.\n\nThere is a subtlety with IMEs: typing a Kannada conjunct is a multi-keystroke **composition**, and the browser fires intermediate `change`/`input` events during it. With a plain controlled `<textarea>`, React handles this gracefully — `e.target.value` always reflects the composed text so far, so you can simply store it. (If you ever need to act only on the finished character, the `compositionstart`/`compositionend` events exist, but for storing text you usually do not need them.) This \'just works\' behaviour is another reason the modal + real `<textarea>` beats `contentEditable`, where composition handling is far flakier.\n\nThe practical rules: always provide both `value` and `onChange` (a `value` without `onChange` makes the field read-only and frustrating); update state immutably; and never try to \'reformat\' the Kannada string on every keystroke (e.g. stripping characters), which can fight the IME mid-composition. Store the raw text faithfully and validate or trim only at save time.',
          whyItMatters:
            'Controlled inputs are what let auto-save, validation, and the round-trip test all read the same authoritative value. For Kannada specifically, leaving the input controlled and not interfering during composition is what keeps conjuncts intact — interfering mid-compose is a classic way to corrupt exactly the script this app exists to handle.',
          steps: [
            'Give every editable field a `value` from state and an `onChange` writing back.',
            'Update state immutably (`setName(e.target.value)`, spread for objects).',
            'Do not mutate or reformat the Kannada string on each keystroke.',
            'Trust `e.target.value` to reflect IME composition; store it as-is.',
            'Validate or trim only at save time, not during typing.',
            'If you must detect finished characters, use `compositionend` — rarely needed here.',
          ],
          code: `// Controlled, IME-safe Kannada fields — store the raw composed text.
const [name, setName] = useState(entry.name);

<textarea
  className='kn'
  value={name}                                   // single source of truth
  onChange={(e) => setName(e.target.value)}      // store exactly what the IME composed
  // Do NOT strip/reformat here — that fights the IME mid-composition.
/>;

// Validate only at save time, never on each keystroke:
function isValid(text: string) {
  return text.trim().length > 0;                 // name required (trimmed)
}`,
          pitfalls: [
            'A `value` without an `onChange`, making the field read-only and confusing.',
            'Reformatting/stripping the Kannada string on every keystroke and breaking composition.',
            'Keeping a separate \'display\' copy of the text that drifts from state.',
            'Validating on every keystroke and nagging the user mid-typing.',
            'Mutating object state instead of spreading a new object.',
            'Assuming each keystroke is one character — Kannada conjuncts are multi-keystroke compositions.',
          ],
          tryIt:
            'Type a conjunct like ಪ್ರ slowly via the IME and log `e.target.value` on each change. Watch the value build up correctly without you doing anything special — proof that a controlled textarea handles composition for you.',
          takeaway:
            'Bind Kannada fields as controlled inputs (`value` + `onChange`), store `e.target.value` as-is during IME composition, and validate only at save — never reformat mid-typing.',
        },
      ],
    },
    {
      id: 'm6-s3',
      title: 'Saving, adding, reordering',
      topics: [
        {
          id: 'm6-t8',
          title: 'Adding a Household (and Cleaning Up an Empty One)',
          explain:
            'Add a household by inserting a **blank entry** and opening the edit dialog; if the user cancels while it is still empty, **remove** the stray blank so the register stays clean.',
          analogy:
            'When a new household joins, the committee rules a fresh blank line in the register and starts filling it. But if they get interrupted and the line is left completely empty, they neatly erase it — they do not leave a blank ruled line cluttering the book. The app does the same: a blank entry that is abandoned empty is removed.',
          theory:
            'Adding works in two beats. First, **insert a blank entry** for the chosen Magane/Year and immediately open the EditPersonDialog on it, so the user lands straight in the form ready to type. This is friendlier than a separate \'create\' form — the new row exists and is being edited in one motion.\n\nThe catch is the **abandoned blank**. If the user opens that new entry and then cancels without typing anything, you are left with an empty household in the register. So on cancel you check: was this a freshly-added entry that is still empty (no name)? If so, **delete it** so it never pollutes the data. If they typed something, keep it. This \'insert then maybe clean up\' pattern keeps adding instant without leaving litter.\n\nMechanically: `addEntry` calls the main process to create a blank PersonEntry (returning its new id), you set that id as the one being edited, and your dialog\'s `onClose` is wired to remove the entry if it was newly-added and still blank. Because creation goes through `window.api`, the renderer never touches Prisma directly — it asks the main process, exactly as in earlier modules.',
          whyItMatters:
            'A register full of empty ghost rows is confusing and makes counts wrong. The insert-then-cleanup pattern gives the committee the fast \'add and type\' flow they expect while guaranteeing that an interrupted add leaves no trace — keeping the donor book accurate and tidy.',
          steps: [
            'Add an `addEntry(yearId, maganeId)` that creates a blank PersonEntry via `window.api`.',
            'Capture the returned new entry id and open the EditPersonDialog on it.',
            'Track that this id was just added (so you know to clean up if abandoned).',
            'On cancel/close, if the entry is newly-added AND still has an empty name, delete it.',
            'If the user typed a name, keep the entry as normal.',
            'Keep all creation/deletion in the main process — the renderer calls `window.api`.',
          ],
          code: `// Add a blank household, open it, and clean up if abandoned empty.
async function addEntry(yearId: string, maganeId: string) {
  const created = await window.api.register.addEntry(yearId, maganeId);  // blank row
  setEditingId(created.id);
  setNewlyAddedId(created.id);                 // remember it was just added
}

async function handleDialogClose(entry: { id: string; name: string }) {
  const wasJustAdded = entry.id === newlyAddedId;
  if (wasJustAdded && entry.name.trim() === '') {
    await window.api.register.deleteEntry(entry.id);   // erase the abandoned blank
  }
  setEditingId(null);
  setNewlyAddedId(null);
}`,
          pitfalls: [
            'Leaving abandoned blank entries in the register, skewing household counts.',
            'Deleting an entry the user actually typed into because you only checked \'was added\', not \'still empty\'.',
            'Forgetting to track which id was newly-added, so you cannot tell cleanup apart from a real edit.',
            'Creating the blank row in the renderer with direct DB access instead of via `window.api`.',
            'Not opening the dialog after adding, leaving the user to hunt for the new blank row.',
            'Trimming only on display so a whitespace-only name counts as non-empty and survives.',
          ],
          tryIt:
            'Add a household, then immediately cancel without typing — confirm the blank row disappears. Add another, type one Kannada letter, then cancel — confirm that one stays. The difference is the empty-name check.',
          takeaway:
            'Adding inserts a blank entry and opens its dialog; on cancel, a newly-added entry with an empty name is deleted so no ghost rows litter the register.',
        },
        {
          id: 'm6-t9',
          title: 'Deleting a Household With a Confirm',
          explain:
            'Delete a household only after a **confirmation**, then remove it via `window.api`, so a stray click can never wipe a real record.',
          analogy:
            'Striking a household out of the temple register is serious — the committee would never let one careless pen-stroke erase a family\'s record. They pause and double-check: \'Are you sure you want to remove this household?\' The confirm dialog is that deliberate pause.',
          theory:
            'Deletion is destructive, so it must be **deliberate**. The pattern: the user clicks a delete control, you show a small **confirm** (ideally using the same reusable `Modal` from this section, with the household\'s name shown so they know what they are removing), and only on explicit confirm do you call `window.api.register.deleteEntry(id)`.\n\nShowing **what** is being deleted matters — \'Delete ರಾಮ ಭಟ್ಟರ ಮನೆ?\' is far safer than a generic \'Are you sure?\'. It lets the user catch a mis-click before it is too late. The delete itself happens in the main process via Prisma; the renderer just asks.\n\nAfter a successful delete, update the on-screen list — either optimistically remove it from local state or re-fetch the list for that Magane. Because this is an offline local database, the delete is fast and you can refresh confidently. Pair this with the locked-year guard (Topic 12): if the year is locked, the delete control should be disabled entirely, so a confirm is never even offered for a finalised year.',
          whyItMatters:
            'A donor register is a record the committee relies on year to year; an accidental deletion is a real loss. A confirm that names the household turns deletion from a one-click hazard into a deliberate, reviewable action — protecting the committee\'s data from simple human slips.',
          steps: [
            'Add a delete control on each read-only card/row.',
            'On click, open a confirm modal that shows the household\'s name.',
            'Only on explicit confirm, call `window.api.register.deleteEntry(id)`.',
            'After success, remove it from local state or re-fetch the Magane\'s list.',
            'Disable the delete control entirely when the year is locked.',
            'Keep the actual deletion in the main process (Prisma), not the renderer.',
          ],
          code: `// Delete only after a named confirm; the renderer asks via window.api.
function ConfirmDelete({ entry, onCancel, onConfirm }: ConfirmProps) {
  return (
    <Modal onClose={onCancel}>
      <p>Delete this household?</p>
      <pre className='kn'>{entry.name}</pre>     {/* show WHAT is being deleted */}
      <div className='dialog-actions'>
        <button className='danger' onClick={onConfirm}>Delete</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </Modal>
  );
}

async function confirmDelete(id: string) {
  await window.api.register.deleteEntry(id);    // main process + Prisma
  setEntries((list) => list.filter((e) => e.id !== id));  // refresh the list
}`,
          pitfalls: [
            'Deleting on a single click with no confirm, so a mis-tap wipes a real household.',
            'A generic \'Are you sure?\' that does not show which household — easy to confirm the wrong one.',
            'Calling the delete directly from the renderer\'s DB code instead of `window.api`.',
            'Forgetting to refresh the list, leaving the deleted household on screen.',
            'Offering delete on a locked year that should be read-only.',
            'Mutating the list array in place instead of filtering to a new array.',
          ],
          tryIt:
            'Click delete on a household and confirm the popup shows that household\'s Kannada name. Cancel and verify nothing changes; confirm and verify it disappears from the list. Then lock the year and confirm the delete control is disabled.',
          takeaway:
            'Deletion goes through a confirm modal that names the household, then `window.api.register.deleteEntry`; it is disabled on locked years and refreshes the list after success.',
        },
        {
          id: 'm6-t10',
          title: 'Debounced Auto-Save While Typing',
          explain:
            'Auto-save the edit with a **~600ms debounce** so the register persists as the user types, without hammering the database on every keystroke — and show a small **\'saved\'** indicator.',
          analogy:
            'Imagine the secretary copying a name into the register but only pressing the official stamp once the pen pauses, not after every single letter. Debouncing is that pause-then-stamp: it waits until typing settles for a moment, then saves once — instead of stamping frantically after each stroke.',
          theory:
            '**Debouncing** means: wait until the user has stopped changing something for a set delay, then act once. For auto-save we use about **600ms** — long enough that we are not saving on every keystroke (especially important with multi-keystroke Kannada conjuncts), short enough that the user\'s work is safe within a moment of pausing. You implement it by clearing and re-setting a timer on each change; only when the timer survives 600ms does the save fire.\n\nIn React, the clean way is a `useEffect` keyed on the edited value with a `setTimeout` that calls `window.api.register.updateEntry`, returning a cleanup that clears the timer — so each new keystroke cancels the pending save and starts a fresh countdown. This way many rapid changes collapse into a single save once typing settles.\n\nA small **\'saved\' indicator** closes the loop for the user: show \'Saving…\' while a save is pending/in flight and \'Saved\' once it resolves, so the committee member trusts that their entry is safe without pressing anything. Debounced auto-save is only half the durability story, though — the next topic adds definite saves on confirm and on screen exit, because a debounce timer can be lost if the dialog closes mid-countdown.',
          whyItMatters:
            'Auto-save means a committee member never loses work to a forgotten Save click, and debouncing keeps the local database from being pounded by a save per keystroke. The \'saved\' indicator turns invisible persistence into visible trust — the user sees their Kannada entry is safe as they go.',
          steps: [
            'Hold the edited value(s) in state as controlled inputs.',
            'In a `useEffect` keyed on those values, set a 600ms `setTimeout` to save.',
            'Return a cleanup that clears the timer, so each change restarts the countdown.',
            'In the timer, call `window.api.register.updateEntry(id, values)`.',
            'Track a status (\'idle\' / \'saving\' / \'saved\') and show a small indicator.',
            'Remember a debounce alone can miss the last edit — pair with confirm/exit saves (next topic).',
          ],
          code: `// Debounced auto-save (~600ms) with a small status indicator.
const [name, setName] = useState(entry.name);
const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

useEffect(() => {
  if (name === entry.name) return;             // nothing changed yet
  setStatus('saving');
  const timer = setTimeout(async () => {
    await window.api.register.updateEntry(entry.id, { name });
    setStatus('saved');
  }, 600);                                      // wait for typing to settle
  return () => clearTimeout(timer);             // each keystroke restarts the countdown
}, [name, entry.id, entry.name]);

// <span className='save-status'>{status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : ''}</span>`,
          pitfalls: [
            'Saving on every keystroke (no debounce), hammering the DB during Kannada composition.',
            'Forgetting the cleanup `clearTimeout`, so stale timers fire overlapping saves.',
            'Relying on the debounce alone — a fast close can drop the last pending save.',
            'A debounce so long the user closes before it fires, losing recent edits.',
            'No \'saved\' indicator, so the user keeps hunting for a Save button.',
            'Saving even when nothing changed, writing identical rows repeatedly.',
          ],
          tryIt:
            'Type into the name field and watch the indicator show \'Saving…\' then \'Saved\' about 600ms after you stop. Type continuously for a few seconds and confirm only ONE save fires after you pause, not one per keystroke (log the saves to check).',
          takeaway:
            'Auto-save with a ~600ms debounce (a `setTimeout` cleared on each change) calls `updateEntry` once typing settles, with a \'saved\' indicator — but must be paired with definite saves.',
        },
        {
          id: 'm6-t11',
          title: 'Definite Saves on Confirm and on Screen Exit',
          explain:
            'Back up the debounce with **guaranteed saves**: flush immediately when the user confirms the dialog and when they leave the screen, so no edit is ever lost to a pending timer.',
          analogy:
            'The secretary stamps on the pause (the debounce), but also always stamps before closing the register for the day and before handing it to the next person. Those definite stamps make sure nothing written in the last moment is left un-recorded just because the pen happened to still be moving.',
          theory:
            'A debounce has a gap: if the dialog closes (or the screen unmounts) **during** the 600ms countdown, the pending save can be cancelled by cleanup and the last edit lost. The fix is to add **definite save points** that flush the current value immediately, bypassing the timer.\n\nThe two key moments are **confirm** and **exit**. On the dialog\'s Save/confirm, call `window.api.register.updateEntry` with the current values right away (and cancel any pending debounce so it does not double-save). On **screen exit** — the component unmounting, or the user navigating away from the year/Magane — do a final flush of any unsaved value. In React you do this in a `useEffect` cleanup or an explicit \'before leave\' handler that saves the latest values held in a `ref` (a ref so the cleanup sees the freshest value, not a stale closure).\n\nTogether, debounce + definite saves give a robust policy: the debounce handles the steady stream of typing efficiently, and the confirm/exit flushes guarantee the final state is persisted no matter how the user leaves. This mirrors the app\'s explicit auto-save rule — save on a ~600ms debounce, on dialog confirm, and on screen exit — so the committee\'s data is durable under every exit path.',
          whyItMatters:
            'The most painful data loss is the last thing you typed vanishing because you closed too quickly. Definite saves on confirm and exit close exactly that gap, making the auto-save trustworthy under real, messy usage — the difference between \'usually saves\' and \'always saves\'.',
          steps: [
            'On dialog confirm, call `updateEntry` immediately with the current values.',
            'Cancel any pending debounce timer on confirm so it does not double-save.',
            'Keep the latest values in a `ref` so cleanup reads the freshest, not a stale closure.',
            'In the screen/dialog `useEffect` cleanup, flush any unsaved values on unmount.',
            'Also flush before navigating away from the year/Magane.',
            'Combine with the debounce so typing is efficient but the final state is guaranteed.',
          ],
          code: `// Definite saves: flush on confirm and on screen exit (unmount).
const latest = useRef({ name });
useEffect(() => { latest.current = { name }; }, [name]);

async function flush() {
  await window.api.register.updateEntry(entry.id, latest.current);  // immediate save
}

// On dialog confirm — save now, then close.
async function onConfirm() {
  await flush();
  onClose();
}

// On screen/dialog exit — flush whatever is unsaved (ref sees the freshest value).
useEffect(() => {
  return () => { void flush(); };   // runs on unmount / leaving the screen
}, []);`,
          pitfalls: [
            'Relying only on the debounce, so a quick close drops the last edit.',
            'Reading a stale closure in the unmount cleanup instead of a `ref` with the latest value.',
            'Double-saving because confirm fires while a debounce timer is still pending (cancel it).',
            'Forgetting to flush when navigating between years/Maganes, not just on full unmount.',
            'Awaiting nothing on confirm, so the dialog closes before the save is sent.',
            'Assuming React will \'just save\' on unmount — you must wire the cleanup explicitly.',
          ],
          tryIt:
            'Type a change and immediately press Save (before 600ms) — confirm the edit persists. Then type a change and quickly close/navigate away within the debounce window — reopen and confirm the last edit was still saved by the exit flush.',
          takeaway:
            'Pair the debounce with definite flushes on dialog confirm and on screen exit (using a `ref` for the freshest value) so the last edit is never lost to a cancelled timer.',
        },
        {
          id: 'm6-t12',
          title: 'Validation and the Locked-Year Guard',
          explain:
            'Require a **non-empty name** before saving, and block all edits when the **year is locked** — so finalised registers stay read-only and every saved household has a name.',
          analogy:
            'Once the committee finalises a year\'s register and signs it off, that book is closed — no more entries, no corrections, it is the official record. A locked year is that signed-off book. And just as they would never enter a household with a blank name line, the app refuses to save an entry with no name.',
          theory:
            'Two guards protect the register. **Validation**: the combined name/address field is required, so before saving you check `name.trim().length > 0`. A whitespace-only name does not count. If it is empty you do not save (and, per the add flow, an abandoned empty new entry is removed). Trimming matters because Kannada text with stray spaces should not pass as \'filled\'.\n\nThe **locked-year guard** reflects the domain: years can be **locked** once finalised, after which the register for that year is read-only. So every edit path — opening the dialog, auto-save, add, delete, reorder — must check whether the year is locked and refuse if it is. The cleanest approach is to disable the controls (greyed-out edit/add/delete, no drag handles) so the user cannot even start an edit, and to defend in the save functions too (belt and braces) so a stale UI cannot sneak a write through.\n\nThese guards pair with everything else in the section: add respects the lock (no new blanks on a locked year), delete is disabled, auto-save is suppressed, and reorder is blocked. Enforce the lock both in the UI (disabled controls) and, ideally, in the main process (reject writes for a locked year) so the rule holds even if the renderer is wrong — the same defence-in-depth mindset as validating before an IPC save.',
          whyItMatters:
            'A finalised year is the temple\'s official record; allowing edits would undermine its integrity. The locked-year guard makes \'finalised\' actually mean something, and the name-required rule keeps every household identifiable — together they keep the register both trustworthy and complete.',
          steps: [
            'Validate the name with `name.trim().length > 0` before any save.',
            'Refuse to save (and clean up abandoned blanks) when the name is empty.',
            'Read whether the current year is locked from the year\'s state.',
            'When locked, disable edit/add/delete controls and drag handles in the UI.',
            'Also guard the save/add/delete/reorder functions against a locked year (belt and braces).',
            'Ideally reject writes for a locked year in the main process too.',
          ],
          code: `// Name required + locked-year guard, enforced in the UI and the save path.
function nameIsValid(name: string) {
  return name.trim().length > 0;                 // whitespace-only is NOT valid
}

async function saveEntry(yearLocked: boolean, id: string, values: EntryValues) {
  if (yearLocked) return;                        // finalised year is read-only
  if (!nameIsValid(values.name)) return;         // every household needs a name
  await window.api.register.updateEntry(id, values);
}

// In the UI, disable controls entirely when the year is locked:
// <button disabled={yearLocked} onClick={() => addEntry(yearId, maganeId)}>Add household</button>
// <button disabled={yearLocked} onClick={() => askDelete(entry)}>Delete</button>`,
          pitfalls: [
            'Allowing a save with an empty (or whitespace-only) name, creating an unidentifiable household.',
            'Guarding the lock only in the UI, so a stale screen can still write to a locked year.',
            'Forgetting to block one path (e.g. reorder or auto-save) on a locked year.',
            'Checking `name.length` instead of `name.trim().length`, so spaces pass as filled.',
            'Not visibly disabling controls, so the user tries to edit a locked year and is confused.',
            'Locking in the renderer only, never enforcing it in the main process.',
          ],
          tryIt:
            'Try to save a household with only spaces in the name — it should refuse. Then lock the year and confirm the Add, Delete and edit controls are all disabled and dragging does nothing.',
          takeaway:
            'Require a trimmed non-empty name and block every edit path on a locked year — enforced by disabled UI controls and re-checked in the save functions (and ideally the main process).',
        },
        {
          id: 'm6-t13',
          title: 'Drag-to-Reorder Households and Persisting the Order',
          explain:
            'Let the user **drag households into order** within a Magane and persist the new sequence with `window.api.register.reorder(yearId, maganeId, orderedIds)`.',
          analogy:
            'Within a Magane (a neighbourhood ward), the committee likes the households listed in a particular order — by lane, by seniority, however they have always done it. Dragging a card up or down is like physically re-pinning the slips on the notice board into the right sequence, and `reorder` is writing that final order back into the book so it sticks.',
          theory:
            'Households belong to a **Magane** and have a display order within it. Drag-to-reorder lets the user rearrange them directly: pick up a card, drop it in a new position, and the list re-sequences. While dragging you update **local state** so the UI feels instant — the array of entries is reordered immediately on drop.\n\nOnce the drop settles, you **persist** the new order by sending the ordered list of ids to the main process: `window.api.register.reorder(yearId, maganeId, orderedIds)`. Passing the full ordered id list (rather than \'move item from index 3 to 1\') is robust and simple — the main process writes a position/order field for each entry to match the array. Because it is a local database the write is fast, and on reload the saved order is what you read back.\n\nTwo cautions. First, respect the **locked-year guard**: if the year is locked, dragging must be disabled (no handles, no drop), since reorder is an edit. Second, keep the **optimistic** local reorder and the persisted order in sync — update state on drop, fire `reorder`, and if it ever failed you would re-fetch to correct the UI. For the drag interaction itself you can use the HTML5 drag events or a small library; what matters for this module is the persistence contract through `window.api.register.reorder`.',
          whyItMatters:
            'The committee\'s register has a meaningful order — losing it would make the book harder to read aloud and reconcile against tradition. Drag-to-reorder with a clean `reorder` persistence call lets them arrange households naturally and trust the order is saved, all while honouring the locked-year rule.',
          steps: [
            'Make each household card draggable within its Magane (disabled when the year is locked).',
            'On drop, reorder the local entries array so the UI updates instantly.',
            'Build the new `orderedIds` from the reordered array.',
            'Persist with `window.api.register.reorder(yearId, maganeId, orderedIds)`.',
            'Have the main process write each entry\'s order to match the id list.',
            'On reload, read entries back in the saved order; re-fetch if a reorder ever fails.',
          ],
          code: `// Reorder locally for instant feedback, then persist the ordered ids.
function moveEntry(from: number, to: number) {
  setEntries((list) => {
    const next = [...list];
    const [moved] = next.splice(from, 1);        // take the dragged item out
    next.splice(to, 0, moved);                   // drop it at the new position
    persistOrder(next);                          // save the new sequence
    return next;
  });
}

async function persistOrder(ordered: PersonEntry[]) {
  if (yearLocked) return;                        // reorder is an edit — blocked when locked
  const orderedIds = ordered.map((e) => e.id);
  await window.api.register.reorder(yearId, maganeId, orderedIds);  // persist the sequence
}`,
          pitfalls: [
            'Persisting a \'from/to index\' instead of the full ordered id list (fragile across edits).',
            'Updating the server order but not local state (or vice versa), so the UI and DB disagree.',
            'Allowing drag on a locked year, sneaking an edit past the guard.',
            'Mutating the entries array in place during the move instead of building a new array.',
            'Reordering across different Maganes by accident — keep reorder scoped to one Magane.',
            'Forgetting to read entries back in the saved order on reload, so the order looks un-persisted.',
          ],
          tryIt:
            'Drag a household from the bottom of a Magane to the top, then reload the screen — the new order should persist. Lock the year and confirm dragging is disabled. Log the `orderedIds` sent to `reorder` to see the exact sequence saved.',
          takeaway:
            'Drag-to-reorder updates local state instantly, then persists the full ordered id list via `window.api.register.reorder(yearId, maganeId, orderedIds)` — and is disabled on locked years.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm6-p1',
      type: 'Project',
      title: 'Kannada Edit Popup',
      domain: 'Village temple register / Electron + React + TypeScript + Prisma + local PostgreSQL',
      duration: '4 hours',
      description:
        'Build the heart of Kannada data entry for Upralli Seva: a reusable Modal and an EditPersonDialog with a multi-line Kannada name/address textarea in the bundled Noto Sans Kannada font, an optional mobile field, and toggleable pooja chips. Read-only cards open this dialog, which saves through window.api.register.updateEntry — honouring the app\'s rule that text is edited in a popup, never inline.',
      tools: ['Electron', 'React 18', 'TypeScript', 'Prisma', 'PostgreSQL', 'Noto Sans Kannada', 'contextBridge / IPC'],
      blueprint: {
        overview:
          'Stand up the bundled Kannada font and the mandated modal edit flow: a reusable Modal (overlay, focus trap, Escape) wrapping an EditPersonDialog whose controlled, Kannada-fonted textarea, mobile input and pooja chips save via window.api.register.updateEntry, with read-only cards as the only way to open it.',
        functionalRequirements: [
          '**Bundled font.** Noto Sans Kannada shipped as a TTF and applied via `@font-face` to the body and all inputs, so Kannada renders on any machine.',
          '**Reusable Modal.** An overlay that closes on outside click, focus moved into and trapped within the dialog, and Escape-to-close with listener cleanup.',
          '**EditPersonDialog.** A multi-line `<textarea>` for the combined Kannada name/address (bundled font), an optional mobile input, and toggleable pooja chips.',
          '**Read-only opens edit.** Grid cards/rows display the entry as read-only and open the dialog on click — never inline `contentEditable`.',
          '**Save via window.api.** Confirming the dialog calls `window.api.register.updateEntry(id, values)`; the renderer never touches Prisma directly.',
        ],
        technicalImplementation: [
          '**Font load.** `@font-face` referencing a bundled TTF that resolves in the packaged build, with `font-family` set on `body`, `input` and `textarea`.',
          '**Modal.** A `Modal` taking `children` + `onClose`; `useEffect` focuses the dialog, listens for Escape, and cleans up; clicks inside `stopPropagation`.',
          '**Controlled inputs.** `value`/`onChange` for the textarea and mobile; pooja chips toggle an immutable id array; store `e.target.value` as-is for IME safety.',
          '**Read/edit split.** A `PersonCard` (read-only) with `onEdit`, and an `editingId` state that mounts `EditPersonDialog` for that entry.',
          '**IPC save.** `window.api.register.updateEntry` exposed via contextBridge; the main process runs Prisma over UTF-8 Postgres.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Bundle the Kannada font + reusable Modal',
            outcome: 'Kannada renders from a bundled font, and a reusable accessible modal is ready.',
            prompt:
              'In an Electron + React 18 + TypeScript (Vite) renderer, bundle Noto Sans Kannada: add NotoSansKannada-Regular.ttf under assets/fonts and declare an @font-face for font-family \'Noto Sans Kannada\', then set font-family on body, input and textarea so the path resolves in the packaged build too. Then build a reusable Modal.tsx taking children and onClose: render a dimmed overlay that closes on outside click (stopPropagation on the inner dialog), move focus into the dialog via a ref on mount, add a keydown listener that calls onClose on Escape and remove it on unmount, and set role=\'dialog\' aria-modal.',
          },
          {
            step: 2,
            label: 'EditPersonDialog with Kannada textarea + chips',
            outcome: 'A modal form to edit one household\'s Kannada name/address, mobile and poojas.',
            prompt:
              'Build EditPersonDialog.tsx wrapped in the Modal. Load the entry\'s current name, mobile and pooja ids into local state. Render a multi-line <textarea> for the combined Kannada name/address with style fontFamily \'Noto Sans Kannada, sans-serif\', controlled via value/onChange storing e.target.value as-is (IME-safe, no reformatting). Add an optional mobile <input> with inputMode numeric, and a row of pooja chips that toggle membership in an immutable poojaIds array. Add Save and Cancel buttons; Save calls an onSave({ name, mobile, poojaIds }) prop.',
          },
          {
            step: 3,
            label: 'Read-only cards that open the dialog + save via IPC',
            outcome: 'Clicking a read-only card opens the dialog and saving persists over IPC.',
            prompt:
              'Build a read-only PersonCard that displays entry.name in a <pre className=\'kn\'> and mobile, and calls onEdit on click (no contentEditable anywhere). In the parent, hold an editingId; clicking a card sets it and mounts EditPersonDialog for that entry. Wire the dialog\'s onSave to call window.api.register.updateEntry(id, values), exposed via contextBridge in preload so the renderer never imports Prisma. Verify a Kannada name typed via the OS IME saves and reloads correctly (round-trip).',
          },
        ],
        deliverable:
          'A working Kannada edit flow: a bundled Noto Sans Kannada font, a reusable accessible Modal, an EditPersonDialog with a Kannada-fonted multi-line textarea, mobile field and pooja chips, opened from read-only cards and saving through window.api.register.updateEntry.',
      },
    },
    {
      id: 'm6-p2',
      type: 'Project',
      title: 'Add, Delete & Reorder',
      domain: 'Village temple register / Electron + React + TypeScript + Prisma + local PostgreSQL',
      duration: '4 hours',
      description:
        'Complete household management for Upralli Seva: add a household (insert a blank entry and open it, removing it if cancelled empty), delete with a named confirm, debounced auto-save (~600ms) plus definite saves on confirm and screen exit, and drag-to-reorder persisted through window.api.register.reorder — with every edit path disabled when the year is locked.',
      tools: ['Electron', 'React 18', 'TypeScript', 'Prisma', 'PostgreSQL', 'contextBridge / IPC'],
      blueprint: {
        overview:
          'Wire the register\'s lifecycle operations: add-then-cleanup, confirmed delete, robust auto-save (debounce + confirm/exit flush) and drag-to-reorder via register.reorder, all guarded by validation (name required) and the locked-year rule so a finalised register stays read-only.',
        functionalRequirements: [
          '**Add household.** Insert a blank entry and open its dialog; if cancelled while still empty, delete the stray blank.',
          '**Delete with confirm.** A confirm modal that shows the household\'s name; only then `window.api.register.deleteEntry`, with the list refreshed.',
          '**Debounced auto-save.** Save ~600ms after typing settles, with a small \'saved\' indicator, plus definite flushes on dialog confirm and on screen exit.',
          '**Drag-to-reorder.** Rearrange households within a Magane and persist the ordered id list via `window.api.register.reorder(yearId, maganeId, orderedIds)`.',
          '**Locked-year guard.** Validation requires a non-empty trimmed name, and add/delete/auto-save/reorder are all disabled when the year is locked.',
        ],
        technicalImplementation: [
          '**Add/cleanup.** `addEntry` creates a blank row via `window.api`, opens its dialog, tracks the new id, and deletes it on close if the name is still empty.',
          '**Confirmed delete.** A `ConfirmDelete` modal (reusing Modal) showing the name; on confirm, `deleteEntry` then `filter` the list to a new array.',
          '**Auto-save.** A `useEffect` with a 600ms `setTimeout` (cleared on each change) calling `updateEntry`; a `ref` holds latest values for confirm/unmount flushes.',
          '**Reorder.** On drop, reorder the local array immutably then call `register.reorder` with the full `orderedIds`; re-fetch if it fails.',
          '**Guards.** `name.trim().length > 0` before save; `if (yearLocked) return;` in save/add/delete/reorder plus disabled controls in the UI.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Add-then-cleanup + confirmed delete',
            outcome: 'Adding opens a blank entry; abandoned blanks vanish; delete is confirmed and named.',
            prompt:
              'In the register screen, add addEntry(yearId, maganeId) that calls window.api.register.addEntry to create a blank PersonEntry, captures the returned id, opens EditPersonDialog on it, and records it as newlyAddedId. On dialog close, if the entry was newly added AND its name.trim() is empty, call window.api.register.deleteEntry to remove the stray blank; otherwise keep it. Then add a ConfirmDelete modal (reusing the Modal component) that shows the household\'s Kannada name; only on confirm call window.api.register.deleteEntry(id) and filter it out of local state. Disable Add and Delete when the year is locked.',
          },
          {
            step: 2,
            label: 'Debounced auto-save + definite flushes',
            outcome: 'Edits save ~600ms after typing and are guaranteed on confirm and exit.',
            prompt:
              'In EditPersonDialog, add debounced auto-save: a useEffect keyed on the edited values sets a 600ms setTimeout that calls window.api.register.updateEntry(id, values) and returns a cleanup clearing the timer, with a status state showing \'Saving…\'/\'Saved\'. Keep the latest values in a ref. Add a flush() that saves immediately; call it on dialog confirm (then close) and in an unmount useEffect cleanup so leaving the screen during the debounce window still saves. Guard all saves with name.trim().length > 0 and skip saving when the year is locked.',
          },
          {
            step: 3,
            label: 'Drag-to-reorder persisted via register.reorder',
            outcome: 'Households reorder within a Magane and the new order persists across reloads.',
            prompt:
              'Make each household card draggable within its Magane (drag disabled when the year is locked). On drop, reorder the local entries array immutably with splice on a copy so the UI updates instantly, build orderedIds from the new array, and call window.api.register.reorder(yearId, maganeId, orderedIds) to persist; the main process writes each entry\'s order to match. On reload, read entries back in the saved order, and re-fetch to correct the UI if a reorder call fails. Confirm dragging does nothing on a locked year.',
          },
        ],
        deliverable:
          'Complete household management: add-then-cleanup, a named delete confirm, debounced auto-save with confirm/exit flushes and a saved indicator, and drag-to-reorder persisted through window.api.register.reorder — all disabled when the year is locked.',
      },
    },
  ],
  quiz: [
    {
      id: 'm6-q1',
      q: 'Kannada household names show as \'?????\' boxes on the committee\'s machine. What is the most likely cause?',
      options: [
        'React cannot render non-Latin characters',
        'One hop in the UTF-8 chain is misconfigured (e.g. the database was not created with --encoding=UTF8), or no Kannada font is present',
        'Prisma does not support Kannada',
        'The mobile field is too long',
      ],
      answer: 1,
    },
    {
      id: 'm6-q2',
      q: 'Why is Noto Sans Kannada bundled as a TTF inside the app rather than relying on the OS?',
      options: [
        'Bundled fonts load faster than system fonts',
        'So Kannada renders correctly — including virama conjuncts — even on a machine with no Kannada font installed',
        'Because Electron forbids using system fonts',
        'To make the app file size larger on purpose',
      ],
      answer: 1,
    },
    {
      id: 'm6-q3',
      q: 'What is the app\'s critical UX rule for editing a household\'s Kannada text?',
      options: [
        'Edit it inline with contentEditable directly in the grid cell',
        'Open a modal popup with a real <textarea> (OS IME) — never inline contentEditable',
        'Only allow editing through a separate command-line tool',
        'Edit it by re-typing the whole register from scratch',
      ],
      answer: 1,
    },
    {
      id: 'm6-q4',
      q: 'A Kannada value looks like mojibake when pasted into a terminal, but the round-trip assert (saved === typed) passes. What should you conclude?',
      options: [
        'The database is corrupting the data and must be reset',
        'The stored bytes are fine — the display is lying; trust the bytes, not the terminal',
        'Prisma saved a different value than React sent',
        'The font is wrong and the data is lost',
      ],
      answer: 1,
    },
    {
      id: 'm6-q5',
      q: 'Why pair the ~600ms debounced auto-save with definite saves on dialog confirm and screen exit?',
      options: [
        'To save the same data three times for redundancy',
        'Because a debounce timer can be cancelled if the dialog closes mid-countdown, losing the last edit',
        'Because Prisma requires three save calls per write',
        'To make the \'saved\' indicator blink faster',
      ],
      answer: 1,
    },
    {
      id: 'm6-q6',
      q: 'How is drag-to-reorder of households within a Magane persisted, and when is it blocked?',
      options: [
        'By saving a from/to index pair; it is never blocked',
        'By sending the full ordered id list to window.api.register.reorder(yearId, maganeId, orderedIds); blocked when the year is locked',
        'By editing the database file directly from the renderer',
        'By re-typing the order into a text box; blocked only on weekends',
      ],
      answer: 1,
    },
  ],
};
