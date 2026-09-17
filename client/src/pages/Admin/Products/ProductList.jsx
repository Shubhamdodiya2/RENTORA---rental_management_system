import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Star,
  Sparkles,
  Trash2,
  Edit2,
  Eye,
  Download,
  AlertTriangle,
  CheckSquare,
  Square,
  ShieldAlert
} from 'lucide-react';
import { SearchBar, StatusBadge, Pagination, EmptyState } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function ProductList() {
  const {
    products,
    vendors,
    categories,
    approveProduct,
    rejectProduct,
    toggleFeaturedProduct,
    updateProductStatus,
    deleteProduct,
    bulkApproveProducts,
    requestConfirmation,
    showToast
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Rejection modal state
  const [rejectingProduct, setRejectingProduct] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesApproval = approvalFilter === 'all' || p.approvalStatus === approvalFilter;
      const matchesCategory = categoryFilter === 'all' || p.categorySlug === categoryFilter || p.category === categoryFilter;
      const matchesVendor = vendorFilter === 'all' || p.vendorId === vendorFilter || p.vendorName === vendorFilter;
      const matchesFeatured = !featuredOnly || p.featured;

      return matchesSearch && matchesApproval && matchesCategory && matchesVendor && matchesFeatured;
    });
  }, [products, searchQuery, approvalFilter, categoryFilter, vendorFilter, featuredOnly]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    bulkApproveProducts(selectedIds);
    setSelectedIds([]);
  };

  const handleDeleteSingle = (prod) => {
    requestConfirmation({
      title: `Delete Product: ${prod.name}?`,
      message: `Are you sure you want to remove ${prod.name} (${prod.sku}) from the catalog? This will cancel any unscheduled future drafts.`,
      confirmText: 'Delete Item',
      confirmColor: 'red',
      onConfirm: () => deleteProduct(prod.id)
    });
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectingProduct || !rejectReason.trim()) return;
    rejectProduct(rejectingProduct.id, rejectReason);
    setRejectingProduct(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Product & Gear Management</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review vendor listing submissions, verify specifications, manage featured spots, and audit stock levels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast('Exporting inventory list to CSV...', 'info')}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search equipment, SKU, vendor..."
          />

          {/* Approval Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Approval:</span>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer transition-all"
            >
              <option value="all">All Approvals</option>
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Featured Toggle Filter */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> Featured Only
            </span>
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="w-4 h-4 text-slate-900 rounded cursor-pointer accent-slate-900"
            />
          </div>

        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-blue-50 text-blue-950 border border-blue-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in text-xs font-semibold">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold">{selectedIds.length} Selected</span>
              <span className="text-blue-900">Bulk Actions for chosen equipment listings:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Approve All Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors shadow-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {paginatedProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-10">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-700"
                      aria-label="Select all on page"
                    >
                      {selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0 ? (
                        <CheckSquare size={16} className="text-slate-900" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Equipment Item</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Daily Rate / Dep</th>
                  <th className="py-3.5 px-4">Stock Units</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  return (
                    <tr key={product.id} className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-slate-50' : ''}`}>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleSelectRow(product.id)}
                          className="text-slate-400 hover:text-slate-700"
                          aria-label={`Select ${product.name}`}
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-slate-900" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* Product Name & SKU */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 font-['Sora'] line-clamp-1">{product.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {product.sku}</div>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium inline-block mt-0.5">
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="py-4 px-4 font-medium text-slate-800">
                        {product.vendorName}
                      </td>

                      {/* Rates */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 font-['Sora'] text-sm">
                          ₹{product.pricePerDay.toLocaleString('en-IN')} <span className="text-[11px] font-normal text-slate-500">/ day</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Dep: ₹{product.deposit}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{product.stock} Total</div>
                        <span className="text-[10px] text-slate-500">{product.availableStock} Available</span>
                      </td>

                      {/* Approval Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={product.approvalStatus} />
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleFeaturedProduct(product.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            product.featured
                              ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                          }`}
                          title={product.featured ? 'Remove from Featured' : 'Mark as Featured on Homepage'}
                        >
                          <Star size={15} fill={product.featured ? 'currentColor' : 'none'} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {product.approvalStatus === 'Pending Approval' && (
                            <>
                              <button
                                onClick={() => approveProduct(product.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectingProduct(product)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold text-[11px] transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <Link
                            to={`/products/${product.id}`}
                            target="_blank"
                            title="Preview on Public Marketplace"
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                          >
                            <Eye size={15} />
                          </Link>

                          <button
                            onClick={() => handleDeleteSingle(product)}
                            title="Delete Listing"
                            className="p-1.5 rounded-lg bg-slate-50 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No equipment products found"
            description="Adjust your search filters or try clearing approval statuses."
            actionText="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setApprovalFilter('all');
              setCategoryFilter('all');
              setVendorFilter('all');
              setFeaturedOnly(false);
            }}
          />
        )}

        {/* Pagination */}
        <div className="p-4 bg-white border-t border-slate-200/80">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>

      {/* Reject Product Modal */}
      {rejectingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-['Sora'] text-slate-900">
              Reject Equipment Listing: {rejectingProduct.name}
            </h3>
            <p className="text-xs text-slate-500">
              Explain to {rejectingProduct.vendorName} why this listing requires changes (e.g. low-res images, incomplete specs, incorrect category).
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Detailed rejection reason..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
