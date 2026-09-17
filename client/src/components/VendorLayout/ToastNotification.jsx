import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useVendor } from '../../context/VendorContext';
import './ToastNotification.css';

export default function ToastNotification() {
  const { toast, hideToast } = useVendor();

  if (!toast) return null;

  return (
    <div className={`vendor-toast-banner toast-${toast.type || 'success'}`}>
      <div className="toast-icon">
        {toast.type === 'error' ? (
          <AlertCircle size={18} />
        ) : toast.type === 'info' ? (
          <Info size={18} />
        ) : (
          <CheckCircle2 size={18} />
        )}
      </div>
      <span className="toast-message">{toast.message}</span>
      <button onClick={hideToast} className="toast-close-btn" aria-label="Close Toast">
        <X size={15} />
      </button>
    </div>
  );
}
