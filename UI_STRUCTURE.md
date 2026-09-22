# Course UI Structure Guide

A standardized UI pattern for building courses in the Thanthrajnaani portfolio. This document covers the component hierarchy, layouts, interactions, and styling used across all courses.

---

## Table of Contents

1. [Overall App Structure](#overall-app-structure)
2. [Component Hierarchy](#component-hierarchy)
3. [Page Layouts](#page-layouts)
4. [Component Details](#component-details)
5. [Styling Patterns](#styling-patterns)
6. [Interactions & State](#interactions--state)
7. [Color Accent System](#color-accent-system)
8. [Responsive Design](#responsive-design)

---

## Overall App Structure

Every course follows this root structure:

```
App (top-level wrapper)
├── Authentication Layer (AuthContext)
├── Language Layer (LanguageContext)
├── Two Main Views
│   ├── Dashboard View (module overview)
│   └── Module View (topic detail)
└── Sidebar (persistent navigation)
```

### App.jsx Template

```jsx
import { useState } from 'react'
import { curriculum } from './data/curriculum.js'
import useProgress from './hooks/useProgress.js'
import { useAuth } from './contexts/AuthContext.jsx'

export default function App() {
  const { user, loading, signOut } = useAuth()
  const progress = useProgress(user?.uid)
  
  const [view, setView] = useState('dashboard')  // 'dashboard' | 'module'
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [jumpTopicId, setJumpTopicId] = useState(null)
  
  if (loading || !user) {
    return <LoginPage />
  }

  const activeModule = view === 'module' 
    ? curriculum.modules.find(m => m.id === activeModuleId)
    : null

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar 
        curriculum={curriculum}
        activeView={view}
        activeModuleId={activeModuleId}
        onSelect={(which, moduleId) => handleSidebarSelect(which, moduleId)}
      />
      
      <main className="flex-1">
        {view === 'dashboard' && (
          <Dashboard 
            moduleProgress={progress.moduleProgress}
            overall={progress.overallProgress(curriculum.modules)}
            onOpenModule={(moduleId) => goModule(moduleId)}
          />
        )}
        
        {view === 'module' && activeModule && (
          <ModulePage
            module={activeModule}
            isTopicDone={progress.isTopicDone}
            toggleTopic={progress.toggleTopic}
            moduleProgress={progress.moduleProgress}
            getNote={progress.getNote}
            setNote={progress.setNote}
            getQuizResult={progress.getQuizResult}
            setQuizResult={progress.setQuizResult}
            onBack={() => goDashboard()}
            jumpTopicId={jumpTopicId}
            onJumpHandled={() => setJumpTopicId(null)}
          />
        )}
      </main>
    </div>
  )
}
```

---

## Component Hierarchy

### 1. **Sidebar** (Left Navigation)
The persistent left sidebar that stays visible on desktop.

**Structure:**
```
Sidebar
├── User Profile Card (avatar, name, email)
├── Sign Out Button
├── Search Bar
├── Language Switcher
├── Dashboard Link
└── Module Links (list)
    ├── Module 0
    ├── Module 1
    ├── ... (m0 through m9)
    └── Each shows progress bar + topic count
```

**Props:**
```jsx
{
  curriculum,           // the full curriculum object
  activeView,          // 'dashboard' | 'module'
  activeModuleId,      // current module being viewed
  onSelect,            // (which: 'dashboard'|'module', moduleId) => void
  progress,            // module progress data
}
```

**Key Features:**
- Collapses on mobile (hamburger menu)
- Shows current progress per module
- Highlights active module
- Search filters all topics across all modules

---

### 2. **Dashboard** (Home View)
The main overview page showing all modules and overall progress.

**Structure:**
```
Dashboard
├── Hero Section
│   ├── Welcome message ("Thanthrajnaani")
│   ├── Course subtitle/description
│   └── Overall Progress Bar
│       ├── Label: "X / Y topics (Z%)"
│       └── Progress indicator
│
├── Stats Row (4 columns)
│   ├── Modules count + icon
│   ├── Topics count + icon
│   ├── Projects count + icon
│   └── Hours + icon
│
└── Module Grid (3 columns on desktop, 1 on mobile)
    └── ModuleCard (repeat for each module)
        ├── Colored top bar (module accent color)
        ├── Module title
        ├── Description (2-3 lines)
        ├── Stats: X topics, Yh hours
        ├── Progress bar
        └── "Open Module" button
```

**CSS Classes:**
```css
/* Hero section */
.hero {
  @apply rounded-2xl border border-zinc-200 bg-zinc-50 p-6 md:p-8;
}

/* Stats cards */
.stat-card {
  @apply card p-4 flex items-center gap-3;
}

.stat-icon {
  @apply w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center;
}

/* Module grid */
.module-grid {
  @apply grid sm:grid-cols-2 xl:grid-cols-3 gap-4;
}

.module-card {
  @apply card border border-zinc-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition;
}

.module-accent-bar {
  @apply h-1 rounded-full mb-3;  /* bg-{color}-500 from module.accent */
}
```

---

### 3. **ModulePage** (Detail View)
Displays a single module with multiple tabs: Topics, Projects, Quiz, Notes.

**Structure:**
```
ModulePage
├── Header
│   ├── Back button
│   ├── Module title
│   ├── Stats: X topics, Y hours, Z% progress
│   └── Module icon
│
├── Tab Navigation (4 tabs)
│   ├── Topics (with checkmark icon)
│   ├── Projects (with briefcase icon)
│   ├── Quiz (with trophy icon)
│   └── Notes (with notebook icon)
│
└── Tab Content (only one visible at a time)
    ├── Topics Tab
    │   └── Section List
    │       └── TopicItem[] (collapsible)
    │
    ├── Projects Tab
    │   └── ProjectCard[] (image + title + link)
    │
    ├── Quiz Tab
    │   └── QuizPanel (Q&A form)
    │
    └── Notes Tab
        └── Textarea (auto-save)
```

**Props:**
```jsx
{
  module,              // current module object
  isTopicDone,        // (topicId) => boolean
  toggleTopic,        // (topicId, isDone) => void
  moduleProgress,     // (module) => { done, total, pct }
  getNote,            // (moduleId) => string
  setNote,            // (moduleId, note) => void
  getQuizResult,      // (moduleId) => object
  setQuizResult,      // (moduleId, result) => void
  onBack,             // () => void
  jumpTopicId,        // auto-scroll to this topic
}
```

**Tab Navigation Code:**
```jsx
const tabs = [
  { id: 'topics', labelKey: 'topics', icon: ListChecks },
  { id: 'projects', labelKey: 'projects', icon: Briefcase },
  { id: 'quiz', labelKey: 'quiz', icon: Trophy },
  { id: 'notes', labelKey: 'notes', icon: NotebookPen },
]

<div className="flex border-b border-zinc-200 gap-4 mb-6">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setTab(tab.id)}
      className={`pb-2 px-1 border-b-2 transition flex items-center gap-2 text-sm ${
        tab === 'active' 
          ? 'border-accent-500 text-accent-600 font-semibold'
          : 'border-transparent text-zinc-600 hover:text-zinc-900'
      }`}
    >
      <tab.icon className="w-4 h-4" />
      {L[tab.labelKey]}
    </button>
  ))}
</div>
```

---

### 4. **TopicItem** (Individual Topic Card)
A collapsible card showing one topic's full content.

**Structure:**
```
TopicItem (collapsible)
├── Header (clickable to expand)
│   ├── Checkbox (mark complete/incomplete)
│   ├── Topic title
│   ├── Brief explanation (1-2 lines)
│   └── Chevron icon (expanded/collapsed state)
│
└── Content (hidden by default, shown on expand)
    ├── Section: Explain
    ├── Section: Think of it like... (analogy)
    ├── Section: The full story (theory)
    ├── Section: Why this matters
    ├── Section: Step-by-step (numbered list)
    ├── Section: Example (code block)
    ├── Section: Watch out for (pitfalls)
    ├── Section: Try it yourself
    ├── Section: Key takeaway (highlighted)
    └── Action buttons
        ├── Mark complete/incomplete
        └── Delete note
```

**CSS Sections:**
```css
.topic-item {
  @apply border border-zinc-200 rounded-lg mb-3 overflow-hidden hover:shadow-sm transition;
}

.topic-header {
  @apply p-4 bg-white cursor-pointer hover:bg-zinc-50 flex items-start gap-3;
}

.topic-content {
  @apply px-4 pb-4 bg-zinc-50 space-y-4;
}

.topic-section {
  @apply border-l-2 border-zinc-200 pl-4 py-2;
}

.section-icon {
  @apply inline-flex items-center gap-2 text-accent-600 font-semibold text-sm uppercase tracking-wider mb-2;
}

.code-block {
  @apply bg-zinc-800 text-zinc-100 p-3 rounded text-xs font-mono overflow-x-auto;
}

.formula {
  @apply bg-blue-50 border-l-4 border-blue-400 p-3 rounded font-mono text-sm;
}
```

**Rendering Logic for Inline Markdown:**
```jsx
// Parse **bold** and `code` within text
function renderInline(line) {
  const parts = []
  let i = 0
  
  while (i < line.length) {
    if (line[i] === '*' && line[i + 1] === '*') {
      const end = line.indexOf('**', i + 2)
      parts.push(<strong>{line.slice(i + 2, end)}</strong>)
      i = end + 2
    } else if (line[i] === '`') {
      const end = line.indexOf('`', i + 1)
      parts.push(<code className="bg-zinc-100 px-1 rounded">{line.slice(i + 1, end)}</code>)
      i = end + 1
    } else {
      // regular text
      const nextSpecial = Math.min(
        line.indexOf('**', i) === -1 ? line.length : line.indexOf('**', i),
        line.indexOf('`', i) === -1 ? line.length : line.indexOf('`', i)
      )
      parts.push(line.slice(i, nextSpecial))
      i = nextSpecial
    }
  }
  return parts
}
```

---

### 5. **ProjectCard**
Displays a single project with image, title, description, and external link.

**Structure:**
```
ProjectCard
├── Project image (or placeholder)
├── Title
├── Description (2-3 lines)
├── Technologies/tools badge list
└── "View Project" link button
```

**Example:**
```jsx
function ProjectCard({ project }) {
  return (
    <a href={project.link} target="_blank" className="card rounded-lg overflow-hidden hover:shadow-lg transition">
      {project.image && (
        <img src={project.image} alt={project.title} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-zinc-900">{project.title}</h3>
        <p className="text-sm text-zinc-600 mt-1">{project.description}</p>
        <div className="flex gap-2 flex-wrap mt-3">
          {project.tools?.map(tool => (
            <span key={tool} className="text-xs bg-accent-50 text-accent-700 px-2 py-1 rounded">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </a>
  )
}
```

---

### 6. **QuizPanel**
Interactive quiz with multiple-choice or text answers.

**Structure:**
```
QuizPanel
├── Question display
├── Answer options
│   ├── Radio buttons / Checkboxes / Text input
│   └── Show feedback (correct/incorrect)
├── Submit button
└── Results summary (if answered)
    ├── Score / Correct answer
    └── Explanation
```

---

### 7. **LoginPage**
Simple Firebase auth page with Google sign-in.

**Structure:**
```
LoginPage (centered)
├── Logo / Branding
├── "Sign in with Google" button
└── Loading state during auth
```

---

### 8. **MermaidDiagram**
Renders flowcharts/diagrams from code blocks.

**Usage in topics:**
```javascript
{
  id: 'm1-t2',
  title: 'App Architecture',
  theory: 'Here is how the app flows...',
  diagram: `graph LR
    A[User] -->|Google Sign-In| B[Firebase Auth]
    B -->|Token| C[Firestore]
    C -->|Data| D[UI]`
}
```

**Component:**
```jsx
import mermaid from 'mermaid'

function MermaidDiagram({ code }) {
  const ref = useRef(null)
  
  useEffect(() => {
    mermaid.contentLoaded()
  }, [code])
  
  return <div ref={ref} className="mermaid">{code}</div>
}
```

---

## Page Layouts

### Dashboard Layout (Full Width)

```
┌─────────────────────────────────────────────────┐
│ SIDEBAR  │  DASHBOARD                          │
│          ├──────────────────────────────────────┤
│ - Module │ [HERO SECTION]                      │
│   0      │ Welcome to Thanthrajnaani            │
│ - Module │ [Progress bar]                      │
│   1      ├──────────────────────────────────────┤
│ - Module │ [STAT CARDS: Modules, Topics, ...]  │
│   2      ├──────────────────────────────────────┤
│   ...    │ [MODULE GRID - 3 columns]           │
│          │  ┌──────────┐ ┌──────────┐ ┌──────┐│
│          │  │ Module 0 │ │ Module 1 │ │  M2 ││
│          │  └──────────┘ └──────────┘ └──────┘│
│          │  ┌──────────┐ ┌──────────┐ ┌──────┐│
│          │  │ Module 3 │ │ Module 4 │ │  M5 ││
│          │  └──────────┘ └──────────┘ └──────┘│
└─────────────────────────────────────────────────┘
```

### Module Page Layout (Full Width)

```
┌─────────────────────────────────────────────────┐
│ SIDEBAR  │  MODULE PAGE                        │
│          ├──────────────────────────────────────┤
│ [Back]   │ [Back] Module Title  [Stats]        │
│          ├──────────────────────────────────────┤
│ - Topics │ [TAB NAVIGATION: Topics | Projects |│
│ - Project│  Quiz | Notes]                      │
│ - Quiz   ├──────────────────────────────────────┤
│ - Notes  │ [TAB CONTENT]                       │
│          │                                      │
│          │ For Topics Tab:                      │
│          │ ┌────────────────────────────────┐  │
│          │ │ [▼] Section 1                  │  │
│          │ │  ┌─────────────────────────┐   │  │
│          │ │  │ Topic 1 [explain]       │   │  │
│          │ │  │ > Click to expand       │   │  │
│          │ │  └─────────────────────────┘   │  │
│          │ │  ┌─────────────────────────┐   │  │
│          │ │  │ Topic 2 [explain]       │   │  │
│          │ │  │ > Click to expand       │   │  │
│          │ │  └─────────────────────────┘   │  │
│          │ └────────────────────────────────┘  │
│          │                                      │
└─────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌──────────────────────┐
│ [☰] Module Title [v] │
├──────────────────────┤
│ [TAB NAVIGATION]     │
├──────────────────────┤
│ [TAB CONTENT]        │
│                      │
│ ┌──────────────────┐ │
│ │ [Topic 1]        │ │
│ │ >Click to expand │ │
│ └──────────────────┘ │
│ ┌──────────────────┐ │
│ │ [Topic 2]        │ │
│ │ >Click to expand │ │
│ └──────────────────┘ │
│                      │
└──────────────────────┘
```

---

## Styling Patterns

### Base Classes (Tailwind + Custom)

```css
/* Card styling */
.card {
  @apply bg-white border border-zinc-200 rounded-lg shadow-sm;
}

.card:hover {
  @apply shadow-md;
}

/* Backgrounds */
.bg-accent-50 { @apply bg-orange-50; }
.bg-accent-100 { @apply bg-orange-100; }
.bg-accent-200 { @apply bg-orange-200; }
.text-accent-600 { @apply text-orange-600; }
.text-accent-700 { @apply text-orange-700; }
.border-accent-200 { @apply border-orange-200; }

/* Typography */
.title-lg { @apply text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight; }
.title-md { @apply text-lg font-semibold text-zinc-900; }
.label { @apply text-xs uppercase font-semibold tracking-widest text-zinc-600; }
.muted { @apply text-zinc-500; }

/* Spacing */
.space-y-section { @apply space-y-8; }
.p-section { @apply p-6 md:p-8; }

/* States */
.disabled { @apply opacity-50 cursor-not-allowed; }
.active { @apply border-accent-500 text-accent-600 font-semibold; }
.inactive { @apply border-transparent text-zinc-600; }
```

### Module Accent Colors

Each module gets a unique gradient and accent color:

```javascript
const moduleColors = {
  m0: { color: 'from-emerald-500/20 to-emerald-700/10', accent: 'emerald' },
  m1: { color: 'from-sky-500/20 to-sky-700/10', accent: 'sky' },
  m2: { color: 'from-violet-500/20 to-violet-700/10', accent: 'violet' },
  m3: { color: 'from-orange-500/20 to-orange-700/10', accent: 'orange' },
  m4: { color: 'from-cyan-500/20 to-cyan-700/10', accent: 'cyan' },
  m5: { color: 'from-rose-500/20 to-rose-700/10', accent: 'rose' },
  m6: { color: 'from-yellow-500/20 to-yellow-700/10', accent: 'yellow' },
  m7: { color: 'from-indigo-500/20 to-indigo-700/10', accent: 'indigo' },
  m8: { color: 'from-lime-500/20 to-lime-700/10', accent: 'lime' },
  m9: { color: 'from-pink-500/20 to-pink-700/10', accent: 'pink' },
}

// Applied to module cards
<div className={`bg-gradient-to-br ${module.color}`}>
  <div className={`h-1 rounded-full bg-${module.accent}-500`} />
</div>
```

### Progress Indicators

```jsx
// Simple progress bar
<div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
  <div 
    className="h-full bg-accent-500 transition-all duration-500"
    style={{ width: `${percentage}%` }}
  />
</div>

// Module card progress
<div className="mt-3 space-y-1">
  <div className="flex justify-between text-xs text-zinc-600">
    <span>{completed} / {total} topics</span>
    <span className="font-semibold text-zinc-900">{percent}%</span>
  </div>
  <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
    <div 
      className={`h-full bg-${module.accent}-500`}
      style={{ width: `${percent}%` }}
    />
  </div>
</div>
```

---

## Interactions & State

### View State Management

```jsx
// Track which view is active
const [view, setView] = useState('dashboard')  // 'dashboard' | 'module'
const [activeModuleId, setActiveModuleId] = useState(null)
const [sidebarOpen, setSidebarOpen] = useState(false)  // mobile only

// Navigation helpers
const goDashboard = () => {
  setView('dashboard')
  setActiveModuleId(null)
  window.scrollTo({ top: 0 })
}

const goModule = (moduleId, jumpTopicId = null) => {
  setActiveModuleId(moduleId)
  setView('module')
  setJumpTopicId(jumpTopicId)
  window.scrollTo({ top: 0 })
}
```

### Topic Completion

```jsx
// Toggle topic complete/incomplete
const toggleTopic = (topicId, isDone) => {
  // Update local state
  setCompletedTopics(prev => 
    isDone 
      ? new Set([...prev, topicId])
      : new Set([...prev].filter(id => id !== topicId))
  )
  // Sync to Firebase
  saveProgress(userId, { completedTopics })
}

// Check if topic is done
const isTopicDone = (topicId) => completedTopics.has(topicId)

// Calculate module progress
const moduleProgress = (module) => {
  const allTopics = module.sections.flatMap(s => s.topics)
  const done = allTopics.filter(t => isTopicDone(t.id)).length
  const total = allTopics.length
  return {
    done,
    total,
    pct: Math.round((done / total) * 100)
  }
}
```

### Tab Switching

```jsx
const [tab, setTab] = useState('topics')  // 'topics' | 'projects' | 'quiz' | 'notes'

// Reset to topics when module changes
useEffect(() => {
  setTab('topics')
}, [module.id])

// Render content based on tab
{tab === 'topics' && <TopicsContent module={module} />}
{tab === 'projects' && <ProjectsContent module={module} />}
{tab === 'quiz' && <QuizContent module={module} />}
{tab === 'notes' && <NotesContent module={module} />}
```

### Section Expansion

```jsx
// Track which sections are open
const [openSections, setOpenSections] = useState(
  Object.fromEntries(module.sections.map(s => [s.id, true]))
)

// Toggle section open/close
const toggleSection = (sectionId) => {
  setOpenSections(prev => ({
    ...prev,
    [sectionId]: !prev[sectionId]
  }))
}

// Render section
<div key={section.id}>
  <button 
    onClick={() => toggleSection(section.id)}
    className="w-full text-left p-3 hover:bg-zinc-50"
  >
    <ChevronDown 
      className={`transition ${openSections[section.id] ? '' : '-rotate-90'}`}
    />
    {section.title}
  </button>
  
  {openSections[section.id] && (
    <div className="px-4 pb-4 space-y-4">
      {section.topics.map(topic => (
        <TopicItem key={topic.id} topic={topic} />
      ))}
    </div>
  )}
</div>
```

---

## Color Accent System

### Primary Accent (Orange)

Used for:
- Main accent elements (buttons, links, active states)
- Progress bars
- Highlights in text
- Primary CTA buttons

```css
--accent: #f97316;  /* orange-500 */

.accent-600 { color: #ea580c; }
.accent-700 { color: #c2410c; }
.bg-accent-50 { background: #fff7ed; }
.bg-accent-500 { background: #f97316; }
.border-accent-200 { border-color: #fed7aa; }
```

### Module Accent Colors (7 colors)

Each module gets one:
- **emerald** (m0)
- **sky** (m1)
- **violet** (m2)
- **orange** (m3)
- **cyan** (m4)
- **rose** (m5)
- **yellow** (m6)

Used in:
- Module card gradient backgrounds
- Progress bar color
- Section header icons

```javascript
const accentBar = {
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500',
  rose: 'bg-rose-500',
  yellow: 'bg-yellow-500',
}
```

### Neutral Colors

- **Text**: `zinc-900` (titles), `zinc-600` (body), `zinc-500` (muted)
- **Borders**: `zinc-200` (primary), `zinc-100` (light)
- **Backgrounds**: `white` (primary), `zinc-50` (secondary), `zinc-100` (tertiary)

---

## Responsive Design

### Breakpoints (Tailwind)

```
Mobile:  < 640px   (default, sm:)
Tablet:  640px     (md:)
Desktop: 768px     (lg:)
XL:      1024px    (xl:)
2XL:     1280px    (2xl:)
```

### Responsive Components

#### Sidebar
```jsx
// Desktop: fixed left sidebar
// Mobile: collapsible hamburger menu
<nav className="hidden lg:block w-64 fixed left-0 h-screen bg-white border-r border-zinc-200 p-4">
  {/* Sidebar content */}
</nav>

// Mobile hamburger button
<button className="lg:hidden p-2">
  <Menu className="w-5 h-5" />
</button>
```

#### Dashboard Grid
```jsx
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 3 columns
<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
  {modules.map(module => <ModuleCard key={module.id} module={module} />)}
</div>
```

#### Module Cards
```jsx
// Mobile: full width with padding
// Desktop: fixed width in grid
<div className="grid sm:grid-cols-2 xl:grid-cols-3">
  <div className="rounded-lg p-4">
    {/* Card content */}
  </div>
</div>
```

#### Typography
```jsx
// Responsive heading
<h1 className="text-2xl md:text-3xl font-bold">
  {L.heroTitlePrefix} <span className="text-accent-600">Thanthrajnaani</span>
</h1>

// Responsive spacing
<div className="p-6 md:p-8 space-y-4 md:space-y-6">
  {/* Content */}
</div>
```

---

## Common Patterns

### Loading State

```jsx
{authLoading || !user ? (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex items-center gap-3 text-sm text-zinc-500">
      <Loader2 className="w-4 h-4 animate-spin" />
      Loading...
    </div>
  </div>
) : (
  <App />
)}
```

### Empty State

```jsx
{items.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-zinc-500">No items found</p>
  </div>
) : (
  <div className="space-y-4">
    {items.map(item => (...))}
  </div>
)}
```

### Search Filtering

```jsx
const [search, setSearch] = useState('')

const filtered = topics.filter(t =>
  t.title.toLowerCase().includes(search.toLowerCase()) ||
  t.explain.toLowerCase().includes(search.toLowerCase())
)
```

### Auto-scroll to Topic

```jsx
useEffect(() => {
  if (!jumpTopicId) return
  
  const element = document.getElementById(`topic-${jumpTopicId}`)
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  
  onJumpHandled()
}, [jumpTopicId])
```

---

## Summary

This UI structure provides:

✅ **Consistency** — All courses follow the same layout pattern  
✅ **Modularity** — Each component is independent and reusable  
✅ **Responsiveness** — Works on mobile, tablet, desktop  
✅ **Accessibility** — Semantic HTML, icons + labels, keyboard navigation  
✅ **Performance** — Lazy loading, code splitting, Firebase caching  
✅ **Extensibility** — Easy to add new tabs, sections, or features  

Use this guide as your template when building any new course!
