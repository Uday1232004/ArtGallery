import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import Navbar from '../components/Navbar';
import Footer from '../sections/Footer';
import { ShieldCheck, Truck, Lock } from 'lucide-react';
import { gsap } from '../animations/gsap';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, count, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (count === 0) {
      navigate('/gallery');
      return;
    }

    gsap.fromTo('.checkout-reveal',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }
    );
  }, [isAuthenticated, count, navigate]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    const fullAddress = `${shippingAddress}, ${city}, ${country} - ${postalCode}`;

    try {
      // Simulate real payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await api.post('/orders', {
        shippingAddress: fullAddress,
        // Mock payment ID for academic purposes
        paymentId: 'MOCK_PAYMENT_' + Math.random().toString(36).substr(2, 9).toUpperCase()
      });

      await clearCart();
      navigate('/order-success', { state: { orderId: res.data.id } });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process order.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-obsidian min-h-screen pencil-texture">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16">
          
          <h1 className="font-serif font-light text-cream text-4xl mb-12 checkout-reveal">Secure Checkout</h1>

          <div className="flex flex-col-reverse lg:flex-row gap-16 lg:gap-24">
            
            {/* Left: Form */}
            <div className="flex-1 checkout-reveal">
              <form onSubmit={handleCheckout} className="space-y-8">
                
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans">
                    {error}
                  </div>
                )}

                <div>
                  <h3 className="font-sans text-xs tracking-[0.2em] text-gold uppercase mb-6 border-b border-white/5 pb-4">Contact Information</h3>
                  <div className="mb-4">
                    <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Email</label>
                    <input type="email" disabled value={user?.email || ''} className="w-full bg-void/30 border border-white/10 px-4 py-3 font-sans text-sm text-mist cursor-not-allowed" />
                  </div>
                </div>

                <div>
                  <h3 className="font-sans text-xs tracking-[0.2em] text-gold uppercase mb-6 border-b border-white/5 pb-4">Shipping Address</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Address</label>
                      <input 
                        type="text" required value={shippingAddress} onChange={e => setShippingAddress(e.target.value)}
                        className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors" 
                        placeholder="Street Address"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">City</label>
                        <input 
                          type="text" required value={city} onChange={e => setCity(e.target.value)}
                          className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Postal Code</label>
                        <input 
                          type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)}
                          className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Country</label>
                      <input 
                        type="text" required value={country} onChange={e => setCountry(e.target.value)}
                        className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-sans text-xs tracking-[0.2em] text-gold uppercase mb-6 border-b border-white/5 pb-4">Payment</h3>
                  <div className="bg-void/50 border border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <Lock size={24} className="text-gold/50" />
                    <p className="font-sans text-xs text-mist leading-relaxed">
                      This is a portfolio project environment.<br/>No actual payment will be processed.
                    </p>
                    <div className="text-[10px] uppercase tracking-widest bg-gold/10 text-gold px-4 py-1.5 border border-gold/20">Academic Mode Active</div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full bg-ivory text-void hover:bg-gold hover:text-void font-sans text-xs tracking-[0.3em] uppercase py-5 transition-colors font-bold mt-8"
                >
                  {isProcessing ? 'Processing Order...' : `Complete Order • $${total.toLocaleString()}`}
                </button>
              </form>
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-[400px] checkout-reveal">
              <div className="bg-void/30 border border-white/5 p-8 sticky top-32">
                <h3 className="font-serif text-xl text-cream mb-6">Order Summary</h3>
                
                <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.artwork.image} alt={item.artwork.title} className="w-20 h-24 object-cover sepia-[0.1]" />
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="font-serif text-lg text-ivory leading-tight">{item.artwork.title}</h4>
                          <p className="font-sans text-[9px] tracking-widest uppercase text-mist mt-1">{item.artwork.medium}</p>
                        </div>
                        <p className="font-sans text-sm text-gold">${item.artwork.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-white/5 pt-6 mb-6">
                  <div className="flex justify-between font-sans text-xs text-mist uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-sans text-xs text-mist uppercase tracking-widest">
                    <span>Shipping (Insured)</span>
                    <span className="text-gold">Complimentary</span>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-white/5 pt-6 mb-8">
                  <span className="font-sans text-xs text-mist uppercase tracking-widest">Total</span>
                  <span className="font-serif text-3xl text-cream">${total.toLocaleString()}</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-gold" />
                    <span className="font-sans text-[10px] text-mist tracking-widest uppercase">Authenticity Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck size={16} className="text-gold" />
                    <span className="font-sans text-[10px] text-mist tracking-widest uppercase">Secure White-Glove Delivery</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
