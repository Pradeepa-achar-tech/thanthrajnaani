// Module 2 — Backend Containers in Depth: Add MongoDB as a Container
// Module 1 ended with a naive server/Dockerfile talking to MongoDB Atlas over
// the internet. This module hardens that Dockerfile (npm ci, ENV vs ARG,
// lifecycle flags) AND, for the first time, brings MongoDB in-house as its
// own local container — wired to the server the clunky, old-school way
// (--link / manual IP via docker inspect) on purpose, so Module 4's proper
// user-defined network lands as a satisfying fix rather than unexplained
// magic. Module 3 will fix the data-loss problem this module deliberately
// surfaces, with named volumes.

export const m2 = {
  id: 'm2',
  title: 'Backend Containers in Depth: Add MongoDB as a Container',
  hours: 7,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'Take the naive `server/Dockerfile` from Module 1 and make it production-grade: reproducible installs with **npm ci**, a pinned **node:20-alpine** base, the real difference between **ENV** and **ARG**, and lifecycle flags like `--restart` and `--name`. Then do the thing this module is really about — stop depending on MongoDB Atlas over the internet and run **MongoDB itself as a local container**. You will wire the server to it the clunky, old-school way (`--link`, or a manually inspected IP address) so you feel exactly why that approach is fragile — setting up Module 4\'s proper fix. Along the way you will surface, on purpose, a problem you do **not** yet solve: remove the Mongo container and every notice vanishes. That is Module 3\'s job.',
  sections: [
    {
      id: 'm2-s1',
      title: 'Better Dockerfiles',
      topics: [
        {
          id: 'm2-t1',
          title: 'npm ci vs npm install in a Dockerfile, and pinning Node versions with FROM node:20-alpine',
          explain:
            'Rewrite `server/Dockerfile` to install dependencies with `npm ci` instead of `npm install`, and pin the base image to an exact, small Node version with `FROM node:20-alpine`, so the image you build today behaves identically to the one you build in six months.',
          analogy:
            'At the Kundapura fish market, a regular customer says "give me whatever looks good today" — the vendor improvises, and the basket is a little different every visit. A standing order says "exactly two kilos of bangude, the same grade as last time, nothing else" — the vendor checks a written slip and hands over precisely that, every single time. `npm install` is the improvised basket: it happily updates things to satisfy version ranges. `npm ci` is the standing order: it reads the locked slip (`package-lock.json`) and refuses to hand over anything that does not match it exactly.',
          theory:
            '`npm install` and `npm ci` both put packages into `node_modules`, but they behave very differently, and only one belongs inside a Dockerfile.\n\n`npm install` reads `package.json`, resolves version *ranges* (`^4.18.0` can mean anything from `4.18.0` up to but not including `5.0.0`), may **update** `package-lock.json` to reflect newer matching versions it finds, and will happily proceed even if the lock file and `package.json` disagree. That flexibility is exactly what you want on your own laptop while adding a new dependency, and exactly what you do **not** want inside a Docker build.\n\n`npm ci` (short for "clean install") instead: requires a `package-lock.json` to already exist (it errors out if there is none), **deletes** `node_modules` first for a truly clean slate, installs the **exact** versions pinned in the lock file — no range resolution, no surprises — and fails loudly if `package.json` and `package-lock.json` are out of sync. That is precisely the guarantee a Docker image needs: build the Kundapura Notice Board server image today, and build it again next month from the same lock file, and you get byte-for-byte the same dependency tree both times. `npm ci` is also noticeably faster in CI/Docker contexts because it skips the resolution step entirely.\n\nThe second half of reproducibility is the base image itself. `FROM node:20-alpine` pins two things at once: the **major Node version** (`20`, the current LTS at the time this course was written — not "whatever `latest` happens to point at this week"), and the **distribution** (`alpine`, a minimal Linux built on `musl` libc instead of `glibc`, roughly 5MB versus the ~180MB+ of the full `node:20` image). Smaller image = faster `docker pull`/`docker push`, smaller attack surface, less disk on your machine and the eventual server. The trade-off: Alpine ships without common native build tools (`python3`, `make`, `g++`), so packages with native bindings (e.g. `bcrypt`, `sharp`) can fail to install until you `apk add` those tools. The Notice Board server\'s dependencies (`express`, `mongoose`, `cors`) are pure JavaScript, so plain `node:20-alpine` is the right, smallest choice here.',
          whyItMatters:
            'A Dockerfile that uses `npm install` and `FROM node:latest` can build a *different* image every time it runs — a dependency bump upstream, or a new Node major release, changes what ends up inside without you touching a single line of your own code. For Kundapura Notice Board\'s server, that unpredictability is exactly what breaks "it worked on my machine" trust in containers in the first place. `npm ci` plus a pinned base image is what makes a Docker image trustworthy: the same input always produces the same output.',
          steps: [
            'Open `server/Dockerfile` from Module 1 and change its first line to `FROM node:20-alpine`.',
            'Ensure the Dockerfile copies `package.json` **and** `package-lock.json` (`COPY package*.json ./`) before copying the rest of the source.',
            'Replace `RUN npm install` with `RUN npm ci --omit=dev` so devDependencies never ship in the runtime image.',
            'Rebuild the image: `docker build -t noticeboard-server .` and confirm it completes without errors.',
            'Rebuild it a second time on a clean checkout and diff `npm ls --all` output from a container run of each image — confirm they match exactly.',
            'Deliberately edit one version number inside `package-lock.json` so it disagrees with `package.json`, rebuild, and read the error `npm ci` produces.',
          ],
          code: `# server/Dockerfile — before (Module 1, works but not reproducible)
FROM node
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "src/index.js"]

# server/Dockerfile — after (this module)
FROM node:20-alpine
WORKDIR /app

# Copy ONLY the manifest files first so this layer caches
# independently of source code changes:
COPY package*.json ./
RUN npm ci --omit=dev

# Now copy the rest of the Notice Board server source:
COPY . .

EXPOSE 5000
CMD ["node", "src/index.js"]

# Build it:
docker build -t noticeboard-server .
# => [+] Building 8.2s
# =>  => [2/5] WORKDIR /app
# =>  => [3/5] COPY package*.json ./
# =>  => [4/5] RUN npm ci --omit=dev
# =>  added 68 packages in 2s
# =>  => [5/5] COPY . .

# Deliberately break the lock file to see npm ci refuse to guess:
# (edit mongoose version in package-lock.json to something not in package.json)
docker build -t noticeboard-server .
# => npm ERR! \`npm ci\` can only install packages when your package.json
# => npm ERR! and package-lock.json are in sync. Please update your lock file.`,
          pitfalls: [
            '**Using `npm install` inside a Dockerfile "because it always worked before."** It can silently pick up newer patch/minor versions and quietly rewrite `package-lock.json` inside the image build. Fix: use `npm ci`, which only ever installs exactly what the lock file says.',
            '**Copying the whole project before running the install step.** Every source code change then invalidates Docker\'s layer cache for the install step too, so a one-line code edit triggers a full dependency reinstall. Fix: `COPY package*.json ./` first, install, **then** `COPY . .`.',
            '**Running `npm ci` with no `package-lock.json` committed to the repo.** The build fails immediately with "The npm ci command can only install with an existing package-lock.json." Fix: always commit the lock file for the Notice Board server.',
            '**Pinning `FROM node:latest` instead of an explicit version.** "Latest" silently moves to a new Node major release whenever the image is rebuilt from scratch, potentially breaking the app with no code change on your side. Fix: pin `node:20-alpine` (or whichever exact major you have tested against).',
            '**Forgetting Alpine lacks native build tools** when a future dependency needs to compile C bindings (e.g. adding `bcrypt` for auth later). The build fails with a cryptic `node-gyp` error. Fix: `apk add --no-cache python3 make g++` before `npm ci`, or switch to `node:20-slim` for that dependency.',
            '**Shipping devDependencies into the production image** by running plain `npm ci` without `--omit=dev`. The image balloons with test runners and linters it will never use at runtime. Fix: use `npm ci --omit=dev` for the final runtime image.',
          ],
          tryIt:
            'Rebuild `noticeboard-server` twice in a row from the same `package-lock.json` and confirm (via `docker run --rm noticeboard-server npm ls --all`) the installed package tree is byte-for-byte identical both times. Then hand-edit one version number in `package-lock.json` so it no longer matches `package.json`, rebuild, and read the exact error `npm ci` gives you.',
          takeaway:
            '`npm ci` installs exactly what `package-lock.json` says with no guessing, and pinning `FROM node:20-alpine` fixes the base image too — together they make the Notice Board server image reproducible instead of "whatever the internet handed me today."',
        },
        {
          id: 'm2-t2',
          title: 'ENV vs ARG — build-time vs run-time configuration',
          explain:
            'Learn the difference between `ARG` (a value only available while `docker build` is running, and gone afterward unless promoted) and `ENV` (a value baked into the image and present in every container started from it, still overridable at `docker run` time) — and use each correctly for the Notice Board server.',
          analogy:
            'When a fishing boat is being *built* at the Kundapura boatyard, the carpenter needs a spec sheet — hull length, wood grade, engine model — but that spec sheet stays in the boatyard office once the boat sails; the boat itself does not carry it around. That spec sheet is `ARG`. What the boat *does* carry, painted on its hull for every harbour it visits, is its registration number and home port — visible for its entire working life, and, if the owner insists, repainted at a later port. That is `ENV`.',
          theory:
            '`ARG` declares a variable that exists **only during the `docker build` process**. You supply a value with `docker build --build-arg NAME=value`, and it can be used to parameterize the build itself (choosing a base image tag, toggling a build step). Once the build finishes, that value is **gone** — it does not appear in `docker inspect` of a running container, and code inside the running container cannot read it, unless you deliberately copy it into an `ENV`.\n\n`ENV` declares a variable that gets **baked into the image** and is then present as a real environment variable in every container started from that image — visible to your Node.js code via `process.env.PORT`, and visible via `docker inspect`. Crucially, `ENV` values set in the Dockerfile are only **defaults**: `docker run -e PORT=6000 ...` overrides them for that specific container without needing a rebuild.\n\nThe common "promotion" pattern links the two:\n```dockerfile\nARG NODE_ENV=production\nENV NODE_ENV=$NODE_ENV\nENV PORT=5000\n```\nHere, `NODE_ENV` can be chosen at build time (`--build-arg NODE_ENV=development` for a dev-flavoured image) but still ends up as a real runtime environment variable inside the container. `PORT=5000` is a plain `ENV` — a sensible default the Notice Board server listens on (`process.env.PORT || 5000`), which anyone running the container can still override.\n\nThe one variable you must **never** put in either `ARG` or `ENV` inside the Dockerfile is `MONGO_URI` — it contains a hostname (soon, credentials, once auth is added) and belongs to the *environment the container runs in*, not to the image itself. It should only ever be supplied at `docker run -e MONGO_URI=...` time, kept out of the image entirely. Both `ARG` and `ENV` values are visible forever in `docker history <image>` — anyone who receives the image can see them, which is exactly why secrets never belong in either.',
          whyItMatters:
            'Baking `MONGO_URI` into the image would mean every environment (your laptop, a teammate\'s laptop, eventually a hosted server) needs its **own rebuilt image** just to point at a different database — and worse, the connection string sits readable inside the image forever. Keeping it as a runtime-only value supplied via `docker run -e` means one single Notice Board server image works everywhere, pointed wherever needed, without ever being rebuilt just to change where it connects.',
          steps: [
            'Add `ARG NODE_ENV=production` near the top of `server/Dockerfile`, after `FROM`.',
            'Promote it with `ENV NODE_ENV=$NODE_ENV` so the value survives into the running container.',
            'Add a plain `ENV PORT=5000` as the server\'s default listening port.',
            'Build the image once with the default: `docker build -t noticeboard-server .`',
            'Build it again overriding the build arg: `docker build --build-arg NODE_ENV=development -t noticeboard-server:dev .`',
            'Run a container from each image and confirm `process.env.NODE_ENV` differs, while `MONGO_URI` is supplied only via `-e` at `docker run` time, never baked in.',
          ],
          code: `# server/Dockerfile — relevant excerpt
FROM node:20-alpine
WORKDIR /app

# Build-time only, with a sensible default:
ARG NODE_ENV=production
# Promote it so the running container can read it too:
ENV NODE_ENV=$NODE_ENV
ENV PORT=5000

COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

EXPOSE 5000
CMD ["node", "src/index.js"]

# Build using the ARG default (production):
docker build -t noticeboard-server .

# Build overriding the ARG for a dev-flavoured image:
docker build --build-arg NODE_ENV=development -t noticeboard-server:dev .

# NODE_ENV is now baked in as a runtime ENV — visible inside the container:
docker run --rm noticeboard-server node -e "console.log(process.env.NODE_ENV)"
# -> production

# MONGO_URI is NEVER in the Dockerfile — it is supplied only at run time:
docker run -d --name noticeboard-server -p 5000:5000 \\
  -e MONGO_URI="mongodb://<mongo-ip>:27017/noticeboard" \\
  -e PORT=5000 \\
  noticeboard-server

# Prove ARG does not survive into the container by itself (only ENV does):
docker inspect noticeboard-server --format '{{ .Config.Env }}'
# -> [NODE_ENV=production PORT=5000 MONGO_URI=mongodb://...]  (only what was promoted or run with -e)`,
          pitfalls: [
            '**Writing `ENV MONGO_URI=mongodb://...` directly in the Dockerfile.** The connection string is now baked into the image and readable by anyone who pulls it, forever, via `docker history`. Fix: never put connection strings or secrets in `ENV` or `ARG` — supply them only at `docker run -e` time.',
            '**Expecting an `ARG` value to be visible inside the running container without promoting it.** `docker run` shows no such variable, and Node.js code reading `process.env.NODE_ENV` sees nothing. Fix: promote it explicitly with `ENV NODE_ENV=$NODE_ENV` right after declaring the `ARG`.',
            '**Using `ARG` for a value that legitimately differs per environment**, like `MONGO_URI`, forcing a full image rebuild every time you point at a different database. Fix: reserve `ARG` for build-time choices (which Node version, which npm registry); use runtime `-e` for anything environment-specific.',
            '**Giving an `ARG` no default value.** A teammate who forgets `--build-arg NODE_ENV=...` gets an empty string baked in silently instead of a clear error. Fix: always write `ARG NODE_ENV=production` with a sensible fallback.',
            '**Assuming ARG/ENV values are hidden once the image is built.** Both remain fully visible via `docker history <image>` and `docker inspect`, forever, to anyone with the image. Fix: treat every `ARG`/`ENV` line as public information; keep genuine secrets out of the Dockerfile entirely.',
            '**Declaring `ARG` after `FROM` when trying to parameterize the `FROM` line itself** (e.g. `ARG NODE_VERSION` used in `FROM node:$NODE_VERSION-alpine`). Docker requires that specific `ARG` to be declared *before* `FROM`. Fix: put version-selecting `ARG`s above `FROM`, and redeclare them below `FROM` again if later instructions also need them.',
          ],
          tryIt:
            'Build `noticeboard-server` twice — once with the default `NODE_ENV` and once with `--build-arg NODE_ENV=development` — then run `docker inspect` on containers from both images and confirm `NODE_ENV` differs between them, while confirming `MONGO_URI` appears in neither image\'s `docker history`, only in the `docker run -e` command you type.',
          takeaway:
            '`ARG` is a build-time-only value gone unless promoted; `ENV` bakes a default into the image but stays overridable at `docker run -e` — and secrets like `MONGO_URI` belong in neither, only in `-e` flags at run time.',
        },
        {
          id: 'm2-t3',
          title: 'Container lifecycle flags: --restart, --name, and why containers are ephemeral',
          explain:
            'Use `--name` to give the Notice Board server and Mongo containers memorable, targetable names, `--restart unless-stopped` so they survive crashes and machine reboots, and understand precisely what "ephemeral" means: a container\'s writable layer disappears the moment it is removed, not when it is merely stopped.',
          analogy:
            'At the Gangolli ferry crossing, the harbourmaster does not refer to boats as "hull #4471" — each ferry has a painted name, so instructions ("tow that one in for repairs") are unambiguous. That is `--name`. During monsoon, if a ferry\'s engine stalls, the crew\'s standing order is "restart it, unless we ourselves deliberately docked it for the day" — that sensible middle ground is `--restart unless-stopped`. And whatever chalk marks a deckhand scribbles on the ferry\'s hull during a single crossing wash off completely once that ferry is finally decommissioned and broken up for scrap — nothing written there was ever meant to last. That is a container\'s ephemeral writable layer.',
          theory:
            '`--name` assigns a human-readable name to a container instead of Docker\'s randomly generated one (`recursing_hopper` and similar). For Kundapura Notice Board, `--name noticeboard-server` and `--name noticeboard-mongo` mean every later command — `docker logs noticeboard-server`, `docker exec -it noticeboard-mongo mongosh`, `docker stop noticeboard-server` — targets the right container by a name you chose, instead of an ID you have to look up first. A name must be unique among containers on the machine (running or stopped); reusing one while the old container still exists errors with "the container name is already in use".\n\n`--restart` controls what Docker does when a container\'s process exits, or the whole Docker daemon restarts (e.g. after your machine reboots). The policies:\n- `no` — the default; never restart automatically.\n- `on-failure[:N]` — restart only if the process exited with a non-zero (error) code, optionally capped at N attempts.\n- `always` — always restart, including after an explicit `docker stop`, once the daemon itself next starts up.\n- `unless-stopped` — restart automatically on crash or daemon/machine restart, **except** if you yourself last stopped it deliberately with `docker stop` — that "off" state sticks until you explicitly start it again.\n\nFor local development, `unless-stopped` on both `noticeboard-server` and `noticeboard-mongo` is the sensible choice: they survive an accidental crash or a laptop reboot, but a deliberate `docker stop` actually stays stopped instead of Docker quietly bringing it back.\n\nThe deeper concept underneath both flags: **containers are ephemeral**. A container\'s filesystem is the image\'s read-only layers plus one thin writable layer on top, created fresh for that specific container. `docker stop` merely pauses the process — the writable layer, and anything in it, is still there when you `docker start` it again. But `docker rm` (or replacing a container by running a fresh `docker run` with the same name after removing the old one) throws that writable layer away permanently. Any notice inserted directly into a Mongo container\'s data files, or any file written inside the server container at runtime, lives only in that writable layer — gone the instant the container is removed, not when it is merely stopped.',
          whyItMatters:
            'This module runs Mongo as a plain container with nowhere durable to put its data yet — so understanding precisely when data disappears (on `rm`, not on `stop`) is what will make Module 3\'s named-volume fix land as an obvious necessity rather than an arbitrary extra step. `--name` and `--restart unless-stopped` also make day-to-day local development with two always-on containers (server + Mongo) far less annoying to manage.',
          steps: [
            'Run the server container with `docker run -d --name noticeboard-server --restart unless-stopped -p 5000:5000 noticeboard-server`.',
            'Confirm the name is set with `docker ps --format "table {{.Names}}\\t{{.Status}}"`.',
            'Stop it with `docker stop noticeboard-server`, then run `docker ps -a` and confirm it still exists (just not running).',
            'Restart your machine (or simulate by restarting Docker Desktop) and confirm a container left running before restart comes back automatically, while one you deliberately stopped stays stopped.',
            'Start it again with `docker start noticeboard-server` and confirm any files it wrote before still exist.',
            'Now `docker rm -f noticeboard-server` and re-run the same `docker run` command — confirm it is a **brand-new** container with a fresh, empty writable layer, not a resurrection of the old one.',
          ],
          code: `# Named, with a sensible restart policy for local dev:
docker run -d \\
  --name noticeboard-server \\
  --restart unless-stopped \\
  -p 5000:5000 \\
  -e MONGO_URI="mongodb://<mongo-ip>:27017/noticeboard" \\
  noticeboard-server

docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
# NAMES                STATUS          PORTS
# noticeboard-server   Up 12 seconds   0.0.0.0:5000->5000/tcp

# Stop vs remove — the crucial difference:
docker stop noticeboard-server
docker ps -a --filter name=noticeboard-server
# NAMES                STATUS
# noticeboard-server   Exited (0) 3 seconds ago   <- still exists!

docker start noticeboard-server   # brings the SAME container back, same writable layer

# Removing is different — the writable layer is gone for good:
docker rm -f noticeboard-server
docker run -d --name noticeboard-server --restart unless-stopped -p 5000:5000 noticeboard-server
# This is a brand-new container. Anything written inside the old
# one's writable layer (temp files, in-memory caches on disk) is gone.

# Changing restart policy on an already-running container without recreating it:
docker update --restart=unless-stopped noticeboard-server`,
          pitfalls: [
            '**Not naming containers**, then trying to remember the random-generated name (or looking it up with `docker ps` every single time) to run `logs`/`exec`. Fix: always pass `--name noticeboard-server` / `--name noticeboard-mongo`.',
            '**Trying to reuse a container name that is still taken by a stopped-but-not-removed container.** Docker refuses with "the container name ... is already in use". Fix: `docker rm noticeboard-server` first, or pick a different name.',
            '**Choosing `--restart always` and being surprised it restarts even after you deliberately `docker stop`ped it**, the next time the Docker daemon restarts. Fix: use `unless-stopped` for local dev, where a manual stop should actually stay stopped.',
            '**Believing `docker stop` deletes a container\'s data.** It does not — the writable layer survives a stop/start cycle intact. Fix: know that only `docker rm` (or recreating the container) discards it.',
            '**Assuming data written inside a running container (a Mongo document, an uploaded file) survives `docker rm`.** It lives only in that specific container\'s ephemeral writable layer and disappears with it. Fix: treat anything not yet backed by a named volume (coming in Module 3) as disposable.',
            '**Forgetting `--restart` only applies to containers created with that flag.** Adding it later to a `docker run` command has no effect on a container that already exists. Fix: use `docker update --restart=unless-stopped <name>` to change the policy on an existing container without recreating it.',
          ],
          tryIt:
            'Run `noticeboard-server` with `--name` and `--restart unless-stopped`, `docker exec` into it and touch a file at `/tmp/proof.txt`, then `docker stop` and `docker start` it and confirm the file is still there. Finally `docker rm -f` it, recreate it with the identical `docker run` command, and confirm `/tmp/proof.txt` is gone — proving stop preserves the writable layer but removal destroys it.',
          takeaway:
            '`--name` makes containers easy to target, `--restart unless-stopped` is the sensible local-dev policy, and a container\'s writable layer survives `stop`/`start` but is permanently discarded on `rm` — the exact fact that makes running Mongo as a plain container, for now, risky.',
        },
      ],
    },
    {
      id: 'm2-s2',
      title: 'Bringing Mongo In-House',
      topics: [
        {
          id: 'm2-t4',
          title: "Running MongoDB as its own container with docker run mongo, and why 'it's just another container' changes your local dev setup",
          explain:
            'Stop depending on MongoDB Atlas over the internet and run MongoDB itself locally, as its own container, using the official `mongo:7` image — proving that a database, inside Docker, is not fundamentally different from any other container you have already run.',
          analogy:
            'In Module 1, checking today\'s fish price meant phoning a contact in Mangaluru and hoping the line held during a monsoon downpour. This module is Kundapura port setting up its own weighing counter, right there on the jetty — same weighing logic, now local, answering instantly, working perfectly even when the harbour\'s internet connection drops entirely during the storm. Running `mongo:7` as a container is exactly that: the database moves from "a service somewhere else on the internet" to "a process running right here on your machine," with nothing else about how you use it fundamentally different.',
          theory:
            'The official `mongo` image on Docker Hub packages a full MongoDB server. Running it locally is a single command:\n```bash\ndocker run -d --name noticeboard-mongo -p 27017:27017 mongo:7\n```\n- `-d` runs it detached, in the background, same as any other container.\n- `--name noticeboard-mongo` gives it a memorable name, exactly as covered in the previous topic.\n- `-p 27017:27017` maps MongoDB\'s default port on the **host** to the same port **inside** the container, so tools on your machine (`mongosh`, MongoDB Compass) can connect to `localhost:27017` exactly as if Mongo were installed directly on your laptop — except it is not; it is fully contained, trivially removable, and cannot conflict with any other project\'s Mongo version on the same machine.\n- `mongo:7` pins the major version explicitly, the same reasoning as pinning `node:20-alpine` earlier in this module — `mongo:latest` would silently track whatever major version Docker Hub currently tags latest, which could one day be a breaking upgrade you did not ask for.\n\nThe conceptually important realization: **Mongo running in a container is just another container.** It was built from an image, it runs as an isolated process with its own filesystem, and every command you already know from working with `noticeboard-server` — `docker ps`, `docker stop`, `docker logs`, `docker exec` — works identically against `noticeboard-mongo`. There is no special "database container" mode; Docker treats a database and a web server the same way.\n\nThis single change removes two real Module 1 pains at once: the local dev loop no longer needs a working internet connection or an Atlas account at all, and there is no network round-trip latency to a cloud cluster while iterating locally. Everything — server and database — now runs entirely on your machine.\n\nOne thing this topic deliberately does **not** solve: this Mongo container has nowhere durable to keep its data. Remove `noticeboard-mongo` and every notice is gone, exactly as the previous topic\'s ephemeral-writable-layer lesson predicts. That is Module 3\'s entire subject — named volumes.',
          whyItMatters:
            'Bringing Mongo in-house is the single biggest unlock for a fast local development loop: no internet dependency, no shared cloud cluster to accidentally pollute with test data, and a database you can nuke and recreate in seconds while experimenting. It is also the first piece of what becomes, by Module 6, a fully Compose-orchestrated local stack.',
          steps: [
            'Pull and run Mongo locally: `docker run -d --name noticeboard-mongo -p 27017:27017 mongo:7`.',
            'Confirm it is running: `docker ps` should show `noticeboard-mongo` with status "Up".',
            'Check its startup logs: `docker logs noticeboard-mongo` and look for a line confirming it is "Waiting for connections" on port 27017.',
            'Connect from your host machine using `mongosh mongodb://localhost:27017` (or MongoDB Compass pointed at the same URL).',
            'Manually create a `noticeboard` database and insert one test notice document directly, to prove the container is a genuinely functioning Mongo instance before wiring the server to it.',
            'List the inserted document back with a `find()` query to confirm the round trip works.',
          ],
          code: `# Run MongoDB locally as its own container — no Atlas, no internet needed:
docker run -d --name noticeboard-mongo -p 27017:27017 mongo:7

docker ps
# CONTAINER ID   IMAGE     STATUS         PORTS                      NAMES
# 7b2f9e1a4c33   mongo:7   Up 4 seconds   0.0.0.0:27017->27017/tcp  noticeboard-mongo

docker logs noticeboard-mongo
# {"t":{"$date":"..."},"s":"I","c":"NETWORK","msg":"Waiting for connections","attr":{"port":27017}}

# Connect from the host exactly like a normal local Mongo install:
mongosh mongodb://localhost:27017

# Inside mongosh — prove it's a real, working Mongo before touching the server:
use noticeboard
db.notices.insertOne({
  title: "Ferry timing change",
  message: "Evening ferry from Gangolli now departs 6:30pm during monsoon.",
  category: "Bus & Ferry",
  postedBy: "harbour_office",
  createdAt: new Date()
})
db.notices.find()
# [
#   {
#     _id: ObjectId("..."),
#     title: 'Ferry timing change',
#     message: 'Evening ferry from Gangolli now departs 6:30pm during monsoon.',
#     category: 'Bus & Ferry',
#     postedBy: 'harbour_office',
#     createdAt: ISODate("...")
#   }
# ]`,
          pitfalls: [
            '**Forgetting `-p 27017:27017`.** Mongo runs fine inside the container, but nothing on your host machine (`mongosh`, Compass, the server container) can reach it. Fix: always map the port when you need host-level access.',
            '**Running a second Mongo container while the first still holds host port 27017.** Docker refuses with "port is already allocated". Fix: `docker stop`/`rm` the old one, or map a different host port, e.g. `-p 27018:27017`.',
            '**Pulling `mongo:latest` instead of pinning `mongo:7`.** Local dev quietly ends up on a different major version than whatever the team later standardizes on, risking subtle behavioural differences. Fix: pin the exact major version you intend to use everywhere.',
            '**Assuming this container has any authentication configured.** With no `MONGO_INITDB_ROOT_USERNAME`/`PASSWORD` set, it is a completely open, unauthenticated Mongo instance. Fix: acceptable for pure local development bound to `localhost`, but flag clearly that this must never be exposed beyond your own machine as-is.',
            '**Believing the server automatically starts talking to this new local Mongo.** It does not — the server container still has whatever `MONGO_URI` (likely the old Atlas one) it was last given. Fix: explicitly update `MONGO_URI` to point at the new local container, which the next topic covers.',
            '**Not verifying the container actually stayed up.** A port conflict or bad flag can make it exit immediately, and a quick glance at `docker ps` (which only shows running containers) can miss that. Fix: always follow with `docker ps -a` and `docker logs noticeboard-mongo` to confirm it is genuinely healthy, not just "was started".',
          ],
          tryIt:
            'Run `noticeboard-mongo` with `docker run -d --name noticeboard-mongo -p 27017:27017 mongo:7`, connect with `mongosh mongodb://localhost:27017`, and manually insert two test notices (one "Fish Market" category, one "Festival" category) directly through the shell — then query them back with `db.notices.find({ category: "Festival" })` to prove the container is a fully working, queryable Mongo instance before the server ever touches it.',
          takeaway:
            'MongoDB running in Docker is just another container — `docker run -d --name noticeboard-mongo -p 27017:27017 mongo:7` replaces the Atlas dependency for local dev entirely, though (on purpose, for now) with nowhere durable to keep its data.',
        },
        {
          id: 'm2-t5',
          title: 'Connecting two standalone containers the clunky way: --link and manual IP addresses (and why this doesn\'t scale — sets up Module 4\'s real fix)',
          explain:
            'Wire `noticeboard-server` to the new `noticeboard-mongo` container using either the legacy `--link` flag or by manually looking up Mongo\'s internal IP address with `docker inspect` and hand-building `MONGO_URI` from it — and understand clearly why both approaches are fragile stopgaps, not the real answer.',
          analogy:
            'Before Kundapura port had a proper jetty connecting every boat to the main dock by name, a fisherman needing to reach a particular boat would row out and remember exactly where it was anchored that morning — a specific patch of open water. The moment that boat drifts with the tide or gets swapped out for another, rowing to "that same spot" reaches the wrong boat, or nothing at all. That is precisely what wiring two containers together via a manually noted, ever-changing internal IP address feels like — it works today, and quietly breaks the next time anything moves.',
          theory:
            'Right now, `noticeboard-server` and `noticeboard-mongo` are two entirely standalone containers with no shared network beyond Docker\'s default bridge — which does **not** provide automatic name-based DNS resolution between containers (that convenience only exists on a *user-defined* network, which is Module 4\'s subject). So connecting them today needs one of two clunky, explicitly temporary techniques:\n\n**1. `--link` (legacy, deprecated by Docker itself):**\n```bash\ndocker run -d --name noticeboard-server \\\n  --link noticeboard-mongo:mongo \\\n  -p 5000:5000 \\\n  -e MONGO_URI="mongodb://mongo:27017/noticeboard" \\\n  noticeboard-server\n```\n`--link` injects a `/etc/hosts` entry inside the server container mapping the alias `mongo` to Mongo\'s current internal IP address at the moment the server container **starts**. It also copies some of the linked container\'s environment variables across. Docker\'s own documentation marks `--link` as a legacy feature that may be removed in a future release: it is one-directional (server can reach mongo by the alias; mongo cannot reach server), and it does not survive `noticeboard-mongo` being removed and recreated — the alias silently goes stale.\n\n**2. Manual IP via `docker inspect`:**\n```bash\ndocker inspect -f \'{{ .NetworkSettings.IPAddress }}\' noticeboard-mongo\n# -> 172.17.0.2\n```\nYou take that IP and hand-build `MONGO_URI=mongodb://172.17.0.2:27017/noticeboard`, passing it to the server via `-e`. This works — Mongo really is reachable at that address — but the address comes from Docker\'s default bridge subnet and is **not guaranteed to stay the same**. Remove and recreate `noticeboard-mongo` (which you will do plenty during development) and it very likely gets a different IP, silently breaking the server\'s connection string until someone re-inspects and re-supplies it.\n\nBoth techniques exist here as a deliberate teaching stepping stone: they prove two containers genuinely *can* talk to each other without any special orchestration tooling, while making the pain of manual, fragile wiring concrete enough that Module 4\'s real answer — a user-defined bridge network (`noticeboard-net`) giving every container automatic, stable DNS resolution by name (`mongo:27017`, forever, no IP-chasing) — lands as an obvious, satisfying improvement rather than magic you are just told to trust.',
          whyItMatters:
            'Feeling this fragility hands-on — reinspecting an IP after every Mongo container recreation, or relying on a flag Docker itself calls legacy — is what makes the payoff of Module 4\'s proper network actually land. It also reflects real history: this genuinely is how people connected containers before user-defined networks became standard practice.',
          steps: [
            'Start (or confirm running) `noticeboard-mongo` from the previous topic.',
            'Inspect its current internal IP: `docker inspect -f \'{{ .NetworkSettings.IPAddress }}\' noticeboard-mongo`.',
            'Build `MONGO_URI` using that IP and run the server: `docker run -d --name noticeboard-server -p 5000:5000 -e MONGO_URI="mongodb://<ip>:27017/noticeboard" noticeboard-server`.',
            'Verify the connection works end-to-end: `curl http://localhost:5000/api/notices` should return the notices you inserted earlier via `mongosh`.',
            'As an alternative, try the `--link` approach instead and confirm `mongodb://mongo:27017/noticeboard` also works from inside the server container.',
            'Now remove and recreate `noticeboard-mongo` (`docker rm -f noticeboard-mongo` then rerun its `docker run` command), re-inspect its IP, and observe that the server\'s old `MONGO_URI` no longer reaches it until you supply the new IP.',
          ],
          code: `# 1) Find Mongo's current internal IP address:
docker inspect -f '{{ .NetworkSettings.IPAddress }}' noticeboard-mongo
# -> 172.17.0.2

# 2) Hand-build MONGO_URI using that IP and run the server against it:
docker run -d --name noticeboard-server \\
  -p 5000:5000 \\
  -e MONGO_URI="mongodb://172.17.0.2:27017/noticeboard" \\
  -e PORT=5000 \\
  noticeboard-server

# Confirm it actually works end-to-end:
curl http://localhost:5000/api/notices
# -> [{"_id":"...","title":"Ferry timing change","category":"Bus & Ferry", ...}]

# --- Alternative: the (deprecated) --link approach instead of manual IP ---
docker rm -f noticeboard-server
docker run -d --name noticeboard-server \\
  --link noticeboard-mongo:mongo \\
  -p 5000:5000 \\
  -e MONGO_URI="mongodb://mongo:27017/noticeboard" \\
  noticeboard-server
curl http://localhost:5000/api/notices   # works — 'mongo' resolves via the injected hosts entry

# --- Now prove the fragility: recreate Mongo and watch the IP change ---
docker rm -f noticeboard-mongo
docker run -d --name noticeboard-mongo -p 27017:27017 mongo:7
docker inspect -f '{{ .NetworkSettings.IPAddress }}' noticeboard-mongo
# -> 172.17.0.4   <- different IP! the old hardcoded MONGO_URI is now dead

curl http://localhost:5000/api/notices
# -> curl: (52) Empty reply / connection refused — server still pointed at 172.17.0.2`,
          pitfalls: [
            '**Hardcoding an inspected IP into `MONGO_URI` and forgetting it changes** the moment `noticeboard-mongo` is removed and recreated. Fix: treat any IP-based wiring as strictly throwaway — re-inspect and update after every Mongo recreation, or better, move to Module 4\'s network solution.',
            '**Relying on `--link` without realizing Docker itself calls it legacy** and it could be removed from a future Docker release entirely. Fix: understand it is used here purely as a teaching stepping stone, never as the long-term answer.',
            '**Running `docker inspect` before Mongo has fully finished starting up**, and getting an empty or misleading IP. Fix: confirm `docker ps` shows the container status as healthy/running first.',
            '**Assuming `--link` is bidirectional** — that Mongo could also reach the server by an injected alias. It is strictly one-directional, from the container declaring the link (server) toward its target (mongo). Fix: never rely on it for two-way name discovery.',
            '**Copy-pasting an example IP from a tutorial or a different machine.** Docker\'s default bridge subnet (`172.17.x.x`, `172.18.x.x`, etc.) varies per machine and per Docker installation. Fix: always run `docker inspect` fresh, on your own machine, never trust someone else\'s example address.',
            '**Trying `mongodb://noticeboard-mongo:27017` directly with no `--link` and no user-defined network**, expecting name resolution to just work. The default bridge network provides no such DNS, so this silently fails to connect. Fix: understand name-based resolution needs either `--link`\'s injected hosts entry now, or (properly, next module) a user-defined network.',
          ],
          tryIt:
            'Inspect `noticeboard-mongo`\'s IP, wire the server to it via a hand-built `MONGO_URI`, and confirm `GET /api/notices` works. Then deliberately `docker rm -f` and recreate `noticeboard-mongo`, and — without updating anything — hit `GET /api/notices` again to watch it fail. Only then re-inspect the new IP, update the server\'s `MONGO_URI`, and restart it to restore the connection — feel exactly how much manual babysitting this "wiring" needs.',
          takeaway:
            '`--link` and manually inspected IPs can connect two standalone containers today, but both break the moment either container is recreated — a fragility that Module 4\'s user-defined network (stable DNS by container name) exists specifically to eliminate.',
        },
        {
          id: 'm2-t6',
          title: 'docker inspect, docker stats, and docker logs -f for debugging a running container',
          explain:
            'Build a repeatable debugging workflow across both `noticeboard-server` and `noticeboard-mongo` using three commands: `docker inspect` (full configuration and metadata as JSON), `docker stats` (live CPU/memory/network usage), and `docker logs -f` (real-time streamed application output).',
          analogy:
            'A harbourmaster at Kundapura port has three distinct ways of checking on a docked boat. Reading the boat\'s full registration file — crew list, cargo manifest, engine specification — is `docker inspect`. Watching the fuel gauge and engine temperature needle live is `docker stats`. Standing at the harbour radio listening to everything the captain reports as it happens, in real time, is `docker logs -f`. Use the wrong one for the question you actually have, and you waste time; use all three together, and almost nothing stays a mystery for long.',
          theory:
            '`docker inspect <container>` dumps the container\'s complete configuration and current state as one large JSON document: its IP address, mounted volumes, environment variables, restart policy, exposed ports, exit code, image ID, and more. Reading the whole thing is rarely necessary — use `-f`/`--format` with a Go template to pull out exactly one field, e.g. the IP-address lookup from the previous topic (`-f \'{{ .NetworkSettings.IPAddress }}\'`), or later, once healthchecks exist, `-f \'{{ .State.Health.Status }}\'`.\n\n`docker stats [container...]` shows a continuously **live-updating** table of CPU percentage, memory usage against its limit, network I/O, and block I/O, per container. Run with no arguments to watch every running container at once. It is the tool for "is `noticeboard-mongo` quietly eating memory" or "did that last burst of requests spike the server\'s CPU" — questions `docker inspect`\'s static snapshot cannot answer. Note it keeps streaming until you press `Ctrl+C`; pass `--no-stream` for a single one-off snapshot instead, e.g. inside a script.\n\n`docker logs <container>` prints whatever the containerized process wrote to `stdout`/`stderr`. Without `-f` it dumps everything captured so far and exits immediately — useful for a quick look, but not for watching something unfold live. Add `-f` to **follow** it in real time, exactly like Unix `tail -f`. Combine with `--tail 100` to limit how much history is shown before following, or `--since 10m` to jump straight to a recent window on a long-running container.\n\nA concrete Notice Board debugging sequence: the server container exits immediately after `docker run` — `docker ps -a` first shows its exit code (a `1` usually means an application error, a `137` usually means it was killed, often out-of-memory), then `docker logs noticeboard-server` reveals the actual Node.js stack trace, commonly a Mongoose "connection refused" if `MONGO_URI` is wrong. If `noticeboard-mongo` looks "Up" in `docker ps` but the server still cannot reach it, `docker inspect noticeboard-mongo` double-checks its current IP and port bindings match what the server was told. If `docker stats` shows suspiciously climbing memory on the server, `docker logs -f noticeboard-server` often reveals a runaway reconnect loop flooding output as the real cause. The natural order is always: `docker ps -a` (status/exit code) → `docker logs` (why) → `docker inspect` (full config) → `docker stats` (live behaviour once it is running correctly).',
          whyItMatters:
            'Every piece of production troubleshooting later in this course — once Compose (Module 6) and a hosted deployment (Module 9) enter the picture — starts from this exact same three-tool loop, just aimed at more containers at once. Getting fluent with `ps → logs → inspect → stats` on just two containers now (`noticeboard-server`, `noticeboard-mongo`) is what makes debugging a five-container Compose stack later feel familiar instead of overwhelming.',
          steps: [
            'Deliberately misconfigure `noticeboard-server` with a wrong `MONGO_URI` and run it.',
            'Run `docker ps -a` and note its status and exit code (if it exited).',
            'Run `docker logs noticeboard-server` and locate the actual connection error in the output.',
            'Fix `MONGO_URI` and rerun the container; confirm `docker ps` now shows it healthy and "Up".',
            'Use `docker inspect noticeboard-mongo -f \'{{ .NetworkSettings.IPAddress }}\'` to re-confirm the correct address was used.',
            'Open `docker stats` in one terminal, then hit the API a few times with `curl` from another and watch CPU/memory move live in response.',
          ],
          code: `# 1) Deliberately break it — wrong host in MONGO_URI:
docker run -d --name noticeboard-server -p 5000:5000 \\
  -e MONGO_URI="mongodb://172.17.0.99:27017/noticeboard" \\
  noticeboard-server

# 2) Check status/exit code first — always the fastest first clue:
docker ps -a --filter name=noticeboard-server
# NAMES                STATUS
# noticeboard-server   Exited (1) 2 seconds ago

# 3) Read WHY via logs:
docker logs noticeboard-server
# MongooseServerSelectionError: connect ECONNREFUSED 172.17.0.99:27017
#     at ...

# 4) Fix and rerun with the correct, currently-inspected IP:
docker rm -f noticeboard-server
docker inspect -f '{{ .NetworkSettings.IPAddress }}' noticeboard-mongo
# -> 172.17.0.4
docker run -d --name noticeboard-server -p 5000:5000 \\
  -e MONGO_URI="mongodb://172.17.0.4:27017/noticeboard" \\
  noticeboard-server
docker ps --filter name=noticeboard-server
# NAMES                STATUS
# noticeboard-server   Up 3 seconds

# 5) Follow logs live while exercising the API:
docker logs -f noticeboard-server
# (in a second terminal)
curl -X POST http://localhost:5000/api/notices \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Fish price update","message":"Bangude ₹180/kg today","category":"Fish Market","postedBy":"market_office"}'
# -> logs window prints: "POST /api/notices 201 - 14ms"

# 6) Watch live resource usage across both containers:
docker stats noticeboard-server noticeboard-mongo
# CONTAINER            CPU %   MEM USAGE / LIMIT     NET I/O
# noticeboard-server   0.42%   38.2MiB / 7.769GiB     3.1kB / 2.4kB
# noticeboard-mongo    1.10%   112MiB / 7.769GiB      5.6kB / 3.9kB`,
          pitfalls: [
            '**Running `docker logs` without `-f` and expecting live updates.** It prints existing captured output and exits immediately — no live streaming. Fix: add `-f` whenever you want to watch output unfold in real time.',
            '**Ignoring the exit code in `docker ps -a`\'s STATUS column and jumping straight to guessing.** The code alone often narrows the problem (e.g. `Exited (1)` = app error, `Exited (137)` = killed/OOM). Fix: always check that column first before reading logs.',
            '**Scrolling through the entire raw JSON from a bare `docker inspect` to find one value.** Slow and error-prone across hundreds of lines. Fix: use `-f`/`--format` with a Go template to extract exactly the field needed.',
            '**Leaving `docker stats` running unattended inside a script**, not realizing it streams continuously rather than exiting on its own. Fix: know it is a live stream by default; pass `--no-stream` for a single snapshot instead.',
            '**Expecting `docker logs` to show output the app wrote to an internal file** instead of `stdout`/`stderr`. If the Notice Board server ever logged to a file inside the container, `docker logs` would show nothing useful. Fix: keep the app logging to `stdout`/`stderr`, the Docker-native convention, not to an internal file.',
            '**Debugging the wrong container after copy-pasting a name/ID from an earlier command.** Confusing `noticeboard-server`\'s logs for `noticeboard-mongo`\'s wastes real time. Fix: double-check the container name argument matches the one you actually suspect is misbehaving.',
          ],
          tryIt:
            'Deliberately point `noticeboard-server` at a wrong `MONGO_URI`, use `docker ps -a` and `docker logs` to diagnose the exact connection error, fix it using a freshly `docker inspect`-ed Mongo IP, then open `docker stats` in one terminal while sending a handful of `curl` requests against `/api/notices` from another, watching CPU and memory respond live.',
          takeaway:
            '`docker ps -a` shows status and exit codes, `docker logs -f` streams why in real time, `docker inspect -f` pulls one precise config field, and `docker stats` shows live resource usage — together they are the standard loop for debugging any container in this course, server or database alike.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm2-p1',
      type: 'Mini Project',
      title: 'Bring MongoDB In-House',
      domain: 'Backend / Docker',
      duration: '3-4 hrs',
      description:
        'Rewrite `server/Dockerfile` to be reproducible (`node:20-alpine` + `npm ci`, correct `ENV`/`ARG` usage, sensible lifecycle flags), then stop depending on MongoDB Atlas entirely: run a local `noticeboard-mongo` container, wire the server to it using the clunky IP/`--link` approach, and prove full CRUD (create, list, delete notices) works against your own local Mongo. Finally, deliberately remove the Mongo container and watch every notice disappear — a hands-on demonstration of the exact problem Module 3 solves next.',
      tools: ['Docker', 'Docker CLI', 'Node.js 20', 'MongoDB 7', 'mongosh'],
      blueprint: {
        overview:
          'Kundapura Notice Board\'s server currently talks to a MongoDB Atlas cluster over the internet, and its Dockerfile is the naive, unpinned version from Module 1. This project hardens the Dockerfile and, for the first time, runs the database itself as a container on the same machine as everything else — connected using the fragile, old-school techniques (manual IP inspection or `--link`) this module teaches on purpose, so the eventual proper network in Module 4 feels earned rather than assumed. The project ends by deliberately destroying the Mongo container to make data loss a felt, not just described, problem.',
        functionalRequirements: [
          'Rewrite `server/Dockerfile` to use `FROM node:20-alpine`, install with `npm ci --omit=dev` (copying `package*.json` before the rest of the source for correct layer caching), and use `ARG`/`ENV` correctly (`NODE_ENV` as a promoted build arg, `PORT=5000` as a plain `ENV`, `MONGO_URI` supplied only at `docker run -e` time, never baked in).',
          'Run `noticeboard-mongo` as its own local container (`mongo:7`, port `27017` mapped to the host) with `--name` and `--restart unless-stopped`, replacing the Module 1 dependency on Atlas.',
          'Run `noticeboard-server` with `--name` and `--restart unless-stopped`, wired to `noticeboard-mongo` via either a manually inspected IP address or the `--link` flag — not yet via a user-defined network.',
          'Verify full CRUD end-to-end against the local Mongo container: create a notice via `POST /api/notices`, list notices via `GET /api/notices` (including the `?category=` filter), and remove one via `DELETE /api/notices/:id`.',
          'Use `docker ps -a`, `docker logs`, `docker inspect`, and `docker stats` at least once each to observe and confirm the two containers are healthy and correctly wired.',
          'Deliberately remove `noticeboard-mongo` with `docker rm -f` and confirm — by recreating it and querying `/api/notices` again — that every previously created notice is gone.',
        ],
        technicalImplementation: [
          'Update `server/Dockerfile`\'s base image, install step, and `ARG`/`ENV` declarations as covered in Section 1; rebuild with `docker build -t noticeboard-server .` after each change and confirm it still runs.',
          'Start `noticeboard-mongo` with `docker run -d --name noticeboard-mongo --restart unless-stopped -p 27017:27017 mongo:7`, and confirm with `mongosh mongodb://localhost:27017` that it accepts connections before wiring the server to it.',
          'Obtain Mongo\'s address either via `docker inspect -f \'{{ .NetworkSettings.IPAddress }}\' noticeboard-mongo` or via `--link noticeboard-mongo:mongo`, and build `MONGO_URI` accordingly for the server\'s `-e` flag.',
          'Start `noticeboard-server` with `--name noticeboard-server --restart unless-stopped -p 5000:5000` and the constructed `MONGO_URI`, then confirm `GET /health` and `GET /api/notices` both respond correctly.',
          'Exercise all three CRUD endpoints with `curl` (or a REST client), confirming created notices appear in subsequent `GET /api/notices` calls and that `DELETE` actually removes them.',
          'Finish by running `docker rm -f noticeboard-mongo`, recreating it fresh, and calling `GET /api/notices` again to observe an empty list — the concrete proof of this module\'s deliberately unsolved problem.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Harden server/Dockerfile',
            outcome: 'A rebuilt `noticeboard-server` image using `node:20-alpine`, `npm ci --omit=dev`, correctly layered `COPY` steps, and proper `ARG`/`ENV` usage with no secrets baked in.',
            prompt:
              'Rewrite `server/Dockerfile` for the Kundapura Notice Board backend: use `FROM node:20-alpine`, copy `package*.json` before the rest of the source and install with `npm ci --omit=dev`, add `ARG NODE_ENV=production` promoted to `ENV NODE_ENV=$NODE_ENV`, and a plain `ENV PORT=5000`. Do not add `MONGO_URI` anywhere in the Dockerfile. Rebuild the image with `docker build -t noticeboard-server .` and show the build output confirming each layer.',
          },
          {
            step: 2,
            label: 'Run Mongo locally and verify it works',
            outcome: 'A running `noticeboard-mongo` container, confirmed reachable and functional via `mongosh` with at least one manually inserted test document.',
            prompt:
              'Run MongoDB locally as its own container: `docker run -d --name noticeboard-mongo --restart unless-stopped -p 27017:27017 mongo:7`. Confirm it is healthy with `docker ps` and `docker logs noticeboard-mongo`. Connect with `mongosh mongodb://localhost:27017`, switch to the `noticeboard` database, and manually insert two test notice documents matching the Notice schema (title, message, category, postedBy, createdAt). Query them back with `db.notices.find()` and show the output.',
          },
          {
            step: 3,
            label: 'Wire the server to local Mongo the clunky way',
            outcome: 'A running `noticeboard-server` container successfully connected to `noticeboard-mongo` via a manually inspected IP address (or `--link`), with full CRUD verified end-to-end.',
            prompt:
              'Get `noticeboard-mongo`\'s current internal IP with `docker inspect -f \'{{ .NetworkSettings.IPAddress }}\' noticeboard-mongo`, and use it to build `MONGO_URI` for running `noticeboard-server` (`--name noticeboard-server --restart unless-stopped -p 5000:5000 -e MONGO_URI=...`). Then run `curl` commands proving all three endpoints work against the real local database: create a notice with `POST /api/notices`, list it with `GET /api/notices`, filter it with `?category=`, and delete it with `DELETE /api/notices/:id`. Show every command and its output. Briefly explain why this IP-based wiring is fragile and what could break it.',
          },
          {
            step: 4,
            label: 'Prove the data-loss problem this module leaves unsolved',
            outcome: 'A demonstrated, undeniable proof that removing `noticeboard-mongo` destroys all notices — the exact motivation for Module 3\'s named volumes.',
            prompt:
              'With at least two notices currently stored (confirm via `GET /api/notices`), run `docker rm -f noticeboard-mongo`, then recreate it with the exact same `docker run` command as before. Call `GET /api/notices` again and show that the list is now empty. Write two or three sentences explaining, in your own words, exactly why this happened (tie it back to the ephemeral writable layer concept from Section 1) and what kind of Docker feature would need to exist to prevent it.',
          },
        ],
        deliverable:
          'A hardened `server/Dockerfile` (`node:20-alpine`, `npm ci --omit=dev`, correct `ARG`/`ENV` split, no secrets baked in), a running `noticeboard-mongo` container replacing the Module 1 Atlas dependency entirely, and a running `noticeboard-server` container wired to it via a manually inspected IP or `--link`, with full CRUD verified end-to-end against real local data. The project closes with a deliberately staged failure: notices created during testing are gone the moment `noticeboard-mongo` is removed and recreated. That is not a bug to fix here — it is the precise, hands-on motivation for Module 3, which gives Mongo\'s data a permanent home with named volumes so removing the container never again means losing every notice on the board.',
      },
    },
  ],
  quiz: [
    {
      id: 'm2-q1',
      q: 'Why does `server/Dockerfile` use `npm ci` instead of `npm install` when building the Kundapura Notice Board image?',
      options: [
        '`npm ci` is simply a faster alias for `npm install` with no other difference',
        '`npm ci` installs exactly the versions locked in `package-lock.json` and fails if it is out of sync with `package.json`, giving a reproducible build every time; `npm install` can resolve newer versions and update the lock file',
        '`npm ci` is required by Alpine-based images specifically and does not work on other base images',
        '`npm ci` skips installing `mongoose` and other production dependencies entirely',
      ],
      answer: 1,
    },
    {
      id: 'm2-q2',
      q: 'You need `MONGO_URI` available inside the running `noticeboard-server` container, but it differs between your laptop and a teammate\'s. Where should it be set?',
      options: [
        'As an `ARG` in `server/Dockerfile`, so it is fixed at build time',
        'As an `ENV` line directly in `server/Dockerfile`, baked into the image for consistency',
        'Supplied at `docker run` time with `-e MONGO_URI=...`, kept out of the Dockerfile and the image entirely',
        'Hardcoded into `server/src/db.js` so it never needs to be passed in',
      ],
      answer: 2,
    },
    {
      id: 'm2-q3',
      q: 'You insert a test notice directly into `noticeboard-mongo` via `mongosh`, then run `docker stop noticeboard-mongo` followed by `docker start noticeboard-mongo`. What happens to that notice?',
      options: [
        'It is gone — `docker stop` clears the container\'s writable layer',
        'It survives — `docker stop`/`docker start` only pause and resume the process, leaving the writable layer (and the data in it) intact; only `docker rm` (or recreating the container) discards it',
        'It survives only if `--restart unless-stopped` was set when the container was created',
        'MongoDB automatically backs it up to Docker Hub before the container stops',
      ],
      answer: 1,
    },
    {
      id: 'm2-q4',
      q: 'You wired `noticeboard-server` to `noticeboard-mongo` using a `MONGO_URI` built from an IP address returned by `docker inspect`. A week later the server suddenly cannot reach Mongo anymore, with no code changes. What is the most likely cause?',
      options: [
        'MongoDB 7 automatically rotates its listening port weekly',
        '`noticeboard-mongo` was removed and recreated at some point (or its container restarted in a way that reassigned its internal IP), and the hardcoded IP in `MONGO_URI` no longer points at it',
        'Docker automatically expires `docker run -e` environment variables after seven days',
        '`npm ci` silently uninstalled the `mongoose` package',
      ],
      answer: 1,
    },
    {
      id: 'm2-q5',
      q: 'What is the key limitation of connecting two containers with `--link`, and why does this module treat it as a temporary stepping stone rather than the real solution?',
      options: [
        '`--link` only works with MongoDB images, never with Express/Node images',
        '`--link` is one-directional and its injected hostname mapping does not survive the linked container being recreated; Docker considers it a legacy feature — Module 4\'s user-defined network gives stable, automatic DNS resolution by container name instead',
        '`--link` requires a paid Docker Hub subscription to use beyond one container',
        '`--link` permanently deletes the target container\'s data once the link is established',
      ],
      answer: 1,
    },
  ],
}
