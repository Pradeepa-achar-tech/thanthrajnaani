import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { flattenTopics } from '../data/curriculum.js'
import { useUiText } from '../utils/uiText.js'

export default function SearchBar({ onJump }) {
  const L = useUiText()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  const allTopics = useMemo(() => flattenTopics(), [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const matches = allTopics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.explain?.toLowerCase().includes(q)
    )
    return matches.slice(0, 12)
  }, [query, allTopics])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => (i + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => (i - 1 + results.length) % results.length)
      } else if (e.key === 'Enter' && results[activeIdx]) {
        e.preventDefault()
        const t = results[activeIdx]
        onJump?.(t.moduleId, t.id)
        setQuery('')
        setOpen(false)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, results, activeIdx, onJump])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onClickOutside)
    return () => document.removeEventListener('click', onClickOutside)
  }, [])

  return (
    <div ref={wrapRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search topics..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIdx(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className="w-full pl-10 pr-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setOpen(false)
            }}
            className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {results.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => {
                onJump?.(t.moduleId, t.id)
                setQuery('')
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-3 text-sm border-b border-zinc-100 last:border-b-0 transition-colors ${
                idx === activeIdx
                  ? 'bg-accent-50 text-zinc-900'
                  : 'text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                {t.explain}
              </div>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-lg p-3 text-center text-sm text-zinc-500 z-50">
          No topics found
        </div>
      )}
    </div>
  )
}
