import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { resolveImageUrl } from '../lib/axios';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import { useState } from 'react';
import { 
  ArrowLeft, Calendar, IndianRupee, FileText, Phone, MapPin, 
  MessageSquare, User, ShoppingBag, Clock, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CommissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch commission details
  const { data: commission, isLoading, isError } = useQuery({
    queryKey: ['commission-detail', id],
    queryFn: async () => {
      const { data } = await api.get(`/commissions`);
      // Find the specific commission from user's list
      const record = data.find((c) => c.id === id);
      if (!record) throw new Error('Commission not found');
      return record;
    }
  });

  const handleAddToCart = async () => {
    if (!commission?.artworkId) return;
    setAddingToCart(true);
    try {
      await addItem(commission.artworkId, 1);
      addToast('Bespoke artwork successfully added to cart!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to add custom artwork to cart.', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="font-sans text-xs tracking-widest uppercase text-mist/60">Retrieving inquiry details...</p>
        </div>
      </div>
    );
  }

  if (isError || !commission) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-cream p-6">
        <div className="max-w-md w-full bg-carbon/30 border border-white/5 p-8 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
          <h3 className="font-serif text-xl mb-2">Failed to load commission</h3>
          <p className="font-sans text-xs text-mist/60 mb-6">This request may not exist or you do not have permission to view it.</p>
          <button 
            onClick={() => navigate('/profile')} 
            className="px-6 py-2 bg-gold text-void font-sans text-[10px] tracking-widest uppercase font-bold hover:bg-gold/80 transition-colors"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  // Define steps for the progress timeline
  // Steps: Request Submitted -> Approved -> In Progress -> Completed
  const steps = [
    { label: 'Submitted', desc: 'Request sent to artist', key: 'SUBMITTED' },
    { label: 'Approved', desc: 'Terms & price negotiated', key: 'APPROVED' },
    { label: 'In Progress', desc: 'Sketch under creation', key: 'IN_PROGRESS' },
    { label: 'Completed', desc: 'Finished & ready', key: 'COMPLETED' }
  ];

  // Helper to determine the index of the current status
  const getActiveStepIndex = () => {
    const status = commission.status;
    if (status === 'PENDING') return 0;
    if (status === 'APPROVED') return 1;
    if (status === 'IN_PROGRESS') return 2;
    if (status === 'COMPLETED') return 3;
    return -1; // REJECTED or REFUNDED
  };

  const activeIndex = getActiveStepIndex();

  return (
    <div className="min-h-screen bg-void relative overflow-hidden px-4 py-32 text-ivory">
      {/* Ambient background light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60vw] h-[60vw] bg-gold/5 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/profile')}
          className="group flex items-center gap-2 font-sans text-[10px] tracking-wider uppercase text-mist/60 hover:text-cream transition-colors mb-8"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-white/5 pb-8 mb-10">
          <div>
            <span className="font-sans text-[9px] tracking-[0.3em] text-gold uppercase">Commission Request Tracker</span>
            <h1 className="font-serif text-3xl md:text-4xl text-cream mt-2 mb-1">{commission.artworkType}</h1>
            <p className="font-sans text-xs text-mist/50">ID: {commission.id}</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="font-sans text-[9px] text-mist/55 uppercase tracking-widest">Current Status</span>
            <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-sm ${
              commission.status === 'PENDING' ? 'bg-gold/20 text-gold border border-gold/30' :
              commission.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              commission.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              commission.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {commission.status === 'IN_PROGRESS' ? 'In Progress' : commission.status}
            </span>
          </div>
        </div>

        {/* Custom Timeline for REJECTED/REFUNDED states */}
        {activeIndex === -1 ? (
          <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-none mb-10 flex items-start gap-4">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-serif text-base text-red-200 uppercase tracking-wider mb-1">
                Request {commission.status}
              </h4>
              <p className="font-sans text-xs text-mist/75 leading-relaxed">
                This commission request has been {commission.status.toLowerCase()}. 
                {commission.status === 'REFUNDED' || commission.status === 'REJECTED' ? 
                  ` The holding deposit of ₹${commission.advanceAmount || '100.00'} has been successfully reversed to your credit card.` : 
                  ' Please check the artist\'s notes below for more feedback.'
                }
              </p>
            </div>
          </div>
        ) : (
          /* Premium Step-by-Step Progress Timeline */
          <div className="bg-carbon/25 border border-white/5 p-8 rounded-none mb-10">
            <h3 className="font-serif text-sm text-cream mb-8 uppercase tracking-widest text-center">Progress Timeline</h3>
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 w-full">
              {/* Connecting progress line */}
              <div className="absolute left-[50%] md:left-[12.5%] md:right-[12.5%] top-[10px] md:top-[15px] bottom-4 md:bottom-auto w-[2px] md:w-auto md:h-[2px] bg-white/10 -translate-x-[50%] md:translate-x-0" />
              <div 
                className="absolute left-[50%] md:left-[12.5%] top-[10px] md:top-[15px] bottom-4 md:bottom-auto w-[2px] md:h-[2px] bg-gold -translate-x-[50%] md:translate-x-0 transition-all duration-700" 
                style={{ 
                  height: window.innerWidth < 768 ? `${(activeIndex / 3) * 100}%` : '2px',
                  width: window.innerWidth >= 768 ? `${(activeIndex / 3) * 75}%` : '2px' 
                }} 
              />

              {steps.map((step, idx) => {
                const isCompleted = idx < activeIndex;
                const isActive = idx === activeIndex;
                return (
                  <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-3 z-10 w-[220px] md:w-auto">
                    {/* Circle Indicator */}
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 font-sans text-xs border ${
                        isCompleted 
                          ? 'bg-gold border-gold text-void font-bold shadow-lg shadow-gold/10' 
                          : isActive 
                            ? 'bg-void border-gold text-gold font-bold shadow-lg shadow-gold/20 scale-110' 
                            : 'bg-void border-white/20 text-mist/40'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>

                    {/* Step Labels */}
                    <div className="text-left md:text-center">
                      <p className={`font-serif text-xs uppercase tracking-wider ${isActive ? 'text-gold font-semibold' : 'text-cream'}`}>
                        {step.label}
                      </p>
                      <p className="font-sans text-[9px] text-mist/40 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel - Details & Specifications */}
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {/* Project Specifications */}
            <div className="bg-carbon/20 border border-white/5 p-6 flex flex-col gap-4">
              <h3 className="font-serif text-base text-cream border-b border-white/5 pb-2">Acquisition Details</h3>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 font-sans text-xs">
                <div>
                  <p className="text-mist/40 uppercase tracking-widest text-[8px] mb-1">Subject / Artwork Type</p>
                  <p className="text-ivory font-medium">{commission.artworkType}</p>
                </div>
                <div>
                  <p className="text-mist/40 uppercase tracking-widest text-[8px] mb-1">Target Budget</p>
                  <p className="text-gold font-medium">{commission.budget || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-mist/40 uppercase tracking-widest text-[8px] mb-1">Phone Number</p>
                  <p className="text-ivory">{commission.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-mist/40 uppercase tracking-widest text-[8px] mb-1">Shipping City</p>
                  <p className="text-ivory">{commission.shippingCity} ({commission.shippingPincode})</p>
                </div>
                <div className="col-span-2">
                  <p className="text-mist/40 uppercase tracking-widest text-[8px] mb-1">Physical Delivery Address</p>
                  <p className="text-ivory">{commission.shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Client Concepts / message */}
            <div className="bg-carbon/20 border border-white/5 p-6 flex flex-col gap-3">
              <h3 className="font-sans text-[10px] tracking-wider text-mist/55 uppercase">Client Concept Requirements</h3>
              <p className="font-sans text-xs text-mist leading-relaxed whitespace-pre-wrap italic">
                "{commission.message}"
              </p>
            </div>

            {/* Artist / Admin Notes & Feedback */}
            <div className="bg-carbon/25 border border-white/10 p-6 flex flex-col gap-4 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="font-serif text-base text-cream border-b border-white/5 pb-2 flex items-center gap-2">
                <MessageSquare size={16} className="text-gold" />
                Artist Feedback & Notes
              </h3>
              {commission.adminNotes ? (
                <div className="font-sans text-xs text-mist/90 leading-relaxed whitespace-pre-wrap bg-void/30 p-4 border border-white/5">
                  {commission.adminNotes}
                </div>
              ) : (
                <p className="font-sans text-xs text-mist/40 italic">No notes or update messages submitted by the artist yet. We will notify you here when the artist provides updates.</p>
              )}
            </div>

          </div>

          {/* Right Panel - Reference Attachment & Payment / Purchase Actions */}
          <div className="md:col-span-5 flex flex-col gap-6 sticky top-24">
            
            {/* Reference Attachment Preview */}
            <div className="bg-carbon/20 border border-white/5 p-6 flex flex-col gap-4">
              <h3 className="font-sans text-[10px] tracking-wider text-mist/55 uppercase">Reference Photograph</h3>
              {commission.referenceImage ? (
                <div className="relative group block rounded overflow-hidden aspect-[4/3] border border-white/10">
                  <img 
                    src={resolveImageUrl(commission.referenceImage)} 
                    alt="Reference Preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-void/5 animate-pulse" />
                </div>
              ) : (
                <div className="aspect-[4/3] border border-dashed border-white/10 rounded flex flex-col items-center justify-center text-center p-4">
                  <FileText className="text-mist/20 mb-2" size={24} />
                  <p className="font-sans text-[10px] text-mist/30">No reference attachment uploaded for this commission.</p>
                </div>
              )}
            </div>

            {/* Purchase CTA / Deposit Payment Status */}
            <div className="bg-carbon/35 border border-white/10 p-6 flex flex-col gap-4">
              <div>
                <p className="font-sans text-[9px] tracking-[0.25em] text-gold uppercase mb-1">Payment & Checkout</p>
                <h4 className="font-serif text-lg text-cream">Transaction Overview</h4>
              </div>

              {/* Deposit hold display */}
              <div className="flex justify-between items-center text-xs font-sans border-b border-white/5 pb-3">
                <span className="text-mist/60 flex items-center gap-1.5"><ShieldCheck size={14} className="text-gold" /> Advance Verification Deposit</span>
                <span className="text-cream font-medium">₹{commission.advanceAmount || '100.00'}</span>
              </div>

              {commission.status === 'APPROVED' && commission.finalPrice && (
                <div className="flex flex-col gap-4 pt-2">
                  <div className="bg-green-500/5 border border-green-500/20 p-4 rounded text-xs font-sans space-y-2">
                    <p className="text-green-400 font-bold uppercase text-[9px] tracking-widest">Inquiry Approved</p>
                    <p className="text-mist/75">
                      The artist has accepted your request and defined a final price for creation & delivery.
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center font-sans text-xs">
                    <span className="text-mist/60">Final Price (Negotiated)</span>
                    <span className="text-gold font-serif text-xl font-semibold">₹{commission.finalPrice}</span>
                  </div>

                  {commission.submissionDate && (
                    <div className="flex justify-between items-center font-sans text-[10px] text-mist/50">
                      <span>Delivery Target Date</span>
                      <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(commission.submissionDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {commission.artworkId && (
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold/80 text-void font-sans text-[10px] tracking-widest uppercase font-bold py-3.5 text-center transition-all duration-300 shadow-xl"
                    >
                      <ShoppingBag size={14} />
                      {addingToCart ? 'Processing...' : 'Complete Payment / Add to Cart'}
                    </button>
                  )}
                </div>
              )}

              {commission.status === 'PENDING' && (
                <div className="flex flex-col gap-2 pt-2 text-center">
                  <Clock size={20} className="text-gold/60 mx-auto mb-1 animate-pulse" />
                  <p className="font-sans text-xs text-mist/70">Waiting for artist approval...</p>
                  <p className="font-sans text-[10px] text-mist/40">The artist is reviewing your request, checking materials, and drafting a delivery schedule. Notes and pricing details will be displayed here soon.</p>
                </div>
              )}

              {commission.status === 'IN_PROGRESS' && (
                <div className="flex flex-col gap-2 pt-2 text-center">
                  <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                  <p className="font-sans text-xs text-gold">Artwork Under Creation</p>
                  <p className="font-sans text-[10px] text-mist/40">The master artist has initiated the sketching process. Keep an eye on the "Artist Feedback" notes above for updates or drafts!</p>
                </div>
              )}

              {commission.status === 'COMPLETED' && (
                <div className="flex flex-col gap-2 pt-2 text-center text-xs font-sans">
                  <CheckCircle2 size={24} className="text-green-400 mx-auto mb-1" />
                  <p className="text-green-400 font-bold uppercase tracking-widest text-[9px]">Sketch Completed</p>
                  <p className="text-mist/70">Your commissioned custom sketch is completed and processed for shipping!</p>
                  {commission.completedAt && (
                    <p className="text-[10px] text-mist/40">Completed: {new Date(commission.completedAt).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
