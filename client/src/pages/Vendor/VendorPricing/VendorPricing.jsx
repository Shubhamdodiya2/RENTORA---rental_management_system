import React, { useState } from 'react';
import {
  Tag,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Percent,
  Check,
  Edit2,
  Save,
  Sparkles,
  Info
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import './VendorPricing.css';

export default function VendorPricing() {
  const { products, updateProduct, showToast } = useVendor();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editRate, setEditRate] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [editDeposit, setEditDeposit] = useState('');

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkPercent, setBulkPercent] = useState(10);
  const [bulkAction, setBulkAction] = useState('increase'); // 'increase' | 'decrease'

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditRate(p.pricePerDay);
    setEditDiscount(p.discountPrice || '');
    setEditDeposit(p.securityDeposit || '');
  };

  const handleSaveInline = (id) => {
    updateProduct(id, {
      pricePerDay: Number(editRate),
      discountPrice: editDiscount ? Number(editDiscount) : null,
      securityDeposit: Number(editDeposit)
    });
    setEditingId(null);
    showToast('Rental pricing updated successfully!', 'success');
  };

  const handleApplyBulk = () => {
    const factor = bulkAction === 'increase' ? (1 + bulkPercent / 100) : (1 - bulkPercent / 100);
    products.forEach((p) => {
      const newPrice = Math.round(p.pricePerDay * factor);
      updateProduct(p.id, { pricePerDay: newPrice });
    });
    setBulkModalOpen(false);
    showToast(`Bulk pricing adjusted (${bulkAction === 'increase' ? '+' : '-'}${bulkPercent}%) across all products!`, 'success');
  };

  return (
    <div className="vendor-pricing-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Rental Pricing & Rate Cards</h1>
          <p className="page-sub-heading">
            Manage daily rental rates, weekend surge multipliers, and volume discount brackets.
          </p>
        </div>

        <button onClick={() => setBulkModalOpen(true)} className="btn-v-primary">
          <Percent size={16} />
          <span>Bulk Price Adjuster</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="v-filter-toolbar">
        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search equipment for rate cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>
      </div>

      {/* Pricing Table */}
      <div className="v-card-box p-0 overflow-hidden">
        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Equipment Model & SKU</th>
                <th>Base Daily Rate (₹)</th>
                <th>Promotional Rate (₹)</th>
                <th>Security Deposit (₹)</th>
                <th>Weekly Tier (7d+)</th>
                <th>Monthly Tier (30d+)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isEditing = editingId === p.id;
                const weeklyRate = Math.round(p.pricePerDay * 0.85); // 15% off
                const monthlyRate = Math.round(p.pricePerDay * 0.70); // 30% off

                return (
                  <tr key={p.id} className="v-table-row">
                    <td>
                      <div className="v-gear-flex">
                        <img src={p.image} alt={p.name} className="v-gear-img" />
                        <div>
                          <h4 className="v-gear-name">{p.name}</h4>
                          <span className="v-gear-sku">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="pricing-inline-input"
                        />
                      ) : (
                        <span className="font-extrabold text-navy text-sm">₹{p.pricePerDay}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          placeholder="Optional"
                          value={editDiscount}
                          onChange={(e) => setEditDiscount(e.target.value)}
                          className="pricing-inline-input"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600">
                          {p.discountPrice ? `₹${p.discountPrice}` : '—'}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editDeposit}
                          onChange={(e) => setEditDeposit(e.target.value)}
                          className="pricing-inline-input"
                        />
                      ) : (
                        <span className="text-xs text-navy font-bold">₹{p.securityDeposit}</span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-secondary-blue font-bold">₹{weeklyRate}/day</span>
                      <span className="text-[10px] text-slate-400 block">(15% discount)</span>
                    </td>
                    <td>
                      <span className="text-xs text-emerald-600 font-bold">₹{monthlyRate}/day</span>
                      <span className="text-[10px] text-slate-400 block">(30% discount)</span>
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleSaveInline(p.id)}
                            className="btn-save-inline"
                            title="Save Rates"
                          >
                            <Save size={14} />
                            <span>Save</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(p)}
                          className="btn-edit-inline"
                          title="Edit Rates"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Price Adjuster Modal */}
      {bulkModalOpen && (
        <div className="v-modal-backdrop" onClick={() => setBulkModalOpen(false)}>
          <div className="v-modal-card max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <h3 className="font-bold text-navy text-base">Bulk Price Adjustment</h3>
              <button onClick={() => setBulkModalOpen(false)} className="v-modal-close">✕</button>
            </div>

            <div className="v-modal-body">
              <p className="text-xs text-slate-500 mb-2">
                Apply a uniform percentage increase or seasonal promotional discount across all {products.length} rental products.
              </p>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setBulkAction('increase')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs border ${
                    bulkAction === 'increase'
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Increase Rates (+)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkAction('decrease')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs border ${
                    bulkAction === 'decrease'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Promotional Discount (-)
                </button>
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Percentage Adjustment (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(e.target.value)}
                  className="v-form-input font-bold text-base text-navy"
                />
              </div>
            </div>

            <div className="v-modal-footer">
              <button onClick={() => setBulkModalOpen(false)} className="btn-v-secondary">
                Cancel
              </button>
              <button onClick={handleApplyBulk} className="btn-v-primary">
                Apply to All Listings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
