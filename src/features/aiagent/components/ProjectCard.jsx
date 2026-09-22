import { ExternalLink, BookmarkPlus } from 'lucide-react'

export default function ProjectCard({ project }) {
  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
      {project.image && (
        <div className="w-full h-40 bg-zinc-100 overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold text-zinc-900 mb-1">{project.title}</h3>

        {project.description && (
          <p className="text-sm text-zinc-600 mb-3 line-clamp-2">
            {project.description}
          </p>
        )}

        {project.tools && project.tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="inline-block px-2 py-1 bg-zinc-100 text-zinc-700 text-xs rounded font-medium"
              >
                {tool}
              </span>
            ))}
          </div>
        )}

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-600 hover:text-accent-700 transition-colors"
          >
            View Project
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}
