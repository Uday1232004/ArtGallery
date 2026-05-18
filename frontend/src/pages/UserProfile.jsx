import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import api from '../lib/axios';
import { Package, Heart, Settings, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../sections/Footer';
import { gsap } from '../animations/gsap';

export default function UserProfile() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // orders, wishlist, settings
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWishlist();
    fetchOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    gsap.fromTo('.tab-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
  }, [activeTab]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="bg-obsidian min-h-screen pencil-texture">
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-white/10 pb-8">
            <div>
              <h1 className="font-serif font-light text-cream text-4xl mb-2">Welcome, {user.name}</h1>
              <p className="font-sans text-xs tracking-[0.2em] text-gold uppercase">{user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-mist hover:text-red-400 transition-colors font-sans text-xs uppercase tracking-widest"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-12">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-4 px-6 py-4 font-sans text-xs uppercase tracking-widest transition-colors ${
                  activeTab === 'orders' ? 'bg-gold text-void font-semibold' : 'text-mist hover:bg-void/50 hover:text-ivory'
                }`}
              >
                <Package size={16} /> My Collection
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`flex items-center gap-4 px-6 py-4 font-sans text-xs uppercase tracking-widest transition-colors ${
                  activeTab === 'wishlist' ? 'bg-gold text-void font-semibold' : 'text-mist hover:bg-void/50 hover:text-ivory'
                }`}
              >
                <Heart size={16} /> Wishlist ({wishlistItems.length})
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-4 px-6 py-4 font-sans text-xs uppercase tracking-widest transition-colors ${
                  activeTab === 'settings' ? 'bg-gold text-void font-semibold' : 'text-mist hover:bg-void/50 hover:text-ivory'
                }`}
              >
                <Settings size={16} /> Settings
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 tab-content">
              
              {activeTab === 'orders' && (
                <div>
                  <h2 className="font-serif text-2xl text-cream mb-8">Acquired Artworks & Orders</h2>
                  
                  {isLoadingOrders ? (
                    <div className="text-mist text-sm animate-pulse">Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="bg-void/50 border border-white/5 p-12 text-center">
                      <p className="text-mist font-sans text-sm mb-4">You haven't acquired any artworks yet.</p>
                      <button onClick={() => navigate('/gallery')} className="text-gold uppercase text-xs tracking-widest hover:text-ivory transition-colors">
                        Explore Gallery
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <div key={order.id} className="bg-void/50 border border-white/5 p-6">
                          <div className="flex flex-wrap justify-between items-center mb-6 border-b border-white/5 pb-4">
                            <div>
                              <p className="font-sans text-[10px] text-mist tracking-widest uppercase mb-1">Order #{order.id.substring(0, 8)}</p>
                              <p className="font-sans text-xs text-ivory/70">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-sans text-[10px] text-mist tracking-widest uppercase mb-1">Status</p>
                              <p className={`font-sans text-xs uppercase tracking-widest ${
                                order.status === 'COMPLETED' ? 'text-green-400' : 'text-gold'
                              }`}>{order.status}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-sans text-[10px] text-mist tracking-widest uppercase mb-1">Total</p>
                              <p className="font-serif text-lg text-cream">${order.totalAmount}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center gap-6">
                                <img src={item.artwork.image} alt={item.artwork.title} className="w-16 h-16 object-cover sepia-[0.2]" />
                                <div className="flex-1">
                                  <h4 className="font-serif text-lg text-ivory">{item.artwork.title}</h4>
                                  <p className="font-sans text-[10px] text-mist uppercase tracking-widest">{item.artwork.medium}</p>
                                </div>
                                <div className="font-sans text-sm text-ivory">
                                  ${item.price} × {item.quantity}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="font-serif text-2xl text-cream mb-8">Saved Artworks</h2>
                  
                  {wishlistItems.length === 0 ? (
                    <div className="bg-void/50 border border-white/5 p-12 text-center">
                      <p className="text-mist font-sans text-sm mb-4">Your wishlist is empty.</p>
                      <button onClick={() => navigate('/gallery')} className="text-gold uppercase text-xs tracking-widest hover:text-ivory transition-colors">
                        Discover Art
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {wishlistItems.map(item => (
                        <div key={item.id} className="group relative bg-void/30 border border-white/5 overflow-hidden">
                          <img src={item.artwork.image} alt={item.artwork.title} className="w-full h-64 object-cover sepia-[0.1] group-hover:scale-105 transition-transform duration-1000" />
                          <div className="p-6">
                            <h4 className="font-serif text-xl text-cream mb-2">{item.artwork.title}</h4>
                            <div className="flex justify-between items-center">
                              <span className="font-sans text-[10px] tracking-widest text-gold uppercase">{item.artwork.price ? `$${item.artwork.price}` : 'Inquiry'}</span>
                              <button onClick={() => navigate(`/artworks/${item.artwork.id}`)} className="font-sans text-[10px] tracking-widest text-mist uppercase hover:text-ivory transition-colors">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="max-w-md">
                  <h2 className="font-serif text-2xl text-cream mb-8">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Name</label>
                      <input type="text" disabled value={user.name} className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory/50 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Email</label>
                      <input type="email" disabled value={user.email} className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory/50 cursor-not-allowed" />
                    </div>
                    <div className="pt-4">
                      <p className="font-sans text-xs text-mist/70 mb-4">To update your account details, please contact gallery support.</p>
                      <button className="border border-white/10 text-mist hover:text-gold hover:border-gold transition-colors font-sans text-xs uppercase tracking-widest px-6 py-3">
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
