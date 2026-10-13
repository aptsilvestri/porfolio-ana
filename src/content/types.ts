/** Pastel accents available to projects and sections (see styles/tokens.css). */
export type Accent = 'pink' | 'blush' | 'lavender' | 'butter' | 'blue'

export type Discipline =
  | 'Motion design'
  | 'Graphic design'
  | 'Video editing'
  | 'Social content'
  | 'Visual storytelling'
  | 'Digital communication'

export type ImageMedia = {
  type: 'image'
  /** Path inside /public, e.g. "/media/my-project/cover.jpg" */
  src: string
  alt: string
  width: number
  height: number
  caption?: string
}

export type VideoMedia = {
  type: 'video'
  /** Self-hosted MP4/WebM inside /public */
  src: string
  poster?: string
  alt: string
  /** e.g. "16 / 9", "9 / 16", "1 / 1", "4 / 5" */
  aspect: string
  caption?: string
}

export type EmbedMedia = {
  type: 'embed'
  provider: 'vimeo' | 'youtube'
  /** Video id only, e.g. "76979871" for Vimeo or "dQw4w9WgXcQ" for YouTube */
  id: string
  title: string
  aspect: string
  /** Optional poster shown before the player loads */
  poster?: string
  caption?: string
}

export type Media = ImageMedia | VideoMedia | EmbedMedia

/** How large the project appears in the Selected Work composition. */
export type TileSize = 'feature' | 'wide' | 'tall' | 'square'

export type Project = {
  /** URL segment: /work/<slug> */
  slug: string
  title: string
  client?: string
  year?: string
  disciplines: Discipline[]
  /** One or two sentences shown in the gallery. Leave out rather than guess. */
  summary?: string
  /** Paragraphs for the project page. */
  description?: string[]
  /** Gallery cover. Without one, the tile is set in type on the accent colour. */
  cover?: ImageMedia
  /** Short muted loop played on hover in the gallery (self-hosted MP4). */
  preview?: string
  /** Everything shown on the project page, in order. */
  media: Media[]
  credits?: { role: string; name: string }[]
  accent: Accent
  size: TileSize
}
