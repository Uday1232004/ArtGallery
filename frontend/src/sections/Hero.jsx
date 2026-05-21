import { useEffect, useRef } from 'react'
import { gsap } from '../animations/gsap'
import { splitTextIntoWords } from '../animations/motions'
import ScrollIndicator from '../components/ScrollIndicator'

const PREVIEW_PATHS = [
  { img: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80', top: '15%', left: '10%', size: 'w-64 md:w-80', speed: 0.2 },
  { img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80', top: '50%', left: '65%', size: 'w-56 md:w-72', speed: -0.3 },
  { img: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&q=80', top: '65%', left: '20%', size: 'w-48 md:w-60', speed: 0.4 },
  { img: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800&q=80', top: '15%', left: '75%', size: 'w-52 md:w-64', speed: 0.3 },
]

export default function Hero({ ready }) {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const previewsRef = useRef([])
  const metaRef = useRef(null)
  const subtagRef = useRef(null)

  useEffect(() => {
    if (!ready) return

    const section = sectionRef.current
    const headline = headlineRef.current
    const previews = previewsRef.current.filter(Boolean)

    if (!section || !headline) return

    splitTextIntoWords(headline)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 })

      // Floating previews slow fade in
      tl.fromTo(previews,
        { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
        { opacity: 0.4, scale: 1, filter: 'blur(0px)', duration: 2.5, ease: 'power2.out', stagger: 0.2 }
      )

      // Subtitle fades in
      tl.fromTo(subtagRef.current,
        { opacity: 0, y: 12, letterSpacing: '0.8em' },
        { opacity: 1, y: 0, letterSpacing: '0.5em', duration: 1.5, ease: 'expo.out' },
        '-=2'
      )

      // Words slide up one by one
      tl.fromTo(
        headline.querySelectorAll('.word-inner'),
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          stagger: 0.08,
          duration: 1.2,
          ease: 'expo.out',
        },
        '-=1.5'
      )

      // Meta line + text
      tl.fromTo(metaRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1, ease: 'expo.out' },
        '-=0.8'
      )

      // Continuous ambient float for previews
      previews.forEach((p, i) => {
        gsap.to(p, {
          y: i % 2 === 0 ? '-15px' : '15px',
          rotation: i % 2 === 0 ? 1 : -1,
          duration: 4 + i,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      })

      // Scroll-driven parallax
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })

      previews.forEach((p, i) => {
        scrollTl.to(p, { yPercent: PREVIEW_PATHS[i].speed * 200, opacity: 0, ease: 'none' }, 0)
      })

      scrollTl.to(headline, { yPercent: -40, opacity: 0, ease: 'none' }, 0)
      scrollTl.to(subtagRef.current, { opacity: 0, y: -20, ease: 'none' }, 0)
      scrollTl.to(metaRef.current, { opacity: 0, ease: 'none' }, 0)

    }, section)

    return () => ctx.revert()
  }, [ready])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full h-screen overflow-hidden bg-void pencil-texture"
    >
      {/* Heavy grain overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-10">
        <div className="w-full h-full grain-animation bg-noise" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(222,214,199,0.05)_0%,transparent_80%)] z-0" />

      {/* Floating Ambient Previews */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {PREVIEW_PATHS.map((p, i) => (
          <div
            key={i}
            ref={(el) => (previewsRef.current[i] = el)}
            className={`absolute aspect-[3/4] ${p.size} opacity-0 mix-blend-luminosity will-change-transform`}
            style={{ top: p.top, left: p.left }}
          >
            <img src={p.img} alt="" className="w-full h-full object-cover rounded-sm" />
            <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent opacity-60" />
          </div>
        ))}
      </div>

      {/* ── Main Headline ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4 pointer-events-none"
      >
        <div ref={subtagRef} className="mb-6" style={{ opacity: 0 }}>
          <span className="font-sans text-[10px] tracking-[0.5em] text-gold uppercase drop-shadow-sm">
            ArtBro Gallery
          </span>
        </div>

        <h1
          ref={headlineRef}
          className="font-serif font-light text-cream leading-[1] tracking-tight will-change-transform max-w-5xl mx-auto"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)', textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
        >
          Connecting Creators & Art Lovers.
        </h1>

        <div ref={metaRef} className="mt-12 flex flex-col items-center gap-4" style={{ opacity: 0 }}>
          <div className="h-12 w-px bg-gradient-to-b from-gold/50 to-transparent" />
          <span className="font-sans text-[9px] tracking-[0.3em] text-ivory/50 uppercase">
            Sketches, Portraits & Custom Commissions
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  )
}

