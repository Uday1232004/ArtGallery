import { useEffect, useRef, useState } from 'react'
import { gsap } from '../animations/gsap'
import { Link } from 'react-router-dom'
import { useCursor } from '../context/CursorContext'

const PROCESS_STEPS = [
  { step: '01', title: 'Pen Art', desc: 'Intricate detailing and fine strokes constructed using professional fineliners to bring complex patterns to life.', image: '/Bijay Biswal.jpeg' },
  { step: '02', title: 'Oil Painting', desc: 'Rich, layered textures and deep chromatic harmony celebrating traditional realistic representation and dynamic shading.', image: '/GIRIDHAR GOPAL.jpeg' },
  { step: '03', title: 'Abstract Art', desc: 'Fluid expressions, bold movements, and spontaneous creations that explore the pure balance of form, shadow, and color.', image: '/Horse Painting_ Equestrian Elegance.jpeg' },
  { step: '04', title: 'Digital Art', desc: 'Vibrant digital compositions combining modern tools, rich light values, and imaginative character creations.', image: '/Joyful Golden Retriever iPhone Wallpaper _ Sunflower Field.jpeg' },
  { step: '05', title: 'Pop Art', desc: 'Retro elements and bold color palettes celebrating contemporary themes and modern vehicle aesthetics.', image: '/Vintage Mustang Wall Art - Hang it in Your Garage or Living Room.jpeg' },
]

export default function HorizontalGallery() {
  const wrapperRef = useRef(null)
  const trackRef = useRef(null)
  const progressRef = useRef(null)
  const { setHoverState, resetCursor } = useCursor()

  useEffect(() => {
    const wrapper = wrapperRef.current
    const track = trackRef.current
    if (!wrapper || !track) return

    const ctx = gsap.context(() => {
      gsap.delayedCall(0.15, () => {
        const totalScroll = track.scrollWidth - window.innerWidth

        // Horizontal scroll animation
        const hsTl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: () => `+=${totalScroll}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        hsTl.to(track, { x: -totalScroll, ease: 'none' }, 0)

        // Progress bar
        if (progressRef.current) {
          hsTl.fromTo(progressRef.current,
            { scaleX: 0 },
            { scaleX: 1, ease: 'none' },
            0
          )
        }

        // Card staggered entrances
        const cards = track.querySelectorAll('.process-card')
        cards.forEach((card) => {
          gsap.fromTo(card,
            { opacity: 0.3, y: 30, scale: 0.98 },
            {
              opacity: 1, y: 0, scale: 1,
              duration: 1, ease: 'expo.out',
              scrollTrigger: {
                trigger: card,
                containerAnimation: hsTl,
                start: 'left 90%',
                toggleActions: 'play none none none',
              },
            }
          )
        })
      })

      // Label entrance
      gsap.fromTo(wrapper.querySelector('.gallery-label'),
        { opacity: 0, y: 15 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: wrapper, start: 'top 85%' },
        }
      )
    }, wrapper)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={wrapperRef} id="process" className="relative bg-transparent overflow-hidden pencil-texture">
      {/* Label */}
      <div className="gallery-label sticky top-0 z-20 pt-12 pb-6 px-8 md:px-16 flex items-center justify-between bg-obsidian/60 backdrop-blur-md border-b border-white/5" style={{ opacity: 0 }}>
        <div className="flex items-center gap-4">
          <span className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase">The Process</span>
          <div className="h-px w-20 bg-white/10" />
        </div>
        <span className="font-sans text-[10px] tracking-[0.3em] text-mist uppercase hidden md:block">
          Scroll to trace the journey →
        </span>
      </div>

      {/* Horizontal track */}
      <div
        ref={trackRef}
        className="horizontal-track py-20 md:py-24 will-change-transform"
        style={{ width: 'max-content', display: 'flex', gap: '4rem', alignItems: 'center' }}
      >
        {/* Intro text */}
        <div className="flex-shrink-0 w-[60vw] md:w-[40vw] pl-8 md:pl-16">
          <h2 className="font-serif font-light text-cream leading-[1.1] mb-6"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
            From Blank Paper<br />to Breathing Soul.
          </h2>
          <p className="font-sans text-sm md:text-base text-ivory/60 leading-relaxed max-w-sm">
            It isn't just about drawing what I see. It's about translating emotion through the tip of a pencil. This is how a memory takes physical form.
          </p>
        </div>

        {/* Process Cards */}
        {PROCESS_STEPS.map((step) => (
          <div
            key={step.step}
            className="process-card flex-shrink-0 flex flex-col gap-6"
            style={{ width: 'clamp(280px, 32vw, 420px)' }}
          >
            <div 
              className="relative aspect-[3/4] overflow-hidden rounded-sm"
              onMouseEnter={() => setHoverState('artwork', step.title)}
              onMouseLeave={resetCursor}
            >
              <img src={step.image} alt={step.title} className="w-full h-full object-cover img-cinematic mix-blend-luminosity opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent opacity-60" />
              <div className="absolute top-4 left-4 font-serif text-4xl text-ivory/20">{step.step}</div>
            </div>
            <div>
              <h3 className="font-serif text-2xl text-cream mb-1">{step.title}</h3>
            </div>
          </div>
        ))}

        {/* End spacer */}
        <div className="flex-shrink-0 w-[15vw]" />
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/5 z-20">
        <div
          ref={progressRef}
          className="h-full bg-gold/60 origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </section>
  )
}

