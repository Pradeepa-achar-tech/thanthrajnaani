// Module 3 — Volumes & Persistent Data
// Module 2 ended by proving that removing the noticeboard-mongo container wipes
// every notice ever posted. This module fixes that permanently with named volumes,
// and also speeds up local development with bind mounts + nodemon so editing
// server code shows up live in a running container with no rebuild. Purely
// data/dev-workflow focused — server and mongo are still connected the fragile
// Module 2 way (IP/--link); Module 4 replaces that with a real Docker network.

export const m3 = {
  id: 'm3',
  title: 'Volumes & Persistent Data',
  hours: 7,
  color: 'from-cyan-500/20 to-cyan-700/10',
  accent: 'cyan',
  description:
    'Module 2 ended on a cliffhanger: killing the `noticeboard-mongo` container wiped out every notice ever posted to Kundapura Notice Board, and that is not a bug — it is exactly how Docker is supposed to work. This module fixes that permanently with **named volumes**, Docker-managed storage that survives a container being destroyed and recreated. Along the way you will also speed up your own workflow: **bind mounts** let you edit `server/src` on your laptop and see the running container pick up the change instantly, and adding **nodemon** inside the container turns that into a real fast local dev loop with zero rebuilds. This module is deliberately about **data only** — server and Mongo are still wired together the clunky IP/`--link` way from Module 2; Module 4 replaces that with a proper Docker network.',
  sections: [
    {
      id: 'm3-s1',
      title: 'Why Containers Lose Data',
      topics: [
        {
          id: 'm3-t1',
          title:
            'Container filesystems are ephemeral — proving it by killing and recreating the Mongo container',
          explain:
            'See with your own eyes that a container\'s filesystem disappears the moment the container is removed, by posting real notices to Kundapura Notice Board, deleting the `noticeboard-mongo` container, and watching a freshly-started replacement come back completely empty.',
          analogy:
            'Picture a fish vendor at **Kundapura market** who sets up a temporary bamboo-and-tarp stall each morning and chalks the day\'s prices — "kane fish ₹220, bangude ₹140" — on a slate nailed to the stall\'s post. Every evening the stall is dismantled and carted away; a brand-new bamboo stall goes up on the very same patch of ground the next morning. The ground (the market itself) is permanent, but that chalk slate was nailed to yesterday\'s stall, not to the ground — so today\'s new stall starts with a blank slate, no matter how many prices were written the day before. A Docker container\'s writable filesystem is that chalk slate: nailed to the *container*, not to anything permanent, and gone the instant the container is torn down.',
          theory:
            'Every Docker container\'s filesystem is built from two things layered together: the **image\'s read-only layers** (the OS, MongoDB itself, everything baked in at build time) and one **thin writable layer** created fresh for that specific container when it starts. Anything the running process writes — a new file, a database write, a log — lands in that writable layer, using a union filesystem (OverlayFS on Linux) that makes the combination look like one normal filesystem from inside the container.\n\nThe critical fact: that writable layer belongs to the *container*, not the image. `docker run mongo:7` creates a new container with its own brand-new writable layer, always starting from the image\'s clean state. `docker rm` (or `docker rm -f` to force-remove a running one) deletes the container **and its writable layer** together, permanently. Run a fresh container from the same `mongo:7` image afterward and Docker does exactly what it is designed to do: hand you another clean writable layer, because it has no idea the previous container ever held data specific to your app.\n\nThis is not a bug to work around quietly — it is the entire reason Docker containers are so fast to create, so cheap to throw away, and so reliably identical every time (no leftover state from a previous run corrupting the next one). The catch is that anything you actually want to *keep* — like Kundapura Notice Board\'s notices sitting inside MongoDB\'s `/data/db` — must live somewhere Docker treats as persistent by design, which is exactly what named volumes (next topic) are for. Until you add one explicitly, "does the data survive?" always has the same answer: no.',
          whyItMatters:
            'This is the exact problem the rest of this module solves, and understanding *why* it happens (writable layer tied to the container\'s lifecycle, not the image) is what stops you from reaching for the wrong fix later — like trying to `docker commit` your way to a "data-safe" image, which only freezes one snapshot and still is not a real persistence strategy. Every production MongoDB, Postgres, or MySQL container you will ever run needs this lesson learned once, on purpose, before it costs you real data.',
          steps: [
            'Confirm `noticeboard-server` and `noticeboard-mongo` are both running from Module 2: `docker ps`.',
            'Post at least two real notices to the running API with `curl -X POST http://localhost:5000/api/notices ...`.',
            'Confirm both come back from `curl http://localhost:5000/api/notices`.',
            'Force-remove the Mongo container: `docker rm -f noticeboard-mongo`.',
            'Start a brand-new Mongo container with the exact same name and image, no volume: `docker run -d --name noticeboard-mongo -p 27017:27017 mongo:7`.',
            'Hit `GET /api/notices` again (reconnecting the server to the new container\'s IP if needed) and confirm the list is empty.',
          ],
          code: `# Server + Mongo already running from Module 2 (server -> mongo by IP/--link)
docker ps
# CONTAINER ID   IMAGE                NAMES
# 7f8e9d0c1b2a   noticeboard-server   noticeboard-server
# a1b2c3d4e5f6   mongo:7              noticeboard-mongo

# Post two real notices through the running API:
curl -X POST http://localhost:5000/api/notices \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Boat fuel price up","message":"Diesel now Rs 96/litre at the harbour pump","category":"Fish Market","postedBy":"Ganesh Bhandary"}'

curl -X POST http://localhost:5000/api/notices \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Gangolli ferry delayed","message":"11am crossing pushed to 11:45 due to low tide","category":"Bus & Ferry","postedBy":"Chandrahasa"}'

# Confirm both are there:
curl http://localhost:5000/api/notices
# -> [ { "title": "Boat fuel price up", ... }, { "title": "Gangolli ferry delayed", ... } ]

# Now deliberately destroy the Mongo container:
docker rm -f noticeboard-mongo
# -> noticeboard-mongo

# Run a brand-new Mongo container - same image, same name, still zero volumes:
docker run -d --name noticeboard-mongo -p 27017:27017 mongo:7

# The new container usually has a new IP too (Module 2's fragile connection method) -
# reconnect the server, then ask the API again:
curl http://localhost:5000/api/notices
# -> []   <-- the container came back. The data did not.`,
          pitfalls: [
            '**Assuming `docker stop` also destroys data.** `docker stop` only pauses the process; the writable layer and its data are untouched until you `docker rm`. Fix: test the *actual* failure mode you care about — container removal — not just a stop/start cycle.',
            '**Confusing "the image has the data" with "the container has the data."** The `mongo:7` image is identical before and after your test; it never held your notices — only the now-deleted container\'s writable layer did. Fix: remember data lives in the *container*, never the image.',
            '**Thinking `docker commit` is a backup strategy.** Committing the running container into a new image freezes one snapshot at that moment; it does not keep growing as new notices arrive, and running a container from it duplicates old data instead of sharing live data. Fix: use volumes (next topic) for anything that changes over time.',
            '**Skipping the "recreate and check" step and just trusting the theory.** It is easy to assume you understand ephemeral storage without ever watching it actually happen to your own data. Fix: always run the destroy-and-recreate test yourself at least once per project.',
            '**Forgetting the server\'s connection breaks too.** Since Module 2 wired the server to Mongo by IP/`--link`, a freshly recreated `noticeboard-mongo` container usually gets a *new* IP address, so the API may need reconnecting before you can even confirm the data loss. Fix: expect to re-point the server, or check directly with `docker exec noticeboard-mongo mongosh --eval "db.notices.find()"` — Module 4 removes this fragility for good.',
            '**Only ever testing with a deliberate, calm `docker rm -f` on an otherwise idle database.** Real incidents are usually a crashed container getting auto-recreated, not a calm delete. Fix: mentally generalize this test to "anything that removes and recreates the container" — a crash, an accidental `docker system prune`, a redeploy.',
          ],
          tryIt:
            'Post three different Kundapura Notice Board notices of your own (one Fish Market, one Bus & Ferry, one Festival), confirm all three via `GET /api/notices`, then run `docker rm -f noticeboard-mongo` followed by a fresh `docker run` of `mongo:7` with the same name and no volume. Confirm the list is empty before moving to the next topic.',
          takeaway:
            'A container\'s filesystem is a writable layer tied to that specific container\'s lifecycle, so removing the container — even with the exact same image and name — always destroys its data unless that data lives in a volume.',
        },
        {
          id: 'm3-t2',
          title:
            'Named volumes: docker volume create, mounting into a container, docker volume ls/inspect',
          explain:
            'Create a Docker-managed **named volume** called `mongo-data`, mount it at MongoDB\'s actual data directory (`/data/db`), and prove that notices now survive `docker rm -f noticeboard-mongo` followed by a fresh container.',
          analogy:
            'Kundapura\'s harbour has actual permanent stone-and-tile bonded warehouses next to the temporary fish stalls — buildings owned and maintained by the port authority, not any single vendor. Boats (containers) come and go, tie up, unload, and sail off again, but crates placed inside the bonded warehouse stay exactly where they were left, waiting for whichever boat needs them next. A **named volume** is that warehouse: created once, given a name (`mongo-data`), and handed to whichever container asks for it — completely outside any single container\'s lifecycle.',
          theory:
            'A **named volume** is storage that Docker itself creates and manages, independent of any container. You create one explicitly: `docker volume create mongo-data`. Docker allocates a folder for it on the host — by default under `/var/lib/docker/volumes/mongo-data/_data` on Linux (inside the Docker Desktop VM on Windows/macOS) — but you are never meant to touch that path directly; you always interact with it through the volume name.\n\nYou attach a volume to a container at `docker run` time with `-v <volume-name>:<container-path>`, or the more explicit `--mount type=volume,source=mongo-data,target=/data/db`. The path on the right is wherever the container\'s software actually expects its data — for the official `mongo` image, that is always `/data/db` (baked into the image\'s own configuration; changing it requires extra Mongo flags, so just use the standard path).\n\nOnce mounted, MongoDB inside the container writes its data files into `/data/db` exactly as it always would — it has no idea that path is actually a Docker-managed volume rather than "regular" container storage. That is the trick: the *volume* now owns the actual bytes, and the container is just the current tenant using it.\n\nUseful commands you will use constantly from here on:\n- `docker volume create <name>` — create one explicitly (or let `docker run -v` auto-create it if it does not exist yet).\n- `docker volume ls` — list every volume Docker knows about on this machine.\n- `docker volume inspect <name>` — see its `Mountpoint` (the real host path), creation time, and driver.\n- `docker volume rm <name>` — delete it permanently (Docker refuses if any container, running or stopped, still references it).\n\nBecause the volume\'s lifecycle is entirely separate from any one container\'s, you can now `docker rm -f noticeboard-mongo` as many times as you like, run a fresh `mongo:7` container with the *same* `-v mongo-data:/data/db` flag, and every notice ever written is right there waiting, because it was never inside the container to begin with.',
          whyItMatters:
            'This is the permanent fix for the exact data loss you just proved in the previous topic, and it is the standard, correct way every real MongoDB/Postgres/MySQL container is run in production. Kundapura Notice Board\'s notices — every fish price update, every ferry delay, every lost-and-found post — now genuinely survive container restarts, rebuilds, host reboots, and Docker upgrades.',
          steps: [
            'Create the named volume: `docker volume create mongo-data`.',
            'Confirm it exists with `docker volume ls`.',
            'Run a fresh Mongo container mounting it: `docker run -d --name noticeboard-mongo -p 27017:27017 -v mongo-data:/data/db mongo:7`.',
            'Post a new notice through the API and confirm it is stored.',
            'Inspect the volume with `docker volume inspect mongo-data` and note the `Mountpoint`.',
            'Repeat the destroy-and-recreate test from the previous topic — `docker rm -f noticeboard-mongo`, then rerun the same `-v mongo-data:/data/db` command — and confirm the notice is still there.',
          ],
          code: `# Create a named volume for Mongo's data directory:
docker volume create mongo-data
# -> mongo-data

docker volume ls
# DRIVER    VOLUME NAME
# local     mongo-data

# Run Mongo with the volume mounted at Mongo's actual data directory:
docker run -d --name noticeboard-mongo -p 27017:27017 -v mongo-data:/data/db mongo:7

# Inspect where Docker actually keeps this on the host:
docker volume inspect mongo-data
# [
#   {
#     "CreatedAt": "2026-07-22T10:14:02Z",
#     "Driver": "local",
#     "Mountpoint": "/var/lib/docker/volumes/mongo-data/_data",
#     "Name": "mongo-data",
#     "Scope": "local"
#   }
# ]

# Post a notice through the API, then repeat the earlier destroy-and-recreate test:
curl -X POST http://localhost:5000/api/notices -H "Content-Type: application/json" \\
  -d '{"title":"Ganesh Chaturthi pandal meeting","message":"Sunday 6pm at the temple hall","category":"Festival","postedBy":"Suresh Shenoy"}'

docker rm -f noticeboard-mongo
docker run -d --name noticeboard-mongo -p 27017:27017 -v mongo-data:/data/db mongo:7

curl http://localhost:5000/api/notices
# -> [ { "title": "Ganesh Chaturthi pandal meeting", ... } ]   <-- survived!`,
          pitfalls: [
            '**Forgetting the `-v mongo-data:/data/db` flag on the *next* `docker run`.** The volume still exists, but a container started without mounting it is exactly as ephemeral as before. Fix: make mounting the volume a permanent part of every `docker run`/Compose command for Mongo, not a one-time step.',
            '**Mounting the volume at the wrong container path**, e.g. `/data` instead of `/data/db`. MongoDB silently keeps using its default unmounted directory, so nothing actually persists and the mistake is easy to miss. Fix: always mount at the exact path the software documents — `/data/db` for the official Mongo image.',
            '**Typing the volume name slightly differently between runs** (`mongo-data` vs `mongodata` vs `mongo_data`). Docker treats it as a brand-new, empty volume rather than an error. Fix: pick one exact name and reuse it verbatim everywhere, or better, define it once in Compose (Module 6) so it cannot drift.',
            '**Trying `docker volume rm mongo-data` while `noticeboard-mongo` (even if stopped, not removed) still references it.** Docker refuses with "volume is in use." Fix: remove the container first (`docker rm`), then remove the volume if you truly want to wipe the data.',
            '**Poking around inside `/var/lib/docker/volumes/...` directly on the host.** It works on Linux but is not portable (Windows/macOS run Docker inside a hidden VM, so that path is not directly on your machine), and manual edits can corrupt Mongo\'s files. Fix: always go through the volume via a container, never edit the raw files on the host.',
            '**Assuming `docker volume create` is required before every use.** `docker run -v mongo-data:/data/db ...` auto-creates the volume the first time if it does not already exist. Fix: explicit `docker volume create` is good practice for clarity, but do not be surprised when Docker creates it implicitly too.',
          ],
          tryIt:
            'Create `mongo-data`, run Mongo with it mounted, post a notice, run `docker volume inspect mongo-data` and read the `Mountpoint` field, then destroy and recreate the Mongo container twice in a row — confirming the notice survives both times.',
          takeaway:
            'A named volume (`docker volume create`, then `-v <name>:/data/db`) is storage Docker manages independently of any container, so data mounted into one survives the container being destroyed and recreated indefinitely.',
        },
      ],
    },
    {
      id: 'm3-s2',
      title: 'Volumes for Development',
      topics: [
        {
          id: 'm3-t3',
          title:
            'Bind mounts — mounting your local server/src folder into the container for live code changes',
          explain:
            'Mount your local `server/src` folder directly into the running `noticeboard-server` container with a **bind mount**, so files edited on your laptop are immediately visible inside the container — no image rebuild required.',
          analogy:
            'At the **Gangolli ferry crossing**, most cargo gets unloaded from a boat, sorted, and re-packed onto a truck — a slow handoff. But during the fish rush, the harbour sometimes lets a loaded delivery van drive straight onto the ferry deck and off again at the other side, same crates, same van, nothing repacked, nothing copied — whatever is loaded at the harbour is instantly what arrives at the market. A **bind mount** is that direct drive-on: your `server/src` folder on your laptop is not copied into the container at all, it is made directly visible at a path inside the container, so a change on one side is *the same file*, instantly, on the other.',
          theory:
            'A **bind mount** connects a specific path on your **host machine** to a path inside the container, using the syntax `-v <host-path>:<container-path>` (or `--mount type=bind,source=<host-path>,target=<container-path>`). For Kundapura Notice Board\'s server:\n```\ndocker run -d --name noticeboard-server -p 5000:5000 \\\\\n  -v "$(pwd)/server/src:/app/src" \\\\\n  noticeboard-server\n```\nThis says: whatever exists at `./server/src` on my machine right now, make that exact content appear at `/app/src` inside the container. There is no copying step and no snapshot — it is closer to a shortcut/symlink than a duplicate. Edit `server/src/routes/notices.js` in VS Code on your laptop, save, and the file inside the running container has already changed, because it always was your host file, viewed through a different path.\n\nThis is fundamentally different from a **named volume**. A named volume\'s left-hand side is a *name* Docker owns and manages (`mongo-data`) — you never choose or see the underlying host path day-to-day, and Docker decides where the actual bytes live. A bind mount\'s left-hand side is a *path you choose*, one you already know and can open directly in your editor, and Docker has no involvement in managing its lifecycle at all — it is exactly the folder that was already there.\n\nA critical detail: a bind mount **completely replaces** whatever was at that container path before, for as long as the container runs. Your `Dockerfile`\'s `COPY src ./src` baked a copy of `server/src` into the image at build time — but the moment you bind-mount over `/app/src`, that baked-in copy is hidden underneath your live host folder for the life of this container. This is exactly what you want during development, and exactly what you do **not** want in production (where you want the tested, baked-in code, not whatever happens to be on someone\'s laptop).',
          whyItMatters:
            'Without a bind mount, every single code change — even fixing a typo in an error message — would mean rebuilding the image and restarting the container, turning a two-second edit into a slow, disruptive cycle. Bind mounts are what makes containerized development for Kundapura Notice Board feel as fast as running `node` directly on your laptop, while still running inside the exact same Linux environment the container will use in production.',
          steps: [
            'Stop and remove the existing `noticeboard-server` container if it is running from Module 2 (`docker rm -f noticeboard-server`).',
            'Rerun it with a bind mount over the source folder: `-v "$(pwd)/server/src:/app/src"` (adjust the quoting/`$(pwd)` for your shell — see pitfalls).',
            'Open `server/src/routes/notices.js` on your laptop and make a small, visible change, e.g. edit a validation error message.',
            'Save the file, then confirm the change is visible inside the container: `docker exec noticeboard-server cat src/routes/notices.js`.',
            'Hit the affected endpoint with `curl` to see the new behaviour without having rebuilt or restarted anything.',
            'Compare this to editing the file *before* adding the bind mount, where the change would not appear until a full rebuild.',
          ],
          code: `# Remove the plain Module 2 server container first:
docker rm -f noticeboard-server

# Rerun it, bind-mounting the local server/src folder over /app/src:
docker run -d --name noticeboard-server -p 5000:5000 \\
  --env-file server/.env \\
  -v "$(pwd)/server/src:/app/src" \\
  noticeboard-server

# Edit server/src/routes/notices.js on your HOST machine - e.g. change the
# category validation message - save, then look inside the running container:
docker exec noticeboard-server cat src/routes/notices.js | grep "Invalid category"
# -> shows YOUR edited line, not the one baked into the image at build time

# Confirm it with a real request:
curl -X POST http://localhost:5000/api/notices \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Test","message":"Test","category":"Not A Real Category","postedBy":"You"}'
# -> your NEW error message comes back, with zero docker build`,
          pitfalls: [
            '**Using `$(pwd)` in a Windows `cmd.exe` or default PowerShell prompt.** `$(pwd)` is bash/Git Bash syntax; PowerShell needs `${PWD}` and `cmd.exe` needs `%cd%`, otherwise Docker gets a literal, wrong path. Fix: use the syntax that matches the terminal you are actually running, or just paste the absolute path directly.',
            '**Bind-mounting the whole project root instead of just `server/src`.** This also overwrites the container\'s `node_modules` with whatever (or nothing) exists on the host, and Linux-built native binaries inside `node_modules` do not always run correctly if the host mount comes from a different OS. Fix: mount only the narrow folder you actually need to edit live — `server/src`, not `server`.',
            '**Expecting the running Node process to notice the change on its own.** A bind mount makes the *file* update instantly, but plain `node src/index.js` only reads a file once, at startup, and holds it in memory after that — editing the file does not restart the process by itself. Fix: this is exactly what the next topic (nodemon) solves.',
            '**Forgetting a bind mount totally replaces the container path\'s prior contents.** If you expected to still see something the `Dockerfile`\'s `COPY` baked in at that exact path, it is hidden from view for as long as the mount is active (though still present, unseen, inside the image itself). Fix: know that bind-mounting `/app/src` fully shadows the image\'s baked-in `/app/src` for that container\'s lifetime.',
            '**Mixing up which direction changes flow.** A bind mount is two-way — editing the file from *inside* the container (e.g. via `docker exec`) changes it on your host too. Fix: treat it as literally one folder viewed from two places, not a one-way sync.',
            '**Bind-mounting a path that does not exist yet on the host.** Docker silently creates an *empty directory* at that host path rather than erroring, which can be confusing if you meant an existing folder. Fix: double check the host path is correct and already contains what you expect before mounting.',
          ],
          tryIt:
            'Run `noticeboard-server` with `server/src` bind-mounted to `/app/src`, then edit the `category` validation message in `server/src/routes/notices.js` on your laptop and confirm — via `docker exec ... cat` and then a real `curl` POST with an invalid category — that the new message is live without any `docker build`.',
          takeaway:
            'A bind mount (`-v <host-path>:<container-path>`) makes a folder you already control on your host directly visible inside the container, so edits appear instantly — unlike a named volume, whose storage Docker owns and manages for you.',
        },
        {
          id: 'm3-t4',
          title: 'nodemon inside a container + bind mount = fast local dev loop',
          explain:
            'Add **nodemon** as a dev dependency, give `server/Dockerfile` a `dev` build stage that installs it, and run that dev image with the `server/src` bind mount so editing a route on your laptop makes the running container automatically restart the Node process and pick up the change — no rebuild, no manual restart.',
          analogy:
            'At the temple **prasadam counter**, most days a volunteer has to notice a fresh batch has arrived in the storeroom and physically walk over and announce it before serving resumes. But a well-run counter has one volunteer permanently watching the storeroom door, who calls out the moment a new tray appears and gets the line moving again within seconds — no one else has to remember to check. **nodemon** is that watching volunteer for your Node process: it watches the `src` folder, and the instant a file changes, it restarts `node` for you automatically, so you never have to manually stop and re-run anything yourself.',
          theory:
            'A bind mount alone (previous topic) solves *half* the dev-loop problem: it gets your edited file into the container instantly. But plain `node src/index.js` loads every required file into memory once at startup and never looks at the disk again — editing the file changes what is on disk, not what Node currently has loaded in memory. **nodemon** is a small tool that wraps your Node process, watches the files under it, and restarts that process automatically whenever something changes — so a saved edit reliably becomes a running change within a second or two.\n\nGetting nodemon into the container is a two-part job:\n1. **Add it as a dev dependency** on your host: `npm install --save-dev nodemon` inside `server/`, and add an npm script, e.g. `"dev": "nodemon src/index.js"`, alongside the existing `"start": "node src/index.js"`.\n2. **Give the Dockerfile a `dev` stage** so a dev-mode image actually has nodemon installed (the Module 2 production image deliberately runs `npm ci --omit=dev`, which skips it):\n```dockerfile\nFROM node:20-alpine AS base\nWORKDIR /app\nCOPY package*.json ./\n\nFROM base AS dev\nRUN npm install\nCOPY src ./src\nCMD ["npx", "nodemon", "src/index.js"]\n\nFROM base AS prod\nRUN npm ci --omit=dev\nCOPY src ./src\nCMD ["node", "src/index.js"]\n```\nBuild the dev target specifically with `docker build --target dev -t noticeboard-server:dev ./server` (a taste of the multi-stage builds Module 5 covers properly — here it is just enough to keep dev and prod images cleanly separate).\n\nRun that image with the same `server/src` bind mount from the previous topic, and you get the full loop: edit a route on your laptop → the bind mount makes the new file visible in the container instantly → nodemon notices the change and restarts `node` → your edit is live, all without ever running `docker build` again after that first dev image exists. `docker logs -f noticeboard-server-dev` shows nodemon\'s own restart messages in real time, which is the clearest way to see it actually working.',
          whyItMatters:
            'Without this, every tiny server change during development would cost a full `docker build` (rebuilding npm install layers, copying files) plus a `docker run` restart — turning what should be a two-second edit-and-check into a slow, frustrating cycle that quietly discourages you from actually testing changes as you make them. This combination — bind mount for instant file visibility, nodemon for instant process restart — is the standard pattern used for containerized Node development everywhere, not just for Kundapura Notice Board.',
          steps: [
            'In `server/`, run `npm install --save-dev nodemon` and add a `"dev": "nodemon src/index.js"` script to `package.json`.',
            'Add a `dev` stage to `server/Dockerfile` that runs `npm install` (not `--omit=dev`) and sets `CMD` to run nodemon.',
            'Build the dev-target image: `docker build --target dev -t noticeboard-server:dev ./server`.',
            'Run it with the `server/src` bind mount and follow its logs: `docker run -d --name noticeboard-server-dev -p 5000:5000 -v "$(pwd)/server/src:/app/src" noticeboard-server:dev` then `docker logs -f noticeboard-server-dev`.',
            'Edit a route file on your laptop (e.g. add a `console.log` to `notices.js`) and save.',
            'Watch the log stream show nodemon restarting on its own, then confirm the new behaviour with `curl` — with zero rebuilds since the first one.',
          ],
          code: `# server/package.json (relevant excerpt)
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}

# server/Dockerfile - now with a dev stage alongside the existing prod one
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm install
COPY src ./src
CMD ["npx", "nodemon", "src/index.js"]

FROM base AS prod
RUN npm ci --omit=dev
COPY src ./src
CMD ["node", "src/index.js"]

# Build the dev-target image once (nodemon needs to actually be inside it):
docker build --target dev -t noticeboard-server:dev ./server

# Run it with the bind mount from the previous topic, following logs live:
docker run -d --name noticeboard-server-dev -p 5000:5000 \\
  --env-file server/.env \\
  -v "$(pwd)/server/src:/app/src" \\
  noticeboard-server:dev

docker logs -f noticeboard-server-dev
# [nodemon] 3.1.4
# [nodemon] watching path(s): *.*
# [nodemon] starting \`node src/index.js\`
# Kundapura Notice Board API listening on port 5000

# Now edit server/src/routes/notices.js on the host - add a console.log for
# every GET /api/notices call - and save. Watch the SAME log stream:
# [nodemon] restarting due to changes...
# [nodemon] starting \`node src/index.js\`
# Kundapura Notice Board API listening on port 5000

curl http://localhost:5000/api/notices
# -> your new console.log line appears in \`docker logs\`, with zero docker build`,
          pitfalls: [
            '**Running the *production* image (`--target prod` or the plain default) expecting nodemon to be there.** It was installed with `npm ci --omit=dev`, which deliberately skips devDependencies, so the container crashes with `nodemon: not found`. Fix: always use the `dev`-target image for this workflow.',
            '**Editing `package.json` to add nodemon but never rebuilding the dev image afterward.** The bind mount only covers `server/src`, not `package.json`/`node_modules`, so a new dependency needs one deliberate rebuild before it exists inside the image. Fix: rebuild once after any dependency change; after that, source edits alone need no rebuild.',
            '**Not actually watching `docker logs -f`.** Running the dev container detached (`-d`) without following its logs makes it easy to assume nodemon "is not working" when it is restarting fine, just silently to you. Fix: keep a `docker logs -f noticeboard-server-dev` terminal open while you work.',
            '**Editing a file outside the bind-mounted `server/src` folder and expecting nodemon to pick it up.** nodemon only sees files that are actually visible inside the container\'s filesystem — anything not bind-mounted is still the old, baked-in copy from build time. Fix: keep your live-edit files inside exactly the folder you mounted.',
            '**Expecting nodemon to install new npm packages automatically.** nodemon restarts the *process*, it does not run `npm install` — adding a brand-new dependency still needs a rebuild of the dev image. Fix: treat "new file content" and "new dependency" as two different situations; only the first is truly rebuild-free.',
            '**Leaving the dev container\'s port or name clashing with the plain Module 2 `noticeboard-server` container.** Both trying to bind `5000` or reuse the same container name errors out. Fix: stop/remove the non-dev server container first, or use a distinct name like `noticeboard-server-dev` while working this way.',
          ],
          tryIt:
            'Add nodemon, give the Dockerfile a `dev` stage, build and run `noticeboard-server:dev` with the `server/src` bind mount, then follow its logs while you add a temporary `console.log` inside the `POST /api/notices` route — confirm nodemon restarts automatically and the log line appears on your next `curl` POST, with no `docker build` since the one that added nodemon.',
          takeaway:
            'A bind mount gets your edited file into the container instantly; nodemon (run from a dedicated `dev` build stage with real devDependencies installed) is what actually restarts the Node process to pick that edit up — together they give a full rebuild-free local dev loop.',
        },
        {
          id: 'm3-t5',
          title:
            'Named volumes vs bind mounts vs anonymous volumes — when to use which',
          explain:
            'Compare all three ways Docker can attach storage to a container — named volumes, bind mounts, and (often accidental) anonymous volumes — and settle on a clear rule for which one to reach for in Kundapura Notice Board and beyond.',
          analogy:
            'Three very different things sit around Kundapura\'s harbour: the port authority\'s **bonded warehouse** (built and maintained by the port itself, meant to hold cargo long-term — a named volume); a fisherman\'s own **delivery van driving straight from his boat to a specific stall** (a path he chose and controls himself — a bind mount); and a random **unlabeled crate someone left on the dock**, that nobody claimed, that the harbourmaster eventually has to notice and clear away before it piles up (an anonymous volume — created almost by accident, easy to forget, quietly using up space until someone prunes it).',
          theory:
            'All three are ways Docker attaches storage to a container, but they answer different questions:\n\n- **Named volume** (`-v mongo-data:/data/db`) — the left side is a **name Docker manages**. Use this for data you want Docker to own and keep alive across container recreation: databases, caches, anything that should persist and that you do not need to browse directly with a text editor. This is the right choice for MongoDB\'s `/data/db` in Kundapura Notice Board.\n\n- **Bind mount** (`-v $(pwd)/server/src:/app/src`) — the left side is a **path you choose on the host**, already visible in your editor and your file explorer. Use this for syncing your *live source code* into a container during development, so edits appear instantly. Do **not** use it for a production database\'s data directory — it ties the container to one specific machine\'s filesystem layout, has worse performance across the Docker Desktop VM boundary on Windows/macOS, and is not something Docker manages or backs up for you.\n\n- **Anonymous volume** — created when a `-v` flag names only a *container* path with nothing on the left (`-v /data/db`, no name and no host path), or automatically by an image that declares its own `VOLUME` instruction (the official `mongo` image does exactly this internally as a safety net). Docker invents a random hash-like name for it. The problem: every fresh `docker run` without an explicit name creates *another new* anonymous volume, silently orphaning the previous one — `docker volume ls` fills up over time with unlabeled entries nobody remembers creating, none of them the "real" data you think you have. They are rarely what you actually want; if you see one, it usually means a named volume was intended but the name was left off.\n\n**The simple rule**: reach for a **named volume** whenever the answer to "should this survive the container being destroyed?" is yes and you do not need to browse the files directly (databases). Reach for a **bind mount** whenever the answer to "do I want to edit this from my own editor right now?" is yes (active development source code). Treat any **anonymous volume** you spot in `docker volume ls` as a cleanup candidate, not a data store you are relying on — verify with `docker volume inspect` that nothing important lives there, then `docker volume prune`.',
          whyItMatters:
            'Picking the wrong one of these three is one of the most common real-world Docker mistakes: a database silently running on an anonymous volume that gets orphaned on every redeploy, or a bind mount used in production that breaks the moment the app runs on a different machine. Knowing the three options by name and by their one-line rule of thumb means you will make the right call by default for every project after this course, not just Kundapura Notice Board.',
          steps: [
            'Run `docker volume ls` on your machine and look for any unlabeled, hash-named volumes — these are anonymous.',
            'Pick one anonymous volume and run `docker volume inspect <name>` to see if any container currently uses it.',
            'Confirm `mongo-data` is a named volume and is currently attached to `noticeboard-mongo`.',
            'Confirm the `server/src` bind mount is not listed in `docker volume ls` at all — bind mounts are not volumes and never appear there.',
            'Run `docker volume prune` and read its confirmation prompt carefully before confirming.',
            'Write your own one-line rule, in your own words, for when you would pick each of the three.',
          ],
          code: `# A quick inventory of every volume Docker is currently holding on this machine:
docker volume ls
# DRIVER    VOLUME NAME
# local     mongo-data
# local     3f9a1e7c2b8d4f6a9c0e1b2d3f4a5c6b7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a   <- anonymous, orphaned
# local     b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2   <- anonymous, orphaned

# Anonymous volumes like these usually came from a "docker run" that used a
# bare container path (no name, no host path), e.g. "-v /data/db", or from the
# official mongo image's own built-in VOLUME /data/db instruction kicking in
# whenever no explicit mount was given.

# Confirm mongo-data is the one actually in use:
docker inspect noticeboard-mongo --format '{{ range .Mounts }}{{ .Name }} -> {{ .Destination }}{{ "\\n" }}{{ end }}'
# -> mongo-data -> /data/db

# Inspect a suspicious anonymous one before touching it:
docker volume inspect 3f9a1e7c2b8d4f6a9c0e1b2d3f4a5c6b7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a

# Clean up every volume not attached to any container (mongo-data is safe - it's in use):
docker volume prune
# WARNING! This will remove all local volumes not used by at least one container.
# Are you sure you want to continue? [y/N] y
# Deleted Volumes:
# 3f9a1e7c2b8d4f6a9c0e1b2d3f4a5c6b7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a
# b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2`,
          pitfalls: [
            '**Letting a database run on an anonymous volume "temporarily" and forgetting about it.** It works fine until the container is recreated with a slightly different `docker run` command, which creates a *new* anonymous volume and leaves the old data orphaned and easy to lose track of. Fix: any data you care about always gets an explicit name.',
            '**Using a bind mount for MongoDB\'s `/data/db` "to see the files."** Mongo\'s storage engine expects filesystem behaviour (locking, permissions) that a bind mount across the Docker Desktop VM boundary on Windows/macOS does not always provide cleanly, and it ties your data to one machine\'s exact folder layout. Fix: named volume for database data, always.',
            '**Using a named volume for `server/src` during development.** You would not be able to edit the code from your normal editor at all — you would have to `docker exec` in and edit with a terminal editor, which defeats the entire point. Fix: bind mount for anything you want to edit live from your own machine.',
            '**Running `docker volume prune` without checking what is actually unused first.** It deletes *every* volume not attached to at least one container, which can include something you meant to keep but simply are not using at that exact moment. Fix: `docker volume ls` and `docker volume inspect` first, prune second.',
            '**Assuming bind mounts show up in `docker volume ls`.** They do not — that command only lists volumes (named and anonymous), never bind mounts, since a bind mount is not a Docker-managed object at all. Fix: check `docker inspect <container>` under `"Mounts"` if you need to see a container\'s bind mounts specifically.',
            '**Copy-pasting a `docker run` command from a tutorial that uses a bare `-v /data/db`.** It silently creates yet another anonymous volume every time it is run, instead of reusing your actual `mongo-data`. Fix: always double check any `-v` flag you copy has the name (or host path) you actually intend on the left of the colon.',
          ],
          tryIt:
            'List every volume on your machine with `docker volume ls`, identify which (if any) are anonymous, inspect one to confirm whether a container still uses it, then explain out loud — in one sentence each — why `mongo-data` should be a named volume and `server/src` should be a bind mount, never the other way round.',
          takeaway:
            'Named volumes are for data you want Docker to own and persist (databases); bind mounts are for syncing your own live source code during development; anonymous volumes are almost always an accident worth cleaning up, not a real data store.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm3-p1',
      type: 'Mini Project',
      title: 'Make Data Survive, Make Dev Fast',
      domain: 'Data & DevEx',
      duration: '3-4 hrs',
      description:
        'Turn everything this module covered into two permanent, working pieces of Kundapura Notice Board: a `mongo-data` named volume that makes every posted notice survive `docker rm -f noticeboard-mongo`, however many times you recreate it, and a `dev`-stage server image with `nodemon` plus a `server/src` bind mount, so editing a route on your laptop shows up live in the running container within seconds — no image rebuild required. By the end, both the data and your development workflow are solid; only the fragile IP-based connection between server and Mongo is still left to fix.',
      tools: ['Docker Desktop', 'Docker CLI', 'MongoDB (mongo:7 image)', 'Node.js + Express', 'nodemon'],
      blueprint: {
        overview:
          'Right now Kundapura Notice Board has two real problems left over from Module 2: every notice disappears the moment `noticeboard-mongo` is removed, and every server-side code change costs a full image rebuild. This project fixes both, permanently, using nothing more than named volumes and bind mounts — no new infrastructure, no networking changes, just correctly telling Docker what should persist and what should sync live from your laptop.',
        functionalRequirements: [
          'A named volume `mongo-data` exists, is mounted at `/data/db` on every `noticeboard-mongo` container going forward, and demonstrably survives at least two full `docker rm -f` + recreate cycles with real posted notices.',
          'A `dev` build stage exists in `server/Dockerfile` that installs `nodemon` as a real, present devDependency (not skipped by `--omit=dev`) and starts the server through nodemon instead of plain `node`.',
          'The dev-stage server container runs with `server/src` bind-mounted, so an edited route file is visible inside the running container immediately, with no rebuild.',
          'Editing a route file on the host triggers an automatic nodemon restart inside the running container, visible in `docker logs`, and the new behaviour is confirmable via `curl` without any `docker build` after the first dev image exists.',
          'The production build path (`--target prod` or equivalent) is left untouched and still produces the same lean, nodemon-free image from Module 2.',
        ],
        technicalImplementation: [
          'Create the volume with `docker volume create mongo-data` and always run Mongo with `-v mongo-data:/data/db` from now on.',
          'Prove persistence with a real before/after: post notices, `docker rm -f noticeboard-mongo`, recreate with the same volume flag, confirm the notices are still returned by `GET /api/notices`.',
          'Add `nodemon` via `npm install --save-dev nodemon` inside `server/`, plus a `"dev": "nodemon src/index.js"` script in `package.json`.',
          'Restructure `server/Dockerfile` into a shared `base` stage plus separate `dev` (full `npm install`, nodemon CMD) and `prod` (`npm ci --omit=dev`, plain `node` CMD) stages, building each explicitly with `docker build --target <dev|prod>`.',
          'Run the dev image with `-v "$(pwd)/server/src:/app/src"` and confirm the live-edit loop with `docker logs -f` while editing a route on the host.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Create the named volume and prove persistence',
            outcome:
              'A `mongo-data` named volume mounted at `/data/db`, with real Kundapura Notice Board notices confirmed to survive `docker rm -f noticeboard-mongo` across at least two recreate cycles.',
            prompt:
              'Create a named Docker volume called `mongo-data`. Run a fresh `noticeboard-mongo` container (from the `mongo:7` image, same name and port as Module 2) mounting this volume at `/data/db`. Through the running `noticeboard-server` API, post at least two real notices (pick realistic Kundapura content — a fish market price update and a ferry timing change). Confirm both come back from `GET /api/notices`. Then run `docker rm -f noticeboard-mongo` and start a brand-new Mongo container with the exact same volume mount. Show me the `GET /api/notices` output proving the notices survived, and repeat the destroy-and-recreate step once more to prove it is not a fluke.',
          },
          {
            step: 2,
            label: 'Add nodemon and a dev build stage',
            outcome:
              'server/package.json lists nodemon as a devDependency with a working `dev` script, and server/Dockerfile has a distinct `dev` build stage that actually installs it.',
            prompt:
              'In the `server/` folder, add `nodemon` as a devDependency and a new `"dev"` script in `package.json` that runs the app through nodemon instead of plain `node`. Then restructure `server/Dockerfile` into a shared `base` stage (WORKDIR + `COPY package*.json`) followed by two separate stages: a `dev` stage that runs a full `npm install` (so devDependencies like nodemon are actually present) and starts the app via nodemon, and a `prod` stage that keeps the existing lean `npm ci --omit=dev` behaviour from Module 2 with the plain `node` start command. Show me the full Dockerfile and explain in your own words why nodemon would crash if it ran inside the `prod`-stage image instead.',
          },
          {
            step: 3,
            label: 'Run the dev image with a bind mount and prove live reload',
            outcome:
              'A running `noticeboard-server-dev` container, bind-mounted to `server/src`, that visibly restarts via nodemon and serves an edited route with zero rebuilds.',
            prompt:
              'Build the dev-stage image with `docker build --target dev`, tag it `noticeboard-server:dev`, and run it bind-mounting your local `server/src` folder to `/app/src` inside the container, following its logs with `docker logs -f`. With the container running, edit one route in `server/src/routes/notices.js` on your laptop in some visible way (for example, change the error message returned for an invalid `category`, or add a temporary log line). Save the file, show me the nodemon restart messages from the log stream, and then show a `curl` call proving the new behaviour is live — all without running `docker build` again after the first one.',
          },
          {
            step: 4,
            label: 'Verify the prod path is untouched and write up the before/after',
            outcome:
              'Confirmation that the production build still works exactly as it did in Module 2, plus a short written summary of what now persists, what now syncs live, and what is still fragile.',
            prompt:
              'Build the `prod`-target image with `docker build --target prod`, run it the plain Module 2 way (no bind mount, no nodemon), and confirm it starts and serves `/api/notices` correctly with the persisted `mongo-data` volume, proving Module 2\'s production behaviour was not broken by any of these changes. Then write two or three sentences summarizing what is now solved (data persistence, fast dev loop) and what is deliberately still left fragile (the IP/`--link`-based connection between `noticeboard-server` and `noticeboard-mongo`), as the honest motivation for the very next module.',
          },
        ],
        deliverable:
          'A working `mongo-data` named volume that keeps every Kundapura Notice Board notice alive across any number of `noticeboard-mongo` container removals and recreations, plus a `server/Dockerfile` with clean `dev` and `prod` build stages — the `dev` stage running through nodemon with `server/src` bind-mounted for a genuine rebuild-free local edit loop, the `prod` stage exactly as lean as Module 2 left it. Data is safe and local development is fast — but server and Mongo still find each other the fragile Module 2 way, by manually tracking an IP address (or `--link`) that changes every time a container is recreated. That crack is exactly what Module 4 closes, by giving both containers a real Docker network and letting them find each other by name instead.',
      },
    },
  ],
  quiz: [
    {
      id: 'm3-q1',
      q: 'You post several notices to Kundapura Notice Board, then run `docker rm -f noticeboard-mongo` and start a brand-new `mongo:7` container with the same name, but without any volume mounted. What happens to the notices?',
      options: [
        'They are automatically backed up by Docker and restored to the new container',
        "They are gone, because the previous container's writable filesystem layer was deleted along with the container itself",
        'They are still there because the `mongo:7` image itself stores the data',
        'They move to the new container automatically as long as the name matches',
      ],
      answer: 1,
    },
    {
      id: 'm3-q2',
      q: 'What is the key difference between a named volume and a bind mount?',
      options: [
        'A named volume is always faster than a bind mount',
        'A bind mount can only be used with MongoDB, not other databases',
        "A named volume's storage is a name Docker creates and manages for you; a bind mount's storage is a specific path on the host that you choose yourself",
        'There is no real difference — they are two names for the same feature',
      ],
      answer: 2,
    },
    {
      id: 'm3-q3',
      q: 'You run `docker volume inspect mongo-data`. Which piece of information does this show you?',
      options: [
        'The list of notices currently stored inside it',
        "The real host path (`Mountpoint`) where Docker is storing this volume's data, along with its driver and creation time",
        'Which container will use it next',
        'The total disk space used by all containers combined',
      ],
      answer: 1,
    },
    {
      id: 'm3-q4',
      q: 'You want to edit `server/src/routes/notices.js` on your laptop and see the change reflected instantly inside a running container, without rebuilding the image. Which tool is the right one for this specific job?',
      options: [
        'A named volume mounted at `/data/db`',
        'A bind mount of `server/src` into the container, ideally combined with nodemon so the Node process restarts automatically',
        '`docker commit` run after every edit',
        'Rebuilding the image with `docker build` after every change',
      ],
      answer: 1,
    },
    {
      id: 'm3-q5',
      q: 'You run `docker volume ls` and see, alongside `mongo-data`, several volumes with long random hash-like names that nobody remembers creating. What are these, and what should you do?',
      options: [
        'They are corrupted named volumes that must be repaired with `docker volume repair`',
        "They are anonymous volumes, often created by a bare `-v /data/db`-style flag or an image's built-in `VOLUME` instruction; verify they are unused, then clean them up with `docker volume prune`",
        'They are required by Docker and must never be removed',
        'They are automatic backups of `mongo-data` and should be kept indefinitely',
      ],
      answer: 1,
    },
  ],
}
