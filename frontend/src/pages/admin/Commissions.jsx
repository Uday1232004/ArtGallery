import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { resolveImageUrl } from '../../lib/axios';
import { Mail, Clock, CheckCircle, XCircle, FileText, Calendar, IndianRupee, ShieldAlert, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Commissions() {
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  
  // Negotiation Modal States
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [negotiatedDeadline, setNegotiatedDeadline] = useState('');

  // Status & Notes Modal States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch all commissions
  const { data: commissions = [], isLoading, isError } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: async () => {
      const { data } = await api.get('/commissions');
      return data;
    }
  });

  // Mutation to update status and notes
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, finalPrice, submissionDate, adminNotes }) => {
      const { data } = await api.put(`/commissions/${id}/status`, { 
        status, 
        finalPrice, 
        submissionDate,
        adminNotes
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-commissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      setSelectedInquiry(data);
      setShowApproveModal(false);
      setShowStatusModal(false);
      setNegotiatedPrice('');
      setNegotiatedDeadline('');
      setAdminNotes('');
    }
  });

  const handleStatusChange = (id, status) => {
    if (status === 'APPROVED') {
      setShowApproveModal(true);
      setAdminNotes(selectedInquiry?.adminNotes || '');
    } else {
      setTargetStatus(status);
      setAdminNotes(selectedInquiry?.adminNotes || '');
      setShowStatusModal(true);
    }
  };

  const handleApproveSubmit = (e) => {
    e.preventDefault();
    if (!negotiatedPrice || !negotiatedDeadline) {
      alert('Please define both the Final Negotiated Price and Submission Deadline.');
      return;
    }
    updateStatusMutation.mutate({
      id: selectedInquiry.id,
      status: 'APPROVED',
      finalPrice: parseFloat(negotiatedPrice),
      submissionDate: negotiatedDeadline,
      adminNotes: adminNotes
    });
  };

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    updateStatusMutation.mutate({
      id: selectedInquiry.id,
      status: targetStatus,
      adminNotes: adminNotes
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 w-full h-full animate-pulse">
        <div className="h-10 bg-white/5 w-1/4 rounded"></div>
        <div className="h-64 bg-white/5 rounded-lg border border-white/5"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-400 font-sans p-6 bg-red-950/20 border border-red-500/20 rounded">Failed to load commission records. Please verify database connectivity.</div>;
  }

  const pendingCount = commissions.filter(c => c.status === 'PENDING').length;
  const approvedCount = commissions.filter(c => c.status === 'APPROVED').length;
  const inProgressCount = commissions.filter(c => c.status === 'IN_PROGRESS').length;
  const completedCount = commissions.filter(c => c.status === 'COMPLETED').length;

  const filteredCommissions = statusFilter === 'ALL'
    ? commissions
    : commissions.filter(c => c.status === statusFilter);

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="font-serif text-4xl text-cream mb-2">Commissions & Inquiries</h1>
          <p className="font-sans text-sm text-mist/60">Review acquisition requests and negotiate custom commissioning details.</p>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-carbon/40 border border-white/5 p-6 rounded-lg">
          <p className="font-sans text-[10px] tracking-wider text-mist/60 uppercase mb-2">Total Received</p>
          <h3 className="font-serif text-3xl text-cream">{commissions.length}</h3>
        </div>
        <div className="bg-carbon/40 border border-white/5 p-6 rounded-lg">
          <p className="font-sans text-[10px] tracking-wider text-gold/60 uppercase mb-2">Pending</p>
          <h3 className="font-serif text-3xl text-gold">{pendingCount}</h3>
        </div>
        <div className="bg-carbon/40 border border-white/5 p-6 rounded-lg">
          <p className="font-sans text-[10px] tracking-wider text-green-400/60 uppercase mb-2">Approved</p>
          <h3 className="font-serif text-3xl text-green-400">{approvedCount}</h3>
        </div>
        <div className="bg-carbon/40 border border-white/5 p-6 rounded-lg">
          <p className="font-sans text-[10px] tracking-wider text-amber-400/60 uppercase mb-2">In Progress</p>
          <h3 className="font-serif text-3xl text-amber-400">{inProgressCount}</h3>
        </div>
        <div className="bg-carbon/40 border border-white/5 p-6 rounded-lg">
          <p className="font-sans text-[10px] tracking-wider text-blue-400/60 uppercase mb-2">Completed</p>
          <h3 className="font-serif text-3xl text-blue-400">{completedCount}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inquiries List */}
        <div className="lg:col-span-7 bg-carbon/20 border border-white/5 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-carbon/40 flex flex-col gap-4">
            <h2 className="font-serif text-lg text-cream">Incoming Messages</h2>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'REFUNDED'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 text-[9px] uppercase tracking-wider transition-all duration-300 font-sans border ${
                    statusFilter === filter
                      ? 'bg-gold border-gold text-void font-bold'
                      : 'bg-void/50 text-mist/60 hover:text-cream border-white/10'
                  }`}
                >
                  {filter === 'IN_PROGRESS' ? 'In Progress' : filter}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {filteredCommissions.length === 0 ? (
              <div className="p-12 text-center text-mist/40 font-sans">No commissions matching filter found.</div>
            ) : (
              filteredCommissions.map((comm) => (
                <button
                  key={comm.id}
                  onClick={() => setSelectedInquiry(comm)}
                  className={`w-full text-left p-6 transition-all duration-300 hover:bg-white/[0.02] flex items-start justify-between gap-4 ${
                    selectedInquiry?.id === comm.id ? 'bg-white/[0.03] border-l-2 border-gold' : 'border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-serif text-base text-cream truncate">{comm.clientName}</h4>
                      <span className={`px-2 py-0.5 text-[8px] uppercase tracking-wider rounded-sm ${
                        comm.status === 'PENDING' ? 'bg-gold/20 text-gold' :
                        comm.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                        comm.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400' :
                        comm.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {comm.status === 'IN_PROGRESS' ? 'In Progress' : comm.status}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-mist/60 mb-2">Subject: {comm.artworkType}</p>
                    <p className="font-sans text-xs text-mist/85 line-clamp-2">{comm.message}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-sans text-[10px] text-mist/40">{new Date(comm.createdAt).toLocaleDateString()}</span>
                    {comm.budget && <p className="font-sans text-xs text-gold/80 mt-2 font-medium">Budget: {comm.budget}</p>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Inquiry Detailed Card Viewer */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedInquiry ? (
              <motion.div
                key={selectedInquiry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-carbon/30 border border-white/10 rounded-lg p-6 flex flex-col gap-6 relative"
              >
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <h3 className="font-serif text-xl text-cream mb-1">{selectedInquiry.clientName}</h3>
                    <div className="flex items-center gap-2 text-xs text-mist/60">
                      <Mail size={12} />
                      <a href={`mailto:${selectedInquiry.email}`} className="hover:text-gold transition-colors">{selectedInquiry.email}</a>
                    </div>
                  </div>
                  <span className="text-[10px] font-sans text-mist/40">{new Date(selectedInquiry.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Shipping & Contact details Display */}
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded text-xs font-sans space-y-2">
                  <p className="text-mist/50 uppercase tracking-wider text-[9px] font-semibold">Shipping & Contact Details</p>
                  <p className="text-ivory"><strong>Client Phone</strong>: {selectedInquiry.phone || 'N/A'}</p>
                  <p className="text-ivory"><strong>Address</strong>: {selectedInquiry.shippingAddress}, {selectedInquiry.shippingCity} - {selectedInquiry.shippingPincode}</p>
                </div>

                {/* Refundable Advance authorization Display */}
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded text-xs font-sans flex justify-between items-center">
                  <div>
                    <p className="text-mist/50 uppercase tracking-wider text-[9px] mb-0.5">Advance Authorization</p>
                    <p className="text-gold font-medium font-serif">₹{selectedInquiry.advanceAmount || '100.00'}</p>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 text-[8px] uppercase tracking-wider rounded-sm ${
                      selectedInquiry.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      Deposit: {selectedInquiry.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Approved Terms Display */}
                {selectedInquiry.status === 'APPROVED' && (
                  <div className="bg-green-500/10 border border-green-500/25 p-4 rounded text-xs font-sans space-y-2">
                    <p className="text-green-400 uppercase tracking-wider text-[9px] font-bold">Negotiated Terms</p>
                    <p className="text-ivory"><strong>Final Agreed Price</strong>: <span className="text-gold font-semibold">₹{selectedInquiry.finalPrice}</span></p>
                    <p className="text-ivory"><strong>Submission/Delivery Date</strong>: {new Date(selectedInquiry.submissionDate).toLocaleDateString()}</p>
                  </div>
                )}

                {/* Display current admin notes if they exist */}
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded text-xs font-sans space-y-2">
                  <p className="text-mist/50 uppercase tracking-wider text-[9px] font-semibold">Artist / Admin Notes to Client</p>
                  {selectedInquiry.adminNotes ? (
                    <p className="text-ivory whitespace-pre-wrap">{selectedInquiry.adminNotes}</p>
                  ) : (
                    <p className="text-mist/40 italic">No notes provided yet.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded">
                    <p className="text-mist/50 uppercase tracking-wider text-[9px] mb-1">Subject</p>
                    <p className="text-ivory font-medium truncate">{selectedInquiry.artworkType}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded">
                    <p className="text-mist/50 uppercase tracking-wider text-[9px] mb-1">Target Budget</p>
                    <p className="text-gold font-medium">{selectedInquiry.budget || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <p className="font-sans text-[10px] tracking-wider text-mist/50 uppercase mb-2">Message</p>
                  <div className="bg-void/50 border border-white/5 p-4 rounded text-sm text-mist/90 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-sans">
                    {selectedInquiry.message}
                  </div>
                </div>

                {selectedInquiry.referenceImage && (
                  <div>
                    <p className="font-sans text-[10px] tracking-wider text-mist/50 uppercase mb-2">Attached Design / Reference</p>
                    <a href={resolveImageUrl(selectedInquiry.referenceImage)} target="_blank" rel="noreferrer" className="relative group block rounded overflow-hidden aspect-[4/3] border border-white/10">
                      <img src={resolveImageUrl(selectedInquiry.referenceImage)} alt="Reference" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-void/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <FileText size={16} className="text-gold" />
                        <span className="font-sans text-[10px] uppercase tracking-widest text-cream">View Attachment</span>
                      </div>
                    </a>
                  </div>
                )}

                {/* Direct Notes Update Input */}
                <div className="border-t border-white/5 pt-4">
                  <label className="block font-sans text-[10px] tracking-wider text-mist/50 uppercase mb-2">Quick Update Artist Notes</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. Need better reference image..."
                      defaultValue={selectedInquiry.adminNotes || ''}
                      id={`notes-input-${selectedInquiry.id}`}
                      className="flex-1 bg-void/50 border border-white/10 px-3 py-2 font-sans text-xs text-ivory focus:outline-none focus:border-gold"
                    />
                    <button
                      onClick={() => {
                        const noteVal = document.getElementById(`notes-input-${selectedInquiry.id}`)?.value || '';
                        updateStatusMutation.mutate({
                          id: selectedInquiry.id,
                          status: selectedInquiry.status,
                          adminNotes: noteVal
                        });
                      }}
                      className="px-4 py-2 bg-gold text-void font-sans text-[9px] uppercase tracking-wider font-bold transition-all duration-300"
                    >
                      Save Note
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 flex flex-col gap-3">
                  <p className="font-sans text-[10px] tracking-wider text-mist/50 uppercase">Update Inquiry Status</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInquiry.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(selectedInquiry.id, 'APPROVED')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-sans uppercase tracking-widest border transition-all duration-300 bg-transparent text-mist/70 border-white/10 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/[0.02]"
                        >
                          <CheckCircle size={14} />
                          Approve & Price
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedInquiry.id, 'REJECTED')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-sans uppercase tracking-widest border transition-all duration-300 bg-transparent text-mist/70 border-white/10 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.02]"
                        >
                          <XCircle size={14} />
                          Reject Request
                        </button>
                      </>
                    )}

                    {selectedInquiry.status === 'APPROVED' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(selectedInquiry.id, 'IN_PROGRESS')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-sans uppercase tracking-widest border transition-all duration-300 bg-transparent text-mist/70 border-white/10 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/[0.02]"
                        >
                          <Clock size={14} />
                          Start Work
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedInquiry.id, 'REJECTED')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-sans uppercase tracking-widest border transition-all duration-300 bg-transparent text-mist/70 border-white/10 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.02]"
                        >
                          <XCircle size={14} />
                          Reject & Refund
                        </button>
                      </>
                    )}

                    {selectedInquiry.status === 'IN_PROGRESS' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(selectedInquiry.id, 'COMPLETED')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-sans uppercase tracking-widest border transition-all duration-300 bg-transparent text-mist/70 border-white/10 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/[0.02]"
                        >
                          <CheckCircle size={14} />
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleStatusChange(selectedInquiry.id, 'REJECTED')}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-sans uppercase tracking-widest border transition-all duration-300 bg-transparent text-mist/70 border-white/10 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.02]"
                        >
                          <XCircle size={14} />
                          Reject & Refund
                        </button>
                      </>
                    )}

                    {selectedInquiry.status === 'REJECTED' && (
                      <button
                        onClick={() => handleStatusChange(selectedInquiry.id, 'REFUNDED')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-sans uppercase tracking-widest border transition-all duration-300 bg-transparent text-mist/70 border-white/10 hover:text-gold hover:border-gold/30 hover:bg-gold/[0.02]"
                      >
                        <XCircle size={14} />
                        Confirm Refunded
                      </button>
                    )}

                    {(selectedInquiry.status === 'COMPLETED' || selectedInquiry.status === 'REFUNDED') && (
                      <p className="font-sans text-[10px] text-mist/40 italic text-center w-full">This commission status is finalized ({selectedInquiry.status}).</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-carbon/10 border border-white/5 border-dashed rounded-lg p-12 text-center text-mist/40 font-sans">
                Select an inquiry from the listing to review details and take actions.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* APPROVAL & TERMS NEGOTIATION MODAL */}
      {showApproveModal && selectedInquiry && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-carbon border border-white/10 p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="font-serif text-2xl text-cream mb-2">Set Commission Terms</h3>
            <p className="font-sans text-xs text-mist/60 mb-6">Specify the final price and deadline before sending validation back to the collector.</p>

            <form onSubmit={handleApproveSubmit} className="flex flex-col gap-6">
              <div className="group">
                <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Final Agreed Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-semibold">₹</span>
                  <input
                    type="number"
                    value={negotiatedPrice}
                    onChange={(e) => setNegotiatedPrice(e.target.value)}
                    required
                    min="1"
                    className="w-full bg-void/50 border border-white/10 pl-8 pr-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                    placeholder="500.00"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Target Submission Date</label>
                <input
                  type="date"
                  value={negotiatedDeadline}
                  onChange={(e) => setNegotiatedDeadline(e.target.value)}
                  required
                  className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400"
                />
              </div>

              <div className="group">
                <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Artist Notes / Client Updates</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Terms approved. Beginning preparation..."
                  className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400 resize-none h-20"
                />
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 py-3 border border-white/10 hover:bg-white/5 font-sans text-[10px] tracking-widest text-cream uppercase transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isLoading}
                  className="flex-1 py-3 bg-gold text-void font-sans text-[10px] tracking-widest uppercase font-semibold hover:bg-gold/80 transition-all duration-300"
                >
                  Confirm Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTHER STATUS TRANSITIONS MODAL */}
      {showStatusModal && selectedInquiry && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-carbon border border-white/10 p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="font-serif text-2xl text-cream mb-2">Transition Status</h3>
            <p className="font-sans text-xs text-mist/60 mb-6">Transitioning status to: <strong className="text-gold">{targetStatus}</strong></p>

            <form onSubmit={handleStatusSubmit} className="flex flex-col gap-6">
              <div className="group">
                <label className="block font-sans text-[10px] tracking-[0.2em] text-mist uppercase mb-2">Update Artist Notes (Optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes, shipped tracking codes, or change request info..."
                  className="w-full bg-void/50 border border-white/10 px-4 py-3 font-sans text-sm text-ivory focus:outline-none focus:border-gold transition-colors duration-400 resize-none h-32"
                />
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 py-3 border border-white/10 hover:bg-white/5 font-sans text-[10px] tracking-widest text-cream uppercase transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isLoading}
                  className="flex-1 py-3 bg-gold text-void font-sans text-[10px] tracking-widest uppercase font-semibold hover:bg-gold/80 transition-all duration-300"
                >
                  Confirm Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
