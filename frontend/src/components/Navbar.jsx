import { useEffect, useRef, useState } from 'react'
import { gsap } from '../animations/gsap'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ShoppingCart, User, ShoppingBag, Search } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { normalizeImageUrl } from '../lib/axios'
import { getLenis } from '../animations/lenis'
import { useCursorHover } from '../hooks/useCursorHover'
import SearchPanel from './SearchPanel'
import { ErrorBoundary } from './ErrorBoundary'

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

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const textHover = useCursorHover('text')
  const buttonHover = useCursorHover('button')

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/gallery' },
    { name: 'Artists', path: '/artists' },
    { name: 'Exhibitions', path: '/exhibitions' },
  ]

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

    const handleScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      ctx.revert()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

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
          <Link
            to="/"
            onClick={handleHomeClick}
            className="font-serif text-xl tracking-[0.3em] text-ivory uppercase font-light"
            {...textHover}
          >
            ArtBro Sketches
          </Link>

          {/* Global Search Bar */}
          <div className="search-container hidden lg:flex flex-1 max-w-md mx-8 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={14} className="text-mist/50" />
            </div>
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsSearchOpen(true)
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search artworks, artists, styles..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 font-sans text-xs text-ivory placeholder-mist/40 focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all"
              {...textHover}
            />
          </div>

          <div className="hidden md:flex items-center gap-8">
              <NavLink to="/" onClick={handleHomeClick} className="font-sans text-[11px] tracking-[0.2em] text-mist uppercase hover:text-ivory transition-colors duration-300" {...textHover}>Home</NavLink>
              <NavLink to="/gallery" className={({isActive}) => `font-sans text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 ${isActive ? 'text-ivory' : 'text-mist hover:text-ivory'}`} {...textHover}>Explore</NavLink>
              <NavLink to="/artists" className={({isActive}) => `font-sans text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 ${isActive ? 'text-ivory' : 'text-mist hover:text-ivory'}`} {...textHover}>Artists</NavLink>
              <NavLink to="/commissions/request" className={({isActive}) => `font-sans text-[11px] tracking-[0.2em] uppercase transition-colors duration-300 ${isActive ? 'text-ivory' : 'text-mist hover:text-ivory'}`} {...textHover}>Commissions</NavLink>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                  <Link
                    to={isAdmin() ? "/admin" : "/profile"}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    {...buttonHover}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 bg-zinc-900 relative">
                      {user?.profileImage && (
                        <img 
                          src={normalizeImageUrl(user.profileImage)} 
                          alt="Avatar" 
                          className="w-full h-full object-cover absolute top-0 left-0" 
                          onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      useAuthStore.getState().logout();
                      window.location.href = '/';
                    }}
                    className="font-sans text-[11px] tracking-[0.2em] text-mist uppercase hover:text-red-400 transition-colors duration-300"
                    {...buttonHover}
                  >
                    Logout
                  </button>
              </>
            ) : (
              <>
                  <Link to="/login" className="font-sans text-[11px] tracking-[0.2em] text-mist uppercase hover:text-ivory transition-colors duration-300" {...textHover}>Login</Link>
                  <Link to="/signup" className="font-sans text-[11px] tracking-[0.2em] text-mist uppercase hover:text-ivory transition-colors duration-300" {...textHover}>Signup</Link>
              </>
            )}
            
              <button 
                onClick={openCart}
                className="relative text-mist hover:text-ivory transition-colors"
                {...buttonHover}
              >
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-void text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
          </div>

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
          
          <div className="search-container w-[80%] max-w-sm mb-4 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search size={14} className="text-mist/50" />
            </div>
            <input
              id="global-search-input-mobile"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsSearchOpen(true)
                setMenuOpen(false)
              }}
              placeholder="Search artworks..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-10 pr-4 font-sans text-sm text-ivory placeholder-mist/40 focus:outline-none focus:border-gold/50 transition-all"
            />
          </div>

          {navItems.map((item, i) => (
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
          ))}

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
      
      <ErrorBoundary>
        <SearchPanel 
          query={searchQuery} 
          isOpen={isSearchOpen} 
          onClose={() => {
            setIsSearchOpen(false)
          }} 
        />
      </ErrorBoundary>
    </>
  )
}
