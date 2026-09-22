import { Globe, Smartphone, Box, Zap } from 'lucide-react'

const capabilities = [
  {
    icon: Globe,
    title: 'Full-Stack Web',
    description:
      'Business applications, dashboards, platforms, and SaaS products built with modern frontend and backend architecture.',
    technologies: 'ASP.NET Core · C# · React · JavaScript · SQL Server · PostgreSQL',
  },
  {
    icon: Smartphone,
    title: 'Mobile',
    description:
      'Cross-platform mobile applications backed by scalable APIs and real-world business logic.',
    technologies: 'Flutter · Dart · ASP.NET Core · REST APIs',
  },
  {
    icon: Box,
    title: 'Desktop',
    description:
      'Cross-platform desktop applications that combine modern React interfaces with native desktop capabilities.',
    technologies: 'React · Electron · Node.js',
  },
  {
    icon: Zap,
    title: 'AI & Agents',
    description:
      'Exploring intelligent applications where LLMs can reason over context, use tools, retrieve information, and automate multi-step workflows.',
    technologies: 'LLMs · RAG · Tool Calling · MCP · Vector Search · LangGraph · Python',
    badge: 'Current Focus',
  },
]

export default function CapabilitiesSection() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-16">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
            What I build
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl">
            From product idea to production software across multiple platforms and technologies.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {capabilities.map((cap) => {
            const Icon = cap.icon
            return (
              <div key={cap.title} className="pf-card p-8 flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-lg bg-accent-50 flex items-center justify-center text-accent-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  {cap.badge && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-50 text-accent-700">
                      {cap.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-zinc-900 mb-2">{cap.title}</h3>
                <p className="text-zinc-600 mb-5 flex-1 leading-relaxed">{cap.description}</p>

                <div className="pt-5 border-t border-zinc-100">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-[0.08em]">
                    Technologies
                  </p>
                  <p className="text-sm text-zinc-600 mt-2">{cap.technologies}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
