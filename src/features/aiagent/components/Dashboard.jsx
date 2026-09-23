import { ArrowRight, BookMarked, Briefcase, Clock, Layers, Zap } from 'lucide-react'
import { curriculum, getTotals } from '../data/curriculum.js'
import { useUiText } from '../utils/uiText.js'

const accentBar = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  red: 'bg-red-500',
  fuchsia: 'bg-fuchsia-500',
  amber: 'bg-amber-500',
  lime: 'bg-lime-500',
}

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card p-4 flex items-center gap-3 hover:shadow-md transition-all">
    <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center">
      <Icon className="w-5 h-5 text-accent-500" />
    </div>
    <div>
      <div className="text-2xl font-bold text-zinc-900 leading-tight">{value}</div>
      <div className="text-[11px] text-zinc-600 uppercase tracking-[0.12em] font-semibold">{label}</div>
    </div>
  </div>
)

const ProgressBar = ({ done, total, pct }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs text-zinc-600">
      <span className="font-medium">Progress</span>
      <span className="font-semibold text-zinc-900">
        {done} / {total} ({pct}%)
      </span>
    </div>
    <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-accent-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  </div>
)

export default function Dashboard({ moduleProgress, overall, onOpenModule }) {
  const totals = getTotals()
  const L = useUiText()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero section */}
      <section className="card p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2 text-accent-500 text-[11px] uppercase tracking-[0.14em] font-semibold">
          <Zap className="w-4 h-4" />
          {L.heroEyebrow}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
          AI Agent Visual Lab
        </h1>
        <p className="text-zinc-600 max-w-3xl text-sm leading-relaxed">
          {L.heroDescription}
        </p>

        <div className="pt-4">
          <ProgressBar done={overall.done} total={overall.total} pct={overall.pct} />
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Layers} label={L.modules} value={totals.modules} />
        <StatCard icon={BookMarked} label={L.topics} value={totals.topics} />
        <StatCard icon={Briefcase} label={L.projects} value={totals.projects} />
        <StatCard icon={Clock} label={L.hours} value={`${totals.hours}h`} />
      </section>

      {/* Learning roadmap */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{L.modules}</h2>
        <p className="text-sm text-zinc-600">Your complete 12-week learning path. All weeks are available.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {curriculum.modules.map((m, idx) => {
            const prog = moduleProgress(m)
            const dotColor = accentBar[m.accent] || 'bg-slate-500'
            const topicCount = m.sections.reduce((acc, s) => acc + (s.topics?.length || 0), 0)
            const isLocked = false
            const isPhase1 = idx === 0

            return (
              <button
                key={m.id}
                onClick={() => !isLocked && onOpenModule(m.id)}
                disabled={isLocked}
                className={`group text-left card p-5 transition-all ${
                  isLocked
                    ? 'bg-zinc-100 cursor-not-allowed opacity-60'
                    : 'hover:shadow-md hover:border-accent-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-zinc-600 font-semibold">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    Week {idx + 1} · {m.hours}h
                  </span>
                  {!isLocked && (
                    <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-accent-500 group-hover:translate-x-0.5 transition-all" />
                  )}
                  {isLocked && (
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Coming Soon</span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">
                  {m.title}
                </h3>

                <p className="text-xs text-zinc-600 line-clamp-2 mb-4 leading-relaxed">
                  {m.description}
                </p>

                {!isLocked && prog.total > 0 && (
                  <div className="space-y-2 border-t border-zinc-200 pt-3">
                    <div className="flex justify-between text-xs text-zinc-600">
                      <span>{topicCount} topics</span>
                      <span>{prog.pct}%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-500 transition-all duration-500"
                        style={{ width: `${prog.pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Call to action */}
      <section className="card bg-accent-50 p-6 text-center">
        <p className="text-sm text-zinc-700 mb-3">
          Ready to start? <strong>Week 1: Python for a .NET Developer</strong> is ready to go.
        </p>
        <button
          onClick={() => onOpenModule('m0')}
          className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded font-medium text-sm transition-colors"
        >
          Start Learning →
        </button>
      </section>
    </div>
  )
}
