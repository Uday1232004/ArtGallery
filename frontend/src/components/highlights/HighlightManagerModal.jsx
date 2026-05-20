import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import api, { resolveImageUrl } from '../../lib/axios';

export default function HighlightManagerModal({ isOpen, onClose, currentArtist, existingHighlights = [], editHighlight = null }) {
  const queryClient = useQueryClient();
  
  // States
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editHighlight) {
        setTitle(editHighlight.title || '');
        setPreviewUrl(editHighlight.coverImage || '');
      } else {
        setTitle('');
        setPreviewUrl('');
      }
      setFile(null);
      setErrorMsg('');
      setIsDeleting(false);
    }
  }, [isOpen, editHighlight]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const createHighlightMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/highlights', formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-artists-list']);
      queryClient.invalidateQueries(['artists']);
      onClose();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create highlight.');
    }
  });

  const updateHighlightMutation = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.put(`/highlights/${editHighlight.id}`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-artists-list']);
      queryClient.invalidateQueries(['artists']);
      onClose();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update highlight.');
    }
  });

  const deleteHighlightMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/highlights/${editHighlight.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-artists-list']);
      queryClient.invalidateQueries(['artists']);
      onClose();
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to delete highlight.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Highlight name is required.');
      return;
    }
    if (!currentArtist?.id) {
      setErrorMsg('Artist context is missing.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);

    if (file) {
      formData.append('coverImage', file);
    }

    if (editHighlight) {
      updateHighlightMutation.mutate(formData);
    } else {
      formData.append('artistId', currentArtist.id);
      formData.append('order', existingHighlights.length);
      createHighlightMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this highlight?")) {
      setIsDeleting(true);
      deleteHighlightMutation.mutate();
    }
  };

  if (!isOpen) return null;

  const isPending = createHighlightMutation.isPending || updateHighlightMutation.isPending || isDeleting;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-void/90 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-white/5">
            <h2 className="font-serif text-base text-cream text-center flex-1">
              {editHighlight ? 'Edit Highlight' : 'New Highlight'}
            </h2>
            <button onClick={onClose} className="p-1 rounded-full text-mist hover:text-cream transition-colors absolute right-4">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 font-sans">
            <form id="highlight-form" onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
              
              {errorMsg && (
                <div className="w-full p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-lg text-center">
                  {errorMsg}
                </div>
              )}

              {/* Circular Cover Upload */}
              <div className="relative group w-20 h-20 rounded-full overflow-hidden border border-white/20 bg-zinc-900 cursor-pointer flex items-center justify-center">
                {previewUrl ? (
                  <img 
                    src={resolveImageUrl(previewUrl)} 
                    alt="Cover Preview" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <ImageIcon size={24} className="text-mist/40" />
                )}
                
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-cream">
                  <Camera size={18} />
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Title Input */}
              <div className="w-full">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-cream text-sm outline-none focus:border-white/30 transition-colors text-center"
                  placeholder="Highlight Name"
                  maxLength={15}
                />
              </div>

              {editHighlight && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-red-400 text-xs hover:text-red-300 transition-colors mt-2"
                >
                  Delete Highlight
                </button>
              )}

            </form>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 bg-zinc-900/30 flex justify-end gap-3">
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full py-3 rounded-lg font-sans text-sm font-bold bg-cream text-void hover:bg-gold transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? 'Saving...' : (editHighlight ? 'Save Changes' : 'Add')}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
