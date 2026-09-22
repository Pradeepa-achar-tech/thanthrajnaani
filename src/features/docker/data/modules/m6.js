// Module 6 — Docker Compose Fundamentals
// Module 5 got mongo, server, and client all running together, but only by
// hand-typing three separate `docker run` commands (five, counting the one-off
// `docker network create` and `docker volume create`) in the right order, with
// the right flags, every single session. This module replaces that entire
// ritual with one declarative docker-compose.yml and one command. Module 7
// layers a dev-mode override (bind mounts, hot reload) on top of the exact
// base file written here — nothing in this module gets thrown away.

export const m6 = {
  id: 'm6',
  title: 'Docker Compose Fundamentals',
  hours: 8,
  color: 'from-amber-500/20 to-amber-700/10',
  accent: 'amber',
  description:
    'Your Kundapura Notice Board stack currently boots via five separate manual commands — `docker network create`, `docker volume create`, and three `docker run` calls, typed in the right order, with the right flags, every single time. This module replaces all of that with one declarative file, **docker-compose.yml**, and one command. You will learn the anatomy of a Compose file (`services`, `build`, `image`, `ports`, `environment`, `networks`, `volumes`), write the complete file for `mongo`, `server`, and `client`, then operate the stack day-to-day with `docker compose up`, `down`, and `logs -f`. The module closes by making `depends_on` actually mean something — gating the `server` service on a real MongoDB **healthcheck**, not just "the container has started."',
  sections: [
    {
      id: 'm6-s1',
      title: 'One File, One Command',
      topics: [
        {
          id: 'm6-t1',
          title: 'What Docker Compose solves — replacing five docker run commands with one docker-compose.yml',
          explain:
            'Docker Compose lets you describe an entire multi-container application — every service, its build, its ports, its environment variables, its network, its volumes — in a single YAML file, then bring the whole thing up or down with one command instead of a long, manually-ordered sequence of `docker network create`, `docker volume create`, and three separate `docker run` invocations.',
          analogy:
            'Picture the harbour at **Kundapura port** on a fishing morning: three boats need to leave together — the ice boat, the net boat, and the engine-repair boat — and every single day the harbourmaster used to walk to each boat separately, shout instructions, check each captain confirmed the plan, and hope they all cast off in the right order without colliding. A `docker-compose.yml` is the harbourmaster instead posting one master manifest pinned at the pier: every boat\'s route, order, and dependency on the others written down once. The whole fleet reads the same sheet and moves together the instant the horn sounds.',
          theory:
            'Right now, starting the Kundapura Notice Board stack for a single work session means running five separate commands, in the right order, every time: `docker network create noticeboard-net` (a one-off setup step, easy to forget you already did), `docker volume create mongo-data` (also one-off), then a `docker run` for `mongo` with the volume and network flags attached, then a `docker run` for `server` with its own network flag, environment variables, and port mapping, then a `docker run` for `client` with its port mapping. Miss one flag, get the order wrong, or fat-finger the network name in just one of those five commands, and something in the stack silently fails to talk to something else.\n\n**Docker Compose** collapses all five of those commands into one declarative file, `docker-compose.yml`, and one command: `docker compose up`. "Declarative" is the key word here — instead of telling Docker the *steps* to take, one at a time, in order (imperative, like the five commands above), you describe the *end state* you want: "these three services exist, wired together like this, with this volume and this network" — and Compose figures out what needs to be created versus reused to get there.\n\nCompose ships today as the `docker compose` subcommand (with a space), built into modern Docker Desktop and the Docker Engine\'s CLI plugin set. You may still see an older, separate `docker-compose` (with a hyphen) binary referenced in older tutorials — that is Compose V1, largely retired in favour of the built-in `docker compose` V2 this course uses. They do similar jobs, but `docker compose` is the modern, first-class command and the one you should reach for.\n\nCrucially, Compose does not introduce any new container technology. It is still building images from your `server/Dockerfile` and `client/Dockerfile`, still creating a Docker network, still mounting a named volume — every primitive from Modules 1-5 is exactly the same underneath. Compose is a **coordination layer** on top of what you already understand; it just means you never type those five commands by hand again.',
          whyItMatters:
            'A stack that needs five perfectly-ordered commands to start only "works" as long as the one person who memorised the flags is around. The moment a teammate joins, or you come back to the project after two months, or you need this running inside a CI pipeline, hand-typed `docker run` commands become a liability. A `docker-compose.yml` checked into git next to `client/` and `server/` is the single source of truth for how Kundapura Notice Board actually runs — anyone, anywhere, with Docker installed, gets an identical stack from one command.',
          steps: [
            'Open a terminal and re-type, from memory or your notes, the five manual commands you have been using to start the stack: `docker network create`, `docker volume create`, and the three `docker run` commands for mongo, server, and client.',
            'Circle every place the network name `noticeboard-net` appears across those five commands — count how many places you would have to keep it consistent by hand.',
            'Circle every place the volume name `mongo-data` appears.',
            'Write down every flag on the `server` `docker run` command specifically (`--network`, `-e MONGO_URI=...`, `-p 5000:5000`, `--name`) — this is the exact list of things a Compose service block needs to capture.',
            'Time yourself starting the stack from a completely clean machine state (no containers, no volume, no network) using the five manual commands, start to finish.',
            'Keep that timing and command list handy — you will compare it against a single `docker compose up -d --build` later in this module.',
          ],
          code: `# The OLD way — five separate, manually-ordered commands just to boot the stack:

# 1) create the shared network (one-off, but easy to forget you already ran it)
docker network create noticeboard-net

# 2) create the named volume for Mongo's data (also one-off)
docker volume create mongo-data

# 3) start MongoDB, attached to the network, with its data volume mounted
docker run -d --name mongo --network noticeboard-net -v mongo-data:/data/db mongo:7

# 4) start the API server, attached to the same network, pointed at mongo by hostname
docker run -d --name server --network noticeboard-net \\
  -e PORT=5000 -e MONGO_URI=mongodb://mongo:27017/noticeboard \\
  -p 5000:5000 noticeboard-server

# 5) start the client, published on its own port
docker run -d --name client --network noticeboard-net -p 5173:80 noticeboard-client

# ------------------------------------------------------------------
# The NEW way, once this module's docker-compose.yml exists:
docker compose up -d --build
# Same three containers, same network, same volume — one command.`,
          pitfalls: [
            '**Typing `noticeboard-net` slightly differently in one of the five commands** (e.g. `notice-board-net` in one spot). Fix: Compose reads the network name from one place in the YAML file, so two services can never disagree about it.',
            '**Forgetting you already ran `docker network create` and re-running it**, which errors with "network already exists" and derails the whole boot sequence. Fix: Compose creates missing networks and volumes automatically and simply reuses whatever already exists — no manual bookkeeping required.',
            '**Starting `server` before `mongo` has actually finished booting**, because nothing enforces order across three independent `docker run` calls. Fix: Compose\'s `depends_on` (covered later this module) can enforce real startup order.',
            '**Losing track of which flags belong to which container** once your command history scrolls past — months later nobody remembers the exact `-p`/`-e`/`--network` combination that worked. Fix: a `docker-compose.yml` is permanent, versioned documentation of exactly how each container is meant to run.',
            '**Onboarding a teammate by pasting five commands into a chat message.** One missed line and their stack silently behaves differently from yours. Fix: send them the repo instead — `docker compose up` reproduces the same stack for everyone.',
            '**Assuming Compose is a totally different technology from plain Docker.** It is not — it drives the exact same images, containers, networks, and volumes; it just remembers the recipe for you. Fix: think of Compose as "the five commands you already know, written down once."',
          ],
          tryIt:
            'Without looking at your notes, try to recite from memory the exact five commands — and every flag — needed to start Kundapura Notice Board completely from scratch. Notice how many details you have to double-check or get slightly wrong. That friction is exactly what `docker-compose.yml` removes for the rest of this module.',
          takeaway:
            'Docker Compose replaces the fragile, five-command, manually-ordered ritual of `network create` + `volume create` + three `docker run` calls with one declarative `docker-compose.yml` file and one command, without changing any of the underlying Docker primitives.',
        },
        {
          id: 'm6-t2',
          title: 'Anatomy of docker-compose.yml: services, build, image, ports, environment, networks, volumes',
          explain:
            'Every `docker-compose.yml` is built from a small, fixed vocabulary of top-level YAML keys — `services`, `volumes`, `networks` — and, inside each service, a handful of keys (`build`, `image`, `ports`, `environment`, `depends_on`) that map directly onto the `docker run` flags you already know.',
          analogy:
            'Picture the actual community noticeboard pinned up near the **Kundapura bus stand** — the very one this app is modelled after. It is not one wall of random paper; it has labelled sections nailed on: a "Notices" corner where each flyer gets its own pin (that is `services:`, one entry per container), a small locked drawer at the bottom for the ledger book that never gets thrown out between market days (`volumes:`), and a shared board frame that every flyer is physically pinned to so all of them are visible from the same spot (`networks:`). `docker-compose.yml` is that same noticeboard, just written as YAML instead of cork and paper.',
          theory:
            'A `docker-compose.yml` for this project has exactly two kinds of top-level keys: `services:` (the containers themselves) and the plural declaration blocks `volumes:` and `networks:` that a service can reference by name.\n\n**`services:`** is a dictionary — each key underneath it (`mongo`, `server`, `client`) is both the service\'s name *and* its **DNS hostname** on the Compose network. This is what lets the server\'s code connect to `mongodb://mongo:27017/noticeboard` instead of an IP address: Compose runs an internal DNS resolver that resolves the literal name `mongo` to whichever container is currently running that service.\n\nInside each service block:\n- **`build:`** points at a folder containing a `Dockerfile` (`./server`, `./client`) and tells Compose to build an image from it locally, using the Dockerfiles you already wrote in earlier modules. This project uses `build:` for `server` and `client` because they are *your* code.\n- **`image:`** names a ready-made image to pull instead of building one. `mongo` uses `image: mongo:7` — you are not writing a custom Dockerfile for MongoDB, you are running the official published image directly, exactly like the plain `docker run mongo:7` you have been using. (Module 9 introduces pushing *your own* images to Docker Hub and switching `server`/`client` to `image:` too — for now, `build:` is correct for those two.)\n- **`ports:`** maps a host port to a container port, written `"HOST:CONTAINER"`, and only appears on services you actually want reachable from your machine\'s browser or terminal — `server` (`5000:5000`) and `client` (`5173:80`). `mongo` deliberately has no `ports:` entry at all, continuing Module 4\'s lesson that the database should never be directly reachable from the host.\n- **`environment:`** sets environment variables inside that one container — this is where `server` receives `PORT` and `MONGO_URI`, exactly as it did via `-e` flags before.\n- **`networks:`** (per-service) lists which top-level network(s) this service joins — here, every service joins the same one, `noticeboard-net`, which is *why* they can resolve each other by name at all.\n- **`depends_on:`** declares a startup relationship to another service — a short list form just waits for the container to start; a long dict form (next section) can wait for genuine readiness.\n\nThe two plural top-level blocks, `volumes:` and `networks:`, are where you formally *declare* the names (`mongo-data`, `noticeboard-net`) that services reference above — skip the declaration and Compose refuses to start, complaining the name is undefined.',
          diagram: `graph TD
    subgraph net[noticeboard-net network]
        MONGO["mongo<br/>image: mongo:7"]
        SERVER["server<br/>build: ./server"]
        CLIENT["client<br/>build: ./client"]
    end
    VOL[("mongo-data volume")]
    HOST[Your machine - the host]
    SERVER -->|"MONGO_URI=mongodb://mongo:27017"| MONGO
    CLIENT -->|"calls http://server:5000/api/notices"| SERVER
    MONGO --- VOL
    SERVER -.->|"published 5000:5000"| HOST
    CLIENT -.->|"published 5173:80"| HOST`,
          flowExplain:
            'All three services sit inside the same `noticeboard-net` box because every one of them lists `noticeboard-net` under its own `networks:` key — that shared membership is the only reason `server` can reach `mongo` by name. Only `server` and `client` have dotted lines leaving the box to "Your machine", because only they declare a `ports:` mapping; `mongo` has no line leaving the box at all, on purpose.',
          whyItMatters:
            'Copy-pasting a `docker-compose.yml` from a tutorial without understanding each key is how projects end up with a database accidentally published to the internet, or a service that can never resolve its neighbours. Knowing exactly what `build` vs `image`, `ports` vs no `ports`, and per-service `networks:` vs the top-level declaration each do is what lets you read — and safely modify — any Compose file you encounter for the rest of your career, not just this one.',
          steps: [
            'Open the previous topic\'s five manual commands again and, for each flag, name the Compose key it corresponds to (`--network` → `networks:`, `-e` → `environment:`, `-p` → `ports:`).',
            'Decide, for each of the three services, whether it needs `build:` or `image:` — and say out loud *why* mongo is different from server and client.',
            'List which services need a `ports:` entry and which do not, and justify the difference from Module 4\'s security lesson.',
            'Write out, on paper, the two top-level plural blocks (`volumes:`, `networks:`) and the exact names they must declare for this project.',
            'Sketch (even roughly) which services would fail to resolve each other by name if the top-level `networks:` block were missing.',
          ],
          code: `# A single annotated service, showing every key this topic covers:

services:
  mongo:
    image: mongo:7        # pull the official image - no Dockerfile of our own
    volumes:
      - mongo-data:/data/db   # named volume, declared below, survives container removal
    networks:
      - noticeboard-net       # joins the shared network - "mongo" becomes a DNS name
    # no ports: here - Module 4's rule: never publish the database to the host

# The two top-level blocks referenced above MUST be declared, even if empty:
volumes:
  mongo-data:

networks:
  noticeboard-net:`,
          pitfalls: [
            '**Using `image:` for `server` or `client` before Module 9.** There is no published image for your own code yet — Compose fails to find it on Docker Hub. Fix: use `build: ./server` / `build: ./client` for anything you have a local Dockerfile for.',
            '**Writing `ports: - 5000:5000` unquoted and hitting a YAML parsing quirk** on some YAML parsers/editors, since `5000:5000` can be misread as a nested key-value pair. Fix: quote it as `"5000:5000"` — a habit worth keeping even where it is not strictly required.',
            '**Adding a `ports:` entry under `mongo` "just to peek at the data" during setup.** It works, but quietly undoes Module 4\'s isolation lesson. Fix: leave `mongo` with no `ports:` at all; inspect its data with `docker compose exec mongo mongosh` instead.',
            '**Forgetting the top-level plural `volumes:` and `networks:` blocks** and only referencing `mongo-data` / `noticeboard-net` inside a service. Compose errors that the name is undefined. Fix: always declare them once at the bottom of the file, even with an empty body.',
            '**Mixing tabs and spaces, or inconsistent indentation, in the YAML.** Compose fails to parse with a cryptic error pointing at a line that looks fine at a glance. Fix: use 2 spaces consistently, never tabs, and let your editor\'s YAML plugin flag it.',
            '**Assuming `environment:` variables are visible to the host machine.** They are only set *inside* that one container\'s process — running `echo $MONGO_URI` in your own terminal shows nothing. Fix: check env vars with `docker compose exec server env` instead.',
          ],
          tryIt:
            'Hand-write just the `mongo` service block — `image`, `volumes`, `networks`, deliberately no `ports:` — from memory, using only the values given in this topic. Then compare it line by line against the code sample above.',
          takeaway:
            'Every `docker-compose.yml` key maps onto something you already know from plain `docker run` — `build`/`image` choose how the image is obtained, `ports` chooses what is reachable from the host, `environment` sets container env vars, and `networks`/`volumes` are declared once at the top level and referenced by name inside each service.',
        },
        {
          id: 'm6-t3',
          title: 'Writing docker-compose.yml for Kundapura Notice Board — client, server, mongo',
          explain:
            'Assemble every key from the previous topic into the complete, working `docker-compose.yml` for Kundapura Notice Board — one file, saved at the repo root next to `client/` and `server/`, that replaces every manual command from Module 5.',
          analogy:
            'Back at the **Kundapura harbour**, the manifest sheet from the first topic is no longer a blank template pinned to the board — it is now fully filled in, in ink: the ice boat\'s captain name and rope length, the net boat\'s crew and cargo, the engine boat\'s fuel load and departure order. Every blank is filled, and the harbourmaster only has to blow one horn for all three boats to cast off in the right order, together. That fully filled-in manifest is this topic\'s `docker-compose.yml`.',
          theory:
            'This file is real, complete, and permanent — it lives at the **repo root**, as a sibling to the `client/` and `server/` folders (not inside either one), and gets committed to git just like any source file. Anyone who clones the repository and has Docker installed can run one command and get the identical three-container stack you have.\n\nA few structural notes worth calling out explicitly. Modern Compose (V2, the `docker compose` subcommand this course uses) no longer requires the old `version: "3.8"` line that older tutorials show at the top of the file — Compose infers the schema from the tool version itself, so this file simply starts with `services:`. Each service block follows the same shape covered in the previous topic, but now with every value filled in for real:\n\n- **`mongo`** uses `image: mongo:7` (no Dockerfile — the official image), gets a `healthcheck:` block (detailed fully in the next section), mounts `mongo-data:/data/db` so notices survive container recreation, and joins `noticeboard-net`. It deliberately has **no `ports:`** entry.\n- **`server`** uses `build: ./server` (your Module 5 Dockerfile), sets `environment: PORT: 5000` and `MONGO_URI: mongodb://mongo:27017/noticeboard`, publishes `"5000:5000"`, waits on `depends_on: mongo: condition: service_healthy` (also detailed next section), and joins `noticeboard-net`.\n- **`client`** uses `build: ./client` (your Module 5 multi-stage Dockerfile, ending in `nginx:alpine`), publishes `"5173:80"` (host 5173 to nginx\'s container port 80), depends on `server` in the plain, short-list form, and joins `noticeboard-net`.\n- The top-level `volumes:` block declares `mongo-data` once. The top-level `networks:` block declares `noticeboard-net` once, matching the name you have already been using manually since Module 3.\n\nNotice what does *not* appear anywhere in this file: no build arguments for pre-built images, no hardcoded IP addresses, no `--link` flags. Everything a container needs to find another container is either the shared network membership or an environment variable pointing at a service *name* — the DNS resolution from the previous topic is doing all the real work.',
          whyItMatters:
            'This exact file becomes the stable foundation for the rest of the course. Module 7 will layer a dev-mode *override* file on top of it — bind mounts and hot reload for local development — without ever editing this base file directly. Getting this file correct and complete now means every later module builds forward cleanly instead of fighting an inconsistent starting point.',
          steps: [
            'Create a new file named exactly `docker-compose.yml` at the repository root, alongside `client/` and `server/` (not inside either folder).',
            'Add the `services:` key, then the `mongo` block: `image: mongo:7`, `volumes: - mongo-data:/data/db`, `networks: - noticeboard-net`, and deliberately no `ports:`.',
            'Add the `server` block: `build: ./server`, `environment:` with `PORT` and `MONGO_URI`, `ports: - "5000:5000"`, `depends_on: - mongo` (you will upgrade this to the healthcheck form in Section 2), `networks: - noticeboard-net`.',
            'Add the `client` block: `build: ./client`, `ports: - "5173:80"`, `depends_on: - server`, `networks: - noticeboard-net`.',
            'Add the top-level `volumes:` block declaring `mongo-data:` and the top-level `networks:` block declaring `noticeboard-net:`.',
            'Validate the file without starting anything by running `docker compose config` and reading the fully-resolved YAML it prints back.',
          ],
          code: `# docker-compose.yml — repo root, sibling to client/ and server/

services:
  mongo:
    image: mongo:7
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s
    volumes:
      - mongo-data:/data/db
    networks:
      - noticeboard-net
    # No 'ports:' here on purpose - Module 4's lesson: Mongo never touches the host.

  server:
    build: ./server
    environment:
      PORT: 5000
      MONGO_URI: mongodb://mongo:27017/noticeboard
    ports:
      - "5000:5000"
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - noticeboard-net

  client:
    build: ./client
    ports:
      - "5173:80"
    depends_on:
      - server
    networks:
      - noticeboard-net

volumes:
  mongo-data:

networks:
  noticeboard-net:`,
          pitfalls: [
            '**Writing `depends_on: - mongo` (list shorthand) but expecting it to wait for Mongo to be ready**, not just started. Fix: the healthchecked long form (`mongo: condition: service_healthy`) is what this file actually needs, covered fully in Section 2.',
            '**Leaving a stray `ports:` entry under `mongo` "just for this test."** It exposes MongoDB\'s default port 27017 straight to the host, undoing Module 4\'s isolation lesson. Fix: never publish mongo\'s port; use `docker compose exec mongo mongosh` to inspect data instead.',
            '**Forgetting the top-level plural `volumes:` and `networks:` blocks** and only referencing `mongo-data` / `noticeboard-net` inside a service. Compose errors that the named volume or network is undefined. Fix: always declare them once at the bottom, even with an empty body.',
            '**Typo-ing the hostname inside `MONGO_URI`**, e.g. writing `mongodb://localhost:27017` instead of `mongodb://mongo:27017`. `localhost` inside the `server` container refers to the server container itself, not the mongo container. Fix: always address other services by their Compose service name, never `localhost`.',
            '**Saving the file inside `server/` or `client/` instead of the repo root.** Compose looks for `docker-compose.yml` in the current directory by default, and `build: ./server` paths become wrong if the file is nested. Fix: keep it at the repo root, as a sibling to both folders.',
            '**Mixing tabs and spaces, or misaligned indentation, anywhere in the file.** A single misplaced space produces a confusing YAML parse error far from the actual mistake. Fix: use 2-space indentation consistently and run `docker compose config` after every edit to catch it early.',
          ],
          tryIt:
            'Close this page and type out the entire `docker-compose.yml` from scratch, from memory, using only the values given across this section. Then run `docker compose config` against it and compare the fully-resolved output line by line against the code sample above — any difference is worth understanding before moving on.',
          takeaway:
            'The complete `docker-compose.yml` for Kundapura Notice Board lives once, at the repo root, and fully replaces the five manual commands from Module 5 with three declared services, one named volume, and one named network.',
        },
      ],
    },
    {
      id: 'm6-s2',
      title: 'Operating a Compose Stack',
      topics: [
        {
          id: 'm6-t4',
          title: 'docker compose up/down, -d, --build, and docker compose logs -f',
          explain:
            'Learn the everyday command set for operating a Compose stack: `up` to start it (with `-d` to run in the background and `--build` to force fresh images), `down` to tear it down, and `logs -f` to watch what every service is doing live.',
          analogy:
            'At the **Kundapura port** harbourmaster\'s office, a new switchboard has just been installed: one lever lights every boat\'s deck lamp at once, and one lever kills them all together — no more walking boat to boat with a torch, and no more wondering if you missed one. `docker compose up` and `docker compose down` are exactly those two levers for the whole Notice Board stack.',
          theory:
            '`docker compose up` reads `docker-compose.yml` in the current directory, creates whatever network and volumes are missing, builds images where a `build:` key is present (reusing an existing image if nothing seems to have changed), and starts every service in dependency order. Run without any flag, it stays attached to the terminal and streams every service\'s logs live — useful the first time you bring a stack up, annoying for everyday use since it blocks the terminal until you `Ctrl+C`.\n\n- **`-d`** (detached) starts everything in the background and immediately returns your terminal. This is the flag you will use almost every day.\n- **`--build`** forces Compose to rebuild the images for any service with a `build:` key, even if an image already exists from a previous run. Compose does not always reliably detect that your `server/` or `client/` source changed, so get in the habit of adding `--build` any time you have edited code or a Dockerfile.\n- **`docker compose down`** stops and removes every container the stack created, plus the network it created — but, importantly, it does **not** remove named volumes by default. `mongo-data` and every notice inside it survive a plain `down`.\n- **`docker compose down -v`** does the same teardown, but *also* removes any named volumes declared in the file. For this project that means `mongo-data` is deleted along with it — **every notice ever posted disappears.** This is the single most common real-world Compose mistake: reaching for `-v` out of habit, assuming it just means "verbose."\n- **`docker compose logs -f`** tails logs from every service at once, each line prefixed with the service name so you can tell `mongo`, `server`, and `client` output apart. Scope it to one service with `docker compose logs -f server`. Drop `-f` for a one-time static snapshot instead of a live stream.\n- **`docker compose ps`** (used heavily in the mini project) lists every service\'s current status, including health state where a healthcheck is defined.',
          whyItMatters:
            'This is the daily verb set you and any teammate will use for the rest of this project\'s life — `up -d --build`, `ps`, `logs -f`, `down`. A shared, memorised command vocabulary is what lets a team collaborate on a multi-container app without everyone re-deriving flags from documentation every single day, and knowing precisely what `down -v` destroys is what keeps you from accidentally wiping real data.',
          steps: [
            'Run `docker compose up -d --build` from the repo root and confirm your terminal returns immediately instead of streaming logs.',
            'Run `docker compose ps` and read the STATUS column for all three services.',
            'Run `docker compose logs -f` and confirm you see prefixed log lines from `mongo`, `server`, and `client`; press `Ctrl+C` to stop following without stopping the containers.',
            'Post a notice through the running app, then run `docker compose down` (no `-v`) and bring the stack back up — confirm the notice you posted is still there.',
            'Now run `docker compose down -v` and bring the stack back up again — confirm the notice from the previous step is gone, proving what `-v` actually removes.',
            'Edit a small piece of text in `server/`, run `docker compose up -d` (no `--build`) and observe the old behaviour is unchanged, then re-run with `--build` and confirm the change now appears.',
          ],
          code: `# Bring the whole stack up in the background, forcing fresh builds:
docker compose up -d --build
# [+] Running 5/5
#  Network noticeboard-net       Created
#  Volume "mongo-data"           Created
#  Container ...-mongo-1         Healthy
#  Container ...-server-1        Started
#  Container ...-client-1        Started
# (Compose prefixes container names with your project folder's name automatically)

# Check the status of every service in the stack:
docker compose ps
# NAME              IMAGE               STATUS
# ...-mongo-1       mongo:7             Up 12 seconds (healthy)
# ...-server-1      ...-server          Up 8 seconds
# ...-client-1      ...-client          Up 8 seconds

# Tail logs from every service, live, prefixed by service name:
docker compose logs -f
# ...-server-1  | Connected to MongoDB at mongo:27017/noticeboard
# ...-server-1  | Server listening on port 5000
# ...-client-1  | /docker-entrypoint.sh: nginx ready

# Post a test notice, then confirm a PLAIN teardown keeps the data:
curl -X POST http://localhost:5000/api/notices \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Ferry timing change","message":"Last ferry to Gangolli now 7pm","category":"Bus & Ferry","postedBy":"admin"}'

docker compose down
docker compose up -d
curl http://localhost:5000/api/notices
# -> the ferry notice is still there - mongo-data was untouched

# Now the dangerous one - this WIPES the named volume:
docker compose down -v
docker compose up -d --build
curl http://localhost:5000/api/notices
# -> [] empty. Every notice is gone, because -v removed mongo-data too.`,
          pitfalls: [
            '**Running `docker compose down -v` out of habit, assuming `-v` means "verbose."** It permanently deletes the `mongo-data` volume — every notice ever posted disappears. Fix: only add `-v` when you deliberately want a clean slate; plain `down` is the everyday teardown.',
            '**Expecting plain `docker compose up` (no `--build`) to pick up server or client code changes.** Compose reuses an existing image if one is already present, even after Dockerfile-buildable source has changed. Fix: add `--build` any time you have edited source or a Dockerfile.',
            '**Running compose commands from the wrong directory** — anywhere other than the repo root that actually contains `docker-compose.yml`. Compose either cannot find the file or, worse, silently uses a different one. Fix: always run from the folder containing the file, or pass `-f path/to/docker-compose.yml` explicitly.',
            '**Forgetting `-d` and assuming the terminal has frozen.** `docker compose up` without it blocks the terminal, streaming logs live until you `Ctrl+C` (which also stops the stack). Fix: use `-d` for everyday background use; drop it only when you deliberately want to watch startup logs.',
            '**Running `docker compose logs` once and expecting it to keep updating.** Without `-f` it prints a static snapshot and exits immediately. Fix: add `-f` (follow) whenever you want a live, ongoing tail.',
            '**Confusing `docker compose down` with `docker compose stop`.** `stop` pauses containers but leaves them, and the network, in place for a quick restart; `down` removes containers and the network entirely, rebuilding them on the next `up`. Fix: use `stop`/`start` for a quick pause, `down` for a full teardown.',
          ],
          tryIt:
            'Bring the stack up detached and freshly built, confirm `docker compose ps` shows all three services running, post a test notice, tear it down with plain `down`, bring it back up, and confirm the notice survived. Then run `down -v`, bring it back up, and confirm the notice is gone — proof, in your own hands, of exactly what `-v` does.',
          takeaway:
            '`docker compose up -d --build` starts the stack fresh in the background, `docker compose logs -f` tails it live, `docker compose down` tears it down while keeping named volumes, and `docker compose down -v` tears it down *and* deletes them — know which one you are running before you run it.',
        },
        {
          id: 'm6-t5',
          title: 'depends_on and healthchecks — making the server wait until Mongo is actually ready',
          explain:
            'A plain `depends_on: - mongo` only waits for the `mongo` container to start, not for MongoDB inside it to actually be ready to accept connections. A `healthcheck:` block plus the long-form `depends_on: mongo: condition: service_healthy` makes `server` wait for genuine readiness instead.',
          analogy:
            'At the **Gangolli ferry crossing**, the engine turning over with a loud cough is not the same thing as the ferry being ready to carry passengers — the engineer still needs a minute to warm the oil and check the gauges before waving anyone aboard. A container reporting "started" is that first cough of the engine. A **healthcheck** is the engineer\'s thumbs-up a minute later that actually means the ferry is ready to carry a load.',
          theory:
            'The short-form `depends_on: - mongo` only guarantees that the `mongo` container\'s process has been *created and started* — it says nothing about whether MongoDB inside it has finished initialising its data files and is actually accepting connections. On a fresh volume, Mongo can take several seconds to set itself up; on a slower machine or in CI, it can take longer still. If `server` starts immediately after `mongo`\'s container merely starts, its first connection attempt can land before Mongo is truly ready, producing noisy connection-refused errors right at boot even though the stack "looks" correctly wired.\n\nA **`healthcheck:`** block, added to the `mongo` service, tells Compose to periodically run a command *inside* that container to decide whether it is genuinely healthy:\n```\nhealthcheck:\n  test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand(\'ping\')"]\n  interval: 10s\n  timeout: 5s\n  retries: 5\n  start_period: 15s\n```\n`test` is the actual command run inside the container — here, `mongosh` (MongoDB\'s shell, already present in the official `mongo:7` image) pinging the database. `interval` is how often to check, `timeout` how long one check is allowed to take, `retries` how many consecutive failures before the container is marked "unhealthy," and `start_period` a grace window at boot during which early failures do not count against `retries` — important for Mongo\'s first-ever cold start on a brand-new volume, which is slower than every restart after it.\n\nWith that healthcheck in place, the **long-form** `depends_on` on `server` becomes meaningful:\n```\ndepends_on:\n  mongo:\n    condition: service_healthy\n```\nCompose will not start `server` at all until `mongo`\'s healthcheck has reported "healthy" for the first time — genuine readiness, not just "the process exists." Contrast this with the *default* condition implied by the short-list form, `condition: service_started`, which is exactly the weaker guarantee that caused the problem in the first place.\n\n`client`, by comparison, keeps the plain short-form `depends_on: - server` in this project\'s file — it is a static nginx server for pre-built files, and does not itself need `server` to be ready in order to *start*; it only matters once a browser actually calls the API.',
          whyItMatters:
            'This is the difference between a stack that boots reliably every time and one that "usually works, except sometimes right after a fresh `down -v`." Cold starts — a brand-new volume, a slower machine, a CI runner — are exactly when the gap between "container started" and "database ready" is widest, and exactly when a flaky, unreliable boot sequence costs the most time to debug.',
          steps: [
            'Add a `healthcheck:` block under the `mongo` service using `mongosh --eval "db.adminCommand(\'ping\')"` as the `test`, with sensible `interval`, `timeout`, `retries`, and a generous `start_period`.',
            'Change `server`\'s `depends_on` from the short list form to the long dict form, adding `condition: service_healthy` under `mongo`.',
            'Run `docker compose down -v` to force a genuinely cold start (fresh volume, nothing cached).',
            'Run `docker compose up -d --build` and immediately start polling `docker compose ps`, watching `mongo`\'s STATUS move from `(health: starting)` to `(healthy)`.',
            'Run `docker compose logs server` and confirm the "Connected to MongoDB" line appears only after `mongo` turned healthy, with no connection-refused noise above it.',
            'Temporarily break the healthcheck `test` command on purpose (e.g. misspell `mongosh`) and observe that `mongo` never reports healthy and `server` never starts — proof the dependency is actually being enforced.',
          ],
          code: `# docker-compose.yml excerpt - these two pieces must be added TOGETHER:

  mongo:
    image: mongo:7
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s
    volumes:
      - mongo-data:/data/db
    networks:
      - noticeboard-net

  server:
    build: ./server
    depends_on:
      mongo:
        condition: service_healthy   # <- long-form: waits for REAL readiness
    environment:
      PORT: 5000
      MONGO_URI: mongodb://mongo:27017/noticeboard
    ports:
      - "5000:5000"
    networks:
      - noticeboard-net

# --- Proving it works, from a genuinely cold start ---

docker compose down -v
docker compose up -d --build

docker compose ps
# NAME           STATUS
# ...-mongo-1    Up 3 seconds (health: starting)
# ...-server-1   Created                          <- waiting, not started yet

# a few seconds later...
docker compose ps
# NAME           STATUS
# ...-mongo-1    Up 16 seconds (healthy)
# ...-server-1   Up 2 seconds

docker compose logs server
# ...-server-1  | Connected to MongoDB at mongo:27017/noticeboard
# ...-server-1  | Server listening on port 5000
# (no connection-refused retries above this line - server wasn't started until mongo was ready)`,
          pitfalls: [
            '**Assuming `depends_on: - mongo` (short list form) already means "wait until Mongo is ready."** It only waits for the container process to start, not for MongoDB to accept connections. Fix: use the long-form `depends_on: mongo: condition: service_healthy` whenever true readiness matters.',
            '**Writing a healthcheck `test` command that is not installed inside the image**, such as assuming `curl` exists inside `mongo:7` when it does not ship there. Fix: use a tool that is actually present — the Mongo image ships `mongosh`.',
            '**Setting `start_period` too short for a first cold boot.** Mongo initialising its data files from scratch on a brand-new volume takes noticeably longer than a warm restart, and early failed pings before `start_period` ends do not count against `retries` — but after it, they do. Fix: give a generous `start_period` (10-20s) so cold starts are not marked unhealthy prematurely.',
            '**Forgetting `interval`/`timeout`/`retries` entirely**, leaving Compose\'s bare defaults, which may not suit how long Mongo actually takes to warm up on your machine. Fix: set explicit values tuned to your own observed startup time.',
            '**Adding a healthcheck to `mongo` but leaving `server`\'s `depends_on` in short-list form.** The healthcheck now runs and reports status, but nothing actually waits on it — `server` still starts as soon as the container exists. Fix: the healthcheck and the `condition: service_healthy` line must be added together; one without the other accomplishes nothing.',
            '**Confusing container-level "healthy" with application-level "fully warmed up."** A healthcheck only proves Mongo answers a ping; it says nothing about indexes or data being fully ready for heavy queries. Fix: for this project a simple ping is sufficient, but remember a healthcheck is only ever as good as the command written inside it.',
          ],
          tryIt:
            'Run `docker compose down -v` to force a genuinely cold start, then `docker compose up -d --build` and immediately run `docker compose ps` repeatedly to watch `mongo` move from `(health: starting)` to `(healthy)` — then check `docker compose logs server` and confirm its Mongo connection line only appears after that transition.',
          takeaway:
            'A plain `depends_on` only waits for a container to start; pairing a real `healthcheck:` on `mongo` with `depends_on: mongo: condition: service_healthy` on `server` makes the stack wait for genuine database readiness, eliminating flaky connection errors on cold boot.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm6-p1',
      type: 'Mini Project',
      title: 'One Command to Rule the Stack',
      domain: 'Docker Compose',
      duration: '3-4 hrs',
      description:
        'Write the complete `docker-compose.yml` for Kundapura Notice Board — three services, one named network, one named volume, and a healthcheck-gated dependency so `server` genuinely waits on `mongo` — then prove, with your own hands, that one command now does everything Module 5\'s three manual `docker run` calls used to do: bring the whole stack up healthy, tail its logs, tear it down cleanly, and bring it back up again.',
      tools: ['Docker Compose (docker compose CLI)', 'Docker Desktop or Docker Engine + Compose plugin', 'Kundapura Notice Board — client/, server/, existing Dockerfiles'],
      blueprint: {
        overview:
          'Every manual `docker run` flag from Module 5 has a home in this one file: the network, the volume, the ports, the environment variables, and now a real readiness check standing in for the ordering you used to hope for. This project is the proof that the file is complete and correct — not by reading it, but by running it, tearing it down, and running it again, exactly the way you and any future teammate will use it every day for the rest of this course.',
        functionalRequirements: [
          'A `docker-compose.yml` at the repo root defining exactly three services: `mongo`, `server`, `client`.',
          '`mongo` uses `image: mongo:7`, a `healthcheck:` block pinging the database, a `mongo-data:/data/db` volume mount, and no `ports:` entry at all.',
          '`server` uses `build: ./server`, sets `PORT` and `MONGO_URI` via `environment:`, publishes `"5000:5000"`, and only starts once `mongo` reports healthy (`depends_on: mongo: condition: service_healthy`).',
          '`client` uses `build: ./client` and publishes `"5173:80"`.',
          'A top-level `volumes:` block declaring `mongo-data` and a top-level `networks:` block declaring `noticeboard-net`, with all three services joined to that one network.',
          'The whole stack starts, stays healthy, and tears down cleanly using only `docker compose` commands — no manual `docker run`, `docker network create`, or `docker volume create` anywhere in the workflow from this point forward.',
        ],
        technicalImplementation: [
          'Bring the stack up with `docker compose up -d --build` so both images are freshly built and every container starts in the background.',
          'Confirm health with `docker compose ps`, specifically checking that `mongo` shows `(healthy)` and that `server`/`client` show as running only after that.',
          'Tail combined logs with `docker compose logs -f`, and scoped logs with `docker compose logs -f server`, to visually confirm the server\'s Mongo connection message and the client\'s nginx-ready message.',
          'Post at least one real notice through the running client (or directly via `curl` against `/api/notices`) to have data worth checking for persistence.',
          'Tear the stack down with plain `docker compose down`, bring it back up, and confirm the notice you posted survived — proof named volumes persist across a normal teardown.',
          'Finally, run `docker compose down -v`, bring the stack back up, and confirm the notice is gone — proof of exactly what `-v` destroys, tested deliberately rather than discovered by accident.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Write the complete docker-compose.yml',
            outcome: 'A repo-root `docker-compose.yml` defining mongo, server, and client, with the shared network and volume declared, matching every value established across this module.',
            prompt:
              'Write the complete `docker-compose.yml` for Kundapura Notice Board at the repository root. Include three services — `mongo` (image mongo:7, a healthcheck pinging the database with mongosh, a mongo-data volume mount at /data/db, no ports, joined to noticeboard-net), `server` (build ./server, environment PORT=5000 and MONGO_URI=mongodb://mongo:27017/noticeboard, port 5000:5000, joined to noticeboard-net, and depends_on mongo with condition service_healthy), and `client` (build ./client, port 5173:80, depends_on server, joined to noticeboard-net). Add the top-level volumes block declaring mongo-data and the top-level networks block declaring noticeboard-net. Show me the full file.',
          },
          {
            step: 2,
            label: 'Bring the stack up and verify health',
            outcome: 'All three containers running, with mongo confirmed healthy before server started, verified via docker compose ps and logs.',
            prompt:
              'Run `docker compose up -d --build` against the file from step 1. Show me the exact output. Then run `docker compose ps` and explain, using the STATUS column, how you can tell mongo became healthy before server started. Finally show me `docker compose logs server` and point out the specific log line proving the connection to MongoDB succeeded, with no connection-refused noise above it.',
          },
          {
            step: 3,
            label: 'Prove data persistence across a plain teardown',
            outcome: 'A notice posted while the stack is running survives docker compose down followed by docker compose up, but is deliberately destroyed by docker compose down -v.',
            prompt:
              'With the stack running, post a test notice to /api/notices (via the client UI or curl) and confirm it appears in a GET request. Run `docker compose down` (no -v), then `docker compose up -d`, and confirm via GET that the notice survived. Now run `docker compose down -v`, then `docker compose up -d --build` again, and confirm via GET that the notice is gone. Explain in your own words exactly what the -v flag removed and why.',
          },
          {
            step: 4,
            label: 'Confirm the one-command workflow fully replaces Module 5',
            outcome: 'A short written comparison proving the entire Module 5 manual startup ritual — network create, volume create, three docker run commands — is now fully replaced by docker compose up -d --build alone.',
            prompt:
              'Write a short before/after comparison: list the five manual commands (and their flags) you used in Module 5 to start this same stack, next to the single `docker compose up -d --build` command that replaces all of them. Confirm you can tear the whole stack down with `docker compose down` and bring it back up with the one command, with no manual docker network/volume/run commands anywhere in your workflow going forward.',
          },
        ],
        deliverable:
          'A working `docker-compose.yml` at the repo root that brings up `mongo`, `server`, and `client` with one command, waits on a genuine MongoDB healthcheck before starting `server`, and tears down cleanly with `docker compose down` while preserving data — or wipes it deliberately with `docker compose down -v`. This file is our stable base going forward: Module 7 layers a dev-mode override on top of it for a fast, live-reloading local workflow — bind-mounted source, hot reload — without ever touching this file directly. Keep it exactly as it stands here; everything after this module builds *on top of* it, not instead of it.',
      },
    },
  ],
  quiz: [
    {
      id: 'm6-q1',
      q: 'What specific problem does Docker Compose solve for Kundapura Notice Board, compared to how the stack was started in Module 5?',
      options: [
        'It makes each container use less memory than plain docker run',
        'It replaces the network create, volume create, and three separately-ordered docker run commands with one declarative file and one command',
        'It removes the need for Dockerfiles entirely',
        'It automatically writes the application\'s source code for you',
      ],
      answer: 1,
    },
    {
      id: 'm6-q2',
      q: 'In docker-compose.yml, why does the mongo service use `image: mongo:7` while server and client use `build: ./server` and `build: ./client`?',
      options: [
        'image and build do the same thing, so the choice is arbitrary',
        'mongo runs the official pre-built MongoDB image directly, while server and client are your own code built locally from Dockerfiles you wrote',
        'build only works for databases, and image only works for web servers',
        'image is required for every service defined inside docker-compose.yml',
      ],
      answer: 1,
    },
    {
      id: 'm6-q3',
      q: 'What is the difference between `docker compose down` and `docker compose down -v` for this project?',
      options: [
        'There is no difference; -v only prints more verbose output',
        'down -v is faster but otherwise identical',
        'Plain down removes containers and the network but keeps the mongo-data volume, so notices survive; down -v additionally deletes mongo-data, wiping every notice',
        'down -v only rebuilds the client image, leaving the server and mongo untouched',
      ],
      answer: 2,
    },
    {
      id: 'm6-q4',
      q: 'Why does the server service need `depends_on: mongo: condition: service_healthy` instead of the plain short-form `depends_on: - mongo`?',
      options: [
        'The short form is invalid YAML and will not parse at all',
        'The long form is only needed in production, never in local development',
        'The short form only waits for the mongo container to start, not for MongoDB inside it to actually be ready to accept connections; the long form waits for the healthcheck to report healthy',
        'condition: service_healthy makes Compose skip starting mongo entirely',
      ],
      answer: 2,
    },
    {
      id: 'm6-q5',
      q: 'You just edited server/index.js to fix a bug. Which command reliably makes the running stack use your new code?',
      options: [
        '`docker compose up -d`, because Compose always detects source changes automatically',
        '`docker compose logs -f server`, since logs refresh automatically after a save',
        '`docker compose up -d --build`, which forces the server image to rebuild from the updated source before starting',
        '`docker compose down -v`, since removing the volume also refreshes the source code',
      ],
      answer: 2,
    },
  ],
}
