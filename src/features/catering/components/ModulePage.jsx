import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  ListChecks,
  NotebookPen,
  Briefcase,
  Trophy,
} from 'lucide-react'
import TopicItem from './TopicItem.jsx'
import ProjectCard from './ProjectCard.jsx'
import QuizPanel from './QuizPanel.jsx'
import {
  getModuleCopy,
  getSectionTitle,
  useIsKannada,
  useUiText,
} from '../utils/uiText.js'

const tabs = [
  { id: 'topics', labelKey: 'topics', icon: ListChecks },
  { id: 'projects', labelKey: 'projects', icon: Briefcase },
  { id: 'quiz', labelKey: 'quiz', icon: Trophy },
  { id: 'notes', labelKey: 'notes', icon: NotebookPen },
]

export default function ModulePage({
  module,
  isTopicDone,
  toggleTopic,
  moduleProgress,
  getNote,
  setNote,
  getQuizResult,
  setQuizResult,
  onBack,
  jumpTopicId,
  onJumpHandled,
}) {
  const L = useUiText()
  const isKannada = useIsKannada()
  const [tab, setTab] = useState('topics')
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(module.sections.map((s) => [s.id, true]))
  )

  useEffect(() => {
    setTab('topics')
    setOpenSections(
      Object.fromEntries(module.sections.map((s) => [s.id, true]))
    )
  }, [module.id])

  useEffect(() => {
    if (!jumpTopicId) return
    const section = module.sections.find((s) =>
      s.topics.some((t) => t.id === jumpTopicId)
    )
    if (section) {
      setTab('topics')
      setOpenSections((prev) => ({ ...prev, [section.id]: true }))
      setTimeout(() => {
        const el = document.getElementById(`topic-${jumpTopicId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('ring-2', 'ring-accent-500/60', 'rounded-lg')
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-accent-500/60', 'rounded-lg')
          }, 1800)
        }
      }, 80)
    }
    onJumpHandled?.()
  }, [jumpTopicId, module])

  const prog = useMemo(() => moduleProgress(module), [module, moduleProgress])
  const note = getNote(module.id)
  const quizResult = getQuizResult(module.id)
  const moduleCopy = getModuleCopy(module, isKannada)

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {L.backToDashboard}
      </button>

      {/* Module header — clean light card */}
      <header className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 md:p-7 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
              {moduleCopy.title}
            </h1>
            <p className="text-zinc-600 mt-2 max-w-3xl leading-relaxed">{moduleCopy.description}</p>
          </div>
          <span className="badge bg-white border border-zinc-200 text-zinc-700">
            <Clock className="w-3.5 h-3.5 mr-1 text-zinc-500" />
            {module.hours} hrs
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
            <span className="font-medium">{L.moduleProgress}</span>
            <span className="font-semibold text-zinc-900">
              {prog.done} / {prog.total} ({prog.pct}%)
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 transition-all duration-500"
              style={{ width: `${prog.pct}%` }}
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-zinc-200">
        {tabs.map(({ id, labelKey, icon: Icon }) => {
          const active = tab === id
          const label = L[labelKey]
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                active
                  ? 'border-accent-600 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'projects' && (
                <span className="ml-1 text-xs text-zinc-400">
                  ({module.projects.length})
                </span>
              )}
              {id === 'quiz' && quizResult && (
                <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-md bg-accent-50 text-accent-700 font-semibold">
                  {quizResult.score}/{quizResult.total}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {tab === 'topics' && (
        <div className="space-y-3">
          {module.sections.length === 0 && (
            <div className="card p-8 text-center text-sm text-zinc-500">
              Topics for this module are coming soon.
            </div>
          )}
          {module.sections.map((section) => {
            const isOpen = openSections[section.id]
            const sectionDone = section.topics.filter((t) =>
              isTopicDone(t.id)
            ).length
            return (
              <section key={section.id} className="card overflow-hidden">
                <button
                  onClick={() =>
                    setOpenSections((p) => ({ ...p, [section.id]: !p[section.id] }))
                  }
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    )}
                    <h3 className="text-sm md:text-base font-semibold text-zinc-900 truncate">
                      {getSectionTitle(section, isKannada)}
                    </h3>
                  </div>
                  <span className="text-xs text-zinc-500 font-medium flex-shrink-0">
                    {sectionDone} / {section.topics.length}
                  </span>
                </button>
                {isOpen && (
                  <ul className="px-2 pb-3 pt-1 space-y-0.5 animate-slide-down border-t border-zinc-100">
                    {section.topics.map((t) => (
                      <li key={t.id} id={`topic-${t.id}`}>
                        <TopicItem
                          topic={t}
                          done={isTopicDone(t.id)}
                          onToggle={toggleTopic}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}

      {tab === 'projects' && (
        <div className="grid md:grid-cols-2 gap-4">
          {module.projects.length === 0 && (
            <div className="card p-8 text-center text-sm text-zinc-500 md:col-span-2">
              No projects yet for this module.
            </div>
          )}
          {module.projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {tab === 'quiz' && (
        module.quiz.length === 0 ? (
          <div className="card p-8 text-center text-sm text-zinc-500">
            Quiz coming with this module's tutorials.
          </div>
        ) : (
          <QuizPanel
            moduleId={module.id}
            questions={module.quiz}
            savedResult={quizResult}
            onSubmit={setQuizResult}
          />
        )
      )}

      {tab === 'notes' && (
        <div className="card p-5 animate-fade-in">
          <label className="text-sm font-medium text-zinc-700 mb-2 block">
            {L.notesFor} {moduleCopy.title}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(module.id, e.target.value)}
            placeholder={L.notesPlaceholder}
            className="w-full min-h-[260px] bg-white border border-zinc-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none rounded-lg p-3 text-sm text-zinc-900 placeholder-zinc-400 resize-y transition-all"
          />
          <p className="text-xs text-zinc-500 mt-2">
            {L.notesSaved}
          </p>
        </div>
      )}
    </div>
  )
}
