import { useMemo, useState } from 'react'
import { CheckCircle2, RotateCw, XCircle, Trophy } from 'lucide-react'
import { useUiText } from '../utils/uiText.js'

export default function QuizPanel({ moduleId, questions, savedResult, onSubmit }) {
  const L = useUiText()
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(() => {
    if (!submitted) return 0
    return questions.reduce(
      (acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0),
      0
    )
  }, [submitted, answers, questions])

  const handleSelect = (qId, optIdx) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
    const computed = questions.reduce(
      (acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0),
      0
    )
    onSubmit?.(moduleId, computed, questions.length)
  }

  const handleReset = () => {
    setAnswers({})
    setSubmitted(false)
  }

  const allAnswered = questions.every((q) => answers[q.id] !== undefined)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent-600" />
            {L.moduleQuiz}
          </h3>
          <p className="text-sm text-zinc-600 mt-1">
            {questions.length} questions • {L.pickBestAnswer}
          </p>
        </div>
        {savedResult && !submitted && (
          <div className="text-sm text-zinc-500">
            {L.lastAttempt}:{' '}
            <span className="text-zinc-900 font-semibold">
              {savedResult.score} / {savedResult.total}
            </span>
          </div>
        )}
      </div>

      <ol className="space-y-4">
        {questions.map((q, idx) => (
          <li key={q.id} className="card p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent-50 text-accent-700 text-sm font-semibold flex items-center justify-center">
                {idx + 1}
              </span>
              <p className="text-zinc-900 font-medium leading-relaxed">{q.q}</p>
            </div>
            <div className="space-y-2 pl-10">
              {q.options.map((opt, optIdx) => {
                const selected = answers[q.id] === optIdx
                const correct = q.answer === optIdx
                let stateClass =
                  'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-700'

                if (submitted) {
                  if (correct) {
                    stateClass = 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  } else if (selected && !correct) {
                    stateClass = 'border-rose-300 bg-rose-50 text-rose-900'
                  } else {
                    stateClass = 'border-zinc-200 bg-zinc-50 text-zinc-500'
                  }
                } else if (selected) {
                  stateClass = 'border-accent-500 bg-accent-50 text-zinc-900'
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(q.id, optIdx)}
                    disabled={submitted}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${stateClass} disabled:cursor-not-allowed`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {submitted && correct && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      {submitted && selected && !correct && (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                      {opt}
                    </span>
                  </button>
                )
              })}
            </div>
          </li>
        ))}
      </ol>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {L.submitAnswers}
        </button>
      ) : (
        <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-zinc-900">
              {score} <span className="text-zinc-400 text-lg font-normal">/ {questions.length}</span>
            </p>
            <p className="text-sm text-zinc-600">
              {score === questions.length
                ? L.perfectScore
                : score >= Math.ceil(questions.length * 0.7)
                ? L.solidScore
                : L.reviewScore}
            </p>
          </div>
          <button onClick={handleReset} className="btn-ghost border border-zinc-200">
            <RotateCw className="w-4 h-4 inline mr-1.5" />
            {L.retake}
          </button>
        </div>
      )}
    </div>
  )
}
