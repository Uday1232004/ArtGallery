import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Award, Mail, Sparkles, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import api, { resolveImageUrl } from '../lib/axios'

const FALLBACK_ARTISTS = [
  {
    id: 'uday-chandra',
    name: 'Uday Chandra',
    specialization: 'Pencil Portraits & Devotional Art',
    experience: 'Self-Taught Master',
    bio: 'An engineering student by day and a self-taught artist by night. Captivated by cinematic storytelling, emotional depth, and rich textures. Specializes in realistic graphite/charcoal portraits, fine-line pen work, and highly detailed devotional representations of Krishna. For Uday, every sketch is not just an illustration, but a story breathing on paper, shaped by the interplay of light and absolute shadows.',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    socialLinks: {
      instagram: 'https://instagram.com/uday.art',
      behance: 'https://behance.net/uday',
    },
    specialties: [
      'Pencil Realistic Portraits',
      'Intricate Pen Art',
      'Devotional Krishna Artworks',
      'Charcoal Emotional Sketches',
      'Cinematic Landscapes & Paintings',
    ]
  }
]

export default function Artists() {
  const { data: serverArtists, isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const res = await api.get('/artists')
      return res.data
    },
    retry: false,
  })

  const artists = serverArtists && serverArtists.length > 0 ? serverArtists : FALLBACK_ARTISTS

  return (
    <div className="relative min-h-screen bg-void pt-32 pb-24 overflow-hidden pencil-texture">
      <div className="grid-lines absolute inset-0 opacity-20 pointer-events-none" />

      {/* Decorative Light Leak */}
      <div className="absolute top-1/4 right-0 w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(212,163,89,0.03)_0%,transparent_70%)] blur-[80px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-8 md:px-16 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="mb-20 text-center md:text-left"
        >
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <span className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase">Behind The Canvas</span>
            <div className="h-px w-16 bg-gradient-to-r from-gold/50 to-transparent" />
          </div>
          <h1 className="font-serif font-light text-cream text-5xl md:text-7xl leading-tight">
            The Visionaries
          </h1>
          <p className="mt-6 font-sans text-sm md:text-base text-mist max-w-xl leading-relaxed">
            Meet the creative souls bridging the analytical structure of science with the messy, infinite beauty of fine art.
          </p>
        </motion.div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 gap-24">
          {artists.map((artist, idx) => (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: idx * 0.15, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center border-b border-white/5 pb-20 last:border-0"
            >
              {/* Profile Image */}
              <div className="lg:col-span-5 relative group overflow-hidden rounded-sm aspect-[4/5] bg-carbon border border-white/5 shadow-2xl">
                <img 
                  src={resolveImageUrl(artist.profileImage) || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80'} 
                  alt={artist.name} 
                  className="w-full h-full object-cover img-exhibition-hover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent opacity-60 pointer-events-none" />
                <div className="absolute bottom-6 left-6 font-sans text-[10px] tracking-[0.3em] text-gold/80 uppercase">
                  {artist.experience || 'Resident Artist'}
                </div>
              </div>

              {/* Bio & Details */}
              <div className="lg:col-span-7 flex flex-col justify-center">
                <h2 className="font-serif text-4xl md:text-5xl font-light text-cream mb-2">
                  {artist.name}
                </h2>
                <div className="font-sans text-xs tracking-[0.2em] text-gold uppercase mb-8 flex items-center gap-2">
                  <Sparkles size={12} className="text-gold" />
                  {artist.specialization}
                </div>

                <p className="font-sans text-base md:text-lg text-ivory/70 leading-relaxed mb-8">
                  {artist.bio}
                </p>

                {/* Specialties / Art Pillars */}
                <div className="mb-10">
                  <h3 className="font-serif text-lg text-cream mb-4 flex items-center gap-2">
                    <BookOpen size={16} className="text-gold/80" />
                    Creative Pillars
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(artist.specialties || ['Realistic Sketching', 'Krishna Art', 'Fine Pen Art']).map((specialty, sIdx) => (
                      <span 
                        key={sIdx}
                        className="font-sans text-[10px] tracking-widest text-mist bg-white/5 border border-white/5 px-4 py-2 uppercase rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connect */}
                <div className="flex items-center gap-4 mt-4">
                  <Link 
                    to="/commissions/request"
                    className="font-sans text-xs tracking-widest text-void bg-ivory hover:bg-gold hover:text-void px-6 py-3 uppercase transition-all duration-400 flex items-center gap-2"
                  >
                    <Mail size={12} />
                    Commission Sketch
                  </Link>
                  <Link 
                    to={`/artists/${artist.id}`}
                    className="font-sans text-xs tracking-widest text-cream bg-white/5 border border-white/10 hover:border-gold hover:text-gold px-6 py-3 uppercase transition-all duration-400"
                  >
                    View Artist Space
                  </Link>
                  {artist.socialLinks?.instagram && (
                    <a 
                      href={artist.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-xs tracking-[0.2em] text-mist hover:text-gold uppercase transition-colors"
                    >
                      Instagram
                    </a>
                  )}
                  {artist.socialLinks?.behance && (
                    <a 
                      href={artist.socialLinks.behance}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sans text-xs tracking-[0.2em] text-mist hover:text-gold uppercase transition-colors"
                    >
                      Behance
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
