import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

let initialized = false
function ensureInit() {
  if (initialized) return
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      primaryColor: '#1e293b',
      primaryTextColor: '#f1f5f9',
      primaryBorderColor: '#475569',
      lineColor: '#E85A2A',
      secondaryColor: '#334155',
      tertiaryColor: '#0f172a',
      fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
    },
  })
  initialized = true
}

export default function MermaidDiagram({ source, id }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !source) return
    ensureInit()

    let cancelled = false
    const node = ref.current
    const renderId = `mermaid-${id ?? 'd'}-${Math.random().toString(36).slice(2, 10)}`

    mermaid
      .render(renderId, source)
      .then(({ svg }) => {
        if (cancelled || !node) return
        node.innerHTML = svg
      })
      .catch((err) => {
        if (cancelled || !node) return
        const msg = (err && err.message) || String(err)
        node.innerHTML = `<pre class="text-rose-400 text-xs whitespace-pre-wrap">Diagram error: ${escapeHtml(msg)}</pre>`
      })

    return () => {
      cancelled = true
    }
  }, [source, id])

  return <div ref={ref} className="mermaid-host text-slate-100 flex justify-center" />
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
