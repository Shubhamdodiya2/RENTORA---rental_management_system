import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';

// Global Context Providers
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { AdminProvider } from './context/AdminContext';

// Navigation & Layout Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import CustomerLayout from './components/CustomerLayout/CustomerLayout';
import VendorLayout from './components/VendorLayout/VendorLayout';
import SuperAdminLayout from './components/AdminLayout/SuperAdminLayout';

// Public & Booking Pages
import Home from './pages/Home/Home';
import Explore from './pages/Explore/Explore';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Booking from './pages/Booking/Booking';
import Checkout from './pages/Booking/Checkout';
import BookingSuccess from './pages/Booking/BookingSuccess';

// Customer Dashboard Pages
import DashboardOverview from './pages/Customer/DashboardOverview/DashboardOverview';
import MyRentals from './pages/Customer/MyRentals/MyRentals';
import MyBookings from './pages/Customer/MyBookings/MyBookings';
import Quotations from './pages/Customer/Quotations/Quotations';
import Contracts from './pages/Customer/Contracts/Contracts';
import Invoices from './pages/Customer/Invoices/Invoices';
import Payments from './pages/Customer/Payments/Payments';
import PickupReturns from './pages/Customer/PickupReturns/PickupReturns';
import Notifications from './pages/Customer/Notifications/Notifications';
import Profile from './pages/Customer/Profile/Profile';
import Settings from './pages/Customer/Settings/Settings';

// Vendor Dashboard Pages
import VendorOverview from './pages/Vendor/VendorOverview/VendorOverview';
import VendorProducts from './pages/Vendor/VendorProducts/VendorProducts';
import AddEditProduct from './pages/Vendor/VendorProducts/AddEditProduct';
import VendorInventory from './pages/Vendor/VendorInventory/VendorInventory';
import VendorPricing from './pages/Vendor/VendorPricing/VendorPricing';
import VendorOrders from './pages/Vendor/VendorOrders/VendorOrders';
import VendorQuotations from './pages/Vendor/VendorQuotations/VendorQuotations';
import VendorPickupReturns from './pages/Vendor/VendorPickupReturns/VendorPickupReturns';
import VendorCustomers from './pages/Vendor/VendorCustomers/VendorCustomers';
import VendorInvoices from './pages/Vendor/VendorInvoices/VendorInvoices';
import VendorPayments from './pages/Vendor/VendorPayments/VendorPayments';
import VendorReports from './pages/Vendor/VendorReports/VendorReports';
import VendorNotifications from './pages/Vendor/VendorNotifications/VendorNotifications';
import VendorSettings from './pages/Vendor/VendorSettings/VendorSettings';

// Super Admin Dashboard Pages
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard';
import CustomerList from './pages/Admin/Customers/CustomerList';
import CustomerDetails from './pages/Admin/Customers/CustomerDetails';
import VendorList from './pages/Admin/Vendors/VendorList';
import VendorDetails from './pages/Admin/Vendors/VendorDetails';
import ProductList from './pages/Admin/Products/ProductList';
import CategoryManager from './pages/Admin/Categories/CategoryManager';
import OrderList from './pages/Admin/Orders/OrderList';
import OrderDetails from './pages/Admin/Orders/OrderDetails';
import PaymentManager from './pages/Admin/Payments/PaymentManager';
import PickupsReturnsManager from './pages/Admin/PickupsReturns/PickupsReturnsManager';
import ComplaintsManager from './pages/Admin/Complaints/ComplaintsManager';
import ReportsAnalytics from './pages/Admin/Reports/ReportsAnalytics';
import NotificationManager from './pages/Admin/Notifications/NotificationManager';
import AdminUsersManager from './pages/Admin/AdminUsers/AdminUsersManager';
import PlatformSettings from './pages/Admin/Settings/PlatformSettings';
import ActivityLogs from './pages/Admin/ActivityLogs/ActivityLogs';

// Helper component to auto-scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Public Marketplace Layout Wrapper
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F1FAEE] text-[#1D3557] font-sans antialiased selection:bg-[#E63946] selection:text-white">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <AdminProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* 1. Public Marketplace & Auth Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Explore />} />
                <Route path="/products/:productId" element={<ProductDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/booking/success" element={<BookingSuccess />} />
              </Route>

              {/* 2. Customer SaaS Portal Routes */}
              <Route path="/customer" element={<CustomerLayout />}>
                <Route index element={<Navigate to="/customer/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardOverview />} />
                <Route path="rentals" element={<MyRentals />} />
                <Route path="bookings" element={<MyBookings />} />
                <Route path="quotations" element={<Quotations />} />
                <Route path="contracts" element={<Contracts />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="payments" element={<Payments />} />
                <Route path="pickup-returns" element={<PickupReturns />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* 3. Vendor SaaS Portal Routes */}
              <Route path="/vendor" element={<VendorLayout />}>
                <Route index element={<Navigate to="/vendor/dashboard" replace />} />
                <Route path="dashboard" element={<VendorOverview />} />
                <Route path="products" element={<VendorProducts />} />
                <Route path="products/add" element={<AddEditProduct />} />
                <Route path="products/:id/edit" element={<AddEditProduct />} />
                <Route path="inventory" element={<VendorInventory />} />
                <Route path="pricing" element={<VendorPricing />} />
                <Route path="orders" element={<VendorOrders />} />
                <Route path="orders/:id" element={<VendorOrders />} />
                <Route path="quotations" element={<VendorQuotations />} />
                <Route path="quotations/create" element={<VendorQuotations />} />
                <Route path="pickups-returns" element={<VendorPickupReturns />} />
                <Route path="customers" element={<VendorCustomers />} />
                <Route path="customers/:id" element={<VendorCustomers />} />
                <Route path="invoices" element={<VendorInvoices />} />
                <Route path="payments" element={<VendorPayments />} />
                <Route path="reports" element={<VendorReports />} />
                <Route path="notifications" element={<VendorNotifications />} />
                <Route path="settings" element={<VendorSettings />} />
              </Route>

              {/* 4. Super Admin SaaS Portal Routes */}
              <Route path="/admin" element={<SuperAdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="customers" element={<CustomerList />} />
                <Route path="customers/:id" element={<CustomerDetails />} />
                <Route path="vendors" element={<VendorList />} />
                <Route path="vendors/:id" element={<VendorDetails />} />
                <Route path="products" element={<ProductList />} />
                <Route path="categories" element={<CategoryManager />} />
                <Route path="orders" element={<OrderList />} />
                <Route path="orders/:id" element={<OrderDetails />} />
                <Route path="payments" element={<PaymentManager />} />
                <Route path="pickups-returns" element={<PickupsReturnsManager />} />
                <Route path="complaints" element={<ComplaintsManager />} />
                <Route path="reports" element={<ReportsAnalytics />} />
                <Route path="notifications" element={<NotificationManager />} />
                <Route path="admin-users" element={<AdminUsersManager />} />
                <Route path="settings" element={<PlatformSettings />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AdminProvider>
      </BookingProvider>
    </AuthProvider>
  );
}
