// Module 5 — LangChain & RAG, Part 2: Retrieval Chains & the Q&A Bot
// The generation half of RAG: wires the Module 4 vector store to an LLM (LCEL retrieval
// chains, source citations, hallucination guardrails, conversation memory) and ships
// Kundapura Sahayaka v2 — a grounded terminal chatbot that resolves the Module 3 hallucinations.

export const m5 = {
  id: 'm5',
  title: 'LangChain & RAG, Part 2 — Retrieval Chains & the Q&A Bot',
  hours: 7,
  color: 'from-rose-500/20 to-rose-700/10',
  accent: 'rose',
  description:
    'Take the vector store you built in Module 4 and wire it to an LLM so retrieved chunks actually ground the answer, not just sit in a database. Build a proper LangChain **retrieval chain** (LCEL: retriever → prompt → model → parser), show which document answered each question, and add "answer only from the provided context" guardrails to cut hallucination. The module closes by assembling everything into a full, citation-backed, memory-aware **Kundapura Sahayaka** Q&A bot — directly fixing the hallucination problem you watched happen in Module 3.',
  sections: [
    {
      id: 'm5-s1',
      title: 'Wiring Retrieval to Generation',
      topics: [
        {
          id: 'm5-t1',
          title: 'Retrieval-augmented prompting — stuffing retrieved chunks into the context window before generation',
          explain:
            '**Retrieval-augmented prompting** means: before you ask the LLM anything, you search your knowledge base for the chunks most relevant to the question, paste their text into the prompt, and only then ask the model to answer — using what it was just shown.',
          analogy:
            'Think of the Module 3 plain chatbot as a knowledgeable local you ask a question on the street — helpful, confident, but answering purely from memory, which is sometimes wrong or outdated. A **RAG bot** is the same person, except before answering they duck into the post office, pull the three most relevant notices off the board, read them on the spot, and then answer *from those notices*. The model has not gotten smarter; it has been handed the right page to read from.',
          theory:
            'Module 4 gave you a vector store that, given a query, returns the top-k most similar chunks of text — but similarity search alone does not answer a question, it just finds evidence. **Retrieval-augmented generation (RAG)** closes the loop: retrieve chunks, then **stuff** them into the LLM\'s context window as part of the prompt, then let the model generate an answer conditioned on that pasted text. The prompt shape becomes roughly: a system instruction, a block of retrieved context, and the user\'s question — three ingredients instead of one.\n\nThis matters because of two hard limits every LLM has: a fixed **context window** (it can only "see" so many tokens at once) and a **training cutoff** (it knows nothing about your temple\'s seva timings or last week\'s bus schedule change, because that was never in its training data). RAG works around both: you keep your knowledge base as small, current markdown files instead of retraining anything, and at answer-time you inject only the handful of chunks relevant to *this* question — so even a small context window is enough, and the model always has current information, because you control what goes in.\n\nThe "stuffing" part is a real engineering choice with a real cost: each retrieved chunk you paste in uses tokens, so retrieving the top 4-6 chunks (not all 50 documents) keeps the prompt fast and cheap while still giving the model enough evidence to answer well.',
          whyItMatters:
            'This is the single idea that fixes what you watched go wrong in Module 3: the plain chatbot hallucinated seva timings and bus routes because it had nothing but its own (wrong or missing) memory to answer from. Retrieval-augmented prompting gives Kundapura Sahayaka an open book to answer from instead of a closed one — the exact mechanism every production RAG system, from customer-support bots to internal docs search, is built on.',
          steps: [
            'Recall Module 4: a query goes into the vector store and top-k similar chunks come back as plain text + metadata.',
            'Build a prompt with three parts: a system instruction, a "CONTEXT:" block containing the retrieved chunks, and the user\'s question.',
            'Send that combined prompt to the LLM instead of the bare question.',
            'Observe that the model\'s answer now reflects the pasted text, not just its training data.',
            'Note the token cost: more retrieved chunks = a longer, slower, pricier prompt.',
            'Keep k small (4-6 chunks) and let retrieval quality — not context size — do the heavy lifting.',
          ],
          code: `# rag_by_hand.py — what "stuffing" looks like before LangChain automates it
import anthropic

client = anthropic.Anthropic()

def retrieve(question: str) -> list[str]:
    # Stand-in for the Module 4 vector store search (real version in m5-t2).
    return [
        "Evening seva at Anegudde Vinayaka Temple is at 7:00 PM daily; on Sankashti "
        "Chaturthi it moves to 7:30 PM due to extra rituals.",
        "The temple opens for darshan at 6:00 AM and closes at 8:30 PM.",
    ]

def answer(question: str) -> str:
    chunks = retrieve(question)
    context = "\\n\\n".join(f"- {c}" for c in chunks)
    prompt = (
        "You are Kundapura Sahayaka, a local assistant for coastal Karnataka.\\n"
        "Answer the question using ONLY the context below.\\n\\n"
        f"CONTEXT:\\n{context}\\n\\n"
        f"QUESTION: {question}"
    )
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text

print(answer("What time is evening seva at Anegudde?"))`,
          pitfalls: [
            '**Retrieving too many chunks "to be safe".** A bloated context slows generation and can bury the one relevant chunk under noise. Fix: keep k small (4-6) and trust retrieval quality.',
            '**Forgetting to label the context block.** The model may not realise which part of the prompt is "evidence" vs "instruction". Fix: wrap it clearly, e.g. under a `CONTEXT:` heading.',
            '**Sending the raw question with no retrieval at all.** That is Module 3 again, not RAG. Fix: always retrieve before you generate.',
            '**Assuming stuffing chunks in guarantees a correct answer.** The model can still misread or mix up the pasted text. Fix: treat this as a big improvement, not a perfect fix (more in m5-t4).',
            '**Ignoring token limits on long documents.** A single unchunked file can blow the context window. Fix: this is exactly why Module 4 chunked the documents first.',
            '**Not testing with an out-of-scope question.** If nothing relevant is retrieved, an empty or irrelevant context can still get "confidently" answered. Fix: always test the "I don\'t know" case too.',
          ],
          tryIt:
            'Take the `answer()` function above, replace the hard-coded `retrieve()` list with two chunks about a topic you know is *not* in your knowledge base, and see whether the model still answers confidently or admits it lacks the information — you will fix this properly with a guardrail in m5-t4.',
          takeaway:
            'RAG works by retrieving relevant text and pasting it into the prompt before generation — the model answers from what it was just shown, not from memory alone.',
        },
        {
          id: 'm5-t2',
          title: 'Building a retrieval chain in LangChain (LCEL-style: retriever → prompt → model → parser)',
          explain:
            'LangChain\'s **LCEL** (LangChain Expression Language) lets you compose a retriever, a prompt template, a chat model, and an output parser into one pipeline with the `|` operator — so a question goes in one end and a grounded answer comes out the other.',
          analogy:
            'Picture a small fish-processing line at the Kundapura harbour: one station cleans the catch, the next weighs it, the next packs it. Each station does one job and hands its output to the next. An **LCEL chain** is exactly that conveyor belt for text: the **retriever** station pulls out relevant chunks, the **prompt** station arranges them with the question, the **model** station generates the answer, and the **parser** station strips the raw response down to a plain string. You build the belt once; every question just walks down it.',
          theory:
            'LangChain represents each step as a **Runnable** — retrievers, prompt templates, chat models, and output parsers are all Runnables with the same shape: they take an input and produce an output. The `|` (pipe) operator connects them so the output of one becomes the input of the next, exactly like a shell pipeline. A retrieval chain typically looks like:\n\n`{"context": retriever | format_docs, "question": RunnablePassthrough()} | prompt | model | parser`\n\nReading it left to right: a dict maps `"context"` to *the retriever\'s results, formatted into one string* and `"question"` to *the original question passed through unchanged* (`RunnablePassthrough`) — this dict shape itself is a Runnable, so LangChain runs the retriever and the passthrough automatically. The resulting dict feeds a `ChatPromptTemplate` that has `{context}` and `{question}` placeholders, which produces a fully-formed prompt. That prompt goes to the **chat model** (here `ChatAnthropic`), which returns a message object. Finally `StrOutputParser()` extracts the plain text so `.invoke(question)` returns a clean string, not a wrapped object.\n\nThe payoff of LCEL over hand-rolling this (like m5-t1 did) is that the chain is reusable, readable top-to-bottom, and composes cleanly with more pieces later — citations (m5-t3) and memory (m5-t7) are just more Runnables slotted into the same belt.',
          whyItMatters:
            'Every production LangChain RAG system — support bots, internal doc search, this very Kundapura Sahayaka bot — is built as an LCEL chain, so reading and writing `retriever | prompt | model | parser` fluently is a core, transferable skill, not a one-off trick. It also turns retrieval-augmented prompting from a manual string-formatting exercise (m5-t1) into a maintainable, testable pipeline.',
          steps: [
            'Load the Module 4 FAISS/Chroma vector store and turn it into a retriever with `.as_retriever(search_kwargs={"k": 4})`.',
            'Write a `format_docs(docs)` helper that joins retrieved chunks into one context string.',
            'Build a `ChatPromptTemplate` with a system instruction and `{context}` / `{question}` placeholders.',
            'Instantiate `ChatAnthropic(model="claude-sonnet-4-5")` as the generation step.',
            'Compose the chain with `|`: `{"context": retriever | format_docs, "question": RunnablePassthrough()} | prompt | model | StrOutputParser()`.',
            'Call `chain.invoke("your question")` and confirm you get back a plain grounded string.',
          ],
          code: `# retrieval_chain.py
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_anthropic import ChatAnthropic

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = FAISS.load_local("kb_index", embeddings, allow_dangerous_deserialization=True)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

def format_docs(docs) -> str:
    return "\\n\\n".join(d.page_content for d in docs)

prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are Kundapura Sahayaka, a helpful local assistant for coastal Karnataka. "
     "Answer using the CONTEXT below.\\n\\nCONTEXT:\\n{context}"),
    ("human", "{question}"),
])

model = ChatAnthropic(model="claude-sonnet-4-5", temperature=0)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

if __name__ == "__main__":
    print(rag_chain.invoke("What time is the evening seva at Anegudde?"))`,
          pitfalls: [
            '**Loading the vector store with the wrong embeddings.** `FAISS.load_local` needs the *same* embedding model used to build the index, or the vectors are meaningless. Fix: reuse the exact `HuggingFaceEmbeddings` config from Module 4.',
            '**Forgetting `allow_dangerous_deserialization=True`.** FAISS local loading uses pickle under the hood and LangChain blocks it by default for safety. Fix: only set this flag for an index *you* built.',
            '**Mixing up chain composition order.** `prompt | retriever` instead of `retriever | prompt` sends raw text where a query was expected. Fix: retrieval and formatting happen first, prompt assembly second.',
            '**Skipping `StrOutputParser()`.** Without it, `.invoke()` returns a full message object, not a string — confusing when you try to print or concatenate it. Fix: always parse chat model output for plain-text use.',
            '**Setting a high `temperature` on the generation model.** More randomness works against grounded, factual answers. Fix: use `temperature=0` for a Q&A bot.',
            '**Not testing the chain outside a script (e.g. in a notebook/REPL) first.** Debugging a broken chain is much easier one piece at a time. Fix: `retriever.invoke(...)` and `format_docs(...)` in isolation before wiring the full chain.',
          ],
          tryIt:
            'Run `retriever.invoke("bus to Kollur")` on its own first and print the raw `Document` objects (content + metadata), then run the full `rag_chain.invoke(...)` on the same question and compare the retrieved chunks to the final generated answer.',
          takeaway:
            'LCEL composes retriever, prompt, model, and parser into one pipeline with `|` — `retriever | prompt | model | parser` is the shape of every RAG chain you will build from here on.',
        },
        {
          id: 'm5-t3',
          title: 'Citing sources — showing which document(s) answered the question',
          explain:
            'A trustworthy Q&A bot shows not just an answer but *which document(s)* it came from, by carrying each chunk\'s source metadata alongside the generated text instead of discarding it after retrieval.',
          analogy:
            'When the temple committee secretary answers a question about a festival date, a good answer is not just the date — it is "the date, per the printed calendar pinned on the notice board, updated in January." Naming the source lets the asker judge how much to trust it and where to double-check. A RAG bot that hides its sources is answering from thin air as far as the user can tell, even when it is actually well-grounded.',
          theory:
            'Every chunk stored in the Module 4 vector store carries **metadata** — at minimum a `source` field recording which file it came from (e.g. `temple/seva-timings.md`). The retrieval chain from m5-t2 threw that metadata away the moment `format_docs` flattened chunks into one string. To cite sources, you need to keep the retrieved `Document` objects available *alongside* the generated answer, not just feed their text into the prompt.\n\nThe LCEL way to do this is a **RunnableParallel** (written as a plain dict inside a chain): run the retriever once, then branch into two paths that both use its output — one path formats the docs and generates the answer, the other path just collects the unique `source` values from the same docs. Both paths return together in one dict result, e.g. `{"answer": "...", "sources": ["temple/seva-timings.md"]}`. Because both branches read from the *same* retrieval call, you never end up citing a source that was not actually part of the context — a mismatch you would risk if you retrieved twice with a slightly different query.\n\nDisplay-wise, appending a short "Sources: temple/seva-timings.md" line after the answer is enough for a terminal bot — no need for a full citation format at this stage.',
          whyItMatters:
            'Source citations are what turn "the bot said so" into "the bot said so, and here is the note it read" — the difference between a black box and a tool a coastal-Karnataka user can actually verify against the temple notice board or the family recipe book. It is also your first line of defence when evaluating answers by hand later in this module (m5-t8): a wrong answer with a visible wrong source is far easier to debug than a wrong answer with none.',
          steps: [
            'Confirm every chunk in the vector store carries a `source` metadata field (set during Module 4 ingestion).',
            'Build a chain step that runs the retriever once and keeps the raw `Document` list, not just formatted text.',
            'Branch: one path formats the docs into context text for the prompt/model, the other collects `sorted(set(d.metadata["source"] for d in docs))`.',
            'Combine both branches into a single result dict: `{"answer": ..., "sources": [...]}`.',
            'Print the answer followed by a "Sources:" line listing the filenames.',
            'Test a question that spans two documents and confirm both sources appear.',
          ],
          code: `# retrieval_chain_with_sources.py (continues from m5-t2's retriever/prompt/model)
from langchain_core.runnables import RunnableParallel

def format_docs(docs) -> str:
    return "\\n\\n".join(d.page_content for d in docs)

def build_answer(inputs: dict) -> str:
    chain = ({"context": lambda x: format_docs(x["docs"]), "question": lambda x: x["question"]}
              | prompt | model | StrOutputParser())
    return chain.invoke(inputs)

rag_chain_with_sources = (
    RunnableParallel(docs=retriever, question=RunnablePassthrough())
    | {
        "answer": build_answer,
        "sources": lambda x: sorted({d.metadata.get("source", "unknown") for d in x["docs"]}),
      }
)

if __name__ == "__main__":
    result = rag_chain_with_sources.invoke("When is Mookambika temple's main festival?")
    print(result["answer"])
    print("Sources:", ", ".join(result["sources"]) or "none retrieved")`,
          pitfalls: [
            '**Retrieving twice (once for context, once for sources) with slightly different inputs.** The cited sources may not match what the model actually saw. Fix: retrieve once, branch from the same result.',
            '**Forgetting to set `source` metadata during ingestion.** Citations silently show "unknown". Fix: verify Module 4\'s loader step sets it on every chunk.',
            '**Citing every document in the knowledge base instead of only the retrieved ones.** That defeats the point of a citation. Fix: only cite `sources` derived from the actual retrieved `docs` list.',
            '**Showing duplicate sources when two chunks come from the same file.** Fix: de-duplicate with a `set()` before displaying.',
            '**Citing a source even when the answer is "I don\'t know".** Misleading — implies grounding that was not used. Fix: only show sources when the guardrail (m5-t4) did not trigger the fallback.',
            '**Assuming citations alone prove correctness.** A cited chunk can still be misread by the model. Fix: treat citations as a debugging aid, not a correctness guarantee.',
          ],
          tryIt:
            'Ask the chain a question that only one document answers, and a second question phrased broadly enough that chunks from two different documents get retrieved — confirm the `sources` list correctly reflects one file in the first case and two in the second.',
          takeaway:
            'Keep retrieved documents\' metadata alongside the generated answer — a RunnableParallel branch that collects `source` fields turns an opaque answer into a verifiable, citable one.',
        },
        {
          id: 'm5-t4',
          title: "Reducing hallucination with guardrails — an \"answer only from the provided context, say you don't know otherwise\" instruction, and why it isn't perfect",
          explain:
            'Adding an explicit instruction — "answer only using the context provided, and say you don\'t know if the context doesn\'t contain the answer" — meaningfully reduces hallucination, but it is a strong nudge, not a hard guarantee, because the model can still blend in outside knowledge or misread the context it was given.',
          analogy:
            'Think of a courtroom witness told "answer only based on what you personally saw, and say \'I don\'t know\' if you didn\'t see it." Most witnesses, told this clearly, will comply and it dramatically improves the reliability of testimony over an unconstrained account. But a witness can still misremember a detail from what they *did* see, or unconsciously fill a small gap with an assumption that feels like memory. The instruction is a strong, necessary discipline — not a lie-detector.',
          theory:
            'The guardrail itself is just a clear system-prompt instruction layered onto the retrieval chain from m5-t2, something like: *"Answer the question using ONLY the information in CONTEXT. If the context does not contain enough information to answer, respond exactly: \'I don\'t know based on my current notes.\' Do not use outside knowledge."* Paired with `temperature=0` (less improvisation) and a reasonably sized `k` (enough context to actually contain the answer when it exists), this closes off most of the Module 3-style hallucinations, where the model invented a seva timing or bus route from nothing.\n\nWhy it is not perfect, concretely:\n1. **Retrieval misses still happen.** If the right chunk was never retrieved (bad chunking, an oddly-phrased question, an embedding that missed the match), the model has no correct context to answer from — a good guardrail should make it say "I don\'t know" here, but a weaker one might still guess.\n2. **The model can misread its own context.** Given a chunk that says the temple opens at 6:00 AM and closes at 8:30 PM, a model can still occasionally mix these into a wrong combined answer — the guardrail keeps it *tethered* to real information, but doesn\'t guarantee perfect reading comprehension.\n3. **Parametric knowledge can leak in.** LLMs are trained on huge amounts of text; a plausible-sounding but ungrounded detail from training data can slip into an answer that is otherwise mostly grounded, especially on partially-answered questions.\n4. **Instruction-following is probabilistic, not absolute.** A strongly-worded guardrail is followed the overwhelming majority of the time, not with 100% certainty — which is exactly why the by-hand evaluation in m5-t8 exists: guardrails reduce hallucination, they do not eliminate the need to check.',
          whyItMatters:
            'This topic is the direct answer to the problem Module 3 exposed: a chatbot with no grounding and no guardrail will confidently invent seva timings and bus schedules. Retrieval (m5-t1/m5-t2) plus an explicit guardrail is the standard, industry-proven way to cut that failure rate dramatically — understanding *why it is not 100%* is what separates someone who ships a RAG bot from someone who ships a RAG bot **and knows it still needs evaluation** (which is exactly where m5-t8 goes next).',
          steps: [
            'Write an explicit guardrail sentence into the system prompt: answer only from CONTEXT, otherwise say a fixed "I don\'t know" phrase.',
            'Set `temperature=0` on the chat model to reduce improvisation.',
            'Test with a question fully covered by the knowledge base — confirm a grounded, cited answer.',
            'Test with a question completely outside the knowledge base (e.g. general trivia) — confirm the fallback phrase appears instead of a guess.',
            'Test a partially-covered question and read the answer critically for any detail not actually present in the retrieved context.',
            'Accept and document the limitation: guardrails reduce, not eliminate, hallucination risk — hand evaluation (m5-t8) is still required.',
          ],
          code: `# guardrail prompt used inside the ChatPromptTemplate from m5-t2/m5-t3
GUARDRAIL_SYSTEM = (
    "You are Kundapura Sahayaka, a local assistant for coastal Karnataka.\\n"
    "Answer the QUESTION using ONLY the information in CONTEXT below.\\n"
    "If the context does not contain enough information to answer, respond with "
    "exactly this sentence and nothing else: "
    "\\"I don't know based on my current notes.\\"\\n"
    "Do not use any outside knowledge, and do not guess.\\n\\n"
    "CONTEXT:\\n{context}"
)

# Quick manual test of both sides of the guardrail:
covered = rag_chain.invoke("What time does the temple open for darshan?")
uncovered = rag_chain.invoke("Who won the last IPL final?")  # not in the knowledge base

print("Covered question ->", covered)
print("Uncovered question ->", uncovered)  # should be the fixed "I don't know" sentence`,
          pitfalls: [
            '**Writing a vague guardrail like "try to stay accurate".** Weak wording gets weakly followed. Fix: use a specific, literal fallback sentence the model must reproduce exactly.',
            '**Testing only "in scope" questions.** You never see whether the fallback actually fires. Fix: always test at least one clearly out-of-scope question.',
            '**Leaving `temperature` at a default like 0.7-1.0.** More randomness works against grounded answers. Fix: use `temperature=0` for factual Q&A.',
            '**Treating "I don\'t know" as a sign of failure.** It is the guardrail working correctly on an unanswerable question. Fix: judge the bot by whether it says "I don\'t know" *when it should*, not by never saying it.',
            '**Believing the guardrail makes retrieval quality unimportant.** A guardrail cannot rescue an answer built on the wrong retrieved chunk. Fix: good retrieval (m5-t1/t2) and a good guardrail work together, not as substitutes.',
            '**Assuming zero hallucination is achievable.** Even with a strong guardrail, spot-checking remains necessary. Fix: build the habit of hand evaluation (m5-t8) rather than trusting the guardrail blindly.',
          ],
          tryIt:
            'Re-ask the exact hallucination-prone questions from Module 3\'s plain chatbot (a seva timing, a bus route, a festival date) through the guarded retrieval chain, and write one line per question: did it answer correctly, cite a source, or correctly say "I don\'t know"?',
          takeaway:
            'An explicit "answer only from context, otherwise say you don\'t know" instruction with low temperature sharply cuts hallucination — but retrieval misses and imperfect instruction-following mean it reduces the risk, it does not remove the need to check answers.',
        },
      ],
    },
    {
      id: 'm5-s2',
      title: 'Build: Kundapura Sahayaka Q&A Bot',
      topics: [
        {
          id: 'm5-t5',
          title: "Assembling the full knowledge base for Kundapura Sahayaka (reusing and extending Module 4's docs)",
          explain:
            'Grow the small Module 4 sample knowledge base into a fuller, organised set of markdown documents — temple info, recipes, and travel notes — each carrying frontmatter metadata so citations and later staleness checks have something real to point at.',
          analogy:
            'Module 4 was like stocking one shelf of the post office notice board to prove the filing system works. Now you stock the whole board properly: a shelf for temple notices, one for the recipe booklet, one for bus and ferry timetables — each notice dated and labelled so anyone reading it knows exactly where it came from and how fresh it is.',
          theory:
            'A knowledge base is only as useful as its organisation and metadata. For Kundapura Sahayaka, group markdown files by topic under `data/kb/`: `temple/` (seva timings, festival calendar), `food/` (neer dosa, kori rotti, fish thali, kotte kadubu, kane fish curry), and `travel/` (bus routes, the Gangolli/Kollur ferry, monsoon connectivity notes). This mirrors how the real "knowledge" is naturally split, and keeps each file focused enough that chunking (Module 4) produces clean, single-topic chunks rather than chunks that awkwardly straddle unrelated content.\n\nGive every document simple **frontmatter** — a small metadata header at the top of the file: `title`, `source` (its own relative path, doubling as the citation string from m5-t3), and `last_updated`. The `last_updated` field looks unnecessary today, but it is exactly what lets you (or, later, the bot) flag a stale document during the by-hand evaluation in m5-t8 — "this seva timing note hasn\'t been checked since January" is a very different situation from "this note was updated last week."\n\nExtend, don\'t just reuse, Module 4\'s docs: add the specific facts that caused Module 3\'s hallucinations (the exact seva timing, the exact bus number, the exact festival date) so the new pipeline has real ground truth to retrieve and cite, closing the loop the course has been building toward since Module 3.',
          whyItMatters:
            'A RAG bot cannot ground an answer that was never written down — retrieval only surfaces what exists. Deliberately covering the exact facts Module 3 got wrong is what makes the Module 5 project a genuine before/after comparison instead of a hopeful demo, and the frontmatter metadata is what makes citations (m5-t3) and staleness checks (m5-t8) actually meaningful rather than cosmetic.',
          steps: [
            'Create three topic folders under `data/kb/`: `temple/`, `food/`, `travel/`.',
            'Add or extend markdown files so each of Module 3\'s hallucination-prone facts (a seva timing, a bus route, a festival date) is written down precisely somewhere.',
            'Add frontmatter (`title`, `source`, `last_updated`) to the top of every file.',
            'Keep each file focused on one sub-topic so chunks stay coherent (a whole temple\'s worth of unrelated facts in one file chunks poorly).',
            'Proofread the Kannada/English facts for accuracy — a RAG bot grounded on a wrong document is still wrong, just confidently sourced.',
            'Count the final file set (aim for 8-12 short documents) before moving to re-ingestion in m5-t6.',
          ],
          code: `---
title: Evening Seva Timings — Anegudde & Kollur Area Temples
source: temple/seva-timings.md
last_updated: 2026-01-15
---

# Evening Seva Timings

**Anegudde Vinayaka Temple** — evening seva is at 7:00 PM daily. On
**Sankashti Chaturthi**, it moves to 7:30 PM to allow time for the extra
abhisheka. The temple opens for darshan at 6:00 AM and closes at 8:30 PM.

**Kollur Mookambika Temple** — evening deeparadhane is at 7:15 PM daily.
Darshan hours are 5:00 AM to 9:00 PM, with a short closure from 1:00 PM to
2:00 PM for the noon naivedya.

# Notes
Timings can shift by 15-30 minutes during major festivals — check the
festival-calendar.md document for exact festival-day schedules.`,
          pitfalls: [
            '**Writing one giant file with everything in it.** Chunking (Module 4) then produces chunks that mix unrelated topics. Fix: one focused file per sub-topic.',
            '**Skipping frontmatter "to save time".** Citations fall back to a raw file path with no context, and staleness becomes unknowable. Fix: always add `title`/`source`/`last_updated`.',
            '**Copying Module 4\'s sample docs unchanged.** If they never contained the Module 3 hallucination-prone facts, the new bot cannot ground those answers either. Fix: deliberately add the missing specifics.',
            '**Letting `source` in frontmatter drift from the actual file path.** Citations then point to the wrong place. Fix: keep it as the real relative path, and re-check it if you move a file.',
            '**Inconsistent formatting across files (headings, bullet style).** Not fatal, but makes chunks less uniform. Fix: pick one simple markdown convention and use it everywhere.',
            '**Forgetting to update `last_updated` when you actually edit a fact.** Stale metadata defeats its own purpose. Fix: bump the date every time the content changes.',
          ],
          tryIt:
            'Write (or extend) two documents from scratch — one under `travel/` with a specific bus number, departure time, and fare from Kundapura toward Kollur, and one under `food/` with a full neer dosa recipe — each with correct frontmatter, ready for the ingestion pipeline in m5-t6.',
          takeaway:
            'Organise the knowledge base by topic folder, give every file frontmatter (`title`, `source`, `last_updated`), and deliberately cover the exact facts Module 3 hallucinated — retrieval can only ground what is actually written down.',
        },
        {
          id: 'm5-t6',
          title: 'Wiring the full pipeline: loaders → chunker → embeddings → vector store → retrieval chain',
          explain:
            'Assemble every piece built so far — Module 4\'s loaders, chunker, embeddings, and vector store, plus this module\'s retrieval chain — into one clean two-script pipeline: `build_index.py` (run once, or whenever the knowledge base changes) and `query.py`/`chat.py` (run every time someone asks a question).',
          analogy:
            'A library does not re-catalogue every book each time a visitor asks a question — cataloguing happens once (or whenever new books arrive), and answering questions is a separate, fast, everyday task that just consults the existing catalogue. Splitting `build_index.py` from the query side is exactly that separation: expensive indexing happens rarely, cheap querying happens constantly.',
          theory:
            'The end-to-end pipeline has two very different rhythms. **Ingestion** — loading markdown files, splitting them into chunks, embedding each chunk, and building the vector index — is relatively slow and only needs to re-run when the knowledge base changes (a new document, an edited fact). **Querying** — embedding one question, retrieving top-k chunks, running the generation chain — needs to be fast and happens on every single user turn. Wiring them as one script that rebuilds the index on every question would be correct but wasteful; splitting them is the standard production pattern.\n\n`build_index.py` chains together: a `DirectoryLoader` (walks `data/kb/**/*.md`), a `RecursiveCharacterTextSplitter` (chunk_size/chunk_overlap from Module 4), a `HuggingFaceEmbeddings` model, and `FAISS.from_documents(...)` — then persists the result with `vectorstore.save_local("kb_index")` so it survives between runs.\n\n`query.py` (or the chat loop in m5-t7) does the opposite: it *loads* the persisted index with `FAISS.load_local(...)` — no re-embedding, no re-chunking — builds the retriever, and runs the m5-t2/m5-t3/m5-t4 chain (retrieval + guardrail + citations) against it. This split is also what makes the by-hand evaluation in m5-t8 practical: you can run dozens of test questions against a stable index without waiting for re-indexing each time.',
          whyItMatters:
            'This is the moment every earlier piece — Module 4\'s ingestion work and this module\'s retrieval/citation/guardrail chain — becomes one runnable system instead of a collection of separate exercises. The build/query split is also a real production pattern: it is how you would deploy this later in Module 8 without re-indexing on every web request.',
          steps: [
            'Write `build_index.py`: load all markdown under `data/kb/`, set `source` metadata per chunk, split, embed, and build a FAISS index.',
            'Persist the index with `vectorstore.save_local("kb_index")` and print how many chunks/documents were indexed.',
            'Write `query.py`: load the persisted index with `FAISS.load_local(...)`, build the retriever, and assemble the guarded, citation-carrying chain.',
            'Run `python build_index.py` once and confirm the `kb_index/` folder is created.',
            'Run `python query.py "What time is evening seva at Anegudde?"` and confirm a grounded, cited answer.',
            'Edit or add a document, re-run only `build_index.py`, and confirm the new fact is retrievable without touching `query.py`.',
          ],
          code: `# build_index.py — run once, or whenever data/kb/ changes
from pathlib import Path
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

KB_DIR = Path("data/kb")

loader = DirectoryLoader(str(KB_DIR), glob="**/*.md", loader_cls=UnstructuredMarkdownLoader)
raw_docs = loader.load()
for doc in raw_docs:
    doc.metadata["source"] = Path(doc.metadata["source"]).relative_to(KB_DIR).as_posix()

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(raw_docs)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = FAISS.from_documents(chunks, embeddings)
vectorstore.save_local("kb_index")

print(f"Indexed {len(chunks)} chunks from {len(raw_docs)} documents -> kb_index/")

# query.py — run every time, loads the persisted index (no re-embedding)
import sys
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
# ... prompt / model / rag_chain_with_sources built as in m5-t2/m5-t3/m5-t4 ...

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vectorstore = FAISS.load_local("kb_index", embeddings, allow_dangerous_deserialization=True)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

if __name__ == "__main__":
    question = " ".join(sys.argv[1:]) or "What time is evening seva at Anegudde?"
    result = rag_chain_with_sources.invoke(question)
    print(result["answer"])
    print("Sources:", ", ".join(result["sources"]) or "none retrieved")`,
          pitfalls: [
            '**Rebuilding the index inside the query script on every run.** Slow, and pointless when the knowledge base has not changed. Fix: keep `build_index.py` and `query.py` separate.',
            '**Using a different embeddings model or chunk size at query time than at index time.** Silent, hard-to-diagnose bad retrieval. Fix: keep the embeddings config in one shared constant/import used by both scripts.',
            '**Forgetting to re-run `build_index.py` after editing a document.** The bot keeps answering from the old text. Fix: re-index whenever `data/kb/` changes; treat it like a build step.',
            '**Not printing ingestion stats.** Silent failures (e.g. zero documents loaded because of a bad glob path) go unnoticed. Fix: always print chunk/document counts after building the index.',
            '**Committing the generated `kb_index/` folder as if it were source data.** It is a derived build artifact. Fix: treat `data/kb/*.md` as the source of truth; `kb_index/` can be regenerated.',
            '**Loading the index with `allow_dangerous_deserialization=True` on a file you did not build yourself.** That flag is only safe for indexes you control. Fix: never load an untrusted `kb_index/`.',
          ],
          tryIt:
            'Delete the `kb_index/` folder, re-run `build_index.py` from scratch, then run `query.py` with a question about a fact you added in m5-t5 and confirm the pipeline finds and cites it correctly end to end.',
          takeaway:
            'Split ingestion (`build_index.py`, run occasionally) from querying (`query.py`, run every turn) — the same separation every production RAG system uses, and it makes both re-indexing and evaluation painless.',
        },
        {
          id: 'm5-t7',
          title: 'Adding conversation memory so follow-up questions ("what about the timing?") stay grounded in the last topic',
          explain:
            'A raw retrieval chain treats every question in isolation, so a natural follow-up like "what about the timing?" retrieves nothing useful on its own — fix this by keeping a short chat history and using it to rewrite each follow-up into a standalone question before retrieval runs.',
          analogy:
            'If you ask a stranger at a bus stand "what time does the temple close?" and they answer, then you ask "what about on festival days?", they understand you are still talking about the temple\'s closing time — because they remember the last exchange. A retrieval chain with no memory is like asking a *different* stranger each time: "what about on festival days?" means nothing to someone who never heard the first question.',
          theory:
            'The problem is specifically at the **retrieval** step, not the generation step: embedding the bare follow-up "what about the timing?" and searching the vector store produces a poor, unfocused match, because that sentence alone carries almost no topical signal. The standard fix is a small extra LLM call before retrieval — a **question condensing** step — that rewrites the follow-up into a standalone question using recent chat history, *without answering it*. "What about the timing?" plus history about Anegudde\'s evening seva becomes "What is the evening seva timing at Anegudde on festival days?" — a question retrieval can actually work with.\n\nA minimal, transparent implementation for a fast-track course: keep `chat_history` as a plain list of `(question, answer)` tuples; build a small `ChatPromptTemplate` whose job is only to rewrite the latest question given the last few turns; run that first, feed its output into the existing `rag_chain_with_sources` from m5-t3/m5-t4, then append the *original* question and the answer to history (so future condensing sees the real conversation, not condensed versions of it). LangChain also ships more built-in abstractions for this (`RunnableWithMessageHistory`, memory classes) — worth knowing they exist, but the manual version here keeps every step visible, which matters more at this stage than saving a few lines.',
          whyItMatters:
            'A Q&A bot that forgets what "it" refers to one turn later feels broken to a real user, and multi-turn grounding is one of the most common places naive RAG demos fall apart in practice. Getting this right is also what makes Kundapura Sahayaka feel like an actual assistant rather than a search box that resets itself after every question.',
          steps: [
            'Create a `chat_history` list to hold `(question, answer)` pairs for the session.',
            'Write a condensing prompt: given recent history and the latest question, produce a standalone question — and nothing else.',
            'On each turn, run the condensing step first (skip it if history is empty).',
            'Feed the standalone question into the existing guarded, citation-carrying retrieval chain.',
            'Append the *original* question (not the condensed one) and the answer to `chat_history`.',
            'Test a two-turn exchange: a specific question, then a vague follow-up like "what about the timing?" or "what about on festival days?".',
          ],
          code: `# memory.py — condense-then-retrieve, built on the m5-t3/m5-t4 chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

chat_history: list[tuple[str, str]] = []

CONDENSE_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "Rewrite the LATEST question as a standalone question. Use the chat history "
     "only to resolve references like 'it', 'that', or 'the timing'. "
     "Do not answer the question -- only rewrite it."),
    ("human", "Chat history:\\n{history}\\n\\nLatest question: {question}\\n\\nStandalone question:"),
])

condense_chain = CONDENSE_PROMPT | model | StrOutputParser()

def format_history(history: list[tuple[str, str]]) -> str:
    return "\\n".join(f"Q: {q}\\nA: {a}" for q, a in history[-3:])

def ask(question: str) -> dict:
    if chat_history:
        standalone = condense_chain.invoke(
            {"history": format_history(chat_history), "question": question}
        )
    else:
        standalone = question

    result = rag_chain_with_sources.invoke(standalone)
    chat_history.append((question, result["answer"]))
    return result

if __name__ == "__main__":
    r1 = ask("What time is evening seva at Anegudde?")
    print(r1["answer"])
    r2 = ask("What about on festival days?")   # resolved via condensing, not asked in isolation
    print(r2["answer"])`,
          pitfalls: [
            '**Feeding the raw follow-up straight into the retriever.** "What about the timing?" alone retrieves poorly. Fix: always condense first when history exists.',
            '**Letting the condensing step answer the question instead of just rewriting it.** Defeats the retrieval step and can leak an ungrounded answer. Fix: instruct it explicitly to rewrite only, never answer.',
            '**Storing the condensed question in history instead of the user\'s real one.** Future condensing compounds rewritten-on-rewritten questions and drifts. Fix: always store the original question.',
            '**Letting `chat_history` grow unbounded.** Every condense call re-sends the whole history, growing cost and latency. Fix: cap it (e.g. last 3 turns) as shown.',
            '**Never resetting history between unrelated sessions.** A new user inherits a stranger\'s conversation context. Fix: create a fresh `chat_history` list per session/user.',
            '**Assuming condensing is free.** It is an extra LLM call on every follow-up turn. Fix: budget for it, and skip it entirely on the first question when there is no history yet.',
          ],
          tryIt:
            'Run a three-turn conversation: ask about Anegudde\'s evening seva, then ask "what about on festival days?", then ask "and Mookambika?" — print the condensed standalone question at each step and confirm it correctly carries the right topic forward each time.',
          takeaway:
            'Follow-up questions need their own step: condense the latest question into a standalone one using recent chat history *before* retrieval, so vague references like "the timing" still ground correctly.',
        },
        {
          id: 'm5-t8',
          title: 'Evaluating answers by hand — a short rubric for where RAG still gets it wrong (stale docs, ambiguous questions, retrieval misses) and how to notice it',
          explain:
            'Even a well-built RAG bot needs its answers spot-checked against a rubric of the specific ways it can still fail — stale documents, ambiguous questions, and retrieval misses — because these failures look confident and cited, not obviously broken.',
          analogy:
            'A fish market inspector does not just glance at the catch and move on — they check a short, specific list every time: is it fresh, is it the fish it is labelled as, was it weighed correctly? A RAG bot deserves the same discipline: a short, repeatable checklist run against real questions, not a vague sense that "it seems to work."',
          theory:
            'Three specific failure modes account for most of what still goes wrong after retrieval, citations, and guardrails are all in place:\n\n1. **Stale documents.** The bot cites a real source and answers exactly what that document says — but the document itself is outdated (a seva timing that changed, a bus route that was rerouted). This is *invisible* from the chain\'s point of view: retrieval and generation both worked correctly. It only surfaces by checking the `last_updated` frontmatter (m5-t5) against how old the fact actually is.\n2. **Ambiguous questions.** A question like "what\'s the timing?" with no prior context, or "is it far?" with an unclear referent, can retrieve a plausible-looking but wrong-topic chunk and get answered confidently anyway. This shows whether the guardrail and memory (m5-t7) are actually working together, or whether the bot is guessing which topic "it" means.\n3. **Retrieval misses.** The right document exists in the knowledge base, but a specific phrasing failed to retrieve it — a chunk boundary split the fact awkwardly, or the embedding similarity for this wording happened to rank a different chunk higher. The guardrail should catch this as "I don\'t know" (correct behaviour, but a missed opportunity), or — worse — the model may partially answer from a nearby-but-wrong chunk.\n\nA practical rubric: build a fixed list of 8-12 test questions covering easy in-scope facts, the exact Module 3 hallucination-prone questions, a deliberately out-of-scope question, an ambiguous follow-up, and a question about something you know is stale. Run them through `query.py`/the chat loop, and for each one note: correct/incorrect, source cited (yes/no, right document?), and which failure mode (if any) applies. This is manual, not automated — appropriate at this stage, and a habit worth keeping even after automated evaluation is introduced later in more advanced GenAI work.',
          whyItMatters:
            'This closes the loop the whole module has been building toward: retrieval, citations, and guardrails reduce hallucination but — as m5-t4 established — do not eliminate it, so *noticing* the remaining failures is a real, distinct skill. It is also exactly the muscle the project deliverable exercises: re-running the Module 3 hallucination-prone questions and judging, by hand, whether Kundapura Sahayaka v2 actually fixed them.',
          steps: [
            'Write a fixed list of 8-12 test questions: easy in-scope facts, the Module 3 hallucination-prone questions, one clearly out-of-scope question, one ambiguous follow-up, one about a fact you know is stale.',
            'Run each question through the chat loop and record the answer plus its cited source(s).',
            'For each answer, judge correctness against the actual markdown source, not against what "sounds right".',
            'Tag any failure with a category: stale doc, ambiguous question, or retrieval miss.',
            'For a "retrieval miss", check whether the right chunk exists in `kb_index` at all — if not, that is a knowledge-base gap, not a retrieval bug.',
            'Keep the test question list around and re-run it after any change to chunking, prompts, or the knowledge base, to catch regressions.',
          ],
          code: `# eval_by_hand.py — run the fixed test set and print everything needed to judge each answer
EVAL_QUESTIONS = [
    "What time is the evening seva at Anegudde Vinayaka Temple?",       # in-scope, easy
    "What bus do I take from Kundapura towards Kollur?",                 # in-scope, easy
    "What time does the temple open for darshan?",                      # was hallucinated in Module 3
    "What about on festival days?",                                     # ambiguous without prior turn
    "Who won the last IPL final?",                                      # clearly out-of-scope
    "When is Mookambika temple's main festival this year?",             # possibly stale
]

for q in EVAL_QUESTIONS:
    result = rag_chain_with_sources.invoke(q)
    print(f"\\nQ: {q}")
    print(f"A: {result['answer']}")
    print(f"Sources: {result['sources'] or 'none retrieved'}")
    # Fill in by hand after reading the source doc:
    # correct? [ ]   right source cited? [ ]   failure mode (if any): stale / ambiguous / retrieval-miss`,
          pitfalls: [
            '**Judging an answer by how confident or fluent it sounds.** Fluency is not correctness. Fix: always check the answer against the actual cited markdown file.',
            '**Only testing easy, obviously in-scope questions.** You will never see the failure modes this rubric exists to catch. Fix: deliberately include stale, ambiguous, and out-of-scope questions.',
            '**Treating every wrong answer the same way.** A stale-doc failure needs a content fix; a retrieval miss needs a chunking/indexing fix — different problems, different repairs. Fix: always tag the failure category before "fixing" anything.',
            '**Re-running the eval set once and calling it done.** Chunking, prompt, or knowledge-base changes can silently break something that used to work. Fix: re-run the fixed question list after every meaningful change.',
            '**Skipping the exact Module 3 hallucination-prone questions.** They are the whole point of the before/after comparison. Fix: always include them verbatim in the eval set.',
            '**Forgetting to check `kb_index` for a retrieval miss before blaming the model.** If the fact was never indexed, no retrieval strategy would have found it. Fix: confirm the chunk exists before diagnosing a retrieval bug.',
          ],
          tryIt:
            'Run the eval script above, fill in the correct/source/failure-mode judgment for each answer by hand, and write one sentence per failed question naming its category (stale doc, ambiguous question, or retrieval miss) and what you would change to fix it.',
          takeaway:
            'A short, repeatable by-hand rubric — checking correctness, citation accuracy, and tagging stale-doc/ambiguous/retrieval-miss failures — is what turns "the RAG bot seems to work" into evidence you can actually trust or act on.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm5-p1',
      title: 'Kundapura Sahayaka v2 — RAG Q&A Bot',
      type: 'Project',
      domain: 'RAG — Retrieval + Generation',
      duration: '4-5 hrs',
      description:
        'Build the third version of the running app: a terminal chatbot that answers Kundapura questions ONLY by retrieving from the Module 4/5 knowledge base and citing which document it used, with a visible "I don\'t know" fallback when nothing relevant is retrieved, plus basic conversation memory for natural follow-ups. The deliverable explicitly re-asks the same hallucination-prone questions from Module 3\'s plain chatbot and compares the grounded answers side by side.',
      tools: ['LangChain', 'FAISS / Chroma', 'anthropic SDK'],
      blueprint: {
        overview:
          'This project wires together everything built across the module: the extended knowledge base (m5-t5), the ingestion pipeline (m5-t6), a guarded retrieval chain with citations (m5-t2/t3/t4), and conversation memory (m5-t7), into one runnable terminal chatbot. Unlike Module 3\'s ungrounded chatbot, every answer here must trace back to a retrieved document or explicitly say it does not know — and the deliverable proves this by re-running Module 3\'s exact failure cases through the new pipeline.',
        functionalRequirements: [
          'A `build_index.py` script that ingests every markdown file under `data/kb/` (temple, food, travel), chunks it, embeds it, and persists a FAISS (or Chroma) index to disk.',
          'A `chat.py` terminal REPL that loads the persisted index and answers user questions in a loop until an `exit` command.',
          'Every answer is generated via a guarded LCEL retrieval chain: retrieved context is the only allowed source of facts.',
          'Every answer is followed by a "Sources:" line listing the specific document(s) retrieved for that question, or is replaced by a fixed "I don\'t know based on my current notes." when nothing relevant is retrieved.',
          'Conversation memory: a natural follow-up (e.g. "what about the timing?") is correctly grounded in the previous turn\'s topic without the user having to repeat it.',
          'A `comparison.md` (or printed transcript) that re-asks the exact hallucination-prone questions from Module 3 and shows the old vs. new answers side by side.',
        ],
        technicalImplementation: [
          'Reuse and extend the Module 4 knowledge base under `data/kb/{temple,food,travel}/`, each file with `title`/`source`/`last_updated` frontmatter (m5-t5).',
          'Chunk with `RecursiveCharacterTextSplitter` (chunk_size=500, chunk_overlap=50) and embed with `HuggingFaceEmbeddings("sentence-transformers/all-MiniLM-L6-v2")`.',
          'Persist the index with `FAISS.save_local("kb_index")` in `build_index.py`; load it with `FAISS.load_local(...)` in `chat.py`.',
          'Build the answer chain with LCEL: `RunnableParallel(docs=retriever, question=RunnablePassthrough())` feeding both a formatted-context/prompt/`ChatAnthropic("claude-sonnet-4-5")`/`StrOutputParser()` branch and a `sources` branch.',
          'Guardrail system prompt: answer only from CONTEXT, otherwise reply with a fixed "I don\'t know" sentence; `temperature=0`.',
          'Conversation memory as a plain `chat_history` list plus a condense-question LCEL step (m5-t7) run before retrieval whenever history is non-empty.',
          'A small fixed EVAL_QUESTIONS list (m5-t8) that includes the exact Module 3 hallucination-prone questions, run manually at the end for the deliverable.',
        ],
        prompts: [
          {
            step: 1,
            label: 'Extend the knowledge base and build the index',
            outcome: 'An organised `data/kb/` (temple, food, travel, each with frontmatter) and a working `build_index.py` that produces a persisted `kb_index/` FAISS index, printing chunk/document counts.',
            prompt:
              'Extend my Module 4 knowledge base under data/kb/ into three folders — temple/, food/, travel/ — covering seva timings, festival dates, at least four coastal-Karnataka recipes, and bus/ferry travel notes. Make sure the exact facts I hallucinated in Module 3 (a specific seva timing, a specific bus route, a specific festival date) are written down precisely somewhere. Add title/source/last_updated frontmatter to every file. Then write build_index.py that loads all the markdown, chunks it with RecursiveCharacterTextSplitter (chunk_size=500, chunk_overlap=50), sets source metadata per chunk from the relative file path, embeds with HuggingFaceEmbeddings, builds a FAISS index, and saves it to kb_index/. Print how many chunks and documents were indexed.',
          },
          {
            step: 2,
            label: 'Build the guarded, citation-carrying retrieval chain',
            outcome: 'A `rag_chain_with_sources` LCEL chain that returns {"answer": ..., "sources": [...]} and correctly falls back to "I don\'t know" on out-of-scope questions.',
            prompt:
              'In chat.py, load the persisted kb_index/ FAISS index and build a retriever with k=4. Using LangChain LCEL, build a chain that: retrieves documents, formats them into a CONTEXT block, and passes them to a ChatPromptTemplate whose system message instructs the model (ChatAnthropic, model claude-sonnet-4-5, temperature=0) to answer ONLY from the context and reply with the exact sentence "I don\'t know based on my current notes." when the context is insufficient. Use RunnableParallel so the final result is a dict with "answer" (a plain string) and "sources" (the sorted, de-duplicated list of retrieved documents\' source metadata). Test it manually with one in-scope and one clearly out-of-scope question and show me both outputs.',
          },
          {
            step: 3,
            label: 'Add conversation memory for follow-ups',
            outcome: 'A condense-question step wired before retrieval so vague follow-ups stay grounded in the previous topic.',
            prompt:
              'Add a chat_history list of (question, answer) tuples to chat.py. Before running the retrieval chain, if chat_history is non-empty, run a small LCEL step that rewrites the latest question into a standalone question using the last 3 turns of history (it must only rewrite, never answer). Feed the standalone question into the existing retrieval chain, but store the user\'s ORIGINAL question (not the rewritten one) plus the answer back into chat_history. Show me a two-turn test: ask about one temple\'s evening seva timing, then ask "what about on festival days?" and confirm it stays grounded in the same temple.',
          },
          {
            step: 4,
            label: 'Wrap it in a terminal chat loop',
            outcome: 'A runnable `python chat.py` REPL that loops on user input, prints the answer and its sources (or the "I don\'t know" fallback) each turn, and exits cleanly on an `exit` command.',
            prompt:
              'Wrap everything into a terminal REPL in chat.py: prompt the user for a question, run it through the memory-aware, guarded, citation-carrying chain, print the answer, then print a "Sources:" line (or "Sources: none retrieved" when the fallback fired). Loop until the user types exit or quit. Keep the loop simple and readable — no need for a UI yet, that comes in a later module.',
          },
          {
            step: 5,
            label: 'Re-run the Module 3 hallucination cases and compare',
            outcome: 'A written comparison.md (or printed transcript) showing each Module 3 hallucination-prone question, the old ungrounded answer, and the new grounded answer with its citation or honest "I don\'t know".',
            prompt:
              'Take the exact questions that caused Module 3\'s plain chatbot to hallucinate (a seva timing, a bus route, a festival date, and any others I noted). Re-ask each one through the new chat.py pipeline and record the answer plus cited sources for each. Write a short comparison.md with a table or list: question | Module 3 answer (wrong/hallucinated) | Module 5 answer (grounded, with source or "I don\'t know"). Also include one deliberately out-of-scope question and one ambiguous follow-up in the comparison to show the guardrail and memory both working.',
          },
        ],
        deliverable:
          'A working `chat.py` terminal Q&A bot backed by `build_index.py` and the extended `data/kb/` knowledge base, that answers only from retrieved context, cites its source document(s) per answer, falls back to a visible "I don\'t know" when nothing relevant is retrieved, and correctly grounds follow-up questions using short-term conversation memory — plus a `comparison.md` that re-asks Module 3\'s exact hallucination-prone questions and shows the old ungrounded answers side by side with the new grounded, cited (or honestly "I don\'t know") answers.',
      },
    },
  ],
  quiz: [
    {
      id: 'm5-q1',
      q: 'What does "retrieval-augmented prompting" actually do before the LLM generates an answer?',
      options: [
        'It fine-tunes the model on your documents',
        'It retrieves the most relevant chunks from your knowledge base and pastes their text into the prompt as context',
        'It compresses the question into fewer tokens',
        'It replaces the LLM with a plain keyword search',
      ],
      answer: 1,
    },
    {
      id: 'm5-q2',
      q: 'In the LCEL chain `{"context": retriever | format_docs, "question": RunnablePassthrough()} | prompt | model | parser`, what is `RunnablePassthrough()` doing?',
      options: [
        'Retrieving extra documents in parallel with the retriever',
        'Passing the original question through unchanged so it lands in the `{"question": ...}` slot for the prompt',
        'Skipping the model call entirely',
        'Formatting the retrieved documents into a string',
      ],
      answer: 1,
    },
    {
      id: 'm5-q3',
      q: 'Why does a citation chain keep the retrieved Document objects (not just their formatted text) available alongside the generated answer?',
      options: [
        'Documents run faster than plain strings',
        'So the "sources" shown to the user come from the exact same retrieval call that produced the answer, keeping citations accurate',
        'Because ChatAnthropic requires Document objects as input',
        'To avoid calling the embeddings model twice',
      ],
      answer: 1,
    },
    {
      id: 'm5-q4',
      q: 'An "answer only from the provided context, otherwise say you don\'t know" guardrail reduces hallucination but is not perfect. Which of these is a real limitation named in this module?',
      options: [
        'It only works with OpenAI models, not Anthropic',
        'It requires disabling citations',
        'If the right chunk was never retrieved, or the model misreads the context it was given, the guardrail cannot fully prevent a wrong answer',
        'It doubles the token cost of every request',
      ],
      answer: 2,
    },
    {
      id: 'm5-q5',
      q: 'Why does a follow-up like "what about the timing?" fail to retrieve well when asked in isolation, and how does this module fix it?',
      options: [
        'It fails because the vector store is too small; the fix is adding more documents',
        'It fails because it carries almost no topical signal on its own; the fix is a condensing step that rewrites it into a standalone question using recent chat history before retrieval runs',
        'It fails because the model temperature is too high; the fix is lowering it to 0',
        'It fails because Anthropic models cannot handle short questions; the fix is padding the question with filler text',
      ],
      answer: 1,
    },
  ],
}
