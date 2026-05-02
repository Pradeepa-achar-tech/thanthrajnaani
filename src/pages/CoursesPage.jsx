import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock, BookmarkCheck, Bookmark, Languages } from 'lucide-react'
import { courses } from '../data/courses.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useStudyList } from '../contexts/StudyListContext.jsx'

export default function CoursesPage() {
  const { user } = useAuth()
  const { isEnrolled } = useStudyList()

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-accent-400" />
          <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">
            Courses
          </h2>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
          Pick a course. Add it to your study list. Start learning.
        </h1>
        <p className="text-slate-400 max-w-2xl mb-5">
          All courses are free. Sign in with Google to add a course to your study list and unlock
          the lessons. Your progress syncs automatically across devices.
        </p>

        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
            <Languages className="w-6 h-6 text-emerald-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-emerald-100 mb-1">
              Learn in your language · ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಕಲಿಯಿರಿ
            </h3>
            <p className="text-sm text-emerald-200/80 leading-relaxed">
              Every lesson is available in <span className="font-semibold text-white">English</span> and{' '}
              <span className="font-semibold text-white">ಕನ್ನಡ</span>. Inside any course, hit the
              language switcher in the top bar — your progress is preserved.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-0.5 rounded-lg border border-emerald-500/40 bg-slate-950/60 p-0.5 text-xs font-semibold select-none">
            <span className="px-2.5 py-1 rounded-md text-slate-400">EN</span>
            <span className="px-2.5 py-1 rounded-md bg-accent-500 text-white shadow-[0_0_20px_-6px_rgba(249,115,22,0.6)]">
              ಕನ್ನಡ
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {courses.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            signedIn={Boolean(user)}
            enrolled={isEnrolled(c.id)}
          />
        ))}
      </div>
    </div>
  )
}

function CourseCard({ course, signedIn, enrolled }) {
  const Icon = course.icon
  return (
    <Link
      to={`/courses/${course.id}`}
      className={`group relative rounded-2xl overflow-hidden border ${course.accentBorder} bg-gradient-to-br ${course.accent} hover:-translate-y-0.5 transition-all`}
    >
      <div className="absolute inset-0 bg-slate-950/60" />

      <div className="relative p-6 md:p-7">
        <div className="flex items-start justify-between mb-5">
          <div className={`w-12 h-12 rounded-xl border ${course.accentBorder} bg-slate-950/60 flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${course.accentText}`} />
          </div>
          {signedIn && enrolled && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              <BookmarkCheck className="w-3 h-3" />
              In study list
            </span>
          )}
          {signedIn && !enrolled && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-wider bg-slate-800/80 border border-slate-700 text-slate-400">
              <Bookmark className="w-3 h-3" />
              Not added
            </span>
          )}
        </div>

        <h3 className="text-2xl md:text-[28px] font-bold mb-2 leading-tight">{course.title}</h3>
        <p className={`text-sm font-medium mb-3 ${course.accentText}`}>{course.tagline}</p>
        <p className="text-sm text-slate-400 leading-relaxed mb-5">{course.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-5">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {course.modulesCount} modules
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            ~{course.durationHours}h
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700">
            {course.level}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <Languages className="w-3 h-3" />
            EN · ಕನ್ನಡ
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {course.skills.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800/60 border border-slate-700 text-slate-300"
            >
              {s}
            </span>
          ))}
        </div>

        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-100">
          View course
          <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  )
}
