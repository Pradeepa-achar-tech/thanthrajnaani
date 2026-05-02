import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookmarkPlus,
  BookmarkCheck,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Languages,
  Layers,
  Loader2,
  LogIn,
  Play,
  Rocket,
} from 'lucide-react'
import { courseById } from '../data/courses.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useStudyList } from '../contexts/StudyListContext.jsx'

const curriculumLoaders = {
  flutter: () => import('../features/flutter/data/curriculum.js'),
  genai: () => import('../features/genai/data/curriculum.js'),
}

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const course = courseById(courseId)
  const navigate = useNavigate()
  const { user, signInWithGoogle, loading: authLoading } = useAuth()
  const { items, ready: listReady, isEnrolled, enroll, markStarted } = useStudyList()
  const [curriculum, setCurriculum] = useState(null)

  useEffect(() => {
    if (!course) return
    const load = curriculumLoaders[course.id]
    if (!load) return
    let cancelled = false
    load().then((mod) => {
      if (!cancelled) setCurriculum(mod.curriculum)
    }).catch((e) => console.warn('curriculum load failed:', e))
    return () => {
      cancelled = true
    }
  }, [course?.id])
  const [busy, setBusy] = useState(false)

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-3">Course not found</h1>
        <p className="text-slate-400 mb-6">We couldn't find a course with that ID.</p>
        <Link to="/courses" className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>
      </div>
    )
  }

  const Icon = course.icon
  const enrolled = isEnrolled(course.id)
  const started = enrolled && Boolean(items[course.id]?.started)

  const handleSignIn = async () => {
    setBusy(true)
    try {
      await signInWithGoogle()
    } finally {
      setBusy(false)
    }
  }

  const handleEnroll = async () => {
    setBusy(true)
    try {
      await enroll(course.id)
    } catch (e) {
      console.warn('enroll failed:', e)
    } finally {
      setBusy(false)
    }
  }

  const handleStart = () => {
    if (!started) {
      markStarted(course.id).catch((e) => console.warn('markStarted failed:', e))
    }
    navigate(course.routePlay)
  }

  const renderCta = () => {
    if (authLoading || (user && !listReady)) {
      return (
        <button
          disabled
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 text-slate-400 text-sm font-medium"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading…
        </button>
      )
    }

    if (!user) {
      return (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
            <span className="font-semibold">Sign in to access this course.</span>{' '}
            <span className="text-amber-200/80">
              Once signed in, add it to your study list to unlock the lessons.
            </span>
          </div>
          <button
            onClick={handleSignIn}
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            Sign in with Google
          </button>
        </div>
      )
    }

    if (!enrolled) {
      return (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
            <span className="font-semibold text-slate-100">You're signed in.</span>{' '}
            <span className="text-slate-400">
              Add this course to your study list to start learning. You can drop it any time.
            </span>
          </div>
          <button
            onClick={handleEnroll}
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent-500 text-white font-medium hover:bg-accent-400 disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
            Add to My Study List
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-200 flex items-start gap-2">
          <BookmarkCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <span className="font-semibold">In your study list.</span>{' '}
            {started ? 'Pick up where you left off.' : 'Ready when you are.'}
          </span>
        </div>
        <button
          onClick={handleStart}
          disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : started ? (
            <Play className="w-4 h-4" />
          ) : (
            <Rocket className="w-4 h-4" />
          )}
          {started ? 'Resume course' : 'Start course'}
          <ArrowRight className="w-4 h-4 opacity-70" />
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to courses
      </Link>

      <div className={`rounded-3xl border ${course.accentBorder} bg-gradient-to-br ${course.accent} relative overflow-hidden mb-8`}>
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="relative p-6 md:p-10 grid md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-start">
          <div className={`w-16 h-16 rounded-2xl border ${course.accentBorder} bg-slate-950/60 flex items-center justify-center`}>
            <Icon className={`w-8 h-8 ${course.accentText}`} />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-3">
              {course.title}
            </h1>
            <p className={`text-base md:text-lg font-medium mb-4 ${course.accentText}`}>
              {course.tagline}
            </p>
            <p className="text-slate-300 leading-relaxed mb-5 max-w-2xl">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {course.modulesCount} modules
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                ~{course.durationHours}h
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700">
                {course.level}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                <Languages className="w-3.5 h-3.5" />
                English · ಕನ್ನಡ
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3">What you'll learn</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {course.skills.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-300" />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </section>

          <CurriculumPreview curriculum={curriculum} accent={course.accentText} />


          {!user && (
            <section>
              <h2 className="text-xl font-bold mb-3">How it works</h2>
              <ol className="space-y-3 text-sm text-slate-300 leading-relaxed">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-xs flex items-center justify-center flex-shrink-0">1</span>
                  Sign in with Google. (Used only to save your progress.)
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-xs flex items-center justify-center flex-shrink-0">2</span>
                  Add the course to <span className="text-slate-100 font-medium">My Study List</span> to unlock the lessons.
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-xs flex items-center justify-center flex-shrink-0">3</span>
                  Hit <span className="text-slate-100 font-medium">Start course</span> and learn at your own pace. Notes, quizzes, and progress sync automatically.
                </li>
              </ol>
            </section>
          )}
        </div>

        <aside className="md:col-span-1">
          <div className="md:sticky md:top-20">
            {renderCta()}
          </div>
        </aside>
      </div>
    </div>
  )
}

function CurriculumPreview({ curriculum, accent }) {
  const [openId, setOpenId] = useState(null)

  if (!curriculum) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-3">Course curriculum</h2>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading curriculum…
        </div>
      </section>
    )
  }

  const totalSections = curriculum.modules.reduce((s, m) => s + (m.sections?.length || 0), 0)
  const totalTopics = curriculum.modules.reduce(
    (s, m) => s + (m.sections || []).reduce((t, sec) => t + (sec.topics?.length || 0), 0),
    0
  )

  const toggle = (id) => setOpenId((curr) => (curr === id ? null : id))

  return (
    <section>
      <div className="flex items-end justify-between flex-wrap gap-2 mb-3">
        <h2 className="text-xl font-bold">Course curriculum</h2>
        <span className="text-xs text-slate-500">
          {curriculum.modules.length} modules · {totalSections} sections · {totalTopics} topics
        </span>
      </div>

      <div className="space-y-2">
        {curriculum.modules.map((m, i) => {
          const sectionCount = m.sections?.length || 0
          const topicCount = (m.sections || []).reduce(
            (s, sec) => s + (sec.topics?.length || 0),
            0
          )
          const isOpen = openId === m.id
          return (
            <div
              key={m.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden"
            >
              <button
                onClick={() => toggle(m.id)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-900/70 transition-colors"
              >
                <span className={`mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold flex items-center justify-center ${accent || 'text-slate-300'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-slate-100 leading-snug">{m.title}</h3>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-2">
                    {m.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    {m.hours && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{m.hours}h
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {sectionCount} section{sectionCount === 1 ? '' : 's'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {topicCount} topic{topicCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </button>

              {isOpen && sectionCount > 0 && (
                <div className="border-t border-slate-800 bg-slate-950/40 p-4 space-y-3">
                  {m.sections.map((sec) => (
                    <div key={sec.id}>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        {sec.title}
                      </div>
                      <ul className="space-y-1">
                        {(sec.topics || []).map((t) => (
                          <li
                            key={t.id}
                            className="flex items-start gap-2 text-sm text-slate-300 leading-snug"
                          >
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-600 flex-shrink-0" />
                            {t.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

