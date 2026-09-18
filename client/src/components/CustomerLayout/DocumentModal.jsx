import React, { useState, useEffect } from 'react';
import { Printer, Download, X, ShieldCheck, FileText, Store, CheckCircle2 } from 'lucide-react';
import Logo from '../Logo/Logo';
import './DocumentModal.css';

export default function DocumentModal({
  isOpen = true,
  onClose,
  title = 'Tax Invoice Preview',
  type = 'invoice',
  docId,
  data: initialData = {}
}) {
  const [docData, setDocData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (docId && (!initialData || Object.keys(initialData).length === 0)) {
      setLoading(true);
      const token = localStorage.getItem('rentora_token') || sessionStorage.getItem('rentora_token');
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(docId);
      const endpoint = isUUID ? `/api/v1/invoices/${docId}` : `/api/v1/invoices/number/${encodeURIComponent(docId)}`;
      
      fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.data) {
            setDocData(resData.data);
          }
        })
        .catch(() => {
          // Keep initialData on fetch error
        })
        .finally(() => setLoading(false));
    } else if (initialData && Object.keys(initialData).length > 0) {
      setDocData(initialData);
    }
  }, [docId, initialData]);

  if (isOpen === false) return null;

  const handlePrint = () => {
    if (docData && docData.id) {
      window.open(`/api/v1/invoices/${docData.id}/html`, '_blank');
    } else {
      window.print();
    }
  };

  const invoiceNumber = docData.invoiceNumber || docData.contractNumber || docData.orderId || 'INV-2026-000001';
  const invoiceDate = docData.invoiceDate || docData.issuedDate || docData.createdAt || '18 Sep 2026';
  const isPaid = docData.status === 'PAID' || docData.paymentStatus === 'Success';
  
  const customerName = docData.customerSnapshot?.fullName || docData.customer?.fullName || docData.customer || 'Valued Customer';
  const customerEmail = docData.customerSnapshot?.email || docData.customer?.email || 'customer@rentora.in';
  const customerAddress = docData.customerSnapshot?.billingAddress || 'Ahmedabad, Gujarat';
  
  const vendorName = docData.vendorSnapshot?.storeName || docData.vendor?.businessName || docData.vendor || 'Rentora Partner Store';
  const vendorGst = docData.vendorSnapshot?.gstNumber || '24AAACR1234F1Z5';
  const vendorAddress = docData.vendorSnapshot?.address || 'Near SG Highway, Bodakdev, Ahmedabad, Gujarat';

  const items = docData.itemsSnapshot || [
    {
      productName: docData.product || docData.productName || 'Professional Equipment Kit',
      quantity: 1,
      rentalDays: docData.rentalDays || 3,
      ratePerDay: docData.rentalAmount ? (docData.rentalAmount / (docData.rentalDays || 1)) : 1899,
      itemRentalSubtotal: docData.rentalAmount || 5697
    }
  ];

  const rentalSubtotal = Number(docData.rentalAmount || docData.subtotal || 5697);
  const taxAmount = Number(docData.taxAmount || (rentalSubtotal * 0.18));
  const depositAmount = Number(docData.depositAmount || docData.deposit || 3000);
  const totalPayable = Number(docData.totalAmount || (rentalSubtotal + taxAmount + depositAmount));

  return (
    <div className="document-modal-overlay animate-in fade-in" onClick={onClose}>
      <div className="document-sheet space-y-6" onClick={(e) => e.stopPropagation()}>
        
        {/* Action Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#E63946]" />
            <span className="font-bold text-sm text-[#1D3557] font-['Sora'] uppercase tracking-wider">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-[#1D3557] hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} />
              <span>Print / A4 View</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#1D3557] text-white text-xs font-bold hover:bg-[#457B9D] flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Official Document Body */}
        <div className="space-y-6 text-[#1D3557]">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <Logo size="md" />
              <p className="text-[11px] text-[#457B9D] mt-1">
                Multi-Vendor Rental Marketplace Ecosystem | GST: 24AAACR1234F1Z5
              </p>
            </div>

            <div className="text-right sm:text-right text-xs space-y-1">
              <div className="text-xl font-extrabold text-[#1D3557] font-['Sora']">
                {invoiceNumber}
              </div>
              <div className="text-gray-500">Date: {invoiceDate}</div>
              <div className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                isPaid 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isPaid ? 'PAID & VERIFIED' : 'PAYMENT PENDING'}
              </div>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-[#F1FAEE] p-4 rounded-2xl border border-[#A8DADC]/40">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#457B9D]">Billed To (Customer)</span>
              <div className="font-bold text-sm text-[#1D3557]">{customerName}</div>
              <div className="text-gray-600">{customerAddress}</div>
              <div className="text-gray-600">{customerEmail}</div>
              <div className="text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <ShieldCheck size={13} /> Rentora Verified Customer
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#457B9D]">Vendor (Provider)</span>
              <div className="font-bold text-sm text-[#1D3557]">{vendorName}</div>
              <div className="text-gray-600">{vendorAddress}</div>
              <div className="text-gray-600">GSTIN: {vendorGst}</div>
              <div className="text-[#1D3557] font-semibold mt-1 flex items-center gap-1">
                <Store size={13} className="text-[#E63946]" /> Verified Merchant Store
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[#457B9D] uppercase text-[10px]">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-center">Duration</th>
                  <th className="py-2.5 text-right">Rate/Day</th>
                  <th className="py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-bold">{item.productName || 'Equipment Item'}</td>
                    <td className="py-3 text-center">{item.quantity || 1}</td>
                    <td className="py-3 text-center">{item.rentalDays || docData.rentalDays || 1} Days</td>
                    <td className="py-3 text-right">₹{Number(item.ratePerDay || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right font-bold">₹{Number(item.itemRentalSubtotal || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900">
              <div className="font-bold text-xs uppercase tracking-wider mb-1">Escrow Deposit (0% GST)</div>
              <div className="text-sm font-extrabold text-purple-800">₹{depositAmount.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-purple-700 mt-1">
                * Held in safe escrow and 100% refundable upon product return verification.
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-gray-600">
                <span>Taxable Rental Subtotal:</span>
                <span className="font-bold">₹{rentalSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18% Total):</span>
                <span className="font-bold">₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-purple-700">
                <span>+ Refundable Escrow Deposit:</span>
                <span className="font-bold">₹{depositAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#1D3557] font-['Sora'] pt-2 border-t">
                <span>Total Amount:</span>
                <span className="text-[#2563EB]">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 text-center leading-relaxed">
            This is an official computer-generated digital tax invoice issued via Rentora Marketplace Platform.
          </div>

        </div>

      </div>
    </div>
  );
}
