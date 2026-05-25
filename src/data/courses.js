import { Smartphone, Sparkles, ChefHat } from 'lucide-react'

export const courses = [
  {
    id: 'flutter',
    title: 'Flutter & Dart',
    tagline: 'Build production mobile apps from scratch',
    description:
      'A 7-module deep dive into Dart fundamentals, Flutter widgets, state management, networking, and shipping real apps to the Play Store and App Store.',
    level: 'Beginner → Advanced',
    durationHours: 60,
    modulesCount: 7,
    accent: 'from-sky-500/20 via-cyan-500/10 to-blue-500/20',
    accentBorder: 'border-sky-500/40',
    accentText: 'text-sky-300',
    glow: 'hover:shadow-glow-cyan',
    icon: Smartphone,
    skills: ['Dart 3', 'Widgets', 'State management', 'Firebase', 'Publishing'],
    routePlay: '/courses/flutter/learn',
  },
  {
    id: 'genai',
    title: 'GenAI & ML',
    tagline: 'From neural net basics to shipping LLM apps',
    description:
      'Hands-on path through ML foundations, transformers, prompt engineering, RAG, agents, and deploying production GenAI features.',
    level: 'Beginner → Advanced',
    durationHours: 80,
    modulesCount: 8,
    accent: 'from-fuchsia-500/20 via-purple-500/10 to-violet-500/20',
    accentBorder: 'border-fuchsia-500/40',
    accentText: 'text-fuchsia-300',
    glow: 'hover:shadow-glow-fuchsia',
    icon: Sparkles,
    skills: ['Python', 'PyTorch', 'Transformers', 'RAG', 'Agents'],
    routePlay: '/courses/genai/learn',
  },
  {
    id: 'catering',
    title: 'Build Catering Management app for Local Catering Owners',
    tagline: 'A real Flutter + Firebase Android app, taught the Kundapura way',
    description:
      'A 10-module deep dive that builds a production catering management Android app from scratch — Dart fundamentals, Firebase Auth, Firestore data layer, event lifecycle, invoicing with PDFs, Cloud Functions, and Play Store publishing. Every topic ships with a Karnataka-flavoured analogy, a Mermaid diagram, and real code from the Chittoor Catering app.',
    level: 'Beginner → Advanced',
    durationHours: 85,
    modulesCount: 10,
    accent: 'from-orange-500/20 via-amber-500/10 to-yellow-500/20',
    accentBorder: 'border-orange-500/40',
    accentText: 'text-orange-300',
    glow: 'hover:shadow-glow-orange',
    icon: ChefHat,
    skills: ['Dart 3', 'Flutter', 'Firestore', 'Cloud Functions', 'PDF & FCM', 'Play Store'],
    routePlay: '/courses/catering/learn',
  },
]

export const courseById = (id) => courses.find((c) => c.id === id)
