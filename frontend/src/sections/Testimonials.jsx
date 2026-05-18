import { useEffect, useRef, useState } from 'react'
import { gsap } from '../animations/gsap'

const QUOTES = [
  {
    text: "The works here possess a rare quality — they don't simply occupy space, they transform it. Each piece carries a distinct emotional weight that lingers long after you look away.",
    author: "Elena Vasquez",
    role: "Curator, Modern Arts Institute",
  },
  {
    text: "What sets ARTHAUS apart is an unwavering commitment to intentionality. Every texture, every gradient feels considered — art that refuses to be ignored.",
    author: "Marcus Chen",
    role: "Art Collector & Patron",
  },
  {
    text: "Discovering this collection fundamentally changed how I approach my own practice. The digital works here prove that the medium is no limitation — only the imagination.",
    author: "Isabelle Fontaine",
    role: "Visual Artist",
  },
]

export default function Testimonials() {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)
  const quoteRef = useRef(null)
  const authorRef = useRef(null)

  const goTo = (index) => {
    if (index === active) return
    const quote = quoteRef.current
    const author = authorRef.current
    if (!quote || !author) return

    // Smooth exit
    gsap.to([quote, author], {
      opacity: 0,
      y: -15,
      duration: 0.4,
      ease: 'power2.in',
      stagger: 0.05,
      onComplete: () => {
        setActive(index)
        // Smooth entrance
        gsap.fromTo([quote, author],
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1 }
        )
      }
    })
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const ctx = gsap.context(() => {
      // Staggered reveal for initial load
      gsap.fromTo(section.querySelectorAll('.t-reveal'),
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, stagger: 0.15, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: section, start: 'top 75%' },
        }
      )
    }, section)
    return () => ctx.revert()
  }, [])

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      goTo((active + 1) % QUOTES.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [active])

  const q = QUOTES[active]

  return (
    <section ref={sectionRef} className="relative bg-obsidian py-32 md:py-48 overflow-hidden">
      <div className="grid-lines absolute inset-0" />
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 relative z-10">
        {/* Label */}
        <div className="flex items-center gap-4 mb-20 t-reveal will-change-transform" style={{ opacity: 0 }}>
          <span className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase">06 — Voices</span>
          <div className="h-px w-16 bg-white/10" />
        </div>

        {/* Large quote mark */}
        <div className="t-reveal font-serif text-[8rem] md:text-[12rem] leading-none text-gold/10 -mb-8 select-none will-change-transform" style={{ opacity: 0 }}>"</div>

        {/* Quote text */}
        <div className="min-h-[160px] md:min-h-[120px]">
          <blockquote ref={quoteRef} className="font-serif font-light text-ivory leading-[1.3] mb-10 will-change-transform"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 3rem)' }}>
            {q.text}
          </blockquote>
        </div>

        {/* Author */}
        <div ref={authorRef} className="flex items-center gap-5 will-change-transform">
          <div className="h-px w-12 bg-gold/40" />
          <div>
            <div className="font-sans text-sm md:text-base text-ivory">{q.author}</div>
            <div className="font-sans text-[10px] tracking-[0.25em] text-mist uppercase mt-1.5">{q.role}</div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-4 mt-16 t-reveal will-change-transform" style={{ opacity: 0 }}>
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              data-cursor-hover
              className={`transition-all duration-500 rounded-full cursor-pointer ${
                i === active ? 'w-10 h-[2px] bg-gold' : 'w-2 h-[2px] bg-white/20 hover:bg-white/50'
              }`}
              aria-label={`Go to quote ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
