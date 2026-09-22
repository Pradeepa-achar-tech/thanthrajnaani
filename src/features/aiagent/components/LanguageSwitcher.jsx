import { useLang } from '../contexts/LanguageContext.jsx'

export default function LanguageSwitcher() {
  const { lang, switchLang } = useLang()

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => switchLang('en')}
        className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors border ${
          lang === 'en'
            ? 'bg-accent-600 text-white border-accent-600'
            : 'text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:border-zinc-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLang('kn')}
        className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors border ${
          lang === 'kn'
            ? 'bg-accent-600 text-white border-accent-600'
            : 'text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:border-zinc-300'
        }`}
      >
        ಕನ್ನ
      </button>
    </div>
  )
}
