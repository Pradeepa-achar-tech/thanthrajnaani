export const m4 = {
  id: 'm4',
  title: 'Remotes & Collaboration Basics',
  hours: 6,
  color: 'from-orange-500/20 to-orange-700/10',
  accent: 'orange',
  description:
    'Tide Board has lived on your machine alone until now. This module connects it to a **remote** and covers the commands that make real collaboration possible — clone, fetch, pull, and push — plus the remote-tracking branches Git uses to remember what the remote looked like last. You will deliberately trigger a real **non-fast-forward** push rejection with a simulated teammate and resolve it exactly the way working teams do, using **fetch** and **merge/rebase** before pushing again.',
  sections: [
    {
      id: 'm4-s1',
      title: 'Talking to a Remote',
      topics: [
        {
          id: 'm4-t1',
          title: 'What a Remote Actually Is',
          explain:
            'A remote is just a named URL pointing at another copy of your repository — "origin" is nothing but the default nickname Git gives the remote you cloned from, not a reserved keyword.',
          analogy:
            'Think of "origin" the way you think of a saved contact name like "Amma" in your phone: the contact name is not special to the phone itself, it is just a label you chose for a phone number. You could rename that contact to "Mother" tomorrow and calls would still connect exactly the same way, because the label and the actual number are two separate things.',
          theory:
            'A Git remote is nothing more than an entry in your repository\'s configuration that maps a short name to a URL. When you run `git clone`, Git automatically creates one such entry named "origin" pointing at the URL you cloned from — but that name is just a convention everyone follows so teams can talk about "origin" without confusion, not something Git enforces. You can add your own remotes with `git remote add <name> <url>`, rename any remote with `git remote rename <old> <new>`, remove one with `git remote remove <name>`, and list them (with URLs) using `git remote -v` (plain `git remote` only prints names, no URLs).\n\nUnder the hood these entries live in `.git/config` as a `[remote "name"]` block containing a `url` and a `fetch` refspec — by default `+refs/heads/*:refs/remotes/<name>/*`, which tells Git "when fetching from this remote, take every branch under refs/heads/ on their side and store it locally under refs/remotes/<name>/". You will see exactly what that refspec produces in the next topic.\n\nMost real projects host their remote on a service like GitHub or GitLab, but a remote can just as easily be a path on your own disk or another machine on your network — Git does not care, it only cares that the URL is reachable and points at a valid Git repository. To keep this module fully self-contained (GitHub workflows get their own dedicated module later), every example here uses a plain local "bare" repository as the stand-in remote — the exact same commands apply unchanged once you point them at a real GitHub URL instead.\n\nA repository is not limited to one remote either. It is common to have "origin" (your own fork or primary remote) alongside "upstream" (the original project you forked from), or "backup" pointing at a secondary host — each is just another named URL in the same config file.',
          whyItMatters:
            'Every collaboration command in this module — clone, fetch, pull, push — needs a remote to talk to, and misreading which URL a name like "origin" actually points at is a common source of "why did my push go to the wrong place" confusion on real teams.',
          steps: [
            'Create a scratch bare repository somewhere on disk to act as a stand-in remote for Tide Board.',
            'Inside your Tide Board working copy, run `git remote -v` and confirm no remote is configured yet.',
            'Add the bare repository as a remote named "origin" with `git remote add origin <path>`.',
            'Run `git remote -v` again and confirm both a fetch URL and a push URL are listed.',
            'Rename it to "upstream" with `git remote rename origin upstream`, verify with `-v`, then rename it back to "origin".',
            'Open `.git/config` and locate the `[remote "origin"]` block to see the raw URL and fetch refspec.',
          ],
          code: `$ git remote -v
(no output — no remote configured yet)

$ git remote add origin ~/tide-board-remote.git
$ git remote -v
origin	~/tide-board-remote.git (fetch)
origin	~/tide-board-remote.git (push)

$ git remote rename origin upstream
$ git remote -v
upstream	~/tide-board-remote.git (fetch)
upstream	~/tide-board-remote.git (push)

$ git remote rename upstream origin
$ git remote -v
origin	~/tide-board-remote.git (fetch)
origin	~/tide-board-remote.git (push)

$ cat .git/config
[remote "origin"]
	url = ~/tide-board-remote.git
	fetch = +refs/heads/*:refs/remotes/origin/*`,
          pitfalls: [
            '**Treating "origin" as a Git keyword** rather than a plain string — it is only a convention. You can rename it freely, but everyone conventionally keeps the primary remote called "origin" so scripts, docs, and teammates are not confused.',
            '**Running `git remote add origin <url>` a second time** without removing the first — Git refuses with "remote origin already exists"; use `git remote set-url origin <url>` to change an existing remote\'s URL instead.',
            '**Confusing `git remote -v` with `git branch -r`** — the first lists configured remotes and their URLs, the second lists remote-tracking branches; they answer different questions.',
            '**Forgetting the `-v` flag** and concluding no remote exists — plain `git remote` only prints names, not URLs, so it can look emptier than it is.',
            '**Adding a remote with the wrong URL scheme** (https vs ssh) and then fighting repeated password prompts — fix it with `git remote set-url origin <correct-url>` rather than re-cloning.',
          ],
          tryIt:
            'In a scratch folder, run `git init --bare tide-remote-test.git`, then inside any local repo run `git remote add origin ../tide-remote-test.git`, confirm it with `git remote -v`, rename it to "backup" and back to "origin", and finally open `.git/config` to see exactly what those commands wrote.',
          takeaway:
            'A remote is nothing more than a name-to-URL mapping stored in your repository\'s config — "origin" is only what `git clone` happens to call the first one it sets up for you.',
        },
        {
          id: 'm4-t2',
          title: 'Cloning: What git clone Sets Up For You',
          explain:
            '`git clone` does far more than copy files: it downloads the entire history, configures a remote named "origin", creates a read-only remote-tracking branch for every branch on the remote, and checks out one local branch already wired to track its remote counterpart.',
          analogy:
            'Cloning Tide Board is like the harbor office handing a new clerk a full photocopy of the entire tide-and-ferry ledger, going all the way back — not just today\'s page. Along with the photocopy, the clerk also gets a sticky note on every section reading "this is what the master ledger said as of this morning," so they always know exactly which parts might have changed since they last checked.',
          theory:
            'Running `git clone <url> [directory]` performs several steps automatically. It creates the target directory and initializes a `.git` folder inside it, adds a remote named "origin" pointing at the given URL, downloads the full history of every branch and tag from that remote, and — for each branch that exists on the remote — creates a corresponding remote-tracking branch locally under `refs/remotes/origin/<branch>` (for example `origin/main`). It then checks out a local branch matching whatever the remote considers its default branch (commonly `main`), and configures that local branch to track the matching remote-tracking branch, writing `branch.main.remote = origin` and `branch.main.merge = refs/heads/main` into `.git/config`.\n\nThe remote-tracking branches created by clone (`origin/main`, `origin/ferry-eta`, and so on) are read-only local bookmarks — Git\'s memory of what each branch on the remote looked like at the moment of the last clone, fetch, pull, or push. They are not branches you commit on directly; checking one out with a plain `git checkout origin/main` puts you in a detached HEAD state rather than on a normal branch.\n\nAlongside the per-branch tracking refs, clone also sets up `origin/HEAD` — a symbolic reference (not a real branch) that simply records which branch the remote considers its default, so tools know what `origin/HEAD` should resolve to without guessing. You can inspect this with `git remote show origin`, which prints a fuller summary including the remote\'s HEAD branch and the tracking status of every local branch.\n\nUse `git branch -r` to list remote-tracking branches only, `git branch -a` to list both local and remote-tracking branches together, and `git branch -vv` (covered in depth in Topic 5) to see each local branch\'s SHA and its tracking relationship in one line.',
          whyItMatters:
            'When Asha joins Tide Board, she does not need to manually configure a remote, fetch every branch, or wire up tracking by hand — one `git clone` gives her the full history and a correctly configured setup in a single command, which is exactly why clone is almost always how real collaboration begins.',
          steps: [
            'Seed the scratch bare repository from Topic 1 with an initial Tide Board commit (pushed from any working clone).',
            'Clone it into a fresh directory representing a new teammate\'s machine.',
            'Run `git branch -a` inside the clone and identify the remote-tracking branches and the `origin/HEAD` symbolic pointer.',
            'Run `git branch -vv` and note the tracking relationship shown for the local branch.',
            'Open `.git/config` and find the `[branch "main"]` block that clone wrote automatically.',
            'Make a new local commit and re-run `git branch -vv` to confirm `origin/main` did not move on its own.',
          ],
          code: `$ git clone ~/tide-board-remote.git tide-board-asha
Cloning into 'tide-board-asha'...
remote: Enumerating objects: 6, done.
remote: Counting objects: 100% (6/6), done.
Receiving objects: 100% (6/6), 1.02 KiB | 1.02 MiB/s, done.

$ cd tide-board-asha
$ git branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main

$ git branch -vv
* main 3f2a1c9 [origin/main] Add ferry schedule page

$ cat .git/config
[remote "origin"]
	url = ~/tide-board-remote.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "main"]
	remote = origin
	merge = refs/heads/main

$ git commit --allow-empty -m "Asha: local note, not pushed yet"
$ git branch -vv
* main 8d31eef [origin/main: ahead 1] Asha: local note, not pushed yet`,
          pitfalls: [
            '**Assuming clone only downloads the current branch** — it fetches every branch\'s full history by default (shallow clones with `--depth` are a separate, deliberate choice), though only the default branch is checked out locally.',
            '**Confusing `origin/main` with `main`** — one is a read-only remote-tracking bookmark, the other is the real local branch you actually commit on; they only look similar because of the name.',
            '**Trying to commit directly on a remote-tracking branch** like `origin/main` by checking it out plainly — this lands you in detached HEAD instead of on a normal branch.',
            '**Deleting the "origin" entry from `.git/config` by hand** and being surprised when `git fetch`, `git pull`, and `git push` all stop working afterward.',
            '**Treating `origin/HEAD` as a real branch** — it is only a symbolic pointer to whichever branch the remote considers its default, not a branch you can push commits to.',
          ],
          tryIt:
            'Clone your scratch bare repository into a brand-new directory, run `git branch -a` and `git branch -vv` immediately, then make one local commit without pushing and run `git branch -vv` again to see the "ahead" count appear while `origin/main` stays exactly where it was.',
          takeaway:
            'git clone does not just copy files — it wires up an "origin" remote, downloads every branch as a read-only remote-tracking branch, and checks out one local branch already configured to track it.',
        },
        {
          id: 'm4-t3',
          title: 'Fetch vs Pull — The Distinction That Trips Up Beginners',
          explain:
            '`git fetch` downloads new commits and updates your remote-tracking branches only — it never touches your working directory or your local branch; `git pull` is a fetch immediately followed by a merge (or, with `--rebase`, a rebase) into whatever branch you currently have checked out.',
          analogy:
            'Fetching is like walking up to the ferry counter\'s printed noticeboard and reading today\'s updated departure times without doing anything about your own plans yet. Pulling is reading that same noticeboard and immediately rewriting your personal itinerary to match it right there at the counter — you cannot separate the "look" from the "act on it" the way you can with fetch.',
          theory:
            '`git fetch origin` contacts the named remote, downloads any commits, branches, and tags you do not already have, and updates your remote-tracking refs (`refs/remotes/origin/*`) to match what it found. Critically, fetch never modifies your working directory files and never moves your local branch pointer — it is entirely safe to run at any time, as often as you like, with zero risk of losing uncommitted work or triggering a merge you did not ask for.\n\nAfter fetching, you can inspect exactly what changed before deciding what to do about it: `git status` will report your branch as "behind" (or "ahead", or "diverged") relative to the matching remote-tracking branch, and `git log --oneline main..origin/main` shows precisely which commits exist on the remote that your local branch does not have yet.\n\n`git pull` is shorthand for two operations run back to back: first a `git fetch`, then a merge of the newly fetched remote-tracking branch into your current branch (by default, `git merge origin/<current-branch>`). If your branch can simply be fast-forwarded — meaning your local commits are a strict subset of what is now on the remote — pull does a fast-forward with no new commit created. If both sides have diverged, plain `git pull` creates a genuine merge commit joining the two histories.\n\n`git pull --rebase` replaces that second step: instead of merging, it replays your local commits one by one on top of the freshly fetched remote branch, producing new commit SHAs for your local (not-yet-pushed) commits and resulting in a linear history with no merge commit. This can be made the default for a branch or repository with `git config pull.rebase true`. Either form of pull can surface real merge conflicts, exactly as a manual `git merge` or `git rebase` would, if the two histories touch the same lines.',
          whyItMatters:
            'This exact confusion — running `git pull` on reflex and getting a surprise merge commit, or not realizing fetch alone changes nothing you can see — is the single most common beginner stumble on any team repository, including Tide Board once Asha starts pushing her own commits.',
          steps: [
            'From a clone that is behind, run `git fetch origin` and confirm with `git status` that nothing in your working directory changed.',
            'Run `git log --oneline main..origin/main` to see exactly which commits you are missing before merging anything.',
            'Run `git pull` and observe whether Git performs a fast-forward or creates a merge commit.',
            'Make a local commit, have the remote gain a different commit (simulate from another clone), then run `git pull --rebase` and compare the resulting `git log --oneline --graph` to what a plain `git pull` would have produced.',
          ],
          code: `$ git fetch origin
remote: Enumerating objects: 5, done.
remote: Counting objects: 100% (5/5), done.
From ~/tide-board-remote
   3f2a1c9..9b7e410  main       -> origin/main

$ git status
On branch main
Your branch is behind 'origin/main' by 2 commits, and can be fast-forwarded.
  (use "git pull" to update your local branch)

$ git log --oneline main..origin/main
9b7e410 Add high-tide alert banner
7cd1a02 Fix ferry timetable typo

$ git pull
Updating 3f2a1c9..9b7e410
Fast-forward
 ferry.html | 4 ++--
 tide.html  | 2 +-
 2 files changed, 4 insertions(+), 2 deletions(-)

$ git pull --rebase
Current branch main is up to date.`,
          pitfalls: [
            '**Running `git pull` as a pure reflex** without checking what it will do first — fetch, look at `git log main..origin/main`, and decide deliberately whether a merge or rebase is what you actually want.',
            '**Using `pull --rebase` on commits that have already been pushed and pulled by a teammate** — rebasing rewrites commit SHAs, and doing this to shared history leaves your teammate\'s clone diverged from yours in a confusing way.',
            '**Assuming `git fetch` updates your files** — it never touches the working directory, only the remote-tracking refs; if your files look unchanged after a fetch, that is expected, not a bug.',
            '**Reading "Already up to date" from pull and assuming everything is fine** — it can also mean your local branch has no upstream configured at all; check with `git branch -vv` to be sure.',
            '**Re-running `git pull` after a conflict without resolving it** — this just reproduces the same conflict; resolve the markers, `git add` the files, then continue the merge or rebase.',
          ],
          tryIt:
            'On a clone that is behind its remote, run `git fetch origin` first, inspect `git log --oneline main..origin/main` to see exactly what is coming, and only then run `git pull` — compare what you predicted with what actually happened.',
          takeaway:
            'Fetch only downloads and updates bookkeeping; pull additionally merges (or rebases) that into your current branch — always know which one you are about to run.',
        },
        {
          id: 'm4-t4',
          title: 'Pushing and Upstream Tracking',
          explain:
            '`git push` uploads your local commits to a remote branch; `-u` (or `--set-upstream`) additionally records which remote branch your local branch should track by default; a "non-fast-forward" rejection means the remote has commits your local remote-tracking branch does not reflect, and Git refuses to silently overwrite them.',
          analogy:
            'Picture a shared register at a temple prasadam counter where two volunteers log offerings in the same notebook. If someone else has already added three new entries since you last looked, the counter manager will not let you simply staple your new page over theirs — you have to first see what they added and add your entry after it, so nothing already written gets lost.',
          theory:
            '`git push <remote> <branch>` uploads any commits reachable from your local branch tip that the remote does not already have, then — if the update is a fast-forward (your branch tip is a strict descendant of the remote branch\'s current tip) — simply moves the remote branch pointer forward to match, and updates your local `origin/<branch>` remote-tracking ref to match as well.\n\n`git push -u origin main` (equivalently `--set-upstream`) does that same push, plus writes `branch.main.remote = origin` and `branch.main.merge = refs/heads/main` into your config. Once that is set, a plain `git push` or `git pull` with no arguments knows exactly where to go, and commands like `git status` and `git branch -vv` can report ahead/behind counts. You only need to pass `-u` once per branch — after that, the tracking relationship persists.\n\nA "non-fast-forward" rejection happens when the remote branch\'s current tip is not an ancestor of your local branch tip — in other words, the remote has at least one commit you do not have locally, usually because a teammate pushed since your last fetch, or because you rewrote already-pushed commits (an amend or rebase). Git\'s default push refuses this update because a simple pointer move would make those remote-only commits unreachable from the branch — from Git\'s point of view, silently discarding a collaborator\'s work. The exact message is: `! [rejected] main -> main (fetch first)`, followed by a hint explaining that your branch is behind its remote counterpart and needs the remote changes integrated before pushing again.\n\nThe fix is always the same shape and is covered end to end in Topic 6: fetch, then merge or rebase to incorporate what is on the remote, then push again — at which point the push is a genuine fast-forward and succeeds. (Git does allow forcing a non-fast-forward push through with `--force` or the safer `--force-with-lease`, but that mechanism belongs to a later module on rewriting history — the correct default response to a rejection is to integrate, not to force.)',
          whyItMatters:
            'Every time Asha and you both work against the same Tide Board remote, whoever pushes second will eventually hit exactly this rejection — recognizing it as normal, expected behavior rather than a broken repository is the difference between a five-second fix and a panicked force-push that erases a teammate\'s commit.',
          steps: [
            'Make a local commit on Tide Board and run a plain `git push` on a branch with no upstream set — read the "no upstream branch" message carefully.',
            'Push with `git push -u origin main` and note the "set up to track" confirmation.',
            'Make another commit and push again with no arguments — confirm it now works without `-u`.',
            'From a second clone (or directly in the bare repo), add a commit and push it first.',
            'Back in the first clone, make a different commit and attempt to push — read the exact rejection message this produces.',
          ],
          code: `$ git commit -m "Add monsoon closure notice"
[main 4a9f102] Add monsoon closure notice
 1 file changed, 6 insertions(+)

$ git push
fatal: The current branch main has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin main

$ git push -u origin main
Enumerating objects: 4, done.
To ~/tide-board-remote.git
   9b7e410..4a9f102  main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.

$ git commit --allow-empty -m "Tune tide-alert colours"
$ git push
To ~/tide-board-remote.git
   4a9f102..d81e223  main -> main

$ git push
To ~/tide-board-remote.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '~/tide-board-remote.git'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. Integrate the remote changes (e.g.
hint: 'git pull ...') before pushing again.`,
          pitfalls: [
            '**Skipping `-u` on the very first push** and then being puzzled every time afterward that plain `git push` or `git pull` demand explicit remote and branch names.',
            '**Reaching straight for `git push --force`** the moment a rejection appears — this overwrites the remote branch with your version, discarding whatever commit caused the rejection in the first place.',
            '**Reading a non-fast-forward rejection as a broken repository** — it is Git working exactly as designed, refusing to silently drop commits it cannot see reachable from your push.',
            '**Not realizing an amend or rebase on commits you already pushed** will itself cause your very next ordinary push to be rejected as non-fast-forward, even if nobody else touched the remote.',
            '**Mistyping the remote or branch name on a manual push** because `-u` was never set, sending commits to an unintended branch.',
          ],
          tryIt:
            'Push a commit with `-u origin main`, then — from a second clone of the same bare repository, or by committing directly in a throwaway clone — push a different commit first, then return to your original clone and attempt to push to trigger a real "! [rejected] ... (fetch first)" message, reading every line of the hint before doing anything about it.',
          takeaway:
            'A non-fast-forward rejection is Git refusing to blindly overwrite commits on the remote that you do not have locally yet — fetch and integrate them first, do not force past it.',
        },
      ],
    },
    {
      id: 'm4-s2',
      title: 'Working With Others on One Remote',
      topics: [
        {
          id: 'm4-t5',
          title: 'Remote-Tracking Branches In Depth',
          explain:
            '`origin/main` is a local, read-only snapshot of what `main` looked like on the remote as of your last fetch, pull, or push — a completely separate ref from your own local `main` branch — and `git branch -vv` is the command that shows both, and their relationship, at a glance.',
          analogy:
            'Your local `main` is like your own wristwatch, ticking forward with every commit you make. `origin/main` is more like a photo you took of the ferry office\'s wall clock this morning — accurate at the moment you took it, but it will not update itself just because time keeps passing at the harbor; you have to walk back and take a new photo (fetch) to know what it says now.',
          theory:
            'Git keeps two entirely separate ref namespaces that are easy to conflate because their names look similar: `refs/heads/main` is your real local branch, the one you commit on and move with every `git commit`; `refs/remotes/origin/main` is a remote-tracking branch, a local bookmark recording what `main` looked like on the "origin" remote the last time Git talked to it. You can see both namespaces directly under `.git/refs/` or with `git for-each-ref`.\n\nRemote-tracking branches only ever move for one of four reasons: a clone creates them initially, a fetch updates them to match what is currently on the remote, a pull does the same (as part of its fetch step) before merging or rebasing, and a push moves your local remote-tracking ref to match the remote immediately after a successful push — without requiring a separate fetch. Nothing else moves them; they are not affected by your local commits, checkouts, or merges on your own branch.\n\nThe command that makes all of this visible at once is `git branch -vv`, which lists each local branch with its current commit SHA, its tracking branch in brackets, and (when relevant) an ahead/behind count — for example `[origin/main: ahead 1, behind 2]` means your local branch has one commit the remote does not have, and the remote has two commits you do not have. When a branch is fully caught up, the brackets show just the tracking branch name with no counts at all. `git status` reports the same information in prose form, including the phrase "have diverged" when both ahead and behind counts are non-zero.\n\nA local branch can track any remote branch, or none at all — `git branch --set-upstream-to=origin/ferry-eta` wires up tracking after the fact if it was never set at creation time. For a more detailed remote-wide summary, including which local branches are tracking which remote branches and which remote branches no longer exist, `git remote show origin` is the command to reach for.',
          whyItMatters:
            'Reading `git branch -vv` correctly, every time, before deciding to push or pull is exactly the daily habit that would have let you see the Topic 4 rejection coming — "behind" always means fetch and integrate before you push.',
          steps: [
            'On a Tide Board clone with an existing remote, run `git branch -vv` and identify the tracking branch and any ahead/behind counts shown.',
            'Make a local commit without pushing, then run `git branch -vv` again and note the "ahead" count change.',
            'From another clone (or the bare repo), add a commit to the remote, then run `git fetch` in your clone and observe the "behind" count appear.',
            'Run `git status` and compare its prose description of the same divergence to what `-vv` showed.',
            'Push your local commit and confirm `git branch -vv` reports the branch as caught up again.',
          ],
          code: `$ git branch -vv
* main    4a9f102 [origin/main: ahead 1, behind 2] Tune tide-alert colours
  ferry-eta 88ac331 [origin/ferry-eta] Add ETA countdown widget

$ git status
On branch main
Your branch and 'origin/main' have diverged,
and have 1 and 2 different commits each, respectively.
  (use "git pull" to merge the remote branch into yours)
  (use "git push" to publish your local commits)

$ git branch -r
  origin/HEAD -> origin/main
  origin/ferry-eta
  origin/main`,
          pitfalls: [
            '**Editing files on `origin/main` expecting it to update the real remote** — it is local-only bookkeeping; only fetch, pull, and push ever move it.',
            '**Reading "ahead 1, behind 2" as an error state** — it is accurate divergence information, not a problem; it is resolved the normal way, with a merge or rebase followed by a push.',
            '**Trusting `origin/main` as if it always matches the server right now** — it is only as fresh as your last fetch; run `git fetch` first if you need current information.',
            '**Deleting a local branch and assuming its remote-tracking counterpart disappears with it** — it does not, until a prune removes it (Topic 7).',
            '**Confusing `git branch -r` (remote-tracking branches only) with `git branch -a` (everything)** and double-counting branches when comparing the two lists.',
          ],
          tryIt:
            'On a Tide Board clone, run `git branch -vv` before making any changes, then after committing locally without pushing, then after a teammate\'s commit lands on the remote and you fetch it — write down which bracketed number changed at each step and why.',
          takeaway:
            '`origin/main` is your last-seen snapshot of the remote, not the remote itself — `git branch -vv` is how you check whether that snapshot is stale before you push or pull.',
        },
        {
          id: 'm4-t6',
          title: 'Resolving a Push Conflict End to End',
          explain:
            'When a push is rejected as non-fast-forward, the fix is always the same three-step recipe: fetch the remote\'s new commits, integrate them into your branch with a merge or a rebase, then push again.',
          analogy:
            'Picture two people editing the same shared shopping list app while both are briefly offline. Whoever reconnects second cannot just upload their version and erase what the first person already added — they first have to pull in the other person\'s items, reconcile any item both of them edited, and only then does the app accept the updated list.',
          theory:
            'Step one is always `git fetch origin` — safe by definition, since fetch only updates your `origin/main` remote-tracking ref and never touches your working directory or local branch.\n\nStep two is choosing how to integrate what fetch just downloaded. A merge (`git merge origin/main`) creates a genuine merge commit joining both histories when they have truly diverged, or simply fast-forwards if that is still possible; it preserves the exact commit history of both sides, and any conflicting lines are resolved the normal way — edit the affected files to their intended final content, remove the `<<<<<<<` / `=======` / `>>>>>>>` conflict markers, `git add` the resolved files, then `git commit` (or `git merge --continue`). A rebase (`git rebase origin/main`) instead replays your local commits one at a time on top of the remote\'s current tip, producing new commit SHAs for those local commits and yielding a linear history with no merge bubble; conflicts here are resolved per-commit with `git add` followed by `git rebase --continue` (or `--skip` to drop a commit, or `--abort` to bail out entirely and return to exactly where you started).\n\n`git pull` and `git pull --rebase` are simply steps one and two combined into a single command, using merge or rebase respectively.\n\nStep three is `git push` again — now a genuine fast-forward from the remote\'s point of view, because your branch tip is a strict descendant of the remote\'s current tip, so it succeeds without any rejection.\n\nFor this specific scenario — integrating a teammate\'s already-pushed commits into your own not-yet-pushed local commits — rebase is safe precisely because the commits being rewritten are still only local; nobody else has fetched or built on top of them yet. The rule to hold onto going forward is the opposite direction: never rebase commits that have already been pushed and that someone else may already have fetched or based new work on top of.',
          whyItMatters:
            'This is the single most common recurring task of working against any shared remote — resolving a rejection calmly with fetch, then merge or rebase, then push, rather than reaching for `--force`, is what separates a comfortable collaborator from someone who accidentally erases a teammate\'s work.',
          steps: [
            'Reproduce the rejected push from Topic 4: push a commit from a second clone first, then attempt to push a different local commit from your original clone.',
            'Run `git fetch origin` and inspect the divergence with `git log --oneline --graph --all`.',
            'Integrate the remote\'s commit with `git merge origin/main`, resolving any conflict markers if the same file was touched on both sides.',
            'Push again and confirm it now succeeds as a fast-forward from the remote\'s perspective.',
            'On a fresh copy of the same starting point, repeat the integration using `git rebase origin/main` instead, and compare the resulting `git log --oneline --graph` between the merge version and the rebase version.',
          ],
          code: `$ git push
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '~/tide-board-remote.git'

$ git fetch origin
From ~/tide-board-remote
   4a9f102..d0f5aa9  main       -> origin/main

$ git log --oneline --graph --all
* d0f5aa9 (origin/main) Add jetty maintenance notice
| * 7b1c990 (HEAD -> main) Tune tide-alert colours
|/
* 4a9f102 Add monsoon closure notice

$ git merge origin/main
Auto-merging tide.html
Merge made by the 'ort' strategy.
 tide.html | 3 ++-
 1 file changed, 2 insertions(+), 1 deletion(-)

$ git push
To ~/tide-board-remote.git
   d0f5aa9..9e21a77  main -> main

# --- same starting point, resolved with rebase instead ---
$ git rebase origin/main
Auto-merging tide.html
Successfully rebased and updated refs/heads/main.

$ git push
To ~/tide-board-remote.git
   d0f5aa9..c44aa10  main -> main`,
          pitfalls: [
            '**Force-pushing the instant a rejection appears** instead of fetching and integrating first — this can permanently discard a teammate\'s already-shared commits.',
            '**Leaving conflict markers in a file by accident** and committing them — always search the file for `<<<<<<<` before finishing a merge or rebase.',
            '**Rebasing commits that a teammate has already fetched or pulled** — this rewrites history they have already based new work on, leaving their clone diverged from yours in a confusing way.',
            '**Panicking mid-rebase and leaving the repository half-resolved** — `git rebase --abort` always returns cleanly to exactly the state before the rebase started.',
            '**Running `git pull` blindly during a conflict** and being surprised by a merge commit appearing when a linear rebase history was actually wanted, or vice versa.',
          ],
          tryIt:
            'Recreate the two-directory push-rejection scenario from Topic 4 on a scratch bare repository, resolve it once with a merge, then reset to the same starting point and resolve it again with a rebase, comparing the two resulting `git log --oneline --graph` outputs side by side.',
          takeaway:
            'A rejected push is resolved with the same three commands every time: fetch, then merge or rebase, then push again.',
        },
        {
          id: 'm4-t7',
          title: 'Deleting Remote Branches and Pruning Stale Refs',
          explain:
            '`git push origin --delete` removes a branch from the remote itself, while `git fetch --prune` (or `git remote prune origin`) cleans up your own local `origin/*` remote-tracking bookmarks for branches that no longer exist on the remote — two separate cleanups for two separate problems.',
          analogy:
            'Deleting a remote branch is like physically taking a notice down from the harbor\'s public noticeboard — it is really gone, for everyone. Pruning is more like updating your own personal notebook copy of that noticeboard afterward, so it stops listing a notice that has already been taken down; your notebook does not update itself just because the real board changed.',
          theory:
            '`git push origin --delete <branch>` (equivalently, the older `git push origin :<branch>` syntax) deletes that branch\'s ref on the remote itself. This is a real deletion that affects every clone of that remote — once it is gone, nobody can fetch it as a live branch anymore. The commits themselves are not necessarily destroyed immediately; they can remain in the repository\'s object database, reachable via reflog or another branch or tag, until they become genuinely unreferenced and eligible for garbage collection.\n\nDeleting a branch on the remote does not, by itself, remove anyone else\'s local remote-tracking ref for it. Every other clone that had fetched that branch still has its own `origin/<branch>` bookmark sitting around locally, pointing at the last commit it saw, until that clone specifically cleans it up.\n\n`git fetch --prune` performs that cleanup as part of an ordinary fetch: it removes any local remote-tracking branch whose corresponding branch no longer exists on the remote. `git remote prune origin` does the identical cleanup without also fetching new commits, and supports a `--dry-run` flag to preview what would be removed before actually removing it. This behavior can be made automatic on every future fetch with `git config fetch.prune true` (or `git config remote.origin.prune true` for just one remote), so you never have to remember to run it by hand.\n\nIt is worth being explicit about what pruning does not do: `git branch -d` or `-D` only ever deletes a *local* branch, and never touches the remote or any remote-tracking ref — a frequent point of confusion when someone expects one of these commands to substitute for the other.',
          whyItMatters:
            'Once a Tide Board feature branch has been reviewed and merged, deleting it on the remote and periodically pruning keeps `git branch -r` from silently accumulating dozens of dead entries that make it easy to accidentally branch off work that no longer exists anywhere real.',
          steps: [
            'Push a new branch to the shared remote with `git push -u origin <branch>`.',
            'Delete it on the remote with `git push origin --delete <branch>`.',
            'From a different clone that had already fetched it, run `git branch -r` and confirm the stale `origin/<branch>` entry is still listed.',
            'Run `git fetch --prune` in that clone and confirm the stale entry is now gone.',
            'Confirm any local branch of the same name in that clone was left completely untouched by the prune.',
          ],
          code: `$ git push -u origin ferry-eta
Enumerating objects: 3, done.
 * [new branch]      ferry-eta -> ferry-eta
Branch 'ferry-eta' set up to track remote branch 'ferry-eta' from 'origin'.

$ git push origin --delete ferry-eta
To ~/tide-board-remote.git
 - [deleted]         ferry-eta

$ git branch -r
  origin/HEAD -> origin/main
  origin/ferry-eta
  origin/main

$ git fetch --prune
From ~/tide-board-remote
 x [deleted]         (none)     -> origin/ferry-eta

$ git branch -r
  origin/HEAD -> origin/main
  origin/main

$ git branch
* ferry-eta
  main`,
          pitfalls: [
            '**Confusing `git branch -d ferry-eta` with `git push origin --delete ferry-eta`** — the first only ever deletes the local branch, the second deletes the remote branch; doing one and assuming the other happened too leaves stale state somewhere.',
            '**Leaving stale `origin/<branch>` entries around indefinitely** — it becomes easy to accidentally branch off one that no longer represents any real, current work.',
            '**Assuming deleting a remote branch instantly frees space or destroys the commits** — they can persist, reachable via reflog or another ref, until garbage collection actually runs.',
            '**Manually running `git remote prune origin` forever out of habit** — setting `fetch.prune true` once makes ordinary fetches prune automatically, with no extra step needed.',
            '**Being surprised a local branch vanished after pruning** — pruning only ever removes remote-tracking refs; it never deletes a local branch, even one sharing the same name.',
          ],
          tryIt:
            'Push a throwaway branch to your shared bare repository from one clone, delete it there with `--delete`, confirm from a second clone that `git branch -r` still lists it, then run `git fetch --prune` in that second clone and confirm it disappears — while any local branch of the same name stays exactly as it was.',
          takeaway:
            'Deleting a remote branch and pruning your local remote-tracking refs are two separate steps — delete on the remote, then prune locally (or let everyone\'s next `fetch --prune` handle it automatically).',
        },
        {
          id: 'm4-t8',
          title: '.gitignore Basics and a First Look at .gitattributes',
          explain:
            '`.gitignore` tells Git which untracked files to never offer for staging — build output, secrets, OS clutter — while `.gitattributes` tells Git how to treat files it already tracks, most commonly normalizing line endings across a team using different operating systems.',
          analogy:
            'Picture a shared kitchen at a community kitchen counter. A posted note (`.gitignore`) says which leftover scraps never go on the communal shelf in the first place. A separate label on each dish already on the shelf (`.gitattributes`) says how that particular dish should be handled — "keep refrigerated," "reheat before serving" — so everyone treats the same dish the same way, no matter who put it there.',
          theory:
            '`.gitignore` is a plain text file, usually committed at the repository root (additional ones can also live in subdirectories for local rules), containing one glob pattern per line. Any untracked path matching a pattern is hidden from `git status` and from a bare `git add .` — patterns include things like `node_modules/` (a trailing slash restricts the match to directories), `*.log` (any file ending in .log, anywhere), `!keep-this.log` (a negation re-including a specific file that an earlier broad pattern excluded), and `/only-at-root.txt` (a leading slash anchors the pattern to the repository root rather than matching at any depth).\n\nThe critical limitation to understand is that `.gitignore` only ever affects files Git is not already tracking. If a file was committed before it was added to `.gitignore`, adding it there afterward does nothing — `git status` will still show it as tracked and modified. To actually stop tracking it, you must run `git rm --cached <file>` (which removes it from version control while leaving the file on disk), commit that removal, and only then will the `.gitignore` rule take effect going forward.\n\nFor personal clutter that should not be forced onto every teammate\'s copy of the repository — editor folders, OS artifacts like `.DS_Store` or `Thumbs.db` — a global ignore file configured once with `git config --global core.excludesFile ~/.gitignore_global` is the right place, rather than adding personal preferences to the repository\'s own `.gitignore`. `git check-ignore -v <path>` is the debugging command that shows exactly which `.gitignore` file and line is (or is not) matching a given path.\n\n`.gitattributes`, also typically committed at the repository root, controls how Git handles paths it already tracks. The single most common line on a team spanning multiple operating systems is `* text=auto`, which tells Git to normalize line endings to LF inside the repository regardless of what a contributor\'s editor or OS produced, converting to the platform-appropriate ending on checkout where configured to do so. `.gitattributes` can also mark specific file types as binary (`*.png binary`) so Git never attempts to diff or three-way-merge them as if they were text, and can configure custom merge strategies for generated files. The distinction worth remembering: `.gitignore` means "do not track this file at all"; `.gitattributes` means "this file is tracked, but handle it in this specific way."',
          whyItMatters:
            'The moment a second machine and operating system — Asha\'s laptop — touches Tide Board, untracked build artifacts and CRLF-versus-LF line-ending churn become real, recurring nuisances, and a two-file, few-line fix at the start of a project prevents them permanently.',
          steps: [
            'Create a `.gitignore` in Tide Board covering a build output folder, a log file pattern, and a common OS artifact.',
            'Generate a few matching files and confirm with `git status` that none of them appear.',
            'Use `git check-ignore -v` on one of them to see which line matched.',
            'Accidentally commit a file that should have been ignored, then add it to `.gitignore`, and notice `git status` still shows it as tracked until you run `git rm --cached` on it.',
            'Add a `.gitattributes` file with `* text=auto` (and a binary rule for an image type) and commit both files.',
          ],
          code: `$ cat > .gitignore <<'EOF'
build/
*.log
.DS_Store
EOF
$ mkdir build && touch build/output.html debug.log
$ git status
On branch main
nothing to commit, working tree clean

$ git check-ignore -v debug.log
.gitignore:2:*.log	debug.log

$ echo "local secret" > config.local.json
$ git add config.local.json
$ git commit -m "oops, tracked a local config by mistake"
$ echo "config.local.json" >> .gitignore
$ git status
On branch main
Changes not staged for commit:
	modified:   config.local.json

$ git rm --cached config.local.json
rm 'config.local.json'
$ git commit -m "Stop tracking config.local.json"
$ git status
On branch main
nothing to commit, working tree clean

$ cat > .gitattributes <<'EOF'
* text=auto
*.png binary
EOF
$ git add .gitignore .gitattributes
$ git commit -m "Add .gitignore and .gitattributes for shared-repo hygiene"`,
          pitfalls: [
            '**Adding an already-tracked file to `.gitignore` and expecting it to vanish from `git status`** — it will not, until `git rm --cached` removes it from tracking first.',
            '**Committing OS-specific junk like `.DS_Store` or `Thumbs.db` into the shared repository** instead of a personal global ignore file, forcing it onto every teammate\'s clone.',
            '**Skipping `.gitattributes` on a mixed-OS team** and later hitting huge whole-file diffs that are really just line-ending churn (CRLF vs LF), not genuine content changes.',
            '**Writing an overly broad pattern** like `*.json` that accidentally hides a real configuration file the whole team actually needs tracked.',
            '**Assuming `.gitignore` retroactively affects already-staged or already-committed files** — it only ever governs untracked files going forward.',
          ],
          tryIt:
            'In Tide Board, add a `.gitignore` covering a fake `build/` folder and a `*.log` pattern, confirm generated files never show up in `git status`, deliberately track-then-ignore-then-untrack one file with `git rm --cached`, and add a one-line `.gitattributes` for line-ending normalization.',
          takeaway:
            '`.gitignore` keeps untracked clutter out of `git status` entirely; `.gitattributes` governs how files Git already tracks are diffed, merged, and normalized — most commonly, line endings across a team.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm4-p1',
      type: 'Project',
      title: 'Two-Laptop Simulation',
      domain: 'Remote Collaboration',
      duration: '2-3 hrs',
      description:
        'Using two local folders standing in for two separate laptops — yours and Asha\'s — you push to and pull from one shared local bare repository, deliberately causing a real non-fast-forward push rejection and then resolving it the correct way instead of forcing past it. This project turns the fetch-integrate-push recipe from this module into muscle memory, entirely offline, before any GitHub-specific workflow is introduced.',
      tools: ['Git', 'Terminal'],
      blueprint: {
        overview:
          'This project proves you can operate comfortably against a shared remote with more than one contributor pushing to it, including surviving a genuine push rejection without losing anyone\'s work. Everything runs against a local bare repository, so it needs no GitHub account and no network access.',
        functionalRequirements: [
          'A single shared bare repository exists on disk representing "the remote" (for example `./tide-board-remote.git`), created with `git init --bare`.',
          'Two independent working clones of that bare repository exist locally: one representing your own laptop and one representing Asha\'s laptop, cloned from the same shared bare repo.',
          'Both clones\' local `main` branches are correctly configured to track `origin/main`, verified with `git branch -vv` in each.',
          'A real non-fast-forward push rejection is deliberately produced: the "Asha" clone commits and pushes first, then the "you" clone commits different, unfetched content and its push is rejected.',
          'The rejection is resolved properly — fetch, then merge or rebase, then push — rather than forced away, and the shared bare repository ends up containing both sets of changes.',
          'A throwaway branch created during the exercise is deleted from the remote and pruned from the other clone\'s remote-tracking refs before finishing.',
        ],
        technicalImplementation: [
          '`git init --bare ./tide-board-remote.git` creates the shared stand-in remote.',
          '`git clone ./tide-board-remote.git ./tide-board-you` and `git clone ./tide-board-remote.git ./tide-board-asha` create the two simulated laptops.',
          'Seed the bare repository with one initial commit (minimal `tide.html` and `ferry.html`) from a temporary clone before the two simulated laptops branch off into parallel work, so both start from identical shared history.',
          'Each clone edits a genuinely overlapping part of the same file (not just two unrelated files) at least once, so a real merge conflict is possible to encounter and resolve, not just a trivial fast-forward.',
          'Only plain Git commands are used throughout — `fetch`, `merge`/`rebase`, `push`, `branch -vv`, `push --delete`, `fetch --prune` — the whole exercise runs offline against local paths, with no GitHub involved.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Set up the shared bare repo and two clones',
            outcome:
              'A shared bare repository exists, seeded with an initial commit, and two independently cloned working directories both correctly track origin/main.',
            prompt:
              'In my scratch workspace, create a bare Git repository at ./tide-board-remote.git using `git init --bare`. Then, from a temporary clone, create a small seed commit for Tide Board (a minimal tide.html and ferry.html) and push it to that bare repository as main. Next, create two separate clones of ./tide-board-remote.git named ./tide-board-you and ./tide-board-asha, representing my laptop and my teammate Asha\'s laptop. Show me `git branch -vv` run inside each clone to confirm both correctly track origin/main.',
          },
          {
            step: 2,
            label: 'Asha pushes first',
            outcome:
              'The shared bare repository\'s main branch now contains a new commit pushed from the "Asha" clone.',
            prompt:
              'Inside ./tide-board-asha, edit ferry.html to add a new evening ferry timing, commit it with a clear message, and push it to origin main. Show me the push output, then show me `git log --oneline` confirming the shared bare repository\'s main branch now includes this commit.',
          },
          {
            step: 3,
            label: 'Cause a real non-fast-forward rejection',
            outcome:
              'A push attempted from the "you" clone is rejected because it does not yet have Asha\'s new commit.',
            prompt:
              'Inside ./tide-board-you, without fetching first, edit tide.html to add a new high-tide warning note, commit it locally, and attempt `git push`. Show me the exact rejection message Git prints, and then show me `git branch -vv` confirming my local origin/main tracking ref is still behind the shared bare repository at this point.',
          },
          {
            step: 4,
            label: 'Resolve the conflict properly and push',
            outcome:
              'The "you" clone\'s commit is fetched-and-integrated with Asha\'s commit and successfully pushed, and the shared repository ends up with both changes present.',
            prompt:
              'Inside ./tide-board-you, run `git fetch origin`, inspect the divergence with `git log --oneline --graph --all`, then integrate Asha\'s commit using `git merge origin/main`, resolving any conflict if tide.html and ferry.html happen to overlap, and push successfully. Then, from ./tide-board-asha after a fresh `git pull`, confirm both my high-tide warning commit and Asha\'s ferry timing commit are present in the shared history with `git log --oneline --graph`.',
          },
          {
            step: 5,
            label: 'Clean up a throwaway branch',
            outcome:
              'A throwaway branch is deleted from the remote and its stale remote-tracking ref is pruned from the other clone.',
            prompt:
              'From ./tide-board-you, create and push a throwaway branch called scratch-note, then delete it on the remote with `git push origin --delete scratch-note`. Show me that ./tide-board-asha\'s `git branch -r` still lists origin/scratch-note until I run `git fetch --prune` inside it, after which confirm it is gone.',
          },
        ],
        deliverable:
          'A shared bare repository whose main branch contains both the high-tide warning commit and the ferry timing commit, merged (or rebased) together with no conflict markers left in any file. Both the ./tide-board-you and ./tide-board-asha clones show a clean, non-diverged `git branch -vv` tracking origin/main, and `git log --oneline --graph --all` matches between them. The scratch-note branch is deleted from the remote and no longer appears in either clone\'s `git branch -r` after pruning.',
      },
    },
  ],
  quiz: [
    {
      id: 'm4-q1',
      q: 'You want to check whether Asha has pushed anything new to Tide Board\'s origin/main, but you are not ready to merge her changes into your working branch yet. Which command should you run?',
      options: [
        'git fetch origin',
        'git pull',
        'git push origin main',
        'git merge origin/main',
      ],
      answer: 0,
    },
    {
      id: 'm4-q2',
      q: 'What is origin/main, precisely?',
      options: [
        'The actual branch stored on the remote server itself',
        'A read-only local bookmark showing where main last was on the remote as of your last fetch, pull, or push',
        'A local branch you can commit directly on, identical to main',
        'A tag automatically created every time you push',
      ],
      answer: 1,
    },
    {
      id: 'm4-q3',
      q: 'Your git push is rejected with "! [rejected] main -> main (fetch first)". What is Git actually protecting against?',
      options: [
        'A syntax error in your last commit message',
        "Exceeding the remote repository's storage quota",
        'Silently overwriting commits on the remote that you do not yet have locally',
        'Pushing to a branch that does not exist yet',
      ],
      answer: 2,
    },
    {
      id: 'm4-q4',
      q: 'A teammate deleted the feature/ferry-eta branch on the shared remote a week ago, but your local git branch -r still lists origin/ferry-eta. What should you run, and why?',
      options: [
        'git branch -d ferry-eta, because it deletes the stale remote-tracking ref',
        "git fetch --prune (or git remote prune origin), because deleting a remote branch does not automatically remove other clones' local remote-tracking refs",
        'git push origin --delete ferry-eta, because the branch still technically needs deleting again',
        'Nothing — stale remote-tracking refs are removed automatically on the next commit',
      ],
      answer: 1,
    },
    {
      id: 'm4-q5',
      q: 'After cloning Tide Board fresh and creating a new local branch ferry-eta with no upstream configured, what does "git push -u origin ferry-eta" do that a plain "git push origin ferry-eta" would not?',
      options: [
        'It force-pushes even if the push would be non-fast-forward',
        'It creates a remote-tracking branch on the remote server, which fetch would not otherwise do',
        'It deletes any existing ferry-eta branch on the remote before pushing',
        'It also records that local ferry-eta tracks origin/ferry-eta, so future plain git push/git pull on this branch need no arguments',
      ],
      answer: 3,
    },
  ],
}
