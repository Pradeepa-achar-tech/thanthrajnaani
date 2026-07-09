// Module 14 — Deployment
// KalaKaara (React + Supabase) course content for the React course player.

export const m14 = {
  id: 'm14',
  title: 'Deployment',
  hours: 5,
  color: 'from-pink-500/20 to-pink-700/10',
  accent: 'pink',
  description:
    'Take KalaKaara from "works on my machine" to a public URL anyone can open — without ever entering a credit card. You will read what `npm run build` actually produces, deploy from GitHub to Vercel Hobby, wire environment variables across all three environments, fix the two failures that only ever appear in production, harden the Supabase project for real traffic, and run a ten-point smoke test that you repeat on every deploy.',
  sections: [
    {
      id: 'm14-s1',
      title: 'The production build',
      topics: [
        {
          id: 'm14-t1',
          title: 'What `npm run build` actually does',
          explain:
            'Vite runs Rollup to bundle, tree-shake, minify, and fingerprint your code into a `dist/` folder of static files — and it inlines every `VITE_` environment variable as a plain string literal in the output.',
          analogy:
            'Think of a fish vendor at the Kundapura market packing the morning catch for transport. Development is the whole boat: nets, ice, spare parts, everything loose and reachable. The build is the packed crate that actually goes to the bus — sorted, trimmed of anything nobody will buy, labelled, sealed. What went in loose comes out compact and immutable. And whatever you wrote on the outside of the crate in marker is readable by everyone who handles it — including your anon key.',
          theory:
            'In development, `npm run dev` serves your source files almost as you wrote them, transforming each module on demand so hot-reload is instant. That is the boat. `npm run build` is the crate. It runs **Rollup** under the hood and does four distinct things.\n\n**Bundling and tree-shaking.** Rollup follows every `import` from `src/main.jsx` outward, builds a graph of what is actually reached, and discards the rest. If you imported a helper but never called it, it does not ship. This is why an unused import is not merely untidy — dead code is removed, but a *used-once* heavyweight dependency is not, and that is where bundle bloat hides.\n\n**Minification.** Variable names shrink, whitespace vanishes, comments disappear. `getArtistBySlug` might become `a`. The code still runs identically; it is just unreadable and small.\n\n**Content-hash filenames.** The output is not `index.js` but `index-D4f9x2Qa.js`. The hash is derived from the file\'s contents, so a byte change produces a new name. This is **cache-busting**: browsers and CDNs can cache `index-D4f9x2Qa.js` forever, because the day you change the code the filename changes too, and the old cache is simply never requested again.\n\n**Env inlining — the part that surprises everyone.** Vite does **not** read environment variables at runtime. There is no `process.env` in the browser. Instead, at build time, Vite finds every literal occurrence of `import.meta.env.VITE_SUPABASE_URL` in your source and **replaces the text** with the string value, right there in the output. Open `dist/assets/index-*.js` after a build and search for your Supabase URL. It is there, as a plain string. Search for your anon key. It is there too, in full.\n\nThis is expected and it is safe, for one specific reason you have met before and must be able to restate cold: **the anon key identifies a caller as anonymous — it is not a password, and it grants nothing on its own. Row Level Security in Postgres is what decides which rows that anonymous caller may read or write.** Leaking the anon key is not a breach because it never authorised anything; disabling RLS would be.\n\nAnd this same fact is the proof of the rule you must never break: because *every* `VITE_` value is inlined as readable text in a file the whole internet downloads, you must **never** prefix a real secret with `VITE_`. The `service_role` key, which bypasses RLS entirely, must never appear in this codebase, because if it were `VITE_SERVICE_ROLE_KEY` it would sit in `dist/assets/index-*.js` in plain text, and your entire database would be readable by anyone who opened DevTools.',
          diagram: `graph LR
    SRC[src/ source<br/>+ .env.local] --> V[vite build<br/>runs Rollup]
    V --> B[Bundle + tree-shake]
    V --> M[Minify]
    V --> H[Hash filenames<br/>index-D4f9x2Qa.js]
    V --> E[Inline VITE_ vars<br/>as string literals]
    B --> D[(dist/)]
    M --> D
    H --> D
    E --> D
    D --> A[dist/assets/index-*.js<br/>anon key visible in plain text<br/>-- safe: RLS protects data]`,
          flowExplain:
            'Follow the bottom arrow: the anon key lands in the shipped JS as readable text by design. That is fine because RLS guards the data — and it is exactly why a real secret must never carry the VITE_ prefix.',
          whyItMatters:
            'Every learner eventually opens the built bundle, finds their key, and panics — or worse, does not open it and assumes `VITE_` means "hidden". Understanding that build-time inlining makes every `VITE_` value public is what stops someone from shipping a `service_role` key to the entire internet. This is a one-question interview filter for anyone claiming Vite experience.',
          steps: [
            'Run `npm run build` and watch the output: it prints each emitted file with its gzipped size.',
            'Open `dist/assets/` and note the content-hash in every filename.',
            'Open the largest `index-*.js` in an editor and search for your Supabase project ref — you will find the URL and the anon key as plain strings.',
            'Confirm you cannot find anything resembling a `service_role` key. If you can, you prefixed a secret with `VITE_` — stop and remove it.',
            'Say the reason out loud: the anon key is public by design; RLS is the protection; secrets never get a `VITE_` prefix.',
          ],
          code: `# Build the production bundle
npm run build

# Vite prints something like:
#   dist/index.html                   0.46 kB
#   dist/assets/index-D4f9x2Qa.css   18.20 kB │ gzip:  4.10 kB
#   dist/assets/index-B7hK9m2p.js   198.55 kB │ gzip: 63.80 kB

# Prove the anon key is in the bundle (this is EXPECTED and SAFE):
#   the anon key identifies an anonymous caller; RLS is the protection.
grep -o "eyJ[A-Za-z0-9._-]\\{20,\\}" dist/assets/index-*.js | head -1
#   -> your anon JWT, sitting there in plain text.

# Now prove no SECRET leaked. This must return NOTHING:
grep -i "service_role" dist/assets/index-*.js
#   (empty) -> good. If it prints anything, you prefixed a secret with VITE_.

# In code, only public values ever get the VITE_ prefix:
#   src/supabase/client.js
#     import.meta.env.VITE_SUPABASE_URL        // public, fine
#     import.meta.env.VITE_SUPABASE_ANON_KEY   // public by design, fine
#   The service_role key appears in NO file, with or without VITE_.`,
          pitfalls: [
            '**Believing `VITE_` means "secret" or "server-side".** It means the exact opposite: Vite inlines it as readable text into the public bundle. Fix: treat every `VITE_` value as if you printed it on a billboard. Only public values qualify.',
            '**Putting the `service_role` key in an env var "because the query returns nothing".** That key bypasses RLS; in a client bundle it hands your whole database to anyone. Fix: an empty result means a policy is wrong — fix the policy, never reach for `service_role`.',
            '**Committing `.env.local` so "the build has the keys".** Now your keys are in git history forever, and the build did not even need it. Fix: `.env.local` stays gitignored; the host injects the values at build time (topic 5).',
            '**Assuming a comment or a private-looking variable name hides a value.** Minification strips comments and renames variables, but string *values* are preserved exactly. Fix: nothing in a client bundle is hidden — design as if all of it is public.',
            '**Shipping a giant bundle because of one unused-but-imported heavy library.** Tree-shaking removes unreferenced exports, not an imported-and-called dependency you do not really need. Fix: read the size report; audit anything over ~50 kB gzipped.',
          ],
          tryIt:
            'Add a throwaway `VITE_SECRET_TEST=hello-santhe` line to `.env.local`, reference `import.meta.env.VITE_SECRET_TEST` somewhere it is rendered, run `npm run build`, and `grep -r hello-santhe dist/`. You will find it in plain text. Delete the line and rebuild. That five-minute experiment is the whole lesson made physical.',
          takeaway:
            '`npm run build` bundles, minifies, and content-hashes into `dist/`, and inlines every `VITE_` value as public plain text — which is why the anon key is safe there and a real secret must never carry the prefix.',
        },
        {
          id: 'm14-t2',
          title: '`npm run preview` — test the real bundle before anyone else',
          explain:
            '`npm run preview` serves the built `dist/` folder locally over a static server, so you experience the production bundle exactly as a visitor will — before you deploy it.',
          analogy:
            'Before the Yakshagana troupe performs for the village, they do one full dress rehearsal under the real stage lights, in costume, on the actual boards. Not a script read at the table — the real thing, just with no audience. `npm run preview` is that dress rehearsal: the same crate that goes to production, opened and inspected on your own machine first.',
          theory:
            'There are two servers in a Vite project and they are not the same program. `npm run dev` runs Vite\'s dev server: it transforms modules on the fly, injects hot-reload, and reads `.env.local` live. `npm run preview` runs a plain static file server over the already-built `dist/` folder — no transformation, no hot-reload, exactly the bytes you would deploy. The difference matters because a whole class of bugs exists only in the built output, and `dev` will never show them to you.\n\n**Bug one: a missing environment variable.** In dev, if `VITE_SUPABASE_URL` is undefined, you might not notice because you set it weeks ago. In the build, if the variable was absent at build time, the inlined value is literally `undefined`, and the Supabase client is constructed with an undefined URL. `preview` surfaces this immediately: every query fails, and the network tab shows requests going to `undefined/rest/v1/...`.\n\n**Bug two: a route that 404s on hard refresh.** In dev, Vite\'s server is configured to fall back to `index.html` for unknown paths, so refreshing `/artists/rukmini-shetty` just works. The `preview` static server does *not* do that by default for arbitrary deep links in every setup, and neither does a production host without configuration — which is the subject of the next topic. Preview is where you first feel this.\n\n**Bug three: an asset path that worked in dev but not from `dist/`.** If you referenced an image with a hand-written string path like `/src/assets/hero.jpg` instead of importing it, dev serves it from the source tree, but the build never copies it and the path is wrong. Preview shows the broken image. Imports that Vite can see (`import hero from \'../assets/hero.jpg\'`) get hashed and copied; string paths outside `public/` do not.\n\nThe rule is simple and non-negotiable: **you preview the build before you push it.** Ten minutes here saves a broken production deploy and a confused debugging session against a URL other people can already see.',
          diagram: `graph TD
    W[Write code] --> DEV[npm run dev<br/>transforms on the fly<br/>hot reload, reads .env.local live]
    DEV --> OK1{Looks good?}
    OK1 -- yes --> BUILD[npm run build -> dist/]
    BUILD --> PREV[npm run preview<br/>serves dist/ as static files<br/>= production bytes, no transform]
    PREV --> CHK[Check the 3 build-only bugs:<br/>undefined env var,<br/>404 on hard refresh,<br/>broken asset path]
    CHK -- all pass --> PUSH[Safe to push / deploy]
    CHK -- something broke --> BUILD`,
          flowExplain:
            'The loop that matters is preview -> fix -> rebuild -> preview. Bugs caught in that loop never reach a URL anyone else can open.',
          whyItMatters:
            'The phrase "but it works on my machine" almost always means "I only ever ran the dev server". Previewing the actual build is the cheapest possible insurance against a deploy that fails for a reason dev could never reveal, and it is the habit that separates people who debug production calmly from people who debug it in a panic.',
          steps: [
            'Run `npm run build`, then `npm run preview`, and open the printed local URL (usually `http://localhost:4173`).',
            'Deliberately break it: rename `.env.local`, rebuild, preview, and watch every query fail against an `undefined` URL. Restore it.',
            'Navigate to a deep route, then hard-refresh (Ctrl+R) on it, and note whether it 404s — this previews the SPA-rewrite problem of the next topic.',
            'Open the network tab and confirm images load from hashed `/assets/` paths, not from `/src/`.',
            'Only once preview is clean, treat the build as deployable.',
          ],
          code: `# The two servers are different programs.

npm run dev
#   -> Vite dev server. Transforms modules, hot-reload, reads .env.local live.
#      Great for writing code. HIDES build-only bugs.

npm run build && npm run preview
#   -> Static server over dist/. The exact bytes you deploy. No transform.
#      This is where build-only bugs finally show up.

# Bug 1 you can force right now — a missing env var:
mv .env.local .env.local.bak
npm run build && npm run preview
#   Open the app: the Supabase client was built with an undefined URL.
#   Network tab shows: GET undefined/rest/v1/artists  -> fails.
mv .env.local.bak .env.local     # restore, rebuild.

# Bug 3 — an asset that only dev could serve:
#   BAD  <img src="/src/assets/hero.jpg" />   // not copied into dist/
#   GOOD import hero from '../assets/hero.jpg' // hashed + copied by Vite
#        <img src={hero} />
#   OR   put it in public/ and reference /hero.jpg (copied verbatim).`,
          pitfalls: [
            '**Never running `preview` and deploying straight from a green `dev` server.** Dev cannot show you env-inlining bugs or asset-path bugs. Fix: make `build && preview` a required step before every push.',
            '**Confusing `preview`\'s port with `dev`\'s port.** Preview defaults to `4173`, dev to `5173`. Testing against the wrong one means testing the wrong bundle. Fix: read the URL the command actually prints.',
            '**Referencing images by `/src/...` string paths.** Dev serves them; the build does not copy them. Fix: `import` the asset so Vite hashes it, or place it in `public/` and reference it from the root.',
            '**Assuming a passing preview guarantees production.** Preview does not test the host\'s SPA rewrite or the host\'s env vars. Fix: preview catches build bugs; the smoke test (topic 10) catches host bugs. You need both.',
            '**Leaving `.env.local` renamed after a test and forgetting.** Then the real build has no keys. Fix: restore it immediately and rebuild to confirm.',
          ],
          tryIt:
            'Build and preview KalaKaara, then hard-refresh on `/artists` and on `/artists/rukmini-shetty`. Note which one, if any, 404s. Whatever you find here is a preview of exactly the problem the next topic fixes — write down what you saw so you can confirm the fix worked.',
          takeaway:
            '`npm run preview` serves the real built bundle locally, exposing the missing-env-var, hard-refresh-404, and broken-asset bugs that the dev server can never show you.',
        },
        {
          id: 'm14-t3',
          title: 'The SPA rewrite rule — the #1 "it worked locally" failure',
          explain:
            'A single-page app has one real HTML file; every route is faked by JavaScript, so a hard refresh on a deep URL asks the host for a file that does not exist unless you tell the host to serve `index.html` for everything.',
          analogy:
            'KalaKaara is like the Kundapura temple\'s single seva counter. There is exactly one physical window — `index.html` — and one clerk who, once you are there, can direct you to any deity inside. When you walk in the front door (`/`) and *then* ask for Ganapati, it works. But if a friend gives you a slip that says "go straight to the Ganapati shrine" (`/artists/rukmini-shetty`) and you show it at a *side gate* that has never heard of shrines, the gate says "no such door". The fix is to tell every side gate: whatever slip they hand you, send them to the one counter, and the clerk will sort it out.',
          theory:
            'React Router does its routing **in the browser**. When you click a link to `/artists/rukmini-shetty`, no network request for that path is made — JavaScript intercepts the click, updates the URL bar with the History API, and re-renders the right component. The server is never involved. This is why in-app navigation always works.\n\nThe trouble is the **hard navigation**: a refresh, a pasted link, a bookmark, a link shared on WhatsApp. Now the browser genuinely asks the host: "give me the file at `/artists/rukmini-shetty`." On a static host, there is no such file — there is only `index.html` and a folder of hashed assets. The host looks for `artists/rukmini-shetty/index.html`, does not find it, and returns **404 Not Found**. The app never even loads, so React Router never gets a chance to do its job.\n\nThe fix is a **catch-all rewrite**: instruct the host to respond to *any* path it cannot find as a real file by serving `index.html` instead. Once `index.html` loads, its JavaScript boots, React Router reads `window.location.pathname`, sees `/artists/rukmini-shetty`, and renders the correct page. The URL in the bar is preserved throughout, so the user never notices the redirect.\n\nOn **Vercel**, this is one small file at the repository root:\n\n`vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`\n\nThe `source` is a pattern matching every path; the `destination` is the one file that always exists. Note the crucial distinction: this is a **rewrite**, not a **redirect**. A redirect would change the URL in the browser to `/index.html`; a rewrite serves `index.html`\'s *contents* while leaving the URL untouched — which is exactly what a deep link needs.\n\nThis is the single most common "it worked locally" deployment failure for beginners, and the reason is structural: the dev server (and often preview) already falls back to `index.html` for unknown paths, so you never see the problem until real users start pasting deep links at a real host that has no such fallback configured. Every static host has its own name for this rule — Netlify uses `_redirects`, Apache uses `.htaccess`, nginx uses `try_files` — but the idea is identical everywhere: unknown path, serve the shell.',
          diagram: `graph TD
    U[User hard-refreshes<br/>/artists/rukmini-shetty] --> HOST{Host looks for a real file<br/>at that path}
    HOST -- file exists? no --> R{vercel.json rewrite<br/>configured?}
    R -- NO --> E[404 Not Found<br/>app never loads<br/>-- the classic failure]
    R -- YES --> IDX[Serve index.html contents<br/>URL stays /artists/rukmini-shetty]
    IDX --> BOOT[JS boots, React Router reads<br/>window.location.pathname]
    BOOT --> PAGE[Renders the artist page correctly]`,
          flowExplain:
            'The whole fix lives at the R diamond: with the rewrite, an unknown path serves index.html without changing the URL, and React Router takes over from there.',
          whyItMatters:
            'This bug is invisible during development and catastrophic in production — the home page works, in-app clicks work, so you declare victory, and then a user shares a deep link that 404s for everyone. Knowing the SPA rewrite rule cold, and being able to explain rewrite-versus-redirect, is table stakes for deploying any client-side-routed app.',
          steps: [
            'Create `vercel.json` at the repository root (next to `package.json`, not inside `src/`).',
            'Add the catch-all rewrite mapping `/(.*)` to `/index.html`.',
            'Commit it before you deploy — this file is code, and it belongs in git.',
            'After deploying, hard-refresh a deep route on the live domain and confirm it renders instead of 404ing.',
            'Understand why it is a rewrite, not a redirect: the URL must stay put so React Router can read the intended path.',
          ],
          code: `// vercel.json  — at the REPOSITORY ROOT, committed to git.
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

// What each part means:
//   "source": "/(.*)"        -> match ANY path the host has no real file for
//   "destination": "/index.html" -> serve the SPA shell instead
// It is a REWRITE, not a redirect:
//   the browser URL stays /artists/rukmini-shetty,
//   so React Router reads it and renders the right page.

// Vercel serves a real file (e.g. /assets/index-abc.js) directly and only
// applies the rewrite when no file matches — your assets are unaffected.

// The same idea, other hosts:
//   Netlify   public/_redirects:   /*  /index.html  200
//   Apache    .htaccess:           FallbackResource /index.html
//   nginx     location / { try_files $uri /index.html; }`,
          pitfalls: [
            '**Deploying without any rewrite and testing only the home page.** `/` and in-app clicks work, so it looks fine — until someone hard-refreshes or shares a deep link and gets a 404. Fix: add `vercel.json` before the first deploy and test a deep refresh on the live URL.',
            '**Using a redirect (301/302) instead of a rewrite.** A redirect rewrites the URL bar to `/index.html`, so React Router loses the intended path and always lands on the home page. Fix: use `rewrites`, which keeps the original URL.',
            '**Putting `vercel.json` inside `src/`.** Vercel reads it from the repository root only; inside `src/` it is invisible and does nothing. Fix: place it next to `package.json`.',
            '**Assuming preview passing means the rewrite is unnecessary.** Preview and dev often fall back to `index.html` themselves, masking the problem. Fix: the rewrite is for the *host*; verify it on the deployed domain, not locally.',
            '**Writing `"source": "/*"` and expecting Vercel regex semantics.** Vercel\'s `rewrites` source is a path-to-regexp pattern, not a glob; the correct catch-all is `"/(.*)"`. Fix: use `/(.*)` for "everything".',
          ],
          tryIt:
            'Deploy without `vercel.json` first (topic 4 shows how), hard-refresh `/artists` on the live domain, and watch it 404. Then add the file, redeploy, and refresh again. Seeing the 404 appear and then vanish is worth more than memorising the JSON.',
          takeaway:
            'A client-routed SPA needs a catch-all rewrite to `index.html` on the host; on Vercel that is a three-line `vercel.json`, and forgetting it is the most common deploy failure there is.',
        },
      ],
    },
    {
      id: 'm14-s2',
      title: 'Vercel, free and card-free',
      topics: [
        {
          id: 'm14-t4',
          title: 'Deploy to Vercel Hobby with GitHub — no card',
          explain:
            'Vercel\'s Hobby plan connects to your GitHub repository, auto-detects that it is a Vite app, and deploys it on every push — all without a credit card.',
          analogy:
            'Once the fish crate is packed, you do not personally drive it to every town. You hand it to the KSRTC bus, which already knows the route, runs on a fixed schedule, and drops copies at stops across the coast. Vercel is that bus network for your `dist/` crate: you hand it your GitHub repo, and it distributes the built site to edge locations everywhere, automatically, every time you push a new crate.',
          theory:
            'You already applied the card test to Vercel in Module 0; now you use the result. Sign up for **Vercel Hobby** with your GitHub account. No card is requested anywhere in the flow — the same GitHub-based, card-free signup you verified earlier.\n\n**Import the repository.** In the Vercel dashboard, "Add New Project" lists your GitHub repos. Pick KalaKaara. Vercel inspects the repo and **auto-detects Vite**: it sets the Framework Preset to Vite, the Build Command to `npm run build`, and the Output Directory to `dist`. For a standard Vite app you change none of these. The Install Command (`npm install`) is inferred from your lockfile.\n\n**What the Hobby plan actually gives you**, and it is a lot for zero rupees:\n\n- **Automatic HTTPS.** Every deployment gets a TLS certificate, provisioned and renewed for you. You never touch a certificate.\n- **A global CDN.** Your static files are pushed to edge locations worldwide, so a visitor in Bengaluru and a visitor in Berlin both get bytes from nearby.\n- **A preview deployment for every branch and every pull request.** Push a branch and Vercel builds a unique, shareable URL for exactly that branch\'s code (topic 6).\n- **Generous bandwidth** on the free tier — far more than a portfolio project or a coastal-Karnataka artist marketplace will use.\n- **Automatic deploys on push** to your production branch (usually `main`), so shipping is `git push`.\n\n**What it forbids**, and you should note this honestly rather than pretend otherwise: the Hobby plan is for **non-commercial use**. Vercel\'s terms reserve Hobby for personal, non-commercial projects; if KalaKaara ever became a real business earning money, you would need a paid plan. For a learning project and a portfolio piece, Hobby is exactly right — but read the terms and know the boundary rather than discovering it later. This is the same intellectual honesty you applied to Google Places in Module 0: name the constraint out loud.',
          diagram: `graph LR
    GH[GitHub repo: kalakaara] -->|import, no card| VC[Vercel Hobby]
    VC --> DET[Auto-detect Vite:<br/>build = npm run build<br/>output = dist]
    DET --> BUILD[Vercel runs the build<br/>on its Linux servers]
    BUILD --> CDN[Global edge CDN]
    CDN --> HTTPS[Automatic HTTPS]
    CDN --> URL[kalakaara.vercel.app]
    GH -->|every branch / PR| PREV[Unique preview URL]`,
          flowExplain:
            'Vercel detects Vite and never needs manual build settings for a standard app; the same push that updates GitHub triggers the build and the edge distribution.',
          whyItMatters:
            'Being able to deploy a real app from GitHub to a public HTTPS URL, for free and card-free, is the deliverable that turns a course project into something you can put on a CV with a live link. Knowing the Hobby non-commercial boundary is what keeps that honest.',
          steps: [
            'Push KalaKaara to a GitHub repository if it is not already there.',
            'Sign up for Vercel with "Continue with GitHub" — confirm no card field appears.',
            'Click "Add New Project", select the KalaKaara repo, and confirm Vercel shows Framework Preset: Vite, Build Command: `npm run build`, Output: `dist`.',
            'Do not deploy yet if your env vars are not set — add them first (topic 5), because the build inlines them.',
            'Deploy, wait for the build to finish, and open the `*.vercel.app` URL.',
            'Read the Hobby plan terms and note the non-commercial-use restriction in your README.',
          ],
          code: `# You do not run these locally — Vercel runs them on its Linux builders.
# But know exactly what it will do, because you must reproduce it (topic 6):

Install Command:  npm install        # from your package-lock.json
Build Command:    npm run build       # -> dist/
Output Directory: dist

# Vercel Hobby, at a glance:
#   ✓ Automatic HTTPS (cert provisioned + renewed for you)
#   ✓ Global edge CDN
#   ✓ Preview deployment per branch AND per pull request
#   ✓ Generous free bandwidth
#   ✓ Auto-deploy on push to your production branch
#   ✗ Commercial use — Hobby is personal/non-commercial only.
#     If KalaKaara ever earns money, move to a paid plan. (Read the terms.)

# Deploying is, from then on, simply:
git push origin main     # -> Vercel builds and ships automatically.`,
          pitfalls: [
            '**Deploying before setting environment variables.** The build inlines `VITE_` values; with none set, your live site talks to `undefined`. Fix: add the env vars (topic 5) *before* the first production deploy, or redeploy after adding them.',
            '**Overriding the auto-detected build settings unnecessarily.** Hand-editing the build command or output directory for a standard Vite app usually just breaks it. Fix: trust the Vite preset unless you have a specific, understood reason.',
            '**Assuming Hobby permits a commercial launch.** It does not, and Vercel can enforce it. Fix: for anything earning revenue, budget for a paid plan; keep the course project non-commercial.',
            '**Deploying a repo whose build fails locally.** Vercel\'s build will fail identically, just slower and in a log. Fix: `npm run build` must pass on your machine before you push.',
            '**Forgetting `vercel.json` in the repo.** Auto-detection handles build settings but not your SPA rewrite. Fix: commit `vercel.json` from topic 3 alongside the code.',
          ],
          tryIt:
            'Sign up for Vercel with GitHub and go all the way to the "Deploy" button *without* clicking it, watching for any card field along the way. There is none. Compare that experience, from memory, with the Google Maps Platform flow you tried in Module 0. The contrast is the entire zero-cost thesis of this course in two signups.',
          takeaway:
            'Vercel Hobby deploys a Vite app straight from GitHub with no card, giving you HTTPS, a global CDN, and per-branch previews — bounded only by a non-commercial-use rule you should acknowledge honestly.',
        },
        {
          id: 'm14-t5',
          title: 'Environment variables in Vercel — and why a change needs a redeploy',
          explain:
            'Vercel stores your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` and injects them at build time, which is why editing an env var does nothing until you redeploy.',
          analogy:
            'The bus\'s destination board is painted on before it leaves the depot, not adjusted at each stop. If you repaint "Udupi" to "Kollur" while the bus is already on the road, the bus still goes to Udupi — the board was set at the depot. Vercel bakes your env vars onto the board at build time in the depot; changing the value later means sending the bus back to be repainted, which is a redeploy.',
          theory:
            'Your local `.env.local` is gitignored and never leaves your machine, so Vercel has no idea what your Supabase URL is until you tell it. In the project\'s **Settings → Environment Variables**, add the two the app needs:\n\n- `VITE_SUPABASE_URL` — your project\'s API URL.\n- `VITE_SUPABASE_ANON_KEY` — the public anon key.\n\nVercel lets you scope each variable to three **environments**: **Production** (your `main` branch → the live domain), **Preview** (every other branch and PR → preview URLs), and **Development** (used by `vercel dev` locally). For KalaKaara, set both variables in **all three**, using the same Supabase project, so previews and production behave identically. (In a larger setup you might point Preview at a separate staging Supabase project; for this course, one project is correct and simpler.)\n\nNow the part that genuinely confuses everyone the first time. You change an env var in the Vercel dashboard, reload the live site, and **nothing changes**. This is not a bug. Recall topic 1: Vite inlines `VITE_` values into the bundle **at build time**, as string literals. The env var is *not read at runtime* — there is no server reading `process.env` when a visitor loads the page; the value was frozen into the JavaScript when the build ran. So editing the variable only affects the **next** build. You must trigger a **redeploy** for the new value to take effect. In Vercel: Deployments → the latest one → Redeploy. This "baked in at build time, not read at runtime" model is the single most common first-deploy stumble, and understanding topic 1 is what makes it obvious instead of maddening.\n\nOne hard rule, restated because it is that important: **never paste the `service_role` key here.** Vercel offers to encrypt environment variables at rest, and that encryption is real — but it is irrelevant to your safety, because at build time the value gets inlined into the public bundle in plain text regardless of how it was stored. KalaKaara has **no server-side runtime** on Vercel (no serverless functions), so there is nowhere the `service_role` key could ever be used safely. It belongs in exactly one place: nowhere in this project.',
          diagram: `graph TD
    ENV[Vercel env vars<br/>VITE_SUPABASE_URL<br/>VITE_SUPABASE_ANON_KEY] --> SCOPE{Scoped to which<br/>environments?}
    SCOPE --> P[Production<br/>main -> live domain]
    SCOPE --> V[Preview<br/>branches / PRs]
    SCOPE --> D[Development<br/>vercel dev]
    P --> BAKE[Read ONLY at build time]
    V --> BAKE
    BAKE --> INLINE[Inlined into bundle<br/>as string literals]
    INLINE --> LIVE[Served to visitors]
    CHANGE[You edit an env var] -.-> ENV
    CHANGE -.->|no effect until| REDEPLOY[Redeploy required<br/>to rebuild with new value]
    REDEPLOY --> BAKE`,
          flowExplain:
            'The dotted path is the trap: editing a variable updates storage but not the already-built bundle. Only a redeploy re-runs the build and re-bakes the value.',
          whyItMatters:
            'The "I changed the env var and nothing happened" moment costs beginners hours because it contradicts how server-rendered apps behave. Being able to say "Vite inlines VITE_ vars at build time, so env changes need a redeploy" is both the fix and a signal that you actually understand your build pipeline.',
          steps: [
            'In Vercel → Settings → Environment Variables, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.',
            'Tick all three environments — Production, Preview, and Development — for each variable.',
            'Copy the values from the Supabase dashboard (Project Settings → API): the URL and the `anon` `public` key.',
            'Never add the `service_role` key — this app has no server runtime to use it from.',
            'After any env-var change, go to Deployments and Redeploy, because values are baked in at build time, not read at runtime.',
            'Reload the live site and confirm queries now succeed.',
          ],
          code: `# Vercel -> Project -> Settings -> Environment Variables

  KEY                        VALUE                          ENVIRONMENTS
  VITE_SUPABASE_URL          https://xxxx.supabase.co       Prod, Preview, Dev
  VITE_SUPABASE_ANON_KEY     eyJhbGciOi...  (anon public)   Prod, Preview, Dev

  #  DO NOT ADD:
  #  SUPABASE_SERVICE_ROLE_KEY  ->  bypasses RLS; no server runtime here to
  #                                 use it; would be inlined into public JS.

# WHY a change needs a redeploy (the confusing bit):
#   Vite reads VITE_ vars at BUILD time and inlines them as string literals.
#   There is no runtime env lookup in the browser.
#   So: edit variable -> nothing changes -> Deployments -> Redeploy -> rebuilt.

# The value must exist AT BUILD TIME. Locally, that means .env.local:
#   VITE_SUPABASE_URL=https://xxxx.supabase.co
#   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
# .env.local is gitignored; Vercel holds its own copy in the dashboard.`,
          pitfalls: [
            '**Editing an env var and expecting the live site to update.** It will not until the next build. Fix: redeploy after every env-var change — values are baked in at build time, not read at runtime.',
            '**Setting the variable in Production only.** Then every preview deployment talks to `undefined` and looks broken. Fix: set both variables in all three environments.',
            '**Pasting the `service_role` key because Vercel offers encryption.** Encryption at rest does not stop build-time inlining into the public bundle, and there is no server here to use the key anyway. Fix: never add it.',
            '**Typos in the variable name — `VITE_SUPABASE_URI` vs `_URL`.** Vite silently inlines `undefined` for the name your code actually reads. Fix: match the names in `client.js` exactly, character for character.',
            '**Relying on `.env.local` being deployed.** It is gitignored and never reaches Vercel. Fix: the dashboard holds the deployed values; `.env.local` is only for your machine.',
          ],
          tryIt:
            'Change `VITE_SUPABASE_URL` in Vercel to a deliberately wrong value, reload the live site, and observe that it *still works* — because the old value is baked into the current build. Then redeploy and watch it break. Restore the correct value and redeploy once more. That round-trip makes "baked in at build time" unforgettable.',
          takeaway:
            'Add both public `VITE_` variables to all three Vercel environments; because Vite inlines them at build time, any change requires a redeploy — and the `service_role` key belongs nowhere in a project with no server runtime.',
        },
        {
          id: 'm14-t6',
          title: 'Preview deployments as a workflow — and reading a failed build log',
          explain:
            'Every branch and pull request gets its own Vercel preview URL, so you review the real deployed app before merging — and when a build fails, the log tells you exactly why.',
          analogy:
            'Before the Yakshagana troupe changes the main performance, they try the new scene at a smaller village show first. Same stage, same lights, real audience — but if it flops, the flagship performance is untouched. A preview deployment is that trial show: the actual built app on a real URL, safe to break, reviewed before it reaches the production stage at `main`.',
          theory:
            'The Vercel workflow turns "review my code" into "review my running app". Create a branch, push it, open a pull request. Vercel builds that branch and comments on the PR with a **unique preview URL**. You — and anyone you share the link with — can click through the *real thing*: the actual bundle, the actual Supabase queries, the actual routing, on a real HTTPS domain. You catch what a code diff hides: a layout that breaks on mobile, a query that returns nothing, a broken image. When the PR merges to `main`, that same code is promoted to production. Review the deployment, not just the diff.\n\nAnd then, one day, **the build fails**. The PR shows a red X; there is no preview URL. This is where the skill is. Do not guess — **read the build log.** Vercel streams the full output of `npm install` and `npm run build`; the error is in there, usually near the bottom, usually pointing at a specific file and line. Then **reproduce it locally**: run `npm run build` on your own machine. In almost every case it fails identically, because Vercel is just running your build command — and now you can iterate in seconds instead of waiting for cloud builds.\n\n"But it works on my machine" has two overwhelmingly common causes, and both are worth internalising:\n\n**An uncommitted file.** The import resolves locally because the file exists on your disk, but you never `git add`-ed it, so Vercel\'s checkout does not have it and the build cannot find the module. Fix: `git status` before every push; if a file is untracked and imported, commit it.\n\n**A case-sensitive import path.** This is the sharp one, and it bites Windows and macOS users specifically. Your filesystem is *case-insensitive*: `import ArtistCard from \'./artistCard\'` finds `ArtistCard.jsx` on your Windows machine without complaint. Vercel builds on **Linux**, whose filesystem is **case-sensitive**: `artistCard` and `ArtistCard` are two different names, the file is not found, and the build fails. The code that ran perfectly for weeks breaks the instant it hits a Linux builder. Fix: make every import path match the file\'s real casing exactly, and prefer a single consistent convention (e.g. PascalCase component files, imported with PascalCase paths).',
          diagram: `graph TD
    BR[Push a branch / open PR] --> VB[Vercel builds it]
    VB --> RES{Build result}
    RES -- success --> URL[Unique preview URL<br/>on the PR]
    URL --> REV[Review the RUNNING app,<br/>not just the diff]
    REV --> MERGE[Merge to main]
    MERGE --> PROD[Promoted to production]
    RES -- FAIL --> LOG[Read the build log<br/>error is near the bottom]
    LOG --> REPRO[Reproduce with<br/>npm run build locally]
    REPRO --> CAUSE{Usual cause}
    CAUSE --> U[Uncommitted file<br/>-> git add it]
    CAUSE --> C[Case-sensitive import<br/>ArtistCard vs artistCard<br/>-> fix the path for Linux]
    U --> BR
    C --> BR`,
          flowExplain:
            'The failure branch is the teachable one: read the log, reproduce locally with the same build command, and the cause is almost always an uncommitted file or a case-mismatched import that only Linux rejects.',
          whyItMatters:
            'Preview-per-PR is how professional teams ship safely, and the case-sensitivity trap is a rite of passage that has cost every developer at least one confusing afternoon. Being able to read a build log, reproduce locally, and immediately suspect casing or an uncommitted file is exactly the debugging instinct interviewers probe for.',
          steps: [
            'Create a feature branch, push it, and open a pull request against `main`.',
            'Wait for Vercel\'s comment and open the preview URL; click through the real app.',
            'If the build fails, open the build log and scroll to the error near the bottom — do not guess.',
            'Reproduce locally with `npm run build`; it will almost always fail the same way.',
            'Check the two usual suspects: `git status` for an uncommitted imported file, and every import path for exact-case matching.',
            'Fix, push, watch the preview rebuild green, then merge to promote to production.',
          ],
          code: `# The workflow:
git checkout -b feature/artist-badges
# ...make changes...
git add -A && git commit -m "Add featured-artist badges"
git push -u origin feature/artist-badges
# Open a PR -> Vercel comments with a preview URL. Review the running app.

# When the build fails, the log shows the real error, e.g.:
#   [vercel] Running "npm run build"
#   src/pages/Home.jsx:3:8: ERROR: Could not resolve "./artistCard"
#     import ArtistCard from './artistCard';
#            ^ file on disk is ArtistCard.jsx

# Reproduce it locally (Windows/macOS may NOT reproduce casing bugs — see below):
npm run build

# CASE-SENSITIVITY: your machine is case-insensitive, Vercel's Linux is not.
#   File on disk:  src/components/ArtistCard.jsx
#   BAD  import ArtistCard from './artistCard'   // works on Windows, fails on Linux
#   GOOD import ArtistCard from './ArtistCard'   // matches real casing everywhere

# UNCOMMITTED FILE: it exists locally but was never added.
git status                 # anything untracked that you import?
git add src/components/ArtistCard.jsx && git commit -m "Track ArtistCard"`,
          pitfalls: [
            '**Reviewing the diff but never opening the preview URL.** The code can read fine and still render broken. Fix: click the preview and use the actual app before approving.',
            '**Guessing at a failed build instead of reading the log.** The answer is in the log, usually near the bottom with a file and line. Fix: read it first, hypothesise second.',
            '**A case-mismatched import that only fails on Linux.** `./artistCard` finds `ArtistCard.jsx` on Windows/macOS and vanishes on Vercel. Fix: match file casing exactly; pick one convention and enforce it.',
            '**Pushing an imported file you never committed.** Local build passes, Vercel cannot resolve the module. Fix: `git status` before every push; commit tracked-and-imported files.',
            '**Assuming "works on my machine" means the log is wrong.** The Linux builder is the source of truth for production. Fix: reproduce with `npm run build`; if your OS hides the bug, trust the log and fix the casing anyway.',
          ],
          tryIt:
            'On a throwaway branch, deliberately rename an import of `ArtistCard` to `./artistCard` (wrong case), push, and open the PR. If you are on Windows or macOS your local `npm run build` may pass while Vercel\'s fails — proving the point viscerally. Fix the case, push, and watch it go green. Then delete the branch.',
          takeaway:
            'Preview deployments let you review the running app per PR before promoting to production; when a build fails, read the log and reproduce locally — the culprit is almost always an uncommitted file or a case-sensitive import that only Linux rejects.',
        },
      ],
    },
    {
      id: 'm14-s3',
      title: 'Supabase in production, and after',
      topics: [
        {
          id: 'm14-t7',
          title: 'Configure production auth — or Google returns redirect_uri_mismatch',
          explain:
            'Google OAuth and Supabase must both be told your new production domain, or sign-in fails on the live site with `redirect_uri_mismatch` while localhost keeps working.',
          analogy:
            'A temple guest list has to name every entrance a guest might arrive through. If the list only says "the guest may come through the Kundapura gate" and your guest shows up at the new Udupi gate, the guard turns them away — not because they are not a guest, but because that gate was never on the list. Your production domain is a new gate. Until you add it to Supabase\'s and Google\'s guest lists, the guard (OAuth) refuses everyone arriving through it.',
          theory:
            'OAuth is a redirect dance across three parties — your app, Supabase (GoTrue), and Google — and each party keeps its own allow-list of URLs it trusts. Locally, you configured those lists to trust `http://localhost:5173`, so sign-in worked for weeks. Production is a brand-new URL that none of those lists have ever heard of. Three places must be updated.\n\n**Supabase → Authentication → URL Configuration.** Two fields:\n\n- **Site URL**: set this to your Vercel production domain, e.g. `https://kalakaara.vercel.app`. This is the default place Supabase sends users back to after auth.\n- **Additional Redirect URLs**: add every URL a redirect might legitimately return to. That means your production domain, `http://localhost:5173` (so local dev still works), and your **preview URLs**. Vercel preview URLs are dynamic, so use a wildcard pattern Supabase accepts, e.g. `https://kalakaara-*.vercel.app/**`, to cover per-branch previews. If a return URL is not on this list, GoTrue refuses to redirect to it.\n\n**Google Cloud Console → your OAuth client → Authorized JavaScript origins.** Add your production **origin** (`https://kalakaara.vercel.app`). Google checks that the request originates from a domain you have declared. The **Authorized redirect URI** for a Supabase project is your Supabase callback (`https://xxxx.supabase.co/auth/v1/callback`), which you set during Module 4 and does **not** change when you deploy — the redirect goes to Supabase, not to Vercel. What you are adding now is the *origin* your production site loads from.\n\nForget any of this and you get the classic asymmetric failure: **sign-in works perfectly on `localhost` and fails on the live domain with `redirect_uri_mismatch` or a "redirect not allowed" error.** It is asymmetric precisely because localhost was allow-listed months ago and production never was — so the bug is invisible in development and appears only when a real user tries to sign in on the real site. This is one of the most-Googled OAuth errors in existence, and the fix is always "you forgot to add the new domain to an allow-list."',
          diagram: `graph TD
    subgraph App[Your app]
      L[localhost:5173<br/>already allow-listed]
      P[kalakaara.vercel.app<br/>NEW - must be added]
    end
    subgraph SB[Supabase Auth -> URL Configuration]
      SU[Site URL = production domain]
      RU[Additional Redirect URLs:<br/>prod + localhost:5173 + preview *]
    end
    subgraph GC[Google Cloud Console -> OAuth client]
      OR[Authorized JS origins:<br/>+ https://kalakaara.vercel.app]
      CB[Authorized redirect URI:<br/>supabase.co/auth/v1/callback<br/>-- unchanged]
    end
    P --> SU
    P --> RU
    P --> OR
    MISS[Miss any one of these] --> ERR[redirect_uri_mismatch<br/>on production only<br/>localhost still works]`,
          flowExplain:
            'The three trust lists — Supabase Site URL, Supabase Redirect URLs, Google JS origins — must all name the production domain. Missing any one produces the localhost-works-production-fails signature.',
          whyItMatters:
            '`redirect_uri_mismatch` is a rite of passage, and the fact that it strikes only in production makes it feel like the deploy broke something. Knowing it is an allow-list omission across three consoles — and that the Supabase callback URI itself does not change on deploy — turns an hour of panic into a two-minute fix.',
          steps: [
            'In Supabase → Authentication → URL Configuration, set **Site URL** to your Vercel production domain.',
            'In **Additional Redirect URLs**, add the production domain, `http://localhost:5173`, and a preview wildcard like `https://kalakaara-*.vercel.app/**`.',
            'In Google Cloud Console → your OAuth client, add the production origin to **Authorized JavaScript origins**.',
            'Confirm the **Authorized redirect URI** is still the Supabase callback (`https://xxxx.supabase.co/auth/v1/callback`) — it does not change on deploy.',
            'Save all three, wait a minute for propagation, then test Google sign-in on the live domain.',
            'If it fails, read the error: `redirect_uri_mismatch` means a URL is missing from one of the three lists.',
          ],
          code: `# 1) Supabase -> Authentication -> URL Configuration
Site URL:
    https://kalakaara.vercel.app

Additional Redirect URLs:
    https://kalakaara.vercel.app/**
    http://localhost:5173/**
    https://kalakaara-*.vercel.app/**     # per-branch preview deployments

# 2) Google Cloud Console -> APIs & Services -> Credentials -> OAuth client
Authorized JavaScript origins:
    http://localhost:5173
    https://kalakaara.vercel.app          # <-- the new one you must add

Authorized redirect URIs:
    https://xxxxxxxx.supabase.co/auth/v1/callback   # UNCHANGED on deploy
    # OAuth redirects to Supabase, not to Vercel. This URI stays the same.

# The failure you are preventing:
#   Sign-in works on http://localhost:5173
#   Sign-in fails on https://kalakaara.vercel.app with:
#     Error 400: redirect_uri_mismatch
#   Cause: production domain missing from one of the three lists above.`,
          pitfalls: [
            '**Adding the production domain to Google but not to Supabase\'s redirect list (or vice versa).** All three lists must agree. Fix: update Supabase Site URL, Supabase Redirect URLs, and Google JS origins together.',
            '**Changing the Supabase callback URI on deploy.** The OAuth redirect target is your Supabase project, which does not move when you deploy the frontend. Fix: leave the callback URI alone; add the *origin*, not a new callback.',
            '**Forgetting preview URLs, so sign-in works in production but breaks in every PR preview.** Fix: add a `https://kalakaara-*.vercel.app/**` wildcard to Supabase\'s redirect list.',
            '**Removing `localhost:5173` while adding production.** Then local dev sign-in breaks. Fix: keep localhost *and* add production; the list holds many URLs.',
            '**Testing immediately and concluding it is broken.** Google and Supabase take a short while to propagate changes. Fix: wait a minute, hard-refresh, and clear any stale session before retrying.',
          ],
          tryIt:
            'On your live site, open DevTools → Network, click "Show phone number", and watch the redirect to Google. If it returns `redirect_uri_mismatch`, note *which* URL Google says it received, then find that exact URL missing from one of your three allow-lists. Add it, wait a minute, retry. This is the debugging loop for every OAuth deployment you will ever do.',
          takeaway:
            'Production sign-in needs the new domain added to Supabase\'s Site URL, Supabase\'s redirect list (with a preview wildcard), and Google\'s authorized origins; miss one and you get `redirect_uri_mismatch` on the live site while localhost keeps working.',
        },
        {
          id: 'm14-t8',
          title: 'An RLS audit before you go live',
          explain:
            'Before real traffic arrives, run two SQL queries — one listing tables with RLS *off*, one listing tables with RLS *on but no policies* — and confirm the `service_role` key appears nowhere.',
          analogy:
            'Before the festival crowd arrives, the temple committee walks the whole perimeter checking every gate. A gate left wide open is the obvious danger — that is a table with RLS disabled, readable by anyone. But there is a subtler failure: a gate that is *locked with no key issued to anyone*, so even legitimate visitors are turned away. That is a table with RLS enabled but zero policies — safe, but silently broken. You check for both, because "no one warned me" is not a defence when the crowd is already inside.',
          theory:
            'RLS has two failure modes, and a pre-launch audit must catch both.\n\n**Failure one: RLS disabled.** In Postgres, if a table does not have RLS enabled, its policies (if any) are ignored and the table is fully readable and writable by whatever role can reach it — which, via PostgREST and the anon key, is the entire internet. A single `artists` table with RLS off leaks every phone number to every anonymous visitor. The first audit query lists every table in the `public` schema whose `rowsecurity` flag is `false`. **The correct answer is zero rows.** Any table listed is a gate left open; enable RLS on it before launch.\n\n**Failure two: RLS enabled, zero policies.** This is the sneaky one. When you enable RLS on a table, Postgres switches to **default-deny**: with no policies, *every* operation is denied for the anon and authenticated roles. The table is perfectly *safe* — but it is also *broken*, because your app\'s legitimate reads now silently return empty arrays and your inserts fail, with no error that screams "missing policy". You debug the frontend for an hour before realising the database is refusing everyone. The second audit query lists tables where `rowsecurity` is `true` but no matching row exists in `pg_policies`. Every such table needs at least the policies your app relies on (a public-read `select` policy for `artists`, `artworks`, `categories`; an owner-scoped `insert`/`update` for user-owned tables).\n\nRun both queries against your **production** project specifically. A schema migrated by hand, or seeded in a hurry, is exactly where a table slips through with RLS off or with RLS on and no policy.\n\nThen the third check, which is not SQL: **confirm the `service_role` key appears nowhere.** Grep the repository. Check the Vercel environment variables. The key that bypasses all of this must not exist in your codebase or your build config, because a single leaked `service_role` key makes the entire RLS audit meaningless — it walks straight past every policy. This three-part checklist is not optional; it is the last thing you do before the URL is public.',
          diagram: `graph TD
    AUDIT[Pre-launch RLS audit<br/>run on PRODUCTION] --> Q1[Query 1: tables with<br/>rowsecurity = false]
    AUDIT --> Q2[Query 2: RLS on but<br/>ZERO policies in pg_policies]
    AUDIT --> Q3[Grep repo + Vercel<br/>for service_role]
    Q1 --> R1{Any rows?}
    R1 -- yes --> F1[OPEN GATE:<br/>enable RLS now]
    R1 -- no --> P1[OK]
    Q2 --> R2{Any rows?}
    R2 -- yes --> F2[LOCKED, NO KEY:<br/>add the policies your app needs]
    R2 -- no --> P2[OK]
    Q3 --> R3{Found it?}
    R3 -- yes --> F3[CRITICAL:<br/>remove it everywhere]
    R3 -- no --> P3[OK]
    P1 --> GO[Cleared to launch]
    P2 --> GO
    P3 --> GO`,
          flowExplain:
            'Three independent checks, three clean results required. RLS-off is the open gate; RLS-on-no-policy is the locked gate with no key; a stray service_role key voids all of it.',
          whyItMatters:
            'Shipping a table with RLS disabled is the single most common way a Supabase project leaks private data, and the RLS-on-no-policy trap is the most common way a deploy "mysteriously" returns nothing. Running this audit — and being able to explain the difference between the two failure modes — is exactly the security diligence a code reviewer looks for.',
          steps: [
            'Open the Supabase SQL editor connected to your **production** project.',
            'Run query 1: list `public` tables where `rowsecurity = false`. Expect zero rows; enable RLS on any that appear.',
            'Run query 2: list tables with RLS enabled but no rows in `pg_policies`. For each, add the policies your app depends on.',
            'Grep the repository for `service_role` and check the Vercel env vars — it must appear in neither.',
            'Re-run both queries until they return empty, then and only then treat the project as launch-ready.',
          ],
          code: `-- Run BOTH against your PRODUCTION Supabase project.

-- QUERY 1: tables with RLS turned OFF. Correct answer: ZERO rows.
select n.nspname as schema, c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'          -- ordinary tables
  and c.relrowsecurity = false -- RLS is OFF -> readable by anyone
order by table_name;
--  Any row here is an OPEN GATE. Fix:
--    alter table public.<name> enable row level security;

-- QUERY 2: RLS enabled but ZERO policies -> silently denies EVERYTHING.
select c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity = true
  and not exists (
    select 1 from pg_policies p
    where p.schemaname = 'public' and p.tablename = c.relname
  )
order by table_name;
--  Any row here is a LOCKED GATE WITH NO KEY: safe but broken.
--  Fix: add the policies your app needs, e.g.
--    create policy "public read" on public.artists
--      for select to anon, authenticated using (is_published = true);

-- QUERY 3 (not SQL): the service_role key must appear NOWHERE.
--   grep -ri "service_role" .        # repo -> no matches
--   Vercel -> env vars               # not present`,
          pitfalls: [
            '**Auditing the dev project and not production.** They can diverge, especially if production was migrated by hand. Fix: run every query against the production project specifically.',
            '**Enabling RLS and stopping there.** RLS with no policies denies everyone; your app then returns empty arrays with no obvious error. Fix: every RLS-enabled table your app reads needs at least a `select` policy.',
            '**Trusting the dashboard\'s green shields over the query.** A visual toggle is easy to misread across eighteen tables. Fix: the query is authoritative — run it and read zero rows.',
            '**Treating an empty result in the app as a frontend bug.** With RLS on and no policy, the database is refusing you silently. Fix: when a query returns nothing unexpectedly, check `pg_policies` before touching React.',
            '**Assuming `service_role` is safe because it is "only in an env var".** Env vars get inlined into the public bundle; the key bypasses all RLS. Fix: it must exist nowhere — repo or Vercel.',
          ],
          tryIt:
            'Run query 2 against your production project. If it returns any table, resist the urge to fix it in React — instead add the missing policy in SQL, re-run the query, and watch the row disappear. Then open that table in the app and confirm it now returns data. That is the RLS-on-no-policy trap caught and closed in real time.',
          takeaway:
            'Before launch, prove with SQL that no `public` table has RLS off and no RLS-enabled table lacks policies, and confirm the `service_role` key exists nowhere — a checklist that is not optional.',
        },
        {
          id: 'm14-t9',
          title: 'Seeding and backing up production',
          explain:
            'Load your location and category seed data into the production project, and — because the free tier has no automatic point-in-time recovery — schedule your own `pg_dump` backups.',
          analogy:
            'A new seva counter cannot open without its register of deities, rates, and timings already written in. Seeding is filling that register in the production temple before the first devotee arrives. And because this counter has no head office keeping duplicate records, the archaka keeps a photocopy of the register in a safe box at home — because "the register got damaged" is not a story you want to tell the committee with no copy to fall back on.',
          theory:
            'Your production database starts empty. Before launch it needs the same reference data your app depends on — and for KalaKaara that is specifically the **location hierarchy** (`states`, `districts`, `taluks`, `cities` for coastal Karnataka and beyond) and the **categories** (portrait, mural, calligraphy, and the rest). These are not user data; they are the fixed scaffolding every search and every filter reads. Load them into production the same way you loaded them in development: run your seed SQL in the production SQL editor, or pipe your seed file through the connection string with `psql`. Without the location seed, autocomplete returns nothing and service-area matching has no hierarchy to walk; without categories, the filter panel is empty.\n\n**Backups are your responsibility on the free tier.** Supabase\'s paid plans include point-in-time recovery — the ability to restore the database to any moment. The **free tier does not.** So if a bad migration or a careless `delete` wipes data, there is no built-in rewind. You schedule your own backups. The tool is **`pg_dump`**, which produces a complete SQL snapshot of your database over the connection string (Supabase → Project Settings → Database → Connection string). Run it on a schedule you can keep — a weekly cron on your own machine is plenty for a course project — and store the output **somewhere you control**: an external drive, a private cloud folder. The one place a database dump must **never** go is into your git repository, because it contains data and, depending on how you dump, connection details. `pg_dump` output committed nowhere, stored somewhere you own — that is the rule.\n\nFinally, restate the free-tier reality you learned in Module 0, because it surprises people in production: **a free Supabase project pauses after 7 days of zero API activity.** A hobby project that nobody visits for a week goes to sleep, and its API stops responding — which looks alarming if you have forgotten this. It is not data loss. One click in the dashboard (Restore/Resume) wakes it, with everything intact. Knowing this is the difference between "my production database vanished" panic and a calm one-click resume.',
          diagram: `graph TD
    NEW[Fresh production DB<br/>empty] --> SEED[Run seed SQL in production]
    SEED --> LOC[states / districts / taluks / cities]
    SEED --> CAT[categories]
    LOC --> READY[Autocomplete + matching work]
    CAT --> READY
    READY --> BK[Backups are YOUR job on free tier]
    BK --> PD[pg_dump over connection string<br/>weekly]
    PD --> STORE[Store somewhere YOU control<br/>NOT in git]
    READY --> PAUSE[7 days no API activity]
    PAUSE --> SLEEP[Project pauses]
    SLEEP --> WAKE[One dashboard click<br/>-> resumes, no data loss]`,
          flowExplain:
            'Seed first so the app works, then own your backups because the free tier has no point-in-time recovery — and remember the 7-day pause is a resumable sleep, not a deletion.',
          whyItMatters:
            'Launching with an empty location table means every search returns nothing on day one, and having no backup strategy means one bad migration is unrecoverable. Knowing that the free tier lacks point-in-time recovery, and that the 7-day pause is harmless, is exactly the operational awareness that separates "I deployed once" from "I run this in production".',
          steps: [
            'Open the production SQL editor and run your seed scripts for `states`, `districts`, `taluks`, `cities`, and `categories`.',
            'Verify with a quick `select count(*)` on each seeded table that the rows arrived.',
            'From Project Settings → Database, copy the connection string for `pg_dump`.',
            'Run `pg_dump` to produce a full snapshot, and store it somewhere you control — never in the repository.',
            'Schedule the dump (a weekly cron on your machine is enough) since the free tier offers no point-in-time recovery.',
            'Note the 7-day inactivity pause: if the API stops after idle time, click Resume in the dashboard — no data is lost.',
          ],
          code: `# 1) SEED production (run in the Supabase SQL editor, or via psql):
#    the location hierarchy + categories your app reads on every search.
psql "postgresql://postgres:[PW]@db.xxxx.supabase.co:5432/postgres" \\
  -f seed/locations.sql
psql "postgresql://postgres:[PW]@db.xxxx.supabase.co:5432/postgres" \\
  -f seed/categories.sql

# verify:
#   select count(*) from cities;      -- > 0
#   select count(*) from categories;  -- the full set

# 2) BACK UP yourself — free tier has NO point-in-time recovery.
#    pg_dump = a full SQL snapshot over the connection string.
pg_dump "postgresql://postgres:[PW]@db.xxxx.supabase.co:5432/postgres" \\
  -F p -f "kalakaara-backup-$(date +%F).sql"
#    Store it on a drive / private cloud you control.
#    NEVER commit a dump to git (it holds data + connection details).

# 3) The 7-DAY PAUSE (free tier): no API activity for a week -> project
#    sleeps. It is NOT deleted. Dashboard -> Resume -> back, no data loss.`,
          pitfalls: [
            '**Launching with an empty location table.** Autocomplete and service-area matching have nothing to read, so every search returns nobody. Fix: seed `states`/`districts`/`taluks`/`cities` and `categories` into production before going live.',
            '**Assuming Supabase backs the free tier up for you.** Point-in-time recovery is a paid feature; the free tier has none. Fix: schedule your own `pg_dump` and store it somewhere you control.',
            '**Committing a database dump to the repository.** It contains data and connection details and lives in git history forever. Fix: store dumps outside the repo; add `*.sql` backup patterns to `.gitignore` if needed.',
            '**Panicking when the paused project stops responding.** After 7 idle days the free project sleeps and the API errors — it looks like the database vanished. Fix: it is paused, not deleted; click Resume, no data is lost.',
            '**Seeding via the anon key and hitting RLS denials.** Seed data is an administrative load, not an app write. Fix: seed through the SQL editor or a privileged connection string, not the client.',
          ],
          tryIt:
            'Run `pg_dump` against your production database, open the resulting `.sql` file, and confirm you can see your `categories` inserts as plain SQL. Then imagine restoring it into a fresh project. If that thought is comforting, your backup works; if it is not, you have found the gap before it cost you data.',
          takeaway:
            'Seed the location hierarchy and categories into production so search works, own your backups with scheduled `pg_dump` because the free tier has no point-in-time recovery, and remember the 7-day pause is a one-click resume, not data loss.',
        },
        {
          id: 'm14-t10',
          title: 'A custom domain for free-ish, and the post-deploy smoke test',
          explain:
            'Vercel gives you a free `*.vercel.app` domain; a real `.com` costs money — the one honest exception in this course — and after every deploy you run a fixed ten-point smoke test.',
          analogy:
            'The shop already has a perfectly good address — "third stall past the Kundapura bus stand" — and that costs nothing. A vanity address on the main road with your name carved in stone costs real money, and whether it is worth it depends on whether you are running a business or a stall. Either way, before you unlock the shutter each morning, you do the same quick walk-through: lights on, till working, shelves stocked, back door locked. The smoke test is that walk-through, run every single deploy.',
          theory:
            'A **domain** is where honesty about "free" earns its keep. Vercel hands you `kalakaara.vercel.app` for nothing — HTTPS included, no card. That is a real, shareable, permanent URL, and for a portfolio project it is entirely sufficient. A custom `.com` (or `.in`) is the **one genuine exception** to this course\'s zero-cost promise: registering a domain costs money at every registrar, every year. Say so plainly rather than pretending otherwise — and note it is **optional**. If you want a nicer name without paying, the free routes are real: keep the `*.vercel.app` subdomain, or claim a free subdomain on a service like `js.org` or `is-a.dev`, which grant you something like `kalakaara.js.org` via a pull request to their repository, no card, no annual fee. A paid `.com` buys prestige and memorability, not capability.\n\nThe **smoke test** is the discipline that makes deployment safe to do often. It is not exhaustive testing; it is a fixed, fast, literal checklist that exercises the whole core loop on the live domain, and you run **exactly the same list every deploy**. Ten points, ten minutes:\n\n1. Load the home page **logged out** — it renders, no console errors.\n2. **Search Kundapura** — results come back (proving the seed loaded and matching works).\n3. **Open an artist** profile — cover, portfolio, details render.\n4. Confirm **no phone number appears in any network response** while logged out — open DevTools, inspect the artist request, verify the phone field is null. This is RLS proven in production.\n5. **Sign in with Google** on the production domain — the OAuth dance completes (proving topic 7\'s config).\n6. **Reveal the number** — now that you are signed in, it appears.\n7. **Favourite** the artist — the action succeeds.\n8. **Refresh** — the favourite persists and the session survives a reload.\n9. **Sign out** — the session clears.\n10. Confirm the revealed number is **gone again** when logged out.\n\nPoint 4 is the one people skip and the one that matters most: it verifies, on the real internet, that your contact details are withheld by the database and not merely hidden by React. Ten minutes, every deploy, forever — because the deploy that breaks sign-in or leaks a phone number is exactly the one you did not smoke-test.',
          diagram: `graph TD
    D[Deploy finishes] --> SMOKE[Ten-point smoke test<br/>on the LIVE domain]
    SMOKE --> S1[1. Home loads logged out]
    S1 --> S2[2. Search Kundapura -> results]
    S2 --> S3[3. Open an artist]
    S3 --> S4[4. NO phone in any network response<br/>-- RLS proven in production]
    S4 --> S5[5. Google sign-in works]
    S5 --> S6[6. Reveal number -> shows]
    S6 --> S7[7. Favourite succeeds]
    S7 --> S8[8. Refresh -> favourite + session persist]
    S8 --> S9[9. Sign out]
    S9 --> S10[10. Number hidden again]
    S10 --> PASS{All 10 pass?}
    PASS -- yes --> SHIP[Record it in the README<br/>with the live URL]
    PASS -- no --> FIX[Fix, redeploy, re-run the list]`,
          flowExplain:
            'The checklist walks the entire core loop end to end on the live domain; point 4 is the non-negotiable one, proving contact details are withheld by Postgres in production and not just by the UI.',
          whyItMatters:
            'A domain conversation is where a course either stays honest about cost or quietly cheats; naming the paid `.com` as the one exception keeps the zero-cost promise credible. And a repeatable smoke test is what lets you deploy fearlessly — the ten minutes that catch a leaked phone number or a broken sign-in before a user does.',
          steps: [
            'Use the free `kalakaara.vercel.app` domain, or claim a free `js.org`/`is-a.dev` subdomain via PR if you want a nicer name.',
            'If you choose a paid `.com`, acknowledge in the README that it is the one honest cost exception and is optional.',
            'After the deploy finishes, open the live domain and run all ten smoke-test points in order.',
            'Give point 4 special attention: inspect the artist network response logged out and confirm the phone field is null.',
            'Record the completed smoke test and the live URL in your README as proof the deploy is healthy.',
            'Repeat the same ten-point list on every future deploy — no exceptions.',
          ],
          code: `KalaKaara — post-deploy smoke test (run on the LIVE domain, every deploy)

  URL: https://kalakaara.vercel.app        Date: ____   Result: PASS / FAIL

  [ ]  1. Home page loads logged out, no console errors
  [ ]  2. Search "Kundapura" -> artists returned (seed + matching OK)
  [ ]  3. Open an artist profile -> cover, portfolio, details render
  [ ]  4. Logged out: NO phone number in ANY network response
          (DevTools -> Network -> artist request -> phone is null)  << RLS proof
  [ ]  5. Sign in with Google on the production domain -> completes
  [ ]  6. Reveal phone number -> now visible
  [ ]  7. Favourite the artist -> succeeds
  [ ]  8. Refresh the page -> favourite persists, session survives
  [ ]  9. Sign out -> session cleared
  [ ] 10. Logged out again -> phone number hidden once more

  DOMAIN NOTES:
    free      kalakaara.vercel.app         (HTTPS included, no card)
    free      kalakaara.js.org / is-a.dev  (subdomain via PR, no card)
    PAID      kalakaara.com                (the ONE cost exception; optional)`,
          pitfalls: [
            '**Skipping point 4 because "the button says sign in to view".** The button is UI; the network response is truth. A leaked phone in the JSON is a real breach even if the UI hides it. Fix: always inspect the logged-out network response for a null phone.',
            '**Pretending a `.com` is free.** Domains cost money at every registrar, every year. Fix: name it as the one honest exception, mark it optional, and use `*.vercel.app` or a free subdomain otherwise.',
            '**Running the smoke test once and never again.** The deploy that breaks sign-in is the one you did not test. Fix: run the identical ten-point list on every deploy.',
            '**Testing only while logged in.** Most of KalaKaara\'s users are anonymous; the logged-out path is the main path. Fix: start the smoke test logged out and finish it logged out.',
            '**Not recording the result.** An untracked smoke test is a smoke test you will skip under time pressure. Fix: log the date, URL, and pass/fail in the README each time.',
          ],
          tryIt:
            'Run all ten points on your live KalaKaara right now and time yourself. If it takes more than fifteen minutes the first time, that is fine — by the third deploy it is under ten. Paste the completed checklist into your README with the date and the live URL; that record is part of the deliverable.',
          takeaway:
            'A free `*.vercel.app` or `js.org` subdomain costs nothing while a `.com` is the one honest paid exception; and a fixed ten-point smoke test on the live domain — with the logged-out phone-in-network check as its heart — is what makes every deploy safe.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm14-p1',
      type: 'Mini Project',
      title: 'KalaKaara, Live',
      domain: 'Deployment & Production Hardening',
      duration: '2 hours',
      description:
        'Take the finished KalaKaara app from your machine to a public, card-free URL: deployed on Vercel from GitHub, with a working SPA rewrite, environment variables across all three environments, Google OAuth functioning on the production domain, a passing RLS audit, seeded production data, and a completed ten-point smoke test recorded in the README alongside the live URL.',
      tools: ['React', 'Vite', 'Supabase', 'Vercel', 'Git', 'GitHub', 'Google Cloud Console'],
      blueprint: {
        overview:
          'Everything up to Module 13 built a working app on localhost. This project makes it real: a live HTTPS URL anyone can open, on infrastructure that never asked for a credit card. You will configure the host, the auth providers, and the database for production traffic, prove the security holds on the public internet, and leave behind a README that records the live URL and a passing smoke test — the artifact a stranger (or an interviewer) reads to confirm the thing actually runs.',
        functionalRequirements: [
          '**Deployed from GitHub to Vercel Hobby with no card.** The repo imports, Vite is auto-detected, and the build succeeds on Vercel\'s Linux builders.',
          '**SPA rewrite works.** `vercel.json` maps every unknown path to `/index.html`; a hard refresh on `/artists/:slug` on the live domain renders instead of 404ing.',
          '**Environment variables set across all three environments.** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Production, Preview, and Development; no `service_role` key anywhere.',
          '**Google OAuth works on the production domain.** Supabase Site URL, Supabase redirect list (with a preview wildcard), and Google authorized origins all include the live domain; sign-in completes with no `redirect_uri_mismatch`.',
          '**A passing RLS audit.** Both audit queries return zero rows against production, and `service_role` appears nowhere in the repo or Vercel.',
          '**Seeded production data.** The location hierarchy and categories are loaded, so search and filtering work on day one.',
          '**A completed ten-point smoke test in the README**, with the live URL, the date, and a PASS result — including the logged-out phone-in-network check.',
        ],
        technicalImplementation: [
          '**`vercel.json` at the repo root.** A single `rewrites` rule (`/(.*)` → `/index.html`), committed to git before the first deploy.',
          '**Build parity locally.** `npm run build && npm run preview` passes cleanly before pushing; the Linux-vs-Windows case-sensitivity of imports is verified.',
          '**Vercel env vars.** Both public `VITE_` variables added to all three environments via the dashboard, with a redeploy triggered after any change.',
          '**Three-console auth config.** Supabase URL Configuration (Site URL + Additional Redirect URLs with `localhost` and a preview wildcard) and Google Cloud Console (Authorized JavaScript origins), with the Supabase callback URI left unchanged.',
          '**Two audit SQL queries** run in the production SQL editor (RLS-off tables; RLS-on-no-policy tables), plus a repo/Vercel grep for `service_role`.',
          '**A `pg_dump` backup** taken over the connection string and stored outside the repository, with the 7-day pause behaviour noted in the README.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Build, preview, and the SPA rewrite',
            outcome:
              'A clean production build verified locally and a committed `vercel.json` rewrite.',
            prompt:
              'In the KalaKaara repo, run `npm run build` and then `npm run preview`, and walk me through checking the three build-only bugs: a missing `VITE_` env var producing an undefined Supabase URL, a hard-refresh 404 on a deep route like `/artists/rukmini-shetty`, and any asset referenced by a `/src/...` string path instead of an import. Then create `vercel.json` at the repository root with a single rewrites rule mapping `/(.*)` to `/index.html`, explain why it must be a rewrite and not a redirect, and confirm it sits next to `package.json`, not inside `src/`. Commit it with a message describing the SPA fallback.',
          },
          {
            step: 2,
            label: 'Deploy to Vercel and wire env vars across all three environments',
            outcome:
              'A live `*.vercel.app` deployment with correct env vars and a passing build.',
            prompt:
              'Guide me through importing the KalaKaara GitHub repo into Vercel Hobby (confirming no card is requested and that Vite is auto-detected: build `npm run build`, output `dist`). Before deploying, have me add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Settings → Environment Variables, scoped to Production, Preview, AND Development, and explicitly warn me never to add the `service_role` key because there is no server runtime and the value would be inlined into the public bundle. Explain, in terms of build-time inlining, why any env-var change afterwards requires a redeploy rather than just a page reload. Then deploy and open the live URL.',
          },
          {
            step: 3,
            label: 'Make Google OAuth work on the production domain',
            outcome:
              'Sign-in succeeds on the live domain with no `redirect_uri_mismatch`.',
            prompt:
              'Walk me through configuring production auth so Google sign-in works on my live Vercel domain. In Supabase → Authentication → URL Configuration, set the Site URL to my production domain and add Additional Redirect URLs for the production domain, `http://localhost:5173`, and a preview wildcard like `https://kalakaara-*.vercel.app/**`. In Google Cloud Console, add my production origin to Authorized JavaScript origins, and confirm the Authorized redirect URI is still the Supabase callback (`https://xxxx.supabase.co/auth/v1/callback`) and does not change on deploy. Explain why forgetting any of these produces `redirect_uri_mismatch` on production while localhost keeps working, and how to read the error to find which URL is missing from which list.',
          },
          {
            step: 4,
            label: 'RLS audit and seed production data',
            outcome:
              'Two audit queries returning zero rows, no `service_role` key anywhere, and seeded production data.',
            prompt:
              'Help me harden the production Supabase project. First, give me two SQL queries to run in the production SQL editor: one listing every `public` table where `rowsecurity` is false (RLS disabled), and one listing tables where RLS is enabled but there are zero rows in `pg_policies` (silently denying everything). Explain the difference between the two failure modes and fix anything either query reports. Then have me grep the repo and check Vercel env vars to confirm the `service_role` key appears nowhere. Finally, run my seed SQL for `states`/`districts`/`taluks`/`cities` and `categories` against production and verify the row counts, so search and filtering work on day one.',
          },
          {
            step: 5,
            label: 'Backups, the smoke test, and the README record',
            outcome:
              'A `pg_dump` backup, a completed ten-point smoke test, and a README documenting the live URL.',
            prompt:
              'Two final things. First, show me how to take a `pg_dump` backup of the production database over the connection string, store it outside the repo (never in git), and note that the free tier has no point-in-time recovery and pauses after 7 idle days (one-click resume, no data loss). Second, generate a ten-point post-deploy smoke test as a literal README checklist — load home logged out, search Kundapura, open an artist, confirm NO phone number appears in any network response while logged out, sign in with Google on production, reveal the number, favourite, refresh to confirm persistence, sign out, and confirm the number is hidden again — then run it against my live domain with me. Finally, update the README with the live URL, the completed smoke-test result with today\'s date, and an honest note that a `.com` domain is the one optional paid exception while `*.vercel.app` is free.',
          },
        ],
        deliverable:
          'A public, card-free KalaKaara at a live HTTPS URL: deployed from GitHub to Vercel with a working SPA rewrite, env vars across all three environments, Google sign-in functioning on the production domain, both RLS audit queries returning zero rows, seeded location and category data, a stored `pg_dump` backup, and a README that records the live URL alongside a completed ten-point smoke test. An interviewer could open the link, sign in, and watch the whole core loop work.',
      },
    },
  ],
  quiz: [
    {
      id: 'm14-q1',
      q: 'After `npm run build`, you open `dist/assets/index-*.js` and find your Supabase anon key sitting in plain text. Why is this expected and safe?',
      options: [
        'Vite failed to encrypt the key and you must rotate it immediately',
        'The anon key only identifies a caller as anonymous; Row Level Security in Postgres decides what that caller may read or write, so the key grants nothing on its own',
        'The key in the bundle is a decoy and the real one is fetched at runtime',
        'It is only safe because minification made the key unreadable',
      ],
      answer: 1,
    },
    {
      id: 'm14-q2',
      q: 'You change an environment variable in the Vercel dashboard, reload the live site, and nothing changes. Why, and what fixes it?',
      options: [
        'Redeploy, because Vite inlines `VITE_` values into the bundle at build time as string literals — they are not read at runtime, so only a new build picks up the change',
        'Clear the browser cache, because Vercel serves the variable from a service worker',
        'Wait an hour, because Vercel propagates env vars on a slow schedule',
        'Nothing is wrong; env vars never affect a deployed site',
      ],
      answer: 0,
    },
    {
      id: 'm14-q3',
      q: 'A user hard-refreshes `/artists/rukmini-shetty` on your live Vercel site and gets a 404, even though clicking to that page in-app works fine. What is the fix?',
      options: [
        'Add a redirect from `/artists/*` to the home page in `vercel.json`',
        'Move all routing from React Router to server-side rendering',
        'Add a catch-all rewrite in `vercel.json` mapping `/(.*)` to `/index.html`, so unknown paths serve the SPA shell and React Router reads the URL',
        'Rename the route so it no longer contains a slug parameter',
      ],
      answer: 2,
    },
    {
      id: 'm14-q4',
      q: 'Your app builds fine locally but fails on Vercel with "Could not resolve \'./artistCard\'", where the file on disk is `ArtistCard.jsx`. What is going on?',
      options: [
        'Vercel\'s cache is stale and a redeploy will fix it',
        'The file was corrupted during `git push`',
        'You must rename the file to lowercase to match React conventions',
        'Your local filesystem is case-insensitive so `./artistCard` finds `ArtistCard.jsx`, but Vercel builds on case-sensitive Linux where the names differ — fix the import to match the real casing',
      ],
      answer: 3,
    },
    {
      id: 'm14-q5',
      q: 'Google sign-in works perfectly on `http://localhost:5173` but fails on your live domain with `redirect_uri_mismatch`. What is the cause?',
      options: [
        'The production domain was never added to the allow-lists — Supabase Site URL / Additional Redirect URLs and Google\'s Authorized JavaScript origins — while localhost was added long ago',
        'The Supabase callback URI changed when you deployed and must be updated',
        'Google OAuth does not work over HTTPS and requires plain HTTP',
        'The anon key is different in production and must be regenerated',
      ],
      answer: 0,
    },
    {
      id: 'm14-q6',
      q: 'A production table has RLS enabled but zero policies, and your app\'s reads of it silently return empty arrays. Why?',
      options: [
        'RLS with no policies still allows reads, so the empty result is a frontend bug',
        'Enabling RLS switches the table to default-deny, so with no policies every operation is denied for the anon and authenticated roles — the table is safe but broken until you add the policies your app needs',
        'The table is corrupt and must be recreated',
        'Supabase requires a paid plan before any RLS policy takes effect',
      ],
      answer: 1,
    },
    {
      id: 'm14-q7',
      q: 'Your live KalaKaara returns an API error after a week of no visitors. What has most likely happened?',
      options: [
        'Vercel deleted the deployment for inactivity and you must redeploy from scratch',
        'The anon key expired and needs rotating',
        'The free Supabase project paused after 7 days of zero API activity; it is not deleted, and one dashboard click resumes it with no data loss',
        'Your `pg_dump` backup overwrote the live database',
      ],
      answer: 2,
    },
  ],
}
