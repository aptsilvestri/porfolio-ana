import { Fragment } from 'react'
import { Spark } from './Icons'
import './Marquee.css'

/** A slow ribbon of words. The second copy is decorative and hidden from assistive tech. */
export function Marquee({ items, label }: { items: readonly string[]; label: string }) {
  const row = (hidden: boolean) => (
    <ul className="marquee__row" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <Fragment key={item}>
          <li className="display">{item}</li>
          <li className="marquee__spark" aria-hidden="true">
            <Spark />
          </li>
        </Fragment>
      ))}
    </ul>
  )

  return (
    <div className="marquee-clip">
      <div className="marquee" role="region" aria-label={label}>
        <div className="marquee__track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  )
}
