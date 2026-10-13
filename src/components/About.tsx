import { site } from '../content/site'
import { useInView } from '../lib/useInView'
import { Line, Reveal } from './Reveal'
import './About.css'

const SWATCHES = ['pink', 'lavender', 'butter', 'blue', 'blush', 'pink'] as const

const list = (items: readonly string[]) =>
  items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items.join('')

export function About() {
  const [ref, inView] = useInView<HTMLHeadingElement>()
  const allClients = [...site.current.clients, ...site.otherClients]

  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="wrap about__grid">
        <p className="eyebrow about__label">
          <span className="about__label-dot" aria-hidden="true" /> About
        </p>

        <h2 id="about-title" ref={ref} className={`about__statement display ${inView ? 'is-in' : ''}`}>
          <Line index={0}>{site.yearsOfExperience}+ years of turning</Line>
          <Line index={1}>
            briefs into <em>things</em>
          </Line>
          <Line index={2}>
            <em>that move.</em>
          </Line>
        </h2>

        <div className="about__body">
          <Reveal as="p" className="about__lead">
            I’m {site.name}, a {list(site.roles.map((r) => r.toLowerCase()))} with a{' '}
            {site.education.toLowerCase()}.
          </Reveal>
          <Reveal as="p" index={1}>
            I currently work at <strong>{site.current.company}</strong>, {site.current.description}, where I produce
            and edit social media video content for brands including {list(site.current.clients)}. Along the way
            I’ve also created projects and social content for {list(site.otherClients)}.
          </Reveal>
          <Reveal as="p" index={2}>
            My work sits where motion design, video editing and graphic design meet: visual storytelling made for
            the way people actually watch — on their phones, between everything else.
          </Reveal>
        </div>

        <Reveal as="dl" className="about__facts">
          <div>
            <dt>Now</dt>
            <dd>
              {site.current.company}, {site.location.split(',')[0]}
            </dd>
          </div>
          <div>
            <dt>Experience</dt>
            <dd>{site.yearsOfExperience}+ years</dd>
          </div>
          <div>
            <dt>Studied</dt>
            <dd>Advertising</dd>
          </div>
          <div>
            <dt>Brands</dt>
            <dd>{allClients.join(', ')}</dd>
          </div>
        </Reveal>

        <div className="about__skills">
          <h3 className="eyebrow muted">What I do</h3>
          <ol>
            {site.disciplines.map((d, i) => (
              <Reveal as="li" key={d} index={i} className={`skill skill--${SWATCHES[i % SWATCHES.length]}`}>
                <span className="skill__num tabular">{String(i + 1).padStart(2, '0')}</span>
                <span className="skill__name display">{d}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
