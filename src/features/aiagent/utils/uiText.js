import { useLang } from '../contexts/LanguageContext.jsx'

const en = {
  appTitle: 'AI Agent Visual Lab',
  heroEyebrow: 'A senior .NET engineer\'s path to production AI agents',
  heroDescription:
    'Learn from first principles: Python for .NET developers, LLM fundamentals, tool calling, agents, RAG, LangGraph, MCP, and building a GitHub coding agent that integrates with Slack. See, play, understand, code, break, fix, challenge.',
  overallProgress: 'Overall progress',
  moduleProgress: 'Module progress',
  dashboard: 'Dashboard',
  modules: 'Modules',
  topics: 'Topics',
  projects: 'Projects',
  hours: 'Hours',
  progress: 'Progress',
  reset: 'Reset',
  resetAllProgress: 'Reset all progress',
  signOut: 'Sign out',
  learner: 'Learner',
  backToDashboard: 'Back to dashboard',
  searchPlaceholder: 'Search topics...',
  noMatchingTopics: 'No matching topics.',
  result: 'result',
  results: 'results',
  clearSearch: 'Clear search',
  resetConfirm: 'Reset ALL progress? This clears all completed topics and notes.',
  loading: 'Loading...',
  builtWith: 'Built with ❤️',
  inKundapura: 'in Kundapura',
  footerCredit: 'by Thanthrajnaani',
  notesFor: 'Notes for',
  notesPlaceholder: 'Jot down anything: questions, links, code snippets...',
  notesSaved: 'Saved automatically to your browser.',
}

const kn = {
  appTitle: 'ಎಐ ಏಜೆಂಟ್ ವಿಜುವಲ್ ಲ್ಯಾಬ್',
  heroEyebrow: 'ಸಿನಿಯರ್ .NET ಇಂಜಿನಿಯರರ ಪಾಠ — ಪ್ರೋಡಕ್ಷನ್ AI ಏಜೆಂಟ್‌ಗಳನ್ನು ನಿರ್ಮಿಸಲು',
  heroDescription:
    'ಮೊದಲ ತತ್ವಗಳಿಂದ ಕಲಿಯಿರಿ: .NET ಡೆವಲಪರ್‌ಗಳಿಗೆ Python, LLM ಮೂಲತತ್ವಗಳು, ಉಪಕರಣ ಕರೆ, ಏಜೆಂಟ್‌ಗಳು, RAG, LangGraph, MCP, ಮತ್ತು GitHub ಕೋಡಿಂಗ್ ಏಜೆಂಟ್ ಅನ್ನು ನಿರ್ಮಿಸುವುದು.',
  overallProgress: 'ಒಟ್ಟಾರೆ ಪ್ರಗತಿ',
  moduleProgress: 'ಮಾಡ್ಯೂಲ್ ಪ್ರಗತಿ',
  dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
  modules: 'ಮಾಡ್ಯೂಲ್‌ಗಳು',
  topics: 'ವಿಷಯಗಳು',
  projects: 'ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು',
  hours: 'ಘಂಟೆಗಳು',
  progress: 'ಪ್ರಗತಿ',
  reset: 'ಮರುಹೊಂದಿಸಿ',
  learner: 'ಕಲಿಯುವವರು',
  backToDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂದೆ',
  searchPlaceholder: 'ವಿಷಯಗಳನ್ನು ಹುಡುಕಿ...',
  noMatchingTopics: 'ಮೇಲೆ ಹೊಂದಿಸುವ ವಿಷಯಗಳಿಲ್ಲ.',
  builtWith: 'ರೇಖಿಸಿದ ❤️',
  inKundapura: 'ಕುಂದಾಪುರದಲ್ಲಿ',
}

const texts = { en, kn }

export const useUiText = () => {
  const { lang } = useLang()
  return texts[lang] || en
}
