import { useState, useEffect } from 'react'
import useLenis from '../hooks/useLenis'
import { ScrollTrigger } from '../animations/gsap'
import Preloader from '../components/Preloader'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Manifesto from '../sections/Manifesto'
import HorizontalGallery from '../sections/HorizontalGallery'
import Works from '../sections/Works'
import Contact from '../sections/Contact'
import Footer from '../sections/Footer'
import MarqueeText from '../components/MarqueeText'
import ScrollingLine from '../components/ScrollingLine'

export default function Home() {
  const [loaded, setLoaded] = useState(() => {
    return !!sessionStorage.getItem('hasLoadedBefore')
  })
  const lenisRef = useLenis()

  const handlePreloaderComplete = () => {
    sessionStorage.setItem('hasLoadedBefore', 'true')
    setLoaded(true)
    // Refresh ScrollTrigger after preloader exits
    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 200)
  }

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        ScrollTrigger.refresh()
      }, 500)
    }
  }, [loaded])

  const hasLoadedBefore = sessionStorage.getItem('hasLoadedBefore')

  return (
    <>
      {/* Cinematic preloader — only play once per browser session */}
      {!hasLoadedBefore && (
        <Preloader onComplete={handlePreloaderComplete} />
      )}

      {/* Main content */}
      <div className={`relative transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* 1. Hero — pinned mask expansion */}
        <Hero ready={loaded} />

        {/* Marquee strip */}
        <div className="bg-carbon border-y border-white/5 py-5">
          <MarqueeText
            items={['Realistic Portraits', 'Pen Art', 'Charcoal Studies', 'Krishna Artworks', 'Mixed Media']}
            speed="normal"
            reverse={false}
          />
        </div>

        {/* ── Scroll Area Wrapper starting from About ── */}
        <div className="relative z-0 bg-obsidian">
          {/* Full-page scroll-drawing SVG snake line — positioned behind text/images */}
          {loaded && <ScrollingLine />}

          {/* 2. About */}
          <About />

          {/* 3. Manifesto — pinned word reveal */}
          <Manifesto />

          {/* 4. Horizontal Gallery */}
          <HorizontalGallery />

          {/* 5. Works — masonry grid */}
          <Works />

          {/* 6. Contact / Commissions */}
          <Contact />

          {/* 7. Footer */}
          <Footer />
        </div>
      </div>
    </>
  )
}
