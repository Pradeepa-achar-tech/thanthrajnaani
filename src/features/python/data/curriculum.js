import { m0 } from './modules/m0.js'
import { m1 } from './modules/m1.js'
import { m2 } from './modules/m2.js'
import { m3 } from './modules/m3.js'
import { m4 } from './modules/m4.js'
import { m5 } from './modules/m5.js'
import { m6 } from './modules/m6.js'
import { m7 } from './modules/m7.js'

export const curriculum = {
  title: "Python, one visual step at a time",
  subtitle: "See it. Predict it. Understand it. Build it.",
  modules: [m0, m1, m2, m3, m4, m5, m6, m7],
}

export const flattenTopics = (modules = curriculum.modules) => modules.flatMap(m => m.sections.flatMap(s => s.topics.map(t => ({ ...t, moduleId: m.id, sectionId: s.id }))))

export const getTotals = () => ({
  modules: curriculum.modules.length,
  topics: flattenTopics().length,
  projects: curriculum.modules.reduce((n, m) => n + (m.projects?.length || 0), 0),
  hours: curriculum.modules.reduce((n, m) => n + (m.hours || 0), 0),
})
