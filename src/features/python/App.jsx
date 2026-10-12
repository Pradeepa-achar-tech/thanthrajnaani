import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Menu, Search, Sparkles, X } from 'lucide-react'
import { curriculum, flattenTopics } from './data/curriculum.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import useProgress from './hooks/useProgress.js'
import LessonPlayer from './components/LessonPlayer.jsx'
import './index.css'

const topics = flattenTopics()
export default function PythonClassroom() {
  const { user } = useAuth()
  const progress = useProgress(user?.uid)
  const [active, setActive] = useState(null)
  const [query, setQuery] = useState('')
  const [mobile, setMobile] = useState(false)
  const overall = progress.overallProgress(curriculum.modules)
  const topic = topics.find(t => t.id === active)
  const module = curriculum.modules.find(m => m.id === topic?.moduleId)
  const open = id => { setActive(id); setMobile(false); window.scrollTo({top: 0, behavior: 'auto'}) }
  const next = topics[topics.findIndex(t => t.id === active) + 1]
  const resume = topics.find(t => !progress.isTopicDone(t.id)) || topics[0]
  return <div className="py-classroom">
    <aside className={`py-sidebar ${mobile ? 'is-open' : ''}`}>
      <div className="py-brand"><span className="py-logo">Py</span><div><strong>Python classroom</strong><small>by Thanthrajnaani</small></div><button className="py-mobile" aria-label="Close navigation" onClick={() => setMobile(false)}><X size={20}/></button></div>
      <button className={`py-nav ${!active ? 'selected' : ''}`} onClick={() => open(null)}><BookOpen size={18}/> Learning dashboard</button>
      <div className="py-sidebar-progress"><span>Your journey <b>{overall.pct}%</b></span><progress value={overall.done} max={overall.total}/><small>{overall.done} of {overall.total} lessons complete</small></div>
      <label className="py-search"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a concept..." aria-label="Search lessons"/></label>
      <nav aria-label="Course modules">{curriculum.modules.map((m,i) => <div key={m.id} className="py-nav-module"><h3>{String(i+1).padStart(2,'0')} · {m.title}</h3>{m.sections[0].topics.filter(t => t.title.toLowerCase().includes(query.toLowerCase())).map(t => <button key={t.id} className={`py-nav ${active === t.id ? 'selected' : ''}`} onClick={() => open(t.id)}>{progress.isTopicDone(t.id) ? <Check size={15}/> : <span className="py-dot"/>}<span>{t.title}</span></button>)}</div>)}</nav>
      {query && !topics.some(t => t.title.toLowerCase().includes(query.toLowerCase())) && <p>No matching lessons.</p>}
      <Link className="py-back" to="/courses/python"><ArrowLeft size={15}/> Back to course</Link>
    </aside>
    {mobile && <button className="py-backdrop" aria-label="Close navigation" onClick={() => setMobile(false)}/>}
    <div className="py-workspace"><header className="py-topbar"><button className="py-mobile" aria-label="Open navigation" onClick={() => setMobile(true)}><Menu size={21}/></button><span>LEARN BY SEEING</span><span className="py-topbar-right"><span className="py-status"/> Your pace. Your classroom.</span></header>
    <main className="py-main">{!topic ? <>
      <section className="py-hero"><div><span className="py-eyebrow"><Sparkles size={15}/> A friendlier way to learn</span><h1>Python makes sense<br/>when you <em>see it.</em></h1><p>No programming experience needed. I'll explain one idea, show what happens inside Python, and help you try it yourself.</p><button className="py-primary" onClick={() => open(resume.id)}>{overall.done ? 'Continue learning' : 'Let’s start with hello'}<ArrowRight size={18}/></button><div className="py-hero-meta">8 modules <span>·</span> 24 visual lessons <span>·</span> 1 real project</div></div><div className="py-hero-art" aria-label="Example: two cups at twenty each cost forty"><div className="py-art-code">cups = <b>2</b><br/>price = <b>20</b><br/>total = cups * price</div><div className="py-art-flow"><span>2 cups</span><ChevronRight/><span>× 20</span><ChevronRight/><strong>40</strong></div><p>Little steps. Big understanding.</p></div></section>
      <div className="py-method">{[['01','See the idea','Start with a familiar everyday example.'],['02','Watch it happen','Follow the code and watch values change.'],['03','Make it yours','Predict, practice, and explain it back.']].map(([n,t,d]) => <div key={n}><span>{n}</span><strong>{t}</strong><p>{d}</p></div>)}</div>
      <div className="py-section-heading"><div><span className="py-eyebrow">YOUR LEARNING PATH</span><h2>From hello to I built this.</h2></div><span>{overall.done}/{overall.total} complete</span></div>
      <div className="py-module-grid">{curriculum.modules.map((m,i) => {const mp=progress.moduleProgress(m);return <button className="py-module-card" key={m.id} onClick={() => open(m.sections[0].topics.find(t => !progress.isTopicDone(t.id))?.id || m.sections[0].topics[0].id)}><div className="py-card-top"><span className="py-number">{String(i+1).padStart(2,'0')}</span><span>{mp.done}/3 lessons</span></div><h3>{m.title}</h3><p>{m.description}</p><progress value={mp.done} max={mp.total}/><div className="py-card-footer">{mp.pct===100 ? 'Revisit module' : 'Explore module'}<ArrowRight size={17}/></div></button>})}</div>
    </> : <><div className="py-breadcrumb"><button onClick={() => open(null)}>Classroom</button><ChevronRight size={14}/><span>{module.title}</span></div><LessonPlayer key={topic.id} topic={topic} module={module} progress={progress}/><div className="py-lesson-footer"><button className={progress.isTopicDone(topic.id) ? 'py-secondary' : 'py-primary'} onClick={() => progress.toggleTopic(topic.id)}><Check size={17}/>{progress.isTopicDone(topic.id) ? 'Completed · mark incomplete' : 'Mark lesson complete'}</button>{next ? <button className="py-secondary" onClick={() => open(next.id)}>Next lesson<ArrowRight size={17}/></button> : <button className="py-secondary" onClick={() => open(null)}>Back to your journey<ArrowRight size={17}/></button>}</div></>}</main></div>
  </div>
}

