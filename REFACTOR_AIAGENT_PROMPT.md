# Refactor AI Agent Course to Standard UI Structure

Copy this entire prompt and paste it into Claude:

---

## Task: Refactor `src/features/aiagent/` to Match Standard Course UI Structure

I have a course called "AI Agent Visual Lab" at `src/features/aiagent/` that was built with a custom UI structure. I need to refactor it to match the standard course UI pattern used in other courses like `src/features/billing/`, `src/features/resort/`, `src/features/temple/`, etc.

### Reference Standards:
- **UI Structure Guide**: See `UI_STRUCTURE.md` in the repo root (defines components, layouts, styling, interactions)
- **Blueprint**: Billing course at `src/features/billing/` is the reference implementation
- **Target**: The aiagent course should have the same component hierarchy, layouts, and styling as other courses

### Current State:
The aiagent course at `src/features/aiagent/` exists but does NOT follow the standard pattern.

### Required Refactoring:

#### 1. Directory Structure
Create this structure (copy from billing if missing):

```
src/features/aiagent/
├── App.jsx                          # Main course player
├── index.css                        # Tailwind + custom styles
├── firebase.js                      # Firebase re-export
│
├── contexts/
│   ├── LanguageContext.jsx          # i18n provider
│   └── AuthContext.jsx              # Firebase auth
│
├── components/
│   ├── Dashboard.jsx                # Home screen with progress
│   ├── ModulePage.jsx               # Module view + tabs
│   ├── TopicItem.jsx                # Individual topic card
│   ├── Sidebar.jsx                  # Navigation + module list
│   ├── SearchBar.jsx                # Topic search
│   ├── LanguageSwitcher.jsx         # EN/KN toggle
│   ├── LoginPage.jsx                # Firebase auth UI
│   ├── ProjectCard.jsx              # Project display
│   ├── QuizPanel.jsx                # Quiz UI
│   └── MermaidDiagram.jsx           # Flowchart rendering
│
├── hooks/
│   └── useProgress.js               # Progress persistence
│
├── utils/
│   ├── uiText.js                    # i18n strings
│   └── userProfile.js               # User helpers
│
└── data/
    ├── curriculum.js                # Module imports + helpers
    ├── modules/
    │   ├── m0.js
    │   ├── m1.js
    │   ... through ...
    │   └── m11.js (or however many modules)
    │
    └── translations_kn.js           # Kannada translations (optional)
```

#### 2. Data Structure - curriculum.js

Must export a `curriculum` object with this structure:

```javascript
export const curriculum = {
  title: 'AI Agent Visual Lab by Thanthrajnaani',
  subtitle: 'A senior .NET engineer\'s path to production AI agents...',
  modules: [m0, m1, m2, ..., m11],
}

export const flattenTopics = (mods = curriculum.modules) =>
  (mods || []).flatMap((m) =>
    (m.sections || []).flatMap((s) =>
      (s.topics || []).map((t) => ({ ...t, moduleId: m.id, sectionId: s.id }))
    )
  )

export const getTotals = () => {
  let topics = 0
  let projects = 0
  let hours = 0
  for (const m of curriculum.modules) {
    hours += m.hours || 0
    projects += m.projects?.length || 0
    for (const s of m.sections || []) {
      topics += s.topics?.length || 0
    }
  }
  return { modules: curriculum.modules.length, topics, projects, hours }
}
```

#### 3. Module Structure (m0.js, m1.js, etc.)

Each module file must export a const like `m0`, `m1`, etc. with this structure:

