import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { useRouter } from './lib/router'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { ProjectPage } from './pages/ProjectPage'

function Page() {
  const { path } = useRouter()
  const clean = path.replace(/\/+$/, '') || '/'
  if (clean === '/') return <Home />
  const match = clean.match(/^\/work\/([\w-]+)$/)
  if (match) return <ProjectPage key={match[1]} slug={match[1]} />
  return <NotFound />
}

export function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Page />
      </main>
      <Footer />
    </>
  )
}
