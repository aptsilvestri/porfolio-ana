import { site } from '../content/site'
import { Link } from '../lib/router'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <p>
          © {new Date().getFullYear()} {site.fullName}
        </p>
        <p className="footer__roles">{site.roles.join(' · ')}</p>
        <Link to="/" className="footer__top">
          Back to top ↑
        </Link>
      </div>
    </footer>
  )
}
