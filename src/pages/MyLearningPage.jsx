import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, BookmarkCheck, BookOpen, Clock, Loader2, Trash2 } from 'lucide-react'
import { courses, courseById } from '../data/courses.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useStudyList } from '../contexts/StudyListContext.jsx'
import { useState } from 'react'

export default function MyLearningPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, loading, unenroll } = useStudyList()
  const [removing, setRemoving] = useState(null)

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-20 flex items-center justify-center text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/courses" replace />

  const enrolledList = courses.filter((c) => items[c.id])

  const handleRemove = async (courseId) => {
    setRemoving(courseId)
    try {
      await unenroll(courseId)
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <BookmarkCheck className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">
            My Study List
          </h2>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
          {enrolledList.length > 0
            ? `${enrolledList.length} course${enrolledList.length > 1 ? 's' : ''} on your plate.`
            : 'Your study list is empty.'}
        </h1>
        <p className="text-slate-400">
          {enrolledList.length > 0
            ? 'Keep going. Pick up where you left off.'
            : 'Browse courses and add the ones you want to study.'}
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : enrolledList.length === 0 ? (
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100"
        >
          Browse courses
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {enrolledList.map((c) => {
            const item = items[c.id]
            const Icon = c.icon
            const started = Boolean(item?.started)
            return (
              <div
                key={c.id}
                className={`rounded-2xl border ${c.accentBorder} bg-slate-900/40 backdrop-blur p-5 flex flex-col`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl border ${c.accentBorder} bg-slate-950/60 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.accentText}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold leading-tight">{c.title}</h3>
                    <p className={`text-xs ${c.accentText}`}>{c.tagline}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(c.id)}
                    disabled={removing === c.id}
                    title="Remove from study list"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
                  >
                    {removing === c.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {c.modulesCount} modules
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    ~{c.durationHours}h
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    {started ? 'Started' : 'Not started'}
                  </span>
                  <Link
                    to={c.routePlay}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-slate-900 text-sm font-medium hover:bg-slate-100"
                  >
                    {started ? 'Resume' : 'Start'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
