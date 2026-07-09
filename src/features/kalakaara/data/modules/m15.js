// Module 16 — Professional Improvements: SEO, Accessibility, Security, Testing
// KalaKaara (React + Supabase) course content for the React course player.
// This is the final, capstone module.

export const m15 = {
  id: 'm15',
  title: 'Professional Improvements — SEO, Accessibility, Security, Testing',
  hours: 6,
  color: 'from-red-500/20 to-red-700/10',
  accent: 'red',
  description:
    'The difference between a portfolio project and a product. Make KalaKaara findable by Google and by WhatsApp link previews despite being a client-rendered SPA; audit it with a keyboard and a screen reader until it is genuinely usable without a mouse; threat-model every asset and verify each control including the RLS policies that actually protect contact details; write the small set of tests worth their maintenance cost; and close with an honest roadmap of what you deliberately did not build and what it would take.',
  sections: [
    {
      id: 'm15-s1',
      title: 'Being found: SEO for a client-rendered app',
      topics: [
        {
          id: 'm15-t1',
          title: 'The hard truth about SPA SEO',
          explain:
            'A Vite React app ships an almost-empty HTML shell and paints the real page with JavaScript, so any crawler that does not run JavaScript sees a blank page.',
          analogy:
            'Picture a stall at the Kundapura santhe where the vendor keeps everything packed in gunny bags and only unpacks an item after you personally ask for it. A patient regular customer will wait while he unpacks. But the man from the newspaper walking past to photograph the market for tomorrow\'s edition glances once, sees closed bags, and photographs the next stall instead. Googlebot is the patient regular. The WhatsApp link-preview bot is the newspaper photographer.',
          theory:
            'When Vite builds KalaKaara, `dist/index.html` is tiny: a `<div id="root"></div>` and a `<script>` tag. Everything a human sees — the artist cards, the profile, the portfolio — is created by React **after** that JavaScript downloads and runs. This is the defining trait of a single-page application, and it is invisible to you because your browser always runs the JavaScript.\n\n**Googlebot does run JavaScript** — but not on the first pass. It fetches your raw HTML, sees the empty shell, and puts the page into a **render queue** for a second wave that can arrive minutes or (historically) days later. So Google can index a SPA, eventually, if nothing goes wrong in that second wave. That is a fragile "eventually," not a guarantee.\n\n**Almost nothing else runs JavaScript at all.** The link-preview bots behind WhatsApp, Twitter/X, Facebook, Slack, LinkedIn, and iMessage fetch your URL exactly once, read the raw HTML bytes, look for `<meta property="og:title">` and `<meta property="og:image">`, and leave. They never execute a line of your React. This is the trap that surprises everyone: you carefully inject `og:image` from a React component using `react-helmet`, you test it in your browser and the tag is right there in the DOM, and then you paste the link into a WhatsApp group and the preview is blank or shows the wrong image. The tag existed only *after* JavaScript ran, and WhatsApp never ran it.\n\nThere are exactly three honest ways to fix this, and you must pick one deliberately:\n\n**1. Prerendering.** At build time, run each route in a headless browser, let React paint, and save the resulting fully-formed HTML to disk (`react-snap`, `vite-plugin-ssr` in prerender mode, or a hosted service like Prerender.io that serves rendered HTML to bots). Crawlers get real HTML; humans still get the SPA. Good for a small, mostly-static set of routes; awkward when the routes are thousands of database-driven artist pages.\n\n**2. Server-side rendering.** Render every request on a server (or edge function) so the very first HTML response is already complete. This is what **Next.js** does — and adopting it means rewriting KalaKaara from a Vite SPA into a Next.js app. It is the correct answer if search is your growth channel. It is a large, deliberate project, not a Module-16 afternoon.\n\n**3. Accept the limitation for non-critical pages.** Do the cheap, high-value 80% — static Open Graph tags in the shell `index.html`, per-route titles, JSON-LD, a sitemap — and accept that deep dynamic pages will index more slowly than an SSR site would.\n\n**For KalaKaara we choose option 3, with static OG defaults in `index.html`, and we write the migration to SSR into the roadmap.** The reasoning is honest: today the growth channel is word of mouth and WhatsApp shares, not organic search ranking; the app is a Vite SPA and a Next.js rewrite is out of scope for a course that has already shipped a working product; and static OG tags in the shell already fix the single most visible symptom — the broken WhatsApp preview — because those tags are in the raw HTML every bot reads. If, later, organic search becomes the channel that grows the marketplace, the roadmap in this module says plainly what to do: move to SSR. Naming the limitation and its fix is the professional move; pretending a SPA ranks like an SSR site is not.',
          diagram: `graph TD
    U[A URL to an artist page is requested] --> W{Who is requesting it?}
    W -- Human browser --> JS1[Runs the JS bundle] --> OK1[Sees the full page. Always works.]
    W -- Googlebot --> Q[Reads raw HTML now,<br/>queues JS render for later] --> LATER{Second wave renders?}
    LATER -- Yes, eventually --> OK2[Indexed. Slow, fragile.]
    LATER -- Something broke --> BAD1[Indexed as a blank shell]
    W -- WhatsApp / X / Slack bot --> NOJS[Reads raw HTML ONCE.<br/>Never runs JS]
    NOJS --> M{og:title / og:image<br/>present in raw HTML?}
    M -- Yes, static in index.html --> OK3[Correct preview]
    M -- No, injected by React --> BAD2[Blank / wrong preview]`,
          flowExplain:
            'Follow the right-hand branch: the social bot reads the raw HTML once and never runs JavaScript, so a React-injected `og:image` lands in the "No" box and the preview breaks. Static tags in `index.html` are the only ones it ever sees.',
          whyItMatters:
            'This is the SEO question that separates people who have shipped a SPA from people who have only read about one. In an interview, "Googlebot renders JS but queues it, and social crawlers do not render at all, so injected meta tags miss link previews" is a two-sentence answer that demonstrates you have actually debugged a blank WhatsApp preview. It also stops you from wasting a week on `react-helmet` expecting it to fix previews it structurally cannot fix.',
          steps: [
            'Build the app and open `dist/index.html`. Confirm with your own eyes that it contains a near-empty `<div id="root">` and no artist content. That empty file is what every crawler fetches first.',
            'List every crawler that matters for KalaKaara: Googlebot (renders JS, eventually), Bing, and the social/preview bots for WhatsApp, X, Facebook, Slack, LinkedIn (none render JS).',
            'Decide honestly which of the three options fits: prerender, SSR, or accept-and-document. For KalaKaara, accept-and-document, with static OG defaults in the shell.',
            'Put sensible default `og:title`, `og:description`, and an absolute `og:image` URL directly into `index.html` so every link preview has a correct fallback even before per-page tags exist.',
            'Write "migrate to Next.js SSR if organic search becomes the growth channel" into the roadmap so the limitation is a documented decision, not an accident.',
          ],
          code: `<!-- dist/index.html AFTER build — this is ALL a social crawler ever sees. -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KalaKaara — find local artists</title>

    <!-- STATIC Open Graph defaults. In the RAW HTML, so every bot sees them.
         Absolute URLs only — crawlers do not resolve relative paths. -->
    <meta property="og:title"       content="KalaKaara — find local artists" />
    <meta property="og:description" content="Discover painters, muralists and calligraphers in coastal Karnataka." />
    <meta property="og:image"       content="https://kalakaara.app/og-default.jpg" />
    <meta property="og:type"        content="website" />
    <meta name="twitter:card"       content="summary_large_image" />
  </head>
  <body>
    <div id="root"></div>            <!-- EMPTY. React fills this. Bots never wait. -->
    <script type="module" src="/assets/index-a1b2c3.js"></script>
  </body>
</html>

<!--
  What your BROWSER sees after JS runs (the real page) vs what a WhatsApp
  bot sees (the block above). If you inject og:image from a React component,
  it appears only in the browser version. The bot already left.
-->`,
          pitfalls: [
            '**Injecting `og:image` with `react-helmet` and testing it in your browser.** DevTools shows the tag, so you conclude it works — but the browser ran the JS the crawler never runs. Fix: test social previews with the platform\'s own debugger (Facebook Sharing Debugger, X Card Validator) or `curl` the URL and read the raw bytes. If the tag is not in `curl` output, the bot cannot see it.',
            '**Assuming "Google renders JavaScript" means SPA SEO is solved.** Google *queues* the render; other crawlers do not render at all. Fix: treat the raw HTML as your real SEO surface and put anything a crawler must see reliably into it or into JSON-LD.',
            '**Reaching for Next.js mid-course to "fix SEO".** That is a rewrite of a working app, and it is out of scope. Fix: do the cheap 80% now, and put SSR migration on the roadmap as a deliberate future project gated on search actually becoming the growth channel.',
            '**Using a relative `og:image` path like `/og.jpg`.** Crawlers fetch the image from a different context and cannot resolve relative URLs. Fix: always use an absolute `https://` URL for `og:image`.',
          ],
          tryIt:
            'Build the app, then run `curl -s https://your-deploy-url/artists/rukmini-shetty | grep -i "og:image"`. You will see the static default from `index.html`, not the artist\'s own cover image — because the artist-specific tag is injected by React and curl does not run React. Now you have seen, with your own terminal, exactly what WhatsApp sees.',
          takeaway:
            'Googlebot queues JS rendering; social crawlers never render at all. Only tags in the raw HTML shell are reliably seen — so put static OG defaults there, do the cheap wins, and put SSR on the roadmap rather than pretending a SPA ranks like one.',
        },
        {
          id: 'm15-t2',
          title: 'What you can do today, free: titles, canonicals, and semantic headings',
          explain:
            'Even without SSR, a per-route `<title>`, a `<meta name="description">`, a canonical URL, and disciplined headings are free wins that Googlebot honours after it renders.',
          analogy:
            'Every shop on the Udupi car street has its name painted clearly above the door and one signboard, not three competing ones. A stranger walking the street can tell instantly what each shop is and never confuses two of them. A per-route title is your painted name; one `<h1>` per page is the single signboard; a canonical URL is the shop telling the municipality its one official address so it is not listed twice in the directory.',
          theory:
            'The moment Googlebot does render your page, three cheap signals do most of the work, and you control all three from React.\n\n**Per-route `<title>` and `<meta name="description">`.** Every route should set its own. The browse page is "Browse artists in coastal Karnataka — KalaKaara"; an artist page is "Rukmini Shetty — portrait artist in Udupi — KalaKaara". These are the blue link and the grey snippet in a Google result, and they are what a human decides to click on. A SPA that leaves every page titled "KalaKaara" throws that away.\n\nYou have two ways to set them. **`react-helmet-async`** is the well-known library: you drop a `<Helmet><title>...</title></Helmet>` into any component and it manages the document head, including server rendering if you ever add it. It is battle-tested and it is one more dependency, one more provider to wrap the app in, and one more thing to keep updated.\n\nThe alternative is a **twelve-line hook you write yourself**, `useDocumentTitle`. It sets `document.title` in an effect and restores the previous title on unmount. For a client-only SPA that never server-renders its head, that is genuinely all `react-helmet` is doing for the `<title>`. **Prefer the hook.** Fewer dependencies is not laziness; it is a feature. Every dependency is code you did not write, cannot fully see, must update for security patches, and inflates your bundle. A hook you can read in one screen has none of those costs. Reach for the library only when you need what it actually adds — server-side rendering of the head, or managing dozens of meta tags per page. For KalaKaara\'s needs, the hook wins.\n\n**Canonical URLs.** The same artist might be reachable at `/artists/rukmini-shetty`, `/artists/rukmini-shetty?ref=whatsapp`, and `/artists/rukmini-shetty/`. To a crawler those can look like three pages with duplicate content, and it splits ranking signals across them. A `<link rel="canonical" href="https://kalakaara.app/artists/rukmini-shetty">` tells Google the one true address. Set it per route to the clean, query-free URL.\n\n**Semantic headings.** Exactly **one `<h1>` per page**, describing that page, and no skipped levels — an `<h2>` may be followed by an `<h3>`, never jumping to `<h4>`. This is not pedantry: screen-reader users navigate by pulling up a list of headings and jumping between them, and Google uses the heading outline to understand page structure. On an artist page the `<h1>` is the artist\'s name; "Portfolio" and "Reviews" are `<h2>`s; an individual review\'s author is an `<h3>`. Beginners reach for the biggest-looking `<h1>` because it renders large, then use `<h1>` five times on one page. Fix the size in CSS; keep the heading level meaningful.',
          whyItMatters:
            'These are the cheapest SEO wins in existence and the ones beginners skip because they are invisible in the browser. In a code review, choosing a twelve-line hook over a dependency and being able to say exactly what the dependency would have added is the kind of judgement that marks a senior engineer. "Fewer dependencies is a feature" is a defensible, repeatable principle, not a preference.',
          steps: [
            'Write a `useDocumentTitle(title)` hook that sets `document.title` in a `useEffect` and restores the previous title in the cleanup function.',
            'Call it in every page component with a route-specific title. Never leave two routes sharing one title.',
            'Add a `useCanonical(path)` hook (or a small `<link>` manager) that points `rel="canonical"` at the clean, query-string-free URL for the current route.',
            'Audit headings: exactly one `<h1>` per page, no skipped levels. Use browser devtools or the axe extension\'s heading-order check.',
            'Only if you later add SSR or need many per-page meta tags, reconsider `react-helmet-async` — and write down what it buys you that the hook did not.',
          ],
          code: `// src/hooks/useDocumentTitle.js  — the whole feature, no dependency.
import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;                 // e.g. "Rukmini Shetty — portrait artist — KalaKaara"
    return () => { document.title = previous; };   // restore on unmount
  }, [title]);
}

// src/hooks/useCanonical.js — one true address per route, query-string free.
export function useCanonical(path) {
  useEffect(() => {
    const href = \`https://kalakaara.app\${path}\`;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }, [path]);
}

// Usage in a page. One h1. No skipped levels.
function ArtistDetailPage() {
  const { data: artist, loading } = useArtist(useParams().slug);
  useDocumentTitle(
    artist ? \`\${artist.displayName} — \${artist.primaryCategory} in \${artist.district} — KalaKaara\`
           : 'Artist — KalaKaara'
  );
  useCanonical(\`/artists/\${artist?.slug ?? ''}\`);

  if (loading) return <ArtistDetailSkeleton />;
  return (
    <article>
      <h1>{artist.displayName}</h1>            {/* the ONE h1 */}
      <section aria-labelledby="portfolio-h">
        <h2 id="portfolio-h">Portfolio</h2>    {/* h2, not a second h1 */}
      </section>
      <section aria-labelledby="reviews-h">
        <h2 id="reviews-h">Reviews</h2>
        {/* each review author is an h3 — no jump to h4 */}
      </section>
    </article>
  );
}

// The react-helmet-async equivalent — one extra dependency + a provider wrap:
//   <Helmet><title>...</title><link rel="canonical" href="..." /></Helmet>
// Use it only if you add SSR or need many meta tags per page.`,
          pitfalls: [
            '**Leaving every route titled "KalaKaara".** The browser tab, the bookmark, and the Google blue link all read the same generic word, and duplicate titles hurt ranking. Fix: a route-specific title on every page via `useDocumentTitle`.',
            '**Adding `react-helmet-async` for a `<title>` you could set in twelve lines.** You now own a dependency, a provider wrapper, and a bundle-size cost for something a hook does. Fix: use the hook; adopt the library only when you need SSR head management or many tags.',
            '**Skipping heading levels because the design wanted a smaller subheading.** Jumping `<h2>` to `<h4>` breaks screen-reader navigation. Fix: keep levels sequential and set the visual size in CSS, which is independent of the level.',
            '**Ignoring canonical tags and letting `?ref=whatsapp` links get indexed separately.** Ranking signal splits across near-duplicate URLs. Fix: a per-route canonical pointing at the clean path.',
            '**Setting the title in the render body instead of an effect.** Mutating `document.title` during render is a side effect in the wrong place and fights React\'s concurrency. Fix: set it inside `useEffect`.',
          ],
          tryIt:
            'Write `useDocumentTitle` and add it to three pages. Then open your app, navigate between them, and watch the browser tab change. Bookmark the artist page — the bookmark now carries the artist\'s name, not "KalaKaara". That single behaviour is worth more to a real user than most features you will build.',
          takeaway:
            'Per-route titles, canonical URLs, and one meaningful `<h1>` per page are free, render-independent SEO wins. Prefer a twelve-line hook over a library — fewer dependencies is a feature, not a compromise.',
        },
        {
          id: 'm15-t3',
          title: 'Structured data: JSON-LD that Google reads even from a SPA',
          explain:
            'A JSON-LD `<script>` block describes your artist to search engines as structured data, and Google reads it more reliably from a client-rendered page than it reads your `<meta>` tags.',
          analogy:
            'A `<meta>` tag is like shouting your shop\'s details across a noisy santhe and hoping the right person catches the right words. JSON-LD is like handing them a printed visiting card: name, trade, rating, area served, all in labelled fields. Even a distracted passer-by files the card correctly, because the card tells them what each line means.',
          theory:
            'Search engines do not just index your words; they try to understand your **entities** — this page is about a *person* who is an *artist*, who has a *rating*, who *serves* certain areas. You tell them explicitly with **structured data**, and the format Google recommends is **JSON-LD**: a `<script type="application/ld+json">` block containing a JSON object that follows the schema.org vocabulary.\n\nHere is the part that matters for a SPA. Google\'s rendering pipeline extracts JSON-LD when it renders the page, and — because it is a single self-contained blob of data rather than many scattered tags — it survives the render more robustly than injected `<meta>` tags do. It is the most reliable way to get rich information about a client-rendered page into Google. And when it succeeds, an artist can appear in search with a **rating stars** rich result, which dramatically improves click-through versus a plain blue link.\n\nFor a KalaKaara artist, the right schema is a blend. A `Person` captures the individual; a `LocalBusiness` (or its subtype) captures the fact that they take commissions in a service area and have reviews. You can express the artist as a `Person` who is the subject, with the fields that matter: `name`, `image` (absolute URL), `jobTitle`, an `aggregateRating` built from the denormalised review counters you already maintain from Module 13, and `areaServed` built from the service areas of Module 9. Every field maps to data you already have in the database — you are not inventing anything, you are labelling it.\n\nGenerate the block from the same artist object your page already loaded, stringify it, and render it inside a small `JsonLd` component. Two rules keep it valid: emit it only when the data is present (never `aggregateRating` with a `reviewCount` of zero — an empty rating is an error in Google\'s validator and can suppress the whole result), and use absolute URLs for `image` and `url`. Test it in Google\'s Rich Results Test, which shows you exactly what Google parsed and whether the artist qualifies for a rating rich result.',
          diagram: `graph TD
    A[Artist object already loaded by useArtist] --> B[Build JSON-LD:<br/>Person + aggregateRating + areaServed]
    B --> V{reviewCount > 0?}
    V -- No --> B2[Omit aggregateRating entirely]
    V -- Yes --> B3[Include ratingValue + reviewCount]
    B2 --> S[Render script type=application/ld+json]
    B3 --> S
    S --> G[Googlebot render: extracts the JSON blob]
    G --> RR{Valid + rating present?}
    RR -- Yes --> STARS[Rich result: stars in search listing]
    RR -- No --> PLAIN[Plain blue link]`,
          flowExplain:
            'The validity gate is the `reviewCount > 0` check: emitting an `aggregateRating` with zero reviews is invalid and can cost you the whole rich result, so the diagram omits the rating rather than faking it.',
          whyItMatters:
            'Rich results — the star ratings under a search listing — measurably raise click-through, and JSON-LD is how you earn them. Being able to say "structured data is more reliable than meta tags for a client-rendered app, so we ship JSON-LD built from the denormalised rating we already store" connects three modules (SEO, reviews, architecture) into one coherent answer, which is exactly what interviewers probe for.',
          steps: [
            'Choose the schema: a `Person` for the artist, enriched with `aggregateRating` and `areaServed`. Do not over-model — pick the fields that map to data you have.',
            'Write a `buildArtistJsonLd(artist)` function in `utils/` that returns a plain object, omitting `aggregateRating` when `reviewCount` is 0.',
            'Render it via a `<JsonLd data={...} />` component that JSON-stringifies the object into a `<script type="application/ld+json">`.',
            'Use absolute URLs for `image` and `url` — build them from your canonical origin, never relative paths.',
            'Validate every artist type against Google\'s Rich Results Test before trusting it. Fix whatever it flags; a warning there is a lost rich result.',
          ],
          code: `// src/utils/buildArtistJsonLd.js — pure function, maps DB data to schema.org.
const ORIGIN = 'https://kalakaara.app';

export function buildArtistJsonLd(artist) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artist.displayName,
    image: \`\${ORIGIN}\${artist.avatarUrl}\`,          // absolute URL
    url: \`\${ORIGIN}/artists/\${artist.slug}\`,
    jobTitle: artist.primaryCategory,                // "Portrait Artist"
    address: {
      '@type': 'PostalAddress',
      addressLocality: artist.city,                  // "Manipal"
      addressRegion: artist.state,                   // "Karnataka"
      addressCountry: 'IN',
    },
    // areaServed built from Module 9 service areas:
    areaServed: artist.serviceAreas.map((a) => a.name),   // ["Udupi", "Kundapura", ...]
  };

  // ONLY include aggregateRating when real reviews exist.
  // An empty rating is INVALID and can suppress the whole rich result.
  if (artist.reviewCount > 0) {
    json.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: artist.avgRating.toFixed(1),      // "4.7" — from the denormalised counter
      reviewCount: artist.reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }
  return json;
}

// src/components/JsonLd/JsonLd.jsx
export function JsonLd({ data }) {
  // React does NOT escape inside a script tag, so we stringify ourselves.
  // JSON.stringify output is safe here: it cannot contain a raw </script>.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// In ArtistDetailPage, once the artist has loaded:
//   {artist && <JsonLd data={buildArtistJsonLd(artist)} />}`,
          pitfalls: [
            '**Emitting `aggregateRating` with `reviewCount: 0`.** Google\'s validator rejects it and may drop the entire rich result. Fix: gate the rating behind `reviewCount > 0`, exactly as the builder does.',
            '**Using relative URLs for `image` or `url`.** Google fetches these out of page context and cannot resolve `/avatars/x.jpg`. Fix: prefix every URL with the absolute origin.',
            '**Letting the JSON-LD claim a rating the visible page does not show.** Structured data that contradicts on-page content is a manual-action risk. Fix: build the JSON-LD from the same artist object the page renders, so they can never disagree.',
            '**Hand-writing the JSON string with template literals.** One unescaped quote in a bio breaks the whole block silently. Fix: build a plain object and `JSON.stringify` it — the serializer escapes correctly.',
            '**Shipping it and never validating.** Invalid structured data fails silently; you simply never get the rich result and never know why. Fix: run each artist type through the Rich Results Test.',
          ],
          tryIt:
            'Build the JSON-LD for an artist with 12 reviews averaging 4.7, then paste the output into Google\'s Rich Results Test. It should report the page eligible for a review-snippet rich result. Now set `reviewCount` to 0 and paste again — watch the eligibility disappear, and understand why the builder omits the rating in that case.',
          takeaway:
            'JSON-LD is the most reliable way to describe a client-rendered page to Google, and it earns star rich results. Build it from the review counters and service areas you already store, and never emit a rating with zero reviews.',
        },
        {
          id: 'm15-t4',
          title: 'sitemap.xml and robots.txt, generated at build time',
          explain:
            'A sitemap lists every URL you want crawled; because artists are database rows, you generate it at build time with a Node script that queries Supabase and writes `public/sitemap.xml`.',
          analogy:
            'A sitemap is the index at the front of the Udupi temple\'s seva register — a list of every entry so the priest can find any booking without flipping through the whole book. But the register grows every day. An index printed last month is missing this week\'s bookings and still lists people who cancelled. A sitemap of a live marketplace is exactly that index: useful only if you reprint it every time the book changes.',
          theory:
            'A **sitemap** is an XML file listing the URLs you want search engines to discover, each optionally with a last-modified date. **robots.txt** is a plain-text file telling crawlers which paths they may fetch and where the sitemap lives. Both sit at the site root and are read by every serious crawler before it explores.\n\nThe complication for KalaKaara is that your important URLs — the artist pages — are **rows in Postgres**, not files on disk. You cannot hand-write the sitemap, and there is no server at runtime to generate it on request (that is the whole point of the Vercel-static architecture from Module 15). So you generate it **at build time**: a small Node script runs during `npm run build`, connects to Supabase with the **anon key** (read-only, public, exactly the right level of access — it can only read published artists, which is precisely what belongs in a sitemap), fetches every published artist\'s slug and `updated_at`, and writes the XML to `public/sitemap.xml` so Vite copies it into `dist/`.\n\nWire it into the build so it can never be forgotten: `"build": "node scripts/generate-sitemap.mjs && vite build"`. Now every deploy regenerates the sitemap against the live database as its first step.\n\nWhy must a static sitemap of a dynamic site be regenerated on every deploy? Because the file is a **snapshot**, and the data moves. Between two deploys, artists publish new profiles, unpublish old ones, and update their portfolios. **A stale sitemap costs you two ways.** It omits artists who joined since the last build — Google never learns those pages exist, so they go unindexed and undiscovered, which for a marketplace means real artists who paid you nothing but whose absence makes your product worse. And it *lists URLs that no longer exist* — artists who unpublished — so Google spends its limited crawl budget on your 404s and learns to trust your sitemap less. Regenerating on deploy keeps the snapshot fresh because a deploy is exactly when the set of live pages can change in a way you control.\n\nOne caveat at scale: sitemaps cap at 50,000 URLs and 50 MB uncompressed. KalaKaara on the free tier will never approach that, but the professional answer — a sitemap index pointing at paginated sitemaps — is worth knowing exists.',
          diagram: `graph TD
    D[git push -> Vercel deploy] --> B[npm run build]
    B --> S1[Step 1: node generate-sitemap.mjs]
    S1 --> Q[Query Supabase anon key:<br/>slug + updated_at of PUBLISHED artists]
    Q --> W[Write public/sitemap.xml]
    W --> S2[Step 2: vite build copies public/ into dist/]
    S2 --> DEP[Deployed. sitemap.xml matches live DB]
    STALE[If generated only once, by hand] -.-> BAD[Missing new artists +<br/>listing deleted ones = wasted crawl budget]`,
          flowExplain:
            'The sitemap script is step one of the build, before `vite build`, so `public/sitemap.xml` is fresh on disk when Vite copies `public/` into `dist/`. The dotted branch is what a hand-written sitemap decays into.',
          whyItMatters:
            'Generating a data-derived artifact at build time from the anon key is a genuinely professional pattern, and explaining *why a static sitemap must be regenerated on deploy* — snapshot of moving data, stale file wastes crawl budget and hides new pages — is the kind of second-order reasoning that distinguishes an engineer from someone following a tutorial. It also reuses the exact anon-key-is-safe-and-read-only insight from Module 1.',
          steps: [
            'Write `scripts/generate-sitemap.mjs` that creates a Supabase client from the anon key and the project URL (read from env), fetches published artists, and builds the XML string.',
            'Include the static routes (`/`, `/artists`) plus one `<url>` per artist, each with a `<lastmod>` from `updated_at`.',
            'Write the file to `public/sitemap.xml` with Node\'s `fs`, so Vite copies it into the build output.',
            'Add a static `public/robots.txt` that allows crawling and points to the sitemap URL.',
            'Change the build script to `node scripts/generate-sitemap.mjs && vite build` so the sitemap is regenerated on every deploy and can never go stale.',
          ],
          code: `// scripts/generate-sitemap.mjs — runs during \`npm run build\`, before vite.
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

const ORIGIN = 'https://kalakaara.app';
// anon key: read-only, public, and can ONLY see published artists via RLS.
// Exactly the right access level for a public sitemap. No service_role here.
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const { data: artists, error } = await supabase
  .from('artists')
  .select('slug, updated_at')
  .eq('is_published', true);              // RLS would enforce this anyway

if (error) { console.error('sitemap: query failed', error); process.exit(1); }

const staticUrls = [
  { loc: '/', lastmod: new Date().toISOString() },
  { loc: '/artists', lastmod: new Date().toISOString() },
];

const urls = [
  ...staticUrls,
  ...artists.map((a) => ({ loc: \`/artists/\${a.slug}\`, lastmod: a.updated_at })),
];

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n' +
  urls
    .map(
      (u) =>
        \`  <url><loc>\${ORIGIN}\${u.loc}</loc><lastmod>\${u.lastmod}</lastmod></url>\`
    )
    .join('\\n') +
  '\\n</urlset>\\n';

writeFileSync('public/sitemap.xml', xml);
console.log(\`sitemap: wrote \${urls.length} urls\`);

/* public/robots.txt (static file, checked into the repo):
     User-agent: *
     Allow: /
     Disallow: /dashboard
     Disallow: /favourites
     Sitemap: https://kalakaara.app/sitemap.xml
*/

/* package.json:
     "scripts": {
       "build": "node scripts/generate-sitemap.mjs && vite build"
     }
*/`,
          pitfalls: [
            '**Hand-writing sitemap.xml once and forgetting it.** It rots immediately: missing new artists, listing deleted ones. Fix: generate it in the build step so every deploy refreshes it against the live database.',
            '**Using the service_role key in the sitemap script "to be safe".** It would leak into your CI/build environment and it grants far more than a sitemap needs. Fix: the anon key is read-only and sees exactly the published rows a sitemap should contain. Use it.',
            '**Listing unpublished or draft artists in the sitemap.** You advertise pages that render as "not found" and burn crawl budget. Fix: filter `is_published = true` (and rely on RLS as the backstop).',
            '**Disallowing everything in robots.txt while debugging and forgetting to revert.** `Disallow: /` in production makes the whole site invisible to Google. Fix: keep the production robots.txt minimal and never ship a blanket disallow.',
            '**Putting relative or wrong-origin URLs in `<loc>`.** Sitemap URLs must be absolute and match your canonical origin exactly, or crawlers ignore them. Fix: prefix every `loc` with the same origin your canonical tags use.',
          ],
          tryIt:
            'Run the sitemap script locally, open `public/sitemap.xml`, and count the `<url>` entries. Now publish a new test artist in Supabase and run it again — the count goes up by one, and the new slug appears. That two-line experiment is the entire argument for regenerating on deploy: the file only tells the truth at the moment you generate it.',
          takeaway:
            'Generate the sitemap at build time from the anon key and wire it into `npm run build`. A static sitemap of a dynamic site is a snapshot — regenerate it every deploy or it hides new artists and wastes crawl budget on deleted ones.',
        },
      ],
    },
    {
      id: 'm15-s2',
      title: 'Accessibility and security, audited',
      topics: [
        {
          id: 'm15-t5',
          title: 'A real keyboard-only audit: unplug the mouse',
          explain:
            'The fastest way to find your accessibility bugs is to physically unplug the mouse and try to use the entire app with only Tab, Enter, Escape, and arrow keys.',
          analogy:
            'A temple lays a continuous handrail from the gate to the sanctum so a person who cannot see can walk the whole path by touch, in order, without a gap. A keyboard user navigates your app the same way: Tab is their hand on the rail. If the rail skips a section, loops back on itself, or leads into a room with no way out, they are stranded — and you will never notice while your hand is on the mouse.',
          theory:
            'Automated tools catch maybe 30–40% of accessibility issues. The rest are found by using the app the way an assistive-technology user does, and the single most revealing test costs nothing: **unplug your mouse and put it in a drawer.** Now do the real journeys with the keyboard alone — Tab and Shift+Tab to move, Enter/Space to activate, Escape to dismiss, arrow keys inside composite widgets.\n\nWalk five surfaces of KalaKaara and note every failure:\n\n**The home page.** Can you Tab from the skip link, through the nav, into the search bar, through the category chips, to the artist cards, in a logical order that matches the visual order? Is the currently-focused element always **visibly** ringed?\n\n**The browse filters.** Can you reach every filter, change it, and apply it with the keyboard? Does the sort `<select>` open and choose with arrows?\n\n**The mobile drawer.** When it opens, does focus move *into* it? Can you Tab only within it (not out to the page behind, which is now hidden)? Does Escape close it? On close, does focus return to the hamburger button that opened it?\n\n**The lightbox** (the full-screen portfolio image). Same questions: focus moves in, is trapped, Escape closes, focus returns to the thumbnail you clicked.\n\n**The star-rating input.** Can you set a rating with arrow keys? Is the current value announced? A `<div>`-based star widget with `onClick` handlers is completely invisible to the keyboard — a classic failure.\n\nWhat must be true when you are done:\n\n1. **A visible `:focus-visible` ring** on every interactive element. Use `:focus-visible`, not `:focus`, so mouse clicks do not show the ring but keyboard focus does. Never `outline: none` without a replacement.\n2. **Logical tab order** — DOM order matches visual order. If you used `tabIndex` values above 0, you almost certainly broke this; remove them.\n3. **Escape closes overlays** — every drawer, modal, and lightbox.\n4. **Focus is trapped inside a modal** while it is open, and **restored to the trigger** when it closes. Restoration is the half everyone forgets: the user opened the lightbox from a specific thumbnail; on close they must land back on that thumbnail, not at the top of the page.\n5. **A skip-to-content link** — the first focusable element, visually hidden until focused, that jumps past the nav to the main content so a keyboard user does not Tab through the whole menu on every page.\n\nFix what you find. Most fixes are small: swap a `<div onClick>` for a `<button>`, add an Escape handler, add three lines of focus save/restore. The value is that the keyboard walk *found* them.',
          diagram: `graph TD
    START[Unplug the mouse] --> TAB[Tab through each surface]
    TAB --> Q1{Focus ring visible<br/>on every element?}
    Q1 -- No --> F1[Add :focus-visible ring]
    Q1 -- Yes --> Q2{Tab order matches<br/>visual order?}
    Q2 -- No --> F2[Remove positive tabIndex,<br/>fix DOM order]
    Q2 -- Yes --> Q3{Overlay open:<br/>focus trapped + Escape closes?}
    Q3 -- No --> F3[Add focus trap + Escape handler]
    Q3 -- Yes --> Q4{On close, focus returns<br/>to the trigger?}
    Q4 -- No --> F4[Save trigger, restore on close]
    Q4 -- Yes --> Q5{Skip-to-content link present?}
    Q5 -- No --> F5[Add skip link as first focusable]
    Q5 -- Yes --> PASS[Keyboard-usable]`,
          flowExplain:
            'The gate everyone fails is Q4 — focus *restoration*. Trapping focus inside a modal is common; returning it to the exact element that opened the modal is the step that makes the experience feel unbroken.',
          whyItMatters:
            'Keyboard operability is a legal requirement in many markets (WCAG 2.1 AA underpins accessibility law across the EU, US, and beyond) and a hard filter in senior interviews. "I unplugged my mouse and found that our lightbox trapped focus but never restored it to the trigger" is a concrete, credible answer that proves you tested with intent rather than running a scanner and calling it done.',
          steps: [
            'Physically disconnect the mouse. Do the five journeys — home, filters, drawer, lightbox, star rating — with the keyboard only.',
            'Replace every `outline: none` with a real `:focus-visible` ring styled to your design tokens.',
            'Add an Escape key handler and a focus trap to every overlay (drawer, modal, lightbox).',
            'On every overlay, capture `document.activeElement` when it opens and call `.focus()` on it when it closes.',
            'Add a skip-to-content link as the first element in the layout, visually hidden until focused.',
            'Replace any `<div onClick>` interactive element with a real `<button>` or `<a>`, which are keyboard-operable for free.',
          ],
          code: `/* Skip link — first focusable element in MainLayout, hidden until focused. */
.skipLink {
  position: absolute; left: -9999px; top: 0;
  background: var(--color-surface); padding: 12px 16px; z-index: 999;
}
.skipLink:focus { left: 8px; top: 8px; }        /* appears on Tab */

/* Focus ring: only for keyboard users, never suppressed. */
:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px;
}

// useFocusTrap.js — trap focus in an overlay AND restore it to the trigger.
import { useEffect } from 'react';

export function useFocusTrap(ref, isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement;           // remember who opened it
    const node = ref.current;
    const focusables = node.querySelectorAll(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();                                    // move focus INTO the overlay

    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return; }   // Escape closes
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();              // wrap backwards
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();             // wrap forwards
      }
    }
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      trigger?.focus();                                // RESTORE focus on close
    };
  }, [isOpen, ref, onClose]);
}

// <a href="#main" className={styles.skipLink}>Skip to content</a>
// ... and the page wraps its content in <main id="main" tabIndex={-1}>.`,
          pitfalls: [
            '**`outline: none` with nothing to replace it.** The focus ring vanishes and a keyboard user cannot tell where they are. Fix: style `:focus-visible` instead of removing the outline; it hides the ring for mouse users and keeps it for keyboard users.',
            '**Trapping focus in a modal but never restoring it.** On close, focus falls to `<body>` and the user is dumped at the top of the page. Fix: save `document.activeElement` on open, call `.focus()` on it on close — the cleanup function in `useFocusTrap`.',
            '**Building the star rating as `<div onClick>`.** It is unreachable and unusable by keyboard, and invisible to screen readers. Fix: use `<input type="radio">` fieldset styled as stars, or a `role="radiogroup"` with arrow-key handling.',
            '**Using positive `tabIndex` values to "fix" order.** They create a separate tab sequence that jumps around unpredictably. Fix: order the DOM correctly and use only `tabIndex={0}` (focusable) or `tabIndex={-1}` (programmatically focusable), never positive numbers.',
            '**No skip link, so every keyboard user Tabs through the entire nav on every page.** Exhausting and a WCAG failure. Fix: a visually-hidden skip link as the first focusable element.',
          ],
          tryIt:
            'Unplug your mouse right now and try to reveal a phone number: Tab from the home page to an artist, into the profile, to "Show phone number", trigger the sign-in, and back. Write down every place you got stuck or lost the focus ring. That list is your accessibility backlog, found in ten minutes for zero cost.',
          takeaway:
            'The keyboard-only walk is the highest-yield accessibility test you can run. Guarantee a visible `:focus-visible` ring, logical order, Escape-to-close, focus trapped and restored to the trigger, and a skip link.',
        },
        {
          id: 'm15-t6',
          title: 'Focus management on route change: the bug every React app has',
          explain:
            'When a React router swaps pages, the URL changes but focus stays on `<body>` and screen readers announce nothing, so an assistive-technology user has no idea the page changed.',
          analogy:
            'A conductor on the Kundapura–Mangaluru bus calls out each stop as it arrives, so a passenger who cannot see the signboards knows where they are. A React SPA is a bus that changes route silently: the scenery outside is different, but no one announced the stop. The blind passenger is still sitting there expecting the previous destination.',
          theory:
            'This is the accessibility bug that essentially **every** client-side-routed React app ships with, because it is invisible to sighted mouse users and there is no error in the console. A traditional multi-page site reloads on navigation, which resets focus and makes the screen reader announce the new page title. A SPA does neither: React swaps the DOM in place, the browser never reloads, focus stays wherever it was (usually the link you clicked, or `<body>` after it unmounts), and a screen reader — which announces changes, not silent DOM swaps — says nothing at all. The user activated a link, and as far as their ears are concerned, nothing happened.\n\nThe fix has two parts, and you need both:\n\n**1. Move focus to the new page\'s `<h1>` on every route change.** Give the page\'s `<h1>` `tabIndex={-1}` (so it can receive programmatic focus without becoming a Tab stop) and call `.focus()` on it after navigation. Now the screen reader is positioned at the top of the new content and reads the heading, and a keyboard user\'s next Tab starts from the top of the new page rather than from a stale position in the old one.\n\n**2. Announce the change via an `aria-live="polite"` region.** Keep one visually-hidden `<div aria-live="polite" aria-atomic="true">` mounted at the app root. On route change, write the new page\'s name into it. `aria-live="polite"` tells the screen reader to announce the change at the next pause without interrupting — so the user hears "Browse artists, page loaded" a beat after navigating. This is a belt-and-braces complement to moving focus, and it is what makes the transition feel narrated rather than silent.\n\nPackage both into one `useRouteAnnouncer` hook that reads the router location, and call it once at the app root. The hook is small, but it fixes a bug that no automated audit reliably catches and that affects every single navigation in the app — which makes it one of the highest-leverage accessibility fixes you will ever write.',
          diagram: `graph TD
    N[User activates a link: / -> /artists] --> R[React Router swaps the DOM]
    R --> BAD{Do nothing?}
    BAD -- Default behaviour --> B1[Focus stays on body]
    B1 --> B2[Screen reader: silence]
    B2 --> B3[User thinks navigation failed]
    R --> FIX[useRouteAnnouncer fires]
    FIX --> F1[Move focus to new h1 tabIndex=-1]
    FIX --> F2[Write page name into aria-live=polite region]
    F1 --> GOOD[SR reads the new heading]
    F2 --> GOOD2[SR announces 'Browse artists, loaded']
    GOOD --> DONE[User knows the page changed]
    GOOD2 --> DONE`,
          flowExplain:
            'The default-behaviour branch is the silent bug: DOM swapped, focus and screen reader untouched. The `useRouteAnnouncer` branch does the two things a full page reload would have done for free — reposition focus and announce.',
          whyItMatters:
            'Route-change focus management is a signature senior-level accessibility fix precisely because it is invisible to the developer and universal to SPAs. Bringing it up unprompted — "we move focus to the h1 and announce via an aria-live region on every route change, because a SPA does not reload and screen readers otherwise hear nothing" — signals that you have shipped accessible React, not just read a checklist.',
          steps: [
            'Add one visually-hidden `<div aria-live="polite" aria-atomic="true">` at the app root, its text driven by state.',
            'Give every page\'s `<h1>` `tabIndex={-1}` so it can receive programmatic focus.',
            'Write `useRouteAnnouncer` that subscribes to the router `location` and, on each change, focuses the main heading and updates the live-region text.',
            'Call the hook once, high in the tree (in `MainLayout` or `App`), so it covers every route.',
            'Skip the announcement on the very first load — the page already loaded normally; only *subsequent* navigations are silent.',
            'Test with a real screen reader (NVDA on Windows, VoiceOver on Mac): navigate and confirm you hear the new page announced.',
          ],
          code: `// src/hooks/useRouteAnnouncer.js
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useRouteAnnouncer(setAnnouncement) {
  const { pathname } = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }  // skip initial load

    // 1. Move focus to the new page's main heading.
    const h1 = document.querySelector('main h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');   // focusable programmatically, not a Tab stop
      h1.focus();
    } else {
      document.querySelector('main')?.focus();   // fallback
    }

    // 2. Announce via the polite live region.
    const label = document.title.replace(' — KalaKaara', '');
    setAnnouncement(\`\${label}, page loaded\`);
  }, [pathname, setAnnouncement]);
}

// At the app root (e.g. MainLayout):
function MainLayout() {
  const [announcement, setAnnouncement] = useState('');
  useRouteAnnouncer(setAnnouncement);
  return (
    <>
      <a href="#main" className={styles.skipLink}>Skip to content</a>
      <Navbar />
      {/* Visually hidden, but read aloud by screen readers on change. */}
      <div aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {announcement}
      </div>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

/* .srOnly — hide visually, keep for assistive tech.
   position:absolute; width:1px; height:1px; overflow:hidden;
   clip:rect(0 0 0 0); white-space:nowrap; */`,
          pitfalls: [
            '**Assuming a SPA navigation announces itself like a page reload.** It does not — the browser never reloads, so the screen reader stays silent. Fix: move focus to the `<h1>` and write to an `aria-live` region on every route change.',
            '**Giving the `<h1>` `tabIndex={0}` instead of `-1`.** Now the heading becomes a Tab stop for everyone, cluttering keyboard navigation. Fix: `tabIndex={-1}` — focusable by script, skipped by Tab.',
            '**Announcing on the very first load too.** The initial page loaded normally and was already announced; a duplicate is noise. Fix: guard the first render with a ref, as the hook does.',
            '**Using `aria-live="assertive"` for routine navigation.** Assertive interrupts whatever the user is hearing, which is jarring for a normal page change. Fix: `polite` — it waits for a natural pause.',
            '**Hiding the live region with `display:none`.** A `display:none` element is not announced at all. Fix: use the `.srOnly` clip technique, which keeps it in the accessibility tree.',
          ],
          tryIt:
            'Turn on your OS screen reader (Windows: Ctrl+Win+Enter for Narrator, or install NVDA) and navigate from the home page to Browse without the announcer. You will hear nothing. Add `useRouteAnnouncer`, navigate again, and hear "Browse artists, page loaded". You just fixed a bug that ships in the majority of React apps in production.',
          takeaway:
            'A SPA changes pages silently for screen-reader users. On every route change, move focus to the `<h1>` (tabIndex -1) and announce the new page via an `aria-live="polite"` region — the `useRouteAnnouncer` hook does both.',
        },
        {
          id: 'm15-t7',
          title: 'The rest of the a11y checklist, with the reasoning',
          explain:
            'Colour contrast, meaningful alt text, bound form labels, described errors, reduced motion, and 44px hit targets — each is a small rule with a concrete reason a real user needs it.',
          analogy:
            'A well-run seva counter has large clear signage a low-vision devotee can read, labels on every form so no one guesses which blank is for the name, and a queue rail wide enough for someone with a walking frame. None of it is decoration; each item is there because a specific person could not use the counter without it. An accessibility checklist is the same — every line exists because someone is excluded when it is missing.',
          theory:
            'With keyboard and route-change focus handled, the rest of the checklist is a set of small, specific rules. Learn the reason behind each; a rule you understand is one you will not skip under deadline.\n\n**Colour contrast ≥ 4.5:1** for normal text against its background (3:1 for large text). Low-vision users, and anyone outdoors on a phone in Kundapura sun, cannot read low-contrast text. KalaKaara\'s terracotta accent looks close to the line on white, so **verify it, do not assume it**. Run the actual hex through a contrast checker. (A typical terracotta around `#B4531F` on white computes to roughly 4.8:1 — it passes for normal text, but only just, and a lighter shade would fail. The point is that you *checked* rather than eyeballed.)\n\n**Meaningful `alt` text.** For a portfolio image, `alt` should describe the *artwork* — "Watercolour of Maravanthe beach at sunset" — not the file\'s role, "artwork image". A screen-reader user hears the alt in place of the image; "artwork image" tells them nothing they did not already know. And **`alt=""` is not the same as omitting `alt`.** An empty `alt=""` marks the image as **decorative** and tells the screen reader to skip it entirely; omitting the attribute makes many screen readers read the *filename* aloud ("IMG underscore 4 0 2 seven dot jpg"). So a purely decorative divider gets `alt=""` on purpose; a meaningful image gets a real description; nothing gets no attribute at all.\n\n**Form labels bound with `htmlFor`.** Every input needs a `<label htmlFor="bio">` whose `htmlFor` matches the input\'s `id`. This makes the screen reader announce the label when the field is focused, and — a bonus for everyone — clicking the label focuses the input, enlarging the hit target. A placeholder is not a label; it disappears on typing and is often too low-contrast.\n\n**Error messages tied via `aria-describedby`.** When a field is invalid, set `aria-invalid="true"` and point `aria-describedby` at the id of the error text. Now the screen reader reads the error *as part of the field*, so the user knows both that the phone field is wrong and why, without hunting for the message.\n\n**`prefers-reduced-motion`.** Some users get motion sickness or vestibular symptoms from animation. Wrap non-essential transitions in `@media (prefers-reduced-motion: no-preference)` so they are on by default but disappear for anyone who set the OS preference.\n\n**Hit targets ≥ 44px.** A tap target smaller than roughly 44×44 CSS pixels is hard to hit for anyone with a tremor, large fingers, or a moving bus. Your "Show phone number" button and every icon button must meet it.\n\nThen run **Lighthouse** and **axe DevTools**. They automate the mechanical checks. But understand the ceiling: a **Lighthouse accessibility score of 100 is a floor, not a pass.** It means no *automatable* violation was found; it says nothing about whether your alt text is meaningful, your tab order is logical, or your modal restores focus — all of which you verified by hand in the previous two topics. Treat 100 as "no obvious mistakes," then do the human audit.',
          whyItMatters:
            'These rules are the bulk of a WCAG 2.1 AA conformance pass, which is a legal baseline in much of the world and a routine interview topic. Knowing *why* `alt=""` differs from a missing `alt`, and being able to say "a Lighthouse 100 is a floor because it only catches automatable issues", demonstrates that you understand accessibility as user outcomes rather than a score to game.',
          steps: [
            'Put your actual accent and text hex values through a contrast checker (WebAIM or the DevTools contrast tool). Fix anything under 4.5:1 for normal text.',
            'Audit every image: meaningful ones get a description of the content; decorative ones get `alt=""`; none get no attribute.',
            'Bind every form input to a `<label htmlFor>`; remove any placeholder being used as a label.',
            'Wire validation errors with `aria-invalid` and `aria-describedby` pointing at the error element\'s id.',
            'Gate non-essential animation behind `@media (prefers-reduced-motion: no-preference)`.',
            'Run Lighthouse and axe DevTools, fix every reported issue, then treat the resulting score as the *start* of your manual audit, not the end.',
          ],
          code: `// A form field that is fully accessible: label bound, error described.
function PhoneField({ value, onChange, error }) {
  return (
    <div className={styles.field}>
      <label htmlFor="phone">Phone number</label>   {/* htmlFor === id */}
      <input
        id="phone"
        type="tel"
        value={value}
        onChange={onChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'phone-error' : undefined}
        className={styles.input}                       {/* min-height: 44px */}
      />
      {error && (
        <p id="phone-error" role="alert" className={styles.error}>
          {error}                                      {/* read as part of the field */}
        </p>
      )}
    </div>
  );
}

// Meaningful vs decorative alt — three different intents:
<img src={artwork.url} alt={artwork.title} />          {/* "Watercolour of Maravanthe beach" */}
<img src="/divider.svg" alt="" />                       {/* decorative: SR skips it */}
// <img src="/x.jpg" />  <-- NEVER: SR may read the filename aloud

/* Respect the OS motion preference. Animate only when allowed. */
.card { /* no transition by default */ }
@media (prefers-reduced-motion: no-preference) {
  .card { transition: transform 150ms ease; }
}

/* Minimum hit target — every button and icon-button. */
.iconButton { min-width: 44px; min-height: 44px; }

/* Terracotta accent contrast: #B4531F on #FFFFFF ~ 4.8:1 -> passes 4.5:1.
   We VERIFIED this; we did not assume it. A lighter #C9743F would fail. */`,
          pitfalls: [
            '**Assuming a nice-looking accent colour has enough contrast.** Terracotta on white sits near the 4.5:1 line and a slightly lighter shade fails. Fix: run the exact hex through a checker and adjust the token if it fails.',
            '**Writing `alt="artwork image"` on every portfolio photo.** It conveys nothing and is arguably worse than empty. Fix: describe the actual artwork; that alt text is also indexable content for image search.',
            '**Omitting `alt` on decorative images.** Many screen readers then announce the filename. Fix: give decorative images `alt=""` explicitly — silence is intentional, not accidental.',
            '**Using a placeholder as the label.** It vanishes when the user types and often fails contrast. Fix: a real `<label htmlFor>`; keep placeholders for examples only.',
            '**Treating a Lighthouse 100 as "accessible, done".** It only catches automatable issues and misses meaningless alt text, illogical tab order, and broken focus restoration. Fix: 100 is the floor; the keyboard and screen-reader audits are the real pass.',
          ],
          tryIt:
            'Open axe DevTools on your artist page and fix every violation until it is clean. Then, still on the clean page, find one image whose alt text is technically present but says nothing useful ("photo", "image"), and rewrite it to describe the artwork. axe cannot catch that one — which is exactly why the automated score is a floor.',
          takeaway:
            'The checklist is small and each rule has a reason: verified contrast, alt that describes the artwork, `alt=""` for decoration (never omitted), bound labels, described errors, reduced motion, 44px targets. A Lighthouse 100 is where the manual audit begins.',
        },
        {
          id: 'm15-t8',
          title: 'A security review of the whole app, as a threat model',
          explain:
            'A threat model walks every asset — phone numbers, profiles, images, reviews — and for each names the threat, the control that stops it, and how you actually verified the control works.',
          analogy:
            'Before the Kollur temple festival, the committee does not just hope nothing goes wrong. They walk the grounds asset by asset: the hundi (who can open it, and is the lock checked?), the jewellery (who holds the key, is the register signed?), the crowd gates (who mans them?). For each valuable thing: what could go wrong, what stops it, and did someone confirm the lock is actually locked. A threat model is that walk, written down.',
          theory:
            'Security is not a feeling that the app is "probably fine"; it is a **table** you can hand to someone else. For each asset you name the **threat** (what an attacker wants to do), the **control** (what stops them), and the **verification** (how you proved the control is in place, not just intended). A control you have not verified is a hope.\n\nWalk KalaKaara\'s assets and controls:\n\n**The anon key in the bundle.** *Threat:* someone reads it from your JS. *Control:* it is a public identifier, not a secret — it only announces "anonymous caller"; RLS decides what that caller may do. *Verification:* confirm RLS is on for every table (below), and confirm that with the anon key alone you cannot read a phone number or another user\'s data.\n\n**The `service_role` key.** *Threat:* if it ships anywhere client-side, it bypasses **all** RLS and hands an attacker the entire database. *Control:* it appears **nowhere** — not in the bundle, not in the repo, not in any client env var. *Verification:* `grep -ri "service_role" src/ .env* --include=*.js --include=*.jsx` returns nothing, **and** you check the Vercel dashboard environment variables to confirm no `service_role` value is exposed to the client build (only `VITE_`-prefixed vars reach the client, and the service key must never carry that prefix).\n\n**RLS on every table.** *Threat:* one table shipped with RLS disabled is a wide-open door — the anon key reads everything in it. *Control:* RLS enabled on all 18 tables, each with at least one policy. *Verification:* the two audit queries below — one lists any table with RLS off, the other lists any table with RLS on but **zero policies** (which denies everyone and is usually a mistake, or is a table you forgot to write policies for).\n\n**`security definer` functions.** *Threat:* a function that runs with the owner\'s privileges can be hijacked via a malicious `search_path` to run attacker-controlled code as the owner. *Control:* every `security definer` function pins `set search_path = public, pg_temp`. *Verification:* inspect each such function\'s definition and confirm the pinned path.\n\n**Open redirect in `?next=`.** *Threat:* your sign-in flow returns the user to `?next=<url>`; an attacker crafts `?next=https://evil.example` and uses your trusted domain to bounce victims to a phishing page. *Control:* validate `next` against an allowlist — accept only same-origin, relative paths beginning with `/` (and not `//`). *Verification:* unit-test the validator with hostile inputs.\n\n**XSS via `dangerouslySetInnerHTML`.** *Threat:* an artist\'s bio contains `<script>` and it executes for every visitor. *Control:* we never use `dangerouslySetInnerHTML` for user content; **React escapes by default**. *Verification:* grep the repo for `dangerouslySetInnerHTML`. Understand what "by default" excludes, though: React escapes text children, but it does **not** protect `href="javascript:..."` URLs, does not sanitise anything you deliberately pass to `dangerouslySetInnerHTML`, and does not cover HTML you inject outside React. So: escape is automatic for text; URLs and any raw-HTML sink are your responsibility.\n\n**Public Storage buckets.** *Threat:* a public bucket URL is public to the entire internet **forever** — even after you delete the `artworks` row, the object and its URL persist. *Control:* delete the Storage object alongside the row (Module 8), and keep only genuinely public images in public buckets. *Verification:* delete a test artwork and confirm the object URL 404s.\n\n**Rate-limiting contact reveals.** *Threat:* a signed-in scraper reveals every artist\'s phone number in a loop to harvest a marketing list. *Control:* rate-limit reveals per user (a `contact_reveals` table with a unique-per-day constraint, or a throttle in a Postgres function). *Verification:* attempt rapid repeated reveals and confirm they are throttled.\n\nProduce the whole thing as a table. The table is the deliverable — it is what a reviewer reads, and the "Verified how?" column is the one that separates a real review from a wish list.',
          diagram: `graph TD
    START[Threat model: walk every asset] --> A1[Phone numbers]
    START --> A2[Artist profiles]
    START --> A3[Artwork images]
    START --> A4[Reviews]
    START --> A5[The keys]
    A5 --> K1{anon key exposed?}
    K1 -- Yes, by design --> K1OK[OK: RLS is the control]
    A5 --> K2{service_role anywhere?}
    K2 -- grep repo + Vercel dashboard --> K2Q{Found?}
    K2Q -- Yes --> FAIL[CRITICAL: remove immediately]
    K2Q -- No --> K2OK[Verified absent]
    A1 --> R{RLS on + policy present?}
    R -- Audit query 1 + 2 --> ROK[Withheld from anon]
    A2 --> SD[security definer:<br/>search_path pinned?]
    A2 --> OR[?next= open redirect:<br/>allowlist validated?]
    A4 --> XSS[dangerouslySetInnerHTML:<br/>grep = none]
    A3 --> STG[Public bucket:<br/>object deleted with row?]
    A1 --> RL[Contact reveal rate-limited?]`,
          flowExplain:
            'The `service_role` branch is the critical one: if the grep of both the repo and the Vercel dashboard finds it client-side, everything else is moot because that key bypasses every control in the table.',
          whyItMatters:
            'A written threat model with a "verified how" column for each control is exactly what a security review looks like in industry, and being able to produce one — especially the two RLS audit queries and the repo-plus-dashboard grep for the service key — is a portfolio-defining skill. It also ties the whole course together: nearly every control here was designed in an earlier module, and now you are proving it holds.',
          steps: [
            'List every asset: phone numbers, profiles, artwork images, reviews, and the keys themselves.',
            'For each, write the threat, the control, and — the important column — how you verified the control is actually in place.',
            'Run the two RLS audit queries and confirm both return zero rows (no table with RLS off; no RLS-enabled table lacking a policy).',
            'Grep the repo and check the Vercel dashboard env vars to prove the `service_role` key appears nowhere client-side.',
            'Validate the `?next=` redirect allowlist with hostile inputs, and grep for `dangerouslySetInnerHTML`.',
            'Assemble it all into one Markdown table — that table is the security review deliverable.',
          ],
          code: `-- AUDIT QUERY 1: any table with RLS turned OFF? Should return ZERO rows.
select schemaname, tablename
from pg_tables
where schemaname = 'public'
  and rowsecurity = false;          -- rowsecurity = is RLS enabled?

-- AUDIT QUERY 2: any table with RLS ON but NO policies?
-- (RLS on + zero policies = denies everyone; usually a forgotten table.)
select t.tablename
from pg_tables t
where t.schemaname = 'public'
  and t.rowsecurity = true
  and not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = t.tablename
  );

-- security definer function must PIN its search_path:
create or replace function public.reveal_contact(artist uuid)
returns text
language sql
security definer
set search_path = public, pg_temp     -- <-- the control. Without this line, hijackable.
as $$ ... $$;

// Repo grep — the service_role key must appear NOWHERE client-side:
//   grep -ri "service_role" src/ .env* --include=*.js --include=*.jsx
//   (expected: no matches) — AND check Vercel dashboard env vars by hand.

// Open-redirect control: validate ?next= against an allowlist.
// utils/safeNext.js
export function safeNext(next) {
  // Accept ONLY same-origin relative paths. Reject absolute URLs and //host.
  if (typeof next !== 'string') return '/';
  if (!next.startsWith('/')) return '/';       // must be relative
  if (next.startsWith('//')) return '/';       // //evil.example is protocol-relative
  return next;
}
// safeNext('/artists/rukmini')      -> '/artists/rukmini'
// safeNext('https://evil.example')  -> '/'
// safeNext('//evil.example')        -> '/'`,
          pitfalls: [
            '**Treating the anon key as a secret and the leak as a breach.** It is a public identifier; the real breach is RLS being off. Fix: focus verification on RLS coverage, not on hiding the anon key.',
            '**Only grepping the repo for `service_role` and stopping there.** It could still be set as a plain env var in the Vercel dashboard and inlined into the client build. Fix: grep the repo AND inspect the dashboard env vars; never give the service key a `VITE_` prefix.',
            '**Assuming RLS-enabled means RLS-protected.** A table with RLS on but no policy denies everyone, and a table with a `using (true)` policy allows everyone. Fix: run audit query 2, and read each policy, not just the enabled flag.',
            '**Forgetting to pin `search_path` on a `security definer` function.** An attacker can shadow a function or table it calls and run code as the owner. Fix: `set search_path = public, pg_temp` on every definer function.',
            '**Believing "React escapes by default" covers everything.** It does not escape `javascript:` URLs, anything you pass to `dangerouslySetInnerHTML`, or HTML injected outside React. Fix: validate URLs, avoid the raw-HTML sink for user content, and grep to prove you did.',
            '**Assuming a deleted artwork row removes its public image.** The Storage object and its public URL persist forever. Fix: delete the object alongside the row, and verify the URL 404s.',
          ],
          tryIt:
            'Run both audit queries against your Supabase project right now. If either returns a row, you have found a real hole before an attacker did — fix it and re-run until both are empty. Then run the `service_role` grep across your repo; a clean result is a line you can put in your threat-model table with a clear conscience.',
          takeaway:
            'A security review is a table of assets, threats, controls, and verifications. Prove RLS is on everywhere with the two audit queries, prove the `service_role` key is absent from both repo and dashboard, and pin `search_path` on every `security definer` function.',
        },
      ],
    },
    {
      id: 'm15-s3',
      title: 'Testing, and what comes next',
      topics: [
        {
          id: 'm15-t9',
          title: 'Testing that is worth the time',
          explain:
            'With Vitest and React Testing Library, write a small number of tests that assert on behaviour a user can observe — never on implementation details like CSS class names.',
          analogy:
            'A restaurant health inspector does not check that the cook stirred clockwise or used a specific brand of ladle. He checks what the diner experiences: is the food hot, is the kitchen clean, is the water safe. Testing by CSS class is inspecting the ladle brand; testing by accessible role is inspecting the meal. Change the ladle and the meal is fine — a good test does not break.',
          theory:
            'Most tests beginners write are worse than no tests: they assert on internal details, so they break every time you refactor without catching a single real bug. The discipline that fixes this is **test behaviour, not implementation** — query the DOM the way a user (and a screen reader) perceives it, using **React Testing Library** on top of **Vitest** (Vite\'s native test runner, so no separate config).\n\nThe rule in practice: query by **accessible role and name**, never by class or test-id-of-last-resort. `getByRole(\'button\', { name: /show phone number/i })` finds the button a user would find, by the text they would read. `container.querySelector(\'.btn-primary\')` finds a styling detail — rename the class and the test breaks though nothing about the app changed; worse, the button could be a `<div>` that no keyboard user can press and the class-based test would still pass. Querying by role makes your tests double as accessibility checks: if `getByRole(\'button\')` cannot find your button, neither can a screen reader.\n\nDo not chase coverage percentages. Write the **few tests that would actually catch a regression you fear**. Three kinds earn their keep in KalaKaara:\n\n**1. Pure-function unit tests.** `formatPrice`, `slugify`, `haversineKm` are pure functions of their inputs — no React, no network, no mocks. They are the cheapest, fastest, most stable tests you can write, and they pin down exactly the logic most likely to have an off-by-one or a rounding bug. `formatPrice(1500)` must equal `"₹1,500"`; `slugify(\'Rukmini Shetty\')` must equal `\'rukmini-shetty\'`; `haversineKm(kundapura, udupi)` must be about 32, within a tolerance.\n\n**2. Component tests.** Render `ArtistCard` with a fake artist object and assert on its **accessible output** — the name is present as a heading or link, the rating is announced, the "Show phone number" affordance exists. You pass plain props; there is no Supabase involved, because a presentational component (Module 1\'s rule) never touches the network. That architectural rule is what makes this test trivial.\n\n**3. Hook / integration tests with the service layer mocked.** Test `useAuthGate` (the Module 11 hook that saves an intent, sends the user to sign-in, and replays the intent on return) by mocking the service layer and asserting the intent is stored and replayed. This is straightforward for one reason that pays off one last time here: **only `services/` imports Supabase**, so mocking the network is mocking one small module, not stubbing a client threaded through the whole app. The dependency rule you adopted in Module 1 is what makes the app testable in Module 16.',
          whyItMatters:
            'Knowing *which* tests to write is a more senior skill than knowing *how* to write them. "Test behaviour by accessible role, not class names, and mock at the service boundary" is a philosophy you can defend in any interview, and it produces a suite that survives refactors instead of fighting them. It also demonstrates that a good architecture (the dependency rule) has a concrete, measurable payoff: testability.',
          steps: [
            'Add Vitest and React Testing Library; configure the test environment as `jsdom` in `vite.config.js`.',
            'Write pure-function unit tests for `formatPrice`, `slugify`, and `haversineKm` (with a tolerance for the float).',
            'Write a component test for `ArtistCard`: render it with a fake artist and assert on the accessible name and rating, via `getByRole`.',
            'Write a hook test for `useAuthGate`: mock the service module with `vi.mock`, act the gate, and assert the intent is stored and replayed.',
            'Ban `querySelector` by class in tests; if a query is awkward, the fix is usually to add an accessible name to the element, which helps real users too.',
          ],
          code: `// src/utils/formatPrice.test.js — pure functions, no mocks, instant.
import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';
import { slugify } from './slugify';
import { haversineKm } from './haversine';

describe('pure utils', () => {
  it('formats rupees with grouping', () => {
    expect(formatPrice(1500)).toBe('₹1,500');
    expect(formatPrice(0)).toBe('₹0');
  });
  it('slugifies a display name', () => {
    expect(slugify('Rukmini Shetty')).toBe('rukmini-shetty');
  });
  it('measures Kundapura -> Udupi at about 32 km', () => {
    const km = haversineKm({ lat: 13.62, lng: 74.69 }, { lat: 13.34, lng: 74.75 });
    expect(km).toBeGreaterThan(28);
    expect(km).toBeLessThan(36);          // tolerance for a great-circle float
  });
});

// src/components/ArtistCard/ArtistCard.test.jsx — behaviour by accessible name.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ArtistCard } from './ArtistCard';

it('shows the artist name and rating accessibly', () => {
  const artist = { slug: 'rukmini-shetty', displayName: 'Rukmini Shetty',
                   avgRating: 4.7, reviewCount: 12, primaryCategory: 'Portrait' };
  render(<MemoryRouter><ArtistCard artist={artist} /></MemoryRouter>);

  // Found the way a user finds it — by role and accessible name.
  expect(screen.getByRole('link', { name: /rukmini shetty/i })).toBeInTheDocument();
  expect(screen.getByText(/4\\.7/)).toBeInTheDocument();
  // NOT: container.querySelector('.artist-card__name')  <-- brittle, meaningless
});

// src/hooks/useAuthGate.test.js — mock the ONE service module, replay the intent.
import { renderHook, act } from '@testing-library/react';
import { vi, expect, it } from 'vitest';
import * as authService from '../services/authService';
import { useAuthGate } from './useAuthGate';

vi.mock('../services/authService');    // trivial: only services/ touches Supabase

it('saves an intent and replays it after sign-in', () => {
  authService.getSession.mockResolvedValue(null);   // not signed in
  const { result } = renderHook(() => useAuthGate());
  act(() => result.current.requireAuth({ action: 'reveal', slug: 'rukmini' }));
  expect(JSON.parse(sessionStorage.getItem('intent'))).toEqual(
    { action: 'reveal', slug: 'rukmini' }
  );
});`,
          pitfalls: [
            '**Asserting on CSS classes or test ids of last resort.** `querySelector(\'.btn-primary\')` breaks on a rename and passes even if the element is an unclickable `<div>`. Fix: `getByRole(\'button\', { name: ... })` — it tests what the user experiences.',
            '**Chasing 100% coverage.** You end up testing getters and setters while real bugs hide in untested logic. Fix: test the handful of things whose breakage you would actually fear.',
            '**Mocking the Supabase client directly in every test.** Painful and repetitive. Fix: mock the `services/` module — the dependency rule confines Supabase to one place precisely so you can.',
            '**Testing a presentational component through the network.** If `ArtistCard` needs a real fetch to test, it is doing too much. Fix: presentational components take props; pass a fake object.',
            '**Comparing floats with `toBe`.** `haversineKm` returns an irrational-ish float; exact equality is flaky. Fix: assert a range or use `toBeCloseTo`.',
          ],
          tryIt:
            'Write the three pure-function tests and run `vitest`. They finish in milliseconds and never touch a network. Now rename a CSS class in `ArtistCard` and re-run the component test — it still passes, because it queries by role, not class. That resilience is the entire point of the discipline.',
          takeaway:
            'Write few tests, and test behaviour by accessible role and name — never class names. Pure functions, one component by its accessible output, and one hook with the service layer mocked (cheap because only `services/` touches Supabase).',
        },
        {
          id: 'm15-t10',
          title: 'Testing the part that actually protects users: the RLS policies',
          explain:
            'Your application tests run through your own UI, so they cannot prove RLS works — you must test the policies directly, with a raw client, asserting on row counts because RLS denies silently.',
          analogy:
            'You can watch the temple\'s own trusted priest walk in and out of the jewellery room all day and conclude the lock works — but you have only watched the person who is *supposed* to get in. To test the lock, you hand the key-that-should-not-work to a stranger and check whether the door opens. RLS testing is exactly that: stop testing your own trusted UI and try to break in as an untrusted client.',
          theory:
            'Here is the uncomfortable truth about the tests in the previous topic: **they cannot prove your security works.** They exercise the app through your own components and hooks, which query the way you *intended*. They never attempt the queries an attacker would attempt. If RLS were completely disabled, most of your application tests would still pass, because your UI never tries to read another user\'s phone number in the first place. The thing that actually protects KalaKaara\'s users — the RLS policies — is untested by everything you have written so far.\n\nSo test the policies **directly**, outside the app, at the database boundary. Two approaches: a `rls.test.sql` run with pgTAP, or — simpler and closer to reality — a script using the raw `supabase-js` client with **two separate anon/authenticated sessions**, one for "user A" and one for "user B", making the hostile queries an attacker would make. The test asserts that the database refuses them.\n\nThe four highest-value assertions, each mapping to a control from the threat model:\n\n1. **Anonymous cannot select `phone`.** As an anonymous client, select the phone column; expect it withheld (null or absent).\n2. **User A cannot update user B\'s artist row.** Authenticated as A, attempt to update B\'s row; expect zero rows affected.\n3. **User A cannot insert an artwork under B\'s `artist_id`.** Authenticated as A, insert an artwork pointing at B\'s artist id; expect the insert rejected or zero rows created.\n4. **Nobody can review themselves.** Authenticated as an artist, attempt to insert a review of their own artist row; expect it rejected.\n\nThe critical technique: **assert on row counts, not on errors.** RLS **denies silently**. A `select` that a policy forbids does not raise an exception — it returns **zero rows**. An `update` a policy forbids does not error — it reports **zero rows affected**. So a test that only checks `expect(error).toBeTruthy()` will *pass by accident* when the operation actually succeeds and returns data it should not have, and will *fail to notice* a silent denial that is actually correct. You must assert the *shape of the result*: expect exactly zero rows returned or affected for a denied read/write, and a specific non-zero count for an allowed one. Counting is how you see a silent policy working.\n\nThis is the **highest-value test suite in the entire project.** A broken `formatPrice` shows a wrong price. A broken RLS policy leaks every artist\'s phone number to the internet. The blast radius is not comparable, and this suite is the only thing that catches it.',
          diagram: `graph TD
    M[RLS test matrix] --> R1[anon selects phone]
    R1 --> A1[Assert: 0 rows / null. Denied silently.]
    M --> R2[user A updates B's artist row]
    R2 --> A2[Assert: 0 rows affected. NOT an error.]
    M --> R3[user A inserts artwork under B's artist_id]
    R3 --> A3[Assert: rejected / 0 rows created]
    M --> R4[artist reviews themselves]
    R4 --> A4[Assert: rejected]
    A1 --> KEY[Assert ROW COUNTS, not errors —<br/>RLS denies by returning nothing]
    A2 --> KEY
    A3 --> KEY
    A4 --> KEY
    KEY --> WHY[Tests run OUTSIDE the app,<br/>as an untrusted client. Highest value suite.]`,
          flowExplain:
            'Every row of the matrix ends at the same key insight: assert on counts, because a forbidden operation returns zero rows rather than throwing — an error-only assertion would miss both a real leak and a correct denial.',
          whyItMatters:
            'This is the single most impressive thing in the whole test suite to a reviewer, because it shows you understand that security must be tested against the trust boundary, not through the trusted UI, and that RLS fails silently so you must count rows. It is also the test that would actually save real users\' phone numbers from a leak — the highest-stakes, highest-value testing you can do on this app.',
          steps: [
            'Create two real test users (A and B) and, for each, a `supabase-js` client authenticated as that user, plus one anonymous client.',
            'Assertion 1: with the anonymous client, select `phone` from a published artist and assert it is null or absent.',
            'Assertion 2: as A, attempt to update B\'s artist row; assert zero rows were affected (not that an error was thrown).',
            'Assertion 3: as A, attempt to insert an artwork with B\'s `artist_id`; assert it was rejected or created zero rows.',
            'Assertion 4: as an artist, attempt to review your own artist row; assert rejection.',
            'For every assertion, check the returned/affected row count — never rely on an error being raised, because RLS denies silently.',
          ],
          code: `// tests/rls.test.js — run OUTSIDE the app, as untrusted clients.
import { createClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll } from 'vitest';

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

let anon, userA, userB, artistB;   // clients + fixtures set up in beforeAll

describe('RLS policies (the real security)', () => {
  it('1. anonymous cannot read phone numbers', async () => {
    const { data } = await anon
      .from('artists').select('id, phone').eq('is_published', true).limit(5);
    // RLS/ column rule denies SILENTLY -> phone comes back null, no error.
    expect(data.every((r) => r.phone === null)).toBe(true);
  });

  it('2. user A cannot update user B artist row', async () => {
    const { data } = await userA
      .from('artists').update({ bio: 'hacked' })
      .eq('id', artistB.id).select();
    // NOT expect(error) — a forbidden update reports ZERO rows affected.
    expect(data).toHaveLength(0);      // <-- assert the COUNT, not an error
  });

  it('3. user A cannot insert artwork under B artist_id', async () => {
    const { data, error } = await userA
      .from('artworks').insert({ artist_id: artistB.id, title: 'x' }).select();
    // with check policy rejects it: either an error OR zero rows.
    expect(data ?? []).toHaveLength(0);
    // (error may be set OR data empty — assert the row count either way)
  });

  it('4. an artist cannot review their own artist row', async () => {
    const { data } = await userB
      .from('reviews').insert({ artist_id: artistB.id, rating: 5 }).select();
    expect(data ?? []).toHaveLength(0);   // self-review blocked, silently
  });
});

/*
  WHY ROW COUNTS, NOT ERRORS:
    A SELECT a policy forbids  -> returns []          (no exception)
    An UPDATE a policy forbids -> 0 rows affected      (no exception)
  A test asserting only expect(error).toBeTruthy() PASSES when a leak occurs
  and returns data. Count the rows. Zero denied, N allowed.
*/`,
          pitfalls: [
            '**Believing your app tests prove RLS works.** They query as you intended and never attempt the attacker\'s query. Fix: test the policies directly with raw clients, outside the UI.',
            '**Asserting on thrown errors instead of row counts.** RLS denies silently — a forbidden read returns `[]`, a forbidden update affects 0 rows, neither throws. An error-only assertion misses real leaks. Fix: assert the returned/affected count.',
            '**Testing with the `service_role` key for convenience.** It bypasses RLS, so every test passes and proves nothing. Fix: use anon/authenticated sessions exactly as a real client does.',
            '**Sharing one client across "user A" and "user B".** They end up as the same session and the ownership tests are meaningless. Fix: two separately authenticated clients.',
            '**Skipping the negative-space tests.** It is easy to assert A *can* edit A\'s row and forget to assert A *cannot* edit B\'s. The second is the security test. Fix: for every "can", write the matching "cannot".',
          ],
          tryIt:
            'Write assertion 2 — user A updating user B\'s row — and first assert `expect(error).toBeTruthy()`. It fails, because no error is thrown. Now change it to `expect(data).toHaveLength(0)` and it passes. You have just felt, in your own test, why RLS denials must be counted, not caught.',
          takeaway:
            'Application tests cannot prove RLS works because they run through your trusted UI. Test policies directly with untrusted clients, assert on row counts (RLS denies silently), and treat this as the highest-value suite in the project.',
        },
        {
          id: 'm15-t11',
          title: 'The capstone review and the honest roadmap',
          explain:
            'Walk both core flows end to end on the live site, then write the future-enhancements roadmap where each item names what it would actually require and cost.',
          analogy:
            'When a house in Kundapura is finished enough to live in, the family does a final walk-through — turn on every tap, flip every switch, open every door — before they trust it. Then they pin a list to the wall of what is still to come: the upstairs rooms, the compound wall, the borewell. They are not apologising; they are showing they know exactly what is done and what is not. This module ends the same way.',
          theory:
            'You have shipped a real product. The capstone is two things: **prove it works end to end on the deployed site**, and **document the road not yet taken, honestly**.\n\n**The end-to-end walk, on production, not localhost.** Run **Flow A** (Module 1): a real artist signs in with Google, creates a profile, uploads a cover and portfolio images to Storage, declares service areas, and publishes. Then **Flow B**: an anonymous visitor in Kundapura searches, finds that artist via service-area matching, opens the profile, reads reviews, taps "Show phone number", signs in, returns to the exact spot, and reveals the number. If both flows work on the live URL, KalaKaara is done. This is the acceptance test the whole course was building toward.\n\n**The honest roadmap.** A mature engineer does not present a project as finished-and-perfect; they present it as *shipped, with a clear-eyed list of what is next and what each item truly costs*. For each future enhancement, name the real requirement — not "add messaging" but the actual moving parts:\n\n- **In-app messaging.** A realtime `messages` table with RLS per conversation, Supabase Realtime subscriptions, unread counts, and — the expensive part — **moderation**, because the moment strangers can message each other you own a harassment surface. WhatsApp already works and offloads all of this, which is why it is not built.\n- **Payments and commissions.** Requires a payment gateway, which requires a **credit card on file, a registered business, and KYC** — the exact things NFR N1 forbids. This is the clearest "out of scope, and here is precisely why" item on the list.\n- **Artist verification.** A blue tick is a **human process** — someone must verify identity and portfolio ownership — not a code feature. The database change is trivial; the operational cost is real.\n- **Admin moderation queue.** Introduces a **fourth actor** the whole authorisation model deliberately avoided (Module 1: three actors, no admin), and with it a whole new RLS policy surface, an admin UI, and an audit trail. It is a project, not a page.\n- **Push notifications.** Needs a native app shell or a paid web-push service, and a reason to notify that the marketplace does not yet have.\n- **i18n for Kannada.** Externalise every string, add a locale switcher, handle Kannada rendering and pluralisation. Genuinely valuable for coastal Karnataka users; a real, bounded piece of work.\n- **Moving to SSR** (from Module 15\'s t1). If organic search becomes the growth channel, migrate to Next.js for server-rendered pages. The trigger is a business condition, not a technical itch — you do it *when SEO is the thing growing the marketplace*, not before.\n\nClose the course by naming **what you can now defend in an interview**, because that framing is what turns a project into a credential:\n\n- **RLS as an authorisation model** — that "artist" is ownership of a row, not a role column, and that authorisation lives in the database where it cannot be forgotten.\n- **Geospatial matching without PostGIS** — containment up a seeded administrative hierarchy, OR-ed with a bounding-box-then-Haversine radius search, chosen because PostGIS was ruled out and this scale did not need it.\n- **Choosing an architecture from a hard constraint** — that "zero cost, no credit card" eliminated Google Places and Firebase Storage, drove the choice of Supabase and a self-hosted location stack, and that being able to trace a technology choice back to a named constraint is the actual skill.\n\nThat is the difference between "I built an artist marketplace" and "I made a series of defensible engineering decisions under a real constraint, verified them, and know exactly what I would build next." Only one of those gets the callback.',
          whyItMatters:
            'How you talk about what you did *not* build is often more revealing than what you did. Placing each enhancement with its real cost, tracing every rejection to a constraint, and naming the three things you can defend in an interview is precisely the maturity that separates a hireable engineer from a tutorial-follower. This is the note the whole course has been building toward.',
          steps: [
            'On the deployed URL, run Flow A fully: sign in, create a profile, upload images, set service areas, publish.',
            'On the same deployed URL, run Flow B fully: search, match, open, read reviews, reveal contact via the sign-in gate, and confirm you land back where you were.',
            'Write the roadmap in the README: for each enhancement, one line on the real requirement and one on its cost, not just the feature name.',
            'Mark payments explicitly as out of scope by NFR N1, and SSR as gated on search becoming the growth channel — decisions, not oversights.',
            'Write the three interview-defence points: RLS as authorisation, matching without PostGIS, architecture chosen from a hard constraint.',
            'Do a final commit that tags the project as feature-complete for the MVP, with the roadmap as the last section of the README.',
          ],
          code: `## KalaKaara — Roadmap (README section, written as decisions, not a to-do list)

### Shipped (MVP, Modules 1–16)
- Public browse/search/filter with service-area matching (no PostGIS, no paid API)
- Google-gated contact reveal, favourites, reviews with denormalised ratings
- Artist dashboard with Supabase Storage uploads
- RLS on all 18 tables; SEO, a11y, security, and RLS test suites
- Deployed on Vercel Hobby. Zero cost. No credit card, ever.

### Deliberately NOT built (and why)
| Enhancement        | What it actually requires                        | Cost / verdict            |
|--------------------|--------------------------------------------------|---------------------------|
| In-app messaging   | Realtime table + RLS + unread counts + MODERATION| WhatsApp already works    |
| Payments / commis. | Gateway + card on file + registered business+ KYC| Out of scope by NFR N1    |
| Artist verification| A human identity/portfolio review process        | Ops cost, not code        |
| Admin moderation   | A 4th actor + a whole new RLS policy surface + UI | A project, not a page     |
| Push notifications | Native shell or paid web-push + a reason to notify| Deferred                  |
| i18n (Kannada)     | Externalise strings + locale switch + rendering  | Bounded, valuable, later  |
| SSR (Next.js)      | Rewrite the SPA for server rendering             | ONLY if search grows us   |

### What this project lets me defend in an interview
1. RLS as an authorisation model — "artist" is owning a row, not a role column;
   authorisation lives in Postgres where it cannot be forgotten.
2. Geospatial matching without PostGIS — hierarchy containment OR-ed with a
   bounding-box-then-Haversine radius search, chosen because PostGIS was ruled out.
3. Choosing an architecture from a hard constraint — "zero cost, no card"
   eliminated Google Places and Firebase Storage and drove every stack decision.`,
          pitfalls: [
            '**Doing the final walk-through on localhost.** Production has different env vars, real OAuth redirect URLs, and a live database. Fix: run both flows on the deployed URL, or you have not tested what users use.',
            '**Presenting the roadmap as "things I ran out of time for".** That reads as unfinished. Fix: present each as a decision with a named cost — moderation, KYC, a fourth actor — which reads as judgement.',
            '**Claiming payments were "coming soon".** They contradict your own zero-card constraint. Fix: state plainly that payments are out of scope *because* of NFR N1; consistency is more credible than ambition.',
            '**Ending the course without an interview-defence summary.** The decisions fade from memory and the project becomes "a marketplace I built". Fix: write the three defence points down while they are fresh; they are the actual credential.',
            '**Treating SSR as an obvious next step.** Migrating a working SPA is expensive and only worth it if search is growing you. Fix: gate it on a business condition, not on a technical urge for tidiness.',
          ],
          tryIt:
            'Record yourself giving the two-minute answer to "tell me about KalaKaara" using only the three interview-defence points — RLS authorisation, matching without PostGIS, architecture from a constraint. If you can deliver it without notes, the course did its job: you did not just build an app, you can explain why every important part of it is the way it is.',
          takeaway:
            'Prove both flows on the live site, then write a roadmap where every unbuilt feature carries its real cost. Close by naming what you can defend: RLS as authorisation, geospatial matching without PostGIS, and architecture chosen from a hard constraint.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm15-p1',
      type: 'Mini Project',
      title: 'The Production Readiness Audit',
      domain: 'SEO, Accessibility, Security & Testing',
      duration: '2 hours',
      description:
        'Take the working, deployed KalaKaara and make it production-grade across four dimensions. Deliver four artifacts — an SEO pass, an accessibility report with fixes, a verified security threat model, and a test suite that includes the RLS policy matrix — plus the roadmap in the README. Each artifact is something a real team would demand before calling a launch "done".',
      tools: ['React', 'Vite', 'Supabase', 'Vitest', 'React Testing Library', 'axe DevTools', 'Lighthouse', 'Node'],
      blueprint: {
        overview:
          'Four deliverables committed to the repo. (1) An SEO pass: per-route titles via a `useDocumentTitle` hook, canonical URLs, JSON-LD on artist pages, and a build-time-generated `sitemap.xml` wired into `npm run build`. (2) An accessibility report from a keyboard-only run plus axe, with every issue fixed and a `useRouteAnnouncer` added. (3) A security threat-model table with each control verified, including the two RLS audit queries and a repo-wide grep proving the `service_role` key is absent. (4) A test suite: three unit tests, two component tests, and the RLS policy matrix asserting on row counts. Finally, the honest roadmap in the README.',
        functionalRequirements: [
          '**Per-route SEO.** Every route sets a unique `<title>` and `<meta name="description">` via a `useDocumentTitle` hook (not a library), plus a per-route canonical URL, and exactly one `<h1>` per page with no skipped heading levels.',
          '**JSON-LD on artist pages.** A `Person` block with `name`, absolute `image`, `aggregateRating` (only when `reviewCount > 0`), and `areaServed`, built from the artist object and validated in Google\'s Rich Results Test.',
          '**Build-time sitemap.** `scripts/generate-sitemap.mjs` queries Supabase with the anon key for published artists and writes `public/sitemap.xml`; `npm run build` runs it before `vite build`; a `robots.txt` points at the sitemap.',
          '**Accessibility fixes.** A visible `:focus-visible` ring, a skip link, Escape-to-close and focus-trap-plus-restore on every overlay, and a `useRouteAnnouncer` that moves focus to the `<h1>` and announces via an `aria-live="polite"` region.',
          '**Verified threat model.** A Markdown table of assets, threats, controls, and verifications, including the two RLS audit queries returning zero rows and a `service_role` grep returning no matches.',
          '**Test suite.** Three pure-function unit tests, two component tests queried by accessible role, and an RLS policy matrix (four assertions) that asserts on row counts because RLS denies silently.',
          '**Roadmap in the README.** Each unbuilt feature with its real requirement and cost, and the three interview-defence points.',
        ],
        technicalImplementation: [
          '**`useDocumentTitle` / `useCanonical` hooks.** Effect-based, restore on unmount, zero dependencies. Prefer them over `react-helmet-async` and document why.',
          '**`JsonLd` component + `buildArtistJsonLd` util.** Pure builder returns a plain object; the component `JSON.stringify`s it into a `<script type="application/ld+json">`.',
          '**`generate-sitemap.mjs`.** Node ESM script using `@supabase/supabase-js` with the anon key and `node:fs`; wired as `"build": "node scripts/generate-sitemap.mjs && vite build"`.',
          '**`useFocusTrap` + `useRouteAnnouncer` hooks.** Save/restore `document.activeElement`, Tab-wrap, Escape-close; focus the `<h1 tabIndex={-1}>` and write to a `.srOnly` live region on route change.',
          '**RLS audit queries + `safeNext` validator.** Two `pg_tables`/`pg_policies` queries; an allowlist validator for `?next=` rejecting absolute and protocol-relative URLs.',
          '**Vitest + RTL.** `jsdom` environment; queries by role and name only; the RLS matrix uses two authenticated `supabase-js` clients and asserts on row counts.',
        ],
        prompts: [
          {
            step: 1,
            label: 'SEO pass: titles, canonicals, and semantic headings',
            outcome:
              'Every route has a unique title, description, canonical URL, and a single correct h1.',
            prompt:
              'In my Vite + React + react-router-dom v6 KalaKaara app, add SEO basics without any new dependency. Create `src/hooks/useDocumentTitle.js` (sets `document.title` in an effect, restores the previous title on unmount) and `src/hooks/useCanonical.js` (manages a single `<link rel="canonical">` pointing at the clean, query-string-free URL for the current route). Call both in every page component with a route-specific title such as "Rukmini Shetty — portrait artist in Udupi — KalaKaara". Then audit headings: ensure exactly one `<h1>` per page and no skipped levels, fixing the size in CSS rather than by changing the heading level. Also add static Open Graph defaults (`og:title`, `og:description`, absolute `og:image`, `twitter:card`) directly in `index.html` so social link previews work even though React injects nothing a crawler sees. Explain in a comment why the hook is preferred over react-helmet-async for a client-only SPA.',
          },
          {
            step: 2,
            label: 'JSON-LD structured data on artist pages',
            outcome:
              'Artist pages emit valid Person JSON-LD with a rating, eligible for a rich result.',
            prompt:
              'Add structured data to the KalaKaara artist detail page. Create `src/utils/buildArtistJsonLd.js` exporting `buildArtistJsonLd(artist)` that returns a schema.org `Person` object with `name`, an absolute `image` URL, `url`, `jobTitle` (the primary category), a `PostalAddress`, and `areaServed` built from the artist\'s service areas. Include an `aggregateRating` with `ratingValue` and `reviewCount` ONLY when `reviewCount > 0` — never emit an empty rating, as it is invalid and can suppress the rich result. Create `src/components/JsonLd/JsonLd.jsx` that renders the object via `JSON.stringify` into a `<script type="application/ld+json">`. Render it on the artist page once the artist has loaded. Tell me exactly how to validate the output in Google\'s Rich Results Test.',
          },
          {
            step: 3,
            label: 'Build-time sitemap and robots.txt',
            outcome:
              'A fresh sitemap.xml generated from the live database on every deploy.',
            prompt:
              'Create `scripts/generate-sitemap.mjs` for KalaKaara: a Node ESM script that creates a `@supabase/supabase-js` client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (anon key only — read-only and correct for a public sitemap), selects `slug` and `updated_at` for all `is_published = true` artists, and writes a valid `public/sitemap.xml` with absolute `<loc>` URLs and `<lastmod>` dates, including the static `/` and `/artists` routes. Add a static `public/robots.txt` that allows crawling, disallows `/dashboard` and `/favourites`, and points to the sitemap. Change the `build` script in package.json to `node scripts/generate-sitemap.mjs && vite build`. In a comment, explain why a static sitemap of a database-driven site must be regenerated on every deploy and what a stale sitemap costs in crawl budget and missed pages.',
          },
          {
            step: 4,
            label: 'Accessibility: keyboard audit fixes + route announcer',
            outcome:
              'The app is keyboard-usable, overlays trap and restore focus, and route changes are announced.',
            prompt:
              'Do an accessibility pass on KalaKaara. Add a global `:focus-visible` ring (never `outline: none` without a replacement) and a visually-hidden-until-focused skip-to-content link as the first focusable element, with `<main id="main" tabIndex={-1}>`. Create `src/hooks/useFocusTrap.js` that, for an open overlay (drawer, modal, lightbox), moves focus inside, traps Tab within it, closes on Escape, and restores focus to the triggering element on close. Create `src/hooks/useRouteAnnouncer.js` that on every route change (skipping the first load) moves focus to `main h1` (setting `tabIndex="-1"`) and writes the page name into an `aria-live="polite"` `.srOnly` region rendered at the app root. Then fix the remaining checklist: bind every form `<label htmlFor>` to its input, tie validation errors via `aria-invalid` and `aria-describedby`, give decorative images `alt=""` and meaningful images a real description, gate animations behind `@media (prefers-reduced-motion: no-preference)`, and ensure all hit targets are at least 44px. Produce a short report listing each issue found in a keyboard-only run and how it was fixed.',
          },
          {
            step: 5,
            label: 'Security threat model with verified controls',
            outcome:
              'A threat-model table plus the two RLS audit queries and a service_role grep.',
            prompt:
              'Produce a security threat model for KalaKaara as a Markdown table with columns Asset, Threat, Control, and Verified how. Cover: the anon key in the bundle (safe by design — RLS is the control), the `service_role` key (must appear nowhere; verify with `grep -ri "service_role" src/ .env*` AND by checking the Vercel dashboard env vars), RLS on every table (verify with two SQL audit queries — one listing any `public` table with `rowsecurity = false`, one listing any RLS-enabled table with zero rows in `pg_policies`), `security definer` functions with a pinned `set search_path = public, pg_temp`, the open-redirect risk in `?next=` (add a `utils/safeNext.js` allowlist validator that accepts only relative same-origin paths and rejects absolute and `//` protocol-relative URLs), XSS via `dangerouslySetInnerHTML` (grep to prove we never use it for user content, and note what React\'s default escaping does NOT cover — `javascript:` URLs and raw-HTML sinks), public Storage buckets being permanently public, and rate-limiting contact reveals. Give me the exact SQL for both audit queries and the grep command, and confirm each returns the expected empty result.',
          },
          {
            step: 6,
            label: 'Test suite: units, components, and the RLS matrix',
            outcome:
              'Vitest + RTL tests plus the highest-value RLS policy matrix, asserting on row counts.',
            prompt:
              'Set up Vitest and React Testing Library (jsdom environment) for KalaKaara and write three groups of tests, querying only by accessible role and name — never by CSS class. (1) Unit tests for `formatPrice`, `slugify`, and `haversineKm` (use a tolerance for the float). (2) A component test rendering `ArtistCard` with a fake artist and asserting the accessible name and rating via `getByRole`, and a test for `useAuthGate` that mocks the `services/authService` module with `vi.mock` and asserts the intent is saved and replayed. (3) The most important suite: `tests/rls.test.js`, running OUTSIDE the app with raw `supabase-js` clients authenticated as two different users plus an anonymous client, asserting that (a) anonymous cannot read `phone`, (b) user A cannot update user B\'s artist row, (c) user A cannot insert an artwork under B\'s `artist_id`, and (d) an artist cannot review their own row. Because RLS denies silently, assert on ROW COUNTS (zero rows returned or affected), not on thrown errors — add a comment explaining why an error-only assertion would miss a real leak. Finally, add the roadmap section to the README: each unbuilt feature with its real requirement and cost, and the three things this project lets me defend in an interview.',
          },
        ],
        deliverable:
          'A production-ready KalaKaara with four committed artifacts: an SEO pass (per-route titles, JSON-LD, build-time sitemap), an accessibility report with every issue fixed plus a route announcer, a verified security threat-model table with the two RLS audit queries and a clean service_role grep, and a test suite whose RLS policy matrix asserts on row counts. The README ends with an honest roadmap and the three interview-defence points. A reviewer could audit the launch in twenty minutes and find the evidence for every claim.',
      },
    },
  ],
  quiz: [
    {
      id: 'm15-q1',
      q: 'Why do WhatsApp and Twitter/X link previews often miss an og:image that a React component injects with react-helmet?',
      options: [
        'Because react-helmet has a bug that fails to update Open Graph tags specifically',
        'Because social crawlers cache the first preview forever and never re-fetch',
        'Because social crawlers fetch the raw HTML once and never run JavaScript, so any tag injected by React after render is invisible to them',
        'Because Open Graph tags must be inside the <body>, and React only injects them into the <head>',
      ],
      answer: 2,
    },
    {
      id: 'm15-q2',
      q: 'Why is JSON-LD structured data often more reliable than <meta> tags for getting rich information about a client-rendered page into Google?',
      options: [
        'Because <meta> tags are ignored by all modern search engines',
        'Because it is a single self-contained data blob that Google extracts robustly during rendering, and it can earn rich results like rating stars',
        'Because JSON-LD is served before JavaScript runs while meta tags are not',
        'Because JSON-LD does not need to be inside the HTML document at all',
      ],
      answer: 1,
    },
    {
      id: 'm15-q3',
      q: 'When a modal or lightbox closes, what must happen to keyboard focus for the experience to be accessible?',
      options: [
        'Focus should move to the top of the page so the user can start over',
        'Focus should be removed entirely so nothing is highlighted',
        'Focus should move to the first link in the navigation bar',
        'Focus should be restored to the element that triggered the modal, so the keyboard user returns to where they were',
      ],
      answer: 3,
    },
    {
      id: 'm15-q4',
      q: 'What is the accessibility bug that nearly every client-side-routed React app ships, and how is it fixed?',
      options: [
        'On route change focus stays on <body> and screen readers announce nothing; fix by moving focus to the new <h1> (tabIndex -1) and announcing via an aria-live="polite" region',
        'On route change the URL does not update; fix by calling navigate() twice',
        'On route change all event listeners leak; fix by removing them in a cleanup function',
        'On route change the page scrolls to the bottom; fix with scrollTo(0,0)',
      ],
      answer: 0,
    },
    {
      id: 'm15-q5',
      q: 'What is the difference between alt="" and omitting the alt attribute entirely on an image?',
      options: [
        'There is no difference; both are treated identically by screen readers',
        'alt="" makes the image required to load, while omitting alt makes it lazy',
        'alt="" marks the image as decorative so screen readers skip it, whereas omitting alt often makes screen readers read the filename aloud',
        'Omitting alt is valid HTML while alt="" is a validation error',
      ],
      answer: 2,
    },
    {
      id: 'm15-q6',
      q: 'Why can your application tests (through the UI) not prove that your RLS policies actually protect users?',
      options: [
        'Because Vitest cannot connect to a real Supabase database',
        'Because they run through your own UI, which only makes the queries you intended, never the hostile queries an attacker would make against the trust boundary',
        'Because RLS only applies to the service_role key, which tests do not use',
        'Because React Testing Library disables network requests during tests',
      ],
      answer: 1,
    },
    {
      id: 'm15-q7',
      q: 'When testing that a forbidden RLS operation is blocked, why must you assert on row counts rather than on a thrown error?',
      options: [
        'Because Supabase wraps all errors in a promise that never rejects',
        'Because row counts are faster to compute than catching an exception',
        'Because errors are only thrown in production, not in the test environment',
        'Because RLS denies silently — a forbidden SELECT returns zero rows and a forbidden UPDATE affects zero rows without raising, so an error-only assertion would miss a real leak',
      ],
      answer: 3,
    },
    {
      id: 'm15-q8',
      q: 'Why should a component test query getByRole("button", { name: /show phone number/i }) instead of container.querySelector(".btn-primary")?',
      options: [
        'Because it tests what the user (and a screen reader) actually perceives, survives a CSS class rename, and fails if the element is not a real accessible button',
        'Because querySelector is not available in the jsdom test environment',
        'Because class-name selectors are slower than role queries at runtime',
        'Because React Testing Library forbids importing the container object',
      ],
      answer: 0,
    },
  ],
}