```javascript
export const m0 = {
  id: 'm0',
  title: 'Module Title Here',
  hours: 8,  // or 10, 12, etc.
  color: 'from-emerald-500/20 to-emerald-700/10',  // gradient
  accent: 'emerald',  // one of: emerald, sky, violet, orange, cyan, rose, yellow
  description: 'Module overview text (2-3 sentences)',
  sections: [
    {
      id: 'm0-s1',
      title: 'Section Title',
      topics: [
        {
          id: 'm0-t1',
          title: 'Topic Title',
          explain: 'One sentence explanation',
          analogy: 'Paragraph: a relatable real-world comparison',
          theory: 'Detailed explanation using **bold** and `code`',
          whyItMatters: 'Career/practical relevance',
          steps: [
            'Step 1 description',
            'Step 2 description',
            '...',
          ],
          code: 'Multi-line code example or terminal output',
          pitfalls: [
            '**Problem name.** Description. Fix: solution.',
            '...',
          ],
          tryIt: 'Hands-on challenge/exercise',
          takeaway: 'One sentence memory-stick moment',
        },
        // ... more topics
      ],
    },
    // ... more sections
  ],
  projects: [
    {
      id: 'aiagent-proj-1',
      title: 'Project Name',
      description: 'What the student builds',
      image: '/path/to/image.png',  // optional
      link: 'https://github.com/...',
      tools: ['Tool1', 'Tool2', 'Tool3'],
    },
    // ... more projects
  ],
}
```

#### 4. App.jsx Structure

Must follow this pattern (copy from billing/App.jsx as template):

```javascript
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import ModulePage from './components/ModulePage.jsx'
import { curriculum } from './data/curriculum.js'
import useProgress from './hooks/useProgress.js'
import { useAuth } from './contexts/AuthContext.jsx'

export default function App() {
  const L = useUiText()
  const { user, loading: authLoading, signOut } = useAuth()
  const progress = useProgress(user?.uid)

  const [view, setView] = useState('dashboard')  // 'dashboard' | 'module'
  const [activeModuleId, setActiveModuleId] = useState(null)
  const [jumpTopicId, setJumpTopicId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [view, activeModuleId])

  const goDashboard = () => {
    setView('dashboard')
    setActiveModuleId(null)
    setSidebarOpen(false)
  }

  const goModule = (moduleId, topicId = null) => {
    setActiveModuleId(moduleId)
    setView('module')
    setJumpTopicId(topicId)
    setSidebarOpen(false)
  }

  const handleSidebarSelect = (which, moduleId) => {
    if (which === 'dashboard') goDashboard()
    else if (which === 'module') goModule(moduleId)
  }

  const activeModule =
    view === 'module' ? curriculum.modules.find((m) => m.id === activeModuleId) : null

  const overall = progress.overallProgress(curriculum.modules)

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-zinc-500">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar
        curriculum={curriculum}
        activeView={view}
        activeModuleId={activeModuleId}
        onSelect={handleSidebarSelect}
        user={user}
        onSignOut={() => signOut()}
      />

      <main className="flex-1 overflow-hidden">
        {view === 'dashboard' && (
          <Dashboard
            moduleProgress={progress.moduleProgress}
            overall={overall}
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
            onBack={goDashboard}
            jumpTopicId={jumpTopicId}
            onJumpHandled={() => setJumpTopicId(null)}
          />
        )}
      </main>
    </div>
  )
}
```

#### 5. Component Requirements

All these components must exist and follow the standard UI pattern (from UI_STRUCTURE.md):

- **Dashboard.jsx**: Hero section + stats cards + module grid (3 cols)
- **ModulePage.jsx**: Tab navigation (Topics | Projects | Quiz | Notes) + tab content
- **TopicItem.jsx**: Collapsible card with all 9 topic fields (explain, analogy, theory, etc.)
- **Sidebar.jsx**: User profile + navigation + search + language switcher
- **SearchBar.jsx**: Filter topics across all modules
- **LanguageSwitcher.jsx**: Toggle between English and Kannada
- **LoginPage.jsx**: Firebase Google sign-in
- **ProjectCard.jsx**: Display project with image, title, description, tools, link
- **QuizPanel.jsx**: Quiz Q&A with feedback
- **MermaidDiagram.jsx**: Render flowcharts from code

#### 6. Styling Requirements

