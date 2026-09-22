import { BookOpen, LayoutDashboard, LogOut, RotateCcw, X } from 'lucide-react'
import { curriculum } from '../data/curriculum.js'
import { useUiText } from '../utils/uiText.js'

const accentBar = {
  blue: 'bg-accent-500',
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

export default function Sidebar({
  activeView,
  activeModuleId,
  moduleProgress,
  overallPct,
  onSelect,
  onReset,
  open,
  onClose,
}) {
  const L = useUiText()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-zinc-900/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky md:top-0 md:self-start z-40 top-0 left-0 h-screen w-72 flex flex-col bg-white border-r border-zinc-200 transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand row */}
        <div className="px-6 py-6 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-b from-white to-zinc-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-lg">
              AI
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-zinc-900 leading-tight">
                AI Agent Lab
              </h1>
              <p className="text-xs text-zinc-500 leading-tight truncate">
                by <span className="font-semibold text-accent-600">Thanthrajnaani</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard link */}
        <button
          onClick={() => {
            onSelect('dashboard')
            onClose()
          }}
          className={`mx-4 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            activeView === 'dashboard'
              ? 'bg-accent-50 text-accent-600 border border-accent-200 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          {L.dashboard}
        </button>

        {/* Progress section */}
        <div className="mx-4 mt-5 p-4 bg-gradient-to-br from-accent-50 to-orange-50 border border-accent-100 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm text-zinc-900">{L.progress}</span>
            <span className="text-sm font-bold text-accent-600">{overallPct}%</span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden border border-accent-200">
            <div
              className="h-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-2">Keep learning! More topics to explore.</p>
        </div>

        {/* Modules list */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="text-xs font-bold text-zinc-700 uppercase px-3 mb-3 tracking-widest">
            📚 Learning Path
          </div>
          <div className="space-y-2">
            {curriculum.modules.map((module, idx) => {
              const isActive = activeModuleId === module.id
              const prog = moduleProgress(module)
              const barColor = accentBar[module.accent] || 'bg-zinc-400'

              return (
                <button
                  key={module.id}
                  onClick={() => {
                    onSelect('module', module.id)
                    onClose()
                  }}
                  className={`w-full flex flex-col gap-1.5 px-3.5 py-3 rounded-xl transition-all border text-left ${
                    isActive
                      ? 'bg-accent-50 border-accent-300 shadow-md'
                      : 'bg-white border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${barColor} flex-shrink-0 shadow-sm`} />
                    <span className={`flex-1 text-xs font-semibold truncate ${isActive ? 'text-accent-900' : 'text-zinc-800'}`}>
                      Week {idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold flex-shrink-0 ${prog.pct > 0 ? (isActive ? 'text-accent-600' : 'text-accent-500') : 'text-zinc-400'}`}>
                      {prog.pct}%
                    </span>
                  </div>
                  <span className={`text-[11px] truncate ${isActive ? 'text-accent-700 font-medium' : 'text-zinc-600'}`}>
                    {module.title.replace('Week ' + (idx + 1) + ' — ', '')}
                  </span>
                  {prog.total > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${barColor}`}
                          style={{ width: `${prog.pct}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-zinc-500 font-medium">{prog.done}/{prog.total}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer actions */}
        <div className="px-3 py-4 border-t border-zinc-100 flex flex-col gap-2">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Progress
          </button>
        </div>
      </aside>
    </>
  )
}
