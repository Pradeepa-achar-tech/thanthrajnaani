// Module 6 — UI Development: Building KalaKaara's Interface
// KalaKaara (React + Supabase) course content for the React course player.
// Plain CSS + CSS Modules only. No Tailwind anywhere.

export const m6 = {
  id: 'm6',
  title: 'UI Development — Building KalaKaara\'s Interface',
  hours: 7,
  color: 'from-rose-500/20 to-rose-700/10',
  accent: 'rose',
  description:
    'Turn the wireframes from Module 0 into a real, responsive component library — with a modern CSS reset, design tokens as custom properties, and CSS Modules for scoped styles. You build the Navbar, Hero, ArtistCard, ArtworkCard, RatingStars, chips, badges, footer, skeletons, empty and error states, then make the whole thing work at 360, 768 and 1280 pixels, keyboard-navigable, and passing a Lighthouse accessibility check. No Tailwind: you learn responsive design from the box model up.',
  sections: [
    {
      id: 'm6-s1',
      title: 'CSS foundations for a real app',
      topics: [
        {
          id: 'm6-t1',
          title: 'A modern CSS reset, and box-sizing: border-box on everything',
          explain:
            'A reset erases the inconsistent defaults every browser ships so that a padding you set is the padding you get, on every device.',
          analogy:
            'Before a Yakshagana troupe performs, they sweep the temple courtyard flat and mark fresh lines in chalk. They do not perform on top of yesterday\'s footprints and half-erased markings. A CSS reset is that sweep: browsers arrive with decades of inherited margins on headings, bullets on lists, and underlines on links, and you want a clean, known floor before you lay down your own design.',
          theory:
            'Every browser applies a **user-agent stylesheet** before your CSS runs. It puts a top and bottom margin on every `<h1>` and `<p>`, indents `<ul>`, underlines `<a>`, and — most importantly — sizes elements with `box-sizing: content-box`, where `width` means only the content and any `padding` and `border` are *added on top*. Set a card to `width: 300px; padding: 20px` under `content-box` and it renders **340px** wide. That off-by-the-padding surprise is the single most common layout bug beginners hit.\n\nThe fix is one rule applied to everything: `*, *::before, *::after { box-sizing: border-box; }`. Now `width` means the *total* width — padding and border are drawn **inside** it. A 300px card with 20px padding is 300px wide, full stop. This is non-negotiable because every layout calculation you do — grid tracks, flexbox basis, the `100%` of a child — becomes predictable. You stop fighting the box and start using it.\n\nA modern reset does three more things. It sets `margin: 0` on the body and on the block elements that ship with surprise margins (headings, paragraphs, lists), so vertical spacing comes from *your* tokens and never from a default you forgot about. It makes images behave — `img { display: block; max-width: 100%; }` — so an image never overflows its container and never leaves the mysterious few-pixel gap that inline images have below them. And it makes form elements inherit the page font, because `<button>` and `<input>` default to some ancient system font that never matches your body text.\n\nWhat a reset does **not** do is style anything. It removes defaults; it does not add opinions. That is the difference between a *reset* (Josh Comeau\'s, or a hand-rolled one like ours) and a *normalize* (which keeps sensible defaults and only smooths cross-browser differences). For a course that teaches CSS from scratch, a reset is the honest choice: nothing is styled until you style it, so you can see exactly what each rule of yours does.\n\nOne subtle line worth keeping: `line-height: 1.5` on the body and `-webkit-font-smoothing: antialiased` for crisper text on Mac displays. And `h1, h2, h3 { line-height: 1.1; }`, because headings look wrong at body line-height. These are the smallest set of opinions that make un-styled HTML already look deliberate.',
          diagram: `graph TD
    A[Same CSS: width 300px, padding 20px] --> B{box-sizing?}
    B -- content-box default --> C[Rendered width = 300 + 20 + 20 = 340px<br/>padding pushes the box WIDER]
    B -- border-box our reset --> D[Rendered width = 300px<br/>padding drawn INSIDE the 300]
    C --> E[Grid tracks overflow, 100% children spill]
    D --> F[Every width is the width you typed]`,
          flowExplain:
            'The left branch is why an untouched project has mysterious horizontal scrollbars; the right branch — one reset rule — makes width mean total width, so grid and flexbox maths finally add up.',
          whyItMatters:
            'Interviewers ask "what does box-sizing: border-box do?" precisely because it separates people who have fought real layouts from people who have only followed tutorials. Getting the reset right on line one of the CSS is also what stops an entire class of "why is there a horizontal scrollbar" bugs before they exist.',
          steps: [
            'Create `src/styles/reset.css` and import it once, first, in `src/main.jsx` so it loads before any component styles.',
            'Put the universal `box-sizing: border-box` rule at the very top, applied to `*, *::before, *::after`.',
            'Zero the margins on body, headings, paragraphs, and lists so spacing comes only from your tokens.',
            'Make images block-level with `max-width: 100%` and give form controls `font: inherit`.',
            'Open the page with no other CSS and confirm it looks plain but sane — no overflow, no giant heading margins.',
          ],
          code: `/* src/styles/reset.css  — load this FIRST, before any component CSS */

/* 1. The non-negotiable line. width now means total width, everywhere. */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* 2. Remove default margins the browser sneaks onto block elements. */
* {
  margin: 0;
}

/* 3. Sensible body defaults. Spacing comes from tokens, not from here. */
html {
  -webkit-text-size-adjust: 100%; /* stop iOS auto-inflating text */
}
body {
  min-height: 100vh;
  line-height: 1.5;               /* readable body text */
  -webkit-font-smoothing: antialiased;
}

/* 4. Headings look wrong at body line-height. */
h1, h2, h3, h4 {
  line-height: 1.1;
  text-wrap: balance;             /* modern: avoids one lonely word on line 2 */
}

/* 5. Media elements behave: block-level, never overflow their box. */
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

/* 6. Form controls should inherit the page font, not a system default. */
input, button, textarea, select {
  font: inherit;
}

/* 7. Long words break instead of forcing a horizontal scrollbar. */
p, h1, h2, h3, h4 {
  overflow-wrap: break-word;
}`,
          pitfalls: [
            '**Setting box-sizing on `body` and expecting children to inherit it.** `box-sizing` does not inherit by default, so only the body changes and every card is still content-box. Fix: apply it to `*, *::before, *::after`, not to a single element.',
            '**Loading the reset after component styles.** Then the reset\'s `margin: 0` overrides the margins your components set, and everything collapses together. Fix: import `reset.css` first in `main.jsx`, before any `.module.css` or `global.css`.',
            '**Copying a giant reset you do not understand.** A 300-line reset you cannot read hides bugs. Fix: use a small reset whose every line you can explain — the seven blocks above are enough for this whole course.',
            '**Leaving images inline.** An inline `<img>` sits on the text baseline and leaves a few px gap below it that looks like a broken margin. Fix: `img { display: block }` in the reset kills that gap once, everywhere.',
            '**Confusing a reset with a theme.** The reset must not set colours or fonts-as-design. Fix: keep colour and type choices in `tokens.css` and `global.css`; the reset only removes, it never decorates.',
          ],
          tryIt:
            'Temporarily add `outline: 1px solid red` to the `*` selector and load any page. Every box\'s true size becomes visible. Now toggle `box-sizing` between `content-box` and `border-box` on a padded card and watch the red outline jump wider by exactly twice the padding. Remove the outline when you are done.',
          takeaway:
            'A reset sweeps the courtyard clean; `box-sizing: border-box` on everything makes width mean total width, which makes every later layout calculation predictable.',
        },
        {
          id: 'm6-t2',
          title: 'Design tokens as CSS custom properties',
          explain:
            'A design token is a named CSS variable — a colour, a spacing step, a radius — so you write `var(--space-4)` once and change the whole app from one file.',
          analogy:
            'A temple kitchen does not measure rice in random handfuls. It uses one standard tumbler, and every recipe says "two tumblers of rice, one of dal." When the cook changes the tumbler, every dish scales together and nothing looks out of proportion. Design tokens are that tumbler: `--space-4` is your standard measure, and when you decide the app should breathe more, you change the measure, not four hundred `margin: 17px` scattered everywhere.',
          theory:
            'A **CSS custom property** is a variable you declare with a `--` prefix and read with `var()`. Declared on `:root`, it is available to the entire document. The reason to build your design on tokens rather than raw values is consistency and change-cost. `margin: 17px` is a decision made once and forgotten; when the next component uses `16px` and the one after uses `18px`, the app slowly turns into visual noise that reads as "made by an amateur." A **spacing scale** — a small fixed set of steps — removes the choice: you are never picking a number, you are picking a step.\n\nThe scale should be **rhythmic**, not linear-by-one. A 4px base doubling and stepping — 4, 8, 12, 16, 24, 32, 48, 64 — gives you enough steps to be expressive and few enough that things stay aligned. `--space-4` meaning 16px (four times the 4px base) is the everyday gap; `--space-2` (8px) is tight; `--space-8` (32px) separates sections. Because everything is a multiple of 4, elements line up on an invisible grid without you thinking about it.\n\nThe same discipline applies to the other axes. A **colour scale** gives each hue numbered steps (50 lightest to 900 darkest) so you reach for `--terracotta-600` for a button and `--terracotta-50` for its faint hover background, and they are guaranteed to belong to the same family. **Radii**, **shadows**, **font sizes**, and a **z-index scale** all become named steps for the same reason: no magic numbers, and one place to tune the feel of the entire product.\n\nThe **z-index scale** deserves special mention because z-index chaos is a rite of passage. When everyone writes `z-index: 9999` to win, nothing has a predictable stacking order. A named ladder — `--z-nav: 100`, `--z-drawer: 200`, `--z-modal: 300`, `--z-toast: 400` — means the drawer is *always* above the nav and *always* below a modal, by design, and you never type `99999` again.\n\nFor KalaKaara the accent is a warm **terracotta** (`#c2410c`), which suits an art marketplace: it reads as clay, earth, and handmade craft rather than the cold blue of a fintech dashboard. Below is the full token file. Notice it is *only* declarations — no component knows these numbers; they only know the names.',
          diagram: `graph TD
    T[tokens.css on :root] --> C[Colour scale<br/>terracotta 50..900, neutrals]
    T --> S[Spacing scale<br/>4px base: space-1..space-16]
    T --> R[Radii<br/>sm md lg full]
    T --> SH[Shadows<br/>sm md lg]
    T --> F[Font sizes<br/>fs-sm..fs-3xl]
    T --> Z[Z-index ladder<br/>nav drawer modal toast]
    C --> U[Every component reads var --token]
    S --> U
    R --> U
    U --> ONE[Change the token, change the whole app]`,
          flowExplain:
            'Nothing downstream hardcodes a value — every component reads a named token — so the arrow at the bottom is real: one edit in `tokens.css` re-skins the entire product.',
          whyItMatters:
            'Design tokens are how real teams keep a large app visually coherent and how they ship a dark mode or a rebrand in an afternoon. In an interview, "we used CSS custom properties as design tokens for spacing, colour and z-index" signals you have worked on something bigger than a single page.',
          steps: [
            'Create `src/styles/tokens.css` and declare every token on `:root`.',
            'Build the spacing scale on a 4px base so every value is a multiple of 4 and elements self-align.',
            'Give colours numbered steps (50–900) per hue so hovers and borders stay in the same family.',
            'Add a named z-index ladder so stacking order is a decision, not a bidding war of 9999s.',
            'Import `tokens.css` right after the reset, and from now on never type a raw px value for spacing again.',
          ],
          code: `/* src/styles/tokens.css  — the single source of truth for the look */
:root {
  /* ---- Colour: warm terracotta accent for an art marketplace ---- */
  --terracotta-50:  #fff7ed;
  --terracotta-100: #ffedd5;
  --terracotta-200: #fed7aa;
  --terracotta-500: #f97316;
  --terracotta-600: #ea580c;
  --terracotta-700: #c2410c;   /* the brand accent */
  --terracotta-900: #7c2d12;

  --accent:      var(--terracotta-700);
  --accent-hover: var(--terracotta-600);

  /* Neutrals for text, borders, surfaces */
  --ink-900: #1c1917;   /* headings */
  --ink-700: #44403c;   /* body text */
  --ink-500: #78716c;   /* muted / captions */
  --line:    #e7e5e4;   /* hairline borders */
  --surface: #ffffff;
  --surface-2: #fafaf9; /* page background */

  /* ---- Spacing: 4px base. Never write margin: 17px again. ---- */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;   /* the everyday gap */
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* ---- Radii ---- */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* ---- Shadows ---- */
  --shadow-sm: 0 1px 2px rgba(28, 25, 23, 0.06);
  --shadow-md: 0 4px 12px rgba(28, 25, 23, 0.08);
  --shadow-lg: 0 12px 32px rgba(28, 25, 23, 0.12);

  /* ---- Font sizes (fluid type comes in Section 3) ---- */
  --fs-sm:  0.875rem;
  --fs-base: 1rem;
  --fs-lg:  1.125rem;
  --fs-xl:  1.5rem;
  --fs-2xl: 2rem;
  --fs-3xl: 2.5rem;

  /* ---- Z-index ladder: stacking order is a decision, not a war ---- */
  --z-nav:    100;
  --z-drawer: 200;
  --z-modal:  300;
  --z-toast:  400;
}`,
          pitfalls: [
            '**Inventing a value inline instead of reaching for a token.** One `padding: 15px` among a sea of `var(--space-4)` is the visual equivalent of a wrong note. Fix: if you need a value that is not in the scale, add a token — do not hardcode.',
            '**Building a linear scale (4, 8, 12, 16, 20, 24...).** Too many similar steps and you still agonise over which to use. Fix: step and double (4, 8, 12, 16, 24, 32, 48, 64) so each step is visibly different from its neighbour.',
            '**Putting z-index values in components ad hoc.** The drawer ends up below the nav and you patch it with 9999. Fix: define a `--z-*` ladder once; components only reference the ladder.',
            '**Defining tokens but then not using them in the components.** Tokens you route around are decoration. Fix: grep your `.module.css` files for raw hex codes and px spacing — every hit is a token you forgot to use.',
            '**Naming colours by their appearance (`--orange`) instead of their role (`--accent`).** When the brand changes to green, `--orange: green` is a lie. Fix: keep a raw palette (`--terracotta-700`) and semantic aliases (`--accent`) that point at it; components use the semantic name.',
          ],
          tryIt:
            'Change `--accent` from `var(--terracotta-700)` to `var(--terracotta-500)` and reload. Every button, link, and active chip in the app shifts to the lighter orange at once, because none of them hardcoded the colour. That one-line re-skin is the entire argument for tokens.',
          takeaway:
            'Tokens turn a thousand scattered magic numbers into a handful of named decisions — `var(--space-4)` beats `margin: 17px` because you can change the whole app from one file.',
        },
        {
          id: 'm6-t3',
          title: 'CSS Modules — scoped styles without Tailwind',
          explain:
            'A CSS Module is a normal `.css` file whose class names are automatically made unique at build time, so `.title` in one component can never collide with `.title` in another.',
          analogy:
            'At the Kundapura santhe every vendor shouts "fresh, cheap, best!" — and because everyone uses the same words, the words mean nothing and buyers get confused. CSS Modules is the santhe committee stamping each vendor\'s crates with a unique stall number. Two vendors can both write "fresh" on their crates because the stamp — `ArtistCard_title__x7f2a` — keeps them apart. You write plain, readable class names; the build guarantees they never clash.',
          theory:
            'Global CSS has one fatal flaw at scale: the **namespace is shared**. Write `.card` in `Navbar.css` and `.card` in `ArtistCard.css`, import both, and the second silently overrides the first. As an app grows, you get scared to touch any CSS because you do not know what else uses that class. Teams paper over this with naming conventions like BEM (`.artist-card__title--featured`), which work but are verbose and rely on discipline no tooling enforces.\n\n**CSS Modules** solve it mechanically. You name the file `ArtistCard.module.css`, write ordinary CSS with short names like `.title`, and import it as an object: `import styles from \'./ArtistCard.module.css\'`. At build time Vite rewrites every class to a unique hash — `.title` becomes `.ArtistCard_title__x7f2a` in the output — and `styles.title` is the string `"ArtistCard_title__x7f2a"`. You use it as `className={styles.title}`. Because the hash includes the file name and a content hash, `.title` in two different modules produce two different real classes. Collisions become **impossible**, not merely unlikely.\n\nCSS Modules also give you `composes`: `.primaryButton { composes: buttonBase; background: var(--accent); }` pulls in every declaration from `.buttonBase` (in the same file, or `composes: buttonBase from \'./shared.module.css\'`). It is inheritance for CSS classes, and it keeps a button variant DRY without a preprocessor.\n\nNot everything belongs in a module. Truly global things — the reset, the tokens on `:root`, base `body`/`a`/`h1` styling, and utility classes you genuinely want everywhere — belong in a plain `global.css` imported once. The rule of thumb: **if a style is about one component, it goes in that component\'s module; if it is about the whole document, it goes in global.css.** Element selectors that you want scoped (like styling every `<img>` inside a card) work fine inside a module too, because the module wraps them under a hashed parent.\n\nWhy CSS Modules for *this* course, honestly, against the two obvious alternatives? **Tailwind** puts utility classes in your JSX (`class="flex gap-4 rounded-lg"`); it is fast for people who already know CSS, but it *hides* the CSS behind class-name abbreviations, so a learner never writes `display: flex` or learns what `gap` actually does — which defeats the purpose of a module that teaches CSS from scratch, and the KalaKaara brief forbids it outright. **styled-components** writes CSS inside JS template literals; it is ergonomic but ships a runtime, re-computes styles during render, and blurs the line between markup and styling for a beginner. **CSS Modules** is the middle path: you write real, standard CSS in real `.css` files — every property is exactly what MDN documents — and the only magic is that the class names are made safe. You learn CSS, not a framework\'s dialect of it.',
          diagram: `graph LR
    A["ArtistCard.module.css<br/>.title { ... }"] --> B[Vite build]
    B --> C["Output CSS:<br/>.ArtistCard_title__x7f2a { ... }"]
    B --> D["styles object:<br/>styles.title = 'ArtistCard_title__x7f2a'"]
    D --> E["JSX: className={styles.title}"]
    C --> F[Browser: hashed class, zero collisions]
    E --> F`,
          flowExplain:
            'The same short name you type — `.title` — becomes a hashed class in the output and a matching string on the `styles` object, so your readable JSX and the collision-proof CSS always line up.',
          whyItMatters:
            'Every large front-end codebase has a styling-scope strategy, and being able to explain the trade-offs between CSS Modules, Tailwind, and CSS-in-JS is a standard interview topic. Choosing CSS Modules here also means the CSS you learn is transferable — it is just CSS.',
          steps: [
            'Name the file `Component.module.css` — the `.module.css` suffix is what tells Vite to scope it.',
            'Import it as a default object: `import styles from \'./ArtistCard.module.css\'`.',
            'Reference classes as `className={styles.title}`, never as the raw string `"title"`.',
            'Use `composes` to share a base style between variants instead of repeating declarations.',
            'Keep the reset, tokens, and base element styles in `global.css`; put everything component-specific in its module.',
          ],
          code: `/* ArtistCard.module.css — plain CSS, names get hashed at build */
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.title {
  font-size: var(--fs-lg);
  color: var(--ink-900);
}

/* composes: share a base, then specialise */
.buttonBase {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  cursor: pointer;
}
.primaryButton {
  composes: buttonBase;
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
/* ------------------------------------------------------------ */
// ArtistCard.jsx — how the module is consumed
import styles from './ArtistCard.module.css';

export function ArtistCard({ name }) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{name}</h3>
      <button className={styles.primaryButton}>Contact</button>
    </article>
  );
}
// styles.title at runtime === 'ArtistCard_title__x7f2a'
// A .title in Navbar.module.css compiles to Navbar_title__9a3c — no clash.`,
          pitfalls: [
            '**Forgetting the `.module.css` suffix.** A file named `ArtistCard.css` is treated as global by Vite, and your names are no longer scoped. Fix: the suffix is the switch — always `Name.module.css`.',
            '**Writing `className="title"` instead of `className={styles.title}`.** The string `"title"` refers to a class that does not exist in the hashed output, so nothing applies. Fix: always go through the `styles` object.',
            '**Using kebab-case class names then reaching for `styles.artist-card`.** That is a JS subtraction, not a property. Fix: name classes in camelCase (`artistCard`) so `styles.artistCard` is valid, or use bracket access `styles[\'artist-card\']`.',
            '**Putting global element styles (like `a { color: ... }`) inside a module.** Element selectors in a module still get scoped under a hashed wrapper, so your global link colour silently does nothing app-wide. Fix: base element styling lives in `global.css`.',
            '**Reaching for Tailwind or styled-components out of habit.** The brief forbids Tailwind and the course teaches real CSS. Fix: stay in CSS Modules; you are learning properties you can use anywhere.',
          ],
          tryIt:
            'Create `Navbar.module.css` and `ArtistCard.module.css` and put a `.title` class in both with different colours. Import both, render both, and inspect the DOM: you will see two different hashed class names. Then rename one file to drop `.module` and watch the collision reappear — proof of what the suffix buys you.',
          takeaway:
            'CSS Modules give you plain, readable CSS with build-time-unique class names — the collision safety of BEM with none of the naming ceremony, and, unlike Tailwind, you actually learn CSS.',
        },
        {
          id: 'm6-t4',
          title: 'Layout: Flexbox for one dimension, Grid for two',
          explain:
            'Flexbox lays things out along a single line; CSS Grid lays them out in rows and columns at once — and one Grid line makes the artist listing responsive with zero media queries.',
          analogy:
            'A queue at the temple seva counter is Flexbox: everyone stands in one line, and you decide the spacing between them and who goes first. A rangoli laid out on the floor is Grid: dots arranged in rows *and* columns at the same time. Use the queue when you have one direction to manage, and the rangoli grid when you are filling a two-dimensional space like a wall of artist cards.',
          theory:
            '**Flexbox** is for one dimension — a row *or* a column. You give a container `display: flex`, choose the direction, and control alignment with `justify-content` (along the main axis) and `align-items` (across it). It shines for things that are conceptually a line: a navbar\'s logo-links-button row, a card\'s avatar-beside-name, a chip row. Its superpower is distributing *leftover* space: `justify-content: space-between` pushes the logo left and the auth button right with the gap auto-computed.\n\n**Grid** is for two dimensions at once — rows and columns as a single system. `display: grid` plus `grid-template-columns` defines the column tracks, and children flow into the cells. For a gallery of cards this is exactly right: you are filling a rectangular area, not managing a line.\n\nThe one line worth memorising is this: `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`. Read it right to left. `minmax(260px, 1fr)` says each column is *at least* 260px and *at most* one equal fraction of the free space. `auto-fill` says "fit as many such columns as will fit on this row." Together they mean: on a wide desktop you get four or five columns; on a tablet, two or three; on a phone, one — and **you wrote no media queries at all**. The grid measures the container and does the arithmetic. This single declaration is the backbone of KalaKaara\'s browse page and the reason the layout module is shorter than you expect.\n\nSpacing between grid or flex children should come from **`gap`**, not from margins on the children. Margins on children create the classic problems: the first or last child has an unwanted outer margin, margins collapse unpredictably, and you end up writing `:last-child { margin-right: 0 }` hacks. `gap: var(--space-6)` puts space *only between* items, never on the outer edge, and it works identically in flex and grid. Reach for `gap` first; reach for margins only when you need to nudge one specific element.\n\nOne honest note on `auto-fill` vs `auto-fit`: `auto-fill` keeps empty tracks when there are few items (so a single card stays card-width on a wide screen), while `auto-fit` collapses empty tracks (so one card stretches full width). For a listing that usually has many items, `auto-fill` gives the more stable, expected look.',
          diagram: `graph TD
    G["grid-template-columns:<br/>repeat(auto-fill, minmax(260px, 1fr))"] --> P{Container width?}
    P -- "360px phone" --> C1[1 column<br/>card fills the row]
    P -- "768px tablet" --> C2[2 to 3 columns]
    P -- "1280px desktop" --> C3[4 to 5 columns]
    C1 --> Z[Zero media queries written]
    C2 --> Z
    C3 --> Z`,
          flowExplain:
            'The same one-line rule produces one, two-to-three, or four-to-five columns purely from the container width — the browser does the counting, so you never write a breakpoint for the grid itself.',
          whyItMatters:
            '"When do you use Flexbox versus Grid?" is asked in almost every front-end interview, and "one dimension versus two" is the answer that shows you understand them rather than copy-pasting both. The `auto-fill minmax` pattern is also the single most reused layout trick in modern CSS — knowing it by heart saves you real time.',
          steps: [
            'Decide per container: is this a line (Flexbox) or a field of cells (Grid)?',
            'For the artist listing, use `display: grid` with `repeat(auto-fill, minmax(260px, 1fr))`.',
            'Use `gap` for spacing between items in both flex and grid — never per-child margins.',
            'For the navbar, use `display: flex` with `justify-content: space-between` and `align-items: center`.',
            'Resize the browser slowly and watch the grid re-column itself with no breakpoint code.',
          ],
          code: `/* Browse.module.css — the responsive grid, zero media queries */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-6);           /* space BETWEEN cards, not around them */
}

/* Navbar.module.css — one dimension, so Flexbox */
.bar {
  display: flex;
  align-items: center;           /* vertical centring across the row */
  justify-content: space-between;/* logo left, actions right, gap auto */
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
}
.navLinks {
  display: flex;
  gap: var(--space-6);           /* even spacing between links */
  list-style: none;
}

/* A card's internal header: avatar beside text — again one line, so flex */
.cardHeader {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* auto-fill keeps empty tracks (1 card stays card-width);
   auto-fit would stretch a lone card to full width. We want auto-fill. */`,
          pitfalls: [
            '**Using Grid for something that is a single line.** A navbar in Grid works but fights you the moment content changes width. Fix: a row of items is Flexbox; a field of items is Grid.',
            '**Spacing grid children with margins.** You get an unwanted margin on the outer edge and start writing `:last-child` hacks. Fix: delete the margins, add `gap` to the container.',
            '**Setting a fixed number of columns (`repeat(4, 1fr)`) and then adding media queries to change it.** That is the pre-2018 way and it is a lot of code. Fix: `repeat(auto-fill, minmax(260px, 1fr))` and let the browser count.',
            '**Choosing `auto-fit` when the list is often nearly empty.** A single card stretches across the whole screen and looks broken. Fix: `auto-fill` for listings; keep `auto-fit` for cases where you *want* items to fill the width.',
            '**Forgetting `min-width: 0` on a flex child with long text.** Flex items default to `min-width: auto`, so a long unbroken string refuses to shrink and forces horizontal scroll. Fix: `min-width: 0` on the flex child lets it shrink and wrap.',
          ],
          tryIt:
            'Put eight `ArtistCard` placeholders in a `.grid` and drag the browser from 1280 down to 360px. Count the columns at each width: roughly 5, then 3, then 1 — all from one line. Then switch `auto-fill` to `auto-fit`, leave a single card, and watch it stretch full width. Choose `auto-fill` and move on.',
          takeaway:
            'Flexbox for lines, Grid for fields, `gap` for spacing — and `repeat(auto-fill, minmax(260px, 1fr))` makes the whole artist listing responsive without a single media query.',
        },
      ],
    },
    {
      id: 'm6-s2',
      title: 'The component library',
      topics: [
        {
          id: 'm6-t5',
          title: 'Navbar — responsive, accessible, with a mobile drawer',
          explain:
            'The Navbar carries the logo, navigation links, search and auth button on desktop, and collapses to a hamburger that opens an accessible drawer on mobile.',
          analogy:
            'A KSRTC bus has two ways in. When it is roomy, everyone boards through the wide front door at once — that is the desktop navbar with everything on show. At a packed stop the conductor opens one door and manages the queue — that is the hamburger: the same destinations, revealed on demand through a single controlled entrance. The routes do not change; only how you access them does.',
          theory:
            'The Navbar is the first component every visitor sees and the one that most often gets accessibility wrong. Structurally it is a `<header>` containing a `<nav>` with the primary links, a search control, and an auth `<button>`. On desktop these sit in a Flexbox row. Below your first breakpoint, the links move into a **drawer** — an off-canvas panel — opened by a hamburger button.\n\nThe hamburger must be a **real `<button>`**, not a `<div>` with an `onClick`. A `<button>` is focusable by keyboard, announces itself to screen readers as a button, and fires on Enter and Space for free. It also needs `aria-expanded={open}` so assistive tech announces "collapsed" or "expanded", and `aria-controls` pointing at the drawer\'s `id`, and an `aria-label="Menu"` because its only visible content is an icon. These four attributes are the difference between a menu a screen-reader user can operate and one they cannot even find.\n\nAn open drawer creates two obligations that beginners skip. First, **focus management**: when the drawer opens, focus should move into it, and while it is open, Tab should not escape to the page behind — a *focus trap*. A full trap is fiddly; the pragmatic 80% version is to move focus to the drawer\'s close button on open and return focus to the hamburger on close, so a keyboard user is never stranded. Second, **Escape to close**: a `keydown` listener for the Escape key closes the drawer, because that is the universal "get me out" gesture and users expect it.\n\nTwo more behaviours make it feel finished. The drawer must **close on route change** — otherwise a user taps a link, the page changes, and the menu stays open on top of it. With React Router you close it in a `useEffect` keyed on `location.pathname`. And clicking the **backdrop** (the dimmed area behind the drawer) should close it too. None of this is much code; the code below is the whole component.\n\nA note on the search field: give it a `<label>` (visually hidden if you like, via a `.srOnly` utility) and wrap it in a `<form>` so Enter submits and navigates to `/artists?q=...`. A bare `<input>` with no form and no label is invisible to screen readers and does not submit on Enter — two failures for the price of one shortcut.',
          diagram: `graph TD
    H[header] --> N[nav]
    N --> L[Logo link to /]
    N --> D{Viewport width}
    D -- ">= 720px" --> R[Inline row:<br/>links + search + auth button]
    D -- "< 720px" --> B[Hamburger button<br/>aria-expanded, aria-controls]
    B -- click / Enter --> DR[Drawer panel + backdrop]
    DR --> F1[Focus moves to close button]
    DR --> F2[Escape closes]
    DR --> F3[Route change closes]
    DR --> F4[Backdrop click closes]`,
          flowExplain:
            'The same links live in the inline row and the drawer; the width just decides which is shown, and the four arrows out of the drawer are the accessibility obligations an open panel owes a keyboard user.',
          whyItMatters:
            'A navbar is where interviewers and Lighthouse both look first for accessibility. Getting `aria-expanded`, focus return, and Escape right on a menu is a concrete, demonstrable skill, and "close the drawer on route change" is the kind of detail that separates a polished app from a janky one.',
          steps: [
            'Structure it semantically: `<header>` > `<nav>` with a logo link, the primary links, a search `<form>`, and an auth `<button>`.',
            'Render the hamburger only below your breakpoint, as a `<button>` with `aria-expanded`, `aria-controls`, and `aria-label`.',
            'On open, move focus to the drawer\'s close button; on close, return focus to the hamburger.',
            'Add a `keydown` Escape handler and a backdrop click handler, both of which close the drawer.',
            'Close the drawer in a `useEffect` that watches `location.pathname` so navigation dismisses it.',
          ],
          code: `import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hamburgerRef = useRef(null);
  const closeRef = useRef(null);

  // Close on route change so navigating dismisses the menu.
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Escape closes; move focus into the drawer when it opens.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Return focus to the hamburger after closing.
  const close = () => { setOpen(false); hamburgerRef.current?.focus(); };

  return (
    <header className={styles.header}>
      <nav className={styles.bar} aria-label="Primary">
        <Link to="/" className={styles.logo}>KalaKaara</Link>

        <ul className={styles.navLinks}>
          <li><Link to="/artists">Browse</Link></li>
          <li><Link to="/favourites">Favourites</Link></li>
        </ul>

        <button className={styles.authBtn}>Sign in</button>

        <button
          ref={hamburgerRef}
          className={styles.hamburger}
          aria-expanded={open}
          aria-controls="mobile-drawer"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >☰</button>
      </nav>

      {open && (
        <>
          <div className={styles.backdrop} onClick={close} />
          <div id="mobile-drawer" className={styles.drawer} role="dialog" aria-label="Menu">
            <button ref={closeRef} className={styles.closeBtn} onClick={close} aria-label="Close menu">×</button>
            <Link to="/artists">Browse</Link>
            <Link to="/favourites">Favourites</Link>
            <button className={styles.authBtn}>Sign in</button>
          </div>
        </>
      )}
    </header>
  );
}`,
          pitfalls: [
            '**Building the hamburger as `<div onClick>`.** It is not focusable, not keyboard-operable, and invisible to screen readers. Fix: a real `<button>` with `aria-expanded`, `aria-controls`, and an `aria-label`.',
            '**Leaving the drawer open after navigation.** The user taps a link, the page changes underneath, and the menu floats on top. Fix: `useEffect(() => setOpen(false), [location.pathname])`.',
            '**No way out with the keyboard.** No Escape handler and no focus return strands keyboard users inside the menu. Fix: Escape closes, and closing returns focus to the hamburger.',
            '**Toggling the drawer with CSS `:target` or a checkbox hack.** It looks clever and breaks focus management and route-change closing. Fix: drive it from React state so effects can manage focus and routing.',
            '**A search input with no `<form>` and no label.** Enter does nothing and screen readers cannot name the field. Fix: wrap in a `<form onSubmit>` that navigates to `/artists?q=`, and give the input a (possibly visually hidden) `<label>`.',
          ],
          tryIt:
            'Unplug your mouse. Tab to the hamburger, press Enter, confirm focus lands on the close button, Tab through the links, press Escape, and confirm focus returns to the hamburger. If any step fails, a keyboard user is stuck — fix it before moving on.',
          takeaway:
            'The navbar is one set of links shown two ways; the drawer\'s real work is accessibility — a true `<button>` with `aria-expanded`, focus return, Escape, and close-on-route-change.',
        },
        {
          id: 'm6-t6',
          title: 'Hero with search — semantic and fast',
          explain:
            'The Hero is the first screen block: one `<h1>`, a short pitch, and a search `<form>` that navigates to the browse page — built so it does not wreck Largest Contentful Paint.',
          analogy:
            'The Hero is the painted board at the entrance of a santhe: it tells you in one glance what is sold inside and points you to the right aisle. It has to be readable the instant you arrive, not after the sign-painter finishes a slow flourish. A hero that loads a huge background photo before the headline appears is a signboard that stays blank while the paint dries.',
          theory:
            'The Hero carries the page\'s single **`<h1>`** — the one, top-level heading that tells both humans and Google what this page is. Under it sits a one-line value proposition and the primary action: a search that sends the visitor to `/artists?q=`. Because it is the largest thing on the screen at load, the Hero is almost always the element the browser measures for **Largest Contentful Paint (LCP)**, the Core Web Vital that captures "how long until the main content appears." A slow Hero is a slow-*feeling* app, regardless of how fast everything else is.\n\nThe search must be a real `<form>`. Wrapping the input and button in `<form onSubmit>` gives you Enter-to-submit for free, works before JavaScript fully hydrates, and is what assistive technology expects. On submit you call `preventDefault()` and navigate with the router\'s `useNavigate()` to `/artists?q=` plus the encoded query. The input gets a `<label>` (visually hidden is fine) so it has an accessible name. This is four extra lines over a bare `<input>` and it is the difference between a control that works for everyone and one that works only for a mouse user who knows to click the button.\n\nThe part that quietly tanks performance is the **background**. A full-bleed hero photo is tempting, but a 2 MB JPEG loaded as a CSS `background-image` is invisible to the browser\'s preload scanner, downloads late, and delays LCP badly. Three defences: (1) do not put critical text *inside* an image — keep the `<h1>` as real text so it paints immediately regardless of the photo; (2) if you use a photo, use a real `<img>` with `width`/`height`, `fetchpriority="high"`, and a modern format (WebP/AVIF) so the browser prioritises it; (3) better still for a course, use a lightweight **CSS gradient or a solid token colour** as the background — it costs zero bytes and paints instantly. KalaKaara\'s hero uses a soft terracotta-tinted gradient behind real text.\n\nOne layout detail: constrain the hero content with a `max-width` and centre it, so on a 1280px monitor the headline is not stretched to arm\'s length. A readable line is roughly 60 characters; `max-width: 60ch` on the intro paragraph enforces that without magic pixels.',
          diagram: `graph TD
    HERO[section.hero] --> H1[h1 real text<br/>paints instantly = fast LCP]
    HERO --> P[One-line pitch, max-width 60ch]
    HERO --> FORM[form onSubmit]
    FORM --> LAB[visually-hidden label]
    FORM --> INP[input name=q]
    FORM --> BTN[button Search]
    BTN --> NAV[navigate to /artists?q=...]
    HERO --> BG[Background = CSS gradient<br/>zero bytes, no LCP hit]`,
          flowExplain:
            'Text and the gradient paint immediately with no image download, so LCP is fast; the `<form>` gives Enter-to-submit and routes to the browse page on submit.',
          whyItMatters:
            'LCP is a ranking and UX signal every real product watches, and "the hero background image was our LCP element" is a classic performance post-mortem. Building the hero with real text on a cheap background is a concrete way to show you understand Core Web Vitals, not just recite them.',
          steps: [
            'Give the Hero exactly one `<h1>` as real text — never bake the headline into an image.',
            'Wrap the search in `<form onSubmit>`; call `preventDefault()` and `navigate` to `/artists?q=`.',
            'Add a `<label>` for the input (visually hidden with an `.srOnly` utility if you want a clean look).',
            'Use a CSS gradient or token colour for the background so nothing large downloads before first paint.',
            'Constrain the intro paragraph to about `60ch` and centre the hero content for readability on wide screens.',
          ],
          code: `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';

export function Hero() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    navigate('/artists?q=' + encodeURIComponent(q.trim()));
  };

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Find an artist near you</h1>
        <p className={styles.pitch}>
          Portraits, murals, calligraphy and more — from artists across coastal Karnataka.
        </p>
        <form className={styles.search} onSubmit={onSubmit} role="search">
          <label htmlFor="hero-q" className={styles.srOnly}>Search artists</label>
          <input
            id="hero-q"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try 'portrait in Udupi'"
            className={styles.input}
          />
          <button type="submit" className={styles.submit}>Search</button>
        </form>
      </div>
    </section>
  );
}
/* Hero.module.css (excerpt) */
/*
.hero { background: linear-gradient(135deg, var(--terracotta-50), var(--surface)); }
.inner { max-width: 720px; margin-inline: auto; padding: var(--space-16) var(--space-6); text-align: center; }
.pitch { max-width: 60ch; margin-inline: auto; color: var(--ink-700); }
.srOnly { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
*/`,
          pitfalls: [
            '**Baking the headline into a background image.** If the photo is slow or blocked, the page has no visible heading and no LCP text at all. Fix: `<h1>` is always real text; the image is decoration behind it.',
            '**A 2 MB hero JPEG as a CSS background.** It downloads late, delays LCP, and costs mobile users data. Fix: prefer a CSS gradient; if you must use a photo, use `<img>` with dimensions, a modern format, and `fetchpriority="high"`.',
            '**A bare `<input>` with a button but no `<form>`.** Enter does nothing and the control has no accessible name. Fix: wrap in `<form onSubmit>` and add a `<label>`.',
            '**Full-width text on desktop.** A headline stretched across 1280px is hard to read. Fix: `max-width` on the inner container and `60ch` on the paragraph.',
            '**Forgetting `encodeURIComponent` on the query.** A search for "portrait & mural" breaks the URL. Fix: always encode user text before putting it in a query string.',
          ],
          tryIt:
            'Open DevTools > Lighthouse and run a mobile performance audit on the Home page with a gradient hero, then swap in a large background JPEG and run it again. Watch the LCP number jump. Keep the gradient.',
          takeaway:
            'One real `<h1>`, a proper search `<form>`, and a background that costs zero bytes — the hero should paint instantly and route the visitor to the browse page.',
        },
        {
          id: 'm6-t7',
          title: 'ArtistCard — the workhorse, built to not shift',
          explain:
            'The ArtistCard shows a cover image, an overlapping avatar, name, location, rating, category chips and a starting price — reserving space so nothing jumps as images load.',
          analogy:
            'A well-made artist card is like a framed photo at a Yakshagana troupe\'s stall: the frame is cut to an exact size before the photo goes in, so the wall of frames stays perfectly aligned even while a few photos are still being slotted. A card that resizes when its image finally arrives is a frame that grows on the wall and shoves its neighbours sideways.',
          theory:
            'The ArtistCard is the most-repeated component in the app — it appears on Home and fills the browse grid — so every decision here is multiplied by hundreds of instances. It is built entirely from tokens: `var(--radius-lg)` corners, `var(--shadow-sm)` resting and `var(--shadow-md)` on hover, `var(--space-*)` padding. Because it reads only tokens, restyling every card in the app is a one-file change.\n\nThe cover image is where **layout shift** is won or lost. **Cumulative Layout Shift (CLS)** measures content jumping around as the page loads, and the classic cause is an image with no reserved height: the browser lays out the card at zero height, then the image arrives and shoves everything below it down. Two tools prevent this. **`aspect-ratio: 16 / 9`** on the cover reserves the correct height *before* the image loads, so the card is full-size from the first paint. And **`object-fit: cover`** makes the image fill that reserved box, cropping rather than stretching, so a portrait and a landscape photo both look right in the same 16:9 frame. Setting explicit `width` and `height` attributes on the `<img>` gives the browser the intrinsic ratio as a second line of defence.\n\nThe **overlapping avatar** is a small, satisfying bit of layout: the avatar sits half over the bottom edge of the cover. You get it with `position: relative` on the card body and a negative `margin-top` (or `position: absolute` with a `top` offset) on the avatar, plus a white ring (`border: 3px solid var(--surface)`) so it reads as lifted off the cover. The avatar itself is a fixed-size circle — `width`/`height` set, `border-radius: var(--radius-full)`, `object-fit: cover` — so a non-square upload still renders as a clean circle.\n\nBelow the avatar sit the text rows: the artist\'s name as a heading, the location with a small pin, the `RatingStars` (built accessibly in the next topic), a row of `CategoryChip`s, and the starting price. The whole card is wrapped so that the primary click target — going to the artist\'s profile — is a link over the name (or the cover), and secondary actions like "favourite" are separate buttons, never nested inside the link.\n\nA final structural point: the card is an `<article>`, not a `<div>`. An artist card is a self-contained, independently meaningful unit of content, which is exactly what `<article>` means, and it gives screen-reader users a landmark to navigate by. Small semantic choices like this are free at authoring time and impossible to retrofit cheaply.',
          diagram: `graph TD
    A["img with aspect-ratio 16/9<br/>+ width/height attrs"] --> B[Height reserved BEFORE load]
    B --> C[Card is full size on first paint]
    C --> D[Image arrives, fills box<br/>object-fit: cover crops it]
    D --> E[Nothing below moves = CLS ~ 0]
    F["No aspect-ratio, no dimensions"] --> G[Card starts at 0 height]
    G --> H[Image arrives, pushes content down]
    H --> I[Neighbours jump = bad CLS]`,
          flowExplain:
            'The top path reserves the image\'s space up front so the layout is stable; the bottom path is the default bug where a late image shoves everything down.',
          whyItMatters:
            'Layout shift is one of the three Core Web Vitals and a common real complaint ("I tapped the button but it moved"). Being able to say "we set `aspect-ratio` and explicit dimensions on every image so CLS stayed near zero" is a concrete, testable engineering claim.',
          steps: [
            'Make the card an `<article>` built entirely from tokens so restyling is one-file.',
            'Give the cover `<img>` `aspect-ratio: 16 / 9`, `object-fit: cover`, and explicit `width`/`height` attributes.',
            'Overlap the circular avatar onto the cover with a negative offset and a `var(--surface)` ring.',
            'Wrap the primary target (name or cover) in a `<Link>`; keep favourite/other actions as separate buttons.',
            'Run Lighthouse and confirm CLS is near zero as images stream in.',
          ],
          code: `// ArtistCard.jsx — the complete component (pairs with the CSS below)
import { Link } from 'react-router-dom';
import { RatingStars } from './RatingStars';
import { CategoryChip } from './CategoryChip';
import styles from './ArtistCard.module.css';

export function ArtistCard({ artist }) {
  const { slug, name, location, coverUrl, avatarUrl, rating, categories, startingPrice } = artist;
  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        <img
          className={styles.coverImg}
          src={coverUrl}
          alt={'Cover artwork by ' + name}
          width={320}
          height={180}
          loading="lazy"
        />
        <img
          className={styles.avatar}
          src={avatarUrl}
          alt={name}
          width={64}
          height={64}
          loading="lazy"
        />
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link to={'/artists/' + slug} className={styles.nameLink}>{name}</Link>
        </h3>
        <p className={styles.location}>{location}</p>
        <RatingStars value={rating} />
        <ul className={styles.chips}>
          {categories.slice(0, 3).map((c) => (
            <li key={c}><CategoryChip label={c} /></li>
          ))}
        </ul>
        <p className={styles.price}>
          Starting <strong>Rs. {startingPrice.toLocaleString('en-IN')}</strong>
        </p>
      </div>
    </article>
  );
}`,
          pitfalls: [
            '**A cover image with no reserved height.** The card starts at zero height and jumps when the image loads — visible, jarring CLS. Fix: `aspect-ratio` on the cover plus `width`/`height` on the `<img>`.',
            '**`object-fit` left at default (`fill`).** Non-16:9 photos stretch and faces distort. Fix: `object-fit: cover` crops to fill the frame without distortion.',
            '**Nesting a favourite `<button>` inside the profile `<Link>`.** Interactive elements cannot be nested — clicks and keyboard behaviour become ambiguous and it is invalid HTML. Fix: keep the link and the action button as siblings.',
            '**Using a `<div>` for the card.** You lose the article landmark and the semantic meaning of a self-contained unit. Fix: `<article>` for each card.',
            '**`alt="image"` or `alt="artist photo"` on the cover.** That describes the medium, not the content, and helps no one. Fix: describe it — `alt={\'Cover artwork by \' + name}`.',
          ],
          tryIt:
            'Throttle the network to Slow 3G in DevTools and reload the browse grid. If cards snap to full height immediately and only the images fade in, your `aspect-ratio` is doing its job. If the grid reflows as images land, add the reserved height and try again.',
          takeaway:
            'The ArtistCard is pure tokens plus one discipline: reserve image space with `aspect-ratio` and explicit dimensions so hundreds of cards load without a single jump.',
        },
        {
          id: 'm6-t8',
          title: 'ArtworkCard, RatingStars, CategoryChip, Badge, Footer',
          explain:
            'The rest of the library: an artwork tile, an accessible star rating that a screen reader can actually read, small chips and badges, and the site footer.',
          analogy:
            'These are the small brass fittings of the app — the hinges, latches and handles. Nobody praises a good door handle, but a loose one ruins the whole door. A star rating that a blind user hears as "star star star star star" is a loose handle: it looks fine and conveys nothing.',
          theory:
            'The **ArtworkCard** is a simpler sibling of the ArtistCard: a single image with a reserved aspect ratio, a title, a medium, and a price, linking to `/artworks/:id`. Same rules — `<article>`, `aspect-ratio`, `object-fit: cover`, descriptive `alt` (the artwork\'s title, not "image"). Because it reuses the same tokens, it sits comfortably beside artist cards without extra styling.\n\n**RatingStars** is the component beginners get wrong most often, because the obvious implementation is inaccessible. Rendering five `★`/`☆` characters produces, to a screen reader, the string "black star black star black star white star white star" — noise. The accessible version wraps the visual stars in a container with **`role="img"`** and an **`aria-label` that states the value in words**: `aria-label="4.5 out of 5"`. Now the screen reader announces the rating as a single meaningful phrase and skips the decorative glyphs. Mark the glyphs `aria-hidden="true"` so they are not read twice. The half-star is a purely visual concern (a clipped overlay or a partial-width fill); the *meaning* lives entirely in the label.\n\n**CategoryChip** and **Badge** are tiny presentational components. A chip is a rounded, low-emphasis tag ("Portrait", "Mural") built with `--radius-full`, `--terracotta-50` background and `--terracotta-700` text — enough contrast to be legible, quiet enough not to shout. A Badge is similar but signals status ("Featured", "New"); keeping them as separate named components stops chip-and-badge styling from being copy-pasted into ten files. When a chip is *interactive* (a filter you can toggle) it must be a `<button>`; when it is *decorative* (just labelling a card) a `<span>` is correct. Choosing the element by whether it does something is the whole accessibility decision.\n\nThe **Footer** is a `<footer>` landmark with grouped links (about, categories, legal), the brand line, and — for KalaKaara — a small "Made in Kundapura" note. It is unglamorous but it is a navigation landmark screen-reader users jump to, so it gets real `<nav>` groupings and real headings, not a soup of `<div>`s. Give link groups an `<h2>`/`<h3>` so the footer has a proper heading outline like the rest of the page.\n\nThe through-line across all five: **choose the element by its meaning**. An article is an article, a rating is an image with a label, an interactive chip is a button, a footer is a footer. This costs nothing while typing and is what makes the later Lighthouse accessibility pass boring instead of a scramble.',
          diagram: `graph TD
    RS[RatingStars value=4.5] --> W["span role=img<br/>aria-label='4.5 out of 5'"]
    W --> G["5 glyphs, aria-hidden=true<br/>(visual only)"]
    W --> SR[Screen reader announces:<br/>'4.5 out of 5' once]
    G --> EYE[Sighted user sees stars]
    BAD[Chip or Badge] --> Q{Interactive?}
    Q -- yes, a filter --> BTN[button]
    Q -- no, a label --> SPN[span]`,
          flowExplain:
            'The rating\'s meaning lives in the `aria-label`, not the glyphs; the glyphs are hidden from assistive tech, so one clear phrase is announced instead of five star characters.',
          whyItMatters:
            'Accessible rating widgets and correct element choice are exactly what an accessibility audit checks, and "we exposed ratings as `role=img` with a worded label" is a specific, credible thing to say. Small shared components like Chip and Badge are also where design consistency is either enforced or lost.',
          steps: [
            'Build ArtworkCard like ArtistCard: `<article>`, reserved aspect ratio, `object-fit: cover`, descriptive `alt`.',
            'Make RatingStars a `role="img"` wrapper with an `aria-label` like "4.5 out of 5"; mark the glyphs `aria-hidden`.',
            'Build CategoryChip and Badge from tokens; use a `<button>` when interactive, a `<span>` when decorative.',
            'Build the Footer as a `<footer>` with `<nav>` groups and real `<h2>`/`<h3>` headings.',
            'Reuse the same tokens everywhere so the whole library reads as one design system.',
          ],
          code: `// RatingStars.jsx — accessible: meaning in the label, glyphs hidden
import styles from './RatingStars.module.css';

export function RatingStars({ value, count }) {
  const rounded = Math.round(value * 2) / 2;           // nearest half
  const full = Math.floor(rounded);
  const half = rounded - full === 0.5;
  const label = value.toFixed(1) + ' out of 5'
    + (count ? ', ' + count + ' reviews' : '');

  return (
    <span className={styles.stars} role="img" aria-label={label}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} aria-hidden="true" className={styles.glyph}>
          {i < full ? '★' : (i === full && half ? '⯨' : '☆')}
        </span>
      ))}
    </span>
  );
}

// CategoryChip.jsx — a <span> when decorative, a <button> when it filters
import styles from './CategoryChip.module.css';

export function CategoryChip({ label, onClick, active }) {
  if (onClick) {
    return (
      <button
        className={active ? styles.chipActive : styles.chip}
        aria-pressed={active}
        onClick={onClick}
      >{label}</button>
    );
  }
  return <span className={styles.chip}>{label}</span>;
}

// Badge.jsx
export function Badge({ children }) {
  return <span className="badge">{children}</span>;
}`,
          pitfalls: [
            '**Rendering five star characters with no label.** A screen reader reads "star star star star star" and the rating is lost. Fix: wrap in `role="img"` with an `aria-label` stating the value in words, and `aria-hidden` the glyphs.',
            '**Making a decorative chip a `<button>` (or an interactive filter a `<span>`).** Either confuses assistive tech about what is clickable. Fix: element follows behaviour — button if it does something, span if it only labels.',
            '**`alt="artwork"` on an ArtworkCard image.** It repeats the obvious and describes nothing. Fix: use the artwork\'s title as the alt text.',
            '**A footer built from `<div>`s with no headings.** Screen-reader users lose the landmark and the outline. Fix: `<footer>` with `<nav>` groups and real `<h2>`/`<h3>` headings.',
            '**Duplicating chip/badge styles inline in several components.** They drift apart and the design fragments. Fix: one `CategoryChip` and one `Badge` component reused everywhere.',
          ],
          tryIt:
            'Turn on your OS screen reader (VoiceOver, NVDA, or Narrator) and arrow onto a RatingStars component. If you hear "4.5 out of 5" you built it right; if you hear a stream of "star" you have the inaccessible version. Fix and re-test.',
          takeaway:
            'The small components carry the accessibility weight: a rating is an image with a worded label, an interactive chip is a button, a decorative one is a span — choose the element by what it means.',
        },
      ],
    },
    {
      id: 'm6-s3',
      title: 'Responsive, stateful, accessible',
      topics: [
        {
          id: 'm6-t9',
          title: 'Mobile-first media queries and fluid type',
          explain:
            'Write CSS for the phone first, then add `@media (min-width: ...)` to enhance for larger screens — and let `clamp()` size text fluidly between them.',
          analogy:
            'Building mobile-first is like cooking for the family that always shows up, then adding dishes when extra guests arrive. You never cook a feast for twenty and then try to claw it back to a meal for four. `min-width` queries add courses as the table gets bigger; `max-width` queries are the sad exercise of taking food away.',
          theory:
            '**Mobile-first** means your base CSS — the rules outside any media query — targets the smallest screen, and every media query uses **`min-width`** to *add* styles as the viewport grows. This is not a stylistic preference; it matches how the constraint actually works. The phone is the hard case (one column, limited space), so you solve the hard case first and then *relax* it for roomier screens. The alternative, `max-width` queries, means you design the easy desktop case first and then subtract for the phone — and subtraction is where things break, because you are overriding and undoing rather than building up.\n\nThe mechanics: base rules apply everywhere; a `@media (min-width: 600px) { ... }` block\'s rules apply *from 600px up*, layering on top of the base. Because larger breakpoints override smaller ones by source order, you write them **ascending** — 600, then 900, then 1200 — and each one only says what *changes* at that size, not the whole layout again. Most of your CSS lives in the base with no media query at all; the queries are small deltas.\n\nKalaKaara uses three breakpoints, named by intent rather than device: **`--bp-sm: 600px`** (phone to large-phone/small-tablet: the search and filters can spread out), **`--bp-md: 900px`** (the filter drawer becomes a sticky sidebar; the grid gains columns naturally via `auto-fill`), and **`--bp-lg: 1200px`** (max content width kicks in so lines do not stretch on big monitors). Three is deliberate — more breakpoints means more combinations to test and more places for a layout to be subtly wrong. Note that the grid itself needs *no* breakpoint thanks to `auto-fill minmax` from Section 1; these breakpoints are for the things that genuinely change shape, like the filter panel.\n\n**Fluid type** with `clamp()` removes a whole category of breakpoint. `font-size: clamp(1.75rem, 4vw + 1rem, 2.75rem)` reads as "never smaller than 1.75rem, never larger than 2.75rem, and in between scale with the viewport." The `4vw + 1rem` middle term grows smoothly with screen width, so your `<h1>` is proportionate on a 360px phone and a 1280px desktop without a single font-size media query. Use `clamp()` for headings and hero text; leave body copy at a fixed comfortable size (`1rem`/`1.125rem`) because body text does not benefit from scaling and can become too large on wide screens.\n\nOne forward-looking note: **container queries** (`@container`) are the modern successor to media queries for *components*. A media query asks "how wide is the viewport?"; a container query asks "how wide is *this component\'s* container?", which is what you usually actually want for a reusable card that might sit in a wide main column or a narrow sidebar. They are widely supported now; this course stays with media queries for the page-level layout because they are simpler to teach, but knowing container queries exist — and that they are the direction the platform is moving — is worth saying out loud.',
          diagram: `graph TD
    BASE["Base CSS = phone layout<br/>(no media query)"] --> Q1["@media min-width 600px<br/>search + filters spread out"]
    Q1 --> Q2["@media min-width 900px<br/>filter drawer -> sticky sidebar"]
    Q2 --> Q3["@media min-width 1200px<br/>max content width"]
    BASE --> ADD[Each query ADDS, never subtracts]
    Q3 --> ADD
    TYPE["clamp(min, 4vw + 1rem, max)"] --> FLUID[Headings scale smoothly<br/>zero font-size breakpoints]`,
          flowExplain:
            'The base is the phone; each ascending `min-width` query layers on only what changes at that width, and `clamp()` handles heading size with no breakpoint at all.',
          whyItMatters:
            '"Why mobile-first?" is a stock interview question, and "min-width adds, max-width subtracts, and subtracting is where layouts break" is the answer that shows real understanding. Fluid type with `clamp()` and awareness of container queries mark you as current rather than stuck in 2016.',
          steps: [
            'Write all base styles for the 360px phone first, with no media query.',
            'Add `@media (min-width: ...)` blocks in ascending order, each stating only what changes.',
            'Use exactly three breakpoints — 600, 900, 1200 — named by intent, not device.',
            'Size headings with `clamp(min, fluid, max)` so they scale without font-size breakpoints.',
            'Test at 360, 768, and 1280px and confirm each query adds rather than fights the base.',
          ],
          code: `/* global / component CSS — mobile-first: base is the phone */

.filters {
  /* base (phone): a collapsible drawer, handled in JS */
  display: block;
}

/* From 900px up, the drawer becomes a permanent sticky sidebar */
@media (min-width: 900px) {
  .browseLayout {
    display: grid;
    grid-template-columns: 260px 1fr;   /* sidebar + results */
    gap: var(--space-8);
  }
  .filters {
    position: sticky;
    top: var(--space-6);
    align-self: start;
  }
  .filterToggle { display: none; }        /* hide the hamburger-style button */
}

/* From 1200px up, stop content stretching on big monitors */
@media (min-width: 1200px) {
  .page { max-width: 1200px; margin-inline: auto; }
}

/* Fluid type: no font-size media queries needed */
.heroTitle {
  font-size: clamp(1.75rem, 4vw + 1rem, 2.75rem);
}

/* Modern successor, worth knowing: a component sizing to its own container
.card { container-type: inline-size; }
@container (min-width: 320px) { .cardBody { display: flex; gap: var(--space-4); } }
*/`,
          pitfalls: [
            '**Writing `max-width` media queries.** You design desktop first, then subtract for mobile, and the overrides pile up and fight each other. Fix: base = phone, `min-width` queries add for larger screens.',
            '**Repeating the whole layout inside each query.** Duplicated rules drift out of sync. Fix: each query states only the deltas; the base carries the shared styling.',
            '**Too many breakpoints.** Five or six breakpoints multiply the states you must test and hide subtle bugs. Fix: three intent-named breakpoints cover a content site.',
            '**Fixed heading sizes with a font-size query per breakpoint.** More code, and it jumps at each step. Fix: `clamp()` scales smoothly with one line.',
            '**Using `vw` alone in clamp\'s middle term.** `font-size: clamp(1rem, 5vw, 2rem)` can prevent the user zooming text (an accessibility failure). Fix: include a `rem` term — `4vw + 1rem` — so it still responds to the user\'s font settings.',
          ],
          tryIt:
            'Set a heading to `clamp(1.5rem, 6vw, 3rem)` and drag the browser from narrow to wide: the heading should grow smoothly, then stop at 3rem. Now try `font-size: 8vw` alone and use the browser zoom — notice it barely responds. That is why the `rem` term matters.',
          takeaway:
            'Mobile-first means the base is the phone and every `min-width` query adds, never subtracts; `clamp()` sizes headings fluidly, and container queries are where the platform is heading.',
        },
        {
          id: 'm6-t10',
          title: 'The Browse layout: drawer on mobile, sidebar on desktop',
          explain:
            'Filters live in an off-canvas drawer on phones and transform into a sticky sidebar at 900px and up — with body-scroll locked while the drawer is open and focus restored when it closes.',
          analogy:
            'A tea stall keeps its jars behind a folding shutter during the morning rush — you ask, the owner slides it open, you choose, it slides shut. In the afternoon when there is room, the same jars sit on an open shelf you browse at leisure. Same jars, two presentations dictated by space. The filters are those jars: a pull-open drawer when the screen is cramped, an always-visible shelf when it is roomy.',
          theory:
            'The browse page is where responsive design earns its keep, because the filter panel genuinely needs two different shapes. On a phone there is no room for a permanent sidebar, so filters live in an **off-canvas drawer** opened by a "Filters" button. At `min-width: 900px` the same markup becomes a **sticky sidebar** beside the results grid. Crucially it is the *same component and the same state* — only the CSS presentation changes at the breakpoint. You do not build two filter panels; you build one and let the media query decide whether it floats over the page or sits in the layout.\n\nFor the drawer itself, the modern platform gives you the `<dialog>` element. `dialog.showModal()` opens it as a true modal: it renders on the top layer above everything, it comes with a `::backdrop` you can style, it traps focus, and it closes on Escape — behaviours you would otherwise hand-roll. The alternative is a plain off-canvas `<div>` you translate into view with `transform: translateX(0)`; it gives more styling control but you must implement the focus trap, Escape, and backdrop yourself. Either is fine; `<dialog>` gives you more accessibility for free, so KalaKaara uses it for the filter drawer.\n\nTwo behaviours are mandatory whenever a drawer or modal is open. First, **body scroll lock**. If the page behind the drawer still scrolls when the user swipes, the drawer feels broken and the user loses their place — this is the notorious "scroll bleed." You lock it by setting `overflow: hidden` on `<body>` (or `document.documentElement`) while the drawer is open and removing it on close. Second, **focus restoration**. When the drawer opens, focus moves into it; when it closes, focus must return to the exact button that opened it, so a keyboard user is not dumped back at the top of the page. You capture `document.activeElement` before opening and call `.focus()` on it after closing. `<dialog>`\'s `showModal()` handles the trap and Escape, but you still wire scroll lock and the open-button focus return.\n\nThe layout switch is pure CSS. Below 900px, the results grid is the whole width and the filters are `display: none` until the drawer opens them over the page. At and above 900px, a `grid-template-columns: 260px 1fr` puts a `position: sticky; top: var(--space-6)` sidebar next to the results, and the "Filters" toggle button is hidden with `display: none` because the filters are now always visible. Nothing about the filter *logic* changes across the breakpoint — a category checkbox does the same thing whether it is in a drawer or a sidebar — which is exactly why sharing one component matters.',
          diagram: `graph TD
    W{Viewport width} -- "< 900px" --> M[Filters button visible]
    M -- tap --> DLG[dialog.showModal]
    DLG --> LOCK[body overflow: hidden<br/>scroll locked]
    DLG --> TRAP[focus trapped in dialog]
    DLG -- Escape / apply / backdrop --> CLOSE[Close]
    CLOSE --> UNLOCK[body scroll restored]
    CLOSE --> RET[focus returns to Filters button]
    W -- ">= 900px" --> SIDE[Same component as<br/>sticky sidebar, always visible]
    SIDE --> HIDE[Filters button display:none]`,
          flowExplain:
            'One filter component, two presentations: below 900px it is a modal `<dialog>` that locks scroll and restores focus on close; at 900px and up the identical component is a sticky sidebar and the toggle button disappears.',
          whyItMatters:
            'The drawer-to-sidebar transform is a portfolio-grade responsive pattern, and scroll lock plus focus restoration are exactly the details that separate a real product from a demo. Interviewers probe "what happens to focus when your modal closes?" precisely because so many candidates never considered it.',
          steps: [
            'Build one `Filters` component and share its state; let CSS decide drawer-vs-sidebar.',
            'Use a `<dialog>` opened with `showModal()` for the mobile drawer to get focus trap, Escape, and a backdrop for free.',
            'On open, set `overflow: hidden` on the body; on close, remove it — locking background scroll.',
            'Capture the active element before opening and restore focus to it after closing.',
            'At `min-width: 900px`, switch to a two-column grid with a sticky sidebar and hide the Filters toggle.',
          ],
          code: `import { useEffect, useRef } from 'react';
import styles from './Browse.module.css';

export function FilterDrawer({ open, onClose, children }) {
  const dialogRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open) {
      openerRef.current = document.activeElement;   // remember who opened it
      dlg.showModal();                               // top layer + focus trap + Esc
      document.body.style.overflow = 'hidden';       // lock background scroll
    } else if (dlg.open) {
      dlg.close();
    }
  }, [open]);

  // Restore scroll + focus whenever it closes (Escape, backdrop, or Apply)
  const handleClose = () => {
    document.body.style.overflow = '';
    openerRef.current?.focus();
    onClose();
  };

  return (
    <dialog ref={dialogRef} className={styles.drawer} onClose={handleClose}>
      <div className={styles.drawerHead}>
        <h2 className={styles.drawerTitle}>Filters</h2>
        <button onClick={handleClose} aria-label="Close filters">×</button>
      </div>
      {children}
      <button className={styles.apply} onClick={handleClose}>Show results</button>
    </dialog>
  );
}
/* Browse.module.css — the layout switch
@media (min-width: 900px) {
  .layout { display: grid; grid-template-columns: 260px 1fr; gap: var(--space-8); }
  .sidebar { position: sticky; top: var(--space-6); align-self: start; }
  .filterToggle { display: none; }
}
*/`,
          pitfalls: [
            '**Background scrolls behind the open drawer (scroll bleed).** The user swipes and the page underneath moves, which feels broken. Fix: `document.body.style.overflow = \'hidden\'` while open, reset on close.',
            '**Focus is lost when the drawer closes.** A keyboard user is dumped at the top of the document. Fix: capture `document.activeElement` before opening and `.focus()` it back on close.',
            '**Building two separate filter panels for mobile and desktop.** Their state drifts and you fix every bug twice. Fix: one component, one state; CSS chooses the presentation.',
            '**A hand-rolled `<div>` drawer with no Escape or focus trap.** Keyboard and screen-reader users cannot operate or escape it. Fix: use `<dialog>` `showModal()`, or implement trap + Escape yourself.',
            '**Forgetting to reset `overflow` if the drawer unmounts while open.** The whole page is left unscrollable. Fix: reset in the same effect\'s cleanup as well as on explicit close.',
          ],
          tryIt:
            'Open the filter drawer on a narrow viewport and try to scroll the page behind it — it must not move. Close the drawer with Escape and confirm focus jumps back to the "Filters" button, not to the top of the page. Both must pass before you call the drawer done.',
          takeaway:
            'One filter component, two presentations: a scroll-locked, focus-restoring `<dialog>` on mobile that becomes a sticky sidebar at 900px, with the toggle hidden.',
        },
        {
          id: 'm6-t11',
          title: 'Skeletons, empty states, and error states',
          explain:
            'Every list renders four ways — loading (a skeleton), empty (nothing to show), error (something failed, with a retry), and data — and you build reusable components for the first three.',
          analogy:
            'When you order at a busy Kundapura hotel, a good waiter does three things depending on the situation: lays your banana leaf and glass first so you know your food is coming (skeleton), tells you plainly "idli is over today, try the dosa" (empty state), and if the kitchen truly fails, says "one problem, give me two minutes" and comes back (error with retry). A bad waiter leaves you staring at an empty table with no idea whether food is coming, gone, or never existed.',
          theory:
            'A robust list is a small **state machine** with four states, and the KalaKaara convention (from Module 0) is to write them *in this order*: **loading → empty → error → data**. Writing them in order means you cannot forget one — the empty and error branches are handled before you get to the happy path, instead of being bolted on later when a user reports a blank screen. Each state has a purpose: loading tells the user something is coming, empty tells them the query genuinely returned nothing, error tells them it failed and offers a way forward, and data is the actual content.\n\nThe loading state should be a **skeleton**, not a spinner, and the reason is layout. A spinner is a single spinning circle in the middle of the screen that reserves no space and tells you nothing about what is coming; when the data arrives it pops in and shoves the page around. A **skeleton** is a grey placeholder shaped like the real content — a card-sized box with a bar where the title will be — so it *reserves the exact layout*. When real data replaces it, nothing jumps (good CLS), and the user perceives the wait as shorter because they can see the shape of what is loading. Build `<Skeleton />` as a token-sized grey block with a CSS **shimmer** animation: a light band sweeping across via a `@keyframes` moving a `background-position` or a translated gradient.\n\nThe shimmer must respect **`prefers-reduced-motion`**. Some users get motion sickness or vestibular symptoms from animation, and the OS setting is how they tell you. Wrap the animation in `@media (prefers-reduced-motion: no-preference) { ... }` so it only runs for users who have *not* asked to reduce motion; those who have get a static grey block, which conveys the same "loading" meaning without moving. This is one media query and it is the difference between a considerate app and one that makes some users ill.\n\n**`<EmptyState />`** is a small reusable component taking `icon`, `title`, `description`, and an optional `action`. "No artists match these filters" with a "Clear filters" button is infinitely better than a blank grey rectangle, because it confirms the app *worked* (the query ran, it just found nothing) and offers the obvious next step. The empty state is not an error — distinguishing "nothing found" from "something broke" is a core UX responsibility.\n\n**`<ErrorState onRetry />`** handles the failure case: a plain message ("Could not load artists") and a **Retry** button that re-runs the fetch. Never surface a raw error object or stack trace to the user; log the technical detail, show a calm human message. Because the fetch lives in a hook that returns `{ data, loading, error }` (the Module 0 convention), the component just switches on those three values, and `onRetry` calls the hook\'s refetch. This is why every hook in the course returns that exact shape: it makes the four-state render trivial and identical everywhere.',
          diagram: `graph TD
    F[Fetch artists] --> L[loading: show Skeleton grid]
    L --> R{Result?}
    R -- threw --> E[error: ErrorState + Retry]
    R -- empty array --> M[empty: EmptyState + Clear filters]
    R -- has rows --> D[data: ArtistCard grid]
    E -- Retry --> F
    M -- Clear filters --> F
    style L fill:#f5f5f4
    style D fill:#dcfce7`,
          flowExplain:
            'The fetch resolves into exactly one of error, empty, or data; the skeleton holds the layout while it is in flight, and both Retry and Clear-filters loop back to re-run the fetch.',
          whyItMatters:
            'Loading, empty, and error states are the states beginners skip and reviewers immediately notice — a demo that only handles the happy path reads as unfinished. "A skeleton reserves layout so nothing jumps" and "we gate animation behind prefers-reduced-motion" are concrete, senior-sounding statements.',
          steps: [
            'Render every list in the fixed order loading → empty → error → data so no state is forgotten.',
            'Build `<Skeleton />` as a token-sized grey block with a CSS shimmer keyframe.',
            'Wrap the shimmer in `@media (prefers-reduced-motion: no-preference)` so it stops for users who asked.',
            'Build `<EmptyState icon title description action />` to confirm "nothing found" and offer a next step.',
            'Build `<ErrorState onRetry />` with a calm message and a button that re-runs the fetch.',
          ],
          code: `// states.jsx — the three non-data states as reusable components
import styles from './states.module.css';

export function Skeleton({ className }) {
  return <div className={styles.skeleton + (className ? ' ' + className : '')} aria-hidden="true" />;
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className={styles.empty} role="status">
      <div className={styles.emptyIcon}>{icon}</div>
      <h2 className={styles.emptyTitle}>{title}</h2>
      <p className={styles.emptyDesc}>{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({ onRetry }) {
  return (
    <div className={styles.error} role="alert">
      <p>Could not load artists.</p>
      <button className={styles.retry} onClick={onRetry}>Retry</button>
    </div>
  );
}

// ArtistGrid.jsx — the four states, written in order
export function ArtistGrid({ data, loading, error, refetch, clearFilters }) {
  if (loading) return <div className={styles.grid}>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className={styles.cardSkel} />)}</div>;
  if (error) return <ErrorState onRetry={refetch} />;
  if (data.length === 0) return <EmptyState icon="🎨" title="No artists found" description="Try widening your filters." action={<button onClick={clearFilters}>Clear filters</button>} />;
  return <div className={styles.grid}>{data.map((a) => <ArtistCard key={a.id} artist={a} />)}</div>;
}
/* states.module.css
.skeleton { background: var(--line); border-radius: var(--radius-md); }
@media (prefers-reduced-motion: no-preference) {
  .skeleton { background: linear-gradient(90deg, var(--line) 25%, #f0efee 37%, var(--line) 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; }
  @keyframes shimmer { from { background-position: 100% 0; } to { background-position: 0 0; } }
}
*/`,
          pitfalls: [
            '**Using a centred spinner for loading.** It reserves no space, so content pops in and shifts the page. Fix: a skeleton shaped like the content keeps the layout stable and reads as faster.',
            '**Treating empty as an error (or as data).** A blank grid on a valid "no results" query confuses the user. Fix: a distinct `EmptyState` that confirms the search ran and offers a next step.',
            '**Showing the raw error to the user.** A stack trace or `[object Object]` is frightening and useless. Fix: log the detail, render a calm message plus a Retry button.',
            '**A shimmer that ignores `prefers-reduced-motion`.** It can make some users physically unwell. Fix: gate the animation behind `@media (prefers-reduced-motion: no-preference)`.',
            '**Writing only the data branch and adding the others "later".** Later is when a user hits the blank screen. Fix: write loading → empty → error → data in that order, every time.',
          ],
          tryIt:
            'In your OS accessibility settings, turn on "Reduce motion", then reload a page full of skeletons. The shimmer should stop and leave static grey blocks. Turn it back off and the shimmer returns. If it keeps animating either way, your media query is wrong.',
          takeaway:
            'Every list is a four-state machine written loading → empty → error → data; a skeleton beats a spinner because it reserves layout, and the shimmer must respect `prefers-reduced-motion`.',
        },
        {
          id: 'm6-t12',
          title: 'Accessibility that costs nothing',
          explain:
            'Semantic elements, one `<h1>` per page with no skipped heading levels, descriptive `alt` text, visible focus rings, 4.5:1 contrast, and 44px hit targets — none of it costs extra time if you do it from the start.',
          analogy:
            'A well-built temple has a ramp beside the steps, wide doorways, and clear signage — not bolted on after complaints, but designed in, so it serves the elderly, the wheelchair user, and the rushing pilgrim equally. Accessibility done from the first commit is that ramp poured with the foundation; done at the end it is a concrete afterthought that never quite fits.',
          theory:
            'Most accessibility is not extra work — it is *correct* work, and `<button>` is literally fewer characters than `<div onClick>`. The single highest-value habit is **semantic HTML**: `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`, `<button>`, `<a>`. Each carries built-in behaviour and meaning — a `<button>` is focusable, keyboard-operable, and announced as a button; a `<main>` is a landmark a screen-reader user can jump to. Using a `<div>` for these throws all of that away and forces you to re-add it with ARIA, badly. The rule: reach for the semantic element first, ARIA only when no element fits.\n\n**Headings form an outline, and the outline must be clean.** Exactly one `<h1>` per page (the page\'s subject — the Hero\'s headline on Home, the artist\'s name on a profile), and no skipped levels: an `<h2>` may be followed by an `<h3>`, never jump from `<h2>` to `<h4>`. Screen-reader users navigate by heading, so a broken outline is like a table of contents with missing chapters. This is a *structure* decision, not a *size* decision — never pick a heading level for its default font size; style it with tokens and choose the level by its place in the outline.\n\n**Alt text describes content, not medium.** `alt="image"` and `alt="photo"` are worse than useless — they announce "image" and convey nothing. Describe what matters: for an artwork, its subject or title ("Watercolour of Maravanthe beach at dusk"); for a decorative flourish, `alt=""` (empty, so screen readers skip it). The test: if the image vanished, what words would carry the same meaning? Those words are the alt text.\n\n**Visible focus, sufficient contrast, big enough targets.** A `:focus-visible` outline shows keyboard users where they are — never `outline: none` without a replacement, or you strand every keyboard user. Use `:focus-visible` (not `:focus`) so the ring shows for keyboard navigation but not on mouse click, which is the behaviour users expect. Text contrast must be at least **4.5:1** against its background (3:1 for large text) — this is why KalaKaara\'s body text is `--ink-700` on white, not a trendy light grey that fails the check. And interactive targets should be at least **44×44px**, because a fingertip is about that size; a tiny icon button is a source of constant mis-taps on a phone. All three cost nothing at authoring time: a token for the focus ring, colours chosen once to pass contrast, and `min-height`/`min-width` on buttons.\n\nNone of this is testable by staring at the screen, so **test it two ways**. First, unplug the mouse and operate the whole app with the keyboard alone: Tab reaches everything interactive in a sensible order, focus is always visible, Enter/Space activate, Escape closes overlays. Second, turn on a screen reader (VoiceOver, NVDA, or Narrator) and listen: are headings announced in order, do images have meaningful names, does the rating read as "4.5 out of 5"? Then run Lighthouse\'s accessibility audit for the automated 60% it can catch. Passing all three is the bar for the mini project, and it is reachable precisely because you chose the right elements from the first line.',
          diagram: `graph TD
    SEM[Semantic elements first] --> H[Clean heading outline<br/>one h1, no skipped levels]
    SEM --> BTN["button not div onClick<br/>(focusable, keyboard, announced)"]
    A[Meaningful alt text<br/>content not 'image'] --> AUD
    FV[:focus-visible ring] --> AUD
    CON[4.5:1 contrast] --> AUD
    HIT[44px hit targets] --> AUD
    H --> AUD[Accessibility]
    BTN --> AUD
    AUD --> T1[Test: keyboard only]
    AUD --> T2[Test: screen reader]
    AUD --> T3[Test: Lighthouse audit]`,
          flowExplain:
            'Semantic elements and a clean heading outline do most of the work for free; the four small habits feed the same goal, and you verify with three tests rather than by eyeballing.',
          whyItMatters:
            'Accessibility is legally required in many markets, is a Lighthouse score product teams track, and is increasingly asked about in interviews. More practically, every one of these habits — semantic elements, clean headings, real alt text — also improves SEO and code clarity, so it pays for itself twice.',
          steps: [
            'Use semantic elements by default — `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`, `<button>` — and ARIA only when none fits.',
            'Put exactly one `<h1>` on each page and never skip heading levels; choose level by outline, not by font size.',
            'Write `alt` that describes the image\'s content; use `alt=""` for purely decorative images.',
            'Keep a visible `:focus-visible` ring, ensure 4.5:1 text contrast, and give interactive targets a 44px minimum.',
            'Test three ways: keyboard-only, a screen reader, and Lighthouse\'s accessibility audit.',
          ],
          code: `/* global.css — accessibility defaults that cost nothing */

/* Visible focus for keyboard users, not on mouse clicks */
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Minimum 44px hit target on interactive controls */
button, .iconButton, a.button {
  min-height: 44px;
  min-width: 44px;
}

/* Body text at 4.5:1+ contrast: --ink-700 on white passes; a light grey fails */
body { color: var(--ink-700); background: var(--surface-2); }

/* A visually-hidden utility for labels that must exist for screen readers
   but not appear on screen (e.g. the search field's <label>) */
.srOnly {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
/* ----- example page skeleton with a clean outline and landmarks ----- */
/*
<header> ...Navbar... </header>
<main>
  <h1>Find an artist near you</h1>        // exactly one h1
  <section aria-labelledby="feat">
    <h2 id="feat">Featured artists</h2>    // h2 under the h1, no skip
    <article> ...ArtistCard... </article>
  </section>
</main>
<footer> ... </footer>
*/`,
          pitfalls: [
            '**`<div onClick>` instead of `<button>`.** Not focusable, not keyboard-operable, not announced — three failures from one shortcut. Fix: use `<button>`; it is fewer characters and does all of that for free.',
            '**Skipping heading levels for visual size.** Jumping `<h2>` to `<h4>` because h4 "looks right" breaks the outline. Fix: pick the level by structure and size it with tokens.',
            '**`outline: none` on focus with no replacement.** Keyboard users can no longer see where they are. Fix: style `:focus-visible` with a clear ring instead of removing it.',
            '**Light-grey body text that looks elegant and fails contrast.** Trendy `#aaa`-on-white is often below 4.5:1. Fix: verify with a contrast checker; `--ink-700` on white passes.',
            '**Tiny icon-only buttons.** A 24px target is a constant mis-tap on a phone and fails the 44px guideline. Fix: `min-height`/`min-width: 44px`, padding the icon out if needed.',
          ],
          tryIt:
            'Run Lighthouse\'s accessibility audit on your Home page and read every item it flags — most will be a missing label, a contrast miss, or a heading-order issue, each a one-line fix. Then do the audit it cannot: Tab through the whole page with no mouse and confirm focus is always visible and in a sensible order.',
          takeaway:
            'Accessibility is mostly choosing the right element and a clean heading outline — free at authoring time — plus visible focus, real alt text, 4.5:1 contrast, and 44px targets, verified by keyboard, screen reader, and Lighthouse.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm6-p1',
      type: 'Mini Project',
      title: 'The KalaKaara Component Library',
      domain: 'UI / Responsive Front-end',
      duration: '2 hours',
      description:
        'Build the full KalaKaara component library from tokens up — reset, tokens, Navbar with a working mobile drawer, Hero, ArtistCard, ArtworkCard, RatingStars, CategoryChip, EmptyState, Skeleton, ErrorState, and Footer — then assemble them into a static Home page with hardcoded data that is fully responsive at 360/768/1280, keyboard navigable, and passes a Lighthouse accessibility check. No Tailwind, no backend, no Supabase yet: this is pure UI.',
      tools: ['React', 'Vite', 'CSS Modules', 'plain CSS', 'React Router'],
      blueprint: {
        overview:
          'A `src/components/` and `src/styles/` tree containing every reusable UI piece, plus a `Home.jsx` page that imports them and renders hardcoded coastal-Karnataka data (Rukmini Shetty, Ganesh Acharya, Shalini Kamath). The library reads only from `tokens.css`, so the whole app can be re-skinned from one file. The deliverable is judged on three axes: it looks like one coherent design system, it works from 360px to 1280px with no horizontal scroll, and it passes keyboard and Lighthouse accessibility checks.',
        functionalRequirements: [
          '**Foundations.** `styles/reset.css` (box-sizing on everything, zeroed margins, block images) and `styles/tokens.css` (colour scale, 4px spacing scale, radii, shadows, font sizes, z-index ladder), imported once in `main.jsx` before any component CSS.',
          '**Navbar.** Logo, nav links, search, auth button; below 720px a hamburger `<button aria-expanded>` opens a drawer that traps focus, closes on Escape, closes on backdrop click, and returns focus to the hamburger.',
          '**Hero.** One `<h1>` of real text, a one-line pitch, and a `<form>` that navigates to `/artists?q=`, on a zero-byte gradient background.',
          '**Cards.** `ArtistCard` (cover, overlapping avatar, name, location, rating, chips, starting price, all with reserved image space) and `ArtworkCard`, both `<article>` with `aspect-ratio` and descriptive `alt`.',
          '**Atoms.** `RatingStars` exposed as `role="img"` with an "X out of 5" `aria-label`, `CategoryChip` (button when interactive, span when decorative), `Badge`, and a `Footer` landmark with real heading groups.',
          '**States.** `Skeleton` with a `prefers-reduced-motion`-gated shimmer, `EmptyState` (icon/title/description/action), and `ErrorState` (message + Retry).',
          '**Home page.** Assembles all of the above with hardcoded data, fully responsive at 360/768/1280 with no horizontal scroll, one clean heading outline, and every image with meaningful alt text.',
        ],
        technicalImplementation: [
          '**CSS Modules per component.** Each component gets a `Name.module.css`; only `reset.css`, `tokens.css`, and `global.css` are plain global CSS. No Tailwind anywhere.',
          '**The responsive grid.** The card grid uses `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` so columns respond with zero media queries; breakpoints exist only for the navbar drawer and (later) the filter sidebar.',
          '**Tokens only.** No component hardcodes a hex colour or a px spacing value; grep the `.module.css` files to prove it. Re-skinning is a one-file edit to `tokens.css`.',
          '**Accessibility built in.** Semantic landmarks, one `<h1>`, no skipped heading levels, `:focus-visible` rings, 44px targets, and 4.5:1 contrast from the first commit — not retrofitted.',
          '**Static data.** A `homeData.js` array of three artists and a handful of artworks with placeholder image URLs; no Supabase, no fetch — the point is the UI, and the four-state list still renders its data branch.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Reset, tokens, and global base',
            outcome:
              'src/styles/reset.css, tokens.css, and global.css wired into main.jsx in the right order.',
            prompt:
              'In an existing Vite + React project, create `src/styles/reset.css` with a modern reset: `box-sizing: border-box` on `*, *::before, *::after`, zeroed margins on block elements, block-level images with `max-width: 100%`, and `font: inherit` on form controls. Create `src/styles/tokens.css` declaring on `:root` a warm terracotta colour scale (`--terracotta-50..900`, with `--accent` aliasing `--terracotta-700`), neutral ink/line/surface colours, a 4px-based spacing scale (`--space-1..--space-16`), radii, three shadows, font sizes, and a z-index ladder (`--z-nav`, `--z-drawer`, `--z-modal`, `--z-toast`). Create `src/styles/global.css` with base `body`/`a`/heading styling, a `.srOnly` visually-hidden utility, a `:focus-visible` ring using `--accent`, and a 44px min target on buttons. Import all three in `src/main.jsx` in the order reset, tokens, global, before anything else. Do not use Tailwind.',
          },
          {
            step: 2,
            label: 'Navbar with an accessible mobile drawer',
            outcome:
              'A responsive Navbar whose hamburger opens a focus-trapping, Escape-closing drawer.',
            prompt:
              'Create `src/components/Navbar.jsx` and `Navbar.module.css`. Desktop (>= 720px): a `<header>` > `<nav aria-label="Primary">` in a Flexbox row with a logo `<Link to="/">`, a `<ul>` of nav links, a search `<form>`, and an auth `<button>`. Mobile (< 720px): hide the inline links and show a hamburger `<button>` with `aria-expanded`, `aria-controls="mobile-drawer"`, and `aria-label="Menu"` that toggles a drawer. When the drawer opens, move focus to its close button; add a `keydown` Escape handler and a backdrop `<div onClick>` that both close it; on close return focus to the hamburger; and close the drawer in a `useEffect` keyed on `useLocation().pathname`. Style the drawer to slide in from the right using tokens and `--z-drawer`. No Tailwind.',
          },
          {
            step: 3,
            label: 'Hero and the card components',
            outcome:
              'Hero, ArtistCard, and ArtworkCard built from tokens with reserved image space.',
            prompt:
              'Create `Hero.jsx` (one `<h1>` of real text, a `<p>` pitch capped at 60ch, and a `<form role="search">` with a visually-hidden `<label>` that navigates to `/artists?q=` via `useNavigate`, on a `linear-gradient` background using terracotta tokens). Create `ArtistCard.jsx`/`ArtistCard.module.css`: an `<article>` with a 16:9 cover `<img>` (`aspect-ratio`, `object-fit: cover`, explicit `width`/`height`, descriptive alt), a circular avatar overlapping the cover bottom with a `--surface` ring, the name as an `<h3>` wrapping a `<Link>`, location, a `RatingStars`, a chip row, and a starting price formatted with `toLocaleString(\'en-IN\')`. Create `ArtworkCard.jsx` as a simpler sibling. Everything reads from tokens; no hardcoded colours or px spacing; no Tailwind.',
          },
          {
            step: 4,
            label: 'Atoms and the four-state list',
            outcome:
              'RatingStars, CategoryChip, Badge, Footer, Skeleton, EmptyState, ErrorState.',
            prompt:
              'Create `RatingStars.jsx` that renders five glyphs marked `aria-hidden="true"` inside a `<span role="img">` whose `aria-label` reads like "4.5 out of 5", supporting half stars. Create `CategoryChip.jsx` that renders a `<button aria-pressed>` when given an `onClick` and a `<span>` otherwise, and a small `Badge.jsx`. Create `Footer.jsx` as a `<footer>` with `<nav>` link groups under real `<h3>` headings and a "Made in Kundapura" line. Create `states.jsx` exporting `Skeleton` (a token-sized grey block with a shimmer `@keyframes` wrapped in `@media (prefers-reduced-motion: no-preference)`), `EmptyState` ({ icon, title, description, action }), and `ErrorState` ({ onRetry }). Then write an `ArtistGrid` that switches loading -> error -> empty -> data in that order. No Tailwind.',
          },
          {
            step: 5,
            label: 'Assemble the responsive, accessible Home page',
            outcome:
              'A Home page using hardcoded data, responsive at 360/768/1280 and passing Lighthouse a11y.',
            prompt:
              'Create `src/data/homeData.js` with three hardcoded artists (Rukmini Shetty in Kundapura, Ganesh Acharya in Udupi, Shalini Kamath in Manipal) with categories, ratings, starting prices, and placeholder cover/avatar image URLs, plus a few artworks. Create `src/pages/Home.jsx` that renders `<Navbar>`, `<Hero>`, a "Featured artists" section (`<h2>` under the Hero\'s `<h1>`, no skipped levels) using the `auto-fill minmax(260px, 1fr)` grid of `ArtistCard`s, a "Latest artwork" grid of `ArtworkCard`s, and `<Footer>`, wrapped in a single `<main>`. Ensure no horizontal scroll at 360px, a clean heading outline, meaningful alt text on every image, and visible focus on every interactive element. Then run Lighthouse\'s accessibility audit and fix anything below 100, and Tab through the whole page with no mouse to confirm the drawer and links are operable. No Tailwind.',
          },
        ],
        deliverable:
          'A running Home page assembled entirely from a token-driven CSS-Modules component library — Navbar with a working accessible mobile drawer, Hero, cards, atoms, and state components — that is visually coherent, fully responsive at 360/768/1280 with no horizontal scroll, fully keyboard navigable, and scores 100 on Lighthouse\'s accessibility audit, all without a single line of Tailwind.',
      },
    },
  ],
  quiz: [
    {
      id: 'm6-q1',
      q: 'What does grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) achieve?',
      options: [
        'It fits as many columns as will hold at least 260px each, sharing leftover space equally, so the grid re-columns at every screen size with no media queries',
        'It always renders exactly 260 columns regardless of screen width',
        'It fixes the number of columns at three and hides overflow beyond them',
        'It requires a separate media query at each breakpoint to change the column count',
      ],
      answer: 0,
    },
    {
      id: 'm6-q2',
      q: 'Why is mobile-first (min-width) preferred over desktop-first (max-width) media queries?',
      options: [
        'min-width queries only work on phones, while max-width queries only work on desktops',
        'The base CSS solves the hard, constrained phone case first and each min-width query ADDS enhancements for larger screens, whereas max-width forces you to design desktop first and SUBTRACT, which is where overrides pile up and break',
        'max-width queries are not supported in modern browsers',
        'There is no real difference; the two approaches are interchangeable',
      ],
      answer: 1,
    },
    {
      id: 'm6-q3',
      q: 'In a CSS Module, what happens to a class named .title in ArtistCard.module.css at build time?',
      options: [
        'It is deleted unless it is also declared in global.css',
        'It stays exactly .title globally and overrides any other .title',
        'It is rewritten to a unique hashed name like ArtistCard_title__x7f2a, so it can never collide with a .title in another module',
        'It is converted into an inline style attribute on the element',
      ],
      answer: 2,
    },
    {
      id: 'm6-q4',
      q: 'Why is a skeleton preferred over a spinner for a loading list?',
      options: [
        'A spinner is not supported on mobile browsers',
        'A skeleton uses less JavaScript than a spinner',
        'A spinner is more accessible than a skeleton by default',
        'A skeleton is shaped like the real content, so it reserves the exact layout and nothing jumps when data arrives, whereas a spinner reserves no space and lets content pop in and shift the page',
      ],
      answer: 3,
    },
    {
      id: 'm6-q5',
      q: 'How should a star rating of 4.5 be exposed to a screen reader?',
      options: [
        'As a container with role="img" and an aria-label of "4.5 out of 5", with the individual star glyphs marked aria-hidden="true"',
        'As five literal ★ and ☆ characters with no wrapper, so it reads each star aloud',
        'As an <img> tag whose src is a picture of five stars',
        'It should be hidden from screen readers entirely with aria-hidden on the whole widget',
      ],
      answer: 0,
    },
    {
      id: 'm6-q6',
      q: 'Which technique prevents cumulative layout shift when a card cover image loads?',
      options: [
        'Wrapping the image in a spinner until it finishes loading',
        'Setting aspect-ratio (plus explicit width/height on the img) so the correct height is reserved before the image downloads, keeping the card full-size from first paint',
        'Loading every image eagerly with no lazy loading',
        'Using object-fit: fill so the image always stretches to the box',
      ],
      answer: 1,
    },
    {
      id: 'm6-q7',
      q: 'How should a shimmer animation on a skeleton respect users who are sensitive to motion?',
      options: [
        'Run the shimmer always; motion sensitivity is not a CSS concern',
        'Detect motion sensitivity in JavaScript and remove the element from the DOM',
        'Wrap the animation in @media (prefers-reduced-motion: no-preference) so it runs only for users who have NOT asked to reduce motion, leaving a static grey block for those who have',
        'Slow the animation down to half speed for everyone',
      ],
      answer: 2,
    },
  ],
}
