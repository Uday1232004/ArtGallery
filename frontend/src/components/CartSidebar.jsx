import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { resolveImageUrl } from '../lib/axios';

export default function CartSidebar() {
  const { isOpen, closeCart, items, total, removeItem, updateQuantity } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-void/80 backdrop-blur-sm z-[100] transition-opacity"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-obsidian border-l border-white/10 z-[110] flex flex-col shadow-2xl transform transition-transform duration-500 pencil-texture">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-void/50">
          <h2 className="font-serif text-2xl text-cream flex items-center gap-3">
            <ShoppingBag size={20} className="text-gold" />
            Your Collection
          </h2>
          <button 
            onClick={closeCart}
            className="p-2 hover:bg-void text-mist hover:text-gold transition-colors rounded-full border border-transparent hover:border-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <ShoppingBag size={48} className="text-mist mb-4" />
              <p className="font-serif text-xl text-cream">Your cart is empty</p>
              <p className="font-sans text-xs text-mist">Discover unique artworks in the gallery.</p>
              <button 
                onClick={() => { closeCart(); navigate('/gallery'); }}
                className="mt-4 border border-white/10 px-6 py-3 font-sans text-[10px] tracking-widest text-mist uppercase hover:text-gold hover:border-gold transition-colors"
              >
                Explore Gallery
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-void/30 p-4 border border-white/5 relative group">
                <img src={resolveImageUrl(item.artwork.image)} alt={item.artwork.title} className="w-20 h-24 object-cover sepia-[0.1]" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-lg text-ivory leading-tight mb-1">{item.artwork.title}</h4>
                    <p className="font-sans text-[9px] tracking-widest uppercase text-mist">{item.artwork.medium}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 bg-void border border-white/10 px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.artwork.id, Math.max(1, item.quantity - 1))}
                        className="text-mist hover:text-ivory"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-sans text-xs text-cream w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.artwork.id, item.quantity + 1)}
                        className="text-mist hover:text-ivory"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-sans text-sm text-gold">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item.artwork.id)}
                  className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-void/80 border-t border-white/5">
            <div className="flex justify-between items-end mb-6">
              <span className="font-sans text-xs tracking-widest uppercase text-mist">Subtotal</span>
              <span className="font-serif text-3xl text-cream">₹{total.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => { closeCart(); navigate('/checkout'); }}
              className="w-full bg-ivory text-void hover:bg-gold font-sans text-xs tracking-[0.2em] uppercase py-5 transition-colors font-bold"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

      </div>
    </>
  );
}
