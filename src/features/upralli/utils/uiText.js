import { useLang } from '../contexts/LanguageContext.jsx'
import { moduleCopyKn, sectionTitleKn } from '../data/translations_kn.js'

const en = {
  appTitle: 'Pooja Register Desktop App Tutorial',
  heroEyebrow: 'Electron + TypeScript + Prisma + bundled PostgreSQL, Coastal Karnataka-flavoured',
  heroTitlePrefix: 'Build a Pooja Register Desktop App by',
  heroDescription:
    'Track every topic, project, and quiz across the full 10-module curriculum — from TypeScript and electron-vite setup to a real offline desktop app with Prisma over a PostgreSQL database bundled inside the installer, a TanStack Table register grid, Kannada data entry, ₹ collection totals, JSON backups, PDF export, and a Windows installer with a keep-or-delete-data uninstall prompt.',
  overallProgress: 'Overall progress',
  moduleProgress: 'Module progress',
  dashboard: 'Dashboard',
  modules: 'Modules',
  topics: 'Topics',
  projects: 'Projects',
  quiz: 'Quiz',
  flowDiagram: 'Flow diagram',
  notes: 'Notes',
  hours: 'Hours',
  progress: 'Progress',
  export: 'Export',
  import: 'Import',
  resetAllProgress: 'Reset all progress',
  signOut: 'Sign out',
  learner: 'Learner',
  backToDashboard: 'Back to dashboard',
  searchPlaceholder: 'Search topics — title or content...',
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
  footerSync: 'Progress syncs to your Google account — export anytime for a manual backup.',
  builtWith: 'Built with',
  inKundapura: 'in Kundapura',
  footerCredit: '',
  notesFor: 'Notes for',
  notesPlaceholder:
    'Jot down anything: questions, links, snippets, study reminders...',
  notesSaved: 'Saved automatically to your browser.',
  moduleQuiz: 'Module Quiz',
  pickBestAnswer: 'Pick the best answer.',
  lastAttempt: 'Last attempt',
  submitAnswers: 'Submit answers',
  perfectScore: 'Perfect — you nailed every question.',
  solidScore: 'Solid work — most concepts locked in.',
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
    'Paste each prompt into Claude Code in order. Wait for it to finish before sending the next — each step builds on the last.',
  exportTitle: 'Download a JSON backup of your progress',
  importTitle: 'Restore progress from a JSON backup',
  loginEyebrow: 'Sign in to track your progress',
  loginTitle: 'Pooja Register Desktop App Tutorial',
  loginSubtitle:
    'Sign in with Google to save your topics, notes, and quiz results across devices — an offline pooja/donor register, built with Electron + TypeScript + Prisma + a bundled PostgreSQL.',
  continueWithGoogle: 'Continue with Google',
  signingIn: 'Signing you in...',
  loginError: 'Could not sign in: ',
  loginPrivacy:
    'We only use your Google profile (name, email, photo) to label your progress. Nothing else.',
  loadingAuth: 'Checking sign-in...',
  heroPill: 'Structured · Hands-on · Offline-first',
  heroH1Prefix: 'Build a real',
  heroH1Highlight: 'Pooja Register',
  heroH1Suffix: 'desktop app',
  heroLead:
    'A structured, hands-on curriculum that walks you from TypeScript basics to a production Electron + React desktop app with Prisma over a bundled PostgreSQL database, a TanStack Table grid, Kannada data entry, and a Windows installer.',
  heroLeadStrong: 'No paywalls. Ever.',
  badgeFreeLine1: 'COMPLETELY',
  badgeFreeLine2: 'FREE',
  badgeFreeLine3: 'COURSE',
  featTopicsTitle: 'Topics',
  featTopicsBody: 'TypeScript setup to a packaged installer — structured step-by-step.',
  featCurriculumTitle: 'Real-app Curriculum',
  featCurriculumBody: 'electron-vite, Prisma, bundled PostgreSQL, TanStack Table, Kannada, backups & packaging.',
  featQuizzesTitle: 'Quizzes & Projects',
  featQuizzesBody: 'Test understanding with a real pooja/donor register build.',
  featCloudTitle: 'Cloud Progress',
  featCloudBody: 'Synced across all your devices automatically.',
  featFreeTitle: 'Fast & Free',
  featFreeBody: 'No paywalls — learn at your own pace.',
  loginWelcome: 'Welcome back',
  loginCardSubtitle:
    'Sign in to sync your progress across all your devices and continue where you left off.',
  statTopicsLabel: 'Topics',
  statFreeLabel: 'Free',
  statAccessLabel: 'Access',
  statAccessValue: 'Unlimited',
  loginTrust1: 'Auto-synced across all your devices',
  loginTrust2: 'No paywalls — fully open access',
  loginTrust3: 'Privacy-first — only profile basics',
  loginCardFootnote: 'Progress stored securely in Firebase · Never shared',
}

const kn = en

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
  const copy = moduleCopyKn[module.id] ?? {
    title: module.title,
    description: module.description,
  }
  return {
    title: module.title,
    description: copy.description,
  }
}

export function getSectionTitle(section, isKannada) {
  return section.title
}
