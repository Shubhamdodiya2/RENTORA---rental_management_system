import React, { useState } from 'react';
import {
  Truck,
  Calendar,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CUSTOMER_RENTALS } from '../../../data/customerMockData';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import RentalTimeline from '../../../components/CustomerLayout/RentalTimeline';
import './PickupReturns.css';

export default function PickupReturns() {
  const [activeTab, setActiveTab] = useState('returns'); // 'returns' | 'pickups' | 'completed'
  const [expandedId, setExpandedId] = useState('rent-002');
  const [contactModalVendor, setContactModalVendor] = useState(null);

  const activeRentals = CUSTOMER_RENTALS.filter(
    (r) => r.rentalStatus === 'Active' || r.rentalStatus === 'Return Scheduled'
  );

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="pickup-returns-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Pickup & Return Schedules</h1>
          <p className="page-sub-heading">
            Coordinate seamless logistics, verify handover checklists, and track courier dispatches.
          </p>
        </div>
      </div>

      {/* Logistics Status Tabs */}
      <div className="logistics-tabs-nav">
        <button
          onClick={() => setActiveTab('returns')}
          className={`log-tab-btn ${activeTab === 'returns' ? 'log-tab-active' : ''}`}
        >
          <Truck size={16} />
          <span>Upcoming Returns ({CUSTOMER_RENTALS.filter(r => r.rentalStatus === 'Return Scheduled' || r.rentalStatus === 'Active').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`log-tab-btn ${activeTab === 'completed' ? 'log-tab-active' : ''}`}
        >
          <CheckCircle2 size={16} />
          <span>Completed Handover History</span>
        </button>
      </div>

      {/* Schedules List */}
      <div className="schedules-list">
        {CUSTOMER_RENTALS.filter((r) => {
          if (activeTab === 'returns') return r.rentalStatus === 'Active' || r.rentalStatus === 'Return Scheduled';
          if (activeTab === 'completed') return r.rentalStatus === 'Completed';
          return true;
        }).map((item) => {
          const isExpanded = expandedId === item.id;
          const isUrgent = item.daysRemaining <= 1 && item.rentalStatus !== 'Completed';

          return (
            <div
              key={item.id}
              className={`schedule-card ${isUrgent ? 'schedule-card-urgent' : ''}`}
            >
              {/* Card Header Bar */}
              <div className="schedule-header" onClick={() => toggleExpand(item.id)}>
                <div className="schedule-header-left">
                  <img src={item.image} alt={item.title} className="schedule-thumb" />
                  <div>
                    <div className="schedule-tags-row">
                      <span className="schedule-order-num">{item.orderId}</span>
                      <RentalStatusBadge status={item.rentalStatus} size="small" />
                      {isUrgent && (
                        <span className="urgent-badge-pill">
                          <Clock size={12} />
                          <span>Action Required: Due Tomorrow</span>
                        </span>
                      )}
                    </div>
                    <h3 className="schedule-title">{item.title}</h3>
                    <div className="schedule-vendor-line">
                      Vendor: <strong>{item.vendor.name}</strong> ({item.vendor.city})
                    </div>
                  </div>
                </div>

                <div className="schedule-header-right">
                  <div className="schedule-dates-summary">
                    <span className="date-main-lbl">
                      {item.rentalStatus === 'Completed' ? 'Returned on' : 'Return Due by'}
                    </span>
                    <span className="date-main-val">{item.endDate}, {item.returnTime}</span>
                  </div>
                  <button className="btn-toggle-expand" aria-label="Toggle details">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Collapsible Timeline and Logistics Body */}
              {isExpanded && (
                <div className="schedule-body">
                  {/* 8-Step Timeline */}
                  <div className="timeline-container-box">
                    <h4 className="body-section-title">Rental Milestone Timeline</h4>
                    <RentalTimeline currentStep={item.currentStep} />
                  </div>

                  {/* Two-Column Handover Details */}
                  <div className="handover-columns-grid">
                    {/* Pickup Details Box */}
                    <div className="handover-col-box">
                      <div className="handover-col-hdr bg-blue-50">
                        <Package size={16} className="text-secondary-blue" />
                        <span>Pickup / Handover Milestone</span>
                      </div>
                      <div className="handover-col-content">
                        <div className="handover-meta-row">
                          <Calendar size={14} className="text-slate-400" />
                          <span><strong>Date:</strong> {item.startDate} ({item.pickupTime})</span>
                        </div>
                        <div className="handover-meta-row">
                          <Truck size={14} className="text-slate-400" />
                          <span><strong>Method:</strong> {item.handoverType}</span>
                        </div>
                        <div className="handover-meta-row">
                          <MapPin size={14} className="text-slate-400" />
                          <span><strong>Location:</strong> {item.vendor.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Return Details Box */}
                    <div className="handover-col-box">
                      <div className="handover-col-hdr bg-coral-50">
                        <RotateCcw size={16} className="text-primary-red" />
                        <span>Return / Drop-off Milestone</span>
                      </div>
                      <div className="handover-col-content">
                        <div className="handover-meta-row">
                          <Calendar size={14} className="text-slate-400" />
                          <span><strong>Target Return:</strong> {item.endDate} by {item.returnTime}</span>
                        </div>
                        <div className="handover-meta-row">
                          <ShieldCheck size={14} className="text-slate-400" />
                          <span><strong>Condition Check:</strong> Box, cables & power adapters required</span>
                        </div>
                        <div className="handover-meta-row">
                          <AlertTriangle size={14} className="text-amber-500" />
                          <span><strong>Late Fee Policy:</strong> Standard pro-rata daily fee applies</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Contact & Action Footer */}
                  <div className="schedule-footer-actions">
                    <button
                      onClick={() => setContactModalVendor(item.vendor)}
                      className="btn-vendor-contact"
                    >
                      <Phone size={15} />
                      <span>Contact Vendor ({item.vendor.name})</span>
                    </button>
                    <button
                      onClick={() => alert(`Return courier pickup confirmed for order ${item.orderId}. Courier will arrive at your address on ${item.endDate}.`)}
                      className="btn-schedule-courier"
                    >
                      <Truck size={15} />
                      <span>Request Courier Return Pickup</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mock Vendor Contact Modal */}
      {contactModalVendor && (
        <div className="contact-modal-backdrop" onClick={() => setContactModalVendor(null)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <div className="contact-modal-header">
              <h3>Contact Vendor Partner</h3>
              <button onClick={() => setContactModalVendor(null)} className="btn-close-modal">✕</button>
            </div>
            <div className="contact-modal-body">
              <div className="contact-vendor-card">
                <h4>{contactModalVendor.name}</h4>
                <p className="text-slate-500 text-sm">{contactModalVendor.address}</p>
                <div className="contact-phone-badge">
                  <Phone size={16} />
                  <span>{contactModalVendor.phone}</span>
                </div>
              </div>
              <div className="contact-form-group">
                <label>Send Quick Message to Vendor:</label>
                <textarea
                  rows={3}
                  defaultValue="Hello! I have a question regarding the equipment return timing tomorrow."
                  className="contact-textarea"
                />
              </div>
            </div>
            <div className="contact-modal-footer">
              <button
                onClick={() => {
                  alert(`Message sent to ${contactModalVendor.name}! They typically respond within 15 minutes.`);
                  setContactModalVendor(null);
                }}
                className="btn-send-message"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RotateCcw(props) {
  return <Truck {...props} />;
}
