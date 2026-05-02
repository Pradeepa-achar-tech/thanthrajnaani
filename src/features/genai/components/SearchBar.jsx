import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { flattenTopics } from '../data/curriculum.js'
import { useUiText } from '../utils/uiText.js'

// Score and snippet helpers
const TITLE_HIT = 100
const SECTION_HIT = 30
const MODULE_HIT = 20
const BODY_HIT = 10

const buildSnippet = (body, q, radius = 60) => {
  const idx = body.toLowerCase().indexOf(q)
  if (idx === -1) return ''
  const start = Math.max(0, idx - radius)
  const end = Math.min(body.length, idx + q.length + radius)
  let s = body.slice(start, end)
  if (start > 0) s = '…' + s
  if (end < body.length) s = s + '…'
  return s
}

const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)

export default function SearchBar({ onJump }) {
  const L = useUiText()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const allTopics = useMemo(() => flattenTopics(), [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const scored = []
    for (const t of allTopics) {
      let score = 0
      const titleHit = t.titleLower.includes(q)
      const sectionHit = t.sectionLower.includes(q)
      const moduleHit = t.moduleLower.includes(q)
      const bodyHit = t.bodyLower.includes(q)
      if (titleHit) score += TITLE_HIT
      if (sectionHit) score += SECTION_HIT
      if (moduleHit) score += MODULE_HIT
      if (bodyHit) score += BODY_HIT
      if (titleHit && t.titleLower.startsWith(q)) score += 30 // prefer prefix matches
      if (score === 0) continue
      const snippet =
        !titleHit && !sectionHit && !moduleHit && bodyHit
          ? buildSnippet(t.body, q)
          : ''
      scored.push({ ...t, score, snippet })
    }
    scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    return scored.slice(0, 20)
  }, [query, allTopics])

  // Reset active index when results change
  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  // Click outside closes the dropdown
  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Global Cmd/Ctrl+K → focus search; Esc when open → blur+close
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase()
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Keep the active item scrolled into view
  useEffect(() => {
    if (!open || results.length === 0) return
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`)
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [activeIdx, open, results.length])

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) {
      if (e.key === 'Escape') {
        setQuery('')
        setOpen(false)
        inputRef.current?.blur()
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const r = results[activeIdx]
      if (r) {
        onJump?.(r.moduleId, r.id)
        setOpen(false)
        inputRef.current?.blur()
      }
    } else if (e.key === 'Escape') {
      setQuery('')
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const highlight = (text) => {
    const q = query.trim()
    if (!q || !text) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-accent-500/30 text-accent-100 rounded px-0.5">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  return (
    <div ref={wrapRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={L.searchPlaceholder}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full bg-slate-900 border border-slate-800 focus:border-accent-500 outline-none rounded-lg pl-9 pr-20 py-2 text-sm text-slate-100 placeholder-slate-500 transition-colors"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('')
              setOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
            aria-label={L.clearSearch}
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 h-5 rounded border border-slate-700 bg-slate-800/60 text-[10px] font-mono text-slate-400 select-none pointer-events-none">
            {isMac ? '⌘' : 'Ctrl'}K
          </kbd>
        )}
      </div>

      {open && query && (
        <div
          ref={listRef}
          className="absolute z-30 mt-2 w-full bg-slate-900 border border-slate-800 rounded-lg shadow-xl max-h-96 overflow-y-auto animate-slide-down"
        >
          {results.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500 text-center">
              {L.noMatchingTopics}
            </div>
          ) : (
            <>
              <ul>
                {results.map((r, i) => (
                  <li key={r.id}>
                    <button
                      data-idx={i}
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => {
                        onJump?.(r.moduleId, r.id)
                        setOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 transition-colors border-b border-slate-800/60 last:border-0 ${
                        i === activeIdx ? 'bg-slate-800' : 'hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="text-sm text-slate-100">{highlight(r.title)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {r.moduleTitle} · {r.sectionTitle}
                      </div>
                      {r.snippet && (
                        <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {highlight(r.snippet)}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="sticky bottom-0 px-4 py-1.5 bg-slate-900/95 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                <span>
                  {results.length} {results.length === 1 ? L.result : L.results}
                </span>
                <span className="flex items-center gap-3">
                  <span>
                    <kbd className="px-1 rounded bg-slate-800 border border-slate-700 font-mono">↑↓</kbd> {L.navigate}
                  </span>
                  <span>
                    <kbd className="px-1 rounded bg-slate-800 border border-slate-700 font-mono">↵</kbd> {L.open}
                  </span>
                  <span>
                    <kbd className="px-1 rounded bg-slate-800 border border-slate-700 font-mono">Esc</kbd> {L.close}
                  </span>
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
