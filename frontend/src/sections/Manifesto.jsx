import { useEffect, useRef } from 'react'
import { gsap } from '../animations/gsap'

export default function Manifesto() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)
  const wordsRef = useRef([])

  // The emotional quote
  const quote = "Some drawings take hours. Some take memories. Not every sketch is perfect, but every single stroke is personal."

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const words = wordsRef.current.filter(Boolean)
    const totalWords = words.length

    const ctx = gsap.context(() => {
      // Pin the section for storytelling focus
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=120%', // Pin for 120% of viewport height
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        }
      })

      // Background ambient glow subtle swell
      tl.to(section.querySelector('.ambient-glow'), {
        opacity: 0.15,
        scale: 1.1,
        duration: totalWords,
        ease: 'none'
      }, 0)

      // Word by word color fill & lift
      words.forEach((word, i) => {
        const wordTl = gsap.timeline()
        wordTl.to(word, {
          color: '#EBE5DC', // cream color
          textShadow: '0 0 20px rgba(235, 229, 220, 0.4)',
          duration: 1,
          ease: 'power2.inOut',
        }, 0)
        
        wordTl.fromTo(word, 
          { y: 8 },
          { y: 0, duration: 1, ease: 'power2.out' },
          0
        )

        tl.add(wordTl, i * 0.4)
      })

      // Progress bar fill
      tl.to(section.querySelector('.progress-fill'), {
        scaleX: 1,
        ease: 'none',
        duration: totalWords * 0.4
      }, 0)

    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="manifesto" className="relative h-screen bg-transparent flex flex-col items-center justify-center overflow-hidden pencil-texture">
      {/* Ambient background glow */}
      <div className="ambient-glow absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,155,114,0.1)_0%,transparent_50%)] opacity-5 will-change-transform" />

      {/* Main Quote */}
      <div className="relative z-10 w-full max-w-5xl px-8 md:px-16 text-center">
        <h2 ref={textRef} className="font-serif font-light text-mist leading-[1.3] md:leading-[1.2]" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}>
          {quote.split(' ').map((word, i) => (
            <span
              key={i}
              ref={el => wordsRef.current[i] = el}
              className="inline-block mx-[0.15em] will-change-transform"
              style={{ color: '#2A2726' }} // soft-ink initial color
            >
              {word}
            </span>
          ))}
        </h2>
      </div>

      {/* Scroll indicator for pinned section */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10">
        <span className="font-sans text-[9px] tracking-[0.3em] text-ivory/30 uppercase">Behind the Art</span>
        <div className="w-px h-16 bg-white/10 relative overflow-hidden">
          <div className="progress-fill absolute top-0 left-0 w-full h-full bg-gold/50 origin-top" style={{ transform: 'scaleY(0)' }} />
        </div>
      </div>
    </section>
  )
}
