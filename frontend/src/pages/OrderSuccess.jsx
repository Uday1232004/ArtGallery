import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../sections/Footer';
import { CheckCircle } from 'lucide-react';
import { gsap } from '../animations/gsap';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!orderId) {
      navigate('/gallery');
      return;
    }

    gsap.fromTo('.success-reveal',
      { opacity: 0, scale: 0.95, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out', delay: 0.2 }
    );
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div className="bg-obsidian min-h-screen flex flex-col pencil-texture">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center pt-32 pb-24 px-8">
        <div className="max-w-2xl w-full text-center">
          
          <div className="flex justify-center mb-8 success-reveal">
            <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle size={48} className="text-green-400" />
            </div>
          </div>
          
          <h1 className="font-serif font-light text-cream text-5xl md:text-6xl mb-6 success-reveal leading-tight">
            Acquisition Confirmed
          </h1>
          
          <p className="font-sans text-sm text-ivory/70 leading-relaxed mb-12 success-reveal max-w-lg mx-auto">
            Thank you for your patronage. Your order has been successfully processed. The artist's studio will contact you shortly regarding the white-glove shipping timeline.
          </p>

          <div className="bg-void/50 border border-white/10 p-8 mb-12 success-reveal inline-block w-full max-w-md">
            <p className="font-sans text-[10px] tracking-[0.3em] text-mist uppercase mb-2">Order Reference Number</p>
            <p className="font-serif text-2xl text-gold tracking-wider">{orderId.toUpperCase().substring(0, 8)}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 success-reveal">
            <Link 
              to="/profile" 
              className="w-full sm:w-auto bg-ivory text-void hover:bg-gold hover:text-void font-sans text-xs tracking-[0.2em] uppercase px-12 py-5 transition-colors font-semibold"
            >
              View Order Details
            </Link>
            <Link 
              to="/gallery" 
              className="w-full sm:w-auto border border-white/10 hover:border-gold text-mist hover:text-gold font-sans text-xs tracking-[0.2em] uppercase px-12 py-5 transition-colors"
            >
              Continue Exploring
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
