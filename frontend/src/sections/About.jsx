import { useEffect, useRef } from 'react'
import { gsap } from '../animations/gsap'
import { splitTextIntoWords } from '../animations/motions'

export default function About() {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const headlineRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Line grows in
      gsap.fromTo(section.querySelector('.about-line'),
        { scaleX: 0 },
        {
          scaleX: 1, transformOrigin: 'left', duration: 1.5, ease: 'expo.out',
          scrollTrigger: { trigger: section, start: 'top 80%' },
        }
      )

      // Headline word reveal
      if (headlineRef.current) {
        splitTextIntoWords(headlineRef.current)
        gsap.fromTo(
          headlineRef.current.querySelectorAll('.word-inner'),
          { yPercent: 120, opacity: 0 },
          {
            yPercent: 0, opacity: 1,
            stagger: 0.05, duration: 1.2, ease: 'expo.out',
            scrollTrigger: { trigger: headlineRef.current, start: 'top 85%' },
          }
        )
      }

      // Clip-path image reveal
      if (imageRef.current) {
        gsap.fromTo(imageRef.current,
          { clipPath: 'inset(100% 0 0 0)', opacity: 0 },
          {
            clipPath: 'inset(0% 0 0 0)', opacity: 1,
            duration: 1.6, ease: 'expo.out',
            scrollTrigger: { trigger: imageRef.current, start: 'top 85%' },
          }
        )
        // Image parallax scale
        gsap.fromTo(imageRef.current.querySelector('img'),
          { scale: 1.15 },
          {
            scale: 1, duration: 2, ease: 'power2.out',
            scrollTrigger: { trigger: imageRef.current, start: 'top 85%' },
          }
        )
      }

      // Paragraph stagger
      const paras = section.querySelectorAll('.about-para')
      gsap.fromTo(paras,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, stagger: 0.15, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: paras[0], start: 'top 85%' },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative bg-transparent py-32 md:py-48 overflow-hidden"
    >
      <div className="grid-lines absolute inset-0 opacity-50" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-8 md:px-16">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-20">
          <span className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase">
            Our Vision
          </span>
          <div className="about-line h-px flex-1 max-w-xs bg-gradient-to-r from-gold/40 to-transparent" style={{ transform: 'scaleX(0)' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left — Portrait / Process Image */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div
              ref={imageRef}
              className="relative overflow-hidden rounded-sm aspect-[4/5]"
              style={{ clipPath: 'inset(100% 0 0 0)' }}
            >
              <img
                src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80&auto=format&fit=crop"
                alt="Artist sketching"
                className="w-full h-full object-cover img-cinematic"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent mix-blend-multiply" />
            </div>
          </div>

          {/* Right — Story */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <h2
              ref={headlineRef}
              className="font-serif font-light text-cream leading-tight mb-12"
              style={{ fontSize: 'clamp(2.5rem, 4vw, 4.5rem)' }}
            >
              Connecting Collectors,<br />Creators & Art Lovers.
            </h2>

            <div className="max-w-xl">
              <p className="about-para font-sans text-base md:text-lg text-ivory/70 leading-relaxed mb-6">
                ArtBro Gallery is a premium cinematic platform dedicated to the love of fine sketches, drawings, and paintings. We serve as the ultimate hub for art enthusiasts seeking bespoke portrait commissions, and creators looking to build their digital showcases, present their portfolios, and connect with global collectors.
              </p>
              <p className="about-para font-sans text-base md:text-lg text-ivory/70 leading-relaxed mb-12">
                Whether you want to commission a hand-drawn portrait of a loved one, purchase original sketches, or create your own artist account to share your creations directly with a passionate audience, ArtBro Gallery bridges the gap with a seamless, immersive art experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
