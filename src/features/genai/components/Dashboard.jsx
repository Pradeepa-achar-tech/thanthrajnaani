import { ArrowRight, BookMarked, Briefcase, Clock, Layers, Sparkles } from 'lucide-react'
import { curriculum, getTotals } from '../data/curriculum.js'
import { getModuleCopy, useIsKannada, useUiText } from '../utils/uiText.js'

const accentTheme = {
  emerald: { bar: 'bg-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-300' },
  sky:     { bar: 'bg-sky-500',     ring: 'ring-sky-500/30',     text: 'text-sky-300' },
  violet:  { bar: 'bg-violet-500',  ring: 'ring-violet-500/30',  text: 'text-violet-300' },
  orange:  { bar: 'bg-accent-500',  ring: 'ring-accent-500/30',  text: 'text-accent-300' },
  cyan:    { bar: 'bg-cyan-500',    ring: 'ring-cyan-500/30',    text: 'text-cyan-300' },
  rose:    { bar: 'bg-rose-500',    ring: 'ring-rose-500/30',    text: 'text-rose-300' },
  yellow:  { bar: 'bg-yellow-500',  ring: 'ring-yellow-500/30',  text: 'text-yellow-300' },
}

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
      <Icon className="w-5 h-5 text-accent-400" />
    </div>
    <div>
      <div className="text-2xl font-bold text-white leading-tight">{value}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  </div>
)

export default function Dashboard({ moduleProgress, overall, onOpenModule }) {
  const totals = getTotals()
  const L = useUiText()
  const isKannada = useIsKannada()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 md:p-8">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="relative flex items-center gap-2 text-accent-400 text-xs uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          {L.heroEyebrow}
        </div>
        <h1 className="relative text-2xl md:text-3xl font-bold text-white">
          {L.heroTitlePrefix}{' '}
          <span className="font-extrabold italic tracking-wide bg-gradient-to-r from-accent-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(249,115,22,0.45)]">
            Thanthrajnaani
          </span>
        </h1>
        <p className="relative text-slate-400 mt-2 max-w-2xl">
          {L.heroDescription}
        </p>

        <div className="relative mt-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{L.overallProgress}</span>
            <span className="font-semibold text-accent-300">
              {overall.done} / {overall.total} {L.topics.toLowerCase()} ({overall.pct}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-500 to-amber-400 transition-all duration-500"
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
        <h2 className="text-lg font-semibold text-white mb-4">{L.modules}</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {curriculum.modules.map((m, idx) => {
            const prog = moduleProgress(m)
            const theme = accentTheme[m.accent] || accentTheme.orange
            const copy = getModuleCopy(m, isKannada)
            const topicCount = m.sections.reduce(
              (acc, s) => acc + s.topics.length,
              0
            )
            return (
              <button
                key={m.id}
                onClick={() => onOpenModule(m.id)}
                className={`text-left card card-hover p-5 relative overflow-hidden bg-gradient-to-br ${m.color}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                    {idx === 0 ? 'Module 0' : `Term ${idx}`} · {m.hours}h
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">
                  {copy.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                  {copy.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  <span>{topicCount} {L.topics.toLowerCase()}</span>
                  <span className="text-slate-600">•</span>
                  <span>{m.projects.length} {L.projects.toLowerCase()}</span>
                </div>

                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{L.progress}</span>
                  <span className={`font-semibold ${theme.text}`}>{prog.pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${theme.bar} transition-all`}
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
