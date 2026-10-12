# Python Visual Classroom

This course is registered at `/courses/python`; its authenticated player is at `/courses/python/learn`.

## Where the course lives

- `data/curriculum.js`: assembles the modules and exposes topic/totals helpers.
- `data/modules/m0.js`: Hello, Python!
- `data/modules/m1.js`: Names, values & text
- `data/modules/m2.js`: Decisions & branching
- `data/modules/m3.js`: Loops: patient repetition
- `data/modules/m4.js`: Collections: organize your world
- `data/modules/m5.js`: Functions: teach a reusable skill
- `data/modules/m6.js`: Files, errors & useful tools
- `data/modules/m7.js`: Build a cafe billing program
- `components/LessonPlayer.jsx`: animated traces, teacher narration, prediction quizzes, practice, and notes.
- `hooks/useProgress.js`: local persistence and Firestore progress synchronization.
- `App.jsx`: dashboard, search, navigation, and lesson selection.
- `index.css`: responsive classroom styling and reduced-motion support.

Each module contains three lessons. Each lesson defines its explanation, Python code, execution frames, quiz with feedback, practice task, and common mistake. Frames are prepared teaching examples; the player does not execute arbitrary Python.

Authentication and Firebase configuration use the shared portfolio providers.
