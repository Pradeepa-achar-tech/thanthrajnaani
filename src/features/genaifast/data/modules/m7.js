// Module 7 — Building a Multi-Tool Agent
// Turns Kundapura Sahayaka from a "RAG bot that always searches" into a real
// tool-calling agent: a ₹/GST calculator, a seva/festival date lookup, a web-search
// fallback, and Module 5's own retrieval — all as tools the model chooses between,
// wrapped in a loop with conversation memory and hard guardrails against runaway calls.

export const m7 = {
  id: 'm7',
  title: 'Building a Multi-Tool Agent',
  hours: 7,
  color: 'from-emerald-500/20 to-emerald-700/10',
  accent: 'emerald',
  description:
    "Kundapura Sahayaka becomes a real agent this module: instead of one forced RAG lookup every turn, it gets a small toolbox — a ₹/GST-style calculator, a seva-and-festival date lookup, a web-search fallback, and Module 5's knowledge-base search itself as a tool it can *choose* to call. You wire all four tools into one tool-calling loop with conversation memory and hard guardrails (call caps, timeouts, safe failure), then stress-test it with real multi-step questions that need two tools in the same answer.",
  sections: [
    {
      id: 'm7-s1',
      title: 'More Tools, More Judgment',
      topics: [
        {
          id: 'm7-t1',
          title: 'A ₹/GST-style calculator tool: splitting bills and adding donations',
          explain:
            'Write a plain Python function that does exact money arithmetic — splitting a fish-thali bill among a group, adding a service charge, and tacking on a fixed seva donation per head — then expose it to the LLM as a callable **tool** instead of asking the model to do the maths itself.',
          analogy:
            'Picture the cashier at a busy Kundapura fish-thali counter. A regular customer could try to add up four thalis, a service charge, and a round of filter coffee in their head — but the smart cashier reaches for the calculator every time, because heads make mistakes and calculators do not. The LLM is that regular customer: fluent, fast, occasionally wrong about arithmetic. The **calculator tool** is the calculator on the counter — the model is trained to reach for it instead of guessing.',
          theory:
            'A "tool" (also called **function calling**) is a plain function you write, described to the model in a JSON schema (`name`, `description`, `input_schema`). When the model decides the function is useful, it does not run any code itself — it replies with a `tool_use` block naming the tool and the arguments it wants to pass. Your code then actually calls the Python function, and you feed the result back to the model as a `tool_result` so it can finish its answer.\n\nLLMs are next-token predictors, not calculators: they are surprisingly bad at multi-digit arithmetic and get *worse*, not better, as numbers get larger or a bill has several line items. Splitting a ₹1,840 fish-thali order four ways, adding a 5% service charge, and adding a ₹100-per-head Ganapathi hundi donation on top is exactly the kind of compound calculation a model will silently botch. Delegating it to real Python code makes the number *provably* correct, every time, regardless of how the model is feeling that day.\n\nKeep the function pure and boring: take numbers in, return numbers out, no side effects. Round money to the nearest paise or rupee deliberately (never let raw floating point creep into a final ₹ total) and return a small dict so the model can quote both the subtotal and the grand total in its reply.',
          whyItMatters:
            'Hallucinated arithmetic is one of the most common — and most embarrassing — LLM failures a real user will actually catch, because everyone can check a bill total. Grounding money maths in real code is the single fastest way to make Kundapura Sahayaka feel trustworthy rather than "impressive but unreliable", and it is the same pattern (delegate exact computation to a tool) used in every production agent that touches numbers.',
          steps: [
            'Write `split_bill_with_donation(total, num_people, donation_per_person=0, service_charge_pct=0)` in plain Python, returning a dict of `per_person`, `service_charge`, `donation_total`, and `grand_total`.',
            'Round every ₹ figure to 2 decimal places inside the function, not in the prompt or the model\'s head.',
            'Write the tool schema dict: `name`, a specific `description` ("Use this to compute totals, per-person splits, service charges, or seva donations — never do this maths yourself"), and an `input_schema` listing each parameter with its type.',
            'Add the schema to a `TOOLS` list and pass `tools=TOOLS` on your `client.messages.create(...)` call.',
            'Ask a question like "split a ₹1,840 fish thali four ways with a ₹100 donation each" and confirm the response contains a `tool_use` block instead of a guessed number.',
            'Execute the function with the model\'s arguments, send the result back as a `tool_result`, and check the final answer matches the function\'s own output exactly.',
          ],
          code: `# tools/calculator.py
def split_bill_with_donation(
    total: float,
    num_people: int,
    donation_per_person: float = 0,
    service_charge_pct: float = 0,
) -> dict:
    """Split a bill among num_people, add an optional service charge and a
    fixed per-person seva donation. All money is rounded to 2 decimal places."""
    if num_people < 1:
        raise ValueError("num_people must be at least 1")

    service_charge = round(total * (service_charge_pct / 100), 2)
    donation_total = round(donation_per_person * num_people, 2)
    grand_total = round(total + service_charge + donation_total, 2)
    per_person = round(grand_total / num_people, 2)

    return {
        "subtotal": round(total, 2),
        "service_charge": service_charge,
        "donation_total": donation_total,
        "grand_total": grand_total,
        "per_person": per_person,
    }

# The tool schema the model sees (goes in your TOOLS list):
CALCULATOR_TOOL = {
    "name": "split_bill_with_donation",
    "description": (
        "Compute an exact ₹ total: splits a bill among num_people, adds an "
        "optional service_charge_pct, and adds a fixed donation_per_person "
        "(e.g. a seva/hundi donation). ALWAYS use this for any ₹ arithmetic "
        "instead of calculating it yourself."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "total": {"type": "number", "description": "Bill subtotal in ₹, before charges/donation"},
            "num_people": {"type": "integer", "description": "Number of people splitting the bill"},
            "donation_per_person": {"type": "number", "description": "₹ donation added per person, default 0"},
            "service_charge_pct": {"type": "number", "description": "Service charge as a percent, default 0"},
        },
        "required": ["total", "num_people"],
    },
}`,
          pitfalls: [
            '**Letting the model do the arithmetic in prose and only "checking" with the tool afterwards.** It will still print its own (possibly wrong) number first. Fix: write the tool description as an instruction ("ALWAYS use this instead of calculating yourself"), and only trust the tool\'s numbers in your own code.',
            '**Adding raw floats without rounding.** `0.1 + 0.2` drift compounds across service charge and donation. Fix: `round(..., 2)` at every money step, or use `decimal.Decimal` for anything audited.',
            '**Not validating `num_people >= 1`.** A zero or negative split divides by zero or produces nonsense. Fix: raise a clear `ValueError` the dispatcher can catch.',
            '**Applying the service charge to the donation too.** Donations are typically fixed, not taxed. Fix: compute `service_charge` from `total` alone, add `donation_total` separately.',
            '**A vague tool description like "does math".** The model may reach for it inconsistently, or never. Fix: be explicit about *when* to use it and *what* it computes.',
            '**Returning a formatted string instead of numbers.** The model then has to re-parse "₹1,840.00" to reuse it in a follow-up. Fix: return raw numeric fields; format for display only in the final reply.',
          ],
          tryIt:
            'Extend the function to accept a list of line items (e.g. three fish-thalis at different prices plus one plain rice-thali) and return the correct subtotal before splitting — then ask the agent "four of us had different thalis totalling ₹1,960, split it evenly with a ₹50 donation each" and verify the number.',
          takeaway:
            'Never let an LLM do money arithmetic in its head — give it a small, exact Python function as a tool and it will reach for it instead of guessing.',
        },
        {
          id: 'm7-t2',
          title: "A \"today's date\" / seva-lookup tool",
          explain:
            'Write a tool that checks the *real* current date against a small seva/festival schedule and returns the next occurrence — because the model has no clock of its own and will otherwise guess or use its training-data date.',
          analogy:
            'A temple noticeboard does not rely on a devotee\'s memory of what day it is — it is updated against the actual calendar, and anyone can walk up and read off the next Friday seva or the next Ashtami. The date-lookup tool is that noticeboard: it consults the real clock on your machine, not the model\'s fuzzy sense of "now" left over from training.',
          theory:
            'An LLM has a training cutoff and, inside a single API call, no built-in notion of "today". Ask it "what date is it?" and it will either refuse, guess, or quietly assume the last date it saw a lot of during training — all wrong for a live assistant. The fix is the same pattern as the calculator: delegate to code that actually knows, via Python\'s `datetime.date.today()`.\n\nPair that real "now" with a small structured schedule — a JSON or Python list of `{name, weekday_or_date, notes}` entries for recurring sevas (e.g. every Friday) and fixed festival dates (e.g. a specific date each year, or one you compute from a lunar calendar source you already have). The tool then does simple date arithmetic: for a recurring weekday seva, find the next date on or after today matching that weekday; for a fixed festival, compare month/day against today and roll to next year if it has passed.\n\nKeep the "current time" injectable rather than hardcoded — accept an optional `as_of` parameter that defaults to `date.today()` but can be overridden in tests, so you can simulate "what if today were a Thursday" without waiting for an actual Thursday.',
          whyItMatters:
            'Date reasoning is a well-known LLM weak spot, and it is *exactly* the kind of question a real user asks constantly ("is there seva this Friday?", "when is the next festival?"). A tool that consults the real calendar turns a classic failure mode into a guaranteed-correct answer, and the injectable `as_of` parameter is what makes the tool testable without waiting for the calendar to cooperate.',
          steps: [
            'Create a small `SEVA_SCHEDULE` list of dicts: some entries recurring by weekday (e.g. `{"name": "Friday evening seva", "weekday": 4}`), some fixed by month/day (e.g. `{"name": "Kotte Kadubu Habba", "month": 8, "day": 15}`).',
            'Write `next_occurrence(entry, as_of)` that returns the next matching date — weekday arithmetic for recurring entries, month/day rollover-to-next-year for fixed ones.',
            'Write `check_seva_date(name=None, as_of=None)` that defaults `as_of` to `date.today()`, filters the schedule by `name` if given, and returns each match\'s next date and how many days away it is.',
            'Write the tool schema with a description that makes clear this is for *dates*, not for looking up seva *content* (that stays with the RAG tool).',
            'Test with the real `date.today()`.',
            'Test again by passing an explicit `as_of` for a few different weekdays and confirm "next Friday" always lands correctly, including when today itself is a Friday.',
          ],
          code: `# tools/seva_dates.py
from datetime import date, timedelta

SEVA_SCHEDULE = [
    {"name": "Friday evening seva", "weekday": 4, "notes": "6:30 PM, Ganapathi temple"},
    {"name": "Amavasye special seva", "weekday": None, "lunar": True, "notes": "check panchanga; approximate monthly"},
    {"name": "Kotte Kadubu Habba", "month": 8, "day": 15, "notes": "annual coastal harvest festival"},
]

def next_occurrence(entry: dict, as_of: date) -> date:
    if entry.get("weekday") is not None:
        days_ahead = (entry["weekday"] - as_of.weekday()) % 7
        return as_of + timedelta(days=days_ahead)
    if "month" in entry and "day" in entry:
        candidate = date(as_of.year, entry["month"], entry["day"])
        if candidate < as_of:
            candidate = date(as_of.year + 1, entry["month"], entry["day"])
        return candidate
    return as_of  # lunar entries: flagged, not computed exactly here

def check_seva_date(name: str | None = None, as_of: date | None = None) -> list[dict]:
    """Look up the next date for one or more seva/festival schedule entries."""
    today = as_of or date.today()
    matches = [e for e in SEVA_SCHEDULE if not name or name.lower() in e["name"].lower()]
    results = []
    for entry in matches:
        next_date = next_occurrence(entry, today)
        results.append({
            "name": entry["name"],
            "date": next_date.isoformat(),
            "days_away": (next_date - today).days,
            "notes": entry["notes"],
        })
    return results

SEVA_DATE_TOOL = {
    "name": "check_seva_date",
    "description": (
        "Look up the next real calendar date for a seva or festival by name "
        "(e.g. 'Friday seva', 'Kotte Kadubu Habba'). Use this for date/timing "
        "questions, NOT for details about what the seva involves — that comes "
        "from search_knowledge_base."
    ),
    "input_schema": {
        "type": "object",
        "properties": {"name": {"type": "string", "description": "Seva or festival name to search for, optional"}},
    },
}`,
          pitfalls: [
            '**Trusting the model\'s idea of "today".** It has none inside the API call. Fix: always source "now" from a tool, never from the prompt or the model\'s guess.',
            '**Timezone mismatches.** `date.today()` uses the server\'s local time, which may not be IST if deployed elsewhere. Fix: use `datetime.now(ZoneInfo("Asia/Kolkata")).date()` explicitly.',
            '**Off-by-one weekday arithmetic.** Python\'s `weekday()` is Monday=0..Sunday=6; mixing this up with a 1-indexed convention silently shifts every date by a day. Fix: pick one convention and test it against a known date.',
            '**Not handling "today is the day itself".** `(weekday - today.weekday()) % 7` correctly returns 0 for "today", but forgetting the modulo makes it negative. Fix: keep the `% 7`, and test the exact-match case explicitly.',
            '**Hardcoding festival dates that actually move (lunar calendar).** A fixed month/day is wrong for lunar festivals. Fix: flag lunar entries explicitly rather than computing a false-precision date.',
            '**Forgetting year rollover.** A festival that already passed this year must roll to next year, not report a past date. Fix: the `if candidate < as_of` check above — test it deliberately.',
          ],
          tryIt:
            'Add an entry for a monthly Ekadashi-style recurring note and a second annual festival, then call `check_seva_date()` with no `name` to confirm it returns every upcoming entry sorted sensibly by `days_away`.',
          takeaway:
            "The model has no clock — give it a tool that consults the real date and a small schedule, so seva-timing questions get a genuinely correct answer.",
        },
        {
          id: 'm7-t3',
          title: 'A web-search tool for questions outside the local knowledge base',
          explain:
            "Add a fallback tool the agent can call when a question falls outside your local markdown knowledge base — e.g. today's bus fare or weather — using a real search API if you have a key, or a clearly-labelled stub if you don't.",
          analogy:
            "Your knowledge base is the committee's own filing cabinet — seva timings, recipes, travel notes you wrote yourself. But a devotee might ask something the cabinet was never meant to hold, like today's ferry cancellations from monsoon flooding. For that, someone picks up the phone and asks around town instead of pretending the filing cabinet has the answer. The web-search tool is that phone call.",
          theory:
            "A local knowledge base is deliberately small and curated — it will never cover live, fast-changing facts (weather, current fares, news). Rather than let the model hallucinate an answer or force everything through RAG, give it an explicit **fallback tool** for exactly this case, with a description that says when to reach for it.\n\nReal options for the underlying search call: **Tavily** (`tavily-python`, built specifically for LLM agents — returns clean, citation-ready snippets), **SerpAPI** (wraps Google search results), or Bing's Search API. All need an API key and a small monthly budget; store the key in `.env` exactly like your LLM key. If you don't want to set one up yet, write a **stubbed** `web_search(query)` that returns a fixed, clearly-fake result (e.g. `\"[MOCK RESULT] No live search configured — this is placeholder text.\"`) — the tool contract stays identical, so swapping in a real API later is a one-function change, not a redesign.\n\nWhatever backend you use, keep this tool's description narrow: \"use only for questions about live/current information NOT covered by the local Kundapura knowledge base\" — otherwise the model may prefer the (more familiar-sounding) web tool over your carefully curated RAG tool even when the local KB already has the answer.",
          whyItMatters:
            'Real assistants get asked things outside their curated data constantly, and pretending otherwise either produces a hallucination or a flat refusal — neither is good. A narrowly-scoped, clearly-labelled fallback tool (even a stub) teaches the agent-design skill that matters most here: knowing your knowledge base\'s edges and having an honest plan for what\'s outside them.',
          steps: [
            'Decide: do you have (or want) a Tavily/SerpAPI key? If yes, add it to `.env` as `SEARCH_API_KEY`; if no, plan to use the stub.',
            'Write `web_search(query: str) -> str` calling the real API if `SEARCH_API_KEY` is set, otherwise returning a clearly-labelled mock string.',
            'Write the tool schema with a narrow description explicitly excluding topics the local KB already covers (seva timings, recipes, travel notes).',
            'Add it to `TOOLS` alongside the others.',
            'Ask something genuinely outside the KB (e.g. "is there any road closure near Kundapura today?") and confirm the model calls `web_search`, not `search_knowledge_base`.',
            'Ask something the KB *does* cover (e.g. "what time is Friday seva?") and confirm the model does NOT call `web_search`.',
          ],
          code: `# tools/web_search.py
import os
import requests

SEARCH_API_KEY = os.getenv("SEARCH_API_KEY")

def web_search(query: str) -> str:
    """Search the live web. Falls back to a mocked stub if no API key is set."""
    if not SEARCH_API_KEY:
        return (
            f"[MOCK RESULT for '{query}'] No live search API configured. "
            "Set SEARCH_API_KEY (e.g. a Tavily key) in .env to enable real results."
        )

    # Real option: Tavily (built for LLM agents, concise citation-ready snippets)
    resp = requests.post(
        "https://api.tavily.com/search",
        json={"api_key": SEARCH_API_KEY, "query": query, "max_results": 3},
        timeout=8,
    )
    resp.raise_for_status()
    results = resp.json().get("results", [])
    return "\\n\\n".join(f"{r['title']}: {r['content']}" for r in results) or "No results found."

WEB_SEARCH_TOOL = {
    "name": "web_search",
    "description": (
        "Search the live web for CURRENT information not in the local Kundapura "
        "knowledge base (e.g. weather, live bus/ferry status, news). Do NOT use "
        "this for seva timings, recipes, or travel notes already in the "
        "knowledge base — use search_knowledge_base for those."
    ),
    "input_schema": {
        "type": "object",
        "properties": {"query": {"type": "string", "description": "The web search query"}},
        "required": ["query"],
    },
}`,
          pitfalls: [
            '**No timeout on the HTTP call.** A hung network request freezes the whole agent turn. Fix: always pass `timeout=` to `requests`.',
            '**A tool description broad enough to overlap with search_knowledge_base.** The model starts preferring web search even for questions your curated KB already answers well. Fix: name the KB\'s exact topics in the exclusion clause.',
            '**Leaking the API key into logs or committed code.** Fix: `.env` + `python-dotenv`, `.env` in `.gitignore`, never print the key.',
            '**Treating search results as ground truth without attribution.** Fix: keep source titles/URLs in the returned text so the final answer can be honest about where it came from.',
            '**Forgetting the stub still needs to look like a tool result, not an error.** If it silently fails differently from the real path, your tests won\'t catch description problems. Fix: keep the return type (a string) identical in both branches.',
            '**No rate limiting or cost awareness.** An eager agent calling web search on every ambiguous question runs up API bills. Fix: narrow the description, and pair with the tool-call cap from later in this module.',
          ],
          tryIt:
            'Run the same three test questions (KB topic, web-only topic, and something ambiguous like "what\'s a good time to visit Kundapura") through the agent and note which tool it picks for each — tighten the descriptions if any pick looks wrong.',
          takeaway:
            "Give the agent an honest, narrowly-described escape hatch for questions outside your local knowledge base — a real search API if you have a key, a clearly-labelled stub if you don't.",
        },
        {
          id: 'm7-t4',
          title: "Turning Module 5's RAG retrieval into a callable tool",
          explain:
            "Wrap the FAISS/Chroma retriever from Module 5 in a single function, `search_knowledge_base(query, k=3)`, and expose it as a tool — so the model can CHOOSE to search your documents rather than being forced to search on every single turn.",
          analogy:
            "In Module 5, Kundapura Sahayaka behaved like a nervous new volunteer who runs to check the filing cabinet before answering literally anything — even \"hello\" or a plain arithmetic question. A seasoned reference librarian works differently: she decides herself, question by question, whether the shelf is actually relevant, and answers straight from memory when it clearly isn't. Making retrieval a tool turns your forced-every-turn RAG bot into that seasoned librarian.",
          theory:
            'Module 4-5\'s RAG pipeline retrieved chunks on *every* turn, unconditionally, and stuffed them into the prompt — simple, but wasteful and sometimes actively worse: irrelevant chunks for an off-topic question can distract the model or pad the response with noise. **Agentic RAG** flips this: retrieval becomes a tool the model calls only when it judges the question needs grounding in your documents.\n\nThe wrapper itself is small — reuse the vector store you already built (`langchain` + `faiss-cpu` or `chromadb`) and its `.similarity_search(query, k=3)` call, then join the returned chunks\' text (and their source file paths, for a citeable answer) into one string. The *only* new thing is describing this as a tool with a clear "when to use" trigger, exactly like the other three tools.\n\nThe payoff shows up immediately in testing: ask "hi, how are you?" or "what\'s 12 times 4?" and a forced-RAG bot still burns an embedding + similarity-search call for nothing; an agentic version correctly skips it. Ask "what time is the Friday seva?" and it correctly calls the tool. This is the same judgment upgrade every tool in this section aims for — precision and speed instead of a fixed, always-on pipeline.',
          whyItMatters:
            "This is the pivotal architectural shift of the whole module: RAG stops being a rigid pipeline glued in front of the model and becomes one tool among several, selected on judgment. It's the pattern used in essentially every production RAG-plus-agent system, and it directly sets up Module 7's build, where all four tools have to coexist without stepping on each other.",
          steps: [
            'Reuse Module 5\'s persisted vector store (load it once at startup, not per-call).',
            'Write `search_knowledge_base(query: str, k: int = 3) -> str` calling `.similarity_search(query, k=k)` and joining `f"[{doc.metadata[\'source\']}]\\n{doc.page_content}"` for each result.',
            'Write the tool schema with a description naming the KB\'s actual topics (seva timings, recipes, travel notes) so the model knows exactly when it applies.',
            'Remove any code that force-calls retrieval before every `messages.create` — retrieval now only happens if/when the model emits a `tool_use` block for it.',
            'Test an off-topic question ("what\'s 5 + 7?") and confirm no retrieval call happens.',
            'Test an on-topic question and confirm the retrieved chunks show up in the final answer, with a source noted.',
          ],
          code: `# tools/kb_search.py
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings  # or your Module 5 embedding choice

_embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
_vectorstore = FAISS.load_local("data/kb_index", _embeddings, allow_dangerous_deserialization=True)

def search_knowledge_base(query: str, k: int = 3) -> str:
    """Search the local Kundapura knowledge base (seva timings, recipes, travel notes)."""
    docs = _vectorstore.similarity_search(query, k=k)
    if not docs:
        return "No relevant knowledge base entries found."
    return "\\n\\n".join(f"[{d.metadata.get('source', 'unknown')}]\\n{d.page_content}" for d in docs)

KB_SEARCH_TOOL = {
    "name": "search_knowledge_base",
    "description": (
        "Search the local Kundapura knowledge base for temple seva/festival "
        "info, coastal-Karnataka recipes (neer dosa, kori rotti, fish thali, "
        "kotte kadubu, kane fish curry), or Kundapura-area travel notes (buses, "
        "ferries, monsoon connectivity). Use this whenever the question is "
        "about these topics; skip it for greetings, arithmetic, or anything "
        "unrelated."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "What to search for in the knowledge base"},
            "k": {"type": "integer", "description": "Number of chunks to retrieve, default 3"},
        },
        "required": ["query"],
    },
}`,
          pitfalls: [
            '**Loading the vector store inside the function.** Rebuilding the FAISS index on every call is slow and wasteful. Fix: load it once at module import time, reuse the handle.',
            '**A description too vague to trigger reliably.** The model may skip the KB even for clearly relevant questions. Fix: name the actual topics/keywords the KB covers, not just "search documents".',
            '**Forgetting to drop the old forced-retrieval code.** You end up retrieving twice — once forced, once as a tool call. Fix: retrieval should only happen inside the tool now.',
            '**Not returning the source path.** The final answer can\'t honestly say where the seva timing came from. Fix: include `doc.metadata[\'source\']` in the returned text.',
            '**Returning huge, untruncated chunks.** Bloats context and cost. Fix: keep chunk sizes reasonable at index time (Module 4/5) and cap `k`.',
            '**Overlapping wording with the web_search description.** If both tools sound like "search for information", the model picks inconsistently. Fix: make each description name mutually exclusive topics.',
          ],
          tryIt:
            'Log every tool call made during a 5-question test run (mixing on-topic, off-topic, and small-talk questions) and confirm `search_knowledge_base` fires only for the on-topic ones.',
          takeaway:
            "Wrapping retrieval as a tool — instead of forcing it every turn — lets the model decide when your knowledge base is actually relevant, which is the core upgrade from 'RAG bot' to 'agent'.",
        },
      ],
    },
    {
      id: 'm7-s2',
      title: 'Build: Kundapura Sahayaka Agent',
      topics: [
        {
          id: 'm7-t5',
          title: 'All tools at once: clear, non-overlapping tool descriptions',
          explain:
            'Assemble all four tools into one `TOOLS` list plus a dispatcher that maps tool names to Python functions, and write the agentic loop that lets the model call any of them — as many times as a question needs.',
          analogy:
            'Hand a new front-desk volunteer a labelled toolbox rather than a pile of unlabelled tools: a screwdriver clearly marked "for screws", a wrench clearly marked "for bolts" — never a drawer where two tools both plausibly claim the same job. The volunteer (the model) still has to decide which tool fits, but only if the labels are honest and non-overlapping does she decide correctly every time.',
          theory:
            'You now have four tool schemas (`split_bill_with_donation`, `check_seva_date`, `web_search`, `search_knowledge_base`) and four Python functions. Two things need to happen: a **dispatcher** — a plain dict mapping each tool\'s `name` string to its Python function — and an **agentic loop** that keeps calling the API, executing whatever tools the model asks for, and feeding results back, until the model produces a final text answer instead of another tool request.\n\nThe loop\'s shape: call `client.messages.create(model=..., system=..., messages=messages, tools=TOOLS)`. If `response.stop_reason == "tool_use"`, append the assistant\'s own turn (`response.content`, which includes the `tool_use` blocks) to `messages`, then for each `tool_use` block in that content, look up and call the matching function via the dispatcher, and collect a `tool_result` block per call (matching `tool_use_id`). Append all the `tool_result` blocks as one new `user` turn, and loop. When `stop_reason` is `"end_turn"`, the model\'s final text is the answer.\n\nThe part that most determines whether this works well is not the loop — it\'s **description quality**. Each tool\'s description should state exactly when to use it and, ideally, when *not* to (as you did for `search_knowledge_base` vs `web_search`). Overlapping or vague descriptions are the #1 cause of an agent calling the wrong tool, or the right tool with wrong arguments.',
          whyItMatters:
            "This is where the module's separate pieces become one working agent. Tool-selection accuracy in production systems lives or dies on description quality far more than on model choice — it's a cheap, high-leverage skill: better wording, not more code, fixes most misrouted tool calls.",
          steps: [
            'Collect all four schemas into `TOOLS = [CALCULATOR_TOOL, SEVA_DATE_TOOL, WEB_SEARCH_TOOL, KB_SEARCH_TOOL]`.',
            'Build `DISPATCH = {"split_bill_with_donation": split_bill_with_donation, "check_seva_date": check_seva_date, "web_search": web_search, "search_knowledge_base": search_knowledge_base}`.',
            'Write `execute_tool(name, args)` that looks up the function in `DISPATCH` and calls it with `**args`.',
            'Write the `while True` agentic loop described above, using `response.stop_reason` to decide whether to keep looping or return the final text.',
            'Re-read all four descriptions side by side and rewrite any that could plausibly apply to the same question.',
            'Ask one single-tool question per tool (four questions total) and confirm each picks exactly the tool you\'d expect.',
          ],
          code: `# agent.py
import json
import anthropic
from tools.calculator import split_bill_with_donation, CALCULATOR_TOOL
from tools.seva_dates import check_seva_date, SEVA_DATE_TOOL
from tools.web_search import web_search, WEB_SEARCH_TOOL
from tools.kb_search import search_knowledge_base, KB_SEARCH_TOOL

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env

TOOLS = [CALCULATOR_TOOL, SEVA_DATE_TOOL, WEB_SEARCH_TOOL, KB_SEARCH_TOOL]
DISPATCH = {
    "split_bill_with_donation": split_bill_with_donation,
    "check_seva_date": check_seva_date,
    "web_search": web_search,
    "search_knowledge_base": search_knowledge_base,
}

SYSTEM_PROMPT = (
    "You are Kundapura Sahayaka, a helpful assistant for coastal-Karnataka "
    "life: temple seva timings, local recipes, and Kundapura-area travel. "
    "Use your tools whenever they would give a more accurate answer than "
    "guessing — especially for money maths and dates."
)

def execute_tool(name: str, args: dict):
    fn = DISPATCH[name]
    return fn(**args)

def run_turn(messages: list) -> str:
    while True:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )
        if response.stop_reason != "tool_use":
            return "".join(b.text for b in response.content if b.type == "text")

        messages.append({"role": "assistant", "content": response.content})
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = execute_tool(block.name, block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result),
                })
        messages.append({"role": "user", "content": tool_results})`,
          pitfalls: [
            '**Forgetting to append the assistant\'s `tool_use` turn before the `tool_result` turn.** The API rejects a `tool_result` that doesn\'t follow a matching `tool_use`. Fix: always append `response.content` first, exactly as returned.',
            '**Mismatched `tool_use_id`.** Each `tool_result` must reference the exact id of the `tool_use` block it answers. Fix: read `block.id`, don\'t invent your own.',
            '**Only handling one `tool_use` block per response.** The model can request several tools in one turn (e.g. calculator AND date lookup together). Fix: loop over all blocks in `response.content`, collect all results, send them together.',
            '**Letting a tool exception crash the loop.** Fix: wrap `execute_tool` in try/except and return an error dict — covered fully in the guardrails topic next.',
            '**Two tools with overlapping "search" wording.** Causes inconsistent routing between `search_knowledge_base` and `web_search`. Fix: name exact topics each one owns.',
            '**Passing `tools=TOOLS` only sometimes.** If a later call in the loop omits `tools`, the model can\'t continue using them mid-conversation. Fix: always pass the full `TOOLS` list on every call.',
          ],
          tryIt:
            'Ask a single question that plausibly could use two tools ("what\'s today\'s date, and is there a Friday seva coming up?") and confirm the loop correctly executes both `tool_use` blocks from one response before replying.',
          takeaway:
            'A dispatcher dict plus a loop that keeps executing tool_use blocks until stop_reason is end_turn is the entire mechanics of a tool-calling agent — description quality is what makes it pick correctly.',
        },
        {
          id: 'm7-t6',
          title: 'Agent memory: carrying context across turns',
          explain:
            "Keep accumulating every user, assistant, and tool turn in one `messages` list across the whole conversation, so a follow-up like \"and how much would that cost for 4 people?\" correctly resolves using what was just discussed.",
          analogy:
            "A good counter clerk remembers what you asked thirty seconds ago — if you say \"and for four of us?\" right after asking about a fish thali, she doesn't make you repeat the whole order. A clerk with no memory treats every sentence as a stranger walking in fresh, which is exhausting and useless. The LLM API is naturally the memory-less clerk; your `messages` list is what gives it a memory.",
          theory:
            'Every call to `client.messages.create(...)` is **stateless** — the model only knows what is in the `messages` list you send *that call*. There is no server-side session remembering your last question. "Memory" in a chat agent is nothing more than: keep appending every turn (user text, assistant text, assistant tool_use, and your tool_result) to one growing Python list, and resend the *entire* list on every call.\n\nThis is why the loop in the previous topic appended `{"role": "assistant", "content": response.content}` and the tool results as a `user` turn — those aren\'t just plumbing for the current question, they *are* what makes cross-turn memory work: by the time the user asks a follow-up, the list already contains the full trail of what was asked, searched, and computed.\n\nWith this in place, "what\'s the seva timing this Friday?" followed by "and how much would that cost for 4 people at ₹250 each?" works correctly: the model sees the whole prior exchange, has no seva-timing question left to resolve, and calls the calculator tool directly with `num_people=4, donation_per_person=250` — no need for the user to repeat context.\n\nBe aware this memory is **in-process and temporary** — it lives only as long as your Python process runs; restart the script and it\'s gone. Real persistence across sessions would mean saving `messages` to a file or database, which is out of scope here but a natural next step once you deploy (Module 8).',
          whyItMatters:
            'Multi-turn coherence is the difference between something that feels like "a chatbot that answers one question at a time" and something that feels like an actual assistant. It\'s also directly what the module\'s own test cases require — the deliberately tricky multi-step questions in this module often span two turns, not just two tools in one turn.',
          steps: [
            'Initialize one `messages = []` list per conversation, outside the per-turn loop.',
            'On each new user message, `messages.append({"role": "user", "content": user_text})` before calling `run_turn(messages)`.',
            'Confirm `run_turn` (from the previous topic) already appends assistant and tool_result turns into the same list as a side effect.',
            'Ask a first question needing one tool (e.g. the seva date), then a follow-up that only makes sense with that context (e.g. "and the donation for 4 people?").',
            'Print `len(messages)` after each turn to see it growing, and skim the list to see exactly what the model can "remember".',
            'Note where you would add trimming/summarization if the conversation ran very long (mention only — do not implement token-budget trimming yet).',
          ],
          code: `# chat_loop.py
from agent import run_turn

def main():
    messages = []
    print("Kundapura Sahayaka — type 'quit' to exit")
    while True:
        user_text = input("You: ").strip()
        if user_text.lower() in {"quit", "exit"}:
            break
        messages.append({"role": "user", "content": user_text})
        reply = run_turn(messages)
        messages.append({"role": "assistant", "content": reply})
        print(f"Sahayaka: {reply}")

if __name__ == "__main__":
    main()

# Example session (memory in action):
# You: what's the seva timing this Friday?
# Sahayaka: Friday evening seva is on 2026-07-11, 6:30 PM at the Ganapathi temple.
# You: and how much would that cost for 4 people at ₹250 donation each?
# Sahayaka: ₹1,000 total — ₹250 per person for 4 people. (No mention of "Friday" needed —
#            the model resolved "that" from the prior turn already in messages.)`,
          pitfalls: [
            '**Creating a fresh `messages = []` on every turn.** Every question becomes a stranger again — the classic "no memory" bug. Fix: create the list once per conversation, reuse it.',
            '**Forgetting to append the tool_use/tool_result turns from `run_turn`\'s internal loop.** If your loop only appends the *final* text and drops the intermediate tool turns, later follow-ups lose the detail of what was actually looked up. Fix: let `run_turn` mutate the same `messages` list it was given (as shown), not a local copy.',
            '**Unbounded growth.** A very long conversation eventually exceeds the model\'s context window or gets expensive. Fix: for this module, note the issue; a later module can add trimming/summarization of older turns.',
            '**Confusing the `system` prompt with memory.** `system` is fixed instructions resent every call — it is not where conversation history goes. Fix: keep them separate; history goes in `messages`.',
            '**Assuming memory persists across process restarts.** It doesn\'t — it\'s just a Python list in RAM. Fix: if persistence matters, save `messages` to a JSON file at the end of a session.',
            '**Losing referenced entities when trimming carelessly.** If you ever do trim old turns, cutting the middle of a tool_use/tool_result pair breaks the API contract. Fix: trim in whole-turn units, never mid-pair.',
          ],
          tryIt:
            'Have a 3-turn conversation: ask for the Friday seva date, then ask for a bill split for "that many days from now times two people" (forcing it to recall the days_away number), then ask "what did I just ask you first?" and confirm all three resolve correctly from the same `messages` list.',
          takeaway:
            "The API is stateless — 'memory' is just resending the whole growing messages list every turn, which is exactly what makes follow-up questions like 'and for 4 people?' work.",
        },
        {
          id: 'm7-t7',
          title: 'Guardrails: call caps, loop limits, and timeouts',
          explain:
            'Add a hard cap on how many tool calls one turn can make, a timeout on any network-calling tool, and a safe, honest fallback message for when a limit is hit — so the agent fails gracefully instead of spinning or hanging.',
          analogy:
            "A patient reference librarian will still, after the fifth or sixth trip to the shelves for the same reader, say \"let me just tell you what I've found so far\" rather than walking back and forth forever. Guardrails are that librarian's good sense, written into code: a firm limit on how many times the agent will go fetch something before it must answer with what it has.",
          theory:
            'A tool-calling loop can, in principle, run forever: the model calls a tool, gets a result it doesn\'t love, calls it again with slightly different arguments, and repeats — or ping-pongs between two tools if their descriptions are ambiguous. Left unguarded, this burns API calls (cost), wall-clock time (a hung user), and can loop indefinitely if a tool always returns something the model wants to retry.\n\nThree concrete guardrails fix this:\n1. **A tool-call cap per turn** — a `MAX_TOOL_CALLS` constant (e.g. 5). Track a counter across loop iterations; once hit, stop looping and either ask the model to answer with what it has, or return a clear "I wasn\'t able to fully resolve this" message.\n2. **Per-tool timeouts** — any tool that makes a network call (`web_search`) must pass an explicit `timeout=` so a hung request can\'t freeze the whole agent turn indefinitely.\n3. **Safe tool failure** — wrap `execute_tool` in try/except; on any exception, return a `tool_result` with `"is_error": True` and a short message, instead of letting the exception crash the whole process. The model can then react sensibly ("I couldn\'t look that up right now") instead of the app dying mid-conversation.\n\nGuardrails are an operational concern, not a correctness one — they don\'t change what a *well-behaved* run looks like, only how badly a *misbehaving* run fails. That distinction is exactly what makes them easy to skip and important not to.',
          whyItMatters:
            "Every production agent needs this — an unbounded tool loop is a real cost and reliability risk, not a theoretical one, and it's the kind of bug that only shows up under load or with an unlucky prompt. Building the habit here, on a small local project, is what makes it automatic later.",
          steps: [
            'Define `MAX_TOOL_CALLS = 5` as a module constant.',
            'In the agentic loop, maintain a `calls_made` counter, incrementing once per executed tool call (not per loop iteration, since one response can contain several).',
            'Before executing tools in a given iteration, check `calls_made >= MAX_TOOL_CALLS`; if so, stop looping and return a clear fallback message instead of calling more tools.',
            'Add `timeout=8` (or similar) to the `requests.post` call inside `web_search`, and catch `requests.Timeout` there specifically.',
            'Wrap `execute_tool` in try/except, returning `{"type": "tool_result", "tool_use_id": ..., "content": json.dumps({"error": str(e)}), "is_error": True}` on failure.',
            'Deliberately break a tool (e.g. raise inside `split_bill_with_donation` for `num_people=0`) and confirm the agent reports the problem instead of crashing.',
          ],
          code: `# agent.py (guardrail additions)
MAX_TOOL_CALLS = 5

def run_turn(messages: list) -> str:
    calls_made = 0
    while True:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )
        if response.stop_reason != "tool_use":
            return "".join(b.text for b in response.content if b.type == "text")

        if calls_made >= MAX_TOOL_CALLS:
            return (
                "I've tried a few lookups but couldn't fully resolve this — "
                "could you ask it a bit more specifically?"
            )

        messages.append({"role": "assistant", "content": response.content})
        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            calls_made += 1
            try:
                result = execute_tool(block.name, block.input)
                content, is_error = json.dumps(result), False
            except Exception as e:
                content, is_error = json.dumps({"error": str(e)}), True
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": content,
                "is_error": is_error,
            })
        messages.append({"role": "user", "content": tool_results})

# tools/web_search.py (timeout already shown in m7-t3, echoed here for emphasis)
# resp = requests.post(url, json=payload, timeout=8)  # never call a network tool without one`,
          pitfalls: [
            '**No cap at all.** A single ambiguous question can spiral into a dozen silent tool calls and a surprise API bill. Fix: always set a `MAX_TOOL_CALLS`.',
            '**A cap so low it truncates legitimate multi-tool answers.** A question needing 3 genuine tool calls fails at a cap of 2. Fix: size the cap to your hardest real test question plus a little headroom (5 is generous for four tools).',
            '**Swallowing exceptions silently (`except: pass`).** The model gets no signal anything went wrong and may hallucinate a result. Fix: always return an `is_error` tool_result so the model can react honestly.',
            '**No timeout on network tools.** One hung request freezes the entire conversation with no feedback to the user. Fix: `timeout=` on every `requests` call, plus a specific `except requests.Timeout`.',
            '**Counting loop iterations instead of actual tool calls.** One response can contain several `tool_use` blocks — a per-iteration counter undercounts. Fix: increment once per executed block, as shown.',
            '**Not logging what tripped the guardrail.** Makes debugging a runaway case hard later. Fix: print/log the tool name and args each time `calls_made` increments.',
          ],
          tryIt:
            'Temporarily set `MAX_TOOL_CALLS = 1` and ask a question that genuinely needs two tools — confirm the agent returns the graceful fallback message instead of crashing or looping — then restore the real cap.',
          takeaway:
            "A tool-call cap, per-tool timeouts, and try/except-wrapped tool execution turn 'agent might spin forever or crash' into 'agent fails safely and says so.'",
        },
        {
          id: 'm7-t8',
          title: 'Testing end-to-end with tricky multi-step questions',
          explain:
            'Build a small test script that runs a handful of deliberately hard questions — each needing two or more tools, or a follow-up that depends on memory — and print exactly which tools fired with what arguments, so you can eyeball whether the agent is actually reasoning correctly.',
          analogy:
            "Before a new committee volunteer works the public counter alone, someone deliberately throws a burst of awkward real questions at them first — not just the easy ones — to see where they stumble. Testing the agent end-to-end is that mock inspection day: you already know roughly what the right answer looks like, so you can catch a wrong tool pick or a memory slip before a real user does.",
          theory:
            'A handful of well-chosen test questions catches more agent bugs than a large number of easy ones, because the failure modes that matter are specific: wrong tool chosen, right tool but wrong arguments, memory not carried across turns, or the guardrail firing when it shouldn\'t. Aim for one test per category:\n- **Pure RAG**: "what\'s the recipe for kotte kadubu?" — should call only `search_knowledge_base`.\n- **Pure calculation**: "split ₹960 four ways with a 5% service charge" — should call only the calculator.\n- **Combined (2 tools, 1 turn)**: "what\'s the seva timing this Friday, and if the donation is ₹250 per person for 3 people, what\'s the total?" — should call `check_seva_date` AND `split_bill_with_donation` before answering.\n- **Out-of-scope**: something clearly not in the KB — should call `web_search`, not hallucinate or wrongly call the KB tool.\n- **Memory-dependent follow-up**: a two-turn exchange where the second question only makes sense given the first ("and for 4 people?").\n\nRather than a formal unit-testing framework, a simple script that logs every `tool_use` block\'s name and arguments as it happens (before executing) gives you a readable trace to manually check against expectations — this is "eval by inspection", appropriate at this stage; more rigorous automated evaluation is a natural next step once the app is deployed.',
          whyItMatters:
            "This is the payoff step for the whole module: it's the difference between an agent that *looks* like it works because you asked it one easy question, and one you've actually verified handles the hard, realistic cases — including the exact kind of two-tool, memory-dependent question a real user will ask without warning.",
          steps: [
            'Write a `TEST_QUESTIONS` list covering the five categories above, each as either a single string or a list of turns (for the memory case).',
            'Add a print statement inside the agentic loop\'s tool-execution step logging `block.name` and `block.input` before calling `execute_tool`.',
            'Run each test question through `run_turn`, capturing the tool trace and the final answer.',
            'Build a small table by hand: question, tools expected, tools actually called, final answer correct? (yes/no).',
            'For any mismatch, read the relevant tool description(s) again and tighten the wording — then rerun just that question.',
            'Once all five pass, run the exact multi-step example ("seva timing this Friday, and ₹250 per person for 3 people") one more time end-to-end as a final sanity check.',
          ],
          code: `# test_agent.py
from agent import run_turn

TEST_CASES = [
    {"turns": ["what's the recipe for kotte kadubu?"], "expect_tools": {"search_knowledge_base"}},
    {"turns": ["split ₹960 four ways with a 5% service charge"], "expect_tools": {"split_bill_with_donation"}},
    {
        "turns": ["what's the seva timing this Friday, and if the donation is "
                  "₹250 per person for 3 people, what's the total?"],
        "expect_tools": {"check_seva_date", "split_bill_with_donation"},
    },
    {"turns": ["is there any road closure near Kundapura today?"], "expect_tools": {"web_search"}},
    {
        "turns": ["what's the seva timing this Friday?", "and the donation total for 4 people at ₹250 each?"],
        "expect_tools": {"check_seva_date", "split_bill_with_donation"},  # across both turns
    },
]

def run_case(case):
    messages = []
    called = set()
    original_execute = execute_tool
    def logging_execute(name, args):
        called.add(name)
        print(f"  tool_use -> {name}({args})")
        return original_execute(name, args)
    globals()["execute_tool"] = logging_execute  # simple monkeypatch for tracing

    for turn in case["turns"]:
        messages.append({"role": "user", "content": turn})
        answer = run_turn(messages)
        messages.append({"role": "assistant", "content": answer})
        print(f"  Q: {turn}\\n  A: {answer}")

    globals()["execute_tool"] = original_execute
    ok = case["expect_tools"] <= called
    print(f"  tools called: {called} | expected subset: {case['expect_tools']} | PASS={ok}\\n")

if __name__ == "__main__":
    for i, case in enumerate(TEST_CASES, 1):
        print(f"Test {i}:")
        run_case(case)`,
          pitfalls: [
            '**Only testing "happy path" single-tool questions.** Misses exactly the multi-tool coordination and memory bugs this module is about. Fix: always include at least one combined and one memory-dependent case.',
            '**Judging correctness only by whether the final answer "looks right".** The model can occasionally reach a right-looking number via the wrong tool or no tool at all (a lucky guess). Fix: check the tool trace, not just the final text.',
            '**Never deliberately testing the guardrail itself.** You only find out the cap is miscalibrated in production. Fix: include one test that forces near/at the `MAX_TOOL_CALLS` limit.',
            '**Not testing a tool failure path.** If `web_search` throws, does the agent recover gracefully? Fix: temporarily break a tool on purpose and confirm the `is_error` handling produces a sane reply.',
            '**Treating this as a one-time check instead of a rerun-able script.** Description tweaks can silently break a previously-passing case. Fix: keep `test_agent.py` and rerun it after any tool/description change.',
            '**Hardcoding "today" assumptions in test questions.** A "this Friday" test can behave differently depending on which real weekday you run it. Fix: use the injectable `as_of` from `m7-t2` for deterministic date tests.',
          ],
          tryIt:
            'Add one more deliberately adversarial test question that could plausibly trigger either `search_knowledge_base` or `web_search` (e.g. "what\'s a good time of year to visit Kundapura?") and use the result to decide whether either description needs a tighter boundary.',
          takeaway:
            'A handful of deliberately hard, multi-tool test questions with a printed tool trace — not just a glance at the final answer — is what actually proves the agent reasons correctly.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm7-p1',
      type: 'Project',
      title: 'Kundapura Sahayaka v3 — Multi-Tool Agent',
      domain: 'Agents — Full Build',
      duration: '4-5 hrs',
      description:
        'Assemble the fourth version of the running app: the RAG bot from Module 5 plus a ₹/GST calculator and a seva/festival date-lookup tool, wired as a proper tool-calling agent with conversation memory and hard guardrails. Test it against genuinely tricky multi-step questions that need retrieval AND calculation in the same answer — e.g. "what\'s the seva timing this Friday, and if the donation is ₹250 per person for 3 people, what\'s the total?" — and confirm it gets both parts right, together.',
      tools: ['LangChain', 'anthropic SDK', 'FAISS / Chroma', 'custom tools'],
      blueprint: {
        overview:
          'You bring together every earlier piece into one agent. Module 5\'s RAG bot becomes a callable `search_knowledge_base` tool instead of firing on every turn; a ₹ calculator and a seva/festival date-lookup tool sit alongside it; a web-search tool (real or stubbed) covers questions outside the local knowledge base. All four are wrapped in one tool-calling loop with conversation memory and hard guardrails (call caps, timeouts, safe tool failure), then stress-tested with questions that genuinely need two tools in the same breath.',
        functionalRequirements: [
          'Load Module 5\'s local vector store (FAISS or Chroma) and wrap it as `search_knowledge_base(query, k=3)`, called only when the model chooses to.',
          'Implement `split_bill_with_donation(total, num_people, donation_per_person=0, service_charge_pct=0)` for splitting fish-thali bills and adding seva donations, with all money rounded correctly.',
          'Implement `check_seva_date(name=None, as_of=None)` that returns the next real calendar date for a recurring or fixed seva/festival entry, using an injectable "now" for testability.',
          'Implement `web_search(query)` — a real Tavily/SerpAPI-backed call if a key is configured, or a clearly-labelled mock string otherwise — for questions outside the local knowledge base.',
          'Give Kundapura Sahayaka all four tools at once with distinct, non-overlapping descriptions so the model reliably picks the right one(s).',
          'Maintain a single growing `messages` list across the whole conversation so follow-up questions resolve using prior turns.',
          'Enforce a `MAX_TOOL_CALLS` cap, a timeout on any network-calling tool, and try/except-wrapped tool execution that returns an `is_error` tool_result on failure instead of crashing.',
          'Log every tool call (name, arguments, and result) so a test run\'s reasoning can be inspected, not just its final answer.',
        ],
        technicalImplementation: [
          'Reuse the embeddings/vector-store setup from Module 5 (`langchain` + `faiss-cpu` or `chromadb`); load the index once at startup, not per call.',
          'Define one Anthropic-SDK tool schema (`name`, `description`, `input_schema`) per tool in a single `TOOLS` list; write descriptions that explicitly name what each tool is NOT for, to avoid overlap between `search_knowledge_base` and `web_search`.',
          'Build a `DISPATCH` dict mapping tool name to Python function, and a single `execute_tool(name, args)` wrapper that all tool calls go through.',
          'Write the agentic loop: call `client.messages.create(model=..., messages=messages, tools=TOOLS)`; while `stop_reason == "tool_use"`, append the assistant turn, execute each `tool_use` block (respecting `MAX_TOOL_CALLS`), append a `tool_result` (or `is_error`) turn per call, and re-call; return the final text once `stop_reason == "end_turn"`.',
          'Do all money maths with rounding to 2 decimal places (or `decimal.Decimal` if you want to be strict) — never raw, unrounded floats in a reported ₹ total.',
          'Do all date maths against `datetime.date`, accepting an optional `as_of` override in `check_seva_date` so tests are deterministic regardless of which real day you run them.',
          'Keep any real search API key in `.env` via `python-dotenv`, with `.env` in `.gitignore`, and a clear flag/branch for the mock-search fallback.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Wire the RAG and calculator tools',
            outcome: 'search_knowledge_base and split_bill_with_donation exist as working Python functions with correct Anthropic tool schemas.',
            prompt:
              'Wrap my existing Module 5 FAISS/Chroma vector store in a `search_knowledge_base(query, k=3)` function that returns the top-k chunks with their source paths. Then write `split_bill_with_donation(total, num_people, donation_per_person=0, service_charge_pct=0)` that computes an exact, correctly-rounded ₹ total and per-person split. Write an Anthropic-SDK tool schema dict for each (name, description, input_schema), with descriptions specific enough that they would not be confused with each other. Show me a manual test call for each function using realistic Kundapura data (a fish-thali bill, a seva-related knowledge base question).',
          },
          {
            step: 2,
            label: 'Add the date-lookup and web-search tools',
            outcome: 'check_seva_date and web_search (real or stubbed) are added with descriptions that clearly do not overlap with each other or with the first two tools.',
            prompt:
              'Write `check_seva_date(name=None, as_of=None)` using a small SEVA_SCHEDULE of recurring (by weekday) and fixed (by month/day) entries, defaulting `as_of` to today but accepting an override for testing. Then write `web_search(query)` that calls a real search API if `SEARCH_API_KEY` is set in `.env`, otherwise returns a clearly-labelled mock string. Write tool schemas for both, and specifically write the descriptions for `search_knowledge_base` and `web_search` so they name mutually exclusive topics — show me both descriptions side by side and explain why a model would not confuse them.',
          },
          {
            step: 3,
            label: 'Assemble the tool-calling agent loop with memory',
            outcome: 'A single run_turn(messages) function that lets the model call any of the four tools, potentially several times, and correctly carries context across turns.',
            prompt:
              'Combine all four tools into one TOOLS list and a DISPATCH dict. Write the full agentic loop: call the Anthropic API with tools=TOOLS and the running messages list; while stop_reason is "tool_use", append the assistant turn, execute every tool_use block via the dispatcher, append the tool_result turn(s), and re-call; return the final text once stop_reason is "end_turn". Then write a small REPL-style chat loop that keeps one messages list alive across multiple user inputs. Demonstrate it resolving a two-turn conversation: "what\'s the seva timing this Friday?" followed by "and how much would that cost for 4 people at ₹250 each?" — show the actual output of both turns.',
          },
          {
            step: 4,
            label: 'Add guardrails: call cap, timeouts, safe failure',
            outcome: 'The agent loop enforces MAX_TOOL_CALLS, times out network tool calls, and returns an is_error tool_result instead of crashing on a tool exception.',
            prompt:
              'Add a MAX_TOOL_CALLS constant (start at 5) to my agent loop, tracked as a counter across executed tool_use blocks (not loop iterations), with a graceful fallback text response once the cap is hit. Add an explicit timeout to the requests call inside web_search. Wrap tool execution in try/except so any exception becomes a tool_result with is_error: true and a short error message instead of crashing the process. Then show me how to deliberately trigger each guardrail once (a forced low cap, a forced tool exception) and confirm the agent fails gracefully both times.',
          },
          {
            step: 5,
            label: 'Stress-test with multi-tool questions',
            outcome: 'A runnable test script covering five categories (pure RAG, pure calc, combined, out-of-scope, memory-dependent) with a printed tool-call trace per test, all passing.',
            prompt:
              'Write a test_agent.py script with five test cases covering: a pure knowledge-base question, a pure calculator question, a combined question needing check_seva_date AND split_bill_with_donation in one answer (use exactly: "what\'s the seva timing this Friday, and if the donation is ₹250 per person for 3 people, what\'s the total?"), an out-of-scope question that should trigger web_search, and a two-turn memory-dependent follow-up. Log every tool call\'s name and arguments as it happens, and print a pass/fail per case comparing the tools actually called against the tools expected. Run it and show me the full trace and results; if any case fails, tell me which tool description you\'d tighten and why.',
          },
        ],
        deliverable:
          'A working `agent.py` (+ `tools/` package) implementing Kundapura Sahayaka v3: four tools (knowledge-base search, ₹/GST calculator, seva/festival date lookup, web search) behind one tool-calling loop with conversation memory and guardrails (MAX_TOOL_CALLS cap, network timeouts, safe tool-failure handling), plus a `test_agent.py` that runs at least five test conversations — including the combined seva-date-plus-donation example and a memory-dependent follow-up — with a printed tool-call trace proving each one used the correct tool(s) and produced a correct final answer.',
      },
    },
  ],
  quiz: [
    {
      id: 'm7-q1',
      q: "Why turn Module 5's RAG retrieval into a callable tool instead of running it before every single turn?",
      options: [
        'Because tools always run faster than a direct function call',
        'So the model can choose to search the knowledge base only when a question actually needs it, instead of forcing an often-irrelevant lookup every turn',
        'Because forced retrieval is not supported by the Anthropic API',
        'Because tools do not require a vector store at all',
      ],
      answer: 1,
    },
    {
      id: 'm7-q2',
      q: 'After the model returns a `tool_use` block and your code executes the corresponding Python function, what must happen next in the loop?',
      options: [
        'Nothing — the API automatically knows the result',
        'Send a fresh `messages.create` call with only the tool result and drop the earlier history',
        'Append the assistant\'s tool_use turn, then send a `tool_result` block (matching the same `tool_use_id`) in the next message, then call the API again',
        'Print the result to the terminal and end the conversation',
      ],
      answer: 2,
    },
    {
      id: 'm7-q3',
      q: 'Why does a follow-up question like "and how much would that cost for 4 people?" only work if you resend the full conversation history on every API call?',
      options: [
        'Because the Anthropic API is stateless — it has no memory of previous calls unless you include them in the messages list you send',
        'Because the model caches previous answers in its weights automatically',
        'Because the calculator tool remembers previous invocations on its own',
        "Because 'that' is a special keyword the API resolves internally",
      ],
      answer: 0,
    },
    {
      id: 'm7-q4',
      q: 'What is the main purpose of a MAX_TOOL_CALLS cap in an agent loop?',
      options: [
        'To make the agent respond with shorter answers',
        'To prevent a misbehaving or ambiguous request from causing an unbounded, costly, or hanging sequence of tool calls',
        'To reduce the number of tools the agent is allowed to know about',
        'To force the model to always use exactly one tool per turn',
      ],
      answer: 1,
    },
    {
      id: 'm7-q5',
      q: 'Why should the descriptions of `search_knowledge_base` and `web_search` be written to name mutually exclusive topics?',
      options: [
        'Because the Anthropic API rejects tools with similar-sounding descriptions',
        'Because overlapping or vague descriptions are a leading cause of the model picking the wrong tool, or being inconsistent between the two',
        'Because only one search-style tool can be registered at a time',
        'Because web_search is always slower and should be actively discouraged',
      ],
      answer: 1,
    },
  ],
}
