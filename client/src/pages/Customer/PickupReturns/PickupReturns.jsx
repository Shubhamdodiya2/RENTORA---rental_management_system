import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  ChevronUp,
  Sparkles
} from 'lucide-react';
import api from '../../../services/api';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import RentalTimeline from '../../../components/CustomerLayout/RentalTimeline';
import './PickupReturns.css';

export default function PickupReturns() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('returns'); // 'returns' | 'completed'
  const [expandedId, setExpandedId] = useState(null);
  const [contactModalVendor, setContactModalVendor] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api.get('/bookings/my')
      .then((res) => {
        if (!isMounted) return;
        const list = res.data?.data?.results || res.data?.data?.rows || (Array.isArray(res.data?.data) ? res.data.data : []);
        
        let allBookings = Array.isArray(list) ? [...list] : [];
        try {
          const sessionSaved = sessionStorage.getItem('rentora_last_confirmed_order');
          if (sessionSaved) {
            const parsed = JSON.parse(sessionSaved);
            if (parsed && parsed.bookingNumber && !allBookings.some(b => b.bookingNumber === parsed.bookingNumber)) {
              allBookings.unshift(parsed);
            }
          }
        } catch (e) {}

        const mapped = allBookings.map((b) => {
          const item = b.items && b.items[0] ? b.items[0] : {};
          const prodName = item.product ? item.product.name : (b.productName || 'Rental Equipment');
          const vendorName = b.vendor ? b.vendor.businessName : 'Rentora Partner Store';
          const bNum = b.bookingNumber || (b.id ? b.id.slice(0, 8).toUpperCase() : 'ORD-2026');
          const isDone = b.status === 'COMPLETED' || b.status === 'RETURNED';

          return {
            id: b.id || bNum,
            orderId: bNum,
            title: prodName,
            image: (item.product?.images && item.product.images[0]?.imageUrl) || b.productImage || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
            vendor: {
              name: vendorName,
              city: b.vendor?.city || 'Ahmedabad',
              phone: b.vendor?.businessPhone || '+91 98250 12345',
              address: b.vendor?.businessAddress || 'Ahmedabad Hub'
            },
            startDate: b.startDate,
            endDate: b.endDate,
            pickupTime: '10:00 AM',
            returnTime: '06:00 PM',
            handoverType: 'Doorstep Courier Delivery & Return',
            rentalStatus: isDone ? 'Completed' : 'Active',
            daysRemaining: 2,
            currentStep: isDone ? 8 : 5
          };
        });

        setRentals(mapped);
        if (mapped.length > 0) {
          setExpandedId(mapped[0].id);
        }
      })
      .catch((err) => {
        console.warn('[PickupReturns] Fetch notice:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

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
          <span>Upcoming Returns ({rentals.filter(r => r.rentalStatus === 'Active' || r.rentalStatus === 'Return Scheduled').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`log-tab-btn ${activeTab === 'completed' ? 'log-tab-active' : ''}`}
        >
          <CheckCircle2 size={16} />
          <span>Completed Handover History ({rentals.filter(r => r.rentalStatus === 'Completed').length})</span>
        </button>
      </div>

      {/* Schedules List / Empty State */}
      {rentals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 shadow-sm space-y-4 my-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Truck size={32} />
          </div>
          <h3 className="text-xl font-bold text-navy font-['Sora']">
            No Active Pickup or Return Schedules
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When you confirm a rental booking, door-to-door courier dispatch logs and handover return schedules will automatically appear here.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-red text-white text-xs font-bold shadow-md hover:bg-red-700 transition-all"
          >
            <Sparkles size={14} />
            <span>Explore Rentals Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="schedules-list">
          {rentals.filter((r) => {
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
      )}

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
