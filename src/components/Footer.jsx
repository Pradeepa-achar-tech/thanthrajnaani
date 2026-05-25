export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
        <span>© {new Date().getFullYear()} Thanthrajnaani · Kundapura, India</span>
        <span className="flex items-center gap-1.5">
          Built with{' '}
          <span aria-label="love" className="text-rose-500">❤️</span> by{' '}
          <span className="font-semibold tracking-tight text-zinc-900">Thanthrajnaani</span>
        </span>
      </div>
    </footer>
  )
}
