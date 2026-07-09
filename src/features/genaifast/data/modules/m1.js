// Module 1 — Python Essentials for GenAI, Part 2: Data & APIs
// Builds on Module 0's Python foundations with the data structures (lists, dicts, tuples,
// sets, files) and web skills (JSON, requests, .env secrets, error handling) every GenAI
// app needs. Ends with v0 of the running app — a pure-Python script that fetches a real
// weather API and prints a formatted Kundapura daily briefing. No LLM yet, on purpose.
// Consumed by the React course player (see components/TopicItem.jsx).

export const m1 = {
  id: 'm1',
  title: 'Python Essentials for GenAI, Part 2 — Data & APIs',
  hours: 6,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Building on Module 0, this module covers the Python data structures — lists, dictionaries, tuples, sets, and files — plus the web skills every GenAI app leans on: parsing and producing **JSON**, calling a real HTTP API with `requests`, and keeping secrets like API keys out of your code with a `.env` file. It ends with **Kundapura Sahayaka v0**: a plain Python script that fetches live weather for Kundapura and prints a formatted daily briefing — no LLM involved yet, on purpose, so good data habits are second nature before Module 3 brings AI into the picture.',
  sections: [
    {
      id: 'm1-s1',
      title: 'Data Structures',
      topics: [
        {
          id: 'm1-t1',
          title: 'Lists and list comprehensions',
          explain:
            'A **list** is an ordered, mutable collection of values in square brackets; a **list comprehension** builds a new list from an existing one in a single readable line.',
          analogy:
            'Think of the order slips pinned along a busy Kundapura tiffin counter during breakfast rush. They hang in a fixed left-to-right order — the first pinned slip is always "first" — and the cook can add a new slip at the end, cross one out, or swap an order without touching the others. That pinned, orderable, editable line of slips is exactly a Python **list**. A list comprehension is the cook glancing down the whole line and pulling out just the fish-thali orders in one motion, instead of walking the line slip by slip with a notebook.',
          theory:
            'A list is written as `[item1, item2, ...]` and keeps insertion order. You reach items by **index** (`dishes[0]` is the first, `dishes[-1]` is the last) and by **slice** (`dishes[1:3]` is a new list of items 1 up to, not including, 3). Lists are **mutable**: `append()` adds to the end, `insert()` adds at a position, `remove()`/`pop()` take an item out, and `dishes[0] = "..."` overwrites in place.\n\nA **list comprehension** — `[expression for item in iterable if condition]` — is the idiomatic way to build a new list from an old one. `[d for d in dishes if "fish" in d]` reads almost like English: "d, for each d in dishes, if fish is in d." It replaces the classic pattern of creating an empty list, looping, and calling `.append()` inside the loop — same result, one line, and it signals "I am building a list" at a glance.\n\nComprehensions can also transform, not just filter: `[d.title() for d in dishes]` capitalises every dish name. You can combine both: `[d.title() for d in dishes if "fish" in d]`. Keep comprehensions to one clear transformation — if the logic needs multiple conditions or nested loops that hurt readability, a plain `for` loop is the better, more maintainable choice.',
          whyItMatters:
            'Lists are the default container for "many of the same kind of thing" in Python — a list of local dishes, a list of bus stops, a list of chat messages sent to an LLM. Comprehensions are everywhere in real GenAI code (filtering retrieved document chunks, extracting text from a list of API results), so reading and writing them fluently now saves real friction from Module 4 onward.',
          steps: [
            'Create a list of five Kundapura dish names in square brackets.',
            'Access the first and last item with `[0]` and `[-1]`.',
            'Slice out a middle range with `dishes[1:3]` and print it.',
            'Mutate the list: `append()` a new dish, then overwrite an existing index.',
            'Write a list comprehension that filters dishes containing `"fish"`.',
            'Write a second comprehension that title-cases every dish name.',
          ],
          code: `# A list of local dishes for Kundapura Sahayaka
dishes = ["neer dosa", "kori rotti", "fish thali", "kotte kadubu", "kane fish curry"]

# Indexing and slicing
print(dishes[0])        # 'neer dosa'
print(dishes[-1])       # 'kane fish curry'
print(dishes[1:3])      # ['kori rotti', 'fish thali']

# Lists are mutable
dishes.append("chicken sukka")
dishes[0] = "neer dosa (rice crepe)"

# List comprehension: build a new list from an existing one
fish_dishes = [d for d in dishes if "fish" in d]
print(fish_dishes)      # ['fish thali', 'kane fish curry']

# Comprehensions can transform too
titled = [d.title() for d in dishes]
print(titled)

# Combine filter + transform in one line
fish_titled = [d.title() for d in dishes if "fish" in d]
print(fish_titled)      # ['Fish Thali', 'Kane Fish Curry']`,
          pitfalls: [
            '**Confusing `append()` with `extend()`.** `list.append([1, 2])` adds one nested list as a single item; `list.extend([1, 2])` adds each item separately. Fix: use `extend()` (or `+`) when merging two lists.',
            '**Off-by-one slicing.** `dishes[1:3]` stops *before* index 3, not at it. Fix: remember slices are "up to, not including" the end index.',
            '**Modifying a list while iterating over it.** Removing items inside a `for item in my_list:` loop skips elements unpredictably. Fix: iterate over a copy (`for item in my_list[:]:`) or build a new list instead.',
            '**Assuming `b = a` copies a list.** Both names point to the *same* list, so changing `b` changes `a` too. Fix: copy explicitly with `a[:]`, `list(a)`, or `copy.deepcopy(a)` for nested lists.',
            '**Writing an unreadable comprehension.** Stacking multiple `for`/`if` clauses in one line becomes a puzzle. Fix: fall back to a plain `for` loop once a comprehension stops being obviously readable.',
            '**Using a list where a set would be faster.** Checking `"fish thali" in dishes` scans the whole list every time. Fix: for frequent membership checks, use a `set` (next topic).',
          ],
          tryIt:
            'Given `bus_stops = ["Kundapura", "Gangolli", "Kollur", "Baindoor", "Trasi"]`, write one list comprehension that returns only stops with more than 7 letters, and a second that returns every stop name in uppercase.',
          takeaway:
            'Lists are Python\'s ordered, mutable, go-to collection; list comprehensions build a filtered or transformed list from one in a single readable line.',
        },
        {
          id: 'm1-t2',
          title: 'Dictionaries — the shape of almost every LLM request/response payload',
          explain:
            'A **dictionary** stores `key: value` pairs instead of positions — you look things up by name (`menu["fish thali"]`), and nested dicts are exactly what an LLM API request or response looks like.',
          analogy:
            'A list is a line of order slips read by position; a dictionary is the **price board** hanging behind a Kundapura eatery counter — you do not ask for "item number two," you ask "what does fish thali cost?" and read straight off the name. Every board entry is a named pair: dish name on the left, price on the right. When one board entry points to *another* board (say, a nested list of today\'s specials under "specials"), that is exactly a nested dictionary — and it is precisely the shape you will see the moment you open any LLM API\'s request or response body.',
          theory:
            'A dict literal looks like `{"key": value, "key2": value2}`. Keys must be **hashable** (strings, numbers, tuples — not lists or other dicts); values can be anything, including other dicts or lists. Look up a value with `menu["fish thali"]` — this raises `KeyError` if the key is missing. The safer `menu.get("kane curry", "not on the menu today")` returns a default instead of crashing.\n\nCommon operations: `menu["kane curry"] = 180` adds or overwrites a key; `"fish thali" in menu` checks for a **key** (not a value); `.keys()`, `.values()`, and `.items()` give you the names, the prices, and the (name, price) pairs respectively — `for name, price in menu.items():` is the idiomatic way to loop over both at once.\n\nThe reason this topic matters far beyond a menu: **every LLM API call and response is a nested dict.** A chat request to Anthropic or OpenAI looks like `{"model": "...", "messages": [{"role": "user", "content": "..."}]}` — a dict, containing a list, containing more dicts. Reading `chat_request["messages"][0]["content"]` (dict access, then list index, then dict access again) is a skill you will use constantly from Module 3 onward. Python also supports **dict comprehensions** — `{d: len(d) for d in dishes}` — mirroring list comprehensions but building key/value pairs.',
          whyItMatters:
            'You cannot call an LLM API, read its JSON response, build a RAG document record, or configure an agent tool without fluently reading and writing nested dicts. Getting comfortable with `.get()`, safe nested access, and dict comprehensions now means the request/response payloads in Module 3 onward will look familiar on day one instead of intimidating.',
          steps: [
            'Create a `menu` dict mapping three dish names to their ₹ prices.',
            'Look up an existing key with `[]`, then a missing key safely with `.get(..., default)`.',
            'Add a new key and overwrite an existing one.',
            'Loop over `.items()` to print every name and price.',
            'Build a nested dict shaped like an LLM chat request (`model`, `max_tokens`, `messages`).',
            'Access the nested `content` field with a chained `["messages"][0]["content"]` lookup.',
          ],
          code: `# A "menu board" for a Kundapura eatery, as a dict
menu = {
    "neer dosa": 40,
    "kori rotti": 90,
    "fish thali": 150,
}

print(menu["fish thali"])                                  # 150
print(menu.get("kane curry", "not on the menu today"))     # safe lookup with a default

menu["kane curry"] = 180     # add a new key
menu["fish thali"] = 160     # update an existing key

for name, price in menu.items():
    print(f"{name}: Rs {price}")

# Nested dicts are exactly what an LLM API request/response looks like:
chat_request = {
    "model": "claude-sonnet-4-5",
    "max_tokens": 300,
    "messages": [
        {"role": "user", "content": "What is neer dosa?"},
    ],
}
print(chat_request["messages"][0]["content"])   # 'What is neer dosa?'

# Dict comprehension: build a lookup from a list
dishes = ["neer dosa", "kori rotti", "fish thali"]
name_lengths = {d: len(d) for d in dishes}
print(name_lengths)   # {'neer dosa': 9, 'kori rotti': 10, 'fish thali': 10}`,
          pitfalls: [
            '**Using `[]` on a key that might be missing.** `menu["dosa"]` raises `KeyError` and crashes the program. Fix: use `.get("dosa", default)` whenever the key is not guaranteed to exist.',
            '**Checking `"150" in menu` expecting to find a value.** The `in` operator on a dict checks **keys**, not values. Fix: use `150 in menu.values()` if you truly need to search values.',
            '**Assuming dict order does not matter.** Since Python 3.7 dicts preserve insertion order, but relying on that for correctness (instead of readability) is fragile. Fix: sort explicitly if order affects logic.',
            '**Deep-indexing into an API response without checking a step exists.** `data["messages"][0]["content"]` crashes the moment any level is missing (e.g. an error response). Fix: check keys exist, or use `.get()` at each level, before assuming the "happy path" shape.',
            '**Silently overwriting a key.** `menu["fish thali"] = 160` replaces the old value with no warning. Fix: check `if key in menu:` first if overwriting should be intentional and logged.',
            '**Trying to use a list as a dict key.** Keys must be hashable; `{[1,2]: "x"}` raises `TypeError`. Fix: use a tuple instead of a list when you need a compound key.',
          ],
          tryIt:
            'Build a dict `seva_times` mapping three temple seva names to their start times (e.g. `"Maha Pooja": "07:00"`). Print a friendly sentence for each using `.items()`, then safely look up a seva that is not in the dict using `.get()` with a default of `"timing not listed"`.',
          takeaway:
            'Dicts map names to values and nest freely — exactly the shape of every LLM API payload — so `.get()`, `.items()`, and comfortable nested access are non-negotiable GenAI skills.',
        },
        {
          id: 'm1-t3',
          title: 'Tuples, sets, and when to reach for each',
          explain:
            'A **tuple** is an ordered, *immutable* sequence — perfect for values that should never change, like coordinates; a **set** is an unordered collection of unique values, perfect for fast membership checks and de-duplication.',
          analogy:
            'A tuple is like Kundapura\'s printed latitude/longitude on a map — `(13.63, 74.69)` is fixed; no one edits the town\'s coordinates after the map is printed. A set is like a temple committee\'s guest-arrived register at the door: it does not care about the order people walked in, only *who has already been ticked off* — and checking "has this person already entered?" needs to be instant even with a long queue, which is exactly what a set is built for.',
          theory:
            'A **tuple** is written with parentheses (or often just commas): `(13.63, 74.69)`. Like a list it is ordered and index-able (`coords[0]`), but unlike a list it is **immutable** — once created, you cannot reassign an element (`coords[0] = 14.0` raises `TypeError`). Tuples are ideal for fixed, related values that travel together and should never accidentally be mutated: coordinates, an (x, y) point, a (status_code, message) pair. Tuple **unpacking** — `lat, lon = coords` — is the idiomatic way to pull them apart. A single-item tuple needs a trailing comma: `(13.63,)`, otherwise Python just sees parentheses around a plain value.\n\nA **set** is written with curly braces: `{"system", "user", "assistant"}`. It stores only unique values (duplicates are silently dropped), has no guaranteed order, and cannot contain unhashable items like lists or dicts. Its superpower is speed: checking `"user" in allowed_roles` is roughly constant-time no matter how large the set grows, versus a list where membership checks get slower as the list gets longer. Sets also support algebra you will reach for often: `a | b` (union), `a & b` (intersection), `a - b` (difference) — e.g. "which buses go to both Gangolli and Kollur" is an intersection of two sets.\n\nRule of thumb: **list** when order matters and duplicates are fine; **tuple** when the values are fixed and should not change; **set** when you only care about uniqueness or fast "have I seen this?" checks; **dict** when each value needs a name.',
          whyItMatters:
            'Coordinates for an API call, a fixed `(status_code, message)` pair, or an immutable config value are naturally tuples; de-duplicating retrieved document chunks or checking "is this role allowed?" against a small fixed list are naturally sets. Picking the right container is a small decision that shows up in every GenAI script you write, including the very API call this module builds toward.',
          steps: [
            'Write `KUNDAPURA_COORDS = (13.63, 74.69)` and unpack it into `lat, lon`.',
            'Try (and see fail) reassigning `KUNDAPURA_COORDS[0]` to confirm immutability.',
            'Create a set `ALLOWED_ROLES` of the three valid chat roles.',
            'Check membership with `in` and note it works the same syntax as a list, just faster.',
            'Build a set from a list with duplicates and observe the duplicates disappear.',
            'Compute a union or intersection of two small sets, e.g. bus routes.',
          ],
          code: `# A tuple: fixed, ordered, immutable — perfect for coordinates that never change
KUNDAPURA_COORDS = (13.63, 74.69)   # (latitude, longitude)
lat, lon = KUNDAPURA_COORDS          # unpacking
print(f"lat={lat}, lon={lon}")

# KUNDAPURA_COORDS[0] = 14.0        # TypeError: 'tuple' object does not support item assignment

# A set: unordered, unique membership — great for fast "have I seen this?" checks
ALLOWED_ROLES = {"system", "user", "assistant"}
print("user" in ALLOWED_ROLES)       # True, checked in roughly O(1)

# Duplicates collapse automatically
festival_names = ["Ugadi", "Deepavali", "Ugadi", "Makar Sankranti", "Deepavali"]
unique_festivals = set(festival_names)
print(unique_festivals)              # {'Ugadi', 'Deepavali', 'Makar Sankranti'} (order not guaranteed)

# Set algebra: buses serving two different routes
gangolli_buses = {"101", "104", "107"}
kollur_buses = {"104", "110", "107"}
print(gangolli_buses & kollur_buses)  # intersection: {'104', '107'} — buses serving both
print(gangolli_buses | kollur_buses)  # union: every bus serving either route`,
          pitfalls: [
            '**Trying to mutate a tuple.** `coords[0] = 14.0` raises `TypeError`. Fix: build a new tuple, or use a list if the values genuinely need to change.',
            '**Forgetting the trailing comma on a one-item tuple.** `(13.63)` is just the float `13.63` in parentheses, not a tuple. Fix: write `(13.63,)`.',
            '**Using a list for frequent membership checks.** `role in allowed_roles_list` re-scans the whole list every call. Fix: use a `set` when you check membership often.',
            '**Assuming a set keeps insertion or sorted order.** Iterating a set can print items in any order. Fix: convert to a `sorted(list(...))` if order matters for display.',
            '**Putting an unhashable value in a set.** `{["a", "b"]}` raises `TypeError: unhashable type: list`. Fix: use a tuple instead of a list if you need it inside a set.',
            '**Reaching for a tuple when the data will genuinely need to grow or change.** Fix: use a list (or dict) for anything you expect to mutate later.',
          ],
          tryIt:
            'Given `today_buses = {"101", "104", "108", "110"}` and `festival_buses = {"104", "108", "115"}`, compute which buses run *only* today (not on the festival list) using set difference (`-`), and which run on both using intersection (`&`).',
          takeaway:
            'Reach for a tuple when values are fixed and travel together (coordinates), a set when you only need uniqueness or fast membership checks, a list when order and duplicates matter, and a dict when values need names.',
        },
        {
          id: 'm1-t4',
          title: 'Reading and writing files, and working with paths (pathlib)',
          explain:
            'Python reads and writes files with `open()` inside a `with` block, always specifying `encoding="utf-8"` for Kannada text to survive; `pathlib.Path` builds file paths as objects instead of fragile, OS-specific strings.',
          analogy:
            'Writing to a file is like the committee secretary filling a page in the physical register: you open the right page (`open()`), write clearly (`.write()`), and — critically — close the book properly when done so the ink is not left to smudge or the page torn out mid-sentence. A `with` block is the secretary who *always* closes the book, even if something goes wrong mid-entry. `pathlib.Path` is the shelf-labelling system at the parish office: instead of scribbling "folder-backslash-subfolder-backslash-file" by hand (which breaks the moment someone opens the same cupboard on a different kind of shelving), you build the address as clean, joinable labels that work on any shelf, any operating system.',
          theory:
            'The classic way to touch a file: `with open(path, mode, encoding="utf-8") as f:`. The `with` block is a **context manager** — it guarantees the file is closed automatically, even if an exception happens inside. Common modes: `"r"` (read, file must exist), `"w"` (write, creates or **overwrites** the whole file), `"a"` (append to the end). Always pass `encoding="utf-8"` explicitly — on Windows, Python\'s default encoding is not UTF-8, so Kannada text like "ಕುಂದಾಪುರ" can come back mangled or raise an error without it.\n\n`pathlib.Path` (standard library) represents a path as an **object**, not a plain string. `Path(__file__).parent / "data"` builds a path by joining pieces with `/` — this works identically on Windows, macOS, and Linux, unlike hand-built strings with backslashes or forward slashes. Useful methods: `.mkdir(parents=True, exist_ok=True)` creates a folder (and any missing parent folders) without erroring if it already exists; `.exists()` checks presence; `.suffix` gives the extension; and for simple cases, `Path.write_text(...)` / `Path.read_text(...)` skip the `open()`/`with` boilerplate entirely while still accepting `encoding="utf-8"`.\n\nA practical rule: use plain `open()`/`with` when you need fine control (streaming, binary mode, multiple writes), and `Path.read_text()`/`write_text()` for quick one-shot reads and writes — both are correct Python, pick based on how much control the moment needs.',
          whyItMatters:
            'Module 4-5\'s RAG knowledge base is a folder of markdown files Sahayaka reads with exactly this pattern, and this module\'s own project caches a daily briefing to disk as JSON. Getting UTF-8 encoding and cross-platform paths right now avoids two of the most common "works on my machine" bugs beginners hit with file I/O.',
          steps: [
            'Build a `data` folder path with `Path(__file__).parent / "data"` and create it with `.mkdir(parents=True, exist_ok=True)`.',
            'Open a file for writing with `encoding="utf-8"` inside a `with` block and write a Kannada and an English line.',
            'Open the same file for reading and print its contents back.',
            'Rewrite the same read/write using the shorter `Path.write_text()` / `Path.read_text()` methods.',
            'Check `.exists()` and `.suffix` on the resulting `Path` object.',
            'Deliberately omit `encoding="utf-8"` once on Windows and observe the Kannada text break, then fix it.',
          ],
          code: `from pathlib import Path

# pathlib.Path represents a filesystem path as an object, not a raw string
data_dir = Path(__file__).parent / "data"
data_dir.mkdir(parents=True, exist_ok=True)     # create the folder if it's missing

briefing_file = data_dir / "briefing.txt"

# Writing — always specify UTF-8 explicitly so Kannada text round-trips cleanly
with open(briefing_file, "w", encoding="utf-8") as f:
    f.write("ಕುಂದಾಪುರ ಸಹಾಯಕ ದೈನಂದಿನ ವರದಿ\\n")
    f.write("Today's Kundapura briefing\\n")

# Reading it back
with open(briefing_file, "r", encoding="utf-8") as f:
    content = f.read()
print(content)

# pathlib shortcuts skip the "with open(...)" boilerplate for simple cases
briefing_file.write_text("Updated briefing\\n", encoding="utf-8")
print(briefing_file.read_text(encoding="utf-8"))

print(briefing_file.exists())     # True
print(briefing_file.suffix)       # '.txt'`,
          pitfalls: [
            '**Omitting `encoding="utf-8"`.** On Windows, the default codec can mangle or crash on Kannada text. Fix: always pass `encoding="utf-8"` to `open()`, `write_text()`, and `read_text()`.',
            '**Forgetting the `with` block.** A file opened without one may not flush or close properly, especially if an error occurs mid-write. Fix: always use `with open(...) as f:`.',
            '**Using `"w"` when you meant `"a"`.** Write mode silently erases the file\'s previous contents. Fix: use `"a"` to append, `"w"` only when a fresh, empty file is intended.',
            '**Hand-building paths with `"data\\\\file.txt"`.** These break across operating systems. Fix: use `Path("data") / "file.txt"` instead of string concatenation.',
            '**Writing to a folder that does not exist yet.** Raises `FileNotFoundError`. Fix: call `.mkdir(parents=True, exist_ok=True)` on the parent directory first.',
            '**Reading a huge file all at once with `.read()`.** Fine for small text files, wasteful or crash-prone for large ones. Fix: stream line-by-line with `for line in f:` for big files.',
          ],
          tryIt:
            'Write a function `load_lines(path)` that reads a text file of bus timetable entries (one per line, UTF-8) and returns them as a list of strings with trailing newlines stripped. Test it against a small file you create with `Path.write_text()`.',
          takeaway:
            'Always read/write text with `encoding="utf-8"` inside a `with` block (or via `Path.read_text()`/`write_text()`), and build paths with `pathlib.Path` instead of fragile OS-specific strings.',
        },
      ],
    },
    {
      id: 'm1-s2',
      title: 'Talking to the Web',
      topics: [
        {
          id: 'm1-t5',
          title: 'JSON: parsing, dumping, and nested structures (json.loads/dumps)',
          explain:
            '**JSON** (JavaScript Object Notation) is the universal text format APIs speak; Python\'s `json` module converts between JSON text and native Python objects with `json.loads()` (parse) and `json.dumps()` (produce).',
          analogy:
            'JSON is the standard order-slip format every counter in town agrees to use — the fish stall, the bus office, and the temple committee desk can all read the same slip shape even though each is run by a different family with a different handwriting style. `json.loads()` is reading a filled slip someone handed you into your own working notes (a Python dict); `json.dumps()` is writing your own notes back out onto a slip in the format everyone else can read — including a computer in another country running an entirely different programming language.',
          theory:
            'JSON has exactly six kinds of values, and each maps onto a native Python type: JSON *objects* `{...}` become Python **dicts**, JSON *arrays* `[...]` become Python **lists**, JSON *strings* become **str**, JSON *numbers* become **int** or **float**, and JSON\'s `true`/`false`/`null` become Python\'s `True`/`False`/`None`. This mapping is why working with JSON in Python feels natural — you are really just working with dicts and lists.\n\n`json.loads(text)` parses a JSON **string** into Python objects. `json.dumps(obj)` does the reverse: Python objects into a JSON **string**. Two dumps options matter constantly: `indent=2` pretty-prints for readability (logs, debugging), and `ensure_ascii=False` stops non-ASCII text — Kannada included — from being escaped into unreadable `\\uXXXX` sequences. For files, `json.dump(obj, f)` and `json.load(f)` (no "s") read/write directly to an already-open file object, skipping the manual string step.\n\nJSON is stricter than Python literals: it requires **double** quotes around strings and keys (no single quotes), has no trailing commas, and has no tuple or set types — dumping a tuple silently becomes a JSON array (fine), but dumping a set raises `TypeError` (sets are not JSON-serializable; convert to a list first). This module\'s project writes its briefing to disk as JSON for exactly this reason: it is the natural, language-agnostic format for structured data that later modules (and other tools) will read back.',
          whyItMatters:
            'Every LLM API call and response body is JSON on the wire — the `requests` library\'s `.json()` method (next topic) is really just calling `json.loads()` for you. Comfortably reading nested JSON, and knowing why `ensure_ascii=False` matters for Kannada, is what stands between you and either fluent API work or hours of "why did my text turn into `\\u0c95\\u0cc1...`" debugging.',
          steps: [
            'Build a nested Python dict/list structure representing a briefing (location, coords, notes).',
            'Convert it to JSON text with `json.dumps(..., indent=2, ensure_ascii=False)` and print it.',
            'Parse that text back with `json.loads()` and access a nested field.',
            'Write the same structure straight to a file with `json.dump()`.',
            'Read it back with `json.load()` and confirm the round trip matches.',
            'Try dumping a `set` and observe the `TypeError`; fix it by converting to a `list` first.',
          ],
          code: `import json
from pathlib import Path

# A Python dict/list structure — this is exactly what json.dumps turns into JSON text
briefing = {
    "location": "Kundapura",
    "coords": {"lat": 13.63, "lon": 74.69},
    "notes": [
        "Kori rotti stalls open near the bus stand",
        "Ferry to Gangolli runs on schedule",
    ],
}

# dumps: Python object -> JSON string
json_text = json.dumps(briefing, indent=2, ensure_ascii=False)
print(json_text)

# loads: JSON string -> Python object
parsed = json.loads(json_text)
print(parsed["coords"]["lat"])          # 13.63 (nested dict access)
print(parsed["notes"][0])               # first note

# Reading/writing JSON straight to a file
out_file = Path("briefing.json")
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(briefing, f, indent=2, ensure_ascii=False)

with open(out_file, "r", encoding="utf-8") as f:
    reloaded = json.load(f)
print(reloaded == briefing)   # True — the round trip preserved everything

# Sets are NOT JSON-serializable — convert to a list first:
# json.dumps({"buses": {"101", "104"}})       # raises TypeError
json.dumps({"buses": list({"101", "104"})})   # OK`,
          pitfalls: [
            '**Confusing `loads`/`dumps` (strings) with `load`/`dump` (files).** Passing a file object to `json.loads()` raises an error. Fix: use the "s" versions for strings, the plain versions for open file objects.',
            '**Forgetting `ensure_ascii=False`.** Kannada and other non-ASCII text gets escaped into unreadable `\\uXXXX` sequences. Fix: always pass `ensure_ascii=False` when the data may contain non-English text.',
            '**Trying to `json.dumps()` a set.** Raises `TypeError: Object of type set is not JSON serializable`. Fix: convert with `list(my_set)` before dumping.',
            '**Hand-writing JSON with single quotes or a trailing comma.** `json.loads()` rejects both — JSON is stricter than Python syntax. Fix: use double quotes for all strings/keys and no trailing commas.',
            '**Assuming every API response is JSON.** Calling `.json()` (or `json.loads()`) on an HTML error page raises `json.JSONDecodeError`. Fix: check the response looks like JSON (or check status code) before parsing.',
            '**Treating `None` and JSON `null` as different things to worry about.** They map automatically both directions. Fix: nothing to fix — just remember `None` on the Python side is `null` on the wire.',
          ],
          tryIt:
            'Build a nested dict for a seva timing announcement with keys `temple`, `seva_name`, and a nested `timing` dict of `{"start": "07:00", "end": "08:00"}`, including at least one Kannada value. Dump it to a pretty-printed JSON string with `ensure_ascii=False`, then parse it back and print the nested `start` time.',
          takeaway:
            '`json.loads`/`dumps` convert between JSON text and Python dicts/lists in both directions — use `ensure_ascii=False` for non-English text and remember sets are not JSON-serializable.',
        },
        {
          id: 'm1-t6',
          title: 'The requests library — GET/POST, headers, query params',
          explain:
            'The third-party `requests` library is the standard way to call an HTTP API from Python: `requests.get()` asks for data with query parameters, `requests.post()` sends a data payload (usually JSON), and every call returns a `Response` object with `.status_code`, `.json()`, and `.text`.',
          analogy:
            'Calling an API with `requests` is like using the counter phone at the Kundapura bus office. A **GET** request is asking a question over the phone — "what time is the next Gangolli bus?" — you supply a few short details (query parameters) and expect an answer back, without handing anything over. A **POST** request is mailing in a filled application form — you are submitting a structured payload (the JSON body) for the office to act on, not just asking a question. Either way, `requests` is the phone line itself, and headers are like stating your reason for calling before you ask ("this is regarding a seasonal pass") so the office routes you correctly.',
          theory:
            'Install with `pip install requests` (not built into the standard library, unlike `json`). A **GET** request fetches data and is built with `requests.get(url, params={...}, timeout=10)` — `params` is a dict that `requests` automatically encodes into the URL\'s query string (e.g. `?latitude=13.63&longitude=74.69`). A **POST** request sends a payload, typically with `requests.post(url, json={...}, headers={...}, timeout=10)` — passing a dict to `json=` automatically serializes it and sets the `Content-Type: application/json` header for you (this is different from `data=`, which sends form-encoded data instead).\n\nEvery call returns a `Response` object: `.status_code` is the numeric HTTP result (200 means success), `.ok` is a convenient `True`/`False` shortcut for "2xx", `.json()` parses the response body as JSON straight into a Python dict/list (equivalent to `json.loads(response.text)`), and `.text` gives the raw response body as a string for anything that is not JSON.\n\n**`headers`** is a plain dict passed to either call — commonly used for authentication (`{"x-api-key": "..."}` or `{"Authorization": "Bearer ..."}`) and content negotiation. Always pass a `timeout` (in seconds) — without one, a hung server can freeze your script indefinitely. This exact GET pattern — a base URL plus a `params` dict — is precisely how Sahayaka v0 will fetch live weather from Open-Meteo\'s free, key-free API for Kundapura\'s coordinates.',
          whyItMatters:
            '`requests` is the single most-used third-party Python library for talking to any web API — weather, maps, and, from Module 3 onward, LLM providers you call directly instead of through their SDK. GET-with-params versus POST-with-a-JSON-body is a distinction you will use in nearly every script this course builds.',
          steps: [
            'Install `requests` with `pip install requests` if not already available.',
            'Build a `params` dict of latitude, longitude, and requested fields for Open-Meteo.',
            'Call `requests.get(url, params=params, timeout=10)` and inspect `.status_code`.',
            'Call `.json()` on the response and read a nested field from the parsed dict.',
            'Sketch a `requests.post(url, json=payload, headers=headers, timeout=10)` call for a hypothetical API.',
            'Compare what `params=` (GET, query string) versus `json=` (POST, request body) each produce.',
          ],
          code: `import requests

# GET: ask a question via URL + query parameters
url = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": 13.63,
    "longitude": 74.69,
    "current": "temperature_2m,weather_code,wind_speed_10m",
    "timezone": "Asia/Kolkata",
}
response = requests.get(url, params=params, timeout=10)
print(response.status_code)      # 200 on success
print(response.ok)               # True for any 2xx status

data = response.json()           # parsed straight into a Python dict
print(data["current"]["temperature_2m"])

# POST: send a JSON body (this is the shape every LLM chat API expects)
# Illustrative — a real call needs a valid endpoint and auth headers:
headers = {"Content-Type": "application/json"}
payload = {"city": "Kundapura", "unit": "celsius"}
# post_response = requests.post(
#     "https://example.com/api/weather", json=payload, headers=headers, timeout=10
# )`,
          pitfalls: [
            '**Forgetting `timeout=`.** A stuck connection can hang the script forever with no error. Fix: always pass a `timeout` in seconds to every `requests` call.',
            '**Using `data=` instead of `json=` for a JSON payload.** `data=` sends form-encoded text and does not set the JSON content-type header. Fix: pass a dict to `json=` when the API expects a JSON body.',
            '**Calling `.json()` before checking the response succeeded.** An error page or empty body raises `json.JSONDecodeError`. Fix: check `.status_code`/`.ok` first (or use `raise_for_status()`, next topic).',
            '**Confusing `params` (GET query string) with `json` (POST body).** Passing `json=` to a GET request that expects query params silently does nothing useful for that API. Fix: match the argument to what the specific endpoint documents.',
            '**Hardcoding an API key directly into `headers`.** It ends up committed to source control. Fix: load secrets from environment variables (next topic).',
            '**Assuming every 200 response means "the data I wanted."** Some APIs return 200 with an error message in the body. Fix: also check the JSON payload\'s own status/error fields, not just the HTTP status code.',
          ],
          tryIt:
            'Using `requests.get()`, call `https://api.open-meteo.com/v1/forecast` with Kundapura\'s coordinates and `"current": "temperature_2m"` in `params`, `timeout=10`. Print the HTTP status code and the current temperature from the parsed JSON.',
          takeaway:
            '`requests.get(url, params=...)` asks for data via query parameters, `requests.post(url, json=...)` submits a JSON payload, and every response carries `.status_code`, `.json()`, and `.text` — always pass a `timeout`.',
        },
        {
          id: 'm1-t7',
          title: 'Environment variables and .env files — never hardcode API keys (python-dotenv)',
          explain:
            'API keys and other secrets belong in a `.env` file loaded into environment variables at runtime — never typed directly into your `.py` source — and `python-dotenv`\'s `load_dotenv()` plus `os.getenv()` is the standard way to do it.',
          analogy:
            'An API key is like the key to the temple committee\'s cash box. You would never tape it to the front door where anyone walking past — or anyone who later photographs the door — can see it; you keep it on a separate hook that only the person on duty checks. Hardcoding a key into your `.py` file is taping it to the door: the moment that file is shared, screenshotted, or pushed to GitHub, the key is public. A `.env` file is the separate hook — kept out of the shared code, checked only at the moment the program actually needs it, and never handed to anyone who did not need to see it.',
          theory:
            'Every operating system process has **environment variables** — a set of `KEY=value` strings available to any program that process runs. Python reads them via the `os` module: `os.environ["ANTHROPIC_API_KEY"]` (raises `KeyError` if missing) or the safer `os.getenv("ANTHROPIC_API_KEY")` (returns `None` if missing, or takes a `os.getenv("KEY", "default")`).\n\nSetting real environment variables by hand every terminal session is tedious, so the convention is a **`.env` file** — a plain text file in the project root with one `KEY=value` pair per line, e.g. `ANTHROPIC_API_KEY=sk-ant-...`. The third-party `python-dotenv` package (`pip install python-dotenv`) reads that file and loads its pairs into the process\'s environment variables when you call `load_dotenv()` at the top of your script — after that, `os.getenv("ANTHROPIC_API_KEY")` sees it exactly as if it had been set in the shell.\n\nTwo files matter here: **`.env`** holds your real secrets and must be listed in `.gitignore` so it is never committed; **`.env.example`** (safe to commit) lists the *names* of the variables the project needs, with placeholder or empty values, so a teammate (or future you) knows what to fill in without ever seeing the real key. Sahayaka v0\'s weather API needs no key at all (Open-Meteo is free and key-free), but this module wires up `.env`/`python-dotenv` anyway — establishing the habit now means Module 3\'s Anthropic/OpenAI/Groq key slots in with zero new concepts.',
          whyItMatters:
            'A leaked API key is one of the most common, most avoidable real-world mistakes in GenAI projects — leaked keys get scraped from public GitHub repos within minutes and used until the bill arrives. Building the `.env` habit in a module that does not even strictly need it means it is automatic by the time a real, billable key shows up in Module 3.',
          steps: [
            'Create a `.env` file in the project root with a placeholder key, e.g. `ANTHROPIC_API_KEY=sk-ant-example`.',
            'Add `.env` to `.gitignore` before writing any real secret into it.',
            'Install `python-dotenv` with `pip install python-dotenv`.',
            'Call `load_dotenv()` near the top of your script, before any `os.getenv()` calls.',
            'Read the key with `os.getenv("ANTHROPIC_API_KEY")` and check it is not `None` before using it.',
            'Create a matching `.env.example` with the variable name but no real value, and commit that instead.',
          ],
          code: `# .env  (create this file in your project root — NEVER commit it)
# ANTHROPIC_API_KEY=sk-ant-your-real-key-here
# OPENWEATHER_API_KEY=your-real-key-here

# .env.example  (safe to commit — documents what's needed, no real values)
# ANTHROPIC_API_KEY=
# OPENWEATHER_API_KEY=

from dotenv import load_dotenv
import os

load_dotenv()   # reads .env in the current directory into process environment variables

api_key = os.getenv("ANTHROPIC_API_KEY")   # None if missing — never crashes outright
if not api_key:
    raise RuntimeError("Missing ANTHROPIC_API_KEY — add it to your .env file")

print(f"Key loaded, starts with: {api_key[:7]}...")   # never print the full key

# .gitignore
# .env`,
          pitfalls: [
            '**Hardcoding a key as a string literal in a `.py` file.** It ends up in version control history forever, even if deleted later. Fix: always load secrets from the environment.',
            '**Committing `.env` to git.** Once pushed, the key is exposed even after the file is later removed. Fix: add `.env` to `.gitignore` *before* the first commit that touches it.',
            '**Forgetting to call `load_dotenv()`.** `os.getenv()` then only sees real OS environment variables, not `.env`\'s contents, and quietly returns `None`. Fix: call `load_dotenv()` early, before any `os.getenv()` calls.',
            '**Using `os.environ["KEY"]` when the key might be missing.** Raises an uncaught `KeyError` with a confusing traceback. Fix: use `os.getenv("KEY")` and check for `None` with a clear error message.',
            '**Printing or logging the full secret value.** It can leak via terminal history, screenshots, or shared logs. Fix: print only a short, non-identifying prefix, like `api_key[:7]`.',
            '**Sharing a `.env` file over chat or email "just this once."** Secrets shared informally are effectively public. Fix: share only `.env.example`; hand real values over a secure channel if truly necessary.',
          ],
          tryIt:
            'Create a `.env` file with a fake `WEATHER_UNIT=celsius` entry, add `.env` to `.gitignore`, then write a script that calls `load_dotenv()` and prints the unit — falling back to `"celsius"` via `os.getenv("WEATHER_UNIT", "celsius")` if the variable is ever missing.',
          takeaway:
            'Load secrets from a `.env` file via `python-dotenv`\'s `load_dotenv()` and `os.getenv()` — never type an API key directly into source code, and always keep `.env` out of git.',
        },
        {
          id: 'm1-t8',
          title: 'Handling errors: status codes, timeouts, and simple retries',
          explain:
            'Real networks fail: distinguish client errors (4xx, your request was wrong — do not retry blindly) from server errors (5xx, their problem — worth a retry), always set a `timeout`, and wrap flaky calls in a small retry loop with backoff.',
          analogy:
            'Calling an API is like phoning the Kundapura ferry office during the monsoon. Sometimes the line just does not connect — worth hanging up and trying again in a moment. Sometimes someone picks up and says "wrong number, this is not the ferry office" — calling that same wrong number five more times will not fix it. And sometimes you get put on hold forever with no one ever answering — that is exactly why you set a limit on how long you will wait before giving up and trying again. Good error handling is knowing which of these three is happening and reacting differently to each.',
          theory:
            'HTTP status codes fall into families: **2xx** means success; **4xx** means *your* request was wrong in some way — a bad URL, missing/invalid API key (401/403), not found (404), rate-limited (429) — retrying the exact same request will usually fail the same way again (except 429, which is worth a delayed retry); **5xx** means the *server* had a problem — worth retrying, since the same request might succeed moments later. Calling `response.raise_for_status()` turns a 4xx/5xx response into a Python exception (`requests.exceptions.HTTPError`) instead of letting you accidentally treat an error page as good data.\n\nBeyond bad status codes, a request can fail before any response arrives: `requests.exceptions.Timeout` (the server took too long — only happens if you set a `timeout`), and `requests.exceptions.ConnectionError` (no network path to the server at all). Both are worth catching separately from `HTTPError` because the *cause* is different from "the server answered but did not like the request."\n\nA **simple retry loop** wraps the call in a `for attempt in range(1, max_retries + 1):`, catches the specific exceptions worth retrying, and waits between attempts — ideally with **exponential backoff** (`time.sleep(2 ** attempt)`: 2s, 4s, 8s...) so repeated failures do not hammer a struggling server. Critically, a well-behaved retry loop does *not* retry a 4xx client error (except perhaps 429) — it re-raises immediately, because retrying will not fix a bad request. After all retries are exhausted, raise a clear error rather than silently returning nothing.',
          whyItMatters:
            'A production script that crashes the moment a weather API has one bad second is not production-ready — and this exact pattern (timeout, distinguish 4xx from 5xx, retry with backoff) is precisely what you will need again calling an LLM API that occasionally returns a 429 rate-limit or a transient 500 in Module 3 onward.',
          steps: [
            'Wrap a `requests.get()` call in a `try/except` catching `Timeout`, `HTTPError`, and `ConnectionError` separately.',
            'Call `response.raise_for_status()` so bad status codes become catchable exceptions.',
            'On an `HTTPError`, check the status code: re-raise immediately for 4xx, retry for 5xx.',
            'Wrap the whole attempt in a `for attempt in range(1, max_retries + 1):` loop.',
            'Add `time.sleep(2 ** attempt)` between attempts for exponential backoff.',
            'After the loop exhausts all retries, raise a clear `RuntimeError` explaining the failure.',
          ],
          code: `import time
import requests

def fetch_weather(url, params, max_retries=3, timeout=10):
    for attempt in range(1, max_retries + 1):
        try:
            response = requests.get(url, params=params, timeout=timeout)
            response.raise_for_status()   # turns 4xx/5xx into an exception
            return response.json()

        except requests.exceptions.Timeout:
            print(f"Attempt {attempt}: timed out, retrying...")

        except requests.exceptions.HTTPError as e:
            status = e.response.status_code
            if 400 <= status < 500 and status != 429:
                # Client error (bad request/key) — retrying won't help, fail fast
                raise
            print(f"Attempt {attempt}: server/rate-limit error {status}, retrying...")

        except requests.exceptions.ConnectionError:
            print(f"Attempt {attempt}: connection failed, retrying...")

        time.sleep(2 ** attempt)   # exponential backoff: 2s, 4s, 8s...

    raise RuntimeError(f"Failed to fetch weather after {max_retries} attempts")`,
          pitfalls: [
            '**Retrying a 4xx client error forever.** A bad API key or malformed request stays bad no matter how many times you ask. Fix: re-raise immediately on most 4xx codes instead of looping.',
            '**Never setting a `timeout`.** Without one, `Timeout` can never even occur — the script just hangs indefinitely on a dead connection. Fix: always pass `timeout=` to every `requests` call.',
            '**Using a bare `except:`.** It silently swallows real bugs (typos, logic errors) along with genuine network failures. Fix: catch the specific `requests.exceptions` classes you intend to handle.',
            '**Retrying with no delay between attempts.** Hammering a struggling server back-to-back makes things worse. Fix: add backoff (`time.sleep(2 ** attempt)` or similar) between retries.',
            '**Forgetting `raise_for_status()`.** A 500 error page can get parsed by `.json()` as if it were valid data, corrupting downstream logic. Fix: call `raise_for_status()` before trusting the response body.',
            '**Giving up silently after retries are exhausted.** Returning `None` with no explanation makes the failure invisible to whoever calls the function. Fix: raise a clear, descriptive error once retries run out.',
          ],
          tryIt:
            'Modify `fetch_weather` to accept a deliberately wrong URL and confirm it raises a clear error after `max_retries` attempts rather than hanging or crashing with a raw traceback. Then point it at the real Open-Meteo URL and confirm it succeeds on the first attempt.',
          takeaway:
            'Set a `timeout` on every request, use `raise_for_status()` to catch bad responses, retry only what is worth retrying (timeouts, connection errors, 5xx/429) with exponential backoff, and fail loudly once retries are exhausted.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm1-p1',
      type: 'Mini Project',
      title: 'Kundapura Sahayaka v0 — Local Briefing Fetcher',
      domain: 'Data & APIs',
      duration: '2-3 hrs',
      description:
        'Build the very first version of the running app: a CLI script that fetches live weather for Kundapura from the free, key-free Open-Meteo API, combines it with a small static dict of "today\'s notable info" (a placeholder for the real knowledge base built in Module 4-5), and prints a nicely formatted daily briefing to the terminal. No LLM anywhere in this version — pure Python, `requests`, and `json`, on purpose, to build solid data-handling habits before AI enters the picture in Module 3.',
      tools: ['Python', 'requests', 'json', 'python-dotenv'],
      blueprint: {
        overview:
          'This is the type-only, AI-free skeleton of the whole course app. By fetching real structured data from a live API, shaping it with dicts/lists/JSON, and persisting it to disk before any LLM is involved, you prove the data-handling foundation is solid — the exact foundation Module 3 will plug a chatbot into, and Module 4-5 will plug a real knowledge base into in place of today\'s placeholder dict. Every piece here (requests, JSON, `.env`, retries) is reused unchanged for the rest of the course.',
        functionalRequirements: [
          'Fetch current weather for Kundapura (latitude 13.63, longitude 74.69) from the free Open-Meteo `/v1/forecast` endpoint using `requests` — no API key required.',
          'Maintain a small static Python dict of "today\'s notable info" (e.g. a seva note, a festival note, a travel/ferry note, a price tip) as an explicit placeholder for the real knowledge base built in Module 4-5.',
          'Combine the weather data and the notable-info dict into one `briefing` dict and print it to the terminal as a clearly formatted, human-readable daily briefing.',
          'Load configuration from a `.env` file via `python-dotenv` (e.g. a `WEATHER_UNIT` setting), establishing the secrets/config pattern even though Open-Meteo needs no key yet.',
          'Handle network failures gracefully: apply a `timeout`, retry transient failures with backoff, and fail with a clear, friendly message rather than a raw traceback if the API is unreachable after retries.',
          'Save each day\'s briefing to a local JSON file at `data/briefings/<YYYY-MM-DD>.json` so later modules can reuse the same on-disk pattern.',
        ],
        technicalImplementation: [
          'Project layout: a `sahayaka/` folder containing `main.py`, `weather.py`, `notable_info.py`, `.env`, `.env.example`, and `data/briefings/` (created at runtime).',
          '`weather.py`: a `fetch_weather(lat, lon, timeout=10, max_retries=3)` function using `requests.get` with `params`, wrapped in the retry-with-backoff pattern from this module (distinguish 4xx from 5xx/timeout/connection errors).',
          '`notable_info.py`: a hardcoded `TODAYS_INFO` dict with a handful of fields (e.g. `festival`, `seva_note`, `travel_note`, `price_tip`), with a comment explicitly marking it as the placeholder the Module 4-5 RAG knowledge base will replace.',
          '`main.py`: call `load_dotenv()`, read `WEATHER_UNIT` via `os.getenv(..., "celsius")`, call `fetch_weather`, merge its result with `TODAYS_INFO` into one `briefing` dict, and pretty-print it with f-strings under clear section headers.',
          'Persist the briefing with `json.dump(briefing, f, indent=2, ensure_ascii=False)` to `data/briefings/<date>.json`, building the path with `pathlib.Path` and creating the folder with `.mkdir(parents=True, exist_ok=True)`.',
          'Add a `.gitignore` containing `.env` (and optionally `data/`) so secrets and generated output are never committed; commit a `.env.example` documenting the expected variable names instead.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Fetch and parse the weather',
            outcome:
              'A working `fetch_weather(lat, lon)` function in `weather.py` that calls Open-Meteo and returns a parsed dict of the current temperature, weather code, and wind speed for Kundapura.',
            prompt:
              'In `weather.py`, write a `fetch_weather(lat: float, lon: float, timeout: int = 10) -> dict` function that calls `https://api.open-meteo.com/v1/forecast` with `requests.get`, passing `latitude`, `longitude`, `current=temperature_2m,weather_code,wind_speed_10m`, and `timezone=Asia/Kolkata` as query parameters. Call `response.raise_for_status()`, return the parsed JSON as a dict, and add a small `if __name__ == "__main__":` block that calls it for Kundapura\'s coordinates (13.63, 74.69) and prints the current temperature.',
          },
          {
            step: 2,
            label: 'Add the placeholder knowledge dict',
            outcome:
              'A `notable_info.py` exporting a `TODAYS_INFO` dict with a handful of realistic coastal-Karnataka fields, clearly commented as a stand-in for the future knowledge base.',
            prompt:
              'Create `notable_info.py` with a module-level dict `TODAYS_INFO` containing the keys `festival` (a nearby festival or seva note), `seva_note` (a temple timing detail), `travel_note` (a bus/ferry connectivity note, e.g. about the Gangolli ferry), and `price_tip` (a local food price tip, e.g. about kori rotti or neer dosa). Use realistic Kundapura-area details. Add a comment above the dict explaining that Module 4-5 will replace this hardcoded dict with a real markdown knowledge base retrieved via RAG.',
          },
          {
            step: 3,
            label: 'Wire up .env config and retry/error handling',
            outcome:
              'A `.env` + `.env.example` pair, `load_dotenv()` wired into `main.py`, and `fetch_weather` upgraded with a retry-with-backoff loop that fails clearly instead of crashing or hanging.',
            prompt:
              'Add a `.env` file with `WEATHER_UNIT=celsius` and a matching `.env.example` with the key but no value, and make sure `.env` is listed in `.gitignore`. In `main.py`, call `load_dotenv()` at the top and read `WEATHER_UNIT` with `os.getenv("WEATHER_UNIT", "celsius")`. Then upgrade `fetch_weather` in `weather.py` to retry up to 3 times with exponential backoff (`time.sleep(2 ** attempt)`) on `Timeout` and `ConnectionError`, re-raise immediately on 4xx errors other than 429, and raise a clear `RuntimeError` with a friendly message if all retries are exhausted.',
          },
          {
            step: 4,
            label: 'Format, print, and persist the daily briefing',
            outcome:
              'A runnable `main.py` that prints a clearly formatted terminal briefing combining weather and notable info, and saves it as `data/briefings/<today>.json`.',
            prompt:
              'In `main.py`, merge the result of `fetch_weather(13.63, 74.69)` and the `TODAYS_INFO` dict into one `briefing` dict (include a `date` field using today\'s date as an ISO string). Print a clearly formatted terminal briefing with section headers (e.g. "KUNDAPURA SAHAYAKA — DAILY BRIEFING", a weather section, a "Today\'s Notes" section) using f-strings. Then use `pathlib.Path` to build `data/briefings/<date>.json`, create the `data/briefings` folder if missing, and save the `briefing` dict there with `json.dump(..., indent=2, ensure_ascii=False)`. Print the saved file path at the end so I can confirm it worked.',
          },
        ],
        deliverable:
          'A runnable `main.py` (with `weather.py` and `notable_info.py`) that you start with `python main.py`: it prints a formatted Kundapura daily briefing combining live weather and placeholder notable info to the terminal, survives a flaky network with retries, and saves the same briefing as `data/briefings/<today>.json` — pure Python, `requests`, and `json`, with zero LLM calls, ready for Module 3 to build a chatbot on top of.',
      },
    },
  ],
  quiz: [
    {
      id: 'm1-q1',
      q: 'What is the safest way to look up a key that might not exist in a dict, without crashing the program?',
      options: [
        'Use square brackets, e.g. `menu["kane curry"]`',
        'Use `.get("kane curry", default_value)`, which returns the default if the key is missing',
        'Wrap every dict access in a `while` loop',
        'Convert the dict to a list first',
      ],
      answer: 1,
    },
    {
      id: 'm1-q2',
      q: 'When calling `json.dumps()` on a dict that contains Kannada text, what does `ensure_ascii=False` do?',
      options: [
        'It validates that the dict has no missing keys',
        'It compresses the resulting JSON string to save space',
        'It prevents non-ASCII characters (like Kannada) from being escaped into unreadable \\uXXXX sequences',
        'It converts all string values to English automatically',
      ],
      answer: 2,
    },
    {
      id: 'm1-q3',
      q: 'In the `requests` library, what is the key difference between passing `params={...}` and `json={...}`?',
      options: [
        '`params` builds a GET-style query string on the URL; `json` sends a JSON request body, typically for POST',
        'They are two names for exactly the same behavior',
        '`params` is only for authentication headers',
        '`json` can only be used with `requests.get()`',
      ],
      answer: 0,
    },
    {
      id: 'm1-q4',
      q: 'Why should an API key be loaded from a `.env` file via `python-dotenv` instead of being written directly as a string in a `.py` file?',
      options: [
        'Hardcoded strings run slower than environment variables',
        'Python cannot parse string literals longer than an API key',
        'A hardcoded key gets committed to version control and can leak publicly; `.env` is kept out of git and loaded only at runtime',
        '`.env` files are required by the Python interpreter to run any script',
      ],
      answer: 2,
    },
    {
      id: 'm1-q5',
      q: 'A weather API call keeps returning HTTP 401 (invalid API key). What is the correct way to handle this in a retry loop?',
      options: [
        'Retry it a few more times with exponential backoff, since most errors eventually resolve themselves',
        'Re-raise immediately without retrying — a 401 is a client error that will not fix itself by repeating the same request',
        'Silently return `None` so the program does not crash',
        'Switch the request from GET to POST and try again',
      ],
      answer: 1,
    },
  ],
}
