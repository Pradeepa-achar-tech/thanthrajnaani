import { ArrowRight, Brain, Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const aiConcepts = [
  { title: 'LLMs', description: 'Large Language Models as reasoning engines' },
  { title: 'RAG', description: 'Retrieval-Augmented Generation for context' },
  { title: 'Tool Calling', description: 'Agents calling APIs and functions' },
  { title: 'MCP', description: 'Model Context Protocol for extensibility' },
  { title: 'Vector Search', description: 'Semantic similarity and embeddings' },
  { title: 'Agentic Workflows', description: 'Multi-step reasoning and planning' },
  { title: 'Agent Frameworks', description: 'LangGraph, LangChain, FastAPI' },
  { title: 'Data Layer', description: 'PostgreSQL + pgvector, Redis, Docker' },
]

export default function AISection() {
  return (
    <section className="border-t border-zinc-200 bg-gradient-to-b from-accent-50/50 to-transparent">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-16">
        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-accent-600" />
            <span className="eyebrow text-accent-600">AI & Agents</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
            Now building with AI
          </h2>

          <p className="text-lg text-zinc-600 leading-relaxed">
            I'm exploring what happens when software can reason over context, retrieve information, use tools, and act autonomously. This is my current direction — expanding from traditional software engineering into intelligent, agentic systems.
          </p>
        </div>

        {/* Concepts Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {aiConcepts.map((concept) => (
            <div
              key={concept.title}
              className="group p-4 rounded-lg border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-accent-300 hover:bg-gradient-to-br hover:from-accent-50 hover:to-accent-100/20 transition-all duration-300"
            >
              <h3 className="font-semibold text-zinc-900 mb-1 group-hover:text-accent-600 transition-colors">{concept.title}</h3>
              <p className="text-xs text-zinc-600">{concept.description}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="p-8 rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-accent-50/20 shadow-sm mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-5 h-5 text-accent-600" />
            <h3 className="font-semibold text-zinc-900">Core Technologies</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-2">
                Language & Frameworks
              </p>
              <p className="text-sm text-zinc-600">Python, FastAPI, LangGraph, LangChain</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-2">
                Data & Infrastructure
              </p>
              <p className="text-sm text-zinc-600">PostgreSQL + pgvector, Redis, Docker</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.08em] mb-2">
                Integration
              </p>
              <p className="text-sm text-zinc-600">REST APIs, MCP, Tool calling, Integrations</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link to="/courses/genaifast/learn" className="group inline-flex items-center gap-2 px-6 py-3 font-medium text-white bg-zinc-900 rounded-lg hover:bg-accent-600 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <span>Explore my AI work</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
