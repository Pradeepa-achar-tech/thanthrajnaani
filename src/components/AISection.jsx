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
    <section className="border-t border-zinc-200 bg-gradient-to-b from-accent-50/30 to-transparent">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14">
        {/* Header */}
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-2">
            Now building with AI
          </h2>

          <p className="text-sm md:text-base text-zinc-600 leading-relaxed">
            Software that reasons over context, retrieves information, uses tools, and acts autonomously. My current direction.
          </p>
        </div>

        {/* Concepts Grid */}
        <div className="grid md:grid-cols-4 gap-3 mb-8">
          {aiConcepts.map((concept) => (
            <div
              key={concept.title}
              className="group p-3 rounded-lg border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-accent-300 hover:bg-gradient-to-br hover:from-accent-50 hover:to-accent-100/20 transition-all duration-300"
            >
              <h3 className="text-sm font-semibold text-zinc-900 mb-0.5 group-hover:text-accent-600 transition-colors">{concept.title}</h3>
              <p className="text-xs text-zinc-600 line-clamp-2">{concept.description}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="p-6 rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-accent-50/20 shadow-sm mb-8">
          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                Languages & Frameworks
              </p>
              <p className="text-xs text-zinc-600">Python, FastAPI, LangGraph, LangChain</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                Data & Infrastructure
              </p>
              <p className="text-xs text-zinc-600">PostgreSQL + pgvector, Redis, Docker</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                Integration
              </p>
              <p className="text-xs text-zinc-600">REST APIs, MCP, Tool calling</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link to="/courses/genaifast/learn" className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-accent-600 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <span>Explore my AI work</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
