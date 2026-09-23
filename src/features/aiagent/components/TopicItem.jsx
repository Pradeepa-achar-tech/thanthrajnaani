import { useState } from 'react'
import { CheckCircle2, Circle, Copy, Check } from 'lucide-react'
import PythonPlayground from './PythonPlayground'

const componentMap = {
  PythonPlayground,
}

export default function TopicItem({
  topic,
  done,
  onToggle,
}) {
  const [expanded, setExpanded] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const copyCode = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(topic.code || '')
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 hover:bg-accent-50 transition-colors flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            {done ? (
              <CheckCircle2 className="w-4 h-4 text-accent-500" />
            ) : (
              <Circle className="w-4 h-4 text-zinc-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium ${done ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>
              {topic.title}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
          className="text-xs font-semibold text-accent-600 flex-shrink-0 px-2 py-1 bg-accent-50 rounded hover:bg-accent-100 transition-colors"
        >
          {expanded ? 'Hide' : 'Learn'}
        </button>
      </button>

      {expanded && (
        <div className="px-4 py-3 bg-accent-50 border-t border-accent-100 space-y-3 text-sm">
          {topic.interactive && topic.component && componentMap[topic.component] && (
            <div className="py-3">
              {(() => {
                const Component = componentMap[topic.component]
                return <Component />
              })()}
            </div>
          )}

          {topic.analogy && (
            <div>
              <h4 className="font-semibold text-zinc-900 mb-1">📝 Analogy</h4>
              <p className="text-zinc-700 text-xs leading-relaxed">{topic.analogy}</p>
            </div>
          )}

          {topic.theory && (
            <div>
              <h4 className="font-semibold text-zinc-900 mb-1">💡 Theory</h4>
              <p className="text-zinc-700 text-xs leading-relaxed whitespace-pre-wrap">{topic.theory}</p>
            </div>
          )}

          {topic.whyItMatters && (
            <div>
              <h4 className="font-semibold text-zinc-900 mb-1">⭐ Why It Matters</h4>
              <p className="text-zinc-700 text-xs leading-relaxed">{topic.whyItMatters}</p>
            </div>
          )}

          {topic.steps && topic.steps.length > 0 && (
            <div>
              <h4 className="font-semibold text-zinc-900 mb-1">👣 Steps</h4>
              <ol className="list-decimal list-inside space-y-1 text-zinc-700 text-xs">
                {topic.steps.map((step, i) => (
                  <li key={i} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          )}

          {topic.code && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-zinc-900">💻 Code</h4>
                <button
                  onClick={copyCode}
                  className="text-xs px-2 py-1 text-zinc-600 hover:text-zinc-900 hover:bg-white rounded border border-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-white border border-zinc-300 rounded p-2 overflow-x-auto text-[11px] leading-relaxed text-zinc-800">
                <code>{topic.code}</code>
              </pre>
            </div>
          )}

          {topic.pitfalls && topic.pitfalls.length > 0 && (
            <div>
              <h4 className="font-semibold text-zinc-900 mb-1">⚠️ Common Pitfalls</h4>
              <ul className="list-disc list-inside space-y-1 text-zinc-700 text-xs">
                {topic.pitfalls.map((pitfall, i) => (
                  <li key={i} className="leading-relaxed">{pitfall}</li>
                ))}
              </ul>
            </div>
          )}

          {topic.tryIt && (
            <div>
              <h4 className="font-semibold text-zinc-900 mb-1">🎯 Try It</h4>
              <p className="text-zinc-700 text-xs leading-relaxed">{topic.tryIt}</p>
            </div>
          )}

          {topic.takeaway && (
            <div className="bg-white border-l-4 border-accent-500 pl-3 py-2">
              <h4 className="font-semibold text-zinc-900 mb-0.5">🎁 Takeaway</h4>
              <p className="text-zinc-700 text-xs leading-relaxed">{topic.takeaway}</p>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(topic.id)
            }}
            className={`w-full py-2 mt-2 rounded text-xs font-semibold transition-colors ${
              done
                ? 'bg-white border border-zinc-300 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100'
                : 'bg-accent-500 text-white hover:bg-accent-600'
            }`}
          >
            {done ? '✓ Completed' : '✓ Mark complete'}
          </button>
        </div>
      )}
    </div>
  )
}
