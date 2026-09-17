import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Download, 
  X, 
  ExternalLink,
  Eye,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

// ================= STAT CARD =================
export function StatCard({ title, value, change, isPositive = true, period = 'vs last month', icon: Icon, accentColor = 'navy', onClick }) {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'red':
        return {
          iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
          badge: 'bg-rose-50 text-rose-600'
        };
      case 'light-blue':
        return {
          iconBg: 'bg-sky-50 text-sky-600 border border-sky-100',
          badge: 'bg-sky-50 text-sky-600'
        };
      case 'medium-blue':
        return {
          iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
          badge: 'bg-blue-50 text-blue-600'
        };
      case 'navy':
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-700 border border-slate-200/60',
          badge: 'bg-slate-100 text-slate-700'
        };
    }
  };

  const styles = getAccentStyles();

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider line-clamp-1">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Sora'] tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </h3>
      </div>

      {change && (
        <div className="flex items-center gap-1.5 mt-2.5 text-xs">
          <span className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-rose-50 text-rose-700 border border-rose-200/50'}`}>
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change}
          </span>
          <span className="text-slate-400 text-[11px] truncate">{period}</span>
        </div>
      )}
    </div>
  );
}

// ================= STATUS BADGE =================
export function StatusBadge({ status, type = 'general' }) {
  const getBadgeStyle = () => {
    const s = (status || '').toLowerCase();
    
    if (['active', 'approved', 'paid', 'completed', 'delivered', 'verified'].includes(s)) {
      return 'bg-emerald-50/80 text-emerald-700 border-emerald-200';
    }
    if (['pending', 'pending approval', 'in review', 'in progress', 'processing', 'scheduled', 'waiting for response', 'partially paid'].includes(s)) {
      return 'bg-amber-50/80 text-amber-700 border-amber-200';
    }
    if (['disputed', 'rejected', 'failed', 'cancelled', 'blocked', 'suspended', 'overdue'].includes(s)) {
      return 'bg-rose-50/80 text-rose-700 border-rose-200';
    }
    if (['refunded', 'returned', 'inactive', 'closed'].includes(s)) {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    if (['shipped', 'confirmed'].includes(s)) {
      return 'bg-sky-50/80 text-sky-700 border-sky-200';
    }

    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span>{status || 'Unknown'}</span>
    </span>
  );
}

// ================= PRIORITY BADGE =================
export function PriorityBadge({ priority }) {
  const getStyle = () => {
    switch ((priority || '').toLowerCase()) {
      case 'urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getStyle()}`}>
      {priority || 'Normal'}
    </span>
  );
}

// ================= SEARCH BAR =================
export function SearchBar({ value, onChange, placeholder = 'Search records...', className = '' }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all shadow-xs"
      />
      {value && (
        <button 
          onClick={() => onChange('')} 
          className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ================= CONFIRMATION MODAL =================
export function ConfirmationModal({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmColor = 'red', onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 relative">
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${confirmColor === 'red' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
            <AlertTriangle size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              if (onCancel) onCancel();
            }}
            className={`px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-xs transition-all ${
              confirmColor === 'red'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= DOCUMENT PREVIEW MODAL =================
export function DocumentPreviewModal({ isOpen, documentData, onClose }) {
  if (!isOpen || !documentData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold font-['Sora'] text-slate-900">{documentData.name || 'KYC Document'}</h3>
              <p className="text-xs text-slate-500">Submitted Date: {documentData.date || 'Recent'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
          >
            <X size={15} />
          </button>
        </div>

        {/* Mock Document Preview Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs text-slate-900">
          <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-slate-900 font-['Sora']">GOVERNMENT OF GUJARAT / GST PORTAL</span>
              <StatusBadge status={documentData.status || 'Verified'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Document Type</span>
                <span className="font-semibold text-slate-800">{documentData.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification Engine</span>
                <span className="font-semibold text-emerald-700">Digital Sign / KYC Pass</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration State</span>
                <span className="font-semibold text-slate-800">Gujarat (Code 24)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Security Hash</span>
                <span className="font-mono text-[10px] text-slate-500">SHA256: 8f9b4c20d7e...</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span className="text-xs text-emerald-800 font-medium">This document matches official tax records with zero fraud indicators.</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          <button 
            onClick={() => alert(`Downloading ${documentData.name}...`)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Download Copy</span>
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= TOAST NOTIFICATION =================
export function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const getToastIcon = () => {
    switch (toast.type) {
      case 'error':
      case 'warning':
        return <AlertTriangle size={17} className="text-amber-400 flex-shrink-0" />;
      case 'info':
        return <Info size={17} className="text-blue-400 flex-shrink-0" />;
      case 'success':
      default:
        return <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {getToastIcon()}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Notification</h4>
            <p className="text-xs text-slate-200 font-medium mt-0.5 leading-snug">{toast.message}</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1"
          aria-label="Dismiss toast"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ================= EMPTY STATE =================
export function EmptyState({ icon: Icon = Layers, title = 'No records found', description = 'Try adjusting your filters or search query.', actionText, onAction }) {
  return (
    <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200/80 space-y-3 my-3 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

// ================= PAGINATION =================
export function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
      <div>
        Showing <strong className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
        <strong className="text-slate-900">{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of{' '}
        <strong className="text-slate-900">{totalItems}</strong> entries
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
              currentPage === page
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ================= CHART CARD WRAPPER =================
export function ChartCard({ title, subtitle, action, children }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}
