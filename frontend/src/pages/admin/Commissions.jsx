import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Mail, Clock, CheckCircle, XCircle, FileText, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function Commissions() {
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Fetch all commissions
  const { data: commissions = [], isLoading, isError } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: async () => {
      const { data } = await api.get('/commissions');
      return data;
    }
  });

  // Mutation to update status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.put(`/commissions/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-commissions']);
      queryClient.invalidateQueries(['dashboard-analytics']);
      if (selectedInquiry) {
        setSelectedInquiry(prev => ({ ...prev, status: mutationVariables.status }));
      }
    }
  });

  // Track the most recent variables in mutation
  let mutationVariables = {};
  const handleStatusChange = (id, status) => {
    mutationVariables = { id, status };
    updateStatusMutation.mutate({ id, status });
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
  const completedCount = commissions.filter(c => c.status === 'COMPLETED').length;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="font-serif text-4xl text-cream mb-2">Commissions & Inquiries</h1>
          <p className="font-sans text-sm text-mist/60">Review acquisition requests and negotiate custom commissioning details.</p>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <p className="font-sans text-[10px] tracking-wider text-blue-400/60 uppercase mb-2">Completed</p>
          <h3 className="font-serif text-3xl text-blue-400">{completedCount}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inquiries List */}
        <div className="lg:col-span-7 bg-carbon/20 border border-white/5 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-carbon/40">
            <h2 className="font-serif text-lg text-cream">Incoming Messages</h2>
          </div>
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
            {commissions.length === 0 ? (
              <div className="p-12 text-center text-mist/40 font-sans">No commissions or inquiries registered yet.</div>
            ) : (
              commissions.map((comm) => (
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
                        comm.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {comm.status}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-mist/60 mb-2">{comm.artworkType}</p>
                    <p className="font-sans text-xs text-mist/80 line-clamp-2">{comm.message}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-sans text-[10px] text-mist/40">{new Date(comm.createdAt).toLocaleDateString()}</span>
                    {comm.budget && <p className="font-sans text-xs text-gold/80 mt-2 font-medium">{comm.budget}</p>}
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

                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded">
                    <p className="text-mist/50 uppercase tracking-wider text-[9px] mb-1">Subject</p>
                    <p className="text-ivory font-medium truncate">{selectedInquiry.artworkType}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded">
                    <p className="text-mist/50 uppercase tracking-wider text-[9px] mb-1">Budget Preference</p>
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
                    <a href={selectedInquiry.referenceImage} target="_blank" rel="noreferrer" className="relative group block rounded overflow-hidden aspect-[4/3] border border-white/10">
                      <img src={selectedInquiry.referenceImage} alt="Reference" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-void/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <FileText size={16} className="text-gold" />
                        <span className="font-sans text-[10px] uppercase tracking-widest text-cream">View Attachment</span>
                      </div>
                    </a>
                  </div>
                )}

                <div className="border-t border-white/5 pt-6 flex flex-col gap-3">
                  <p className="font-sans text-[10px] tracking-wider text-mist/50 uppercase">Update Inquiry Action</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedInquiry.id, 'APPROVED')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-sans uppercase tracking-widest border transition-all duration-300 ${
                        selectedInquiry.status === 'APPROVED'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-transparent text-mist/70 border-white/10 hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/[0.02]'
                      }`}
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedInquiry.id, 'COMPLETED')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-sans uppercase tracking-widest border transition-all duration-300 ${
                        selectedInquiry.status === 'COMPLETED'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-transparent text-mist/70 border-white/10 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/[0.02]'
                      }`}
                    >
                      <Clock size={14} />
                      Complete
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedInquiry.id, 'REJECTED')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-sans uppercase tracking-widest border transition-all duration-300 ${
                        selectedInquiry.status === 'REJECTED'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-transparent text-mist/70 border-white/10 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.02]'
                      }`}
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
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
    </div>
  );
}
