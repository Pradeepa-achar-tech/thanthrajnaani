import { ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { courses } from '../data/courses.js'

export default function CoursesSection() {
  const latestCourses = courses.slice(0, 3)

  return (
    <section className="border-t border-zinc-200 bg-zinc-50/40">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-14">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-8 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-2">
              Project-based courses
            </h2>
            <p className="text-sm md:text-base text-zinc-600 max-w-2xl">
              Real-world engineering turned into practical, hands-on courses.
            </p>
          </div>

          <Link
            to="/courses"
            className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-zinc-900 bg-zinc-100 rounded-lg hover:bg-accent-100 hover:text-accent-600 transition-all duration-300 hover:shadow-sm hover:-translate-y-1 flex-shrink-0"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {latestCourses.map((course) => {
            const titleShort = course.title.replace(/^Week \d+ — /, '').replace(/^Module \d+ — /, '')
            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}/learn`}
                className="group relative p-5 rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-accent-50/20 flex flex-col shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div className="w-9 h-9 rounded-lg bg-accent-100 text-accent-600 flex items-center justify-center mb-3 group-hover:bg-accent-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  <BookOpen className="w-4 h-4" />
                </div>

                <h3 className="text-base font-semibold text-zinc-900 mb-1.5 group-hover:text-accent-600 transition-colors line-clamp-2">{titleShort}</h3>

                <p className="text-xs text-zinc-600 leading-relaxed mb-4 flex-1">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-zinc-100">
                  <span>{course.modules?.length || 0} modules</span>
                  <span>{course.hours || 0}h</span>
                </div>

                <span className="text-xs font-medium inline-flex items-center gap-1 text-zinc-900 mt-3 group-hover:text-accent-600 transition-colors">
                  Start
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            )
          })}
        </div>

        {/* Languages */}
        <div className="text-xs text-zinc-600">
          Available in <span className="font-medium text-zinc-900">English</span> & <span className="font-medium text-zinc-900">ಕನ್ನಡ</span>
        </div>
      </div>
    </section>
  )
}
