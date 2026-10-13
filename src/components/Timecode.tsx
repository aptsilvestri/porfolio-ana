import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/motion'

const FPS = 25
const pad = (n: number) => String(n).padStart(2, '0')

const format = (frames: number) => {
  const s = Math.floor(frames / FPS)
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(frames % FPS)}`
}

/** An editing-timeline timecode that runs while the page is open. */
export function Timecode() {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const start = performance.now()
    let last = -1
    let raf = requestAnimationFrame(function tick(now) {
      const frames = Math.floor(((now - start) / 1000) * FPS)
      if (frames !== last && ref.current) {
        ref.current.textContent = format(frames)
        last = frames
      }
      raf = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  return (
    <span className="timecode tabular" aria-hidden="true">
      <span className="timecode__rec" />
      <span ref={ref}>{format(0)}</span>
    </span>
  )
}
