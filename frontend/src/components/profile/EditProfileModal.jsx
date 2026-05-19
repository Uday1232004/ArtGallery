import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Camera, Save, MapPin, Link as LinkIcon, Image as ImageIcon, Crop as CropIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import api, { resolveImageUrl } from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { canvasPreview } from '../../utils/canvasPreview';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function EditProfileModal({ isOpen, onClose, currentArtist }) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('profile'); // profile | verification

  // Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  
  // Socials
  const [instagram, setInstagram] = useState('');
  const [behance, setBehance] = useState('');

  // Image Upload & Crop State
  const [file, setFile] = useState(null); // The final file to upload
  const [previewUrl, setPreviewUrl] = useState(''); // Current preview (existing or new cropped)
  
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(''); // Source for cropping
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (currentArtist && isOpen) {
      setName(currentArtist.name || '');
      setUsername(currentArtist.username || '');
      setBio(currentArtist.bio || '');
      setWebsite(currentArtist.website || '');
      setLocation(currentArtist.location || '');
      setSpecialization(currentArtist.specialization || '');
      setExperience(currentArtist.experience || '');

      const socials = currentArtist.socialLinks || {};
      setInstagram(socials.instagram || '');
      setBehance(socials.behance || '');

      setPreviewUrl(currentArtist.profileImage || '');
      setFile(null);
      setErrorMsg('');
      setActiveTab('profile');
      setCropModalOpen(false);
      setImgSrc('');
    }
  }, [currentArtist, isOpen]);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setCropModalOpen(true);
      });
      reader.readAsDataURL(selected);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  const handleSaveCrop = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      const canvas = document.createElement('canvas');
      try {
        const blob = await canvasPreview(imgRef.current, canvas, completedCrop);
        const croppedFile = new File([blob], "profile-image.jpg", { type: "image/jpeg" });
        setFile(croppedFile);
        setPreviewUrl(URL.createObjectURL(croppedFile));
        setCropModalOpen(false);
      } catch (err) {
        setErrorMsg('Failed to crop image.');
      }
    }
  };

  const handleRemovePhoto = () => {
    setFile(null);
    setPreviewUrl('');
    setImgSrc('');
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.put(`/artists/${currentArtist.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data; // Returns updated artist
    },
    onSuccess: (data) => {
      // Update global store so Navbar reflects it instantly
      updateUser({
        name: data.name,
        username: data.username,
        profileImage: data.profileImage
      });
      queryClient.invalidateQueries(['admin-artists-list']);
      queryClient.invalidateQueries(['artists']);
      onClose();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', username);
    formData.append('bio', bio);
    formData.append('website', website);
    formData.append('location', location);
    formData.append('specialization', specialization);
    formData.append('experience', experience);

    const socialLinks = { instagram, behance };
    formData.append('socialLinks', JSON.stringify(socialLinks));

    if (file) {
      formData.append('profileImage', file);
    } else if (previewUrl === '') {
      // We removed the photo, we could tell the backend to clear it
      // By sending a special flag or empty string (requires backend support)
      formData.append('removeImage', 'true'); // If backend supports it
    }

    updateProfileMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !cropModalOpen && onClose()}
          className="absolute inset-0 bg-void/90 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          data-lenis-prevent
          className="relative w-full max-w-4xl h-[85vh] bg-zinc-950 border border-white/10 rounded-xl shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-white/5 bg-zinc-900/50">
            <h2 className="font-serif text-lg text-cream tracking-wide">Edit Profile</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-mist hover:text-cream transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="md:w-64 border-r border-white/5 bg-zinc-950/50 p-4 flex flex-col gap-2 overflow-y-auto">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`p-3 rounded-lg text-left font-sans text-xs tracking-wider uppercase transition-colors ${activeTab === 'profile' ? 'bg-white/10 text-cream font-bold' : 'text-mist/70 hover:bg-white/5'}`}
              >
                Edit Profile
              </button>
              <button 
                onClick={() => setActiveTab('verification')}
                className={`p-3 rounded-lg text-left font-sans text-xs tracking-wider uppercase transition-colors ${activeTab === 'verification' ? 'bg-white/10 text-cream font-bold' : 'text-mist/70 hover:bg-white/5'}`}
              >
                Verification
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
              
              {/* CROP MODAL OVERLAY */}
              <AnimatePresence>
                {cropModalOpen && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-zinc-950 z-20 flex flex-col p-6"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-xl text-cream tracking-wide">Crop Profile Photo</h3>
                      <button onClick={() => setCropModalOpen(false)} className="text-mist hover:text-cream">
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-auto flex items-center justify-center bg-black/50 rounded-lg border border-white/10 mb-6">
                      {imgSrc && (
                        <ReactCrop
                          crop={crop}
                          onChange={(_, percentCrop) => setCrop(percentCrop)}
                          onComplete={(c) => setCompletedCrop(c)}
                          aspect={1}
                          circularCrop
                        >
                          <img
                            ref={imgRef}
                            alt="Crop me"
                            src={imgSrc}
                            onLoad={onImageLoad}
                            className="max-h-[50vh] object-contain"
                          />
                        </ReactCrop>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-4">
                      <button 
                        type="button" 
                        onClick={() => setCropModalOpen(false)}
                        className="px-6 py-2.5 rounded-lg text-xs font-bold text-mist hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={handleSaveCrop}
                        className="px-6 py-2.5 rounded-lg text-xs font-bold bg-gold text-void hover:bg-ivory flex items-center gap-2"
                      >
                        <CropIcon size={14} />
                        Save Crop
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeTab === 'profile' && !cropModalOpen && (
                <form id="profile-form" onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-xl mx-auto">
                  
                  {errorMsg && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-lg">
                      {errorMsg}
                    </div>
                  )}

                  {/* Profile Picture Upload - Drag & Drop / Instagram Style */}
                  <div className="flex flex-col md:flex-row md:items-center gap-6 bg-zinc-900/30 p-6 rounded-xl border border-white/5">
                    
                    {/* DROPZONE */}
                    <div 
                      {...getRootProps()} 
                      className={`relative group w-28 h-28 rounded-full overflow-hidden border-2 border-dashed bg-zinc-950 flex-shrink-0 cursor-pointer transition-colors ${
                        isDragActive ? 'border-gold bg-gold/5' : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <input {...getInputProps()} />
                      
                      {previewUrl ? (
                        <img 
                          src={previewUrl.startsWith('blob:') ? previewUrl : resolveImageUrl(previewUrl)} 
                          alt="Avatar Preview" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-3xl text-mist/30">
                          {name?.charAt(0) || username?.charAt(0) || '?'}
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-void/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-cream">
                        <Camera size={20} className="mb-1 text-mist" />
                        <span className="text-[9px] uppercase tracking-wider font-semibold">
                          {isDragActive ? 'Drop!' : 'Change'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col flex-1">
                      <span className="font-serif text-lg text-cream">{username || name || 'Creator'}</span>
                      <div className="flex gap-4 mt-2 font-sans text-[11px] uppercase tracking-wider font-semibold">
                        <label className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors flex items-center gap-1">
                          <input {...getInputProps()} />
                          Upload Photo
                        </label>
                        {previewUrl && (
                          <button 
                            type="button" 
                            onClick={handleRemovePhoto}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-mist/50 mt-2 font-sans">
                        Drag and drop supported. Max size 5MB.
                      </span>
                    </div>
                  </div>

                  {/* Fields Grid */}
                  <div className="flex flex-col gap-6 font-sans">
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                      <label className="md:w-32 text-right text-mist text-sm font-semibold">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-cream text-sm outline-none focus:border-white/30 transition-colors"
                        placeholder="Full Name"
                      />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                      <label className="md:w-32 text-right text-mist text-sm font-semibold">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="flex-1 bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-cream text-sm outline-none focus:border-white/30 transition-colors"
                        placeholder="username"
                      />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                      <label className="md:w-32 text-right text-mist text-sm font-semibold mt-3">Bio</label>
                      <div className="flex-1">
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows="3"
                          className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-cream text-sm outline-none focus:border-white/30 transition-colors resize-none"
                          placeholder="Tell us about your art..."
                        />
                        <span className="text-[10px] text-mist/50 mt-1 block text-right">{bio.length}/150</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                      <label className="md:w-32 text-right text-mist text-sm font-semibold">Website</label>
                      <div className="flex-1 relative">
                        <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist/50" />
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-cream text-sm outline-none focus:border-white/30 transition-colors"
                          placeholder="https://yourportfolio.com"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                      <label className="md:w-32 text-right text-mist text-sm font-semibold">Location</label>
                      <div className="flex-1 relative">
                        <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-mist/50" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-zinc-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-cream text-sm outline-none focus:border-white/30 transition-colors"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                      <label className="md:w-32 text-right text-mist text-sm font-semibold">Profession/Title</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="flex-1 bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-cream text-sm outline-none focus:border-white/30 transition-colors"
                        placeholder="e.g. Traditional Artist"
                      />
                    </div>

                  </div>
                </form>
              )}

              {activeTab === 'verification' && !cropModalOpen && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h3 className="font-serif text-2xl text-cream">Request Verification</h3>
                  <p className="text-mist text-sm font-sans leading-relaxed">
                    Verified badges confirm that this is the authentic portfolio for this creator or gallery. Verification requests are currently handled manually by admins.
                  </p>
                  <button className="mt-4 px-6 py-3 bg-white/10 text-cream rounded-lg text-sm font-bold opacity-50 cursor-not-allowed">
                    Submit Request
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Footer Actions */}
          {activeTab === 'profile' && !cropModalOpen && (
            <div className="p-5 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg font-sans text-xs font-bold text-mist hover:text-cream hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={updateProfileMutation.isLoading}
                className="px-8 py-2.5 rounded-lg font-sans text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center gap-2"
              >
                {updateProfileMutation.isLoading ? 'Saving...' : 'Submit'}
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
