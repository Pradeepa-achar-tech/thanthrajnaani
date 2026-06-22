import { Smartphone, Sparkles, ReceiptText, Hotel } from 'lucide-react'

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
    icon: Sparkles,
    skills: ['Python', 'PyTorch', 'Transformers', 'RAG', 'Agents'],
    routePlay: '/courses/genai/learn',
  },
  {
    id: 'billing',
    title: 'Build a Restaurant Billing App (POS)',
    tagline: 'A real Flutter + Firebase POS system, taught the coastal Karnataka way',
    description:
      'A 10-module deep dive that builds a production restaurant billing (POS) Android app from scratch — Flutter UI, Google Sign-In with role-based access, a Firestore menu + orders data layer, GST tax math, running orders, Bluetooth thermal printing, PDF invoices, Excel/ZIP exports, and admin analytics. Every topic ships with a coastal Karnataka analogy and real code from the TunMani Cafe billing app.',
    level: 'Beginner → Advanced',
    durationHours: 80,
    modulesCount: 10,
    icon: ReceiptText,
    skills: ['Dart 3', 'Flutter', 'Firestore', 'Provider', 'GST & PDF', 'Bluetooth POS'],
    routePlay: '/courses/billing/learn',
  },
  {
    id: 'resort',
    title: 'Build a Resort Management System',
    tagline: 'A real ASP.NET Core + PostgreSQL web app, taught the coastal Karnataka way',
    description:
      'A 10-module deep dive that builds a production resort + event-hall management web app from scratch with ASP.NET Core MVC & Web API — C# and Clean Architecture, PostgreSQL with Dapper, Google OAuth with role-based access, room & wedding-hall bookings, GST invoicing, payments, QuestPDF invoices, MailKit email, a CRM, reports, and cloud deployment. Every topic ships with a coastal Karnataka analogy and real code from the TunMani Resort app.',
    level: 'Beginner → Advanced',
    durationHours: 87,
    modulesCount: 10,
    icon: Hotel,
    skills: ['C# / .NET', 'ASP.NET Core', 'PostgreSQL & Dapper', 'Google OAuth', 'GST & QuestPDF', 'Deployment'],
    routePlay: '/courses/resort/learn',
  },
]

export const courseById = (id) => courses.find((c) => c.id === id)
