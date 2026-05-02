import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Code2,
  Instagram,
  Mail,
  Youtube,
  Rocket,
  Sparkles,
  Smartphone,
  GraduationCap,
} from 'lucide-react'

const HERO_PHRASES = [
  'build full-stack web and mobile products.',
  'lead teams and run operations.',
  'teach in plain English and Kannada.',
  'write code that ships to real users.',
  'sketch portraits when I unplug.',
]

function Typewriter({ phrases, typingMs = 60, holdMs = 1600, deletingMs = 30, className = '' }) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState('typing')

  useEffect(() => {
    const current = phrases[index]
    if (phase === 'typing') {
      if (text.length < current.length) {
        const t = setTimeout(() => setText(current.slice(0, text.length + 1)), typingMs)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase('deleting'), holdMs)
      return () => clearTimeout(t)
    }
    if (phase === 'deleting') {
      if (text.length > 0) {
        const t = setTimeout(() => setText(current.slice(0, text.length - 1)), deletingMs)
        return () => clearTimeout(t)
      }
      setPhase('typing')
      setIndex((i) => (i + 1) % phrases.length)
    }
  }, [text, phase, index, phrases, typingMs, holdMs, deletingMs])

  return (
    <span className={className}>
      {text}
      <span
        aria-hidden="true"
        className="inline-block w-[3px] h-[0.85em] align-baseline bg-current ml-1 animate-cursor-blink translate-y-[2px]"
      />
    </span>
  )
}

const stackGroups = [
  {
    title: 'Engineering',
    items: [
      { label: 'HTML', tone: 'amber' },
      { label: 'CSS', tone: 'cyan' },
      { label: 'Bootstrap', tone: 'violet' },
      { label: 'JavaScript', tone: 'amber' },
      { label: 'jQuery', tone: 'sky' },
      { label: 'React', tone: 'cyan' },
      { label: 'Flutter & Dart', tone: 'sky' },
      { label: 'ASP.NET Core', tone: 'violet' },
      { label: 'GenAI', tone: 'fuchsia' },
      { label: 'MS SQL', tone: 'emerald' },
      { label: 'PostgreSQL', tone: 'sky' },
      { label: 'Docker', tone: 'cyan' },
      { label: 'Cloud', tone: 'emerald' },
      { label: 'Azure', tone: 'cyan' },
    ],
  },
  {
    title: 'Leadership',
    items: [
      { label: 'People management', tone: 'amber' },
      { label: 'Operations management', tone: 'emerald' },
    ],
  },
  {
    title: 'Beyond code',
    items: [
      { label: 'Procreate caricatures', tone: 'fuchsia' },
      { label: 'Pencil portraits', tone: 'violet' },
    ],
  },
]

const TONE_CLASSES = {
  sky: 'border-sky-500/30 bg-sky-500/5 text-sky-300',
  cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300',
  fuchsia: 'border-fuchsia-500/30 bg-fuchsia-500/5 text-fuchsia-300',
  amber: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
  emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300',
  violet: 'border-violet-500/30 bg-violet-500/5 text-violet-300',
}

const projects = [
  {
    icon: Smartphone,
    title: 'Flutter & Dart Course',
    body: 'A 7-module curriculum that takes learners from Dart fundamentals to production Flutter apps — with quizzes, notes, and cloud-synced progress.',
    href: '/courses/flutter',
    cta: 'Open course',
    tone: 'sky',
  },
  {
    icon: Sparkles,
    title: 'GenAI & ML Course',
    body: 'A hands-on path through ML basics, transformers, prompt engineering, RAG, and shipping LLM-powered features end-to-end.',
    href: '/courses/genai',
    cta: 'Open course',
    tone: 'fuchsia',
  },
  {
    icon: Rocket,
    title: 'Indie tooling & side-projects',
    body: 'Small utilities, learning tools, and experiments — usually built with Vite + React + Firebase. Always shipping; always learning.',
    href: '/courses',
    cta: 'See more',
    tone: 'amber',
  },
]

export default function HomePage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-fuchsia-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-32 -right-40 w-[520px] h-[520px] rounded-full bg-accent-500/10 blur-3xl" />

      <section className="relative max-w-6xl mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-12 md:pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-500/30 bg-accent-500/10 text-[11px] uppercase tracking-wider text-accent-300 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Builder · Educator · Indie shipper
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6">
          Hi, I'm{' '}
          <span className="bg-gradient-to-r from-accent-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            Thanthrajnaani
          </span>
          .<br />
          <span className="text-slate-200">I </span>
          <Typewriter
            phrases={HERO_PHRASES}
            className="bg-gradient-to-r from-accent-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent"
          />
        </h1>

        <p className="max-w-2xl text-base md:text-lg text-slate-400 leading-relaxed mb-8">
          Software engineer based in Kundapura, India. I build and ship full-stack web and mobile
          products, lead the teams behind them, and turn everything I learn into free, hands-on
          courses — in English and Kannada — for the next person walking the same path.
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            to="/courses"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            Explore courses
            <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="mailto:thanthrajnaani@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Get in touch
          </a>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <a
            href="https://www.youtube.com/@thanthrajnaani"
            target="_blank"
            rel="noreferrer"
            className="hover:text-rose-400"
            aria-label="YouTube"
          >
            <Youtube className="w-5 h-5" />
          </a>
          <a
            href="https://www.instagram.com/thanthrajnaani"
            target="_blank"
            rel="noreferrer"
            className="hover:text-fuchsia-400"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a href="mailto:thanthrajnaani@gmail.com" className="hover:text-white" aria-label="Email">
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-4 md:px-6 py-10 border-t border-slate-900">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-accent-400" />
              <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">
                About
              </h2>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              I write code, ship products, and document the journey.
            </h3>
            <p className="text-slate-400 leading-relaxed mb-4">
              By day I'm a software engineer shipping mobile and web products at my full-time role. Off
              the clock I prototype with AI, push code on side projects, and document every lesson I
              learn into hands-on curriculum anyone can follow.
            </p>
            <p className="text-slate-400 leading-relaxed">
              The goal: make solid engineering accessible to learners who don't have access to expensive
              bootcamps. I teach in plain language — and every lesson is available in both{' '}
              <span className="text-slate-200 font-medium">English and Kannada</span> — so you can
              learn in the language you think in. Every course on this site is free, in-depth, and
              built around projects you'd actually ship. If a problem you're working on overlaps with
              what I cover here, my inbox is open — happy to chat.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">
                Stack
              </h2>
            </div>
            <div className="space-y-4">
              {stackGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                    {group.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((s) => (
                      <span
                        key={s.label}
                        className={`px-3 py-1.5 rounded-lg border text-sm ${TONE_CLASSES[s.tone]}`}
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-4 md:px-6 py-12 border-t border-slate-900">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">
                Work & projects
              </h2>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold">
              Things I'm building right now.
            </h3>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.title} {...p} />
          ))}
        </div>
      </section>
    </div>
  )
}

function ProjectCard({ icon: Icon, title, body, href, cta, tone }) {
  return (
    <Link
      to={href}
      className={`group rounded-2xl border bg-slate-900/40 backdrop-blur p-5 hover:bg-slate-900/70 transition-all hover:-translate-y-0.5 ${TONE_CLASSES[tone]}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${TONE_CLASSES[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-lg font-semibold text-slate-100 mb-2">{title}</h4>
      <p className="text-sm text-slate-400 leading-relaxed mb-4">{body}</p>
      <span className="text-sm font-medium inline-flex items-center gap-1.5">
        {cta}
        <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  )
}
