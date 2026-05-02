import { useCallback, useEffect, useRef, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const DEBOUNCE_MS = 1500

// Stores GenAI course progress at users/{uid}/progress/genai so it doesn't
// collide with other course progress in the unified portfolio.
export default function useFirestoreSync(user) {
  const [cloudProgress, setCloudProgress] = useState(null)
  const [loadingCloud, setLoadingCloud] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!user) {
      setCloudProgress(null)
      return
    }
    setLoadingCloud(true)
    getDoc(doc(db, 'users', user.uid, 'progress', 'genai')).then((snap) => {
      if (snap.exists()) {
        const data = snap.data()
        setCloudProgress({
          topics: data.topics || {},
          notes: data.notes || {},
          quiz: data.quiz || {},
        })
      } else {
        setCloudProgress({ topics: {}, notes: {}, quiz: {} })
      }
      setLoadingCloud(false)
    }).catch((err) => {
      console.warn('genai progress load failed:', err)
      setLoadingCloud(false)
    })
  }, [user?.uid])

  const syncProgress = useCallback(
    (progressState) => {
      if (!user) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        try {
          await setDoc(
            doc(db, 'users', user.uid, 'progress', 'genai'),
            {
              topics: progressState.topics || {},
              notes: progressState.notes || {},
              quiz: progressState.quiz || {},
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          )
        } catch (err) {
          console.warn('genai progress sync failed:', err)
        }
      }, DEBOUNCE_MS)
    },
    [user?.uid]
  )

  return { cloudProgress, loadingCloud, syncProgress }
}
