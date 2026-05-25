import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { GraduationCap, LogIn, LogOut, Menu, X, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Navbar() {
  const { user, signInWithGoogle, signOut, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const handleSignIn = async () => {
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch {
      // popup-closed already swallowed inside the context
    } finally {
      setBusy(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const linkBase =
    'px-3 py-2 rounded-lg text-sm font-medium transition-colors'
  const linkClasses = ({ isActive }) =>
    `${linkBase} ${
      isActive
        ? 'text-white bg-white/10 ring-1 ring-white/10'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`

  return (
    <header className="sticky top-0 z-30 glass">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center gap-3">
        <Link to="/" className="group flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 via-aurora-fuchsia to-aurora-violet flex items-center justify-center shadow-glow-fuchsia transition-transform group-hover:scale-105">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold tracking-tight text-aurora text-base">
            Thanthrajnaani
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          <NavLink to="/" end className={linkClasses}>About</NavLink>
          <NavLink to="/courses" className={linkClasses}>Courses</NavLink>
          {user && (
            <NavLink to="/my-learning" className={linkClasses}>My Learning</NavLink>
          )}
        </nav>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || ''}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-xs font-bold text-accent-400">
                    {(user.displayName || user.email || '?')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-slate-300 max-w-[140px] truncate">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={busy}
              className="btn-aurora flex items-center gap-2 px-4 py-1.5 text-sm rounded-lg font-semibold disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Sign in
            </button>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 -mr-2 text-slate-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 glass">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            <NavLink to="/" end onClick={() => setOpen(false)} className={linkClasses}>About</NavLink>
            <NavLink to="/courses" onClick={() => setOpen(false)} className={linkClasses}>Courses</NavLink>
            {user && (
              <NavLink to="/my-learning" onClick={() => setOpen(false)} className={linkClasses}>My Learning</NavLink>
            )}
            <div className="border-t border-white/10 my-2" />
            {user ? (
              <button
                onClick={() => {
                  setOpen(false)
                  handleSignOut()
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-slate-300 hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            ) : (
              <button
                onClick={() => {
                  setOpen(false)
                  handleSignIn()
                }}
                disabled={busy}
                className="btn-aurora flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg font-semibold"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
