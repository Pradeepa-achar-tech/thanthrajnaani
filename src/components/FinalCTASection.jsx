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
            <a href="mailto:thanthrajnaani@gmail.com" className="group inline-flex items-center justify-center sm:justify-start gap-2 px-6 py-3 text-base font-medium text-zinc-900 bg-white rounded-lg hover:bg-accent-100 hover:text-accent-600 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <Mail className="w-4 h-4" />
              <span>Get in touch</span>
            </a>

            <Link to="/courses" className="group inline-flex items-center justify-center sm:justify-start gap-2 px-6 py-3 text-base font-medium text-white bg-accent-600 rounded-lg hover:bg-accent-700 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <span>Explore my work</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
