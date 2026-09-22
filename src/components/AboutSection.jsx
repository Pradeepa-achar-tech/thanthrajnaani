import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AboutSection() {
  return (
    <section className="border-t border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-24">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-8">
            Building software. Solving problems. Sharing what I learn.
          </h2>

          <div className="space-y-6 text-zinc-600 text-lg leading-relaxed">
            <p>
              I'm a Product Owner, Software Architect, and Full-Stack Engineer focused on turning ideas into reliable, maintainable software.
            </p>

            <p>
              My experience spans web, APIs, databases, mobile, desktop, and increasingly AI-powered systems. I enjoy working across the entire product lifecycle — understanding the problem, designing the architecture, building the product, shipping it, and continuously improving it.
            </p>

            <p>
              I also turn real-world engineering experience into practical, project-based courses in English and Kannada, designed to make solid engineering accessible to anyone willing to build.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-zinc-200">
            <Link to="/about" className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium group">
              <span>More about me</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
