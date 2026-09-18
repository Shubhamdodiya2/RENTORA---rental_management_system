import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Plus, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  FileText,
  User,
  ChevronRight
} from 'lucide-react';
import api from '../../../services/api';

export default function CustomerSupport() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [toast, setToast] = useState('');

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Rental Equipment Issue',
    priority: 'Medium',
    description: ''
  });

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/complaints/my');
      if (res.data?.success) {
        const list = res.data.data || [];
        setTickets(list);
        if (list.length > 0 && !selectedTicket) {
          setSelectedTicket(list[0]);
        } else if (selectedTicket) {
          const updated = list.find((t) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('[CustomerSupport] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/complaints', formData);
      if (res.data?.success) {
        setToast('Support ticket submitted successfully to Super Admin!');
        setTimeout(() => setToast(''), 4000);
        setFormData({ subject: '', category: 'Rental Equipment Issue', priority: 'Medium', description: '' });
        setCreateModalOpen(false);
        await fetchTickets();
      }
    } catch (err) {
      console.error('[CustomerSupport] Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      const res = await api.post(`/complaints/${selectedTicket.id}/messages`, { message: replyText.trim() });
      if (res.data?.success) {
        setReplyText('');
        await fetchTickets();
      }
    } catch (err) {
      console.error('[CustomerSupport] Reply error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Help & Customer Support</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Need assistance with bookings, escrow deposit refunds, or rental equipment? Submit a ticket directly to Super Admin.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Raise Support Ticket</span>
        </button>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tickets List Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Your Tickets ({tickets.length})</h3>
          
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading support tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <HelpCircle size={32} className="mx-auto text-slate-300" />
              <p className="text-xs font-medium text-slate-500">No support tickets raised yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? 'bg-blue-50/70 border-blue-300 shadow-xs' : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-blue-700">{t.ticketNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'Resolved' || t.status === 'Closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{t.description}</p>
                    <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                      <span>{new Date(t.createdAt).toLocaleDateString('en-GB')}</span>
                      <span>{t.messages?.length || 1} message(s)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ticket Details & Thread Conversation */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      selectedTicket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Status: {selectedTicket.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold font-['Sora'] text-slate-900 mt-2">{selectedTicket.subject}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Submitted on {new Date(selectedTicket.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="space-y-4 max-h-[420px] overflow-y-auto p-1">
                {(selectedTicket.messages || []).map((m, idx) => {
                  const isAdmin = m.senderRole === 'SUPER_ADMIN';
                  return (
                    <div
                      key={m.id || idx}
                      className={`p-4 rounded-2xl max-w-xl space-y-1.5 ${
                        isAdmin
                          ? 'bg-blue-50 border border-blue-200 ml-auto text-right'
                          : 'bg-slate-50 border border-slate-200/80 mr-auto text-left'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {isAdmin ? '🛡️ Super Admin Helpdesk' : `👤 ${m.sender?.fullName || 'You'}`}
                      </div>
                      <p className="text-xs text-slate-800 font-medium whitespace-pre-wrap">{m.message}</p>
                      <div className="text-[10px] text-slate-400">
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your reply to Super Admin..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send size={14} />
                  <span>Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">Select a ticket on the left to view the thread conversation.</div>
          )}
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-['Sora'] text-slate-900">Submit Support Ticket to Admin</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Topic Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none"
                >
                  <option value="Rental Equipment Issue">Rental Equipment & Dispatch Issue</option>
                  <option value="Deposit & Escrow Refund">Deposit & Escrow Refund Assistance</option>
                  <option value="Payment Verification">Payment Verification & UTR Question</option>
                  <option value="Vendor Dispute">Vendor / Store Resolution</option>
                  <option value="General Inquiry">General Marketplace Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Ticket Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deposit refund query for booking #BK-9812"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Detailed Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Please describe your problem or question in detail so Super Admin can assist you..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Submitting Ticket...' : 'Submit to Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
