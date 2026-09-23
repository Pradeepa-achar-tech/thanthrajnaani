import { CheckCircle2 } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Understand',
    description: 'Understand the product, users, business problem, and constraints.',
  },
  {
    number: '02',
    title: 'Architect',
    description: 'Design systems, APIs, data models, integrations, and technical foundations.',
  },
  {
    number: '03',
    title: 'Build',
    description: 'Develop the product across frontend, backend, mobile, desktop, and AI systems.',
  },
  {
    number: '04',
    title: 'Ship',
    description: "Deploy, test, monitor, and get the product into users' hands.",
  },
  {
    number: '05',
    title: 'Iterate',
    description: 'Measure, learn, improve, and continuously evolve the product.',
  },
]

export default function ProcessSection() {
  return (
    <section className="border-t border-zinc-200 bg-gradient-to-b from-accent-50/30 to-transparent">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-3">
            From idea to production
          </h2>
          <p className="text-sm md:text-base text-zinc-600 max-w-2xl">
            Understanding → Architecting → Building → Shipping → Iterating
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-5 gap-5 md:gap-3">
          {steps.map((step) => (
            <div key={step.number} className="group flex flex-col">
              {/* Number & Title */}
              <div className="mb-3">
                <div className="w-10 h-10 rounded-md bg-accent-100 text-accent-600 text-sm font-bold flex items-center justify-center group-hover:bg-accent-600 group-hover:text-white transition-all duration-300 mb-2">
                  {step.number}
                </div>
                <h3 className="text-base font-semibold text-zinc-900 group-hover:text-accent-600 transition-colors">{step.title}</h3>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-600 leading-relaxed flex-1 group-hover:text-zinc-700 transition-colors">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-10 pt-6 border-t border-zinc-200">
          <p className="text-xs text-zinc-600 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent-600 flex-shrink-0 mt-0.5" />
            <span>This mindset is what I bring to every project — web, mobile, desktop, AI.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
