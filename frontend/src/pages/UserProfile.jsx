import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import api, { normalizeImageUrl, resolveImageUrl } from '../lib/axios';
import { Package, Heart, Settings, LogOut, MessageSquare, Check, ShoppingBag, Camera, Save } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from '../utils/canvasPreview';
import Navbar from '../components/Navbar';
import Footer from '../sections/Footer';
import { gsap } from '../animations/gsap';
import { useToastStore } from '../store/toastStore';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

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

  // Settings / profile edit state
  const [settingsName, setSettingsName] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsAddress, setSettingsAddress] = useState('');
  const [settingsFile, setSettingsFile] = useState(null);
  const [settingsPreview, setSettingsPreview] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [cropOpen, setCropOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);

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

      // Detect status changes for notifications
      const savedStatuses = localStorage.getItem('commission_statuses');
      const statusMap = savedStatuses ? JSON.parse(savedStatuses) : {};
      let updated = false;

      res.data.forEach((comm) => {
        const prevStatus = statusMap[comm.id];
        if (prevStatus && prevStatus !== comm.status) {
          const { addToast } = useToastStore.getState();
          addToast(`Your commission request "${comm.artworkType}" has been updated to ${comm.status}!`, 'info');
        }
        statusMap[comm.id] = comm.status;
        updated = true;
      });

      if (updated) {
        localStorage.setItem('commission_statuses', JSON.stringify(statusMap));
      }
    } catch (err) {
      console.error('Failed to load commissions', err);
    } finally {
      setIsLoadingCommissions(false);
    }
  };

  // Populate settings form when user data is available
  useEffect(() => {
    if (user) {
      setSettingsName(user.name || '');
      setSettingsPhone(user.phone || '');
      setSettingsAddress(user.address || '');
      setSettingsPreview(user.profileImage || '');
    }
  }, [user]);

  const onDropSettings = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setCropOpen(true);
      });
      reader.readAsDataURL(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropSettings,
    accept: { 'image/*': [] },
    multiple: false,
  });

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  const handleSaveCrop = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      const canvas = document.createElement('canvas');
      try {
        const blob = await canvasPreview(imgRef.current, canvas, completedCrop);
        const croppedFile = new File([blob], 'profile-image.jpg', { type: 'image/jpeg' });
        setSettingsFile(croppedFile);
        setSettingsPreview(URL.createObjectURL(croppedFile));
        setCropOpen(false);
      } catch {
        setSettingsMsg('Failed to crop image.');
      }
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg('');
    try {
      const formData = new FormData();
      formData.append('name', settingsName);
      formData.append('phone', settingsPhone);
      formData.append('address', settingsAddress);
      if (settingsFile) {
        formData.append('profileImage', settingsFile);
      }
      const { data } = await api.put('/auth/profile', formData);
      // Update the global auth store so Navbar reflects the new picture immediately
      useAuthStore.getState().updateUser({
        name: data.name,
        phone: data.phone,
        address: data.address,
        profileImage: data.profileImage,
      });
      setSettingsPreview(data.profileImage || '');
      setSettingsFile(null);
      setSettingsMsg('✓ Profile saved successfully.');
    } catch (err) {
      setSettingsMsg(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleAddToCart = async (commission) => {    if (!commission.artworkId) return;
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
                    <div className="flex flex-col items-center justify-center min-h-[40vh] border border-white/5 bg-void/30 p-12 text-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      <div className="w-12 h-px bg-gold/50 mb-6" />
                      <h3 className="font-serif text-2xl text-cream font-light mb-3">No Acquisitions Yet</h3>
                      <p className="text-mist/60 font-sans text-[10px] tracking-widest uppercase max-w-sm leading-relaxed mb-8">
                        Your private collection awaits its first masterpiece. Discover unique sketches and paintings.
                      </p>
                      <button onClick={() => navigate('/gallery')} className="relative overflow-hidden font-sans text-[10px] tracking-[0.2em] text-void font-bold uppercase bg-ivory px-8 py-3.5 hover:bg-gold hover:text-void transition-all duration-500">
                        <span className="relative z-10">Explore Gallery</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <div key={order.id} className="bg-void/50 border border-white/5 p-6 flex flex-col gap-6">
                          <div className="flex flex-wrap justify-between items-center border-b border-white/5 pb-4">
                            <div>
                              <p className="font-sans text-[10px] text-mist tracking-widest uppercase mb-1">Order #{order.id.substring(0, 8)}</p>
                              <p className="font-sans text-xs text-ivory/70">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-sans text-[10px] text-mist tracking-widest uppercase mb-1">Status</p>
                              <p className={`font-sans text-xs uppercase tracking-widest font-semibold ${
                                order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'text-green-400' :
                                order.status === 'SHIPPED' ? 'text-blue-400' :
                                order.status === 'PROCESSING' ? 'text-amber-400' :
                                order.status === 'CANCELLED' ? 'text-red-400' :
                                'text-gold'
                              }`}>{order.status}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-sans text-[10px] text-mist tracking-widest uppercase mb-1">Total</p>
                              <p className="font-serif text-lg text-cream">₹{order.total?.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] p-4 border border-white/5 rounded-sm">
                            <div>
                              <p className="font-sans text-[9px] text-mist/50 uppercase tracking-widest mb-2">Shipping Information</p>
                              <p className="font-sans text-xs text-ivory mb-1"><span className="text-mist">Name:</span> {order.shippingName}</p>
                              <p className="font-sans text-xs text-ivory mb-1"><span className="text-mist">Address:</span> {order.shippingAddress}, {order.shippingCity} - {order.shippingPincode}</p>
                              <p className="font-sans text-xs text-ivory"><span className="text-mist">Phone:</span> {order.shippingPhone || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-sans text-[9px] text-mist/50 uppercase tracking-widest mb-2">Payment Details</p>
                              <p className="font-sans text-xs text-ivory mb-1"><span className="text-mist">Method:</span> {order.paymentMethod}</p>
                              <p className="font-sans text-xs text-ivory">
                                <span className="text-mist">Status:</span> 
                                <span className={`ml-1 ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-gold'}`}>{order.paymentStatus}</span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <p className="font-sans text-[9px] text-mist/50 uppercase tracking-widest">Ordered Items</p>
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center gap-6 bg-void/30 p-3 border border-white/5">
                                <img src={resolveImageUrl(item.artwork.image)} alt={item.artwork.title} className="w-16 h-16 object-cover sepia-[0.2]" />
                                <div className="flex-1">
                                  <h4 className="font-serif text-base text-ivory mb-1">{item.artwork.title}</h4>
                                  <p className="font-sans text-[9px] text-mist uppercase tracking-widest">{item.artwork.medium}</p>
                                </div>
                                <div className="font-sans text-sm text-ivory text-right">
                                  <p>₹{item.price}</p>
                                  <p className="text-[10px] text-mist/50 mt-1">Qty: {item.quantity}</p>
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
                    <div className="flex flex-col items-center justify-center min-h-[40vh] border border-white/5 bg-void/30 p-12 text-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      <div className="w-12 h-px bg-gold/50 mb-6" />
                      <h3 className="font-serif text-2xl text-cream font-light mb-3">No Custom Requests</h3>
                      <p className="text-mist/60 font-sans text-[10px] tracking-widest uppercase max-w-sm leading-relaxed mb-8">
                        Collaborate directly with our master artists to bring your personal vision to life.
                      </p>
                      <button onClick={() => navigate('/commissions/request')} className="relative overflow-hidden font-sans text-[10px] tracking-[0.2em] text-void font-bold uppercase bg-ivory px-8 py-3.5 hover:bg-gold hover:text-void transition-all duration-500">
                        <span className="relative z-10">Request Custom Sketch</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {commissions.map(comm => (
                        <div key={comm.id} className="bg-void/50 border border-white/5 p-6 flex flex-col md:flex-row justify-between gap-6">
                          
                          {/* Image preview & basic details */}
                          <div className="flex gap-6 items-start flex-1">
                            {comm.referenceImage ? (
                              <img src={normalizeImageUrl(comm.referenceImage)} alt="Reference" className="w-20 h-20 object-cover border border-white/10 sepia-[0.1]" />
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
                              <span className={`px-2 py-0.5 text-[8px] uppercase tracking-wider font-semibold rounded-sm ${
                                comm.status === 'PENDING' ? 'bg-gold/20 text-gold' :
                                comm.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                comm.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400' :
                                comm.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {comm.status === 'IN_PROGRESS' ? 'In Progress' : comm.status}
                              </span>
                            </div>

                            {comm.status === 'APPROVED' && comm.finalPrice && (
                              <div className="mt-2 text-right flex flex-col items-end">
                                <p className="font-sans text-[9px] text-mist/50 mb-0.5">Negotiated Price</p>
                                <p className="font-serif text-lg text-gold font-semibold mb-2">₹{comm.finalPrice}</p>
                                
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

                            {(comm.status === 'REJECTED' || comm.status === 'REFUNDED') && (
                              <div className="text-right">
                                <p className="font-sans text-[9px] text-red-400/80 bg-red-950/20 px-2 py-1 border border-red-500/10 rounded">
                                  Refunded: ₹{comm.advanceAmount || '100.00'}
                                </p>
                              </div>
                            )}

                            {comm.status === 'PENDING' && (
                              <div>
                                <p className="font-sans text-[9px] text-mist/50 mb-0.5">Advance Deposit</p>
                                <p className="font-sans text-xs text-green-400 font-semibold">Paid: ₹{comm.advanceAmount}</p>
                              </div>
                            )}

                            {comm.status === 'IN_PROGRESS' && (
                              <div>
                                <p className="font-sans text-[9px] text-mist/55 mb-0.5">Creation Stage</p>
                                <p className="font-sans text-xs text-amber-400 font-semibold">Sketching...</p>
                              </div>
                            )}

                            <button
                              onClick={() => navigate(`/commissions/${comm.id}`)}
                              className="mt-2 text-center text-gold hover:text-cream font-sans text-[9px] tracking-wider uppercase underline font-semibold transition-colors"
                            >
                              Track Details & Timeline →
                            </button>
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
                    <div className="flex flex-col items-center justify-center min-h-[40vh] border border-white/5 bg-void/30 p-12 text-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      <div className="w-12 h-px bg-gold/50 mb-6" />
                      <h3 className="font-serif text-2xl text-cream font-light mb-3">Your Wishlist is Empty</h3>
                      <p className="text-mist/60 font-sans text-[10px] tracking-widest uppercase max-w-sm leading-relaxed mb-8">
                        Save pieces that inspire you. Curate a personal board of your favorite artworks.
                      </p>
                      <button onClick={() => navigate('/gallery')} className="relative overflow-hidden font-sans text-[10px] tracking-[0.2em] text-gold uppercase border border-gold/30 px-8 py-3.5 hover:bg-gold hover:text-void transition-all duration-500">
                        <span className="relative z-10">Discover Art</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {wishlistItems.map(item => (
                        <div key={item.id} className="group relative bg-void/30 border border-white/5 overflow-hidden">
                          <img src={resolveImageUrl(item.artwork.image)} alt={item.artwork.title} className="w-full h-64 object-cover sepia-[0.1] group-hover:scale-105 transition-transform duration-1000" />
                          <div className="p-6">
                            <h4 className="font-serif text-xl text-cream mb-2">{item.artwork.title}</h4>
                            <div className="flex justify-between items-center">
                              <span className="font-sans text-[10px] tracking-widest text-gold uppercase">{item.artwork.price ? `₹${item.artwork.price}` : 'Inquiry'}</span>
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

                  {/* Crop overlay */}
                  {cropOpen && (
                    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
                      <h3 className="font-serif text-xl text-cream mb-4">Crop Profile Photo</h3>
                      <div className="flex items-center justify-center bg-black/50 rounded-lg border border-white/10 mb-6 max-h-[60vh] overflow-auto">
                        {imgSrc && (
                          <ReactCrop
                            crop={crop}
                            onChange={(_, pct) => setCrop(pct)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                          >
                            <img
                              ref={imgRef}
                              alt="Crop"
                              src={imgSrc}
                              onLoad={onImageLoad}
                              className="max-h-[50vh] object-contain"
                            />
                          </ReactCrop>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => setCropOpen(false)} className="px-6 py-2.5 text-xs font-bold text-mist hover:text-cream border border-white/10 rounded-lg">Cancel</button>
                        <button onClick={handleSaveCrop} className="px-6 py-2.5 text-xs font-bold bg-gold text-void rounded-lg hover:bg-ivory">Save Crop</button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    {/* Profile picture */}
                    <div className="flex items-center gap-6">
                      <div
                        {...getRootProps()}
                        className={`relative group w-20 h-20 rounded-full overflow-hidden border-2 border-dashed cursor-pointer flex-shrink-0 transition-colors ${
                          isDragActive ? 'border-gold bg-gold/5' : 'border-white/20 hover:border-white/50'
                        }`}
                      >
                        <input {...getInputProps()} />
                        {settingsPreview ? (
                          <img
                            src={settingsPreview.startsWith('blob:') ? settingsPreview : normalizeImageUrl(settingsPreview)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-mist/30 bg-zinc-900">
                            {settingsName?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                          <Camera size={18} className="text-cream" />
                          <span className="text-[9px] text-cream uppercase tracking-wider mt-1">Change</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-sans text-xs text-mist mb-1">Profile Photo</p>
                        <p className="font-sans text-[10px] text-mist/50">Click or drag to upload. Max 5MB.</p>
                        {settingsPreview && (
                          <button type="button" onClick={() => { setSettingsPreview(''); setSettingsFile(null); }} className="text-[10px] text-red-400 hover:text-red-300 mt-1 font-sans">Remove photo</button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Name</label>
                      <input
                        type="text"
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Phone</label>
                      <input
                        type="tel"
                        value={settingsPhone}
                        onChange={(e) => setSettingsPhone(e.target.value)}
                        className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory outline-none focus:border-white/30 transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Address</label>
                      <textarea
                        value={settingsAddress}
                        onChange={(e) => setSettingsAddress(e.target.value)}
                        rows={3}
                        className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory outline-none focus:border-white/30 transition-colors resize-none"
                        placeholder="Your shipping address"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Email</label>
                      <input type="email" disabled value={user.email} className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory/40 cursor-not-allowed" />
                      <p className="font-sans text-[10px] text-mist/40 mt-1">Email cannot be changed.</p>
                    </div>

                    {settingsMsg && (
                      <p className={`font-sans text-xs ${settingsMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                        {settingsMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="flex items-center gap-2 bg-gold text-void font-sans text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-ivory transition-colors disabled:opacity-50"
                    >
                      <Save size={14} />
                      {settingsSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
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
