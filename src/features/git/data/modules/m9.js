// Module 9 — Security, Hygiene & Capstone
// Git Mastery course content for the React course player.
// Final module: the Tide Board repo gets locked down (signing, secrets,
// .gitattributes, bloat hygiene) and the capstone runs the entire course's
// toolkit end to end on one realistic feature.

export const m9 = {
  id: 'm9',
  title: 'Security, Hygiene & Capstone',
  hours: 8,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'The course\'s final module: keeping a repository **secure** and free of bloat, and proving you can run the entire toolkit end to end. You will sign commits and tags, permanently remove a leaked secret from history with **git filter-repo**, tame line endings and diffs with `.gitattributes`, and audit a repo for size and hygiene. Then the **capstone** puts every earlier module to work on one realistic feature — branch, rebase, PR, CI, review, squash-merge, tag a release — finishing with a deliberate **reflog** recovery drill.',
  sections: [
    {
      id: 'm9-s1',
      title: 'Keeping History Clean & Safe',
      topics: [
        {
          id: 'm9-t1',
          title: 'Commit and tag signing, and what "Verified" actually checks',
          explain:
            'Signing a commit or tag with GPG or SSH cryptographically proves it was produced using a specific private key; GitHub\'s "Verified" badge surfaces that proof in the UI, and it checks less than most people assume.',
          analogy:
            'Kundapura\'s harbor office stamps a wax seal on every catch certificate, but the seal only proves the harbor officer\'s own stamp made that mark — it says nothing about whether the fish inside is actually fresh. A commit\'s "Verified" badge works the same way: it proves a specific key produced the signature, not that the code is safe, correct, or was ever reviewed.',
          theory:
            'Git can attach a cryptographic signature to a commit or an annotated tag using either GPG or, since Git 2.34, an SSH key. For GPG, you generate or already have a GPG keypair, tell Git which key to use with `git config user.signingkey <KEYID>`, and either sign one-off with `git commit -S -m "message"` or make it automatic for every commit with `git config commit.gpgsign true`. Annotated tags sign the same way with `git tag -s v1.3.0 -m "release"`. Locally you can check a signature at any time with `git log --show-signature -1`, `git verify-commit <sha>`, or `git verify-tag <tag>` — all three shell out to gpg and print whether the signature matches the commit content and whether the key is trusted in your local keyring.\n\nSSH signing reuses a key you likely already have for authentication. Set `git config gpg.format ssh` and point `user.signingkey` at a public key file (e.g. `~/.ssh/id_ed25519.pub`) instead of a GPG key ID. To verify SSH signatures locally you also need an "allowed signers" file — a plain text list mapping email addresses to public keys — referenced via `git config gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers`. Without that file, `git log --show-signature` can show that a signature exists but cannot confirm whose key produced it.\n\nWhat GitHub\'s "Verified" badge actually checks, once you push a signed commit or tag: first, that the signature is cryptographically valid over the exact bytes of that commit object; second, that the signing key — GPG or SSH — has been added to and verified on the pusher\'s or author\'s GitHub account (GPG keys live under Settings -> SSH and GPG keys; SSH signing keys are added separately from SSH auth keys in that same place). For GPG specifically, GitHub also checks that the email in the commit\'s author or committer field matches a verified email tied to that key. Because the signature covers the literal commit object — its tree, parent, author, committer, and message bytes — any history rewrite that changes those bytes, such as an interactive rebase, a `commit --amend`, or even a simple reword, invalidates the old signature completely; the rewritten commit comes out unsigned unless you resign it as part of the rewrite.\n\nWhat it does not check is the more important half of the story. "Verified" says nothing about whether the code in that commit is correct, safe, or was ever reviewed by anyone; it says nothing about whether CI passed; and it does not defend against a legitimately registered key being used by someone who stole it, or an account that is itself compromised. The badge proves one narrow fact — this exact key, which this GitHub account has proven it controls, produced this exact signature — and nothing about whether the content behind that signature can be trusted.',
          whyItMatters:
            'On Tide Board, once Asha and Ravi are both pushing to the same remote, signing turns "some commit claims to be from Ravi" into "this commit was produced by the key Ravi has registered on his GitHub account" — a meaningful upgrade for a public repo, and a hard requirement on plenty of real teams\' protected branches. Knowing exactly what the badge does and does not prove stops you from over-trusting a green "Verified" label on a pull request during review.',
          steps: [
            'Generate a GPG key (`gpg --full-generate-key`) or reuse an SSH key you already have.',
            'Tell Git which key to use: `git config user.signingkey <KEYID or path-to-pub-key>`, and set `gpg.format ssh` if signing with SSH.',
            'Turn on signing for every commit with `git config commit.gpgsign true`, or sign one commit at a time with `git commit -S`.',
            'Sign an annotated tag with `git tag -s v1.0.0 -m "first Tide Board release"`.',
            'Verify locally with `git log --show-signature -1` and `git verify-tag v1.0.0`, then push and confirm the commit/tag shows "Verified" on GitHub.',
          ],
          code: `$ git config user.signingkey AB12CD34EF56
$ git config commit.gpgsign true
$ git commit -m "Add high-tide alert banner to Tide Board homepage"
[main a1b2c3d] Add high-tide alert banner to Tide Board homepage
 1 file changed, 14 insertions(+)

$ git log --show-signature -1
commit a1b2c3d4e5f6c7d8e9f0a1b2c3d4e5f6a7b8c9d0
gpg: Signature made Wed 22 Jul 2026 09:14:02 IST
gpg:                using RSA key AB12CD34EF56
gpg: Good signature from "Thanthrajnaani <you@example.com>" [ultimate]
Author: Thanthrajnaani <you@example.com>
Date:   Wed Jul 22 09:14:02 2026 +0530

    Add high-tide alert banner to Tide Board homepage

$ git tag -s v1.0.0 -m "First public Tide Board release"
$ git verify-tag v1.0.0
gpg: Signature made Wed 22 Jul 2026 09:20:11 IST
gpg: Good signature from "Thanthrajnaani <you@example.com>" [ultimate]`,
          pitfalls: [
            '**Assuming "Verified" means the code is safe.** The badge only proves the signature matches a registered key — it says nothing about what the commit actually contains. Review the diff regardless of the badge.',
            '**Rebasing or amending a signed commit and forgetting to resign.** The signature covers the exact commit bytes, so any rewrite silently drops it; the commit shows up as unsigned even though you meant to keep it signed. Fix: keep `commit.gpgsign true` set, or pass `-S` explicitly during the rebase/amend.',
            '**Losing the private signing key.** Without it you cannot sign new commits with that identity, and depending on your setup, old signatures can become hard to re-verify if the matching public key material is also gone. Fix: back the key up somewhere safe, separate from the repo.',
            '**Mixing GPG and SSH signing across machines without matching config.** A commit signed with an SSH key on your laptop will not verify against a GPG key configured on your desktop. Fix: keep `gpg.format` and `user.signingkey` consistent per machine, or use the same key type everywhere.',
            '**Treating an unsigned commit as suspicious by default.** Most day-to-day commits, including plenty from experienced maintainers, are unsigned; "Unverified" is the normal, boring default, not a red flag on its own.',
          ],
          tryIt:
            'Sign one real commit on Tide Board with `git commit -S`, push it, and open it on GitHub to see the "Verified" badge. Then make a trivial follow-up change with `git commit --amend` but without resigning, push with `--force-with-lease`, and confirm the badge disappears — that is the signature-covers-exact-bytes rule made visible.',
          takeaway:
            'A "Verified" badge proves a specific key produced this exact commit\'s signature — nothing more, and nothing about whether the content itself is trustworthy.',
        },
        {
          id: 'm9-t2',
          title: 'Leaked secrets: why a new commit does not remove them, and how to actually fix it',
          explain:
            'A secret committed to a repo is not really "deleted" by a later commit that removes the file — it is still sitting in the tree of every earlier commit, and the real fix requires rewriting history plus rotating the secret itself.',
          analogy:
            'A rumor about tomorrow\'s fish auction price does not un-spread once you correct the notice board — every trader who already overheard it still has it. Deleting a leaked API key in a new commit is exactly that: the notice board (the latest commit) looks clean, but everyone who already cloned, fetched, or forked the repo still has the old commit sitting in their history with the secret inside it.',
          theory:
            'Git objects are content-addressed and immutable: a file added in commit X and "deleted" in commit Y still fully exists in commit X\'s tree, reachable forever by anyone who has commit X\'s SHA — which is every clone that already fetched it, every fork, and any CI runner that checked it out along the way. Deleting the file only changes what the latest commit looks like, not the history sitting underneath it.\n\nAnyone can read that old secret without any special tooling: `git log -p -- config/secrets.env` shows every version of the file across the whole history, checking out the old commit directly (`git checkout <old-sha> -- config/secrets.env`) brings it back on disk, and at the lowest level `git cat-file -p <blob-sha>` prints the raw blob content once you find its hash via `git rev-list --objects --all`. None of this is a security bypass — it is Git working exactly as designed, because history is meant to be permanent and verifiable.\n\nActually removing a secret means rewriting every commit whose tree contains it, which necessarily changes the SHA of that commit and of every commit after it. The modern tool for this is `git filter-repo` — a from-scratch rewrite that replaced the older, much slower, and easier-to-misuse `git filter-branch` — run against a fresh clone: `git filter-repo --path config/secrets.env --invert-paths` strips that path out of every commit in history. For quick one-off jobs, BFG Repo-Cleaner (`bfg --delete-files secrets.env`) does much the same thing with a simpler interface, typically run against a `--mirror` clone. Either way, every downstream commit ends up with a new SHA, so the rewritten branches and tags get force-pushed, and — critically — every other existing clone of the repo (every teammate, every CI cache, every fork) is now stale and must be re-cloned or hard-reset onto the new history rather than pulled or merged.\n\nNone of that rewrite is optional, but it is also not sufficient on its own. The secret was live in a pushed, readable commit for however long it took anyone to notice — long enough for GitHub\'s own secret scanning, a scraping bot, a search-engine cache, or anyone who happened to clone or fork the repo in that window to already have a copy. Rewriting history stops future clones from seeing it; it does nothing about copies that already left the building. The only step that actually neutralizes the exposure is rotating the secret itself — revoking the leaked key or credential at its source and issuing a fresh one — regardless of how thoroughly the history gets rewritten afterward.',
          whyItMatters:
            'Tide Board is public on GitHub from Module 1 onward, so a `.env` file with a real API key committed by mistake is not hypothetical — public repos get scraped by bots within minutes of a push. Knowing the difference between "hide it going forward" and "actually remove it from history" is the difference between a real incident response and a false sense of safety.',
          steps: [
            'Confirm the exposure: `git log -p -- config/secrets.env` (or `git log --all --full-history -- <path>`) to see every commit that touched the file.',
            'Rotate the secret first, immediately — revoke or regenerate the leaked key at its source before doing anything else.',
            'Make a fresh clone of the repo to run the rewrite against (`git filter-repo` expects a clean, disposable clone).',
            'Run `git filter-repo --path config/secrets.env --invert-paths` to strip the file from every commit in history.',
            'Force-push the rewritten history (`git push origin --force --all` and `--tags`), then tell every teammate to re-clone rather than pull.',
            'Add the file to `.gitignore` and commit a `.env.example` with placeholder values so the shape of the config stays documented without the real secret.',
          ],
          code: `$ git log -p -- config/secrets.env
commit 4f8a2c1 (HEAD -> main)
Author: Asha <asha@example.com>
Date:   Mon Jul 6 11:02:00 2026 +0530

    Remove secrets file

diff --git a/config/secrets.env b/config/secrets.env
deleted file mode 100644
index 9d3e7ab..0000000
--- a/config/secrets.env
+++ /dev/null
@@ -1 +0,0 @@
-API_KEY=YOUR_SECRET_KEY_HERE

$ git cat-file -p 9d3e7ab
API_KEY=YOUR_SECRET_KEY_HERE

$ git clone https://github.com/kundapura/tide-board.git tide-board-clean
$ cd tide-board-clean
$ git filter-repo --path config/secrets.env --invert-paths
Parsed 47 commits
New history written in 0.62 seconds; now repacking/cleaning...
Completely finished after 0.89 seconds.

$ git push origin --force --all
$ git push origin --force --tags`,
          pitfalls: [
            '**Committing a "delete secrets.env" commit and calling it fixed.** The secret is still in every commit before that one; anyone with the repo\'s history still has it. Fix: rewrite history with `git filter-repo` (or BFG), not just delete-and-commit.',
            '**Rewriting history but never rotating the actual secret.** The key was already exposed for however long it sat in a pushed commit; rewriting history does not reach into whoever already copied it. Fix: revoke and reissue the credential regardless of the history cleanup.',
            '**Running `git filter-repo` against your normal working clone.** It expects a fresh, disposable clone and will refuse or warn heavily otherwise, precisely because the rewrite is destructive to that copy\'s history. Fix: always work in a throwaway clone.',
            '**Force-pushing the rewritten history without telling the team.** Every existing clone, fork, and CI cache is now based on abandoned commits; a teammate who just runs `git pull` gets a painful merge of two unrelated histories. Fix: announce it and have everyone re-clone.',
            '**Forgetting tags and other branches.** `git filter-repo` and BFG both need to be told to rewrite everything (all branches, all tags), or a secret can survive untouched on a branch or tag nobody thought to check.',
          ],
          tryIt:
            'On a scratch clone of Tide Board, commit a fake `config/secrets.env` with a placeholder key, then commit its deletion in a follow-up commit. Confirm with `git log -p -- config/secrets.env` that the "deleted" key is still fully readable in the earlier commit. Then run `git filter-repo --path config/secrets.env --invert-paths` and confirm the file and its content are gone from every commit, including the one where it was first added.',
          takeaway:
            'Deleting a secret in a new commit only hides it from the latest snapshot; removing it for real means rewriting every historical commit that ever contained it, and rotating the secret regardless.',
        },
        {
          id: 'm9-t3',
          title: '.gitattributes deep dive: line endings, diff drivers, and export-ignore',
          explain:
            '`.gitattributes` is a committed, path-based rulebook that tells Git how to treat specific files — normalizing line endings consistently across operating systems, choosing how to diff binary or generated formats, and deciding what gets left out of a source archive.',
          analogy:
            'The Tide Board team has members on both Windows and Mac laptops. Left alone, Windows tends to save text with a carriage-return-plus-linefeed pair at the end of every line while Mac and Linux use just a linefeed — like weighing the same catch in kilograms at one counter and in an old local unit at another. If every counter reports in a different unit, the shared ledger turns into noise. `.gitattributes` is the rule that says: whatever unit you weigh in locally, the ledger itself always stores the same thing.',
          theory:
            '`core.autocrlf` controls line-ending conversion between your working directory and what actually gets stored in the repository, and it is a per-clone, per-person setting — it does not travel with the repo. Three values matter: `true` converts LF to CRLF on checkout and back to LF on commit, the typical Windows setting so files look normal in editors that expect CRLF; `input` converts CRLF to LF on commit but leaves checkout alone, common on Mac/Linux, or on Windows when you specifically do not want checked-out files converted to CRLF; `false` disables conversion entirely, storing and checking out exactly what is in the working tree. Because this is a local setting, two teammates with different `core.autocrlf` values working on the same repo can each introduce different line endings depending purely on their own config — exactly the problem `.gitattributes` solves at the repo level instead.\n\nA `.gitattributes` file at the repo root, committed alongside the code, applies the same rule to everyone who clones it, regardless of their own `core.autocrlf`. The near-universal starting line is `* text=auto`, which tells Git to auto-detect, per file, whether it looks like text and, if so, normalize its line endings to LF inside the repository\'s object store no matter what the working directory shows — while `core.autocrlf` still governs what the working directory itself looks like on checkout. On top of that baseline you add explicit per-pattern overrides: `*.sh text eol=lf` forces shell scripts to always keep LF endings even when checked out on Windows, because a CRLF-terminated shebang line breaks script execution on Linux/macOS; `*.bat text eol=crlf` forces the opposite for Windows batch files; `*.png binary` (shorthand for `-text -diff -merge`) tells Git never to attempt text normalization or line-based diffing on a genuinely binary format.\n\n`.gitattributes` can also route specific file types through a custom diff or merge tool instead of Git\'s default line-based text diff. Attach a name — `*.docx diff=word` — then define what that name means in Git config, which is not itself committed the way `.gitattributes` is: `git config diff.word.textconv "pandoc --to=plain"` tells `git diff` to convert the binary `.docx` through pandoc into readable plain text before diffing, turning an unreadable "Binary files differ" into an actual readable diff. The same mechanism works for `*.ipynb diff=ipynb` with a notebook-aware textconv, or `*.pdf diff=pdf` with `pdftotext`. Merge drivers work similarly — `CHANGELOG.md merge=union` uses Git\'s built-in "union" merge driver, which resolves conflicts on an append-only file by keeping both sides\' lines instead of raising a manual conflict, convenient for files where duplicate or reordered lines are harmless.\n\nThe `export-ignore` attribute controls what `git archive` includes when generating a tarball or zip of the repo at a given ref — which is also what GitHub uses to build the "Source code" zip/tar.gz attached to a release. Marking paths with `.github/ export-ignore`, `tests/ export-ignore`, and `.gitattributes export-ignore` itself strips CI config, test suites, and repo-management files out of the distributed archive without touching the real repository or anyone\'s actual clone — the full history and those files are still there for anyone who clones normally. `export-subst`, used on a specific tracked file, lets you embed a placeholder like `$Format:%H$` that `git archive` substitutes with the actual commit hash at archive time, a lightweight way to stamp a version string into a generated tarball.',
          whyItMatters:
            'Tide Board\'s teammates are not all on the same OS, so without a committed `.gitattributes`, `git diff` across the team eventually turns into walls of red and green noise where every line "changed" purely because of a line-ending mismatch — the worst kind of noise to review through. Getting this right once, in one committed file, removes an entire category of merge conflict and diff noise for the life of the repo.',
          steps: [
            'Add a `.gitattributes` file at the repo root with `* text=auto` as the baseline rule.',
            'Add explicit overrides for anything that needs a fixed ending: `*.sh text eol=lf`, `*.bat text eol=crlf`.',
            'Mark true binaries explicitly: `*.png binary`, `*.jpg binary`, so Git never tries to diff or normalize them.',
            'Commit `.gitattributes` and have every teammate re-normalize existing files with `git add --renormalize .` followed by a commit.',
            'Add `.github/ export-ignore` and `tests/ export-ignore` so release archives ship only the site itself.',
          ],
          code: `$ cat .gitattributes
* text=auto
*.sh  text eol=lf
*.bat text eol=crlf
*.png binary
*.jpg binary
CHANGELOG.md merge=union
.github/ export-ignore
tests/    export-ignore

$ git add --renormalize .
$ git status
On branch main
Changes to be committed:
	modified:   scripts/deploy.sh
	modified:   scripts/deploy.bat

$ git commit -m "Add .gitattributes and renormalize line endings"
[main 7c1e9df] Add .gitattributes and renormalize line endings
 2 files changed, 0 insertions(+), 0 deletions(-)

$ git archive --format=zip HEAD -o tideboard.zip
$ unzip -l tideboard.zip | grep tests
# (no output — tests/ was stripped by export-ignore)`,
          pitfalls: [
            '**Relying on every teammate\'s personal `core.autocrlf` instead of a committed `.gitattributes`.** Different local settings on Windows vs Mac produce different line endings from the same repo, and the mismatch shows up as noisy whole-file diffs. Fix: commit `* text=auto` plus explicit overrides so the rule is the same for everyone.',
            '**Adding `.gitattributes` without renormalizing existing files.** The rule applies going forward by default; files already committed with the "wrong" ending stay as they are until you explicitly renormalize. Fix: run `git add --renormalize .` and commit the result once.',
            '**Letting a shell script keep CRLF endings.** A `#!/bin/bash` shebang line with a trailing carriage return fails on Linux/macOS with a cryptic "bad interpreter" error. Fix: `*.sh text eol=lf` in `.gitattributes`.',
            '**Diffing binary files without marking them `binary`.** Git tries to line-diff a binary format, produces useless garbage output, and can even try to "merge" it, corrupting the file. Fix: mark known binary extensions explicitly.',
            '**Assuming `export-ignore` removes files from the repository itself.** It only affects what `git archive` (and GitHub release zips) produce — the files are still fully present in every normal clone and the full history. Fix: use `.gitignore` if you actually want files never tracked at all.',
          ],
          tryIt:
            'Add a `.gitattributes` to a scratch clone of Tide Board with `* text=auto` and `*.sh text eol=lf`, then run `git add --renormalize .` and check `git status` for any files that changed purely in line endings. Then add `tests/ export-ignore`, run `git archive --format=zip HEAD -o tideboard.zip`, unzip it, and confirm the `tests/` folder is missing from the archive but still present in your actual working directory.',
          takeaway:
            '`core.autocrlf` is a personal, per-clone setting; `.gitattributes` is the committed, repo-wide rule that actually keeps line endings — and diffs, and archive contents — consistent for everyone.',
        },
        {
          id: 'm9-t4',
          title: 'Repository hygiene: auditing size and bloat, and avoiding it from the start',
          explain:
            'A Git repo only ever grows — nothing is truly removed from history without a deliberate rewrite — so a repo that never audits what got committed slowly fills with build output, stray binaries, and old large files that make every future clone slower.',
          analogy:
            'A harbor godown that never does a stock check ends up with years of unclaimed crates, rusted nets nobody uses, and ice-boxes long past repair, all still taking up space and slowing down anyone looking for today\'s catch. A repo left unaudited fills the same way — with generated build folders, an old database dump someone committed once, a batch of full-resolution photos that were later resized — none of it removed automatically just because nobody looks at it anymore.',
          theory:
            '`git count-objects -v -H` is the fastest health check for a repo\'s actual size, and the `-H` flag prints sizes in human-readable units instead of raw KiB counts. It reports loose objects not yet packed (`count`, `size`) separately from objects already compacted into pack files (`in-pack`, `size-pack`) — for most repos, `size-pack` is the number that matters, since Git periodically packs loose objects together with delta compression. It also reports `garbage` and `size-garbage`: corrupt or otherwise unreadable files sitting in the object database, which a healthy repo should show as zero.\n\nThe number from `count-objects` tells you that a repo is large; finding what is making it large means walking every object in history and sorting by size. The classic pipeline is `git rev-list --objects --all` — list every reachable object, on every branch and tag, alongside its path — piped into `git cat-file --batch-check` with a format string that prints object type and size, then filtered down to blobs and sorted numerically. It looks unwieldy the first time you type it, but it directly answers "what is the single largest thing ever committed to this repo, and where did it live," often surfacing a database dump, a video file, or a stray dependency folder committed by accident years ago and still sitting in history even though it was deleted later — the same principle as the previous topic\'s leaked secret: deleting in a later commit does not remove it from history, or its size. For repeated audits across many repos, the community tool `git-sizer` runs a broader set of checks — largest blobs, longest paths, biggest trees, deepest history — in one command.\n\nSome categories of file should never enter a repo in the first place, because a `.gitignore` entry added after the fact only stops future commits, not the copies already in history: generated build output (`dist/`, `build/`, compiled binaries) that a build step regenerates anyway; dependency folders like `node_modules/` that a package manager restores from a lockfile; credentials, `.env` files, and API keys; database dumps and log files; and any large binary asset — design files, videos, high-resolution images — that changes often enough to bloat history quickly with each new full copy Git has to store. For assets that genuinely must be versioned alongside the code despite being large and binary, Git LFS stores the actual file content outside the normal object database and keeps only a small pointer file in the repo itself, which is the supported way to version large binaries without every clone downloading every historical version of every file.\n\nThe cheapest fix for repo bloat is never letting it happen: start every new repo with a `.gitignore` populated from a language or framework template before the first commit, review `git status` and `git diff --stat` before committing rather than blindly running `git add .`, and consider a pre-commit hook or CI check that rejects any file over a size threshold. GitHub itself enforces a practical backstop — it warns on files over 50 MB and rejects pushes containing any file over 100 MB by default — but that is a safety net for extreme cases, not a substitute for keeping genuinely oversized or generated content out of the repo to begin with.',
          whyItMatters:
            'A bloated Tide Board repo means every new teammate\'s first `git clone` takes minutes instead of seconds, and CI checks out the same dead weight on every single run. Auditing size periodically, and refusing to commit the categories of file that cause it, keeps the "clone and go" experience fast for the life of the project.',
          steps: [
            'Run `git count-objects -v -H` to get a baseline size for the repo right now.',
            'Run the large-blob pipeline (`git rev-list --objects --all` piped through `git cat-file --batch-check`) to find the largest objects in history and the paths they came from.',
            'For anything large and genuinely necessary going forward, set it up under Git LFS instead of a plain blob.',
            'Write or extend `.gitignore` to cover build output, dependency folders, and local config before they can ever be committed.',
            'Re-run `git count-objects -v -H` after any cleanup (like a `filter-repo` rewrite) to confirm the size actually dropped, keeping in mind `git gc --prune=now` may be needed to reclaim space from now-unreachable objects.',
          ],
          code: `$ git count-objects -v -H
count: 8
size: 32.00 KiB
in-pack: 15342
packs: 2
size-pack: 187.20 MiB
prune-packable: 0
garbage: 0
size-garbage: 0 bytes

$ git rev-list --objects --all > all-objects.txt
$ git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' < all-objects.txt \\
    | awk '/^blob/ {print $3, $4}' | sort -rn | head -5
41820113 assets/harbor-drone-footage.mp4
9004221  data/2024-full-tide-export.sql
2210044  assets/ferry-schedule-poster.psd
188213   assets/logo-v1.png
94010    README.md

$ git gc --prune=now
Enumerating objects: 15350, done.
Counting objects: 100% (15350/15350), done.
Total 15350 (delta 8210), reused 15342 (delta 8204)`,
          pitfalls: [
            '**Adding `.gitignore` after the large files are already committed.** `.gitignore` only prevents future commits from tracking a path; it does nothing to remove what is already in history. Fix: for anything already committed, that needs a history rewrite (`git filter-repo`), not just an ignore rule.',
            '**Committing full-resolution or frequently-changing binaries directly.** Each new version is a brand-new full-size blob in history forever, since Git cannot usefully delta-compress most binary formats. Fix: use Git LFS for assets that are large, binary, and versioned.',
            '**Running `git add .` out of habit.** It is the easiest way to accidentally commit a stray build folder, a downloaded dependency, or a local `.env`. Fix: check `git status` first, or stage deliberately with `git add -p`.',
            '**Assuming `git gc` shrinks history, not just packs it.** Garbage collection compacts and deduplicates what is reachable — it does not remove anything still reachable from a branch, tag, or even an old reflog entry. Fix: only a history rewrite actually removes committed content; `gc` alone just makes what remains more compact.',
            '**Treating repo size as someone else\'s problem.** A repo that nobody audits accumulates bloat quietly for years until a routine clone takes minutes. Fix: check `git count-objects -v -H` periodically, the same way you would check disk usage on a server.',
          ],
          tryIt:
            'Run `git count-objects -v -H` on Tide Board right now and note the `size-pack` value. Then commit a large throwaway file (a few MB) on a scratch branch, delete it in a follow-up commit, and run `git count-objects -v -H` again — confirm the size went up and did not come back down, proving the "deleted" file is still sitting in history.',
          takeaway:
            'History only grows by default; the only real fixes for bloat are never committing it in the first place, or deliberately rewriting history to remove it after the fact.',
        },
      ],
    },
    {
      id: 'm9-s2',
      title: 'Capstone — Simulate a Real Team',
      topics: [
        {
          id: 'm9-t5',
          title: 'Disaster recovery: bad force-pushes, corrupted repos, and lost clones',
          explain:
            'Three different "everything is broken" scenarios — a teammate\'s force-push overwrote real commits, your local `.git` folder is corrupted, or your whole clone is gone — usually share one underlying fix: a clean copy already exists somewhere else, and using it is faster and safer than forensically repairing the broken one.',
          analogy:
            'When the harbor master\'s handwritten ferry ledger gets soaked in monsoon rain, nobody sits there trying to dry and decipher smudged ink page by page — they pull out the duplicate ledger kept in the office safe and copy forward from that. Git repos have the same safety net built in: the full history exists as a complete copy on the remote and on every teammate\'s machine, so a damaged local copy is rarely the emergency it feels like.',
          theory:
            'If a teammate force-pushes a rewritten `main` and commits that used to be there quietly disappear from the tip everyone sees, the fix depends entirely on whether anyone still has a reference to the old tip. Your own local `main` branch, if you had not yet pulled the bad force-push, may still point at the good old commit — check with `git reflog show main` or simply `git log main` before touching anything. If you had already pulled, your local remote-tracking reflog (`git reflog show origin/main`) may still remember the SHA the branch pointed to before the update. Once you have that SHA, recovery is usually a `git cherry-pick` of the missing commits onto the current tip, or in a simple case, pushing your good local branch back — which itself is a force-push, so coordinate with the team before doing it. The real prevention for this scenario is a branch-protection rule that disallows force-pushes to `main` entirely, which most real teams turn on specifically because of incidents like this one.\n\nA corrupted local repo — loose objects damaged by a disk error, an interrupted `git gc`, or a killed process mid-write — shows up as errors like "loose object ... is corrupt" or failures from `git fsck --full`. It is technically possible to hand-repair specific objects if you understand Git\'s object format deeply, but for an ordinary working repo that is rarely worth the time, because a perfectly good copy of the entire history already exists on the remote, and often on a teammate\'s machine too. The pragmatic fix: move the broken folder aside as a backup, in case it still holds uncommitted working-tree changes worth recovering by hand, clone the repo fresh from the remote, and copy over only the genuinely uncommitted or unpushed work from the backup — not the `.git` directory itself.\n\nIf a laptop is lost, stolen, or a project folder gets accidentally deleted, the question that actually matters is: was the work pushed anywhere? Git is not like a shared drive with one authoritative folder — every clone, and certainly the remote, holds a full copy of history, so a fresh `git clone` restores everything that was ever pushed, completely intact. The only real, permanent loss is local, unpushed commits and uncommitted working-tree changes or stashes that existed only on that one machine. This is the practical argument for pushing work-in-progress branches early and often (`git push -u origin wip/harbor-alerts`), rather than treating "it is only committed locally" or "it is stashed" as safe long-term storage.\n\nFor handing someone a complete copy of a repo without going through a server, `git bundle create tideboard-full.bundle --all` packages the entire history — every branch and tag — into a single portable file from any healthy clone; the recipient runs `git clone tideboard-full.bundle tide-board` and gets a fully functional clone, reflog-free but otherwise complete. This is useful both as an emergency recovery path — a teammate hands you a bundle instead of you fighting a broken remote — and as an occasional local backup independent of any hosting provider.',
          whyItMatters:
            'None of this is theoretical on a team of three: Asha will eventually force-push something she should not have, someone\'s laptop disk will eventually hiccup, and treating "the repo feels broken" as a five-alarm emergency instead of "get a fresh clone from origin or from Ravi" wastes far more time than the actual fix takes.',
          steps: [
            'For a suspected bad force-push, immediately check `git reflog show <branch>` and `git log` on your own machine before pulling or fetching anything further.',
            'If you (or a teammate) find the pre-force-push SHA, recover the missing work with `git cherry-pick <sha>..<sha>` onto the current branch tip rather than trying to force the old history back wholesale.',
            'For a corrupted local repo, run `git fsck --full` once to confirm it is genuinely corrupted, then stop trying to repair it in place.',
            'Move the broken folder aside, `git clone` fresh from the remote (or from a teammate\'s bundle), and manually copy over only real uncommitted changes from the backup.',
            'Going forward, push work-in-progress branches early so a dead laptop never means dead work.',
          ],
          code: `$ git reflog show origin/main
a1b2c3d origin/main@{0}: fetch: fast-forward
9f8e7d6 origin/main@{1}: fetch: fast-forward   <- commits below this line vanished
7c6b5a4 origin/main@{2}: fetch: fast-forward

$ git cherry-pick 9f8e7d6
[main 4d3c2b1] Add ferry delay banner (recovered)
 1 file changed, 9 insertions(+)

$ git fsck --full
error: object file .git/objects/3a/1f2b3c4d... is empty
fatal: loose object 3a1f2b3c4d... (stored in .git/objects/3a/1f2b3c4d...) is corrupt

$ mv tide-board tide-board-broken-backup
$ git clone https://github.com/kundapura/tide-board.git tide-board
Cloning into 'tide-board'...
remote: Enumerating objects: 940, done.
Receiving objects: 100% (940/940), done.

$ git bundle create tideboard-full.bundle --all
$ git clone tideboard-full.bundle tide-board-from-bundle
Cloning into 'tide-board-from-bundle'...
done.`,
          pitfalls: [
            '**Immediately running `git pull` after noticing history looks wrong.** If a bad force-push just happened, pulling can overwrite your own local reflog evidence of the old, good commits before you have had a chance to recover anything from it. Fix: stop, check `git reflog` and `git log` first.',
            '**Trying to hand-repair a corrupted `.git` directory instead of re-cloning.** Reconstructing damaged Git objects is a deep, slow rabbit hole that a fresh clone from a healthy remote solves in minutes. Fix: back up the working-tree files you care about, then re-clone.',
            '**Deleting the broken repo folder before copying out uncommitted work.** Once it is gone, anything that existed only in the working tree or the index is genuinely unrecoverable. Fix: always rename or move it aside as a backup first, never delete outright.',
            '**Assuming reflog is a permanent, shareable safety net.** Reflog entries are local to one clone and expire on a schedule, and they do not exist at all in a brand-new clone. Fix: treat reflog as a short local window, not a backup strategy — push work to the remote for that.',
            '**Not enabling branch protection on `main` after the first bad force-push incident.** Without it, the same mistake can simply happen again next week. Fix: require pull requests and disallow force-pushes on the shared branch once the team is more than one person.',
          ],
          tryIt:
            'On a scratch repo, simulate a bad force-push: make three commits on `main`, note the SHA of the last one, then run `git reset --hard HEAD~1` and commit something different, simulating a teammate\'s rewrite. Use `git reflog` to find the original "lost" commit\'s SHA, and recover it with `git cherry-pick` back onto the current tip.',
          takeaway:
            'When a clean copy already exists on the remote, in a teammate\'s clone, or in your own reflog, recovering it is almost always faster and safer than forensically fixing the broken copy in place.',
        },
        {
          id: 'm9-t6',
          title: 'Auditing a repo\'s history: shortlog, the full graph, and contribution stats',
          explain:
            'Git ships several read-only commands purpose-built for stepping back and looking at a repo\'s history as a whole — who committed what, how branches actually diverged and merged, and how activity is spread over time — useful for onboarding, audits, and understanding a codebase you have inherited.',
          analogy:
            'A harbor logbook tallying how many trips each boat captain logged this season tells you something real — who has been out on the water the most — but it does not tell you who brought in the biggest catch or handled the roughest weather. Commit-count summaries are exactly that kind of tally: a real, useful signal, and a genuinely weak proxy for how much someone actually contributed.',
          theory:
            '`git shortlog -sn` groups every commit in the current branch\'s history by author name and prints a sorted count — `-s` for "summary" (suppress individual commit messages, just show the count) and `-n` to sort numerically by commit count instead of alphabetically by name. Add `-e` to also show each author\'s email, which matters the moment two different email addresses map to the same display name, or vice versa. By default `git shortlog` only looks at the currently checked-out branch\'s history; add `--all` to summarize across every branch and tag in the repo, which is almost always what you actually want for a whole-repo audit.\n\n`git log --all --graph --oneline --decorate` is the single most useful one-liner for seeing a repo\'s actual shape: `--all` includes every branch and tag rather than just the current one, `--graph` draws the ASCII lines showing how branches split and where they merged back in, `--oneline` compresses each commit to its short SHA and subject line so the graph stays readable, and `--decorate` labels commits with the branch and tag names pointing at them. Run without any of those flags, `git log` only shows a linear list of the current branch\'s ancestry — it is easy to forget a repo can have several branches with entirely different, non-overlapping history, and a plain `git log` hides that completely.\n\nBeyond shortlog, a handful of `git log` flags answer more specific audit questions: `git log --author="Asha"` filters to one person\'s commits; `git log --since="2 weeks ago" --until="yesterday"` filters by date range; `git log --stat` shows per-commit file-level insertion and deletion counts rather than just the message, useful for seeing which files a given time window actually touched; and `git log --format=\'%ae\' | sort | uniq -c | sort -rn` is a quick raw tally of commits per email address when you want the numbers without shortlog\'s formatting. `git log --follow -- path/to/file` is the closest thing to "who has touched this specific file over its whole life, even across renames," often more useful for onboarding onto one part of a codebase than a whole-repo summary.\n\nEvery one of these numbers is a weak, easily-distorted proxy for actual contribution, worth stating plainly rather than leaving implicit. A single automated dependency bump or a repo-wide reformat can add hundreds of commits, or one commit touching thousands of lines, that took a script two seconds to produce; a squash-merged pull request compresses what might have been fifteen small commits into one, changing an author\'s visible count without changing what they actually did; and a genuinely difficult, carefully-considered bug fix might be a single three-line commit that reads as "small" next to either of those. These commands are the right tool for orientation — who owns this area, when did this file last meaningfully change, how active is a branch — and the wrong tool for anything resembling a performance judgment.',
          whyItMatters:
            'On Tide Board, `git log --all --graph --oneline` is how you actually see that Asha\'s feature branch and Ravi\'s hotfix branch diverged from the same point three weeks ago and still have not merged — information a plain `git log` on `main` alone would never surface. `git shortlog -sn` is the fast, honest answer to "who has touched this repo" for a new teammate getting oriented, as long as everyone remembers what it is not measuring.',
          steps: [
            'Run `git shortlog -sn --all` to get an author-by-commit-count summary across every branch.',
            'Run `git log --all --graph --oneline --decorate` to see the actual shape of every branch and where they diverged or merged.',
            'Filter to one person or one window with `git log --author="Asha"` or `git log --since="2 weeks ago"`.',
            'Use `git log --stat` on a specific range to see which files a period of work actually touched.',
            'Use `git log --follow -- <path>` to trace one file\'s full history across any renames.',
          ],
          code: `$ git shortlog -sn --all
    41  Asha
    37  Ravi
    29  Thanthrajnaani

$ git log --all --graph --oneline --decorate
*   4d3c2b1 (HEAD -> main, origin/main) Merge pull request #14 from feature/tide-alerts
|\\
| * a1b2c3d (feature/tide-alerts) Add high-tide alert banner
| * 9f8e7d6 Wire alert data into homepage
|/
* 7c6b5a4 Tag v1.2.0 release notes
* 6e5d4c3 (tag: v1.2.0) Fix ferry schedule off-by-one

$ git log --author="Asha" --since="2 weeks ago" --oneline | wc -l
6

$ git log --format='%ae' --all | sort | uniq -c | sort -rn
     41 asha@example.com
     37 ravi@example.com
     29 you@example.com`,
          pitfalls: [
            '**Reading commit count as a proxy for how much work someone did.** One squash-merged PR can hide fifteen real commits behind one count, while a single hard-won bug fix reads as "just one commit." Fix: use these numbers for orientation, never for evaluating people.',
            '**Running `git log` or `git shortlog` without `--all` and assuming it covered the whole repo.** Both default to the current branch\'s ancestry only, silently missing every commit that only exists on other branches. Fix: add `--all` for any real audit.',
            '**Confusing author and committer.** `git shortlog` counts by author by default, but a rebase or squash-merge can list someone as committer without them being the original author, or vice versa; `-e` and `--format` with `%an`/`%cn` help when the distinction matters.',
            '**Trying to read repo shape from a plain `git log`.** Without `--graph --all`, you get a flattened list that hides merges and parallel branches entirely, making the history look simpler or more linear than it really is.',
            '**Treating `git log --stat` line counts as a difficulty measure.** A generated lockfile update can show thousands of "changed" lines for something that took no real effort, while a subtle one-line fix can be the hardest work in the whole history.',
          ],
          tryIt:
            'On Tide Board, run `git shortlog -sn --all` and `git log --all --graph --oneline --decorate` back to back. Pick the branch in the graph that has diverged furthest from `main` without merging, and use `git log --stat <that-branch> ^main` to see exactly which files it has changed that `main` does not have yet.',
          takeaway:
            '`shortlog` and the full `--all --graph` view are the right tools for understanding a repo\'s shape and activity — and the wrong tools for judging how hard any one person worked.',
        },
        {
          id: 'm9-t7',
          title: 'A day in the life: the whole toolkit, one ordinary Tuesday',
          explain:
            'Nothing taught in this course is a special ceremony reserved for emergencies — a Git-fluent engineer runs most of it, unremarkably, as part of one normal working day.',
          analogy:
            'Think of it the way an experienced ferry captain runs a routine crossing: checking the tide table, confirming the manifest, adjusting course slightly for wind — none of it dramatic, all of it just what competent daily practice looks like.',
          theory:
            'Morning starts before any new work: `git fetch origin` to see what changed overnight, then `git switch main` and `git pull --rebase` to bring local `main` up to date without creating a pointless merge commit. A quick `git log --oneline -5` confirms Ravi\'s hotfix from yesterday landed, and a glance at `git status` confirms a clean starting point before branching off anything new.\n\nToday\'s task is a small feature: a banner that warns Tide Board visitors when the next high tide is within the hour. `git switch -c feature/high-tide-banner` branches off the freshly-updated `main`. The work happens in small, deliberate commits rather than one giant one at the end: `git add -p` stages the banner markup separately from the data-fetching change even though both live in the same file, because a reviewer, and a future `git blame`, benefits from each commit being one coherent idea. Each commit gets a real message describing what changed and why, not "wip" or "fixes."\n\nThe branch gets pushed early, before it is "finished": `git push -u origin feature/high-tide-banner`, followed by `gh pr create --draft`. This is deliberate — CI runs against the branch immediately, catching a broken build long before the feature is done, and Ravi can see the direction of the work early if he happens to look. Sure enough, CI fails on the first push over a missing test fixture; one more small commit fixes it, gets pushed, and CI turns green. The PR comes out of draft.\n\nRavi reviews within the hour and leaves two comments: rename a confusing variable, and handle the case where tide data fails to load. Both get fixed with `git commit --fixup <sha-of-the-relevant-original-commit>` for each, which Git\'s autosquash machinery understands as "meant to be merged into that earlier commit." `git rebase -i --autosquash main` reorders and folds the fixups into the commits they belong to automatically, producing a history that reads as if it had been written correctly the first time. The rewritten branch gets pushed with `git push --force-with-lease`, not a plain `--force`, because that check refuses the push if anyone else\'s work landed on the remote branch since the last fetch, protecting against clobbering something unexpected.\n\nRavi approves. The PR gets squash-merged with `gh pr merge --squash --delete-branch`, collapsing the whole feature into one clean commit on `main` and removing the now-merged branch on both ends. Back on the local machine, `git switch main && git pull` picks up the merge, and the local feature branch gets deleted too with `git branch -d feature/high-tide-banner`. Later that afternoon, this feature plus a couple of smaller ones accumulated over the week justify cutting a release: `git tag -a v1.4.0 -m "High tide banner and two fixes"` followed by `git push origin v1.4.0`.\n\nNothing about that day required looking anything up. Fetching before starting, branching for isolated work, committing in small reviewable pieces, pushing early for CI feedback, cleaning history with `rebase -i --autosquash` before merging, force-pushing safely with `--force-with-lease`, squash-merging, and tagging a release — that is not a special sequence performed for an exam. It is what fluency with the whole toolkit looks like on an unremarkable Tuesday.',
          whyItMatters:
            'Every command in this narrative was taught somewhere earlier in this course; walking through one realistic day end to end shows how they compose into a single, ordinary rhythm rather than a list of unrelated tricks to memorize separately.',
          steps: [
            'Start a session with `git fetch origin`, `git switch main`, and `git pull --rebase`, confirming a clean `git status` before doing anything else.',
            'Branch off with `git switch -c feature/<name>` and commit the work in several small, single-purpose commits, using `git add -p` where a file mixes unrelated changes.',
            'Push early with `git push -u origin feature/<name>` and open a draft PR with `gh pr create --draft`, letting CI run against work in progress.',
            'Address review feedback with `git commit --fixup <sha>` per comment, then `git rebase -i --autosquash main` and `git push --force-with-lease` to fold the fixes into clean history.',
            'Once approved, squash-merge with `gh pr merge --squash --delete-branch`, then sync local `main` and delete the local branch.',
            'When enough merged work adds up to a release, tag it with `git tag -a vX.Y.Z -m "..."` and push the tag.',
          ],
          code: `$ git fetch origin && git switch main && git pull --rebase
Already up to date.

$ git switch -c feature/high-tide-banner
Switched to a new branch 'feature/high-tide-banner'

$ git add -p src/tide.js
$ git commit -m "Fetch next high-tide time from schedule data"
$ git add -p src/homepage.html
$ git commit -m "Add high-tide warning banner to homepage"

$ git push -u origin feature/high-tide-banner
$ gh pr create --draft --title "High tide warning banner" --body "Warns visitors when the next high tide is within the hour."

# CI fails: missing test fixture
$ git commit -m "Add missing tide fixture for banner test"
$ git push

# CI green, PR out of draft. Ravi leaves 2 review comments.
$ git commit --fixup a1b2c3d
$ git commit --fixup 9f8e7d6
$ git rebase -i --autosquash main
$ git push --force-with-lease

# Ravi approves
$ gh pr merge --squash --delete-branch

$ git switch main && git pull
$ git branch -d feature/high-tide-banner

$ git tag -a v1.4.0 -m "High tide banner and two fixes"
$ git push origin v1.4.0`,
          pitfalls: [
            '**Batching a week of work into one commit at the end.** It throws away exactly the granularity that made review and `git blame` useful in the first place. Fix: commit in small, single-purpose pieces as you go, not retroactively.',
            '**Waiting until a feature "feels done" to push and open a PR.** That delays CI feedback and review until the least convenient moment to change course. Fix: push early, open a draft PR, and let CI run against work in progress.',
            '**Using `git push --force` after a rebase instead of `--force-with-lease`.** A plain force overwrites the remote branch unconditionally, even if a teammate, a bot, or CI pushed something to it since your last fetch. Fix: `--force-with-lease` refuses the push if the remote moved unexpectedly.',
            '**Hand-editing history with `rebase -i` for every review comment instead of using fixup commits.** It works, but it is slower and more error-prone than letting `--autosquash` do the reordering for you. Fix: use fixup commits during review, squash them all in one `rebase -i --autosquash` pass.',
            '**Forgetting to sync local `main` and delete the local branch after a squash-merge.** The local branch keeps existing with its old, pre-squash commits, drifting from the real history on `main`. Fix: `git pull` on `main` and `git branch -d` the merged branch as a standard last step.',
          ],
          tryIt:
            'Replicate this exact day on a scratch feature branch of Tide Board: branch, two small commits, an early draft PR, one fixup commit, an autosquash rebase, a force-with-lease push, a squash-merge, and a tag. Time how long the whole sequence actually takes once you are not looking anything up — that is the real measure of fluency this module is aiming for.',
          takeaway:
            'None of this toolkit is exceptional-circumstance-only; a fluent engineer runs most of it, unremarkably, as the normal shape of one working day.',
        },
        {
          id: 'm9-t8',
          title: 'The capstone project: what "done" actually looks like',
          explain:
            'The capstone is graded against a concrete rubric, not a vague impression — this topic lays out exactly what the final project expects and how each requirement gets checked.',
          analogy:
            'Before a fishing boat is certified seaworthy at the Kundapura harbor office, an inspector runs through a fixed checklist — hull, lights, life jackets, radio — rather than just looking the boat over and guessing. The capstone rubric is that checklist: concrete, checkable items instead of a general feeling of "looks like solid Git work."',
          theory:
            'The capstone project, "Ship a Feature the Real Way," is deliberately not a new topic — it is the entire course\'s toolkit applied to one realistic scenario on the actual Tide Board repo: a feature branch built from several small commits, cleaned up with an interactive rebase before it is shown to anyone, pushed and opened as a real pull request, checked by CI, reviewed by Ravi, squash-merged, tagged as a semver release, and finished with a deliberate disaster-recovery drill. Every one of those phrases maps to a specific module already covered in this course; the capstone is proof that they compose into one coherent workflow rather than a set of tricks that only work in isolation.\n\nThe functional requirements on the project are written to be independently checkable, not subjective: a real branch with a real commit count, a rebase that visibly reduces or reorders that history before the first push, an actual pull request on GitHub with an actual CI check attached and passing, at least one real round of review comments addressed rather than pre-empted, a squash-merge (not a regular merge) landing on `main`, an annotated tag whose name is valid semantic versioning, and a recovery drill that produces a real "before" and "after" state recoverable via `git reflog`. Grading is a matter of checking each of those against what actually happened in the repo, not judging the feature\'s idea.\n\nA few things the rubric explicitly does not require: the feature itself does not need to be elaborate — a small, real, visibly working addition to the Tide Board site is enough, because the point of the capstone is the workflow around the change, not the size of the change. Signing commits is a bonus, not a requirement, since not every real team enforces it. What the rubric does require without exception is evidence of safe habits under the hood: `--force-with-lease` rather than a bare `--force` anywhere a rewritten branch gets pushed, and a recovery drill that shows the actual `git reflog` output used to find the lost commit, not just a claim that recovery would be possible.\n\nThe recovery drill deserves its own emphasis because it is the one requirement that intentionally breaks something on purpose. On a disposable scratch branch — never on `main`, and never on the real feature branch mid-flight — simulate a bad force-push exactly as described earlier in this module: make a commit, note its SHA, then reset and force-push over it as if a teammate had made the mistake. Recovering it with `git reflog` and `git cherry-pick` (or a direct branch reset back to the recovered SHA) onto the current tip, with the terminal output to show it, is the actual deliverable — not a description of how one would recover it in theory.',
          whyItMatters:
            'A rubric this concrete exists because "I understand Git" is not a useful claim on its own — being able to point at a specific PR, a specific tag, and a specific reflog recovery on a real repo is what actually distinguishes having done the work from having read about it.',
          steps: [
            'Re-read the capstone project brief in full before running any command, and treat its functional requirements as the actual grading checklist.',
            'Confirm Tide Board is in a clean, up-to-date state (`git status`, `git fetch`, `git pull --rebase` on `main`) before branching for the capstone feature.',
            'Work through the feature end to end using the day-in-the-life rhythm from the previous topic as the template: branch, small commits, early PR, CI, review, autosquash rebase, force-with-lease, squash-merge, tag.',
            'Run the recovery drill on a clearly-named scratch branch, separate from the real capstone feature branch, and keep the terminal transcript.',
            'Check the finished repo against every bullet in the functional requirements list before considering the capstone complete.',
          ],
          code: `$ git log --oneline main -5
4d3c2b1 (HEAD -> main, tag: v1.4.0, origin/main) High tide banner and two fixes
7c6b5a4 Fix ferry schedule off-by-one
6e5d4c3 (tag: v1.3.0) Add ferry delay banner
...

$ git tag --points-at HEAD
v1.4.0

$ gh pr view 14 --json state,mergedAt,statusCheckRollup
{
  "state": "MERGED",
  "mergedAt": "2026-07-22T10:42:00Z",
  "statusCheckRollup": [{ "name": "build-and-test", "conclusion": "SUCCESS" }]
}

$ git reflog show scratch/recovery-drill
b2a1c9e scratch/recovery-drill@{0}: commit: overwrite (the bad force-push)
e4f5a6b scratch/recovery-drill@{1}: commit: original work (recovered from here)`,
          pitfalls: [
            '**Starting the capstone by writing code before re-reading the rubric.** It is easy to build a perfectly fine feature that skips a specific required step, like the recovery drill or an annotated (vs. lightweight) tag. Fix: treat the functional requirements list as a checklist to satisfy, not background reading.',
            '**Running the recovery drill on the real feature branch instead of a scratch branch.** Deliberately simulating a bad force-push is destructive by design; doing it anywhere near the actual capstone work risks losing real progress. Fix: use a clearly-named, disposable branch just for the drill.',
            '**Using a lightweight tag (`git tag v1.4.0`) instead of an annotated one (`git tag -a v1.4.0 -m "..."`).** They look similar at a glance but only the annotated tag stores a message, tagger, and date as its own object, which is what most release tooling expects. Fix: always use `-a` (or `-s` if signing) for a release tag.',
            '**Merging the PR with a regular merge instead of squash.** It defeats the point of the earlier interactive rebase, since the messy pre-rebase history would have been avoided either way, but the rubric specifically checks for a squash-merge as the final step. Fix: `gh pr merge --squash`.',
            '**Describing the recovery drill instead of actually running it.** A sentence explaining what `git reflog` would show is not the same evidence as a real terminal transcript from a real simulated incident. Fix: actually break and recover a scratch branch, and keep the output.',
          ],
          tryIt:
            'Before starting the capstone build, write out your own checklist from the functional requirements in your own words, one line per requirement, and keep it open while you work — checking items off in real time, rather than reconstructing after the fact, is the difference between confidently done and hoping it is done.',
          takeaway:
            'The capstone rubric is a fixed, checkable list — a real PR, a real CI pass, a real review, a squash-merge, an annotated tag, and a real reflog recovery transcript — not a subjective impression of "good Git work."',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm9-p1',
      type: 'Capstone',
      title: 'Ship a Feature the Real Way',
      domain: 'Version Control / Team Workflow',
      duration: '5-7 hrs',
      description:
        'One end-to-end scenario that exercises the entire toolkit from this course on the real Tide Board repo: build a small feature across several small commits, clean the history with an interactive rebase, push and open a real pull request, get a CI check to pass, get reviewed by Ravi, squash-merge into main, tag a semantic-version release, and finish with a deliberate recovery drill that overwrites and then recovers a commit using git reflog.',
      tools: ['Git', 'GitHub', 'GitHub CLI (gh)', 'GitHub Actions'],
      blueprint: {
        overview:
          'This project proves you can run the whole course\'s toolkit as one coherent workflow rather than as isolated exercises: branching, atomic commits, rewriting history safely, remote collaboration, CI, code review, release tagging, and recovery from a real mistake, all on one realistic change to Tide Board.',
        functionalRequirements: [
          'A feature branch created off an up-to-date `main`, containing at least five small, single-purpose commits building one real, visibly working addition to Tide Board.',
          'That history cleaned up with `git rebase -i` (squashing fixups, reordering, and rewording as needed) before the branch is ever pushed for review.',
          'The branch pushed to GitHub and a real pull request opened, with a CI workflow attached that runs automatically and passes.',
          'At least one genuine round of review from "Ravi" — real comments requesting a real change — addressed with fixup commits and an autosquash rebase, then pushed safely with `--force-with-lease`.',
          'The pull request squash-merged into `main`, followed by an annotated tag on the resulting commit using valid semantic versioning (e.g. `v1.3.0`), pushed to the remote.',
          'A separate, deliberate recovery drill on a scratch branch: a commit gets overwritten by a simulated bad force-push, then recovered using `git reflog` and `git cherry-pick`, with the full terminal transcript kept as evidence.',
        ],
        technicalImplementation: [
          'Branch with `git switch -c feature/<name>` off a freshly `git pull --rebase`d `main`; stage changes with `git add -p` where needed so each commit stays single-purpose.',
          'Before the first push, run `git rebase -i main` to squash, reorder, or reword the working commits into a clean, reviewable sequence.',
          'Add a minimal GitHub Actions workflow (`.github/workflows/ci.yml`) that runs a real check against the static site, such as an HTML/link validator or a small script test, so the PR has a genuine CI gate.',
          'Push with `git push -u origin feature/<name>` and open the PR with `gh pr create`; address review feedback with `git commit --fixup <sha>` per comment and fold them in with `git rebase -i --autosquash main`, then `git push --force-with-lease`.',
          'Merge with `gh pr merge --squash --delete-branch`; tag the resulting `main` commit with `git tag -a vX.Y.Z -m "..."` and `git push origin vX.Y.Z`.',
          'For the recovery drill, on an unrelated scratch branch: commit, note the SHA, `git reset --hard HEAD~1`, commit something different, force-push over the original — then use `git reflog` to find the lost SHA and `git cherry-pick` it back, capturing the reflog output and the recovery commands actually run.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Branch and build the feature in small commits',
            outcome:
              'A feature branch exists off up-to-date main with at least five small, single-purpose commits implementing one real, visible addition to Tide Board.',
            prompt:
              'On the Tide Board repo, make sure main is fully up to date (git fetch origin, git switch main, git pull --rebase). Create a new branch called feature/high-tide-alert, or a similarly named small feature of your choice such as a banner warning visitors when the next high tide is within the hour. Implement it across at least five small, single-purpose commits rather than one large commit: separate the data/logic change from the markup/styling change from any accompanying test or fixture, and write a real, specific commit message for each one. Do not rebase or clean anything up yet — just get the working feature committed in its natural, slightly messy sequence first.',
          },
          {
            step: 2,
            label: 'Clean the history with an interactive rebase',
            outcome:
              'The feature branch has a small number of clean, logically-ordered commits, ready to be shown to a reviewer, and has not been pushed yet.',
            prompt:
              'Before pushing anything, run git rebase -i main against your feature branch. Look at the commit list Git opens and decide which commits should be squashed together because they are really one idea split across two commits, which commit messages need rewording to actually describe the change, and whether any commits are in the wrong order relative to each other. Rewrite the history so it reads as a small, clean, deliberate sequence — the kind a reviewer could read commit-by-commit and understand the feature build up logically. Confirm the result with git log --oneline main..HEAD before moving on.',
          },
          {
            step: 3,
            label: 'Add CI, open the PR, and get it reviewed',
            outcome:
              'A real GitHub Actions check runs on the PR and passes, and at least one genuine round of review feedback has been given and addressed.',
            prompt:
              'If Tide Board does not already have one, add a minimal GitHub Actions workflow at .github/workflows/ci.yml that runs a real, meaningful check against the static site on every push and pull request, for example validating the HTML, checking for broken relative links, or running a small test script against the tide-time logic. Push your rebased feature branch with git push -u origin <branch-name> and open a pull request with gh pr create, writing a real description of what the feature does and why. Confirm the CI check runs and goes green on the PR. Then, acting as the reviewer Ravi, write down at least one genuine, specific piece of review feedback on the PR, such as a naming issue, a missing edge case, or a small refactor, and address it for real: make the fix, commit it with git commit --fixup <sha-of-the-commit-it-belongs-to>, then fold it in with git rebase -i --autosquash main and push the result with git push --force-with-lease. Confirm CI is still green after the force-with-lease push.',
          },
          {
            step: 4,
            label: 'Squash-merge and tag the release',
            outcome:
              'The feature is merged into main as a single clean commit, and that commit is tagged with a valid, pushed semantic version.',
            prompt:
              'Once the PR is approved and CI is green, merge it with gh pr merge --squash --delete-branch so it lands on main as one clean commit and the remote branch is removed. Locally, switch back to main and pull to pick up the merge, then delete your local feature branch with git branch -d. Decide on the next semantic version for Tide Board based on what changed (a new visible feature is normally a minor bump, for example v1.3.0 if the last release was v1.2.x), create an annotated tag with git tag -a v1.3.0 -m describing the release, and push it with git push origin v1.3.0. Confirm the tag shows up on GitHub attached to the correct commit.',
          },
          {
            step: 5,
            label: 'Run the deliberate recovery drill',
            outcome:
              'A commit deliberately overwritten by a simulated bad force-push has been recovered using git reflog and git cherry-pick, with the full terminal transcript kept as proof.',
            prompt:
              'Create a new, clearly-named scratch branch unrelated to the real feature work, such as scratch/recovery-drill, purely for this drill — never do this on main or on the feature branch. On it, make one real commit and note its SHA with git log -1. Now simulate a teammate\'s mistake: run git reset --hard HEAD~1, make a different commit, and force-push over the original with git push --force origin scratch/recovery-drill, as if the first commit had just been lost to a bad force-push. Recover it: use git reflog on your local scratch branch to find the SHA of the original, overwritten commit, then bring it back with git cherry-pick, using that SHA, or by resetting the branch back onto it and re-force-pushing the recovered state. Save the full terminal output of the reflog lookup and the recovery commands as the evidence for this step.',
          },
        ],
        deliverable:
          'A Tide Board repo whose main history shows one clean, squash-merged commit for a real feature, built from a visibly rebased sequence of small commits beforehand, an annotated semver tag on that commit pushed to the remote, a closed and merged pull request showing a passing CI check and at least one real addressed review comment, and a separate scratch branch whose terminal transcript proves a deliberately lost commit was recovered with git reflog and git cherry-pick.',
      },
    },
  ],
  quiz: [
    {
      id: 'm9-q1',
      q: 'A pull request shows a green "Verified" badge next to Ravi\'s latest commit. What does that badge actually confirm?',
      options: [
        'That the code in the commit has been reviewed and is safe to merge',
        'That the commit\'s signature is cryptographically valid and was produced by a key registered to Ravi\'s GitHub account',
        'That the commit passed all CI checks before being pushed',
        'That the commit was made from a machine Ravi has previously used to push to this repo',
      ],
      answer: 1,
    },
    {
      id: 'm9-q2',
      q: 'A teammate committed a file containing a real API key, then made a second commit that deletes the file. Why is the secret still considered leaked?',
      options: [
        'Because .gitignore was not updated before the second commit',
        'Because git commit --amend would have been required instead of a new commit',
        'Because GitHub caches deleted files for 30 days regardless of what Git does locally',
        'Because the earlier commit still exists in history with the file in its tree, fully reachable by anyone with the repo\'s history',
      ],
      answer: 3,
    },
    {
      id: 'm9-q3',
      q: 'What does the core.autocrlf Git setting actually control?',
      options: [
        'Whether Git automatically signs every commit with the configured key',
        'Which merge strategy Git uses by default for conflicting text files',
        'How line endings are converted between the working directory and what gets stored in the repository, per local clone',
        'Whether commit messages are automatically capitalized',
      ],
      answer: 2,
    },
    {
      id: 'm9-q4',
      q: 'Your local .git directory is throwing corruption errors from git fsck, but the remote on GitHub is known to be healthy and a teammate has a working clone. What should you do first?',
      options: [
        'Back up any uncommitted working-tree changes, then re-clone the repo fresh from the remote or the teammate\'s copy rather than repairing .git in place',
        'Manually locate and delete the specific corrupted loose objects with rm, then run git gc to rebuild the pack',
        'Run git filter-repo to rewrite history and regenerate clean objects',
        'Force-push from the corrupted repo to overwrite the remote with a clean copy',
      ],
      answer: 0,
    },
    {
      id: 'm9-q5',
      q: 'A teammate force-pushed main and, in the process, overwrote your most recent commit so it no longer appears in the branch history. You have not deleted or re-cloned your local repo. What is the most reliable next step to recover it?',
      options: [
        'Run git pull to fetch the latest state and manually retype the lost changes from memory',
        'Contact GitHub support and request the deleted commit be restored from their backups',
        'Run git clone again in a new folder and hope the commit reappears automatically',
        'Check git reflog (or your local branch\'s prior position) for the overwritten commit\'s SHA, then cherry-pick it back onto the current branch tip',
      ],
      answer: 3,
    },
  ],
}
