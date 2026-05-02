import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from './AuthContext.jsx'

const StudyListContext = createContext({
  items: {},
  loading: false,
  ready: true,
  isEnrolled: () => false,
  enroll: async () => {},
  unenroll: async () => {},
  markStarted: async () => {},
  markAccessed: async () => {},
})

export function StudyListProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState({})
  const [loading, setLoading] = useState(false)
  // `ready` flips to true once we've heard back from Firestore at least once
  // for the current user (or we know there's no user). It never flashes back to
  // false during a re-render, so the UI doesn't blink "Loading…" mid-session.
  const [ready, setReady] = useState(!user)

  useEffect(() => {
    if (!user) {
      setItems({})
      setLoading(false)
      setReady(true)
      return
    }
    setLoading(true)
    setReady(false)
    const colRef = collection(db, 'users', user.uid, 'studyList')
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const next = {}
        snap.forEach((d) => {
          next[d.id] = d.data()
        })
        setItems(next)
        setLoading(false)
        setReady(true)
      },
      (err) => {
        console.warn('studyList snapshot error:', err)
        setLoading(false)
        setReady(true)
      }
    )
    return unsub
  }, [user?.uid])

  const isEnrolled = useCallback((courseId) => Boolean(items[courseId]), [items])

  const enroll = useCallback(
    async (courseId) => {
      if (!user) return
      const ref = doc(db, 'users', user.uid, 'studyList', courseId)
      await setDoc(ref, {
        courseId,
        enrolledAt: serverTimestamp(),
        started: false,
      })
    },
    [user?.uid]
  )

  const unenroll = useCallback(
    async (courseId) => {
      if (!user) return
      const ref = doc(db, 'users', user.uid, 'studyList', courseId)
      await deleteDoc(ref)
    },
    [user?.uid]
  )

  const markStarted = useCallback(
    async (courseId) => {
      if (!user) return
      const ref = doc(db, 'users', user.uid, 'studyList', courseId)
      await updateDoc(ref, {
        started: true,
        startedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
      }).catch((e) => console.warn('markStarted failed:', e))
    },
    [user?.uid]
  )

  const markAccessed = useCallback(
    async (courseId) => {
      if (!user) return
      const ref = doc(db, 'users', user.uid, 'studyList', courseId)
      await updateDoc(ref, {
        lastAccessedAt: serverTimestamp(),
      }).catch((e) => console.warn('markAccessed failed:', e))
    },
    [user?.uid]
  )

  return (
    <StudyListContext.Provider
      value={{ items, loading, ready, isEnrolled, enroll, unenroll, markStarted, markAccessed }}
    >
      {children}
    </StudyListContext.Provider>
  )
}

export const useStudyList = () => useContext(StudyListContext)
