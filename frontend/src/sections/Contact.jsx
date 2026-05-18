import { useEffect, useRef, useState } from 'react'
import { gsap } from '../animations/gsap'
import api from '../lib/axios'

export default function Contact() {
  const sectionRef = useRef(null)
  const [formData, setFormData] = useState({ clientName: '', email: '', artworkType: 'Realistic Portrait', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.fromTo(section.querySelectorAll('.contact-reveal'),
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, stagger: 0.15, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: section, start: 'top 80%' },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/commissions', formData);
      setSuccess(true);
      setFormData({ clientName: '', email: '', artworkType: 'Realistic Portrait', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="relative bg-transparent py-32 md:py-48 overflow-hidden pencil-texture">
      {/* Heavy grain overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-10">
        <div className="w-full h-full grain-animation bg-noise" />
      </div>

      <div className="max-w-[1200px] mx-auto px-8 md:px-16 relative z-20">
        {/* Label */}
        <div className="flex items-center gap-4 mb-20 contact-reveal" style={{ opacity: 0 }}>
          <span className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase">Commissions</span>
          <div className="h-px w-16 bg-white/10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left Text */}
          <div className="contact-reveal" style={{ opacity: 0 }}>
            <h2 className="font-serif font-light text-cream leading-[1.1] mb-8"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
              Let's Create<br />Something Timeless.
            </h2>
            <p className="font-sans text-sm md:text-base text-ivory/60 leading-relaxed mb-12 max-w-md">
              Whether it's a realistic pencil portrait of a loved one or a bespoke spiritual artwork, I take on a limited number of commissions each month to ensure every piece receives the time and emotion it deserves.
            </p>

            <div className="space-y-6">
              <div>
                <p className="font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-1">Direct Email</p>
                <a href="mailto:art@udaychandra.com" data-cursor-hover className="font-serif text-2xl text-ivory hover:text-gold transition-colors duration-400">
                  art@udaychandra.com
                </a>
              </div>
              <div>
                <p className="font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-1">Studio Location</p>
                <p className="font-serif text-2xl text-ivory">India</p>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="contact-reveal" style={{ opacity: 0 }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              {success && <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-sm">Request sent successfully. I will get back to you soon.</div>}
              {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

              <div className="group">
                <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                  className="w-full bg-transparent border-b border-white/10 py-3 font-serif text-xl text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                  placeholder="Your Name"
                />
              </div>
              <div className="group">
                <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-transparent border-b border-white/10 py-3 font-serif text-xl text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                  placeholder="hello@example.com"
                />
              </div>
              <div className="group">
                <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Project Vision</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-transparent border-b border-white/10 py-3 font-serif text-xl text-ivory focus:outline-none focus:border-gold transition-colors duration-400 resize-none"
                  placeholder="Tell me about the portrait or artwork you have in mind..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                data-cursor-hover
                className="self-start mt-4 font-sans text-xs tracking-[0.3em] text-void uppercase bg-ivory px-10 py-4 hover:bg-gold hover:text-void transition-all duration-400"
              >
                {loading ? 'Sending...' : 'Request Commission'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
