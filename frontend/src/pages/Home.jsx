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

export default function Home() {
  const [loaded, setLoaded] = useState(false)
  const lenisRef = useLenis()

  const handlePreloaderComplete = () => {
    setLoaded(true)
    // Refresh ScrollTrigger after preloader exits
    setTimeout(() => {
      ScrollTrigger.refresh()
    }, 200)
  }

  return (
    <>
      {/* Cinematic preloader */}
      <Preloader onComplete={handlePreloaderComplete} />

      {/* Main content */}
      <div className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        
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
    </>
  )
}
