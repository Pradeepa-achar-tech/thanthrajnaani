import { ArrowRight, BookMarked, Briefcase, Clock, Layers, Sparkles } from 'lucide-react'
import { curriculum, getTotals } from '../data/curriculum.js'
import { getModuleCopy, useIsKannada, useUiText } from '../utils/uiText.js'

const accentBar = {
  emerald: 'bg-emerald-500',
  sky:     'bg-sky-500',
  violet:  'bg-violet-500',
  orange:  'bg-accent-500',
  cyan:    'bg-cyan-500',
  rose:    'bg-rose-500',
  yellow:  'bg-yellow-500',
}

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center">
      <Icon className="w-5 h-5 text-accent-600" />
    </div>
    <div>
      <div className="text-2xl font-bold text-zinc-900 leading-tight">{value}</div>
      <div className="text-[11px] text-zinc-500 uppercase tracking-[0.12em] font-semibold">{label}</div>
    </div>
  </div>
)

export default function Dashboard({ moduleProgress, overall, onOpenModule }) {
  const totals = getTotals()
  const L = useUiText()
  const isKannada = useIsKannada()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero — clean light card, no gradient */}
      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 md:p-8">
        <div className="flex items-center gap-2 text-accent-600 text-[11px] uppercase tracking-[0.14em] font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {L.heroEyebrow}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
          {L.heroTitlePrefix} <span className="text-accent-600">Thanthrajnaani</span>
        </h1>
        <p className="text-zinc-600 mt-2 max-w-2xl">{L.heroDescription}</p>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
            <span className="font-medium">{L.overallProgress}</span>
            <span className="font-semibold text-zinc-900">
              {overall.done} / {overall.total} {L.topics.toLowerCase()} ({overall.pct}%)
            </span>
          </div>
          <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 transition-all duration-500"
              style={{ width: `${overall.pct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Layers} label={L.modules} value={totals.modules} />
        <StatCard icon={BookMarked} label={L.topics} value={totals.topics} />
        <StatCard icon={Briefcase} label={L.projects} value={totals.projects} />
        <StatCard icon={Clock} label={L.hours} value={`${totals.hours}h`} />
      </section>

      {/* Module grid */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 mb-4">{L.modules}</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {curriculum.modules.map((m, idx) => {
            const prog = moduleProgress(m)
            const dotColor = accentBar[m.accent] || 'bg-zinc-400'
            const copy = getModuleCopy(m, isKannada)
            const topicCount = m.sections.reduce((acc, s) => acc + s.topics.length, 0)
            return (
              <button
                key={m.id}
                onClick={() => onOpenModule(m.id)}
                className="group text-left card card-hover p-5 relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-zinc-500 font-semibold">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    Module {idx} · {m.hours}h
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-accent-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-1.5">
                  {copy.title}
                </h3>
                <p className="text-sm text-zinc-600 line-clamp-2 mb-4 leading-relaxed">
                  {copy.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                  <span>{topicCount} {L.topics.toLowerCase()}</span>
                  <span className="text-zinc-300">•</span>
                  <span>{m.projects.length} {L.projects.toLowerCase()}</span>
                </div>

                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-500">{L.progress}</span>
                  <span className="font-semibold text-zinc-900">{prog.pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${dotColor} transition-all`}
                    style={{ width: `${prog.pct}%` }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
