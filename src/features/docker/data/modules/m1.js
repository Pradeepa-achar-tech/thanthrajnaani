// Module 1 — Images & Dockerfiles: Containerize the Server
// Writes the FIRST Dockerfile of the course, for the Express server/ only.
// Module 0 proved Docker itself works (hello-world/mongo/nginx pulled from Docker
// Hub) but the learner has never written a Dockerfile. Here they author
// server/Dockerfile + server/.dockerignore, build an image, run it as a
// container publishing port 5000, and pass MONGO_URI at runtime so the
// containerized server reaches an external MongoDB Atlas free-tier cluster —
// exactly like it connected locally in Module 0. Frontend and a containerized
// Mongo both arrive later (Module 2 hardens this Dockerfile; Modules 3-4 bring
// Mongo in-house).

export const m1 = {
  id: 'm1',
  title: 'Images & Dockerfiles: Containerize the Server',
  hours: 7,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Write your **first Dockerfile** — for the Express API of **Kundapura Notice Board**. You already proved Docker itself works in Module 0 by pulling and running someone else\'s images (`hello-world`, `mongo`, `nginx`); now you author the recipe for your *own* image from scratch. You will learn every core Dockerfile instruction (`FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `CMD`), understand exactly what a **build context** and `.dockerignore` do, see why **layer caching** makes or breaks your rebuild speed, and finally `docker build` + `docker run -p` + `docker run -e` your way to a live containerized server that still talks to your MongoDB Atlas cluster over the internet, exactly as it did running locally.',
  sections: [
    {
      id: 'm1-s1',
      title: 'Dockerfile Fundamentals',
      topics: [
        {
          id: 'm1-t1',
          title: 'Anatomy of a Dockerfile: FROM, WORKDIR, COPY, RUN, EXPOSE, CMD',
          explain:
            'Learn the six core Dockerfile instructions that appear in almost every image — `FROM` picks the base, `WORKDIR` sets the working folder, `COPY` brings files in, `RUN` executes build-time commands, `EXPOSE` documents the listening port, and `CMD` defines what runs when the container starts.',
          analogy:
            'Picture handing a new cook at the **Kundapura fish market\'s tiffin stall** a written recipe card instead of standing over their shoulder. The card says: start with *this* base masala (`FROM`), work at *this* specific counter and not some random table (`WORKDIR`), bring in *these* ingredients from the pantry (`COPY`), prepare them with *these* steps done once before service opens (`RUN`), note that the counter serves through *this* particular window (`EXPOSE`), and finally, once the bell rings, *this* is the one dish you hand out (`CMD`). A Dockerfile is that recipe card — read top to bottom, once, to produce a reusable, repeatable image.',
          theory:
            'A **Dockerfile** is a plain text file, no extension, literally named `Dockerfile`, containing a sequence of instructions that Docker reads top-to-bottom to build an **image** — a self-contained, portable snapshot of a filesystem plus the command needed to run it. The six instructions you will use constantly:\n\n- **`FROM <image>`** — every Dockerfile\'s first real instruction. It picks the **base image** your image builds on top of, instead of starting from a completely empty filesystem. For a Node.js server this is almost always an official `node` image, e.g. `FROM node:20`, which already contains a working Node.js runtime, npm, and a minimal Linux OS.\n- **`WORKDIR <path>`** — sets the working directory *inside the image* for every instruction that follows (and for the container when it eventually runs). If the directory does not exist yet, Docker creates it. Using `WORKDIR /app` means every subsequent `COPY`, `RUN`, and `CMD` operates relative to `/app`, instead of scattering files at the filesystem root.\n- **`COPY <src> <dest>`** — copies files or folders from your **build context** (your project folder, on your machine) into the image being built. `COPY package.json .` copies one file into the current `WORKDIR`; `COPY . .` copies everything in the build context.\n- **`RUN <command>`** — executes a shell command *while the image is being built*, and bakes its result into the image as a new layer. `RUN npm install` is the classic example: it runs once, at build time, and the resulting `node_modules/` folder becomes a permanent part of the image.\n- **`EXPOSE <port>`** — documents which port the application inside the container listens on. It is metadata, not enforcement — it does not by itself make the port reachable from your machine (that is what `docker run -p` does, later in this module). Think of it as a label on the image saying "if you want to reach me, this is the door I am listening at."\n- **`CMD ["executable", "arg1", "arg2"]`** — the default command that runs when a **container** is started *from* the image (not at build time, unlike `RUN`). A Dockerfile can only have one effective `CMD`; if you write several, only the last one takes effect. The preferred **exec form**, `CMD ["node", "src/index.js"]`, runs the process directly rather than through a shell, which matters later for signal handling (e.g. clean shutdowns).\n\nEvery instruction runs in the order it is written, and — critically for the next few topics — each one that changes the filesystem creates a new, cached **layer** stacked on top of the previous one.',
          whyItMatters:
            'Every single Dockerfile you will ever write — for this server, for the client in Module 5, for any future project — is built from exactly these six instructions in roughly this order. Understanding what each one does *and does not* do (especially that `EXPOSE` is documentation, not magic, and that only the last `CMD` counts) prevents a whole class of "my container built fine but nothing happens when I run it" confusion later.',
          steps: [
            'Open the `server/` folder of Kundapura Notice Board in your editor.',
            'Create a new file at the project root named exactly `Dockerfile` (no extension).',
            'Write a `FROM node:20` line as the very first instruction.',
            'Add `WORKDIR /app` immediately after `FROM`.',
            'Note (without writing the full file yet) where `COPY`, `RUN npm install`, another `COPY`, `EXPOSE 5000`, and `CMD` would each go, in that order.',
            'Read through the six instructions out loud in order and explain in one sentence each what happens at that line.',
          ],
          code: `# server/Dockerfile — skeleton showing instruction order (filled in fully in the next topic)

FROM node:20
# ^ base image: official Node.js 20 runtime + npm, on a minimal Linux OS

WORKDIR /app
# ^ every COPY/RUN/CMD below this line happens relative to /app inside the image

COPY package.json package-lock.json .
# ^ bring dependency manifests in first (why this matters: next topic)

RUN npm install
# ^ runs ONCE at build time; the resulting node_modules/ is baked into the image

COPY . .
# ^ bring the rest of the server source code in

EXPOSE 5000
# ^ documents "this image listens on 5000" — does not publish the port by itself

CMD ["node", "src/index.js"]
# ^ the default process a container started from this image will run`,
          pitfalls: [
            '**Naming the file `dockerfile.txt` or `Dockerfile.txt`.** Docker looks for an exact file named `Dockerfile` with no extension by default. Fix: name it precisely `Dockerfile`, capital D, no extension.',
            '**Assuming `EXPOSE 5000` makes the server reachable from your laptop.** It only documents intent; you still need `docker run -p` to actually publish the port. Fix: treat `EXPOSE` as a comment with teeth, not a networking action.',
            '**Writing two `CMD` instructions "just in case".** Docker silently keeps only the last one and ignores the rest. Fix: keep exactly one `CMD`, at the very end of the file.',
            '**Using the shell form `CMD node src/index.js` out of habit.** It runs through `/bin/sh -c`, which can swallow OS signals like `SIGTERM`, making graceful shutdowns harder later. Fix: prefer the exec/JSON array form, `CMD ["node", "src/index.js"]`.',
            '**Putting `WORKDIR` after the first `COPY`.** Files land in the wrong place (often the image\'s filesystem root) before the working directory is even set. Fix: set `WORKDIR` immediately after `FROM`, before any `COPY`/`RUN`.',
            '**Picking an arbitrary or unofficial base image off a random tag.** You inherit unknown security and stability risk. Fix: start from an official `node` image on Docker Hub, exactly as verified in Module 0.',
          ],
          tryIt:
            'Without running anything yet, write out the six-line skeleton above from memory for the Kundapura Notice Board server, then check it word-for-word against the reference — note any instruction you got the order wrong on.',
          takeaway:
            'A Dockerfile is a top-to-bottom recipe of `FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, and `CMD` — each instruction has one specific job, `EXPOSE` documents rather than publishes a port, and only the last `CMD` in the file ever takes effect.',
        },
        {
          id: 'm1-t2',
          title: "Writing the first Dockerfile for the Notice Board's Express server",
          explain:
            'Put the six instructions together into a complete, working `server/Dockerfile` for Kundapura Notice Board: a Node base image, dependency install, source copy, exposed port 5000, and a `CMD` that starts the Express app.',
          analogy:
            'This is the moment the fish market tiffin stall\'s recipe card stops being a sketch on the back of a receipt and becomes the **actual laminated card pinned above the counter** — every ingredient, every step, in the exact order a new cook needs, with nothing left to memory or guesswork. Anyone who picks up this card produces the identical dish, every single time, regardless of which kitchen they are standing in.',
          theory:
            'With all six instructions understood individually, the real `server/Dockerfile` for Kundapura Notice Board\'s Express API looks like this, and every line has a specific reason for being exactly where it is:\n\n```dockerfile\nFROM node:20\nWORKDIR /app\nCOPY package.json package-lock.json .\nRUN npm install\nCOPY . .\nEXPOSE 5000\nCMD ["node", "src/index.js"]\n```\n\nWalking through *why*, not just *what*: `FROM node:20` gives the image a working Node.js 20 runtime and npm without you installing either by hand. `WORKDIR /app` means the server\'s files live tidily under `/app` inside the image rather than scattered at `/`. The **two-step copy** — `package.json`/`package-lock.json` first, then `RUN npm install`, then `COPY . .` for everything else — is deliberate and is the exact subject of the next two topics (build context and layer caching); for now, just note that dependency manifests are copied and installed *before* the rest of the source arrives. `EXPOSE 5000` matches the port the Express server actually listens on (`process.env.PORT || 5000`, as read from `server/src/index.js`). Finally `CMD ["node", "src/index.js"]` runs the exact same entrypoint file the server already uses when started locally with `node src/index.js` outside Docker — Docker is not changing *how* the app runs, only *where* it runs.\n\nOne detail worth naming explicitly: this Dockerfile does **not** set `MONGO_URI` anywhere inside it. Secrets and per-environment configuration like a database connection string do not belong baked into an image — they get supplied at `docker run` time via `-e`, which is exactly the subject of this module\'s last topic. A Dockerfile describes *how to build and start* the app; it deliberately stays ignorant of *which* database it will talk to.',
          whyItMatters:
            'This is the actual file that turns "the Notice Board server runs on my machine" into "the Notice Board server runs identically anywhere Docker is installed" — the single biggest promise Docker makes. Getting this first, working Dockerfile in place is the prerequisite for literally everything else in this course: Compose, volumes, networks, and production deploys all assume you already have an image that builds and runs correctly.',
          steps: [
            'In `server/Dockerfile`, write `FROM node:20` then `WORKDIR /app`.',
            'Add `COPY package.json package-lock.json .` to bring in only the dependency manifests first.',
            'Add `RUN npm install` immediately after.',
            'Add `COPY . .` to bring in the rest of the server source (routes, models, `src/index.js`, etc.).',
            'Add `EXPOSE 5000` to match the port the Express app listens on.',
            'Add `CMD ["node", "src/index.js"]` as the final line, pointing at the real entrypoint file.',
          ],
          code: `# server/Dockerfile — the complete, working first version

FROM node:20

WORKDIR /app

# Dependency manifests first (see next two topics for exactly why)
COPY package.json package-lock.json .
RUN npm install

# Now bring in the rest of the Express server source
COPY . .

# The Express app listens on process.env.PORT || 5000 — see server/src/index.js
EXPOSE 5000

# Same entrypoint used when running "node src/index.js" locally, no Docker
CMD ["node", "src/index.js"]`,
          pitfalls: [
            '**Baking `MONGO_URI` or any secret directly into the Dockerfile with `ENV MONGO_URI=...`.** It gets permanently embedded in the image and image history for anyone to read. Fix: leave connection strings out of the Dockerfile; supply them with `docker run -e` at runtime (last topic of this module).',
            '**Writing `CMD ["npm", "start"]` when `package.json` has no matching `start` script yet.** The container builds fine but crashes immediately on `docker run`. Fix: point `CMD` at the real entrypoint file, `["node", "src/index.js"]`, or add a matching `start` script first.',
            '**Copying the whole project with `COPY . .` before installing dependencies.** Defeats the caching benefit covered in the layer-caching topic. Fix: always copy manifests and `RUN npm install` first, full source second.',
            '**Mismatching `EXPOSE`\'s port number against what the app actually listens on.** `EXPOSE 3000` on a server bound to 5000 is silently misleading. Fix: check `server/src/index.js` for the real `process.env.PORT || 5000` and match it exactly.',
            '**Forgetting `package-lock.json` in the `COPY` line.** `npm install` still works, but without the lockfile present at copy time you lose install reproducibility. Fix: copy both `package.json` and `package-lock.json` together.',
            '**Placing `EXPOSE` before `WORKDIR`/`COPY`/`RUN`.** It technically still works (instruction order for `EXPOSE` is flexible) but reads confusingly out of the natural build-then-run narrative. Fix: keep `EXPOSE` just before `CMD`, matching the file\'s top-to-bottom story.',
          ],
          tryIt:
            'Write the complete `server/Dockerfile` shown above inside your actual Kundapura Notice Board `server/` folder, then open `server/src/index.js` and confirm with your own eyes that the port it listens on matches your `EXPOSE` line and that `src/index.js` is genuinely the file your `CMD` points at.',
          takeaway:
            'The first working `server/Dockerfile` chains `FROM node:20` → `WORKDIR /app` → copy manifests → `RUN npm install` → copy source → `EXPOSE 5000` → `CMD ["node", "src/index.js"]`, deliberately leaving secrets like `MONGO_URI` out of the image entirely.',
        },
        {
          id: 'm1-t3',
          title: 'Build context & .dockerignore — what actually gets sent to the Docker daemon',
          explain:
            'Understand that `docker build` first packages your entire project folder (the **build context**) and sends it to the Docker daemon before a single instruction runs — then use a `.dockerignore` file to exclude bulky or sensitive folders like `node_modules/` and `.git/` from that package.',
          analogy:
            'Before the Kundapura port\'s cargo boat can be loaded for a delivery, every crate on the dock gets swept up and put on board — *including* the empty crates, the broken nets, and last season\'s paperwork nobody bothered to clear away, unless someone specifically marks them "leave this behind." A `.dockerignore` file is that marking: it tells the loaders exactly which crates never belong on the boat in the first place, so the boat sails faster and does not waste hold space on things that will just be thrown out at the other end anyway.',
          theory:
            'When you run `docker build .`, the trailing `.` is not decorative — it names the **build context**: the folder (and everything inside it, recursively) that gets bundled up and sent to the Docker daemon *before* the daemon executes a single `FROM`/`COPY`/`RUN` instruction. Only files inside the build context are ever available to a `COPY` instruction — this is why `COPY . .` can reach your source files at all, and also why it is a whole-folder operation, not a selective one, unless you tell it otherwise.\n\nFor Kundapura Notice Board\'s `server/` folder, running `docker build -t noticeboard-server:v1 .` from inside `server/` means **everything** in that folder gets sent to the daemon by default — including things you never actually want inside the image or even transmitted at all:\n- **`node_modules/`** — potentially hundreds of megabytes of dependencies that `RUN npm install` is about to reinstall fresh inside the image anyway. Sending it wastes time and bandwidth for nothing.\n- **`.git/`** — your entire local git history, commit-by-commit, which has no purpose inside a running container and may contain sensitive history.\n- **`.env`** (if present locally) — a real secrets leak risk if accidentally baked into an image layer via a careless `COPY . .`.\n\nA **`.dockerignore`** file, placed alongside the Dockerfile, lists patterns to exclude from the build context — syntax deliberately mirrors `.gitignore`. Anything matching a `.dockerignore` pattern is never even transmitted to the daemon, let alone copied by `COPY`. This is not just tidiness: a smaller build context genuinely makes every `docker build` faster, especially over a slow connection to a remote Docker daemon, and it closes off an entire category of "I accidentally shipped my `.env` file inside a Docker image" incidents.\n\nFor `server/.dockerignore`:\n```\nnode_modules\nnpm-debug.log\n.git\n.env\n.gitignore\n```\nNote this is a *separate* concern from what ends up *inside* the final image\'s filesystem — `.dockerignore` controls the build context sent to the daemon, while a Dockerfile\'s own instructions control what actually gets baked into image layers. They work together, but are not the same mechanism.',
          whyItMatters:
            'Without a `.dockerignore`, every `docker build` for the Notice Board server would transmit its entire local `node_modules/` and `.git/` history to the daemon on every single build — slow today, and a real secrets-leak risk the day a stray `.env` sits in that same folder. This is a five-line file that permanently prevents an entire category of mistakes.',
          steps: [
            'Inside `server/`, create a new file named exactly `.dockerignore` (note the leading dot, no extension).',
            'Add `node_modules` as the first line.',
            'Add `.git` on its own line.',
            'Add `.env` on its own line so no local secrets file is ever sent to the daemon.',
            'Add `npm-debug.log` and `.gitignore` as good housekeeping additions.',
            'Run `docker build -t noticeboard-server:v1 .` and notice the "Sending build context to Docker daemon" line reports a much smaller size than before.',
          ],
          code: `# server/.dockerignore
node_modules
npm-debug.log
.git
.env
.gitignore

# Before adding .dockerignore, the first line of "docker build" output
# might read something like:
# => [internal] load build context
# => => transferring context: 87.42MB

# After adding .dockerignore (node_modules/ excluded), the same build:
# => [internal] load build context
# => => transferring context: 412.90kB`,
          pitfalls: [
            '**Assuming `.gitignore` automatically also protects `docker build`.** Docker never reads `.gitignore` — it only respects its own `.dockerignore`. Fix: create `.dockerignore` explicitly, even if a `.gitignore` already exists with similar entries.',
            '**Forgetting `.env` in `.dockerignore` and then running `COPY . .`.** Local secrets get baked directly into an image layer, retrievable by anyone who later inspects the image. Fix: always exclude `.env` in `.dockerignore` and pass secrets via `docker run -e` instead.',
            '**Placing `.dockerignore` in the repository root when the Dockerfile lives in `server/`.** Docker only honours a `.dockerignore` sitting next to the Dockerfile *for that specific build context*. Fix: keep `server/.dockerignore` alongside `server/Dockerfile`.',
            '**Not noticing the "Sending build context to Docker daemon" line at all.** A slow build\'s real cause (a bloated context) goes undiagnosed. Fix: actually read that line in the build output, especially if a build feels sluggish.',
            '**Excluding something the Dockerfile actually needs**, like accidentally ignoring `src/`. The build then fails with "file not found" during `COPY`. Fix: after writing `.dockerignore`, always run a fresh build immediately to confirm nothing essential was excluded.',
            '**Believing `.dockerignore` changes what ends up inside the built image\'s layers.** It only affects the build context sent to the daemon; a Dockerfile\'s `COPY`/`RUN` instructions still decide the image\'s actual contents. Fix: keep the two concepts distinct in your head — context vs. image contents.',
          ],
          tryIt:
            'Run `docker build -t noticeboard-server:v1 .` inside `server/` once *before* adding `.dockerignore` and note the "transferring context" size, then add `.dockerignore` and rebuild — compare the two sizes and confirm the second is dramatically smaller.',
          takeaway:
            '`docker build` first bundles the entire folder next to the Dockerfile as the build context; `.dockerignore` excludes bulky or sensitive paths like `node_modules/`, `.git/`, and `.env` from that bundle before it is ever sent to the daemon.',
        },
        {
          id: 'm1-t4',
          title: 'Image layers & the build cache — why COPY package.json before COPY . . matters',
          explain:
            'See that every `RUN`/`COPY` instruction creates its own cached filesystem **layer**, that Docker reuses unchanged layers on rebuild instead of redoing the work, and that copying dependency manifests before the rest of the source is what lets `npm install` be skipped on rebuilds that only change application code.',
          analogy:
            'Think of a **temple prasadam kitchen** preparing for tomorrow\'s seva. Grinding the rice-and-lentil batter is slow and only needs redoing if the *recipe proportions* change. Actually cooking today\'s batch is fast and happens fresh every single day regardless. A smart kitchen grinds a big batch of batter once and reuses it across several days\' cooking, only re-grinding when the recipe itself changes — it does not re-grind batter from scratch every morning just because today\'s vegetables are different. Docker\'s build cache works the same way: it reuses the slow "install dependencies" layer across rebuilds, only redoing it when the dependency manifests themselves actually change.',
          theory:
            'Every instruction in a Dockerfile that touches the filesystem — `COPY`, `RUN`, `ADD` — produces its own **layer**: an immutable, individually cached slice of filesystem changes stacked on top of the layer before it. The final image is simply all its layers stacked together. Docker caches each layer by content: on a rebuild, if an instruction and everything it depends on is *identical* to a previous build, Docker reuses the cached layer instead of re-executing the instruction — this is the **build cache**, and it is the single biggest lever for keeping `docker build` fast during everyday development.\n\nThe cache rule that matters most: **the moment one layer\'s cache is invalidated, every layer after it is rebuilt too**, even if those later instructions themselves did not change. Cache validity cascades downward through the file, never upward.\n\nThis is exactly why the Notice Board `server/Dockerfile` copies `package.json`/`package-lock.json` and runs `npm install` *before* copying the rest of the source with `COPY . .`:\n```dockerfile\nCOPY package.json package-lock.json .\nRUN npm install\nCOPY . .\n```\nWith this order, editing `server/src/routes/notices.js` (application code, not dependencies) only invalidates the *final* `COPY . .` layer and anything after it — the `npm install` layer above it is untouched and reused straight from cache, since its own input (the manifest files) has not changed. `npm install` on a real project can take anywhere from several seconds to a couple of minutes; skipping it on every code-only rebuild is the difference between a multi-second rebuild and a multi-minute one, every single time you touch a route handler.\n\nNow flip the order — imagine `COPY . .` came *before* `RUN npm install`. Any change to *any* file, including a one-line tweak to `notices.js`, would invalidate the `COPY . .` layer, which cascades down and invalidates `RUN npm install` right after it too — forcing a full dependency reinstall on every single code change, even though the dependencies themselves never moved. This single ordering decision is one of the most impactful, easy-to-get-right optimizations in all of Dockerfile authoring.',
          whyItMatters:
            'This ordering trick is not a micro-optimization — it is the difference between a Notice Board server rebuild taking two seconds versus two minutes, every single time you tweak a route or a model, for as long as this project exists. Once you internalize "cheap-to-change files last, expensive-and-rarely-changing files first," you will structure every Dockerfile you ever write this way by instinct.',
          steps: [
            'Run `docker build -t noticeboard-server:v1 .` once inside `server/` and note the total build time.',
            'Without changing anything, run the exact same build again and observe every step reporting "CACHED".',
            'Make a small edit to `server/src/routes/notices.js` (a comment is enough) and rebuild — note only the `COPY . .` step and anything after it re-run, while `npm install` stays `CACHED`.',
            'Now add a brand-new dependency to `package.json` (or bump a version) and rebuild — observe `RUN npm install` itself re-running this time, since its input changed.',
            'Temporarily reorder the Dockerfile to put `COPY . .` before the manifest copy and `npm install`, rebuild after a small source edit, and observe `npm install` re-running unnecessarily.',
            'Revert the Dockerfile back to the correct manifests-first order before moving on.',
          ],
          code: `# First build — everything runs fresh:
$ docker build -t noticeboard-server:v1 .
[+] Building 34.8s (10/10) FINISHED
 => [1/5] FROM docker.io/library/node:20                          2.1s
 => [2/5] WORKDIR /app                                            0.1s
 => [3/5] COPY package.json package-lock.json .                   0.1s
 => [4/5] RUN npm install                                        28.4s
 => [5/5] COPY . .                                                 0.3s

# Rebuild with NO changes — everything is cached, near-instant:
$ docker build -t noticeboard-server:v1 .
[+] Building 0.6s (10/10) FINISHED
 => CACHED [1/5] FROM docker.io/library/node:20
 => CACHED [2/5] WORKDIR /app
 => CACHED [3/5] COPY package.json package-lock.json .
 => CACHED [4/5] RUN npm install
 => CACHED [5/5] COPY . .

# Edit server/src/routes/notices.js only, then rebuild:
$ docker build -t noticeboard-server:v1 .
[+] Building 0.9s (10/10) FINISHED
 => CACHED [1/5] FROM docker.io/library/node:20
 => CACHED [2/5] WORKDIR /app
 => CACHED [3/5] COPY package.json package-lock.json .
 => CACHED [4/5] RUN npm install        <- still cached, dependencies untouched
 => [5/5] COPY . .                       0.4s   <- re-run, source changed`,
          pitfalls: [
            '**Copying `COPY . .` before installing dependencies.** Every source-code edit forces a full `npm install` on rebuild, since the cache cascades downward from the first changed layer. Fix: always copy manifests, install, *then* copy the rest of the source.',
            '**Believing the build cache is shared across different machines or CI runners by default.** It is local to a Docker daemon\'s own layer cache unless you deliberately configure remote cache sharing. Fix: do not assume a teammate\'s fast rebuild means your CI pipeline will be equally fast without extra setup (a later module\'s concern).',
            '**Thinking a "CACHED" layer means the instruction was skipped entirely and does nothing.** It means Docker reused a previously built result identical to what re-running would produce — the effect is the same, just without redoing the work. Fix: treat cache hits as "already correct," not "ignored."',
            '**Changing a dependency version without expecting `npm install` to re-run.** Some assume only `package-lock.json` changes trigger it. Fix: remember *either* `package.json` or `package-lock.json` changing invalidates that `COPY`, and therefore the `RUN npm install` right after it.',
            '**Reordering instructions for "readability" without considering cache impact.** A well-meaning cleanup can accidentally move `COPY . .` earlier and quietly destroy the caching benefit. Fix: treat instruction order in a Dockerfile as a performance decision, not just a stylistic one.',
            '**Forgetting layers cascade only downward, never upward.** Assuming a later, unrelated instruction changing would somehow invalidate an earlier cached layer. Fix: remember cache invalidation always flows from the first changed instruction *down* to the last line of the file, never backward.',
          ],
          tryIt:
            'Time three consecutive `docker build -t noticeboard-server:v1 .` runs by hand: the first fresh build, a second identical rebuild (fully cached), and a third after editing only a comment in `server/src/routes/notices.js` — write down the three durations and confirm the middle one is the fastest and the third only re-runs the final `COPY . .` step onward.',
          takeaway:
            'Each Dockerfile instruction becomes its own cached layer, cache invalidation cascades downward from the first changed instruction, and copying dependency manifests + `npm install` before the rest of the source is what lets everyday code-only rebuilds skip reinstalling dependencies entirely.',
        },
      ],
    },
    {
      id: 'm1-s2',
      title: 'Running & Inspecting Your Image',
      topics: [
        {
          id: 'm1-t5',
          title: 'docker build, tagging images, and docker run -p to publish a port',
          explain:
            'Build the Notice Board server image with `docker build -t`, understand image **tags** as human-readable version labels, and use `docker run -p host:container` to publish the container\'s port so it is reachable from your own machine.',
          analogy:
            'A **tag** on a Docker image is exactly like the handwritten date-and-batch label a Kundapura fish stall pastes on a crate of ice-packed mackerel: `mackerel:22-jul-batch2` tells you precisely which batch you are holding without needing to open the crate. `docker run -p` is the stall physically opening a specific service window onto the street — the fish is prepared and ready *inside*, but nobody outside can be served until that particular window (`5000` on the host, mapped to `5000` inside) is actually propped open.',
          theory:
            'Once `server/Dockerfile` and `server/.dockerignore` exist, building the image is one command, run from inside `server/`:\n```bash\ndocker build -t noticeboard-server:v1 .\n```\n`-t noticeboard-server:v1` **tags** the resulting image with a human-readable name and version, instead of leaving it identified only by an opaque hash. A tag has the shape `name:tag` — if you omit the `:tag` part, Docker defaults to `:latest`, which is a plain convention, not a magic "most recent" marker; `latest` is just a string like any other and does not automatically track your newest build unless you explicitly rebuild with that exact tag. For Kundapura Notice Board, `v1` marks this as the *first* working containerized version of the server — Module 2 will later produce a leaner, hardened image you might tag `v2`.\n\nAfter building, `docker images` lists everything currently stored locally, showing repository name, tag, image ID, creation time, and size.\n\nBuilding an image does not run anything — it only produces a stored template. To actually run it as a live **container**:\n```bash\ndocker run -p 5000:5000 noticeboard-server:v1\n```\nThe `-p host_port:container_port` flag **publishes** a port: it opens a mapping so traffic hitting `localhost:5000` on your machine (the host) gets forwarded into the container\'s internal port `5000`, where Express is actually listening. The two numbers do not have to match — `-p 8080:5000` would let you reach the same container-internal port 5000 via `localhost:8080` instead — but keeping them identical (`5000:5000`) is the least confusing choice while you are still learning, and matches what `EXPOSE 5000` already documented.\n\nWithout `-p`, the container still runs and Express still listens *inside* its own isolated network namespace, but nothing from your host machine can reach it — this is one of the most common "I ran it and nothing happens" moments for beginners, and the fix is always: check whether `-p` was included at all.',
          whyItMatters:
            'This is the moment the Notice Board server stops being an abstract image sitting on disk and becomes a live, reachable process you can actually curl from your own terminal — proof the whole containerization exercise produced something real, not just a build log. Tagging deliberately (`v1`, later `v2`) also gives you an honest, readable history of your own image versions instead of an anonymous pile of hashes in `docker images`.',
          steps: [
            'From inside `server/`, run `docker build -t noticeboard-server:v1 .`.',
            'Run `docker images` and confirm `noticeboard-server` appears with tag `v1`.',
            'Run the container publishing the port: `docker run -p 5000:5000 noticeboard-server:v1` (do not worry about `MONGO_URI` yet — that is the next topic).',
            'In a separate terminal, run `docker ps` and confirm the container is listed as `Up`, with the port mapping shown as `0.0.0.0:5000->5000/tcp`.',
            'Stop the container with `Ctrl+C` (foreground) or `docker stop <container-id>` from another terminal.',
            'Rebuild once more with a deliberately different tag, `noticeboard-server:v1-test`, and confirm `docker images` now lists two separate tagged entries.',
          ],
          code: `# Build, from inside server/:
$ docker build -t noticeboard-server:v1 .
[+] Building 32.1s (10/10) FINISHED
...

# Confirm it exists locally, with the tag you chose:
$ docker images
REPOSITORY           TAG   IMAGE ID       CREATED         SIZE
noticeboard-server    v1    7f2a9c3d1e88   12 seconds ago  1.12GB

# Run it, publishing container port 5000 to host port 5000:
$ docker run -p 5000:5000 noticeboard-server:v1
Notice Board API listening on port 5000
# (this terminal is now attached to the running container's logs)

# In a second terminal, confirm it's actually running:
$ docker ps
CONTAINER ID   IMAGE                     PORTS                    NAMES
a1b2c3d4e5f6   noticeboard-server:v1     0.0.0.0:5000->5000/tcp   agitated_euler`,
          pitfalls: [
            '**Running `docker run noticeboard-server:v1` with no `-p` at all.** The container starts fine, but `localhost:5000` on your machine reaches nothing. Fix: always include `-p host:container` when you need to reach the app from outside the container.',
            '**Assuming `:latest` always means "my most recently built image."** It is just a literal tag string; an old image explicitly tagged `latest` stays `latest` until something rebuilds with that exact tag again. Fix: tag deliberately and meaningfully (`v1`, `v2`), and do not rely on `latest` to imply recency.',
            '**Confusing the two numbers in `-p 5000:5000`.** The first is the **host** port, the second is the **container** port — `-p 8080:5000` means "reach container port 5000 via host port 8080," not the reverse. Fix: read `-p` as `host:container`, always in that order.',
            '**Trying to publish a host port already in use by something else** (e.g. another local server on 5000). Docker fails with an "address already in use" error. Fix: either stop the conflicting process or map to a different host port, e.g. `-p 5050:5000`.',
            '**Forgetting the trailing `.` in `docker build -t noticeboard-server:v1 .`.** Docker errors immediately, since it has no build context to read the Dockerfile from. Fix: always include the context path, `.` when running from inside `server/`.',
            '**Building over and over with the same tag and assuming old containers auto-update.** A container already running from an older build of `v1` keeps running the old code until it is explicitly stopped and a new one started from the freshly built image. Fix: stop and re-run the container after every rebuild you want reflected live.',
          ],
          tryIt:
            'Build `noticeboard-server:v1`, run it with `docker run -p 5000:5000 noticeboard-server:v1`, and in a second terminal run `docker ps` to confirm the exact port mapping shown — then stop the container and re-run it with `-p 5050:5000` instead, confirming the app is now only reachable via `localhost:5050`, not `5000`.',
          takeaway:
            '`docker build -t name:tag .` produces a locally stored, human-labelled image; `docker run -p host:container` is what actually opens a path from your machine into the port the app listens on inside the container — omit `-p` and the container runs, but stays unreachable from outside.',
        },
        {
          id: 'm1-t6',
          title: 'Passing environment variables at runtime with docker run -e, and connecting to MongoDB Atlas from inside a container',
          explain:
            'Supply `MONGO_URI` and `PORT` to the running container with `docker run -e`, understand why env vars (not hardcoded values) are how the same image runs against different databases or settings, and confirm the containerized server can genuinely reach the internet to talk to a MongoDB Atlas cluster.',
          analogy:
            'Think of the same standard tiffin-delivery van used by the Kundapura Notice Board volunteers every single day — the *van* never changes, but the **delivery address slip** taped to the dashboard does: some mornings it says "Gangolli ferry stand," other mornings "temple prasadam counter." The van (the image) is identical every time; only the slip (an environment variable, handed in at the moment it sets off) tells it where to actually go today. `docker run -e MONGO_URI=...` is taping that day\'s address slip onto an otherwise unchanged van.',
          theory:
            'The Notice Board server\'s `server/src/db.js` connects to MongoDB with `mongoose.connect(process.env.MONGO_URI)` — it reads the connection string from an **environment variable**, never a value written directly into the source code. This single design choice is what makes the same built image reusable across every environment it will ever run in: your laptop today, a teammate\'s laptop tomorrow, and a production server much later in this course, each pointing the identical image at a different database, without rebuilding anything.\n\n`docker run -e KEY=value` sets an environment variable *inside* the container\'s process environment at the moment it starts, without it ever being baked into the image itself (contrast this with an `ENV` instruction inside a Dockerfile, which *would* bake a value permanently into every container run from that image — exactly why secrets belong in `-e` at runtime, not in the Dockerfile). Multiple `-e` flags can be supplied on the same `docker run` command:\n```bash\ndocker run -d -p 5000:5000 \\\n  -e MONGO_URI="mongodb+srv://noticeboard_user:<password>@cluster0.mongodb.net/noticeboard" \\\n  -e PORT=5000 \\\n  --name noticeboard-server \\\n  noticeboard-server:v1\n```\nHere, `-d` runs the container **detached** (in the background, freeing up your terminal), `--name noticeboard-server` gives the container a memorable name instead of a random one like `agitated_euler`, and the two `-e` flags supply exactly what `server/src/db.js` and `server/src/index.js` read from `process.env`.\n\nBecause this is Module 1, MongoDB itself is **not yet containerized** — the connection string points at an external **MongoDB Atlas** free-tier cluster reachable over the public internet, exactly as it did when the server ran locally, without Docker, in Module 0. A container is not network-isolated from the internet by default (Docker\'s default bridge networking allows outbound connections), so the containerized Express server reaching out to Atlas over `mongodb+srv://...` works with zero extra configuration — the only thing that changed is *where* the Node process is running (inside a container instead of directly on your OS), not *how* it reaches the internet.\n\nProving this end-to-end means: the container starts without crashing, `docker logs noticeboard-server` shows a successful "Connected to MongoDB" message (or your app\'s equivalent), and a `curl` from your host machine against `/api/notices` and `/health` returns real responses rather than a connection error.',
          whyItMatters:
            'This is the payoff moment for the whole module: a container you built yourself, running your own Dockerfile, genuinely serving live API responses backed by a real cloud database — using nothing but a couple of `-e` flags to tell an otherwise identical image which database to use. It is also the exact pattern (env vars over hardcoded config) that every later module, including Compose and production deploys, builds directly on top of.',
          steps: [
            'Confirm you have a MongoDB Atlas free-tier cluster and connection string ready from Module 0 (or create one now via the Atlas dashboard).',
            'Stop any currently running `noticeboard-server` container from the previous topic.',
            'Run the container detached, named, and with both env vars supplied: `docker run -d -p 5000:5000 -e MONGO_URI="<your-atlas-uri>" -e PORT=5000 --name noticeboard-server noticeboard-server:v1`.',
            'Check `docker logs noticeboard-server` and confirm a successful MongoDB connection message appears, with no crash.',
            'From your host machine, run `curl http://localhost:5000/health` and confirm a healthy response.',
            'Run `curl http://localhost:5000/api/notices` and confirm it returns a JSON array (empty or with existing notices) rather than an error.',
          ],
          code: `# Run detached, named, with env vars supplied at runtime (not baked into the image):
$ docker run -d -p 5000:5000 \\
    -e MONGO_URI="mongodb+srv://noticeboard_user:<password>@cluster0.mongodb.net/noticeboard" \\
    -e PORT=5000 \\
    --name noticeboard-server \\
    noticeboard-server:v1
a7e3f9c21d0b4558...

# Check the logs for a successful Atlas connection:
$ docker logs noticeboard-server
Connected to MongoDB Atlas
Notice Board API listening on port 5000

# From your HOST machine (not inside the container), prove it's reachable:
$ curl http://localhost:5000/health
{"status":"ok"}

$ curl http://localhost:5000/api/notices
[]

# Post one notice to prove writes reach Atlas too:
$ curl -X POST http://localhost:5000/api/notices \\
    -H "Content-Type: application/json" \\
    -d '{"title":"Ferry delayed","message":"Gangolli ferry running 30 min late today","category":"Bus & Ferry","postedBy":"Suresh"}'
{"_id":"...","title":"Ferry delayed", ...}`,
          pitfalls: [
            '**Hardcoding the Atlas connection string directly in `server/src/db.js` instead of reading `process.env.MONGO_URI`.** The image then only ever works against one specific database, baked in permanently. Fix: always read secrets from `process.env` in the source, and supply the actual value only via `-e` at runtime.',
            '**Putting `ENV MONGO_URI=mongodb+srv://...` inside the Dockerfile "for convenience."** This permanently bakes a real secret into the image, visible to anyone who runs `docker history` or pulls the image. Fix: never put real secrets in a Dockerfile; supply them at `docker run` time.',
            '**Forgetting the special characters in an Atlas password may need URL-encoding inside the connection string.** A `@` or `#` in the raw password breaks the URI parsing silently. Fix: URL-encode any special characters in the password portion of `MONGO_URI`.',
            '**Not checking Atlas\'s Network Access / IP allowlist.** Atlas by default can reject connections from IPs not explicitly allowed, causing a connection timeout that looks like a Docker networking problem but is not. Fix: confirm your current IP (or `0.0.0.0/0` for free-tier testing) is allowed in the Atlas dashboard before debugging Docker.',
            '**Running `docker run` twice with `--name noticeboard-server` without removing the first container.** Docker refuses with "the container name is already in use." Fix: `docker stop noticeboard-server && docker rm noticeboard-server` before re-running, or use `docker rm -f noticeboard-server` in one step.',
            '**Assuming a crashed container due to a bad `MONGO_URI` will show an obvious error at `docker run` time.** The command often returns successfully (the container starts) even though the app inside crashes moments later on a failed connection. Fix: always follow up with `docker logs <name>` and `docker ps` to confirm the container is genuinely still `Up`, not silently exited.',
          ],
          tryIt:
            'Run the full `docker run -d -p 5000:5000 -e MONGO_URI=... -e PORT=5000 --name noticeboard-server noticeboard-server:v1` command with your real Atlas URI, then in order: check `docker logs noticeboard-server`, `curl localhost:5000/health`, `curl localhost:5000/api/notices`, and finally `docker history noticeboard-server:v1` — confirm none of the history layers reveal your Atlas password anywhere.',
          takeaway:
            '`docker run -e KEY=value` supplies configuration and secrets at container start time, kept entirely out of the image itself, which is exactly what lets one built image — `noticeboard-server:v1` — connect to any MongoDB Atlas cluster (or later, any database at all) without ever being rebuilt.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm1-p1',
      type: 'Mini Project',
      title: 'Containerize the Notice Board API',
      domain: 'Backend / Docker',
      duration: '3-4 hrs',
      description:
        'Write `server/Dockerfile` and `server/.dockerignore` from scratch for the Kundapura Notice Board Express API, build it into a tagged image, run it as a detached container publishing port 5000 and connecting to a real MongoDB Atlas free-tier cluster via `-e` environment variables, then prove the whole path works end-to-end with `curl` against `/api/notices` and `/health` from your host machine, and inspect the image\'s layer history with `docker history`.',
      tools: ['Docker Desktop', 'Docker CLI', 'Node.js 20', 'MongoDB Atlas (free tier)', 'curl'],
      blueprint: {
        overview:
          'By the end of Module 0 you proved Docker itself works, but every image you ran was someone else\'s. This project produces the first image *you* authored: a container that runs the real Kundapura Notice Board Express API, built from a Dockerfile you wrote by hand, reachable from your own machine, and genuinely persisting data to a cloud MongoDB Atlas cluster — the exact same Atlas cluster the server already used when it ran locally, unContainerized, in Module 0. Nothing about the server\'s own code changes; only *where* it runs does.',
        functionalRequirements: [
          'Write a complete `server/Dockerfile` using `FROM node:20`, `WORKDIR /app`, a manifests-first `COPY`+`RUN npm install` pair, a full source `COPY . .`, `EXPOSE 5000`, and a `CMD` pointing at the real entrypoint.',
          'Write a `server/.dockerignore` excluding at minimum `node_modules`, `.git`, and `.env`.',
          'Build the image with an explicit, meaningful tag: `docker build -t noticeboard-server:v1 .`.',
          'Run the image as a detached, named container publishing port 5000, supplying `MONGO_URI` (your real Atlas connection string) and `PORT=5000` via `-e` flags — never hardcoded, never baked into the Dockerfile.',
          'Prove the running container actually serves real traffic: `curl` both `GET /health` and `GET /api/notices` from your host machine and get valid responses back, and additionally `POST` one real notice to confirm writes reach Atlas.',
        ],
        technicalImplementation: [
          'Confirm `server/src/index.js` reads its listening port from `process.env.PORT || 5000` and `server/src/db.js` reads its connection string from `process.env.MONGO_URI` — the Dockerfile and `docker run` command depend entirely on both already being true.',
          'Order Dockerfile instructions manifests-first (`COPY package.json package-lock.json .` then `RUN npm install`) before the full `COPY . .`, specifically so future code-only rebuilds skip reinstalling dependencies.',
          'Use `docker build -t noticeboard-server:v1 .` from inside `server/`, then confirm with `docker images` that the tag appears as expected.',
          'Use `docker run -d -p 5000:5000 -e MONGO_URI="<atlas-uri>" -e PORT=5000 --name noticeboard-server noticeboard-server:v1` to start the container detached and named.',
          'Verify with `docker logs noticeboard-server`, `docker ps`, `curl http://localhost:5000/health`, `curl http://localhost:5000/api/notices`, and finally `docker history noticeboard-server:v1` to visually confirm the image\'s layer stack and that no secret value appears baked into any layer.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Write the Dockerfile and .dockerignore',
            outcome: 'A complete `server/Dockerfile` and `server/.dockerignore` sitting alongside the existing Express server source.',
            prompt:
              'Write a `server/Dockerfile` for the Kundapura Notice Board Express API using `FROM node:20`, `WORKDIR /app`, then a manifests-first `COPY package.json package-lock.json .` followed by `RUN npm install`, then `COPY . .` for the rest of the source, `EXPOSE 5000`, and `CMD ["node", "src/index.js"]`. Alongside it, write `server/.dockerignore` excluding `node_modules`, `.git`, `.env`, `npm-debug.log`, and `.gitignore`. Explain in one or two sentences why the manifests are copied and installed before the rest of the source.',
          },
          {
            step: 2,
            label: 'Build and tag the image',
            outcome: 'A locally built image tagged `noticeboard-server:v1`, confirmed via `docker images`.',
            prompt:
              'From inside the `server/` folder, run `docker build -t noticeboard-server:v1 .` and show the full build output. Then run `docker images` and confirm `noticeboard-server:v1` is listed with a size and creation time. If the build fails, show the exact error and explain what it means before fixing it.',
          },
          {
            step: 3,
            label: 'Run it against MongoDB Atlas and prove it end-to-end',
            outcome: 'A detached, named container serving real API traffic backed by a live MongoDB Atlas cluster.',
            prompt:
              'Run the image as a detached, named container publishing port 5000, passing your real MongoDB Atlas connection string and the port via `-e MONGO_URI=... -e PORT=5000`. Show the exact command (with the password redacted in whatever you paste back to me). Then show `docker logs noticeboard-server` confirming a successful MongoDB connection, `curl http://localhost:5000/health`, `curl http://localhost:5000/api/notices`, and one `curl -X POST` creating a real notice — show all four outputs.',
          },
          {
            step: 4,
            label: 'Inspect the image and reflect on what is still naive',
            outcome: 'A `docker history noticeboard-server:v1` walkthrough plus a short written note on this Dockerfile\'s current limitations.',
            prompt:
              'Run `docker history noticeboard-server:v1` and walk through what each layer represents, confirming no Atlas password or secret appears in the layer history. Then write 3-4 sentences describing what is still naive or unfinished about this first Dockerfile and setup — for example: no smaller base image, dependencies installed with `npm install` instead of a lockfile-strict command, no distinction between dev and prod, and MongoDB still living outside Docker entirely on Atlas rather than containerized alongside the server.',
          },
        ],
        deliverable:
          'A working `server/Dockerfile` and `server/.dockerignore`, a locally built and tagged `noticeboard-server:v1` image, and a running, named container publishing port 5000 that successfully serves `GET /health`, `GET /api/notices`, and `POST /api/notices` against a real MongoDB Atlas free-tier cluster — verified end-to-end with `curl` from your host machine, plus a `docker history` walkthrough confirming no secret leaked into any image layer. This Dockerfile works, but it is deliberately naive: it uses a full (not slim/alpine) Node base image, `npm install` instead of a stricter, faster `npm ci`, and no separation between build-time and run-time configuration via `ARG`/`ENV`. Module 2 tightens all of this up and, just as importantly, brings MongoDB in-house as its own container instead of reaching out to Atlas over the internet.',
      },
    },
  ],
  quiz: [
    {
      id: 'm1-q1',
      q: 'In a Dockerfile, why does WORKDIR /app need to appear before the COPY and RUN instructions that follow it?',
      options: [
        'WORKDIR only affects the final CMD, not COPY or RUN',
        'WORKDIR sets the working directory inside the image for every subsequent instruction, so files land in a predictable location instead of scattering at the filesystem root',
        'WORKDIR is purely cosmetic and has no effect on where files are copied',
        'WORKDIR must always be the very first line, before even FROM',
      ],
      answer: 1,
    },
    {
      id: 'm1-q2',
      q: 'You forgot to add node_modules to server/.dockerignore before running docker build. What is the most direct consequence?',
      options: [
        'The build fails immediately with an error',
        'Docker automatically ignores node_modules regardless, since it always excludes common folders by default',
        'The entire local node_modules folder gets sent to the Docker daemon as part of the build context, making the build slower than necessary, even though RUN npm install will reinstall dependencies fresh anyway',
        'It has no effect on build time, only on final image size',
      ],
      answer: 2,
    },
    {
      id: 'm1-q3',
      q: 'Why does the Notice Board server\'s Dockerfile COPY package.json and package-lock.json and run npm install BEFORE copying the rest of the source with COPY . .?',
      options: [
        'It is required syntax — Dockerfiles will not build otherwise',
        'It makes the final image smaller regardless of caching behaviour',
        'It lets Docker reuse the cached npm install layer on rebuilds where only application source changed, since that layer\'s cache is only invalidated when the manifest files themselves change',
        'It has no effect on build speed, only on readability of the Dockerfile',
      ],
      answer: 2,
    },
    {
      id: 'm1-q4',
      q: 'You ran `docker run noticeboard-server:v1` (no flags) and the container shows as "Up" in `docker ps`, but `curl http://localhost:5000/health` fails to connect. What is the most likely cause?',
      options: [
        'The image was built incorrectly and needs to be rebuilt from scratch',
        'MongoDB Atlas is unreachable',
        'The container never actually started',
        'No port was published with -p, so nothing on the host machine can reach the port the app is listening on inside the container',
      ],
      answer: 3,
    },
    {
      id: 'm1-q5',
      q: 'Why does the Notice Board server read its database connection string from process.env.MONGO_URI and receive it via `docker run -e MONGO_URI=...`, instead of writing the Atlas connection string directly into the Dockerfile with an ENV instruction?',
      options: [
        'ENV instructions are not supported in Docker at all',
        'Environment variables passed at "docker run" time keep secrets out of the image itself and let the exact same built image be pointed at different databases without ever being rebuilt',
        'process.env only works if the value is also hardcoded in the Dockerfile as a fallback',
        'MONGO_URI must always be set as a build-time ARG, never a runtime -e flag',
      ],
      answer: 1,
    },
  ],
}
