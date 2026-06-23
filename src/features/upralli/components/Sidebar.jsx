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
    e.target.value = ''
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-zinc-900/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky md:top-0 md:self-start z-40 top-0 left-0 h-screen w-72 flex flex-col bg-zinc-50 border-r border-zinc-200 transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand row */}
        <div className="px-5 py-5 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-accent-500 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-zinc-900 leading-tight">
                {L.appTitle}
              </h1>
              <p className="text-[11px] text-zinc-500 leading-tight truncate">
                by <span className="font-semibold text-zinc-700">Thanthrajnaani</span>
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
          onClick={() => onSelect('dashboard')}
          className={`mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'dashboard'
              ? 'bg-white text-zinc-900 border border-zinc-200 shadow-sm'
              : 'text-zinc-600 hover:bg-white hover:text-zinc-900 border border-transparent'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          {L.dashboard}
          <span className="ml-auto text-xs text-zinc-400 font-normal">{overallPct}%</span>
        </button>

        {/* Section label */}
        <div className="px-5 mt-5 mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-zinc-400 font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          {L.modules}
        </div>

        {/* Module list */}
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
                    ? 'bg-white border-zinc-200 shadow-sm'
                    : 'border-transparent hover:bg-white hover:border-zinc-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-start gap-2 min-w-0">
                    <span
                      className={`mt-1.5 inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        accentBar[m.accent] || 'bg-zinc-400'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.1em] text-zinc-400 font-semibold">
                        Module {idx}
                      </div>
                      <div className="text-sm font-medium text-zinc-900 truncate">
                        {copy.title}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-medium flex-shrink-0 mt-0.5">
                    {prog.pct}%
                  </span>
                </div>
                <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${accentBar[m.accent] || 'bg-zinc-400'} transition-all`}
                    style={{ width: `${prog.pct}%` }}
                  />
                </div>
              </button>
            )
          })}
        </nav>

        {/* User block */}
        {user && (
          <div className="border-t border-zinc-200 px-3 pt-3 pb-1">
            <div className="flex items-center gap-2.5 px-1 mb-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-zinc-200 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-xs font-bold text-accent-700 flex-shrink-0">
                  {user.displayName?.[0] ?? user.email?.[0]}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-900 truncate leading-tight">
                  {user.displayName ?? L.learner}
                </p>
                <p className="text-[10px] text-zinc-500 truncate leading-tight">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Utility actions */}
        <div className="border-t border-zinc-200 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onExport}
              title={L.exportTitle}
              className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-white px-2 py-2 rounded-lg border border-zinc-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {L.export}
            </button>
            <button
              onClick={triggerImport}
              title={L.importTitle}
              className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-white px-2 py-2 rounded-lg border border-zinc-200 transition-colors"
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
            className="w-full flex items-center justify-center gap-2 text-xs text-zinc-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 px-3 py-2 rounded-lg border border-zinc-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {L.resetAllProgress}
          </button>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 px-3 py-2 rounded-lg border border-zinc-200 transition-colors"
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
