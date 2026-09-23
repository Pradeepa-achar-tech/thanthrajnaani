import { ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { courses } from '../data/courses.js'

export default function CoursesSection() {
  const latestCourses = courses.slice(0, 3)

  return (
    <section className="border-t border-zinc-200 bg-zinc-50/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-accent-600" />
              <span className="eyebrow text-accent-600">Learn by Building</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
              Project-based courses
            </h2>
            <p className="text-lg text-zinc-600 mt-4 max-w-2xl">
              Real-world engineering experience turned into practical courses designed to help you build rather than just watch.
            </p>
          </div>

          <Link
            to="/courses"
            className="pf-btn-secondary group px-6 py-3 text-base flex-shrink-0 w-full md:w-auto justify-center"
          >
            <span>View all courses</span>
            <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {latestCourses.map((course) => {
            const titleShort = course.title.replace(/^Week \d+ — /, '').replace(/^Module \d+ — /, '')
            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}/learn`}
                className="group relative p-6 rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-accent-50/20 flex flex-col shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-100 text-accent-600 flex items-center justify-center mb-5 group-hover:bg-accent-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  <BookOpen className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-semibold text-zinc-900 mb-2 group-hover:text-accent-600 transition-colors">{titleShort}</h3>

                <p className="text-sm text-zinc-600 leading-relaxed mb-5 flex-1">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-zinc-100">
                  <span>{course.modules?.length || 0} modules</span>
                  <span>{course.hours || 0}h</span>
                </div>

                <span className="text-sm font-medium inline-flex items-center gap-1.5 text-zinc-900 mt-4 group-hover:text-accent-600 transition-colors">
                  Start learning
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            )
          })}
        </div>

        {/* Languages */}
        <div className="mt-12 pt-8 border-t border-zinc-200">
          <p className="text-sm text-zinc-600">
            Available in <span className="font-semibold text-zinc-900">English</span> and{' '}
            <span className="font-semibold text-zinc-900">ಕನ್ನಡ</span> — learn in the language you think in.
          </p>
        </div>
      </div>
    </section>
  )
}
