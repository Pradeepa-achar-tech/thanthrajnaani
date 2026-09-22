import { useState } from 'react'
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react'

export default function QuizPanel({ module, onSaveResult }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  // Mock quiz questions for demo
  const questions = [
    {
      id: 'q1',
      question: 'What is the main learning objective of this module?',
      options: [
        module.description,
        'Something else',
        'Another option',
        'Yet another',
      ],
      correct: 0,
    },
    {
      id: 'q2',
      question: 'How many hours does this module take?',
      options: [
        `${module.hours} hours`,
        `${module.hours + 5} hours`,
        `${module.hours - 5} hours`,
        'Depends on skill level',
      ],
      correct: 0,
    },
  ]

  const handleAnswer = (index) => {
    if (!submitted) {
      setUserAnswers({ ...userAnswers, [currentQuestion]: index })
    }
  }

  const handleSubmit = () => {
    setSubmitted(true)
    const score = Object.values(userAnswers).filter(
      (ans, idx) => ans === questions[idx]?.correct
    ).length
    onSaveResult?.(module.id, score, questions.length)
  }

  const handleReset = () => {
    setCurrentQuestion(0)
    setUserAnswers({})
    setSubmitted(false)
  }

  const q = questions[currentQuestion]
  const userAnswer = userAnswers[currentQuestion]
  const isCorrect = userAnswer === q.correct

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-zinc-900">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            {submitted && (
              <span className="text-sm font-medium text-zinc-600">
                Score:{' '}
                <span className="text-accent-600">
                  {Object.values(userAnswers).filter(
                    (ans, idx) => ans === questions[idx]?.correct
                  ).length}/{questions.length}
                </span>
              </span>
            )}
          </div>
          <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">{q.question}</h3>

          <div className="space-y-2">
            {q.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={submitted}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  userAnswer === idx
                    ? submitted
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-accent-500 bg-accent-50'
                    : submitted && idx === q.correct
                      ? 'border-green-500 bg-green-50'
                      : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {submitted && idx === q.correct && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {submitted && userAnswer === idx && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  {(!submitted || (userAnswer !== idx && idx !== q.correct)) && (
                    <div className="w-5 h-5 rounded border border-zinc-300" />
                  )}
                  <span className="text-zinc-900">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!submitted ? (
            <>
              <button
                onClick={handleSubmit}
                disabled={userAnswer === undefined}
                className="flex-1 px-4 py-2 bg-accent-600 text-white rounded font-medium hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Answer
              </button>
            </>
          ) : (
            <>
              {currentQuestion < questions.length - 1 && (
                <button
                  onClick={() => {
                    setCurrentQuestion(currentQuestion + 1)
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-200 text-zinc-900 rounded font-medium hover:bg-zinc-300 transition-colors"
                >
                  Next Question
                </button>
              )}
              {currentQuestion === questions.length - 1 && (
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-200 text-zinc-900 rounded font-medium hover:bg-zinc-300 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Quiz
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
