// Build a Pooja Register Desktop App — curriculum.
// A 10-module course that builds "Upralli Seva" (ಉಪ್ರಳ್ಳಿ ಸೇವೆ), a real offline
// desktop app (Electron + React + TypeScript + Prisma + a PostgreSQL database
// bundled inside the installer) — a year-wise pooja/donor register for a village
// temple committee, taught the coastal-Karnataka way. Each module lives in its
// own file under ./modules/ and is assembled here.

import { m0 } from './modules/m0.js'
import { m1 } from './modules/m1.js'
import { m2 } from './modules/m2.js'
import { m3 } from './modules/m3.js'
import { m4 } from './modules/m4.js'
import { m5 } from './modules/m5.js'
import { m6 } from './modules/m6.js'
import { m7 } from './modules/m7.js'
import { m8 } from './modules/m8.js'
import { m9 } from './modules/m9.js'

export const curriculum = {
  title: 'Build a Pooja Register Desktop App by Thanthrajnaani',
  subtitle: 'A real Electron + TypeScript + Prisma app that bundles PostgreSQL inside the installer, taught the coastal Karnataka way',
  modules: [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9],
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
  return {
    modules: curriculum.modules.length,
    topics,
    projects,
    hours,
  }
}
