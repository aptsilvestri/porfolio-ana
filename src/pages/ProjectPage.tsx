import { ArrowLeft, ArrowUpRight } from '../components/Icons'
import { MediaBlock } from '../components/Media'
import { Line, Reveal } from '../components/Reveal'
import { getProject, hasPage, projects } from '../content/projects'
import { Link } from '../lib/router'
import { useDocumentMeta } from '../lib/useDocumentTitle'
import { useEffect, useState } from 'react'
import { NotFound } from './NotFound'
import './ProjectPage.css'

export function ProjectPage({ slug }: { slug: string }) {
  const project = getProject(slug)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [slug])

  const name = project ? [project.client, project.title].filter(Boolean).join(' — ') : ''
  useDocumentMeta(project ? `${name} — Ana` : 'Page not found — Ana', project?.summary)

  if (!project || !hasPage(project)) return <NotFound />

  const published = projects.filter(hasPage)
  const next = published[(published.indexOf(project) + 1) % published.length]
  const [lead, ...rest] = project.media

  return (
    <article className={`project ${ready ? 'is-in' : ''}`}>
      <header className={`project__head bg-${project.accent}`}>
        <div className="wrap">
          <Link to="/#work" className="project__back">
            <ArrowLeft /> All work
          </Link>

          <h1 className="project__title display">
            {project.client && (
              <Line index={0}>
                <em>{project.client}</em>
              </Line>
            )}
            <Line index={1}>{project.title}</Line>
          </h1>

          <dl className="project__meta">
            {project.client && (
              <div>
                <dt>Client</dt>
                <dd>{project.client}</dd>
              </div>
            )}
            {project.year && (
              <div>
                <dt>Year</dt>
                <dd>{project.year}</dd>
              </div>
            )}
            <div>
              <dt>Disciplines</dt>
              <dd>{project.disciplines.join(', ')}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="wrap project__body">
        <div className="project__lead">
          <MediaBlock media={lead} eager />
        </div>

        {(project.summary || project.description?.length) && (
          <Reveal className="project__text">
            {project.summary && <p className="project__summary">{project.summary}</p>}
            {project.description?.map((para) => <p key={para}>{para}</p>)}
          </Reveal>
        )}

        <div className="project__gallery">
          {rest.map((m, i) => (
            <Reveal key={i}>
              <MediaBlock media={m} />
            </Reveal>
          ))}
        </div>

        {project.credits && project.credits.length > 0 && (
          <Reveal as="dl" className="project__credits">
            {project.credits.map((c) => (
              <div key={`${c.role}-${c.name}`}>
                <dt>{c.role}</dt>
                <dd>{c.name}</dd>
              </div>
            ))}
          </Reveal>
        )}
      </div>

      {next && next !== project && (
        <Link to={`/work/${next.slug}`} className={`project__next bg-${next.accent}`}>
          <span className="wrap">
            <span className="eyebrow">Next project</span>
            <span className="project__next-title display">
              {next.client ?? next.title} <ArrowUpRight size={40} />
            </span>
          </span>
        </Link>
      )}
    </article>
  )
}
