import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  IndianRupee,
  Users,
  Store,
  Package,
  ShoppingCart,
  ShieldCheck,
  Filter,
  FileText,
  Printer,
  Sparkles
} from 'lucide-react';
import { ChartCard, StatCard } from '../../../components/AdminLayout/AdminComponents';
import { ADMIN_REPORTS_DATA } from '../../../data/adminMockData';
import { useAdmin } from '../../../context/AdminContext';

export default function ReportsAnalytics() {
  const { showToast } = useAdmin();
  const [activeReportTab, setActiveReportTab] = useState('revenue');
  const [dateRange, setDateRange] = useState('month'); // 'week' | 'month' | 'quarter' | 'year'

  const reportTabs = [
    { id: 'revenue', label: 'Revenue & Commission' },
    { id: 'customers', label: 'Customer Cohorts' },
    { id: 'vendors', label: 'Vendor Performance' },
    { id: 'products', label: 'Gear Categories' },
    { id: 'orders', label: 'Order Lifecycles' },
    { id: 'escrow', label: 'Escrow & Deposits' },
    { id: 'disputes', label: 'Disputes & QC' },
    { id: 'inventory', label: 'Stock Utilization' }
  ];

  const handleExportReport = () => {
    showToast(`Generating ${activeReportTab.toUpperCase()} analytic report export (CSV/PDF)...`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Reports & Analytics Intelligence</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comprehensive financial summaries, vendor performance indicators, and gear demand analytics across Gujarat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 shadow-xs cursor-pointer"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Current Month (Sep 2026)</option>
            <option value="quarter">Last 90 Days (Q3)</option>
            <option value="year">Year to Date (FY 2026)</option>
          </select>

          <button
            onClick={handleExportReport}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        {reportTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeReportTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Revenue & Commission Analytics */}
      {activeReportTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Gross Rental Volume (GMV)"
              value="₹1,48,65,400"
              change="+28.6%"
              isPositive={true}
              icon={IndianRupee}
              accentColor="medium-blue"
            />
            <StatCard
              title="Net Platform Commission"
              value="₹14,86,540"
              change="+28.6%"
              isPositive={true}
              icon={TrendingUp}
              accentColor="medium-blue"
            />
            <StatCard
              title="Average Order Value"
              value="₹16,665"
              change="+8.4%"
              isPositive={true}
              icon={ShoppingCart}
              accentColor="light-blue"
            />
          </div>

          <ChartCard
            title="Monthly Revenue & Commission Trajectory"
            subtitle="Comparing Gross Booking Value vs Net Platform Take-Rate"
          >
            <div className="h-64 flex items-end justify-between gap-4 pt-6 px-2 border-b border-slate-100">
              {ADMIN_REPORTS_DATA.monthlyRevenue.map((item, idx) => {
                const heightPercent = Math.round((item.revenue / 16000000) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="text-[10px] font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{(item.revenue / 100000).toFixed(1)}L
                    </div>
                    <div className="w-full max-w-[54px] bg-slate-100 rounded-t-xl overflow-hidden h-48 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-t-xl transition-all duration-300"
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>
      )}

      {/* Tab 2: Customers Cohorts */}
      {activeReportTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Registered Renters" value="14,850" change="+14.8%" isPositive={true} icon={Users} accentColor="medium-blue" />
            <StatCard title="KYC Verification Rate" value="96.2%" change="+2.1%" isPositive={true} icon={ShieldCheck} accentColor="light-blue" />
            <StatCard title="Repeat Booking Ratio" value="68.4%" change="+5.7%" isPositive={true} icon={TrendingUp} accentColor="medium-blue" />
          </div>

          <ChartCard title="Weekly Customer Growth" subtitle="Verified KYC renters vs guest visitors">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
              {ADMIN_REPORTS_DATA.growthStats.map((st, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">{st.period}</span>
                  <div className="text-xl font-extrabold text-slate-900 font-['Sora']">{st.customers.toLocaleString()}</div>
                  <div className="text-xs text-emerald-700 font-medium">+300 new weekly</div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* Tab 3: Vendors Performance */}
      {activeReportTab === 'vendors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Merchant Stores" value="1,240" change="+8.2%" isPositive={true} icon={Store} accentColor="medium-blue" />
            <StatCard title="Average Merchant Revenue" value="₹1,19,800/mo" change="+12.4%" isPositive={true} icon={IndianRupee} accentColor="light-blue" />
            <StatCard title="On-Time Dispatch Rate" value="98.5%" change="+0.4%" isPositive={true} icon={ShieldCheck} accentColor="medium-blue" />
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Top Performing Gujarat Vendors</h3>
            <div className="space-y-3 text-xs text-slate-800">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <div>
                  <strong className="block text-sm font-semibold font-['Sora'] text-slate-900">1. Apex Cinema Gear & Lens Hub (Ahmedabad)</strong>
                  <span className="text-slate-500">342 fulfilled orders • Rating: 4.95 ⭐</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-slate-900 font-['Sora']">₹18,45,000</span>
                  <div className="text-[11px] text-slate-500 font-medium">Commission: ₹1,84,500</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <div>
                  <strong className="block text-sm font-semibold font-['Sora'] text-slate-900">2. Gujarat Roadtrips & 4x4 Fleet (Ahmedabad)</strong>
                  <span className="text-slate-500">115 fulfilled orders • Rating: 4.92 ⭐</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-slate-900 font-['Sora']">₹14,80,000</span>
                  <div className="text-[11px] text-slate-500 font-medium">Commission: ₹1,48,000</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <div>
                  <strong className="block text-sm font-semibold font-['Sora'] text-slate-900">3. Surat Aerial & Drone Hub (Surat)</strong>
                  <span className="text-slate-500">188 fulfilled orders • Rating: 4.88 ⭐</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-slate-900 font-['Sora']">₹11,20,000</span>
                  <div className="text-[11px] text-slate-500 font-medium">Commission: ₹1,12,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Product & Category Demand */}
      {activeReportTab === 'products' && (
        <div className="space-y-6">
          <ChartCard title="Rental Category Share & Volume" subtitle="Category distribution across 5,640 listings">
            <div className="space-y-3.5 pt-2">
              {ADMIN_REPORTS_DATA.categoryPerformance.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.category}</span>
                    <span className="font-bold text-slate-900">{cat.share}% ({cat.revenue})</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.share}%` }}
                      className="h-full bg-blue-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* Fallback for other tabs */}
      {!['revenue', 'customers', 'vendors', 'products'].includes(activeReportTab) && (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 space-y-3 shadow-xs">
          <BarChart3 size={36} className="text-blue-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 font-['Sora']">
            {activeReportTab.toUpperCase()} Data Breakdown Ready
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Real-time telemetry and audit records for {activeReportTab} are synced. Click Export Report to download comprehensive spreadsheet.
          </p>
          <button
            onClick={handleExportReport}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Download {activeReportTab} Dataset
          </button>
        </div>
      )}

    </div>
  );
}
