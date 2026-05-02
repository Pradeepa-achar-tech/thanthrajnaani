import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Player crash:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-6">
          <div className="max-w-xl w-full rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-300" />
              <h2 className="font-semibold text-rose-200">Course failed to load</h2>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Something threw while rendering the course. Open the browser console for the full stack trace.
            </p>
            <pre className="text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-3 overflow-auto whitespace-pre-wrap text-rose-200">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <button
              onClick={() => {
                this.setState({ error: null })
                window.location.href = '/courses'
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-medium hover:bg-slate-100"
            >
              Back to courses
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
