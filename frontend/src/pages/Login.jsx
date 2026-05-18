import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { gsap } from '../animations/gsap';
import { Shield, Sparkles, User, Key, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [portalMode, setPortalMode] = useState(null); // 'user', 'admin', or null (selection)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();
  const gatewayRef = useRef(null);
  const formCardRef = useRef(null);

  // Transition to portal form
  const selectPortal = (mode) => {
    setError('');
    setEmail('');
    setPassword('');
    
    // Animate out selection gateway, then show form
    gsap.to(gatewayRef.current, {
      opacity: 0,
      y: -20,
      filter: 'blur(10px)',
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        setPortalMode(mode);
        // Animate in the form card
        setTimeout(() => {
          gsap.fromTo(formCardRef.current,
            { opacity: 0, y: 30, filter: 'blur(10px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out' }
          );
        }, 50);
      }
    });
  };

  // Back to selection gateway
  const resetSelection = () => {
    gsap.to(formCardRef.current, {
      opacity: 0,
      y: 20,
      filter: 'blur(10px)',
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        setPortalMode(null);
        setTimeout(() => {
          gsap.fromTo(gatewayRef.current,
            { opacity: 0, y: -30, filter: 'blur(10px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out' }
          );
        }, 50);
      }
    });
  };

  // Handle submit based on chosen portal mode
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { role, token } = response.data;
      
      if (portalMode === 'admin') {
        // Enforce admin portal restrictions
        if (role === 'SUPER_ADMIN' || role === 'MANAGER') {
          login(response.data, token);
          navigate('/admin');
        } else {
          setError('Access Denied: Standard collector accounts are not authorized to access the Curator Portal.');
        }
      } else {
        // User portal redirects strictly to profile / gallery
        login(response.data, token);
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-void relative overflow-hidden pencil-texture px-4 pt-20">
      {/* Minimal Header Nav */}
      <div className="absolute top-0 left-0 w-full p-8 flex items-center justify-between z-50">
        <a href="/" className="font-serif text-lg tracking-[0.3em] text-ivory uppercase font-light hover:text-gold transition-colors">
          ArtBro Sketches
        </a>
        <a href="/" className="font-sans text-[10px] tracking-[0.2em] text-mist hover:text-ivory transition-colors uppercase">
          Return to Gallery →
        </a>
      </div>

      {/* Ambient background light glows */}
      <div className="absolute top-1/3 left-1/4 w-[60vw] h-[60vw] md:w-[35vw] md:h-[35vw] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[60vw] h-[60vw] md:w-[35vw] md:h-[35vw] bg-white/5 rounded-full blur-[140px] pointer-events-none" />

      {/* PORTAL MODE 1: Selection Gateway */}
      {!portalMode && (
        <div ref={gatewayRef} className="w-full max-w-4xl relative z-10 flex flex-col items-center py-12">
          <div className="text-center mb-16">
            <span className="font-sans text-[10px] tracking-[0.4em] text-gold uppercase mb-3 block">Gateways</span>
            <h1 className="font-serif text-cream tracking-wide leading-tight mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
              Select Your Access Portal
            </h1>
            <p className="font-sans text-xs text-mist/60 max-w-md mx-auto leading-relaxed">
              Enter either as a passionate collector to acquire drawings, or as an authorized curator to publish new artwork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
            {/* Card A: Collector Portal */}
            <div 
              onClick={() => selectPortal('user')}
              data-cursor-hover
              className="group cursor-pointer bg-carbon/25 hover:bg-carbon/40 backdrop-blur-xl border border-white/5 hover:border-white/20 p-8 flex flex-col justify-between items-center text-center transition-all duration-500 rounded-sm shadow-2xl relative overflow-hidden aspect-[4/3] md:aspect-square"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-white/20 group-hover:bg-ivory transition-colors duration-500" />
              <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-void/50 text-mist group-hover:text-ivory group-hover:border-ivory/30 transition-all duration-500 mb-6 scale-95 group-hover:scale-105">
                <User size={24} className="stroke-[1.5]" />
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-serif text-2xl text-cream group-hover:text-ivory tracking-wide mb-3 transition-colors">Art Lover</h3>
                <p className="font-sans text-[11px] text-mist/60 leading-relaxed group-hover:text-mist/80 transition-colors max-w-[240px]">
                  Browse live sketches, build your catalog collection, manage orders, and request commissions.
                </p>
              </div>

              <button className="mt-8 font-sans text-[10px] tracking-[0.25em] text-ivory uppercase border border-white/10 group-hover:border-ivory group-hover:bg-ivory group-hover:text-void py-3 px-8 transition-all duration-500 font-semibold">
                Access Collector Portal
              </button>
            </div>

            {/* Card B: Curator Portal */}
            <div 
              onClick={() => selectPortal('admin')}
              data-cursor-hover
              className="group cursor-pointer bg-carbon/25 hover:bg-carbon/40 backdrop-blur-xl border border-white/5 hover:border-gold/30 p-8 flex flex-col justify-between items-center text-center transition-all duration-500 rounded-sm shadow-2xl relative overflow-hidden aspect-[4/3] md:aspect-square"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-white/20 group-hover:bg-gold transition-colors duration-500" />
              <div className="absolute inset-0 bg-gold/[0.01] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-void/50 text-mist group-hover:text-gold group-hover:border-gold/30 transition-all duration-500 mb-6 scale-95 group-hover:scale-105">
                <Key size={24} className="stroke-[1.5]" />
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-serif text-2xl text-cream group-hover:text-gold tracking-wide mb-3 transition-colors">Art Curator</h3>
                <p className="font-sans text-[11px] text-mist/60 leading-relaxed group-hover:text-mist/80 transition-colors max-w-[240px]">
                  Upload new hand-drawings, set prices, publish sections, track orders, and oversee artists.
                </p>
              </div>

              <button className="mt-8 font-sans text-[10px] tracking-[0.25em] text-gold uppercase border border-white/10 group-hover:border-gold group-hover:bg-gold group-hover:text-void py-3 px-8 transition-all duration-500 font-semibold">
                Access Curator Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PORTAL MODE 2: Active Login Form */}
      {portalMode && (
        <div ref={formCardRef} className="w-full max-w-md relative z-10">
          <div className={`bg-carbon/45 backdrop-blur-xl border p-10 md:p-12 shadow-2xl relative ${
            portalMode === 'admin' ? 'border-gold/20' : 'border-white/10'
          }`}>
            {/* Top portal header strip */}
            <div className={`absolute top-0 left-0 w-full h-[3px] ${
              portalMode === 'admin' ? 'bg-gold' : 'bg-ivory'
            }`} />

            {/* Back action */}
            <button 
              onClick={resetSelection}
              data-cursor-hover
              className="inline-flex items-center gap-2 font-sans text-[9px] tracking-widest text-mist/50 hover:text-mist uppercase mb-8 transition-colors"
            >
              <ArrowLeft size={10} /> Back to portals
            </button>

            <div className="flex flex-col items-center mb-8">
              <h2 className="font-serif text-3xl text-cream tracking-wide mb-2 text-center">ArtBro Sketches</h2>
              <div className="flex items-center gap-2">
                {portalMode === 'admin' ? (
                  <>
                    <Shield size={12} className="text-gold" />
                    <span className="font-sans text-[9px] tracking-[0.35em] text-gold uppercase">Curator Access</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={12} className="text-mist" />
                    <span className="font-sans text-[9px] tracking-[0.35em] text-mist uppercase">Collector Access</span>
                  </>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3.5 text-center font-sans">
                  {error}
                </div>
              )}
              
              <div className="group">
                <label className="block font-sans text-[9px] tracking-[0.25em] text-mist uppercase mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full bg-void/50 border px-4 py-3 font-sans text-sm text-ivory focus:outline-none transition-colors duration-400 ${
                    portalMode === 'admin' ? 'border-white/10 focus:border-gold' : 'border-white/10 focus:border-white/30'
                  }`}
                  placeholder={portalMode === 'admin' ? 'admin@example.com' : 'you@example.com'}
                />
              </div>

              <div className="group">
                <label className="block font-sans text-[9px] tracking-[0.25em] text-mist uppercase mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full bg-void/50 border px-4 py-3 font-sans text-sm text-ivory focus:outline-none transition-colors duration-400 ${
                    portalMode === 'admin' ? 'border-white/10 focus:border-gold' : 'border-white/10 focus:border-white/30'
                  }`}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                data-cursor-hover
                className={`mt-4 font-sans text-[10px] tracking-[0.3em] uppercase py-4 transition-all duration-400 flex justify-center items-center h-[50px] font-semibold ${
                  portalMode === 'admin' 
                    ? 'bg-gold text-void hover:bg-cream hover:text-void' 
                    : 'bg-ivory text-void hover:bg-gold hover:text-void'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                ) : (
                  portalMode === 'admin' ? 'Curator Login' : 'Collector Login'
                )}
              </button>
            </form>
            
            <div className="mt-8 flex flex-col items-center gap-4">
              {portalMode === 'user' && (
                <a href="/signup" data-cursor-hover className="font-sans text-[9px] tracking-[0.2em] text-mist hover:text-ivory transition-colors uppercase">
                  New to the gallery? Create an account
                </a>
              )}
              <a href="/" data-cursor-hover className="font-sans text-[9px] tracking-[0.2em] text-mist/50 hover:text-mist transition-colors uppercase">
                ← Exit to public gallery
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
