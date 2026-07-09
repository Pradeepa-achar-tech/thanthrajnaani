// Module 6 — Agents & Tool-Calling Fundamentals
// The conceptual and hands-on foundation for giving an LLM tools: what tool/function calling
// means, the ReAct reason-act-observe loop, defining a tool schema, and building the first
// minimal tool-using loop with a standalone calculator agent. Sets up Module 7, where Kundapura
// Sahayaka itself gains a calculator, a seva/date lookup tool, and RAG-as-a-tool.

export const m6 = {
  id: 'm6',
  title: 'Agents & Tool-Calling Fundamentals',
  hours: 6,
  color: 'from-yellow-500/20 to-yellow-700/10',
  accent: 'yellow',
  description:
    'Learn what "tool calling" actually is and how to give an LLM the ability to act, not just answer. You will study the **ReAct** (reason, act, observe) pattern, learn to define a tool schema the model can call reliably, and build your first minimal tool-using loop — a standalone calculator agent that decides for itself when it needs the tool and when it can just answer. This is the mechanic Module 7 scales up into a full multi-tool Kundapura Sahayaka.',
  sections: [
    {
      id: 'm6-s1',
      title: 'Why Agents',
      topics: [
        {
          id: 'm6-t1',
          title: 'What a "tool" is to an LLM, and what function/tool calling means under the hood',
          explain:
            'A "tool" is just a function you describe to the model in plain language plus a JSON schema; "tool calling" is the model outputting structured JSON that names a tool and its arguments instead of prose, which your code then actually runs.',
          analogy:
            'Think of a temple committee coordinator on the phone with an assistant who has never seen the ledger. The coordinator cannot open the ledger themselves — but they can say "please check page 12, row for Ganesh Chaturthi seva timing, and read it back to me." The assistant (your Python code) does the looking-up and reads the answer back. The LLM is the coordinator: it cannot touch your database, your calculator, or the internet directly. A **tool** is the phone line plus a clear instruction sheet ("if I say `lookup_seva(date)`, go check the ledger") that lets the coordinator ask for exactly the right lookup, in a format the assistant can act on without guessing.',
          theory:
            'By default, an LLM can only do one thing: turn text into more text. It cannot fetch a webpage, run arithmetic reliably, query a database, or check today\'s date — it has no hands. **Tool calling** (also called **function calling**) is a protocol that gives the model a controlled way to ask *your* code to do those things on its behalf.\n\nConcretely, you send the model a list of tool definitions alongside your prompt — each one a `name`, a `description`, and an `input_schema` (JSON Schema describing the parameters). The model does not execute anything itself. Instead, when it decides a tool would help, it replies with a structured block saying "call `calculator` with `{"operation": "multiply", "a": 450, "b": 0.18}`" instead of writing prose. Your code reads that structured output, actually runs the Python function, and sends the *result* back to the model in a follow-up message so it can use it to write the final answer.\n\nSo the full loop has four actors: your prompt + tool definitions -> model decides to call a tool -> your code executes the real function -> the result goes back to the model to finish the answer. The model never runs code; it only ever *requests* that code be run, in a format precise enough that your program can parse it without ambiguity. This is why tool calling is sometimes called "structured output for actions" — it repurposes the model\'s language skill (understanding intent, extracting the right numbers) to produce something a program can act on deterministically.',
          whyItMatters:
            'Every "AI agent" you have heard of — a coding assistant that edits files, a support bot that checks order status, a research agent that searches the web — is tool calling underneath. Kundapura Sahayaka has been read-only so far (RAG lets it *read* your markdown docs); tools are what let it start *doing* things: calculating a GST amount, checking a real date, looking something up on demand instead of only from pre-loaded context. Understanding that the model only ever *requests* a call, never executes one, is also what keeps you from writing insecure agent code later — your Python function is the only thing with real permissions.',
          steps: [
            'Recall that an LLM only produces text — it has no way to run code, fetch data, or do exact math on its own.',
            'Define a "tool" as a Python function plus a name, description, and JSON Schema describing its inputs.',
            'Send the tool definitions to the model alongside the user\'s message.',
            'Understand that when useful, the model replies with a structured "call this tool with these arguments" block instead of prose.',
            'Recognise that your code — not the model — actually executes the function.',
            'See that the function\'s result is sent back to the model so it can write the final, grounded answer.',
          ],
          code: `# The mental model, before any real SDK code:
#
# 1. You describe a tool to the model (name + description + input schema)
# 2. The model, given a user message, decides: "answer directly" OR "call a tool"
# 3. If it calls a tool, it does NOT run code — it returns structured JSON like:
tool_call_from_model = {
    "name": "calculator",
    "input": {"operation": "multiply", "a": 450, "b": 0.18},
}

# 4. YOUR code executes the real function:
def calculator(operation, a, b):
    if operation == "multiply":
        return a * b
    raise ValueError(f"Unknown operation: {operation}")

result = calculator(**tool_call_from_model["input"])
print(result)  # 81.0

# 5. You send this result BACK to the model as a new message so it can
#    finish the answer in natural language ("18% GST on Rs 450 is Rs 81").`,
          pitfalls: [
            '**Assuming the model "runs" the tool itself.** It never executes code — it only outputs a structured request. Fix: always have your own code perform the actual call.',
            '**Writing a vague tool description.** "Does math" tells the model too little about when to use it. Fix: describe exactly what the tool does and when it is appropriate.',
            '**Forgetting to send the tool result back to the model.** The conversation stalls with an unanswered tool call. Fix: always complete the loop — call, execute, send result back.',
            '**Treating tool calling as "the model browsing your code".** It only ever sees the name/description/schema you give it, nothing else about your program. Fix: the schema is the *entire* interface — write it carefully.',
            '**Skipping the schema and just describing the tool in prose.** Free-text descriptions produce free-text (and unreliable) arguments. Fix: always provide a structured `input_schema`.',
            '**Expecting exact math from the model\'s own reasoning instead of the tool.** LLMs are unreliable at arithmetic; that is precisely why a calculator tool exists. Fix: route real calculations through the tool, not the model\'s head.',
          ],
          tryIt:
            'Without writing any code yet, draft in plain English the tool description and three input fields you would give the model for a `get_seva_timing(temple, date)` tool for Kundapura Sahayaka — then explain in one sentence why the model needs a `description`, not just a `name`.',
          takeaway:
            'A tool is a function you describe to the model; tool calling is the model requesting that function be run with specific arguments — your code, never the model, does the actual running.',
        },
        {
          id: 'm6-t2',
          title: 'The ReAct pattern — reason, act, observe, repeat, in plain terms',
          explain:
            '**ReAct** (Reason + Act) is the loop where the model thinks about what to do next, takes one action (often a tool call), observes the result, and repeats — instead of trying to answer everything in one shot.',
          analogy:
            'Picture someone trying to find the ferry schedule to Gangolli during monsoon season. They do not silently guess an answer — they *reason* out loud ("I should check today\'s date first, since schedules change seasonally"), *act* (look up today\'s date), *observe* the result ("it\'s July, monsoon season"), *reason* again ("now I need the monsoon ferry timetable, not the regular one"), *act* (look that up), *observe*, and only then answer. **ReAct** is exactly this back-and-forth made explicit: think a little, do a little, look at what happened, think again — rather than trying to plan the whole answer in one silent leap and hoping it is right.',
          theory:
            '**ReAct** (from the 2022 paper "ReAct: Synergizing Reasoning and Acting in Language Models") describes a loop the model follows when solving a task that needs tools:\n1. **Reason** — the model produces a short thought about what it needs to do next ("I need today\'s date before I can compute the seva timing").\n2. **Act** — it takes one concrete action, usually a single tool call.\n3. **Observe** — the result of that action (the tool\'s return value) is fed back in.\n4. **Repeat** — the model reasons again using the new information, decides whether it has enough to answer or needs another action, and loops until it can produce a final answer.\n\nThe key insight is that this interleaving is *more reliable* than asking the model to plan everything up front. A model that must commit to a full plan before seeing any real data tends to hallucinate intermediate facts ("assume the exchange rate is X"). A model that acts one step at a time, and gets to *observe real results* before deciding the next step, self-corrects: if a tool call returns an error or an unexpected value, the next "reason" step can react to that, instead of the whole plan silently going wrong.\n\nIn modern tool-calling APIs (like the Anthropic Messages API), you do not have to hand-build the "Reason:" / "Act:" / "Observe:" text scaffolding yourself — the *loop structure* is what matters, and you implement it as a plain `while` loop in your own code: call the model, check if it asked for a tool, run the tool if so, feed the result back as a new message, and loop until the model returns a plain text answer with no more tool calls. The model\'s own internal "reasoning" about which tool to pick happens inside its response; your job is just to keep the loop going until it stops asking for tools.',
          whyItMatters:
            'Every agent framework you will ever touch (LangChain agents, the Anthropic tool-use loop, AutoGPT-style agents) is some flavor of ReAct underneath a nicer API. Understanding the raw reason-act-observe cycle means you can debug *any* of them by asking the same three questions: what did it decide to do, what happened when it did that, and what did it do with the result? For Kundapura Sahayaka, this is exactly the shape Module 7\'s multi-tool agent will need: reason about whether a question needs the calculator, the seva-date lookup, or the RAG tool, act by calling one, observe the result, and possibly chain to a second tool before answering.',
          steps: [
            'Take a multi-step question (e.g. "What\'s 18% GST on today\'s temple offering total?").',
            'Reason: identify what is needed first — is "today\'s date" or "the total amount" missing?',
            'Act: call one tool to get the first missing piece.',
            'Observe: read the tool\'s actual return value, not an assumption.',
            'Reason again: decide if another tool call is needed, or if there is now enough to answer.',
            'Repeat acting and observing until the model can produce a final plain-text answer with no further tool calls.',
          ],
          code: `# A ReAct loop is just: keep looping while the model keeps asking for tools.
# Pseudocode shape (the real SDK version comes in the next section):

conversation = [{"role": "user", "content": "What is 18% GST on Rs 450?"}]

while True:
    response = call_model(conversation, tools=[calculator_tool])

    if response.stops_because_of_tool_call:
        # REASON already happened inside the model's response.
        # ACT: run the real function it asked for.
        tool_name, tool_input = response.tool_call
        result = run_tool(tool_name, tool_input)

        # OBSERVE: feed the real result back into the conversation.
        conversation.append({"role": "assistant", "content": response.raw})
        conversation.append({"role": "tool_result", "content": result})
        continue  # loop again: model reasons over the new observation

    # No more tool calls -> the model produced a final answer. Stop.
    print(response.text)
    break`,
          pitfalls: [
            '**Trying to get the answer in a single model call for a multi-step question.** Some tasks genuinely need more than one lookup. Fix: let the loop run more than one iteration.',
            '**Forgetting to "observe" — not feeding the real tool result back.** The model then reasons on stale or imagined data. Fix: always append the actual return value before looping.',
            '**Looping forever with no exit condition.** A bug or a confused model can call tools indefinitely. Fix: cap the loop with a max number of iterations (e.g. 5-8) and fail gracefully past that.',
            '**Confusing ReAct with a rigid fixed pipeline.** ReAct is adaptive — the number and order of steps depends on what is observed. Fix: do not hardcode "always call tool A then tool B"; let the model decide per question.',
            '**Assuming the model "sees" the tool run.** It only sees whatever text/JSON you feed back as the observation. Fix: make sure the tool result you send back is complete and correctly formatted.',
            '**Skipping the reasoning step mentally and just chaining tool calls blindly.** You lose the ability to debug *why* a wrong tool was chosen. Fix: log the model\'s stated reasoning/thought text alongside each action.',
          ],
          tryIt:
            'Walk through, on paper, a ReAct trace for the question "Is Kollur reachable by ferry this week?" — write one line each for Reason, Act, Observe, Reason, Act, Observe, final Answer, imagining plausible tool results at each Observe step.',
          takeaway:
            'ReAct is reason, act, observe, repeat — the model thinks a step, takes one action, sees the real result, and only then decides the next step, instead of planning blindly in one shot.',
        },
        {
          id: 'm6-t3',
          title: 'Defining a tool schema (name, description, input parameters) so the model calls it correctly',
          explain:
            'A tool schema has three parts — a `name` the model refers to, a `description` telling it when and why to use the tool, and an `input_schema` (JSON Schema) precisely defining each parameter — and getting all three clear is what makes the model call it correctly and consistently.',
          analogy:
            'Think of a tool schema like a well-written form at a government office counter: the form\'s title tells you what it is for ("Ferry Timing Enquiry"), a note at the top tells you when to use this form versus a different one ("use this only for Kollur/Gangolli routes, not bus enquiries"), and each blank field is labeled with exactly what kind of answer goes there ("Date: DD-MM-YYYY", "Route: dropdown of two options"). A vague form with an unclear title and unlabeled blanks gets filled in wrong; a precise one gets filled in correctly almost every time. The model treats your tool schema exactly like that form — its quality directly determines whether it is used correctly.',
          theory:
            'Every tool you give an LLM needs three parts, and all three matter:\n\n**1. `name`** — a short, unambiguous identifier the model will reference exactly, e.g. `calculator`, `get_seva_timing`. Use `snake_case`, and make it specific enough not to collide in meaning with another tool.\n\n**2. `description`** — plain-English prose telling the model *what the tool does* and, just as importantly, *when to use it*. This is the single highest-leverage piece of the schema: a model deciding between three tools relies almost entirely on the description text to pick correctly. Good descriptions state the purpose, the expected inputs in words, and any caveats ("only handles the four basic arithmetic operations; does not do algebra").\n\n**3. `input_schema`** — a JSON Schema object (the same JSON Schema standard used elsewhere in software) that defines each parameter\'s name, type, and description, and marks which are `required`. For a calculator: `operation` (a string, ideally constrained with `"enum": ["add", "subtract", "multiply", "divide", "percentage"]`), `a` (number), `b` (number). Constraining `operation` to an enum is important — it stops the model from inventing an operation name you did not implement.\n\nWith the Anthropic Python SDK, this looks like a plain Python dict passed in the `tools` argument of `client.messages.create(...)`:\n```python\ncalculator_tool = {\n    "name": "calculator",\n    "description": "Performs basic arithmetic (add, subtract, multiply, divide, percentage) on two numbers. Use this whenever the user asks for a numeric calculation, instead of computing it yourself.",\n    "input_schema": {\n        "type": "object",\n        "properties": {\n            "operation": {\n                "type": "string",\n                "enum": ["add", "subtract", "multiply", "divide", "percentage"],\n            },\n            "a": {"type": "number", "description": "First operand"},\n            "b": {"type": "number", "description": "Second operand (the percentage rate for \'percentage\')"},\n        },\n        "required": ["operation", "a", "b"],\n    },\n}\n```\nWrite descriptions the way you would explain the tool to a competent colleague who has never seen your codebase — because that, functionally, is what the model is.',
          whyItMatters:
            'A weak schema is the #1 cause of "the agent keeps calling the wrong tool" or "the agent passes malformed arguments" bugs — problems that look like model failures but are actually authoring failures. Kundapura Sahayaka will soon have several tools (calculator, seva/date lookup, RAG search); the quality of each one\'s `description` is what lets the model correctly route "what\'s the GST on ₹450" to the calculator and "when is Ganesh Chaturthi seva" to the date/seva tool, instead of confusing the two.',
          steps: [
            'Pick a clear, specific `name` in snake_case for the tool.',
            'Write a `description` stating what the tool does and, explicitly, when the model should use it.',
            'List every input parameter in `input_schema.properties` with its `type` and a short `description`.',
            'Constrain any fixed-choice parameter (like `operation`) with a JSON Schema `enum`.',
            'Mark every parameter the function truly cannot run without as `required`.',
            'Re-read the schema as if you were the model, with zero other context, and ask whether you could call it correctly.',
          ],
          code: `calculator_tool = {
    "name": "calculator",
    "description": (
        "Performs basic arithmetic (add, subtract, multiply, divide, percentage) "
        "on two numbers. Use this whenever the user's question needs an exact "
        "numeric result (totals, discounts, GST, splitting a bill) instead of "
        "estimating the answer yourself."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "operation": {
                "type": "string",
                "enum": ["add", "subtract", "multiply", "divide", "percentage"],
                "description": "Which arithmetic operation to perform.",
            },
            "a": {"type": "number", "description": "First operand."},
            "b": {
                "type": "number",
                "description": (
                    "Second operand. For 'percentage', this is the rate "
                    "(e.g. 18 for 18%), and 'a' is the base amount."
                ),
            },
        },
        "required": ["operation", "a", "b"],
    },
}`,
          pitfalls: [
            '**A one-word description like "math tool".** The model cannot judge when to use it versus another tool. Fix: describe purpose and usage conditions in a full sentence or two.',
            '**Leaving `operation` as a free-text string with no `enum`.** The model may invent `"modulo"` or `"square"`, which your function does not handle. Fix: constrain fixed choices with `enum`.',
            '**Forgetting `required`.** The model may omit a parameter your function needs, causing a runtime `TypeError`. Fix: list every non-optional field under `required`.',
            '**Naming two tools ambiguously similar things.** The model cannot reliably pick between `lookup` and `search`. Fix: give each tool a distinct, purpose-specific name.',
            '**Describing *how* the function is implemented instead of *what* it does for the user.** Implementation detail does not help the model decide when to call it. Fix: describe the tool\'s effect/purpose, not its internals.',
            '**Testing the schema only with obvious questions.** Edge cases (ambiguous or borderline requests) reveal weak descriptions fastest. Fix: try a few edge-case prompts and see what the model chooses.',
          ],
          tryIt:
            'Write a complete `input_schema` dict for a `get_seva_timing(temple, date)` tool, including an `enum` for a small fixed list of temple names and a `description` explaining exactly when the model should call it versus answer from memory.',
          takeaway:
            'A tool schema is a contract in three parts — name, description, input_schema — and the description is the single biggest lever over whether the model calls the right tool at the right time.',
        },
        {
          id: 'm6-t4',
          title: 'When you need an agent vs when a plain chain (like Module 5\'s RAG bot) is enough',
          explain:
            'Reach for tool calling/agents only when the task needs an action the model cannot do from text alone (exact math, live data, changing state); if the answer is fully containable in retrieved context, Module 5\'s plain retrieve-then-answer RAG chain is simpler, cheaper, and more predictable.',
          analogy:
            'If a customer at a fish market asks "what\'s in the neer dosa recipe you have on the counter card," the vendor just reads the card — no calculation, no lookup elsewhere, nothing changes. That is a plain chain: fetch the relevant card, read it, answer. But if the customer asks "how much do six kilos of kane fish cost at today\'s rate, with the weekend markup applied," the vendor must actually *calculate*, not just recite a card. That is what a tool is for. Reaching for a full agent when a card-reading answer would do is like hiring an accountant to read a menu aloud — needless complexity, more chances for something to go wrong, and a slower answer.',
          theory:
            'Module 5 built a RAG chain: embed the question, retrieve the closest chunks from your local knowledge base, stuff them into the prompt, ask the model to answer *using only that context*. This is a **fixed pipeline** — always exactly one retrieve step, then one generate step, in that order, every time. It is simple, fast, cheap (one embedding call + one generation call), and highly predictable, because the flow never changes shape.\n\nAn **agent** (tool-calling loop) is needed when the task requires the model to take a *variable* number and *variable kind* of actions depending on the question — sometimes zero tool calls, sometimes one, sometimes several, and the model itself decides which. You need this extra machinery specifically when:\n- The task requires an **action with a real-world effect or exact computation** the model cannot reliably do in its "head" — arithmetic, looking up *today\'s* date, querying a live API, writing a file.\n- The **right source of information depends on the question** — sometimes RAG, sometimes a calculator, sometimes both in sequence — so a single fixed pipeline cannot cover every case.\n- The task may need **multiple steps that depend on each other\'s results** ("first find today\'s date, then use it to find the matching festival, then compute days remaining").\n\nIf none of those apply — if the answer is always "retrieve relevant text, then generate from it" — stick with the plain chain. It is a strict engineering principle: **use the simplest architecture that solves the problem.** Agents add real costs: more API calls (slower, more expensive), more places to fail (a bad tool call, an infinite loop, a malformed argument), and more to test and debug. Kundapura Sahayaka needs an agent starting in Module 6/7 precisely because "what\'s 18% GST on this offering" and "what\'s today\'s seva timing" are things the RAG chain genuinely cannot do — they need computation and live/structured lookups, not just better retrieval.',
          whyItMatters:
            'This is a real architecture decision you will face on every GenAI project, and picking wrong in either direction costs you: over-using RAG for something that needs computation gives confidently wrong numbers (hallucinated arithmetic); over-using an agent for something a plain chain could do adds latency, cost, and fragility for no benefit. Being able to say "this needs a tool because X" or "a plain chain is enough because Y" is a mark of a GenAI engineer who understands the trade-offs, not just the APIs.',
          steps: [
            'Ask: does the answer only require *text already available* in a retrievable knowledge base? If yes, a plain chain likely suffices.',
            'Ask: does the answer require exact computation, live/current data, or an action with side effects? If yes, at least one tool is needed.',
            'Ask: does the number and order of steps vary by question? If yes, you need the model to decide dynamically — that is agentic tool calling, not a fixed pipeline.',
            'Weigh the cost: an agent means more API round-trips and more failure points than a single retrieve-then-generate call.',
            'Default to the simplest architecture that correctly solves the task in front of you.',
            'Recognise that RAG and tool calling are not rivals — Module 7 will even wrap RAG *as one of several tools* inside an agent.',
          ],
          code: `# Rule of thumb, as a tiny decision helper (illustrative, not a real classifier):

def needs_agent(question_features):
    """
    question_features: dict like
      {"needs_exact_math": bool, "needs_live_data": bool,
       "answerable_from_docs_alone": bool, "steps_vary": bool}
    """
    if question_features["answerable_from_docs_alone"] and not (
        question_features["needs_exact_math"] or question_features["needs_live_data"]
    ):
        return False  # Module 5's plain RAG chain is enough
    return True  # needs a tool-calling agent

# "What's the recipe for neer dosa?"          -> plain RAG chain (False)
# "What's 18% GST on Rs 450?"                  -> agent, calculator tool (True)
# "Is today a seva day at the temple?"         -> agent, date/lookup tool (True)
# "Summarize the ferry notes for monsoon."     -> plain RAG chain (False)`,
          pitfalls: [
            '**Reaching for an agent "because it sounds more advanced."** It adds cost, latency, and failure modes with no benefit if a plain chain answers correctly. Fix: default to the simplest architecture that works.',
            '**Asking a plain RAG chain to do arithmetic found nowhere in the docs.** The model will guess and often be wrong. Fix: route computation through a calculator tool instead.',
            '**Building one giant agent for a task that never actually branches.** If the steps never vary, you have built unnecessary complexity. Fix: a fixed pipeline (chain) is fine when the shape never changes.',
            '**Assuming RAG and tools are mutually exclusive.** They compose — RAG search can itself be exposed as a tool inside an agent (as Module 7 will show). Fix: think of RAG as one possible tool, not a rival architecture.',
            '**Ignoring the latency/cost trade-off.** Every extra tool-call round-trip is another full model call. Fix: only add a tool-calling loop when the task genuinely needs it.',
            '**Not testing whether the plain chain already handles the case.** Sometimes better retrieval (Module 5 techniques) fixes what looks like an "agent-needed" problem. Fix: try improving retrieval before reaching for a tool.',
          ],
          tryIt:
            'List five real questions a Kundapura Sahayaka user might ask, and for each one write "plain RAG chain" or "needs an agent/tool" plus a one-line reason — include at least one of each kind.',
          takeaway:
            'Use Module 5\'s plain retrieve-then-generate chain when the answer lives entirely in retrievable text; reach for a tool-calling agent only when the task needs exact computation, live data, or a variable number of dependent steps.',
        },
      ],
    },
    {
      id: 'm6-s2',
      title: 'Your First Tool-Using LLM',
      topics: [
        {
          id: 'm6-t5',
          title: 'Writing a simple calculator tool as a Python function and wiring it to the model\'s tool-use API',
          explain:
            'Write the calculator as an ordinary Python function, describe it with the schema from the previous topic, pass that schema in the `tools` argument of `client.messages.create(...)`, and dispatch the model\'s tool-call by name to the real function.',
          analogy:
            'Wiring a tool to the model is like installing a new extension line at the temple office: you write the actual worker\'s job description (the schema) and post it on the office directory, so when a call comes in asking for "extension: calculator," the operator (your code) knows exactly which desk (Python function) to route it to. The worker at that desk (the function) does the real work; the directory entry is just the addressable name and description that let the request find them.',
          theory:
            'Turning a schema into a *working* tool has two halves that must stay in sync: the **schema** (what you told the model exists) and the **implementation** (the real Python function that runs). They are connected only by the `name` string — the model returns `"name": "calculator"` in its tool-call response, and your code is responsible for matching that string to the actual function and calling it.\n\nWith the Anthropic Python SDK, the flow is:\n1. Define `calculator(operation, a, b)` — a plain function, no special decorators needed.\n2. Define the `calculator_tool` schema dict from the previous topic.\n3. Call `client.messages.create(model=..., tools=[calculator_tool], messages=[...])`.\n4. Inspect `response.stop_reason` — if it is `"tool_use"`, the model wants to call a tool. Find the tool-use content block in `response.content` (it has `.name` and `.input`).\n5. Dispatch: if `block.name == "calculator"`, call `calculator(**block.input)`.\n6. Send the result back as a new message with role `"user"` containing a `tool_result` content block referencing the tool call\'s `id`, then call `messages.create` again so the model can produce its final text answer.\n\nA small but important detail: `block.input` is already parsed JSON (a Python dict) from the SDK — you do not need to parse a JSON string yourself. Also validate the operation defensively even though the schema constrains it with an `enum`, because defense-in-depth matters once real user input is involved.',
          whyItMatters:
            'This is the actual mechanical skill of "building an agent" — everything else in this module and the next is a variation on this exact wiring. Getting comfortable with `tools=[...]`, `stop_reason == "tool_use"`, reading `block.name`/`block.input`, and sending a `tool_result` back is the reusable pattern you will use for every tool Kundapura Sahayaka ever gets, including the seva-lookup and RAG-as-tool in Module 7.',
          steps: [
            'Write `calculator(operation, a, b)` as a plain Python function covering add/subtract/multiply/divide/percentage.',
            'Define the `calculator_tool` schema dict (name, description, input_schema).',
            'Call `client.messages.create(model=..., tools=[calculator_tool], messages=[{"role": "user", "content": question}])`.',
            'Check `response.stop_reason == "tool_use"` and find the tool-use block in `response.content`.',
            'Dispatch by `block.name` to call the real `calculator(**block.input)` function.',
            'Send a follow-up message with a `tool_result` block containing the function\'s output, and call the API again for the final answer.',
          ],
          code: `import os
from anthropic import Anthropic

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def calculator(operation: str, a: float, b: float) -> float:
    if operation == "add":
        return a + b
    if operation == "subtract":
        return a - b
    if operation == "multiply":
        return a * b
    if operation == "divide":
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b
    if operation == "percentage":
        return a * (b / 100)
    raise ValueError(f"Unknown operation: {operation}")

calculator_tool = {
    "name": "calculator",
    "description": (
        "Performs basic arithmetic (add, subtract, multiply, divide, percentage) "
        "on two numbers. Use this for any question needing an exact numeric result."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "operation": {"type": "string", "enum": ["add", "subtract", "multiply", "divide", "percentage"]},
            "a": {"type": "number"},
            "b": {"type": "number"},
        },
        "required": ["operation", "a", "b"],
    },
}

messages = [{"role": "user", "content": "What is 18% GST on Rs 450?"}]

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    tools=[calculator_tool],
    messages=messages,
)

if response.stop_reason == "tool_use":
    tool_block = next(b for b in response.content if b.type == "tool_use")
    result = calculator(**tool_block.input)  # dispatch by name in the next topic

    messages.append({"role": "assistant", "content": response.content})
    messages.append({
        "role": "user",
        "content": [{"type": "tool_result", "tool_use_id": tool_block.id, "content": str(result)}],
    })

    final = client.messages.create(model="claude-sonnet-4-5", max_tokens=1024, tools=[calculator_tool], messages=messages)
    print(final.content[0].text)  # "18% GST on Rs 450 is Rs 81."`,
          pitfalls: [
            '**Forgetting `max_tokens`.** The Anthropic Messages API requires it on every `create` call. Fix: always pass a `max_tokens` value.',
            '**Assuming `response.content[0]` is always the tool call.** A response can contain text blocks alongside a tool-use block. Fix: filter `response.content` for `block.type == "tool_use"`.',
            '**Manually JSON-parsing `block.input`.** The SDK already gives you a parsed dict. Fix: use `block.input` directly as kwargs.',
            '**Losing the original assistant message before sending the tool result.** The API needs the full turn history to stay coherent. Fix: append the assistant\'s tool-use message before appending the tool_result.',
            '**Mismatching `tool_use_id` when sending the result back.** The model cannot match the result to its request. Fix: always echo `tool_block.id` in the `tool_result`\'s `tool_use_id`.',
            '**Letting `calculator` divide by zero unguarded.** A raw `ZeroDivisionError` crashes the whole script. Fix: raise a clear `ValueError` and handle it (next topic covers surfacing it to the model).',
          ],
          tryIt:
            'Run the code above with three different questions — one clearly needing the calculator ("what\'s 15% of 2000"), one clearly not ("what does GST stand for"), and one ambiguous one — and note in a comment what `response.stop_reason` was each time.',
          takeaway:
            'Wiring a tool is matching a schema\'s `name` to a real Python function: pass the schema in `tools=[...]`, detect `stop_reason == "tool_use"`, dispatch by `block.name`, run the function, and send the result back as a `tool_result`.',
        },
        {
          id: 'm6-t6',
          title: 'Letting the model decide when to call the tool vs answer directly — the request/response loop',
          explain:
            'The model itself decides, per message, whether to answer in plain text or request a tool call — your job is to structure the request/response loop so both outcomes are handled, not to pre-decide which one happens.',
          analogy:
            'A knowledgeable shopkeeper answers "what\'s neer dosa made of?" instantly from memory, but pulls out the calculator for "what\'s the total for 6kg of fish at ₹280/kg plus 5% market fee?" — nobody tells them which questions need the calculator; they judge it themselves, every time, based on the question. Your code\'s job is not to guess in advance which kind of question is coming; it is to always offer the calculator, and gracefully handle either the shopkeeper answering straight away or reaching for it first.',
          theory:
            'A common beginner mistake is trying to *pre-classify* the user\'s question ("if it contains a number, call the calculator") before even talking to the model. That defeats the point of tool calling: the model itself is capable of judging relevance, and it does this using the tool `description` you wrote plus the actual question, every single time you call it — you always offer the same `tools` list, and the model decides per-request whether to use one.\n\nConcretely, every response from `messages.create` has a `stop_reason`. The two you care about here:\n- `"end_turn"` — the model produced a plain text answer; no tool was needed. Just read `response.content[0].text` and you are done — no loop required.\n- `"tool_use"` — the model wants to call one (or more) tools before it can answer. You must execute the tool(s), send the result(s) back, and call the API again.\n\nYour code must handle *both* branches every time, because you cannot know in advance which one a given user message will produce — "What is GST?" will almost always come back as `end_turn` (the model already knows this), while "What\'s 18% GST on ₹450?" will almost always come back as `tool_use` (it needs the exact multiplication). The correct general shape is therefore a small loop that keeps calling the model, checking `stop_reason`, executing any requested tool, and appending the result — until it finally sees `end_turn` and can print the answer. This is precisely the ReAct loop from earlier, now expressed as real control flow around one API.',
          whyItMatters:
            'This is the difference between a script that merely "calls an LLM with a tool bolted on" and a genuine agent: the routing decision belongs to the model, not to your `if` statements. Getting this right means Kundapura Sahayaka will correctly answer "what is GST?" instantly without wasting a tool round-trip, while still reliably reaching for the calculator on "18% GST on ₹450" — without you ever writing a single keyword-matching rule to distinguish the two.',
          steps: [
            'Always pass the same `tools=[calculator_tool]` list regardless of what the question looks like.',
            'After each `messages.create` call, check `response.stop_reason`.',
            'If `"end_turn"`, read and print the plain text answer — no further action needed.',
            'If `"tool_use"`, execute the requested tool and append both the assistant\'s tool-use message and your `tool_result` to the conversation.',
            'Call `messages.create` again with the updated conversation.',
            'Repeat until `stop_reason` is `"end_turn"`.',
          ],
          code: `def ask(question: str) -> str:
    messages = [{"role": "user", "content": question}]

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            tools=[calculator_tool],
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            # Model judged no tool was needed -- answered directly.
            return next(b.text for b in response.content if b.type == "text")

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            tool_block = next(b for b in response.content if b.type == "tool_use")
            result = calculator(**tool_block.input)
            messages.append({
                "role": "user",
                "content": [{"type": "tool_result", "tool_use_id": tool_block.id, "content": str(result)}],
            })
            continue  # loop: let the model use the observation

        raise RuntimeError(f"Unhandled stop_reason: {response.stop_reason}")

print(ask("What does GST stand for?"))           # answers directly, no tool call
print(ask("What is 18% GST on Rs 450?"))         # calls calculator, then answers`,
          pitfalls: [
            '**Pre-filtering questions with keyword rules ("if \'%\' in question: force a tool call").** This fights the model instead of trusting its judgment, and breaks on phrasing you did not anticipate. Fix: always offer the tool and let `stop_reason` decide.',
            '**Only handling the `tool_use` branch and assuming every question needs one.** Simple questions then get an unnecessary, slower tool round-trip — or worse, code that crashes finding no tool_use block. Fix: always check `stop_reason` and handle `end_turn` too.',
            '**Only handling `end_turn` and ignoring `tool_use`.** Any question needing the calculator returns no readable answer at all. Fix: implement the full loop, not just the direct-answer path.',
            '**Assuming `stop_reason` is consistent for a question if you rephrase it.** Small wording changes can shift the model\'s judgment. Fix: design your loop to handle either outcome robustly every time, not just for your test phrasing.',
            '**Never terminating the loop.** If your dispatch logic has a bug, the model may keep requesting the same tool. Fix: add a max iteration count as a safety net (covered in the next topic).',
            '**Hardcoding one tool call and not looping back to the model.** You print the raw number instead of the model\'s composed natural-language answer. Fix: always send the result back and let the model produce the final response.',
          ],
          tryIt:
            'Call your `ask()` function with five questions of mixed difficulty (e.g. "what is GST", "18% GST on 450", "what\'s 200 divided by 8", "explain neer dosa", "what\'s 15% of 15% of 1000") and log the `stop_reason` sequence you observed for each.',
          takeaway:
            'Always offer the same tools and let `stop_reason` (`end_turn` vs `tool_use`) tell you what happened — the model decides per question, your loop just needs to correctly handle either outcome.',
        },
        {
          id: 'm6-t7',
          title: 'Handling tool errors gracefully and supporting multi-step tool use (call, get result, call again)',
          explain:
            'Catch exceptions inside your tool dispatch and send the error back to the model as a normal (marked-as-error) tool result instead of crashing, and let your loop naturally support the model calling the tool more than once in a row for a multi-step calculation.',
          analogy:
            'If a customer asks the shopkeeper to divide something by zero, a good shopkeeper does not collapse on the spot — they say "that doesn\'t work, can you check the numbers?" and the conversation continues. And if a bill needs three separate additions before the grand total, the shopkeeper does not refuse after the first sum — they keep using the abacus, one operation at a time, until the full total is ready. Your agent loop needs both instincts: survive a bad tool call by reporting the problem back, and keep looping through as many tool calls as the question actually needs.',
          theory:
            'Two robustness concerns come up as soon as your calculator handles real (imperfect) input:\n\n**1. Tool errors.** Your `calculator` function can raise (division by zero, an unknown operation slipping past the schema, a non-numeric input from a upstream bug). If that exception propagates unhandled, your whole script crashes — a poor outcome for what should be a recoverable situation. Instead, wrap the dispatch call in a `try/except`, and on failure, send a `tool_result` back to the model with `"is_error": True` and a short message describing what went wrong. The model can then react intelligently — apologize, ask a clarifying question, or try a corrected tool call — exactly like a human would recover from a typo, instead of the program dying.\n\n**2. Multi-step tool use.** A question like "what\'s 18% GST on Rs 450, then split that three ways" may need the calculator called *twice* in sequence — first the percentage, then the division of the result — with the model reasoning between the two calls. Your loop from the previous topic already supports this *for free* as long as you `continue` back to another `messages.create` call after every tool result instead of assuming one call is the end. The model will simply request a second `tool_use` in its next response if it needs one, using the *previous* tool\'s real result (not a guess) as an input to the next call — this is ReAct\'s reason-act-observe cycle repeating naturally.\n\nThe combination matters: without error handling, one bad call kills a multi-step chain permanently; without proper looping, even error-free multi-step chains never get past the first call.',
          whyItMatters:
            'Real users type ambiguous or malformed things ("divide 10 by nothing", "what\'s 18% of GST" without a base amount) and real tasks are rarely exactly one calculation. An agent that crashes on the first bad input or that can only ever make one tool call is not production-usable. This is exactly the robustness Kundapura Sahayaka will need once it has multiple tools in Module 7 that might need chaining (e.g. look up a date, then compute days remaining) and might individually fail (a lookup finds nothing).',
          steps: [
            'Wrap the real tool dispatch call in a `try/except`.',
            'On success, send back a normal `tool_result` with the value as `content`.',
            'On failure, send back a `tool_result` with `"is_error": True` and a short human-readable message instead of crashing.',
            'Keep the loop\'s `continue` after every tool result, whether success or error, so the model gets a chance to react.',
            'Do not assume one tool call ends the task — let the model request a second (or third) tool call if the next response has `stop_reason == "tool_use"` again.',
            'Add a max-iteration safety cap so a confused loop cannot run forever.',
          ],
          code: `def ask(question: str, max_steps: int = 6) -> str:
    messages = [{"role": "user", "content": question}]

    for _ in range(max_steps):
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            tools=[calculator_tool],
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            return next(b.text for b in response.content if b.type == "text")

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            tool_block = next(b for b in response.content if b.type == "tool_use")

            try:
                result = calculator(**tool_block.input)
                tool_result_content = str(result)
                is_error = False
            except Exception as exc:  # e.g. divide by zero, bad operation
                tool_result_content = f"Tool error: {exc}"
                is_error = True

            messages.append({
                "role": "user",
                "content": [{
                    "type": "tool_result",
                    "tool_use_id": tool_block.id,
                    "content": tool_result_content,
                    "is_error": is_error,
                }],
            })
            continue  # may loop again if the model needs another tool call

    return "I couldn't finish that calculation after several steps -- please rephrase."

# Multi-step: the model may call the tool twice in a row across two loop iterations.
print(ask("What is 18% GST on Rs 450, then split that three ways?"))
# Step 1: calculator(percentage, 450, 18) -> 81
# Step 2: calculator(divide, 81, 3) -> 27
# Final: "18% GST on Rs 450 is Rs 81, split three ways that's Rs 27 each."`,
          pitfalls: [
            '**Letting a raised exception propagate out of the loop.** One bad calculation (divide by zero) crashes the entire agent. Fix: always wrap the dispatch in `try/except`.',
            '**Not marking error results with `is_error: True`.** The model may treat a failure message as a valid numeric answer. Fix: always set the `is_error` flag so the model knows to react differently.',
            '**Breaking the loop after the first tool call, assuming that is always the last one.** Multi-step questions get cut off with an incomplete answer. Fix: keep looping until `stop_reason == "end_turn"`.',
            '**No maximum iteration cap.** A malformed schema or a model edge case could loop indefinitely, burning API calls. Fix: cap iterations (e.g. `max_steps=6`) and return a graceful fallback message.',
            '**Swallowing the error silently and sending back an empty result.** The model has nothing to react to and may hallucinate a number anyway. Fix: send a clear, specific error description as the tool_result content.',
            '**Returning the raw tool error to the end user verbatim.** Stack traces are not user-friendly. Fix: let the model turn the error into a natural, helpful sentence via the normal loop.',
          ],
          tryIt:
            'Ask your agent "what is 10 divided by 0?" and confirm it does not crash — check that the model responds with a sensible sentence about the invalid operation instead of a Python traceback. Then ask a genuinely two-step question and confirm two separate tool calls happen before the final answer.',
          takeaway:
            'Wrap tool execution in try/except and report failures back as `is_error` tool_results instead of crashing, and keep the loop going past a single tool call so genuinely multi-step questions get fully resolved.',
        },
        {
          id: 'm6-t8',
          title: 'Debugging an agent loop — printing what the model "thought" and which tool it chose, and why',
          explain:
            'Add visibility into every step of the loop — the model\'s own reasoning text if present, which tool it picked, what arguments it sent, and what came back — so when the agent misbehaves you can see exactly where, instead of guessing from the final answer alone.',
          analogy:
            'A driving instructor watching a learner does not just check whether the car ended up parked correctly — they watch every mirror-check, every signal, every turn of the wheel along the way, because that is where the real mistakes (or good decisions) happen. Debugging an agent the same way means watching every "reason -> act -> observe" step as it happens, not just judging the final printed answer and hoping it was right for the right reasons.',
          theory:
            'A tool-calling loop can produce a *correct final answer for the wrong reason*, or an *incorrect answer that looks plausible*, and neither is visible if you only print the final text. Debugging an agent means logging each step of the loop as it runs:\n\n- **What the model said before/around the tool call.** Sometimes a text block accompanies a `tool_use` block in the same response (the model "thinking out loud" or explaining its plan) — print any `type == "text"` blocks alongside the `tool_use` block, not just the final answer.\n- **Which tool it picked and with what arguments.** Print `tool_block.name` and `tool_block.input` every time, before you execute it. This immediately reveals schema problems (wrong operation chosen, wrong argument order/values) separately from execution problems.\n- **What your function actually returned (or the error raised).** Print the real result you are about to send back, so you can see if a computation bug — not a model bug — caused a wrong final answer.\n- **The `stop_reason` at every iteration.** This shows you the loop\'s shape: did it need one tool call or three? Did it end on `end_turn` as expected, or hit your safety cap?\n\nA simple, effective technique is a `verbose=True` flag on your `ask()` function that prints a labeled line at each of these points. This is not throwaway debug code to delete later — a lightweight version of this logging is exactly what production agent systems keep permanently (often called a "trace" or "transcript"), because "why did the agent do that?" is a question you will need to answer for the lifetime of the system, not just while building it.',
          whyItMatters:
            'When an agent gives a wrong answer, the bug is in exactly one of three places — a bad tool choice, bad arguments, or a bad function result — and you cannot tell which without visibility into the loop. This debugging habit is what will let you diagnose Module 7\'s multi-tool Kundapura Sahayaka when it picks the RAG tool instead of the calculator, or passes the wrong date format to a lookup tool — the same technique scales directly from one tool to many.',
          steps: [
            'Add a `verbose` parameter to your `ask()` function.',
            'When verbose, print any text blocks in the response alongside a tool_use block (the model\'s visible reasoning, if any).',
            'Print the chosen tool\'s `name` and `input` before executing it.',
            'Print the real result (or error) your function produced, before sending it back.',
            'Print the `stop_reason` at each loop iteration to see the loop\'s overall shape.',
            'Use this trace to classify a wrong answer as a tool-choice bug, an argument bug, or a computation bug.',
          ],
          code: `def ask(question: str, max_steps: int = 6, verbose: bool = False) -> str:
    messages = [{"role": "user", "content": question}]

    for step in range(1, max_steps + 1):
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            tools=[calculator_tool],
            messages=messages,
        )

        if verbose:
            print(f"--- step {step}: stop_reason={response.stop_reason} ---")
            for block in response.content:
                if block.type == "text" and block.text.strip():
                    print(f"  [model text] {block.text.strip()}")

        if response.stop_reason == "end_turn":
            return next(b.text for b in response.content if b.type == "text")

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            tool_block = next(b for b in response.content if b.type == "tool_use")

            if verbose:
                print(f"  [tool chosen] {tool_block.name}({tool_block.input})")

            try:
                result = calculator(**tool_block.input)
                content, is_error = str(result), False
            except Exception as exc:
                content, is_error = f"Tool error: {exc}", True

            if verbose:
                print(f"  [tool result] {content}{' (ERROR)' if is_error else ''}")

            messages.append({
                "role": "user",
                "content": [{"type": "tool_result", "tool_use_id": tool_block.id, "content": content, "is_error": is_error}],
            })
            continue

    return "I couldn't finish that after several steps."

ask("What's 18% GST on Rs 450, then split that three ways?", verbose=True)
# --- step 1: stop_reason=tool_use ---
#   [tool chosen] calculator({'operation': 'percentage', 'a': 450, 'b': 18})
#   [tool result] 81.0
# --- step 2: stop_reason=tool_use ---
#   [tool chosen] calculator({'operation': 'divide', 'a': 81.0, 'b': 3})
#   [tool result] 27.0
# --- step 3: stop_reason=end_turn ---`,
          pitfalls: [
            '**Only ever printing the final answer.** You cannot tell a wrong-tool-choice bug from a wrong-argument bug from a computation bug. Fix: log every step of the loop, not just the end.',
            '**Removing all debug logging once things "seem to work."** Silent regressions later become invisible. Fix: keep a `verbose` flag you can flip on, permanently, rather than deleting the logging code.',
            '**Assuming a correct final answer means every step was correct.** Two compensating mistakes can still land on a right-looking number by luck. Fix: spot-check the trace even on "correct" runs occasionally.',
            '**Printing only `tool_block.name` without `tool_block.input`.** You see *that* a tool was called but not *with what*, which is usually where the actual bug is. Fix: always print both together.',
            '**Not distinguishing model text from tool-use content in the printed output.** The log becomes hard to read. Fix: label each printed line clearly (`[model text]`, `[tool chosen]`, `[tool result]`).',
            '**Debugging by staring at raw JSON dumps of the whole response object.** It is technically all there but painfully slow to read. Fix: extract and print just the few fields that matter (name, input, stop_reason, text).',
          ],
          tryIt:
            'Run your `ask()` with `verbose=True` on a question you expect to need two tool calls, and confirm the trace shows the second call using the *actual* result of the first (not a value the model invented) as one of its arguments.',
          takeaway:
            'Debugging an agent means tracing every step — the model\'s text, the chosen tool and its exact arguments, the real result, and the stop_reason — so you can pinpoint whether a wrong answer came from a bad tool choice, bad arguments, or a bad computation.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm6-p1',
      type: 'Mini Project',
      title: 'Calculator Tool Agent',
      domain: 'Agents & Tools',
      duration: '2-3 hrs',
      description:
        'Build a small, standalone terminal agent — separate from Kundapura Sahayaka for now, to isolate the new tool-calling mechanic — with exactly one tool: a calculator (add, subtract, multiply, divide, percentage). The agent must correctly decide, per question, whether it needs the calculator ("what\'s 18% GST on ₹450?") or can just answer directly ("what\'s GST?"), and must survive a bad calculation (like divide by zero) without crashing.',
      tools: ['Python', 'anthropic SDK', 'tool/function calling'],
      blueprint: {
        overview:
          'This project isolates the tool-calling mechanic on its own, with no RAG, no multi-tool routing, and no existing Kundapura Sahayaka code to distract from it — just one tool, one schema, and one request/response loop, built and debugged from scratch. You will write the calculator function, its schema, the full ReAct-style loop (call model, detect tool_use vs end_turn, execute, send result back, repeat), error handling for bad input, and a verbose debug trace — the exact pattern Module 7 will extend into a full multi-tool Kundapura Sahayaka agent.',
        functionalRequirements: [
          'Implement a `calculator(operation, a, b)` function supporting add, subtract, multiply, divide, and percentage, with a clear error for divide-by-zero and unknown operations.',
          'Define a `calculator_tool` schema (name, description, input_schema with an `enum`-constrained `operation`) and pass it to `messages.create(..., tools=[calculator_tool])`.',
          'Implement a request/response loop that checks `stop_reason`: answers directly on `end_turn`, executes and loops again on `tool_use`.',
          'Handle tool execution errors by sending an `is_error: True` tool_result back to the model instead of crashing, and cap the loop at a max number of steps.',
          'Add a `verbose` mode that prints the model\'s text, the chosen tool and its arguments, and the tool result at each step.',
          'Demonstrate correct behavior on at least five test questions: a pure-knowledge question, a single-calculation question, a multi-step calculation question, an ambiguous/edge-case question, and a deliberately invalid calculation (e.g. divide by zero).',
        ],
        technicalImplementation: [
          'Load the API key from a `.env` file with `python-dotenv`; never hardcode it.',
          'Use `anthropic.Anthropic().messages.create(model="claude-sonnet-4-5", max_tokens=1024, tools=[...], messages=[...])` as the core call.',
          'Keep the `messages` list as the single source of conversation state, appending both the assistant\'s tool-use content and the user-role `tool_result` content on every tool round-trip.',
          'Wrap the calculator dispatch in `try/except` and translate any exception into an `is_error: True` tool_result.',
          'Structure the whole thing as an `ask(question, max_steps=6, verbose=False)` function you can call repeatedly from a small terminal REPL (`input()` loop) for interactive testing.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Build the calculator tool and schema',
            outcome: 'A `calculator(operation, a, b)` function and a matching `calculator_tool` JSON-Schema dict, tested standalone with plain Python calls before any LLM is involved.',
            prompt:
              'Write a Python function `calculator(operation: str, a: float, b: float) -> float` supporting "add", "subtract", "multiply", "divide", and "percentage" (where `b` is the rate applied to `a`), raising a clear `ValueError` for divide-by-zero and for any unrecognized operation. Then write a `calculator_tool` dict matching the Anthropic tool-schema format: `name`, a `description` explaining what it does and when to use it, and an `input_schema` with `operation` constrained by a JSON Schema `enum` to the five supported values, plus `a` and `b` as required numbers. Test the function directly with a few plain Python calls (no API involved yet) and show the outputs, including the divide-by-zero error.',
          },
          {
            step: 2,
            label: 'Wire it to the model and build the request/response loop',
            outcome: 'An `ask(question)` function that sends the tool schema to the model, detects tool_use vs end_turn, executes the real calculator, sends the result back, and returns the final natural-language answer.',
            prompt:
              'Using the `anthropic` Python SDK and `python-dotenv` to load `ANTHROPIC_API_KEY` from a `.env` file, write an `ask(question: str) -> str` function that calls `client.messages.create(model="claude-sonnet-4-5", max_tokens=1024, tools=[calculator_tool], messages=[...])`, checks `response.stop_reason`, and: if `"end_turn"`, returns the model\'s text directly; if `"tool_use"`, finds the tool_use content block, calls the real `calculator` function with its `input`, appends both the assistant\'s tool-use message and a `tool_result` message to the conversation, and calls the API again for the final answer. Demonstrate it correctly answering both "What is GST?" (no tool call) and "What is 18% GST on Rs 450?" (one tool call), printing the `stop_reason` at each step so I can see the difference.',
          },
          {
            step: 3,
            label: 'Add error handling and multi-step support',
            outcome: 'The same agent surviving a divide-by-zero without crashing, and correctly resolving a genuinely two-step calculation by calling the calculator twice in sequence.',
            prompt:
              'Extend `ask()` into a proper loop (`for step in range(1, max_steps + 1)`, default `max_steps=6`) that keeps calling the model and executing tool calls until `stop_reason == "end_turn"` or the step limit is hit. Wrap the calculator call in `try/except` and, on failure, send back a `tool_result` with `"is_error": True` and a short message describing the problem instead of letting the exception crash the program. Demonstrate: (a) "What is 10 divided by 0?" producing a graceful natural-language response instead of a traceback, and (b) "What is 18% GST on Rs 450, then split that three ways?" producing two separate tool calls (percentage then divide) before the final answer — print the sequence of `stop_reason` values for both cases to prove it.',
          },
          {
            step: 4,
            label: 'Add verbose tracing and a terminal REPL',
            outcome: 'A `verbose=True` mode that prints the model\'s reasoning text, the chosen tool with its exact arguments, and each tool result at every loop step, wired into a small interactive terminal chat loop.',
            prompt:
              'Add a `verbose: bool = False` parameter to `ask()` that, when true, prints a labeled trace at every loop iteration: the `stop_reason`, any model text blocks, the chosen tool\'s `name` and `input` before execution, and the tool result (marking it clearly if it was an error) after execution. Then write a small terminal REPL — a `while True: question = input("You: ")` loop that calls `ask(question, verbose=True)` and prints the answer, exiting cleanly on "quit" or "exit". Run it interactively with at least five mixed questions (pure knowledge, single calculation, multi-step calculation, an ambiguous edge case, and a deliberately invalid calculation) and show me the full trace output for each.',
          },
        ],
        deliverable:
          'A standalone Python script (e.g. `calculator_agent.py`) with `calculator()`, `calculator_tool`, and `ask(question, max_steps=6, verbose=False)`, runnable as an interactive terminal REPL, that correctly distinguishes direct-answer questions from tool-needed questions, survives a divide-by-zero without crashing, resolves at least one genuinely two-step calculation via two sequential tool calls, and prints a readable verbose trace of every reasoning/tool-choice/result step on demand.',
      },
    },
  ],
  quiz: [
    {
      id: 'm6-q1',
      q: 'When an LLM "calls a tool" via a tool-calling API, what actually happens?',
      options: [
        'The model directly executes the corresponding Python function on the server',
        'The model returns structured JSON naming the tool and arguments, and your own code executes the real function',
        'The model searches the internet to find and run the tool itself',
        'The model simulates the function\'s output internally without any code running',
      ],
      answer: 1,
    },
    {
      id: 'm6-q2',
      q: 'In the ReAct (reason, act, observe) pattern, what is the purpose of the "observe" step?',
      options: [
        'To let the model plan every future step before taking any action',
        'To feed the real result of the action just taken back into the model before it reasons about the next step',
        'To let the user review and approve the model\'s answer',
        'To log the conversation for later auditing only, with no effect on the next step',
      ],
      answer: 1,
    },
    {
      id: 'm6-q3',
      q: 'In a tool schema, why is the `description` field usually the single most important part?',
      options: [
        'It is shown to the end user as documentation',
        'It determines the tool\'s execution speed',
        'It is what the model relies on most to decide whether and when this tool is the right one to call',
        'It is only used for logging and has no effect on the model\'s behavior',
      ],
      answer: 2,
    },
    {
      id: 'm6-q4',
      q: 'A user asks "What does GST stand for?" to an agent that has a calculator tool available. What should happen?',
      options: [
        'The agent must always call the calculator tool first, since a tool is available',
        'The model recognizes no computation is needed and responds directly, with `stop_reason` coming back as `end_turn`',
        'The request should be rejected because no tool matches exactly',
        'The agent should call the calculator with dummy values just to be safe',
      ],
      answer: 1,
    },
    {
      id: 'm6-q5',
      q: 'A calculator tool call divides by zero and raises an exception inside your Python function. What is the correct way to handle this in the agent loop?',
      options: [
        'Let the exception crash the program so the bug is immediately visible',
        'Silently return 0 as the result so the loop continues normally',
        'Catch the exception and send a `tool_result` back to the model marked `is_error: True` with a short description, so the model can react appropriately',
        'Restart the entire conversation from scratch with no memory of the error',
      ],
      answer: 2,
    },
  ],
}
