import { ArrowRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-12 md:pb-16">
      <div className="space-y-6">
        {/* Eyebrow */}
        <div className="flex items-center gap-2">
          <span className="eyebrow text-zinc-500">
            KUNDAPURA, INDIA · PRODUCT OWNER · SOFTWARE ARCHITECT · FULL-STACK ENGINEER
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-zinc-900 max-w-4xl">
          I architect, build, and ship{' '}
          <span className="text-accent-600">products across web, mobile, desktop,</span> and{' '}
          <span className="text-accent-600">AI</span>.
        </h1>

        {/* Supporting Copy */}
        <div className="max-w-2xl space-y-4 text-zinc-600">
          <p className="text-lg leading-relaxed">
            I'm Thanthrajnani — a product-focused software engineer building production-ready applications across multiple platforms.
          </p>

          <p className="text-base leading-relaxed">
            <strong className="text-zinc-900">Full-stack experience:</strong> ASP.NET Core, C#, React, JavaScript, jQuery, HTML, CSS, MS SQL Server, PostgreSQL, Flutter, Electron, and Node.js.
          </p>

          <p className="text-base leading-relaxed">
            <strong className="text-zinc-900">Current direction:</strong> Exploring AI agents and LLM-powered applications — RAG, tool calling, MCP, vector search, agentic workflows, and AI-driven automation.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 pt-6">
          <Link to="/courses" className="group inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <span>Explore my work</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/courses" className="group inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-zinc-900 bg-zinc-100 rounded-lg hover:bg-accent-100 hover:text-accent-600 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5">
            <span>View courses</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a href="mailto:thanthrajnaani@gmail.com" className="group inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-zinc-900 bg-zinc-100 rounded-lg hover:bg-accent-100 hover:text-accent-600 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5">
            <Mail className="w-4 h-4" />
            Get in touch
          </a>
        </div>
      </div>
    </section>
  )
}
