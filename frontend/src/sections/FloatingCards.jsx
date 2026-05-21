import { useEffect, useRef } from 'react'
import { gsap } from '../animations/gsap'
import { parallax } from '../animations/motions'

const CARDS = [
  {
    image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&q=85&auto=format&fit=crop',
    title: 'Ephemeral Forms',
    tag: 'Digital Oil',
    size: 'large',
    top: '0%', left: '0%',
    parallaxSpeed: 0.4,
  },
  {
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=85&auto=format&fit=crop',
    title: 'Chromatic Depth',
    tag: 'Generative',
    size: 'small',
    top: '10%', left: '45%',
    parallaxSpeed: -0.3,
  },
  {
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=600&q=85&auto=format&fit=crop',
    title: 'Shadow Study IV',
    tag: 'Photography',
    size: 'medium',
    top: '40%', left: '25%',
    parallaxSpeed: 0.6,
  },
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=85&auto=format&fit=crop',
    title: 'Still Life No.12',
    tag: 'Mixed Media',
    size: 'small',
    top: '55%', left: '65%',
    parallaxSpeed: -0.5,
  },
]

export default function FloatingCards() {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean)

      // Section headline reveal
      gsap.fromTo(section.querySelector('.floating-headline'),
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: section, start: 'top 75%' },
        }
      )

      // Staggered entrance for cards
      gsap.fromTo(cards,
        { opacity: 0, y: 80, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1, stagger: 0.14, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: cards[0], start: 'top 85%' },
        }
      )

      // Individual parallax speeds
      cards.forEach((card, i) => {
        const speed = CARDS[i]?.parallaxSpeed || 0.3
        parallax(card, speed, { trigger: section, start: 'top bottom', end: 'bottom top' })
        
        // Inner image subtle opposite parallax for depth
        const img = card.querySelector('img')
        if (img) {
          gsap.to(img, {
            yPercent: speed > 0 ? -15 : 15,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
          })
        }
      })

      // SVG path animation
      const path = section.querySelector('.connecting-path')
      if (path) {
        const length = path.getTotalLength?.() || 1000
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top 70%', end: 'bottom 40%', scrub: 1 },
        })
      }

    }, section)

    return () => ctx.revert()
  }, [])

  const sizeMap = { large: 'w-64 h-80 md:w-80 md:h-96', medium: 'w-52 h-64 md:w-64 md:h-80', small: 'w-40 h-52 md:w-52 md:h-64' }

  return (
    <section ref={sectionRef} className="relative bg-obsidian py-32 md:py-52 overflow-hidden min-h-screen">
      <div className="grid-lines absolute inset-0" />

      <div className="max-w-[1600px] mx-auto px-8 md:px-16 relative z-10">
        {/* Label */}
        <div className="flex items-center gap-4 mb-8">
          <span className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase">04 — Selected Works</span>
          <div className="h-px w-20 bg-white/10" />
        </div>

        {/* Headline */}
        <h2
          className="floating-headline font-serif font-light text-ivory leading-tight max-w-3xl mb-20 will-change-transform"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', opacity: 0 }}
        >
          Pieces That Live in the Space Between Reality and Imagination
        </h2>

        {/* Asymmetric floating card grid */}
        <div className="relative" style={{ height: '700px' }}>
          {/* SVG brushstroke connecting path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <path
              className="connecting-path"
              d="M 100 100 C 250 50, 400 200, 320 300 C 240 400, 500 350, 580 480"
              fill="none"
              stroke="rgba(201,169,110,0.2)"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 8px rgba(201,169,110,0.3))' }}
            />
          </svg>

          {/* Cards */}
          {CARDS.map((card, i) => (
            <div
              key={card.title}
              ref={(el) => (cardsRef.current[i] = el)}
              className={`absolute overflow-hidden rounded-sm group cursor-none will-change-transform ${sizeMap[card.size]}`}
              style={{ top: card.top, left: card.left, zIndex: i + 1, opacity: 0 }}
              data-cursor-hover
            >
              <div className="w-full h-full overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover img-cinematic transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute bottom-4 left-4 transform transition-transform duration-700 group-hover:-translate-y-2">
                <p className="font-sans text-[9px] tracking-[0.3em] text-gold/70 uppercase mb-1">{card.tag}</p>
                <p className="font-serif text-base text-ivory">{card.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

