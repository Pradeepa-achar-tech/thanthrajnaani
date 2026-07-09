// Build an Artist Discovery Platform (KalaKaara) — curriculum.
// A 16-module course that builds a production-quality artist marketplace with
// React (Vite) + Supabase (Postgres, Auth, Storage, RLS) from scratch, taught
// the coastal-Karnataka way, on 100% free services — no credit card required
// anywhere in the stack. Each module lives in its own file under ./modules/
// and is assembled here.

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
import { m10 } from './modules/m10.js'
import { m11 } from './modules/m11.js'
import { m12 } from './modules/m12.js'
import { m13 } from './modules/m13.js'
import { m14 } from './modules/m14.js'
import { m15 } from './modules/m15.js'

export const curriculum = {
  title: 'Build KalaKaara by Thanthrajnaani',
  subtitle:
    'A real React + Supabase artist discovery platform, taught the coastal Karnataka way',
  modules: [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15],
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
