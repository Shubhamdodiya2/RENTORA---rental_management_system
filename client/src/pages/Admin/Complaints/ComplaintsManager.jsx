import React, { useState, useMemo } from 'react';
import {
  MessageSquareWarning,
  Search,
  Filter,
  User,
  Store,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  MoreVertical,
  Paperclip,
  Tag
} from 'lucide-react';
import { SearchBar, StatusBadge, PriorityBadge, EmptyState } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function ComplaintsManager() {
  const {
    complaints,
    replyComplaint,
    updateComplaintStatus,
    assignComplaintStaff,
    updateComplaintPriority,
    showToast
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicketId, setSelectedTicketId] = useState(complaints[0]?.id || null);
  const [replyText, setReplyText] = useState('');

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return complaints.filter((c) => {
      const ticketNo = (c.ticketNumber || c.id || '').toLowerCase();
      const raisedBy = (c.raisedBy || c.customerName || '').toLowerCase();
      const subject = (c.subject || '').toLowerCase();
      const relatedOrder = (c.relatedOrder || c.orderNumber || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch =
        ticketNo.includes(q) ||
        raisedBy.includes(q) ||
        subject.includes(q) ||
        relatedOrder.includes(q);

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [complaints, searchQuery, statusFilter, priorityFilter]);

  const selectedTicket = complaints.find((c) => c.id === selectedTicketId) || filteredTickets[0] || null;

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    replyComplaint(selectedTicket.id, replyText);
    setReplyText('');
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedTicket) return;
    updateComplaintStatus(selectedTicket.id, newStatus);
  };

  const handlePriorityChange = (newPriority) => {
    if (!selectedTicket) return;
    updateComplaintPriority(selectedTicket.id, newPriority);
  };

  const handleStaffChange = (newStaff) => {
    if (!selectedTicket) return;
    assignComplaintStaff(selectedTicket.id, newStaff);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Support Tickets & Complaints</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage disputes, customer help requests, rental extensions, and vendor support tickets in one shared inbox.
          </p>
        </div>
      </div>

      {/* Main Split-Pane Support Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        
        {/* Left 5 Cols: Ticket Inbox Queue */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col space-y-4">
          
          {/* Filters */}
          <div className="space-y-2.5">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search ticket #, subject, customer..."
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Response">Waiting</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer transition-all"
              >
                <option value="all">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-slate-50 border-slate-400 shadow-xs'
                        : 'bg-white border-slate-200/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-900 font-mono">{ticket.ticketNumber}</span>
                      <PriorityBadge priority={ticket.priority} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-1 font-['Sora']">{ticket.subject}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {ticket.raisedBy} ({ticket.userType})
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 mt-1 border-t border-slate-100">
                      <span>Order: {ticket.relatedOrder}</span>
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">No tickets found.</p>
            )}
          </div>
        </div>

        {/* Right 7 Cols: Detailed Ticket Thread & Reply Center */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between space-y-4">
          {selectedTicket ? (
            <>
              {/* Ticket Top Meta */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 font-mono">{selectedTicket.ticketNumber}</span>
                      <PriorityBadge priority={selectedTicket.priority} />
                      <StatusBadge status={selectedTicket.status} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold font-['Sora'] text-slate-900 mt-1">
                      {selectedTicket.subject}
                    </h3>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting for Response">Waiting</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Metadata Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-600">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Raised By</span>
                    <strong className="text-slate-800">{selectedTicket.raisedBy} ({selectedTicket.userType})</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Related Ref</span>
                    <strong className="text-slate-900 font-mono">{selectedTicket.relatedOrder}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Assigned Staff</span>
                    <strong className="text-slate-800">{selectedTicket.assignedStaff}</strong>
                  </div>
                </div>
              </div>

              {/* Message History Thread */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[340px] my-2">
                {selectedTicket.messages?.map((msg, idx) => {
                  const sRole = typeof msg.role === 'string' ? msg.role : 'User';
                  const sName = typeof msg.sender === 'string' ? msg.sender : (msg.sender?.fullName || 'User');
                  const sText = typeof msg.text === 'string' ? msg.text : (typeof msg.message === 'string' ? msg.message : '');
                  const sTime = typeof msg.time === 'string' ? msg.time : '';
                  const isAdmin = sRole === 'Super Admin' || sRole.includes('Admin') || sName.toLowerCase().includes('admin');

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        <span className="font-semibold text-slate-700">{sName}</span>
                        <span>•</span>
                        <span>{sRole}</span>
                        {sTime && (
                          <>
                            <span>•</span>
                            <span>{sTime}</span>
                          </>
                        )}
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-xs'
                        }`}
                      >
                        {sText}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Composer */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="Type an official Super Admin response or mediation resolution..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 text-slate-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs flex-shrink-0"
                >
                  <span>Reply</span>
                  <Send size={13} />
                </button>
              </form>
            </>
          ) : (
            <EmptyState
              icon={MessageSquareWarning}
              title="Select a ticket to inspect conversation"
              description="Choose any support ticket from the left pane."
            />
          )}
        </div>

      </div>

    </div>
  );
}
