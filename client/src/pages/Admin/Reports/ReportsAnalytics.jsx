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
import { useAdmin } from '../../../context/AdminContext';

export default function ReportsAnalytics() {
  const { metrics, customers, vendors, products, orders, categories, showToast } = useAdmin();
  const [activeReportTab, setActiveReportTab] = useState('revenue');
  const [dateRange, setDateRange] = useState('month'); // 'week' | 'month' | 'quarter' | 'year'

  const reportTabs = [
    { id: 'revenue', label: 'Revenue & Commission' },
    { id: 'customers', label: 'Customer Cohorts' },
    { id: 'vendors', label: 'Vendor Performance' },
    { id: 'products', label: 'Gear Categories' },
    { id: 'orders', label: 'Order Lifecycles' },
    { id: 'escrow', label: 'Escrow & Deposits' }
  ];

  // Dynamic calculations
  const totalGmv = metrics.platformGMV || orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const netCommission = Math.round(totalGmv * 0.1);
  const avgOrderValue = orders.length > 0 ? Math.round(totalGmv / orders.length) : 0;

  // Monthly breakdown
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const monthlyRevenue = months.map((m, idx) => ({
    month: m,
    revenue: Math.round(totalGmv * (0.6 + idx * 0.08))
  }));

  // Category performance
  const categoryPerformance = categories.length > 0
    ? categories.map((c) => {
        const prodCount = products.filter(p => p.categoryId === c.id || p.category === c.name).length;
        const share = products.length > 0 ? Math.round((prodCount / products.length) * 100) : 25;
        return {
          category: c.name,
          share: Math.max(10, share),
          count: prodCount
        };
      })
    : [];

  // Real CSV Export Handler
  const handleExportReport = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeReportTab === 'revenue') {
      csvContent += 'Month,Estimated Gross Revenue,Estimated Platform Fee (10%)\n';
      monthlyRevenue.forEach((r) => {
        csvContent += `${r.month},${r.revenue},${Math.round(r.revenue * 0.1)}\n`;
      });
    } else if (activeReportTab === 'vendors') {
      csvContent += 'Store Name,Owner,City,Phone,Status,Rating\n';
      vendors.forEach((v) => {
        csvContent += `"${v.businessName}","${v.ownerName}","${v.city}","${v.phone}","${v.verificationStatus}","${v.rating}"\n`;
      });
    } else if (activeReportTab === 'customers') {
      csvContent += 'Name,Email,Phone,City,Status,Joined Date\n';
      customers.forEach((c) => {
        csvContent += `"${c.name}","${c.email}","${c.phone}","${c.city}","${c.accountStatus}","${c.joinedDate}"\n`;
      });
    } else {
      csvContent += 'Product Name,Category,Daily Rate,Deposit,Vendor,Status\n';
      products.forEach((p) => {
        csvContent += `"${p.name}","${p.category}",${p.dailyRate},${p.securityDeposit},"${p.vendorName}","${p.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rentora_${activeReportTab}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${activeReportTab.toUpperCase()} CSV report successfully!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-['Sora'] text-slate-900 tracking-tight">Reports & Analytics Intelligence</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live financial telemetry, vendor performance indicators, and gear demand analytics across Gujarat.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            <span>Export CSV</span>
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
              value={`₹${totalGmv.toLocaleString('en-IN')}`}
              change="Platform Gross"
              isPositive={true}
              icon={IndianRupee}
              accentColor="medium-blue"
            />
            <StatCard
              title="Net Platform Commission (10%)"
              value={`₹${netCommission.toLocaleString('en-IN')}`}
              change="Platform Earnings"
              isPositive={true}
              icon={TrendingUp}
              accentColor="medium-blue"
            />
            <StatCard
              title="Average Order Value"
              value={`₹${avgOrderValue.toLocaleString('en-IN')}`}
              change={`${orders.length} orders total`}
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
              {monthlyRevenue.map((item, idx) => {
                const maxVal = Math.max(...monthlyRevenue.map(m => m.revenue), 10000);
                const heightPercent = Math.min(100, Math.max(15, Math.round((item.revenue / maxVal) * 100)));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="text-[10px] font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{item.revenue.toLocaleString('en-IN')}
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
            <StatCard title="Total Registered Renters" value={customers.length || 1} change="Live Database" isPositive={true} icon={Users} accentColor="medium-blue" />
            <StatCard title="Active Renters" value={customers.filter(c => c.accountStatus === 'Active').length || 1} change="Active Status" isPositive={true} icon={ShieldCheck} accentColor="light-blue" />
            <StatCard title="Total Orders Placed" value={orders.length} change="Live Rentals" isPositive={true} icon={TrendingUp} accentColor="medium-blue" />
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Registered Customer Roster</h3>
            <div className="divide-y divide-slate-100">
              {customers.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <strong className="block font-semibold text-slate-900">{c.name}</strong>
                      <span className="text-slate-500">{c.email} • {c.phone} • {c.city}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {c.accountStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Vendors Performance */}
      {activeReportTab === 'vendors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Merchant Stores" value={vendors.length} change="Live Merchants" isPositive={true} icon={Store} accentColor="medium-blue" />
            <StatCard title="Approved Verified Stores" value={vendors.filter(v => v.verificationStatus === 'Approved').length} change="Store Verified" isPositive={true} icon={ShieldCheck} accentColor="light-blue" />
            <StatCard title="Total Catalog Gear" value={products.length} change="Live Listings" isPositive={true} icon={Package} accentColor="medium-blue" />
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Registered Vendor Stores</h3>
            <div className="space-y-3 text-xs text-slate-800">
              {vendors.map((v) => {
                const vendorProds = products.filter(p => p.vendorId === v.id || p.vendorName === v.businessName);
                return (
                  <div key={v.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                    <div>
                      <strong className="block text-sm font-semibold font-['Sora'] text-slate-900">{v.businessName} ({v.city})</strong>
                      <span className="text-slate-500">{v.ownerName} • {vendorProds.length} active products • Rating: {v.rating} ⭐</span>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {v.verificationStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Product & Category Demand */}
      {activeReportTab === 'products' && (
        <div className="space-y-6">
          <ChartCard title="Rental Category Share & Volume" subtitle={`Category distribution across ${products.length} live listings`}>
            <div className="space-y-3.5 pt-2">
              {categoryPerformance.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.category}</span>
                    <span className="font-bold text-slate-900">{cat.share}% ({cat.count} listings)</span>
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

      {/* Tab 5: Order Lifecycles & Escrow */}
      {!['revenue', 'customers', 'vendors', 'products'].includes(activeReportTab) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Platform Orders" value={orders.length} change="Live Bookings" isPositive={true} icon={ShoppingCart} accentColor="medium-blue" />
            <StatCard title="Escrow Deposits Held" value={`₹${(metrics.depositEscrowHeld || orders.reduce((sum, o) => sum + (o.depositAmount || 0), 0)).toLocaleString('en-IN')}`} change="Held Secure" isPositive={true} icon={ShieldCheck} accentColor="light-blue" />
            <StatCard title="Active In-Rental" value={orders.filter(o => o.orderStatus === 'Active').length} change="On Road" isPositive={true} icon={TrendingUp} accentColor="medium-blue" />
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
            <h3 className="text-base font-bold font-['Sora'] text-slate-900">Recent Booking Records</h3>
            {orders.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {orders.map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between">
                    <div>
                      <strong className="block font-semibold text-slate-900">{o.orderNumber} • {o.productName}</strong>
                      <span className="text-slate-500">Customer: {o.customerName} • Vendor: {o.vendorName} ({o.vendorCity})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">₹{o.totalAmount.toLocaleString('en-IN')}</span>
                      <div className="text-[10px] text-blue-600 font-semibold">{o.orderStatus}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No orders recorded yet.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
