import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  Calendar,
  Lock,
  Download,
  Eye,
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CUSTOMER_CONTRACTS } from '../../../data/customerMockData';
import RentalStatusBadge from '../../../components/CustomerLayout/RentalStatusBadge';
import DocumentModal from '../../../components/CustomerLayout/DocumentModal';
import './Contracts.css';

export default function Contracts() {
  const [selectedDoc, setSelectedDoc] = useState(null);

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

      {/* Contracts List */}
      <div className="contracts-grid">
        {CUSTOMER_CONTRACTS.map((contract) => (
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
