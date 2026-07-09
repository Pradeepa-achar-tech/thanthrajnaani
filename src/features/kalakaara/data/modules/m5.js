// Module 5 — React Fundamentals, Taught Against a Real App
// KalaKaara (React + Supabase) course content for the React course player.

export const m5 = {
  id: 'm5',
  title: 'React Fundamentals, Taught Against a Real App',
  hours: 8,
  color: 'from-orange-500/20 to-orange-700/10',
  accent: 'orange',
  description:
    'You already know HTML, CSS, and JavaScript. This module turns that into React — not with a toy counter, but with the actual components of KalaKaara: ArtistCard, the browse grid, a controlled search form, and the useArtists hook. You will learn components and props, one-way data flow, lists and keys, the state and effect model that trips up every beginner, the hooks that genuinely matter, and finally routing, controlled forms, and Context — stopping exactly where the real app draws its own lines.',
  sections: [
    {
      id: 'm5-s1',
      title: 'Components, JSX, and data flowing down',
      topics: [
        {
          id: 'm5-t1',
          title: 'What a component actually is, and what JSX compiles to',
          explain:
            'A React component is a plain function that takes props and returns a description of UI; JSX is a friendlier spelling of the function calls that build that description.',
          analogy:
            'At a Kundapura santhe, you do not hand a customer the vegetables directly. You write a chit: "2 kg tomato, 1 bundle coriander." The chit is not the vegetables — it is a description that the person at the counter reads and fulfils. Your component returns a chit describing the screen; React is the counter that reads it and puts real DOM on the page. You never touch the DOM yourself, exactly as you never reach into the sack yourself.',
          theory:
            'Forget classes, lifecycles, and anything that sounds heavy. A component is **a function whose name starts with a capital letter, that takes one argument (props) and returns markup**. That is the entire definition. `function ArtistCard(props) { return <div>...</div> }` is a component. React calls that function whenever it needs to know what the card should look like, hands it the current props, and reads the returned description.\n\nThat returned markup is **JSX**, and JSX is not HTML — it is syntax sugar. The build tool (Vite, using Babel or esbuild) rewrites every JSX tag into a `React.createElement(type, props, ...children)` call at compile time. `<h2 className="name">{artist.displayName}</h2>` becomes `React.createElement(\'h2\', { className: \'name\' }, artist.displayName)`. What your function actually returns is a tree of plain JavaScript objects — React *elements* — describing the UI. React diffs that tree against the previous one and updates only what changed. This is why it is called a **description**, not a render: you describe the *what*, React decides the *how*.\n\nThree JSX rules follow directly from "it is JavaScript, not HTML". **First, `className` not `class`.** `class` is a reserved word in JavaScript, and JSX compiles to JS, so the attribute had to be renamed. Same reason `for` becomes `htmlFor`. **Second, expressions go in `{}`.** Anything inside curly braces is evaluated as a JavaScript expression and its result is inserted: `{artist.displayName}`, `{price * 1.18}`, `{artworks.length}`. A *statement* (an `if`, a `for`) cannot go there — only an expression that produces a value. **Third, a component must return a single root element.** Because `return <a /> <b />` compiles to returning two things from one function, which is not valid JavaScript. When you genuinely have two siblings and no wrapper div is wanted, use a **Fragment**: `<>...</>` or `<React.Fragment>...</React.Fragment>`, which groups children without adding a node to the DOM.\n\nHold on to the mental model: **props in, element tree out, no side effects.** A component that fetches data or writes to `localStorage` while rendering is a component doing something React did not ask for, and Section 2 is where you will learn the correct place for that work.',
          diagram: `graph TD
    A["You write JSX:<br/>#60;h2 className=#quot;name#quot;#62;{artist.displayName}#60;/h2#62;"] --> B[Vite + Babel compile step]
    B --> C["React.createElement('h2',<br/>{ className: 'name' },<br/>artist.displayName)"]
    C --> D["A plain JS object:<br/>{ type:'h2', props:{...}, children:[...] }<br/>= a React element"]
    D --> E[React diffs this tree<br/>against the previous tree]
    E --> F[React updates only the<br/>changed real DOM nodes]`,
          flowExplain:
            'Look at box D: what your function returns is a plain object, not HTML and not a DOM node. Everything React does well — diffing, minimal updates — is only possible because you handed it a cheap description instead of touching the DOM yourself.',
          whyItMatters:
            'Every confusing React error a beginner hits — "class is not a valid prop", "objects are not valid as a React child", "adjacent JSX elements must be wrapped" — dissolves the moment you internalise that JSX is `createElement` in disguise. Interviewers ask "what does JSX compile to?" precisely because the answer predicts whether the rest of your React model is sound.',
          steps: [
            'Write ArtistCard as a function that takes `props` and returns one root element. Confirm the function name is capitalised — lowercase names are treated as HTML tags.',
            'Paste a line of your JSX into the Babel REPL (babeljs.io/repl) and read the `React.createElement` output. Do this once; it rewires how you see JSX permanently.',
            'Change one `class` to `className` and one `for` to `htmlFor`, and note the warnings disappear.',
            'Put a JavaScript expression inside `{}` — `{artworks.length}` — then try to put an `if` statement there and watch it fail. Expressions only.',
            'Return two sibling elements with no wrapper, see the error, then wrap them in `<>...</>` and see it resolve.',
          ],
          code: `// ArtistCard.jsx — a real KalaKaara component, not a Counter.
// A component is a function: props in, an element description out.

function ArtistCard({ artist }) {
  return (
    <article className="artist-card">
      {/* className, not class — JSX compiles to JS, and class is reserved */}
      <img className="avatar" src={artist.avatarUrl} alt={artist.displayName} />

      {/* {} holds a JavaScript EXPRESSION, evaluated and inserted */}
      <h2 className="name">{artist.displayName}</h2>
      <p className="location">{artist.city}, {artist.district}</p>
      <p className="exp">{artist.yearsExperience} years experience</p>
    </article>
  );
}

// What the compiler turns that <h2> line into — no magic, just a function call:
//   React.createElement('h2', { className: 'name' }, artist.displayName)
//
// So the whole component returns a tree of plain objects (React elements).
// React diffs that tree and touches the real DOM for you.

// A Fragment groups siblings WITHOUT adding a wrapper <div> to the DOM:
function NameAndBadge({ artist }) {
  return (
    <>
      <h2>{artist.displayName}</h2>
      {artist.isVerified && <span className="badge">Verified</span>}
    </>
  );
  // Without the <>...</> this would be "two roots from one function" — invalid JS.
}`,
          pitfalls: [
            '**Naming a component in lowercase.** `function artistCard() {...}` then `<artistCard />` renders literally nothing, because JSX treats a lowercase tag as an HTML element named "artistcard". Fix: components are always `PascalCase`.',
            '**Writing `class="..."` out of HTML habit.** React warns and ignores it, so your styles silently never apply. Fix: `className`. Same for `htmlFor` instead of `for` on labels.',
            '**Putting a statement inside `{}`.** `{if (loading) ...}` is a syntax error — `{}` holds an expression, not a statement. Fix: use a ternary `{loading ? <Spinner/> : <Grid/>}` or compute the value above the return.',
            '**Returning two sibling elements without a wrapper.** "Adjacent JSX elements must be wrapped in an enclosing tag." Fix: wrap in a real element if you want one in the DOM, or a Fragment `<>...</>` if you do not.',
            '**Believing JSX is HTML.** Then `<img>` without a closing slash, inline `style="color:red"` strings, and comments written `<!-- -->` all break. Fix: JSX is JavaScript — self-close every void tag, pass `style={{ color: \'red\' }}` as an object, and comment with `{/* ... */}`.',
          ],
          tryIt:
            'Take the ArtistCard above and, without running it, write out by hand the `React.createElement` call for the `<article>` and its three children. Then check yourself in the Babel REPL. If your handwritten version matches, you understand JSX at the level that stops the confusing errors (the article call nests three createElement calls as its children arguments).',
          takeaway:
            'A component is a function: props in, an element tree out. JSX is `React.createElement` in disguise — which is why it is `className`, why `{}` holds expressions, and why siblings need a Fragment.',
        },
        {
          id: 'm5-t2',
          title: 'Props and the one-way data flow rule',
          explain:
            'Props are the read-only arguments a parent passes down to a child; data flows one direction — down — and a child may never mutate what it received.',
          analogy:
            'A seva counter at Kollur passes a printed receipt down to the devotee: name, seva, amount. The devotee reads it; they do not scratch out the amount and write a new one. If they want a different seva, they go back to the counter and ask — the counter reissues a fresh receipt. Props are that receipt. The child reads them; to change anything, it asks the parent, and the parent hands down new props.',
          theory:
            'When a parent renders `<ArtistCard artist={artist} />`, the object `{ artist: artist }` is the child\'s **props**. Inside the child they are exactly like function arguments — because they *are* function arguments. React calls `ArtistCard({ artist })` and you read `artist.displayName`. Props can be any JavaScript value: strings, numbers, objects, arrays, functions, even other elements.\n\nThe iron rule is **one-way data flow**: data moves from parent to child, never sideways between siblings and never up from a child mutating a parent\'s object. Concretely, **props are read-only**. Writing `props.artist.name = \'X\'` inside ArtistCard is a bug — and a nasty one, because it *sometimes appears to work*. You are mutating the very object the parent still holds, so the parent\'s data silently changes, but React was never told, so it does not re-render, and the two go out of sync. React cannot see the mutation. If a child needs to cause a change, the parent passes down a **function** prop (`onFavorite`), the child *calls* it, and the parent decides what to do. Data flows down; events flow up as function calls. Nothing flows up as a mutation.\n\nDestructuring in the parameter list makes props readable and gives you **default values** for free: `function ArtistCard({ artist, showLocation = true })`. If the parent omits `showLocation`, it is `true`; this replaced the old `defaultProps` API and is the current idiom. Destructure at the top so the component\'s inputs are visible in one glance.\n\n**Prop-drilling** is the name for passing a prop through an intermediate component that does not use it, only to reach a grandchild. `BrowsePage` passes `onFavorite` to `ArtistGrid`, which passes it straight to each `ArtistCard`. Beginners hear "prop-drilling" as a slur and reach for Context immediately. Do not. **Two levels of drilling is completely fine** — it is explicit, greppable, and obvious. Context earns its place only when a value is needed by many distant components (Section 3), and KalaKaara deliberately has just two. Drill two levels without guilt.',
          diagram: `graph TD
    BP[BrowsePage<br/>owns artists, owns onFavorite] -->|artist + onFavorite<br/>flow DOWN as props| AG[ArtistGrid]
    AG -->|artist + onFavorite<br/>flow DOWN as props| AC[ArtistCard]
    AC -.->|user clicks heart<br/>event flows UP as a<br/>function CALL| BP
    AC -->|reads props.artist<br/>NEVER writes to it| RD[Renders name, city, avatar]

    style BP fill:#fde68a
    style AC fill:#e0f2fe`,
          flowExplain:
            'Solid arrows (data) point only downward; the one dotted arrow upward is not data moving up — it is the child calling a function the parent handed it. That asymmetry, data down and events up as calls, is the whole model.',
          whyItMatters:
            'The single most common source of "my UI does not update" bugs in beginner React is a mutated prop or a mutated piece of state. Understanding that props are read-only and that changes must go through the parent is what makes React predictable. In interviews, "how does data flow in React?" is a warm-up question you must answer crisply: down via props, up via callbacks.',
          steps: [
            'Render `<ArtistCard artist={artist} />` from a parent and read `artist.displayName` inside the child via destructuring.',
            'Add a default with destructuring: `function ArtistCard({ artist, showLocation = true })`. Omit the prop from one call site and confirm the default applies.',
            'Try to "fix" a name by writing `props.artist.displayName = ...` inside the child. Observe that the screen does not update, then delete that line and feel the lesson.',
            'Add an `onFavorite` function prop. Have the child call `onFavorite(artist.id)` on click; have the parent own what happens. Data went down, the event came back up as a call.',
            'Drill `onFavorite` from BrowsePage through ArtistGrid to ArtistCard. Two hops. Note how easy it is to trace, and resist reaching for Context.',
          ],
          code: `// One-way data flow, the KalaKaara way.

// PARENT owns the data and owns what "favourite" means.
function BrowsePage() {
  const { data: artists } = useArtists(filters);

  function handleFavorite(artistId) {
    // The PARENT decides. The child only asked.
    favoriteService.toggle(artistId);
  }

  return <ArtistGrid artists={artists} onFavorite={handleFavorite} />;
}

// INTERMEDIATE just passes the props through — this is prop-drilling, and
// two levels of it is perfectly fine. Explicit and greppable.
function ArtistGrid({ artists, onFavorite }) {
  return (
    <div className="grid">
      {artists.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} onFavorite={onFavorite} />
      ))}
    </div>
  );
}

// CHILD reads props (read-only) and reports events UP by calling the function.
function ArtistCard({ artist, onFavorite, showLocation = true }) {
  // ❌ NEVER: artist.displayName = 'x'  — mutating a prop. React cannot see it.
  return (
    <article className="artist-card">
      <h2>{artist.displayName}</h2>
      {showLocation && <p>{artist.city}, {artist.district}</p>}
      <button onClick={() => onFavorite(artist.id)}>♥ Save</button>
      {/*        event flows UP as a call ^^^ — the parent owns the outcome */}
    </article>
  );
}`,
          pitfalls: [
            '**Mutating a prop object.** `props.artist.city = \'Udupi\'` changes the parent\'s object without telling React, so the screen and the data drift apart. Fix: treat props as frozen; to change data, call a function the parent supplied.',
            '**Reassigning a prop variable.** `artist = {...}` inside the child does nothing useful and confuses readers. Fix: derive a new local `const` from props instead of overwriting the parameter.',
            '**Forwarding props with the wrong name.** The parent passes `onFavorite` but the child reads `onFavourite`; it is silently `undefined` and the button does nothing. Fix: pick one spelling and keep it in `constants/` or at least be consistent — no magic prop names.',
            '**Reaching for Context to avoid two levels of drilling.** You trade an explicit, traceable prop for hidden global state and re-render surprises. Fix: drill two levels happily; use Context only for genuinely global values (Section 3).',
            '**Passing a fresh inline object as a prop and expecting stability.** `<ArtistCard config={{ dense: true }} />` creates a new object every render, which can defeat memoisation downstream. Fix: hoist stable objects or memoise them (t9 covers exactly this).',
          ],
          tryIt:
            'ArtistCard receives `artist` and calls `onFavorite(artist.id)`. Without adding Context, wire a favourite from ArtistCard all the way up to a `favouriteCount` displayed in the Navbar, which is a sibling of BrowsePage. Where must the shared state live? (In their lowest common ancestor — App or a layout — which passes count down to Navbar and the toggler down to BrowsePage. This is "lifting state up", and t6 formalises it.)',
          takeaway:
            'Props are read-only arguments that flow down; children report events up by calling functions the parent passed. Mutating a prop is invisible to React and always a bug. Two levels of prop-drilling is fine.',
        },
        {
          id: 'm5-t3',
          title: 'Composition over configuration',
          explain:
            'Instead of adding boolean flags that switch a component between shapes, build small components and slot them together — composition — using `children` and element-valued props.',
          analogy:
            'A Yakshagana troupe does not build one giant machine-actor with switches for "king mode", "demon mode", and "sage mode". They have costumes, a stage, and performers, and they compose them per scene. A stage that takes whoever steps onto it is infinitely more flexible than one hard-wired for three fixed roles. Your `Card` is the stage; whatever you put inside it is the performer.',
          theory:
            'React gives every component a special prop called **`children`** — whatever you place *between* its opening and closing tags. A generic `Card` can render a border, padding, and a shadow, then drop `props.children` into the middle, knowing nothing about what it contains. `<Card><ArtistCard artist={a} /></Card>` and `<Card><ReviewList reviews={r} /></Card>` reuse the same shell for completely different content. The Card is closed to modification and open to extension — you never edit Card to support a new kind of content, you just nest new content inside it.\n\nWhen a component needs more than one hole to fill, use the **slot pattern**: pass elements as named props. `<Card header={<h2>{artist.displayName}</h2>} footer={<ContactButton artist={artist} />}>...body...</Card>`. Now Card has three slots — `header`, `children`, `footer` — and each caller fills them with whatever elements it likes. Props are not limited to strings and numbers; an element is a perfectly ordinary value to pass.\n\nContrast this with **configuration**, the anti-pattern: `<Card variant="artist" hasFooter showBadge dense withBorder />`. Every boolean is a fork in Card\'s internal logic, and the forks multiply. `hasFooter` implies a `footer` prop must also exist; `variant="artist"` bakes knowledge of artists into a component that should be generic; `showBadge` means Card now has to know what a badge is. Five booleans is thirty-two possible states, most untested, several nonsensical. This is called a "boolean explosion", and it is a smell because the component is trying to be every layout at once.\n\nComposition removes the booleans by inverting control. Instead of Card deciding *whether* to show a footer, the caller decides *what* the footer is — or passes nothing. `hasFooter` disappears because a missing `footer` prop simply renders nothing. `variant="artist"` disappears because the caller composes an `ArtistCard` inside. `showBadge` disappears because the caller includes a `<Badge />` in the header if it wants one. The rule of thumb: **when you feel the urge to add a boolean prop that toggles a chunk of UI, pass that chunk in as an element instead.**',
          whyItMatters:
            'Composition is the difference between a component library you can grow for sixteen modules and one that collapses under its own configuration flags by Module 8. Senior reviewers spot boolean explosion instantly and ask for composition; being able to refactor `variant`/`hasX`/`showY` props into slots and children is a concrete, demonstrable React skill.',
          steps: [
            'Build a generic `Card` that renders a styled shell and drops `{children}` in the middle. Give it no knowledge of artists, reviews, or badges.',
            'Wrap two unrelated things in it: `<Card><ArtistCard .../></Card>` and `<Card><ReviewList .../></Card>`. Same shell, different content.',
            'Add `header` and `footer` element props. Render each only if provided, so a missing slot renders nothing — no `hasFooter` boolean needed.',
            'Take any component you have written with a `variant="..."` or `showSomething` prop and list its boolean-implied states. If there are more than four, it is a composition candidate.',
            'Refactor one boolean prop into a slot: delete `showBadge`, and let callers pass `<Badge />` into the header when they want it.',
          ],
          code: `// Card.jsx — generic, knows NOTHING about artists, reviews, or badges.
// One shell, three slots: header, children (body), footer.
function Card({ header, footer, children }) {
  return (
    <section className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
      {/* A missing slot renders nothing. No hasHeader / hasFooter booleans. */}
    </section>
  );
}

// COMPOSITION — the caller decides what each slot contains:
function ArtistCardComposed({ artist }) {
  return (
    <Card
      header={<h2>{artist.displayName}</h2>}
      footer={<ContactButton artist={artist} />}
    >
      <p>{artist.city}, {artist.district}</p>
      <p>{artist.yearsExperience} years experience</p>
    </Card>
  );
}

// ❌ CONFIGURATION — the smell this replaces:
//   <Card variant="artist" hasFooter showBadge dense withBorder />
//   Five booleans = 32 states, most untested. And Card now has to KNOW
//   what an artist, a footer, and a badge are. Composition deletes all of it:
//   the caller composes those pieces in, Card stays generic forever.`,
          pitfalls: [
            '**Adding a `variant` prop that hard-codes domain knowledge.** `variant="artist"` forces a generic Card to import artist logic. Fix: keep Card generic; let the caller compose the artist-specific pieces inside it.',
            '**A pair of coupled booleans.** `hasFooter` plus a `footer` prop means callers can set `hasFooter` true with no footer, or vice versa. Fix: drop the boolean; render the footer only when the `footer` element is present.',
            '**Boolean explosion.** Five toggles create thirty-two states you cannot possibly test. Fix: each toggle that switches a UI chunk becomes a slot the caller fills or omits.',
            '**Forgetting `children` is just a prop.** People pass a `body` prop instead of nesting content, losing the natural `<Card>...</Card>` syntax. Fix: use `children` for the primary content; reserve named element props for secondary slots.',
            '**Over-composing trivial components.** Not everything needs slots; a leaf `RatingStars` that takes a number is fine as-is. Fix: reach for composition when configuration flags multiply, not on principle for every component.',
          ],
          tryIt:
            'You have `<ArtistCard dense showBadge showLocation hideExperience />`. Refactor it so none of those four booleans exist. (Hint: `dense` becomes a className the parent passes or a wrapping layout; `showBadge` becomes a `<Badge/>` the caller composes into a header slot; `showLocation`/`hideExperience` become the caller choosing which children to include. The card stops deciding and starts receiving.)',
          takeaway:
            'When a boolean prop toggles a chunk of UI, pass the chunk in as `children` or an element prop instead. Composition keeps components generic; configuration flags multiply into untested states.',
        },
        {
          id: 'm5-t4',
          title: 'Rendering lists and the key prop',
          explain:
            'You render a list by mapping an array to elements, and every element in that list needs a stable, unique `key` so React can track which item is which across renders.',
          analogy:
            'A Yakshagana green room hangs each performer\'s costume on a peg labelled with the performer\'s name, not with "peg 1, peg 2, peg 3". If you numbered the pegs and someone left, everyone shifts down a peg and the crown ends up on the drummer. Label by identity (the artist\'s id) and it does not matter who leaves or in what order they arrive — each costume follows its owner. `key={artist.id}` is the name on the peg; `key={index}` is the peg number.',
          theory:
            'Rendering a list is just `array.map(item => <Component />)` inside `{}`. `{artists.map(a => <ArtistCard artist={a} />)}` produces one card per artist. React requires each of those elements to carry a **`key`** prop, and the key must be **stable, unique among siblings, and tied to the item\'s identity** — which in KalaKaara means `key={artist.id}`, the database UUID.\n\nThe key is not for you; it is how React answers "is this the same item as last render, or a different one?" during **reconciliation**. When the list changes, React lines up the old element list against the new one *by key*. Matching keys mean "same item, update it in place"; a new key means "new item, mount it"; a missing key means "this item left, unmount it". Keys let React move DOM nodes and preserve their internal state (input focus, scroll position, uncontrolled input text) instead of tearing them down.\n\nNow the classic bug: `key={index}`. Using the array index as the key tells React "the item at position 0 is always the same item". That is a lie the moment the list **reorders, filters, or has an item removed from anywhere but the end**. Picture the browse grid with a text input inside each card (a "note to self"). You type into the third card, then filter the list so the first card disappears. Every remaining card shifts up one index. React, keying by index, believes the item now at index 2 is the same item that was at index 2 before — so it *keeps that DOM node, including your typed text and focus*, but feeds it the next artist\'s data. Your note jumps to the wrong artist, focus lands in the wrong box, and if you had a delete button, clicking "remove" on the second card removes the wrong one. The state is welded to the position, not to the item.\n\nSwap to `key={artist.id}` and React tracks each card by identity. Filter one out, and React removes exactly that card\'s DOM node and its state, leaving every other card — text, focus, and all — untouched. **Use the item\'s stable id as the key. Reach for the index only for a list that never reorders, never filters, and never removes from the middle — and even then, prefer an id.**',
          diagram: `graph TD
    subgraph before[Render 1: keys = index]
      I0["index 0 → Rukmini"]
      I1["index 1 → Ganesh (you typed a note here)"]
      I2["index 2 → Shalini"]
    end
    subgraph after[Render 2: Rukmini filtered out]
      J0["index 0 → Ganesh"]
      J1["index 1 → Shalini"]
    end
    I1 -. "React thinks index 1 is<br/>the SAME item, keeps its<br/>DOM + your note" .-> J1
    J1 --> BUG["BUG: your note now<br/>sits on Shalini's card"]

    style BUG fill:#fecaca`,
          flowExplain:
            'Follow the dotted arrow: React matched by index, so the note typed on Ganesh\'s card stayed attached to index 1 — which is now Shalini. Keying by `artist.id` would have removed Rukmini\'s node and left Ganesh\'s note exactly where it belonged.',
          whyItMatters:
            'The `key={index}` bug is subtle, ships to production constantly, and only appears when a list mutates — so it survives every quick test. Being able to explain *why* it breaks (state binds to position, not identity) is a reliable senior-vs-junior signal in interviews, and it is a real correctness bug in KalaKaara\'s browse grid, favourites list, and portfolio manager.',
          steps: [
            'Render the browse grid with `{artists.map(a => <ArtistCard key={a.id} artist={a} />)}`. The key goes on the outermost element returned by map.',
            'Deliberately switch to `key={index}`, add a text input inside each card, type into one, then remove an earlier item. Watch the text and focus jump to the wrong card.',
            'Switch back to `key={a.id}` and repeat. The remaining cards keep their text and focus. Feel the difference.',
            'Confirm the key is unique among *siblings*, not globally — two different lists may both start their keys at the same id space without conflict.',
            'Never derive a key from array content that can change (like the artist\'s name); use the immutable database id.',
          ],
          code: `// The browse grid. key = the stable database id. Always.
function ArtistGrid({ artists, onRemove }) {
  return (
    <div className="grid">
      {artists.map((artist) => (
        <ArtistCard
          key={artist.id}          {/* ✅ identity, survives reorder + filter */}
          artist={artist}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

// ❌ The bug. Looks fine until the list changes.
function BuggyGrid({ artists, onRemove }) {
  return (
    <div className="grid">
      {artists.map((artist, index) => (
        <div key={index}>       {/* index binds state to POSITION, not item */}
          <ArtistCard artist={artist} />
          {/* This uncontrolled input holds text tied to the DOM node.
              Remove an earlier card and React keeps THIS node at its index,
              feeding it the next artist — your note lands on the wrong person. */}
          <input placeholder="Private note about this artist" />
          <button onClick={() => onRemove(index)}>Remove</button>
          {/* onRemove(index) removes the WRONG artist after any reorder. */}
        </div>
      ))}
    </div>
  );
}
// Fix: key={artist.id}, and onRemove(artist.id) — everything keyed by identity.`,
          pitfalls: [
            '**`key={index}` on a list that filters or reorders.** State and focus stick to the position and leak onto the wrong item. Fix: `key={item.id}` — the stable database id.',
            '**Passing the same value to `onRemove` that you used as the key.** `onRemove(index)` removes by position and deletes the wrong row after a reorder. Fix: `onRemove(artist.id)` — act on identity, not position.',
            '**Putting the key on an inner element instead of the one returned by map.** React warns "each child in a list should have a unique key" because the key must sit on the outermost mapped element. Fix: key the element `map` returns directly.',
            '**Using a non-unique key like the artist\'s city.** Two artists in Kundapura collide, and React mis-matches them. Fix: keys must be unique among siblings; use the id.',
            '**Generating a key with `Math.random()` or `Date.now()` in render.** A fresh key every render means React unmounts and remounts every item every time — losing all state and thrashing the DOM. Fix: keys must be stable across renders; derive from the item, never generate.',
          ],
          tryIt:
            'Build a five-card browse grid with a text input in each card, keyed by index. Type "call after 6pm" into card 3, then remove card 1. Where does your note end up, and why? (It stays on index 2\'s DOM node, which now shows a different artist — the note appears to migrate. Re-key by `artist.id` and it stays put.) This ten-minute experiment teaches the lesson more permanently than any paragraph.',
          takeaway:
            'Map arrays to elements and give each a `key`. `key={artist.id}` binds React\'s tracking to identity; `key={index}` binds it to position and breaks the moment the list filters, reorders, or removes from the middle.',
        },
        {
          id: 'm5-t5',
          title: 'Conditional rendering, and the four-state render ladder',
          explain:
            'You choose what to render with ordinary JavaScript expressions — `&&`, ternaries, and early returns — and every data view should walk a loading → error → empty → data ladder.',
          analogy:
            'The board at Kundapura bus stand shows one of a few states, never all at once: "buses loading...", "no buses to Kollur today", "next bus 4:15", or an "enquiry closed" sign when the system is down. Nobody prints all four lines and hopes you read the right one. Your components pick exactly one state to show, in a deliberate order, just like that board.',
          theory:
            'Because JSX slots hold expressions, conditional rendering is just JavaScript expressions that produce elements.\n\n**The `&&` operator** renders the right-hand side only when the left is truthy: `{artist.isVerified && <Badge />}`. It works because `true && <Badge/>` evaluates to `<Badge/>`, and `false && <Badge/>` evaluates to `false`, which React renders as nothing. This is clean for "show X or show nothing". But it hides a famous footgun: **`{count && <List/>}` when `count` is `0`**. `0 && anything` evaluates to `0` — and React *renders* the number `0`, not nothing, because `0` is a valid React child while `false`, `null`, and `undefined` are not. You get a stray "0" on screen. The fix is to make the left side a real boolean: `{count > 0 && <List/>}`, or `{Boolean(count) && ...}`, or use a ternary. Any expression whose left side might be `0` or `\'\'` (both falsy but renderable) is at risk.\n\n**The ternary** `cond ? <A/> : <B/>` is for "one thing or the other thing": `{loading ? <Skeleton/> : <Grid artists={data}/>}`. Use it when both branches render something. Nesting ternaries three deep is unreadable — switch to early returns.\n\n**Early returns** are the cleanest tool for a component with several mutually exclusive states. Instead of one giant nested ternary in the JSX, return early for each state at the top of the function. This is exactly how KalaKaara renders every list, and the order is fixed and deliberate: **loading, then error, then empty, then data.** Loading first, because until the request resolves you know nothing else. Error second, because a failed request has no data to be empty or full. Empty third, because a successful-but-zero-results response is a *feature* (a real "no artists serve Kundapura yet" message with a helpful next step), not a bug. Data last, as the happy path. Writing them in this order, as four early returns, means the happy path never has to defend against `data` being `null` or `undefined` — by the time you reach it, loading is false, error is null, and data is a non-empty array. This is the m0 convention "skeleton, empty, error, then data" made concrete in React.',
          whyItMatters:
            'Beginners write the happy path first and bolt loading and error states on "later" — which never comes, so the first user on a Kundapura 4G connection sees a blank white screen or a crash on `data.map is not a function`. The four-state ladder, written as early returns in a fixed order, is the single most reliable pattern for robust data UI, and the `0 &&` footgun is a genuine interview question.',
          steps: [
            'Render a verified badge with `{artist.isVerified && <Badge/>}`. Confirm it appears and disappears with the boolean.',
            'Reproduce the footgun: render `{artist.artworkCount && <Gallery/>}` for an artist with zero artworks and watch a bare "0" appear on the page.',
            'Fix it with `{artist.artworkCount > 0 && <Gallery/>}`. The stray zero is gone.',
            'Refactor a list component to four early returns in order: loading, error, empty, data. Notice the final `return` no longer needs any null-checks.',
            'Write a real empty state with a next step ("No artists serve Kundapura yet — try Udupi district"), not a bare "No results".',
          ],
          code: `// The four-state render ladder — the KalaKaara pattern for every list.
// Order is deliberate: loading → error → empty → data.
function ArtistBrowseList({ filters }) {
  const { data, loading, error } = useArtists(filters);

  if (loading) return <ArtistGridSkeleton count={6} />;          // 1. loading
  if (error)   return <ErrorState message={error.message} onRetry={reload} />; // 2. error
  if (data.length === 0)                                          // 3. empty
    return (
      <EmptyState
        title="No artists serve Kundapura yet"
        action={<button onClick={widenToDistrict}>Try Udupi district</button>}
      />
    );

  // 4. data — by here, loading is false, error is null, data is non-empty.
  //    The happy path defends against nothing.
  return (
    <div className="grid">
      {data.map((artist) => (
        <ArtistCard key={artist.id} artist={artist} />
      ))}
    </div>
  );
}

// The && footgun, and the fix:
function Gallery({ artist }) {
  return (
    <section>
      <h3>Portfolio</h3>
      {/* ❌ if artworkCount is 0, this renders a literal "0" on screen */}
      {/* {artist.artworkCount && <ArtworkGrid id={artist.id} />} */}

      {/* ✅ force a real boolean on the left of && */}
      {artist.artworkCount > 0 && <ArtworkGrid id={artist.id} />}

      {/* ✅ or a ternary when there is an else branch */}
      {artist.artworkCount > 0
        ? <ArtworkGrid id={artist.id} />
        : <p>No artwork uploaded yet.</p>}
    </section>
  );
}`,
          pitfalls: [
            '**`{count && <X/>}` when count can be 0.** `0 && ...` is `0`, and React renders the number 0 as visible text. Fix: `{count > 0 && <X/>}` or `{Boolean(count) && <X/>}` — the left of `&&` must be a true boolean.',
            '**The same trap with empty strings.** `{name && <p>{name}</p>}` renders nothing for `\'\'` (good) but `{list.length && ...}` renders `0` (bad). Fix: compare explicitly, `list.length > 0`.',
            '**Rendering the happy path before handling loading.** `data.map(...)` runs while `data` is still `null`, throwing "Cannot read properties of null". Fix: the loading early-return guards the map; put it first.',
            '**Treating empty results as an error.** A zero-length successful response is a valid, common state that deserves helpful copy, not a red error box. Fix: give empty its own branch with a useful next action.',
            '**Three-deep nested ternaries in JSX.** `{a ? <A/> : b ? <B/> : c ? <C/> : <D/>}` is unreadable and error-prone. Fix: convert to sequential early returns at the top of the component.',
          ],
          tryIt:
            'Write a `FavouritesList` with the four-state ladder. Then deliberately break it by rendering the `.map()` first and moving the `if (loading)` guard below it. Load it against a slow network (throttle to Slow 3G in devtools) and read the exact error in the console. (You will get "Cannot read properties of null (reading \'map\')", because data is null during the first render. Restoring the order fixes it.)',
          takeaway:
            'Conditional rendering is plain JS expressions: `&&`, ternaries, early returns. Guard the left side of `&&` against `0`, and render every data view as four early returns in the order loading, error, empty, data.',
        },
      ],
    },
    {
      id: 'm5-s2',
      title: 'State, effects, and the hooks that matter',
      topics: [
        {
          id: 'm5-t6',
          title: 'useState — state is a snapshot, not a variable',
          explain:
            'useState gives a component memory that survives re-renders, but the value you read is a fixed snapshot of that render — not a live variable you can read back after setting.',
          analogy:
            'A Yakshagana photographer takes one frame of the performance. Within that frame, the pose is fixed — you cannot ask the photograph "what happens next?" To see the next pose you take a new photograph. Each render of your component is one photograph: the state value in it is frozen for that frame. Calling the setter does not edit the current photo; it schedules a new one to be taken.',
          theory:
            '`const [count, setCount] = useState(0)` does two things: it remembers a value across renders, and it gives you a setter that, when called, tells React to re-render with a new value. The subtlety that trips up every beginner: **within a single render, the state variable is a constant.** `count` in this render is a snapshot. Calling `setCount(5)` does not change `count` to `5` on the next line — `count` is still whatever it was when this render began. React schedules a *new render* in which `count` will be `5`. State is a snapshot, not a live cell.\n\nThis explains a bug everyone writes once. In one click handler you call `setCount(count + 1)` twice, expecting `+2`. You get `+1`. Because `count` is a snapshot — say `3` — both calls are `setCount(3 + 1)`, i.e. `setCount(4)` twice. React coalesces them and the result is `4`, not `5`. The fix is the **updater form**: `setCount(c => c + 1)`. This passes a *function* that receives the latest pending value and returns the next one. React applies them in sequence: `3 → 4 → 5`. Rule: **when the next state depends on the previous state, use the updater form.**\n\nThe second rule: **never mutate state; produce a new value.** `filters.category = \'portrait\'; setFilters(filters)` mutates the existing object and hands React the *same reference* — React compares old and new by identity, sees no change, and skips the re-render. Spread into a fresh object instead: `setFilters({ ...filters, category: \'portrait\' })`. Same for arrays: build a new array with spread, `map`, or `filter`, never `push`/`splice` on state. Treat every state value as immutable.\n\nThe third principle is **where state lives**. State belongs in the **lowest common ancestor** of every component that needs it — "lifting state up". In KalaKaara\'s browse page, the search text, the selected category, and the location filter are all read by the `SearchForm`, consumed by the `useArtists` hook, and reflected in the results count. Their lowest common ancestor is `BrowsePage`, so the filter state lives there, passed down to the form and read by the hook. Put it lower (inside SearchForm) and the hook cannot see it; put it higher (in App) and unrelated pages re-render on every keystroke. Lowest common ancestor is the sweet spot.',
          diagram: `graph TD
    NB[Navbar<br/>shows result count]
    BP[BrowsePage<br/>← filter state LIVES here<br/>lowest common ancestor]
    SF[SearchForm<br/>needs to WRITE filters]
    UA[useArtists hook<br/>needs to READ filters]
    RC[ResultsCount<br/>needs to READ count]

    BP -->|filters + setFilters down| SF
    BP -->|filters down| UA
    BP -->|count down| RC
    SF -.->|onChange calls setFilters<br/>event UP| BP

    style BP fill:#fde68a`,
          flowExplain:
            'Filter state sits in BrowsePage — the lowest node that is an ancestor of both the form that writes it and the hook that reads it. Any lower and the hook could not see it; any higher and unrelated components would re-render on every keystroke.',
          whyItMatters:
            'The snapshot model and the updater form are the two ideas that separate developers who "fight React" from those who work with it. Nearly every "my counter is off by one" and "my UI does not update after setState" bug traces to reading state as a live variable or mutating it. "Lifting state up" is a named pattern interviewers expect you to apply on the spot.',
          steps: [
            'Declare `const [filters, setFilters] = useState({ category: null, location: null, q: \'\' })` in BrowsePage.',
            'Update one field immutably: `setFilters(f => ({ ...f, category: cat }))`. Note the updater form *and* the spread — both matter.',
            'Reproduce the off-by-one bug: call a naive `setCount(count + 1)` twice in a handler and confirm it only advances by one.',
            'Fix it with `setCount(c => c + 1)` twice and confirm it advances by two.',
            'Deliberately mutate: `filters.q = \'x\'; setFilters(filters)`. Watch nothing happen, because the reference did not change. Then fix with spread.',
          ],
          code: `function BrowsePage() {
  // Filter state lives HERE — the lowest common ancestor of the form
  // (which writes it) and the hook (which reads it).
  const [filters, setFilters] = useState({ category: null, location: null, q: '' });

  // ✅ Updater form + spread: new value depends on the old, and we make a
  //    NEW object so React sees the change by reference.
  function handleCategory(category) {
    setFilters((f) => ({ ...f, category }));
  }

  const { data, loading, error } = useArtists(filters);

  return (
    <>
      <SearchForm filters={filters} onCategory={handleCategory} />
      <ResultsCount count={data?.length ?? 0} />
      {/* ...four-state ladder from t5... */}
    </>
  );
}

// The snapshot pitfall, isolated:
function reproduceOffByOne() {
  // Suppose count is 3 in this render.
  // setCount(count + 1);  // schedules setCount(4)
  // setCount(count + 1);  // ALSO schedules setCount(4) — count is a snapshot!
  // Result: 4, not 5.
  //
  // Fix — the updater form receives the latest pending value:
  // setCount((c) => c + 1);  // 3 → 4
  // setCount((c) => c + 1);  // 4 → 5   ✅
}

// ❌ Mutation React cannot see:
//   filters.q = 'dosa'; setFilters(filters);  // same reference → no re-render
// ✅ New reference every time:
//   setFilters((f) => ({ ...f, q: 'dosa' }));`,
          pitfalls: [
            '**Reading state right after setting it.** `setCount(5); console.log(count)` logs the old value — `count` is this render\'s snapshot. Fix: the new value appears on the next render; if you need it now, compute it in a local variable.',
            '**`setX(x + 1)` called multiple times per handler.** They all read the same snapshot and collapse into one increment. Fix: the updater form `setX(c => c + 1)` when the next value depends on the previous.',
            '**Mutating a state object or array then setting it.** Same reference means React skips the re-render. Fix: spread into a new object/array — `{...obj}`, `[...arr]`, `arr.filter(...)`.',
            '**Putting filter state inside SearchForm.** Then `useArtists` in the parent cannot read it. Fix: lift state to the lowest common ancestor of everyone who needs it.',
            '**Deriving values into state.** Storing `filteredArtists` in state and syncing it with `useEffect` invites drift. Fix: compute derived values during render (with `useMemo` if expensive, t9) — do not mirror them into state.',
          ],
          tryIt:
            'In BrowsePage, add a "reset filters" button and a "clear search text only" button. Implement both with the updater form and immutable updates. Then, in the category handler, deliberately mutate `filters.category = cat` before calling `setFilters(filters)` and confirm the grid does not refresh. (It will not, because the object reference is unchanged — proving why spread is mandatory.)',
          takeaway:
            'State is a per-render snapshot, not a live variable. Use the updater form `setX(c => ...)` when the next value depends on the last, never mutate state (spread instead), and keep state in the lowest common ancestor that needs it.',
        },
        {
          id: 'm5-t7',
          title: 'useEffect — synchronising with the outside world',
          explain:
            'useEffect is for synchronising your component with something outside React — a network request, a subscription, the document title — and its dependency array is a correctness contract, not a performance dial.',
          analogy:
            'A fishing boat keeps its radio tuned to the harbour frequency. When it moves to a new fishing zone, it re-tunes; when it docks, it switches the radio off. Tuning to a channel is the effect; the current zone is the dependency; switching the radio off at dock is the cleanup. You do not re-tune on a whim ("after every wave") — you re-tune when the thing you are synced to (the zone) changes.',
          theory:
            'The wrong mental model — "useEffect runs code after render" — is where most effect bugs are born. The right model, straight from the React docs: **an effect synchronises your component with an external system.** External means outside React\'s control — the network (a Supabase fetch), a browser API (`document.title`, `localStorage`), a subscription (Supabase Realtime, a `setInterval`, a DOM event listener). If a piece of logic does not reach outside React, it usually does not belong in an effect at all — derived data should be computed during render, not synced in an effect.\n\nAn effect has three parts and three shapes. The parts: a **setup** function (the body) that connects to the external system, an optional **cleanup** function it returns that disconnects, and a **dependency array** that lists every reactive value the setup reads. React runs setup after the render commits; before the next setup and on unmount, it runs the previous cleanup. The three shapes of the dependency array:\n- **`[]`** — run setup once after mount, cleanup once on unmount. For a subscription that never needs to change.\n- **`[dep]`** — re-run whenever `dep` changes: cleanup the old, setup the new. This is the common case — fetch this `slug`, re-fetch when `slug` changes.\n- **no array at all** — run after *every* render. Almost always a bug (and often an infinite loop if the effect sets state).\n\nThe dependency array is a **correctness contract, not a performance knob.** It is not "list fewer deps to run less often". It is a promise: "these are all the external values my setup reads; re-synchronise whenever any of them changes." Lie to that contract — omit a dependency the effect actually uses — and you get the **stale closure** bug. The effect body captures the values from the render in which it was created; if you omit `filters` from the deps, the effect keeps fetching with the *first* render\'s filters forever, because it closed over that render\'s snapshot and React never re-ran it. The lint rule `react-hooks/exhaustive-deps` exists specifically to catch this; obey it, and when it flags a dependency, the fix is almost never to silence the lint — it is to include the dep, or to restructure so the value is not needed.',
          diagram: `graph TD
    R[Component renders<br/>returns element tree] --> C[React commits to the DOM]
    C --> D{Did any dependency<br/>in the array change?}
    D -- yes / first mount --> CL[Run PREVIOUS cleanup<br/>if there was one]
    CL --> SU[Run setup:<br/>connect to external system<br/>fetch / subscribe / set title]
    D -- no --> SKIP[Skip the effect entirely]
    SU --> IDLE[Idle until next render]
    SKIP --> IDLE
    IDLE --> U[Component unmounts] --> FIN[Run final cleanup<br/>disconnect / unsubscribe]

    style SU fill:#dcfce7
    style FIN fill:#fee2e2`,
          flowExplain:
            'The cleanup runs before every re-setup, not only on unmount — so a `[slug]` effect tears down slug A\'s subscription before setting up slug B\'s. That ordering is what makes cleanup the correct place to cancel a stale fetch (t8).',
          whyItMatters:
            'useEffect is the most misused hook in React. Understanding it as "synchronise with an external system, and the deps are a contract" prevents infinite loops, stale data, and duplicated subscriptions — the three effect bugs that dominate real bug trackers. Every data-fetching hook in KalaKaara is an effect, so getting this right is load-bearing for the whole app.',
          steps: [
            'Write an effect that syncs the document title to the current artist: `document.title = artist.displayName`; deps `[artist.displayName]`.',
            'Write a data effect with deps `[slug]` that fetches an artist and re-fetches only when the slug changes.',
            'Add a cleanup that returns a teardown function; log inside it and watch it fire before each re-run and on unmount.',
            'Deliberately omit a dependency the effect reads, then change that value and watch the effect keep using the stale one. Add it back and watch it re-sync.',
            'Turn on `eslint-plugin-react-hooks` and let `exhaustive-deps` guide your arrays; treat every warning as a real bug to fix, not to silence.',
          ],
          code: `import { useEffect, useState } from 'react';

// Effect = synchronise with an external system. Here: the network.
function useArtist(slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;              // cleanup guard (full story in t8)
    setLoading(true);
    setError(null);

    artistService.getBySlug(slug)       // the external system
      .then((a) => { if (!cancelled) setData(a); })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });

    // CLEANUP: runs before the next setup and on unmount.
    return () => { cancelled = true; };
  }, [slug]);                            // CONTRACT: re-sync when slug changes.
  //   ^ omit slug and you get a stale closure — forever fetching the first slug.

  return { data, loading, error };
}

// A non-network effect: sync the browser tab title to the artist.
function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;                 // setup: reach outside React
    return () => { document.title = previous; };  // cleanup: restore it
  }, [title]);                              // re-sync when the title changes
}

// The three shapes:
//   [], [dep], (none)  →  once / on-change / every-render(almost always a bug)`,
          pitfalls: [
            '**Thinking of useEffect as "run after render" instead of "synchronise with an external system".** That framing leads to effects that duplicate render logic. Fix: if the work does not touch the network, a subscription, or a browser API, it probably belongs in render, not an effect.',
            '**Omitting a dependency to "avoid re-runs".** The effect then reads stale values from the render it was created in (stale closure). Fix: include every reactive value the effect reads; the deps array is a contract, not a throttle.',
            '**No dependency array at all.** The effect runs after every render; if it calls `setState`, that triggers another render, and you have an infinite loop. Fix: add the array with the real dependencies.',
            '**Forgetting cleanup on subscriptions and timers.** Each render adds another `setInterval` or Realtime channel; they pile up and fire repeatedly. Fix: return a cleanup that clears the timer / removes the channel.',
            '**Silencing the exhaustive-deps lint with a disable comment.** You are overriding the tool that catches stale closures. Fix: satisfy the rule — add the dep, or move the value out of the effect (useCallback/useMemo, t9).',
          ],
          tryIt:
            'Write a `useDocumentTitle(title)` hook and call it in ArtistDetailPage with the artist\'s name. Navigate between two artists and watch the browser tab update. Then remove `title` from the dependency array and navigate again: the tab title freezes on the first artist. That frozen title *is* the stale closure — the effect captured the first render\'s title and never re-ran.',
          takeaway:
            'An effect synchronises your component with an external system; it has setup, cleanup, and a dependency array. That array is a correctness contract — list every reactive value the effect reads, or suffer a stale closure.',
        },
        {
          id: 'm5-t8',
          title: 'The fetch race condition every beginner ships',
          explain:
            'When you fetch on a changing dependency, a slow earlier request can resolve after a faster later one and overwrite it with stale data — fix it by ignoring resolved results in the effect cleanup.',
          analogy:
            'You send two runners to the Kollur post office: the first for a parcel to Rukmini, and before he returns you send a second for a parcel to Ganesh. If the first runner is slow and arrives *after* the second, and you simply take "whatever the last runner hands you", you end up with Rukmini\'s parcel on Ganesh\'s counter. You need a rule: when the second runner leaves, cancel your interest in the first — whatever he brings back, drop it.',
          theory:
            'This is the most common data bug beginners ship, and it hides until the network is slow. The setup: an artist detail page fetches by `slug` in a `[slug]` effect. A user opens artist A (slug `rukmini`); the request goes out. Before it resolves — mobile data, a paused free-tier database waking up — they click to artist B (slug `ganesh`). The effect re-runs, and a second request goes out. Now two requests are in flight. If A\'s request happens to resolve *after* B\'s (slower query, retried packet), the A `.then` fires last and calls `setData(artistA)` — **overwriting the correct artist B that is currently on screen.** The user is looking at Ganesh\'s URL and Rukmini\'s data. Nothing errored; the data is simply wrong. It is a **race condition**: correctness depends on which request wins a race you do not control.\n\nThe fix uses the effect cleanup. Because the `[slug]` cleanup runs *before* the next setup, you can flip a flag that the in-flight promise checks before it commits. Declare `let cancelled = false` at the top of the effect; in cleanup, set `cancelled = true`; in every `.then`/`.catch`/`.finally`, guard with `if (!cancelled)`. When the user navigates from A to B, React runs A\'s cleanup (`cancelled = true` for A\'s effect) before setting up B\'s. When A\'s slow response finally lands, its `if (!cancelled)` is now false, so it silently discards the result instead of calling `setData`. B\'s effect has its own fresh `cancelled = false` and commits normally. The latest request always wins, regardless of resolution order.\n\nThe flag does not actually cancel the network request — it just ignores its result. To cancel the request itself (freeing the connection), pass an **`AbortController`** signal to `fetch`, and abort it in cleanup; `supabase-js` v2 accepts an `AbortSignal` via `.abortSignal(controller.signal)`. For most of KalaKaara the `cancelled` flag is enough and simpler, which is exactly why **every hook in this course carries that guard** — you saw it in m0\'s `useArtist`, and now you know precisely which bug it prevents.',
          diagram: `sequenceDiagram
    autonumber
    actor U as User
    participant E as useArtist effect
    participant N as Network / Supabase
    U->>E: open artist A (slug rukmini)
    E->>N: request A  (cancelled_A = false)
    U->>E: navigate to artist B (slug ganesh)
    Note over E: cleanup for A runs → cancelled_A = true
    E->>N: request B  (cancelled_B = false)
    N-->>E: response B arrives first
    E->>E: !cancelled_B → setData(ganesh) ✅ correct
    N-->>E: response A arrives LATE
    E->>E: cancelled_A is true → DROP it ✅ no overwrite
    Note over U: Screen stays on Ganesh. Race defused.`,
          flowExplain:
            'The two Notes are the fix. A\'s cleanup sets `cancelled_A = true` the instant the user navigates away, so when A\'s slow response finally lands it is dropped instead of overwriting B. Without the flag, step "response A arrives late" would call setData and clobber Ganesh.',
          whyItMatters:
            'This exact race is a favourite interview question ("you fetch on a prop change — what can go wrong?") and a real bug that ships to production because it only surfaces under slow or variable networks — precisely the conditions KalaKaara\'s Kundapura users are on. Knowing the cleanup-flag fix cold marks you as someone who has actually debugged async React.',
          steps: [
            'Write the naive version: a `[slug]` effect that fetches and calls `setData` with no guard.',
            'Throttle the network (devtools → Slow 3G) and rapidly navigate A → B. Observe the screen sometimes settle on the wrong artist.',
            'Add `let cancelled = false` at the top, `return () => { cancelled = true }` as cleanup, and `if (!cancelled)` around every state set.',
            'Repeat the rapid navigation under throttling; the screen now always matches the URL.',
            'For a heavier endpoint, swap the flag for an `AbortController`: pass `controller.signal` to the request and `controller.abort()` in cleanup to also cancel the network work.',
          ],
          code: `import { useEffect, useState } from 'react';

// ❌ The bug — no guard. Under a slow network, a late response overwrites a
//    newer one. Screen shows the wrong artist for the current URL.
function useArtistBuggy(slug) {
  const [data, setData] = useState(null);
  useEffect(() => {
    artistService.getBySlug(slug).then(setData); // last-to-RESOLVE wins. Wrong.
  }, [slug]);
  return data;
}

// ✅ The fix — a cancelled flag flipped in cleanup. Last-REQUESTED wins.
function useArtist(slug) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    artistService.getBySlug(slug)
      .then((a) => { if (!cancelled) setData(a); })       // stale result? drop it
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };  // navigating away marks THIS run stale
  }, [slug]);

  return { data, loading, error };
}

// ✅✅ To also CANCEL the network work (not just ignore it): AbortController.
//   const controller = new AbortController();
//   artistService.getBySlug(slug, { signal: controller.signal })...
//   return () => controller.abort();
//   supabase-js v2:  query.abortSignal(controller.signal)`,
          pitfalls: [
            '**Assuming requests resolve in the order you sent them.** They do not — a slow first request can land after a fast second. Fix: guard every state set with a cleanup flag so only the latest run commits.',
            '**Guarding only `.then` but not `.catch`/`.finally`.** A stale error or a stale `setLoading(false)` still corrupts the current view. Fix: wrap all of `.then`, `.catch`, and `.finally` in `if (!cancelled)`.',
            '**Putting the flag outside the effect.** A module-level or component-level flag is shared across runs and defeats the per-run isolation. Fix: declare `let cancelled = false` *inside* the effect body so each run gets its own.',
            '**Thinking the flag cancels the network request.** It only ignores the result; the request still completes. Fix: that is fine for most reads, but use `AbortController` when you must free the connection or stop expensive work.',
            '**Only testing on fast wifi.** The race is invisible at 20ms latency and appears constantly on 3G. Fix: always test data fetching under throttling before believing it is correct.',
          ],
          tryIt:
            'Reproduce the race deliberately: make `artistService.getBySlug` wait `slug === \'rukmini\' ? 2000 : 200` milliseconds before resolving, remove the cancelled guard, then click rukmini → ganesh quickly. The page ends on Rukmini\'s data at Ganesh\'s URL. Add the guard back and repeat — it now stays on Ganesh. You have just seen, and fixed, the bug that guard exists for.',
          takeaway:
            'Fetching on a changing dependency races: a slow earlier request can overwrite a newer one. A `cancelled` flag set in the effect cleanup makes the latest request win — which is why every hook in this course carries that guard.',
        },
        {
          id: 'm5-t9',
          title: 'useMemo and useCallback — and the one place they matter here',
          explain:
            'useMemo caches a computed value and useCallback caches a function\'s identity across renders; most of the time they cost more than they save, but one specific case in KalaKaara genuinely needs them.',
          analogy:
            'Grinding the batter for neer dosa is worth doing once and keeping in the fridge — that is useMemo, caching an expensive result. But wrapping every single spoon and plate in cling film "to keep it fresh" wastes more film than it saves. Memoise the batter (the expensive thing that many dishes reuse); do not memoise the spoon.',
          theory:
            '`useMemo(fn, deps)` runs `fn` and caches its return value, recomputing only when a dependency changes. `useCallback(fn, deps)` is the same idea for a function: it returns the *same function reference* across renders until a dependency changes. They do two different jobs — **skip recomputation** (useMemo) and **preserve reference identity** (useCallback) — but they share one purpose: stability across renders.\n\nHere is the honest part beginners are rarely told: **most useMemo and useCallback calls do nothing useful and cost you.** They add code, add a dependency array to keep correct, and add a small runtime cost — the cache check itself — on every render. Wrapping `useMemo(() => a + b, [a, b])` around cheap arithmetic is pure overhead. They only pay off when (a) the computation is genuinely expensive and rerun often, or (b) the value\'s *reference identity* is used as a dependency or a memoisation key somewhere downstream. If neither is true, delete them.\n\nNow the one place they genuinely matter in KalaKaara, and it is (b). Your `useArtists(filters)` hook fetches whenever `filters` changes, via `useEffect(() => {...}, [filters])`. Suppose BrowsePage builds the filter object inline in render: `useArtists({ category, location, q })`. Every render creates a **brand-new object** — and `{} !== {}` in JavaScript, objects compare by reference. So `filters` is a different reference on every single render, the effect\'s dependency array sees a "change" every time, and **useArtists re-fetches on every render** — including renders caused by unrelated state, including the render caused by the fetch\'s own `setLoading`. That is an infinite-ish refetch loop and a hammered database.\n\nThe fix is `useMemo`: `const filters = useMemo(() => ({ category, location, q }), [category, location, q])`. Now the object keeps a **stable reference** as long as its actual contents are unchanged, so the effect only re-runs when a real filter value changes. This is not premature optimisation — it is *correctness*, because the dependency array\'s contract (t7) depends on referential stability. The same reasoning applies to `useCallback` when you pass a handler into a `React.memo`-wrapped child or into another hook\'s dependency array: without it, a fresh function each render defeats the memoisation or retriggers the effect. Rule: **reach for useMemo/useCallback when a non-primitive value (object, array, function) flows into a dependency array or a memoised child — not to speed up arithmetic.**',
          whyItMatters:
            'The "new object as a dependency" refetch loop is one of the most common performance bugs in real React apps, and its fix reveals whether you truly understand referential equality and the dependency-array contract. Interviewers love it because the naive code looks completely correct. Equally important is the maturity to *not* memoise everything — cargo-culted useMemo is a real code smell.',
          steps: [
            'Build the browse filter object inline: `useArtists({ category, location, q })`, and log inside the useArtists effect. Watch it fire on every render.',
            'Wrap the object in `useMemo(() => ({ category, location, q }), [category, location, q])` and watch the effect now fire only when a filter value actually changes.',
            'Confirm why: log `prevFilters === filters` across renders — inline it is always false, memoised it is true until contents change.',
            'Wrap a handler passed to a `React.memo` child in `useCallback` and confirm the child stops re-rendering on unrelated parent updates.',
            'Take an existing `useMemo` around cheap arithmetic and delete it; confirm nothing changes except less code. Memoise only what earns it.',
          ],
          code: `import { useMemo, useCallback, useState } from 'react';

function BrowsePage() {
  const [category, setCategory] = useState(null);
  const [location, setLocation] = useState(null);
  const [q, setQ] = useState('');

  // ❌ Inline object: a NEW reference every render. {} !== {}.
  //    useArtists' [filters] effect sees a "change" every render → refetch loop.
  //    const { data } = useArtists({ category, location, q });

  // ✅ Memoised: stable reference until an actual filter value changes.
  //    THIS is the one place useMemo is not optional here — it is correctness.
  const filters = useMemo(
    () => ({ category, location, q }),
    [category, location, q],
  );
  const { data, loading, error } = useArtists(filters);

  // ✅ useCallback keeps this handler's identity stable, so a React.memo'd
  //    child or a hook depending on it does not re-run every render.
  const handleFavorite = useCallback((artistId) => {
    favoriteService.toggle(artistId);
  }, []);

  return <ArtistGrid artists={data} onFavorite={handleFavorite} />;
}

// The hook that made the stability necessary:
function useArtists(filters) {
  const [data, setData] = useState([]);
  useEffect(() => {
    let cancelled = false;
    artistService.search(filters).then((r) => { if (!cancelled) setData(r); });
    return () => { cancelled = true; };
  }, [filters]);   // filters MUST be referentially stable or this loops.
  return { data /* + loading, error */ };
}`,
          pitfalls: [
            '**Passing an inline object/array into a hook that depends on it.** A fresh reference every render makes the dependency array fire endlessly. Fix: `useMemo` the object so its reference is stable while its contents are.',
            '**Memoising cheap computations.** `useMemo(() => x * 2, [x])` costs more than it saves. Fix: only memoise genuinely expensive work or values used for reference identity.',
            '**A wrong or missing dependency array on useMemo/useCallback.** Stale deps mean a stale cached value — a subtle correctness bug. Fix: include exactly the values the computation reads; let exhaustive-deps check you.',
            '**useCallback that is never consumed by a memoised child.** If the function is only called directly in render, wrapping it does nothing. Fix: useCallback earns its place only when identity flows into React.memo or another hook\'s deps.',
            '**Believing useMemo guarantees the value is never recomputed.** React may discard the cache under memory pressure; it is an optimisation, not a semantic guarantee. Fix: never rely on useMemo for correctness of side effects — only for perf and reference stability.',
          ],
          tryIt:
            'Add a `console.log(\'fetching\', filters)` inside useArtists\' effect. Build the filter object inline and interact with an unrelated piece of state on the page (say, a "show map" toggle). Count the fetches per toggle. Then wrap the object in useMemo and count again. (Inline: a fetch on every toggle and every render. Memoised: zero fetches until a real filter changes.) That difference is the whole lesson.',
          takeaway:
            'useMemo skips recomputation; useCallback preserves function identity. Do not sprinkle them on arithmetic. The case that matters here: memoise the filter object passed to useArtists, or `{} !== {}` makes it refetch every render.',
        },
        {
          id: 'm5-t10',
          title: 'useRef — a mutable box that does not re-render',
          explain:
            'useRef gives you a mutable container whose `.current` you can read and write without ever triggering a re-render — useful for reaching into the DOM and for holding values across renders that the UI does not display.',
          analogy:
            'Under the seva counter at a temple there is a small drawer where the archaka keeps a pen and a running tally slip. Changing what is in the drawer does not change the notice board out front — it is private working storage. useRef is that drawer: you can put things in and take them out all day, and the display (the render) never flinches. State is the notice board; a ref is the drawer.',
          theory:
            '`const inputRef = useRef(null)` returns an object `{ current: null }` that React keeps stable across every render — the *same* object, not a new one each time. Two properties define it, and both distinguish it sharply from state. **First, writing `ref.current = x` does not trigger a re-render.** Where `setState` schedules a new render, mutating a ref is silent — the value changes, the UI does not react. **Second, the ref persists across renders** — unlike a plain local variable, which is recreated every render, `ref.current` survives. So a ref is "an instance variable for a function component": mutable, persistent, and invisible to rendering.\n\nThat combination makes refs wrong for anything the UI displays (use state) and right for two categories. **Category one: reaching into a DOM node.** When you write `<input ref={inputRef} />`, React sets `inputRef.current` to the actual DOM element after mount. Now you can call imperative DOM methods React does not otherwise expose — `inputRef.current.focus()`, `.scrollIntoView()`, measuring `.offsetHeight`. KalaKaara focuses the browse search input on mount so a user can start typing immediately: a `useEffect(() => inputRef.current?.focus(), [])`. **Category two: holding a mutable value across renders that must not cause a re-render.** The prime example, and the one that pairs with t11, is a **debounce timer id.** When the user types, you `clearTimeout(timerRef.current)` and `timerRef.current = setTimeout(...)`. The timer id changes on every keystroke, but it is bookkeeping, not display data — storing it in state would trigger a pointless re-render on every keystroke and could even fight the debounce. A ref is exactly right.\n\nTwo cautions. Do not read or write `ref.current` *during* render to compute the output — that makes rendering impure and unpredictable; touch refs in effects and event handlers, where side effects belong. And remember a fresh ref value is `null` until the DOM mounts, so guard DOM refs with optional chaining (`inputRef.current?.focus()`) especially in effects that run before paint.',
          whyItMatters:
            'Beginners misuse state for values that should be refs (causing render storms) and misuse refs for values that should be state (causing stale UI). Knowing the boundary — "does the UI need to react to this change?" — is a core React judgment call. The focus-on-mount and debounce-timer patterns are both real, small, and frequently asked about.',
          steps: [
            'Create `const searchRef = useRef(null)` and attach it: `<input ref={searchRef} />`.',
            'Focus it on mount with `useEffect(() => { searchRef.current?.focus(); }, [])` so the cursor is ready in the search box.',
            'Create `const timerRef = useRef(null)` to hold a debounce timeout id (t11 uses it).',
            'On each keystroke, `clearTimeout(timerRef.current)` then `timerRef.current = setTimeout(fn, 300)`. Confirm typing does not re-render just from the timer changing.',
            'Prove the no-re-render property: mutate `ref.current` in a handler and add a render counter; the counter does not move.',
          ],
          code: `import { useRef, useEffect, useState } from 'react';

// Use 1 — reach into the DOM: focus the search input the moment the page loads.
function SearchForm({ onSearch }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();   // ref is the real <input> after mount
  }, []);                        // once, on mount

  return (
    <input
      ref={inputRef}
      type="search"
      placeholder="Search artists in Kundapura..."
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}

// Use 2 — hold a mutable value across renders WITHOUT re-rendering:
// a debounce timer id. Changing it on every keystroke must not re-render.
function useDebouncedCallback(fn, delay) {
  const timerRef = useRef(null);   // survives renders, invisible to the UI

  return (...args) => {
    clearTimeout(timerRef.current);            // cancel the pending call
    timerRef.current = setTimeout(() => fn(...args), delay); // schedule anew
    // Storing this id in useState would re-render on every keystroke — wrong.
  };
}

// The rule: does the UI need to react to this value's change?
//   yes → useState        no  → useRef`,
          pitfalls: [
            '**Storing display data in a ref.** You update `ref.current` and the screen never changes, because refs do not re-render. Fix: if the UI must reflect it, it is state, not a ref.',
            '**Reading a DOM ref before mount.** In the render body or a same-tick effect, `ref.current` may be `null`. Fix: access DOM refs in effects/handlers and guard with `?.`.',
            '**Mutating a ref during render to compute output.** Rendering must be pure; a ref read/write in render makes output depend on render timing. Fix: touch refs only in effects and event handlers.',
            '**Using state for a debounce timer id.** Every keystroke re-renders needlessly and can disrupt the debounce. Fix: keep the timer id in a ref — it is bookkeeping, not display.',
            '**Expecting `useRef(initial)` to reset when `initial` changes.** The argument is only used on the first render; later changes are ignored. Fix: assign `ref.current` explicitly in an effect if it must track a prop.',
          ],
          tryIt:
            'Add a render counter to SearchForm: `const renders = useRef(0); renders.current++;` and log it. Type ten characters and note how many times the component renders. Now move the debounce timer id from a ref into `useState` and type ten characters again. (With the ref: renders only when parent state changes. With state: a re-render on every keystroke from the timer id churn.) The gap is why timers live in refs.',
          takeaway:
            'useRef is a mutable, persistent box whose changes never re-render. Use it to reach into DOM nodes (focus the search input) and to hold non-display values across renders (a debounce timer id). If the UI must react, use state instead.',
        },
        {
          id: 'm5-t11',
          title: 'Custom hooks — and the Rules of Hooks',
          explain:
            'A custom hook is just a function whose name starts with "use" and that calls other hooks; extracting one lets many components share stateful logic — and the Rules of Hooks exist because React matches hook state by call order.',
          analogy:
            'A Yakshagana troupe has a fixed pre-show ritual performed in the same order every single night: light the lamp, sound the chende, then the invocation. The stage manager tracks progress by *position in the sequence* — "we are on step two" — not by the name of the step. Skip a step one night, or do them out of order, and everything after it is mislabelled. React tracks your hooks the same way: by their position in the call sequence, which is why the sequence must be identical on every render.',
          theory:
            'There is no magic in custom hooks. **A hook is a function that (a) is named `useSomething` and (b) calls at least one other hook.** That is all. `useArtists(filters)` is a plain function that internally calls `useState`, `useEffect`, and returns `{ data, loading, error }`. Extracting it moves the fetch-loading-error-cancel logic out of your component so any page can reuse it, and — per the m0 convention — every hook in KalaKaara returns that exact `{ data, loading, error }` shape. You have already met the pieces: `useArtists` wraps the effect from t7, the race guard from t8, and takes the memoised filters from t9. Compose them and you have a reusable data hook. A second example, `useDebounce(value, 300)`, returns a version of `value` that only updates after the input has been quiet for 300ms — perfect for not firing a search on every keystroke, built from `useState` + `useEffect` + a cleanup that clears the timer.\n\nThe payoff of custom hooks is that stateful logic becomes as reusable as a plain function, but *without* the wrapper-component gymnastics that older patterns (render props, higher-order components) required. Logic in, `{ data, loading, error }` out.\n\nNow the **Rules of Hooks**, and crucially *why* they exist rather than just what they are. Rule one: **only call hooks at the top level** — never inside a condition, loop, or nested function. Rule two: **only call hooks from React functions** — components or other hooks, not plain functions or class methods. The reason for rule one is the whole point: **React does not know your hooks by name. It matches them by call order.** On each render, React walks your hooks in sequence and hands the first `useState` call its slot, the second `useState` call the next slot, and so on. It is literally counting: "this is the third hook this render, give it the third piece of stored state." If you wrap a `useState` in an `if` and the condition is false one render, every subsequent hook shifts up a slot — the fourth hook now receives the third hook\'s state, and everything after is corrupted. There is no name to fall back on because you never gave your hooks names; you gave them positions. So the rule "same hooks, same order, every render" is not bureaucracy — it is the only thing that lets React associate a `useState` call with its stored value across renders. The `eslint-plugin-react-hooks` lint enforces both rules automatically; keep it on.',
          diagram: `graph TD
    R1["Render 1 — React counts calls in order"] --> A1["1: useState(data)"]
    A1 --> A2["2: useState(loading)"]
    A2 --> A3["3: useState(error)"]
    A3 --> A4["4: useEffect(fetch)"]
    C{"Wrap hook 2 in an if,<br/>condition false next render"} --> B1["1: useState(data)"]
    B1 --> B3["now-2: useState(error)<br/>❌ gets loading's slot"]
    B3 --> B4["now-3: useEffect<br/>❌ gets error's slot"]

    style B3 fill:#fecaca
    style B4 fill:#fecaca`,
          flowExplain:
            'The red boxes show the corruption: skip hook 2 conditionally and every later hook shifts down a slot, so `error` state is handed to what used to be hook 3. React had no names to catch the mistake — only positions — which is exactly why hooks must be called unconditionally, in the same order, every render.',
          whyItMatters:
            'Custom hooks are how professional React shares logic, and "how would you extract this into a hook?" is a standard interview task. Being able to state *why* the Rules of Hooks exist — call-order matching, not naming — rather than reciting them as arbitrary rules is a clear signal of real understanding, and it is what stops you from ever writing a conditional hook.',
          steps: [
            'Extract `useArtists(filters)`: move the state, the effect, the cancelled guard, and the return into a function named `useArtists` returning `{ data, loading, error }`.',
            'Build `useDebounce(value, delay)`: hold a debounced copy in state, update it in an effect after `delay`, and clear the timer in cleanup.',
            'Compose them in BrowsePage: `const debouncedQ = useDebounce(q, 300)`, feed it into the memoised filters, feed those into `useArtists`.',
            'Deliberately wrap a `useState` in an `if` and read the exhaustive-deps / rules-of-hooks lint error. Understand it as "you changed the call order".',
            'Confirm both hooks obey the rules: every hook call is at the top level, none inside a condition or loop.',
          ],
          code: `import { useState, useEffect } from 'react';

// A custom hook is just a function named useX that calls other hooks.
// Returns the course-wide shape: { data, loading, error }.
function useArtists(filters) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;                 // race guard from t8
    setLoading(true);
    setError(null);
    artistService.search(filters)
      .then((rows) => { if (!cancelled) setData(rows); })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters]);                           // filters must be memoised (t9)

  return { data, loading, error };
}

// useDebounce — return a value that only settles after 'delay' ms of quiet.
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);   // cancel if value changes before delay
  }, [value, delay]);
  return debounced;
}

// ❌ Rules of Hooks violation — React matches hooks by ORDER, not name:
//   if (filters) {
//     const [x, setX] = useState(0);   // conditional → shifts every later hook
//   }
// One render skips it, and useEffect below receives useState's slot. Corruption.
// Fix: call every hook unconditionally, at the top level, every render.`,
          pitfalls: [
            '**Calling a hook inside an `if`, loop, or callback.** The call order changes between renders and React hands stored state to the wrong hook. Fix: all hooks at the top level; put the condition *inside* the hook, not around it.',
            '**Early-returning before a hook.** `if (!slug) return null;` placed above a `useEffect` skips that hook on some renders — same order-shift bug. Fix: call all hooks first, then branch on their results.',
            '**Naming a hook without the `use` prefix.** The lint cannot recognise it as a hook and stops checking its rules. Fix: prefix every custom hook with `use`.',
            '**Returning inconsistent shapes from custom hooks.** `useArtists` returns `{ artists }` but `useArtist` returns `{ data }`, so pages cannot share render logic. Fix: every hook returns `{ data, loading, error }`, per the m0 convention.',
            '**Calling hooks from a plain helper function.** Only components and other hooks may call hooks. Fix: turn the helper into a `useX` hook, or move the hook call up into the component.',
          ],
          tryIt:
            'Extract `useDebounce` and wire it so BrowsePage only fetches 300ms after the user stops typing. Then, to feel the rule, wrap `useDebounce`\'s internal `useState` in `if (delay > 0)` and watch the rules-of-hooks lint error fire. Explain in one sentence what would break at runtime if you ignored the lint. (When `delay` is ever 0, that render skips a hook, shifting the effect into the state slot and corrupting both.)',
          takeaway:
            'A custom hook is just a `useX` function that calls hooks; extract `useArtists` and `useDebounce`, each returning `{ data, loading, error }` or a value. Hooks must be called unconditionally in the same order every render, because React matches them by call order, not by name.',
        },
      ],
    },
    {
      id: 'm5-s3',
      title: 'Routing, forms, and context',
      topics: [
        {
          id: 'm5-t12',
          title: 'React Router v6 and the URL as the source of truth',
          explain:
            'React Router maps URLs to components, nests layouts with an Outlet, reads params and query strings — and the browse filters live in the URL so a search is shareable and survives a refresh.',
          analogy:
            'The KSRTC bus board at Kundapura *is* the schedule — it is not a copy of some private list the conductor keeps in his head. Anyone can read it, photograph it, and act on it. When your browse filters live in the URL, the address bar is that public board: paste the link to a friend and they see the exact same filtered search, because the URL is the truth, not a hidden copy in a React variable that vanishes on refresh.',
          theory:
            'React Router v6 connects the browser URL to your component tree. You define routes with `createBrowserRouter` (or `<Routes>`/`<Route>`), and Router renders the component whose path matches the current URL — all without a full page reload, because it is a single-page app.\n\n**Nested routes and `<Outlet />`.** A `MainLayout` renders the shared shell — navbar, footer — and drops an `<Outlet />` where the current page should appear. Child routes render into that outlet. So `/` renders `MainLayout` wrapping `HomePage`, and `/artists` renders the *same* `MainLayout` wrapping `BrowsePage`; the navbar and footer never unmount or reload between them. This is why KalaKaara\'s session state and scroll behaviour survive navigation — only the outlet content swaps.\n\n**Reading the URL.** `useParams()` reads path segments: for a route `/artists/:slug`, `useParams().slug` is `\'rukmini-shetty\'`. `useSearchParams()` reads and writes the query string: `?category=portrait&location=kundapura`. `useNavigate()` returns a function to navigate imperatively — `navigate(\`/artists/\${slug}\`)` after an action. And `<Link to="/artists">` renders navigation that Router intercepts.\n\n**`<Link>` versus `<a>` — this one bites hard.** A plain `<a href="/artists">` triggers a **full page reload**: the browser throws away the entire JavaScript runtime, React unmounts, all in-memory state and any un-persisted session context is destroyed, and everything reloads from scratch — slow, and it loses where the user was. `<Link to="/artists">` intercepts the click, updates the URL via the History API, and swaps only the outlet — no reload, state preserved. **Use `<Link>` (or `<NavLink>`) for internal navigation, always; reserve `<a>` for external URLs.**\n\n**The URL as the single source of truth for browse filters.** This is the important design idea. You *could* store `category`, `location`, and `q` in `useState` inside BrowsePage. But then the filtered view is trapped in memory: refresh the page and the filters reset, and the URL still says `/artists`, so you cannot share or bookmark a search. Instead, store the filters in the URL via `useSearchParams`. The address becomes `/artists?category=portrait&location=kundapura&q=wedding`, which is **shareable** (paste it, the recipient sees the same results), **bookmarkable**, **refresh-proof** (reload rebuilds the filters from the URL), and **back-button-friendly** (the browser history holds each filter change). The URL is not a reflection of your state — it *is* your state. Your component reads filters from `searchParams` and writes filter changes back to `searchParams`; there is no separate `useState` to keep in sync, so there is nothing to drift.',
          diagram: `graph LR
    URL["URL is the SOURCE OF TRUTH:<br/>/artists?category=portrait&location=kundapura&q=wedding"]
    URL -->|useSearchParams reads| BP[BrowsePage builds filters object]
    BP -->|memoised filters| UA[useArtists fetches]
    UA --> GRID[Results grid renders]
    SF[SearchForm / filter controls] -->|setSearchParams WRITES back| URL
    URL -->|shareable link| FRIEND[Friend opens same filtered search]
    URL -->|refresh / back button| SAME[Same results rebuilt from URL]

    style URL fill:#fde68a`,
          flowExplain:
            'Notice the loop has no `useState` in it: controls write to the URL, and the page reads filters from the URL. Because the URL is the only store, refresh, back button, and a pasted link all reconstruct the exact same search — nothing to keep in sync, nothing to drift.',
          whyItMatters:
            'Storing shareable, navigable state in the URL rather than component state is the mark of a well-built browse/search page, and it is exactly what makes KalaKaara\'s filtered searches linkable. "Where should this state live — React state or the URL?" is a real architectural question interviewers probe, and the `<Link>` vs `<a>` reload distinction is a classic gotcha.',
          steps: [
            'Set up `createBrowserRouter` with a `MainLayout` parent route rendering `<Outlet />`, and child routes for `/`, `/artists`, `/artists/:slug`.',
            'Read the artist slug in ArtistDetailPage with `const { slug } = useParams()` and feed it to `useArtist(slug)`.',
            'Replace every internal `<a href>` with `<Link to>`; navigate and confirm no full reload (the network tab shows no document request).',
            'Move browse filters into the URL: read them with `useSearchParams`, and on a filter change call `setSearchParams({ ...current, category })`.',
            'Copy the resulting `/artists?...` URL into a new tab and confirm the same filtered results load — then refresh and confirm they survive.',
          ],
          code: `import { createBrowserRouter, RouterProvider, Outlet, Link,
         useParams, useSearchParams, useNavigate } from 'react-router-dom';

// Nested routes: MainLayout renders the shell + <Outlet/> for the page.
const router = createBrowserRouter([
  {
    element: <MainLayout />,           // navbar + <Outlet/> + footer
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/artists', element: <BrowsePage /> },
      { path: '/artists/:slug', element: <ArtistDetailPage /> },
    ],
  },
]);

function MainLayout() {
  return (
    <>
      <nav>
        <Link to="/">KalaKaara</Link>       {/* ✅ no reload, state survives */}
        <Link to="/artists">Browse</Link>
        {/* ❌ <a href="/artists"> would full-reload and destroy session state */}
      </nav>
      <main><Outlet /></main>               {/* the matched page renders here */}
      <footer>Coastal Karnataka artists</footer>
    </>
  );
}

// URL AS THE SOURCE OF TRUTH for browse filters — shareable + refresh-proof.
function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category');   // read filters FROM the URL
  const location = searchParams.get('location');
  const q = searchParams.get('q') ?? '';

  const filters = useMemo(() => ({ category, location, q }),
                          [category, location, q]);
  const { data, loading, error } = useArtists(filters);

  function setCategory(next) {
    const p = new URLSearchParams(searchParams);   // write filters BACK to URL
    if (next) p.set('category', next); else p.delete('category');
    setSearchParams(p);          // no useState — the URL is the only store
  }

  // ...four-state ladder... nothing to keep in sync, so nothing to drift.
}`,
          pitfalls: [
            '**Using `<a href>` for internal links.** It triggers a full page reload, unmounting React and wiping in-memory state. Fix: `<Link to>` / `<NavLink to>` for anything inside the app; `<a>` only for external sites.',
            '**Storing browse filters in useState instead of the URL.** Refresh resets them, and the search cannot be shared or bookmarked. Fix: keep filters in `useSearchParams` so the URL is the source of truth.',
            '**Duplicating filter state in both useState and the URL.** The two drift apart and you debug phantom mismatches. Fix: pick one store — the URL — and read/write only there.',
            '**Forgetting `<Outlet />` in the layout.** Child routes match but render nothing, because there is no outlet to render into. Fix: put `<Outlet />` where the page belongs in every layout route.',
            '**Mutating the existing `URLSearchParams` object from useSearchParams.** It can behave unexpectedly across renders. Fix: construct a fresh `new URLSearchParams(searchParams)`, modify that, and pass it to `setSearchParams`.',
          ],
          tryIt:
            'Wire the category chips and the location filter to `useSearchParams`. Filter to portrait artists in Kundapura, copy the URL, and open it in a private/incognito window. If the same filtered grid loads with no session, the URL truly is your source of truth. Then hit refresh and the back button — both should just work, for free, because you stored nothing in component state.',
          takeaway:
            'React Router maps URLs to components, nests layouts via `<Outlet />`, and reads `useParams`/`useSearchParams`. Use `<Link>` not `<a>` to avoid reloads, and store browse filters in the URL so a search is shareable, bookmarkable, and refresh-proof.',
        },
        {
          id: 'm5-t13',
          title: 'Controlled forms and the Context API',
          explain:
            'A controlled input is driven by React state so the component owns every keystroke; Context shares genuinely global values without prop-drilling — and KalaKaara has exactly two contexts on purpose.',
          analogy:
            'A controlled form is a temple donation counter where the clerk writes every rupee into the register *as you say it* — the register, not your memory, is the record, and the receipt is printed from the register. Context, meanwhile, is the temple\'s public announcement speaker: two things worth broadcasting to everyone — who is on duty (the session) and today\'s special sevas (favourites) — go on the speaker. You do not put every private conversation on the speaker, or nobody can hear anything useful.',
          theory:
            '**Controlled inputs.** In an uncontrolled input the DOM holds the value and you fish it out later; in a **controlled** input, React state holds the value and the input merely displays it: `<input value={form.q} onChange={handleChange} />`. The state is the single source of truth for what is typed, which means you can validate, transform, disable, and reset the field programmatically. For a whole form, hold one object in state and write **one `handleChange`** that keys off the input\'s `name` attribute: `setForm(f => ({ ...f, [e.target.name]: e.target.value }))`. One handler serves every field.\n\nGood form behaviour has four parts KalaKaara implements in the profile form. **Validate on blur** (when a field loses focus) so the user is not scolded mid-typing, *and* on submit as the final gate. **Disable submit while a save is pending** (`disabled={submitting}`) so a double-click cannot fire two inserts — the same idempotency concern as everywhere. **Preserve typed data when a save fails**: on error you show the message but leave `form` untouched, so the artist does not lose a 300-word bio to a dropped connection (the m0 lesson, in React form). Keep validation errors in their own `errors` state object keyed by field name.\n\n**The Context API.** Context solves one specific problem: a value needed by many components at many depths, where prop-drilling would thread it through a dozen uninterested intermediaries. You `createContext()`, wrap a subtree in `<SomeContext.Provider value={...}>`, and any descendant reads it with `useContext(SomeContext)` — no drilling. KalaKaara uses it for exactly the two things every corner of the app needs: `SessionContext` (is anyone signed in, and who) and `FavoritesContext` (the current user\'s favourite artist ids, so any ArtistCard anywhere can show a filled or empty heart).\n\nThe cost that beginners miss: **every consumer re-renders whenever the Provider\'s `value` changes identity.** If you write `value={{ user, signOut }}` inline, you create a **new object every render**, so every `useContext` consumer re-renders on every provider render, even when `user` did not actually change — the same `{} !== {}` trap from t9, now with app-wide blast radius. The fix is to **memoise the value**: `const value = useMemo(() => ({ user, signOut }), [user, signOut])`. And the discipline: **Context is for genuinely global state, not a convenience to avoid two levels of drilling.** Everything that is not global is a prop or a URL param. That is why KalaKaara draws a hard line at two contexts — session and favourites — and the browse filters, which might feel global, deliberately live in the URL (t12), not a context.',
          whyItMatters:
            'Controlled forms with per-field validation, a pending-disable, and error-preserving state are exactly what a real profile editor needs, and getting them wrong loses users\' work. On Context, the "value identity causes re-renders — memoise it" insight and the judgment to *limit* how much you put in Context separate developers who understand React\'s render model from those who make everything a context and then wonder why the whole app re-renders.',
          steps: [
            'Build the profile form as controlled inputs over one `form` state object, with a single `handleChange` keyed on `e.target.name`.',
            'Validate on blur into an `errors` object, and re-validate everything on submit before calling the service.',
            'Disable the submit button with `disabled={submitting || hasErrors}` and set `submitting` true around the async save.',
            'On save failure, set an error message but leave `form` untouched, so typed data survives; on success, navigate away.',
            'Create `SessionContext`, provide a `useMemo`ed value `{ user, signOut }`, and consume it with `useContext` in the Navbar. Confirm consumers do not re-render when the value object is stable.',
          ],
          code: `import { createContext, useContext, useMemo, useState } from 'react';

// CONTROLLED FORM — React state is the single source of truth for every field.
function ProfileForm({ onSave }) {
  const [form, setForm] = useState({ displayName: '', bio: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ONE handler for the whole form, keyed by the input's name attribute.
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validateField(name, value) {
    if (name === 'displayName' && !value.trim()) return 'Name is required';
    if (name === 'phone' && !/^\\d{10}$/.test(value)) return 'Enter 10 digits';
    return null;
  }
  function handleBlur(e) {                    // validate on BLUR, not mid-typing
    const err = validateField(e.target.name, e.target.value);
    setErrors((prev) => ({ ...prev, [e.target.name]: err }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(form);                     // service throws on failure (m0)
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err.message }));
      // NOTE: 'form' state is left untouched — typed data is NOT lost.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="displayName" value={form.displayName}
             onChange={handleChange} onBlur={handleBlur} />
      {errors.displayName && <span className="err">{errors.displayName}</span>}
      <button disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
    </form>
  );
}

// CONTEXT — one of KalaKaara's exactly two. value MUST be memoised or every
// consumer re-renders on every provider render ({} !== {}).
const SessionContext = createContext(null);

function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, setUser }), [user]);  // stable identity
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
export const useSession = () => useContext(SessionContext);`,
          pitfalls: [
            '**An inline `value={{...}}` on a Provider.** A new object each render re-renders every consumer app-wide. Fix: `useMemo` the value so its identity is stable unless its contents change.',
            '**Clearing the form on a failed save.** The user loses everything they typed and leaves. Fix: on error, set an error message but never reset `form`; preserve typed data.',
            '**Validating on every keystroke.** Error messages flicker while the user is still typing a valid value. Fix: validate on blur and on submit; keystrokes only update the value.',
            '**Not disabling submit during an async save.** A double-click fires two inserts. Fix: `disabled={submitting}` and guard the handler with the pending flag.',
            '**Putting non-global state in Context to dodge prop-drilling.** Everything becomes a context, re-renders spread, and data that belongs in the URL gets trapped in memory. Fix: Context only for genuinely global values — session and favourites; drill props otherwise, and keep browse filters in the URL.',
          ],
          tryIt:
            'Add a bio textarea to ProfileForm, make it controlled, then simulate a save failure by throwing in `onSave`. Confirm the 300-word bio is still in the field after the error. Next, make `SessionProvider` pass an inline `value={{ user, setUser }}` and add a render log to a deep consumer; type in an unrelated input and watch the consumer re-render. Wrap the value in `useMemo` and watch the needless re-renders stop.',
          takeaway:
            'Controlled inputs put React state in charge of every keystroke, with one `handleChange`, blur+submit validation, a pending-disable, and error-preserving state. Context shares genuinely global values via a memoised Provider value — and KalaKaara keeps to exactly two contexts because everything else is a prop or a URL param.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm5-p1',
      type: 'Mini Project',
      title: 'The Browse Page, Wired With Hooks and the URL',
      domain: 'React Fundamentals',
      duration: '2 hours',
      description:
        'Build KalaKaara\'s browse page end to end as pure front-end React: a useArtists(filters) hook with the cancelled-flag race guard, a useDebounce hook, filters stored in the URL via useSearchParams, a controlled search form, a results grid keyed by artist id, all four render states, and a useMemo\'ed filter object so the hook does not refetch on every render. No Supabase writes — the artist data comes from a local mock service, so the entire focus is the React model.',
      tools: ['React', 'React Router v6', 'Vite'],
      blueprint: {
        overview:
          'A working /artists page that reads its filters from the URL, debounces the search box, fetches through a custom hook that cannot lose a race, and renders loading, error, empty, and data states correctly. Every concept from this module appears once, in its natural place. The data layer is a mock `artistService.search(filters)` returning coastal-Karnataka artists after a randomised delay, so you can see the race condition, the debounce, and the refetch loop for real — without any backend.',
        functionalRequirements: [
          '**URL-driven filters.** Category, location, and search text live in the URL query string via `useSearchParams`; the page reads filters from the URL and writes changes back, so a filtered search is shareable, bookmarkable, and survives refresh.',
          '**Debounced search.** A controlled search input feeds `useDebounce(q, 300)` so the fetch fires only after the user pauses, not on every keystroke.',
          '**Custom data hook.** `useArtists(filters)` returns exactly `{ data, loading, error }`, fetches in a `[filters]` effect, and carries a `cancelled` flag in cleanup so a slow earlier request never overwrites a newer one.',
          '**Memoised filter object.** The filters passed into `useArtists` are built with `useMemo` keyed on the individual filter values, so the hook does not refetch on every unrelated render.',
          '**Correct list rendering.** The grid maps artists to cards with `key={artist.id}` — never the index — so filtering and reordering never leak state onto the wrong card.',
          '**Four render states.** The grid renders loading (skeletons), error (with retry), empty (a real "no artists serve this area yet" message with a widen-search action), and data — as four early returns in that order.',
          '**Focus on mount.** The search input receives focus on mount via `useRef` + an effect, so the user can type immediately.',
        ],
        technicalImplementation: [
          '**hooks/useArtists.js.** `useState` for data/loading/error, a `[filters]` effect calling the mock `artistService.search`, the cancelled-flag guard in `.then/.catch/.finally` and cleanup, returning `{ data, loading, error }`.',
          '**hooks/useDebounce.js.** `useState` for the debounced value, a `[value, delay]` effect with a `setTimeout` and a `clearTimeout` cleanup.',
          '**pages/BrowsePage.jsx.** Reads filters from `useSearchParams`, builds a `useMemo`ed filter object, calls `useArtists`, and renders the four-state ladder. Filter changes are written back with `setSearchParams`.',
          '**components/SearchForm.jsx.** A controlled `<input>` with `useRef` focus-on-mount and one `handleChange`; lifts its value up to BrowsePage which owns the filter state (in the URL).',
          '**services/artistService.mock.js.** An in-memory list of coastal-Karnataka artists with a `search(filters)` that resolves after a randomised delay, so the race condition and debounce are observable without a backend.',
        ],
        prompts: [
          {
            step: 1,
            label: 'The mock service and the useArtists hook with the race guard',
            outcome:
              'A reusable data hook that returns { data, loading, error } and cannot be beaten by a slow earlier request.',
            prompt:
              'Create `services/artistService.mock.js` exporting `search(filters)` that returns a Promise resolving, after a randomised 200–1500ms delay, to a filtered subset of an in-memory array of ~12 coastal-Karnataka artists (fields: id as a UUID-like string, displayName, city, district, categorySlug, yearsExperience, avatarUrl). Filtering: match on category and on a case-insensitive substring of displayName/city for the search text; return all when a filter is null or empty. Then create `hooks/useArtists.js` exporting `useArtists(filters)` that uses useState for data/loading/error, a useEffect with dependency `[filters]` that calls the mock search, and a `let cancelled = false` guard set true in the cleanup and checked in every `.then`/`.catch`/`.finally`. Return exactly `{ data, loading, error }`. Add a comment explaining which bug the cancelled flag prevents.',
          },
          {
            step: 2,
            label: 'The useDebounce hook',
            outcome:
              'A useDebounce(value, delay) hook so the search does not fire on every keystroke.',
            prompt:
              'Create `hooks/useDebounce.js` exporting `useDebounce(value, delay = 300)`. Hold the debounced value in useState initialised to `value`; in a useEffect with dependencies `[value, delay]`, schedule `setTimeout(() => setDebounced(value), delay)` and return a cleanup that clears the timeout so a new keystroke cancels the pending update. Return the debounced value. Include a one-line comment on why the cleanup is what makes it a debounce rather than just a delay.',
          },
          {
            step: 3,
            label: 'BrowsePage: URL as the source of truth + memoised filters',
            outcome:
              'A browse page whose filters live in the URL and whose hook does not refetch on every render.',
            prompt:
              'Create `pages/BrowsePage.jsx`. Use `useSearchParams` to read `category`, `location`, and `q` from the URL (q defaulting to an empty string). Pass `q` through `useDebounce(q, 300)`. Build the filter object with `useMemo(() => ({ category, location, q: debouncedQ }), [category, location, debouncedQ])` and pass it to `useArtists`. Provide a `setFilter(name, value)` helper that clones the current search params into a fresh `URLSearchParams`, sets or deletes the key, and calls `setSearchParams`. Add a code comment explaining that without the useMemo the inline object would be a new reference each render and useArtists would refetch every render because `{} !== {}`. Do not use component `useState` for the filters — the URL is the only store.',
          },
          {
            step: 4,
            label: 'The controlled SearchForm with focus-on-mount',
            outcome:
              'A controlled search input, focused on mount, that lifts its value up to the URL-backed filters.',
            prompt:
              'Create `components/SearchForm.jsx` taking props `q`, `category`, and callbacks `onQueryChange` and `onCategoryChange`. Render a controlled `<input type="search" value={q} onChange={e => onQueryChange(e.target.value)} />` and a set of category chips that call `onCategoryChange`. Use `useRef` plus a mount-only `useEffect` to focus the input on mount so the user can type immediately. Wire it into BrowsePage so changing the query or category updates the URL via the step-3 `setFilter` helper. Keep the component presentational — it holds no filter state of its own; BrowsePage (via the URL) is the source of truth.',
          },
          {
            step: 5,
            label: 'The grid: correct keys and the four render states',
            outcome:
              'A results grid keyed by id that renders loading, error, empty, and data correctly.',
            prompt:
              'Create `components/ArtistGrid.jsx` and wire it into BrowsePage as the four-state render ladder in order: (1) loading → six skeleton cards; (2) error → an error message with a retry button; (3) empty → a real "No artists serve this area yet — try widening to the district" message with a button that clears the location filter; (4) data → `artists.map(a => <ArtistCard key={a.id} artist={a} />)` using the artist id as the key, never the index. Add each ArtistCard with a small text input for a "private note" to demonstrate that `key={a.id}` keeps notes attached to the right artist when the list filters. Include a comment contrasting what would break with `key={index}`. Do not write anything to a backend — this is front-end React only.',
          },
        ],
        deliverable:
          'A fully working /artists page, backed only by a mock service, that demonstrates every concept in this module in its real place: a URL-driven, shareable filter state; a debounced controlled search focused on mount; a custom useArtists hook returning { data, loading, error } with a race-proof cleanup guard; a memoised filter object that prevents refetch loops; and a grid keyed by artist id with all four render states. It becomes the real browse page in Module 9 by swapping the mock service for the Supabase-backed one — with zero changes to the components or hooks.',
      },
    },
  ],
  quiz: [
    {
      id: 'm5-q1',
      q: 'Why is `key={index}` a bug in the browse grid when the list can be filtered or reordered?',
      options: [
        'It makes React render the list more slowly because indexes are numbers',
        'It causes a runtime error every time the array length changes',
        'React matches elements by key, so an index key binds each card\'s state and focus to its POSITION; when an earlier item is removed, everything shifts and state leaks onto the wrong artist',
        'Index keys are not unique, so React refuses to render the list at all',
      ],
      answer: 2,
    },
    {
      id: 'm5-q2',
      q: 'You write `{artist.artworkCount && <Gallery />}` and an artist with zero artworks shows a stray "0" on the page. Why?',
      options: [
        'React caches the previous render and shows the old count',
        '`0 && <Gallery/>` evaluates to `0`, and React renders the number 0 as visible text because 0 is a valid child (unlike false/null/undefined)',
        'The Gallery component throws and React displays its error code',
        'artworkCount is a string, so it is always truthy and renders itself',
      ],
      answer: 1,
    },
    {
      id: 'm5-q3',
      q: 'A click handler calls `setCount(count + 1)` twice but the count only rises by one. What is the correct fix?',
      options: [
        'Call `setCount` once and multiply the argument by two',
        'Wrap both calls in a setTimeout so they run separately',
        'Store the count in a ref instead of state so it updates synchronously',
        'Use the updater form `setCount(c => c + 1)` twice, so each call receives the latest pending value instead of the same render snapshot',
      ],
      answer: 3,
    },
    {
      id: 'm5-q4',
      q: 'What does the useEffect dependency array actually represent?',
      options: [
        'A correctness contract listing every reactive value the effect reads, so React re-synchronises when any of them changes — not a performance knob for running less often',
        'A performance setting where fewer dependencies always means faster code',
        'The list of state setters the effect is allowed to call',
        'An ordering hint telling React which effect to run first',
      ],
      answer: 0,
    },
    {
      id: 'm5-q5',
      q: 'A detail page fetches by slug in a `[slug]` effect. The user opens artist A, then quickly navigates to artist B, and the page ends up showing A\'s data at B\'s URL. What happened and how is it fixed?',
      options: [
        'React rendered both pages at once; fix it by returning null while loading',
        'The slug prop was mutated; fix it by copying it into state first',
        'A\'s slower request resolved after B\'s and overwrote it — a race condition; fix it with a `cancelled` flag set in the effect cleanup and checked before every setState (or an AbortController)',
        'The effect ran twice in development; fix it by disabling React StrictMode',
      ],
      answer: 2,
    },
    {
      id: 'm5-q6',
      q: 'Why must the filter object passed into `useArtists(filters)` be wrapped in useMemo?',
      options: [
        'useMemo makes the network request itself faster by caching the response',
        'An inline object is a new reference every render, and since `{} !== {}`, the hook\'s `[filters]` effect sees a change every render and refetches endlessly; useMemo keeps the reference stable until a filter value actually changes',
        'React requires all hook arguments to be memoised or it throws',
        'Without useMemo the filter values would be undefined on the first render',
      ],
      answer: 1,
    },
    {
      id: 'm5-q7',
      q: 'Why must hooks be called in the same order on every render, never inside a condition?',
      options: [
        'Because conditional code is always slower than unconditional code',
        'Because React needs the hook names to match, and conditions can rename them',
        'Because hooks inside conditions cannot access props',
        'Because React matches each hook to its stored state by CALL ORDER, not by name; skipping or reordering a hook shifts every later hook onto the wrong stored state',
      ],
      answer: 3,
    },
    {
      id: 'm5-q8',
      q: 'Why does KalaKaara store the browse filters in the URL (via useSearchParams) rather than in component useState?',
      options: [
        'Because the URL makes a filtered search shareable, bookmarkable, refresh-proof, and back-button-friendly — the URL becomes the single source of truth, so there is no separate state to drift or lose on reload',
        'Because useState cannot hold strings like category names',
        'Because the URL is encrypted and hides the filters from other users',
        'Because React Router forbids using useState on a routed page',
      ],
      answer: 0,
    },
  ],
}
