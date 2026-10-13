import type { Project } from './types'

/**
 * SELECTED WORK
 * ─────────────
 * The order here is the order on the homepage.
 *
 * The entries below contain only what is verified so far: the brands
 * and the kind of work. They render as typographic tiles and have no
 * project page yet. As soon as a project has at least one item in
 * `media`, its tile becomes a link to /work/<slug>.
 *
 * To complete a project:
 *   1. Put files in /public/media/<slug>/
 *   2. Add `cover` (and optionally a hover `preview` loop)
 *   3. Add items to `media` (images, self-hosted videos, Vimeo/YouTube embeds)
 *   4. Add `summary`, `description`, `year` and `credits` if you want them shown
 *
 * Example of a finished entry:
 *
 *   {
 *     slug: 'vodafone-social',
 *     title: 'Summer campaign cut-downs',
 *     client: 'Vodafone',
 *     year: '2025',
 *     disciplines: ['Motion design', 'Video editing'],
 *     summary: 'Vertical cut-downs for Instagram and TikTok.',
 *     description: ['First paragraph…', 'Second paragraph…'],
 *     cover: { type: 'image', src: '/media/vodafone-social/cover.jpg',
 *              alt: 'Frame from the campaign', width: 1600, height: 1000 },
 *     preview: '/media/vodafone-social/loop.mp4',
 *     media: [
 *       { type: 'embed', provider: 'vimeo', id: '123456789',
 *         title: 'Vodafone — summer campaign', aspect: '9 / 16' },
 *       { type: 'image', src: '/media/vodafone-social/frames.jpg',
 *         alt: 'Storyboard frames', width: 2400, height: 1350 },
 *     ],
 *     accent: 'pink',
 *     size: 'feature',
 *   }
 */
export const projects: Project[] = [
  {
    slug: 'pwc-social-video',
    title: 'Social video content',
    client: 'PwC',
    disciplines: ['Video editing', 'Social content'],
    summary: 'Social media video content produced and edited at Joinrs.',
    media: [],
    accent: 'pink',
    size: 'feature',
  },
  {
    slug: 'fastweb-social-video',
    title: 'Social video content',
    client: 'Fastweb',
    disciplines: ['Video editing', 'Social content'],
    summary: 'Social media video content produced and edited at Joinrs.',
    media: [],
    accent: 'butter',
    size: 'tall',
  },
  {
    slug: 'vodafone-social-video',
    title: 'Social video content',
    client: 'Vodafone',
    disciplines: ['Video editing', 'Social content'],
    summary: 'Social media video content produced and edited at Joinrs.',
    media: [],
    accent: 'lavender',
    size: 'tall',
  },
  {
    slug: 'unicredit-creative',
    title: 'Creative & social content',
    client: 'UniCredit',
    disciplines: ['Social content'],
    media: [],
    accent: 'blue',
    size: 'wide',
  },
  {
    slug: 'amadori-creative',
    title: 'Creative & social content',
    client: 'Amadori',
    disciplines: ['Social content'],
    media: [],
    accent: 'blush',
    size: 'square',
  },
]

export const hasPage = (p: Project) => p.media.length > 0

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)
