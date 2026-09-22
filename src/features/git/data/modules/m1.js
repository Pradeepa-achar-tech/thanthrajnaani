// Module 1 — Branching & Merging
// Git Mastery course content for the React course player.
// Grows the Tide Board repo from a solo, single-line history into a
// two-person branching project, ending with a real, hand-resolved conflict.

export const m1 = {
  id: 'm1',
  title: 'Branching & Merging',
  hours: 7,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    "This module turns Tide Board from a single-line history into a real branching project: you'll learn that a **branch** is nothing more than a movable pointer to a commit, what **HEAD** actually tracks (including the trap of a **detached HEAD**), and the modern split between `git switch`, `git restore`, and the older `git checkout`. Then you'll merge for real — telling a clean **fast-forward** apart from a true **three-way merge**, reading and resolving actual conflict markers, and building the habit of merging small and often so conflicts stay rare and readable instead of huge and terrifying.",
  sections: [
    {
      id: 'm1-s1',
      title: 'Branches Are Just Pointers',
      topics: [
        {
          id: 'm1-t1',
          title: 'What a Branch Actually Is (and What HEAD Means)',
          explain:
            'A Git branch is not a copy of your files — it is a small movable pointer to one commit, and HEAD is the pointer that tracks which branch (or which commit, if detached) you currently have checked out.',
          analogy:
            "Think of the commit history as a shelf of numbered ledger pages, each page pointing back to the page before it. A branch is a sticky note with a name on it, stuck onto one page — 'main' stuck to page 40. Move the sticky note to a different page and the branch now means something else, even though no ledger page itself changed. HEAD is a second, special sticky note that says 'you are standing here' — normally it sits on top of one of the named notes; peel it off onto a bare page instead and you're in detached HEAD, standing on a page with no name attached to it.",
          theory:
            "Every commit in Git is an object with a fixed identity — its SHA — and a pointer back to its parent commit(s). A **branch** is nothing more than a small file under `.git/refs/heads/<name>` that holds one thing: the SHA of the commit it currently points at. Creating a branch is cheap precisely because of this — Git writes a 41-byte text file, it does not copy a single line of your project. When you commit while a branch is checked out, Git creates the new commit object first (pointing at the old tip as its parent), then rewrites that one small ref file so the branch name now points at the new commit. The branch pointer always moves forward to whatever you just committed; nothing else about it is magic.\n\n**HEAD** is a separate, special pointer that tracks where *you* currently are. Almost all the time HEAD is a *symbolic* ref — literally the text `ref: refs/heads/main` living in `.git/HEAD` — meaning \"HEAD means whatever main currently means.\" When you `git switch` to a different branch, Git rewrites that one line so HEAD now says `ref: refs/heads/<other-branch>` instead. Committing normally therefore moves two things in sequence: first the branch pointer advances, and HEAD — being symbolic — advances automatically along with it, because it was only ever pointing at the branch's name, not at a commit directly.\n\n**Detached HEAD** is what happens when you check out something that is *not* a branch name — a raw commit SHA, a tag, a remote-tracking branch like `origin/main` directly, or a relative reference like `HEAD~3`. In that case Git can't write `ref: refs/heads/<name>` into HEAD because there is no branch name to reference, so instead HEAD is written directly with a commit SHA. Git will print a clear warning: `You are in 'detached HEAD' state at a1b2c3d`. You can look around freely here, and you can even commit — Git will happily build new commit objects on top of wherever you are. The catch is that no branch ref is tracking those new commits; only HEAD points at them. The instant you `git switch` away to a named branch, HEAD moves and those detached commits become unreachable from any ref — not deleted, just orphaned, until Git's garbage collector eventually cleans them up (by default, unreferenced commits are kept for at least 30 days via reflog expiry before `git gc` prunes them, so there is a real but not infinite safety net).\n\nThe fix, if you realize mid-detached-HEAD that you want to keep what you did, is simple: run `git switch -c some-name` *before* switching away. That snaps a real branch pointer onto your current detached position, turning \"orphaned commits\" into \"a normal branch\" instantly. If you already switched away and think you lost work, `git reflog` is your recovery tool — it logs every place HEAD has pointed recently, including that abandoned detached SHA, so you can find it and `git switch -c` onto it after the fact.",
          whyItMatters:
            "So much day-to-day Git confusion — \"where did my commit go,\" \"why does git status say detached HEAD,\" \"why did switching branches change my files\" — traces straight back to not having this exact mental model. On Tide Board, once Asha and Ravi join, you'll be creating and switching branches constantly; knowing precisely what moves (a small ref) versus what doesn't (your commit objects, which are never copied or lost by a branch operation) is what keeps that routine instead of stressful.",
          steps: [
            'In the Tide Board repo, run `git log --oneline --graph --decorate` to see exactly where `main` and `HEAD` currently point.',
            'Look at the raw ref files: `cat .git/HEAD` and `cat .git/refs/heads/main` to see that a branch really is just a text file holding a commit SHA.',
            'Detach HEAD on purpose: `git checkout <an-earlier-commit-sha>` and read the warning message Git prints.',
            'Make a throwaway commit while detached, confirm it with `git log -1`, then `git switch main` and notice the commit seems to vanish from view.',
            'Recover it with `git reflog` to find the orphaned SHA, then `git switch -c rescued-branch <sha>` to give it a real name again.',
            'Delete the practice branch once you have confirmed the recovery worked: `git branch -D rescued-branch`.',
          ],
          code: `$ git log --oneline --graph --decorate
* 7d9f2a1 (HEAD -> main) Add ferry timetable page
* 3c5e8f2 Add tide chart for July
* 9b1d3f5 Initial Tide Board scaffold

$ cat .git/HEAD
ref: refs/heads/main

$ cat .git/refs/heads/main
7d9f2a1c4e6b8d0f3a5c7e9b1d3f5a7c9e1b3d5f

$ git checkout 3c5e8f2
Note: switching to '3c5e8f2'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.
...
HEAD is now at 3c5e8f2 Add tide chart for July

$ echo "scratch note" >> notes.txt
$ git add notes.txt && git commit -m "experiment while detached"
[detached HEAD a1b2c3d] experiment while detached
 1 file changed, 1 insertion(+)

$ git switch main
Warning: you are leaving 1 commit behind, not connected to
any of your branches:

  a1b2c3d experiment while detached

$ git reflog
a1b2c3d HEAD@{1}: commit: experiment while detached
3c5e8f2 HEAD@{2}: checkout: moving from main to 3c5e8f2
7d9f2a1 HEAD@{3}: checkout: moving from ferry-page to main

$ git switch -c rescued-branch a1b2c3d
Switched to a new branch 'rescued-branch'`,
          pitfalls: [
            "**Thinking a branch is a copy of your files.** It shares every commit object with every other branch that reaches them; only the tiny ref file differs. Fix: remember 'branch = pointer', not 'branch = folder full of files'.",
            "**Committing on detached HEAD, switching away, and assuming the work is gone forever.** It's orphaned, not deleted — `git reflog` finds it. Fix: check reflog before panicking, and ideally `git switch -c` before you leave detached HEAD in the first place.",
            "**Checking out a tag and not realizing it detaches HEAD.** Tags look like branch names in commands but point at a fixed commit, not a moving pointer. Fix: if you want to build on a tagged commit, immediately `git switch -c` off it.",
            "**Reading 'HEAD detached at abc1234' as an error.** It's informational, not a failure — Git is just telling you HEAD isn't attached to a branch right now. Fix: only worry if you make commits there you intend to keep, and branch them before leaving.",
            "**Assuming HEAD always means 'the latest commit on main'.** HEAD means 'wherever you currently are' — that could be any branch, or a raw commit with no branch at all. Fix: run `git status` or `git branch --show-current` when unsure.",
            "**Trusting reflog as a permanent backup.** Entries expire (roughly 90 days for reachable, 30 days for unreachable, by default) and a `git gc` can prune truly orphaned commits after that. Fix: for anything you actually care about, attach a branch name promptly rather than relying on reflog long-term.",
          ],
          tryIt:
            'Deliberately detach HEAD, make two commits, switch back to main, then recover both commits using only `git reflog` and `git switch -c` — no undo button needed. This is genuinely how experienced Git users get "lost" work back.',
          takeaway:
            'A branch is just a name pointing at a commit, HEAD is just a pointer to your current branch (or, when detached, straight at a commit) — nothing is copied, and nothing is truly lost until Git actually garbage-collects it.',
        },
        {
          id: 'm1-t2',
          title: 'Creating, Switching, Renaming, and Deleting Branches',
          explain:
            'Git gives you both a modern, branch-only command (`git switch`) and the older, do-everything command (`git checkout`) to move between branches, alongside `git branch` for creating, listing, renaming, and deleting them.',
          analogy:
            "A harbor has one main jetty (main) and small floating pontoons (branches) tied off it for a season's extra boats. `git branch new-name` ties a new pontoon to whatever berth you're currently standing at — but you're still standing on the jetty; you have to physically step onto the new pontoon yourself. `git switch -c` does both in one motion: it builds the pontoon and steps you onto it at the same time.",
          theory:
            "`git branch` with no arguments lists every local branch, with a `*` (and usually a colour) marking whichever one you currently have checked out. `git branch <name>` creates a new branch pointer at your current commit — critically, it does **not** switch you onto it; you stay exactly where you were. You can also create off any other point with `git branch <name> <start-point>`, where `<start-point>` can be another branch, a tag, or a raw commit SHA — the new branch does not have to start from HEAD.\n\nTo actually move onto a branch, use `git switch <name>` (added in Git 2.23). `git switch -c <name>` creates and switches in one step — the `-c` stands for \"create\", and it's the modern equivalent of the older two-step `git branch <name>` + `git switch <name>`. You can combine create-and-switch with a custom start point too: `git switch -c <name> <start-point>`. A small but genuinely handy shortcut: `git switch -` jumps back to whichever branch you were on immediately before your current one, exactly like `cd -` in a shell.\n\nThe older, still extremely common equivalents are `git checkout <name>` (switch) and `git checkout -b <name>` (create + switch). You will see both forms constantly in real codebases, tutorials, and teammates' muscle memory — `switch`/`restore` are a clearer split of the same underlying operations, not a replacement that makes `checkout` stop working.\n\nRenaming uses `git branch -m <old> <new>` — or, if you're currently *on* the branch you want to rename, simply `git branch -m <new>` renames the current one. This only rewrites the local ref name; if the old name was already pushed, your teammates still see the old name on the remote until you push the new name (`git push -u origin <new>`) and delete the stale remote one (`git push origin --delete <old>`).\n\nDeleting has two forms with different safety guarantees. `git branch -d <name>` is the **safe** delete — Git refuses if the branch has commits that aren't reachable from your current branch (or its upstream), because deleting it would make those commits unreachable. `git branch -D <name>` is shorthand for `--delete --force` — it deletes unconditionally, no matter what would be lost. Reach for `-d` by default and only use `-D` when you are certain the branch's work is genuinely abandoned or already preserved elsewhere.\n\nOne more real-world detail: switching branches (either command) updates your working directory files to match the target branch's committed snapshot. If you have uncommitted changes that would be overwritten by that switch, Git blocks the switch outright with an error telling you to commit or stash first — it does not silently discard local edits for you.",
          whyItMatters:
            "On Tide Board you'll be creating a fresh branch for essentially every change from here on — one for a ferry-delay note, one for a new tide station, and so on — and you'll be reading commands from teammates and tutorials that mix old (`checkout`) and new (`switch`) styles constantly. Being fluent in both, and knowing precisely when `-d` will (correctly) refuse to delete something, is daily-driver Git.",
          steps: [
            'List your current branches: `git branch`.',
            "Create a branch without switching to it: `git branch ferry-delay-note`, then confirm with `git branch` that you're still on main.",
            'Switch onto it the modern way: `git switch ferry-delay-note` (or the older `git checkout ferry-delay-note`).',
            'Create and switch in one step for a second branch: `git switch -c tide-station-udupi`.',
            'Rename a branch you misnamed: `git branch -m tide-station-udupi tide-station-malpe`.',
            "Delete a merged practice branch safely with `-d`, and an unmerged one forcibly with `-D`, and read Git's different responses to each.",
          ],
          code: `$ git branch
* main

$ git branch ferry-delay-note
$ git branch
  ferry-delay-note
* main

$ git switch ferry-delay-note
Switched to branch 'ferry-delay-note'

$ git switch -c tide-station-udupi
Switched to a new branch 'tide-station-udupi'

$ git branch -m tide-station-udupi tide-station-malpe
$ git branch
  ferry-delay-note
  main
* tide-station-malpe

$ git switch main
Switched to branch 'main'

$ git branch -d tide-station-malpe
error: the branch 'tide-station-malpe' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D tide-station-malpe'

$ git branch -D tide-station-malpe
Deleted branch tide-station-malpe (was 9c4e1af).

$ git switch -
Switched to branch 'ferry-delay-note'`,
          pitfalls: [
            "**Forgetting `git branch <name>` doesn't switch you.** Committing right after, thinking you're on the new branch, actually commits to whichever branch you were already on. Fix: check `git branch --show-current` (or just look at the `git branch` output) before committing.",
            "**Reaching for `-D` out of habit.** It force-deletes with no confirmation and no safety check — any unmerged commits on that branch are gone. Fix: default to `-d`; only escalate to `-D` when you deliberately mean it.",
            "**Renaming an already-pushed branch and forgetting the remote.** The old name lingers on `origin` and teammates keep pulling it. Fix: after `git branch -m`, push the new name and explicitly delete the old remote branch.",
            "**Trying to switch branches with uncommitted changes that overlap the target.** Git blocks the switch with \"Please commit your changes or stash them\" rather than guessing what you want. Fix: commit or `git stash` first, then switch.",
            "**Confusing `git checkout <name>` (switch, name must already exist) with `git checkout -b <name>` (create then switch).** Running the former on a name that doesn't exist yet fails with \"did not match any file(s) known to git\", which reads like a typo error, not a missing-branch error. Fix: read the exact wording, or just use `switch`/`switch -c` which name their intent explicitly.",
            "**Naming branches carelessly with slashes, e.g. both `feature` and `feature/x`.** Git's ref storage treats slashes as path separators, and a plain branch named `feature` can conflict with a hierarchy under `feature/`. Fix: pick one convention (flat names or a consistent prefix scheme) and stick to it.",
          ],
          tryIt:
            'Create three branches for three different tide stations, all starting from the same commit, switch between all three using `git switch -`, then delete two of them — one with `-d` after merging it, one with `-D` because you decided to abandon it.',
          takeaway:
            '`git branch` creates or manages branches without moving you; `git switch` (or the older `git checkout`) is what actually moves you between them — and `-d` protects unmerged work while `-D` never asks twice.',
        },
        {
          id: 'm1-t3',
          title: 'git restore vs git checkout — the Modern Split',
          explain:
            'Historically `git checkout` was overloaded to mean three unrelated things depending on its arguments; Git 2.23 split those meanings into `git switch` (branches) and `git restore` (files), though `checkout` still does all of it and remains extremely common.',
          analogy:
            "\"Checkout\" used to be a word that meant three unrelated things depending on context, the way English \"run\" can mean sprint, manage (\"run a business\"), or leak (\"a run in your stockings\") — you only know which one is meant by looking at what comes after it. `git switch` and `git restore` are exactly the fix for that: two words, one meaning each, so the command itself tells you what it does before you even read the arguments.",
          theory:
            "Before Git 2.23, a single command, `git checkout`, covered: switching branches (`git checkout <branch>`); detaching HEAD onto a specific commit (`git checkout <sha>`); creating and switching to a new branch (`git checkout -b <name>`); and restoring one or more files' contents (`git checkout -- <file>`, or `git checkout <commit> -- <file>` to pull a file's content from an arbitrary commit without touching your branch or anything else). Five distinct behaviours, one command name, disambiguated only by the exact shape of the arguments — and famously, the `--` before a filename exists purely to tell Git \"everything after this is a file path, not a branch name,\" which is only necessary because a file and a branch can share the same name.\n\nGit 2.23 introduced two focused replacements. `git switch` handles branch operations only: `git switch <name>` to move onto an existing branch, `git switch -c <name>` to create and move onto a new one, and `git switch -d <commit>` to deliberately detach HEAD (an explicit, opt-in version of what plain `checkout <commit>` did implicitly). `git restore` handles file operations only, and never touches which branch you're on.\n\n`git restore <file>` overwrites the working-tree copy of `<file>` using the version currently in the **index** (the staging area) — not HEAD. This matters: if a file has no staged changes, the index already matches HEAD, so the practical effect is \"discard my unstaged edits.\" But if you had *already* staged an unwanted change with `git add`, plain `git restore <file>` will not undo that — the staged copy is what it's restoring *from*, so it stays. To also drop the staged version, add `--staged`: `git restore --staged <file>` copies HEAD's version of the file back into the index — i.e., it unstages the file — without touching your working-tree copy at all. Combine both in one shot with `git restore --staged --worktree <file>` (or the short flags `-SW`) to discard a file's changes from both places at once. To pull a file's content from a specific point in history rather than the index, use `git restore --source=<commit> <file>` — this is the direct modern replacement for `git checkout <commit> -- <file>`.\n\nThe clean way to hold the distinction in your head: **`git switch` changes which branch's snapshot your whole working directory reflects; `git restore` changes one file back to some earlier saved state without changing which branch you're on at all.** `git checkout` remains fully supported and does everything both of the newer commands do — it is not deprecated, and real teams mix all three constantly. It keeps showing up everywhere because years of tutorials, Stack Overflow answers, CI scripts, and senior engineers' muscle memory all predate 2019, and there was never a mandate to stop using it — only a clearer, narrower alternative was added alongside it.",
          whyItMatters:
            "You will read far more `git checkout` in the wild — older docs, existing CI pipelines, teammates who learned Git a decade ago — than `git switch`/`git restore`, so you need both fluently. Just as importantly, `git checkout -- <file>` (and its modern equivalent) is one of the most common ways to instantly and irreversibly discard local edits — understanding exactly what it restores *from* is what stops it from surprising you.",
          steps: [
            'Make an uncommitted edit to `notices.js`, then discard it the modern way with `git restore notices.js`.',
            'Make the edit again, stage it with `git add`, then unstage it without losing the edit: `git restore --staged notices.js`.',
            'Make a third edit, stage it, and this time discard it from both the index and the working tree in one shot: `git restore --staged --worktree notices.js`.',
            'Repeat the first discard using the older syntax, `git checkout -- notices.js`, and confirm it produces the identical result.',
            'Detach HEAD the old way with `git checkout <commit-sha>`, then reattach with either `git checkout main` or `git switch main`.',
            'Pull a file\'s content from two commits back without switching branches: `git restore --source=HEAD~2 notices.js`, inspect it, then decide whether to keep or discard that change.',
          ],
          code: `$ git status
On branch main
Changes not staged for commit:
  modified:   notices.js

$ git restore notices.js
$ git status
On branch main
nothing to commit, working tree clean

# stage, then unstage without losing the edit
$ echo "// tweak" >> notices.js
$ git add notices.js
$ git restore --staged notices.js
$ git status
Changes not staged for commit:
  modified:   notices.js

# discard from index AND working tree in one shot
$ git add notices.js
$ git restore --staged --worktree notices.js
$ git status
nothing to commit, working tree clean

# the old syntax does the same job
$ echo "// tweak again" >> notices.js
$ git checkout -- notices.js
$ git status
nothing to commit, working tree clean

# pull a file's content from 2 commits back without switching branches
$ git restore --source=HEAD~2 notices.js
$ git diff notices.js
--- a/notices.js
+++ b/notices.js
@@ -1,3 +1,2 @@
 export const notices = [
-  { id: 1, text: 'Ferry MV Konkan Sevak resumes normal schedule.' },
 ]`,
          pitfalls: [
            "**Assuming `git restore <file>` restores from HEAD.** Its default source is the index, not HEAD — if you already staged an unwanted change, plain `restore` won't touch it. Fix: also pass `--staged` when the unwanted change has already been `git add`ed.",
            "**Running `git checkout <file>` when a branch of the same name exists.** Git can genuinely be ambiguous about whether you mean the branch or the file. Fix: use `--` before the filename (`git checkout -- <file>`) to force a file interpretation, or just use `git restore` which can never mean a branch.",
            "**Treating checkout-of-a-file as reversible.** It overwrites the working-tree copy immediately, with no confirmation and no built-in undo. Fix: `git diff` or `git stash` first if you're not fully sure you want to discard.",
            "**Believing `git restore` can switch branches.** It never does — that's `git switch`'s job exclusively; `restore` only ever touches file content.",
            "**Forgetting `--source` and expecting an old commit's content.** Without it, restore always pulls from the index (or HEAD if unstaged), never an arbitrary earlier commit. Fix: name the commit explicitly with `--source=<commit>`.",
            "**Mixing old and new muscle memory mid-session,** e.g. typing `git switch -- <file>` (invalid — switch only takes branches) or `git restore <branch-name>` (does nothing sensible). Fix: keep the two commands' domains separate in your head — branches vs. files.",
          ],
          tryIt:
            'On a scratch file, stage a bad edit with `git add`, then find the single command that wipes it from both the index and the working tree at once — confirm with `git status` that nothing remains.',
          takeaway:
            '`git switch` moves you between branches; `git restore` fixes individual files back to a saved state (index by default, or `--source=<commit>` for anything older); `git checkout` still does both and will keep appearing in code you read.',
        },
        {
          id: 'm1-t4',
          title: 'Comparing Branches Before You Merge: diff and log',
          explain:
            'Before merging, `git diff` previews the actual content difference between two branches and `git log` previews exactly which commits a merge would bring in — and the two-dot/three-dot range syntax means something different for each command.',
          analogy:
            "Before combining two boats' catch into one crate, the harbor clerk lays both tally sheets side by side to see exactly what each boat added since they left the same shore. That side-by-side read, not a guess, is what comparing two branches before merging gives you — you find out what's about to be combined before it actually happens.",
          theory:
            "`git diff branchA branchB` and `git diff branchA..branchB` are exactly equivalent — for `diff`, two dots and a plain space mean the same thing: a direct, ahistorical comparison of the two branches' tip snapshots, like laying two photographs side by side. There is no notion of shared history here, just \"what's different between these two trees.\"\n\n`git diff branchA...branchB` (three dots) means something genuinely different for `diff`: it compares branchB against the **merge base** — the most recent common ancestor of A and B — rather than against branchA's tip directly. In effect it answers \"what has branchB changed since the two branches split,\" while ignoring anything that happened only on branchA's side in the meantime. This is the diff to reach for when you specifically want to preview what merging branchB in would introduce, isolated from unrelated work already on A.\n\n`git log` uses the same two symbols but assigns them a different meaning entirely. `git log branchA..branchB` means \"commits reachable from branchB that are **not** reachable from branchA\" — exactly the commit list a merge of branchB into branchA would add. This is the single most useful pre-merge command you can run: a dry-run of the commit list, with zero risk. `git log branchA...branchB` (three dots) means the **symmetric difference** — every commit reachable from either branch but not both, i.e. everything unique to A plus everything unique to B since they diverged. Add `--left-right` to see which side each commit came from (`<` for A-only, `>` for B-only) and `--graph --oneline` to see the shape visually.\n\nThe gotcha worth memorizing on purpose: the two forms do **not** mean parallel things across the two commands. Three-dot `diff` compares one branch's tip against the shared merge base. Three-dot `log` shows the union-minus-intersection of commits from both tips. They rhyme in punctuation, not in meaning — don't assume symmetry between them.\n\nOne more directly useful command: `git merge-base branchA branchB` prints the exact common-ancestor SHA that all of the three-dot forms are computed from internally, and is a good way to sanity-check any of the above by hand.",
          whyItMatters:
            "Previewing before merging catches an unexpected file, a commit that shouldn't be there yet, or a merge that would bring in far more than intended — for instance if someone already merged main into their feature branch, `git log main..feature` would include commits that actually originated on main. On Tide Board, running this before merging Asha's or your own branch is the cheapest insurance you have before combining two people's work.",
          steps: [
            'With two branches that have diverged from main, run `git log main..ferry-delay-note --oneline` to see exactly what a merge would add.',
            'Run `git diff main ferry-delay-note` to see the actual line-by-line content difference between the two tips.',
            "Compare that with `git diff main...ferry-delay-note` and check whether the output differs (it will, once main has moved independently since the branch point).",
            'Run `git log main...ferry-delay-note --oneline --left-right --graph` to see both sides\' unique commits in one view.',
            'Find the exact common ancestor by hand with `git merge-base main ferry-delay-note`.',
            "From the log output alone, predict whether merging will fast-forward or require a true merge — you'll confirm this in the next topic.",
          ],
          code: `$ git log main..ferry-delay-note --oneline
a1b2c3d Add ferry delay notice for MV Konkan Sevak

$ git diff main ferry-delay-note
diff --git a/notices.js b/notices.js
index 3f2a1c9..7e4d8b2 100644
--- a/notices.js
+++ b/notices.js
@@ -1,3 +1,4 @@
 export const notices = [
   { id: 1, text: 'Diesel ferry inspection Friday 6am-8am, expect short delays.' },
+  { id: 2, text: 'Ferry MV Konkan Sevak running ~20 min late on the 7am crossing.' },
 ]

$ git diff main...ferry-delay-note
diff --git a/notices.js b/notices.js
index 3f2a1c9..7e4d8b2 100644
--- a/notices.js
+++ b/notices.js
@@ -1,3 +1,4 @@
 export const notices = [
   { id: 1, text: 'Diesel ferry inspection Friday 6am-8am, expect short delays.' },
+  { id: 2, text: 'Ferry MV Konkan Sevak running ~20 min late on the 7am crossing.' },
 ]
# (identical here because main hasn't moved since the branch point yet)

$ git merge-base main ferry-delay-note
7d9f2a1c4e6b8d0f3a5c7e9b1d3f5a7c9e1b3d5f

$ git log main...ferry-delay-note --oneline --left-right --graph
* > a1b2c3d Add ferry delay notice for MV Konkan Sevak`,
          pitfalls: [
            "**Assuming `diff A..B` and `diff A...B` always give the same answer.** They diverge the moment A gains commits independently — only `A...B` ignores those. Fix: pick the form deliberately based on whether you want \"everything different\" or \"only B's side since the split.\"",
            "**Assuming `log A..B` and `log A...B` always give the same answer.** One is one-directional (what B has that A doesn't); the other is symmetric (what either side has that the other doesn't). Fix: use `A..B` for a merge preview specifically, `A...B` when you want both sides' independent work.",
            "**Reading `git log A..B` backwards.** It's easy to misremember which side is \"missing from\" which. Fix: read it as \"in B, not in A\" every time, out loud if you have to.",
            "**Treating an empty `git log main..feature` as \"nothing happened\".** It usually means feature is already fully merged into (or behind) main, not that no work exists. Fix: check `git log feature` on its own if the empty range surprises you.",
            "**Not noticing an empty `git diff` despite different commit history** (e.g. after a squash elsewhere produced identical final content via a different path). Diff compares tree content, not commit identity. Fix: don't equate \"no diff\" with \"no distinct history\".",
            "**Comparing against a stale `origin/main`.** If you haven't `git fetch`ed recently, your comparison is against an outdated snapshot of main. Fix: fetch before running any of these comparisons against a remote branch.",
          ],
          tryIt:
            'Pick two branches that have both moved since they diverged, predict on paper what `git log A..B`, `git log B..A`, and `git log A...B` will each print, then run all three and check yourself.',
          takeaway:
            '`git log A..B` previews exactly what merging B into A would add; three dots mean genuinely different things for `diff` (vs. the merge base) than for `log` (symmetric difference) — never assume the punctuation behaves the same way twice.',
        },
      ],
    },
    {
      id: 'm1-s2',
      title: 'Merging & Conflicts',
      topics: [
        {
          id: 'm1-t5',
          title: 'Fast-Forward vs True Three-Way Merges',
          explain:
            "When the branch you're merging into hasn't moved since the other branch diverged, Git just slides its pointer forward with no new commit (fast-forward); once both sides have independent commits, Git must actually combine the changes and record a two-parent merge commit (a true three-way merge).",
          analogy:
            "If Asha's boat left from the same dock as yours and simply continued further down the same channel, catching up to her is just walking further down the same pier — no junction is built, you're just now standing where she already was. But if her boat forked down a side channel while yours kept going straight, meeting back up requires an actual junction dock where both channels' cargo gets combined onto one deck — that junction is the merge commit.",
          theory:
            "`git merge-base A B` finds the most recent commit that both A and B share as an ancestor. Whether a merge fast-forwards or not is decided entirely by where that merge base sits relative to the two tips.\n\n**Fast-forward** happens when the merge base is exactly equal to the tip of the branch you are currently *on* — in other words, your current branch hasn't gained any commits since the other branch diverged from it. Git's response is trivial: it simply moves your current branch's pointer forward to match the other branch's tip. No new commit object is created, no merge commit appears, and the resulting history is perfectly linear — indistinguishable from having committed everything directly on this branch the whole time.\n\n**A true three-way merge** happens when the merge base is a *strict* ancestor of both tips — meaning both branches have commits the other one lacks since they split. Here Git can't just move a pointer; it computes the diff of each side against their shared merge base (\"three-way\" = base + ours + theirs), automatically combines whatever changes don't overlap, and — if the same lines were touched differently on both sides — flags a conflict for you to resolve (the next two topics). Either way, successfully or after your manual resolution, the result is a brand-new **merge commit** with two parent pointers, one to each side's previous tip. Viewed with `git log --graph`, this is the moment the graph visibly forks and rejoins into a diamond shape.\n\nWhy the shapes differ is really just honesty about what happened: a fast-forward genuinely had nothing to reconcile, so recording it as a plain continuation is accurate. A three-way merge is Git's explicit, permanent record that two independent lines of work existed and were stitched back together at this exact point — information a fast-forward would silently discard if forced to look identical. `git merge --no-ff` (next topic) exists specifically to preserve that signal even when a fast-forward would otherwise have been possible.",
          whyItMatters:
            "\"Why does my history look perfectly straight when I know I branched\" and \"why did this PR suddenly get a merge commit I didn't expect\" both trace directly to this mechanic. It also determines what a hosting platform's \"fast-forward merge\" option will actually do to your repository's shape versus its \"create a merge commit\" option.",
          steps: [
            "Branch off current main, add one commit, and merge it back into main while main hasn't moved — read the fast-forward message and confirm no new commit was created (the total commit count is unchanged; only the pointer moved).",
            'Reset your scratch main back, then make a separate commit ON main after branching, so the two branches now genuinely diverge.',
            "Attempt the same merge again and read Git's different message — a merge commit is created via the 'ort' strategy instead of a fast-forward.",
            'Inspect the resulting merge commit with `git log -1 --format=%P` and confirm it lists two parent SHAs.',
            'Compare `git log --graph --oneline` before and after both scenarios to see the straight line versus the diamond.',
            'Run `git merge-base` on the diverged pair and confirm it matches the exact commit both branches share.',
          ],
          code: `# --- Scenario 1: main hasn't moved, so the merge fast-forwards ---
$ git switch -c scratch-feature
$ echo "extra note" >> notices.js && git commit -am "Add extra note"
$ git switch main
$ git merge scratch-feature
Updating 7d9f2a1..b3f9c1e
Fast-forward
 notices.js | 1 +
 1 file changed, 1 insertion(+)

$ git log -1 --format=%P
7d9f2a1c4e6b8d0f3a5c7e9b1d3f5a7c9e1b3d5f
# only ONE parent SHA printed -> this was never a merge commit

# --- Scenario 2: main moved too, so the histories have diverged ---
$ git switch main
$ echo "unrelated main change" >> README.md && git commit -am "Tweak README"
$ git merge scratch-feature
Merge made by the 'ort' strategy.
 notices.js | 1 +
 1 file changed, 1 insertion(+)

$ git log -1 --format=%P
c8e2f91a... 9d4b7c3f...
# TWO parent SHAs -> this is a true merge commit

$ git log --graph --oneline
*   f1a2b3c (HEAD -> main) Merge branch 'scratch-feature'
|\\
| * b3f9c1e Add extra note
* | c8e2f91 Tweak README
|/
* 7d9f2a1 Add ferry timetable page`,
          pitfalls: [
            "**Expecting a merge commit every time.** A fast-forward produces none — history looks unchanged, but the pointer genuinely moved and the work is genuinely there. Fix: check `git log -1 --format=%P`; one parent means fast-forward happened.",
            "**Expecting a fast-forward and being surprised by a merge commit.** Usually it means the target branch moved (someone else pushed to main) without you noticing. Fix: `git fetch` and check `git log main..origin/main` before merging.",
            "**Believing a fast-forward 'loses' the fact that work happened on a branch.** It doesn't lose any commits — every commit from the branch is still there in full; it simply doesn't add one extra merge commit on top.",
            "**Confusing 'a merge commit was created' with 'there was a conflict'.** Any true three-way merge creates a two-parent commit whether or not anything actually conflicted; a conflict is just a possible speed bump partway through that process, not a separate kind of commit.",
            "**Assuming every merge commit has exactly two parents.** Normal two-branch merges do; rare **octopus** merges (merging more than two branches at once) have more.",
            "**Merging against a stale local copy of main.** If you haven't fetched, your 'this will fast-forward' expectation may be wrong the moment you push, because the real remote main has already diverged further than your local copy shows.",
          ],
          tryIt:
            'Reproduce both scenarios back to back in a scratch repo — one merge that fast-forwards, one that creates a merge commit — and read the exact wording Git prints for each until you can recognize them instantly.',
          takeaway:
            "Fast-forward means 'nothing to reconcile, just move the pointer'; a true merge means 'two histories actually diverged and got stitched together with a two-parent commit' — the shape of your `git log --graph` tells you which one just happened.",
        },
        {
          id: 'm1-t6',
          title: 'git merge in Practice: Merge Commits, --no-ff, and Strategies',
          explain:
            "Running `git merge <branch>` while on your target branch combines the other branch's work in, fast-forwarding by default when possible — and `--no-ff`, `--ff-only`, and strategy options give you deliberate control over when a merge commit is created and how overlapping changes get resolved.",
          analogy:
            "A harbormaster's logbook normally just adds one line per boat that comes in. But when two boats that split from the same dock need their cargo manifests combined at day's end, the clerk writes a special two-signature entry noting exactly which two manifests were reconciled — that two-signature entry is what `--no-ff` forces the ledger to record even when, technically, a plain one-line entry would have covered it.",
          theory:
            "The basic move is: switch to the branch that should *receive* the changes, then run `git merge <other-branch>`. Direction matters — you always merge **into** your current branch **from** the named one; `git merge feature` while on main brings feature's work onto main, never the reverse. For a true (non-fast-forward) merge, Git opens an editor with an auto-generated commit message (something like \"Merge branch 'feature'\") unless you pass `-m \"message\"` or `--no-edit` to accept the default silently.\n\n`--no-ff` (\"no fast-forward\") forces Git to create a real merge commit even in cases that would otherwise cleanly fast-forward. This is a common team policy for `main` (or `develop`) branches specifically so the graph always shows *when* a feature was integrated — a fast-forward makes that moment invisible. It also makes later undoing easier: reverting an entire feature that landed as one merge commit is a single `git revert -m 1 <merge-sha>`, whereas reverting a stretch of individually fast-forwarded commits is messier. `--ff-only` is the opposite guarantee: it refuses the merge entirely unless a fast-forward is possible, which is useful in CI or for anyone who wants certainty that no surprise merge commit will ever appear.\n\nSeparately from those flags, a merge **strategy** (`-s`) picks the underlying algorithm. For two ordinary diverged branches, the default is `ort` (Git 2.34+, the faster, more correct successor to the older `recursive` strategy) — you will rarely, if ever, need to name it explicitly. `octopus` is used automatically the moment you merge more than two branches at once (`git merge branchA branchB branchC`), and only succeeds cleanly when none of them conflict with each other — real teams use it rarely, mostly for combining several independent, conflict-free branches at once. `-s ours` is a strategy that records a merge but keeps your current branch's content **entirely**, discarding the other branch's changes outright — it is rarely the right call and easy to reach for by mistake.\n\nDo not confuse `-s ours` with the merge **option** `-X ours` (or `-X theirs`), which is a very different, much more common tool: it tells the default strategy how to auto-resolve individual *overlapping* hunks in favor of one side, while still merging every non-conflicting change from both branches normally. `-X ours`/`-X theirs` only kicks in on genuinely conflicting lines; `-s ours` throws away the entire other branch regardless of whether anything even conflicted. Finally, `git merge --no-commit` performs the merge and stages the result but stops short of creating the commit, letting you inspect or tweak before finalizing.",
          whyItMatters:
            "Real teams very often run `main` with `--no-ff` as policy (sometimes set permanently via `git config merge.ff false`) precisely so history always shows every feature's integration point. Knowing the difference between `-X ours` (safe, surgical) and `-s ours` (drops an entire branch's work) is what stops you from silently discarding a teammate's changes by reaching for the wrong flag under pressure.",
          steps: [
            'On a scratch branch off main, merge a fast-forwardable feature branch normally, then reset and redo it with `git merge --no-ff` to compare the resulting graphs.',
            'Set `git config merge.ff false` on a scratch repo and repeat a fast-forwardable merge to see it now always produce a merge commit without the flag.',
            'Create two feature branches from the same point that touch different files, and merge both into main in one command: `git merge branchA branchB` (octopus).',
            'Deliberately create an overlapping-but-non-conflicting change on two branches and merge once with `-X ours` and once with `-X theirs` to compare the resolved output.',
            'Run `git log --graph --oneline --all` after each experiment to see how the choice of flag reshapes the visible history.',
            "Confirm a merge commit's two parents with `git log -1 --format=%P <merge-sha>`.",
          ],
          code: `# force a merge commit even though this would fast-forward cleanly
$ git switch main
$ git merge --no-ff ferry-delay-note
Merge made by the 'ort' strategy.
 notices.js | 1 +
 1 file changed, 1 insertion(+)

$ git log --graph --oneline -3
*   c1d2e3f (HEAD -> main) Merge branch 'ferry-delay-note'
|\\
| * a1b2c3d Add ferry delay notice for MV Konkan Sevak
|/
* 7d9f2a1 Add ferry timetable page

# make --no-ff the permanent default for this repo
$ git config merge.ff false

# merge more than two branches at once (only works if none conflict)
$ git merge tide-station-udupi tide-station-malpe
Trying simple merge with tide-station-udupi
Trying simple merge with tide-station-malpe
Merge made by the 'octopus' strategy.
 notices.js | 2 ++
 1 file changed, 2 insertions(+)

# prefer one side's resolution on overlapping (non-identical) hunks
$ git merge -X theirs asha-formatting-tweak
Auto-merging notices.js
Merge made by the 'ort' strategy.`,
          pitfalls: [
            "**Getting an unwanted silent fast-forward on `main`.** Team convention expected a visible merge commit and none appeared. Fix: agree on `--no-ff` (or `merge.ff = false`) as policy for shared branches.",
            "**Reaching for `-s ours` when `-X ours` was meant.** `-s ours` discards the ENTIRE other branch's content, not just conflicting hunks, with no warning that anything was dropped. Fix: default to `-X ours`/`-X theirs` for partial conflict preference; reserve `-s ours` for the rare, deliberate \"pretend this branch was merged but keep nothing from it\" case.",
            "**Using octopus merge when any branch actually conflicts.** Git fails the whole octopus merge outright rather than asking you to resolve pairwise. Fix: only octopus-merge branches you already know are conflict-free; otherwise merge them one at a time.",
            "**Merging in the wrong direction.** Checking out `feature` and running `git merge main` when you actually meant to update `main` from `feature`. Fix: run `git branch --show-current` before merging, every time, until it's automatic.",
            "**An editor pops open for the merge commit message and gets closed the wrong way,** aborting the merge instead of saving it (behavior varies by configured editor). Fix: know your editor's save-and-close keystroke before you're mid-merge, or just pass `--no-edit`.",
            "**Assuming `--no-ff` changes the merged file contents.** It doesn't — it only controls whether an extra commit object is created, never what ends up in your files.",
          ],
          tryIt:
            'On the same two diverged branches, perform the merge once plain and once with `--no-ff` (resetting your scratch main between attempts), then diff the two resulting `git log --graph` outputs side by side.',
          takeaway:
            "`git merge` fast-forwards by default whenever it safely can; `--no-ff` trades that silence for a permanent, visible record that two histories were reconciled — decide deliberately, don't let default behavior pick your team's history shape for you.",
        },
        {
          id: 'm1-t7',
          title: 'Merge Conflicts: Reading the Markers and a Resolution Workflow',
          explain:
            "When the same lines of the same file were changed differently on both sides of a merge, Git can't auto-combine them — it writes both versions directly into the file, surrounded by conflict markers, and hands the decision to you.",
          analogy:
            "Two clerks correct the same tide-table row on paper at the same time — one crosses out \"6:15am high tide\" and writes \"6:20am\", the other crosses out the exact same original line and writes \"6:18am\". Git can't decide which correction is right, so it writes both crossed-out attempts onto the same slip with a line between them and hands it to you to pick, or blend, the real answer.",
          theory:
            "When a merge (or a merge attempt) hits overlapping changes, Git writes the conflict directly into the affected file at the exact spot of disagreement: `<<<<<<< HEAD` opens the block, followed by the content **as it exists on your current branch** — the one you ran `git merge` *from your position on* — then `=======` divides the two versions, then the incoming branch's version of that same region follows, closed by `>>>>>>> <branch-name>`, labelled with whatever you named in the `git merge` command.\n\nPrecisely: everything between `<<<<<<< HEAD` and `=======` is **\"ours\"** — your current checked-out branch's version. Everything between `=======` and `>>>>>>> other-branch` is **\"theirs\"** — the branch you named when you ran `git merge`. Worth flagging now, ahead of Module 3: this ours/theirs labelling is specific to a **merge**. During a **rebase**, the meaning flips — \"ours\" becomes the branch you're rebasing *onto*, and \"theirs\" becomes your own commits being replayed on top of it. This trips up even experienced people who assume the labels always mean the same thing regardless of which command produced them.\n\nA repeatable resolution workflow, in order: (1) Run `git status` immediately — it lists every conflicted file under \"Unmerged paths\"; treat this list as your checklist, not your editor's inline conflict count. (2) Open each file, read both sides, and decide: keep ours, keep theirs, or hand-write a combination that captures both intents — in practice, most real conflicts are a combination, not a pure either/or pick. (3) Delete all three marker lines (`<<<<<<<`, `=======`, `>>>>>>>`) — leaving even one behind produces a broken file, not a resolved conflict, and it is a classic mistake that slips silently into a commit if you don't re-check. (4) Run `git add <file>` for each file you've resolved — this is how you tell Git \"I've handled this one\"; it also removes the file from the unmerged list. (5) Once `git status` reports no remaining unmerged paths, run `git commit` with no message argument — Git pre-fills a merge commit message naming which branch was merged and which files conflicted, which you can edit or accept as-is.\n\nA few shortcuts worth knowing: `git diff` while conflicted shows a special combined-diff view highlighting exactly which hunks conflict; `git checkout --ours <file>` / `--theirs <file>` (or, on newer Git, `git restore --ours <file>` / `--theirs <file>`) resolve an entire file by taking one side wholesale, without hand-editing — handy for generated or lock files where regenerating is easier than a manual merge. For genuinely tangled conflicts, `git mergetool` opens a visual tool showing both sides plus the shared base together. Binary files can't carry text markers at all — Git simply reports \"both modified\" and you must pick a whole version or resolve outside Git and re-add it.",
          whyItMatters:
            "This is the single most anxiety-inducing moment for people learning Git, and it is completely mechanical once you have a checklist. Turning \"I broke something\" into \"run `git status`, work the list, `git add`, `git commit`\" removes the fear entirely — and on Tide Board, once Asha is also editing shared files, this becomes a routine weekly event, not a crisis.",
          steps: [
            'Deliberately create a conflict: change the same line of the same file differently on two branches (you will do exactly this in this module\'s project).',
            "Run `git merge <branch>` and read Git's own conflict summary in the terminal before touching any file.",
            'Run `git status` and note precisely which files are listed as unmerged.',
            'Open the conflicted file, locate the `<<<<<<<`/`=======`/`>>>>>>>` block, and manually type the true final content, deleting every marker line.',
            "`git add` the resolved file, confirm with `git status` that it left the unmerged list, and repeat for any remaining conflicted files.",
            "Run `git commit` with no `-m`, review the auto-filled merge message, save it, and confirm with `git log --graph` that a two-parent merge commit now exists.",
          ],
          code: `$ git merge tide-station-new
Auto-merging notices.js
CONFLICT (content): Merge conflict in notices.js
Automatic merge failed; fix conflicts and then commit the result.

$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   notices.js

no changes added to commit (use "git add" and/or "git commit -a")

$ cat notices.js
export const notices = [
  { id: 1, text: 'Diesel ferry inspection Friday 6am-8am, expect short delays.' },
<<<<<<< HEAD
  { id: 2, text: 'Ferry MV Konkan Sevak running ~20 min late on the 7am crossing.' },
=======
  { id: 2, text: 'New tide station added at Kodi Bengre -- readings every 15 min.' },
>>>>>>> tide-station-new
]

# resolve by hand: keep BOTH entries, delete the markers, fix the duplicate id
$ cat notices.js
export const notices = [
  { id: 1, text: 'Diesel ferry inspection Friday 6am-8am, expect short delays.' },
  { id: 2, text: 'New tide station added at Kodi Bengre -- readings every 15 min.' },
  { id: 3, text: 'Ferry MV Konkan Sevak running ~20 min late on the 7am crossing.' },
]

$ git add notices.js
$ git status
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

$ git commit
[main d4e5f6a] Merge branch 'tide-station-new'

$ git log --graph --oneline -3
*   d4e5f6a (HEAD -> main) Merge branch 'tide-station-new'
|\\
| * 8b7c6d5 Add Kodi Bengre tide station
* | a1b2c3d Add ferry delay notice for MV Konkan Sevak
|/
* 7d9f2a1 Add ferry timetable page`,
          pitfalls: [
            "**Leaving a stray `<<<<<<<`/`=======`/`>>>>>>>` line in the committed file.** It's easy to scroll past one. Fix: search the file for `<<<<<<<` before every `git add` during a conflict resolution.",
            "**Running `git add .` blindly across several conflicted files.** You can mark a file \"resolved\" that you never actually opened. Fix: resolve and `git add` files one at a time, deliberately.",
            "**Picking `--ours`/`--theirs` wholesale on a file where the right answer was a combination of both.** This silently drops a teammate's change entirely. Fix: reserve whole-file `--ours`/`--theirs` for files where one side truly should win completely (e.g. a generated lockfile), not for hand-authored content like this.",
            "**Trying to \"fix\" the commit graph itself during a conflict.** Conflicts are purely a content problem in the working tree; the graph structure is fine and needs no surgery — only the file content needs resolving.",
            "**Running `git merge <branch>` again mid-conflict, expecting a retry.** Git errors because a merge is already in progress. Fix: finish (`git add` + `git commit`, or `git merge --continue`) or abort (next topic) before starting another merge.",
            "**Treating a conflict as a sign someone did something wrong.** It just means the same lines were touched independently by two people — a routine event on any actively shared repo, not a failure.",
          ],
          tryIt:
            "Intentionally create a two-sided conflict on a scratch file (edit the same line differently on two branches, then merge), resolve it by hand following the five-step workflow above, and confirm `git log --graph` shows a clean two-parent merge commit at the end — with no marker lines left anywhere in the file.",
          takeaway:
            '`<<<<<<< HEAD` through `=======` is your current branch, `=======` through `>>>>>>> branch` is the incoming one — resolving is just: read both, hand-edit to the true intent, delete the markers, `git add`, `git commit`.',
        },
        {
          id: 'm1-t8',
          title: 'Aborting and Retrying, and Reducing Conflict Frequency',
          explain:
            'git merge --abort cleanly cancels an in-progress conflicted merge and restores your branch exactly as it was before you started — and the best long-term fix for frequent conflicts is a workflow habit, not a Git flag: merge smaller pieces, more often.',
          analogy:
            "Think of it like a cancel-and-reprint button at a ticket counter: if the printer jams halfway through combining two tickets, you don't try to hand-fix the half-printed slip — you hit cancel, get both original tickets back untouched, and try again once you've sorted out who's actually sitting where.",
          theory:
            "`git merge --abort` only works while a merge is genuinely in progress and unresolved — technically, while a file called `.git/MERGE_HEAD` exists (Git writes it the instant a merge starts and deletes it the instant the merge commit is made). Running it resets your working tree, the index, and HEAD back to exactly their state before the merge began, as if `git merge` had never been run at all. It is a full bail-out, not a partial undo.\n\nCritically, `--abort` still discards everything even if you've already resolved some conflicts and staged them with `git add` — there is no way to abort \"halfway\" and keep the parts you already fixed. It's all-or-nothing right up until the moment you actually run `git commit`. Once a merge commit has genuinely landed, `--abort` no longer applies at all (there's no `MERGE_HEAD` left to find); undoing a *completed* merge is a different tool entirely (`git reset` or `git revert`, covered in Module 2).\n\nThe flip side of abort is `git merge --continue`: once every conflict is resolved and staged, `--continue` finalizes the merge commit — functionally identical to a plain `git commit` at that point, just phrased as \"continue what I started\" rather than \"commit\".\n\nReducing how *often* you hit conflicts in the first place is mostly workflow discipline, not a Git feature: keep feature branches short-lived, since the longer two branches run in parallel the more naturally they drift over the same files; merge (or rebase onto) the shared branch into your feature branch regularly while you work, so small conflicts surface early instead of one enormous one at the end; keep changes and pull requests small and focused on one concern, since a smaller diff simply has less surface area to collide on; give teammates a heads-up when you know you're both about to touch the same file or section; and, where a codebase's structure allows it, prefer layouts with less collision surface — e.g. one file per station instead of everyone appending to the very end of one shared array, which is one of the most common and most avoidable conflict shapes there is.",
          whyItMatters:
            "Knowing you can always cleanly bail out with `--abort` removes the fear of even attempting a merge — there's no way to leave your repo in a worse state than before you started. And the habit of merging small and often is the single biggest lever any team has over how frequently conflicts happen at all, which matters the moment Asha and Ravi are both actively pushing changes alongside you.",
          steps: [
            'Start a merge you know will conflict, and abort it immediately with `git merge --abort` before touching any file — confirm with `git status` that you\'re back to a clean pre-merge state.',
            'Start the same conflicting merge again, resolve and stage one of two conflicted files, then abort anyway — confirm that staged resolution is discarded too.',
            'Redo it a third time, resolve every conflict, stage everything, and finish with `git merge --continue` instead of a plain `git commit` to see it behaves identically.',
            'On a scratch repo, simulate merging main into a long-lived feature branch daily for three small days\' worth of changes, then compare against attempting one huge merge at the very end.',
            'Notice how much smaller each individual conflict is when merged incrementally versus all at once.',
            'Check that `.git/MERGE_HEAD` exists mid-conflict and is gone immediately after either `--abort` or a completed commit, to anchor the mental model.',
          ],
          code: `$ git merge tide-station-new
Auto-merging notices.js
CONFLICT (content): Merge conflict in notices.js
Automatic merge failed; fix conflicts and then commit the result.

$ ls .git/MERGE_HEAD
.git/MERGE_HEAD

$ git merge --abort
$ git status
On branch main
nothing to commit, working tree clean

$ ls .git/MERGE_HEAD
ls: cannot access '.git/MERGE_HEAD': No such file or directory

# resolve for real this time, then finish with --continue instead of commit
$ git merge tide-station-new
Auto-merging notices.js
CONFLICT (content): Merge conflict in notices.js
Automatic merge failed; fix conflicts and then commit the result.

$ git add notices.js
$ git merge --continue
[main d4e5f6a] Merge branch 'tide-station-new'`,
          pitfalls: [
            "**Trying to hand-fix a bad conflict resolution mid-merge instead of aborting.** Usually slower and riskier than just bailing out and starting clean. Fix: when a resolution feels wrong, `--abort` and retry rather than layering more edits on top.",
            "**Believing `--abort` can selectively keep some already-resolved files.** It can't — it's genuinely all-or-nothing until you commit.",
            "**Calling `git merge --abort` after the merge commit already succeeded** and being confused by \"no merge to abort\" — at that point you need `git reset` or `git revert` instead (Module 2).",
            "**Letting feature branches live for weeks 'to be safe'.** This reliably produces the largest, ugliest conflicts — the opposite of safe. Fix: merge the shared branch in regularly while the feature branch is still short-lived.",
            "**Treating a conflict as a reason to avoid merging altogether**, hoarding changes even longer out of caution. The actual fix is the opposite: merge more often, in smaller pieces, not less.",
            "**Not giving teammates a heads-up about which files are 'hot' this week.** A two-line message often prevents an overlap that would otherwise become a conflict.",
          ],
          tryIt:
            'Start a merge you expect to conflict, abort it immediately, and confirm with `git status` and `git diff` that absolutely nothing changed — then go through and resolve the same conflict for real.',
          takeaway:
            '`git merge --abort` is a full, safe bail-out any time before the merge commit lands — but the real fix for frequent conflicts is smaller, more frequent merges between people, not a better abort command.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm1-p1',
      type: 'Project',
      title: 'Feature Branch Workflow',
      domain: 'Branching & Merging',
      duration: '2-3 hrs',
      description:
        "You and your teammate Asha each branch off Tide Board to add a different feature at the same time — you add a ferry-delay notice, Asha adds a new tide-station entry — and merge both back into main. One merge goes through cleanly; the other lands on the exact lines Asha already changed and forces you to resolve a real conflict by hand, start to finish, exactly the way it happens on an actual team.",
      tools: ['Git'],
      blueprint: {
        overview:
          "This project proves you can run the full branch lifecycle end to end under real conditions: two people, two branches off the same starting point, one clean merge and one genuine conflict on shared lines — resolved correctly, not just made to 'go away'.",
        functionalRequirements: [
          "Two feature branches exist, both created from the same starting commit on main: `tide-station-new` (playing Asha's role) and `ferry-delay-note` (yours).",
          'Asha\'s branch adds one new entry to the shared `notices.js` list; your branch independently adds a different new entry to the same list, at the same insertion point.',
          "Asha's branch merges into main first, without any conflict.",
          'Your branch, merged second, produces a real, unavoidable conflict on the exact lines Asha\'s merge already changed.',
          'The conflict is resolved by hand so that BOTH entries survive in the final file, in a sensible order, with no duplicate ids and no leftover conflict marker lines.',
          "The final `main` history, viewed with `git log --graph --oneline --all`, clearly shows a two-parent merge commit for the conflicted merge.",
        ],
        technicalImplementation: [
          "Starting point: `notices.js` on main exports a `notices` array with exactly one existing entry, committed and clean.",
          'Both feature branches are created from that same main commit with `git switch -c tide-station-new` and `git switch -c ferry-delay-note` — neither branch sees the other\'s change.',
          "On `tide-station-new`, append a new notice object as the array's new last entry and commit it.",
          "On `ferry-delay-note`, independently append a different new notice object at the exact same last-entry position and commit it — same array, same insertion line, done without knowledge of Asha's commit.",
          "Merge Asha's branch into main first: `git switch main && git merge tide-station-new` — this should succeed cleanly since main has not changed since the branch point.",
          "Merge your branch second: `git merge ferry-delay-note` — this is expected and required to conflict, because main (via Asha's merge) has now changed at exactly the line your branch also touches.",
          'Resolve the conflict by hand: keep both entries, delete all marker lines, fix any duplicate `id` values, `git add notices.js`, then `git commit` to finish the merge.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Set up the shared file and two feature branches',
            outcome:
              'main has a committed notices.js with one starter entry, and two branches (tide-station-new, ferry-delay-note) both exist, created from that same commit.',
            prompt:
              "In my Tide Board repo, make sure main has a committed file called notices.js that exports a `notices` array with exactly one entry: { id: 1, text: 'Diesel ferry inspection Friday 6am-8am, expect short delays.' }. Commit that if it isn't already committed. Then, from that same commit on main, create two branches without switching between edits: `tide-station-new` and `ferry-delay-note`. Show me `git log --oneline --graph --all` afterward so I can confirm both branches point at the same starting commit as main.",
          },
          {
            step: 2,
            label: "Build Asha's tide-station branch",
            outcome:
              "tide-station-new has one commit that appends a new tide-station notice as the array's new last entry.",
            prompt:
              "Switch to the tide-station-new branch. Edit notices.js to append one new object to the end of the notices array: { id: 2, text: 'New tide station added at Kodi Bengre -- readings every 15 min.' }. Commit this with the message 'Add Kodi Bengre tide station'. Show me the resulting notices.js content and `git log --oneline` for this branch so I can confirm it's a single new commit on top of the shared starting point.",
          },
          {
            step: 3,
            label: "Build your ferry-delay branch and merge Asha's in cleanly",
            outcome:
              "ferry-delay-note has its own independent commit at the same insertion point, and Asha's branch is merged into main without conflict.",
            prompt:
              "Switch to the ferry-delay-note branch (starting fresh from main's original commit, not from tide-station-new). Edit notices.js to append a DIFFERENT new object at the same last-entry position: { id: 2, text: 'Ferry MV Konkan Sevak running ~20 min late on the 7am crossing.' }. Commit this with the message 'Add ferry delay notice for MV Konkan Sevak'. Then switch to main and merge tide-station-new into it. Confirm and show me that this merge completes with no conflicts.",
          },
          {
            step: 4,
            label: 'Merge your branch and resolve the real conflict',
            outcome:
              'ferry-delay-note is merged into main via a conflict that is resolved by hand, keeping both notices with distinct ids and no leftover markers.',
            prompt:
              "While on main, merge the ferry-delay-note branch in. This should produce a merge conflict in notices.js because both branches added an entry with id 2 at the same array position. Show me the conflict markers exactly as Git writes them. Then resolve the conflict by hand: keep BOTH the Kodi Bengre tide-station entry and the ferry delay entry, renumber them so the ids are 1, 2, 3 with no duplicates, remove every conflict marker line, stage notices.js, and complete the merge commit.",
          },
          {
            step: 5,
            label: 'Verify the final history',
            outcome:
              'main shows a clean working tree, both notices present in notices.js, and a graph with one straight merge and one diamond-shaped conflicted merge.',
            prompt:
              "Confirm the final state: run `git status` and show the working tree is clean, print the final content of notices.js so I can see all three entries with distinct ids, and run `git log --graph --oneline --all` so I can see both merges in the history -- one that landed without a conflict and one that shows the two-parent merge commit where I resolved the conflict by hand.",
          },
        ],
        deliverable:
          "A Tide Board main branch whose notices.js contains all three notices — the original entry, Asha's Kodi Bengre tide-station entry, and your ferry-delay entry — with clean, sequential ids and zero leftover conflict markers anywhere in the file. `git log --graph --oneline --all` proves it: one merge shows a straight or simple join for Asha's branch, and the other shows a genuine two-parent merge commit exactly where your branch collided with hers and you resolved it by hand.",
      },
    },
  ],
  quiz: [
    {
      id: 'm1-q1',
      q: "You branch `feature` off `main` at commit C5, then commit twice more on `feature` (reaching C7) while making no further commits on `main`. You switch to `main` and run `git merge feature`. What happens?",
      options: [
        'Git creates a new merge commit that combines the two feature commits into main.',
        "main's pointer simply moves forward to C7 — no new commit is created.",
        'Git refuses to merge because main and feature have diverged.',
        'Git automatically deletes the feature branch once the merge completes.',
      ],
      answer: 1,
    },
    {
      id: 'm1-q2',
      q: "After running `git checkout a1b2c3d` (an older commit's SHA, not a branch name), `git status` reports \"HEAD detached at a1b2c3d\". What does this mean?",
      options: [
        "HEAD now points directly at that commit instead of at a branch name; any new commits you make won't belong to any branch unless you create one.",
        'The repository is corrupted and needs `git fsck --repair` before you can continue.',
        'You have permanently and irreversibly lost every commit made after a1b2c3d.',
        "Git has automatically switched you onto a new branch named 'detached'.",
      ],
      answer: 0,
    },
    {
      id: 'm1-q3',
      q: 'During a merge conflict, notices.js contains:\n\n<<<<<<< HEAD\nHigh tide: 6:15am\n=======\nHigh tide: 6:20am\n>>>>>>> asha-branch\n\nWhat does the line "High tide: 6:15am" represent?',
      options: [
        "The version from the branch being merged in (Asha's change).",
        'The version from your current checked-out branch (HEAD).',
        'A three-commits-back version that Git is suggesting as a compromise.',
        'An error marker — this whole block should be deleted without reading it.',
      ],
      answer: 1,
    },
    {
      id: 'm1-q4',
      q: "You've staged a change to notices.js with `git add` but haven't committed yet. You want to unstage it while keeping your edits in the working tree exactly as they are. Which command does exactly that?",
      options: [
        'git restore notices.js',
        'git restore --staged notices.js',
        'git checkout -- notices.js',
        'git reset --hard HEAD',
      ],
      answer: 1,
    },
    {
      id: 'm1-q5',
      q: 'Before merging, you run `git log main..feature --oneline` and see three commits printed. What do those three commits represent?',
      options: [
        'Commits that exist on both main and feature.',
        'Commits reachable from feature but not from main — exactly what merging feature into main would add.',
        'Commits that will be deleted if you merge feature into main.',
        'Commits reachable from main but not from feature.',
      ],
      answer: 1,
    },
  ],
}
