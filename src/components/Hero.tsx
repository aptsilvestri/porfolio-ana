import { useEffect, useState } from 'react'
import { site } from '../content/site'
import { Link } from '../lib/router'
import { ArrowDown } from './Icons'
import { Line } from './Reveal'
import { Timecode } from './Timecode'
import './Hero.css'

const LINES = [
  { word: 'Motion', note: 'Rhythm & timing' },
  { word: 'Graphic', note: 'Composition & type' },
  { word: 'Video', note: 'Editing & storytelling', amp: true },
]

export function Hero() {
  // Trigger the masked headline reveal right after first paint.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <section className={`hero ${ready ? 'is-in' : ''}`} aria-labelledby="hero-title">
      <div className="hero__shapes" aria-hidden="true">
        <span className="shape shape--circle" />
        <span className="shape shape--pill" />
        <span className="shape shape--spark" />
        <span className="shape shape--arc" />
      </div>

      <div className="wrap hero__inner">
        <div className="hero__meta">
          <span className="eyebrow">{site.name} — Portfolio</span>
          <span className="eyebrow hero__meta-mid">Motion · Graphic · Video</span>
          <span className="eyebrow">{site.location}</span>
        </div>

        <h1 id="hero-title" className="hero__title display">
          <span className="sr-only">{site.name}: </span>
          {LINES.map(({ word, note, amp }, i) => (
            <span key={word} className={`hero__row hero__row--${i + 1}`}>
              <Line index={i}>
                {amp && <em className="hero__amp">&amp;&nbsp;</em>}
                {amp ? <em className="hero__highlight">{word}</em> : word}
              </Line>
              <span className="hero__note" aria-hidden="true">
                <span className="tabular">0{i + 1}</span> {note}
              </span>
            </span>
          ))}
        </h1>

        <div className="hero__foot">
          <p className="hero__intro">
            I’m {site.name}, a {site.roles.join(', ').replace(/, ([^,]*)$/, ' and $1').toLowerCase()} with{' '}
            {site.yearsOfExperience}+ years of making brands move. Currently producing and editing social
            video at {site.current.company}, {site.location.split(',')[0]}.
          </p>
          <div className="hero__actions">
            <Link to="/#work" className="button">
              See selected work <ArrowDown />
            </Link>
            <Timecode />
          </div>
        </div>
      </div>
    </section>
  )
}
