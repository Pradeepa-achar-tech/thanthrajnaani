import { useEffect, useState } from 'react'
import { ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'

export default function LessonPlayer({topic, module, progress}) {
  const [step,setStep] = useState(-1)
  const [playing,setPlaying] = useState(false)
  const [speed,setSpeed] = useState(2200)
  const [choice,setChoice] = useState(null)
  const [solution,setSolution] = useState(false)
  const [reduceMotion,setReduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media=window.matchMedia('(prefers-reduced-motion: reduce)')
    const change=() => {setReduceMotion(media.matches); if(media.matches) setPlaying(false)}
    media.addEventListener('change',change)
    return () => media.removeEventListener('change',change)
  },[])
  useEffect(() => {
    if(!playing) return
    if(step >= topic.frames.length - 1) {setPlaying(false); return}
    const timer=setTimeout(() => setStep(s => s+1),speed)
    return () => clearTimeout(timer)
  },[playing,step,speed,topic])
  const frame=topic.frames[step]
  const result=progress.getQuizResult(topic.id)
  const choose=i => {setChoice(i);progress.setQuizResult(topic.id,i===topic.answer?1:0,1)}
  return <article>
    <span className="py-eyebrow">ONE CONCEPT AT A TIME</span><h1 className="py-lesson-title">{topic.title}</h1>
    <div className="py-teacher"><span className="py-teacher-avatar">T</span><div><strong>Think of it this way...</strong><p>{topic.analogy}</p></div></div>
    <section className="py-lab" aria-label="Animated Python code explanation"><div className="py-lab-heading"><div><span className="py-status"/><strong>See Python think</strong></div><small>Guided trace · illustrated example</small></div>
      <div className="py-lab-grid"><div className="py-code"><div className="py-code-title">example.py <span>PYTHON 3</span></div><pre>{topic.code.split('\n').map((line,i) => <div key={i} className={`py-code-line ${frame?.line === i+1 ? 'active' : ''}`}><span className="py-line-number">{i+1}</span><code>{line || ' '}</code>{frame?.line===i+1 && <span className="py-line-pointer">←</span>}</div>)}</pre></div>
      <div className="py-memory"><span className="py-eyebrow">WHAT CHANGES</span><div className="py-values" aria-live="polite">{frame ? Object.entries(frame.state).map(([name,value]) => <div key={name} className="py-value"><span>{name}</span><strong key={String(value)}>{String(value)}</strong></div>) : <div className="py-empty"><Play size={28}/><p>Press Step to follow the first instruction.</p></div>}</div></div></div>
      <div className="py-narration" aria-live="polite"><span className="py-teacher-avatar">T</span><p>{frame?.say || 'Before we start, read the code. What do you think will happen? We’ll walk through it together.'}</p></div>
      <div className="py-controls"><button className="py-primary" onClick={() => {if(step===topic.frames.length-1)setStep(-1);setPlaying(p => !p)}} disabled={reduceMotion}>{playing ? <Pause size={16}/> : <Play size={16}/>}{playing?'Pause':'Play'}</button><button className="py-secondary" disabled={step===topic.frames.length-1} onClick={() => {setPlaying(false);setStep(s => s+1)}}>Step<ChevronRight size={16}/></button><button className="py-icon-button" aria-label="Replay from the beginning" onClick={() => {setStep(-1);setPlaying(false)}}><RotateCcw size={17}/></button><span className="py-step-count">{step+1} / {topic.frames.length}</span><label>Speed <select value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={3500}>Slow</option><option value={2200}>Normal</option><option value={1100}>Fast</option></select></label></div>
      {reduceMotion && <p className="py-motion-note">Reduced motion is enabled. Use Step to explore at your own pace.</p>}
      <div className="py-output"><span>OUTPUT SO FAR</span><pre aria-live="polite">{frame?.output || 'No output yet.'}</pre></div>
    </section>
    <div className="py-learning-grid"><section className="py-panel"><span className="py-eyebrow">PAUSE & PREDICT</span><h2>{topic.question}</h2><div className="py-options">{topic.options.map((o,i) => <button key={o} onClick={() => choose(i)} aria-pressed={choice===i} className={choice===i ? (i===topic.answer?'correct':'incorrect') : ''}><span>{String.fromCharCode(65+i)}</span>{o}</button>)}</div>{choice!==null && <p className={`py-feedback ${choice===topic.answer?'correct':'incorrect'}`} role="status"><strong>{choice===topic.answer?'Exactly. ':'Let’s rethink that. '}</strong>{topic.why}</p>}{choice===null && result && <p className="py-saved">Last saved check: {result.score}/{result.total}. Try it again.</p>}</section>
    <section className="py-panel py-practice"><span className="py-eyebrow">YOUR TURN</span><h2>Try it. Change it. Explain it.</h2><p>{topic.practice}</p><small>Run your experiments in a Python 3 terminal or editor. The visual above replays this lesson’s example.</small><button className="py-text-button" onClick={() => setSolution(v => !v)}>{solution?'Hide teacher’s hint':'Need a teacher’s hint?'}</button>{solution && <p className="py-hint">Copy the example, run it once, then change one value. Predict what changes before running again. {topic.why}</p>}</section></div>
    <section className="py-watch"><strong>A common bump in the road</strong><p>{topic.pitfall}</p></section>
    <section className="py-panel"><label className="py-note-label" htmlFor="py-notes">My notes for {module.title}</label><p>Explain the idea in your own words. What surprised you?</p><textarea id="py-notes" rows={3} value={progress.getNote(module.id)} onChange={e => progress.setNote(module.id,e.target.value)} placeholder="Today I understood that..."/></section>
  </article>
}
