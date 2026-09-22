import { useEffect, useRef } from 'react'

export default function MermaidDiagram({ code, id }) {
  const containerRef = useRef(null)

  useEffect(() => {
    // For now, render as a code block since mermaid requires runtime compilation
    // In full implementation, would use mermaid library
  }, [code])

  return (
    <div
      ref={containerRef}
      className="bg-white border border-zinc-200 rounded-lg p-4 overflow-x-auto my-4"
    >
      <div className="bg-zinc-900 text-zinc-100 p-4 rounded font-mono text-sm overflow-x-auto">
        <pre>{code}</pre>
      </div>
      <div className="text-xs text-zinc-500 mt-2">
        Diagram (rendered via Mermaid in full implementation)
      </div>
    </div>
  )
}
