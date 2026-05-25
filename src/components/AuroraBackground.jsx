/**
 * Fixed, full-viewport aurora layer that sits behind all content.
 * Slowly-drifting colored blobs + a faint grid + film grain.
 * Purely decorative — hidden from assistive tech.
 */
export default function AuroraBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-ink">
      {/* drifting aurora blobs */}
      <div className="aurora-blob animate-aurora-1 -top-40 -left-32 w-[42rem] h-[42rem] bg-aurora-violet/30" />
      <div className="aurora-blob animate-aurora-2 top-1/4 -right-40 w-[40rem] h-[40rem] bg-aurora-fuchsia/25" />
      <div className="aurora-blob animate-aurora-3 -bottom-48 left-1/4 w-[44rem] h-[44rem] bg-accent-500/20" />
      <div className="aurora-blob animate-aurora-2 top-1/2 left-1/3 w-[32rem] h-[32rem] bg-aurora-cyan/15" />

      {/* faint grid + grain for texture */}
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 grain" />

      {/* darken so foreground text stays high-contrast */}
      <div className="absolute inset-0 bg-ink/55" />
    </div>
  )
}
