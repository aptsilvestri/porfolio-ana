import { useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '../lib/router'
import './Header.css'

const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const

type Marker = { id: string; at: number }

export function Header() {
  const { path } = useRouter()
  const barRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [markers, setMarkers] = useState<Marker[]>([])
  const [active, setActive] = useState<string | null>(null)

  // Scroll progress drives the playhead through a CSS variable (no re-render per frame).
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      barRef.current?.style.setProperty('--progress', progress.toFixed(4))
      setScrolled(window.scrollY > 8)

      const probe = window.scrollY + window.innerHeight * 0.4
      let current: string | null = null
      for (const { id } of NAV) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= probe) current = id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [path])

  // Keyframe markers: where each section sits on the page timeline.
  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return setMarkers([])
      setMarkers(
        NAV.flatMap(({ id }) => {
          const el = document.getElementById(id)
          return el ? [{ id, at: Math.min(1, el.offsetTop / max) }] : []
        }),
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [path])

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header__inner wrap">
        <Link to="/" className="header__logo" aria-label="Ana — home">
          <span className="display">Ana</span>
          <span className="header__dot" aria-hidden="true" />
        </Link>

        <nav aria-label="Main">
          <ul className="header__nav">
            {NAV.map(({ id, label }) => (
              <li key={id}>
                <Link
                  to={`/#${id}`}
                  className={`header__link ${path === '/' && active === id ? 'is-active' : ''}`}
                  aria-current={path === '/' && active === id ? 'location' : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="timeline" ref={barRef} aria-hidden="true">
        <div className="timeline__fill" />
        {path === '/' &&
          markers.map((m) => (
            <span
              key={m.id}
              className={`timeline__key ${active === m.id ? 'is-active' : ''}`}
              style={{ left: `${m.at * 100}%` }}
            />
          ))}
        <span className="timeline__head" />
      </div>
    </header>
  )
}
