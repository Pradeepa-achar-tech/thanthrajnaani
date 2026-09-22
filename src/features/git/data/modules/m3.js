// Module 4 — Rebase & Interactive History Editing
// Git Mastery course content for the React course player.

export const m3 = {
  id: 'm3',
  title: 'Rebase & Interactive History Editing',
  hours: 8,
  color: 'from-cyan-500/20 to-cyan-700/10',
  accent: 'cyan',
  description:
    "This module is about rewriting history on purpose. You will learn **git rebase** as a second way to bring a feature branch up to date — same resulting files, a completely different-shaped history — and understand exactly why teams disagree about which to use. Then you will go deep into **interactive rebase**: reordering commits, rewording messages, squashing and fixing up a messy series, splitting one bloated commit into several clean ones, and pausing mid-history with edit. You will also learn the one rule that keeps all of this safe on a team, **the Golden Rule of rebasing**, and a lesser-known tool, **git rerere**, that remembers how you resolved a conflict so you never have to resolve the identical one twice.",
  sections: [
    {
      id: 'm3-s1',
      title: 'Rebase Fundamentals',
      topics: [
        {
          id: 'm3-t1',
          title: 'Rebase vs. Merge: Same Content, Different History Shape',
          explain:
            "Rebase and merge can produce a working tree with byte-for-byte identical files, but they leave completely different-looking commit graphs behind — and that difference is what teams actually argue about.",
          analogy:
            "Picture recounting a bus ride from Kundapura to Udupi. Ravi tells it as it actually happened: \"we stopped for tea, took a detour around roadworks, then arrived.\" Asha retells the exact same journey as if you had driven straight there with no stops. You both arrived at the same destination with the same luggage, but Ravi's version keeps the true order of events and Asha's is a tidier story. Merge is Ravi's telling; rebase is Asha's.",
          theory:
            "A merge commit has two (or more) parents: it joins two lines of development at a single point without touching any of the commits that already exist on either line. A rebase, by contrast, does not create a commit that joins two histories; it takes the commits unique to your branch and re-creates them, one at a time, as brand-new commits on top of a different starting point (the new base).\n\nCritically, the *resulting file content* at the tip of the branch is, in the overwhelming majority of cases, identical whether you merge or rebase — assuming the same conflicts get resolved the same way, a `git diff` between a merged tip and a rebased tip shows nothing. What differs is the graph. A true merge preserves the exact commits from both branches, in their original order, and adds one join point recording that two lines of work came together at a specific moment. A rebase discards the original commits from your branch (they still momentarily exist as dangling objects) and manufactures brand-new commits with new SHAs, new parent pointers, and often new commit timestamps, so that from Git's point of view your work always looks like it was written after the latest commit on the base branch, never alongside it.\n\nThis is exactly why teams disagree. Teams that prefer merge value **true history**: the log shows exactly when a feature branch diverged, how long it lived, and exactly what commits existed at each point in real time — valuable for auditing, for `git bisect` runs that must reflect what a CI system actually built, and for never rewriting a commit that already has a code review attached to its specific SHA. Teams that prefer rebase value **a linear, readable log**: `git log --oneline` on `main` reads like a clean sequence of intentional changes with no merge commits and no interleaved half-finished branches. Neither position is wrong; they are optimizing for different things, and most real teams end up with a hybrid rule such as \"rebase your own feature branch before opening a PR, but always merge — never rebase — main.\"",
          whyItMatters:
            "You will be dropped into teams on both sides of this argument, sometimes in the same week. Knowing precisely what each strategy does to file content versus history means you can follow either team's convention deliberately instead of cargo-culting a command, and you can explain in a review why a rebase-heavy PR history is fine to keep as-is or why it needs squashing before merge.",
          steps: [
            'On the Tide Board repo, create a branch called try-rebase-vs-merge from main and add one commit changing the ferry timetable heading.',
            'Switch back to main and add a different one-line commit (e.g. a footer fix) so the two branches diverge.',
            "Merge try-rebase-vs-merge into a throwaway copy of main and note the merge commit and both original SHAs in git log --graph.",
            'Reset that throwaway copy, then instead rebase try-rebase-vs-merge onto main and compare git log --graph again.',
            'Run git diff between the two final trees and confirm the file content is identical even though the histories look completely different.',
          ],
          code: `$ git log --oneline --graph --all
* a44e0b1 (main) Fix footer copyright year
| * 7d5a220 (try-rebase-vs-merge) Update ferry timetable heading
|/
* 2f6b881 Initial tide board site

$ git checkout -b merge-demo main
$ git merge try-rebase-vs-merge
Merge made by the 'ort' strategy.
 index.html | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git log --oneline --graph
*   c918aa3 (HEAD -> merge-demo) Merge branch 'try-rebase-vs-merge'
|\\
| * 7d5a220 Update ferry timetable heading
* | a44e0b1 Fix footer copyright year
|/
* 2f6b881 Initial tide board site

$ git checkout -b rebase-demo try-rebase-vs-merge
$ git rebase main
Successfully rebased and updated refs/heads/rebase-demo.

$ git log --oneline --graph
* 91b2ee4 (HEAD -> rebase-demo) Update ferry timetable heading
* a44e0b1 (main) Fix footer copyright year
* 2f6b881 Initial tide board site

$ git diff merge-demo rebase-demo
$ echo "exit code: $?"
exit code: 0`,
          pitfalls: [
            "**Assuming rebase 'loses' commits.** It does not lose your changes, but it does replace your original commits with new ones (new SHAs). If those original SHAs were referenced anywhere (a CI run, a code review comment, a git bisect note), that reference now points at an unreachable, soon-to-be-garbage-collected commit.",
            "**Picking a strategy per-PR instead of per-team.** Mixed conventions produce a history that is neither cleanly linear nor honestly chronological. Fix: agree on one rule as a team (e.g. \"rebase before PR, merge into main\") and put it in the repo's contributing guide.",
            "**Believing merge is always 'safer' and rebase is always 'riskier'.** Both are equally safe on a branch only you have ever pushed. The real risk in rebase is entirely about rewriting commits other people already have — covered in the Golden Rule topic next.",
            "**Confusing a fast-forward merge with a 'true' merge commit.** If main has not moved since you branched, git merge just moves the pointer forward with no merge commit at all — that is a third possible history shape, not the same as the two-parent merge commit shown above.",
          ],
          tryIt:
            "In a scratch clone of Tide Board, create two divergent one-line commits like the steps above, then produce both a merge history and a rebase history for the same starting point. Compare git log --graph --oneline --all for both and write one sentence on what is identical and one sentence on what is different.",
          takeaway:
            "Rebase and merge can leave you with the exact same files; they never leave you with the exact same history — and that history is what your team is really arguing about.",
        },
        {
          id: 'm3-t2',
          title: 'git rebase Basics: Replaying Commits onto a New Base',
          explain:
            "git rebase <upstream> takes the commits unique to your current branch, temporarily sets them aside, and reapplies each one's changes on top of <upstream>'s tip, one at a time, producing a brand-new commit for each with a brand-new SHA.",
          analogy:
            "Picture a prasadam queue with numbered tokens 41, 42, 43 handed out from a counter. If the temple opens a new counter and everyone has to re-join from token 40 instead of 38, the same three people keep their same order and the same items, but every one of them gets reissued a new token number. The people are your commits' content; the token numbers are the SHAs — same people, same order, new numbers.",
          theory:
            "git rebase <upstream> (most often git rebase main while checked out on a feature branch) does three things in sequence. First, it finds the **merge base** — the most recent commit both branches share — using the same computation as git merge-base. Second, it makes a list of every commit reachable from your branch tip but not from <upstream>, in chronological order (oldest first) — these are the commits unique to your work. Third, it checks out <upstream>'s tip, then reapplies that list of commits one by one, each time computing the diff the original commit introduced and applying that diff as a new commit on top of the current tip.\n\nThis is the part beginners find surprising: a rebase does not move or copy your original commits — it manufactures entirely new commit objects. Each new commit gets a new tree (the file snapshot after applying that commit's diff on the new base), a new parent pointer (the previous commit in the replayed sequence, not the original parent), and therefore a new SHA, since a commit's SHA is a hash of its tree, parent(s), author, committer, and message. Even if every line of the diff and the entire message stay identical, the new commit is a genuinely different object from the original. The original commits do not vanish immediately — they become **unreachable** (no branch or tag points at them) but still exist in the object database and are recoverable via git reflog until Git's garbage collector eventually prunes them.\n\nBecause each commit is replayed independently, git rebase can succeed cleanly commit-by-commit even on a long branch, or it can pause partway through if one specific commit's diff no longer applies cleanly against the evolving new base — that pause-and-resolve loop is the subject of the next topic. Also worth knowing: by default git rebase operates on the current branch; you can rebase any branch onto any other with git rebase <upstream> <branch> without checking it out first, and git switch / git checkout are unaffected by rebase itself — you stay on the branch you started on throughout.",
          whyItMatters:
            "Every rebase conflict, every 'why did my commit SHA change', and every rule about not rebasing shared branches traces back to this one mechanical fact: rebase does not edit commits, it replaces them. Understanding that replacement is what makes the rest of this module — interactive rebase, splitting commits, the Golden Rule — make sense as consequences of one idea rather than a list of commands to memorise.",
          steps: [
            'On ferry-delay-banner (a branch off an older main), note the current commit SHAs with git log --oneline main..HEAD.',
            'Have Asha (or you, on main) add a new commit to main so the branch is now behind.',
            'Run git rebase main from ferry-delay-banner.',
            'Run git log --oneline main..HEAD again and compare the SHAs to step 1 — they should all have changed even though the messages read the same.',
            'Run git reflog and locate the pre-rebase tip of ferry-delay-banner under an entry like "rebase (start)" to confirm the original commits still exist.',
          ],
          code: `$ git log --oneline main..HEAD
4b8f110 Add delay banner tests
9a20cde Add delay banner component

$ git log --oneline -1 main
7c1d0aa Add evening ferry timetable

# main gets a new commit while we were working
$ git checkout main
$ git commit -am "Fix ferry counter typo in footer"
[main e91a3f2] Fix ferry counter typo in footer

$ git checkout ferry-delay-banner
$ git rebase main
Successfully rebased and updated refs/heads/ferry-delay-banner.

$ git log --oneline main..HEAD
d3c9e77 Add delay banner tests
0f1a6b2 Add delay banner component

$ git log --oneline -1 main
e91a3f2 (main) Fix ferry counter typo in footer

$ git reflog | head -3
0f1a6b2 (HEAD -> ferry-delay-banner) HEAD@{0}: rebase (finish): returning to refs/heads/ferry-delay-banner
0f1a6b2 HEAD@{1}: rebase (pick): Add delay banner component
9a20cde HEAD@{2}: rebase (start): checkout e91a3f2`,
          pitfalls: [
            "**Expecting the old SHAs to still mean anything on this branch.** Any note, ticket link, or CI badge that referenced the old commit now points at a commit that is not on any branch. Re-link to the new SHA, or better, link to the branch name/PR instead of a commit hash where possible.",
            "**Rebasing with uncommitted changes in the way.** Git will refuse to start (it will only stash automatically if you pass --autostash, which is not the default). Commit or git stash first.",
            "**Forgetting which direction 'onto' goes.** git rebase main while on feature replays feature's commits onto main — it never touches main. Running it from the wrong branch rebases the wrong thing.",
            "**Assuming rebase always succeeds silently.** It only replays cleanly when each commit's diff still applies against the evolving base; diverged or conflicting changes pause the rebase, covered next.",
            "**Panicking when the SHAs change.** This is expected, not a sign of data loss — the content is intact, only the object identities are new.",
          ],
          tryIt:
            "In a scratch branch, run git rebase main where nothing on main has changed since you branched. Confirm your commit SHAs are unchanged in this specific case (a true no-op rebase) — then repeat after adding one new commit to main and confirm they change this time. Explain in one sentence why the two cases differ.",
          takeaway:
            "git rebase does not edit your commits in place — it manufactures new commits with new SHAs that replay the same changes onto a new base, leaving the originals dangling until garbage collection.",
        },
        {
          id: 'm3-t3',
          title: 'Resolving Rebase Conflicts: --continue, --skip, --abort',
          explain:
            "When a replayed commit's diff no longer applies cleanly, git rebase pauses on that one commit for you to resolve — and because each commit is replayed separately, this pause-resolve cycle can repeat once per conflicting commit, unlike a merge, which asks for conflict resolution exactly once for the whole operation.",
          analogy:
            "A merge conflict is like one dispute at the ferry ticket counter: the clerk stops the whole line once, sorts out the disagreement, and the queue moves on. A rebase conflict is like re-issuing every ticket in the queue one at a time from a new counter — most people's tickets reissue instantly, but if three specific people's old tickets clash with the new numbering, the clerk stops three separate times, once per person, in order.",
          theory:
            "During a rebase, Git works through the todo list of commits one at a time. For each commit, it computes that commit's diff against its original parent, then tries to apply that diff on top of the current tip of the in-progress rebase. If the diff applies cleanly, Git creates the new commit automatically and moves to the next one with no pause. If it does not — usually because a nearby line was also touched by a commit further back in the replayed base — Git stops mid-rebase, leaves conflict markers (<<<<<<<, =======, >>>>>>>) in the affected file(s), and leaves the repository in a special 'rebase in progress' state, visible via git status.\n\nYou resolve exactly like a merge conflict at the file level: open the file, decide what the final content should be, remove the conflict markers, and git add the resolved file(s). The difference is what happens next: git rebase --continue tells Git \"this one commit is resolved, apply its result as the next new commit, then move on to the next item in the todo list\" — and if that next commit also conflicts, Git pauses again, on that commit alone. A single rebase invocation can therefore prompt you through a series of independent conflict-resolution rounds, one per problem commit, whereas git merge produces one combined diff and asks for conflict resolution exactly once for the whole operation, however many commits are being merged in.\n\nTwo other exits exist besides --continue. git rebase --skip abandons the current commit entirely — its changes are dropped from the final history, not just its conflict — which is correct only when you have determined the commit's change is no longer needed (for example, an upstream commit already made the same fix). git rebase --abort throws away the entire in-progress rebase and resets your branch back to exactly where it was before you ran git rebase, as if it had never started; this is always safe and is your escape hatch if a rebase turns into more conflicts than it is worth resolving.",
          whyItMatters:
            "Rebase conflicts feel worse than merge conflicts to a lot of engineers purely because of this repetition, not because any single conflict is harder. Knowing that --continue only advances one commit at a time — and that --abort costs you nothing — turns a stressful multi-round conflict slog into a predictable loop you can walk through calmly, commit by commit.",
          steps: [
            'Start a rebase of ferry-delay-banner onto an updated main where two of the branch\'s commits touch the same lines main also changed.',
            'When the first conflict appears, run git status to see which files are conflicted and which commit is paused.',
            'Open the conflicted file, resolve the markers, then git add it and run git rebase --continue.',
            'When the next commit also conflicts, decide whether to resolve it (--continue) or, if its change is now redundant, drop it (--skip).',
            'If the conflicts pile up faster than you can reason about them, run git rebase --abort and re-plan (e.g. rebase in smaller chunks, or merge instead).',
          ],
          code: `$ git rebase main
Auto-merging js/delay.js
CONFLICT (content): Merge conflict in js/delay.js
error: could not apply 9a20cde... Add delay banner component
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
Could not apply 9a20cde... Add delay banner component

$ git status
interactive rebase in progress; onto e91a3f2
Last command done (1 command done):
   pick 9a20cde Add delay banner component
Next command to do (1 remaining command):
   pick 4b8f110 Add delay banner tests
You are currently rebasing branch 'ferry-delay-banner' on 'e91a3f2'.
  (fix conflicts and run "git rebase --continue")
  (use "git rebase --skip" to skip this patch)
  (use "git rebase --abort" to check out the original branch)

Unmerged paths:
  both modified:   js/delay.js

# ...edit js/delay.js to resolve the conflict markers...
$ git add js/delay.js
$ git rebase --continue
Applying: Add delay banner component

Auto-merging js/delay.js
CONFLICT (content): Merge conflict in js/delay.js
error: could not apply 4b8f110... Add delay banner tests

# this test file change turns out to already be covered upstream
$ git rebase --skip

Successfully rebased and updated refs/heads/ferry-delay-banner.`,
          pitfalls: [
            "**Running git rebase --continue before git add-ing the resolved file.** Git will refuse and tell you unresolved paths remain — resolve, stage, then continue.",
            "**Using --skip to 'get past' a conflict you actually needed.** --skip deletes that commit's contribution from history, not just its conflict — only use it when you are sure the change is redundant or unwanted.",
            "**Not realizing a rebase is still in progress.** If you walk away mid-conflict, git status and most shell prompts will say so; committing normally instead of using --continue can leave the rebase machinery in a confusing half-finished state.",
            "**Treating --abort as a last resort instead of a normal tool.** It is completely safe and restores you exactly to your pre-rebase branch — reach for it early rather than fighting through conflicts you do not understand.",
            "**Resolving a conflict, then discovering the resulting commit is now empty.** If a commit's entire change was already applied upstream, Git will ask whether to skip that now-empty commit — read the prompt rather than reflexively continuing.",
          ],
          tryIt:
            "Deliberately create a two-commit branch where both commits touch the same line as a commit you add to main afterward. Run the rebase, resolve the first conflict and --continue, then when the second conflict appears, --abort instead of finishing it. Confirm with git log that your branch is back to its exact pre-rebase state.",
          takeaway:
            "A rebase can pause once per conflicting commit, not once total — resolve and --continue through each round individually, --skip a commit whose change is truly no longer needed, and --abort any time to return to exactly where you started.",
        },
        {
          id: 'm3-t4',
          title: 'The Golden Rule: Never Rebase Public History',
          explain:
            "The Golden Rule of rebasing is simple to state and easy to violate by accident: never rewrite commits that any other clone of the repository already has, because doing so gives 'the same' logical change two different identities that Git cannot reconcile automatically.",
          analogy:
            "Think of the shared notice board at the Kundapura ferry stand. Once you pin up a timetable and three people have already photographed it, quietly swapping it for a slightly reworded version does not undo those photos — now there are two versions of \"the Tuesday timetable\" in circulation, and anyone comparing notes gets confused about which one is real. A commit that has already been fetched or pulled by someone else is that photographed notice.",
          theory:
            "Rebase (and git commit --amend, and any other history-rewriting operation) is only 'dangerous' in one specific sense: it replaces existing commit objects with new ones that carry the same content but different SHAs. On a branch that exists solely on your machine, that is irrelevant — nobody else has a reference to the old SHAs, so nothing breaks. The moment you git push a branch and someone else git fetches or git pulls it, though, their local repository now has its own reference to your original commits. If you subsequently rebase, rewrite, and force-push, your remote branch now points at all-new commit objects that share no SHA with what your collaborator already has.\n\nThe Golden Rule is: **never rebase, or otherwise rewrite, a branch that other people have already pulled**, unless you can guarantee they will discard their local copy rather than try to reconcile it. If you break this rule, the collaborator's next plain git pull (which is fetch + merge by default) sees two histories that share an old common ancestor but have diverged — because from Git's perspective, your rewritten commits are not the same objects as the old ones. Git dutifully merges the two, and the result is a branch containing both the old and new copies of every commit you rewrote, plus an extra merge commit joining them — the exact duplication and confusion the notice-board analogy describes, and it happens even though the file content your collaborator ends up with is usually correct.\n\nThe practical fixes fall into two categories. First, prevention: only rebase branches nobody else has fetched (your own in-progress feature branch, before you first push it, or after you have explicitly told the team a rewrite is coming), and use git push --force-with-lease instead of git push --force so a stale push at least fails safely if someone pushed something you have not seen yet, rather than silently clobbering it. Second, recovery, if the rule does get broken: the collaborator should not try to merge the two histories. They should save any of their own unique work (e.g. git branch backup-mine), then reset their local branch to match the rewritten remote (git fetch followed by git reset --hard origin/<branch>), and finally replay their own unique commits on top with git cherry-pick or git rebase — a manual, coordinated version of exactly what git pull --rebase would have attempted automatically.",
          whyItMatters:
            "This is the one rule in this whole module that, if broken on a real team, does not just create ugly history — it actively wastes other people's time reconciling duplicate commits, or worse, silently reintroduces old buggy code that a force-push appeared to remove. Everything else in this module (interactive rebase, splitting, squashing) is completely safe specifically because you will apply it before a branch is shared, per this rule.",
          steps: [
            'Push ferry-delay-banner to the shared remote so it exists there.',
            'Have Asha git fetch and check out that branch, then add one commit of her own on top.',
            'On your machine, rebase ferry-delay-banner onto an updated main and force-push it — without telling Asha.',
            'Have Asha run a plain git pull and observe the duplicated commits and unplanned merge commit in git log --graph.',
            'Recover properly: have Asha save her commit (git branch asha-wip), reset to the rewritten remote branch, then git cherry-pick her saved commit back on top.',
          ],
          code: `# you: rewrite and force-push a branch Asha already has
$ git rebase main
$ git push --force origin ferry-delay-banner

# Asha, unaware, just wants her local copy up to date
$ git pull
From github.com:thanthrajnaani/tide-board
 * branch            ferry-delay-banner -> FETCH_HEAD
Auto-merging js/delay.js
Merge made by the 'ort' strategy.

$ git log --oneline --graph
*   f3a9c21 (HEAD -> ferry-delay-banner) Merge remote-tracking branch 'origin/ferry-delay-banner'
|\\
| * d3c9e77 Add delay banner tests          <- your rebased copy
| * 0f1a6b2 Add delay banner component      <- your rebased copy
* | 9c88e50 Adjust banner colour to match ferry brand
* | 4b8f110 Add delay banner tests          <- Asha's old, pre-rebase copy
* | 9a20cde Add delay banner component      <- Asha's old, pre-rebase copy
|/
* e91a3f2 Fix ferry counter typo in footer

# the correct recovery instead of the pull above:
$ git branch asha-wip                          # save her unique commit
$ git fetch origin
$ git reset --hard origin/ferry-delay-banner   # adopt the rewritten history
$ git cherry-pick 9c88e50                      # replay just her real commit`,
          pitfalls: [
            "**Force-pushing with --force on a branch anyone else might have touched.** Use --force-with-lease instead — it fails loudly if the remote has commits you have not fetched yet, instead of silently overwriting them.",
            "**Assuming 'nobody's reviewing it yet' means nobody has it.** A branch someone merely checked out to read, or that a CI job cloned, still counts — the rule is about whether the old commits exist anywhere else, not about review status.",
            "**Reflexively git pull-ing after being told history was rewritten.** A plain pull merges instead of replacing; after any announced rewrite, git fetch followed by git reset --hard origin/<branch> (after saving your own unique work) is almost always what you actually want.",
            "**Rewriting main (or any branch everyone bases work on) 'just this once'.** Even a single rebase of a trunk branch forces every collaborator through the recovery dance above simultaneously — this branch is exactly what the Golden Rule exists to protect.",
            "**Treating --force-with-lease as making force-push safe in general.** It only protects against clobbering pushes you have not seen; it does nothing to prevent the duplicate-history mess your collaborators still get if they have already pulled the old commits.",
          ],
          tryIt:
            "In a two-clone scratch setup (or with a teammate), push a branch, pull it into the second clone, add a commit there, then rebase and force-push from the first clone. Run a plain git pull in the second clone and read the resulting git log --graph closely enough to point at exactly which commits are duplicates.",
          takeaway:
            "Once a commit exists in someone else's repository, rewriting it does not erase the old copy — it creates a second, different-SHA copy of 'the same' change that Git and your collaborators now have to reconcile by hand.",
        },
      ],
    },
    {
      id: 'm3-s2',
      title: 'Interactive Rebase',
      topics: [
        {
          id: 'm3-t5',
          title: 'git rebase -i: Reordering, Rewording, and Editing Commits',
          explain:
            "git rebase -i <base> opens an editable todo list of your branch's commits, letting you reorder them, reword their messages, or pause on any one of them with edit to change its content before the rebase continues.",
          analogy:
            "Interactive rebase is like editing a diary before anyone else reads it: you can move Tuesday's entry to sit before Monday's if that tells the story better, retitle a vague entry, or stop on one entry to add a sentence you forgot — all without changing what actually happened on the days themselves.",
          theory:
            "git rebase -i <base> performs the same replay mechanism as a plain rebase, but first opens your editor with a **todo list**: one line per commit between <base> and your branch tip, oldest first, each starting with the word pick. The rest of that line is just a short SHA and the commit's subject line, shown for your reference — editing that text in the todo list does not change the commit message; it is only a label.\n\nWhat actually changes behaviour is the **command word** at the start of each line, and the **order of the lines**. Reordering two lines reorders those two commits in the resulting history (Git will replay them in the new order, which can introduce new conflicts if a later commit actually depended on an earlier one). Changing pick to reword (or r) tells Git to apply that commit's diff unchanged but stop and let you edit its commit message in your editor. Changing pick to edit (or e) tells Git to apply that commit's diff, then pause the rebase entirely with that commit checked out as HEAD — at that point you can inspect files, run tests, amend the commit with git commit --amend, or even split it (next topic), before running git rebase --continue to resume.\n\nA few other todo commands worth knowing now: drop (or simply deleting the line) omits that commit's changes from the final history entirely; exec <command> (or x) runs an arbitrary shell command at that point in the replay, useful for running a test suite after every commit to find exactly which one broke something; and break pauses the rebase without applying anything further, handy for manual inspection. Saving and closing the todo-list editor starts the replay; Git works through it top to bottom and only stops early at a reword, edit, break, a conflict, or a failing exec.",
          whyItMatters:
            "This is the single most-used history-editing tool in a working engineer's daily routine — cleaning up a branch's commit messages and order before opening a pull request is normal, expected practice on most teams, not an advanced trick, and Ravi will expect a PR's commits to already read cleanly by the time he reviews it.",
          steps: [
            'On ferry-delay-banner, run git log --oneline main..HEAD to see the raw commit list you are about to edit.',
            'Run git rebase -i main to open the todo list for exactly those commits.',
            'Reorder two lines so a setup commit comes before the commit that depends on it.',
            'Change one pick to reword and give that commit a clearer, imperative-mood message.',
            'Change one pick to edit, save, and once Git pauses there, run git commit --amend to add a forgotten file, then git rebase --continue.',
          ],
          code: `$ git log --oneline main..HEAD
4b8f110 Add delay banner tests
c72f118 fix typo
9a20cde Add delay banner component
e02a6c1 oops forgot to add banner.css

$ git rebase -i main

# todo list as first opened (oldest first):
pick e02a6c1 oops forgot to add banner.css
pick 9a20cde Add delay banner component
pick c72f118 fix typo
pick 4b8f110 Add delay banner tests

# reordered and edited to:
pick e02a6c1 oops forgot to add banner.css
edit 9a20cde Add delay banner component
reword c72f118 fix typo
pick 4b8f110 Add delay banner tests

# save and close -> rebase runs and stops at the 'edit' line:
Stopped at 9a20cde...  Add delay banner component
You can amend the commit now, with

  git commit --amend

$ git add banner-icon.svg
$ git commit --amend --no-edit
$ git rebase --continue

# editor opens for the 'reword' commit, message changed to:
Update ferry delay CSS spacing

$ git rebase --continue
Successfully rebased and updated refs/heads/ferry-delay-banner.`,
          pitfalls: [
            "**Editing the commit message text directly in the todo list.** That text is just a display label for pick lines — to actually change a message, you must switch the command word to reword or edit.",
            "**Reordering commits with a real dependency between them.** If commit B's diff assumes commit A already ran, moving B before A will conflict (or worse, apply silently onto the wrong base) — check dependencies before reordering.",
            "**Forgetting you are mid-rebase after an edit stop.** Running plain git commit (instead of --amend) at an edit stop creates a brand-new commit in the middle of the replay rather than modifying the paused one — usually not what you intended.",
            "**Closing the editor without changing anything, expecting it to cancel.** An unmodified todo list with only pick lines just performs a normal rebase; to actually abort, delete the entire todo list content before saving so Git reports nothing to do, or run git rebase --abort separately.",
            "**Using drop when you meant squash/fixup.** drop discards that commit's changes permanently from this branch, not just its separate identity — make sure that is really what you want before saving.",
          ],
          tryIt:
            "Take a 3-commit scratch branch, run git rebase -i against its base, and reorder the last two commits, reword the first, and mark the second edit to amend in one small forgotten change. Confirm the final git log -p shows the commits in the new order with the new message.",
          takeaway:
            "The todo list's command word — not the commit message text shown next to it — is what tells git rebase -i whether to keep, reorder, reword, pause on, or drop each commit.",
        },
        {
          id: 'm3-t6',
          title: 'Squash and Fixup: Cleaning a Messy Series Before a PR',
          explain:
            "squash and fixup both fold one commit's changes into the commit before it during an interactive rebase, but they handle the commit message differently — and git commit --fixup plus rebase --autosquash automate finding and marking the right commit for you.",
          analogy:
            "Think of a food stall that gets a correction slip (\"actually, no onions\") and just staples it to the original order, throwing the correction slip away — the customer only ever sees the original ticket. That is fixup. squash is the stall rewriting a single new ticket that explicitly mentions both the original order and the correction, for a fuller record.",
          theory:
            "In an interactive rebase todo list, marking a commit squash (or s) folds its changes into the commit immediately above it in the list and combines the two commit messages: Git opens your editor with both messages concatenated, and you edit that into one final message for the merged commit. Marking a commit fixup (or f) does the same folding of changes, but discards that commit's message entirely — the merged commit keeps only the message of the commit above it, with no editor pause at all (unless a later stop needs your attention anyway).\n\nIn practice, fixup is by far the more common of the two, because most 'extra' commits in a messy branch are exactly that: small corrections ('fix typo', 'oops forgot a file', 'address review comment') that add no information of their own — you want their changes folded in with zero trace of their throwaway message. squash is for the rarer case where the second commit's message genuinely adds something worth keeping alongside the first (e.g. explaining a follow-up decision), so you want to compose a combined message rather than discard one side.\n\nManually finding the right commit to mark and moving it next to its target gets tedious on a long branch, so Git automates it. git commit --fixup=<commit> creates a new commit whose message is exactly \"fixup! <subject of <commit>>\" and whose diff is whatever you currently have staged — you do not write a message yourself. git commit --squash=<commit> does the same but prefixes with \"squash!\" instead. Then, running git rebase -i --autosquash <base> (or setting rebase.autosquash = true in config so it is always on) makes Git pre-process the todo list before showing it to you: any fixup!/squash!-prefixed commit is automatically moved to sit directly after the commit it targets and is automatically given the matching fixup/squash command word. You often do not even need to touch the todo list — just save it as generated.",
          whyItMatters:
            "This is exactly how you turn a realistic day of work — a real commit, two typo fixes, one 'oops forgot the file', and a review-comment fix — into the two or three clean commits Ravi actually wants to review, without manually retyping history by hand. --fixup / --autosquash is the difference between doing this cleanup in ten seconds per correction versus reshuffling a todo list by memory every time.",
          steps: [
            'Make a real commit, e.g. "Add delay threshold config".',
            'Realize it is missing a null check; stage just that fix and run git commit --fixup=<sha of that commit> instead of writing a new message.',
            'Repeat for any other small corrections against other commits, each with its own --fixup=<target>.',
            'Run git rebase -i --autosquash main and confirm the todo list already has each fixup commit placed and marked correctly.',
            'Save and let the rebase run; confirm with git log --oneline that only the original, clean commit messages remain.',
          ],
          code: `$ git log --oneline -1
abc1234 Add delay threshold config

$ git add js/delay.js
$ git commit --fixup=abc1234
[ferry-delay-banner 9e77abc] fixup! Add delay threshold config
 1 file changed, 3 insertions(+), 1 deletion(-)

$ git log --oneline -3
9e77abc fixup! Add delay threshold config
7a5e330 Add delay banner tests
abc1234 Add delay threshold config

$ git rebase -i --autosquash main

# todo list opens ALREADY reordered and marked:
pick abc1234 Add delay threshold config
fixup 9e77abc fixup! Add delay threshold config
pick 7a5e330 Add delay banner tests

# save and close -> rebase runs automatically:
Successfully rebased and updated refs/heads/ferry-delay-banner.

$ git log --oneline
d0a6f21 Add delay banner tests
5f88c02 Add delay threshold config
e91a3f2 Fix ferry counter typo in footer`,
          pitfalls: [
            "**Confusing which message survives.** After a fixup, only the target commit's original message remains — the fixup!-prefixed commit's message is discarded completely, not appended.",
            "**Forgetting --autosquash is not the rebase default.** Without it (or rebase.autosquash = true in config), fixup!/squash!-prefixed commits show up as ordinary pick lines wherever they happen to sit chronologically — you would need to move and relabel them yourself.",
            "**Targeting the wrong commit with --fixup=<sha>.** Double-check git log --oneline for the exact commit before running it — the fixup commit is useless unless --autosquash finds the right neighbour to fold into.",
            "**Using --squash when you meant --fixup.** A squash! commit pauses the rebase to let you compose a combined message even when you had nothing worth adding — mildly annoying at scale, and a sign you wanted --fixup instead.",
            "**Squashing or fixing up across a conflict-prone gap.** If the fixup commit is far from its target in the todo list before reordering, folding it in can still conflict if intervening commits touched the same lines — resolve like any other rebase conflict, then continue.",
          ],
          tryIt:
            "Make three commits on a scratch branch: one real change, and two 'fixup' commits created with --fixup=<sha> targeting it. Run git rebase -i --autosquash against the branch's base and confirm the final git log shows exactly one clean commit with the combined diff and the original message.",
          takeaway:
            "fixup keeps only the target commit's message and discards the correction's message entirely; squash keeps both and lets you write a combined one — and --fixup plus --autosquash means you never have to manually reorder the todo list to use either.",
        },
        {
          id: 'm3-t7',
          title: 'Splitting a Commit in Two with rebase -i and git reset',
          explain:
            "To break one bloated commit into several focused ones, mark it edit in an interactive rebase, then use git reset to unstage its changes back into your working directory so you can commit them again in smaller, deliberate pieces.",
          analogy:
            "Imagine you bought fish and rope from a single stall and got one combined receipt. Splitting the commit is like asking for two separate itemized receipts instead — same total purchase, same money spent, but now each receipt describes one thing clearly instead of one receipt describing two.",
          theory:
            "Interactive rebase's edit command is the tool for this. Mark the oversized commit edit in the todo list; when Git pauses there, that commit has already been applied and HEAD points at it, with the working directory and index both matching its full snapshot exactly. The trick is what you do next: git reset HEAD^ (equivalently git reset HEAD~1, and by default a **mixed** reset) moves the branch pointer back to that commit's parent and resets the index to match the parent's snapshot too — but it deliberately leaves your working directory files untouched. The practical effect: every change the oversized commit introduced now shows up as ordinary, uncommitted modifications in your working tree, exactly as if you had made all that work but had not committed any of it yet.\n\nFrom there you use normal staging tools — git add <file>, or git add -p for a line-by-line, hunk-by-hunk selection within a single file — to build up and commit each logical piece separately: stage just the component code and commit it, then stage just the test file and commit it, and so on, until every change from the original commit has been re-committed across as many focused commits as makes sense. Once nothing is left unstaged, run git rebase --continue to resume replaying whatever commits came after the one you just split.\n\nThis only works cleanly because git reset (unlike git checkout <path> or git restore) can move HEAD and the index without touching the working directory when you choose a mixed reset — the default mode. Using git reset --hard HEAD^ here would be a mistake: --hard also overwrites the working directory to match the parent commit, discarding the very changes you are trying to split out. Mixed (the default, no flag needed) is exactly the middle ground this technique depends on.",
          whyItMatters:
            "Splitting after the fact happens constantly in real work: you meant to make a small, focused change, got absorbed, and ended up with one commit that quietly did three unrelated things. Being able to unpick that into a clean, reviewable set of commits — without redoing any of the actual work — is what turns 'oops, this diff is huge' into a PR Ravi can review one logical change at a time.",
          steps: [
            'Identify the oversized commit, e.g. one that both adds a component and its tests together, with git log --oneline main..HEAD.',
            'Run git rebase -i main and mark that commit edit.',
            'When the rebase pauses there, run git reset HEAD^ and confirm with git status that its changes are now unstaged.',
            'Stage and commit the component change alone, then stage and commit the test file alone.',
            'Run git rebase --continue to replay any remaining commits, then confirm with git log --oneline that you now have two commits where there was one.',
          ],
          code: `$ git log --oneline main..HEAD
0f1a6b2 Add delay banner component and its unit tests

$ git rebase -i main
# todo list marked:
edit 0f1a6b2 Add delay banner component and its unit tests

# save and close -> rebase stops:
Stopped at 0f1a6b2...  Add delay banner component and its unit tests
You can amend the commit now, with

  git commit --amend

$ git reset HEAD^
Unstaged changes after reset:
M	js/delay.js
M	test/delay.test.js

$ git status
On branch ferry-delay-banner
You are currently editing a commit while rebasing branch 'ferry-delay-banner' on 'e91a3f2'.
Changes not staged for commit:
	modified:   js/delay.js
	modified:   test/delay.test.js

$ git add js/delay.js
$ git commit -m "Add delay banner component"
[detached HEAD 5cc9a02] Add delay banner component

$ git add test/delay.test.js
$ git commit -m "Add unit tests for delay banner"
[detached HEAD b220ff1] Add unit tests for delay banner

$ git rebase --continue
Successfully rebased and updated refs/heads/ferry-delay-banner.

$ git log --oneline main..HEAD
b220ff1 Add unit tests for delay banner
5cc9a02 Add delay banner component`,
          pitfalls: [
            "**Using git reset --hard HEAD^ instead of the default mixed reset.** --hard wipes the working directory back to the parent commit too, deleting the exact changes you were about to split out — there is no undo for this beyond the reflog.",
            "**Forgetting you are mid-rebase and running git rebase again or checking out another branch.** Finish the current edit stop (commit the pieces, then --continue) before doing anything else with the repository.",
            "**Splitting along the wrong boundary.** If two files' changes are actually interdependent (a function and its only caller), splitting them into separate commits can leave an intermediate commit that does not build — decide boundaries by what each commit should mean, not just by file.",
            "**Missing files during the split.** After committing the pieces you intended, git status should show a completely clean working directory before --continue — anything left over means part of the original change did not make it into any new commit.",
            "**Using git add -A out of habit at each step.** That re-stages everything, including the piece you meant to commit separately next — use targeted git add <path> or git add -p instead.",
          ],
          tryIt:
            "Make one scratch commit that changes two unrelated files at once. Use git rebase -i with edit on that commit, git reset HEAD^, and then commit each file separately. Confirm git log -p shows two commits, each touching exactly one file.",
          takeaway:
            "At an edit stop, a mixed git reset HEAD^ unstages the paused commit's entire change back into your working directory without deleting it, so you can re-commit it in as many focused pieces as you want.",
        },
        {
          id: 'm3-t8',
          title: 'git rerere: Teaching Git to Remember Conflict Resolutions',
          explain:
            "git rerere (\"reuse recorded resolution\") records how you resolved a merge or rebase conflict the first time, and automatically reapplies that same resolution if the identical conflict ever shows up again.",
          analogy:
            "Imagine the same disputed ticket keeps showing up at the ferry counter every time a schedule reshuffle happens — the clerk resolved it once, wrote the resolution on a card, and now just pulls out that card and applies it instantly the next few times the exact same dispute recurs, instead of relitigating it from scratch.",
          theory:
            "rerere stands for **reuse recorded resolution**. It is disabled by default and turned on with git config --global rerere.enabled true (or per-repo without --global). Once enabled, every time Git records a conflict during a merge or rebase, it also stores a normalized 'preimage' of the conflicted hunks in .git/rr-cache. When you resolve the conflict and stage the file, Git records your resolution alongside that preimage as a diff. If the exact same conflicting hunks ever appear again — same before-state, same clashing changes — Git recognizes the preimage and automatically applies your previously recorded resolution to the file, without you touching it.\n\nThe case where this pays off constantly is a long-lived branch that gets rebased onto a moving main repeatedly (say, once a week while a large feature is in review), where the same handful of lines conflict every single time because both sides keep touching them. Without rerere you resolve that same conflict from scratch on every rebase. With it enabled, the second and subsequent times, Git prints \"Resolved '<file>' using previous resolution.\" and the file is already fixed — you review it, git add it, and continue. It is equally useful for repeated git cherry-pick of the same commit across multiple branches, where the same conflict recurs on each target.\n\nBy default, rerere stages the auto-resolved file for you to inspect but still expects you to git add and git rebase --continue yourself — it does not blindly trust its own memory forever. Setting rerere.autoUpdate = true goes one step further and automatically stages the resolution too, so all that is left is --continue; most people leave this off and review the recorded resolution at least once. It is worth remembering rerere is scoped to a preimage of the exact conflicting hunks — it will not help with a conflict that merely looks similar but involves different surrounding lines, and it offers nothing for a conflict you are seeing for the first time.",
          whyItMatters:
            "Anyone rebasing a genuinely long-lived branch discovers the same conflict recurring rebase after rebase, and resolving it identically each time is pure wasted effort. rerere is the one setting that turns that repetition into a one-time cost, and it is cheap enough (one config line) that there is little reason not to have it enabled once you know it exists.",
          steps: [
            'Enable it once with git config --global rerere.enabled true.',
            'Rebase ferry-delay-banner onto main, hit a conflict in js/delay.js, resolve it by hand, git add it, and git rebase --continue — note the "Recorded resolution" message.',
            'Continue working, then later rebase the same branch onto a newer main again, reproducing the identical conflict.',
            "Observe Git printing \"Resolved 'js/delay.js' using previous resolution.\" this time, with the file already fixed.",
            'Sanity-check the auto-applied resolution with git diff before git add-ing and continuing, since rerere trusts pattern-matching, not understanding.',
          ],
          code: `$ git config --global rerere.enabled true

$ git rebase main
Auto-merging js/delay.js
CONFLICT (content): Merge conflict in js/delay.js
Recorded preimage for 'js/delay.js'

# ...resolve the conflict by hand...
$ git add js/delay.js
$ git rebase --continue
Recorded resolution for 'js/delay.js'.
Successfully rebased and updated refs/heads/ferry-delay-banner.

# --- weeks later, rebasing the same branch onto a newer main again ---
$ git rebase main
Auto-merging js/delay.js
CONFLICT (content): Merge conflict in js/delay.js
Resolved 'js/delay.js' using previous resolution.

$ git diff --cached js/delay.js
# ...confirm the auto-applied resolution still looks correct...

$ git add js/delay.js
$ git rebase --continue
Successfully rebased and updated refs/heads/ferry-delay-banner.`,
          pitfalls: [
            "**Forgetting rerere is off by default.** It records nothing and helps nothing until rerere.enabled is set — check git config rerere.enabled if you expect it to be active.",
            "**Blindly trusting an auto-applied resolution.** rerere matches on the conflicting hunks, not on intent — if the surrounding code's meaning has genuinely changed since the recorded resolution, review the auto-applied result before continuing rather than assuming it is still correct.",
            "**Expecting rerere to help with a brand-new conflict.** It only replays resolutions to conflicts it has literally seen before; the first occurrence of any conflict still needs your manual resolution.",
            "**Not clearing stale recordings after a resolution turns out to be wrong.** git rerere forget <path> removes a bad recorded resolution so it stops being reapplied.",
            "**Assuming rerere recordings sync across clones automatically.** They live in .git/rr-cache, a local, untracked directory — a teammate's Git will not benefit from your recorded resolutions unless the cache is deliberately shared.",
          ],
          tryIt:
            "Enable rerere.enabled, then deliberately reproduce the same conflict twice — resolve a two-branch conflict once, undo both branches back to their pre-resolution state, and redo the identical merge or rebase. Confirm the second time, Git reports using a previous resolution instead of asking you to resolve it again.",
          takeaway:
            "git rerere remembers the exact resolution to a conflict it has seen before and replays it automatically next time — a small one-time setting that pays off every time a long-lived branch hits the same recurring conflict.",
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm3-p1',
      type: 'Project',
      title: 'Clean History Before Review',
      domain: 'Version Control',
      duration: '2-3 hrs',
      description:
        "You're handed Tide Board's ferry-delay-banner branch exactly as a rushed afternoon of real work left it: six commits, out of order, with messages like 'wip' and 'oops'. Before Ravi will look at it, you need to turn that into 2-3 clean, logically ordered commits using interactive rebase — without changing a single line of the actual final code.",
      tools: ['Git'],
      blueprint: {
        overview:
          "This project simulates the single most common real-world use of interactive rebase: taking your own messy, honest-to-the-moment commit history and presenting it as a small number of deliberate, reviewable commits before anyone else sees it. You'll recreate a specific messy 6-commit branch, plan a clean target history, then execute reordering, squashing/fixup, and rewording with git rebase -i until the branch is PR-ready.",
        functionalRequirements: [
          "Recreate (or use a provided script to recreate) a ferry-delay-banner branch off main with exactly 6 commits in this messy order: an incomplete 'wip' commit, a real component commit, a 'fix typo' commit correcting a mistake in an earlier commit, an 'oops forgot to add banner.css' commit, a real tests commit, and a final small logic-fix commit that actually belongs with the first real component commit.",
          "Inspect the raw history with git log --oneline main..HEAD and produce a written mapping of which raw commits belong together before touching git rebase -i.",
          "Use git rebase -i main to reorder, mark 'fix typo', 'oops forgot to add banner.css', and the small logic fix as fixup into the commits they actually belong to, and reword the remaining commits into clear, imperative-mood, single-purpose messages.",
          "End with exactly 2 or 3 commits on the branch, none containing 'wip', 'oops', 'fix typo', or any other placeholder word in its message.",
          "Prove no functional regression: git diff main..ferry-delay-banner after cleanup must show the exact same final file content as git diff main..ferry-delay-banner did before you started rebasing.",
          "Leave the messy commits recoverable in principle (do not run git gc --prune=now) so you could git reflog your way back if the cleanup went wrong.",
        ],
        technicalImplementation: [
          "Use git switch -c ferry-delay-banner main (or git checkout -b) and six separate small commits, each touching realistic files (js/delay.js, test/delay.test.js, banner.css, index.html) to reproduce the messy history described above.",
          "Run git log --oneline main..HEAD before doing anything else and write the six SHAs and messages down — this is your before-snapshot for the final diff comparison.",
          "Run git rebase -i main; in the todo list, reorder the 'fix typo' and small logic-fix lines directly beneath the real component commit and mark them fixup, reorder the 'oops forgot to add banner.css' line directly beneath the same component commit and mark it fixup too, and change the remaining two real pick lines to reword with clear final messages.",
          "If any reordering causes a conflict (likely, since 'oops forgot to add banner.css' and the component commit both touch related files), resolve it with the --continue loop from the conflict-resolution topic, or fall back to --abort and try a less aggressive reordering.",
          "After the rebase completes, run git log --oneline main..HEAD to confirm 2-3 commits remain, then run git diff main..ferry-delay-banner and compare it byte-for-byte against the before-snapshot diff to prove nothing was lost.",
        ],
        prompts: [
          {
            step: 1,
            label: 'Recreate the messy branch',
            outcome:
              "A ferry-delay-banner branch exists off main with exactly 6 commits, in this order and with these exact throwaway-style messages: 'wip', 'Add delay banner component', 'fix typo', 'oops forgot to add banner.css', 'Add delay banner tests', 'actually fix the 10-minute threshold logic' — reproducing a realistic messy afternoon of work.",
            prompt:
              "In the Tide Board repo, create a new branch called ferry-delay-banner from main. Make exactly 6 commits on it, in this exact order, each touching small, realistic files: (1) a 'wip' commit that adds an incomplete, half-written js/delay.js with a TODO comment and no tests; (2) an 'Add delay banner component' commit that finishes js/delay.js with a working (but slightly buggy) delay-banner function and adds a banner div to index.html; (3) a 'fix typo' commit that only corrects a misspelled variable name inside js/delay.js from commit 2; (4) an 'oops forgot to add banner.css' commit that adds a new banner.css file styling the banner div from commit 2, which should have shipped alongside it; (5) an 'Add delay banner tests' commit adding test/delay.test.js with a couple of passing unit tests; (6) an 'actually fix the 10-minute threshold logic' commit that fixes an off-by-one bug in the delay function from commit 2, unrelated to the typo in commit 3. Show me git log --oneline main..HEAD afterward so I can see all 6 commits in order.",
          },
          {
            step: 2,
            label: 'Map the messy commits to a clean target history',
            outcome:
              'A written plan (in a scratch note, not a commit) stating exactly how the 6 raw commits collapse into 2 or 3 final commits, in what order, with what final messages.',
            prompt:
              "Given the 6-commit history from step 1, help me plan the interactive rebase before I run it. Show me git log --oneline main..HEAD and git show for each commit's diff, then propose a mapping: which of the 6 commits should become the final commit(s), which should be fixup'd into which target, and what the final 2-3 commit messages should be. The plan should end with one commit for the working banner component (folding in the typo fix, the missing CSS, and the threshold logic fix) and one separate commit for the tests, or similar — explain your reasoning for the grouping before we touch git rebase -i.",
          },
          {
            step: 3,
            label: 'Run the interactive rebase',
            outcome:
              'git rebase -i main has been run to completion: the branch now has exactly 2 or 3 commits, reordered so each is self-contained, with clean imperative-mood messages and no placeholder words.',
            prompt:
              "Now run git rebase -i main on ferry-delay-banner. Reorder the todo list according to the plan from step 2, mark the typo-fix, missing-CSS, and threshold-logic-fix commits as fixup targeting the component commit, and reword the surviving commits to clear, imperative, single-purpose messages (e.g. 'Add delay banner component with styling' and 'Add unit tests for delay banner'). If a conflict appears during the replay, walk me through resolving it with git status, fixing the conflict markers, git add, and git rebase --continue, one conflict at a time, rather than resolving blind. Show me the final git log --oneline main..HEAD once it completes.",
          },
          {
            step: 4,
            label: 'Verify no regression',
            outcome:
              'Proof, via diff comparison, that the cleaned-up branch produces byte-for-byte identical final file content to the messy branch before rebase, plus confirmation the old commits are still reachable via reflog.',
            prompt:
              "Before I consider this done, prove the cleanup didn't change any actual code. Show me git diff main..ferry-delay-banner now, and compare it against the equivalent diff from before the rebase (use the before-snapshot SHA from step 1, e.g. git diff main..<old-tip-sha>). Confirm the two diffs are identical. Then show me git reflog and point out the entry that would let me get back to the original 6-commit branch tip if I needed to, without running git gc in the meantime.",
          },
        ],
        deliverable:
          "A ferry-delay-banner branch with exactly 2-3 commits, each with a clear imperative-mood, single-purpose message and no placeholder language ('wip', 'oops', 'fix typo') anywhere in the log. git diff main..ferry-delay-banner shows exactly the same final file content as it did before the cleanup, proving the interactive rebase only reshaped history, not the code — and the original 6-commit tip is still recoverable via git reflog as a safety net, demonstrating the branch is now something Ravi could review commit-by-commit without any archaeology.",
      },
    },
  ],
  quiz: [
    {
      id: 'm3-q1',
      q: "You rebase your local ferry-delay-banner branch onto an updated main and force-push it. Asha already has the pre-rebase branch checked out locally and has added one commit of her own on top of the old commits. She runs a plain git pull. What actually happens?",
      options: [
        'Git detects the rewritten history and automatically fast-forwards her branch to match yours, discarding her new commit with a warning.',
        'git pull fetches the new commits and, because the old and new commits have different SHAs, merges the two histories together — Asha ends up with both the old and new copies of your commits plus an extra merge commit.',
        'Git refuses to pull at all until Asha deletes her local branch and re-clones the repository.',
        'Nothing unusual happens — Git recognizes the identical diffs and silently drops the duplicates.',
      ],
      answer: 1,
    },
    {
      id: 'm3-q2',
      q: "In git rebase -i, you have a commit 'fix typo' that you want folded into the commit right above it. You mark it fixup instead of squash. What is the actual difference in the result?",
      options: [
        "fixup discards 'fix typo'’s changes entirely, keeping only the code from the commit above it.",
        'squash and fixup produce identical commits; the only difference is which keyword you type.',
        "fixup folds the changes in and discards 'fix typo'’s commit message, keeping the message of the commit above unchanged; squash folds the changes in and opens an editor to combine both messages.",
        'fixup requires you to manually re-type the combined commit message; squash does it automatically without an editor.',
      ],
      answer: 2,
    },
    {
      id: 'm3-q3',
      q: "Mid-way through git rebase main on a 4-commit branch, commit 2 of 4 conflicts. You fix the conflict, stage it, and run git rebase --continue — and commit 3 immediately conflicts too. Why does this keep happening, and how is it different from resolving one merge conflict?",
      options: [
        "It's a bug — a normal rebase should only ever pause once, the same as a merge.",
        'Rebase replays each commit onto the new base one at a time, so any of the remaining commits can conflict independently; a merge instead produces a single combined result and asks for conflict resolution only once.',
        'git rebase --continue re-applies the same conflict repeatedly until you run --skip.',
        'Conflicts during rebase always mean the branch must be abandoned with git rebase --abort.',
      ],
      answer: 1,
    },
    {
      id: 'm3-q4',
      q: 'You ran git commit --fixup=abc1234 earlier, and now run git rebase -i --autosquash main. What does --autosquash actually do here?',
      options: [
        'It skips the interactive editor entirely and rebases without stopping.',
        'It automatically resolves any conflicts the fixup commit would otherwise cause.',
        "It reorders the todo list so the fixup!-prefixed commit sits directly after abc1234 and is already marked fixup, so you don't have to move or relabel it by hand.",
        'It squashes every commit in the branch into a single commit automatically.',
      ],
      answer: 2,
    },
    {
      id: 'm3-q5',
      q: "At an edit stop during git rebase -i, you want to split the current commit into two. Git has paused with that commit already applied. What does git reset HEAD^ do here, and why does it help?",
      options: [
        'It deletes the commit’s changes permanently, so you must recreate them by hand.',
        "It moves HEAD back to the parent commit and resets the index to match it, while leaving the working directory files untouched — so the whole commit's changes reappear as unstaged edits you can stage and commit separately.",
        'It force-pushes the current state to the remote, publishing an incomplete commit.',
        'It aborts the rebase and restores the branch to its pre-rebase state.',
      ],
      answer: 1,
    },
  ],
}
