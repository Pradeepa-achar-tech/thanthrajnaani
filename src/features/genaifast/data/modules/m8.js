// Module 8 — Shipping It: Deployment
// Wraps the Module 7 terminal agent ("Kundapura Sahayaka") in a Streamlit chat UI,
// moves secrets out of the codebase, and deploys it to a real public URL on
// Streamlit Community Cloud — the fast-track course's "go live" milestone.

export const m8 = {
  id: 'm8',
  title: 'Shipping It — Deployment',
  hours: 6,
  color: 'from-sky-500/20 to-sky-700/10',
  accent: 'sky',
  description:
    'Turn the Module 7 terminal agent into something you can actually hand someone a link to. Wrap it in a **Streamlit** chat UI with streaming replies, move the API key out of your code and into `st.secrets`, then push the project to GitHub and deploy it on **Streamlit Community Cloud** with a real public URL. By the end, Kundapura Sahayaka is a live, shareable web app — not just a script that runs on your laptop.',
  sections: [
    {
      id: 'm8-s1',
      title: 'Wrapping in a UI',
      topics: [
        {
          id: 'm8-t1',
          title: 'Why Streamlit — a Python script becomes a shareable web app fast',
          explain:
            'Streamlit is a Python library that turns a plain script into a browser-based web app using only Python — no HTML, CSS, or JavaScript required — which is exactly enough frontend to demo the agent to someone who is not going to open a terminal.',
          analogy:
            'Right now, Kundapura Sahayaka only works if someone sits at your laptop, opens a terminal, and types Python commands — like a temple committee that only shares festival dates if you physically walk to the coordinator\'s house and ask. **Streamlit** builds the equivalent of a notice board at the bus stand: the same information, but anyone can walk up, read it, and ask a question, without knowing anything about how the committee keeps its records.',
          theory:
            'Every module so far has produced a **terminal program** — powerful, but only usable by someone who can run Python and read stack traces. To let anyone try Kundapura Sahayaka, you need a **web UI**: something that opens in a browser, shows a chat box, and hides the Python entirely.\n\nBuilding a "real" web frontend (React, a backend API, HTTP routes, CSS) is a significant, separate skill — and not what this fast-track course is about. **Streamlit** solves this by letting you describe the UI *in Python*, in the same file as your agent logic. You write `st.chat_input("Ask about Kundapura...")` and Streamlit handles turning that into an actual HTML text box, wiring up the browser-to-Python round trip, and re-running your script top-to-bottom whenever the user interacts with it.\n\nThe mental model that trips people up at first: a Streamlit app is a normal Python script that Streamlit **re-runs from top to bottom on every interaction** (every button click, every submitted chat message). This is different from a traditional web server that only runs specific handler functions per request. It is also why `st.session_state` (next topic) matters so much — without it, every rerun would forget the whole conversation.\n\nStreamlit is not the only option — Gradio is a close cousin, and a "real" stack would use FastAPI plus a JS frontend — but for a Python-only, few-hours-to-a-working-demo tool, Streamlit is the pragmatic pick for this course, and it is genuinely used in production internal tools and prototypes at real companies.',
          whyItMatters:
            'The gap between "a script that runs for me" and "a thing I can send a link to" is the single biggest gap between a tutorial project and a portfolio piece. Recruiters and interviewers can click a Streamlit URL in ten seconds; almost nobody will clone your repo and run a terminal script. Learning to reach for Streamlit when you need a fast demo (not a production frontend) is a genuinely useful, reusable skill beyond this course.',
          steps: [
            'Install Streamlit into the Module 7 project: `pip install streamlit`.',
            'Create a new file `app.py` alongside your existing agent code — do not delete the terminal version.',
            'Write the smallest possible Streamlit app: a title and one line of text.',
            'Run it with `streamlit run app.py`, not `python app.py`.',
            'Confirm a browser tab opens automatically at `http://localhost:8501`.',
            'Edit the title text, save, and watch Streamlit offer to "rerun" — see the live-reload loop.',
          ],
          code: `# app.py — the smallest possible Streamlit app, to prove the tool works
import streamlit as st

st.set_page_config(page_title="Kundapura Sahayaka", page_icon="🚤")
st.title("Kundapura Sahayaka ಕುಂದಾಪುರ ಸಹಾಯಕ")
st.write("This will become our chat UI in the next topic.")

# Run this with:  streamlit run app.py
# (NOT "python app.py" — that just imports streamlit and exits immediately)`,
          pitfalls: [
            '**Running `python app.py` instead of `streamlit run app.py`.** Nothing visibly happens, or you get a blank exit. Fix: always launch Streamlit apps with the `streamlit run` command.',
            '**Expecting the script to run once and stay in memory like a normal program.** Streamlit reruns the *entire* script on every interaction. Fix: design around this rerun model rather than fighting it.',
            '**Putting slow setup code (loading the vector index, creating the API client) at the top level with no caching.** It reruns every keystroke. Fix: this is fixed properly in Module 8-s1-t3/`st.cache_resource`-style patterns — for now, just notice the app feels slow.',
            '**Assuming Streamlit needs a `requirements.txt` to run locally.** It does not, locally — but it will for deployment (covered in Section 2). Fix: keep a `requirements.txt` updated as you add packages regardless.',
            '**Forgetting to keep the terminal version of the agent.** You lose a simpler script to debug agent logic in isolation. Fix: keep `agent.py` (or similar) as the core logic; `app.py` just calls into it.',
            '**Confusing Streamlit with a full production frontend framework.** It is not meant for pixel-perfect custom design or huge concurrent user loads. Fix: use it for what it is — fast internal tools and demos.',
          ],
          tryIt:
            'Create `app.py` with a title, a short `st.write()` description of Kundapura Sahayaka, and an `st.text_input("Your name")` that echoes back "Namaskara, {name}!" below it using `st.write`. Run it with `streamlit run app.py` and try typing in the box.',
          takeaway:
            'Streamlit turns a Python script into a browser app with no separate frontend code — run it with `streamlit run app.py`, and remember it reruns top-to-bottom on every interaction.',
        },
        {
          id: 'm8-t2',
          title: 'Building the chat UI: session_state, st.chat_message, st.chat_input',
          explain:
            'Streamlit has purpose-built chat primitives — `st.chat_input` for the message box, `st.chat_message` to render each bubble — and because the whole script reruns on every message, the conversation history must be kept in `st.session_state`, Streamlit\'s per-user persistent dictionary.',
          analogy:
            'Picture the temple committee\'s enquiry desk keeping a **daily register** of every question asked and every answer given that day, even though the same clerk (Streamlit rerunning the script) technically "starts fresh" each time someone walks up. Without the register (`st.session_state`), the clerk would greet every new question as if it were the first ever asked, with total amnesia about the last one. The register is what makes it feel like one continuous conversation instead of a string of isolated encounters.',
          theory:
            'Because Streamlit reruns your whole script on every interaction, any plain Python variable (`messages = []`) resets to empty on the very next message. **`st.session_state`** is a dictionary-like object Streamlit preserves *across reruns* for the same browser session — it is where conversation history has to live.\n\nThe standard pattern:\n```python\nif "messages" not in st.session_state:\n    st.session_state.messages = []  # only runs once, on first load\n```\nEvery message the user sends or the assistant replies with gets appended as a dict, typically `{"role": "user"/"assistant", "content": "..."}` — deliberately the same shape the Anthropic/OpenAI SDKs expect, so you can pass `st.session_state.messages` straight into your agent\'s message history.\n\nTwo widgets do the actual chat rendering:\n- **`st.chat_message(role)`** — a context manager that draws one styled chat bubble (with a role-appropriate avatar). You loop over `st.session_state.messages` and open one `with st.chat_message(msg["role"]):` per stored message to redraw the whole conversation on every rerun.\n- **`st.chat_input(placeholder)`** — a chat-style text box pinned to the bottom of the page. It returns `None` on every rerun except the one where the user just submitted something, in which case it returns the typed string.\n\nPutting it together: on each rerun, redraw all stored messages, check if `st.chat_input()` returned a new string, and if so append it to `st.session_state.messages`, call the agent, append its reply, and let Streamlit\'s natural rerun redraw the updated list.',
          whyItMatters:
            '`st.session_state` is the single most important Streamlit concept for anything beyond a static page — get it wrong and every app "forgets" itself constantly, which is exactly the bug new Streamlit developers hit first. Understanding *why* state needs to be explicit (because the whole script reruns) is also a transferable lesson about how different UI re-render models are from a traditional request/response backend.',
          steps: [
            'Initialize `st.session_state.messages = []` on first run, guarded by `if "messages" not in st.session_state`.',
            'Loop over `st.session_state.messages` and render each with `st.chat_message(role)` / `st.write(content)`.',
            'Add `st.chat_input("Ask about Kundapura...")` below the loop and capture its return value.',
            'When the input is non-empty, append a `{"role": "user", "content": ...}` dict to session state.',
            'Call your Module 7 agent function with the message history, append its reply as `{"role": "assistant", ...}`.',
            'Confirm the full conversation stays visible after each new message — Streamlit reruns but state persists.',
          ],
          code: `import streamlit as st

st.title("Kundapura Sahayaka")

# 1. Initialise history once per browser session
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Namaskara! Ask me about Kundapura seva timings, recipes, or travel."}
    ]

# 2. Redraw every stored message on every rerun
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

# 3. Capture new input (returns None unless just submitted)
user_input = st.chat_input("Ask about Kundapura...")

if user_input:
    st.session_state.messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.write(user_input)

    # run_agent() is your Module 7 tool-using agent, reused as-is
    reply = run_agent(st.session_state.messages)

    st.session_state.messages.append({"role": "assistant", "content": reply})
    with st.chat_message("assistant"):
        st.write(reply)`,
          pitfalls: [
            '**Using a plain `messages = []` list instead of `st.session_state.messages`.** History vanishes on the very next message. Fix: always store conversation state in `st.session_state`.',
            '**Re-initialising `st.session_state.messages = []` on every run without the `if "messages" not in st.session_state` guard.** It wipes history every rerun. Fix: guard the initial assignment.',
            '**Forgetting to redraw past messages before showing the new one.** The chat appears to lose earlier turns visually. Fix: always loop and render the full `st.session_state.messages` at the top of the script.',
            '**Appending only the user message and forgetting the assistant reply.** The agent has no memory of its own previous answers on the next turn. Fix: append both roles.',
            '**Passing the raw `st.chat_input()` widget object into the agent instead of the returned string.** Fix: `chat_input()` already returns a plain string (or `None`) — use it directly.',
            '**Calling the agent even when `user_input` is `None`.** Runs the agent on every rerun, not just on submit. Fix: guard the agent call with `if user_input:`.',
          ],
          tryIt:
            'Extend the try-it app from the previous topic into a real (still agent-less) chat UI: seed `st.session_state.messages` with one assistant greeting, render history with `st.chat_message`, and on new input just echo it back as "You said: {input}" as the assistant reply — confirming state persists across turns before wiring in the real agent.',
          takeaway:
            '`st.session_state` survives Streamlit\'s per-interaction reruns; store the conversation there and redraw it with `st.chat_message` / `st.chat_input` on every run.',
        },
        {
          id: 'm8-t3',
          title: 'Streaming responses so replies appear token-by-token',
          explain:
            'Instead of waiting for the full answer and printing it at once, stream the API response and update the chat bubble incrementally with `st.write_stream`, so the reply appears the way it does in ChatGPT/Claude.ai — word by word, not as a sudden block of text after a pause.',
          analogy:
            'Compare two ways a temple announcer could share the festival schedule: standing silently for ten seconds and then reading the whole notice in one breath, versus reading it aloud as it comes to them, sentence by sentence. Both eventually convey the same information, but the second feels alive and responsive — you know it is working, not frozen. Streaming is that second style, applied to your chat bubble.',
          theory:
            'A non-streaming call waits for the entire completion before returning anything — for a long agent answer (especially one that used a tool first), that can feel like a multi-second silent pause with no feedback, which reads as "broken" to a user. **Streaming** asks the API to send the response in small chunks as it is generated, so the UI can display partial text immediately and keep appending.\n\nThe Anthropic Python SDK supports this via `client.messages.stream(...)`, used as a context manager that yields text chunks through `.text_stream`:\n```python\nwith client.messages.stream(model=..., max_tokens=..., messages=...) as stream:\n    for text in stream.text_stream:\n        yield text\n```\nStreamlit has a matching widget, **`st.write_stream(generator)`**, that consumes exactly this kind of generator/iterator and progressively renders it into the chat bubble, token by token, handling the "typewriter" redraw for you — you do not need any manual buffering or placeholder-updating code.\n\nOne wrinkle for *this* course specifically: the Module 7 agent sometimes needs to call a tool (calculator, seva lookup, RAG search) before it can give a final answer, and that tool-decision step is not naturally "streamable" text — it is a structured decision. The practical pattern is to stream only the **final** natural-language reply once the agent has finished any tool calls, and optionally show a lightweight `st.status("Looking that up...")` spinner while tool calls are in flight. Streaming isn\'t required for the agent to work — it is a UI polish that makes the same underlying agent *feel* faster and more alive.',
          whyItMatters:
            'Perceived latency is a real product concern: the exact same total response time feels much slower with a silent wait than with visible progressive output. Every major chat product (ChatGPT, Claude.ai, Gemini) streams for this reason, and being able to say "I implemented token streaming" is a concrete, interview-worthy detail that shows you understand UX, not just API calls.',
          steps: [
            'Write a generator function `stream_reply(messages)` that opens `client.messages.stream(...)` and `yield`s each `stream.text_stream` chunk.',
            'Inside the `with st.chat_message("assistant"):` block, call `full_reply = st.write_stream(stream_reply(st.session_state.messages))`.',
            'Confirm `st.write_stream` returns the fully concatenated string once streaming finishes.',
            'Append that returned string (not the generator) to `st.session_state.messages` as the assistant turn.',
            'Wrap any tool-calling step from Module 7 in `st.status("Checking seva timings...")` before streaming the final reply.',
            'Run the app and confirm text now appears incrementally instead of all at once.',
          ],
          code: `import anthropic
import streamlit as st

client = anthropic.Anthropic(api_key=st.secrets["ANTHROPIC_API_KEY"])

def stream_reply(messages):
    """Generator: yields text chunks as the model produces them."""
    with client.messages.stream(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        system="You are Kundapura Sahayaka, a helpful local assistant.",
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield text

# ... inside the chat loop, after appending the user message:
with st.chat_message("assistant"):
    # any Module 7 tool-calling step would run here first, e.g.:
    # with st.status("Checking seva timings...", expanded=False):
    #     tool_result = maybe_call_tool(user_input)
    full_reply = st.write_stream(stream_reply(st.session_state.messages))

st.session_state.messages.append({"role": "assistant", "content": full_reply})`,
          pitfalls: [
            '**Passing a plain string, not a generator, to `st.write_stream`.** It just prints it all at once — no error, but no streaming effect either. Fix: pass a function that `yield`s chunks.',
            '**Forgetting to capture and store `st.write_stream`\'s return value.** The next turn has no assistant message in history. Fix: assign it to a variable and append it to `st.session_state.messages`.',
            '**Calling `client.messages.create()` (non-streaming) but expecting `st.write_stream` to animate it anyway.** Fix: use `client.messages.stream()` and iterate `.text_stream`.',
            '**Trying to stream the tool-selection step itself.** Tool-use decisions are structured JSON, not prose — streaming them looks broken. Fix: only stream the final natural-language answer; show a spinner during tool calls.',
            '**Leaving the streaming context manager (`with client.messages.stream(...) as stream:`) open across reruns.** Fix: open and fully consume it within a single generator call, once per user turn.',
            '**Not handling a network error mid-stream.** A dropped connection mid-answer leaves a half-written bubble with no explanation. Fix: wrap the stream in a `try/except` and show `st.error(...)` on failure.',
          ],
          tryIt:
            'Write a small standalone generator `def count_up(): \n    import time\n    for i in range(1, 6):\n        time.sleep(0.4)\n        yield f"{i}... "` and render it with `st.write_stream(count_up())` to see the incremental-render behaviour before wiring in the real streaming API call.',
          takeaway:
            '`client.messages.stream()` plus `st.write_stream()` renders replies token-by-token — stream the final answer, not the tool-decision step, and always capture the returned full string for history.',
        },
        {
          id: 'm8-t4',
          title: 'Secrets management: st.secrets, secrets.toml, and never committing keys',
          explain:
            'Streamlit reads secrets from a local `.streamlit/secrets.toml` file (never committed to git) via `st.secrets["KEY_NAME"]`, replacing the `.env`/`python-dotenv` pattern from earlier modules — the same discipline of "keys never touch source control", just Streamlit\'s specific mechanism.',
          analogy:
            'The temple committee keeps the safe combination on a card locked inside a drawer only the treasurer has a key to — it is never written on the public notice board next to the festival dates, even though both are "committee information". Your API key is the safe combination; `st.secrets` is the locked drawer. `secrets.toml` and the notice board (your public GitHub repo) must never be the same piece of paper.',
          theory:
            'Since Module 2/3 you have used `python-dotenv` and a `.env` file to keep `ANTHROPIC_API_KEY` out of your source code. Streamlit has its own, closely related mechanism: a **`.streamlit/secrets.toml`** file in your project root, read through the **`st.secrets`** dictionary-like object.\n```toml\n# .streamlit/secrets.toml — LOCAL FILE, NEVER COMMITTED\nANTHROPIC_API_KEY = "sk-ant-...your-real-key..."\n```\n```python\nimport streamlit as st\nclient = anthropic.Anthropic(api_key=st.secrets["ANTHROPIC_API_KEY"])\n```\n`st.secrets` works for local development (Streamlit reads the `.toml` file automatically) *and* is the exact same mechanism used for the deployed app in Section 2 — on Streamlit Community Cloud, you paste the same key/value pairs into a **Secrets** box in the app\'s dashboard settings instead of a file, and Streamlit exposes them to your deployed code through the identical `st.secrets["ANTHROPIC_API_KEY"]` call. Your code does not need to change between local and deployed.\n\nThe non-negotiable rule, worth repeating from earlier modules because the stakes are higher once code is on GitHub: **`.streamlit/secrets.toml` must be listed in `.gitignore` before your first commit.** A committed API key is not a "fix it later" mistake — public GitHub repos are scraped by bots within minutes, and a leaked Anthropic/OpenAI key can be used by someone else and billed to your account. If a key is ever accidentally committed and pushed, the correct fix is not "delete the file and commit again" (it stays in git history forever) — it is to immediately **revoke/rotate the key** in the provider\'s dashboard, then clean history if needed.',
          whyItMatters:
            'This is the single highest-stakes lesson in the whole deployment module — a leaked key is a real financial and security incident, not a style nitpick. Every professional codebase enforces "secrets never in git" as a hard rule (often with automated scanning), and knowing the Streamlit-specific mechanism (`st.secrets` + dashboard secrets, mirroring local `.toml`) is exactly what you need for Section 2\'s deployment.',
          steps: [
            'Create a `.streamlit/` folder in your project root (note the leading dot).',
            'Inside it, create `secrets.toml` with `ANTHROPIC_API_KEY = "your-real-key"`.',
            'Open `.gitignore` and add a line for `.streamlit/secrets.toml` (or the whole `.streamlit/` folder) — do this *before* your first `git add`.',
            'Replace every `os.getenv("ANTHROPIC_API_KEY")` call in `app.py` with `st.secrets["ANTHROPIC_API_KEY"]`.',
            'Run `streamlit run app.py` and confirm the key loads with no errors.',
            'Run `git status` and confirm `secrets.toml` does NOT appear in the list of files to be committed.',
          ],
          code: `# .streamlit/secrets.toml  (LOCAL ONLY — never git add this file)
ANTHROPIC_API_KEY = "sk-ant-api03-REPLACE-WITH-YOUR-REAL-KEY"

# .gitignore  (add this BEFORE your first commit)
.streamlit/secrets.toml
.env
__pycache__/
*.pyc

# app.py — read it via st.secrets, same call shape works locally and deployed
import streamlit as st
import anthropic

api_key = st.secrets["ANTHROPIC_API_KEY"]
client = anthropic.Anthropic(api_key=api_key)

# Sanity check while developing (remove before sharing your screen!):
# st.write("Key loaded:", bool(api_key))   # prints True/False, never the key itself`,
          pitfalls: [
            '**Adding `secrets.toml` to `.gitignore` *after* already committing it once.** Git still remembers it in history. Fix: if this happens, revoke the key immediately in the provider dashboard, then remove it from history (or simply treat that key as burned and issue a new one).',
            '**Committing `.streamlit/secrets.toml` because `.gitignore` only excluded `.env`.** Two different secret files need two different ignore entries. Fix: explicitly ignore both, or ignore the whole `.streamlit/` folder.',
            '**Printing the actual key value with `st.write(api_key)` while sharing a screen or recording a demo.** Fix: only print `bool(api_key)` or the last 4 characters, never the full key, and remove even that before deploying.',
            '**Hardcoding the key as a string literal directly in `app.py` "just to test quickly".** It is easy to forget and commit. Fix: always go through `st.secrets`, even for a 30-second test.',
            '**Assuming `st.secrets` automatically finds a `.env` file.** It does not — `.env`/`python-dotenv` and `st.secrets`/`secrets.toml` are separate mechanisms. Fix: use `secrets.toml` for anything read via `st.secrets`.',
            '**Forgetting secrets.toml needs valid TOML syntax (quoted strings, no trailing commas like JSON).** A malformed file throws a parse error on startup. Fix: keep it to simple `KEY = "value"` lines.',
          ],
          tryIt:
            'Deliberately (in a throwaway test folder) commit a fake `secrets.toml` with a dummy key, then run `git log -p` to see that the "secret" is now permanently visible in history even after you delete the file and commit again — proving why prevention (`.gitignore` first) beats cleanup.',
          takeaway:
            'Keep real API keys only in `.streamlit/secrets.toml`, read them with `st.secrets["KEY"]`, and put that file in `.gitignore` before your very first commit — a committed key must be treated as compromised and rotated immediately.',
        },
      ],
    },
    {
      id: 'm8-s2',
      title: 'Going Live',
      topics: [
        {
          id: 'm8-t5',
          title: 'Deploying to Streamlit Community Cloud',
          explain:
            'Streamlit Community Cloud deploys an app straight from a public (or connected private) GitHub repo: push your code, connect the repo in the Streamlit dashboard, paste your secrets into its Secrets box, and it builds and hosts your app at a public `*.streamlit.app` URL.',
          analogy:
            'This is the difference between a menu written on a chalkboard inside your own kitchen (only visible if someone walks into your house) and getting it printed on a signboard out on the main Kundapura road. The recipe (your code) does not change — what changes is that it now lives somewhere anyone passing by can see it, at an address you can just tell people.',
          theory:
            'Local `streamlit run app.py` only serves the app on your own machine, at `localhost` — nobody else can reach it. **Streamlit Community Cloud** is Streamlit\'s own free hosting for public apps, and deployment is deliberately simple because it is designed around GitHub:\n\n1. **Push a clean repo to GitHub.** It needs `app.py`, a `requirements.txt` listing every package your app imports (`streamlit`, `anthropic`, `python-dotenv` if still used, your RAG dependencies like `chromadb`/`faiss-cpu`, etc.), and a `.gitignore` that excludes `.streamlit/secrets.toml`, `.env`, and `__pycache__/`.\n2. **Sign in to Streamlit Community Cloud** (share.streamlit.io) with your GitHub account and click "New app".\n3. **Point it at your repo, branch, and `app.py` path.** Streamlit Cloud clones the repo and builds a container from your `requirements.txt`.\n4. **Open the app\'s "Secrets" settings** in the dashboard and paste the same key/value pairs your local `secrets.toml` has (`ANTHROPIC_API_KEY = "..."`) — this is the cloud equivalent of the local file, read through the exact same `st.secrets["ANTHROPIC_API_KEY"]` call in your code, no code changes needed.\n5. **Deploy.** Streamlit Cloud installs dependencies, starts your app, and gives you a public URL like `https://kundapura-sahayaka.streamlit.app`.\n\nAny knowledge-base files your RAG step needs (the Module 4-5 markdown docs) must also be committed to the repo (they are plain text, not secrets) so the deployed container has them — only the *API key* is a secret; the knowledge base is regular project content.\n\nA push to the connected GitHub branch triggers an automatic redeploy, so "ship an update" becomes just `git push` once the app is connected.',
          whyItMatters:
            'This is the actual moment the project stops being "my code" and becomes "a thing that exists on the internet" — the single biggest credibility jump in the whole course. Being able to describe, in an interview, exactly how you took a script to a public URL (GitHub → connected repo → secrets in a dashboard → live app) demonstrates real deployment literacy, not just coding ability.',
          steps: [
            'Create `requirements.txt` listing every package your app imports (`pip freeze > requirements.txt`, then trim to what you actually use).',
            'Confirm `.gitignore` excludes `.streamlit/secrets.toml`, `.env`, and `__pycache__/`, then `git init`/commit/push to a new public GitHub repo.',
            'Sign in to `share.streamlit.io` with GitHub and click "New app".',
            'Select the repo, branch, and `app.py` as the main file path.',
            'Open the app\'s Secrets settings and paste in `ANTHROPIC_API_KEY = "..."` (and any other keys your app reads via `st.secrets`).',
            'Click Deploy, wait for the build to finish, and open the resulting `*.streamlit.app` URL in a browser you are not logged into anything special on, to confirm it truly works for a stranger.',
          ],
          code: `# requirements.txt — every import app.py (and its dependencies) needs
streamlit>=1.35
anthropic>=0.34
python-dotenv>=1.0
chromadb>=0.5      # if Module 4-5's RAG store is still in use
tiktoken>=0.7

# .gitignore — must exist and be correct BEFORE the first push
.streamlit/secrets.toml
.env
__pycache__/
*.pyc
.venv/

# Typical first deploy sequence, run locally:
# git init
# git add app.py requirements.txt .gitignore data/kb/  (NOT secrets.toml)
# git commit -m "Kundapura Sahayaka: Streamlit chat app"
# git remote add origin https://github.com/<you>/kundapura-sahayaka.git
# git push -u origin main
# --- then in the Streamlit Cloud dashboard: New app -> pick repo/branch/app.py -> Secrets -> Deploy`,
          pitfalls: [
            '**Forgetting `requirements.txt`, or leaving it stale.** The cloud build fails with `ModuleNotFoundError` for anything installed locally but not listed. Fix: regenerate/check it against every `import` in your code.',
            '**Pushing `.streamlit/secrets.toml` because `.gitignore` was added too late.** Fix: verify with `git status` that it is untracked *before* the very first commit, not after.',
            '**Deploying without setting Secrets in the dashboard, then wondering why the app crashes with a KeyError on `st.secrets["ANTHROPIC_API_KEY"]`.** Fix: the dashboard Secrets box is a separate step from pushing code — do not skip it.',
            '**Forgetting to commit the RAG knowledge-base markdown files.** The deployed app runs but has nothing to retrieve, and answers regress to hallucinating like Module 3. Fix: commit `data/kb/` (plain text, not secret) alongside the code.',
            '**Assuming a private GitHub repo cannot be deployed.** Community Cloud does support private repos once you grant it access, though a public repo is simpler for a portfolio piece people can browse. Fix: pick public unless you have a specific reason not to.',
            '**Testing only in your own already-logged-in browser and declaring it done.** You might be unknowingly relying on cached local state. Fix: open the deployed URL in an incognito window or send it to another device.',
          ],
          tryIt:
            'Before touching Streamlit Cloud, run `pip install -r requirements.txt` inside a *brand-new, empty* virtual environment and `streamlit run app.py` from there — if it fails, your `requirements.txt` is incomplete and the cloud build will fail the same way.',
          takeaway:
            'Streamlit Community Cloud deploys straight from a GitHub repo — push clean code plus `requirements.txt`, paste secrets into the dashboard\'s Secrets box, and you get a public `*.streamlit.app` URL with zero server setup.',
        },
        {
          id: 'm8-t6',
          title: 'An alternative path: deploying to Render (or similar) for more control',
          explain:
            'Streamlit Community Cloud is the fastest path but has limits (sleeping on inactivity, Streamlit-only, less control over the environment); a platform like Render (or Railway/Fly.io) runs your app as a general-purpose web service from a `Dockerfile` or a start command, trading a bit more setup for more control.',
          analogy:
            'Streamlit Community Cloud is like renting a fully furnished stall at the weekly Kundapura market — you show up with your goods (code) and everything else (tables, shelter, footfall) is provided, but you cannot rearrange the stall\'s structure. Render is closer to renting your own small shop: more setup up front (fittings, signage), but you decide the layout, hours, and what else you sell there.',
          theory:
            'Streamlit Community Cloud is purpose-built for Streamlit apps and is the right default for this course\'s scope — but it is worth knowing, briefly, what you would reach for if you outgrew it: needing a non-Streamlit backend alongside your app, wanting the app to never "sleep" on a free tier, needing custom domains without hassle, or wanting full control over the runtime environment.\n\n**Render** (and similar platforms — Railway, Fly.io) is a general-purpose cloud host: you connect the same GitHub repo, but instead of Streamlit Cloud auto-detecting `app.py`, you tell Render explicitly how to run your app — typically a **start command** like `streamlit run app.py --server.port $PORT --server.address 0.0.0.0`, because these platforms assign your app a port dynamically via the `$PORT` environment variable rather than assuming Streamlit\'s default.\n\nSecrets work conceptually the same way but through **environment variables** in Render\'s dashboard instead of a Streamlit-specific Secrets box — you would then read `os.environ["ANTHROPIC_API_KEY"]` (or adapt with `python-dotenv`-style loading) rather than `st.secrets`, or bridge the two by writing environment variables into a `secrets.toml` at container start.\n\nThe honest trade-off for a beginner: Render requires understanding a bit more — port binding, a build command, possibly a `Dockerfile` — in exchange for a service that behaves like a "real" always-on web app rather than a free community-hosted Streamlit instance. For this course, Streamlit Community Cloud is enough; Render is presented so you recognise the *name* and the *shape* of the next step, not as a required deployment target.',
          whyItMatters:
            'Interviewers and job postings mention Render, Railway, Fly.io, and similar platforms constantly, and "I only know one specific hosting button" reads as narrower experience than "I understand the general shape of deploying a web app, and picked the simplest option that fit." Knowing that secrets-as-environment-variables and explicit port binding are the *general* pattern (Streamlit Cloud just hides both) transfers directly to deploying literally any other kind of app later.',
          steps: [
            'Note the two things Streamlit Cloud does for you that a general host does not: auto-detecting Streamlit and picking a port.',
            'Recognise the Render equivalent of a start command: `streamlit run app.py --server.port $PORT --server.address 0.0.0.0`.',
            'Recognise that secrets become environment variables set in Render\'s dashboard, not a `secrets.toml`-style Secrets box.',
            'Understand `os.environ["KEY"]` as the general-purpose equivalent of `st.secrets["KEY"]`.',
            'Note that Render (free tier) may also sleep on inactivity, similar to Streamlit Cloud\'s free tier — "more control" is not automatically "always on" without a paid tier.',
            'Decide: for this course\'s scope, stick with Streamlit Community Cloud; file Render away as the next option if requirements grow.',
          ],
          code: `# Conceptual Render setup (NOT required for this course's project — reference only)

# Start command Render would run:
# streamlit run app.py --server.port $PORT --server.address 0.0.0.0

# app.py would read secrets from environment variables instead of st.secrets,
# e.g. by bridging at startup:
import os
import anthropic

api_key = os.environ.get("ANTHROPIC_API_KEY")  # set in Render's dashboard, not secrets.toml
client = anthropic.Anthropic(api_key=api_key)

# Render dashboard equivalent of Streamlit Cloud's "Secrets" box:
#   Environment tab -> Add Environment Variable -> ANTHROPIC_API_KEY = sk-ant-...`,
          pitfalls: [
            '**Assuming Render "just works" the same way Streamlit Cloud does.** It needs an explicit start command and port binding. Fix: set `--server.port $PORT --server.address 0.0.0.0` explicitly.',
            '**Mixing `st.secrets` calls with a Render deployment that only sets environment variables.** `st.secrets` looks for a `secrets.toml`-style source, not plain env vars, unless configured. Fix: switch to `os.environ.get(...)` if deploying outside Streamlit Cloud, or bridge the two deliberately.',
            '**Assuming "more control" automatically means "always on" or "free".** Free tiers on most platforms still sleep or have limits. Fix: check the specific platform\'s free-tier behavior before promising uptime.',
            '**Switching platforms mid-course out of curiosity, before the required Streamlit Cloud project is done.** Fix: finish the Section 2 project on Streamlit Community Cloud first; treat this topic as background knowledge.',
            '**Forgetting `requirements.txt` still matters identically on Render.** Fix: the same dependency-listing discipline from the previous topic applies everywhere.',
            '**Believing a Dockerfile is mandatory on Render.** Many platforms can build directly from a start command without one for simple apps. Fix: only reach for a Dockerfile when you need a customized environment.',
          ],
          tryIt:
            'Without actually deploying anywhere new, write out (as a comment or notes file) the three concrete differences between how Streamlit Community Cloud and Render would run your `app.py`: how the port is chosen, how secrets are supplied, and what command starts the app.',
          takeaway:
            'Render (or similar) trades Streamlit Cloud\'s zero-config convenience for explicit port binding, an explicit start command, and environment-variable secrets — useful to recognise, not required for this course\'s deployment.',
        },
        {
          id: 'm8-t7',
          title: 'Basic cost awareness in production: rate limits, caching, avoiding a runaway bill',
          explain:
            'A public URL means anyone (or any bot) can trigger LLM API calls that cost real money per token — so a shipped app needs basic guardrails: caching repeated queries, limiting how often one user can call the model, and keeping an eye on usage before a link shared too widely turns into an unexpectedly large bill.',
          analogy:
            'A committee that hands out free prasada to every visitor at the temple normally paces fine — but if a bus tour with two hundred people suddenly arrives and everyone asks three times, the kitchen runs out fast and the cost triples unexpectedly. Rate limits and caching are the kitchen\'s sensible rules: one helping per visit for identical requests, and a queue so nobody floods the counter at once.',
          theory:
            'Every call to `client.messages.create()` (or `.stream()`) costs money, billed per input and output token, and once your app is live at a public URL, *you* no longer control how many times it gets called — a curious visitor refreshing repeatedly, a shared link going slightly viral, or a bot scraping your app can all multiply your bill. Three practical, beginner-appropriate guardrails:\n\n**1. Caching repeated queries.** If several users ask the same or a near-identical question ("What time is the evening seva at the Kundapura temple?"), there is no need to pay for a fresh API call each time. Streamlit\'s `@st.cache_data` decorator can wrap a function that takes a query string and returns the model\'s answer, keyed by its arguments — an identical call within the cache\'s time-to-live returns instantly, for free, from Streamlit\'s cache instead of hitting the API again.\n\n**2. Basic rate limiting.** A simple, honest approach for a small demo app: track a per-session call count in `st.session_state` (e.g. `st.session_state.call_count`), and once a user crosses a small threshold in a short window, show a friendly `st.warning("You\'ve hit the demo limit for now — try again in a bit!")` instead of silently keep calling the API. This is not enterprise-grade throttling, but it is a real, honest safeguard appropriate for a portfolio demo.\n\n**3. Watching usage, not just guessing.** Both Anthropic\'s and OpenAI\'s consoles show usage and cost dashboards, and it is worth checking them in the days after sharing a link, not just trusting that "it\'ll probably be fine." Setting a low monthly spend cap/budget alert in the provider\'s billing settings (where available) is a cheap insurance policy against a surprise bill from either genuine popularity or a bot hammering your public URL.\n\nNone of this needs to be sophisticated for a learning project — the goal is the *habit* of asking "what happens to my bill if 500 strangers hit this today?" before sharing a link widely, not building a production-grade rate limiter.',
          whyItMatters:
            'This is the topic that separates "I called an API in a tutorial" from "I understand that a public LLM app has a live, uncapped cost surface." A hiring manager who hears you thought about caching and rate limits before sharing a link is hearing genuine production judgment, and — very practically — it protects your own wallet the moment this project stops being private.',
          steps: [
            'Wrap a pure "ask the model" helper function with `@st.cache_data(ttl=3600)` so identical questions within an hour do not re-call the API.',
            'Add `st.session_state.call_count = st.session_state.get("call_count", 0)` and increment it on every real (non-cached) agent call.',
            'Add a simple check: if `call_count` exceeds a small threshold (e.g. 20 in a session), show `st.warning(...)` and skip the API call.',
            'Open your Anthropic console\'s usage/billing page and locate where cost-to-date and any spend limits are shown.',
            'If available, set a conservative monthly budget alert so you are notified, not surprised.',
            'Note which parts of the app (RAG retrieval, calculator tool) are free/local versus which specifically cost money (the LLM call itself).',
          ],
          code: `import streamlit as st

# 1. Cache identical questions so repeats don't re-hit the paid API
@st.cache_data(ttl=3600)  # cache each unique question for 1 hour
def cached_ask(question: str) -> str:
    return run_agent([{"role": "user", "content": question}])  # your Module 7 agent

# 2 & 3. A simple per-session rate limit
MAX_CALLS_PER_SESSION = 20

if "call_count" not in st.session_state:
    st.session_state.call_count = 0

user_input = st.chat_input("Ask about Kundapura...")

if user_input:
    if st.session_state.call_count >= MAX_CALLS_PER_SESSION:
        st.warning("You've hit the demo limit for this session — please come back a bit later!")
    else:
        st.session_state.call_count += 1
        reply = cached_ask(user_input)
        st.write(reply)
        # (full chat-history bookkeeping omitted here for brevity — see m8-t2)`,
          pitfalls: [
            '**Caching a function that includes the full growing chat history as an argument.** The cache key changes every turn, so nothing ever actually hits the cache. Fix: cache single-question lookups (like a RAG/tool answer), not the whole multi-turn conversation.',
            '**Setting no rate limit at all "because it is just a demo."** A demo link posted publicly can still get hundreds of hits. Fix: add even a simple session-based counter before sharing widely.',
            '**Confusing Streamlit\'s cache with cost savings on genuinely unique questions.** Caching only helps for repeated/identical queries; novel questions still cost tokens every time. Fix: treat caching as a partial mitigation, not a cost eliminator.',
            '**Never checking the provider\'s billing dashboard after deploying.** Fix: check it a day or two after sharing a link the first few times, until you have a feel for typical usage.',
            '**Setting `ttl` so long that answers go stale for genuinely time-sensitive questions** (e.g. caching "what\'s today\'s date" for a week). Fix: pick a cache TTL appropriate to how often the true answer could change.',
            '**Rate-limiting by IP address in a way that is hard to implement correctly in Streamlit.** Fix: for this course\'s scope, per-session (`st.session_state`) limits are simpler and honest enough — do not over-engineer this.',
          ],
          tryIt:
            'Add `@st.cache_data(ttl=600)` to a small test function that just returns `f"Answer to: {q}"` with a `time.sleep(2)` inside it to simulate an API call; call it twice with the same input and confirm the second call returns instantly (no 2-second delay), proving the cache is working.',
          takeaway:
            'A public LLM app has an uncapped cost surface by default — cache repeated queries with `st.cache_data`, add a simple per-session call limit, and check your provider\'s usage dashboard after sharing a link.',
        },
        {
          id: 'm8-t8',
          title: 'Sharing the link and getting real feedback',
          explain:
            'Once the app is live, sharing it with a few real people (not just yourself) surfaces the gap between "works on the questions I tested" and "survives what a stranger actually types" — watch for confusing UX moments, questions the agent handles badly, and anything that looks broken to someone with zero context.',
          analogy:
            'You have tasted your own neer dosa recipe a dozen times while cooking it — of course it tastes right to you, you know exactly what you meant by every step. The real test is serving it to a guest who has never seen the recipe and watching their actual reaction, not the reaction you imagined. A deployed app you have only ever used yourself is still an untasted dish.',
          theory:
            'Every topic before this one has been about *building* correctly. This one is about *learning from use* — a distinct skill. Once Kundapura Sahayaka has a real URL, send it to two or three people (classmates, family, a coastal-Karnataka friend who would actually ask it real questions) and, critically, **watch or ask about their first few minutes without helping them.**\n\nThings to specifically watch for:\n- **Confusing entry points** — does a first-time visitor understand what to ask? (Consider a one-line `st.caption()` under the title suggesting example questions.)\n- **Silent failures** — does the UI show *something* (a spinner, a `st.status`, an error message) if a tool call or API call fails, or does it just look frozen?\n- **Out-of-scope questions** — someone will ask something totally unrelated to Kundapura ("write me a poem about space"). Does the agent handle it gracefully (politely redirect, or just answer if harmless) rather than breaking?\n- **Wrong or outdated answers** — does a real local correct a seva timing or a recipe detail your knowledge base got wrong? This is genuinely useful signal for improving the Module 4-5 knowledge base.\n- **Rate-limit hits** — did anyone actually bump into the session limit from the previous topic, and did the warning message make sense to them, or did it look like an error?\n\nCollect this feedback loosely — a running notes file, or just a mental list — because it directly feeds Module 9\'s capstone polish pass. The goal of this topic is not to fix everything immediately; it is to build the habit of treating "I shipped it" as the *start* of learning whether it actually works for someone else, not the finish line.',
          whyItMatters:
            'Shipping without ever watching a real person use the thing is one of the most common and costly mistakes beginners (and plenty of professionals) make — you optimize for the questions you already know work. Employers explicitly value people who close the loop between "deployed" and "actually good," and a short list of real feedback you acted on is a genuinely strong thing to mention when talking about this project.',
          steps: [
            'Send the deployed `*.streamlit.app` link to at least two or three people outside your own head — ideally including one person unfamiliar with the project.',
            'Ask them to try it without you explaining how, and watch (in person, on a call, or via screen-share) rather than only asking "did it work?" afterward.',
            'Note every moment of hesitation, confusion, or an unexpected/wrong answer, even small ones.',
            'Deliberately try a handful of off-topic and edge-case questions yourself too (nonsense input, a totally unrelated topic, an empty message).',
            'Add one small UX improvement based on real feedback (e.g. an `st.caption()` with example questions, or a friendlier error message).',
            'Keep a short running list of "known issues / would improve" — this feeds directly into Module 9.',
          ],
          code: `import streamlit as st

st.title("Kundapura Sahayaka")
st.caption(
    "Try asking: \\"What time is the evening seva at the Kundapura temple?\\", "
    "\\"How do I make kori rotti?\\", or \\"How do I get to Kollur by bus?\\""
)

# A friendlier fallback when something goes wrong, instead of a raw traceback:
try:
    reply = run_agent(st.session_state.messages)
except Exception as e:
    reply = "Sorry, something went wrong on my end — please try asking again in a moment."
    st.caption(f"(debug: {e})")  # remove or hide behind a debug flag before wide sharing`,
          pitfalls: [
            '**Only testing questions you already know the agent handles well.** You never discover the real failure modes. Fix: deliberately include off-topic and adversarial questions in your own testing too.',
            '**Explaining the app out loud while someone tests it.** It hides genuine UX confusion. Fix: let them read the screen and try, unprompted, before you say anything.',
            '**Treating "someone found a bug" as a bad outcome to be embarrassed about.** It is the entire point of this step. Fix: welcome it as the signal you deployed specifically to get.',
            '**Letting a raw Python traceback reach the user\'s screen on an API error.** It looks broken and unprofessional. Fix: wrap agent calls in `try/except` and show a plain-language fallback message.',
            '**Sharing the link extremely widely before basic feedback from a small group.** Fix: a small circle first, fix obvious issues, then a slightly wider share.',
            '**Forgetting to note down feedback anywhere and relying on memory.** Fix: keep even a rough running list — it becomes the Module 9 punch list.',
          ],
          tryIt:
            'Share your deployed link with one real person right now, ask them to try it without any explanation from you, and write down the very first question they typed and whether the app\'s reply made sense to them.',
          takeaway:
            'A deployed link is not the finish line — watching a real stranger use it, without hand-holding, surfaces the confusing moments and wrong answers that testing on yourself never will.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm8-p1',
      type: 'Project',
      title: 'Kundapura Sahayaka — Live',
      domain: 'Deployment',
      duration: '3-4 hrs',
      description:
        'Wrap the Module 7 tool-using agent in a Streamlit chat app, move the API key into `st.secrets`, push the project to a public GitHub repo with a correct `.gitignore`, and deploy it on Streamlit Community Cloud — ending this project with a real, public, shareable URL for Kundapura Sahayaka instead of a script that only runs on your own machine.',
      tools: ['Streamlit', 'Streamlit Community Cloud', 'GitHub'],
      blueprint: {
        overview:
          'This project does not add new agent capability — it takes everything built through Module 7 (system prompt, RAG-grounded answers, tool use for calculator/date/seva lookups) and gives it a face and an address. You build `app.py` as a thin Streamlit wrapper around your existing agent logic, with a proper chat UI and streaming replies; you move secrets out of code entirely; and you carry the whole project through a real GitHub-to-Streamlit-Cloud deployment so the finished artifact is a URL you can put in a resume or send to a friend, not a folder of scripts.',
        functionalRequirements: [
          'A working `app.py` with a Streamlit chat UI: message history persisted in `st.session_state`, rendered with `st.chat_message`, with input captured via `st.chat_input`.',
          'The Module 7 agent (system prompt + RAG retrieval + at least the calculator and seva/date lookup tools) is reused as-is via a function call from `app.py`, not rewritten.',
          'Assistant replies stream into the chat bubble token-by-token using `client.messages.stream()` and `st.write_stream`.',
          'The Anthropic API key is read exclusively via `st.secrets["ANTHROPIC_API_KEY"]`, with zero hardcoded keys anywhere in the committed code.',
          'A public GitHub repository contains the full project (`app.py`, agent/RAG code, `data/kb/` markdown docs, `requirements.txt`, `.gitignore`) with `.streamlit/secrets.toml` and `.env` correctly excluded and never present in git history.',
          'The app is deployed on Streamlit Community Cloud with secrets configured in the dashboard, reachable at a public `*.streamlit.app` URL that works in a fresh incognito browser window.',
          'At least a basic cost guardrail is present: either `@st.cache_data` on a repeated-query path, a simple per-session call limit, or both.',
        ],
        technicalImplementation: [
          'Structure the project so `app.py` imports and calls the existing Module 7 agent function(s) rather than duplicating agent logic inline in the Streamlit file.',
          'Initialize `st.session_state.messages` once, guarded by `if "messages" not in st.session_state`, seeded with a friendly greeting from the assistant.',
          'Implement a `stream_reply(messages)` generator around `client.messages.stream(...)` / `stream.text_stream`, consumed via `st.write_stream(...)` inside the `st.chat_message("assistant")` block.',
          'Keep `.streamlit/secrets.toml` for local development and add it (plus `.env`) to `.gitignore` before the very first `git add`/commit.',
          'Generate and trim `requirements.txt` (`pip freeze` then keep only real dependencies), and verify it in a fresh virtual environment before deploying.',
          'Connect the GitHub repo in the Streamlit Community Cloud dashboard, set `ANTHROPIC_API_KEY` in the app\'s Secrets settings, and deploy.',
          'Add a lightweight `try/except` around the agent call so an API error shows a plain-language `st.error`/fallback message instead of a raw traceback.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Build the Streamlit chat wrapper',
            outcome: 'An `app.py` with a working session-state chat UI that calls the existing Module 7 agent and shows a full back-and-forth conversation.',
            prompt:
              'Create `app.py` for a Streamlit app called "Kundapura Sahayaka". Initialize `st.session_state.messages` with one assistant greeting (guarded so it only runs once). Render the full message history with `st.chat_message`/`st.write`, capture new input with `st.chat_input("Ask about Kundapura...")`, and on new input call my existing `run_agent(messages)` function (import it from my Module 7 agent module rather than rewriting agent logic here) and append its reply to history. Do not wire streaming or secrets yet — just get the basic back-and-forth chat loop working end to end.',
          },
          {
            step: 2,
            label: 'Add streaming and move the key into st.secrets',
            outcome: 'Replies stream in token-by-token, and the API key is read exclusively from st.secrets with the real key file excluded from git.',
            prompt:
              'Modify `app.py` (and my agent code if needed) to replace the single blocking API call with a streaming version using `client.messages.stream(...)` and its `.text_stream`, rendered with `st.write_stream()` inside the assistant\'s `st.chat_message` block, making sure the fully concatenated reply still gets appended to `st.session_state.messages` afterward. Then create `.streamlit/secrets.toml` with `ANTHROPIC_API_KEY = "..."`, update the code to read the key via `st.secrets["ANTHROPIC_API_KEY"]` instead of any `.env`/`os.getenv` call, and give me the exact `.gitignore` entries to add so `.streamlit/secrets.toml` and `.env` are excluded before I make my first commit.',
          },
          {
            step: 3,
            label: 'Add a basic cost guardrail',
            outcome: 'A caching layer for repeated questions and/or a per-session call limit, so the deployed app cannot silently run up an unbounded API bill.',
            prompt:
              'Add at least one cost guardrail to `app.py`: wrap a single-question lookup path with `@st.cache_data(ttl=3600)` so identical repeated questions do not re-call the API, AND add a simple `st.session_state.call_count` limit (e.g. 20 calls per session) that shows a friendly `st.warning()` instead of calling the agent once the limit is hit. Explain in a short comment why the cache function should not take the full growing chat history as its argument.',
          },
          {
            step: 4,
            label: 'Prepare and push a clean GitHub repo',
            outcome: 'A public GitHub repository containing the full deployable project, with secrets verifiably excluded before the first commit.',
            prompt:
              'Give me the full checklist and exact commands to get this project onto a new public GitHub repository called `kundapura-sahayaka`: generating a trimmed `requirements.txt`, writing a complete `.gitignore` (covering `.streamlit/secrets.toml`, `.env`, `__pycache__/`, `.venv/`), verifying with `git status` that no secret file is staged before the first commit, then `git init`, `git add`, `git commit`, creating the GitHub repo, and pushing. Also tell me how to double-check, after pushing, that no secret ever appears anywhere in `git log -p`.',
          },
          {
            step: 5,
            label: 'Deploy on Streamlit Community Cloud and verify it publicly',
            outcome: 'A live, working *.streamlit.app URL, verified from a fresh incognito browser window, with secrets configured entirely through the dashboard.',
            prompt:
              'Walk me through deploying this pushed repo on Streamlit Community Cloud: signing in with GitHub, creating a new app pointed at my repo/branch/`app.py`, and exactly what to paste into the app\'s Secrets settings (matching my local `secrets.toml` key names). After it deploys, give me a short verification checklist to run in a fresh incognito window: does the greeting load, does a real question get a grounded (RAG-backed) answer, does a calculator/date tool question work, does streaming visibly show text appearing incrementally, and does hitting the session call limit show the friendly warning rather than an error.',
          },
        ],
        deliverable:
          'A public GitHub repository and a live public `*.streamlit.app` URL for Kundapura Sahayaka: a Streamlit chat app that streams grounded, tool-using answers, reads its API key exclusively from `st.secrets` (with the real secrets file never present in git history), and includes at least one working cost guardrail — verified end-to-end from a fresh incognito browser window.',
      },
    },
  ],
  quiz: [
    {
      id: 'm8-q1',
      q: 'Why does a chat app built with Streamlit need to store conversation history in `st.session_state` instead of a plain Python variable?',
      options: [
        'Plain Python variables cannot hold dictionaries',
        'Streamlit reruns the entire script on every interaction, so a plain variable would reset on the next message; st.session_state persists across reruns',
        'st.session_state is required for st.chat_input to appear on the page',
        'Plain variables are only allowed inside functions in Streamlit',
      ],
      answer: 1,
    },
    {
      id: 'm8-q2',
      q: 'What does `st.write_stream()` expect to receive in order to render a reply token-by-token?',
      options: [
        'The full response string returned by a non-streaming client.messages.create() call',
        'A generator/iterator that yields text chunks, such as one built around client.messages.stream() and its .text_stream',
        'A list of every past message in st.session_state',
        'The raw HTTP response object from the Anthropic API',
      ],
      answer: 1,
    },
    {
      id: 'm8-q3',
      q: 'What is the correct way to keep an Anthropic API key out of a Streamlit project\'s git history?',
      options: [
        'Hardcode it as a string in app.py since Streamlit apps are private by default',
        'Store it in .streamlit/secrets.toml, read it via st.secrets, and add that file to .gitignore before the first commit',
        'Base64-encode the key and commit it, since encoded text is not readable',
        'Email the key to yourself instead of storing it in any file',
      ],
      answer: 1,
    },
    {
      id: 'm8-q4',
      q: 'When deploying to Streamlit Community Cloud, where do you configure the app\'s secrets (like ANTHROPIC_API_KEY) for the live deployed version?',
      options: [
        'They are read automatically from the local .streamlit/secrets.toml file on your own laptop',
        'In the app\'s Secrets settings in the Streamlit Community Cloud dashboard, using the same key names your code reads via st.secrets',
        'They must be committed to the GitHub repo in a secrets.toml file for the cloud build to find them',
        'Streamlit Community Cloud does not support secrets; you must use Render instead',
      ],
      answer: 1,
    },
    {
      id: 'm8-q5',
      q: 'Why should a publicly deployed LLM app include a guardrail like @st.cache_data on repeated queries or a per-session call limit?',
      options: [
        'Because Streamlit apps crash if the same question is asked twice',
        'Because a public URL means anyone (or any bot) can trigger paid API calls, and without guardrails a widely shared link can produce an unexpectedly large bill',
        'Because the Anthropic API blocks apps that do not implement caching',
        'Because caching is required for st.chat_message to render correctly',
      ],
      answer: 1,
    },
  ],
}
