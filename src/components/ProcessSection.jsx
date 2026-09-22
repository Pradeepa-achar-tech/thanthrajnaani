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
    <section className="border-t border-zinc-200 bg-gradient-to-b from-accent-50/40 to-transparent">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
            From idea to production
          </h2>
          <p className="text-lg text-zinc-600 mt-4 max-w-2xl">
            This is how I approach every project — understanding the problem, designing the solution, shipping it, and improving it.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-5 gap-6 md:gap-4">
          {steps.map((step, i) => (
            <div key={step.number} className="flex flex-col">
              {/* Number & Title */}
              <div className="mb-4">
                <div className="text-3xl md:text-4xl font-bold text-accent-600 mb-2">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">{step.title}</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-600 leading-relaxed mb-4 flex-1">
                {step.description}
              </p>

              {/* Connector (hidden on last) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute h-0.5 w-4 bg-zinc-200 transform translate-x-20 translate-y-8" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 pt-8 border-t border-zinc-200">
          <p className="text-sm text-zinc-600 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
            This mindset — understanding, designing, building, shipping, and iterating — is what I bring to every project, whether it's a web application, mobile app, desktop software, or AI system.
          </p>
        </div>
      </div>
    </section>
  )
}
