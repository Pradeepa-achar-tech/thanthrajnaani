// Module 7 — Dev Workflow with Compose
// Module 6 delivered a stable, production-shaped docker-compose.yml (mongo, server,
// client, noticeboard-net, mongo-data, healthcheck-gated depends_on) for Kundapura
// Notice Board. That file works, but every code change to server/ or client/ still
// needs a full `docker compose up -d --build` — no hot reload. This module fixes
// daily development speed using docker-compose.override.yml, bind mounts, nodemon,
// the Vite dev server, and .env files — WITHOUT touching the Module 6 base file.
// Module 8 will shrink and harden the images themselves (size, non-root, secrets).

export const m7 = {
  id: 'm7',
  title: 'Dev Workflow with Compose',
  hours: 7,
  color: 'from-teal-500/20 to-teal-700/10',
  accent: 'teal',
  description:
    'Module 6 gave Kundapura Notice Board a stable, **production-shaped** `docker-compose.yml` — but right now, editing one line of `server/src/index.js` or a React component still means a full `docker compose up -d --build`, every single time. That is not a development loop, that is a punishment. This module fixes it **without touching the base file at all**, using `docker-compose.override.yml` (which Compose merges in automatically), bind-mounted source code running under `nodemon` and the raw **Vite dev server**, and `.env` files for configuration. You will end the module running one plain command — `docker compose up` — and seeing your edits reflect instantly, while the production-shaped base file stays untouched for the day Module 9 ships it.',
  sections: [
    {
      id: 'm7-s1',
      title: 'Compose for Everyday Development',
      topics: [
        {
          id: 'm7-t1',
          title: 'docker-compose.override.yml — automatic dev overrides layered on top of the base file',
          explain:
            'Add a second file, `docker-compose.override.yml`, sitting next to `docker-compose.yml`. Compose automatically detects and merges it in whenever you run plain `docker compose up` — no `-f` flag needed — so dev-only tweaks live separately from the production-shaped base file.',
          analogy:
            'Picture the **prasadam counter** at a Kundapura temple during a normal day versus during a big festival. The standing menu board bolted to the wall never changes — that is the base recipe, the official offering, unchanged whether it is a quiet Tuesday or Ganesh Chaturthi. But on festival days, the counter staff pin a **second, temporary sheet** right on top of the board — "today also serving: extra laddoo, faster queue, second counter open" — and everyone reads the combined result automatically without anyone rewriting the permanent board. Take the festival sheet down and the counter reverts to its normal, unchanged self. `docker-compose.override.yml` is that temporary sheet: pinned automatically, read automatically, and the base menu underneath never gets touched.',
          theory:
            'Docker Compose has a documented, automatic file-discovery rule: when you run `docker compose up` (or any compose subcommand) with **no `-f` flag at all**, Compose looks in the current directory for exactly two files by name — `docker-compose.yml` (or `compose.yaml`) as the base, and `docker-compose.override.yml` as an optional second file — and **merges them together** before doing anything else. This merge behaviour is specific to the literal filename `docker-compose.override.yml`; any other filename (like `docker-compose.prod.yml`, covered later this module) requires an explicit `-f` flag to be picked up.\n\nThe merge itself is a deep merge, not a full replace: scalar values (like an `image:` tag or a `command:`) in the override **replace** the base file\'s value for that key, while list-like keys such as `ports:`, `volumes:`, and `environment:` are generally **appended** to what the base already defines (with some Compose-version nuances around exact list-merge semantics — always run `docker compose config` to see the final resolved result if you are unsure). Crucially, if a service in the base file does not appear at all in the override, it is left completely alone.\n\nThis gives Kundapura Notice Board a clean separation of concerns: `docker-compose.yml` stays exactly as Module 6 left it — production-shaped, healthcheck-gated, ready to ship — while `docker-compose.override.yml` holds only the things that make *local development* pleasant: bind mounts for live-editing `server/` and `client/` source, a different startup command for hot reload, maybe extra debug ports. Anyone cloning the repo just runs `docker compose up` and gets the dev experience automatically, with zero extra flags to remember. And critically: `docker-compose.override.yml` is meant to be **committed to git** (unlike `.env`, covered in topic 3) — it is shared team tooling, not a personal secret.',
          whyItMatters:
            'This one naming convention is what lets a team keep a single source-of-truth production compose file untouched while every developer still gets fast local iteration. Get this wrong — by editing `docker-compose.yml` directly for dev convenience — and you risk shipping dev-only shortcuts (bind mounts, debug flags, relaxed healthchecks) straight into production without noticing.',
          steps: [
            'In the Kundapura Notice Board repo root, create a new file named exactly `docker-compose.override.yml` next to the existing `docker-compose.yml`.',
            'Leave `docker-compose.yml` completely untouched — do not edit a single line of it this module.',
            'In the override file, declare only the services you intend to change (`server`, `client`) — you do not need to repeat `mongo` if it needs no dev-only tweaks.',
            'Run `docker compose config` to print the fully merged configuration and confirm your override keys appear alongside the base file\'s settings.',
            'Run `docker compose up` (no `-f` flags at all) and confirm in the logs that the override\'s settings took effect.',
            'Commit `docker-compose.override.yml` to git — it is shared dev tooling, not a secret.',
          ],
          code: `# Repo root for Kundapura Notice Board:
# docker-compose.yml            <- Module 6's production-shaped base file (untouched)
# docker-compose.override.yml   <- NEW: dev-only tweaks, auto-merged

# docker-compose.override.yml (bare skeleton for now — filled in over topics 2 and 3)
services:
  server:
    # dev-only overrides land here in the next topic
    environment:
      NODE_ENV: development

  client:
    # dev-only overrides land here in the next topic
    environment:
      NODE_ENV: development

# Prove Compose picks BOTH files up automatically, with no -f flag:
docker compose config
# -> prints the full merged YAML: base file's mongo/server/client services,
#    PLUS the override's extra "environment: NODE_ENV: development" lines

# Bring the stack up the normal way — override is applied silently:
docker compose up
# Creating network "noticeboard-net"
# Creating volume "mongo-data"
# Container noticeboard-mongo   Healthy
# Container noticeboard-server  Started   <- picked up NODE_ENV=development from override
# Container noticeboard-client  Started`,
          pitfalls: [
            '**Editing `docker-compose.yml` directly to add dev conveniences.** The production-shaped base file quietly rots with dev-only assumptions. Fix: put every dev-only tweak in `docker-compose.override.yml` instead, and never touch the base file for this.',
            '**Naming the file `docker-compose.override.yaml` (or any other spelling/casing).** Compose\'s auto-discovery looks for an exact filename and silently will not merge a misspelled one. Fix: use exactly `docker-compose.override.yml` (or `compose.override.yaml` if you standardised on the newer `compose.yaml` naming) and double-check by running `docker compose config`.',
            '**Assuming the override REPLACES the base file entirely.** Compose merges the two; unmentioned services and keys from the base file are still there. Fix: only declare the specific services/keys you actually want to change in the override.',
            '**Forgetting the override is picked up automatically and manually passing `-f docker-compose.yml -f docker-compose.override.yml`.** Harmless but redundant, and confusing for teammates who expect plain `docker compose up` to just work. Fix: rely on the automatic two-file convention for local dev; reserve explicit `-f` chains for genuinely different files like `docker-compose.prod.yml`.',
            '**Not committing `docker-compose.override.yml` to git**, assuming (wrongly) it is meant to be personal/local like `.env`. Every teammate then has to reinvent the same dev tweaks. Fix: commit it — it is shared dev tooling, distinct from the `.env` secrets file.',
            '**Being surprised when `docker compose up` behaves differently on a CI server or teammate\'s machine that has a stray, uncommitted `docker-compose.override.yml` of their own.** Fix: keep the override in git as the single shared source of dev config, and treat any personal-only tweaks as a separate, gitignored file explicitly passed with `-f` if truly needed.',
          ],
          tryIt:
            'In your Kundapura Notice Board repo, create `docker-compose.override.yml` with just `services: { server: { environment: { NODE_ENV: development } } }`, run `docker compose config`, and confirm the merged output shows `NODE_ENV: development` for the `server` service even though the base `docker-compose.yml` never mentions it.',
          takeaway:
            'Compose automatically merges `docker-compose.override.yml` into `docker-compose.yml` on plain `docker compose up` with no `-f` flag needed, keeping the production-shaped base file untouched while dev-only tweaks live in — and are committed via — the override file.',
        },
        {
          id: 'm7-t2',
          title: 'Bind-mounting source code + nodemon/Vite dev server for hot reload inside Compose',
          explain:
            'In the override, bind-mount `server/src` into the running `server` container and swap its start command to `nodemon` so edits restart the API instantly, and bind-mount `client/src` into a *different*, plain `node:20-alpine` container running the raw Vite dev server on port 5173 — bypassing the Module 6 nginx production build entirely for local development.',
          analogy:
            'Think about the difference between **buying packed fish already cleaned, iced, and sealed at the Kundapura harbour for shipment to Bengaluru**, versus **standing right at the boat as it docks and picking today\'s catch straight off the net**. The sealed, packed box (nginx serving a built, static `dist/` folder) is exactly what you want for the long journey to a customer far away — stable, compact, nothing needs to move once it is sealed. But if you are the cook working *today*, right there at the harbour, you do not want a sealed box — you want the boat\'s hold bind-mounted open in front of you so you grab whatever changed catch is inside right now. Compose\'s dev override does exactly this for two different services: the `server`\'s source folder is bind-mounted open with `nodemon` watching it like a cook watching the boat, while the `client` gets its *own separate boat* — a live Vite dev server — because the sealed nginx box from Module 6 has no hold to reach into at all.',
          theory:
            'A **bind mount** maps a folder on your host machine directly into a path inside a running container — the container sees live, real-time changes to those files, because it is the *same* files, not a copy baked into the image. This is the mechanism that makes hot reload possible inside Docker: instead of rebuilding an image every time you edit a line, the running container simply sees the edit immediately because the host folder and the container folder are the same folder.\n\nFor the **`server`** service, the override adds a bind mount and changes the startup command:\n```yaml\nservices:\n  server:\n    volumes:\n      - ./server/src:/app/src\n    command: npx nodemon src/index.js\n```\n`nodemon` is a small process supervisor that watches files and restarts the Node process automatically on any change — swapping it in for the base file\'s plain `node src/index.js` means every save to `server/src/*.js` restarts the Express app inside the container in under a second, no rebuild, no `docker compose up --build`.\n\nThe **`client`** is where a critical nuance shows up. Module 6\'s `client` container is a **multi-stage production build**: an early build stage runs `npm run build` to produce a static, optimized `dist/` folder, and the *final* stage copies that `dist/` folder into an `nginx` image that just serves plain files. There is no live Node process inside that final nginx image at all — nothing to bind-mount source into, because nginx does not run Vite, watch files, or rebuild anything. Bind-mounting `client/src` over an nginx container would do nothing useful; the static files were already baked in at build time.\n\nSo the override does not try to patch the production `client` container — it replaces the *entire approach* for local dev. It defines the `client` service (via override) to use a plain `node:20-alpine` image instead of the built nginx one, bind-mounts `./client` (source, `package.json`, everything Vite needs) into `/app`, and runs `npm run dev -- --host` as the command — starting Vite\'s own built-in dev server, which has its own instant hot-module-reload, directly inside the container. The `--host` flag is essential: Vite\'s dev server binds to `localhost` only by default, which is unreachable from outside the container; `--host` (or `--host 0.0.0.0`) makes it listen on all interfaces so the port mapping from Compose actually works. The override publishes Vite\'s native port, `5173`, directly to your host, so you browse to `http://localhost:5173` and get the *real* Vite dev experience — instant reload, source maps, the works — completely bypassing nginx and the production build stage.',
          whyItMatters:
            'This is the single biggest daily-development-speed win Docker Compose can give a MERN team: instead of a 30-60 second rebuild-and-restart cycle for every backend tweak, and a total non-starter for frontend hot reload against a static nginx build, both services now reload in under a second. Understanding *why* the client needs a fundamentally different container (not just a bind mount on the same image) is the difference between correctly reasoning about multi-stage builds and being permanently confused about why hot reload "doesn\'t work" against a production image.',
          steps: [
            'In `docker-compose.override.yml`, add a `volumes:` bind mount for `server`: `./server/src:/app/src`.',
            'Override the `server` service\'s `command:` to `npx nodemon src/index.js` (confirm `nodemon` is listed in `server/package.json` devDependencies).',
            'For `client`, override `image:` (or `build:`) to plain `node:20-alpine` instead of Module 6\'s nginx-based production image.',
            'Bind-mount the whole `client` folder into the container, e.g. `./client:/app`, and set `working_dir: /app`.',
            'Override the `client` command to `sh -c "npm install && npm run dev -- --host"`.',
            'Map the `client` service\'s port to `5173:5173` in the override (different from Module 6\'s nginx port, e.g. `80`), and confirm both hot-reload flows work by editing a file in each service and watching the change reflect without any rebuild.',
          ],
          code: `# docker-compose.override.yml — bind mounts + dev commands for both services

services:
  server:
    volumes:
      - ./server/src:/app/src        # live-mount backend source over the built image
    command: npx nodemon src/index.js
    environment:
      NODE_ENV: development

  client:
    image: node:20-alpine             # plain Node image — NOT the Module 6 nginx build
    working_dir: /app
    volumes:
      - ./client:/app                 # live-mount the whole Vite project
      - /app/node_modules              # anonymous volume: keep container's own node_modules
    command: sh -c "npm install && npm run dev -- --host"
    ports:
      - '5173:5173'                    # Vite's own dev server port, published directly
    environment:
      NODE_ENV: development

# Bring the dev stack up — override merges in automatically:
docker compose up
# noticeboard-server   | [nodemon] watching path(s): src/**/*
# noticeboard-server   | [nodemon] starting \`node src/index.js\`
# noticeboard-server   | Notice Board API listening on :5000
# noticeboard-client   |
# noticeboard-client   |   VITE v5.2.0  ready in 412 ms
# noticeboard-client   |   ➜  Local:   http://localhost:5173/
# noticeboard-client   |   ➜  Network: http://172.19.0.4:5173/   <- --host made this line appear

# Edit server/src/routes/notices.js — save it — watch the terminal:
# noticeboard-server   | [nodemon] restarting due to changes...
# noticeboard-server   | Notice Board API listening on :5000

# Edit client/src/components/NoticeCard.jsx — save it — browser updates instantly,
# no container restart at all, because Vite's HMR handles it in-process.`,
          pitfalls: [
            '**Bind-mounting `client/src` into the Module 6 nginx-based production container, expecting hot reload.** Nginx only serves static files it was given at build time; there is no live process watching source at all. Fix: run a separate plain `node:20-alpine` service with the Vite dev server for local dev, as shown above.',
            '**Forgetting `--host` on the Vite dev command.** Vite binds to `localhost` inside the container by default, which is unreachable from your host browser even with the port published. Fix: always run `npm run dev -- --host` (or set `server.host: true` in `vite.config.js`).',
            '**Not excluding `node_modules` from the bind mount**, letting the host\'s (possibly OS-mismatched, e.g. Windows-built) `node_modules` shadow the container\'s Linux-built one. Fix: add an anonymous volume `- /app/node_modules` after the bind mount so the container keeps its own installed copy.',
            '**Forgetting `nodemon` is not in `server/package.json` at all.** `npx nodemon` fails with "command not found" or downloads a fresh copy every start. Fix: add `nodemon` to `server/package.json` devDependencies and rebuild the image once so it is available offline.',
            '**Publishing the dev client on the same port Module 6 exposes for nginx**, causing a port conflict when both are accidentally brought up together. Fix: keep dev\'s `5173:5173` clearly distinct from the base file\'s production port mapping.',
            '**Expecting the override\'s `client` service definition to merge cleanly with a base file that defines `client` via `build:` with multi-stage args.** Overriding `image:` alongside a base `build:` key can behave unexpectedly across Compose versions. Fix: run `docker compose config` after writing the override and read the fully resolved `client` service definition before trusting it.',
          ],
          tryIt:
            'With the override in place, run `docker compose up`, edit `server/src/index.js` to change the `/health` response message and confirm nodemon restarts automatically, then edit a piece of visible text in a `client/src` component and confirm it appears in `http://localhost:5173` within a second, with no `docker compose up --build` run at all.',
          takeaway:
            'Bind mounts plus `nodemon` give the `server` instant restarts, while the `client` needs an entirely different override container running the raw Vite dev server (bypassing the Module 6 nginx production build) to get real hot-module-reload during local development.',
        },
        {
          id: 'm7-t3',
          title: '.env files and variable substitution (${VAR}) inside docker-compose.yml',
          explain:
            'Create a root `.env` (gitignored, real local values) and a committed `.env.example` template, then reference those variables from `docker-compose.yml`/`docker-compose.override.yml` using `${VARIABLE}` substitution syntax and via `env_file:` to inject a whole file of variables into a service at once.',
          analogy:
            'Think of the **notice board itself at the Kundapura bus stand** — the physical board is the same wooden frame every single day (that is `docker-compose.yml`), but the *specific notices pinned to it* change: today\'s fish price, this week\'s ferry timing, tomorrow\'s festival announcement. Nobody rebuilds the board to change a notice — they just pin a new slip of paper with today\'s values onto the same frame. A `.env` file is that stack of slips: the compose file has blank slots like "today\'s bus port is ___", and `.env` fills in the actual value without anyone touching the frame\'s carpentry.',
          theory:
            'Docker Compose automatically reads a file named exactly **`.env`** from the same directory as your compose file (no flag needed, similar in spirit to the override auto-discovery from topic 1), and makes every `KEY=value` line inside it available for **variable substitution** anywhere in `docker-compose.yml` or `docker-compose.override.yml` using `${VARIABLE}` syntax:\n```yaml\nservices:\n  server:\n    ports:\n      - "${SERVER_PORT}:5000"\n```\nIf `.env` contains `SERVER_PORT=5000`, Compose resolves this to `"5000:5000"` before the file is even parsed as YAML — substitution happens as a text-replacement pass first. You can supply a fallback with `${VARIABLE:-default}` so the compose file still works even if a variable is missing.\n\nFor Kundapura Notice Board, a sensible root `.env` holds exactly the kind of values that differ between a developer\'s machine, CI, and production: `MONGO_INITDB_DATABASE=noticeboard`, `SERVER_PORT=5000`, `CLIENT_PORT=5173`. These get referenced with `${...}` in the port mappings and, for Mongo\'s own initialization, as the seed database name.\n\nThere is a second, distinct mechanism worth knowing alongside `${VAR}` substitution: **`env_file:`**. Where `${VAR}` substitution happens in the *compose file\'s own YAML* (affecting ports, image tags, volume paths — structural things), `env_file:` instead injects an entire file\'s worth of `KEY=value` lines directly into a *service\'s runtime environment* — the equivalent of setting many `environment:` entries at once, without listing them one by one:\n```yaml\nservices:\n  server:\n    env_file:\n      - .env\n```\nNow every variable in `.env` is available to `process.env` inside the running Node app itself, not just usable for YAML substitution.\n\nThe golden rule that ties this together: **`.env` is gitignored** — it is meant to hold values that might differ per machine or per developer, and in a real production setup would hold secrets. **`.env.example`** is the committed template — same variable names, placeholder or safe default values, zero real secrets — so any new developer copies it (`cp .env.example .env`) and fills in their own values to get running in seconds.',
          whyItMatters:
            'Hardcoding port numbers and database names directly into `docker-compose.yml` means every environment difference (a developer\'s port 5000 already being taken, CI needing a different database name) requires editing the shared compose file itself. `.env` + `${VAR}` substitution + `env_file:` moves all of that into one small, swappable, correctly-gitignored file — exactly the pattern every real Dockerized project uses, and exactly what Module 9\'s production deploy will build further on top of.',
          steps: [
            'In the repo root, create `.env.example` listing every variable the project needs with safe placeholder values: `MONGO_INITDB_DATABASE=noticeboard`, `SERVER_PORT=5000`, `CLIENT_PORT=5173`.',
            'Copy it to a real `.env`: `cp .env.example .env` (values can stay the same for local dev, or be customised).',
            'Add `.env` to `.gitignore` — confirm with `git status` that it never shows as untracked/staged.',
            'In `docker-compose.yml`, replace hardcoded port numbers with `${SERVER_PORT}` and `${CLIENT_PORT}` substitution.',
            'Add `env_file: - .env` to the `server` service so the whole file\'s variables land in `process.env` at runtime, not just in port substitution.',
            'Run `docker compose config` to confirm every `${VARIABLE}` resolved to a real value with none left as literal, un-substituted text.',
          ],
          code: `# .env.example — committed template, safe placeholder values, NO real secrets
MONGO_INITDB_DATABASE=noticeboard
SERVER_PORT=5000
CLIENT_PORT=5173

# .env — real local values, gitignored, created by: cp .env.example .env
MONGO_INITDB_DATABASE=noticeboard
SERVER_PORT=5000
CLIENT_PORT=5173

# .gitignore — make sure .env itself never gets committed
.env
node_modules/
.venv/

# docker-compose.yml (Module 6's base file) — using \${VAR} substitution for ports:
services:
  mongo:
    image: mongo:7
    environment:
      MONGO_INITDB_DATABASE: \${MONGO_INITDB_DATABASE}
    volumes:
      - mongo-data:/data/db

  server:
    build: ./server
    env_file:
      - .env                       # whole file injected into process.env at runtime
    ports:
      - "\${SERVER_PORT}:5000"
    depends_on:
      mongo:
        condition: service_healthy

  client:
    build: ./client
    ports:
      - "\${CLIENT_PORT}:80"

networks:
  default:
    name: noticeboard-net
volumes:
  mongo-data:

# Confirm every \${VAR} actually resolved — nothing left as literal text:
docker compose config
#   server:
#     ports:
#       - "5000:5000"      <- resolved from \${SERVER_PORT}
#     environment:
#       MONGO_INITDB_DATABASE: noticeboard`,
          pitfalls: [
            '**Committing the real `.env` to git.** Even placeholder-looking local values can leak internal port conventions or, later, real secrets once production credentials are added. Fix: add `.env` to `.gitignore` on day one, before it ever holds anything sensitive.',
            '**Never creating `.env.example`.** A new developer clones the repo, runs `docker compose up`, and gets cryptic "variable is not set" warnings with everything defaulting to empty. Fix: always keep an up-to-date `.env.example` checked into git as the onboarding template.',
            '**Confusing `${VAR}` substitution with `env_file:`.** `${VAR}` only affects the compose YAML itself (ports, image names, volume paths); it does NOT automatically put that variable into the container\'s runtime environment unless you also list it under `environment:` or use `env_file:`. Fix: use `env_file:` (or explicit `environment:` entries) when the *application code* needs to read the variable via `process.env`.',
            '**Typo-ing a variable name in the compose file**, e.g. `${SERVR_PORT}`, which silently resolves to an empty string instead of erroring. Fix: always run `docker compose config` after editing and visually confirm every substitution resolved to a real, expected value.',
            '**Forgetting `.env` must live in the same directory Compose is run from.** Running `docker compose` from a subfolder means the root `.env` is never picked up automatically. Fix: run compose commands from the repo root, or pass `--env-file path/to/.env` explicitly if you must run from elsewhere.',
            '**Assuming `.env.example` needs real, working values.** Placeholder-like values are fine and often clearer, but they must still be syntactically valid (no quotes needed, no trailing spaces) or Compose substitution breaks in confusing ways. Fix: keep `.env.example` simple `KEY=value` lines mirroring exactly what `.env` needs.',
          ],
          tryIt:
            'Create `.env.example` and `.env` with `MONGO_INITDB_DATABASE`, `SERVER_PORT`, and `CLIENT_PORT`, wire `${SERVER_PORT}`/`${CLIENT_PORT}` into the port mappings in `docker-compose.yml`, add `env_file: [.env]` to the `server` service, then run `docker compose config` and confirm all three variables resolved to real values with none showing as blank.',
          takeaway:
            '`.env` (gitignored) supplies real local values for `${VARIABLE}` substitution inside the compose YAML itself, `.env.example` is the committed template for onboarding, and `env_file:` is the separate mechanism that injects a whole file of variables into a service\'s actual runtime environment.',
        },
      ],
    },
    {
      id: 'm7-s2',
      title: 'Keeping Dev and Prod Apart',
      topics: [
        {
          id: 'm7-t4',
          title: 'Multiple compose files: -f docker-compose.yml -f docker-compose.prod.yml',
          explain:
            'Understand how Compose\'s `-f` flag layers and merges any number of named compose files in the order given, and add a barebones `docker-compose.prod.yml` stub as a placeholder for Module 9 to fill in with published Docker Hub images.',
          analogy:
            'Picture three different **festival planning sheets for the same Kundapura temple seva**: the base sheet lists every standard ritual and timing; a second sheet, used only during Ganesh Chaturthi, adds extra sevas on top; a third, used only for a VIP visit, swaps the standard prasadam for a special one. The temple never keeps three separate temples — it keeps one base plan and stacks the *right combination* of extra sheets on top depending on the day. `-f file1.yml -f file2.yml` is choosing exactly that combination, in order, for today\'s run.',
          theory:
            'Whereas `docker-compose.override.yml` is picked up **automatically** with no flag, any *other* named compose file must be explicitly passed with `-f`. You can chain as many `-f` flags as you like, and Compose merges them **left to right**, meaning files listed later can override keys set by files listed earlier:\n```bash\ndocker compose -f docker-compose.yml -f docker-compose.prod.yml up -d\n```\nThis reads as: "start from `docker-compose.yml`, then layer `docker-compose.prod.yml`\'s changes on top." Note something important — when you pass `-f` explicitly like this, Compose\'s *automatic* pickup of `docker-compose.override.yml` is bypassed; only the files you named are used. So a production run using explicit `-f` flags never accidentally picks up your dev-only override.\n\nThis module only **stubs** `docker-compose.prod.yml` — a nearly-empty overlay file with a comment marking it for Module 9, which will fill it in to reference already-published Docker Hub images (`build:` replaced by `image: yourname/noticeboard-server:1.0`) instead of building locally, plus production-appropriate settings like `restart: unless-stopped`. For now, the stub exists so the *pattern* — base file, dev override (automatic), and an explicit prod overlay (via `-f`) — is fully set up and understood, even before its real content lands.\n\nThe conceptual split to hold onto: `docker-compose.yml` is the shared shape of the whole app (services, network, volumes) that never changes between environments; `docker-compose.override.yml` layers on *local development conveniences* and is picked up automatically; `docker-compose.prod.yml` will layer on *production-specific* concerns (pre-built images, restart policies, resource limits) and must be requested explicitly with `-f` so it can never accidentally apply to a laptop.',
          whyItMatters:
            'Real Dockerized projects almost always need at least two shapes of "the same app" — the version a developer runs locally and the version that actually ships. Understanding `-f` layering now, even against a mostly-empty stub, means Module 9 is simply *filling in* an already-correct file, not inventing the whole multi-environment pattern from scratch under pressure.',
          steps: [
            'Create an almost-empty `docker-compose.prod.yml` in the repo root with just a top-level comment noting it is a Module 9 placeholder.',
            'Run `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` and confirm it resolves cleanly even with the stub nearly empty.',
            'Compare that against plain `docker compose config` (no `-f` flags) and note it instead automatically includes `docker-compose.override.yml`, not `docker-compose.prod.yml`.',
            'Confirm running with explicit `-f` flags means the dev override is NOT applied unless you also explicitly list it.',
            'Read (without yet implementing) what Module 9 will add: `image:` references to Docker Hub instead of `build:`, and production `restart:` policies.',
            'Note the intended real invocation for later: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`.',
          ],
          code: `# docker-compose.prod.yml — STUB ONLY, filled in properly in Module 9
# This overlay will eventually replace "build:" with published Docker Hub
# images (e.g. yourname/noticeboard-server:1.0) and add production-only
# settings like restart policies and resource limits. Left minimal for now.

services:
  server:
    restart: unless-stopped   # one small real setting already worth having

# Layering explained: base + prod overlay, explicit -f, in order:
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
# -> merges docker-compose.yml first, then applies docker-compose.prod.yml
#    on top. Note: docker-compose.override.yml is NOT included here at all,
#    because passing -f explicitly turns off the automatic override pickup.

# Compare: plain "up" with no -f flags picks the OTHER pair automatically:
docker compose up
# -> merges docker-compose.yml + docker-compose.override.yml (dev tweaks)

# The real production-shaped invocation (Module 9 will use this for real):
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`,
          pitfalls: [
            '**Expecting `docker-compose.override.yml` to still apply when `-f` flags are used explicitly.** It does not — naming files with `-f` opts out of the automatic override pickup entirely. Fix: if you genuinely want the override alongside other named files, list it explicitly too: `-f docker-compose.yml -f docker-compose.override.yml -f docker-compose.prod.yml`.',
            '**Getting the `-f` file order backwards.** Later files override earlier ones, so `-f docker-compose.prod.yml -f docker-compose.yml` would let the *base* file win over prod settings — the opposite of what you want. Fix: always list the base file first, overlays after, in the order you want them applied.',
            '**Leaving `docker-compose.prod.yml` truly empty (zero content) rather than a valid, minimal YAML stub.** An empty file can cause a parse error instead of a harmless no-op. Fix: give it at least a top-level comment and one real, harmless setting, as shown above.',
            '**Forgetting the flag has to be repeated per file — `-f file1.yml file2.yml` is NOT valid syntax.** Fix: always write `-f file1.yml -f file2.yml`, one `-f` per file.',
            '**Accidentally running the "prod" combination against your local `.env` values** (e.g. a local Mongo without production credentials) and being confused when it half-works. Fix: remember `-f` layering only changes the *compose* configuration, not which `.env` values are substituted — production usually needs its own separate environment values too, which Module 9 will address.',
            '**Treating this stub as "done" and skipping the real production hardening later.** The stub only proves the file-layering mechanics work — it deliberately does not yet contain real production settings. Fix: keep the comment marking it for Module 9 visible so nobody mistakes the stub for a finished production config.',
          ],
          tryIt:
            'Create the `docker-compose.prod.yml` stub shown above, then run both `docker compose config` (no flags) and `docker compose -f docker-compose.yml -f docker-compose.prod.yml config`, and compare the two outputs side by side to see exactly which extra file each pulled in.',
          takeaway:
            '`-f` explicitly names and left-to-right merges any compose files you list (and turns off the automatic override pickup while doing so); `docker-compose.prod.yml` is stubbed in now as a placeholder overlay for Module 9 to fill in with published images and production settings.',
        },
        {
          id: 'm7-t5',
          title: 'docker compose watch as a modern alternative to bind mounts for rebuild-on-change',
          explain:
            'Learn `docker compose watch`, Compose\'s newer built-in file-watching feature, configured with a `develop: watch:` block per service using `action: sync` (copy changed files into the running container, like a lighter-weight bind mount) or `action: rebuild` (rebuild and restart the whole service when certain files change).',
          analogy:
            'Bind mounts, from topic 2, are like leaving the harbour\'s entire fish hold **permanently open and connected** to the kitchen next door — always live, always visible, works great but is a fairly heavy, always-on arrangement. `docker compose watch` is more like a **runner boy stationed at the dock**: he watches for a specific new crate to arrive, and the moment it does, he personally carries just that crate over to the kitchen (`action: sync`) — or, if it is a crate that changes the whole recipe (like a new spice mix), he tells the head cook to start the dish over from scratch (`action: rebuild`). Nothing is permanently wired open; watching and reacting happens on demand.',
          theory:
            '`docker compose watch` is a newer, built-in Compose feature (Compose v2.22+) that offers an alternative to permanently bind-mounting source folders. Instead of (or alongside) `volumes:` bind mounts, you add a `develop: watch:` block to a service describing exactly which paths to watch and what to do when they change:\n```yaml\nservices:\n  server:\n    develop:\n      watch:\n        - action: sync\n          path: ./server/src\n          target: /app/src\n        - action: rebuild\n          path: ./server/package.json\n```\nThen instead of `docker compose up`, you run `docker compose watch` (often alongside `up`, e.g. `docker compose up --watch`) and Compose itself monitors the given host paths.\n\nTwo distinct actions matter here:\n- **`action: sync`** — when a watched file changes, Compose copies just that changed file into the running container at the given `target` path, without a rebuild or restart. This is conceptually similar to what a bind mount gives you for free, but as an explicit, one-time, on-demand copy rather than a permanently live-shared filesystem — useful in restricted environments where full bind mounts are awkward (some CI runners, some remote Docker contexts) or where you want tighter control over exactly which files trigger a sync.\n- **`action: rebuild`** — when a watched file changes (typically something structural like `package.json` or a `Dockerfile`), Compose rebuilds the image and restarts the service automatically, rather than just syncing a file that a running process could not have picked up anyway (a new dependency needs an actual `npm install` and restart, not a file copy).\n\nFor Kundapura Notice Board, `watch` is presented here as a **modern alternative worth knowing**, not a wholesale replacement of the bind-mount + `nodemon`/Vite approach taught in topic 2 — the override-file approach remains the primary path this module teaches because it is simpler to reason about for a first Docker course and works identically across all Compose versions and remote Docker setups. But recognizing `develop: watch:` matters because many teams and newer tutorials now reach for it by default, and it can be a genuinely nicer fit when you specifically want sync-without-full-bind-mount semantics or automatic rebuilds tied to dependency-file changes.',
          whyItMatters:
            'Knowing both approaches — override-file bind mounts and `docker compose watch` — means you can read and work with either style in a real team\'s codebase, and choose deliberately rather than by accident. `watch` is also the direction Compose itself is evolving toward, so recognizing the `develop:` block now avoids confusion when you encounter it in other projects or later versions of this course\'s tooling.',
          steps: [
            'Check your Compose version supports `watch`: `docker compose version` (need v2.22 or newer).',
            'Add a `develop: watch:` block to the `server` service in `docker-compose.override.yml`, with an `action: sync` entry for `./server/src`.',
            'Add a second watch entry with `action: rebuild` for `./server/package.json`, so a new dependency triggers a real rebuild.',
            'Run `docker compose up --watch` and confirm the terminal shows a "Watch enabled" message.',
            'Edit a file inside `server/src` and confirm Compose logs a sync event, without restarting the container.',
            'Add (then remove) a dependency in `server/package.json` and confirm it triggers a full rebuild instead of a sync.',
          ],
          code: `# docker-compose.override.yml — adding a develop.watch block alongside the
# existing bind-mount approach from topic 2, for comparison

services:
  server:
    develop:
      watch:
        - action: sync
          path: ./server/src
          target: /app/src        # copies just the changed file in, no rebuild
        - action: rebuild
          path: ./server/package.json   # a new dependency needs a real rebuild

# Run with watch enabled:
docker compose up --watch
# [+] Running 3/3
#  ✔ Container noticeboard-mongo   Healthy
#  ✔ Container noticeboard-server  Started
#  ✔ Container noticeboard-client  Started
# Watch enabled

# Edit server/src/routes/notices.js and save:
#  Syncing server after changes were detected...
#  server  |  [nodemon] restarting due to changes...   <- nodemon still handles the restart itself

# Add a new dependency to server/package.json, e.g. "dayjs": "^1.11.10":
#  Rebuilding server after changes were detected...
#  [+] Building 4.2s (10/10) FINISHED
#  Container noticeboard-server  Recreated`,
          pitfalls: [
            '**Assuming `docker compose watch` replaces `nodemon`/the Vite dev server entirely.** `action: sync` only copies the changed file into the container — something still has to notice the file changed and restart/reload the app (nodemon, Vite\'s own watcher). Fix: keep `nodemon`/Vite running inside the container; `watch` handles getting files *in*, not restarting the app process.',
            '**Using an old Compose version and being confused why `develop: watch:` is silently ignored.** The feature requires Compose v2.22+. Fix: run `docker compose version` first and upgrade the Compose plugin if needed.',
            '**Putting a dependency file like `package.json` under `action: sync` instead of `action: rebuild`.** Copying a changed `package.json` in without running `npm install` leaves the container\'s installed packages stale. Fix: use `action: rebuild` for any file whose change requires a real image rebuild.',
            '**Running `docker compose up` (without `--watch`) and expecting the `develop:` block to do anything.** The watch behaviour is opt-in and requires the `--watch` flag (or the standalone `docker compose watch` command). Fix: always add `--watch` when you want this behaviour active.',
            '**Treating `watch` as strictly superior and ripping out bind mounts everywhere immediately.** For this course\'s primary teaching path, the override-file bind-mount approach is simpler to reason about and more universally supported. Fix: know both, but keep bind mounts as the default unless you have a specific reason (restricted environments, tighter sync control) to prefer `watch`.',
            '**Forgetting `target:` must be specified for `sync` actions**, or pointing it at the wrong in-container path. Files silently sync to a path nothing reads from. Fix: match `target:` exactly to the path your app actually loads from inside the container (e.g. `/app/src`, matching the bind mount path used elsewhere).',
          ],
          tryIt:
            'Add a `develop: watch:` block to the `server` service with `action: sync` for `./server/src` and `action: rebuild` for `./server/package.json`, run `docker compose up --watch`, edit a route file and confirm a sync-only log line appears, then add a throwaway dependency to `package.json` and confirm a full rebuild is triggered instead.',
          takeaway:
            '`docker compose watch` (via a `develop: watch:` block using `action: sync` or `action: rebuild`) is Compose\'s modern, built-in alternative to always-on bind mounts — worth knowing well even though this module\'s primary dev workflow stays with the override-file bind-mount approach.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm7-p1',
      type: 'Mini Project',
      title: 'A Fast, Safe Local Dev Loop',
      domain: 'DevEx',
      duration: '3-4 hrs',
      description:
        'Turn Kundapura Notice Board\'s stable Module 6 stack into a fast local development environment without ever touching the production-shaped `docker-compose.yml`. Add a `docker-compose.override.yml` that bind-mounts and hot-reloads both `server` (via `nodemon`) and `client` (via a plain-Node Vite dev server, bypassing the nginx production build), introduce `.env`/`.env.example` for configuration, and stub out `docker-compose.prod.yml` as a marked placeholder for Module 9.',
      tools: ['Docker Compose', 'nodemon', 'Vite dev server', '.env / env_file', 'docker compose watch'],
      blueprint: {
        overview:
          'Right now, every code change to Kundapura Notice Board\'s `server` or `client` demands a full `docker compose up -d --build` — slow enough that developers will be tempted to run the app outside Docker "just for speed", defeating the entire point of containerizing it. This project fixes that permanently: a `docker-compose.override.yml` that Compose merges in automatically gives instant hot reload for both services, `.env`/`.env.example` move configuration out of hardcoded values, and a `docker-compose.prod.yml` stub sets up the file-layering pattern Module 9 will complete. By the end, `docker compose up` alone gives a fully live-reloading dev loop, while `docker-compose.yml` itself stays exactly as production-shaped as Module 6 left it.',
        functionalRequirements: [
          'A `docker-compose.override.yml` exists in the repo root and is picked up automatically by plain `docker compose up` — no `-f` flag required.',
          'Editing any file under `server/src` restarts the Express app inside its container within about a second, via a bind mount plus `nodemon`, with zero manual rebuild.',
          'Editing any file under `client/src` reflects in the browser within about a second via Vite\'s own dev server (port `5173`, published directly), running in a plain `node:20-alpine` container — NOT the Module 6 nginx production container.',
          'A committed `.env.example` lists every configuration variable the project needs (`MONGO_INITDB_DATABASE`, `SERVER_PORT`, `CLIENT_PORT`); a gitignored `.env` supplies real local values used both via `${VAR}` substitution in the compose files and via `env_file:` for at least one service.',
          'A `docker-compose.prod.yml` stub exists with a clear comment marking it as a Module 9 placeholder, and `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` resolves without error.',
          'The original `docker-compose.yml` from Module 6 is not modified in any way — verified with `git diff docker-compose.yml` showing no changes.',
        ],
        technicalImplementation: [
          'In `docker-compose.override.yml`, override the `server` service with a `volumes:` bind mount of `./server/src:/app/src` and `command: npx nodemon src/index.js` (with `nodemon` added to `server/package.json` devDependencies).',
          'In the same file, override the `client` service entirely: `image: node:20-alpine`, `working_dir: /app`, a bind mount of `./client:/app` plus an anonymous volume for `/app/node_modules`, `command: sh -c "npm install && npm run dev -- --host"`, and `ports: ["5173:5173"]`.',
          'Create `.env.example` and `.env` (gitignored via `.gitignore`) with `MONGO_INITDB_DATABASE`, `SERVER_PORT`, `CLIENT_PORT`; reference them with `${VARIABLE}` in port mappings, and add `env_file: [.env]` to the `server` service.',
          'Create a minimal `docker-compose.prod.yml` containing a top-level comment and one placeholder setting (e.g. `restart: unless-stopped` on `server`), explicitly reserved for Module 9 to expand with Docker Hub `image:` references.',
          'Verify everything with `docker compose config` (auto-merge of base + override) and `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` (explicit layering, override excluded) side by side.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Bind-mount and hot-reload the server',
            outcome: 'A `docker-compose.override.yml` that gives the `server` service live nodemon-driven restarts on every source edit, with the Module 6 base file left untouched.',
            prompt:
              'Create `docker-compose.override.yml` in the Kundapura Notice Board repo root. Override the `server` service to bind-mount `./server/src` into `/app/src` and run it via `npx nodemon src/index.js` instead of plain `node`. Add `nodemon` to `server/package.json` devDependencies and rebuild once. Run `docker compose up`, edit a line in `server/src/index.js`, and show me the terminal output proving nodemon detected the change and restarted the app without a full `docker compose up --build`. Confirm `docker-compose.yml` itself was not modified.',
          },
          {
            step: 2,
            label: 'Give the client a real Vite dev server, separate from the nginx build',
            outcome: 'The `client` service in the override runs a plain Vite dev server on port 5173 with live HMR, distinct from the Module 6 nginx production container.',
            prompt:
              'Extend `docker-compose.override.yml` so the `client` service uses `image: node:20-alpine` instead of the Module 6 production build, bind-mounts `./client` into `/app` (with an anonymous volume protecting `/app/node_modules`), and runs `npm run dev -- --host`, publishing port 5173 directly. Explain in your own words why bind-mounting source into the Module 6 nginx container would NOT have worked, referencing the multi-stage build. Then edit a visible piece of text in a `client/src` component and show the browser at `http://localhost:5173` updating without any container rebuild.',
          },
          {
            step: 3,
            label: 'Add .env / .env.example and wire in substitution',
            outcome: 'A committed `.env.example` template, a gitignored real `.env`, and both `${VARIABLE}` substitution and `env_file:` wired into the compose files.',
            prompt:
              'Create `.env.example` with `MONGO_INITDB_DATABASE=noticeboard`, `SERVER_PORT=5000`, and `CLIENT_PORT=5173`, then copy it to a real `.env`. Add `.env` to `.gitignore`. Update `docker-compose.yml`\'s port mappings to use `${SERVER_PORT}` and `${CLIENT_PORT}` substitution, and add `env_file: [.env]` to the `server` service so the variables are also available to the Node app via `process.env`. Run `docker compose config` and show me the fully resolved output proving every `${VARIABLE}` substituted correctly.',
          },
          {
            step: 4,
            label: 'Stub docker-compose.prod.yml and verify the whole dev loop',
            outcome: 'A minimal, clearly-marked `docker-compose.prod.yml` placeholder, plus confirmation that plain `docker compose up` and the explicit `-f` prod combination both resolve correctly and independently.',
            prompt:
              'Create a minimal `docker-compose.prod.yml` with a comment marking it as a Module 9 placeholder and one real setting (`restart: unless-stopped` on `server`). Run `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` and confirm it resolves without pulling in the dev override. Then run plain `docker compose up` one more time and confirm it still automatically picks up `docker-compose.override.yml` instead. Finally, run `git diff docker-compose.yml` and show me that the Module 6 base file has zero changes after this entire project.',
          },
        ],
        deliverable:
          'A Kundapura Notice Board repo where `docker compose up` alone brings up a fully live-reloading dev stack — `server` restarting via bind-mounted `nodemon`, `client` hot-reloading via a plain-Node Vite dev server on port 5173 — configured through a committed `docker-compose.override.yml`, a gitignored `.env` plus committed `.env.example`, and a stubbed `docker-compose.prod.yml` ready for Module 9. The original `docker-compose.yml` from Module 6 remains completely untouched throughout. Dev is fast now — next module shrinks and locks down the images themselves (size, non-root users, secrets handling) before they ever reach production.',
      },
    },
  ],
  quiz: [
    {
      id: 'm7-q1',
      q: 'You run plain `docker compose up` (no `-f` flags) in the Kundapura Notice Board repo, which contains both `docker-compose.yml` and `docker-compose.override.yml`. What happens?',
      options: [
        'Only `docker-compose.yml` is used; the override file is ignored unless named with `-f`',
        'Compose automatically detects and merges `docker-compose.override.yml` on top of `docker-compose.yml`, with no flag required',
        'Compose throws an error because two compose files exist in the same folder',
        'The override file completely replaces the base file rather than merging with it',
      ],
      answer: 1,
    },
    {
      id: 'm7-q2',
      q: 'Why can\'t you just bind-mount `client/src` into the Module 6 `client` container to get frontend hot reload?',
      options: [
        'Bind mounts only work for backend services, never frontend ones',
        'The Module 6 `client` container is a multi-stage production build served by nginx — there is no live Node/Vite process inside it to notice or reload changed source files',
        'Vite does not support running inside any Docker container',
        'nginx containers cannot have volumes attached to them at all',
      ],
      answer: 1,
    },
    {
      id: 'm7-q3',
      q: 'In `docker-compose.yml`, you write `ports: - "${SERVER_PORT}:5000"`. Where does `SERVER_PORT`\'s value come from, and what additionally is needed for the Node app itself to read that same value via `process.env.SERVER_PORT`?',
      options: [
        'Compose hardcodes `SERVER_PORT` automatically; nothing else is needed',
        'The value comes from a root `.env` file via automatic substitution for the YAML itself; to also expose it to the running app\'s `process.env`, the service needs `environment:` entries or an `env_file:` reference',
        '`${SERVER_PORT}` syntax only works inside Dockerfiles, never inside docker-compose.yml',
        'The value must be typed manually into the compose file every time it changes',
      ],
      answer: 1,
    },
    {
      id: 'm7-q4',
      q: 'You run `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`. What happens to `docker-compose.override.yml`, and in what order are the two named files merged?',
      options: [
        'The override file is still automatically included alongside the two named files, and file order does not matter',
        'Passing `-f` explicitly bypasses the automatic override pickup entirely; the two named files merge left to right, with `docker-compose.prod.yml` able to override keys set by `docker-compose.yml`',
        'Only the last `-f` file is used; all earlier ones are discarded',
        'Compose refuses to run with more than one `-f` flag',
      ],
      answer: 1,
    },
    {
      id: 'm7-q5',
      q: 'What is the difference between `action: sync` and `action: rebuild` in a `docker compose watch` `develop:` block?',
      options: [
        'They are two names for the exact same behaviour',
        '`action: sync` copies a changed file into the running container without rebuilding (something inside, like nodemon, still needs to react to it); `action: rebuild` rebuilds the image and restarts the service, appropriate for changes like a new dependency in `package.json`',
        '`action: sync` only works for databases; `action: rebuild` only works for frontend services',
        '`action: rebuild` is deprecated in favor of `action: sync` and should never be used',
      ],
      answer: 1,
    },
  ],
}
