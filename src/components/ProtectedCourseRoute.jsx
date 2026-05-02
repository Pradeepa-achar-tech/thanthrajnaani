import { Navigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useStudyList } from '../contexts/StudyListContext.jsx'
import { courseById } from '../data/courses.js'

// Gates the course "player" routes. The user must be:
//  1) signed in, and
//  2) enrolled in the specific course (i.e., it's in their study list).
// If either check fails, bounce back to the course detail page where the
// appropriate CTA (sign in / add to study list) is shown. Note that we wait
// for the StudyListContext to be `ready` before deciding — otherwise the user
// gets bounced before Firestore has had a chance to confirm their enrollment.
export default function ProtectedCourseRoute({ children }) {
  const { courseId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const { ready: listReady, isEnrolled } = useStudyList()

  const course = courseById(courseId)
  if (!course) return <Navigate to="/courses" replace />

  if (authLoading || (user && !listReady)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to={`/courses/${courseId}`} replace />
  if (!isEnrolled(courseId)) return <Navigate to={`/courses/${courseId}`} replace />

  return children
}
