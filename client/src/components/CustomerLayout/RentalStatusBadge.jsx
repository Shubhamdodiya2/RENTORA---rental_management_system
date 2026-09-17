import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles,
  Truck
} from 'lucide-react';
import './RentalStatusBadge.css';

export default function RentalStatusBadge({ status = 'Active', type = 'rental' }) {
  let badgeClass = 'status-active';
  let Icon = CheckCircle2;

  switch (status.toLowerCase()) {
    case 'active':
      badgeClass = 'status-active';
      Icon = Sparkles;
      break;
    case 'return scheduled':
    case 'due soon':
      badgeClass = 'status-return-scheduled';
      Icon = Clock;
      break;
    case 'pickup scheduled':
    case 'upcoming':
      badgeClass = 'status-upcoming';
      Icon = Truck;
      break;
    case 'completed':
    case 'signed (active)':
    case 'accepted':
      badgeClass = 'status-completed';
      Icon = CheckCircle2;
      break;
    case 'paid':
    case 'success':
      badgeClass = 'status-paid';
      Icon = ShieldCheck;
      break;
    case 'pending':
    case 'pending payment':
    case 'pending acceptance':
    case 'deposit pending':
      badgeClass = 'status-pending';
      Icon = Clock;
      break;
    case 'cancelled':
    case 'payment failed':
    case 'late return alert':
      badgeClass = 'status-alert';
      Icon = AlertCircle;
      break;
    default:
      badgeClass = 'status-active';
      Icon = CheckCircle2;
  }

  return (
    <span className={`status-badge ${badgeClass}`}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{status}</span>
    </span>
  );
}
