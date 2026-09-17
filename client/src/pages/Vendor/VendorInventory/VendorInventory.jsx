import React, { useState } from 'react';
import {
  Boxes,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  Plus,
  Minus,
  RefreshCw,
  Clock,
  Edit
} from 'lucide-react';
import { useVendor } from '../../../context/VendorContext';
import './VendorInventory.css';

export default function VendorInventory() {
  const { products, adjustStock, showToast } = useVendor();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [adjustTarget, setAdjustTarget] = useState(null); // Product object
  const [adjustAmount, setAdjustAmount] = useState(1);
  const [adjustMode, setAdjustMode] = useState('add'); // 'add' | 'remove'
  const [adjustReason, setAdjustReason] = useState('New shipment arrival');

  // Stats
  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const availableUnits = products.reduce((acc, p) => acc + p.availableStock, 0);
  const reservedUnits = products.reduce((acc, p) => acc + (p.reservedStock || 0), 0);
  const lowStockCount = products.filter((p) => p.status === 'Low Stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'Out of Stock').length;

  const filteredProducts = products.filter((p) => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApplyAdjustment = (e) => {
    e.preventDefault();
    if (!adjustTarget) return;

    const delta = adjustMode === 'add' ? Number(adjustAmount) : -Number(adjustAmount);
    adjustStock(adjustTarget.id, delta, adjustReason);
    setAdjustTarget(null);
    setAdjustAmount(1);
  };

  const handleExport = () => {
    showToast('Inventory report exported as CSV!', 'success');
  };

  return (
    <div className="vendor-inventory-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Inventory & Stock Control</h1>
          <p className="page-sub-heading">
            Audit physical equipment availability, reserve units for active rentals, and set alert thresholds.
          </p>
        </div>

        <button onClick={handleExport} className="btn-v-secondary">
          <Download size={16} />
          <span>Export Stock Report</span>
        </button>
      </div>

      {/* 5 Stock Metric Cards */}
      <div className="inventory-stats-grid">
        <div className="inv-stat-card">
          <span className="inv-stat-lbl">Total Physical Units</span>
          <span className="inv-stat-val text-navy">{totalUnits}</span>
          <span className="inv-stat-sub">Across {products.length} models</span>
        </div>

        <div className="inv-stat-card">
          <span className="inv-stat-lbl">Available for Booking</span>
          <span className="inv-stat-val text-emerald-600">{availableUnits}</span>
          <span className="inv-stat-sub">Ready to dispatch</span>
        </div>

        <div className="inv-stat-card">
          <span className="inv-stat-lbl">Reserved on Rental</span>
          <span className="inv-stat-val text-secondary-blue">{reservedUnits}</span>
          <span className="inv-stat-sub">Under active customer custody</span>
        </div>

        <div className="inv-stat-card">
          <span className="inv-stat-lbl">Low Stock Listings</span>
          <span className="inv-stat-val text-amber-600">{lowStockCount}</span>
          <span className="inv-stat-sub">Below safety threshold</span>
        </div>

        <div className="inv-stat-card">
          <span className="inv-stat-lbl">Out of Stock</span>
          <span className="inv-stat-val text-primary-red">{outOfStockCount}</span>
          <span className="inv-stat-sub">0 units available</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="v-filter-toolbar">
        <div className="v-search-box">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search inventory by gear or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="v-search-input"
          />
        </div>

        <div className="v-status-filter-pills">
          {['All', 'Active', 'Low Stock', 'Out of Stock'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`v-filter-pill-btn ${statusFilter === st ? 'v-pill-active' : ''}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="v-card-box p-0 overflow-hidden">
        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Equipment Model & SKU</th>
                <th>Category</th>
                <th>Total Stock</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Min Alert</th>
                <th>Status</th>
                <th>Stock Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
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
                    <span className="text-xs text-navy font-semibold">{p.category}</span>
                  </td>
                  <td>
                    <span className="font-bold text-navy text-sm">{p.stock} units</span>
                  </td>
                  <td>
                    <span className="font-semibold text-secondary-blue text-xs">
                      {p.reservedStock || 0} in use
                    </span>
                  </td>
                  <td>
                    <span className="font-bold text-emerald-600 text-sm">
                      {p.availableStock} units
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-500 font-mono">
                      &le; {p.minStockAlert} units
                    </span>
                  </td>
                  <td>
                    <span
                      className={`v-status-badge ${
                        p.status === 'Active'
                          ? 'status-active'
                          : p.status === 'Low Stock'
                          ? 'status-processing'
                          : 'status-out'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setAdjustTarget(p);
                        setAdjustAmount(1);
                        setAdjustMode('add');
                      }}
                      className="btn-v-adjust-stock"
                      title="Adjust Stock Units"
                    >
                      <RefreshCw size={13} />
                      <span>Adjust</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustTarget && (
        <div className="v-modal-backdrop" onClick={() => setAdjustTarget(null)}>
          <div className="v-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="v-modal-hdr">
              <div>
                <span className="font-mono text-xs font-bold text-primary-red">{adjustTarget.sku}</span>
                <h3 className="font-bold text-navy text-base">Adjust Inventory Quantity</h3>
              </div>
              <button onClick={() => setAdjustTarget(null)} className="v-modal-close">✕</button>
            </div>

            <form onSubmit={handleApplyAdjustment} className="v-modal-body">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                <img src={adjustTarget.image} alt={adjustTarget.name} className="w-12 h-12 rounded object-cover" />
                <div>
                  <h4 className="font-bold text-navy text-xs">{adjustTarget.name}</h4>
                  <p className="text-[11px] text-slate-500">Current Stock: <strong>{adjustTarget.stock} units</strong> (Available: {adjustTarget.availableStock})</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustMode('add')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border ${
                    adjustMode === 'add'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <Plus size={14} />
                  <span>Add Units (+ Stock)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustMode('remove')}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 border ${
                    adjustMode === 'remove'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <Minus size={14} />
                  <span>Remove / Write-off</span>
                </button>
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Quantity to {adjustMode === 'add' ? 'Add' : 'Deduct'}</label>
                <input
                  type="number"
                  min="1"
                  max={adjustMode === 'remove' ? adjustTarget.availableStock : 100}
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="v-form-input font-bold text-base text-navy"
                  required
                />
              </div>

              <div className="v-form-field">
                <label className="v-form-lbl">Adjustment Reason / Audit Note</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="v-form-select"
                >
                  <option value="New shipment arrival">New shipment arrival / Purchase</option>
                  <option value="Maintenance overhaul completed">Maintenance overhaul completed</option>
                  <option value="Damaged in transit">Damaged in transit / Write-off</option>
                  <option value="Physical count audit correction">Physical count audit correction</option>
                </select>
              </div>

              <div className="v-modal-footer p-0 pt-3 border-t">
                <button type="submit" className="btn-v-primary w-full justify-center">
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
