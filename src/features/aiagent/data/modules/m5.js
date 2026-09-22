// Week 6 — RAG: Retrieval Augmented Generation
// Embeddings, vector stores, retrieval, augmenting prompts with context

export const m5 = {
  id: 'm5',
  title: 'Week 6 — RAG: Retrieval Augmented Generation',
  hours: 7,
  color: 'from-cyan-500/20 to-cyan-700/10',
  accent: 'cyan',
  description:
    'Make LLMs smarter with your own data. RAG means: embed your documents, retrieve the relevant ones, feed them to the LLM. Now you can query company docs, manuals, knowledge bases.',
  sections: [
    {
      id: 'm5-s1',
      title: 'Embeddings and Vector Stores',
      topics: [
        {
          id: 'm5-t1',
          title: 'What are embeddings?',
          explain:
            'An embedding is a list of numbers (vector) that represents the meaning of text. Similar texts have similar vectors.',
          analogy:
            'Embedding is like a fingerprint for meaning. Same text = same fingerprint. Similar text = similar fingerprints.',
          theory:
            'Text -> Embedding Model -> Vector (list of numbers, usually 1536-4096 dimensions)\n\nExample:\n"The cat is on the table" -> [0.1, -0.2, 0.3, ..., -0.5] (1536 numbers)\n"A cat sits on the table" -> [0.1, -0.19, 0.31, ..., -0.51] (very similar vector)\n"The weather is sunny" -> [0.5, 0.2, -0.1, ..., 0.3] (different vector)\n\nDistance between vectors measures similarity:\nSimilar text = small distance\nDifferent text = large distance\n\nEmbedding models:\n- OpenAI: text-embedding-3-small (1536 dims, cheap)\n- Hugging Face: all-MiniLM-L6-v2 (open source, local)\n- Cohere: embed-english-v3.0 (high quality)',
          whyItMatters:
            'Embeddings enable semantic search. You can find relevant documents without exact keyword matching. "How do I reset my password?" can find docs about password resets even if the exact phrase isn\'t there.',
          steps: [
            'Use OpenAI embedding API: text-embedding-3-small',
            'Embed your documents once, save the vectors.',
            'When user asks a question, embed it too.',
            'Find closest vectors (semantic search).',
            'Return top-K most relevant documents.',
          ],
          code: `from openai import OpenAI

client = OpenAI()

# Embed a single text
response = client.embeddings.create(
    input="The cat is on the table",
    model="text-embedding-3-small"
)
embedding = response.data[0].embedding
print(f"Embedding dimension: {len(embedding)}")  # 1536
print(f"First 5 values: {embedding[:5]}")  # [0.001, -0.005, 0.008, ...]

# Embed multiple texts
texts = [
    "The cat is on the table",
    "A cat sits on the table",
    "The weather is sunny"
]
response = client.embeddings.create(input=texts, model="text-embedding-3-small")
embeddings = [item.embedding for item in response.data]`,
          pitfalls: [
            'Embedding every query. Embed once and cache results.',
            'Using high-dimension embeddings when low-dimension suffice. 384 dims is often enough, saves cost.',
            'Not normalizing vectors before computing distance.',
          ],
        },
        {
          id: 'm5-t2',
          title: 'Building a RAG pipeline',
          explain:
            'RAG flow: load documents -> chunk them -> embed chunks -> store in vector DB -> retrieve on query -> augment LLM prompt -> generate response.',
          analogy:
            'RAG is like a librarian. Documents are books. Chunks are bookmarks. Embeddings are the librarian\'s memory. Query = "find me info on X". Librarian retrieves relevant books, you read relevant passages, then answer.',
          theory:
            'RAG pipeline steps:\n\n1. Load documents\n2. Split into chunks (1000 chars typical)\n3. Embed all chunks\n4. Store chunks + embeddings in vector DB\n5. User query comes in\n6. Embed query\n7. Find top-K similar chunks\n8. Add chunks to LLM prompt as context\n9. LLM generates response using context\n\nVector DBs:\n- Pinecone: Managed, serverless\n- Weaviate: Self-hosted or managed\n- Milvus: Open source\n- FAISS: Local, fast\n- Supabase pgvector: SQL + vectors',
          whyItMatters:
            'Without RAG, LLMs only know what they were trained on (cutoff in April 2024 for GPT-4). RAG lets them access real-time data, your company docs, current news.',
          steps: [
            'Install: pip install langchain lancedb',
            'Load document (PDF, text, etc)',
            'Split into chunks',
            'Create embeddings',
            'Store in vector DB',
            'Retrieve relevant chunks on query',
          ],
          code: `from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS

# Load document
loader = TextLoader("document.txt")
docs = loader.load()

# Split into chunks
splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(docs)

# Create embeddings
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# Store in vector DB (FAISS is local)
vector_db = FAISS.from_documents(chunks, embeddings)

# Retrieve on query
query = "How do I reset my password?"
results = vector_db.similarity_search(query, k=3)

for i, result in enumerate(results):
    print(f"Result {i+1}: {result.page_content[:200]}...")`,
          pitfalls: [
            'Using chunk size that\'s too large. Long chunks dilute the signal.',
            'Not using overlap between chunks. Information spanning chunk boundaries gets lost.',
            'Storing raw documents without preprocessing. Remove headers, clean formatting.',
          ],
        },
      ],
    },
  ],
}
