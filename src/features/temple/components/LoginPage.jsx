import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  Cloud,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useUiText } from '../utils/uiText.js'
import { curriculum } from '../data/curriculum.js'
import LanguageSwitcher from './LanguageSwitcher.jsx'

export default function LoginPage() {
  const L = useUiText()
  const { signInWithGoogle } = useAuth()
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState(null)

  const totalTopics = useMemo(
    () =>
      curriculum.modules.reduce(
        (sum, m) =>
          sum + m.sections.reduce((s, sec) => s + sec.topics.length, 0),
        0
      ),
    []
  )

  const handleSignIn = async () => {
    setBusy(true)
    setLocalError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setLocalError(err?.message || 'Sign-in failed.')
    } finally {
      setBusy(false)
    }
  }

  const features = [
    {
      icon: BookOpen,
      title: `${totalTopics} ${L.featTopicsTitle}`,
      body: L.featTopicsBody,
      tone: 'accent',
    },
    {
      icon: Smartphone,
      title: L.featCurriculumTitle,
      body: L.featCurriculumBody,
      tone: 'violet',
    },
    {
      icon: Trophy,
      title: L.featQuizzesTitle,
      body: L.featQuizzesBody,
      tone: 'sky',
    },
    {
      icon: Cloud,
      title: L.featCloudTitle,
      body: L.featCloudBody,
      tone: 'cyan',
    },
    {
      icon: Zap,
      title: L.featFreeTitle,
      body: L.featFreeBody,
      tone: 'rose',
    },
  ]

  const trust = [L.loginTrust1, L.loginTrust2, L.loginTrust3].filter(Boolean)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Ambient glow accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-fuchsia-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-accent-500/10 blur-3xl" />

      <header className="relative z-10 px-4 md:px-8 h-14 flex items-center justify-between border-b border-slate-900/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-500/15 border border-accent-500/30 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-accent-400" />
          </div>
          <div className="leading-tight min-w-0">
            <div className="text-sm font-semibold truncate">{L.appTitle}</div>
            <div className="text-[11px] text-slate-500 truncate">
              by{' '}
              <span className="font-extrabold italic tracking-wide bg-gradient-to-r from-accent-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                Thanthrajnaani
              </span>
            </div>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="relative z-10 px-4 md:px-8 py-8 md:py-14 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* HERO */}
          <section className="lg:col-span-7 xl:col-span-7 relative">
            {/* Floating FREE badge — top-right, doesn't crowd the headline */}
            <FreeBadge L={L} />

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-500/30 bg-accent-500/10 text-[11px] uppercase tracking-wider text-accent-300 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              {L.heroPill}
            </div>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6 md:pr-44">
              {L.heroH1Prefix}{' '}
              <span className="bg-gradient-to-r from-accent-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                {L.heroH1Highlight}
              </span>
              <br />
              {L.heroH1Suffix}
            </h1>

            <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl mb-10">
              {L.heroLead}{' '}
              <span className="text-emerald-300 font-semibold">
                {L.heroLeadStrong}
              </span>
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {features.map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </section>

          {/* SIGN-IN CARD */}
          <section className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-6 md:p-7 shadow-[0_0_60px_-15px_rgba(249,115,22,0.25)]">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl md:text-[28px] font-bold">
                  {L.loginWelcome}
                </h2>
                <span className="text-2xl" aria-hidden="true">👋</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                {L.loginCardSubtitle}
              </p>

              <button
                onClick={handleSignIn}
                disabled={busy}
                className="group w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                <span className="flex items-center gap-3">
                  {busy ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <GoogleGlyph className="w-5 h-5" />
                  )}
                  {busy ? L.signingIn : L.continueWithGoogle}
                </span>
                <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
              </button>

              {localError && (
                <p className="mt-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                  {L.loginError}
                  {localError}
                </p>
              )}

              {trust.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {trust.map((line, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2.5 text-[13px] text-slate-300"
                    >
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-emerald-300" />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-3 text-center">
                <Stat value={totalTopics} label={L.statTopicsLabel} valueClass="text-accent-300" />
                <Stat value="100%" label={L.statFreeLabel} valueClass="text-emerald-300" />
                <Stat value="∞" label={L.statAccessLabel} valueClass="text-cyan-300" />
              </div>

              <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
                <ShieldCheck className="w-3 h-3 text-emerald-400/80 flex-shrink-0" />
                {L.loginCardFootnote}
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-10 px-4 md:px-8 py-6 text-center text-xs text-slate-600">
        {L.footerCredit ? (
          <span>{L.footerCredit}</span>
        ) : (
          <>
            {L.builtWith}{' '}
            <span aria-label="love" className="text-rose-500">{'❤️'}</span>{' '}
            by{' '}
            <span className="font-extrabold italic tracking-wide bg-gradient-to-r from-accent-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              Thanthrajnaani
            </span>{' '}
            {L.inKundapura}
          </>
        )}
      </footer>
    </div>
  )
}

const TONES = {
  accent: 'border-accent-500/30 bg-accent-500/5 text-accent-300',
  violet: 'border-violet-500/30 bg-violet-500/5 text-violet-300',
  sky: 'border-sky-500/30 bg-sky-500/5 text-sky-300',
  cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-300',
  rose: 'border-rose-500/30 bg-rose-500/5 text-rose-300',
  yellow: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-300',
}

function FeatureCard({ icon: Icon, title, body, tone }) {
  return (
    <div
      className={`rounded-xl border bg-slate-900/40 backdrop-blur p-3.5 transition-colors hover:bg-slate-900/70 ${TONES[tone] || ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${TONES[tone] || ''}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-100 leading-snug">
            {title}
          </div>
          <div className="text-xs text-slate-400 leading-snug mt-0.5">
            {body}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ value, label, valueClass = '' }) {
  return (
    <div className="px-2">
      <div className={`text-2xl md:text-[26px] font-bold ${valueClass}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
        {label}
      </div>
    </div>
  )
}

function FreeBadge({ L }) {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute top-0 right-0 lg:right-2 z-10 select-none"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-rose-500/30 blur-xl" />
        <div className="relative w-32 h-32 rounded-full border-2 border-rose-500/70 bg-slate-950/85 shadow-[0_0_30px_rgba(244,63,94,0.55)] flex flex-col items-center justify-center text-center -rotate-6">
          <span className="text-[10px] font-bold tracking-[0.18em] text-rose-300 leading-none">
            {L.badgeFreeLine1}
          </span>
          <span className="text-[28px] font-extrabold text-rose-300 leading-none my-1">
            {L.badgeFreeLine2}
          </span>
          <span className="text-[10px] font-bold tracking-[0.18em] text-rose-300 leading-none">
            {L.badgeFreeLine3}
          </span>
        </div>
      </div>
    </div>
  )
}

function GoogleGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.227c1.886-1.737 2.986-4.296 2.986-7.351z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.227-2.51c-.895.6-2.04.955-3.391.955-2.605 0-4.81-1.76-5.6-4.123H3.064v2.59A9.996 9.996 0 0 0 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.9a6.005 6.005 0 0 1 0-3.8V7.51H3.064a9.996 9.996 0 0 0 0 8.98L6.4 13.9z"
      />
      <path
        fill="#EA4335"
        d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.864-2.864C16.96 2.99 14.696 2 12 2A9.996 9.996 0 0 0 3.064 7.51L6.4 10.1C7.19 7.737 9.395 5.977 12 5.977z"
      />
    </svg>
  )
}
