import { useEffect, useState } from 'react'
import { Download, RefreshCw, Share, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const IOS_HINT_DISMISSED_KEY = 'pwa_ios_hint_dismissed'

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export default function PwaPrompts() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Check for an updated service worker once an hour while the tab is open.
      if (!registration) return
      setInterval(() => registration.update(), 60 * 60 * 1000)
    },
  })

  const [installPromptEvent, setInstallPromptEvent] = useState(null)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPromptEvent(e)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  useEffect(() => {
    if (isStandalone()) return
    if (!isIos()) return
    if (localStorage.getItem(IOS_HINT_DISMISSED_KEY)) return
    setShowIosHint(true)
  }, [])

  const dismissIosHint = () => {
    localStorage.setItem(IOS_HINT_DISMISSED_KEY, '1')
    setShowIosHint(false)
  }

  const handleInstallClick = async () => {
    if (!installPromptEvent) return
    installPromptEvent.prompt()
    await installPromptEvent.userChoice
    setInstallPromptEvent(null)
  }

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <>
      {installPromptEvent && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white shadow-lg px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-accent-500 flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900">Install this app</p>
              <p className="text-xs text-zinc-500">Read courses full-screen, right from your home screen.</p>
            </div>
            <button onClick={handleInstallClick} className="pf-btn-primary px-3 py-1.5 text-xs flex-shrink-0">
              Install
            </button>
            <button
              onClick={() => setInstallPromptEvent(null)}
              className="p-1 text-zinc-400 hover:text-zinc-600 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showIosHint && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white shadow-lg px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-accent-500 flex items-center justify-center flex-shrink-0">
              <Share className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900">Add to Home Screen</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Tap the Share icon, then "Add to Home Screen" for a full-screen app on your iPad or iPhone.
              </p>
            </div>
            <button
              onClick={dismissIosHint}
              className="p-1 text-zinc-400 hover:text-zinc-600 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {(offlineReady || needRefresh) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white shadow-lg px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-accent-500 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900">
                {needRefresh ? 'Update available' : 'Ready to work offline'}
              </p>
              <p className="text-xs text-zinc-500">
                {needRefresh ? 'New course content is ready.' : "You've installed the app for offline reading."}
              </p>
            </div>
            {needRefresh && (
              <button
                onClick={() => updateServiceWorker(true)}
                className="pf-btn-primary px-3 py-1.5 text-xs flex-shrink-0"
              >
                Reload
              </button>
            )}
            <button onClick={close} className="p-1 text-zinc-400 hover:text-zinc-600 flex-shrink-0" aria-label="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
