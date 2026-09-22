import { ArrowRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function FinalCTASection() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-16">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Have a product worth building?
          </h2>

          <p className="text-lg text-zinc-300 leading-relaxed mb-8">
            Whether you're building a new product, modernizing an existing system, exploring what's possible with AI, or need technical mentorship — I'd like to talk.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="mailto:thanthrajnaani@gmail.com" className="pf-btn-primary group px-6 py-3 text-base justify-center sm:justify-start">
              <Mail className="w-4 h-4" />
              <span>Get in touch</span>
            </a>

            <Link to="/courses" className="pf-btn-secondary group px-6 py-3 text-base justify-center sm:justify-start">
              <span>Explore my work</span>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
