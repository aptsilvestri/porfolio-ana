import { projects } from '../content/projects'
import { ProjectTile } from './ProjectTile'
import { Line } from './Reveal'
import { useInView } from '../lib/useInView'
import './Work.css'

export function Work() {
  const [ref, inView] = useInView<HTMLDivElement>()

  return (
    <section id="work" className="work" aria-labelledby="work-title">
      <div className="wrap">
        <div ref={ref} className={`section-head ${inView ? 'is-in' : ''}`}>
          <h2 id="work-title" className="section-head__title display">
            <Line>
              Selected <em>work</em>
              <sup className="section-head__count tabular">({String(projects.length).padStart(2, '0')})</sup>
            </Line>
          </h2>
          <p className="section-head__aside">
            Social video and creative content for some familiar names. Full case studies, with the work itself, are being added.
          </p>
        </div>

        <ol className="work__grid">
          {projects.map((p, i) => (
            <ProjectTile key={p.slug} project={p} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
