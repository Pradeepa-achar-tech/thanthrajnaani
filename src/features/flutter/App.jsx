import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Menu } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ModulePage from './components/ModulePage.jsx'
import SearchBar from './components/SearchBar.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import { curriculum } from './data/curriculum.js'
import useProgress from './hooks/useProgress.js'
import { useUiText } from './utils/uiText.js'
import { useAuth } from './contexts/AuthContext.jsx'

export default function App() {
  const L = useUiText()
  const navigate = useNavigate()
  const { user, loading: authLoading, signOut } = useAuth()
  const progress = useProgress(user?.uid)

  const [view, setView] = useState('dashboard')
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [jumpTopicId, setJumpTopicId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    if (window.confirm(L.resetConfirm)) progress.reset()
  }

  const handleExport = () => {
    const data = progress.exportState()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const stamp = new Date().toISOString().slice(0, 10)
    const a = document.createElement('a')
    a.href = url
    a.download = `flutter-dart-progress-${stamp}.json`
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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          {L.loadingAuth}
        </div>
      </div>
    )
  }

  const sidebarUser = {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch {
      // ignore — auth state listener will reflect any change
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar
        user={sidebarUser}
        activeView={view}
        activeModuleId={activeModuleId}
        moduleProgress={progress.moduleProgress}
        overallPct={overall.pct}
        onSelect={handleSidebarSelect}
        onReset={handleReset}
        onExport={handleExport}
        onImport={handleImport}
        onSignOut={handleSignOut}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur border-b border-slate-800">
          <div className="flex items-center gap-3 px-4 md:px-8 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/courses/flutter"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md border border-slate-800 hover:border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to course
            </Link>
            <div className="flex-1 flex justify-end md:justify-start">
              <SearchBar onJump={(mid, tid) => goModule(mid, tid)} />
            </div>
            <LanguageSwitcher />
          </div>
        </header>

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
          {L.footerCredit ? (
            <span>{L.footerCredit}</span>
          ) : (
            <span className="flex items-center gap-1.5">
              {L.builtWith}{' '}
              <span aria-label="love" className="text-rose-500">{'❤️'}</span>{' '}
              by{' '}
              <span className="font-extrabold italic tracking-wide bg-gradient-to-r from-accent-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                Thanthrajnaani
              </span>{' '}
              {L.inKundapura}
            </span>
          )}
        </footer>
      </div>
    </div>
  )
}
