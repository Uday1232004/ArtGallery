import { useEffect, useRef, useMemo } from 'react'
import { gsap } from '../animations/gsap'
import { splitTextIntoWords } from '../animations/motions'
import ScrollIndicator from '../components/ScrollIndicator'

const PREVIEWS = [
  { img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80', top: '20%', left: '8%', size: 'w-44 md:w-56', speed: 0.2 },
  { img: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80', top: '14%', left: '72%', size: 'w-48 md:w-60', speed: -0.15 },
  { img: 'https://images.unsplash.com/photo-1516981442399-a91139e20ff8?w=800&q=80', top: '48%', left: '82%', size: 'w-36 md:w-44', speed: 0.3 },
]

function generateTerrain(width, startY, endY, roughness, seed, minH, maxH) {
  let m_w = seed;
  let m_z = 987654321;
  const random = () => {
    m_w = (36969 * (m_w & 65535) + (m_w >> 16)) & 4294967295;
    m_z = (18000 * (m_z & 65535) + (m_z >> 16)) & 4294967295;
    return (((m_w << 16) + m_z) >>> 0) / 4294967296;
  }

  const segments = 180; // High segment density for organic, realistic details
  const heights = new Array(segments + 1);
  heights[0] = startY;
  heights[segments] = endY;

  const displace = (l, r, roughnessVal) => {
    if (r - l <= 1) return;
    const mid = Math.floor((l + r) / 2);
    const avg = (heights[l] + heights[r]) / 2;
    const offset = (random() - 0.5) * roughnessVal * (r - l) * 0.8;
    
    // Boundary check to maintain organic layering
    heights[mid] = Math.max(minH, Math.min(maxH, avg + offset));

    displace(l, mid, roughnessVal);
    displace(mid, r, roughnessVal);
  }

  displace(0, segments, roughness);

  let path = `M0,${heights[0].toFixed(1)}`;
  for (let i = 1; i <= segments; i++) {
    const x = (i / segments) * width;
    path += ` L${x.toFixed(1)},${heights[i].toFixed(1)}`;
  }
  path += ` L${width},850 L0,850 Z`;
  return path;
}

export default function Hero({ ready }) {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const metaRef = useRef(null)
  const subtagRef = useRef(null)
  const previewsRef = useRef([])

  // Generate deterministic realistic tall mountain ranges with rugged, organic detail
  const mountainPaths = useMemo(() => {
    return {
      back: generateTerrain(1440, 280, 310, 1.4, 54321, 80, 440),
      mid: generateTerrain(1440, 360, 390, 2.0, 98765, 140, 490),
      fore: generateTerrain(1440, 440, 470, 2.6, 12345, 200, 560),
    }
  }, [])

  useEffect(() => {
    if (!ready) return

    const section = sectionRef.current
    const headline = headlineRef.current
    const previews = previewsRef.current.filter(Boolean)

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

      // Floating art previews fade in
      tl.fromTo(previews,
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 0.35, scale: 1, y: 0, duration: 2, ease: 'power2.out', stagger: 0.12 },
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

      // Continuous ambient float for art previews
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
      previews.forEach((p, i) => {
        scrollTl.to(p, { yPercent: PREVIEWS[i].speed * 160, opacity: 0, ease: 'none' }, 0)
      })
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
      previews.forEach((p, i) => {
        const factor = i === 0 ? 25 : i === 1 ? -15 : 35
        gsap.to(p, { x: mouseX * factor, y: mouseY * (factor / 2), duration: 1.8, ease: 'power2.out' })
      })
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
      gsap.to(previews, {
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
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ zIndex: 10 }}>
        <div className="w-full h-full grain-animation bg-noise" />
      </div>

      {/* Sky Background Gradient (Dark Charcoal to Burnished Amber/Gold Sunset) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#1F1A15] to-[#2E251E] pointer-events-none" style={{ zIndex: 0 }} />

      {/* Sun / Moon Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none para-sun" style={{ zIndex: 1 }}>
        <svg className="w-[1440px] h-[800px] max-w-full max-h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#C9A96E" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="720" cy="300" r="140" fill="url(#sunGlow)" />
        </svg>
      </div>

      {/* Layer 1: Distant Mountains (Realistic Procedural Ridge + Gold/Ivory Snowcaps) */}
      <div className="absolute inset-0 pointer-events-none para-back" style={{ zIndex: 2 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          <defs>
            {/* Fine procedural rock grain filter */}
            <filter id="rockNoise">
              <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="4" result="noise" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.14 0" />
              <feComposite operator="in" in2="SourceGraphic" />
              <feBlend mode="overlay" in2="SourceGraphic" />
            </filter>
          </defs>

          {/* Base */}
          <path d={mountainPaths.back} fill="#1A1715" filter="url(#rockNoise)" />
          
          {/* Detailed Golden highlight stroke to match sunset rim light */}
          <path d={mountainPaths.back} fill="none" stroke="#C9A96E" strokeWidth="1" opacity="0.2" />
        </svg>
      </div>

      {/* Layer 2: Midground Mountains (Realistic Procedural Cliffs in Dark Charcoal & Bronze) */}
      <div className="absolute inset-0 pointer-events-none para-mid" style={{ zIndex: 3 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          {/* Horizontal ambient cloud bands */}
          <path d="M100,320 Q200,300 350,320 T600,320" fill="none" stroke="#C9A96E" strokeWidth="20" strokeLinecap="round" opacity="0.08" />
          <path d="M750,280 Q900,260 1050,280 T1350,280" fill="none" stroke="#C9A96E" strokeWidth="35" strokeLinecap="round" opacity="0.08" />

          {/* Base */}
          <path d={mountainPaths.mid} fill="#131110" filter="url(#rockNoise)" />
          
          {/* Detailed Golden highlight stroke */}
          <path d={mountainPaths.mid} fill="none" stroke="#C9A96E" strokeWidth="1.5" opacity="0.3" />
        </svg>
      </div>

      {/* Floating Ambient Art Previews (Sandwiched in 3D Valley) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 4 }}>
        {PREVIEWS.map((p, i) => (
          <div
            key={i}
            ref={(el) => (previewsRef.current[i] = el)}
            className={`absolute aspect-[3/4] ${p.size} opacity-0 pointer-events-auto will-change-transform rounded-sm overflow-hidden border border-gold/20 shadow-[0_15px_40px_rgba(0,0,0,0.9)]`}
            style={{ top: p.top, left: p.left }}
          >
            <img 
              src={p.img} 
              alt="Featured Art Preview" 
              className="w-full h-full object-cover grayscale contrast-[1.08] brightness-[0.85] hover:grayscale-0 hover:brightness-100 transition-all duration-[1.8s] ease-out" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* ── Main Headline (Sandwiched between Midground and Foreground Mountains) ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
        style={{ zIndex: 5 }}
      >
        <div ref={subtagRef} className="mb-6" style={{ opacity: 0 }}>
          <span className="font-sans text-[10px] tracking-[0.5em] text-[#C9A96E] uppercase drop-shadow-sm font-bold">
            ArtBro Gallery
          </span>
        </div>

        <h1
          ref={headlineRef}
          className="font-serif font-light text-cream leading-[1.05] tracking-tight will-change-transform max-w-5xl mx-auto"
          style={{ fontSize: 'clamp(3.5rem, 8vw, 8rem)', textShadow: '0 8px 30px rgba(0, 0, 0, 0.7)' }}
        >
          Connecting Creators & Art Lovers.
        </h1>

        <div ref={metaRef} className="mt-12 flex flex-col items-center gap-4" style={{ opacity: 0 }}>
          <div className="h-12 w-px bg-gradient-to-b from-[#C9A96E]/50 to-transparent" />
          <span className="font-sans text-[9px] tracking-[0.3em] text-[#C9A96E]/70 uppercase font-semibold">
            Sketches, Portraits & Custom Commissions
          </span>
        </div>
      </div>

      {/* Layer 3: Foreground Mountains (Organic Procedural Ridges + Gold Highlight Strokes) */}
      <div className="absolute inset-0 pointer-events-none para-fore" style={{ zIndex: 6 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          {/* Base */}
          <path d={mountainPaths.fore} fill="#080808" filter="url(#rockNoise)" />
          
          {/* Gold highlights on active organic ridges */}
          <path d={mountainPaths.fore} fill="none" stroke="#C9A96E" strokeWidth="2.0" opacity="0.45" />
        </svg>
      </div>

      {/* Bottom Fade Gradient to void */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-void via-void/90 to-transparent pointer-events-none" style={{ zIndex: 8 }} />

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  )
}
