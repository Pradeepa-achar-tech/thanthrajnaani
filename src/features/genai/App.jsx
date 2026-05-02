import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Menu } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ModulePage from './components/ModulePage.jsx'
import SearchBar from './components/SearchBar.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import { curriculum } from './data/curriculum.js'
import useProgress from './hooks/useProgress.js'
import useFirestoreSync from './hooks/useFirestoreSync.js'
import { useAuth } from './contexts/AuthContext.jsx'
import { useUiText } from './utils/uiText.js'

export default function App() {
  const { user, loading: authLoading, signOutUser } = useAuth()
  const L = useUiText()
  const progress = useProgress()
  const { cloudProgress, loadingCloud, syncProgress } = useFirestoreSync(user)

  const [view, setView] = useState('dashboard')
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [jumpTopicId, setJumpTopicId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Track whether we've loaded cloud state into local progress yet
  const cloudLoaded = useRef(false)

  // When user logs out, reset the flag
  useEffect(() => {
    if (!user) cloudLoaded.current = false
  }, [user])

  // Load cloud progress into local state once (Firestore is authoritative)
  useEffect(() => {
    if (cloudProgress && !cloudLoaded.current) {
      cloudLoaded.current = true
      progress.importState(cloudProgress)
    }
  }, [cloudProgress])

  // Sync any local progress changes back to Firestore (debounced)
  useEffect(() => {
    if (!user || !cloudLoaded.current) return
    syncProgress(progress.state)
  }, [progress.state, user])

  // Reset scroll on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [view, activeModuleId])

  const goDashboard = () => {
    setView('dashboard')
    setActiveModuleId(null)
    setSidebarOpen(false)
  }

  const goModule = (moduleId, topicId = null) => {
    setActiveModuleId(moduleId)
    setView('module')
    setJumpTopicId(topicId)
    setSidebarOpen(false)
  }

  const handleSidebarSelect = (which, moduleId) => {
    if (which === 'dashboard') goDashboard()
    else if (which === 'module') goModule(moduleId)
  }

  const handleReset = () => {
    if (
      window.confirm(
        L.resetConfirm
      )
    ) {
      progress.reset()
    }
  }

  const handleExport = () => {
    const data = progress.exportState()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const stamp = new Date().toISOString().slice(0, 10)
    const a = document.createElement('a')
    a.href = url
    a.download = `genai-ml-progress-${stamp}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (!window.confirm(L.importConfirm)) return
        progress.importState(data)
      } catch (err) {
        window.alert(L.importError + (err?.message || L.invalidJson))
      }
    }
    reader.readAsText(file)
  }

  const activeModule =
    view === 'module' ? curriculum.modules.find((m) => m.id === activeModuleId) : null

  const overall = progress.overallProgress(curriculum.modules)

  // ── Auth / not-signed-in fallback (parent route already gates) ──
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-slate-800 border-t-accent-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">{L.loading}</p>
        </div>
      </div>
    )
  }

  // ── Cloud progress loading splash ──
  if (loadingCloud) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-slate-800 border-t-accent-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">{L.syncingProgress}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar
        user={user}
        activeView={view}
        activeModuleId={activeModuleId}
        moduleProgress={progress.moduleProgress}
        overallPct={overall.pct}
        onSelect={handleSidebarSelect}
        onReset={handleReset}
        onExport={handleExport}
        onImport={handleImport}
        onSignOut={signOutUser}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur border-b border-slate-800">
          <div className="flex items-center gap-3 px-4 md:px-8 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/courses/genai"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md border border-slate-800 hover:border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to course
            </Link>
            <div className="flex-1 flex justify-end md:justify-start">
              <SearchBar onJump={(mid, tid) => goModule(mid, tid)} />
            </div>
            {/* Language switcher */}
            <LanguageSwitcher />
            {/* User avatar (desktop) */}
            <div className="hidden md:flex items-center gap-2 ml-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border border-slate-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-xs font-bold text-accent-400">
                  {user.displayName?.[0] ?? user.email?.[0]}
                </div>
              )}
              <span className="text-sm text-slate-300 max-w-[140px] truncate">
                {user.displayName ?? user.email}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-6xl w-full mx-auto">
          {view === 'dashboard' && (
            <Dashboard
              moduleProgress={progress.moduleProgress}
              overall={overall}
              onOpenModule={(id) => goModule(id)}
            />
          )}
          {view === 'module' && activeModule && (
            <ModulePage
              module={activeModule}
              isTopicDone={progress.isTopicDone}
              toggleTopic={progress.toggleTopic}
              moduleProgress={progress.moduleProgress}
              getNote={progress.getNote}
              setNote={progress.setNote}
              getQuizResult={progress.getQuizResult}
              setQuizResult={progress.setQuizResult}
              onBack={goDashboard}
              jumpTopicId={jumpTopicId}
              onJumpHandled={() => setJumpTopicId(null)}
            />
          )}
        </main>

        <footer className="px-4 md:px-8 py-4 border-t border-slate-900 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{L.footerSync}</span>
          <span className="flex items-center gap-1.5">
            {L.builtWith} <span aria-label="love" className="text-rose-500">❤️</span> by{' '}
            <span className="font-extrabold italic tracking-wide bg-gradient-to-r from-accent-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              Thanthrajnaani
            </span>{' '}
            {L.inKundapura}
          </span>
        </footer>
      </div>
    </div>
  )
}
