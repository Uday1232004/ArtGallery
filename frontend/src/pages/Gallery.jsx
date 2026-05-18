import { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Layers, CheckCircle, Mail, DollarSign, Award, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { gsap, ScrollTrigger } from '../animations/gsap';
import api from '../lib/axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../sections/Footer';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';

const CATEGORIES = ['All', 'Portraits', 'Pen Art', 'Paintings', 'Krishna', 'Experimental'];

const heightMap = { tall: 'h-80 md:h-[28rem]', medium: 'h-60 md:h-[22rem]', short: 'h-48 md:h-[16rem]' };

const mapCategoryToUI = (serverCategory) => {
  switch (serverCategory) {
    case 'PORTRAIT': return 'Portraits';
    case 'PEN_ART': return 'Pen Art';
    case 'PAINTING': return 'Paintings';
    case 'KRISHNA_ART': return 'Krishna';
    case 'EXPERIMENTAL': return 'Experimental';
    default: return serverCategory;
  }
};

export default function Gallery() {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);
  
  const [activeCat, setActiveCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // latest, price-asc, price-desc
  
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuthStore();
  const { addItem: addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();

  const { data: serverWorks, isLoading } = useQuery({
    queryKey: ['artworks', sortBy],
    queryFn: async () => {
      let sortParam = 'desc'; // latest
      if (sortBy === 'price-asc' || sortBy === 'price-desc') {
         // Note: Assuming backend sort supports price, otherwise we handle it locally. 
         // For now, we will just fetch all and sort locally for UI responsiveness.
         sortParam = 'desc'; 
      }
      const res = await api.get(`/artworks?sort=${sortParam}`);
      return res.data;
    },
  });

  const rawWorks = serverWorks || [];
  const sizes = ['tall', 'medium', 'short'];
  
  const works = useMemo(() => {
    let processed = rawWorks.map((w, idx) => ({
      id: w.id,
      title: w.title,
      medium: w.medium,
      category: w.category ? mapCategoryToUI(w.category) : 'Experimental',
      size: sizes[idx % 3], // Artificial masonry sizing for UI aesthetics
      image: w.image,
      dimensions: w.dimensions || '18" x 24"',
      yearCreated: w.yearCreated || 2025,
      status: w.status || 'AVAILABLE',
      price: w.price || null,
      stock: w.stock || 1,
      description: w.description || 'A cinematic piece created with high passion and meticulous attention to detail.',
    }));

    // Filter by category
    if (activeCat !== 'All') {
      processed = processed.filter(w => w.category === activeCat);
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      processed = processed.filter(w => 
        w.title.toLowerCase().includes(q) || 
        w.category.toLowerCase().includes(q) ||
        w.medium.toLowerCase().includes(q)
      );
    }

    // Sort locally
    if (sortBy === 'price-asc') {
      processed.sort((a, b) => (a.price || 999999) - (b.price || 999999));
    } else if (sortBy === 'price-desc') {
      processed.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return processed;
  }, [rawWorks, activeCat, searchQuery, sortBy]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || isLoading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(section.querySelector('.works-headline'),
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }
      );

      gsap.fromTo(lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.5, ease: 'expo.out', transformOrigin: 'left' }
      );

      const cards = gsap.utils.toArray(section.querySelectorAll('.work-card'));
      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { opacity: 0, y: 60, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 1.1, stagger: 0.1, ease: 'expo.out' }
          );
        },
        once: true
      });
    }, section);

    return () => ctx.revert();
  }, [isLoading, works.length]);

  useEffect(() => {
    const cards = document.querySelectorAll('.work-card-inner');
    gsap.fromTo(cards, 
      { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, stagger: 0.05, ease: 'power2.out' }
    );
  }, [activeCat, sortBy, searchQuery]);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/commissions', {
        clientName: inquiryName,
        email: inquiryEmail,
        artworkType: `Inquiry: ${selectedArtwork.title}`,
        message: `Inquiry regarding "${selectedArtwork.title}" (${selectedArtwork.medium}, ${selectedArtwork.dimensions}). Message: ${inquiryMsg}`
      });
      setSuccess(true);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryMsg('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Could not submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = async (e, work) => {
    e.stopPropagation();
    if (!isAuthenticated) return alert('Please login to add items to cart.');
    try {
      await addToCart(work.id, 1);
      alert('Added to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to cart.');
    }
  };

  const handleToggleWishlist = async (e, work) => {
    e.stopPropagation();
    if (!isAuthenticated) return alert('Please login to use the wishlist.');
    try {
      await toggleWishlist(work.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-obsidian min-h-screen pt-24 pencil-texture">
      <Navbar />
      <section ref={sectionRef} className="relative py-16 md:py-24 overflow-hidden">
        <div className="grid-lines absolute inset-0 opacity-40" />
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 relative z-10">
          
          {/* Header & Controls */}
          <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between mb-16 gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase">ArtBro Sketches</span>
                <div ref={lineRef} className="h-px w-16 bg-gradient-to-r from-gold/50 to-transparent" style={{ transform: 'scaleX(0)' }} />
              </div>
              <h2 className="works-headline font-serif font-light text-cream leading-tight will-change-transform"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', opacity: 0 }}>
                Exhibition Gallery
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-6 w-full xl:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-auto">
                <input 
                  type="text" 
                  placeholder="Search artworks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-void/50 border border-white/10 px-4 py-3 font-sans text-xs text-ivory placeholder-mist/40 focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              {/* Sort */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-void/50 border border-white/10 px-4 py-3 font-sans text-xs text-mist focus:outline-none focus:border-gold transition-colors uppercase tracking-widest cursor-pointer appearance-none"
              >
                <option value="latest">Latest Addition</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-6 mb-12 border-b border-white/10 pb-6">
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

          {/* Masonry Grid */}
          <div className="masonry-grid">
            {works.length === 0 && !isLoading && (
              <div className="col-span-full py-20 text-center font-serif text-2xl text-mist">
                No artworks found.
              </div>
            )}

            {works.map((work, i) => (
              <div 
                key={`${work.id}-${i}`} 
                onClick={() => {
                  setSelectedArtwork(work);
                  setSuccess(false);
                  setError('');
                }}
                className="masonry-item work-card group relative overflow-hidden rounded-sm cursor-pointer will-change-transform" 
              >
                <div className={`work-card-inner relative overflow-hidden ${heightMap[work.size]}`}>
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover img-cinematic transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 sepia-[0.2]"
                    loading="lazy"
                  />
                  
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,9,8,0.8)_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  {/* Actions Top Right */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 transform transition-transform duration-700 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 z-20">
                    <button 
                      onClick={(e) => handleToggleWishlist(e, work)}
                      className="p-3 bg-void/80 hover:bg-gold hover:text-void text-mist backdrop-blur-sm transition-colors duration-300 rounded-full"
                    >
                      <Heart size={16} className={isWishlisted(work.id) ? "fill-gold text-gold" : ""} />
                    </button>
                    {work.status === 'AVAILABLE' && work.price && (
                      <button 
                        onClick={(e) => handleAddToCart(e, work)}
                        className="p-3 bg-void/80 hover:bg-gold hover:text-void text-mist backdrop-blur-sm transition-colors duration-300 rounded-full"
                      >
                        <ShoppingBag size={16} />
                      </button>
                    )}
                  </div>

                  {/* Meta details */}
                  <div className="absolute bottom-6 left-6 right-6 transform transition-transform duration-700 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-sans text-[9px] tracking-[0.3em] text-gold/90 uppercase drop-shadow-md">{work.medium}</div>
                      {work.price && (
                        <div className="font-sans text-[10px] tracking-widest text-ivory drop-shadow-md">${work.price.toLocaleString()}</div>
                      )}
                    </div>
                    <div className="font-serif text-2xl text-cream drop-shadow-lg">{work.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Immersive Artwork Details Modal */}
        <AnimatePresence>
          {selectedArtwork && (
            <div className="fixed inset-0 bg-void/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8 overflow-y-auto">
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-6xl bg-obsidian/90 border border-white/10 rounded-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] lg:max-h-[85vh] shadow-2xl"
              >
                
                <button 
                  onClick={() => setSelectedArtwork(null)}
                  className="absolute top-6 right-6 z-50 p-2 rounded-full bg-void/50 text-ivory hover:text-gold hover:scale-105 border border-white/5 transition-all duration-300"
                >
                  <X size={18} />
                </button>

                {/* Left Column: Artwork Image */}
                <div className="lg:col-span-6 relative bg-void flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden min-h-[300px] lg:min-h-0">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10">
                    <div className="w-full h-full grain-animation bg-noise" />
                  </div>
                  <img 
                    src={selectedArtwork.image} 
                    alt={selectedArtwork.title} 
                    className="max-w-full max-h-[40vh] lg:max-h-[70vh] object-contain shadow-2xl rounded-sm img-cinematic sepia-[0.1]"
                  />
                  
                  {/* View Full Page Button */}
                  <Link 
                    to={`/artworks/${selectedArtwork.id}`}
                    className="absolute bottom-6 font-sans text-xs tracking-widest text-gold hover:text-ivory transition-colors flex items-center gap-2 z-20 group bg-void/60 px-6 py-3 rounded-full backdrop-blur-sm border border-white/5"
                  >
                    View Full Experience <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Right Column: Metadata & Inquiry Form */}
                <div className="lg:col-span-6 p-8 md:p-12 overflow-y-auto flex flex-col justify-between max-h-[50vh] lg:max-h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-sans text-[10px] tracking-[0.25em] text-gold uppercase flex items-center gap-1.5">
                        <Award size={10} />
                        {selectedArtwork.medium}
                      </span>
                      <span className={`font-sans text-[9px] tracking-widest px-3 py-1 border rounded-full uppercase ${
                        selectedArtwork.status === 'AVAILABLE' 
                          ? 'text-green-400 border-green-500/20 bg-green-500/5' 
                          : 'text-gold border-gold/20 bg-gold/5'
                      }`}>
                        {selectedArtwork.status}
                      </span>
                    </div>

                    <h3 className="font-serif font-light text-cream text-4xl md:text-5xl mb-6">
                      {selectedArtwork.title}
                    </h3>

                    <p className="font-sans text-sm md:text-base text-ivory/70 leading-relaxed mb-8">
                      {selectedArtwork.description}
                    </p>

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
                          {selectedArtwork.price ? `$${selectedArtwork.price.toLocaleString()}` : 'Inquiry'}
                        </div>
                      </div>
                    </div>

                    {/* Ecommerce Actions */}
                    <div className="flex gap-4 mb-8">
                      {selectedArtwork.status === 'AVAILABLE' && selectedArtwork.price && (
                        <button 
                          onClick={(e) => handleAddToCart(e, selectedArtwork)}
                          className="flex-1 bg-ivory text-void hover:bg-gold font-sans text-[10px] tracking-widest uppercase py-4 transition-colors font-semibold"
                        >
                          Add to Cart
                        </button>
                      )}
                      <button 
                        onClick={(e) => handleToggleWishlist(e, selectedArtwork)}
                        className="px-6 border border-white/10 hover:border-gold text-mist hover:text-gold transition-colors flex items-center justify-center"
                      >
                        <Heart size={18} className={isWishlisted(selectedArtwork.id) ? "fill-gold text-gold" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* Inquiry Form */}
                  <div className="pt-4 border-t border-white/5">
                    <h4 className="font-serif text-lg text-cream mb-4 flex items-center gap-2">
                      <Mail size={16} className="text-gold/80" />
                      Inquire About This Work
                    </h4>
                    
                    <form onSubmit={handleInquirySubmit} className="space-y-4">
                      {success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-sm flex items-center gap-2">
                          <CheckCircle size={14} />
                          Your inquiry has been received.
                        </div>
                      )}
                      {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-sm">
                          {error}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          required
                          value={inquiryName}
                          onChange={e => setInquiryName(e.target.value)}
                          placeholder="Your Name" 
                          className="w-full bg-void/50 border border-white/10 px-4 py-2.5 font-sans text-xs text-ivory placeholder-mist/40 focus:outline-none focus:border-gold"
                        />
                        <input 
                          type="email" 
                          required
                          value={inquiryEmail}
                          onChange={e => setInquiryEmail(e.target.value)}
                          placeholder="Your Email" 
                          className="w-full bg-void/50 border border-white/10 px-4 py-2.5 font-sans text-xs text-ivory placeholder-mist/40 focus:outline-none focus:border-gold"
                        />
                      </div>
                      <textarea 
                        rows="2" 
                        required
                        value={inquiryMsg}
                        onChange={e => setInquiryMsg(e.target.value)}
                        placeholder="Ask about details..." 
                        className="w-full bg-void/50 border border-white/10 p-4 font-sans text-xs text-ivory placeholder-mist/40 focus:outline-none focus:border-gold resize-none"
                      />
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full font-sans text-[10px] tracking-[0.25em] text-ivory border border-white/10 hover:border-gold hover:text-gold py-3 uppercase transition-all"
                      >
                        {submitting ? 'Submitting...' : 'Submit Inquiry'}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>
      <Footer />
    </div>
  );
}
