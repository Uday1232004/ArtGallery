import { useEffect, useRef, useMemo } from 'react'
import { gsap } from '../animations/gsap'
import { splitTextIntoWords } from '../animations/motions'
import ScrollIndicator from '../components/ScrollIndicator'

function generateTerrain(width, startY, endY, roughness, seed, minH, maxH) {
  let m_w = seed;
  let m_z = 987654321;
  const random = () => {
    m_w = (36969 * (m_w & 65535) + (m_w >> 16)) & 4294967295;
    m_z = (18000 * (m_z & 65535) + (m_z >> 16)) & 4294967295;
    return (((m_w << 16) + m_z) >>> 0) / 4294967296;
  }

  const segments = 128;
  const heights = new Array(segments + 1);
  heights[0] = startY;
  heights[segments] = endY;

  const displace = (l, r, roughnessVal) => {
    if (r - l <= 1) return;
    const mid = Math.floor((l + r) / 2);
    const avg = (heights[l] + heights[r]) / 2;
    const offset = (random() - 0.5) * roughnessVal * (r - l) * 0.75;
    
    // Apply boundary checks to keep heights realistic and layered
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

function generateForest(width, floorY, density, avgHeight, seed) {
  let m_w = seed;
  let m_z = 987654321;
  const random = () => {
    m_w = (36969 * (m_w & 65535) + (m_w >> 16)) & 4294967295;
    m_z = (18000 * (m_z & 65535) + (m_z >> 16)) & 4294967295;
    return (((m_w << 16) + m_z) >>> 0) / 4294967296;
  }

  let path = `M0,850 L0,${floorY}`;
  const step = width / density;
  
  for (let i = 0; i <= density; i++) {
    const x = i * step;
    const h = avgHeight * (0.75 + random() * 0.5); // height variance
    const w = h * 0.35; // base width proportional to height
    
    const yBase = floorY;
    const yMid = floorY - h * 0.4;
    const yMidNotch = floorY - h * 0.45;
    const yTop = floorY - h * 0.7;
    const yTopNotch = floorY - h * 0.75;
    const yPeak = floorY - h;

    // Draw multi-tiered pine tree outline
    path += ` L${(x - w * 0.5).toFixed(1)},${yBase.toFixed(1)}`;
    path += ` L${(x - w * 0.35).toFixed(1)},${yMid.toFixed(1)}`;
    path += ` L${(x - w * 0.2).toFixed(1)},${yMidNotch.toFixed(1)}`;
    path += ` L${(x - w * 0.2).toFixed(1)},${yTop.toFixed(1)}`;
    path += ` L${(x - w * 0.08).toFixed(1)},${yTopNotch.toFixed(1)}`;
    path += ` L${x.toFixed(1)},${yPeak.toFixed(1)}`;
    path += ` L${(x + w * 0.08).toFixed(1)},${yTopNotch.toFixed(1)}`;
    path += ` L${(x + w * 0.2).toFixed(1)},${yTop.toFixed(1)}`;
    path += ` L${(x + w * 0.2).toFixed(1)},${yMidNotch.toFixed(1)}`;
    path += ` L${(x + w * 0.35).toFixed(1)},${yMid.toFixed(1)}`;
    path += ` L${(x + w * 0.5).toFixed(1)},${yBase.toFixed(1)}`;
  }

  path += ` L${width},850 Z`;
  return path;
}

export default function Hero({ ready }) {
  const sectionRef = useRef(null)
  const headlineRef = useRef(null)
  const metaRef = useRef(null)
  const subtagRef = useRef(null)

  // Generate deterministic realistic tall mountain and pine forest ranges
  const mountainPaths = useMemo(() => {
    return {
      back: generateTerrain(1440, 240, 270, 1.6, 54321, 60, 420),
      mid: generateTerrain(1440, 320, 350, 2.1, 98765, 120, 460),
      forestMid: generateForest(1440, 560, 45, 65, 77777),
      fore: generateTerrain(1440, 420, 450, 2.6, 12345, 200, 540),
      forestFore: generateForest(1440, 660, 30, 100, 88888),
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

      // Majestic entry for mountains, forests, and glowing sun
      tl.fromTo('.para-sun',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.2, ease: 'power3.out' }
      )

      tl.fromTo(['.para-back', '.para-mid', '.para-forest-mid', '.para-fore', '.para-forest-fore'],
        { y: 150, opacity: 0 },
        { y: 0, opacity: 1, duration: 2.5, ease: 'power4.out', stagger: 0.12 },
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
      scrollTl.to('.para-forest-mid', { yPercent: 38, ease: 'none' }, 0)
      scrollTl.to(headline, { yPercent: -12, opacity: 0.15, ease: 'none' }, 0)
      scrollTl.to(subtagRef.current, { yPercent: -12, opacity: 0, ease: 'none' }, 0)
      scrollTl.to(metaRef.current, { yPercent: -12, opacity: 0, ease: 'none' }, 0)
      scrollTl.to('.para-fore', { yPercent: 44, ease: 'none' }, 0)
      scrollTl.to('.para-forest-fore', { yPercent: 50, ease: 'none' }, 0)

    }, section)

    // Interactive mouse move parallax sways layers at different speeds
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const mouseX = (clientX / window.innerWidth) - 0.5
      const mouseY = (clientY / window.innerHeight) - 0.5

      gsap.to('.para-sun', { x: mouseX * 12, y: mouseY * 8, duration: 1.5, ease: 'power2.out' })
      gsap.to('.para-back', { x: mouseX * 24, y: mouseY * 12, duration: 1.5, ease: 'power2.out' })
      gsap.to('.para-mid', { x: mouseX * 36, y: mouseY * 18, duration: 1.5, ease: 'power2.out' })
      gsap.to('.para-forest-mid', { x: mouseX * 42, y: mouseY * 22, duration: 1.5, ease: 'power2.out' })
      gsap.to(headline, { x: mouseX * -25, y: mouseY * -15, duration: 1.5, ease: 'power2.out' })
      gsap.to(subtagRef.current, { x: mouseX * -25, y: mouseY * -15, duration: 1.5, ease: 'power2.out' })
      gsap.to(metaRef.current, { x: mouseX * -25, y: mouseY * -15, duration: 1.5, ease: 'power2.out' })
      gsap.to('.para-fore', { x: mouseX * 52, y: mouseY * 28, duration: 1.5, ease: 'power2.out' })
      gsap.to('.para-forest-fore', { x: mouseX * 62, y: mouseY * 32, duration: 1.5, ease: 'power2.out' })
    }

    const handleMouseLeave = () => {
      gsap.to([
        '.para-sun', '.para-back', '.para-mid', '.para-forest-mid', 
        headline, subtagRef.current, metaRef.current, 
        '.para-fore', '.para-forest-fore'
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

      {/* Sky Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#181512] via-[#0d0c0b] to-[#080808] pointer-events-none" style={{ zIndex: 0 }} />

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
          <circle cx="720" cy="240" r="150" fill="url(#sunGlow)" />
          <circle cx="720" cy="240" r="65" fill="#C9A96E" opacity="0.12" />
        </svg>
      </div>

      {/* Layer 1: Distant Mountains */}
      <div className="absolute inset-0 pointer-events-none para-back" style={{ zIndex: 2 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          <path
            d={mountainPaths.back}
            fill="#121212"
            stroke="rgba(201, 169, 110, 0.12)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Layer 2: Midground Mountains */}
      <div className="absolute inset-0 pointer-events-none para-mid" style={{ zIndex: 3 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          <path
            d={mountainPaths.mid}
            fill="#161616"
            stroke="rgba(201, 169, 110, 0.2)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Layer 2b: Midground Pine Forest */}
      <div className="absolute inset-0 pointer-events-none para-forest-mid" style={{ zIndex: 4 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          <path
            d={mountainPaths.forestMid}
            fill="#1b1b1b"
            stroke="rgba(201, 169, 110, 0.12)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* ── Main Headline (Sandwiched between Midground Forest and Foreground Mountains) ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
        style={{ zIndex: 5 }}
      >
        <div ref={subtagRef} className="mb-6" style={{ opacity: 0 }}>
          <span className="font-sans text-[10px] tracking-[0.5em] text-gold uppercase drop-shadow-sm">
            ArtBro Gallery
          </span>
        </div>

        <h1
          ref={headlineRef}
          className="font-serif font-light text-cream leading-[1.05] tracking-tight will-change-transform max-w-5xl mx-auto"
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

      {/* Layer 3: Foreground Mountains */}
      <div className="absolute inset-0 pointer-events-none para-fore" style={{ zIndex: 6 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          <path
            d={mountainPaths.fore}
            fill="#0b0b0b"
            stroke="rgba(201, 169, 110, 0.4)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Layer 3b: Foreground Pine Forest */}
      <div className="absolute inset-0 pointer-events-none para-forest-fore" style={{ zIndex: 7 }}>
        <svg className="w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMax slice">
          <path
            d={mountainPaths.forestFore}
            fill="#050505"
            stroke="rgba(201, 169, 110, 0.5)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Bottom Fade Gradient to void */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-void via-void/90 to-transparent pointer-events-none" style={{ zIndex: 8 }} />

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  )
}
