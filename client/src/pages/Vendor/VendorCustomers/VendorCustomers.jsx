import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  Building,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import './VendorCustomers.css';

export default function VendorCustomers() {
  const { customers, orders, showToast } = useVendor();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCust, setSelectedCust] = useState(null);
  const [contactModalCust, setContactModalCust] = useState(null);

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    showToast(`Direct message sent to ${contactModalCust.name}!`, 'success');
    setContactModalCust(null);
  };

  return (
    <div className="vendor-customers-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Customer Directory & Client Accounts</h1>
          <p className="page-sub-heading">
            Audit recurring corporate film crews, freelance creators, and verified rental clients.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="v-filter-toolbar">
        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, company, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="v-card-box p-0 overflow-hidden">
        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Customer & Studio</th>
                <th>Contact Info</th>
                <th>Location</th>
                <th>Rental Frequency</th>
                <th>Total Spend</th>
                <th>Trust Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="v-table-row">
                  <td>
                    <div className="v-cust-cell">
                      <img src={c.avatar} alt={c.name} className="v-cust-thumb" />
                      <div>
                        <span className="font-bold text-navy text-xs block">{c.name}</span>
                        <span className="text-[11px] text-slate-400 font-semibold">{c.company}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-xs text-slate-600">
                      <div>{c.phone}</div>
                      <div className="text-[11px] text-slate-400">{c.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs text-navy font-semibold">{c.city}</span>
                  </td>
                  <td>
                    <span className="font-bold text-navy text-xs">{c.totalOrders} Bookings</span>
                    <span className="text-[10px] text-slate-400 block">Last: {c.lastOrderDate}</span>
                  </td>
                  <td>
                    <span className="font-extrabold text-navy text-xs">{c.totalSpending}</span>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {c.trustScore}/100 ★
                    </span>
                  </td>
                  <td>
                    <span className="v-status-badge status-active">{c.status}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedCust(c)}
                        className="btn-v-action-view"
                        title="View Rental History"
                      >
                        <Eye size={13} />
                        <span>History</span>
                      </button>
                      <button
                        onClick={() => setContactModalCust(c)}
                        className="btn-v-action-view"
                        title="Message Customer"
                      >
                        <MessageSquare size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer History Modal */}
      {selectedCust && (
        <div className="v-modal-backdrop" onClick={() => setSelectedCust(null)}>
          <div className="v-modal-card max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <div>
                <span className="font-mono text-xs font-bold text-primary-red">{selectedCust.id}</span>
                <h3 className="font-bold text-navy text-base">Client Rental Ledger & History</h3>
              </div>
              <button onClick={() => setSelectedCust(null)} className="v-modal-close">✕</button>
            </div>

            <div className="v-modal-body space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img src={selectedCust.avatar} alt={selectedCust.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
                <div>
                  <h4 className="font-bold text-navy text-sm">{selectedCust.name}</h4>
                  <p className="text-xs text-slate-500">{selectedCust.company} &bull; {selectedCust.city}</p>
                  <p className="text-xs font-semibold text-emerald-600 mt-0.5">Trust Rating: {selectedCust.trustScore}/100</p>
                </div>
              </div>

              <h4 className="font-bold text-navy text-xs uppercase tracking-wider">Lifetime Rental Record:</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block">Total Orders</span>
                  <span className="font-bold text-navy text-sm">{selectedCust.totalOrders} Bookings</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-slate-400 block">Gross Spend</span>
                  <span className="font-bold text-primary-red text-sm">{selectedCust.totalSpending}</span>
                </div>
              </div>
            </div>

            <div className="v-modal-footer">
              <button onClick={() => setSelectedCust(null)} className="btn-v-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {contactModalCust && (
        <div className="v-modal-backdrop" onClick={() => setContactModalCust(null)}>
          <div className="v-modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <h3 className="font-bold text-navy text-base">Message {contactModalCust.name}</h3>
              <button onClick={() => setContactModalCust(null)} className="v-modal-close">✕</button>
            </div>

            <form onSubmit={handleSendMessage} className="v-modal-body">
              <div className="v-form-field">
                <label className="v-form-lbl">Message Body</label>
                <textarea
                  rows={3}
                  defaultValue={`Hello ${contactModalCust.name}, your reserved equipment is ready for handover at PixelCraft Hub.`}
                  className="v-form-textarea"
                  required
                />
              </div>

              <div className="v-modal-footer p-0 pt-3 border-t">
                <button type="submit" className="btn-v-primary w-full justify-center">
                  Send Direct Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
