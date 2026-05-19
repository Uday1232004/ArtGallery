import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid, 
  Bookmark, 
  Info, 
  Heart, 
  MessageCircle, 
  CheckCircle2, 
  Calendar, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus,
  Compass,
  ShoppingBag
} from 'lucide-react';
import api, { resolveImageUrl } from '../lib/axios';
import { useCartStore } from '../store/cartStore';



// Aesthetic mock reviews to populate Instagram comments
const MOCK_COMMENTS = [
  { user: 'alex_sketches', text: 'The depth of contrast in this drawing is absolutely hypnotic!' },
  { user: 'curator_hub', text: 'Beautiful line precision. Reminds me of traditional Renaissance drafts.' },
  { user: 'elena_art', text: 'Outstanding shading work on the paper texture. Love this.' },
  { user: 'frame_master', text: 'This would look incredibly elegant behind museum-grade antireflective glass.' },
  { user: 'marcus_galleries', text: 'Is this graphite or mixed charcoal? Sensational gradient work.' }
];

export default function ArtistProfile() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'series' | 'about'
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(1342);
  const [selectedArtwork, setSelectedArtwork] = useState(null);



  const { addItem, toggleCart } = useCartStore();

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setIsLoading(true);
        const artistRes = await api.get(`/artists/${id}`);
        setArtist(artistRes.data);

        // Fetch all artworks and filter by current artist
        const artworksRes = await api.get('/artworks');
        const artistArtworks = artworksRes.data.filter(
          (art) => art.artistId === id || art.artist?.id === id
        );
        setArtworks(artistArtworks);
      } catch (err) {
        console.error('Error fetching artist space:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtistData();
  }, [id]);



  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);
  };

  const handleAddToCart = (artwork) => {
    addItem(artwork);
    setSelectedArtwork(null);
    toggleCart(); // Automatically open cart drawer to verify addition
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center text-ivory">
        <h2 className="font-serif text-2xl mb-4 text-gold">Artist Space Mismatch</h2>
        <Link to="/" className="font-sans text-xs tracking-widest uppercase bg-ivory text-void px-6 py-3 hover:bg-gold transition-colors">
          Return to Gallery
        </Link>
      </div>
    );
  }

  // Statistics calculation
  const soldCount = artworks.filter(art => art.status === 'SOLD').length;
  const soldRatio = artworks.length > 0 ? Math.round((soldCount / artworks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-void text-ivory pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ─────────────── PREMIUM CENTERED HEADER SECTION ─────────────── */}
        <header className="flex flex-col items-center justify-center text-center gap-6 pb-10 border-b border-white/5 max-w-4xl mx-auto w-full">
          {/* Avatar Area with Clean Gold Border */}
          <div className="relative flex-shrink-0">
            <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border border-gold/30 bg-zinc-950 p-1 shadow-xl">
              <img
                src={resolveImageUrl(artist.profileImage) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80'}
                alt={artist.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          {/* Details Area */}
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Username & Action Row */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl text-cream tracking-wide font-light uppercase">{artist.name}</h1>
                <CheckCircle2 size={16} className="text-gold fill-gold/10" />
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2 rounded-none font-sans text-[10px] tracking-[0.2em] uppercase font-bold transition-all duration-300 shadow-md ${
                    isFollowing 
                      ? 'bg-zinc-800 border border-white/10 text-cream hover:bg-zinc-700' 
                      : 'bg-gold text-void hover:bg-cream hover:text-void'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow Artist'}
                </button>
                <Link
                  to="/commissions/request"
                  className="px-5 py-2 rounded-none font-sans text-[10px] tracking-[0.2em] uppercase bg-zinc-900 border border-white/5 text-cream hover:bg-white/5 transition-all duration-300 font-semibold"
                >
                  Inquire Sketch
                </Link>
              </div>
            </div>

            {/* Stat Counts */}
            <div className="flex gap-12 font-sans text-xs border-y border-white/5 py-3 w-full justify-center max-w-md my-2">
              <div className="text-center">
                <span className="block font-serif text-lg text-cream leading-tight">{artworks.length}</span>
                <span className="text-[9px] tracking-widest text-mist/40 uppercase">posts</span>
              </div>
              <div className="text-center">
                <span className="block font-serif text-lg text-cream leading-tight">{followerCount.toLocaleString()}</span>
                <span className="text-[9px] tracking-widest text-mist/40 uppercase">collectors</span>
              </div>
              <div className="text-center">
                <span className="block font-serif text-lg text-cream leading-tight">{soldRatio}%</span>
                <span className="text-[9px] tracking-widest text-mist/40 uppercase">sold ratio</span>
              </div>
            </div>

            {/* Biography & Description */}
            <div className="font-sans text-[11px] text-mist/80 max-w-xl leading-relaxed flex flex-col items-center gap-1.5">
              <span className="font-semibold text-gold/80 tracking-[0.25em] text-[9px] uppercase">{artist.specialization}</span>
              <span className="text-mist/50 italic text-[10px]">Years Experience: {artist.experience || 'Independent Residency'}</span>
              <p className="mt-1 text-mist/70 text-center">{artist.bio || 'Exploring pencil shadow fields, hand drawing values, and spatial high-contrasts.'}</p>
              
              <div className="mt-2 flex items-center gap-1.5 text-gold hover:text-cream transition-colors text-[10px] tracking-wider cursor-pointer">
                <Compass size={11} className="stroke-[1.5]" />
                <span className="font-semibold font-sans tracking-wide">artbro.gallery/{artist.name.toLowerCase().replace(/\s+/g, '')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ─────────────── TABS BAR ─────────────── */}
        <div className="flex justify-center gap-16 border-t border-transparent mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-4 font-sans text-[9px] tracking-[0.25em] uppercase border-t-[1.5px] transition-all duration-300 ${
              activeTab === 'posts' 
                ? 'border-cream text-cream font-semibold' 
                : 'border-transparent text-mist/40 hover:text-mist'
            }`}
          >
            <Grid size={11} /> Sketches Grid
          </button>
          <button
            onClick={() => setActiveTab('series')}
            className={`flex items-center gap-2 py-4 font-sans text-[9px] tracking-[0.25em] uppercase border-t-[1.5px] transition-all duration-300 ${
              activeTab === 'series' 
                ? 'border-cream text-cream font-semibold' 
                : 'border-transparent text-mist/40 hover:text-mist'
            }`}
          >
            <Bookmark size={11} /> Curations
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 py-4 font-sans text-[9px] tracking-[0.25em] uppercase border-t-[1.5px] transition-all duration-300 ${
              activeTab === 'about' 
                ? 'border-cream text-cream font-semibold' 
                : 'border-transparent text-mist/40 hover:text-mist'
            }`}
          >
            <Info size={11} /> biography
          </button>
        </div>

        {/* ─────────────── TAB CONTENTS ─────────────── */}
        <main className="w-full">
          {activeTab === 'posts' && (
            <div>
              {artworks.length === 0 ? (
                <div className="text-center py-20 bg-zinc-950/20 border border-white/5">
                  <p className="font-serif text-lg text-gold mb-1">No post records found</p>
                  <p className="font-sans text-xs text-mist/50">This artist has not posted catalog sketches yet.</p>
                </div>
              ) : (
                /* Grid of Post Item squares */
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                  {artworks.map((artwork) => (
                    <div
                      key={artwork.id}
                      onClick={() => setSelectedArtwork(artwork)}
                      className="group relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer border border-white/5"
                    >
                      <img
                        src={resolveImageUrl(artwork.image)}
                        alt={artwork.title}
                        className="w-full h-full object-cover filter brightness-95 group-hover:scale-102 transition-transform duration-500"
                      />
                      {/* Premium IG Stat Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-1.5 text-cream font-sans text-xs">
                          <Heart size={14} className="fill-cream" />
                          <span>42</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-cream font-sans text-xs">
                          <MessageCircle size={14} className="fill-cream" />
                          <span>5</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'series' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
              <div className="bg-zinc-950/40 border border-white/5 p-6 flex flex-col justify-between aspect-[4/3] rounded-sm">
                <div>
                  <span className="font-sans text-[8px] tracking-[0.2em] text-gold uppercase block mb-1">Active Curation Series</span>
                  <h4 className="font-serif text-xl text-cream mb-2">Contrast Lines</h4>
                  <p className="font-sans text-[11px] text-mist/60 leading-relaxed">
                    A limited collection exploring raw charcoal shading structures and volumetric pencil densities.
                  </p>
                </div>
                <div className="text-[10px] text-mist font-sans">{artworks.length} sketched entries</div>
              </div>
              <div className="bg-zinc-950/40 border border-white/5 p-6 flex flex-col justify-between aspect-[4/3] rounded-sm border-dashed">
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-mist/30">
                    <Plus size={16} />
                  </div>
                  <span className="font-sans text-[9px] tracking-widest text-mist/30 uppercase">Under Construction</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <article className="bg-zinc-950/30 border border-white/5 p-8 flex flex-col gap-6 font-sans text-xs leading-relaxed text-mist">
              <div>
                <h4 className="font-serif text-cream text-lg mb-2">Biography</h4>
                <p className="text-mist/80">{artist.bio || 'Exploring pencil shades and high contrast ink residency.'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div>
                  <span className="font-semibold text-gold block mb-1">Specialization</span>
                  <span className="text-mist/70">{artist.specialization}</span>
                </div>
                <div>
                  <span className="font-semibold text-gold block mb-1">Residency Status</span>
                  <span className="text-mist/70">{artist.experience || 'Professional Resident Artist'}</span>
                </div>
              </div>
              
              {/* Dynamic Social Portfolios */}
              {artist.socialLinks && (artist.socialLinks.instagram || artist.socialLinks.behance) && (
                <div className="border-t border-white/5 pt-6 flex flex-col gap-3">
                  <span className="font-semibold text-cream block">External Portfolios</span>
                  <div className="flex gap-6">
                    {artist.socialLinks.instagram && (
                      <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gold hover:underline uppercase text-[9px] tracking-wider">
                        Instagram Feed <ExternalLink size={10} />
                      </a>
                    )}
                    {artist.socialLinks.behance && (
                      <a href={artist.socialLinks.behance} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gold hover:underline uppercase text-[9px] tracking-wider">
                        Behance Work <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </article>
          )}
        </main>

      </div>



      {/* ─────────────── HIGH-FIDELITY DETAILED LIGHTBOX ─────────────── */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-[2px] z-[999] flex items-center justify-center p-2 md:p-6"
          >
            {/* Split Card */}
            <div className="relative bg-zinc-950 border border-white/10 max-w-4xl w-full max-h-[90vh] md:max-h-[80vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl rounded-sm">
              
              {/* Lightbox Image Left Side */}
              <div className="md:w-3/5 bg-black flex items-center justify-center p-4 relative min-h-[300px] md:min-h-0">
                <img
                  src={resolveImageUrl(selectedArtwork.image)}
                  alt={selectedArtwork.title}
                  className="max-h-[45vh] md:max-h-[70vh] w-full object-contain"
                />
              </div>

              {/* Lightbox Detail Content Right Side */}
              <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5">
                
                {/* Scrollable description & comments */}
                <div className="flex flex-col gap-6 overflow-y-auto max-h-[40vh] md:max-h-[50vh] pr-1">
                  
                  {/* Custom Split Header */}
                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full border border-gold/30 overflow-hidden">
                        <img src={resolveImageUrl(artist.profileImage)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-sans text-[11px] font-semibold text-cream leading-tight">{artist.name}</span>
                          <CheckCircle2 size={11} className="text-blue-400 fill-blue-400" />
                        </div>
                        <span className="font-sans text-[8px] text-mist/40 leading-none">Sponsored</span>
                      </div>
                    </div>
                    
                    {/* Close action */}
                    <button
                      onClick={() => setSelectedArtwork(null)}
                      className="text-mist/40 hover:text-cream text-xl font-light font-sans leading-none"
                    >
                      ×
                    </button>
                  </div>

                  {/* Artwork specification */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-serif text-xl text-cream tracking-wide">{selectedArtwork.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-gold text-[9px] tracking-wider uppercase font-semibold">{selectedArtwork.medium}</span>
                      <span className="text-mist/20">•</span>
                      <span className="font-sans text-mist/40 text-[9px]">{selectedArtwork.dimensions}</span>
                    </div>
                    <p className="font-sans text-[11px] text-mist/60 leading-relaxed mt-2">
                      {selectedArtwork.description || 'A cinematic graphite hand sketch rendered on museum-grade textured document paper.'}
                    </p>
                  </div>

                  {/* Instagram-style Comments list */}
                  <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                    <span className="font-sans text-[9px] tracking-wider text-mist/30 uppercase">Appreciation Feed</span>
                    <div className="flex flex-col gap-3">
                      {MOCK_COMMENTS.map((comment, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start text-[10px] font-sans">
                          <span className="font-semibold text-cream">{comment.user}</span>
                          <p className="text-mist/70 flex-1 leading-relaxed">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer action checkout */}
                <div className="border-t border-white/5 pt-6 mt-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-sans text-[8px] tracking-widest text-mist/40 uppercase">Collector Price</span>
                      <span className="font-sans text-lg font-bold text-cream">${selectedArtwork.price}</span>
                    </div>
                    <span className={`font-sans text-[9px] tracking-widest uppercase px-2.5 py-0.5 border ${
                      selectedArtwork.status === 'SOLD' 
                        ? 'border-red-500/20 bg-red-500/5 text-red-400' 
                        : 'border-green-500/20 bg-green-500/5 text-green-400'
                    }`}>
                      {selectedArtwork.status}
                    </span>
                  </div>

                  {selectedArtwork.status === 'AVAILABLE' ? (
                    <button
                      onClick={() => handleAddToCart(selectedArtwork)}
                      className="w-full font-sans text-[10px] tracking-[0.25em] text-void uppercase bg-ivory py-4 hover:bg-gold hover:text-void transition-all duration-400 flex justify-center items-center h-[48px] font-bold"
                    >
                      <ShoppingBag size={12} className="mr-2" /> Add to Collection
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full font-sans text-[10px] tracking-[0.25em] text-mist/30 uppercase bg-zinc-950/60 border border-white/10 flex justify-center items-center h-[48px] cursor-not-allowed"
                    >
                      Sold Out
                    </button>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
