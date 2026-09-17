// Module 6 — Interactive Rebase & History Rewriting
// Git Mastery course content for the React course player.

export const m6 = {
  id: 'm6',
  title: 'Interactive Rebase & History Rewriting',
  hours: 8,
  color: 'from-rose-500/20 to-rose-700/10',
  accent: 'rose',
  description:
    'Interactive rebase is the power tool for cleaning up your commit history before pushing — squashing commits, reordering them, splitting them, or rewriting their messages. This module walks through real-world scenarios on Tide Board and teaches the recovery steps when interactive rebase goes wrong.',
  sections: [
    {
      id: 'm6-s1',
      title: 'Introduction to Interactive Rebase',
      topics: [
        {
          id: 'm6-t1',
          title: 'What Interactive Rebase Does',
          explain: 'Interactive rebase lets you stop at each commit and decide what to do with it — keep it, squash it into the previous one, reword its message, or drop it entirely.',
          analogy: 'Like going through a diary and deciding which entries to keep, which to combine, and which to delete or reword before publishing it.',
          theory: 'Interactive rebase is a more powerful form of rebase that gives you fine-grained control over which commits make it into the final history.',
          whyItMatters: 'A clean commit history makes code review easier and makes future debugging (via git log and git blame) much more pleasant.',
          steps: [
            'Create several small test commits on a practice branch.',
            'Run `git rebase -i HEAD~3` to start interactive rebase on the last 3 commits.',
            'Follow the editor prompts to squash one commit into another.',
          ],
          code: `$ git rebase -i HEAD~3\npick a1b2c3d Add ferry route\nsquash d4e5f6a Fix typo\npick 7g8h9i0 Update schedule`,
        },
      ],
    },
  ],
}
