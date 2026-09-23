import { Globe, Smartphone, Box, Zap } from 'lucide-react'

const capabilities = [
  {
    icon: Globe,
    title: 'Full-Stack Web',
    description:
      'Business applications, dashboards, platforms, and SaaS products built with modern frontend and backend architecture.',
    technologies: 'ASP.NET Core · C# · React · JavaScript · SQL Server · PostgreSQL',
    gradient: 'from-blue-50/50 to-transparent',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Smartphone,
    title: 'Mobile',
    description:
      'Cross-platform mobile applications backed by scalable APIs and real-world business logic.',
    technologies: 'Flutter · Dart · ASP.NET Core · REST APIs',
    gradient: 'from-purple-50/50 to-transparent',
    iconBg: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Box,
    title: 'Desktop',
    description:
      'Cross-platform desktop applications that combine modern React interfaces with native desktop capabilities.',
    technologies: 'React · Electron · Node.js',
    gradient: 'from-amber-50/50 to-transparent',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Zap,
    title: 'AI & Agents',
    description:
      'Exploring intelligent applications where LLMs can reason over context, use tools, retrieve information, and automate multi-step workflows.',
    technologies: 'LLMs · RAG · Tool Calling · MCP · Vector Search · LangGraph · Python',
    badge: 'Current Focus',
    gradient: 'from-accent-50/80 to-orange-100/20',
    iconBg: 'bg-accent-600 text-white',
  },
]

export default function CapabilitiesSection() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50/40">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-2">
            What I build
          </h2>
          <p className="text-sm md:text-base text-zinc-600 max-w-2xl">
            Production software across web, mobile, desktop, and AI systems.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {capabilities.map((cap) => {
            const Icon = cap.icon
            return (
              <div
                key={cap.title}
                className={`group relative p-6 rounded-xl border border-zinc-200 bg-gradient-to-br ${cap.gradient} flex flex-col shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${cap.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {cap.badge && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-accent-600 text-white whitespace-nowrap">
                      {cap.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-zinc-900 mb-1.5 group-hover:text-accent-600 transition-colors">{cap.title}</h3>
                <p className="text-xs text-zinc-600 mb-4 flex-1 leading-relaxed">{cap.description}</p>

                <div className="pt-4 border-t border-zinc-200">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tech</p>
                  <p className="text-xs text-zinc-600 mt-1">{cap.technologies}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
