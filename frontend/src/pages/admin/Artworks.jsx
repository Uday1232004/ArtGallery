import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { resolveImageUrl } from '../../lib/axios';
import { 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Image as ImageIcon, 
  Sparkles, 
  ShoppingBag, 
  Eye,
  Grid,
  Bookmark,
  Info,
  CheckCircle2,
  Heart,
  MessageCircle,
  FileText,
  Compass,
  ArrowRight,
  Camera,
  Settings,
  Save
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import EditProfileModal from '../../components/profile/EditProfileModal';

export default function Artworks() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  
  // Tab states
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'list'
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);
  
  // High-Fidelity Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [medium, setMedium] = useState('');
  const [year, setYear] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [artworkStory, setArtworkStory] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isSold, setIsSold] = useState(false);
  const [isOriginal, setIsOriginal] = useState(true);
  const [stock, setStock] = useState('1');
  const [artistId, setArtistId] = useState('');
  const [artFile, setArtFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Artworks
  const { data: artworks = [], isLoading, isError } = useQuery({
    queryKey: ['admin-artworks'],
    queryFn: async () => {
      const { data } = await api.get('/artworks');
      return data;
    }
  });

  // Fetch Artists list
  const { data: artists = [] } = useQuery({
    queryKey: ['admin-artists-list'],
    queryFn: async () => {
      const { data } = await api.get('/artists');
      return data;
    }
  });

  useEffect(() => {
    if (artists.length > 0 && !artistId) {
      // Always default to the logged-in user's own artist profile
      const myArtist = artists.find(a => a.userId === user?.id || a.email === user?.email);
      if (myArtist) {
        setArtistId(myArtist.id);
      } else if (user?.artistId) {
        setArtistId(user.artistId);
      } else if (user?.role === 'SUPER_ADMIN') {
        // Super admin fallback: show all
        setArtistId('all');
      } else {
        setArtistId(artists[0].id);
      }
    }
  }, [artists, user]);

  // Resolve matching artist profile for creator header
  const currentArtist = artistId && artistId !== 'all'
    ? artists.find(a => a.id === artistId) 
    : undefined;

  // Filter artworks: if specific artist selected, show only their artworks; otherwise show all
  const myArtworks = currentArtist
    ? artworks.filter(art => art.artistId === currentArtist.id || art.artist?.id === currentArtist.id)
    : artworks;



  const resetForm = () => {
    setTitle('');
    setCategory('');
    setMedium('');
    setYear(new Date().getFullYear().toString());
    setDimensions('');
    setPrice('');
    setDescription('');
    setArtworkStory('');
    setFeatured(false);
    setIsSold(false);
    setIsOriginal(true);
    setStock('1');
    
    const userArtist = artists.find(a => a.userId === user?.id || a.email === user?.email);
    if (currentArtist) {
      setArtistId(currentArtist.id);
    } else if (userArtist) {
      setArtistId(userArtist.id);
    } else if (artists.length > 0) {
      setArtistId(artists[0].id);
    } else {
      setArtistId('');
    }
    
    setArtFile(null);
    setPreviewUrl('');
    setErrorMsg('');
    setEditingArtwork(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (art) => {
    resetForm();
    setEditingArtwork(art);
    setTitle(art.title || '');
    setCategory(art.category || '');
    setMedium(art.medium || '');
    setYear(art.yearCreated ? art.yearCreated.toString() : '');
    setDimensions(art.dimensions || '');
    setPrice(art.price ? art.price.toString() : '');
    setDescription(art.description || '');
    setArtworkStory(art.artworkStory || '');
    setFeatured(art.featured || false);
    setIsSold(art.status === 'SOLD');
    setIsOriginal(art.isOriginal !== false);
    setStock(art.stock ? art.stock.toString() : '1');
    setArtistId(art.artistId || '');
    setPreviewUrl(art.image || '');
    setIsModalOpen(true);
  };

  const handleArtChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArtFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleOpenEditProfile = () => {
    if (!currentArtist) return;
    setIsProfileModalOpen(true);
  };



  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/artworks', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artworks'] });
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create artwork post.');
    }
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.put(`/artworks/${editingArtwork.id}`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artworks'] });
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update artwork post.');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/artworks/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-artworks'] });
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
    }
  });

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Permanently delete this sketch post from your Instagram-style grid? This action is irreversible.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Resolve the real artistId — 'all' is a UI-only sentinel, not a valid DB id
    const resolvedArtistId = artistId === 'all'
      ? (artists.find(a => a.userId === user?.id || a.email === user?.email)?.id || artists[0]?.id || '')
      : artistId;

    if (!title.trim() || !medium.trim() || !price || !resolvedArtistId) {
      setErrorMsg('Required fields (*) must be completed before publishing. Make sure an artist profile is selected.');
      return;
    }

    if (!artFile && !editingArtwork) {
      setErrorMsg('Please select an image file for the artwork.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('medium', medium);
    formData.append('yearCreated', year || new Date().getFullYear());
    formData.append('dimensions', dimensions);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('artworkStory', artworkStory);
    formData.append('featured', featured);
    formData.append('isOriginal', isOriginal);
    formData.append('stock', stock);
    formData.append('status', isSold ? 'SOLD' : 'AVAILABLE');
    formData.append('artistId', resolvedArtistId);

    if (artFile) {
      formData.append('image', artFile);
    }

    if (editingArtwork) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 w-full animate-pulse pt-6">
        <div className="h-20 bg-white/5 w-2/3 rounded"></div>
        <div className="h-80 bg-white/5 rounded border border-white/5"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-400 font-sans p-6 bg-red-950/20 border border-red-500/20 rounded">Failed to load creator portfolios. Check server logs.</div>;
  }

  // Global counts for adminFALLBACK
  const globalSoldCount = myArtworks.filter(art => art.status === 'SOLD').length;
  const globalSoldRatio = myArtworks.length > 0 ? Math.round((globalSoldCount / myArtworks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 font-sans text-ivory">

      {/* ─────────────── PREMIUM CENTERED CREATOR PROFILE HEADER ─────────────── */}
      <header className="flex flex-col items-center justify-center text-center gap-6 pb-10 border-b border-white/5 max-w-4xl mx-auto w-full">
        
        {/* Clean Luxury Avatar */}
        <div className="relative flex-shrink-0">
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border border-gold/30 bg-zinc-950 p-1 shadow-xl">
            {currentArtist?.profileImage ? (
              <img
                src={resolveImageUrl(currentArtist.profileImage)}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center font-serif text-4xl text-mist/30">
                {currentArtist?.name?.charAt(0) || user?.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        </div>

        {/* Creator Specs */}
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl text-cream tracking-wide font-light uppercase">
                {currentArtist?.name || 'ArtBro Curator'}
              </h1>
              {currentArtist?.isVerified && (
                <CheckCircle2 size={15} className="text-gold fill-gold/10" />
              )}
            </div>
            {currentArtist?.username && (
              <span className="font-sans text-[10px] tracking-[0.2em] text-gold uppercase font-semibold">
                @{currentArtist.username}
              </span>
            )}
          </div>
          
          {/* Action Row */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleOpenCreate}
              className="bg-gold text-void px-6 py-2 rounded-none font-sans text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-cream hover:text-void transition-all duration-300 shadow-lg"
            >
              + Add Post
            </button>
            
            {currentArtist && (
              <button
                onClick={handleOpenEditProfile}
                className="border border-gold/20 hover:border-gold/50 text-cream px-6 py-2 rounded-none font-sans text-[10px] tracking-[0.2em] uppercase font-bold hover:bg-gold/5 transition-all duration-300"
              >
                Edit Profile
              </button>
            )}

            {user?.role === 'SUPER_ADMIN' && (
              <div className="flex items-center bg-zinc-950 border border-white/5 px-4 py-1.5 rounded-none text-[9px] text-mist/60 gap-2">
                <span className="uppercase tracking-widest text-[8px]">Acting As:</span>
                <select 
                  value={artistId} 
                  onChange={(e) => setArtistId(e.target.value)}
                  className="bg-transparent text-gold outline-none border-none cursor-pointer font-bold uppercase tracking-widest"
                >
                  <option value="all" className="bg-zinc-950 text-cream">All Artists</option>
                  {artists.map(art => <option key={art.id} value={art.id} className="bg-zinc-950 text-cream">{art.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-12 font-sans text-xs border-y border-white/5 py-3 w-full justify-center max-w-md my-2">
            <div className="text-center">
              <span className="block font-serif text-lg text-cream leading-tight">{myArtworks.length}</span>
              <span className="text-[9px] tracking-widest text-mist/40 uppercase">posts</span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-lg text-cream leading-tight">
                {currentArtist?.followersCount?.toLocaleString('en-US') || '0'}
              </span>
              <span className="text-[9px] tracking-widest text-mist/40 uppercase">followers</span>
            </div>
            <div className="text-center">
              <span className="block font-serif text-lg text-cream leading-tight">
                {currentArtist?.followingCount?.toLocaleString('en-US') || '0'}
              </span>
              <span className="text-[9px] tracking-widest text-mist/40 uppercase">following</span>
            </div>
          </div>

          {/* Bio block */}
          <div className="font-sans text-[11px] text-mist/80 max-w-xl leading-relaxed flex flex-col items-center gap-1.5">
            <span className="font-semibold text-gold/80 tracking-[0.25em] text-[9px] uppercase">
              {currentArtist?.specialization || 'Fine Art Curator'}
            </span>
            <p className="text-mist/70 whitespace-pre-wrap text-center">
              {currentArtist?.bio || 'Authorized administrator workspace to manage catalog sketches.'}
            </p>
            {currentArtist?.website && (
              <div className="mt-1 flex items-center gap-1.5 text-gold hover:text-cream transition-colors text-[10px] tracking-wider">
                <Compass size={11} className="stroke-[1.5]" />
                <a href={currentArtist.website} target="_blank" rel="noreferrer" className="hover:underline">
                  {currentArtist.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────── TABS TRIGGER BAR ─────────────── */}
      <div className="flex justify-center gap-16 mb-4">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex items-center gap-2 py-3 font-sans text-[9px] tracking-[0.25em] uppercase border-t-[1.5px] transition-all duration-300 ${
            activeTab === 'grid' 
              ? 'border-cream text-cream font-semibold' 
              : 'border-transparent text-mist/40 hover:text-mist'
          }`}
        >
          <Grid size={11} /> POSTS
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 py-3 font-sans text-[9px] tracking-[0.25em] uppercase border-t-[1.5px] transition-all duration-300 ${
            activeTab === 'list' 
              ? 'border-cream text-cream font-semibold' 
              : 'border-transparent text-mist/40 hover:text-mist'
          }`}
        >
          <FileText size={11} /> CATALOG
        </button>
      </div>

      {/* ─────────────── TABS CONTAINER ─────────────── */}
      <main className="w-full">
        {activeTab === 'grid' ? (
          <div>
            {myArtworks.length === 0 ? (
              <div className="text-center py-20 bg-zinc-950/20 border border-white/5">
                <p className="font-serif text-base text-gold mb-1">Grid Portfolio Empty</p>
                <p className="font-sans text-xs text-mist/40">Click "+ Add Post" to publish your first drawing artwork.</p>
              </div>
            ) : (
              /* Instagram 3-column aspect-square grid with admin tools on hover */
              <div className="grid grid-cols-3 gap-1 md:gap-4">
                {myArtworks.map((artwork) => (
                  <div
                    key={artwork.id}
                    className="group relative aspect-square bg-zinc-900 overflow-hidden border border-white/5 cursor-pointer"
                  >
                    <img
                      src={resolveImageUrl(artwork.image)}
                      alt={artwork.title}
                      className="w-full h-full object-cover filter brightness-95 group-hover:scale-102 transition-transform duration-500"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80'; }}
                    />
                    
                    {/* Hover Admin Actions & stats */}
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 gap-4">
                      <div className="text-center">
                        <h4 className="font-serif text-sm text-cream truncate max-w-[150px] mb-1">{artwork.title}</h4>
                        <span className="text-[9px] text-gold tracking-wide uppercase font-semibold">{artwork.category}</span>
                      </div>
                      
                      <div className="flex gap-3 mt-1">
                        <button
                          onClick={() => handleOpenEdit(artwork)}
                          className="w-9 h-9 rounded-full bg-cream text-void flex items-center justify-center hover:bg-gold transition-colors"
                          title="Edit Post Details"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(artwork.id, e)}
                          className="w-9 h-9 rounded-full bg-red-500/80 hover:bg-red-500 text-cream flex items-center justify-center transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="flex gap-4 text-[9px] text-mist/60 mt-2 font-sans">
                        <span>₹{Number(artwork.price).toLocaleString('en-IN')}</span>
                        <span className={artwork.status === 'SOLD' ? 'text-red-400' : 'text-green-400'}>{artwork.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Catalog Details Advanced Table Tab */
          <div className="bg-carbon/25 border border-white/5 rounded overflow-hidden">
            {myArtworks.length === 0 ? (
              <div className="p-20 text-center text-mist/40 font-sans">No drawings catalogued yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-carbon/40 font-sans text-[10px] tracking-wider text-mist/60 uppercase">
                      <th className="p-5">Post Preview</th>
                      <th className="p-5">Title</th>
                      <th className="p-5">Category</th>
                      <th className="p-5">Medium Details</th>
                      <th className="p-5">Valuation</th>
                      <th className="p-5">Attributes</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-mist/85">
                    {myArtworks.map((art) => (
                      <tr key={art.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="p-5">
                          <div className="w-11 h-11 rounded bg-zinc-950 overflow-hidden border border-white/5">
                            <img src={resolveImageUrl(art.image)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80'; }} />
                          </div>
                        </td>
                        <td className="p-5 font-serif text-cream text-base">{art.title}</td>
                        <td className="p-5">
                          <span className="px-2 py-0.5 text-[9px] bg-white/5 border border-white/10 rounded uppercase text-mist/70 tracking-wider">
                            {art.category}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col">
                            <span>{art.medium}</span>
                            <span className="text-[10px] text-mist/40 mt-0.5">{art.dimensions} • {art.yearCreated}</span>
                          </div>
                        </td>
                        <td className="p-5 text-gold font-medium">₹{Number(art.price).toLocaleString('en-IN')}</td>
                        <td className="p-5">
                          <div className="flex flex-col gap-1">
                            {art.featured && <span className="text-[8px] tracking-wider uppercase text-gold">Featured</span>}
                            {art.status === 'SOLD' ? (
                              <span className="text-[8px] tracking-wider uppercase text-red-400">Sold Out</span>
                            ) : (
                              <span className="text-[8px] tracking-wider uppercase text-green-400">Available</span>
                            )}
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(art)}
                              className="p-2 bg-white/5 hover:bg-gold/20 text-mist hover:text-gold rounded transition-colors"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(art.id, e)}
                              className="p-2 bg-white/5 hover:bg-red-500/20 text-mist hover:text-red-400 rounded transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* External Components */}
      <EditProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        currentArtist={currentArtist} 
      />
      
      {/* ─────────────── POST/EDIT ARTWORK MODAL ─────────────── */}

      {/* ─────────────── HIGH-FIDELITY DOUBLE-PANE POST MODAL ─────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6">
            
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-void/85 backdrop-blur-md"
            />

            {/* Split Creator Pane */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              data-lenis-prevent
              className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-sm shadow-2xl flex flex-col z-10 max-h-[92vh] overflow-y-auto"
            >
              {/* Header Title */}
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-950">
                <span className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase font-bold">
                  {editingArtwork ? 'Edit published sketch details' : 'Create New Sketch Post'}
                </span>
                <button onClick={() => setIsModalOpen(false)} className="text-mist/50 hover:text-cream transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Main Content Area: Split 2-Columns */}
              <div className="flex flex-col md:flex-row min-h-[480px]">
                
                {/* Column A (Left): Instagram Media Canvas Preview */}
                <div className="md:w-1/2 bg-black flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/5">
                  <div className="w-full aspect-square max-w-[340px] border border-dashed border-white/10 rounded-sm relative overflow-hidden bg-zinc-950 flex flex-col items-center justify-center group">
                    
                    {previewUrl ? (
                      <img 
                        src={resolveImageUrl(previewUrl)} 
                        alt="Canvas Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80'; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-mist/30 text-center p-6 font-sans">
                        <ImageIcon size={38} className="stroke-[1.5] text-mist/20" />
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] tracking-wider uppercase text-mist/50">Drag drawings here</span>
                          <span className="text-[8px] text-mist/30">Supports JPG, PNG formats</span>
                        </div>
                      </div>
                    )}

                    {/* Overlay trigger */}
                    <label className="absolute inset-0 bg-void/80 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-cream">
                      <Plus size={20} className="text-gold mb-1" />
                      <span className="font-sans text-[9px] tracking-wider uppercase">Select Media File</span>
                      <input type="file" accept="image/*" onChange={handleArtChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Column B (Right): Instagram metadata details */}
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-zinc-950 font-sans text-xs">
                  
                  {/* Form Specifications */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto max-h-[50vh] md:max-h-[60vh] pr-1">
                    {errorMsg && (
                      <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-200 text-[10px] leading-relaxed rounded-sm">
                        {errorMsg}
                      </div>
                    )}

                    {/* Author IG Header info */}
                    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                      <div className="w-8 h-8 rounded-full border border-gold/30 overflow-hidden bg-zinc-900 flex items-center justify-center">
                        {currentArtist?.profileImage ? (
                          <img 
                            src={resolveImageUrl(currentArtist.profileImage)} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="font-serif text-sm text-mist/40">
                            {currentArtist?.name?.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-cream leading-tight">{currentArtist?.name || 'Curator'}</span>
                          <CheckCircle2 size={11} className="text-blue-400 fill-blue-400" />
                        </div>
                        <span className="text-[8px] text-mist/40 leading-none">Creator Studio</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8.5px] tracking-wider text-mist uppercase font-semibold">Post Title *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="bg-zinc-900 border border-white/5 rounded px-3 py-2 text-cream outline-none focus:border-gold/30 transition-colors"
                        placeholder="e.g. Divine flute sketch"
                      />
                    </div>

                    {/* Shading Category Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8.5px] tracking-wider text-mist uppercase font-semibold">Category Medium *</label>
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="bg-zinc-900 border border-white/5 rounded px-3 py-2 text-cream outline-none focus:border-gold/30 transition-colors"
                        placeholder="e.g. Realistic Portrait"
                      />
                    </div>

                    {/* Specifications Inline */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8.5px] tracking-wider text-mist uppercase font-semibold">Medium Material *</label>
                        <input
                          type="text"
                          value={medium}
                          onChange={(e) => setMedium(e.target.value)}
                          required
                          className="bg-zinc-900 border border-white/5 rounded px-3 py-2 text-cream outline-none focus:border-gold/30 transition-colors"
                          placeholder="e.g. Pen on Ivory sheet"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8.5px] tracking-wider text-mist uppercase font-semibold">Dimensions</label>
                        <input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          className="bg-zinc-900 border border-white/5 rounded px-3 py-2 text-cream outline-none focus:border-gold/30 transition-colors"
                          placeholder="e.g. A3 Size"
                        />
                      </div>
                    </div>

                    {/* Price and Year */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8.5px] tracking-wider text-mist uppercase font-semibold">Valuation (INR) *</label>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                          className="bg-zinc-900 border border-white/5 rounded px-3 py-2 text-cream outline-none focus:border-gold/30 transition-colors text-gold font-semibold"
                          placeholder="₹15000"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[8.5px] tracking-wider text-mist uppercase font-semibold">Creation Year</label>
                        <input
                          type="number"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="bg-zinc-900 border border-white/5 rounded px-3 py-2 text-cream outline-none focus:border-gold/30 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Inspo Caption Area */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8.5px] tracking-wider text-mist uppercase font-semibold">Write Caption (Description) *</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows="3"
                        className="bg-zinc-900 border border-white/5 rounded px-3 py-2 text-cream outline-none focus:border-gold/30 transition-colors resize-none leading-relaxed"
                        placeholder="Provide details about line weights and layout..."
                      />
                    </div>

                    {/* Story Area */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[8.5px] tracking-wider text-mist uppercase font-semibold">Emotional Story / Inspiration</label>
                      <textarea
                        value={artworkStory}
                        onChange={(e) => setArtworkStory(e.target.value)}
                        rows="3"
                        className="bg-zinc-900 border border-white/5 rounded px-3 py-2 text-cream outline-none focus:border-gold/30 transition-colors resize-none leading-relaxed"
                        placeholder="Detail the spiritual history or creative focus behind the graphite..."
                      />
                    </div>

                    {/* Attributes Toggles */}
                    <div className="flex flex-col gap-2 pt-1 border-t border-white/5 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={isOriginal} 
                          onChange={(e) => setIsOriginal(e.target.checked)}
                          className="w-3.5 h-3.5 bg-zinc-900 border border-white/5 rounded text-gold focus:ring-0" 
                        />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-cream">Original Work</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={featured} 
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="w-3.5 h-3.5 bg-zinc-900 border border-white/5 rounded text-gold focus:ring-0" 
                        />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-cream">Feature Post on Homepage</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={isSold} 
                          onChange={(e) => setIsSold(e.target.checked)}
                          className="w-3.5 h-3.5 bg-zinc-900 border border-white/5 rounded text-gold focus:ring-0" 
                        />
                        <div className="flex flex-col">
                          <span className="text-[10px] text-cream">Mark Post as Sold Out</span>
                        </div>
                      </label>
                    </div>
                  </form>

                  {/* Submission Row */}
                  <div className="border-t border-white/5 pt-4 mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 border border-white/10 hover:border-white/20 text-mist hover:text-cream py-2.5 rounded-sm font-sans uppercase text-[9px] tracking-widest transition-colors font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={createMutation.isLoading || updateMutation.isLoading}
                      className="flex-1 bg-gold text-void py-2.5 rounded-sm font-sans uppercase text-[9px] tracking-widest font-bold flex items-center justify-center gap-1.5 hover:bg-gold/90 transition-all duration-300"
                    >
                      <Save size={11} />
                      {createMutation.isLoading || updateMutation.isLoading ? 'Posting...' : 'Publish Post'}
                    </button>
                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
