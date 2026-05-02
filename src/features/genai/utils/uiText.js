import { useLang } from '../contexts/LanguageContext.jsx'

const en = {
  appTitle: 'GenAI - ML Tutorial',
  heroEyebrow: 'Generative AI & Machine Learning Program',
  heroTitlePrefix: 'GenAI - ML Tutorial by',
  heroDescription:
    'Track every topic, project, and quiz across the full 7-module curriculum - from Python fundamentals to deploying agentic AI.',
  overallProgress: 'Overall progress',
  moduleProgress: 'Module progress',
  dashboard: 'Dashboard',
  modules: 'Modules',
  topics: 'Topics',
  projects: 'Projects',
  quiz: 'Quiz',
  notes: 'Notes',
  hours: 'Hours',
  progress: 'Progress',
  export: 'Export',
  import: 'Import',
  resetAllProgress: 'Reset all progress',
  signOut: 'Sign out',
  learner: 'Learner',
  backToDashboard: 'Back to dashboard',
  searchPlaceholder: 'Search 267 topics - title or content...',
  noMatchingTopics: 'No matching topics.',
  result: 'result',
  results: 'results',
  navigate: 'navigate',
  open: 'open',
  close: 'close',
  clearSearch: 'Clear search',
  resetConfirm:
    'Reset ALL progress? This clears completed topics, notes, and quiz scores.',
  importConfirm: 'Import this backup? Your current progress will be replaced.',
  importError: 'Could not import: ',
  invalidJson: 'invalid JSON file.',
  loading: 'Loading...',
  syncingProgress: 'Syncing your progress...',
  footerSync: 'Progress synced to Firebase - also cached locally.',
  builtWith: 'Built with',
  inKundapura: 'in Kundapura',
  notesFor: 'Notes for',
  notesPlaceholder:
    'Jot down anything: questions, links, snippets, study reminders...',
  notesSaved: 'Saved automatically to your browser.',
  moduleQuiz: 'Module Quiz',
  pickBestAnswer: 'Pick the best answer.',
  lastAttempt: 'Last attempt',
  submitAnswers: 'Submit answers',
  perfectScore: 'Perfect - you nailed every question.',
  solidScore: 'Solid work - most concepts locked in.',
  reviewScore: 'Review the topics above and try again.',
  retake: 'Retake',
  tools: 'Tools',
  buildBlueprintAvailable: 'Build blueprint available',
  hide: 'Hide',
  functionalRequirements: 'Functional requirements',
  technicalImplementation: 'Technical implementation',
  claudePrompts: 'Claude Code prompts (copy-paste in order)',
  copy: 'Copy',
  copied: 'Copied',
  copyAll: 'Copy all',
  finalDeliverable: 'Final deliverable',
  promptHint:
    'Paste each prompt into Claude Code in order. Wait for it to finish before sending the next - each step builds on the last.',
  exportTitle: 'Download a JSON backup of your progress',
  importTitle: 'Restore progress from a JSON backup',
}

