import { useCallback, useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase.js'

const STORAGE_KEY = 'upralli_progress'
const CLOUD_DEBOUNCE_MS = 500

const defaultState = {
  topics: {},   // { topicId: true }
  notes: {},    // { moduleId: 'text' }
  quiz: {},     // { moduleId: { score, total, takenAt } }
}

const readLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultState }
    const parsed = JSON.parse(raw)
    return {
      topics: parsed.topics || {},
      notes: parsed.notes || {},
      quiz: parsed.quiz || {},
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

export default function useProgress(uid) {
  const [state, setState] = useState(readLocal)
  const stateRef = useRef(state)
  const uidRef = useRef(uid)
  const cloudTimerRef = useRef(null)

  useEffect(() => { stateRef.current = state }, [state])
  useEffect(() => { uidRef.current = uid }, [uid])

  const writeCloud = useCallback((targetUid, next) => {
    if (!targetUid) return
    const ref = doc(db, 'users', targetUid, 'progress', 'upralli')
    setDoc(ref, {
      topics: next.topics,
      notes: next.notes,
      quiz: next.quiz,
      updatedAt: serverTimestamp(),
    }).catch((e) => console.warn('progress cloud write failed:', e))
  }, [])

  const scheduleCloudWrite = useCallback((targetUid, next) => {
    if (cloudTimerRef.current) clearTimeout(cloudTimerRef.current)
    cloudTimerRef.current = setTimeout(() => {
      writeCloud(targetUid, next)
    }, CLOUD_DEBOUNCE_MS)
  }, [writeCloud])

  // Subscribe to cloud progress doc whenever the signed-in uid changes.
  useEffect(() => {
    if (!uid) return
    const ref = doc(db, 'users', uid, 'progress', 'upralli')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          // First time on this account — seed cloud with whatever we have locally.
          writeCloud(uid, stateRef.current)
          return
        }
        const data = snap.data() || {}
        const next = {
          topics: data.topics || {},
          notes: data.notes || {},
          quiz: data.quiz || {},
        }
        if (sameState(next, stateRef.current)) return
        stateRef.current = next
        setState(next)
        writeLocal(next)
      },
      (err) => console.warn('progress snapshot error:', err)
    )
    return unsub
  }, [uid, writeCloud])

  // Listen for changes from other tabs (offline / signed-out fallback).
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

  // Single mutation entrypoint: updates state, localStorage, and cloud (debounced).
  const apply = useCallback((mutator) => {
    const next = mutator(stateRef.current)
    stateRef.current = next
    setState(next)
    writeLocal(next)
    if (uidRef.current) scheduleCloudWrite(uidRef.current, next)
  }, [scheduleCloudWrite])

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

  const setQuizResult = useCallback((moduleId, score, total) => {
    apply((prev) => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        [moduleId]: { score, total, takenAt: Date.now() },
      },
    }))
  }, [apply])

  const getQuizResult = useCallback(
    (moduleId) => state.quiz[moduleId] || null,
    [state.quiz]
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

  const exportState = useCallback(
    () => ({
      version: 1,
      exportedAt: new Date().toISOString(),
      topics: state.topics,
      notes: state.notes,
      quiz: state.quiz,
    }),
    [state]
  )

  const importState = useCallback((data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Backup file is empty or invalid.')
    }
    apply(() => ({
      topics:
        data.topics && typeof data.topics === 'object' ? data.topics : {},
      notes: data.notes && typeof data.notes === 'object' ? data.notes : {},
      quiz: data.quiz && typeof data.quiz === 'object' ? data.quiz : {},
    }))
  }, [apply])

  return {
    state,
    toggleTopic,
    isTopicDone,
    setNote,
    getNote,
    setQuizResult,
    getQuizResult,
    moduleProgress,
    overallProgress,
    reset,
    exportState,
    importState,
  }
}
