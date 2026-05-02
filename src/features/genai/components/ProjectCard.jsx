import { useState } from 'react'
import {
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  ListChecks,
  Sparkles,
  Tag,
  Terminal,
  Wrench,
} from 'lucide-react'
import { useUiText } from '../utils/uiText.js'

const typeStyles = {
  'Mini Project': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Project: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Capstone: 'bg-accent-500/15 text-accent-300 border-accent-500/30',
}

// Lightweight markdown: **bold** + `code` inline, line breaks preserved.
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
          <strong key={key++} className="text-white">
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
            className="px-1 py-0.5 rounded bg-slate-800 text-accent-300 text-[0.85em] font-mono"
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

function CopyButton({ text, label = 'Copy', size = 'sm' }) {
  const L = useUiText()
  const [copied, setCopied] = useState(false)
  const handle = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      } finally {
        document.body.removeChild(ta)
      }
    }
  }
  const padding = size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
  return (
    <button
      onClick={handle}
      className={`inline-flex items-center gap-1 rounded border transition-colors font-medium ${padding} ${
        copied
          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
      }`}
      title={L.copy}
    >
      {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? L.copied : label}
    </button>
  )
}

function Section({ icon: Icon, label, color = 'slate', accessory, children }) {
  const ring = {
    slate: 'border-slate-800',
    accent: 'border-accent-500/30',
    blue: 'border-sky-500/30',
    emerald: 'border-emerald-500/30',
    amber: 'border-amber-500/30',
    violet: 'border-violet-500/30',
  }[color]
  const text = {
    slate: 'text-slate-400',
    accent: 'text-accent-400',
    blue: 'text-sky-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    violet: 'text-violet-400',
  }[color]
  return (
    <div className={`border-l-2 pl-4 ${ring}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div
          className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold ${text}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
        {accessory}
      </div>
      <div className="text-sm text-slate-300 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  )
}

function PromptStep({ step, idx }) {
  const number = step.step ?? idx + 1
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-hidden">
      <div className="flex items-start justify-between gap-2 px-3 py-2 bg-slate-900/60 border-b border-slate-800">
        <div className="flex items-start gap-2 min-w-0">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-500/15 text-accent-300 text-[11px] font-semibold flex items-center justify-center mt-0.5">
            {number}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-100 leading-snug">
              {step.label}
            </div>
            {step.outcome && (
              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                <FormattedText text={step.outcome} />
              </div>
            )}
          </div>
        </div>
        <CopyButton text={step.prompt} />
      </div>
      <pre className="px-3 py-2.5 text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
        {step.prompt}
      </pre>
    </div>
  )
}

export default function ProjectCard({ project }) {
  const L = useUiText()
  const [open, setOpen] = useState(false)
  const typeClass =
    typeStyles[project.type] || 'bg-slate-700/40 text-slate-300 border-slate-600'

  const bp = project.blueprint
  const hasBlueprint =
    bp &&
    ((bp.functionalRequirements && bp.functionalRequirements.length) ||
      (bp.technicalImplementation && bp.technicalImplementation.length) ||
      (bp.prompts && bp.prompts.length))

  const allPromptsText =
    hasBlueprint && bp.prompts
      ? bp.prompts
          .map(
            (p, i) =>
              `### Step ${p.step ?? i + 1}: ${p.label}\n\n${p.prompt}`
          )
          .join('\n\n---\n\n')
      : ''

  return (
    <div
      className={`card card-hover flex flex-col animate-fade-in ${
        open ? 'md:col-span-2' : ''
      }`}
    >
      <button
        onClick={() => hasBlueprint && setOpen((v) => !v)}
        disabled={!hasBlueprint}
        className={`text-left p-5 flex flex-col gap-3 ${
          hasBlueprint ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-white pr-2">
            {project.title}
          </h3>
          <span className={`badge border ${typeClass}`}>
            <Briefcase className="w-3 h-3 mr-1" />
            {project.type}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="badge bg-slate-800 text-slate-300 border border-slate-700">
            <Tag className="w-3 h-3 mr-1" />
            {project.domain}
          </span>
          <span className="badge bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3 h-3 mr-1" />
            {project.duration}
          </span>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          {project.description}
        </p>

        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <Wrench className="w-3 h-3" />
            <span className="uppercase tracking-wide">{L.tools}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.tools.map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 text-xs bg-slate-800/80 text-slate-300 rounded border border-slate-700"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {hasBlueprint && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 -mx-1 mt-1">
            <span className="text-xs text-accent-300 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {L.buildBlueprintAvailable}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              {open ? L.hide : L.open}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  open ? 'rotate-180 text-accent-400' : ''
                }`}
              />
            </span>
          </div>
        )}
      </button>

      {open && hasBlueprint && (
        <div className="px-5 pb-5 -mt-2 animate-slide-down">
          <div className="space-y-5 pt-3 border-t border-slate-800">
            {bp.overview && (
              <div className="border-l-2 border-accent-500/40 pl-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  <FormattedText text={bp.overview} />
                </p>
              </div>
            )}

            {(bp.functionalRequirements?.length || bp.technicalImplementation?.length) > 0 && (
              <div className="grid lg:grid-cols-2 gap-5">
                {bp.functionalRequirements && bp.functionalRequirements.length > 0 && (
                  <Section icon={ListChecks} label={L.functionalRequirements} color="emerald">
                    <ul className="space-y-1.5">
                      {bp.functionalRequirements.map((req, idx) => (
                        <li key={idx} className="flex gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-1" />
                          <span><FormattedText text={req} /></span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {bp.technicalImplementation && bp.technicalImplementation.length > 0 && (
                  <Section icon={Code2} label={L.technicalImplementation} color="blue">
                    <ul className="space-y-1.5">
                      {bp.technicalImplementation.map((item, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-sky-400 flex-shrink-0">›</span>
                          <span><FormattedText text={item} /></span>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
              </div>
            )}

            {bp.prompts && bp.prompts.length > 0 && (
              <Section
                icon={Terminal}
                label={L.claudePrompts}
                color="accent"
                accessory={
                  <CopyButton text={allPromptsText} label={L.copyAll} size="sm" />
                }
              >
                <div className="space-y-2.5">
                  {bp.prompts.map((p, idx) => (
                    <PromptStep key={idx} step={p} idx={idx} />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                  {L.promptHint}
                </p>
              </Section>
            )}

            {bp.deliverable && (
              <Section icon={Sparkles} label={L.finalDeliverable} color="amber">
                <FormattedText text={bp.deliverable} />
              </Section>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
