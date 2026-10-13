const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Prefix an absolute app path or /public asset with the deploy base path. */
export const withBase = (path: string) =>
  /^(https?:)?\/\//.test(path) ? path : `${BASE}${path.startsWith('/') ? path : `/${path}`}`

/** Strip the deploy base path from location.pathname. */
export const stripBase = (pathname: string) =>
  BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname
