import { useState } from 'react'
import { ArrowLeft, Clock, CheckCircle2, Circle, ChevronDown, ListChecks, Briefcase, Trophy, NotebookPen } from 'lucide-react'
import TopicItem from './TopicItem.jsx'
import ProjectCard from './ProjectCard.jsx'
import QuizPanel from './QuizPanel.jsx'
import PythonComparison from './PythonComparison.jsx'
import PythonPlayground from './PythonPlayground.jsx'
import { useUiText } from '../utils/uiText.js'

const tabs = [
  { id: 'topics', label: 'Topics', icon: ListChecks },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'quiz', label: 'Quiz', icon: Trophy },
  { id: 'notes', label: 'Notes', icon: NotebookPen },
]

export default function ModulePage({
  module,
  isTopicDone,
  toggleTopic,
  moduleProgress,
  getNote,
  setNote,
  onBack,
  jumpTopicId,
  onJumpHandled,
}) {
  const L = useUiText()
  const [activeTab, setActiveTab] = useState('topics')
  const [expandedTopics, setExpandedTopics] = useState({})

  const prog = moduleProgress(module)
  const note = getNote(module.id)

  const toggleTopicExpanded = (topicId) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }))
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {L.backToDashboard}
      </button>

      {/* Module header */}
      <header className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 md:p-7 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
              {module.title}
            </h1>
            <p className="text-zinc-600 mt-2 max-w-3xl leading-relaxed">
              {module.description}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
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
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                active
                  ? 'border-accent-600 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'projects' && module.projects && (
                <span className="ml-1 text-xs text-zinc-400">
                  ({module.projects.length})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'topics' && (
        <div className="space-y-0">
          {module.sections.length === 0 && (
            <div className="card p-8 text-center text-sm text-zinc-500">
              Topics coming soon.
            </div>
          )}
          {module.sections.map((section) => {
            const sectionDone = section.topics.filter((t) => isTopicDone(t.id)).length
            return (
              <section key={section.id}>
                <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 sticky top-0">
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center justify-between">
                    <span>{section.title}</span>
                    <span className="text-xs font-semibold text-zinc-500">
                      {sectionDone} / {section.topics.length}
                    </span>
                  </h3>
                </div>
                <ul className="divide-y divide-zinc-200">
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
              </section>
            )
          })}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="grid md:grid-cols-2 gap-4">
          {(!module.projects || module.projects.length === 0) && (
            <div className="card p-8 text-center text-sm text-zinc-500 md:col-span-2">
              No projects yet.
            </div>
          )}
          {module.projects?.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {activeTab === 'quiz' && (
        <div>
          <QuizPanel module={module} onSaveResult={() => {}} />
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="card p-5 animate-fade-in">
          <label className="text-sm font-medium text-zinc-700 mb-2 block">
            {L.notesFor} {module.title}
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
