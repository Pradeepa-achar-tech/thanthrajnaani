// Module 9 — Capstone & Where To Go Next
// The final module of GenAI Fast-Track. Polishes and documents the deployed
// Kundapura Sahayaka (ಕುಂದಾಪುರ ಸಹಾಯಕ) into a genuine, linkable portfolio piece,
// then maps — honestly and without hand-waving — what this fast-track deliberately
// skipped (fine-tuning, evals, model internals) and where to go deeper next.

export const m9 = {
  id: 'm9',
  title: 'Capstone & Where To Go Next',
  hours: 6,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    'The wrap-up module. Take the **Kundapura Sahayaka** you have been building since Module 1 — a RAG-grounded, tool-using, publicly deployed agent — and turn it into a portfolio piece: a reliability pass on the knowledge base and prompts, a README a recruiter would actually read, and a short demo. Then a clear-eyed map of what this fast-track deliberately left out (fine-tuning, evals, model internals) and exactly where to go deeper next, including the site\'s own full **GenAI & ML** course.',
  sections: [
    {
      id: 'm9-s1',
      title: 'Polish the Capstone',
      topics: [
        {
          id: 'm9-t1',
          title:
            'Cleaning up the knowledge base and prompts for reliability — catching the rough edges found across Modules 5-8',
          explain:
            'Before calling Kundapura Sahayaka "done", do a deliberate reliability pass: fix contradictory or missing knowledge-base docs, tighten the system prompt so it never guesses beyond retrieved context, and re-test against every rough edge you noticed while building Modules 5-8.',
          analogy:
            'Picture the temple committee\'s accountant closing the year before the auditor arrives. She does not rewrite the whole register — she walks it page by page: two entries that disagree about the same donation get reconciled, a smudged number gets re-inked, a note that could be misread gets rewritten plainly. Kundapura Sahayaka needs the same closing pass: not a rebuild, a reconciliation. Every KB doc that quietly contradicted another, every prompt wording vague enough to let the model guess, gets fixed once, on purpose, before anyone else reads the book.',
          theory:
            'By Module 8 you likely noticed rough edges you did not stop to fix: two markdown docs in `data/kb/` that state slightly different seva timings, a recipe doc missing a dish someone asked about in testing, chunks that get split mid-sentence and retrieve awkwardly, or a system prompt that never explicitly says "if the answer is not in the provided context, say you don\'t know" — so the model politely fills the gap with a plausible-sounding guess instead of admitting it does not know.\n\nA reliability pass has four moves. First, **dedupe and reconcile the KB**: read every doc under `data/kb/`, merge or delete anything contradictory, and give each doc a one-line header so a retrieved chunk is self-contained even out of context. Second, **tighten the system prompt**: state explicitly that the assistant must answer only from retrieved context and tool results, and must say so plainly when it does not know — this single sentence eliminates most hallucination you will still see at this stage. Third, **review tool descriptions**: the agent from Modules 6-7 picks a tool based on its docstring/description; an ambiguous description causes wrong tool calls, so reread each one as if you had never seen the code. Fourth, **re-test against a fixed list**: collect every tricky question you remember asking since Module 5 (including out-of-scope ones like "what\'s the capital of France?") into one list, run it, and fix root causes rather than papering over symptoms.\n\nThis is a scoped pass, not a rewrite — the goal is confidence, not perfection.',
          whyItMatters:
            'This is what separates a demo from something you can hand to a stranger. A friend or interviewer will ask an edge-case question in the first thirty seconds — a shaky, hallucinating answer right there undermines every other good decision you made in Modules 1-8. A tight, honest "I don\'t know" is a better first impression than a wrong, confident guess.',
          steps: [
            'Re-read every markdown file in `data/kb/` and merge or delete duplicate/contradictory information.',
            'Add a short one-line header to each KB doc so a retrieved chunk stays self-contained.',
            'Tighten the system prompt: answer only from retrieved context/tool results, and say so plainly when the answer is not there.',
            'Reread every tool\'s docstring/description for ambiguity that could cause the agent to pick the wrong tool.',
            'Collect a fixed list of ~15 test questions from memory (all three KB domains, plus a few out-of-scope ones) and run every one.',
            'Fix the specific KB gap or prompt wording behind each failure, then re-run the whole list to confirm no regressions.',
          ],
          code: `# regression_check.py — a tiny, honest reliability script.
# Not part of the shipped app; run it manually before you call the capstone "done".

import os
from anthropic import Anthropic
# reuse whatever answer(question) function your app already exposes,
# e.g. from app import answer

TEST_QUESTIONS = [
    "What time is the evening seva at the main temple?",
    "How do I make neer dosa?",
    "Is there a ferry to Gangolli during the monsoon?",
    "How many days until the next festival?",          # should trigger the date tool
    "What's the capital of France?",                    # out-of-scope: should decline
]

def run_regression():
    for q in TEST_QUESTIONS:
        result = answer(q)  # your existing RAG/agent entry point
        print(f"Q: {q}\\nA: {result}\\n{'-' * 40}")

if __name__ == "__main__":
    run_regression()`,
          pitfalls: [
            '**Rewriting the whole app instead of doing a scoped pass.** This module has 6 hours, not 60 — reconcile, don\'t rebuild.',
            '**Fixing the prompt but never re-testing.** An untested fix is a guess; always re-run the full question list after each change.',
            '**Adding vague meta-instructions like "be more helpful."** They do nothing for reliability — be specific about what "grounded" means.',
            '**Deleting a KB doc without checking what it was the only source for.** Read what depends on it before removing it.',
            '**Only testing happy-path questions.** Adversarial and out-of-scope questions are exactly what a stranger will ask first.',
            '**Letting the system prompt balloon.** A wall of caveats drowns the actual task instructions — keep additions short and specific.',
          ],
          tryIt:
            'Write down 10 questions spanning all three KB domains (seva timings, recipes, travel) plus 3 deliberately out-of-scope questions, run all 13 through the app, and fix whatever breaks before moving on.',
          takeaway:
            'A short, deliberate reliability pass — reconcile the KB, tighten the prompt, retest a fixed question list — is what turns a working demo into something you can confidently hand to someone else.',
        },
        {
          id: 'm9-t2',
          title:
            "Writing a README that explains what the app does, how it's built, and how to run it — the document a recruiter or friend would actually read",
          explain:
            'A README.md is the front door of the repo. For the capstone it needs to answer three questions in under two minutes: what does this do, how is it built, and how do I run it — with a screenshot near the top and copy-pasteable run steps.',
          analogy:
            'Think of the noticeboard outside a post office window: a visitor glances at it for five seconds before deciding whether to step inside. It does not reproduce the entire postal manual — it says what the window offers and where to stand in line. Your README is that noticeboard for the repo: a recruiter skimming it for ninety seconds should walk away knowing exactly what Kundapura Sahayaka is, and a friend who wants to actually run it should find the exact steps without needing to ask you a single question.',
          theory:
            'A strong README for this capstone has, in order: a **title and one-line pitch** ("Kundapura Sahayaka — a RAG-grounded, tool-using assistant for coastal-Karnataka seva timings, recipes, and travel, built with Claude"); a **screenshot or GIF** right under it, because a wall of text gets skimmed past; a **"What it does"** section as 3-5 bullets describing real capabilities (grounded Q&A over a local knowledge base, tool calls for dates/calculations, publicly deployed); a **"How it\'s built"** section naming the actual architecture — Streamlit UI, a LangChain-based RAG chain over a vector store, Claude via the `anthropic` Python SDK, a small tool-using agent loop; a **tech stack** bullet list naming only what is actually used, not everything ever installed; a **"Run locally"** section with exact, copy-pasteable steps (clone, virtual environment, `pip install -r requirements.txt`, set `ANTHROPIC_API_KEY` in `.env`, `streamlit run app.py`); and a **live demo link** plus the GitHub repo link, both near the top, not buried at the bottom.\n\nWrite for two specific readers at once: a recruiter who will read for ninety seconds and decide whether to click the live link, and a friend who will actually try to run it on their own machine. A closing "what I\'d do next" line signals a growth mindset without apologizing for what the app is not.',
          whyItMatters:
            'A recruiter often spends only seconds on a repo before deciding whether to open the live link — the README is frequently the *only* code artifact of yours they actually read. A clear, accurate one is doing real work for you even while you sleep.',
          steps: [
            'Write a one-line pitch directly under the title: what it is and who it is for.',
            'Add a screenshot or GIF of the live app near the top, before any long prose.',
            'Write "What it does" as 3-5 bullets naming real capabilities (RAG, tools, deployment).',
            'Write "How it\'s built" naming the actual libraries: Streamlit, LangChain, the `anthropic` SDK, your vector store.',
            'Write exact "Run locally" steps someone could copy-paste and have running in five minutes, including the `.env` variable name.',
            'Put the live Streamlit URL and the GitHub repo link near the top, not the bottom.',
          ],
          code: `# Kundapura Sahayaka (ಕುಂದಾಪುರ ಸಹಾಯಕ)

A RAG-grounded, tool-using assistant for coastal-Karnataka temple seva timings,
local recipes, and travel notes — built end-to-end with Claude.

**[Live demo](https://your-app.streamlit.app)** · **[GitHub repo](https://github.com/you/kundapura-sahayaka)**

![demo](docs/demo.gif)

## What it does
- Answers grounded questions from a local knowledge base (seva timings, recipes, travel)
- Declines out-of-scope questions instead of guessing
- Uses tools for date/seva lookups and simple calculations
- Deployed publicly on Streamlit Community Cloud

## How it's built
- **UI:** Streamlit
- **RAG:** LangChain + \`langchain-text-splitters\` over a small local vector store (FAISS)
- **LLM:** Claude via the \`anthropic\` Python SDK
- **Agent:** a small tool-using loop (calculator, date/seva lookup, RAG-as-a-tool)

## Run locally
\`\`\`bash
git clone https://github.com/you/kundapura-sahayaka
cd kundapura-sahayaka
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add your ANTHROPIC_API_KEY
streamlit run app.py
\`\`\`

## What I'd do next
Add a formal eval suite and try LangGraph for a second, specialized agent.`,
          pitfalls: [
            '**Burying the live demo link at the bottom.** Put it directly under the title, not after a wall of prose.',
            '**Copy-pasting a generic tutorial README.** It should describe this specific app, not a template that could be anyone\'s.',
            '**Listing every library ever installed.** Name only what the shipped app actually uses.',
            '**Stale run steps.** Forgetting the `.env` step is the single most common way a README fails a fresh clone — test it.',
            '**No screenshot or GIF.** Text-only READMEs get skimmed past in seconds; a picture is what stops the scroll.',
            '**Diary-style first-person prose.** Write it as clear reference documentation, not a personal journal entry.',
          ],
          tryIt:
            'Have a friend (or yourself, cold, the next morning) follow only the "Run locally" section on a clean clone, and time how long it takes them to see the app running. Fix whatever trips them up.',
          takeaway:
            'Write the README for a skimming recruiter and a friend who wants to run the app — one-line pitch, screenshot, real architecture, and copy-pasteable run steps, in that order.',
        },
        {
          id: 'm9-t3',
          title:
            "Recording a short demo walkthrough (screen recording or GIF) and where to share it (GitHub repo, LinkedIn, portfolio site)",
          explain:
            'A 60-90 second screen recording or GIF showing the app answer a few real questions is often more persuasive than any amount of README text — record it, compress it, embed it in the README, and share it once on LinkedIn.',
          analogy:
            'A fish-market stall owner does not hand a customer a leaflet describing how fresh the kane fish is — she lets them see it, ask the price, watch it get weighed. A demo GIF is that same live proof for your app: it shows Kundapura Sahayaka actually answering, in front of the reader, without them installing anything. That proof does more convincing in ninety seconds than a paragraph of description ever could.',
          theory:
            'Keep the recording short and honest: 60-90 seconds, showing 2-3 realistic questions across at least two knowledge-base domains, plus one question that clearly triggers a tool call (for example, "how many days until the next festival?" triggering the date tool). Free tools are enough — Windows\'s built-in Xbox Game Bar (`Win+G`), OBS Studio, or a dedicated GIF recorder like ScreenToGif. Trim dead air and typos before exporting.\n\nExport two versions: a compressed **GIF under 10MB** so it renders directly and quickly inside a GitHub README (`![demo](docs/demo.gif)`), and a slightly higher-quality **mp4** for LinkedIn, where video plays natively and looks sharper. `ffmpeg` compresses a screen recording into a small GIF in one command if a dedicated GIF tool is not available.\n\nWhere to put it matters as much as recording it: embed the GIF near the top of the README (Topic m9-t2), and publish it in exactly one more place — a short LinkedIn post describing what you built, the stack used, and a link to both the live app and the repo, or a project entry on your own portfolio site. A demo that only exists on your hard drive does no career work at all.',
          whyItMatters:
            'A GIF embedded in the README proves the app works without anyone needing to install a thing, and a short LinkedIn post is genuinely how small solo projects like this one get seen by the people who might actually hire you — most polished code with zero visibility gets zero credit.',
          steps: [
            'Script 2-3 realistic questions to demo, covering at least two KB domains plus one tool-triggering question.',
            'Record a 60-90 second screen capture running through them on the live, deployed app.',
            'Trim dead air and mistakes with a simple editor or ScreenToGif\'s built-in trimmer.',
            'Export a compressed GIF under 10MB for the README and an mp4 for LinkedIn.',
            'Embed the GIF near the top of README.md with `![demo](docs/demo.gif)`.',
            'Write a short LinkedIn post (what you built, the stack, a link) and attach the mp4 or GIF; publish it once.',
          ],
          code: `# Compress a screen recording into a small, GitHub-friendly GIF with ffmpeg.
# (Only needed if your recording tool didn't export a GIF directly.)

ffmpeg -i demo-raw.mp4 -vf "fps=12,scale=800:-1:flags=lanczos" -c:v gif docs/demo.gif

# Check the size before committing — aim under 10MB so it renders quickly on GitHub:
ls -lh docs/demo.gif`,
          pitfalls: [
            '**Recording a long, unedited five-minute video.** Nobody watches past the first thirty seconds — trim ruthlessly.',
            '**Demoing only the happy path and hiding known rough edges.** It reads as dishonest the moment someone tries it themselves.',
            '**A GIF too large to render well on GitHub.** Compress it — under roughly 10MB, lower frame rate and resolution if needed.',
            '**Showing an API key or terminal secret on screen.** Close or blur any terminal panes with `.env` values before recording.',
            '**Posting the demo with no caption or context.** A video with no explanation of what it is gets scrolled past.',
            '**Never actually publishing it anywhere.** A demo that stays on your hard drive is career-invisible — share it at least once.',
          ],
          tryIt:
            'Record the walkthrough, compress it to a GIF under 10MB, embed it in the README, and publish one LinkedIn post linking the live app and the repo.',
          takeaway:
            'A short, honest demo GIF embedded in the README, shared once on LinkedIn, does more for your portfolio than another week spent polishing code nobody will ever see.',
        },
      ],
    },
    {
      id: 'm9-s2',
      title: 'Beyond the Fast Track',
      topics: [
        {
          id: 'm9-t4',
          title:
            "What this fast-track deliberately skipped: fine-tuning, evals, and model internals — and when you'd actually need them (contrast with the site's own deeper \"GenAI & ML\" course)",
          explain:
            'This course deliberately skipped three deep areas — fine-tuning, formal evals, and model internals — to get you shipping fast. Naming each one precisely, and knowing the exact trigger for when you would need it, is more valuable than pretending to have covered everything.',
          analogy:
            'A cook who can run a busy cafe counter — plate fast, season by taste, keep the queue moving — does not necessarily know how to breed a new variety of rice, and does not need to for the counter to run well. Knowing that plant breeding exists, roughly what problem it solves, and that it is a different, deeper craft than cooking is exactly the right amount of awareness. This course made you the cook. Fine-tuning, evals, and model internals are the plant breeding — real, valuable, and deliberately not what these nine modules taught.',
          theory:
            '**Fine-tuning** means further training a model\'s own weights on your examples, changing its behavior rather than just its knowledge. This course skipped it because RAG (Modules 4-5) already solves "give the model my data" without touching any weights. You would reach for fine-tuning when you need a consistent style or output format at large scale, want a smaller/cheaper model to match a bigger one\'s behavior on a narrow task, or need behavior that no amount of prompting reliably produces — covered in depth as a decision framework next (Topic m9-t5).\n\n**Evals** are structured, repeatable measurement of an LLM app\'s quality — beyond the manual, ad hoc regression list you ran in Topic m9-t1. Real eval frameworks track datasets of test cases, score outputs (often with another LLM as judge — Topic m9-t6), and run automatically on every change, so a team can tell whether a prompt tweak made things better or worse without guessing. This course skipped formal evals because a solo, single-developer capstone does not yet have the scale or team-collaboration need that justifies the setup.\n\n**Model internals** — how transformers and attention actually work, how models are trained, tokenization at a mathematical level, scaling laws — were skipped entirely. This course used the model as a capable, well-documented black box reached through an API, which is exactly how the large majority of real-world GenAI engineering jobs use it too.\n\nNone of this is a deficiency in what you built — it is a deliberate scope choice. If any of these three areas genuinely interests you, the site\'s own **GenAI & ML** course (8 modules, ~80 hours, PyTorch and transformers from first principles) is where that depth lives.',
          whyItMatters:
            'Knowing precisely what you do *not* know is a mark of seniority, not weakness. "I used RAG and prompting to solve this, and I know fine-tuning/evals/internals are the next layer — here is the exact trigger for reaching for each" is a stronger interview answer than vaguely claiming to have covered everything.',
          steps: [
            'Name the three skipped areas: fine-tuning, formal evals, and model internals.',
            'State a one-line definition of each: weight-training, structured quality measurement, and how transformers work.',
            'For each, name one concrete scenario where you would actually need it.',
            'Contrast the ad hoc regression script from Topic m9-t1 with what a real eval framework adds: automation, datasets, scoring at scale.',
            'Note that model internals were skipped entirely — the model was used as a documented black box via API.',
            'Point yourself at the site\'s "GenAI & ML" course as the deeper path for whichever of the three interests you most.',
          ],
          code: `Fast-Track (this course, ~60h)         Full "GenAI & ML" course (~80h)
----------------------------------     ----------------------------------
Prompting + RAG + tool-using agent     + fine-tuning your own model
Model used via API, as a black box     + transformer/attention internals
Manual regression testing              + formal eval frameworks/datasets
Ship a deployed app fast               Understand the model from first principles

# Neither is "better" — they optimize for different goals.
# This course chose: ship a real, working app fast.`,
          pitfalls: [
            '**Assuming RAG and fine-tuning are interchangeable.** They solve different problems — knowledge gap vs. behavior gap.',
            '**Believing you must learn transformer internals before building anything useful.** This entire nine-module course proves otherwise.',
            '**Skipping evals forever "because the course did."** Fine for a solo hobby project, risky once others depend on the app or a team ships changes.',
            '**Confusing "prompting/RAG only" with "not real engineering."** Most production LLM applications in industry are exactly this.',
            '**Not knowing where to go when you do hit fine-tuning/evals territory.** Name the site\'s "GenAI & ML" course now so it is not a cold search later.',
            '**Conflating evals with plain unit tests.** Evals also grade fuzzy quality — relevance, tone, groundedness — not just pass/fail correctness.',
          ],
          tryIt:
            'Write three sentences: one describing a project where prompting + RAG (what this course taught) is clearly enough, one where you would reach for fine-tuning, and one where you would need a formal eval suite before shipping.',
          takeaway:
            'Fine-tuning, evals, and model internals were deliberately out of scope so you could ship fast — know the one-line trigger for each, and that the site\'s full GenAI & ML course is where to go when you actually meet that need.',
        },
        {
          id: 'm9-t5',
          title:
            'Fine-tuning vs RAG vs prompting — a decision framework for picking the right tool for a NEW problem you meet after this course',
          explain:
            'When you meet a new LLM problem after this course, work through three questions in order — can a better prompt solve it, does the model lack knowledge (RAG), or does it need different behavior at scale (fine-tuning) — and stop at the first one that fits.',
          analogy:
            'Imagine three ways to get a new employee at the Kundapura post office to handle a task correctly. Cheapest: just explain it better — clearer instructions, a worked example taped to the counter (prompting). If that is not enough because they are missing information that changes daily, hand them today\'s updated notice board to check before answering (RAG — the information changes, not the person). Only if neither works, because the *way* they need to behave has to change fundamentally and consistently, do you send them for real retraining (fine-tuning) — the most expensive, slowest option, reserved for when the first two genuinely cannot get there.',
          theory:
            'The framework has three ordered questions, cheapest and fastest first.\n\n**1. Can a better prompt alone solve it?** Clearer instructions, a stricter role, a few well-chosen examples (few-shot), or an explicit output format often fix a problem with zero infrastructure and zero delay. This was most of Module 3\'s work. Always try this first — a surprising number of "surely needs something fancier" problems turn out not to.\n\n**2. Does the model lack knowledge it needs — facts that are specific, large, or that change over time?** That is a job for RAG (Modules 4-5): keep the model\'s weights untouched, and update its effective knowledge by updating what gets retrieved and injected into context. RAG fixes a *knowledge* gap, not a *behavior* gap — it cannot make a model consistently follow a strict output format or change its underlying tone; only more explicit prompting, or fine-tuning, can do that.\n\n**3. Does the model need a genuinely different, consistent behavior or format, at real scale, that no amount of prompting reliably produces?** That is when fine-tuning earns its cost: it requires a real labeled training dataset, a training run, and — critically — an eval to measure whether it actually helped, and it is worth it when the behavior needs to be rock-solid across millions of calls, or when a smaller/cheaper fine-tuned model can match a bigger general model\'s output on one narrow task cheaply at scale.\n\nThese approaches compose rather than compete — a fine-tuned model can still do RAG, and a RAG app still benefits from careful prompting. Mapped onto Kundapura Sahayaka: prompting fixed tone and format issues in Module 3; RAG added local, changing knowledge in Modules 4-5; if you someday needed the bot to always emit a strict JSON schema, correctly, at huge call volume on a cheap model — that is a genuine fine-tuning candidate.',
          whyItMatters:
            '"Would you fine-tune or use RAG here?" is now a common, practical GenAI interview and real-world question. Picking the cheapest option that actually solves the problem first — rather than reaching for the most impressive-sounding tool — is the pragmatic habit that marks real experience, not a beginner shortcut.',
          steps: [
            'Ask: can a clearer prompt (better instructions, few-shot examples, explicit format) solve this alone? If yes, stop here.',
            'Ask: does the model need facts or knowledge it lacks, or that changes over time? If yes, reach for RAG.',
            'Ask: does the model need a genuinely different, consistent behavior or format, at scale, that no prompt reliably produces? If yes, consider fine-tuning.',
            'Check whether call frequency and cost actually justify fine-tuning\'s data-collection and training overhead.',
            'Remember these compose — a fine-tuned model can still retrieve; a RAG app still benefits from a tight prompt.',
            'Build the prompting/RAG version first and re-check the decision — many "surely needs fine-tuning" problems turn out not to.',
          ],
          code: `# A quick mental checklist for a NEW problem you meet after this course.

def pick_approach(problem):
    if "a clearer prompt / better examples would fix this":
        return "Prompting — cheapest, fastest, try this first"
    if "the model is missing facts, or facts that change over time":
        return "RAG — ground it in retrieval, leave the weights alone"
    if "the model needs different, consistent BEHAVIOR at real scale":
        return "Fine-tuning — but budget for labeled data + an eval"
    return "Re-read the problem — it's probably still prompting or RAG"

# Kundapura Sahayaka, mapped:
# Module 3 tone/format fixes         -> Prompting
# Module 4-5 local knowledge         -> RAG
# (hypothetical) strict JSON output,
#   millions of calls/day, cheap model -> Fine-tuning`,
          pitfalls: [
            '**Reaching for fine-tuning first because it sounds more advanced.** It is usually the wrong, most expensive first move.',
            '**Using RAG to try to fix a formatting or tone problem.** RAG only adds knowledge — it does not change behavior; that is a prompting or fine-tuning job.',
            '**Fine-tuning without an eval to measure whether it actually helped.** Without measurement you cannot tell improvement from drift.',
            '**Forgetting fine-tuning needs a real labeled dataset**, not a handful of hand-picked examples.',
            '**Assuming RAG can fix tone or style.** It cannot — it only changes what the model knows, not how it speaks.',
            '**Not revisiting the decision as scale changes.** Fine on prompting at 10 calls/day may genuinely need fine-tuning at 10 million calls/day for cost reasons.',
          ],
          tryIt:
            'Take this hypothetical: "auto-tag support tickets into one of 12 fixed categories, 50,000 tickets a day, as cheaply as possible." Walk it through the three questions to a recommendation, and write 2-3 sentences justifying the choice.',
          takeaway:
            'Try prompting first, reach for RAG when the gap is knowledge, and reach for fine-tuning only when the gap is behavior at real scale that no prompt fixes — in that order, every time.',
        },
        {
          id: 'm9-t6',
          title:
            'Multi-agent systems, evaluation frameworks (e.g. simple LLM-as-judge scoring), and observability/tracing — a map of what\'s next, at a glance, not a deep dive',
          explain:
            'A birds-eye map — not a deep dive — of three topics you will meet once an app grows past a solo project: multiple coordinating agents, formal ways to score output quality, and tools for seeing what actually happened inside a production request.',
          analogy:
            'The single agent you built in Modules 6-7 is one experienced counter clerk who can also fetch a file or run a calculation when needed — enough for one busy counter. A **multi-agent system** is the whole post office once it grows: a sorting clerk, a delivery coordinator, a complaints desk, each specialized, handing work to each other. **Evals** are the manager doing spot-quality-checks on outgoing mail on a schedule, with a scorecard, instead of only noticing a mistake when a customer complains. **Observability** is the office\'s logbook of every parcel\'s journey — when it arrived, who handled it, how long it took — so a problem can be traced back to exactly where it happened.',
          theory:
            '**Multi-agent systems** move beyond one agent with several tools (Kundapura Sahayaka\'s pattern from Modules 6-7) to multiple specialized agents that coordinate or hand off work — a "planner" delegating to a "researcher" and a "writer", for instance. They earn their complexity once a single agent\'s tool list or context grows unwieldy, or distinct roles genuinely benefit from separate prompts and context. The natural next framework to search for, given this course already used LangChain, is **LangGraph** (from the LangChain team, for building stateful multi-agent graphs); CrewAI is another common option, and Anthropic publishes its own guidance on building multi-agent research systems.\n\n**Evaluation frameworks** formalize what Topic m9-t1\'s manual regression list did by hand. The simplest form is **LLM-as-judge**: a second LLM call scores a response against a written rubric (for example, "Is this answer grounded in the provided context? Score 1-5"), so quality can be measured at scale instead of eyeballed. Concrete tools to search for when ready: **promptfoo** (config-driven prompt testing), **LangSmith** (LangChain\'s own evaluation and dataset tracking), and **Braintrust**.\n\n**Observability and tracing** matter once an app has real usage: you want to see the full trace of a request — which chunks were retrieved, which tool fired, tokens used, latency, cost — to debug failures and catch regressions before a user reports them. **LangSmith** and the open-source **Langfuse** are the common tools here; even without adopting either, the Anthropic Console already gives basic request/usage visibility today.\n\nThe goal of this topic is recognition, not mastery: knowing the map is what lets you search for the right term the day you actually need it.',
          whyItMatters:
            'Recognizing these terms and roughly what problem each solves lets you hold your own in a team conversation about scaling an LLM app past a solo project, even before you have hands-on experience — and knowing the map is the fastest route to the right search query the day the need actually arrives.',
          steps: [
            'Name multi-agent systems and the problem they solve: specialization and coordination beyond one agent\'s tool list.',
            'Note LangGraph as the natural next framework, given this course already used LangChain.',
            'Name eval frameworks and their simplest form: LLM-as-judge scoring against a written rubric.',
            'Note promptfoo and LangSmith as concrete tools to search for when the need arises.',
            'Name observability/tracing and the problem it solves: seeing what actually happened inside a live request.',
            'Note LangSmith and Langfuse as concrete tools, and that the Anthropic Console already offers basic usage visibility today.',
          ],
          code: `# A SKETCH of the shape of an LLM-as-judge check — not part of the shipped app.
# Real eval frameworks (promptfoo, LangSmith) automate exactly this, at scale.

from anthropic import Anthropic

client = Anthropic()

def judge(question: str, answer: str, context: str) -> int:
    rubric = (
        "Score the ANSWER from 1-5 on whether it is fully grounded in the "
        "given CONTEXT and does not invent facts. Reply with only the number."
    )
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=5,
        messages=[{
            "role": "user",
            "content": f"{rubric}\\n\\nQUESTION: {question}\\nCONTEXT: {context}\\nANSWER: {answer}",
        }],
    )
    return int(response.content[0].text.strip())`,
          pitfalls: [
            '**Adopting a multi-agent framework before a single, well-scoped agent even needs it.** The Module 6-7 agent is enough for most solo projects.',
            '**Treating LLM-as-judge scores as ground truth.** Spot-check them occasionally against your own judgment — the judge model can be wrong too.',
            '**Assuming observability tools are only for large companies.** Even a small project benefits once it has any real users beyond you.',
            '**Confusing evals with unit tests.** Evals grade fuzzy quality — relevance, tone, groundedness — not just pass/fail correctness.',
            '**Adding tracing infrastructure to a project with no traffic to justify it.** The setup cost should match the actual need.',
            '**Trying to learn all three at once.** Pick the one your very next project actually needs, and learn that one first.',
          ],
          tryIt:
            'In a comment or short paragraph — no need to run anything — sketch what a single LLM-as-judge check would look like for one real Kundapura Sahayaka question: the rubric you would score it against, and what a "5" versus a "2" answer would look like.',
          takeaway:
            'Multi-agent systems, eval frameworks, and observability/tracing are the natural next layer once an app has scale or real users — know what problem each solves so you know exactly what to search for when that day comes.',
        },
        {
          id: 'm9-t7',
          title:
            'Where to keep learning: official provider docs (as the most current source), the LangChain docs, and picking one small project a month to keep building',
          explain:
            'This field moves fast enough that tutorials age within months — trust official provider docs and the LangChain docs as your current source of truth, and keep momentum with one small, fully-shipped project a month.',
          analogy:
            'A fisherman heading out from Gangolli does not trust a chart printed five years ago over the harbor master\'s notice posted this morning — sandbanks shift, routes change, and the current notice is the one that keeps the boat safe. Provider docs and changelogs are that morning notice for GenAI: models, pricing, and best practices shift every few months, and yesterday\'s blog post is yesterday\'s sandbank chart.',
          theory:
            'The single most reliable source for anything Claude-specific is the **Anthropic docs** (`docs.anthropic.com`) — the Messages API reference, model IDs and capabilities, and prompting guides — alongside the **Anthropic Cookbook** on GitHub, which has real, runnable worked examples that stay far more current than most third-party tutorials. OpenAI, Groq, and other providers maintain the equivalent for their own models. For the RAG and agent-tooling layer this course used, the **LangChain Python docs** (`python.langchain.com`) remain the reference for loaders, splitters, retrievers, and LangGraph as the ecosystem evolves.\n\nSecond habit, just as important as the first: pick **one small project a month**, scoped tightly enough to finish in a weekend, that deliberately stretches exactly one new skill — swap the knowledge base for a real dataset in your own field, try a different vector store, attempt a two-agent handoff in LangGraph, or run an LLM-as-judge check over last month\'s project. Small, *finished* projects compound faster than one large, perpetually unfinished one, and — following the same habit as this capstone module — each one becomes another README and another demo, i.e. another portfolio piece.\n\nTreat provider release notes and changelogs as routine reading, the way you would check a notice board, rather than trusting whatever a social media post claims months after a model or API has already changed.',
          whyItMatters:
            'In a field that changes every few months, "knowing how to find the current answer" is worth more than any single fact memorized today. This habit — docs first, one small shipped project a month — is what keeps your skills from going stale six months after finishing this course.',
          steps: [
            'Bookmark the Anthropic docs and the Anthropic Cookbook as your first stop for anything Claude-specific.',
            'Bookmark the LangChain Python docs for anything RAG or agent-tooling related.',
            'Skim each provider\'s release notes or changelog occasionally, rather than trusting aging blog posts.',
            'Pick one small, weekend-scoped project idea for next month that stretches exactly one new skill.',
            'Finish and ship it — README plus demo, the same habit as this capstone — before starting the next one.',
            'Repeat monthly: treat each small project as another portfolio piece, not a one-off exercise.',
          ],
          code: `Bookmarks to keep close (most current source first):
- docs.anthropic.com              — Claude API reference, models, prompting guides
- github.com/anthropics/anthropic-cookbook — real, runnable worked examples
- python.langchain.com            — RAG/agent tooling reference (loaders, retrievers, LangGraph)

One-a-month project template (fill this in, then ship it):
  Builds:          ____________________
  Stretches skill: ____________________
  Ships by:        one weekend, README + demo GIF, same as this capstone`,
          pitfalls: [
            '**Learning primarily from social media threads.** They go stale or were wrong within months — verify against official docs.',
            '**Reading an entire framework\'s docs cover to cover.** Read the specific page for the task in front of you, not the whole manual.',
            '**Picking a next project too big to finish.** An unshipped project breaks the compounding habit entirely — keep it weekend-sized.',
            '**Repeating the same skill every month.** Each project should stretch exactly one new thing, or the habit stops teaching you anything.',
            '**Ignoring provider changelogs.** Getting surprised by a deprecated model or parameter is avoidable with a five-minute skim.',
            '**Practicing without ever publishing.** The compounding career value is in the shared portfolio piece, not the private practice.',
          ],
          tryIt:
            'Right now, write down one concrete small-project idea for next month — one sentence for what it builds and the one new skill it stretches — and bookmark the Anthropic docs, the Anthropic Cookbook, and the LangChain Python docs.',
          takeaway:
            'Trust official provider docs and the LangChain docs over aging tutorials, and keep momentum with one small, fully-shipped project a month.',
        },
        {
          id: 'm9-t8',
          title:
            'A final honest checklist: what a learner who finished this course can now confidently do, and what they should say "I\'m still learning" to',
          explain:
            'Close the course with an honest self-assessment: a concrete list of what you can now confidently claim, and — without embarrassment — the fine-tuning/evals/internals layer you should still say "I\'m still learning" to.',
          analogy:
            'A cook who has run a busy cafe counter for months can honestly say: I can plate fast, season by taste, keep a queue moving, and recover gracefully from a wrong order. They can just as honestly say: I have not yet run a kitchen\'s supply chain, or bred a new variety of rice. Neither statement is a weakness — together they are simply an accurate map of real experience, and that map is far more useful to a future employer than a vague claim of knowing everything.',
          theory:
            'Having built Kundapura Sahayaka from Module 0 to here, you can now confidently claim: setting up a Python environment and calling an LLM API directly with the `anthropic` SDK; writing and iterating on system prompts, including few-shot and structured-output techniques; explaining *why* an ungrounded chatbot hallucinates and fixing it with RAG — chunking, embeddings, a vector store, retrieval; building a tool-using agent that decides when to call a function versus answer directly; wiring a small multi-step app together end to end (RAG plus tools plus a chat loop); deploying a Streamlit app publicly and managing secrets through deployment environment variables rather than hardcoding them; writing a portfolio-quality README and shipping a demo; and reasoning through the fine-tuning-vs-RAG-vs-prompting decision framework for a new problem.\n\nYou should still honestly say "I\'m still learning" to: training or fine-tuning a model yourself; running formal, eval-driven development at scale; multi-agent orchestration frameworks like LangGraph or CrewAI, hands-on; observability and tracing tooling in a live production system; the underlying math and architecture of transformers — attention, backpropagation, scaling laws — which is exactly what the site\'s own **GenAI & ML** course covers in depth; and real production concerns at scale, such as cost optimization across millions of calls, rate limiting, and multi-tenant abuse/safety filtering.\n\nThe useful, interview-ready version of this sounds like: "I\'ve built and deployed a RAG-and-agent app end to end; I haven\'t yet needed fine-tuning or formal evals in production, but I know exactly when I\'d reach for each." That sentence is the real, practical payoff of the entire fast-track — say it, then close the course.',
          whyItMatters:
            'This closing self-assessment is the practical payoff of the whole fast-track — a concrete, honest inventory of skills is more useful, and more credible in an interview, than vague confidence, and it is the last thing you should carry with you as you finish the course.',
          steps: [
            'Re-read the "can confidently do" and "still learning" lists against your own actual experience building Kundapura Sahayaka.',
            'Add or cross out anything that does not honestly match what you personally practiced.',
            'Rehearse a 30-second spoken version: "I can... I haven\'t yet... but I know when I\'d reach for it."',
            'Add a short version of this self-assessment to the README\'s closing section or a LinkedIn post.',
            'Pick the one or two "still learning" items that interest you most as candidates for next month\'s small project (Topic m9-t7).',
            'Ship the capstone, then close the course.',
          ],
          code: `## What I can confidently do
- [x] Call Claude directly via the anthropic Python SDK and iterate on system prompts
- [x] Explain why an ungrounded chatbot hallucinates, and fix it with RAG
- [x] Build a tool-using agent that decides when to call a function vs. answer directly
- [x] Deploy a Streamlit app publicly with secrets managed via env vars
- [x] Write a portfolio-quality README and ship a demo
- [x] Reason through fine-tuning vs. RAG vs. prompting for a new problem

## What I'm still learning
- [ ] Fine-tuning a model myself
- [ ] Formal, eval-driven development at scale
- [ ] Multi-agent orchestration frameworks (LangGraph, CrewAI), hands-on
- [ ] Observability/tracing in a live production system
- [ ] Transformer internals and scaling laws (-> the site's "GenAI & ML" course)
- [ ] Production-scale cost, rate-limiting, and safety concerns`,
          pitfalls: [
            '**Overclaiming skills not actually practiced hands-on.** Reading one topic about fine-tuning is not "fine-tuning experience" — be precise.',
            '**Underclaiming out of imposter syndrome.** RAG, agents, and deployment are real, demonstrable, hireable skills — claim them plainly.',
            '**Treating the "still learning" list as a blocker.** It is not a to-do list the capstone waits on — ship now, keep learning after.',
            '**Never revisiting the checklist as skills genuinely grow.** Update it honestly every few months rather than writing it once and forgetting it.',
            '**Keeping the checklist private.** Turn it into README or LinkedIn language that actually helps you get noticed.',
            '**Confusing "I built an app that uses X" with "I deeply understand X."** Be ready to explain the difference precisely if asked a follow-up.',
          ],
          tryIt:
            'Write your own honest, one-paragraph version of this checklist in your own words, then paste it into the README\'s closing section or a LinkedIn post — that paragraph is the real final deliverable of the course.',
          takeaway:
            'Ship the capstone with an honest checklist: confidently claim the RAG, agent, and deployment skills you actually practiced, and name — without embarrassment — the fine-tuning/evals/internals layer you would still need to learn.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm9-p1',
      title: 'Kundapura Sahayaka — Final',
      type: 'Capstone',
      domain: 'Capstone',
      duration: '4-5 hrs',
      tools: ['Streamlit', 'LangChain', 'anthropic SDK', 'GitHub'],
      description:
        'The final deliverable of the course: a last reliability pass across the whole app, tightening the knowledge base and system prompts based on everything observed since Module 5, followed by a README and a recorded demo — shipping the polished, deployed, documented Kundapura Sahayaka as portfolio-ready work you can link straight from a resume or LinkedIn profile.',
      blueprint: {
        overview:
          'You are closing out Kundapura Sahayaka, not extending it. This project is a deliberate, scoped polish pass over the RAG-grounded, tool-using, publicly deployed app built across Modules 1-8: reconcile and tighten the knowledge base and prompts against every rough edge you have noticed since Module 5, confirm the public Streamlit deployment still behaves correctly end to end, then document and demo it well enough that a stranger — a recruiter, a friend, a future you — can understand it, run it, and trust it within minutes. The output of this project is not new functionality; it is a shippable, linkable, honest piece of portfolio work.',
        functionalRequirements: [
          'The app answers grounded questions correctly across all three knowledge-base domains (seva timings, recipes, travel) after the cleanup pass, with zero regressions against a fixed test-question list.',
          'The app explicitly declines to answer out-of-scope questions instead of hallucinating a plausible-sounding guess.',
          'The agent correctly routes between direct RAG answers and tool calls (calculator, date/seva lookup) exactly as built in Modules 6-7, with no misrouted tool calls on the test list.',
          'The public Streamlit deployment from Module 8 is live, responds correctly to real questions, and reads its API key from deployment secrets/environment variables, never hardcoded in source.',
          'The GitHub repo has a README.md that answers "what is this, how is it built, how do I run it" within about two minutes of reading, with a screenshot or GIF near the top.',
          'A 60-90 second demo GIF or video exists, is embedded in the README, and is shared in at least one external place (a LinkedIn post or the portfolio site).',
        ],
        technicalImplementation: [
          'Re-run the fixed regression question list from Topic m9-t1 against the deployed app, logging every pass/fail into a short notes file.',
          'Edit the markdown docs under `data/kb/` to fix any gap or contradiction the regression pass surfaces, and rebuild the vector index if any doc content changed.',
          'Tighten the system prompt and any tool descriptions based specifically on what the regression failures revealed, then re-run the full list to confirm no regressions remain.',
          'Write `README.md` following the structure from Topic m9-t2: one-line pitch, screenshot, "what it does", "how it\'s built" naming the real stack, "run locally" with exact steps, and the live demo link.',
          'Record and compress a 60-90 second demo GIF/mp4 per Topic m9-t3 and embed the GIF near the top of the README.',
          'Push a final commit, confirm the Streamlit Cloud deployment redeploys cleanly from it, then share the live link and repo once (LinkedIn post or portfolio entry).',
        ],
        prompts: [
          {
            step: 1,
            label: 'Run the regression pass',
            outcome: 'A written log of every question tested and which ones fail.',
            prompt:
              "Using the list of roughly 15 test questions you've been collecting since Module 5 (spanning seva timings, recipes, travel, plus a few deliberately out-of-scope questions), run each one against your deployed Kundapura Sahayaka app. Write down which answers are wrong, hallucinated, or should have been declined but weren't. Save this list as `docs/regression-notes.md`.",
          },
          {
            step: 2,
            label: 'Fix the knowledge base and prompts',
            outcome: 'Every regression-list question passes on re-test.',
            prompt:
              "For each failure recorded in `regression-notes.md`, fix the root cause: correct or add a knowledge-base markdown doc under `data/kb/`, rebuild the vector index if you changed any docs, and/or tighten the system prompt or a tool's description. Re-run the full regression list afterward and confirm every question now passes.",
          },
          {
            step: 3,
            label: 'Write the README',
            outcome: 'A README.md a recruiter or friend could act on in minutes.',
            prompt:
              "Write a `README.md` for the repo with: a one-line pitch under the title, a screenshot near the top, a 'What it does' bullet list, a 'How it's built' section naming the real stack (Streamlit, LangChain, Anthropic Claude, your vector store choice), a 'Run locally' section with exact copy-pasteable steps including the `.env` variable name, and a link to the live deployed app.",
          },
          {
            step: 4,
            label: 'Record and embed the demo',
            outcome: 'A compressed demo GIF embedded near the top of the README.',
            prompt:
              "Record a 60-90 second screen capture of the deployed app answering 2-3 realistic questions across different knowledge-base domains plus one question that triggers a tool call. Trim it, export a compressed GIF under 10MB, and embed it near the top of `README.md` with `![demo](docs/demo.gif)`.",
          },
          {
            step: 5,
            label: 'Ship it',
            outcome: 'A live, documented, publicly linked capstone.',
            prompt:
              'Commit and push all changes, confirm the Streamlit Cloud deployment redeploys successfully from the latest commit, then write a short LinkedIn post (3-4 sentences: what you built, the stack, one thing you learned) linking both the live app and the GitHub repo.',
          },
        ],
        deliverable:
          'A polished, deployed, documented Kundapura Sahayaka: a public Streamlit app backed by a cleaned-up RAG knowledge base and a tool-using agent, with a GitHub repo containing a recruiter-readable README (screenshot, embedded demo GIF, and copy-pasteable run-locally steps) and one public share (LinkedIn post or portfolio link) — the finished, linkable capstone of the course.',
      },
    },
  ],
  quiz: [
    {
      id: 'm9-q1',
      q: 'You need Claude to always answer using knowledge from documents that change every week. Which approach fits best?',
      options: [
        'Fine-tune the model weekly on the new documents',
        'RAG (retrieval-augmented generation) over the current documents',
        'Write the entire document set into the system prompt every time',
        'Change the model\'s underlying architecture',
      ],
      answer: 1,
    },
    {
      id: 'm9-q2',
      q: 'According to the decision framework from this module, what should you try FIRST when facing a new LLM problem?',
      options: [
        'Fine-tune a model on labeled examples',
        'Set up a multi-agent system',
        'A clearer, better prompt (instructions and examples)',
        'Build a formal evaluation framework',
      ],
      answer: 2,
    },
    {
      id: 'm9-q3',
      q: "A team needs a small, cheap model to reliably output a fixed JSON schema, 2 million times a day, and no amount of prompting has made it consistent enough. Which technique best fits this situation?",
      options: [
        'RAG over a knowledge base',
        'Fine-tuning the model on labeled examples of the desired output',
        'Adding more few-shot examples to every single call',
        'Increasing the context window size',
      ],
      answer: 1,
    },
    {
      id: 'm9-q4',
      q: 'Across Modules 3-5, what turned a plain chatbot that could hallucinate into one that reliably answers about coastal-Karnataka seva timings, recipes, and travel?',
      options: [
        'Fine-tuning Claude directly on Kundapura-area data',
        'Grounding answers in a retrieved local knowledge base (RAG)',
        'Increasing the model\'s temperature setting',
        'Switching to a larger model with no other changes',
      ],
      answer: 1,
    },
    {
      id: 'm9-q5',
      q: "What was the primary goal of this course's final Capstone module (Module 9)?",
      options: [
        'Learn transformer internals and backpropagation from scratch',
        'Fine-tune a custom model on Kundapura Sahayaka\'s data',
        'Do a final reliability pass, document, and ship the deployed app as portfolio-ready work',
        'Build a brand-new app unrelated to the previous eight modules',
      ],
      answer: 2,
    },
  ],
}
