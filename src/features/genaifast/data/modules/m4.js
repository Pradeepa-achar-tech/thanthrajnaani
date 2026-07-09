// Module 4 — LangChain & RAG, Part 1: From Documents to a Vector Store
// The indexing half of RAG for Kundapura Sahayaka: load the small local knowledge base
// (temple/festival, recipes, travel notes), chunk it sensibly, embed the chunks, and store
// them in a local vector store (FAISS or Chroma) so Module 5 can search and generate over it.

export const m4 = {
  id: 'm4',
  title: 'LangChain & RAG, Part 1 — From Documents to a Vector Store',
  hours: 7,
  color: 'from-orange-500/20 to-orange-700/10',
  accent: 'orange',
  description:
    'Module 3 gave Kundapura Sahayaka a voice but no memory — it guesses at seva timings and recipes because nothing grounds its answers. This module builds the **indexing** half of RAG (Retrieval-Augmented Generation): load a handful of markdown documents, split them into sensibly-sized chunks, turn those chunks into embedding vectors, and store them in a local vector database. By the end you will have a searchable knowledge base on disk — Module 5 wires it to the LLM so answers are grounded in what you actually wrote, not what the model remembers.',
  sections: [
    {
      id: 'm4-s1',
      title: 'Preparing Knowledge',
      topics: [
        {
          id: 'm4-t1',
          title: 'What LangChain actually gives you (loaders, splitters, chains — glue code, not magic) and when you don\'t need it',
          explain:
            '**LangChain** is a Python library of small, composable building blocks — document loaders, text splitters, vector-store wrappers, and "chains" that string steps together — for the repetitive plumbing around LLM apps. It does not add intelligence; the LLM still does all the reasoning.',
          analogy:
            'Think of the fish market at Gangolli early morning. The fish itself — the actual product people came for — is the LLM\'s reasoning. LangChain is the crates, ice boxes, weighing scales, and handcarts the sellers use to move that fish around efficiently: none of that equipment makes the fish fresher, it just standardises how you carry, weigh, and hand it off so every stall does not reinvent its own cart from scratch. Skip the cart for a single fish you are carrying home yourself; use it once you are moving crates all day.',
          theory:
            'Every RAG pipeline needs the same handful of steps: read files off disk, split long text into chunks, turn chunks into vectors, store and search those vectors, and finally hand retrieved text to an LLM. **LangChain** provides pre-built, tested pieces for each step — `DocumentLoader` classes (`TextLoader`, `PyPDFLoader`, …), `TextSplitter` classes (`RecursiveCharacterTextSplitter`), vector-store wrappers (`FAISS`, `Chroma`) with a common `.from_documents()` / `.similarity_search()` interface, and "chains" that wire retrieval + a prompt + an LLM call into one callable. The library itself calls no model and stores no data on its own — it wraps *your* embedding API and *your* vector store choice behind consistent interfaces, and its splitters and loaders are ordinary Python functions you could write yourself given enough time.\n\nThat last point matters for judgement: for a **single script that reads one file and calls the Anthropic SDK once**, LangChain is overhead — you would spend more time learning its abstractions than the plain code takes to write. It earns its keep once you have *multiple* loaders, *swappable* vector stores, or *chains* of steps you want to reuse and compose — exactly the shape Kundapura Sahayaka is about to take: several document types, a vector store you might swap from FAISS to Chroma, and (in Module 6) tools chained together. Recognising "glue code library, not magic" up front stops you from either dismissing it as unnecessary or trusting it to do reasoning it cannot do.',
          whyItMatters:
            'LangChain shows up in almost every GenAI job posting, and interviewers probe whether you understand it is orchestration, not intelligence — confusing the two is a red flag. For Kundapura Sahayaka, this module is exactly the case where LangChain pays off: three document types, a chunking strategy, and a vector store you will use again unchanged in Modules 5-7, so writing the loader/splitter plumbing once and reusing it is a real time saver, not resume-padding.',
          steps: [
            'List the five recurring RAG steps: load, split, embed, store, retrieve.',
            'Note LangChain gives a class for each step with a consistent, swappable interface.',
            'Confirm LangChain itself makes no LLM calls and stores no vectors — it wraps your chosen embedding API and vector store.',
            'Contrast a one-off script (skip LangChain) with a multi-loader, multi-source pipeline (use it).',
            'Install `langchain`, `langchain-community`, and `langchain-text-splitters` in the project virtualenv.',
            'Import `TextLoader` and print its class docstring to see it is a thin wrapper over `open()`.',
          ],
          code: `# Install the pieces this module needs (in your activated venv):
# pip install langchain langchain-community langchain-text-splitters faiss-cpu

from langchain_community.document_loaders import TextLoader

# LangChain's TextLoader is a thin wrapper — it just reads the file
# and returns a list of Document objects with .page_content and .metadata.
loader = TextLoader("data/kb/temple_calendar.md", encoding="utf-8")
docs = loader.load()

print(type(docs))            # <class 'list'>
print(len(docs))              # 1 — one Document per file, for TextLoader
print(docs[0].page_content[:80])
print(docs[0].metadata)       # {'source': 'data/kb/temple_calendar.md'}`,
          pitfalls: [
            '**Expecting LangChain to "know" your data.** It only moves text around; the LLM (Module 5) is what reasons over it. Fix: keep the mental model "plumbing, not intelligence".',
            '**Reaching for LangChain on a single-file, single-call script.** The abstraction overhead outweighs the benefit. Fix: write plain Python until you have several composable steps.',
            '**Installing the old monolithic `langchain` package and expecting everything in one import.** Recent LangChain splits loaders/splitters/community integrations into separate packages. Fix: install `langchain-community` and `langchain-text-splitters` alongside `langchain`.',
            '**Assuming a "chain" always calls an LLM.** A loader→splitter chain in this module never touches a model. Fix: read what each step actually does, not what its name suggests.',
            '**Pinning no version at all.** LangChain\'s APIs move fast between minor versions and imports move between packages. Fix: pin versions in `requirements.txt` once your pipeline works.',
            '**Treating every LangChain wrapper as necessary.** Sometimes the underlying library (e.g. `faiss` directly) is simpler for your exact case. Fix: use LangChain where it removes real duplication, not by default.',
          ],
          tryIt:
            'Install `langchain`, `langchain-community`, and `langchain-text-splitters`, then write a 5-line script that loads any one text file with `TextLoader` and prints `len(docs)`, the first 100 characters, and the `metadata` dict — confirm you understand what a `Document` object is before writing any real pipeline code.',
          takeaway:
            'LangChain is a toolbox of loaders, splitters, and store wrappers for RAG plumbing — reach for it once you have multiple composable steps, not for a single API call.',
        },
        {
          id: 'm4-t2',
          title: 'Loading documents: text and markdown loaders (and a note on PDF loaders for later)',
          explain:
            'LangChain\'s `TextLoader` reads a single `.txt`/`.md` file into one `Document`; `DirectoryLoader` sweeps a whole folder using a glob pattern and a loader class per file. PDFs need a different loader (`PyPDFLoader`) because their text is not stored as plain characters — noted here, used later.',
          analogy:
            'Loading a single file with `TextLoader` is like one committee member walking into the office and photocopying one specific ledger page. `DirectoryLoader` is sending that member down the whole shelf with instructions "photocopy every `.md` page you find" — same photocopier, same procedure, just repeated automatically instead of by hand for each page.',
          theory:
            'A **`Document`** is LangChain\'s universal unit: `page_content` (the text) plus `metadata` (a dict — at minimum `source`, the file path). Every loader\'s job is simply to produce a list of these.\n\n- **`TextLoader(path, encoding="utf-8")`** — reads one plain-text or markdown file, returns `[Document(...)]`. Always pass `encoding="utf-8"` explicitly; Kannada script and rupee signs (₹) will silently corrupt under a platform default like `cp1252` on Windows.\n- **`DirectoryLoader(path, glob="**/*.md", loader_cls=TextLoader, loader_kwargs={"encoding": "utf-8"})`** — walks a folder matching a glob pattern (`**/*.md` for all markdown files, recursively) and applies the given loader class to each match, concatenating the results into one list of `Document`s. This is what you will use to sweep `data/kb/` for every markdown file in the Kundapura knowledge base project below.\n- **PDF loaders (a note for later)** — `PyPDFLoader` (needs `pip install pypdf`) extracts text page-by-page from a PDF, one `Document` per page, with `metadata["page"]` set. PDFs store *positioned glyphs*, not a clean text stream, so extraction is lossier — tables and multi-column layouts often come out jumbled. You are not using PDFs in this module (your knowledge base is markdown you author yourself), but real-world RAG projects usually need `PyPDFLoader` eventually, so know the name and the caveat now.\n\nMarkdown itself is loaded as **plain text** by `TextLoader` — the `#` headers and `-` bullets stay in the string as literal characters. That is fine and even useful: headers act as natural landmarks the splitter (next topic) can use as chunk boundaries.',
          whyItMatters:
            'Getting document loading right — correct encoding, the right loader for the right file type — is the unglamorous first step every RAG project lives or dies by; garbled Kannada text or missing files silently poison every later chunk and answer. For Kundapura Sahayaka, `DirectoryLoader` over `data/kb/` is exactly how the temple, recipes, and travel-notes markdown files all become searchable in one pass.',
          steps: [
            'Load a single markdown file with `TextLoader(path, encoding="utf-8")` and inspect `page_content` and `metadata`.',
            'Create a folder `data/kb/` with two or three `.md` files.',
            'Load the whole folder with `DirectoryLoader("data/kb/", glob="**/*.md", loader_cls=TextLoader, loader_kwargs={"encoding": "utf-8"})`.',
            'Print `len(docs)` and confirm it matches the number of files.',
            'Print each `doc.metadata["source"]` to confirm every file was picked up.',
            'Note (do not yet implement) that `PyPDFLoader` is the equivalent loader for PDF sources, one `Document` per page.',
          ],
          code: `from langchain_community.document_loaders import TextLoader, DirectoryLoader

# One file:
loader = TextLoader("data/kb/recipes.md", encoding="utf-8")
docs = loader.load()
print(docs[0].metadata)  # {'source': 'data/kb/recipes.md'}

# A whole folder, recursively, markdown only:
dir_loader = DirectoryLoader(
    "data/kb/",
    glob="**/*.md",
    loader_cls=TextLoader,
    loader_kwargs={"encoding": "utf-8"},
)
all_docs = dir_loader.load()
print(f"Loaded {len(all_docs)} documents:")
for d in all_docs:
    print(" -", d.metadata["source"], f"({len(d.page_content)} chars)")

# Later, for PDFs (needs: pip install pypdf) — not used in this module:
# from langchain_community.document_loaders import PyPDFLoader
# pdf_docs = PyPDFLoader("some_file.pdf").load()  # one Document per page`,
          pitfalls: [
            '**Omitting `encoding="utf-8"`.** On Windows this can default to `cp1252` and mangle Kannada text and ₹ signs. Fix: always pass `encoding="utf-8"` explicitly.',
            '**Wrong glob pattern.** `glob="*.md"` misses files in subfolders; you need `"**/*.md"` for recursive matching. Fix: test the glob against your actual folder layout.',
            '**Forgetting `loader_cls`/`loader_kwargs` on `DirectoryLoader`.** It defaults to a loader that may not decode markdown as UTF-8 text. Fix: pass both explicitly.',
            '**Assuming PDF text extracts cleanly.** Tables, columns, and headers often scramble. Fix: treat `PyPDFLoader` output as noisier and inspect it before trusting it.',
            '**Silently loading zero documents.** A typo in the path or glob returns `[]` with no error. Fix: always `print(len(docs))` right after loading and sanity-check it is non-zero.',
            '**Mixing unrelated file types into one `DirectoryLoader` call.** A `.json` or `.png` in the folder can break a text-only glob run. Fix: scope the glob tightly to the extension you intend.',
          ],
          tryIt:
            'Create `data/kb/` with at least two markdown files, load the folder with `DirectoryLoader`, print the count and every `source` path, then intentionally mistype the glob (e.g. `"*.md"` when files are one level deeper) and observe the document count silently drop to confirm why checking the count matters.',
          takeaway:
            '`TextLoader` reads one file into a `Document`, `DirectoryLoader` sweeps a folder with a glob — always pass `encoding="utf-8"`, and remember `PyPDFLoader` is the (lossier) equivalent for PDFs later.',
        },
        {
          id: 'm4-t3',
          title: 'Chunking strategies — why chunk size and overlap matter, RecursiveCharacterTextSplitter',
          explain:
            'Long documents must be split into smaller **chunks** before embedding, because embeddings and retrieval work best on focused passages, not whole files. `RecursiveCharacterTextSplitter` splits on a hierarchy of separators (paragraphs, then lines, then words) to keep chunks coherent, with a configurable `chunk_size` and `chunk_overlap`.',
          analogy:
            'Imagine handing someone the entire Kundapura travel-notes document and asking "does the Gangolli ferry run in the monsoon?" — they have to reread the whole page to answer. Now imagine instead you had already cut the page into small index cards, one topic per card, with each card. Chunking is preparing those index cards ahead of time so retrieval can hand over exactly the relevant card, not the whole notebook. **Overlap** is like copying the last line of one card onto the top of the next, so a sentence that happens to straddle a cut is not lost on either card.',
          theory:
            'Embedding models (next topic) turn text into a single vector that represents its *overall* meaning. Feed it an entire multi-topic document and the vector becomes a blurry average of everything in it — a query about "neer dosa" and a query about "kori rotti" both retrieve the same one document, unhelpfully. Feed it a short, focused **chunk** and the vector tightly represents that one idea, so retrieval can distinguish between them. Chunking is what makes retrieval precise instead of coarse.\n\nTwo parameters control it:\n- **`chunk_size`** — the target size of each chunk, usually measured in characters (or tokens, if you configure a token-aware splitter). Too small and a chunk loses context (a fish-curry ingredient list with no dish name attached); too large and you are back to the blurry-average problem. A starting point of **500-1000 characters** works well for short, dense markdown docs like this module\'s knowledge base.\n- **`chunk_overlap`** — how many characters the end of one chunk repeats at the start of the next (commonly 10-20% of `chunk_size`, e.g. 100-150 for a 500-1000 chunk size). Without overlap, a sentence that happens to fall right on a cut boundary gets split mid-thought and neither resulting chunk makes full sense on its own.\n\n**`RecursiveCharacterTextSplitter`** (from `langchain-text-splitters`) is the practical default. It tries a list of separators in order — by default `["\\n\\n", "\\n", " ", ""]` — first attempting to split on paragraph breaks, and only falling back to splitting mid-line or mid-word if a paragraph itself is still bigger than `chunk_size`. This keeps chunks aligned to natural text boundaries (a markdown section, a bullet list) instead of chopping arbitrarily at a fixed character count. You call `splitter.split_documents(docs)` and get back a longer list of smaller `Document`s, each still carrying its original `metadata` (so you never lose track of which source file a chunk came from).',
          whyItMatters:
            'Chunk size and overlap are the single highest-leverage tuning knobs in a RAG system — get them wrong and *no* amount of prompt engineering in Module 5 will fix retrieval bringing back irrelevant or fragmented text. For Kundapura Sahayaka, a `neer_dosa` recipe chunked cleanly by section (ingredients, then steps) versus one giant undifferentiated chunk is the difference between the bot retrieving exactly the right passage and retrieving the whole recipes file, diluted with kori rotti and fish thali content.',
          steps: [
            'Import `RecursiveCharacterTextSplitter` from `langchain_text_splitters`.',
            'Create a splitter with `chunk_size=800` and `chunk_overlap=120` (roughly 15% overlap).',
            'Call `splitter.split_documents(docs)` on the documents loaded in the previous topic.',
            'Print `len(chunks)` and compare it to `len(docs)` — expect several chunks per source document.',
            'Print two or three chunks\' `page_content` and confirm each reads as a coherent, focused passage.',
            'Adjust `chunk_size` down to 300 and back up to 1500, rerun, and observe how chunk count and coherence change.',
          ],
          code: `from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,       # target characters per chunk
    chunk_overlap=120,    # ~15% overlap so boundary sentences aren't lost
    separators=["\\n\\n", "\\n", " ", ""],  # paragraph -> line -> word -> char, in order
)

chunks = splitter.split_documents(all_docs)  # all_docs from the DirectoryLoader topic

print(f"{len(all_docs)} documents -> {len(chunks)} chunks")
for c in chunks[:3]:
    print("---")
    print(c.metadata["source"])
    print(c.page_content[:200])`,
          pitfalls: [
            '**Chunking by a fixed character cut with no overlap.** Sentences split mid-thought and lose meaning on both sides. Fix: always set a non-zero `chunk_overlap`.',
            '**Chunk size too large (e.g. whole document as one chunk).** Embeddings blur multiple topics together; retrieval gets coarse. Fix: keep chunks focused, roughly 500-1000 characters for dense markdown.',
            '**Chunk size too small (e.g. 100 characters).** Chunks lose surrounding context (an ingredient with no dish name). Fix: size chunks to hold at least one complete idea.',
            '**Forgetting chunks inherit `metadata` from their source `Document`.** You then cannot tell which file a retrieved chunk came from. Fix: use `split_documents` (not `split_text`, which drops metadata) so `source` survives.',
            '**Never inspecting actual chunk content.** Bad splits go unnoticed until retrieval quality is already poor. Fix: print several real chunks before moving on to embedding.',
            '**Using the same chunk size for every document type without checking it fits.** A dense factual list (bus timings) may want smaller chunks than prose (travel notes). Fix: eyeball a few chunks per document type, not just once overall.',
          ],
          tryIt:
            'Take the markdown files from your `data/kb/` folder, split them with `chunk_size=800, chunk_overlap=120`, print every chunk\'s length and first line, then re-run with `chunk_size=200, chunk_overlap=0` and compare — note at least one chunk from the second run that now reads as an incomplete fragment.',
          takeaway:
            '`RecursiveCharacterTextSplitter` cuts on paragraph/line/word boundaries in that order; a ~500-1000 character `chunk_size` with ~15% `chunk_overlap` keeps chunks focused and coherent for retrieval.',
        },
        {
          id: 'm4-t4',
          title: 'Embedding models — turning chunks into vectors, and picking one pragmatically',
          explain:
            'An **embedding model** converts a chunk of text into a fixed-length vector of numbers such that texts with similar meaning end up as nearby vectors — this is the same intuition from Module 2, now applied for real, with a specific model chosen and called via its Python SDK.',
          analogy:
            'Recall the Module 2 embedding intuition: placing every word or sentence as a dot on a giant map, where similar meanings cluster near each other. An embedding model is the surveyor who actually plots each of your knowledge-base chunks onto that map and hands you back its exact coordinates — a list of numbers. Two chunks about ferry timings to Gangolli land near each other on the map; a chunk about kotte kadubu lands somewhere else entirely.',
          theory:
            'Concretely, an embedding model takes a string and returns a vector — typically a list of a few hundred to a few thousand floating-point numbers (e.g. 384, 768, or 1536 dimensions depending on the model). Two chunks with similar meaning produce vectors that are close together under a similarity measure (cosine similarity is standard — Module 4-s2 covers the search mechanics). Crucially, the *same* model must be used to embed both your stored chunks and every future search query, because different models produce vectors in different, incompatible spaces.\n\nPractical, pragmatic choices for this course:\n- **OpenAI\'s `text-embedding-3-small`** — cheap, fast, no local compute needed, called via the `openai` Python SDK (`client.embeddings.create(model="text-embedding-3-small", input=text)`). A reasonable default if you already have an OpenAI key from Module 2/3.\n- **A local `sentence-transformers` model** (e.g. `all-MiniLM-L6-v2`) — runs entirely on your machine via `pip install sentence-transformers`, no API key or per-call cost, good enough quality for a learning knowledge base of this size. Good choice if you want zero ongoing cost while building.\n- Anthropic does **not** currently offer its own embeddings endpoint, so for the embedding step specifically you pick between an API-based option (OpenAI) or a local option (`sentence-transformers`) — this is one of the few places in the course where you reach outside the Anthropic SDK, and that is expected, not a compromise.\n\nLangChain wraps whichever you pick behind a common interface — `OpenAIEmbeddings()` or `HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")` — both exposing `.embed_documents(list_of_texts)` and `.embed_query(text)`, which is what the vector store (next section) calls internally. Pick pragmatically: for this module\'s small Kundapura knowledge base, a local `sentence-transformers` model keeps things free and offline-friendly while you iterate; swapping to a hosted API later is a one-line change because of that shared interface.',
          whyItMatters:
            'Choosing an embedding model — and knowing you must keep it *consistent* between indexing and querying — is a decision every production RAG system makes explicitly, and "why did retrieval return nothing relevant" is very often traced back to mixing embedding models. For Kundapura Sahayaka, whichever embedding choice you make here is locked in for the whole vector store; Module 5\'s query-time retrieval must reuse the identical model or every similarity score becomes meaningless.',
          steps: [
            'Install a local embedding option: `pip install sentence-transformers`.',
            'Create `HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")` (or `OpenAIEmbeddings()` if using OpenAI).',
            'Call `.embed_query("neer dosa recipe")` on a sample string and print the vector\'s length.',
            'Embed two different sentences and note their vector lengths match (same model, same dimensionality).',
            'Note in a comment that this exact embedding object must be reused, unchanged, at query time in Module 5.',
            'Decide and record (in a comment or README) which embedding model this project uses, so it is never silently swapped.',
          ],
          code: `# Local, free, offline option (no API key needed):
# pip install sentence-transformers langchain-huggingface
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

vector = embeddings.embed_query("What time is the evening seva at the temple?")
print(len(vector))     # 384 — this model's fixed vector dimension
print(vector[:5])      # a peek at the first 5 numbers

# Alternative: OpenAI's hosted embedding API (needs OPENAI_API_KEY)
# from langchain_openai import OpenAIEmbeddings
# embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
# vector = embeddings.embed_query("What time is the evening seva at the temple?")
# print(len(vector))   # 1536

# IMPORTANT: whichever you pick, use the SAME 'embeddings' object
# for every chunk you store AND every query you search with later.`,
          pitfalls: [
            '**Embedding chunks with one model and queries with another.** Vectors from different models are not comparable — similarity search silently returns garbage. Fix: reuse the exact same embedding object/model everywhere.',
            '**Assuming a bigger vector dimension always means better quality.** Dimension count is not a quality score; it is model-specific. Fix: pick a model on quality/cost/latency, not dimension size.',
            '**Forgetting a local model needs a download on first use.** `all-MiniLM-L6-v2` downloads a few hundred MB the first time you run it. Fix: run it once ahead of time and let it cache.',
            '**Sending very long, unchunked text into `embed_query`.** Most models truncate silently past a token limit, losing content. Fix: embed already-chunked text (previous topic), not whole documents.',
            '**Not recording which embedding model was used.** Months later you cannot tell if the stored vector store is compatible with new code. Fix: note the model name in a comment or config, next to the vector store path.',
            '**Expecting Anthropic\'s SDK to provide embeddings.** It currently does not have an embeddings endpoint. Fix: use OpenAI or a local `sentence-transformers` model for this one step.',
          ],
          tryIt:
            'Embed the two strings `"neer dosa recipe"` and `"bus timings to Kundapura"` with the same embedding model, print both vectors\' lengths (should match), and in a short comment explain in your own words why comparing a vector from one model against a vector from a different model would be meaningless.',
          takeaway:
            'An embedding model turns text into a fixed-length vector where similar meanings land nearby — pick one pragmatically (local `sentence-transformers` for free/offline, OpenAI for hosted convenience) and reuse it identically for indexing and querying.',
        },
      ],
    },
    {
      id: 'm4-s2',
      title: 'Storing & Finding Chunks',
      topics: [
        {
          id: 'm4-t5',
          title: 'Vector stores: FAISS vs Chroma — both local and free, how similarity search works under the hood',
          explain:
            'A **vector store** holds every chunk\'s embedding vector and can quickly find the vectors closest to a new query vector. **FAISS** (a library) and **Chroma** (a lightweight embedded database) are both free, run entirely on your machine, and are the two practical choices for this course.',
          analogy:
            'Recall the Module 2 map-of-meanings intuition: chunks are dots plotted by meaning, close together when similar. A vector store is the librarian standing at that map with a very fast measuring compass. Ask "what\'s near this new dot?" and instead of measuring the distance to every dot on the map one by one, the librarian uses a smart index (built in advance) to jump straight to the nearby cluster — like a library\'s Dewey Decimal shelf number telling you which aisle to walk to, instead of checking every single book.',
          theory:
            'Under the hood, "how close are two meanings" is measured with **cosine similarity** (or equivalently, distance) between their embedding vectors — the same nearby-dots intuition from Module 2, just applied over thousands of stored chunk vectors instead of a handful of illustrative words. A **similarity search** takes a query vector and finds the *k* stored vectors with the highest cosine similarity to it (top-k retrieval — next topic). Computing similarity against every single stored vector (a brute-force scan) is exact but scales linearly with the number of chunks — fine for a few thousand chunks like this module\'s knowledge base, and both libraries below default to exactly this for small collections.\n\n- **FAISS** ("Facebook AI Similarity Search", `pip install faiss-cpu`) is a low-level, very fast vector-indexing *library*. In LangChain it is used as `FAISS.from_documents(chunks, embeddings)`, which builds an in-memory index you then persist to disk with `.save_local("path")` and reload with `FAISS.load_local("path", embeddings, allow_dangerous_deserialization=True)`. It has no query language or metadata filtering of its own beyond what LangChain layers on top — it is purely about fast vector math.\n- **Chroma** (`pip install chromadb`) is a lightweight embedded *database* purpose-built for embeddings. In LangChain: `Chroma.from_documents(chunks, embeddings, persist_directory="path")`. It persists automatically to a local folder, and it has first-class support for **metadata filtering** (next-next topic) — querying "only chunks where `metadata["category"] == "recipe"`" is a built-in feature, not something you bolt on.\n\nFor this module\'s small, local, single-user knowledge base, either is a correct choice. A practical rule of thumb: reach for **FAISS** when you want the fastest raw similarity search and will do any filtering yourself in Python; reach for **Chroma** when you want built-in persistence and metadata filtering with less boilerplate. This module\'s project uses one of them (your choice) — the interface either way is `.similarity_search(query, k=...)`.',
          whyItMatters:
            'Choosing and correctly persisting a vector store is the backbone of any RAG system, and "FAISS vs Chroma vs a hosted vector DB, and why" is a standard system-design question in GenAI interviews. For Kundapura Sahayaka, the vector store built in this module\'s project is loaded unchanged in Module 5\'s generation step and again in Module 6\'s RAG-as-a-tool — get the persistence and reload path right once, here, and every later module just works.',
          steps: [
            'Install one vector store: `pip install faiss-cpu` (or `pip install chromadb`).',
            'Recall Module 2\'s "nearby dots on a map" intuition for embedding similarity.',
            'Understand cosine similarity as the standard way to score "how close" two vectors are.',
            'Build a FAISS or Chroma index from a small list of `Document` chunks and their embeddings.',
            'Persist it to disk (`.save_local()` for FAISS, `persist_directory` for Chroma) and reload it in a fresh script.',
            'Note which one has built-in metadata filtering (Chroma) versus which is pure fast vector math (FAISS).',
          ],
          code: `# Option A: FAISS
# pip install faiss-cpu
from langchain_community.vectorstores import FAISS

vector_store = FAISS.from_documents(chunks, embeddings)   # chunks + embeddings from earlier topics
vector_store.save_local("data/faiss_index")

# ...later, in a different script/run:
reloaded = FAISS.load_local(
    "data/faiss_index", embeddings, allow_dangerous_deserialization=True
)

# Option B: Chroma
# pip install chromadb
from langchain_community.vectorstores import Chroma

vector_store = Chroma.from_documents(
    chunks, embeddings, persist_directory="data/chroma_index"
)
# Chroma persists automatically to persist_directory — no extra save call needed.

# ...later, in a different script/run:
reloaded = Chroma(
    persist_directory="data/chroma_index", embedding_function=embeddings
)`,
          pitfalls: [
            '**Reloading a FAISS/Chroma index with a different embedding model than built it.** Similarity scores become meaningless (see previous topic). Fix: reuse the exact same `embeddings` object at load time.',
            '**Forgetting to persist the index (staying in-memory only).** Every process restart rebuilds from scratch, wasting time/cost. Fix: always `save_local` (FAISS) or set `persist_directory` (Chroma).',
            '**Being surprised by `allow_dangerous_deserialization=True` on FAISS.** It is required because loading uses pickle internally; it is safe here because you only load files *you* created. Fix: understand the flag rather than blindly copy-pasting it.',
            '**Expecting FAISS to filter by metadata natively.** It does not; you filter in Python after retrieval, or via LangChain\'s filter helpers. Fix: use Chroma if built-in metadata filtering matters more than raw speed.',
            '**Rebuilding the whole index from scratch every run instead of loading the saved one.** Wastes embedding API calls/time. Fix: check if the index folder exists and load it before rebuilding.',
            '**Not committing/backing up the index folder.** A deleted `data/faiss_index/` or `data/chroma_index/` means re-embedding everything. Fix: keep the source markdown in version control; treat the index as regenerable but don\'t discard it carelessly.',
          ],
          tryIt:
            'Build a FAISS (or Chroma) index from a small list of 4-5 chunks and save it to disk, then write a *second* short script that loads the saved index fresh (new Python process) and confirms it has the expected number of stored vectors — proving persistence actually round-trips.',
          takeaway:
            'FAISS and Chroma both store chunk embeddings locally for free and support the same `.similarity_search()` interface — FAISS is the leaner, pure-vector-math choice; Chroma adds built-in persistence and metadata filtering.',
        },
        {
          id: 'm4-t6',
          title: 'Building an index from a small knowledge base',
          explain:
            'Bring every earlier step together into one pipeline: load the markdown knowledge base, split it into chunks, embed the chunks, and store the result in a persisted vector store — the first time you author and index real Kundapura content.',
          analogy:
            'This is moving day at the committee office: every loose page (documents), cut down to filing-card size (chunks), stamped with a catalogue number (embeddings), and slotted into the actual filing cabinet (vector store) — in that order, once, so from now on anyone can walk up and pull the right card in seconds instead of rereading every ledger.',
          theory:
            'This topic is where the previous four topics stop being separate demonstrations and become one **indexing pipeline** — the exact shape you will reuse (and extend) for the rest of the course:\n\n```\nload documents -> split into chunks -> embed chunks -> store in vector store -> persist to disk\n```\n\nEach step\'s output is the next step\'s input: `DirectoryLoader.load()` returns `Document`s, `RecursiveCharacterTextSplitter.split_documents()` returns smaller `Document`s (chunks), and `FAISS.from_documents(chunks, embeddings)` (or `Chroma.from_documents`) embeds every chunk internally (calling `embeddings.embed_documents()` under the hood) and stores the resulting vectors alongside the chunk text and metadata. You do not call the embedding model yourself in a loop — the vector store\'s `.from_documents()` constructor does it for you, once per chunk, and this is usually the slowest step (especially with a hosted API) so it is worth running once and persisting rather than rebuilding on every script run.\n\nThe knowledge base itself, for Kundapura Sahayaka, is markdown you write by hand under `data/kb/` — real structured content about temple sevas, coastal recipes, and travel notes (the project below has you author all three files). Writing genuine, specific content here (actual seva timings, an actual neer dosa method, actual bus/ferry notes) rather than filler text matters, because Module 5\'s answers will only ever be as good as what is indexed — RAG cannot invent grounding that was never written down.',
          whyItMatters:
            'End-to-end pipelines are what actually ships — knowing each step in isolation is not the same as wiring them together correctly, in order, with data flowing cleanly from one stage to the next. For Kundapura Sahayaka, this exact indexing pipeline — load, split, embed, store, persist — is the artifact every later module depends on; get it right once here and Modules 5-7 simply load the result.',
          steps: [
            'Write `data/kb/temple_calendar.md`, `data/kb/recipes.md`, and `data/kb/travel_notes.md` with real content.',
            'Load all three with `DirectoryLoader("data/kb/", glob="**/*.md", ...)`.',
            'Split the loaded documents with `RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=120)`.',
            'Create your embedding model object once (`HuggingFaceEmbeddings` or `OpenAIEmbeddings`).',
            'Build the vector store with `FAISS.from_documents(chunks, embeddings)` (or `Chroma.from_documents`).',
            'Persist it to disk and print a confirmation message with the chunk count indexed.',
          ],
          code: `from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def build_index():
    loader = DirectoryLoader(
        "data/kb/", glob="**/*.md", loader_cls=TextLoader,
        loader_kwargs={"encoding": "utf-8"},
    )
    docs = loader.load()
    print(f"Loaded {len(docs)} documents")

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=120)
    chunks = splitter.split_documents(docs)
    print(f"Split into {len(chunks)} chunks")

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_store = FAISS.from_documents(chunks, embeddings)  # embeds every chunk internally
    vector_store.save_local("data/faiss_index")
    print(f"Indexed {len(chunks)} chunks -> data/faiss_index")
    return vector_store

if __name__ == "__main__":
    build_index()`,
          pitfalls: [
            '**Writing thin, one-line placeholder markdown files.** Retrieval and later generation can only ever be as good as what was indexed. Fix: write real, specific content — actual timings, actual recipe steps.',
            '**Re-running the full pipeline (including re-embedding) every time you just want to search.** Wastes time/cost for no reason. Fix: build once, persist, and load the saved index for searching (next topic).',
            '**Losing track of which step failed when the pipeline errors.** A silent `[]` from the loader cascades into a confusing empty index. Fix: print a count after every stage (docs, chunks, then confirm the store\'s size).',
            '**Hardcoding the knowledge-base path inconsistently between the indexing script and the later search script.** Fix: define the `data/kb/` and index path once, e.g. as constants, and reuse them.',
            '**Forgetting `data/kb/` needs to exist with `.md` files before running.** `DirectoryLoader` on a missing folder either errors or returns nothing. Fix: create the folder and files first, and check they exist.',
            '**Mixing chunk-building logic into the same function as querying.** Makes the script harder to reuse. Fix: keep `build_index()` separate from a later `search()` function.',
          ],
          tryIt:
            'Author the three markdown files in `data/kb/` with genuine content (see the project below for the required topics), run the full pipeline above end to end, and confirm the printed document count matches your file count and the chunk count is sensibly larger (roughly 2-6x, depending on file length).',
          takeaway:
            'The indexing pipeline is load, then split, then embed-and-store, then persist — run it once over real Kundapura content and every later module reuses the saved index.',
        },
        {
          id: 'm4-t7',
          title: 'Similarity search and top-k retrieval — tuning k and seeing how results change',
          explain:
            '`vector_store.similarity_search(query, k=N)` embeds the query text, finds the `N` stored chunks whose vectors are closest to it, and returns them ranked by similarity — `k` controls how many results come back, and tuning it trades precision against coverage.',
          analogy:
            'Asking a librarian "find me books about ferries" with `k=1` gets you the single best-matching book — fast, but if that one book happens to be thin on the detail you needed, you are out of luck. Asking with `k=5` gets you a small stack of the five closest matches — more chances the answer is in there somewhere, but now you (or, in Module 5, the LLM) have to read through more material, some of it less relevant.',
          theory:
            '`similarity_search` is the query-time counterpart to everything built so far: it takes a plain-text `query` string, calls `embeddings.embed_query(query)` internally (using the *same* embedding model the index was built with — this is why consistency matters, per the embedding-models topic), and compares that query vector against every stored chunk vector using cosine similarity, returning the **top-k** most similar chunks as a ranked list of `Document`s.\n\n`k` is the one knob you control directly, and it is a real trade-off:\n- **Small `k` (1-2)** — very precise if the single best chunk truly contains the answer, but brittle: if the right information is split across two chunks (a common consequence of chunking), a too-small `k` misses half of it.\n- **Larger `k` (4-8)** — more likely to capture all the relevant chunks, especially when an answer spans multiple chunks or the knowledge base has near-duplicate phrasing across files, but it also pulls in more marginally-relevant or irrelevant text that Module 5\'s LLM then has to sift through, which can dilute or confuse the generated answer.\n\nA practical starting point for a knowledge base this size is **`k=3` or `k=4`**, then adjust based on what you actually observe: run the same query at `k=1`, `k=3`, and `k=6` and read the returned chunks yourself. `similarity_search_with_score(query, k=N)` is a useful variant that also returns each chunk\'s numeric distance/similarity score, letting you see *how much* better the top result is than the fourth — a large gap suggests a confident match; a flat, similar set of scores suggests the query is genuinely ambiguous or the knowledge base lacks a precise answer.',
          whyItMatters:
            'Top-k tuning is the second highest-leverage knob in RAG (after chunking) and is squarely a "tell me how you\'d debug a bad RAG answer" interview scenario — the answer is very often "check what k actually retrieved before blaming the LLM". For Kundapura Sahayaka, running real queries like "what time is the morning seva" or "how do I get to Gangolli in the monsoon" at a few different `k` values, right now, before any LLM is involved, is what lets you see and fix retrieval problems cheaply, in isolation.',
          steps: [
            'Load the persisted vector store from the previous topic.',
            'Run `vector_store.similarity_search("neer dosa ingredients", k=3)` and print each returned chunk\'s source and first 150 characters.',
            'Re-run the same query with `k=1` and then `k=6`, comparing what changes.',
            'Run `similarity_search_with_score(...)` and print the numeric scores alongside each chunk.',
            'Try a query about a topic *not* in your knowledge base and observe what (irrelevant) chunks still come back — vector search always returns *something*.',
            'Settle on a default `k` for this project and note why, in a comment.',
          ],
          code: `from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_store = FAISS.load_local(
    "data/faiss_index", embeddings, allow_dangerous_deserialization=True
)

query = "What ingredients go into neer dosa?"

for k in (1, 3, 6):
    results = vector_store.similarity_search(query, k=k)
    print(f"\\n--- k={k} ({len(results)} results) ---")
    for r in results:
        print(f"[{r.metadata['source']}] {r.page_content[:120]!r}")

# With scores, to see how confident the top match is vs. the rest:
scored = vector_store.similarity_search_with_score(query, k=4)
for doc, score in scored:
    print(f"score={score:.4f}  source={doc.metadata['source']}")`,
          pitfalls: [
            '**Assuming `k=1` is always safest because it\'s "most precise".** It misses answers that span two chunks. Fix: test `k=1` vs a higher `k` on real queries before deciding.',
            '**Setting `k` very high "to be safe".** Floods the eventual LLM prompt (Module 5) with mostly-irrelevant text, which can hurt answer quality and cost more tokens. Fix: tune `k` empirically, do not maximise it blindly.',
            '**Forgetting vector search always returns *something*, even for an off-topic query.** There is no built-in "no good match" signal from `similarity_search` alone. Fix: check the *scores* (via `similarity_search_with_score`) — a poor top score signals a weak match.',
            '**Not reloading the persisted index and instead re-running the whole build pipeline just to test search.** Slow and wasteful. Fix: load the saved FAISS/Chroma index directly for search-only scripts.',
            '**Comparing scores across different embedding models or different vector stores.** Distance metrics and scales differ between backends. Fix: only compare scores from the same store/model, and even then treat them as relative, not absolute.',
            '**Never trying a query with no good answer in the knowledge base.** You only discover the "always returns something" behavior in production. Fix: deliberately test at least one out-of-scope query during development.',
          ],
          tryIt:
            'Run three different real queries against your Kundapura index (one temple question, one recipe question, one travel question) at `k=3`, print the retrieved chunks for each, and identify at least one case where a chunk came back that was only tangentially relevant — write a one-line note on whether raising or lowering `k` would help that specific query.',
          takeaway:
            '`similarity_search(query, k=N)` embeds the query with the same model used to index, then returns the N closest chunks — start around `k=3-4` and tune by actually reading what comes back.',
        },
        {
          id: 'm4-t8',
          title: 'Metadata filtering — e.g. retrieving only "recipe" docs vs only "temple" docs',
          explain:
            'Every chunk carries `metadata` inherited from its source document; tagging that metadata with a category (`"recipe"`, `"temple"`, `"travel"`) lets you restrict similarity search to a subset of the knowledge base — narrowing the search space before ranking by similarity.',
          analogy:
            'Plain similarity search is asking the whole fish market "who has something like this?" and every stall shouts back with their best guess. Metadata filtering is walking straight to the "dry fish" section first, then asking your question only to those stalls — you get a smaller, more relevant crowd to search within, instead of hoping the right stall\'s answer happens to rank first among everyone\'s.',
          theory:
            'Recall that a `Document`\'s `metadata` dict travels with it through loading and chunking untouched (aside from what the splitter adds). By default it only holds `source` (the file path), but nothing stops you from adding your own fields *before* building the vector store — most simply, by looping over loaded documents right after loading and setting `doc.metadata["category"] = "..."` based on which file they came from, or by loading each category from its own `DirectoryLoader` call and tagging accordingly.\n\nOnce chunks carry a `category` field, filtering narrows the candidate pool *before* (or alongside) similarity ranking:\n- **Chroma** supports this natively: `vector_store.similarity_search(query, k=3, filter={"category": "recipe"})` only ever considers chunks whose metadata matches the filter.\n- **FAISS** has no native metadata query language in the base LangChain wrapper, so the common pattern is to over-fetch with a larger `k`, then filter the returned `Document` list in plain Python by `doc.metadata.get("category")` — or maintain separate FAISS indexes per category if filtering is a first-class, frequent need.\n\nWhy this matters beyond convenience: a query like "what time does the fish market open" is ambiguous by pure semantic similarity alone (fish appears in recipes *and* could plausibly appear in travel notes), but if the *user* (or Module 6\'s agent, later) already knows they want the temple calendar specifically, filtering to `category="temple"` eliminates an entire wrong category from consideration regardless of how semantically close a recipe chunk happens to be. Metadata filtering and similarity search are complementary, not competing: filtering narrows *which* chunks are eligible, similarity search then ranks *within* that eligible set.',
          whyItMatters:
            'Combining structured filters with vector similarity is what separates a toy RAG demo from a production-grade retrieval system, and it is exactly the mechanism Module 6 will reuse when the agent decides "search only the temple docs" versus "search only recipes" based on the user\'s question. For Kundapura Sahayaka, tagging each markdown file\'s chunks with its category now means a future query can be scoped precisely instead of hoping semantic similarity alone sorts three quite-different domains (temple, food, travel) correctly every time.',
          steps: [
            'After loading each source file, set `doc.metadata["category"]` to `"temple"`, `"recipe"`, or `"travel"` based on its filename.',
            'Rebuild the vector store (Chroma, to get native filtering) with the tagged documents/chunks.',
            'Run `similarity_search(query, k=3, filter={"category": "recipe"})` and confirm only recipe chunks return.',
            'Run the same query with `filter={"category": "temple"}` and confirm the result set changes entirely.',
            'If using FAISS, instead over-fetch with `k=10` and filter the returned list in Python by `doc.metadata["category"]`.',
            'Compare an unfiltered search against a filtered one for an ambiguous query and note the difference.',
          ],
          code: `from langchain_community.document_loaders import TextLoader

CATEGORY_BY_FILE = {
    "temple_calendar.md": "temple",
    "recipes.md": "recipe",
    "travel_notes.md": "travel",
}

def load_and_tag():
    docs = []
    for filename, category in CATEGORY_BY_FILE.items():
        loaded = TextLoader(f"data/kb/{filename}", encoding="utf-8").load()
        for d in loaded:
            d.metadata["category"] = category  # tag BEFORE chunking, so every chunk inherits it
        docs.extend(loaded)
    return docs

# ... split docs into chunks as before (chunks inherit metadata, including 'category') ...

# Chroma: native metadata filtering
from langchain_community.vectorstores import Chroma
vector_store = Chroma.from_documents(chunks, embeddings, persist_directory="data/chroma_index")

recipe_only = vector_store.similarity_search(
    "how spicy is the fish curry", k=3, filter={"category": "recipe"}
)
temple_only = vector_store.similarity_search(
    "when is the festival", k=3, filter={"category": "temple"}
)

# FAISS: filter manually after over-fetching
faiss_results = faiss_store.similarity_search("bus timings", k=10)
travel_only = [d for d in faiss_results if d.metadata.get("category") == "travel"][:3]`,
          pitfalls: [
            '**Tagging metadata *after* chunking instead of before.** If you split first and tag second, you have to re-attach category to every chunk individually instead of once per source document. Fix: tag `doc.metadata` right after loading, before splitting.',
            '**Assuming FAISS filters natively like Chroma.** The base LangChain FAISS wrapper does not support a `filter=` kwarg the same way. Fix: over-fetch and filter in Python, or choose Chroma when filtering is central.',
            '**Using an inconsistent or typo\'d category value.** `"Recipe"` vs `"recipe"` silently returns zero filtered results. Fix: use a fixed, lowercase set of category constants.',
            '**Filtering so narrowly that k=3 within a small category returns fewer than 3 results.** Not an error, just fewer hits — worth expecting with a small knowledge base. Fix: check `len(results)` rather than assuming it always equals `k`.',
            '**Forgetting metadata filters narrow the pool, they do not replace ranking.** Filtered results are still ordered by similarity within the filtered set. Fix: keep both mental models — filter narrows, similarity ranks.',
            '**Over-relying on filtering for every query.** Not every question maps cleanly to one category (e.g. "is the temple near a good fish market" spans two). Fix: keep unfiltered search available as the default, and use filtering when the category is genuinely known.',
          ],
          tryIt:
            'Tag your three knowledge-base files with `category` metadata, rebuild the index (Chroma recommended for this exercise), then run the identical query once unfiltered and once with `filter={"category": "recipe"}` — print both result sets side by side and confirm the filtered one excludes every temple/travel chunk.',
          takeaway:
            'Tagging chunks with a `category` in metadata lets you scope similarity search to a subset of the knowledge base (native in Chroma, manual post-filtering in FAISS) — filtering narrows the pool, similarity search ranks within it.',
        },
      ],
    },
  ],
  projects: [
    {
      id: 'm4-p1',
      type: 'Project',
      title: 'Kundapura Knowledge Base Index',
      domain: 'RAG — Indexing',
      duration: '3-4 hrs',
      description:
        'Author a small local knowledge base as markdown files, then build the full load-chunk-embed-store pipeline over it and prove retrieval works by running several sample similarity searches and printing what comes back — before any generation is wired in. This is the indexing foundation Module 5 queries and Module 6 wraps as an agent tool.',
      tools: ['LangChain', 'langchain-text-splitters', 'FAISS / Chroma', 'embeddings API'],
      blueprint: {
        overview:
          'You will write three real markdown documents about coastal-Karnataka life — temple sevas and festivals, local recipes, and Kundapura travel notes — under `data/kb/`, then build a Python pipeline that loads them, splits them into overlapping chunks, embeds every chunk, and stores the result in a persisted local vector store (FAISS or Chroma, your choice). Finally you write a small `search.py` script that runs 3-4 sample queries through `similarity_search` and prints the retrieved chunks with their source and score, so you can *see* retrieval working — the raw material Module 5 will hand to an LLM to generate grounded answers from.',
        functionalRequirements: [
          'Three markdown files exist under `data/kb/`: a temple seva/festival calendar doc, a coastal-Karnataka recipes doc (neer dosa, kori rotti, fish thali, kotte kadubu), and a Kundapura travel-notes doc (buses, ferries to Gangolli, monsoon connectivity) — each with genuine, specific content, not placeholders.',
          'An `index.py` (or similarly named) script loads every markdown file under `data/kb/`, splits them into chunks with `RecursiveCharacterTextSplitter`, embeds every chunk, and builds a persisted vector store on disk.',
          'Each source document\'s chunks carry a `category` metadata field (`"temple"`, `"recipe"`, or `"travel"`) set before chunking.',
          'A separate `search.py` script loads the persisted vector store (without rebuilding it) and runs at least 3-4 sample queries — at least one per category — printing each retrieved chunk\'s source, category, similarity score, and a text preview.',
          'One of the sample searches demonstrates metadata filtering (e.g. restrict to `category="recipe"`) and one demonstrates unfiltered search, so the difference is visible in the printed output.',
          'Running `index.py` then `search.py` from a clean checkout (after `pip install`-ing dependencies) works end to end without errors.',
        ],
        technicalImplementation: [
          'Use `DirectoryLoader` with `glob="**/*.md"`, `loader_cls=TextLoader`, and `loader_kwargs={"encoding": "utf-8"}` to load `data/kb/`, or load+tag each file individually if per-file metadata tagging is easier that way.',
          'Tag `doc.metadata["category"]` immediately after loading, before splitting, using a small filename-to-category mapping dict.',
          'Split with `RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=120)` and confirm chunks retain their `category` metadata.',
          'Pick one embedding approach and use it consistently in both scripts: `HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")` (local, free) or `OpenAIEmbeddings(model="text-embedding-3-small")` (hosted, needs an API key already set up from Module 2/3).',
          'Build and persist the vector store with `FAISS.from_documents(...)` + `.save_local(...)`, or `Chroma.from_documents(..., persist_directory=...)`; reload it in `search.py` with the matching load call and the identical embedding object.',
          'In `search.py`, use `similarity_search_with_score` for at least one query so scores are visible, and print results in a clearly labelled, readable format (query, then each result indented beneath it).',
        ],
        prompts: [
          {
            step: 1,
            label: 'Author the knowledge base',
            outcome: 'Three genuine markdown files under data/kb/ covering temple/festival info, coastal recipes, and Kundapura travel notes.',
            prompt:
              'Create a `data/kb/` folder with three markdown files. `temple_calendar.md` should describe seva timings at a coastal-Karnataka temple (morning/evening seva times, a weekly special day) and at least two festival dates with a short description each. `recipes.md` should cover four coastal-Karnataka dishes — neer dosa, kori rotti, fish thali, and kotte kadubu — each with a short ingredient list and a few method steps, using clear markdown headers (`##`) per dish. `travel_notes.md` should describe how to get around the Kundapura area: local bus routes, the ferry to Gangolli, and how monsoon season affects connectivity. Write genuine, specific, useful content in each file, not placeholder text — this is the actual data that will be searched later.',
          },
          {
            step: 2,
            label: 'Load and tag documents',
            outcome: 'A function that loads all three markdown files and tags each with a category metadata field before chunking.',
            prompt:
              'Write a Python function `load_and_tag_docs()` that loads each file in `data/kb/` individually with `TextLoader(path, encoding="utf-8")`, and immediately after loading each one, sets `doc.metadata["category"]` to `"temple"`, `"recipe"`, or `"travel"` based on a filename-to-category mapping dict. Return the combined list of tagged `Document` objects. Print how many documents were loaded and each one\'s assigned category.',
          },
          {
            step: 3,
            label: 'Chunk, embed, and build the index',
            outcome: 'An index.py that splits the tagged documents into chunks and builds a persisted vector store, confirming chunk count and that metadata survived splitting.',
            prompt:
              'Write `index.py` that calls `load_and_tag_docs()` from the previous step, splits the results with `RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=120)`, and confirms (by printing) that each resulting chunk still has its `category` metadata. Then create an embeddings object (`HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")` or `OpenAIEmbeddings`), build a vector store from the chunks with `FAISS.from_documents(...)` (or `Chroma.from_documents(...)`), and persist it to disk. Print a final summary line: how many documents were loaded, how many chunks were created, and where the index was saved.',
          },
          {
            step: 4,
            label: 'Write the search script',
            outcome: 'A search.py that loads the persisted index and runs sample queries, printing retrieved chunks with source, category, and score.',
            prompt:
              'Write `search.py` as a separate script that loads the vector store persisted by `index.py` (using the same embeddings model/object, without rebuilding the index) and defines a `search(query, k=3, category=None)` helper that calls `similarity_search_with_score` and optionally filters by category. Run and print results for at least four sample queries: one about seva timings, one about a specific recipe, one about ferry/bus travel, and one that demonstrates category filtering explicitly (e.g. searching with `category="recipe"` and showing the results only include recipe chunks). For each result print the source file, category, similarity score, and a ~150-character text preview.',
          },
          {
            step: 5,
            label: 'Review retrieval quality',
            outcome: 'A short written review of what worked and what did not, ready to inform Module 5\'s prompt design.',
            prompt:
              'Run `search.py` and look closely at the printed results for all four sample queries. Write a short markdown note (`data/kb/NOTES.md` or similar) answering: which query got the cleanest, most relevant top result; which query pulled back at least one irrelevant or borderline chunk, and why you think that happened (chunk size, overlap, or genuinely ambiguous phrasing); and whether raising or lowering `k` for that specific query would likely help. This review is what Module 5 will build the generation prompt against, so be concrete about what retrieval currently gets right and wrong.',
          },
        ],
        deliverable:
          'A `data/kb/` folder with three genuine, well-written markdown documents; an `index.py` that loads, tags, chunks, embeds, and persists them to a local FAISS or Chroma vector store; a `search.py` that reloads the persisted index and runs at least four sample similarity searches (including one filtered by category) with scores and source metadata printed for each result; and a short written note on retrieval quality to carry into Module 5.',
      },
    },
  ],
  quiz: [
    {
      id: 'm4-q1',
      q: 'Why split a long document into overlapping chunks before embedding it, instead of embedding the whole document as one vector?',
      options: [
        'Overlapping chunks make the vector store load faster',
        'A single vector for a whole multi-topic document blurs together every topic in it, so focused chunks let retrieval distinguish between them; overlap prevents a sentence from being cut in half at a chunk boundary',
        'LangChain refuses to embed any text longer than one sentence',
        'Chunking removes the need for an embedding model entirely',
      ],
      answer: 1,
    },
    {
      id: 'm4-q2',
      q: 'What must stay consistent between building a vector store and later searching it?',
      options: [
        'The programming language used to write the search script',
        'The exact same embedding model used to embed the stored chunks must also be used to embed the search query, since different models produce vectors in incompatible spaces',
        'The chunk_size used during splitting, but the embedding model can change freely',
        'Nothing — any embedding model can search any vector store interchangeably',
      ],
      answer: 1,
    },
    {
      id: 'm4-q3',
      q: 'What is the key practical difference between FAISS and Chroma as covered in this module?',
      options: [
        'FAISS requires a paid API key while Chroma is free',
        'Chroma cannot be persisted to disk, while FAISS always persists automatically',
        'FAISS is a fast, low-level vector-math library with no native metadata query support, while Chroma is an embedded database with built-in persistence and metadata filtering',
        'FAISS only works with OpenAI embeddings, while Chroma only works with local embeddings',
      ],
      answer: 2,
    },
    {
      id: 'm4-q4',
      q: 'When tuning `k` in `similarity_search(query, k=N)`, what trade-off are you making?',
      options: [
        'A larger k always produces strictly more accurate answers with no downside',
        'A smaller k is more precise but risks missing an answer that spans multiple chunks; a larger k improves coverage but pulls in more marginally-relevant text',
        'k controls how many documents get loaded from disk, unrelated to search quality',
        'k has no effect on the results, only on how fast the search runs',
      ],
      answer: 1,
    },
    {
      id: 'm4-q5',
      q: 'In the Kundapura knowledge base project, what does tagging each document with a `category` metadata field (e.g. "recipe", "temple", "travel") enable?',
      options: [
        'It makes the embedding model produce higher-dimensional vectors',
        'It lets similarity search be scoped to a subset of chunks (e.g. only "recipe" chunks) before or alongside ranking by similarity, narrowing the pool instead of searching the entire knowledge base every time',
        'It automatically translates the chunk content into Kannada',
        'It replaces the need for a vector store, since metadata alone can answer any query',
      ],
      answer: 1,
    },
  ],
}
