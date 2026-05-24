import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Heart, Search, X } from 'lucide-react'
import api, { resolveImageUrl } from '../lib/axios'
import { useWishlistStore } from '../store/wishlistStore'
import { useAuthStore } from '../store/authStore'
import { useCursorHover } from '../hooks/useCursorHover'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'

export default function SearchPanel({ query, isOpen, onClose }) {
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const panelRef = useRef(null)

  const artworkHover = useCursorHover('artwork', 'View')

  // Fetch all artworks once and cache them. 
  // We rely on React Query to handle caching across the app.
  const { data: rawWorks = [], isLoading } = useQuery({
    queryKey: ['artworks'],
    queryFn: async () => {
      const res = await api.get('/artworks')
      return res.data
    },
    enabled: isOpen, // Only fetch when the panel is open
  })

  // Safety check: ensure rawWorks is an array. If backend returns an object with a data field, use that.
  const safeWorks = Array.isArray(rawWorks) ? rawWorks : (rawWorks?.data || [])

  // Filter works based on query safely
  const filteredWorks = safeWorks.filter((w) => {
    if (!w) return false
    if (!query) return true
    const q = String(query).toLowerCase()
    
    const title = String(w?.title || '').toLowerCase()
    const category = String(w?.category || '').toLowerCase()
    const medium = String(w?.medium || '').toLowerCase()
    const artistName = String(w?.artist?.name || '').toLowerCase()

    return (
      title.includes(q) ||
      category.includes(q) ||
      medium.includes(q) ||
      artistName.includes(q)
    )
  })

  const handleToggleWishlist = async (e, workId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) return alert('Please login to use the wishlist.')
    try {
      await toggleWishlist(workId)
    } catch (err) {
      console.error(err)
    }
  }

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Also don't close if they clicked the search input itself or its container
        if (!event.target.closest('.search-container')) {
          onClose()
        }
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Global backdrop to capture clicks and dim the background */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-void/80 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-[80px] md:top-[100px] left-0 right-0 max-w-7xl mx-auto w-[95vw] md:w-full max-h-[75vh] overflow-y-auto bg-obsidian border border-white/10 shadow-2xl rounded-sm z-[100] pencil-texture"
          >
            {/* Header */}
            <div className="sticky top-0 bg-obsidian/90 backdrop-blur-md border-b border-white/10 p-6 flex items-center justify-between z-20">
              <div className="flex items-center gap-3 text-mist">
                <Search size={16} className="text-gold" />
                <span className="font-sans text-xs tracking-widest uppercase">
                  {query ? `Results for "${query}"` : 'Discover Artworks'}
                </span>
                <span className="text-mist/40 text-[10px]">({filteredWorks.length})</span>
              </div>
              <button 
                onClick={onClose}
                className="text-mist hover:text-gold transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results Body */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-mist/50 gap-4">
                  <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                  <span className="font-sans text-[10px] tracking-widest uppercase">Searching archives...</span>
                </div>
              ) : filteredWorks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <Search size={32} className="text-mist/20 mb-4" />
                  <h3 className="font-serif text-2xl text-mist font-light mb-2">No masterpieces found</h3>
                  <p className="font-sans text-xs text-mist/40 tracking-widest uppercase">Try adjusting your keywords.</p>
                </div>
              ) : (
                <div className="masonry-grid !gap-4">
                  {filteredWorks.map((work) => (
                    <Link
                      key={work.id}
                      to={`/artworks/${work.id}`}
                      onClick={onClose}
                      className="masonry-item block relative group rounded-sm overflow-hidden bg-white/5"
                      {...artworkHover}
                    >
                      <img 
                        src={resolveImageUrl(work.image)} 
                        alt={work.title} 
                        className="w-full h-auto block object-cover transition-transform duration-700 group-hover:scale-105 sepia-[0.1]"
                        loading="lazy"
                      />
                      
                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Pinterest style Save button top right */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0 z-10">
                        <button
                          onClick={(e) => handleToggleWishlist(e, work.id)}
                          className="bg-void/90 backdrop-blur-sm border border-white/10 hover:border-gold hover:bg-gold text-mist hover:text-void rounded-full p-2.5 transition-all shadow-lg"
                        >
                          <Heart size={14} className={isWishlisted(work.id) ? 'fill-gold text-gold group-hover:fill-void group-hover:text-void' : ''} />
                        </button>
                      </div>

                      {/* Info bottom left */}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[10px] group-hover:translate-y-0">
                        <h4 className="font-serif text-lg text-cream drop-shadow-md truncate">{work.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-sans text-[9px] tracking-widest text-gold uppercase drop-shadow-md truncate">
                            {work.artist?.name || 'ArtBro Gallery'}
                          </span>
                          {work.price && (
                            <span className="font-sans text-[10px] tracking-widest text-ivory drop-shadow-md">
                              ₹{work.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
