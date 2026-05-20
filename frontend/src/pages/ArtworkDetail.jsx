import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { gsap } from '../animations/gsap';
import api, { resolveImageUrl } from '../lib/axios';
import Navbar from '../components/Navbar';
import Footer from '../sections/Footer';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { Award, Calendar, Layers, DollarSign, Heart, ShoppingBag, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';

export default function ArtworkDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const { addItem: addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();

  const { data: artwork, isLoading, error } = useQuery({
    queryKey: ['artwork', id],
    queryFn: async () => {
      const res = await api.get(`/artworks/${id}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (!artwork) return;
    
    // Reveal animation
    gsap.fromTo('.reveal-el',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 1.2, ease: 'expo.out', delay: 0.2 }
    );
    
    gsap.fromTo('.reveal-img',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.5, ease: 'expo.out' }
    );

  }, [artwork]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) return alert('Please login to add items to cart.');
    try {
      await addToCart(artwork.id, 1);
      alert('Added to cart!');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to cart.');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) return alert('Please login to use the wishlist.');
    try {
      await toggleWishlist(artwork.id);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center pencil-texture">
        <div className="w-8 h-8 border-t-2 border-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center pencil-texture">
        <h2 className="font-serif text-3xl text-cream mb-4">Artwork not found</h2>
        <Link to="/gallery" className="text-gold uppercase tracking-widest text-xs">Return to Gallery</Link>
      </div>
    );
  }

  return (
    <div className="bg-obsidian min-h-screen pencil-texture">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16">
          
          <Link to="/gallery" className="inline-flex items-center gap-2 text-mist hover:text-gold uppercase tracking-widest text-[10px] mb-12 transition-colors reveal-el">
            <ArrowLeft size={14} /> Back to Gallery
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Left: Image */}
            <div className="lg:col-span-7 reveal-img">
              <div className="relative sticky top-32">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10">
                  <div className="w-full h-full grain-animation bg-noise" />
                </div>
                <img 
                  src={resolveImageUrl(artwork.image)} 
                  alt={artwork.title} 
                  className="w-full h-auto object-cover shadow-2xl img-cinematic sepia-[0.1]"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80'; }}
                />
              </div>
            </div>

            {/* Right: Details */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              
              <div className="mb-8 reveal-el">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-sans text-[10px] tracking-[0.25em] text-gold uppercase flex items-center gap-1.5">
                    <Award size={12} />
                    {artwork.medium} by {artwork.artist?.name || 'ArtBro Gallery'}
                  </span>
                  <span className={`font-sans text-[9px] tracking-widest px-3 py-1 border rounded-full uppercase ${
                    artwork.status === 'AVAILABLE' 
                      ? 'text-green-400 border-green-500/20 bg-green-500/5' 
                      : 'text-gold border-gold/20 bg-gold/5'
                  }`}>
                    {artwork.status}
                  </span>
                </div>

                <h1 className="font-serif font-light text-cream text-5xl md:text-6xl mb-6 leading-tight">
                  {artwork.title}
                </h1>
                
                {artwork.price && (
                  <div className="font-sans text-2xl text-ivory tracking-wider mb-8">
                    ${artwork.price.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12 reveal-el">
                {artwork.status === 'AVAILABLE' && artwork.price ? (
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-ivory text-void hover:bg-gold font-sans text-xs tracking-[0.2em] uppercase py-5 transition-colors flex items-center justify-center gap-3 font-semibold"
                  >
                    <ShoppingBag size={18} /> Add to Collection
                  </button>
                ) : (
                  <button 
                    disabled
                    className="flex-1 bg-void/50 text-mist border border-white/10 font-sans text-xs tracking-[0.2em] uppercase py-5 cursor-not-allowed"
                  >
                    Sold Out
                  </button>
                )}
                
                <button 
                  onClick={handleToggleWishlist}
                  className="px-8 border border-white/10 hover:border-gold text-mist hover:text-gold transition-colors flex items-center justify-center py-5 sm:py-0"
                >
                  <Heart size={20} className={isWishlisted(artwork.id) ? "fill-gold text-gold" : ""} />
                </button>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-y-8 gap-x-4 border-y border-white/5 py-8 mb-12 reveal-el">
                <div>
                  <div className="font-sans text-[9px] tracking-widest text-mist uppercase mb-2 flex items-center gap-2">
                    <Layers size={12} className="text-gold/80" /> Dimensions
                  </div>
                  <div className="font-serif text-lg text-cream">{artwork.dimensions}</div>
                </div>
                <div>
                  <div className="font-sans text-[9px] tracking-widest text-mist uppercase mb-2 flex items-center gap-2">
                    <Calendar size={12} className="text-gold/80" /> Created In
                  </div>
                  <div className="font-serif text-lg text-cream">{artwork.yearCreated}</div>
                </div>
                <div>
                  <div className="font-sans text-[9px] tracking-widest text-mist uppercase mb-2 flex items-center gap-2">
                    <Award size={12} className="text-gold/80" /> Originality
                  </div>
                  <div className="font-serif text-lg text-cream">{artwork.isOriginal ? 'Original Artwork' : 'Limited Print'}</div>
                </div>
              </div>

              {/* Story */}
              <div className="reveal-el">
                <h3 className="font-sans text-[10px] tracking-[0.25em] text-gold uppercase mb-4">Behind the Canvas</h3>
                <p className="font-sans text-sm text-ivory/70 leading-relaxed mb-8">
                  {artwork.description}
                </p>
                {artwork.artworkStory && (
                  <p className="font-sans text-sm text-ivory/60 leading-relaxed italic border-l border-gold/30 pl-4">
                    "{artwork.artworkStory}"
                  </p>
                )}
              </div>

              {/* Guarantees */}
              <div className="mt-12 space-y-4 reveal-el">
                <div className="flex items-center gap-4 bg-void/30 p-4 border border-white/5">
                  <ShieldCheck size={20} className="text-gold" />
                  <span className="font-sans text-xs text-mist tracking-wider uppercase">Certificate of Authenticity Included</span>
                </div>
                <div className="flex items-center gap-4 bg-void/30 p-4 border border-white/5">
                  <Truck size={20} className="text-gold" />
                  <span className="font-sans text-xs text-mist tracking-wider uppercase">Premium Insured Global Shipping</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
