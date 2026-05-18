/**
 * WavyDivider — organic SVG wavy boundary between sections
 * Like Flyward's organic section transitions
 */
export default function WavyDivider({
  topColor = 'transparent',
  bottomColor = '#0D0D0D',
  className = '',
  flip = false,
}) {
  return (
    <div
      className={`relative w-full overflow-hidden leading-none ${className}`}
      style={{ transform: flip ? 'scaleY(-1)' : 'none' }}
    >
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full block"
        preserveAspectRatio="none"
      >
        <path
          d="M0 40 C240 80, 480 0, 720 40 C960 80, 1200 0, 1440 40 L1440 80 L0 80 Z"
          fill={bottomColor}
        />
      </svg>
    </div>
  )
}

/**
 * Organic blob divider — more complex wavy form
 */
export function BlobDivider({ color = '#0D0D0D', className = '' }) {
  return (
    <div className={`relative w-full overflow-hidden leading-none -mt-1 ${className}`}>
      <svg
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full block"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60 C120 20, 240 80, 360 50 C480 20, 600 90, 720 55 C840 20, 960 80, 1080 45 C1200 10, 1320 70, 1440 50 L1440 120 L0 120 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}
