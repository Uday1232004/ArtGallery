import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { gsap } from '../animations/gsap';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const formRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(formRef.current, 
      { opacity: 0, y: 30, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = { name, email, password, role };
      const response = await api.post('/auth/register', payload);
      login(response.data, response.data.token);
      navigate(role === 'ARTIST' ? '/admin' : '/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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

      {/* Ambient background light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />

      <div ref={formRef} className="w-full max-w-md relative z-10 px-8 py-10">
        <div className="bg-carbon/40 backdrop-blur-xl border border-white/10 p-10 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <h1 className="font-serif text-3xl text-cream tracking-wide mb-2 text-center">ArtBro Sketches</h1>
            <p className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase">Create Account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 text-center">
                {error}
              </div>
            )}
            
            {/* Role toggle */}
            <div className="flex border border-white/10 p-1 bg-void/50 rounded-sm">
              <button
                type="button"
                onClick={() => setRole('USER')}
                className={`flex-1 py-2 text-center font-sans text-[10px] tracking-widest uppercase transition-all duration-300 ${
                  role === 'USER' ? 'bg-ivory text-void font-semibold' : 'text-mist hover:text-ivory'
                }`}
              >
                Join as Collector
              </button>
              <button
                type="button"
                onClick={() => setRole('ARTIST')}
                className={`flex-1 py-2 text-center font-sans text-[10px] tracking-widest uppercase transition-all duration-300 ${
                  role === 'ARTIST' ? 'bg-gold text-void font-semibold' : 'text-mist hover:text-ivory'
                }`}
              >
                Join as Artist
              </button>
            </div>

            {role === 'ARTIST' && (
              <p className="font-sans text-[10px] text-gold/70 text-center leading-relaxed">
                You'll get your own artist profile to post artworks and manage your portfolio.
              </p>
            )}
            
            <div className="group">
              <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                placeholder="Your name"
              />
            </div>

            <div className="group">
              <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                placeholder="you@example.com"
              />
            </div>

            <div className="group">
              <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              data-cursor-hover
              className={`mt-4 font-sans text-xs tracking-[0.3em] text-void uppercase px-10 py-4 transition-all duration-400 flex justify-center items-center h-[50px] ${
                role === 'ARTIST' ? 'bg-gold hover:bg-cream' : 'bg-ivory hover:bg-gold'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
              ) : (
                role === 'ARTIST' ? 'Create Artist Account' : 'Create Account'
              )}
            </button>
          </form>
          
          <div className="mt-8 flex flex-col items-center gap-4">
            <a href="/login" data-cursor-hover className="font-sans text-[10px] tracking-[0.2em] text-mist hover:text-ivory transition-colors uppercase">
              Already have an account? Sign in
            </a>
            <a href="/" data-cursor-hover className="font-sans text-[10px] tracking-[0.2em] text-mist/50 hover:text-mist transition-colors uppercase">
              ← Return to public gallery
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
