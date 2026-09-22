// Module 4 — Docker Networking
// Kundapura Notice Board so far: server and mongo are connected the clunky way —
// grabbing mongo's container IP via `docker inspect`, or the deprecated `--link`
// flag. This module replaces that for good with a proper user-defined bridge
// network, `noticeboard-net`, and Docker's built-in DNS so server reaches Mongo
// simply at the hostname `mongo`. It also tightens security by no longer
// publishing Mongo's port to the host, and teaches `docker network inspect` /
// `docker exec` troubleshooting. This exact network name and hostname
// convention carries forward into every remaining module.

export const m4 = {
  id: 'm4',
  title: 'Docker Networking',
  hours: 6,
  color: 'from-rose-500/20 to-rose-700/10',
  accent: 'rose',
  description:
    'The **Kundapura Notice Board** stack currently limps along on a fragile hack: the `server` container finds `mongo` by grabbing its container IP with `docker inspect`, or via the deprecated `--link` flag — both break the moment a container restarts and gets a new IP. This module fixes that for good. You will learn how Docker\'s **default bridge network** actually works (and why it has no built-in name resolution), create a proper **user-defined bridge network** named `noticeboard-net`, and connect `server` and `mongo` to it so Docker\'s embedded DNS resolves the hostname `mongo` straight to the right container — no IPs, no `--link`, ever again. Along the way you will also tighten security by no longer publishing Mongo\'s port to the host machine, and learn to troubleshoot connectivity with `docker network inspect` and `docker exec`.',
  sections: [
    {
      id: 'm4-s1',
      title: 'Container-to-Container Communication',
      topics: [
        {
          id: 'm4-t1',
          title: 'Docker\'s default bridge network and its limits (why --link was a hack)',
          explain:
            'Every container you start with a plain `docker run` (no `--network` flag) joins Docker\'s built-in `bridge` network by default, where containers get an IP address but cannot look each other up by name — which is exactly the gap that the old `--link` flag and manual `docker inspect` IP-copying tried, badly, to paper over.',
          analogy:
            'Picture the Kundapura harbour on a normal fishing morning before any proper stall registry existed: every boat that docks gets waved to whichever numbered mooring post happens to be free that day — post 4 today, post 11 tomorrow. If you want the boat selling bangude (mackerel), you cannot just shout "bangude boat" and expect anyone to point you there; you have to walk the entire pier reading post numbers until you spot it yourself, and by the next morning the numbers have all shuffled again. That numbered-post-only, no-names-announced system is Docker\'s **default bridge network**. The old fix — someone scribbling "bangude is at post 11" on a chalkboard each morning before it changes — is exactly what `--link` and manual IP-copying were: a fragile note that goes stale the instant the tide turns.',
          theory:
            'When you run a container without specifying `--network`, Docker attaches it to a built-in network literally named `bridge` (visible in `docker network ls` alongside `host` and `none`). Docker creates a virtual switch on the host (`docker0`) and hands every container on it a private IP, typically in the `172.17.0.0/16` range, via DHCP-like assignment.\n\nContainers on this default `bridge` network **can** talk to each other — but only by IP address. Docker deliberately does not run its embedded DNS resolver on the default bridge network, so `ping mongo` from inside `server` fails with something like `bad address \'mongo\'`, even though both containers are perfectly reachable by IP. This is the single most important fact in this module: name-based service discovery is a feature of **user-defined** networks, not the default one.\n\nBefore this module, Kundapura Notice Board worked around that gap in two clunky ways:\n- **Manual IP lookup**: running `docker inspect mongo --format \'{{.NetworkSettings.IPAddress}}\'`, copying the printed IP, and hardcoding it into `MONGO_URI`. Recreate the `mongo` container for any reason — an upgrade, a crash, a `docker compose down` — and it is very likely to get a different IP next time, silently breaking `server`.\n- **The deprecated `--link` flag**: `docker run --link mongo:mongo server-image` used to inject an `/etc/hosts` entry and some environment variables into the linked container at startup time only. It was one-directional, snapshotted once, never updated on restart, and Docker\'s own documentation has marked it legacy for years — it may be removed from the CLI entirely in a future release.\n\nBoth workarounds share the same root problem: they fight the default bridge network\'s lack of DNS instead of fixing it. The real fix, covered in the next two topics, is to stop using the default bridge network for `server` and `mongo` altogether.',
          whyItMatters:
            'Every "why is my container connection suddenly broken" bug report on Docker forums traces back to exactly this: someone hardcoded an IP, or relied on `--link`, and a container restart quietly changed the address underneath them. Understanding why the default bridge network cannot resolve names is what makes the fix in the next topic feel inevitable rather than magic — you are not learning a trick, you are fixing the actual limitation.',
          steps: [
            'Start a `mongo` container the old way: `docker run -d --name mongo mongo:7` (no `--network` flag, so it lands on the default bridge).',
            'Start a throwaway Alpine container on the same default network: `docker run -it --rm alpine sh`.',
            'Inside it, try `ping mongo` and read the failure message carefully.',
            'Run `docker inspect mongo --format \'{{.NetworkSettings.IPAddress}}\'` from another terminal to get Mongo\'s current IP.',
            'Back inside the Alpine shell, ping that IP directly and confirm it succeeds — proving containers on the default bridge reach each other by IP, just not by name.',
            'Stop and remove the `mongo` container, start a fresh one, and re-run the IP lookup — confirm the IP changed.',
          ],
          code: `# Old-style start - no --network flag means "default bridge" by default
docker run -d --name mongo mongo:7

# A throwaway container on the same default network, to test from "inside"
docker run -it --rm alpine sh

/ # ping mongo
ping: bad address 'mongo'
# Docker's embedded DNS does NOT run on the default bridge network

# From a second terminal, look up mongo's IP the old, fragile way:
docker inspect mongo --format '{{.NetworkSettings.IPAddress}}'
# -> 172.17.0.2

# Back in the alpine shell, ping by IP instead - this works:
/ # ping -c 2 172.17.0.2
PING 172.17.0.2 (172.17.0.2): 56 data bytes
64 bytes from 172.17.0.2: seq=0 ttl=64 time=0.114 ms
64 bytes from 172.17.0.2: seq=1 ttl=64 time=0.096 ms

# Now recreate mongo and prove the IP is NOT stable across restarts:
docker rm -f mongo
docker run -d --name mongo mongo:7
docker inspect mongo --format '{{.NetworkSettings.IPAddress}}'
# -> 172.17.0.3  (different address - anything hardcoded to .2 just broke)`,
          pitfalls: [
            '**Assuming a container name always doubles as a working hostname.** On the default `bridge` network it does not — name resolution only works on user-defined networks. Fix: never rely on `ping <container-name>` succeeding until you have confirmed which network you are on.',
            '**Hardcoding Mongo\'s IP address into `MONGO_URI` after one `docker inspect` lookup.** It looks fine until the container restarts and gets a new IP, silently breaking the app with a connection timeout. Fix: never hardcode a container IP anywhere; treat it as ephemeral.',
            '**Reaching for the `--link` flag in any new setup because an old tutorial uses it.** It is deprecated, one-directional, and only ever snapshots `/etc/hosts` once at startup. Fix: use a user-defined bridge network instead (next topic) — `--link` has no place in anything written today.',
            '**Believing the default bridge network provides useful isolation between projects.** Every container that omits `--network` lands on the same default bridge, regardless of which project it belongs to. Fix: give each project its own user-defined network so unrelated containers cannot casually reach each other.',
            '**Confusing "containers can reach each other by IP" with "the setup is fine."** IP reachability on the default bridge is real, but it is exactly as fragile as writing a phone number on your palm before it washes off. Fix: judge a networking setup by whether it survives a container restart, not by whether it works right now.',
            '**Testing connectivity with `ping` and stopping there.** `ping` uses ICMP, a different protocol from MongoDB\'s actual wire protocol over TCP — a passing ping does not guarantee the real service port is reachable. Fix: treat `ping` as a first sanity check only, and confirm the real thing (Topic 5) separately.',
          ],
          tryIt:
            'Start a `mongo:7` container with a plain `docker run -d --name mongo mongo:7` (no `--network` flag), then run a throwaway `docker run -it --rm alpine sh` and try `ping mongo` inside it. Confirm it fails, then look up Mongo\'s IP with `docker inspect` and ping that IP instead to confirm it succeeds — proving name resolution, not connectivity, is the missing piece.',
          takeaway:
            'The default `bridge` network gives containers real IP-level connectivity but no name resolution, which is exactly the gap that fragile IP-copying and the deprecated `--link` flag were hacks around.',
        },
        {
          id: 'm4-t2',
          title: 'Creating a user-defined bridge network: docker network create noticeboard-net',
          explain:
            'Run `docker network create noticeboard-net` to make a dedicated virtual network for the Kundapura Notice Board stack, list it with `docker network ls`, and attach containers to it either at creation time (`--network noticeboard-net`) or afterward with `docker network connect`.',
          analogy:
            'Now imagine the Kundapura Fisheries Cooperative finally installs a proper stall registry at the harbour: every vendor gets a fixed, named board — "Prawns", "Bangude", "Anchovies" — nailed above their spot, and a master directory at the entrance lists exactly who is registered on this pier today. That named, permanent registry is what `docker network create noticeboard-net` sets up: a private pier, separate from the chaotic public mooring posts of the default bridge, where every boat that registers gets a name buyers can actually call out and be understood.',
          theory:
            '`docker network create noticeboard-net` creates a brand-new virtual network using Docker\'s `bridge` driver by default — its own private subnet, its own gateway, and critically, its own embedded DNS resolver that user-defined networks get for free. Run `docker network ls` afterward and you will see it listed alongside the built-in `bridge`, `host`, and `none` networks, each with a short network ID and driver type.\n\nThere are two ways to get a container onto this network:\n- **At creation time** (preferred going forward): `docker run --network noticeboard-net --name mongo mongo:7`. The container joins the network immediately as it starts, and its name is registered with the network\'s DNS the moment it is up.\n- **After the fact, on an already-running container**: `docker network connect noticeboard-net <container-name>`. Useful for attaching an existing container without recreating it, though for Kundapura Notice Board the cleaner path is simply recreating both `mongo` and `server` with `--network` from the start, since a fresh, correctly-configured container beats patching a half-configured one.\n\nA container can be attached to more than one network at once — useful later when, say, a reverse proxy needs to reach both `server` and some other stack — but for now `noticeboard-net` is the only network either container needs. Detach a container from a network with `docker network disconnect noticeboard-net <container-name>`, and remove the network entirely with `docker network rm noticeboard-net` once nothing is attached to it (Docker refuses to remove a network with active endpoints, which is a useful safety rail, not a bug to fight).\n\nNaming the network exactly `noticeboard-net` matters beyond this module: Module 5 attaches the new client container to this same network, and Module 6\'s Compose file will create (or expect) a network by a related name — consistency here saves confusion later.',
          whyItMatters:
            'This one `docker network create` command is the actual fix for everything Topic 1 diagnosed as broken. Every container attached to `noticeboard-net` from here on gets free, automatic name resolution — no more IP-copying, no more `--link`. It is also the exact network Module 5\'s client container and Module 6\'s Compose stack will plug into, so getting the name and habit right now pays off for the rest of the course.',
          steps: [
            'Create the network: `docker network create noticeboard-net`.',
            'Confirm it exists: `docker network ls` and look for `noticeboard-net` with driver `bridge`.',
            'Remove any old `mongo` container running on the default bridge: `docker rm -f mongo`.',
            'Recreate Mongo attached to the new network from the start: `docker run -d --network noticeboard-net --name mongo -v mongo-data:/data/db mongo:7`.',
            'Confirm the container is really attached: `docker network inspect noticeboard-net` should list `mongo` under `Containers`.',
            'Repeat the same pattern for `server` once its `MONGO_URI` is updated in the next topic.',
          ],
          code: `# Create the dedicated network for the whole stack
docker network create noticeboard-net
# -> 8f2e4a9c1b3d... (a new network ID)

# Confirm it is registered alongside Docker's built-in networks
docker network ls
# NETWORK ID     NAME               DRIVER    SCOPE
# 8f2e4a9c1b3d   noticeboard-net    bridge    local
# 7a1c0e223344   bridge             bridge    local
# 9b6f11a02abc   host               host      local
# 0c5d99f10ee1   none               null      local

# Remove the old default-bridge mongo container from Module 3
docker rm -f mongo

# Recreate mongo attached to noticeboard-net from the start,
# keeping the mongo-data volume from Module 3 so notices are not lost
docker run -d --network noticeboard-net --name mongo -v mongo-data:/data/db mongo:7

# Confirm mongo is really registered on the new network
docker network inspect noticeboard-net --format '{{json .Containers}}'
# -> {"<container-id>":{"Name":"mongo","IPv4Address":"172.20.0.2/16", ...}}`,
          pitfalls: [
            '**Forgetting `--network noticeboard-net` when recreating a container.** It silently lands back on the default bridge network, and every fix from this module quietly stops working again. Fix: make `--network noticeboard-net` a permanent habit for every `docker run` in this stack from now on.',
            '**Typo-ing the network name** — `noticeboard_net` (underscore) or `notice-board-net` instead of `noticeboard-net`. Docker creates two entirely separate networks, and containers on one cannot resolve names on the other. Fix: copy-paste the exact name, and double-check with `docker network ls` after creating.',
            '**Trying to `docker network rm noticeboard-net` while containers are still attached.** Docker refuses with "has active endpoints" — this is a safety feature, not a bug. Fix: stop/remove the attached containers first, or `docker network disconnect` them.',
            '**Forgetting the `mongo-data` volume from Module 3 when recreating the Mongo container.** Recreating without `-v mongo-data:/data/db` starts Mongo with a brand-new, empty data directory. Fix: always keep the same `-v mongo-data:/data/db` flag when recreating Mongo, network change or not.',
            '**Assuming `docker network connect` restarts the container or refreshes its environment variables.** It only attaches the network interface; any environment variable like `MONGO_URI` that the app already read at startup will not magically update. Fix: for a config change like the hostname in `MONGO_URI`, recreate the container rather than just connecting it.',
            '**Creating a second, near-duplicate network by accident** (e.g. running `docker network create` twice without checking first). Extra unused networks clutter `docker network ls` and invite confusion about which one containers are actually on. Fix: always run `docker network ls` first to check whether it already exists.',
          ],
          tryIt:
            'Run `docker network create noticeboard-net`, then `docker network ls` to confirm it appears with driver `bridge`. Recreate your `mongo` container attached to it (`docker run -d --network noticeboard-net --name mongo -v mongo-data:/data/db mongo:7`), and confirm with `docker network inspect noticeboard-net` that `mongo` shows up under `Containers` with an IP address on the new network subnet.',
          takeaway:
            '`docker network create noticeboard-net` builds a dedicated network with its own DNS; attach containers to it with `--network` at creation (preferred) or `docker network connect` afterward, and always double-check with `docker network ls` and `docker network inspect`.',
        },
        {
          id: 'm4-t3',
          title: 'Service discovery by container name — connecting server to mongo via MONGO_URI=mongodb://mongo:27017/noticeboard',
          explain:
            'On a user-defined network, Docker runs an embedded DNS server that automatically resolves a container\'s `--name` (or its Compose service name, later) to its current internal IP — so `server` can reach Mongo simply by connecting to the hostname `mongo`, and `MONGO_URI` becomes `mongodb://mongo:27017/noticeboard` for good.',
          analogy:
            'With the new stall registry up at the harbour, a buyer no longer needs to know which mooring post the bangude boat is tied to today — they walk up to the registry desk, say "bangude", and the attendant (Docker\'s embedded DNS) instantly points them to whichever post that boat currently occupies, even if it moved since yesterday. The buyer never learns or cares about the post number; they only ever ask for the boat by name. `MONGO_URI=mongodb://mongo:27017/noticeboard` is the `server` container asking for "mongo" by name, every single time, and trusting the registry to find the current address.',
          theory:
            'Every container attached to a user-defined bridge network gets its `/etc/resolv.conf` pointed at Docker\'s internal DNS server, which listens inside the container at `127.0.0.11`. When `server` tries to connect to the hostname `mongo`, that request goes to `127.0.0.11` first, which checks the network\'s internal registry of container names and resolves `mongo` to whatever IP that container currently holds — then the connection proceeds normally over TCP. If the `mongo` container is ever removed and recreated (even with a different IP), the DNS entry updates automatically the moment the new container joins the network under the same name; `server` never needs to know or care that anything changed.\n\nThis is the piece that fixes everything from Topic 1: instead of `docker inspect`-ing an IP or relying on the deprecated `--link` flag, the connection string simply becomes `mongodb://mongo:27017/noticeboard` — `mongo` here is a **hostname**, resolved fresh by Docker\'s DNS on every connection attempt, not a value baked in once. The port, `27017`, is Mongo\'s standard listening port, reached over the container network directly (no `-p` publishing needed for `server` to reach it — that is Topic 4).\n\nThis only works because both `server` and `mongo` are on `noticeboard-net` together. A container on a different network, or on the plain default bridge, cannot resolve `mongo` this way — the embedded DNS scope is per-network, matching the isolation `docker network create` gave us in the last topic. Mongoose (the ODM the Express app uses) treats this connection string exactly like any other MongoDB URI; from its point of view, `mongo` is just a normal hostname, no different from `localhost` or a real domain name — it has no idea, and does not need to, that Docker is resolving it under the hood.',
          diagram: `graph TD
    Browser["Host machine<br/>curl / browser to localhost:5000"]
    subgraph net["noticeboard-net (user-defined bridge network)"]
        Server["server container<br/>Express API, port 5000"]
        Mongo["mongo container<br/>MongoDB, port 27017"]
    end
    Browser -->|"published port -p 5000:5000"| Server
    Server -->|"connects to hostname mongo<br/>Docker DNS resolves it to Mongo's current IP"| Mongo`,
          flowExplain:
            'The browser or `curl` only ever talks to the published port on the host, `5000`, which Docker forwards straight into the `server` container. Inside `noticeboard-net`, `server` never touches an IP address directly — it asks for the hostname `mongo`, and Docker\'s embedded DNS resolves that name to whichever IP the `mongo` container currently holds, even across restarts.',
          whyItMatters:
            'This is the actual payoff of the whole module: `server` finds `mongo` correctly every single time, through restarts, recreations, and even a full stack teardown-and-rebuild, because the connection is name-based rather than IP-based. This exact hostname convention — container name as DNS name — is what Module 5\'s client container relies on to reach `server`, and what Module 6\'s Compose file formalizes for the whole stack, so getting comfortable with it here matters well beyond this module.',
          steps: [
            'Update the server\'s environment so `MONGO_URI=mongodb://mongo:27017/noticeboard` (no more IP, no more Atlas URL from earlier modules).',
            'Remove the old `server` container if one is running: `docker rm -f server`.',
            'Start `server` attached to `noticeboard-net` with the new `MONGO_URI`: `docker run -d --network noticeboard-net --name server -p 5000:5000 -e MONGO_URI=mongodb://mongo:27017/noticeboard -e PORT=5000 noticeboard-server`.',
            'Check the server\'s logs for a successful Mongo connection message: `docker logs server`.',
            'Test the API end to end: create, list, and delete a notice, all via `curl` against `localhost:5000`.',
            'Recreate the `mongo` container (forcing a new internal IP) and confirm `server`, once restarted, still connects with zero code or config changes.',
          ],
          code: `# .env (or -e flags) for the server container - hostname, not an IP, not Atlas
MONGO_URI=mongodb://mongo:27017/noticeboard
PORT=5000
NODE_ENV=development

# Remove any old server container and start a fresh one on noticeboard-net
docker rm -f server
docker run -d --network noticeboard-net --name server -p 5000:5000 -e MONGO_URI=mongodb://mongo:27017/noticeboard -e PORT=5000 -e NODE_ENV=development noticeboard-server

# Check the logs - Mongoose should confirm the connection succeeded
docker logs server
# Server listening on port 5000
# MongoDB connected: mongo:27017/noticeboard

# Full CRUD test straight from the host machine, through the published port
curl -X POST http://localhost:5000/api/notices -H "Content-Type: application/json" -d '{"title":"Fish market opens early","message":"Bangude arriving 6am at Gangolli jetty","category":"Fish Market","postedBy":"Ganesh"}'
# -> {"_id":"64f1a2b3c4d5e6f7a8b9c0d1","title":"Fish market opens early", ...}

curl "http://localhost:5000/api/notices?category=Fish%20Market"
# -> [{"_id":"64f1a2b3c4d5e6f7a8b9c0d1","title":"Fish market opens early", ...}]

curl -X DELETE http://localhost:5000/api/notices/64f1a2b3c4d5e6f7a8b9c0d1
# -> {"message":"Notice removed"}`,
          pitfalls: [
            '**Leaving an old Atlas connection string or a hardcoded IP in `MONGO_URI`.** The server container starts but every database call times out or throws a connection error. Fix: update `MONGO_URI` to `mongodb://mongo:27017/noticeboard` explicitly, and confirm with `docker exec server env`.',
            '**Typing the hostname wrong** — `mongoo`, a different casing than the actual `--name`, or a trailing space pasted from somewhere. Docker\'s DNS simply cannot resolve a name that does not exist, and the error clearly says so. Fix: match the hostname to the exact `--name` used when starting the Mongo container, character for character.',
            '**Only attaching `server` to `noticeboard-net` and forgetting `mongo` needs to be on it too.** Name resolution requires both containers on the same network. Fix: confirm both with `docker network inspect noticeboard-net` before troubleshooting anything else.',
            '**Using the Mongo container\'s ID instead of its name in `MONGO_URI`.** Docker\'s embedded DNS resolves registered container names (and network aliases), not raw container IDs. Fix: always reference `mongo` by the `--name` it was started with.',
            '**Changing `MONGO_URI` in a `.env` file but not restarting the `server` container.** Environment variables are read once at container startup; editing the file does nothing to an already-running container. Fix: recreate or restart the `server` container after any env change.',
            '**Assuming this DNS resolution works across unrelated Docker networks or projects on the same machine.** A container on a different, unrelated user-defined network cannot resolve `mongo` from `noticeboard-net` — the DNS scope is strictly per-network. Fix: keep every container that needs to reach Mongo on `noticeboard-net` specifically.',
          ],
          tryIt:
            'Set `MONGO_URI=mongodb://mongo:27017/noticeboard` on the `server` container (attached to `noticeboard-net`), restart it, and confirm `docker logs server` shows a successful Mongo connection. Then create, list, and delete a notice with `curl` against `localhost:5000` to prove the whole path — host to server to mongo — works end to end using only the hostname `mongo`.',
          takeaway:
            'On a user-defined network, Docker\'s embedded DNS resolves a container\'s name to its current IP automatically, which is exactly why `MONGO_URI=mongodb://mongo:27017/noticeboard` keeps working through restarts, recreations, and IP changes with zero code changes.',
        },
      ],
    },
    {
      id: 'm4-s2',
      title: 'Locking It Down',
      topics: [
        {
          id: 'm4-t4',
          title: 'Only publish the ports you must — stop exposing Mongo\'s 27017 to the host',
          explain:
            'Since `server` now reaches `mongo` over `noticeboard-net` using the hostname `mongo`, Mongo no longer needs `-p 27017:27017` published to the host machine at all — only `server`\'s port needs to be reachable from outside Docker, and every other port should stay private to the container network.',
          analogy:
            'Think of the cold-storage room at the back of the Kundapura fish market, the one where the day\'s unsold catch is kept on ice. Only the market staff (the `server` container) ever need to walk in and out of that room; there is no reason to leave the back door propped open onto the public street just in case someone might want to peek at the ice. Publishing Mongo\'s port `27017` to the host is exactly that propped-open back door — it lets anyone who can reach the host machine\'s network try to talk to the database directly, when the only door that ever needed to open onto the street is the market\'s front counter (`server`, on port `5000`).',
          theory:
            'Docker\'s `-p hostPort:containerPort` flag does one specific thing: it forwards traffic arriving at the host machine\'s network interface on `hostPort` into the container\'s `containerPort`. Without `-p`, a container\'s port is still reachable — but only from other containers on the same Docker network, never from the host machine or anything beyond it. This is precisely the boundary Kundapura Notice Board needs: `server` must be reachable from a browser (so it keeps `-p 5000:5000`), but `mongo` only ever needs to be reached by `server`, over `noticeboard-net`, and never by anything on the host or the wider network.\n\nA subtlety worth being precise about: the Dockerfile\'s `EXPOSE 27017` (present in the official `mongo` image) is purely **documentation** for humans and tooling — it does not publish anything by itself. Publishing only ever happens via the `-p` flag on `docker run` (or the `ports:` section in Compose, Module 6). So dropping `-p 27017:27017` from the `mongo run` command is the entire fix — no Dockerfile change needed.\n\nWhy this matters for security specifically: `-p` typically binds to `0.0.0.0` on the host by default, meaning every network interface on that machine — not just `localhost`. On a shared dev machine, or worse, a cloud VM with a permissive firewall, that can mean Mongo\'s port is reachable from your local Wi-Fi network or, in the worst case, the open internet. The Kundapura Notice Board Mongo instance, as set up so far, runs with no authentication enabled — so a reachable port `27017` is not just an inconvenience, it is a direct path to read, modify, or delete every notice in the database from outside Docker entirely. The fix costs nothing: since `server` reaches `mongo` over the container network regardless of whether `-p` is present, removing `-p 27017:27017` breaks nothing the app needs and closes a real hole.',
          whyItMatters:
            'This is the single cheapest security improvement in the entire Docker networking story: one flag removed, zero functionality lost, and an entire attack surface — an unauthenticated database port reachable from outside Docker — gone. The instinct to apply everywhere from here on is: publish only the port a human or an outside system genuinely needs to reach, and let the container network handle everything internal.',
          steps: [
            'Stop and remove the current Mongo container: `docker rm -f mongo`.',
            'Recreate it attached to `noticeboard-net` without any `-p` flag: `docker run -d --network noticeboard-net --name mongo -v mongo-data:/data/db mongo:7`.',
            'From the host machine (not inside any container), try connecting directly: `mongosh mongodb://localhost:27017` and confirm it is refused.',
            'Confirm `docker ps` shows no `0.0.0.0:27017->27017/tcp` entry for the `mongo` container.',
            'From the browser or `curl`, exercise the full API — list, create, delete notices — through `server`\'s published port `5000` and confirm everything still works.',
            'Repeat the same "publish only what is needed" thinking for `server` itself: confirm it keeps `-p 5000:5000` since the browser genuinely needs to reach it.',
          ],
          code: `# Remove the Mongo container that still publishes 27017 to the host
docker rm -f mongo

# Recreate it WITHOUT any -p flag at all - server reaches it over noticeboard-net instead
docker run -d --network noticeboard-net --name mongo -v mongo-data:/data/db mongo:7

# Confirm there is no host port mapping for mongo anymore
docker ps --filter name=mongo --format "table {{.Names}}\\t{{.Ports}}"
# NAMES     PORTS
# mongo     27017/tcp
# (no "0.0.0.0:27017->27017/tcp" prefix - not published to the host)

# Prove it from the HOST machine directly (not inside any container):
mongosh mongodb://localhost:27017
# MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
# (exactly what we want - the host can no longer reach mongo directly)

# But the app itself still works perfectly through server's published port:
curl http://localhost:5000/api/notices
# -> [{"_id":"64f1a2b3c4d5e6f7a8b9c0d1","title":"Fish market opens early","category":"Fish Market", ...}]`,
          pitfalls: [
            '**Keeping `-p 27017:27017` "just in case I need to peek at the data."** That single habit is the whole security hole. Fix: use `docker exec -it mongo mongosh` to inspect data from inside the container instead of publishing the port to the host.',
            '**Believing `EXPOSE 27017` in the Mongo image\'s Dockerfile means the port is published.** `EXPOSE` is documentation only; publishing happens exclusively via `-p` on `docker run` (or Compose\'s `ports:`). Fix: do not confuse the two — check `docker ps` for the actual published-port column, not the Dockerfile.',
            '**Running Mongo with `-p 27017:27017` on a cloud VM or shared network with a permissive firewall.** Combined with Mongo\'s default no-authentication setup, this can expose every notice to anyone who finds the port. Fix: never publish a database port to the host unless a tool outside Docker genuinely needs direct access.',
            '**Assuming removing `-p` breaks `server`\'s connection to `mongo`.** Container-to-container traffic over `noticeboard-net` has nothing to do with host port publishing — those are two separate layers entirely. Fix: trust that `server` still connects fine via the `mongo` hostname regardless of `-p`.',
            '**Forgetting to double-check with `docker ps` after the change.** It is easy to assume a flag removal worked without actually confirming the port column changed. Fix: always run `docker ps --filter name=mongo` and read the `PORTS` column after any change like this.',
            '**Applying the "publish nothing" instinct too broadly and removing `-p 5000:5000` from `server` too.** Unlike Mongo, the browser genuinely needs to reach `server` directly from the host. Fix: publish only the ports something outside Docker truly needs — for this stack, that is `server`\'s port, not Mongo\'s.',
          ],
          tryIt:
            'Recreate the `mongo` container attached to `noticeboard-net` with no `-p` flag at all, then try `mongosh mongodb://localhost:27017` (or any Mongo GUI tool) directly from your host machine and confirm the connection is refused. Then run the full notice board API flow through `curl http://localhost:5000/api/notices` and confirm it still works perfectly — proof the app never needed Mongo\'s port open to the host in the first place.',
          takeaway:
            'Publish only the ports something outside Docker genuinely needs to reach — `server`\'s `5000` stays published for the browser, but `mongo`\'s `27017` can and should stay off the host entirely now that `server` reaches it over `noticeboard-net`.',
        },
        {
          id: 'm4-t5',
          title: 'docker network inspect and troubleshooting connectivity with docker exec + ping/curl between containers',
          explain:
            'Use `docker network inspect noticeboard-net` to see exactly which containers are attached and their current IPs, and `docker exec -it <container> sh` to get an interactive shell inside a running container and test connectivity to another container directly, with `ping`, `getent hosts`, or a raw HTTP request.',
          analogy:
            'When a buyer at the Kundapura harbour insists the registry desk sent them to the wrong post, the harbour master does not guess — they open the actual logbook (`docker network inspect`) and read exactly who is registered where right now. And when something still feels off, an experienced dock-hand walks down personally (`docker exec -it server sh`), calls out the vendor\'s name themselves (`ping mongo` or `getent hosts mongo`), and confirms with their own eyes whether the registry\'s answer actually holds up — rather than trusting the paperwork blindly.',
          theory:
            '`docker network inspect noticeboard-net` prints a JSON document describing the network: its driver, subnet, gateway, and — most useful for troubleshooting — a `Containers` object listing every attached container by ID, with its `Name` and `IPv4Address`. This is the first place to look whenever something seems disconnected: is the container you expect actually listed here at all? If `mongo` is missing from this list, no amount of DNS troubleshooting inside `server` will help — it was never attached to the network in the first place.\n\nWhen the network inspection looks correct but the app still cannot connect, the next tool is `docker exec -it <container> sh` — it opens an interactive shell inside an already-running container (Alpine-based images like `node:20-alpine` use `sh`, not `bash`, since Alpine\'s minimal `busybox` does not include a full Bash). From inside `server`\'s shell:\n- `getent hosts mongo` asks the container\'s own DNS resolver to look up `mongo` and prints the IP it resolves to — this isolates just the DNS layer, with no networking or Mongo-protocol concerns mixed in.\n- `ping mongo` (if available) tests basic reachability over ICMP.\n- A raw request to Mongo\'s actual port proves more than a ping ever can, since ping uses a completely different protocol than MongoDB\'s wire protocol.\n\nOne very real practical snag: `node:20-alpine` does not ship `ping` or `curl` by default — Alpine images are intentionally minimal. Rather than installing extra tools mid-debugging, `getent hosts mongo` (bundled with `busybox`) is usually enough to confirm DNS is working; if you specifically need to test the TCP port is open, `apk add --no-cache curl` (or `wget`, which is more likely already present) inside the container gets you a proper HTTP-level check for one debugging session. Whatever the exact tool, the debugging order that works every time is: first, is the container even in `docker network inspect`\'s list; second, does `getent hosts mongo` resolve to an IP; third, is something actually listening on that IP\'s port — and only after all three check out does the bug live in the application code rather than the network.',
          whyItMatters:
            'Networking bugs are uniquely frustrating because the error message ("connection refused", "getaddrinfo ENOTFOUND") rarely tells you which of the three layers — attachment, DNS, or the actual service — is broken. Knowing to check `docker network inspect` first, then `getent hosts` from inside the container, turns a confusing guessing game into a fast, ordered checklist you will reuse for every container networking issue for the rest of this course, including Module 5\'s client-to-server connection.',
          steps: [
            'Run `docker network inspect noticeboard-net` and confirm both `server` and `mongo` are listed under `Containers` with distinct IPs.',
            'Open a shell inside the running `server` container: `docker exec -it server sh`.',
            'From inside, run `getent hosts mongo` and confirm it prints an IP matching what `docker network inspect` showed.',
            'Deliberately mistype the hostname (`getent hosts mogno`) and read the failure, to recognize what a real typo looks like.',
            'If `ping` is available, try `ping -c 2 mongo`; if not, install a quick tool with `apk add --no-cache curl` and hit Mongo\'s port directly.',
            'Exit the shell with `exit`, and always run `docker logs mongo` too — a resolvable hostname does not guarantee the Mongo process itself is healthy inside the container.',
          ],
          code: `# Step 1 - check the network's own registry first
docker network inspect noticeboard-net --format '{{json .Containers}}'
# -> {
#      "a1b2c3d4e5f6": {"Name":"mongo","IPv4Address":"172.20.0.2/16"},
#      "f6e5d4c3b2a1": {"Name":"server","IPv4Address":"172.20.0.3/16"}
#    }

# Step 2 - get an interactive shell inside the running server container
docker exec -it server sh

# Step 3 - ask the container's own DNS resolver to look up mongo
/ # getent hosts mongo
172.20.0.2      mongo

# Step 4 - deliberately mistype it, to recognize a real typo's error shape
/ # getent hosts mogno
# (no output, exit code 2 - name does not resolve, almost always a typo)

# Step 5 - node:20-alpine has no curl/ping by default; install one for this session
/ # apk add --no-cache curl
/ # curl -sv telnet://mongo:27017
# * Connected to mongo (172.20.0.2) port 27017 (#0)
# -> proves the port itself is open and accepting connections, not just DNS

/ # exit

# Step 6 - always check mongo's own logs too, separately from network checks
docker logs mongo
# {"msg":"Waiting for connections","attr":{"port":27017}}`,
          pitfalls: [
            '**Jumping straight to `ping` or `curl` without first checking `docker network inspect`.** If a container was never attached to `noticeboard-net` in the first place, no amount of in-container debugging finds that. Fix: always confirm both containers are listed in `docker network inspect noticeboard-net` before going further.',
            '**Trying `bash` inside an Alpine-based container like `server`\'s `node:20-alpine` image.** Alpine ships `sh`, not `bash`, and `docker exec -it server bash` fails with an executable-not-found error. Fix: use `sh` for Alpine-based images.',
            '**Assuming `ping` or `curl` are present in a minimal image and getting stuck when the command is not found.** Alpine images are deliberately slim. Fix: use `getent hosts <name>` (built into busybox) for a pure DNS check, or `apk add --no-cache curl` for a quick one-off tool.',
            '**Typo-ing the hostname during a debugging session** (`mogno` instead of `mongo`) and misreading a simple typo as a deeper networking bug. Fix: re-read the exact hostname character by character before assuming anything more serious is wrong.',
            '**Testing against a stale or leftover container from an earlier module** that never actually joined `noticeboard-net`. Fix: run `docker ps` first to confirm you are execing into the container you think you are.',
            '**Confirming DNS resolves and stopping there, declaring the bug fixed.** A resolvable hostname only proves the network layer works — `mongo` could still have crashed or still be starting up. Fix: also check `docker logs mongo` to confirm the Mongo process itself is actually healthy and listening.',
          ],
          tryIt:
            'Run `docker network inspect noticeboard-net` and note both containers\' IPs. Then `docker exec -it server sh`, run `getent hosts mongo` and confirm the IP matches, deliberately mistype it once to see the failure, and finally check `docker logs mongo` to confirm the database process itself is healthy — not just reachable by name.',
          takeaway:
            '`docker network inspect` shows you the network\'s own source of truth for what is attached where, and `docker exec -it <container> sh` lets you verify DNS resolution and reachability from the inside, in that order, before assuming a networking bug is anything deeper.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm4-p1',
      type: 'Mini Project',
      title: 'Give the Stack a Real Network',
      domain: 'Networking',
      duration: '2-3 hrs',
      description:
        'Retire the fragile IP-copying and `--link` workarounds for good. Create the `noticeboard-net` user-defined bridge network, recreate both `mongo` and `server` attached to it (their container names now double as DNS hostnames), update `MONGO_URI` to `mongodb://mongo:27017/noticeboard`, and remove Mongo\'s host port publishing entirely. Prove the fix by running the complete notice board CRUD flow while Mongo stays deliberately unreachable from the host machine.',
      tools: ['Docker CLI', 'Docker Networks', 'MongoDB 7', 'Express', 'curl / mongosh'],
      blueprint: {
        overview:
          'By the end of Module 3, Kundapura Notice Board persists its data safely in a named volume, but `server` still finds `mongo` through a fragile IP lookup or the deprecated `--link` flag — either one breaks the instant a container restarts. This project replaces that entirely with a real, purpose-built Docker network: `noticeboard-net`. Both containers get recreated attached to it, `server` starts addressing `mongo` purely by hostname, and Mongo\'s port stops being published to the host altogether, closing an unnecessary security hole. The result is a stack whose two pieces talk to each other the way a real production Docker network is supposed to work — which is exactly the foundation Module 5 needs when the React client joins this same network.',
        functionalRequirements: [
          'A dedicated Docker network named exactly `noticeboard-net` exists, created with `docker network create noticeboard-net`.',
          'Both the `mongo` and `server` containers are recreated attached to `noticeboard-net` via `--network noticeboard-net`, keeping their existing container names (`mongo`, `server`) so those names double as DNS hostnames going forward.',
          'The `mongo` container keeps its `mongo-data` named volume from Module 3 — no data is lost across the recreation.',
          '`server`\'s `MONGO_URI` environment variable is updated to `mongodb://mongo:27017/noticeboard`, replacing any IP-based or Atlas-based value from earlier modules.',
          'The `mongo` container no longer publishes port `27017` to the host at all (`-p 27017:27017` removed entirely from its `docker run`).',
          'Full CRUD — listing, creating, and deleting notices — works end to end through `server`\'s published port `5000`, while a direct connection attempt to Mongo from the host machine (e.g. `mongosh mongodb://localhost:27017`) is refused.',
        ],
        technicalImplementation: [
          'Create the network first, before touching either container: `docker network create noticeboard-net`, confirmed with `docker network ls`.',
          'Remove the existing `mongo` and `server` containers with `docker rm -f mongo server` — recreation, not patching, is the cleanest path here.',
          'Recreate `mongo` with `docker run -d --network noticeboard-net --name mongo -v mongo-data:/data/db mongo:7` — no `-p` flag at all.',
          'Recreate `server` with `docker run -d --network noticeboard-net --name server -p 5000:5000 -e MONGO_URI=mongodb://mongo:27017/noticeboard -e PORT=5000 -e NODE_ENV=development noticeboard-server`.',
          'Verify the network attachment with `docker network inspect noticeboard-net` (both containers listed) and the connection itself with `docker logs server` (a successful Mongo-connected message).',
          'Prove the security improvement by attempting `mongosh mongodb://localhost:27017` (or any GUI tool) directly from the host and confirming it is refused, while `curl` against `server`\'s published port keeps working.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Create the network and recreate mongo on it',
            outcome:
              'noticeboard-net exists, and the mongo container is running attached to it, using its Module 3 mongo-data volume, with no port published to the host.',
            prompt:
              'Create a Docker network named exactly `noticeboard-net`. Remove the current `mongo` container and recreate it attached to this network, keeping the same `mongo-data` named volume from Module 3, and without publishing port 27017 to the host at all. Show me the exact commands, and the output of `docker network inspect noticeboard-net` confirming `mongo` is attached.',
          },
          {
            step: 2,
            label: 'Recreate server on the same network with the new MONGO_URI',
            outcome:
              'The server container is running attached to noticeboard-net, connecting to Mongo purely by hostname.',
            prompt:
              'Remove the current `server` container and recreate it attached to `noticeboard-net`, keeping its published port `5000:5000` for the host, but updating its `MONGO_URI` environment variable to `mongodb://mongo:27017/noticeboard`. Show me the exact `docker run` command and the relevant lines from `docker logs server` proving the Mongo connection succeeded.',
          },
          {
            step: 3,
            label: 'Prove full CRUD still works',
            outcome:
              'curl-based create, list, and delete requests against server all succeed, with the data actually landing in Mongo.',
            prompt:
              'Using `curl`, create a new notice through `POST http://localhost:5000/api/notices`, list it back with `GET http://localhost:5000/api/notices`, and remove it with `DELETE http://localhost:5000/api/notices/:id`. Show me each command and its response, confirming the full flow works purely through the network, with no manual IP anywhere.',
          },
          {
            step: 4,
            label: 'Prove Mongo is no longer reachable from the host',
            outcome:
              'A direct connection attempt to Mongo from the host machine fails, while the app itself keeps working.',
            prompt:
              'From your host machine (not inside any container), attempt to connect directly to Mongo with `mongosh mongodb://localhost:27017` (or a GUI tool of your choice) and show me the resulting error. Then re-run the same `curl` CRUD flow from step 3 to prove the application itself is unaffected. Explain in your own words, referencing `noticeboard-net`, why one connection fails and the other does not.',
          },
        ],
        deliverable:
          'A running Kundapura Notice Board stack where `mongo` and `server` are both attached to `noticeboard-net`, `server` connects using `MONGO_URI=mongodb://mongo:27017/noticeboard` and nothing else, and Mongo\'s port `27017` is not published to the host at all — confirmed by a refused direct connection attempt alongside a fully working `curl` CRUD flow through `server`. With this in place, `server` and `mongo` now talk cleanly over a real network instead of a fragile IP hack — next module brings the React frontend into a container of its own and onto this exact same `noticeboard-net`, so it can reach `server` the identical way `server` now reaches `mongo`: by name, not by address.',
      },
    },
  ],
  quiz: [
    {
      id: 'm4-q1',
      q: 'Why does `ping mongo` fail from a container on Docker\'s default `bridge` network, even though pinging Mongo\'s IP address directly succeeds?',
      options: [
        'Mongo does not respond to ping requests by design',
        'The default bridge network does not run Docker\'s embedded DNS, so container names are not resolvable there — only user-defined networks get that',
        'The default bridge network blocks all container-to-container traffic entirely',
        'ping only works for containers started with --link',
      ],
      answer: 1,
    },
    {
      id: 'm4-q2',
      q: 'After running `docker network create noticeboard-net`, which command actually attaches a container to it at startup?',
      options: [
        'docker run --link noticeboard-net --name mongo mongo:7',
        'docker run --network noticeboard-net --name mongo mongo:7',
        'docker network attach mongo noticeboard-net',
        'It happens automatically for every container on the host',
      ],
      answer: 1,
    },
    {
      id: 'm4-q3',
      q: 'Once both `server` and `mongo` are attached to `noticeboard-net`, what does `MONGO_URI=mongodb://mongo:27017/noticeboard` rely on to work?',
      options: [
        'A hardcoded IP address stored inside the server image',
        'Docker\'s embedded DNS on the user-defined network resolving the hostname "mongo" to whatever IP that container currently holds',
        'The deprecated --link flag running in the background',
        'Mongo\'s port being published to the host with -p 27017:27017',
      ],
      answer: 1,
    },
    {
      id: 'm4-q4',
      q: 'Why can Mongo\'s port `27017` be safely left unpublished (no `-p 27017:27017`) once `server` and `mongo` share `noticeboard-net`?',
      options: [
        'Because Mongo only accepts connections from localhost regardless of networking',
        'Because publishing is required only for containers that outside clients (like a browser) must reach directly — server already reaches mongo over the shared container network without any -p flag',
        'Because -p flags are ignored for any image based on mongo:7',
        'Because EXPOSE 27017 in Mongo\'s Dockerfile automatically secures the port',
      ],
      answer: 1,
    },
    {
      id: 'm4-q5',
      q: 'What does `docker network inspect noticeboard-net` show that is most useful when troubleshooting a connectivity issue?',
      options: [
        'The full source code of both containers',
        'A list of the containers actually attached to that network, each with its current IP address',
        'The contents of the noticeboard database',
        'A history of every container that has ever used that network name',
      ],
      answer: 1,
    },
  ],
}
