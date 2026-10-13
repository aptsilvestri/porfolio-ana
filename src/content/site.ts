/**
 * Everything personal on the site lives here.
 * Only verified information belongs in this file — leave a field empty
 * rather than filling it with something approximate.
 */
export const site = {
  name: 'Ana',
  fullName: 'Ana Paula Tucci Silvestri',
  roles: ['Motion Designer', 'Graphic Designer', 'Video Maker'],
  location: 'Milan, Italy',
  yearsOfExperience: 7,
  education: 'Degree in Advertising',
  current: {
    company: 'Joinrs',
    description: 'a Milan-based startup',
    role: 'Producing and editing social media video content for major brands.',
    clients: ['PwC', 'Fastweb', 'Vodafone'],
  },
  otherClients: ['UniCredit', 'Amadori'],
  disciplines: [
    'Motion design',
    'Video editing',
    'Graphic design',
    'Social media content',
    'Visual storytelling',
    'Digital communication',
  ],

  /**
   * Contact channels. Each entry with a value is rendered as a link;
   * empty ones are hidden. Add the real addresses here.
   */
  contact: {
    email: '',
    linkedin: '',
    instagram: '',
    behance: '',
    vimeo: '',
  },
} as const

export type ContactKey = keyof typeof site.contact

export const contactLabels: Record<ContactKey, string> = {
  email: 'Email',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  behance: 'Behance',
  vimeo: 'Vimeo',
}
