import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "../components/ui/ScrollToTop";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ToastProvider } from "../contexts/ToastContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import HomePage from "../pages/public/HomePage";
import ServicesPage from "../pages/public/ServicesPage";
import PricingPage from "../pages/public/PricingPage";
import BookingPage from "../pages/public/BookingPage";
import TrackPage from "../pages/public/TrackPage";
import AboutPage from "../pages/public/AboutPage";
import ContactPage from "../pages/public/ContactPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import NotificationsPage from "../pages/customer/NotificationsPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminCustomers from "../pages/admin/AdminCustomers";
import AdminPayments from "../pages/admin/AdminPayments";
import AdminPricing from "../pages/admin/AdminPricing";
import AdminReports from "../pages/admin/AdminReports";

const AppRoutes = () => (
  <BrowserRouter>
    <ScrollToTop />
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/track" element={<TrackPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="pricing" element={<AdminPricing />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default AppRoutes;
