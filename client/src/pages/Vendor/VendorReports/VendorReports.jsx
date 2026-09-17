import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  Package,
  Layers,
  Sparkles,
  PieChart,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { VENDOR_CHARTS, VENDOR_METRICS, VENDOR_PRODUCTS } from '../../../data/vendorMockData';
import { useVendor } from '../../../context/VendorContext';
import './VendorReports.css';

export default function VendorReports() {
  const { products, showToast } = useVendor();
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('revenue');

  const maxRevenue = Math.max(...VENDOR_CHARTS.monthlyRevenue.map((d) => d.revenue));

  const handleExport = (format) => {
    showToast(`Performance analytics report exported as ${format.toUpperCase()}!`, 'success');
  };

  return (
    <div className="vendor-reports-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-heading">Store Analytics & Performance Reports</h1>
          <p className="page-sub-heading">
            Track revenue progression, equipment utilization rates, and client demand trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range picker */}
          <div className="v-select-wrap bg-white">
            <Calendar size={14} className="text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="v-select-elem"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days (Sep 2026)</option>
              <option value="90d">Last Quarter (Q2-Q3)</option>
              <option value="1y">Year to Date (FY 2026-27)</option>
            </select>
          </div>

          <button onClick={() => handleExport('csv')} className="btn-v-secondary">
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Performance KPI Cards */}
      <div className="reports-kpi-grid">
        <div className="v-stat-card">
          <span className="v-stat-title">Gross Rental GMV</span>
          <div className="v-stat-val text-navy">{VENDOR_METRICS.totalRevenue}</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight size={13} />
            <span>+18.4% growth vs previous quarter</span>
          </span>
        </div>

        <div className="v-stat-card">
          <span className="v-stat-title">Equipment Utilization Rate</span>
          <div className="v-stat-val text-emerald-600">84.2%</div>
          <span className="text-[11px] text-slate-500 font-medium">Average custody uptime</span>
        </div>

        <div className="v-stat-card">
          <span className="v-stat-title">On-Time Return Ratio</span>
          <div className="v-stat-val text-secondary-blue">99.4%</div>
          <span className="text-[11px] text-secondary-blue font-semibold">Zero damage incident rate</span>
        </div>

        <div className="v-stat-card">
          <span className="v-stat-title">Average Order Rental Value</span>
          <div className="v-stat-val text-primary-red">₹6,840</div>
          <span className="text-[11px] text-slate-500 font-medium">Per 3.5 days booking</span>
        </div>
      </div>

      {/* Trajectory & Breakdown Charts */}
      <div className="v-charts-grid">
        {/* Trajectory */}
        <div className="v-card-box">
          <div className="v-card-hdr">
            <div>
              <h3 className="v-card-title">Gross Revenue Trajectory</h3>
              <p className="v-card-sub">Monthly earnings and equipment reservation volume</p>
            </div>
            <span className="v-chart-badge">Active Period: 6 Months</span>
          </div>

          <div className="v-bar-chart-container">
            {VENDOR_CHARTS.monthlyRevenue.map((d) => {
              const heightPct = Math.round((d.revenue / maxRevenue) * 100);
              const isCurrent = d.month === 'Sep';
              return (
                <div key={d.month} className="v-bar-col">
                  <div className="v-bar-tooltip">
                    ₹{d.revenue.toLocaleString('en-IN')}
                  </div>
                  <div className="v-bar-track">
                    <div
                      className={`v-bar-fill ${isCurrent ? 'v-bar-current' : ''}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className={`v-bar-month ${isCurrent ? 'v-month-bold' : ''}`}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Contribution */}
        <div className="v-card-box">
          <div className="v-card-hdr">
            <div>
              <h3 className="v-card-title">Category Demand Distribution</h3>
              <p className="v-card-sub">Rental revenue share by equipment class</p>
            </div>
          </div>

          <div className="v-cat-breakdown-list">
            {VENDOR_CHARTS.categoryShare.map((cat, idx) => (
              <div key={idx} className="v-cat-item">
                <div className="v-cat-top-row">
                  <span className="v-cat-name font-semibold text-navy text-xs">{cat.category}</span>
                  <span className="v-cat-val font-bold text-xs text-primary-red">{cat.amount}</span>
                </div>
                <div className="v-cat-bar-bg">
                  <div
                    className="v-cat-bar-fill"
                    style={{
                      width: `${cat.share}%`,
                      backgroundColor: idx === 0 ? '#E63946' : idx === 1 ? '#457B9D' : idx === 2 ? '#1D3557' : '#A8DADC'
                    }}
                  />
                </div>
                <div className="v-cat-sub-share">{cat.share}% total rental share</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Equipment Models */}
      <div className="v-card-box p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="v-card-title">Top Revenue-Generating Equipment</h3>
            <p className="v-card-sub">Ranked by lifetime bookings and rental earnings</p>
          </div>
        </div>

        <div className="v-table-responsive">
          <table className="v-table">
            <thead>
              <tr>
                <th>Equipment Name & SKU</th>
                <th>Category</th>
                <th>Daily Rate</th>
                <th>Total Bookings</th>
                <th>Revenue Generated</th>
                <th>Health Rating</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((p) => (
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
                    <span className="font-bold text-navy text-xs">₹{p.pricePerDay}/day</span>
                  </td>
                  <td>
                    <span className="font-bold text-secondary-blue text-xs">{p.totalRentals} times</span>
                  </td>
                  <td>
                    <span className="font-extrabold text-emerald-600 text-sm">
                      ₹{p.revenueGenerated?.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>99.8% QC Score</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
