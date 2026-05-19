import { useEffect, useRef, useState } from 'react'
import { gsap } from '../animations/gsap'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { resolveImageUrl } from '../lib/axios'
import { getLenis } from '../animations/lenis'

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

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault()
      const lenis = getLenis()
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const hasLoadedBefore = sessionStorage.getItem('hasLoadedBefore');
    const animationDelay = hasLoadedBefore ? 0.1 : 3.2;

    const ctx = gsap.context(() => {
      // Use fromTo to ensure starting/ending opacity is guaranteed even in StrictMode
      gsap.fromTo(nav, 
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: 'expo.out',
          delay: animationDelay,
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
    { name: 'Gallery', path: '/gallery' },
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
            onClick={handleHomeClick}
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
                  onClick={item.name === 'Home' ? handleHomeClick : undefined}
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
            {isAuthenticated ? (
              <>
                {isAdmin() ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 bg-zinc-900">
                      {user?.profileImage ? (
                        <img src={resolveImageUrl(user.profileImage)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-mist/50 font-serif">
                          {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                        </div>
                      )}
                    </div>
                    <span className="font-sans text-[11px] tracking-[0.2em] text-gold uppercase hidden lg:block">
                      {user?.name || user?.username || 'Admin Dashboard'}
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 bg-zinc-900">
                      {user?.profileImage ? (
                        <img src={resolveImageUrl(user.profileImage)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-mist/50 font-serif">
                          {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <span className="font-sans text-[11px] tracking-[0.2em] text-mist uppercase hidden lg:block">
                      {user?.name || user?.username || 'Profile'}
                    </span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    useAuthStore.getState().logout();
                    window.location.href = '/';
                  }}
                  data-cursor-hover
                  className="font-sans text-[11px] tracking-[0.2em] text-mist uppercase hover:text-red-400 transition-colors duration-300 relative group"
                >
                  Logout
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-red-400 transition-all duration-400 group-hover:w-full" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  data-cursor-hover
                  className="font-sans text-[11px] tracking-[0.2em] text-mist uppercase hover:text-ivory transition-colors duration-300 relative group"
                >
                  Login
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-400 group-hover:w-full" />
                </Link>
                <Link
                  to="/signup"
                  data-cursor-hover
                  className="font-sans text-[11px] tracking-[0.2em] text-mist uppercase hover:text-ivory transition-colors duration-300 relative group"
                >
                  Signup
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-400 group-hover:w-full" />
                </Link>
              </>
            )}
            
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

            <Link
              to="/commissions/request"
              data-cursor-hover
              className="hidden md:flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-void bg-ivory px-6 py-3 uppercase hover:bg-gold hover:text-void transition-all duration-400"
            >
              Commission
            </Link>
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
        <div className="flex flex-col items-center gap-6 max-h-[80vh] overflow-y-auto w-full py-6">
          {navItems.map((item, i) => {
             const href = getHref(item.path);
             const isHash = href.startsWith('#');
             return isHash ? (
              <a
                key={item.name}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="font-serif text-3xl tracking-wide text-ivory hover:text-gold transition-colors duration-300"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {item.name}
              </a>
             ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => {
                  setMenuOpen(false);
                  if (item.name === 'Home') handleHomeClick(e);
                }}
                className="font-serif text-3xl tracking-wide text-ivory hover:text-gold transition-colors duration-300"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {item.name}
              </Link>
             );
          })}

          <div className="w-12 h-px bg-white/10 my-2" />

          {isAuthenticated ? (
            <>
              {isAdmin() ? (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="font-sans text-xs tracking-[0.2em] text-gold uppercase hover:text-ivory transition-colors duration-300"
                >
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="font-sans text-xs tracking-[0.2em] text-mist uppercase hover:text-ivory transition-colors duration-300"
                >
                  Profile
                </Link>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  useAuthStore.getState().logout();
                  window.location.href = '/';
                }}
                className="font-sans text-xs tracking-[0.2em] text-red-400 uppercase hover:text-red-300 transition-colors duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="font-sans text-xs tracking-[0.2em] text-mist uppercase hover:text-ivory transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="font-sans text-xs tracking-[0.2em] text-mist uppercase hover:text-ivory transition-colors duration-300"
              >
                Signup
              </Link>
            </>
          )}

          <div className="w-12 h-px bg-white/10 my-2" />
          
            <Link
              to="/commissions/request"
              onClick={() => setMenuOpen(false)}
              className="font-sans text-xs tracking-[0.2em] text-void bg-gold px-8 py-4 uppercase hover:bg-ivory transition-all duration-400"
            >
              Request Commission
            </Link>
        </div>
        <div className="absolute bottom-10 font-sans text-[10px] tracking-[0.3em] text-mist/60">
          ART THAT FEELS ALIVE
        </div>
      </div>
    </>
  )
}
