type IconProps = { size?: number }

export const ArrowDown = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2v11M3 8.5 8 13.5l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ArrowUpRight = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ArrowLeft = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M13.5 8H2.5M7 3.5 2.5 8 7 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Play = ({ size = 22 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
    <path d="M7 4.5v13l11-6.5z" fill="currentColor" />
  </svg>
)

/** Four-point sparkle used as a separator. */
export const Spark = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 0c.7 5.6 3.8 8.9 10 10-6.2 1.1-9.3 4.4-10 10-.7-5.6-3.8-8.9-10-10C6.2 8.9 9.3 5.6 10 0Z" fill="currentColor" />
  </svg>
)
