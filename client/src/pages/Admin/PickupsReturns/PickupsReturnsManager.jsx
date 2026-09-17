import React, { useState, useMemo } from 'react';
import {
  Truck,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  FileCheck,
  User,
  Store,
  Eye,
  Plus
} from 'lucide-react';
import { SearchBar, StatusBadge, Pagination, EmptyState } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function PickupsReturnsManager() {
  const {
    pickupsReturns,
    schedulePickup,
    approveReturn,
    rejectReturn,
    completeReturn,
    requestConfirmation,
    showToast
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pickups' | 'returns' | 'scheduled' | 'completed' | 'disputed'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Schedule Modal State
  const [schedulingReq, setSchedulingReq] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('18 Sep 2026, 11:00 AM');
  const [driverNote, setDriverNote] = useState('Driver: Ramesh Patel (+91 98250 11223)');

  // Filtered List
  const filteredList = useMemo(() => {
    return pickupsReturns.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.product.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeTab === 'pickups') return matchesSearch && r.type.includes('Pickup');
      if (activeTab === 'returns') return matchesSearch && r.type.includes('Return');
      if (activeTab === 'scheduled') return matchesSearch && r.status === 'Scheduled';
      if (activeTab === 'completed') return matchesSearch && r.status === 'Completed';
      if (activeTab === 'disputed') return matchesSearch && r.status === 'Disputed';

      return matchesSearch;
    });
  }, [pickupsReturns, searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleConfirmSchedule = (e) => {
    e.preventDefault();
    if (!schedulingReq) return;
    schedulePickup(schedulingReq.id, scheduleDate, driverNote);
    setSchedulingReq(null);
  };

  const handleApproveReturnQC = (req) => {
    requestConfirmation({
      title: `Approve Equipment Return: ${req.product}?`,
      message: `Confirm that ${req.vendor} and customer ${req.customer} completed the return QC checklist with zero damage?`,
      confirmText: 'Approve & Release Escrow',
      confirmColor: 'blue',
      onConfirm: () => approveReturn(req.id, 'Clean return verified by Super Admin')
    });
  };

  const handleFlagDamage = (req) => {
    requestConfirmation({
      title: `Flag Damage Penalty on ${req.product}?`,
      message: `Are you sure you want to flag damage on order ${req.orderNumber}? Security deposit escrow will be locked for mediation.`,
      confirmText: 'Flag Damage Penalty',
      confirmColor: 'red',
      onConfirm: () => rejectReturn(req.id, 'Damage inspection failed - front housing scratched')
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Pickups & Returns Operations</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Coordinate doorstep dispatch logistics, monitor drop-offs, supervise QC inspections, and authorize deposit refunds.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          All Logistics ({pickupsReturns.length})
        </button>
        <button
          onClick={() => setActiveTab('pickups')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'pickups'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Pickup Requests
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'returns'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Return Requests
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'scheduled'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'completed'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab('disputed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'disputed'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Disputed QC
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search logistics by order #, customer, gear, city..."
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {paginatedList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Request / Type</th>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Equipment Item</th>
                  <th className="py-3.5 px-4">Parties</th>
                  <th className="py-3.5 px-4">Scheduled Date / Hub</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Logistics Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedList.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-900 font-mono">{req.id}</span>
                      <span className="text-[10px] text-slate-500 block font-medium mt-0.5">{req.type}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-900 font-mono">{req.orderNumber}</span>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-800">
                      {req.product}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">{req.customer}</div>
                      <div className="text-[11px] text-slate-500">From: {req.vendor}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">{req.scheduledDate}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-slate-400" />
                        <span>{req.location}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === 'Scheduled' && (
                          <button
                            onClick={() => handleApproveReturnQC(req)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}

                        {req.status === 'Pending Inspection' && (
                          <>
                            <button
                              onClick={() => handleApproveReturnQC(req)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs transition-colors"
                            >
                              Pass QC
                            </button>
                            <button
                              onClick={() => handleFlagDamage(req)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold text-[11px] transition-colors"
                            >
                              Flag Damage
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setSchedulingReq(req)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-medium text-[11px] transition-colors"
                        >
                          Reschedule
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Truck}
            title="No pickup or return requests"
            description="No logistics actions found for the chosen tab or filter."
            actionText="Show All Requests"
            onAction={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
          />
        )}

        <div className="p-4 bg-white border-t border-slate-200/80">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredList.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>

      {/* Schedule Logistics Modal */}
      {schedulingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-['Sora'] text-slate-900">
              Schedule Logistics: {schedulingReq.id}
            </h3>
            <p className="text-xs text-slate-500">
              Assign dispatch date and delivery partner for <strong className="text-slate-800">{schedulingReq.product}</strong>.
            </p>

            <form onSubmit={handleConfirmSchedule} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Scheduled Date & Time</label>
                <input
                  type="text"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-500 uppercase tracking-wider text-[10px]">Delivery Driver / Hub Logistics Notes</label>
                <textarea
                  rows={2}
                  required
                  value={driverNote}
                  onChange={(e) => setDriverNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSchedulingReq(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
