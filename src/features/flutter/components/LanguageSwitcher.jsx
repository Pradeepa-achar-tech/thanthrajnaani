import { useLang } from '../contexts/LanguageContext.jsx'

export default function LanguageSwitcher() {
  const { lang, switchLang } = useLang()

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs font-semibold select-none">
      <button
        onClick={() => switchLang('en')}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          lang === 'en'
            ? 'bg-accent-500 text-white'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={lang === 'en'}
        title="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => switchLang('kn')}
        className={`px-2.5 py-1 rounded-md transition-colors ${
          lang === 'kn'
            ? 'bg-accent-500 text-white'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={lang === 'kn'}
        title="ಕನ್ನಡದಲ್ಲಿ ಓದಿ"
      >
        ಕನ್ನಡ
      </button>
    </div>
  )
}
