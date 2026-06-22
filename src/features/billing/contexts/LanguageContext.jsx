import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext({ lang: 'en', switchLang: () => {} })

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('thanthra-lang') || 'en'
  )

  const switchLang = (l) => {
    setLang(l)
    localStorage.setItem('thanthra-lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, switchLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
