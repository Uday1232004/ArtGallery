import { useEffect, useRef } from 'react'
import { gsap } from '../animations/gsap'

/**
 * Cinematic preloader with counter + curtain wipe exit
 * Fires onComplete when done so Hero can start its animations
 */
export default function Preloader({ onComplete }) {
  const preloaderRef = useRef(null)
  const counterRef = useRef(null)
  const brandRef = useRef(null)
  const barRef = useRef(null)
  const taglineRef = useRef(null)

  useEffect(() => {
    const el = preloaderRef.current
    const counter = counterRef.current
    const brand = brandRef.current
    if (!el || !counter || !brand) return

    let count = { val: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        onComplete?.()
      },
    })

    // Brand characters reveal sequentially
    tl.fromTo(
      brand.querySelectorAll('.brand-char'),
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 1, ease: 'expo.out' },
      0.2
    )

    // Tagline fade in
    tl.fromTo(
      taglineRef.current,
      { opacity: 0, y: 10, letterSpacing: '0.4em' },
      { opacity: 1, y: 0, letterSpacing: '0.3em', duration: 1.2, ease: 'power3.out' },
      0.6
    )

    // Count 0 → 100
    tl.to(count, {
      val: 100,
      duration: 2.2,
      ease: 'power3.inOut',
      onUpdate() {
        counter.textContent = String(Math.round(count.val)).padStart(3, '0')
      },
    }, 0)

    // Bottom progress bar fills
    tl.fromTo(
      barRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 2.2, ease: 'power3.inOut', transformOrigin: 'left' },
      0
    )

    // Curtain wipe up exit (clip-path animation)
    tl.to(
      el,
      {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.2,
        ease: 'expo.inOut',
      },
      '+=0.2' // Wait a tiny bit after counter hits 100
    )

    tl.set(el, { display: 'none' })

    return () => tl.kill()
  }, [onComplete])

  const brand = 'ArtBro Sketches'

  return (
    <div
      ref={preloaderRef}
      id="preloader"
      className="fixed inset-0 z-50 bg-void flex flex-col items-center justify-center"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="w-full h-full grain-animation bg-noise" />
      </div>

      {/* Grid lines */}
      <div className="grid-lines absolute inset-0" />

      {/* Brand name */}
      <div
        ref={brandRef}
        className="font-serif tracking-[0.4em] text-ivory mb-6 overflow-hidden"
        style={{ fontSize: 'clamp(3rem, 8vw, 8rem)' }}
      >
        {brand.split('').map((char, i) => (
          <span key={i} className="brand-char inline-block will-change-transform" style={{ opacity: 0 }}>
            {char}
          </span>
        ))}
      </div>

      {/* Tagline */}
      <p ref={taglineRef} className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase mb-16 will-change-transform" style={{ opacity: 0 }}>
        Art That Feels Alive
      </p>

      {/* Counter */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-end gap-3">
        <span
          ref={counterRef}
          className="font-serif text-6xl md:text-8xl text-ivory/20 tabular-nums leading-none tracking-tighter"
        >
          000
        </span>
        <span className="font-sans text-[10px] text-ivory/20 tracking-[0.2em] mb-3 md:mb-5 uppercase">% Loaded</span>
      </div>

      {/* Bottom progress bar line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <div ref={barRef} className="h-full bg-gold/50" style={{ transform: 'scaleX(0)' }} />
      </div>
    </div>
  )
}
