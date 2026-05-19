import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { gsap } from '../../animations/gsap';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, logout } = useAuthStore();
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
      const response = await api.post('/auth/login', { email, password });
      const { role, token } = response.data;
      
      if (role === 'SUPER_ADMIN' || role === 'MANAGER' || role === 'ARTIST') {
        login(response.data, token);
        navigate('/admin');
      } else {
        setError('Access Denied: This portal is reserved for administrators and artists.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-void relative overflow-hidden pencil-texture">
      {/* Ambient gold spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-gold/15 rounded-full blur-[140px] pointer-events-none" />

      <div ref={formRef} className="w-full max-w-md relative z-10 px-8">
        <div className="bg-carbon/40 backdrop-blur-xl border border-gold/20 p-10 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <h1 className="font-serif text-3xl text-cream tracking-wide mb-2 text-center">ArtBro Sketches</h1>
            <p className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase">Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 text-center font-sans">
                {error}
              </div>
            )}
            
            <div className="group">
              <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                placeholder="admin@example.com"
              />
            </div>

            <div className="group">
              <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              data-cursor-hover
              className="mt-4 font-sans text-xs tracking-[0.3em] text-void uppercase bg-gold px-10 py-4 hover:bg-cream hover:text-void transition-all duration-400 flex justify-center items-center h-[50px] font-semibold"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full animate-spin" />
              ) : (
                'Access Dashboard'
              )}
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="h-[1px] bg-white/10 flex-1" />
              <span className="font-sans text-[8px] tracking-[0.2em] text-mist/40 uppercase">Or Continue With</span>
              <div className="h-[1px] bg-white/10 flex-1" />
            </div>

            <GoogleLoginButton portalMode="admin" />
          </form>
          
          <div className="mt-8 flex flex-col items-center gap-4">
            <a href="/" data-cursor-hover className="font-sans text-[10px] tracking-[0.2em] text-mist/50 hover:text-mist transition-colors uppercase">
              ← Return to public gallery
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
