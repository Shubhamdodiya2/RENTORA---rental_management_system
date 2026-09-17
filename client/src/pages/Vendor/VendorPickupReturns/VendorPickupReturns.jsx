import React, { useState } from 'react';
import {
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Calendar,
  Search,
  Filter,
  ShieldCheck,
  Phone,
  MapPin,
  Check,
  AlertTriangle
} from 'lucide-react';
import { VENDOR_PICKUPS_RETURNS } from '../../../data/vendorMockData';
import { useVendor } from '../../../context/VendorContext';
import './VendorPickupReturns.css';

export default function VendorPickupReturns() {
  const { showToast } = useVendor();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectionTarget, setInspectionTarget] = useState(null);
  const [checklist, setChecklist] = useState({
    optics: true,
    cables: true,
    battery: true,
    scratches: false
  });

  const filteredLogs = VENDOR_PICKUPS_RETURNS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.orderId.toLowerCase().includes(q) ||
      item.customer.toLowerCase().includes(q) ||
      item.product.toLowerCase().includes(q)
    );
  });

  const handleApproveInspection = () => {
    showToast(`Return verified for ${inspectionTarget.orderId}! Security deposit release authorized.`, 'success');
    setInspectionTarget(null);
  };

  return (
    <div className="vendor-pickup-returns-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Pickup & Return Logistics Hub</h1>
          <p className="page-sub-heading">
            Coordinate courier dispatches, manage store handovers, and execute return inspection checklists.
          </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="logistics-stats-grid">
        <div className="v-stat-card">
          <span className="v-stat-title">Scheduled Pickups</span>
          <div className="v-stat-val text-navy">2</div>
          <span className="text-[11px] text-slate-500 font-medium">Staged for customer collection</span>
        </div>

        <div className="v-stat-card">
          <span className="v-stat-title">Dispatched Today</span>
          <div className="v-stat-val text-secondary-blue">1</div>
          <span className="text-[11px] text-secondary-blue font-medium">Under courier transit</span>
        </div>

        <div className="v-stat-card">
          <span className="v-stat-title">Upcoming Returns</span>
          <div className="v-stat-val text-amber-600">2</div>
          <span className="text-[11px] text-amber-600 font-semibold">Due within 48 hours</span>
        </div>

        <div className="v-stat-card">
          <span className="v-stat-title">Verified Returns (Sep)</span>
          <div className="v-stat-val text-emerald-600">18</div>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Deposit Refunded</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="v-filter-toolbar">
        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search order ref, customer name, gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>
      </div>

      {/* Logistics Table */}
      <div className="v-card-box p-0 overflow-hidden">
        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Log Ref & Order</th>
                <th>Milestone Type</th>
                <th>Customer & Address</th>
                <th>Equipment Product</th>
                <th>Scheduled Date & Time</th>
                <th>Logistics Mode</th>
                <th>Status</th>
                <th>Inspection Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((item) => (
                <tr key={item.id} className="v-table-row">
                  <td>
                    <span className="font-mono font-bold text-navy text-xs bg-slate-100 px-2 py-1 rounded">
                      {item.orderId}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.id}</div>
                  </td>
                  <td>
                    <span className="font-semibold text-xs text-navy flex items-center gap-1.5">
                      {item.type.includes('Pickup') ? (
                        <Truck size={14} className="text-secondary-blue" />
                      ) : (
                        <RotateCcw size={14} className="text-primary-red" />
                      )}
                      <span>{item.type}</span>
                    </span>
                  </td>
                  <td>
                    <div className="text-xs">
                      <span className="font-bold text-navy block">{item.customer}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[180px] block">{item.address}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-navy max-w-xs block">
                      {item.product}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600 font-bold block">{item.date}</span>
                    <span className="text-[11px] text-slate-400">{item.time}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-600 font-medium">{item.mode}</span>
                  </td>
                  <td>
                    <span
                      className={`v-status-badge ${
                        item.status.includes('Verified')
                          ? 'status-active'
                          : item.status === 'Dispatched'
                          ? 'status-confirmed'
                          : 'status-processing'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setInspectionTarget(item)}
                      className="btn-v-action-view"
                      title="Inspect & Check"
                    >
                      <ShieldCheck size={14} />
                      <span>Verify</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Handover & Quality Inspection Modal */}
      {inspectionTarget && (
        <div className="v-modal-backdrop" onClick={() => setInspectionTarget(null)}>
          <div className="v-modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <div>
                <span className="font-mono text-xs font-bold text-primary-red">{inspectionTarget.orderId}</span>
                <h3 className="font-bold text-navy text-base">QC Inspection & Checklist</h3>
              </div>
              <button onClick={() => setInspectionTarget(null)} className="v-modal-close">✕</button>
            </div>

            <div className="v-modal-body space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="text-slate-400 block">Product:</span>
                <span className="font-bold text-navy">{inspectionTarget.product}</span>
                <span className="text-slate-400 block mt-2">Customer:</span>
                <span className="font-semibold text-navy">{inspectionTarget.customer}</span>
              </div>

              <h4 className="font-bold text-navy text-xs uppercase tracking-wider">Verification Steps:</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.optics}
                    onChange={() => setChecklist({ ...checklist, optics: !checklist.optics })}
                    className="accent-primary-red"
                  />
                  <span>Optical Glass / Sensor Cleanliness & Scratch Check</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.cables}
                    onChange={() => setChecklist({ ...checklist, cables: !checklist.cables })}
                    className="accent-primary-red"
                  />
                  <span>All cables, power adapters & packaging cases returned</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.battery}
                    onChange={() => setChecklist({ ...checklist, battery: !checklist.battery })}
                    className="accent-primary-red"
                  />
                  <span>Power on test & firmware functional verification</span>
                </label>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                <strong>Escrow Release:</strong> Approving this handover authorizes automatic instant refund of the customer’s security deposit.
              </div>
            </div>

            <div className="v-modal-footer">
              <button onClick={() => setInspectionTarget(null)} className="btn-v-secondary">
                Cancel
              </button>
              <button onClick={handleApproveInspection} className="btn-v-primary">
                <Check size={14} />
                <span>Approve & Release Escrow</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
