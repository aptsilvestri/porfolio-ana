import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { stripBase, withBase } from './base'
import { prefersReducedMotion } from './motion'

type Router = { path: string; navigate: (to: string) => void }

const RouterContext = createContext<Router>({ path: '/', navigate: () => {} })

export const useRouter = () => useContext(RouterContext)

const currentPath = () => stripBase(window.location.pathname)

function scrollToHash(hash: string, smooth: boolean) {
  if (!hash) return window.scrollTo({ top: 0 })
  const el = document.getElementById(hash.slice(1))
  if (!el) return
  el.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto' })
  // Move focus for keyboard and screen-reader users without a second jump.
  el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

/** Run a DOM update inside a View Transition when the browser supports it. */
function transition(update: () => void) {
  if (!document.startViewTransition || prefersReducedMotion()) return update()
  document.startViewTransition(() => flushSync(update))
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(currentPath)
  // Hash to scroll to once the next page has rendered (null = top of page).
  const pendingHash = useRef<string | null>(null)
  const firstRender = useRef(true)

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const hash = pendingHash.current
    pendingHash.current = null
    scrollToHash(hash ?? '', false)
  }, [path])

  useEffect(() => {
    const onPop = () => transition(() => setPath(currentPath()))
    window.addEventListener('popstate', onPop)
    // Honour a hash on first load (e.g. shared link to /#contact).
    if (window.location.hash) requestAnimationFrame(() => scrollToHash(window.location.hash, false))
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback(
    (to: string) => {
      const url = new URL(withBase(to), window.location.origin)
      const nextPath = stripBase(url.pathname)

      if (nextPath === path) {
        // Same page: just move to the section.
        window.history.pushState(null, '', url)
        scrollToHash(url.hash, true)
        return
      }

      window.history.pushState(null, '', url)
      pendingHash.current = url.hash
      transition(() => setPath(nextPath))
    },
    [path],
  )

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const { navigate } = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }
    e.preventDefault()
    navigate(to)
  }

  return (
    <a href={withBase(to)} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
