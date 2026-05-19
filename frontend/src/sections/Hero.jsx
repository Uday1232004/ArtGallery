import { useEffect, useRef, useMemo } from 'react'
import { gsap } from '../animations/gsap'
import { splitTextIntoWords } from '../animations/motions'
import ScrollIndicator from '../components/ScrollIndicator'

export default function Hero({ ready }) {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const metaRef = useRef(null)
  const subtagRef = useRef(null)

  // Generate deterministic realistic tall vector mountain ranges matching the reference
  const mountainPaths = useMemo(() => {
    return {
      // Distant range (Layer 1)
      back: "M0,520 L150,440 L280,360 L420,460 L580,380 L750,450 L920,330 L1080,440 L1240,350 L1440,480 L1440,850 L0,850 Z",
      backSnow1: "M250,380 L280,360 L310,385 Q280,395 250,380 Z",
      backSnow2: "M890,350 L920,330 L950,355 Q920,365 890,350 Z",
      backSnow3: "M1210,370 L1240,350 L1270,375 Q1240,385 1210,370 Z",

      // Midground range (Layer 2)
      mid: "M0,600 L200,480 L380,320 L580,500 L800,240 L980,140 L1180,450 L1280,380 L1440,490 L1440,850 L0,850 Z",
      midShade1: "M980,140 L1180,450 L980,550 Z", // Majestic peak right shade
      midShade2: "M380,320 L580,500 L380,470 Z", // Left-mid peak right shade
      midShade3: "M800,240 L980,380 L800,400 Z", // Center-left peak right shade

      // Foreground range (Layer 3)
      fore: "M0,680 L220,380 L480,620 L750,500 L1020,680 L1250,400 L1440,540 L1440,850 L0,850 Z",
      foreShade1: "M220,380 L480,620 L220,600 Z", // Left fore peak right shade
      foreShade2: "M1250,400 L1440,540 L1250,650 Z", // Right fore peak right shade
      foreShade3: "M750,500 L1020,680 L750,650 Z", // Center fore peak right shade
    }
  }, [])

  useEffect(() => {
    if (!ready) return

    const section = sectionRef.current
    const headline = headlineRef.current

    if (!section || !headline) return

    splitTextIntoWords(headline)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 })

      // Majestic entry for mountains and glowing sun
      tl.fromTo('.para-sun',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.2, ease: 'power3.out' }
      )

      tl.fromTo(['.para-back', '.para-mid', '.para-fore'],
        { y: 150, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.5, ease: 'power4.out', stagger: 0.15 },
        '-=1.8'
      )

      // Subtitle fades in
      tl.fromTo(subtagRef.current,
        { opacity: 0, y: 12, letterSpacing: '0.8em' },
        { opacity: 1, y: 0, letterSpacing: '0.5em', duration: 1.5, ease: 'expo.out' },
        '-=1.8'
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
        '-=1.4'
      )

      // Meta line + text
      tl.fromTo(metaRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1, ease: 'expo.out' },
        '-=0.8'
      )

      // Scroll-driven parallax timeline
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      scrollTl.to('.para-sun', { yPercent: 12, ease: 'none' }, 0)
      scrollTl.to('.para-back', { yPercent: 22, ease: 'none' }, 0)
      scrollTl.to('.para-mid', { yPercent: 32, ease: 'none' }, 0)
      scrollTl.to(headline, { yPercent: -12, opacity: 0.15, ease: 'none' }, 0)
      scrollTl.to(subtagRef.current, { yPercent: -12, opacity: 0, ease: 'none' }, 0)
      scrollTl.to(metaRef.current, { yPercent: -12, opacity: 0, ease: 'none' }, 0)
      scrollTl.to('.para-fore', { yPercent: 44, ease: 'none' }, 0)

    }, section)

    // Interactive mouse move parallax sways layers at different speeds
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const mouseX = (clientX / window.innerWidth) - 0.5
      const mouseY = (clientY / window.innerHeight) - 0.5

      gsap.to('.para-sun', { x: mouseX * 12, y: mouseY * 8, duration: 1.5, ease: 'power2.out' })
      gsap.to('.para-back', { x: mouseX * 24, y: mouseY * 12, duration: 1.5, ease: 'power2.out' })
      gsap.to('.para-mid', { x: mouseX * 36, y: mouseY * 18, duration: 1.5, ease: 'power2.out' })
      gsap.to(headline, { x: mouseX * -25, y: mouseY * -15, duration: 1.5, ease: 'power2.out' })
      gsap.to(subtagRef.current, { x: mouseX * -25, y: mouseY * -15, duration: 1.5, ease: 'power2.out' })
      gsap.to(metaRef.current, { x: mouseX * -25, y: mouseY * -15, duration: 1.5, ease: 'power2.out' })
      gsap.to('.para-fore', { x: mouseX * 52, y: mouseY * 28, duration: 1.5, ease: 'power2.out' })
    }

    const handleMouseLeave = () => {
      gsap.to([
        '.para-sun', '.para-back', '.para-mid', 
        headline, subtagRef.current, metaRef.current, 
        '.para-fore'
      ], {
        x: 0,
        y: 0,
        duration: 2,
        ease: 'power3.out'
      })
    }

    section.addEventListener('mousemove', handleMouseMove)
    section.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      ctx.revert()
      section.removeEventListener('mousemove', handleMouseMove)
      section.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ready])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full h-screen overflow-hidden bg-void pencil-texture select-none"
    >
      {/* Heavy grain overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ zIndex: 9 }}>
        <div className="w-full h-full grain-animation bg-noise" />
      </div>

      {/* Sky Background Gradient (Warm Sunrise) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF2AF] via-[#FCD5BD] to-[#E8C5C8] pointer-events-none" style={{ zIndex: 0 }} />

      {/* Sun / Moon Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none para-sun" style={{ zIndex: 1 }}>
        <svg className="w-[1440px] h-[800px] max-w-full max-h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#FFECA1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FCD5BD" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="720" cy="300" r="140" fill="url(#sunGlow)" />
        </svg>
      </div>

      {/* Layer 1: Distant Mountains (Lavender Pink + Snowcaps) */}
      <div className="absolute inset-0 pointer-events-none para-back" style={{ zIndex: 2 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          <path d={mountainPaths.back} fill="#D0B8C0" />
          <path d={mountainPaths.backSnow1} fill="#FFFFFF" opacity="0.95" />
          <path d={mountainPaths.backSnow2} fill="#FFFFFF" opacity="0.95" />
          <path d={mountainPaths.backSnow3} fill="#FFFFFF" opacity="0.95" />
        </svg>
      </div>

      {/* Layer 2: Midground Mountains (Rose/Pink Majestic Cliffs with Shaded Facets) */}
      <div className="absolute inset-0 pointer-events-none para-mid" style={{ zIndex: 3 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          <path d={mountainPaths.mid} fill="#B56576" />
          <path d={mountainPaths.midShade1} fill="#8B3D4A" opacity="0.85" />
          <path d={mountainPaths.midShade2} fill="#8B3D4A" opacity="0.85" />
          <path d={mountainPaths.midShade3} fill="#8B3D4A" opacity="0.85" />
        </svg>
      </div>

      {/* ── Main Headline (Sandwiched between Midground and Foreground Mountains) ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
        style={{ zIndex: 4 }}
      >
        <div ref={subtagRef} className="mb-6" style={{ opacity: 0 }}>
          <span className="font-sans text-[10px] tracking-[0.5em] text-[#8B3D4A] uppercase drop-shadow-sm font-bold">
            ArtBro Gallery
          </span>
        </div>

        <h1
          ref={headlineRef}
          className="font-serif font-light text-cream leading-[1.05] tracking-tight will-change-transform max-w-5xl mx-auto"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)', textShadow: '0 8px 30px rgba(139, 61, 74, 0.4)' }}
        >
          Connecting Creators & Art Lovers.
        </h1>

        <div ref={metaRef} className="mt-12 flex flex-col items-center gap-4" style={{ opacity: 0 }}>
          <div className="h-12 w-px bg-gradient-to-b from-[#8B3D4A]/50 to-transparent" />
          <span className="font-sans text-[9px] tracking-[0.3em] text-[#8B3D4A]/70 uppercase font-semibold">
            Sketches, Portraits & Custom Commissions
          </span>
        </div>
      </div>

      {/* Layer 3: Foreground Mountains (Deep Indigo/Violet Ridges with Shaded Facets) */}
      <div className="absolute inset-0 pointer-events-none para-fore" style={{ zIndex: 5 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          <path d={mountainPaths.fore} fill="#26294A" />
          <path d={mountainPaths.foreShade1} fill="#181A33" opacity="0.9" />
          <path d={mountainPaths.foreShade2} fill="#181A33" opacity="0.9" />
          <path d={mountainPaths.foreShade3} fill="#181A33" opacity="0.9" />
        </svg>
      </div>

      {/* Bottom Fade Gradient to void */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-void via-void/90 to-transparent pointer-events-none" style={{ zIndex: 8 }} />

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  )
}
