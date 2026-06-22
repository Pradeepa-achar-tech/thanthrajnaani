import { Link, Navigate } from 'react-router-dom'
import { ArrowRight, BookmarkCheck, BookOpen, Clock, Loader2, Trash2 } from 'lucide-react'
import { courses } from '../data/courses.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useStudyList } from '../contexts/StudyListContext.jsx'
import { useState } from 'react'

export default function MyLearningPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, loading, unenroll } = useStudyList()
  const [removing, setRemoving] = useState(null)

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-20 flex items-center justify-center text-zinc-400">
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
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-20">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <BookmarkCheck className="w-4 h-4 text-accent-600" />
          <span className="eyebrow text-accent-600">My Study List</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-2">
          {enrolledList.length > 0
            ? `${enrolledList.length} course${enrolledList.length > 1 ? 's' : ''} on your plate.`
            : 'Your study list is empty.'}
        </h1>
        <p className="text-lg text-zinc-600">
          {enrolledList.length > 0
            ? 'Keep going. Pick up where you left off.'
            : 'Browse courses and add the ones you want to study.'}
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : enrolledList.length === 0 ? (
        <Link to="/courses" className="pf-btn-primary px-5 py-3 text-sm">
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
              <div key={c.id} className="pf-card p-5 flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold tracking-tight text-zinc-900 leading-tight">{c.title}</h2>
                    <p className="text-xs text-accent-600">{c.tagline}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(c.id)}
                    disabled={removing === c.id}
                    title="Remove from study list"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition-colors"
                  >
                    {removing === c.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mb-4">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {c.modulesCount} modules
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    ~{c.durationHours}h
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-zinc-400">{started ? 'Started' : 'Not started'}</span>
                  <Link to={c.routePlay} className="pf-btn-primary px-4 py-2 text-sm">
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
