// Week 1 — Python for a .NET Developer
// Teach only the Python needed for AI engineering, with C# comparisons throughout
// Interactive comparisons show side-by-side C# vs Python for every concept
// Topics: variables, control flow, functions, classes, type hints, async, modules, pip, venv, pytest

export const m0 = {
  id: 'm0',
  title: 'Week 1 — Python for a .NET Developer',
  hours: 6,
  color: 'from-blue-500/20 to-blue-700/10',
  accent: 'blue',
  description:
    'Skip Python 101. Learn only what you need to build AI agents. You already know how to write code — this week teaches you what is different in Python, and why those differences matter for AI engineering.',
  sections: [
    {
      id: 'm0-s1',
      title: 'Setup & Tooling',
      topics: [
        {
          id: 'm0-t1',
          title: 'Install Python 3.12 and verify PATH',
          explain:
            'Install Python 3.12 from the official source, then confirm `python --version` in a fresh terminal prints `Python 3.12.x`.',
          analogy:
            'Just as you need the .NET Runtime to run C# apps, you need the Python interpreter to run `.py` files. Installing Python means installing an interpreter AND getting it discoverable from your terminal — verify both.',
          theory:
            'Python is an interpreted language — the Python interpreter reads `.py` files line by line and executes them, unlike C# which compiles to IL first. When you install Python, you are installing that interpreter. The installer must also register its folder on your shell\'s PATH (the list of places your terminal searches for commands), otherwise `python` returns "command not found" even though the files exist on disk.\n\nOn Windows, the official installer has a checkbox "Add python.exe to PATH" — tick it. On macOS/Linux, most package managers handle PATH automatically, but verify with a fresh terminal.\n\nAlways check in a *new* terminal window after install, because an already-open window cached the old PATH before the install happened.',
          whyItMatters:
            'Every command in this course assumes `python --version` works in your terminal. It is the prerequisite to everything that follows. Get this right now and you save yourself debugging "command not found" errors for the next 12 weeks.',
          steps: [
            'Visit https://python.org/downloads and download Python 3.12 for your OS.',
            'Windows: Run the installer. On the first screen, TICK "Add python.exe to PATH" before clicking Install.',
            'macOS: Download and run the installer, or use Homebrew: `brew install python@3.12`',
            'Linux: Use your package manager, e.g. `sudo apt install python3.12`',
            'Close every terminal window that was open.',
            'Open a brand-new terminal and run: `python --version` (Windows) or `python3 --version` (macOS/Linux)',
            'Confirm output is `Python 3.12.x`. If it says "not recognised", reinstall with PATH enabled.',
          ],
          code: `# Fresh terminal window:
python --version
# -> Python 3.12.4

# On macOS/Linux, often python3 instead of python:
python3 --version
# -> Python 3.12.4

# Prove the interpreter works:
python -c "print('Python ready for AI agents')"
# -> Python ready for AI agents`,
          pitfalls: [
            'Windows: Skipped "Add python.exe to PATH" checkbox. Fix: reinstall and tick it.',
            'Checking version in a terminal that was open during install. Fix: always open a fresh terminal.',
            'Assuming `python` and `python3` are the same. On macOS/Linux, try `python3` if `python` fails.',
          ],
          tryIt:
            'Open a fresh terminal and run `python --version` and `python -c "print(2 + 2)"`. Confirm both work.',
          takeaway:
            'Installing Python = interpreter + PATH. Always verify in a fresh terminal. This is your foundation.',
        },
        {
          id: 'm0-t2',
          title: 'Virtual environments with venv',
          explain:
            'Create an isolated virtual environment (`venv`) per project so each project gets its own private set of installed packages.',
          analogy:
            'C# projects live in separate folders with separate `.csproj` files and separate `packages.config` or `.csproj` dependency lists. Python projects do the same with `venv` — each project gets its own isolated Python interpreter and package folder. `pip install` inside a venv only affects that project.',
          theory:
            'When you `pip install` without a venv, packages install globally into the one Python on your computer. Project A needs `langchain==0.1`, Project B needs `langchain==0.3` — but one global install holds only one version. Upgrade for B and A breaks silently.\n\nA venv gives each project a private, isolated Python package folder. It is like a project-specific `.nuget` folder in C# — packages installed here are invisible to other projects.\n\nWorkflow (once per project):\n1. `python -m venv .venv` — creates a folder `.venv` with isolated Python and package space\n2. Activate it — Windows: `.venv\\Scripts\\activate`; macOS/Linux: `source .venv/bin/activate` — your prompt shows `(.venv)`\n3. Use it — `pip install` now lands only here\n4. Deactivate when done — just run `deactivate`\n\nThe `.venv` folder is disposable and machine-specific (add to `.gitignore`). Anyone recreates it from `requirements.txt` with `pip install -r requirements.txt`.',
          whyItMatters:
            'Every real Python project starts with "make a venv" before "pip install anything". Skipping this is the #1 reason beginners get "it worked yesterday" bugs when package versions drift between projects. For AI agents, you will use many versions of `anthropic`, `langchain`, and other libraries — each project needs its own frozen set.',
          steps: [
            'Open terminal in your project folder (e.g. `ai-agent-lab/`)',
            'Create venv: `python -m venv .venv`',
            'Activate: Windows: `.venv\\Scripts\\activate`; macOS/Linux: `source .venv/bin/activate`',
            'Confirm prompt shows `(.venv)` at the start',
            'Upgrade pip: `python -m pip install --upgrade pip`',
            'Add `.venv/` to `.gitignore` so it is never committed',
          ],
          code: `# Create venv in project folder:
python -m venv .venv

# Activate (Windows):
.venv\\Scripts\\activate
# Prompt now shows: (.venv) C:\\Users\\You\\project>

# Activate (macOS/Linux):
source .venv/bin/activate
# Prompt now shows: (.venv) you@machine:~/project$

# Install a package (only lands in this venv):
pip install anthropic

# Check what is installed (only in this venv):
pip list

# Deactivate when done:
deactivate
# Prompt returns to normal`,
          pitfalls: [
            'Forgetting to activate after creating the venv. Packages install globally instead of locally.',
            'Creating venv in a folder you will commit to git. Add `.venv/` to `.gitignore` before first commit.',
            'Assuming activation changes permanently. It only affects the current terminal session — close the terminal or run `deactivate` and PATH reverts.',
          ],
          tryIt:
            'Create a test venv: `python -m venv test-venv`, activate it (check prompt for `(test-venv)`), run `pip list`, then deactivate and run `pip list` again — notice the second list is much longer (global packages).',
          takeaway:
            'One venv per project. Activate before installing. Add `.venv/` to `.gitignore`. This isolates dependencies.',
        },
        {
          id: 'm0-t3',
          title: 'VS Code setup for Python',
          explain:
            'Configure VS Code to recognize your venv and run Python code correctly.',
          analogy:
            'Just as you configure Visual Studio to point at the correct .NET Framework and NuGet packages, you need to tell VS Code "use this project\'s Python venv".',
          theory:
            'VS Code uses language servers and type checkers to give you IntelliSense and error detection. For Python, it needs to know which Python interpreter to use (the global one, or the venv\'s one). By default it may pick the wrong one — especially if you have multiple Pythons installed.\n\nSolution: VS Code\'s Python extension reads a `.venv/` folder in the project root and automatically uses it. No extra config needed if you name it `.venv`.\n\nFor type checking and linting, install `pylint` and `pytest` inside the venv — then VS Code finds and uses them automatically.\n\nOptional but helpful: create a `.vscode/settings.json` in your project and explicitly tell VS Code to use the venv, though most of the time it auto-detects.',
          whyItMatters:
            'Wrong Python interpreter = IntelliSense shows wrong packages, linting fails, tests run against the wrong environment. Fixing this early saves frustration.',
          steps: [
            'Open your project folder in VS Code',
            'Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)',
            'Type "Python: Select Interpreter"',
            'Choose the one that says "./venv" or "./.venv"',
            'Confirm in bottom-left corner of VS Code shows the correct Python path',
            'Install linting tools inside venv: `pip install pylint pytest`',
          ],
          code: `# Inside VS Code terminal (venv already activated):

# Install linting + testing tools:
pip install pylint pytest

# Create a test file to verify:
# file: test.py
def greet(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("AI Engineer"))

# Run it:
python test.py
# -> Hello, AI Engineer!

# Pylint should now check the file in VS Code automatically`,
          pitfalls: [
            'VS Code shows "Python extension not installed". Go to Extensions and install "Python" from Microsoft.',
            'Wrong interpreter chosen. Check bottom-left corner; it should show a path inside `.venv`.',
            'Linting tools not installed. `pip install pylint` inside the venv.',
          ],
          tryIt:
            'Create a test.py file and type `def `. Confirm VS Code\'s autocomplete works and shows function hints. If it does not, check the interpreter selection in bottom-left.',
          takeaway:
            'VS Code auto-detects `.venv` if it exists in the project root. Install linting tools (`pylint`, `pytest`) inside the venv. Confirm the bottom-left shows the right interpreter.',
        },
      ],
    },
    {
      id: 'm0-s2',
      title: 'Variables, Types, and Control Flow',
      topics: [
        {
          id: 'm0-t4',
          title: 'Variables and type hints',
          explain:
            'Python variables do not require explicit type declarations, but type hints make your code clearer and enable IDE/linter help.',
          csharpVsPython: true,
          examples: [
            {
              language: 'csharp',
              title: 'C# — explicit types required',
              code: `// C# — types are mandatory
string name = "Alice";
int age = 30;
double salary = 95000.50;
bool isActive = true;

// List<T> and Dictionary<K, V> are generic types
List<string> skills = new List<string> { "C#", "SQL" };
Dictionary<string, int> experience = new Dictionary<string, int>
{
    { "C#", 12 },
    { "SQL", 10 }
};`,
            },
            {
              language: 'python',
              title: 'Python — types are inferred, hints are optional',
              code: `# Python — no type declaration needed (but hints are good!)
name = "Alice"  # type is inferred: str
age = 30        # inferred: int
salary = 95000.50  # inferred: float
is_active = True  # inferred: bool

# Collections without type hints (works, but harder to debug)
skills = ["C#", "SQL"]
experience = {"C#": 12, "SQL": 10}

# Collections WITH type hints (modern Python, best practice)
from typing import List, Dict
skills: List[str] = ["C#", "SQL"]
experience: Dict[str, int] = {"C#": 12, "SQL": 10}`,
            },
          ],
          analogy:
            'C# is like a strict checklist — you must say "this variable is an int" upfront. Python is like a flexible note — you write down a value and Python figures out the type. Type hints let you add checkmarks without losing flexibility.',
          theory:
            'Python is **dynamically typed** — variables have types, but you do not declare them upfront. The interpreter figures out the type from the value you assign. This is more flexible than C#\'s static typing, but can hide bugs.\n\n**Type hints** (introduced in Python 3.5+) let you write types as annotations. They do not enforce anything at runtime — Python still ignores them during execution — but they help IDEs give you better IntelliSense and let linters (like `pylint` or `mypy`) catch obvious mistakes before runtime.\n\nFor AI engineering, always use type hints. They are mandatory for Pydantic models (which define AI data structures), and they make your code self-documenting.\n\nKey Python types:\n- `str` — string\n- `int` — integer\n- `float` — decimal number\n- `bool` — True/False\n- `list` — ordered collection (C#: List<T>)\n- `dict` — key-value pairs (C#: Dictionary<K, V>)\n- `tuple` — immutable sequence (C#: tuple)\n- `set` — unique unordered items (C#: HashSet<T>)',
          whyItMatters:
            'Type hints enable IDE autocomplete, catch typos early, and make code self-documenting. When you write AI prompts or tool schemas, you will use Pydantic models which require type hints. Get comfortable with them now.',
          steps: [
            'Write variables without type hints: `name = "Alice"`, `age = 30`',
            'Add type hints: `name: str = "Alice"`, `age: int = 30`',
            'Use hints on collections: `skills: List[str] = ["C#", "Python"]`',
            'Install a type checker: `pip install mypy`',
            'Run `mypy myfile.py` to check for type errors',
          ],
          code: `# No type hints (works, but IDE/linter can\'t help):
def get_customer(customer_id):
    return {"id": customer_id, "name": "Alice"}

# With type hints (modern Python, recommended for AI work):
def get_customer(customer_id: int) -> dict[str, str | int]:
    return {"id": customer_id, "name": "Alice"}

# Better yet, use Pydantic for AI (covered later in course):
from pydantic import BaseModel

class Customer(BaseModel):
    id: int
    name: str

def get_customer(customer_id: int) -> Customer:
    return Customer(id=customer_id, name="Alice")`,
          pitfalls: [
            'Type hints are only hints — Python does NOT enforce them. Wrong type passed = Python still runs it, but fails later. Use a type checker like `mypy` to catch these before runtime.',
            'Confusing `list` with `List` from typing. Modern Python (3.9+) lets you use `list[str]` directly; older Python needs `List[str]` from `typing` import.',
          ],
          tryIt:
            'Write a function with type hints: `def add(a: int, b: int) -> int: return a + b`. Hover over function names in VS Code to see the type info appear in a popup.',
          takeaway:
            'Always write type hints for functions and variables. Python does not enforce them, but IDEs and type checkers use them. They make AI code clearer and safer.',
        },
        {
          id: 'm0-t5',
          title: 'Control flow: if/elif/else, for, while',
          explain:
            'Python control flow is simpler than C# — no curly braces, indentation defines blocks.',
          csharpVsPython: true,
          examples: [
            {
              language: 'csharp',
              title: 'C#',
              code: `// if/else
if (age >= 18) {
    Console.WriteLine("Adult");
} else if (age >= 13) {
    Console.WriteLine("Teen");
} else {
    Console.WriteLine("Child");
}

// for loop
for (int i = 0; i < 5; i++) {
    Console.WriteLine(i);
}

// foreach loop
var skills = new[] { "C#", "SQL", "Docker" };
foreach (var skill in skills) {
    Console.WriteLine(skill);
}

// while loop
while (count > 0) {
    Console.WriteLine(count);
    count--;
}`,
            },
            {
              language: 'python',
              title: 'Python — no braces, indentation is syntax',
              code: `# if/elif/else (elif = else if)
if age >= 18:
    print("Adult")
elif age >= 13:
    print("Teen")
else:
    print("Child")

# for loop (more Pythonic: iterate directly, not with index)
for i in range(5):  # range(5) = [0, 1, 2, 3, 4]
    print(i)

# for-each loop (simpler in Python)
skills = ["C#", "SQL", "Docker"]
for skill in skills:
    print(skill)

# while loop
while count > 0:
    print(count)
    count -= 1

# List comprehension (Python-only, very common in AI work)
squared = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]`,
            },
          ],
          analogy:
            'C# uses curly braces to mark blocks; Python uses indentation. If you mix tab and space indentation, Python will complain. Use spaces consistently (VS Code does this automatically).',
          theory:
            'Python\'s control flow syntax is similar to C#, with one key difference: **indentation defines blocks, not braces**. This is not just style — it is syntax. If your indentation is wrong, the code does not run.\n\nAlways use spaces (4 spaces per indent level is the Python standard). VS Code automatically converts tabs to spaces if you configure it right.\n\n**List comprehensions** are Python-specific and very common in AI work:\n```python\n# Readable loop:\nresults = []\nfor x in items:\n    results.append(x * 2)\n\n# Compact list comprehension (same thing):\nresults = [x * 2 for x in items]\n```\n\nList comprehensions are faster, more readable, and appear everywhere in LLM code.',
          whyItMatters:
            'List comprehensions are everywhere in Python AI code. Indent errors crash your code silently. Master both now.',
          steps: [
            'Write an if/elif/else block without braces, relying on indentation',
            'Write a for loop iterating directly over items (not by index)',
            'Write a list comprehension to double a list of numbers',
            'Remember: 4 spaces per indent, no tabs (VS Code default is fine)',
          ],
          code: `# if/elif/else
temperature = 25
if temperature > 30:
    print("Hot")
elif temperature > 15:
    print("Warm")
else:
    print("Cold")

# for loop (iterate over items, not index)
for num in [1, 2, 3, 4, 5]:
    print(num * num)

# List comprehension (very Pythonic)
numbers = range(1, 6)
squares = [x**2 for x in numbers]
print(squares)  # -> [1, 4, 9, 16, 25]

# Conditional list comprehension
evens = [x for x in range(10) if x % 2 == 0]
print(evens)  # -> [0, 2, 4, 6, 8]`,
          pitfalls: [
            'Mixing tabs and spaces. Python complains "indentation contains mixed spaces and tabs". Fix: configure VS Code to always use spaces.',
            'Indenting inside an if block wrong. Python reads indentation as part of the syntax — wrong indent = SyntaxError.',
            'Using a for loop by index when you should iterate directly: `for i in range(len(items))` instead of `for item in items`. Python prefers the latter.',
          ],
          tryIt:
            'Write a list comprehension that filters numbers: `[x for x in range(20) if x % 3 == 0]`. Run it and see the result.',
          takeaway:
            'Indentation is syntax in Python, not just style. List comprehensions are concise and fast. Use them.',
        },
      ],
    },
    {
      id: 'm0-s3',
      title: 'Functions, Decorators, and Async',
      topics: [
        {
          id: 'm0-t6',
          title: 'Functions with type hints and return types',
          explain:
            'Python functions are simpler than C# methods, but always use type hints.',
          csharpVsPython: true,
          examples: [
            {
              language: 'csharp',
              title: 'C# method',
              code: `public Customer GetCustomer(int id)
{
    return new Customer { Id = id, Name = "Alice" };
}

// Overloading (same name, different args)
public string GetCustomer(int id)
{
    return "Customer #" + id;
}

public string GetCustomer(string email)
{
    return "Found: " + email;
}`,
            },
            {
              language: 'python',
              title: 'Python function with type hints',
              code: `# Simple function (Python does not need explicit return type declaration)
def get_customer(id: int) -> dict[str, str | int]:
    return {"id": id, "name": "Alice"}

# Python does NOT support method overloading (one function name = one function)
# Instead, use default arguments or *args/**kwargs:

# Default arguments:
def get_customer(id: int, include_email: bool = False) -> dict:
    customer = {"id": id, "name": "Alice"}
    if include_email:
        customer["email"] = "alice@example.com"
    return customer

# *args (variable positional args), **kwargs (variable keyword args):
def log_event(*args, **kwargs):
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")

log_event("login", "user123", session_id="sess-456")
# -> Args: ('login', 'user123')
# -> Kwargs: {'session_id': 'sess-456'}`,
            },
          ],
          analogy:
            'C# methods are part of a class and can be overloaded (same name, different args). Python functions are standalone and use default arguments or *args/**kwargs for flexibility instead.',
          theory:
            'A Python function is defined with `def` and should always have type hints for all parameters and the return type.\n\n```python\ndef function_name(param1: Type1, param2: Type2) -> ReturnType:\n    # function body\n    return result\n```\n\nPython does NOT support method overloading like C# does. If you define two functions with the same name, the second overwrites the first. Instead, use:\n- **Default arguments**: `def greet(name: str = "World") -> str`\n- **`*args`** and **`**kwargs`** for variable-length arguments\n\n**`*args`** collects positional arguments into a tuple. **`**kwargs`** collects keyword arguments into a dict.',
          whyItMatters:
            'AI tools and agents use functions with type hints. Pydantic will inspect these hints to build JSON schemas. You MUST write type hints on every AI function.',
          steps: [
            'Write a function with type hints for all parameters and return type',
            'Use default arguments to avoid overloading',
            'Write a function that uses `*args` and `**kwargs`',
            'Call functions with positional and keyword arguments',
          ],
          code: `# Simple function with type hints
def calculate_tax(amount: float, rate: float = 0.18) -> float:
    return amount * rate

print(calculate_tax(100))        # -> 18.0
print(calculate_tax(100, 0.05))  # -> 5.0

# Variable arguments
def log_event(event: str, *tags: str, **metadata) -> None:
    print(f"Event: {event}")
    print(f"Tags: {tags}")
    print(f"Metadata: {metadata}")

log_event("purchase", "promo", "flash_sale", user_id=123, value=99.99)
# -> Event: purchase
# -> Tags: ('promo', 'flash_sale')
# -> Metadata: {'user_id': 123, 'value': 99.99}`,
          pitfalls: [
            'Forgetting the return type hint. Tools that parse functions (like Pydantic) need it.',
            'Using overloading (defining the same function twice). Python does not support it — the second definition overwrites the first.',
            'Confusing `*args` with `args` — the `*` is part of the syntax that tells Python "collect remaining positional arguments".',
          ],
          tryIt:
            'Define a function `process_request(action: str, **params)` and call it with different keyword arguments. Print what you receive.',
          takeaway:
            'Always use type hints. Python does not support overloading — use default args and `*args/**kwargs` instead.',
        },
        {
          id: 'm0-t7',
          title: 'Classes and dataclasses',
          explain:
            'Python classes are simpler than C# classes. Use `dataclass` decorator for data-holding classes.',
          csharpVsPython: true,
          examples: [
            {
              language: 'csharp',
              title: 'C# class with properties',
              code: `public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }

    public string Greet()
    {
        return $"Hello, {Name}!";
    }
}`,
            },
            {
              language: 'python',
              title: 'Python class (traditional)',
              code: `class Customer:
    def __init__(self, id: int, name: str, email: str):
        self.id = id
        self.name = name
        self.email = email

    def greet(self) -> str:
        return f"Hello, {self.name}!"

# Use it:
customer = Customer(1, "Alice", "alice@example.com")
print(customer.greet())  # -> Hello, Alice!`,
            },
            {
              language: 'python',
              title: 'Python dataclass (cleaner, modern)',
              code: `from dataclasses import dataclass

@dataclass
class Customer:
    id: int
    name: str
    email: str

    def greet(self) -> str:
        return f"Hello, {self.name}!"

# Use it (same as above):
customer = Customer(1, "Alice", "alice@example.com")
print(customer.greet())  # -> Hello, Alice!`,
            },
          ],
          analogy:
            'C# properties with getters/setters become simple dataclass fields in Python. The `@dataclass` decorator auto-generates `__init__`, `__repr__`, and other boilerplate.',
          theory:
            'Python classes are similar to C# classes, but simpler. The key differences:\n\n1. **No access modifiers** (public/private). Python convention: prefix private fields with `_` (e.g., `self._internal_id`).\n2. **`__init__` is the constructor**, not a method named after the class.\n3. **`self` is explicit** — the first parameter of every method is `self` (like `this` in C#, but you must write it explicitly).\n\n**`@dataclass` decorator** is a game-changer for data-holding classes. Instead of writing `__init__`, it auto-generates everything:\n\n```python\n@dataclass\nclass Customer:\n    id: int\n    name: str\n    email: str\n```\n\nThis is equivalent to writing the `__init__` by hand, but cleaner.\n\n**Pydantic** (which you will use heavily in AI work) extends dataclasses:\n\n```python\nfrom pydantic import BaseModel\n\nclass Customer(BaseModel):\n    id: int\n    name: str\n    email: str\n```\n\nPydantic models validate data automatically and can parse JSON directly.',
          whyItMatters:
            'You will define AI data structures (prompts, tool inputs, agent states) using Pydantic models. Understanding dataclasses first makes Pydantic natural.',
          steps: [
            'Write a simple class with `__init__` and a method',
            'Rewrite it using `@dataclass` decorator',
            'Experiment with both — notice dataclass is less boilerplate',
            'Write a dataclass with type hints on all fields',
          ],
          code: `# Traditional class (verbose):
class Agent:
    def __init__(self, name: str, model: str):
        self.name = name
        self.model = model

    def __repr__(self):
        return f"Agent(name={self.name}, model={self.model})"

# Dataclass (cleaner):
from dataclasses import dataclass

@dataclass
class Agent:
    name: str
    model: str

# Both work identically:
agent1 = Agent("assistant", "gpt-4")
print(agent1)  # -> Agent(name='assistant', model='gpt-4')`,
          pitfalls: [
            'Forgetting `self` as the first parameter in methods.',
            'Trying to use private fields without the `_` prefix — Python has no real privacy.',
            'Not importing `dataclass` and wondering why the decorator is not recognized.',
          ],
          tryIt:
            'Create a `@dataclass` Tool with fields `name: str`, `description: str`, `required_params: list[str]`. Instantiate it and print it.',
          takeaway:
            'Use `@dataclass` for simple data-holding classes. All AI structures will be dataclasses or Pydantic models.',
        },
      ],
    },
    {
      id: 'm0-s4',
      title: 'Interactive Visualization & Playground',
      topics: [
        {
          id: 'm0-t8',
          title: 'Interactive: C# ↔ Python Concept Comparator',
          explain:
            'Click any Python concept and see the C# equivalent side-by-side.',
          interactive: true,
          component: 'PythonComparison',
          pitfalls: [],
          tryIt:
            'Click different concepts (Variables, Functions, Classes, Async) and study the side-by-side code examples.',
          takeaway:
            'Use this comparator throughout the week whenever you see "Coming from .NET?" — it is your bridge.',
        },
        {
          id: 'm0-t9',
          title: 'Interactive: Python Playground',
          explain:
            'Write and run small Python code snippets in your browser to see instant results.',
          interactive: true,
          component: 'PythonPlayground',
          pitfalls: [],
          tryIt:
            'Type some Python code (e.g., list comprehensions, function definitions) and click Run. See the output instantly.',
          takeaway:
            'Use this playground to experiment with Python syntax. It is a safe way to break things and understand error messages.',
        },
      ],
    },
    {
      id: 'm0-s5',
      title: 'Project: Python Essentials',
      topics: [
        {
          id: 'm0-t10',
          title: 'Build: CLI Expense Analyzer',
          explain:
            'Create a small command-line tool that reads expense data, filters it, and prints summaries.',
          steps: [
            'Create a project folder with a venv',
            'Define an `@dataclass Expense` with fields: date, category, amount',
            'Write a function `load_expenses()` that returns a list of test expenses',
            'Write functions to filter by category and sum by month',
            'Write a main CLI loop: "1. View by category", "2. View by month", "3. Exit"',
            'Use type hints on all functions',
          ],
          code: `from dataclasses import dataclass
from datetime import datetime

@dataclass
class Expense:
    date: datetime
    category: str
    amount: float

def load_expenses() -> list[Expense]:
    return [
        Expense(datetime(2025, 1, 5), "Food", 50.0),
        Expense(datetime(2025, 1, 10), "Transport", 25.0),
        Expense(datetime(2025, 1, 10), "Food", 40.0),
    ]

def sum_by_category(expenses: list[Expense]) -> dict[str, float]:
    result = {}
    for exp in expenses:
        result[exp.category] = result.get(exp.category, 0) + exp.amount
    return result

if __name__ == "__main__":
    expenses = load_expenses()
    print("Expenses by category:")
    print(sum_by_category(expenses))`,
          whyItMatters:
            'This project practices everything in Week 1: dataclasses, type hints, control flow, functions, and a simple CLI interface. It is the foundation before building AI agents.',
          takeaway:
            'Complete this project to solidify Week 1 concepts. You will be comfortable with Python syntax and ready for LLMs in Week 2.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'aiagent-m0-proj-1',
      title: 'CLI Expense Analyzer',
      description: 'Build a command-line tool that reads expense data, filters it by category, and prints summaries. Practice dataclasses, type hints, control flow, and functions.',
      tools: ['Python 3.12', 'Dataclasses', 'Type hints'],
      link: 'https://github.com/thanthrajnaani/ai-agent-lab',
    },
  ],
}
