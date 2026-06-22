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
  'Mini Project': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Project:        'bg-sky-50 text-sky-700 border-sky-200',
  Capstone:       'bg-accent-50 text-accent-700 border-accent-200',
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
          <strong key={key++} className="font-semibold text-zinc-900">
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
            className="px-1.5 py-0.5 rounded bg-zinc-100 text-accent-700 text-[0.85em] font-mono"
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
      className={`inline-flex items-center gap-1 rounded-md border transition-colors font-medium ${padding} ${
        copied
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300'
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
    slate:   'border-zinc-300',
    accent:  'border-accent-400',
    blue:    'border-sky-400',
    emerald: 'border-emerald-400',
    amber:   'border-amber-400',
    violet:  'border-violet-400',
  }[color]
  const text = {
    slate:   'text-zinc-500',
    accent:  'text-accent-700',
    blue:    'text-sky-700',
    emerald: 'text-emerald-700',
    amber:   'text-amber-700',
    violet:  'text-violet-700',
  }[color]
  return (
    <div className={`border-l-2 pl-4 ${ring}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div
          className={`flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] font-semibold ${text}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </div>
        {accessory}
      </div>
      <div className="text-sm text-zinc-700 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  )
}

function formatList(title, items) {
  if (!items?.length) return ''
  return `${title}\n${items.map((item) => `- ${item}`).join('\n')}`
}

function buildPromptText(project, blueprint, step, idx) {
  const number = step.step ?? idx + 1
  return [
    'You are Claude Code working in a Flutter/Dart project. Implement this step directly in the codebase.',
    '',
    `Project: ${project.title}`,
    project.domain ? `Domain: ${project.domain}` : '',
    project.description ? `Project description: ${project.description}` : '',
    blueprint?.overview ? `Project overview: ${blueprint.overview}` : '',
    '',
    `Step ${number}: ${step.label}`,
    step.outcome ? `Expected outcome: ${step.outcome}` : '',
    '',
    formatList('Functional requirements:', blueprint?.functionalRequirements),
    '',
    formatList('Technical implementation notes:', blueprint?.technicalImplementation),
    '',
    'Task:',
    step.prompt,
    '',
    'Working rules:',
    '- Read the existing files before editing and follow the project style.',
    '- Keep the change scoped to this step; do not rewrite unrelated screens or architecture.',
    '- Use clear file names, small widgets/classes, and beginner-readable code.',
    '- Add friendly empty, loading, and error states when the step touches user-facing flow.',
    '- Use realistic Udupi, Kundapura, or Bengaluru sample data only when it fits the project context.',
    '',
    'Acceptance checks before finishing:',
    '- Run `dart format .` or `flutter format` equivalent for touched Dart files.',
    '- Run `flutter analyze` when this is a Flutter project, or `dart analyze` for a Dart CLI project.',
    '- Run the relevant tests if tests exist or this step creates tests.',
    '- If a build/run command is practical, run it and report the result.',
    '- In the final response, list changed files, commands run, and any remaining TODOs.',
  ]
    .filter(Boolean)
    .join('\n')
}

function PromptStep({ project, blueprint, step, idx }) {
  const number = step.step ?? idx + 1
  const promptText = buildPromptText(project, blueprint, step, idx)
  return (
    <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-start justify-between gap-2 px-3 py-2 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-start gap-2 min-w-0">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-50 text-accent-700 text-[11px] font-semibold flex items-center justify-center mt-0.5">
            {number}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-zinc-900 leading-snug">
              {step.label}
            </div>
            {step.outcome && (
              <div className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                <FormattedText text={step.outcome} />
              </div>
            )}
          </div>
        </div>
        <CopyButton text={promptText} />
      </div>
      <pre className="px-3 py-2.5 text-xs text-zinc-700 whitespace-pre-wrap font-mono leading-relaxed bg-zinc-50/40">
        {promptText}
      </pre>
    </div>
  )
}

export default function ProjectCard({ project }) {
  const L = useUiText()
  const [open, setOpen] = useState(false)
  const typeClass =
    typeStyles[project.type] || 'bg-zinc-100 text-zinc-700 border-zinc-200'

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
              `### Step ${p.step ?? i + 1}: ${p.label}\n\n${buildPromptText(
                project,
                bp,
                p,
                i
              )}`
          )
          .join('\n\n---\n\n')
      : ''

  const tools = project.tools ?? project.stack ?? []

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
          <h3 className="text-base font-semibold text-zinc-900 pr-2">
            {project.title}
          </h3>
          <span className={`badge border ${typeClass}`}>
            <Briefcase className="w-3 h-3 mr-1" />
            {project.type}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {project.domain && (
            <span className="badge bg-zinc-100 text-zinc-700 border border-zinc-200">
              <Tag className="w-3 h-3 mr-1" />
              {project.domain}
            </span>
          )}
          {project.duration && (
            <span className="badge bg-zinc-100 text-zinc-700 border border-zinc-200">
              <Clock className="w-3 h-3 mr-1" />
              {project.duration}
            </span>
          )}
        </div>

        <p className="text-sm text-zinc-600 leading-relaxed">
          {project.description ?? project.summary}
        </p>

        {tools.length > 0 && (
          <div className="pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
              <Wrench className="w-3 h-3" />
              <span className="uppercase tracking-[0.12em] font-semibold">{L.tools}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="px-2 py-0.5 text-xs bg-white text-zinc-700 rounded border border-zinc-200"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasBlueprint && (
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-1">
            <span className="text-xs text-accent-700 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {L.buildBlueprintAvailable}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
              {open ? L.hide : L.open}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  open ? 'rotate-180 text-accent-600' : ''
                }`}
              />
            </span>
          </div>
        )}
      </button>

      {open && hasBlueprint && (
        <div className="px-5 pb-5 -mt-2 animate-slide-down">
          <div className="space-y-5 pt-3 border-t border-zinc-100">
            {bp.overview && (
              <div className="border-l-2 border-accent-400 pl-4">
                <p className="text-sm text-zinc-700 leading-relaxed">
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
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-1" />
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
                          <span className="text-sky-600 flex-shrink-0">›</span>
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
                    <PromptStep
                      key={idx}
                      project={project}
                      blueprint={bp}
                      step={p}
                      idx={idx}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500 mt-3 leading-relaxed">
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
