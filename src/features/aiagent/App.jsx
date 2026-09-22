import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Menu } from 'lucide-react'
import './index.css'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ModulePage from './components/ModulePage.jsx'
import SearchBar from './components/SearchBar.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import { curriculum } from './data/curriculum.js'
import useProgress from './hooks/useProgress.js'
import { useUiText } from './utils/uiText.js'

export default function App() {
  const L = useUiText()
  const progress = useProgress()

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

  const activeModule =
    view === 'module' ? curriculum.modules.find((m) => m.id === activeModuleId) : null

  const overall = progress.overallProgress(curriculum.modules)

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar
        activeView={view}
        activeModuleId={activeModuleId}
        moduleProgress={progress.moduleProgress}
        overallPct={overall.pct}
        onSelect={handleSidebarSelect}
        onReset={handleReset}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-zinc-200">
          <div className="flex items-center gap-3 px-4 md:px-8 h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/courses/aiagent"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
              title="Back to course"
              aria-label="Back to course"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Back to course</span>
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
              onBack={goDashboard}
              jumpTopicId={jumpTopicId}
              onJumpHandled={() => setJumpTopicId(null)}
            />
          )}
        </main>

        <footer className="px-4 md:px-8 py-4 border-t border-zinc-200 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Build with ❤️ in Kundapura</span>
          <span>AI Agent Visual Lab by Thanthrajnaani</span>
        </footer>
      </div>
    </div>
  )
}
