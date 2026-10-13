import { useRef, type CSSProperties } from 'react'
import { hasPage } from '../content/projects'
import type { Project } from '../content/types'
import { withBase } from '../lib/base'
import { useReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { ArrowUpRight } from './Icons'
import { Image } from './Media'
import { Reveal } from './Reveal'

const ASPECT: Record<Project['size'], string> = {
  feature: '16 / 10',
  wide: '16 / 9',
  tall: '4 / 5',
  square: '1 / 1',
}

/** Typographic cover for work whose visuals have not been added yet. */
function TypeCover({ project }: { project: Project }) {
  return (
    <div className="tile__type">
      <span className="tile__safe" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="tile__client display">{project.client ?? project.title}</span>
    </div>
  )
}

export function ProjectTile({ project, index }: { project: Project; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduced = useReducedMotion()
  const linked = hasPage(project)
  const number = String(index + 1).padStart(2, '0')

  const play = () => {
    if (!reduced) videoRef.current?.play().catch(() => {})
  }
  const stop = () => {
    const v = videoRef.current
    if (v) {
      v.pause()
      v.currentTime = 0
    }
  }

  const body = (
    <>
      <div
        className={`tile__frame bg-${project.accent}`}
        style={{ aspectRatio: ASPECT[project.size] } as CSSProperties}
      >
        {project.cover ? <Image media={project.cover} sizes="(max-width: 700px) 100vw, 60vw" /> : <TypeCover project={project} />}
        {project.preview && (
          <video
            ref={videoRef}
            className="tile__preview"
            src={withBase(project.preview)}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
          />
        )}
        {linked && (
          <span className="tile__cta" aria-hidden="true">
            <ArrowUpRight size={20} />
          </span>
        )}
      </div>

      <div className="tile__caption">
        <span className="tile__num tabular" aria-hidden="true">
          {number}
        </span>
        <div className="tile__text">
          <h3 className="tile__title">
            {project.client && <span className="tile__by">{project.client} — </span>}
            {project.title}
          </h3>
          <p className="tile__meta muted">
            {project.disciplines.join(' · ')}
            {project.year && ` · ${project.year}`}
          </p>
          {project.summary && <p className="tile__summary">{project.summary}</p>}
          {!linked && <p className="tile__status">Case study in preparation</p>}
        </div>
      </div>
    </>
  )

  return (
    <Reveal as="li" className={`tile ${linked ? 'is-linked' : ''}`} index={index % 2}>
      {linked ? (
        <Link to={`/work/${project.slug}`} className="tile__link" onMouseEnter={play} onMouseLeave={stop} onFocus={play} onBlur={stop}>
          {body}
        </Link>
      ) : (
        <div className="tile__link">{body}</div>
      )}
    </Reveal>
  )
}
