import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ScrollToTop from "../components/ui/ScrollToTop";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ToastProvider } from "../contexts/ToastContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import ServicesPage from "../pages/public/ServicesPage";
import PricingPage from "../pages/public/PricingPage";
import TrackPage from "../pages/public/TrackPage";
import ContactPage from "../pages/public/ContactPage";
import LoginPage from "../pages/Auth/LoginPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/Auth/ResetPasswordPage";
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
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/booking" element={<Navigate to="/login" replace />} />
                <Route path="/track" element={<TrackPage />} />
                <Route path="/about" element={<Navigate to="/login" replace />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/dashboard" element={<Navigate to="/login" replace />} />
                <Route path="/notifications" element={<Navigate to="/login" replace />} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
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
