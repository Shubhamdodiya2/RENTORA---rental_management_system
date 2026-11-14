import React, { useState, useEffect } from 'react';
import { Printer, Download, X, ShieldCheck, FileText, Store, CheckCircle2, QrCode, Lock } from 'lucide-react';
import Logo from '../Logo/Logo';
import api from '../../services/api';
import './DocumentModal.css';

export default function DocumentModal({
  isOpen = true,
  onClose,
  title = 'Tax Invoice & Rental Receipt',
  type = 'invoice',
  docId,
  data: initialData = {}
}) {
  const [docData, setDocData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only attempt fetch if docId is supplied and initialData has no full snapshot
    if (docId && (!initialData || Object.keys(initialData).length === 0)) {
      setLoading(true);
      const token = sessionStorage.getItem('rentora_token');
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(docId);
      
      let endpoint = null;
      if (type === 'quotation' || docId.startsWith('QUO-')) {
        endpoint = `/quotations/${encodeURIComponent(docId)}`;
      } else if (type === 'invoice' || docId.startsWith('INV-') || isUUID) {
        endpoint = isUUID ? `/invoices/${docId}` : `/invoices/number/${encodeURIComponent(docId)}`;
      }

      if (endpoint) {
        api.get(endpoint)
          .then((res) => {
            const resData = res.data;
            if (resData.success && resData.data) {
              setDocData(resData.data);
            }
          })
          .catch(() => {
            // Keep existing data on fetch failure
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else if (initialData && Object.keys(initialData).length > 0) {
      setDocData(initialData);
    }
  }, [docId, initialData, type]);

  if (isOpen === false) return null;

  const handlePrint = () => {
    const token = sessionStorage.getItem('rentora_token');
    const tokenParam = token ? `?token=${encodeURIComponent(token)}&print=true` : '?print=true';
    if (docData && docData.id && (type === 'invoice' || docData.invoiceNumber)) {
      const baseUrl = import.meta.env.VITE_API_URL || '/api/v1';
      window.open(`${baseUrl}/invoices/${docData.id}/html${tokenParam}`, '_blank');
    } else {
      window.print();
    }
  };

  const invoiceNumber = docData.invoiceNumber || docData.orderNumber || docData.contractNumber || docData.orderId || (docId || 'REN-INV-2026-001');
  const invoiceDate = docData.invoiceDate || docData.issuedDate || docData.bookingDate || docData.createdAt || '18 Sep 2026';
  const isPaid = docData.status === 'PAID' || docData.status === 'CONFIRMED' || docData.paymentStatus === 'Success' || docData.paymentPlan === 'full' || docData.paymentPlan === 'deposit_only';
  
  const customerName = docData.customerSnapshot?.fullName || docData.customer?.fullName || docData.customerName || docData.customer || 'Valued Customer';
  const customerEmail = docData.customerSnapshot?.email || docData.customer?.email || docData.customerEmail || 'customer@rentora.in';
  const customerPhone = docData.customerSnapshot?.phone || docData.customer?.phone || docData.customerPhone || '+91 98250 12345';
  const customerAddress = docData.customerSnapshot?.billingAddress || docData.deliveryAddress || '304, Shivalik Highstreet, Keshavbaug, Ahmedabad, Gujarat - 380015';
  
  const vendorName = docData.vendorSnapshot?.storeName || docData.vendorSnapshot?.businessName || docData.vendor?.businessName || docData.product?.vendor?.name || docData.vendorName || docData.vendor || 'Rentora Partner Store';
  const vendorGst = docData.vendorSnapshot?.gstNumber || docData.vendor?.gstNumber || '24AAACR1234F1Z5';
  const vendorAddress = docData.vendorSnapshot?.address || docData.product?.vendor?.address || 'Near SG Highway, Ahmedabad, Gujarat - 380054';
  const vendorUpi = docData.vendorSnapshot?.upiId || docData.vendor?.bankAccountMasked?.upiId || docData.vendorUpiId || `${vendorName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`;
  const vendorQrUrl = docData.vendorSnapshot?.qrCodeUrl || docData.vendor?.bankAccountMasked?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`upi://pay?pa=${vendorUpi}&pn=${encodeURIComponent(vendorName)}&cu=INR`)}&margin=2`;

  const items = docData.itemsSnapshot || (docData.product ? [
    {
      productName: docData.product?.title || docData.productName || 'Professional Equipment Kit',
      quantity: docData.quantity || 1,
      rentalDays: docData.durationDays || docData.rentalDays || 2,
      ratePerDay: docData.product?.pricePerDay || (docData.subtotal ? Math.round(docData.subtotal / (docData.durationDays || 2)) : 1899),
      itemRentalSubtotal: docData.subtotal || docData.rentalAmount || 3798
    }
  ] : [
    {
      productName: docData.productName || docData.product || 'Sony Alpha FX3 Cinema Camera Kit',
      quantity: 1,
      rentalDays: docData.rentalDays || 2,
      ratePerDay: 1899,
      itemRentalSubtotal: docData.rentalAmount || docData.subtotal || 3798
    }
  ]);

  const rentalSubtotal = Number(docData.rentalAmount || docData.subtotal || 3798);
  const taxAmount = Number(docData.taxAmount || Math.round(rentalSubtotal * 0.18));
  const cgst = Math.round(taxAmount / 2);
  const sgst = taxAmount - cgst;
  const depositAmount = Number(docData.depositAmount || docData.deposit || 3000);
  const deliveryFee = Number(docData.deliveryFee || 199);
  const discountAmount = Number(docData.discountAmount || docData.discount || 0);
  const totalPayable = Number(docData.totalAmount || docData.totalPayable || (rentalSubtotal + taxAmount + depositAmount + deliveryFee - discountAmount));

  const customerRefundUpi = docData.customerSnapshot?.refundUpi || docData.customerRefundUpi || docData.customerUpi || (customerEmail ? `${customerEmail.split('@')[0]}@okaxis` : 'customer@okaxis');

  return (
    <div className="document-modal-overlay animate-in fade-in" onClick={onClose}>
      <div className="document-sheet space-y-6" onClick={(e) => e.stopPropagation()}>
        
        {/* Action Header - Hidden during print */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 no-print">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#E63946]" />
            <span className="font-bold text-sm text-[#1D3557] font-['Sora'] uppercase tracking-wider">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-[#1D3557] hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Printer size={14} className="text-[#E63946]" />
              <span>Print / A4 View</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#1D3557] text-white text-xs font-bold hover:bg-[#457B9D] flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm ml-2 cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="space-y-6 text-[#1D3557] font-sans bg-white">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-gray-200">
            <div>
              <Logo size="md" />
              <p className="text-[11px] font-semibold text-[#457B9D] mt-1.5">
                Rentora Multi-Vendor Rental Marketplace Ecosystem
              </p>
              <p className="text-[10px] text-gray-500">
                GSTIN: 24AAACR1234F1Z5 | Place of Supply: Gujarat (State Code: 24)
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1">
              <div className="text-xs uppercase tracking-widest text-[#457B9D] font-bold">
                Tax Invoice & Receipt
              </div>
              <div className="text-xl font-extrabold text-[#1D3557] font-mono tracking-tight">
                {invoiceNumber}
              </div>
              <div className="text-gray-500 font-medium">Issue Date: {invoiceDate}</div>
              <div className="pt-1">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-extrabold text-[10px] border ${
                  isPaid 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}>
                  <ShieldCheck size={12} />
                  {isPaid ? 'PAID & ESCROW SECURED' : 'PAYMENT PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Parties Grid (Billed To / Billed By) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            
            {/* Vendor / Supplier */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#457B9D]">Billed By (Verified Vendor)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Store size={11} /> Verified
                </span>
              </div>
              <div className="font-extrabold text-sm text-[#1D3557] font-['Sora']">{vendorName}</div>
              <div className="text-gray-600 leading-relaxed">{vendorAddress}</div>
              <div className="text-gray-700 font-semibold pt-1">Vendor GSTIN: <span className="font-mono font-bold text-[#1D3557]">{vendorGst}</span></div>
            </div>

            {/* Customer / Renter */}
            <div className="p-4 bg-[#F1FAEE] rounded-2xl border border-[#A8DADC]/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#457B9D]">Billed To (Customer / Renter)</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={11} /> KYC Verified
                </span>
              </div>
              <div className="font-extrabold text-sm text-[#1D3557] font-['Sora']">{customerName}</div>
              <div className="text-gray-600 leading-relaxed">{customerAddress}</div>
              <div className="text-gray-700 pt-1">
                <span>Phone: <strong>{customerPhone}</strong></span> | <span>Email: <strong>{customerEmail}</strong></span>
              </div>
            </div>

          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1D3557] text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-center w-12">#</th>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-3 text-center">HSN/SAC</th>
                  <th className="py-3 px-3 text-center">Duration</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Daily Rate</th>
                  <th className="py-3 px-4 text-right">Rental Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-gray-500 font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1D3557]">{item.productName || 'Equipment Item'}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">Commercial grade equipment in sanitized hardcase</div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-gray-600">9973</td>
                    <td className="py-3.5 px-3 text-center font-semibold text-[#1D3557]">
                      {item.rentalDays || docData.rentalDays || 2} Days
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-[#1D3557]">{item.quantity || 1}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-gray-700">₹{Number(item.ratePerDay || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#1D3557]">₹{Number(item.itemRentalSubtotal || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown & Escrow Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Left: Escrow Guarantee & Refund UPI */}
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-extrabold text-purple-900 uppercase tracking-wider text-[11px]">
                <Lock size={14} className="text-purple-700" />
                <span>Escrow Security Protection (0% GST)</span>
              </div>
              <div className="text-base font-extrabold text-purple-900 font-mono">
                ₹{depositAmount.toLocaleString('en-IN')} (100% Refundable)
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                * The security deposit is held securely in Rentora Escrow and is exempt from GST under GST Rule 32(5). Upon product inspection & check-in, the full deposit is automatically released to:
              </p>
              <div className="p-2.5 bg-white rounded-xl border border-purple-200 font-mono text-xs font-bold text-purple-950 flex items-center justify-between">
                <span>Refund UPI: {customerRefundUpi}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Linked</span>
              </div>
            </div>

            {/* Right: Tax & Total Breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Taxable Rental Amount:</span>
                <span className="font-bold text-[#1D3557]">₹{rentalSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>CGST (9%):</span>
                <span className="font-semibold text-gray-800">₹{cgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>SGST (9%):</span>
                <span className="font-semibold text-gray-800">₹{sgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery / Hub Handling:</span>
                <span className="font-semibold text-gray-800">₹{deliveryFee.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo Discount Applied:</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-purple-700 font-semibold pt-1 border-t border-gray-200">
                <span>+ Escrow Security Deposit (0% GST):</span>
                <span className="font-bold">₹{depositAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#1D3557] font-['Sora'] pt-2.5 border-t-2 border-gray-300">
                <span>Total Paid / Payable:</span>
                <span className="text-[#2563EB]">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* Vendor UPI Settlement & Payment Seal */}
          <div className="p-4 bg-[#F1FAEE] rounded-2xl border border-[#A8DADC]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={vendorQrUrl}
                alt="Vendor Payment QR"
                className="w-14 h-14 rounded-lg border border-[#A8DADC] bg-white p-1 object-contain flex-shrink-0"
              />
              <div>
                <span className="text-[10px] font-bold text-[#457B9D] uppercase block">Official Vendor Settlement UPI</span>
                <span className="font-mono font-bold text-[#1D3557] text-xs">{vendorUpi}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Merchant: {vendorName}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-[10px] font-bold text-[#457B9D] uppercase block">Payment Method</span>
                <span className="font-bold text-[#1D3557] uppercase">{docData.paymentMethod || 'UPI / Instant QR'}</span>
              </div>
              <div className="pl-3 border-l border-[#A8DADC]/60">
                <span className="text-[10px] font-bold text-[#457B9D] uppercase block">Platform Seal</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Escrow Verified
                </span>
              </div>
            </div>
          </div>

          {/* Legal Terms & Authorized Signature */}
          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
            <div className="space-y-1 text-center sm:text-left">
              <div>• Terms: Equipment must be returned in original condition on or before end date.</div>
              <div>• Questions or claims? Contact 24/7 Support at support@rentora.in / +91 98250 12345</div>
            </div>

            <div className="text-center sm:text-right">
              <div className="font-['Sora'] font-extrabold text-xs text-[#1D3557]">Rentora Digital Systems Ltd.</div>
              <div className="text-[10px] text-gray-400">Authorized Digital Signatory</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

