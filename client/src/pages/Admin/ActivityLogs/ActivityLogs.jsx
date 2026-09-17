import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  Clock,
  User,
  Layers,
  FileText,
  Eye,
  Info
} from 'lucide-react';
import { SearchBar, Pagination, EmptyState } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function ActivityLogs() {
  const { activityLogs, showToast } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const modules = [
    'all',
    'Vendors',
    'Customers',
    'Products',
    'Categories',
    'Orders',
    'Payments',
    'Pickups & Returns',
    'Complaints',
    'Notifications',
    'Admin Users',
    'Platform Settings'
  ];

  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.admin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ip?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;

      return matchesSearch && matchesModule;
    });
  }, [activityLogs, searchQuery, moduleFilter]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">System Activity Logs & Audit Trail</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable chronological record of all administrative approvals, payment adjustments, role grants, and settings edits.
          </p>
        </div>

        <button
          onClick={() => showToast('Exporting tamper-proof audit trail...', 'info')}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download size={14} className="text-slate-500" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search action, admin staff, description, IP..."
          />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex-shrink-0">Module:</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 cursor-pointer transition-all"
            >
              {modules.map((m) => (
                <option key={m} value={m}>
                  {m === 'all' ? 'All System Modules' : m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {paginatedLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Log ID / Time</th>
                  <th className="py-3.5 px-4">Admin Staff</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Module</th>
                  <th className="py-3.5 px-4">Description / Details</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    <td className="py-3.5 px-4">
                      <span className="font-semibold font-mono text-slate-900">{log.id}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{log.timestamp}</span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {log.admin}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200/60">
                        {log.module}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{log.description}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {log.ip || 'Local Client'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                        title="Inspect Audit Entry"
                      >
                        <Eye size={14} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="No audit entries found"
            description="Adjust your search filters to view recorded logs."
            actionText="Clear Filter"
            onAction={() => {
              setSearchQuery('');
              setModuleFilter('all');
            }}
          />
        )}

        <div className="p-4 bg-white border-t border-slate-200/80">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredLogs.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>

      {/* Inspect Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-['Sora'] text-slate-900">
                Audit Record: {selectedLog.id}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block">Action Performed</span>
                <span className="font-bold text-slate-900 text-sm">{selectedLog.action}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block">Module</span>
                  <span className="font-semibold text-slate-800">{selectedLog.module}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block">Admin Actor</span>
                  <span className="font-semibold text-slate-800">{selectedLog.admin}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block">Timestamp & Origin IP</span>
                <span className="font-medium text-slate-800">{selectedLog.timestamp} ({selectedLog.ip})</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold block mb-1">Full Description</span>
                <p className="text-xs leading-relaxed text-slate-600 font-medium">{selectedLog.description}</p>
              </div>
            </div>

            <div className="pt-2 text-right border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                Close Audit Entry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
