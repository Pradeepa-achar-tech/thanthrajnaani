// Module 5 — GitHub Workflows & Pull Requests
// Tide Board moves from a local-only repo to a real, governed GitHub project:
// shared-repo vs fork-and-pull collaboration, writing and reviewing pull
// requests (teammate Ravi joins as reviewer from this module on), keeping a
// branch current with merge vs rebase, branch protection, a first GitHub
// Actions CI workflow, the gh CLI, and issue/label/milestone hygiene.

export const m5 = {
  id: 'm5',
  title: 'GitHub Workflows & Pull Requests',
  hours: 7,
  color: 'from-rose-500/20 to-rose-700/10',
  accent: 'rose',
  description:
    'Take Tide Board from a repo that only exists on your machine to a properly governed GitHub project. Learn the two ways real teams collaborate — pushing branches straight to one **shared repo** versus **forking** and opening a pull request from your own copy — how to write a pull request that gets reviewed fast, and the etiquette of GitHub code review as teammate **Ravi** starts reviewing your work. Then lock `main` down with **branch protection rules**, wire up a first **GitHub Actions** workflow that checks every pull request automatically, and pick up the **GitHub CLI** so the whole PR and issue lifecycle can happen without leaving the terminal.',
  sections: [
    {
      id: 'm5-s1',
      title: 'Forks, PRs & Review',
      topics: [
        {
          id: 'm5-t1',
          title: 'Shared-repo vs fork-and-pull: the two ways teams collaborate on GitHub',
          explain:
            'In the shared-repo model everyone with write access branches and pushes directly on one repository; in the fork-and-pull model a contributor works in their own copy of the repo and proposes changes back via a pull request, without ever needing write access to the original.',
          analogy:
            'Picture two ways someone can help crew a boat. In the shared model, everyone is on the official crew list, has a key to the same boat, and just steps aboard to work. In the fork model, someone rows out in their own dinghy, does the work there, and then asks the harbourmaster to lift a finished piece of it onto the main boat after inspecting it — they never needed a key to the boat at all.',
          theory:
            'These are the two established ways a team uses one canonical Git repository hosted on GitHub, and the difference is entirely about who has push access.\n\nIn the **shared repository model**, every contributor is added as a collaborator (or org member with write access) on one repo. Everyone clones that same repo as `origin`, creates a branch directly on it (`git checkout -b feature/x`), pushes it straight to `origin` (`git push -u origin feature/x`), and opens a pull request from that branch into `main` — all within the same repository. This is the model Tide Board has used with Asha since Module 1: low ceremony, fast iteration, and it works well because everyone involved is trusted with direct write access.\n\nIn the **fork-and-pull model**, a contributor does not have (or should not have) write access to the source repo. They click **Fork** on GitHub, which creates a full copy of the repository under their own account — this fork is a completely separate repo that happens to remember where it came from. They clone their own fork (which becomes their `origin`), and conventionally add the original repository as a second remote named `upstream`, used only to pull in the latest changes. They branch, commit, and push to their fork (`origin`), never to `upstream`. The pull request they open is then from `their-fork:branch` into `upstream:main` — the repository owner reviews and merges it, and the contributor never held write access to the original repo at all.\n\nWhy both exist: the shared model is simpler and faster for a small trusted team working on its own project. The fork model is how virtually all open-source contribution happens — anyone can propose a change without the maintainer having to hand out write access to strangers — and some companies also use it internally on sensitive repos, purely to keep an audit trail of exactly who has push rights to the canonical copy.',
          whyItMatters:
            'Up to now, Tide Board has only used the shared model with Asha. The moment an outside contributor wants to help — or Tide Board is put on GitHub publicly — you need the fork model fluently, because it is also the default way you will contribute to any open-source project, library, or another team\'s repo for the rest of your career.',
          steps: [
            'Check whether you are listed as a collaborator on the target repository.',
            'If yes: clone the repo directly, branch, and push to `origin` as usual (shared-repo model).',
            'If no: click **Fork** on GitHub to create your own copy under your account.',
            'Clone your fork, then add the original as a second remote: `git remote add upstream <original-repo-url>`.',
            'Branch off an up-to-date `main` (fetched from `upstream`), commit your work, and push it to your fork (`origin`), never to `upstream`.',
            'Open the pull request from your fork\'s branch into `upstream`\'s `main`.',
          ],
          code: `# Shared-repo model — you already have write access
$ git clone git@github.com:kundapura-tide/tide-board.git
$ cd tide-board
$ git checkout -b feature/tide-alert-banner
$ git push -u origin feature/tide-alert-banner
$ git remote -v
origin  git@github.com:kundapura-tide/tide-board.git (fetch)
origin  git@github.com:kundapura-tide/tide-board.git (push)

# Fork-and-pull model — you do NOT have write access to the original
# (after clicking "Fork" on github.com/kundapura-tide/tide-board)
$ git clone git@github.com:meera-codes/tide-board.git
$ cd tide-board
$ git remote add upstream git@github.com:kundapura-tide/tide-board.git
$ git remote -v
origin    git@github.com:meera-codes/tide-board.git (fetch)
origin    git@github.com:meera-codes/tide-board.git (push)
upstream  git@github.com:kundapura-tide/tide-board.git (fetch)
upstream  git@github.com:kundapura-tide/tide-board.git (push)

$ git fetch upstream
$ git checkout -b fix/typo-in-readme upstream/main
$ git push -u origin fix/typo-in-readme
# PR opened as: meera-codes:fix/typo-in-readme -> kundapura-tide:main`,
          pitfalls: [
            '**Trying to push directly to `upstream` out of habit.** You never had write access there, so `git push upstream feature-branch` fails with a permission error. Fix: always push to `origin` (your fork) in this model.',
            '**Forgetting to add the `upstream` remote at all.** Your `git pull` only ever sees your fork, which drifts out of date with the real project. Fix: `git remote add upstream <url>` right after cloning your fork.',
            '**Confusing which remote is which after copying commands from a tutorial.** Fix: run `git remote -v` and read both URLs before pushing anything.',
            '**Opening the pull request against your own fork\'s `main` instead of `upstream`\'s.** GitHub\'s compare page defaults to whichever repo you opened it from — always check the "base repository" dropdown before creating the PR.',
            '**In the shared model, pushing straight to `main` because you technically can.** Having write access is not permission to skip review. Fix: always branch, even when you could push directly.',
          ],
          tryIt:
            'Fork a small public repo you do not own (or a scratch repo of your own under a second GitHub account), clone your fork, add `upstream`, and run `git remote -v` to confirm `origin` points at your fork and `upstream` points at the original.',
          takeaway:
            'Shared-repo collaboration means everyone pushes branches to one repo; fork-and-pull means you work in your own copy and propose changes back — pick the model based on whether you actually have write access to the original.',
        },
        {
          id: 'm5-t2',
          title: 'Writing a pull request that gets reviewed fast: titles, descriptions, and linked issues',
          explain:
            'A pull request that gets reviewed quickly has a specific, imperative title, a description that explains why the change was made (not just what changed, which the diff already shows), a linked issue where one exists, and a diff small enough for a reviewer to hold in their head.',
          analogy:
            'A repair slip at the ferry workshop that just says "fix stuff" tells the mechanic nothing — they have to inspect the whole boat to guess what you mean. A slip that says "engine cover latch snapped on the 6 AM crossing, replace the hinge, see maintenance log entry 12" lets them start the actual repair in the first minute. A pull request description is that repair slip for your reviewer.',
          theory:
            'A pull request title should be an **imperative, specific summary** of the single change it makes — "Add fare validation to the ferry booking form", not "fix" or "updates" or "changes". If the team follows a convention like Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:` prefixes), match it; the exact scheme matters less than being consistent across the repo.\n\nThe description should answer three things the diff cannot say on its own: **what** changed (briefly — the diff shows the details), **why** it changed (the actual reasoning, or the bug/need behind it), and **how it was tested**. A description that only restates the diff in prose wastes the reviewer\'s time; a description that explains the motivation is what actually helps them judge whether the change is correct and complete.\n\n**Linking issues** ties the PR to the tracked problem it solves. Writing "Fixes #34" (covered fully with all its keyword variants in m5-t8) in the description auto-links the issue, shows the connection on both timelines, and auto-closes the issue when the PR merges into the default branch.\n\n**Small, focused PRs** review far faster than large ones, for concrete reasons: a reviewer can hold a 50-line, single-purpose diff in their head, but skims (or rubber-stamps) a 2,000-line PR bundling six unrelated changes. Small PRs also get faster CI feedback, cause far fewer merge conflicts because the branch is short-lived, and are trivially revertable if something turns out wrong — a giant PR mixing a real bug fix with an unrelated refactor cannot be reverted cleanly without also reverting the refactor.\n\nA PR can also be opened as a **draft** while work is still in progress — CI still runs, but reviewers know not to review it yet; converting it to "Ready for review" is the explicit signal that it is time to look.',
          whyItMatters:
            'Ravi reviews a steady stream of Tide Board pull requests from this module onward. A well-titled, well-scoped PR with a linked issue takes him two minutes to review properly; a vague "updates" PR bundling five unrelated changes takes twenty minutes and often gets sent back to be split — costing everyone more time than writing it properly would have in the first place.',
          steps: [
            'Before opening the PR, run `git log main..feature-branch` and check every commit belongs to one logical change; split the branch if not.',
            'Write the title as a specific, imperative summary of that one change.',
            'In the description, cover what changed, why it changed, and how it was tested.',
            'Add a "Fixes #N" line if an open issue tracks this work.',
            'If the change is not fully ready, open it as a Draft PR rather than a normal one.',
            'Re-read your own diff on GitHub\'s "Files changed" tab before requesting review — catch the obvious mistakes yourself first.',
          ],
          code: `$ git push -u origin feature/fare-validation
...
To github.com:kundapura-tide/tide-board.git
 * [new branch]      feature/fare-validation -> feature/fare-validation

# Opened at github.com/kundapura-tide/tide-board/compare/main...feature/fare-validation
# Title and description used:

Title: Add fare validation to the ferry booking form

## What
Reject bookings where the number of passengers exceeds the boat's seating
capacity, both in the form and in the booking API.

## Why
Fixes #34 — three overbooked bookings were recorded last week because the
form silently accepted any number typed in.

## How tested
- Added a unit test for the capacity check (booking.test.js)
- Manually tried booking 12 seats on the 8-seat Gangolli ferry; correctly rejected

Fixes #34`,
          pitfalls: [
            '**A one-word title like "fix" or "updates".** The reviewer has to open the diff cold just to guess your intent. Fix: write a specific, imperative summary of the single change.',
            '**Bundling several unrelated changes "while I was in there".** Fix: split unrelated work into separate branches and PRs, even if it feels slower up front.',
            '**Describing only what changed, which the diff already shows, and skipping why.** Fix: the description\'s job is to justify the change, not repeat it.',
            '**Leaving an open issue unreferenced when one exists.** Fix: always include a closing keyword (m5-t8) when this PR resolves a tracked issue.',
            '**Marking an unfinished PR "ready for review" instead of using Draft status.** Fix: keep it as a draft until it genuinely is ready to be looked at.',
            '**Force-pushing a completely different, unrelated change onto an open PR just to reuse its number.** Fix: open a new PR for a new logical change instead.',
          ],
          tryIt:
            'Open a PR (even a scratch one against your own fork) for a small two-line change, and write a real title and description following the what/why/how-tested structure, including a "Fixes #N" line against a placeholder issue number — notice how much more useful it reads compared to a one-word title.',
          takeaway:
            'A pull request\'s job is to save the reviewer time — a specific title, a why-focused description, a linked issue, and a small diff are what make that possible.',
        },
        {
          id: 'm5-t3',
          title: 'Reviewing pull requests on GitHub: approvals, requested changes, and resolving conversations',
          explain:
            'GitHub lets a reviewer comment on specific lines of a diff and then submit an overall review as one of three verdicts — Comment, Approve, or Request changes — and each verdict has a different, concrete effect on whether the pull request can be merged.',
          analogy:
            'A prasadam counter volunteer checks each tray before it goes out to devotees. Some trays pass straight through with a nod (approve). Some get a quick note but are not held up ("looks fine, but next time use the smaller ladle" — a comment). Some get sent back to be redone before they can go anywhere near the counter (request changes). A GitHub review is that same tray inspection, just for code.',
          theory:
            'A reviewer opens the PR\'s **Files changed** tab and can leave an inline comment on any specific line by hovering over it and clicking the `+` that appears — this creates a comment thread attached to that exact line of the diff, not a loose remark on the PR\'s main timeline. Several such comments can be added before submitting anything; they stay as a pending review until you choose an overall verdict:\n\n- **Comment**: submits feedback with no formal verdict. It does not block merging by itself.\n- **Approve**: signals "I have reviewed this and it is good to merge". This is what counts toward a required-approvals branch protection rule (m5-t5).\n- **Request changes**: signals a blocking concern. If branch protection requires reviews, a PR with an outstanding "Request changes" review generally cannot be merged — the Merge button stays disabled — until that same reviewer either approves after the fix, or dismisses their own review.\n\n**Threaded comments** keep each discussion attached to the exact code it is about instead of scattering everything across one long timeline, which matters a lot on a diff with several separate issues to raise. Once the author addresses a comment — usually with a new commit, sometimes just an explanation of why the code is fine as-is — either person can click **Resolve conversation** to collapse the thread. Some repos configure branch protection to require every conversation resolved before merge is allowed at all (m5-t5).\n\nGood review etiquette: be specific about what is wrong and, where possible, suggest the fix directly (GitHub\'s "suggestion" blocks let the author apply a one-click fix); use a light "nit:" prefix for optional style preferences so the author knows it is not blocking; ask a genuine question when intent is unclear rather than asserting a mistake that might not be one; and reserve "Request changes" for actual problems, not personal style preference.',
          whyItMatters:
            'Ravi reviews Tide Board PRs from this module onward, and understanding these three verdicts means you are never confused about why your Merge button is greyed out after his review — and know exactly what unblocks it: address the concern, then get an Approve.',
          steps: [
            'Open the PR\'s "Files changed" tab.',
            'Leave at least one specific inline comment on a real line of the diff.',
            'Submit the review as Comment, Approve, or Request changes, matching how blocking the concern actually is.',
            'As the author, address any requested changes with a follow-up commit and reply on the thread.',
            'Resolve each conversation once it is genuinely addressed.',
            'Re-request the review; wait for the reviewer to submit an Approve before merging.',
          ],
          code: `# Ravi leaves an inline comment on booking.js, line 42:
Ravi: "nit: this magic number 8 should reference BOAT_CAPACITY instead of
       being hard-coded again -- see line 10 where it's already defined."

# Ravi submits his review as: Request changes

# You push a follow-up commit:
$ git add booking.js
$ git commit -m "Reuse BOAT_CAPACITY constant instead of a magic number"
$ git push

# You reply on the thread:
You: "Good catch, fixed in a1b2c3d."
# -> click "Resolve conversation" on that thread

# You click "Re-request review" next to Ravi's name.

# Ravi submits a second review: Approve
Ravi: "Looks good, thanks for the quick fix."
# -> Merge button is now enabled (assuming CI is also green)`,
          pitfalls: [
            '**Reading "Request changes" as personal criticism instead of a blocking technical signal.** Fix: treat it as "not mergeable yet, here is why" and respond to the substance.',
            '**Leaving vague comments like "this looks wrong" with no specifics.** Fix: say exactly what is wrong and, where you can, suggest the fix.',
            '**Force-pushing over history mid-review, so old inline comments point at a diff GitHub now marks "outdated".** Fix: prefer new commits while a review is in progress; save rebase/squash for right before merge.',
            '**Never resolving conversations, so fifteen stale threads bury the one that still matters.** Fix: resolve threads as you go, not in one batch at the end.',
            '**Approving without actually reading the diff ("LGTM" as a rubber stamp).** Fix: only approve what you genuinely reviewed — that is the entire point of the step.',
            '**Requesting changes over a pure style preference the team has no written convention about.** Fix: use a non-blocking Comment or a "nit:"-prefixed remark for preferences; reserve Request changes for real problems.',
          ],
          tryIt:
            'On an existing PR (yours or a scratch one), leave an inline comment on a specific line, submit a Request changes review, then push a fix commit and resolve the conversation — watch the PR\'s Merge button state change at each step if branch protection requires review.',
          takeaway:
            'Approve, Request changes, and Comment are distinct signals with different effects on mergeability — choose deliberately, and resolve every thread you open.',
        },
        {
          id: 'm5-t4',
          title: 'Keeping a PR branch current: merging main in vs rebasing onto main, and pushing safely',
          explain:
            'When `main` moves ahead while your PR branch is still open, you can bring your branch up to date either by merging `main` into it (adds a merge commit, keeps existing commit SHAs unchanged) or by rebasing it onto `main` (replays your commits on top of the new tip, giving every one of them a new SHA) — and rebasing requires a force-push to publish.',
          analogy:
            'Imagine your plan for tomorrow was written against today\'s tide chart, and overnight the harbour office issues a corrected one. You can staple the new chart to the back of your plan — nothing on the plan changes, there is just an extra page now (a merge). Or you can rewrite the whole plan starting from the new chart — every page shifts onto the new baseline, and even a page whose words did not change is technically a fresh page now (a rebase).',
          theory:
            'This situation happens constantly on Tide Board once Asha and you are both merging into `main`: your feature branch was created off an older `main`, and by the time you are ready to merge, `main` has moved on. You need your branch to reflect that, both so tests are meaningful against what will actually ship, and because branch protection (m5-t5) can literally require "branches to be up to date before merging".\n\n**Option A — merge `main` into your branch.** `git fetch origin` then `git merge origin/main` while on your feature branch. If nothing conflicts, Git creates a merge commit automatically; if the same lines were touched on both sides, Git stops and asks you to resolve the conflict, then `git commit` finishes the merge. The key property: every commit SHA your branch already had stays exactly the same — nothing already pushed is rewritten. History gains a small "bump" merge commit and becomes non-linear, but this is always safe, including on a branch other people are also working on.\n\n**Option B — rebase your branch onto `main`.** `git fetch origin` then `git rebase origin/main`. Git temporarily sets your commits aside, moves your branch pointer to the tip of `origin/main`, and replays your commits one at a time on top of it, pausing for you to resolve conflicts commit-by-commit with `git rebase --continue` if any arise (or `git rebase --abort` to bail out cleanly). Because each replayed commit now has a different parent, Git must create a brand-new commit object for each one — even with identical content, its SHA changes. The payoff is a clean, linear history with no merge commit; the cost is that every commit identity on the branch has changed.\n\nBecause rebase rewrites commits that were already pushed, a plain `git push` is rejected as a non-fast-forward update — from the remote\'s point of view, your branch and its branch have diverged. You must force-push to make the remote branch match your rewritten history.\n\n`git push --force` overwrites whatever is currently on the remote branch, unconditionally, no matter what. If a teammate pushed additional commits to that same branch after you last fetched, a plain force push silently discards them from the branch ref, with no warning — recoverable, if at all, only from that teammate\'s own reflog, and only briefly.\n\n`git push --force-with-lease` also overwrites the remote branch, but first checks that the remote branch\'s current tip still matches what your local repository last saw as its position (your remote-tracking ref, e.g. `origin/feature`, as of your last fetch). If someone else has pushed since then, the remote has moved past what you expected, and Git refuses the push with a rejection instead of silently overwriting it — you then fetch, look at what changed, and decide how to proceed. It protects specifically against clobbering commits you have not seen yet on that remote branch; it does not make rebasing itself safe in general, it only guards the "did the remote change since I last looked" case.\n\nGuidance: merging `main` in is simpler and always safe, and fine for a branch others might also be pushing to. Rebasing gives a cleaner, linear log — useful right before a final merge — but should generally be limited to branches only you push to, specifically because of the force-push it requires. Never rebase, and never force-push, `main` itself.',
          whyItMatters:
            'Tide Board with both Asha and Ravi pushing to `main` means your PR branch routinely falls behind; how you bring it up to date, and how you push the result without clobbering a teammate\'s work, is a daily, high-stakes skill — this is exactly the rebase footgun that damages someone else\'s commits when done carelessly.',
          steps: [
            'Run `git fetch origin` to see the current state of `main`.',
            'Decide: merge `main` in (simplest, always safe) or rebase onto `main` (cleaner history, needs care).',
            'If merging: `git merge origin/main`, resolve any conflicts, then commit.',
            'If rebasing: `git rebase origin/main`, resolving conflicts commit-by-commit with `git rebase --continue`.',
            'If you rebased, push with `git push --force-with-lease` — never a plain `--force` on a branch anyone else might also use.',
            'If the force-with-lease push is rejected, fetch again and inspect what changed before retrying.',
          ],
          code: `$ git fetch origin
From github.com:kundapura-tide/tide-board
   a1b2c3d..e4f5g6h  main -> origin/main

# Option A: merge main into the branch (safe, adds a merge commit)
$ git checkout feature/fare-validation
$ git merge origin/main
Merge made by the 'ort' strategy.
 src/booking.js | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)
$ git push
   b7c8d9e..f0a1b2c  feature/fare-validation -> feature/fare-validation

# Option B: rebase the branch onto main instead (linear history, rewrites SHAs)
$ git checkout feature/fare-validation
$ git rebase origin/main
Successfully rebased and updated refs/heads/feature/fare-validation.

$ git push
 ! [rejected]        feature/fare-validation -> feature/fare-validation (non-fast-forward)
error: failed to push some refs to 'github.com:kundapura-tide/tide-board.git'
hint: Updates were rejected because the tip of your current branch is behind

$ git push --force-with-lease
 + b7c8d9e...a9f8e7d feature/fare-validation -> feature/fare-validation (forced update)

# If Asha had pushed a fix to this same branch in the meantime:
$ git push --force-with-lease
 ! [rejected]        feature/fare-validation -> feature/fare-validation (stale info)
error: failed to push some refs to 'github.com:kundapura-tide/tide-board.git'
hint: Updates were rejected because a pushed branch tip is behind its remote
# -> fetch first and look at what Asha added before overwriting anything`,
          pitfalls: [
            '**Reaching for `git push --force` out of habit after any rebase.** Fix: default to `--force-with-lease`; only use plain `--force` when you are certain no one else could have pushed.',
            '**Rebasing a branch a teammate has already pulled and is also committing to.** History rewritten under them makes their next pull confusing or produces duplicate-looking commits. Fix: only rebase branches you alone push to, or coordinate first.',
            '**Resolving one rebase conflict and assuming the rest replay automatically.** Each commit is replayed — and can conflict — independently. Fix: run `git rebase --continue` after each fix and check status.',
            '**Confusing "merge `origin/main` into my branch" with "merge my branch into `main`".** The first keeps your branch current; the second is what the PR merge itself does. Fix: always be clear which direction you mean.',
            '**Attempting to force-push `main` itself.** Fix: branch protection (m5-t5) should block this outright, but never attempt it regardless of whether protection is on.',
            '**Bailing out of a messy rebase by editing files by hand instead of using Git\'s own escape hatch.** Fix: `git rebase --abort` cleanly returns you to the exact pre-rebase state.',
          ],
          tryIt:
            'On a scratch repo, create a feature branch, then add a new commit on `main` so the branch falls behind. Rebase the feature branch onto `main`, note the changed commit SHA with `git log`, then push with `git push --force-with-lease`. Separately, push a commit to the same remote branch from a second local clone before force-pushing from the first, to see the "stale info" rejection happen for real.',
          takeaway:
            'Merging `main` in is always safe; rebasing onto `main` gives a cleaner history but needs a force-push — use `--force-with-lease`, never plain `--force`, so a clash with someone else\'s work fails loudly instead of vanishing silently.',
        },
      ],
    },
    {
      id: 'm5-s2',
      title: 'Protecting & Automating',
      topics: [
        {
          id: 'm5-t5',
          title: 'Branch protection rules: required reviews, required checks, and blocking force-pushes',
          explain:
            'Branch protection rules are repository settings that enforce how a specific branch — typically `main` — can be changed: requiring reviews and passing checks before a merge is allowed, and blocking direct or forced pushes altogether.',
          analogy:
            'The gate into a temple\'s inner sanctum is not opened just because someone walks up to it — a designated helper confirms the offering has been prepared properly before it is allowed through. Branch protection is that checkpoint for `main`: nothing gets in without clearing the checks, no matter who is asking.',
          theory:
            'Branch protection rules live under the repository\'s **Settings > Branches**, where you add a rule targeting a branch name pattern (typically `main`). The options worth knowing well:\n\n**Require a pull request before merging** — disables direct pushes to the branch entirely; every change must go through a PR.\n\n**Require approvals (N)** — a PR cannot be merged until at least N reviewers have submitted an Approve review; an outstanding "Request changes" review (m5-t3) blocks merge regardless of the approval count.\n\n**Dismiss stale approvals when new commits are pushed** — an approval given before your latest push no longer counts, forcing re-review after further changes.\n\n**Require status checks to pass before merging** — one or more named checks (e.g. the `lint-and-test` job from m5-t6) must report success on the PR\'s latest commit; the Merge button stays disabled while a required check is pending or failing.\n\n**Require branches to be up to date before merging** — the PR branch must already include the base branch\'s latest commit (i.e. you must have merged or rebased `main` in, per m5-t4) before merge is allowed, so the checks that ran actually reflect what will land in `main`.\n\n**Require conversation resolution before merging** — every review thread must be marked Resolved (ties directly to m5-t3).\n\n**Block force pushes** — prevents anyone from force-pushing (rewriting history) directly on the protected branch itself.\n\n**Include administrators** — whether the rule also applies to repo admins/owners. Leaving this off means an admin can bypass every other setting, which quietly defeats most of the point on a real team repo.\n\nWhile any required condition is unmet, GitHub visibly disables the green "Merge pull request" button and states exactly which requirement is still outstanding — "1 approving review required", "Some checks were not successful", and so on.',
          whyItMatters:
            'This is what makes Ravi\'s review (m5-t3) and the CI check (m5-t6) actually load-bearing rather than optional courtesy — without a protection rule, anyone, including you under a deadline, could just push straight to `main` and skip review and tests entirely. Protecting `main` turns "we are supposed to review PRs" into "the platform will not let you skip it".',
          steps: [
            'Open the Tide Board repository\'s Settings > Branches.',
            'Add a protection rule targeting `main`.',
            'Enable "Require a pull request before merging" and set required approvals to 1.',
            'Enable "Require status checks to pass" and select the CI check once it exists (m5-t6).',
            'Enable "Require branches to be up to date before merging" and "Block force pushes".',
            'Save the rule, then try `git push origin main` directly to confirm it is now rejected.',
          ],
          code: `$ git push origin main
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'github.com:kundapura-tide/tide-board.git'

# Branch protection rule configured for "main":
#   [x] Require a pull request before merging
#         Required approvals: 1
#   [x] Require status checks to pass before merging
#         Required check: lint-and-test
#   [x] Require branches to be up to date before merging
#   [x] Block force pushes
#   [x] Include administrators`,
          pitfalls: [
            '**Turning on protection but leaving "Include administrators" unchecked.** The repo owner can then bypass every rule, making the protection theatre for anyone with admin rights. Fix: include administrators on a real team repo.',
            '**Requiring a status check before any workflow has ever run.** There is nothing to select in the required-check list, or it shows as permanently pending. Fix: get the CI workflow (m5-t6) running at least once first, then add it as a required check.',
            '**Setting required approvals to 1 with only yourself available, and GitHub not counting a PR author\'s own approval.** Work stalls with no way to merge. Fix: for a solo learning repo, either bring in a second reviewer or temporarily set required approvals to 0 while still practising the review flow manually.',
            '**Skipping "require branches to be up to date" and merging a PR whose CI passed against a now-stale `main`.** `main` can break from an interaction with something merged afterward. Fix: enable it, or re-run checks after a final rebase/merge into the branch.',
            '**Confusing "block force pushes" with disabling merges entirely.** The setting only blocks history-rewriting pushes; the normal PR merge button/action still works exactly as before.',
          ],
          tryIt:
            'Enable branch protection on a scratch repo requiring 1 approval and a status check, then try `git push origin main` directly and confirm it is rejected, and try merging a PR before its check finishes to confirm the Merge button stays disabled until it passes.',
          takeaway:
            'Branch protection rules turn review and CI from a convention the team hopes people follow into a rule GitHub actually enforces on `main`.',
        },
        {
          id: 'm5-t6',
          title: 'A first GitHub Actions workflow: running lint and tests automatically on every pull request',
          explain:
            'GitHub Actions runs a YAML-defined workflow automatically in response to repository events — including every pull request — so a lint or test job runs on its own without anyone remembering to run it locally first.',
          analogy:
            'Instead of trusting each fishing boat\'s captain to self-report that the catch passed inspection, the harbour posts an inspector who boards every boat the moment it docks, checks it against a fixed list, and raises a flag before anyone unloads. A GitHub Actions workflow is that automatic inspector for a pull request.',
          theory:
            'A workflow file lives at `.github/workflows/*.yml`. Its top-level keys are: `name` (the display name shown in the Actions tab), `on` (which events trigger it — e.g. `pull_request`, `push`), and `jobs` (one or more named jobs, each with `runs-on`, choosing which virtual machine image executes it, e.g. `ubuntu-latest`, and `steps`, an ordered list of actions to run).\n\n`on: pull_request` (often scoped with `branches: [main]`) means the workflow runs automatically the moment a PR is opened, and again on every new commit pushed to it — this is exactly the kind of check that branch protection (m5-t5) can be told to require.\n\nEach step is either `uses:` — a reusable, published action, such as `actions/checkout@v4` (checks the repository\'s code out onto the runner; without this, every later step runs against an empty machine) or `actions/setup-node@v4` (installs a specific Node version) — or `run:` — a raw shell command executed directly on the runner, such as `npm ci`, `npm run lint`, `npm test`. If any step exits with a non-zero status, the whole job is marked failed, and GitHub reports that as a failed check on the PR.\n\nA minimal, realistic CI job for a Node-based static site like Tide Board: checkout, set up Node, `npm ci` (a clean, lockfile-exact install — unlike `npm install`, it never silently updates the lockfile), then `npm run lint` and `npm test`. The job\'s name (`lint-and-test` here) becomes a named "check" visible at the bottom of the PR\'s Conversation tab, and once it has run at least once, it appears as a selectable option in branch protection\'s required-status-checks list.\n\nRunners are free, ephemeral GitHub-hosted virtual machines that spin up fresh for each run, execute the defined steps, and are then destroyed — nothing persists between runs unless you deliberately cache or upload artifacts, which is out of scope here. Every run\'s full console output is visible per-step in the repository\'s Actions tab, which is where you go to debug a failing check.',
          whyItMatters:
            'This is the mechanism that makes "require status checks to pass" (m5-t5) meaningful in the first place — without an actual workflow reporting a check, there is nothing for branch protection to require, and a broken change could otherwise reach `main` purely because someone forgot to run the tests locally.',
          steps: [
            'Create `.github/workflows/ci.yml` in the repository.',
            'Set `on: pull_request` (scoped to `branches: [main]`) as the trigger.',
            'Define a job on `ubuntu-latest` with steps: checkout, set up Node, `npm ci`, `npm run lint`, `npm test`.',
            'Commit and push the workflow file, then open (or update) a PR to trigger it.',
            'Watch the check run live in the PR\'s checks section, or the repository\'s Actions tab.',
            'Deliberately break a test locally, push it, and confirm the check turns red on that PR.',
          ],
          code: `# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npm run lint
      - run: npm test

# After pushing a commit to an open PR:
$ git push origin feature/fare-validation
...
# PR page shows:
# Checks
#   lint-and-test   Successful in 38s

# After deliberately breaking a test and pushing again:
# Checks
#   lint-and-test   Failing after 22s`,
          pitfalls: [
            '**Triggering only on `push`, not `pull_request`.** Contributors see no feedback at all until after merge. Fix: trigger on `pull_request` for feedback while the PR is still open.',
            '**Forgetting `actions/checkout@v4` as the first step.** Every later step then runs against an empty runner with none of the repository\'s files. Fix: always checkout first.',
            '**Using `npm install` instead of `npm ci` in CI.** `npm install` can silently update lockfile-mismatched versions, making CI non-reproducible. Fix: use `npm ci` for an exact, lockfile-driven install.',
            '**Adding the workflow file to a branch that never gets merged, and wondering why it "does not exist yet" for other PRs.** Fix: merge the workflow into `main` early so it applies to every subsequent PR.',
            '**Writing an overly broad `on:` trigger that fires on every branch and event, burning CI minutes.** Fix: scope `branches:` sensibly.',
            '**Merging on a red check because branch protection allows an admin override.** Defeats the entire purpose of having CI. Fix: treat a red check as a hard stop, and configure protection so it actually is one.',
          ],
          tryIt:
            'Add the `ci.yml` above to a scratch repo, open a PR, and watch the check run in the Checks tab; then deliberately push a commit that fails `npm test` (or `npm run lint`) and confirm the same PR now shows a red failing check instead of a green one.',
          takeaway:
            'A `pull_request`-triggered GitHub Actions workflow turns "please run the tests before merging" into an automatic, unskippable status check.',
        },
        {
          id: 'm5-t7',
          title: 'The GitHub CLI (gh): managing pull requests and issues without leaving the terminal',
          explain:
            '`gh` is GitHub\'s official command-line tool, wrapping most of GitHub\'s web features — creating and reviewing pull requests, browsing and filing issues, checking CI status — as ordinary terminal commands.',
          analogy:
            'It is the difference between queuing at the ferry ticket counter for every booking, schedule check, or complaint, versus handling all three over one phone call. `gh` is that phone line into GitHub — the same operations, without walking over to a browser tab each time.',
          theory:
            '`gh auth login` runs a one-time authentication (via browser or token) per machine; after that, every `gh` command acts as you against GitHub\'s API directly. `gh` auto-detects the current repository when run inside a git working directory, so most commands do not need the repo specified explicitly.\n\n**Pull requests**: `gh pr create` (interactively, or with `--title`, `--body`, `--base` flags) opens a PR straight from your current branch, with no need to visit the compare page in a browser. `gh pr list` shows open PRs in the terminal. `gh pr view [number]` prints details; `--web` opens the same PR in a browser instead. `gh pr checkout <number>` fetches and checks out someone else\'s PR branch locally, so you can run and test their code directly.\n\n**Reviewing from the terminal**: `gh pr diff <number>` prints the diff. `gh pr review <number> --approve`, `--request-changes --body "..."`, or `--comment --body "..."` submits a review without opening a browser at all.\n\n**Checking CI**: `gh pr checks <number>` prints the status of every required check straight in the terminal, pairing directly with the Actions workflow from m5-t6.\n\n**Merging**: `gh pr merge <number>` with `--merge`, `--squash`, or `--rebase` chooses the merge strategy, and `--delete-branch` cleans up the branch afterward.\n\n**Issues**: `gh issue create --title ... --body ...`, `gh issue list`, `gh issue view <number>`, and `gh issue close <number>` cover the equivalent lifecycle for issues.',
          whyItMatters:
            'For someone used to typing Git commands all day, constantly alt-tabbing to a browser to open a PR, check a review, or file an issue breaks flow. `gh` keeps the whole PR lifecycle — create, check CI, review, merge — inside the terminal, which is exactly what the Module 5 project leans on end to end.',
          steps: [
            'Install `gh` and run `gh auth login` once per machine.',
            'From inside the Tide Board repo, push a branch and run `gh pr create` to open a PR without leaving the terminal.',
            'Run `gh pr checks` to watch the CI status from m5-t6 update live.',
            'Run `gh pr view --web` on the rare occasion you do want the full browser view, e.g. a long diff.',
            'Practise `gh pr review <number> --approve` (or `--comment`) on a scratch PR.',
            'Merge a passing PR with `gh pr merge --squash --delete-branch`.',
          ],
          code: `$ gh auth login
? What account do you want to log into? GitHub.com
? How would you like to authenticate? Login with a web browser
...
Logged in as thanthrajnaani

$ git push -u origin feature/fare-validation
...
$ gh pr create --title "Add fare validation to the ferry booking form" \\
  --body "Fixes #34 -- reject bookings over boat capacity." --base main
? Creating pull request for feature/fare-validation into main in kundapura-tide/tide-board
https://github.com/kundapura-tide/tide-board/pull/57

$ gh pr checks 57
lint-and-test   pass   38s   https://github.com/kundapura-tide/tide-board/actions/runs/1234

$ gh pr view 57
Add fare validation to the ferry booking form #57
Open . thanthrajnaani wants to merge 1 commit into main from feature/fare-validation
  Fixes #34 -- reject bookings over boat capacity.

$ gh pr review 57 --approve --body "Looks good, thanks!"
Approved pull request kundapura-tide/tide-board#57

$ gh pr merge 57 --squash --delete-branch
Squashed and merged pull request kundapura-tide/tide-board#57
Deleted branch feature/fare-validation and switched to branch main`,
          pitfalls: [
            '**Running `gh` commands outside a git repo, or in the wrong one, and getting confused about the target.** Fix: run inside the correct local clone, or pass `--repo owner/name` explicitly.',
            '**Forgetting `gh auth login` on a new machine and hitting authentication errors on the first command.** Fix: authenticate once per machine before anything else.',
            '**Using the wrong `gh pr merge` strategy flag for the repo\'s convention (e.g. `--merge` on a repo that always squashes).** Fix: check the repo\'s usual merge strategy before merging.',
            '**Approving your own PR with `gh pr review --approve` expecting it to satisfy a required-review branch protection rule.** GitHub does not count a PR author\'s own approval toward required reviews. Fix: get an actual second reviewer, or temporarily lower approvals to 0 while solo-practising.',
            '**Treating `gh pr checkout <number>` as read-only.** It actually creates or switches a local branch tracking someone else\'s PR, so uncommitted local changes should be stashed first. Fix: commit or stash before checking out another PR.',
          ],
          tryIt:
            'On a repo you have access to (even a scratch one), run `gh pr create` from a feature branch, then `gh pr checks` to watch CI run, then `gh pr view --web` to compare the terminal output against the same PR in a browser.',
          takeaway:
            '`gh` covers the whole PR and issue lifecycle — create, check CI, review, merge — as terminal commands, so day-to-day GitHub work rarely needs a browser tab at all.',
        },
        {
          id: 'm5-t8',
          title: 'Issues, labels, milestones, and closing an issue automatically from a pull request',
          explain:
            'GitHub Issues track discrete pieces of work or bugs; labels categorise them, milestones group them toward a shared target, and a specific set of "closing keywords" in a commit message or PR description automatically closes the linked issue the moment the PR merges into the default branch.',
          analogy:
            'A temple committee keeps a register of jobs — repaint the gopura, fix the prasadam counter\'s tap — tags each with a category, and groups some under "before Ganesha Chaturthi", a target with a date. When a job is finished, someone has to remember to go back and tick the register. Closing keywords are how GitHub ticks it for you the moment the fix actually lands.',
          theory:
            'An **issue** is a title, description, and comment thread tracking one unit of work — a bug report, a feature request, a task. Issues share the same number sequence as pull requests within a repository, so numbers can interleave (issue #12 followed by PR #13 is completely normal).\n\n**Labels** are short tag chips — `bug`, `enhancement`, `good first issue`, or a project-specific one like `tide-data` — attached to issues or PRs for filtering and triage. They are defined once in the repository\'s Labels settings with a name and colour; an issue can carry several at once.\n\n**Milestones** are a named target, often tied to a date (e.g. "v1.1 — Ferry Booking"), that group a set of issues and PRs together. GitHub shows a progress bar of closed vs. open items for a milestone, which is the fastest way to see how close a release or goal actually is.\n\n**Closing keywords**: writing one of a specific set of words — `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves`, `resolved` — immediately followed by an issue reference (`#123` in the same repo, or a full issue URL across repos) in a commit message or, more commonly, a pull request\'s description, creates a special link. The moment that PR is merged into the repository\'s **default branch**, GitHub automatically closes every issue referenced this way. A plain reference with no keyword, like just "#123" or "See #123", creates a visible cross-reference on both timelines but does **not** auto-close anything. A single PR can close several issues by listing multiple closing references, e.g. "Fixes #12, Fixes #15".\n\nTwo caveats worth remembering: auto-close only fires on merge to the actual default branch (typically `main`) — merging into any other branch does not trigger it; and the keyword must be present in the description (or a merged commit message) **at merge time** — adding it afterward does not retroactively close anything.',
          whyItMatters:
            'Without this, someone has to remember to manually close every issue after every merge, and some inevitably get forgotten, leaving a backlog of already-fixed issues cluttering the tracker. Closing keywords make the issue tracker self-maintaining and give Ravi an accurate, live picture of what is actually still left to do on Tide Board.',
          steps: [
            'Open an issue describing a concrete bug or task on Tide Board.',
            'Add a label (e.g. `bug`) and assign it to a milestone (e.g. "v1.1").',
            'Create a branch and PR that fixes it, including "Fixes #<issue-number>" in the PR description.',
            'Confirm on the issue\'s page that GitHub now shows the linked (not-yet-merged) PR as a reference.',
            'Get the PR reviewed, get its checks green, and merge it into `main`.',
            'Confirm the issue auto-closed, with the merging PR listed as the reason on its timeline.',
          ],
          code: `$ gh issue create --title "Booking form accepts more passengers than boat capacity" \\
  --body "Reported by Asha: booking 12 passengers on an 8-seat ferry was accepted." \\
  --label bug --milestone "v1.1 - Ferry Booking"
https://github.com/kundapura-tide/tide-board/issues/34

# PR description for the fix (feature/fare-validation, PR #57):
## What
Reject bookings where passenger count exceeds boat capacity.

Fixes #34

# After PR #57 is merged into main:
$ gh issue view 34
Booking form accepts more passengers than boat capacity #34 (closed)
Closed via #57 (Add fare validation to the ferry booking form)
Labels: bug
Milestone: v1.1 - Ferry Booking`,
          pitfalls: [
            '**Writing "See #34" or "Related to #34" expecting it to auto-close the issue.** Only the specific closing keywords (fixes/closes/resolves and their variants) trigger auto-close; plain references do not. Fix: use an exact closing keyword when the intent is to close it.',
            '**Merging the fix into a feature or integration branch instead of the repository\'s actual default branch.** Auto-close only fires on a merge to the default branch. Fix: check which branch is configured as default before relying on this.',
            '**Putting the closing keyword only in an individual commit message on a squash-merged PR, where the final squash message can drop it.** Fix: also include the keyword in the PR description itself.',
            '**Creating a milestone with no real target or scope, so it never signals anything useful.** Fix: give milestones a genuine date and a defined set of issues, and review them periodically.',
            '**Over-labelling every issue with five or more tags until labels stop meaning anything.** Fix: keep a small, deliberate label set with clear definitions.',
            '**Assuming a closed issue is deleted or loses its history.** It remains fully visible and searchable, just filtered out of the default open view. Fix: use the `is:closed` filter to find it again later.',
          ],
          tryIt:
            'Open a scratch issue on a repo you control, then open a PR referencing it with "Fixes #<number>" in the description, merge the PR into the default branch, and confirm the issue closed automatically with the PR listed as the closing reference on its timeline.',
          takeaway:
            'Closing keywords ("Fixes #N", "Closes #N", "Resolves #N") in a PR description auto-close the linked issue the moment the PR merges into the default branch — the tracker updates itself instead of relying on someone remembering to.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm5-p1',
      type: 'Project',
      title: 'Open Your First Real PR',
      domain: 'GitHub Collaboration',
      duration: '2-3 hrs',
      description:
        'Push Tide Board to a real GitHub repository, lock `main` down with branch protection, and take one small feature all the way through the real PR lifecycle: a scoped branch, a linked issue, a passing CI check, a simulated review from teammate Ravi, and a merge into a protected `main`. Every topic in this module gets used together, on your own repo, for real.',
      tools: ['Git', 'GitHub', 'GitHub Actions', 'GitHub CLI (gh)'],
      blueprint: {
        overview:
          'This project takes Tide Board from a repo living only on your machine to a properly governed GitHub project: a protected `main` branch, an automatic CI check on every pull request, and one real pull request that goes through the full opening -> review -> green-CI -> merge lifecycle, including a deliberately simulated review from Ravi so you practise both sides of the review etiquette from m5-t3.',
        functionalRequirements: [
          'Tide Board lives in a GitHub repository with `main` as the default branch, pushed from your local history.',
          'A branch protection rule on `main` requires a pull request, at least one approval, a passing status check, and blocks force pushes.',
          'A `.github/workflows/ci.yml` workflow runs a lint/test job automatically on every pull request.',
          'A small, scoped feature branch is created for one real change to Tide Board, with an issue opened first and linked via a closing keyword.',
          'The pull request receives a review -- from a real second GitHub account playing Ravi if one is available, or from you explicitly role-playing Ravi\'s comments if not -- following the request-changes-then-approve flow from m5-t3.',
          'The pull request only merges into `main` once its CI check is green and its review is approved, and the linked issue closes automatically.',
        ],
        technicalImplementation: [
          'Create the GitHub repo (via the web UI or `gh repo create`) and push Tide Board\'s existing local history with `git remote add origin ...` and `git push -u origin main`.',
          'Add `.github/workflows/ci.yml`, triggered on `pull_request`, running `actions/checkout`, `actions/setup-node`, then `npm ci`, `npm run lint`, `npm test`.',
          'Configure the branch protection rule under Settings > Branches requiring a PR, 1 approval, the CI check, and blocking force pushes.',
          'Open an issue describing one small, real improvement to Tide Board, label it, and reference it from the PR with a closing keyword.',
          'Branch, implement the change, push, and open the PR with `gh pr create`, using the title/description conventions from m5-t2.',
          'Use `gh pr checks`, `gh pr review`, and `gh pr merge --squash --delete-branch` to drive the review-to-merge lifecycle from the terminal.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Get Tide Board onto GitHub with CI wired up',
            outcome:
              'A real GitHub repository containing Tide Board\'s full history, with `main` as the default branch and a working CI workflow that runs on every pull request.',
            prompt:
              'Take my existing local Tide Board repository and get it onto GitHub as a new repo with main as the default branch, pushing all existing history. Then add .github/workflows/ci.yml: a GitHub Actions workflow triggered on pull_request that checks out the code, sets up Node, and runs npm ci, npm run lint, and npm test as separate steps in a job called lint-and-test. Commit and push the workflow file directly to main since no protection exists yet, then show me the workflow run succeeding once.',
          },
          {
            step: 2,
            label: 'Lock main down with branch protection',
            outcome:
              '`main` requires a pull request, 1 approval, the lint-and-test check, and rejects both force pushes and direct pushes.',
            prompt:
              'Set up a branch protection rule on main for this repository requiring: a pull request before merging, at least 1 approving review, the lint-and-test status check to pass, branches to be up to date before merging, and force pushes blocked. Then try git push origin main directly and show me that it gets rejected, confirming the rule is actually enforced.',
          },
          {
            step: 3,
            label: 'Open an issue and a small scoped PR that closes it',
            outcome:
              'An open issue describing one real, small Tide Board improvement, and a feature branch plus PR that references it with a closing keyword.',
            prompt:
              'Open a GitHub issue titled something like "Add a low-tide alert banner to the homepage", labelled appropriately, describing one small real feature for Tide Board. Then create a feature branch, implement just that one scoped change, push it, and open a pull request with gh pr create using a specific imperative title and a description that explains what changed, why, and how it was tested, and includes "Fixes #<issue-number>" so the issue auto-closes on merge. Confirm the CI check starts running on the new PR.',
          },
          {
            step: 4,
            label: 'Get a review from Ravi and respond to it',
            outcome:
              'The PR has at least one review thread that was opened, addressed with a follow-up commit, and resolved, ending in an Approve review.',
            prompt:
              'On this pull request, add a review that plays the role of teammate Ravi: leave at least one specific inline comment on a line of the diff (a real, technically reasonable piece of feedback, not a token one), and submit it as a "Request changes" review. Then, as the PR author, push a follow-up commit that addresses the feedback, reply to the comment thread explaining the fix, mark the conversation resolved, and submit a second review as Ravi that approves the PR. Show me the PR\'s review history reflecting both reviews.',
          },
          {
            step: 5,
            label: 'Get CI green and merge safely',
            outcome:
              'The PR is merged into `main` via `gh pr merge` once CI is green and the review is approved, and the linked issue closes automatically.',
            prompt:
              'Confirm the lint-and-test check is passing and the PR shows Ravi\'s approval, then merge the pull request into main using gh pr merge with the squash strategy and delete the branch afterward. Show me that the merge succeeded, that the linked issue closed automatically as a result, and that main\'s history now reflects the merged change.',
          },
        ],
        deliverable:
          'A real GitHub repository for Tide Board with a protected `main` branch (PR required, 1 approval required, CI check required, force pushes blocked), a working `.github/workflows/ci.yml` that runs on every pull request, and one fully completed pull request lifecycle: an issue opened and linked, a scoped feature branch, a request-changes-then-approve review from Ravi, a green CI check, and a squash merge into `main` that automatically closed the linked issue.',
      },
    },
  ],
  quiz: [
    {
      id: 'm5-q1',
      q: 'Asha has write access to the Tide Board repo and pushes branches directly to it. A new contributor, Meera, wants to fix a typo but has never been added as a collaborator. What should Meera do to open a pull request?',
      options: [
        'Ask Asha to email her the code so Asha can commit it herself',
        'Fork the repo to her own account, push her branch there, and open a PR from her fork into the original repo',
        "Push her fix directly to main since it's just a typo",
        'Wait until she is added as a collaborator before making any changes',
      ],
      answer: 1,
    },
    {
      id: 'm5-q2',
      q: "You rebase your feature branch onto main and need to push the rewritten history. Asha also has this branch checked out and pushed a small fix to it five minutes ago, which you haven't fetched yet. What does `git push --force-with-lease` do differently from `git push --force` here?",
      options: [
        'It automatically merges Asha\'s commit into your rebase before pushing',
        "It rejects the push because the remote branch has moved since you last saw it, instead of silently overwriting Asha's commit",
        'It pushes successfully but leaves a warning comment on the PR',
        'It behaves identically to --force in every situation',
      ],
      answer: 1,
    },
    {
      id: 'm5-q3',
      q: "The Tide Board repo has a branch protection rule on main requiring 1 approval and a passing lint-and-test status check. A PR has zero reviews and the CI job is still running. What does GitHub do?",
      options: [
        'Allows the merge immediately since the author is trusted',
        'Merges automatically once CI finishes, skipping the review requirement',
        'Disables the merge button until both an approval is given and the check finishes with a passing result',
        'Merges silently but reverts automatically if CI later fails',
      ],
      answer: 2,
    },
    {
      id: 'm5-q4',
      q: "Which PR description line will cause issue #34 to close automatically the moment the pull request is merged into the repo's default branch?",
      options: [
        'See #34 for context',
        'Related to #34',
        'Fixes #34',
        '#34',
      ],
      answer: 2,
    },
    {
      id: 'm5-q5',
      q: "Ravi submits a review on your PR with the 'Request changes' verdict, and branch protection requires reviews to be satisfied before merge. What has to happen before the PR can be merged?",
      options: [
        'Nothing -- Request changes is purely informational and never blocks merging',
        'The PR must be closed and reopened as a new PR',
        'Ravi (or another required reviewer) must approve after the concerns are addressed, or dismiss his own review',
        'The author must delete the branch and start over',
      ],
      answer: 2,
    },
  ],
}
