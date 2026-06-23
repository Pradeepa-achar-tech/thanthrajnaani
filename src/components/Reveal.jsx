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
          clearTimeout(fallback)
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -5% 0px' }
    )
    io.observe(el)
    // Fail-open: some mobile browsers don't reliably fire the observer for
    // content below the fold. Never let a card stay invisible — reveal anyway.
    const fallback = setTimeout(() => {
      setShown(true)
      io.disconnect()
    }, 800)
    return () => {
      io.disconnect()
      clearTimeout(fallback)
    }
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
