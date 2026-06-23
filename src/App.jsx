import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import HomePage from './pages/HomePage.jsx'
import CoursesPage from './pages/CoursesPage.jsx'
import CourseDetailPage from './pages/CourseDetailPage.jsx'
import MyLearningPage from './pages/MyLearningPage.jsx'
import ProtectedCourseRoute from './components/ProtectedCourseRoute.jsx'
import { useStudyList } from './contexts/StudyListContext.jsx'

// Each course is shipped with its own LanguageProvider in the original app.
// We bundle the provider with the player here so the child components
// (LanguageSwitcher, useUiText) get a real context to read from.
const FlutterPlayer = lazy(async () => {
  const [App, Lang] = await Promise.all([
    import('./features/flutter/App.jsx'),
    import('./features/flutter/contexts/LanguageContext.jsx'),
  ])
  const Wrapped = () => (
    <Lang.LanguageProvider>
      <App.default />
    </Lang.LanguageProvider>
  )
  return { default: Wrapped }
})

const GenAIPlayer = lazy(async () => {
  const [App, Lang] = await Promise.all([
    import('./features/genai/App.jsx'),
    import('./features/genai/contexts/LanguageContext.jsx'),
  ])
  const Wrapped = () => (
    <Lang.LanguageProvider>
      <App.default />
    </Lang.LanguageProvider>
  )
  return { default: Wrapped }
})

const BillingPlayer = lazy(async () => {
  const [App, Lang] = await Promise.all([
    import('./features/billing/App.jsx'),
    import('./features/billing/contexts/LanguageContext.jsx'),
  ])
  const Wrapped = () => (
    <Lang.LanguageProvider>
      <App.default />
    </Lang.LanguageProvider>
  )
  return { default: Wrapped }
})

const ResortPlayer = lazy(async () => {
  const [App, Lang] = await Promise.all([
    import('./features/resort/App.jsx'),
    import('./features/resort/contexts/LanguageContext.jsx'),
  ])
  const Wrapped = () => (
    <Lang.LanguageProvider>
      <App.default />
    </Lang.LanguageProvider>
  )
  return { default: Wrapped }
})

const TemplePlayer = lazy(async () => {
  const [App, Lang] = await Promise.all([
    import('./features/temple/App.jsx'),
    import('./features/temple/contexts/LanguageContext.jsx'),
  ])
  const Wrapped = () => (
    <Lang.LanguageProvider>
      <App.default />
    </Lang.LanguageProvider>
  )
  return { default: Wrapped }
})

function CoursePlayerSwitch() {
  const { courseId } = useParams()
  if (courseId === 'flutter') return <FlutterPlayer />
  if (courseId === 'genai') return <GenAIPlayer />
  if (courseId === 'billing') return <BillingPlayer />
  if (courseId === 'resort') return <ResortPlayer />
  if (courseId === 'temple') return <TemplePlayer />
  return <Navigate to="/courses" replace />
}

function PlayerShell({ children }) {
  const { courseId } = useParams()
  const { markAccessed } = useStudyList()

  useEffect(() => {
    if (courseId) markAccessed(courseId)
  }, [courseId, markAccessed])

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent-400" />
            <p className="text-sm text-slate-400">Loading course…</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const isPlayer = /^\/courses\/[^/]+\/learn$/.test(pathname)

  return (
    <div className={`min-h-screen flex flex-col ${isPlayer ? 'bg-slate-950 text-slate-100' : 'bg-white text-zinc-900'}`}>
      <ScrollToTop />
      {!isPlayer && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route
            path="/courses/:courseId/learn"
            element={
              <ProtectedCourseRoute>
                <ErrorBoundary>
                  <PlayerShell>
                    <CoursePlayerSwitch />
                  </PlayerShell>
                </ErrorBoundary>
              </ProtectedCourseRoute>
            }
          />
          <Route path="/my-learning" element={<MyLearningPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {!isPlayer && <Footer />}
    </div>
  )
}
