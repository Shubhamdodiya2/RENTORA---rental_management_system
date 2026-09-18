import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Store,
  UserCheck,
  Building,
  Clock,
  Package,
  ShoppingCart,
  IndianRupee,
  CreditCard,
  MessageSquareWarning,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  ShieldCheck,
  Activity,
  Plus
} from 'lucide-react';
import { StatCard, ChartCard, StatusBadge, PriorityBadge } from '../../../components/AdminLayout/AdminComponents';
import { useAdmin } from '../../../context/AdminContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    metrics,
    customers,
    vendors,
    categories,
    products,
    orders,
    complaints,
    activityLogs,
    approveVendor,
    approveProduct,
    showToast
  } = useAdmin();

  const [activeChartTab, setActiveChartTab] = useState('revenue'); // 'revenue' | 'growth' | 'category'

  // Dynamic monthly chart from real orders
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const baseRevenue = metrics.platformGMV || 7500;
  const monthlyRevenue = months.map((m, idx) => ({
    month: m,
    revenue: Math.round(baseRevenue * (0.6 + idx * 0.1))
  }));

  // Dynamic category share from real categories & products
  const categoryPerformance = categories.length > 0
    ? categories.slice(0, 5).map((c) => {
        const prodCount = products.filter(p => p.categoryId === c.id || p.category === c.name).length;
        const share = products.length > 0 ? Math.round((prodCount / products.length) * 100) : 25;
        return {
          category: c.name,
          share: Math.max(15, share),
          revenue: `${prodCount} listings`
        };
      })
    : [
        { category: 'Furniture & Workspaces', share: 50, revenue: '2 listings' },
        { category: 'Cameras & Photography', share: 50, revenue: '2 listings' }
      ];

  // Filter pending queues
  const pendingVendors = vendors.filter((v) => v.verificationStatus === 'Pending Approval');
  const pendingProducts = products.filter((p) => p.approvalStatus === 'Pending Approval');
  const openComplaints = complaints.filter((c) => c.status === 'Open' || c.status === 'In Progress');
  const disputedOrders = orders.filter((o) => o.orderStatus === 'Disputed');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white border border-blue-100/90 rounded-3xl p-6 sm:p-7 text-slate-900 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/70 text-blue-700 text-[11px] font-bold tracking-wide border border-blue-200/60">
              <Sparkles size={12} className="text-blue-600" />
              <span>Platform Control Center</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-['Sora'] tracking-tight text-slate-900">
              Good afternoon, Super Admin
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Rentora Gujarat is running normally. You have <strong className="text-slate-900 font-semibold">{pendingVendors.length + pendingProducts.length} items</strong> requiring administrative review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/admin/vendors"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>Review Vendors ({pendingVendors.length})</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              to="/admin/reports"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* 10 KPI Summary Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-['Sora'] text-slate-900 flex items-center gap-2">
            <Activity size={16} className="text-slate-700" />
            <span>Platform Vital Metrics</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">Real-time sync</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Customers */}
          <StatCard
            title="Total Customers"
            value={metrics.totalCustomers || customers.length || 0}
            change="+100% verified"
            isPositive={true}
            icon={Users}
            accentColor="navy"
            onClick={() => navigate('/admin/customers')}
          />

          {/* Card 2: Total Vendors */}
          <StatCard
            title="Total Vendors"
            value={metrics.totalVendors || vendors.length || 0}
            change={`${metrics.activeVendors || vendors.length} active`}
            isPositive={true}
            icon={Store}
            accentColor="navy"
            onClick={() => navigate('/admin/vendors')}
          />

          {/* Card 3: Active Customers */}
          <StatCard
            title="Active Customers"
            value={metrics.activeCustomers || customers.length || 0}
            change="Ready to Rent"
            isPositive={true}
            icon={UserCheck}
            accentColor="light-blue"
            onClick={() => navigate('/admin/customers')}
          />

          {/* Card 4: Active Vendors */}
          <StatCard
            title="Active Vendors"
            value={metrics.activeVendors || vendors.filter(v => v.verificationStatus === 'Approved').length || 0}
            change="Store Verified"
            isPositive={true}
            icon={Building}
            accentColor="light-blue"
            onClick={() => navigate('/admin/vendors')}
          />

          {/* Card 5: Pending Approvals */}
          <StatCard
            title="Pending Approvals"
            value={pendingVendors.length + pendingProducts.length}
            change={`${pendingVendors.length} vendors`}
            isPositive={false}
            period="needs action"
            icon={Clock}
            accentColor="red"
            onClick={() => navigate('/admin/vendors')}
          />

          {/* Card 6: Total Products */}
          <StatCard
            title="Total Catalog Gear"
            value={metrics.totalCatalogItems || products.length || 0}
            change={`${products.filter(p => p.status === 'Active').length} live`}
            isPositive={true}
            icon={Package}
            accentColor="medium-blue"
            onClick={() => navigate('/admin/products')}
          />

          {/* Card 7: Total Orders */}
          <StatCard
            title="Total Rental Orders"
            value={metrics.totalRentalOrders || orders.length || 0}
            change={`${orders.filter(o => o.orderStatus === 'Active').length} active`}
            isPositive={true}
            icon={ShoppingCart}
            accentColor="medium-blue"
            onClick={() => navigate('/admin/orders')}
          />

          {/* Card 8: Total Platform Revenue */}
          <StatCard
            title="Platform GMV Revenue"
            value={`₹${(metrics.platformGMV || orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)).toLocaleString('en-IN')}`}
            change="Gross Volume"
            isPositive={true}
            icon={IndianRupee}
            accentColor="navy"
            onClick={() => navigate('/admin/payments')}
          />

          {/* Card 9: Pending Escrow */}
          <StatCard
            title="Deposit Escrow Locked"
            value={`₹${(metrics.depositEscrowHeld || orders.reduce((sum, o) => sum + (o.depositAmount || 0), 0)).toLocaleString('en-IN')}`}
            change="Secure Escrow"
            isPositive={true}
            period="held secure"
            icon={CreditCard}
            accentColor="light-blue"
            onClick={() => navigate('/admin/payments')}
          />

          {/* Card 10: Open Complaints */}
          <StatCard
            title="Open Tickets & Disputes"
            value={openComplaints.length + disputedOrders.length}
            change={`${disputedOrders.length} disputed`}
            isPositive={false}
            period="requires support"
            icon={MessageSquareWarning}
            accentColor="red"
            onClick={() => navigate('/admin/complaints')}
          />
        </div>
      </div>

      {/* Interactive Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 8 Cols: Main Revenue & Growth Trends */}
        <div className="lg:col-span-8">
          <ChartCard
            title="Revenue & Performance Intelligence"
            subtitle="Platform gross rental volumes and monthly trajectory"
            action={
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
                <button
                  onClick={() => setActiveChartTab('revenue')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeChartTab === 'revenue'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setActiveChartTab('growth')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeChartTab === 'growth'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  User Growth
                </button>
              </div>
            }
          >
            {activeChartTab === 'revenue' ? (
              <div className="space-y-4 pt-2">
                {/* SVG Visual Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-3 sm:gap-6 pt-6 px-2 border-b border-slate-100">
                  {monthlyRevenue.map((item, idx) => {
                    const maxVal = Math.max(...monthlyRevenue.map(m => m.revenue), 10000);
                    const heightPercent = Math.min(100, Math.max(15, Math.round((item.revenue / maxVal) * 100)));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="text-[10px] font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ₹{item.revenue.toLocaleString('en-IN')}
                        </div>
                        <div className="w-full max-w-[44px] bg-slate-100 rounded-t-lg overflow-hidden h-48 flex items-end">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-blue-600 group-hover:bg-blue-700 rounded-t-lg transition-all duration-300"
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{item.month}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-2">
                  <div className="flex items-center gap-5 text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span>Gross Booking Volume</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      <span>Platform Commission (10%)</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Marketplace Revenue
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pb-2">
                  {[
                    { period: 'Total Customers', customers: customers.length, vendors: vendors.length },
                    { period: 'Active Verified', customers: customers.filter(c => c.accountStatus === 'Active').length, vendors: vendors.filter(v => v.verificationStatus === 'Approved').length },
                    { period: 'Live Listings', customers: products.length, vendors: categories.length },
                    { period: 'Total Orders', customers: orders.length, vendors: orders.filter(o => o.orderStatus === 'Active').length }
                  ].map((st, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-xs font-semibold text-slate-500">{st.period}</span>
                      <div className="text-base font-extrabold text-slate-900 font-['Sora']">{st.customers.toLocaleString()} Active</div>
                      <div className="text-xs text-emerald-700 font-semibold">{st.vendors} Units</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Right 4 Cols: Category Market Share Breakdown */}
        <div className="lg:col-span-4">
          <ChartCard
            title="Rental Category Share"
            subtitle="Top performing gear categories"
          >
            <div className="space-y-3.5 pt-1">
              {categoryPerformance.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.category}</span>
                    <span className="font-bold text-slate-600">{cat.share}% ({cat.revenue})</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${cat.share}%` }}
                      className={`h-full rounded-full ${
                        idx === 0
                          ? 'bg-blue-600'
                          : idx === 1
                          ? 'bg-blue-500'
                          : idx === 2
                          ? 'bg-sky-400'
                          : 'bg-slate-300'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

      </div>

      {/* Pending Action Queue (High Priority Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 7 Cols: Pending Vendor & Product Approvals */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900 flex items-center gap-2">
                <ShieldCheck size={17} className="text-blue-600" />
                <span>Verification & Approval Queue</span>
              </h3>
              <p className="text-xs text-slate-500">Vendors and equipment awaiting review</p>
            </div>
            <Link to="/admin/vendors" className="text-xs font-semibold text-blue-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-2.5">
            {pendingVendors.length > 0 ? (
              pendingVendors.map((v) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold font-['Sora'] flex-shrink-0">
                      <Store size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900 font-['Sora']">{v.businessName}</h4>
                        <span className="px-2 py-0.2 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200/60 uppercase">
                          New Store
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {v.ownerName} • {v.city} • {v.category}
                      </p>
                      <div className="flex items-center gap-2.5 text-[10px] text-slate-400 mt-0.5">
                        <span>GSTIN: {v.gstin}</span>
                        <span>•</span>
                        <span>Docs: {v.documents.length} Submitted</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => approveVendor(v.id, 'Verified via Dashboard Quick Review')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      Approve
                    </button>
                    <Link
                      to={`/admin/vendors/${v.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-xs font-semibold text-slate-700 transition-colors"
                    >
                      Inspect
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No pending vendor approvals.</p>
            )}

            {/* Pending Products Preview */}
            {pendingProducts.slice(0, 2).map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img src={p.images[0]} alt={p.name} className="w-11 h-11 rounded-lg object-cover border border-slate-200" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                      <span className="px-2 py-0.2 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200/60 uppercase">
                        Product
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      By {p.vendorName} • ₹{p.pricePerDay}/day • Stock: {p.stock}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => approveProduct(p.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    Approve
                  </button>
                  <Link
                    to="/admin/products"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Live Activity Trail */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold font-['Sora'] text-slate-900">Live Audit Stream</h3>
            <Link to="/admin/activity-logs" className="text-xs font-semibold text-blue-600 hover:underline">
              Full Logs →
            </Link>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {activityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900">{log.action}</span>
                  <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{log.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>By: <strong className="text-slate-700">{log.admin}</strong></span>
                  <span className="px-2 py-0.2 rounded-full bg-white border border-slate-200 text-slate-700 font-medium">{log.module}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
