// Module 5 — Containerize the Frontend: Multi-Stage Builds
// Brings the React + Vite client of "Kundapura Notice Board" into Docker for the
// first time, using a multi-stage Dockerfile (node build stage -> slim nginx serve
// stage), a correct nginx.conf for serving a single-page app, and the crucial
// build-time-vs-runtime environment variable distinction for Vite. Ends with the
// full three-container stack (mongo + server + client) running by hand for the
// first time on noticeboard-net — setting up Module 6's docker-compose motivation.

export const m5 = {
  id: 'm5',
  title: 'Containerize the Frontend: Multi-Stage Builds',
  hours: 8,
  color: 'from-yellow-500/20 to-yellow-700/10',
  accent: 'yellow',
  description:
    'Bring the React frontend into Docker for the very first time, using the pattern every real production frontend uses: a **multi-stage Dockerfile** with a throwaway Node build stage and a slim **nginx** stage that ships only static files. Write `client/nginx.conf` to correctly serve a single-page app with a `try_files` fallback, learn the crucial difference between **build-time** (`--build-arg`) and **runtime** (`-e`) environment variables — a common source of confusion for Vite/React developers coming from the server side — and finally get the **entire three-container Kundapura Notice Board stack** (`mongo` + `server` + `client`) running together by hand for the first time, live at `http://localhost:5173`.',
  sections: [
    {
      id: 'm5-s1',
      title: 'Building the React App for Production',
      topics: [
        {
          id: 'm5-t1',
          title: 'Why you cannot just "npm run dev" in production — build vs dev servers',
          explain:
            'Vite\'s `npm run dev` command starts a **development server** built for a fast local editing loop (instant hot-reload, unbundled modules) — it was never designed to serve real visitors. Running it inside a container as "the production app" is slow, fragile, and far heavier than it needs to be, compared to a proper static build served by a real web server.',
          analogy:
            'Picture a trainee bus driver at the **Kundapura bus stand** doing slow practice loops around the depot yard with an instructor beside him — stopping every few metres to adjust the mirrors, correct a gear change, redo a turn that went wrong. That kind of stop-and-fix loop is exactly what makes training useful, but nobody would put real passengers on that practice loop during the 7 AM rush toward Udupi. The **actual timetabled service** is a different mode entirely: the route is finalised, the bus is checked once and fuelled, and it simply drives fast and reliably, with no more mid-journey adjustments. Vite\'s `npm run dev` is the practice loop; the production **build** is the timetabled service everyone actually rides.',
          theory:
            'Vite\'s dev server (`npm run dev`) serves your source files nearly as-is: native ES modules transformed on demand per request, a live WebSocket connection injected into the page for **Hot Module Replacement (HMR)**, and no minification or bundling. That is exactly what makes editing feel instant — save a file and the browser patches just that piece, in place, without a full reload. But every one of those properties is wrong for real traffic: unbundled files mean many more HTTP requests, unminified code means a heavier payload, the dev server assumes a single developer\'s browser rather than concurrent visitors, and it still depends on the full source tree plus every `devDependency` (Vite itself, React\'s dev tooling, and so on) being present at runtime.\n\nContrast that with `npm run build` — Vite\'s production build, powered by esbuild and Rollup under the hood. It runs once, minifies the JavaScript and CSS, tree-shakes anything unused, and writes plain static files into `client/dist/` with content-hashed filenames (like `index-a1b2c3.js`) so browsers can cache them forever until the content actually changes. Crucially, the files in `dist/` need **zero Node.js at runtime** to be served — they are just static bytes. Any web server on earth can hand them out: nginx, Apache, a plain S3 bucket behind a CDN, anything.\n\nThat single fact is the entire reason this module\'s Dockerfile has two separate stages. One stage needs Node.js (to run the build). The other stage — the one that actually ships and serves real visitors — needs nothing but a tiny web server and the finished `dist/` folder. Conflating "the app runs" with "the app is production-ready" is the exact mistake this topic exists to prevent.',
          whyItMatters:
            'If the Kundapura Notice Board client container ran `npm run dev` in "production", every visitor loading the noticeboard would pull an unbundled, unminified source tree over the network, hit a workflow designed around one developer\'s browser rather than concurrent household traffic, and expose dev-only tooling that has no business facing the public internet. Getting the mental model right here — dev server for editing, static build plus a real web server for serving — is what makes the rest of this module\'s multi-stage Dockerfile design make sense at all.',
          steps: [
            'Inside `client/`, run `npm run dev` and open the noticeboard locally; note how the terminal keeps printing HMR update messages every time you save a file.',
            'Stop the dev server, then run `npm run build` and look inside the newly created `client/dist/` folder.',
            'List the files inside `dist/` and notice the JS and CSS filenames contain content hashes, e.g. `index-4f9a2b.js`.',
            'Open `dist/index.html` in a text editor and confirm it references those hashed built files, not raw source files like `main.jsx`.',
            'Serve `dist/` with any plain static file server (e.g. `npx serve dist`) and confirm the app still works with zero Vite dev tooling running.',
            'Open `client/package.json` and compare the `scripts` block: `dev` runs `vite`, `build` runs `vite build` — two genuinely different tools.',
          ],
          code: `# Inside client/, run the dev server:
npm run dev
# VITE v5.x  ready in 320 ms
# ->  Local:   http://localhost:5173/
# (every file save triggers an HMR update message here — great for editing)

# Stop it (Ctrl+C), then build for production instead:
npm run build
# vite v5.x building for production...
# transforming...
# rendering chunks...
# dist/index.html                   0.46 kB
# dist/assets/index-4f9a2b3c.css    1.20 kB
# dist/assets/index-8e21fa90.js   142.30 kB

# Inspect the output — plain static files, no Node needed to read them:
ls client/dist
# index.html  assets/

ls client/dist/assets
# index-4f9a2b3c.css  index-8e21fa90.js

# Prove it needs no Vite dev server at all:
npx serve client/dist
# -> Serving! http://localhost:3000 (or similar)
# The noticeboard loads perfectly with zero Vite process running.`,
          pitfalls: [
            '**Assuming "npm run dev inside a container" counts as containerizing the frontend.** It technically runs, but ships the whole dev toolchain and unbuilt source tree as "production" — slow, heavier, and not what any real deployment does. Fix: always build a static bundle with `npm run build` and serve it through a proper web server.',
            '**Forgetting Vite\'s dev server needs a live WebSocket connection for HMR.** That socket has no place in a production container. Fix: cleanly separate concerns — production containers never run the dev server or its HMR socket at all.',
            '**Trying to copy `client/dist/` before it exists.** `dist/` is only created once `npm run build` actually runs; referencing it earlier copies nothing or stale leftovers. Fix: always run the build step first, inside the Dockerfile\'s build stage, before anything references `dist/`.',
            '**Leaving devDependencies like `vite` itself inside the final runtime image "just in case".** It bloats the image and widens the attack surface for zero benefit once the static files exist. Fix: only the final `nginx:alpine` stage ships to production; Node and devDependencies stay behind in the discarded build stage.',
            '**Testing only via `npm run dev` and assuming the built version behaves identically.** Minification, tree-shaking, or a missing build-time environment variable can surface bugs only in the built output. Fix: always test the actual `npm run build` output (or the built Docker image) before calling anything done.',
            '**Confusing the dev server\'s port (5173, Vite\'s default) with the port nginx will serve on inside the container (80).** They are two different builds serving on two different ports for two different purposes. Fix: keep the mental model straight before writing the Dockerfile.',
          ],
          tryIt:
            'In `client/`, run `npm run dev` and load the noticeboard in a browser, then stop it and run `npm run build`. Open the generated `client/dist/index.html` directly, and separately try `npx serve client/dist` — confirm the site still works with no Vite dev server running at all.',
          takeaway:
            '`npm run dev` is a fast-feedback editing tool, not a production server — real deployments always serve the static output of `npm run build` through a proper web server like nginx.',
        },
        {
          id: 'm5-t2',
          title: 'Multi-stage Dockerfile: a node build stage producing dist/, then a slim nginx stage to serve it',
          explain:
            'A **multi-stage Dockerfile** uses more than one `FROM` instruction to separate "building the app" from "running the app": the first stage has Node.js and every tool needed to compile the React app, and a completely separate second stage starts fresh from a tiny nginx image and copies over only the finished static files, discarding everything else.',
          analogy:
            'Picture a fishing boat leaving **Kundapura harbour** before dawn, loaded with diesel, nets, ice crates, a noisy engine, and a full crew. It goes out, does the actual hard work of catching the fish, and returns. But nobody carries the boat itself into the market stall to sell fish — at the harbour, the catch is offloaded onto a small handcart, and only the **fish** goes to the stall. The boat, its engine, its nets, its diesel fumes — none of that ever reaches the customer. A multi-stage Dockerfile works the same way: the first `FROM node:20-alpine` stage is the boat — noisy, heavy, full of tools, the whole source tree and `node_modules` — and it exists only to produce the catch (`client/dist/`). The second `FROM nginx:alpine` stage is the handcart that only ever receives the finished catch, never the boat.',
          theory:
            'A multi-stage build looks like this, with each stage starting from its own `FROM`:\n```\nFROM node:20-alpine AS build\n...\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html\n```\nThe first stage is given a name with `AS build`. The second stage can then reach back into it with `COPY --from=build <path-in-that-stage> <path-in-this-stage>` — pulling out only the files it needs, nothing else. Everything else that existed in the `build` stage (Node.js itself, npm, every package in `node_modules`, the raw `.jsx` source files) simply never exists in the final image at all; it is discarded the moment the build finishes.\n\nWhy this matters so much in practice: a `node:20-alpine` image plus a full React project\'s `node_modules` can easily run into hundreds of megabytes. An `nginx:alpine` image, by contrast, is roughly 20-40 MB on its own, and after copying in only the few megabytes of built `dist/` output, the final `noticeboard-client` image often ends up 5-10x smaller than the equivalent single-stage Node-based image would have been. Smaller images pull faster, start faster, and — just as important — carry a much smaller attack surface: no npm, no Node runtime, no source code, no `node_modules` sitting inside the shipped container for an attacker to poke at.\n\nFor Kundapura Notice Board, the full Dockerfile looks like:\n```\n# ---- Stage 1: build ----\nFROM node:20-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nARG VITE_API_URL\nRUN npm run build\n\n# ---- Stage 2: serve ----\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html\nCOPY nginx.conf /etc/nginx/conf.d/default.conf\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]\n```\nOnly the *last* stage in the file becomes the image you actually get when you run `docker build` normally — earlier stages exist purely to produce artifacts for later stages to copy from (or for debugging, via `docker build --target build`, which stops at a named stage instead of building all the way through).',
          whyItMatters:
            'This is the single biggest lesson of this whole module: every production frontend Docker image you will ever build for a Vite, React, Vue, or Angular app follows exactly this two-stage shape. Internalizing it here means every future frontend Dockerfile you write — for this project or any other — starts from a pattern you already trust, instead of being reinvented from scratch.',
          steps: [
            'Create `client/Dockerfile` with two `FROM` instructions.',
            'Name the first stage `AS build`.',
            'In stage 1: set `WORKDIR`, `COPY package*.json ./`, `RUN npm ci`, `COPY . .`, then `RUN npm run build`.',
            'In stage 2: `FROM nginx:alpine`, then `COPY --from=build /app/dist /usr/share/nginx/html`.',
            'Build the image: `docker build -t noticeboard-client:v1 client/`.',
            'Run `docker images` and compare `noticeboard-client:v1`\'s size against a plain `node:20-alpine` image pulled on its own.',
          ],
          code: `# client/Dockerfile

# ---- Stage 1: build the React app ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
RUN npm run build

# ---- Stage 2: serve the built files with nginx ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Build it:
docker build --build-arg VITE_API_URL=http://localhost:5000/api/notices -t noticeboard-client:v1 client/

# Compare sizes:
docker images
# REPOSITORY            TAG   SIZE
# node                  20-alpine   180MB
# noticeboard-client    v1          38.2MB   <- only nginx + the built static files`,
          pitfalls: [
            '**Using only one `FROM` and running `npm install -g serve` inside a Node-based final image.** It works, but ships all of Node, npm, and every devDependency into "production" for no reason. Fix: split into a build stage and a slim serve stage.',
            '**Forgetting to name the build stage and referencing it by a numeric index instead.** Stage indices shift the moment you add or reorder a stage, silently breaking the copy. Fix: always name stages explicitly (`AS build`) and reference them by name in `--from=`.',
            '**Copying the whole `/app` folder from the build stage instead of just `/app/dist`.** That ships the source code and `node_modules` into the final image anyway, defeating the entire point of the split. Fix: `COPY --from=build /app/dist /usr/share/nginx/html` — only the build output.',
            '**Running `npm install` instead of `npm ci` in the build stage.** `npm install` can resolve slightly different versions than what is locked in `package-lock.json`, causing subtle "works on my machine" drift. Fix: use `npm ci` in Docker builds for a reproducible, lockfile-exact install.',
            '**Placing `COPY . .` before `COPY package*.json ./` and `RUN npm ci`.** Every source code change then invalidates Docker\'s cache for the dependency-install layer, forcing a full `node_modules` reinstall on nearly every build. Fix: copy just the package files first, install, then copy the rest of the source.',
            '**Assuming the final image still has Node.js in it "just in case something needs it".** It does not, and that absence is the entire benefit of the multi-stage split. Fix: verify with `docker run --rm noticeboard-client:v1 node --version` — it should fail because there is no Node binary in the nginx-based final image.',
          ],
          tryIt:
            'Build the two-stage image with `docker build -t noticeboard-client:v1 client/`, then run `docker images` and compare its size against a plain `node:20-alpine` image. Then try `docker run --rm noticeboard-client:v1 node --version` and confirm it fails — proof no Node.js made it into the final image.',
          takeaway:
            'A multi-stage Dockerfile builds with a full Node.js toolchain in one throwaway stage and ships only the static output through a second, much smaller runtime stage — smaller, faster, and safer images.',
        },
        {
          id: 'm5-t3',
          title: 'Serving a Vite SPA with nginx.conf — try_files and client-side routing',
          explain:
            'Write a `client/nginx.conf` that tells nginx exactly how to serve the built React app — including a `try_files ... /index.html;` fallback rule, which is the standard way any single-page app (SPA) must be configured so that loading a deeper URL directly, or refreshing one, does not return a 404.',
          analogy:
            'Imagine the **seva counter at a Kundapura temple** on a busy festival morning. A pilgrim walks up holding a token for "Counter 3 — Archane bookings", but Counter 3 has just closed for a short break. Instead of turning the pilgrim away with "no such counter, go home", the volunteer at the help desk simply says, "Come here to the main desk, we will sort you out from here" — redirecting them to one known-good starting point that can handle any request. That is exactly what `try_files $uri $uri/ /index.html;` does for a single-page app: if nginx cannot find a real file matching the exact URL requested, it does not hand back a blunt 404 — it falls back to serving `index.html`, and lets the JavaScript app inside the browser figure out what to display from there.',
          theory:
            'A single-page app ships one real HTML file (`index.html`) that loads a JavaScript bundle; all "page" navigation after that happens inside the browser, in JavaScript, without a fresh request to the server for each view. Kundapura Notice Board today is a single view with no client-side router, but the moment any future route is added — say `/notices/64f...` or an `/about` page — those paths still only exist inside the browser\'s JavaScript, never as real files or folders on the nginx server\'s disk.\n\nWithout a fallback rule, nginx behaves exactly as a plain file server should: it looks for a literal file or folder matching the requested path, finds nothing for `/notices/64f...`, and returns a real `404 Not Found`. With `try_files $uri $uri/ /index.html;`, nginx instead tries, in order: the exact file (`$uri`), then a directory index (`$uri/`), and only if both fail, falls back to serving `index.html` — letting the already-loaded JavaScript app boot and handle that route internally.\n\nA correct `client/nginx.conf` for this project looks like:\n```\nserver {\n    listen 80;\n    server_name localhost;\n\n    root /usr/share/nginx/html;\n    index index.html;\n\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n\n    location ~* \\.(js|css|png|jpg|jpeg|gif|svg|ico)$ {\n        expires 30d;\n        add_header Cache-Control "public, immutable";\n    }\n}\n```\nThe second `location` block is a small but valuable extra: Vite\'s hashed filenames (`index-a1b2c3.js`) only ever change when the *content* changes, so it is safe to tell browsers to cache those specific files aggressively and indefinitely. This `nginx.conf` gets copied into the image at `/etc/nginx/conf.d/default.conf` in the Dockerfile\'s second stage, replacing nginx\'s own default site configuration.',
          whyItMatters:
            'Getting this wrong produces one of the most common "works on my machine, breaks after deploying" SPA bugs: the homepage loads fine (the browser requests `/`, which nginx maps straight to `index.html`), but refreshing any deeper URL 404s outright, because nginx goes looking for a file that was never there. Writing `nginx.conf` correctly the first time means Kundapura Notice Board is future-proofed the moment client-side routes get added, instead of surfacing a confusing refresh bug much later.',
          steps: [
            'Create `client/nginx.conf` with a `server` block listening on port 80.',
            'Set `root` to `/usr/share/nginx/html` and `index` to `index.html`.',
            'Add `location / { try_files $uri $uri/ /index.html; }`.',
            'Add a second `location` block caching hashed static assets aggressively.',
            'In `client/Dockerfile`\'s second stage, `COPY nginx.conf /etc/nginx/conf.d/default.conf`, overriding nginx\'s default config.',
            'Rebuild the image and confirm nginx starts cleanly: `docker logs client` should show no configuration errors.',
          ],
          code: `# client/nginx.conf
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback: unknown paths still get index.html, not a 404
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache Vite's content-hashed assets aggressively — the filename
    # only changes when the content does, so long caching is safe.
    location ~* \\.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Copied into the image in the Dockerfile's second stage:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# After rebuilding and running the container, prove the fallback works:
curl -i http://localhost:5173/some/made-up/path
# HTTP/1.1 200 OK          <- not a 404!
# ...
# <html>...noticeboard app shell...</html>`,
          pitfalls: [
            '**Shipping nginx\'s untouched default config.** It typically returns a plain 404 page for any unknown path, so refreshing a deep link on the noticeboard would break the moment routes exist. Fix: always replace it with a config containing `try_files ... /index.html;`.',
            '**Copying `nginx.conf` to the wrong path inside the image**, such as overwriting `/etc/nginx/nginx.conf` wholesale instead of the site config under `conf.d/`. Fix: copy into `/etc/nginx/conf.d/default.conf` so it merges correctly with nginx\'s own includes.',
            '**Setting `root` and `index` but forgetting `try_files` entirely.** The homepage works, but any non-root path returns a hard 404. Fix: always include the fallback `try_files $uri $uri/ /index.html;` line for any SPA.',
            '**Writing an incomplete `try_files $uri /index.html;`, skipping the middle `$uri/` case.** Real subdirectories that do exist under `dist/` might not resolve as expected. Fix: use the standard three-part form `try_files $uri $uri/ /index.html;`.',
            '**Testing only the exact root URL locally and calling it done.** The bug only shows up on deep or refreshed URLs, so a shallow smoke test hides it completely. Fix: explicitly test a made-up deep path (e.g. `/some/deep/path`) and confirm it still returns the app shell, not a 404.',
            '**Assuming this config only matters once React Router gets added.** Kundapura Notice Board has no client routes today, but the config is identical either way and should be correct from day one. Fix: write the standard SPA `try_files` pattern now, regardless of how many routes currently exist.',
          ],
          tryIt:
            'After rebuilding the client image with the new `nginx.conf`, run the container and use `curl -i http://localhost:5173/some/made-up/path` — confirm you get a `200 OK` response containing the noticeboard\'s `index.html` content, not a `404 Not Found`.',
          takeaway:
            'An SPA\'s nginx config must fall back to `index.html` for any unmatched path with `try_files $uri $uri/ /index.html;`, or refreshing anything but the exact homepage URL will 404.',
        },
      ],
    },
    {
      id: 'm5-s2',
      title: 'Wiring the Frontend to the Backend',
      topics: [
        {
          id: 'm5-t4',
          title: 'Build-time environment variables in Vite: VITE_API_URL and why it must be baked in at build time, not runtime',
          explain:
            'Vite replaces `import.meta.env.VITE_API_URL` (and any `VITE_`-prefixed variable) with its literal value while `vite build` is running, permanently baking that value into the compiled JavaScript bundle. For a Dockerized Vite app, this means the API URL must be supplied as a Docker `--build-arg` at image build time, not as a `-e` flag at `docker run` time the way the server\'s environment variables worked in earlier modules.',
          analogy:
            'Think of the **fish price board painted onto a wooden plank** at the Kundapura market at the start of the season, compared to the auctioneer shouting today\'s price through a loudspeaker each morning. The auctioneer\'s shout — the server\'s runtime `-e MONGO_URI=...` — can change every single day without touching anything physical: start the same stall fresh tomorrow with a different announcement and it just works. But the painted plank — `VITE_API_URL` baked into the Vite bundle — is fixed the moment the paint dries. If the price on the plank is wrong, shouting louder at it changes nothing; someone has to physically repaint it, which is exactly what rebuilding the image means here.',
          theory:
            'Vite performs a static text replacement of `import.meta.env.VITE_*` references at build time (through esbuild\'s `define` mechanism), because the output is pure static JavaScript and CSS destined for the browser. There is no long-running server process attached to that bundle once it ships — the browser has no concept of "the container\'s environment variables" at all. Whatever value existed in the JS file the moment `npm run build` ran is the value baked in, forever, until the image is rebuilt.\n\nContrast this directly with the server container from Module 4: Node.js there is a long-running process, so it can call `process.env.MONGO_URI` freshly every single time it starts. Changing `-e MONGO_URI=...` at `docker run` time changes its behaviour instantly, with zero rebuild required. This is the asymmetry to internalize permanently: **runtime environment variables (`-e`) work for anything with a live server process reading `process.env` continuously** (Express/Node, in this project\'s `server`); **build-time environment variables (`ARG` plus `--build-arg`) are required for anything compiled once into static assets shipped to a browser** (Vite/React, in this project\'s `client`).\n\nMechanically: declare `ARG VITE_API_URL` in the Dockerfile\'s build stage, placed before the `RUN npm run build` line so it is in scope when the build runs. Docker automatically exposes `ARG`-declared variables as environment variables to the `RUN` instructions that follow, in that same stage — so the underlying Vite process sees `process.env.VITE_API_URL` set correctly, and inlines it into the bundle. Then, at build time:\n```\ndocker build --build-arg VITE_API_URL=http://localhost:5000/api/notices -t noticeboard-client:v1 client/\n```\nForget `--build-arg`, and Vite either falls back to a default from a `.env` file or bakes in `undefined` — and every API call from the browser silently breaks, with no error at build time to warn anyone.',
          whyItMatters:
            'This is consistently one of the most confusing points for MERN developers new to Docker, because Module 4 just trained the opposite instinct: "pass `-e` at `docker run` and it works." That instinct is simply wrong for anything Vite or React compiles into static files. Getting this backwards means the container builds fine, runs fine, and shows the page fine — and then every single API call silently fails or points at the wrong host, with nothing at build time to flag it.',
          steps: [
            'Add `ARG VITE_API_URL` in `client/Dockerfile`\'s build stage, placed before `RUN npm run build`.',
            'Confirm `client/src/api.js` reads `import.meta.env.VITE_API_URL` to build request URLs.',
            'Build the image, passing the value explicitly: `docker build --build-arg VITE_API_URL=http://localhost:5000/api/notices -t noticeboard-client:v1 client/`.',
            'Run the container and use the browser\'s dev tools Network tab to confirm requests go to the correct baked-in URL.',
            'Try `docker run -e VITE_API_URL=http://something-else ...` against the already-built image and observe it has zero effect.',
            'Rebuild with a different `--build-arg` value and confirm the app now calls the new URL only after the rebuild.',
          ],
          code: `# client/Dockerfile (build stage excerpt)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
RUN npm run build

# client/src/api.js
const API_URL = import.meta.env.VITE_API_URL
export async function fetchNotices(category) {
  const url = category ? \`\${API_URL}?category=\${category}\` : API_URL
  const res = await fetch(url)
  return res.json()
}

# Build with the value baked in at build time:
docker build --build-arg VITE_API_URL=http://localhost:5000/api/notices -t noticeboard-client:v1 client/

# This has NO effect on the already-built image -- the URL is already fixed:
docker run -d --name client --network noticeboard-net -p 5173:80 \\
  -e VITE_API_URL=http://a-different-host:5000/api/notices \\
  noticeboard-client:v1
# The browser bundle still calls http://localhost:5000/api/notices --
# the -e flag was never read by anything, because there is no live
# process left inside this container that reads process.env for this value.

# To actually change it, rebuild with a new build-arg instead:
docker build --build-arg VITE_API_URL=http://a-different-host:5000/api/notices -t noticeboard-client:v2 client/`,
          pitfalls: [
            '**Trying to fix a wrong API URL with `docker run -e VITE_API_URL=...`.** It has zero effect, because the value was already compiled into the static JS bundle at build time. Fix: change the value with `--build-arg` and rebuild the image instead.',
            '**Declaring `ARG VITE_API_URL` after the `RUN npm run build` line.** The build step runs before the `ARG` is even declared, so Vite never sees it. Fix: always declare `ARG` before the `RUN` instruction that needs it.',
            '**Forgetting to pass `--build-arg` at all when building.** Vite bakes in `undefined` (or an empty string), and the browser silently calls a broken URL, with no error at build time. Fix: always pass `--build-arg VITE_API_URL=...` explicitly.',
            '**Naming the variable without the required `VITE_` prefix**, e.g. `API_URL` instead of `VITE_API_URL`. Vite only exposes env vars prefixed `VITE_` to client code by design, as a guard against accidentally leaking server secrets into a public browser bundle. Fix: always prefix client-exposed variables with `VITE_`.',
            '**Assuming one built image can serve multiple environments (dev/staging/prod) by changing config at runtime.** Because the URL is baked in, an image built for `localhost:5000` cannot point at a different backend without a full rebuild. Fix: build a separate image per target API URL, each with its own `--build-arg`.',
            '**Confusing this with Module 4\'s server pattern and assuming all Docker environment variables behave the same way.** They do not — it depends entirely on whether the value is read by a live process (runtime) or compiled once into static output (build time). Fix: always ask "does something keep reading this after startup, or is it baked in once?" before choosing `-e` vs `--build-arg`.',
          ],
          tryIt:
            'Build `noticeboard-client:v1` twice with two different `--build-arg VITE_API_URL=...` values, run each resulting image, and check the Network tab in browser dev tools to confirm each image\'s bundle really does call a different fixed URL. Then run `docker run -e VITE_API_URL=http://something-else ...` against either image and confirm it changes nothing at all.',
          takeaway:
            'Vite bakes `VITE_`-prefixed environment variables into the static JS bundle at `vite build` time, so Dockerized frontends need `ARG` plus `--build-arg` at image build time — runtime `-e` flags, which work fine for the server, have no effect on an already-built frontend image.',
        },
        {
          id: 'm5-t5',
          title: 'Running the full three-container stack manually: mongo + server + client on noticeboard-net',
          explain:
            'With the client image built, start all three containers by hand in the correct order — `mongo`, then `server`, then `client` — each attached to the existing `noticeboard-net` network, and open `http://localhost:5173` to see the fully containerized Kundapura Notice Board running end to end for the very first time.',
          analogy:
            'Picture the start of a working day at **Kundapura harbour** during monsoon season, when three separate things have to happen in a strict order before the market can open. First the ice truck arrives and switches on the cold storage (`mongo`, the data layer). Then the boats dock and hand their catch to the weighing counter, which depends on that ice already being ready (`server`, which needs `mongo` reachable). Only then can the customer-facing stall at the front actually open for business, since it has nothing to sell until the counter behind it is stocked (`client`, which needs `server`\'s API reachable). Every single morning someone has to remember this exact order and get every truck, boat, and stall onto the same harbour premises — the same network. Miss the order, or forget one, and the whole morning falls apart. That growing tedium of doing it all by hand, every day, is exactly the itch Module 6\'s `docker-compose.yml` will scratch.',
          theory:
            'All three containers attach to `noticeboard-net`, the user-defined bridge network created back in Module 4 (`docker network create noticeboard-net`, if it does not already exist). The sequence, and why the order matters practically:\n\n1. **`mongo`** — started first, with its named volume for durable storage:\n```\ndocker run -d --name mongo --network noticeboard-net -v mongo-data:/data/db mongo:7\n```\n2. **`server`** — started next, since Express tries to connect to MongoDB by hostname (`mongo`) over the shared network as soon as it boots; it needs `mongo` already reachable to serve any API request successfully:\n```\ndocker run -d --name server --network noticeboard-net -p 5000:5000 \\\n  -e MONGO_URI=mongodb://mongo:27017/noticeboard \\\n  noticeboard-server:v1\n```\n3. **`client`** — started last, published at `-p 5173:80` (keeping the familiar dev port number on the host side, even though nginx actually listens on port 80 *inside* the container):\n```\ndocker run -d --name client --network noticeboard-net -p 5173:80 noticeboard-client:v1\n```\nNote a subtlety: the `client` container itself will start perfectly fine even if `server` is not up yet — nginx just serves the already-built static files regardless. What actually depends on `server` being reachable is the *in-browser* JavaScript, once the page loads and tries to fetch notices. So the real practical reason to start `server` before opening the browser is a good first impression, not a hard requirement for the `client` container to launch.\n\nWhat this sequence highlights, deliberately: three separate commands, each with several precise flags (image name, container name, network, port mappings, environment variables, volume mounts) that all have to be typed correctly, in the right order, every single time the stack needs to start. One fumbled flag anywhere and the stack is broken with no single obvious error pointing at the mistake.',
          whyItMatters:
            'This is the payoff topic of the whole course so far: three previously isolated containers now talk to each other over one shared user-defined network exactly the way separate real services would in any genuine deployment, and the browser-facing app is now 100% containerized — no locally-installed Node, npm, or MongoDB needed to run Kundapura Notice Board at all. But doing it by typing three long commands by hand, in order, every time, is exactly the pain point Docker Compose exists to solve — which is where Module 6 picks up immediately.',
          steps: [
            'Confirm `noticeboard-net` still exists: `docker network ls` (recreate with `docker network create noticeboard-net` if it was removed).',
            'Start `mongo`: `docker run -d --name mongo --network noticeboard-net -v mongo-data:/data/db mongo:7`.',
            'Start `server`: `docker run -d --name server --network noticeboard-net -p 5000:5000 -e MONGO_URI=mongodb://mongo:27017/noticeboard noticeboard-server:v1`.',
            'Start `client`: `docker run -d --name client --network noticeboard-net -p 5173:80 noticeboard-client:v1`.',
            'Run `docker ps` and confirm all three containers show `Up` status.',
            'Open `http://localhost:5173` in a browser, post a new notice, and confirm it appears in the list — proving client, server, and mongo all work together.',
          ],
          code: `# 1. Make sure the shared network exists (created back in Module 4):
docker network ls
# NAME               DRIVER
# noticeboard-net    bridge

# 2. Start mongo:
docker run -d --name mongo --network noticeboard-net \\
  -v mongo-data:/data/db mongo:7

# 3. Start server:
docker run -d --name server --network noticeboard-net -p 5000:5000 \\
  -e MONGO_URI=mongodb://mongo:27017/noticeboard \\
  noticeboard-server:v1

# 4. Start client:
docker run -d --name client --network noticeboard-net -p 5173:80 \\
  noticeboard-client:v1

# 5. Confirm all three are up:
docker ps
# CONTAINER ID   IMAGE                     PORTS                    NAMES
# 7a1c9e2f3b1a   noticeboard-client:v1     0.0.0.0:5173->80/tcp     client
# 4d8e0a91c2f0   noticeboard-server:v1     0.0.0.0:5000->5000/tcp   server
# 9f2b7a10d3e4   mongo:7                                            mongo

# 6. Open http://localhost:5173, then post a real notice, e.g.:
# Title: "Fish Market: Bangude prices up today"
# Category: Fish Market
# -> refresh and confirm it appears in the list, fetched live
#    from the fully containerized server + mongo.`,
          pitfalls: [
            '**Starting `client` before `server`/`mongo` exist and assuming the whole stack is broken.** The `client` container itself starts fine — nginx just serves static files regardless; only the in-browser API calls fail until `server` is reachable. Fix: start containers in dependency order and judge success only once all three are up and the page has been tested.',
            '**Forgetting `--network noticeboard-net` on the `client run` command.** The container still launches, but stays off the shared network, which breaks consistency and makes any future container-to-container debugging (like a `curl` from inside `client` to `server`) impossible. Fix: always include `--network noticeboard-net` on every container in this stack.',
            '**Reusing a container name that is already taken**, e.g. running `--name client` again when a stopped `client` container already exists from a previous attempt. Docker refuses with a "name already in use" error. Fix: `docker rm client` (or `docker rm -f client` if still running) before re-running, or simply `docker start client`.',
            '**Publishing the wrong port pair**, e.g. `-p 5173:5173` instead of `-p 5173:80`. nginx inside the container listens on port 80, not 5173 — mapping the wrong container-side port means the browser gets nothing back. Fix: always map host-port:container-port precisely — `5173:80` here.',
            '**Losing track of which three commands were run, in which order, after a reboot or a `docker system prune`.** Recreating the exact stack from memory invites typos in image names, flags, or environment values. Fix: keep the exact three commands written down somewhere until Module 6 replaces them with a single file.',
            '**Checking only `docker ps` (all three show "Up") and declaring success without opening the browser.** A container can be "Up" while nginx or the API call still silently fails. Fix: always do an end-to-end check — open `http://localhost:5173`, and actually post and view a real notice.',
          ],
          tryIt:
            'Start all three containers in order — `mongo`, `server`, `client` — all on `noticeboard-net`, confirm `docker ps` shows all three as `Up`, then open `http://localhost:5173`, post a new notice (e.g. a Fish Market price update), and confirm it appears in the list — proof the fully containerized three-service stack works end to end.',
          takeaway:
            'Running `mongo`, `server`, and `client` by hand with three separate, precisely-flagged `docker run` commands on the same network finally gets the whole stack containerized — and immediately reveals why nobody wants to do this from memory every single day.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm5-p1',
      type: 'Mini Project',
      title: 'Containerize the Frontend',
      domain: 'Frontend / Docker',
      duration: '4-5 hrs',
      description:
        'Write `client/Dockerfile` as a proper multi-stage build, add `client/nginx.conf` and `client/.dockerignore`, build the image with the correct `--build-arg`, and run the full three-container Kundapura Notice Board stack by hand for the first time — then post a real notice through the browser, proving `client`, `server`, and `mongo` all work together inside Docker.',
      tools: ['Docker Desktop', 'Node.js 20', 'Vite', 'nginx:alpine', 'Docker CLI'],
      blueprint: {
        overview:
          'Kundapura Notice Board has had a fully containerized `server` and `mongo` since Module 4, but the React `client` has still been running locally, outside Docker entirely. This project closes that gap: a multi-stage `client/Dockerfile` compiles the app with Node and then hands the finished static files to a slim nginx image to serve, a correctly written `nginx.conf` makes that nginx serve a single-page app properly, and a build-time `VITE_API_URL` gets baked into the compiled bundle so the browser knows where to call. The project ends with all three services — `client`, `server`, `mongo` — running together by hand for the first time, reachable at `http://localhost:5173`.',
        functionalRequirements: [
          'Write `client/Dockerfile` with two stages: `node:20-alpine` (named `build`) running `npm ci` and `npm run build`, and `nginx:alpine` copying only `client/dist/` into the web root.',
          'Write `client/nginx.conf` configuring nginx to serve the SPA correctly with a `try_files ... /index.html` fallback.',
          'Write `client/.dockerignore` excluding `node_modules`, `dist`, and anything else that should never be sent into the Docker build context.',
          'Build the image as `noticeboard-client:v1`, passing `--build-arg VITE_API_URL=http://localhost:5000/api/notices`.',
          'Start `mongo`, `server`, and `client` containers, in that order, all attached to `noticeboard-net`, with `client` published at `-p 5173:80`.',
          'Open `http://localhost:5173` in a browser, post a new notice, and confirm it appears in the list, fetched live from the containerized `server` and `mongo`.',
        ],
        technicalImplementation: [
          'Use `COPY package*.json ./` followed by `RUN npm ci` before `COPY . .` in the build stage, so the dependency-install layer caches correctly across rebuilds.',
          'Declare `ARG VITE_API_URL` before `RUN npm run build` so Vite can read and inline it into the compiled JS bundle.',
          'Use `COPY --from=build /app/dist /usr/share/nginx/html` in the nginx stage, plus `COPY nginx.conf /etc/nginx/conf.d/default.conf`.',
          'Confirm the nginx stage `EXPOSE`s port 80 and the final `CMD` runs nginx in the foreground (`nginx -g "daemon off;"`).',
          'Reuse the existing `noticeboard-net` network from Module 4 (`docker network create noticeboard-net` if it does not already exist) for all three containers.',
          'Verify with `docker images` that `noticeboard-client:v1` is dramatically smaller than a plain `node:20-alpine` image, and confirm with `docker run --rm noticeboard-client:v1 node --version` that no Node runtime made it into the final image.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Write the multi-stage Dockerfile',
            outcome: 'A `client/Dockerfile` with two named stages, buildable into `noticeboard-client:v1`.',
            prompt:
              'Write `client/Dockerfile` as a multi-stage build for the Kundapura Notice Board React frontend. Stage 1 should be named `build`, based on `node:20-alpine`: set a working directory, copy `package.json` and `package-lock.json` first, run `npm ci`, copy the rest of the source, declare an `ARG VITE_API_URL`, then run `npm run build`. Stage 2 should start fresh from `nginx:alpine`, copy only `/app/dist` from the build stage into nginx\'s web root, copy in an `nginx.conf`, expose port 80, and run nginx in the foreground. Explain why the final image contains no Node.js or npm at all.',
          },
          {
            step: 2,
            label: 'Write nginx.conf and .dockerignore',
            outcome: 'A `client/nginx.conf` with a working `try_files` fallback and a `client/.dockerignore` excluding `node_modules`/`dist`.',
            prompt:
              'Write `client/nginx.conf` for serving the built Vite SPA: a `server` block listening on port 80, `root` pointed at the built files, `index` set to `index.html`, and a `location /` block using `try_files $uri $uri/ /index.html;` so that any URL falls back to the app shell instead of 404ing. Also write `client/.dockerignore` excluding `node_modules`, `dist`, and any other files that should not be sent into the Docker build context. Explain in one sentence why a single-page app specifically needs the `try_files` fallback.',
          },
          {
            step: 3,
            label: 'Build the image with the correct build-arg',
            outcome: '`noticeboard-client:v1` built with `VITE_API_URL` correctly baked into the compiled bundle.',
            prompt:
              'Build the client image as `noticeboard-client:v1`, passing `--build-arg VITE_API_URL=http://localhost:5000/api/notices` so Vite bakes the correct API URL into the compiled JS bundle. Show the exact `docker build` command you ran. Then explain, in your own words, why passing this same URL as a `docker run -e` flag afterwards would NOT work the way it does for the `server` container in earlier modules.',
          },
          {
            step: 4,
            label: 'Run the full three-container stack and verify end-to-end',
            outcome: '`mongo`, `server`, and `client` all running on `noticeboard-net`, with a real notice posted and visible via `http://localhost:5173`.',
            prompt:
              'Start all three containers in dependency order on `noticeboard-net`: `mongo` (with its named volume), `server` (with its runtime `MONGO_URI` environment variable and published port 5000), and finally `client` (published at `5173:80`). Show the three exact `docker run` commands and the `docker ps` output confirming all three are `Up`. Then open `http://localhost:5173`, post a new notice (e.g. a Fish Market price update), and confirm it appears in the list — proving `client`, `server`, and `mongo` are all working together inside Docker for the first time.',
          },
        ],
        deliverable:
          'A working `client/Dockerfile` (multi-stage: `node:20-alpine` build, `nginx:alpine` serve), `client/nginx.conf`, and `client/.dockerignore`, plus a `noticeboard-client:v1` image built with the correct `--build-arg VITE_API_URL`. All three containers — `mongo`, `server`, and `client` — running together on `noticeboard-net`, with a real notice successfully posted and viewed through the fully containerized stack at `http://localhost:5173`. Notice, though, exactly what it took to get there: three separate `docker run` commands, in the right order, with the right flags, every single time you want to start the app — next module replaces all of that with one `docker-compose.yml`.',
      },
    },
  ],
  quiz: [
    {
      id: 'm5-q1',
      q: 'Why does the final noticeboard-client:v1 image not need Node.js or npm installed at all, even though the app is written in React and built with Vite?',
      options: [
        'Because nginx has a built-in JavaScript engine that replaces Node.js',
        'Because the multi-stage build\'s final stage starts fresh from nginx:alpine and only copies over the already-built static files from client/dist/, discarding Node, npm, and node_modules from the first stage entirely',
        'Because Vite automatically removes Node.js from the project after building',
        'Because Docker deletes Node.js from every image before running it',
      ],
      answer: 1,
    },
    {
      id: 'm5-q2',
      q: 'What problem does "try_files $uri $uri/ /index.html;" in client/nginx.conf solve?',
      options: [
        'It speeds up image builds by skipping unnecessary files',
        'It compresses static assets before sending them to the browser',
        'It stops any URL other than the exact homepage from returning a 404, by falling back to serving index.html so the single-page app\'s JavaScript can handle routing itself',
        'It automatically creates a new MongoDB collection for each route',
      ],
      answer: 2,
    },
    {
      id: 'm5-q3',
      q: 'You already built noticeboard-client:v1 with --build-arg VITE_API_URL=http://localhost:5000/api/notices. You now run it with "docker run -e VITE_API_URL=http://a-different-host:5000/api/notices ...". What happens?',
      options: [
        'The running container immediately starts calling the new URL, exactly like the server container does with its runtime environment variables',
        'The app crashes on startup because the environment variable conflicts with the build-arg',
        'Nothing changes — the URL was already compiled into the static JS bundle at build time, so a runtime -e flag has no effect; only rebuilding with a new --build-arg changes it',
        'nginx automatically detects the new value and re-compiles the JS bundle on the fly',
      ],
      answer: 2,
    },
    {
      id: 'm5-q4',
      q: 'In a Dockerfile containing "FROM node:20-alpine AS build" followed later by "COPY --from=build /app/dist /usr/share/nginx/html", what does --from=build refer to?',
      options: [
        'A separate Docker Hub repository named "build"',
        'The named earlier build stage (FROM node:20-alpine AS build), letting the later stage copy files out of it',
        'A build cache folder on the host machine',
        'An environment variable set inside nginx.conf',
      ],
      answer: 1,
    },
    {
      id: 'm5-q5',
      q: 'When starting the full stack by hand, why does mongo need to be started before server, and server before client, even though the client container itself will technically launch either way?',
      options: [
        'Docker enforces alphabetical startup order for containers on the same network',
        'server needs mongo reachable to serve API requests correctly, and the browser-facing client only shows real data once server is actually answering requests — starting them out of order does not stop the containers from launching, but it does break the notice board\'s real functionality until every dependency is up',
        'nginx refuses to start unless a MongoDB container is already running on the same host',
        'Vite requires MongoDB to be running before it can serve static files',
      ],
      answer: 1,
    },
  ],
}
