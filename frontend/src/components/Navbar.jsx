import { useEffect, useRef, useState } from 'react'
import { gsap } from '../animations/gsap'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'

/**
 * Navbar — transparent initially, fills on scroll
 * Minimal luxury design with smooth hover interactions
 */
export default function Navbar() {
  const navRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  
  const { count, openCart } = useCartStore()
  const { isAuthenticated, user, isAdmin } = useAuthStore()

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const ctx = gsap.context(() => {
      // Use fromTo to ensure starting/ending opacity is guaranteed even in StrictMode
      gsap.fromTo(nav, 
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: 'expo.out',
          delay: 3.2, // After preloader
        }
      )
    })

    // Scroll listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      ctx.revert()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Gallery', path: '/#gallery' },
    { name: 'Artists', path: '/artists' },
    { name: 'Exhibitions', path: '/exhibitions' },
    { name: 'Story', path: '/#manifesto' },
    { name: 'About', path: '/#about' },
  ]

  // Helper for scroll vs page navigation
  const getHref = (path) => {
    // If it's a hash link and we're on the home page, just scroll
    if (path.startsWith('/#') && location.pathname === '/') {
      return path.substring(1); // Return just '#section'
    }
    return path;
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? 'bg-obsidian/90 backdrop-blur-md border-b border-white/5 py-4'
            : 'bg-transparent py-7'
        }`}
      >
        <div className="flex items-center justify-between px-8 md:px-16 max-w-[1800px] mx-auto">
          {/* Logo */}
          <Link
            to="/"
            className="font-serif text-xl tracking-[0.3em] text-ivory uppercase font-light"
            data-cursor-hover
          >
            ArtBro Sketches
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
               const href = getHref(item.path);
               const isHash = href.startsWith('#');
               
               return isHash ? (
                <a
                  key={item.name}
                  href={href}
                  data-cursor-hover
                  className="relative font-sans text-[11px] tracking-[0.2em] text-mist uppercase hover:text-ivory transition-colors duration-300 group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-400 group-hover:w-full" />
                </a>
               ) : (
                <Link
                  key={item.name}
                  to={item.path}
                  data-cursor-hover
                  className="relative font-sans text-[11px] tracking-[0.2em] text-mist uppercase hover:text-ivory transition-colors duration-300 group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-400 group-hover:w-full" />
                </Link>
               );
            })}
          </div>

          {/* Icons & CTA */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to={isAuthenticated ? (isAdmin() ? "/admin" : "/profile") : "/login"} 
              data-cursor-hover 
              className="text-mist hover:text-ivory transition-colors"
            >
              <User size={20} />
            </Link>
            
            <button 
              onClick={openCart}
              data-cursor-hover 
              className="relative text-mist hover:text-ivory transition-colors"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-void text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            {getHref('/#contact').startsWith('#') ? (
            <a
              href={getHref('/#contact')}
              data-cursor-hover
              className="hidden md:flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-void bg-ivory px-6 py-3 uppercase hover:bg-gold hover:text-void transition-all duration-400"
            >
              Commission
            </a>
          ) : (
            <Link
              to="/#contact"
              data-cursor-hover
              className="hidden md:flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-void bg-ivory px-6 py-3 uppercase hover:bg-gold hover:text-void transition-all duration-400"
            >
              Commission
            </Link>
          )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-px bg-ivory transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-px bg-ivory transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-ivory transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-obsidian flex flex-col items-center justify-center transition-all duration-700 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center gap-8">
          {navItems.map((item, i) => {
             const href = getHref(item.path);
             const isHash = href.startsWith('#');
             return isHash ? (
              <a
                key={item.name}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="font-serif text-4xl tracking-wide text-ivory hover:text-gold transition-colors duration-300"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {item.name}
              </a>
             ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className="font-serif text-4xl tracking-wide text-ivory hover:text-gold transition-colors duration-300"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {item.name}
              </Link>
             );
          })}
          
          {getHref('/#contact').startsWith('#') ? (
            <a
              href={getHref('/#contact')}
              onClick={() => setMenuOpen(false)}
              className="mt-4 font-sans text-xs tracking-[0.2em] text-void bg-gold px-8 py-4 uppercase hover:bg-ivory transition-all duration-400"
              style={{ transitionDelay: `${navItems.length * 60}ms` }}
            >
              Request Commission
            </a>
          ) : (
            <Link
              to="/#contact"
              onClick={() => setMenuOpen(false)}
              className="mt-4 font-sans text-xs tracking-[0.2em] text-void bg-gold px-8 py-4 uppercase hover:bg-ivory transition-all duration-400"
              style={{ transitionDelay: `${navItems.length * 60}ms` }}
            >
              Request Commission
            </Link>
          )}
        </div>
        <div className="absolute bottom-10 font-sans text-[10px] tracking-[0.3em] text-mist/60">
          ART THAT FEELS ALIVE
        </div>
      </div>
    </>
  )
}
