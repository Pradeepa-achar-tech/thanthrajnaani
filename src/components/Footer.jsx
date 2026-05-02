export default function Footer() {
  return (
    <footer className="border-t border-slate-900 mt-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <span>© {new Date().getFullYear()} Thanthrajnaani · Kundapura, India</span>
        <span className="flex items-center gap-1.5">
          Built with{' '}
          <span aria-label="love" className="text-rose-500">❤️</span> by{' '}
          <span className="font-extrabold italic tracking-wide bg-gradient-to-r from-accent-300 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
            Thanthrajnaani
          </span>
        </span>
      </div>
    </footer>
  )
}
