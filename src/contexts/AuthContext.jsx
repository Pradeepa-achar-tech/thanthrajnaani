import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase.js'

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  signOutUser: async () => {},
})

async function recordVisit(firebaseUser, isExplicitLogin) {
  const ref = doc(db, 'users', firebaseUser.uid)
  const snap = await getDoc(ref)
  const profile = {
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  }
  if (!snap.exists()) {
    await setDoc(ref, {
      ...profile,
      firstLoginAt: serverTimestamp(),
      lastVisitAt: serverTimestamp(),
      loginCount: 1,
      visitCount: 1,
    })
  } else {
    await updateDoc(ref, {
      ...profile,
      lastVisitAt: serverTimestamp(),
      visitCount: increment(1),
      ...(isExplicitLogin && { loginCount: increment(1) }),
    })
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isExplicit = sessionStorage.getItem('explicit_login') === '1'
        sessionStorage.removeItem('explicit_login')
        recordVisit(firebaseUser, isExplicit).catch((e) =>
          console.warn('recordVisit failed:', e)
        )
      }
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsub
  }, [])

  const signInWithGoogle = async () => {
    setError(null)
    try {
      sessionStorage.setItem('explicit_login', '1')
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      sessionStorage.removeItem('explicit_login')
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return
      }
      setError(err?.message || 'Sign-in failed.')
      throw err
    }
  }

  const signOut = async () => {
    setError(null)
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signOut,
        signOutUser: signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
