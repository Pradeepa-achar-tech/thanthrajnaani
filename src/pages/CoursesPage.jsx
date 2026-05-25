import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock, Check, Languages } from 'lucide-react'
import { courses } from '../data/courses.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useStudyList } from '../contexts/StudyListContext.jsx'
import Reveal from '../components/Reveal.jsx'

export default function CoursesPage() {
  const { user } = useAuth()
  const { isEnrolled } = useStudyList()

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-20">
      <div className="max-w-3xl mb-10 md:mb-12">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-accent-600" />
          <span className="eyebrow text-accent-600">Courses</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-4">
          Pick a course. Add it to your study list. Start learning.
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          All courses are free. Sign in with Google to add a course to your study list and unlock the
          lessons — your progress syncs automatically across devices.
        </p>
      </div>

      {/* Bilingual callout */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center">
          <Languages className="w-5 h-5 text-accent-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-zinc-900 mb-1">
            Learn in your language · ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಕಲಿಯಿರಿ
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Every lesson is available in <span className="font-medium text-zinc-900">English</span>{' '}
            and <span className="font-medium text-zinc-900">ಕನ್ನಡ</span>. Inside any course, use the
            language switcher in the top bar — your progress is preserved.
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-0.5 text-xs font-semibold select-none">
          <span className="px-2.5 py-1 rounded-md text-zinc-400">EN</span>
          <span className="px-2.5 py-1 rounded-md bg-accent-500 text-white">ಕನ್ನಡ</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {courses.map((c, i) => (
          <Reveal key={c.id} delay={i * 80}>
            <CourseCard course={c} signedIn={Boolean(user)} enrolled={isEnrolled(c.id)} />
          </Reveal>
        ))}
      </div>
    </div>
  )
}

function CourseCard({ course, signedIn, enrolled }) {
  const Icon = course.icon
  return (
    <Link to={`/courses/${course.id}`} className="card card-hover group p-6 md:p-7 h-full flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors group-hover:bg-accent-50 group-hover:text-accent-600">
          <Icon className="w-6 h-6" />
        </div>
        {signedIn && enrolled && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-900 text-white">
            <Check className="w-3 h-3" />
            In study list
          </span>
        )}
        {signedIn && !enrolled && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border border-zinc-200 text-zinc-500">
            Not added
          </span>
        )}
      </div>

      <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 mb-2 leading-tight">
        {course.title}
      </h3>
      <p className="text-sm font-medium text-accent-600 mb-3">{course.tagline}</p>
      <p className="text-sm text-zinc-600 leading-relaxed mb-5">{course.description}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 mb-5">
        <span className="inline-flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          {course.modulesCount} modules
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          ~{course.durationHours}h
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Languages className="w-3.5 h-3.5" />
          EN · ಕನ್ನಡ
        </span>
        <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">{course.level}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {course.skills.map((s) => (
          <span key={s} className="px-2 py-0.5 rounded-md text-[11px] border border-zinc-200 text-zinc-600">
            {s}
          </span>
        ))}
      </div>

      <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900">
        View course
        <ArrowRight className="w-4 h-4 text-accent-600 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  )
}
