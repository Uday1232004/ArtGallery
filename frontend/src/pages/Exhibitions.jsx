import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Sparkles, ArrowUpRight } from 'lucide-react'
import api, { resolveImageUrl } from '../lib/axios'

export default function Exhibitions() {
  const { data: serverExhibitions, isLoading } = useQuery({
    queryKey: ['exhibitions'],
    queryFn: async () => {
      const res = await api.get('/exhibitions')
      return res.data
    },
    retry: false,
  })

  const exhibitions = serverExhibitions || []

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="relative min-h-screen bg-void pt-32 pb-24 overflow-hidden pencil-texture">
      <div className="grid-lines absolute inset-0 opacity-20 pointer-events-none" />

      {/* Cinematic Blur */}
      <div className="absolute top-1/3 left-0 w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(212,163,89,0.02)_0%,transparent_60%)] blur-[100px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-8 md:px-16 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="mb-24 text-center md:text-left"
        >
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            <span className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase">Immersive Events</span>
            <div className="h-px w-16 bg-gradient-to-r from-gold/50 to-transparent" />
          </div>
          <h1 className="font-serif font-light text-cream text-5xl md:text-7xl leading-tight">
            Exhibitions
          </h1>
          <p className="mt-6 font-sans text-sm md:text-base text-mist max-w-xl leading-relaxed">
            Walk through curated digital spaces, physical pop-ups, and interactive galleries mapping specific creative eras.
          </p>
        </motion.div>

        {/* Exhibitions Timeline */}
        {isLoading && (
          <div className="flex flex-col gap-32">
            {Array.from({length: 2}).map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                <div className="animate-pulse bg-white/5 rounded-sm aspect-[16/10]" />
                <div className="flex flex-col gap-4 py-4">
                  <div className="animate-pulse bg-white/5 h-4 w-1/3 rounded-sm" />
                  <div className="animate-pulse bg-white/5 h-10 w-2/3 rounded-sm" />
                  <div className="animate-pulse bg-white/5 h-20 w-full rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && exhibitions.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-6 text-center border border-white/5 rounded-sm">
            <div className="w-16 h-px bg-gold/30 mx-auto" />
            <p className="font-serif text-3xl text-mist/60 font-light">No exhibitions yet.</p>
            <p className="font-sans text-xs tracking-[0.2em] text-mist/40 uppercase max-w-xs leading-relaxed">
              Curated exhibitions will appear here when created by the gallery team.
            </p>
            <Link to="/gallery" className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase border border-gold/30 px-6 py-3 hover:bg-gold hover:text-void transition-all duration-400 mt-4">
              Explore Gallery
            </Link>
          </div>
        )}

        {!isLoading && exhibitions.length > 0 && (
        <div className="flex flex-col gap-32 relative before:absolute before:left-0 before:md:left-1/2 before:top-4 before:bottom-4 before:w-px before:bg-white/5">
          {exhibitions.map((ex, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start relative`}
              >
                {/* Timeline node */}
                <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-gold border border-void rounded-full shadow-[0_0_8px_rgba(212,163,89,0.8)] z-10 top-2 hidden md:block" />

                {/* Left (Image or Content depending on symmetry) */}
                <div className={`order-2 ${isEven ? 'md:order-1' : 'md:order-2 md:pl-10'}`}>
                  {isEven ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-carbon border border-white/5 shadow-xl group">
                      <img 
                        src={resolveImageUrl(ex.bannerImage)} 
                        alt={ex.name} 
                        className="w-full h-full object-cover img-exhibition-hover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="font-sans text-[10px] tracking-[0.25em] text-gold uppercase mb-3 flex items-center gap-1.5">
                        <Sparkles size={10} />
                        {ex.theme}
                      </div>
                      <h2 className="font-serif text-3xl md:text-4xl font-light text-cream mb-4">
                        {ex.name}
                      </h2>
                      <p className="font-sans text-sm md:text-base text-ivory/60 leading-relaxed mb-6">
                        {ex.description}
                      </p>
                      
                      <div className="flex flex-col gap-3 font-sans text-xs text-mist/80 mb-6">
                        <div className="flex items-center gap-3">
                          <Calendar size={14} className="text-gold/80" />
                          <span>{formatDate(ex.startDate)} — {formatDate(ex.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={14} className="text-gold/80" />
                          <span>{ex.location || 'Online Showcase'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right */}
                <div className={`order-1 ${isEven ? 'md:order-2 md:pl-10' : 'md:order-1'}`}>
                  {!isEven ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-carbon border border-white/5 shadow-xl group">
                      <img 
                        src={resolveImageUrl(ex.bannerImage)} 
                        alt={ex.name} 
                        className="w-full h-full object-cover img-exhibition-hover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="font-sans text-[10px] tracking-[0.25em] text-gold uppercase mb-3 flex items-center gap-1.5">
                        <Sparkles size={10} />
                        {ex.theme}
                      </div>
                      <h2 className="font-serif text-3xl md:text-4xl font-light text-cream mb-4">
                        {ex.name}
                      </h2>
                      <p className="font-sans text-sm md:text-base text-ivory/60 leading-relaxed mb-6">
                        {ex.description}
                      </p>
                      
                      <div className="flex flex-col gap-3 font-sans text-xs text-mist/80 mb-6">
                        <div className="flex items-center gap-3">
                          <Calendar size={14} className="text-gold/80" />
                          <span>{formatDate(ex.startDate)} — {formatDate(ex.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={14} className="text-gold/80" />
                          <span>{ex.location || 'Online Showcase'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
        )}
      </div>
    </div>
  )
}
