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
import { getModuleCopy, useIsKannada, useUiText } from '../utils/uiText.js'

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

  // Reset when module changes
  useEffect(() => {
    setTab('topics')
    setOpenSections(
      Object.fromEntries(module.sections.map((s) => [s.id, true]))
    )
  }, [module.id])

  // Handle deep-jump from search
  useEffect(() => {
    if (!jumpTopicId) return
    const section = module.sections.find((s) =>
      s.topics.some((t) => t.id === jumpTopicId)
    )
    if (section) {
      setTab('topics')
      setOpenSections((prev) => ({ ...prev, [section.id]: true }))
      // Scroll to the topic after render
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
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {L.backToDashboard}
      </button>

      {/* Header */}
      <header
        className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br ${module.color} p-6 md:p-7 mb-6`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {moduleCopy.title}
            </h1>
            <p className="text-slate-400 mt-2 max-w-3xl">{moduleCopy.description}</p>
          </div>
          <span className="badge bg-slate-900/70 text-slate-200 border border-slate-700">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {module.hours} hrs
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>{L.moduleProgress}</span>
            <span className="font-semibold text-accent-300">
              {prog.done} / {prog.total} ({prog.pct}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-500 to-amber-400 transition-all duration-500"
              style={{ width: `${prog.pct}%` }}
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-5 border-b border-slate-800">
        {tabs.map(({ id, labelKey, icon: Icon }) => {
          const active = tab === id
          const label = L[labelKey]
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                active
                  ? 'border-accent-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'projects' && (
                <span className="ml-1 text-xs text-slate-500">
                  ({module.projects.length})
                </span>
              )}
              {id === 'quiz' && quizResult && (
                <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded bg-accent-500/15 text-accent-300">
                  {quizResult.score}/{quizResult.total}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {tab === 'topics' && (
        <div className="space-y-3">
          {module.sections.map((section) => {
            const isOpen = openSections[section.id]
            const sectionDone = section.topics.filter((t) =>
              isTopicDone(t.id)
            ).length
            return (
              <section key={section.id} className="card">
                <button
                  onClick={() =>
                    setOpenSections((p) => ({ ...p, [section.id]: !p[section.id] }))
                  }
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors rounded-xl"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                    <h3 className="text-sm md:text-base font-semibold text-slate-100 truncate">
                      {section.title}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    {sectionDone} / {section.topics.length}
                  </span>
                </button>
                {isOpen && (
                  <ul className="px-2 pb-3 pt-1 space-y-0.5 animate-slide-down">
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
          {module.projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {tab === 'quiz' && (
        <QuizPanel
          moduleId={module.id}
          questions={module.quiz}
          savedResult={quizResult}
          onSubmit={setQuizResult}
        />
      )}

      {tab === 'notes' && (
        <div className="card p-5 animate-fade-in">
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            {L.notesFor} {moduleCopy.title}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(module.id, e.target.value)}
            placeholder={L.notesPlaceholder}
            className="w-full min-h-[260px] bg-slate-950 border border-slate-800 focus:border-accent-500 outline-none rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 resize-y transition-colors"
          />
          <p className="text-xs text-slate-500 mt-2">
            {L.notesSaved}
          </p>
        </div>
      )}
    </div>
  )
}
