import { useRef } from 'react'
import {
  BookOpen,
  Download,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react'
import { curriculum } from '../data/curriculum.js'
import { getModuleCopy, useIsKannada, useUiText } from '../utils/uiText.js'

const accentBar = {
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  orange: 'bg-accent-500',
  cyan: 'bg-cyan-500',
  rose: 'bg-rose-500',
  yellow: 'bg-yellow-500',
}

export default function Sidebar({
  user,
  activeView,
  activeModuleId,
  moduleProgress,
  overallPct,
  onSelect,
  onReset,
  onExport,
  onImport,
  onSignOut,
  open,
  onClose,
}) {
  const fileInputRef = useRef(null)
  const L = useUiText()
  const isKannada = useIsKannada()

  const triggerImport = () => fileInputRef.current?.click()
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onImport?.(file)
    e.target.value = '' // allow re-importing the same file later
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky md:top-0 md:self-start z-40 top-0 left-0 h-screen w-72 flex flex-col bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-accent-500/15 border border-accent-500/30 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-accent-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white leading-tight">
                {L.appTitle}
              </h1>
              <p className="text-[11px] text-slate-500 leading-tight truncate">
                by{' '}
                <span className="font-extrabold italic tracking-wide bg-gradient-to-r from-accent-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(249,115,22,0.35)]">
                  Thanthrajnaani
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => onSelect('dashboard')}
          className={`mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'dashboard'
              ? 'bg-accent-500/10 text-accent-300 border border-accent-500/30'
              : 'text-slate-300 hover:bg-slate-800 border border-transparent'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          {L.dashboard}
          <span className="ml-auto text-xs text-slate-500">{overallPct}%</span>
        </button>

        <div className="px-5 mt-5 mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-500">
          <BookOpen className="w-3.5 h-3.5" />
          {L.modules}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {curriculum.modules.map((m, idx) => {
            const prog = moduleProgress(m)
            const active = activeView === 'module' && activeModuleId === m.id
            const copy = getModuleCopy(m, isKannada)
            return (
              <button
                key={m.id}
                onClick={() => onSelect('module', m.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                  active
                    ? 'bg-slate-800 border-accent-500/40'
                    : 'border-transparent hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-start gap-2 min-w-0">
                    <span
                      className={`mt-0.5 inline-block w-1.5 h-1.5 rounded-full ${
                        accentBar[m.accent] || 'bg-slate-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">
                        {idx === 0 ? 'Module 0' : `Term ${idx}`}
                      </div>
                      <div className="text-sm font-medium text-slate-100 truncate">
                        {copy.title}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 flex-shrink-0">
                    {prog.pct}%
                  </span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      accentBar[m.accent] || 'bg-slate-500'
                    } transition-all`}
                    style={{ width: `${prog.pct}%` }}
                  />
                </div>
              </button>
            )
          })}
        </nav>

        {/* User profile */}
        {user && (
          <div className="border-t border-slate-800 px-3 pt-3 pb-1">
            <div className="flex items-center gap-2.5 px-1 mb-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-slate-700 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-xs font-bold text-accent-400 flex-shrink-0">
                  {user.displayName?.[0] ?? user.email?.[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate leading-tight">
                  {user.displayName ?? L.learner}
                </p>
                <p className="text-[10px] text-slate-500 truncate leading-tight">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-800 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExport}
              title={L.exportTitle}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-accent-300 px-2 py-2 rounded-lg border border-slate-800 hover:border-accent-500/30 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {L.export}
            </button>
            <button
              onClick={triggerImport}
              title={L.importTitle}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-accent-300 px-2 py-2 rounded-lg border border-slate-800 hover:border-accent-500/30 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              {L.import}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-rose-300 px-3 py-2 rounded-lg border border-slate-800 hover:border-rose-500/30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {L.resetAllProgress}
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-rose-400 px-3 py-2 rounded-lg border border-slate-800 hover:border-rose-500/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {L.signOut}
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
