import { About } from '../components/About'
import { Contact } from '../components/Contact'
import { Hero } from '../components/Hero'
import { Marquee } from '../components/Marquee'
import { Work } from '../components/Work'
import { site } from '../content/site'
import { useDocumentMeta } from '../lib/useDocumentTitle'

export function Home() {
  useDocumentMeta(
    `${site.name} — ${site.roles.join(', ').replace(/, ([^,]*)$/, ' & $1')}`,
    `Portfolio of ${site.name}, a ${site.location.split(',')[0]}-based motion designer, graphic designer and video maker creating social video and brand content.`,
  )

  return (
    <>
      <Hero />
      <Marquee items={site.disciplines} label="Disciplines" />
      <Work />
      <About />
      <Contact />
    </>
  )
}
