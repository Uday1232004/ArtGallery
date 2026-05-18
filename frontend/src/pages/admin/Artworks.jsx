import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { resolveImageUrl } from '../../lib/axios';
import { Plus, Trash2, Edit, Save, X, Image as ImageIcon, Sparkles, ShoppingBag, Eye } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const mapUIToServerCategory = (uiCategory) => {
  switch (uiCategory) {
    case 'Realistic Portrait': return 'PORTRAIT';
    case 'Pen Art': return 'PEN_ART';
    case 'Charcoal Sketch': return 'PAINTING';
    case 'Devotional Painting': return 'KRISHNA_ART';
    default: return 'EXPERIMENTAL';
  }
};

const mapServerToUICategory = (serverCategory) => {
  switch (serverCategory) {
    case 'PORTRAIT': return 'Realistic Portrait';
    case 'PEN_ART': return 'Pen Art';
    case 'PAINTING': return 'Charcoal Sketch';
    case 'KRISHNA_ART': return 'Devotional Painting';
    default: return 'Charcoal Sketch';
  }
};

export default function Artworks() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);
  
  // Filtering States
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pen Art');
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

  // Fetch Artists for Form selector
  const { data: artists = [] } = useQuery({
    queryKey: ['admin-artists-list'],
    queryFn: async () => {
      const { data } = await api.get('/artists');
      return data;
    },
    onSuccess: (data) => {
      if (data.length > 0 && !artistId) {
        setArtistId(data[0].id);
      }
    }
  });

  // Reset form helper
  const resetForm = () => {
    setTitle('');
    setCategory('Pen Art');
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
    
    // Auto-select first artist if exists
    if (artists.length > 0) {
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
    setCategory(art.category ? mapServerToUICategory(art.category) : 'Pen Art');
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

  // Image Selection Handler
  const handleArtChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArtFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/artworks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-artworks']);
      queryClient.invalidateQueries(['artworks']); // refresh public gallery lists
      queryClient.invalidateQueries(['dashboard-analytics']);
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create artwork entry.');
    }
  });

  // Edit/Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.put(`/artworks/${editingArtwork.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-artworks']);
      queryClient.invalidateQueries(['artworks']);
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update artwork entry.');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/artworks/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-artworks']);
      queryClient.invalidateQueries(['artworks']);
      queryClient.invalidateQueries(['dashboard-analytics']);
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this artwork from the gallery database? This action is irreversible.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !medium.trim() || !price || !artistId) {
      setErrorMsg('All fields marked with * are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', mapUIToServerCategory(category));
    formData.append('medium', medium);
    formData.append('yearCreated', year);
    formData.append('dimensions', dimensions);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('artworkStory', artworkStory);
    formData.append('featured', featured);
    formData.append('isOriginal', isOriginal);
    formData.append('stock', stock);
    formData.append('status', isSold ? 'SOLD' : 'AVAILABLE');
    formData.append('artistId', artistId);

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
      <div className="flex flex-col gap-8 w-full h-full animate-pulse">
        <div className="h-10 bg-white/5 w-1/4 rounded"></div>
        <div className="h-96 bg-white/5 rounded-lg border border-white/5"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-400 font-sans p-6 bg-red-950/20 border border-red-500/20 rounded">Failed to load artworks catalogue. Check database connectivity.</div>;
  }

  // Categories list options
  const categoriesList = ['Pen Art', 'Realistic Portrait', 'Charcoal Sketch', 'Devotional Painting'];

  // Filter artworks list
  const filteredArtworks = selectedFilter === 'ALL' 
    ? artworks 
    : artworks.filter(art => mapServerToUICategory(art.category) === selectedFilter);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-4xl text-cream mb-2">Artworks Master Catalogue</h1>
          <p className="font-sans text-sm text-mist/60">Publish new drawings, set sold statuses, configure pricing tags, and toggle homepage highlighting.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto bg-gold text-void py-3 px-6 rounded text-xs font-sans uppercase tracking-widest font-semibold flex items-center gap-2 hover:bg-gold/90 transition-all duration-300"
        >
          <Plus size={14} /> Add Artwork
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`py-2 px-4 rounded text-xs font-sans uppercase tracking-wider transition-all duration-300 ${
            selectedFilter === 'ALL' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-mist/60 hover:text-cream border border-transparent'
          }`}
        >
          All Mediums ({artworks.length})
        </button>
        {categoriesList.map(cat => {
          const count = artworks.filter(a => mapServerToUICategory(a.category) === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`py-2 px-4 rounded text-xs font-sans uppercase tracking-wider transition-all duration-300 ${
                selectedFilter === cat ? 'bg-gold/10 text-gold border border-gold/20' : 'text-mist/60 hover:text-cream border border-transparent'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Artworks Listings Table */}
      <div className="bg-carbon/20 border border-white/5 rounded-lg overflow-hidden">
        {filteredArtworks.length === 0 ? (
          <div className="p-20 text-center text-mist/40 font-sans">
            No drawings or portraits published in this category yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-carbon/40 font-sans text-[10px] tracking-wider text-mist/60 uppercase">
                  <th className="p-5">Artwork Preview</th>
                  <th className="p-5">Title</th>
                  <th className="p-5">Category</th>
                  <th className="p-5">Medium / Specs</th>
                  <th className="p-5">Value / Price</th>
                  <th className="p-5">Attributes</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans text-sm text-mist/85">
                {filteredArtworks.map((art) => (
                  <tr key={art.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="p-5">
                      <div className="w-12 h-12 rounded bg-void overflow-hidden border border-white/5 group-hover:border-gold/30 transition-colors">
                        <img src={resolveImageUrl(art.image)} alt={art.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-5 font-serif text-base text-cream">{art.title}</td>
                    <td className="p-5">
                      <span className="px-2.5 py-0.5 text-[10px] bg-white/5 rounded border border-white/10 text-mist">
                        {mapServerToUICategory(art.category)}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-medium text-ivory">{art.medium}</span>
                        <span className="text-xs text-mist/50 mt-0.5">{art.dimensions} • {art.yearCreated}</span>
                      </div>
                    </td>
                    <td className="p-5 text-gold font-medium">₹{Number(art.price).toLocaleString('en-IN')}</td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1.5">
                        {art.featured && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-gold">
                            <Sparkles size={8} /> Featured
                          </span>
                        )}
                        {art.status === 'SOLD' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-red-400">
                            <ShoppingBag size={8} /> Sold Out
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-green-400">
                            Available
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(art)}
                          className="p-2 bg-white/5 hover:bg-gold/20 text-mist hover:text-gold rounded transition-colors"
                          title="Edit Artwork"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-2 bg-white/5 hover:bg-red-500/20 text-mist hover:text-red-400 rounded transition-colors"
                          title="Delete Artwork"
                        >
                          <Trash2 size={14} />
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

      {/* Creation / Update Modal overlay */}
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
                  {editingArtwork ? 'Edit Artwork Specifications' : 'Publish New Artwork Listing'}
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

                {/* Cover File Selector */}
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Artwork Image *</label>
                  <div className="border border-white/5 bg-void/20 rounded overflow-hidden aspect-[4/3] relative group max-w-md">
                    {previewUrl ? (
                      <img src={resolveImageUrl(previewUrl)} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-mist/30 font-sans gap-2">
                        <ImageIcon size={32} />
                        <span className="text-xs">No artwork file chosen</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-void/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-cream">
                      <Plus size={20} className="text-gold mb-1" />
                      <span className="font-sans text-xs uppercase tracking-wider">Select Drawing File</span>
                      <input type="file" accept="image/*" onChange={handleArtChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Artwork Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                      placeholder="e.g. Divine Flute Player"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                    >
                      {categoriesList.map(cat => <option key={cat} value={cat} className="bg-carbon text-cream">{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Medium * (e.g. Fine Pen on Ivory Sheet)</label>
                    <input
                      type="text"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                      placeholder="Fine pen, Pen & Ink"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Dimensions (e.g. A3 Size)</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                      placeholder="e.g. A3 (29.7 x 42 cm)"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Creation Year</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Valuation Price * (INR)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                      placeholder="15000"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Creator Artist *</label>
                    <select
                      value={artistId}
                      onChange={(e) => setArtistId(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                    >
                      {artists.length === 0 ? (
                        <option value="" className="bg-carbon text-cream">No artists available</option>
                      ) : (
                        artists.map(art => <option key={art.id} value={art.id} className="bg-carbon text-cream">{art.name}</option>)
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    className="bg-void/50 border border-white/10 rounded px-4 py-3 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors resize-none leading-relaxed"
                    placeholder="Provide the physical details..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Emotional Story / Inspiration</label>
                  <textarea
                    value={artworkStory}
                    onChange={(e) => setArtworkStory(e.target.value)}
                    rows="4"
                    className="bg-void/50 border border-white/10 rounded px-4 py-3 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors resize-none leading-relaxed"
                    placeholder="Provide the emotional history, devotional narrative, or artistic inspirations..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Stock Quantity</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isOriginal}
                      onChange={(e) => setIsOriginal(e.target.checked)}
                      className="w-4 h-4 bg-void/50 border border-white/10 rounded text-gold focus:ring-0 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-sans text-sm text-cream font-medium">Original Artwork</span>
                      <span className="font-sans text-xs text-mist/50">Uncheck if this is a limited print.</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 bg-void/50 border border-white/10 rounded text-gold focus:ring-0 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-sans text-sm text-cream font-medium">Feature on Homepage</span>
                      <span className="font-sans text-xs text-mist/50">Showcase this drawing inside the cinematic Hero/Works displays.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSold}
                      onChange={(e) => setIsSold(e.target.checked)}
                      className="w-4 h-4 bg-void/50 border border-white/10 rounded text-gold focus:ring-0 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="font-sans text-sm text-cream font-medium">Mark as Sold Out</span>
                      <span className="font-sans text-xs text-mist/50">Render a 'Sold' badge and prevent incoming acquisition forms.</span>
                    </div>
                  </label>
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
                    {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save Artwork'}
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
