import { useEffect, useRef } from 'react'
import { gsap } from '../animations/gsap'

/**
 * ScrollIndicator — animated vertical scroll hint
 */
export default function ScrollIndicator() {
  const lineRef = useRef(null)

  useEffect(() => {
    const line = lineRef.current
    if (!line) return

    gsap.fromTo(
      line,
      { scaleY: 0, transformOrigin: 'top center' },
      {
        scaleY: 1,
        duration: 1.5,
        ease: 'expo.out',
        delay: 4,
        repeat: -1,
        repeatDelay: 0.5,
        yoyo: false,
        onRepeat() {
          gsap.set(line, { scaleY: 0 })
        },
      }
    )
  }, [])

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
      <span className="font-sans text-[9px] tracking-[0.4em] text-ivory/40 uppercase">
        Scroll
      </span>
      <div className="w-px h-12 bg-white/10 overflow-hidden relative">
        <div
          ref={lineRef}
          className="absolute inset-0 bg-gold"
          style={{ transformOrigin: 'top center' }}
        />
      </div>
    </div>
  )
}
