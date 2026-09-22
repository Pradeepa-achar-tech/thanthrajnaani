// Module 7 — Team Workflows & Branching Strategies
// Git Mastery course content for the React course player.

export const m7 = {
  id: 'm7',
  title: 'Team Workflows & Branching Strategies',
  hours: 7,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    "Tide Board has grown from a solo project into a small team's shared codebase, and this module is about the branching and process decisions that keep a multi-person repo sane. It compares **Git Flow** against the simpler **GitHub Flow** and trunk-based development, covers cutting release and hotfix branches and backporting a fix to an older supported line, and introduces **semantic versioning** and `git tag` for marking releases. The second half is about keeping a shared repo healthy at scale: Conventional Commits and auto-generated changelogs, **CODEOWNERS** for automatic review routing, the real trade-offs between a monorepo and a polyrepo, and writing a CONTRIBUTING.md so a new teammate can get productive fast.",
  sections: [
    {
      id: 'm7-s1',
      title: 'Choosing a Branching Model',
      topics: [
        {
          id: 'm7-t1',
          title: 'Git Flow: develop, feature, release, and hotfix branches',
          explain:
            "Git Flow is a strict branching model built around two permanent branches (main and develop) and three kinds of temporary branches (feature, release, hotfix), each with a fixed rule for where it starts and where it merges back to.",
          analogy:
            "Picture the Kundapura ferry terminal running two parallel tracks: a rehearsal track where new schedule changes get tested with the crew before anyone boards, and the live dock where paying passengers actually board. A release is the day the rehearsal track's changes get copied over to the live dock and announced. If something goes wrong at the live dock right before departure, staff do not send the fix back through the whole rehearsal process — they patch the live dock directly, then copy that same patch back into the rehearsal track so it is not lost next time.",
          theory:
            "Git Flow was described by Vincent Driessen in 2010 and it names every branch by its job. `main` (sometimes still called `master`) always points at exactly what is in production — every commit on it corresponds to a released version, typically marked with a tag. `develop` is the integration branch: it holds everything that has been finished and merged, but not yet released. These two branches never disappear.\n\nEverything else is temporary and follows a fixed lifecycle. A **feature branch** (`feature/ferry-delay-badge`) is cut from `develop`, worked on for as long as the feature takes, and merged back into `develop` only — never into `main` directly. A **release branch** (`release/1.3.0`) is cut from `develop` once it has everything intended for the next version. On a release branch you allow only last-mile work — version bumps, changelog entries, bug fixes found during final testing — and explicitly forbid new features, so the scope stops moving while you stabilize. When it is ready, the release branch merges into **both** `main` (tagged as the new version) and back into `develop` (so any fixes made during stabilization are not lost). A **hotfix branch** (`hotfix/ferry-count-crash`) is the odd one out: it branches from `main` directly, because the bug is already in production and `develop` may be far ahead with half-finished work you do not want to ship. Once fixed, it also merges into both `main` (tagged as a new patch version) and `develop`.\n\nThe rule that trips people up first: **feature branches never touch `main`**, and **`develop` is always at least as new as `main`, usually newer**. Every merge in this model uses `--no-ff` (no fast-forward) by convention, so even a single-commit feature leaves a merge commit behind — that merge commit is what makes `git log --graph` on a Git Flow repo readable: you can see exactly which feature or release each chunk of history belongs to, at the cost of a busier graph than a linear history.\n\nGit Flow is genuinely good for teams that release **infrequently to a fixed version**, and often need to **support more than one released version at once** — think desktop software, embedded firmware, or a library with a long-term-support line. The release branch gives you an explicit stabilization window with a hard freeze on new features, which matters when a release goes through manual QA or a slow certification process before it ships. Where it overcomplicates things is a small team shipping a web app several times a week: the permanent `develop` branch adds a merge step that does not correspond to anything a user experiences, every feature takes two merges to reach production instead of one, and the strict branch-naming ceremony is pure overhead when there is no separate QA phase and no old version anyone still needs patched.",
          whyItMatters:
            "You will meet Git Flow in the wild constantly — plenty of real codebases (including ones with long-lived release lines) still run it, and job postings still say 'familiar with Git Flow'. Knowing exactly which branch a fix is supposed to land on, and why, is the difference between a hotfix that actually reaches every future release and one that quietly regresses next month.",
          steps: [
            "Starting from Tide Board's current `main`, create a permanent `develop` branch: `git checkout -b develop main`.",
            "Cut a feature branch from `develop` for a small change (e.g. a delay badge on the ferry table), commit on it, then merge it back into `develop` with `git merge --no-ff`.",
            "Cut a `release/1.3.0` branch from `develop`, bump the version file, and merge it into both `main` (tagged) and `develop`.",
            "Simulate a production bug: cut a `hotfix/x` branch from `main`, fix it, then merge into both `main` (tagged as a patch) and `develop`.",
            "Delete each temporary branch (`git branch -d ...`) once it is merged everywhere it needs to be, and confirm with `git log --graph --all --oneline` that `main`, `develop`, and the tags all show the fix.",
            "Write one sentence on when you would reach for this model for a real project versus when it would be overkill.",
          ],
          code: `# Setting up the two permanent branches
$ git checkout -b develop main
Switched to a new branch 'develop'

# A feature branch, cut from develop, merged back into develop only
$ git checkout -b feature/ferry-delay-badge develop
Switched to a new branch 'feature/ferry-delay-badge'
$ git commit -am "feat: show a delay badge on the ferry table"
[feature/ferry-delay-badge 9f1a2c3] feat: show a delay badge on the ferry table
$ git checkout develop
$ git merge --no-ff feature/ferry-delay-badge -m "Merge feature/ferry-delay-badge into develop"
$ git branch -d feature/ferry-delay-badge

# Cutting a release: only stabilization work happens here
$ git checkout -b release/1.3.0 develop
$ git commit -am "chore: bump version to 1.3.0"
$ git checkout main
$ git merge --no-ff release/1.3.0 -m "Release 1.3.0"
$ git tag -a v1.3.0 -m "Tide Board 1.3.0"
$ git checkout develop
$ git merge --no-ff release/1.3.0 -m "Merge release/1.3.0 back into develop"
$ git branch -d release/1.3.0

# A hotfix: branches from main, not develop
$ git checkout -b hotfix/ferry-count-crash main
$ git commit -am "fix: guard against an empty ferry list crashing the counter"
$ git checkout main
$ git merge --no-ff hotfix/ferry-count-crash -m "Hotfix 1.3.1"
$ git tag -a v1.3.1 -m "Tide Board 1.3.1"
$ git checkout develop
$ git merge --no-ff hotfix/ferry-count-crash -m "Merge hotfix into develop"
$ git branch -d hotfix/ferry-count-crash`,
          pitfalls: [
            "**Merging a feature branch straight into `main`.** That skips `develop` entirely and breaks the model's whole point — production should only ever move via a tagged release or hotfix merge. Fix: features always target `develop`.",
            "**Forgetting to merge a hotfix back into `develop`.** The production fix then vanishes the next time `develop` is released, and the bug reappears — a classic 'didn't we already fix this?' regression. Fix: every hotfix merges into `main` *and* `develop` (and any active release branch), no exceptions.",
            "**Letting a release branch grow new features 'just this once'.** That defeats the stabilization freeze and makes the release date unpredictable again. Fix: a release branch only accepts bug fixes and release chores; new work waits for the next cycle.",
            "**Using a fast-forward merge for these merges.** A fast-forward silently absorbs the branch's commits with no merge commit, making it much harder to see later which feature or release a change came from. Fix: merge with `--no-ff` for feature/release/hotfix merges in this model.",
            "**Adopting the full ceremony for a two-person side project.** All the branch types and double-merges are pure overhead if you release continuously with no parallel supported versions. Fix: reach for GitHub Flow (next topic) instead.",
          ],
          tryIt:
            "In a scratch clone of Tide Board, create `develop`, land one feature branch into it with `--no-ff`, then cut a `hotfix` branch straight from `main` for a fake bug and merge it into both `main` and `develop`. Run `git log --graph --oneline --all` and confirm you can point to exactly which commit is the hotfix and that it appears on both branches.",
          takeaway:
            "In Git Flow, features merge into develop, only release and hotfix branches ever touch main, and a hotfix is not done until it has been merged back into develop too.",
        },
        {
          id: 'm7-t2',
          title: 'GitHub Flow and trunk-based development',
          explain:
            "GitHub Flow keeps a single permanent branch (main) that is always deployable, with every change going through a short-lived branch and a pull request; trunk-based development pushes the same idea further, with everyone integrating to main at least daily.",
          analogy:
            "Think of a single bus lane at the Kundapura bus stand where every bus that is roadworthy pulls out the moment it passes inspection, instead of the whole depot holding every bus back until a fixed convoy of ten is ready to leave together twice a month. Passengers get a steady trickle of departures rather than one big crowded rush, and if one bus has a flat tyre it does not delay the other nine.",
          theory:
            "GitHub Flow has exactly one long-lived branch: `main`, and the rule that `main` is always in a deployable state. To make any change you branch off `main` (`git switch -c feature/x`), commit, push, and open a pull request — often early, even before the work is finished, so discussion and CI feedback can start immediately. Once the branch is reviewed, its checks pass, and it is merged, it either deploys automatically or is ready to. There is no `develop` branch, no `release` branch, and no fixed release train: 'release' just means 'this commit on main is what's live'. This is dramatically simpler than Git Flow because every change takes exactly one merge to reach production instead of two.\n\n**Trunk-based development** is the more extreme end of the same idea, common at companies running true continuous delivery over large codebases. Developers commit directly to the trunk (`main`) or through branches that live hours, not days, and anything not ready for real users ships behind a **feature flag** — a runtime switch that hides the incomplete code path — rather than being kept off `main` on a branch. This avoids the classic problem of long-lived branches: the longer a branch lives apart from `main`, the more `main` moves underneath it, and the worse the eventual merge conflict gets. Short-lived branches (or no branches at all) keep every integration small and low-risk.\n\nWhy these models have displaced Git Flow for most teams building web products: continuous integration makes 'always releasable main' realistic to maintain (automated tests gate every merge), continuous deployment means there usually is no separate 'release day' to plan around, and feature flags decouple *merging* code from *releasing* it to users — you can merge an unfinished feature safely as long as the flag keeps it hidden, which removes Git Flow's main reason for a long-lived `develop`/`release` split. The trade-off is real, though: GitHub Flow alone gives you less built-in structure for coordinating a big, multi-feature release that needs a QA sign-off across everything at once — teams that need that either add a lightweight release branch back in for just that purpose (Topic 3), or lean harder on feature flags so 'ready to enable' and 'merged' can be decided independently.",
          whyItMatters:
            "Most teams you join today — and certainly a three-person team on Tide Board shipping small changes several times a week — will be running something in this family, not full Git Flow. Knowing when the simpler model is the right call (and being able to say why in one sentence) is exactly the kind of judgment a senior teammate like Ravi will expect you to have.",
          steps: [
            "Confirm `main` is protected and always deployable: no direct commits, only merges through reviewed pull requests.",
            "For a small Tide Board change, branch directly off `main`: `git switch -c feature/tide-chart-tooltip`.",
            "Commit, push, and open a pull request early — before the work is fully finished — so review and CI feedback start immediately.",
            "After approval and passing checks, merge (squash or merge commit, team's choice) and delete the branch.",
            "For a change you are not ready to expose to users yet, wrap it in a simple feature flag instead of leaving it on a long-lived branch, and merge it to `main` anyway.",
            "Compare: count how many merges it took this change to reach `main` here versus in the Git Flow exercise (Topic 1) — one versus two.",
          ],
          code: `# GitHub Flow: branch off main, PR, merge — no develop branch involved
$ git switch main
$ git pull origin main
$ git switch -c feature/tide-chart-tooltip
Switched to a new branch 'feature/tide-chart-tooltip'

$ git commit -am "feat: show exact metre reading on tide chart hover"
$ git push -u origin feature/tide-chart-tooltip

$ gh pr create --fill
Creating pull request for feature/tide-chart-tooltip into main
https://github.com/thanthrajnaani/tide-board/pull/47

# ... Asha reviews, CI runs, checks pass, PR approved ...

$ gh pr merge 47 --squash --delete-branch
✓ Merged pull request #47
✓ Deleted branch feature/tide-chart-tooltip

# Trunk-based style: same idea, even shorter-lived, behind a flag
$ git switch -c feat/experimental-storm-alert
$ git commit -am "feat: storm alert banner behind FEATURE_STORM_ALERT flag"
$ git push -u origin feat/experimental-storm-alert
$ gh pr merge --squash --delete-branch   # merged same day, flag stays off in production`,
          pitfalls: [
            "**Letting a feature branch live for weeks.** The longer it lives apart from `main`, the bigger and scarier the eventual merge conflict gets. Fix: keep branches to a day or two; split large work into smaller mergeable pieces behind a flag.",
            "**Treating 'no develop branch' as 'no review'.** GitHub Flow removes the extra branch, not the pull request. Fix: `main` must still be protected and merges must still go through review (Module 5).",
            "**Merging unfinished, half-working code with no flag and no plan.** That leaves `main` non-deployable, which breaks the model's one hard rule. Fix: either finish the slice before merging, or hide it behind a feature flag.",
            "**Assuming this model has no place for release coordination.** For a genuine multi-feature launch needing sign-off, teams add a short-lived release branch back in for just that (Topic 3) rather than abandoning GitHub Flow entirely.",
            "**Copying Git Flow's branch-naming ceremony 'to be safe' on a GitHub Flow project.** Prefixing everything `feature/`, `release/`, `hotfix/` when there is no `develop` or release branch to route to just adds confusion. Fix: name branches for what they do (`fix/`, `feat/`, or just a short slug), not for a model you are not running.",
          ],
          tryIt:
            "Take the Git Flow feature branch you merged in Topic 1's tryIt and redo the equivalent change as a GitHub Flow branch cut straight from `main`: branch, commit, push, open a PR, merge, delete. Count the merges it took to reach `main` in each version and be ready to explain the difference in one sentence.",
          takeaway:
            "GitHub Flow and trunk-based development trade Git Flow's structure for speed: one deployable main, short-lived branches, feature flags instead of long-lived branches for anything not ready.",
        },
        {
          id: 'm7-t3',
          title: 'Release branches, hotfixes, and backporting to an older release line',
          explain:
            "A release branch lets you freeze and stabilize a specific version while other work continues elsewhere, and backporting is the act of copying a fix made on the newer line onto an older release branch that customers are still using.",
          analogy:
            "Think of the ferry counter still handing out last month's printed timetable to a batch of passengers who bought return tickets under the old schedule, while this month's timetable is already what new sales use. If a printing error is found on a page common to both booklets, the counter has to correct it in both — copying the same fix across two documents that have already gone their separate ways, not just fixing the newer one and hoping nobody notices the old one is wrong.",
          theory:
            "Even teams running GitHub Flow sometimes need a **release branch**: any time more than one version of the software is genuinely 'live' at once — a library other teams depend on at different major versions, an app with an old and a new supported line, or simply a release that needs a stabilization window before a hard deadline. A release branch (`release/1.x`, or a name tied to a specific version) is cut from `main` (or `develop`, in Git Flow) at the point you want to freeze, and from then on it only accepts release-scoped changes: version bumps, changelog entries, and bug fixes discovered during final testing. Meanwhile `main` keeps moving forward with the next version's features, unblocked.\n\nA **hotfix** is an urgent, narrowly-scoped fix applied to a line that is already released — usually branched from the affected release tag or release branch, not from wherever `main` currently is, because `main` may already contain unrelated changes you do not want to ship as part of an emergency patch. Once verified, it is tagged as a new patch version (say `v1.2.4` following a fix to the `1.2.x` line) and released on its own, independent of whatever `main` is doing.\n\n**Backporting** is what makes this safe: taking a fix that exists on one line of history and re-applying it to another, older line that has already diverged. The tool for this is `git cherry-pick <commit-sha>`, which takes the *diff* introduced by a single commit and replays it as a brand-new commit on your current branch — same content, new SHA, new parent, new committer timestamp. Run from the release branch: `git cherry-pick -x <sha>`, where `-x` appends a `(cherry picked from commit <sha>)` line to the commit message, so anyone reading `release/1.x`'s history later can trace the fix back to where it originated. If the two lines have diverged enough that the surrounding code differs, the cherry-pick can conflict exactly like a merge — Git pauses, you resolve the conflict by hand, `git add` the result, and `git cherry-pick --continue` (or `--abort` to back out entirely).\n\nThe direction matters and is easy to get backwards under pressure: fix the bug on the newest line where it still applies first (usually `main`), then cherry-pick it *backward* onto each older supported release branch that also has the bug. Skipping a still-supported older line means that customer never gets the fix; forgetting to also land the fix forward on `main` (if it originated on a hotfix branch instead) means the very next release regresses it.",
          whyItMatters:
            "The moment Tide Board (or any real project) has more than one version anyone actually depends on at the same time, 'just fix it on main' stops being a complete answer. Knowing how to cherry-pick a fix cleanly across release lines — and which lines still need it — is the difference between a fix that reaches every affected user and one that quietly only reaches the newest.",
          steps: [
            "Cut `release/1.x` from the current `main` tip to represent 'what customers on version 1 are running'.",
            "Continue committing new, unrelated feature work on `main` so the two lines diverge, exactly as would happen in real life.",
            "Introduce and fix a bug on `main` (e.g. a rounding error in tide-height display) with its own commit.",
            "Identify that commit's SHA with `git log --oneline`, switch to `release/1.x`, and backport it with `git cherry-pick -x <sha>`.",
            "Resolve any conflict the cherry-pick raises, then tag the result as the next patch on the old line, e.g. `v1.2.4`.",
            "Push both the release branch and the new tag, and confirm with `git log --oneline release/1.x` that the cherry-picked commit (and its `(cherry picked from ...)` note) is present.",
          ],
          code: `# The fix lands on main first
$ git log --oneline main -3
a1b2c3d fix: correct rounding on half-metre tide readings
7e6d5c4 feat: add storm-alert banner
9f0e1d2 chore: bump main to 2.0.0-dev

# Backport it onto the still-supported 1.x line
$ git switch release/1.x
$ git cherry-pick -x a1b2c3d
[release/1.x 4d3c2b1] fix: correct rounding on half-metre tide readings
 (cherry picked from commit a1b2c3d4e5f6...)

$ git log --oneline release/1.x -2
4d3c2b1 fix: correct rounding on half-metre tide readings (cherry picked from commit a1b2c3d)
88a7766 chore: bump to 1.2.3

# Tag and ship the patch on the old line, independent of main's 2.0 work
$ git tag -a v1.2.4 -m "Tide Board 1.2.4 - backport tide-rounding fix"
$ git push origin release/1.x v1.2.4

# If the cherry-pick conflicts (the two lines have diverged):
$ git cherry-pick -x a1b2c3d
Auto-merging src/tides/format.js
CONFLICT (content): Merge conflict in src/tides/format.js
$ # ...edit src/tides/format.js to resolve...
$ git add src/tides/format.js
$ git cherry-pick --continue`,
          pitfalls: [
            "**Fixing the bug only on the release branch and forgetting `main`.** The very next release built from `main` ships the bug again. Fix: land the fix on `main` (or wherever it originated) and cherry-pick it to every still-supported older line, not just the one that screamed loudest.",
            "**Branching a hotfix from wherever `main` happens to be, instead of from the release tag.** That risks shipping unrelated in-progress `main` changes as part of an 'emergency' patch. Fix: branch the hotfix from the exact tag/commit that is actually in production.",
            "**Cherry-picking without `-x` and losing the trail.** Months later nobody can tell where a commit on `release/1.x` originally came from. Fix: always cherry-pick backports with `-x` so the origin commit is recorded in the message.",
            "**Treating a cherry-pick conflict like a lost cause and abandoning it.** It resolves exactly like an ordinary merge conflict — pick the correct lines, `git add`, `git cherry-pick --continue`. Fix: work through it the same way you would a merge conflict.",
            "**Letting a release branch quietly accept new features 'just this once'.** That reintroduces the scope creep a release branch exists to prevent. Fix: release branches only take fixes and release chores, same discipline as in Git Flow.",
          ],
          tryIt:
            "In a scratch repo, create `release/1.x` from `main`, add two more commits to `main` afterward, then introduce and fix a bug on `main`. Cherry-pick just that fix commit onto `release/1.x` with `-x`, and confirm with `git log` that the release branch got only the fix — none of the other `main` commits came along for the ride.",
          takeaway:
            "Fix bugs on the newest line first, then git cherry-pick -x them backward onto every still-supported older release branch — a plain merge would drag along unrelated work you do not want to ship.",
        },
        {
          id: 'm7-t4',
          title: 'Semantic versioning (MAJOR.MINOR.PATCH) and marking releases with git tag',
          explain:
            "Semantic versioning is a MAJOR.MINOR.PATCH numbering convention that tells consumers exactly what kind of change a new version contains, and git tag is how you permanently mark the exact commit that version corresponds to.",
          analogy:
            "Think of the three numbers stapled to a crate leaving Kundapura harbor as a promise to whoever receives it, not just a label. If only the last number changed, the fisherman on the receiving end knows the crate is packed exactly the same way as before, just with a fixed leak in the ice box. If the first number changed, they know to check the crate's whole shape before assuming their usual forklift still fits it.",
          theory:
            "Semantic versioning (semver) gives a version number three parts: **MAJOR.MINOR.PATCH**, e.g. `2.4.1`. Increment **MAJOR** when you make an incompatible, breaking change — anything that could make existing code calling you fail after upgrading. Increment **MINOR** when you add functionality in a backward-compatible way — new features, new optional parameters, nothing existing breaks. Increment **PATCH** when you ship a backward-compatible bug fix — behavior gets closer to what was promised, nothing that depended on the old (buggy) behavior breaks its contract. Whenever a lower number bumps, the numbers to its right reset to zero: fixing a bug on `2.4.1` gives `2.4.2`; adding a feature gives `2.5.0`; a breaking change gives `3.0.0`. The full spec also allows a pre-release suffix (`2.0.0-beta.1`, which sorts *before* `2.0.0`) and build metadata (`2.0.0+build.17`, which does not affect version precedence at all), though most day-to-day projects only need the plain three-number form.\n\nOnce you have decided a version number, `git tag` is how you permanently attach it to one exact commit. There are two kinds. A **lightweight tag** (`git tag v1.0.0`) is just a name pointing at a commit — essentially a branch that never moves. An **annotated tag** (`git tag -a v1.0.0 -m \"Tide Board 1.0.0\"`) is a full Git object of its own: it stores the tagger's name and email, the date, a message, and can optionally be GPG-signed with `git tag -s`. `git show v1.0.0` on an annotated tag prints the tag's own message *and* the commit it points to; on a lightweight tag it just shows the commit. For anything you would call a release, use annotated tags — the recorded message and authorship are exactly the audit trail you want later.\n\nOne detail that catches people out: **tags are not pushed by default**, even when you push the branch the tagged commit is on. `git push origin v1.0.0` pushes that one tag; `git push --tags` pushes every local tag, including ones you may not have meant to share yet; `git push --follow-tags` pushes only the annotated tags that are reachable from commits you are already pushing — the safest of the three for routine use. `git describe` is worth knowing too: run with no arguments on a commit that is not itself tagged, it prints the nearest reachable tag plus how many commits ahead you are and a short SHA, e.g. `v1.2.0-14-gA1b2c3d` — a quick way to answer 'roughly what version is this build?' without looking anything up.",
          whyItMatters:
            "Anyone depending on Tide Board's parsing library — or any package you publish — decides whether it is safe to upgrade almost entirely from the version number, before reading a single line of the changelog. Get the MAJOR/MINOR/PATCH classification wrong even once and you train your users to stop trusting your version numbers, which is far more damaging than the original bug.",
          steps: [
            "Look at Tide Board's last few real changes and classify each as MAJOR, MINOR, or PATCH under semver's rules.",
            "For the next change that is a genuine breaking change (e.g. renaming an exported function), bump MAJOR and reset MINOR/PATCH to zero.",
            "Tag the exact commit that change lives on with an annotated tag: `git tag -a v2.0.0 -m \"...\"`.",
            "Inspect the difference between an annotated and a lightweight tag with `git show` on each.",
            "Push just that tag deliberately with `git push origin v2.0.0`, then try `git push --follow-tags` on a later commit and compare what each pushes.",
            "Run `git describe` on a commit a few commits past the last tag and read the output aloud to make sure you understand every part of it.",
          ],
          code: `# Classifying changes under semver
# renamed 'formatTideHeight' -> breaking -> MAJOR:  1.4.2 -> 2.0.0
# added an optional --units flag -> MINOR:          2.0.0 -> 2.1.0
# fixed wrong rounding on negative tide values -> PATCH: 2.1.0 -> 2.1.1

# Annotated tag: a real object with a message, tagger, and date
$ git tag -a v2.1.1 -m "Tide Board 2.1.1 - fix negative tide rounding"
$ git show v2.1.1
tag v2.1.1
Tagger: You <you@tideboard.dev>
Date:   Wed Jul 22 10:14:02 2026 +0530

Tide Board 2.1.1 - fix negative tide rounding

commit 4f5e6d7...
Author: You <you@tideboard.dev>
    fix: correct rounding on negative tide values

# Lightweight tag, for comparison: just a pointer, no message of its own
$ git tag v2.1.1-lw
$ git show v2.1.1-lw
commit 4f5e6d7...    # straight to the commit — no tagger/date/message block

# Tags don't travel with a normal push
$ git push origin main
$ git tag -l
v2.1.1
$ git push origin v2.1.1              # push just this one tag
$ git push --follow-tags              # or: push annotated tags reachable from pushed commits

# What "roughly what version is this" looks like mid-development
$ git describe
v2.1.1-14-g8a91cd3   # 14 commits past v2.1.1, current commit short SHA 8a91cd3`,
          pitfalls: [
            "**Bumping only PATCH for a change that actually breaks callers.** That tells users the upgrade is safe when it is not, and breaks their build without warning. Fix: any incompatible change is MAJOR, no matter how small it looks in the diff.",
            "**Using lightweight tags for real releases.** You lose the tagger, date, message, and signature that annotated tags give you — details you will want the day you need to audit exactly what shipped and when. Fix: use `git tag -a` (or `-s` to sign) for anything you call a release.",
            "**Assuming `git push` sends your tags along automatically.** It does not; the tag sits locally, unpublished, until you push it explicitly. Fix: `git push --follow-tags` as a habit, or push the specific tag by name.",
            "**Resetting MINOR and PATCH incorrectly (or not at all) on a bump.** `1.4.7` gaining a feature should become `1.5.0`, not `1.4.8` or `1.5.7`. Fix: the numbers to the right of whatever you bump always reset to zero.",
            "**Retagging an already-published version after fixing a mistake in it.** Anyone who already fetched `v1.0.0` now has a different commit under the same name than someone who fetches it later. Fix: tags are meant to be immutable once pushed — cut a new patch version instead of moving an existing tag.",
          ],
          tryIt:
            "Pick three real commits from your Tide Board history and, for each, decide out loud whether it would be a MAJOR, MINOR, or PATCH bump and why. Then tag your current `main` tip as an annotated release and run `git show` on it to confirm the message and tagger are recorded correctly.",
          takeaway:
            "MAJOR is for breaking changes, MINOR for backward-compatible additions, PATCH for backward-compatible fixes — and an annotated git tag is what permanently records which exact commit that version was.",
        },
      ],
    },
    {
      id: 'm7-s2',
      title: 'Keeping a Shared Repo Healthy',
      topics: [
        {
          id: 'm7-t5',
          title: 'Commit message conventions at scale: Conventional Commits and auto-generated changelogs',
          explain:
            "Conventional Commits is a fixed format for commit messages (type, optional scope, description) that lets tools automatically classify every change and generate a changelog — or even decide the next semver bump — without a human reading the whole history.",
          analogy:
            "Think of the harbor office's daily catch ledger. Every boat logs its entry in the exact same format — boat name, catch type, weight, time — instead of a free-text paragraph about their morning. Because every line follows the same shape, the harbor office can total the day's sardine catch across forty boats automatically at closing time, instead of an assistant reading forty paragraphs by hand to find the number.",
          theory:
            "**Conventional Commits** fixes the shape of a commit message's first line: `<type>[optional scope]: <description>`. The common types are `feat` (a new feature), `fix` (a bug fix), `docs`, `style` (formatting, no logic change), `refactor` (neither fixes a bug nor adds a feature), `perf`, `test`, `build`, `ci`, and `chore` (maintenance with no source impact). The scope in parentheses names the affected area: `feat(ferries): add delay badge to schedule table`. A breaking change is marked either with a `!` right after the type/scope (`feat(tides)!: rename formatTideHeight export`) or with a `BREAKING CHANGE:` line in the commit body/footer — either is a signal tools specifically look for.\n\nThe payoff is automation. Tools like `conventional-changelog`, `semantic-release`, and `release-please` walk every commit since the last tag, group them by type, and write a real `CHANGELOG.md` — a 'Features' section from every `feat`, a 'Bug Fixes' section from every `fix`, and so on — with zero manual changelog editing. Some of these tools go one step further and decide the *next version number for you*: any `fix` commit implies at least a PATCH bump, any `feat` implies at least MINOR, and any commit with a `!` or `BREAKING CHANGE:` footer forces MAJOR — the same rules from Topic 4, just applied mechanically from the commit log instead of a human deciding by hand. This only works because every commit actually follows the format; one team member writing free-text messages breaks the automation for that commit (it usually gets silently dropped from the generated changelog, or bucketed as an unclassified 'other' change).\n\nTeams enforce the convention with a `commit-msg` Git hook — commonly `commitlint` paired with `husky` — that rejects a commit outright if its message does not match the expected pattern, catching a malformed message before it ever leaves your machine rather than at review time.",
          whyItMatters:
            "Once Tide Board has three contributors, nobody wants to write the changelog by hand before every release, and nobody wants to scroll `git log` guessing which of forty commits were actual user-facing changes versus internal chores. A consistent commit format turns that into a command you run, not a chore you dread.",
          steps: [
            "Write your next few Tide Board commits in the `type(scope): description` format, picking honestly from feat/fix/docs/refactor/chore/etc.",
            "Mark one deliberately breaking change with a `!` after the type, and confirm you understand why it would force a MAJOR bump.",
            "Run `git log --oneline` and read the types back — you should be able to tell what's user-facing (feat/fix) from what isn't (chore/docs) at a glance.",
            "Install and run `npx conventional-changelog -p angular -i CHANGELOG.md -s` against your tagged history and inspect the generated `CHANGELOG.md`.",
            "Deliberately commit one message that breaks the format and see how it looks bucketed (or dropped) in the generated changelog, to feel the cost of one non-conforming commit.",
            "Optionally wire up `commitlint` + `husky` so a malformed commit message is rejected locally before it can even be pushed.",
          ],
          code: `# A short, honestly-typed commit history
$ git log --oneline -6
c7a1e2f docs: document the tide-height rounding rule in README
b3f9a10 fix(tides): correct rounding on half-metre readings
7c1e4aa feat(ferries): add delay badge to schedule table
5d2b8e1 chore: bump dependencies
a9c0f3d refactor(tides): extract formatTideHeight into its own module
1e8d4c2 feat(tides)!: rename formatTideHeight export to formatTideReading

# That last commit's body would carry the detail tools look for:
$ git show 1e8d4c2 --format="%B" --no-patch
feat(tides)!: rename formatTideHeight export to formatTideReading

BREAKING CHANGE: formatTideHeight no longer exists; import formatTideReading instead.

# Generating a changelog from commits since the last tag
$ npx conventional-changelog -p angular -i CHANGELOG.md -s
$ head -n 20 CHANGELOG.md
## [2.0.0] - 2026-07-22

### ⚠ BREAKING CHANGES
* **tides:** rename formatTideHeight export to formatTideReading

### Features
* **ferries:** add delay badge to schedule table

### Bug Fixes
* **tides:** correct rounding on half-metre readings`,
          pitfalls: [
            "**Writing `fix: stuff` or `update` as a commit message.** It technically has a type but conveys nothing a changelog reader (or future you) can use. Fix: the description should say what changed in plain language, even when brief.",
            "**Forgetting the `!` or `BREAKING CHANGE:` footer on an actually-breaking commit.** Automated tools will happily generate a MINOR bump for a change that breaks every caller. Fix: always mark breaking changes explicitly — the tooling cannot infer it from the diff.",
            "**Mixing an unrelated refactor into a `feat` commit.** The changelog will list the refactor as if it were the new feature's whole story, and vice versa. Fix: keep commits scoped to one type of change (Module 2's atomic-commit habit still applies here).",
            "**Enforcing the convention with no tooling, purely by asking nicely in a PR template.** It erodes within a few weeks once anyone is in a hurry. Fix: enforce it with a commit-msg hook (commitlint + husky) so it's automatic, not a matter of memory.",
            "**Treating every commit as `feat` or `fix` to seem more active.** It defeats the entire point — the classification has to be honest for the generated changelog and version bump to mean anything.",
          ],
          tryIt:
            "Rewrite your last five Tide Board commit messages (on a scratch branch, using `git commit --amend` or an interactive rebase from Module 3) into proper Conventional Commits form, including at least one scope and one deliberately non-breaking `refactor`. Then run `conventional-changelog` against them and read the generated output.",
          takeaway:
            "A fixed `type(scope): description` commit format lets tools generate an accurate changelog — and even the next semver number — straight from git log, with no manual bookkeeping.",
        },
        {
          id: 'm7-t6',
          title: 'CODEOWNERS files: routing required reviewers automatically by path',
          explain:
            "A CODEOWNERS file maps file and folder patterns to specific people or teams, so GitHub automatically requests the right reviewer the moment a pull request touches a matching path.",
          analogy:
            "Think of the harbor office keeping a wall chart that automatically routes a torn-net repair ticket to whichever net-mender is on duty and a leaking-hull ticket to whichever mechanic is on duty, without anyone having to remember week to week who is responsible for what. The chart does the routing; a person still has to actually do the repair and sign off on it.",
          theory:
            "A `CODEOWNERS` file (placed at the repo root, in `.github/`, or in `docs/` — GitHub checks all three) lists path patterns followed by one or more owners: a GitHub username (`@ravi-tideboard`), a team (`@thanthrajnaani/backend`), or an email tied to a GitHub account. The path syntax follows the same rules as `.gitignore`. The critical rule to internalize: **when more than one pattern in the file matches a given file, the last matching pattern in the file wins** — not the most specific one, the last one written — exactly like `.gitignore`. In practice this means you write broad, catch-all patterns near the top of the file and progressively narrower, more specific overrides further down.\n\nOn its own, a CODEOWNERS file does exactly one thing: when a pull request touches a path that matches an entry, GitHub **automatically requests a review from the matching owner(s)**. That is convenience, not enforcement — nothing stops the PR from being merged without that person ever looking at it. The enforcement comes from pairing it with a branch protection rule: 'Require review from Code Owners' on the protected branch. With that rule turned on, a PR touching an owned path genuinely **cannot merge** until an owner (or someone on the owning team) has approved it — this is what makes CODEOWNERS a real access-control mechanism rather than just a notification.\n\nFor Tide Board, a sensible split by area of responsibility might route anything under `/src/ferries/` and `/src/tides/` to whoever owns that feature area, and route root-level project-wide files — `package.json`, CI config, the CODEOWNERS file itself — to the most senior teammate, since a change there can affect everyone. Note that CODEOWNERS routes *pull request review*, not commit access or issue triage — someone can still be a full repository collaborator with push rights while not being listed as an owner of a given path.",
          whyItMatters:
            "Once Tide Board has Asha, Ravi, and you all touching the same repo, nobody wants to manually remember and add the right reviewer on every single PR, and a senior teammate like Ravi does not want every change to every file routed to them by default. CODEOWNERS turns 'who should look at this' from a thing someone has to remember into a thing the repo enforces.",
          steps: [
            "Add a `.github/CODEOWNERS` file to Tide Board and write one broad catch-all pattern (`*`) owned by the most senior teammate.",
            "Add narrower, path-specific entries below it for feature areas (e.g. `/src/ferries/`, `/src/tides/`) owned by whoever actually works in them.",
            "Open a pull request that touches one of the owned paths and confirm GitHub auto-requests the matching reviewer.",
            "Turn on 'Require review from Code Owners' in the branch protection settings for `main`.",
            "Confirm that same PR now genuinely cannot merge without that owner's approval — try merging before they approve and read the block message.",
            "Reorder two overlapping patterns and re-test a PR to prove to yourself that the *last* matching line wins, not the most specific-looking one.",
          ],
          code: `# .github/CODEOWNERS
# Patterns follow .gitignore syntax. When more than one line matches
# a file, the LAST matching line in this file wins — order broad to specific.

# Catch-all: anything not overridden below routes to the senior reviewer
*                       @ravi-tideboard

# Feature areas
/src/ferries/           @asha-tideboard
/src/tides/             @asha-tideboard

# Project-wide / release-critical files stay with Ravi even though they're
# nested under paths Asha owns above — this line comes last, so it wins.
package.json            @ravi-tideboard
/.github/               @ravi-tideboard

$ git add .github/CODEOWNERS
$ git commit -m "chore: add CODEOWNERS to route reviews by path"
$ git push -u origin chore/codeowners
$ gh pr create --fill

# On a later PR touching src/ferries/schedule.js:
$ gh pr view 52
Reviewers requested:  asha-tideboard   # auto-requested — matched /src/ferries/

# With "Require review from Code Owners" on, an unapproved owner blocks merge:
$ gh pr merge 52
X Merging is blocked
  - Requires review from Code Owners`,
          pitfalls: [
            "**Assuming a CODEOWNERS file alone blocks merges.** By itself it only auto-requests reviewers; nothing stops an unreviewed merge until you also enable 'Require review from Code Owners' in branch protection. Fix: turn on that branch protection setting explicitly.",
            "**Writing specific patterns before the broad catch-all and expecting the specific one to win because it looks more precise.** GitHub uses the *last* matching line, not the most specific one. Fix: order entries broad-to-specific, top to bottom.",
            "**Naming a person who has since left the project, or a team that does not exist in the org.** GitHub cannot request a review from an owner it cannot resolve, and the entry silently does nothing. Fix: keep CODEOWNERS current as team membership changes; review it during offboarding.",
            "**Routing every single path to one person 'to be safe'.** That turns one teammate into a bottleneck for every PR and defeats the purpose of splitting ownership. Fix: route by actual area of responsibility, and only keep the truly cross-cutting files under the senior catch-all.",
            "**Confusing CODEOWNERS with commit/push access.** Being listed as an owner controls review routing, not who can push directly — that is a separate branch-protection and repository-permissions setting.",
          ],
          tryIt:
            "Write a CODEOWNERS file for Tide Board with at least three lines, order them so a later, more specific line overrides an earlier broad one, and open a real (or practice) pull request that touches an owned path. Confirm the correct reviewer gets auto-requested, then check the box for 'Require review from Code Owners' and try to merge before that review lands.",
          takeaway:
            "CODEOWNERS auto-requests the right reviewer by path and, combined with a branch protection rule, can genuinely block a merge until that owner approves — and when patterns overlap, the last matching line always wins.",
        },
        {
          id: 'm7-t7',
          title: 'Monorepo vs polyrepo: real trade-offs and Git performance at scale',
          explain:
            "A monorepo keeps multiple projects in one repository for atomic cross-project changes and shared tooling, at the cost of a bigger, slower repo; a polyrepo keeps each project separate and fast, at the cost of coordinating changes across repos.",
          analogy:
            "Think of Kundapura's fish market choosing between one giant shared godown where every vendor's crates sit under one roof — easy to move a crate from one vendor's stall to another's, but the single entrance gets crowded and you have to search the whole godown to find one crate — versus each vendor renting a small separate shed, where finding your own crate is instant but moving one to another vendor means a trip across the market.",
          theory:
            "A **monorepo** is a single Git repository holding multiple projects or packages — say, Tide Board's web frontend, its schedule-parsing library, and a small backend API all in one repo. The real advantage is **atomicity**: a single commit (and single PR) can change the parsing library and update every project that depends on it at the same time, so there is never a moment where one project is stuck depending on an incompatible version of another. It also means one set of CI config, one place to enforce lint/test standards, and trivially easy code sharing — no publishing an internal package to a registry just to use it in another project.\n\nA **polyrepo** keeps each project in its own repository. Each one stays small, clones fast, and has a permissions boundary and a release cadence of its own — you can give a contractor access to just the ferry-schedule repo without touching anything else. The real cost shows up the moment a change needs to span repos: fixing a bug in a shared library now means a PR in the library's repo, publishing a new version, then separate PRs in every consuming repo to bump that dependency — several coordinated reviews and merges instead of one, and a real window where different repos are running different versions of the same shared code.\n\nGit's performance is directly affected by which one you pick, because Git was designed around the assumption of a reasonably sized history and working tree. A monorepo that accumulates years of history across many projects — especially one with large binary assets checked in — makes plain `git clone`, `git status`, and `git gc` measurably slower, because by default Git wants the *entire* history and *every* file in your working tree. This is manageable at small-to-medium scale, but at real scale (thousands of contributors, huge histories) it needs deliberate mitigation: **shallow clone** (`git clone --depth 1`, history only) for CI machines that just need to build, not full history; **partial clone** (`git clone --filter=blob:none`) to fetch commit and tree metadata without downloading every file's full content upfront; **sparse-checkout** (`git sparse-checkout set path1 path2`) to only materialize the folders you actually work in, rather than the whole tree; and **Git LFS** to keep large binaries out of the core object database entirely. None of these are things you get for free by simply choosing 'monorepo' — they are tools you reach for once a monorepo's size actually starts to hurt, and some of the largest real-world monorepos (Google's, for instance) use custom internal tooling well beyond stock Git to stay usable at their scale.",
          whyItMatters:
            "If Tide Board grows into a backend API and a mobile app alongside the web frontend, this is a real decision with real consequences either way — not a stylistic preference. Knowing the actual trade-off (atomic changes and shared tooling versus small, fast, independently-permissioned repos) means you can make the call deliberately instead of discovering the cost after the fact.",
          steps: [
            "List Tide Board's current and plausible future pieces (web frontend, schedule-parsing library, a small API) and decide, honestly, whether they change together often enough to want atomic commits across them.",
            "Note who would need access to which piece — a monorepo means one permission boundary for everything in it, a polyrepo lets you scope access per project.",
            "If choosing a monorepo, try `git clone --filter=blob:none --sparse <url>` followed by `git sparse-checkout set <folder>` and observe how much less gets fetched and materialized versus a full clone.",
            "If choosing a polyrepo, simulate the coordination cost: make a change to a shared piece in one repo, and manually update the dependency version in a second, separate repo.",
            "Write one sentence stating which model you would pick for Tide Board's likely next year of growth, and why.",
          ],
          code: `# A full clone fetches all history and all files up front
$ git clone https://github.com/thanthrajnaani/tide-board-mono.git
Cloning into 'tide-board-mono'...
remote: Enumerating objects: 184213, done.
Receiving objects: 100% (184213/184213), 1.9 GiB | 6.2 MiB/s, done.

# A partial + sparse clone fetches metadata, then only the folders you need
$ git clone --filter=blob:none --sparse https://github.com/thanthrajnaani/tide-board-mono.git
Cloning into 'tide-board-mono'...
remote: Enumerating objects: 184213, done.
Receiving objects: 100% (184213/184213), 41.0 MiB | 8.1 MiB/s, done.

$ cd tide-board-mono
$ git sparse-checkout set apps/web packages/schedule-parser
$ du -sh .git
118M    .git
$ ls
apps/  packages/          # only the two folders you asked for are materialized

# The polyrepo coordination cost: a shared fix now needs two separate PRs
$ cd schedule-parser && git commit -am "fix(parser): correct DST offset" && git tag v3.2.1
$ cd ../tide-board-web && npm install @thanthrajnaani/schedule-parser@3.2.1
$ git commit -am "chore: bump schedule-parser to 3.2.1"`,
          pitfalls: [
            "**Choosing a monorepo assuming Git will just handle any size for free.** Vanilla Git's default clone/status/gc behaviour degrades as history and file count grow; at real scale you need shallow clone, partial clone, sparse-checkout, and/or LFS deliberately. Fix: plan for those tools before the repo gets painfully slow, not after.",
            "**Choosing a polyrepo and then hand-coordinating dependency bumps by memory across repos.** It is easy to forget one consumer, leaving it silently on an old, buggy version of a shared library. Fix: track which repos depend on what, and automate version-bump PRs where possible (many polyrepo teams use a bot for exactly this).",
            "**Splitting into a polyrepo purely because 'the monorepo felt big', without checking whether the projects actually change together.** If they are tightly coupled, you have just traded one big repo for coordinated multi-repo PRs on every change. Fix: base the split on how often the pieces change *together*, not on repo size alone.",
            "**Checking large binary assets straight into a monorepo's normal history.** Every clone forever after pays for that history, even after the asset is deleted. Fix: put large binaries in Git LFS (or keep them out of Git entirely) from day one.",
            "**Assuming a monorepo automatically means shared code quality or one CI config 'for free'.** The repo structure enables that; someone still has to build and maintain the shared tooling. Fix: treat shared CI/lint/test config as its own deliberate investment, not a side effect of merging repos.",
          ],
          tryIt:
            "Time a full `git clone` of any large public monorepo-style project you have access to, then time a `git clone --filter=blob:none --sparse` of the same repo followed by `git sparse-checkout set` on just one subfolder. Compare the wall-clock time and the resulting `.git` folder size, and be ready to explain why the difference exists.",
          takeaway:
            "A monorepo buys atomic cross-project changes and shared tooling at the cost of size and the need for shallow/partial clone, sparse-checkout, or LFS at scale; a polyrepo stays small and fast per-project but pushes coordination cost onto every cross-repo change.",
        },
        {
          id: 'm7-t8',
          title: 'Writing a CONTRIBUTING.md and structuring a repo for fast onboarding',
          explain:
            "A CONTRIBUTING.md spells out the process a contributor needs (setup, tests, commit conventions, how a PR gets reviewed and merged), and a well-structured repo puts that file, a clear README, and templates where a brand-new teammate will actually find them.",
          analogy:
            "Think of handing a new deckhand a laminated one-page card at the ferry counter listing exactly where the life jackets are, how the radio check works, and who to call if the engine will not start — instead of expecting them to figure the boat out by trial and error on their first crossing with passengers already aboard.",
          theory:
            "A `README.md` answers 'what is this and how do I run it' — a short description, a quick-start (clone, install, run), and a link onward. A `CONTRIBUTING.md` is a different document with a different job: it answers 'how do I make a change here correctly'. A solid one covers, at minimum: how to set up the dev environment from a clean machine; how to run the test suite and linter locally before pushing; the commit message convention in use (Topic 5's Conventional Commits, if that's the house style); branch naming and the branching model in use (Topic 1/2 — is this repo on GitHub Flow, Git Flow, something else?); how to open a pull request and what the review process looks like, including that CODEOWNERS (Topic 6) will auto-request specific reviewers by path; and how releases get cut and tagged (Topic 4), if a contributor might ever need to do that themselves.\n\nStructure reinforces the document rather than replacing it. GitHub looks for `CONTRIBUTING.md`, `CODEOWNERS`, and issue/PR templates in a few conventional locations — the repo root or a `.github/` folder — and surfaces them automatically: a 'Contributing' link on the repo's main page, and issue/PR templates pre-filled the moment someone opens a new one (`.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`). A `LICENSE` file, a `CHANGELOG.md` (often auto-generated per Topic 5), and a consistent, predictable folder layout for the code itself all compound the same effect: someone new is never left guessing where to look.\n\nThe test that actually matters is concrete and measurable: **can a brand-new teammate clone the repo, follow the README to get it running locally, read CONTRIBUTING.md to understand the process, and open their first real pull request within a day** — without pinging you five times on Slack for context that should have been written down. If any of those steps requires tribal knowledge that only lives in someone's head, that is exactly the gap CONTRIBUTING.md (and good repo structure) exists to close.",
          whyItMatters:
            "Every module in this course so far has been about the mechanics of Git itself; this is about making sure the *next* person who joins Tide Board — a fourth contributor after you, Asha, and Ravi — does not have to reverse-engineer all of it from scratch. That document is what turns 'ask around' into 'read this and go'.",
          steps: [
            "Write a `CONTRIBUTING.md` covering: local setup, running tests/lint, the commit message convention, the branching model in use, and how PR review and merging work.",
            "Mention explicitly that CODEOWNERS will auto-request specific reviewers by path, so a newcomer isn't confused when a stranger's name shows up on their PR.",
            "Add `.github/PULL_REQUEST_TEMPLATE.md` with a short checklist (tests pass, linked issue, screenshot if UI) so every PR starts from the same shape.",
            "Confirm `README.md`, `CONTRIBUTING.md`, `CODEOWNERS`, and `LICENSE` all live somewhere GitHub recognizes (repo root or `.github/`) and that the repo's main page actually surfaces the Contributing link.",
            "Hand the repo to someone (or simulate it yourself with a fresh clone and a clean memory) and time how long it takes to get from `git clone` to a locally running Tide Board.",
            "Revise anything that took longer than expected, or required information that wasn't written down anywhere.",
          ],
          code: `$ ls -la
README.md
CONTRIBUTING.md
LICENSE
CHANGELOG.md
package.json
.github/
    CODEOWNERS
    PULL_REQUEST_TEMPLATE.md
    ISSUE_TEMPLATE/
        bug_report.md
        feature_request.md
src/
    ferries/
    tides/

$ cat CONTRIBUTING.md
# Contributing to Tide Board

## Setup
1. \`git clone https://github.com/thanthrajnaani/tide-board.git\`
2. \`npm install\`
3. \`npm run dev\` — serves the site locally on http://localhost:5173

## Before you push
- \`npm test\` and \`npm run lint\` must both pass.
- Commit messages follow Conventional Commits: \`feat(scope): ...\`, \`fix(scope): ...\`.

## Branching & review
- We use GitHub Flow: branch off \`main\`, open a PR early, squash-merge once approved.
- CODEOWNERS auto-requests the right reviewer by the paths your PR touches —
  don't be surprised if someone you didn't @-mention gets pulled in.
- \`main\` is protected: direct pushes are rejected, PRs need one approval.

## Releases
- Maintainers tag releases with semver (see CHANGELOG.md for what's shipped
  in each version). You won't normally need to cut a release yourself.

$ time (git clone https://github.com/thanthrajnaani/tide-board.git && cd tide-board && npm install && npm run dev)
# ... a new teammate following only this file, start to finish ...`,
          pitfalls: [
            "**Only ever writing a README and assuming it covers process too.** A README answers 'what is this'; contributors also need 'how do I change it correctly', which is CONTRIBUTING.md's job specifically. Fix: keep both, with distinct purposes.",
            "**Letting CONTRIBUTING.md go stale after the branching model or commit convention changes.** A newcomer following outdated instructions gets a confusing rejection on their first PR. Fix: update it in the same PR that changes the process it describes.",
            "**Burying setup instructions in a wiki, a pinned Slack message, or someone's memory instead of in the repo.** New tools and new teammates alike can't find it. Fix: everything a contributor needs to get started lives in the repo itself.",
            "**Writing a CONTRIBUTING.md so long and generic it could describe any project.** Nobody reads a wall of boilerplate. Fix: keep it short, concrete, and specific to how *this* repo actually works — real commands, real file paths.",
            "**Never actually testing onboarding from a genuinely clean machine.** Instructions that work 'because you already have half the setup from before' will fail for someone new. Fix: periodically test the whole flow on a fresh clone with none of your local shortcuts.",
          ],
          tryIt:
            "Write a CONTRIBUTING.md for Tide Board covering setup, test/lint commands, commit convention, branching model, and PR/review process, then hand only that file (and the README) to someone else — or pretend you have never seen the repo before — and time how long it takes to get from clone to a running local copy.",
          takeaway:
            "README answers what this is; CONTRIBUTING.md answers how to change it correctly — and a repo is well-structured exactly when a brand-new teammate can go from clone to a merged first PR in a day using only what's written down.",
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm7-p1',
      type: 'Project',
      title: 'Pick and Justify a Branching Model',
      domain: 'Team Workflows',
      duration: '2-3 hrs',
      description:
        "Tide Board is now a genuine multi-contributor repo — you, Asha, and Ravi. This project has you write a short decision record choosing a branching model, then actually implement it: a protected main, short-lived feature branches, PR-only merges, a CODEOWNERS file routing review by path, and a tagged v1.0.0 release marking the point the team formally adopted the new process.",
      tools: ['Git', 'GitHub', 'GitHub CLI (gh)'],
      blueprint: {
        overview:
          "You will document the decision before implementing it — a real engineering habit — then configure Tide Board's actual GitHub repository to enforce that decision, not just describe it. By the end, main is protected, CODEOWNERS routes reviewers automatically, a full feature branch has gone through the real PR flow, and v1.0.0 is tagged and pushed.",
        functionalRequirements: [
          "A decision record (e.g. DECISION.md or docs/adr/0001-branching-model.md) exists, naming the alternatives considered (Git Flow, GitHub Flow, trunk-based) and explaining, with Tide Board's actual team size and release cadence, why GitHub Flow was chosen.",
          "The main branch is configured so direct pushes are rejected and merging is only possible through a reviewed pull request.",
          "At least one real short-lived feature branch has been created, pushed, opened as a pull request, reviewed, merged, and deleted.",
          "A .github/CODEOWNERS file exists, routing at least two distinct paths to at least two distinct owners (Asha and Ravi).",
          "An annotated tag v1.0.0 exists on the tip of main and has been pushed to the remote.",
          "A CHANGELOG.md or short release-notes entry summarizes what v1.0.0 actually contains.",
        ],
        technicalImplementation: [
          "Use an existing (or newly created) real GitHub repository for Tide Board; simulate Asha and Ravi as either real collaborators or a second/third local clone if working solo.",
          "Enable branch protection on main via the GitHub UI or `gh api`/`gh repo edit`: require a pull request before merging, require at least one approval, require review from Code Owners, and disallow force pushes to main.",
          "Write .github/CODEOWNERS with patterns ordered broad-to-specific, remembering that the last matching line wins.",
          "Create a feature branch off main for one small real change, push it, open a PR with `gh pr create`, get it approved, and merge with `gh pr merge --squash --delete-branch`.",
          "Tag the resulting main tip with `git tag -a v1.0.0 -m \"...\"` and push it with `git push origin v1.0.0`.",
          "Update CHANGELOG.md (by hand, or generated per Topic 5 if commits are already Conventional-Commits-formatted) describing what shipped in v1.0.0.",
        ],
        prompts: [
          {
            step: 1,
            label: 'Write the decision record',
            outcome:
              "A DECISION.md file exists in the repo root documenting the chosen branching model and why.",
            prompt:
              "In the Tide Board repository, create a DECISION.md file documenting a branching-model decision. Context: the repo now has three contributors (me, and teammates named Asha and Ravi), it ships small changes to a live static site several times a week, and there is currently no need to support multiple old released versions at once. In the file, briefly describe Git Flow, GitHub Flow, and trunk-based development as the alternatives considered, then record the decision: adopt GitHub Flow (a single protected main branch, short-lived feature branches, all changes via reviewed pull request, no permanent develop or release branch). Explain the consequences: how a release will now just mean 'tag the current main tip', and that if we later need to support two versions at once we can add a release branch back in without abandoning this model. Commit this file directly to main with a plain, clear commit message.",
          },
          {
            step: 2,
            label: 'Protect main and require reviewed PRs',
            outcome:
              "Direct pushes to main are rejected on the remote, and merging requires an approved pull request.",
            prompt:
              "Configure branch protection on the Tide Board repository's main branch (using the GitHub UI, `gh api`, or `gh repo edit`, whichever is available) so that: direct pushes to main are rejected, merging is only possible via a pull request, at least one approving review is required before merge, and force-pushes to main are disallowed. Once configured, prove it by attempting a direct `git push origin main` with a trivial change and showing the rejection message, then show that the same change succeeds when done through a branch and pull request instead.",
          },
          {
            step: 3,
            label: 'Add CODEOWNERS and run a real PR through it',
            outcome:
              "A .github/CODEOWNERS file exists and routes review correctly, and a real feature branch has gone through the full PR lifecycle under the new rules.",
            prompt:
              "Create a .github/CODEOWNERS file for Tide Board with at least three lines: a broad catch-all pattern owned by Ravi (representing the senior teammate), and at least two narrower path-specific patterns (for example /src/ferries/ and /src/tides/) owned by Asha, ordered so the more specific lines come after the catch-all. Commit and merge this file through a PR. Then create a new short-lived feature branch for one small real Tide Board change, push it, open a pull request with the GitHub CLI, and confirm in the PR that the correct owner was auto-requested as a reviewer based on the paths touched. After approval, merge with a squash merge and delete the branch.",
          },
          {
            step: 4,
            label: 'Cut and tag the v1.0.0 release',
            outcome:
              "An annotated v1.0.0 tag exists on main, is pushed to the remote, and is described in a CHANGELOG or release notes entry.",
            prompt:
              "On the current tip of Tide Board's main branch, create an annotated tag v1.0.0 with a clear message describing this as the point the team formally adopted GitHub Flow with a protected main and CODEOWNERS-based review. Push the tag to the remote. Then create or update CHANGELOG.md with a v1.0.0 entry summarizing what the release contains, including the process changes from this project (protected main, CODEOWNERS, PR-only merges) alongside any real feature work merged so far. Finish by running `git log --oneline --graph --all` and confirming the tag sits on main at the expected commit.",
          },
        ],
        deliverable:
          "A real (or realistically simulated) Tide Board GitHub repository where main is protected against direct pushes and force-pushes, merging happens only through reviewed pull requests, a CODEOWNERS file correctly auto-requests Asha or Ravi depending on which path a PR touches, at least one feature branch has gone through that full flow end to end, and an annotated v1.0.0 tag sits on main with a CHANGELOG entry describing the release. DECISION.md proves the model was chosen deliberately, not by default.",
      },
    },
  ],
  quiz: [
    {
      id: 'm7-q1',
      q: "Tide Board now has three contributors and ships small changes to a live site several times a week. There is no need to support multiple old released versions at once. Which branching model fits best, and why?",
      options: [
        "Full Git Flow, because having develop, feature, release, and hotfix branches gives the most structure regardless of team size or release cadence",
        "GitHub Flow, because a single always-deployable main with short-lived feature branches and PR review matches frequent small releases without the overhead of a permanent develop branch",
        "No branches at all — every contributor commits straight to main with no pull requests, since that is the fastest way to ship",
        "A single long-lived branch per contributor, merged into main once a quarter",
      ],
      answer: 1,
    },
    {
      id: 'm7-q2',
      q: "Tide Board's schedule-parsing library is at 2.3.1. Which of these changes would require bumping to 3.0.0 rather than 2.4.0 or 2.3.2?",
      options: [
        "Adding a new optional --units flag that no existing caller is required to pass",
        "Fixing a rounding bug in an existing function without changing its signature or behavior contract",
        "Renaming an exported function that other code currently imports and calls directly",
        "Updating internal code comments and the README with no code changes",
      ],
      answer: 2,
    },
    {
      id: 'm7-q3',
      q: "A CODEOWNERS file has just been added to Tide Board's repo, mapping /src/ferries/ to Asha, with no other configuration changed. What actually happens the next time a pull request modifies a file under /src/ferries/?",
      options: [
        "The pull request is automatically blocked from merging until Asha approves it",
        "Nothing changes yet — CODEOWNERS is purely documentation with no effect until branch protection is configured",
        "GitHub automatically requests Asha as a reviewer on that pull request, but merging is not blocked unless 'Require review from Code Owners' is also enabled in branch protection",
        "Asha is automatically added as a collaborator with push access to the whole repository",
      ],
      answer: 2,
    },
    {
      id: 'm7-q4',
      q: "Tide Board's team is considering pulling the web frontend, the schedule-parsing library, and a new backend API into one monorepo instead of three separate repos. What is a genuine trade-off of making that move?",
      options: [
        "A monorepo makes the overall Git history smaller because there's only one .git folder instead of three",
        "A monorepo allows one commit to atomically change the library and update every project that depends on it, at the cost of a larger, potentially slower-to-clone repo that may eventually need shallow clone, partial clone, or sparse-checkout to stay fast",
        "A monorepo guarantees that dependency versions across the three projects can never drift out of sync, with no extra tooling required",
        "A monorepo removes the need for any branch protection or pull request review, since everything lives in one place",
      ],
      answer: 1,
    },
    {
      id: 'm7-q5',
      q: "A bug is found and fixed on Tide Board's main branch. The same bug also affects release/1.x, an older line still used by some passengers' saved bookmarks, which has since diverged from main. What is the correct way to get just that one fix onto release/1.x?",
      options: [
        "Merge all of main into release/1.x, bringing over every commit from both lines",
        "Rebase release/1.x onto main so the two histories become identical",
        "Identify the fix commit's SHA on main, then run git cherry-pick (with -x) on release/1.x to replay just that commit there",
        "Delete release/1.x and recreate it fresh from the current tip of main",
      ],
      answer: 2,
    },
  ],
}
