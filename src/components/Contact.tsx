import { contactLabels, site, type ContactKey } from '../content/site'
import { useInView } from '../lib/useInView'
import { ArrowUpRight } from './Icons'
import { Line, Reveal } from './Reveal'
import './Contact.css'

const hrefFor = (key: ContactKey, value: string) => (key === 'email' ? `mailto:${value}` : value)

const displayFor = (key: ContactKey, value: string) =>
  key === 'email' ? value : value.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export function Contact() {
  const [ref, inView] = useInView<HTMLHeadingElement>()
  const channels = (Object.entries(site.contact) as [ContactKey, string][]).filter(([, v]) => v.trim())
  const email = site.contact.email.trim()

  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="wrap contact__inner">
        <p className="eyebrow">Contact</p>

        <h2 id="contact-title" ref={ref} className={`contact__title display ${inView ? 'is-in' : ''}`}>
          <Line index={0}>Let’s make</Line>
          <Line index={1}>
            something <em>move.</em>
          </Line>
        </h2>

        <Reveal className="contact__body">
          <p className="contact__lead">
            Open to conversations with creative studios, brands and teams looking for motion, graphic design and
            video content.
          </p>

          {email && (
            <a className="contact__email display" href={`mailto:${email}`}>
              {email}
              <ArrowUpRight size={28} />
            </a>
          )}

          {channels.length > 0 ? (
            <ul className="contact__links">
              {channels
                .filter(([key]) => key !== 'email')
                .map(([key, value]) => (
                  <li key={key}>
                    <a href={hrefFor(key, value)} target="_blank" rel="noopener noreferrer">
                      <span className="eyebrow">{contactLabels[key]}</span>
                      <span className="contact__handle">{displayFor(key, value)}</span>
                      <ArrowUpRight />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="contact__pending">Contact details are being updated — please check back soon.</p>
          )}
        </Reveal>
      </div>
    </section>
  )
}
