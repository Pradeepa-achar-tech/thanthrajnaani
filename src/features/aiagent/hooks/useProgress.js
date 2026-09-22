import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'aiagent_progress'

const defaultState = {
  topics: {},   // { topicId: true }
  notes: {},    // { moduleId: 'text' }
}

const readLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultState }
    const parsed = JSON.parse(raw)
    return {
      topics: parsed.topics || {},
      notes: parsed.notes || {},
    }
  } catch {
    return { ...defaultState }
  }
}

const writeLocal = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or blocked — ignore
  }
}

const sameState = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

export default function useProgress() {
  const [state, setState] = useState(readLocal)
  const stateRef = useRef(state)

  useEffect(() => { stateRef.current = state }, [state])

  // Listen for changes from other tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return
      const next = readLocal()
      if (sameState(next, stateRef.current)) return
      stateRef.current = next
      setState(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const apply = useCallback((mutator) => {
    const next = mutator(stateRef.current)
    stateRef.current = next
    setState(next)
    writeLocal(next)
  }, [])

  const toggleTopic = useCallback((topicId) => {
    apply((prev) => {
      const topics = { ...prev.topics }
      if (topics[topicId]) delete topics[topicId]
      else topics[topicId] = true
      return { ...prev, topics }
    })
  }, [apply])

  const isTopicDone = useCallback(
    (topicId) => Boolean(state.topics[topicId]),
    [state.topics]
  )

  const setNote = useCallback((moduleId, text) => {
    apply((prev) => ({
      ...prev,
      notes: { ...prev.notes, [moduleId]: text },
    }))
  }, [apply])

  const getNote = useCallback(
    (moduleId) => state.notes[moduleId] || '',
    [state.notes]
  )

  const moduleProgress = useCallback(
    (module) => {
      const allTopics = module.sections.flatMap((s) => s.topics.map((t) => t.id))
      if (allTopics.length === 0) return { done: 0, total: 0, pct: 0 }
      const done = allTopics.filter((id) => state.topics[id]).length
      return {
        done,
        total: allTopics.length,
        pct: Math.round((done / allTopics.length) * 100),
      }
    },
    [state.topics]
  )

  const overallProgress = useCallback(
    (modules) => {
      let done = 0
      let total = 0
      for (const m of modules) {
        for (const s of m.sections) {
          for (const t of s.topics) {
            total += 1
            if (state.topics[t.id]) done += 1
          }
        }
      }
      return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
    },
    [state.topics]
  )

  const reset = useCallback(() => {
    apply(() => ({ ...defaultState }))
  }, [apply])

  return {
    state,
    toggleTopic,
    isTopicDone,
    setNote,
    getNote,
    moduleProgress,
    overallProgress,
    reset,
  }
}
