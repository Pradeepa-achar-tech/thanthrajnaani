import { useEffect, useRef, useState } from 'react'

/**
 * Reveals its children with a soft fade-and-rise the first time they
 * scroll into view. Falls back to visible immediately if IntersectionObserver
 * is unavailable, and respects prefers-reduced-motion via the .reveal CSS.
 *
 * Props:
 *  - as: element/tag to render (default 'div')
 *  - delay: ms to stagger the transition (default 0)
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${shown ? 'in-view' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
