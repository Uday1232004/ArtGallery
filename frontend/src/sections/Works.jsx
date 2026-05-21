import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Layers, DollarSign, Award, Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../animations/gsap'
import api, { resolveImageUrl } from '../lib/axios'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { useAuthStore } from '../store/authStore'

const CATEGORIES = ['All', 'Portraits', 'Pen Art', 'Paintings', 'Krishna', 'Experimental']

const heightMap = { tall: 'h-80 md:h-[28rem]', medium: 'h-60 md:h-[22rem]', short: 'h-48 md:h-[16rem]' }

const mapCategoryToUI = (serverCategory) => {
  switch (serverCategory) {
    case 'PORTRAIT': return 'Portraits';
    case 'PEN_ART': return 'Pen Art';
    case 'PAINTING': return 'Paintings';
    case 'KRISHNA_ART': return 'Krishna';
    case 'EXPERIMENTAL': return 'Experimental';
    default: return serverCategory;
  }
}

export default function Works() {
  const sectionRef = useRef(null)
  const lineRef = useRef(null)
  const verticalLineRef = useRef(null)
  const lineClipRef = useRef(null)
  const [activeCat, setActiveCat] = useState('All')
  
  // Selected artwork state for dynamic detail modal
  const [selectedArtwork, setSelectedArtwork] = useState(null)
  
  // Navigation and Stores
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addItem: addToCart } = useCartStore()
  const { toggleWishlist, isWishlisted } = useWishlistStore()

  // Fetch live artworks from backend
  const { data: serverWorks, isLoading: worksLoading } = useQuery({
    queryKey: ['artworks'],
    queryFn: async () => {
      const res = await api.get('/artworks')
      return res.data
    },
    retry: false,
  })

  const rawWorks = serverWorks || []
  const sizes = ['tall', 'medium', 'short']
  
  const works = rawWorks.map((w, idx) => ({
    id: w.id || idx,
    title: w.title,
    medium: w.medium,
    category: w.category ? mapCategoryToUI(w.category) : 'Experimental',
    size: w.size || sizes[idx % 3],
    image: resolveImageUrl(w.image),
    dimensions: w.dimensions || '18" x 24"',
    yearCreated: w.yearCreated || 2025,
    status: w.status || 'AVAILABLE',
    price: w.price || null,
    description: w.description || 'A cinematic piece created with high passion and meticulous attention to detail.',
    artistName: w.artist?.name || 'ArtBro Gallery'
  }))

  const filteredWorks = activeCat === 'All' 
    ? works 
    : works.filter(w => w.category === activeCat)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      // Header reveals
      gsap.fromTo(section.querySelector('.works-headline'),
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: section, start: 'top 80%' },
        }
      )

      gsap.fromTo(lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.5, ease: 'expo.out', transformOrigin: 'left',
          scrollTrigger: { trigger: section, start: 'top 80%' },
        }
      )

      // Vertical connecting line clip-path reveal on scroll
      if (lineClipRef.current) {
        const scrollTriggerConfig = {
          trigger: section,
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 0.5,
        }
        gsap.to(lineClipRef.current, {
          height: '100%',
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        })
        if (verticalLineRef.current) {
          gsap.to(verticalLineRef.current, {
            top: '100%',
            ease: 'none',
            scrollTrigger: scrollTriggerConfig,
          })
        }
      }

      // Initial grid stagger
      const cards = gsap.utils.toArray(section.querySelectorAll('.work-card'))
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { opacity: 0, y: 60, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 1.1, stagger: 0.1, ease: 'expo.out' }
          )
        },
        once: true
      })
    }, section)

    return () => ctx.revert()
  }, [works.length])

  // Handle category change animation manually
  useEffect(() => {
    const cards = document.querySelectorAll('.work-card-inner')
    gsap.fromTo(cards, 
      { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.05, ease: 'power2.out' }
    )
  }, [activeCat])

  const handleAddToCart = async () => {
    if (!isAuthenticated) return alert('Please login to add items to cart.');
    try {
      await addToCart(selectedArtwork.id, 1);
      alert('Added to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to cart.');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) return alert('Please login to use the wishlist.');
    try {
      await toggleWishlist(selectedArtwork.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section ref={sectionRef} id="gallery" className="relative bg-transparent py-32 md:py-48 overflow-hidden pencil-texture">
      <div className="grid-lines absolute inset-0 opacity-40" />
      
      {/* ── Left-rail connecting timeline line ── */}
      <div className="absolute left-4 md:left-8 top-0 bottom-0 w-[1px] hidden md:block pointer-events-none z-10" style={{ background: 'rgba(201,169,110,0.06)' }}>
        {/* Gold fill that grows downward as you scroll */}
        <div
          ref={lineClipRef}
          className="absolute top-0 left-0 w-full overflow-hidden"
          style={{ height: '0%' }}
        >
          <div className="w-full h-[9999px]" style={{ background: 'linear-gradient(to bottom, #C9A96E 0%, rgba(201,169,110,0.25) 85%, transparent 100%)' }} />
        </div>
        {/* Glowing dot travelling downward */}
        <div
          ref={verticalLineRef}
          className="absolute w-[8px] h-[8px] rounded-full"
          style={{ top: '0%', left: '-3.5px', background: '#C9A96E', boxShadow: '0 0 12px 4px rgba(201,169,110,0.6)' }}
        />
      </div>
      <div className="max-w-[1600px] mx-auto px-8 md:px-16 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase">The Gallery</span>
              <div ref={lineRef} className="h-px w-16 bg-gradient-to-r from-gold/50 to-transparent" style={{ transform: 'scaleX(0)' }} />
            </div>
            <h2 className="works-headline font-serif font-light text-cream leading-tight will-change-transform"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', opacity: 0 }}>
              Selected Artworks
            </h2>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-6">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`font-sans text-xs tracking-[0.2em] uppercase transition-colors duration-400 ${
                  activeCat === cat ? 'text-gold' : 'text-mist hover:text-ivory'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

          {/* Masonry Grid */}
          <div className="relative masonry-wrapper pb-10">

            <div className="masonry-grid relative z-10">
            {!serverWorks && Array.from({length: 6}).map((_, i) => (
              <div key={i} className="masonry-item work-card animate-pulse bg-white/5 rounded-sm" style={{height: i % 3 === 0 ? '28rem' : i % 3 === 1 ? '22rem' : '16rem'}} />
            ))}

            {serverWorks && filteredWorks.length === 0 && (
              <div className="py-32 flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-px bg-gold/30 mx-auto" />
                <p className="font-serif text-3xl text-mist/60 font-light">No artworks yet.</p>
                <p className="font-sans text-xs tracking-[0.2em] text-mist/40 uppercase max-w-xs">
                  Be the first to upload your work and share it with the world.
                </p>
                <Link to="/admin/artworks" className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase border border-gold/30 px-6 py-3 hover:bg-gold hover:text-void transition-all duration-400">
                  Upload Artwork
                </Link>
              </div>
            )}

            {filteredWorks.map((work, i) => (
            <div 
              key={`${work.title}-${i}`} 
              onClick={() => setSelectedArtwork(work)}
              className="masonry-item work-card group relative overflow-hidden rounded-sm cursor-none will-change-transform" 
              data-cursor-hover
            >
              <div className="work-card-inner relative overflow-hidden w-full h-auto">
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-auto block img-cinematic transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 sepia-[0.2]"
                  loading="lazy"
                />
                
                {/* Cinematic Spotlight Hover */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,9,8,0.8)_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                {/* Meta details */}
                <div className="absolute bottom-6 left-6 right-6 transform transition-transform duration-700 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="font-sans text-[9px] tracking-[0.3em] text-gold/90 uppercase mb-2 drop-shadow-md">{work.medium} • By {work.artistName}</div>
                  <div className="font-serif text-2xl text-cream drop-shadow-lg">{work.title}</div>
                </div>

                {/* Index marker */}
                <div className="absolute top-5 right-5 font-sans text-[10px] text-ivory/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            </div>
          ))}
            </div>
          </div>
        </div>

      {/* Dynamic Immersive Artwork Details Modal */}
      <AnimatePresence>
        {selectedArtwork && (
          <div className="fixed inset-0 bg-void/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
            
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-6xl bg-obsidian/90 border border-white/10 rounded-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] lg:max-h-[85vh] shadow-2xl"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-6 right-6 z-50 p-2 rounded-full bg-void/50 text-ivory hover:text-gold hover:scale-105 border border-white/5 transition-all duration-300"
              >
                <X size={18} />
              </button>

              {/* Left Column: Artwork Image */}
              <div className="lg:col-span-6 relative bg-void flex items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden min-h-[300px] lg:min-h-0">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10">
                  <div className="w-full h-full grain-animation bg-noise" />
                </div>
                <img 
                  src={selectedArtwork.image} 
                  alt={selectedArtwork.title} 
                  className="max-w-full max-h-[40vh] lg:max-h-[70vh] object-contain shadow-2xl rounded-sm img-cinematic sepia-[0.1]"
                />
                <div className="absolute bottom-6 left-6 font-sans text-[10px] tracking-[0.3em] text-mist/60 uppercase">
                  {selectedArtwork.category}
                </div>
              </div>

              {/* Right Column: Metadata & Inquiry Form */}
              <div className="lg:col-span-6 p-8 md:p-12 overflow-y-auto flex flex-col justify-between max-h-[50vh] lg:max-h-full">
                <div>
                  
                  {/* Category & Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-sans text-[10px] tracking-[0.25em] text-gold uppercase flex items-center gap-1.5">
                      <Award size={10} />
                      {selectedArtwork.medium} by {selectedArtwork.artistName}
                    </span>
                    <span className={`font-sans text-[9px] tracking-widest px-3 py-1 border rounded-full uppercase ${
                      selectedArtwork.status === 'AVAILABLE' 
                        ? 'text-green-400 border-green-500/20 bg-green-500/5' 
                        : 'text-gold border-gold/20 bg-gold/5'
                    }`}>
                      {selectedArtwork.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif font-light text-cream text-4xl md:text-5xl mb-6">
                    {selectedArtwork.title}
                  </h3>

                  {/* Story Description */}
                  <p className="font-sans text-sm md:text-base text-ivory/70 leading-relaxed mb-8">
                    {selectedArtwork.description}
                  </p>

                  {/* Visual specs grid */}
                  <div className="grid grid-cols-3 gap-4 border-y border-white/5 py-6 mb-8 text-center md:text-left">
                    <div>
                      <div className="font-sans text-[9px] tracking-widest text-mist uppercase mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                        <Layers size={10} className="text-gold/80" />
                        Dimensions
                      </div>
                      <div className="font-serif text-lg text-cream">{selectedArtwork.dimensions}</div>
                    </div>
                    <div>
                      <div className="font-sans text-[9px] tracking-widest text-mist uppercase mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                        <Calendar size={10} className="text-gold/80" />
                        Year
                      </div>
                      <div className="font-serif text-lg text-cream">{selectedArtwork.yearCreated}</div>
                    </div>
                    <div>
                      <div className="font-sans text-[9px] tracking-widest text-mist uppercase mb-1 flex items-center gap-1.5 justify-center md:justify-start">
                        <DollarSign size={10} className="text-gold/80" />
                        Value
                      </div>
                      <div className="font-serif text-lg text-cream">
                        {selectedArtwork.price ? `$${selectedArtwork.price.toLocaleString()}` : 'Priceless / Inquiry'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ecommerce Actions */}
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-4">
                  <Link 
                    to={`/artworks/${selectedArtwork.id}`}
                    className="w-full text-center font-sans text-[10px] tracking-[0.25em] text-ivory border border-white/10 hover:border-gold hover:text-gold py-3 uppercase transition-all duration-300 font-semibold"
                  >
                    View Full Details
                  </Link>
                  
                  <div className="flex gap-4">
                    {selectedArtwork.status === 'AVAILABLE' && selectedArtwork.price ? (
                      <button 
                        onClick={handleAddToCart}
                        className="flex-1 font-sans text-[10px] tracking-[0.25em] text-void bg-ivory hover:bg-gold py-3 uppercase transition-all duration-300 font-semibold"
                      >
                        Add to Collection
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="flex-1 font-sans text-[10px] tracking-[0.25em] text-mist bg-void/50 border border-white/10 py-3 uppercase cursor-not-allowed"
                      >
                        Sold Out
                      </button>
                    )}
                    
                    <button 
                      onClick={handleToggleWishlist}
                      className="px-6 border border-white/10 hover:border-gold text-mist hover:text-gold transition-colors flex items-center justify-center"
                    >
                      <Heart size={16} className={isWishlisted(selectedArtwork.id) ? "fill-gold text-gold" : ""} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