const kn = {
  appTitle: 'GenAI - ML Tutorial',
  heroEyebrow: 'Generative AI ಮತ್ತು Machine Learning Program',
  heroTitlePrefix: 'GenAI - ML Tutorial by',
  heroDescription:
    'Full 7-module curriculum ನಲ್ಲಿ topics, projects, quiz progress ಎಲ್ಲ track ಮಾಡಿ - Python basics ಇಂದ Agentic AI deployment ವರೆಗೆ.',
  overallProgress: 'ಒಟ್ಟು progress',
  moduleProgress: 'Module progress',
  dashboard: 'Dashboard',
  modules: 'Modules',
  topics: 'Topics',
  projects: 'Projects',
  quiz: 'Quiz',
  notes: 'Notes',
  hours: 'Hours',
  progress: 'Progress',
  export: 'Export',
  import: 'Import',
  resetAllProgress: 'ಎಲ್ಲ progress reset ಮಾಡಿ',
  signOut: 'Sign out',
  learner: 'Learner',
  backToDashboard: 'Dashboard ಗೆ ಹಿಂತಿರುಗಿ',
  searchPlaceholder: '267 topics ಹುಡುಕಿ - title ಅಥವಾ content...',
  noMatchingTopics: 'Matching topics ಸಿಗಲಿಲ್ಲ.',
  result: 'result',
  results: 'results',
  navigate: 'navigate',
  open: 'open',
  close: 'close',
  clearSearch: 'Search clear ಮಾಡಿ',
  resetConfirm:
    'ಎಲ್ಲ progress reset ಮಾಡಬೇಕಾ? Completed topics, notes, quiz scores clear ಆಗುತ್ತವೆ.',
  importConfirm: 'ಈ backup import ಮಾಡಬೇಕಾ? Current progress replace ಆಗುತ್ತದೆ.',
  importError: 'Import ಆಗಲಿಲ್ಲ: ',
  invalidJson: 'valid JSON file ಅಲ್ಲ.',
  loading: 'Loading...',
  syncingProgress: 'ನಿಮ್ಮ progress sync ಆಗುತ್ತಿದೆ...',
  footerSync: 'Progress Firebase ಗೆ sync ಆಗಿದೆ - local ಆಗಿಯೂ cache ಆಗಿದೆ.',
  builtWith: 'Built with',
  inKundapura: 'Kundapura ನಲ್ಲಿ',
  notesFor: 'Notes -',
  notesPlaceholder:
    'Questions, links, snippets, study reminders ಏನಾದರೂ ಇಲ್ಲಿ note ಮಾಡಿ...',
  notesSaved: 'Browser ನಲ್ಲಿ automatically save ಆಗುತ್ತದೆ.',
  moduleQuiz: 'Module Quiz',
  pickBestAnswer: 'Best answer ಆಯ್ಕೆ ಮಾಡಿ.',
  lastAttempt: 'Last attempt',
  submitAnswers: 'Answers submit ಮಾಡಿ',
  perfectScore: 'Perfect - ಎಲ್ಲಾ questions correct!',
  solidScore: 'Solid work - concepts mostly lock ಆಗಿವೆ.',
  reviewScore: 'ಮೇಲಿನ topics review ಮಾಡಿ ಮತ್ತೆ try ಮಾಡಿ.',
  retake: 'ಮತ್ತೆ try ಮಾಡಿ',
  tools: 'Tools',
  buildBlueprintAvailable: 'Build blueprint available',
  hide: 'Hide',
  functionalRequirements: 'Functional requirements',
  technicalImplementation: 'Technical implementation',
  claudePrompts: 'Claude Code prompts (copy-paste in order)',
  copy: 'Copy',
  copied: 'Copied',
  copyAll: 'Copy all',
  finalDeliverable: 'Final deliverable',
  promptHint:
    'Paste each prompt into Claude Code in order. Wait for it to finish before sending the next - each step builds on the last.',
  exportTitle: 'ನಿಮ್ಮ progress JSON backup download ಮಾಡಿ',
  importTitle: 'JSON backup ನಿಂದ progress restore ಮಾಡಿ',
}

export const moduleCopyKn = {
  m0: {
    title: 'Python Bootcamp',
    description:
      'Python setup, syntax, control flow, functions, files - coding ಗೆ ಬೇಕಾದ foundation ಇಲ್ಲಿ build ಆಗುತ್ತದೆ.',
  },
  m1: {
    title: 'Python for Data Science',
    description:
      'NumPy, Pandas, Matplotlib, Seaborn, scraping - data work ಗೆ ಬೇಕಾದ core Python stack.',
  },
  m2: {
    title: 'Statistics & Machine Learning',
    description:
      'Statistics, linear algebra, EDA, classic ML models, evaluation, tuning - ML intuition ಇಲ್ಲಿ strong ಆಗುತ್ತದೆ.',
  },
  m3: {
    title: 'Generative AI & Agentic AI',
    description:
      'Transformers, LLMs, prompt engineering, LangChain, RAG, agents, GANs, VAEs - GenAI product thinking.',
  },
  m4: {
    title: 'Data Visualization & Analysis',
    description:
      'SQL, MongoDB, Power BI, big data, time series, Tableau - data story ಮತ್ತು dashboard skills.',
  },
  m5: {
    title: 'AI Tools & Deployment',
    description:
      'Deep learning, NLP, computer vision, RL, APIs, Docker, cloud deployment - model ಅನ್ನು real users ಗೆ ತಲುಪಿಸುವುದು.',
  },
  m6: {
    title: 'Data Structures & Algorithms',
    description:
      'Arrays, linked lists, trees, graphs, sorting, DP, greedy - interviews ಮತ್ತು efficient coding ಗೆ DSA base.',
  },
}

export function useUiText() {
  const { lang } = useLang()
  return lang === 'kn' ? kn : en
}

export function useIsKannada() {
  const { lang } = useLang()
  return lang === 'kn'
}

export function getModuleCopy(module, isKannada) {
  if (!isKannada) return { title: module.title, description: module.description }
  return moduleCopyKn[module.id] ?? {
    title: module.title,
    description: module.description,
  }
}
