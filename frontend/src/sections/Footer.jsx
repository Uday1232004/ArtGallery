import { useEffect, useRef } from 'react'
import { gsap } from '../animations/gsap'

export default function Footer() {
  const footerRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    const footer = footerRef.current
    const text = textRef.current
    if (!footer || !text) return

    const ctx = gsap.context(() => {
      // Parallax text effect
      gsap.fromTo(text,
        { yPercent: -50, scale: 0.9, opacity: 0 },
        {
          yPercent: 0,
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: footer,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true,
          }
        }
      )

      // Fade in links
      gsap.fromTo(footer.querySelectorAll('.f-reveal'),
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, stagger: 0.1, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: footer, start: 'top 80%' }
        }
      )
    }, footer)

    return () => ctx.revert()
  }, [])

  const currentYear = new Date().getFullYear()

  return (
    <footer ref={footerRef} className="relative bg-transparent pt-32 pb-12 overflow-hidden pencil-texture">
      <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent z-0" />

      <div className="max-w-[1600px] mx-auto px-8 md:px-16 relative z-10 flex flex-col h-full justify-between">
        
        {/* Top Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32 f-reveal" style={{ opacity: 0 }}>
          <div className="max-w-sm">
            <h3 className="font-serif text-3xl text-cream mb-4">ArtBro Sketches</h3>
            <p className="font-sans text-sm text-ivory/50 leading-relaxed">
              A premium cinematic art gallery and ecommerce platform exploring the intersection of emotion, logic, and visual storytelling.
            </p>
          </div>
          
          <div className="flex gap-16 md:justify-end">
            <div>
              <p className="font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-4">Connect</p>
              <ul className="flex flex-col gap-3">
                <li><a href="#" data-cursor-hover className="font-sans text-sm text-ivory hover:text-gold transition-colors duration-400">Instagram</a></li>
                <li><a href="#" data-cursor-hover className="font-sans text-sm text-ivory hover:text-gold transition-colors duration-400">Twitter</a></li>
                <li><a href="#" data-cursor-hover className="font-sans text-sm text-ivory hover:text-gold transition-colors duration-400">Behance</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Large Name Parallax */}
        <div className="w-full overflow-hidden flex justify-center mb-16 relative">
          <h1 
            ref={textRef} 
            className="font-serif font-light text-center leading-none text-cream/90 tracking-tight will-change-transform drop-shadow-2xl whitespace-nowrap"
            style={{ fontSize: 'clamp(3rem, 10vw, 10rem)' }}
          >
            ArtBro Sketches
          </h1>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-8 f-reveal" style={{ opacity: 0 }}>
          <p className="font-sans text-[10px] tracking-[0.2em] text-ivory/30 uppercase">
            © {currentYear} ArtBro Sketches. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" data-cursor-hover className="font-sans text-[10px] tracking-[0.2em] text-ivory/30 uppercase hover:text-gold transition-colors duration-400">
              Terms
            </a>
            <a href="#" data-cursor-hover className="font-sans text-[10px] tracking-[0.2em] text-ivory/30 uppercase hover:text-gold transition-colors duration-400">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
