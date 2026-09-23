export default function TechStackStrip() {
  const techs = [
    'ASP.NET Core',
    'C#',
    'React',
    'JavaScript',
    'Flutter',
    'Electron',
    'Node.js',
    'PostgreSQL',
    'SQL Server',
    'Python',
    'AI Agents',
    'LLMs',
  ]

  return (
    <section className="border-t border-zinc-200 bg-gradient-to-b from-zinc-50/40 to-transparent">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {techs.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-zinc-600 bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:border-accent-300 hover:text-accent-600 hover:bg-accent-50 transition-all duration-300 hover:-translate-y-0.5"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
