import { ArrowLeft } from '../components/Icons'
import { Link } from '../lib/router'
import { useDocumentMeta } from '../lib/useDocumentTitle'
import './NotFound.css'

export function NotFound() {
  useDocumentMeta('Page not found — Ana')
  return (
    <section className="notfound wrap">
      <p className="eyebrow muted tabular">Error · 00:00:04:04</p>
      <h1 className="display notfound__title">
        This frame <em>didn’t</em> render.
      </h1>
      <Link to="/" className="button">
        <ArrowLeft /> Back to the homepage
      </Link>
    </section>
  )
}
