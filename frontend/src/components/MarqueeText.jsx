/**
 * MarqueeText — Infinite horizontal scrolling ticker
 * Speed increases with scroll velocity via CSS animation
 */
export default function MarqueeText({
  items = [],
  speed = 'normal', // 'slow' | 'normal' | 'fast'
  reverse = false,
  className = '',
  separator = '·',
}) {
  const animClass = {
    slow: 'animate-marquee-slow',
    normal: 'animate-marquee',
    fast: 'animate-marquee',
  }[speed]

  const content = [...items, ...items] // duplicate for seamless loop

  return (
    <div
      className={`overflow-hidden whitespace-nowrap w-full ${className}`}
      aria-hidden="true"
    >
      <div
        className={`inline-flex ${animClass}`}
        style={{
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {content.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 md:gap-10 font-serif text-2xl md:text-4xl italic text-ivory/30 px-4"
          >
            {item}
            <span className="text-gold/50 not-italic font-sans text-base">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
