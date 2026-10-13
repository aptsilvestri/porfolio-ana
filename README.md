# Ana: Motion & Graphic Design Portfolio

A personal portfolio site built with React, TypeScript and Vite. There is no UI framework, no
router library and no animation library. The only runtime dependencies are React and two
self-hosted variable fonts (Fraunces and Instrument Sans).

## Preview locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check and production build into dist/
npm run preview    # serve the production build
```

## Editing content

All the content is in two files:

| File | What it holds |
| --- | --- |
| `src/content/site.ts` | Name, roles, Joinrs, clients, disciplines and **contact links**. |
| `src/content/projects.ts` | Selected Work: one entry per project, in display order. |

- **Contact:** fill in `site.contact.email`, `linkedin`, `instagram` and so on. Empty values are
  hidden, so the site never shows a broken link.
- **Projects:** every entry needs a `slug`, `title`, `disciplines`, `accent` and `size`.
  - Without a `cover`, the tile is set in type on its accent colour.
  - With a `cover` image, the image is shown. Add `preview` (a short MP4) to make the
    tile play a muted loop on hover.
  - As soon as `media` has at least one item, the tile links to `/work/<slug>`, a full
    project page with images, self-hosted video or Vimeo/YouTube players. Players only
    load when the visitor presses play.
  - There is a complete example in the comment at the top of `projects.ts`.
- **Images and videos:** put them in `public/media/<slug>/` (see `public/media/README.md`).

`accent` is one of `pink | blush | lavender | butter | blue`. `size` sets the tile's aspect
ratio: `feature` 16:10, `wide` 16:9, `tall` 4:5, `square` 1:1. Positions in the gallery
follow a repeating five-step editorial rhythm, so new projects slot in automatically.

## Design system

- **Tokens:** `src/styles/tokens.css` holds the palette, fluid type scale, spacing and easing.
- **Type:** Fraunces (variable, with the soft axis) for display and Instrument Sans for text.
- **Motion:** masked headline reveals, scroll reveals, a timeline/playhead in the header
  that tracks scroll position with keyframe markers for each section, a running timecode,
  slowly drifting shapes, hover loops and View Transitions between pages. All of it is
  switched off under `prefers-reduced-motion`.

## Deploying

The build output (`dist/`) is static, so any static host works.

- **Netlify / Vercel / Cloudflare Pages:** build command `npm run build`, output `dist`.
  Add a rewrite of `/*` to `/index.html` so `/work/<slug>` links work on refresh.
  (`dist/404.html` is also generated as a fallback.)
- **GitHub Pages:** build with `BASE_PATH=/<repo-name>/ npm run build` and publish
  `dist/`. The generated `404.html` handles deep links.
- **Custom domain:** point it at the host above. If you use one, also add an
  `og:image` and canonical URL in `index.html`.
