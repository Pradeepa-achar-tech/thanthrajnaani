import { Link } from 'react-router-dom'
import { Mail, Youtube, Instagram } from 'lucide-react'
import HeroSection from '../components/HeroSection.jsx'
import TechStackStrip from '../components/TechStackStrip.jsx'
import CapabilitiesSection from '../components/CapabilitiesSection.jsx'
import ProcessSection from '../components/ProcessSection.jsx'
import AboutSection from '../components/AboutSection.jsx'
import AISection from '../components/AISection.jsx'
import CoursesSection from '../components/CoursesSection.jsx'
import FinalCTASection from '../components/FinalCTASection.jsx'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <HeroSection />

      {/* Tech Stack */}
      <TechStackStrip />

      {/* What I Build */}
      <CapabilitiesSection />

      {/* From Idea to Production */}
      <ProcessSection />

      {/* About */}
      <AboutSection />

      {/* AI & Agents */}
      <AISection />

      {/* Courses */}
      <CoursesSection />

      {/* Final CTA */}
      <FinalCTASection />

      {/* Social Links Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50/40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
          <div className="flex items-center gap-2">
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
      </footer>
    </div>
  )
}