Must use:
- **Tailwind CSS** for all layouts
- **Custom accent color**: orange (#f97316)
- **Module accents** (7 colors): emerald, sky, violet, orange, cyan, rose, yellow
- **Professional, clean light theme**: no gradients, no glow, no glass
- **Borders**: zinc-200, **text**: zinc-900/600/500, **bg**: white/zinc-50/zinc-100

See `UI_STRUCTURE.md` for detailed styling patterns.

#### 7. Progress Persistence (useProgress.js)

Must implement:
- `useProgress(userId)` hook
- Read/write to Firebase Realtime Database under `users/{userId}/progress`
- Track: completed topics, notes per module, quiz results
- Export these methods:
  - `isTopicDone(topicId)` → boolean
  - `toggleTopic(topicId, isDone)` → void
  - `moduleProgress(module)` → { done, total, pct }
  - `overallProgress(modules)` → { done, total, pct }
  - `getNote(moduleId)` / `setNote(moduleId, note)`
  - `getQuizResult(moduleId)` / `setQuizResult(moduleId, result)`
  - `reset()` → clear all progress

#### 8. LanguageContext & i18n

- Implement `LanguageContext.jsx` with `lang` state (default: 'en')
- Export `useUiText()` hook that returns UI string labels
- Optional: Add Kannada translations in `data/translations_kn.js`
- Cover these keys at minimum:
  - `topics`, `modules`, `projects`, `hours`, `loadingAuth`
  - `dashboard`, `moduleName`, `markComplete`, etc.

#### 9. AuthContext & Firebase

- Implement `AuthContext.jsx` with Firebase auth
- Export `useAuth()` hook that returns:
  - `user` (current Firebase user)
  - `loading` (auth state loading)
  - `signOut()` (logout function)
- Must support Google sign-in via `firebase_auth` + `google_sign_in`

#### 10. Registration in Main App

Once the aiagent course is refactored, it must be registered:

1. **In `src/App.jsx`**: Add a lazy import like:
   ```javascript
   const AiAgentPlayer = lazy(async () => {
     const [App, Lang] = await Promise.all([
       import('./features/aiagent/App.jsx'),
       import('./features/aiagent/contexts/LanguageContext.jsx'),
     ])
     const Wrapped = () => (
       <Lang.LanguageProvider>
         <App.default />
       </Lang.LanguageProvider>
     )
     return { default: Wrapped }
   })
   ```

2. **In `src/data/courses.js`**: Verify the course entry exists with all fields:
   ```javascript
   {
     id: 'aiagent',
     title: 'AI Agent Visual Lab',
     tagline: 'A senior .NET engineer\'s path to production AI agents',
     description: '...',
     level: 'Intermediate → Advanced',
     durationHours: 120,
     modulesCount: 12,
     icon: Braces,  // or appropriate icon
     skills: ['Python', 'LLMs', 'Agents', 'RAG', 'LangGraph', 'MCP', ...],
     routePlay: '/courses/aiagent/learn',
   }
   ```

3. **In `src/pages/CourseDetailPage.jsx`**: Add route protection if needed

### Deliverables:

1. ✅ All required directories and files created
2. ✅ `curriculum.js` exports curriculum with correct structure
3. ✅ All 12 modules (m0.js - m11.js) follow the topic data structure
4. ✅ All 10 components exist and match UI_STRUCTURE.md
5. ✅ App.jsx wires components correctly
6. ✅ useProgress hook reads/writes to Firebase
7. ✅ LanguageContext & AuthContext implemented
8. ✅ Styling matches other courses (professional, clean, orange accent)
9. ✅ Responsive design works on mobile/tablet/desktop
10. ✅ Registered in main App.jsx and courses.js

### Testing:

After refactoring:
1. Run `npm run dev`
2. Navigate to `/courses/aiagent/learn`
3. Verify:
   - ✅ Dashboard loads with module grid
   - ✅ Each module card shows (title, description, progress bar, hours, topics count)
   - ✅ Clicking a module opens ModulePage
   - ✅ Topics tab shows expandable sections with topics
   - ✅ Each topic expands to show all 9 fields
   - ✅ Projects tab shows project cards
   - ✅ Quiz tab has Q&A form
   - ✅ Notes tab has textarea
   - ✅ Sidebar shows module list and search works
   - ✅ Language switcher works (if Kannada translations provided)
   - ✅ Progress persists after page refresh
   - ✅ Responsive on mobile

### Reference:

- **Billing course** (reference): `src/features/billing/` (10 modules, ~80 topics, 80h)
- **UI Structure**: `UI_STRUCTURE.md` (component hierarchy, layouts, styling, interactions)
- **Blueprint**: `REFACTOR_AIAGENT_PROMPT.md` (this file)

---

## Ready?

Start refactoring now. Let me know when you hit any blockers!
