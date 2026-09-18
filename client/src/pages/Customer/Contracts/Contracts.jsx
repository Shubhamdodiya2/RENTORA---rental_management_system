import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileCheck2,
  Calendar,
  Lock,
  Download,
  Eye,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles
} from 'lucide-react';
import api from '../../../services/api';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './Contracts.css';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

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

          return {
            id: b.id || bNum,
            contractNumber: `CTR-${bNum}`,
            orderId: bNum,
            productName: prodName,
            vendorName: vendorName,
            startDate: b.startDate,
            endDate: b.endDate,
            signDate: new Date(b.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            depositEscrowStatus: `₹${Number(b.depositAmount || b.securityDeposit || 0).toLocaleString('en-IN')} Held in Escrow`,
            damageCoverage: 'Rentora Standard Damage Protection Active',
            status: b.status === 'BOOKING_CONFIRMED' || b.status === 'ACTIVE' ? 'Active' : 'Pending'
          };
        });

        setContracts(mapped);
      })
      .catch((err) => {
        console.warn('[Contracts] Fetch error:', err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="contracts-page">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Rental Contracts & Agreements</h1>
          <p className="page-sub-heading">
            Legally binding rental agreements, equipment protection policies, and digital signature records.
          </p>
        </div>
      </div>

      {/* Escrow & Legal Protection Banner */}
      <div className="legal-protection-banner">
        <div className="banner-icon-box">
          <ShieldCheck size={32} className="text-emerald-500" />
        </div>
        <div className="banner-content">
          <h4>Rentora Master Rental Agreement Framework</h4>
          <p>
            All rental transactions are governed by standard Indian contract terms, transparent handover logs, and secure escrow holding of all refundable deposits.
          </p>
        </div>
      </div>

      {/* Contracts List / Empty State */}
      {contracts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/60 shadow-sm space-y-4 my-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold text-navy font-['Sora']">
            No Rental Contracts Found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Once you book and reserve equipment, your legally binding Master Rental Agreements and escrow protection documents will appear here automatically.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-red text-white text-xs font-bold shadow-md hover:bg-red-700 transition-all"
          >
            <Sparkles size={14} />
            <span>Browse Products & Rent</span>
          </Link>
        </div>
      ) : (
        <div className="contracts-grid">
          {contracts.map((contract) => (
            <div key={contract.id} className="contract-card">
              <div className="contract-card-header">
                <div>
                  <span className="contract-num">{contract.contractNumber}</span>
                  <div className="contract-order-ref">Linked Order: <strong>{contract.orderId}</strong></div>
                </div>
                <RentalStatusBadge status={contract.status} />
              </div>

              <div className="contract-card-body">
                <h3 className="contract-product-title">{contract.productName}</h3>

                <div className="contract-meta-list">
                  <div className="contract-meta-item">
                    <Building size={15} className="text-slate-400" />
                    <span>Vendor Partner: <strong>{contract.vendorName}</strong></span>
                  </div>
                  <div className="contract-meta-item">
                    <Calendar size={15} className="text-primary-red" />
                    <span>Rental Period: <strong>{contract.startDate} &rarr; {contract.endDate}</strong></span>
                  </div>
                  <div className="contract-meta-item">
                    <FileCheck2 size={15} className="text-secondary-blue" />
                    <span>Signed on: <strong>{contract.signDate}</strong></span>
                  </div>
                </div>

                {/* Coverage & Escrow Pill Box */}
                <div className="contract-terms-box">
                  <div className="term-row">
                    <span className="term-lbl">Deposit Escrow:</span>
                    <span className="term-val font-semibold text-emerald-600">{contract.depositEscrowStatus}</span>
                  </div>
                  <div className="term-row">
                    <span className="term-lbl">Insurance Coverage:</span>
                    <span className="term-val text-navy">{contract.damageCoverage}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="contract-card-footer">
                <button
                  onClick={() => setSelectedDoc({ type: 'contract', id: contract.orderId })}
                  className="btn-view-contract"
                >
                  <Eye size={15} />
                  <span>View Full Agreement</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Universal Document Modal */}
      {selectedDoc && (
        <DocumentModal
          type={selectedDoc.type}
          docId={selectedDoc.id}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
