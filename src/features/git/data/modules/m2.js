// Module 2 — Undoing & Rewriting History
// Git Mastery course content for the React course player.

export const m2 = {
  id: 'm2',
  title: 'Undoing & Rewriting History',
  hours: 7,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'Once you have commits made, you will need to undo or rewrite them. This module covers the full range of recovery tools — from the safe and reversible (`git revert`, `git reset --soft`) to the destructive but powerful (`git reset --hard`, `git rebase -i`), and how to recognize which tool fits the situation at hand.',
  sections: [
    {
      id: 'm2-s1',
      title: 'Undoing Changes',
      topics: [
        {
          id: 'm2-t1',
          title: 'git restore: Undo Working Directory Changes',
          explain: 'How to safely discard changes in your working directory without touching history.',
          analogy: 'Like erasing pencil marks from a draft page before you submit it.',
          theory: 'The `git restore` command (introduced in Git 2.23) is the modern way to discard uncommitted changes to tracked files.',
          whyItMatters: 'You will use this every day when you make a typo or go down a wrong path before committing.',
          steps: [
            'Make some test changes to a file in Tide Board.',
            'Run `git restore <file>` to undo those changes.',
            'Confirm with `git status` that the file is clean.',
          ],
          code: `$ git restore tide.html\n$ git status\nOn branch main\nnothing to commit, working tree clean`,
        },
      ],
    },
  ],
}
