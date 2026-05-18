import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Camera, Save, AlertCircle, Edit, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Artists() {
  const queryClient = useQueryClient();
  const [editingArtist, setEditingArtist] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [instagram, setInstagram] = useState('');
  const [behance, setBehance] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all artists
  const { data: artists = [], isLoading, isError } = useQuery({
    queryKey: ['admin-artists'],
    queryFn: async () => {
      const { data } = await api.get('/artists');
      return data;
    }
  });

  // Populate editor form when artist is selected
  useEffect(() => {
    if (editingArtist) {
      setName(editingArtist.name || '');
      setBio(editingArtist.bio || '');
      setSpecialization(editingArtist.specialization || '');
      setExperience(editingArtist.experience || '');
      
      const socials = editingArtist.socialLinks || {};
      setInstagram(socials.instagram || '');
      setBehance(socials.behance || '');
      
      setPreviewUrl(editingArtist.profileImage || '');
      setProfileFile(null);
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [editingArtist]);

  // Handle profile image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Mutation to update/save artist
  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.put(`/artists/${editingArtist.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries(['admin-artists']);
      queryClient.invalidateQueries(['artists']); // refresh public artists query as well
      setSuccessMsg('Artist profile saved successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setEditingArtist(updatedData);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to save artist profile.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Artist name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    formData.append('specialization', specialization);
    formData.append('experience', experience);
    
    const socialLinks = { instagram, behance };
    formData.append('socialLinks', JSON.stringify(socialLinks));

    if (profileFile) {
      formData.append('profileImage', profileFile);
    }

    saveMutation.mutate(formData);
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
    return <div className="text-red-400 font-sans p-6 bg-red-950/20 border border-red-500/20 rounded">Failed to load artists data. Please verify MySQL configuration.</div>;
  }

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="font-serif text-4xl text-cream mb-2">Artist Profile Settings</h1>
        <p className="font-sans text-sm text-mist/60">Customize the public bio, specialized media categories, and social pathways shown to visitors.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column — Artist Cards List */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-carbon/20 border border-white/5 p-6 rounded-lg">
            <h2 className="font-serif text-lg text-cream mb-4">Active Profiles</h2>
            {artists.length === 0 ? (
              <div className="p-8 text-center text-mist/40 font-sans border border-dashed border-white/5 rounded">No active artist profiles available. Seed db to start.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {artists.map((art) => (
                  <div key={art.id} className="bg-carbon/40 border border-white/5 p-4 rounded-lg flex items-center gap-4 hover:border-gold/30 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-void/50 border border-white/10 flex-shrink-0">
                      <img 
                        src={art.profileImage || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&q=80"} 
                        alt={art.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-base text-cream truncate">{art.name}</h4>
                      <p className="font-sans text-[10px] tracking-wider text-gold uppercase truncate">{art.specialization}</p>
                      <p className="font-sans text-xs text-mist/40 mt-1">{art.experience}</p>
                    </div>
                    <button
                      onClick={() => setEditingArtist(art)}
                      className="p-2 bg-white/5 hover:bg-gold/20 text-mist hover:text-gold rounded transition-colors"
                      title="Edit Profile Settings"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Artist Profile Editor */}
        <div className="lg:col-span-7">
          {editingArtist ? (
            <form onSubmit={handleSubmit} className="bg-carbon/30 border border-white/10 rounded-lg p-8 flex flex-col gap-6 relative">
              <h2 className="font-serif text-2xl text-cream border-b border-white/5 pb-4">Edit Profile: {editingArtist.name}</h2>
              
              {/* Profile Image Circle File Input */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-void border border-white/10 flex-shrink-0">
                  <img 
                    src={previewUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&q=80"} 
                    alt="Preview" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <label className="absolute inset-0 bg-void/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-cream">
                    <Camera size={18} className="text-gold mb-1" />
                    <span className="font-sans text-[9px] uppercase tracking-wider">Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <div>
                  <h4 className="font-serif text-lg text-cream mb-1">Avatar Graphic</h4>
                  <p className="font-sans text-xs text-mist/60">Choose a premium high-resolution square photograph to present inside your biographical section.</p>
                </div>
              </div>

              {/* Status & Errors alerts */}
              {successMsg && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 font-sans text-xs rounded">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 font-sans text-xs rounded flex items-center gap-2">
                  <AlertCircle size={14} />
                  {errorMsg}
                </div>
              )}

              {/* Form Input fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                    placeholder="Uday Chandra"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Experience Level</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                    placeholder="Self-Taught, 10+ years"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Core Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                  placeholder="Pencil realistic portraits, Pen art, Krishna artworks"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-[10px] tracking-wider text-mist uppercase">Biography Story</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="5"
                  className="bg-void/50 border border-white/10 rounded px-4 py-3 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors resize-none leading-relaxed"
                  placeholder="Describe your creative journey, style definitions, and engineering inspirations..."
                />
              </div>

              <div className="border-t border-white/5 pt-6 flex flex-col gap-6">
                <h3 className="font-serif text-lg text-cream">Social Link Channels</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase flex items-center gap-1.5">
                      Instagram Profile URL <ExternalLink size={10} />
                    </label>
                    <input
                      type="url"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                      placeholder="https://instagram.com/handle"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-[10px] tracking-wider text-mist uppercase flex items-center gap-1.5">
                      Behance Showcase URL <ExternalLink size={10} />
                    </label>
                    <input
                      type="url"
                      value={behance}
                      onChange={(e) => setBehance(e.target.value)}
                      className="bg-void/50 border border-white/10 rounded px-4 py-2.5 font-sans text-sm text-ivory focus:border-gold/50 outline-none transition-colors"
                      placeholder="https://behance.net/username"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saveMutation.isLoading}
                  className="bg-gold text-void py-3 px-6 rounded text-xs font-sans uppercase tracking-widest font-semibold flex items-center gap-2 hover:bg-gold/90 transition-all duration-300 disabled:opacity-50"
                >
                  <Save size={14} />
                  {saveMutation.isLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-carbon/10 border border-white/5 border-dashed rounded-lg p-16 text-center text-mist/40 font-sans">
              Select an active artist profile from the list to begin editing biography details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
