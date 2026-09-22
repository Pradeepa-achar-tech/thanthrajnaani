// Module 8 — Image Optimization & Security
// Kundapura Notice Board already runs end-to-end under Docker Compose (server,
// client, mongo, a shared network, a named volume, an override file for local
// dev). This module does not add features — it hardens what already exists
// before it ever ships anywhere public: shrinking the server image with a
// proper multi-stage build, tightening .dockerignore on both sides, dropping
// root inside the container, keeping secrets out of image layers for good,
// adding a self-describing HEALTHCHECK to both Dockerfiles, and taking a first
// look at vulnerability scanning with Docker Scout. Module 9 ships the result.

export const m8 = {
  id: 'm8',
  title: 'Image Optimization & Security',
  hours: 7,
  color: 'from-indigo-500/20 to-indigo-700/10',
  accent: 'indigo',
  description:
    'Kundapura Notice Board **works** — `docker compose up` brings up Mongo, the Express server, and the React/nginx client, all talking to each other correctly. But "works" and "production-ready" are not the same thing. This module audits exactly where the bytes in `noticeboard-server:v1` and `noticeboard-client:v1` are going, trims the server image with a real multi-stage build that throws away devDependencies, tightens `.dockerignore` on both sides, drops the container down to a **non-root user**, makes sure no secret ever lands inside an image layer, adds a proper `HEALTHCHECK` instruction to both Dockerfiles, and takes a first honest look at vulnerability scanning with `docker scout`. Nothing here changes what the app *does* — everything here changes whether you would trust it in front of real users. Module 9 is where these hardened images actually ship.',
  sections: [
    {
      id: 'm8-s1',
      title: 'Smaller, Safer Images',
      topics: [
        {
          id: 'm8-t1',
          title: 'Auditing image size with docker images and docker history; alpine vs full base images',
          explain:
            'Before optimizing anything, measure it. Use `docker images` to see the total size of `noticeboard-server:v1` and `noticeboard-client:v1`, then use `docker history` on each to see, layer by layer, exactly which instruction added how many megabytes.',
          analogy:
            'Picture the weighing counter at the **Kundapura fish market** at closing time, when the harbour committee wants to know why one crate is heavier than it should be. Nobody just shrugs and says "it feels heavy" — they put the crate on the scale (`docker images`, the total weight), then tip it out layer by layer onto a second smaller scale — ice first, then fish, then the wet gunny sack, then the crate itself (`docker history`, one line per layer) — until the one item quietly adding three extra kilos is caught red-handed. You cannot trim a crate you have not weighed.',
          theory:
            '`docker images` lists every image on your machine with its `REPOSITORY`, `TAG`, `IMAGE ID`, and — the number that matters here — `SIZE`. Run it today and you will likely see something like `noticeboard-server:v1` sitting around 180-220MB and `noticeboard-client:v1` (already multi-stage onto `nginx:alpine`) sitting much smaller, maybe 25-40MB. That gap alone tells you where the opportunity is.\n\n`docker history <image>` breaks that total down. Each row is one layer, corresponding roughly to one instruction in the Dockerfile, with its own `SIZE` column:\n```\ndocker history noticeboard-server:v1\nIMAGE          CREATED BY                                      SIZE\nabc123...       CMD ["node" "server.js"]                        0B\ndef456...       COPY . .                                        1.2MB\nghi789...       RUN npm ci                                      142MB   <- the big one\njkl012...       COPY package*.json ./                           4kB\nmno345...       WORKDIR /app                                    0B\npqr678...       (base image) node:20-alpine                     52MB\n```\nThat `RUN npm ci` layer is almost always the largest single line for a Node backend — it is pulling down every dependency **and every devDependency** (test runners, linters, build tools) into the same layer that ships to production.\n\nThe base image matters too. `node:20-alpine` (Alpine Linux, using `musl` libc, no unnecessary system packages) is roughly a tenth the size of `node:20` (full Debian-based). Kundapura Notice Board already uses `alpine` for both Dockerfiles — good — but "alpine base" and "small final image" are not the same claim: you can still ship an alpine-based image bloated with devDependencies and build tooling if you never actually separate the build stage from the run stage. That gap is exactly what the next topic fixes for the server.',
          whyItMatters:
            'You cannot responsibly trim what you have not measured, and "it feels big" is not a metric. Running this audit today gives you the concrete before-numbers for the mini project\'s size comparison table, and — more importantly — teaches you a habit: any time an image feels slower to pull or larger than expected, `docker images` + `docker history` is always the first move, on this project or any other.',
          steps: [
            'Run `docker images` and note the exact `SIZE` for `noticeboard-server:v1` and `noticeboard-client:v1`.',
            'Run `docker history noticeboard-server:v1` and identify the single largest layer.',
            'Run `docker history noticeboard-client:v1` and compare — notice how much smaller its layers already are thanks to the existing multi-stage build.',
            'Run `docker history --no-trunc noticeboard-server:v1` to see the full, untruncated command behind each layer.',
            'Write down the current server and client sizes somewhere — you will need these exact numbers again after hardening, for the before/after comparison.',
          ],
          code: `# Total size of every image on this machine, newest first:
docker images
# REPOSITORY            TAG   IMAGE ID       CREATED        SIZE
# noticeboard-server    v1    3f9a1c2b8e11   2 days ago     213MB
# noticeboard-client    v1    a71bc44de902   2 days ago      31MB
# mongo                 6     8b2e5f019ac3   3 weeks ago    712MB   <- pulled, not built by us

# Layer-by-layer breakdown of the server image — where did 213MB come from?
docker history noticeboard-server:v1
# IMAGE          CREATED BY                                SIZE
# <missing>      CMD ["node" "server.js"]                  0B
# <missing>      COPY . .                                  1.4MB
# <missing>      RUN npm ci                                158MB   <- includes devDependencies!
# <missing>      COPY package*.json ./                      4.1kB
# <missing>      WORKDIR /app                               0B
# <missing>      (base) node:20-alpine                     52.4MB

# Compare against the client, which already uses a multi-stage build:
docker history noticeboard-client:v1
# IMAGE          CREATED BY                                SIZE
# <missing>      CMD ["nginx" "-g" "daemon off;"]           0B
# <missing>      COPY --from=build /app/dist /usr/share...  892kB   <- only the built static files
# <missing>      (base) nginx:alpine                       23.6MB

# See the FULL (untruncated) command for every layer:
docker history --no-trunc noticeboard-server:v1`,
          pitfalls: [
            '**Reading `docker images` and stopping there.** Total size tells you *that* something is big, never *why*. Fix: always follow up with `docker history` on the specific image.',
            '**Assuming `alpine` in the base image name means the final image is automatically small.** A single-stage server Dockerfile on `node:20-alpine` that still runs `npm ci` (including devDependencies) can easily be 150MB+ despite the small base. Fix: check the actual layer sizes, don\'t trust the base image name alone.',
            '**Comparing image sizes across different machines or Docker versions and expecting identical numbers.** Layer compression and caching state differ. Fix: always compare "before" and "after" on the *same* machine, same session, for a fair before/after table.',
            '**Ignoring the `mongo:6` pulled image when totalling "our" footprint.** That size is not something this project controls or ships. Fix: focus the audit specifically on `noticeboard-server` and `noticeboard-client`, the two images this project builds.',
            '**Not re-running `docker history` after each change and just assuming it got smaller.** Optimizations can accidentally add size back (e.g. leftover cache layers). Fix: re-measure after every meaningful Dockerfile edit, not just once at the end.',
            '**Confusing image SIZE with the size of the build context sent to the daemon.** Those are two different numbers — one is what ships, the other is what gets uploaded before the build even starts. Fix: keep both in mind; the next topic\'s `--progress=plain` addresses build context specifically.',
          ],
          tryIt:
            'Run `docker images` and `docker history noticeboard-server:v1` on your machine right now. Write down the exact total size and the size of the largest single layer — you will compare these same two numbers again once the server Dockerfile is rewritten as multi-stage.',
          takeaway:
            '`docker images` shows total size, `docker history` shows which instruction caused it — always measure with both before optimizing, and an alpine base alone does not guarantee a small final image if the build is single-stage.',
        },
        {
          id: 'm8-t2',
          title: 'Multi-stage builds revisited: trimming devDependencies out of the final server image',
          explain:
            'Rewrite `server/Dockerfile` as a true multi-stage build: a `deps` stage that installs everything (including devDependencies, in case there is a build/lint step to run in CI), and a final, separate stage that only ever installs production dependencies with `npm ci --omit=dev`, copying in just the application source.',
          analogy:
            'Think of the **temple seva kitchen** the day before a big festival. One area is the loud, messy prep kitchen — every tool out, every spice jar open, extra hands chopping, tasting, testing recipes (that is the **build stage**, with every devDependency: linters, test runners, bundlers). But the food that actually reaches the **prasadam counter** the next morning comes from a clean, separate serving area holding only the finished dishes — none of yesterday\'s chopping boards, spice jars, or trial batches travel across (that is the **final stage**, with only production dependencies and the finished app). Multi-stage builds are simply refusing to let the messy prep kitchen\'s mess travel to the counter.',
          theory:
            'The client Dockerfile in this project is already multi-stage (a Node build stage producing static files, served from a lean `nginx:alpine` final stage). The **server** so far has been single-stage: one `FROM node:20-alpine`, one `RUN npm ci`, done — and that single `npm ci` installs *both* `dependencies` and `devDependencies` from `package.json` into the exact same layer that ships to production.\n\n**Why devDependencies are a real problem in the final image, not just clutter:**\n- **Size** — test frameworks, linters, and bundlers (Jest, ESLint, nodemon, etc.) can easily double or triple the `node_modules` footprint compared to production-only dependencies.\n- **Attack surface** — every extra package is extra code that *could* contain a vulnerability, and every vulnerability scanner (this module\'s last topic) will flag CVEs in packages that never even run in production, generating noise and, worse, real risk.\n- **Slower pulls and deploys** — a bigger image takes longer to push, pull, and start, directly slowing down Module 9\'s CI pipeline and deploys.\n\nThe fix is a proper multi-stage `server/Dockerfile`:\n```dockerfile\n# ---- deps stage: install everything, including devDependencies ----\nFROM node:20-alpine AS deps\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\n\n# ---- (optional) build stage: run lint/tests/build here in CI if needed ----\n# FROM deps AS build\n# COPY . .\n# RUN npm run build   # only relevant if the server has a TS/bundle step\n\n# ---- final stage: production dependencies only ----\nFROM node:20-alpine AS runner\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY --from=deps /app/node_modules ./node_modules_check_unused_if_any\nCOPY . .\nEXPOSE 5000\nCMD ["node", "server.js"]\n```\nIn practice, since Kundapura Notice Board\'s server is plain JavaScript with no build/transpile step, the cleanest version skips a separate `build` stage entirely and just runs `npm ci --omit=dev` directly in the final stage — the `deps` stage above is kept minimal and mainly useful if you later add a lint/test stage that CI runs *before* the final `FROM node:20-alpine AS runner` without that tooling ever reaching the shipped image. The key discipline: **whatever installs devDependencies must live in a stage that is never the final `FROM` the image ends on.**',
          whyItMatters:
            'This is the single biggest size win available on the server side — dropping devDependencies routinely cuts a Node image by 30-60%. It also directly narrows what a vulnerability scan has to worry about, since tools like `docker scout` only need to reason about packages that actually run in production. Getting multi-stage right here is the same skill, applied a second time, that already made the client image lean.',
          steps: [
            'Open the current `server/Dockerfile` and confirm it is single-stage with one `RUN npm ci`.',
            'Add a named `deps` stage (or keep it minimal) and a separate final stage using `AS runner`.',
            'In the final stage, replace `npm ci` with `npm ci --omit=dev` so only production dependencies install.',
            'Confirm `package.json` correctly separates real runtime packages (`express`, `mongoose`, `cors`) under `dependencies`, and tooling under `devDependencies`.',
            'Rebuild the image (`docker build -t noticeboard-server:v2 ./server`) and run `docker images` to compare the new size against the v1 baseline from the previous topic.',
            'Start the container from the new image and confirm the API still answers `GET /health` and `GET /api/notices` normally — trimming devDependencies must never touch runtime behaviour.',
          ],
          code: `# server/Dockerfile — BEFORE (single-stage, ships devDependencies too)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci                 # installs dependencies AND devDependencies
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]

# server/Dockerfile — AFTER (multi-stage, production deps only in the shipped image)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci                 # full install here, for any future lint/test/build stage

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev      # production dependencies ONLY reach the final image
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]

# Build both versions side by side and compare:
docker build -t noticeboard-server:v1-old ./server   # (rebuilt from the old Dockerfile, for comparison)
docker build -t noticeboard-server:v2 -f server/Dockerfile ./server

docker images | grep noticeboard-server
# noticeboard-server   v1-old   213MB
# noticeboard-server   v2       128MB    <- devDependencies gone`,
          pitfalls: [
            '**Running `npm ci --omit=dev` in a stage, then `COPY --from=deps` pulling the FULL node_modules from a different stage on top of it.** This silently reintroduces every devDependency you just tried to remove. Fix: be precise about which stage each `COPY --from=` line actually references, and only copy from the production-only install.',
            '**Forgetting `NODE_ENV=production`.** Some packages (including npm itself, in older versions) behave differently and can skip `--omit=dev` semantics without it. Fix: set `ENV NODE_ENV=production` in the final stage explicitly, and still pass `--omit=dev` — belt and suspenders.',
            '**Adding a `build`/lint stage "just in case" for a plain-JS server with no build step.** Extra stages that do nothing add build time for zero benefit. Fix: only add a build stage if there genuinely is a compile/bundle/transpile step (e.g. TypeScript).',
            '**Not rebuilding from a clean cache after restructuring the Dockerfile.** Docker\'s layer cache can mask whether the new structure actually shrank anything. Fix: run `docker build --no-cache` at least once to get an honest size reading.',
            '**Miscategorising a runtime package as a devDependency (or vice versa) in `package.json`.** `--omit=dev` then either strips something the app actually needs at runtime (crash on start) or ships something it never needed. Fix: double check `dependencies` vs `devDependencies` in `package.json` matches what `server.js` actually `require()`s at runtime.',
            '**Assuming a smaller image automatically means a faster-starting container.** Size and cold-start time are related but not identical — always still boot-test the new image, not just measure it. Fix: run `docker run` against the new image and confirm `/health` responds before declaring victory.',
          ],
          tryIt:
            'Rewrite `server/Dockerfile` with a `deps` stage and a final `runner` stage using `npm ci --omit=dev`, build it as `noticeboard-server:v2`, and run `docker images` to record the new size next to the `v1` baseline you measured in the previous topic — you need both numbers for the mini project\'s comparison table.',
          takeaway:
            'A multi-stage server Dockerfile that installs full dependencies in one stage but ships only `npm ci --omit=dev` in the final stage routinely cuts image size by 30-60% and shrinks the attack surface, at zero cost to runtime behaviour.',
        },
        {
          id: 'm8-t3',
          title: 'Writing a tight .dockerignore and confirming it with docker build --progress=plain',
          explain:
            'Audit and tighten `.dockerignore` in both `client/` and `server/` so secrets, logs, coverage reports, and `.git` history never even enter the build context, then prove it with `docker build --progress=plain`, which shows exactly what gets sent to the Docker daemon before the build starts.',
          analogy:
            'Before the ferry at **Gangolli** pushes off, the crew does not let every crate on the dock aboard just because it happened to be sitting near the gangway — old fishing nets, a leaking oil drum, yesterday\'s newspapers stay behind. Only the crates on the actual manifest get loaded. A `.dockerignore` file is that gangway checklist for your build: it decides, before the boat (the build context) even leaves the dock, what is allowed on board at all — long before any `COPY` instruction gets a say.',
          theory:
            'Every `docker build` starts by packaging the entire build context (the folder you point the build at, e.g. `./server`) and sending it to the Docker daemon — **before** a single line of the Dockerfile runs. `.dockerignore` filters that context, exactly the way `.gitignore` filters what git tracks, using the same glob-pattern syntax.\n\nA thin or missing `.dockerignore` causes two real problems:\n- **Slower builds and bigger context** — sending `node_modules/`, `.git/`, or `coverage/` to the daemon wastes real seconds (or minutes) on every build, especially over a remote Docker context.\n- **Secrets accidentally reaching a layer** — if `.env` is not excluded and some later Dockerfile line does a broad `COPY . .`, the actual secret file lands inside an image layer, and (as the very next topic covers) that is essentially permanent.\n\nFor `server/.dockerignore`, a tight version should include at minimum:\n```\nnode_modules\nnpm-debug.log\n.env\n.env.*\n!.env.example\n*.log\ncoverage\n.git\n.gitignore\nDockerfile\n.dockerignore\nREADME.md\n```\nFor `client/.dockerignore`, similarly:\n```\nnode_modules\ndist\nbuild\n.env\n.env.*\n!.env.example\n*.log\ncoverage\n.git\n.gitignore\n```\nNotice the `!.env.example` line — the `!` negates the ignore, so the *template* file (safe, no real secrets) still reaches the build context if a Dockerfile step ever wants to reference it, while the real `.env` stays excluded.\n\nThe way to actually **verify** this rather than assume it, is `docker build --progress=plain --no-cache -t noticeboard-server:audit ./server`. The `--progress=plain` flag prints every build step\'s full, unbuffered output — including, right at the top, a line reporting the exact size of the context that got transferred: `transferring context: 2.14MB`. Run it once before tightening `.dockerignore` and once after; a shrinking "transferring context" number is hard proof the ignore rules are actually working, not just present in a file nobody checked.',
          whyItMatters:
            'A `.dockerignore` gap is one of the most common, most avoidable ways a secret ends up baked into a shipped image — and it costs nothing to get right, just five minutes of discipline. Confirming it with `--progress=plain` turns "I assume the ignore file works" into "I watched the exact bytes transferred and confirmed it," which is the same measure-don\'t-assume habit this whole module is built on.',
          steps: [
            'Open (or create) `server/.dockerignore` and `client/.dockerignore` side by side.',
            'Add entries for `node_modules`, `.env` / `.env.*` (with `!.env.example` to keep the template), `*.log`, `coverage`, `.git`, `.gitignore`, and the Dockerfile/`.dockerignore` files themselves.',
            'Run `docker build --progress=plain --no-cache -t noticeboard-server:audit ./server` and note the "transferring context" size reported near the top of the output.',
            'Temporarily remove one important line (e.g. `node_modules`) from `server/.dockerignore`, rebuild, and watch the transferred context size jump — then put the line back.',
            'Repeat the same `--progress=plain` check for `client/.dockerignore`.',
            'Confirm `.env` specifically never appears anywhere in `docker build`\'s plain output for either service.',
          ],
          code: `# server/.dockerignore — tight version
node_modules
npm-debug.log
.env
.env.*
!.env.example
*.log
coverage
.git
.gitignore
Dockerfile
.dockerignore
README.md

# client/.dockerignore — tight version
node_modules
dist
build
.env
.env.*
!.env.example
*.log
coverage
.git
.gitignore

# Verify with --progress=plain: watch the ACTUAL bytes sent as build context
docker build --progress=plain --no-cache -t noticeboard-server:audit ./server
# #1 [internal] load build context
# #1 transferring context: 1.87MB done   <- should be small, no node_modules/.git inside
# #2 [internal] load .dockerignore
# ...

# Prove it the hard way — comment out "node_modules" from .dockerignore and rebuild:
docker build --progress=plain --no-cache -t noticeboard-server:leaky ./server
# #1 transferring context: 96.40MB done   <- node_modules leaked into the context!`,
          pitfalls: [
            '**Having no `.dockerignore` at all in one of the two folders.** Whichever one is missing it sends its entire `node_modules`, `.git` history, and any stray `.env` straight into the build context. Fix: create one in *both* `client/` and `server/` — never assume one covers the other.',
            '**Excluding `.env` but forgetting the negation for `.env.example`.** A blanket `.env*` pattern with no `!.env.example` line also blocks the safe template file some setups intentionally copy in. Fix: use `.env` / `.env.*` plus an explicit `!.env.example` if the template needs to travel with the image.',
            '**Assuming `.gitignore` already covers this.** `.dockerignore` is a separate file with its own rules — git ignoring `.env` says nothing about whether Docker\'s build context ignores it too. Fix: maintain both files deliberately; do not assume one implies the other.',
            '**Never actually running `--progress=plain` to check.** A `.dockerignore` file with the right lines in it is not proof they are being applied correctly (a typo\'d pattern silently does nothing). Fix: run the plain-progress build at least once after any `.dockerignore` change and read the transferred-context size.',
            '**Excluding the Dockerfile itself from git but not realizing `.dockerignore` does not affect what git tracks.** These are two independent ignore systems serving different purposes. Fix: keep clear in your head — `.gitignore` protects the repository, `.dockerignore` protects the build context/image.',
            '**Leaving `coverage/` or test-report folders un-ignored "because they are small."** They add unnecessary bytes and, worse, can leak internal file paths or test data into an image layer. Fix: ignore build/test artifacts you would never want inside a shipped container regardless of size.',
          ],
          tryIt:
            'Run `docker build --progress=plain --no-cache -t noticeboard-server:audit ./server` and read the reported "transferring context" size. Then temporarily delete the `node_modules` line from `server/.dockerignore`, rebuild, and compare the new (much larger) transferred size — put the line back afterward and confirm the size returns to normal.',
          takeaway:
            '`.dockerignore` decides what reaches the build context before a single Dockerfile instruction runs — write it deliberately for both `client/` and `server/`, and confirm it actually works with `docker build --progress=plain` rather than assuming the file is correct.',
        },
      ],
    },
    {
      id: 'm8-s2',
      title: 'Locking Down Containers',
      topics: [
        {
          id: 'm8-t4',
          title: 'Running as a non-root user (USER node) and why root-in-container is a real risk',
          explain:
            'Add `USER node` near the end of `server/Dockerfile` so the Express process actually runs as the unprivileged `node` user shipped inside the official Node image, instead of as root — the default if `USER` is never set.',
          analogy:
            'At the **prasadam counter** during a festival, whoever hands out food wears a specific apron and stands behind the counter — they can serve prasadam, refill the plate stack, wipe the counter. They cannot walk into the temple\'s locked accounts office next door and start rewriting the donation ledger, because that was never part of their role. Running a container **as root** is like handing that same counter volunteer a master key to the entire temple complex "just in case" — almost never needed for the job, and catastrophic the one time something goes wrong and that key gets used by someone who should not have it.',
          theory:
            'Unless a Dockerfile explicitly sets `USER`, every process inside the container runs as **root** — UID `0` — by default, even though that container is not actually a virtual machine and does not have its own fully separate kernel. Containers share the host\'s kernel; the isolation between "root inside the container" and "root on the host" is provided by Linux namespaces and cgroups, not by a hard hardware boundary the way a VM\'s hypervisor provides one.\n\nThat distinction is exactly why **root-in-container is a real risk, not a theoretical one**: a **container breakout** — a vulnerability in the container runtime, a misconfigured volume mount, or a kernel exploit — that lets an attacker escape the container\'s isolation lands them on the host **as root**, not as some restricted user. If the compromised process was already running as an unprivileged user inside the container, the same breakout is far less catastrophic — the blast radius is smaller by definition, even before considering a specific escape vulnerability.\n\nThe official `node:20-alpine` image conveniently already ships a pre-created, unprivileged **`node` user** (and matching `node` group) for exactly this purpose — no need to create one from scratch:\n```dockerfile\n# ... earlier stages/instructions ...\nCOPY . .\nUSER node\nEXPOSE 5000\nCMD ["node", "server.js"]\n```\n`USER node` must come **after** any instructions that need root privileges — typically `COPY`/`RUN npm ci`, since file ownership and package installs are simplest as root — and it should be one of the last instructions before `CMD`, so the actual running process drops privileges for good.\n\nOne practical wrinkle worth knowing: if the server ever needs to write files at runtime (e.g. writing to a mounted volume, or listening on a port below 1024), running as a non-root user can require extra care — file/folder ownership must allow the `node` user to write, and ports below 1024 are actually blocked for non-root processes entirely. Kundapura Notice Board\'s server listens on port `5000` (well above 1024) and does no runtime filesystem writes of its own beyond what Mongo already handles separately, so `USER node` here is a clean, low-friction win.',
          whyItMatters:
            'This is one of the highest-value, lowest-cost hardening steps available — a single line, `USER node`, meaningfully shrinks what an attacker can do if anything else in the stack ever gets compromised. Security engineers and container scanners (including `docker scout`, later in this module) specifically flag images that still run as root; fixing it now means Kundapura Notice Board passes that basic bar before Module 9 ever pushes it somewhere public.',
          steps: [
            'Open `server/Dockerfile` and confirm there is currently no `USER` instruction (meaning it defaults to root).',
            'Add `USER node` after the `COPY . .` and dependency-install instructions, but before `EXPOSE`/`CMD`.',
            'Rebuild the image and run `docker run --rm noticeboard-server:v2 whoami` — confirm it prints `node`, not `root`.',
            'Start the full stack via Compose and confirm the API still serves `/health` and `/api/notices` correctly running as the non-root user.',
            'If the client\'s nginx stage also runs a process that could safely drop privileges, note it as an optional stretch goal — nginx\'s official alpine image has its own default user conventions worth checking separately.',
          ],
          code: `# server/Dockerfile — final stage, now dropping to a non-root user
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node                 # <- drop from root to the pre-created, unprivileged 'node' user
EXPOSE 5000
CMD ["node", "server.js"]

# Confirm it actually took effect:
docker build -t noticeboard-server:v2 ./server
docker run --rm noticeboard-server:v2 whoami
# -> node   (NOT root)

docker run --rm noticeboard-server:v2 id
# -> uid=1000(node) gid=1000(node) groups=1000(node)

# Compare against the OLD image, still defaulting to root:
docker run --rm noticeboard-server:v1-old whoami
# -> root`,
          pitfalls: [
            '**Putting `USER node` before `COPY . .` or `RUN npm ci`.** Those steps then run as the unprivileged user and can fail with permission errors trying to write into `/app`. Fix: keep `USER node` as one of the LAST instructions, right before `EXPOSE`/`CMD`.',
            '**Assuming containers are as isolated as full VMs, so root-in-container "doesn\'t really matter."** Containers share the host kernel via namespaces/cgroups, not a hypervisor boundary — a breakout as root is meaningfully worse than a breakout as an unprivileged user. Fix: treat root-in-container as a real, if lower-probability, risk worth mitigating cheaply.',
            '**Forgetting that ports below 1024 need root.** A non-root process cannot bind to, say, port 80 directly. Fix: keep the app listening on an unprivileged port (Kundapura Notice Board already uses 5000) and let a reverse proxy or Compose port mapping handle any public-facing port 80/443.',
            '**Not verifying the change actually applied.** A typo\'d `USER` line, or one placed in the wrong stage of a multi-stage build, silently does nothing. Fix: always run `docker run --rm <image> whoami` after adding `USER` to confirm.',
            '**Mounting a host volume the `node` user cannot write to.** Non-root processes are subject to real filesystem permissions, unlike root, which can write almost anywhere. Fix: check volume/folder ownership matches the container\'s non-root UID if runtime writes are needed.',
            '**Adding `USER node` to the client\'s nginx-based Dockerfile without checking nginx\'s own conventions first.** nginx has its own default worker-process user handling and blindly copying the same pattern can break the web server. Fix: research nginx-specific non-root guidance separately rather than assuming an identical fix applies.',
          ],
          tryIt:
            'Add `USER node` to `server/Dockerfile`, rebuild, and run `docker run --rm noticeboard-server:v2 whoami` — confirm the output changes from `root` to `node`, then bring up the full Compose stack and confirm the API still works normally.',
          takeaway:
            'A container defaults to running as root unless a Dockerfile says otherwise; adding `USER node` — free, since the official Node image already ships that user — meaningfully shrinks the damage a container breakout could do.',
        },
        {
          id: 'm8-t5',
          title: 'Secrets: never bake them into images, .env in .gitignore, and a look at Docker secrets/BuildKit --secret',
          explain:
            'Confirm the discipline already in place — real credentials only ever reach the container at runtime, via `-e`, `env_file:`, or Compose, never `COPY`d into an image — and understand why that discipline matters at the layer level, plus a first look at the more advanced `--secret` / Compose `secrets:` mechanisms for genuinely sensitive production credentials.',
          analogy:
            'During **monsoon season**, the harbour committee at Kundapura keeps the real safe combination written only on a slip of paper locked in a drawer, handed verbally to whoever is on duty that specific day — it is never carved into the wooden signboard bolted to the office wall for everyone passing by to read. An image layer is that signboard: permanent, public once shared, and readable by anyone who later inspects it, plank by plank, even if you paint over one plank afterward. Runtime secrets — handed to the container fresh each time it starts — are the verbal, day-of combination: never permanently fixed to anything that travels.',
          theory:
            'This is the single most consequential rule in this module: **a Docker image layer is immutable and, in practice, permanent.** If a `COPY .env .` instruction (or a hardcoded `ENV MONGO_PASSWORD=...`) ever runs, that secret is baked into that layer\'s filesystem diff **forever** — even if a *later* instruction in the same Dockerfile deletes the file. Each layer is a separate, stacked diff; deleting a file in layer 5 does not erase it from layer 3, it only hides it from the final merged view. Anyone with the image (`docker save`, a registry pull, `docker history`, or simply `docker run --rm <image> cat old-file-path` against an intermediate layer ID) can recover it. This is exactly why the `.dockerignore` audit two topics ago mattered so much.\n\nKundapura Notice Board already follows the correct pattern: `.env` holds real local values, `.env.example` is the safe, secret-free template committed to git, `.env` itself is listed in `.gitignore` **and** `.dockerignore`, and real values reach the running container only via Compose\'s `env_file:` / `environment:` keys at **container start**, never via a Dockerfile `COPY`. This is correct for local development and staging.\n\nFor genuinely sensitive production credentials — a real production Mongo password, a signing key — there are two more advanced mechanisms worth knowing exist, even if this project\'s current scale does not strictly require them yet:\n- **BuildKit\'s `--secret` flag**: lets a *build* step temporarily mount a secret file into a single `RUN` instruction\'s filesystem, used and then discarded, **never** written into any layer — useful if a build step itself needs a credential (e.g. a private npm registry token) without permanently baking it in. Example: `docker build --secret id=npmtoken,src=./npm_token.txt .` paired with `RUN --mount=type=secret,id=npmtoken ...` in the Dockerfile.\n- **Compose\'s top-level `secrets:` key**: mounts a secret as a file inside the running container\'s filesystem (commonly at `/run/secrets/<name>`) rather than as a plain environment variable — slightly more resistant to accidental leakage via `docker inspect` or process-listing tools that can sometimes surface environment variables.\n\nFor this project\'s current stage, `env_file:` and `-e` remain the right, honest answer — these two mechanisms are presented as "the more advanced tool for later," not a requirement to adopt today.',
          whyItMatters:
            'Getting this wrong is one of the most common real-world causes of leaked production credentials — a `.env` accidentally `COPY`\'d into a public image on Docker Hub is trivially recoverable by anyone who pulls it, no hacking required, just `docker history` and a layer inspection. Understanding *why* it is permanent (immutable stacked layers), not just *that* it is forbidden, is what makes the rule stick under pressure, e.g. when a deploy is late and "just copy the `.env` in for now" feels tempting.',
          steps: [
            'Confirm `.env` is listed in both `.gitignore` and `server/.dockerignore` / `client/.dockerignore`.',
            'Confirm neither Dockerfile contains a `COPY .env` line or a hardcoded `ENV MONGO_PASSWORD=...`-style instruction.',
            'Confirm `docker-compose.yml` supplies real values via `env_file:` (pointing at `.env`) rather than baking anything into an image.',
            'As a deliberate audit, run `docker history --no-trunc noticeboard-server:v2` and read every layer, confirming no secret-looking string appears anywhere.',
            'Read (without necessarily implementing) one example of BuildKit\'s `--secret` flag and Compose\'s `secrets:` key, and identify one scenario in this project where either would apply if it grew (e.g. a real production Mongo Atlas password).',
          ],
          code: `# .gitignore AND server/.dockerignore AND client/.dockerignore should all contain:
.env
.env.*
!.env.example

# docker-compose.yml — the CORRECT way secrets reach the server container (runtime, not build):
services:
  server:
    build: ./server
    env_file:
      - .env              # values injected at container START, never baked into the image
    depends_on:
      mongo:
        condition: service_healthy

# WRONG — never do this in a Dockerfile:
# COPY .env .                          <- permanently bakes secrets into a layer
# ENV MONGO_PASSWORD=supersecret123    <- visible forever via 'docker history'

# Prove secrets never leak into a layer — read the FULL history of the server image:
docker history --no-trunc noticeboard-server:v2
# (should show no .env content, no hardcoded password strings anywhere)

# A first look at BuildKit's --secret flag, for a BUILD step that needs a credential
# (e.g. a private registry token), without it ever landing in a layer:
# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=secret,id=npm_token \\
    NPM_TOKEN=$(cat /run/secrets/npm_token) npm ci
# built with: docker build --secret id=npm_token,src=./npm_token.txt .

# A first look at Compose's top-level secrets: key (for a real prod Mongo password):
secrets:
  mongo_root_password:
    file: ./secrets/mongo_root_password.txt
services:
  mongo:
    secrets:
      - mongo_root_password
    environment:
      MONGO_INITDB_ROOT_PASSWORD_FILE: /run/secrets/mongo_root_password`,
          pitfalls: [
            '**"It\'s fine, I deleted the `.env` file in a later `RUN rm` instruction."** Deleting a file in a later layer does not remove it from the earlier layer\'s diff — it is still recoverable from the image\'s layer history. Fix: never `COPY` the secret in at all; there is no safe "copy then delete" pattern.',
            '**Hardcoding a real password directly in a Dockerfile `ENV` instruction "just for now."** `docker history` shows environment instructions in plain text, permanently, to anyone with the image. Fix: only ever set real secrets via runtime `-e` / `env_file:` / Compose `secrets:`, never a Dockerfile `ENV` with a real value.',
            '**Forgetting `.dockerignore` even though `.gitignore` already excludes `.env`.** These are separate systems — a Dockerfile `COPY . .` with no `.dockerignore` entry for `.env` still happily copies it into the build context and, from there, potentially into a layer. Fix: mirror the relevant `.gitignore` secret-exclusion lines into `.dockerignore` explicitly.',
            '**Assuming a private Docker Hub repo makes baked-in secrets acceptable.** "Private" reduces exposure, it does not eliminate the risk of the image ever being pulled by more people/tools than intended, or the repo later flipping to public by mistake. Fix: treat "never bake secrets into a layer" as a rule with no exceptions, regardless of registry visibility.',
            '**Committing `.env` to git once, then adding it to `.gitignore` afterward.** `.gitignore` only prevents *future* commits — the secret is still sitting in git history. Fix: if this ever happens, rotate the leaked credential immediately; do not rely on removing the file from the latest commit alone.',
            '**Reaching for BuildKit `--secret` or Compose `secrets:` before actually needing them, adding complexity for a small project.** Fix: for Kundapura Notice Board\'s current scale, plain `env_file:`/`-e` is the right, sufficient answer — reserve the advanced mechanisms for when a build step itself needs a credential, or a real production secret genuinely warrants the extra protection.',
          ],
          tryIt:
            'Run `docker history --no-trunc noticeboard-server:v2` and read every single layer end to end, confirming no `.env` content or hardcoded credential string appears anywhere. Then write, in your own words, one sentence explaining why deleting a file in a later Dockerfile instruction does not remove it from an earlier layer.',
          takeaway:
            'A secret that ever enters a Dockerfile `COPY` or `ENV` instruction is permanently recoverable from the image\'s layer history — real credentials belong only in runtime `-e`/`env_file:`/Compose, with BuildKit `--secret` and Compose `secrets:` as the more advanced tools for build-time or especially sensitive production credentials.',
        },
        {
          id: 'm8-t6',
          title: 'HEALTHCHECK in the Dockerfile and a first look at vulnerability scanning with docker scout',
          explain:
            'Add a `HEALTHCHECK` instruction directly inside both `server/Dockerfile` and `client/Dockerfile` so each image is self-describing about its own liveness regardless of how or where it is run, then run `docker scout quickview` against both images as a first, honest look at known-CVE scanning before anything ships publicly.',
          analogy:
            'A fishing boat leaving the **Kundapura harbour** carries its own compass and bilge-pump warning light built in — it does not depend on the harbour master radioing it every hour to ask "are you still afloat?" That built-in warning light works the same way whether the boat is docked at Kundapura, anchored off Gangolli, or out past the horizon — it is a property of the *boat*, not of whichever harbour happens to be watching. A Dockerfile `HEALTHCHECK` is that built-in light: the image itself knows how to report its own health, independent of whether Compose, a Kubernetes cluster, or a bare `docker run` is the one asking.',
          theory:
            'Since an earlier module, `docker-compose.yml` already defines a Compose-level `healthcheck:` for the `server` service (used to make `depends_on: condition: service_healthy` work correctly for the client). That Compose-level check is powerful, but it lives in `docker-compose.yml`, **outside** the image — if this same image were ever run with a bare `docker run`, deployed to a platform that ignores Compose files entirely, or pushed to Docker Hub for someone else to run their own way (exactly what Module 9 does), that external health knowledge does not travel with it.\n\nA Dockerfile-level `HEALTHCHECK` instruction fixes that — it makes the image **self-describing** about its own liveness, baked into the image itself, independent of the orchestrator:\n```dockerfile\n# server/Dockerfile — final stage\nHEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\\n  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1\n```\n`wget` (present by default on Alpine, unlike `curl` which needs a separate install) hits the same `GET /health` liveness endpoint the Express server already exposes. `--interval` sets how often Docker checks, `--timeout` how long one check may take, `--start-period` a grace window while the app boots before failures count against it, and `--retries` how many consecutive failures before Docker marks the container `unhealthy`.\n\nThe client\'s nginx-based image gets an equivalent check against its own root:\n```dockerfile\n# client/Dockerfile — final stage\nHEALTHCHECK --interval=30s --timeout=3s --retries=3 \\\n  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1\n```\nOnce added, `docker ps` itself shows a `(healthy)` / `(unhealthy)` status for any container run from these images, with no Compose file involved at all — proof the health awareness now genuinely lives in the image.\n\nThe second half of this topic is **vulnerability scanning**. `docker scout quickview noticeboard-server:v2` (Docker Scout ships built into modern Docker Desktop/CLI) gives a fast summary of known CVEs in the image\'s base layers and dependencies, roughly: how many critical/high/medium vulnerabilities, and a comparison against the image\'s most recent tag if one was previously scanned. `docker scout cves noticeboard-server:v2` goes further, listing each specific CVE, the package it lives in, and often whether a fixed version is already available. This is not a magic guarantee of safety — it is a sanity check against **known, catalogued** vulnerabilities, run as a deliberate step **before** ever pushing an image somewhere public, which is exactly the habit Module 9\'s Docker Hub push will lean on.',
          whyItMatters:
            'A Dockerfile `HEALTHCHECK` means Kundapura Notice Board\'s images carry their own health awareness anywhere they run — a genuine requirement once Module 9 pushes them to Docker Hub for use outside this specific Compose setup. `docker scout` closes the loop on this entire module: after shrinking the attack surface (fewer devDependencies) and reducing privilege (non-root), a scan gives you a concrete, evidence-based answer to "is there anything already-known-bad in here?" before anyone else ever pulls the image.',
          steps: [
            'Add a `HEALTHCHECK` instruction to the end of `server/Dockerfile`, targeting `GET /health` with `wget --spider`.',
            'Add an equivalent `HEALTHCHECK` to the end of `client/Dockerfile`, targeting nginx\'s root `/`.',
            'Rebuild both images and run each standalone with `docker run -d` (no Compose), then watch `docker ps` for a `(healthy)` status appearing after the start period.',
            'Deliberately break the server\'s health endpoint temporarily (e.g. stop the process) and confirm `docker ps` reports `(unhealthy)` after enough retries fail.',
            'Run `docker scout quickview noticeboard-server:v2` and `docker scout quickview noticeboard-client:v1`, and read the critical/high CVE counts for each.',
            'Run `docker scout cves noticeboard-server:v2` for the fuller CVE list and identify whether any listed vulnerability already has a fixed package version available.',
          ],
          code: `# server/Dockerfile — final stage, now with a self-describing HEALTHCHECK
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1
CMD ["node", "server.js"]

# client/Dockerfile — final nginx stage, also self-describing
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Run standalone (no Compose) and watch the image describe its OWN health:
docker build -t noticeboard-server:v2 ./server
docker run -d --name notice-server-check -p 5000:5000 noticeboard-server:v2
docker ps
# CONTAINER ID   IMAGE                    STATUS
# 7a1f9c...      noticeboard-server:v2    Up 35 seconds (healthy)

# A first look at vulnerability scanning before anything ships publicly:
docker scout quickview noticeboard-server:v2
#   Image        noticeboard-server:v2
#   Vulnerabilities   0C  2H  5M  9L
#   Base image        node:20-alpine  ->  update available: node:20.15-alpine

docker scout cves noticeboard-server:v2
# CVE-2024-XXXXX  HIGH    package: some-transitive-dep@1.2.0  fixed in: 1.2.4

docker scout quickview noticeboard-client:v1`,
          pitfalls: [
            '**Relying only on the Compose-level `healthcheck:` and never adding one to the Dockerfile itself.** The moment this image runs anywhere Compose is not involved (a bare `docker run`, Module 9\'s CI, another orchestrator), that health awareness disappears. Fix: add `HEALTHCHECK` directly to both Dockerfiles so it is a property of the image, not just this Compose setup.',
            '**Using `curl` in the `HEALTHCHECK CMD` on an Alpine base without installing it first.** Alpine does not ship `curl` by default; the healthcheck fails immediately with "command not found," reporting `unhealthy` even though the app is fine. Fix: use `wget` (already present on `alpine`) or explicitly `RUN apk add curl` if you specifically prefer it.',
            '**Setting no `--start-period` (or too short one) for the server.** If the app takes a few seconds to connect to Mongo and start listening, early checks fail and count toward `--retries` before the app even had a fair chance. Fix: give a `--start-period` grace window that comfortably covers real startup time.',
            '**Treating `docker scout quickview` as a pass/fail security certification.** It reports **known, catalogued** CVEs in what it can see — it says nothing about custom application-logic bugs and cannot catch an unknown/zero-day issue. Fix: treat it as one useful, honest signal among several, not a guarantee of safety.',
            '**Ignoring every "medium" and "low" CVE and only reacting to "critical."** Some medium-severity findings in a directly-exposed base image package are still worth a quick look, especially if a fixed version is trivially available. Fix: at minimum skim the full `docker scout cves` list, not just the quickview summary counts.',
            '**Running a vulnerability scan once and never again.** Base images and dependencies get new CVEs disclosed against them constantly, even with the exact same Dockerfile. Fix: treat scanning as a habit to repeat before each meaningful release, not a one-time checkbox — Module 9\'s CI pipeline is the natural place to automate this.',
          ],
          tryIt:
            'Add matching `HEALTHCHECK` instructions to both Dockerfiles, rebuild, run each container standalone (no Compose) with `docker run -d`, and watch `docker ps` show `(healthy)` after the start period. Then run `docker scout quickview` against both images and note the critical/high vulnerability counts for each.',
          takeaway:
            'A Dockerfile `HEALTHCHECK` makes an image self-describing about its own liveness anywhere it runs, independent of Compose; `docker scout` gives an honest, repeatable first check for known CVEs in base images and dependencies before an image ever ships publicly.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm8-p1',
      type: 'Mini Project',
      title: 'Harden Before You Ship',
      domain: 'Security / Optimization',
      duration: '3-4 hrs',
      description:
        'Take Kundapura Notice Board\'s two working Dockerfiles and put them through a full production-hardening pass: rebuild the server as a real multi-stage image that drops devDependencies, tighten `.dockerignore` on both sides and prove it with `--progress=plain`, run the container as the non-root `node` user, add a `HEALTHCHECK` to both Dockerfiles, and scan both final images with `docker scout quickview`. The deliverable is not just hardened Dockerfiles — it is a documented before/after `docker images` size comparison proving the work actually moved the numbers.',
      tools: ['Docker', 'Docker Compose', 'Docker Scout', 'BuildKit'],
      blueprint: {
        overview:
          'Kundapura Notice Board runs correctly today, but "runs correctly" and "ready to hand to strangers on the internet" are different bars. This project is the deliberate, measured pass that closes that gap: multi-stage the server to strip devDependencies, lock both `.dockerignore` files down and prove it with the daemon\'s own build-context reporting, drop root privileges inside the running container, make both images self-describing about their own health, and run a first honest vulnerability scan. Every step produces a number or a status you can point to — this is optimization and security treated as something you measure, not something you merely claim.',
        functionalRequirements: [
          'Rewrite `server/Dockerfile` as a genuine multi-stage build whose final stage installs only production dependencies (`npm ci --omit=dev`).',
          'Tighten `client/.dockerignore` and `server/.dockerignore` to exclude `.env`/`.env.*` (keeping `!.env.example`), `node_modules`, `*.log`, `coverage`, and `.git`, and confirm each with `docker build --progress=plain`.',
          'Add `USER node` to `server/Dockerfile` so the running process is non-root, and verify with `docker run --rm <image> whoami`.',
          'Add a `HEALTHCHECK` instruction to both `server/Dockerfile` (checking `GET /health`) and `client/Dockerfile` (checking nginx\'s root `/`).',
          'Run `docker scout quickview` against both final images and record the reported vulnerability counts.',
          'Produce a documented before/after `docker images` size table for both `noticeboard-server` and `noticeboard-client`.',
        ],
        technicalImplementation: [
          'Baseline first: run `docker images` and `docker history` on the current `v1` images and record exact sizes before changing anything.',
          'Restructure `server/Dockerfile` with a `deps`/base stage for full installs and a final `runner` stage using `npm ci --omit=dev`, `ENV NODE_ENV=production`, `USER node`, and the new `HEALTHCHECK`.',
          'Update `client/Dockerfile`\'s existing final nginx stage to add its own `HEALTHCHECK` line, without disturbing its already-correct multi-stage build.',
          'Rewrite both `.dockerignore` files, then run `docker build --progress=plain --no-cache` on each service and record the "transferring context" size reported near the top of the output.',
          'Rebuild both images tagged `v2`, run `docker images` again, and compute the size delta against the recorded `v1` baseline for the comparison table.',
          'Run `docker scout quickview noticeboard-server:v2` and `docker scout quickview noticeboard-client:v2` and note critical/high counts for both.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Baseline audit',
            outcome: 'Recorded `v1` sizes and layer breakdowns for both images, before any changes.',
            prompt:
              'Run `docker images` and `docker history noticeboard-server:v1` and `docker history noticeboard-client:v1`. Record the total size of each image and identify the single largest layer in the server image. This is the "before" baseline for the final comparison table — do not skip recording exact numbers here.',
          },
          {
            step: 2,
            label: 'Multi-stage the server and tighten .dockerignore',
            outcome: 'A new `server/Dockerfile` using a production-only final stage, and tightened `.dockerignore` files for both services, confirmed with `--progress=plain`.',
            prompt:
              'Rewrite `server/Dockerfile` as a multi-stage build: a stage that installs full dependencies, and a separate final stage that runs `npm ci --omit=dev` and sets `ENV NODE_ENV=production`. Then write (or tighten) `.dockerignore` for both `client/` and `server/`, excluding `.env`/`.env.*` (with `!.env.example` kept), `node_modules`, `*.log`, `coverage`, and `.git`. Run `docker build --progress=plain --no-cache` for both services and show me the reported "transferring context" size for each, proving the ignore rules are actually working.',
          },
          {
            step: 3,
            label: 'Drop root and add HEALTHCHECK to both Dockerfiles',
            outcome: 'The server runs as the non-root `node` user, and both Dockerfiles have their own working `HEALTHCHECK`.',
            prompt:
              'Add `USER node` to `server/Dockerfile` in the correct position (after installs/copies, before CMD), rebuild, and show me the output of `docker run --rm noticeboard-server:v2 whoami` proving it is no longer root. Then add a `HEALTHCHECK` instruction to `server/Dockerfile` targeting `GET /health` with `wget --spider`, and a matching `HEALTHCHECK` to `client/Dockerfile` targeting nginx\'s root. Run both images standalone with `docker run -d` (no Compose) and show me `docker ps` reporting `(healthy)` for each.',
          },
          {
            step: 4,
            label: 'Scan and build the before/after comparison table',
            outcome: 'Vulnerability scan results for both images plus a documented before/after size comparison table.',
            prompt:
              'Run `docker scout quickview` against both `noticeboard-server:v2` and `noticeboard-client:v2` and report the critical/high/medium/low vulnerability counts for each. Then build a small before/after table comparing `v1` and `v2` for both images: total size, largest layer, whether it runs as root or non-root, and whether it has a Dockerfile `HEALTHCHECK`. Explain in a few sentences which single change produced the biggest size reduction and why.',
          },
        ],
        deliverable:
          'A hardened `server/Dockerfile` (multi-stage, production-only final dependencies, non-root `USER node`, working `HEALTHCHECK`) and a hardened `client/Dockerfile` (existing multi-stage build plus its own `HEALTHCHECK`), tightened `.dockerignore` files for both services confirmed with `docker build --progress=plain`, at least one clean `docker scout quickview` run against each image, and a documented before/after `docker images` size comparison table for both `noticeboard-server` and `noticeboard-client`. With this done, the images are lean, non-root, and healthchecked — next module ships them to Docker Hub, automates the build with CI, and deploys the whole stack to a real server.',
      },
    },
  ],
  quiz: [
    {
      id: 'm8-q1',
      q: 'The current `server/Dockerfile` is single-stage and runs `RUN npm ci` once. Why does converting it to a multi-stage build with a final `npm ci --omit=dev` step typically shrink the shipped image significantly?',
      options: [
        'Because `npm ci --omit=dev` downloads packages from a faster CDN than a plain `npm ci`',
        'Because it skips installing `dependencies` entirely and only ships `devDependencies`',
        'Because it excludes `devDependencies` (test runners, linters, bundlers) from the final image, which are only needed during development, not at runtime',
        'Because Alpine images cannot install devDependencies in the first place',
      ],
      answer: 2,
    },
    {
      id: 'm8-q2',
      q: 'Why is running a container process as root a meaningfully greater risk than it might sound, even though a container is not a full virtual machine?',
      options: [
        'Root inside a container has no special privileges at all, so this is mostly a superstition',
        'Containers share the host kernel via namespaces/cgroups rather than a hypervisor boundary, so a container breakout as root can grant root-level access on the host itself',
        'Root-in-container only matters for Windows containers, not Linux ones',
        'It is only a risk if the container exposes a port publicly',
      ],
      answer: 1,
    },
    {
      id: 'm8-q3',
      q: 'A teammate suggests `COPY .env .` early in the server Dockerfile and then `RUN rm .env` in a later instruction "to clean it up before shipping." Why is this still unsafe?',
      options: [
        'It is actually safe, since the file no longer exists in the final image filesystem',
        'Docker image layers are stacked, immutable diffs — deleting a file in a later layer does not remove it from the earlier layer that added it, so the secret remains recoverable from the image history',
        'It is unsafe only because `.env` files are always larger than 500KB',
        '`RUN rm` commands are not supported inside Dockerfiles',
      ],
      answer: 1,
    },
    {
      id: 'm8-q4',
      q: 'The `docker-compose.yml` already defines a `healthcheck:` for the server service. Why add a separate `HEALTHCHECK` instruction directly inside `server/Dockerfile` as well?',
      options: [
        'It is not actually necessary — the Compose-level healthcheck is completely equivalent in every situation',
        'A Dockerfile HEALTHCHECK makes the image self-describing about its own liveness wherever it runs — including a bare `docker run`, a different orchestrator, or after being pushed to a registry — independent of whether a specific Compose file is involved',
        'Dockerfile HEALTHCHECK instructions run faster than Compose healthchecks',
        'Compose healthchecks are deprecated and will stop working in future Docker versions',
      ],
      answer: 1,
    },
    {
      id: 'm8-q5',
      q: 'What does `docker scout quickview noticeboard-server:v2` actually tell you, and what does it NOT guarantee?',
      options: [
        'It guarantees the application has zero security bugs of any kind',
        'It reports known, catalogued CVEs found in the image\'s base layers and dependencies as a sanity check — it does not catch custom application-logic bugs or unknown/zero-day vulnerabilities',
        'It automatically patches every vulnerability it finds without any further action',
        'It only works after the image has already been pushed to Docker Hub',
      ],
      answer: 1,
    },
  ],
}
