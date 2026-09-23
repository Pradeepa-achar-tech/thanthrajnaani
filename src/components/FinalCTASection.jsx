import { ArrowRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FinalCTASection() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            Have a product worth building?
          </h2>

          <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-6">
            Building a new product, modernizing a system, exploring AI, or need technical mentorship? I'd like to talk.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:thanthrajnaani@gmail.com" className="group inline-flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 text-sm font-medium text-zinc-900 bg-white rounded-lg hover:bg-accent-100 hover:text-accent-600 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <Mail className="w-4 h-4" />
              <span>Get in touch</span>
            </a>

            <Link to="/courses" className="group inline-flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 text-sm font-medium text-white bg-accent-600 rounded-lg hover:bg-accent-700 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <span>Explore work</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
