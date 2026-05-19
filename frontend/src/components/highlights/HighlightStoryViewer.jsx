import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImageUrl } from '../../lib/axios';

export default function HighlightStoryViewer({ isOpen, onClose, highlight, allArtworks }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get the actual artworks that belong to this highlight
  const storyArtworks = highlight?.items
    ?.map(item => allArtworks?.find(a => a.id === item.artworkId))
    ?.filter(Boolean) || [];

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen, highlight]);

  // Handle auto-advance
  useEffect(() => {
    if (!isOpen || storyArtworks.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < storyArtworks.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onClose();
      }
    }, 5000); // 5 seconds per slide like IG

    return () => clearTimeout(timer);
  }, [isOpen, currentIndex, storyArtworks.length, onClose]);

  if (!isOpen || !highlight) return null;

  const currentArtwork = storyArtworks[currentIndex];

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < storyArtworks.length - 1) setCurrentIndex(prev => prev + 1);
    else onClose();
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black">
        
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-50 flex gap-1.5">
          {storyArtworks.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/20 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-white"
                initial={{ width: i < currentIndex ? '100%' : '0%' }}
                animate={{ width: i === currentIndex ? '100%' : i < currentIndex ? '100%' : '0%' }}
                transition={{ duration: i === currentIndex ? 5 : 0, ease: 'linear' }}
              />
            </div>
          ))}
        </div>

        {/* Header Info */}
        <div className="absolute top-8 left-4 right-4 z-50 flex justify-between items-center px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
              <img 
                src={resolveImageUrl(highlight.coverImage)} 
                alt="Highlight Cover" 
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="text-white font-sans text-sm font-semibold tracking-wide drop-shadow-md">
              {highlight.title}
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white drop-shadow-md">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Overlays (Left/Right invisible click zones) */}
        <div 
          className="absolute inset-y-0 left-0 w-1/3 z-40 cursor-pointer" 
          onClick={handlePrev}
        />
        <div 
          className="absolute inset-y-0 right-0 w-2/3 z-40 cursor-pointer" 
          onClick={handleNext}
        />

        {/* Main Content Area */}
        {storyArtworks.length > 0 ? (
          <div className="w-full h-full md:w-auto md:max-w-[400px] md:h-[90vh] md:rounded-xl overflow-hidden relative mx-auto my-auto shadow-2xl flex flex-col justify-center items-center bg-zinc-950">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col items-center justify-center relative"
              >
                <img
                  src={resolveImageUrl(currentArtwork.image)}
                  alt={currentArtwork.title}
                  className="w-full h-full object-contain"
                />
                
                {/* Artwork Title overlay at bottom */}
                <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center text-center p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="font-serif text-2xl text-gold mb-1">{currentArtwork.title}</h3>
                  <p className="font-sans text-xs tracking-[0.2em] uppercase text-mist/80">
                    {currentArtwork.category}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-mist font-sans text-sm">
            No artworks added to this highlight yet.
          </div>
        )}

      </div>
    </AnimatePresence>
  );
}
