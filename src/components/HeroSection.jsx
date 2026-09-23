import { ArrowRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 pt-14 md:pt-20 pb-10 md:pb-14">
      <div className="space-y-4 md:space-y-5">
        {/* Eyebrow */}
        <div className="inline-block">
          <span className="eyebrow text-zinc-500 text-xs tracking-wider opacity-0 animate-[fadeIn_0.6s_ease-out_0.1s_forwards]">
            PRODUCT OWNER · SOFTWARE ARCHITECT · FULL-STACK ENGINEER
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight text-zinc-900 max-w-4xl opacity-0 animate-[fadeIn_0.7s_ease-out_0.2s_forwards]">
          I architect, build, and ship{' '}
          <span className="text-accent-600">products across web, mobile, desktop,</span> and{' '}
          <span className="text-accent-600">AI</span>.
        </h1>

        {/* Supporting Copy */}
        <div className="max-w-2xl space-y-2.5 text-zinc-600 opacity-0 animate-[fadeIn_0.6s_ease-out_0.3s_forwards]">
          <p className="text-base md:text-lg leading-relaxed">
            I'm Thanthrajnani — a product-focused software engineer building production-ready applications across multiple platforms.
          </p>

          <p className="text-sm md:text-base leading-relaxed">
            <strong className="text-zinc-900">Full-stack:</strong> ASP.NET Core, C#, React, JavaScript, Flutter, Electron, PostgreSQL, SQL Server, Node.js.
          </p>

          <p className="text-sm md:text-base leading-relaxed">
            <strong className="text-zinc-900">Current focus:</strong> AI agents, LLMs, RAG, tool calling, agentic workflows.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-2 pt-4 opacity-0 animate-[fadeIn_0.6s_ease-out_0.4s_forwards]">
          <Link to="/courses" className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-accent-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <span>Explore my work</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link to="/courses" className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-900 bg-zinc-100 rounded-lg hover:bg-accent-100 hover:text-accent-600 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <span>View courses</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a href="mailto:thanthrajnaani@gmail.com" className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-900 bg-zinc-100 rounded-lg hover:bg-accent-100 hover:text-accent-600 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <Mail className="w-4 h-4" />
            Get in touch
          </a>
        </div>
      </div>
    </section>
  )
}
