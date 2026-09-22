// Module 0 — Why Docker? Containers vs VMs & Your First Containers
// The very first module of "Docker for MERN Developers". No Dockerfile exists
// yet. The learner clones the pre-written "Kundapura Notice Board" MERN app
// (server/ + client/) and runs it the hard way — by hand, no Docker — to feel
// exactly what "works on my machine" costs. Then we open the hood on what a
// container fundamentally is versus a Virtual Machine, install Docker itself,
// and run the very first containers straight from Docker Hub (hello-world,
// mongo, nginx) using nothing but the CLI. Dockerfiles start in Module 1.

export const m0 = {
  id: 'm0',
  title: 'Why Docker? Containers vs VMs & Your First Containers',
  hours: 5,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Before writing a single `Dockerfile`, feel the exact problem Docker exists to solve. You will clone **Kundapura Notice Board** — the MERN community noticeboard app this entire course is built around — and run it the hard way: install the exact pinned Node version, `npm install` twice, wire up a **MongoDB Atlas** connection by hand, and juggle two terminals just to post one test notice. Then we open the hood on what a **container** actually is — Linux namespaces, cgroups, and a shared host kernel — and see precisely why it starts in milliseconds where a **Virtual Machine** takes tens of seconds. You will install **Docker Desktop** (or Docker Engine on Linux), run your very first container (`hello-world`), learn the core CLI lifecycle (`pull`, `run`, `ps`, `stop`, `rm`), and pull real production software — **MongoDB** and **nginx** — straight from **Docker Hub**, no `Dockerfile` required yet. By the end of this module you will not just be told Docker is useful — you will have felt exactly why.',
  sections: [
    {
      id: 'm0-s1',
      title: 'The Problem Docker Solves',
      topics: [
        {
          id: 'm0-t1',
          title: 'Meet Kundapura Notice Board — clone it and run it the old way (no Docker)',
          explain:
            'Clone the pre-written **Kundapura Notice Board** MERN source, install the exact pinned Node version, run `npm install` separately inside `server/` and `client/`, wire up a MongoDB Atlas connection string by hand, and run both dev servers in two terminals — just to post one test notice, the hard way, before Docker enters the picture at all.',
          analogy:
            'Picture the **Kundapura fish market** an hour before sunrise: the auction counter at the back, where the night\'s catch gets weighed and logged, has to be up and running — AND the retail stalls out front, quoting prices off that same log, have to be open at the very same time. If only one side is awake, a customer walks up to a silent stall, or the auction counter shouts prices nobody out front can hear. Getting **Kundapura Notice Board** running on your laptop is exactly this: the `server` folder (the counting counter) and the `client` folder (the retail stalls) are two completely separate programs that both have to be alive, in two separate terminal windows, before a single notice can be posted — and a new stall-hand arriving with a scale calibrated even slightly differently (a teammate with a different Node version) throws off the whole morning.',
          theory:
            'At this stage the repo has no Docker anywhere in it — just two independent Node projects sitting side by side:\n- `server/` — an Express + Node API. `package.json` pins an exact Node version via its `engines` field. `src/index.js` is the entrypoint, listening on `process.env.PORT` (defaulting to `5000`). `src/db.js` connects with `mongoose.connect(process.env.MONGO_URI)`. `src/routes/notices.js` and `src/models/Notice.js` hold the actual notice-board logic.\n- `client/` — a React + Vite frontend. `src/main.jsx` and `src/App.jsx` render the UI; `src/api.js` reads `import.meta.env.VITE_API_URL` to know where the backend lives. The Vite dev server runs on port `5173`.\n\nEach folder has its **own** `package.json` and its **own** `node_modules` — there is no shared install, no workspace tool, nothing automated yet. To get the app running you do every step by hand: install the *exact* Node version `server/package.json` expects (a mismatch here causes subtle, hard-to-read failures rather than a clean error), run `npm install` inside `server/`, run `npm install` again inside `client/`, then create a `server/.env` with a real **MongoDB Atlas** free-tier connection string (`MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/noticeboard`), `PORT=5000`, and `NODE_ENV=development`. The client needs its own `client/.env` with `VITE_API_URL` pointing at the server.\n\nOnly then can you open **two terminals**: one running the server\'s dev script, one running the client\'s dev script, both left running the entire time you work. Post one test notice through the UI and confirm it round-trips through Express, Mongoose, and Atlas back to the browser. Every single step above — Node version, two `.env` files, two live terminals, one live Atlas cluster reachable from your current network — is a place a fresh clone can silently fail on a machine that is not yours.',
          whyItMatters:
            'This exact ritual — matching Node versions, remembering two separate `.env` files, keeping two terminals alive, and hoping your network can reach Atlas — is precisely the disease Docker was invented to cure. Feel this pain fully now, because every remaining module in this course is really just "how do we make Kundapura Notice Board start with one command, identically, on any machine" — and you cannot appreciate the cure until you have felt the illness.',
          steps: [
            'Check `server/package.json`\'s `engines` field for the exact required Node version, and install/switch to that exact version (e.g. with `nvm install` / `nvm use`).',
            'Clone the Kundapura Notice Board repository and open it in your editor.',
            'Run `npm install` inside `server/`, then separately run `npm install` inside `client/`.',
            'Create a free MongoDB Atlas cluster, whitelist your current IP (or `0.0.0.0/0` for local dev), and copy its connection string into a new `server/.env` as `MONGO_URI`, alongside `PORT=5000` and `NODE_ENV=development`.',
            'Create `client/.env` with `VITE_API_URL` pointing at `http://localhost:5000/api/notices`.',
            'In Terminal 1, start the server\'s dev script; in Terminal 2, start the client\'s dev script; open the app in a browser and post one test notice, then confirm it appears via `curl http://localhost:5000/api/notices`.',
          ],
          code: `# --- Terminal setup, the old way (no Docker anywhere yet) ---

# 1) Match the exact Node version the project expects
cat server/package.json | grep -A 2 '"engines"'
# -> "engines": { "node": ">=20.11.0 <21.0.0" }
nvm install 20.11.1
nvm use 20.11.1
node --version
# -> v20.11.1

# 2) Install dependencies — TWO separate installs, two separate node_modules
cd server
npm install
# added 187 packages in 9s
cd ../client
npm install
# added 342 packages in 14s
cd ..

# 3) Wire up server/.env by hand (Atlas free-tier cluster, created in the browser)
cat server/.env
# MONGO_URI=mongodb+srv://noticeboard_user:<pass>@cluster0.mongodb.net/noticeboard
# PORT=5000
# NODE_ENV=development

# 4) Wire up client/.env by hand
cat client/.env
# VITE_API_URL=http://localhost:5000/api/notices

# 5) Terminal 1 — start the API
cd server && npm run dev
# [nodemon] starting \`node src/index.js\`
# Mongo connected: cluster0.mongodb.net/noticeboard
# Server listening on port 5000

# 6) Terminal 2 — start the frontend (separate terminal, both must stay open)
cd client && npm run dev
#   VITE v5.2.0  ready in 340 ms
#   ➜  Local:   http://localhost:5173/

# 7) Post a test notice through the UI, then confirm it landed:
curl http://localhost:5000/api/notices
# [{"_id":"...","title":"Sardine prices up ₹20/kg today",
#   "category":"Fish Market","postedBy":"Asha","createdAt":"2026-07-22T05:03:11.000Z"}]`,
          pitfalls: [
            '**Installing "whatever Node happens to be on your laptop" instead of the pinned version.** A teammate on Node 18 hits confusing dependency errors that never show up for someone on Node 20. Fix: always check `package.json`\'s `engines` field and match it with `nvm install`/`nvm use` before running `npm install`.',
            '**Forgetting one of the two `.env` files.** The server starts fine but the client\'s `import.meta.env.VITE_API_URL` is `undefined`, so every request silently goes nowhere. Fix: create both `server/.env` and `client/.env` before starting either dev server, and double-check both exist with `ls -a`.',
            '**Not whitelisting your current network\'s IP in MongoDB Atlas.** The app works perfectly at home, then times out with `MongooseServerSelectionError` the moment you switch to office wifi or a mobile hotspot. Fix: whitelist `0.0.0.0/0` for local development, or re-add your current IP each time your network changes.',
            '**Only ever starting one of the two terminals.** The React app loads but every notice list request hangs or shows a network error, because nothing is actually listening on port 5000. Fix: always confirm both terminals show a "ready"/"listening" line before opening the browser.',
            '**Port 5000 already taken by something else on your machine** (on macOS this is famously AirPlay Receiver). `npm run dev` in `server/` fails with `EADDRINUSE`, but only on some laptops, not others. Fix: either free the port or change `PORT` in `.env`, matching it in `VITE_API_URL` too.',
            '**A file import that differs only in case** (e.g. `require(\'./routes/Notices\')` vs the real file `notices.js`) works fine on Windows and macOS, whose filesystems are case-insensitive, then breaks the instant a Linux teammate or a CI runner clones the exact same repo. Fix: match import paths to file names exactly, and never rely on your OS\'s case-insensitivity as a safety net.',
          ],
          tryIt:
            'Clone Kundapura Notice Board on your own machine, create your own free MongoDB Atlas cluster, get both dev servers running in two terminals, and post one real notice (title, message, category, and your own name as `postedBy`). Confirm it appears both in the browser UI and via `curl http://localhost:5000/api/notices`.',
          takeaway:
            'Running a MERN app "the old way" means separately matching Node versions, remembering two `.env` files, and keeping two terminals alive on every machine it touches — that fragile, multi-step ritual is exactly the "works on my machine" problem Docker exists to remove.',
        },
        {
          id: 'm0-t2',
          title: 'What is a container, really? Containers vs Virtual Machines',
          explain:
            'Understand what a container actually is under the hood — an isolated process sharing the host machine\'s own kernel via Linux **namespaces** and **cgroups** — and how that is fundamentally different from a **Virtual Machine**, which boots an entire separate guest operating system on top of a hypervisor.',
          analogy:
            'Kundapura\'s small harbour handles real shipping containers every week: standard steel boxes, all the same size, stacked directly onto the deck of one ship that everyone shares. Loading ten different containers of cargo onto that one ship costs almost nothing extra — same hull, same engine, same crew, just more boxes stacked on deck. Now imagine instead building an entirely separate ship — its own hull, its own engine, its own crew — just to move one single container of cargo, and doing that again for the next container, and the next. That second option is absurd for cargo, and it is exactly what a **Virtual Machine** does for software: a whole separate "ship" (guest operating system, booted via a hypervisor) for every single workload. A Docker **container** is the first option — many isolated boxes, stacked on one shared ship: the host\'s own kernel.',
          theory:
            'A **Virtual Machine** works by running a **hypervisor** (like VMware, Hyper-V, or VirtualBox) that emulates entire virtual hardware — a virtual CPU, virtual disk, virtual network card — and then boots a **complete, separate guest operating system** on top of that virtual hardware, kernel and all. If you ran the Kundapura Notice Board `server` inside a VM, that VM would need its own full Linux install (kernel, init system, package manager, libraries) just to eventually run one Node process. Booting a full OS takes real time — tens of seconds to a couple of minutes — and reserves real memory and disk for the guest OS alone, before your actual application even starts.\n\nA **container** takes a completely different approach: it does **not** boot a second kernel at all. Instead, it is an ordinary process on your existing host, made to *feel* isolated using two Linux kernel features:\n- **Namespaces** give a process its own private view of things that are normally global — its own process ID numbering, its own filesystem mount points, its own network interfaces, its own hostname — so it looks and behaves like it is alone on the machine, even though the real kernel underneath is shared with every other container.\n- **cgroups** (control groups) *limit and account for* what a process can use — how much CPU time, how much memory — so one container cannot silently starve every other container on the same host.\n\nBecause a container is "just a regular process with a disguise," starting one is as fast as starting any other program — typically well under a second — since there is no second kernel to boot, no virtual hardware to initialize.\n\nOne more distinction to hold onto now: an **image** is the packaged, read-only blueprint (filesystem + metadata) sitting on disk, unused until something runs it. A **container** is a live, running instance of that image, with its own writable layer on top. Many containers can be started from the exact same image simultaneously — just as many identical steel shipping containers can be stamped from the same blueprint.',
          whyItMatters:
            'Every Docker concept for the rest of this course — images, volumes, networks, `docker-compose.yml` — is built on top of this one idea: many isolated processes safely sharing one host kernel. When Module 1 has you write your very first `Dockerfile` for the `server`, you are building an **image**; every time you `docker run` it, you get a fresh, isolated **container** — understanding that distinction now prevents confusion for the rest of the course.',
          steps: [
            'Write down, in your own words, what a hypervisor does and what a full guest OS boot involves for a Virtual Machine.',
            'Write down, in your own words, what a Linux namespace provides (isolation/visibility) versus what a cgroup provides (limits/accounting) — they solve two different problems.',
            'Compare disk footprint: a full guest OS (gigabytes) versus a slim container image built on top of an already-running kernel (megabytes).',
            'Compare startup time: a VM\'s boot sequence (BIOS/bootloader/kernel/init) versus a container simply starting a process on an already-running kernel.',
            'Explain, out loud or in a notes file, the difference between an **image** (the blueprint on disk) and a **container** (a live running instance of it).',
            'Identify one reason containers trade away some isolation strength compared to VMs (a shared kernel) in exchange for their speed and density.',
          ],
          code: `# Illustrative comparison — NOT something you run yet (Docker isn't installed
# until the next topic), but here is the shape of the difference you are about
# to feel firsthand once both exist side by side on your machine.

## Virtual Machine (e.g. a full VM booted just to host the "server" folder)
Boot time:        30-90 seconds  (BIOS -> bootloader -> full Linux kernel -> init -> your app)
Disk footprint:    2-10+ GB       (a full guest OS: kernel, systemd, package manager, libraries...)
Memory overhead:   512 MB-2 GB+  reserved for the guest OS alone, before Node even starts
Isolation:         strong — separate kernel entirely, hardware-virtualized

## Container (e.g. a container running that same "server" folder)
Boot time:        well under 1 second  (the host's already-running kernel just starts your process)
Disk footprint:    tens of MB           on top of a slim base image
Memory overhead:   only what the Node process itself needs — no second kernel to boot
Isolation:         process-level — namespaces + cgroups on the SAME shared kernel

# Once Docker is installed (next topic), you can prove the "shared kernel" part
# yourself with one command:
docker run --rm alpine uname -r
# -> 5.15.153.1-microsoft-standard-WSL2   (the HOST kernel version — the container has no kernel of its own)`,
          pitfalls: [
            '**Thinking a container is just "a tiny, faster VM."** It is not a smaller virtual machine at all — it is an ordinary host process wearing a namespace/cgroup disguise, with zero separate kernel involved. Fix: describe it to yourself as "an isolated process," never as "a mini VM."',
            '**Assuming containers behave identically and with zero overhead on Windows and macOS as they do on Linux.** Neither Windows nor macOS has a Linux kernel to share directly, so Docker Desktop quietly runs one small Linux VM underneath everything (covered fully in the next topic). Fix: understand that "shared kernel" specifically means shared with a Linux kernel, real or VM-provided.',
            '**Treating "image" and "container" as interchangeable words.** Saying "I deleted the mongo image" when you actually mean "I removed a running mongo container" causes real confusion once multiple images and containers coexist. Fix: image = blueprint on disk; container = a live running (or stopped) instance of it.',
            '**Overestimating container isolation as equivalent to VM-grade security.** Because containers share one kernel, a kernel-level vulnerability can, in principle, affect every container on that host — a VM\'s separate kernel is a stronger isolation boundary. Fix: treat container isolation as *process* isolation, valuable but not identical to hardware-level VM isolation.',
            '**Believing you need one full VM per app "to be safe."** In practice, many containers safely and efficiently share one host precisely because they do not each need their own kernel. Fix: default to containers for app-level workloads like the Notice Board\'s server and database; reach for full VMs only when you specifically need a different kernel or stronger isolation.',
            '**Mixing up namespaces and cgroups as if they were the same mechanism.** Namespaces control what a process can *see*; cgroups control what it can *use*. Fix: keep the two separate in your head — "visibility" versus "limits."',
          ],
          tryIt:
            'Without touching Docker yet, sketch (on paper or in a notes file) what would happen if you tried to run three copies of the Kundapura Notice Board `server` at once as (a) three separate full VMs, versus (b) three containers on the same laptop. Which one exhausts your laptop\'s RAM first, and why — tie your answer explicitly to "three separate guest kernels booting" versus "one shared kernel, three isolated processes."',
          takeaway:
            'A container is an isolated process sharing the host\'s own kernel via namespaces and cgroups, while a Virtual Machine boots a whole separate guest OS on a hypervisor — that one difference is why containers start in well under a second and cost almost nothing extra to stack side by side.',
        },
        {
          id: 'm0-t3',
          title: 'Install Docker Desktop (or Docker Engine on Linux) and verify with `docker run hello-world`',
          explain:
            'Install the right Docker tooling for your operating system — Docker Desktop with the WSL2 backend on Windows, Docker Desktop on macOS, or Docker Engine directly on Linux — then prove the whole thing is genuinely alive by pulling and running the tiny official `hello-world` image.',
          analogy:
            'Think of a brand-new private bus stand being built along the Kundapura-Kota road: before the very first real passenger route ever launches, the depot manager runs one empty test bus around the yard loop — no passengers, no real route, no ticket sold — purely to prove the fuel line, the engine bay, and the gate sensor are all correctly wired up. `docker run hello-world` is that empty test bus: Docker downloads a tiny image and runs it for the sole purpose of proving the whole engine underneath — the Docker daemon — is correctly installed and listening on your machine, before you trust it with anything real.',
          theory:
            'Containers share the **host\'s own kernel**, which means the host needs a real Linux kernel to share in the first place. Linux already has one, so **Docker Engine** on Linux talks to your actual kernel directly — nothing extra to boot, the lightest and fastest of the three setups. Windows and macOS do **not** have a Linux kernel natively, so **Docker Desktop** quietly solves this by running one small, dedicated Linux virtual machine in the background and sharing *that* kernel with every container you start. On Windows this hidden VM is provided by **WSL2** (Windows Subsystem for Linux 2) — a genuinely lightweight, fast-booting Linux environment integrated into Windows itself. On macOS it is a small VM using Apple\'s own Virtualization framework. Either way, once installed, you type ordinary `docker` commands from your normal terminal and never have to think about that hidden VM again — it is invisible day-to-day.\n\nInstallation, by OS:\n- **Windows**: first enable WSL2 (`wsl --install` from an elevated PowerShell, one-time, may require a reboot), then install Docker Desktop and keep **"Use the WSL 2 based engine"** checked during setup.\n- **macOS**: download `Docker.dmg` from `docker.com`, drag `Docker.app` into Applications, and launch it — the installer automatically detects Apple Silicon versus Intel.\n- **Linux**: no Docker Desktop needed at all — install **Docker Engine** directly (e.g. via the official convenience script or your distro\'s package manager), then add your user to the `docker` group so you do not need `sudo` on every command.\n\nAfter installing, the Docker **daemon** (the background service that actually does the work) must be running before any `docker` command succeeds — on Windows/macOS this means Docker Desktop\'s whale icon shows "Docker Desktop is running"; on Linux, `sudo systemctl status docker` should show `active (running)`.\n\nOnly then does `docker run hello-world` mean something: the CLI asks the daemon for an image named `hello-world`, the daemon checks its local cache, finds nothing, **pulls** the tiny image from Docker Hub, then creates and starts a container from it. That container\'s entire job is to print a friendly confirmation message and exit — proof, end to end, that install, daemon, and network pull all work together correctly.',
          whyItMatters:
            'Nothing else in this entire course works until the Docker daemon is genuinely running on your machine — every remaining topic assumes `docker` commands just work. `hello-world` is the simplest, fastest possible proof of that, and is worth running today even before you have any real use for it.',
          steps: [
            'Windows only: enable WSL2 first with `wsl --install` (elevated PowerShell), reboot if prompted.',
            'Download the correct Docker installer for your OS from `docker.com` (Docker Desktop for Windows/macOS, or the Docker Engine install script for Linux).',
            'Install it, keeping the WSL2 backend option checked on Windows.',
            'Confirm the daemon is actually running: Docker Desktop\'s whale icon on Windows/macOS, or `sudo systemctl status docker` on Linux.',
            'On Linux only: run `sudo usermod -aG docker $USER`, then fully log out and back in.',
            'In a fresh terminal, run `docker --version` and then `docker run hello-world`, and read every line of the output.',
          ],
          code: `# Windows 10/11 (Docker Desktop with WSL2 backend) -------------------------
# 1. From an elevated PowerShell, one-time:
wsl --install
# (reboot if prompted)
# 2. Download and run "Docker Desktop Installer.exe" from docker.com
#    -> keep "Use WSL 2 instead of Hyper-V" checked during setup

# macOS ----------------------------------------------------------------------
# Download "Docker.dmg" from docker.com, drag Docker.app into Applications, launch it.
# (Apple Silicon and Intel each get their own build — the installer detects which you need.)

# Linux (Ubuntu/Debian) — no Docker Desktop needed, install Docker Engine directly:
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # so you don't need "sudo docker" on every command
# log all the way out and back in for the group change to take effect

# Verify on ANY of the above, in a fresh terminal:
docker --version
# -> Docker version 26.1.4, build 5650f9b

docker run hello-world
# Unable to find image 'hello-world:latest' locally
# latest: Pulling from library/hello-world
# c1ec31eb5944: Pull complete
# Digest: sha256:9f6ad537c5132bcce4d81...
# Status: Downloaded newer image for hello-world:latest
#
# Hello from Docker!
# This message shows that your installation appears to be working correctly.
#
# To generate this message, Docker took the following steps:
#  1. The Docker client contacted the Docker daemon.
#  2. The Docker daemon pulled the "hello-world" image from Docker Hub.
#  3. The Docker daemon created a new container from that image which runs
#     the executable that produces the output you are currently reading.
#  4. The Docker daemon streamed that output to the Docker client.`,
          pitfalls: [
            '**Installing Docker Desktop but never actually launching it.** Every command fails with "Cannot connect to the Docker daemon" because the whale is not running yet. Fix: open Docker Desktop and wait for its "running" status before touching the CLI.',
            '**On Windows, skipping WSL2 setup or running an outdated WSL kernel.** The installer either fails outright or silently falls back to the older, slower Hyper-V backend. Fix: run `wsl --install` (or `wsl --update` if already installed) before installing Docker Desktop.',
            '**On Linux, forgetting `sudo usermod -aG docker $USER`.** Every single `docker` command then needs `sudo` in front of it, forever. Fix: add your user to the `docker` group once, then fully log out and back in (not just close the terminal tab).',
            '**A corporate proxy or firewall silently blocking Docker Hub.** `docker run hello-world` hangs indefinitely or times out trying to pull the image, with no obvious error explaining why. Fix: configure Docker Desktop\'s proxy settings, or ask your network admin to allowlist Docker Hub\'s registry endpoints.',
            '**Running a very old, long-unpatched Docker version.** Confusing, unrelated errors show up later that have nothing to do with your actual commands. Fix: update to the latest stable Docker Desktop/Engine release before starting the course.',
            '**On Linux, checking the group change worked without actually starting a new login session.** `usermod` does not retroactively affect your currently open terminal. Fix: log out and back in (or reboot) — do not just open a new terminal tab in the same session.',
          ],
          tryIt:
            'Run `docker --version` and then `docker run hello-world` in a fresh terminal. Paste the full output into a notes file and annotate, line by line, which part means "the CLI talked to the daemon," which part means "the image was pulled," and which part means "a container actually ran."',
          takeaway:
            'Docker Desktop (Windows/macOS) quietly runs a small Linux VM so your containers have a real Linux kernel to share, while Docker Engine on Linux talks to your actual kernel directly — either way, `docker run hello-world` is the fastest way to prove the whole engine is genuinely alive.',
        },
        {
          id: 'm0-t4',
          title: 'Docker CLI basics: `docker pull`, `docker run`, `docker ps`, `docker stop`, `docker rm`, `docker images`, `docker rmi`',
          explain:
            'Learn the seven core Docker CLI lifecycle commands — `docker pull` (download an image), `docker run` (create and start a container from it), `docker ps` (list running containers), `docker stop`/`docker rm` (halt, then delete a container), and `docker images`/`docker rmi` (list, then delete downloaded images) — using small, generic images before touching anything specific to Kundapura Notice Board.',
          analogy:
            'At the seva booking counter of a Kundapura temple, there is a shelf of printed seva instruction cards — one card per type of seva (Maha Pooja, Ashtottara, Rangapooja) — sitting there whether or not anyone is performing that seva right now. Booking one ahead of the queue is like pulling a card off that shelf into your hand (`docker pull`); actually stepping up and having the priest perform it for you, live, right now, is starting a real instance of it (`docker run`). The clerk\'s clipboard listing every seva currently underway at this exact moment is `docker ps`. When yours finishes, the clerk first marks it done on the clipboard (`docker stop`) and only later, during cleanup, actually clears away the used flowers and plate (`docker rm`) — two separate steps, not one. And the shelf of instruction cards itself, independent of any live seva, is what `docker images` lists — retiring a card for a seva the temple no longer offers is `docker rmi`.',
          theory:
            'Seven commands cover the entire day-to-day container lifecycle:\n- **`docker pull <image>[:tag]`** downloads an image\'s layers from a registry (Docker Hub by default) onto your machine, without running anything. Nothing starts — it just sits on disk afterward.\n- **`docker run <image>`** is `pull`-if-missing **plus** creating a new container from that image **plus** starting it. Common flags you will use constantly: `-d` (detached — run in the background, hand your terminal straight back), `--name <name>` (give it a memorable name instead of a random one), `-p <host>:<container>` (map a port so you can reach it — covered in depth over the next two topics), and `-it` (interactive + a pseudo-terminal, for a shell you can type into).\n- **`docker ps`** lists only **running** containers. Add `-a` to also see every container that has ever stopped or exited on this machine (the full lifecycle deep-dive comes two topics from now).\n- **`docker stop <container>`** sends a graceful shutdown signal to a running container. It still exists afterward — it just is not running any more.\n- **`docker rm <container>`** permanently deletes a stopped container\'s writable layer. You generally cannot remove a container that is still running without forcing it.\n- **`docker images`** lists every image currently cached on your machine, with its repository name, tag, image ID, and disk size.\n- **`docker rmi <image>`** deletes a local image to reclaim disk space — but only if no container, running or stopped, still references it.\n\nYou can refer to a specific container or image by its full ID, a short unique ID prefix, or (for containers) its `--name`. Images and stopped containers both silently pile up disk space during normal experimentation, so `docker ps -a` and `docker images` are worth checking periodically, not just when something breaks.',
          whyItMatters:
            'These seven commands are the muscle memory you will lean on every single day for the rest of this course, and in real Docker work long after it. Getting comfortable with the pull-run-ps-stop-rm loop now, on tiny throwaway images, means volumes, networks, and Compose later on read as extensions of a habit you already have — not brand-new syntax on top of brand-new concepts.',
          steps: [
            'Run `docker pull alpine` and confirm it downloads without starting anything.',
            'Run `docker run -it alpine sh`, type a command inside the shell, then `exit`.',
            'Run `docker ps` (should be empty) and then `docker ps -a` (should show the alpine container as Exited).',
            'Remove that stopped container with `docker rm <container-id-or-name>`.',
            'Start a longer-running container with `docker run -d --name test-sleep alpine sleep 300`, confirm it in `docker ps`, then `docker stop test-sleep`.',
            'Run `docker images` to see every image on disk, then `docker rmi hello-world` (or another unused image) to remove one.',
          ],
          code: `# Pull an image explicitly, without running it yet:
docker pull alpine
# latest: Pulling from library/alpine
# ... Status: Downloaded newer image for alpine:latest

# Run a container from it, interactively:
docker run -it alpine sh
/ # echo "hello from inside a container"
hello from inside a container
/ # exit

# Only RUNNING containers show here — none, since we just exited:
docker ps
# CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES

# ALL containers, including stopped/exited ones:
docker ps -a
# CONTAINER ID   IMAGE     COMMAND   STATUS                     NAMES
# 7e2a1c9f3b2d   alpine    "sh"      Exited (0) 12 seconds ago  cranky_almeida

# Remove that stopped container by ID (a short prefix is enough):
docker rm 7e2a1c9f3b2d

# Start a longer-running one, named for clarity, in the background:
docker run -d --name test-sleep alpine sleep 300
docker ps
# CONTAINER ID   IMAGE     COMMAND      STATUS         NAMES
# 4f8c2e1a9d3b   alpine    "sleep 300"  Up 3 seconds   test-sleep

# Stop it gracefully (it still exists afterward):
docker stop test-sleep
docker ps -a
# 4f8c2e1a9d3b   alpine   "sleep 300"   Exited (137) 2 seconds ago   test-sleep
docker rm test-sleep

# List every image sitting on disk:
docker images
# REPOSITORY    TAG      IMAGE ID       CREATED         SIZE
# alpine        latest   c1aabb1234ef   2 weeks ago     7.8MB
# hello-world   latest   d2c94ecfa8f2   14 months ago   13.3kB

# Remove an image you no longer need (frees disk space):
docker rmi hello-world`,
          pitfalls: [
            '**Confusing `docker stop` with `docker rm`, believing "stop" deletes the container.** It does not — the container still exists and still shows up in `docker ps -a` until you explicitly remove it. Fix: think of `stop` as pausing, `rm` as permanently deleting.',
            '**Trying to `docker rm` a still-running container.** Docker refuses with an error like "you cannot remove a running container." Fix: `docker stop` it first, or add `-f` to force-remove (which stops it first anyway).',
            '**Reusing a `--name` that a stopped-but-not-removed container already holds.** `docker run --name test-sleep ...` fails with "the container name ... is already in use." Fix: `docker rm` the old one first, or check `docker ps -a` before reusing a name.',
            '**Trying to `docker rmi` an image that a stopped container still references.** Docker refuses with "image is being used by stopped container ...". Fix: remove the container first, then the image.',
            '**Assuming `latest` always means "the newest, safest version."** It is just a conventional tag name that maintainers attach to *some* build — not a guarantee of recency or stability. Fix: for anything beyond the quickest throwaway test, pin an explicit version tag (covered next topic).',
            '**Letting stopped containers and unused images silently pile up over a week of experimenting.** Disk usage creeps up with no obvious cause. Fix: periodically check `docker ps -a` and `docker images`, and clean up what you no longer need.',
          ],
          tryIt:
            'Pull `alpine`, run it interactively, echo something inside, exit, and confirm it shows in `docker ps -a` but not `docker ps`. Remove it. Then run `docker run -d --name test-sleep alpine sleep 60`, confirm it is running with `docker ps`, stop it partway through, confirm its Exited status with `docker ps -a`, and finally remove it with `docker rm`.',
          takeaway:
            '`docker pull` gets an image, `docker run` starts a container from it, `docker ps`/`docker ps -a` show what is running versus what has ever run, and `docker stop` (pause) is a distinct step from `docker rm` (permanently delete) — the same seven-command loop you will use every day for the rest of this course.',
        },
      ],
    },
    {
      id: 'm0-s2',
      title: 'Exploring Docker Hub',
      topics: [
        {
          id: 'm0-t5',
          title: 'Docker Hub & official images — run MongoDB and nginx containers from Docker Hub without writing a Dockerfile',
          explain:
            'Pull and run two genuinely production-grade pieces of software — **MongoDB** and **nginx** — straight from **Docker Hub** with a single `docker run` command each, no `Dockerfile`, no manual installation, and understand what an "official image" and an image **tag** actually mean.',
          analogy:
            'Inside a Kundapura temple\'s own kitchen, the prasadam handed out at the counter is prepared under the temple\'s direct supervision — the ingredients, the process, and the hands involved are all known and trusted. Outside the gate, an unlicensed vendor\'s cart might sell something that *looks* similar, but nobody vouches for what actually went into it. A Docker Hub **official image** is the temple\'s own kitchen: maintained, security-patched, and vetted by Docker and the software\'s own maintainers. A random unofficial upload is that cart outside the gate — it might be perfectly fine, or it might not be, and you have no real way to know without digging. And asking for "whatever prasadam is on the counter right now" (`latest`) can hand you something different from one visit to the next, while asking specifically for "today\'s Ekadashi batch" (`mongo:7`) gets you the exact same thing every time.',
          theory:
            '**Docker Hub** (`hub.docker.com`) is the default public registry Docker pulls from unless you tell it otherwise. Searching it, you will notice some images carry a **"Docker Official Image"** badge — these are curated, actively maintained (by Docker\'s own team working with the software\'s maintainers), and rebuilt regularly to pick up security patches, unlike an arbitrary personal upload from an unknown account. Preferring official images matters most for anything you will actually expose to a network, like a database.\n\nAn image name is really `repository:tag`. The **tag** pins a specific build. `mongo:7` always gets you MongoDB\'s 7.x line; `mongo:latest` floats to whatever the maintainers currently label "latest" — which can silently jump to a new major version on a later pull and break compatibility with nothing in your control changing. For anything beyond a five-minute throwaway experiment, pin an explicit tag.\n\nRunning real software from Docker Hub needs no installation step at all beyond `docker run`:\n```\ndocker run -d --name kundapura-mongo-test -p 27017:27017 mongo:7\ndocker run -d --name kundapura-nginx-test -p 8080:80 nginx\n```\n`-d` detaches so the container runs in the background and your terminal is returned immediately. `-p <host-port>:<container-port>` maps a port on your own laptop to the port the process listens on *inside* the container, which is what makes it reachable from your browser or `curl` at all — without it, the container runs perfectly well but is completely unreachable from outside.\n\nOne honest caveat worth holding onto: exposing MongoDB\'s port `27017` directly to your host like this, with no authentication configured, is fine for this local throwaway proof but is not how the real Kundapura Notice Board will run its database. Once the app gets its own Docker network (a few modules from now), `mongo` will live *on* that private network, reachable only by the `server` container that actually needs it — never exposed to the outside world at all.',
          whyItMatters:
            'This is the payoff moment for everything felt in the first topic: MongoDB is genuinely fiddly to install and configure by hand, yet becomes one command via Docker Hub. This is exactly how the real Kundapura Notice Board database will run from a few modules onward — you are previewing production behaviour today, on throwaway test containers, with zero risk.',
          steps: [
            'Run `docker run -d --name kundapura-mongo-test -p 27017:27017 mongo:7` and confirm it in `docker ps`.',
            'Run `docker run -d --name kundapura-nginx-test -p 8080:80 nginx` and confirm it too.',
            'Open `http://localhost:8080` in a browser and confirm nginx\'s default welcome page loads.',
            'Run `docker pull mongo:7` and separately `docker pull mongo:latest`, then compare both in `docker images`.',
            'Search Docker Hub\'s website for "mongo" and identify which listing carries the "Docker Official Image" badge.',
            'Note both container names and their exact port mappings for use in the next topic.',
          ],
          code: `# Official MongoDB image, mapped to the default Mongo port:
docker run -d --name kundapura-mongo-test -p 27017:27017 mongo:7
# Unable to find image 'mongo:7' locally
# 7: Pulling from library/mongo
# ... (several layers) ...
# Status: Downloaded newer image for mongo:7
# a1b2c3d4e5f6789...

docker ps
# CONTAINER ID   IMAGE     COMMAND                  STATUS         PORTS                      NAMES
# a1b2c3d4e5f6   mongo:7   "docker-entrypoint.s…"   Up 4 seconds   0.0.0.0:27017->27017/tcp   kundapura-mongo-test

# Official nginx image, mapped to host port 8080:
docker run -d --name kundapura-nginx-test -p 8080:80 nginx
docker ps
# ... second row ...
# f9e8d7c6b5a4   nginx     "/docker-entrypoint.…"  Up 2 seconds   0.0.0.0:8080->80/tcp      kundapura-nginx-test

# Visit http://localhost:8080 in a browser -> nginx's default "Welcome to nginx!" page

# mongo:7 vs mongo:latest — compare pinned versus floating tags:
docker pull mongo:7
docker pull mongo:latest
docker images
# REPOSITORY   TAG      IMAGE ID       SIZE
# mongo        7        f3a9c8e21d0a   700MB
# mongo        latest   f3a9c8e21d0a   700MB
# (today "latest" happens to point at the same build as "7" — that is NOT guaranteed to stay true)`,
          pitfalls: [
            '**Assuming every image on Docker Hub is equally trustworthy.** Anyone can publish an image; only some carry the "Docker Official Image" or "Verified Publisher" badge. Fix: prefer badged images, especially for anything you will expose to a network, like a database.',
            '**Using `latest` in anything beyond a five-minute local experiment.** The exact version it resolves to can silently change on a later pull, breaking compatibility for reasons that look unrelated to your own changes. Fix: pin an explicit version tag like `mongo:7` for anything that matters.',
            '**Forgetting the `-p` flag entirely.** The container runs perfectly fine but is completely unreachable from your browser or `curl` — no error, just silence. Fix: always map a host port to the container\'s listening port when you need to reach it from outside.',
            '**Reusing the same host port for two different containers** (e.g. both wanting `8080`). Docker refuses with "port is already allocated." Fix: pick a different host port, e.g. `-p 8081:80`, or stop the container already using it.',
            '**Leaving throwaway test containers running and forgetting about them.** `kundapura-mongo-test` and `kundapura-nginx-test` quietly consume RAM and hold onto ports days later. Fix: stop and remove them once you have confirmed they work (the very next topic covers exactly this).',
            '**Getting comfortable exposing MongoDB\'s port directly with no authentication, out of habit from this exercise.** Fine for a local throwaway test, genuinely risky anywhere else. Fix: treat this as a local-only proof-of-concept; production Mongo needs authentication and network isolation, both covered from the module that introduces Docker networks onward.',
          ],
          tryIt:
            'Run `mongo:7` mapped to port `27017` and `nginx` mapped to port `8080`, confirm both appear correctly in `docker ps` with the right port mappings, visit `localhost:8080` in a browser to see nginx\'s welcome page, then compare `docker pull mongo:7` against `docker pull mongo:latest` side by side in `docker images`.',
          takeaway:
            'Docker Hub lets you run production-grade software like MongoDB and nginx with one `docker run` command and no manual installation — but always prefer official images, and pin explicit tags instead of drifting on `latest`.',
        },
        {
          id: 'm0-t6',
          title: 'Container lifecycle & interactive shells: `docker exec -it`, `docker logs`, foreground vs detached (`-d`), stopping vs removing',
          explain:
            'Go one level deeper on the containers you just started: peek inside a running container with `docker exec -it`, watch its output with `docker logs`, understand foreground versus detached (`-d`) execution, and lock in the crucial distinction between a **stopped** container (still exists) and a **removed** one (gone for good).',
          analogy:
            'A ferry docked for the night at the **Gangolli** crossing, engine switched off, is still physically tied up at the jetty — ready to be started again tomorrow morning with no rebuilding required. That is a **stopped** container: still listed, still holding its data, just not currently running. A ferry that has been decommissioned and towed away for scrap is gone entirely, for good — that is a **removed** container. Boarding a ferry that is mid-crossing right now, to check the engine room without interrupting the crossing itself, is exactly what `docker exec -it` does: a new, separate activity happening inside an already-running container, alongside its main job. Reading the ferry\'s logged departure and arrival times afterward, without ever boarding it, is `docker logs`.',
          theory:
            '`docker run` in the **foreground** (no `-d`) attaches your terminal directly to the container\'s main process — its output streams live into your terminal, and `Ctrl+C` stops it. `docker run -d` (**detached**) starts the container in the background and immediately hands your terminal back, while the container keeps running independent of that terminal window — this is how you started `kundapura-mongo-test` and `kundapura-nginx-test` in the previous topic, and is how you will run almost everything from here on.\n\n**`docker logs <container>`** prints everything that container has written to stdout/stderr since it started — a read-only history, not a live connection. Add `-f` to **follow** it, streaming new lines as they happen, much like `tail -f` on a log file.\n\n**`docker exec -it <container> <command>`** is different from `docker run`: it starts a **brand-new process inside an already-running container**\'s namespaces, completely separate from that container\'s main process (which keeps running untouched). This is how you poke around inside a live container to debug or inspect it — for example, `docker exec -it kundapura-mongo-test mongosh` opens an interactive Mongo shell inside the running Mongo container, or `docker exec -it kundapura-nginx-test sh` gets you a plain shell inside nginx\'s container to read its config file. Crucially, `exec` only works on a container that is **already running** — there is no process namespace to join if it is stopped.\n\nNow the distinction this topic centres on: **`docker stop`** sends a graceful shutdown signal to the running process; the container itself, its written filesystem layer, and its ID all continue to exist afterward — it simply moves from "Up" to "Exited" in `docker ps -a`, and can be resumed later with **`docker start`** (same container, same ID, same data, no reinstalling anything). **`docker rm`** is the separate, permanent step: it deletes that stopped container\'s writable layer entirely. Anything written *inside* the container itself — like a test document typed into `mongosh` — is gone forever the moment you `rm` it, because right now nothing outside the container is keeping that data safe. (A proper fix for that — named volumes — arrives a few modules from now; for now, treat a container\'s own filesystem as fully disposable.)',
          whyItMatters:
            '`docker exec` and `docker logs` are the two commands you will reach for constantly to debug every container in every remaining module of this course. And understanding "stopped still exists, removed does not" now — before any real data lives inside a container — prevents a nasty surprise later: accidentally `rm`-ing a container and permanently losing everything typed into it, before volumes exist to protect that data properly.',
          steps: [
            'With `kundapura-mongo-test` still running, open an interactive Mongo shell inside it with `docker exec -it kundapura-mongo-test mongosh` and run `show dbs`.',
            'With `kundapura-nginx-test` still running, open a plain shell inside it with `docker exec -it kundapura-nginx-test sh` and read its default config file.',
            'Refresh `http://localhost:8080` a few times in your browser, then run `docker logs kundapura-nginx-test` and confirm new request lines appear.',
            'Run `docker stop kundapura-mongo-test`, confirm it disappears from `docker ps` but still appears (Exited) in `docker ps -a`.',
            'Run `docker start kundapura-mongo-test` and confirm the same container ID comes back up.',
            'Once satisfied, `docker stop` and `docker rm` both throwaway test containers for good, and confirm `docker ps -a` shows neither remaining.',
          ],
          code: `# Peek inside the RUNNING mongo container without stopping it:
docker exec -it kundapura-mongo-test mongosh
test> show dbs
admin   40.00 KiB
config  60.00 KiB
local   40.00 KiB
test> exit

# A plain shell inside the RUNNING nginx container:
docker exec -it kundapura-nginx-test sh
/ # cat /etc/nginx/conf.d/default.conf
# server {
#     listen       80;
#     server_name  localhost;
#     location / { root /usr/share/nginx/html; index index.html; }
# }
/ # exit

# Read what nginx has already printed (refresh localhost:8080 in a browser first):
docker logs kundapura-nginx-test
# 172.17.0.1 - - [22/Jul/2026:10:03:41 +0000] "GET / HTTP/1.1" 200 615 "-" "Mozilla/5.0..."
docker logs -f kundapura-nginx-test   # -f = follow, keeps streaming new lines live

# Stop a container — it still EXISTS, just is not running:
docker stop kundapura-mongo-test
docker ps           # kundapura-mongo-test no longer listed
docker ps -a         # still listed: STATUS "Exited (0) 4 seconds ago"

# Start the SAME container again — same ID, no reinstalling, no data loss:
docker start kundapura-mongo-test
docker ps           # kundapura-mongo-test is back, Up X seconds

# Only actually delete it, permanently, once you're truly done experimenting:
docker stop kundapura-mongo-test kundapura-nginx-test
docker rm kundapura-mongo-test kundapura-nginx-test
docker ps -a         # both gone for good`,
          pitfalls: [
            '**Trying `docker exec -it` on a container that is not running.** Docker refuses with something like "container is not running." Fix: check `docker ps` first and `docker start` it if needed.',
            '**Confusing `docker logs` (a read-only dump of what already happened) with an interactive connection.** Typing into the output of `docker logs` does nothing — there is no way to send input back through it. Fix: use `docker exec -it` whenever you actually need to interact with something inside the container.',
            '**Running a container in the foreground and closing the terminal window instead of `Ctrl+C`.** Depending on your terminal, the container may stop unexpectedly or behave inconsistently. Fix: use `-d` for anything you want to keep running independent of a specific terminal window.',
            '**Believing `docker rm` is reversible.** Any test data typed inside the container — like documents added via `mongosh` — is gone permanently the instant the container is removed, because nothing outside the container is protecting it yet. Fix: treat a plain container\'s own filesystem as fully disposable until named volumes are introduced.',
            '**Forgetting a container still exists because it is merely stopped, not removed.** Trying to `docker run --name kundapura-mongo-test ...` again days later fails with "the container name is already in use," which is confusing if you have forgotten it was only stopped. Fix: check `docker ps -a` for lingering stopped containers before reusing a name.',
            '**Exiting an interactive `docker exec -it ... sh` session in an unusual way that also disturbs the container\'s main process.** Some exit sequences inside certain shells can behave unexpectedly. Fix: exit normally (`exit` or Ctrl+D) and immediately confirm with `docker ps` that the main container is still up afterward.',
          ],
          tryIt:
            'Exec into the `mongo:7` test container with `mongosh` and run `show dbs`; exec into the `nginx` test container with `sh` and read its default config file; check `docker logs` on nginx after refreshing `localhost:8080` a few times and confirm new lines appear; stop and start the mongo container once to prove the same container and its data persist across a stop; then finally remove both throwaway containers for good and confirm with `docker ps -a` that neither remains.',
          takeaway:
            '`docker exec -it` opens an interactive session inside an already-running container, `docker logs` reads what it has already printed, and a **stopped** container (still listed in `docker ps -a`, still holding its data) is very different from a **removed** one (gone permanently) — always know which one you are about to do.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm0-p1',
      type: 'Mini Project',
      title: 'Dev Environment Sanity Check',
      domain: 'Tooling',
      duration: '2-3 hrs',
      description:
        'Set up Kundapura Notice Board the old way — without Docker — documenting the exact pain points as they happen: matching the pinned Node version, wiring up MongoDB Atlas by hand, and juggling two live terminals. Then, completely separately, pull and run `hello-world`, `mongo`, and `nginx` as standalone containers to prove Docker itself genuinely works on your machine, logging every container\'s ID and state with `docker ps -a`. This project produces both halves of the evidence this module is built to surface: the disease (the old way, fully felt) and proof the cure is installed and working (Docker itself, standalone).',
      tools: ['Node.js 20 LTS', 'npm', 'MongoDB Atlas (free tier)', 'Docker Desktop / Docker Engine', 'Docker Hub'],
      blueprint: {
        overview:
          'This project has two deliberately separate halves that must not touch each other. Half one: get Kundapura Notice Board\'s `server` and `client` running locally with no Docker involved at all, and write down every real pain point you hit along the way — the exact error text, not a paraphrase. Half two: with zero relation to the app\'s code, prove Docker itself is correctly installed by pulling and running three standalone containers from Docker Hub, then documenting their IDs and states. Keeping the two halves separate matters: it is what lets you honestly compare "the old way" against "the Docker way" side by side once Module 1 starts containerizing the server for real.',
        functionalRequirements: [
          'Clone Kundapura Notice Board, install the exact Node version pinned in `server/package.json`, run `npm install` separately in `server/` and `client/`, connect to your own free-tier MongoDB Atlas cluster via `.env` files, run both dev servers in two terminals, and post one real test notice through the UI, confirmed via `curl http://localhost:5000/api/notices`.',
          'Write a plain-text or Markdown "pain-log" file documenting every pitfall you personally hit while doing the above — the exact error text (Node version mismatch, Atlas IP allowlist rejection, port conflicts, or anything else), not a general summary.',
          'Separately, with no relation to the app\'s own code or folders, pull and run `hello-world`, `mongo:7`, and `nginx` as three standalone containers, each with a descriptive `--name`.',
          'Prove all three containers\' exact states using `docker ps -a`, capturing container ID, name, image, and status (Up/Exited) into the same pain-log file.',
          'Clean up: stop and remove all three throwaway containers, and confirm with a final `docker ps -a` that none remain, without touching any Kundapura Notice Board files.',
        ],
        technicalImplementation: [
          'Use `nvm` (or your OS\'s equivalent version manager) to install and switch to the exact Node version pinned in `server/package.json`\'s `engines` field before running any `npm install`.',
          'Create `server/.env` with `MONGO_URI` (your own Atlas connection string), `PORT=5000`, `NODE_ENV=development`, and `client/.env` with `VITE_API_URL`, matching exactly what `client/src/api.js` reads via `import.meta.env`.',
          'Run the server\'s dev script and the client\'s dev script in two separate terminal windows or tabs, confirming "Mongo connected" and "Server listening on port 5000" in one, and Vite\'s local URL in the other, before opening the browser.',
          'Use `docker run --name <descriptive-name> ...` for each of the three standalone containers so they are identifiable by name in `docker ps -a`, rather than relying on Docker\'s randomly generated names.',
          'Copy-paste real terminal output (not screenshots, not paraphrases) into the pain-log for both halves of the exercise — the exact error text is what makes "the old way" pain concrete and comparable once Docker takes over in Module 1.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Get Kundapura Notice Board running the old way',
            outcome: 'Both dev servers running in two terminals, connected to your own MongoDB Atlas free-tier cluster, with one real test notice posted and confirmed via `curl`.',
            prompt:
              'I have cloned the Kundapura Notice Board MERN repo (server/ + client/). Walk me through, step by step: checking server/package.json\'s engines field and installing that exact Node version, running npm install separately in server/ and client/, creating a free MongoDB Atlas cluster and whitelisting my IP, wiring up server/.env (MONGO_URI, PORT, NODE_ENV) and client/.env (VITE_API_URL), and starting both dev servers in two separate terminals. Show me the exact commands for my OS, and tell me exactly what successful output should look like in each terminal before I open the browser.',
          },
          {
            step: 2,
            label: 'Document every pain point you hit',
            outcome: 'A pain-log.md file listing every real error encountered, with exact error text, while completing step 1.',
            prompt:
              'I just went through setting up Kundapura Notice Board without Docker and hit some friction (describe your specific errors here — e.g. a Node version mismatch, an Atlas connection timeout, or a port already in use). Help me write these up clearly in a pain-log.md file: one entry per issue, each with the exact error message I saw, what caused it, and how I fixed it. Also ask me what my teammate\'s setup would look like on a different OS, and note which of my issues would likely resurface for them too.',
          },
          {
            step: 3,
            label: 'Run three standalone containers from Docker Hub',
            outcome: 'hello-world, mongo:7, and nginx running (or completed) as three independently named containers, all visible with correct states in docker ps -a.',
            prompt:
              'Completely separate from the Notice Board app itself, help me run three standalone containers to prove Docker works on my machine: docker run hello-world, docker run -d --name kundapura-mongo-test -p 27017:27017 mongo:7, and docker run -d --name kundapura-nginx-test -p 8080:80 nginx. Show me the exact commands, then show me the docker ps -a output I should expect, explaining what each column (CONTAINER ID, IMAGE, STATUS, NAMES) means for each of the three.',
          },
          {
            step: 4,
            label: 'Clean up and compare the two halves',
            outcome: 'All three test containers stopped and removed, confirmed empty with a final docker ps -a, and a short written comparison of "the old way" versus "the Docker way" that sets up Module 1.',
            prompt:
              'Help me stop and remove all three test containers (kundapura-mongo-test, kundapura-nginx-test, and the hello-world container) and confirm with docker ps -a that none remain. Then, using my pain-log.md from step 2, help me write a short "old way vs Docker way" comparison paragraph: for each pain point I hit setting up Kundapura Notice Board manually, what would a Dockerized version of that same step look like instead? Keep this practical — it should directly set up why Module 1 has me write my first Dockerfile for the server.',
          },
        ],
        deliverable:
          'A `pain-log.md` file documenting every real error hit while running Kundapura Notice Board the old way (exact Node version, Atlas connection, two live terminals), alongside a `docker ps -a` capture proving `hello-world`, `mongo:7`, and `nginx` all ran successfully as standalone containers on your machine, followed by their clean removal. Together these prove two things at once: the manual setup genuinely is fragile and machine-dependent, and Docker itself is correctly installed and working, independent of the app entirely. Next module we stop running Node locally altogether and write our first `Dockerfile` for the `server` — turning everything painful in this project\'s first half into a single, repeatable `docker build` and `docker run`.',
      },
    },
  ],
  quiz: [
    {
      id: 'm0-q1',
      q: 'What is the core technical difference between a Docker container and a Virtual Machine?',
      options: [
        'A container is just a smaller, faster Virtual Machine with the same architecture',
        'A container is an isolated process sharing the host\'s own kernel via namespaces and cgroups, while a VM boots an entirely separate guest OS on a hypervisor',
        'A Virtual Machine has no isolation at all, while a container is fully isolated hardware',
        'There is no real difference — the terms are interchangeable',
      ],
      answer: 1,
    },
    {
      id: 'm0-q2',
      q: 'You are about to run MongoDB in a container for anything beyond a five-minute throwaway test. Why is `mongo:7` generally a safer choice than `mongo:latest`?',
      options: [
        '`mongo:7` downloads faster because it is a smaller image',
        '`latest` is not a real tag and will cause `docker pull` to fail',
        '`mongo:7` pins a specific version, while `latest` floats to whatever the maintainers currently label that way and can silently change to a different version on a later pull',
        '`mongo:latest` only works with `docker run`, not `docker pull`',
      ],
      answer: 2,
    },
    {
      id: 'm0-q3',
      q: 'What is the difference between `docker ps` and `docker ps -a`?',
      options: [
        '`docker ps` lists only running containers; `docker ps -a` lists all containers, including stopped/exited ones',
        '`docker ps -a` only shows containers that will run automatically on startup',
        'They are identical commands with different formatting',
        '`docker ps` lists images, while `docker ps -a` lists containers',
      ],
      answer: 0,
    },
    {
      id: 'm0-q4',
      q: 'In this module, a teammate with a different Node version than the one pinned in `server/package.json` hits confusing errors that you never see on your own machine. Which specific benefit of Docker directly addresses this exact pain?',
      options: [
        'Docker makes MongoDB Atlas free for everyone automatically',
        'Packaging the server as a container image bundles the exact Node version and dependencies together, so it runs identically regardless of what Node version happens to be installed on the host machine',
        'Docker automatically rewrites your teammate\'s code to match your Node version',
        'Docker removes the need for a package.json entirely',
      ],
      answer: 1,
    },
    {
      id: 'm0-q5',
      q: 'What does `docker exec -it kundapura-mongo-test mongosh` actually do, and what must be true beforehand for it to work?',
      options: [
        'It creates a brand-new mongo container from scratch; no prerequisite is needed',
        'It permanently modifies the mongo image; the image must first be rebuilt',
        'It starts a new interactive process inside the already-running kundapura-mongo-test container; the container must already be running, since exec joins an existing container\'s namespaces rather than creating a new one',
        'It stops the kundapura-mongo-test container and replaces it with a shell session',
      ],
      answer: 2,
    },
  ],
}
