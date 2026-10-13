import { useState } from 'react'
import type { EmbedMedia, ImageMedia, Media as MediaItem, VideoMedia } from '../content/types'
import { withBase } from '../lib/base'
import { Play } from './Icons'
import './Media.css'

export function Image({ media, eager = false, sizes }: { media: ImageMedia; eager?: boolean; sizes?: string }) {
  return (
    <img
      src={withBase(media.src)}
      alt={media.alt}
      width={media.width}
      height={media.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      sizes={sizes}
    />
  )
}

function Video({ media }: { media: VideoMedia }) {
  return (
    <video
      src={withBase(media.src)}
      poster={media.poster ? withBase(media.poster) : undefined}
      controls
      playsInline
      preload="metadata"
      aria-label={media.alt}
      style={{ aspectRatio: media.aspect }}
    />
  )
}

const embedUrl = ({ provider, id }: EmbedMedia) =>
  provider === 'vimeo'
    ? `https://player.vimeo.com/video/${encodeURIComponent(id)}?autoplay=1&dnt=1&title=0&byline=0&portrait=0`
    : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`

/**
 * Click-to-load player: nothing from Vimeo/YouTube is requested until the
 * visitor presses play, which keeps the page fast and cookie-free.
 */
function Embed({ media }: { media: EmbedMedia }) {
  const [active, setActive] = useState(false)

  return (
    <div className="embed" style={{ aspectRatio: media.aspect }}>
      {active ? (
        <iframe
          src={embedUrl(media)}
          title={media.title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      ) : (
        <button type="button" className="embed__facade" onClick={() => setActive(true)}>
          {media.poster && <img src={withBase(media.poster)} alt="" loading="lazy" decoding="async" />}
          <span className="embed__play">
            <Play />
          </span>
          <span className="sr-only">Play video: {media.title}</span>
        </button>
      )}
    </div>
  )
}

export function MediaBlock({ media, eager }: { media: MediaItem; eager?: boolean }) {
  const portrait = media.type !== 'image' && /^\s*(9|4|3)\s*\/\s*(16|5|4)\s*$/.test(media.aspect)
  const tall = media.type === 'image' && media.height > media.width
  return (
    <figure className={`media ${portrait || tall ? 'media--portrait' : ''}`}>
      {media.type === 'image' && <Image media={media} eager={eager} />}
      {media.type === 'video' && <Video media={media} />}
      {media.type === 'embed' && <Embed media={media} />}
      {media.caption && <figcaption className="media__caption muted">{media.caption}</figcaption>}
    </figure>
  )
}
