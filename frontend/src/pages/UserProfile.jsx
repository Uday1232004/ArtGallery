import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import api, { resolveImageUrl } from '../lib/axios';
import { Package, Heart, Settings, LogOut, MessageSquare, Check, ShoppingBag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../sections/Footer';
import { gsap } from '../animations/gsap';

export default function UserProfile() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // orders, commissions, wishlist, settings
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [isLoadingCommissions, setIsLoadingCommissions] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWishlist();
    fetchOrders();
    fetchCommissions();
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

  const fetchCommissions = async () => {
    setIsLoadingCommissions(true);
    try {
      const res = await api.get('/commissions');
      setCommissions(res.data);
    } catch (err) {
      console.error('Failed to load commissions', err);
    } finally {
      setIsLoadingCommissions(false);
    }
  };

  const handleAddToCart = async (commission) => {
    if (!commission.artworkId) return;
    setAddingToCartId(commission.id);
    try {
      await addItem(commission.artworkId, 1);
      openCart();
    } catch (err) {
      console.error('Failed to add commission artwork to cart', err);
    } finally {
      setAddingToCartId(null);
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
                onClick={() => setActiveTab('commissions')}
                className={`flex items-center gap-4 px-6 py-4 font-sans text-xs uppercase tracking-widest transition-colors ${
                  activeTab === 'commissions' ? 'bg-gold text-void font-semibold' : 'text-mist hover:bg-void/50 hover:text-ivory'
                }`}
              >
                <MessageSquare size={16} /> My Commissions ({commissions.length})
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
                              <p className="font-serif text-lg text-cream">${order.total?.toLocaleString()}</p>
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

              {activeTab === 'commissions' && (
                <div>
                  <h2 className="font-serif text-2xl text-cream mb-8">Custom Commission Requests</h2>
                  
                  {isLoadingCommissions ? (
                    <div className="text-mist text-sm animate-pulse">Loading commissions...</div>
                  ) : commissions.length === 0 ? (
                    <div className="bg-void/50 border border-white/5 p-12 text-center">
                      <p className="text-mist font-sans text-sm mb-4">You haven't requested any custom commissions yet.</p>
                      <button onClick={() => navigate('/commissions/request')} className="text-gold uppercase text-xs tracking-widest hover:text-ivory transition-colors">
                        Request Custom Sketch
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {commissions.map(comm => (
                        <div key={comm.id} className="bg-void/50 border border-white/5 p-6 flex flex-col md:flex-row justify-between gap-6">
                          
                          {/* Image preview & basic details */}
                          <div className="flex gap-6 items-start flex-1">
                            {comm.referenceImage ? (
                              <img src={resolveImageUrl(comm.referenceImage)} alt="Reference" className="w-20 h-20 object-cover border border-white/10 sepia-[0.1]" />
                            ) : (
                              <div className="w-20 h-20 bg-white/5 flex items-center justify-center font-sans text-[10px] text-mist/50 border border-white/10 text-center">No Image</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-serif text-lg text-cream mb-1">{comm.artworkType}</h4>
                              <p className="font-sans text-[10px] text-mist/60 uppercase tracking-wider mb-2">Artist: {comm.artist?.name || 'Assigned Artist'}</p>
                              <p className="font-sans text-xs text-mist/85 line-clamp-2 italic mb-2">"{comm.message}"</p>
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-1 font-sans text-[10px] text-mist/50">
                                <span>Phone: {comm.phone}</span>
                                <span>•</span>
                                <span>Shipping: {comm.shippingCity}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status & Purchase Action Button */}
                          <div className="flex flex-col justify-between items-end text-right min-w-[150px] gap-4">
                            <div>
                              <p className="font-sans text-[10px] text-mist tracking-widest uppercase mb-1 text-[9px]">Status</p>
                              <span className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-semibold rounded-sm ${
                                comm.status === 'PENDING' ? 'bg-gold/20 text-gold' :
                                comm.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                comm.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {comm.status}
                              </span>
                            </div>

                            {comm.status === 'APPROVED' && comm.finalPrice && (
                              <div className="mt-2 text-right flex flex-col items-end">
                                <p className="font-sans text-[9px] text-mist/50 mb-0.5">Negotiated Price</p>
                                <p className="font-serif text-lg text-gold font-semibold mb-2">${comm.finalPrice}</p>
                                
                                {comm.artworkId && (
                                  <button
                                    onClick={() => handleAddToCart(comm)}
                                    disabled={addingToCartId === comm.id}
                                    className="flex items-center gap-2 bg-gold hover:bg-gold/80 text-void font-sans text-[9px] font-bold uppercase tracking-widest px-4 py-2 text-center transition-colors shadow-lg"
                                  >
                                    <ShoppingBag size={12} />
                                    {addingToCartId === comm.id ? 'Adding...' : 'Add to Cart'}
                                  </button>
                                )}
                              </div>
                            )}

                            {comm.status === 'REJECTED' && (
                              <div className="text-right">
                                <p className="font-sans text-[9px] text-red-400/80 bg-red-950/20 px-2 py-1 border border-red-500/10 rounded">
                                  Refunded: ${comm.advanceAmount || '100.00'}
                                </p>
                              </div>
                            )}

                            {comm.status === 'PENDING' && (
                              <div>
                                <p className="font-sans text-[9px] text-mist/50 mb-0.5">Advance Deposit</p>
                                <p className="font-sans text-xs text-green-400">Paid: ${comm.advanceAmount}</p>
                              </div>
                            )}
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
