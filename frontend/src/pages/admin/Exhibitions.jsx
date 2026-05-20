import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Calendar, MapPin, Plus, Trash2, Edit, Save, X, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Exhibitions() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [selectedArtworks, setSelectedArtworks] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Exhibitions
  const { data: exhibitions = [], isLoading, isError } = useQuery({
    queryKey: ['admin-exhibitions'],
    queryFn: async () => {
      const { data } = await api.get('/exhibitions');
      return data;
    }
  });

  // Fetch Artworks for Multi-Select linkage
  const { data: artworks = [] } = useQuery({
    queryKey: ['admin-artworks-list'],
    queryFn: async () => {
      const { data } = await api.get('/artworks');
      return data;
    }
  });

  // Reset form helper
  const resetForm = () => {
    setName('');
    setTheme('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setLocation('');
    setSelectedArtworks([]);
    setBannerFile(null);
    setPreviewUrl('');
    setErrorMsg('');
    setEditingExhibition(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exh) => {
    resetForm();
    setEditingExhibition(exh);
    setName(exh.name || '');
    setTheme(exh.theme || '');
    setDescription(exh.description || '');
    
    // Formatting date to yyyy-MM-dd
    if (exh.startDate) setStartDate(new Date(exh.startDate).toISOString().split('T')[0]);
    if (exh.endDate) setEndDate(new Date(exh.endDate).toISOString().split('T')[0]);
    
    setLocation(exh.location || '');
    setPreviewUrl(exh.bannerImage || '');
    
    // Linked artwork ids mapping
    const linkedIds = (exh.artworks || []).map(link => link.artworkId || link.artwork?.id);
    setSelectedArtworks(linkedIds.filter(Boolean));
    
    setIsModalOpen(true);
  };

  // Image Selection Handler
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Multi-Select Artwork Link Trigger
  const toggleArtworkSelect = (artId) => {
    setSelectedArtworks(prev => 
      prev.includes(artId) 
        ? prev.filter(id => id !== artId) 
        : [...prev, artId]
    );
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/exhibitions', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exhibitions'] });
      queryClient.invalidateQueries({ queryKey: ['exhibitions'] }); // refresh public exhibitions query as well
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create exhibition.');
    }
  });

  // Edit/Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.put(`/exhibitions/${editingExhibition.id}`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exhibitions'] });
      queryClient.invalidateQueries({ queryKey: ['exhibitions'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update exhibition.');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/exhibitions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exhibitions'] });
      queryClient.invalidateQueries({ queryKey: ['exhibitions'] });
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this exhibition and all its linked entries?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !theme.trim() || !startDate || !endDate) {
      setErrorMsg('All fields marked with * are required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('theme', theme);
    formData.append('description', description);
    formData.append('startDate', new Date(startDate).toISOString());
    formData.append('endDate', new Date(endDate).toISOString());
    formData.append('location', location);
    formData.append('artworkIds', JSON.stringify(selectedArtworks));

    if (bannerFile) {
      formData.append('bannerImage', bannerFile);
    }

    if (editingExhibition) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 w-full h-full animate-pulse">
        <div className="h-10 bg-white/5 w-1/4 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="h-64 bg-white/5 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-400 font-sans p-6 bg-red-950/20 border border-red-500/20 rounded">Failed to load exhibitions. Verify database schema is pushed.</div>;
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-4xl text-cream mb-2">Exhibitions & Digital Showcases</h1>
          <p className="font-sans text-sm text-mist/60">Schedule, organize, and manage physical displays and digital solo show calendars.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto bg-gold text-void py-3 px-6 rounded text-xs font-sans uppercase tracking-widest font-semibold flex items-center gap-2 hover:bg-gold/90 transition-all duration-300"
        >
          <Plus size={14} /> Add Exhibition
        </button>
      </header>

      {/* Exhibitions Grid list */}
      {exhibitions.length === 0 ? (
        <div className="bg-carbon/10 border border-white/5 border-dashed rounded-lg p-20 text-center text-mist/40 font-sans">
          No exhibitions planned. Click "Add Exhibition" to publish your first showcase!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {exhibitions.map((exh) => (
            <div key={exh.id} className="bg-carbon/30 border border-white/5 rounded-lg overflow-hidden group flex flex-col h-full relative">
              <div className="aspect-[21/9] w-full bg-void/50 overflow-hidden relative border-b border-white/5">
                <img
                  src={exh.bannerImage || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80"}
                  alt={exh.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon to-transparent mix-blend-multiply" />
                
                {/* Buttons overlay */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(exh)}
                    className="p-2 bg-void/80 hover:bg-gold text-cream hover:text-void rounded backdrop-blur-sm transition-all duration-300"
                    title="Edit Exhibition"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(exh.id)}
                    className="p-2 bg-void/80 hover:bg-red-500 text-cream rounded backdrop-blur-sm transition-all duration-300"
                    title="Delete Exhibition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 gap-4">
                <div>
                  <h3 className="font-serif text-xl text-cream mb-1">{exh.name}</h3>
                  <p className="font-sans text-xs text-gold/80 italic">{exh.theme}</p>
                </div>

                <p className="font-sans text-xs text-mist/75 line-clamp-3 leading-relaxed flex-1">{exh.description}</p>

                <div className="border-t border-white/5 pt-4 flex flex-wrap justify-between items-center gap-3 text-xs text-mist/60 font-sans">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-gold/60" />
                    <span>
                      {new Date(exh.startDate).toLocaleDateString()} — {new Date(exh.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {exh.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-gold/60" />
                      <span>{exh.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation / Editing Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-void/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              data-lenis-prevent
              className="relative w-full max-w-4xl bg-carbon border border-white/10 rounded-lg max-h-[90vh] overflow-y-auto z-10 flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-carbon/50">
                <h2 className="font-serif text-2xl text-cream">
                  {editingExhibition ? 'Edit Exhibition Schedule' : 'Schedule New Digital Exhibition'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-mist hover:text-cream transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                {errorMsg && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 font-sans text-xs rounded">
                    {errorMsg}
                  </div>
                )}

                {/* Banner File Selector */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Cover/Banner Image</label>
                  <div className="border border-white/5 bg-void/20 rounded overflow-hidden aspect-[21/9] relative group">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-mist/30 font-sans gap-2">
                        <ImageIcon size={32} />
                        <span className="text-xs">No banner chosen</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-void/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-cream">
                      <Plus size={20} className="text-gold mb-1" />
                      <span className="font-sans text-xs uppercase tracking-wider">Select File</span>
                      <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Exhibition Title *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                      placeholder="e.g. Shadows & Light"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Theme / Vibe *</label>
                    <input
                      type="text"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                      placeholder="e.g. Monochromatic Realism"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Start Date *</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">End Date *</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Display Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                      placeholder="e.g. Virtual Showroom"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Description Narrative</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    className="bg-void/50 border border-white/10 rounded px-4 py-3 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors resize-none leading-relaxed"
                    placeholder="Enter the curated description, storytelling goals, or critical notes..."
                  />
                </div>

                {/* Multi-Select Artwork Linkage Grid */}
                <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
                  <h3 className="font-serif text-lg text-cream">Link Artworks to Exhibition</h3>
                  <p className="font-sans text-xs text-mist/60 mb-2">Select the drawings/paintings to publish inside this showcase.</p>
                  
                  {artworks.length === 0 ? (
                    <div className="p-6 text-center text-mist/40 font-sans border border-dashed border-white/5 rounded">No artworks created yet. Add artworks first.</div>
                  ) : (
                    <div data-lenis-prevent className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-48 overflow-y-auto p-1 bg-void/30 border border-white/5 rounded">
                      {artworks.map(art => {
                        const isSelected = selectedArtworks.includes(art.id);
                        return (
                          <button
                            key={art.id}
                            type="button"
                            onClick={() => toggleArtworkSelect(art.id)}
                            className={`p-3 rounded border text-left flex flex-col gap-2 transition-all duration-300 relative group overflow-hidden ${
                              isSelected 
                                ? 'bg-gold/10 border-gold text-cream' 
                                : 'bg-carbon/40 border-white/5 text-mist hover:border-white/15'
                            }`}
                          >
                            <div className="w-full aspect-[4/3] rounded overflow-hidden bg-void/50 border border-white/5">
                              <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-serif text-xs truncate w-full font-medium">{art.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-6 flex justify-end gap-4 bg-carbon/20 -mx-8 -mb-8 p-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="border border-white/10 hover:border-white/20 text-mist hover:text-cream py-3 px-6 rounded text-xs font-sans uppercase tracking-widest transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    className="bg-gold text-void py-3 px-6 rounded text-xs font-sans uppercase tracking-widest font-semibold flex items-center gap-2 hover:bg-gold/90 transition-all duration-300"
                  >
                    <Save size={14} />
                    {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save Showcase'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
