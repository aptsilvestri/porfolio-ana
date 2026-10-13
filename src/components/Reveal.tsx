import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useInView } from '../lib/useInView'

type Props = {
  as?: ElementType
  /** Position in a stagger sequence; each step adds a short delay. */
  index?: number
  className?: string
  children: ReactNode
}

/** Fades and lifts its content in when it first scrolls into view. */
export function Reveal({ as: Tag = 'div', index = 0, className = '', children }: Props) {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`.trim()}
      style={{ '--i': index } as CSSProperties}
    >
      {children}
    </Tag>
  )
}

/** A headline line that slides up from behind a mask. Use inside an `.is-in` parent. */
export function Line({ index = 0, children }: { index?: number; children: ReactNode }) {
  return (
    <span className="line" style={{ '--i': index } as CSSProperties}>
      <span>{children}</span>
    </span>
  )
}
