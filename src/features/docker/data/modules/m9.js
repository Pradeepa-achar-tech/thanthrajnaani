// Module 9 — Production Deployment & CI/CD (capstone)
// Every prior module made Kundapura Notice Board better at running — leaner
// images, a real network, persistent volumes, healthchecks, Compose
// orchestration — but it has only ever run on the learner's own laptop. This
// final module ships it for real: push both images to Docker Hub with an
// honest tagging strategy, fill in the docker-compose.prod.yml stub to pull
// published images instead of building locally, automate the publish step
// with a GitHub Actions workflow, provision a real Ubuntu cloud VM, and bring
// the whole stack up at a genuine public IP — closing with the day-2
// operations every running server needs and a teaser toward Kubernetes as
// the natural next step beyond this course.

export const m9 = {
  id: 'm9',
  title: 'Production Deployment & CI/CD',
  hours: 7,
  color: 'from-orange-500/20 to-orange-700/10',
  accent: 'orange',
  description:
    "Kundapura Notice Board has run beautifully since Module 0 — on exactly one machine: yours. This capstone module ships it for real. You will **tag and push both images to Docker Hub** the way real teams do (`:latest` plus an honest version or commit-sha tag, never `:latest` alone), fill in `docker-compose.prod.yml` so production **pulls published images instead of building from source**, wire up a **GitHub Actions** workflow so every push to `main` rebuilds and republishes both images automatically, and provision a real Ubuntu **cloud VM** — installing Docker, copying over nothing but the compose files and `.env`, and bringing the whole stack up with a single `pull && up -d`. You will close with the unglamorous but essential **day-2 operations** every running server needs — `logs`, `stats`, `system df`, `system prune` — and an honest look at where a single Compose host stops being enough, and why the natural next step beyond this course is Kubernetes.",
  sections: [
    {
      id: 'm9-s1',
      title: 'Shipping Images',
      topics: [
        {
          id: 'm9-t1',
          title: 'Tagging strategy and pushing to Docker Hub: docker login, docker tag, docker push',
          explain:
            'Log in to Docker Hub with `docker login`, give your locally built images a proper `<username>/<repo>:<tag>` name with `docker tag` (or directly at build time), and publish them with `docker push` — always shipping both a `:latest` tag and a specific, honest version or commit-sha tag.',
          analogy:
            'Picture the export shed at **Kundapura port** the night before the weekly cargo boat leaves for Mangalore and beyond. Every crate destined to travel has to be relabelled from a fisherman\'s own shorthand ("Suresh\'s catch, Tuesday") into the harbour\'s official shipping manifest format — consignee, batch code, date — before customs lets it anywhere near the boat. Writing "fresh fish" on every crate and nothing else is exactly how a `:latest`-only tag behaves: fine until three shipments sit on the dock all labelled identically, and nobody can say which crate is which, or which one to pull back if a customer complains. `docker login` is presenting your harbour credentials at the export shed\'s gate; `docker tag` is stencilling the proper manifest code onto the crate; `docker push` is the crate actually going up the gangplank onto the boat.',
          theory:
            "**`docker login`** authenticates your Docker CLI against Docker Hub's registry API. Run `docker login -u thanthrajnaani` and supply a password — or, far better, a **Personal Access Token** generated from Docker Hub's Account Settings → Security. Tokens can be scoped and revoked individually without ever touching your account password, and they're required outright if you have two-factor authentication enabled. A successful login writes credentials into `~/.docker/config.json` (or your OS's native credential store), so subsequent `docker push`/`docker pull` commands against Docker Hub don't ask again until you `docker logout`.\n\nDocker Hub identifies every image by a fully-qualified name: `<dockerhub-username>/<repository>:<tag>`. A locally built image tagged only `noticeboard-server:v1` means nothing to Docker Hub — it has no namespace. **`docker tag`** fixes this without rebuilding anything:\n```\ndocker tag noticeboard-server:v1 thanthrajnaani/kundapura-noticeboard-server:v1\n```\nThis does not copy any data — it creates a second name pointing at the *same* underlying image ID and the *same* filesystem layers. An image can carry a dozen tags and still occupy disk space once.\n\n**`docker push`** then uploads that named image's layers to Docker Hub — efficiently: layers Docker Hub already has (say, a shared `node:20` base layer another image on your account already pushed) are skipped, and only genuinely new layers actually transfer.\n\nThe tagging strategy that matters most in production: **never rely on `:latest` alone.** Push `:latest` for convenience, so any pull without a pinned tag always gets *something* current — but *also* push a second, specific tag: either a hand-chosen version (`:v1`, `:v2`) or, better still for traceability, the exact git commit it was built from:\n```bash\nTAG=$(git rev-parse --short HEAD)\ndocker tag noticeboard-server:v1 thanthrajnaani/kundapura-noticeboard-server:$TAG\ndocker push thanthrajnaani/kundapura-noticeboard-server:$TAG\n```\nWhy this matters in practice: `:latest` is just a string, not a magic pointer to \"whatever I built five minutes ago\" — the moment you need to roll back a bad production deploy, you need to say precisely \"run exactly what was running last Tuesday,\" and `:latest` alone cannot answer that question. A version or commit-sha tag can, every time.",
          whyItMatters:
            'This is the exact moment Kundapura Notice Board stops being something only your laptop can run and becomes something *anyone with Docker* can run, anywhere, by name — `docker pull thanthrajnaani/kundapura-noticeboard-server:v1`. Get the tagging discipline right here, and every later rollback, audit, or "what\'s actually running in production" question this project ever faces has a real answer instead of a shrug.',
          steps: [
            'Create a Docker Hub Personal Access Token from Account Settings → Security, scoped to Read & Write.',
            'Run `docker login -u thanthrajnaani` and paste the token as the password when prompted.',
            'Build the server image tagged twice in one command: `docker build -t thanthrajnaani/kundapura-noticeboard-server:v1 -t thanthrajnaani/kundapura-noticeboard-server:latest ./server`.',
            'Do the same for the client: `docker build -t thanthrajnaani/kundapura-noticeboard-client:v1 -t thanthrajnaani/kundapura-noticeboard-client:latest ./client`.',
            'Push all four tags with `docker push thanthrajnaani/kundapura-noticeboard-server:v1`, `:latest`, and the two client equivalents.',
            'Confirm both repositories show up on hub.docker.com with two tags each, and note the image digest for `v1` in case you ever need to reference it precisely.',
          ],
          code: `# Generate a token first: hub.docker.com -> Account Settings -> Security -> New Access Token
$ docker login -u thanthrajnaani
Password: ****************************  (paste the access token, not your account password)
Login Succeeded

# Build BOTH tags for the server in one command — no extra "docker tag" step needed:
$ docker build -t thanthrajnaani/kundapura-noticeboard-server:v1 \\
                -t thanthrajnaani/kundapura-noticeboard-server:latest \\
                ./server
[+] Building 41.2s (14/14) FINISHED
...

# Same for the client:
$ docker build -t thanthrajnaani/kundapura-noticeboard-client:v1 \\
                -t thanthrajnaani/kundapura-noticeboard-client:latest \\
                ./client
[+] Building 28.7s (12/12) FINISHED
...

# Push all four tags:
$ docker push thanthrajnaani/kundapura-noticeboard-server:v1
$ docker push thanthrajnaani/kundapura-noticeboard-server:latest
$ docker push thanthrajnaani/kundapura-noticeboard-client:v1
$ docker push thanthrajnaani/kundapura-noticeboard-client:latest
The push refers to repository [docker.io/thanthrajnaani/kundapura-noticeboard-server]
a1b2c3d4e5f6: Pushed
7f8e9d0c1b2a: Pushed
latest: digest: sha256:9f86d081884c7d659a2feaa0c55ad015... size: 3050

# Prefer a commit-sha tag over a hand-picked version number:
$ TAG=$(git rev-parse --short HEAD)
$ docker tag thanthrajnaani/kundapura-noticeboard-server:v1 thanthrajnaani/kundapura-noticeboard-server:$TAG
$ docker push thanthrajnaani/kundapura-noticeboard-server:$TAG`,
          pitfalls: [
            '**Relying on `:latest` as the only tag ever pushed.** There is no way to say "roll back to what was running yesterday" — `:latest` is just a string, not a version history. Fix: always push a second, specific version or commit-sha tag alongside `:latest`.',
            '**Using your real Docker Hub account password for `docker login`.** It fails outright with 2FA enabled, and if it ever leaks, an attacker gets full account access. Fix: generate a scoped Personal Access Token and use that instead.',
            '**Forgetting the Docker Hub username namespace when tagging** (pushing `noticeboard-server:v1` instead of `thanthrajnaani/kundapura-noticeboard-server:v1`). Docker Hub rejects the push with "requested access to the resource is denied." Fix: always tag as `<dockerhub-username>/<repo-name>:tag` before pushing.',
            '**Pushing a stale local image, having forgotten to rebuild after the last code edit.** The published image silently does not contain your newest change. Fix: rebuild immediately before tagging and pushing, and sanity-check the `CREATED` column in `docker images`.',
            '**Assuming the push succeeded just because the command returned.** A dropped connection mid-upload or a Docker Hub rate limit can leave a tag half-published. Fix: confirm the final `digest: sha256:...` line printed, or run a fresh `docker pull` of the tag afterward to prove it is really there.',
            '**Leaving the repository visibility unconsidered** — public by default on a free account, which is fine for this course, but worth a deliberate choice. Fix: decide public vs. private on purpose, and remember a private repo means the VM must also `docker login` before it can pull.',
          ],
          tryIt:
            'Build the server image tagged directly with both `thanthrajnaani/kundapura-noticeboard-server:v1` and `:latest` in one `docker build` command using two `-t` flags, log in with `docker login`, push both tags, then delete your local copy (`docker rmi`) and run `docker pull thanthrajnaani/kundapura-noticeboard-server:v1` to prove it downloads successfully straight from Docker Hub.',
          takeaway:
            '`docker login` authenticates, `docker tag` gives an image a Docker-Hub-qualified name without duplicating any data, and `docker push` uploads it — always alongside `:latest`, push a specific version or commit-sha tag so a rollback target genuinely exists.',
        },
        {
          id: 'm9-t2',
          title: 'docker-compose.prod.yml — pulling published images instead of building locally',
          explain:
            'Fill in the earlier `docker-compose.prod.yml` stub so the `server` and `client` services reference the published `thanthrajnaani/kundapura-noticeboard-*` images with `image:` instead of `build:`, then bring the stack up by layering it on top of the base file with `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`.',
          analogy:
            "Back at the Kundapura harbour warehouse: the base shipping order, `docker-compose.yml`, has always said \"assemble crate #2 (the server) and crate #3 (the client) fresh from raw stock on our own loading dock\" — that's `build:`, exactly right for a workshop still testing recipes on a laptop. The production order, `docker-compose.prod.yml`, says something completely different: \"crate #2 and crate #3 are already packed and labelled, sitting in the public bonded warehouse across town (Docker Hub) — just go collect those exact ones, don't re-pack them from raw stock.\" Same shipment, same manifest shape, only the sourcing instruction for two of the crates changes from \"build it here\" to \"fetch the one that's already built.\"",
          theory:
            "`docker-compose.yml` is the shared shape of the whole stack — three services (`mongo`, `server`, `client`) on the `noticeboard-net` network, `mongo-data` as a named volume — and for `server`/`client` it has always said `build: ./server` / `build: ./client`, because every module so far ran on a laptop that actually *has* that source code sitting next to the compose file. Production doesn't get that luxury by design (next topic): the VM will only ever hold the compose files and `.env`, never the source. `docker-compose.prod.yml` is the small overlay file that changes exactly that one thing:\n```yaml\nservices:\n  server:\n    image: thanthrajnaani/kundapura-noticeboard-server:latest\n    restart: unless-stopped\n\n  client:\n    image: thanthrajnaani/kundapura-noticeboard-client:latest\n    restart: unless-stopped\n```\n`mongo` needs no entry here at all — it already pulls the official `mongo:7` image in the base file, nothing to override. The `noticeboard-net` network and `mongo-data` volume definitions are not repeated either; Compose merges network and volume definitions across files automatically as long as the names match.\n\nCompose merges multiple `-f` files **left to right** — later files win for any key they redefine. Invoke it explicitly, listing both, in order:\n```bash\ndocker compose -f docker-compose.yml -f docker-compose.prod.yml up -d\n```\nOne genuinely important subtlety: the base file's `build: ./server` is not *removed* by the overlay just because `image:` is now also present in the merged config — both keys technically coexist. What actually prevents Compose from ever trying to build (which would fail outright on a VM with no `./server` folder) is **command order**: run `docker compose -f ... -f ... pull` first. `pull` fetches the exact image named by `image:` regardless of any `build:` key, priming the local image cache. Only *then* run `up -d` — by that point the named image already exists locally, so Compose has no reason to fall back to building it. This is exactly why the standard production sequence is always `pull` then `up -d`, never `up -d` alone on a fresh host.\n\nAlso worth internalizing: Compose auto-loads a file literally named `docker-compose.override.yml` sitting next to the base file, with **no `-f` flag required at all**. That override exists purely for local dev conveniences (hot-reload bind mounts, exposed debug ports) — it must never be copied to the production VM, or its dev-only settings would silently apply there too.",
          whyItMatters:
            "This overlay file is the single hinge the whole deployment turns on: the exact same `docker-compose.yml` your laptop already trusts, pointed at Docker Hub instead of your local filesystem, is what lets a bare Ubuntu VM run the identical stack without ever seeing a line of your source code.",
          steps: [
            'Open the existing `docker-compose.prod.yml` stub in the project root.',
            'Add a `server` service with `image: thanthrajnaani/kundapura-noticeboard-server:latest` and `restart: unless-stopped`.',
            'Add a `client` service with `image: thanthrajnaani/kundapura-noticeboard-client:latest` and `restart: unless-stopped`.',
            'Leave `mongo`, the `noticeboard-net` network, and the `mongo-data` volume untouched — do not redeclare them.',
            'Run `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` and read the merged output to confirm `server`/`client` show the right `image:` values.',
            'Rehearse locally once: run the real `pull` then `up -d` pair on your own machine before ever touching the VM.',
          ],
          code: `# docker-compose.prod.yml — the filled-in production overlay
services:
  server:
    image: thanthrajnaani/kundapura-noticeboard-server:latest
    restart: unless-stopped

  client:
    image: thanthrajnaani/kundapura-noticeboard-client:latest
    restart: unless-stopped

# mongo, the noticeboard-net network, and the mongo-data volume are
# inherited unchanged from docker-compose.yml — nothing to override.

# Preview the merged configuration before running anything:
$ docker compose -f docker-compose.yml -f docker-compose.prod.yml config
services:
  client:
    image: thanthrajnaani/kundapura-noticeboard-client:latest
    networks: [noticeboard-net]
    restart: unless-stopped
  mongo:
    image: mongo:7
    networks: [noticeboard-net]
    volumes: [mongo-data:/data/db]
  server:
    image: thanthrajnaani/kundapura-noticeboard-server:latest
    networks: [noticeboard-net]
    restart: unless-stopped
...

# Always pull BEFORE up -d, in production:
$ docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
$ docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
[+] Running 4/4
 ✔ Network noticeboard-net  Created
 ✔ Container noticeboard-mongo   Started
 ✔ Container noticeboard-server  Started
 ✔ Container noticeboard-client  Started`,
          pitfalls: [
            '**Assuming `image:` in the overlay silently erases `build:` from the base file.** Both keys coexist after the merge; if the named image is missing locally, Compose can still fall back to building. Fix: always `pull` before `up -d` so the named image is already cached and building is never attempted.',
            '**Copying the whole `docker-compose.yml` to the VM (including its `build:` paths) without realizing the `server/`/`client/` folders genuinely will not exist there.** A build attempt would fail with a "path not found" error. Fix: know that `pull` first is what makes this a non-issue — the image is already local by the time `up -d` runs.',
            '**Running `docker compose up -d` without the explicit `-f` file list.** Compose only auto-loads `docker-compose.yml` plus `docker-compose.override.yml` by default — never `docker-compose.prod.yml`. Fix: always spell out both files: `-f docker-compose.yml -f docker-compose.prod.yml`.',
            '**Pushing only a `:v1` tag but leaving `docker-compose.prod.yml` pointed at `:latest`, or vice versa.** The overlay pulls a tag that was never actually published with the newest fix. Fix: always push both tags together, as established in the previous topic.',
            '**Forgetting to re-run `pull && up -d` after publishing a new image.** Containers keep running the old cached image indefinitely; a new push alone changes nothing on a host that never re-pulls. Fix: re-run the standard pull-then-up sequence any time a new image version should actually take effect.',
            '**Accidentally copying `docker-compose.override.yml` to the production VM.** Compose auto-loads it with no `-f` flag needed, silently applying dev-only bind mounts or debug ports in production. Fix: never transfer `docker-compose.override.yml` to a production host — delete it if it is already there.',
          ],
          tryIt:
            'On your own laptop, before touching any VM, run `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` and read the merged output line by line — confirm `server` and `client` show `image:` pointing at your Docker Hub repositories — then run the real `pull` followed by `up -d` locally as a rehearsal for the real deployment.',
          takeaway:
            '`docker-compose.prod.yml` swaps `build:` for `image:` on `server` and `client` only, leaving `mongo`, the network, and the volume untouched — and always `pull` before `up -d` so Compose fetches the named image instead of ever trying to build from a source folder that, on the real VM, will not exist.',
        },
      ],
    },
    {
      id: 'm9-s2',
      title: 'Automating & Operating in Production',
      topics: [
        {
          id: 'm9-t3',
          title: 'A GitHub Actions workflow that builds and pushes both images on every push to main',
          explain:
            'Add `.github/workflows/docker-publish.yml` so every push to `main` automatically logs into Docker Hub using repository secrets and builds + pushes fresh `server` and `client` images — both `:latest` and a commit-sha tag — with zero manual `docker login`/`tag`/`push` typing.',
          analogy:
            "Right now, every shipment leaving Kundapura port needs a person to walk to the customs shed, stamp the paperwork, and personally carry it to the warehouse register — that's you, manually running `docker login`/`tag`/`push` from the previous topic. A GitHub Actions workflow is hiring a tireless customs clerk who stands permanently at the gate: the instant a shipment (a push to `main`) rolls up, the clerk checks the credentials on file, stamps both the standard label and today's specific batch code, and walks it straight to the warehouse — every time, identically, without you ever holding the login password yourself.",
          theory:
            'GitHub Actions reads any YAML file under `.github/workflows/` in your repository and runs it as a **workflow** triggered by events you declare. For Kundapura Notice Board, `.github/workflows/docker-publish.yml` triggers on `on: push: branches: [main]` — deliberately scoped to `main` only, so a work-in-progress feature branch never accidentally republishes a broken `:latest` image that a production VM might pull next.\n\nA single job, `build-and-push`, runs on a fresh `ubuntu-latest` runner and does this, in order:\n1. **`actions/checkout@v4`** — clones the repository onto the runner so the `server/` and `client/` folders (and their Dockerfiles) actually exist to build from.\n2. **`docker/login-action@v3`** — logs into Docker Hub using two **repository secrets**, `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`, configured once under the repo\'s Settings → Secrets and variables → Actions. `DOCKERHUB_TOKEN` should be a Docker Hub Personal Access Token, exactly the kind used manually in the previous module\'s topic — never the raw account password. GitHub encrypts secrets at rest and masks them in logs, but a scoped, revocable token is still the safer choice.\n3. **`docker/build-push-action@v6`**, run twice — once per service — each pointed at its own `context:` (`./server`, `./client`) and its own two-entry `tags:` list: `:latest` and a short commit-sha derived from the workflow\'s own `github.sha` context, with `push: true` so the built result is uploaded immediately rather than just sitting on the runner.\n\nThe net effect: the instant you push to `main`, both images rebuild from the exact code that just landed and republish under both tags — automatically, consistently, with no human ever typing a Docker Hub password on their own laptop again. Anyone reviewing the Actions tab on GitHub can see every publish, exactly when it happened and from which commit — an audit trail manual `docker push` runs never gave you.\n\nThis workflow is the same three commands from the previous topic (`login`, `build`+`tag`, `push`) — just moved off your laptop and onto a runner that executes them identically, every single time, triggered by the one event that should always mean "ship it": a push to `main`.',
          whyItMatters:
            'Manual publishing works exactly once — the moment a teammate joins the project, or you forget one step late at night, the discipline quietly breaks. This workflow makes "push to main" and "Docker Hub has the current build" permanently the same fact, without depending on anyone\'s memory.',
          steps: [
            'Create the folder `.github/workflows/` at the repository root if it does not already exist.',
            'Write `docker-publish.yml` with `on: push: branches: [main]` as the trigger.',
            'Add a `build-and-push` job on `ubuntu-latest` with an `actions/checkout@v4` step first.',
            'Add a `docker/login-action@v3` step referencing `secrets.DOCKERHUB_USERNAME` and `secrets.DOCKERHUB_TOKEN`.',
            'Add two `docker/build-push-action@v6` steps, one per service, each with its own `context:` and a two-tag `tags:` list including a short commit-sha.',
            'In the repository Settings → Secrets and variables → Actions, add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (a Personal Access Token), then push a trivial commit to `main` and watch the Actions tab.',
          ],
          code: `# .github/workflows/docker-publish.yml
name: Build & Publish Docker Images

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Kundapura Notice Board
        uses: actions/checkout@v4

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push server image
        uses: docker/build-push-action@v6
        with:
          context: ./server
          push: true
          tags: |
            thanthrajnaani/kundapura-noticeboard-server:latest
            thanthrajnaani/kundapura-noticeboard-server:\${{ github.sha }}

      - name: Build and push client image
        uses: docker/build-push-action@v6
        with:
          context: ./client
          push: true
          tags: |
            thanthrajnaani/kundapura-noticeboard-client:latest
            thanthrajnaani/kundapura-noticeboard-client:\${{ github.sha }}

# After pushing a trivial commit to main, in the repo's Actions tab:
# ✓ Build & Publish Docker Images  #14  main  2m 41s  success
#
# Then from your own machine, confirm the new image really landed:
$ docker pull thanthrajnaani/kundapura-noticeboard-server:latest
latest: Pulling from thanthrajnaani/kundapura-noticeboard-server
Status: Downloaded newer image for thanthrajnaani/kundapura-noticeboard-server:latest`,
          pitfalls: [
            '**Pasting the Docker Hub token directly into the workflow YAML instead of using a secret.** It becomes permanently visible in the repository\'s history to anyone with read access. Fix: always store it under Settings → Secrets and variables → Actions and reference it as `secrets.DOCKERHUB_TOKEN`.',
            '**Using the real Docker Hub account password as `DOCKERHUB_TOKEN`.** It works until 2FA is enabled, then fails outright, and is far riskier if it ever leaks. Fix: generate a scoped Personal Access Token specifically for this workflow.',
            '**Triggering the workflow on every branch or pull request instead of just `main`.** An experimental feature branch could publish a broken image under `:latest` that a production VM later pulls. Fix: scope the trigger tightly to `branches: [main]`.',
            '**Generating a read-only Docker Hub token by mistake.** The workflow logs in successfully but fails at the push step with an authorization error. Fix: check the token\'s permission scope (Read & Write) when generating it on Docker Hub.',
            '**Pointing `context:` at the repository root instead of each service\'s own folder.** The build either fails to find a Dockerfile or builds the wrong thing entirely. Fix: set `context: ./server` and `context: ./client` to match exactly where each Dockerfile lives.',
            '**Referencing an action by `@master` or with no version pin at all.** A future breaking change in the action can silently break the pipeline with no warning. Fix: pin every action to a specific major version, e.g. `docker/build-push-action@v6`.',
          ],
          tryIt:
            "Add the workflow file, configure both secrets, push a trivial one-line comment change to `main`, and open the repository's Actions tab to watch the run complete — afterward, run `docker pull thanthrajnaani/kundapura-noticeboard-server:latest` locally and confirm the pulled image reflects your just-pushed change.",
          takeaway:
            '`.github/workflows/docker-publish.yml`, triggered on push to `main` and authenticated via `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN` secrets, turns `docker login`+`build`+`push` into something that happens automatically and identically on every merge, not something a human has to remember to run.',
        },
        {
          id: 'm9-t4',
          title: 'Deploying to a cloud VM: install Docker, copy docker-compose.prod.yml + .env, docker compose pull && up -d',
          explain:
            'Provision a fresh Ubuntu VM on any inexpensive VPS, install Docker Engine and the Compose plugin, transfer only `docker-compose.yml`, `docker-compose.prod.yml`, and `.env` (never the source code), and bring the whole stack up with `docker compose -f docker-compose.yml -f docker-compose.prod.yml pull && ... up -d`.',
          analogy:
            "This is the moment the shipment actually leaves Kundapura and arrives at a brand-new harbour somewhere else entirely. The receiving harbour doesn't need Kundapura's fishing boats, nets, or the fishermen themselves shipped over with it — it only needs the delivery manifest telling it which already-packed crates to collect from the shared bonded warehouse (Docker Hub), and the customs paperwork with the right names and passwords filled in (`.env`). Everything else — the actual factory that produced the goods, your source code and your Dockerfiles — stays behind in Kundapura, because the receiving harbour was never meant to manufacture anything itself; it only ever unpacks what already arrived pre-built.",
          theory:
            'Any inexpensive Ubuntu 22.04/24.04 VM works — a $5-6/month VPS from any provider is genuinely enough for Kundapura Notice Board\'s traffic. Once you can SSH in, install Docker Engine and the **Compose plugin** (the modern `docker compose`, not the old standalone `docker-compose` binary) via the official apt repository:\n```bash\nsudo apt-get update\nsudo apt-get install -y ca-certificates curl\nsudo install -m 0755 -d /etc/apt/keyrings\nsudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc\nsudo chmod a+r /etc/apt/keyrings/docker.asc\necho \\\n  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \\\n  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \\\n  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null\nsudo apt-get update\nsudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin\nsudo usermod -aG docker $USER\n```\nLog out and back in for the group change to take effect, then confirm with `docker compose version` and `docker ps` (no `sudo` required for either).\n\nThe critical, easy-to-get-wrong part: **what actually gets copied to this VM.** Not the repository. Not `server/` or `client/`. Not `node_modules`, not `.git`. Exactly three things, via `scp` (or `rsync`):\n```bash\nscp docker-compose.yml docker-compose.prod.yml .env ubuntu@<vm-public-ip>:~/kundapura-noticeboard/\n```\n`.env` on this machine holds real production values — Mongo credentials for the containerized `mongo` service, the `MONGO_URI` the `server` service reads (pointed at the internal Docker network hostname `mongo`, not an external cluster, since Mongo now lives inside this same stack), and `NODE_ENV=production`. It should never be the same `.env` your laptop used for local development.\n\nWith the three files in place:\n```bash\nssh ubuntu@<vm-public-ip>\ncd kundapura-noticeboard\ndocker compose -f docker-compose.yml -f docker-compose.prod.yml pull\ndocker compose -f docker-compose.yml -f docker-compose.prod.yml up -d\n```\n`pull` fetches `server`/`client` from Docker Hub and `mongo:7` from Docker Hub\'s official library; `up -d` then starts all three, detached, on the `noticeboard-net` network with `mongo-data` as a fresh named volume on this VM. Finally, open the relevant inbound port on **both** the VM\'s own firewall (`sudo ufw allow 80/tcp`, or whatever port the client publishes) and the cloud provider\'s security-group/firewall dashboard — a running container nothing outside the VM can reach is a very common false "it\'s not working" moment, and it is almost always a firewall, not Docker.',
          whyItMatters:
            "This is the whole course's payoff: Kundapura Notice Board, reachable at a real public IP address, run by a machine that has never once seen your source code — only the compose files, `.env`, and Docker Hub's registry. That gap, laptop to public internet, is the one Module 0's \"works on my machine\" could not have imagined closing.",
          steps: [
            'Provision the cheapest Ubuntu 22.04/24.04 VM your chosen provider offers and note its public IP.',
            'SSH in, then install Docker Engine and the Compose plugin using the official apt repository steps above.',
            'Add your user to the `docker` group with `sudo usermod -aG docker $USER`, then log out and back in.',
            'From your own machine, `scp` only `docker-compose.yml`, `docker-compose.prod.yml`, and a real production `.env` to the VM.',
            'On the VM, run `docker compose -f docker-compose.yml -f docker-compose.prod.yml pull` followed by `... up -d`.',
            'Open the client\'s published port on `ufw` and the provider\'s firewall/security-group dashboard, then `curl` the public IP from your own laptop.',
          ],
          code: `# --- On the VM: install Docker Engine + Compose plugin (Ubuntu, official apt repo) ---
$ sudo apt-get update
$ sudo apt-get install -y ca-certificates curl
$ sudo install -m 0755 -d /etc/apt/keyrings
$ sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
$ sudo chmod a+r /etc/apt/keyrings/docker.asc
$ echo \\
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \\
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \\
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
$ sudo apt-get update
$ sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
$ sudo usermod -aG docker $USER
# log out, log back in
$ docker compose version
Docker Compose version v2.29.1

# --- From your OWN machine: copy over ONLY the three files ---
$ scp docker-compose.yml docker-compose.prod.yml .env ubuntu@203.0.113.42:~/kundapura-noticeboard/

# --- Back on the VM: pull, then bring the stack up ---
$ ssh ubuntu@203.0.113.42
$ cd kundapura-noticeboard
$ docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
[+] Pulling 3/3
 ✔ mongo Pulled
 ✔ server Pulled
 ✔ client Pulled
$ docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
[+] Running 4/4
 ✔ Network noticeboard-net  Created
 ✔ Container noticeboard-mongo   Started
 ✔ Container noticeboard-server  Started
 ✔ Container noticeboard-client  Started

# Open the firewall on the VM itself:
$ sudo ufw allow 80/tcp
# (also open port 80 in your cloud provider's security-group / firewall dashboard)

# From YOUR laptop, prove it's reachable at the real public IP:
$ curl http://203.0.113.42
<!DOCTYPE html><html>...Kundapura Notice Board...</html>`,
          pitfalls: [
            '**Copying the entire git repository — including `node_modules/` and `.git/` — "just in case."** It wastes bandwidth and disk, and defeats the entire point of pulling pre-built images. Fix: copy only `docker-compose.yml`, `docker-compose.prod.yml`, and `.env`.',
            '**Running every Docker command with `sudo` because the user was never added to the `docker` group.** Works, but is easy to forget mid-session and clutters scripts. Fix: `sudo usermod -aG docker $USER`, then log out and back in, and verify `docker ps` works without `sudo`.',
            '**Forgetting to open the relevant port on the cloud provider\'s security-group/firewall dashboard, only on the VM\'s own `ufw`.** The stack shows `Up` in `docker ps` but stays unreachable from the public internet. Fix: check both the OS-level firewall and the provider\'s separate network firewall settings.',
            '**Leaving `.env` with local development values, or with placeholders never filled in.** Containers start, then crash-loop on bad Mongo credentials. Fix: populate `.env` with real production values before running `up -d`, and never copy a local dev `.env` verbatim.',
            '**Running `up -d` on a brand-new VM without `pull` first.** Compose has no cached image and no local `server/`/`client/` source folder to build from either, so the safe, standard sequence is always `pull` then `up -d`, in that order. Fix: never skip the `pull` step on a fresh host.',
            '**Leaving SSH open to root login, or doing all day-to-day work as root.** Unnecessarily widens the VM\'s attack surface. Fix: create a limited, sudo-capable non-root user for routine operations and disable root SSH login where the provider allows it.',
          ],
          tryIt:
            'Provision the cheapest Ubuntu VM your chosen provider offers, install Docker Engine and the Compose plugin exactly as shown, copy over only the three files, run `pull` then `up -d`, and from your own laptop (not the VM) `curl` the client\'s public port at the VM\'s IP and confirm the Notice Board\'s HTML actually comes back.',
          takeaway:
            'A production VM needs Docker Engine, the Compose plugin, and exactly three files — `docker-compose.yml`, `docker-compose.prod.yml`, `.env` — never the source code; `pull` before `up -d` is what turns those files into a genuinely running, publicly reachable stack.',
        },
        {
          id: 'm9-t5',
          title: "Day-2 operations: docker compose logs, docker stats, docker system df/prune, and what's next beyond a single host (Kubernetes teaser)",
          explain:
            'Learn the handful of commands that keep a running production stack observable and tidy — `docker compose logs -f`, `docker stats`, `docker system df`, and `docker system prune` (with a precise read on exactly what each prune variant deletes) — and see, honestly, where a single Compose host\'s usefulness ends.',
          analogy:
            "Once cargo starts actually moving through Kundapura port every day, someone has to run the place day after day, not just for the one big shipment that just arrived. The harbour master walks the wharf checking the day's paperwork (`docker compose logs -f`), keeps an eye on how hard each crane and warehouse crew is working right now (`docker stats`), audits how much of the warehouse floor is genuinely full of goods versus empty crates nobody claimed (`docker system df`), and periodically clears out expired, unclaimed crates that are just taking up space (`docker system prune`) — carefully, because clearing out the wrong crate is a real loss. And when Kundapura's one harbour eventually can't keep up with demand from three neighbouring towns at once, the honest answer isn't \"hire a bigger harbour master\" — it's building an actual coordinated shipping network across multiple ports, which is a different, larger job entirely.",
          theory:
            "Shipping Kundapura Notice Board once is easy compared to keeping it healthy every day after. Four commands cover almost all of what a single-host production deployment actually needs:\n\n**`docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f`** streams live logs from every service at once, each line prefixed by service name, like tailing three separate log files interleaved by time. Add `--tail=100` to avoid an overwhelming scrollback on a long-running container, and scope to one service (`... logs -f server`) once you know exactly where to look.\n\n**`docker stats`** shows a live, continuously refreshing table of CPU %, memory usage/limit, network I/O, and block I/O for every running container — the fastest way to answer \"is the `mongo` container quietly eating all the VM's RAM\" without installing any separate monitoring tool. It streams until you `Ctrl+C`; it is not a one-shot snapshot.\n\n**`docker system df`** answers \"where did my disk go\" with a breakdown across four categories — Images, Containers, Local Volumes, Build Cache — each showing total size *and* how much is actually **reclaimable**. On a small VPS with a 20-25GB disk, this is the first command to run before disk pressure becomes an outage.\n\n**`docker system prune`** is where precision matters most, because the three common invocations delete genuinely different things:\n- `docker system prune` (no flags) — removes stopped containers, networks not used by any container, **dangling** images (built but never tagged — leftovers from rebuilds), and unused build cache. It does **not** touch volumes, and does not touch images that are tagged and simply not currently running (only genuinely untagged ones).\n- `docker system prune -a` — additionally removes **every** image not currently used by *any* container, tagged or not. This can delete `thanthrajnaani/kundapura-noticeboard-server:v1` itself if nothing is running from it right now, forcing a re-pull the next time it is needed.\n- `docker system prune -a --volumes` — additionally removes unused **named volumes** too. On this stack, that means `mongo-data` is at risk *if* it is not currently attached to a running container — this is a real, permanent-data-loss command, and should never be run reflexively on a host running a database.\n\nThe honest closing note for this entire course: everything from Module 0 to here runs on **one host**. That is a completely legitimate, production-real way to run Kundapura Notice Board, and plenty of real small businesses never need anything more. But the moment more than one server is needed — for redundancy if a single VM goes down, for automatically scaling `server` replicas up under load, or for rolling out a new version with genuinely zero downtime instead of the few seconds `up -d` takes to recreate containers — a single Compose host runs out of road. That is exactly the problem **Kubernetes** exists to solve: multi-server orchestration, health-based auto-scaling, and rolling zero-downtime deploys, as first-class parts of the platform rather than something scripted by hand. It is a substantial system in its own right and deliberately out of scope here — but if Kundapura Notice Board ever outgrows one VM, that is the direction to look.",
          whyItMatters:
            "A deployment nobody watches is a deployment that fails silently until a user complains — these four commands are the entire difference between \"it's running\" and \"I actually know it's healthy,\" and knowing precisely what each `prune` variant deletes is the difference between routine housekeeping and an accidental data-loss incident on your own production database.",
          steps: [
            'Run `docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f --tail=50` on the VM and watch it stream for a few seconds.',
            'Scope the same command to one service only, e.g. `... logs -f server`, and compare.',
            'Run `docker stats` and watch CPU/memory for all three containers update live for about ten seconds, then `Ctrl+C` out.',
            'Run `docker system df` and read the Images, Containers, Local Volumes, and Build Cache rows, noting the reclaimable column.',
            'Run a flag-free `docker system prune`, confirm with `y`, and re-run `docker system df` to see the difference.',
            'Explain out loud (without running it) exactly what `docker system prune -a --volumes` would additionally remove on this specific stack, and why it should not be run casually.',
          ],
          code: `# Follow logs from every service, interleaved:
$ docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f --tail=50
server-1  | Notice Board API listening on port 5000
server-1  | Connected to MongoDB (mongo:27017)
client-1  | nginx: ready to accept connections
mongo-1   | Waiting for connections on port 27017

# Live resource usage, streams until Ctrl+C:
$ docker stats
CONTAINER ID   NAME                  CPU %   MEM USAGE / LIMIT     NET I/O
a1b2c3d4e5f6   noticeboard-server    2.31%   84.2MiB / 957.6MiB    12.4kB / 8.9kB
b2c3d4e5f6a7   noticeboard-client    0.04%   6.1MiB / 957.6MiB     3.1kB / 1.2kB
c3d4e5f6a7b8   noticeboard-mongo     1.87%   112.4MiB / 957.6MiB   9.8kB / 14.2kB

# Disk usage breakdown:
$ docker system df
TYPE            TOTAL   ACTIVE   SIZE      RECLAIMABLE
Images          6       3        1.9GB     1.1GB (57%)
Containers      3       3        112kB     0kB (0%)
Local Volumes   1       1        340MB     0kB (0%)
Build Cache     18      0        640MB     640MB (100%)

# Safe housekeeping — no flags — removes ONLY stopped containers,
# unused networks, dangling images, and unused build cache:
$ docker system prune
WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all dangling images
  - all dangling build cache
Are you sure you want to continue? [y/N] y
Total reclaimed space: 640MB

# NOT run here — shown only to name exactly what it would additionally do:
# docker system prune -a --volumes
#   -> also deletes every image not backing a running container right now
#   -> also deletes unused named volumes, including mongo-data if unattached
#   -> this is a real data-loss risk on a database host — never run reflexively`,
          pitfalls: [
            '**Running `docker system prune -a` casually, assuming it only clears harmless "junk."** It removes every image not currently backing a running container — including a tagged, deliberately-kept version — forcing a re-pull. Fix: understand exactly what `-a` adds over the flag-free version before running it.',
            '**Running `docker system prune --volumes` (or `-a --volumes`) without checking what is currently attached.** It can permanently delete `mongo-data` if the `mongo` container is not running at that exact moment — real, unrecoverable data loss. Fix: never add `--volumes` without confirming the current data is backed up and the container is running.',
            '**Treating `docker stats` output as a single snapshot and closing the terminal, thinking it "hung."** It streams continuously by design. Fix: know it runs until you `Ctrl+C`, and use `--no-stream` if a single reading is genuinely all you want.',
            '**Ignoring `docker system df` until the VM\'s disk is nearly full, then reacting in a panic.** Fix: check `docker system df` periodically as routine maintenance, not only during an active incident.',
            '**Chasing a live bug with `docker compose logs` (no `-f`) and assuming the output is real-time.** Without `-f` it is a one-time snapshot of history, not a stream. Fix: use `-f` to follow, and add `--tail=100` to avoid an overwhelming wall of old output.',
            '**Reaching for a second or third VM and hand-rolled scripts to "scale up" once traffic grows, instead of recognizing this as the actual boundary of what Compose is for.** Fix: treat the need for multiple servers as the signal to learn Kubernetes, not a reason to duct-tape more single-host Compose deployments together.',
          ],
          tryIt:
            'On your running production VM, in order: run `logs -f --tail=50`, watch it, `Ctrl+C` out; run `docker stats` for ten seconds; run `docker system df` and read the reclaimable column for Images; then run a flag-free `docker system prune`, confirm it, and re-run `docker system df` to see the reclaimed space — do NOT run any `--volumes` variant on this VM.',
          takeaway:
            '`logs -f`, `stats`, and `system df` keep a running production stack observable; `system prune` variants range from safe housekeeping (no flags) to genuinely destructive (`-a --volumes`) — know exactly which one you are running before pressing enter, and treat the need for a second server as the signal to learn Kubernetes, not to keep stretching Compose.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm9-p1',
      type: 'Capstone Project',
      title: 'Ship Kundapura Notice Board',
      domain: 'Deployment / CI-CD',
      duration: '5-6 hrs',
      description:
        "This is it — the last mile. Take the hardened, healthchecked images and working Compose setup you've built since Module 1 and actually **ship** them: push both to Docker Hub with an honest tagging strategy, fill in `docker-compose.prod.yml` to pull instead of build, automate the whole publish step with a GitHub Actions workflow, provision a real Ubuntu VM, and bring the complete Kundapura Notice Board stack up at a genuine public IP address — reachable by anyone, built and deployed the way real MERN teams actually ship Docker applications.",
      tools: ['Docker Hub', 'GitHub Actions', 'Docker Compose', 'Ubuntu VPS ($5-6/month)', 'SSH/SCP'],
      blueprint: {
        overview:
          "Every module before this one made Kundapura Notice Board better at running — leaner images, a real network, persistent volumes, healthchecks, Compose orchestration. Not one of them made it reachable by anyone other than you, on your own laptop. This capstone closes that gap completely: your images leave your machine and land in Docker Hub's public registry; your production Compose file learns to pull instead of build; a GitHub Actions workflow takes the publishing step out of your hands entirely; and a real, rented Ubuntu server — one that has never run a single `npm install` for this project — ends up serving the exact same application, because everything it needed arrived as a pre-built image, not as source code.",
        functionalRequirements: [
          'Build both images with Docker-Hub-qualified names and two tags each (`:latest` and a specific version or commit-sha), log into Docker Hub, and push all four resulting tags.',
          'Fill in `docker-compose.prod.yml` so the `server` and `client` services use `image:` pointing at the pushed Docker Hub repositories, leaving `mongo`, the `noticeboard-net` network, and the `mongo-data` volume unchanged.',
          'Add `.github/workflows/docker-publish.yml`, configure `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN` as repository secrets, and confirm a push to `main` rebuilds and republishes both images with no manual `docker login`/`tag`/`push`.',
          'Provision a fresh Ubuntu VM on any inexpensive VPS, install Docker Engine and the Compose plugin, and copy over only `docker-compose.yml`, `docker-compose.prod.yml`, and a real production `.env` — never the application source code.',
          'Bring the full stack up on the VM with `docker compose -f docker-compose.yml -f docker-compose.prod.yml pull && ... up -d`, and confirm Kundapura Notice Board is reachable from a real public IP address with working reads and writes against the containerized Mongo.',
          'Exercise at least the safe day-2 commands (`logs -f`, `stats`, `system df`, and a flag-free `system prune`) against the live deployment and correctly explain what each one did and did not remove.',
        ],
        technicalImplementation: [
          'Use `docker build -t thanthrajnaani/kundapura-noticeboard-server:v1 -t thanthrajnaani/kundapura-noticeboard-server:latest ./server` (and the equivalent for `client`) to tag both names in a single build, then `docker push` each of the four resulting tags.',
          'Write `docker-compose.prod.yml` with only `server` and `client` services defined, each carrying `image:` and `restart: unless-stopped`; verify the merge with `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` before ever running it against a real host.',
          'Structure the GitHub Actions workflow with `actions/checkout@v4`, `docker/login-action@v3` (using the two secrets), and two `docker/build-push-action@v6` steps — one per service, each with its own `context:` and a two-entry `tags:` list built from `github.sha`.',
          "Install Docker Engine and the Compose plugin on the VM via the official apt repository (not the old standalone `docker-compose` binary), add the deploy user to the `docker` group, and open the client's published port on both `ufw` and the provider's security-group/firewall dashboard.",
          "Populate the VM's `.env` with real production values (Mongo root username/password, the `MONGO_URI` pointed at the internal `mongo` service hostname, `NODE_ENV=production`) distinct from any local development `.env`.",
          "Always run `pull` immediately before `up -d` in production, specifically so Compose never falls back to a `build:` step whose source folder does not exist on the VM.",
        ],
        prompts: [
          {
            step: 1,
            label: 'Tag and push both images to Docker Hub',
            outcome: 'Both `server` and `client` images are live on Docker Hub under `thanthrajnaani/kundapura-noticeboard-*`, each with a `:latest` and a specific version/commit-sha tag.',
            prompt:
              "Build the Kundapura Notice Board `server` and `client` images tagged directly for Docker Hub, giving each a `:latest` tag and a second, specific tag (either `:v1` or a short git commit sha via `$(git rev-parse --short HEAD)`). Log in to Docker Hub using a Personal Access Token, not your account password, then push all four resulting tags. Show me the exact commands you ran and the final `docker images` output confirming all four tags exist locally before the push.",
          },
          {
            step: 2,
            label: 'Fill in docker-compose.prod.yml',
            outcome: 'A working `docker-compose.prod.yml` overlay, verified with `docker compose config`, that swaps `build:` for `image:` on `server` and `client` only.',
            prompt:
              "Fill in the `docker-compose.prod.yml` stub so the `server` service uses `image: thanthrajnaani/kundapura-noticeboard-server:latest` and the `client` service uses `image: thanthrajnaani/kundapura-noticeboard-client:latest`, each with `restart: unless-stopped`, leaving `mongo` untouched. Run `docker compose -f docker-compose.yml -f docker-compose.prod.yml config` and paste the merged output, then explain in your own words why running `pull` before `up -d` matters even though the base file's `build:` key technically still exists after the merge.",
          },
          {
            step: 3,
            label: 'Automate publishing with GitHub Actions',
            outcome: '`.github/workflows/docker-publish.yml` exists, both secrets are configured, and a push to `main` produces a successful Actions run that republishes both images.',
            prompt:
              "Write `.github/workflows/docker-publish.yml`, triggered only on pushes to `main`, that logs into Docker Hub using `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN` repository secrets and builds + pushes both the `server` and `client` images with a `:latest` tag and a commit-sha tag derived from `github.sha`. Configure the two secrets in the repository's settings, push a trivial change to `main`, and show me the completed Actions run plus a `docker pull` of the `:latest` tag afterward proving the image actually updated.",
          },
          {
            step: 4,
            label: 'Provision the VM and transfer only the compose files',
            outcome: 'A fresh Ubuntu VM with Docker Engine and the Compose plugin installed, holding exactly three files: `docker-compose.yml`, `docker-compose.prod.yml`, `.env`.',
            prompt:
              "Provision the cheapest Ubuntu VM your chosen provider offers. SSH in and install Docker Engine and the Compose plugin using the official apt repository method, then add your user to the `docker` group. From your own machine, copy over only `docker-compose.yml`, `docker-compose.prod.yml`, and a real production `.env` (with proper Mongo credentials and `MONGO_URI` pointed at the internal `mongo` service) — explicitly do not copy the application source code. Show the exact `scp` command you used and confirm with `ls` on the VM that only those three files exist there.",
          },
          {
            step: 5,
            label: 'Go live, verify, and operate it',
            outcome: "Kundapura Notice Board is running and reachable at the VM's public IP, with day-2 commands exercised and a short written reflection closing out the course.",
            prompt:
              "On the VM, run `docker compose -f docker-compose.yml -f docker-compose.prod.yml pull` followed by `... up -d`, then from your own laptop `curl` the client's public port on the VM's IP and confirm the Notice Board actually loads, plus one GET and one POST against `/api/notices` to prove writes reach the containerized Mongo. Then run `docker compose ... logs -f --tail=50`, `docker stats`, `docker system df`, and a flag-free `docker system prune` on the VM, explaining what each command showed or removed. Close with a short paragraph reflecting on the distance travelled since Module 0's 'works on my machine' problem, and one sentence on why a single Compose host is where this course stops and Kubernetes is the natural next step beyond it.",
          },
        ],
        deliverable:
          "A fully shipped Kundapura Notice Board: both images published to Docker Hub under `thanthrajnaani/kundapura-noticeboard-server`/`-client` with honest `:latest` plus version/commit-sha tags, a working `docker-compose.prod.yml` that pulls rather than builds, a `.github/workflows/docker-publish.yml` that republishes both images automatically on every push to `main`, and a real Ubuntu VM — provisioned with nothing but Docker, the Compose plugin, and three transferred files — running the full stack and reachable at a genuine public IP address. Look back at the distance covered: Module 0 started with an app that only worked because it happened to be running directly on your own laptop; every module since replaced one more piece of \"it works because of something true only about my machine\" with something explicit, portable, and reproducible — a Dockerfile instead of a manually-installed runtime, a Compose network instead of `localhost` assumptions, a named volume instead of data that vanished with a container, and now, finally, a published image and a CI workflow instead of you personally being the deployment mechanism. That is the whole promise of Docker, actually delivered. The one honest limit is this: everything here still runs on a single host. The moment Kundapura Notice Board needs more than one server — for redundancy, for auto-scaling under real load, or for truly zero-downtime rolling deploys — Kubernetes is the natural next step, a deliberately different and larger system this course has not attempted to teach. For a single VM serving a real community, though, what you just shipped is genuinely production-grade, and it is entirely your own work.",
      },
    },
  ],
  quiz: [
    {
      id: 'm9-q1',
      q: 'Your team has only ever deployed Kundapura Notice Board using the `:latest` tag for both images, with no other tag ever pushed. What is the main risk of this practice?',
      options: [
        'Docker Hub does not allow pulling a `:latest` tag in production',
        'There is no reliable way to know exactly which version of the code is currently running, and there is no clear tag to roll back to if a bad release ships',
        '`:latest` images are always significantly larger than versioned images',
        'Docker Compose refuses to start any service whose image is tagged `:latest`',
      ],
      answer: 1,
    },
    {
      id: 'm9-q2',
      q: "Why does docker-compose.prod.yml replace each service's build: key with an image: pointing at Docker Hub, instead of just running docker compose build on the production VM?",
      options: [
        '`build:` is not valid syntax inside a Compose file',
        'Building requires the full application source code and a build toolchain on the VM; pulling a pre-built, already-tested image means the VM only ever needs the compose files and `.env`, and every server runs the exact same bytes',
        'Images referenced with `image:` are always smaller than ones built with `build:`',
        '`docker compose pull` is the only subcommand that supports environment variables',
      ],
      answer: 1,
    },
    {
      id: 'm9-q3',
      q: 'What does the .github/workflows/docker-publish.yml workflow actually automate for Kundapura Notice Board?',
      options: [
        'It deploys the app directly onto the production VM the moment code changes',
        'It runs the test suite only, without ever touching Docker Hub',
        'On every push to `main`, it logs into Docker Hub and builds + pushes fresh `server` and `client` images with both a `:latest` and a commit-sha tag, without a human running `docker login`/`tag`/`push` by hand',
        'It only ever runs once, the first time the repository is created',
      ],
      answer: 2,
    },
    {
      id: 'm9-q4',
      q: 'You run a flag-free `docker system prune` on the production VM. What actually gets removed?',
      options: [
        'Every image on the host, including ones still in use by a running container',
        'Stopped containers, unused networks, dangling (untagged) images, and unused build cache — but not images still tagged and simply idle, and not any volumes',
        'Every named volume, including `mongo-data`',
        'Nothing at all — `docker system prune` requires `-a` to remove anything',
      ],
      answer: 1,
    },
    {
      id: 'm9-q5',
      q: 'When deploying Kundapura Notice Board to a fresh Ubuntu VM, what should actually be copied over from your development machine?',
      options: [
        'The entire git repository, including `node_modules` and `.git`, so the VM can rebuild the images if needed',
        'Only `docker-compose.yml`, `docker-compose.prod.yml`, and `.env` — the VM pulls the already-built `server` and `client` images from Docker Hub rather than building them locally',
        'Just the `.env` file; Compose auto-detects which images to run without any compose file at all',
        "Only the Dockerfiles, so the VM can build its own images from scratch",
      ],
      answer: 1,
    },
  ],
}
