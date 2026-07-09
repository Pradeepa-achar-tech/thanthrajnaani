// Module 0 — Python Essentials for GenAI, Part 1: Setup & Core Syntax
// Gets an absolute-beginner-to-Python learner ready to build "Kundapura Sahayaka":
// install Python 3.12, work inside an isolated venv, use VS Code productively, and
// write just-enough core syntax (variables, control flow, functions) to read and
// write real scripts. No AI/LLM content yet — pure Python foundations.

export const m0 = {
  id: 'm0',
  title: 'Python Essentials for GenAI, Part 1 — Setup & Core Syntax',
  hours: 6,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    'Get your machine and your head ready for GenAI work. Install **Python 3.12**, learn why every GenAI project lives in its own isolated **virtual environment**, and set up **VS Code** so it actually helps you instead of getting in the way. Then pick up just enough core Python — variables, `if`/`for`/`while`, and functions — to read and write real scripts. No AI content yet: this is the toolbench, sharpened, before we touch a single LLM.',
  sections: [
    {
      id: 'm0-s1',
      title: 'Setup & Tooling',
      topics: [
        {
          id: 'm0-t1',
          title: "Install Python 3.12 and verify it's on PATH (Windows/macOS/Linux)",
          explain:
            'Install Python 3.12 from the official source for your operating system, then confirm the command line can find it by running `python --version` (or `python3 --version`) in a fresh terminal.',
          analogy:
            'Think of the **fish market at Kundapura port** before the morning rush: before a single fish is weighed, the scale has to be plugged in and switched on, and everyone at the counter has to know where it is. Installing **Python** is plugging in that scale. Checking `python --version` in the terminal is switching it on and watching the display light up — if it does not light up, nothing you do at the counter afterwards will work.',
          theory:
            'Python is a programming language, but what you actually install is the **Python interpreter** — a program that reads `.py` files and runs them. Every GenAI library you will use later (`anthropic`, `langchain`, `streamlit`) is Python code that this interpreter executes.\n\nThis course targets **Python 3.12** — recent enough for modern typing and library support, stable enough that tutorials and packages will not fight you. Installation differs slightly by OS:\n- **Windows**: download the installer from `https://python.org/downloads`. On the first screen, **tick "Add python.exe to PATH"** — this single checkbox is the #1 source of "python is not recognised" errors when missed.\n- **macOS**: download from `python.org`, or install via Homebrew (`brew install python@3.12`) if you already use Homebrew.\n- **Linux**: most distributions ship a recent Python already; if not, use your package manager (`sudo apt install python3.12`) or `pyenv` for precise version control.\n\n**PATH** is the list of folders your terminal searches when you type a command. Installing Python is only half the job — the installer must also register its folder on PATH, otherwise typing `python` gets you "command not found" even though the files exist on disk. This is why you always verify in a **brand-new** terminal window: an already-open terminal loaded its PATH before the install happened and will not see the update.\n\nOn macOS/Linux, the command is often `python3` rather than `python` (the bare `python` may be missing, or may point at an old Python 2 left over from the OS). Get comfortable checking both.',
          whyItMatters:
            'Nothing in this course runs until `python --version` prints `Python 3.12.x` in your terminal. Every GenAI tutorial, every `pip install`, and every script you write for Kundapura Sahayaka assumes this works. Getting it right today — and knowing *why* PATH matters — saves you from re-debugging the same "not recognised" error every time you open a new project for the rest of your career.',
          steps: [
            'Go to `https://python.org/downloads` and download the Python 3.12 installer for your OS.',
            'Windows: run the installer and tick **"Add python.exe to PATH"** before clicking Install. macOS/Linux: run the installer or use your package manager.',
            'Close every terminal window that was open during installation.',
            'Open a brand-new terminal and run `python --version` (Windows) or `python3 --version` (macOS/Linux).',
            'Confirm the output reads `Python 3.12.x` — any 3.12 patch version is fine.',
            'If it says "not recognised" or shows an old version, reinstall with PATH enabled, or fix PATH manually, then reopen the terminal and check again.',
          ],
          code: `# In a brand-new terminal, check the interpreter is installed and on PATH:
python --version
# -> Python 3.12.4

# On macOS/Linux the command is often python3, not python:
python3 --version
# -> Python 3.12.4

# Prove the interpreter can actually run code:
python -c "print('Kundapura Sahayaka toolbench ready')"
# -> Kundapura Sahayaka toolbench ready`,
          pitfalls: [
            '**Skipping "Add python.exe to PATH" on Windows.** This is the single most common setup failure. Fix: reinstall and tick the box, or add the Python install folder to PATH manually.',
            '**Checking the version in the terminal you had open during install.** It still has the old PATH cached. Fix: always open a fresh terminal after installing.',
            '**Assuming `python` and `python3` are the same command.** On macOS/Linux, bare `python` may not exist or may be an ancient Python 2. Fix: try `python3` if `python` fails.',
            '**Installing from a random mirror or blog link.** Risk of a stale or tampered build. Fix: only download from `python.org` or a trusted package manager.',
            '**Having two Python installs fighting on PATH** (e.g. an old Anaconda Python ahead of the new one). `python --version` shows an unexpected number. Fix: check `where python` (Windows) / `which python3` (macOS/Linux) to see which install is actually being used.',
            '**Installing a much older or a pre-release Python.** Some GenAI packages lag on brand-new versions and fail on very old ones. Fix: stick to 3.12 for this course.',
          ],
          tryIt:
            'Open a terminal and run `python --version` (or `python3 --version`). Then run `python -c "print(2 + 2)"` and confirm it prints `4` — proof the interpreter both exists and executes code.',
          takeaway:
            'Installing Python means installing an interpreter AND getting it on PATH — verify both together with `python --version` in a fresh terminal before doing anything else.',
        },
        {
          id: 'm0-t2',
          title: 'Virtual environments with venv — why every GenAI project needs its own isolated Python',
          explain:
            'Create an isolated **virtual environment** (`venv`) per project so each project gets its own private set of installed packages, instead of one global pile that different projects fight over.',
          analogy:
            'Imagine every stall at the **Kundapura fish market** shared one single weighing scale and one single knife. The moment one stall recalibrates the scale for prawns, every other stall\'s fish weighs wrong. A **virtual environment** gives each stall its *own* scale and knife — recalibrate or sharpen freely, and no other stall notices. Each GenAI project gets its own private toolset the same way.',
          theory:
            'When you `pip install` a package without any special setup, it installs **globally** — into the one Python your whole computer shares. That is fine for a single toy script. It breaks down the moment you have two projects: Project A needs `langchain==0.1` and Project B needs `langchain==0.3`, and a global install can only hold one version at a time. Upgrade for B and you silently break A.\n\nA **virtual environment** (venv) solves this by giving each project a private, isolated copy of the Python package folder. Packages installed inside a venv are invisible to every other venv and to the global Python. Python 3.12 includes this tooling built in — no extra install needed — via the `venv` module.\n\nThe workflow, once per project:\n- **Create** it: `python -m venv .venv` creates a folder named `.venv` holding a private interpreter and package space.\n- **Activate** it: this temporarily rewires your terminal\'s PATH so `python` and `pip` point at the venv\'s copies instead of the global ones. Windows: `.venv\\Scripts\\activate`. macOS/Linux: `source .venv/bin/activate`. Your prompt changes to show `(.venv)` when it worked.\n- **Use it**: every `pip install` while activated lands only inside `.venv`.\n- **Deactivate** it when done: just run `deactivate`.\n\nA `.venv` folder is disposable and machine-specific — it is never committed to git (add it to `.gitignore`). Anyone else recreates it from a `requirements.txt` (next topic) with one command.',
          whyItMatters:
            'Every real Python project — and every GenAI project in this course — starts with "make a venv" before "pip install anything". Skipping this is the #1 reason beginners get mysterious "it worked yesterday" bugs when package versions silently drift between projects. For Kundapura Sahayaka, its own `.venv` keeps its exact `anthropic`/`langchain`/`streamlit` versions frozen and separate from anything else on your machine.',
          steps: [
            'Open a terminal inside your project folder (e.g. `kundapura-sahayaka/`).',
            'Create the venv: `python -m venv .venv`.',
            'Activate it — Windows: `.venv\\Scripts\\activate`; macOS/Linux: `source .venv/bin/activate`.',
            'Confirm the prompt now shows `(.venv)` at the start of the line.',
            'Run `python -m pip install --upgrade pip` to make sure the venv\'s own pip is current.',
            'Add `.venv/` to a `.gitignore` file so it is never committed.',
          ],
          code: `# Inside your project folder:
python -m venv .venv

# Activate — Windows (PowerShell or cmd):
.venv\\Scripts\\activate

# Activate — macOS/Linux:
source .venv/bin/activate

# Your prompt now shows the venv is active:
(.venv) $ python --version
Python 3.12.4

# Confirm this Python is the venv's private copy, not the global one:
(.venv) $ python -c "import sys; print(sys.executable)"
# -> .../kundapura-sahayaka/.venv/bin/python  (or ...\\.venv\\Scripts\\python.exe on Windows)

# When finished for the session:
deactivate`,
          pitfalls: [
            '**Installing packages globally "just this once".** It quietly becomes a habit and every project drifts. Fix: always create and activate a venv first, every project, no exceptions.',
            '**Forgetting to activate before `pip install`.** Packages land globally instead of in `.venv`. Fix: check for `(.venv)` in your prompt before installing anything.',
            '**Committing the `.venv/` folder to git.** It is huge, machine-specific, and unnecessary. Fix: add `.venv/` to `.gitignore` immediately.',
            '**Opening a new terminal tab and expecting the venv to still be active.** Activation is per-terminal-session. Fix: reactivate (`source .venv/bin/activate`) in every new terminal.',
            '**Deleting the project folder without deactivating first.** Usually harmless, but the "ghost" `(.venv)` prompt can confuse you afterward. Fix: `deactivate` before switching projects.',
            '**Assuming `venv` needs a separate install.** It ships inside Python 3.12 as a built-in module. Fix: just run `python -m venv .venv` — nothing extra to install.',
          ],
          tryIt:
            'Create a folder `kundapura-sahayaka`, make a venv inside it with `python -m venv .venv`, activate it, and run `python -c "import sys; print(sys.executable)"` — confirm the printed path points inside your `.venv` folder, not a system-wide location.',
          takeaway:
            'A venv gives each project its own private, isolated set of installed packages — create one per project with `python -m venv .venv` before installing anything.',
        },
        {
          id: 'm0-t3',
          title: 'VS Code setup: Python extension, selecting the venv interpreter, integrated terminal',
          explain:
            'Install VS Code and the official Python extension, then explicitly point VS Code at your project\'s `.venv` interpreter so autocomplete, linting, and the built-in terminal all use the right isolated environment.',
          analogy:
            'Setting up VS Code without picking your venv is like a new stall-hand at the fish market picking up *any* scale lying around — maybe theirs, maybe the neighbour\'s — and weighing fish on it without checking. Selecting the venv interpreter in VS Code is that stall-hand deliberately walking over to *your* scale, the one calibrated for your stall, before weighing a single fish.',
          theory:
            '**VS Code** is a free, lightweight code editor and the standard choice for Python work. On its own it knows nothing about Python — the **Python extension** (by Microsoft, search "Python" in the Extensions panel, `Ctrl+Shift+X`) adds syntax highlighting, autocomplete, inline error checking, and the ability to run/debug scripts.\n\nThe critical step beginners miss: VS Code does not automatically know *which* Python to use, especially once you have a project-local `.venv`. You must explicitly **select the interpreter**:\n- Open the Command Palette (`Ctrl+Shift+P`), type "Python: Select Interpreter", and choose the one located inside your project\'s `.venv` folder (it is usually listed as "Recommended" once VS Code detects it, showing a path like `.venv\\Scripts\\python.exe` or `.venv/bin/python`).\n- Once selected, VS Code shows the interpreter name in the bottom status bar — always glance there to confirm you are pointed at the right venv before writing code.\n\nWith the correct interpreter selected, VS Code\'s **integrated terminal** (`` Ctrl+` ``) will usually auto-activate the venv for you when it opens a new terminal tab — you will see `(.venv)` appear in the prompt automatically. This is a huge convenience: one terminal, right inside your editor, already pointed at the right isolated Python, ready for `pip install` or running scripts.\n\nIf autocomplete suggests the wrong package versions, or "import anthropic could not be resolved" appears even after installing it, the near-universal cause is: VS Code is pointed at the *wrong* interpreter (often the global Python, not your venv).',
          whyItMatters:
            'A misconfigured interpreter is the single most common source of "but I installed it!" confusion for beginners — the package is there, just in the wrong Python. Getting VS Code correctly wired to your venv today means every script you write for Kundapura Sahayaka gets accurate autocomplete and error-checking, and every terminal command you run inside the editor uses the right isolated packages automatically.',
          steps: [
            'Download and install VS Code from `https://code.visualstudio.com`.',
            'Open the Extensions panel (`Ctrl+Shift+X`) and install **Python** (by Microsoft).',
            'Open your project folder in VS Code (`File > Open Folder`) — the one containing `.venv`.',
            'Open the Command Palette (`Ctrl+Shift+P`), run "Python: Select Interpreter", and choose the `.venv` entry.',
            'Confirm the bottom status bar shows the `.venv` interpreter, not a global Python.',
            'Open the integrated terminal (`` Ctrl+` ``) and confirm the prompt shows `(.venv)` automatically.',
          ],
          code: `# .vscode/settings.json — pins the interpreter for anyone opening this project
{
  "python.defaultInterpreterPath": "\${workspaceFolder}/.venv/bin/python",
  "python.terminal.activateEnvironment": true
}

# On Windows the venv python path instead looks like:
# "\${workspaceFolder}/.venv/Scripts/python.exe"

# Quick sanity check inside the VS Code integrated terminal:
(.venv) $ python -c "import sys; print(sys.executable)"
# -> should print a path INSIDE your project's .venv folder`,
          pitfalls: [
            '**Never running "Python: Select Interpreter" at all.** VS Code silently falls back to whatever global Python it finds. Fix: always explicitly select the `.venv` interpreter per project.',
            '**Installing a package in a plain terminal, but VS Code still shows red squiggles under the import.** Different interpreters are in use. Fix: check the status bar and reselect the `.venv` interpreter.',
            '**Opening a new integrated terminal and seeing no `(.venv)` prefix.** The interpreter is not set correctly, or `activateEnvironment` is off. Fix: reselect the interpreter, then open a fresh terminal tab.',
            '**Installing random unrelated extensions before the basics work.** Startup slows and conflicting linters confuse error messages. Fix: start with just the Python extension.',
            '**Opening a single file instead of the project folder.** VS Code cannot reliably detect the local `.venv`. Fix: always use `File > Open Folder` on the project root.',
            '**Assuming the interpreter choice is global for all projects.** Each project/workspace needs its own selection. Fix: reselect the interpreter whenever you open a different project.',
          ],
          tryIt:
            'With your `kundapura-sahayaka` folder open in VS Code and the `.venv` interpreter selected, create a file `hello.py` with `print("VS Code is pointed at the right Python")`, run it with the editor\'s Run button, and confirm the message appears in the integrated terminal with `(.venv)` visible.',
          takeaway:
            'VS Code needs the Python extension AND an explicit "Select Interpreter" pointed at your `.venv` — check the status bar every time you open a project.',
        },
        {
          id: 'm0-t4',
          title: 'pip, requirements.txt, and installing your first packages',
          explain:
            'Use `pip`, Python\'s package installer, to add third-party libraries into your activated venv, and record the exact set in a `requirements.txt` file so the environment is reproducible on any machine.',
          analogy:
            'A `requirements.txt` is the fish market stall\'s **standing supply order** pinned to the counter: exactly which nets, how many crates of ice, which brand of scale paper — written down so that if a new stall-hand takes over tomorrow, they order the *exact* same supplies without guessing. `pip install -r requirements.txt` is handing that order sheet to the supplier and saying "bring me precisely this."',
          theory:
            '**`pip`** is Python\'s package installer — it downloads libraries from the Python Package Index (PyPI) and installs them into whichever Python is currently active. With your venv activated, `pip install <package>` installs *only* into that venv.\n\nBasic commands:\n- `pip install requests` — installs the latest version of one package.\n- `pip install requests==2.31.0` — installs an exact pinned version.\n- `pip list` — shows every package currently installed in the active environment.\n- `pip show requests` — shows details (version, location) of one installed package.\n- `pip uninstall requests` — removes a package.\n\nA **`requirements.txt`** file lists the packages (and usually exact versions) a project needs, one per line. It exists so that *anyone* — a teammate, a different computer, or future-you six months from now — can recreate the exact same environment with one command:\n```\npip install -r requirements.txt\n```\nYou generate a starting `requirements.txt` in two common ways: hand-write it as you go (clearest for a course project, since you add one line per package you deliberately chose), or snapshot everything currently installed with `pip freeze > requirements.txt`. For this course, hand-writing is preferred early on — it keeps the file meaningful and readable rather than a huge auto-generated dump.\n\nFor Kundapura Sahayaka you will progressively add: `python-dotenv` (loads secret API keys from a `.env` file, Module 2+), `requests` (HTTP calls), and later `anthropic`, `langchain`, `faiss-cpu`/`chromadb`, `streamlit`. Each module\'s project will tell you exactly what to add.',
          whyItMatters:
            'Every real Python project ships a `requirements.txt` (or the newer `pyproject.toml` equivalent) — it is how a project\'s dependencies travel with it. For this course specifically, a clean `requirements.txt` means when you revisit an earlier module\'s code, or share Kundapura Sahayaka with someone else, the environment recreates exactly, instead of you trying to remember which packages you happened to install months ago.',
          steps: [
            'With your venv activated, install a package: `pip install python-dotenv`.',
            'Install a second package: `pip install requests`.',
            'Run `pip list` and confirm both appear.',
            'Create a `requirements.txt` file and add one line per package, e.g. `python-dotenv` and `requests`.',
            'Delete and recreate your venv, then run `pip install -r requirements.txt` to prove the file reproduces the environment.',
            'Confirm `pip list` again shows the same packages after reinstalling from the file.',
          ],
          code: `# With (.venv) active, install two packages:
pip install python-dotenv
pip install requests

# See everything currently installed in this venv:
pip list
# Package         Version
# --------------- -------
# python-dotenv   1.0.1
# requests        2.32.3
# ...

# requirements.txt — hand-written, one package per line:
python-dotenv
requests

# Anyone (or future you) recreates the exact environment with:
pip install -r requirements.txt`,
          pitfalls: [
            '**Running `pip install` with the venv NOT activated.** The package lands globally instead of in your project. Fix: always confirm `(.venv)` is showing first.',
            '**Never writing a `requirements.txt`.** The project becomes unreproducible — nobody (including future you) knows what to install. Fix: add a line every time you deliberately install something new.',
            '**Blindly running `pip freeze > requirements.txt`.** It captures every transitive sub-dependency too, producing a huge, hard-to-read file. Fix: for this course, hand-write the direct packages you actually chose.',
            '**Installing a package but forgetting to add it to `requirements.txt`.** It works on your machine but breaks for anyone recreating the environment. Fix: treat "pip install" and "add to requirements.txt" as one combined step.',
            '**Confusing `pip install <package>` with `pip install -r requirements.txt`.** The first installs one thing; the second installs everything listed in the file. Fix: use `-r` specifically to install *from* a file.',
            '**Committing `.venv/` instead of `requirements.txt`.** The folder is huge and machine-specific; the text file is small and portable. Fix: commit `requirements.txt`, gitignore `.venv/`.',
          ],
          tryIt:
            'In your activated `.venv`, install `python-dotenv` and `requests`, write a `requirements.txt` listing both, then run `pip uninstall -y python-dotenv requests` followed by `pip install -r requirements.txt` — confirm `pip list` shows both packages back.',
          takeaway:
            '`pip install <package>` adds a library to your active venv; `requirements.txt` records exactly which packages a project needs so the environment can be recreated anywhere with `pip install -r requirements.txt`.',
        },
      ],
    },
    {
      id: 'm0-s2',
      title: 'Core Syntax & Control Flow',
      topics: [
        {
          id: 'm0-t5',
          title: 'Variables, basic types, and f-strings',
          explain:
            'Store values in variables with `=`, learn Python\'s core built-in types (`str`, `int`, `float`, `bool`), and format readable output with f-strings.',
          analogy:
            'A **variable** is a labelled basket at the fish market counter: you write "prawns" on one basket and "kane fish" on another, and from then on you refer to the basket by its label instead of describing the contents every time. Python does not care what is in the basket right now — swap prawns for crab tomorrow and the label still works.',
          theory:
            'A **variable** is a name bound to a value using `=`:\n```python\nseva_name = "Maha Pooja"\nprice = 250\n```\nUnlike some languages, Python does not require you to declare a type up front — the type is attached to the *value*, and Python figures it out automatically. This is called **dynamic typing**. You can always check a value\'s type with `type(x)`.\n\nThe everyday built-in types:\n- **`str`** — text, written in quotes: `"Kundapura"` or `\'Kundapura\'` (either works; pick one style and stay consistent).\n- **`int`** — whole numbers: `250`, `-3`.\n- **`float`** — decimal numbers: `3.14`, `250.0`.\n- **`bool`** — `True` or `False` (capitalised, unlike JavaScript).\n\nVariable names are case-sensitive, cannot start with a digit, and by convention use `snake_case` (`seva_name`, not `sevaName` or `SevaName` — that is a style borrowed from other languages, not idiomatic Python).\n\n**f-strings** (formatted string literals) are the modern, preferred way to build strings from variables. Prefix the string with `f` and place any expression inside `{ }`:\n```python\nname = "Neer Dosa"\nprice = 60\nprint(f"{name} costs ₹{price}")\n# -> Neer Dosa costs ₹60\n```\nf-strings can hold any expression, not just a bare variable — `f"{price * 2}"`, `f"{name.upper()}"` — and support formatting specs like `f"{price:.2f}"` for two decimal places. They read far more clearly than older `%`-formatting or `.format()` calls, and are what you will use throughout this entire course.',
          whyItMatters:
            'Variables and f-strings are the absolute bedrock — every script you write from here on, including the very first Kundapura Sahayaka print statements, leans on them constantly. Getting comfortable with Python\'s dynamic typing and f-string syntax now means you read and write real code fluently instead of hesitating over basic syntax later, when your attention needs to be on GenAI logic.',
          steps: [
            'Assign a `str`, an `int`, a `float`, and a `bool` to four differently named variables.',
            'Print each variable\'s value and its `type()`.',
            'Build a sentence using an f-string that embeds two or more variables.',
            'Try a small expression inside an f-string, e.g. `f"{price * 2}"`.',
            'Reassign one variable to a different type and confirm Python allows it without complaint.',
            'Rename a variable to a bad name (e.g. starting with a digit) and read the `SyntaxError`.',
          ],
          code: `# Variables — Python infers the type from the value:
seva_name = "Maha Pooja"   # str
price = 250                # int
duration_hours = 1.5       # float
is_available = True        # bool

print(type(seva_name))     # <class 'str'>
print(type(price))         # <class 'int'>

# f-strings — the clear, modern way to build text from variables:
print(f"{seva_name} takes {duration_hours} hours and costs ₹{price}")
# -> Maha Pooja takes 1.5 hours and costs ₹250

# f-strings can hold expressions, not just bare variables:
print(f"Double price: ₹{price * 2}")
# -> Double price: ₹500

# Dynamic typing: the SAME variable can be reassigned to a different type
seva_name = 42   # allowed, just usually a bad idea for readability
print(type(seva_name))  # <class 'int'>`,
          pitfalls: [
            '**Forgetting the `f` prefix.** `"{price}"` prints the literal text `{price}`, not the value. Fix: always write `f"{price}"`.',
            '**Mixing up `=` (assignment) and `==` (comparison).** `if price = 250:` is a `SyntaxError`. Fix: use `=` to assign, `==` to compare.',
            '**Using `True`/`False` lowercase.** Python requires capitalised `True`/`False`, unlike JavaScript\'s `true`/`false`. Fix: capitalise booleans.',
            '**Naming variables in camelCase out of habit.** It works, but is not idiomatic Python. Fix: use `snake_case` for variables and functions.',
            '**Concatenating with `+` across mismatched types**, e.g. `"Price: " + 250` raises `TypeError`. Fix: use an f-string instead — it converts automatically.',
            '**Reassigning a variable to a wildly different type mid-script "because Python allows it".** It works but confuses readers. Fix: keep a variable\'s type consistent by convention even though the language does not force it.',
          ],
          tryIt:
            'Create variables for a dish name, its price, and whether it is spicy (`bool`), then print one f-string sentence combining all three, e.g. "Kane Fish Curry costs ₹180 and is spicy: True".',
          takeaway:
            'Variables bind names to values with dynamic typing built in, and f-strings (`f"{...}"`) are the clean, modern way to weave those values into readable output.',
        },
        {
          id: 'm0-t6',
          title: '`if` / `elif` / `else` and boolean/comparison logic',
          explain:
            'Branch your program\'s behaviour with `if` / `elif` / `else`, driven by comparison operators (`==`, `!=`, `<`, `>`) and boolean logic (`and`, `or`, `not`).',
          analogy:
            'Picture the ferry counter at **Gangolli** during monsoon season: the ticket clerk checks conditions in order — "if the river is flooded, no crossing today; otherwise if it is past 6pm, last ferry only; otherwise, normal service." Each check happens only if the ones before it did not already apply. That ordered, one-branch-wins logic is exactly `if` / `elif` / `else`.',
          theory:
            'An **`if`** statement runs a block of code only when a condition is `True`:\n```python\nif temperature > 35:\n    print("Very hot")\n```\nNotice there are no curly braces — Python uses **indentation** (consistently 4 spaces) to mark what belongs inside the block. This is not just a style choice; incorrect indentation is a real syntax error in Python.\n\nChain further conditions with **`elif`** (else-if) and a final catch-all **`else`**:\n```python\nif hour < 6:\n    status = "closed"\nelif hour < 20:\n    status = "open"\nelse:\n    status = "closed"\n```\nOnly the *first* matching branch runs — once one condition is `True`, the rest are skipped entirely, even if they would also technically be true.\n\n**Comparison operators** produce a `bool`: `==` (equal), `!=` (not equal), `<`, `>`, `<=`, `>=`. Note `==` for comparison versus a single `=` for assignment — mixing these up is one of the most common beginner errors.\n\n**Boolean logic** combines conditions:\n- `and` — both sides must be `True`.\n- `or` — at least one side must be `True`.\n- `not` — flips `True`/`False`.\n```python\nif is_monsoon and river_level > 5:\n    print("Ferry suspended")\n```\nPython also treats several "falsy" values as `False` in an `if` without needing an explicit comparison: `0`, `0.0`, `""` (empty string), `[]` (empty list), and `None`. Everything else is "truthy". So `if items:` is a common, idiomatic way to check "is this list non-empty" instead of writing `if len(items) > 0:`.',
          whyItMatters:
            'Branching logic is how a program makes decisions — from "is this API key present" to "did the user\'s question match a known topic" later in the course, every meaningful script needs `if`/`elif`/`else`. Kundapura Sahayaka will soon need to decide things like "is this a recipe question or a seva-timing question" — that decision is built from exactly this pattern.',
          steps: [
            'Write a single `if` that prints a message when a number exceeds a threshold.',
            'Add an `elif` branch for a middle case and an `else` for everything else.',
            'Write three comparisons using `==`, `<`, and `>=` and print each `bool` result.',
            'Combine two conditions with `and`, then with `or`, and observe the difference.',
            'Use `not` to flip a boolean and confirm the branch that runs changes.',
            'Test a "falsy" value directly in an `if` (e.g. an empty string) without an explicit `== ""` comparison.',
          ],
          code: `hour = 21  # 24-hour time, e.g. checking if Kundapura Sahayaka should mention "seva closed"

if hour < 6:
    status = "closed (too early)"
elif hour < 20:
    status = "open"
else:
    status = "closed (past evening seva)"

print(status)  # -> closed (past evening seva)

# Comparison operators return a bool:
print(5 == 5)   # True
print(5 != 3)   # True
print(3 > 10)   # False

# Boolean logic combining conditions:
is_monsoon = True
river_level = 6
if is_monsoon and river_level > 5:
    print("Ferry to Gangolli suspended")

# "Falsy" values work directly in an if, no explicit comparison needed:
recipe_notes = ""
if not recipe_notes:
    print("No recipe notes yet — add some!")`,
          pitfalls: [
            '**Using `=` instead of `==` inside a condition.** Python raises a `SyntaxError` for `if x = 5:` — unlike some languages this cannot silently pass. Fix: use `==` to compare.',
            '**Inconsistent indentation** (mixing tabs and spaces, or uneven spacing) causes an `IndentationError`. Fix: use 4 spaces consistently; let VS Code\'s Python extension auto-indent for you.',
            '**Writing a long chain of separate `if` statements instead of `elif`.** Every `if` is checked independently, so more than one branch can run. Fix: use `elif` when only one branch should ever fire.',
            '**Forgetting the colon `:`** at the end of `if`/`elif`/`else` lines. Fix: every block-opening line ends with `:`.',
            '**Comparing floats with `==` for exact equality.** Floating-point rounding can make `0.1 + 0.2 == 0.3` return `False`. Fix: for float comparisons, check the difference is within a small tolerance instead.',
            '**Overusing explicit `== True` / `== False`.** `if is_available == True:` is redundant and non-idiomatic. Fix: just write `if is_available:` or `if not is_available:`.',
          ],
          tryIt:
            'Write a small script that checks a variable `river_level` against three tiers ("normal", "watch", "flooded") using `if`/`elif`/`else`, and prints the ferry status accordingly for at least two different values you test by hand.',
          takeaway:
            '`if`/`elif`/`else` branches on `bool` conditions built from comparisons (`==`, `<`, `>`) and boolean logic (`and`, `or`, `not`); Python uses indentation, not braces, to mark each block.',
        },
        {
          id: 'm0-t7',
          title: '`for` and `while` loops, `range()`, and looping over lists',
          explain:
            'Repeat work with `for` loops (iterating over a list or a `range()` of numbers) and `while` loops (repeating as long as a condition holds).',
          analogy:
            'A `for` loop is like a temple **prasadam counter** working through a known stack of plates — you serve exactly as many people as there are plates, one by one, and stop naturally when the stack runs out. A `while` loop is more like the counter staying open "as long as there is still a queue" — it keeps serving without knowing in advance how many people will show up, only stopping once the queue condition becomes false.',
          theory:
            'A **`for` loop** iterates over the items of a sequence — a list, a string, or a range of numbers — running the block once per item:\n```python\ndishes = ["Neer Dosa", "Kori Rotti", "Kane Fish Curry"]\nfor dish in dishes:\n    print(dish)\n```\nEach pass, `dish` is bound to the next item in the list, in order.\n\n**`range()`** generates a sequence of numbers, most often used to loop a fixed number of times or to index into a list:\n```python\nfor i in range(5):       # 0, 1, 2, 3, 4  (stops before 5)\n    print(i)\n\nfor i in range(2, 8):    # 2, 3, 4, 5, 6, 7\n    print(i)\n```\n`range(stop)` starts at 0; `range(start, stop)` gives an explicit start. In both cases the `stop` value itself is **never included**.\n\nA **`while` loop** repeats as long as a condition stays `True`, and is the right tool when you do not know the number of repetitions in advance:\n```python\nbuses_checked = 0\nfound_bus = False\nwhile not found_bus and buses_checked < 10:\n    buses_checked += 1\n    # ... check the next bus schedule ...\n    if buses_checked == 4:\n        found_bus = True\n```\n`while True:` with a `break` inside is a common pattern for "loop until some condition happens inside the loop body", e.g. reading user input until they type "quit".\n\nTwo control keywords work inside both loop types:\n- **`break`** — exits the loop immediately.\n- **`continue`** — skips the rest of this iteration and moves to the next one.\n\nA subtle but important trap: a `while` loop whose condition never becomes `False` runs forever (an **infinite loop**) — always make sure something inside the loop body moves the condition toward ending.',
          whyItMatters:
            'Loops are how a program processes more than one thing without repeating code by hand — reading every recipe file in a folder, checking every bus schedule entry, or later, streaming tokens from an LLM response one chunk at a time. Kundapura Sahayaka\'s very first script (Module 1) loops over structured data like seva timings and recipes; that pattern starts here.',
          steps: [
            'Write a `for` loop over a list of at least three strings, printing each one.',
            'Write a `for i in range(5):` loop and print each `i`.',
            'Write a `for i in range(2, 8):` loop and confirm the stop value is excluded.',
            'Write a `while` loop that counts up from 0 until it reaches 5, incrementing manually.',
            'Add a `break` inside a loop to exit early on a matching condition.',
            'Add a `continue` inside a loop to skip one specific item without stopping the whole loop.',
          ],
          code: `dishes = ["Neer Dosa", "Kori Rotti", "Kane Fish Curry", "Kotte Kadubu"]

# for loop over a list:
for dish in dishes:
    print(f"Today's special: {dish}")

# range() — for loop over numbers, stop value excluded:
for i in range(5):
    print(i)            # 0 1 2 3 4

for i in range(2, 8):
    print(i)             # 2 3 4 5 6 7

# while loop — repeats while a condition holds:
buses_checked = 0
while buses_checked < 5:
    print(f"Checking bus #{buses_checked + 1}")
    buses_checked += 1

# break and continue:
for dish in dishes:
    if dish == "Kori Rotti":
        continue          # skip just this one
    if dish == "Kotte Kadubu":
        break              # stop the loop entirely once we reach this dish
    print(f"Serving: {dish}")`,
          pitfalls: [
            '**Writing a `while` loop whose condition never changes.** It runs forever. Fix: make sure something inside the loop body moves the condition toward `False` (e.g. increment a counter).',
            '**Forgetting `range()`\'s stop value is excluded.** `range(5)` gives `0..4`, not `0..5`. Fix: add 1 to the stop value if you truly need it included.',
            '**Modifying a list while looping over it with `for item in my_list:`.** Items can be skipped or errors raised. Fix: loop over a copy (`for item in my_list[:]:`) if you need to modify the original.',
            '**Using `for i in range(len(my_list)): print(my_list[i])`** when a direct `for item in my_list:` is simpler and more idiomatic. Fix: prefer iterating directly over the list unless you specifically need the index.',
            '**Confusing `break` and `continue`.** `break` exits the whole loop; `continue` only skips to the next iteration. Fix: pause and confirm which behaviour you actually want.',
            '**Forgetting to increment/update the loop variable in a manual `while` loop.** Causes either an infinite loop or a loop that never runs. Fix: double-check the update line is inside the loop body.',
          ],
          tryIt:
            'Given `bus_times = ["06:30", "09:00", "13:15", "17:45", "20:00"]`, write a `for` loop that prints only the bus times after `"12:00"` (compare as strings works here since they are zero-padded), then rewrite it using a `while` loop with a manual index instead.',
          takeaway:
            '`for` loops iterate over lists or a `range()` when the number of steps is known; `while` loops repeat until a condition changes — both support `break` to exit early and `continue` to skip an iteration.',
        },
        {
          id: 'm0-t8',
          title: 'Writing your first function: def, parameters, default args, return',
          explain:
            'Package reusable logic into a function with `def`, accept inputs through parameters (including ones with default values), and send a result back to the caller with `return`.',
          analogy:
            'A **function** is like the standard recipe card pinned in a Kundapura Sahayaka kitchen for **neer dosa**: it always takes the same kind of inputs (rice, coconut, water) and always produces the same kind of output (a batch of dosas), no matter who is cooking or how many times it is made that week. You write the recipe card once — "def make_neer_dosa(...)" — and reuse it every single day instead of re-explaining the steps from scratch each time.',
          theory:
            'A **function** groups a block of code under a name so you can run it repeatedly without retyping it. Define one with `def`:\n```python\ndef greet(name):\n    return f"Hello, {name}!"\n```\n`name` here is a **parameter** — a placeholder for a value the caller supplies. When you call `greet("Kundapura")`, `"Kundapura"` is the **argument** bound to that parameter for this call.\n\n**`return`** sends a value back to wherever the function was called from, and immediately ends the function. A function without an explicit `return` implicitly returns `None` — useful when a function\'s job is to *do* something (like `print`) rather than compute a value.\n\n**Default arguments** let a parameter be optional by giving it a fallback value in the definition:\n```python\ndef greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\ngreet("Kundapura")              # -> "Hello, Kundapura!"\ngreet("Kundapura", "Namaskara") # -> "Namaskara, Kundapura!"\n```\nParameters with defaults must come *after* parameters without defaults in the function signature — Python enforces this with a `SyntaxError` otherwise.\n\nYou can also call a function using **keyword arguments** — naming the parameter explicitly at the call site — which makes calls with several arguments far more readable and lets you skip earlier defaults:\n```python\ngreet(name="Kundapura", greeting="Namaskara")\n```\nFunctions are the fundamental unit of reuse in Python, and nearly everything you will do with GenAI libraries later is *calling* someone else\'s function (`anthropic.Anthropic().messages.create(...)`) or *writing* your own to wrap that call cleanly — so getting comfortable defining and calling functions now is essential groundwork.',
          whyItMatters:
            'Every meaningful script beyond a few lines needs functions to stay readable and avoid repeating code — and every GenAI API call you will make from Module 2 onward is itself a function call, typically wrapped inside a function *you* write (e.g. `ask_sahayaka(question)`). Getting `def`, parameters, defaults, and `return` solid now means the GenAI code later reads naturally instead of like unfamiliar syntax on top of unfamiliar concepts.',
          steps: [
            'Define a function with one required parameter that returns a formatted string.',
            'Call it with a single argument and print the result.',
            'Add a second parameter with a default value.',
            'Call the function once relying on the default, and once overriding it.',
            'Call the function again using keyword arguments for clarity.',
            'Write a function that does not `return` anything and confirm `print(the_call())` shows `None`.',
          ],
          code: `def greet_visitor(name, greeting="Namaskara"):
    """Return a friendly Kundapura-style greeting for name."""
    return f"{greeting}, {name}! Welcome to Kundapura Sahayaka."

# Using the default greeting:
print(greet_visitor("Asha"))
# -> Namaskara, Asha! Welcome to Kundapura Sahayaka.

# Overriding the default with a positional argument:
print(greet_visitor("Ravi", "Hello"))
# -> Hello, Ravi! Welcome to Kundapura Sahayaka.

# Calling with keyword arguments (order no longer matters):
print(greet_visitor(greeting="Hi", name="Meera"))
# -> Hi, Meera! Welcome to Kundapura Sahayaka.

# A function with no explicit return implicitly returns None:
def log_visit(name):
    print(f"Logged visit from {name}")

result = log_visit("Asha")   # prints "Logged visit from Asha"
print(result)                 # -> None`,
          pitfalls: [
            '**Forgetting `return` and expecting a value anyway.** The function silently gives back `None`. Fix: add an explicit `return` for any function meant to produce a value.',
            '**Confusing `print()` inside a function with `return`ing a value.** `print` only displays text; it does not hand a value back to the caller. Fix: `return` the value if the caller needs to use it further.',
            '**Putting a parameter without a default *after* one with a default.** `def f(a="x", b):` is a `SyntaxError`. Fix: order required parameters first, defaulted ones last.',
            '**Using a mutable default argument** like `def f(items=[]):`. The same list is reused across every call and quietly accumulates. Fix: default to `None` and create a new list inside the function body instead.',
            '**Shadowing a built-in name as a parameter**, e.g. `def process(list):`. It works but hides Python\'s built-in `list` type inside the function. Fix: pick a more specific name like `items`.',
            '**Not adding a docstring or a clear name for anything beyond a one-liner.** Six months later the function\'s purpose is a mystery. Fix: give functions descriptive `snake_case` names and a short docstring for anything non-trivial.',
          ],
          tryIt:
            'Write a function `format_seva_time(name, time, temple="Kundapura")` with a default for `temple`, that returns a sentence like "Maha Pooja at Kundapura is at 07:00". Call it three times: once relying on the default, once overriding it, and once using keyword arguments.',
          takeaway:
            '`def` packages reusable logic behind a name; parameters (optionally with defaults) accept inputs, and `return` sends a computed value back to the caller — the exact shape of nearly every function you will write for Kundapura Sahayaka.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm0-p1',
      type: 'Mini Project',
      title: 'Dev Environment Check-In',
      domain: 'Tooling',
      duration: '1-2 hrs',
      description:
        'Create a dedicated virtual environment for the whole course, install `python-dotenv` and `requests` as a smoke test, and write a small `check_setup.py` script that prints the Python version, confirms both packages import cleanly, and prints a friendly greeting. This is the very first line of code in "Kundapura Sahayaka" — proof your toolbench is ready before any real feature gets built on it.',
      tools: ['Python 3.12', 'venv', 'pip', 'VS Code'],
      blueprint: {
        overview:
          'Before Kundapura Sahayaka can fetch a single seva timing or answer a single question, the environment it runs in has to be provably correct: the right Python version, an isolated venv, and its first two dependencies importable without error. This project is that proof, captured as a small, permanent, re-runnable script — `check_setup.py` — that becomes the project\'s "is everything working?" sanity check for the rest of the course.',
        functionalRequirements: [
          'Create a project folder (e.g. `kundapura-sahayaka/`) with its own `.venv` virtual environment, activated in the terminal.',
          'Install `python-dotenv` and `requests` into the activated venv, and record both in a `requirements.txt` file.',
          'Write `check_setup.py` that prints the running Python version using the standard library (no manual typing of a version number).',
          'In the same script, import `dotenv` and `requests` inside a `try`/`except` so an import failure prints a clear, friendly error instead of a raw traceback.',
          'On success, print a friendly one-line greeting from "Kundapura Sahayaka" confirming the environment is ready.',
        ],
        technicalImplementation: [
          'Use `python -m venv .venv` to create the environment and the correct OS-specific `activate` command to enter it.',
          'Use `sys.version` or `sys.version_info` (both from the built-in `sys` module) to read and print the interpreter version — do not hardcode it.',
          'Wrap the two `import` statements in a `try`/`except ImportError as e` block so a missing package produces a readable message naming the missing package, not a raw Python traceback.',
          'Define a small function, e.g. `def check_setup():`, that performs the checks and returns `True`/`False`, then call it from a `if __name__ == "__main__":` guard at the bottom of the script.',
          'Keep the greeting text distinctly "Kundapura Sahayaka" flavoured (e.g. mentioning coastal Karnataka) since later modules will build directly on top of this exact script.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Create the venv and install dependencies',
            outcome: 'A `kundapura-sahayaka/` project folder with an activated `.venv`, `python-dotenv` and `requests` installed, and a `requirements.txt` listing both.',
            prompt:
              'Create a project folder named `kundapura-sahayaka`, set up a virtual environment inside it with `python -m venv .venv`, and activate it. With the venv active, install `python-dotenv` and `requests` using pip. Write a `requirements.txt` file listing both packages, one per line. Show the exact terminal commands you ran for your OS and the final contents of `requirements.txt`.',
          },
          {
            step: 2,
            label: 'Write check_setup.py',
            outcome: 'A runnable `check_setup.py` that prints the Python version and greets the user once imports succeed.',
            prompt:
              'Write a `check_setup.py` script in the project folder. It should: (1) print the running Python version using the `sys` module, (2) print a friendly one-line greeting mentioning "Kundapura Sahayaka" and coastal Karnataka, and (3) be organized as a small function called from an `if __name__ == "__main__":` guard at the bottom rather than bare top-level code. Explain briefly why the `if __name__ == "__main__":` guard is good practice.',
          },
          {
            step: 3,
            label: 'Confirm imports cleanly and handle failure gracefully',
            outcome: 'The script proves `python-dotenv` and `requests` import successfully, and prints a clear, friendly message instead of crashing if either is missing.',
            prompt:
              'Update `check_setup.py` to import `dotenv` and `requests` inside a `try`/`except ImportError as e` block. On success, print a line confirming both packages imported cleanly. On failure, print a friendly message naming which package is missing and suggesting the exact `pip install` command to fix it, instead of letting the raw traceback show. Then show me how you would deliberately break it (e.g. by uninstalling one package) to prove the friendly error path actually runs.',
          },
          {
            step: 4,
            label: 'Run it end-to-end and verify',
            outcome: 'A confirmed, working run of `python check_setup.py` showing the Python version, the import confirmation, and the Kundapura Sahayaka greeting.',
            prompt:
              'Run `python check_setup.py` in the activated venv and show me the exact output. Then give me a short checklist I can use at the start of every future module to re-verify my environment still works: which command activates the venv, which command re-installs from `requirements.txt` if I ever recreate `.venv`, and which command runs this check script.',
          },
        ],
        deliverable:
          'A `kundapura-sahayaka/` project folder containing a working `.venv`, a `requirements.txt` listing `python-dotenv` and `requests`, and a `check_setup.py` that runs cleanly with `python check_setup.py` — printing the Python version, confirming both packages import, and greeting you as Kundapura Sahayaka. This folder is the seed of the app you will grow in every remaining module, so keep it: Module 1 adds real API calls to it, Module 3 gives it an LLM, and by Module 8 it is deployed to a public URL. If the friendly `ImportError` message also prints correctly when a package is missing, your environment is genuinely solid.',
      },
    },
  ],
  quiz: [
    {
      id: 'm0-q1',
      q: 'You just installed Python on Windows but forgot to tick "Add python.exe to PATH". What happens when you run `python --version` in a terminal?',
      options: [
        'It automatically finds Python anyway using the Windows registry',
        'It likely reports "python is not recognised" because the terminal cannot find the interpreter on PATH',
        'It installs Python again automatically',
        'It works, but only inside VS Code',
      ],
      answer: 1,
    },
    {
      id: 'm0-q2',
      q: 'Why does every GenAI project in this course get its own `venv` instead of installing packages globally?',
      options: [
        'venv makes packages install faster',
        'It isolates each project\'s packages so different projects can use different, even conflicting, versions without interfering with each other',
        'Global installs are not supported on Windows',
        'venv is required by the `anthropic` package specifically',
      ],
      answer: 1,
    },
    {
      id: 'm0-q3',
      q: 'In VS Code, autocomplete keeps failing to recognise a package you already installed with pip. What is the most likely cause?',
      options: [
        'The package needs to be reinstalled twice',
        'VS Code is pointed at the wrong Python interpreter (not your project\'s `.venv`)',
        'VS Code does not support Python autocomplete',
        'The package name has a typo in PyPI itself',
      ],
      answer: 1,
    },
    {
      id: 'm0-q4',
      q: 'What does `requirements.txt` do, and how do you use it to recreate an environment?',
      options: [
        'It stores your source code as a backup; run `python requirements.txt` to restore it',
        'It lists the packages a project needs; run `pip install -r requirements.txt` to install them all at once',
        'It is a Python file that runs automatically when the venv activates',
        'It replaces the need for a `.venv` entirely',
      ],
      answer: 1,
    },
    {
      id: 'm0-q5',
      q: 'What is the difference between `range(5)` in a `for` loop and a `while` loop that increments a counter until it reaches 5?',
      options: [
        '`range(5)` loops 6 times while the `while` loop only loops 5 times',
        'They behave completely differently and cannot produce the same result',
        'Both can produce 5 iterations, but `for range(5)` is used when the number of steps is known in advance, while `while` is suited to a condition that is not known ahead of time',
        '`range()` can only be used with `while` loops, never `for` loops',
      ],
      answer: 2,
    },
  ],
}
