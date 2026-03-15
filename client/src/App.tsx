import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './config/api';
import { ThemeProvider } from './context/ThemeContext';

// Components
import MainLayout from './layouts/MainLayout';
import FocusLayout from './layouts/FocusLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminRoute from './components/AdminRoute';

// Pages
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProductListPage from './pages/admin/ProductListPage';
import AddProductPage from './pages/admin/AddProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import OrderListPage from './pages/admin/OrderListPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CheckoutPage from './pages/CheckoutPage';
import AddressBookPage from './pages/AddressBookPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import CustomerListPage from './pages/admin/CustomerListPage';
import AnalyticsDashboardPage from './pages/admin/AnalyticsDashboardPage';
import BillingPage from './pages/admin/BillingPage';
import ReportHubPage from './pages/admin/ReportHubPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="profile/addresses" element={<AddressBookPage />} />
              <Route path="order/:id" element={<OrderDetailsPage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
            </Route>

            {/* Focus Layout for Product Details */}
            <Route element={<FocusLayout />}>
              <Route path="products/:id" element={<ProductDetailPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AnalyticsDashboardPage />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/add" element={<AddProductPage />} />
                <Route path="products/:id/edit" element={<EditProductPage />} />
                <Route path="orders" element={<OrderListPage />} />
                <Route path="customers" element={<CustomerListPage />} />
                <Route path="analytics" element={<AnalyticsDashboardPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="reports" element={<ReportHubPage />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
