import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

export default function RequestCommission() {
  const [artists, setArtists] = useState([]);
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [artworkType, setArtworkType] = useState('Realistic Portrait');
  const [budget, setBudget] = useState('$500');
  const [deadline, setDeadline] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');
  const [referenceFile, setReferenceFile] = useState(null);
  const [referencePreview, setReferencePreview] = useState('');
  
  // Checkout details
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('***');
  const [cardName, setCardName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingArtists, setIsFetchingArtists] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await api.get('/artists');
        setArtists(response.data);
        if (response.data.length > 0) {
          setSelectedArtistId(response.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load artists:', err);
      } finally {
        setIsFetchingArtists(false);
      }
    };
    fetchArtists();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReferenceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferencePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!selectedArtistId) {
      setError('Please select an artist for your commission.');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('artistId', selectedArtistId);
      formData.append('artworkType', artworkType);
      formData.append('budget', budget);
      formData.append('deadline', deadline);
      formData.append('message', message);
      formData.append('phone', phone);
      formData.append('shippingAddress', shippingAddress);
      formData.append('shippingCity', shippingCity);
      formData.append('shippingPincode', shippingPincode);
      formData.append('advanceAmount', '100');
      formData.append('paymentStatus', 'PAID');
      
      // Get current logged-in user name/email from auth store
      formData.append('clientName', user?.name || cardName || 'Valued Client');
      formData.append('email', user?.email || '');

      if (referenceFile) {
        formData.append('referenceImage', referenceFile);
      }

      await api.post('/commissions', formData);

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit commission request. Make sure you are logged in!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void relative overflow-hidden px-4 py-32 text-ivory">
      {/* Ambient background light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[70vw] h-[70vw] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-cream tracking-wide mb-3">Custom Commission Request</h1>
          <p className="font-sans text-xs tracking-[0.3em] text-gold uppercase">Collaborate with master sketch artists to materialize your vision</p>
        </div>

        {success ? (
          <div className="max-w-lg mx-auto bg-carbon/50 border border-gold/30 p-12 text-center backdrop-blur-xl">
            <div className="w-16 h-16 border-2 border-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-gold text-2xl font-light">✓</span>
            </div>
            <h3 className="font-serif text-2xl text-cream mb-4">Request Submitted Successfully!</h3>
            <p className="font-sans text-sm text-mist leading-relaxed mb-6">
              Your $100 advance deposit has been processed. We have notified your chosen artist to review the request, draft a final proposal and assign your deadline!
            </p>
            <p className="font-sans text-[10px] tracking-widest text-gold uppercase animate-pulse">
              Redirecting to your profile space...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column - Form Details (7 cols) */}
            <div className="lg:col-span-7 bg-carbon/25 border border-white/5 backdrop-blur-lg p-8 md:p-10 flex flex-col gap-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-200 text-sm p-4 text-center">
                  {error}
                </div>
              )}

              {/* 1. Artist Choice */}
              <div>
                <h3 className="font-serif text-lg text-cream mb-4 border-b border-white/5 pb-2">1. Select Your Master Artist</h3>
                {isFetchingArtists ? (
                  <div className="font-sans text-xs text-mist animate-pulse">Loading artist directory...</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {artists.length === 0 ? (
                      <p className="text-sm text-gold">No resident artists found. Defaulting to ArtBro Studio.</p>
                    ) : (
                      <div className="relative">
                        <select
                          value={selectedArtistId}
                          onChange={(e) => setSelectedArtistId(e.target.value)}
                          className="w-full bg-void/60 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold appearance-none cursor-pointer"
                        >
                          {artists.map((artist) => (
                            <option key={artist.id} value={artist.id} className="bg-carbon text-ivory">
                              {artist.name} — {artist.specialization} ({artist.experience})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-mist">▼</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Specs & Message */}
              <div>
                <h3 className="font-serif text-lg text-cream mb-4 border-b border-white/5 pb-2">2. Sketch Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="group">
                    <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Artwork Theme/Type</label>
                    <input
                      type="text"
                      value={artworkType}
                      onChange={(e) => setArtworkType(e.target.value)}
                      required
                      className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                      placeholder="e.g. Detailed Charcoal Portrait, Krishna Sketch"
                    />
                  </div>

                  <div className="group">
                    <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Target Budget</label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                      placeholder="e.g. $400 - $600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="group">
                    <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Ideal Delivery Date</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                      className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                    />
                  </div>

                  <div className="group">
                    <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Contact Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Commission Concept & Requirements</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400 resize-none"
                    placeholder="Describe your subject, size preferences, emotion or style requests..."
                  />
                </div>
              </div>

              {/* 3. Shipping Details */}
              <div>
                <h3 className="font-serif text-lg text-cream mb-4 border-b border-white/5 pb-2">3. Physical Sketch Delivery Address</h3>
                <div className="group mb-4">
                  <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Street Address</label>
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                    placeholder="Apt, Suite, Street Address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">City</label>
                    <input
                      type="text"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      required
                      className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                      placeholder="New York"
                    />
                  </div>
                  <div className="group">
                    <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Pincode / Postal Code</label>
                    <input
                      type="text"
                      value={shippingPincode}
                      onChange={(e) => setShippingPincode(e.target.value)}
                      required
                      className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                      placeholder="10001"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Reference Image */}
              <div>
                <h3 className="font-serif text-lg text-cream mb-4 border-b border-white/5 pb-2">4. Upload Reference Photograph</h3>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-auto">
                    <label className="inline-block cursor-pointer bg-void hover:bg-gold hover:text-void border border-white/15 px-6 py-4 font-sans text-[10px] tracking-[0.2em] uppercase transition-all duration-400 text-center">
                      Choose Image File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="font-sans text-[9px] text-mist/50 mt-2">JPEG, PNG up to 10MB formats accepted.</p>
                  </div>
                  {referencePreview && (
                    <div className="relative border border-white/10 p-2 bg-void/40">
                      <img
                        src={referencePreview}
                        alt="Reference preview"
                        className="h-28 w-28 object-cover filter brightness-95"
                      />
                      <button
                        type="button"
                        onClick={() => { setReferenceFile(null); setReferencePreview(''); }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column - Premium Advance Payment Deposit Card (5 cols) */}
            <div className="lg:col-span-5 bg-carbon/40 border border-white/10 backdrop-blur-2xl p-8 sticky top-28 flex flex-col gap-6">
              <div className="mb-4">
                <p className="font-sans text-[10px] tracking-[0.3em] text-gold uppercase mb-1">Guaranteed Service</p>
                <h3 className="font-serif text-2xl text-cream font-light">Refundable Secure Deposit</h3>
              </div>

              <div className="font-sans text-xs text-mist leading-relaxed bg-void/30 p-4 border border-white/5">
                <span className="text-gold font-semibold">🔒 Verification Guarantee</span>: A minimum advance authorization of **$100.00** is required to engage the artist. If the resident artist declines or does not approve your sketch requirements, the deposit is **instantly refunded** back to your card.
              </div>

              {/* High-fidelity credit card UI */}
              <div className="relative bg-gradient-to-tr from-zinc-800 to-stone-900 border border-white/15 p-6 shadow-2xl overflow-hidden rounded-md min-h-[200px] flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-serif text-[10px] tracking-[0.2em] text-gold uppercase">ArtBro Sketched Gold Card</p>
                    <div className="w-10 h-7 bg-amber-500/20 border border-amber-500/30 rounded-sm mt-2 flex items-center justify-center">
                      <span className="text-[10px] text-amber-500">◈◈◈</span>
                    </div>
                  </div>
                  <span className="font-serif text-lg tracking-[0.2em] italic text-cream font-light">ARTBRO</span>
                </div>

                <div className="my-6">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-transparent font-mono text-lg text-cream focus:outline-none border-b border-transparent focus:border-gold/20 pb-1"
                    placeholder="4242 4242 4242 4242"
                  />
                </div>

                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <p className="font-sans text-[7px] tracking-widest text-mist uppercase">Cardholder Name</p>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      className="bg-transparent font-sans text-[10px] text-cream uppercase focus:outline-none w-full border-b border-transparent focus:border-gold/20"
                      placeholder="Sarah Jenkins"
                    />
                  </div>
                  <div>
                    <p className="font-sans text-[7px] tracking-widest text-mist uppercase">Expires</p>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="bg-transparent font-mono text-[10px] text-cream focus:outline-none w-10 border-b border-transparent"
                      placeholder="12/28"
                    />
                  </div>
                  <div>
                    <p className="font-sans text-[7px] tracking-widest text-mist uppercase">CVC</p>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="bg-transparent font-mono text-[10px] text-cream focus:outline-none w-8 border-b border-transparent"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>

              {/* Order total summary */}
              <div className="border-t border-white/10 pt-4 flex flex-col gap-2 font-sans text-xs">
                <div className="flex justify-between text-mist">
                  <span>Advance Verification Hold</span>
                  <span>$100.00</span>
                </div>
                <div className="flex justify-between text-mist">
                  <span>Processing & Upload Fees</span>
                  <span className="text-gold font-light">FREE</span>
                </div>
                <div className="flex justify-between text-cream font-serif text-sm border-t border-white/5 pt-2 mt-2">
                  <span>Total Deposit Amount</span>
                  <span className="text-gold font-semibold">$100.00</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 font-sans text-xs tracking-[0.3em] text-void uppercase bg-ivory px-10 py-4 hover:bg-gold hover:text-void transition-all duration-400 flex justify-center items-center h-[52px]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                ) : (
                  'Authorize Deposit & Request'
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
