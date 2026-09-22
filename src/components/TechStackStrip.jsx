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
    <section className="border-t border-zinc-200 bg-zinc-50/40">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {techs.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-zinc-600 bg-white border border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
