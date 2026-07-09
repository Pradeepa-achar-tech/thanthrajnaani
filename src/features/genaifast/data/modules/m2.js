// Module 2 — How LLMs Actually Work
// The only pure theory module in GenAI Fast-Track: just enough intuition about tokens, context
// windows, embeddings, hallucination, generation settings, and picking a provider to reason
// confidently about every module that follows — no math derivations, no training internals.

export const m2 = {
  id: 'm2',
  title: 'How LLMs Actually Work',
  hours: 5,
  color: 'from-violet-500/20 to-violet-700/10',
  accent: 'violet',
  description:
    "The only conceptual module in this course — just enough intuition about how a language model actually works (next-token prediction, tokens, context windows, embeddings) and how to live with one in practice (why hallucination happens, generation settings, picking a provider, cost and latency) to read every module that follows with confidence. No math, no training internals — practitioner intuition only, immediately reinforced with a hands-on token-and-cost estimator before any real API code is written.",
  sections: [
    {
      id: 'm2-s1',
      title: 'Under the Hood, Just Enough',
      topics: [
        {
          id: 'm2-t1',
          title: 'What a language model actually predicts — next-token prediction, in plain terms',
          explain:
            "A large language model is trained to do one narrow thing extremely well: given the text so far, predict the most likely next small chunk of text (a token), one step at a time. Everything else it appears to do — chatting, writing code, translating, answering questions — emerges from repeating that single trick very fast, very well.",
          analogy:
            "Picture the auctioneer at the Gangolli fish market, who has heard so many buyers finish their sentences that they can guess what comes next before it is said — \"kotte kadubu wrapped in...\" is almost certainly followed by \"banana leaf,\" not \"tyre.\" A language model has \"listened\" to an enormous amount of text and learned similar odds: for any half-finished piece of writing, which next word-piece is statistically most likely to come next. It plays that same guess-the-next-piece game billions of times, at high speed, to write a whole reply.",
          theory:
            "This is called autoregressive generation. At each step, the model looks at everything so far (your prompt plus whatever it has generated already) and produces a ranked list of candidate next tokens, then picks one — usually a very likely one, sometimes a slightly less likely one (more on that when we cover temperature). That chosen token gets appended to the text, and the whole process repeats for the next token, and the next, until the reply is done. That loop — rank candidates, pick one, append, repeat — is the entire generation mechanism. There is no separate \"planning\" step and no persistent goal-tracking in the way a person plans a sentence before speaking it; the appearance of planning emerges from a model that has learned, from a huge amount of text, what a well-structured, helpful-sounding answer tends to look like piece by piece.\n\nIt also helps to know what does not happen: the model is a frozen snapshot after training. It does not learn from your conversation and remember it tomorrow — it only ever \"sees\" what is inside the current prompt and conversation history you send it. Every API call starts fresh unless you resend the context yourself. So when Kundapura Sahayaka answers a question about kane fish curry or a temple's evening seva, it is not looking anything up in a private fact database — it is generating the most plausible-sounding continuation of \"a helpful, knowledgeable local assistant answering this question,\" based on patterns it absorbed during training (and, later in this course, based on real facts you explicitly hand it).",
          whyItMatters:
            "Once \"it's next-token prediction, not a database lookup\" clicks, a lot of LLM behavior stops feeling mysterious. Prompt wording matters because it changes which pattern is being completed. Hallucination stops being a bizarre glitch and starts being an expected failure mode — a wrong-but-fluent completion is still a plausible-sounding one. And later modules (prompting, RAG, tool-using agents) are really just different techniques for shaping which completion the model produces, not different kinds of \"thinking.\"",
          steps: [
            "Picture a half sentence — \"Kundapura's famous fish curry is...\" — and list a few plausible next words a well-read local would guess.",
            "Accept that the model plays the same guessing game, but over subword tokens, one token at a time, not whole words.",
            "See that each produced token gets appended to the input, and the next-token guess repeats on the new, longer text.",
            "Recognize the model has no memory between separate API calls — it only knows what is inside the current prompt and history.",
            "Reframe a \"helpful chat answer\" as the most plausible-sounding completion of a helpful assistant's reply, not a retrieval from a fixed knowledge base.",
            "Preview that later topics (temperature, RAG, tools) are levers that shape which plausible completion actually gets produced.",
          ],
          code: `# A toy illustration of "next-token prediction" — NOT a real model, just the mental model.
# Real models learn these odds from billions of examples; here we hardcode a tiny table
# to make the loop (guess next piece, append, repeat) concrete without any math.

next_word_odds = {
    "kundapura's famous fish curry is": ["delicious", "spicy", "kane-based"],
    "the neer dosa recipe needs": ["rice", "coconut", "water"],
}

def toy_predict_next(prompt: str) -> str:
    key = prompt.lower().strip()
    candidates = next_word_odds.get(key, ["(no learned guess for this prompt)"])
    return candidates[0]  # a real model samples from a whole distribution, not always the top pick

print(toy_predict_next("Kundapura's famous fish curry is"))
# -> delicious

print(toy_predict_next("The neer dosa recipe needs"))
# -> rice`,
          pitfalls: [
            "**Assuming the model \"looks up\" facts from storage.** It generates a likely-sounding continuation, not a database query — this is the root cause of hallucination (covered later this module). Fix: treat a confident-sounding answer as unverified until it is grounded in real sources.",
            "**Believing separate conversations share memory.** Each API call is stateless — the model only knows what is inside the current prompt and history. Fix: resend whatever context the model needs in order to \"remember\" it.",
            "**Thinking a longer or more emphatic prompt makes the model \"try harder\".** What matters is which pattern of response the prompt resembles, not effort or tone. Fix: phrase the prompt like a strong example of the answer you actually want.",
            "**Assuming the single most likely next token is always chosen.** Sampling settings (temperature, covered later this module) pick among several likely candidates, not always the top one. Fix: expect some run-to-run variation unless temperature is set very low.",
            "**Expecting knowledge of events after the training cutoff.** The model can only complete patterns from what it saw during training, plus whatever is in the current prompt. Fix: supply fresh facts yourself — grounding, tools, and RAG (later modules) exist precisely for this.",
            "**Over-anthropomorphizing \"it wants to help\".** Useful shorthand in conversation, but the underlying mechanism is statistical pattern completion, not intent. Fix: reason about behavior in terms of \"what completion is plausible here,\" not motives.",
          ],
          tryIt:
            "Extend the `next_word_odds` dictionary with two more Kundapura-flavoured prompts and continuations of your own, then call `toy_predict_next` with a prompt that is not in the table and read the fallback message.",
          takeaway:
            "A language model is a next-token predictor — every clever thing it appears to do later in this course is that one trick, repeated very fast, shaped by good prompts and good context.",
        },
        {
          id: 'm2-t2',
          title: "Tokens and tokenization — why \"strawberry\" isn't 9 characters to a model",
          explain:
            "Models don't read or write in characters or whole words — they read and write in tokens, subword chunks drawn from a fixed vocabulary. A common word is usually one token; a rare or compound word gets split into several smaller pieces, which is why letter-counting or spelling tricks often trip a model up.",
          analogy:
            "A postal sorter doesn't handle whole street addresses as one unit or single letters one at a time — they sort by predefined codes: PIN code, then locality, then street. Tokenization works the same way: the model reads and writes in fixed vocabulary chunks (tokens), and an uncommon word like \"kadubu\" might get broken into two or three familiar sub-pieces, the same way an unfamiliar address still gets routed through familiar PIN-code pigeonholes.",
          theory:
            "Every model has a fixed vocabulary of roughly 50,000 to 100,000+ tokens, learned from training data using a subword algorithm (byte-pair encoding and similar methods). Common English words like \"the\" or \"is\" are usually a single token. Rarer or longer words get split: \"strawberry\" is not one token and is definitely not 9 characters to the model — it is broken into a small number of subword pieces such as \"straw\" and \"berry\" (the exact split depends on the tokenizer). This is exactly why asking a model to count the letters in a word, or reverse a word, is a surprisingly weak task for it — it isn't manipulating characters at all, it is manipulating token chunks.\n\n`tiktoken` is OpenAI's open-source tokenizer library, and its `cl100k_base` encoding is a widely used, convenient way to build token-counting intuition even when you plan to call other providers — Anthropic's Claude models use their own tokenizer internally (and expose their own token-counting endpoint), so `tiktoken` counts are an approximation for Claude, not an exact bill, but they are close enough to reason about budgets. A useful rule of thumb for English prose is roughly 4 characters per token — but that ratio gets noticeably worse for other scripts. Kannada text, for example, often needs more tokens per character than English does, because the tokenizer's vocabulary was trained on far more English text than Kannada text.",
          whyItMatters:
            "Every practical constraint downstream — context window limits, API pricing, generation speed — is counted in tokens, not words or characters. Understanding tokenization now explains odd-seeming model quirks (like miswritten letter counts) and, very concretely, why a Kannada-heavy Kundapura Sahayaka prompt can cost noticeably more tokens than an English prompt of similar length.",
          steps: [
            "Install `tiktoken` and load the `cl100k_base` encoding.",
            "Encode a plain English sentence and count its tokens.",
            "Encode the word \"strawberry\" alone and see its token count is more than one.",
            "Encode a Kannada phrase (like the app's own name) and compare its token count to its character count.",
            "Note the roughly-4-characters-per-token rule of thumb for English, and that it is worse for other scripts.",
            "Connect this directly forward: this exact token count is what an LLM API bills you for and counts against the context window (next topic).",
          ],
          code: `import tiktoken

# cl100k_base approximates GPT-3.5/4-style tokenization; a handy, close-enough
# stand-in for quick intuition even when the real calls later go to Claude or Groq.
enc = tiktoken.get_encoding("cl100k_base")

samples = [
    "strawberry",
    "How many kane fish curry places are open near Kundapura today?",
    "ಕುಂದಾಪುರ ಸಹಾಯಕ",  # "Kundapura Helper" in Kannada
]

for text in samples:
    tokens = enc.encode(text)
    print(f"{text!r} -> {len(tokens)} tokens, {len(text)} characters")

# Typical output shape:
# 'strawberry' -> 2 tokens, 10 characters
# 'How many kane fish curry places are open near Kundapura today?' -> 14 tokens, 64 characters
# 'ಕುಂದಾಪುರ ಸಹಾಯಕ' -> more tokens per character than the English lines above`,
          pitfalls: [
            "**Assuming 1 token = 1 word.** Common short words are one token; rare or compound words split into several subword pieces. Fix: always measure with a tokenizer, never estimate by word count.",
            "**Treating `tiktoken` counts as exact for Claude.** Anthropic uses its own tokenizer; `cl100k_base` is a close-enough approximation for budgeting intuition, not a billing guarantee. Fix: use it to build intuition, and check the provider's own token-counting tool before relying on an exact number.",
            "**Forgetting non-Latin scripts tokenize less efficiently.** Kannada text can use noticeably more tokens per character than English. Fix: re-measure token counts for Kannada content instead of assuming English ratios carry over.",
            "**Asking a model to count or reverse letters in a word.** It doesn't see individual characters, only tokens, so letter-level tasks are unreliable. Fix: don't rely on an LLM for character-level string manipulation — use plain code instead.",
            "**Ignoring whitespace and punctuation as their own tokens.** Formatting-heavy text (markdown, code, bullet lists) adds up faster than it visually looks. Fix: measure the actual prompt text, formatting included, not a mental estimate.",
            "**Not re-checking token counts after editing a prompt template.** Small wording changes shift the count more than expected. Fix: re-run the tokenizer whenever a prompt template changes.",
          ],
          tryIt:
            "Take three real Kundapura Sahayaka sample sentences — one about a seva timing, one about a recipe, one about a ferry schedule — and print their token counts with `tiktoken`. Then translate one of them to Kannada and compare its token count to the English original.",
          takeaway:
            "Models read and write in subword tokens, not characters or words — token count, not text length, is what actually governs context limits and cost.",
        },
        {
          id: 'm2-t3',
          title: 'Context windows — what they are, why they run out, and what happens when they do',
          explain:
            "A context window is the maximum number of tokens a model can consider at once, shared between everything you send in (system prompt, conversation history, any documents) and everything it generates back. Exceed it, and a call fails outright — it doesn't quietly summarize for you.",
          analogy:
            "Picture a whiteboard of fixed size in the temple committee's office. You can keep adding notes, but once it's full, either you're told \"the board is full, erase something first\" or the earliest notes get wiped to make room for new ones. A model's context window is exactly that whiteboard — the whole conversation, any documents, and the current question all have to fit on it together for the model to consider them while producing its next token.",
          theory:
            "Every model has a fixed context window size, measured in tokens — commonly somewhere in the range of 100,000 to 200,000+ tokens for capable models as of writing (always treat a specific number as \"as of writing\" and check the current model card). That budget is shared: your system prompt, the full conversation history you resend, any retrieved documents, and the user's latest question all count as input tokens, and the model's reply counts as output tokens — input plus output together must fit under the window.\n\nCrucially, the context window is not a memory that persists on its own — it is a per-request budget. In a multi-turn chat, \"the model remembers what you said three messages ago\" only works because your code resends the whole conversation history with every new call; the model itself retains nothing between separate API calls. If the running total of tokens exceeds the window, the API call fails with an error — there is no automatic, free summarization happening behind the scenes. You, the developer, are responsible for managing this: trimming old turns, summarizing older history into a shorter form, or — the far better answer for a large knowledge base — retrieving only the handful of relevant snippets instead of stuffing everything in at once (exactly what Module 4-5's RAG system does).",
          whyItMatters:
            "This is precisely why Module 3's first plain chatbot will eventually hit errors or start \"forgetting\" things on a long conversation, and it is exactly why Modules 4-5 introduce RAG: retrieving only the relevant few paragraphs from a much larger knowledge base, instead of trying to cram every seva timing, recipe, and travel note into every single request.",
          steps: [
            "Note today's typical context window sizes (roughly 100k-200k tokens for popular models as of writing) and that both input and output count against it.",
            "Simulate a growing conversation as a list of messages and sum their token counts turn by turn.",
            "See what happens conceptually once total tokens exceed the window — an API error, not silent magic.",
            "Contrast resending the whole conversation each call (what \"memory\" means in practice today) with the model actually remembering nothing on its own.",
            "Sketch a trim-or-summarize strategy so older turns stop crowding out the current question.",
            "Preview RAG as the real answer to a knowledge base too large to ever fit in one context window.",
          ],
          code: `import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
CONTEXT_WINDOW = 200_000     # tokens, ballpark for a modern capable model, as of writing
RESERVED_FOR_REPLY = 1_000   # leave room for the model's own answer

def total_tokens(messages: list[str]) -> int:
    return sum(len(enc.encode(m)) for m in messages)

conversation = [
    "System: You are Kundapura Sahayaka, a helpful local assistant.",
    "User: What time is the evening seva at the temple?",
    "Assistant: The evening seva is usually at 7:00 PM, but check festival days.",
]

budget = CONTEXT_WINDOW - RESERVED_FOR_REPLY
used = total_tokens(conversation)
print(f"Using {used} of {budget} available tokens")

if used > budget:
    print("Over budget: trim or summarize older turns before calling the API")
else:
    print("Within budget: safe to send as-is")`,
          pitfalls: [
            "**Assuming the model remembers earlier chats automatically.** Fix: resend the conversation history yourself on every single call.",
            "**Believing a bigger context window means unlimited space.** It is still finite, and every extra token costs money and adds latency. Fix: budget tokens deliberately instead of treating the window as infinite.",
            "**Cramming an entire knowledge base into the prompt \"just in case\".** It wastes budget and can even degrade answer quality by burying the relevant part. Fix: retrieve only the relevant snippets — that's what RAG (Modules 4-5) is for.",
            "**Not reserving room for the model's own reply.** A full-to-the-brim input can leave no space for a real answer, or hit the limit mid-generation. Fix: budget for `max_tokens` output before filling the input.",
            "**Forgetting the system prompt costs tokens too.** It is resent and billed on every single call, not just once at the start. Fix: count it as part of the running total, every time.",
            "**Assuming context windows are identical across providers and models.** A script tuned for one model's window can silently overflow on a smaller one. Fix: check the specific model's context window before relying on it.",
          ],
          tryIt:
            "Extend the `conversation` list with ten more back-and-forth turns (or paste in a long paragraph), re-run the budget check, and watch the running total climb toward the limit.",
          takeaway:
            "The context window is a shared, per-request token budget for everything in and out — manage it deliberately (trim, summarize, or retrieve) rather than assuming the model remembers, or that space is infinite.",
        },
        {
          id: 'm2-t4',
          title: 'Embeddings — turning text into vectors, and why "similar meaning = nearby vectors"',
          explain:
            "An embedding model turns a piece of text into a fixed-length list of numbers (a vector), positioned so that texts with similar meaning end up close together in that numeric space. This is the practical foundation of searching a knowledge base by meaning instead of exact keyword match.",
          analogy:
            "Imagine every recipe card, seva-timing note, and travel tip Kundapura Sahayaka knows about gets pinned onto a giant wall by topic neighborhood rather than alphabetically — every fish-curry recipe clusters together, every temple-timing note clusters nearby that, and the ferry-schedule notes sit off in a separate corner entirely. An embedding model is what decides where each card gets pinned. \"Close together on the wall\" means \"similar in meaning,\" not similar in spelling.",
          theory:
            "You don't need any linear algebra to use this — just the practical shape of it. A trained embedding model reads a chunk of text and outputs a fixed-length list of numbers (often hundreds of numbers long) that captures the meaning of that chunk. Two chunks about similar things produce number-lists that end up \"close\" to each other by some similarity measure a library computes for you; unrelated chunks produce number-lists that are \"far apart.\" You never need to read or hand-interpret these numbers yourself — you call a library function that tells you how close two vectors are.\n\nThe practical recipe: encode every document in your knowledge base into a vector once, encode the user's question into a vector the same way, then ask a library to find which document vectors sit nearest to the question vector. That's semantic search — and it's exactly the retrieval half of RAG, which Modules 4-5 wire up for real with a vector store (FAISS or Chroma). Contrast this with old-school keyword search: searching for \"neer dosa\" with plain keyword matching would miss a document that only ever says \"rice crepe\" and never uses the word \"dosa\" — but embedding-based search can still surface it, because the meaning is close even though the exact words differ.",
          whyItMatters:
            "Embeddings are the retrieval engine underneath every RAG system built starting Module 4 — understanding \"similar meaning = nearby vectors\" now means the vector-database code later isn't mysterious, it's just \"store the pins on the wall, then find the nearest ones.\"",
          steps: [
            "Picture text chunks as pins on a meaning-map rather than a spelling-map.",
            "Accept that an embedding model turns each chunk of text into a fixed-length list of numbers.",
            "Take as intuition only — no formula required — that \"close numbers\" means \"similar meaning\".",
            "Contrast semantic search (meaning-based) with plain keyword search (exact word match).",
            "Connect the recipe: encode the knowledge base once, encode the user's question the same way, retrieve the nearest matches.",
            "Preview that Modules 4-5 wire this up for real with an actual vector store (FAISS or Chroma).",
          ],
          code: `from sklearn.metrics.pairwise import cosine_similarity

# Pretend an embedding model already turned these texts into number-lists.
# Real embeddings have hundreds of numbers; these tiny ones are only for illustration —
# you never need to read numbers like this yourself, only call a library to compare them.
neer_dosa_recipe  = [[0.9, 0.1, 0.0]]   # "meaning cluster": local recipes
kane_curry_recipe = [[0.8, 0.2, 0.0]]   # also a recipe -> should read as "close"
ferry_schedule    = [[0.0, 0.1, 0.9]]   # a totally different topic

print(cosine_similarity(neer_dosa_recipe, kane_curry_recipe))  # near 1.0 = similar meaning
print(cosine_similarity(neer_dosa_recipe, ferry_schedule))     # near 0.0 = unrelated meaning`,
          pitfalls: [
            "**Expecting embeddings to match on shared words.** They match by meaning, so paraphrases can score high with zero word overlap. Fix: judge embedding search by meaning, not literal keyword overlap.",
            "**Mixing embeddings from two different models.** Vectors produced by different embedding models are not comparable to each other, even if they're the same length. Fix: embed everything — documents and queries alike — with the same model.",
            "**Assuming embeddings \"understand\" facts.** They capture similarity, not truth; a false document embeds and retrieves just like a true one would. Fix: still verify what gets retrieved — embeddings don't fact-check (more in the RAG modules).",
            "**Forgetting to re-embed edited documents.** The stored vector goes stale relative to the new text once the source changes. Fix: re-embed and re-store whenever the underlying text is edited.",
            "**Treating the closest match as the only right answer.** Retrieval returns candidates, not guarantees, especially for short or ambiguous queries. Fix: review the top few matches rather than blindly trusting rank one.",
            "**Using semantic search for exact structured lookups.** Something like \"what's today's date\" is cheaper and more reliable as plain code than as a vector search. Fix: reserve embeddings for genuinely fuzzy, meaning-based matching.",
          ],
          tryIt:
            "Add a fourth toy vector for a \"temple seva timing\" text — guess before running whether it should score closer to the recipes or sit in its own corner, then check with `cosine_similarity`.",
          takeaway:
            "An embedding model turns text into numbers positioned by meaning — nearby vectors mean similar meaning, which is what lets you search a knowledge base by concept instead of by exact keyword.",
        },
      ],
    },
    {
      id: 'm2-s2',
      title: 'Living With an LLM',
      topics: [
        {
          id: 'm2-t5',
          title: 'Why hallucination happens, and why grounding/RAG helps',
          explain:
            "Hallucination is a model producing a fluent, confident-sounding answer that is factually wrong or invented, because it is optimizing for a plausible-sounding continuation, not a verified fact. Grounding the model in real supplied facts — the core idea behind RAG — sharply reduces this by giving it real material to paraphrase from instead of relying purely on trained-in patterns.",
          analogy:
            "A confident local guide who has never actually visited a specific small temple, but has described dozens of similar temples before, will often still answer smoothly if asked about it — filling gaps from what's typical rather than what's true, sounding every bit as sure as when they genuinely know the answer. A language model behaves the same way: equally fluent whether it truly knows the answer or is filling a gap, because fluency is exactly what it was trained to produce.",
          theory:
            "Recall next-token prediction from the first topic: the model produces the most plausible continuation of the conversation so far. That is usually right when a topic is well represented in training data and answerable from general patterns — but it goes wrong in a few predictable ways. Obscure, local, or very specific information (an exact festival date for a small Kundapura-area temple) very likely never appeared in training data at all. Asked a question with no real answer available to it, the model tends to fill in something plausible-sounding rather than say \"I don't know\" — because models are trained to be fluent and helpful, not to naturally abstain. And numbers, dates, and citations are especially risky, because a plausible-looking wrong number reads exactly as fluently as a correct one.\n\nGrounding is the practical fix: instead of relying purely on the model's trained-in knowledge, you supply the actual facts directly in the prompt — retrieved documents, tool results, structured data — and instruct the model to answer from those specific facts, not from memory. This is what RAG does automatically (Modules 4-5), and what a tool call does with live data (Modules 6-7). Grounding does not eliminate hallucination completely — the model can still misread or blend the supplied context — but it sharply reduces the risk, because \"complete this from the attached document\" is a far safer pattern to complete than \"complete this from general training.\"",
          whyItMatters:
            "This is arguably the single most important practical fact about working with LLMs in production. Module 3's plain chatbot will confidently hallucinate about Kundapura seva timings it was never told — and that exact failure is the reason Modules 4-5 exist. Recognizing hallucination now, and knowing grounding is the fix, turns \"the AI lied to me\" into \"I forgot to give it the source material.\"",
          steps: [
            "Recall next-token prediction — fluent completion, not fact lookup — from the first topic.",
            "Walk through a plausible-but-wrong example: a specific festival date the model was never told, answered confidently anyway.",
            "Identify the highest-risk categories: obscure local facts, exact numbers/dates, citations, and anything after the training cutoff.",
            "Learn the fix: grounding — supply the real facts in context and instruct the model to answer only from them.",
            "Preview RAG (retrieval as automatic grounding, Modules 4-5) and tool calls (live data as grounding, Modules 6-7).",
            "Accept that grounding reduces, but does not eliminate, hallucination — the model can still misread or invent even with sources supplied.",
          ],
          code: `UNGROUNDED_SYSTEM_PROMPT = """You are Kundapura Sahayaka, a helpful local assistant.
Answer the user's question about temples, recipes, and travel."""
# Risk: for anything obscure, the model will still answer fluently — possibly wrong.

GROUNDED_SYSTEM_PROMPT = """You are Kundapura Sahayaka, a helpful local assistant.
Answer ONLY using the facts in <context> below. If the answer is not in
<context>, say you don't have that information — do not guess.

<context>
{retrieved_facts}
</context>"""

retrieved_facts = "Kalleshwara temple evening seva: 7:00 PM daily; Fridays 7:30 PM."
grounded_prompt = GROUNDED_SYSTEM_PROMPT.format(retrieved_facts=retrieved_facts)
print(grounded_prompt)`,
          pitfalls: [
            "**Trusting a confident tone as a proxy for correctness.** LLMs sound equally sure whether they are right or wrong. Fix: verify facts against real sources, especially for obscure or local details.",
            "**Asking open-ended factual questions with no supplied source.** Obscure local details — a specific temple's festival date — are exactly where hallucination is most likely. Fix: ground the answer in retrieved or provided facts before trusting it.",
            "**Forgetting to instruct the model to say \"I don't know\".** Without that explicit instruction, it will usually still attempt a plausible-sounding answer. Fix: tell it clearly to decline when the supplied context doesn't contain the answer.",
            "**Assuming RAG makes hallucination impossible.** It sharply reduces the risk, but the model can still misread or blend retrieved context. Fix: keep treating grounded answers as \"much safer,\" not \"guaranteed correct.\"",
            "**Ignoring the training cutoff for time-sensitive questions.** Old festival dates or prices can be stated as if they were still current. Fix: ground anything time-sensitive in fresh, explicitly supplied data.",
            "**Skipping source display in a grounded answer.** Without showing what was used, a user has no way to verify the response. Fix: surface which retrieved facts actually backed the answer.",
          ],
          tryIt:
            "Write both an ungrounded and a grounded system prompt for the question \"What time is the Kalleshwara temple evening seva on Fridays?\", then note in one sentence which one you would trust and why.",
          takeaway:
            "Hallucination is fluent guessing when real facts aren't supplied — grounding the model in retrieved or tool-provided facts (RAG, later modules) is the practical fix, not a bigger or \"smarter\" model.",
        },
        {
          id: 'm2-t6',
          title: 'Generation knobs: temperature, top-p, max tokens — what they actually change in output',
          explain:
            "Temperature, top_p, and max_tokens are parameters set on every API call that control how random or creative the output is, and how long the reply is allowed to be — three small numeric knobs with an outsized effect on how an app's answers feel.",
          analogy:
            "Picture the fish-market auctioneer again: a very low temperature is the seasoned auctioneer who always calls out the single price everyone expects; a high temperature is a livelier, more improvisational caller who'll occasionally call an unusual number to keep things interesting. Both are working from the same underlying odds — the difference is only how willing they are to stray from the single most likely pick.",
          theory:
            "Temperature controls how willing the model is to pick a less-likely-but-still-plausible next token instead of always the top-ranked one. A temperature near 0 is close to deterministic and highly predictable — best for factual Q&A, code, and structured extraction, where you want the same question to get essentially the same answer every time. A higher temperature (roughly 0.7-1.0, depending on the provider's scale) produces more varied, less repetitive phrasing — better for brainstorming or casual chat — but it also raises the risk of inconsistency and, indirectly, hallucination.\n\ntop_p (nucleus sampling) is an alternative, related way to shrink the pool of candidate next tokens the model is allowed to sample from — only the smallest set of tokens whose combined probability passes the threshold p is considered. Most SDKs expose temperature, and some also expose top_p; the practical guidance is to tune one at a time and leave the other near its default, since combining aggressive changes to both makes the output unpredictable in confusing ways.\n\nmax_tokens is a completely different kind of knob: it is a hard ceiling on how many tokens the model's reply is allowed to contain — not a quality or creativity setting. Set it too low, and a reply gets abruptly cut off mid-sentence. Set it very high, it does not force the model to write more — it only permits the reply to run longer if the model's own natural stopping point is further out, at the cost of possibly higher latency and spend if it does. A practical starting point for Kundapura Sahayaka: temperature around 0.2-0.3 for factual seva-timing or recipe lookups, and higher (around 0.7) for a looser, chattier mode.",
          whyItMatters:
            "These are the first parameters a learner sets on literally every real API call starting Module 3 — getting temperature and max_tokens right is the difference between a chatbot that gives consistent, trustworthy seva timings and one that improvises a slightly different answer every time the same question is asked.",
          steps: [
            "Note temperature controls randomness of next-token choice: near 0 is most predictable, higher is more varied.",
            "See top_p as an alternate, related way to shrink the candidate pool the model samples from.",
            "Recognize max_tokens as a hard length ceiling, not a quality or creativity setting.",
            "Match settings to the task: low temperature for factual/consistent answers, higher for casual or creative ones.",
            "Diagnose a reply cut off mid-sentence correctly — as max_tokens too low, not a model failure.",
            "Adopt the rule of thumb: tune one of temperature or top_p at a time, and leave the other near its default.",
          ],
          code: `import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment

def ask(question: str, temperature: float, max_tokens: int) -> str:
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=max_tokens,
        temperature=temperature,
        messages=[{"role": "user", "content": question}],
    )
    return response.content[0].text

# Factual lookup: keep it low and consistent.
print(ask(
    "What time is evening seva usually held at a coastal Karnataka temple?",
    temperature=0.2, max_tokens=100,
))

# Casual chit-chat: allow more variety.
print(ask(
    "Suggest a fun weekend plan around Kundapura.",
    temperature=0.8, max_tokens=150,
))`,
          pitfalls: [
            "**Setting temperature high for factual lookups.** Answers become inconsistent run to run, undermining trust in a seva-timing bot. Fix: keep temperature low (roughly 0.1-0.3) for factual, consistent tasks.",
            "**Setting temperature to 0 for creative or brainstorming tasks.** Output becomes repetitive and stiff. Fix: raise temperature for tasks that genuinely benefit from variety.",
            "**Tuning both temperature and top_p aggressively at once.** Their effects compound unpredictably. Fix: change one at a time, leaving the other near its default.",
            "**Setting `max_tokens` too low and mistaking a cut-off reply for a broken prompt.** Fix: size `max_tokens` to the length of answer you actually expect.",
            "**Assuming a high `max_tokens` forces a longer answer.** It only raises the ceiling; the model still stops when its own reply is naturally done. Fix: don't rely on `max_tokens` to control verbosity — shape that with the prompt instead.",
            "**Reusing one \"good\" setting everywhere in the app.** A temperature right for factual lookups may be wrong for a casual chat feature in the same app. Fix: tune generation settings per feature, not globally.",
          ],
          tryIt:
            "Call the same question twice at temperature 0.1 and twice at temperature 0.9, side by side, and note how much the wording changes across runs at each setting.",
          takeaway:
            "Temperature and top_p tune how adventurous the token choice is, and max_tokens is a hard length ceiling — pick low temperature for facts, higher for creativity, and size max_tokens to the answer you actually expect.",
        },
        {
          id: 'm2-t7',
          title: 'Open vs closed models, and picking a provider pragmatically',
          explain:
            "Closed models (Claude, GPT, Gemini) are reached only through a hosted API, paid per token; open-weight models (Llama, Mistral, and similar) have downloadable weights you or a host can run yourself. Picking a provider for a real project is a pragmatic tradeoff across speed, cost, and quality — not a loyalty decision.",
          analogy:
            "A closed model is like ordering fish curry from a well-regarded restaurant kitchen — you never see the recipe, you just get the plate. An open-weight model is like getting the actual recipe to cook yourself, wherever you want. Groq is like a very fast delivery service that happens to serve dishes cooked from an open recipe — you still don't own the kitchen, but the plate arrives remarkably quickly.",
          theory:
            "Closed, hosted models — Anthropic's Claude, OpenAI's GPT, Google's Gemini — are used only by calling an API. You pay per token, never see the model weights, and get frequent quality upgrades without changing anything yourself. Open-weight models — Meta's Llama, Mistral, and others — publish downloadable weights that you, or a host, can run on your own infrastructure, giving full control and privacy at the cost of managing that infrastructure.\n\nGroq is a real, useful middle ground worth knowing: it is an inference provider that runs open-weight models (like Llama) on custom hardware built for very low latency, accessed through its own hosted API — \"open model, hosted delivery,\" essentially. It is what many real apps reach for specifically when snappy, low-latency responses matter more than anything else.\n\nA practical decision framework, not a religious one: Anthropic's Claude tends to be a strong pick for reasoning and writing quality with generous context windows, a good fit for the assistant/agent core of Kundapura Sahayaka — and it's the course's primary provider for exactly this reason. OpenAI's GPT models have a broad ecosystem and heavy documentation, useful when following tutorials or plugging into `langchain` examples. Groq is worth reaching for specifically when demo latency matters — a very fast reply feels dramatically better in a live demo than a marginally higher-quality but slower one. Self-hosting open models on your own GPUs is out of scope for a fast-track beginner course; hosted APIs, whether closed or Groq-hosted-open, are the practical starting point. The reassuring part: the underlying call pattern (send messages, get text back) is nearly identical across all three, so switching later is cheap.",
          whyItMatters:
            "A learner who sees these as \"basically the same API shape with different tradeoffs\" won't get stuck vendor-locked or paralyzed by choice. Module 3 picks Anthropic as the course's primary provider precisely because of this pragmatic reasoning, not dogma — and a learner can swap providers later with minimal code change.",
          steps: [
            "Define closed/hosted models (Claude, GPT, Gemini) — API-only access, paid per token.",
            "Define open-weight models (Llama, Mistral) — downloadable weights, self-hosted or hosted by a third party.",
            "Place Groq in context: a fast inference host running open-weight models through its own hosted API.",
            "Compare the three practically on speed, cost, and output quality/reasoning for the task at hand.",
            "Land on a default for this course (Anthropic Claude) and note why — quality, generous context, and it's this site's primary provider.",
            "Recognize the underlying call pattern (send messages, get text) is nearly identical across providers, so switching later stays cheap.",
          ],
          code: `# The SAME question, sent to three different providers.
# Notice how similar the call shape is across all three — that similarity is
# exactly what makes "pick pragmatically, switch later" a realistic plan.

import anthropic
import openai
from groq import Groq

question = "In one sentence, what is neer dosa?"

# Anthropic — course default: strong reasoning, generous context window.
claude = anthropic.Anthropic()
claude_answer = claude.messages.create(
    model="claude-sonnet-4-5", max_tokens=100,
    messages=[{"role": "user", "content": question}],
).content[0].text

# OpenAI — broad ecosystem, widely documented in tutorials.
gpt = openai.OpenAI()
gpt_answer = gpt.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": question}],
).choices[0].message.content

# Groq — hosts open-weight models (e.g. Llama) on very fast custom hardware.
groq = Groq()
groq_answer = groq.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": question}],
).choices[0].message.content

print("Claude:", claude_answer)
print("GPT:", gpt_answer)
print("Groq/Llama:", groq_answer)`,
          pitfalls: [
            "**Treating \"open\" as automatically cheaper or better.** Self-hosting has real infrastructure cost and effort; a hosted open model (Groq) still charges per token. Fix: compare actual total cost, not just the open/closed label.",
            "**Picking a provider based on hype rather than the task.** A snappy demo UI benefits more from Groq's speed than from a slightly higher-quality but slower model. Fix: match the provider to what the specific feature actually needs.",
            "**Assuming every provider's API is identical.** Message formats, parameter names, and model names differ between SDKs. Fix: expect small adapter code whenever you switch providers.",
            "**Forgetting hosted \"open\" services still need authentication and billing.** Groq still requires an API key and charges per token, same as any hosted API. Fix: budget for it exactly like a closed-model provider.",
            "**Locking business logic to one provider's exact response shape everywhere in the app.** A future switch becomes expensive. Fix: isolate the API call behind one small wrapper function.",
            "**Believing model quality is static.** Providers update models frequently; a comparison from months ago may already be outdated. Fix: re-check current benchmarks and pricing before a real decision.",
          ],
          tryIt:
            "Write a one-paragraph note (no code) comparing Anthropic, OpenAI, and Groq for \"the fastest, cheapest way to demo Kundapura Sahayaka to a friend on a phone hotspot,\" and pick one with a stated reason.",
          takeaway:
            "Closed models (Claude/GPT) are pay-per-token hosted APIs, open-weight models (Llama/Mistral) are downloadable weights often served fast by hosts like Groq — pick pragmatically on speed, cost, and quality for the task, since the underlying call pattern is nearly identical across all three.",
        },
        {
          id: 'm2-t8',
          title: 'Cost and latency basics — tokens = money = time',
          explain:
            "Every token sent and received costs real money, priced per million tokens with input and output usually priced differently, and real time — more tokens generally means more generation time. Token-awareness is a concrete engineering constraint, not an academic detail, for anything meant to survive real usage.",
          analogy:
            "Paying for LLM usage is like paying auto-rickshaw fare by the kilometer, not by the trip — a longer ride, meaning more tokens in and out, costs proportionally more, and it also plainly takes longer to arrive, regardless of the fare.",
          theory:
            "Providers charge per one million tokens, almost always with separate — and usually higher — rates for output tokens than input tokens, and pricing varies a lot by model tier: a small, fast model is typically far cheaper per token than a large flagship model. The plain-language cost formula is: cost = (input tokens ÷ 1,000,000 × input price) + (output tokens ÷ 1,000,000 × output price). Prices change over time, so treat any specific number, including the ones in this module's project, as \"as of writing\" — always check the provider's current pricing page before relying on a number for a real budget.\n\nLatency has two practical parts: time-to-first-token, how long before the reply starts appearing at all, and total generation time, which is roughly proportional to how many output tokens are produced. Both matter for how snappy a chat UI feels — streaming the response as it's generated (covered from Module 3 onward) improves perceived latency even when total generation time stays about the same.\n\nThe practical thread running through the rest of this course: resending a system prompt on every single call, letting a chat history grow unbounded, or stuffing an entire knowledge base into context (exactly what RAG in Modules 4-5 avoids) all directly multiply both cost and latency, on every single reply. Token-consciousness is a real engineering constraint for anything meant to run beyond a class exercise.",
          whyItMatters:
            "This is the direct bridge into this module's Mini Project. A learner who can estimate \"this feature costs about this much per thousand uses and adds about this much latency\" before writing a line of real API code is thinking like someone building something that has to survive contact with real usage and a real budget.",
          steps: [
            "Note providers price per one million tokens, with input and output priced separately (output usually pricier).",
            "Write out the plain-language cost formula: tokens ÷ 1,000,000 × price-per-million, summed for input and output.",
            "Recognize model tier changes price substantially — a small, fast model can be far cheaper per token than a flagship model.",
            "Separate time-to-first-token from total generation time as the two latency numbers that actually matter for UI feel.",
            "Connect \"more resent history, more stuffed context\" directly to \"more cost and more latency, on every single call.\"",
            "Adopt the habit of doing a rough token/cost/latency estimate before building a feature — exactly what the Mini Project below has you do.",
          ],
          code: `# A tiny, hardcoded price table — CHECK the provider's current pricing page
# before relying on these numbers for a real budget; prices change over time.
PRICE_PER_MILLION_TOKENS_USD = {
    "claude-sonnet": {"input": 3.00, "output": 15.00},
    "claude-haiku":  {"input": 0.80, "output": 4.00},
    "gpt-4o-mini":   {"input": 0.15, "output": 0.60},
}

def estimate_cost_usd(model: str, input_tokens: int, output_tokens: int) -> float:
    price = PRICE_PER_MILLION_TOKENS_USD[model]
    return (input_tokens / 1_000_000 * price["input"]
            + output_tokens / 1_000_000 * price["output"])

cost = estimate_cost_usd("claude-sonnet", input_tokens=800, output_tokens=200)
print(f"Estimated cost for one Kundapura Sahayaka reply: \${cost:.5f}")
print(f"Estimated cost for 1,000 replies: \${cost * 1000:.2f}")`,
          pitfalls: [
            "**Pricing only the output tokens.** Every resent input — system prompt plus history — is billed on every single call too. Fix: count both input and output tokens in any estimate.",
            "**Using stale prices in a real budget.** Provider pricing changes over time. Fix: always re-check the provider's current pricing page before shipping a real budget.",
            "**Assuming all models from one provider cost the same.** Flagship versus small/fast tiers can differ by 10x or more. Fix: price the exact model you plan to call, not the provider in general.",
            "**Ignoring latency because \"the answer is correct\".** A technically correct reply that takes eight seconds can feel broken to a real user. Fix: track latency alongside cost, not just correctness.",
            "**Not accounting for growing chat history.** Cost per call quietly climbs turn by turn across a long conversation unless it's trimmed or summarized. Fix: budget for that growth, or manage history actively (previous topic).",
            "**Optimizing only for the cheapest model.** Cost, latency, and quality are a three-way tradeoff — the cheapest model can genuinely hurt quality for some tasks. Fix: weigh all three, per the previous provider-picking topic.",
          ],
          tryIt:
            "Using the price table above, estimate the cost of 10,000 Kundapura Sahayaka replies per day at 800 input and 200 output tokens each, for both `claude-sonnet` and `claude-haiku`, and compare the monthly totals.",
          takeaway:
            "Tokens map directly to both money (input and output priced per million, checked against current pricing) and time (more tokens, more latency) — estimate both before building, exactly what the Mini Project below has you do next.",
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm2-p1',
      type: 'Mini Project',
      title: 'Token & Cost Estimator',
      domain: 'LLM Fundamentals',
      duration: '1-2 hrs',
      description:
        "A small Python script that takes a handful of sample Kundapura Sahayaka prompts — a couple of short questions and one long paragraph of context — counts their real token usage with tiktoken, and estimates the ₹/$ cost of each across a few real provider/model price points. It reinforces token, context, and cost intuition concretely, before writing any real API code in Module 3.",
      tools: ['Python', 'tiktoken'],
      blueprint: {
        overview:
          "This is the module's payoff project: a token-and-cost gut check you can run before ever calling a real LLM API. You hardcode a small set of realistic sample prompts — including one long, RAG-style paragraph of pretend retrieved context — measure their true input token counts with tiktoken, hardcode a small price table for a few real provider/model price points, and print a clean per-prompt, per-model cost comparison plus grand totals. By the end, token counts, context budgets, and API pricing stop being abstract and become numbers you've actually computed yourself.",
        functionalRequirements: [
          "Define at least five sample prompts representing realistic Kundapura Sahayaka use: two short factual questions (e.g. a seva timing, a recipe question), one medium request (e.g. ferry directions in three steps), and one long prompt containing a full paragraph (150-250 words) of made-up retrieved context, simulating what a future RAG prompt will look like.",
          "Count each prompt's real input tokens using tiktoken's cl100k_base encoding, and pair each prompt with a sensible hardcoded guess for its expected output tokens (short answers around 50-80, the long one around 250-300).",
          "Hardcode a small price table (USD per 1M tokens) for at least three real provider/model price points (e.g. Claude Sonnet, Claude Haiku, GPT-4o-mini) with separate input and output prices, clearly labelled as prices as of writing that must be verified before relying on them for a real budget.",
          "For every prompt, print its token count and its estimated cost across every model in the price table, in a tidy, readable, table-like format in the terminal.",
          "Print a grand total per model: the cost of running all sample prompts once through that model, so the price spread across models is visible side by side at a glance.",
        ],
        technicalImplementation: [
          "Use `tiktoken.get_encoding('cl100k_base')` to tokenize every prompt, noting in a comment that this is an approximation for non-OpenAI models but good enough for budgeting intuition.",
          "Store prompts as a list of dicts, each with `label`, `text`, and `expected_output_tokens`, so the estimator is easy to extend with more prompts later.",
          "Store the price table as a dict of dicts keyed by model name, each holding `input` and `output` USD-per-million rates.",
          "Write a pure function `estimate_cost(input_tokens, output_tokens, model) -> float` with no side effects, reused for every prompt/model pair.",
          "Format the printed output with f-strings and right-aligned numeric columns (e.g. Python's `str.rjust`) so the comparison table reads cleanly in a plain terminal.",
        ],
        prompts: [
          {
            step: 1,
            label: 'Seed the sample prompts',
            outcome:
              'A `SAMPLE_PROMPTS` list of five realistic Kundapura Sahayaka prompts — two short questions, one medium request, and one long RAG-style paragraph — each with a label and an expected output token guess.',
            prompt:
              "Create a Python list named SAMPLE_PROMPTS where each item is a dict with keys label, text, and expected_output_tokens. Add five entries: two short factual questions about Kundapura (for example, a temple seva timing and a local recipe question), one medium request (for example, 'explain how to reach Gangolli by ferry from Kundapura in 3 steps'), and one long prompt that pastes in a full paragraph of 150-250 words of made-up retrieved context about local temple festival dates, simulating what a future RAG prompt will look like. Give each entry a sensible expected_output_tokens guess — short answers around 50-80, the long one around 250-300.",
          },
          {
            step: 2,
            label: 'Count real input tokens with tiktoken',
            outcome:
              "Each prompt's true input token count computed and printed using tiktoken's cl100k_base encoding, alongside its character count.",
            prompt:
              "Install tiktoken and write a function count_tokens(text) that returns the token count of a string using tiktoken.get_encoding('cl100k_base'). Loop over SAMPLE_PROMPTS, compute each prompt's real input token count, and print its label, character count, and token count side by side so I can see the ratio isn't a fixed 4-characters-per-token, especially for the long paragraph prompt.",
          },
          {
            step: 3,
            label: 'Build the price table and a pure cost estimator',
            outcome:
              'A hardcoded PRICES table for at least three provider/model price points with separate input/output USD-per-million rates, and a pure estimate_cost function.',
            prompt:
              "Add a dict named PRICES keyed by model name, using at least claude-sonnet, claude-haiku, and gpt-4o-mini, where each value is a dict with 'input' and 'output' keys holding realistic 2025-era USD-per-million-token rates. Add a comment noting these are prices as of writing and must be checked against the provider's current pricing page before relying on them for a real budget. Then write a pure function estimate_cost(input_tokens, output_tokens, model) that returns the estimated USD cost for that model, with no side effects, so it's easy to test on its own.",
          },
          {
            step: 4,
            label: 'Print the comparison table and grand totals',
            outcome:
              'Console output showing every prompt\'s input token count and estimated USD cost per model, plus a grand total row per model for running all five prompts once.',
            prompt:
              "Using count_tokens, SAMPLE_PROMPTS, PRICES, and estimate_cost, print a table where each row is one sample prompt, showing its input token count and its estimated cost under every model in PRICES, right-aligned so it reads cleanly in a terminal. After the per-prompt rows, print a grand total row that sums the cost of running every sample prompt once through each model, so I can see at a glance which model is cheapest overall for this workload. Optionally add a rough USD-to-INR conversion using one hardcoded exchange rate constant.",
          },
        ],
        deliverable:
          "A runnable token_cost_estimator.py that prints, for five realistic Kundapura Sahayaka prompts (including one long RAG-style paragraph), each prompt's true tiktoken input token count and its estimated cost across at least three provider/model price points, plus a grand total per model — a concrete, before-writing-any-API-code gut check for how tokens turn into money.",
      },
    },
  ],
  quiz: [
    {
      id: 'm2-q1',
      q: "Why might the word \"strawberry\" cost more than one token to a language model?",
      options: [
        'Because the model reads letter by letter, not in tokens',
        'Because tokenizers split uncommon or longer words into smaller subword pieces drawn from a fixed vocabulary',
        'Because "strawberry" is a restricted word requiring extra encoding',
        'Because token count always equals character count for every word',
      ],
      answer: 1,
    },
    {
      id: 'm2-q2',
      q: 'In a long multi-turn chat, why can an API call suddenly fail with an error?',
      options: [
        'The model needs to be manually restarted after a fixed number of turns',
        "The combined input and output tokens exceed the model's fixed context window budget",
        'The provider blocks any conversation longer than exactly 10 turns',
        'The model automatically forgets old messages, so length never actually matters',
      ],
      answer: 1,
    },
    {
      id: 'm2-q3',
      q: 'What does it mean when two pieces of text have "nearby" embedding vectors?',
      options: [
        'They were written by the same author',
        'They share most of the same exact keywords',
        'They are judged to have similar meaning, even if the wording is very different',
        'They were both included in the same single API call',
      ],
      answer: 2,
    },
    {
      id: 'm2-q4',
      q: "Why does grounding a model's answer in retrieved documents (as in RAG) reduce hallucination?",
      options: [
        "It automatically lowers the model's temperature setting",
        'It gives the model real facts to base its fluent completion on, instead of relying only on patterns learned during training',
        'It disables next-token prediction entirely for that request',
        'It forces the model to only ever output single-word answers',
      ],
      answer: 1,
    },
    {
      id: 'm2-q5',
      q: 'A team resends the full, growing chat history plus a large system prompt on every single API call. What is the direct consequence?',
      options: [
        'Nothing changes — only the very first call in a conversation is ever billed',
        'Latency is affected, but the cost per call stays exactly the same',
        'Both cost and latency rise turn by turn, since every resent token is billed and generated against on every call',
        "The provider's context window automatically compresses old messages for free",
      ],
      answer: 2,
    },
  ],
}
