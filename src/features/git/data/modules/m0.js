// Module 0 — Version Control Foundations & Your First Repository
// Git Mastery course. Grows the running practice repo, "Tide Board" — a tiny
// static site of Kundapura harbor tide times and ferry schedules.

export const m0 = {
  id: 'm0',
  title: 'Version Control Foundations & Your First Repository',
  hours: 6,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    "Every Git skill you will ever use rests on three ideas: the **working directory**, the **staging area**, and the **repository** itself. This module installs Git, configures it once and correctly, and walks through `git init` until the moment `.git/` stops being a mystery folder. Then it builds the daily loop every working engineer repeats dozens of times a day — **git status**, git add, git commit, git log — using nothing but plain HTML and text files for a tiny Kundapura harbor site called Tide Board, so the mechanics of version control are never obscured by unfamiliar code.",
  sections: [
    {
      id: 'm0-s1',
      title: 'Why Version Control, Why Git',
      topics: [
        {
          id: 'm0-t1',
          title: 'What version control solves, and why Git specifically won',
          explain:
            'Version control is software that records every change to a set of files over time, who made it, and why — Git is the distributed flavor of that idea that ended up winning almost everywhere.',
          analogy:
            "Picture a shared household recipe notebook. Every cook who uses it crosses out a quantity and writes a new one in the margin, or tears out a page and rewrites the whole recipe from memory. Within a year nobody can say which version of the fish curry recipe is the one that actually tastes right, who changed the chili quantity, or why. A notebook with version control would instead keep every past page intact, labeled with who wrote it and when, so you can always get back to any earlier recipe on demand.",
          theory:
            "Before Git, most teams either had no version control at all — folders full of files named tide-board-v2-FINAL-fixed.html — or used a **centralized** system like CVS, Subversion (SVN), or Perforce. In a centralized system, one server holds the only real history; every commit requires a network round-trip to that server, and if the server is unreachable or its disk is lost without a backup, the project's entire history can go with it. Centralized systems also default to a locking or single-timeline mental model that makes parallel work by several people awkward.\n\nGit, created by Linus Torvalds in 2005 to replace the previous ad-hoc process (and a short-lived proprietary tool called BitKeeper) for developing the Linux kernel, is **distributed**: every single clone of a repository carries the entire history, not just the current snapshot. There is no \"the\" server that history depends on — your laptop's copy of Tide Board's history is, structurally, exactly as complete as any copy on GitHub. This single design choice cascades into most of what makes Git pleasant to use: you can commit, browse history, and create branches entirely offline; branching is a matter of writing a 41-byte pointer rather than copying a directory tree, so it is instant and cheap; and every object Git stores is addressed by the SHA-1 hash of its content, so corruption or tampering anywhere in history is detectable.\n\nGit did not win purely on technical merit, though the merits are real. It won because those technical properties — cheap branching, offline work, verifiable history — matched how open-source and, later, most commercial software teams actually wanted to collaborate: many contributors, many parallel lines of work, merged back together, without asking a single server's permission for every step. GitHub then turned \"a distributed tool\" into \"a place everyone already has an account,\" and the network effect did the rest. It is worth being honest that Git did not eliminate every rival: Perforce is still commonly the right tool at game studios and other places dominated by huge, frequently-locked binary assets, precisely because Git's model (every clone holds full history of every version of every file) is a poor fit for gigabytes of binary art assets. For a project like Tide Board — small text and HTML files — Git's assumptions fit close to perfectly.",
          whyItMatters:
            "You are about to build Tide Board from a completely empty folder. Understanding *why* Git exists — and why it is a full history graph living on your own machine rather than a single shared file on a server — is what makes every later command (branch, merge, rebase, push) feel inevitable instead of arbitrary.",
          steps: [
            'Open any folder on your own computer where you have ever saved a file as v2, v2_final, or FINAL_FINAL.',
            "Pick two of those files and try to say, in one sentence, exactly what changed between them. Notice how hard that is without opening both and reading line by line.",
            'List what information is completely missing from that folder: who made each change, when, and why.',
            'Read the definition of "distributed" above and restate it in your own words: every clone holds the complete history, not just the latest snapshot.',
            "Name one situation where you would still reach for a centralized, lock-based tool instead of Git (hint: huge binary game assets edited by one person at a time).",
          ],
          code: `$ ls -la ~/Documents/TideBoard-old-backups/
tide-board-v1.html
tide-board-v2.html
tide-board-v2-Asha-edit.html
tide-board-v2-FINAL.html
tide-board-v2-FINAL-fixed.html
tide-board-v2-FINAL-fixed-USE-THIS-ONE.html

# Six files. Which one is current? Nobody can say for certain.
# None of them record WHAT changed between versions, WHO changed it,
# or WHY — and two people editing "v2" at the same time would have
# silently overwritten each other's work with no way to recover it.`,
          pitfalls: [
            "**Treating your editor's Ctrl+Z undo history as version control.** It vanishes the moment the file closes or the app crashes; it was never saved anywhere. Fix: only a committed snapshot in a real VCS survives closing the file.",
            '**Relying on a cloud drive\'s built-in "version history" (Google Drive, Dropbox) as a substitute for Git.** Those keep arbitrary, uncommented snapshots at arbitrary intervals — there is no meaningful message explaining a change, no way to combine two people\'s parallel edits, and no branching. Fix: use them for backup, use Git for history.',
            '**Renaming files to version them (v1, v2, FINAL).** There is no diff between the two files unless you open both and compare by eye, and the naming scheme itself becomes unreliable within weeks. Fix: one file, many commits.',
            "**Assuming Git is only for programmers writing code.** Tide Board is plain HTML and text — Git tracks any text-based content equally well, which is exactly why this course starts with a tiny static site rather than an application.",
            '**Picking a VCS by hype rather than fit.** Git dominates general software development, but Perforce still legitimately wins for huge binary asset pipelines (game studios) because of its file-locking model. Fix: know Git\'s assumptions (small-ish text files, everyone wants full history) so you recognize when a project does not fit them.',
          ],
          tryIt:
            'Find one real file on your machine that you personally renamed to include "v2", "final", or "backup" at some point. Write one sentence describing the decision that made you create a new file instead of just editing the old one — that decision point is exactly the moment a Git commit is designed to capture instead.',
          takeaway:
            'Git won by being distributed (full history on every clone), fast to branch, and content-verifiable — properties that fit how real teams collaborate far better than a single central server or a folder full of "final" files.',
        },
        {
          id: 'm0-t2',
          title: 'Installing Git and one-time global setup',
          explain:
            'Before your first commit ever exists, Git needs to be installed and told who you are — a handful of settings, made once per machine, that get stamped onto every commit you will ever make on that machine.',
          analogy:
            "It's the same reason a shared workshop keeps a sign-in sheet by the door: before you pick up a single tool, you write your name once, and every project you touch afterward is attributed to you automatically. Skip it, and the workshop has no idea whose work is whose.",
          theory:
            "Git installs differently per operating system — the official installer from git-scm.com on Windows, `sudo apt install git` on Debian/Ubuntu, and either Xcode's Command Line Tools or Homebrew (`brew install git`) on macOS. Whichever route you take, confirm it worked with `git --version`.\n\nGit reads configuration from three layers, each overriding the one before it: **system** (one file, shared by every user on the machine, rarely touched), **global** (one file per user, at `~/.gitconfig` on Linux/macOS or `C:\\Users\\<you>\\.gitconfig` on Windows, applies to every repository that user works in), and **local** (a `config` file inside a specific repository's own `.git/` folder, applies only there and beats both of the others). `git config --global <key> <value>` writes to the global file; the same command without `--global`, run inside a repository, writes to that repository's local file instead.\n\nFour settings are worth setting globally before you commit anything at all. `user.name` and `user.email` are baked permanently into the metadata of every commit you create — they are how `git log` and GitHub attribute work to you, and getting the email right matters because GitHub links commits to your profile by matching that address. `init.defaultBranch` controls what `git init` names the very first branch of a brand-new repository; historically this defaulted to `master`, but GitHub and most tooling now expect `main`, so setting it once avoids a rename step later. `core.editor` controls which program opens when a Git command (like a bare `git commit`) needs you to type a message, since the OS's default editor is not always the one you want.\n\nTo see the full, resolved picture of your configuration — and, crucially, *which file* each setting is actually coming from — run `git config --list --show-origin`. This is the tool you reach for when a setting seems to be \"not taking effect\": it almost always means a more specific file (local beats global beats system) is quietly overriding the one you just edited.",
          whyItMatters:
            "Tide Board's very first commit will permanently record whatever `user.name` and `user.email` are set to at that moment. Get them wrong, and every future commit carries the wrong attribution until you deliberately fix it — which, once history is shared with Asha and Ravi from Module 1 onward, becomes a real rewrite rather than a quick edit.",
          steps: [
            'Install Git for your operating system and confirm it with `git --version`.',
            'Set your name globally: `git config --global user.name "Your Name"`.',
            'Set your email globally: `git config --global user.email "you@example.com"`.',
            'Set the default initial branch name: `git config --global init.defaultBranch main`.',
            'Set your preferred commit-message editor: `git config --global core.editor "code --wait"` (or your editor of choice).',
            'Run `git config --list --show-origin` and confirm all four values, and which file each came from.',
          ],
          code: `$ git --version
git version 2.43.0

$ git config --global user.name "Divya Shetty"
$ git config --global user.email "divya.shetty@example.com"
$ git config --global init.defaultBranch main
$ git config --global core.editor "code --wait"

$ git config --list --show-origin
file:C:/Users/divya/.gitconfig  user.name=Divya Shetty
file:C:/Users/divya/.gitconfig  user.email=divya.shetty@example.com
file:C:/Users/divya/.gitconfig  init.defaultbranch=main
file:C:/Users/divya/.gitconfig  core.editor=code --wait`,
          pitfalls: [
            "**Skipping `user.name`/`user.email` and letting Git fall back to OS-guessed values.** Recent Git versions will often refuse to commit at all until identity is set, and older ones silently use an untrustworthy guess. Fix: set both explicitly, on every machine you work from.",
            '**Using a personal or work email you did not mean to make public.** Once a commit exists, that email is permanently part of history (short of rewriting it, which Module 6 covers) — and public GitHub repos expose it. Fix: consider using the noreply email GitHub provides for exactly this reason.',
            "**Never setting `init.defaultBranch` and getting the old `master` default**, then having to rename the branch before pushing to a GitHub repo that expects `main`. Fix: set it once, globally, and never think about it again.",
            '**Setting identity only locally (inside one repo\'s `.git/config`) and being confused when a brand-new repo elsewhere has no name/email at all.** This is the local-vs-global scope split — local settings apply to exactly one repository, global settings apply to every repository you have not overridden. Fix: put identity in `--global`; override locally only for a specific repo that genuinely needs a different identity (e.g., a work email in a work repo).',
            "**Hand-editing `~/.gitconfig` and breaking its plain-text INI syntax**, which makes every subsequent Git command in error. Fix: use `git config --global --edit` (which opens the file safely in your configured editor) or the `git config` setter commands, rather than editing blind.",
            "**Never running `--show-origin` and assuming a setting is active just because you typed the command once.** A more specific config file (local beating global) can silently override what you just set. Fix: `--show-origin` tells you exactly which file won.",
          ],
          tryIt:
            'Run `git config --global --list` right now and read every line back to yourself, out loud, confirming you recognize and intended each one. Then run `git config --global --edit` to see the same values as plain text in `~/.gitconfig`.',
          takeaway:
            'Global config runs once per machine and is stamped onto every future commit — get `user.name` and `user.email` right before your first commit exists, not after.',
        },
        {
          id: 'm0-t3',
          title: 'git init and the anatomy of a freshly initialized repository',
          explain:
            '`git init` turns an ordinary folder into a Git repository by creating one hidden subfolder, `.git/`, that holds the entire history and configuration — nothing else about the folder changes.',
          analogy:
            'Imagine placing a locked filing cabinet in the corner of a room that already has furniture in it. The room looks exactly the same to anyone glancing in — the desks and chairs (your actual files) have not moved — but every record that matters from now on gets filed inside that one cabinet.',
          theory:
            "`git init` creates a `.git/` directory inside the current folder and does absolutely nothing to any file outside it. A handful of things inside `.git/` are worth being able to name on sight.\n\n`HEAD` is a one-line text file containing a reference, typically `ref: refs/heads/main` — a pointer to *which branch is currently checked out*, not a commit itself. `config` is this repository's **local** config file (the third layer from the previous topic), where repository-specific settings and, later, remotes get stored. `objects/` is the actual object database: every piece of file content, every directory snapshot, and every commit gets stored here as a compressed object, addressed by the SHA-1 hash of its own content — in a brand-new repository, before any commit exists, this folder is essentially empty. `refs/` holds branch and tag pointers as tiny files; `refs/heads/` holds local branches, and `refs/tags/` holds tags — in a fresh repository with zero commits, `refs/heads/` has nothing in it yet, because a branch cannot point to a commit that does not exist. `hooks/` ships with sample scripts (like `pre-commit.sample`) that are inactive until you rename away the `.sample` suffix. `info/exclude` is a local, unshared sibling of `.gitignore` — patterns here are ignored only on your machine and are never committed.\n\nA repository with no commits yet is sometimes called having an \"unborn branch\": `HEAD` points at `refs/heads/main`, but that file does not exist yet, because no commit has been made to create it. This is completely normal, not broken — the very first commit is what actually creates `refs/heads/main` and gives `HEAD` something real to point at.\n\n`git init -b main` lets you set the initial branch name at the moment of `init`, overriding whatever `init.defaultBranch` is configured to, if you ever need a one-off exception. Running `git init` again on a folder that is already a repository is safe — Git prints \"Reinitialized existing Git repository\" and does not discard any existing history.",
          whyItMatters:
            "Understanding what actually lives in `.git/` demystifies almost every confusing Git message you will hit later (\"does not have any commits yet\", detached HEAD, corrupted repository) — and it is the concrete foundation the next topic's three-trees model is built on, since \"the repository\" tree is precisely this `objects/` and `refs/` machinery on disk.",
          steps: [
            'Create a new, empty folder for the project: `mkdir tide-board && cd tide-board`.',
            'Run `git init` inside it and read the confirmation message.',
            'List the contents of the new `.git/` folder.',
            'Open and read `.git/HEAD` — predict what it says before you look.',
            'Open and read `.git/config`.',
            'Confirm `.git/refs/heads/` and `.git/objects/` are both currently empty, since no commit exists yet.',
          ],
          code: `$ mkdir tide-board && cd tide-board
$ git init
Initialized empty Git repository in /home/divya/tide-board/.git/

$ ls -a .git
HEAD  config  description  hooks  info  objects  refs

$ cat .git/HEAD
ref: refs/heads/main

$ cat .git/config
[core]
	repositoryformatversion = 0
	filemode = true
	bare = false
	logallrefupdates = true

$ ls .git/refs/heads
# (nothing printed — no commits exist, so no branch ref file exists yet)

$ find .git/objects -type f
# (nothing printed — the object database is empty)`,
          pitfalls: [
            '**Running `git init` in the wrong, too-high directory** — for example your entire home folder or `C:\\` — which turns every unrelated file underneath it into part of one accidental repository. Fix: always confirm your current directory (`pwd`) before running `init`.',
            '**Deleting `.git/` thinking it is a disposable cache.** It is the entire history of the project — deleting it leaves your current files intact but destroys every commit permanently. Fix: never delete `.git/` unless you specifically intend to erase all version history.',
            '**Assuming a repository with an empty `refs/heads/` folder is broken.** A brand-new repo with zero commits is expected to look exactly like this — it is called an unborn branch, and it resolves itself the instant you make your first commit.',
            "**Being afraid to run `git init` a second time on the same folder.** It is safe: Git reinitializes the repository's configuration defaults without discarding any existing commits.",
            '**Running `git init` inside a subfolder of a project that is already a Git repository**, accidentally creating a confusing nested repository. Fix: check whether a parent folder is already tracked (`git rev-parse --show-toplevel`) before initializing.',
            '**Assuming `.gitignore` lives inside `.git/`.** It does not — `.gitignore` is an ordinary, trackable file that lives in your project\'s working directory (commonly the repo root) and gets shared with everyone. `.git/info/exclude` is the local-only, unshared equivalent.',
          ],
          tryIt:
            "In your new Tide Board folder, run `git init`, then open `.git/HEAD` and `.git/config` in a plain text editor. Before you look at `.git/refs/heads/`, write down what you expect to find there — then check, and confirm your prediction was right.",
          takeaway:
            '`.git/` is the entire repository — history, refs, and configuration; everything else in the project folder is just the current snapshot of the working directory.',
        },
        {
          id: 'm0-t4',
          title: 'The three trees: working directory, staging area, repository',
          explain:
            'Every Git command moves or compares content between exactly three places — the working directory, the staging area (index), and the repository — and this one mental model explains almost every command you will ever run.',
          analogy:
            "Think of the Kundapura ferry counter on a departure morning. Bags at home, still being packed, are like your working directory — you can still change your mind about anything. Bags checked in at the counter, weighed and listed on that trip's manifest, are like the staging area — the list is fixed the moment you check in, even if you keep repacking your other bags at home afterward. And the ferry company's permanent logbook of every trip that has actually sailed is like the repository — once a trip is logged, it is history.",
          theory:
            "The **working directory** is simply the files on disk as you edit them with any ordinary text editor — Git watches them but does not manage them directly at this stage.\n\nThe **staging area**, also called the index, is a single file at `.git/index`. It is not a copy of the whole project's history; it is a snapshot-in-progress of exactly what will go into the *next* commit. Running `git add <file>` does two things: it writes the file's current content into `.git/objects/` as a new blob object (if that exact content is not already stored), and it records, in `.git/index`, that this path now points at that blob. Nothing is sent anywhere, and no permanent history is created yet — staging is entirely local bookkeeping.\n\nThe **repository** is the sequence of commit objects living in `.git/objects/`. Each commit object points to a tree object (a full snapshot of the project's directory structure at that moment) and to its parent commit (or commits, for a merge). Running `git commit` takes exactly what is currently recorded in the index — not whatever happens to be on disk in the working directory at that instant — wraps it into a new commit object, and moves the current branch's ref (e.g. `refs/heads/main`) to point at that new commit.\n\nThe direction of normal work is working directory → (`git add`) → staging area → (`git commit`) → repository. Two commands run in reverse: plain `git restore <file>` overwrites the working directory with the version currently in the index, discarding uncommitted edits to that file; `git restore --staged <file>` removes a file from the index (unstaging it) using the version from the last commit, without touching the working directory at all.\n\nThis model also explains Git's two most basic comparison commands. Plain `git diff` (no flags) compares the working directory against the index — it shows changes you have *not yet staged*. `git diff --staged` (equivalently `--cached`) compares the index against the last commit (`HEAD`) — it shows exactly what *will* be in the next commit if you run `git commit` right now. Confusing these two is the single most common source of \"wait, where did my change go\" confusion in Git, and the fix is always the same: ask which two trees you actually want to compare.",
          whyItMatters:
            'This model is what every later Git command manipulates — branching, merging, resetting, rebasing. Building the habit of asking "which of the three trees am I looking at right now?" before Asha joins Tide Board in Module 1 will make every future topic in this course click faster.',
          steps: [
            'Create a new file, `tides.txt`, with one line of content. It exists only in the working directory (untracked).',
            'Run `git add tides.txt` and confirm with `git status` that it now shows as staged.',
            'Without staging again, append a second line to `tides.txt`.',
            'Run plain `git diff` — this compares the working directory to the index, so it shows only the second line.',
            'Run `git diff --staged` — this compares the index to `HEAD`, so it shows only the first line (there being no prior commit yet, the whole staged content shows as new).',
            'Commit with `git commit -m "..."`, then run `git status` again and predict, before running it, whether it will say the working tree is clean.',
          ],
          code: `$ echo "Kundapura Harbor -- Tide Times" > tides.txt
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	tides.txt

nothing added to commit but untracked files present (use "git add" to track)

$ git add tides.txt
$ git status
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   tides.txt

$ echo "High tide: 06:40 IST" >> tides.txt
$ git status
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   tides.txt

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   tides.txt

$ git diff
diff --git a/tides.txt b/tides.txt
index e69de29..8a3f21c 100644
--- a/tides.txt
+++ b/tides.txt
@@ -1 +1,2 @@
 Kundapura Harbor -- Tide Times
+High tide: 06:40 IST

$ git diff --staged
diff --git a/dev/null b/tides.txt
new file mode 100644
index 0000000..e69de29
--- /dev/null
+++ b/tides.txt
@@ -0,0 +1 @@
+Kundapura Harbor -- Tide Times

$ git commit -m "Add initial tide times file"
[main (root-commit) 3f1a9c2] Add initial tide times file
 1 file changed, 1 insertion(+)

# The commit only ever contains what was IN THE INDEX at commit time --
# the second line, appended after staging, never made it into this commit.
$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   tides.txt

no changes added to commit (use "git add" and/or "git commit -a")`,
          pitfalls: [
            '**Assuming `git add` "saves" or uploads a file.** It only records a snapshot into the local index — nothing is sent anywhere, and no permanent history exists until a commit is made.',
            '**Editing a file after staging it and expecting that later edit to be included automatically.** As the code above shows, a commit freezes exactly what was in the index — you must run `git add` again to include a later edit.',
            '**Confusing plain `git diff` with `git diff --staged`.** The first shows working-directory-vs-index (unstaged changes); the second shows index-vs-HEAD (what the next commit will contain). Running the wrong one makes a real change look "missing" when it is simply sitting in the other tree.',
            '**Dismissing the staging area as pointless extra busywork that could be skipped.** It is the only place you can preview exactly what a commit will contain (`git diff --staged`) before making that commit permanent — and Topic 6 shows how it enables splitting one file\'s edits into multiple honest commits.',
            "**Believing `.git/index` is a human-readable text file you could safely hand-edit.** It is a binary file; manipulate it only through `git add`, `git restore`, and `git reset`, never by opening it directly.",
            '**Mixing up which tree `git restore` targets.** Plain `git restore <file>` overwrites the *working directory* from the index, discarding uncommitted edits; `git restore --staged <file>` only unstages, leaving the working directory untouched. Running the wrong one can silently discard real work.',
          ],
          tryIt:
            'Repeat the exact sequence above with a second file, ferries.txt: stage it, then edit it again before committing. Run both `git diff` and `git diff --staged` and write down, before running `git commit`, exactly what you expect the commit to contain — then verify with `git status` afterward.',
          takeaway:
            'A commit freezes whatever is currently in the staging area — never whatever happens to currently be on disk in your working directory.',
        },
      ],
    },
    {
      id: 'm0-s2',
      title: 'The Daily Loop: status, add, commit, log',
      topics: [
        {
          id: 'm0-t5',
          title: 'git status and git diff — seeing what changed before committing',
          explain:
            '`git status` reports, file by file, which of the three trees each change currently sits in; `git diff` shows the exact line-by-line content of those differences.',
          analogy:
            "It's like a harbor master's whiteboard versus the actual cargo manifest. The whiteboard (`git status`) tells you at a glance which boats are still loading, which are checked in and ready, and which have already sailed. The manifest (`git diff`) is what you unroll when you need to read exactly which crates changed, line by line.",
          theory:
            '`git status` in its default, verbose form reports the current branch, whether there are commits yet, which tracked files have unstaged modifications, which staged changes are ready to commit, and which files are completely untracked. Once remotes exist (a later module), it also reports how far ahead of or behind a remote branch you are, and it flags an in-progress merge or rebase conflict when one is happening. `git status -s` (or `--short`) compacts all of that into two-letter codes per file — the first column reflects the *staged* state, the second reflects the *unstaged* state, so `M ` means "modified, staged", ` M` means "modified, not staged", `MM` means "staged, then modified again afterward", and `??` means untracked.\n\n`git diff` with no arguments compares the working directory against the index — exactly the unstaged changes. `git diff --staged` (or `--cached`) compares the index against `HEAD` — exactly what the next commit would contain. `git diff HEAD` compares the working directory directly against the last commit, which is the union of both (useful as a single "show me everything different from what\'s committed" view). Diff output is the standard unified diff format: a `@@ -a,b +c,d @@` hunk header giving old/new starting line and length, then lines prefixed `-` for removed, `+` for added, and a leading space for unchanged context lines shown for orientation. `git diff --stat` gives a compact per-file summary of insertion/deletion counts without the full line-by-line hunks — useful for a fast scan before drilling into specific files with a plain `git diff -- <path>`.',
          whyItMatters:
            'Habitually running `git status` and `git diff` before every single `git add` is the highest-leverage habit in this entire module — it is the free, zero-risk check that catches an accidental unrelated edit, a leftover debug line, or an unfinished thought before it becomes permanent history.',
          steps: [
            'Append a new line to the existing tides.txt file.',
            'Create a brand-new file, ferries.txt, with one ferry schedule line.',
            'Run `git status` and read every section top to bottom before doing anything else.',
            'Run `git status -s` and match each two-letter code back to what the verbose report said.',
            'Run `git diff -- tides.txt` to see the unstaged change to the modified file.',
            'Stage ferries.txt only, then run `git status -s` again to see a staged file and an unstaged file reported simultaneously.',
          ],
          code: `$ echo "Low tide: 12:55 IST" >> tides.txt
$ printf "Ferry: Kundapura -> Gangolli, 07:00 & 17:00 daily\\n" > ferries.txt

$ git status
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   tides.txt

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	ferries.txt

no changes added to commit (use "git add" and/or "git commit -a")

$ git status -s
 M tides.txt
?? ferries.txt

$ git diff -- tides.txt
diff --git a/tides.txt b/tides.txt
index 8a3f21c..b7c9d41 100644
--- a/tides.txt
+++ b/tides.txt
@@ -1,2 +1,3 @@
 Kundapura Harbor -- Tide Times
 High tide: 06:40 IST
+Low tide: 12:55 IST

$ git add ferries.txt
$ git status -s
 M tides.txt
A  ferries.txt

$ git diff --staged
diff --git a/dev/null b/ferries.txt
new file mode 100644
index 0000000..1f4a0aa
--- /dev/null
+++ b/ferries.txt
@@ -0,0 +1 @@
+Ferry: Kundapura -> Gangolli, 07:00 & 17:00 daily`,
          pitfalls: [
            "**Reflexively running `git commit -a` without checking status first.** `-a` stages and commits modifications and deletions to *already-tracked* files only — it silently skips brand-new untracked files, so a new file like ferries.txt can look committed when it never was. Fix: always check `git status` first.",
            '**Misreading the two-letter short status codes.** The first column is staged state, the second is unstaged state — `MM` means "staged, then edited again since," not an error.',
            '**Forgetting that plain `git diff` never shows staged content.** Running it and seeing nothing (when changes are in fact staged) leads to false alarms about "my changes disappeared" — they are simply visible under `git diff --staged` instead.',
            '**Skimming past "nothing to commit, working tree clean" and trying to commit anyway.** Git will simply refuse — that message means there is genuinely nothing staged, not that something is broken.',
            '**Never running `git diff` before staging, then staging and committing blindly.** This is how commented-out debug lines, stray trailing whitespace, and half-finished sentences end up permanently in history.',
            "**Expecting a readable diff on a binary file.** Once Tide Board grows an image, `git diff` on it reports only \"Binary files a/... and b/... differ\" — there is no meaningful line-by-line view for binary content.",
          ],
          tryIt:
            'In Tide Board, make three different kinds of change at once: modify an existing tracked file, create a new untracked file, and delete a tracked file. Write down, before running anything, which section of `git status` you expect each of the three to land in — then run it and check.',
          takeaway:
            'Run `git status` before every stage or commit — it is the free, zero-risk check that tells you exactly what you are about to do to your history.',
        },
        {
          id: 'm0-t6',
          title: 'Staging with git add — whole files vs. git add -p',
          explain:
            '`git add` copies a snapshot of a file into the staging area; `git add -p` breaks that same file into reviewable hunks so you can stage only part of it — the tool that makes genuinely atomic commits possible.',
          analogy:
            "It's like sorting a mixed catch on the jetty before loading trucks. You don't tip the entire boat's catch onto one truck indiscriminately — you sort it by which buyer it's actually going to, crate by crate. `git add -p` is that same sorting instinct applied to a file's changes: not everything you edited in one sitting belongs in the same shipment.",
          theory:
            "`git add <file>` (or `git add path/`) stages exactly the current on-disk content of the named file(s). `git add -A` (or `--all`) stages every change across the *entire* working tree — new files, modifications, and deletions — regardless of your current directory. `git add .` in modern Git (2.x) stages new files, modifications, *and* deletions, but only within the current directory and below; run from the repository root the two are effectively equivalent, though `.` is scoped and `-A` is not. `git add -u` (or `--update`) stages modifications and deletions for *already-tracked* files only — it never picks up brand-new untracked files, which makes it useful when you deliberately want to leave a new file out.\n\n`git add -p` (patch mode) walks through a modified, already-tracked file one hunk at a time, and for each hunk prompts you: `y` stages this hunk, `n` leaves it unstaged, `s` tries to split the hunk into smaller ones if the changes are separable, `e` opens the hunk for manual editing, `a` stages this and every remaining hunk in the file, `d` leaves this and every remaining hunk in the file unstaged, and `q` quits immediately. One real limitation: patch mode only works on content Git already knows about — a brand-new *untracked* file has no prior version to diff against, so `git add -p` offers it as one all-or-nothing block rather than hunks (staging it partially first requires `git add -N`, which marks it as tracked with no content yet, so a real diff exists to split).\n\nThe reason a separate staging step exists at all becomes concrete here: it lets you separate \"this exact piece of my current edits is done and belongs together\" from \"this is just whatever is currently sitting on disk.\" Without it, every commit would have to be either the entire current state of every modified file, or nothing — there would be no way to commit two unrelated edits to the same file as two separate, clean, individually revertable commits.",
          whyItMatters:
            "A real editing session on Tide Board will often mix a genuine content correction with an unrelated typo fix in the same file. `git add -p` lets you commit those as two separate, honestly-described commits instead of one commit whose message has to say \"and\" twice.",
          steps: [
            'Make two unrelated edits to tides.txt in the same sitting: fix a spelling mistake in the header, and append a brand-new tide entry.',
            'Run `git add -p tides.txt` and read the first hunk it offers.',
            'Split the hunk with `s` if the two edits are shown together, so each can be judged separately.',
            'Stage only the new tide-entry hunk (`y`); leave the spelling-fix hunk unstaged (`n`).',
            'Confirm with `git diff --staged` that only the intended hunk is staged, then commit it alone.',
            'Run `git add -p tides.txt` again to stage and commit the remaining spelling-fix hunk as its own, second commit.',
          ],
          code: `$ cat tides.txt
Kundapura Harbor -- Tide Times
High tide: 06:40 IST
Low tide: 12:55 IST

# Fix a typo AND add a new line in the same editing session
$ sed -i 's/Harbor/Harbour/' tides.txt
$ echo "High tide: 18:52 IST" >> tides.txt

$ git add -p tides.txt
diff --git a/tides.txt b/tides.txt
index b7c9d41..a12ff90 100644
--- a/tides.txt
+++ b/tides.txt
@@ -1,3 +1,4 @@
-Kundapura Harbor -- Tide Times
+Kundapura Harbour -- Tide Times
 High tide: 06:40 IST
 Low tide: 12:55 IST
+High tide: 18:52 IST
Stage this hunk [y,n,q,a,d,s,e,?]? s
Split into 2 hunks.
@@ -1,2 +1,2 @@
-Kundapura Harbor -- Tide Times
+Kundapura Harbour -- Tide Times
 High tide: 06:40 IST
Stage this hunk [y,n,q,a,d,j,J,g,e,?]? n
@@ -1,3 +2,4 @@
 High tide: 06:40 IST
 Low tide: 12:55 IST
+High tide: 18:52 IST
Stage this hunk [y,n,q,a,d,e,?]? y

$ git diff --staged
diff --git a/tides.txt b/tides.txt
index b7c9d41..8f0c3aa 100644
--- a/tides.txt
+++ b/tides.txt
@@ -1,3 +1,4 @@
 Kundapura Harbor -- Tide Times
 High tide: 06:40 IST
 Low tide: 12:55 IST
+High tide: 18:52 IST

$ git commit -m "Add 18:52 high tide entry"
[main 9d2b6a1] Add 18:52 high tide entry
 1 file changed, 1 insertion(+)

$ git add -p tides.txt
diff --git a/tides.txt b/tides.txt
index 8f0c3aa..a4e771c 100644
--- a/tides.txt
+++ b/tides.txt
@@ -1,4 +1,4 @@
-Kundapura Harbor -- Tide Times
+Kundapura Harbour -- Tide Times
 High tide: 06:40 IST
 Low tide: 12:55 IST
 High tide: 18:52 IST
Stage this hunk [y,n,q,a,d,e,?]? y

$ git commit -m "Fix Harbour spelling in tide sheet header"
[main 5c7e0f3] Fix Harbour spelling in tide sheet header
 1 file changed, 1 insertion(+), 1 deletion(-)`,
          pitfalls: [
            '**Reflexively typing `git add .` for every commit.** It bundles every unrelated change lying around in the working tree into one commit, defeating atomicity before you even reach `git commit`. Fix: stage deliberately, by file or by hunk.',
            "**Believing `git add .` still skips deleted files.** That was true before Git 2.0; modern Git includes deletions within the given path. Don't rely on outdated advice for this.",
            "**Trying `git add -p` on a brand-new untracked file and getting no hunks to choose from.** Patch mode needs a prior version to diff against; a new file offers only an all-or-nothing block unless first marked with `git add -N`.",
            "**Assuming a hunk can always be split with `s`.** Git can only split along boundaries like blank lines or clearly separate edits — two changes on immediately adjacent lines may refuse to split, in which case manual editing (`e`) is the fallback.",
            '**Losing track of a half-staged file across a long session.** A hunk staged an hour ago still shows as staged in `git status` even while you have moved on to editing something else entirely — always check status before committing.',
            "**Manually editing a hunk (`e`) and breaking the patch syntax.** Git refuses to apply a malformed manual edit. If unsure, back out with `q` or `n` rather than guessing at diff formatting.",
          ],
          tryIt:
            'In tides.txt, make two unrelated edits in one sitting: correct an existing number, and add a brand-new tide line. Use `git add -p` to commit only the correction first, then only the addition — producing two atomic commits out of one editing session.',
          takeaway:
            'Staging is not a formality — `git add -p` is what turns one messy editing session into two or more clean, honestly-described commits.',
        },
        {
          id: 'm0-t7',
          title: 'Writing good commits: git commit, messages, and atomicity',
          explain:
            '`git commit` permanently seals whatever is currently staged into a new snapshot in history, and the message attached to it is the single most-read piece of documentation any codebase has.',
          analogy:
            "Think of a ship's logbook entry: terse, dated, and stating exactly what happened and why — because whoever reads it months later, possibly the same captain, has no other context to fall back on except that one line.",
          theory:
            "`git commit -m \"message\"` commits with a one-line message directly from the command line. A bare `git commit`, with no `-m`, opens whatever editor `core.editor` is configured to (Topic 2) with a template: any commented lines starting with `#` — including a helpful summary of what's staged, copied from `git status` — are stripped automatically when you save and close, and only the remaining text becomes the message. `git commit -a` combines staging and committing for already-tracked files' modifications and deletions in one step, but — exactly like `git add -u` — it never picks up brand-new untracked files.\n\nThe conventional shape of a good message is a short summary line, written in the imperative mood (\"Add\", \"Fix\", \"Remove\" — as if completing the sentence \"If applied, this commit will ___\" — rather than \"Added\" or \"Adds\"), kept short enough not to wrap awkwardly in tools like `git log --oneline` or GitHub's UI (a common convention is roughly 50 characters as a soft target, 72 as a hard one), optionally followed by a blank line and a body explaining *why* the change was made and any context a future reader would want — the diff itself already shows *what* changed, so the body's job is the part the diff cannot show.\n\n\"Atomic\" describes a commit that represents exactly one logical, self-contained change: a working codebase both immediately before and immediately after it, doing one coherent thing, revertable or cherry-pickable on its own without dragging unrelated changes along for the ride. A practical test: try to describe the commit in its summary line without using the word \"and\" — if you cannot, it is very likely two commits pretending to be one. Atomic commits are what make later tools meaningful: `git revert` can cleanly undo one specific change, `git bisect` (a later module) can pinpoint exactly which commit introduced a bug, and `git log` reads as an honest narrative of the project rather than a series of muddled snapshots.",
          whyItMatters:
            'Once Asha joins Tide Board in Module 1, commit messages become the primary way she understands what changed and why without having to ask you directly — a habit built solo now pays off the moment a second person is reading your history.',
          steps: [
            'Stage exactly one logical change — for example, a new ferry schedule entry.',
            'Run a bare `git commit` (no `-m`) and read the editor template that opens.',
            'Write a summary line in imperative mood, under roughly 50-72 characters.',
            'Leave a blank line, then add a short body explaining why the change matters, save, and close the editor.',
            'Run `git log -1` and confirm the summary and body were stored exactly as written.',
            'Stage a second, smaller and more obvious change, and commit it with `git commit -m "..."` directly — noticing when a body is worth writing versus when a one-liner is genuinely enough.',
          ],
          code: `$ git add ferries.txt
$ git commit
# Editor opens with:
#
#   Add Kundapura-Gangolli ferry schedule
#
#   Ferry counter confirmed two daily crossings (07:00 and 17:00).
#   Times will need re-checking every monsoon season.
#
#   # Please enter the commit message for your changes. Lines starting
#   # with '#' will be ignored, and an empty message aborts the commit.
#   #
#   # On branch main
#   # Changes to be committed:
#   #	new file:   ferries.txt
#   #
# (saved and closed)

[main 2b9a441] Add Kundapura-Gangolli ferry schedule
 1 file changed, 1 insertion(+)

$ git log -1
commit 2b9a4413f0a1c9e8e6a2d0d3b8f7a9c1e2d3f4a5
Author: Divya Shetty <divya.shetty@example.com>
Date:   Wed Jul 22 09:14:02 2026 +0530

    Add Kundapura-Gangolli ferry schedule

    Ferry counter confirmed two daily crossings (07:00 and 17:00).
    Times will need re-checking every monsoon season.

$ echo "Ferry: Kundapura -> Kotatatchra, 08:30 daily" >> ferries.txt
$ git add ferries.txt
$ git commit -m "Add Kotatatchra ferry timing"
[main 7f1c220] Add Kotatatchra ferry timing
 1 file changed, 1 insertion(+)`,
          pitfalls: [
            '**Writing messages in past tense ("Fixed", "Added") instead of imperative mood ("Fix", "Add").** The convention exists because a well-formed summary line completes the sentence "If applied, this commit will ___".',
            "**Bundling two unrelated changes into one commit because they happened to be edited in the same sitting.** This makes the commit non-atomic — reverting one part means reverting both. Fix: use `git add -p` (Topic 6) to split them into separate commits first.",
            "**Writing a summary line so long it wraps or gets truncated** in `git log --oneline` or a GitHub pull request list. Keep it short; move detail into the body.",
            "**Using `git commit -a` and assuming it staged everything.** Exactly like `git add -u`, it skips brand-new untracked files entirely — a new file can silently never get committed.",
            '**Leaving the summary line vague** ("fix stuff", "updates", "wip"). Months later this is worse than no message at all, because it costs the reader time confirming it says nothing.',
            '**Treating the body as optional even when the "why" is not obvious from the diff.** The diff always shows *what* changed; only the message can explain *why* — and "why" is usually the part a future reader actually needs.',
          ],
          tryIt:
            'Write two commits for two genuinely separate changes in Tide Board — one adding a new ferry timing, one correcting an existing tide time — each with an imperative summary line under 50 characters. Run `git log -1` on each and read the message back as if you had never seen the underlying diff.',
          takeaway:
            'A commit is atomic when its summary line can honestly describe the whole thing without needing the word "and".',
        },
        {
          id: 'm0-t8',
          title: 'Reading history: git log --oneline/--graph/--stat, and git show',
          explain:
            '`git log` reads the commit history at different levels of detail, and `git show` expands any single commit back into its full diff.',
          analogy:
            'A family photo album read three different ways: flipping quickly through thumbnails to find a moment (--oneline), reading the full-page captions to see roughly how much happened on each page (--stat), and pulling out one specific photo to examine in full detail (git show).',
          theory:
            "Plain `git log` prints, newest first, each commit's full 40-character SHA, author, date, and the complete message, opened in a pager (typically `less`, or a Windows equivalent) that you exit with `q`. `git log --oneline` compresses this to one line per commit: a 7-character abbreviated SHA (Git lengthens it automatically only if needed for uniqueness in a larger repository) followed by just the summary line — ideal for a fast scan. `git log --graph` draws the branch and merge topology alongside the log using `*`, `|`, `/`, and `\\` characters; on Tide Board's current single, unbranched line of commits it just draws a straight vertical line of asterisks, but it becomes genuinely useful the moment branches exist, from Module 1 onward. `git log --stat` prints each commit's normal header followed by a compact per-file summary of insertions and deletions (with a small scaled +/- bar and a totals line), without the full line-by-line diff text — useful for judging a commit's *scope* before deciding whether to read its full diff. `git log -n 3` (or the shorthand `git log -3`) limits output to the three most recent commits; these flags all combine freely, so `git log --oneline --graph -5` is common.\n\n`git show <sha>` prints one specific commit's full metadata and its complete diff against its parent — effectively picking a single entry out of what `git log -p` (which shows the full diff for *every* commit in range) would print. `git show` also accepts a path suffix: `git show <sha>:path/to/file` prints that exact file's content as it existed at that specific commit, without checking anything out or disturbing your working directory at all — a quick way to \"look into the past\" for one file.",
          whyItMatters:
            "As Tide Board grows commit by commit, fluent history-reading is how you or a teammate answer \"when did this change, and why\" in seconds: `--oneline` to scan, `--stat` to judge scope, and `git show` to read the one commit that actually matters.",
          steps: [
            'Run plain `git log` on your Tide Board repo and note that it opens in a pager — press `q` to exit.',
            'Run `git log --oneline` for a compact, one-line-per-commit view.',
            'Run `git log --oneline --graph` and note the currently-straight line of commits — this will become meaningful once branches exist.',
            'Run `git log --stat` to see each commit\'s per-file insertion/deletion summary.',
            'Pick one short SHA from the `--oneline` list and run `git show <sha>` to see its full diff.',
            'Run `git show <sha>:tides.txt` to print that file\'s exact content as of that one commit, without touching your working directory.',
          ],
          code: `$ git log --oneline
7f1c220 Add Kotatatchra ferry timing
2b9a441 Add Kundapura-Gangolli ferry schedule
5c7e0f3 Fix Harbour spelling in tide sheet header
9d2b6a1 Add 18:52 high tide entry
3f1a9c2 Add initial tide times file

$ git log --oneline --graph
* 7f1c220 Add Kotatatchra ferry timing
* 2b9a441 Add Kundapura-Gangolli ferry schedule
* 5c7e0f3 Fix Harbour spelling in tide sheet header
* 9d2b6a1 Add 18:52 high tide entry
* 3f1a9c2 Add initial tide times file

$ git log --stat -3
commit 7f1c220b3a4d5e6f7081920a3b4c5d6e7f8091a2
Author: Divya Shetty <divya.shetty@example.com>
Date:   Wed Jul 22 09:20:11 2026 +0530

    Add Kotatatchra ferry timing

 ferries.txt | 1 +
 1 file changed, 1 insertion(+)

commit 2b9a4413f0a1c9e8e6a2d0d3b8f7a9c1e2d3f4a5
Author: Divya Shetty <divya.shetty@example.com>
Date:   Wed Jul 22 09:14:02 2026 +0530

    Add Kundapura-Gangolli ferry schedule

    Ferry counter confirmed two daily crossings (07:00 and 17:00).
    Times will need re-checking every monsoon season.

 ferries.txt | 1 +
 1 file changed, 1 insertion(+)

commit 5c7e0f3a1b2c3d4e5f60718293a4b5c6d7e8f901
Author: Divya Shetty <divya.shetty@example.com>
Date:   Wed Jul 22 09:05:47 2026 +0530

    Fix Harbour spelling in tide sheet header

 tides.txt | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git show 5c7e0f3
commit 5c7e0f3a1b2c3d4e5f60718293a4b5c6d7e8f901
Author: Divya Shetty <divya.shetty@example.com>
Date:   Wed Jul 22 09:05:47 2026 +0530

    Fix Harbour spelling in tide sheet header

diff --git a/tides.txt b/tides.txt
index 8f0c3aa..a4e771c 100644
--- a/tides.txt
+++ b/tides.txt
@@ -1,4 +1,4 @@
-Kundapura Harbor -- Tide Times
+Kundapura Harbour -- Tide Times
 High tide: 06:40 IST
 Low tide: 12:55 IST
 High tide: 18:52 IST

$ git show 3f1a9c2:tides.txt
Kundapura Harbor -- Tide Times`,
          pitfalls: [
            '**Not knowing how to exit the pager.** `git log` opens in `less` (or a similar pager) by default — press `q` to quit. It has not frozen.',
            '**Assuming the SHA shown by `--oneline` is the whole commit hash.** It is an abbreviated prefix (7 characters by default, lengthened only if needed for uniqueness) — the full 40-character SHA is what is actually stored and what uniquely identifies the commit.',
            "**Reading `--stat`'s +/- bar as an absolute measure.** It is scaled relative to the largest change shown in that particular log output, not a fixed unit.",
            '**Running `git show` on a merge commit and expecting an ordinary single diff.** A commit with more than one parent (a merge, from Module 2 onward) is diffed differently by default — save deep merge-diff reading for later; for now, `git show` on an ordinary single-parent commit is the one to build fluency with.',
            "**Concluding `--graph` is broken or pointless on Tide Board's current history.** On a single straight line of commits it only draws a vertical line — that is correct, and its real value appears the moment branches exist.",
            '**Piping `git log` output to another command and being confused that colors and paging disappear.** Git automatically disables color and paging when output is not going to an interactive terminal — that is expected, not a bug.',
          ],
          tryIt:
            'Run `git log --oneline` on your Tide Board repo, pick the very first commit\'s short SHA, then run both `git show <that-sha>` and `git show <that-sha>:tides.txt` — confirm the file content printed matches exactly what you originally typed in that first commit.',
          takeaway:
            '`--oneline` is for scanning, `--stat` is for judging scope, and `git show` is for reading the one commit you actually need in full.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm0-p1',
      type: 'Mini Project',
      title: 'First Repo: Tide Board',
      domain: 'Version Control',
      duration: '1-2 hrs',
      description:
        "Start the Tide Board practice repository from a completely empty folder: a tiny static site of Kundapura harbor tide times and ferry schedules, plain HTML and text files, no build tooling. Build it up through a deliberate sequence of small, atomic, well-messaged commits, using `git status` and `git diff` before every stage and `git add -p` at least once to split a mixed edit into separate commits.",
      tools: ['Git', 'Terminal', 'Text Editor'],
      blueprint: {
        overview:
          'This project proves you can take a project from zero history to a clean, readable, multi-commit timeline entirely by hand — no shortcuts, no bundling unrelated changes, and a history that reads honestly when scanned with `git log --oneline`.',
        functionalRequirements: [
          'A folder named tide-board is initialized as a Git repository with `git init`.',
          'Global `user.name` and `user.email` are confirmed (via `git config --list --show-origin`) before the first commit is made.',
          'At least five atomic commits exist in the repository, each doing exactly one logical thing.',
          'tides.txt contains at least three tide entries plus one corrected header, added across separate commits.',
          'ferries.txt contains at least two ferry schedule entries, each added in its own commit.',
          '`git log --oneline` shows a clean, readable history where every summary line is in imperative mood and none contains the word "and".',
        ],
        technicalImplementation: [
          'Run `git status` and `git diff` before every single `git add` — no staging blind.',
          'Use `git add -p` at least once to split two unrelated edits inside the same file into two separate commits.',
          'Use `git log --stat` and `git show <sha>` to verify, after the fact, that each commit only touches what its own message claims.',
          'After the first commit, confirm `.git/HEAD` points at `refs/heads/main` and that `.git/refs/heads/main` now exists and contains a real commit SHA.',
          'Do not hand-edit anything inside `.git/` at any point — every change goes through `git add`, `git commit`, or `git config`.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Initialize the repo and confirm identity',
            outcome:
              'An empty tide-board folder becomes a Git repository, with global user.name/user.email confirmed and the default branch named main.',
            prompt:
              'Create a new folder called tide-board and run git init inside it. Before creating any files, confirm my global Git identity is set correctly by running git config --list --show-origin and showing me the user.name, user.email, and init.defaultBranch values along with which file each comes from. Then show me the contents of the newly created .git folder and explain briefly what HEAD currently points to and why refs/heads is still empty.',
          },
          {
            step: 2,
            label: 'Commit the first tide sheet',
            outcome:
              'tides.txt exists with an initial line of content, staged and committed as one atomic, well-messaged commit.',
            prompt:
              'Inside tide-board, create a file named tides.txt with a header line "Kundapura Harbor Tide Times" and one tide entry. Run git status and git diff so I can see the file is untracked, then stage it with git add and show me git status again to confirm it is staged. Commit it with an imperative-mood summary line under 50 characters, such as "Add initial tide times file". After committing, run git log -1 and git show on that commit so I can see exactly what got recorded.',
          },
          {
            step: 3,
            label: 'Add the ferry schedule across two atomic commits',
            outcome:
              'ferries.txt exists with two ferry schedule entries, each added in its own separate, atomic commit.',
            prompt:
              'Create a new file ferries.txt with one ferry schedule line for a Kundapura to Gangolli route. Stage and commit it as one atomic commit with a clear imperative summary line and a short body explaining the source of the timing. Then add a second, different ferry route line to the same file, and commit that as a second, separate atomic commit. Show me git log --oneline after both commits so I can confirm there are now two distinct, clearly-described commits for the two ferry entries rather than one bundled commit.',
          },
          {
            step: 4,
            label: 'Practice git add -p on a mixed edit',
            outcome:
              'A single editing session that mixes an unrelated spelling fix with a genuine new tide entry gets split into two separate commits using patch-mode staging.',
            prompt:
              'In tides.txt, make two unrelated edits in the same sitting: fix a spelling mistake in the header line, and append one brand-new tide entry. Do not stage anything yet. Then walk me through git add -p tides.txt interactively: split the hunk if needed so the spelling fix and the new tide entry can be judged separately, stage only the new tide entry first, show me git diff --staged to confirm only that part is staged, and commit it alone. Then run git add -p again to stage and commit the remaining spelling-fix hunk as its own second commit. Explain at each step which hunk is being staged and why.',
          },
          {
            step: 5,
            label: 'Audit the finished history',
            outcome:
              'The complete five-plus-commit history is reviewed end to end and confirmed to be atomic, well-messaged, and technically correct.',
            prompt:
              'Show me the full history of the tide-board repository so far using git log --oneline --graph, then git log --stat to see the scope of every commit, and finally git show on the very first commit to confirm its content matches what I originally typed. Check that every summary line is in imperative mood and that none of them contain the word "and" — if any commit looks like it bundles more than one logical change, tell me which one and why, without making any further commits yourself.',
          },
        ],
        deliverable:
          "A tide-board folder that is a real Git repository with at least five atomic, imperative-mood commits, visible cleanly in git log --oneline --graph. tides.txt holds a corrected header and three or more tide entries added across separate commits; ferries.txt holds two or more ferry entries added across separate commits. At least one pair of commits demonstrably came from a single git add -p session that split one mixed edit into two honest commits, verifiable by running git show on each and finding exactly one logical change in each.",
      },
    },
  ],
  quiz: [
    {
      id: 'm0-q1',
      q: "You edit tides.txt, run git add tides.txt, then edit tides.txt again without staging the new edit. You immediately run git commit -m \"Update tide times\". Which version of tides.txt ends up recorded in the new commit?",
      options: [
        'The current on-disk version, including the second edit',
        'Exactly the version that was staged — only the first edit',
        'Git refuses to commit until the working directory and the index match exactly',
        'Both edits are automatically merged together into the commit',
      ],
      answer: 1,
    },
    {
      id: 'm0-q2',
      q: "Asha argues that the staging area is a pointless extra step and you should be able to commit straight from the working directory. What is the strongest reason staging exists as its own step?",
      options: [
        "It lets you review and select exactly what goes into the next commit, including only part of a file via git add -p",
        'It permanently backs up your files in case your hard drive fails',
        'It automatically uploads your changes to a remote server for safekeeping',
        'It is only relevant once a project has more than one branch',
      ],
      answer: 0,
    },
    {
      id: 'm0-q3',
      q: 'You want a fast, compact scan of the last several commits\' summary lines — one commit per terminal line, no full author/date block and no diff text. Which command gives you exactly that?',
      options: [
        'git log --stat',
        'git log -p',
        'git log --oneline',
        'git show --all',
      ],
      answer: 2,
    },
    {
      id: 'm0-q4',
      q: 'A commit\'s message reads: "Fix ferry schedule typo and add new high-tide entry and reformat file indentation." What is the actual problem here?',
      options: [
        'Nothing — a good commit message should list every single thing the commit touches',
        'The message is too short and needs a longer body paragraph',
        'The commit bundles three unrelated changes into one; it is not atomic and should likely be split into three separate commits',
        'The commit should have been made with git commit -a instead of git commit -m',
      ],
      answer: 2,
    },
    {
      id: 'm0-q5',
      q: "Inside the tide-board repository, you run git config user.email \"work@example.com\" (no --global flag), while your global email is still set to a personal address. What happens to commits made in tide-board from now on, versus commits made in a brand-new, unrelated repository on the same machine?",
      options: [
        'Every repository on the machine now uses the work email, since a local setting always overwrites the global file itself',
        'Commits in tide-board use the work email, because local config overrides global config for that repository only; a new repository elsewhere still uses the global personal email',
        'Git ignores the local value entirely and always uses whatever --global last set, everywhere',
        'Git refuses to commit, because a machine can only have one email configured across all repositories',
      ],
      answer: 1,
    },
  ],
}
