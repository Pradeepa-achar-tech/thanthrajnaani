// Module 8 — Power Tools & Troubleshooting
// The "other 10%" of Git: hunting down the exact commit that broke something
// with bisect, reading history by content instead of just messages, working
// two branches at once with worktrees, taming huge/binary-heavy repos with
// submodules, subtrees, sparse-checkout and LFS, and closing the loop with
// local automation via hooks. Tide Board survives its first real regression
// hunt and gains its first automated safety net.

export const m8 = {
  id: 'm8',
  title: 'Power Tools & Troubleshooting',
  hours: 8,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    "Git's daily-driver commands solve most real problems — this module is the other 10%: pinpointing exactly which commit introduced a bug with **git bisect**, searching history by content instead of commit messages, working on two branches at once with **git worktree**, and handling repos that outgrow plain Git with **submodules**, **sparse-checkout**, and **Git LFS**. It closes with **Git hooks**, the local automation that can catch a mistake before it is ever committed. By the end, Tide Board has survived a real regression hunt and gained its first automated safety net.",
  sections: [
    {
      id: 'm8-s1',
      title: 'Finding & Fixing Regressions',
      topics: [
        {
          id: 'm8-t1',
          title: 'git bisect — binary-searching history to find the exact commit that broke something',
          explain:
            "git bisect finds the exact commit that introduced a bug by repeatedly checking out a commit halfway between a known-good and a known-bad point and asking you (or a script) to test it, narrowing the search by half each round instead of reading history commit by commit.",
          analogy:
            "Imagine trying to find the exact day the harbor's printed tide chart started showing the wrong low-tide time, somewhere across six months of daily sheets. Instead of reading all one hundred and eighty sheets in order, you flip to the sheet in the middle, check whether it is already wrong, and repeat on whichever half still contains the changeover point — you land on the exact day in about eight flips instead of ninety. `git bisect` performs exactly this halving trick against your commit history.",
          theory:
            "The problem `git bisect` solves is common and otherwise tedious: a bug exists now, it did not exist at some point in the past, and somewhere between those two points is the one commit that introduced it, buried among dozens or hundreds of others. Reading every diff in order works but scales linearly with history size; bisect scales logarithmically.\n\n`git bisect start` begins a session. `git bisect bad [commit]` marks a commit as known-broken (defaulting to `HEAD` if no commit is given), and `git bisect good <commit>` marks an older commit as known-working. Git then computes a commit roughly halfway between the good and bad boundaries (by commit count along the history graph, not by date), checks it out in a detached `HEAD`, and waits. You test that exact state — run the app, run a test, whatever proves the bug present or absent — and answer `git bisect good` or `git bisect bad`. Git narrows the range accordingly and checks out a new midpoint. Repeat until Git reports a single commit as the answer: `<sha> is the first bad commit`.\n\nSome commits genuinely cannot be tested — maybe the build is broken for an unrelated reason at that exact point in history. `git bisect skip` tells Git to treat that commit as neither good nor bad and pick a different candidate instead. Overusing skip can leave Git unable to narrow all the way to one exact commit, in which case it reports a small range of \"possible first bad commits\" rather than a single answer.\n\n`git bisect run <script-or-command>` automates the entire loop: Git checks out each candidate itself and runs the given command, using its **exit code** to decide the verdict — exit `0` means good, any exit code from `1` to `127` (except `125`) means bad, exit code `125` means \"cannot test this commit, skip it,\" and an exit code of `128` or higher (typically from a killed or crashed process) aborts the whole bisect immediately, since Git assumes something is critically wrong with the test itself rather than the code under test.\n\nWhen finished, `git bisect reset` returns you to the branch and commit you were on before `git bisect start` — you spend the entire session in detached `HEAD`, checking out different commits, and reset is what puts you back. `git bisect log` prints the full record of every good/bad answer given so far, and that log can be saved to a file and replayed later with `git bisect replay <file>` — useful for resuming a long session or sharing exactly how a regression was tracked down.",
          whyItMatters:
            "Asha reports that Tide Board's low-tide time is off by several minutes, but nobody knows which of the last forty commits caused it, and reading forty diffs by eye is slow and error-prone. `git bisect` turns \"read forty diffs\" into roughly six tests, and `git bisect run` turns even those six tests into one command — this is the single highest-leverage debugging tool Git offers once a regression has already shipped.",
          steps: [
            'Run `git bisect start` to begin a session.',
            'Run `git bisect bad` to mark the current commit (where the bug is confirmed present) as bad.',
            'Run `git bisect good <tag-or-sha>` to mark an older commit or tag known to work correctly.',
            'Test whichever commit Git checks out for you, then answer `git bisect good` or `git bisect bad` based on what you observed.',
            'Keep testing and answering until Git prints "<sha> is the first bad commit".',
            'Run `git bisect reset` to return to your original branch, then inspect the culprit with `git show <sha>`.',
          ],
          code: `$ git bisect start
$ git bisect bad
$ git bisect good v1.4.0
Bisecting: 19 revisions left to test after this (roughly 5 steps)
[a1c9e02] Add ferry delay banner to schedule page

$ node test-tide.mjs
FAIL: expected low tide 14:32, got 14:41
$ git bisect bad
Bisecting: 9 revisions left to test after this (roughly 4 steps)
[7f30bd1] Refactor tide offset lookup table

$ node test-tide.mjs
PASS: all 3 fixtures correct
$ git bisect good
Bisecting: 4 revisions left to test after this (roughly 2 steps)
[52e88aa] Round tide minutes to nearest 5-minute mark

$ node test-tide.mjs
FAIL: expected low tide 14:32, got 14:41
$ git bisect bad
Bisecting: 1 revision left to test after this (roughly 1 step)
[9c0d441] Tidy up ferry.js comments

$ node test-tide.mjs
PASS: all 3 fixtures correct
$ git bisect good
52e88aa is the first bad commit
commit 52e88aaf3e0e6b1d0a3c9f2b1e0a1234abcd5678
Author: Priya <priya@example.com>
    Round tide minutes to nearest 5-minute mark

$ git bisect reset
Previous HEAD position was 52e88aa Round tide minutes...
Switched to branch 'main'`,
          pitfalls: [
            "**Forgetting to run `git bisect reset` when done.** You stay in detached `HEAD`, and later commands (or a confused `git status`) can be alarming. Fix: always reset once bisect reports the culprit.",
            "**Marking a commit good or bad without actually testing it, to \"speed things up.\"** One wrong answer silently corrupts the whole search and points at the wrong commit. Fix: genuinely test every candidate before answering.",
            "**Overusing `git bisect skip` instead of finding a way to test the commit.** Too many skips can leave Git unable to narrow to one exact commit, reporting a range of \"possible first bad commits\" instead. Fix: use skip only for genuinely untestable commits (e.g. a broken unrelated build), not as a shortcut.",
            "**Treating a commit that fails to build for an unrelated reason as \"bad.\"** That poisons the result toward the wrong culprit. Fix: use `git bisect skip` for commits that cannot be meaningfully tested at all.",
            "**Writing a `bisect run` script that only prints pass/fail text instead of using the correct exit code.** Git only reads the exit code, not any output. Fix: make sure the script actually `exit`s `0` for good and a nonzero code (not `125`) for bad.",
            "**Worrying that bisect's checkouts affect your real branch history.** They do not — bisect only moves `HEAD` around in detached state temporarily; no commits are created, moved, or rewritten. Fix: trust `git bisect reset` to put everything back exactly as it was.",
          ],
          tryIt:
            'In a scratch repo, create ten commits where commit 6 flips a function from returning `true` to `false` for no good reason. Run `git bisect start`, `git bisect bad`, `git bisect good <first commit>`, and manually answer good/bad at each step until Git reports commit 6 as the first bad commit.',
          takeaway:
            'git bisect turns "which of N commits broke this" into roughly log2(N) tests by binary search — good/bad answers, from you or an automated script, are all it needs to converge on the exact culprit.',
        },
        {
          id: 'm8-t2',
          title: 'Advanced git log — pickaxe search (-S/-G), --follow, and filtering by author, date, and path',
          explain:
            '`git log -S<string>` and `-G<regex>` search the content of every commit\'s diff instead of commit messages, `--follow` keeps tracking a single file\'s history through a rename, and `--author`/`--since`/`--until`/a trailing pathspec narrow log output by who, when, and where.',
          analogy:
            "Searching `git log --grep` for a commit message is like asking the harbor master which day's logbook entry mentions the crane by name — useful, but it misses every day the crane shows up in the actual cargo manifest without anyone bothering to write a note about it. Pickaxe search reads the manifests themselves, not just the notes clipped to the front of them.",
          theory:
            "`git log --grep=<pattern>` searches commit *messages*. It is easy to assume that is the same as searching for a change, but it only finds commits whose author happened to describe the change in words matching the pattern — it says nothing about what the diff actually contains.\n\n`git log -S<string>` (the \"pickaxe\" search, named after the tool used to dig) instead shows commits where the **number of occurrences of the exact string changed** between a commit and its parent — the string was added somewhere it wasn't before, or removed from somewhere it was, so the total count differs. A subtlety worth internalizing: if a string's total occurrence count stays the same across a commit (for example, a single occurrence gets deleted from one line and an identical occurrence gets added on another line the same commit), `-S` will **not** flag that commit, because the count didn't change — pickaxe tracks the count, not mere presence in the diff.\n\n`git log -G<regex>` is the more permissive sibling: it shows commits where a **line matching the regex was added or removed** in the diff, evaluated purely at the line level with no notion of \"count changed.\" This makes `-G` the right tool when a line's exact text changes shape (e.g. one call to a function is replaced by a differently-worded call to the same function) even though the number of matching lines stayed identical — `-S` would miss that, `-G` would not.\n\n`--follow` addresses a different problem: `git log -- path/to/file.js` stops showing history at the commit where that file was renamed, because Git does not store renames as an explicit operation — it detects them heuristically, by similarity, only when asked to. `git log --follow -- path/to/file.js` tells `log` to keep applying that rename detection across the whole walk, so history for a single file continues seamlessly through a `git mv`. It only works with exactly one pathspec.\n\nFiltering flags narrow output further: `--author=<pattern>` matches (as a regex) against the author name/email recorded on each commit; `--since`/`--after` and `--until`/`--before` accept both human phrases (\"2 weeks ago\") and ISO dates; and a trailing `-- <path>` restricts the log to commits that actually touched that path. These combine freely, e.g. `git log --author=Asha --since=\"2026-06-01\" -- src/tide.js` shows only Asha's recent commits touching one file.",
          whyItMatters:
            "The tide-rounding constant in Tide Board changed at some point and nobody remembers exactly when or in which commit — reading history top to bottom to find it is slow and error-prone. `git log -S\"0.5\"` (or `-G` for a shape-based match) finds the exact commit directly, and knowing the difference between `-S` and `-G` keeps you from concluding \"the string was never touched\" when it actually just moved.",
          steps: [
            'Run `git log --grep="tide"` and notice it only finds commits whose *message* happens to mention "tide" — not every commit that actually touched tide logic.',
            'Run `git log -S"calculateTideOffset" -- src/tide.js` to find commits where that exact string\'s occurrence count changed.',
            'Run `git log -G"const ROUNDING" -- src/tide.js` to catch a line-level change even if the total match count stayed the same.',
            'Rename the file with `git mv tide.js tide-utils.js` and commit, then compare `git log --oneline -- tide-utils.js` (stops at the rename) against `git log --oneline --follow -- tide-utils.js` (keeps going).',
            'Combine `--author`, `--since`, and a trailing pathspec to scope a search to one teammate\'s recent changes to one file.',
            'Add `-p` to any of the above to see the actual patch content for each matching commit, not just the commit list.',
          ],
          code: `$ git log --grep="tide" --oneline
a1c9e02 Fix tide banner copy

$ git log -S"calculateTideOffset" --oneline -- src/tide.js
7f30bd1 Refactor tide offset lookup table
2b8e441 Add calculateTideOffset helper

$ git log -G"const ROUNDING" --oneline -- src/tide.js
52e88aa Round tide minutes to nearest 5-minute mark
2b8e441 Add calculateTideOffset helper

$ git mv tide.js tide-utils.js
$ git commit -m "Rename tide.js to tide-utils.js"

$ git log --oneline -- tide-utils.js
9d0aa31 Rename tide.js to tide-utils.js

$ git log --oneline --follow -- tide-utils.js
9d0aa31 Rename tide.js to tide-utils.js
52e88aa Round tide minutes to nearest 5-minute mark
2b8e441 Add calculateTideOffset helper
c001d00 Initial tide calculation`,
          pitfalls: [
            '**Confusing `-S` with a plain content grep across diffs.** `-S` only reports a commit when the string\'s *occurrence count* changed — a moved-but-count-preserved string won\'t show up. Fix: reach for `-G` when you need a line-level match regardless of count.',
            '**Passing more than one pathspec alongside `--follow`.** It only works for a single file and Git will refuse with an error otherwise. Fix: run `--follow` once per file of interest.',
            '**Forgetting `--` before a pathspec that could be mistaken for a revision name.** Git can report an "ambiguous argument" error. Fix: always separate revisions from paths with a bare `--`.',
            '**Assuming `--since`/`--until` filter strictly by chronological author-date order.** `log` walks commits in reverse commit-date order by default, and after rebases or cherry-picks, commit dates and author dates can diverge from the order you\'d intuitively expect. Fix: check `git log --format="%ad %cd"` if the ordering looks surprising.',
            '**Running `-S`/`-G` across an entire large repo with no pathspec.** It scans every diff on every path across all of history, which is slow. Fix: scope the search with a trailing `-- <path>` whenever you have any idea where to look.',
            '**Assuming `--author` needs an exact, case-sensitive match.** It matches as a regex against "Name <email>", and `-i`/`--regexp-ignore-case` (which also affects `--grep`) makes it case-insensitive. Fix: use a partial pattern or `-i` rather than typing the full exact string.',
          ],
          tryIt:
            'In a scratch repo, add a constant near the top of a file and commit, then in a later commit move that exact same line lower in the same file with no other change. Confirm `git log -S` on the constant does not flag the move, but `git log -G` with a regex matching the surrounding line does.',
          takeaway:
            '-S finds commits where a string\'s occurrence count changed; -G finds commits where a matching line was added or removed regardless of count; --follow keeps a single file\'s history alive across a rename.',
        },
        {
          id: 'm8-t3',
          title: 'git worktree — checking out multiple branches into multiple working directories at once',
          explain:
            'git worktree add checks out a second (or third) branch into its own separate directory, all backed by the same .git repository and object database, so you can work on two branches simultaneously without stashing or switching.',
          analogy:
            "Instead of clearing your one desk every time you switch between drafting next week's ferry timetable and fixing today's harbor sign, imagine having two physical desks that both pull from the exact same filing cabinet of records. Each desk stays precisely as you left it; nothing needs to be tidied away just to use the other one. A worktree is that second desk — separate space, one shared filing cabinet underneath.",
          theory:
            "The normal Git workflow keeps one working directory per clone, and switching branches with `git switch`/`git checkout` requires a clean working tree (or a stash) first — awkward the moment a same-day hotfix interrupts mid-feature work that isn't ready to commit or stash.\n\n`git worktree add ../tide-board-hotfix -b hotfix/tide-rounding main` creates a brand-new working directory at that path, creates (or checks out) the given branch there, and links it to the **same** `.git` object database as the original repository — no re-clone, no duplicated commit/blob objects, just an additional working directory with its own index and its own `HEAD`. Fetches, branches, and tags are shared across every linked worktree because they all point at the one underlying repository.\n\nGit deliberately prevents checking out the **same branch** in two worktrees at once — a branch can only be the checked-out branch of one worktree at a time, since two working trees both claiming to represent the live state of one branch would conflict. Attempting it fails with an error such as `fatal: 'branch' is already checked out at <path>`.\n\n`git worktree list` shows every linked worktree together with its path and current branch/`HEAD`. `git worktree remove <path>` cleans one up properly, deleting both the directory and its administrative metadata. If a worktree directory is instead deleted by hand (`rm -rf`) rather than through `remove`, Git's internal bookkeeping under `.git/worktrees/` is left behind and confuses later commands until you run `git worktree prune` to clear the stale entries.\n\nThe older alternative — just cloning the repository again into a second folder — works, but duplicates the entire object database on disk and needs its own separate fetches to stay current with the original. Worktrees share one object store and one set of remotes: fetching in either worktree updates data immediately visible to both.",
          whyItMatters:
            "Asha's feature branch has messy, half-finished uncommitted work when a production tide-display bug needs a same-day fix. Rather than stashing (and risking exactly the kind of stash conflict from the previous topic), she spins up a worktree for the hotfix branch, fixes and pushes it from there, and returns to her feature-branch worktree exactly as she left it — nothing was ever disturbed.",
          steps: [
            'From the main Tide Board clone, run `git worktree add ../tide-board-hotfix -b hotfix/tide-rounding main`.',
            'cd into the new directory and confirm `git status`/`git branch` show it checked out on the new branch.',
            'Make the hotfix, commit, and push from inside that worktree.',
            'Return to the original working directory and confirm your original uncommitted feature-branch changes are completely untouched.',
            'Run `git worktree list` from either directory to see both linked worktrees at once.',
            'Once the hotfix is merged, remove the worktree with `git worktree remove ../tide-board-hotfix` (or delete the folder manually and run `git worktree prune`).',
          ],
          code: `$ git worktree add ../tide-board-hotfix -b hotfix/tide-rounding main
Preparing worktree (new branch 'hotfix/tide-rounding')
HEAD is now at 9d0aa31 Rename tide.js to tide-utils.js

$ cd ../tide-board-hotfix
$ git status
On branch hotfix/tide-rounding
nothing to commit, working tree clean

# ...fix the bug, commit, push from here...

$ cd ../tide-board
$ git status
On branch feature/ferry-delays
Changes not staged for commit:
  modified:   src/ferry.js
# (exactly as it was left — untouched by the hotfix work)

$ git worktree list
/home/priya/tide-board          9d0aa31 [feature/ferry-delays]
/home/priya/tide-board-hotfix   3fe12ab [hotfix/tide-rounding]

$ git worktree add ../again -b hotfix/tide-rounding main
fatal: 'hotfix/tide-rounding' is already checked out at '/home/priya/tide-board-hotfix'

$ git worktree remove ../tide-board-hotfix`,
          pitfalls: [
            "**Trying to check out a branch that's already checked out in another worktree.** Git refuses outright. Fix: pick a different branch, or go work inside the worktree that already has it checked out.",
            "**Deleting a worktree directory with `rm -rf` instead of `git worktree remove`.** Stale metadata lingers under `.git/worktrees/` and confuses later commands. Fix: run `git worktree prune` afterward, or use `remove` in the first place.",
            '**Assuming "shared object database" means "identical working state."** Each worktree has its own index and its own uncommitted changes — only the committed history, branches, and objects are shared. Fix: don\'t expect changes in one worktree\'s files to appear in another\'s.',
            "**Assuming a new worktree needs remotes/config set up again.** It doesn't — repository-level configuration (remotes, `user.name`, etc.) is shared automatically. Fix: only per-worktree things (like the checked-out branch) differ.",
            "**Losing track of which directory is which after creating several worktrees.** Fix: run `git worktree list` regularly, and name worktree directories after their branch.",
            '**Forgetting to eventually `remove` a worktree once its branch is merged and deleted.** It lingers, pointing at a now-gone branch. Fix: clean up worktrees as part of your normal branch-cleanup habit.',
          ],
          tryIt:
            'With uncommitted changes sitting on a feature branch in your primary clone, create a second worktree for a small typo-fix branch off main, make and commit the fix there, and confirm `git status` in the original directory still shows your untouched feature-branch changes.',
          takeaway:
            'git worktree checks out another branch into its own directory backed by the same repository, so you never have to stash or switch away from in-progress work just to fix something else.',
        },
        {
          id: 'm8-t4',
          title: 'Advanced stash workflows and resolving conflicts when applying a stash',
          explain:
            'Beyond a basic git stash, you can label stashes, stash only part of your changes, include untracked files, turn a stash into its own branch, and — critically — resolve the merge-style conflicts that happen when a stash no longer applies cleanly.',
          analogy:
            "Think of `git stash` as putting a half-prepped dish under a cover on the counter so the stove is free for something urgent. Usually you uncover it later and keep cooking exactly where you left off. But if someone else changed an ingredient on that same counter while it was covered, taking the cover off — applying the stash — can now bump into something already there in a conflicting way. That's a stash conflict, and it resolves exactly like any other kitchen collision: sort out what stays, one item at a time.",
          theory:
            "`git stash push -m \"message\"` (preferred over the older bare `git stash save`) creates a labeled stash entry. `git stash list` shows every stash as `stash@{0}`, `stash@{1}`, and so on, newest first, and `git stash show -p stash@{1}` displays the actual diff a specific stash contains without touching your working tree.\n\n`git stash push -p` (or `--patch`) opens an interactive hunk-by-hunk picker, letting you stash only some of your uncommitted changes while leaving the rest in the working tree — useful when only part of what's dirty actually needs to go away temporarily. `-u`/`--include-untracked` also stashes new untracked files (excluded by default); `-a`/`--all` additionally includes ignored files.\n\n`git stash apply` and `git stash pop` both re-apply a stash's changes to the working tree, but differ in one important way: `apply` keeps the stash entry in the list afterward, while `pop` also drops it — **but only if the apply succeeded cleanly**. This asymmetry matters: a `pop` that hits a conflict does *not* discard the stash, which is why some workflows favor always using `apply` and manually running `git stash drop` once you're certain the result is correct, rather than relying on `pop`'s automatic cleanup.\n\n`git stash branch <new-branch-name> [stash]` creates a new branch starting from the exact commit the stash was originally taken against, checks it out, and applies the stash there — dropping it afterward if that application succeeds. This is the right fix specifically when a stash no longer applies cleanly because your current branch has moved too far past the stash's original base, rather than merely having a small overlapping edit.\n\nApplying a stash is implemented internally as a three-way merge between the stash's base commit, the stash's changes, and your current working tree/index. If the same lines were changed differently in both places, Git leaves standard conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) in the affected files — exactly like an ordinary merge conflict — and reports `CONFLICT (content): Merge conflict in <file>`. Crucially, on a conflicting `pop`, Git does **not** drop the stash entry: you resolve the markers by hand, `git add` the resolved files, and only then manually run `git stash drop stash@{N}` yourself, since Git deliberately keeps the stash around as a safety net until you confirm it's no longer needed.",
          whyItMatters:
            "Asha stashes mid-fix work to pull in Ravi's just-merged changes, and re-applying her stash conflicts with the exact lines Ravi touched. Knowing this is an ordinary three-way merge — not a broken repo — and that a conflicting `pop` never silently discards her stash, keeps her from panicking or losing work she thought was safely tucked away.",
          steps: [
            'Run `git stash push -m "wip: tide rounding tweak"` to stash current changes with a clear label.',
            'Run `git stash list` to see it sitting alongside any earlier stashes.',
            'Pull or merge upstream changes that touch the same lines.',
            'Run `git stash pop` and observe a `CONFLICT (content): Merge conflict in ...` message, with the stash still preserved in the list.',
            'Open the affected file, resolve the `<<<<<<<`/`=======`/`>>>>>>>` markers by hand, then `git add` the resolved file.',
            'Confirm the stash is still listed (a conflicting pop didn\'t drop it), then run `git stash drop stash@{0}` once you\'re satisfied the resolution is correct.',
          ],
          code: `$ git stash push -m "wip: tide rounding tweak"
Saved working directory and index state On main: wip: tide rounding tweak

$ git stash list
stash@{0}: On main: wip: tide rounding tweak

$ git pull
Updating 9d0aa31..b220ffe
Fast-forward
 src/tide.js | 4 ++--

$ git stash pop
Auto-merging src/tide.js
CONFLICT (content): Merge conflict in src/tide.js
The stash entry is kept in case you need it again.

$ git stash list
stash@{0}: On main: wip: tide rounding tweak

# ...open src/tide.js, resolve <<<<<<< / ======= / >>>>>>> markers by hand...

$ git add src/tide.js
$ git stash list
stash@{0}: On main: wip: tide rounding tweak

$ git stash drop stash@{0}
Dropped stash@{0} (a3f9c21...)`,
          pitfalls: [
            '**Assuming `git stash pop` always deletes the stash.** It only does so on a clean apply; after a conflict the stash is deliberately kept. Fix: check `git stash list` after a conflicting pop and drop it yourself once resolved.',
            '**Resolving conflict markers in the file but forgetting `git add` afterward.** The working tree looks fixed but the index is still in conflict state. Fix: always `git add` resolved files before considering the conflict done.',
            "**Applying a very old stash onto a branch that has diverged heavily.** Instead of one or two small conflicts you get a wall of unrelated ones. Fix: use `git stash branch <name>` to replay the stash on top of its own original base commit instead.",
            "**Stashing without `-u` and being surprised new untracked files are still sitting in the working tree.** Untracked files are excluded by default. Fix: use `git stash push -u` (or `-a` to also include ignored files) when new files matter.",
            '**Pushing several stashes without messages and losing track of which is which.** Fix: always pass `-m "..."` with a clear label to `git stash push`.',
            "**Dropping a stash immediately after resolving, before double-checking the resolution.** Once dropped and eventually garbage collected, the exact combination of changes can be hard to recover. Fix: verify the result (build/tests) before running `git stash drop`.",
          ],
          tryIt:
            'In a scratch repo, edit one line of a tracked file and stash it with `git stash push -m test`. On the same branch, edit that same line differently and commit. Run `git stash pop`, resolve the resulting conflict markers by hand, `git add` the file, then `git stash drop`.',
          takeaway:
            "A stash conflict is just a three-way merge with markers to resolve — a conflicting `git stash pop` refuses to drop the stash, so stashed work is never silently lost, but you must resolve, `git add`, and then `git stash drop` it yourself.",
        },
      ],
    },
    {
      id: 'm8-s2',
      title: 'Big Files, Big Repos, Automation',
      topics: [
        {
          id: 'm8-t5',
          title: 'Submodules vs subtrees — including one repository inside another',
          explain:
            "Both let you embed one Git repository inside another, but a submodule stores only a pointer — a specific commit SHA — to the external repo, while a subtree actually copies that repo's files and history into yours, which is a fundamental difference with real trade-offs for both approaches.",
          analogy:
            "A submodule is like a restaurant menu that reads \"fish supplied fresh daily by Ramesh's boat\" — the menu just points at an external supplier, and if the supplier changes something, the menu itself is unaffected until someone deliberately reprints it. A subtree is like buying the whole boat's catch and storing it in your own kitchen — fully yours now, no pointer to keep updated, but your storage room is bigger and more cluttered.",
          theory:
            "Both tools solve the same shared problem: you want a second repository — say, a small `harbor-icons` asset library reused across several projects — living inside Tide Board without copy-pasting files by hand and losing the ability to pull in its updates.\n\n**Submodules**: `git submodule add <url> <path>` registers a special \"gitlink\" entry in the parent repository's tree that records the exact commit SHA of the submodule at that point — not the submodule's files themselves. Cloning the parent repository requires an extra step to actually populate that directory: either `git clone --recurse-submodules <url>`, or, after a plain clone, `git submodule update --init --recursive`. Skipping this leaves an empty folder. Updating a submodule means `cd`-ing into it, checking out a new commit or branch there (it is a genuine, separate repository with its own detached `HEAD` by default), and then committing the resulting pointer change back in the parent repository.\n\n**Subtrees**: `git subtree add --prefix=vendor/harbor-icons <url> main --squash` instead merges the external repository's files — and, optionally without `--squash`, its full history — directly into your own repository's history, as an ordinary directory. Any collaborator gets it automatically on a completely normal clone, with no extra init step and no separate detached-HEAD repository to manage. Pulling in newer upstream changes uses `git subtree pull --prefix=vendor/harbor-icons <url> main --squash`; pushing local changes back out with `git subtree push` is also possible but noticeably fiddlier than the pull direction.\n\nThe honest trade-off: submodules keep the parent repository small and the boundary between projects crisp — a genuinely separate history, with an exact pinned version you can see at a glance — but they are notorious for tripping up collaborators, since a plain `git clone`/`git pull` does not fetch or update submodule content by default, and forgetting `--init` or forgetting to run `git submodule update` after a pointer change is an extremely common source of confusion. Subtrees are transparent to anyone who just clones and works normally — there is no separate step, ever — but the merged files and (optionally) history add real bulk to your repository, and pushing changes back out to the original upstream project is comparatively awkward.\n\nA reasonable rule of thumb: reach for submodules when the embedded project is actively maintained elsewhere, changes somewhat independently, and you specifically want to track one precise pinned version across several unrelated parent repos. Reach for subtrees when you want the embedded code to simply be part of your repository for anyone who clones it, and you rarely need to push changes back upstream.",
          whyItMatters:
            "The Tide Board team decides to reuse a small icon set across two separate projects. Choosing submodule vs subtree changes what every teammate's daily clone and pull experience looks like from that point on — not just how the icons were added once.",
          steps: [
            'Run `git submodule add <url> vendor/harbor-icons` and commit the resulting `.gitmodules` file plus the new gitlink entry.',
            'Clone the parent repo fresh elsewhere with a plain `git clone` and confirm `vendor/harbor-icons` is an empty directory until you run `git submodule update --init --recursive`.',
            "cd into the submodule, check out a newer commit, cd back out, then `git add` and commit the parent repo's updated pointer.",
            'In a separate scratch repo, instead run `git subtree add --prefix=vendor/harbor-icons <url> main --squash` and confirm the files appear immediately on a normal clone, with no extra step.',
            'Pull upstream updates into the subtree with `git subtree pull --prefix=vendor/harbor-icons <url> main --squash`.',
            'Compare notes: list exactly what a fresh teammate must do differently to get working icons in each version.',
          ],
          code: `# Submodule
$ git submodule add https://example.com/harbor-icons.git vendor/harbor-icons
$ git commit -m "Add harbor-icons as a submodule"

# ...elsewhere, a plain clone...
$ git clone https://example.com/tide-board.git
$ ls vendor/harbor-icons
# (empty)
$ git submodule update --init --recursive
Submodule path 'vendor/harbor-icons': checked out '3aa9f0e'

# Subtree, in a separate scratch repo
$ git subtree add --prefix=vendor/harbor-icons https://example.com/harbor-icons.git main --squash
Added dir 'vendor/harbor-icons'

# ...elsewhere, a plain clone...
$ git clone https://example.com/tide-board-subtree.git
$ ls vendor/harbor-icons
boat.svg  tide-clock.svg  ferry.svg
# (already there — no extra step)

$ git subtree pull --prefix=vendor/harbor-icons https://example.com/harbor-icons.git main --squash`,
          pitfalls: [
            "**Cloning a repo with submodules using a plain `git clone` and being confused why the submodule folder is empty.** Fix: use `--recurse-submodules` on clone, or follow up with `git submodule update --init --recursive`.",
            "**Forgetting to commit the pointer bump after updating a submodule's checked-out commit.** Teammates keep seeing the old pinned version. Fix: `git add` and commit the parent repo immediately after moving the submodule's `HEAD`.",
            "**Editing files directly inside a submodule directory without realizing it's a separate repo in detached HEAD by default.** Commits made there can be effectively orphaned if you never push them from within the submodule onto a real branch. Fix: check out a branch inside the submodule before making real changes there.",
            '**Choosing a subtree for a large, frequently-updated external project.** History bloat and slow merges accumulate every pull. Fix: prefer a submodule when the upstream changes often and independently.',
            '**Choosing a submodule for something that should "just work" for every casual contributor.** The required init/update steps create real onboarding friction. Fix: prefer a subtree when transparency for clones matters more than a crisp version boundary.',
            "**Assuming `git subtree push` is as simple as `add`/`pull`.** Pushing local subtree changes back upstream is genuinely more manual and error-prone than the pull direction. Fix: budget extra care (or avoid it) when contributing back through a subtree.",
          ],
          tryIt:
            'Add a small public repository as a submodule to a scratch project, then clone that scratch project into a second fresh folder with a plain `git clone` and confirm the submodule directory is empty until you run `git submodule update --init`.',
          takeaway:
            "A submodule stores a pointer to one exact commit of another repo — crisp separation, extra init/update steps on every clone. A subtree copies that repo's files into your own history — zero extra steps for clones, but real size and upstream-push friction.",
        },
        {
          id: 'm8-t6',
          title: 'git sparse-checkout — checking out only the paths you actually need from a huge monorepo',
          explain:
            "git sparse-checkout keeps the full commit history in your local object database but populates your working directory with only a chosen subset of directories, so a multi-project monorepo checkout can shrink to just the folders one team actually touches.",
          analogy:
            "A wholesale fish market keeps every crate from every boat in its cold storage, but a single restaurant buyer only wants to carry today's prawns and mackerel out to their van, not the entire warehouse. sparse-checkout is that selective loading — the warehouse (your local object database) still holds everything, but your van (the working directory) only carries out what you actually ordered.",
          theory:
            "A full `git clone`/checkout populates the working directory with every tracked file at `HEAD`. In a genuine monorepo containing dozens of largely independent projects, most contributors only ever touch a handful of directories, yet still pay the disk space and checkout time cost of materializing every single one of them.\n\n`git sparse-checkout init --cone` switches the repository into **cone mode** — the modern, recommended mode — and initially checks out only the top-level files. `git sparse-checkout set apps/tide-board apps/shared-ui` then tells Git to populate the working directory with only those directories and their contents, skipping everything else. Skipped paths remain fully present in the object database and full history — they are simply not written into the working tree. `git sparse-checkout list` shows the current active set; `git sparse-checkout add` appends more directories without replacing the existing set; `git sparse-checkout disable` restores a full, ordinary checkout.\n\nCone mode restricts patterns to whole directories — no arbitrary per-file glob patterns — in exchange for much better performance on very large repositories, because Git can decide inclusion with simple directory-prefix comparisons instead of evaluating gitignore-style pattern matching against every path in the tree. The older, non-cone mode allows arbitrary gitignore-style patterns for finer-grained inclusion or exclusion, at the cost of not scaling as well.\n\nsparse-checkout alone still fetches every blob's content on clone/fetch, since it only affects what gets *written to the working directory*, not what gets *downloaded*. For genuinely enormous monorepos it is typically paired with a **partial clone** (`git clone --filter=blob:none <url>`, or `--filter=blob:limit=<size>`) so that blobs outside the areas you actually check out are never downloaded at all — only fetched lazily, on demand, the first time something genuinely needs them.\n\nThis is a fundamentally different tool from `.gitignore`: ignore rules only affect untracked files Git won't offer to add; sparse-checkout affects which *already-tracked* files Git bothers to materialize in your working directory at all.",
          whyItMatters:
            "Tide Board itself is small, but the technique matters the moment it becomes one of dozens of applications living inside a single company-wide monorepo — nobody working purely on Tide Board should have to check out (or wait on) every unrelated team's folder just to get started.",
          steps: [
            'In an existing clone of a multi-project repo, run `git sparse-checkout init --cone`.',
            'Run `git sparse-checkout set apps/tide-board` to restrict the working directory to just that folder (plus top-level files).',
            'List the working directory and confirm sibling project folders are simply absent from disk.',
            'Run `git sparse-checkout add apps/shared-ui` to widen the set without starting over.',
            'Run `git sparse-checkout list` to confirm exactly which paths are currently included.',
            'Run `git sparse-checkout disable` to restore a full working-directory checkout when needed.',
          ],
          code: `$ git sparse-checkout init --cone
$ git sparse-checkout set apps/tide-board
$ ls
apps/  README.md

$ ls apps
tide-board/

$ git sparse-checkout add apps/shared-ui
$ git sparse-checkout list
apps/tide-board
apps/shared-ui

$ ls apps
shared-ui/  tide-board/

$ git log --oneline -- apps/billing-service | head -3
d4e1a0c Add billing-service invoice export
# (history is still fully present even though the directory isn't checked out)

$ git sparse-checkout disable
$ ls apps
billing-service/  shared-ui/  tide-board/  ...`,
          pitfalls: [
            "**Assuming sparse-checkout also limits what gets downloaded.** It only limits what's checked out locally; clone/fetch still transfer every blob unless combined with a partial clone. Fix: pair it with `git clone --filter=blob:none` on truly huge monorepos.",
            "**Trying arbitrary file-level patterns while in cone mode and being confused only whole-directory patterns are honored.** Fix: stay in cone mode for directory-level needs, or deliberately use non-cone mode (accepting its slower performance) when true per-file patterns are required.",
            "**Forgetting which paths are currently active and being confused why a known file isn't on disk.** Fix: run `git sparse-checkout list` before assuming something is missing from history — it almost certainly isn't.",
            '**Manually editing `.git/info/sparse-checkout` by hand instead of using the `git sparse-checkout` subcommands.** It can drift out of sync with cone-mode expectations. Fix: always use `init`/`set`/`add`/`list`/`disable`.',
            '**Expecting a dramatic speedup from sparse-checkout on a small repo.** The benefit scales with how much of the repo you\'re excluding. Fix: reserve it for repos where the excluded portion is genuinely large.',
            "**Being surprised how much disk space and checkout time return after `git sparse-checkout disable`.** That's expected — disable restores everything that was previously skipped. Fix: only disable when you actually need the full tree.",
          ],
          tryIt:
            'Clone any repository with several top-level directories, run `git sparse-checkout init --cone` then `git sparse-checkout set <one directory>`, and confirm only that directory (plus top-level files) exists on disk — then run `git log` for a file in an excluded directory and confirm its history is still fully there.',
          takeaway:
            'sparse-checkout keeps full history in the object database but only materializes the directories you set in the working tree — pair it with a partial clone to also cut down what gets downloaded in the first place.',
        },
        {
          id: 'm8-t7',
          title: 'Git LFS (Large File Storage) — why plain Git handles big binaries badly, and how LFS fixes it',
          explain:
            'Plain Git stores a full copy of every version of every file, which works fine for text but makes a repository balloon the moment large binary assets are updated repeatedly; Git LFS fixes this by committing a tiny pointer file to Git and keeping the actual binary content in separate LFS storage, fetched on demand.',
          analogy:
            "Git is built like a library that photocopies an entire book and files the full copy away every time even one page is edited — fine for a twenty-page pamphlet, ruinous for a set of encyclopedias. Git LFS instead files a library card (\"see Volume 4, edition of March 3rd\") in the catalog and keeps the actual heavy volumes on a separate shelf, fetched only when someone genuinely needs to read that edition.",
          theory:
            "Git's core storage model commits full snapshots of file content, delta-compressed into packfiles for space efficiency — but that delta compression is designed around finding small, meaningful textual differences between similar blobs. Large binary assets (a hero photo, a scanned ferry-schedule PDF, a video clip, a design file) usually change wholesale between versions rather than by a few edited lines, so delta compression buys very little. Every commit that touches such an asset adds nearly its full size again to `.git`, there is no meaningful diff to review, and clone size and fetch time grow essentially unbounded as a binary-heavy repository accumulates history.\n\nGit LFS solves this by never actually storing the large file's bytes inside Git's own object database. After a one-time `git lfs install` per machine and `git lfs track \"*.psd\"` (which writes matching patterns into `.gitattributes`), committing a tracked file triggers a Git \"clean\" filter that swaps its real content for a small text **pointer file** before it ever reaches a Git blob. A pointer file looks roughly like this:\n```\nversion https://git-lfs.github.com/spec/v1\noid sha256:4d7ac41c8f5e2b0a9c3d1e6f7890abcd1234ef56\nsize 2481932\n```\nThe actual binary bytes are uploaded separately to an LFS storage endpoint (hosted by GitHub, GitLab, Bitbucket, or a self-hosted LFS server), keyed by that content hash. On checkout, a matching \"smudge\" filter reads the pointer file and transparently downloads and substitutes the real binary content into the working directory — from the perspective of `git status`, `git diff`, or `git log`, the file behaves like any other tracked file, but what Git itself ever stores or transmits as a blob is just that few-hundred-byte pointer.\n\nThe practical consequence: cloning a repository with LFS-tracked history stays small if you only need the pointer files (or the latest versions), and `git lfs pull` fetches the actual binary content on demand; `git lfs fetch` and `git lfs checkout` separate downloading LFS objects from writing them into the working tree, mirroring plain Git's own fetch/checkout separation. The trade-off is that LFS requires every collaborator — and the Git host — to actually support it: a plain `git clone` without `git-lfs` installed still checks out the pointer-file *text* rather than the real binary, which looks broken (a photo that's a few hundred bytes) until `git lfs install` and a pull are run.\n\nOne more thing LFS does not do automatically: it does not retroactively shrink history for large files that were already committed as ordinary (non-LFS) blobs before you started tracking that pattern. Migrating existing large binaries already sitting in history requires a separate, more invasive history-rewriting step (`git lfs migrate import`), not simply running `git lfs track` going forward.",
          whyItMatters:
            "The moment the Tide Board team starts committing hero photos and scanned ferry-schedule PDFs directly into the repo, clone times balloon for everyone, forever — including people who never touch those assets. Git LFS is the standard, host-supported fix, rather than either \"never commit binaries\" or hand-rolling a separate asset-storage system.",
          steps: [
            'Run `git lfs install` once per machine to register the LFS filters with Git.',
            'Run `git lfs track "*.png"` (or whatever asset type applies) and confirm it appended a rule to `.gitattributes`.',
            'Run `git add .gitattributes` plus the actual asset file, then commit as normal.',
            'Inspect what Git itself actually stored with `git show HEAD:path/to/asset.png` and confirm it is small pointer-file text, not the real image bytes.',
            'Run `git lfs ls-files` to list which tracked files are currently backed by LFS.',
            'Clone the repo fresh elsewhere with `git-lfs` installed and confirm the real binary is fetched automatically on checkout.',
          ],
          code: `$ git lfs install
Updated Git hooks.
Git LFS initialized.

$ git lfs track "*.png"
Tracking "*.png"

$ cat .gitattributes
*.png filter=lfs diff=lfs merge=lfs -text

$ git add .gitattributes assets/harbor-hero.png
$ git commit -m "Add harbor hero image via LFS"

$ git show HEAD:assets/harbor-hero.png
version https://git-lfs.github.com/spec/v1
oid sha256:9e1b0f8a2c7d4456e0f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f7
size 1842019

$ git lfs ls-files
9e1b0f8a2c * assets/harbor-hero.png

$ git clone https://example.com/tide-board.git
$ ls -la assets/harbor-hero.png
-rw-r--r-- 1 priya priya 1842019 assets/harbor-hero.png
# (real image content, fetched automatically because git-lfs is installed)`,
          pitfalls: [
            '**Forgetting `git lfs install` on a fresh machine.** Commits and checkouts silently see pointer-file text instead of the real binary, with no loud error — until you notice the file is a few hundred bytes. Fix: run `git lfs install` as a standard step of setting up any repo that uses LFS.',
            '**Running `git lfs track` on a file pattern after large binaries of that type are already committed as regular blobs.** Existing history is not automatically converted. Fix: use `git lfs migrate import` for content already committed before tracking started.',
            "**Forgetting to commit the updated `.gitattributes` file itself.** Without it, other clones don't know which patterns are LFS-tracked and treat matching files as ordinary blobs. Fix: always `git add .gitattributes` alongside the first tracked file.",
            '**Assuming LFS is a Git-native feature that works with any host automatically.** It requires host-side LFS support (GitHub and GitLab support it; some self-hosted setups need it enabled) plus `git-lfs` installed by every collaborator. Fix: confirm host support and ask collaborators to install `git-lfs` before relying on it.',
            "**Treating LFS as a fix for a repo that's already huge from years of un-tracked binaries.** Cleaning up existing history is a separate, riskier rewrite operation, not automatic. Fix: budget a deliberate `git lfs migrate import` pass, understood as a history rewrite.",
            "**Running past a Git host's free LFS storage or bandwidth quota without realizing it.** Many hosts cap LFS storage/bandwidth separately from ordinary repo size. Fix: check the host's LFS limits before committing large volumes of binary assets.",
          ],
          tryIt:
            'In a scratch repo, run `git lfs install`, `git lfs track "*.bin"`, commit a small dummy `.bin` file, then run `git show HEAD:file.bin` and confirm you see a short text pointer, not the actual binary content.',
          takeaway:
            'Git LFS never stores large binaries as Git blobs — it commits a tiny pointer file to Git and keeps the real content in separate LFS storage, fetched on demand by a smudge filter at checkout.',
        },
        {
          id: 'm8-t8',
          title: 'Git hooks (pre-commit, commit-msg, pre-push) for local automation — and how they differ from CI',
          explain:
            'Git hooks are scripts Git runs automatically at specific points in the local workflow — pre-commit before a commit is created, commit-msg to validate or adjust the message, pre-push before anything is sent to a remote — giving fast local feedback, unlike CI, which runs later on a server and cannot be skipped by a collaborator.',
          analogy:
            "A pre-commit hook is like a fisherman doing a quick visual check of the day's catch before it even leaves the boat — fast, informal, and easy to skip if he's in a hurry. CI is the port authority's official inspection once the catch reaches the market — slower, but it happens to every boat's catch regardless of what the fisherman chose to check, or skip, earlier.",
          theory:
            "Hooks live as executable scripts under `.git/hooks/` (Git ships sample files there with a `.sample` suffix; removing the suffix and making the script executable activates it). Because `.git/` itself is not version-controlled content that travels with `git push`/`git pull`, hooks placed directly there are **not** automatically shared with collaborators just by committing scripts to the rest of the repository. Distributing them means either asking each teammate to manually copy/symlink scripts into their own `.git/hooks/`, using `git config core.hooksPath <tracked-dir>` to point Git at a shared, version-controlled directory of hook scripts, or a tool like Husky that automates wiring that up.\n\n**`pre-commit`** runs after `git commit` is invoked but before the commit object is actually created, with the staged snapshot already assembled — the natural place for linting, formatting checks, or fast unit tests against staged files. Exiting non-zero aborts the commit entirely, leaving staged changes untouched so you can fix and retry.\n\n**`commit-msg`** runs after a commit message has been written (interactively or via `-m`), receiving the path to a temporary file containing that message as its one argument. It's used to validate message formatting (e.g. enforcing a Conventional Commits-style prefix like `feat:`/`fix:`), or even to programmatically adjust the message. A non-zero exit here also aborts the commit, message and all.\n\n**`pre-push`** runs before `git push` actually sends anything to a remote, receiving the remote's name and URL as arguments plus a list of ref/SHA pairs being pushed on stdin. This is the natural place for a heavier check that would be too slow to run on every single commit — a broader test suite, a full build — since it runs once per push rather than once per commit.\n\nThe crucial distinction from CI: hooks are entirely local, running on the developer's own machine using whatever scripts happen to be installed there. A collaborator who never set up the shared hooks simply never runs them, and even someone who has them installed can bypass most hooks outright with `git commit --no-verify` (or `git push --no-verify`). CI (GitHub Actions, GitLab CI, and similar) instead runs on a server, triggered by the push or pull request itself, using the exact same configuration for every contributor, and cannot be skipped by an individual's local flag or missing local setup. This is why hooks are best treated as fast, convenient, *skippable* early feedback, while CI — or a server-side/branch-protection check — remains the actual enforced gate before code is trusted.",
          whyItMatters:
            "A pre-commit hook running Tide Board's tide-time test suite would have caught this module's planted regression before it was ever committed, at essentially zero cost compared to discovering it much later through a full bisect hunt — exactly the kind of automation that turns a debugging story into a non-event.",
          steps: [
            'Look inside `.git/hooks/` and note the `*.sample` files already present for every hook type.',
            'Create `.git/hooks/pre-commit` (no file extension), make it executable, and have it run a fast check such as a lint command or a small test script.',
            "Attempt a commit that should fail the check and confirm Git aborts with the hook's non-zero exit before the commit is created.",
            'Fix the underlying issue and retry the commit, confirming it now succeeds.',
            'Add a `commit-msg` hook enforcing a simple message-format rule and confirm it rejects a badly formatted message.',
            'Run a commit with `--no-verify` to see hooks can be deliberately bypassed locally — and discuss why CI remains the real backstop.',
          ],
          code: `$ ls .git/hooks
pre-commit.sample  commit-msg.sample  pre-push.sample  ...

$ cat > .git/hooks/pre-commit << 'HOOK'
#!/bin/sh
node test-tide.mjs
HOOK
$ chmod +x .git/hooks/pre-commit

$ git commit -m "Tweak rounding constant"
FAIL: expected low tide 14:32, got 14:41
$ echo $?
1
# (commit was never created — staged changes are untouched)

# fix the bug in tide.js
$ git add src/tide.js
$ git commit -m "Tweak rounding constant"
PASS: all 3 fixtures correct
[main 4a7b210] Tweak rounding constant

$ git commit --no-verify -m "Skip the hook just this once"
[main 88cc102] Skip the hook just this once
# (hook never ran — CI is what actually catches this if it slips through)`,
          pitfalls: [
            '**Assuming a script committed inside `.git/hooks/` is shared with collaborators via a normal `git push`.** `.git/` is not tracked content; nothing under it travels with the rest of the repository. Fix: use `core.hooksPath` pointing at a tracked directory, or a tool like Husky, to actually distribute hooks.',
            '**Forgetting to make a hook script executable.** Git silently ignores a non-executable hook file instead of erroring loudly. Fix: `chmod +x` every hook script (on Unix-like systems and Git Bash on Windows).',
            '**Writing a pre-commit hook slow enough to make every commit painful.** Developers start reaching for `--no-verify` out of habit, defeating the whole purpose. Fix: keep pre-commit checks fast; push heavier checks to `pre-push` or CI.',
            '**Treating a local hook as a security or enforcement boundary.** `--no-verify` (or simply never installing the shared hook) bypasses it entirely. Fix: anything that truly must be enforced belongs in CI or a server-side check, not only a local hook.',
            '**Writing a `commit-msg` hook that tries to read the message from stdin instead of its one argument.** `commit-msg` receives the temp file *path* as `$1`, not piped input. Fix: read the file at the path given in the first argument.',
            "**Assuming a hook runs in the same shell environment as your interactive terminal.** Git invokes hooks with its own environment, which can have a different `PATH`, causing a hook that \"works when I run it manually\" to fail under Git. Fix: use explicit paths or a shebang/environment setup that doesn't depend on interactive shell config.",
          ],
          tryIt:
            'Add a pre-commit hook to a scratch repo that runs a check for a forbidden string (e.g. a stray debug print) across staged JS files and exits `1` if found. Confirm a commit containing it is blocked, remove it, and confirm the same commit then succeeds.',
          takeaway:
            'Hooks give fast, local, but skippable feedback — pre-commit, commit-msg, and pre-push all run only on your machine and can be bypassed with --no-verify — which is why CI, running the same checks on a server for everyone, remains the real enforced gate.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm8-p1',
      type: 'Project',
      title: 'Bisect the Bug',
      domain: 'Git Troubleshooting',
      duration: '2-3 hrs',
      description:
        "A scripted Tide Board history of about eighteen commits hides one planted regression that silently breaks the tide-time rounding calculation. Use git bisect run with a small automated test script to pinpoint the exact bad commit in a handful of steps, then add a pre-commit hook running that same test so this class of bug can never be committed again.",
      tools: ['Git', 'Node.js', 'Bash'],
      blueprint: {
        overview:
          "This project proves you can go from \"something regressed somewhere in dozens of commits\" to \"here is the exact commit and here is why\" without reading history by eye, and then close the loop so the same mistake is caught automatically before it ever ships again. It combines this module's two most consequential tools — git bisect and git hooks — into one realistic incident-response exercise.",
        functionalRequirements: [
          'A scripted Tide Board repo history of at least fifteen commits exists, simulating incremental real feature work, with exactly one commit that silently breaks the tide-time rounding/offset calculation.',
          'A standalone test script exists that runs against whatever commit is currently checked out and reports pass/fail on the tide calculation using correct git-bisect-run exit-code semantics.',
          'git bisect start/good/bad is used manually for at least the first couple of steps, proving the underlying halving workflow is understood before automating it.',
          'git bisect run completes the search fully automated and reports the exact first-bad-commit SHA.',
          "The identified commit's diff is inspected with git show and the actual bug is explained in plain English.",
          'A working pre-commit hook is installed that runs the same test script and blocks a commit if it fails, verified by attempting to reintroduce the exact same bug and watching the commit get rejected.',
        ],
        technicalImplementation: [
          'Generate the scripted history so the bad commit is buried at a hidden position roughly two-thirds through the log, not on HEAD and not on the first commit, and tag the first commit as a known-good reference point.',
          'The test script must exit 0 for a passing tide calculation and a nonzero code from 1-127 (not 125) for a failing one — 125 is reserved for "cannot test this commit" and must not be used here.',
          'Run git bisect start, git bisect bad (HEAD), and git bisect good <tag>, then manually answer good/bad for the first two or three candidates before finishing with git bisect run.',
          'Save the full session record with git bisect log before running git bisect reset to return to the original branch.',
          'Install the hook as an executable .git/hooks/pre-commit script (or wire it via core.hooksPath) that calls the identical test script used during the bisect.',
          'Prove the hook works by temporarily reintroducing the same rounding change in a new commit attempt and confirming Git aborts it before the commit object is created.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Generate the scripted Tide Board history with a planted regression',
            outcome:
              'A local git repository with about eighteen commits of realistic incremental history and exactly one hidden commit that breaks tide-time rounding, plus a known-good starting tag.',
            prompt:
              'Create a new local git repository called tide-board-bisect. Build a small Node.js module tide.js that exports a calculateTideTime(baseMinutes, offsetMinutes) function computing a rounded tide time from those inputs. Generate a commit history of about eighteen commits simulating incremental real feature work on this file and a couple of unrelated files (README updates, a ferry.js schedule file), one small realistic change per commit with realistic commit messages. Bury exactly one commit roughly two-thirds of the way through the history that changes the rounding logic in calculateTideTime in a subtle way that makes it silently wrong for certain inputs (for example, flipping a >= to > at the rounding boundary, or swapping Math.round for Math.floor) — do not mention which commit it is anywhere in a commit message or comment. Tag the very first commit v0-start as a known-good reference point. Show me the final git log --oneline so I can see the shape of the history without it revealing which commit is the bad one.',
          },
          {
            step: 2,
            label: 'Write the automated test script',
            outcome:
              'A standalone Node.js test script that correctly reports pass/fail on the tide calculation using exit codes git bisect run can consume.',
            prompt:
              'Write a standalone script test-tide.mjs, runnable with node test-tide.mjs, that imports calculateTideTime from tide.js and asserts it returns the correct known value for at least three fixed input cases, including one case right at a rounding boundary. It must call process.exit(0) if every assertion passes, and process.exit(1) if any assertion fails, printing which case failed along with the expected and actual values. Do not use process.exit(125) or any other exit code — I need plain pass/fail codes for git bisect run. Confirm it passes cleanly when run against the v0-start tag and show me the exact command to run it.',
          },
          {
            step: 3,
            label: 'Bisect manually, then automate with git bisect run',
            outcome:
              'The exact first-bad-commit SHA identified, first through a few manual good/bad steps and then through full automation.',
            prompt:
              'Walk me through git bisect start, marking the current HEAD as bad and the v0-start tag as good, then manually answering good or bad for the first two or three candidate commits by actually running node test-tide.mjs myself each time, so I can see the range halving. Then show me the exact git bisect run node test-tide.mjs command to finish the search automatically, and explain the output line that names the first bad commit. Finally, run git bisect log so I have a saved record of the whole session, and git bisect reset to return me to my original branch.',
          },
          {
            step: 4,
            label: 'Diagnose the bug and add a pre-commit hook that would have caught it',
            outcome:
              'A plain-English explanation of the exact bug in the identified commit, and a working, executable pre-commit hook that runs test-tide.mjs and blocks any commit that fails it.',
            prompt:
              'Show me git show for the exact commit SHA that git bisect run identified, and explain in plain English exactly what changed in that diff and why it broke the tide-time rounding. Then create an executable .git/hooks/pre-commit script that runs node test-tide.mjs and aborts the commit with a clear error message if it exits non-zero. Prove the hook actually works: temporarily reintroduce the same rounding change into tide.js, attempt to commit it, and show me the hook blocking that commit — then revert the reintroduced bug and show a normal commit succeeding.',
          },
        ],
        deliverable:
          'A tide-board-bisect repository with its scripted history intact, a saved git bisect log recording the automated hunt, the exact commit SHA and a plain-English diagnosis of the planted regression, and a live, tested .git/hooks/pre-commit script that blocks any future commit failing test-tide.mjs — proof that the same bug class cannot be silently committed again.',
      },
    },
  ],
  quiz: [
    {
      id: 'm8-q1',
      q: "You're bisecting a regression across sixty commits. After marking the current commit bad and an old tag good, which commit does Git check out next, and why?",
      options: [
        'The very next commit after the good one, so they are checked in order',
        'The commit roughly halfway between the good and bad boundaries, to cut the remaining range in half each round',
        'A randomly chosen commit within the range',
        'The single oldest commit in the entire repository history',
      ],
      answer: 1,
    },
    {
      id: 'm8-q2',
      q: 'When automating a regression hunt with git bisect run ./check.sh, what exit code must check.sh return to tell Git "this commit cannot be tested, skip it" rather than marking it good or bad?',
      options: ['0', '1', '125', '128'],
      answer: 2,
    },
    {
      id: 'm8-q3',
      q: 'A teammate runs a plain git clone (no extra flags) of a repo that embeds another project as a git submodule. What do they see in the submodule\'s directory, and why?',
      options: [
        "The submodule's files fully populated, because clone always recurses into submodules by default",
        "An empty directory, because a submodule only stores a pointer to a specific commit — its content must be fetched separately with git submodule update --init",
        'A compile error, because Git refuses to clone repositories containing submodules without --force',
        'The submodule automatically converted into a subtree',
      ],
      answer: 1,
    },
    {
      id: 'm8-q4',
      q: 'What problem is git sparse-checkout specifically designed to solve?',
      options: [
        "Reducing the number of commits Git has to store in the local object database",
        "Letting a working directory contain only a chosen subset of a repo's tracked directories, while the full history stays in the local object database",
        'Preventing large binary files from ever being committed to a repository',
        'Speeding up merge conflict resolution during a rebase',
      ],
      answer: 1,
    },
    {
      id: 'm8-q5',
      q: 'Once git lfs track is set up for a file pattern, what does Git itself actually store as the committed blob for a matching file?',
      options: [
        'The full binary content, identical to any other tracked file',
        'A compressed, delta-encoded version of the binary',
        "A small text pointer file containing the content's hash and size — the real binary lives in separate LFS storage",
        'Nothing — LFS-tracked files are excluded from the commit entirely, similar to .gitignore',
      ],
      answer: 2,
    },
  ],
}
