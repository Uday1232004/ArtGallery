import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../animations/gsap'

export default function ScrollingLine() {
  const svgRef = useRef(null)
  const pathDrawRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    const pathDraw = pathDrawRef.current
    if (!svg || !pathDraw) return

    const build = () => {
      const totalHeight = svg.parentElement.scrollHeight || document.documentElement.scrollHeight
      const vw = window.innerWidth
      const h = totalHeight
      const cx = vw * 0.5
      const amp = vw * 0.38 // Wide sweep range
      const segments = 22 // High-frequency segments for a tight winding ribbon
      const segH = h / segments

      // Seeded random helper for stable, organic, hand-drawn wiggles
      let seed = 108
      const random = () => {
        const x = Math.sin(seed++) * 10000
        return x - Math.floor(x)
      }

      // Build asymmetric, organic curvy path
      // Wiggles back and forth, looping under content blocks organically
      let d = `M ${cx * 1.15} 0`
      for (let i = 0; i < segments; i++) {
        const y0 = i * segH
        const y1 = y0 + segH
        
        const dir = i % 2 === 0 ? 1 : -1
        // Randomize the amplitude sweep width per wave segment
        const segmentAmp = amp * (0.6 + random() * 0.65)
        
        // Randomize the Bezier tension (control points height)
        const cp1y = y0 + segH * (0.15 + random() * 0.25)
        const cp2y = y0 + segH * (0.55 + random() * 0.30)
        
        // Loop-back Bezier offsets to create winding horizontal thread wiggles
        const cp1x = cx + dir * segmentAmp * (0.95 + random() * 0.35)
        const cp2x = cx - dir * segmentAmp * (0.45 + random() * 0.40) // Opposing pull for loop shape
        
        // Slightly random crossing x coordinate
        const endX = cx + (random() - 0.5) * cx * 0.25

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${y1}`
      }

      svg.setAttribute('viewBox', `0 0 ${vw} ${h}`)
      svg.style.height = `${h}px`
      pathDraw.setAttribute('d', d)

      // Animate the drawn path using stroke-dashoffset
      const length = pathDraw.getTotalLength()

      gsap.set(pathDraw, {
        strokeDasharray: length,
        strokeDashoffset: length,
      })

      // Kill previous ScrollTrigger for this
      ScrollTrigger.getAll()
        .filter(t => t.vars?.id === 'scroll-snake-line')
        .forEach(t => t.kill())

      gsap.to(pathDraw, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          id: 'scroll-snake-line',
          trigger: svg.parentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      })
    }

    // Wait for layout to settle (after preloader / fonts)
    const timer = setTimeout(build, 900)
    window.addEventListener('resize', () => setTimeout(build, 300))
    return () => clearTimeout(timer)
  }, [])

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="absolute top-0 left-0 w-full pointer-events-none"
      style={{ height: '100vh', zIndex: 0 }}
      preserveAspectRatio="none"
    >
      {/* Animated drawn line — thick, bold ribbon-like stroke */}
      <path
        ref={pathDrawRef}
        fill="none"
        stroke="#C9A96E"
        strokeWidth="4.5"
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 10px rgba(201,169,110,0.4))' }}
      />
    </svg>
  )
}
