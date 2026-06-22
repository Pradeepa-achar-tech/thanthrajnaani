import { useState } from 'react'
import {
  Check,
  ChevronDown,
  Code2,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  GraduationCap,
  Compass,
  Target,
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext.jsx'
import { kn, localizeTopicLesson } from '../data/translations_kn.js'
import MermaidDiagram from './MermaidDiagram.jsx'

function useTopicContent(topic) {
  const { lang } = useLang()
  if (lang === 'en') return { content: topic, labels: null }

  const t = kn.topics[topic.id]
  const merged = localizeTopicLesson(topic, t)
  return { content: merged, labels: kn.ui }
}

const defaultLabels = {
  thinkOfItLike:  'Think of it like...',
  theFullStory:   'The full story',
  flowDiagram:    'Flow diagram',
  whyThisMatters: 'Why this matters',
  stepByStep:     'Step-by-step',
  example:        'Example',
  watchOutFor:    'Watch out for',
  tryItYourself:  'Try it yourself',
  keyTakeaway:    'Key takeaway',
  tutorial:       'Tutorial',
  hide:           'Hide',
  markComplete:   'Mark complete',
  markIncomplete: 'Mark incomplete',
}

function FormattedText({ text }) {
  if (!text) return null
  const lines = String(text).split('\n')
  return (
    <>
      {lines.map((line, li) => (
        <span key={li} className="block">
          {renderInline(line)}
        </span>
      ))}
    </>
  )
}

function renderInline(line) {
  const out = []
  let i = 0
  let key = 0
  while (i < line.length) {
    if (line[i] === '*' && line[i + 1] === '*') {
      const end = line.indexOf('**', i + 2)
      if (end !== -1) {
        out.push(
          <strong key={key++} className="text-zinc-900">
            {line.slice(i + 2, end)}
          </strong>
        )
        i = end + 2
        continue
      }
    }
    if (line[i] === '`') {
      const end = line.indexOf('`', i + 1)
      if (end !== -1) {
        out.push(
          <code
            key={key++}
            className="px-1 py-0.5 rounded bg-zinc-100 text-accent-700 text-[0.85em] font-mono"
          >
            {line.slice(i + 1, end)}
          </code>
        )
        i = end + 1
        continue
      }
    }
    let j = i + 1
    while (j < line.length && line[j] !== '*' && line[j] !== '`') j++
    out.push(<span key={key++}>{line.slice(i, j)}</span>)
    i = j
  }
  return out
}

function Section({ icon: Icon, label, color = 'slate', children }) {
  const ring = {
    slate: 'border-zinc-200',
    accent: 'border-accent-200',
    blue: 'border-sky-200',
    rose: 'border-rose-200',
    emerald: 'border-emerald-200',
    amber: 'border-amber-200',
  }[color]
  const text = {
    slate: 'text-zinc-500',
    accent: 'text-accent-600',
    blue: 'text-sky-600',
    rose: 'text-rose-600',
    emerald: 'text-emerald-600',
    amber: 'text-amber-700',
  }[color]
  return (
    <div className={`border-l-2 pl-4 ${ring}`}>
      <div className={`flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-wider font-semibold ${text}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-sm text-zinc-700 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  )
}

export default function TopicItem({ topic, done, onToggle }) {
  const [open, setOpen] = useState(false)
  const { content, labels } = useTopicContent(topic)
  const L = labels ?? defaultLabels

  const hasTutorial =
    Boolean(content.explain) ||
    Boolean(content.analogy) ||
    Boolean(content.theory) ||
    Boolean(content.diagram) ||
    Boolean(content.whyItMatters) ||
    (content.steps && content.steps.length) ||
    Boolean(content.code) ||
    (content.pitfalls && content.pitfalls.length) ||
    Boolean(content.tryIt) ||
    Boolean(content.takeaway)

  return (
    <div
      className={`group rounded-lg transition-colors ${
        done ? 'bg-accent-50/60' : 'hover:bg-zinc-50'
      }`}
    >
      <div className="flex items-start gap-2 px-2 py-2">
        <button
          onClick={() => onToggle(topic.id)}
          aria-label={done ? L.markIncomplete ?? defaultLabels.markIncomplete : L.markComplete ?? defaultLabels.markComplete}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
            done
              ? 'bg-accent-500 border-accent-500 hover:bg-accent-600'
              : 'bg-white border-zinc-300 hover:border-accent-400'
          }`}
        >
          {done && <Check className="w-3.5 h-3.5 text-zinc-900" strokeWidth={3} />}
        </button>

        <button
          onClick={() => hasTutorial && setOpen((v) => !v)}
          disabled={!hasTutorial}
          className="flex-1 min-w-0 text-left flex items-start gap-2"
        >
          <span
            className={`text-sm leading-relaxed flex-1 ${
              done
                ? 'text-zinc-800 line-through decoration-accent-500/40'
                : 'text-zinc-800'
            }`}
          >
            {topic.title}
          </span>
          {hasTutorial && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
              <span className="hidden sm:inline">{open ? L.hide : L.tutorial}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  open ? 'rotate-180 text-accent-600' : 'group-hover:text-zinc-700'
                }`}
              />
            </span>
          )}
        </button>
      </div>

      {open && hasTutorial && (
        <div className="pl-9 pr-3 pb-5 -mt-1 animate-slide-down">
          <div className="space-y-5">
            {content.explain && (
              <div className="border-l-2 border-accent-400 pl-4">
                <p className="text-sm text-zinc-700 leading-relaxed">
                  <FormattedText text={content.explain} />
                </p>
              </div>
            )}

            {content.analogy && (
              <Section icon={Compass} label={L.thinkOfItLike} color="emerald">
                <FormattedText text={content.analogy} />
              </Section>
            )}

            {content.theory && (
              <Section icon={GraduationCap} label={L.theFullStory} color="blue">
                <FormattedText text={content.theory} />
              </Section>
            )}

            {content.diagram && (
              <div className="border-l-2 border-accent-200 pl-4">
                <div className="flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-wider text-accent-600 font-semibold">
                  <Compass className="w-3.5 h-3.5" />
                  {L.flowDiagram ?? defaultLabels.flowDiagram}
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 overflow-x-auto">
                  <MermaidDiagram source={content.diagram} id={topic.id} />
                </div>
                {content.flowExplain && (
                  <p className="mt-2 text-sm text-zinc-500 italic leading-relaxed">
                    <FormattedText text={content.flowExplain} />
                  </p>
                )}
              </div>
            )}

            {content.whyItMatters && (
              <Section icon={Sparkles} label={L.whyThisMatters} color="accent">
                <FormattedText text={content.whyItMatters} />
              </Section>
            )}

            {content.steps && content.steps.length > 0 && (
              <Section icon={Target} label={L.stepByStep} color="slate">
                <ol className="space-y-2">
                  {content.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-50 text-accent-700 text-[11px] font-semibold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-zinc-700 leading-relaxed">
                        <FormattedText text={step} />
                      </span>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {content.code && (
              <div className="border-l-2 border-zinc-200 pl-4">
                <div className="flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                  <Code2 className="w-3.5 h-3.5" />
                  {L.example}
                </div>
                <pre className="bg-white border border-zinc-200 rounded-lg p-3 text-xs text-zinc-700 overflow-x-auto font-mono leading-relaxed">
                  <code>{content.code}</code>
                </pre>
              </div>
            )}

            {content.pitfalls && content.pitfalls.length > 0 && (
              <Section icon={AlertTriangle} label={L.watchOutFor} color="rose">
                <ul className="space-y-1.5">
                  {content.pitfalls.map((p, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-rose-600 flex-shrink-0">-</span>
                      <span><FormattedText text={p} /></span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {content.tryIt && (
              <Section icon={Target} label={L.tryItYourself} color="amber">
                <FormattedText text={content.tryIt} />
              </Section>
            )}

            {content.takeaway && (
              <div className="flex gap-2 items-start bg-accent-50/60 border border-accent-200 rounded-lg p-3">
                <Lightbulb className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-accent-600 font-semibold mb-0.5">
                    {L.keyTakeaway}
                  </div>
                  <p className="text-sm text-zinc-800 leading-relaxed">
                    <FormattedText text={content.takeaway} />
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
