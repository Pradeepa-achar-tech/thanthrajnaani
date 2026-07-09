// Module 1 — Development Environment
// KalaKaara (React + Supabase) course content for the React course player.

export const m1 = {
  id: 'm1',
  title: 'Development Environment',
  hours: 5,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Set up the machine and the discipline before writing a single feature: install Node the way you can maintain, configure VS Code so the editor does the boring work, learn just enough of the terminal to move, put Git and GitHub in place before there is anything to lose, then scaffold the KalaKaara React app with Vite — eleven folders, a clean lint setup, and a first pull request on a branch.',
  sections: [
    {
      id: 'm1-s1',
      title: 'Your machine, set up properly',
      topics: [
        {
          id: 'm1-t1',
          title: 'Install Node.js LTS the right way',
          explain:
            'Node.js is the runtime that your build tools, package manager, and dev server all run on — install the LTS release through a version manager so you can hold several versions and switch per project later.',
          analogy:
            'A mechanic near the Kundapura bus stand does not keep one grade of engine oil. He keeps a shelf of grades, because the old Ambassador and the new bus want different ones, and pouring the wrong grade seizes the engine. A version manager is that shelf: one machine, several Node versions, and the right one poured for each project. Install a single global Node with the plain installer and you have one drum of oil for every vehicle in town — fine until the day a client project needs a version yours cannot become.',
          theory:
            'Node.js ships in two lines at any moment: **LTS** (Long Term Support) and **Current**. Current has the newest features and the newest bugs. LTS is the even-numbered release that the Node team promises to patch for security and stability for about three years. For anything you intend to keep — a course project, a client app, a job — you want **LTS**. Current is for people who enjoy filing bug reports. Today that means a Node 20 or Node 22 LTS line; the exact number matters less than the word LTS.\n\nThe naive path is to download the installer from nodejs.org and double-click it. It works, and it is the wrong habit. It installs exactly one Node version, system-wide, and upgrading or downgrading means uninstalling and reinstalling. The moment you have two projects that disagree about the Node version — and in a real career that is week two — you are stuck.\n\nThe maintainable path is a **version manager**. On Windows, use **nvm-windows** (the `coreybutler/nvm-windows` project — note it is a separate tool from the original nvm, not the same program). On macOS and Linux, use **nvm** (`nvm-sh/nvm`). Both let you install many Node versions side by side and switch with one command. A project can even carry a `.nvmrc` file naming the version it wants, so a teammate runs `nvm use` and gets exactly your Node.\n\nAfter installing, you verify two commands. `node -v` prints the Node version. `npm -v` prints the version of **npm**, the Node Package Manager, which comes bundled with Node — you do not install it separately. If both print a version number, your toolchain exists. If `node` is "not recognised", your PATH is wrong, which on Windows almost always means you opened a terminal that was already running before the install finished — close it and open a fresh one.\n\nWhy go to this trouble on day one, before you even know you need it? Because switching Node versions is the kind of task that is trivial when you planned for it and miserable when you did not. Installing the version manager now costs ten minutes. Retrofitting one after you already have a global Node, global npm packages, and a half-broken PATH costs an afternoon.',
          whyItMatters:
            'Every professional codebase pins a Node version, and the first thing that breaks on a new machine is the version mismatch. Being able to say "I use nvm, the project has a .nvmrc, I run nvm use and I match the team" is table stakes on any real team, and it removes a whole category of "works on my machine" bug before you write any code.',
          steps: [
            'Uninstall any existing plain-installer Node first if you have one, so it cannot shadow the version manager on your PATH.',
            'Install the version manager: **nvm-windows** on Windows (download the installer from its releases page), **nvm** on macOS/Linux (the curl install line from its README).',
            'Open a brand-new terminal, then run `nvm install --lts` (nvm) or `nvm install lts` then `nvm use <version>` (nvm-windows) to get the current LTS.',
            'Verify with `node -v` and `npm -v`. Both must print a version. If `node` is not recognised, close every terminal and open a fresh one so it picks up the new PATH.',
            'Add a `.nvmrc` file containing just the version number to any project you start, so the version travels with the code.',
          ],
          code: `# --- Windows (nvm-windows) ---
nvm install lts          # download the current LTS build
nvm list                 # see what is installed
nvm use 22.11.0          # activate it (use the version nvm printed)

# --- macOS / Linux (nvm) ---
nvm install --lts        # install AND switch to current LTS
nvm alias default 'lts/*'  # make LTS the default in new shells

# --- verify on any OS ---
node -v                  # -> v22.11.0   (the runtime)
npm -v                   # -> 10.9.0     (bundled with Node, not separate)

# --- pin a project's Node so teammates match you ---
node -v > .nvmrc         # writes e.g. v22.11.0 into .nvmrc
# a teammate then runs:  nvm use   (reads .nvmrc, switches automatically)

# Sanity check that npm can reach the registry:
npm ping                 # -> Ping success`,
          pitfalls: [
            '**Installing Current instead of LTS because the number is bigger.** Bigger is not better; newer means less-tested. Fix: install the release literally labelled LTS on nodejs.org, and prefer even-numbered major versions.',
            '**Installing the plain Node installer AND a version manager.** The two fight over your PATH and you get whichever one the terminal happens to find first, unpredictably. Fix: uninstall the plain Node first, then install only the version manager.',
            '**Running `node -v` in the same terminal you had open during install and panicking when it says "not recognised".** The old terminal has a stale PATH. Fix: close it and open a new terminal — the install cannot update a shell that already started.',
            '**Confusing nvm-windows with nvm.** They are different programs with different command syntax (`nvm use 22.11.0` vs `nvm use 22`). Fix: read the README of the exact tool you installed; do not copy commands meant for the other one.',
            '**Installing global npm packages under the plain Node, then switching to nvm and wondering where they went.** Global installs are per-Node-version. Fix: install project tools locally (as devDependencies), not globally, so they live in the project and travel with it.',
          ],
          tryIt:
            'Run `nvm install lts`, then `nvm install 18` (an older LTS), then switch between them with `nvm use` and run `node -v` after each. Watch the version change on the same machine with no reinstall. That switch is the entire reason a version manager exists — you just proved it in thirty seconds.',
          takeaway:
            'Install Node LTS through a version manager (nvm-windows or nvm), verify with `node -v` and `npm -v`, and pin each project with a `.nvmrc`. You will thank yourself the first time two projects disagree.',
        },
        {
          id: 'm1-t2',
          title: 'VS Code and the five extensions that actually matter',
          explain:
            'Visual Studio Code is the editor this course uses; five extensions and two settings turn it from a text box into a tool that catches mistakes and formats code for you as you type.',
          analogy:
            'A good tailor in Udupi does not eyeball every seam. He has a chalk line, a measuring tape pinned to the table, and a machine that stops if the thread snaps. The tools catch the error before the cloth is cut. VS Code with the right extensions is that table: the crooked line shows up red under your cursor before you have sewn the whole garment, not after the customer complains.',
          theory:
            'VS Code is free, from Microsoft, and it is what the overwhelming majority of React developers use. Install it from code.visualstudio.com. Out of the box it is a competent text editor. The value is in a small, deliberate set of extensions — resist installing forty; each one is a thing that can slow the editor or conflict with another. Five earn their place for this course.\n\n**1. ESLint** (`dbaeumer.vscode-eslint`). ESLint is a **linter**: it reads your code and flags patterns that are bugs or bad practice — an unused variable, a missing `key` prop, a hook called conditionally. The extension shows those warnings inline, underlined, as you type, instead of only when you run the command in a terminal. You will configure the ESLint rules themselves in Section 3; this extension is the eyes that surface them.\n\n**2. Prettier** (`esbenp.prettier-vscode`). Prettier is an **opinionated code formatter**. It does not care about bugs; it cares about layout — indentation, quote style, trailing commas, line width. The point of Prettier is that it ends every argument about formatting by having exactly one answer. The extension lets VS Code run it, and — critically — run it automatically on save.\n\n**3. ES7+ React/Redux snippets** (`dsznajder.es7-react-js-snippets`). Typing `rafce` and pressing Tab expands into a full "React Arrow Function Component with Export". It saves you writing the same component boilerplate two hundred times. Snippets are muscle memory; learn three or four and you move noticeably faster.\n\n**4. Error Lens** (`usernamehw.errorlens`). Normally an error is a tiny squiggle you have to hover to read. Error Lens prints the error message **inline, on the same line, in colour**. You stop hovering; the problem is just there, at eye level. For a beginner this single extension shortens the feedback loop more than any other.\n\n**5. GitLens** (`eamodio.gitlens`). It supercharges the Git features already built into VS Code: hover any line and see who last changed it and why, browse history without leaving the editor, compare branches visually. You will not need all of it in Module 1, but it makes the Git you are about to learn legible.\n\nThen two settings, edited once in `settings.json` (open the command palette with Ctrl+Shift+P, type "Preferences: Open User Settings (JSON)"). **Format on save** runs Prettier every time you save a file, so you never format by hand again. **Default formatter** tells VS Code that Prettier — not some other extension — is the one true formatter, which prevents two formatters from fighting over the same file. Set these two and formatting becomes something you never think about again.',
          whyItMatters:
            'The gap between a slow beginner and a fast one is mostly feedback loop length. An editor that underlines the bug as you type, formats on save, and expands boilerplate on a keystroke removes hundreds of tiny interruptions a day. Interviewers also notice a candidate whose editor is set up like a professional workspace rather than Notepad with syntax colours.',
          steps: [
            'Install VS Code from code.visualstudio.com and open it.',
            'Open the Extensions panel (Ctrl+Shift+X) and install the five: ESLint, Prettier, ES7+ React/Redux snippets, Error Lens, GitLens.',
            'Open the command palette (Ctrl+Shift+P) → "Preferences: Open User Settings (JSON)".',
            'Add `"editor.formatOnSave": true` and set `"editor.defaultFormatter": "esbenp.prettier-vscode"`.',
            'Create a throwaway `.jsx` file, mangle its indentation, save it, and watch Prettier straighten it. Type `rafce` + Tab and watch a component appear.',
          ],
          code: `// VS Code user settings.json  (Ctrl+Shift+P -> "Open User Settings (JSON)")
{
  // Run Prettier automatically every time you save. Never hand-format again.
  "editor.formatOnSave": true,

  // Prettier is THE formatter. Naming it here stops two extensions
  // from fighting over the same file and reformatting each other's work.
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // Show ESLint's fixable problems and fix the safe ones on save too.
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },

  // A readable editor: visible whitespace guides, no surprise wrapping.
  "editor.rulers": [100],
  "files.eol": "\\n",            // one line ending everywhere (LF), not CRLF
  "editor.tabSize": 2
}

/*
The five extensions, by their marketplace ids (install these exactly):
  dbaeumer.vscode-eslint          -> inline lint warnings as you type
  esbenp.prettier-vscode          -> the formatter
  dsznajder.es7-react-js-snippets -> rafce, useState, etc.
  usernamehw.errorlens            -> prints the error ON the line
  eamodio.gitlens                 -> git blame + history inside the editor
*/`,
          pitfalls: [
            '**Installing thirty extensions in the first hour.** Each one can slow startup, and two formatters or two linters will fight and reformat each other endlessly. Fix: install these five, add more only when you feel a specific pain.',
            '**Turning on format-on-save without naming a default formatter.** VS Code then asks "which formatter?" every save, or silently picks the wrong one. Fix: set `editor.defaultFormatter` to Prettier explicitly.',
            '**Assuming the ESLint extension IS ESLint.** The extension only displays results; the actual rules come from the project config you write in Section 3, plus ESLint installed as a dependency. Fix: the extension is the window, not the engine.',
            '**Committing your personal `settings.json` into every project.** Your keybindings and theme are yours; the team should not inherit them. Fix: personal settings go in User settings; only project-shared settings (like the Prettier config file) belong in the repo.',
            '**Leaving line endings on CRLF (Windows default).** Mixed CRLF and LF makes Git show every line as changed. Fix: set `files.eol` to `\\n` and let a `.gitattributes` normalise it (covered with `.gitignore` next).',
          ],
          tryIt:
            'Turn OFF format-on-save, write a badly-indented component, and notice how much it nags you. Turn it back on and save. The difference in cognitive load is the whole argument for automation: the machine should do the work a machine can do, so your attention is free for the work only you can do.',
          takeaway:
            'Five extensions — ESLint, Prettier, React snippets, Error Lens, GitLens — plus format-on-save and a named default formatter. Configure once, then stop thinking about formatting forever.',
        },
        {
          id: 'm1-t3',
          title: 'The terminal commands you will actually use',
          explain:
            'You do not need to master the shell — you need a handful of commands to move between folders, list files, make folders, and run npm scripts, plus to know which shell you are in on Windows.',
          analogy:
            'You do not learn every road in Udupi to run errands. You learn the route to the market, the temple, and the bank, and that covers ninety percent of trips. The terminal is the same: five or six commands carry almost everything you will do for sixteen modules. The rest you look up the twice a year you need it.',
          theory:
            'The **terminal** (also called the shell, the command line, or the CLI) is a place to type commands to your computer instead of clicking. React tooling assumes you can use it — there is no "build" button, there is `npm run build`. The good news is that day-to-day web development needs a tiny vocabulary.\n\n**Moving and looking.** `pwd` prints the working directory — where you currently are. `ls` lists the files in it (on Windows PowerShell, `ls` works too, or `dir`). `cd foldername` moves into a folder; `cd ..` moves up one level; `cd` with nothing (or `cd ~`) goes home. That is the entire navigation model: know where you are, see what is there, move.\n\n**Making things.** `mkdir kalakaara` makes a folder. `cd kalakaara` moves into it. You will type this pair constantly.\n\n**Running things.** This is what you are really here for. `npm install` (or `npm i`) downloads a project\'s dependencies into `node_modules`. `npm run dev` starts the Vite development server. `npm run build` produces the production bundle. `npm run <name>` runs whatever script is defined under that name in `package.json` — you will meet `dev`, `build`, `preview`, and `lint` in Section 3. A running dev server is stopped with **Ctrl+C**; memorise that now, because a stuck server holding a port is the most common "why is it broken" moment for a beginner.\n\n**Which shell, on Windows?** This trips people up. Windows gives you several: **PowerShell** (the modern default, blue-ish), the old **Command Prompt** (`cmd`), and — if you installed Git — **Git Bash**, which speaks the same Unix syntax as macOS and Linux. For this course, prefer **Git Bash** on Windows, because every tutorial, every Stack Overflow answer, and every command in this course is written in Unix style (`ls`, `rm`, forward slashes). PowerShell mostly understands those too, but not always, and the mismatch causes confusing errors. Pick Git Bash, or use the integrated terminal inside VS Code (Ctrl+backtick) and set its default profile to Git Bash. On macOS and Linux the built-in terminal already speaks this language; there is nothing to choose.\n\nTwo quality-of-life habits: **Tab completes** file and folder names (type `cd kal` then Tab), and the **up arrow** recalls your previous command. Those two save more keystrokes than any command you will learn.',
          whyItMatters:
            'Comfort in the terminal is the difference between following a tutorial and being blocked by it. Every install, every dev server, every deploy in this course happens at the command line, and a developer who freezes at a blinking cursor cannot ship. It is a small skill with an outsized return.',
          steps: [
            'On Windows, install Git (next section) which brings Git Bash, then set VS Code\'s integrated terminal default to Git Bash. On macOS/Linux, open the built-in terminal.',
            'Practise the navigation trio: `pwd`, `ls`, `cd`. Move into a folder, list it, move back up with `cd ..`.',
            'Make and enter a folder in one habit: `mkdir practice` then `cd practice`.',
            'Learn the two accelerators: Tab to complete a name, up arrow to recall the last command.',
            'Memorise **Ctrl+C** to stop a running dev server. You will need it dozens of times.',
          ],
          code: `# The entire daily vocabulary. This is genuinely most of what you need.

pwd                 # print working directory — "where am I?"
ls                  # list files here  (PowerShell: ls or dir)
ls -la              # list ALL files incl. hidden (like .gitignore) + detail

cd kalakaara        # go into a folder
cd ..               # go up one level
cd                  # go to your home folder

mkdir components    # make a folder
mkdir -p src/pages  # make nested folders in one go (-p = make parents)

# Running the project (scripts defined in package.json, Section 3):
npm install         # download dependencies into node_modules/
npm run dev         # start the Vite dev server -> http://localhost:5173
npm run build       # produce the production bundle in dist/
npm run lint        # run ESLint over the project

# When the dev server is running, the terminal is "busy". To stop it:
#   press  Ctrl + C

# Two accelerators that save the most keystrokes:
#   Tab        completes a file/folder name   (type "cd comp" then Tab)
#   Up arrow   recalls your previous command`,
          pitfalls: [
            '**Copying Unix commands into PowerShell and hitting cryptic errors.** `rm -rf`, `touch`, and some flags differ or do not exist in PowerShell. Fix: use Git Bash on Windows so the commands from tutorials run unchanged.',
            '**Opening a second terminal to run another command while the dev server runs — then closing the wrong one and killing the server.** Fix: keep the dev server in its own dedicated terminal tab and label it in your head as "do not touch".',
            '**Forgetting the dev server is still running and wondering why a port is taken.** "Port 5173 is in use" means an old server never stopped. Fix: find the terminal running it and press Ctrl+C, or start on another port.',
            '**Typing full paths by hand and mistyping them.** Fix: use Tab completion — it is faster and it cannot misspell a folder that exists.',
            '**Running `npm install` in the wrong folder** (outside the project), which creates a stray `node_modules` and no useful result. Fix: `pwd` first; install only where `package.json` lives.',
          ],
          tryIt:
            'From your home folder, use only the terminal to: make a folder called `terminal-practice`, move into it, make two subfolders `a` and `b` in one command, list everything including hidden files, then move back up and delete the folder. If you can do that without touching the mouse, you have enough terminal for this entire course.',
          takeaway:
            'A handful of commands — `pwd`, `ls`, `cd`, `mkdir`, `npm run`, and Ctrl+C — carry almost everything. On Windows, use Git Bash so those commands match every tutorial you will ever read.',
        },
      ],
    },
    {
      id: 'm1-s2',
      title: 'Git and GitHub — version control before there is anything to version',
      topics: [
        {
          id: 'm1-t4',
          title: 'What Git actually is',
          explain:
            'Git is a version-control system that saves complete snapshots of your project over time, so you can see what changed, undo mistakes, and work with others without overwriting each other.',
          analogy:
            'Think of the seva register at a temple counter. Every entry is a full line — name, seva, date, amount — written in order, and you never erase an old line to correct a new one; you write a fresh line. Months later you can read straight down the register and reconstruct exactly what happened and when. Git is that register for your code: an append-only history of snapshots, where the past is never scribbled over, only added to.',
          theory:
            'Most beginners picture version control as "saving the differences between files". Git does not primarily think in differences — it thinks in **snapshots**. Every time you commit, Git records what every tracked file looked like *at that instant*, and gives that snapshot a unique id. It is efficient about storage (unchanged files are not duplicated), but the mental model that will keep you sane is: **a commit is a photograph of the whole project.** Your history is a sequence of photographs you can flip back to.\n\nGit organises your work into **three areas**, and understanding these three is the single thing that makes Git stop feeling like magic.\n\n**1. The working tree.** The actual files on your disk, the ones you edit. This is your desk, covered in whatever you are doing right now — some finished, some half-done, some experimental.\n\n**2. The staging area** (also called the index). A holding area where you place exactly the changes you want in your next commit. This is the step beginners find pointless and later find indispensable. You edited five files but only three of them form one coherent change? You stage those three, commit them as one clean unit, and leave the other two for the next commit.\n\n**3. The repository.** The permanent, committed history — the register with all the entries written. Once a change is committed here, it is safe and it is part of the record.\n\nThe reason `git add` exists — the question every beginner asks — is precisely to make the staging area possible. `git add` moves changes from the working tree into staging. `git commit` writes everything in staging into the repository as one snapshot. Without a staging area, every commit would have to be "all my current changes, whatever they happen to be", and you would lose the ability to assemble a commit deliberately. The staging area is what lets a commit be a *thought*, not a *timestamp*.',
          diagram: `graph LR
    subgraph WT[Working tree — your files on disk]
      F[edit files:<br/>App.jsx, tokens.css, README]
    end
    subgraph SA[Staging area — the index]
      S[the changes chosen<br/>for the NEXT commit]
    end
    subgraph RE[Repository — permanent history]
      C1[commit A] --> C2[commit B] --> C3[commit C]
    end
    F -->|git add| S
    S -->|git commit| C3
    C3 -->|git checkout / git restore| F
    S -.->|git restore --staged<br/>unstage| F`,
          flowExplain:
            'The middle box is the one beginners skip and experts rely on: `git add` fills it deliberately, `git commit` empties it into permanent history. Choosing what enters staging is how a commit becomes one clean idea instead of a dump of everything you touched.',
          whyItMatters:
            'Git is non-negotiable in professional work — every team uses it, and interviewers assume it. More practically, the three-area model is the difference between using Git with confidence and copy-pasting commands you fear. Once "working tree → staging → repository" is second nature, every Git command you meet has an obvious place in the picture.',
          steps: [
            'Install Git from git-scm.com (this also gives Windows users Git Bash). Verify with `git --version`.',
            'Set your identity once, globally: `git config --global user.name` and `user.email`. Commits are stamped with these.',
            'Fix the mental model: a commit is a snapshot of the whole project, not a diff.',
            'Name the three areas out loud — working tree, staging area, repository — and which command moves between each.',
            'Understand that `git add` exists to let you choose what goes into the next commit, rather than committing everything indiscriminately.',
          ],
          code: `# One-time setup after installing Git (git-scm.com):
git --version                              # confirm Git is installed
git config --global user.name  "Rukmini Shetty"
git config --global user.email "rukmini@example.com"
git config --global init.defaultBranch main   # name the first branch "main"

# The three areas, seen through the commands that move between them:

# 1. WORKING TREE  ->  2. STAGING AREA
git add tokens.css            # stage ONE file
git add src/                  # stage a whole folder
git add .                     # stage everything changed here and below

# 2. STAGING AREA  ->  3. REPOSITORY
git commit -m "Add design tokens"   # write staged changes as one snapshot

# See where things are at any moment:
git status                    # what is modified / staged / untracked

# Move changes back OUT of staging (without losing your edits):
git restore --staged tokens.css   # unstage: back to just "modified"

# A commit is a snapshot with a unique id. See them:
git log --oneline             # one line per snapshot, newest first`,
          pitfalls: [
            '**Thinking `git add` uploads or saves anything.** It does neither; it only stages for the next commit. Nothing leaves your machine until you push (next topics). Fix: read `add` as "select for the next snapshot".',
            '**Committing without ever running `git status`.** You commit files you did not mean to, or miss files you did. Fix: `git status` before every commit until it is a reflex; it shows exactly what will and will not be included.',
            '**Skipping the one-time `user.name` / `user.email` config.** Then every commit is attributed to nobody, and on GitHub the commits will not link to you. Fix: set both globally once, before your first commit.',
            '**Believing an old commit is gone once you make a new one.** History is append-only; earlier snapshots are still there and reachable. Fix: learn `git log` and `git checkout <id>` — the past is never lost, only left behind.',
            '**Treating the staging area as pointless overhead and always running `git add .`.** You then cannot split unrelated changes into separate commits. Fix: stage deliberately when your working tree holds two different ideas.',
          ],
          tryIt:
            'In a scratch folder run `git init`, create two files, but `git add` only one of them, then run `git status`. Observe that one file is "staged" (green) and the other is "untracked" (red). Commit, then run `git log --oneline`. You have just watched a change travel working tree → staging → repository. That journey is Git in its entirety.',
          takeaway:
            'Git stores snapshots, not diffs, across three areas: working tree, staging, repository. `git add` exists so a commit can be a deliberate idea rather than a dump of everything you happened to change.',
        },
        {
          id: 'm1-t5',
          title: 'git init and .gitignore before the first commit',
          explain:
            'You turn a folder into a repository with `git init`, and — before you ever commit — you write a `.gitignore` so that dependencies, build output, and secrets never enter the history in the first place.',
          analogy:
            'A fisherman does not haul the whole catch home. He sorts on the boat and throws back what he must not keep, right there, before it ever reaches the house. `.gitignore` is that sorting on the boat: you decide what never comes aboard the repository — the 200 MB of `node_modules`, the build output you can regenerate, and above all the `.env.local` file with your keys — so it never has to be thrown back later. And with secrets, "throwing it back later" does not even work, which is the whole point of this topic.',
          theory:
            '`git init` creates a hidden `.git` folder inside your project. That folder *is* the repository — the entire history lives there. The folder around it is now "a Git repo". Nothing is tracked yet; `git init` just makes tracking possible.\n\nBefore your very first `git add`, you write **`.gitignore`** — a plain text file listing patterns of files Git should pretend do not exist. Three categories belong in it for a Vite + React project, and the reasoning differs for each.\n\n**`node_modules/`** — the folder npm fills with dependencies. It can be hundreds of megabytes and thousands of files, and it is fully reproducible from `package.json` with `npm install`. Committing it bloats the repo, makes every clone slow, and produces enormous meaningless diffs. Ignore it; anyone can regenerate it.\n\n**`dist/`** (and other build output) — what `npm run build` generates. It is derived from your source; committing it is committing the cake instead of the recipe. Ignore it; the build regenerates it.\n\n**`.env.local`** and other env files — where you will keep configuration values. This is the category that matters most, and it deserves a hard rule: **a secret committed to Git is compromised, permanently, even if you delete it in the next commit.** Here is why, and it is the single most important paragraph in this section. Git is an append-only history. If you commit a secret key in commit A and delete it in commit B, the key is *still there in commit A forever* — anyone who clones the repo can check out commit A and read it. Deleting a file does not delete its past. So if a real secret ever lands in history, the correct response is not "delete the file and commit". The correct response is: **rotate the secret** — go to the provider, revoke the leaked key, and issue a new one — because the leaked value must be assumed public for all time. Deleting is theatre; rotating is the fix. (For KalaKaara this is somewhat softened because the Supabase `anon` key is public by design, but you will also handle values that are genuinely secret, and the habit must be correct from day one.)\n\nWriting `.gitignore` *before* the first commit is what keeps history clean from the start. Add it after `node_modules` is already committed and you have a messy cleanup on your hands. Order matters: `git init`, then `.gitignore`, then your first `git add`.',
          diagram: `graph TD
    A[git init] --> B[Write .gitignore FIRST]
    B --> C{What does each entry protect?}
    C --> D[node_modules/<br/>huge + reproducible from package.json]
    C --> E[dist/<br/>build output, regenerated by npm run build]
    C --> F[.env.local<br/>configuration and secrets]
    F --> G{A secret slipped into a commit?}
    G -->|delete the file<br/>and commit| H[WRONG:<br/>still readable in the old commit forever]
    G -->|rotate the key<br/>at the provider| I[RIGHT:<br/>leaked value is now useless]
    D --> J[git add . -> first clean commit]
    E --> J
    F --> J`,
          flowExplain:
            'Trace the right-hand branch: once a secret is in history it is public for all time, so the fix is to rotate it at the provider, not to delete the file. The left branch — delete and commit — is the reassuring mistake that leaves the key readable in the old snapshot.',
          whyItMatters:
            'Leaked credentials in public GitHub repos are one of the most common real-world security incidents, and bots scan new commits for keys within seconds. Knowing that history is permanent — and that rotation, not deletion, is the fix — is exactly the kind of judgement that separates someone who "knows Git commands" from someone you can trust with a production repo.',
          steps: [
            'Run `git init` in the project folder. Confirm the hidden `.git` folder now exists (`ls -la`).',
            'Create `.gitignore` **before** any `git add`. Add `node_modules/`, `dist/`, `.env`, `.env.local`, `.env.*.local`, `.DS_Store`, and editor folders.',
            'Run `git status` and confirm `node_modules/` does NOT appear as something to be added — proof the ignore is working.',
            'Only now make the first commit. History starts clean, with no dependencies and no env files in it.',
            'Internalise the rule: if a real secret is ever committed, rotate it at the provider immediately; do not rely on deleting it.',
          ],
          code: `# 1. Turn the folder into a repository.
git init                 # creates the hidden .git/ — the repository itself

# 2. Write .gitignore BEFORE the first 'git add'. (a Vite + React .gitignore)
cat > .gitignore <<'EOF'
# dependencies — reproducible from package.json, never commit
node_modules/

# build output — regenerated by 'npm run build'
dist/
dist-ssr/

# environment / secrets — NEVER commit these
.env
.env.local
.env.*.local

# editor and OS noise
.DS_Store
.vscode/*
!.vscode/extensions.json
*.log
EOF

# 3. Prove it works: node_modules must NOT be listed as trackable.
git status

# 4. Now — and only now — the first clean commit.
git add .
git commit -m "Initial commit: project scaffold and gitignore"

# If a REAL secret ever lands in history, deleting it is NOT enough.
# It stays readable in the old commit forever. The fix is to ROTATE:
#   -> go to the provider (e.g. Supabase), revoke the leaked key,
#      generate a new one, and put the new one in .env.local (ignored).`,
          pitfalls: [
            '**Committing `node_modules/` because you forgot `.gitignore`.** The repo balloons and every clone crawls. Fix: write `.gitignore` before the first `git add`; if it is already committed, `git rm -r --cached node_modules` then commit the removal.',
            '**Deleting a leaked key and committing the deletion, believing it is gone.** It is still in the previous commit, readable by anyone who clones. Fix: rotate the key at the provider — treat any committed secret as public forever.',
            '**Ignoring `.env` but not `.env.local`, or vice versa.** Vite reads several env filenames; miss one and it leaks. Fix: ignore the whole family — `.env`, `.env.local`, `.env.*.local`.',
            '**Adding `.gitignore` entries after the files are already tracked.** `.gitignore` only affects *untracked* files; already-committed files keep being tracked. Fix: `git rm --cached <file>` to stop tracking, then commit.',
            '**Committing `.env.local` "just temporarily to test the deploy".** There is no temporary in an append-only history. Fix: never commit it, not once; use the host\'s environment-variable settings for deploys (Module 14).',
          ],
          tryIt:
            'Create a file `secret.txt` with the line "API_KEY=hunter2", commit it, then delete the file and commit again. Now run `git log -p -- secret.txt` and watch your "deleted" secret print straight out of history. Let that land: this is precisely why the rule is *rotate, do not delete*.',
          takeaway:
            'Order is the lesson: `git init`, then `.gitignore` (node_modules, dist, .env.local), then the first commit. And a secret that reaches history must be rotated at the provider, never merely deleted — the old snapshot keeps it forever.',
        },
        {
          id: 'm1-t6',
          title: 'Commit discipline: atomic commits and readable history',
          explain:
            'A good history is made of small, self-contained commits with clear imperative messages, so that `git log`, `git diff`, and your future self can all read what happened.',
          analogy:
            'Compare two shopkeepers\' ledgers. One writes a single line at the end of the month: "stuff — ₹40,000". The other writes each transaction as it happens: "Bought 20kg rice — ₹1,200", "Sold 5 sarees — ₹6,000". When something goes wrong, the first shopkeeper is helpless and the second can point to the exact line. Atomic commits are the second ledger: each one is a single, labelled transaction you can find, understand, and if necessary undo on its own.',
          theory:
            'An **atomic commit** captures exactly one logical change — one idea — and nothing else. "Add the ArtistCard component" is atomic. "Add ArtistCard, fix a typo in the footer, rename a variable, and start the search bar" is four ideas jammed together, and it is a commit nobody can review, revert, or understand later. The discipline is: when your working tree contains two unrelated changes, stage and commit them separately (this is what the staging area is *for*).\n\nThe **message** is half the value. The convention, followed across virtually all professional projects, is the **imperative mood** — write the message as a command, as if completing the sentence "If applied, this commit will…". So "Add design tokens", not "Added design tokens" or "Adding design tokens" or "design stuff". The subject line stays under about 50 characters and does not end with a full stop. If a commit needs more explanation, leave a blank line and write a body explaining *why*, not *what* (the diff already shows what). Good messages are what make `git log` a story rather than noise.\n\nWhy imperative? Because Git itself uses it — "Merge branch", "Revert commit" — so your messages match the tool\'s own voice, and because a command reads correctly when Git quotes it back to you in logs and merges.\n\nTwo commands turn this discipline into a daily practice. **`git log --oneline`** shows one commit per line — id and subject — so you can scan the whole history of the project in seconds; this is how you read a codebase\'s story. **`git diff`** shows what has actually changed: `git diff` alone shows unstaged edits (working tree vs staging), `git diff --staged` shows what you are about to commit (staging vs last commit). Running `git diff --staged` right before you commit is the single best habit for never committing something by accident — you literally see the snapshot before you take it.\n\nHow often should you commit? Whenever you complete one coherent, working step. Not after every keystroke, and not once a day. A good rhythm is: get one small thing working, commit it, move on. Small commits are easy to write messages for (if the message is hard to write, the commit is doing too much), easy to review, and easy to undo — a bad commit that touched one thing is a one-line fix; a bad commit that touched ten things is an evening.',
          diagram: `graph TD
    A[Finished one coherent change?] --> B[git diff — review unstaged edits]
    B --> C[git add — stage just this change]
    C --> D[git diff --staged — see the exact snapshot]
    D --> E{Is this ONE idea?}
    E -->|no, two ideas| F[git restore --staged<br/>split into separate commits]
    E -->|yes| G[git commit -m 'imperative message']
    F --> C
    G --> H[git log --oneline — the story so far]
    H --> A`,
          flowExplain:
            'The loop makes the discipline mechanical: review with `git diff`, stage one idea, confirm with `git diff --staged`, and only commit when the answer to "is this one idea?" is yes. `git log --oneline` is where that discipline pays off — a readable story.',
          whyItMatters:
            'Reviewers judge you by your commit history before they judge your code, and a clean history is the difference between a pull request that gets approved and one that gets "can you split this up?". Practically, atomic commits are what make `git revert` and `git bisect` — the tools that save you when something breaks — actually usable. A history of giant mixed commits is a history you cannot debug.',
          steps: [
            'Before committing, run `git diff` to review unstaged changes, then stage only what belongs to one idea.',
            'Run `git diff --staged` to see exactly the snapshot you are about to record — no surprises.',
            'Write the message in the imperative mood, under ~50 characters, no full stop: "Add", "Fix", "Remove", "Refactor".',
            'If the staged change contains two unrelated ideas, unstage one with `git restore --staged` and commit them separately.',
            'Read your history back with `git log --oneline` and ask whether a stranger could follow the story. If not, your commits are too big or your messages too vague.',
          ],
          code: `# Review before you stage — what did I actually change?
git diff                       # working tree vs staging (unstaged edits)

# Stage ONE idea, not everything indiscriminately:
git add src/styles/tokens.css

# Confirm the exact snapshot you are about to take:
git diff --staged              # staging vs last commit = the coming commit

# Commit in the IMPERATIVE mood. Complete: "If applied, this will ___".
git commit -m "Add design tokens for colour and spacing"

# GOOD messages (imperative, specific, no full stop):
#   Add ArtistCard component
#   Fix broken import in BrowsePage
#   Remove unused Skeleton variant
#   Configure ESLint and Prettier to coexist

# BAD messages (past tense / vague / kitchen-sink):
#   added stuff
#   updates
#   fixed it finally
#   WIP asdf

# Read the story back — this is how you (and reviewers) read history:
git log --oneline
#   a1b2c3d Add design tokens for colour and spacing
#   9f8e7d6 Scaffold eleven src folders with README rules
#   3c2b1a0 Initial commit: project scaffold and gitignore

# See what a specific past commit changed:
git show 9f8e7d6`,
          pitfalls: [
            '**The kitchen-sink commit** that mixes a feature, a bug fix, and a rename. It cannot be reviewed or reverted cleanly. Fix: one idea per commit; the staging area exists precisely to let you separate them.',
            '**Vague messages like "update" or "fix".** Six weeks later `git log` is a wall of meaningless lines. Fix: name the specific change in the imperative — if you cannot name it in a short line, the commit is too big.',
            '**Past-tense or gerund messages ("Added", "Adding").** Inconsistent with Git\'s own generated messages and with team convention. Fix: imperative mood, always — "Add".',
            '**Committing without running `git diff --staged` first.** You include a stray `console.log` or a debug edit you forgot about. Fix: look at the staged diff every single time before committing.',
            '**Committing once a day in one huge blob "to be safe".** The blob is unreviewable and un-undoable. Fix: commit each small working step; frequent small commits are safer than rare large ones.',
          ],
          tryIt:
            'Take a change where you edited two unrelated files. Stage and commit them as ONE commit, look at `git log`, then undo and instead commit them as two atomic commits with imperative messages. Compare the two histories in `git log --oneline`. The second reads like a sentence; the first reads like a shrug. That difference is what reviewers see first.',
          takeaway:
            'One idea per commit, imperative messages under ~50 characters, and `git diff --staged` before every commit. `git log --oneline` should read like a story a stranger could follow.',
        },
        {
          id: 'm1-t7',
          title: 'GitHub: remotes, push, branches, and your first pull request',
          explain:
            'GitHub hosts a copy of your repository online; you connect your local repo to it with a remote, push your commits up, and collaborate through branches and pull requests instead of committing straight to main.',
          analogy:
            'Your local repo is your personal notebook; GitHub is the shared noticeboard at the panchayat office where everyone can see the agreed version. A **branch** is drafting your proposal on a separate sheet so you do not scribble over the noticeboard while you think. A **pull request** is pinning that sheet up and saying "please read this and, if it is good, add it to the official copy." Nobody edits the noticeboard directly mid-thought — they propose, others review, then it goes up. That is exactly why teams never develop on `main`.',
          theory:
            '**GitHub** is a website that hosts Git repositories. It is not Git — Git is the tool on your machine; GitHub is one of several places (GitLab, Bitbucket are others) to store a copy online, so your code is backed up, shareable, and collaboratable. The link between your local repo and the GitHub copy is called a **remote**, and by strong convention the primary remote is named **`origin`**.\n\nThe setup is three commands, done once per project. Create an empty repository on GitHub (do not let it add a README or .gitignore — you already have yours). Then `git remote add origin <url>` tells your local repo where its GitHub copy lives. Then `git push -u origin main` uploads your commits and — thanks to `-u` (set upstream) — remembers the link, so future pushes are just `git push`. The first push publishes your `main` branch; after that, `git push` and `git pull` (to fetch others\' changes) are your daily verbs.\n\nNow the part that matters for working with anyone else, ever: **branches**. A branch is a movable pointer to a line of commits. `main` is the default branch and, by convention, it holds the known-good version — the code that works. When you build a feature, you do **not** commit to `main` directly. You create a branch (`git checkout -b feature/scaffold`), do your work there in as many commits as you like, and push *that* branch. Your half-finished, possibly-broken work is isolated from `main`, which stays clean and deployable the entire time.\n\nWhen the branch is ready, you open a **pull request** (PR) on GitHub — a proposal to merge your branch into `main`. A PR is where code review happens: teammates read the diff, comment, request changes, and finally approve. Only then is the branch merged into `main`. This is the heartbeat of professional software: nobody pushes to `main`; everybody proposes changes via PRs that get reviewed.\n\nWhy never develop on `main` in a team? Because `main` is shared and is usually what gets deployed. If two people commit half-done work straight to `main`, they overwrite each other, break the build for everyone, and there is no clean version to fall back to. Branches give each person a private workspace; PRs give the team a controlled gate. Even working solo — as you are in this course — practising the branch-and-PR flow now builds the exact muscle every job will expect, and it keeps your own `main` always working.',
          diagram: `graph TD
    A[Local repo with commits] --> B[Create empty repo on GitHub]
    B --> C[git remote add origin URL]
    C --> D[git push -u origin main]
    D --> E[main is now on GitHub]
    E --> F[git checkout -b feature/scaffold]
    F --> G[commit work on the branch<br/>main stays clean]
    G --> H[git push -u origin feature/scaffold]
    H --> I[Open a Pull Request on GitHub]
    I --> J{Review}
    J -->|changes requested| G
    J -->|approved| K[Merge into main]
    K --> L[git checkout main<br/>git pull]
    L --> F`,
          flowExplain:
            'The cycle never touches `main` directly for development: you branch off it, work and push on the branch, open a PR, and only a review-approved merge updates `main`. That loop is how every team you will ever join ships code.',
          whyItMatters:
            'The branch-and-PR workflow is the single most universal practice in professional software — every team on GitHub, GitLab, or Bitbucket runs some version of it. Interviewers ask "walk me through your Git workflow" and expect exactly this answer. Learning it now, on a solo project, means you arrive at a team already fluent instead of learning it under pressure on day one.',
          steps: [
            'Create an account on github.com and a new **empty** repository (no README, no .gitignore — you have your own).',
            'Link it: `git remote add origin <your-repo-url>`, then verify with `git remote -v`.',
            'Publish main: `git push -u origin main`. The `-u` remembers the link so later pushes are just `git push`.',
            'Start a feature branch: `git checkout -b feature/scaffold`. Do your work and commit there, leaving `main` untouched.',
            'Push the branch (`git push -u origin feature/scaffold`) and open a pull request on GitHub; review the diff yourself, then merge it into `main`.',
          ],
          code: `# --- ONE-TIME: connect local repo to GitHub ---
# (First create an EMPTY repo on github.com — no README, no .gitignore.)
git remote add origin https://github.com/you/kalakaara.git
git remote -v                         # verify the 'origin' link

# Publish main. -u ("set upstream") remembers origin/main for next time.
git push -u origin main
# ...after this, pushing main is just:  git push

# --- DAILY: branch, work, propose ---
git checkout -b feature/scaffold      # create AND switch to a new branch
#   (equivalently on newer Git:  git switch -c feature/scaffold)

# ...edit files, then commit as usual, as many times as you like...
git add .
git commit -m "Scaffold eleven src folders with README rules"

# Push the branch (main is still untouched and still deployable):
git push -u origin feature/scaffold

# Now on GitHub: click "Compare & pull request", write a description,
# review the diff, and open the PR. After review/approval, merge it.

# --- After the merge, bring main up to date locally ---
git checkout main
git pull                              # fetch the merged changes
git branch -d feature/scaffold        # delete the finished local branch

# Never do this on a team:
#   git checkout main
#   ...edit, commit straight to main...   <- overwrites teammates, no review`,
          pitfalls: [
            '**Letting GitHub initialise the new repo with a README/.gitignore, then pushing your local one.** You get a "rejected — histories unrelated" conflict on the first push. Fix: create the GitHub repo empty; your local repo already has the files.',
            '**Committing straight to `main`.** On a team it overwrites others and skips review; even solo it means `main` can be broken. Fix: every change goes on a branch and merges via a PR, no exceptions.',
            '**Forgetting `-u` on the first push of a branch.** Later `git push` then errors with "no upstream branch". Fix: first push is `git push -u origin <branch>`; after that plain `git push` works.',
            '**Confusing Git with GitHub.** Git works fully offline on your machine; GitHub is just a hosting service for a copy. Fix: you can commit all day with no internet — pushing is the only step that needs GitHub.',
            '**Never pulling before starting new work.** Your `main` drifts behind the merged PRs and you branch off stale code. Fix: `git checkout main && git pull` before creating each new feature branch.',
          ],
          tryIt:
            'Push a repo to GitHub, create a branch, add one file on it, push the branch, and open a pull request — then review your own diff and merge it. Finally, `git checkout main && git pull` and watch your new file arrive on main. You have just performed the exact loop every professional team runs dozens of times a day.',
          takeaway:
            'GitHub hosts a copy via a remote named `origin`. Publish with `git push -u origin main`, then develop on branches and merge through pull requests — never straight to `main`, because `main` is the shared, working version.',
        },
      ],
    },
    {
      id: 'm1-s3',
      title: 'Scaffold the KalaKaara React app with Vite',
      topics: [
        {
          id: 'm1-t8',
          title: 'Why Vite and not Create React App',
          explain:
            'Vite is the modern tool for creating and running React apps; it starts instantly by serving your code as native modules in development, and it has replaced Create React App, which is now unmaintained.',
          analogy:
            'Create React App was the old ferry across the Sharavathi: it bundled every passenger, every vehicle, and every crate onto one boat before it would leave the jetty, so you waited while it filled. Vite is the new bridge — you drive straight across the moment you arrive, and the toll booths (the heavy processing) only appear when you are actually leaving town for good, at build time. In development you cross instantly; the bundling happens once, at the end, for the trip that matters.',
          theory:
            'For years, **Create React App (CRA)** was the default way to start a React project. It is now **deprecated and unmaintained** — the React team itself no longer recommends it, and it has fallen badly behind. Starting a new project on CRA in 2026 is choosing a dead tool. The replacement, endorsed across the ecosystem, is **Vite** (French for "quick", and it is).\n\nThe difference is architectural, and worth understanding because it explains why Vite *feels* so much faster. CRA used a **bundler** (Webpack) for everything: even in development, it would read your entire application, bundle all of it into one big JavaScript blob, and only then serve it. On a large app that meant a slow startup and a slow refresh after every edit, because the bundle had to be partly rebuilt each time.\n\nVite splits development from production, and uses the right tool for each.\n\n**In development**, Vite exploits the fact that modern browsers understand **native ES modules** (`import`/`export`) directly. So Vite does *not* bundle. It starts a dev server almost instantly and serves each file only when the browser actually asks for it. When you save a change, Vite performs **Hot Module Replacement (HMR)** — it swaps just the one changed module into the running page, often keeping your app\'s state, and the update appears in milliseconds. That instant feedback loop is the headline feature.\n\n**In production**, native modules would be too many small requests, so Vite *does* bundle — using **Rollup**, an excellent, highly-optimised bundler — to produce a small, minified, tree-shaken set of files in `dist/`. So you get the best of both: no bundling cost while you develop, full optimisation when you ship.\n\nYou create a KalaKaara app with one command: `npm create vite@latest kalakaara -- --template react`. That scaffolds a minimal React project — a handful of files, not a mountain — using the `react` template (plain JavaScript; there is also `react-ts` for TypeScript, which this course does not use). Then `npm install` to fetch dependencies and `npm run dev` to start the server. Three commands and you have a running React app.',
          diagram: `graph TD
    subgraph DEV[Development — no bundling]
      A[npm run dev] --> B[Vite dev server starts instantly]
      B --> C[Browser requests a module]
      C --> D[Vite serves it as a native ES module]
      D --> E[You save a file]
      E --> F[HMR swaps just that module<br/>update in milliseconds]
      F --> C
    end
    subgraph PROD[Production — bundled once]
      G[npm run build] --> H[Rollup bundles + minifies + tree-shakes]
      H --> I[dist/ — small optimised static files]
      I --> J[npm run preview — test the build locally]
    end`,
          flowExplain:
            'The two boxes are the whole idea: in development Vite serves unbundled modules for instant startup and millisecond HMR, and only at `npm run build` does Rollup bundle everything into an optimised `dist/`. CRA did the bundling work in both phases, which is why it felt slow.',
          whyItMatters:
            'Knowing why Vite replaced CRA — native ESM in dev, Rollup at build, and CRA being unmaintained — is a common interview question and signals that you follow the ecosystem rather than copying a stale tutorial. Practically, the fast HMR loop is the biggest single boost to your day-to-day development speed in this entire course.',
          steps: [
            'Ensure you are in the parent folder where you want the project to live (`pwd` to check).',
            'Run `npm create vite@latest kalakaara -- --template react`. Note the `--` that separates npm\'s arguments from Vite\'s.',
            'Move into the new folder: `cd kalakaara`.',
            'Install dependencies with `npm install` — this fills `node_modules/` from the generated `package.json`.',
            'Start the dev server with `npm run dev` and open the printed URL (usually http://localhost:5173). Edit `App.jsx`, save, and watch HMR update the page instantly.',
          ],
          code: `# Scaffold a React app with Vite. The bare "--" passes the flags to Vite.
npm create vite@latest kalakaara -- --template react
#   kalakaara        = folder/project name
#   --template react = plain-JS React (use react-ts for TypeScript; not here)

cd kalakaara
npm install            # fetch dependencies into node_modules/
npm run dev            # start the dev server -> http://localhost:5173

# The scripts Vite gives you (defined in package.json):
#   npm run dev        start the instant dev server with HMR
#   npm run build      bundle for production with Rollup -> dist/
#   npm run preview    serve the built dist/ locally, to test the real build
#   npm run lint       run ESLint (we harden this in a later topic)

# Why not Create React App?
#   - CRA is DEPRECATED and unmaintained; the React team dropped it.
#   - CRA bundled everything even in dev  -> slow start, slow refresh.
#   - Vite serves native ES modules in dev -> instant start, millisecond HMR,
#     and uses Rollup to bundle only at build time.`,
          pitfalls: [
            '**Starting a new project with Create React App because an old tutorial says to.** It is unmaintained and increasingly broken. Fix: use `npm create vite@latest` for every new React project.',
            '**Dropping the `--` in the create command.** Without it, `--template react` is consumed by npm instead of passed to Vite, and you get the wrong scaffold or an error. Fix: keep the bare `--` before Vite\'s own flags.',
            '**Choosing the `react-ts` template by habit.** This course is plain JavaScript; the TypeScript template adds type errors you are not equipped to read yet. Fix: use `--template react`.',
            '**Running `npm run dev` before `npm install`.** Vite errors because `node_modules` is empty. Fix: `npm install` first; the scaffold ships a `package.json`, not the dependencies themselves.',
            '**Expecting `dist/` to exist during development.** It only appears after `npm run build`; the dev server serves from memory. Fix: use `npm run dev` while developing, `npm run build` + `npm run preview` to inspect the real production output.',
          ],
          tryIt:
            'Scaffold the app, run `npm run dev`, and time how long from command to a live page — it will be a second or two. Then edit the heading in `App.jsx` and save while watching the browser: the change appears without a full reload, and any counter state survives. That is HMR, and it is the speed CRA could not match.',
          takeaway:
            'Use Vite, not the deprecated Create React App: native ES modules give an instant dev server and millisecond HMR, while Rollup bundles an optimised build only at `npm run build`. Scaffold with `npm create vite@latest kalakaara -- --template react`.',
        },
        {
          id: 'm1-t9',
          title: 'A guided tour of every generated file',
          explain:
            'The Vite scaffold is small enough to understand completely — a single HTML entry point, a JavaScript entry that mounts React, the root component, a config file, and package.json — and knowing each one removes all the mystery.',
          analogy:
            'When a new archaka joins the temple, someone walks him through the whole building once: this is the entrance, this is where the deity is, this is the storeroom, this is the register. Ten minutes, and nothing in the building is a mystery again. This topic is that walkthrough for your React project — every generated file, named and explained, so you never again wonder "what is this file and dare I touch it?"',
          theory:
            'The scaffold generates roughly a dozen files. Here is every one that matters, in the order the app actually loads them.\n\n**`index.html`** — the entry point, and there is only **one HTML file in the entire application.** This surprises people: a React app is a *single-page application*, so one HTML file serves every route. Inside it is a single meaningful line: `<div id="root"></div>`. That empty div is where your entire React app gets injected. The `#root` id matters because the next file looks for exactly that id; rename one without the other and nothing renders. Below it, `<script type="module" src="/src/main.jsx">` pulls in your JavaScript — note `type="module"`, the native-ESM mechanism Vite relies on.\n\n**`src/main.jsx`** — the JavaScript entry point, and it is tiny (about five lines). It imports React, finds the `#root` div, and calls **`createRoot(document.getElementById(\'root\')).render(<App />)`**. `createRoot` is the React 18 API that connects React to that DOM node and renders your top component into it. This is the seam between the HTML world and the React world — everything above is browser, everything below is React.\n\n**`src/App.jsx`** — the root component: the top of your component tree, the thing `main.jsx` renders. The scaffold fills it with a demo (the spinning logo and a counter). You will delete that demo in the next topic; `App` becomes where your router lives.\n\n**`vite.config.js`** — Vite\'s configuration. Out of the box it just registers the React plugin. You rarely touch it early, but this is where you would add path aliases or dev-server options later.\n\n**`package.json`** — the project\'s manifest. Two parts matter now. **`scripts`** defines the commands `npm run <name>` can run — `dev`, `build`, `preview`, `lint`. **`dependencies`** vs **`devDependencies`**: dependencies (React, ReactDOM) ship in the final app; devDependencies (Vite, ESLint, the React plugin) are only needed while building, not in the shipped bundle. There is also `package-lock.json`, auto-generated, which pins the exact version of every dependency so every machine installs identically — you commit it and never edit it by hand.\n\n**`public/` vs `src/assets/`** — two homes for static files, with a real difference. Files in **`public/`** are served **as-is** at the root URL, untouched by the build — put a `favicon.ico` or a `robots.txt` here and it is available at `/favicon.ico`. Files in **`src/assets/`** are **processed by Vite** — imported into components, hashed for caching, and optimised. Rule of thumb: if you `import` it in a component, it goes in `src/assets/`; if it must keep a stable public URL and never be transformed, it goes in `public/`.',
          diagram: `graph TD
    A[index.html<br/>the ONLY html file] --> B["div id=root — empty mount point"]
    A --> C["script type=module src=/src/main.jsx"]
    C --> D[main.jsx<br/>createRoot + render]
    D --> E["finds div#root by its id"]
    D --> F[App.jsx<br/>root component / router]
    F --> G[your components]
    H[vite.config.js<br/>plugins + config] -.configures.-> A
    I[package.json<br/>scripts + dependencies] -.defines npm run.-> D
    J[public/<br/>served as-is at /] -.static URLs.-> A
    K[src/assets/<br/>imported + processed] -.optimised.-> G`,
          flowExplain:
            'Read the top chain: the browser loads the one `index.html`, which loads `main.jsx`, which finds `div#root` by its id and renders `App` into it. That `#root` id is the single thread connecting the HTML world to the React world — break it and nothing mounts.',
          whyItMatters:
            'Beginners treat generated files as untouchable magic and are then helpless when something goes wrong in one of them. Knowing that there is exactly one HTML file, that `#root` links it to `main.jsx`, and where static assets belong turns "I do not know why nothing renders" into a five-second diagnosis. This is foundational literacy every React interviewer assumes.',
          steps: [
            'Open `index.html` and find the single `<div id="root">` and the `<script type="module">`. Confirm there is only one HTML file.',
            'Open `main.jsx` and read the `createRoot(...).render(<App />)` call — trace how it targets `#root`.',
            'Open `App.jsx` and recognise it as the demo you will replace next topic.',
            'Open `package.json` and read the `scripts` block and the split between `dependencies` and `devDependencies`.',
            'Look at both `public/` and `src/assets/` and decide, for each of a favicon and a logo you import, which folder it belongs in.',
          ],
          code: `<!-- index.html — the ONE html file for the whole app -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KalaKaara</title>
  </head>
  <body>
    <div id="root"></div>            <!-- React mounts EVERYTHING here -->
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

/* --- src/main.jsx — the JS entry point (React 18) --- */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(   // <- targets #root
  <StrictMode>
    <App />
  </StrictMode>
);

/* --- package.json (excerpt) --- */
// {
//   "scripts": {
//     "dev": "vite",            // instant dev server
//     "build": "vite build",    // Rollup bundle -> dist/
//     "preview": "vite preview", // serve the built dist/ locally
//     "lint": "eslint ."
//   },
//   "dependencies":    { "react": "...", "react-dom": "..." },  // shipped
//   "devDependencies": { "vite": "...", "@vitejs/plugin-react": "..." } // build only
// }`,
          pitfalls: [
            '**Renaming or removing `<div id="root">` without updating `main.jsx`.** `getElementById(\'root\')` then returns null and nothing renders, with a confusing console error. Fix: the id in the HTML and the id in `createRoot` must match exactly.',
            '**Looking for a second HTML file per page.** There is not one — a single-page app has one `index.html` and does routing in JavaScript. Fix: internalise "one HTML file"; routes are handled by React Router (Module 5), not separate pages.',
            '**Putting an imported image in `public/`.** Then Vite cannot hash or optimise it and your import breaks. Fix: files you `import` in components go in `src/assets/`; only untouched static files (favicon, robots.txt) go in `public/`.',
            '**Hand-editing `package-lock.json`.** It is generated; manual edits cause install inconsistencies. Fix: never edit it directly — change `package.json` and run `npm install`, which regenerates the lock.',
            '**Adding a runtime library to `devDependencies` (or vice versa).** Put React in devDependencies and the production build breaks. Fix: things the app needs at runtime are `dependencies`; build-only tools are `devDependencies`.',
          ],
          tryIt:
            'Open `index.html`, change `id="root"` to `id="app"`, save, and reload — the page goes blank and the console complains. Now change `getElementById(\'root\')` to `\'app\'` in `main.jsx` and it works again. You have just proven, with your own hands, that `#root` is the single thread tying the HTML to React.',
          takeaway:
            'The scaffold is small and knowable: one `index.html` with a `#root` div, `main.jsx` that `createRoot`s `App` into it, `package.json` scripts and dependency split, and `public/` (served as-is) vs `src/assets/` (imported and optimised).',
        },
        {
          id: 'm1-t10',
          title: 'Strip the boilerplate and scaffold the eleven folders',
          explain:
            'Delete the demo the scaffold ships, create the eleven `src/` folders from the architecture module — each with a one-line README stating its rule — add the first real files (`constants/routes.js` and `styles/tokens.css`), and install React Router.',
          analogy:
            'A family taking possession of a new house first clears the builder\'s debris — leftover tiles, cement bags, the sample paint on the wall — then marks each room for its purpose before moving a single piece of furniture in. Clearing the Vite demo and laying out the eleven folders with a README in each is exactly that: you settle what every room is *for* before you start filling them, so nothing ends up in the wrong place at midnight.',
          theory:
            'The Vite scaffold ships a demo — a spinning logo, a counter, some CSS — to prove the setup works. It has done its job; now delete it. Remove the demo markup from `App.jsx`, delete `App.css` and the demo image in `src/assets`, and empty `index.css` down to a minimal reset. `App` becomes a near-empty component that will soon hold the router. This clearing is not busywork; leftover demo code is the kind of thing that ships to production by accident.\n\nNow lay out the structure. Module 0 defined the **eleven folders** under `src/`, and the discipline is to create them *now*, before there is code to misplace, each carrying a one-line `README.md` that states its single rule. The eleven, with their rules:\n\n- **`assets/`** — static images, icons, fonts. No logic.\n- **`components/`** — reusable presentational components. Never import Supabase; never know about routes.\n- **`layouts/`** — page shells that render an `<Outlet />` (navbar + footer wrappers).\n- **`pages/`** — one component per route. Composes components and hooks; does not fetch directly.\n- **`contexts/`** — global state only. Exactly two will live here (session, favorites).\n- **`hooks/`** — data-fetching hooks. Each returns `{ data, loading, error }`.\n- **`services/`** — the ONLY folder that imports the Supabase client. Returns data or throws.\n- **`supabase/`** — the client singleton and nothing else.\n- **`utils/`** — pure functions. No React, no app imports.\n- **`constants/`** — frozen values. No magic strings anywhere else.\n- **`styles/`** — global CSS and design tokens; component styles are co-located.\n\nA one-line README in each folder settles every future "where does this go?" argument in advance, and it costs about four minutes total.\n\nThen the **first two real files**. **`constants/routes.js`** centralises every route path as a named constant, so a path like `/artists` is written once and imported everywhere — no magic strings. **`styles/tokens.css`** holds CSS custom properties (design tokens): your colours, spacing scale, and radii as `--variables`, so the whole app draws from one palette. These two files are the first bricks laid on the foundation, and both directly enforce conventions from Module 0.\n\nFinally, install the one dependency Module 1 needs: **`react-router-dom`** (v6), the library that turns those seven screens into navigable routes. `npm install react-router-dom` adds it to `dependencies`. You will wire it up in Module 5; installing it now completes the scaffold so the next module starts with routing ready.',
          diagram: `graph TD
    A[Vite scaffold with demo] --> B[Strip boilerplate:<br/>empty App.jsx, delete App.css + demo asset]
    B --> C[Create 11 folders under src/]
    C --> D[assets · components · layouts · pages · contexts]
    C --> E[hooks · services · supabase · utils · constants · styles]
    D --> F[one-line README.md in each<br/>stating its single rule]
    E --> F
    F --> G[First real files]
    G --> H[constants/routes.js<br/>every path named once]
    G --> I[styles/tokens.css<br/>colours, spacing, radii as vars]
    F --> J[npm install react-router-dom]
    J --> K[scaffold complete — Module 2 ready]`,
          flowExplain:
            'The order is the point: clear the demo first, lay all eleven folders with their README rules before any real code, then add the first two convention-enforcing files and the router dependency. Deciding what each folder is for *before* filling it is what keeps files from landing in the wrong place later.',
          whyItMatters:
            'A folder structure decided up front, with each folder\'s rule written down, is what keeps a sixteen-module codebase navigable — and it is visible discipline a reviewer or interviewer notices immediately. Doing it before there is code to move means you never pay the tax of reorganising forty files later, which is the exact tax most abandoned side projects die owing.',
          steps: [
            'Strip the demo: empty `App.jsx` to a minimal component, delete `App.css` and the demo SVG, reduce `index.css` to a reset.',
            'Create the eleven folders under `src/` (see the code block) in one command.',
            'Add a one-line `README.md` to each folder stating its single rule.',
            'Create `constants/routes.js` exporting a frozen `ROUTES` object, and `styles/tokens.css` with CSS custom properties.',
            'Install routing: `npm install react-router-dom`. Confirm it landed in `dependencies` in `package.json`.',
          ],
          code: `# 1. Create the eleven folders in one go (Git Bash / macOS / Linux):
mkdir -p src/{assets,components,layouts,pages,contexts,hooks,services,supabase,utils,constants,styles}

# 2. A one-line README rule in each folder (repeat per folder):
echo "Static images, icons, fonts. No logic." > src/assets/README.md
echo "Reusable presentational components. NEVER import Supabase." > src/components/README.md
echo "Page shells that render an <Outlet/>." > src/layouts/README.md
echo "One component per route. Composes; does not fetch." > src/pages/README.md
echo "Global state ONLY. Exactly two: session, favorites." > src/contexts/README.md
echo "Data hooks. Each returns { data, loading, error }." > src/hooks/README.md
echo "THE ONLY folder that imports the Supabase client." > src/services/README.md
echo "The Supabase client singleton and nothing else." > src/supabase/README.md
echo "Pure functions. No React, no app imports." > src/utils/README.md
echo "Frozen values. No magic strings anywhere else." > src/constants/README.md
echo "Global CSS + design tokens. Component styles are co-located." > src/styles/README.md

# 3. Install the router (used from Module 5 onward):
npm install react-router-dom`,
          pitfalls: [
            '**Leaving the Vite demo code in `App.jsx` "to look at later".** It gets forgotten and sometimes ships to production. Fix: strip it now; you can always read the demo in the Vite docs.',
            '**Creating folders lazily, one at a time as you happen to need them.** They then get named inconsistently and things land in the wrong place. Fix: create all eleven up front with their README rules, so the destinations exist before the files do.',
            '**Skipping the README-in-each-folder step as "pointless".** The one place a "where does this go?" question is cheap to answer is before the code exists. Fix: write the one-liners; they are the cheapest documentation you will ever write.',
            '**Putting route paths as raw strings throughout the app instead of in `constants/routes.js`.** A typo like `/artits` then fails silently. Fix: every path is a named constant, defined once, imported everywhere.',
            '**Installing `react-router` instead of `react-router-dom`.** The `-dom` package is the one for web apps; the bare package is the shared core. Fix: `npm install react-router-dom`.',
          ],
          tryIt:
            'After scaffolding, run `git add .` and `git status`. You should see the eleven README files and your two new real files staged, and — crucially — NOT `node_modules/` (your `.gitignore` is doing its job). Commit this as "Scaffold eleven src folders with README rules" on your feature branch. That commit is the skeleton the whole course hangs on.',
          takeaway:
            'Clear the Vite demo, then lay out all eleven `src/` folders with a one-line README rule in each before writing real code. Add `constants/routes.js` and `styles/tokens.css` as the first files, and install `react-router-dom` for the routing to come.',
        },
        {
          id: 'm1-t11',
          title: 'ESLint and Prettier configured so they never fight',
          explain:
            'ESLint catches bugs and bad patterns; Prettier formats layout; configured together with `eslint-config-prettier` they stop overlapping, run on save, and enforce the project conventions through a `CONTRIBUTING.md`.',
          analogy:
            'Two supervisors on one construction site: one checks that the building is structurally sound (the walls will not fall), the other checks that it looks neat (straight lines, even plaster). They work well together — until both start giving orders about the plaster, and the workers get contradictory instructions and down tools. `eslint-config-prettier` is the memo that says: the structural supervisor stops commenting on plaster entirely; formatting is the other one\'s job alone. Clear lanes, no arguments, work continues.',
          theory:
            '**ESLint** and **Prettier** do different jobs, and the trick is keeping them in their lanes. **ESLint** is a *linter*: it analyses code for **correctness and quality** problems — an unused variable, a React hook called conditionally, a missing dependency in `useEffect`, an undefined variable. These are potential bugs. **Prettier** is a *formatter*: it rewrites **layout** — indentation, quotes, semicolons, line width, trailing commas. It has no opinion about bugs, only about appearance.\n\nThe conflict arises because ESLint *also* historically had some formatting rules (about spacing, quotes, semicolons). When both a formatting-aware ESLint rule and Prettier have an opinion about the same thing, they fight: ESLint flags a style Prettier just produced, or they reformat each other in a loop. The fix is a small package called **`eslint-config-prettier`**. It does one thing: it **turns off every ESLint rule that concerns formatting**, ceding all layout decisions to Prettier. After adding it (last in your ESLint config, so it overrides), the division is clean — ESLint owns correctness, Prettier owns layout, and they never disagree because they no longer overlap.\n\nThe Vite React scaffold already ships an ESLint config with sensible React rules. Your job is to (1) install Prettier and `eslint-config-prettier`, (2) add `eslint-config-prettier` to the ESLint config so formatting rules are disabled, (3) add a small `.prettierrc` stating your formatting choices (single quotes, trailing commas, 100-character lines — matching this course), and (4) confirm `npm run lint` exists in `package.json` so you can lint the whole project from one command (and later, in CI). Combined with the format-on-save you set up in Section 1, the workflow becomes: you write code, Prettier formats it the instant you save, and ESLint underlines anything that might be a bug.\n\nThe final piece is **`CONTRIBUTING.md`** — a document at the repo root carrying the **six conventions** from Module 0, so that anyone (including future you) knows the rules of the codebase without reverse-engineering them. Those six: (1) `snake_case` in SQL, `camelCase` in JS, mapped at the service boundary; (2) every table has uniform `id` / `created_at` / `updated_at`; (3) booleans named as assertions with safe defaults (`is_published` defaults false); (4) every hook returns exactly `{ data, loading, error }`; (5) every service returns data or throws, never `{ data, error }` to the caller; (6) no magic strings — everything in `constants/`. ESLint and Prettier automate the conventions a machine can check; `CONTRIBUTING.md` documents the ones that need human judgement. Together they are how a codebase stays consistent across sixteen modules and, in real life, across many contributors.',
          diagram: `graph TD
    A[Your code] --> B[ESLint<br/>correctness + quality]
    A --> C[Prettier<br/>layout only]
    B --> D{Overlap on formatting?}
    C --> D
    D -->|without config| E[They FIGHT:<br/>reformat each other in a loop]
    D -->|eslint-config-prettier<br/>disables ESLint's format rules| F[Clean lanes:<br/>ESLint=bugs, Prettier=layout]
    F --> G[format on save — Prettier]
    F --> H[npm run lint — ESLint over the project]
    F --> I[CONTRIBUTING.md<br/>six conventions ESLint cannot check]`,
          flowExplain:
            'The decision diamond is the whole topic: without `eslint-config-prettier` the two tools overlap on formatting and fight; with it, ESLint\'s formatting rules switch off and each tool owns a clean lane. `CONTRIBUTING.md` covers the conventions no linter can enforce.',
          whyItMatters:
            'Every professional JavaScript project runs this exact pair, and "how do you stop ESLint and Prettier fighting?" has a specific answer — `eslint-config-prettier` — that signals real experience. Beyond interviews, an automated lint-and-format setup plus a written CONTRIBUTING.md is what keeps a codebase consistent without anyone policing it by hand, which is the only way consistency survives past week one.',
          steps: [
            'Install the tools: `npm install -D prettier eslint-config-prettier`.',
            'Add a `.prettierrc` at the repo root with your formatting choices (single quotes, trailing commas, print width 100).',
            'In the ESLint config, add `eslint-config-prettier` last so it disables every formatting-related ESLint rule.',
            'Confirm `package.json` has a `"lint": "eslint ."` script; run `npm run lint` and fix anything it reports until it is clean.',
            'Write `CONTRIBUTING.md` at the repo root listing the six conventions from Module 0, and commit it.',
          ],
          code: `# Install Prettier and the peace-keeper between it and ESLint:
npm install -D prettier eslint-config-prettier

# .prettierrc  — your formatting choices, matching this course
# {
#   "singleQuote": true,
#   "trailingComma": "all",
#   "printWidth": 100,
#   "semi": true
# }

# eslint.config.js (flat config) — add prettier LAST so it wins,
# switching off every ESLint rule that concerns formatting:
#
#   import js from '@eslint/js';
#   import react from 'eslint-plugin-react';
#   import prettier from 'eslint-config-prettier';   // <- the peace-keeper
#
#   export default [
#     js.configs.recommended,
#     react.configs.flat.recommended,
#     prettier,        // MUST be last: disables ESLint's formatting rules
#   ];

# package.json already has (or add) the lint script:
#   "scripts": { "lint": "eslint ." }

npm run lint          # lint the whole project; fix until clean

# CONTRIBUTING.md carries the six conventions ESLint cannot check:
#   1. snake_case in SQL, camelCase in JS, mapped at the service boundary
#   2. every table has id / created_at / updated_at, uniformly
#   3. booleans as assertions with safe defaults (is_published = false)
#   4. every hook returns exactly { data, loading, error }
#   5. every service returns data or THROWS, never { data, error } to callers
#   6. no magic strings — everything lives in constants/`,
          pitfalls: [
            '**Adding `eslint-config-prettier` but not putting it last in the config.** A later config block re-enables the formatting rules and the fighting resumes. Fix: it must be the final entry so its "off" switches win.',
            '**Running ESLint and Prettier with overlapping formatting rules and no bridge.** Save reformats, lint complains, you reformat, lint complains again — an infinite loop. Fix: `eslint-config-prettier` is the entire solution; install it and add it last.',
            '**Expecting ESLint to catch formatting or Prettier to catch bugs.** They are deliberately separate concerns. Fix: ESLint = correctness, Prettier = layout; do not ask either to do the other\'s job.',
            '**Skipping `CONTRIBUTING.md` because "it is a solo project".** The conventions then live only in your head and drift within weeks. Fix: write them down now; the six conventions are the shared memory of the codebase.',
            '**Installing Prettier as a normal dependency.** It is a build/dev tool, not shipped to users. Fix: install with `-D` so it lands in `devDependencies`.',
          ],
          tryIt:
            'Deliberately write a component with an unused variable AND terrible indentation, then save. Watch two different things happen: Prettier silently fixes the indentation on save, and ESLint underlines the unused variable (it does NOT touch the indentation, because `eslint-config-prettier` told it not to). Seeing each tool stay in its lane is the proof the setup is correct.',
          takeaway:
            'ESLint owns correctness, Prettier owns layout, and `eslint-config-prettier` (added last) stops them overlapping. Wire in format-on-save and `npm run lint`, and record the six human-judgement conventions in `CONTRIBUTING.md`.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm1-p1',
      type: 'Mini Project',
      title: 'A Scaffolded, Linted, Version-Controlled KalaKaara Repo',
      domain: 'Environment & Tooling',
      duration: '2 hours',
      description:
        'Turn an empty folder into a professional starting point: a Vite React app that runs, the eleven architecture folders each carrying a README rule, ESLint and Prettier configured so they never fight and reporting clean, a CONTRIBUTING.md of the six conventions, a correct .gitignore written before the first commit, and the whole thing pushed to GitHub on a feature branch with a pull request opened.',
      tools: ['Node.js', 'npm', 'Vite', 'React', 'Git', 'GitHub', 'ESLint', 'Prettier'],
      blueprint: {
        overview:
          'The deliverable is the repository every later module builds on. It contains a running Vite + React app with the demo stripped, eleven src/ folders each with a one-line README rule, constants/routes.js and styles/tokens.css as the first real files, react-router-dom installed, ESLint + Prettier reconciled with eslint-config-prettier and passing npm run lint, a CONTRIBUTING.md carrying the six conventions, and a .gitignore that was in place before the very first commit. It lives on GitHub, developed on a feature branch, proposed through a pull request — not committed straight to main.',
        functionalRequirements: [
          '**A running app.** `npm run dev` starts the Vite server and serves a clean KalaKaara page with the boilerplate demo removed.',
          '**The eleven folders.** assets, components, layouts, pages, contexts, hooks, services, supabase, utils, constants, styles — each containing a `README.md` with its one-line rule.',
          '**First real files.** `constants/routes.js` exporting a frozen ROUTES object, and `styles/tokens.css` defining colour, spacing, and radius custom properties.',
          '**Routing dependency.** `react-router-dom` installed and present in `dependencies`.',
          '**Lint and format clean.** ESLint plus Prettier plus `eslint-config-prettier`; `npm run lint` reports zero errors; format-on-save works in the editor.',
          '**CONTRIBUTING.md.** The six conventions from Module 0, stated as rules at the repo root.',
          '**Correct .gitignore before the first commit.** node_modules/, dist/, and the .env family excluded from history from commit one.',
          '**On GitHub, via a PR.** Pushed to a remote named origin, developed on a feature branch, with a pull request opened against main.',
        ],
        technicalImplementation: [
          '**Node via a version manager.** Confirm `node -v` and `npm -v`; a `.nvmrc` pins the version so the repo is reproducible.',
          '**Vite scaffold, then strip.** `npm create vite@latest kalakaara -- --template react`, then remove the demo from App.jsx, delete App.css and the demo asset, reduce index.css to a reset.',
          '**Folders + READMEs in one pass.** `mkdir -p src/{...}` for all eleven, then an `echo > README.md` per folder stating its rule.',
          '**ESLint/Prettier reconciliation.** Install `prettier` and `eslint-config-prettier` as devDependencies; add `eslint-config-prettier` last in the ESLint config; add a `.prettierrc`; ensure a `lint` script exists.',
          '**Git hygiene from commit one.** `git init`, write `.gitignore` before any `git add`, then atomic commits with imperative messages on a feature branch.',
          '**GitHub via branch + PR.** Create an empty GitHub repo, `git remote add origin`, `git push -u origin <branch>`, open the pull request — never commit to main directly.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold the Vite app and strip the boilerplate',
            outcome: 'A running KalaKaara Vite + React app with the demo removed.',
            prompt:
              'In my current folder, scaffold a React app with Vite using `npm create vite@latest kalakaara -- --template react`, then `cd kalakaara` and `npm install`. Strip the boilerplate: empty `src/App.jsx` down to a minimal component that renders a single <h1>KalaKaara</h1>, delete `src/App.css` and the demo SVG in `src/assets`, and reduce `src/index.css` to a small sensible reset (box-sizing border-box, margin 0, a system font stack). Do not add any features. Then start `npm run dev` and confirm the page renders cleanly with no demo counter or spinning logo. Explain what `main.jsx` and the `#root` div in `index.html` are doing.',
          },
          {
            step: 2,
            label: 'Create the eleven folders with README rules and the first real files',
            outcome: 'The full src/ skeleton plus constants/routes.js and styles/tokens.css.',
            prompt:
              'Create the eleven folders under `src/`: assets, components, layouts, pages, contexts, hooks, services, supabase, utils, constants, styles. In each, add a `README.md` with a single line stating its rule — for example services/ is "THE ONLY folder that imports the Supabase client", components/ is "Reusable presentational components. NEVER import Supabase", hooks/ is "Data hooks. Each returns { data, loading, error }". Then create two real files: `src/constants/routes.js` exporting a frozen ROUTES object with named paths for home (/), browse (/artists), artist detail (/artists/:slug), artwork detail (/artworks/:id), dashboard (/dashboard), favourites (/favourites), and auth callback (/auth/callback); and `src/styles/tokens.css` defining CSS custom properties on :root for a small colour palette, a spacing scale, and border radii. Finally install `react-router-dom` and confirm it is in dependencies.',
          },
          {
            step: 3,
            label: 'Configure ESLint and Prettier so they never fight',
            outcome: 'A clean `npm run lint`, format-on-save, and CONTRIBUTING.md.',
            prompt:
              'Install `prettier` and `eslint-config-prettier` as devDependencies. Add a `.prettierrc` at the repo root with singleQuote true, trailingComma "all", printWidth 100, and semi true. Update the ESLint flat config so `eslint-config-prettier` is the LAST entry, disabling every formatting-related ESLint rule so ESLint and Prettier do not overlap. Ensure `package.json` has a `"lint": "eslint ."` script, run `npm run lint`, and fix anything it reports until it is clean. Then write `CONTRIBUTING.md` at the repo root listing the six conventions from Module 0: snake_case in SQL and camelCase in JS mapped at the service boundary; uniform id/created_at/updated_at on every table; booleans as assertions with safe defaults; every hook returns { data, loading, error }; every service returns data or throws, never { data, error }; no magic strings, everything in constants/. Explain in one line why eslint-config-prettier must come last.',
          },
          {
            step: 4,
            label: 'Git init, .gitignore before the first commit, and clean history',
            outcome: 'A repository whose first commit already excludes node_modules, dist, and env files.',
            prompt:
              'Set up version control correctly. Run `git init`. BEFORE any `git add`, write a `.gitignore` for a Vite + React project that excludes `node_modules/`, `dist/`, `dist-ssr/`, `.env`, `.env.local`, `.env.*.local`, `.DS_Store`, and editor noise. Run `git status` to prove node_modules is NOT listed as trackable. Then make a small number of atomic commits with imperative messages under 50 characters — for example "Initial commit: Vite scaffold and gitignore", "Scaffold eleven src folders with README rules", "Configure ESLint and Prettier to coexist", "Add CONTRIBUTING.md with six conventions". Show me `git log --oneline` at the end. Also add a `.nvmrc` pinning the current Node version. Do not push yet.',
          },
          {
            step: 5,
            label: 'Push to GitHub on a branch and open a pull request',
            outcome: 'The repo on GitHub, developed on a feature branch, with a PR opened against main.',
            prompt:
              'Walk me through publishing this to GitHub the professional way. First, print the steps to create an EMPTY GitHub repository (no README, no .gitignore, since I already have mine). Then give the exact commands to add the remote (`git remote add origin <url>`), push main with `git push -u origin main`, create a feature branch `feature/project-scaffold` with `git checkout -b`, push it with `git push -u origin feature/project-scaffold`, and open a pull request from that branch into main. Explain, in two sentences, why development happens on a branch and merges through a pull request rather than committing straight to main, even on a solo project. Do not run the push commands until I give the go-ahead — just prepare them.',
          },
        ],
        deliverable:
          'A GitHub repository containing a running Vite + React KalaKaara app with the demo stripped, eleven src/ folders each carrying a one-line README rule, constants/routes.js and styles/tokens.css, react-router-dom installed, ESLint + Prettier configured with eslint-config-prettier and passing npm run lint, a CONTRIBUTING.md of the six conventions, a .gitignore that predates the first commit, and a feature branch with an open pull request against main. Module 2 can start from this repo with nothing left to set up.',
      },
    },
  ],
  quiz: [
    {
      id: 'm1-q1',
      q: 'Why does this course install Node.js through a version manager (nvm-windows or nvm) rather than the plain installer from nodejs.org?',
      options: [
        'The plain installer only works on Windows',
        'A version manager downloads Node faster over slow connections',
        'A version manager lets you hold several Node versions on one machine and switch per project, so two projects that need different versions never conflict',
        'The plain installer does not include npm, but the version manager does',
      ],
      answer: 2,
    },
    {
      id: 'm1-q2',
      q: 'What single package is added to make ESLint and Prettier stop fighting, and where must it go in the ESLint config?',
      options: [
        'prettier-eslint, added first so ESLint can read it',
        'eslint-config-prettier, added last so it disables every formatting-related ESLint rule',
        'eslint-plugin-prettier, which makes ESLint run Prettier as a rule',
        'No package is needed; you disable Prettier while ESLint runs',
      ],
      answer: 1,
    },
    {
      id: 'm1-q3',
      q: 'A real secret key was committed to Git, then deleted in the very next commit. Is the secret safe?',
      options: [
        'Yes — deleting the file removes it from the repository entirely',
        'Yes — as long as the repository is private on GitHub',
        'Yes — the next commit overwrites the old one, so the value is gone',
        'No — the value is still readable in the earlier commit forever, so the key must be rotated (revoked and reissued) at the provider',
      ],
      answer: 3,
    },
    {
      id: 'm1-q4',
      q: 'In the Vite scaffold, what connects the browser HTML to your React application?',
      options: [
        'The single <div id="root"> in index.html, which main.jsx targets with getElementById("root") and createRoot() renders App into',
        'A <link> tag in the <head> that imports every component',
        'One HTML file per route, each loading its own component',
        'The vite.config.js file, which injects components into the page at build time',
      ],
      answer: 0,
    },
    {
      id: 'm1-q5',
      q: 'Why does Vite feel so much faster than Create React App during development?',
      options: [
        'Vite runs entirely in the cloud instead of on your machine',
        'Vite skips ESLint checks that CRA ran on every save',
        'In development Vite serves your code as native ES modules without bundling, giving an instant start and millisecond hot module replacement, and only bundles (with Rollup) at build time',
        'Vite writes the bundle to disk while CRA kept it in memory',
      ],
      answer: 2,
    },
    {
      id: 'm1-q6',
      q: 'What is the purpose of the staging area, and why does git add exist?',
      options: [
        'The staging area uploads your changes to GitHub; git add starts the upload',
        'The staging area lets you choose exactly which changes go into the next commit, so a commit can be one deliberate idea; git add moves changes from the working tree into it',
        'The staging area is a backup of every file; git add creates the backup',
        'The staging area compresses files; git add is what compresses them',
      ],
      answer: 1,
    },
    {
      id: 'm1-q7',
      q: 'In a team, why do you develop on a branch and merge through a pull request instead of committing straight to main?',
      options: [
        'Branches make Git commands run faster than working on main',
        'GitHub charges money for commits made directly to main',
        'main can only ever hold one commit, so extra work must go elsewhere',
        'main is the shared, working version; branches isolate half-finished work and pull requests provide a review gate before anything reaches main',
      ],
      answer: 3,
    },
    {
      id: 'm1-q8',
      q: 'You import a logo image into a React component and want Vite to optimise and hash it. Which folder should it go in?',
      options: [
        'src/assets/ — files imported into components are processed and optimised by Vite, unlike public/ which is served as-is',
        'public/ — because that folder is served directly at the root URL',
        'dist/ — so it is included in the production build',
        'node_modules/ — so it is bundled with the dependencies',
      ],
      answer: 0,
    },
  ],
}
