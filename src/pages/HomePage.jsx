import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Code2,
  Instagram,
  Mail,
  Youtube,
  Rocket,
  Sparkles,
  ReceiptText,
  Hotel,
  Landmark,
  GraduationCap,
  MapPin,
} from 'lucide-react'
import Reveal from '../components/Reveal.jsx'

const stackGroups = [
  {
    title: 'Web',
    items: [
      'HTML', 'CSS', 'Bootstrap', 'JavaScript', 'TypeScript', 'jQuery',
      'React', 'ASP.NET Core MVC',
    ],
  },
  {
    title: 'Mobile',
    items: [
      'Flutter', 'Dart', 'SQLite (offline)', 'Firestore (online)',
      'Firebase Auth', 'Bluetooth & PDF',
    ],
  },
  {
    title: 'Desktop',
    items: [
      'Electron', 'Node.js', 'React + Vite', 'TypeScript',
      'Local / bundled PostgreSQL', 'Secure IPC', 'Offline-first',
    ],
  },
  {
    title: 'Backend & data',
    items: [
      'C# / .NET', 'ASP.NET Core APIs', 'Node.js', 'PostgreSQL',
      'MS SQL', 'SQLite', 'Dapper', 'Prisma',
    ],
  },
  {
    title: 'Auth & integrations',
    items: ['Google SSO', 'Microsoft SSO', 'OAuth 2.0', 'Firebase'],
  },
  {
    title: 'Hosting & DevOps',
    items: [
      'Hostinger', 'VPS', 'Linux servers', 'Nginx', 'SSL / HTTPS',
      'Server hardening', 'Docker', 'Azure', 'Cloud deployment',
    ],
  },
  {
    title: 'AI & GenAI',
    items: ['Python', 'GenAI', 'RAG', 'Agents'],
  },
  {
    title: 'Product & leadership',
    items: [
      'Product ownership', 'Feature definition', 'Technical architecture',
      'Product roadmap', 'Stakeholder management', 'Scrum & stand-ups',
      'Team leadership', 'People & operations',
    ],
  },
  {
    title: 'Beyond code',
    items: ['Procreate caricatures', 'Pencil portraits'],
  },
]

const projects = [
  {
    icon: ReceiptText,
    title: 'Restaurant Billing App (POS)',
    body: 'A Flutter + Firebase restaurant POS for Android: Google Sign-In, a Firestore menu and orders, GST billing, Bluetooth thermal printing, PDF invoices, and admin analytics. Built and taught module by module.',
    href: '/courses/billing',
    cta: 'Open course',
  },
  {
    icon: Hotel,
    title: 'Resort Management System',
    body: 'A web app on ASP.NET Core and PostgreSQL: room and wedding-hall bookings, GST invoicing, payments, a CRM, reports, and cloud deployment — built with C# and a clean, layered architecture.',
    href: '/courses/resort',
    cta: 'Open course',
  },
  {
    icon: Landmark,
    title: 'Temple Seva Desktop App',
    body: 'An offline desktop app built with Electron, React, and a local PostgreSQL database — a fast seva counter with receipt printing, daily reports, and backups that keeps every record on the machine, no cloud required.',
    href: '/courses/temple',
    cta: 'Open course',
  },
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 pt-16 md:pt-28 pb-14 md:pb-20">
        <div className="max-w-3xl animate-fade-up">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-3.5 h-3.5 text-accent-600" />
            <span className="eyebrow text-zinc-500">Kundapura, India · Product Owner · Architect · Engineer</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-[1.08] tracking-tight text-zinc-900 mb-6">
            Hi, I'm <span className="text-accent-600">Thanthrajnaani</span>.
            <br />
            I build, ship, and teach software.
          </h1>

          <p className="text-lg text-zinc-600 leading-relaxed mb-9 max-w-2xl">
            I build full-stack products across three platforms: web apps in React and ASP.NET
            Core, mobile apps in Flutter, and offline-first desktop software in Electron and Node.
            I lead the teams behind them, and turn what I learn into free, project-based courses in
            English and Kannada.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link to="/courses" className="pf-btn-primary group px-5 py-3 text-sm">
              <GraduationCap className="w-4 h-4" />
              Explore courses
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="mailto:thanthrajnaani@gmail.com" className="pf-btn-secondary px-5 py-3 text-sm">
              <Mail className="w-4 h-4" />
              Get in touch
            </a>
          </div>

          <div className="flex items-center gap-1 -ml-2">
            {[
              { href: 'https://www.youtube.com/@thanthrajnaani', label: 'YouTube', Icon: Youtube },
              { href: 'https://www.instagram.com/thanthrajnaani', label: 'Instagram', Icon: Instagram },
              { href: 'mailto:thanthrajnaani@gmail.com', label: 'Email', Icon: Mail },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                aria-label={label}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* About + Stack */}
      <section className="border-t border-zinc-200 bg-zinc-50/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20 grid md:grid-cols-2 gap-12 md:gap-16 items-start">
          <Reveal>
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-accent-600" />
              <span className="eyebrow text-accent-600">About</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 mb-5">
              I write code, ship products, and document the journey.
            </h2>
            <p className="text-zinc-600 leading-relaxed mb-4">
              By day I own a web product end to end: I define the features, architect the
              technology, and lead the engineering team that ships it. I run the sprint stand-ups,
              coordinate with stakeholders on the product roadmap, and still write fast,
              high-performance code myself.
            </p>
            <p className="text-zinc-600 leading-relaxed mb-4">
              Off the clock I go wider — building industry-standard, high-performance web
              applications, mobile apps in Flutter, and offline-first desktop software in Node,
              React, and Electron — and write up every lesson as a course anyone can follow.
            </p>
            <p className="text-zinc-600 leading-relaxed">
              The goal is simple: make solid engineering accessible to people who can't reach for an
              expensive bootcamp. I teach in plain language, and every lesson is available in both{' '}
              <span className="font-semibold text-zinc-900">English and Kannada</span>, so you can
              learn in the language you think in. Every course here is free, detailed, and built
              around an app you'd actually ship. If something you're working on overlaps with what I
              cover, my inbox is open.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-accent-600" />
              <span className="eyebrow text-accent-600">Stack</span>
            </div>
            <div className="space-y-6">
              {stackGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400 mb-2.5">
                    {group.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((label) => (
                      <span
                        key={label}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-700"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Work & projects */}
      <section className="border-t border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
          <Reveal className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4 text-accent-600" />
              <span className="eyebrow text-accent-600">Work &amp; projects</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
              Things I'm building right now.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {projects.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <ProjectCard {...p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ProjectCard({ icon: Icon, title, body, href, cta }) {
  return (
    <Link to={href} className="pf-card pf-card-hover group p-6 h-full flex flex-col">
      <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center mb-5 text-zinc-700 transition-colors group-hover:bg-accent-50 group-hover:text-accent-600">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 leading-relaxed mb-5 flex-1">{body}</p>
      <span className="text-sm font-medium inline-flex items-center gap-1.5 text-zinc-900">
        {cta}
        <ArrowRight className="w-4 h-4 text-accent-600 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  )
}
