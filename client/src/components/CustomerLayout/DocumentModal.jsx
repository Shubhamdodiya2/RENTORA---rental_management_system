import React from 'react';
import { Printer, Download, X, ShieldCheck, CheckCircle2, FileText, Store } from 'lucide-react';
import Logo from '../Logo/Logo';
import './DocumentModal.css';

export default function DocumentModal({ isOpen, onClose, title = 'Document Preview', type = 'invoice', data = {} }) {
  if (!isOpen) return null;

  return (
    <div className="document-modal-overlay animate-in fade-in" onClick={onClose}>
      <div className="document-sheet space-y-6" onClick={(e) => e.stopPropagation()}>
        
        {/* Action Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#E63946]" />
            <span className="font-bold text-sm text-[#1D3557] font-['Sora'] uppercase tracking-wider">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-[#1D3557] hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button
              onClick={() => alert(`Downloading official ${type} PDF...`)}
              className="px-3 py-1.5 rounded-xl bg-[#1D3557] text-white text-xs font-bold hover:bg-[#457B9D] flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm ml-2"
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
                India's Multi-Vendor Rental Marketplace Ecosystem
              </p>
            </div>

            <div className="text-right sm:text-right text-xs space-y-1">
              <div className="text-xl font-extrabold text-[#1D3557] font-['Sora']">{data.invoiceNumber || data.contractNumber || data.quotationNumber || 'DOC-2026-9814'}</div>
              <div className="text-gray-500">Date: {data.invoiceDate || data.signDate || data.dates || '16 Sep 2026'}</div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                {data.status || 'Verified & Active'}
              </div>
            </div>
          </div>

          {/* Parties Grid (Renter & Vendor) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-[#F1FAEE] p-4 rounded-2xl border border-[#A8DADC]/40">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#457B9D]">Renter (Customer)</span>
              <div className="font-bold text-sm text-[#1D3557]">Alex Patel</div>
              <div className="text-gray-600">402, Shivalik Highstreet, Bodakdev, Ahmedabad</div>
              <div className="text-gray-600">+91 98250 44882 • alex.patel@creativestudio.in</div>
              <div className="text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <ShieldCheck size={13} /> Aadhaar KYC Verified
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#457B9D]">Rental Vendor</span>
              <div className="font-bold text-sm text-[#1D3557]">{data.vendor || data.vendorName || 'PixelCraft Rentals'}</div>
              <div className="text-gray-600">Near SG Highway, Bodakdev, Ahmedabad, Gujarat</div>
              <div className="text-gray-600">GSTIN: 24AAACP9812K1Z5 • support@pixelcraft.in</div>
              <div className="text-[#1D3557] font-semibold mt-1 flex items-center gap-1">
                <Store size={13} className="text-[#E63946]" /> Verified Merchant
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[#457B9D] uppercase text-[10px]">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5">Duration</th>
                  <th className="py-2.5 text-right">Rate</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 font-bold">{data.product || data.productName || 'Sony Alpha FX3 Cinema Camera Kit'}</td>
                  <td className="py-3 text-gray-600">{data.duration || '3 Days'}</td>
                  <td className="py-3 text-right">₹1,899 / day</td>
                  <td className="py-3 text-right font-bold">₹{data.subtotal ? data.subtotal.toLocaleString('en-IN') : '5,697'}</td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-600">Refundable Security Deposit (Escrow Protected)</td>
                  <td className="py-3 text-gray-600">Held during rental</td>
                  <td className="py-3 text-right">-</td>
                  <td className="py-3 text-right font-bold text-emerald-700">₹{data.deposit ? data.deposit.toLocaleString('en-IN') : '3,000'}</td>
                </tr>
                {data.delivery > 0 && (
                  <tr>
                    <td className="py-3 text-gray-600">Express Doorstep Delivery & Pickup</td>
                    <td className="py-3 text-gray-600">Ahmedabad Hub</td>
                    <td className="py-3 text-right">-</td>
                    <td className="py-3 text-right font-bold">₹{data.delivery}</td>
                  </tr>
                )}
                {data.discount > 0 && (
                  <tr>
                    <td className="py-3 text-emerald-600 font-bold">Promo Voucher Discount (RENT500)</td>
                    <td className="py-3 text-emerald-600">-</td>
                    <td className="py-3 text-right">-</td>
                    <td className="py-3 text-right font-bold text-emerald-600">-₹{data.discount}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Box */}
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-gray-600">
                <span>Net Total:</span>
                <span className="font-bold">₹{data.total ? data.total.toLocaleString('en-IN') : '8,396'}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Deposit (Refundable):</span>
                <span className="font-bold">₹{data.deposit ? data.deposit.toLocaleString('en-IN') : '3,000'}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#1D3557] font-['Sora'] pt-2 border-t">
                <span>Total Paid:</span>
                <span className="text-[#E63946]">₹{data.total ? data.total.toLocaleString('en-IN') : '8,396'}</span>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 text-center leading-relaxed">
            This is a computer-generated digital legal agreement verified by Rentora Technologies Escrow. All deposits are governed by Gujarat Jurisdiction Rental Acts.
          </div>

        </div>

      </div>
    </div>
  );
}
