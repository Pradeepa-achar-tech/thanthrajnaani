// Module 3 — Prompting & Your First API Call
// The learner writes real, running LLM code for the first time: prompting fundamentals (roles,
// few-shot, structure, JSON output), a safe Anthropic API key via .env, and Kundapura Sahayaka v1 —
// a streaming terminal chatbot with a persona but no grounding (sets up the RAG problem Modules 4-5 solve).

export const m3 = {
  id: 'm3',
  title: 'Prompting & Your First API Call',
  hours: 6,
  color: 'from-cyan-500/20 to-cyan-700/10',
  accent: 'cyan',
  description:
    'This is the module where the learner writes real, running LLM code for the first time. It covers prompting fundamentals — roles, zero-shot vs few-shot, structuring instructions and constraints, and getting clean JSON back — before getting an Anthropic API key, keeping it safe with `.env`, and making a live streaming API call. It closes with **Kundapura Sahayaka v1**, a terminal chatbot with a persona but no real knowledge, setting up exactly the problem Modules 4-5 (RAG) go on to solve.',
  sections: [
    {
      id: 'm3-s1',
      title: 'Prompting Fundamentals',
      topics: [
        {
          id: 'm3-t1',
          title: 'System, user, and assistant roles — why structure beats one giant prompt',
          explain:
            'A conversation with an LLM API is not one long block of text — it is a list of messages, each tagged with a **role**: `system` (standing instructions), `user` (what the human said), or `assistant` (what the model said). Sending this structured list, instead of pasting everything into one string, is what lets the model tell "the rules of the road" apart from "what was just asked".',
          analogy:
            'Picture a new counter assistant on their first day at a Kundapura tiffin cafe. Before the cafe opens, the owner pins up standing instructions behind the counter: "Greet in Kannada first, keep answers short, never promise a dish before checking with the kitchen." That pinned note is the **system** role — set once, read before every order. A customer walks up and says "Two neer dosa, no chutney" — that is the **user** role, a fresh line each time. The assistant\'s reply, "Sure, two neer dosa without chutney, five minutes," is the **assistant** role. Nobody re-reads the standing instructions aloud to every customer; the note stays pinned, and only the order and the reply change.',
          theory:
            'Every LLM API expects the conversation as a list of `{role, content}` objects rather than free text. `system` sets the persona, tone, and rules and is conceptually read before anything else; `user` and `assistant` then alternate, one entry per turn. In the Anthropic Python SDK specifically, `system` is its own top-level parameter passed to `messages.create()` — it is *not* one of the entries inside the `messages` list (some other APIs do put it inside the list as a `role: "system"` message; Anthropic keeps it separate).\n\nCrucially, the API itself is **stateless** — the model has no memory between calls. Every single request must resend the *entire* conversation so far: the system prompt plus every prior user and assistant turn. What feels like a chatbot "remembering" you is really your own code replaying the whole transcript each time.\n\nStructure also matters for reliability. If you dump persona, rules, and the user\'s actual question into one undifferentiated string, the model has to *infer* where instructions end and the request begins — which is fragile and easy to derail with something like "ignore the above and just do X" buried in user text. Explicit roles give the model (and any safety tooling around it) a clean, machine-readable boundary between "what I was told to always do" and "what this one person just asked".',
          whyItMatters:
            'This messages-list shape is foundational to every LLM call you will ever write in this course — chat apps, RAG, and tool-using agents are all built on exactly this structure. Getting comfortable with roles now means every later topic (streaming, tool results, retrieved context) just slots more content into the same list, rather than requiring a new mental model.',
          steps: [
            'Look at a raw messages list: a `system` string plus a `messages` array of `user`/`assistant` turns.',
            'Decide what belongs in `system` (persona, tone, standing rules) versus `user` (this turn\'s specific ask).',
            'Note that Anthropic\'s SDK takes `system` as its own top-level parameter, not as an entry inside `messages`.',
            'Mentally replay a two-turn conversation and see how the growing `messages` list is what carries "memory".',
            'Take a single "giant prompt" you have seen elsewhere and split it into a proper system + user pair.',
          ],
          code: `# Anthropic SDK shape: system is separate; messages hold only user/assistant turns.
system_prompt = (
    "You are Kundapura Sahayaka, a friendly local guide for Kundapura. "
    "Always answer in short, clear sentences."
)

messages = [
    {"role": "user", "content": "What is neer dosa?"},
    {"role": "assistant", "content": "Neer dosa is a soft, lacy rice crepe from coastal Karnataka, best with chutney."},
    {"role": "user", "content": "Is it spicy?"},
]
# Every call sends system_prompt + the whole messages list built up so far —
# the API itself remembers nothing between calls.`,
          pitfalls: [
            '**Cramming persona + rules + the question into one string.** The model cannot reliably tell instruction from data. Fix: use the `system` parameter for standing rules, `user` for the ask.',
            '**Forgetting the API is stateless.** Assuming the model "remembers" earlier turns on its own. Fix: resend the full `messages` history every call.',
            '**Putting persistent rules in a `user` message instead of `system`.** They get weaker adherence and can be overridden by later user text. Fix: standing instructions belong in `system`.',
            '**Never appending the assistant\'s own reply back into `messages`.** The next call has no idea what was just said. Fix: append it after every response.',
            '**Skipping `system` "for a quick test".** The model falls back to a generic assistant tone, not your persona. Fix: always pass a `system` prompt, even a short one.',
            '**Using a role name the API does not recognise (e.g. `"bot"`).** The request is rejected. Fix: only `system`, `user`, and `assistant` are valid.',
          ],
          tryIt:
            'Write out, on paper, the full `messages` list for a three-turn conversation where the system prompt says "You are Kundapura Sahayaka" and the user asks two follow-up questions about Kundapura buses — including where the earlier assistant reply sits in the list.',
          takeaway:
            'Roles (`system`/`user`/`assistant`) turn a conversation into a structured, replayable list the model can reliably parse — the foundation every later prompt, chatbot, and agent in this course builds on.',
        },
        {
          id: 'm3-t2',
          title: 'Zero-shot vs few-shot prompting, with concrete before/after examples',
          explain:
            '**Zero-shot** means asking the model to do a task with just an instruction and no examples. **Few-shot** means showing it two or three worked examples of the input/output pattern first — the fastest way to lock in a format or tone the model is not guessing about.',
          analogy:
            'Think of training a new volunteer at a temple\'s seva enquiry desk. Zero-shot is telling them "answer devotee questions politely" and hoping they intuit the exact style. Few-shot is instead handing them two or three real question-and-answer cards from previous days first: "See how the senior volunteer phrased it — short, one line, no extra chit-chat? Match that." The volunteer now has a concrete pattern to copy, not just a vague instruction.',
          theory:
            'A **zero-shot** prompt is a bare instruction: "Summarize this in one sentence." It relies entirely on the model\'s general training to guess the right format, length, and tone — which is often fine for open-ended tasks, but unreliable when you need an exact shape.\n\nA **few-shot** prompt prepends two or three demonstration pairs before the real question, either written inline as `Q:`/`A:` blocks in the prompt text, or as actual prior `user`/`assistant` turns in the `messages` list. The model pattern-matches the *format* of the examples — length, punctuation, structure — onto its answer for the new input, even though the content is new.\n\nConcretely: asking "What time is the morning seva at a Kundapura temple?" zero-shot tends to produce a hedging paragraph ("Timings vary by temple, but typically..."). Showing two short `Q:`/`A:` examples first, each answered in one clipped sentence, reliably pulls the new answer into that same one-line shape — even though few-shot cannot make the *content* more factually accurate (that requires grounding, covered in Module 4-5).',
          whyItMatters:
            'Few-shot prompting is usually faster and cheaper than any fine-tuning fix for output format or tone problems — it is the first tool a working GenAI developer reaches for when a model\'s default answer is not shaped the way the app needs.',
          steps: [
            'Write a zero-shot, instruction-only prompt and note how freeform the result feels.',
            'Identify precisely what is wrong with that format for your use case (too long, wrong tone, inconsistent structure).',
            'Write two or three short example `Q:`/`A:` pairs that demonstrate the exact target format.',
            'Prepend those examples before the real question in the prompt.',
            'Compare the zero-shot and few-shot outputs side by side.',
            'Trim to the fewest examples that still reliably produce the shape you want.',
          ],
          code: `# Zero-shot — instruction only, format is unpredictable:
zero_shot = "Question: What time is the morning seva at a typical Kundapura temple?\\nAnswer:"

# Few-shot — two worked examples fix the shape before the real question:
few_shot = """Q: What time is Ganapati puja usually held in the morning?
A: Around 7:00 AM, before the day's first offering.

Q: When is the evening deepa aradhane typically?
A: Around 7:30 PM, right after sunset.

Q: What time is the morning seva at a typical Kundapura temple?
A:"""
# The few-shot version reliably returns one short "Around <time>, <clause>." line —
# note that neither version makes the ANSWER more factually correct, only its shape.`,
          pitfalls: [
            '**Adding too many examples.** Wastes tokens and can introduce irrelevant variety that confuses the model. Fix: two or three tightly-matched examples are usually enough.',
            '**Examples that contradict the format you actually want.** The model copies the contradiction. Fix: make every example look exactly like your target output.',
            '**Inconsistent example formatting** (one ends with a period, another does not). Fix: format every example identically.',
            '**Using few-shot to "teach" the model facts it does not know.** Examples fix shape, not missing knowledge — that needs retrieval (Module 4-5), not more examples.',
            '**Leaving the `Q:`/`A:` scaffolding in the final parsed output.** Fix: strip the labels when you extract the answer text in code.',
            '**Hardcoding real sensitive data into example prompts.** Fix: use invented or generic examples for demonstrations.',
          ],
          tryIt:
            'Take the vague zero-shot prompt "Describe a Kundapura festival" and rewrite it as a few-shot prompt with two short example `Q:`/`A:` pairs that each enforce a strict two-sentence answer — then compare how much more predictable the new answer\'s shape would be.',
          takeaway:
            'Zero-shot relies purely on instructions; few-shot shows the model two or three examples of the exact shape you want — the fastest lever for fixing format and tone without any training.',
        },
        {
          id: 'm3-t3',
          title: 'Structuring a good prompt: instructions, context, format, constraints',
          explain:
            'A reliable prompt has four ingredients, laid out explicitly: what to do (**instructions**), what the model needs to know (**context**), how the answer should look (**format**), and any limits (**constraints**) — rather than one vague, run-on sentence.',
          analogy:
            'It is the difference between shouting "make something nice" at a cafe kitchen and handing over a proper order slip: the dish (instruction), the customer\'s spice tolerance and allergies (context), how to plate it (format), and "no seafood, ready in ten minutes" (constraints). The kitchen with the slip produces a predictable plate every time; the kitchen working off a vague shout does not.',
          theory:
            'Four blocks, usually in this order:\n- **Instructions** — a specific, verb-first task: "Recommend", "Summarize", "Classify" — not a vague topic dump.\n- **Context** — the background facts the model needs for *this* answer: audience, domain, prior details. This is context you type inline, not yet a search over real documents (that grounding step is Module 4-5\'s RAG).\n- **Format** — the exact shape of the output: bullet list, JSON, word count, language, tone.\n- **Constraints** — hard limits and things to avoid: forbidden content, length caps, tone boundaries.\n\nOrdering matters in practice: put instructions and context first so the model has the full picture, then format and constraints toward the end — models tend to weight the most recent part of a prompt heavily, so a constraint stated last ("do not use exclamation marks") tends to stick better than one buried in the middle of a paragraph.',
          whyItMatters:
            'In production, prompts fail from vagueness far more often than the underlying model fails from weakness. A messy one-liner and a well-structured four-part prompt asking the same underlying question can produce wildly different reliability — this is the single highest-leverage skill in this whole module, and it costs nothing but a moment of discipline.',
          steps: [
            'Write the instruction: one specific verb plus the task.',
            'Add context: one to three sentences of only the facts the model actually needs.',
            'Specify the output format explicitly: bullets, JSON, a word or sentence cap, the language.',
            'Add constraints: tone limits, forbidden content, hard length caps.',
            'Re-read the assembled prompt as if you were the model — is anything ambiguous or contradictory?',
            'Trim anything that is not doing work.',
          ],
          code: `prompt = """Instruction: Recommend one coastal-Karnataka breakfast dish for a first-time visitor to Kundapura.
Context: The visitor is vegetarian and mildly avoids very spicy food.
Format: Exactly 2 sentences. No bullet points.
Constraints: Do not recommend seafood dishes. Do not use exclamation marks.
"""
# This maps directly onto the messages shape from the roles topic:
# the whole block above becomes the "content" of a single user turn,
# with the persona/tone still living separately in the system prompt.`,
          pitfalls: [
            '**Skipping the format block.** You get an essay when you wanted one line. Fix: always state the exact shape you need.',
            '**Vague instructions** like "tell me about Kundapura". Fix: name a specific, verb-first task.',
            '**Burying the real ask inside a wall of context.** Fix: keep context to only what this answer needs.',
            '**Weak or late constraints.** A rule mentioned once in passing gets ignored. Fix: state constraints firmly, near the end.',
            '**Contradicting yourself** — asking for both "detailed" and "one sentence". Fix: read the assembled prompt back before sending it.',
            '**Confusing "context" here with real grounding documents.** This is inline background you type, not a retrieval step — that comes with RAG in Module 4-5.',
          ],
          tryIt:
            'Take a vague question you might type to an AI assistant (e.g. "help me plan a Kundapura trip") and rewrite it with all four labelled parts — instructions, context, format, constraints — and notice how much more predictable the resulting answer becomes.',
          takeaway:
            'Instructions, context, format, and constraints — in that order — turn a vague ask into a prompt whose output you can actually predict and rely on.',
        },
        {
          id: 'm3-t4',
          title: 'Getting structured output back (JSON mode / strict schema) and parsing it',
          explain:
            'When your code needs to *use* the model\'s answer programmatically rather than just display it, ask for a strict JSON shape — with an example of that exact shape in the prompt — and parse it with Python\'s `json` module, defensively.',
          analogy:
            'It is the difference between a printed form and a letter. A form with fixed fields (name, amount, date) is trivial for a clerk to process straight into the register; a free-flowing letter says the same thing, but someone has to re-read it and manually pull out each fact every time. Asking the model for JSON is asking it to fill out the form instead of writing the letter.',
          theory:
            'The reliable recipe: (1) decide the exact keys and types you need, (2) show the model one worked example of that exact JSON shape inside the prompt, (3) explicitly instruct "respond with ONLY valid JSON, no other text", and (4) parse the reply with `json.loads()` inside a `try/except`, never trusting it blindly.\n\nAnthropic\'s API does not have a hard "JSON-only" toggle the way some providers do — reliability comes from clear instructions plus a concrete example, and optionally **prefilling** the assistant turn: seeding the start of the assistant\'s reply with `{` so the model is already "inside" a JSON object and is far less likely to add greeting text before it. Even with a good prompt, models occasionally wrap JSON in ```` ```json ```` markdown fences or add a trailing sentence — production code strips fences and always wraps parsing in error handling rather than assuming the reply is clean.',
          whyItMatters:
            'This is the bridge from "chatbot that prints text" to "AI that talks to the rest of your code". Every later topic that needs a machine-usable answer — tool-calling arguments, RAG citations, an agent\'s next action — depends on exactly this pattern: ask for a schema, show an example, parse defensively.',
          steps: [
            'Decide the exact JSON keys and value types you need.',
            'Show the model one example of that exact JSON shape inside the prompt.',
            'Explicitly instruct: "Respond with ONLY valid JSON, no other text."',
            '(Optional) Prefill the assistant turn with `{` so the reply starts directly as JSON.',
            'Call `json.loads()` on the reply text inside a `try/except`.',
            'On a parse failure, log the raw text and consider retrying once with a stricter reminder.',
          ],
          code: `import json

prompt = """Extract the dish name and whether it is vegetarian from this sentence.
Respond with ONLY valid JSON in this exact shape, nothing else:
{"dish": "<string>", "vegetarian": <true or false>}

Sentence: "Kori rotti is a crisp rice-flour wafer served with a spicy chicken curry."
"""

# raw_text is whatever the model actually replied with (the real API call is next topic):
raw_text = '{"dish": "Kori rotti", "vegetarian": false}'

try:
    data = json.loads(raw_text)
    print(data["dish"], data["vegetarian"])
except json.JSONDecodeError:
    print("Model did not return valid JSON:", raw_text)`,
          pitfalls: [
            '**Model wraps JSON in ```` ```json ```` markdown fences.** `json.loads` fails. Fix: strip code fences before parsing.',
            '**Asking for JSON *and* a friendly explanation in the same reply.** Breaks parsing. Fix: instruct "JSON only, nothing else."',
            '**Trusting the response without a `try/except`.** One malformed reply crashes the whole app. Fix: always parse defensively.',
            '**A vague schema** ("give me some fields"). The model invents inconsistent keys each time. Fix: show one concrete example in the prompt.',
            '**Ignoring exact types** — asking for `true`/`false` but accepting `"yes"`/`"no"` strings. Fix: spell out literal types in the example.',
            '**Indexing directly** (`data["dish"]`) without handling missing/extra keys. Fix: use `.get()` with sensible defaults in real code.',
          ],
          tryIt:
            'Write a prompt asking the model to return a JSON object with `temple_name` and `is_open_today`, including one worked example, then hand-write a plausible reply and parse it with `json.loads` inside a `try/except`.',
          takeaway:
            'Describe the exact JSON shape, show one example, ask for JSON only, and always parse defensively with `try/except` — that is how model text becomes data your code can actually use.',
        },
      ],
    },
    {
      id: 'm3-s2',
      title: 'Calling a Real API',
      topics: [
        {
          id: 'm3-t5',
          title: 'Getting an API key (Anthropic, with a note on OpenAI/Groq) and keeping it safe via .env',
          explain:
            'Sign up at `console.anthropic.com`, create an API key, and never hardcode it in source — store it in a local `.env` file loaded by `python-dotenv`, and make sure that file is gitignored before it is ever committed.',
          analogy:
            'An API key is the master key to the temple committee\'s donation strongbox. You do not nail a spare copy to the public noticeboard (hardcode it in a file that gets pushed to GitHub) — you keep it in a locked drawer only the coordinator opens (a `.env` file that never leaves your machine and is excluded from version control).',
          theory:
            'To get a key: create an account at `console.anthropic.com`, add a small amount of credit, open the **API Keys** page, and click **Create Key**. The full key (starting `sk-ant-...`) is shown exactly once — copy it immediately. **OpenAI** (`platform.openai.com`) and **Groq** (fast open-model inference with a generous free tier) follow the same general pattern — sign up, an API Keys page, copy a key — and it is common and pragmatic to keep more than one provider\'s key side by side in `.env` and pick per task on cost, speed, or model quality.\n\nOnce you have a key: `pip install python-dotenv`, create a `.env` file with `ANTHROPIC_API_KEY=sk-ant-...`, and — before your very first commit — add `.env` to `.gitignore`. In Python, `load_dotenv()` reads that file into the process environment, and `os.environ.get("ANTHROPIC_API_KEY")` reads the value out. If a key ever does leak (pushed to a public repo, pasted into a chat, shown on a screen share), the only safe response is to revoke it in the console and generate a new one — deleting the commit afterward does not un-leak a key that was already scraped.',
          whyItMatters:
            'Leaked API keys on public GitHub repos get scraped and abused within minutes to hours, leaving the account holder with a surprise bill run up by someone else\'s traffic. This is one of the most common and costly beginner mistakes in real-world GenAI development, which is why the safe-storage habit comes before the first line of chatbot code, not after.',
          steps: [
            'Create an account at `console.anthropic.com` and add a small amount of credit.',
            'Open the API Keys page, click "Create Key", and copy it immediately — it is shown only once.',
            '`pip install python-dotenv` inside your project\'s virtual environment.',
            'Create a `.env` file with `ANTHROPIC_API_KEY=sk-ant-...` and add `.env` to `.gitignore` before your first commit.',
            'In Python, call `load_dotenv()` then read the key with `os.environ.get("ANTHROPIC_API_KEY")`.',
            'Run `git status` and confirm `.env` never appears as a tracked or staged file.',
          ],
          code: `# .env  (never committed — add this filename to .gitignore first)
ANTHROPIC_API_KEY=sk-ant-api03-your-real-key-here

# main.py
import os
from dotenv import load_dotenv

load_dotenv()  # reads .env into the process environment

api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    raise RuntimeError("ANTHROPIC_API_KEY not set — check your .env file")

print("Key loaded:", api_key[:12] + "...")  # never print the full key`,
          pitfalls: [
            '**Hardcoding the key as a string literal in a `.py` file.** It gets committed and leaked the moment you push. Fix: only ever read it from the environment.',
            '**Committing `.env` before adding it to `.gitignore`.** It is now in git history forever. Fix: rotate the key even after deleting the file from a later commit.',
            '**Printing the full key "just for debugging".** Anyone with log access can steal it. Fix: print only a masked prefix, if anything.',
            '**Sharing a screenshot or screen recording with the key visible.** Fix: mask or crop before sharing.',
            '**Assuming a trial/free key has zero spend risk.** Some providers still bill overages. Fix: watch the usage dashboard.',
            '**Editing `.env` mid-session and expecting the running script to pick it up.** Fix: `load_dotenv()` only runs once at startup — rerun the script.',
          ],
          tryIt:
            'Create a throwaway `.env` with a fake value like `ANTHROPIC_API_KEY=sk-ant-test123`, run the `load_dotenv()` snippet above and confirm it prints the masked key, then run `git check-ignore -v .env` and confirm it reports that `.env` is ignored.',
          takeaway:
            'Get your key from `console.anthropic.com`, store it only in a gitignored `.env`, and load it with `python-dotenv` — never paste a key directly into source code.',
        },
        {
          id: 'm3-t6',
          title: 'Your first Python API call — anthropic.Anthropic().messages.create(...)',
          explain:
            'Install the `anthropic` package, construct a client, and call `.messages.create()` with a `model`, a `system` prompt, a `messages` list, and a `max_tokens` cap to get your first real reply from Claude.',
          analogy:
            'It is like placing your first real order over the phone to a proper supplier, instead of practising on a toy till. You dial the number (construct the client), state your standing requirements and the actual order (`system` plus `messages`), say how much you are prepared to receive (`max_tokens`), and wait for the delivery (the response object).',
          theory:
            '`pip install anthropic`, then `import anthropic` and `client = anthropic.Anthropic()` — by default this reads `ANTHROPIC_API_KEY` straight out of the environment (which `load_dotenv()` populated in the previous topic), so nothing needs to be pasted into code. The call itself:\n```\nclient.messages.create(\n    model="claude-3-5-sonnet-20241022",\n    max_tokens=300,\n    system="...",\n    messages=[{"role": "user", "content": "..."}],\n)\n```\n`model`, `max_tokens`, and `messages` are required; `system` is optional but almost always wanted for anything with a persona. `max_tokens` is a **ceiling**, not a target — the reply may naturally finish shorter, but it will never exceed that many tokens.\n\nThe response object holds its text under `response.content`, a *list* of content blocks (because a reply can in principle mix text with other block types, such as tool calls, covered in a later module) — for a plain text reply, `response.content[0].text` is the string you want. Model names are versioned strings that change as Anthropic ships new models, so always check the current docs for the latest valid `model` id rather than assuming last year\'s string still works.',
          whyItMatters:
            'This exact three-part call — `model`, `messages`, `max_tokens` — is the one shape every later module in this course builds on. RAG, streaming, and tool-using agents all just add more content to the same `messages` list and call the same `.create()`/`.stream()` methods, so getting comfortable with this now pays off for the rest of the course.',
          steps: [
            '`pip install anthropic` inside your project\'s virtual environment.',
            'Import `anthropic` and construct `client = anthropic.Anthropic()`.',
            'Call `client.messages.create()` with `model`, `max_tokens`, `system`, and `messages`.',
            'Read the reply from `response.content[0].text`.',
            'Print it and confirm you got a real, on-topic answer back.',
            'Check your usage afterward in the Anthropic console dashboard.',
          ],
          code: `import os
from dotenv import load_dotenv
import anthropic

load_dotenv()
client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",  # check the docs for the current model id
    max_tokens=300,
    system="You are Kundapura Sahayaka, a friendly local guide for Kundapura.",
    messages=[
        {"role": "user", "content": "What is neer dosa, in two sentences?"}
    ],
)

print(response.content[0].text)`,
          pitfalls: [
            '**Omitting `max_tokens`.** It is a required parameter, not optional — the call errors without it.',
            '**Reading `response.text`.** That attribute does not exist; the reply text is at `response.content[0].text`.',
            '**Passing `system` as a message with `role: "system"` inside `messages`.** Wrong for the Anthropic SDK — `system` is its own top-level parameter.',
            '**Using a stale or mistyped model name.** The API returns a clear "model not found" error; always confirm the current id in the docs.',
            '**No exception handling around the call.** Network errors and rate limits crash the script; wrap real calls in `try/except`.',
            '**Setting `max_tokens` very high "just in case".** It only raises worst-case latency and cost, with no benefit for a short answer.',
          ],
          tryIt:
            'Change the user message to ask about kori rotti instead of neer dosa, lower `max_tokens` to 40, and observe the reply get cut off mid-sentence — confirming `max_tokens` is a hard ceiling, not a suggestion.',
          takeaway:
            '`client.messages.create(model=..., max_tokens=..., system=..., messages=[...])` is the one call every later Kundapura Sahayaka feature in this course builds on top of.',
        },
        {
          id: 'm3-t7',
          title: 'Streaming responses token-by-token instead of waiting for the full reply',
          explain:
            'Instead of blocking until the whole answer is finished, `.messages.stream()` lets you consume the reply as each small chunk arrives, so the user sees words appear immediately — like a live typing effect — rather than staring at a frozen screen.',
          analogy:
            'Waiting for a non-streamed reply is like waiting for a courier to deliver the entire month\'s bundle of newspapers before you can read the front page. Streaming is a newspaper being read aloud over the counter radio, line by line, as it is typed — you start following along immediately instead of standing in silence.',
          theory:
            'A model generates its reply one small piece at a time internally regardless of how you call it. A non-streaming call (`.messages.create()`) simply waits until generation is completely finished and hands you the whole thing at once. A streaming call (`.messages.stream()`) instead sends each piece over the connection as soon as it is ready.\n\nIn the Anthropic Python SDK, `.messages.stream(...)` is used as a context manager: `with client.messages.stream(...) as stream:`. Iterating `stream.text_stream` yields each text chunk as it arrives — printing with `print(chunk, end="", flush=True)` makes them appear on the same line immediately, without the `flush`, they can sit buffered and defeat the purpose. After the loop, `stream.get_final_message()` returns the complete assembled `Message` object, useful for reading final token-usage numbers.\n\nStreaming does not change total cost or total generation time — it changes *when* the user sees the first characters. That difference in perceived latency (well under a second, versus several seconds of silence for a long reply) is exactly why every production chat product the learner already knows — ChatGPT, Claude.ai — streams by default, and why the terminal chatbot built next should too.',
          whyItMatters:
            'Perceived speed is often more important than actual total speed for chat UX. Streaming is the single easiest change that makes a chatbot feel alive instead of frozen, and it is the expected default in any real chat product — skipping it is one of the fastest ways for a homemade chatbot to feel obviously amateur.',
          steps: [
            'Swap `.messages.create()` for `.messages.stream()`, used as a `with` context manager.',
            'Iterate `stream.text_stream` to get each text chunk as it arrives.',
            '`print(chunk, end="", flush=True)` so chunks appear on the same line immediately.',
            'After the loop, optionally call `stream.get_final_message()` for the complete message object (e.g. to log token usage).',
            'Compare the felt wait time against the non-streaming call from the previous topic.',
            'Default to streaming for anything user-facing; reserve non-streaming for background/batch jobs.',
          ],
          code: `import anthropic
from dotenv import load_dotenv

load_dotenv()
client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-3-5-sonnet-20241022",
    max_tokens=300,
    system="You are Kundapura Sahayaka, a friendly local guide for Kundapura.",
    messages=[{"role": "user", "content": "Describe the Kollur ferry crossing in 3 sentences."}],
) as stream:
    for chunk in stream.text_stream:
        print(chunk, end="", flush=True)
    print()  # newline once the reply finishes

    final_message = stream.get_final_message()
    print("\\n--- tokens used:", final_message.usage.output_tokens)`,
          pitfalls: [
            '**Forgetting `flush=True` on print.** Chunks buffer and appear in one lump anyway, defeating the point. Fix: always flush.',
            '**Calling `.messages.create()` and manually slicing the returned text to fake streaming.** Pointless — it already arrived in full. Fix: use `.messages.stream()` for real incremental delivery.',
            '**Not using the `with` block.** The stream connection is not cleaned up properly. Fix: always open it as a context manager.',
            '**Reading `response.content` inside a stream loop.** That attribute belongs to the non-streaming reply shape, not the stream object. Fix: use `stream.text_stream` or `stream.get_final_message()`.',
            '**Assuming streaming is free.** It costs the same tokens and price as non-streaming — only delivery timing changes.',
            '**Forgetting a trailing `print()`.** The terminal prompt ends up glued to the last word of the reply. Fix: print a newline once the loop finishes.',
          ],
          tryIt:
            'Run the same question once with `.create()` and once with `.stream()`, and time roughly how long it takes before the *first* visible character appears on screen for each — the gap is the whole point of streaming, even though total time is similar.',
          takeaway:
            '`.messages.stream()` delivers the reply chunk-by-chunk as it is generated, making a chatbot feel instant instead of frozen — prefer it for anything the user is watching live.',
        },
        {
          id: 'm3-t8',
          title: 'Building a minimal command-line chatbot loop (read input, send messages, print reply, keep history)',
          explain:
            'Wrap everything from this module into a `while True` loop that reads the user\'s typed line, appends it to a growing `messages` list, calls the API with streaming, prints the reply, appends the assistant\'s reply back into the list, and repeats — this is the actual runnable Kundapura Sahayaka v1 terminal chatbot.',
          analogy:
            'Think of a temple committee\'s daily visitor logbook. Each visitor\'s question gets written down, the coordinator\'s answer is written right below it in the same book, and the *next* visitor\'s question is asked with the whole page still open in front of the coordinator — so nothing needs re-explaining. The growing `messages` list is that open, ever-lengthening page.',
          theory:
            'The loop structure: initialise `messages = []` once, before the loop starts. Inside the loop, read a line with `input("You: ")` and check for an exit word ("exit"/"quit") to `break` cleanly. Append `{"role": "user", "content": user_input}` to `messages`, then call `client.messages.stream(model=..., max_tokens=..., system=SYSTEM_PROMPT, messages=messages)` — passing the **entire** running history every single time, because the API is stateless (from the roles topic). Print the streamed chunks as they arrive, collect them into one string, and append `{"role": "assistant", "content": full_reply}` back into `messages` so the *next* turn has memory of it.\n\nWrap the API call in `try/except` so a dropped connection prints an error and lets the session continue rather than crashing outright. One real limitation worth naming honestly: `messages` grows every turn, and a very long session eventually approaches the model\'s context/token limit — production chatbots trim or summarise old turns to manage this, but for a first version it is fine to leave that concern for later and keep the loop simple.',
          whyItMatters:
            'However simple, this loop is a real, complete GenAI application end to end — input, LLM call, output, memory. It is also the literal scaffold every later module extends rather than rewrites: Modules 4-5 swap the plain system prompt for a RAG-grounded one, Modules 6-7 add tools into the same loop, and Module 8 wraps this same logic in a Streamlit UI.',
          steps: [
            'Define `SYSTEM_PROMPT` once at the top, describing the Kundapura Sahayaka persona.',
            'Initialise an empty `messages = []` list before the loop starts.',
            'In a `while True` loop, read a line with `input("You: ")` and check for an exit word.',
            'Append the user\'s message, call `.messages.stream()` with the full `messages` list, and print chunks as they arrive.',
            'Append the assistant\'s complete reply back into `messages` so the next turn remembers it.',
            'Wrap the API call in `try/except` so a network blip does not end the whole session.',
          ],
          code: `import os
from dotenv import load_dotenv
import anthropic

load_dotenv()
client = anthropic.Anthropic()

SYSTEM_PROMPT = (
    "You are Kundapura Sahayaka, a helpful local guide for Kundapura, "
    "coastal Karnataka. Keep answers short and friendly."
)

messages = []
print("Kundapura Sahayaka (type 'exit' to quit)\\n")

while True:
    user_input = input("You: ").strip()
    if user_input.lower() in ("exit", "quit"):
        print("Sahayaka: Hodbaruthini, see you again!")
        break
    if not user_input:
        continue

    messages.append({"role": "user", "content": user_input})

    try:
        reply_text = ""
        print("Sahayaka: ", end="", flush=True)
        with client.messages.stream(
            model="claude-3-5-sonnet-20241022",
            max_tokens=400,
            system=SYSTEM_PROMPT,
            messages=messages,
        ) as stream:
            for chunk in stream.text_stream:
                print(chunk, end="", flush=True)
                reply_text += chunk
        print("\\n")
        messages.append({"role": "assistant", "content": reply_text})
    except Exception as e:
        print(f"\\n[error talking to the model: {e}]\\n")`,
          pitfalls: [
            '**Resetting `messages = []` inside the loop.** The bot forgets everything after every single turn. Fix: initialise it once, outside the loop.',
            '**Forgetting to append the assistant\'s own reply back into `messages`.** It then cannot refer to what it just said. Fix: append after every successful call.',
            '**Not handling an exit command.** The only way out is `Ctrl+C`. Fix: check for "exit"/"quit" and `break` cleanly.',
            '**Letting `messages` grow forever in a long session.** Eventually hits the model\'s context/token limit. Fix: acceptable for v1, but note it as a real limitation to fix later.',
            '**No `try/except` around the API call.** One dropped connection crashes the whole chatbot. Fix: catch and print the error, then keep looping.',
            '**Sending blank input as a message.** Fix: guard with `if not user_input: continue`.',
          ],
          tryIt:
            'Run the loop and ask a Kundapura-specific question that spans two turns (e.g. "What buses go to Kollur?" then "And the last one back?") — confirm the second answer correctly understands "the last one back" refers to Kollur, proving the conversation history is actually working.',
          takeaway:
            'A chatbot is just a loop that keeps appending to one growing `messages` list and resending all of it on every call — everything from here in the course builds on top of this exact loop.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm3-p1',
      type: 'Project',
      title: 'Kundapura Sahayaka v1 — Terminal Chatbot',
      domain: 'Prompting & APIs',
      duration: '3-4 hrs',
      description:
        'Build the second version of Kundapura Sahayaka — a real, running terminal chatbot backed by the Anthropic API. It has a system prompt that establishes its persona ("a helpful local guide for Kundapura") but carries NO actual local knowledge beyond whatever the base model happened to learn during training. You will chat with it about Kundapura temples, food, and travel, then deliberately corner it with hyper-local questions to watch it guess — confidently and wrongly — setting up exactly the problem Modules 4-5 (RAG) solve.',
      tools: ['Python', 'anthropic SDK', 'python-dotenv'],
      blueprint: {
        overview:
          'This project turns everything in Module 3 into one runnable file: a `.env`-protected API key, a system prompt defining the Kundapura Sahayaka persona, a streaming `.messages.stream()` call, and a `while True` loop that keeps conversation history. Functionally it is a complete, working chatbot. But it is built with a specific pedagogical trap in mind: the model has no access to real Kundapura facts, so once you push past generic small talk into precise local detail, it answers just as fluently and confidently as it did on the easy questions — while being wrong. Capturing that gap on paper is the actual deliverable; it is the felt motivation for retrieval-augmented generation, which starts in Module 4.',
        functionalRequirements: [
          'A `.env` file holding `ANTHROPIC_API_KEY`, loaded via `python-dotenv` and never hardcoded or committed.',
          'A system prompt that establishes the persona: "You are Kundapura Sahayaka, a helpful local guide for Kundapura." No documents, files, or facts are attached — persona only.',
          'A `while True` command-line loop: read a line of user input, send it plus the full running history to the API, stream the reply to the terminal, and store the reply back into history.',
          'A graceful exit command (`exit`/`quit`) and basic error handling around the API call so a network hiccup does not crash the session.',
          'A short chat transcript capturing at least 3 general questions the bot answers reasonably, and 2-3 hyper-local Kundapura questions where it hallucinates.',
        ],
        technicalImplementation: [
          'Use `anthropic.Anthropic()` (reads `ANTHROPIC_API_KEY` from the environment via `load_dotenv()`) and `client.messages.stream(...)` inside a `with` block for token-by-token output.',
          'Keep `messages` as a single growing list of `{"role": ..., "content": ...}` dicts; append the user turn before the call and the assembled assistant reply after it.',
          'Pass `system=SYSTEM_PROMPT` as Anthropic\'s top-level parameter, not as an entry inside `messages`.',
          'Set a sensible `max_tokens` (300-500) so answers stay conversational rather than essay-length.',
          'Wrap the streaming call in `try/except` so one dropped connection prints an error and lets the loop continue instead of crashing.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Scaffold the project and load the key safely',
            outcome: 'A runnable `sahayaka.py` that imports `anthropic`, loads the API key from `.env` via `python-dotenv`, and fails with a clear error if the key is missing.',
            prompt:
              'Set up a Python project for a terminal chatbot called Kundapura Sahayaka. Create a `.env` file with an `ANTHROPIC_API_KEY` placeholder, add `.env` to `.gitignore`, and write a `sahayaka.py` that imports `anthropic` and `python-dotenv`, calls `load_dotenv()`, reads the key from `os.environ`, and raises a clear `RuntimeError` with a helpful message if it is missing. Print a masked confirmation (first ~10 characters only) once the key loads.',
          },
          {
            step: 2,
            label: 'Write the persona system prompt and a single test call',
            outcome: 'A `SYSTEM_PROMPT` constant defining the Kundapura Sahayaka persona, and one successful `client.messages.create()` call proving the key and persona both work.',
            prompt:
              'Write a `SYSTEM_PROMPT` string that defines the assistant as "Kundapura Sahayaka, a helpful local guide for Kundapura, coastal Karnataka" with a friendly, concise tone. Make a single `client.messages.create()` call using that system prompt, `max_tokens=300`, and a simple user question like "What is neer dosa?" — print `response.content[0].text` to confirm the persona and connection both work before wiring up the loop.',
          },
          {
            step: 3,
            label: 'Build the streaming while-loop chatbot with memory',
            outcome: 'A working command-line chat session where typed questions get streamed replies and follow-up questions correctly use earlier turns.',
            prompt:
              'Turn the single test call into a full chatbot loop: a `messages = []` list that persists across turns, a `while True` loop reading `input("You: ")`, an exit check for "exit"/"quit", and a `client.messages.stream()` call each turn using the system prompt plus the growing `messages` list. Print each streamed chunk as it arrives, then append the complete assistant reply back into `messages`. Wrap the API call in `try/except` so an error prints a message and the loop continues instead of crashing.',
          },
          {
            step: 4,
            label: 'Stress-test it with hyper-local Kundapura questions',
            outcome: 'A saved transcript showing the bot handling general questions well and confidently guessing wrong on specific local facts.',
            prompt:
              'Run the chatbot and have a real conversation covering: (a) 2-3 general, easy questions it should answer reasonably (e.g. what neer dosa is, what a "seva" generally means at a temple), and (b) 2-3 very specific, hyper-local Kundapura questions it cannot actually know — such as the exact seva timing at a particular named Kundapura temple, or details about a specific named local eatery. Copy the full, unedited exchange into a `transcript.md` file.',
          },
          {
            step: 5,
            label: 'Document the hallucinations as the module\'s takeaway',
            outcome: 'A short written note, alongside the transcript, naming each hallucinated answer and why it is a real problem.',
            prompt:
              'Re-read `transcript.md` and, for each of the 2-3 hyper-local questions, write one or two sentences underneath identifying what the model got wrong or invented — a fabricated timing, an invented eatery detail, a vague guess dressed up as fact — and note that it was delivered in the same confident tone as the correct general answers. End the note with one sentence on why this is dangerous for a real local-guide assistant, and what kind of fix (grounding the model in real local documents) would address it.',
          },
        ],
        deliverable:
          'A working terminal chatbot (`sahayaka.py`) with a persisted `.env` key, a Kundapura Sahayaka persona system prompt, streaming replies, and multi-turn memory — plus a `transcript.md` documenting 2-3 hyper-local Kundapura questions (an exact temple seva timing, a specific local eatery) where the model confidently hallucinated, each annotated with what it got wrong. This felt gap — a persona with no real knowledge behind it — is the exact problem Modules 4-5 solve with retrieval-augmented generation.',
      },
    },
  ],
  quiz: [
    {
      id: 'm3-q1',
      q: 'In the Anthropic Python SDK, where does the system prompt (the assistant\'s persona and standing instructions) go?',
      options: [
        'Inside the `messages` list as a message with `role: "system"`',
        'As its own top-level `system` parameter passed to `messages.create()`, separate from the `messages` list',
        "Appended to the end of the user's first message as plain text",
        'It is not supported — persona must be set by fine-tuning the model',
      ],
      answer: 1,
    },
    {
      id: 'm3-q2',
      q: 'What does a "few-shot" prompt add that a "zero-shot" prompt does not?',
      options: [
        'A larger max_tokens value so the reply can be longer',
        "A system prompt describing the assistant's persona",
        'A small number of example input/output pairs showing the exact format or style wanted, before the real question',
        'A JSON schema the API validates the reply against automatically',
      ],
      answer: 2,
    },
    {
      id: 'm3-q3',
      q: 'Which of these is a required parameter when calling `client.messages.create()` with the Anthropic SDK?',
      options: [
        '`temperature`, because every call must specify randomness explicitly',
        '`max_tokens`, which caps how many tokens the reply may generate',
        '`stream`, because streaming is the default behavior',
        '`api_key`, passed fresh with every single call',
      ],
      answer: 1,
    },
    {
      id: 'm3-q4',
      q: 'Why does streaming a reply with `.messages.stream()` make a chatbot feel faster, even though the total time to generate the full answer is about the same?',
      options: [
        'Streaming uses a smaller, faster model automatically',
        'Streaming skips the system prompt to save time',
        'The user sees the first words appear almost immediately instead of waiting in silence for the entire reply to finish generating',
        'Streaming reduces the number of tokens the model needs to generate',
      ],
      answer: 2,
    },
    {
      id: 'm3-q5',
      q: 'In the Module 3 terminal chatbot project, why does asking Kundapura Sahayaka the exact seva timing of a specific named temple often produce a wrong, confidently-stated answer?',
      options: [
        'Because max_tokens was set too low to fit the correct answer',
        'Because the system prompt was written in English instead of Kannada',
        "Because the chatbot has no attached local knowledge source — it only has the persona and the base model's general training, so it fills the gap with a plausible-sounding guess",
        'Because streaming cuts off replies before they finish',
      ],
      answer: 2,
    },
  ],
}
